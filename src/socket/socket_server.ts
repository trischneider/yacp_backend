import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { User } from "../model/user";
import { verifyToken } from "../router/base_router";
import { Message } from "../model/message";
import { ChatUser } from "../model/chat_user";
import { Op } from "sequelize";


type CustomSocket = Socket & {user?: User};
export class SocketServer {
    
    private io: Server;
    private connectedSockets: {[user_id: number]: CustomSocket} = {};

    constructor(server: HttpServer){
        this.socketConnected = this.socketConnected.bind(this);
        this.io = new Server(server, {

        });
        this.io.use(this.authUser);
        this.io.on("connection", this.socketConnected);
    }

    public async onNewMessage(writer: User, message: Message, writerChatUser: ChatUser){
        const otherChatUsers = await ChatUser.findAll({
            where: {
                chat_id: writerChatUser.chat_id,
                user_id: {
                    [Op.not]: writer.id
                }
            }
        });
        otherChatUsers.forEach(async (chatUser) => {
            const socket = this.connectedSockets[chatUser.user_id];
            if(socket){
                socket.emit("new_message", {
                    messageContent: message.content, 
                    messageDate: message.createdAt, 
                    fromUserName: writer.username, 
                    fromUserId: writer.id,
                    chat_id: writerChatUser.chat_id
                });
            } 
        });
    }

    private async authUser(socket: CustomSocket, next: Function){
        if(socket.handshake.query && socket.handshake.query.token && socket.handshake.query.user_id){
            const token = socket.handshake.query.token;
            const user_id = socket.handshake.query.user_id;
            const user = await User.findOne({
                where: {
                    id: user_id,
                    token: token
                }
            });
            try {
                await verifyToken(user.token, user.username);
            } catch(e){
                return next(new Error("Token expired or invalid"));
            }
            socket.user = user;
            if(!user){
                return next(new Error("Invalid token or user_id"));
            }
            next();
        } else {
            next(new Error("Authentication error"));
        }
    }

    private socketConnected(socket: CustomSocket){
        if(socket.user)
            this.connectedSockets[socket.user.id] = socket;
        socket.on('disconnect', () => delete this.connectedSockets[socket.user.id]);
    }
}