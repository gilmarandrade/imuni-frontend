const { mongoUris } = require('../config/environment');
const ObjectId = require('mongodb').ObjectID;
const dbName = 'covidrn_planilha';
const collectionName = 'idosos';

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

const bulkReplaceOne = async (collectionPrefix, idososArray) => {
    const addToBatch = (batch, item) => {
        batch.find({ nomeLower: item.nomeLower }).upsert().replaceOne(item);
    };

    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            // Initialize the unordered Batch
            const batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});
            for(let i = 0; i < idososArray.length; i++) {
                addToBatch(batch, idososArray[i]);
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

            // collection.replaceOne({ nomeLower: idosoAtendimento.nomeLower }, idosoAtendimento, { upsert: true }, function(err, result) {
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

const replaceOne = async (collectionPrefix, idosoAtendimento) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            collection.replaceOne({ nomeLower: idosoAtendimento.nomeLower }, idosoAtendimento, { upsert: true }, function(err, result) {
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


const bulkUpdateOne = async (collectionPrefix, idososArray) => {

    const addToBatch = (batch, item) => {
        batch.find({ nomeLower: item.nomeLower }).upsert().updateOne({
            $set: { 
                row: item.row,
                nome: item.nome,
                dataNascimento: item.dataNascimento,
                telefone1: item.telefone1,
                telefone2: item.telefone2,
                agenteSaude: item.agenteSaude,
                vigilante: item.vigilante,
                stats: item.stats,
                score: item.score,
                epidemiologia: item.epidemiologia,
            }
        });
    };
    // console.log(idosoAtendimento);
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            // Initialize the unordered Batch
            const batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});
            for(let i = 0; i < idososArray.length; i++) {
                addToBatch(batch, idososArray[i]);
            };

            // Execute the operations
            batch.execute(function(err, result) {
                console.log(result)
                if(err) {
                    reject(err);
                } else {
                    resolve(result.ok);
                }
                // // Check state of result
                // assert.equal(2, result.nInserted);
                // assert.equal(1, result.nUpserted);
                // assert.equal(1, result.nMatched);
                // assert.ok(1 == result.nModified || result.nModified == null);
                // assert.equal(1, result.nRemoved);
        
                // var upserts = result.getUpsertedIds();
                // assert.equal(1, upserts.length);
                // assert.equal(2, upserts[0].index);
                // assert.ok(upserts[0]._id != null);
        
                // var upsert = result.getUpsertedIdAt(0);
                // assert.equal(2, upsert.index);
                // assert.ok(upsert._id != null);
        
                // Finish up test
                // db.close();
            });

            //o upsert deveria passar somente os campos que deveriam ser atualizados?
            // collection.updateOne({ nomeLower: idosoAtendimento.nomeLower }, {
            //     $set: { 
            //         row: idosoAtendimento.row,
            //         nome: idosoAtendimento.nome,
            //         dataNascimento: idosoAtendimento.dataNascimento,
            //         telefone1: idosoAtendimento.telefone1,
            //         telefone2: idosoAtendimento.telefone2,
            //         agenteSaude: idosoAtendimento.agenteSaude,
            //         vigilante: idosoAtendimento.vigilante,
            //         stats: idosoAtendimento.stats,
            //         score: idosoAtendimento.score,
            //         epidemiologia: idosoAtendimento.epidemiologia,
            //     }
            // }, { upsert: true }, function(err, result) {
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

const updateOne = async (collectionPrefix, idosoAtendimento) => {
    // console.log(idosoAtendimento);
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            //o upsert deveria passar somente os campos que deveriam ser atualizados?
            collection.updateOne({ nomeLower: idosoAtendimento.nomeLower }, {
                $set: { 
                    row: idosoAtendimento.row,
                    nome: idosoAtendimento.nome,
                    dataNascimento: idosoAtendimento.dataNascimento,
                    telefone1: idosoAtendimento.telefone1,
                    telefone2: idosoAtendimento.telefone2,
                    agenteSaude: idosoAtendimento.agenteSaude,
                    vigilante: idosoAtendimento.vigilante,
                    stats: idosoAtendimento.stats,
                    score: idosoAtendimento.score,
                    epidemiologia: idosoAtendimento.epidemiologia,
                }
            }, { upsert: true }, function(err, result) {
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

const findAllByVigilante = async (collectionPrefix, nomeVigilante) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const idososCollection = db.collection(`${collectionPrefix}.${collectionName}`);
            
            const ultimasEscalasCollection = `${collectionPrefix}.ultimasEscalas`;

            idososCollection.aggregate([
                {
                    $lookup:
                    {
                        from: ultimasEscalasCollection,
                        localField: 'nome',
                        foreignField: 'nome',
                        as: 'ultimaEscala'
                    }
                },
                // { $unwind: "$ultimaEscala" },
                { $match: { vigilante: nomeVigilante } },
                { $sort : { 'ultimaEscala.score': -1, nome: 1 } },
            ]).toArray(function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    // console.log(result);
                    resolve(result);
                }
            });
            // collection.find({ vigilante: nomeVigilante }).sort({"score":-1}).toArray(function(err, result) {
            //     if(err) {
            //         reject(err);
            //     } else {
            //         resolve(result);
            //     }
            // });
        });

    });

    return promise;
}

const findByNome = async (collectionPrefix, nomeLower) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            collection.findOne({ nomeLower: nomeLower }, function(err, result) {
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

module.exports = { findAll, deleteAll, insertAll, findAllByVigilante, replaceOne, updateOne, findByNome, bulkUpdateOne, bulkReplaceOne };