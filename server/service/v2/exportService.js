const fastcsv = require("fast-csv");
// const fs = require("fs");
// const path = require("path");

module.exports = app => {
    
    /**
     * 
     */
    const exportIdososCSV = async (unidadeId) => {
        const unidade = await app.server.service.v2.unidadeService.getById(unidadeId);
        const result = await app.server.service.v2.idosoService.findWithVigilantes(unidadeId);
    
        const data = result.map((idoso) => {
            return {
                _id: idoso._id,
                nome: idoso.nome,
                telefone1: idoso.telefone1,
                telefone2: idoso.telefone2,
                unidade_id: idoso.unidadeId,
                unidade_nome: unidade.nome,
                agenteSaude: idoso.agenteSaude,
                dataNascimento: idoso.dataNascimento,
                vigilante_id: idoso.vigilanteId,
                vigilante_nome: idoso.vigilanteNome.length ? idoso.vigilanteNome[0].name : null,
                qtdAtendimentosEfetuados: idoso.estatisticas.qtdAtendimentosEfetuados ? idoso.estatisticas.qtdAtendimentosEfetuados : 0,
                qtdTotal: idoso.estatisticas.qtdTotal ? idoso.estatisticas.qtdTotal : 0,
                ultimoAtendimento_timestamp: idoso.estatisticas.ultimoAtendimento ? idoso.estatisticas.ultimoAtendimento.timestamp : null,
                ultimoAtendimento_atendeu: idoso.estatisticas.ultimoAtendimento ? idoso.estatisticas.ultimoAtendimento.atendeu : null,
                ultimaEscala_timestamp: idoso.estatisticas.ultimaEscala ? idoso.estatisticas.ultimaEscala.timestamp : null,
                ultimaEscala_scoreOrdenacao: idoso.estatisticas.ultimaEscala ? idoso.estatisticas.ultimaEscala.escalas.scoreOrdenacao : null,
                ultimaEscala_vulnerabilidade: idoso.estatisticas.ultimaEscala ? idoso.estatisticas.ultimaEscala.escalas.vulnerabilidade : null,
                ultimaEscala_epidemiologica: idoso.estatisticas.ultimaEscala ? idoso.estatisticas.ultimaEscala.escalas.epidemiologica : null,
                ultimaEscala_riscoContagio: idoso.estatisticas.ultimaEscala ? idoso.estatisticas.ultimaEscala.escalas.riscoContagio : null,
                ultimaEscala_dataProximoAtendimento: idoso.estatisticas.ultimaEscala ? idoso.estatisticas.ultimaEscala.escalas.dataProximoAtendimento : null,
            }
        });
        return data;
    }
    
    /**
     * 
     */
    const exportAtendimentosCSV = async (unidadeId) => {
        const unidade = await app.server.service.v2.unidadeService.getById(unidadeId);
        const result = await app.server.service.v2.atendimentoService.findAllByUnidade(unidadeId);

        const data = result.map((atendimento) => {
            return {
                _id: atendimento._id,
                unidade_id: atendimento.unidadeId,
                unidade_nome: unidade.nome,
                idoso_id: atendimento.idosoId,
                idoso_nome: atendimento.idosoNome.length ? atendimento.idosoNome[0].nome : null,
                vigilante_id: atendimento.vigilanteId,
                vigilante_nome: atendimento.vigilanteNome.length ? atendimento.vigilanteNome[0].name : null,
                timestamp: atendimento.timestamp,
                tipo: atendimento.tipo,
                atendeu: atendimento.atendeu,
                fonte: atendimento.fonte,
                duracaoChamada: atendimento.duracaoChamada,
                idadeIdoso: atendimento.idadeIdoso,
                scoreOrdenacao: atendimento.escalas ? atendimento.escalas.scoreOrdenacao : null,
                vulnerabilidade: atendimento.escalas ? atendimento.escalas.vulnerabilidade : null,
                epidemiologica: atendimento.escalas ? atendimento.escalas.epidemiologica : null,
                riscoContagio: atendimento.escalas ? atendimento.escalas.riscoContagio : null,
                dataProximoAtendimento: atendimento.escalas ? atendimento.escalas.dataProximoAtendimento : null,
                S01Q01: atendimento.raw.S01 ? atendimento.raw.S01.Q01.response : null,
                S01Q02: atendimento.raw.S01 ? atendimento.raw.S01.Q02.response : null,
                S01Q03: atendimento.raw.S01 ? atendimento.raw.S01.Q03.response : null,
                S02Q01: atendimento.raw.S02 ? atendimento.raw.S02.Q01.response : null,
                S03Q01: atendimento.raw.S03 ? atendimento.raw.S03.Q01.response : null,
                S04Q01: atendimento.raw.S04 ? atendimento.raw.S04.Q01.response : null,
                S05Q01: atendimento.raw.S05 ? atendimento.raw.S05.Q01.response : null,
                S05Q02: atendimento.raw.S05 && atendimento.raw.S05.Q02 ? atendimento.raw.S05.Q02.response : null,
                S05Q03: atendimento.raw.S05 && atendimento.raw.S05.Q03 ? atendimento.raw.S05.Q03.response : null,
                S05Q04: atendimento.raw.S05 && atendimento.raw.S05.Q04 ? atendimento.raw.S05.Q04.response : null,
                S05Q05: atendimento.raw.S05 ? atendimento.raw.S05.Q05.response : null,
                S06Q01: atendimento.raw.S06 ? atendimento.raw.S06.Q01.response : null,
                S06Q02: atendimento.raw.S06 ? atendimento.raw.S06.Q02.response : null,
                S06Q03: atendimento.raw.S06 && atendimento.raw.S06.Q03 ? atendimento.raw.S06.Q03.response : null,
                S06Q04: atendimento.raw.S06 ? atendimento.raw.S06.Q04.response : null,
                S07Q01: atendimento.raw.S07 ? atendimento.raw.S07.Q01.response : null,
                S08Q01: atendimento.raw.S08 ? atendimento.raw.S08.Q01.response : null,
                S08Q02: atendimento.raw.S08 ? atendimento.raw.S08.Q02.response : null,
                S08Q03: atendimento.raw.S08 && atendimento.raw.S08.Q03 ? atendimento.raw.S08.Q03.response : null,
                S08Q04: atendimento.raw.S08 && atendimento.raw.S08.Q04 ? atendimento.raw.S08.Q04.response : null,
                S08Q05: atendimento.raw.S08 && atendimento.raw.S08.Q05 ? atendimento.raw.S08.Q05.response : null,
                S08Q06: atendimento.raw.S08 ? atendimento.raw.S08.Q06.response : null,
                S08Q07: atendimento.raw.S08 ? atendimento.raw.S08.Q07.response : null,
                S08Q08: atendimento.raw.S08 && atendimento.raw.S08.Q08 ? atendimento.raw.S08.Q08.response : null,
                S09Q01: atendimento.raw.S09 ? atendimento.raw.S09.Q01.response : null,
                S10Q01: atendimento.raw.S10 ? atendimento.raw.S10.Q01.response : null,
                S11Q01: atendimento.raw.S11 && atendimento.raw.S11.Q01 ? atendimento.raw.S11.Q01.response : null,
                S11Q02: atendimento.raw.S11 && atendimento.raw.S11.Q02 ? atendimento.raw.S11.Q02.response : null,
                S11Q03: atendimento.raw.S11 && atendimento.raw.S11.Q03 ? atendimento.raw.S11.Q03.response : null,
                S11Q04: atendimento.raw.S11 && atendimento.raw.S11.Q04 ? atendimento.raw.S11.Q04.response : null,
                S12Q01: atendimento.raw.S12 ? atendimento.raw.S12.Q01.response : null,
                S12Q02: atendimento.raw.S12 ? atendimento.raw.S12.Q02.response : null,
                S12Q03: atendimento.raw.S12 ? atendimento.raw.S12.Q03.response : null,
                S12Q04: atendimento.raw.S12 ? atendimento.raw.S12.Q04.response : null,
                S12Q05: atendimento.raw.S12 && atendimento.raw.S12.Q05 ? atendimento.raw.S12.Q05.response : null,
                S13Q01: atendimento.raw.S13 && atendimento.raw.S13.Q01 ? atendimento.raw.S13.Q01.response : null,
            }
        });

        return data;

    }



    return { exportIdososCSV, exportAtendimentosCSV }
}