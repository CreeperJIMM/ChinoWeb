function getCookie(cookieName) {
    var name = cookieName + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}
function ifHasCode() {
    let url = new URL(document.documentURI);
    if( url.searchParams.has("__cf_chl_captcha_tk__") ) {
        return true;}else if(url.searchParams.has("__cf_chl_jschl_tk__")) {
            return true;
        }else{
           return false;
        }
}
function cookieToDict() {

    let cookies = document.cookie.split("; ");
    let cookieDict = {}

    cookies.map( cookieStr => { 
        let cookieKandV = cookieStr.split("=")
        let k = cookieKandV.shift()
        
        cookieDict[`${k}`] = cookieKandV.join("")
    })
    return decodeURIComponent(cookieDict.user_token)
}

var getData = async(token) => {
    try {
        let user2 =  await (await fetch('/api/verification',{method: "POST"})).json()
        return user2
    } catch (error) {
        console.log(error)
    }
}

var getGoogleData = async(token) => {
    try {
        let user2 =  await (await fetch('/api/login/google',{method: "POST",body: new URLSearchParams({"idtoken":token})})).json()
        return user2
    } catch (error) {
        console.log(error)
    }
}

function clearAllCookie() {
    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
    if (keys) {
        for (var i = keys.length; i--;)
            document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
    }
}
function isMobileDevice() {
    const mobileDevice = ['Android', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone']
    let isMobileDevice = mobileDevice.some(e => navigator.userAgent.match(e))
    return isMobileDevice
}