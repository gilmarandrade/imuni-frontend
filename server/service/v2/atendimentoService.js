const ObjectId = require('mongodb').ObjectID;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = 'atendimentosForm';

/**
 * Insere ou atualiza um item
 * @param {*} item 
 */
const upsertOne = async (item) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            collection.updateOne({ _id: ObjectId(item._id) }, {
                $set: item
            }, { upsert: true }, function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    resolve(result.upsertedId === null ? item._id : result.upsertedId._id);
                }
            });
        });

    });

    return promise;
}


module.exports = { upsertOne };