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
            }
        });

        return data;

    }



    return { exportIdososCSV, exportAtendimentosCSV }
}