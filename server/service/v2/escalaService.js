/**
 * regras de negocio para calculo das escalas
 */

module.exports = app => {

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
                increment = 20;
                break; 
            case epidemiologicaEnum.II_A:
            case epidemiologicaEnum.II_B:
            case epidemiologicaEnum.III_A:
                increment = 14;
                break; 
            case epidemiologicaEnum.IV_A:
                increment = 7;
                break; 
            case epidemiologicaEnum.III_B:
                increment = 3;
                break; 
            case epidemiologicaEnum.IV_B:
                increment = 1;
                break;
            default:
                return null;
        }
    
        const nextDate = new Date(dataAtendimento);
        nextDate.setDate(nextDate.getDate() + increment);
        // console.log(nextDate.toLocaleDateString())
        return nextDate;
    }    

    return { riscoContagioEnum, vulnerabilidadeEnum, epidemiologicaEnum, calcularEscalas, calcularEscalaVulnerabilidade, calculaEscalaEpidemiologica, calcularEscalaRiscoContagio, calcularDataProximoAtendimento }
}