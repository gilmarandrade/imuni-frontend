const passport = require('passport');
const passportJwt = require('passport-jwt');
const { Strategy, ExtractJwt } = passportJwt;
const { authSecret } = require('./environment');
const userService = require('../service/userService');

module.exports = app => {
    const params = {
        secretOrKey: authSecret,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    };

    const strategy = new Strategy(params, async (payload, done) => {
        try {
            //TODO buscar um usuário no banco que seja igual a payload.id, se encontrar significa que o usuário está autorizado
            const user = await userService.findById(payload.id);
            console.log(user);
            done(null, user ? { ...payload } : false);
        } catch(err) {
            done(err, false);// não autorizado
        }
    });

    passport.use(strategy);

    return { 
        authenticate: () => passport.authenticate('jwt', { session: false })
    };
}
