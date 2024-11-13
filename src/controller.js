const funcBot = require("./function");

async function userHandler(bot, msg) {
    let user = await funcBot.findUser(msg.chat.id);

    if (user) {
        const opts = {
            reply_to_message_id: msg.message_id,
            reply_markup: JSON.stringify({
                keyboard: [
                    [" 🤖 پروژه ربات ", " 🌐 پروژه وبسایت "],
                    ["📚 کانال اموزشی", " 📧 تیکت "],
                    [" 👤 پروفایل"],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            }),
        };
        bot.sendMessage(msg.chat.id, ` چه طور میتونم کمکتون کنم ؟ `, opts);
    } else {
        return funcBot.unLoginUser(bot, msg);
    }
}

async function adminHandler(bot, msg) {
    const opts = {
        reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
            keyboard: [
                [" 👤 کاربران ", " کاربران مسدود "],
                [" 💰 درخواست ها", " 📧 تیکت ها "],
                [" 💰 حذف درخواست", " 📧 حذف تیکت"],
                [" 📚 لینک کانال  ", " 📪 ارسال پیام"],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        }),
    };
    bot.sendMessage(process.env.ADMIN_ID, ` 👋 سلام مدیر ، خوش امدید `, opts);
}

async function contactHandler(bot, msg) {
    // console.log("contact :", msg.contact);
    // const contact = msg.contact;
    // userContacts[msg.chat.id] = contact.phone_number; // ذخیره شماره تلفن بر اساس ایدی کاربر
    await funcBot.newUser(msg);
    bot.sendMessage(msg.chat.id, `شماره تلفن شما با موفقیت ثبت شد: ${msg.contact.phone_number}`);
    const opts = {
        reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
            keyboard: [
                [" 🤖 پروژه ربات ", " 🌐 پروژه وبسایت "],
                [" 📚 کانال اموزشی ", " 📧 تیکت "],
                [" 👤 پروفایل"],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        }),
    };
    bot.sendMessage(
        msg.chat.id,
        `  شماره تلفن شما با موفقیت ثبت شد ✅،  چه طور میتونم کمکتون کنم ؟@${msg.chat.username}`,
        opts
    );
}

async function botOrderHandler(bot, msg) {
    const opts = {
        reply_to_message_id: msg.message_id,
    };

    let user = await funcBot.findUser(msg.chat.id);
    let data = msg.text.trim().split("/bot")[1];
    if (!data) {
        return bot.sendMessage(msg.chat.id, `لطفا اطلاعات وارد کن `);
    }
    console.log("user :", user);
    console.log("user phone:", user.phone_number);

    let id = await funcBot.saveRequest(msg);

    bot.sendMessage(
        msg.chat.id,
        ` 🙂 پروژه ربات شما ثبت شد ✅، در کوتاه ترین زمان به شما پاسخ خواهیم داد `,
        opts
    );

    bot.sendMessage(
        process.env.ADMIN_ID,
        `🤖 پروژه بات \n\n  شناسه درخواست : <code>${id}</code> \n\n یوزرنیم مشتری : @${
            msg.chat.username
        } \n\n ایدی مشتری : <code>${msg.chat.id}</code> \n\n  شماره تلفن : +${
            user.phone_number
        } \n\n زمان : ${funcBot.formattedDate.format(new Date()).toString()} \n\n شرح : ${data}  `,
        funcBot.opts
    );
}

async function siteOrderHandler(bot, msg) {
    const opts = {
        reply_to_message_id: msg.message_id,
    };

    let user = await funcBot.findUser(msg.chat.id);
    let data = msg.text.trim().split("/site")[1];
    if (!data) {
        return bot.sendMessage(msg.chat.id, `لطفا اطلاعات وارد کن `);
    }

    console.log("user :", user);
    console.log("user phone:", user.phone_number);

    let id = await funcBot.saveRequest(msg);

    bot.sendMessage(
        msg.chat.id,
        ` 🙂 پروژه وبسایت شما ثبت شد ✅، در کوتاه ترین زمان به شما پاسخ خواهیم داد `,
        opts
    );

    bot.sendMessage(
        process.env.ADMIN_ID,
        `🌐 پروژه وبسایت \n\n  شناسه درخواست : <code>${id}</code> \n\n یوزرنیم مشتری : @${
            msg.chat.username
        } \n\n ایدی مشتری : <code>${msg.chat.id}</code> \n\n  شماره تلفن : +${
            user.phone_number
        } \n\n زمان : ${funcBot.formattedDate.format(new Date()).toString()} \n\n شرح : ${data}  `,
        funcBot.opts
    );
}

async function ticketHandler(bot, msg) {
    const opts = {
        reply_to_message_id: msg.message_id,
    };

    let user = await funcBot.findUser(msg.chat.id);
    let data = msg.text.trim().split("/tick")[1];
    if (!data) {
        return bot.sendMessage(msg.chat.id, ` 😠 لطفا اطلاعات وارد کن `);
    }

    console.log("user :", user);
    console.log("user phone:", user.phone_number);

    let id = await funcBot.saveRequest(msg);

    bot.sendMessage(
        msg.chat.id,
        `  تیکت شما ثبت گردید ✅ \n  ممنون از پیگیری شما ✅ \n  در اسرع وقت رسیدگی میکنیم ✅ `,
        opts
    );

    bot.sendMessage(
        process.env.ADMIN_ID,
        `📧 تیکت \n\n  شناسه درخواست : <code>${id}</code> \n\n یوزرنیم کاربر : @${
            msg.chat.username
        } \n\n ایدی کاربر : <code>${msg.chat.id}</code> \n\n  شماره تلفن : +${
            user.phone_number
        } \n\n زمان : ${funcBot.formattedDate.format(new Date()).toString()} \n\n شرح : ${data}  `,
        funcBot.opts
    );
}

async function sendMessage(bot, msg) {
    try {
        let data = msg.text.trim().split("/mess");
        if (!data[1]) {
            return bot.sendMessage(msg.chat.id, ` 😠 لطفا اطلاعات وارد کن `);
        }

        data = data[1].trim().split("@@");

        if (!data[0] || !data[1]) {
            return bot.sendMessage(msg.chat.id, ` قالب بندی نادرست است ❌`);
        }

        await bot.sendMessage(data[0], data[1]);
        await bot.sendMessage(
            process.env.ADMIN_ID,
            ` ارسال پیغام  \n به کاربر <code>${data[0]}</code> موفقیت امیز بود ✅`,
            funcBot.opts
        );
    } catch (err) {
        console.error("Error send Message  :", err);
        return null;
    }
}

async function sendPublicMessage(bot, msg) {
    try {
        let data = msg.text.trim().split("/pubMess");
        if (!data[1]) {
            return bot.sendMessage(msg.chat.id, ` 😠 لطفا اطلاعات وارد کن `);
        }

        await funcBot.sendPublicMessageHandler(bot, data[1]);
        await bot.sendMessage(process.env.ADMIN_ID, ` ارسال همگانی موفقیت امیز بود ✅ `);
    } catch (err) {
        console.error("Error send Message  :", err);
        return null;
    }
}

async function textHandler(bot, msg) {
    if (msg.text.match("/")) {
        return;
    }
    const opts = {
        reply_to_message_id: msg.message_id,
    };
    console.log("msg :", msg);
    funcBot.responsHandler(bot, msg, opts);
}

module.exports = {
    userHandler,
    adminHandler,
    contactHandler,
    botOrderHandler,
    siteOrderHandler,
    ticketHandler,
    textHandler,
    sendMessage,
    sendPublicMessage,
};
