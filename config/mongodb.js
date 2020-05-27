const mongoose = require('mongoose');
const { mongoUris } = require('./environment');

mongoose.connect(mongoUris, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(e => {
        const msg = "Não foi possível conectar com o MongoDB";
        console.log('\x1b[41m%s\x1b[37m', msg, '\x1b[0m');
    });
