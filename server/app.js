const env = require('dotenv').config().parsed;
const app = require('express')();
const consign = require('consign');

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


server.listen(process.env.PORT, ()=>{
  console.log('[' + env.DOMAIN + '] server running');
  console.log(env)
});

