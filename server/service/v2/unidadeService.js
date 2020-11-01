const ObjectId = require('mongodb').ObjectID;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = 'unidades';

/**
 * Encontra todos os registros da collection, inclusive os que estão _isDeleted true
 */
const findAll = async () => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

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

const findAtivos = async () => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.find({ _isDeleted: false}).toArray(function(err, result) {
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


const updateOne = async (unidade) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            //TODO o upsert deveria passar somente os campos que deveriam ser atualizados?
            collection.updateOne({ _id: ObjectId(unidade._id) }, {
                $set: { 
                    nome: unidade.nome,
                    distrito: unidade.distrito,
                    _isDeleted: unidade._isDeleted,
                    /* TODO DEPRECATED ATTRIBUTES*/
                    planilhaIdosos: unidade.planilhaIdosos,
                    planilhaGerenciamento: unidade.planilhaGerenciamento,
                    fichaVigilancia: unidade.fichaVigilancia,
                    idPlanilhaIdosos: unidade.idPlanilhaIdosos,
                    idPlanilhaGerenciamento: unidade.idPlanilhaGerenciamento,
                    idFichaVigilancia: unidade.idFichaVigilancia,
                    collectionPrefix: unidade.collectionPrefix,
                    ativo: unidade.ativo,
                    autoSync: unidade.autoSync,
                    lastSyncDate: unidade.lastSyncDate,
                    vigilantes: unidade.vigilantes,
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

const bulkUpdateOne = async (array) => {

    const addToBatch = (batch, item) => {
        batch.find({ _id: ObjectId(item._id) }).upsert().updateOne({
            $set: { 
                nome: item.nome,
                distrito: item.distrito,
                _isDeleted: item._isDeleted,
                /* TODO DEPRECATED ATTRIBUTES*/
                planilhaIdosos: item.planilhaIdosos,
                planilhaGerenciamento: item.planilhaGerenciamento,
                fichaVigilancia: item.fichaVigilancia,
                idPlanilhaIdosos: item.idPlanilhaIdosos,
                idPlanilhaGerenciamento: item.idPlanilhaGerenciamento,
                idFichaVigilancia: item.idFichaVigilancia,
                collectionPrefix: item.collectionPrefix,
                ativo: item.ativo,
                autoSync: item.autoSync,
                lastSyncDate: item.lastSyncDate,
                vigilantes: item.vigilantes,
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
            for(let i = 0; i < array.length; i++) {
                addToBatch(batch, array[i]);
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



module.exports = { findAll, findAtivos, updateOne, bulkUpdateOne };