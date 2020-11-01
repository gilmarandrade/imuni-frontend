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
                    _isDeleted: idoso._isDeleted,
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
 * Lista todos os idosos ativos de uma unidade
 * @param {*} unidadeId 
 */
const findAtivosByUnidadeId = async (unidadeId) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.find({ _isDeleted: false, unidadeId: ObjectId(unidadeId) }).toArray(function(err, result) {
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

/**
 * Exclusão lógica de registro
 * 
 * Seta _isDeleted para true
 * @param {*} id
 */
const softDeleteOne = async (id) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            collection.updateOne({ _id: ObjectId(id) }, {
                $set: {
                    _isDeleted: true
                }
            }, function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    resolve(id);
                }
            });
        });

    });

    return promise;
}

module.exports = { upsertOne, findAtivosByUnidadeId, getById, softDeleteOne };