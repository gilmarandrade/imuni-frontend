module.exports = app => {
    const Instrumento = app.server.model.avalins.instrumento.Instrumento;

    const save = async (req, res) => {

        const atendimento = req.body;

        console.log('[AVALINS] ATENDIMENTO RECEBIDO');
        // if(atendimento.authsecret !== process.env.AUTH_SECRET) {
        //     console.log("authsecret inválido");
        //     return res.status(403).send("authsecret inválido");
        // }

        try {
            // atendimento.timestamp = (new Date(atendimento.timestamp)).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
            // console.log(atendimento);

            
            if(atendimento && atendimento.responses) {
                atendimento.origin = 'INSERTED';
                atendimento.raw = {};

                atendimento.responses.forEach(item => {
                    atendimento.raw[item.question.substring(1,4)] = {};
                });

                atendimento.responses.forEach(item => {
                    atendimento.raw[item.question.substring(1,4)][item.question.substring(4,7)] = item;
                });

                // console.log(atendimento.raw);
                delete atendimento.responses;
                atendimento._isDeleted = false;

                await app.server.service.v2.avalins.atendimentoService.convertAtendimento(atendimento);

                return res.status(200).json(atendimento);
            }


        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    const findAll = async (req, res) => {

        try {
            const result = await app.server.service.v2.avalins.atendimentoService.findAll();

            const teste  = new Instrumento('meu primeiro instrumento');
            const teste2  = new Instrumento('meu segundo instrumento');
            console.log(teste)
            console.log(teste2)
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