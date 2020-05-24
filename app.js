var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;

MongoClient.connect('mongodb://kamino.mongodb.umbler.com:49284/uniquati', function(err, db) {
    if(err)  {
      throw err;
    } else {
      console.log('conectado ao banco uniquati');
    }
});


app.use(express.static(__dirname));

app.get('*', function(req, res){
  res.redirect('/');
});

var port = 3000;
app.listen(port);
console.log('Uniquati-Umbler - consegui iniciar o servidor na porta %s', port);
