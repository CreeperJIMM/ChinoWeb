let cooldowns = new Set();
let quest = 0;
module.exports = function (ip, req, res, client) {
  if (cooldowns.has(ip)) {
    dcbot(req, res, ip, client);
    let day = new Date();
    console.log(`[${day.toDateString()}] IP ${ip} 重複請求過多次。`);
    res.sendStatus(429);
    return true;
  } else {
    if (root(req, res)) return true;
    quest++;
    console.log(quest);
    cooldowns.add(ip);
    setTimeout(() => {
      cooldowns.delete(ip);
      quest - 1;
    }, 30);
  }
};
setInterval(() => {
  if (quest != 0) {
    quest = quest - 1;
  }
  if (quest > 8) {
    isDDos();
  }
}, 500);

function dcbot(req, res, ip, client) {
  client.channels.cache
    .get("821025363513442345")
    .send(`⚠IP ${ip} 有ddos的嫌疑.‼`);
}
let ddostimes = 0;
function isDDos() {
  if (ddostimes >= 8) return process.exit(0);
}
let docs = require("../URL/docs");
let newWeb = require("../URL/new");
function root(req, res) {
  if(!req.hostname) {
    res.status(502)
    return true;
  }
  let path = req.path
  console.log(req.path)
  if(!req.path) path = "/"+req.path
  if (req.hostname.startsWith("docs")) {
    docs(req, res);
    return true;
  } else if(req.hostname.startsWith("www")) {
    res.status(302).redirect("https://"+req.hostname.replace("www.","")+path)
    return true;
  } else if(req.hostname.startsWith("m")) {
    res.status(302).redirect("https://"+req.hostname.replace("m.","")+path)
    return true;
  } else if(req.hostname.startsWith("creeper")) {
    res.sendFile("C:/Users/ASUS/Desktop/web/html/teachme.html")
    return true;
  } else if(req.hostname.startsWith("api")) {
    res.status(502).json({Error:"This root does not exit."})
    return true;
  } else if(req.hostname.startsWith("new")) {
    newWeb(req, res);
    return true;
  }else{
    return false;    
  }
}
