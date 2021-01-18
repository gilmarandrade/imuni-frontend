module.exports = (middleware, role) => {
    return (req, res, next) => {
        if(role === 'ADMINISTRADOR' && req.user.role == 'ADMINISTRADOR') {
            middleware(req, res, next)
        } else if(role === 'PRECEPTOR' && (req.user.role == 'ADMINISTRADOR' || req.user.role == 'PRECEPTOR') ) {
            middleware(req, res, next)
        }
        else {
            res.status(401).send('Usuário não tem permissão')
        }
    }
}