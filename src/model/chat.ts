import { Model, Sequelize, ModelStatic, DataTypes } from "sequelize";


export class Chat extends Model {
    declare id: number;
    declare name: string;
    declare createdAt: Date;
}
export function define(sequelize: Sequelize): ModelStatic<Chat> {
    return Chat.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: DataTypes.STRING,
    }, {sequelize})
} 