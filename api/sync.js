const { calcularEscalas } = require('../config/helpers');
const { read } = require('../config/sheetsApi');

//TODO usar configuração do banco
const { mongoUris } = require('../config/environment');
const ObjectId = require('mongodb').ObjectID;
const atendimentoService = require('../service/atendimentoService');

module.exports = app => {

    
    const arrayIdososByVigilante = async (sheetName, gerenciamentoSpreadsheet) => {
        console.log(`[Sync] Reading spreadsheet ${gerenciamentoSpreadsheet} '${sheetName}'!A2:E`);
        const rows = await read(gerenciamentoSpreadsheet, `'${sheetName}'!A2:E`);
        const idososArray = [];
        rows.forEach((item, index) => {
            // console.log('A' + (index + 2), item[1])
            if(item[1]) {
                idososArray.push({
                    row: `'${sheetName}'!A${index + 2}:E`,
                    dataNascimento: '',
                    nome: item[1],
                    telefone1: item[2],
                    telefone2: item[3],
                    agenteSaude: item[4],
                    vigilante: item[0],
                });
            }
        });
        
        return idososArray;
    }

    //TODO refatorar retorno da promisse, para retornar mensagens de erro
    const updateIdosos = async (gerenciamentoSpreadsheet) => {
        
        const sheetsVigilantes = [ 'Vigilante 1', 'Vigilante 2', 'Vigilante 3', 'Vigilante 4' ];

        const arrays = [];
        for(let i= 0; i < sheetsVigilantes.length; i++) {
            try {
                arrays[i] = await arrayIdososByVigilante(sheetsVigilantes[i], gerenciamentoSpreadsheet);
                console.log('[Sync] Readed spreadsheet ', gerenciamentoSpreadsheet , ` '${sheetsVigilantes[i]}'!A2:E`);
            } catch (error) {
                console.warn(error);
            }
        }
        const idososArray = [].concat(...arrays);

        const promise = new Promise( (resolve, reject) => {
            if(typeof arrays === 'string') reject(arrays);

            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
                if(err) reject(err);
                const db = client.db('planilhas');
                const idososcollection = db.collection('idosos');
                try {
                    idososcollection.deleteMany();
                } catch (error) {
                    console.warn('idososcollection.deleteMany() collection may not exists!');
                }

                idososcollection.insertMany(idososArray, function(err, result) {
                    client.close();
                    if(result.result.ok) {
                        console.log(`[Sync] idosos collection: ${result.result.n} documents added`);
                        resolve(result.result.n);
                    } else {
                        reject(err);
                    }
                });
            });

        });

        return promise;
    } 

    //TODO refatorar retorno da promisse, para retornar mensagens de erro
    const updateRespostas = async (gerenciamentoSpreadsheet) => {
        console.log(`[Sync] Reading spreadsheet ${gerenciamentoSpreadsheet} 'Respostas'!A2:AI`);
        const rows = await read(gerenciamentoSpreadsheet, `'Respostas'!A2:AI`);
        const respostasArray = [];
        rows.forEach((item, index) => {
            //TODO criar uma função para conversao de datas string da planilha para Date
            // 13/05/2020 13:10:19
            var parts = item[0].split(' ');
            var data = parts[0].split('/');
            var hora = parts[1].split(':');

            // para converter a data de Iso para locale use : console.log(testDate.toLocaleString());

            respostasArray.push({
                row: `'Respostas'!A${index + 2}:AI`,
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

        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
                const db = client.db('planilhas');

                const atendimentosCollection = db.collection('atendimentos');
                try {
                    atendimentosCollection.deleteMany();
                } catch (error) {
                    console.warn('atendimentosCollection.deleteMany() collection may not exists!');
                }
                atendimentosCollection.insertMany(atendimentosArray, function(err, result) {
                    if(result.result.ok) {
                        console.log(`[Sync] atendimentos collection: ${result.result.n} documents added`);
                        resolve(result.result.n)
                    } else {
                        reject(err);
                    }
                //   client.close();
                });
            });
        });

        return promise;
    } 

    //TODO não é necessário buscar na planilha, basta filtrar na collection de idosos
    const updateVigilantes = async (gerenciamentoSpreadsheet) => {
        console.log(`[Sync] Reading spreadsheet ${gerenciamentoSpreadsheet} 'Status Atendimentos'!A2:A`);
        const rows = await read(gerenciamentoSpreadsheet, `'Status Atendimentos'!A2:A`);
        const vigilantes = {};
        rows.forEach((item, index) => {
            vigilantes[item[0]] = { nome: item[0] };
        });

        const arrayVigilantes = Object.values(vigilantes);
        console.log(arrayVigilantes)
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
                const db = client.db('planilhas');
                const vigilantesCollection = db.collection('vigilantes');
                try {
                    vigilantesCollection.deleteMany();
                } catch (error) {
                    console.warn('vigilantesCollection.deleteMany() collection may not exists!');
                }

                vigilantesCollection.insertMany(arrayVigilantes, function(err, result) {
                    client.close();
                    if(result.result.ok) {
                        console.log(`[Sync] vigilantes collection: ${result.result.n} documents added`);
                        resolve(result.result.n);
                    } else {
                        reject(err);
                    }
                });
            }); 
        });

        return promise;
    }

    const updateIdososAtendimentos = async () => {
/**
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
        const idosos = await atendimentoService.findIdosos();
        for(let i = 0; i < idosos.length; i++) {
            const atendimentos = await atendimentoService.findAtendimentosByIdoso(idosos[i]);

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
            });

            const ultimoAtendimentoEfetuado = atendimentos.filter((atendimento, index, array) => {
                return atendimento.fichaVigilancia.dadosIniciais.atendeu;
            })[0] || null;

            idosos[i].stats = {};

            idosos[i].stats.qtdAtendimentosEfetuados = qtdAtendimentosEfetuados;
            idosos[i].stats.qtdAtendimentosNaoEfetuados = atendimentos.length - qtdAtendimentosEfetuados;
            if(ultimoAtendimentoEfetuado) {
                idosos[i].stats.ultimaEscala = ultimoAtendimentoEfetuado.escalas;
                idosos[i].stats.ultimaEscala.data = ultimoAtendimentoEfetuado.fichaVigilancia.data;
                idosos[i].score =  ultimoAtendimentoEfetuado.escalas.scoreOrdenacao;
                idosos[i].epidemiologia = ultimoAtendimentoEfetuado.fichaVigilancia.epidemiologia;
            } else {
                idosos[i].stats.ultimaEscala = {};
                idosos[i].score = 0;
                idosos[i].epidemiologia = {};
            }
        }


        const promise = new Promise( (resolve, reject) => {
            if(typeof arrays === 'string') reject(arrays);

            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
                if(err) reject(err);
                const db = client.db('planilhas');
                const idososStatsCollection = db.collection('idososStats');
                try {
                    idososStatsCollection.deleteMany();
                } catch (error) {
                    console.warn('idososStatsCollection.deleteMany() collection may not exists!');
                }

                idososStatsCollection.insertMany(idosos, function(err, result) {
                    client.close();
                    if(result.result.ok) {
                        console.log(`[Sync] idososStats collection: ${result.result.n} documents added`);
                        resolve(result.result.n);
                    } else {
                        reject(err);
                    }
                });
            });

        });

        return promise;
    }


    /**
     * Sincroniza o banco com uma planilha
     */
    const sync = async (req, res) => {
        //TODO criar um banco para armazenar o log de sincronização, hora da ultima sincronização, se está em sincronização, etc...
        const start = new Date();

        const idososSpreadsheet = '1sP1UegbOnv5dVoO6KMtk2nms6HqjFs3vuYN5FGMWasc';
        const gerenciamentoSpreadsheet = '1tBlFtcTlo1xtq4lU1O2Yq94wYaFfyL9RboX6mWjKhh4';
        
        const resultIdosos = await updateIdosos(gerenciamentoSpreadsheet );
        // console.log(`${resultIdosos} rows inserted in collection idosos`);

        const resultVigilantes = await updateVigilantes(gerenciamentoSpreadsheet );
        // console.log(`${resultVigilantes} rows inserted in collection vigilantes`);

        const resultRespostas = await updateRespostas(gerenciamentoSpreadsheet );
        // console.log(`${resultRespostas} rows inserted in collection atendimentos`);
        
        //idosos with stats
        // const resultIdososStats = await updateIdososStats();
        const resultIdososStats = await updateIdososAtendimentos();
        // console.log(`${resultIdososStats} rows inserted in collection idososStats`);

        return res.json({
            ok: true,
            idosos: resultIdosos,
            atendimentos: resultRespostas,
            vigilantes: resultVigilantes,
            idososStats: resultIdososStats,
            runtime: ((new Date()) - start)/1000,
        });
    };

    return { sync };
}