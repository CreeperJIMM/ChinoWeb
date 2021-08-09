let a = 0;
let count = 0
function clicksound() {
    a++
    if(a === 7) {a = 0}
    count++
    document.getElementById('count').innerHTML = count
    var thissound = document.getElementById('audio'+a);
    thissound.play();
    var supportsVibrate = "vibrate" in navigator;
    if(supportsVibrate) {
    setTimeout(() => {
        navigator.vibrate(60);
    }, 200);
    }
}