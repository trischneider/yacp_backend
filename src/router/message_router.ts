import { Request, Response } from "express";
import sequelize from "sequelize";
import { Express } from "express";
import { Chat } from "../model/chat";
import { ChatUser } from "../model/chat_user";
import { Message } from "../model/message";
import BaseRouter, { CustomRequest, nonNull, num, requireAuthorization, requireKeysOfType, typeCheck } from "./base_router";
import { SocketServer } from "../socket/socket_server";


export class MessageRouter extends BaseRouter {

    private socketServer: SocketServer;

    constructor(app: Express, socketServer: SocketServer) {
        super(app);
        this.socketServer = socketServer;
    }

    protected init(): void {
        this.createMessage = this.createMessage.bind(this);
        this.app.put("/api/message", requireKeysOfType({
            chat_id: typeCheck(num()),
            content: typeCheck(nonNull())
        }), requireAuthorization, this.createMessage);
        this.app.get("/api/messages/:chat_id/:count/:from?", requireKeysOfType({
            chat_id: typeCheck(num()),
            count: typeCheck(num()),
        }, true), requireAuthorization,  this.getMessages);
    }

    private async createMessage(req: CustomRequest<{}, {}, {chat_id: number, content: string}>, res: Response) {
        const chatUser = await ChatUser.findOne({
            where: {
                chat_id: req.body.chat_id,
                user_id: req.user.id
            }
        })
        if(!chatUser){
            return res.status(401).send("You are not authorized to send messages to this chat");
        }
        const message = await req.user.createMessage({
            chat_id: req.body.chat_id,
            content: req.body.content
        });
        if(message){
            this.socketServer.onNewMessage(req.user ,message, chatUser);
            res.send(message);
        } else {
            res.status(500).send("Error creating message");
        }
    }

    private async getMessages(req: CustomRequest<{chat_id: number, count: number, from?: number}, {}, {}>, res: Response) {
        const messages = await Message.findAll({
            where: {
                chat_id: req.params.chat_id
            },
            attributes: {
                exclude: ["chat_id", "updatedAt", "id", "user_id"],
                include: [
                    [sequelize.literal("(SELECT username FROM Users WHERE id = " + req.user.id + ")"), "username"]
                ]
            },
            include: [{
                model: Chat,
                required: true,
                attributes: ["id"],
                include: [{
                    model: ChatUser,
                    required: true,
                    where: {
                        user_id: req.user.id
                    },
                    attributes: []
                }]
            }],
            order: [["createdAt", "DESC"]],
            limit: Number(req.params.count),
            offset: Number(req.params.from) || 0
        })
        if(messages){
            res.send(messages);
        } else {
            res.status(500).send("Error getting messages");
        }
    }
}