// const { calcularEscalas } = require('../config/helpers');

//TODO usar configuração do banco
 
const ObjectId = require('mongodb').ObjectID;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = 'usuarios';

const findById = async (id) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.findOne({ _id: ObjectId(id), _isDeleted: false }, function(err, result) {
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
 * Encontra apenas os registros da collection que estão _isDeleted false
 */
const findByUnidade = async (unidadeId) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.find({ unidadeId: unidadeId, _isDeleted: false }, { projection: { password: 0 } }).toArray(function(err, result) {
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
 * Encontra apenas os registros da collection que estão _isDeleted false
 */
const findByEmail = async (email) => {//TODO VERIFICAR SE OS METODOS QUE RETORNAM USUARIOS ESTÃO TRAZENDO A SENHA (FALHA DE SEGURANÇA)
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.findOne({ email: email, _isDeleted: false }, function(err, result) {
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

/**
 * Encontra apenas os registros da collection que estão _isDeleted false
 */
const findAdministradores = async () => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.find({ role: 'ADMINISTRADOR', _isDeleted: false }, { projection: { password: 0 } }).toArray(function(err, result) {
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

const replaceOne = async (usuario) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
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

const validateResetToken = async (id, token) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.findOne({ _id: ObjectId(id), _isDeleted: false, resetPasswordToken: token,  resetPasswordExpires: { $gt: Date.now() } }, function(err, result) {
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


const validateInvitationToken = async (id, token) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(collectionName);

            collection.findOne({ _id: ObjectId(id), _isDeleted: false, invitationToken: token,  invitationExpires: { $gt: Date.now() } }, function(err, result) {
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


/**
 * Ativa ou inativa (bloqueia acesso) de um usuário
 * @param {*} idoso 
 */
const updateStatus = async (usuarioId, status) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            collection.updateOne({ _id: ObjectId(usuarioId) }, {
                $set: { 
                    status: status
                }
            }, function(err, result) {
                if(err) {
                    reject(err);
                } else {
                    resolve(usuarioId);
                }
            });
        });

    });

    return promise;
}

module.exports = { findById, findByUnidade, findByEmail, findAdministradores, insertOne, replaceOne, validateResetToken, validateInvitationToken, softDeleteOne, updateStatus };