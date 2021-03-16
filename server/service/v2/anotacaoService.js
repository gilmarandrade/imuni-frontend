
module.exports = app => {
    const ObjectId = require('mongodb').ObjectID;
    const dbName = process.env.MONGO_DB_NAME;
    const collectionName = 'anotacoes';
    const MongoClient = require( 'mongodb' ).MongoClient;

    /**
     * Insere uma anotação para um idoso
     * @param {*}  
     */
    const insertOne = async (anotacao) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
              // Connect the client to the server
              await client.connect();
              const db = await client.db(dbName);
              const collection = db.collection(collectionName);

              anotacao.idosoId = ObjectId(anotacao.idosoId);
              anotacao.usuarioId = ObjectId(anotacao.usuarioId);

              await collection.insertOne(anotacao);
              return 'Anotação inserida com sucesso';

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

        //         anotacao.idosoId = ObjectId(anotacao.idosoId);
        //         anotacao.usuarioId = ObjectId(anotacao.usuarioId);

        //         collection.insertOne(anotacao , function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve('Anotação inserida com sucesso');
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    /**
     * Lista todas as anotações de um idoso. 
     * @param {*} idosoId 
     */
    const findByIdoso = async (idosoId) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                return await collection.find({ _isDeleted: false, idosoId: ObjectId(idosoId) }).sort({timestamp: -1}).toArray();

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

        //         collection.find({ _isDeleted: false, idosoId: ObjectId(idosoId) }).sort({timestamp: -1}).toArray(function(err, result) {
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

    return { insertOne, findByIdoso }
}