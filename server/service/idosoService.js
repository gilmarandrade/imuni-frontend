 
const userService = require('../service/userService');

const ObjectId = require('mongodb').ObjectID;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = 'idosos';

// const findAll = async (collectionPrefix) => {
//     const promise = new Promise( (resolve, reject) => {
//         var MongoClient = require( 'mongodb' ).MongoClient;
//         MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
//             if(err) return reject(err);
//             const db = client.db(dbName);
            
//             const collection = db.collection(`${collectionPrefix}.${collectionName}`);

//             collection.find().toArray(function(err, result) {
//                 if(err) {
//                     reject(err);
//                 } else {
//                     resolve(result);
//                 }
//             });
//         });

//     });

//     return promise;
// }


const deleteAll = async (unidade) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(`${unidade.collectionPrefix}.${collectionName}`);

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
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
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
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
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
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
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
                unidade: item.unidade,
                nome: item.nome,
                dataNascimento: item.dataNascimento,
                telefone1: item.telefone1,
                telefone2: item.telefone2,
                agenteSaude: item.agenteSaude,
                vigilante: item.vigilante,
                // stats: item.stats,
                // score: item.score,
                // epidemiologia: item.epidemiologia,
            }
        });
    };
    // console.log(idosoAtendimento);
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
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
                // console.log(result)
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
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            //o upsert deveria passar somente os campos que deveriam ser atualizados?
            collection.updateOne({ nomeLower: idosoAtendimento.nomeLower }, {
                $set: { 
                    row: idosoAtendimento.row,
                    unidade: idosoAtendimento.unidade,
                    nome: idosoAtendimento.nome,
                    dataNascimento: idosoAtendimento.dataNascimento,
                    telefone1: idosoAtendimento.telefone1,
                    telefone2: idosoAtendimento.telefone2,
                    agenteSaude: idosoAtendimento.agenteSaude,
                    vigilante: idosoAtendimento.vigilante,
                    // stats: idosoAtendimento.stats,
                    // score: idosoAtendimento.score,
                    // epidemiologia: idosoAtendimento.epidemiologia,
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

const findById = async (collectionPrefix, id) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const idososCollection = db.collection(`${collectionPrefix}.${collectionName}`);

            const ultimasEscalasCollection = `${collectionPrefix}.ultimasEscalas`;
            const ultimosAtendimentosCollection = `${collectionPrefix}.ultimosAtendimentos`;
            // TODO criar uma View com essa collection?
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
                { $match: { _id: ObjectId(id) } },
                {
                    $lookup:
                    {
                        from: ultimosAtendimentosCollection,
                        localField: 'nome',
                        foreignField: 'nome',
                        as: 'ultimoAtendimento'
                    }
                },
                { $unwind: { path: "$ultimaEscala", preserveNullAndEmptyArrays: true } },
                // { $project: { "ultimaEscala.epidemiologia": 0 } },
                { $unwind: { path: "$ultimoAtendimento", preserveNullAndEmptyArrays: true } },
                { $limit : 1 },
            ]).toArray(function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    // console.log(result);
                    if(result.length == 0) resolve(null);
                    else resolve(result[0]);
                }
            });


            // idososCollection.findOne({ _id: ObjectId(id) }, function(err, result) {
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


//TODO todos os finds estão buscando na tabela errada, verificar se esses metodos são realmente utilizados
const findByNome = async (collectionPrefix, nomeLower) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const idososCollection = db.collection(`${collectionPrefix}.${collectionName}`);

            const ultimasEscalasCollection = `${collectionPrefix}.ultimasEscalas`;
            const ultimosAtendimentosCollection = `${collectionPrefix}.ultimosAtendimentos`;
            // TODO criar uma View com essa collection?
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
                { $match: { nomeLower: nomeLower } },
                {
                    $lookup:
                    {
                        from: ultimosAtendimentosCollection,
                        localField: 'nome',
                        foreignField: 'nome',
                        as: 'ultimoAtendimento'
                    }
                },
                { $unwind: { path: "$ultimaEscala", preserveNullAndEmptyArrays: true } },
                // { $project: { "ultimaEscala.epidemiologia": 0 } },
                { $unwind: { path: "$ultimoAtendimento", preserveNullAndEmptyArrays: true } },
                { $limit : 1 },
            ]).toArray(function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    // console.log(result);
                    if(result.length == 0) resolve(null);
                    else resolve(result[0]);
                }
            });


            // idososCollection.findOne({ _id: ObjectId(id) }, function(err, result) {
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

const findAllByUser = async (collectionPrefix, usuarioId, filter, sort) => {

    const user = await userService.findById(usuarioId);
    console.log('find all by user')
    if(user) {
        console.log(user)
        switch(user.role) {
            case 'VIGILANTE':
                console.log('role vigilante')
                return findAllByVigilante(collectionPrefix, user.name, filter, sort);
            case 'PRECEPTOR':
                return findAll(collectionPrefix, filter, sort);
            case 'ADMINISTRADOR':
                console.log('eita...')
                return [];
            default:
                console.log('opa...')
                return [];
        }
    }
    return [];
}

const findAll = async (collectionPrefix, filter, sort) => {

    let match;
    switch(filter) {
        case 'com-escalas':
            match = { $match: { 'ultimaEscala': { $exists : true } } }; //apenas idosos com escalas
            break;
        case 'sem-escalas':
            match = { $match: { 'ultimaEscala': { $exists : false } } }; //apenas idosos sem escalas
            break;
        case 'all':
        default:
            match = { $match: { '_id': { $exists : true } } }; //todos
            break;
    }

    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const idososCollection = db.collection(`${collectionPrefix}.${collectionName}`);

            let querySort;
            switch(sort) {
                case 'score':
                    querySort = { $sort : { 'ultimaEscala.score': -1, nome: 1 } };//ultima escala descendente
                break;
                case 'ultimo-atendimento':
                    querySort = { $sort: { 'ultimoAtendimento.data': -1, nome: 1 } };//ultimo atendimento (tentativa) des
                    break;
                case 'proximo-atendimento':
                    querySort = { $sort: { 'ultimaEscala.dataProximoAtendimento': -1, nome: 1 } };//sugestão proximo atendimento desc
                    break;
                case 'nome':
                default:
                    querySort = { $sort : { nome: 1 } };//nome asc 
            }
  
            const ultimasEscalasCollection = `${collectionPrefix}.ultimasEscalas`;
            const ultimosAtendimentosCollection = `${collectionPrefix}.ultimosAtendimentos`;
            // TODO criar uma View com essa collection?
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
                // { $match: { vigilante: nomeVigilante } },
                {
                    $lookup:
                    {
                        from: ultimosAtendimentosCollection,
                        localField: 'nome',
                        foreignField: 'nome',
                        as: 'ultimoAtendimento'
                    }
                },
                { $unwind: { path: "$ultimaEscala", preserveNullAndEmptyArrays: true } },
                { $project: { "ultimaEscala.epidemiologia": 0 } },
                { $unwind: { path: "$ultimoAtendimento", preserveNullAndEmptyArrays: true } },
                match,
                querySort,
            ]).toArray(function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    // console.log(result);
                    resolve(result);
                }
            });
        });

    });

    return promise;
}

const findAllByVigilante = async (collectionPrefix, nomeVigilante, filter, sort) => {
    console.log('find all by vigilante')
    if(filter) {
        console.log(filter)
    } else {
        console.log('sem filtro')
    }

    let match;
    switch(filter) {
        case 'com-escalas':
            match = { $match: { 'ultimaEscala': { $exists : true } } }; //apenas idosos com escalas
            break;
        case 'sem-escalas':
            match = { $match: { 'ultimaEscala': { $exists : false } } }; //apenas idosos sem escalas
            break;
        case 'all':
        default:
            match = { $match: { '_id': { $exists : true } } }; //todos
            break;
    }

    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const idososCollection = db.collection(`${collectionPrefix}.${collectionName}`);

            let querySort;
            switch(sort) {
                case 'score':
                    querySort = { $sort : { 'ultimaEscala.score': -1, nome: 1 } };//ultima escala descendente
                break;
                case 'ultimo-atendimento':
                    querySort = { $sort: { 'ultimoAtendimento.data': -1, nome: 1 } };//ultimo atendimento (tentativa) des
                    break;
                case 'proximo-atendimento':
                    querySort = { $sort: { 'ultimaEscala.dataProximoAtendimento': -1, nome: 1 } };//sugestão proximo atendimento desc
                    break;
                case 'nome':
                default:
                    querySort = { $sort : { nome: 1 } };//nome asc 
            }
  
            const ultimasEscalasCollection = `${collectionPrefix}.ultimasEscalas`;
            const ultimosAtendimentosCollection = `${collectionPrefix}.ultimosAtendimentos`;
            // TODO criar uma View com essa collection?
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
                { $match: { vigilante: nomeVigilante } },
                {
                    $lookup:
                    {
                        from: ultimosAtendimentosCollection,
                        localField: 'nome',
                        foreignField: 'nome',
                        as: 'ultimoAtendimento'
                    }
                },
                { $unwind: { path: "$ultimaEscala", preserveNullAndEmptyArrays: true } },
                { $project: { "ultimaEscala.epidemiologia": 0 } },
                { $unwind: { path: "$ultimoAtendimento", preserveNullAndEmptyArrays: true } },
                match,
                querySort,
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


module.exports = { findAll, deleteAll, insertAll, findAllByUser, findAllByVigilante, replaceOne, updateOne, findByNome, bulkUpdateOne, bulkReplaceOne, findById };