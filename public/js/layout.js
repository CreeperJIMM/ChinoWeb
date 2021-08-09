function isMobileDevice() {
    const mobileDevice = ['Android', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone']
    let isMobileDevice = mobileDevice.some(e => navigator.userAgent.match(e))
    return isMobileDevice
}
function openMenu() {
    $(document).ready(function(){
    $("#Ntop").fadeIn("slow");
    navigator.vibrate(50);
    document.getElementById('NtopSet').innerHTML = '<span style="font-size:30px;cursor:pointer" onclick="closeMenu()">&thinsp;&times;</span>'
    })
}
function closeMenu() {
    $(document).ready(function(){
    $("#Ntop").fadeOut("slow");
    navigator.vibrate(50);
    document.getElementById('NtopSet').innerHTML = '<span style="font-size:30px;cursor:pointer" onclick="openMenu()">&nbsp;&#9776;</span>'
    })
}
let menusetx = 1
let names = ""
setTimeout(() => {
    $(document).ready(function(){
        $('#Nname').fadeIn("slow")
        $('#Nchoose').hide()
        $('#Nword').click(function(){
            navigator.vibrate(60);
        if(menusetx == 0) {
        menusetx = 1
        let s = document.getElementById('Nname').innerHTML
        $('#Nchoose').slideToggle(500);
        setTimeout(() => {
            let timer = setInterval(() => {
                navigator.vibrate(20);
                if(s.length <= 0) {
                    $('#Nname').fadeOut(600)
                    var box = document.querySelector('#Nword');
                    box.style = "width: auto;";
                    clearInterval(timer)
                }else{
                document.getElementById('Nname').innerHTML = s.substr(0, s.length - 1);
                s = s.substr(0, s.length - 1);};
            }, 100);      
        }, 500);
        }else if(menusetx == 1) {
           menusetx = 0
           var box = document.querySelector('#Nword');
           box.style = "width: auto;";
           document.getElementById('Nname').innerHTML = names
           $('#Nname').fadeIn(500)
           $('#Nchoose').slideToggle("slow");
        }
    });
    })    
    }, 150);
(async() => {
    try {
  var word = await getData()  
} catch (error) {
    return;}
console.log("%c 等一下！！！",'color:blue;background:yellow;')
console.log("%c 等一下！！！",'color:blue;background:yellow;')
console.log("%c 等一下！！！",'color:blue;background:yellow;')
console.log("%c 如果有人叫你在這裡輸入東西",'color:blue;background:darkseagreen;')
console.log("%c 300%是你被騙了!",'color:blue;background:darkseagreen;')
console.log("%c 千萬不要輸入任何代碼在這裡!",'color:blue;background:darkseagreen;')
var vaily = ifHasCode()
let url = new URL(document.URL)
if(word.Error == "User_is_banned.") {
    if(url.pathname === "/banned") return;
    document.location.href='/banned'
}

if(vaily) document.location.href=url.pathname;
names = "Discord登入"
document.getElementById('Nchoose').innerHTML = `|<a href="/login" style="color: mediumspringgreen;">點我登入</a>|`
let user = '<dc><img id="user_avatar" src="https://i.imgur.com/UWlIo9E.png" title="Discord登入" width="50" height="50" alien="rig"><b id="Nname" style="color: #6f6eeb;"></b></dc>';
if(!word.Error) {
    names = word.username
    user = `<dc> <img id="user_avatar" src="https://cdn.discordapp.com/avatars/${word.id}/${word.avatar}" title="${word.username}" width="50" height="50" alien="rig"><b id="Nname" style="color: #6f6eeb;"></b> </dc>`;
    document.getElementById('Nchoose').innerHTML = `|<a href="/login/discord" style="color: mediumspringgreen;">個人</a>|<a href="/login/logout" style="color: mediumspringgreen;">登出</a>|<br>|<a href="/login" style="color: mediumspringgreen;">登入狀態</a>|`
};
setTimeout((async) => {document.getElementById('Nword').innerHTML = user}, 50);
/*
if(isMobileDevice()) {setTimeout(() => {
document.getElementById('googleADs2').innerHTML = '<font size="4.8%"> <div id="GoogleADs2" style="display:flex;">我們需要廣告以維持經營。<br>請關閉您的廣告攔截程式。</div> </font>'}, 500);}else{
setTimeout(() => {document.getElementById('googleADs2').innerHTML = '<font size="4.8%"> <div id="GoogleADs2" style="display:flex;">我們需要廣告以維持經營。<br>請關閉您的廣告攔截程式。</div> </font>';document.getElementById('googleADs1').innerHTML = '<font size="4.8%"> <div id="GoogleADs1">我們需要廣告以維持經營。<br>請關閉您的廣告攔截程式。</div> </font>'}, 300);}
*/
})()