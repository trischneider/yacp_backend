import BaseRoute, {minLength, requireKeysOfType, mail, typeCheck, nonNull, CustomRequest, requireRefreshTokenAuthorization, num, requireAuthorization, username, firstName, lastName} from "./base_router";
import { Express, Request, Response } from "express";
import { Op } from "sequelize";
import { User } from "../model/user";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

const userCreationTypes =  {
    username: typeCheck(username()),
    password: typeCheck(minLength(6)),
    email: typeCheck(mail()),
    first_name: typeCheck(minLength(1)),
    last_name: typeCheck(minLength(1)),
}
interface userCreationBodyParams {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
}

export class UserRouter extends BaseRoute {
    constructor(app: Express){
        super(app);
    }
  
    protected init(): void {
        this.createUser = this.createUser.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.loginUser = this.loginUser.bind(this);

        this.app.put("/api/user", requireKeysOfType(userCreationTypes), this.createUser);
        this.app.post("/api/user/login", requireKeysOfType({
            username: typeCheck(username()),
            password: typeCheck(nonNull())
        }), this.loginUser);
        this.app.post("/api/user/refresh", requireRefreshTokenAuthorization, this.refreshToken);
        this.app.get("/api/user/search/:searchTerm", requireAuthorization, requireKeysOfType({
            searchTerm: typeCheck(minLength(1))
        }, true), this.searchUser)
    }

    private generateToken(username: string){
        const token = jwt.sign({username}, process.env.TOKEN_KEY, {expiresIn: "5h"});
        const refreshToken = jwt.sign({username}, process.env.REFRESH_TOKEN_KEY, {expiresIn: "30d"});
        return {token, refreshToken}
    }
    
    private async createUser(req: Request<{}, {}, userCreationBodyParams>, res: Response ){
        const hash = await bcrypt.hash(req.body.password, 10);
        const oldUser = await User.findOne({where: {
            [Op.or]: [
                {username: req.body.username},
                {email: req.body.email}
            ]
        }}); 
        if(oldUser){
            return res.status(400).send("User already exists");
        }
        const {token, refreshToken} = this.generateToken(req.body.username);

        const user = await User.create({
            username: req.body.username,
            password: hash,
            email: req.body.email,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            token,
            refresh_token: refreshToken
        });
        if(user)
            res.send({token, refresh_token: refreshToken, user_id: user.id});
        else
            res.status(400).send({error: "User already exists"});
    }
    private async loginUser(req: Request<{}, {}, {username: string; password: string;}>, res: Response){
        const user = await User.findOne({where: {username: req.body.username}});
        if(!user){
            return res.status(400).send("User does not exist");
        }
        const isValid = await bcrypt.compare(req.body.password, user.password);
        if(!isValid){
            return res.status(400).send("Invalid credentials");
        }
        const {token, refreshToken} = this.generateToken(user.username);
        await user.update({token, refresh_token: refreshToken});
        res.send({token, refresh_token: refreshToken, user_id: user.id});
    }

    private async refreshToken(req: CustomRequest<{}, {}, {refresh_token: string; user_id: number}>, res: Response){
        const user = await User.findOne({where: {id: req.body.user_id}});
        if(!user)
            return res.status(400).send("User does not exist");
        if(req.body.refresh_token !== user.refresh_token)
            return res.status(400).send("Invalid refresh token");
        const token = jwt.sign({username: user.username}, process.env.TOKEN_KEY, {expiresIn: "5h"});
        await user.update({token});
        res.send({token});
    }
    
    private async searchUser(req: CustomRequest<{searchTerm: string}, {}, {}>, res: Response){
        const users = await User.findAll({
            where: {
                username: {[Op.like]: `%${req.params.searchTerm}%`}
            },
            attributes: ["username", "id"],
            limit: 20,
        });
        res.send(users);
    }

}