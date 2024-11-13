const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
let opts = { parse_mode: "HTML" };

const middlewares = require("./middlewares");

const formattedDate = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false, // اگر می‌خواهید از سیستم 24 ساعته استفاده کنید
    timeZone: "Asia/Tehran", // تنظیم منطقه زمانی مناسب
});

async function checkDB() {
    fs.exists(path.join(__dirname, "db.json"), async (exists) => {
        if (!exists) {
            try {
                await fs.promises.writeFile(
                    path.join(__dirname, "db.json"),
                    JSON.stringify({ users: [], request: [], channelLink: [], blockUsers: [] })
                );
            } catch (err) {
                console.error("Error create db :", err);
            }
        }
        return;
    });
}

async function responsHandler(bot, msg, opts) {
    if (msg.text == "🤖 پروژه ربات") {
        bot.sendMessage(
            msg.chat.id,
            ` توضیحات بات رو در این قالب بفرستید :    \n\n /bot توضیحات {شامل قیمت ، ویژگی ها و توضیحات کامل}`,
            opts
        );
    }
    if (msg.text == "🌐 پروژه وبسایت") {
        bot.sendMessage(
            msg.chat.id,
            ` توضیحات وبسایت رو در این قالب بفرستید :    \n\n /site توضیحات {شامل قیمت ، ویژگی ها و توضیحات کامل}`,
            opts
        );
    }

    if (msg.text == "📧 تیکت") {
        bot.sendMessage(
            msg.chat.id,
            ` مشکلات و پیشنهادات خود را با ما درمیان بگذارید در این قالب:    \n\n /tick ... انتقاد ،پیشنهاد و `,
            opts
        );
    }

    if (msg.text == "👤 پروفایل") {
        await userInformation(bot, msg, opts);
    }

    if (msg.text == "📚 کانال اموزشی") {
        await getChannelLink(bot, msg);
    }

    //------------admin 👇

    if (msg.text == "👤 کاربران") {
        middlewares.isAdmin(bot, msg, () => {}, users);
    }

    if (msg.text == "کاربران مسدود") {
        await bot.sendMessage(
            msg.chat.id,
            `  مسدود کردن :\n /ban ایدی \n\n  در اوردن از  مسدودی  : \n /unBan ایدی  \n\n لیست مسدودی ها : \n /list`,
            opts
        );
    }

    if (msg.text == "📧 تیکت ها") {
        middlewares.isAdmin(bot, msg, () => {}, getTicket);
    }
    if (msg.text == "📚 لینک کانال") {
        await bot.sendMessage(msg.chat.id, `لینک کانال ها در حال حاضر 👇`, opts);

        await getChannelLink(bot, msg);

        await bot.sendMessage(
            msg.chat.id,
            `برای تغییر لینک های کانال رو در این قالب بفرست : \n\n /link linl1 , link2 , link3 , ... `,
            opts
        );
    }
    if (msg.text == "💰 درخواست ها") {
        middlewares.isAdmin(bot, msg, () => {}, getRequest);
    }
    if (msg.text == "📪 ارسال پیام") {
        await bot.sendMessage(
            msg.chat.id,
            ` ارسال همگانی :\n /pubMess پیغام \n ارسال به شخص : \n /mess  پیغام@@ایدی `,
            opts
        );
    }
    if (msg.text == "📧 حذف تیکت") {
        await bot.sendMessage(
            msg.chat.id,
            `برای حذف تیکت شناسه تیکت رو در این قالب بفرست : \n\n /delTick شناسه `,
            opts
        );
    }

    if (msg.text == "💰 حذف درخواست") {
        await bot.sendMessage(
            msg.chat.id,
            `برای حذف درخواست شناسه درخواست رو در این قالب بفرست : \n\n /reqDel شناسه `,
            opts
        );
    }
}

async function findUser(id) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("findUser db :", db);
        let user = db.users.find((user) => user.user_id == id); // استفاده از "===" برای مقایسه صحیح
        return user;
    } catch (err) {
        console.error("Error reading or parsing the file in function findUser:", err);
        return null;
    }
}

async function newUser(msg) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("newUser db :", db);

        db.users.push({
            user_id: msg.contact.user_id,
            username: msg.chat.username,
            first_name: msg.contact.first_name,
            phone_number: msg.contact.phone_number,
        });

        await fs.promises.writeFile(path.join(__dirname, "db.json"), JSON.stringify(db));
    } catch (err) {
        console.error("Error reading or parsing the file in function newUser:", err);
        return null;
    }
}

async function users(bot) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("users db :", db);

        if (db.users.length === 0)
            return await bot.sendMessage(
                process.env.ADMIN_ID,
                ` در حال حاضر کاربری وجود ندارد 🙂 `
            );

        db.users.forEach(async (user) => {
            await bot.sendMessage(
                process.env.ADMIN_ID,
                ` 📜 مشخصات کاربر \n\n 🆔 یوزرنیم کاربر  : @${user.username} \n\n 👤 نام مستعار : ${user.first_name} \n\n 🆔 ایدی کاربر  : <code>${user.user_id}</code> \n\n 📱  شماره تلفن : +${user.phone_number}   `,
                opts
            );
        });
    } catch (err) {
        console.error("Error reading or parsing the file in function users:", err);
        return null;
    }
}

async function saveRequest(msg) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("saveRequest db :", db);

        let user = await findUser(msg.chat.id);
        let data = msg.text.split(" ");

        db.request.push({
            id: uuidv4(),
            type: data[0],
            data: data[1],
            user_id: msg.chat.id,
            username: msg.chat.username,
            first_name: msg.chat.first_name,
            phone_number: user.phone_number,
            time: formattedDate.format(new Date()).toString(),
        });
        await fs.promises.writeFile(path.join(__dirname, "db.json"), JSON.stringify(db));

        return db.request[db.request.length - 1].id;
    } catch (err) {
        console.error("Error reading or parsing the file in function saveRequest:", err);
        return null;
    }
}

async function getRequest(bot) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("getRequest db :", db);

        if (db.request.length === 0)
            return await bot.sendMessage(
                process.env.ADMIN_ID,
                ` در حال حاضر درخواستی وجود ندارد 🙂 `
            );

        db.request.forEach(async (req) => {
            if (req.type !== "/tick")
                await bot.sendMessage(
                    process.env.ADMIN_ID,
                    `\n\n شناسه درخواست: <code>${req.id}</code> \n\n نوع: ${req.type} \n\n ایدی کاربر : <code>${req.user_id}</code>  \n\n  نام کاربری : @${req.username}  \n\n  نام مستعار : ${req.first_name} \n\n  شماره تلفن : +${req.phone_number} \n\n زمان : ${req.time} \n\n شرح : ${req.data}  `,
                    opts
                );
        });
    } catch (err) {
        console.error("Error reading or parsing the file in function getRequest:", err);
        return null;
    }
}

async function deleteRequest(bot, msg) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("deleteRequest db :", db);

        let id = msg.text.split("/reqDel")[1].trim();

        if (!id)
            return await bot.sendMessage(process.env.ADMIN_ID, `شناسه درخواست را وارد کن  `, opts);

        db.request = db.request.filter((request) => {
            return request.id != id;
        });

        await fs.promises.writeFile(path.join(__dirname, "db.json"), JSON.stringify(db));
        await bot.sendMessage(process.env.ADMIN_ID, ` مورد از درخواست ها  حذف شد ✅ `, opts);
    } catch (err) {
        console.error("Error reading or parsing the file in function deleteRequest:", err);
        return null;
    }
}

async function getTicket(bot) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("getTicket db :", db);

        db.request = db.request.filter((req) => {
            return req.type == "/tick";
        });

        if (db.request.length === 0)
            return await bot.sendMessage(
                process.env.ADMIN_ID,
                ` در حال حاضر تیکتی وجود ندارد 🙂 `
            );

        db.request.forEach(async (req) => {
            await bot.sendMessage(
                process.env.ADMIN_ID,
                `\n\n شناسه درخواست: <code>${req.id}</code> \n\n نوع: ${req.type} \n\n ایدی کاربر : <code>${req.user_id}</code>  \n\n  نام کاربری : @${req.username}  \n\n  نام مستعار : ${req.first_name} \n\n  شماره تلفن : +${req.phone_number} \n\n زمان : ${req.time} \n\n شرح : ${req.data}  `,
                opts
            );
        });
    } catch (err) {
        console.error("Error reading or parsing the file in function getTicket:", err);
        return null;
    }
}

async function deleteTicket(bot, msg) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("deleteTicket db :", db);

        let id = msg.text.split("/delTick")[1].trim();

        if (!id)
            return await bot.sendMessage(process.env.ADMIN_ID, `شناسه  تیکت را وارد کن  `, opts);

        db.request = db.request.filter((request) => {
            return request.id != id;
        });

        await fs.promises.writeFile(path.join(__dirname, "db.json"), JSON.stringify(db));
        await bot.sendMessage(process.env.ADMIN_ID, ` مورد از لیست تیکت ها  حذف شد ✅ `, opts);
    } catch (err) {
        console.error("Error reading or parsing the file in function deleteTicket:", err);
        return null;
    }
}

async function saveChannelLink(bot, msg) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("saveChannelLinkHandler db :", db);

        let data = msg.text.trim().split("/link")[1];

        if (!data) return bot.sendMessage(process.env.ADMIN_ID, `لطفا اطلاعات وارد کن `);

        console.log("link saveChannelLink :", data);

        db.channelLink = [];
        db.channelLink.push(...data.split(","));

        await fs.promises.writeFile(path.join(__dirname, "db.json"), JSON.stringify(db));
        await bot.sendMessage(process.env.ADMIN_ID, ` تغیررات ذخیره شد ✅ `);
    } catch (err) {
        console.error("Error reading or parsing the file in function saveChannelLinkHandler:", err);
        return null;
    }
}

async function getChannelLink(bot, msg) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("getTicket db :", db);

        if (db.channelLink.length === 0)
            return await bot.sendMessage(msg.chat.id, ` در حال حاضر لینکی وجود ندارد 🙂 `);

        db.channelLink.forEach(async (link) => {
            await bot.sendMessage(msg.chat.id, ` ${link} `);
        });
    } catch (err) {
        console.error("Error reading or parsing the file in function getTicket:", err);
        return null;
    }
}

async function userInformation(bot, msg) {
    let user = await findUser(msg.chat.id);
    let fileId = "";
    await bot.getUserProfilePhotos(msg.chat.id, { limit: 1 }).then((photos) => {
        if (photos.total_count > 0) {
            // دریافت file_id اولین عکس پروفایل
            console.log("photos :", photos.photos[0][0].file_id);
            fileId = photos.photos[0][0].file_id;
        }
    });
    if (fileId) {
        return await bot.sendPhoto(msg.chat.id, fileId, {
            caption: ` 📜 مشخصات تو \n 🆔 یوزرنیم تو : @${msg.chat.username} \n 👤 نام مستعار : ${msg.chat.first_name} \n 🆔 ایدی تو : <code>${msg.chat.id}</code> \n 📱  شماره تلفن : +${user.phone_number}   `,
            parse_mode: "HTML",
        });
    }

    return await bot.sendMessage(
        msg.chat.id,
        ` 📜 مشخصات تو\n 🆔 یوزرنیم تو : @${msg.chat.username} \n 👤 نام مستعار : ${msg.chat.first_name} \n 🆔 ایدی تو : <code>${msg.chat.id}</code> \n 📱  شماره تلفن : +${user.phone_number}   `,
        opts
    );
}

async function sendPublicMessageHandler(bot, message) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);

        db.users.forEach(async (user) => {
            await bot.sendMessage(user.user_id, `${message}`, opts);
        });
    } catch (err) {
        console.error("Error sendPublicMessageHandler:", err);
        return null;
    }
}

async function addUserBlock(bot, msg) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("addUserBlock db :", db);

        let user_id = msg.text.split("/ban")[1].trim();

        if (!user_id)
            return await bot.sendMessage(process.env.ADMIN_ID, `ایدی کاربر را وارد کن  `, opts);

        let user = await bot.getChat(user_id);

        db.blockUsers.push({
            user_id: user.id,
            username: user.username,
            first_name: user.first_name,
        });

        await fs.promises.writeFile(path.join(__dirname, "db.json"), JSON.stringify(db));
        await bot.sendMessage(process.env.ADMIN_ID, ` مورد به لیست بلاک اضافه شد ✅ `, opts);
    } catch (err) {
        console.error("Error reading or parsing the file in function addUserBlock:", err);
        return null;
    }
}

async function deleteUserBlock(bot, msg) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("deleteUserBlock db :", db);

        let user_id = msg.text.split("/unBan")[1].trim();

        if (!user_id)
            return await bot.sendMessage(process.env.ADMIN_ID, `ایدی کاربر را وارد کن  `, opts);

        db.blockUsers = db.blockUsers.filter((user) => {
            return user.user_id != user_id;
        });

        await fs.promises.writeFile(path.join(__dirname, "db.json"), JSON.stringify(db));
        await bot.sendMessage(process.env.ADMIN_ID, ` مورد از لیست بلاک حذف شد ✅ `, opts);
    } catch (err) {
        console.error("Error reading or parsing the file in function deleteUserBlock:", err);
        return null;
    }
}

async function getUsersBlock(bot) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("getUsersBlock db :", db);

        if (db.blockUsers.length === 0)
            return await bot.sendMessage(
                process.env.ADMIN_ID,
                ` کاربری در این لیست وجود ندارد 🙂 `
            );
        db.blockUsers.forEach(async (user) => {
            await bot.sendMessage(
                process.env.ADMIN_ID,
                ` 📜 مشخصات کاربر \n\n 🆔 یوزرنیم کاربر  : @${user.username}  \n\n 🆔 ایدی کاربر  : <code>${user.user_id}</code> \n\n 👤 نام مستعار : ${user.first_name} `,
                opts
            );
        });
    } catch (err) {
        console.error("Error reading or parsing the file in function getUsersBlock:", err);
        return null;
    }
}

async function isBlockUser(bot, msg) {
    try {
        let db = await fs.promises.readFile(path.join(__dirname, "db.json"), "utf8");
        db = JSON.parse(db);
        console.log("isBlockUser db :", db);

        let result = db.blockUsers.find((user) => {
            return user.user_id === msg.chat.id;
        });

        if (result) {
            console.log(`کاربر ${msg.chat.id} بلاک شده است.`);
            return true;
        }

        return false;
    } catch (err) {
        console.error("Error reading or parsing the file in function isBlockUser:", err);
        return null;
    }
}
async function unLoginUser(bot, msg) {
    try {
        const opts = {
            reply_to_message_id: msg.message_id,
            reply_markup: JSON.stringify({
                keyboard: [
                    [
                        {
                            text: "📞 ارسال شماره تلفن",
                            request_contact: true, // درخواست شماره تلفن
                        },
                    ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            }),
        };
        await bot.sendMessage(
            msg.chat.id,
            ` برای کار با ربات ما باید شماره تماس شما را بدانیم `,
            opts
        );

        return false;
    } catch (err) {
        console.error("Error reading or parsing the file in function unLoginUser:", err);
        return null;
    }
}

module.exports = {
    opts,
    formattedDate,
    checkDB,
    responsHandler,
    findUser,
    newUser,
    userInformation,
    saveRequest,
    getRequest,
    deleteRequest,
    getTicket,
    deleteTicket,
    saveChannelLink,
    sendPublicMessageHandler,
    addUserBlock,
    getUsersBlock,
    isBlockUser,
    deleteUserBlock,
    unLoginUser,
};
