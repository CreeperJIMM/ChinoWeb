const SocketServer = require("ws").Server;
var port = process.env.PORT || 4434;
let getToken = require("../function/getToken");
const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2();
module.exports = function (app) {
  const server = app.listen(port);
  const wss = new SocketServer({ server });
  //當 WebSocket 從外部連結時執行
  let hasMusicBot = false
  let MusicBot = "",
  usersay = {};
  wss.on("connection", function (ws, req) {
    let close = false;
    let user = null,
    isMusic = false;
    let datas = null;
      id = "";
    if (req.url === "/api/ws/music") {
      if (!req.headers["sec-websocket-protocol"]) {
        return ws.close();
      }
      id = req.headers["sec-websocket-protocol"];
      if (!req.headers.cookie) {
        return playing();
      }
      let token = getcookiecode(ws, req);
      if (!token) return playing();
      try {
        token = JSON.parse([token]);
      } catch (error) {
        return playing();
      }
      if (!token.token) return playing();
      let code = getToken.getoauthToken(token.token, token.id);
      oauth.getUser(code)
        .then((data) => {
          user = data;
          playing();
        })
        .catch((err) => {
          ws.send(err);
          playing();
        });
        let TestTime2 = 0,lasttime = 0
        let Pinger = setInterval(() => {
          ws.send(JSON.stringify({ type: "ping",type2:"pingUserTest",time: new Date().getTime(),ms: lasttime}))
          getping()
          function getping() {
              //console.log(MusicBot)
                if (!usersay.data && !usersay.data.type2) {
                  if (TestTime2 >= 4) {
                     return ws.close()
                  }
                  setTimeout(() => {
                    getping();
                  }, 200);
                  TestTime2++;
                } else {
                    lasttime = (usersay.time - usersay.data.time)
                    TestTime2 = 0
                }
              }
          if (close) return clearInterval(Pinger);
        },10000)  
    } else if (req.url === "/musicbot") {
      //if(req.headers.host === "localhost:4434") {
      if (ws.protocol === "BOT") {
        hasMusicBot = true
        isMusic = true
        ws.send(JSON.stringify({ type: "text", ok: true, message: "ok" }));
      } else {
        ws.send(JSON.stringify({ type: "text", ok: false, message: "Close." }));
        return ws.close();
      }
    }
    let TESTtime = 0;
    function playing(data) {
      let Timer = setInterval(() => {
        wss.clients.forEach((client) => {
          if (client.protocol === "BOT") {
            client.send(JSON.stringify({type: "command",ok: true,cmd: "getList",id: id}));
            if(datas) datas = "Load";
          }
          getsong(client);
        });
        function getsong(client) {
        //console.log(MusicBot)
          if (!MusicBot.list || id != MusicBot.id) {
            if (TESTtime >= 5) {
            if(TESTtime === 6) client.send(JSON.stringify({type: "command",ok: true,cmd: "getList",id: id}));
            if (TESTtime >= 9) {
                return (datas = "Load");
            }}
            setTimeout(() => {
              getsong(client);
            }, 100);
            TESTtime++;
          } else {
            TESTtime = 0;
            datas = MusicBot
          }
        }
        setTimeout(() => {
          //console.log(datas)
          if (datas === null || !hasMusicBot) {
            ws.send(
              JSON.stringify({
                type: "error",
                ok: false,
                Error: "Not_Found_Music_Bot",
                message: "連不上音樂機器人.",
              })
            );
            return ws.close();
          }
          if (datas === "Load") {
            ws.send(
              JSON.stringify({
                type: "error",
                ok: false,
                Error: "Server_Not_Playing_Music",
                message: "此伺服器沒有播放音樂.",
              })
            );
            return ws.close();
          } else {
            ws.send(
              JSON.stringify({ type: "data", ok: true, data: datas.list })
            );
          }
        }, 1000);
        if (close) return clearInterval(Timer);
      }, 2000);
      ///////////////
    }
    let busyWS = 0;
    //連結時執行此 console 提示
    console.log("[WS] Client connected. " + req.url);

    ws.on("message", data => {
      //data 為 Client 發送的訊息，現在將訊息原封不動發送出去
      if (req.url === "/api/ws/music") {
        let datas = JSON.parse(data);
        usersay = {data:datas,time: new Date().getTime()}

        if (busyWS >= 4) {
          ws.send(
            JSON.stringify({
              type: "error",
              ok: false,
              Error: "DDoS_protection",
              message: "你輸入太多東西到伺服器端了!<br>請重整一次.",
            })
          );
          return ws.close();
        }
        if(datas.type != "ping") {
        busyWS = busyWS + 1;
        }
        if (datas.type === "command") {
          wss.clients.forEach((client) => {
            if (client.protocol === "BOT") {
              let loop = datas.loop;
              client.send(
                JSON.stringify({
                  type: "command",
                  ok: true,
                  cmd: datas.cmd,
                  loop: loop,
                  id: datas.id,
                  dj: user.id,
                })
              );
              let Times = setInterval(() => {
                if (MusicBot.type) {
                  if (MusicBot.type === "Runcommand") {
                    setTimeout(() => {
                      busyWS = busyWS - 1;
                    }, 200);
                    ws.send(JSON.stringify(MusicBot));
                    clearInterval(Times);
                  }
                }
              }, 50);
            }
          });
        }
      } else if (req.url === "/musicbot") {
        let datas = JSON.parse(data);
        MusicBot = datas;
      }
    });
    //當 WebSocket 的連線關閉時執行
    ws.on("close", () => {
    if(isMusic === true) {
        hasMusicBot = false;
        console.log("Music Close connected");
    }else{
      close = true;
      console.log("Close connected");
    }
    });
  });
};

function getcookiecode(ws, req) {
  let token = "";
  var name = "user=";
  var ca = req.headers.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1);
    if (c.indexOf(name) == 0) token = c.substring(name.length, c.length);
  }
  token = decodeURIComponent(JSON.stringify(token));
  token = token.replace(`"j:`, "");
  token = token.slice(0, token.length - 1);
  return token;
}
