const path = require('path');

module.exports = {
    //FIXIT por alguma razão as variaveis de ambiente não estao sendo lidas no servidor, talves eu pudesse ler no server e dar um jeito de mandar para o vue
    caminho: (process.env.NODE_ENV === 'production') ? path.resolve(__dirname, "../server/public") :  path.resolve(__dirname, "dist"), //Aqui será definido a pasta de saída onde contém o index.html e os outros arquivos.
    // caminho: path.resolve(__dirname, "../server/public"),
    forcarHTTPS: false, //Defina para true se desejar que o redirecionamento para HTTPS seja forçado (é necessário certificado SSL ativo)
    port: process.env.PORT || 3000,
    node_env: process.env.NODE_ENV,
    // api: 'http://localhost:3000/api',
    api: (process.env.NODE_ENV === 'production') ? 'http://api.frenteprevencaocovidrn.com.br/api' : 'http://localhost:3000/api',
}