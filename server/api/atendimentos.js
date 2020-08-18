 
const ObjectId = require('mongodb').ObjectID;
const atendimentoService = require('../service/atendimentoService');
const vigilanteService = require('../service/vigilanteService');
const idosoService = require('../service/idosoService');
const unidadeService = require('../service/unidadeService');

module.exports = app => {

    const atendimentosByIdoso = async (req, res) => {
        //TODO futuramente deverá ser pelo id
        const nomeIdoso = req.params.id;
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
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
                // client.close();
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
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            const db = client.db('planilhas');
            const atendimentosCollection = db.collection('atendimentos');

            // atendimentosCollection.findOne({ _id: ObjectId(id) }, function(err, result) {
            //     // client.close();
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
                // // client.close();
                if(err) {
                    return res.status(500).send(err);
                } else {
                    // console.log(result)
                    return res.json(result);
                }
            });

        });
    }




    return { atendimentosByIdoso, atendimento };
};