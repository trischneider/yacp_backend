import BaseRoute, {mailType, requireKeysOfType} from "./base_router";
import { Request, Response } from "express";


export class UserRouter extends BaseRoute {
    protected init(): void {
        this.app.put("/api/user", requireKeysOfType({test: "number"}),this.createUser);
    }
    private async createUser(req: Request, res: Response ){
        
    }
    
}