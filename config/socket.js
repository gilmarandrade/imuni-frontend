const { calcularEscalas } = require('../config/helpers');
const sheetsApi = require('../config/sheetsApi');
const atendimentoService = require('../service/atendimentoService');
const idosoService = require('../service/idosoService');
const unidadeService = require('../service/unidadeService');

module.exports = app => {
    const init = async (server) => {
        //protocolo wss (websocket)
        const io = require('socket.io')(server, { origins: 'http://frenteprevencaocovidrn-org-br.umbler.net/:*' });

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
                    let total = 0;
                    let current = 0;
                    socket.emit('syncStatusEvent', {isSyncing: true, progress: Math.round(current/total * 100), total, current, lastSyncDate: null });
                    console.log(data)
                    const start = new Date();
        
                    const unidade = await unidadeService.findById(data.idUnidade);
                    console.log(unidade)
            
                    if(unidade) {
                        console.log(`[Sync] ${unidade.nome} STARTING SYNC `);
                        const properties = await prepareDataToSync(unidade);// TODO devo atualizar a qtdVigilantes da unidade no db?
                        total = properties.totalCount;
                        socket.emit('syncStatusEvent', {isSyncing: true, progress: Math.round(current/total * 100), total, current, lastSyncDate: new Date() })
                        
                        for(let i = 1; i <= properties.qtdVigilantes; i++) {
                            const result = await syncIdososByVigilanteIndex(unidade, i);
                            current += result;
                            socket.emit('syncStatusEvent', {isSyncing: true, progress: Math.round(current/total * 100), total, current, lastSyncDate: new Date() })
                            console.log(result, 'rows inserted in idosos')
                        }
                        
                        const result = await syncAtendimentos(unidade);
                        current += result;
                        socket.emit('syncStatusEvent', {isSyncing: true, progress: Math.round(current/total * 100), total, current, lastSyncDate: new Date() })
                        total = current;
                        socket.emit('syncStatusEvent', {isSyncing: false, progress: Math.round(current/total * 100), total, current, lastSyncDate: new Date() })// TODO salvar a data de sincronizaçao no bd
        
                    } else {
                        socket.emit('syncStatusEvent', {isSyncing: false, progress: Math.round(current/total * 100), total, current, lastSyncDate: null, msg: 'erro: unidade não encontrada ou unidade id não existe ou erro de banco' })
                    }
                    
                } catch(err) {
                    socket.emit('syncStatusEvent', {isSyncing: false, progress: null, total: 0, current: 0, lastSyncDate: null, msg: err.toString() })
                }
            });
    }

    /**
     * Faz uma estimativa da quantidade de linhas para ler nas planilhas (considerando todos os idosos dos vigilantes e todas as respostas da ficha de vigilancia)
     * Procura essa informação da API do google Sheet (a api não conta o número de linhas preenchidas, e sim o numero máximo de linhas no grid, então é uma estimativa com folga)
     * @param {*} unidade 
     */
    const prepareDataToSync = async (unidade) => {
        let totalCount = 0;
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
        let rowsInserted = 0;
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
            let j = 0;
            for(; j < idososPorVigilantes.length; j++) {
                const resultInsertMany = await idosoService.updateOne(unidade.collectionPrefix, idososPorVigilantes[j]);
            }
            rowsInserted += j;
        } else {
            console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 0 new rows found`);
        }
                
                
        
        unidade.sync[vigilanteIndex].indexed = indexIdosos;
        // console.log(unidade);
        const result = await unidadeService.replaceOne(unidade);
        // console.log(result.result.n)
        console.log(`[Sync] idososCollection: ${rowsInserted} rows affected`)
        return rowsInserted;
    }

        /**
     * atualiza até o limite de itens passados como parametro, caso o limite não seja definido, atualiza todos os itens da planilha
     */
    const syncAtendimentos = async (unidade, limit) => {
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
            
            let i = 0;
            for(; i < atendimentosArray.length; i++) {
                const resultUpsert = await atendimentoService.replaceOne(unidade.collectionPrefix, atendimentosArray[i]);
            }
            console.log(`[Sync] atendimentosCollection: ${i} rows affected`);

            const nomeLowerIdosos = atendimentosArray.map((atendimento)=> atendimento.fichaVigilancia.dadosIniciais.nomeLower);
            const resultIdososAtendimentos = await syncIdososStats(unidade, nomeLowerIdosos);

            unidade.sync[0].indexed = indexRespostas;
            await unidadeService.replaceOne(unidade);
            return i;
        } else {
            console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 0 new rows found`);
            return 0;
        }
    }

    /**
     * Recalcula as estatisticas dos idosos, com base nos atendimentos registrados no banco até o momento
     * @param {*} unidade 
     * @param {*} nomeLowerIdosos 
     */
    const syncIdososStats = async (unidade, nomeLowerIdosos) => {
        /** IdosoAtendimento Object:
            {
                "row": "'Vigilante 1'!A19:M19",
                "score": 81,
                "stats": {
                    "qtdAtendimentosEfetuados": 2,
                    "qtdAtendimentosNaoEfetuados": 2,
                    "ultimoAtendimento": {
                        "efetuado": true,
                        "data": "25/05/2020 10:45:50"
                    },
                    "ultimaEscala": {
                        "vulnerabilidade": "O - Sem Vulnerabilidade",
                        "epidemiologica": "IVb - Idoso sintomático",
                        "riscoContagio": "Baixo",
                        "data": "",
                        "scoreOrdenacao?": 81
                    },
                    "dataProximoAtendimento": "26/05/2020"
                },
                "vigilante": "Jaiane Carmélia Monteiro Viana",
                "nome": "João Inácio Filho",
                "telefone1": "988015537",
                "telefone2": "",
                "agenteSaude": "Roberto"
            }
        */

       let rowsUpdated = 0;
       for(let i = 0; i < nomeLowerIdosos.length; i++) {
            let idoso = await idosoService.findByNome(unidade.collectionPrefix, nomeLowerIdosos[i]);
            if(idoso === null) {
                idoso = {
                    row: '',
                    dataNascimento: '',
                    nome: nomeLowerIdosos[i],
                    nomeLower: nomeLowerIdosos[i],
                    telefone1: '',
                    telefone2: '',
                    agenteSaude: '',
                    vigilante: '',
                    score: 0,
                }
            }
            const atendimentos = await atendimentoService.findAtendimentosByIdoso(unidade.collectionPrefix, idoso);
            idoso.vigilante = atendimentos[0].fichaVigilancia.vigilante;
            const qtdAtendimentosEfetuados = atendimentos.reduce((prevVal, atendimento) => { 
                if(atendimento.fichaVigilancia.dadosIniciais.atendeu) {
                    return prevVal + 1;
                } else {
                    return prevVal;
                }
            }, 0);

            const ultimoAtendimento = atendimentos.filter((atendimento, index, array) => {
                return index == 0;
            }).map((atendimento) => {
                return {
                    data: atendimento.fichaVigilancia.data,
                    efetuado: atendimento.fichaVigilancia.dadosIniciais.atendeu,
                }
            })[0] || null;

            const ultimoAtendimentoEfetuado = atendimentos.filter((atendimento, index, array) => {
                return atendimento.fichaVigilancia.dadosIniciais.atendeu;
            })[0] || null;

            idoso.stats = {};

            idoso.stats.qtdAtendimentosEfetuados = qtdAtendimentosEfetuados;
            idoso.stats.qtdAtendimentosNaoEfetuados = atendimentos.length - qtdAtendimentosEfetuados;
            idoso.stats.ultimoAtendimento = ultimoAtendimento;
            if(ultimoAtendimentoEfetuado) {
                idoso.stats.ultimaEscala = ultimoAtendimentoEfetuado.escalas;
                idoso.stats.ultimaEscala.data = ultimoAtendimentoEfetuado.fichaVigilancia.data;
                idoso.score =  ultimoAtendimentoEfetuado.escalas.scoreOrdenacao;
                idoso.epidemiologia = ultimoAtendimentoEfetuado.fichaVigilancia.epidemiologia;
            } else {
                idoso.stats.ultimaEscala = {};
                idoso.score = 0;
                idoso.epidemiologia = {};
            }

            rowsUpdated += await idosoService.replaceOne(unidade.collectionPrefix, idoso);
        }
        
        console.log(`[Sync] idososCollection: ${rowsUpdated} rows affected`)
        return rowsUpdated;
    }

    return { init };
}