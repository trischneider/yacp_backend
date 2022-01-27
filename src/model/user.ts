import { DataTypes, HasManyGetAssociationsMixin, HasOneCreateAssociationMixin, Model, ModelStatic, Sequelize, StringDataType } from "sequelize";
import { ChatUser } from "./chat_user";
import { Message } from "./message";

export class User extends Model {
    declare id: string;
    declare username: string;
    declare password: string;
    declare email: string;
    declare first_name: string;
    declare last_name: string;
    declare token: string;
    declare refresh_token: string;

    declare getChatUsers: HasManyGetAssociationsMixin<ChatUser>; 
    declare createMessage: HasOneCreateAssociationMixin<Message>;
}
export function define(sequelize: Sequelize): ModelStatic<User>{
    return User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        refresh_token: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {sequelize});
}