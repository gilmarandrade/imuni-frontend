const bodyParser = require('body-parser');
const cors = require('cors');

const corsOptions = {
    origin: ['http://frenteprevencaocovidrn.com.br:*', 'http://frenteprevencaocovidrn.com.br:3000', 'http://frenteprevencaocovidrn.com.br:80', 'http://localhost:8080'],
    optionsSuccessStatus: 200
}

module.exports = app => {
    app.use(cors(corsOptions));
    app.use(bodyParser.json());
};
