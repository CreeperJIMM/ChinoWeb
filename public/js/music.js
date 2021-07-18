//使用 WebSocket 的網址向 Server 開啟連結
let url = new URL(document.URL)

let id = document.URL.replace("https://dckabicord.com/music/","")
let ws = new WebSocket(`wss://${url.hostname}:/api/ws/music`,id)
let busy = 0;
//開啟後執行的動作，指定一個 function 會在連結 WebSocket 後執行
let closeH = false,timH = false;

ws.onopen = () => {
    console.log('open connection')
}
(async() => {
var word = await getData()
if(word.Error) {
    document.getElementById('ctrl').innerHTML = "(登入獲取最佳體驗)"
    document.getElementById('Addtext').innerHTML = ""
}
})()
//關閉後執行的動作，指定一個 function 會在連結中斷後執行
ws.onclose = () => {
    closeH = true
    document.getElementById('player').innerHTML = ""
    document.getElementById('img').innerHTML = ""
    document.getElementById('Addtext').innerHTML = ""
    console.log('close connection')
}
let nowdata = {};

function text(text) {
    document.getElementById('text').innerHTML = text
    setTimeout(() => {
        document.getElementById('text').innerHTML = ""
    }, 1500);
}

function pauseB() {
    if(busy >= 1) return text("太快了! 慢一點!")
    busy = busy+1
    if(nowdata.playing) {
        document.getElementById('pause').innerHTML = "▶"
        ws.send(JSON.stringify({type:"command",cmd:"pause",id: id}))
        console.log("Pause...")
        setTimeout(() => {busy = busy-1;}, 1000);
        
    }else{
        document.getElementById('pause').innerHTML = "⏸"
        ws.send(JSON.stringify({type:"command",cmd:"pause",id: id}))
        console.log("Play...")
        setTimeout(() => {busy = busy-1;}, 1000);
    }
}
function loopB() {
    if(busy >= 1) return text("太快了! 慢一點!")
    busy = busy+1
    if(nowdata.loop === "single") {
        document.getElementById('loop').innerHTML = "🔁"
        ws.send(JSON.stringify({type:"command",cmd:"loop",loop: "all",id: id}))
    }else if(nowdata.loop === "all") {
        document.getElementById('loop').innerHTML = "➡"
        ws.send(JSON.stringify({type:"command",cmd:"loop",loop: false,id: id}))
    }else if(nowdata.loop === false) {
        document.getElementById('loop').innerHTML = "🔂"
        ws.send(JSON.stringify({type:"command",cmd:"loop",loop: "single",id: id}))
    }
    setTimeout(() => {busy = busy-1;}, 900);
}
function skipB() {
    if(busy >= 1) return text("太快了! 慢一點!")
    busy = busy+1
        ws.send(JSON.stringify({type:"command",cmd:"skip",id: id}))
        console.log("Skip...")
        setTimeout(() => {busy = busy-1;}, 1000);
}
ws.onerror = err => {
    document.getElementById('title').innerHTML = "連接發生錯誤.<br>請重新整理一次!"
    document.getElementById('player').innerHTML = ""
}

ws.onmessage = event => {
    let data = JSON.parse(event.data)
    if(data.type === "error") {
        if(data.Error === "Not_Found_Music_Bot") {
            document.getElementById('title').innerHTML = data.message
            document.getElementById('player').innerHTML = ""
        }else if(data.Error === "Server_Not_Playing_Music") {
            document.getElementById('title').innerHTML = data.message
            document.getElementById('player').innerHTML = ""
        }
    }else if(data.type === "Runcommand") {
        document.getElementById('text').innerHTML = data.message
        setTimeout(() => {
            document.getElementById('text').innerHTML = ""
        }, 1500);
    }else if(data.List) {
        return;
    }else{
        nowdata = data.data
        playing(data.data)}
}
function playing(data) {
    timH = true
    document.getElementById('title').innerHTML = `<img src= ${data.guild.iconURL} width="30px" height="30px"> 在 ${data.guild.name} 播放中`
    let seek = data.seek,song = data.song
    let timeshow = `${Math.floor(seek/60)}:${Math.floor((seek - Math.floor(seek/60)*60) -1)}`
    let timeshow2 = `${Math.floor(song.time/60)}:${(song.time - Math.floor(song.time/60)*60) -1}`
    let timer = (seek/song.time)*100
    document.getElementById('img').innerHTML =`<img src="${data.song.thumbnail}" width="220px" height=auto>`
    document.getElementById('player').innerHTML = `
    <h3 id="songtitle"><a href="${data.song.url}">${data.song.title}</a></h3>
    <div class="progress" id="time" style="">
<div class="progress-bar" id="timeP" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: ${timer}%;">
</div></div>[${timeshow}/${timeshow2}]
    ` 
    let t = 1
    if(data.loop === "single") {        
        document.getElementById('loop').innerHTML = "🔂"
    }else if(data.loop === "all") {
        document.getElementById('loop').innerHTML = "🔁"    
    }else if(data.loop === false) {
        document.getElementById('loop').innerHTML = "➡"}
    if(!data.playing) {return document.getElementById('pause').innerHTML = "⏸";}else{document.getElementById('pause').innerHTML = "▶"}
    let timer2 = setInterval(() => {
        if(t === 1) {
            if(!timH) return clearInterval(timer2)
        }
        if(t >= 4) clearInterval(timer2)
        if(closeH) return clearInterval(timer2)
        addTime(t)
        t =t+1
    }, 1000);
    function addTime(i) {
        i = parseInt(i)
    if(!timH) {return document.getElementById('player').innerHTML = ""}
    if(closeH) {return document.getElementById('player').innerHTML = ""}
    timeshow = `${Math.floor(seek/60)}:${Math.floor((seek - Math.floor(seek/60)*60) -1)+i}`
    timeshow2 = `${Math.floor(song.time/60)}:${(song.time - Math.floor(song.time/60)*60) -1}`
    document.getElementById('player').innerHTML = `
    <h3 id="songtitle"><a href="${data.song.url}">${data.song.title}</a></h3>
    <div class="progress" id="time" style="">
<div class="progress-bar" id="timeP" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: ${timer}%;">
</div></div>[${timeshow}/${timeshow2}]
    ` 
}
}

$(document).ready(function(){
    $('#addsong').submit(function(e){
        if(busy >= 1) {
            document.getElementById('Addtext').innerHTML = `      
            <input type="text" name="song"  placeholder="請在此新增歌曲" autocomplete="off" style="width:auto;"> <button type="submit" style="height: 40px; width: 50px;">新增</button>`
            return text("太快了! 慢一點!") }
            busy = busy+1
        e.preventDefault();
        var form = $(this);
        let d = form.serialize().replace("song=","")
        ws.send(JSON.stringify({type:"command",cmd:"addsong",loop: d,id: id}))
        document.getElementById('Addtext').innerHTML = `      
        <input type="text" name="song"  placeholder="請在此新增歌曲" autocomplete="off" style="width:auto;"> <button type="submit" style="height: 40px; width: 50px;">新增</button>`
        setTimeout(() => {busy = busy-1}, 1000);
    })
});