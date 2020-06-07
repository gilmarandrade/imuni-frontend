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

    /**
     * Sincroniza o banco com uma planilha
     */
    const sync = async (req, res) => {
        const idososSpreadsheet = '1sP1UegbOnv5dVoO6KMtk2nms6HqjFs3vuYN5FGMWasc';
        const gerenciamentoSpreadsheet = '1tBlFtcTlo1xtq4lU1O2Yq94wYaFfyL9RboX6mWjKhh4';

        const googleClient = await getGoogleClient();
        sheets.spreadsheets.values.get({
            auth: googleClient,
            spreadsheetId: idososSpreadsheet,
            range: `'Idosos'!A2:E`,
        }, (err, apiRes) => {
            if (err) {
            console.error('The Google API returned an error.');
            return res.status(400).json(err);
            }
            const rows = apiRes.data.values || [];

            const array = [];
            rows.forEach((item, index) => {
                array.push({
                    row: 'A' + (index + 2),
                    dataNascimento: item[0],
                    nome: item[1],
                    telefone1: item[2],
                    telefone2: item[3],
                    agenteSaude: item[4],
                });
            });

            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( 'mongodb://localhost:27017', function( err, client ) {
                const db = client.db('planilhas');
                const collection = db.collection('idosos');
                collection.drop();
                // Insert some documents

                collection.insertMany(array, function(err, result) {
                    if(result.result.ok) {
                        console.log(`${result.result.n} rows inserted` );
                    }
                  client.close();
                });
              } );

            return res.json(rows);
        });
    };

    return { get, sync };
};