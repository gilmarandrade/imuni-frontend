const { mongoUris } = require('../config/environment');
const ObjectId = require('mongodb').ObjectID;
const dbName = 'covidrn_planilha';
const collectionName = 'idosos';

const findAll = async (collectionPrefix) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

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


const deleteAll = async (collectionPrefix) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

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

const insertAll = async (collectionPrefix, array) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

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

const replaceOne = async (collectionPrefix, idosoAtendimento) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            collection.replaceOne({ nomeLower: idosoAtendimento.nomeLower }, idosoAtendimento, { upsert: true }, function(err, result) {
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


const updateOne = async (collectionPrefix, idosoAtendimento) => {
    // console.log(idosoAtendimento);
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            //o upsert deveria passar somente os campos que deveriam ser atualizados?
            collection.updateOne({ nomeLower: idosoAtendimento.nomeLower }, {
                $set: { 
                    row: idosoAtendimento.row,
                    nome: idosoAtendimento.nome,
                    dataNascimento: idosoAtendimento.dataNascimento,
                    telefone1: idosoAtendimento.telefone1,
                    telefone2: idosoAtendimento.telefone2,
                    agenteSaude: idosoAtendimento.agenteSaude,
                    vigilante: idosoAtendimento.vigilante,
                    stats: idosoAtendimento.stats,
                    score: idosoAtendimento.score,
                    epidemiologia: idosoAtendimento.epidemiologia,
                }
            }, { upsert: true }, function(err, result) {
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

const findAllByVigilante = async (collectionPrefix, nomeVigilante) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            collection.find({ vigilante: nomeVigilante }).sort({"score":-1}).toArray(function(err, result) {
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

const findByNome = async (collectionPrefix, nomeLower) => {
    const promise = new Promise( (resolve, reject) => {
        var MongoClient = require( 'mongodb' ).MongoClient;
        MongoClient.connect( mongoUris, { useUnifiedTopology: false }, function( err, client ) {
            if(err) return reject(err);
            const db = client.db(dbName);
            
            const collection = db.collection(`${collectionPrefix}.${collectionName}`);

            collection.findOne({ nomeLower: nomeLower }, function(err, result) {
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

module.exports = { findAll, deleteAll, insertAll, findAllByVigilante, replaceOne, updateOne, findByNome };