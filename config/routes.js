const express = require('express');
// const admin = require('./admin');

module.exports = app => {
    // servindo arquivos estáticos
    app.use(express.static('public'));
    
    //  A ordem das urls tem que ser da mais especifica para a mais genérica
    // app.post('/signup', app.api.user.save);
    // app.post('/signin', app.api.auth.signin);
    // app.post('/validateToken', app.api.auth.validateToken);

    // app.route('/users')
    //     .all(app.config.passport.authenticate())
    //     .post(admin(app.api.user.save))
    //     .get(admin(app.api.user.get));

    // app.route('/users/:id')
    //     .all(app.config.passport.authenticate())
    //     .put(admin(app.api.user.save))
    //     .get(admin(app.api.user.getById))
    //     .delete(admin(app.api.user.getById));

    // app.route('/categories')
    //     .all(app.config.passport.authenticate())
    //     .post(admin(app.api.category.save))
    //     .get(app.api.category.get);

    // app.route('/categories/tree')
    //     .all(app.config.passport.authenticate())
    //     .get(app.api.category.getTree);

    // app.route('/categories/:id')
    //     .all(app.config.passport.authenticate())
    //     .put(admin(app.api.category.save))
    //     .get(app.api.category.getById)
    //     .delete(admin(app.api.category.remove));

    // app.route('/articles')
    //     .all(app.config.passport.authenticate())
    //     .get(app.api.article.get)
    //     .post(admin(app.api.article.save));

    // app.route('/articles/:id')
    //     .all(app.config.passport.authenticate())
    //     .get(app.api.article.getById)
    //     .put(admin(app.api.article.save))
    //     .delete(admin(app.api.article.remove));

    // app.route('/categories/:id/articles')
    //     .all(app.config.passport.authenticate())
    //     .get(app.api.article.getByCategory);

    // app.route('/stats')
    //     .all(app.config.passport.authenticate())
    //     .get(app.api.stat.get);

    app.get('/', function (req, res) {
        res.send('Hello World from api-frenteprevencaocovidrn-org-br!');
    });

    app.route('/docs/:id/sheets/:sheetName/range/:range')
        .get(app.api.googlesheets.get);

    app.route('/sync')
        .get(app.api.googlesheets.sync);

    app.route('/vigilantes/:id/idosos')
        .get(app.api.googlesheets.idososByVigilante);

    app.route('/idosos/:id')
        .get(app.api.googlesheets.idoso);

    app.route('/idosos/:id/atendimentos')
        .get(app.api.googlesheets.atendimentosByIdoso);

    app.route('/atendimentos/:id')
        .get(app.api.googlesheets.atendimento);

    app.route('/vigilantes')
        .get(app.api.googlesheets.vigilantes);

    //planilha
    app.route('/planilhas/:idPlanilha/vigilantes/:indexVigilante/idosos')
        .get(app.api.planilhas.idososByVigilante);

    app.route('/planilhas/:idPlanilha/vigilantes')
        .get(app.api.planilhas.vigilantes);

};
