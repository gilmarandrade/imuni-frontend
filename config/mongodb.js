const mongoose = require('mongoose');

// acesso externo:
// mongodb://uniquati:2wt5p5cMoq65y4n@kamino.mongodb.umbler.com:49284/uniquati

// acesso interno:
// mongodb://uniquati:2wt5p5cMoq65y4n@mongo_uniquati:27017/uniquati

// mongodb://mongo_uniquati:27017/uniquati'
// mongodb://localhost/knowledge_stats
mongoose.connect('mongodb://uniquati:2wt5p5cMoq65y4n@mongo_uniquati:27017/uniquati', { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(e => {
        const msg = "Não foi possível conectar com o MongoDB";
        console.log('\x1b[41m%s\x1b[37m', msg, '\x1b[0m');
    });
