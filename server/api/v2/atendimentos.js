
/**
 * regras de negocio para calculo das escalas
 */
const riscoContagioEnum = Object.freeze({
    BAIXO: 'Baixo',
    MEDIO: 'Médio',
    ALTO: 'Alto',
});

const vulnerabilidadeEnum = Object.freeze({
    SITUACAO_VIOLENCIA: 'C - Situação de violência',
    VULNERABILIDADE_ALIMENTAR: 'B - Vulnerabilidade alimentar',
    VULNERABILIDADE_FINANCEIRA: 'A - Vulnerabilidade financeira',
    SEM_VULNERABILIDADES: '0 - Sem vulnerabilidades',
});

const epidemiologicaEnum = Object.freeze({
    IV_B: 'IVb - Idoso sintomático',
    IV_A: 'IVa - Assintomático, mas sem medicações',
    III_B: 'IIIb - Assintomático, mas tem contato com sintomáticos ou confirmados',
    III_A: 'IIIa - Assintomático, mas com comorbidades',
    II_B: 'IIb - Assintomático, mas recebe visita ou domiciliares saem',
    II_A: 'IIa - Assintomático, mas sai de casa',
    I_B: 'Ib - Assintomático, mas vive sozinho',
    I_A: 'Ia - Assintomático, mora com assintomáticos',
    NAO_ATENDEU: '0 - Não atendeu à ligação',
});

function calcularEscalas(criterios, dataAtendimento) {
    const vulnerabilidade = calcularEscalaVulnerabilidade(criterios);
    const epidemiologica = calculaEscalaEpidemiologica(criterios);
    const riscoContagio = calcularEscalaRiscoContagio(criterios);

    let scoreOrdenacao = 0;

    switch (riscoContagio) {
        case riscoContagioEnum.BAIXO:
            scoreOrdenacao += 1;
            break;
        case riscoContagioEnum.MEDIO:
            scoreOrdenacao += 2;
            break;
        case riscoContagioEnum.ALTO:
            scoreOrdenacao += 3;
            break;
    }

    switch (epidemiologica) {
        case epidemiologicaEnum.I_A:
            scoreOrdenacao += 10;
            break;
        case epidemiologicaEnum.I_B:
            scoreOrdenacao += 20;
            break;
        case epidemiologicaEnum.II_A:
            scoreOrdenacao += 30;
            break;
        case epidemiologicaEnum.II_B:
            scoreOrdenacao += 40;
            break;
        case epidemiologicaEnum.III_A:
            scoreOrdenacao += 50;
            break;
        case epidemiologicaEnum.III_B:
            scoreOrdenacao += 60;
            break;
        case epidemiologicaEnum.IV_A:
            scoreOrdenacao += 70;
            break;
        case epidemiologicaEnum.IV_B:
            scoreOrdenacao += 80;
            break;
    }

    switch (vulnerabilidade) {
        case vulnerabilidadeEnum.VULNERABILIDADE_FINANCEIRA:
            scoreOrdenacao += 100;
            break;
        case vulnerabilidadeEnum.VULNERABILIDADE_ALIMENTAR:
            scoreOrdenacao += 200;
            break;
        case vulnerabilidadeEnum.SITUACAO_VIOLENCIA:
            scoreOrdenacao += 300;
            break;
    }

    const dataProximoAtendimento = calcularDataProximoAtendimento(epidemiologica, dataAtendimento);

    return {
        vulnerabilidade,
        epidemiologica,
        riscoContagio,
        dataProximoAtendimento,
        scoreOrdenacao,
    };
}

function calcularEscalaVulnerabilidade(criterios) {
    if(criterios.atendeu) {
        if(criterios.vulnerabilidades.violencia) {
            return vulnerabilidadeEnum.SITUACAO_VIOLENCIA;
        } else if(criterios.vulnerabilidades.alimentar){
            return vulnerabilidadeEnum.VULNERABILIDADE_ALIMENTAR;
        } else if(criterios.vulnerabilidades.financeira) {
            return vulnerabilidadeEnum.VULNERABILIDADE_FINANCEIRA;
        } else {
            return vulnerabilidadeEnum.SEM_VULNERABILIDADES;
        }
    } else {
        return null;
    }
}

function calculaEscalaEpidemiologica(criterios) {
    if(criterios.atendeu) {
        if(criterios.sintomasIdoso.apresentaSintomasGripeCOVID) {
            return epidemiologicaEnum.IV_B;
        }
        if(criterios.comorbidades.medicacaoDiaria.deveTomar && criterios.comorbidades.medicacaoDiaria.acessoMedicacao === false) {
            return epidemiologicaEnum.IV_A;
        }
        if(criterios.domicilio.apresentaSintomasGripeCOVID || criterios.sintomasIdoso.contatoComCasoConfirmado) {
            return epidemiologicaEnum.III_B;
        } 
        if(criterios.comorbidades.apresentaCondicoesSaude) {
            return epidemiologicaEnum.III_A;
        } 
        if(criterios.domicilio.habitosAcompanhantes.saiDeCasa || criterios.epidemiologia.visitas.recebeVisitas){
            return epidemiologicaEnum.II_B;
        }
        if(criterios.epidemiologia.isolamento.saiDeCasa){
            return epidemiologicaEnum.II_A;
        } 
        if(criterios.domicilio.viveSozinho) {
            return epidemiologicaEnum.I_B;
        }
        if(!criterios.domicilio.apresentaSintomasGripeCOVID) {
            return epidemiologicaEnum.I_A;
        } else {
            return '?';
        }
    }
    return epidemiologicaEnum.NAO_ATENDEU;
}

function calcularEscalaRiscoContagio(criterios) {
    let score = 0;
    if(!criterios.atendeu) {
        score = null;
    } else {
        if(criterios.sintomasIdoso.contatoComCasoConfirmado) {
            score += 10;
        }
        if(criterios.sintomasIdoso.sintomas.includes('Falta de ar / Dificuldade para respirar')) {
            score += 10;
        }
        if(criterios.sintomasIdoso.sintomas.includes('Febre')) {
            score += 5;
        }
        if(criterios.sintomasIdoso.sintomas.includes('Tosse seca')) {
            score += 3;
        }
        if(criterios.sintomasIdoso.sintomas.includes('Perda do olfato ou paladar')) {
            score += 3;
        }
        if(criterios.sintomasIdoso.sintomas.includes('Dor de cabeça')) {
            score += 1;
        }
        if(criterios.sintomasIdoso.sintomas.includes('Secreção nasal / Espirros')) {
            score += 1;
        }
        if(criterios.sintomasIdoso.sintomas.includes('Dor na Garganta')) {
            score += 1;
        }
        if(criterios.sintomasIdoso.sintomas.includes('Dor no corpo ou fadiga')) {
            score += 1;
        }
        if(criterios.sintomasIdoso.sintomas.includes('Diarreia')) {
            score += 1;
        }
    }

    if(score === null) {
        return null;
    } else {
        if(score <= 9) {
            return riscoContagioEnum.BAIXO;
        } else if(score <= 19) {
            return riscoContagioEnum.MEDIO;
        } else {
            return riscoContagioEnum.ALTO;
        } 
    }
}

function calcularDataProximoAtendimento(epidemiologica, dataAtendimento) {
    let increment = 0;
    switch(epidemiologica) {
        case epidemiologicaEnum.I_A:
        case epidemiologicaEnum.I_B:
            increment = 10;
            break; 
        case epidemiologicaEnum.II_A:
        case epidemiologicaEnum.II_B:
        case epidemiologicaEnum.III_A:
            increment = 7;
            break; 
        case epidemiologicaEnum.IV_A:
            increment = 3;
            break; 
        case epidemiologicaEnum.III_B:
            increment = 2;
            break; 
        case epidemiologicaEnum.IV_B:
            increment = 1;
            break;
        default:
            return null;
    }

    const nextDate = new Date(dataAtendimento);
    nextDate.setDate(nextDate.getDate() + increment);
    return nextDate;
}


/**
 * Extrai uma resposta do array de respostas
 * @param {*} session identificador da seção no form. Ex: 'S03'
 * @param {*} question identificador da questão na seção. Ex: 'Q06'
 * @param {*} fichaVigilancia array com respostas do questionário
 * @returns null ou String
 */
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

/**
 * Extrai uma resposta e converte para Number
 * @param {*} session 
 * @param {*} question 
 * @param {*} fichaVigilancia 
 * @returns Number ou null
 */
const extractNumber = (session, question, fichaVigilancia) => {
    const response = extractResponse(session, question, fichaVigilancia);
    return response ? +response : null;
}

/**
 * Retorna um booleano se o valor recebido é equivalente a trueValue.
 * 
 * Se falseValue também for informado:
 * retorna false caso o valor recebido seja equivalente a falseValue, e retorna null se o valor recebido for diferente de ambos 
 * @param {*} session 
 * @param {*} question 
 * @param {*} fichaVigilancia 
 * @param {*} trueValue 
 * @param {*} falseValue 
 * @return Boolean ou null
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
 * Retorna true se a resposta for igual a trueValue
 * @param {*} session 
 * @param {*} question 
 * @param {*} fichaVigilancia 
 * @param {*} trueValue 
 * @return Boolean
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
 * @return Boolean
 */
const isNotEquals = (session, question, fichaVigilancia, falseValue) => {
    return !isEquals(session, question, fichaVigilancia, falseValue);
}

/**
 * Extrai uma resposta de multipla escolha
 * Retorna um array vazio se o primeiro item da lista for igual a 'Não'
 * @param {*} session 
 * @param {*} question 
 * @param {*} fichaVigilancia 
 * @return Array
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

                atendimento.idosoId = extractResponse('S01','Q01', atendimento.raw);
                atendimento.vigilanteId = extractResponse('S01','Q02', atendimento.raw);
                atendimento.unidadeId = extractResponse('S01','Q03', atendimento.raw);
                atendimento.atendeu = isEquals('S02','Q01', atendimento.raw, 'Sim');
                atendimento.fonte = extractResponse('S04','Q01', atendimento.raw);
                atendimento.tipo =  extractResponse('S07','Q01', atendimento.raw);
                atendimento.idadeIdoso = extractNumber('S03','Q01', atendimento.raw);
                atendimento.duracaoChamada = extractResponse('S13','Q01', atendimento.raw);
                atendimento._isDeleted = false;

                const criterios = {
                    atendeu: isEquals('S02','Q01', atendimento.raw, 'Sim'),
                    sintomasIdoso: {
                        apresentaSintomasGripeCOVID: extractRequiredList('S05','Q01', atendimento.raw).length > 0 ? true : false,
                        sintomas: extractRequiredList('S05','Q01', atendimento.raw),
                        contatoComCasoConfirmado: isEquals('S05','Q05', atendimento.raw, 'Sim'),
                    },
                    comorbidades: {
                        apresentaCondicoesSaude: extractRequiredList('S06','Q01', atendimento.raw).length > 0 ? true : false,
                        medicacaoDiaria: {
                            deveTomar: isEquals('S06','Q02', atendimento.raw, 'Sim'),
                            acessoMedicacao: extractBoolean('S06','Q04', atendimento.raw, 'Sim, consigo adquirí-las', 'Não, meus medicamentos estão faltando'),
                        }
                    },
                    domicilio: {
                        viveSozinho: isEquals('S09','Q01', atendimento.raw, 'Somente o idoso'),
                        apresentaSintomasGripeCOVID: extractRequiredList('S10','Q01', atendimento.raw).length > 0 ? true : false,
                        habitosAcompanhantes: {
                            saiDeCasa: isEquals('S11','Q01', atendimento.raw, 'Sim'),
                        },
                    },
                    vulnerabilidades: {
                        alimentar: isEquals('S12','Q02', atendimento.raw, 'Sim'),
                        financeira: isEquals('S12','Q03', atendimento.raw, 'Sim'),
                        violencia: isEquals('S12','Q04', atendimento.raw, 'Sim'),
                    },
                };

                // TODO checar se existe um bug na consulta da epidemiologia
                if(atendimento.tipo == 'Primeiro Atendimento') {
                    // await app.server.service.v2.idosoService.upsertEpidemiologia(atendimento.idosoId, atendimento.raw['S08']);
                    
                    criterios.epidemiologia = {
                        isolamento: {
                            saiDeCasa: isEquals('S08','Q02', atendimento.raw, 'Sim'),
                        },
                        visitas: {
                            recebeVisitas: isNotEquals('S08','Q06', atendimento.raw, 'O idoso não recebe visitas'),
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
                            saiDeCasa: isEquals('S08','Q02', epidemiologiaRaw, 'Sim'),
                        },
                        visitas: {
                            recebeVisitas: isNotEquals('S08','Q06', epidemiologiaRaw, 'O idoso não recebe visitas'),
                        },
                    };
                }
                
                // console.log(criterios);
                atendimento.criterios = criterios;

                atendimento.escalas = calcularEscalas(criterios, atendimento.timestamp);

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