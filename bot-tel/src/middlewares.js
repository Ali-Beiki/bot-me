async function isAdmin(bot, msg, userHandler, adminHandler) {
    try {
        if (msg.chat.id == process.env.ADMIN_ID) {
            await adminHandler(bot, msg);
        } else {
            await userHandler(bot, msg);
        }
    } catch (err) {
        console.error("Error in middlewares isAdmin:", err);
        return null;
    }
}

async function isLogin(bot, msg, unloginHandler, loginHandler) {
    try {
        if (msg.chat.id == process.env.ADMIN_ID) return await loginHandler(bot, msg);

        let funcBot = require("./function");
        if (!(await funcBot.findUser(msg.chat.id))) {
            await unloginHandler(bot, msg);
        } else {
            await loginHandler(bot, msg);
        }
    } catch (err) {
        console.error("Error in middlewares isLogin:", err);
        return null;
    }
}

async function isBlock(
    bot,
    msg,
    blockHandler,
    unBlockHandler,
    userHandler,
    adminHandler,
    validator
) {
    try {
        let isBlock = await validator(bot, msg);

        if (!isBlock) {
            await unBlockHandler(bot, msg, userHandler, adminHandler);
        } else {
            console.log("isBlock :", isBlock);
            return await blockHandler(bot, msg);
        }
    } catch (err) {
        console.error("Error in middlewares isBlock:", err);
        return null;
    }
}

module.exports = {
    isAdmin,
    isBlock,
    isLogin,
};
