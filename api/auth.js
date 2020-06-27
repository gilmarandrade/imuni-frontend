const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const { authSecret } = require('../config/environment');

module.exports = app => {
    const login = async (req, res) => { 
        if(!req.body.email || !req.body.password) {
            return res.status(400).send('Informe usuário e senha');
        }

        // TODO pega no banco o usuário que possui esse email
        const user = {
            id: 1,
            name: 'Rogerio',
            email: req.body.email,
            password: '46ndop54(*&(*HOY%¨&*Ijksdlç350@#$%',
            admin: true,
        }

        if(!user) return res.status(400).send('usuário não encontrado');

        // try {
        //     const isMatch = bcrypt.compareSync(req.body.password, user.password);
        //     if(!isMatch) return res.status(401).send('E-mail/Senha inválidos');
        // } catch(msg) {
        //     return res.status(401).send(msg);
        // }

        const now = Math.floor(Date.now() / 1000);

        // obs: quando o token expira, o usuário precisa fazer login novamente
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            admin: user.admin,
            iat: now, //issued at: data de emissão do token (timestamp em segundos)
            exp: now + (60 * 60 * 24 * 3), // prazo de expiração do token (em segundos) 
        };

        return res.json({
            ...payload,
            token: jwt.encode(payload, authSecret), //gera um token a partir do api secret
        });
    };

    return { login };
};