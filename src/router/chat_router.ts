import BaseRouter, { CustomRequest, requireAuthorization, requireKeysOfType, typeCheck, minLength, numberArray, boolean, num } from "./base_router";
import {Express, Response } from "express";
import { Chat } from "../model/chat";
import { ChatUser } from "../model/chat_user";
import { Message } from "../model/message";
import { Op, Sequelize } from "sequelize";
import { QueryTypes } from "sequelize";
import { User } from "../model/user";
import { where } from "sequelize";

/*
* Query string getting chats
*/

const verifyExistence = `SELECT * FROM
 (SELECT c.chat_id  FROM chatusers c INNER JOIN chatusers ca ON c.chat_id = ca.chat_id WHERE c.user_id = ? AND ca.user_id = ?) as result 
 INNER JOIN Chats as chat ON chat.id = result.chat_id WHERE is_group = 0;`;

 const additionalUsernameQuery = `if(is_group, name, (
     SELECT concat(first_name, " ", last_name) FROM Users u INNER JOIN chatusers c
    ON c.user_id = u.id WHERE c.chat_id = Chat.id AND u.id != chatusers.user_id))`;

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
            admin_user_ids: typeCheck(numberArray()),
        }), this.createChat);
        this.app.get("/api/chat", requireAuthorization, this.getChats);
        this.app.delete("/api/chat", requireAuthorization, requireKeysOfType({
            chat_id: typeCheck(num())
        }), this.deleteChat);
    }

    private async createChat(req: CustomRequest<{}, {}, {user_ids: number[], admin_user_ids: number[], name: string}>, res: Response) {
        if(req.body.user_ids.length === 0)
            return res.status(400).send("No users provided");
        if(req.body.user_ids.includes(req.user.id))
            return res.status(400).send("You cannot add yourself to a chat");

        const chatusers = req.body.user_ids.map((userId) => ({user_id: userId, is_admin: req.body.admin_user_ids.includes(userId)}));


        if(chatusers.length === 1){
            const result = await this.sequelize.query(verifyExistence, {
                replacements: [req.user.id, chatusers[0].user_id],
                type: QueryTypes.SELECT
            });
            if(result.length > 0){
                return res.status(400).send("You are already in this chat");
            }
        }
        chatusers.push({user_id: req.user.id, is_admin: req.body.admin_user_ids.includes(req.user.id)});

        const chat = await Chat.create({
            is_group: req.body.user_ids.length > 1,
            chatusers: chatusers,
            name: req.body.name
        }, {
            include: [ChatUser]
        });
        if(chat)
            res.send({
                id: chat.id,
                name: chat.name,
                chatusers: chatusers
            });
        else
            res.status(500).send("Failed to create chat");
    }
    
    private async getChats(req: CustomRequest<{}, {}, {}>, res: Response) {
        const chats = await Chat.findAll({
            raw: true,
            include: {
                model: ChatUser,
                where: {
                    user_id: req.user.id
                },
            },
            attributes: {
                include: [
                    [Sequelize.literal(additionalUsernameQuery), 'chat_name']
                ]
            }
        }) as (Chat & {chat_name: string})[];
        const messages = await Message.findAll({
            where: {
                chat_id: {
                    [Op.in]: chats.map((chat) => chat.id)
                }
            },
            include: {
                model: User,
            },
            order: [["createdAt", "DESC"]],
        })
        const results = chats.map((chat) => {
            const lastMessage  = messages.find((message: Message) => message.chat_id === chat.id);
            const lastMessageUser = lastMessage && lastMessage.User && (lastMessage.User.first_name + " " + lastMessage.User.last_name);
            return {
                id: chat.id,
                name: chat.chat_name,
                last_message_date: lastMessage?.createdAt,
                last_message_user: lastMessageUser,
                last_message: lastMessage?.content,
                is_group: chat.is_group
            };
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
        res.sendStatus(201);
    }
    
}