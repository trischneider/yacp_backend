import { Sequelize } from 'sequelize/dist';
import * as Chat from './chat';
import * as ChatUser from './chat_user';
import * as Message from './message';
import * as User from './user';


/**
 * Function to init the database models and associate them
 * @param sequelize Sequelize instance
 */
export function initModels(sequelize: Sequelize){
    const chat = Chat.define(sequelize);
    const chatUser = ChatUser.define(sequelize);
    const message = Message.define(sequelize);
    const user = User.define(sequelize);

    chat.hasMany(message, {foreignKey: 'chat_id'});
    message.belongsTo(chat, {foreignKey: 'chat_id'});

    user.hasMany(chatUser, {foreignKey: 'user_id'});
    chatUser.belongsTo(user, {foreignKey: 'user_id'});

    chat.hasMany(chatUser, {foreignKey: 'chat_id'});
    chatUser.belongsTo(chat, {foreignKey: 'chat_id'});

    user.hasMany(message, {foreignKey: 'user_id'});
    message.belongsTo(user, {foreignKey: 'user_id'});

    sequelize.sync().then(() => {
        Chat.Chat.findOrCreate({
            where: {
                id: 1,
            },
            defaults: {
                id: 1,
                name: "General",
            }
        })
        console.log("successfully connected to database")
    })


}