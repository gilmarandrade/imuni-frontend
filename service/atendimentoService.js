// const { calcularEscalas } = require('../config/helpers');

//TODO usar configuração do banco
const { mongoUris } = require('../config/environment');
const ObjectId = require('mongodb').ObjectID;


/**
 * Lista todos os idosos
 */
const findIdosos = async () => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
            const db = client.db('planilhas');
            
            const idososCollection = db.collection('idosos');

            idososCollection.find().toArray(function(err, result) {
                // client.close();
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

const findAtendimentosByIdoso = async (idoso) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
            const db = client.db('planilhas');
            const atendimentosCollection = db.collection('atendimentos');

            atendimentosCollection.find({ "fichaVigilancia.dadosIniciais.nome" : idoso.nome }).sort({"fichaVigilancia.data":-1}).toArray(function(err, result) {
                client.close();
                if (err) 
                    reject(err);
                resolve(result);
            });
        });

    });

    return promise;
}

module.exports = { findIdosos, findAtendimentosByIdoso };