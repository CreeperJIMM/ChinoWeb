async function switchurl(url,id) {
    $("body").css("cursor", "progress");
    history.pushState(null,null,`/dashboard/${id}`)

    document.getElementById('loading').innerHTML = '<img src="https://i.imgur.com/Wgja5Fw.gif"  width="80" height="80" alt="讀取中"></img>'
    guildset().then(() => {
        $("body").css("cursor", "default");
        document.getElementById('loading').innerHTML = ''
    })
}
async function guildset() {
    var word = await getData()
    var guild = await getGuild()
    let guilds = new Array(),that = false,gis = new Array();
    let url = new URL(document.URL)
    var ids = url.pathname.replace("/dashboard/","")
    for (let i = 0; i < guild.length; i++) {
        const gi = guild[i];
        if((gi.permissions & 0x8) == 0x8) {
            if(i == guild.length) {
                done()}
                gis.push(gi.id)}
    }
    let ans= await getGuilds(gis)
    let lans = "預設(繁體中文)",detc=1,detc2="(預設)智乃小幫手#5407"
    for (let i = 0; i < ans.length; i++) {
        const ans2 = ans[i]
    if(ans2.Error == false) {
        let gi = ans2
        for (let i = 0; i < guild.length; i++) {
            const gis = guild[i];
            if(gi.id == gis.id) {
        guilds.push(`<a href="#" onclick="switchurl('/dashboard/${gis.id}','${gis.id}');"><img id="${gis.id}" border="0" style="margin-top: -5px; margin-left: -35px;" src="https://cdn.discordapp.com/icons/${gis.id}/${gis.icon}" title="${gis.name}" width="50" height="50" alien="rig"></a>`)
    }}}}
    for (let i = 0; i < ans.length; i++) {
        const ans2 = ans[i]
    if(ans2.Error == false) {
        let gi = ans2
        for (let i = 0; i < guild.length; i++) {
            const gis = guild[i];
            if(ans2.id === gis.id) {
            if(gis.id == ids) {
                ans = gi.Data
            that = true
            let snipe = {true:"checked",false:""},safe={true:"checked",false:""},react={true:"checked",false:""},slash={true:"checked",false:""}
            if(ans.language) {
                if(ans.language.setting) {
                    if(ans.language.setting.snipe === false) {snipe.false = "checked";snipe.true=""}
                    if(ans.language.setting.safe === false) {safe.false = "checked";safe.true=""}
                    if(ans.language.setting.react === false) {react.false = "checked";react.true=""}
                    if(ans.language.setting.slash === false) {slash.false = "checked";slash.true=""}
                }
            }
            if(lans === "預設(繁體中文)") {lans = '<option>繁體中文</option><option>English</option>'}
            if(ans.language) {
                if(ans.language.lan) {
                    if(ans.language.lan == "zh_TW") {lans = "繁體中文"}else if(ans.language.lan == "en_US") {lans = "English"}else if(ans.language.lan == "ja_JP") {lans = "日本語"}else if (ans.language.lan == "zh_CN") {lans = "簡體中文"}
                if(lans === "繁體中文") {lans = '<option>繁體中文</option><option>English</option>'}
                if(lans === "English") {lans = '<option>English</option><option>繁體中文</option>'}
                }
            }
            if(detc2 === "(預設)智乃小幫手#5407") {detc2 = '<option>智乃小幫手#5407</option><option>智乃小幫手2#5127</option>'}
            if(ans.language) {
                if(ans.language.run) {
                    if(ans.language.run === 1) {detc2="智乃小幫手#5407"}else if(ans.language.run === 2) {detc=2;detc2="智乃小幫手2#5127"}
                    if(detc2 === "智乃小幫手#5407") {detc2 = '<option>智乃小幫手#5407</option><option>智乃小幫手2#5127</option>'}
                    if(detc2 === "智乃小幫手2#5127") {detc2 = '<option>智乃小幫手2#5127</option><option>智乃小幫手#5407</option>'}
                }
            }
            let channel= await getGuildChannel(gis.id)
            let join = new Array(),leave = new Array(),option1 = "無",option2="無"
            for (let i = 0; i < channel.length; i++) {
                if(channel[i].type != "category" && channel[i].type != "voice") {
                if(ans.join.toString() == channel[i].id) {
                    option1 = channel[i].name}else{
                join.push(`<option>${channel[i].name}</option>`)}
            }}
            for (let i = 0; i < channel.length; i++) {
                if(channel[i].type != "category" && channel[i].type != "voice") {
                if(ans.leave.toString() == channel[i].id) {
                    option2 = channel[i].name}else{
                leave.push(`<option>${channel[i].name}</option>`)}
            }}
            document.getElementById('guild').innerHTML = await `${gis.name}<br><br>
            <form method="post"  target="_blank" action="/api/guild/setting/${gis.id}">
            <input name="userid" type="hidden" value="${word.id}">
            伺服器語言: <select name="language">
            ${lans}
            </select><br>
            機器人觸發: <select name="detect">
            ${detc2}
            </select><br>
            配置設置:<br>
            狙擊訊息<input type="radio" name="snipe" value="true" ${snipe.true}> <label for="true">開啟</label> <input type="radio" name="snipe" value="false" ${snipe.false}><label for="false">關閉</label><br>
            觸圖功能<input type="radio" name="safe" value="true" ${safe.true}><label for="true">開啟</label> <input type="radio" name="safe" value="false" ${safe.false}><label for="false">關閉</label><br>
            訊息反應<input type="radio" name="react" value="true" ${react.true}><label for="true">開啟</label> <input type="radio" name="react" value="false" ${react.false}><label for="false">關閉</label><br>
            斜槓指令<input type="radio" name="slash" value="true" ${slash.true}><label for="true">開啟</label> <input type="radio" name="slash" value="false"  ${slash.false}><label for="false">關閉</label><br>
            <input type="reset" value="重設">
            <input type="submit" value="確定">
            </form>
            <br>
            <form method="post"  target="_blank" action="/api/guild/join/setup/${gis.id}">
            歡迎訊息:<br>
            <input name="userid" type="hidden" value="${word.id}">
            加入頻道:
            <select name="channel">
            <option>${option1}</option>${join.join("")}
            </select>
            <input type="text" name="join" onkeyup="this.value=this.value.replace(/[<>@$%^&()]+/,'')" value="${ans.join2.toString()}" autocomplete="off" placeholder="請填入歡迎訊息" style="width:340px;"><br>
            <input type="reset" value="重設">
            <input type="submit" value="確定">
        </form>
        <form method="post"  target="_blank" action="/api/guild/join/test/${gis.id}">  
        <input name="userid" type="hidden" value="${word.id}">
        <input type="submit" value="測試">
            </form>
        <form method="post"  target="_blank" action="/api/guild/leave/setup/${gi.id}">  
        離開訊息:<br>
        <input name="userid" type="hidden" value="${word.id}">
        離開頻道:
        <select name="channel">
        <option>${option2}</option>${leave.join("")}
        </select>
        <input type="text"  name="leave" onkeyup="this.value=this.value.replace(/[<>@$%^&()]+/,'')" value="${ans.leave2.toString()}" autocomplete="off" placeholder="請填入離開訊息" style="width:340px;"><br>
        <input type="reset" value="重設">
        <input type="submit" value="確定">
    </form>
    <form method="post"  target="_blank" action="/api/guild/leave/test/${gis.id}">  
    <input name="userid" type="hidden" value="${word.id}">
    <input type="submit" value="測試">
        </form>
        <br>
        ◆想關掉只要不填入訊息即可<br>
        在訊息裡面加上以下東西可以增加參數:<br>
        - {user} 及提用戶<br>
        - {server} 伺服器名稱<br>
        - {member} 伺服器總人數<br>
        `
        guilds.push(`<a href="/nofondguild"><img id="Noguild" border="0" style="margin-top: -5px; margin-left: -35px;" src="/img/imgs/noguild.jpg" title="找不到想要的伺服器嗎?" width="50" height="50" alien="rig"></a>`)
        if(that == false) {
            window.location.href='/login/signin';}
        document.getElementById('hi').innerHTML = await word.username+"我們又見面惹:)"
        document.getElementById('myself').innerHTML = await `<a href="/login/signin/" onclick="del();return false" ><img id="user_avatar" border="0" style="margin-top: -5px; margin-left: -35px;" src="https://cdn.discordapp.com/avatars/${word.id}/${word.avatar}" title="${word.username}" width="50" height="50" alien="rig"></a>`
        document.getElementById('guilds').innerHTML = await guilds.join("<br>")
        }}
    }
}
}
}
(async() => {
    guildset()
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