module.exports = {
    authSecret: process.env.authSecret || 'asdsfghjkklçlkjhgf23456@#$%¨&*',
    mongoUris: process.env.mongoUri || 'mongodb://localhost/knowledge_stats',
    
    // acesso externo
    // mongodb://usuario:senha@kamino.mongodb.umbler.com:porta/banco

    // acesso interno
    // mongodb://usuario:senha@host:porta/banco

    //localhost
    // mongodb://localhost/banco
}