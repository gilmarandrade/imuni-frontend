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
                atendimento.raw = {};

                atendimento.responses.forEach(item => {
                    atendimento.raw[item.question.substring(1,4)] = {};
                });

                atendimento.responses.forEach(item => {
                    atendimento.raw[item.question.substring(1,4)][item.question.substring(4,7)] = item;
                });

                // console.log(atendimento.raw);
                delete atendimento.responses;

                atendimento.idosoId = app.server.service.v2.escalaService.extractResponse('S01','Q01', atendimento.raw);
                atendimento.vigilanteId = app.server.service.v2.escalaService.extractResponse('S01','Q02', atendimento.raw);
                atendimento.unidadeId = app.server.service.v2.escalaService.extractResponse('S01','Q03', atendimento.raw);
                atendimento.atendeu = app.server.service.v2.escalaService.isEquals('S02','Q01', atendimento.raw, 'Sim');
                atendimento.fonte = app.server.service.v2.escalaService.extractResponse('S04','Q01', atendimento.raw);
                atendimento.tipo =  app.server.service.v2.escalaService.extractResponse('S07','Q01', atendimento.raw);
                atendimento.idadeIdoso = app.server.service.v2.escalaService.extractNumber('S03','Q01', atendimento.raw);
                atendimento.duracaoChamada = app.server.service.v2.escalaService.extractResponse('S13','Q01', atendimento.raw);
                atendimento._isDeleted = false;

                const criterios = {
                    atendeu: app.server.service.v2.escalaService.isEquals('S02','Q01', atendimento.raw, 'Sim'),
                    sintomasIdoso: {
                        apresentaSintomasGripeCOVID: app.server.service.v2.escalaService.extractRequiredList('S05','Q01', atendimento.raw).length > 0 ? true : false,
                        sintomas: app.server.service.v2.escalaService.extractRequiredList('S05','Q01', atendimento.raw),
                        contatoComCasoConfirmado: app.server.service.v2.escalaService.isEquals('S05','Q05', atendimento.raw, 'Sim'),
                    },
                    comorbidades: {
                        apresentaCondicoesSaude: app.server.service.v2.escalaService.extractRequiredList('S06','Q01', atendimento.raw).length > 0 ? true : false,
                        medicacaoDiaria: {
                            deveTomar: app.server.service.v2.escalaService.isEquals('S06','Q02', atendimento.raw, 'Sim'),
                            acessoMedicacao: app.server.service.v2.escalaService.extractBoolean('S06','Q04', atendimento.raw, 'Sim, consigo adquirí-las', 'Não, meus medicamentos estão faltando'),
                        }
                    },
                    domicilio: {
                        viveSozinho: app.server.service.v2.escalaService.isEquals('S09','Q01', atendimento.raw, 'Somente o idoso'),
                        apresentaSintomasGripeCOVID: app.server.service.v2.escalaService.extractRequiredList('S10','Q01', atendimento.raw).length > 0 ? true : false,
                        habitosAcompanhantes: {
                            saiDeCasa: app.server.service.v2.escalaService.isEquals('S11','Q01', atendimento.raw, 'Sim'),
                        },
                    },
                    vulnerabilidades: {
                        alimentar: app.server.service.v2.escalaService.isEquals('S12','Q02', atendimento.raw, 'Sim'),
                        financeira: app.server.service.v2.escalaService.isEquals('S12','Q03', atendimento.raw, 'Sim'),
                        violencia: app.server.service.v2.escalaService.isEquals('S12','Q04', atendimento.raw, 'Sim'),
                    },
                };

                // TODO trasnformar essas strings hardcoded em constantes
                if(atendimento.tipo == 'Primeiro atendimento') {
                    // await app.server.service.v2.idosoService.upsertEpidemiologia(atendimento.idosoId, atendimento.raw['S08']);
                    
                    criterios.epidemiologia = {
                        isolamento: {
                            saiDeCasa: app.server.service.v2.escalaService.isEquals('S08','Q02', atendimento.raw, 'Sim'),
                        },
                        visitas: {
                            recebeVisitas: app.server.service.v2.escalaService.isNotEquals('S08','Q06', atendimento.raw, 'O idoso não recebe visitas'),
                        },
                    };
                } else {// acompanhamento
                    // copia a epidemilogia do primeiro atendimento
                    const epidemiologiaRaw = await app.server.service.v2.atendimentoService.getEpidemiologia(atendimento.idosoId);
                    console.log('epidemiologiaRaw', epidemiologiaRaw)
                    if(epidemiologiaRaw && epidemiologiaRaw['S08']) {
                        atendimento.raw['S08'] = epidemiologiaRaw['S08'];
                    }

                    criterios.epidemiologia = {
                        isolamento: {
                            saiDeCasa: app.server.service.v2.escalaService.isEquals('S08','Q02', epidemiologiaRaw, 'Sim'),
                        },
                        visitas: {
                            recebeVisitas: app.server.service.v2.escalaService.isNotEquals('S08','Q06', epidemiologiaRaw, 'O idoso não recebe visitas'),
                        },
                    };
                }
                
                // console.log(criterios);
                atendimento.criterios = criterios;

                atendimento.escalas = app.server.service.v2.escalaService.calcularEscalas(criterios, atendimento.timestamp);

                await app.server.service.v2.atendimentoService.insertOne(atendimento);
                
                // TODO atualizar idoso com estatisticas
                const estatisticas = {
                    // qtdAtendimentosEfetuados: null,
                    // qtdTotal: null,
                    ultimoAtendimento: {
                        timestamp: atendimento.timestamp,
                        efetuado: atendimento.atendeu,
                    },
                    // ultimaEscala: {
                    //     timestamp: null,
                    //     scoreOrdenacao: null,
                    //     vulnerabilidade: null,
                    //     epidemiologica: null,
                    //     riscoContagio: null,
                    //     dataProximoAtendimento: null,
                    // },
                };
                estatisticas.ultimaEscala = await app.server.service.v2.atendimentoService.getEscalas(atendimento.idosoId);
                estatisticas.count = await app.server.service.v2.atendimentoService.count(atendimento.idosoId);
                console.log(estatisticas)
                await app.server.service.v2.idosoService.upsertEstatisticas(atendimento.idosoId, estatisticas);

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