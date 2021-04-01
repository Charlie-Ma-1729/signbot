const Discord = require('discord.js');
const {token} = require('./token.json');
const client = new Discord.Client();

// 連上線時的事件
client.on('ready',  () => {
    console.log(`Logged in as ${client.user.tag}!`);
    setTimeout(async function(){
        let today = new Date();
        if (today.getHours() === 15 && today.getMinutes() === 58) {
            await client.channels.cache.get(`783183076272373811`).send(`簽到`);
        }
    }, 60000);
});

client.on("message", async msg => {
    if (msg.content == '簽到') {
        await msg.react("📝")
    }
});


client.login(token);