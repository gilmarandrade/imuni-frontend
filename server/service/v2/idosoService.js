
module.exports = app => {
    const ObjectId = require('mongodb').ObjectID;
    const dbName = process.env.MONGO_DB_NAME;
    const collectionName = 'idosos';

    /**
     * Insere ou atualiza um idoso
     * @param {*} idoso 
     */
    const upsertOne = async (idoso) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                const collection = db.collection(collectionName);

                collection.updateOne({ _id: ObjectId(idoso._id) }, {
                    $set: { 
                        nome: idoso.nome,
                        dataNascimento: idoso.dataNascimento,
                        telefone1: idoso.telefone1,
                        telefone2: idoso.telefone2,
                        agenteSaude: idoso.agenteSaude,
                        anotacoes: idoso.anotacoes,
                        unidadeId: ObjectId(idoso.unidadeId),
                        vigilanteId: idoso.vigilanteId ? ObjectId(idoso.vigilanteId) : null,
                        row: idoso.row,
                        _isDeleted: idoso._isDeleted,
                    }
                }, { upsert: true }, function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(result.upsertedId === null ? idoso._id : result.upsertedId._id);
                    }
                });
            });

        });

        return promise;
    }

    /**
     * Lista todos os idosos ativos de uma unidade // esse nome confunde. 
     * @param {*} unidadeId 
     */
    const findAtivosByUnidadeId = async (unidadeId) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                
                const collection = db.collection(collectionName);

                collection.find({ _isDeleted: false, unidadeId: ObjectId(unidadeId) }, { projection: { epidemiologia: 0 } }).toArray(function(err, result) {
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
     * Encontra um idoso pelo id
     * @param {*} id 
     */
    const getById = async (id) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                
                const collection = db.collection(collectionName);

                collection.findOne({ _id: ObjectId(id) }, function(err, result) {
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
     * Exclusão lógica de registro
     * 
     * Seta _isDeleted para true
     * @param {*} id
     */
    const softDeleteOne = async (id) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                const collection = db.collection(collectionName);

                collection.updateOne({ _id: ObjectId(id) }, {
                    $set: {
                        _isDeleted: true
                    }
                }, function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(id);
                    }
                });
            });

        });

        return promise;
    }


    // /**
    //  * Insere ou atualiza a Epidemiologia de um idoso
    //  * @param {*} epidemiologia 
    //  */
    // const upsertEpidemiologia = async (idIdoso, epidemiologia) => {
    //     const promise = new Promise( (resolve, reject) => {
    //         var MongoClient = require( 'mongodb' ).MongoClient;
    //         MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
    //             if(err) return reject(err);
    //             const db = client.db(dbName);
    //             const collection = db.collection(collectionName);

    //             collection.updateOne({ _id: ObjectId(idIdoso) }, {
    //                 $set: { 
    //                     epidemiologia
    //                 }
    //             }, { upsert: true }, function(err, result) {
    //                 if(err) {
    //                     reject(err);
    //                 } else {
    //                     resolve(result.upsertedId === null ? idIdoso : result.upsertedId._id);
    //                 }
    //             });
    //         });

    //     });

    //     return promise;
    // }

    /**
     * Insere ou atualiza as Estatisticas de um idoso
     * @param {*} epidemiologia 
     */
    const upsertEstatisticas = async (idIdoso, estatisticas) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                const collection = db.collection(collectionName);

                collection.updateOne({ _id: ObjectId(idIdoso) }, {
                    $set: { 
                        estatisticas
                    }
                }, { upsert: true }, function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(result.upsertedId === null ? idIdoso : result.upsertedId._id);
                    }
                });
            });

        });

        return promise;
    }

    const findAllByUser = async (unidadeId, usuarioId, filter, sort, page, rowsPerPage) => {
        console.log(unidadeId, usuarioId, filter, sort, page, rowsPerPage)

        const user = await app.server.service.v2.usuarioService.findById(usuarioId);
        // console.log('find all by user')
        if(user) {
            // console.log(user)
            switch(user.role) {
                case 'VIGILANTE':
                    // console.log('role vigilante')
                    //return findAllByVigilante(collectionPrefix, user.name, filter, sort, page, rowsPerPage);
                case 'PRECEPTOR':
                    return findAll(unidadeId, filter, sort, page, rowsPerPage);
                case 'ADMINISTRADOR':
                    console.log('eita...')//TODO?
                    return [];
                default:
                    console.log('opa...')//TODO?
                    return [];
            }
        }
        return [];
    }

    const findAll = async (unidadeId, filter, sort, page, rowsPerPage) => {

        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                const idososCollection = db.collection(collectionName);
      
                // TODO criar uma View com essa collection?
                idososCollection.aggregate([
                    {
                        $lookup:
                        {
                            from: 'atendimentosForm',
                            localField: '_id',
                            foreignField: 'idosoId',
                            as: 'atendimentos'
                        }
                    },
                    { $match: { unidadeId: ObjectId(unidadeId) } },
                    {
                        $facet : {
                            "data" : [
                                // querySort,
                                { $skip : rowsPerPage * page },
                                { $limit : rowsPerPage },
                            ],
                            "info": [
                                { $unwind: { path: "$atendimentos", preserveNullAndEmptyArrays: true } },
                                { $group: { _id: { _id: '$_id', atendido: '$atendimentos.atendeu'}, atendidos: { $sum: 1 } } },
                                { 
                                    $addFields: {
                                        currentPage: page,
                                        rowsPerPage: rowsPerPage,
                                    }
                                }
                            ]
                        }
                    },
                ]).toArray(function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        // console.log(result);
                        resolve(result);
                        // resolve(result[0]);
                    }
                });
            });
    
        });
    
        return promise;
    }

    return { upsertOne, findAtivosByUnidadeId, getById, softDeleteOne, upsertEstatisticas, findAllByUser };
}