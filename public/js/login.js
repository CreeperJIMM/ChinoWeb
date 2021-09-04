async function switchurl(url) {
    await fetch(url).then((req) => {
       return req.text()
    }).then((data) => {
    document.getElementById("guild").innerHTML = data
    })
}
(async() => {
    if(opener) {
        if(opener.window) {
            if(opener.window.parent) {
        opener.window.parent.location.href = "/login/signin"
        setTimeout(() => {
            window.close()            
        }, 500);
    }}}
    var word = await getData()
    var guild = await getGuild()
    let guilds = new Array(),gis = new Array();
    let url = new URL(document.URL)
    url.searchParams.get('code')
    if(url.searchParams.get('code') != null) {
        window.location.href='/login/signin';
    }
    if(!word) {
        window.location.href='/login/discord';
    }
    for (let i = 0; i < guild.length; i++) {
        const gi = guild[i];
        if((gi.permissions & 0x8) == 0x8) {
            if(i >= guild.length) {
                done()}
                gis.push(gi.id)}
    }
        let ans= await getGuilds(gis)
        for (let i = 0; i < ans.length; i++) {
            const ans2 = ans[i]
        if(ans2.Error == false) {
            let gi = ans2
            for (let i = 0; i < guild.length; i++) {
                const gis = guild[i];
                if(gi.id == gis.id) {
            guilds.push(`<a href="" onclick="history.pushState(null,null,'/dashboard/${gis.id}');"><img id="${gis.id}" border="0" style="margin-top: -5px; margin-left: -35px;" src="https://cdn.discordapp.com/icons/${gis.id}/${gis.icon}" title="${gis.name}" width="50" height="50" alien="rig"></a>`)
                }
        }}
        }
    guilds.push(`<a href="/nofondguild"><img id="Noguild" border="0" style="margin-top: -5px; margin-left: -35px;" src="/img/imgs/noguild.jpg" title="找不到想要的伺服器嗎?" width="50" height="50" alien="rig"></a>`)
    document.getElementById('guilds').innerHTML = await guilds.join("<br>")
    let user8 = await getUser(word.id);
    let save = ""
    if(!user8) return window.location.href='/login/discord';
    user8.picture.love.forEach(element => {
        save = save+element.file+"<br>"
    });
    document.getElementById('hi').innerHTML = await word.username+"我們又見面惹:)"
    document.getElementById('myself').innerHTML = await `<a href="/login/signin/" onclick="del();return false" ><img id="user_avatar" border="0" style="margin-top: -5px; margin-left: -35px;" src="https://cdn.discordapp.com/avatars/${word.id}/${word.avatar}" title="${word.username}" width="50" height="50" alien="rig"></a><br><a href="/cmd" onclick="" ><img id="user_avatar" border="0" style="margin-top: -5px; margin-left: -35px;" src="/img/chinocmd.jpg" title="智乃小幫手" width="50" height="50" alien="rig"></a>`
    document.getElementById('money').innerHTML = await "你的金錢: "+ user8.money;
    document.getElementById('level').innerHTML = await `<br><div id="hightline" style="background-color: rgba(0, 0, 0, 0.645);width: 80%;margin:0px auto;color: white">你的等級/經驗值: `+ `Rank ${user8.rank} | Exp: ${user8.exp}  <br>[你還需要 ${((1000+50*user8.rank) - user8.exp)} exp升下一等]</div><br>`;
    document.getElementById('host').innerHTML =  "👨‍👦你的主人: <br>"+ await user8.hostname.replaceAll("\n","<br>");document.getElementById('pet').innerHTML =  "🐶你的寵物: <br>"+ await user8.petname.replaceAll("\n","<br>")
    document.getElementById('work').innerHTML = await "你已經工作了 "+ user8.work+"次<br>並連續工作 "+user8.worktoal.work+"次";
    document.getElementById('piture').innerHTML = await "🧤[互動次數]<br>智乃: "+user8.chino+`次<br>心愛: ${user8.cocoa}次<br>提比: ${user8.tippy}次<br>其他(包括VT): ${user8.other}`
    document.getElementById('piture2').innerHTML = await "🖼[圖庫紀錄]<br>💖<a href='/login/picture/love'>已收藏:</a><br> "+save
    document.getElementById('worktime').innerHTML = await "首次工作 "+user8.time[0]
 })()
 
 let menuset = 0
$(document).ready(function(){
    $('#guildmenu').click(function(){
    if(menuset === 0) {
    menuset = 1
    document.getElementById('guildmenu').innerHTML = '▶'
  $("#guildmenu").animate({top:'91%'});
  $(".servers").animate({left: '-70px'})
    }else if(menuset = 1) {
       menuset = 0
       document.getElementById('guildmenu').innerHTML = '◀'
 $("#guildmenu").animate({top:'150px'});
  $(".servers").animate({left: '0px'})
    }
});
})