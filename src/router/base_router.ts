import {Express, NextFunction, Request, Response} from "express";


export function requireKeysOfType(types: {[key: string]: ((value: string) => boolean) | string}){
    return (req: Request, res: Response, next: NextFunction) => {
        for(let key in types){
            if(!req.body[key]){
                return res.status(400).send(`Missing required key: ${key}`);
            }
            let type = types[key];
            if(typeof type === "function"){
                if(!type(req.body[key])){
                    return res.status(400).send(`Invalid value for key: ${key}`);
                }
            } else {
                console.log("check typeof");
                if(typeof req.body[key] !== types[key]){
                    return res.status(400).send(`${key} must be of type ${types[key]}`);
                }
            }
        }
        next();
    }
}
export default abstract class BaseRouter {
    protected app: Express;

    constructor(app: Express){
        this.app = app;
        this.init();
    }   
    protected abstract init(): void;
}

export function mailType(value: string): boolean{
    return false;
}