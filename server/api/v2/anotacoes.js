module.exports = app => { 

    const insert = async (req, res) => {

        const anotacao = req.body;

        console.log(anotacao)

        try {
            app.server.api.validation.existsOrError(anotacao.text, 'A anotação não pode estar vazia')
            app.server.api.validation.existsOrError(anotacao.idosoId, 'Idoso: campo obrigatório')
            app.server.api.validation.existsOrError(anotacao.usuarioId, 'Usuario: campo obrigatório')
        } catch(err) {
            console.log(err);
            return res.status(400).send(err.toString());
        }

        console.log(anotacao);
        try {
            const result = await app.server.service.v2.anotacaoService.insertOne(anotacao);
            return res.status(200).json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    const findByIdoso = async (req, res) => {
        try {
            const result = await app.server.service.v2.anotacaoService.findByIdoso(req.params.idosoId);
            return res.status(200).json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    return { insert, findByIdoso }
}