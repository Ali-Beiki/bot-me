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
    async (msg) =>
        await middlewares.isBlock(
            bot,
            msg,
            () => {},
            middlewares.isAdmin(bot, msg, () => {}, funcBot.saveChannelLink),
            () => {},
            funcBot.saveChannelLink
        )
);

bot.onText("/mess", (msg) => middlewares.isAdmin(bot, msg, () => {}, controller.sendMessage));

bot.onText("/pubMess", (msg) =>
    middlewares.isAdmin(bot, msg, () => {}, controller.sendPublicMessage)
);

bot.onText("/ban", (msg) => middlewares.isAdmin(bot, msg, () => {}, funcBot.addUserBlock));
bot.onText("/unBan", (msg) => middlewares.isAdmin(bot, msg, () => {}, funcBot.deleteUserBlock));
bot.onText("/list", (msg) => middlewares.isAdmin(bot, msg, () => {}, funcBot.getUsersBlock));

bot.on("contact", (msg) => controller.contactHandler(bot, msg)); // ذخیره شماره تلفن کاربر در userContacts

bot.onText("/bot", (msg) => controller.botOrderHandler(bot, msg));

bot.onText("/site", (msg) => controller.siteOrderHandler(bot, msg));

bot.onText(
    "/reqDel",
    async (msg) =>
        await middlewares.isBlock(
            bot,
            msg,
            () => {},
            middlewares.isAdmin,
            () => {},
            funcBot.deleteRequest,
            funcBot.isBlockUser
        )
);

bot.onText("/tick", (msg) => controller.ticketHandler(bot, msg));

bot.onText(
    "/delTick",
    async (msg) =>
        await middlewares.isBlock(
            bot,
            msg,
            () => {},
            middlewares.isAdmin,
            () => {},
            funcBot.deleteTicket,
            funcBot.isBlockUser
        )
);

bot.on("text", async (msg) => {
    let isBlock = await funcBot.isBlockUser(bot, msg);
    console.log(isBlock);
    if (!isBlock) {
        await controller.textHandler(bot, msg);
    }
});
