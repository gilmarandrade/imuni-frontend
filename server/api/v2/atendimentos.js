
module.exports = app => {

    const save = async (req, res) => {

        const atendimento = req.body;

        console.log('ATENDIMENTO RECEBIDO:');
        console.log(atendimento);
        try {
            atendimento.timestamp = new Date(atendimento.timestamp);
            await app.server.service.v2.atendimentoService.insertOne(atendimento);
            return res.status(200).json(atendimento);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    return { save };
};