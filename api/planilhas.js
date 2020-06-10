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
            return res.json(arrayVigilantes);
        });
    }

    return { vigilantes };
};