const passport = require('passport');
const passportJwt = require('passport-jwt');
const { Strategy, ExtractJwt } = passportJwt;
const { authSecret } = require('../config/environment');

module.exports = app => {
    const params = {
        secretOrKey: authSecret,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    };

    const strategy = new Strategy(params, (payload, done) => {
        try {
            //TODO buscar um usuário no banco que seja igual a payload.id, se encontrar significa que o usuário está autorizado
            const userId = 1;
            done(null, userId ? { ...payload } : false);
        } catch(err) {
            done(err, false);// não autorizado
        }
    });

    passport.use(strategy);

    return { 
        authenticate: () => passport.authenticate('jwt', { session: false })
     };
};