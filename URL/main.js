const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2();
let getToken = require("../function/getToken")
var fetch = require('node-fetch')
let discordToken = process.env["discord_token_web"]
module.exports.main = function(app) {

}
let {banlist , why} = require('../../DiscordBot/banlist.json')
module.exports.ban = function(req,res) {
    if(!req.cookies.user) return res.status(302).render('./login/noban')
    let code = getToken.getoauthToken(req.cookies.user.token,req.cookies.user.id)
    oauth.getUser(code).then((data) => {
        if(banlist.indexOf(data.id) != -1) {
            res.status(302).render('./login/banned',{user: `⛔此用戶 ${data.username} 封禁中`, why: why[data.id] });
        }else{
            res.status(302).render('./login/banned',{user: `✅此用戶 ${data.username} 狀態良好`, why: "你可以放心使用本網站的東西." });
        }
    })
}
module.exports.login = function(req,res) {
    let token = req.query.code
    if(req.query.error) {
        return res.render('./login/fail')
    }
    let url = `https://${req.hostname}/login/signin`
    if(token) {return setuser()}else{
     if(req.cookies.user) {
         let warp = "login/signin"
         let code = getToken.getoauthToken(req.cookies.user.token,req.cookies.user.id)
         oauth.getUser(code).then((data) => {
        if(!data) {
          res.status(302).render("./login/nologin")  
        }
         if(req.cookies.language) {
             if(req.cookies.language.lang === "zh-TW") {return res.status(302).render("./zh-TW/"+warp)}
             else if(req.cookies.language.lang === "en-US") {return res.status(302).render("./en-US/"+warp)}
             else if(req.cookies.language.lang === "ja-JP") {return res.status(302).render("./ja-JP/"+warp)}
             else{res.status(302).render("./zh-TW/"+warp)}
         }else{
         return res.status(302).render("./zh-TW/"+warp)
         }
        }).catch((error) => {
            res.status(302).render("./login/nologin") 
        })
        }else{ return res.status(500).render("login/fail")}
     }
     function setuser() {
        fetch.default('https://discord.com/api/v7/oauth2/token', 
        {method: 'POST',
         headers:{
             Authorization: `Basic ${token}`,
             'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: new URLSearchParams({
             "client_id": "731408794948730961",
             'client_secret':discordToken,
             'grant_type': 'authorization_code',
             "code": token,
             "refresh_token": token,
             "redirect_uri": url,
             "scope": "identify guilds"
            })
     }).then(async(data) => {
         return data.json()
     }).then((data2) => {
         if(!data2.access_token) return res.render('./login/fail')
         oauth.getUser(data2.access_token).then((dt) => {
             res.cookie('language',{lang: dt.locale},{path: '/',signed: false,httpOnly: false})
             let code = getToken.writeoauthToken(data2.access_token,dt.id)
             res.cookie('user',{token: code,id: dt.id,name: dt.username,mfa: dt.mfa_enabled},{path: '/',signed: false, expires: new Date(Date.now() + 868000000) ,httpOnly: true})
             res.redirect('./signin');
         })
     }).catch((error) => {
        return res.render('./login/fail')
     })
 }
}