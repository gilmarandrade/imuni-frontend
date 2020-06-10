require('dotenv').config();
const { google } = require('googleapis'); 
const sheets = google.sheets('v4');
const getGoogleClient = require('../config/google-client');


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


    const vigilantes = async (req, res) => {
        const spreadsheetId = req.params.idPlanilha;

        const googleClient = await getGoogleClient();
        sheets.spreadsheets.values.get({
            auth: googleClient,
            spreadsheetId: spreadsheetId,
            range: `'Status Atendimentos'!A2:A`,
        }, (err, apiRes) => {
            if (err) {
            console.error('The Google API returned an error.');
            return res.status(400).json(err);
            }
            const rows = apiRes.data.values || [];
            const vigilantes = {};
            rows.forEach((item, index) => {
                vigilantes[item[0]] = { nome: item[0]};
            });

            const arrayVigilantes = Object.values(vigilantes);
            arrayVigilantes.forEach((item, index) => {
                item.index = index + 1;
            });
            return res.json(arrayVigilantes);
        });
    }

    const idososByVigilante = async (req, res) => {
        const spreadsheetId = req.params.idPlanilha;
        const indexVigilante = req.params.indexVigilante;
        console.log(indexVigilante)

        const googleClient = await getGoogleClient();
        sheets.spreadsheets.values.get({
            auth: googleClient,
            spreadsheetId: spreadsheetId,
            range: `'Vigilante ${indexVigilante}'!A2:M`,
        }, (err, apiRes) => {
            if (err) {
            console.error('The Google API returned an error.');
            return res.status(400).json(err);
            }
            const rows = apiRes.data.values || [];
            const idosos = [];
            rows.forEach((item, index) => {
                if(item[1] !== undefined && item[1] !== "") {
                    idosos.push({
                        row: `'Vigilante ${indexVigilante}'!A${index + 2}:M${index + 2}`,
                        score: calcularScore(item[7], item[8], item[9]),
                        stats : {
                            qtdAtendimentosEfetuados: item[6] ? +item[6] : 0,
                            qtdAtendimentosNaoEfetuados: item[5] ? +item[5] : 0,
                            ultimoAtendimento: {
                                efetuado: !item[8] || item[8] === '0 - Não atendeu à ligação' ? false : true,
                                data: item[10] ? `${item[10]} ${item[11]}` : null,
                            },
                            ultimaEscala: {
                                vulnerabilidade: item[7] || "",
                                epidemiologica: item[8] || "",
                                riscoContagio: item[9] || "",
                                score: calcularScore(item[7], item[8], item[9]),
                            },
                            dataProximoAtendimento: item[12] || null,
                        },
                        vigilante: item[0] || "",
                        nome: item[1] || "",
                        telefone1: item[2] || "",
                        telefone2: item[3],
                        agenteSaude: item[4],
                    });
                }
            });

            idosos.sort((a, b) => {
                if (a.score > b.score) return -1;
                if (b.score > a.score) return 1;
              
                return 0;
            });
            console.log(idosos.length)
            return res.json(idosos);
        });

    }

    function calcularScore(vulnerabilidade, epidemiologica, riscoContagio) {

        let scoreOrdenacao = 0;

        switch (riscoContagio) {
            case 'Baixo':
                scoreOrdenacao += 1;
                break;
            case 'Médio':
                scoreOrdenacao += 2;
                break;
            case 'Alto':
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
            case 'IIb - Assitomático, mas recebe visitas ou domiciliares saem':
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
            case 'A - Vulnerabilidade Financeira':
                scoreOrdenacao += 100;
                break;
            case 'B - Vulnerabilidade Alimentar':
                scoreOrdenacao += 200;
                break;
            case 'C - Situação de Violência':
                scoreOrdenacao += 300;
                break;
        }

        return scoreOrdenacao;
    }

    return { vigilantes, idososByVigilante };
};