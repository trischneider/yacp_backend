import BaseRouter, { CustomRequest, requireAuthorization, requireKeysOfType, typeCheck, minLength, numberArray, boolean, num } from "./base_router";
import {Express, Response } from "express";
import { Chat } from "../model/chat";
import { ChatUser } from "../model/chat_user";
import { Sequelize } from "sequelize";
import { QueryTypes } from "sequelize";

/*
* Query string getting chats
*/
const getQuery = `SELECT id, name, last_message_date, last_message_user, last_message FROM Chats AS Chat INNER JOIN chatusers AS ChatUser ON Chat.id = ChatUser.chat_id LEFT JOIN 
    (SELECT content AS last_message, 
        (SELECT username FROM Users WHERE id = LMessage.user_id) AS last_message_user, updatedAt as last_message_date, chat_id FROM Messages AS LMessage ORDER BY createdAt DESC LIMIT 1) 
AS Message ON Message.chat_id = ChatUser.chat_id WHERE ChatUser.user_id = ?;
`
export class ChatRouter extends BaseRouter {

    private sequelize: Sequelize;

    constructor(app: Express, sequelize: Sequelize) {
        super(app);
        this.sequelize = sequelize;
    }

    protected init(): void {
        this.createChat = this.createChat.bind(this);
        this.getChats = this.getChats.bind(this);

        this.app.put("/api/chat", requireAuthorization, requireKeysOfType({
            user_ids: typeCheck(numberArray()),
            is_group: typeCheck(boolean()),
            admin_user_ids: typeCheck(numberArray()),
            name: typeCheck(minLength(2)),
        }), this.createChat);
        this.app.get("/api/chat", requireAuthorization, this.getChats);
        this.app.delete("/api/chat", requireAuthorization, requireKeysOfType({
            chat_id: typeCheck(num())
        }), this.deleteChat);
    }

    private async createChat(req: CustomRequest<{}, {}, {user_ids: number[], is_group: number, admin_user_ids: number[], name: string}>, res: Response) {
        if(req.body.user_ids.length === 0)
            return res.status(400).send("No users provided");
        if(req.body.is_group && (req.body.admin_user_ids.length !== 0 || req.body.user_ids.length > 1))
            return res.status(400).send("Group chats must have no admin users and only one user");
        if(req.body.user_ids.includes(req.user.id))
            return res.status(400).send("You cannot add yourself to a chat");

        const chatusers = req.body.user_ids.map((userId) => ({user_id: userId, is_admin: req.body.admin_user_ids.includes(userId)}));
        chatusers.push({user_id: req.user.id, is_admin: req.body.admin_user_ids.includes(req.user.id)});
        const chat = await Chat.create({
            name: req.body.name,
            chatusers: chatusers
        }, {
            include: [ChatUser]
        });
        if(chat)
            res.send(chat);
        else
            res.status(500).send("Failed to create chat");
    }
    
    private async getChats(req: CustomRequest<{}, {}, {}>, res: Response) {
        const results = await this.sequelize.query(getQuery, {
            replacements: [req.user.id],
            type: QueryTypes.SELECT
        });
        res.send(results);
    }
    private async deleteChat(req: CustomRequest<{}, {}, {chat_id: number}>, res: Response) {
        const chatUser = await ChatUser.findOne({
            where: {
                chat_id: req.body.chat_id,
                user_id: req.user.id
            }
        });
        if(!chatUser)
            return res.status(400).send("You are not a member of this chat");
        await chatUser.destroy();
        res.send("Successfully deleted chat");
    }
    
}