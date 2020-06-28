module.exports = (middleware, role) => {
    return (req, res, next) => {
        if(req.user.role === role){
            middleware(req, res, next)
        } else {
            res.status(401).send('Usuário não tem permissão')
        }
    }
}