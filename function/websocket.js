const SocketServer = require('ws').Server
var port = process.env.PORT || 4434;

module.exports = function(app) {
const server = app.listen(port)
const wss = new SocketServer({ server })
//當 WebSocket 從外部連結時執行
let MusicBot = ""
wss.on('connection', function(ws, req) {
    let token = ""
    let close = false
    let user = null,id = ""
    if(req.url === "/api/ws/music") {
        var name = "user=";
        if(!req.headers['sec-websocket-protocol']) {
            return ws.close()
        }
        id =req.headers['sec-websocket-protocol']
        if(!req.headers.cookie) {
            return playing()
        }
        var ca = req.headers.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) token = c.substring(name.length,c.length);
        }
         token = decodeURIComponent(JSON.stringify(token))
         token = token.replace(`"j:`,"")
         token = token.slice(0,token.length-1)
         if(!token) return playing()
         try {
           token = JSON.parse([token])  
         } catch (error) {return playing()}
      if(!token.token) return playing()
      let code = getToken.getoauthToken(token.token,token.id)
      oauth.getUser(code).then((data) => {
        user = data
        let datas = null
        wss.clients.forEach(client => {
            if(client.protocol === "BOT") {
                client.send(JSON.stringify({type:"command",ok:true,cmd:"getList",id: id}))
                datas = "Load"
        }})
        let Times = setInterval(() => {
            if(MusicBot.list) {
                if(MusicBot.id === id) {
                    datas = MusicBot
                    clearInterval(Times)
                }
            }
        }, 20);
        setTimeout(() => {
        if(datas === null) {
            ws.send(JSON.stringify({type:"error",ok:false,Error: "Not_Found_Music_Bot",message: "連不上音樂機器人."}))
            return ws.close()
        }
        if(!datas) return;
        if(datas === "Load") {
            ws.send(JSON.stringify({type:"error",ok:false,Error: "Server_Not_Playing_Music",message: "此伺服器沒有播放音樂."}))
            return ws.close()
        }else{
            playing(datas.list)
        }
        }, 1200);
    }).catch((err) => {
        ws.send(err)
        playing()
    })
    }else if(req.url === "/musicbot") {
        if(req.headers.host === "localhost:4434") {
            ws.send(JSON.stringify({type:"text",ok:true,message: "ok"}))
        }else{
            return ws.close()
        }
    }
    function playing(data) {
        if(data) {
        ws.send(JSON.stringify({type:"data",ok:true,data: data})) }
        let Timer = setInterval(() => {
            let datas = null
            wss.clients.forEach(client => {
                if(client.protocol === "BOT") {
                    client.send(JSON.stringify({type:"command",ok:true,cmd:"getList",id: id}))
                    datas = "Load"
            }})
            let Times = setInterval(() => {
                if(MusicBot.list) {
                    if(MusicBot.id === id) {
                        datas = MusicBot
                        clearInterval(Times)
                    }
                }
            }, 50);
        setTimeout(() => {
            //console.log(datas)
            if(datas === null) {
                ws.send(JSON.stringify({type:"error",ok:false,Error: "Not_Found_Music_Bot",message: "連不上音樂機器人."}))
                return ws.close()
            }
            if(datas === "Load") {
                ws.send(JSON.stringify({type:"error",ok:false,Error: "Server_Not_Playing_Music",message: "此伺服器沒有播放音樂."}))
                return ws.close()
            }else{
            ws.send(JSON.stringify({type:"data",ok:true,data: datas.list}))}
            }, 1000);
            if(close) return clearInterval(Timer)
        }, 5000);
    }
    let busyWS = 0;
    //連結時執行此 console 提示
    console.log('[WS] Client connected. '+req.url)

    ws.on('message', data => {
    //data 為 Client 發送的訊息，現在將訊息原封不動發送出去
    if(req.url === "/api/ws/music") {
        let datas = JSON.parse(data)
        if(busyWS >= 4) {
            ws.send(JSON.stringify({type:"error",ok:false,Error: "DDoS_protection",message: "你輸入太多東西到伺服器端了!<br>請重整一次."}))
            return ws.close()
        }
        busyWS = busyWS+1
        if(datas.type === "command") {
        wss.clients.forEach(client => {
            if(client.protocol === "BOT") {
            let loop = datas.loop
        client.send(JSON.stringify({type:"command",ok:true,cmd: datas.cmd,loop: loop,id: datas.id,dj: user.id}))
        let Times = setInterval(() => {
            if(MusicBot.type) {
                if(MusicBot.type === "Runcommand") {
                    setTimeout(() => {busyWS = busyWS-1 }, 200);
                    ws.send(JSON.stringify(MusicBot))
                    clearInterval(Times)
                }
            }
        }, 50);
        }})
        }
    }else if(req.url === "/musicbot") {
        let datas = JSON.parse(data)
        MusicBot = datas
    }
});
//當 WebSocket 的連線關閉時執行
ws.on('close', () => {
        close = true
        console.log('Close connected')
    })
})
}
