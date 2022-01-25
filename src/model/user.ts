import { DataTypes, HasManyGetAssociationsMixin, Model, ModelStatic, Sequelize, StringDataType } from "sequelize";
import { ChatUser } from "./chat_user";

export class User extends Model {
    public id!: string;
    public username!: string;
    public password!: string;
    public email!: string;
    public first_name!: string;
    public last_name!: string;
    public token!: string;
    public refresh_token!: string;

    public getChatUsers!: HasManyGetAssociationsMixin<ChatUser>; 
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