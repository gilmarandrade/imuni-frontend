
module.exports = app => {

    //TODO não permitir o cadastro duplicado
    const save = async (req, res) => {

        const idoso = req.body;

        try {
            app.server.api.validation.existsOrError(idoso.nome, 'Nome: campo obrigatório')
            app.server.api.validation.existsOrError(idoso.unidadeId, 'Unidade: campo obrigatório')
        } catch(msg) {
            //TODO retornar o msg.toString() em todos os catchs da api
            return res.status(400).send(msg.toString());
        }

        console.log(idoso);
        try {
            const result = await app.server.service.v2.idosoService.updateOne(idoso);
            return res.status(200).json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    const getByUnidadeId = async (req, res) => {
        try {
            const result = await app.server.service.v2.idosoService.getByUnidadeId(req.params.unidadeId);
            return res.status(200).json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    return { save, getByUnidadeId };
};