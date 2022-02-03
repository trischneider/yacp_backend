import { Express } from "express";
import { Sequelize } from "sequelize";
import { SocketServer } from "../socket/socket_server";
import { ChatRouter } from "./chat_router";
import { MessageRouter } from "./message_router";
import { UserRouter } from "./user_router";

export function registerRoutes(app: Express, sequelize: Sequelize, socketServer: SocketServer) {
    new UserRouter(app);
    new ChatRouter(app, sequelize);
    new MessageRouter(app, socketServer);
}