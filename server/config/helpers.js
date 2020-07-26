
/**
 * regras de negocio para calculo das escalas
 */


function calcularEscalas(atendimento) {
    const vulnerabilidade = calcularEscalaVulnerabilidade(atendimento);
    const epidemiologica = calculaEscalaEpidemiologica(atendimento);
    const riscoContagio = calcularEscalaRiscoContagio(atendimento);

    let scoreOrdenacao = 0;

    switch (riscoContagio) {
        case 'baixo':
            scoreOrdenacao += 1;
            break;
        case 'médio':
            scoreOrdenacao += 2;
            break;
        case 'alto':
            scoreOrdenacao += 3;
            break;
    }

    switch (epidemiologica) {
        case 'Ia - Assintomático, mora com assintomáticos':
            scoreOrdenacao += 10;
            break;
        case 'Ib - Assintomático, mas vive sozinho':
            scoreOrdenacao += 20;
            break;
        case 'IIa - Assintomático, mas sai de casa':
            scoreOrdenacao += 30;
            break;
        case 'IIb - Assitomático, mas recebe visita ou domiciliares saem':
            scoreOrdenacao += 40;
            break;
        case 'IIIa - Assintomático, mas com comorbidades':
            scoreOrdenacao += 50;
            break;
        case 'IIIb - Assintomático, mas tem contato com sintomáticos ou confirmados':
            scoreOrdenacao += 60;
            break;
        case 'IVa - Assintomático, mas sem medicações':
            scoreOrdenacao += 70;
            break;
        case 'IVb - Idoso sintomático':
            scoreOrdenacao += 80;
            break;
    }

    switch (vulnerabilidade) {
        case 'A - vulnerabilidade financeira':
            scoreOrdenacao += 100;
            break;
        case 'B - vulnerabilidade alimentar':
            scoreOrdenacao += 200;
            break;
        case 'C - situação de violência':
            scoreOrdenacao += 300;
            break;
    }

    const dataProximoAtendimento = calcularDataProximoAtendimento(epidemiologica, atendimento.data);

    return {
        vulnerabilidade,
        epidemiologica,
        riscoContagio,
        dataProximoAtendimento,
        scoreOrdenacao,
    };
}

function calcularEscalaVulnerabilidade(atendimento) {
    if(atendimento.dadosIniciais.atendeu) {
        if(atendimento.vulnerabilidades.violencia) {
            return 'C - situação de violência';
        } else if(atendimento.vulnerabilidades.alimentar){
            return 'B - vulnerabilidade alimentar';
        } else if(atendimento.vulnerabilidades.financeira) {
            return 'A - vulnerabilidade financeira';
        } else {
            return '0 - Sem vulnerabilidades';
        }
    } else {
        return null;
    }
}

function calculaEscalaEpidemiologica(atendimento) {
    if(atendimento.dadosIniciais.atendeu) {
        if(atendimento.apresentaSinomasGripeCOVID) {
            return 'IVb - Idoso sintomático';
        }
        if(atendimento.comorbidades.medicacaoDiaria.deveTomar && !atendimento.comorbidades.medicacaoDiaria.acessoMedicacao) {
            return 'IVa - Assintomático, mas sem medicações';
        }
        if(atendimento.sintomasDomicilio || atendimento.sintomasIdoso.contatoComCasoConfirmado) {
            return 'IIIb - Assintomático, mas tem contato com sintomáticos ou confirmados';
        } 
        if(atendimento.comorbidades.condicoesSaude) {
            return 'IIIa - Assintomático, mas com comorbidades';
        } 
        if(atendimento.habitosDomiciliaresAcompanhantes.saiDeCasa || atendimento.epidemiologia.visitas.recebeVisitas){
            return 'IIb - Assitomático, mas recebe visita ou domiciliares saem';
        }
        if(atendimento.epidemiologia.isolamento.saiDeCasa){
            return 'IIa - Assintomático, mas sai de casa';
        } 
        if(atendimento.qtdAcompanhantesDomicilio === 0) {
            return 'Ib - Assintomático, mas vive sozinho';
        }
        if(!atendimento.sintomasDomicilio) {
            return 'Ia - Assintomático, mora com assintomáticos';
        } else {
            return '?';
        }
    }
    return '0 - Não atendeu à ligação';
}

function calcularEscalaRiscoContagio(atendimento) {
    let score = 0;
    if(!atendimento.dadosIniciais.atendeu) {
        score = null;
    } else {
        if(atendimento.sintomasIdoso.contatoComCasoConfirmado) {
            score += 10;
        }
        if(atendimento.sintomasIdoso.sintomas.includes('Falta de ar / Dificuldade para respirar')) {
            score += 10;
        }
        if(atendimento.sintomasIdoso.sintomas.includes('Febre')) {
            score += 5;
        }
        if(atendimento.sintomasIdoso.sintomas.includes('Tosse seca')) {
            score += 3;
        }
        if(atendimento.sintomasIdoso.sintomas.includes('Perda do olfato ou paladar')) {
            score += 3;
        }
        if(atendimento.sintomasIdoso.sintomas.includes('Dor de cabeça')) {
            score += 1;
        }
        if(atendimento.sintomasIdoso.sintomas.includes('Secreção nasal / Espirros')) {
            score += 1;
        }
        if(atendimento.sintomasIdoso.sintomas.includes('Dor na Garganta')) {
            score += 1;
        }
        if(atendimento.sintomasIdoso.sintomas.includes('Dor no corpo ou fadiga')) {
            score += 1;
        }
        if(atendimento.sintomasIdoso.sintomas.includes('Diarreia')) {
            score += 1;
        }
    }

    if(score === null) {
        return null;
    } else {
        if(score <= 9) {
            return 'baixo';
        } else if(score <= 19) {
            return 'médio';
        } else {
            return 'alto';
        } 
    }
}

function calcularDataProximoAtendimento(epidemiologica, date) {
    let increment = 0;
    switch(epidemiologica) {
        case 'Ia - Assintomático, mora com assintomáticos':
        case 'Ib - Assintomático, mas vive sozinho':
            increment = 10;
            break; 
        case 'IIa - Assintomático, mas sai de casa':
        case 'IIb - Assitomático, mas recebe visita ou domiciliares saem':
        case 'IIIa - Assintomático, mas com comorbidades':
            increment = 7;
            break; 
        case 'IVa - Assintomático, mas sem medicações':
            increment = 3;
            break; 
        case 'IIIb - Assintomático, mas tem contato com sintomáticos ou confirmados':
            increment = 2;
            break; 
        case 'IVb - Idoso sintomático':
            increment = 1;
            break;
        default:
            return null;
    }

    const nextDate = new Date(date.getTime());
    nextDate.setDate(nextDate.getDate() + increment);
    return nextDate;
}

module.exports = { calcularEscalas, calcularEscalaVulnerabilidade, calculaEscalaEpidemiologica, calcularEscalaRiscoContagio, calcularDataProximoAtendimento };