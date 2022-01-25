import { Express } from "express";
import { Sequelize } from "sequelize";
import { ChatRouter } from "./chat_router";
import { UserRouter } from "./user_router";

export function registerRoutes(app: Express, sequelize: Sequelize){
    new UserRouter(app);
    new ChatRouter(app);
}