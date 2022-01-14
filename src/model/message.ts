import { Model, Sequelize, ModelStatic, DataTypes } from "sequelize";

export class Message extends Model {
    public id!: number;
    public chat_id!: number;
    public user_id!: number;
    public content!: string;
    public created_at!: Date;
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