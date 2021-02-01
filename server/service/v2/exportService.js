const fastcsv = require("fast-csv");
// const fs = require("fs");
// const path = require("path");

module.exports = app => {
    
    /**
     * 
     */
    const exportCSV = async (unidadeId) => {
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



        // const stream = fastcsv.format({ headers: true, delimiter: ';' });
        // stream.pipe(ws);

        // stream.write(result);
        // stream.end(() => {
        //     console.log("Write to .csv de verdade successfully!");
        // });

        // console.log("Write to .csv successfully!");
        // await fastcsv
        //     .write(result, { headers: true, delimiter: ';' })
        //     .on("finish", () => {
        //         console.log("Write to .csv successfully!");
        //         return result;
        //     })
        //     .on("error", error => {
        //         throw error;
        //     })
        //     .pipe(ws);
    }



    return { exportCSV }
}