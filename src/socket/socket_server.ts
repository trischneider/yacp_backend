import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { User } from "../model/user";
import { verifyToken } from "../router/base_router";
import { Message } from "../model/message";
import { ChatUser } from "../model/chat_user";
import { Op } from "sequelize";


type CustomSocket = Socket & {user?: User};

/**
 * Class Handles the socket communication
 */
export class SocketServer {
    
    private io: Server;
    private connectedSockets: {[user_id: number]: CustomSocket} = {};

    constructor(server: HttpServer){
        this.socketConnected = this.socketConnected.bind(this);
        this.io = new Server(server, {
            cors: {
                origin: '*',
            },
        });
        this.io.use(this.authUser);
        this.io.on("connection", this.socketConnected);
    }

    /**
     * Sends notifications to in app users when a new message is received from a contact
     * @param writer 
     * @param message 
     * @param writerChatUser 
     */
    public async onNewMessage(writer: User, message: Message, writerChatUser: ChatUser){
        const chatUsers = await ChatUser.findAll({
            where: {
                chat_id: writerChatUser.chat_id,
            }
        });
        chatUsers.forEach(async (chatUser) => {
            const socket = this.connectedSockets[chatUser.user_id];
            if(socket){
                socket.emit("new_message", {
                    id: message.id,
                    content: message.content, 
                    timestamp: message.createdAt, 
                    is_sender: false,
                    user_id: writer.id,
                    full_name: writer.first_name + " " + writer.last_name,
                    chat_id: message.chat_id
                });
            } 
        });
    }

    /**
     * Requires a user to be authenticated before allowing the socket to connect
     * @param socket Socket with a user object attached
     * @param next Middleware callback
     * @returns nothing
     */
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