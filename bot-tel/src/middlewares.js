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
        console.log("func :", validator);

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
};
