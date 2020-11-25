/**
 * @deprecated
 */
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
                await syncService.fullSyncUnidade(data.idUnidade);

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
                await syncService.resetUnidade(data.idUnidade);
                syncStatus.payload.status = 'SUCCESS';
                syncStatus.emit();
                    
            } catch(err) {
                syncStatus.payload.status = 'ERROR';
                syncStatus.payload.msg = err.toString();
                syncStatus.emit();
            }
        });

        //sincronização parcial da unidade (apenas respostas)
        socket.on('softSyncEvent', async (data) => {
            console.log(data)
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
                await syncService.partialSyncUnidade(data.idUnidade, data.nomeVigilante);

                syncStatus.payload.status = 'SUCCESS';
                syncStatus.emit();


            } catch(err) {
                syncStatus.payload.status = 'ERROR';
                syncStatus.payload.msg = err.toString();
                syncStatus.emit();
            }
        });
    }

    return { init };
}