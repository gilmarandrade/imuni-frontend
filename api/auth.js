const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const { authSecret } = require('../config/environment');
const userService = require('../service/userService');

module.exports = app => {
    const login = async (req, res) => { 
        if(!req.body.email || !req.body.password) {
            return res.status(400).send('Informe email e senha');
        }

        const user = await userService.findByEmail(req.body.email);

        if(!user) return res.status(400).send('usuário não encontrado');

        try {
            const isMatch = bcrypt.compareSync(req.body.password, user.password);
            if(!isMatch) return res.status(401).send('E-mail/Senha inválidos');
        } catch(msg) {
            return res.status(401).send(msg);
        }

        const now = Math.floor(Date.now() / 1000);

        // obs: quando o token expira, o usuário precisa fazer login novamente
        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            unidadeId: user.unidadeId,
            collectionPrefix: user.collectionPrefix,
            nomeUnidade: user.nomeUnidade,
            iat: now, //issued at: data de emissão do token (timestamp em segundos)
            exp: now + (60 * 60 * 24 * 1), // prazo de expiração do token (em segundos) 
            //TODO calcular o prazo de expiração para sempre expirar de madrugada, fora do horario de utilização
        };

        return res.json({
            ...payload,
            token: jwt.encode(payload, authSecret), //gera um token a partir do auth secret
        });
    };

    const validateToken = async (req, res) => {
        const userData = req.body || null;
        try {
            if(userData) {
                const token = jwt.decode(userData.token, authSecret);
                if(new Date(token.exp * 1000) > new Date()) { // o token ainda é válido
                    return res.send(true);
                    // Em vez de mndar true, pode-se mandar um novo token (renovar o token de forma transparente para o usuário)
                }
            }
        } catch (e) {
            // algum tipo de problema no token
        }

        return res.send(false); // token não válido
    };

    return { login, validateToken };
};