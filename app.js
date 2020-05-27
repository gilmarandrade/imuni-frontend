const app = require('express')();
const consign = require('consign');
const mongoose = require('mongoose');

require('./config/mongodb');

app.mongoose = mongoose;

consign()
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./api/validation.js')
  .then('./api')
  .then('./schedule')
  .then('./config/routes.js')
  .into(app);

// const bodyParser = require('body-parser');
// var MongoClient = require('mongodb').MongoClient;

// MongoClient.connect('mongodb://mongo_uniquati:27017/uniquati', function(err, db) {
//     if(err)  {
//       throw err;
//     } else {
//       console.log('conectado ao banco uniquati');
//     }
// });


// app.use(express.static(__dirname));

// app.get('*', function(req, res){
//   res.redirect('/');
// });

// app.use(bodyParser.text());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   console.log('será que serei chamado antes?');
//   next();
// });

// app.get('/produtos/relatorio', (req, res, next) => {
//   res.json({ completo: req.query.completo, ano: req.query.ano });
// });

// app.get('/produtos/:id', (req, res, next) => {
//   res.json({ id: req.params.id });
// });


// app.post('/produtos/', (req, res, next) => {
//   res.send(req.body);
// });


// app.get('/opa',(req, res, next) => {
//   console.log('durante');
//   res.json({
//     data: [
//       { 
//         name: "Ana Lúcia",
//         price: 122.5,
//         dicount: false,
//       },
//       { 
//         name: "Ana Lúcia 2",
//         price: 452.5,
//         dicount: null,
//       }
//     ],
//     count: 30,
//     skip: 0,
//     limit: 3,
//     status: 200,
//   });
//   // res.send('estou bem');
//   next();
// });

// app.use('/opa', (req, res) => {
//   console.log('será que serei chamado depois?');
// });

var port = 3000;
app.listen(port, ()=>{
  console.log('Backend executando na porta %s', port);
});
