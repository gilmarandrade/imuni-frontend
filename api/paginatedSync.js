const { calcularEscalas, calcularDataProximoAtendimento } = require('../config/helpers');
const sheetsApi = require('../config/sheetsApi');

//TODO usar configuração do banco
const { mongoUris } = require('../config/environment');
const ObjectId = require('mongodb').ObjectID;
const idosoService = require('../service/idosoService');
const vigilanteService = require('../service/vigilanteService');
const atendimentoService = require('../service/atendimentoService');
const idosoAtendimentoService = require('../service/idosoAtendimentoService');
const unidadeService = require('../service/unidadeService');

module.exports = app => {

    const arrayIdososByVigilante = async (unidade) => {
        const limit = 50;
        const idososPorVigilantes = [];
        const syncVigilantes = unidade.syncVigilantes.slice();
        let rowsInserted = 0;
        console.log(syncVigilantes)
        for(let i = 1; i <= unidade.qtdVigilantes; i++) {
            idososPorVigilantes[i - 1] = [];
            const lastIndexSynced = syncVigilantes[i - 1];
            const firstIndex = lastIndexSynced + 1;
            const lastIndex = lastIndexSynced + limit;
            // try {
                console.log(`[Sync] Reading spreadsheet ${unidade.idPlanilhaGerenciamento} 'Vigilante ${i}'!A${firstIndex}:E${lastIndex}`);
                const rows = await sheetsApi.read(unidade.idPlanilhaGerenciamento, `'Vigilante ${i}'!A${firstIndex}:E${lastIndex}`);
                rows.forEach((item, index) => {
                    if(item[1]) {//se o idoso tem nome
                        idososPorVigilantes[i - 1].push({
                            row: `'Vigilante ${i}'!A${firstIndex + index}:E${firstIndex + index}`,
                            dataNascimento: '',
                            nome: item[1],
                            telefone1: item[2],
                            telefone2: item[3],
                            agenteSaude: item[4],
                            vigilante: item[0],
                        });
                    }
                });
                syncVigilantes[i - 1] = lastIndexSynced + idososPorVigilantes[i - 1].length;
                if(idososPorVigilantes[i - 1].length) {
                    console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 'Vigilante ${i}'!A${firstIndex}:E${syncVigilantes[i - 1]}`);

                    const resultInsertMany = await idosoService.insertAll(unidade.collectionPrefix, idososPorVigilantes[i - 1]);
                    rowsInserted += resultInsertMany;
                    console.log(`[Sync] idososCollection: ${resultInsertMany} rows inserted`)
                } else {
                    console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 0 new rows found`);
                }

            // } catch (error) {
            //     console.warn(error);
            // }
        }



        unidade.syncVigilantes = syncVigilantes;
        // console.log(unidade);
        const result = await unidadeService.replaceOne(unidade);
        // console.log(result.result.n)
        return rowsInserted;
    }

    const syncIdosos = async (unidade) => {
        // console.log(unidade)
        const idososPorVigilantes = await arrayIdososByVigilante(unidade);
        return idososPorVigilantes;
        // const resultDelete = await idosoService.deleteAll(unidade.collectionPrefix);
        // console.log(`[Sync] idososCollection: ${resultDelete} rows deleted`)

        // const resultInsertMany = await idosoService.insertAll(unidade.collectionPrefix, idososPorVigilantes);
        // console.log(`[Sync] idososCollection: ${resultInsertMany} rows inserted`)
        // return resultInsertMany;
    } 

    const syncVigilantes = async (unidade) => {
        console.log(`[Sync] Reading spreadsheet ${unidade.idPlanilhaGerenciamento} 'Status Atendimentos'!A2:A`);
        const rows = await sheetsApi.read(unidade.idPlanilhaGerenciamento, `'Status Atendimentos'!A2:A`);
        const vigilantes = {};
        rows.forEach((item, index) => {
            vigilantes[item[0]] = { nome: item[0] };
        });

        const arrayVigilantes = Object.values(vigilantes);

        const resultDelete = await vigilanteService.deleteAll(unidade.collectionPrefix);
        console.log(`[Sync] vigilantesCollection: ${resultDelete} rows deleted`)

        const resultInsertMany = await vigilanteService.insertAll(unidade.collectionPrefix, arrayVigilantes);
        console.log(`[Sync] vigilantesCollection: ${resultInsertMany} rows inserted`)
        return resultInsertMany;
    }

    const syncAtendimentos = async (unidade) => {
        let syncRespostas = unidade.syncRespostas;
        const limit = 50;
        const lastIndexSynced = syncRespostas;
        const firstIndex = lastIndexSynced + 1;
        const lastIndex = lastIndexSynced + limit;

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

        syncRespostas = lastIndexSynced + atendimentosArray.length;
        if(atendimentosArray.length) {
            console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 'Respostas'!A${firstIndex}:AI${syncRespostas}`);
            
            const resultInsertMany = await atendimentoService.insertAll(unidade.collectionPrefix, atendimentosArray);
            console.log(`[Sync] atendimentosCollection: ${resultInsertMany} rows inserted`);

            const nomeIdosos = atendimentosArray.map((atendimento)=> atendimento.fichaVigilancia.dadosIniciais.nome);
            const resultIdososAtendimentos = syncIdososAtendimentos(unidade, nomeIdosos);

            unidade.syncRespostas = syncRespostas;
            await unidadeService.replaceOne(unidade);
            return resultInsertMany;
        } else {
            console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 0 new rows found`);
            return 0;
        }
    }

    const syncIdososAtendimentos = async (unidade, nomeIdosos) => {
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
       for(let i = 0; i < nomeIdosos.length; i++) {
            let idoso = await idosoService.findByNome(unidade.collectionPrefix, nomeIdosos[i]);
            if(idoso === null) {
                idoso = {
                    row: '',
                    dataNascimento: '',
                    nome: nomeIdoso[i],
                    telefone1: '',
                    telefone2: '',
                    agenteSaude: '',
                    vigilante: '',
                }
            }
            const atendimentos = await atendimentoService.findAtendimentosByIdoso(unidade.collectionPrefix, idoso);
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

            rowsUpdated += await idosoAtendimentoService.replaceOne(unidade.collectionPrefix, idoso);
        }
        
        console.log(`[Sync] idososAtendimentosCollection: ${rowsUpdated} rows updated`)
        return rowsUpdated;
    }

    // TODO ler unidades da planilha
    const insertUnidades = async () => {

        const unidades = [];

        unidades.push({
            nome: 'USF Rocas',
            collectionPrefix: 'USF Rocas'.replace(/[^a-zA-Z0-9]/g, '_'),
            distrito: 'Leste',
            idPlanilhaIdosos: '1sP1UegbOnv5dVoO6KMtk2nms6HqjFs3vuYN5FGMWasc',
            idPlanilhaGerenciamento: '1tBlFtcTlo1xtq4lU1O2Yq94wYaFfyL9RboX6mWjKhh4',
            qtdVigilantes: 4,
        });
        unidadeService.insertAll(unidades);

    }

    const runSync = async () => {
        //TODO criar um banco para armazenar o log de sincronização, hora da ultima sincronização, se está em sincronização, etc...
        const start = new Date();

        // await insertUnidades();

        const unidades = await unidadeService.findAll();

        if(unidades.length > 0) {// TODO sincroniza apenas a primeira unidade da lista, SINCRONIZAR TODAS AS UNIDADES
            console.log(`[Sync] ${unidades[0].nome} STARTING SYNC `);

            const resultIdosos = await syncIdosos(unidades[0]);
            // const resultVigilantes = await syncVigilantes(unidades[0]);
    
            const resultRespostas = await syncAtendimentos(unidades[0]);
            
            // const resultIdososAtendimentos = await syncIdososAtendimentos(unidades[0]);

            
            console.log(`[Sync] ${unidades[0].nome} SYNCED`);
            
            const log = {
                ok: true,
                time: new Date(),
                idosos: resultIdosos,
                atendimentos: resultRespostas,
                // vigilantes: resultVigilantes,
                // idososAtendimentos: resultIdososAtendimentos,
                runtime: ((new Date()) - start)/1000,    
            }
            const resultSync = await unidadeService.updateSyncDate(unidades[0], log);

            return log;
        } else {
            const log = {
                ok: false,
                time: new Date(),
                error: 'não há unidades para sincronizar',
            };
            const resultSync = await unidadeService.updateSyncDate(unidades[0], log);
        }

    }

    /**
     * Sincroniza o banco com uma planilha
     */
    const sync = async (req, res) => {
        //TODO criar um banco para armazenar o log de sincronização, hora da ultima sincronização, se está em sincronização, etc...
        const start = new Date();
        
        try {
            const result = await runSync();
            return res.json(result);
        } catch (error) {
            console.warn(error)
            const log = {
                ok: false,
                time: new Date(),
                error: error.toString(),
                runtime: ((new Date()) - start)/1000,
            };
            const resultSync = await unidadeService.updateSyncDate(unidades[0], log);

            return res.json(log);
        }
        
    };

    return { sync, runSync };
};