module.exports = function(req,res) {
    res.sendFile(__dirname+'/new/'+req.path)
}