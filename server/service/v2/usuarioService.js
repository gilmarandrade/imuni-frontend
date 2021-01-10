// const { calcularEscalas } = require('../config/helpers');

module.exports = app => {

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

    const findVigilanteByNome = async (nome, unidadeId) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                
                const collection = db.collection(collectionName);

            collection.findOne({ name: nome, role: 'VIGILANTE', unidadeId: ObjectId(unidadeId), _isDeleted: false }, function(err, result) {
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
     * Encontra apenas os registros da collection que estão status ATIVO e _isDeleted false
     */
    const findVigilantesAtivosByUnidade = async (unidadeId) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                
                const collection = db.collection(collectionName);

                collection.find({ unidadeId: unidadeId, role: "VIGILANTE", status: "ATIVO", _isDeleted: false }, { projection: { password: 0 } }).toArray(function(err, result) {
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

                collection.find({ unidadeId: ObjectId(unidadeId), _isDeleted: false }, { projection: { password: 0 } }).toArray(function(err, result) {
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

                if(usuario.unidadeId) usuario.unidadeId = ObjectId(usuario.unidadeId);
                
                collection.insertOne(usuario, function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(result.insertedId);
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

                if(usuario.unidadeId) usuario.unidadeId = ObjectId(usuario.unidadeId);

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
     * Altera status de um usuário
     * 
     * INCOMPLETO - o usuário existe como vigilante em algum atendimento sincronizado de uma planilha. Mas o ususário ainda não possui e-mail validado. É preciso que o administrador convide o usuário.
     * CONVIDADO - convite enviado, aguardando validação do e-mail
     * ATIVO - cesso liberado pelo administrador
     * INATIVO - acesso bloqueado pelo administrador
     * @param {*}  
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

    /** 
     * Atualiza o e-mail do usuário
     * @param {*}  
     */
    const updateEmail = async (usuarioId, email) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                const collection = db.collection(collectionName);

                collection.updateOne({ _id: ObjectId(usuarioId) }, {
                    $set: { 
                        email: email
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

    return { findById, findVigilanteByNome, findVigilantesAtivosByUnidade, findByUnidade, findByEmail, findAdministradores, insertOne, replaceOne, validateResetToken, validateInvitationToken, softDeleteOne, updateStatus, updateEmail };
}