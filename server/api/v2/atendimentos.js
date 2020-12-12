
module.exports = app => {

    const save = async (req, res) => {

        const atendimento = req.body;

        console.log('ATENDIMENTO RECEBIDO:');
        console.log(atendimento);
        try {
            for(let i = 0; i < atendimento.length; i++) {
                console.log(atendimento[i]);
                await app.server.service.v2.atendimentoService.insertOne(atendimento[i]);
            }

            return res.status(200).json(atendimento);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    return { save };
};