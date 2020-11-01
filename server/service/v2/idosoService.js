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
 * Lista todos os idosos de uma unidade
 * @param {*} unidadeId 
 */
const getByUnidadeId = async (unidadeId) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.find({ unidadeId: ObjectId(unidadeId) }).toArray(function(err, result) {
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

module.exports = { upsertOne, getByUnidadeId, getById };