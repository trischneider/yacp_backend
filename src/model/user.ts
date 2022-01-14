import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export class User extends Model {
    public id!: number;
    public username!: string;
    public password!: string;
    public email!: string;
    public first_name!: string;
    public last_name!: string;
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
    }, {sequelize});
}