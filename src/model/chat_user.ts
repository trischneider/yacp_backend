import { Model, Sequelize, ModelStatic, DataTypes } from "sequelize";

export class ChatUser extends Model {
    public chat_id!: number;
    public user_id!: number;
    public is_admin!: boolean;
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
    }, {sequelize});
}