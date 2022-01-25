import { Model, Sequelize, ModelStatic, DataTypes, HasManyGetAssociationsMixin } from "sequelize";
import { Chat } from "./chat";

export class ChatUser extends Model {
    declare chat_id: number;
    declare user_id: number;
    declare is_admin: boolean;

    declare getChats: HasManyGetAssociationsMixin<Chat>;
}

export function define(sequelize: Sequelize): ModelStatic<ChatUser> {
    return ChatUser.init({
        chat_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        is_admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {sequelize, modelName: 'chatuser'});
}