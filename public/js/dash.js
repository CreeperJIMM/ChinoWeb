async function switchurl(url) {
    await fetch(url).then((req) => {
       return req.text()
    }).then((data) => {
    document.getElementById("guild").innerHTML = data
    })
}
(async() => {
    var word = await getData()
    var guild = await getGuild()
    let guilds = new Array(),gis = new Array();
    let url = new URL(document.URL)
    url.searchParams.get('code')
    if(url.searchParams.get('code') != null) {
        window.location.href='/login/signin';
    }
    if(!word) {
        window.location.href='/login/discord';}
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
    document.getElementById('hi').innerHTML = await word.username+"我們又見面惹:)"
    document.getElementById('guilds').innerHTML = await guilds.join("<br>")
 })()
 let menuset = 0
$(document).ready(function(){
    $('#guildmenu').click(function(){
    if(menuset === 0) {
    menuset = 1
    navigator.vibrate(60);
    document.getElementById('guildmenu').innerHTML = '▶'
  $("#guildmenu").animate({top:'91%'});
  $(".servers").animate({left: '-70px'})
    }else if(menuset = 1) {
       menuset = 0
       navigator.vibrate(60);
       document.getElementById('guildmenu').innerHTML = '◀'
 $("#guildmenu").animate({top:'150px'});
  $(".servers").animate({left: '0px'})
    }
});
})