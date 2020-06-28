const app = require('express')();
const consign = require('consign');
const { mongoUris } = require('./config/environment');

  consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api/validation.js')
    .then('./api')
    // .then('./schedule')
    .then('./config/routes.js')
    .into(app);
  
  
  const port = process.env.PORT || 3000;
  app.listen(port, ()=>{
    console.log('[api-frenteprevencaocovidrn-org-br] BACKEND executando na porta '+ port + '. Mongodb: ' + mongoUris);
  });

