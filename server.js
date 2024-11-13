const TelegramBot = require("node-telegram-bot-api");

require("dotenv").config(); // add variable .env from process.env

const bot = new TelegramBot(process.env.TOKEN, { polling: true }); // create bot

const funcBot = require("./src/function");
const controller = require("./src/controller");
const middlewares = require("./src/middlewares");

funcBot.checkDB(); //DB in Created ?

bot.onText(
    "/start",
    async (msg) =>
        await middlewares.isBlock(
            bot,
            msg,
            () => {},
            middlewares.isAdmin,
            controller.userHandler,
            controller.adminHandler,
            funcBot.isBlockUser
        )
);

bot.onText(
    "/link",
    async (msg) => await middlewares.isAdmin(bot, msg, () => {}, funcBot.saveChannelLink)
);

bot.onText(
    "/mess",
    async (msg) => await middlewares.isAdmin(bot, msg, () => {}, controller.sendMessage)
);

bot.onText(
    "/pubMess",
    async (msg) => await middlewares.isAdmin(bot, msg, () => {}, controller.sendPublicMessage)
);

bot.onText(
    "/ban",
    async (msg) => await middlewares.isAdmin(bot, msg, () => {}, funcBot.addUserBlock)
);

bot.onText(
    "/unBan",
    async (msg) => await middlewares.isAdmin(bot, msg, () => {}, funcBot.deleteUserBlock)
);

bot.onText(
    "/list",
    async (msg) => await middlewares.isAdmin(bot, msg, () => {}, funcBot.getUsersBlock)
);

bot.on(
    "contact",
    async (msg) =>
        await middlewares.isBlock(
            bot,
            msg,
            () => {},
            controller.contactHandler,
            () => {},
            () => {},
            () => {}
        )
); // ذخیره شماره تلفن کاربر در userContacts

bot.onText(
    "/reqDel",
    async (msg) => await middlewares.isAdmin(bot, msg, () => {}, funcBot.deleteRequest)
);

bot.onText(
    "/delTick",
    async (msg) => await middlewares.isAdmin(bot, msg, () => {}, funcBot.deleteTicket)
);

// user commnd 👇

bot.onText(
    "/tick",
    async (msg) =>
        await middlewares.isBlock(
            bot,
            msg,
            () => {},
            middlewares.isLogin,
            funcBot.unLoginUser,
            controller.ticketHandler,
            () => {}
        )
);

bot.onText(
    "/bot",

    async (msg) =>
        await middlewares.isBlock(
            bot,
            msg,
            () => {},
            middlewares.isLogin,
            funcBot.unLoginUser,
            controller.botOrderHandler,
            () => {}
        )
);

bot.onText(
    "/site",
    async (msg) =>
        await middlewares.isBlock(
            bot,
            msg,
            () => {},
            middlewares.isLogin,
            funcBot.unLoginUser,
            controller.siteOrderHandler,
            () => {}
        )
);

bot.on("text", async (msg) => {
    let isBlock = await funcBot.isBlockUser(bot, msg);
    console.log(isBlock);
    if (!isBlock) {
        await middlewares.isLogin(bot, msg, funcBot.unLoginUser, controller.textHandler);
    }
});
