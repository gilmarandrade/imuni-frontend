require('dotenv').config();
const bodyParser = require('body-parser');
const { google } = require('googleapis'); 
const sheets = google.sheets('v4');
const getGoogleClient = require('./config/google-client');

var express = require('express');
var path = require('path');
var app = express();

var port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Hello World from api-frenteprevencaocovidrn-org-br!');
});

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
                                
app.listen(port, function () {
    console.log('[api-frenteprevencaocovidrn-org-br] listening on port %s', port);
});