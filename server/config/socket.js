const { calcularEscalas } = require('../config/helpers');
const sheetsApi = require('../config/sheetsApi');
const atendimentoService = require('../service/atendimentoService');
const idosoService = require('../service/idosoService');
const unidadeService = require('../service/unidadeService');
const syncService = require('../service/syncService');

module.exports = app => {
    const init = async (server) => {
        //protocolo wss (websocket)
        const io = require('socket.io')(server, { origins: '*:*' });
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

        // sincronização completa da unidade
        socket.on('syncEvent', async (data) => {
            
            const syncStatus = {
                socket: socket,
                payload: {
                    mode: 'INDETERMINATED', //INDETERMINATED, DETERMINATED
                    status: 'LOADING', //null, LOADING, SUCCESS, ERROR
                    progress: null,
                    total: null,
                    current: 0,
                    msg: '',
                },
                emit() {
                    this.payload.progress = this.payload.total ? Math.round(this.payload.current/this.payload.total * 100) : null;
                    socket.emit('syncStatusEvent', this.payload);
                },
            }
            
            
            try {
                syncStatus.emit();
                await syncService.fullSyncUnidade(data);

                syncStatus.payload.status = 'SUCCESS';
                syncStatus.emit();
                    
            } catch(err) {
                syncStatus.payload.status = 'ERROR';
                syncStatus.payload.msg = err.toString();
                syncStatus.emit();
            }
        });

        // apaga o banco de dados da unidade
        socket.on('resetEvent', async (data) => {
            const syncStatus = {
                socket: socket,
                payload: {
                    mode: 'INDETERMINATED', //INDETERMINATED, DETERMINATED
                    status: 'LOADING', //null, LOADING, SUCCESS, ERROR
                    progress: null,
                    total: null,
                    current: 0,
                    msg: '',
                },
                emit() {
                    this.payload.progress = this.payload.total ? Math.round(this.payload.current/this.payload.total * 100) : null;
                    socket.emit('syncStatusEvent', this.payload);
                },
            }

            try {
                syncStatus.emit();

                console.log(data)
                const unidade = await unidadeService.findById(data.idUnidade);
                console.log(unidade)
            
                if(unidade) {
                    unidade.vigilantes = [];
                    unidade.lastSyncDate = null;

                    await unidadeService.replaceOne(unidade);

                    await idosoService.deleteAll(unidade);

                    await atendimentoService.deleteAll(unidade);

                    syncStatus.payload.status = 'SUCCESS';
                    syncStatus.emit();
                } else {
                    syncStatus.payload.status = 'ERROR';
                    syncStatus.payload.msg = 'erro: unidade não encontrada ou unidade id não existe ou erro de banco';
                    syncStatus.emit();
                }
                    
            } catch(err) {
                syncStatus.payload.status = 'ERROR';
                syncStatus.payload.msg = err.toString();
                syncStatus.emit();
            }
        });

        //sincronização parcial da unidade (apenas respostas)
        socket.on('softSyncEvent', async (data) => {
            const syncStatus = {
                socket: socket,
                payload: {
                    mode: 'INDETERMINATED', //INDETERMINATED, DETERMINATED
                    status: 'LOADING', //null, LOADING, SUCCESS, ERROR
                    progress: null,
                    total: null,
                    current: 0,
                    msg: '',
                },
                emit() {
                    this.payload.progress = this.payload.total ? Math.round(this.payload.current/this.payload.total * 100) : null;
                    socket.emit('syncStatusEvent', this.payload);
                },
            }

            try {
                syncStatus.emit();

                console.log(data);
                const unidade = await unidadeService.findById(data.idUnidade);
                console.log(unidade);

                if(unidade) {
                    console.log(`[Sync] ${unidade.nome} STARTING SOFTSYNC `);
                    await syncAtendimentos(unidade, 20);
                    syncStatus.payload.status = 'SUCCESS';
                    syncStatus.emit();
                } else {
                    syncStatus.payload.status = 'ERROR';
                    syncStatus.payload.msg = 'erro: unidade não encontrada ou unidade id não existe ou erro de banco';
                    syncStatus.emit();
                }
            } catch(err) {
                syncStatus.payload.status = 'ERROR';
                syncStatus.payload.msg = err.toString();
                syncStatus.emit();
            }
        });
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
            console.log(`[Sync] atendimentosCollection: updated`);

            await atendimentoService.aggregateEscalas(unidade.collectionPrefix);
            console.log(`[Sync] ultimasEscalasCollection: updated`);

            await atendimentoService.aggregateUltimosAtendimentos(unidade.collectionPrefix);
            console.log(`[Sync] ultimosAtendimentosCollection: updated`);

            // unidade.sync[0].indexed = indexRespostas;
            unidade.lastSyncDate = new Date();
            await unidadeService.replaceOne(unidade);
        } else {
            console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 0 new rows found`);
            unidade.lastSyncDate = new Date();
            await unidadeService.replaceOne(unidade);
        }
    }

    return { init };
}