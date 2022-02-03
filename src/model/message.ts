import { Model, Sequelize, ModelStatic, DataTypes } from "sequelize";

export class Message extends Model {
    declare id: number;
    declare chat_id: number;
    declare user_id: number;
    declare content: string;
    declare createdAt: Date;
}
export function define(sequelize: Sequelize): ModelStatic<Message> {
    return Message.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {sequelize});
}