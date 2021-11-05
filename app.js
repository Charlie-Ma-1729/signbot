const Discord = require('discord.js');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
const token = process.env.TOKEN;
let port_number = process.env.PORT || 3000;
console.log(token);
const client = new Discord.Client();
app.get('/', async function (req, res) {
    res.render('index');
});
const mongoDB = 'mongodb+srv://signbot:20201016@users.1zwb5.mongodb.net/SignInData?retryWrites=true&w=majority'
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
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
        },
        goal: {
            type: Number
        }
    })

const UserData = mongoose.model('users', UserSchema)


// 連上線時的事件
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const job = schedule.scheduleJob('0 16 * * *', async function () {
        await UserData.updateMany({}, { $set: { tf: 0 } })
    });
});

client.on("message", async msg => {
    if (msg.content == '!sign') {
        await msg.react("📝")
        let username = msg.author.id
        let serverid = msg.guild.id
        if (!await UserData.findOne({ server: serverid, userid: username })) {
            const newUser = new UserData({
                userid: username,
                server: serverid
            })
            await newUser.save()
            msg.channel.send('哇喔!是**' + msg.author.username + '**耶~ 恭喜你完成了第一次簽到!希望之後能很常見到你~');
        } else {
            let data = await UserData.findOne({ server: serverid, userid: username });
            if (data.tf === 1) {
                msg.channel.send('**' + msg.author.username + '**，你今天已經簽到過了喔!明天再來吧~');
            } else {
                await UserData.updateOne({ server: serverid, userid: username }, { $inc: { count: 1 } })
                await UserData.updateOne({ server: serverid, userid: username }, { $inc: { tf: 1 } })
                let data = await UserData.findOne({ server: serverid, userid: username });
                if (data.goal === data.count) {
                    msg.channel.send('🎉🎉🎉恭喜**' + msg.author.username + '**~');
                    msg.channel.send('你達成了你的簽到目標**' + data.count + '**次囉!');
                } else {
                    msg.channel.send('哈囉**' + msg.author.username + '**~ 今天也很高興見到你');
                    msg.channel.send('你已經累計簽到了**' + data.count + '**次囉!');
                }
            }
        }

    }
    if (msg.content.substring(0, 9) == '!setgoal ') {
        await msg.react("🎯")
        let username = msg.author.id
        let serverid = msg.guild.id
        if (!await UserData.findOne({ server: serverid, userid: username })) {
            msg.channel.send('哈囉**' + msg.author.username + '**~ 請先完成第一次簽到再設定目標喔!');
        } else {
            await UserData.updateOne({ server: serverid, userid: username }, { $set: { goal: msg.content.substring(9, 2147483647) } })
            let data = await UserData.findOne({ server: serverid, userid: username });
            msg.channel.send('**' + msg.author.username + '**設下了他的簽到目標為**' + data.goal + '**次!');
        }
    }
    if (msg.content == '!mygoal') {
        await msg.react("🎯")
        let username = msg.author.id
        let serverid = msg.guild.id
        if (!await UserData.findOne({ server: serverid, userid: username })) {
            msg.channel.send('哈囉**' + msg.author.username + '**~ 請先完成第一次簽到並設定目標後，再查看目標喔!');
        } else {
            let data = await UserData.findOne({ server: serverid, userid: username });
            msg.channel.send('**' + msg.author.username + '**的簽到目標為**' + data.goal + '**次!');
        }

    }
    if (msg.content == '!mysign') {
        await msg.react("📝")
        let username = msg.author.id
        let serverid = msg.guild.id
        if (!await UserData.findOne({ server: serverid, userid: username })) {
            msg.channel.send('哈囉**' + msg.author.username + '**~ 你好像還沒簽到過喔!沒看過你呢!');
        } else {
            let data = await UserData.findOne({ server: serverid, userid: username });
            msg.channel.send('哈囉**' + msg.author.username + '**!你目前已經簽到**' + data.count + '**次了喔!');
        }

    }

    if (msg.content == '!signhelp') {
        await msg.react("⁉")
        msg.channel.send('**簽到機器人使用說明:**\n```\n!sign: 簽到\n!mysign: 查看目前簽到數\n!setgoal <數字>: 可以設定目標簽到數，到達目標簽到數時會有恭喜的訊息(省略範例上的<>)\n!mygoal: 查看自己的目標\n!signhelp: 查看現在這串東西\n```');

    }

});
app.listen(port_number, () => console.log('Server up and running'));
client.login(token);