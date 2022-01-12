import Server from "./server";
import * as dotenv from "dotenv";
dotenv.config();

function start(){
    const server = new Server();
    server.listen();
}
start();