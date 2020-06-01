var express = require('express');
var path = require('path');
var app = express();

var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
    res.send('Hello World from uniquati-com!');
});
                                
app.listen(port, function () {
    console.log('uniquati-com listening on port %s', port);
});