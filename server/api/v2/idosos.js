
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

    const getEpidemiologia = async (req, res) => {
        try {
            const result = await app.server.service.v2.idosoService.getEpidemiologia(req.params.idosoId);
            return res.status(200).json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    return { save, getByUnidadeId, getById, remove, getEpidemiologia };
};