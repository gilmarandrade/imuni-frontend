module.exports = {
    authSecret: process.env.authSecret || 'asdsfghjkklçlkjhgf23456@#$%¨&*',
    mongoUris: process.env.mongoUris || 'mongodb://localhost:27017/planilhas',

    // acesso externo
    // mongodb://usuario:senha@kamino.mongodb.umbler.com:porta/banco

    // acesso interno
    // mongodb://usuario:senha@host:porta/banco

    //localhost
    // mongodb://localhost/banco
}