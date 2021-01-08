const ObjectId = require('mongodb').ObjectID;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = 'atendimentosForm';

/**
 * Insere um item
 * @param {*} item 
 */
const insertOne = async (item) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            item.idosoId = ObjectId(item.idosoId);
            item.vigilanteId = ObjectId(item.vigilanteId);
            item.unidadeId = ObjectId(item.unidadeId);

            collection.insertOne(item, function(err, result) {
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


const findById = async (id) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.findOne({ _id: ObjectId(id), _isDeleted: false }, function(err, result) {
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

    /**
     * Encontra a última epidemiologia preenchida de um idoso
     * @param {*} id 
     */
    const getEpidemiologia = async (idosoId) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                
                const collection = db.collection(collectionName);

                collection.findOne({ idosoId: ObjectId(idosoId), _isDeleted: false, tipo: 'Primeiro Atendimento' }, { sort: { timestamp: -1 }, projection: { _id: 0, 'raw.S08': 1 } }, function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        console.log('epidemiologia', result);
                        if(result) {
                            resolve( Object.keys(result).length === 0 ? null : result.raw );
                        } else {
                            resolve( null);
                        }
                    }
                });
            });

        });

        return promise;
    }

    /**
     * Encontra as últimas escalas preenchida de um idoso
     * @param {*} id 
     */
    const getEscalas = async (idosoId) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                
                const collection = db.collection(collectionName);

                collection.findOne({ idosoId: ObjectId(idosoId), _isDeleted: false, atendeu: true }, { sort: { timestamp: -1 }, projection: { _id: 0, 'escalas': 1, 'timestamp': 1 } }, function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve( result ? { ...result.escalas, timestamp: result.timestamp } : null );
                    }
                });
            });

        });

        return promise;
    }

    /**
     * Conta a quantidade total de atendimentos (soma das ligações atendidas e não atendidas) de um idoso e também a quantidade de atendimentos efetuados.
     * @param {*} idosoId
     * @returns { atendimentosEfetuados: x, total: x }
     */
    const count = async (idosoId) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                
                const collection = db.collection(collectionName);

                collection.aggregate([
                    { $match: { "idosoId": ObjectId(idosoId), _isDeleted: false } },
                    {
                        $facet: {
                            "atendimentosEfetuados" : [ 
                                {
                                    $match: { "atendeu": true },
                                },
                                {
                                    $count: "count"
                                }
                            ],
                            "total" : [ 
                                {
                                    $count: "count"
                                }
                            ],
                        }
                    },
                    { $unwind: { path: "$atendimentosEfetuados", preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: "$total", preserveNullAndEmptyArrays: true } },
                ]).toArray(function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        // console.log(result ? { atendimentosEfetuados: result[0].atendimentosEfetuados.count, total: result[0].total.count } : null);
                        // TODO VERIFICAR O QUE ACONTECE QUANDO O ARRAY ESTÁ VAZIO
                        console.log(result)
                        const stats = {};
                        if(result.length > 0) {
                            stats.qtdAtendimentosEfetuados = result[0].atendimentosEfetuados ? result[0].atendimentosEfetuados.count : 0;
                            stats.qtdTotal = result[0].total ? result[0].total.count : 0;
                        }
                        resolve(stats);
                    }
                });
            });
        });

        return promise;
    }

    const findAllByIdoso = async (idosoId) => {

        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                const collection = db.collection(collectionName);
      
                collection.aggregate([
                    { $match: { _isDeleted: false, idosoId: ObjectId(idosoId)} },
                    { $sort : { timestamp : -1 } },
                    // { $skip : rowsPerPage * page },
                    // { $limit : rowsPerPage },
                ]).toArray(function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        // console.log(result);
                        // resolve({
                        //     data : result,
                        //     info: {
                        //         totalRows: result.length,
                        //         currentPage: page,
                        //         rowsPerPage: rowsPerPage
                        //     }
                        // });
                        resolve(result);
                    }
                });
            });
    
        });
    
        return promise;
    }

module.exports = { insertOne, findById, getEpidemiologia, getEscalas, count, findAllByIdoso};