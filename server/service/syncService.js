const { calcularEscalas } = require('../config/helpers');
const sheetsApi = require('../config/sheetsApi');
const atendimentoService = require('./atendimentoService');
const idosoService = require('./idosoService');
const unidadeService = require('./unidadeService');

/**
 * Sincronização completa da unidade (todos os vigilantes e todas as respostas)
 * @param {*} idUnidade 
 */
const fullSyncUnidade = async (idUnidade) => {
    const unidade = await unidadeService.findById(idUnidade);
    
    if(unidade) {
        console.log(`[Sync] ${unidade.nome} STARTING SYNC `);
        console.log(unidade);
        const properties = await prepareDataToSync(unidade);
        // const qtdVigilantes = properties.reduce((count, sheet) => {
        //     return sheet.sheetName.startsWith("Vigilante") ? count + 1 : count;
        // }, 0);
        
        for(let i = 0; i < properties.length; i++) {
            if(properties[i].sheetName.startsWith("Vigilante")) {
                const rows = await syncIdososBySheetName(unidade, properties[i].sheetName);
                if(rows == 0) {// se não encontrou nenhuma linha, tenta mais uma vez
                    await syncIdososBySheetName(unidade, properties[i].sheetName);
                }
            }
        }
        
        await syncAtendimentos(unidade, null);
        console.log(`[Sync] ${unidade.nome} ENDED SYNC `);
    } else {
        throw 'Ocorreu um erro ao sincronizar a unidade, tente novamente';
    }
}

/**
 * Sincronização parcial da unidade (apenas as ultimas respostas)
 * @param {*} idUnidade 
 */
const partialSyncUnidade = async (idUnidade) => {
    const unidade = await unidadeService.findById(idUnidade);
    
    if(unidade) {
        console.log(`[Sync] ${unidade.nome} STARTING SOFTSYNC `);
        console.log(unidade);
        await syncAtendimentos(unidade, 20);
        console.log(`[Sync] ${unidade.nome} ENDED SOFTSYNC `);
    } else {
        throw 'Ocorreu um erro ao sincronizar a unidade, tente novamente';
    }
}

/**
 * Apaga os bancos de dados da unidade
 * @param {*} data 
 */
const resetUnidade = async (idUnidade) => {
    const unidade = await unidadeService.findById(idUnidade);
    
    if(unidade) {
        console.log(`[Sync] ${unidade.nome} RESETING `);
        console.log(unidade);

        unidade.vigilantes = [];
        unidade.lastSyncDate = null;

        await unidadeService.replaceOne(unidade);

        await idosoService.deleteAll(unidade);

        await atendimentoService.deleteAll(unidade);
    } else {
        throw 'Ocorreu um erro ao sincronizar a unidade, tente novamente';
    }
}


/**
 * Encontra o sheetName (nome das abas) que devem ser lidas na planilha
 * Procura essa informação da API do google Sheet (a api não conta o número de linhas preenchidas, e sim o numero máximo de linhas no grid, então é uma estimativa com folga)
 * @param {*} unidade 
 */
const prepareDataToSync = async (unidade) => {
    const sheetsToSync = [];
    try {
        const spreadSheetProperties = await sheetsApi.getProperties(unidade.idPlanilhaGerenciamento);

        for(let i = 0; i < spreadSheetProperties.sheets.length; i++) {
            const sheetName = spreadSheetProperties.sheets[i].properties.title;
            if(sheetName.startsWith("Vigilante ") || sheetName.startsWith("Respostas")){
                sheetsToSync.push({
                    sheetName, 
                    rowCount: spreadSheetProperties.sheets[i].properties.gridProperties.rowCount,
                })
            }
        }
        
    } catch(err) {
        console.log(err);
    } finally {
        console.log(sheetsToSync);
        console.log(`[Sync] ${sheetsToSync.length} sheets found`);
        return sheetsToSync;
    }
}

/**
 * atualiza até o limite de itens passados como parametro, caso o limite não seja definido, atualiza todos os itens da planilha
 */
const syncIdososBySheetName = async (unidade, sheetName, limit) => {
    const idososPorVigilantes = [];
    let indexIdosos = 1; //unidade.sync[vigilanteIndex].indexed;
    // let rowsInserted = null;//@deprecated
    const lastIndexSynced = limit ? indexIdosos : 1;
    const firstIndex = lastIndexSynced + 1;//2
    const lastIndex = limit ? lastIndexSynced + limit : '';//''
    let vigilanteNome = '';
    console.log(`[Sync] Reading spreadsheet ${unidade.idPlanilhaGerenciamento} '${sheetName}'!A${firstIndex}:E${lastIndex}`);
    const rows = await sheetsApi.read(unidade.idPlanilhaGerenciamento, `'${sheetName}'!A${firstIndex}:E${lastIndex}`);
    rows.forEach((item, index) => {
        if(item[1]) {//se o idoso tem nome
            vigilanteNome = item[0];
            idososPorVigilantes.push({
                row: `${unidade.collectionPrefix}-'${sheetName}'!A${firstIndex + index}:E${firstIndex + index}`,
                unidade: unidade.nome,
                dataNascimento: '',
                nome: item[1],
                nomeLower: item[1].toLowerCase(),
                telefone1: item[2],
                telefone2: item[3],
                agenteSaude: item[4],
                vigilante: item[0],
                // TODO deprecated?
                // stats: {
                //     qtdAtendimentosEfetuados: 0,
                //     qtdAtendimentosNaoEfetuados: 0,
                //     ultimoAtendimento: null,
                //     ultimaEscala: null,
                // },
                // score: 0,
                // epidemiologia: null,
            });
        }
    });
    indexIdosos = lastIndexSynced + idososPorVigilantes.length;
    if(idososPorVigilantes.length) {
        console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` '${sheetName}'!A${firstIndex}:E${indexIdosos}`);

        //insere os idosos no banco
        // let j = 0;
        // for(; j < idososPorVigilantes.length; j++) {
        //     const resultInsertMany = await idosoService.updateOne(unidade.collectionPrefix, idososPorVigilantes[j]);
        // }
        await idosoService.bulkUpdateOne(unidade.collectionPrefix, idososPorVigilantes);
    } else {
        console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 0 rows found!`);
    }
            
            
    
    // unidade.sync[vigilanteIndex].indexed = indexIdosos;//talvez essa indexação parcial seja necessária no futuro, mas atualmente, todas as sincronizações são totais, não sendo necessário armazenar essas informações
    //atualiza lista de vigilantes da unidade
    const vigilanteIndex = +sheetName.slice(-1);
    if(unidade.vigilantes[vigilanteIndex - 1]) {
        unidade.vigilantes[vigilanteIndex - 1].nome = vigilanteNome;
    } else {
        //atualmente, o campo usuarioId não está sendo utilizado
        unidade.vigilantes[vigilanteIndex - 1] = { sheetName: `${sheetName}`, nome: vigilanteNome };
    }
    // console.log(unidade);
    const result = await unidadeService.replaceOne(unidade);
    // console.log(result.result.n)
    console.log(`[Sync] idososCollection updated`)
    // return rowsInserted;
    return idososPorVigilantes.length;
}

/**
 * atualiza até o limite de itens passados como parametro, caso o limite não seja definido, atualiza todos os itens da planilha
 */
const syncAtendimentos = async (unidade, limit) => {
    let indexRespostas = 1; // unidade.sync[0].indexed;
    const lastIndexSynced = limit ? indexRespostas : 1;
    const firstIndex = lastIndexSynced + 1;
    const lastIndex = limit ? lastIndexSynced + limit : '';

    console.log(`[Sync] Reading spreadsheet ${unidade.idPlanilhaGerenciamento} 'Respostas'!A${firstIndex}:AI${lastIndex}`);
    const rows = await sheetsApi.read(unidade.idPlanilhaGerenciamento, `'Respostas'!A${firstIndex}:AI${lastIndex}`);
    const respostasArray = [];
    rows.forEach((item, index) => {
        //TODO criar uma função para conversao de datas string da planilha para Date
        // 13/05/2020 13:10:19
        var parts = item[0].split(' ');
        var data = parts[0].split('/');
        var hora = parts[1].split(':');

        // para converter a data de Iso para locale use : console.log(testDate.toLocaleString());

        respostasArray.push({
            row: `${unidade.collectionPrefix}-'Respostas'!A${firstIndex + index}:AI${firstIndex + index}`,
            data: new Date(`${data[2]}-${data[1]}-${data[0]}T${hora[0]}:${hora[1]}:${hora[2]}`),
            vigilante: item[1],
            dadosIniciais: {
                nome: item[2],
                nomeLower: item[2].toLowerCase(),
                atendeu: item[3] === 'Sim',
            },
            idade: item[4] === undefined ? null : +item[4],
            fonte: item[5] ? item[5] : '',
            sintomasIdoso: {
                apresentaSinomasGripeCOVID: item[6] !== undefined && item[6] !== 'Não',
                sintomas: item[6] === undefined || item[6] === 'Não' ? [] : item[6].split(',').map(s => s.trim()),
                outrosSintomas: item[7] === undefined || item[7] === 'Não' ? [] : item[7].split(',').map(s => s.trim()),
                detalhesAdicionais: item[8],
                haQuantosDiasIniciaram:  item[9] === undefined ? null : +item[9],
                contatoComCasoConfirmado: item[10] === 'Sim',
            },
            comorbidades: {
                condicoesSaude: item[11] === undefined || item[11] === 'Não' ? [] : item[11].split(',').map(s => s.trim()),
                medicacaoDiaria: {
                    deveTomar: item[12] !== undefined && item[12].startsWith('Sim'),
                    medicacoes: item[12] === undefined || item[12] === 'Não' || item[12] === 'Sim' ? [] : item[12].substring(4).split(',').map(s => s.trim()),
                    acessoMedicacao: item[13] === 'Sim, consigo adquirí-las',
                }
            },
            primeiroAtendimento: item[14] === 'Primeiro atendimento',
            epidemiologia: {
                higienizacaoMaos: item[15] === 'Sim',
                isolamento: {
                    saiDeCasa: item[16] === 'Sim',
                    frequencia: item[17] ? item[17] : '',
                    paraOnde: item[18] ? item[18].split(',').map(s => s.trim()) : [],
                },
                recebeApoioFamiliarOuAmigo: item[19] === 'Sim',
                visitas: {
                    recebeVisitas: item[20] !== undefined && item[20] !== 'O idoso não recebe visitas',
                    tomamCuidadosPrevencao: item[20] === 'Sim, e as visitas estão tomando os cuidados de prevenção',
                },
                qtdComodosCasa:  item[21] === undefined ? null : +item[21],
                realizaAtividadePrazerosa: item[22] === 'Sim',
            },
            qtdAcompanhantesDomicilio: item[23] === 'Somente o idoso' ? 0 : ( item[23] === undefined ? null : +item[23]),
            sintomasDomicilio: item[24] === undefined || item[24] === 'Não' || item[24].trim() === '' ? [] : item[24].split(',').map(s => s.trim()),
            habitosDomiciliaresAcompanhantes: {
                saiDeCasa: item[25] === 'Sim',
                higienizacaoMaos: item[26] === 'Sim',
                compartilhamentoUtensilios: item[27] === 'Sim',
                usoMascara: item[28] === 'Sim',
            },
            vulnerabilidades: {
                convivioFamilia: item[29] ? item[29] : '',
                alimentar: item[30] === 'Sim',
                financeira: item[31] === 'Sim',
                violencia: item[32] === 'Sim',
                observacoes: item[33] ? item[33] : '',
            },
            duracaoChamada: item[34] ? item[34] : '',
        });

    });

    const atendimentosArray = respostasArray.map(resposta => {
        return {
            fichaVigilancia: resposta,
            escalas : calcularEscalas(resposta),
        }
    });

    indexRespostas = lastIndexSynced + atendimentosArray.length;
    if(atendimentosArray.length) {
        console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 'Respostas'!A${firstIndex}:AI${indexRespostas}`);
        
        // let i = null;
        // for(; i < atendimentosArray.length; i++) {
        //     const resultUpsert = await atendimentoService.replaceOne(unidade.collectionPrefix, atendimentosArray[i]);
        // }
        await atendimentoService.bulkReplaceOne(unidade.collectionPrefix, atendimentosArray);
        console.log(`[Sync] atendimentosCollection updated`);

        await atendimentoService.aggregateEscalas(unidade.collectionPrefix);
        console.log(`[Sync] ultimasEscalasCollection updated`);

        await atendimentoService.aggregateUltimosAtendimentos(unidade.collectionPrefix);
        console.log(`[Sync] ultimosAtendimentosCollection updated`);

        // unidade.sync[0].indexed = indexRespostas;
        unidade.lastSyncDate = new Date();
        await unidadeService.replaceOne(unidade);
    } else {
        console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 0 new rows found`);
        unidade.lastSyncDate = new Date();
        await unidadeService.replaceOne(unidade);
    }
}

module.exports = { fullSyncUnidade, resetUnidade, partialSyncUnidade }