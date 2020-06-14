const { calcularEscalas } = require('../config/helpers');
const { read } = require('../config/sheetsApi');

//TODO usar configuração do banco
const { mongoUris } = require('../config/environment');
const ObjectId = require('mongodb').ObjectID;
const atendimentoService = require('../service/atendimentoService');

module.exports = app => {

    const idososByVigilante = async (req, res) => {
        //TODO futuramente deverá ser pelo id
        const nomeVigilante = req.params.id;

        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
            const db = client.db('planilhas');
            const idososStatsCollection = db.collection('idososStats');

            idososStatsCollection.find({ vigilante: nomeVigilante }).toArray(function(err, result) {
                client.close();
                if (err) 
                    return res.status(500).send(err);
                return res.json(result);
            });
        });
    }

    const idoso = async (req, res) => {
        //TODO futuramente deverá ser pelo id
        const nomeIdoso = req.params.id;

        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
            const db = client.db('planilhas');
            const idososStatsCollection = db.collection('idososStats');

            idososStatsCollection.findOne({ nome: nomeIdoso }, function(err, result) {
                client.close();
                if (err) 
                    return res.status(500).send(err);
                // console.log(result)
                return res.json(result);
            });
        });
    }

    const atendimentosByIdoso = async (req, res) => {
        //TODO futuramente deverá ser pelo id
        const nomeIdoso = req.params.id;
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
            const db = client.db('planilhas');
            const atendimentosCollection = db.collection('atendimentos');

            atendimentosCollection.find({ "fichaVigilancia.dadosIniciais.nome" : nomeIdoso }, {
                projection: {
                    _id: 1,
                    "fichaVigilancia.data": 1,
                    "fichaVigilancia.dadosIniciais.atendeu": 1,
                    "escalas": 1,
                    "fichaVigilancia.vigilante": 1,
                    "fichaVigilancia.duracaoChamada": 1,
                }
            }).sort({"fichaVigilancia.data":-1}).toArray(function(err, result) {
                client.close();
                if (err) 
                    return res.status(500).send(err);
                return res.json(result);
            });
        });
    }

    const atendimento = async (req, res) => {
        //TODO futuramente deverá ser pelo id
        const id = req.params.id;
        console.log(id)

        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
            const db = client.db('planilhas');
            const atendimentosCollection = db.collection('atendimentos');

            // atendimentosCollection.findOne({ _id: ObjectId(id) }, function(err, result) {
            //     client.close();
            //     if (err) 
            //         return res.status(500).send(err);
            //     // console.log(result)
            //     return res.json(result);
            // });

            atendimentosCollection.aggregate([
                { $match: { _id: ObjectId(id) } },
                { $lookup: {
                    from: 'idososStats',
                    let: { nome_idoso: "$fichaVigilancia.dadosIniciais.nome" },
                    pipeline: [
                        { $match: 
                            { $expr:
                                { $and:
                                    [
                                        { $eq: [ '$nome', '$$nome_idoso' ] },
                                    ]
                                }
                            }, 
                        },
                        { $limit : 1 },
                        {
                            $project: {
                                stats: 0,
                            }
                        }
                    ],
                    as: 'idoso',
                  }
                },
                { $unwind: '$idoso' },
            ]).toArray(function(err, result) {
                // client.close();
                if(err) {
                    return res.status(500).send(err);
                } else {
                    // console.log(result)
                    return res.json(result);
                }
            });

        });
    }

    const vigilantes = async (req, res) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
            const db = client.db('planilhas');
            const vigilantesCollection = db.collection('vigilantes');

            vigilantesCollection.find({ }).sort({nome:1}).toArray(function(err, result) {
                client.close();
                if (err) 
                    return res.status(500).send(err);
                return res.json(result);
            });
        });
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
            MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
                if(err) reject(err);
                const db = client.db('planilhas');
                const collection = db.collection(collectionName);
                collection.countDocuments(function(err, result) {
                    resolve(result);
                });
            });
        });
        return promise;
    } 

    return { idososByVigilante, idoso, atendimentosByIdoso, atendimento, vigilantes, stats };
};