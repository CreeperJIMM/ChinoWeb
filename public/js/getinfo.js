var getUser = async(id) => {
    try {
        let user2 =  await (await fetch('/api/user',{method: "POST",body: new URLSearchParams({
            "uid": id
        })})).json()
        return user2
    } catch (error) {
        console.log(error)
    }
}
var getGuild = async(id) => {
    try {
        let user2 =  await (await fetch('/api/guild',{method: "POST"
        })).json()
        return user2
    } catch (error) {
        console.log(error)
    }
}
var getGuilds = async(id) => {
    try {
        id= {id}
        id= JSON.stringify(id)
        let user2 =  await (await fetch('/api/guild/json',{method: "POST",body: new URLSearchParams({
            "uid": id
        })})).json()
        return user2
    } catch (error) {
        console.log(error)
    }
}
var getGuildChannel = async(id) => {
    try {
        let user2 =  await (await fetch('/api/guild/channel',{method: "POST",body: new URLSearchParams({
            "uid": id
        })})).json()
        return user2
    } catch (error) {
        console.log(error)
    }
}
var getdaily = async(token) => {
    try {
        let user2 =  await (await fetch('/api/daily',{method: "POST"
        })).json()
        return user2.daily
    } catch (error) {
        console.log(error)
    }
}
var getNsfwAD = async(id) => {
    try {
        let user2 =  await (await fetch('/api/adget',{method: "POST"
        })).json()
        return user2
    } catch (error) {
        console.log(error)
    }
}
var writeNsfwAD = async(url) => {
    try {
        let user2 =  await (await fetch('/api/adwrite',{method: "POST",body: new URLSearchParams({"url":url})
        })).json()
        return user2
    } catch (error) {
        console.log(error)
    }
}
var getpicture = async(img,nsfw,ad) => {
    try {
        let user2 =  await (await fetch('/api/picture',{method: "POST",body: new URLSearchParams({
            "img": img,
            "nsfw": nsfw,
            "ad":ad
        })})).json()
        return user2
    } catch (error) {
        console.log(error)
    }
}
function isMobileDevices() {
    const mobileDevice = ['Android', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone']
    let isMobileDevice = mobileDevice.some(e => navigator.userAgent.match(e))
    return isMobileDevice
}
async function ReplaceAll(strOrg,strFind,strReplace){
    var index = 0;
    while(strOrg.indexOf(strFind,index) != -1){
    strOrg = strOrg.replace(strFind,strReplace);
    index = strOrg.indexOf(strFind,index);
    }
    return strOrg
}