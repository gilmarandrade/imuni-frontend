const express = require('express');
const role = require('./role');
const path = require('path');

module.exports = app => {    
    //  A ordem das urls tem que ser da mais especifica para a mais genérica

    app.post('/api/v2/login', app.server.api.auth.login);
    app.post('/api/v2/validateToken', app.server.api.auth.validateToken);
    app.post('/api/v2/forgotPassword', app.server.api.auth.forgotPassword);
    app.post('/api/v2/validateResetToken', app.server.api.auth.validateResetToken);
    app.post('/api/v2/resetPassword', app.server.api.auth.resetPassword);
    app.post('/api/v2/acceptInvite', app.server.api.auth.acceptInvite);

    app.route('/api/v2/usuarios/resendInvitation/:userId')
    .all(app.server.config.passport.authenticate())
    .post(role(app.server.api.v2.usuarios.resendInvitation, 'ADMINISTRADOR'));

    app.route('/api/v2/usuarios/:usuarioId/status/:status')
    .all(app.server.config.passport.authenticate())
    .post(role(app.server.api.v2.usuarios.updateStatus, 'ADMINISTRADOR'));
    
    app.route('/api/v2/usuarios/:usuarioId/completar')
    .all(app.server.config.passport.authenticate())
    .post(role(app.server.api.v2.usuarios.completarCadastro, 'ADMINISTRADOR'));

    app.route('/api/v2/usuarios/:usuarioId')
    .all(app.server.config.passport.authenticate())
    .delete(role(app.server.api.v2.usuarios.remove, 'ADMINISTRADOR'));

    app.route('/api/v2/administradores')
        .all(app.server.config.passport.authenticate())
        .get(role(app.server.api.v2.usuarios.getAdministradores, 'ADMINISTRADOR'))
        .post(role(app.server.api.v2.usuarios.sendInvitation, 'ADMINISTRADOR'));

    //id da unidade é desnecessario...
    app.route('/api/v2/unidades/:unidadeId/atendimentos/:idAtendimento')
        // .all(app.server.config.passport.authenticate())
        .get(app.server.api.v2.atendimentos.getById);

    app.route('/api/v2/unidades/:unidadeId/vigilantes')
        .all(app.server.config.passport.authenticate())
        .get(role(app.server.api.v2.usuarios.getVigilantesAtivosByUnidadeId, 'ADMINISTRADOR'));

    app.route('/api/v2/unidades/:unidadeId/usuarios/:usuarioId/idosos')
        // .all(app.server.config.passport.authenticate())
        .get(app.server.api.v2.idosos.idososByUser);

    app.route('/api/v2/unidades/:unidadeId/usuarios')
        .all(app.server.config.passport.authenticate())
        .get(role(app.server.api.v2.usuarios.getByUnidadeId, 'ADMINISTRADOR'))
        .post(role(app.server.api.v2.usuarios.sendInvitation, 'ADMINISTRADOR'));

    app.route('/api/v2/idosos/:idosoId/atendimentos')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.v2.atendimentos.getByIdoso);

    app.route('/api/v2/idosos/:idosoId')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.v2.idosos.getById)
        .delete(role(app.server.api.v2.idosos.remove, 'ADMINISTRADOR'));

    app.route('/api/v2/unidades/:unidadeId/idosos')// TODO esse endpoint está sendo usado?
        .all(app.server.config.passport.authenticate())
        .get(role(app.server.api.v2.idosos.getByUnidadeId, 'PRECEPTOR'))
        .post(role(app.server.api.v2.idosos.save, 'PRECEPTOR'));

    app.route('/api/v2/unidades/:unidadeId')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.v2.unidades.getById)
        .delete(role(app.server.api.v2.unidades.remove, 'ADMINISTRADOR'));

    app.route('/api/v2/unidades')
        .all(app.server.config.passport.authenticate())
        .get(role(app.server.api.v2.unidades.get, 'ADMINISTRADOR'))
        .post(role(app.server.api.v2.unidades.save, 'ADMINISTRADOR'));

    app.route('/api/v2/atendimentos')
        .post(app.server.api.v2.atendimentos.save);

    app.route('/api/v2/names/unidades/:unidadeId')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.v2.unidades.getName);

    app.route('/api/v2/names/usuarios/:usuarioId')
        .all(app.server.config.passport.authenticate())
        .get(app.server.api.v2.usuarios.getName);

    
    app.route('/api/v2/migracao/unidades')
        .all(app.server.config.passport.authenticate())
        .post(app.server.api.v2.unidades.migrate);

    
    //avalins
    app.route('/api/v2/avalins/atendimentos')
        .post(app.server.api.v2.avalins.atendimentos.save);

    app.route('/api/v2/avalins/atendimentos/all')
        .get(app.server.api.v2.avalins.atendimentos.findAll);

        
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
