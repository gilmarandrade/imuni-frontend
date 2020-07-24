const path = require('path');

module.exports = {
    caminho: (process.env.NODE_ENV === 'production') ? path.resolve(__dirname, "../server/public") :  path.resolve(__dirname, "dist"), //não sei se isso ta sendo utilizado... Aqui será definido a pasta de saída onde contém o index.html e os outros arquivos
    forcarHTTPS: false, //Defina para true se desejar que o redirecionamento para HTTPS seja forçado (é necessário certificado SSL ativo)
    port: process.env.PORT || 3000,
    node_env: process.env.NODE_ENV,
    api: (process.env.NODE_ENV === 'production') ? 'http://api.frenteprevencaocovidrn.com.br/api' : 'http://localhost:3000/api',
    socketUrl: (process.env.NODE_ENV === 'production') ? 'http://api.frenteprevencaocovidrn.com.br' : 'http://localhost:3000',
}