const express = require('express');
const role = require('./role');

module.exports = app => {
    // servindo arquivos estáticos
    app.use(express.static('public'));
    
    //  A ordem das urls tem que ser da mais especifica para a mais genérica

    app.get('/', function (req, res) {
        res.send('Hello World from api-frenteprevencaocovidrn-org-br!');
    });

    
    app.post('/login', app.api.auth.login);
    app.post('/validateToken', app.api.auth.validateToken);

    app.route('/docs/:id/sheets/:sheetName/range/:range')
        .all(app.config.passport.authenticate())
        .get(app.api.planilhas.get);

    app.route('/sync/:limit')
        .all(app.config.passport.authenticate())
        .get(app.api.sync.sync);

    app.route('/sync')
        .all(app.config.passport.authenticate())
        .get(app.api.sync.sync);

    app.route('/unidades/:unidadeId/vigilantes/:vigilanteId/idosos')
        .all(app.config.passport.authenticate())
        .get(app.api.googlesheets.idososByVigilante);

    app.route('/idosos/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.googlesheets.idoso);

    app.route('/idosos/:id/atendimentos')
        .all(app.config.passport.authenticate())
        .get(app.api.googlesheets.atendimentosByIdoso);

    app.route('/atendimentos/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.googlesheets.atendimento);

    app.route('/unidades/:unidadeId/usuarios')
        .all(app.config.passport.authenticate())
        .get(role(app.api.user.getByUnidadeId, 'ADMINISTRADOR'))
        .post(role(app.api.user.insert, 'ADMINISTRADOR'));

    app.route('/unidades/:unidadeId/vigilantes')
        .all(app.config.passport.authenticate())
        .get(role(app.api.googlesheets.vigilantes, 'ADMINISTRADOR'));

    app.route('/unidades/:unidadeId/ativacao/:status')
        .all(app.config.passport.authenticate())
        .get(role(app.api.unidades.toggleSync, 'ADMINISTRADOR'));

    app.route('/unidades/:unidadeId/sync')
        .all(app.config.passport.authenticate())
        .get(role(app.api.sync.syncUnidade, 'ADMINISTRADOR'));

    app.route('/unidades/:unidadeId')
        .all(app.config.passport.authenticate())
        .get(role(app.api.unidades.getById, 'ADMINISTRADOR'));

    app.route('/unidades')
        .all(app.config.passport.authenticate())
        .get(role(app.api.unidades.get, 'ADMINISTRADOR'))
        .post(role(app.api.unidades.save, 'ADMINISTRADOR'));

    app.route('/stats')
        .all(app.config.passport.authenticate())
        .get(app.api.googlesheets.stats);

};
