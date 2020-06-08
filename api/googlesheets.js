require('dotenv').config();
const { google } = require('googleapis'); 
const sheets = google.sheets('v4');
const getGoogleClient = require('../config/google-client');

//TODO usar configuração do banco
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

    const arrayIdososByVigilante = async (sheetName, gerenciamentoSpreadsheet, googleClient) => {
        const promise = new Promise( (resolve, reject) => {

            sheets.spreadsheets.values.get({
                auth: googleClient,
                spreadsheetId: gerenciamentoSpreadsheet,
                range: `'${sheetName}'!A2:E`,
            }, (err, apiRes) => {
                if (err) {
                    console.error('The Google API returned an error.');
                    // return res.status(400).json(err);
                    reject(-1);
                }
                const rows = apiRes.data.values || [];
    
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

                resolve(idososArray);
    
            });
        });

        return promise;
    }

    //TODO refatorar retorno da promisse, para retornar mensagens de erro
    const updateIdosos = async (gerenciamentoSpreadsheet, googleClient) => {
        const sheetsVigilantes = [ 'Vigilante 1', 'Vigilante 2', 'Vigilante 3', 'Vigilante 4' ];

        const arrays = [];
        for(let i= 0; i < sheetsVigilantes.length; i++) {
            arrays[i] = await arrayIdososByVigilante(sheetsVigilantes[i], gerenciamentoSpreadsheet, googleClient);
        }
        const idososArray = [].concat(...arrays);
    
        const promise = new Promise( (resolve, reject) => {
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

                // const arrayVigilantes = Object.values(vigilantes);
    
                var MongoClient = require( 'mongodb' ).MongoClient;
                MongoClient.connect( 'mongodb://localhost:27017', { useUnifiedTopology: true }, function( err, client ) {
                    const db = client.db('planilhas');
    
                    const atendimentosCollection = db.collection('atendimentos');
                    atendimentosCollection.drop();
                    atendimentosCollection.insertMany(atendimentosArray, function(err, result) {
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

    //TODO não é necessário buscar na planilha, basta filtrar na collection de idosos
    const updateVigilantes = async (gerenciamentoSpreadsheet, googleClient) => {
        const promise = new Promise( (resolve, reject) => {

            sheets.spreadsheets.values.get({
                auth: googleClient,
                spreadsheetId: gerenciamentoSpreadsheet,
                range: `'Status Atendimentos'!A2:A`,
            }, (err, apiRes) => {
                if (err) {
                    console.error('The Google API returned an error.');
                    // return res.status(400).json(err);
                    reject(-1);
                }
                const rows = apiRes.data.values || [];
    
                const vigilantes = {};
                rows.forEach((item, index) => {
                    vigilantes[item[0]] = { nome: item[0]};
                });

                const arrayVigilantes = Object.values(vigilantes);
    
                var MongoClient = require( 'mongodb' ).MongoClient;
                MongoClient.connect( 'mongodb://localhost:27017', { useUnifiedTopology: true }, function( err, client ) {
                    const db = client.db('planilhas');
                    const vigilantesCollection = db.collection('vigilantes');
                    vigilantesCollection.drop();
    
                    vigilantesCollection.insertMany(arrayVigilantes, function(err, result) {
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

    /**
     * Sincroniza o banco com uma planilha
     */
    const sync = async (req, res) => {
        const start = new Date();
        const googleClient = await getGoogleClient();

        const idososSpreadsheet = '1sP1UegbOnv5dVoO6KMtk2nms6HqjFs3vuYN5FGMWasc';
        const gerenciamentoSpreadsheet = '1tBlFtcTlo1xtq4lU1O2Yq94wYaFfyL9RboX6mWjKhh4';
        
        const resultIdosos = await updateIdosos(gerenciamentoSpreadsheet, googleClient );
        console.log(`${resultIdosos} rows inserted in collection idosos`);

        const resultVigilantes = await updateVigilantes(gerenciamentoSpreadsheet, googleClient );
        console.log(`${resultVigilantes} rows inserted in collection vigilantes`);

        const resultRespostas = await updateRespostas(gerenciamentoSpreadsheet, googleClient );
        console.log(`${resultRespostas} rows inserted in collection atendimentos`);
        

        return res.json({
            ok: true,
            idosos: `${resultIdosos} rows in collection idosos`,
            atendimentos: `${resultRespostas} rows in collection atendimentos`,
            vigilantes: `${resultVigilantes} rows in collection vigilantes`,
            runtime: ((new Date()) - start)/1000,
        });
    };


        
    function calcularEscalas(atendimento) {
        const vulnerabilidade = calcularEscalaVulnerabilidade(atendimento);
        const epidemiologica = calculaEscalaEpidemiologica(atendimento);
        const riscoContagio = calcularEscalaRiscoContagio(atendimento);

        let scoreOrdenacao = 0;

        switch (riscoContagio) {
            case 'baixo':
                scoreOrdenacao += 1;
                break;
            case 'médio':
                scoreOrdenacao += 2;
                break;
            case 'alto':
                scoreOrdenacao += 3;
                break;
        }

        switch (epidemiologica) {
            case 'Ia - Assintomático, mora com assintomáticos':
                scoreOrdenacao += 10;
                break;
            case 'Ib - Assintomático, mas vive sozinho':
                scoreOrdenacao += 20;
                break;
            case 'IIa - Assintomático, mas sai de casa':
                scoreOrdenacao += 30;
                break;
            case 'IIb - Assitomático, mas recebe visita ou domiciliares saem':
                scoreOrdenacao += 40;
                break;
            case 'IIIa - Assintomático, mas com comorbidades':
                scoreOrdenacao += 50;
                break;
            case 'IIIb - Assintomático, mas tem contato com sintomáticos ou confirmados':
                scoreOrdenacao += 60;
                break;
            case 'IVa - Assintomático, mas sem medicações':
                scoreOrdenacao += 70;
                break;
            case 'IVb - Idoso sintomático':
                scoreOrdenacao += 80;
                break;
        }

        switch (vulnerabilidade) {
            case 'A - vulnerabilidade financeira':
                scoreOrdenacao += 100;
                break;
            case 'B - vulnerabilidade alimentar':
                scoreOrdenacao += 200;
                break;
            case 'C - situação de violência':
                scoreOrdenacao += 300;
                break;
        }

        return {
            vulnerabilidade,
            epidemiologica,
            riscoContagio,
            scoreOrdenacao,
        };
    }

    function calcularEscalaVulnerabilidade(atendimento) {
        if(atendimento.dadosIniciais.atendeu) {
            if(atendimento.vulnerabilidades.violencia) {
                return 'C - situação de violência';
            } else if(atendimento.vulnerabilidades.alimentar){
                return 'B - vulnerabilidade alimentar';
            } else if(atendimento.vulnerabilidades.financeira) {
                return 'A - vulnerabilidade financeira';
            } else {
                return '0 - Sem vulnerabilidades';
            }
        } else {
            return null;
        }
    }

    function calculaEscalaEpidemiologica(atendimento) {
        if(atendimento.dadosIniciais.atendeu) {
            if(atendimento.apresentaSinomasGripeCOVID) {
                return 'IVb - Idoso sintomático';
            }
            if(atendimento.comorbidades.medicacaoDiaria.deveTomar && !atendimento.comorbidades.medicacaoDiaria.acessoMedicacao) {
                return 'IVa - Assintomático, mas sem medicações';
            }
            if(atendimento.sintomasDomicilio || atendimento.sintomasIdoso.contatoComCasoConfirmado) {
                return 'IIIb - Assintomático, mas tem contato com sintomáticos ou confirmados';
            } 
            if(atendimento.comorbidades.condicoesSaude) {
                return 'IIIa - Assintomático, mas com comorbidades';
            } 
            if(atendimento.habitosDomiciliaresAcompanhantes.saiDeCasa || atendimento.epidemiologia.visitas.recebeVisitas){
                return 'IIb - Assitomático, mas recebe visita ou domiciliares saem';
            }
            if(atendimento.epidemiologia.isolamento.saiDeCasa){
                return 'IIa - Assintomático, mas sai de casa';
            } 
            if(atendimento.qtdAcompanhantesDomicilio === 0) {
                return 'Ib - Assintomático, mas vive sozinho';
            }
            if(!atendimento.sintomasDomicilio) {
                return 'Ia - Assintomático, mora com assintomáticos';
            } else {
                return '?';
            }
        }
        return '0 - Não atendeu à ligação';
    }

    function calcularEscalaRiscoContagio(atendimento) {
        let score = 0;
        if(!atendimento.dadosIniciais.atendeu) {
            score = null;
        } else {
            if(atendimento.sintomasIdoso.contatoComCasoConfirmado) {
                score += 10;
            }
            if(atendimento.sintomasIdoso.sintomas.includes('Falta de ar / Dificuldade para respirar')) {
                score += 10;
            }
            if(atendimento.sintomasIdoso.sintomas.includes('Febre')) {
                score += 5;
            }
            if(atendimento.sintomasIdoso.sintomas.includes('Tosse seca')) {
                score += 3;
            }
            if(atendimento.sintomasIdoso.sintomas.includes('Perda do olfato ou paladar')) {
                score += 3;
            }
            if(atendimento.sintomasIdoso.sintomas.includes('Dor de cabeça')) {
                score += 1;
            }
            if(atendimento.sintomasIdoso.sintomas.includes('Secreção nasal / Espirros')) {
                score += 1;
            }
            if(atendimento.sintomasIdoso.sintomas.includes('Dor na Garganta')) {
                score += 1;
            }
            if(atendimento.sintomasIdoso.sintomas.includes('Dor no corpo ou fadiga')) {
                score += 1;
            }
            if(atendimento.sintomasIdoso.sintomas.includes('Diarreia')) {
                score += 1;
            }
        }

        if(score === null) {
            return null;
        } else {
            if(score <= 9) {
                return 'baixo';
            } else if(score <= 19) {
                return 'médio';
            } else {
                return 'alto';
            } 
        }
    }

    const idososByVigilante = async (req, res) => {
        //TODO futuramente deverá ser pelo id
        const nomeVigilante = req.params.id;

        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( 'mongodb://localhost:27017', { useUnifiedTopology: true }, function( err, client ) {
            const db = client.db('planilhas');
            const idososCollection = db.collection('idosos');

            idososCollection.find({ vigilante: nomeVigilante }).toArray(function(err, result) {
                client.close();
                if (err) 
                    return res.status(500).send(err);
                return res.json(result);
            });
        });
    }

    const idoso = async (req, res) => {
        //TODO futuramente deverá ser pelo id
        const nomeIdoso = req.params.id;

        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( 'mongodb://localhost:27017', { useUnifiedTopology: true }, function( err, client ) {
            const db = client.db('planilhas');
            const idososCollection = db.collection('idosos');

            // idososCollection.findOne({ nome: nomeIdoso }, function(err, result) {
            //     client.close();
            //     if (err) 
            //         return res.status(500).send(err);
            //     console.log(result)
            //     return res.json(result);
            // });

            // TODO usar $group para agrupar informações sobre os atendimentos
            idososCollection.aggregate([
                { $match: { nome: nomeIdoso } },
                { $lookup:
                    {
                      from: 'atendimentos',
                      localField: 'nome',
                      foreignField: 'fichaVigilancia.dadosIniciais.nome',
                      as: 'atendimentos'
                    }
                },
                { $unwind: "$atendimentos" },
                { $sort: { "atendimentos.fichaVigilancia.data": -1 } },
                { $match: { "atendimentos.fichaVigilancia.dadosIniciais.atendeu": true } },
                { $limit : 1 },
            ]).toArray(function(err, result) {
                client.close();
                if (err) 
                    return res.status(500).send(err);
                return res.json(result);
            });
        });
    }

    const atendimentosByIdoso = async (req, res) => {
        //TODO futuramente deverá ser pelo id
        const nomeIdoso = req.params.id;
        console.log(nomeIdoso)
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( 'mongodb://localhost:27017', { useUnifiedTopology: true }, function( err, client ) {
            const db = client.db('planilhas');
            const atendimentosCollection = db.collection('atendimentos');

            atendimentosCollection.find({ "fichaVigilancia.dadosIniciais.nome" : nomeIdoso }).sort({"fichaVigilancia.data":-1}).toArray(function(err, result) {
                client.close();
                if (err) 
                    return res.status(500).send(err);
                return res.json(result);
            });
        });
    }

    return { get, sync, idososByVigilante, idoso, atendimentosByIdoso };
};