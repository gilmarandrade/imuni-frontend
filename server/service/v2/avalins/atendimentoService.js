module.exports = app => {

    const ObjectId = require('mongodb').ObjectID;
    const dbName = process.env.MONGO_DB_NAME;
    const collectionName = 'atendimentosAvalins';

    const insertOne = async (item) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                const collection = db.collection(collectionName);

                // item.idosoId = ObjectId(item.idosoId);
                // item.vigilanteId = ObjectId(item.vigilanteId);
                // item.unidadeId = ObjectId(item.unidadeId);

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

    return { insertOne }
}