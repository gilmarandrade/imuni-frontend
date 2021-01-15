module.exports = app => {
    const EscalaEquilibrioBerg = app.server.model.avalins.instrumento.EscalaEquilibrioBerg;

    const save = async (req, res) => {

        const atendimento = req.body;

        console.log('[AVALINS] ATENDIMENTO RECEBIDO');
        // if(atendimento.authsecret !== process.env.AUTH_SECRET) {
        //     console.log("authsecret inválido");
        //     return res.status(403).send("authsecret inválido");
        // }

        try {
            if(atendimento && atendimento.responses) {
                atendimento.origin = 'INSERTED';
                atendimento.raw = {};

                atendimento.responses.forEach(item => {
                    atendimento.raw[item.question.substring(1,4)] = {};
                });

                atendimento.responses.forEach(item => {
                    atendimento.raw[item.question.substring(1,4)][item.question.substring(4,7)] = item;
                });

                const instrumento = new EscalaEquilibrioBerg('EscalaEquilibrioBerg', atendimento.origin, atendimento.responseId, atendimento.timestamp, atendimento.authsecret, atendimento.raw);

                instrumento.calcular();
                console.log(instrumento.toObject);
                await app.server.service.v2.avalins.atendimentoService.insertOne(instrumento.toObject);
                // await app.server.service.v2.avalins.atendimentoService.convertAtendimento(instrumento);

                return res.status(200).json(instrumento.toObject);
            }


        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    const findAll = async (req, res) => {

        try {
            const result = await app.server.service.v2.avalins.atendimentoService.findAll();
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err.toString());
        }
    }

    const findById = async (req, res) => {

        try {
            const result = await app.server.service.v2.avalins.atendimentoService.findById(req.params.atendimentoId);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err.toString());
        }
    }

    return { save, findAll, findById }
}