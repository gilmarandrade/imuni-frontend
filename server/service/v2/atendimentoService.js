module.exports = app => {

    const ObjectId = require('mongodb').ObjectID;
    const dbName = process.env.MONGO_DB_NAME;
    const collectionName = 'atendimentos';

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

            collection.findOne({ idosoId: ObjectId(idosoId), _isDeleted: false, tipo: 'Primeiro atendimento' }, { sort: { timestamp: -1 }, projection: { _id: 0, 'raw.S08': 1 } }, function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        // console.log('GET epidemiologia', result);
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
     * E retorna também as escalas do ultimo atendimento efetuado
     * @param {*} idosoId
     * @returns { atendimentosEfetuados: x, total: x }
     */
    const getEstatisticasByIdoso = async (idosoId) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                
                const collection = db.collection(collectionName);

                collection.aggregate([
                    { $match: { "idosoId": ObjectId(idosoId), _isDeleted: false } },
                    { $sort: { "timestamp" : -1 } },
                    {
                        $facet: {
                            "ultimoAtendimento": [
                                { $limit: 1 },
                                { $project: { "timestamp": 1, "atendeu": 1 } },
                            ],
                            "ultimaEscala": [
                                { $match: { "atendeu": true, } },
                                { $limit: 1 },
                                { $project: { "timestamp": 1, "escalas": 1 } },
                            ],
                            "atendimentosEfetuados" : [ 
                                { $match: { "atendeu": true }, },
                                { $count: "count" },
                            ],
                            "total" : [ 
                                { $count: "count" },
                            ],
                        }
                    },
                    { $unwind: { path: "$ultimoAtendimento", preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: "$ultimaEscala", preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: "$atendimentosEfetuados", preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: "$total", preserveNullAndEmptyArrays: true } },
                ]).toArray(function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        // console.log(result ? { atendimentosEfetuados: result[0].atendimentosEfetuados.count, total: result[0].total.count } : null);
                        // TODO VERIFICAR O QUE ACONTECE QUANDO O ARRAY ESTÁ VAZIO
                        const stats = {};
                        if(result.length > 0) {
                            stats.ultimoAtendimento = result[0].ultimoAtendimento ? result[0].ultimoAtendimento : null;
                            stats.ultimaEscala = result[0].ultimaEscala ? result[0].ultimaEscala : null;
                            stats.qtdAtendimentosEfetuados = result[0].atendimentosEfetuados ? result[0].atendimentosEfetuados.count : 0;
                            stats.qtdTotal = result[0].total ? result[0].total.count : 0;
                        }
                        // console.log('stat ',stats)
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

    // const findEstatisticasByUnidade = async (unidadeId, idosoId) => {

    //     const promise = new Promise( (resolve, reject) => {
    //         var MongoClient = require( 'mongodb' ).MongoClient;
    //         MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
    //             if(err) return reject(err);
    //             const db = client.db(dbName);
    //             const collection = db.collection(collectionName);
      
    //             collection.aggregate([
    //                 { $match: { unidadeId: ObjectId(unidadeId), idosoId: ObjectId(idosoId), _isDeleted: false, } },
    //                 { $sort: { timestamp : -1 } },
    //                 {
    //                     $facet: {
    //                         "ultimoAtendimento": [
    //                             { $match: { "atendeu": true, } },
    //                             { $limit: 1 },
    //                             { $project: { "timestamp": 1, "escalas": 1 } },
    //                         ],
    //                         "atendimentosEfetuados": [
    //                             { $match: { "atendeu": true } },
    //                             { $count: "count" },
    //                         ],
    //                         "total" : [ 
    //                             { $count: "count" },
    //                         ],
    //                     }
                        
    //                 }
    //                 // { $group: { _id: '$idosoId', totalRows: { $sum: 1 } } },

    //                 // { $skip : rowsPerPage * page },
    //                 // { $limit : rowsPerPage },
    //             ]).toArray(function(err, result) {
    //                 if(err) {
    //                     reject(err);
    //                 } else {
    //                     // console.log(result);
    //                     // resolve({
    //                     //     data : result,
    //                     //     info: {
    //                     //         totalRows: result.length,
    //                     //         currentPage: page,
    //                     //         rowsPerPage: rowsPerPage
    //                     //     }
    //                     // });
    //                     resolve(result);
    //                 }
    //             });
    //         });
    
    //     });
    
    //     return promise;
    // }

    /**
     * Insere um atendimento recebido através do google form
     */
    const insertFromGoogleForm = async (atendimento) => {
        const atendimentoConvertido = await convertAtendimento(atendimento, null);

        await app.server.service.v2.atendimentoService.insertOne(atendimentoConvertido);

        // const estatisticas = {
        //     ultimoAtendimento: {
        //         timestamp: atendimentoConvertido.timestamp,
        //         efetuado: atendimentoConvertido.atendeu,
        //     },
        // };
        // estatisticas.ultimaEscala = await app.server.service.v2.atendimentoService.getEscalas(atendimentoConvertido.idosoId);
        const estatisticas = await app.server.service.v2.atendimentoService.getEstatisticasByIdoso(atendimentoConvertido.idosoId);
        await app.server.service.v2.idosoService.upsertEstatisticas(atendimentoConvertido.idosoId, estatisticas);

        return atendimentoConvertido;
    }
    
    /**
     * Insere um atendimento importado a partir da planilha da unidade
     */
    const importFromPlanilhaUnidade = async (atendimento, epidemiologiaIdoso, nomeIdoso) => {
        const atendimentoConvertido = await convertAtendimento(atendimento, epidemiologiaIdoso, nomeIdoso);
        // console.log('atendimentoConvertido ', atendimentoConvertido.idosoId)
        return atendimentoConvertido;
    }

    const convertAtendimento = async (atendimento, epidemiologiaIdoso, nomeIdoso) => {
        atendimento.idosoId = app.server.service.v2.questionarioService.extractResponse('S01','Q01', atendimento.raw);
        atendimento.vigilanteId = app.server.service.v2.questionarioService.extractResponse('S01','Q02', atendimento.raw);
        atendimento.unidadeId = app.server.service.v2.questionarioService.extractResponse('S01','Q03', atendimento.raw);
        atendimento.atendeu = app.server.service.v2.questionarioService.isEquals('S02','Q01', atendimento.raw, 'Sim');
        atendimento.fonte = app.server.service.v2.questionarioService.extractResponse('S04','Q01', atendimento.raw);
        atendimento.tipo =  app.server.service.v2.questionarioService.extractResponse('S07','Q01', atendimento.raw);
        atendimento.idadeIdoso = app.server.service.v2.questionarioService.extractNumber('S03','Q01', atendimento.raw);
        atendimento.duracaoChamada = app.server.service.v2.questionarioService.extractResponse('S13','Q01', atendimento.raw);
        atendimento._isDeleted = false;
    
        const criterios = {
            atendeu: app.server.service.v2.questionarioService.isEquals('S02','Q01', atendimento.raw, 'Sim'),
            sintomasIdoso: {
                apresentaSintomasGripeCOVID: app.server.service.v2.questionarioService.extractRequiredList('S05','Q01', atendimento.raw).length > 0 ? true : false,
                sintomas: app.server.service.v2.questionarioService.extractRequiredList('S05','Q01', atendimento.raw),
                contatoComCasoConfirmado: app.server.service.v2.questionarioService.isEquals('S05','Q05', atendimento.raw, 'Sim'),
            },
            comorbidades: {
                apresentaCondicoesSaude: app.server.service.v2.questionarioService.extractRequiredList('S06','Q01', atendimento.raw).length > 0 ? true : false,
                medicacaoDiaria: {
                    deveTomar: app.server.service.v2.questionarioService.isEquals('S06','Q02', atendimento.raw, 'Sim'),
                    acessoMedicacao: app.server.service.v2.questionarioService.extractBoolean('S06','Q04', atendimento.raw, 'Sim, consigo adquirí-las', 'Não, meus medicamentos estão faltando'),
                }
            },
            domicilio: {
                viveSozinho: app.server.service.v2.questionarioService.isEquals('S09','Q01', atendimento.raw, 'Somente o idoso'),
                apresentaSintomasGripeCOVID: app.server.service.v2.questionarioService.extractRequiredList('S10','Q01', atendimento.raw).length > 0 ? true : false,
                habitosAcompanhantes: {
                    saiDeCasa: app.server.service.v2.questionarioService.isEquals('S11','Q01', atendimento.raw, 'Sim'),
                },
            },
            vulnerabilidades: {
                alimentar: app.server.service.v2.questionarioService.isEquals('S12','Q02', atendimento.raw, 'Sim'),
                financeira: app.server.service.v2.questionarioService.isEquals('S12','Q03', atendimento.raw, 'Sim'),
                violencia: app.server.service.v2.questionarioService.isEquals('S12','Q04', atendimento.raw, 'Sim'),
            },
        };
    
        // TODO trasnformar essas strings hardcoded em constantes
        if(atendimento.tipo == 'Primeiro atendimento') {
            // insere temporariamente a epidemiologia na collection do idoso
            await app.server.service.v2.idosoService.upsertEpidemiologia(atendimento.idosoId, { 'S08': atendimento.raw['S08']});
            // console.log(rest);
            
            criterios.epidemiologia = {
                isolamento: {
                    saiDeCasa: app.server.service.v2.questionarioService.isEquals('S08','Q02', atendimento.raw, 'Sim'),
                },
                visitas: {
                    recebeVisitas: app.server.service.v2.questionarioService.isNotEquals('S08','Q06', atendimento.raw, 'O idoso não recebe visitas'),
                },
            };
        } else {// acompanhamento
            // copia a epidemilogia do primeiro atendimento
            let epidemiologiaRaw = epidemiologiaIdoso;
            if(!epidemiologiaRaw) { // se não recebeu a epidemiologia como parametro, busca no primeiro atendimento do idoso
                epidemiologiaRaw = await app.server.service.v2.atendimentoService.getEpidemiologia(atendimento.idosoId);
            }
            // console.log('epidemiologiaRaw', epidemiologiaRaw)
            if(epidemiologiaRaw && epidemiologiaRaw['S08']) {
                atendimento.raw['S08'] = epidemiologiaRaw['S08'];
            }
    
            criterios.epidemiologia = {
                isolamento: {
                    saiDeCasa: app.server.service.v2.questionarioService.isEquals('S08','Q02', epidemiologiaRaw, 'Sim'),
                },
                visitas: {
                    recebeVisitas: app.server.service.v2.questionarioService.isNotEquals('S08','Q06', epidemiologiaRaw, 'O idoso não recebe visitas'),
                },
            };
        }
        
        // console.log(criterios);
        atendimento.criterios = criterios;
    
        atendimento.escalas = app.server.service.v2.escalaService.calcularEscalas(criterios, atendimento.timestamp);
    
        return atendimento;
    }


    /**
     * Deleta todos os atendimentos que foram importados através das planilhas de uma unidade
     * @param {*} unidadeId
     */
    const deleteImportedByUnidade = async (unidadeId) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                const collection = db.collection(collectionName);

                collection.deleteMany({ unidadeId: ObjectId(unidadeId), origin: 'IMPORTED' }, function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(result.deletedCount);
                    }
                });
            });

        });

        return promise;
    }

    const bulkUpdateOne = async (atendimentosArray) => {

        const addToBatch = (batch, item) => {
            batch.find({ _id: ObjectId(item._id) }).upsert().updateOne({
                $set: { 
                    origin: item.origin,
                    raw: item.raw,
                    authsecret: item.authsecret,
                    timestamp: item.timestamp,
                    responseId: item.responseId,
                    idosoId: ObjectId(item.idosoId),
                    vigilanteId: ObjectId(item.vigilanteId),
                    unidadeId: ObjectId(item.unidadeId),
                    atendeu: item.atendeu,
                    fonte: item.fonte,
                    tipo: item.tipo,
                    idadeIdoso: item.idadeIdoso,
                    duracaoChamada: item.duracaoChamada,
                    _isDeleted: item._isDeleted,
                    criterios: item.criterios,
                    escalas: item.escalas,
                }
            });
        };
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                const collection = db.collection(collectionName);
    
                // Initialize the unordered Batch
                const batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});
                for(let i = 0; i < atendimentosArray.length; i++) {
                    addToBatch(batch, atendimentosArray[i]);
                };
    
                // Execute the operations
                batch.execute(function(err, result) {
                    // console.log(result)
                    if(err) {
                        reject(err);
                    } else {
                        resolve(result.ok);
                    }
                });
            });
    
        });
    
        return promise;
    }



   return { insertOne, findById, getEpidemiologia, getEscalas, getEstatisticasByIdoso, findAllByIdoso, deleteImportedByUnidade, insertFromGoogleForm, importFromPlanilhaUnidade, bulkUpdateOne };
}