import { Express } from "express";
import { UserRouter } from "./user_router";

export function registerRoutes(app: Express){
    new UserRouter(app);
}