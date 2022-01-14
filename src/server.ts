import express, {Express} from 'express';
import { initModels } from './model';
import {Sequelize} from 'sequelize';
import { json } from 'body-parser';
import { registerRoutes } from './router';

export default class Server {
    private app: Express;

    constructor(){
        this.app = express();
        this.app.use(json());
        registerRoutes(this.app);
    }

    public async listen(){
        const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: 'mariadb',
        });
        try{
            await sequelize.authenticate();
            initModels(sequelize);
            this.app.listen(process.env.PORT, () => {
                console.log(`Listening on port ${process.env.PORT}...`);
            });
        } catch(e) {
            console.error("Unable to connect to database", e);
        }
       
    }
}