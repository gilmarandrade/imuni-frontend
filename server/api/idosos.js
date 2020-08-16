 
const ObjectId = require('mongodb').ObjectID;
const atendimentoService = require('../service/atendimentoService');
const vigilanteService = require('../service/vigilanteService');
const idosoService = require('../service/idosoService');
const unidadeService = require('../service/unidadeService');

module.exports = app => {

    const idososByUser = async (req, res) => {
        console.log('idosos by user' + req.params.usuarioId)
        //TODO futuramente deverá ser pelo id
        const usuarioId = req.params.usuarioId;
        const collectionPrefix = req.params.unidadeId;

        try {
            const result = await idosoService.findAllByUser(collectionPrefix, usuarioId, req.query.filter, req.query.sort);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    const idososByVigilante = async (req, res) => {

        //TODO futuramente deverá ser pelo id
        const nomeVigilante = req.params.vigilanteId;
        const collectionPrefix = req.params.unidadeId;
        console.log(req.query)

        try {
            const result = await idosoService.findAllByVigilante(collectionPrefix, nomeVigilante, req.query.filter, req.query.sort);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    const idoso = async (req, res) => {
        //TODO futuramente deverá ser pelo id
        const nomeIdoso = req.params.id;

        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            const db = client.db('planilhas');
            const idososStatsCollection = db.collection('idososStats');

            idososStatsCollection.findOne({ nome: nomeIdoso }, function(err, result) {
                // client.close();
                if (err) 
                    return res.status(500).send(err);
                // console.log(result)
                return res.json(result);
            });
        });
    }

    return { idososByUser, idososByVigilante, idoso };
};