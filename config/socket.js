const { calcularEscalas } = require('../config/helpers');
const sheetsApi = require('../config/sheetsApi');
const atendimentoService = require('../service/atendimentoService');
const idosoService = require('../service/idosoService');
const unidadeService = require('../service/unidadeService');

module.exports = app => {
    const init = async (server) => {
        //protocolo wss (websocket)
        const io = require('socket.io')(server, { origins: '*:*' });

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
            let total = 0;
            let current = 0;
            socket.emit('syncStatusEvent', {isSyncing: true, progress: current/total * 100, total, current, lastSyncDate: null });
            console.log(data)
            const start = new Date();

            const unidade = await unidadeService.findById(data.idUnidade);
            // console.log(unidade)
    
            if(unidade) {
                console.log(`[Sync] ${unidade.nome} STARTING SYNC `);
                total = await countDataToSync(unidade);
                socket.emit('syncStatusEvent', {isSyncing: true, progress: current/total * 100, total, current, lastSyncDate: null })
            } else {
                socket.emit('syncStatusEvent', {isSyncing: false, progress: current/total * 100, total, current, lastSyncDate: null, msg: 'erro: unidade não encontrada ou unidade id não existe ou erro de banco' })
            }
    
        });
    }

    /**
     * Faz uma estimativa da quantidade de linhas para ler nas planilhas (considerando todos os idosos dos vigilantes e todas as respostas da ficha de vigilancia)
     * Procura essa informação da API do google Sheet (a api não conta o número de linhas preenchidas, e sim o numero máximo de linhas no grid, então é uma estimativa com folga)
     * @param {*} unidade 
     */
    const countDataToSync = async (unidade) => {
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
        return totalCount;
    }


    return { init };
}