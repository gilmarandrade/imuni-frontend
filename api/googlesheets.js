require('dotenv').config();
const { google } = require('googleapis'); 
const sheets = google.sheets('v4');
const getGoogleClient = require('../config/google-client');

const { mongoUris } = require('../config/environment');

module.exports = app => {

    /**
     * Método genérico para ler qualquer aba de uma planilha
     */
    const get = async (req, res) => {
        const googleClient = await getGoogleClient();
        sheets.spreadsheets.values.get({
            auth: googleClient,
            spreadsheetId: req.params.id,
            range: `'${req.params.sheetName}'!${req.params.range}`,
        }, (err, apiRes) => {
            if (err) {
            console.error('The Google API returned an error.');
            return res.status(400).json(err);
            }
            const rows = apiRes.data.values || [];
            return res.json(rows);
        });
    };

    //TODO refatorar retorno da promisse, para retornar mensagens de erro
    const updateIdosos = async (idososSpreadsheet, googleClient) => {
        const promise = new Promise( (resolve, reject) => {

            sheets.spreadsheets.values.get({
                auth: googleClient,
                spreadsheetId: idososSpreadsheet,
                range: `'Idosos'!A2:E`,
            }, (err, apiRes) => {
                if (err) {
                    console.error('The Google API returned an error.');
                    // return res.status(400).json(err);
                    reject(-1);
                }
                const rows = apiRes.data.values || [];
    
                const idososArray = [];
                rows.forEach((item, index) => {
                    idososArray.push({
                        row: 'A' + (index + 2),
                        dataNascimento: item[0],
                        nome: item[1],
                        telefone1: item[2],
                        telefone2: item[3],
                        agenteSaude: item[4],
                    });
                });
    
                var MongoClient = require( 'mongodb' ).MongoClient;
                MongoClient.connect( 'mongodb://localhost:27017', { useUnifiedTopology: true }, function( err, client ) {
                    const db = client.db('planilhas');
                    const idososcollection = db.collection('idosos');
                    idososcollection.drop();
    
                    idososcollection.insertMany(idososArray, function(err, result) {
                        client.close();
                        if(result.result.ok) {
                            resolve(result.result.n);
                        } else {
                            reject(-2);
                        }
                    });
                });
            });
        });

        return promise;
    } 

    //TODO refatorar retorno da promisse, para retornar mensagens de erro
    const updateRespostas = async (gerenciamentoSpreadsheet, googleClient) => {
        const promise = new Promise( (resolve, reject) => {

            sheets.spreadsheets.values.get({
                auth: googleClient,
                spreadsheetId: gerenciamentoSpreadsheet,
                range: `'Respostas'!A2:AI`,
            }, (err, apiRes) => {
                if (err) {
                    console.error('The Google API returned an error.');
                    // return res.status(400).json(err);
                    reject(-1);
                }
                const rows = apiRes.data.values || [];

                const respostasArray = [];
                rows.forEach((item, index) => {
                    respostasArray.push({
                        row: 'A' + (index + 2),
                        data: item[0],
                        vigilante: item[1],
                        dadosIniciais: {
                            nome: item[2],
                            atendeu: item[3] === 'Sim',
                        },
                        idade: +item[4],
                        fonte: item[5] ? item[5] : '',
                        sintomasIdoso: {
                            apresentaSinomasGripeCOVID: item[6] !== undefined && item[6] !== 'Não',
                            sintomas: item[6] === undefined || item[6] === 'Não' ? [] : item[6].split(',').map(s => s.trim()),
                            outrosSintomas: item[7] === undefined || item[7] === 'Não' ? [] : item[7].split(',').map(s => s.trim()),
                            detalhesAdicionais: item[8],
                            haQuantosDiasIniciaram: +item[9],
                            contatoComCasoConfirmado: item[10] === 'Sim',
                        },
                        comorbidades: {
                            condicoesSaude: item[11] === undefined || item[11] === 'Não' ? [] : item[11].split(',').map(s => s.trim()),
                            medicacaoDiaria: {
                                medicacoes: item[12] === undefined || item[12] === 'Não' ? [] : item[12].substring(4).split(',').map(s => s.trim()),
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
                            qtdComodosCasa: +item[21],
                            realizaAtividadePrazerosa: item[22] === 'Sim',
                        },
                        qtdAcompanhantesDomicilio: item[23] === 'Somente o idoso' ? 0 : +item[23],
                        sintomasDomicilio: item[24] === undefined || item[24] === 'Não' ? [] : item[24].split(',').map(s => s.trim()),
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
    
                var MongoClient = require( 'mongodb' ).MongoClient;
                MongoClient.connect( 'mongodb://localhost:27017', { useUnifiedTopology: true }, function( err, client ) {
                    const db = client.db('planilhas');
    
                    const respostasCollection = db.collection('respostas');
                    respostasCollection.drop();
                    respostasCollection.insertMany(respostasArray, function(err, result) {
                        if(result.result.ok) {
                            resolve(result.result.n)
                        } else {
                            reject(-2);
                        }
                    //   client.close();
                    });
                });
               
            });
        });

        return promise;
    } 

    /**
     * Sincroniza o banco com uma planilha
     */
    const sync = async (req, res) => {
        const start = new Date();
        const googleClient = await getGoogleClient();

        const idososSpreadsheet = '1sP1UegbOnv5dVoO6KMtk2nms6HqjFs3vuYN5FGMWasc';
        const gerenciamentoSpreadsheet = '1tBlFtcTlo1xtq4lU1O2Yq94wYaFfyL9RboX6mWjKhh4';

        const resultIdosos = await updateIdosos(idososSpreadsheet, googleClient );
        console.log(`${resultIdosos} rows inserted in collection idosos`);

        const resultRespostas = await updateRespostas(gerenciamentoSpreadsheet, googleClient );
        console.log(`${resultRespostas} rows inserted in collection respostas`);

        return res.json({
            ok: true,
            idosos: `${resultIdosos} rows inserted in collection idosos`,
            respostas: `${resultRespostas} rows inserted in collection respostas`,
            runtime: ((new Date()) - start)/1000,
        });
    };

    return { get, sync };
};