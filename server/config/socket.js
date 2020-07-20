const { calcularEscalas } = require('../config/helpers');
const sheetsApi = require('../config/sheetsApi');
const atendimentoService = require('../service/atendimentoService');
const idosoService = require('../service/idosoService');
const unidadeService = require('../service/unidadeService');

module.exports = app => {
    const init = async (server) => {
        //protocolo wss (websocket)
        const io = require('socket.io')(server, { origins: 'http://api.frenteprevencaocovidrn.com.br:80 http://api.frenteprevencaocovidrn.com.br:3000 http://localhost:8080' });
        // const io = require('socket.io')(server, { path: 'api/socket.io', origins: 'http://api.frenteprevencaocovidrn.com.br:80 http://api.frenteprevencaocovidrn.com.br:3000 http://localhost:8080' });

        io.on('connection', socket => {
            console.log('[socket] conectado', socket.id);

            socket.on('disconnect', () => {
                console.log('[socket] desconectado', socket.id);
            });

            listenEvents(socket);
        })
    }

    const listenEvents = (socket) => {
        socket.on('syncEvent', async (data) => {
            try {
                    let total = 8;
                    let current = 0;
                    socket.emit('syncStatusEvent', {isSyncing: true, progress: Math.round(current/total * 100), total, current });
                    console.log(data)
                    const start = new Date();
        
                    const unidade = await unidadeService.findById(data.idUnidade);
                    console.log(unidade)
            
                    if(unidade) {
                        console.log(`[Sync] ${unidade.nome} STARTING SYNC `);
                        const properties = await prepareDataToSync(unidade);// TODO devo atualizar a qtdVigilantes da unidade no db?
                        current++;
                        socket.emit('syncStatusEvent', {isSyncing: true, progress: Math.round(current/total * 100), total, current })
                        
                        for(let i = 1; i <= properties.qtdVigilantes; i++) {
                            const result = await syncIdososByVigilanteIndex(unidade, i);
                            current++;
                            socket.emit('syncStatusEvent', {isSyncing: true, progress: Math.round(current/total * 100), total, current })
                            console.log(result, 'rows inserted in idosos')
                        }
                        
                        const result = await syncAtendimentos(unidade, null, socket, total, current);
                        // current++;
                        // socket.emit('syncStatusEvent', {isSyncing: true, progress: Math.round(current/total * 100), total, current })// TODO salvar a data de sincronizaçao no bd
                    } else {
                        socket.emit('syncStatusEvent', {isSyncing: false, progress: Math.round(current/total * 100), total, current, msg: 'erro: unidade não encontrada ou unidade id não existe ou erro de banco' })
                    }
                    
                } catch(err) {
                    socket.emit('syncStatusEvent', {isSyncing: false, progress: null, total: 0, current: 0, msg: err.toString() })
                }
            });
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

            for(let i = 0; i < spreadSheetProperties.sheets.length; i++) {
                const sheetName = spreadSheetProperties.sheets[i].properties.title;
                if(sheetName.startsWith("Vigilante ") || sheetName.startsWith("Respostas")){
                    sheetsToSync.push({
                        sheetName, 
                        rowCount: spreadSheetProperties.sheets[i].properties.gridProperties.rowCount,
                    })
                }
            }
            console.log(sheetsToSync);

            totalCount = sheetsToSync.reduce((acc, current) => { return acc + current.rowCount }, 0);
        } catch(err) {
            console.log(err);
        }
        
        console.log(`[Sync] ${sheetsToSync.length} sheets found`);
        return { totalCount, qtdVigilantes: sheetsToSync.length - 1 };
    }

        /**
     * atualiza até o limite de itens passados como parametro, caso o limite não seja definido, atualiza todos os itens da planilha
     */
    const syncIdososByVigilanteIndex = async (unidade, vigilanteIndex, limit) => {
        const idososPorVigilantes = [];
        let indexIdosos = unidade.sync[vigilanteIndex].indexed;
        let rowsInserted = null;//@deprecated
        const lastIndexSynced = limit ? indexIdosos : 1;
        const firstIndex = lastIndexSynced + 1;//2
        const lastIndex = limit ? lastIndexSynced + limit : '';//''

        console.log(`[Sync] Reading spreadsheet ${unidade.idPlanilhaGerenciamento} 'Vigilante ${vigilanteIndex}'!A${firstIndex}:E${lastIndex}`);
        const rows = await sheetsApi.read(unidade.idPlanilhaGerenciamento, `'Vigilante ${vigilanteIndex}'!A${firstIndex}:E${lastIndex}`);
        rows.forEach((item, index) => {
            if(item[1]) {//se o idoso tem nome
                idososPorVigilantes.push({
                    row: `'Vigilante ${vigilanteIndex}'!A${firstIndex + index}:E${firstIndex + index}`,
                    dataNascimento: '',
                    nome: item[1],
                    nomeLower: item[1].toLowerCase(),
                    telefone1: item[2],
                    telefone2: item[3],
                    agenteSaude: item[4],
                    vigilante: item[0],
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
        if(idososPorVigilantes.length) {
            console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 'Vigilante ${vigilanteIndex}'!A${firstIndex}:E${indexIdosos}`);

            //insere os idosos no banco
            // let j = 0;
            // for(; j < idososPorVigilantes.length; j++) {
            //     const resultInsertMany = await idosoService.updateOne(unidade.collectionPrefix, idososPorVigilantes[j]);
            // }
            await idosoService.bulkUpdateOne(unidade.collectionPrefix, idososPorVigilantes);
        } else {
            console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 0 new rows found`);
        }
                
                
        
        unidade.sync[vigilanteIndex].indexed = indexIdosos;//talvez essa indexação parcial seja necessária no futuro, mas atualmente, todas as sincronizações são totais, não sendo necessário armazenar essas informações
        // console.log(unidade);
        const result = await unidadeService.replaceOne(unidade);
        // console.log(result.result.n)
        console.log(`[Sync] idososCollection updated`)
        return rowsInserted;
    }

        /**
     * atualiza até o limite de itens passados como parametro, caso o limite não seja definido, atualiza todos os itens da planilha
     */
    const syncAtendimentos = async (unidade, limit, socket, total, current) => {
        let indexRespostas = unidade.sync[0].indexed;
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
                row: `'Respostas'!A${firstIndex + index}:AI${firstIndex + index}`,
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
            const resultUpsert = await atendimentoService.bulkReplaceOne(unidade.collectionPrefix, atendimentosArray);
            console.log(`[Sync] atendimentosCollection: updated`);
            current++;
            socket.emit('syncStatusEvent', {isSyncing: true, progress: Math.round(current/total * 100), total, current })

            
            await atendimentoService.aggregateEscalas(unidade.collectionPrefix);
            console.log(`[Sync] ultimasEscalasCollection: updated`);
            current++;
            socket.emit('syncStatusEvent', {isSyncing: true, progress: Math.round(current/total * 100), total, current })


            await atendimentoService.aggregateUltimosAtendimentos(unidade.collectionPrefix);
            console.log(`[Sync] ultimosAtendimentosCollection: updated`);
            current++;
            socket.emit('syncStatusEvent', {isSyncing: false, progress: Math.round(current/total * 100), total, current })


            unidade.sync[0].indexed = indexRespostas;
            unidade.lastSyncDate = new Date();
            await unidadeService.replaceOne(unidade);
            return null;
        } else {
            console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 0 new rows found`);
            return 0;
        }
    }

    return { init };
}