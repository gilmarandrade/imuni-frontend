// const { calcularEscalas } = require('../config/helpers');

//TODO usar configuração do banco
const { mongoUris } = require('../config/environment');
const ObjectId = require('mongodb').ObjectID;
const dbName = 'covidrn_planilha';
const collectionName = 'atendimentos';


const findAtendimentosByIdoso = async (collectionPrefix, idoso) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if (err) { return reject(err); }

            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            collection.find({ "fichaVigilancia.dadosIniciais.nomeLower" : idoso.nomeLower }).sort({"fichaVigilancia.data":-1}).toArray(function(err, result) {
                if (err) 
                    reject(err);
                else
                    resolve(result);
            });
        });

    });

    return promise;
}

const findAll = async (collectionPrefix) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            collection.find().toArray(function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

    });

    return promise;
}

const deleteAll = async (collectionPrefix) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            collection.deleteMany({}, function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    resolve(result.result.n);
                }
            });
        });

    });

    return promise;
}

const insertAll = async (collectionPrefix, array) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            collection.insertMany(array, function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    resolve(result.result.n);
                }
            });
        });

    });

    return promise;
}

const bulkReplaceOne = async (collectionPrefix, atendimentosArray) => {
    const addToBatch = (batch, item) => {
        batch.find({ "fichaVigilancia.row": item.fichaVigilancia.row }).upsert().replaceOne(item);
    };

    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            // Initialize the unordered Batch
            const batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});
            for(let i = 0; i < atendimentosArray.length; i++) {
                addToBatch(batch, atendimentosArray[i]);
            };

            // Execute the operations
            batch.execute(function(err, result) {
                console.log(result)
                if(err) {
                    reject(err);
                } else {
                    resolve(result.ok);
                }
            });

            // collection.replaceOne({ "fichaVigilancia.row": atendimento.fichaVigilancia.row }, atendimento, { upsert: true }, function(err, result) {
            //     if(err) {
            //         reject(err);
            //     } else {
            //         resolve(result.result.n);
            //     }
            // });
        });

    });

    return promise;
}

const replaceOne = async (collectionPrefix, atendimento) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            collection.replaceOne({ "fichaVigilancia.row": atendimento.fichaVigilancia.row }, atendimento, { upsert: true }, function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    resolve(result.result.n);
                }
            });
        });

    });

    return promise;
}


const aggregateEscalas = async (collectionPrefix) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.idosos`);

            //ultimo atendimento efetuado (ligação atendida)
            collection.aggregate([
                    {
                        $lookup:
                        {
                            from: 'USF_Rocas.atendimentos',//TODO hardcoded
                            localField: 'nome',
                            foreignField: 'fichaVigilancia.dadosIniciais.nome',
                            as: 'atendimentos'
                        }
                    },
                    { $unwind: "$atendimentos" },
                    { $match: { "atendimentos.fichaVigilancia.dadosIniciais.atendeu": true } },
                    { $sort : { nome : 1, 'atendimentos.fichaVigilancia.data': -1 } },
                    {
                        $group:
                        {
                            _id: "$_id",
                            data: { $first: "$atendimentos.fichaVigilancia.data" },
                            // ultimoAtendimentoAtendeu: { $first: "$atendimentos.fichaVigilancia.dadosIniciais.atendeu" },
                            nome: { $first: "$atendimentos.fichaVigilancia.dadosIniciais.nome" },
                            score: { $first: "$atendimentos.escalas.scoreOrdenacao" },
                            vulnerabilidade: { $first: "$atendimentos.escalas.vulnerabilidade"  },
                            epidemiologica: { $first: "$atendimentos.escalas.epidemiologica"  },
                            riscoContagio: { $first: "$atendimentos.escalas.riscoContagio"  },
                            dataProximoAtendimento: { $first: "$atendimentos.escalas.dataProximoAtendimento"  },
                            // epidemiologia: { $last: "$atendimentos.fichaVigilancia.epidemiologia"  },

                        }
                    },
                    { $out: 'USF_Rocas.ultimasEscalas' }, //TODO hardcoded
                ]).toArray(function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    console.log(result);
                    resolve(result);
                }
            });
        });

    });

    return promise;
}

module.exports = {  findAll, deleteAll, insertAll, findAtendimentosByIdoso, replaceOne, bulkReplaceOne, aggregateEscalas };