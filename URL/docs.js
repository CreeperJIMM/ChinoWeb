module.exports = function(req,res) {
    switch (req.path) {
        case "/":
            res.sendFile(__dirname+'/index.html')
            break;
        case "/main":
            res.sendFile(__dirname+'/index.html')
            break;
        default:
            res.sendFile(__dirname+'/index.html')
            break;
    }
}