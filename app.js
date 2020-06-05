require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis'); 
const sheets = google.sheets('v4');
const getGoogleClient = require('./config/google-client');

var express = require('express');
var path = require('path');
var app = express();

var port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Hello World from api-frenteprevencaocovidrn-org-br!');
});

/**
 * Método genérico para ler qualquer aba de uma planilha
 */
app.get('/docs/:id/sheets/:sheetName/range/:range', async function(req, res) {
    const googleClient = await getGoogleClient();
    sheets.spreadsheets.values.get({
        auth: googleClient,
        spreadsheetId: req.params.id,
        range: `'${req.params.sheetName}'!${req.params.range}`,
    }, (err, apiRes) => {
        if (err) {
        console.error('The API returned an error.');
        return res.status(400).json(err);
        }
        const rows = apiRes.data.values || [];
        return res.json(rows);
    });
});

/**
 * Lê a aba Respostas e retorna dados formatados como um objeto
 * TODO calcular as escalas de cada resposta
 */
app.get('/docs/:id/respostas/range/:range', async function(req, res) {
    const googleClient = await getGoogleClient();
    sheets.spreadsheets.values.get({
        auth: googleClient,
        spreadsheetId: req.params.id,
        range: `'Respostas'!${req.params.range}`,
    }, (err, apiRes) => {
        if (err) {
        console.error('The API returned an error.');
        return res.status(400).json(err);
        }
        const rows = apiRes.data.values || [];

        const array = [];
        rows.forEach((item, index) => {
            array.push({
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
                escalas: {},
            });
        });

        array.map(atendimento => {
            const vul = calcularVulnerabilidade(atendimento);
            atendimento.escalas.vulnerabilidade = vul;
        });
        // console.log(vulnerabilidades);
        return res.json(array);
    });
});

function calcularVulnerabilidade(atendimento) {
    if(atendimento.dadosIniciais.atendeu) {
        if(atendimento.vulnerabilidades.violencia) {
            return 'C - situação de violência';
        } else if(atendimento.vulnerabilidades.alimentar){
            return 'B - vulnerabilidade alimentar';
        } else if(atendimento.vulnerabilidades.financeira) {
            return 'A  vulnerabilidade financeira';
        } else {
            return '0 - Sem vulnerabilidades';
        }
    } else {
        return null;
    }
}
                                
app.listen(port, function () {
    console.log('[api-frenteprevencaocovidrn-org-br] listening on port %s', port);
});