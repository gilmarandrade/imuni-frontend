const express = require('express');
const role = require('./role');
const path = require('path');

module.exports = app => {    
    //  A ordem das urls tem que ser da mais especifica para a mais genérica

    // app.get('/', function (req, res) {
    //     res.send('Hello World from api-frenteprevencaocovidrn-org-br!');
    // });

    app.route('/api/teste')
    .get(app.server.api.unidades.get);
    
    app.post('/api/login', app.server.api.auth.login);
    app.post('/api/validateToken', app.server.api.auth.validateToken);
    app.post('/api/forgotPassword', app.server.api.auth.forgotPassword);
    app.post('/api/validateResetToken', app.server.api.auth.validateResetToken);
    app.post('/api/resetPassword', app.server.api.auth.resetPassword);
    app.post('/api/acceptInvite', app.server.api.auth.acceptInvite);

    app.route('/api/docs/:id/sheets/:sheetName/range/:range')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.planilhas.get);

    app.route('/api/unidades/:unidadeId/usuarios/:usuarioId/idosos')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.idosos.idososByUser);

    app.route('/api/unidades/:unidadeId/vigilantes/:vigilanteId/idosos')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.idosos.idososByVigilante);

    app.route('/api/unidades/:unidadeId/idosos/:idosoId')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.idosos.idoso);

    app.route('/api/unidades/:unidadeId/idosos/:idosoId/atendimentos')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.atendimentos.atendimentosByIdoso);

    app.route('/api/unidades/:unidadeId/atendimentos/:id')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.atendimentos.atendimento);

    app.route('/api/unidades/:unidadeId/usuarios')
        .all(app.server.config.passport.authenticate())
        .get(role(app.server.api.user.getByUnidadeId, 'ADMINISTRADOR'))
        .post(role(app.server.api.user.sendInvitation, 'ADMINISTRADOR'));

    app.route('/api/unidades/:unidadeId/vigilantes')
        .all(app.server.config.passport.authenticate())
        .get(role(app.server.api.googlesheets.vigilantes, 'ADMINISTRADOR'));

    app.route('/api/unidades/:unidadeId/autosync/:status')
        .all(app.server.config.passport.authenticate())
        .get(role(app.server.api.unidades.toggleAutoSync, 'ADMINISTRADOR'));

    app.route('/api/unidades/:unidadeId')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.unidades.getById);

    app.route('/api/unidades')
        .all(app.server.config.passport.authenticate())
        .get(role(app.server.api.unidades.get, 'ADMINISTRADOR'))
        .post(role(app.server.api.unidades.save, 'ADMINISTRADOR'));

    app.route('/api/administradores')
        .all(app.server.config.passport.authenticate())
        .get(role(app.server.api.user.getAdministradores, 'ADMINISTRADOR'))
        .post(role(app.server.api.user.sendInvitation, 'ADMINISTRADOR'));

    app.route('/api/users/resendInvitation/:userId')
        .all(app.server.config.passport.authenticate())
        .post(role(app.server.api.user.resendInvitation, 'ADMINISTRADOR'));

    app.route('/api/stats')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.googlesheets.stats);

    app.route('/api/v2/unidades/:unidadeId/idosos/:idosoId')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.v2.idosos.getById);

    app.route('/api/v2/unidades/:unidadeId/idosos')
        .all(app.server.config.passport.authenticate())
        .get(role(app.server.api.v2.idosos.getByUnidadeId, 'PRECEPTOR'))
        .post(role(app.server.api.v2.idosos.save, 'PRECEPTOR'));

        
    //Handle Production routes
    if(process.env.NODE_ENV === 'production') {
        // servindo arquivos estáticos
        app.use(express.static(path.resolve(__dirname, "../public")));
        // habilitando socket url
        app.route('/socket.io').all(function(req, res, next){
            next();
        });
        // handle SPA
        app.get("*", (req, res) => {// O wildcard '*' serve para servir o mesmo index.html independente do caminho especificado pelo navegador.
            res.sendFile(path.join(__dirname, "../public", "index.html"));
        });
    }

};
