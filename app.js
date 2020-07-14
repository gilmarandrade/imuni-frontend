const app = require('express')();
const consign = require('consign');
const { mongoUris } = require('./config/environment');

  consign()
    .include('./config/passport.js')
    .then('./config/socket.js')
    .then('./config/middlewares.js')
    .then('./api/validation.js')
    .then('./api')
    // .then('./schedule')
    .then('./config/routes.js')
    .into(app);
  
    
    //protocolo http
    const server = require('http').createServer(app);//TODO e se for https?
    app.config.socket.init(server);
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
    console.log('[api-frenteprevencaocovidrn-org-br] BACKEND executando na porta '+ port + '. Mongodb: ' + mongoUris);
  });

