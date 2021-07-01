const Discord = require('discord.js');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();
const token = process.env.TOKEN;
console.log(token);
const client = new Discord.Client();
const mongoDB = 'mongodb+srv://signbot:20201016@users.1zwb5.mongodb.net/SignInData?retryWrites=true&w=majority'
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("DB connect!")
    })
    .catch((err) => {
        console.log(err)
    })


const Schema = mongoose.Schema
// 先新增 Author 的 Schema ，其中可設定姓名、生卒年等，可對其 value 的規格做限制。
const UserSchema = new Schema(
    {
        userid: {
            type: String
        },
        count: {
            type: Number,
            default: 1
        },
        server: {
            type: String
        },
        tf: {
            type: Number,
            default: 1
        }
    })

const UserData = mongoose.model('users', UserSchema)


// 連上線時的事件
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const job = schedule.scheduleJob('0 16 * * *', async function () {
        await UserData.updateMany({}, {$set: {tf: 0}})
    });
});

client.on("message", async msg => {
    if (msg.content == '!sign') {
        await msg.react("📝")
        let username = msg.author.id
        let serverid = msg.guild.id
        if (!await UserData.findOne({server: serverid, userid: username})) {
            const newUser = new UserData({
                userid: username,
                server: serverid
            })
            await newUser.save()
            msg.channel.send('哇喔!是**' + msg.author.username + '**耶~ 恭喜你完成了第一次簽到!希望之後能很常見到你~');
        } else {
            let data = await UserData.findOne({server: serverid, userid: username});
            if (data.tf === 1) {
                msg.channel.send('**' + msg.author.username + '**，你今天已經簽到過了喔!明天再來吧~');
            } else {
                await UserData.updateOne({server: serverid, userid: username}, {$inc: {count: 1}})
                await UserData.updateOne({server: serverid, userid: username}, {$inc: {tf: 1}})
                msg.channel.send('哇喔!是**' + msg.author.username + '**耶~ 今天也很高興見到你');
                msg.channel.send('你已經累計簽到了**' + data.count + '**次囉!');
            }
        }

    }
});

client.login(token);