require('dotenv').config();
const bodyParser = require('body-parser');
const { google } = require('googleapis'); 
const sheets = google.sheets('v4');
const express = require('express');
const path = require('path');
const getGoogleClient = require('./config/google-client');
const app = express();

var port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Hello World from frenteprevencaocovidrn-org-br FRONTEND!');
});

app.listen(port, function () {
    console.log('[frenteprevencaocovidrn.com.br] FRONTEND listening on port %s', port);
});