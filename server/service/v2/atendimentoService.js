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

                collection.findOne({ idosoId: ObjectId(idosoId), tipo: 'Primeiro Atendimento' }, { sort: { timestamp: -1 }, projection: { _id: 0, 'raw.S08': 1 } }, function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve( Object.keys(result).length === 0 ? null : result.raw );
                    }
                });
            });

        });

        return promise;
    }


module.exports = { insertOne, findById, getEpidemiologia };