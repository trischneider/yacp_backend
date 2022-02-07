import express, {Express} from 'express';
import { initModels } from './model';
import {Sequelize} from 'sequelize';
import { json } from 'body-parser';
import { registerRoutes } from './router';
import { SocketServer } from './socket/socket_server';
import * as http from 'http';

export default class Server {
    private app: Express;
    private socketServer: SocketServer;
    private server: http.Server;

    constructor(){
        this.app = express();
        this.server = http.createServer(this.app);
        this.app.use(json());
    }

    /**
     * Creates the database connection, initializes the socketserver and the express server
     */
    public async listen(){
        const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: 'mariadb',
        });
        try{
            await sequelize.authenticate();
            initModels(sequelize);
            this.socketServer = new SocketServer(this.server);
            registerRoutes(this.app, sequelize, this.socketServer);
            this.server.listen(process.env.PORT, () => {
                console.log(`Listening on port ${process.env.PORT}...`);
            });
        } catch(e) {
            console.error("Unable to connect to database", e);
        }
       
    }
}