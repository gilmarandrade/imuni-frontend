const app = require('express')();
const consign = require('consign');

// const mongodbutil = require( './config/mongodb' );

// mongodbutil.connectToServer( function( err) {

  // const expressMongoDb = require('express-mongo-db');
  // app.use(expressMongoDb(mongoUris));
  
  consign()
    // .include('./config/passport.js')
    .then('./config/middlewares.js')
    // .then('./api/validation.js')
    .then('./api')
    // .then('./schedule')
    .then('./config/routes.js')
    .into(app);
  
  
  const port = process.env.PORT || 3000;
  app.listen(port, ()=>{
    console.log('[api-frenteprevencaocovidrn-org-br] BACKEND executando na porta %s', port);
  });

