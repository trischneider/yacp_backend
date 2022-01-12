import express, {Express} from 'express';

export default class Server {
    private app: Express;

    constructor(){
        this.app = express();
    }

    public listen(){
        this.app.listen(process.env.PORT, () => {
            console.log(`Listening on port ${process.env.PORT}...`);
        });
    }
}