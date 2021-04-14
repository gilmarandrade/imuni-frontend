
module.exports = app => {
    const ObjectId = require('mongodb').ObjectID;
    const dbName = process.env.MONGO_DB_NAME;
    const collectionName = 'idosos';
    const MongoClient = require( 'mongodb' ).MongoClient;

    /**
     * Insere ou atualiza um idoso
     * @param {*} idoso 
     */
    const upsertOne = async (idoso) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const updateDoc = {
                    $set: { 
                        nome: idoso.nome.toLowerCase(),
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
                };

                const options = { upsert: true };

                const result = await collection.updateOne({ _id: ObjectId(idoso._id) }, updateDoc, options);

                if( result.upsertedId) {
                    idoso._id = result.upsertedId._id;
                }
                return idoso;

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();
        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const collection = db.collection(collectionName);

        //         collection.updateOne({ _id: ObjectId(idoso._id) }, {
        //             $set: { 
        //                 nome: idoso.nome,
        //                 dataNascimento: idoso.dataNascimento,
        //                 telefone1: idoso.telefone1,
        //                 telefone2: idoso.telefone2,
        //                 agenteSaude: idoso.agenteSaude,
        //                 anotacoes: idoso.anotacoes,
        //                 unidadeId: ObjectId(idoso.unidadeId),
        //                 vigilanteId: idoso.vigilanteId ? ObjectId(idoso.vigilanteId) : null,
        //                 row: idoso.row,
        //                 _isDeleted: idoso._isDeleted,
        //             }
        //         }, { upsert: true }, function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 if( result.upsertedId) {
        //                     idoso._id = result.upsertedId._id;
        //                 }
        //                 resolve(idoso);
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    /**
     * Lista todos os idosos ativos de uma unidade // esse nome confunde. 
     * @param {*} unidadeId 
     */
    const findAtivosByUnidadeId = async (unidadeId) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const query = { _isDeleted: false, unidadeId: ObjectId(unidadeId) };
                const options = { projection: { epidemiologia: 0 } };

                return await collection.find(query, options).toArray();

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();
        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //         collection.find({ _isDeleted: false, unidadeId: ObjectId(unidadeId) }, { projection: { epidemiologia: 0 } }).toArray(function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(result);
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    /**
     * Encontra um idoso pelo id
     * @param {*} id 
     */
    const getById = async (id) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                return await collection.findOne({ _id: ObjectId(id) });

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //         collection.findOne({ _id: ObjectId(id) }, function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(result);
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    /**
     * Encontra idosos pelo nome dele e id da unidade ao qual pertence
     * @param {*} id 
     */
    const getByNome = async (nome, unidadeId) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                return await collection.find({ nome: nome.toLowerCase(), unidadeId: ObjectId(unidadeId), _isDeleted: false  }).toArray();

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //         collection.find({ nome: nome, unidadeId: ObjectId(unidadeId), _isDeleted: false  }).toArray(function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(result);
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    /**
     * Conta quantos idosos a unidade possui
     * @param {*} id 
     */
    const countByUnidade = async (unidadeId) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                return await collection.count({ unidadeId: ObjectId(unidadeId), _isDeleted: false  });

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //         collection.count({ unidadeId: ObjectId(unidadeId), _isDeleted: false  }, function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(result);
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    /**
     * Exclusão lógica de registro
     * 
     * Seta _isDeleted para true
     * @param {*} id
     */
    const softDeleteOne = async (id) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                await collection.updateOne({ _id: ObjectId(id) }, {
                    $set: {
                        _isDeleted: true
                    }
                });

                return id;

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const collection = db.collection(collectionName);

        //         collection.updateOne({ _id: ObjectId(id) }, {
        //             $set: {
        //                 _isDeleted: true
        //             }
        //         }, function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(id);
        //             }
        //         });
        //     });

        // });

        return promise;
    }


    /**
     * Insere ou atualiza a Epidemiologia de um idoso
     * @param {*} epidemiologia 
     */
    const upsertEpidemiologia = async (idIdoso, epidemiologia) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);


                const result = await collection.updateOne({ _id: ObjectId(idIdoso) }, {
                    $set: { 
                        epidemiologia
                    }
                }, { upsert: true });

                if(result) {
                    return result.upsertedId === null ? idIdoso : result.upsertedId._id;
                }

                return null;

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const collection = db.collection(collectionName);

        //         collection.updateOne({ _id: ObjectId(idIdoso) }, {
        //             $set: { 
        //                 epidemiologia
        //             }
        //         }, { upsert: true }, function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(result.upsertedId === null ? idIdoso : result.upsertedId._id);
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    /**
     * Insere ou atualiza as Estatisticas de um idoso
     * @param {*}  
     */
    const upsertEstatisticas = async (idIdoso, estatisticas) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);


                const result = await collection.updateOne({ _id: ObjectId(idIdoso) }, {
                    $set: { 
                        estatisticas
                    }
                }, { upsert: true });

                if(result) {
                   return result.upsertedId === null ? idIdoso : result.upsertedId._id;
                }

                return null;

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();
        // // console.log('upsertEstatisticas ', idIdoso, estatisticas)
        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const collection = db.collection(collectionName);

        //         collection.updateOne({ _id: ObjectId(idIdoso) }, {
        //             $set: { 
        //                 estatisticas
        //             }
        //         }, { upsert: true }, function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(result.upsertedId === null ? idIdoso : result.upsertedId._id);
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    const bulkUpdateEstatisticas = async (idososArray) => {

        const addToBatch = (batch, item) => {
            batch.find({ _id: ObjectId(item._id) }).updateOne({
                $set: { 
                    estatisticas: item.estatisticas,
                }
            });
        };

        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                // Initialize the unordered Batch
                const batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});
                for(let i = 0; i < idososArray.length; i++) {
                    // console.log(idososArray[i], ' update estatisticas')
                    addToBatch(batch, idososArray[i]);
                };

                    
                // Execute the operations
                const result = await batch.execute();
                return result ? result.ok : null; 

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();

        // // console.log(idosoAtendimento);
        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const collection = db.collection(collectionName);
    
        //         // Initialize the unordered Batch
        //         const batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});
        //         for(let i = 0; i < idososArray.length; i++) {
        //             // console.log(idososArray[i], ' update estatisticas')
        //             addToBatch(batch, idososArray[i]);
        //         };
    
        //         // Execute the operations
        //         batch.execute(function(err, result) {
        //             // console.log(result)
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(result.ok);
        //             }
        //         });
        //     });
    
        // });
    
        // return promise;
    }

    const findAllByUser = async (unidadeId, usuarioId, filter, sort, page, rowsPerPage) => {
        console.log(unidadeId, usuarioId, filter, sort, page, rowsPerPage)

        const user = await app.server.service.v2.usuarioService.findById(usuarioId);
        // console.log('find all by user')
        if(user) {
            // console.log(user)
            switch(user.role) {
                case 'VIGILANTE':
                    console.log('role vigilante')
                    return findAllByVigilante(unidadeId, user._id, filter, sort, page, rowsPerPage);
                case 'PRECEPTOR':
                    return findAll(unidadeId, filter, sort, page, rowsPerPage);
                    case 'ADMINISTRADOR':
                    return findAll(unidadeId, filter, sort, page, rowsPerPage);
                default:
                    console.log('opa...')//TODO?
                    return [];
            }
        }
        return [];
    }

    const findAllByVigilante = async (unidadeId, userId, filter, sort, page, rowsPerPage) => {

        let match;
        // TODO VERIFICAR SE ESSES FILTROS FUNCIONAM NOS CASOS VAZIOS
        switch(filter) {
            case 'com-escalas':
                match = { $match: { _isDeleted: false, unidadeId: ObjectId(unidadeId), vigilanteId: ObjectId(userId), 'estatisticas.qtdAtendimentosEfetuados': { $gt : 0 } } }; //apenas idosos com escalas
                break;
            case 'sem-escalas':
                match = { $match: { _isDeleted: false, unidadeId: ObjectId(unidadeId), vigilanteId: ObjectId(userId), $or: [ { 'estatisticas.qtdAtendimentosEfetuados': { $exists: false }}, {'estatisticas.qtdAtendimentosEfetuados': { $lte : 0 }} ]}  }; //apenas idosos sem escalas
                break;
            case 'all':
            default:
                match = { $match: { _isDeleted: false, unidadeId: ObjectId(unidadeId), vigilanteId: ObjectId(userId)} }; //todos
                break;
        }

        let querySort;
        switch(sort) {
            case 'score':
                querySort = { $sort : { 'estatisticas.ultimaEscala.escalas.scoreOrdenacao': -1, nome: 1 } };//ultima escala descendente
            break;
            case 'ultimo-atendimento':
                querySort = { $sort: { 'estatisticas.ultimoAtendimento.timestamp': -1, nome: 1 } };//ultimo atendimento (tentativa) des
                break;
            case 'proximo-atendimento':
                querySort = { $sort: { 'estatisticas.ultimaEscala.escalas.dataProximoAtendimento': -1, nome: 1 } };//sugestão proximo atendimento desc
                break;
            case 'nome':
            default:
                querySort = { $sort : { nome: 1 } };//nome asc 
        }

        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const result = await collection.aggregate([
                    // match,
                    // querySort,
                    // { $skip : rowsPerPage * page },
                    // { $limit : rowsPerPage },

                    match,
                    {
                        $facet : {
                            "data" : [
                                querySort,
                                { $skip : rowsPerPage * page },
                                { $limit : rowsPerPage },
                            ],
                            "info": [
                                { $group: { _id: null, totalRows: { $sum: 1 } } },
                                // { $unwind: { path: "$atendimentos", preserveNullAndEmptyArrays: true } },
                                // { $group: { _id: { _id: '$_id', atendido: '$atendimentos.atendeu'}, atendidos: { $sum: 1 } } },
                                { 
                                    $addFields: {
                                        currentPage: page,
                                        rowsPerPage: rowsPerPage,
                                    }
                                }
                            ]
                        }
                    },
                    { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } },
                ], { collation: { locale: "pt" } }).toArray();

                return result.length ? result[0] : [];


            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const idososCollection = db.collection(collectionName);
      
        //         // TODO verificar se esses filtros funcionam
        //         let querySort;
        //         switch(sort) {
        //             case 'score':
        //                 querySort = { $sort : { 'estatisticas.ultimaEscala.escalas.scoreOrdenacao': -1, nome: 1 } };//ultima escala descendente
        //             break;
        //             case 'ultimo-atendimento':
        //                 querySort = { $sort: { 'estatisticas.ultimoAtendimento.timestamp': -1, nome: 1 } };//ultimo atendimento (tentativa) des
        //                 break;
        //             case 'proximo-atendimento':
        //                 querySort = { $sort: { 'estatisticas.ultimaEscala.escalas.dataProximoAtendimento': -1, nome: 1 } };//sugestão proximo atendimento desc
        //                 break;
        //             case 'nome':
        //             default:
        //                 querySort = { $sort : { nome: 1 } };//nome asc 
        //         }

        //         idososCollection.aggregate([
        //             // match,
        //             // querySort,
        //             // { $skip : rowsPerPage * page },
        //             // { $limit : rowsPerPage },

        //             match,
        //             {
        //                 $facet : {
        //                     "data" : [
        //                         querySort,
        //                         { $skip : rowsPerPage * page },
        //                         { $limit : rowsPerPage },
        //                     ],
        //                     "info": [
        //                         { $group: { _id: null, totalRows: { $sum: 1 } } },
        //                         // { $unwind: { path: "$atendimentos", preserveNullAndEmptyArrays: true } },
        //                         // { $group: { _id: { _id: '$_id', atendido: '$atendimentos.atendeu'}, atendidos: { $sum: 1 } } },
        //                         { 
        //                             $addFields: {
        //                                 currentPage: page,
        //                                 rowsPerPage: rowsPerPage,
        //                             }
        //                         }
        //                     ]
        //                 }
        //             },
        //             { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } },
        //         ]).toArray(function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 // console.log(result.length);

        //                 // resolve({
        //                 //     data : result,
        //                 //     info: {
        //                 //         totalRows: result.length,
        //                 //         currentPage: page,
        //                 //         rowsPerPage: rowsPerPage
        //                 //     }
        //                 // });
        //                 resolve(result[0]);
        //             }
        //         });
        //     });
    
        // });
    
        // return promise;
    }

    const countByVigilante = async (unidadeId, userId, filter) => {

        let match;
        // TODO VERIFICAR SE ESSES FILTROS FUNCIONAM NOS CASOS VAZIOS
        switch(filter) {
            case 'com-escalas':
                match = { $match: { _isDeleted: false, unidadeId: ObjectId(unidadeId), vigilanteId: ObjectId(userId), 'estatisticas.qtdAtendimentosEfetuados': { $gt : 0 } } }; //apenas idosos com escalas
                break;
            case 'sem-escalas':
                match = { $match: { _isDeleted: false, unidadeId: ObjectId(unidadeId), vigilanteId: ObjectId(userId), $or: [ { 'estatisticas.qtdAtendimentosEfetuados': { $exists: false }}, {'estatisticas.qtdAtendimentosEfetuados': { $lte : 0 }} ]}  }; //apenas idosos sem escalas
                break;
            case 'all':
            default:
                match = { $match: { _isDeleted: false, unidadeId: ObjectId(unidadeId), vigilanteId: ObjectId(userId)} }; //todos
                break;
        }

        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const result = await collection.aggregate([
                    match,
                    { $count: "total" },
                    // { $group: { _id: null, totalRows: { $sum: 1 } } },
                         
                ]).toArray();

                return result[0];

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const idososCollection = db.collection(collectionName);
      
        //         idososCollection.aggregate([
        //             match,
        //             { $count: "total" },
        //             // { $group: { _id: null, totalRows: { $sum: 1 } } },
                         
        //         ]).toArray(function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 // console.log(result.length);
        //                 resolve(result[0]);
        //             }
        //         });
        //     });
    
        // });
    
        // return promise;
    }

    const findAll = async (unidadeId, filter, sort, page, rowsPerPage) => {

        let match;
        // TODO VERIFICAR SE ESSES FILTROS FUNCIONAM NOS CASOS VAZIOS
        switch(filter) {
            case 'com-escalas':
                match = { $match: { _isDeleted: false, unidadeId: ObjectId(unidadeId), 'estatisticas.qtdAtendimentosEfetuados': { $gt : 0 } } }; //apenas idosos com escalas
                break;
            case 'sem-escalas':
                match = { $match: { _isDeleted: false, unidadeId: ObjectId(unidadeId), $or: [ { 'estatisticas.qtdAtendimentosEfetuados': { $exists: false }}, {'estatisticas.qtdAtendimentosEfetuados': { $lte : 0 }} ]}  }; //apenas idosos sem escalas
                break;
            case 'all':
            default:
                match = { $match: { _isDeleted: false, unidadeId: ObjectId(unidadeId)} }; //todos
                break;
        }

        let querySort;
        switch(sort) {
            case 'score':
                querySort = { $sort : { 'estatisticas.ultimaEscala.escalas.scoreOrdenacao': -1, nome: 1 } };//ultima escala descendente
            break;
            case 'ultimo-atendimento':
                querySort = { $sort: { 'estatisticas.ultimoAtendimento.timestamp': -1, nome: 1 } };//ultimo atendimento (tentativa) des
                break;
            case 'proximo-atendimento':
                querySort = { $sort: { 'estatisticas.ultimaEscala.escalas.dataProximoAtendimento': -1, nome: 1 } };//sugestão proximo atendimento desc
                break;
            case 'nome':
            default:
                querySort = { $sort : { nome: 1 } };//nome asc 
        }

        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const result = await collection.aggregate([
                    // match,
                    // querySort,
                    // { $skip : rowsPerPage * page },
                    // { $limit : rowsPerPage },

                    match,
                    {
                        $facet : {
                            "data" : [
                                querySort,
                                { $skip : rowsPerPage * page },
                                { $limit : rowsPerPage },
                            ],
                            "info": [
                                { $group: { _id: null, totalRows: { $sum: 1 } } },
                                // { $unwind: { path: "$atendimentos", preserveNullAndEmptyArrays: true } },
                                // { $group: { _id: { _id: '$_id', atendido: '$atendimentos.atendeu'}, atendidos: { $sum: 1 } } },
                                { 
                                    $addFields: {
                                        currentPage: page,
                                        rowsPerPage: rowsPerPage,
                                    }
                                }
                            ]
                        }
                    },
                    { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } },
                ], { collation: { locale: "pt" } }).toArray();

                return result[0];


            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();

        // // TODO resolver bug da paginação
        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const idososCollection = db.collection(collectionName);
      
        //         let querySort;
        //         switch(sort) {
        //             case 'score':
        //                 querySort = { $sort : { 'estatisticas.ultimaEscala.escalas.scoreOrdenacao': -1, nome: 1 } };//ultima escala descendente
        //             break;
        //             case 'ultimo-atendimento':
        //                 querySort = { $sort: { 'estatisticas.ultimoAtendimento.timestamp': -1, nome: 1 } };//ultimo atendimento (tentativa) des
        //                 break;
        //             case 'proximo-atendimento':
        //                 querySort = { $sort: { 'estatisticas.ultimaEscala.escalas.dataProximoAtendimento': -1, nome: 1 } };//sugestão proximo atendimento desc
        //                 break;
        //             case 'nome':
        //             default:
        //                 querySort = { $sort : { nome: 1 } };//nome asc 
        //         }

        //         idososCollection.aggregate([
        //             // match,
        //             // querySort,
        //             // { $skip : rowsPerPage * page },
        //             // { $limit : rowsPerPage },

        //             match,
        //             {
        //                 $facet : {
        //                     "data" : [
        //                         querySort,
        //                         { $skip : rowsPerPage * page },
        //                         { $limit : rowsPerPage },
        //                     ],
        //                     "info": [
        //                         { $group: { _id: null, totalRows: { $sum: 1 } } },
        //                         // { $unwind: { path: "$atendimentos", preserveNullAndEmptyArrays: true } },
        //                         // { $group: { _id: { _id: '$_id', atendido: '$atendimentos.atendeu'}, atendidos: { $sum: 1 } } },
        //                         { 
        //                             $addFields: {
        //                                 currentPage: page,
        //                                 rowsPerPage: rowsPerPage,
        //                             }
        //                         }
        //                     ]
        //                 }
        //             },
        //             { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } },
        //         ]).toArray(function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 // console.log(result[0]);
        //                 // resolve({
        //                 //     data : result,
        //                 //     info: {
        //                 //         totalRows: result.length,
        //                 //         currentPage: page,
        //                 //         rowsPerPage: rowsPerPage
        //                 //     }
        //                 // });
        //                 resolve(result[0]);
        //             }
        //         });
        //     });
    
        // });
    
        // return promise;
    }

    /**
     * Atualiza em lote os idosos da unidade
     * 
     * Considera iguais idosos com mesmo nome & telefones. Pois podem haver idosos diferentes com nomes identicos, por isso usa o telefone para identificá-los
     * @param {*} idososArray 
     */
    const bulkUpdateOne = async (idososArray) => {

        const addToBatch = (batch, item) => {
            batch.find({ nome: item.nome.toLowerCase(), telefone1: item.telefone1, telefone2: item.telefone2, unidadeId: ObjectId(item.unidadeId) }).upsert().updateOne({
                $set: { 
                    // row: item.row,
                    dataNascimento: item.dataNascimento,
                    nome: item.nome.toLowerCase(),
                    telefone1: item.telefone1,
                    telefone2: item.telefone2,
                    agenteSaude: item.agenteSaude,
                    anotacoes: item.anotacoes,
                    unidadeId: ObjectId(item.unidadeId),
                    vigilanteId: ObjectId(item.vigilanteId),
                    _isDeleted: item._isDeleted,
                    // stats: item.stats,
                    // score: item.score,
                    // epidemiologia: item.epidemiologia,
                }
            });
        };

        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                // Initialize the unordered Batch
                const batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});
                for(let i = 0; i < idososArray.length; i++) {
                    addToBatch(batch, idososArray[i]);
                };

                const result = batch.execute();

                return result ? result.ok : null;

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();

        // console.log(idosoAtendimento);
        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const collection = db.collection(collectionName);
    
        //         // Initialize the unordered Batch
        //         const batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});
        //         for(let i = 0; i < idososArray.length; i++) {
        //             addToBatch(batch, idososArray[i]);
        //         };
    
        //         // Execute the operations
        //         batch.execute(function(err, result) {
        //             // console.log(result)
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(result.ok);
        //             }
        //         });
        //     });
    
        // });
    
        // return promise;
    }

    /**
     * Transfere todos os idosos de um vigilante para outro
     * @param {*} idVigilanteFrom de
     * @param {*} idVigilanteTo para
     */
    const transferirIdosos = async (idVigilanteFrom, idVigilanteTo) => {
        console.log('transferirIdosos ', idVigilanteFrom, idVigilanteTo)

        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const result = await collection.updateMany({ vigilanteId: ObjectId(idVigilanteFrom) }, {
                    $set: { 
                        vigilanteId: ObjectId(idVigilanteTo)
                    }
                });

                return result ? result.modifiedCount : 0;

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const collection = db.collection(collectionName);

        //         collection.updateMany({ vigilanteId: ObjectId(idVigilanteFrom) }, {
        //             $set: { 
        //                 vigilanteId: ObjectId(idVigilanteTo)
        //             }
        //         }, function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 console.log(result.modifiedCount)
        //                 // resolve(result.upsertedId === null ? idIdoso : result.upsertedId._id);
        //                 resolve(result.modifiedCount);
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    const findWithVigilantes = async (unidadeId) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const result = await collection.aggregate([
                    { $match: { _isDeleted: false, unidadeId: ObjectId(unidadeId)} },
                    { $sort : { nome: 1 } },
                    {
                        $lookup: {
                            from: "usuarios",
                            localField: "vigilanteId",
                            foreignField: "_id",
                            as: "vigilanteNome",
                        }
                    },
                ]).toArray();

                return result;

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                 
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const idososCollection = db.collection(collectionName);

        //         idososCollection.aggregate([
        //             { $match: { _isDeleted: false, unidadeId: ObjectId(unidadeId)} },
        //             { $sort : { nome: 1 } },
        //             {
        //                 $lookup: {
        //                     from: "usuarios",
        //                     localField: "vigilanteId",
        //                     foreignField: "_id",
        //                     as: "vigilanteNome",
        //                 }
        //             },
        //         ]).toArray(function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(result);
        //             }
        //         });
        //     });
    
        // });
    
        // return promise;
    }

    return { upsertOne, findAtivosByUnidadeId, getById, softDeleteOne, upsertEstatisticas, bulkUpdateEstatisticas, findAllByUser, countByVigilante, bulkUpdateOne, getByNome, upsertEpidemiologia, transferirIdosos, countByUnidade, findWithVigilantes };
}