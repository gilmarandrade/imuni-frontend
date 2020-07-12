const bodyParser = require('body-parser');
const cors = require('cors');

const corsOptions = {
    origin: ['http://frenteprevencaocovidrn-org-br.umbler.net', 'http://localhost:8080'],
    optionsSuccessStatus: 200
}

module.exports = app => {
    app.use(bodyParser.json());
    app.use(cors(corsOptions));
};
