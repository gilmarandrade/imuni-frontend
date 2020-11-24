// const { calcularEscalas } = require('../config/helpers');

//TODO usar configuração do banco
 
const ObjectId = require('mongodb').ObjectID;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = 'usuarios';

const findByUnidade = async (unidadeId) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.find({ unidadeId: unidadeId }, { projection: { password: 0 } }).toArray(function(err, result) {
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

const findByEmail = async (email) => {//TODO VERIFICAR SE OS METODOS QUE RETORNAM USUARIOS ESTÃO TRAZENDO A SENHA (FALHA DE SEGURANÇA)
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.findOne({ email: email }, function(err, result) {
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


const insertOne = async (usuario) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            collection.insertOne(usuario, function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    resolve(usuario._id);
                }
            });
        });

    });

    return promise;
}

module.exports = { findByUnidade, findByEmail, insertOne };