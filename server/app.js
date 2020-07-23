const app = require('express')();
const consign = require('consign');
const { mongoUris } = require('./config/environment');

  consign()
    .include('/server/config/passport.js')
    .then('/server/config/socket.js')
    .then('/server/config/middlewares.js')
    .then('/server/config/mail.js')
    .then('/server/api/validation.js')
    .then('/server/api')
    // .then('/server/schedule')
    .then('/server/config/routes.js')
    .into(app);
  
    
    //protocolo http
    const server = require('http').createServer(app);//TODO e se for https?
    app.server.config.socket.init(server);
  // //protocolo wss (websocket)
  // const io = require('socket.io')(server, { origins: '*:*' });

  // io.on('connection', socket => {
  //   console.log('socket conectado', socket.id);

  //   socket.on('emit_method', data => {
  //     console.log(data)
  //   });
  // })
 
  const port = process.env.PORT || 3000;
  server.listen(port, ()=>{
    console.log('[api.frenteprevencaocovidrn.com.br] BACKEND executando na porta '+ port + '. Mongodb: ' + mongoUris);
  });

