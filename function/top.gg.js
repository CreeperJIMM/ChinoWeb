///////// TOP.gg //////////////////////
const DBL = require("dblapi.js");
let Discord = require("discord.js")
let fetch = require("node-fetch")
let test = new Map()
let tokens = require("../token.json")
module.exports.main = function(client,app) {
    app.post('/api/hasvote', async function (req, res) {
        let data = req.body
        if(data.bot === "731408794948730961") {
            fetch.default("https://top.gg/api/users/"+data.user,
            {method:"GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": tokens.topToken,
            }}).then(async(data) => {
                return data.json()
            }).then((users) => {
                snedvote(users)
            }).catch((err) => {
                return; 
            })
            function snedvote(user) {
            if(user.id) {
                res.sendStatus(200)
                console.log(`感謝 ${user.username} 的投票!`);
                let channel = client.channels.cache.get(`767216526125957170`)
                channel.send( "<@" + user.id + ">")
                let vote2 = new Discord.MessageEmbed().setColor("#2d9af8").setTitle("感謝投票! "+`<a:cat_pat:877420973371060246>`).setDescription("感謝 "+`${user.username}#${user.discriminator}\n`+"為智乃機器人增加了一票!")
                .setThumbnail("https://cdn.discordapp.com/avatars/"+user.id+`/${user.avatar}?size=1024`)
                .setFooter(user.id).setColor(user.color)
                let button = new Discord.MessageButton()
                .setStyle("LINK").setURL("https://top.gg/bot/731408794948730961/vote").setLabel("點這裡幫智乃投票!")
                let row = new Discord.MessageActionRow().addComponents(button)
                channel.send({embeds: [vote2],components:[row]})
            }else{
                if(test.has(data.user)) {
                    let u = test.get(data.user)
                    if(u.time >= 4) return sendStatus(404)
                    getData()
                }else{
                    test.set(data.user,{time: 0})
                    getData()
                }
            }
            function getData() {
                let user = client.users.cache.get(data.user)
                if(user) {
                    console.log(`感謝 ${user.username} 的投票!`);
                    res.sendStatus(200)
                    let channel = client.channels.cache.get(`767216526125957170`)
                    channel.send( "<@" + user.id + ">")
                    let vote2 = new Discord.MessageEmbed().setColor("#2d9af8").setTitle("感謝投票! "+`<a:cat_pat:877420973371060246>`).setDescription("感謝 "+`${user.username}#${user.discriminator}\n`+"為智乃機器人增加了一票!")
                    .setThumbnail(user.displayAvatarURL({format: "png", dynamic: true ,size: 2048}))
                    .setFooter(user.id).setColor(user.color)
                    let button = new Discord.MessageButton()
                    .setStyle("LINK").setURL("https://top.gg/bot/731408794948730961/vote").setLabel("點這裡幫智乃投票!")
                    let row = new Discord.MessageActionRow().addComponents(button)
                    channel.send({embeds: [vote2],components:[row]})
                }else{
                    res.sendStatus(500)
                }
            }
        }
        }else{
            res.sendStatus(404)
        }
     })
}
