var express = require('express');
var path = require('path');
var app = express();

var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
    res.send('Hello World from api-frenteprevencaocovidrn-org-br!');
});
                                
app.listen(port, function () {
    console.log('[api-frenteprevencaocovidrn-org-br] listening on port %s', port);
});