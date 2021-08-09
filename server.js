// server.js

// BASE SETUP
// =============================================================================
// call the packages we need
var express = require('express');        // call express
var app = express();                // define our app using express
var bodyParser = require('body-parser');
var partials = require('express-partials');
var logger = require('morgan');
var fetch = require('node-fetch')
var fs = require('fs')

const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2();
var cookieParser = require('cookie-parser');
const { request } = require('express');
app.use(cookieParser('ChinoHelperByCreeper'));
// configure Express
app.set('views', __dirname + '/views');
app.set('img',__filename+'/public/img')
app.set('views', './views')
app.set('login', '/views/login')
app.set('view engine', 'ejs');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(partials());
app.use(logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(express.static('public'))
app.use(express.static('files'))
app.set('trust proxy', true)

app.use(express.static('static'));
const https = require('https')
var privateKey  = fs.readFileSync(__dirname + '/ssl/private.key');
var certificate = fs.readFileSync(__dirname + '/ssl/certificate.crt');
var credentials = { key: privateKey, cert: certificate };

//var ddos = new Ddos;
//app.use(ddos.express)
var port = process.env.PORT || 4434;        // set our port
let IP = process.env.IP
const helmet = require("helmet");
app.use(helmet({contentSecurityPolicy: false,}));

let cooldown = require("./function/cooldown") 
let verify = new Set();
let getToken = require("./function/getToken")

// Alternatively
const ips = ['192.111.137.35','192.252.214.20','151.54.203.102','49.224.193.93','102.72.191.83','229.177.217.98','192.252.215.2','192.252.211.197','200.73.129.112','192.252.209.155','127.0.0.1']
const options = { allow: false, allowForwarded: true };
const ipBlock = require('express-ip-block')(ips, options);

let mainWeb = require("./URL/main")
mainWeb.main(app)

app.route('/')
.get(ipBlock,function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    if(verify.has(req.ip)) return res.redirect("/main") 
    console.log("[!] "+req.ip +" [to] "+req.hostname)
    if(req.hostname === "dckabicord.com" || req.hostname === "www.dckabicord.com" || req.hostname === "www.chinohelper.tk" || req.hostname === "chinohelper.tk") {
    //res.sendFile('/Users/ASUS/Desktop/DiscordBot/web/verify.html');res.status(403)
    setTimeout(() => {
        res.status(302).redirect("/main")
    }, 500);
}else{
    return res.status(404)
}
})
/*
.post(function (req,res) {
    if (req.body["h-captcha-response"]) {
        console.log(req.body["h-captcha-respons"])
        verify.add(req.ip)
        return res.redirect('/main')
    }else{
        return res.status(404).json({Error: "No verify"})
    }
})
app.route('/login')
    .get(function (req, res) {
        console.log(req.ip)
        if(cooldown(req.ip,req,res,client)) return;
        res.render('login.ejs');
    })
    .post(function (req, res) {
        if(cooldown(req.ip,req,res,client)) return;
        if (/\W/.test(req.body.Password)) {
            return res.render('login/fail.ejs')
        }
        console.log(req.body.account);
        res.send(`hello ${req.body.account}`);
});
*/
app.get('/nohttponly' ,function (req,res) {
    res.status(302).render('./cmd/httponly');
})
app.get('/banned' ,function (req,res) {
    mainWeb.ban(req,res)
})

app.get('/login' ,function (req,res) {
    res.render('./login/main');
})

app.get('/login/link' ,function (req,res) {
    res.render('./login/link');
})

app.get('/login/link/google' ,function (req,res) {
    res.render('./login/google');
})

app.get('/login/signin',ipBlock,function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
    mainWeb.login(req,res)
})

let tokens = require("./token.json")
const {OAuth2Client} = require('google-auth-library');
const clientG = new OAuth2Client(tokens.Google_ID);
app.route('/api/link/google')
    .post(function (req,res) {
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
                    var myobj = [{ "type": "user", "discord_id": data.id,"discord_data":data,"google_id":userid,"google_data":payload,code:req.cookies.user.token,email: payload.email,"updatetime": new Date().getTime() }];
                    let dbo = clientDB.db("mydb")
                    dbo.collection("oauth").insertMany(myobj, function (err, res2) {
                        if (err) return res.status(404).json({success:false,Error: 'Error_to_create_database.'})
                        console.log("新google用戶!!" + data.username+" TO "+payload.name)
                        res.json({success:true,name: payload.name,text:"create"})
                    });
                  }else{
                    let datas = { "type": "user", "discord_id": data.id,"discord_data":data,"google_id":userid,"google_data":payload,code:req.cookies.user.token,email: payload.email,"updatetime": new Date().getTime() }
                    Mongo.writeOauth(clientDB,data.id,"discord",datas)
                    res.json({success:true,name: payload.name,text:"update"})
                  }
              })
              // If request specified a G Suite domain:
              // const domain = payload['hd'];
            }
            verify().catch(console.error);
        }).catch((err) => {
            return res.status('404').json({success:false,Error: 'Error_to_get_data',Errors: err})
        })
});

app.route('/api/login/google')
    .post(function (req,res) {
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
                    res.json({success:true,href:"/login/signin"})
                  }
              })
              // If request specified a G Suite domain:
              // const domain = payload['hd'];
            }
            verify().catch(console.error);
});

app.get('/main',ipBlock, function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    console.log("[!] "+req.ip +" [to] "+req.hostname)
    if(req.cookies.user) {
        var user = req.cookies.user
    }else{var user = undefined}
    //res.status(403)
    setTimeout(() => {
        if(req.cookies.language) {
            if(req.cookies.language.lang === "zh-TW") {res.status(200).render("./zh-TW/index")}
            else if(req.cookies.language.lang === "en-US") {res.status(200).render("./en-US/index")}
            else if(req.cookies.language.lang === "ja-JP") {res.status(200).render("./ja-JP/index")}
            else{res.status(200).render("./zh-TW/index")}
        }else{
        res.status(200).render("./zh-TW/index")
        }
    }, 300);
});

app.get('/login/discord', function (req, res) {
    if(req.cookies.user != undefined) {
        let code = getToken.getoauthToken(req.cookies.user.token,req.cookies.user.id)
        oauth.getUser(code).then((data) => {
            if(!data) {return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=731408794948730961&redirect_uri=https%3A%2F%2F${req.hostname}%2Flogin%2Fsignin&response_type=code&scope=identify%20email%20guilds`)}else{
            return res.render('./login/discord');}
            }).catch((error) => {return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=731408794948730961&redirect_uri=https%3A%2F%2F${req.hostname}%2Flogin%2Fsignin&response_type=code&scope=identify%20email%20guilds`)})
    }else{
        return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=731408794948730961&redirect_uri=https%3A%2F%2F${req.hostname}%2Flogin%2Fsignin&response_type=code&scope=identify%20email%20guilds`)
    }
})
app.get('/about/chino', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    //res.status(403)
    setTimeout(() => {
        let warp = "about"
        if(req.cookies.language) {
            if(req.cookies.language.lang === "zh-TW") {res.status(200).render("./zh-TW/"+warp)}
            else if(req.cookies.language.lang === "en-US") {res.status(200).render("./en-US/"+warp)}
            else if(req.cookies.language.lang === "ja-JP") {res.status(200).render("./ja-JP/"+warp)}
            else{res.status(200).render("./zh-TW/"+warp)}
        }else{
        res.status(200).render("./zh-TW/"+warp)
        }
    }, 600);
})
app.get('/rickroll', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
})
app.get('/about/me', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    let warp = "author"
    if(req.cookies.language) {
        if(req.cookies.language.lang === "zh-TW") {res.status(200).render("./zh-TW/"+warp)}
        else if(req.cookies.language.lang === "en-US") {res.status(200).render("./en-US/"+warp)}
        else if(req.cookies.language.lang === "ja-JP") {res.status(200).render("./ja-JP/"+warp)}
        else{res.status(200).render("./zh-TW/"+warp)}
    }else{
    res.status(200).render("./zh-TW/"+warp)
    }
})
app.get('/info', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    let warp = "info"
    if(req.cookies.language) {
        if(req.cookies.language.lang === "zh-TW") {res.status(200).render("./zh-TW/"+warp)}
        else if(req.cookies.language.lang === "en-US") {res.status(200).render("./en-US/"+warp)}
        else if(req.cookies.language.lang === "ja-JP") {res.status(200).render("./ja-JP/"+warp)}
        else{res.status(200).render("./zh-TW/"+warp)}
    }else{
    res.status(200).render("./zh-TW/"+warp)
    }
})
app.get('/help', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    let warp = "help"
    if(req.cookies.language) {
        if(req.cookies.language.lang === "zh-TW") {res.status(200).render("./zh-TW/"+warp)}
        else if(req.cookies.language.lang === "en-US") {res.status(200).render("./en-US/"+warp)}
        else if(req.cookies.language.lang === "ja-JP") {res.status(200).render("./ja-JP/"+warp)}
        else{res.status(200).render("./zh-TW/"+warp)}
    }else{
    res.status(200).render("./zh-TW/"+warp)
    }
})

let shorturls = require('./shorturl.json')

app.get('/chino', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.render('./chino');
})
app.get('/shorturl/:id', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    let id = req.params.id
    res.render('./shorturl');
})
app.get('/shorturl', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.redirect("/main")
})
app.get('/s/:id', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    let id = req.params.id
    res.render('./shorturl');
})
app.get('/s', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.redirect("/main")
})
app.route('/api/shorturl')
    .post(function (req,res) {
        if(!req.body.id) {
            return res.json({ok:false,Error: 'No_type_ID'})
        }
        if(!req.body.text) {
            return res.json({ok:false,Error: 'No_type_password'})
        }
        if(!shorturls[req.body.id]) {
            return res.json({ok:false,Error: 'ID_error'})
        }
        if(shorturls[req.body.id].password === req.body.text) {
            return res.json({ok:true,data: shorturls[req.body.id].pass})
        }else{
            return res.json({ok:false,Error:"Password_error"})
        }
});
app.get('/nofondguild', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.render('./login/noguild');
})
app.get('/404', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.status(404).render('./login/error', {'title': '錯誤!',});
 })

app.get('/music/chino',function(req,res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.status(403)
    setTimeout(() => {res.sendFile(__dirname +'/public/sound/chinobgm.mp3')}, 1000);
})
/*
app.get('/contact', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
   res.render('contact', {'title': '給點建議',});
})
*/
// ============================================================================
app.get('/cmd', function (req, res) {
  if(cooldown(req.ip,req,res,client)) return;
  if(req.cookies.user != undefined) {
      let lan = "zh-TW"
    if(req.cookies.language) {
        if(req.cookies.language.lang === "zh-TW") {lan = "zh-TW"}
        else if(req.cookies.language.lang === "en-US") {lan='en-US'}
        else if(req.cookies.language.lang === "ja-JP") {lan='ja-JP'}
    }
  switch(req.query.cmd) {
    case 'cmd':
      res.render('./'+lan+'/cmd/help')
        break;
    case 'avatar':
      res.render('./'+lan+'/cmd/avatar')
      break;
    case 'daily':
        res.render('./'+lan+'/cmd/daily')
        break;
    case 'picture':
        res.render('./'+lan+'/cmd/picture')
        break;
    case 'nsfw':
        res.render('./'+lan+'/cmd/nsfw')
        break;
    default:
      res.render('./'+lan+'/cmd/help')
    break;
  }
}else{
  res.redirect('/login/discord')
}
})
// ============================================================================
app.get('/about', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.redirect('/about/me')
})
app.get('/login/error', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.status(500).render('./login/error', {'title': '錯誤!',});
 })
app.get('/login/fail', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.status(500).render('./login/fail', {'title': '錯誤!',});
 })
app.get('/login/logout', async function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.clearCookie('user_token')
    res.clearCookie('user')
    res.clearCookie('language')
    res.clearCookie('user_data')
    res.status(302).render('./login/logout');
 })
 app.get('/cmd/logout', async function (req, res) {
  if(cooldown(req.ip,req,res,client)) return;
  res.clearCookie('user_token')
  res.clearCookie('language')
  res.status(302).render('./cmd/logout');
})
// ==================================================================== 
const Discord = require("discord.js");
const client = new Discord.Client()
const { prefix, token } = require('../DiscordBot/config.json');
client.on('ready',() => {
  console.log("login in! \nin "+client.user.username)
})
const client2 = new Discord.Client()
let token2 = require('../DiscordBot/config2.json').token

client2.on('ready',() => {
  console.log("login in! \nin "+client2.user.username)
})
// ==================================================================== 
const MongoClient = require('mongodb').MongoClient;
const e = require('express');
const { WSAEWOULDBLOCK, UV_FS_O_FILEMAP } = require('constants');
const uri = require("../DiscordBot/token.json");
const clientDB = new MongoClient(uri.mongo, { useNewUrlParser: true, useUnifiedTopology: true });
clientDB.connect(err => {
  console.log("[MangoDB] 連接成功")
});
// ==================================================================== 
var loadUser = async (client,userid) => {/*讀取用戶檔案*/let dbo =client.db("mydb"),id = userid,query = { "id": id };let user = await dbo.collection("users").find(query).toArray();if(user[0] === undefined) return false;user = user[0][id];return user}
function writeUser(client,id,data) {/*寫入用戶檔案*/let dbo =client.db("mydb"),query = { [id]: Object };let user = dbo.collection("users").find(query).toArray();var myquery = { "id": id };user[id] = data;var newvalues = {$set: user};dbo.collection("users").updateOne(myquery, newvalues, function(err,res) {;if(err) return err;})}
var loadGuild = async(client,guildid) => {/*讀取公會檔案*/let dbo =client.db("mydb"),id = guildid,query = { "id": id };let user = await dbo.collection("guilds").find(query).toArray();if(user[0] === undefined) return false;user = user[0][id];return user}
function writeGuild(client,id,data) {/*寫入公會檔案*/let dbo =client.db("mydb"),query = { [id]: Object };let user = dbo.collection("guilds").find(query).toArray();var myquery = { "id": id };user[id] = data;var newvalues = {$set: user};dbo.collection("guilds").updateOne(myquery, newvalues, function(err,res) {;if(err) return err;})}

app.get('/api',function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.status(404).render('error')
})

//當 WebSocket 從外部連結時執行
let websocket = require("./function/websocket")
websocket(app)

let {banlist , why} = require('../DiscordBot/banlist.json')
app.route('/api/verification')
    .post(function (req,res) {
        if(!req.cookies.user) {
            return res.json({Error: 'No_Type_User_Token.'})
        }
        if(!req.cookies.user.token) {
            return res.json({Error: 'No_Type_User_Token.'})
        }
        let code = getToken.getoauthToken(req.cookies.user.token,req.cookies.user.id)
        oauth.getUser(code).then((data) => {
            if(banlist.indexOf(data.id) != -1) return res.json({Error: 'User_is_banned.',Why: why[data.id] })
            res.jsonp(data)
        }).catch((err) => {
            return res.status('404').json({Error: 'Error_to_get_data',Errors: err})
        })
});
let NsfwAD=new Set()
app.route('/api/adwrite')
    .post(function (req,res) {
        if(!req.cookies.user) {
            return res.json({Error: 'No_Type_User_Token.'})
        }
        if(!req.cookies.user.token) {
            return res.json({Error: 'No_Type_User_Token.'})
        }
        if(!req.body.url) {
            return res.json({Error: 'No_Type_URL.'})
        }
        if(req.body.url != "http://boo2.tw/") {
            return res.json({Error: 'Type_Wrong_URL.'})
        }
        let code = getToken.getoauthToken(req.cookies.user.token,req.cookies.user.id)
        oauth.getUser(code).then((data) => {
            NsfwAD.add(data.id)
            res.json({ok: true})
            deleteAD(data.id)
        }).catch((err) => {
            return res.status('404').json({Error: 'Error_to_get_data',Errors: err})
        })
});
app.route('/api/adget')
    .post(function (req,res) {
        if(!req.cookies.user) {
            return res.json({ok: false,Error: 'No_Type_User_Token.'})
        }
        if(!req.cookies.user.token) {
            return res.json({ok: false,Error: 'No_Type_User_Token.'})
        }
        let code = getToken.getoauthToken(req.cookies.user.token,req.cookies.user.id)
        oauth.getUser(code).then((data) => {
            if(NsfwAD.has(data.id)) {
                return res.json({ok: true})
            }else{
                return res.json({ok: false})
            }
        }).catch((err) => {
            return res.status('404').json({ok: false,Error: 'Error_to_get_data',Errors: err})
        })
});
function deleteAD(id) {
    setTimeout(() => {
        if(NsfwAD.has(id)) {
            NsfwAD.delete(id)
        }
    }, 10000);
}
app.route('/api/guild')
    .post(function (req,res) {
        if(!req.cookies.user) {
            return res.status(404).json({Error: 'No_Type_User_Token.'})
        }
        let code = getToken.getoauthToken(req.cookies.user.token,req.cookies.user.id)
        oauth.getUserGuilds(code).then((data) => {
            let gui = new Array()
            for (let i = 0; i < data.length; i++) {
                const gi = data[i];
                if((gi.permissions & 0x8) == 0x8) {
                gui.push(data[i])
            }
            if(i === data.length-1) {sendguild()}
        }
        function sendguild() {
        res.jsonp(gui)
        }
        }).catch((err) => {
            return res.status('404').json({Error: 'Error_to_get_data',Errors: err})
        })
});
app.get('/music', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    let warp = "music/list"
    if(req.cookies.language) {
        if(req.cookies.language.lang === "zh-TW") {res.status(302).render("./zh-TW/"+warp)}
        else if(req.cookies.language.lang === "en-US") {res.status(302).render("./en-US/"+warp)}
        else if(req.cookies.language.lang === "ja-JP") {res.status(302).render("./ja-JP/"+warp)}
        else{res.status(302).render("./zh-TW/"+warp)}
    }else{
    res.status(302).render("./zh-TW/"+warp)
    }
})
app.get('/login/picture/love', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    let warp = "/login/love"
    if(req.cookies.language) {
        if(req.cookies.language.lang === "zh-TW") {res.status(302).render("./zh-TW/"+warp)}
        else if(req.cookies.language.lang === "en-US") {res.status(302).render("./en-US/"+warp)}
        else if(req.cookies.language.lang === "ja-JP") {res.status(302).render("./ja-JP/"+warp)}
        else{res.status(302).render("./zh-TW/"+warp)}
    }else{
    res.status(302).render("./zh-TW/"+warp)
    }
})
app.post('/music/search', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    if(!req.body.server) {return res.redirect("/music")}
    else{res.redirect("/music/"+req.body.server)}
})
app.get('/music/:id', function (req, res) {
    if(cooldown(req.ip,req,res,client)) return;
    let id = req.params.id,warp = "music/server"
    if(!id) return res.redirect("/music")
    if(req.cookies.language) {
        if(req.cookies.language.lang === "zh-TW") {res.status(302).render("./zh-TW/"+warp)}
        else if(req.cookies.language.lang === "en-US") {res.status(302).render("./en-US/"+warp)}
        else if(req.cookies.language.lang === "ja-JP") {res.status(302).render("./ja-JP/"+warp)}
        else{res.status(302).render("./zh-TW/"+warp)}
    }else{
    res.status(302).render("./zh-TW/"+warp)
    }
})

app.route('/dashboard')
.get(function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
    let warp = "login/dash"
    if(req.cookies.language) {
        if(req.cookies.language.lang === "zh-TW") {res.status(302).render("./zh-TW/"+warp)}
        else if(req.cookies.language.lang === "en-US") {res.status(302).render("./en-US/"+warp)}
        else if(req.cookies.language.lang === "ja-JP") {res.status(302).render("./ja-JP/"+warp)}
        else{res.status(302).render("./zh-TW/"+warp)}
    }else{
    res.status(302).render("./zh-TW/"+warp)
    }
});
app.route('/dashboard/:id')
.get(function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
    let warp = "login/guild"
    if(req.cookies.language) {
        if(req.cookies.language.lang === "zh-TW") {res.status(302).render("./zh-TW/"+warp,{'id': req.params.id})}
        else if(req.cookies.language.lang === "en-US") {res.status(302).render("./en-US/"+warp,{'id': req.params.id})}
        else if(req.cookies.language.lang === "ja-JP") {res.status(302).render("./ja-JP/"+warp,{'id': req.params.id})}
        else{res.status(302).render("./zh-TW/"+warp),{'id': req.params.id}}
    }else{
    res.status(302).render("./zh-TW/"+warp,{'id': req.params.id})
    }
});
let Mongo = require("./function/MongoData")
app.route('/api/daily')
  .post(function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
      if(!req.cookies.user) {
          return res.status(404).json({Error: 'No_Type_User_Token.'})
      }
      let code = getToken.getoauthToken(req.cookies.user.token,req.cookies.user.id)
      oauth.getUser(code).then((data) => {
            loadUser(clientDB,data.id).then((user) => {
            if (user === false) return res.json({Error: 'Error_to_get_data1'})
            Mongo.loadDaily(clientDB).then((users) => {
                if(users === false) return res.json({Error: 'Error_to_get_data0'});
            if(users.daily.indexOf(data.id) != "-1") {return res.json({daily: false})}else{
            users.daily.push(data.id)
            Mongo.writeDaily(clientDB,users)
            let tody = 50
            user.work++
            let tod = new Date().getTime()
            user.worktoal = {time: user.worktoal.time,work: user.worktoal.work,top: user.worktoal.top}
            if(!isNaN(parseInt(user.worktoal.time))) {
            a=(tod - parseInt(user.worktoal.time))/(24*60*60*1000);a=Math.ceil(a*10)/10;
            if(a >= 1.5) user.worktoal.work = 0
            }else{
                user.worktoal.work = 0
            }
            let top = 0
            if(user.worktoal.top) {
                if((user.worktoal.work)+1 >= user.worktoal.top) {
                    top = (user.worktoal.work)+1
                }else{
                    top = user.worktoal.top
                }
            }
            user.worktoal = {time: tod ,work: (user.worktoal.work)+1,top: top}
            user.money = user.money + tody + ((user.worktoal.work)*5)
            if(user.adv.indexOf("daily") == "-1") {user.adv.push("daily")}
            setTimeout(() => {
                client.channels.cache.get("821025363513442345").send(`💰用戶 ${data.username} 在網站領了今天的薪水。`)
                writeUser(clientDB,data.id,user)
                return res.json({daily: true})
              }, 1000); 
          }
      }).catch((err) => {
          return res.status('404').json({Error: 'Error_to_get_data2',Errors: err})
      })
    })
})
});    
let imgaccess = new Set();

app.route('/api/picture')
.get(function(req,res) {
    if(cooldown(req.ip,req,res,client)) return;
    if(!req.cookies.user) return res.status(404).json({Error: "No_type_token"})
    if(!imgaccess.has(req.cookies.user.token)) return res.status(404).json({Error: "No_access_to_get_img"})
    let nsfw = ""
    if(req.query.nsfw === "true") nsfw = "/Nsfw"
    fs.readdir("../DiscordBot/pitrue/"+req.query.img+nsfw, (err, r) => {
        let f = req.query.file
        fs.access('/Users/ASUS/Desktop/DiscordBot/pitrue/'+req.query.img+nsfw+'/'+f,function(err) {
            if(err) {
                return res.json({"Error":"No_file_found."})
            }else{
                res.sendFile('/Users/ASUS/Desktop/DiscordBot/pitrue/'+req.query.img+nsfw+'/'+f);
                setTimeout(() => {
                 imgaccess.delete(req.cookies.user.token)}, 15000);
            }
        })
    })
})
  .post(function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
      if(!req.cookies.user) {
          return res.status(404).json({Error: 'No_Type_User_Token.'})}
          let code = getToken.getoauthToken(req.cookies.user.token,req.cookies.user.id)
          oauth.getUser(code).then((data) => {
        loadUser(clientDB,data.id).then((user) => {
            if (user === false)  return res.json({Error: 'Error_to_get_data1'})
            if(!user.money) return res.json({Error: 'Error_to_get_money'})
            if(!req.body.img) {
                return res.json({Error: 'No__Request_pictures.'})}
            let watchAD = false
            if(req.body.ad) {
                if(req.body.ok) {
                    if(req.body.url == "http://boo2.tw/") {
                        watchAD = true
                    }
                }
            }
            switch(req.body.img) {
                case "chino":
                    if(req.body.nsfw === "true") {
                    if(user.money < 35) return res.json("No_enough_money")
                    user.money = user.money - 35
                    imgaccess.add(req.cookies.user.token)
                    var nsfw = "",f= null;
                    if(req.body.nsfw === "true") nsfw = "/Nsfw"
                    fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                    if(err) {return res.json({"ok": false,"file": f,error: err})}
                    f = r[Math.floor(Math.random() * r.length)]
                    res.json({"ok": true,"file": f})
                    })
                    client.channels.cache.get("821025363513442345").send(`☕用戶🔞 ${data.username} 點了一隻成熟智乃。`)
                    if(!watchAD) writeUser(clientDB,data.id,user)
                    }else{
                    if(user.money < 25) return res.json("No_enough_money")
                    user.money = user.money - 25
                    imgaccess.add(req.cookies.user.token)
                    var nsfw = "",f= null;
                    if(req.body.nsfw === "true") nsfw = "/Nsfw"
                    fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                        if(err) {return res.json({"ok": false,"file": f,error: err})}
                        f = r[Math.floor(Math.random() * r.length)]
                        res.json({"ok": true,"file": f})
                    })
                    client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻普通智乃。`)
                    if(!watchAD) writeUser(clientDB,data.id,user)
                    }
                    break;
                case "cocoa":
                    if(req.body.nsfw === "true") {
                        if(user.money < 35) return res.json("No_enough_money")
                        user.money = user.money - 35
                        imgaccess.add(req.cookies.user.token)
                        var nsfw = "",f= null;
                        if(req.body.nsfw === "true") nsfw = "/Nsfw"
                        fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                            if(err) {return res.json({"ok": false,"file": f})}
                            f = r[Math.floor(Math.random() * r.length)]
                            res.json({"ok": true,"file": f})
                        })
                        client.channels.cache.get("821025363513442345").send(`☕用戶🔞 ${data.username} 點了一隻成熟心愛。`)
                        if(!watchAD) writeUser(clientDB,data.id,user)
                        }else{
                            if(user.money < 25) return res.json("No_enough_money")
                        user.money = user.money - 25
                        imgaccess.add(req.cookies.user.token)
                        var nsfw = "",f= null;
                        if(req.body.nsfw === "true") nsfw = "/Nsfw"
                        fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                            if(err) {return res.json({"ok": false,"file": f})}
                            f = r[Math.floor(Math.random() * r.length)]
                            res.json({"ok": true,"file": f})
                        })
                        client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻心愛。`)
                        if(!watchAD) writeUser(clientDB,data.id,user)
                        }
                    break;
                case "tippy":
                    if(user.money < 15) return res.json("No_enough_money")
                        user.money = user.money - 15
                        imgaccess.add(req.cookies.user.token)
                        var nsfw = "",f= null;
                        if(req.body.nsfw === "true") nsfw = "/Nsfw"
                        fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                            if(err) {return res.json({"ok": false,"file": f})}
                            f = r[Math.floor(Math.random() * r.length)]
                            res.json({"ok": true,"file": f})
                        })
                        client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻提比。`)
                        if(!watchAD) writeUser(clientDB,data.id,user)
                    break;
                case "other":
                    if(user.money < 35) return res.json("No_enough_money")
                    user.money = user.money - 35
                    imgaccess.add(req.cookies.user.token)
                    var nsfw = "",f= null;
                    if(req.body.nsfw === "true") nsfw = "/Nsfw"
                    fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                        if(err) {return res.json({"ok": false,"file": f})}
                        f = r[Math.floor(Math.random() * r.length)]
                        res.json({"ok": true,"file": f})
                    })
                    client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一包分享餐。`)
                    if(!watchAD) writeUser(clientDB,data.id,user)
                    break;
                case "Gawr":
                    if(req.body.nsfw === "true") {
                        if(user.money < 35) return res.json("No_enough_money")
                        user.money = user.money - 35
                        imgaccess.add(req.cookies.user.token)
                        var nsfw = "",f= null;
                        if(req.body.nsfw === "true") nsfw = "/Nsfw"
                        fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                            if(err) {return res.json({"ok": false,"file": f})}
                            f = r[Math.floor(Math.random() * r.length)]
                            res.json({"ok": true,"file": f})
                        })
                        client.channels.cache.get("821025363513442345").send(`☕用戶🔞 ${data.username} 點了一隻成熟鯊鯊 Gura。`)
                        if(!watchAD) writeUser(clientDB,data.id,user)
                        }else{
                        if(user.money < 25) return res.json("No_enough_money")
                        user.money = user.money - 25
                        imgaccess.add(req.cookies.user.token)
                        var nsfw = "",f= null;
                        if(req.body.nsfw === "true") nsfw = "/Nsfw"
                        fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                            if(err) {return res.json({"ok": false,"file": f})}
                            f = r[Math.floor(Math.random() * r.length)]
                            res.json({"ok": true,"file": f})
                        })
                        client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻普通鯊鯊 Gura。`)
                        if(!watchAD) writeUser(clientDB,data.id,user)
                        }
                    break;
                case "peko":
                    if(user.money < 25) return res.json("No_enough_money")
                    user.money = user.money - 25
                    imgaccess.add(req.cookies.user.token)
                    var nsfw = "",f= null;
                    if(req.body.nsfw === "true") nsfw = "/Nsfw"
                    fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                        if(err) {return res.json({"ok": false,"file": f})}
                        f = r[Math.floor(Math.random() * r.length)]
                        res.json({"ok": true,"file": f})
                    })
                    client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻兔子Pekora。`)
                    if(!watchAD) writeUser(clientDB,data.id,user)
                    break;
                case "fubuki":
                    if(req.body.nsfw === "true") {
                    if(user.money < 35) return res.json("No_enough_money")
                    user.money = user.money - 35
                    imgaccess.add(req.cookies.user.token)
                    var nsfw = "",f= null;
                    if(req.body.nsfw === "true") nsfw = "/Nsfw"
                    fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                        if(err) {return res.json({"ok": false,"file": f})}
                        f = r[Math.floor(Math.random() * r.length)]
                        res.json({"ok": true,"file": f})
                    })
                    client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻成熟白上狐狸Fubuki。`)
                    if(!watchAD) writeUser(clientDB,data.id,user)
                }else{
                    if(user.money < 25) return res.json("No_enough_money")
                    user.money = user.money - 25
                    imgaccess.add(req.cookies.user.token)
                    var nsfw = "",f= null;
                    if(req.body.nsfw === "true") nsfw = "/Nsfw"
                    fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                        if(err) {return res.json({"ok": false,"file": f})}
                        f = r[Math.floor(Math.random() * r.length)]
                        res.json({"ok": true,"file": f})
                    })
                    client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻普通白上狐狸 Fubuki。`)
                    writeUser(clientDB,data.id,user)
                    }
                    break;
                case "loli":
                    if(req.body.nsfw === "true") {
                    if(user.money < 35) return res.json("No_enough_money")
                    user.money = user.money - 35
                    imgaccess.add(req.cookies.user.token)
                    var nsfw = "",f= null;
                    if(req.body.nsfw === "true") nsfw = "/Nsfw"
                    fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                        if(err) {return res.json({"ok": false,"file": f})}
                        f = r[Math.floor(Math.random() * r.length)]
                        res.json({"ok": true,"file": f})
                    })
                    client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻成熟蘿莉 FBI!!。`)
                    if(!watchAD) writeUser(clientDB,data.id,user)
                }else{
                    if(user.money < 25) return res.json("No_enough_money")
                    user.money = user.money - 25
                    imgaccess.add(req.cookies.user.token)
                    var nsfw = "",f= null;
                    if(req.body.nsfw === "true") nsfw = "/Nsfw"
                    fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                        if(err) {return res.json({"ok": false,"file": f})}
                        f = r[Math.floor(Math.random() * r.length)]
                        res.json({"ok": true,"file": f})
                    })
                    client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻普通蘿莉。`)
                    if(!watchAD) writeUser(clientDB,data.id,user)
                    }
                    break;
                case "chen":
                    if(user.money < 25) return res.json("No_enough_money")
                    user.money = user.money - 25
                    imgaccess.add(req.cookies.user.token)
                    var nsfw = "",f= null;
                    if(req.body.nsfw === "true") nsfw = "/Nsfw"
                    fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                        if(err) {return res.json({"ok": false,"file": f})}
                        f = r[Math.floor(Math.random() * r.length)]
                        res.json({"ok": true,"file": f})
                    })
                    client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻(八雲)橙。`)
                    if(!watchAD) writeUser(clientDB,data.id,user)
                    break;
                case "vtuber":
                    if(user.money < 25) return res.json("No_enough_money")
                    user.money = user.money - 25
                    imgaccess.add(req.cookies.user.token)
                    var nsfw = "",f= null;
                    if(req.body.nsfw === "true") nsfw = "/Nsfw"
                    fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                        if(err) {return res.json({"ok": false,"file": f})}
                        f = r[Math.floor(Math.random() * r.length)]
                        res.json({"ok": true,"file": f})
                    })
                    client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻Vtuber。`)
                    if(!watchAD) writeUser(clientDB,data.id,user)
                    break;
                case "Nakkar":
                    if(user.money < 25) return res.json("No_enough_money")
                    user.money = user.money - 25
                    imgaccess.add(req.cookies.user.token)
                    var nsfw = "",f= null;
                    if(req.body.nsfw === "true") nsfw = "/Nsfw"
                    fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                        if(err) {return res.json({"ok": false,"file": f})}
                        f = r[Math.floor(Math.random() * r.length)]
                        res.json({"ok": true,"file": f})
                    })
                    client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻Nakkar。`)
                    if(!watchAD) writeUser(clientDB,data.id,user)
                    break;
                case "shota":
                    if(user.money < 25) return res.json("No_enough_money")
                    user.money = user.money - 25
                    imgaccess.add(req.cookies.user.token)
                    var nsfw = "",f= null;
                    if(req.body.nsfw === "true") nsfw = "/Nsfw"
                    fs.readdir("../DiscordBot/pitrue/"+req.body.img+nsfw, (err, r) => {
                        if(err) {return res.json({"ok": false,"file": f})}
                        f = r[Math.floor(Math.random() * r.length)]
                        res.json({"ok": true,"file": f})
                    })
                    client.channels.cache.get("821025363513442345").send(`☕用戶 ${data.username} 點了一隻正太。`)
                    if(!watchAD) writeUser(clientDB,data.id,user)
                    break;
                case "data":

                    break;
                default:
                    res.json({Error: "No_found_img."})
                    break;
            }
      })
      }).catch((err) => {
          return res.status('404').json({Error: 'Error_to_get_data2',Errors: err})
      })
})    
app.route('/api/user')
/*
   .get(function (req,res) {
       if(!req.query.uid) {
           return res.json({Error: 'No_Type_User_ID'})
       }
       let id = req.query.uid
       if(isNaN(id)) {
           return res.json({Error: 'No_Vaild_User_ID'})
       }
       console.log(id.length)
       if(id.length <17 || id.length >18) {
        return res.json({Error: 'No_Vaild_User_ID_2'})
       }
       fs.readFile('../users/'+id+".json", function(err, userInfo) {
        if (err) return res.json({Error: 'for_Get_Data'})
        var user = userInfo.toString()
        user = JSON.parse(user)
        res.jsonp(user)
       })
   })
   */
   .post(function (req,res) {
       if(!req.body.uid) {
           return res.status(404).json({Error: 'No_Type_User_ID'})
       }
       let id = req.body.uid
       if(isNaN(id)) {
           return res.status(404).json({Error: 'No_Vaild_User_ID'})
       }
       if(id.length <17 || id.length >18) {
        return res.status(404).json({Error: 'No_Vaild_User_ID_2'})
       }
       loadUser(clientDB,id).then((user) => {
        if (user === false) {
            let data = client.users.cache.get(id)
            let time = new Date().toDateString()
            if(!data) return res.status(404).json({Error: 'Error_to_create_database.'})
            var obj = {
                name: [data.username],
                user: {username: data.username,id: data.id ,avatar: data.avatar,locale: data.locale},
                guild: [],
                language: {},
                money: 0,
                usemoney: 0,
                rank: 0,
                guildrank: [],
                exp: 0,
                guildxep: [],
                marry: {},
                host: [],
                hostname: "",
                pet: [],
                petname: "",
                sex: {},
                age: {},
                chino: 0,
                cocoa: 0,
                tippy: 0,
                other: 0,
                work: 0,
                worktoal: { time: 0, work: 0 },
                picture: { love: [] },
                bank: 0,
                adv: [],
                role: [],
                item: [],
                bag: [],
                time: [time],
                ver: "6.1b(7/11)"
            };
            var myobj = [
                { "type": "user", "id": id, [id]: obj }
            ];
            let dbo = clientDB.db("mydb")
            dbo.collection("users").insertMany(myobj, function (err, res2) {
                if (err) return res.status(404).json({Error: 'Error_to_create_database.'})
                console.log("新用戶!!" + data.username)
                return res.json({obj})
            });
        }else{
        res.jsonp(user)    
        }
       })
})

let commandcooldown = new Set();
function delcmdcooldown (id) {
    commandcooldown.add(id)
    setTimeout(() => {
        commandcooldown.delete(id)
    }, 5000);
}

app.post('/api/guild/setting/:id',function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
    if(!req.cookies.user) return res.status(403).render("./api/close",{Error: "請登入再使用此指令."})
    let id = req.params.id,token = req.cookies.user.token
    if(commandcooldown.has(id)) return res.status(403).render("./api/close",{Error: "你按太快了!<br>請等幾秒後使用此指令."})
    delcmdcooldown(id)
    let guild = client.guilds.cache.get(id)
    if(!guild) {
        guild = client2.guilds.cache.get(id)
    }
    if(!guild) return res.status(403).render("./api/close",{Error: "未知伺服器."})
    let userid= req.body.userid
    if(!userid) return res.status(403).render("./api/close",{Error: "未知用戶."})
    let code = getToken.getoauthToken(token,req.cookies.user.id)
    oauth.getUser(code).then((w) => {
    if(userid != w.id) return res.status(403).render("./api/close",{Error: "憑證不符."}) 
    loadGuild(clientDB,guild.id).then((user) => {
        if (user == false) {
          return res.status(403).render("./api/close",{Error: "讀取伺服器資料庫發生錯誤."})
        }else{
            let post = req.body,lan2=user.language.lan,set = user.language.setting,nor2 = user.language.run
            if(!set) { set = {"snipe":null,"react":null,"safe":null,"prefix": prefix,"slash":null} }
            if(post.language === "繁體中文") {lan2 = "zh_TW"}else if(post.language === "English") {lan2 = "en_US"}
            if(post.detect === "智乃小幫手#5407") {nor2 = 1}else if(post.detect === "智乃小幫手2#5127") {nor2 = 2}
            if(post.snipe === "false") {set.snipe = false}else if(post.snipe === "true") {set.snipe = true}
            if(post.safe === "false") {set.safe = false}else if(post.safe === "true") {set.safe = true}
            if(post.react === "false") {set.react = false}else if(post.react === "true") {set.react = true}
            if(post.slash === "false") {set.slash = false}else if(post.slash === "true") {set.slash = true}
            user.language = {lan: lan2,run: nor2,setting: set}
            writeGuild(clientDB,guild.id,user)
            let send = `語言: ${post.language}<br>觸發: ${post.detect}<br>[snipe]: ${post.snipe}\n[safe]: ${post.safe}<br>[react]: ${post.react}<br>[slash]: ${post.slash}`
          return res.render('./api/join',{"text": send})
        }})})
})
app.post('/api/guild/join/test/:id',function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
    if(!req.cookies.user) return res.status(403).render("./api/close",{Error: "請登入再使用此指令."})
    let id = req.params.id,token = req.cookies.user.token
    if(commandcooldown.has(id)) return res.status(403).render("./api/close",{Error: "你按太快了!<br>請等幾秒後使用此指令."})
    delcmdcooldown(id)
    let guild = client.guilds.cache.get(id)
    if(!guild) {
        guild = client2.guilds.cache.get(id)
    }
    if(!guild) return res.status(403).render("./api/close",{Error: "未知伺服器."})
    let userid= req.body.userid
    if(!userid) return res.status(403).render("./api/close",{Error: "未知用戶."})
    let code = getToken.getoauthToken(token,req.cookies.user.id)
    oauth.getUser(code).then((w) => {
    if(userid != w.id) return res.status(403).render("./api/close",{Error: "憑證不符."}) 
    loadGuild(clientDB,guild.id).then((user) => {
        if (user == false) {
          return res.status(403).render("./api/close",{Error: "讀取伺服器資料庫發生錯誤."})
        }else{
          let channel= guild.channels.cache.get(user.join)
          if(!channel) return res.status(403).render("./api/close",{Error: "未填頻道."})
          let text = user.join2.join(" ")
          var send = "你現在可以查看該頻道是否有訊息! [預覽]:"+text.replace(`{member}` , + guild.memberCount + "").replace(`{user}` , " " + " [用戶] " + "").replace(`{server}` , " " + guild.name + "")
          channel.send("[網頁版測試] "+text.replace(`{member}` , + guild.memberCount + "").replace(`{user}` , " " + " [用戶] " + "").replace(`{server}` , " " + guild.name + ""))
          return res.render('./api/join',{"text": send})
        }})})
})
app.post('/api/guild/leave/test/:id',function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
    if(!req.cookies.user) return res.status(403).render("./api/close",{Error: "請登入再使用此指令."})
    let id = req.params.id,token = req.cookies.user.token
    if(commandcooldown.has(id)) return res.status(403).render("./api/close",{Error: "你按太快了!<br>請等幾秒後使用此指令."})
    delcmdcooldown(id)
    let guild = client.guilds.cache.get(id)
    if(!guild) {
        guild = client2.guilds.cache.get(id)
    }
    if(!guild) return res.status(403).render("./api/close",{Error: "未知伺服器."})
    let userid= req.body.userid
    if(!userid) return res.status(403).render("./api/close",{Error: "未知用戶."})
    oauth.getUser(token).then((w) => 
    {
    if(userid != w.id) return res.status(403).render("./api/close",{Error: "憑證不符."}) 
    loadGuild(clientDB,guild.id).then((user) => {
        if (user == false) {
          return res.status(403).render("./api/close",{Error: "讀取伺服器資料庫發生錯誤."})
        }else{
          let channel= guild.channels.cache.get(user.leave)
          if(!channel) return res.status(403).render("./api/close",{Error: "未填頻道."})
          let text = user.leave2.join(" ")
          var send = "你現在可以查看該頻道是否有訊息! [預覽]:"+text.replace(`{member}` , + guild.memberCount + "").replace(`{user}` , " " + " [用戶] " + "").replace(`{server}` , " " + guild.name + "")
          channel.send("[網頁版測試] "+text.replace(`{member}` , + guild.memberCount + "").replace(`{user}` , " " + " [用戶] " + "").replace(`{server}` , " " + guild.name + ""))
          return res.render('./api/join',{"text": send})
        }})})
})
app.route('/api/guild/join/setup/:id')
   .post(function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
       if(!req.cookies.user) return res.status(403).render("./api/close",{Error: "請登入再使用此指令."})
       let id = req.params.id,token = req.cookies.user.token
       if(commandcooldown.has(id)) return res.status(403).render("./api/close",{Error: "你按太快了!<br>請等幾秒後使用此指令."})
       delcmdcooldown(id)
       let guild = client.guilds.cache.get(id)
       if(!guild) {
        guild = client2.guilds.cache.get(id)
    }
       if(!guild) return res.status(403).render("./api/close",{Error: "未知伺服器."})
       let channel= guild.channels.cache.find(channel => channel.name == req.body.channel)
       if(!channel) return res.status(403).render("./api/close",{Error: "未知用戶."})
       if(new String(req.body.join).toLowerCase().includes('<script>')) return res.status(403).render("./api/close")
       if(new String(req.body.join).toLowerCase().includes('</script>')) return res.status(403).render("./api/close")
       if(new String(req.body.join).includes('%3Cscript%3E')) return res.status(403).render("./api/close")
       if(new String(req.body.join).toLowerCase().includes('<img')) return res.status(403).render("./api/close")
       let text = req.body.join
       if(typeof(text) !='string') return res.status(403).render("./api/close",{Error: "錯誤格式."})
       text = text.toString()
       let userid= req.body.userid
       if(!userid) return res.status(403).render("./api/close",{Error: "未知用戶"})
       let code = getToken.getoauthToken(token,req.cookies.user.id)
       oauth.getUser(code).then((w) => {
       if(userid != w.id) return res.status(403).render("./api/close",{Error: "憑證不符."}) 
       loadGuild(clientDB,guild.id).then((user) => {
        if (user == false) {
          return res.status(403).render("./api/close",{Error: "讀取伺服器資料庫發生錯誤."})
        }else{
          if(text === "" || text === null) {
            user.join = []
            user.join2 = []
            writeGuild(clientDB,guild.id,user)
            return res.render('./api/join',{"text": "已關閉加入功能"})
          }
          user.join = []
          user.join2 = []
          user.join = channel.id
          user.join2.push(text)
          writeGuild(clientDB,guild.id,user)
          var send = text.replace(`{member}` , + guild.memberCount + "").replace(`{user}` , " " + " [用戶] " + "").replace(`{server}` , " " + guild.name + "")
          return res.render('./api/join',{"text": send})
          }}) })
})
app.route('/api/guild/leave/setup/:id')
   .post(function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
       if(!req.cookies.user) return res.status(403).render("./api/close",{Error: "請登入再使用此指令."})
       let id = req.params.id,token = req.cookies.user.token
       if(commandcooldown.has(id)) return res.status(403).render("./api/close",{Error: "你按太快了!<br>請等幾秒後使用此指令."})
       delcmdcooldown(id)
       let guild = client.guilds.cache.get(id)
       if(!guild) {
        guild = client2.guilds.cache.get(id)
    }
       if(!guild) return res.status(403).render("./api/close",{Error: "未知伺服器."})
       let channel= guild.channels.cache.find(channel => channel.name == req.body.channel)
       if(!channel) return res.status(403).render("./api/close",{Error: "未填頻道."})
       if(new String(req.body.leave).toLowerCase().includes('<script>')) return res.status(403).render("./api/close")
       if(new String(req.body.leave).toLowerCase().includes('</script>')) return res.status(403).render("./api/close")
       if(new String(req.body.leave).includes('%3Cscript%3E')) return res.status(403).render("./api/close")
       if(new String(req.body.leave).toLowerCase().includes('<img')) return res.status(403).render("./api/close")
       let text = req.body.leave
       if(typeof(text) !='string') return res.status(403).render("./api/close",{Error: "錯誤格式."})
       text = text.toString()
       let userid= req.body.userid
       if(!userid) return res.status(403).render("./api/close",{Error: "未知用戶."})
       let code = getToken.getoauthToken(token,req.cookies.user.id)
       oauth.getUser(code).then((w) => {
       if(userid != w.id) return res.status(403).render("./api/close",{Error: "憑證不符."}) 
       loadGuild(clientDB,guild.id).then((user) => {
        if (user == false) {
          return res.status(403).render("./api/close",{Error: "讀取伺服器資料庫發生錯誤."})
        }else{
          if(text === "" || text === null) {
            user.leave = []
            user.leave2 = []
            writeGuild(clientDB,guild.id,user)
            return res.render('./api/join',{"text": "已關閉加入功能"})
          }
          user.leave = []
          user.leave2 = []
          user.leave = channel.id
          user.leave2.push(text)
          writeGuild(clientDB,guild.id,user)
          var send = text.replace(`{member}` , + guild.memberCount + "").replace(`{user}` , " " + " [用戶] " + "").replace(`{server}` , " " + guild.name + "")
          return res.render('./api/join',{"text": send})
          }})}) 
})
/*/
{
  token: 'z7d0OZOJaM7s9JukLEqAE6i5uCvbnx',
  channel: '測試區【test】',
  join: '{user} 歡迎你加入{server}!!!我們歡迎你uwu!'
}
/*/
app.route('/api/language/set')
   .post(async function (req,res) {
    if(!req.body.lang) return res.status(403).json({ok: false,Error:"No_type_language."})
    if(req.body.lang === "zh_TW") {
        res.cookie('language',{lang: "zh-TW"},{path: '/',signed: false,httpOnly: false})
        res.json({ok: true,message:"已設置為繁體中文"})
    }else  if(req.body.lang === "zh_CN") {
        res.cookie('language',{lang: "zh-CN"},{path: '/',signed: false,httpOnly: false})
        res.json({ok: true,message:"已设置为简体中文"})
    }else if(req.body.lang === "en_US") {
        res.cookie('language',{lang: "en-US"},{path: '/',signed: false,httpOnly: false})
        res.json({ok: true,message:"Has been set en_US"})
    }else if(req.body.lang === "ja_JP") {
        res.cookie('language',{lang: "ja-JP"},{path: '/',signed: false,httpOnly: false})
        res.json({ok: true,message:"日本語に設定"})
    }else{
        res.json({ok: false,message:"No_correct_language."})
    }
})

app.route('/api/guild/json')
   .post(async function (req,res) {
       let id = req.body.uid,goup = new Array()
       id= JSON.parse(id)
       id= id.id
       for (let i = 0; i < id.length; i++) {
           const guild = id[i];
           if(isNaN(guild)) {
            return res.status(404).json({Error: 'No_Vaild_Guild_ID'})
        }
        if(guild.length <17 || guild.length >18) {
         return res.status(404).json({Error: 'No_Vaild_Guild_ID_2'})
        }
        await loadGuild(clientDB,guild).then(async(user) => {
            if (user === false) {
                return goup.push({"Error": true,"Error2":"No_Found_Data.","id": guild})
            }
            goup.push({"Error": false,"Data": user,"id": guild})
           })
           if(i === id.length-1) sendguildJson()
       }
       function sendguildJson() {
        res.jsonp(goup)
       }
})

app.route('/api/guild/channel')
   .post(function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
       if(!req.body.uid) {
           return res.status(404).json({Error: 'No_Type_Guild_ID'})
       }
       let id = req.body.uid
       if(isNaN(id)) {
           return res.status(404).json({Error: 'No_Vaild_Guild_ID'})
       }
       if(id.length <17 || id.length >18) {
        return res.status(404).json({Error: 'No_Vaild_Guild_ID_2'})
       }
       let guild= client.guilds.cache.get(id)
       let client3 = client
       if(!guild) {
        guild = client2.guilds.cache.get(id)
        client3=client2
    }
       if(!guild) return res.status(404).json({Error: 'No_Fond_Sever'})
       let channel= guild.channels.cache.array()
       for (let i = 0; i < channel.length; i++) {
           const ch = channel[i];
           if(!ch.permissionsFor(client3.user).has("SEND_MESSAGES")) channel.remove(ch[i])
           if(i === channel.length-1) sendchannel()
       }
       function sendchannel() {
        res.jsonp(channel)
       }
})
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
      this.splice(index, 1);
    }
};
// ============================================================================
// START THE SERVER
app.route("/*")
.get(ipBlock,function (req,res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.status(404);
    res.redirect("/404")
})
.post(ipBlock,function(req,res) {
    if(cooldown(req.ip,req,res,client)) return;
    res.status(404);
    res.redirect("/404")
})

var httpsServer = https.createServer(credentials, app)
httpsServer.listen(443);

client.on('ready',() => {
    let day= new Date()
    console.log(`[${day.toDateString()}]`+'Start on port ' + port+"\nIP:" +IP)
    setInterval(() => {
        let timer = new Date()
            fetch.default('https://api.my-ip.io/ip.json', 
            {method: 'GET',
            }).then(async(data) => {
             return data.json()
            }).then((data2) => {
                ipv = data2.type
                IP = data2.ip
                update(IP)
                //update2()
            })
      }, 7200000);
})

// ============================================================================
/*
var args = require('minimist')(process.argv.slice(2));
console.log(args);*/

function dcbot(req,res,ip) {
    client.channels.cache.get("821025363513442345").send(`⚠IP ${ip} 有ddos的嫌疑.‼`)
}
let ipv = null
fetch.default('https://api.my-ip.io/ip.json', 
{method: 'GET',
}).then(async(data) => {
 return data.json()
}).then((data2) => {
    ipv = data2.type
    IP = data2.ip
    update(IP)
    //update2()
})

let update = require("./function/updateDNS");
const { platform } = require('os');

clientDB.on('close', function() {
    clientDB.close(err => {
      clientDB.connect(err => {
        console.log("[MangoDB] 重新連接成功")
});
})});

client.login(token).then(() => {
    client2.login(token2);})
