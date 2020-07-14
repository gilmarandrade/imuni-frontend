require('dotenv').config();//lê o env file do projeto
const { google } = require('googleapis'); 
const sheets = google.sheets('v4');
const getGoogleClient = require('../config/google-client');

/**
 * 
 * @param {*} spreadsheetId 
 * @param {*} range 
 */
const read = async (spreadsheetId, range) => {
    // console.log('Reading', spreadsheetId, range)
    const googleClient = await getGoogleClient();
    
    const promise = new Promise( (resolve, reject) => {
        sheets.spreadsheets.values.get({
            auth: googleClient,
            spreadsheetId: spreadsheetId,
            range: range,
        }, (err, apiRes) => {
            if (err) {
                return reject(err.message);
            }
            return resolve(apiRes.data.values || []);
        });
    });

    return promise;
};

module.exports = { read };