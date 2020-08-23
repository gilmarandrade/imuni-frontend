const schedule = require('node-schedule');
const { calcularEscalas } = require('../config/helpers');
const sheetsApi = require('../config/sheetsApi');
const atendimentoService = require('../service/atendimentoService');
const idosoService = require('../service/idosoService');
const unidadeService = require('../service/unidadeService');

module.exports = app => {
    schedule.scheduleJob('20 13 * * * *', async function () {
        console.log('[autoSyncShedule] job started');
        try {
            const result = await unidadeService.findAll();
            const unidadesToSync = result.filter(unidade => unidade.autoSync === true);
            for(let i = 0; i < unidadesToSync.length; i++) {
                await resetUnidade(unidadesToSync[i]._id);
                await syncUnidade(unidadesToSync[i]._id);
            }
        } catch(err) {
            console.error(err);
        }
        console.log('[autoSyncShedule] job ended');
    });
    
    const resetUnidade = async (idUnidade) => {
        try {
            console.log('[autoSyncShedule] reset started');
            const unidade = await unidadeService.findById(idUnidade);
            console.log(unidade)

            if (unidade) {
                unidade.vigilantes = [];
                // unidade.sync = [];

                //TODO codigo duplicado em unidades.js save()
                const sheetsToSync = [];
                sheetsToSync.push({
                    indexed: 0,//não utilizado por enquanto
                    size: 1000,//não utilizado...
                    sheetName: "Respostas",
                });
                try {
                    const spreadSheetProperties = await sheetsApi.getProperties(unidade.idPlanilhaGerenciamento);

                    for (let i = 0; i < spreadSheetProperties.sheets.length; i++) {
                        const sheetName = spreadSheetProperties.sheets[i].properties.title;
                        if (sheetName.startsWith("Vigilante ")) {
                            sheetsToSync.push({
                                indexed: 0,//não utilizado por enquanto
                                size: 1000,//não utilizado...
                                sheetName,
                            })
                        }
                    }

                    unidade.sync = sheetsToSync;
                } catch (err) {
                    return console.log(err);
                }

                await unidadeService.replaceOne(unidade);

                await idosoService.deleteAll(unidade);

                await atendimentoService.deleteAll(unidade);
                console.log('[autoSyncShedule] reset ended');
            } else {
                console.log('[autoSyncShedule] erro: unidade não encontrada ou unidade id não existe ou erro de banco');
            }

        } catch (err) {
            console.log(err);
        }
    }

    const syncUnidade = async (idUnidade) => {
        try {
            const unidade = await unidadeService.findById(idUnidade);
            console.log(unidade)

            if (unidade) {
                console.log(`[autoSyncShedule] ${unidade.nome} STARTING SYNC `);
                const properties = await prepareDataToSync(unidade);// TODO devo atualizar a qtdVigilantes da unidade no db?

                for (let i = 1; i <= properties.qtdVigilantes; i++) {
                    await syncIdososByVigilanteIndex(unidade, i);
                }

                await syncAtendimentos(unidade, null);
                console.log('[autoSyncShedule] sync ended');
            } else {
                console.log('[autoSyncShedule] erro: unidade não encontrada ou unidade id não existe ou erro de banco');
            }

        } catch (err) {
            console.error(err);
        }
    }


    /**
     * Faz uma estimativa da quantidade de linhas para ler nas planilhas (considerando todos os idosos dos vigilantes e todas as respostas da ficha de vigilancia)
     * Procura essa informação da API do google Sheet (a api não conta o número de linhas preenchidas, e sim o numero máximo de linhas no grid, então é uma estimativa com folga)
     * @param {*} unidade 
     */
    const prepareDataToSync = async (unidade) => {
        let totalCount = 0;//@deprecated
        const sheetsToSync = [];
        try {
            const spreadSheetProperties = await sheetsApi.getProperties(unidade.idPlanilhaGerenciamento);

            for (let i = 0; i < spreadSheetProperties.sheets.length; i++) {
                const sheetName = spreadSheetProperties.sheets[i].properties.title;
                if (sheetName.startsWith("Vigilante ") || sheetName.startsWith("Respostas")) {
                    sheetsToSync.push({
                        sheetName,
                        rowCount: spreadSheetProperties.sheets[i].properties.gridProperties.rowCount,
                    })
                }
            }
            console.log(sheetsToSync);

            totalCount = sheetsToSync.reduce((acc, current) => { return acc + current.rowCount }, 0);
        } catch (err) {
            console.log(err);
        }

        console.log(`[autoSyncShedule] ${sheetsToSync.length} sheets found`);
        return { totalCount, qtdVigilantes: sheetsToSync.length - 1 };
    }

    /**
     * atualiza até o limite de itens passados como parametro, caso o limite não seja definido, atualiza todos os itens da planilha
     */
    const syncIdososByVigilanteIndex = async (unidade, vigilanteIndex, limit) => {
        const idososPorVigilantes = [];
        let indexIdosos = unidade.sync[vigilanteIndex].indexed;
        // let rowsInserted = null;//@deprecated
        const lastIndexSynced = limit ? indexIdosos : 1;
        const firstIndex = lastIndexSynced + 1;//2
        const lastIndex = limit ? lastIndexSynced + limit : '';//''
        let vigilanteNome = '';
        console.log(`[autoSyncShedule] Reading spreadsheet ${unidade.idPlanilhaGerenciamento} 'Vigilante ${vigilanteIndex}'!A${firstIndex}:E${lastIndex}`);
        const rows = await sheetsApi.read(unidade.idPlanilhaGerenciamento, `'Vigilante ${vigilanteIndex}'!A${firstIndex}:E${lastIndex}`);
        rows.forEach((item, index) => {
            if (item[1]) {//se o idoso tem nome
                vigilanteNome = item[0];
                idososPorVigilantes.push({
                    row: `${unidade.collectionPrefix}-'Vigilante ${vigilanteIndex}'!A${firstIndex + index}:E${firstIndex + index}`,
                    unidade: unidade.nome,
                    dataNascimento: '',
                    nome: item[1],
                    nomeLower: item[1].toLowerCase(),
                    telefone1: item[2],
                    telefone2: item[3],
                    agenteSaude: item[4],
                    vigilante: item[0],
                    // TODO deprecated?
                    stats: {
                        qtdAtendimentosEfetuados: 0,
                        qtdAtendimentosNaoEfetuados: 0,
                        ultimoAtendimento: null,
                        ultimaEscala: null,
                    },
                    score: 0,
                    epidemiologia: null,
                });
            }
        });
        indexIdosos = lastIndexSynced + idososPorVigilantes.length;
        if (idososPorVigilantes.length) {
            console.log('[autoSyncShedule] Readed spreadsheet ', unidade.idPlanilhaGerenciamento, ` 'Vigilante ${vigilanteIndex}'!A${firstIndex}:E${indexIdosos}`);

            //insere os idosos no banco
            // let j = 0;
            // for(; j < idososPorVigilantes.length; j++) {
            //     const resultInsertMany = await idosoService.updateOne(unidade.collectionPrefix, idososPorVigilantes[j]);
            // }
            await idosoService.bulkUpdateOne(unidade.collectionPrefix, idososPorVigilantes);
        } else {
            console.log('[autoSyncShedule] Readed spreadsheet ', unidade.idPlanilhaGerenciamento, ` 0 new rows found`);
        }


        unidade.sync[vigilanteIndex].indexed = indexIdosos;//talvez essa indexação parcial seja necessária no futuro, mas atualmente, todas as sincronizações são totais, não sendo necessário armazenar essas informações
        //atualiza lista de vigilantes da unidade
        if (unidade.vigilantes[vigilanteIndex - 1]) {
            unidade.vigilantes[vigilanteIndex - 1].nome = vigilanteNome;
        } else {
            //atualmente, o campo usuarioId não está sendo utilizado
            unidade.vigilantes[vigilanteIndex - 1] = { usuarioId: '', nome: vigilanteNome };
        }
        // console.log(unidade);
        const result = await unidadeService.replaceOne(unidade);
        // console.log(result.result.n)
        console.log(`[autoSyncShedule] idososCollection updated`)
        // return rowsInserted;
    }

    
    /**
     * atualiza até o limite de itens passados como parametro, caso o limite não seja definido, atualiza todos os itens da planilha
     */
    const syncAtendimentos = async (unidade, limit) => {
        let indexRespostas = unidade.sync[0].indexed;
        const lastIndexSynced = limit ? indexRespostas : 1;
        const firstIndex = lastIndexSynced + 1;
        const lastIndex = limit ? lastIndexSynced + limit : '';

        console.log(`[autoSyncShedule] Reading spreadsheet ${unidade.idPlanilhaGerenciamento} 'Respostas'!A${firstIndex}:AI${lastIndex}`);
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
            console.log('[autoSyncShedule] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 'Respostas'!A${firstIndex}:AI${indexRespostas}`);
            
            // let i = null;
            // for(; i < atendimentosArray.length; i++) {
            //     const resultUpsert = await atendimentoService.replaceOne(unidade.collectionPrefix, atendimentosArray[i]);
            // }
            await atendimentoService.bulkReplaceOne(unidade.collectionPrefix, atendimentosArray);
            console.log(`[autoSyncShedule] atendimentosCollection: updated`);

            await atendimentoService.aggregateEscalas(unidade.collectionPrefix);
            console.log(`[autoSyncShedule] ultimasEscalasCollection: updated`);

            await atendimentoService.aggregateUltimosAtendimentos(unidade.collectionPrefix);
            console.log(`[autoSyncShedule] ultimosAtendimentosCollection: updated`);

            unidade.sync[0].indexed = indexRespostas;
            unidade.lastSyncDate = new Date();
            await unidadeService.replaceOne(unidade);
        } else {
            console.log('[autoSyncShedule] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 0 new rows found`);
        }
    }
};