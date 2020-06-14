// const { calcularEscalas } = require('../config/helpers');

//TODO usar configuração do banco
const { mongoUris } = require('../config/environment');
const ObjectId = require('mongodb').ObjectID;
const dbName = 'planilhas';
const collectionName = 'atendimentos';


const findAtendimentosByIdoso = async (idoso) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
            if (err) { reject(err); }

            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            collection.find({ "fichaVigilancia.dadosIniciais.nome" : idoso.nome }).sort({"fichaVigilancia.data":-1}).toArray(function(err, result) {
                if (err) 
                    reject(err);
                else
                    resolve(result);
            });
        });

    });

    return promise;
}

const findAll = async () => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
            if(err) reject(err);
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
        MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
            if(err) reject(err);
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
        MongoClient.connect( mongoUris, { useUnifiedTopology: true }, function( err, client ) {
            if(err) reject(err);
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


module.exports = {  findAll, deleteAll, insertAll, findAtendimentosByIdoso };