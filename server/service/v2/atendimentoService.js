module.exports = app => {

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
                        // console.log(result)
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

    const convertAtendimento = async (atendimento) => {
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
            // await app.server.service.v2.idosoService.upsertEpidemiologia(atendimento.idosoId, atendimento.raw['S08']);
            
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
            const epidemiologiaRaw = await app.server.service.v2.atendimentoService.getEpidemiologia(atendimento.idosoId);
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
    
        await app.server.service.v2.atendimentoService.insertOne(atendimento);
        
        // TODO atualizar idoso com estatisticas
        const estatisticas = {
            // qtdAtendimentosEfetuados: null,
            // qtdTotal: null,
            ultimoAtendimento: {
                timestamp: atendimento.timestamp,
                efetuado: atendimento.atendeu,
            },
            // ultimaEscala: {
            //     timestamp: null,
            //     scoreOrdenacao: null,
            //     vulnerabilidade: null,
            //     epidemiologica: null,
            //     riscoContagio: null,
            //     dataProximoAtendimento: null,
            // },
        };
        estatisticas.ultimaEscala = await app.server.service.v2.atendimentoService.getEscalas(atendimento.idosoId);
        estatisticas.count = await app.server.service.v2.atendimentoService.count(atendimento.idosoId);
        // console.log(estatisticas)
        await app.server.service.v2.idosoService.upsertEstatisticas(atendimento.idosoId, estatisticas);
 
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



   return { insertOne, findById, getEpidemiologia, getEscalas, count, findAllByIdoso, convertAtendimento, deleteImportedByUnidade };
}