let tokens = require("../token.json")
let getToken = require("../function/getToken")
const {OAuth2Client} = require('google-auth-library');
const clientG = new OAuth2Client(tokens.Google_ID);

const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2();
let Mongo = require("../function/MongoData")

module.exports.google_link = function(req,res,clientDB) {
    if(!req.cookies.user) {
        return res.json({success:false,Error: 'No_Type_User_Token.'})
    }
    if(!req.cookies.user.token) {
        return res.json({success:false,Error: 'No_Type_User_Token.'})
    }
    let code = getToken.getoauthToken(req.cookies.user.token,req.cookies.user.id)
    oauth.getUser(code).then((data) => {
        async function verify() {
          const ticket = await clientG.verifyIdToken({
              idToken: req.body.idtoken,
              audience: tokens.Google_ID,
          });
          if(!ticket) return res.json({success:false,Error:"Error_to_get_google_data"})
          const payload = ticket.getPayload();
          const userid = payload['sub'];
          let oath = Mongo.loadOuath(clientDB,data.id,"discord")
          oath.then((dataOath) => {
              if(dataOath === false) {
                var myobj = [{ "type": "user",status:{"google": true,"pin":null},"discord_id": data.id,"discord_data":data,"google_id":userid,"google_data":payload,code:req.cookies.user.token,email: payload.email,"updatetime": new Date().getTime() }];
                let dbo = clientDB.db("mydb")
                dbo.collection("oauth").insertMany(myobj, function (err, res2) {
                    if (err) return res.status(404).json({success:false,Error: 'Error_to_create_database.'})
                    console.log("新google用戶!!" + data.username+" TO "+payload.name)
                    res.json({success:true,name: payload.name,text:"create"})
                });
              }else{
                dataOath.discord_id= data.id
                dataOath.discord_data=data
                dataOath.google_id=userid
                dataOath.google_data=payload
                dataOath.code = req.cookies.user.token
                dataOath.email= data.email
                dataOath.updatetime= new Date().getTime()
                dataOath.status= {"google":true,"pin":dataOath.status.pin}
                Mongo.writeOauth(clientDB,data.id,"discord",dataOath)
                return res.json({success:true,name: payload.name,text:"update"})
              }
          })
          // If request specified a G Suite domain:
          // const domain = payload['hd'];
        }
        verify().catch(console.error);
    }).catch((err) => {
        return res.status('404').json({success:false,Error: 'Error_to_get_data',Errors: err})
    })
}
module.exports.pin_link  = function(req,res,clientDB) {
    if(!req.cookies.user) {
        return res.render("./login/pin/register",{success:false,Error: 'No_Type_User_Token.'})
    }
    if(!req.cookies.user.token) {
        return res.render("./login/pin/register",{success:false,Error: 'No_Type_User_Token.'})
    }
    if(!req.body.pin) {
        return res.render("./login/pin/register",{success:false,Error: 'No_Type_PIN.'})
    }
    if(req.body.pin.length < 5) {
        return res.render("./login/pin/register",{success:false,Error: 'More_than_PIN.'})
    }
    if(req.body.pin != req.body.pin_confirm) {
        return res.render("./login/pin/register",{success:false,Error: 'Confirm_pin_not_correct.'})
    }
    let code = getToken.getoauthToken(req.cookies.user.token,req.cookies.user.id)
    oauth.getUser(code).then((data) => {
        async function verify() {
        if(data.email != req.body.email) {
            return res.render("./login/pin/register",{success:false,Error: 'No_Type_Email.'})
        }
          let oath = Mongo.loadOuath(clientDB,data.id,"discord")
          oath.then((dataOath) => {
              if(dataOath === false) {
                var myobj = [{ "type": "user","status":{"google": null,"pin":true},"pin_password":req.body.pin, "discord_id": data.id,"discord_data":data,"updatetime": new Date().getTime() }];
                let dbo = clientDB.db("mydb")
                dbo.collection("oauth").insertMany(myobj, function (err, res2) {
                    if (err) return res.status(404).json({success:false,Error: 'Error_to_create_database.'})
                    console.log("新PIN用戶!!" + data.username)
                    res.render("./login/pin/register",{Error:false,success:true,text:"create"})
                });
              }else{
                dataOath.discord_id= data.id
                dataOath.discord_data=data
                dataOath.code = req.cookies.user.token
                dataOath.pin_password = req.body.pin
                dataOath.email= data.email
                dataOath.updatetime= new Date().getTime()
                dataOath.status= {"google":dataOath.status.google,"pin":true}
                Mongo.writeOauth(clientDB,data.id,"discord",dataOath)
                return res.render("./login/pin/register",{Error:false,success:true,text:"update"})
              }
          })
          // If request specified a G Suite domain:
          // const domain = payload['hd'];
        }
        verify().catch(console.error);
    }).catch((err) => {
        return res.status('404').render("./login/pin/register",{success:false,Error: 'Error_to_get_data',Errors: err})
    })
}
module.exports.google_login = function(req,res,clientDB) {
    async function verify() {
        const ticket = await clientG.verifyIdToken({
            idToken: req.body.idtoken,
            audience: tokens.Google_ID,
        });
        if(!ticket) return res.status(422).json({success:false,Error:"Error_to_get_google_data"})
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        let oath = Mongo.loadOuath(clientDB,userid,"google")
        oath.then((dataOath) => {
            if(dataOath === false) {
              return res.status(422).json({success:false,Error: 'This_account_no_have_link.'})
            }else{
              let dt = dataOath.discord_data                      
              res.cookie('language',{lang: dt.locale},{path: '/',signed: false,httpOnly: false})
              res.cookie('user',{token: dataOath.code,id: dt.id,name: dt.username,mfa: dt.mfa_enabled},{path: '/',signed: false, expires: new Date(Date.now() + 868000000) ,httpOnly: true})
              return res.json({success:true,href:"/login/signin"})
            }
        })
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
      }
      verify().catch(console.error);
}
module.exports.pin_login = function(req,res,clientDB) {
    if(!req.body.pin) {
        return res.render("./login/pin/login",{success:false,Error: 'No_Type_PIN.'})
    }
    if(req.body.pin.length < 5) {
        return res.render("./login/pin/login",{success:false,Error: 'More_than_PIN.'})
    }
    if(!req.body.email) {
        return res.render("./login/pin/login",{success:false,Error: 'No_Type_Email.'})
    }
        async function verify() {
          let oath = Mongo.loadOuath(clientDB,req.body.email,"email")
          oath.then((dataOath) => {
              if(dataOath === false) {
                return res.render("./login/pin/login",{success:false,Error: 'This_account_no_have_link.'})
              }else{
                if(req.body.pin != dataOath.pin_password) {
                    return res.render("./login/pin/login",{success:false,Error: 'Type_password_error.'})
                }
                let dt = dataOath.discord_data                      
                res.cookie('language',{lang: dt.locale},{path: '/',signed: false,httpOnly: false})
                res.cookie('user',{token: dataOath.code,id: dt.id,name: dt.username,mfa: dt.mfa_enabled},{path: '/',signed: false, expires: new Date(Date.now() + 868000000) ,httpOnly: true})
                return res.render("./login/pin/login",{Error:false,success:true,text:"login"})
              }
          })
          // If request specified a G Suite domain:
          // const domain = payload['hd'];
        }
        verify().catch(console.error);
}
module.exports.discord_login = function(req,res) {
    if(req.cookies.user != undefined) {
        let code = getToken.getoauthToken(req.cookies.user.token,req.cookies.user.id)
        oauth.getUser(code).then((data) => {
            if(!data) {return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=731408794948730961&redirect_uri=https%3A%2F%2F${req.hostname}%2Flogin%2Fsignin&response_type=code&scope=identify%20email%20guilds`)}else{
            return res.render('./login/discord');}
            }).catch((error) => {return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=731408794948730961&redirect_uri=https%3A%2F%2F${req.hostname}%2Flogin%2Fsignin&response_type=code&scope=identify%20email%20guilds`)})
    }else{
        return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=731408794948730961&redirect_uri=https%3A%2F%2F${req.hostname}%2Flogin%2Fsignin&response_type=code&scope=identify%20email%20guilds`)
    }
}