import { Model, Sequelize, ModelStatic, DataTypes } from "sequelize";
import { ChatUser } from "./chat_user";


export class Chat extends Model {
    declare id: number;
    declare name: string;
    declare is_group: boolean;
    declare createdAt: Date;
    declare chatusers: ChatUser[];
}
export function define(sequelize: Sequelize): ModelStatic<Chat> {
    return Chat.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        is_group: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        name: DataTypes.STRING,
    }, {sequelize})
} 