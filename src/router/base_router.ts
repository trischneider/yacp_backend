import {Express, NextFunction, Request, Response} from "express";
import { User } from "../model/user";
import * as jwt from "jsonwebtoken";

export type typeCheckFunction = (value: string) => boolean;


export function requireKeysOfType(types: {[key: string]: TypeCheck}, param = false){
    return (req: Request, res: Response, next: NextFunction) => {
        for(let key in types){
            if(!param && !req.body[key] == undefined || param && !req.params[key] == undefined){
                return res.status(400).send(`Missing required key: ${key}`);
            }
            for(let typeCheck of types[key].checksArray){
                if(!param && !typeCheck(req.body[key]) || param && !typeCheck(req.params[key])){
                    return res.status(400).send(`Invalid value for key: ${key}`);
                }
            }
        }
        next();
    }
}
export async function requireAuthorization(req: CustomRequest<{}, {}, {user_id: number, token: string}>, res: Response, next: NextFunction){
    if(!req.body.user_id || !req.body.token){
        return res.status(400).send("Missing required key: user_id or token");
    }
    const user = await User.findOne({
        where: {
            id: req.body.user_id,
            token: req.body.token
        }
    })
    if(!user){
        return res.status(401).send("Invalid user_id or token");
    }
    try {
        await verifyToken(req.body.token, user.username);
    } catch(e){
        return res.status(401).send(e);
    }
   
    req.user = user;
    next();

}
export function verifyToken(token: string, username: string, isRefreshToken = false): Promise<void>{
    return new Promise((resolve, reject) => {
        jwt.verify(token, isRefreshToken ? process.env.REFRESH_TOKEN_KEY : process.env.TOKEN_KEY, (err, decoded) => {
            if(err){
                if(err instanceof jwt.TokenExpiredError){
                    reject("Token expired");
                    return;
                } else {
                    reject("Invalid token");
                    return;
                }     
            }
            if(decoded.username !== username){
                reject("Invalid token content");
                return;
            }
            resolve();
        });
    });
}

export type CustomRequest<A,B,C> = Request<A,B,C> & {user?: User};
export async function requireRefreshTokenAuthorization(req: CustomRequest<{}, {}, {user_id: number, refresh_token: string}>, res: Response, next: NextFunction){
    if(!req.body.user_id || !req.body.refresh_token){
        return res.status(400).send("Missing required key: user_id or refresh_token");
    }
    if(isNaN(req.body.user_id)){
        return res.status(400).send("Invalid user_id");
    }
    const user = await User.findOne({
        where: {
            id: req.body.user_id,
            refresh_token: req.body.refresh_token
        }
    })
    if(!user){
        return res.status(401).send("Invalid user_id or refresh_token");
    }
    try{
        await verifyToken(req.body.refresh_token, user.username, true);
    } catch(e) {
        return res.status(401).send(e);
    }
  
    req.user = user;
    next();
}
export default abstract class BaseRouter {
    protected app: Express;

    constructor(app: Express){
        this.app = app;
        this.init();
   
    }   
    protected abstract init(): void;
}

export class TypeCheck {
    private checks: typeCheckFunction[] = [];

    constructor(func: typeCheckFunction){
        this.add(func);
    }
    public add(typeCheck: typeCheckFunction){
        this.checks.push(typeCheck);
        return this;
    }
    get checksArray(){
        return this.checks;
    }
}
export function typeCheck(func: typeCheckFunction){
    return new TypeCheck(func);
}
export function nonNull(){
    return (value : string) => value !== undefined && value !== null;
}
export function minLength(length: number){
    return (value : string) => value && value.length >= length;
}
export function num(){
    return (value : string) => value && !isNaN(Number(value));
}
export function array(){
    return (value : string) => value && Array.isArray(value);
}
export function stringArray(){
    return (value : string) => value && Array.isArray(value) && value.every(v => typeof v === "string");
}
export function numberArray(){
    return (value : string) => value && Array.isArray(value) && value.every(v => typeof v === "number");
}
export function boolean(){
    return (value : string) =>  value != undefined && typeof value === "boolean";
}

const mailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export function mail(){
    return (value: string) => value && value.match(mailRegex) !== null;
}
