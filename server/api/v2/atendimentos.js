
module.exports = app => {

    const save = async (req, res) => {

        const atendimento = req.body;

        console.log('ATENDIMENTO RECEBIDO:');
        console.log(atendimento);
        try {
            atendimento.forEach(element => {
                console.log(element);
                const result = await app.server.service.v2.atendimentoService.insertOne(element);
            });

            return res.status(200).json(atendimento);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    return { save };
};