
module.exports = app => {

    //TODO não permitir o cadastro duplicado?
    const save = async (req, res) => {

        const idoso = req.body;

        try {
            app.server.api.validation.existsOrError(idoso.nome, 'Nome: campo obrigatório')
            app.server.api.validation.existsOrError(idoso.unidadeId, 'Unidade: campo obrigatório')
        } catch(err) {
            console.log(err);
            return res.status(400).send(err.toString());
        }

        console.log(idoso);
        try {
            const result = await app.server.service.v2.idosoService.upsertOne(idoso);
            return res.status(200).json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    const getByUnidadeId = async (req, res) => {
        try {
            const result = await app.server.service.v2.idosoService.findAtivosByUnidadeId(req.params.unidadeId);
            return res.status(200).json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    const getById = async (req, res) => {
        try {
            const result = await app.server.service.v2.idosoService.getById(req.params.idosoId);
            return res.status(200).json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    
    const remove = async (req, res) => {
        try {
            const result = await app.server.service.v2.idosoService.softDeleteOne(req.params.idosoId);
            return res.json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    // const getEpidemiologia = async (req, res) => {
    //     try {
    //         const result = await app.server.service.v2.atendimentoService.getEpidemiologia(req.params.idosoId);
    //         return res.status(200).json(result);
    //     } catch(err) {
    //         console.log(err);
    //         return res.status(500).send(err.toString());
    //     }
    // }

    const idososByUser = async (req, res) => {
        console.log('idosos by user' + req.params.usuarioId)
        const unidadeId = req.params.unidadeId;
        const usuarioId = req.params.usuarioId;

        try {
            const result = await app.server.service.v2.idosoService.findAllByUser(unidadeId, usuarioId, req.query.filter, req.query.sort, +req.query.page, +req.query.rowsPerPage);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err.toString());
        }
    }

    const countByVigilante = async (req, res) => {
        console.log('idosos by user' + req.params.usuarioId)
        const unidadeId = req.params.unidadeId;
        const usuarioId = req.params.usuarioId;

        try {
            const result = await app.server.service.v2.idosoService.countByVigilante(unidadeId, usuarioId, req.query.filter);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err.toString());
        }
    }

    const countByUnidade = async (req, res) => {
        const unidadeId = req.params.unidadeId;

        try {
            const result = await app.server.service.v2.idosoService.countByUnidade(unidadeId);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err.toString());
        }
    }

    const transferirIdosos = async (req, res) => {
        const unidadeId = req.params.unidadeId;
        const from = req.body.from;
        const to = req.body.to;

        if(from === to) {
            return res.status(400).send('Não é possível transferir de um vigilante para ele mesmo!');
        }

        try {
            const result = await app.server.service.v2.idosoService.transferirIdosos(from, to);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err.toString());
        }
    }

    return { save, getByUnidadeId, getById, remove, idososByUser, countByVigilante, transferirIdosos, countByUnidade };
};