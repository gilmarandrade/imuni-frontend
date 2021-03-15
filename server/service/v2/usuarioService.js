// const { calcularEscalas } = require('../config/helpers');

module.exports = app => {

    const ObjectId = require('mongodb').ObjectID;
    const dbName = process.env.MONGO_DB_NAME;
    const collectionName = 'usuarios';
    const MongoClient = require( 'mongodb' ).MongoClient;

    /**
     * 
     * @deprecated
     * @returns 
     */
    const checkStatus = async () => {
        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                return 'deu certo'

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);//{"name":"MongoNetworkError"}
                   
        //         resolve('deu certo');
        //     });

        // });

        // return promise;
    }
    
    // TODO presta atenção nas falhas de segurança
    const findById = async (id) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const result = await collection.findOne({ _id: ObjectId(id), _isDeleted: false });
                return result;

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //         collection.findOne({ _id: ObjectId(id), _isDeleted: false }, function(err, result) {
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

    /**
     * @deprecated
     * @param {*} nome 
     * @param {*} unidadeId 
     * @returns 
     */
    const findVigilanteByNome = async (nome, unidadeId) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                return await collection.findOne({ name: nome, role: 'VIGILANTE', unidadeId: ObjectId(unidadeId), _isDeleted: false });

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();
        
        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //     collection.findOne({ name: nome, role: 'VIGILANTE', unidadeId: ObjectId(unidadeId), _isDeleted: false }, function(err, result) {
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

    /**
     * Encontra apenas os registros da collection que estão status ATIVO e _isDeleted false
     */
    const findVigilantesAtivosByUnidade = async (unidadeId) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const query = { unidadeId: ObjectId(unidadeId), role: "VIGILANTE", status: "ATIVO", _isDeleted: false };
                const options = { projection: { password: 0 } };
                return await collection.find(query, options).toArray();

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //         collection.find(, { projection: { password: 0 } }).toArray(function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 console.log(unidadeId, result)
        //                 resolve(result);
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    /**
     * Encontra apenas os registros da collection que estão _isDeleted false
     */
    const findByUnidade = async (unidadeId) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const query = { unidadeId: ObjectId(unidadeId), _isDeleted: false };
                const options = { projection: { password: 0 } };

                return await collection.find(query, options).toArray();

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //         collection.find({ unidadeId: ObjectId(unidadeId), _isDeleted: false }, { projection: { password: 0 } }).toArray(function(err, result) {
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

    /**
     * Encontra apenas os registros da collection que estão _isDeleted false
     */
    const findByEmail = async (email) => {//TODO VERIFICAR SE OS METODOS QUE RETORNAM USUARIOS ESTÃO TRAZENDO A SENHA (FALHA DE SEGURANÇA)
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                return await collection.findOne({ email: email, _isDeleted: false });

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //         collection.findOne({ email: email, _isDeleted: false }, function(err, result) {
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


    const insertOne = async (usuario) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                if(usuario.unidadeId) usuario.unidadeId = ObjectId(usuario.unidadeId);

                const result = await collection.insertOne(usuario)

                return result ? result.insertedId : null;
 
            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const collection = db.collection(collectionName);

        //         if(usuario.unidadeId) usuario.unidadeId = ObjectId(usuario.unidadeId);
                
        //         collection.insertOne(usuario, function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(result.insertedId);
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    /**
     * Encontra apenas os registros da collection que estão _isDeleted false
     */
    const findAdministradores = async () => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                return await collection.find({ role: 'ADMINISTRADOR', _isDeleted: false }, { projection: { password: 0 } }).toArray();

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //         collection.find({ role: 'ADMINISTRADOR', _isDeleted: false }, { projection: { password: 0 } }).toArray(function(err, result) {
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

    /**
     * Encontra apenas os adminstradores não bloqueados
     */
    const findAdministradoresAtivos = async () => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                return await collection.find({ role: 'ADMINISTRADOR', status: 'ATIVO', _isDeleted: false }, { projection: { password: 0 } }).toArray();

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();


        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //         collection.find({ role: 'ADMINISTRADOR', status: 'ATIVO', _isDeleted: false }, { projection: { password: 0 } }).toArray(function(err, result) {
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

    const replaceOne = async (usuario) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                if(usuario.unidadeId) usuario.unidadeId = ObjectId(usuario.unidadeId);

                return await collection.replaceOne({ _id : ObjectId(usuario._id) }, usuario)

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const collection = db.collection(collectionName);

        //         if(usuario.unidadeId) usuario.unidadeId = ObjectId(usuario.unidadeId);

        //         collection.replaceOne({ _id : ObjectId(usuario._id) } , usuario, function(err, result) {
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

    const validateResetToken = async (id, token) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const query = { _id: ObjectId(id), _isDeleted: false, resetPasswordToken: token,  resetPasswordExpires: { $gt: Date.now() } };

                return await collection.findOne(query);

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //         collection.findOne({ _id: ObjectId(id), _isDeleted: false, resetPasswordToken: token,  resetPasswordExpires: { $gt: Date.now() } }, function(err, result) {
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


    const validateInvitationToken = async (id, token) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const query = { _id: ObjectId(id), _isDeleted: false, invitationToken: token,  invitationExpires: { $gt: Date.now() } };
                return await collection.findOne(query);

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
                
        //         const collection = db.collection(collectionName);

        //         collection.findOne({ _id: ObjectId(id), _isDeleted: false, invitationToken: token,  invitationExpires: { $gt: Date.now() } }, function(err, result) {
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


    /**
     * Exclusão lógica de registro
     * 
     * Seta _isDeleted para true
     * @param {*} id
     */
    const softDeleteOne = async (id) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const result = await collection.updateOne({ _id: ObjectId(id) }, {
                    $set: {
                        _isDeleted: true
                    }
                });

                return id;

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const collection = db.collection(collectionName);

        //         collection.updateOne({ _id: ObjectId(id) }, {
        //             $set: {
        //                 _isDeleted: true
        //             }
        //         }, function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(id);
        //             }
        //         });
        //     });

        // });

        // return promise;
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
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const result = await collection.updateOne({ _id: ObjectId(usuarioId) }, {
                    $set: { 
                        status: status
                    }
                });

                return usuarioId;

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();
        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const collection = db.collection(collectionName);

        //         collection.updateOne({ _id: ObjectId(usuarioId) }, {
        //             $set: { 
        //                 status: status
        //             }
        //         }, function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(usuarioId);
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    /** 
     * Atualiza o e-mail do usuário
     * @param {*}  
     */
    const updateEmail = async (usuarioId, email) => {
        // Create a new MongoClient
        const client = new MongoClient(process.env.MONGO_URIS);

        async function run() {
            try {
                // Connect the client to the server
                await client.connect();
                const db = await client.db(dbName);
                const collection = db.collection(collectionName);

                const result = await collection.updateOne({ _id: ObjectId(usuarioId) }, {
                    $set: { 
                        email: email
                    }
                });

                return usuarioId;

            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
                console.log('conexão fechada')
            }
        }
        return run();

        // const promise = new Promise( (resolve, reject) => {
        //     var MongoClient = require( 'mongodb' ).MongoClient;
        //     MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
        //         if(err) return reject(err);
        //         const db = client.db(dbName);
        //         const collection = db.collection(collectionName);

        //         collection.updateOne({ _id: ObjectId(usuarioId) }, {
        //             $set: { 
        //                 email: email
        //             }
        //         }, function(err, result) {
        //             if(err) {
        //                 reject(err);
        //             } else {
        //                 resolve(usuarioId);
        //             }
        //         });
        //     });

        // });

        // return promise;
    }

    return { findById, findVigilanteByNome, findVigilantesAtivosByUnidade, findByUnidade, findByEmail, findAdministradores, findAdministradoresAtivos, insertOne, replaceOne, validateResetToken, validateInvitationToken, softDeleteOne, updateStatus, updateEmail, checkStatus };
}