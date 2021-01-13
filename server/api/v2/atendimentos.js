
module.exports = app => {

    const save = async (req, res) => {

        const atendimento = req.body;

        console.log('ATENDIMENTO RECEBIDO');
        if(atendimento.authsecret !== process.env.AUTH_SECRET) {
            console.log("authsecret inválido");
            return res.status(403).send("authsecret inválido");
        }

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

                await app.server.service.v2.atendimentoService.insertFromGoogleForm(atendimento);

                return res.status(200).json(atendimento);
            }


        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    const getById = async (req, res) => {
        const id = req.params.idAtendimento;

        try {
            const result = await app.server.service.v2.atendimentoService.findById(id);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    const getByIdoso = async (req, res) => {
        const idosoId = req.params.idosoId;

        try {
            const result = await app.server.service.v2.atendimentoService.findAllByIdoso(idosoId);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err.toString());
        }
    }

    return { save, getById, getByIdoso };
};