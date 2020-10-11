 
const ObjectId = require('mongodb').ObjectID;
const atendimentoService = require('../service/atendimentoService');
const vigilanteService = require('../service/vigilanteService');
const idosoService = require('../service/idosoService');
const unidadeService = require('../service/unidadeService');

module.exports = app => {

    const vigilantes = async (req, res) => {
        // console.log('unidadeId: ', req.params.unidadeId)
        try {
            const result = await vigilanteService.findAll('USF_Rocas'); // TODO receber unidade por parametro
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    const stats = async (req, res) => {
        const idosos = await countDocuments('idosos');
        const vigilantes = await countDocuments('vigilantes');
        const atendimentos = await countDocuments('atendimentos');
        const idososStats = await countDocuments('idososStats');
        return res.json({ idosos, vigilantes, atendimentos, idososStats });
    }

    const countDocuments = async (collectionName) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db('planilhas');
                const collection = db.collection(collectionName);
                collection.countDocuments(function(err, result) {
                    resolve(result);
                });
            });
        });
        return promise;
    } 

    return { vigilantes, stats };
};