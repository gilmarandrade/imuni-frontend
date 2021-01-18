
module.exports = app => {
    const ObjectId = require('mongodb').ObjectID;
    const dbName = process.env.MONGO_DB_NAME;
    const collectionName = 'anotacoes';

    /**
     * Insere uma anotação para um idoso
     * @param {*}  
     */
    const insertOne = async (anotacao) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                const collection = db.collection(collectionName);

                anotacao.idosoId = ObjectId(anotacao.idosoId);
                anotacao.usuarioId = ObjectId(anotacao.usuarioId);

                collection.insertOne(anotacao , function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve('Anotação inserida com sucesso');
                    }
                });
            });

        });

        return promise;
    }

    /**
     * Lista todas as anotações de um idoso. 
     * @param {*} idosoId 
     */
    const findByIdoso = async (idosoId) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                
                const collection = db.collection(collectionName);

                collection.find({ _isDeleted: false, idosoId: ObjectId(idosoId) }).sort({timestamp: -1}).toArray(function(err, result) {
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

    return { insertOne, findByIdoso }
}