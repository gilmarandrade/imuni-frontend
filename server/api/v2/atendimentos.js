const extractResponse = (session, question, fichaVigilancia) => {
    if(fichaVigilancia && session && question) {
        if(fichaVigilancia[session]) {
            if(fichaVigilancia[session][question] && fichaVigilancia[session][question].response !== null && fichaVigilancia[session][question].response !== undefined && fichaVigilancia[session][question].response !== '') {
                return fichaVigilancia[session][question].response;
            }
        }
    }
    return null;
};

const extractNumber = (session, question, fichaVigilancia) => {
    const response = extractResponse(session, question, fichaVigilancia);
    return response ? +response : null;
}

/**
 * Retorna um booleano se o valor recebido é equivalente a trueValue.
 * Se falseValue também for informado:
 * retorna false caso o valor recebido seja equivalente a falseValue, e retorna null se o valor recebido for diferente de ambos 
 * @param {*} session 
 * @param {*} question 
 * @param {*} fichaVigilancia 
 * @param {*} trueValue 
 * @param {*} falseValue 
 */
const extractBoolean = (session, question, fichaVigilancia, trueValue, falseValue) => {
    if(falseValue !== undefined) {
        const response = extractResponse(session, question, fichaVigilancia);
        if(response == trueValue) {
            return true;
        } else if(response == falseValue){
            return false;
        } else {
            return null;
        }
    }
    return isEquals(session, question, fichaVigilancia);
}

/**
 * Retorna true se as strings forem iguais
 * @param {*} session 
 * @param {*} question 
 * @param {*} fichaVigilancia 
 * @param {*} trueValue 
 */
const isEquals = (session, question, fichaVigilancia, trueValue) => {
    return extractResponse(session, question, fichaVigilancia) == trueValue;
}


/**
 * Retorna false caso a resposta seja igual ao falseValue
 * @param {*} session 
 * @param {*} question 
 * @param {*} fichaVigilancia 
 * @param {*} falseValue 
 */
const isNotEquals = (session, question, fichaVigilancia, falseValue) => {
    return !isEquals(session, question, fichaVigilancia, falseValue);
}

/**
 * Retorna um array 
 * Retorna um array vazio se o primeiro item da lista for igual a 'Não'
 * @param {*} session 
 * @param {*} question 
 * @param {*} fichaVigilancia 
 */
const extractRequiredList = (session, question, fichaVigilancia) => {
    const response = extractResponse(session, question, fichaVigilancia);

    if(Array.isArray(response)) {
        if(response.length > 0 && response[0] == 'Não') {
            return [];
        }
        return response;
    }

    return [];
}



module.exports = app => {

    const save = async (req, res) => {

        const atendimento = req.body;

        console.log('ATENDIMENTO RECEBIDO:');
        try {
            atendimento.timestamp = (new Date(atendimento.timestamp)).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
            console.log(atendimento);

            
            if(atendimento && atendimento.responses) {
                atendimento.raw = {};

                atendimento.responses.forEach(item => {
                    atendimento.raw[item.question.substring(1,4)] = {};
                });

                atendimento.responses.forEach(item => {
                    atendimento.raw[item.question.substring(1,4)][item.question.substring(4,7)] = item;
                });

                console.log(atendimento.raw);
                delete atendimento.responses;

                const fichaVigilancia = {
                    data: new Date(atendimento.timestamp),
                    vigilante: atendimento.vigilanteId,
                    atendeu: isEquals('S02','Q01', atendimento.raw, 'Sim'),
                    idade: extractNumber('S03','Q01', atendimento.raw),
                    fonte: extractResponse('S04','Q01', atendimento.raw),
                    sintomasIdoso: {
                        sintomas: extractRequiredList('S05','Q01', atendimento.raw),
                        outrosSintomas: extractRequiredList('S05','Q02', atendimento.raw),
                        detalhesAdicionais: extractResponse('S05','Q03', atendimento.raw),
                        haQuantosDiasIniciaram: extractNumber('S05','Q04', atendimento.raw),
                        contatoComCasoConfirmado: isEquals('S05','Q05', atendimento.raw, 'Sim'),
                    },
                    comorbidades: {
                        condicoesSaude: extractRequiredList('S06','Q01', atendimento.raw),
                        medicacaoDiaria: {
                            deveTomar: isEquals('S06','Q02', atendimento.raw, 'Sim'),
                            medicacoes: extractResponse('S06','Q03', atendimento.raw),
                            acessoMedicacao: extractBoolean('S06','Q04', atendimento.raw, 'Sim, consigo adquirí-las', 'Não, meus medicamentos estão faltando'),
                        }
                    },
                    primeiroAtendimento: isEquals('S07','Q01', atendimento.raw, 'Primeiro atendimento'),
                    epidemiologia: {
                        higienizacaoMaos: isEquals('S08','Q01', atendimento.raw, 'Sim'),
                        isolamento: {
                            saiDeCasa: isEquals('S08','Q02', atendimento.raw, 'Sim'),
                            frequencia: extractResponse('S08','Q03', atendimento.raw),
                            paraOnde: extractRequiredList('S08','Q04', atendimento.raw),
                        },
                        recebeApoioFamiliarOuAmigo: extractBoolean('S08','Q05', atendimento.raw, 'Sim', 'Não'),
                        visitas: {
                            recebeVisitas: isNotEquals('S08','Q06', atendimento.raw, 'O idoso não recebe visitas'),
                            tomamCuidadosPrevencao: extractBoolean('S08','Q06', atendimento.raw, 'Sim, e as visitas estão tomando os cuidados de prevenção', 'Sim, mas as visitas não estão tomando cuidados de prevenção'),
                        },
                        qtdComodosCasa:  extractNumber('S08','Q07', atendimento.raw),
                        realizaAtividadePrazerosa: isEquals('S08','Q08', atendimento.raw, 'Sim'),
                    },
                    qtdAcompanhantesDomicilio: extractResponse('S09','Q01', atendimento.raw),
                    sintomasDomicilio: extractRequiredList('S10','Q01', atendimento.raw),
                    habitosDomiciliaresAcompanhantes: {
                        saiDeCasa: isEquals('S11','Q01', atendimento.raw, 'Sim'),
                        higienizacaoMaos: isEquals('S11','Q02', atendimento.raw, 'Sim'),
                        compartilhamentoUtensilios: isEquals('S11','Q03', atendimento.raw, 'Sim'),
                        usoMascara: isEquals('S11','Q04', atendimento.raw, 'Sim'),
                    },
                    vulnerabilidades: {
                        convivioFamilia: extractResponse('S12','Q01', atendimento.raw),
                        alimentar: extractResponse('S12','Q02', atendimento.raw),
                        financeira: extractResponse('S12','Q03', atendimento.raw),
                        violencia: extractResponse('S12','Q04', atendimento.raw),
                        observacoes: extractResponse('S12','Q05', atendimento.raw),
                    },
                    duracaoChamada: extractResponse('S13','Q01', atendimento.raw),
                }

                console.log(fichaVigilancia);

                atendimento.fichaVigilancia = fichaVigilancia;
                await app.server.service.v2.atendimentoService.insertOne(atendimento);
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

    return { save, getById };
};