// const { calcularEscalas } = require('../config/helpers');

//TODO usar configuração do banco
const { mongoUris } = require('../config/environment');
const ObjectId = require('mongodb').ObjectID;
const dbName = 'covidrn_planilha';
const collectionName = 'usuarios';

const findAll = async () => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
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

const deleteAll = async () => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.deleteMany({}, function(err, result) {
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

const insertAll = async (array) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            collection.insertMany(array, function(err, result) {
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

const replaceOne = async (usuario) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            collection.replaceOne({ _id : ObjectId(usuario._id) } , usuario, function(err, result) {
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
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            collection.insertOne(usuario, function(err, result) {
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


const findByEmail = async (email) => {//TODO VERIFICAR SE OS METODOS QUE RETORNAM USUARIOS ESTÃO TRAZENDO A SENHA (FALHA DE SEGURANÇA)
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
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

const findById = async (id) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
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

const findByUnidade = async (unidadeId) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
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

module.exports = {  findAll, deleteAll, insertAll, replaceOne, insertOne, findByEmail, findById, findByUnidade };