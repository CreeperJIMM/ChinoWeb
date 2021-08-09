module.exports = function(req,res) {
    switch (req.path) {
        case "/":
            res.status(302).redirect("/main")
            break;
        case "/main":
            res.status(302).render("./docs/main")
            break;
        case "/back":
            res.status(302).redirect("https://"+req.hostname.replace("docs.","")+"/main")
            break;
        default:
            res.status(404).render("./docs/error")
            break;
    }
}