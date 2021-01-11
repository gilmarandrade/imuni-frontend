const extractResponse = (session, question, fichaVigilancia) => {
    if(fichaVigilancia && session && question) {
        if(fichaVigilancia[session]) {
            if(fichaVigilancia[session][question] && fichaVigilancia[session][question].response !== null && fichaVigilancia[session][question].response !== undefined && fichaVigilancia[session][question].response !== '') {
                return fichaVigilancia[session][question].response;
            }
        }
    }
    return null;
};

const extractPontos = (session, question, fichaVigilancia) => {
    const response = extractResponse(session, question, fichaVigilancia);
    return response ? +(response.substring(2,3)) : 0;
}

const calculaEscalas = (criterios) => {
    const array = Object.values(criterios);
    let total = 0;
    array.forEach(element => {
        total += element;
    });

    let risco = null;

    if(total >= 41) {
        risco = riscoQueda.BAIXO;
    } else if(total >= 21) {
        risco = riscoQueda.MEDIO;
    } else {
        risco = riscoQueda.ELEVADO;
    }

    return { score: risco }
}

module.exports = app => {
    
    const riscoQueda = Object.freeze({
        BAIXO: 'Baixo',
        MEDIO: 'Médio',
        ELEVADO: 'Elevado',
    });

    const ObjectId = require('mongodb').ObjectID;
    const dbName = process.env.MONGO_DB_NAME;
    const collectionName = 'atendimentosAvalins';

    const insertOne = async (item) => {
        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                const collection = db.collection(collectionName);

                // item.idosoId = ObjectId(item.idosoId);
                // item.vigilanteId = ObjectId(item.vigilanteId);
                // item.unidadeId = ObjectId(item.unidadeId);

                collection.insertOne(item, function(err, result) {
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

    const findAll = async () => {

        const promise = new Promise( (resolve, reject) => {
            var MongoClient = require( 'mongodb' ).MongoClient;
            MongoClient.connect( process.env.MONGO_URIS, { useUnifiedTopology: false }, function( err, client ) {
                if(err) return reject(err);
                const db = client.db(dbName);
                const collection = db.collection(collectionName);
      
                collection.aggregate([
                    { $match: { _isDeleted: false} },
                    { $sort : { timestamp : -1 } },
                    // { $skip : rowsPerPage * page },
                    // { $limit : rowsPerPage },
                ]).toArray(function(err, result) {
                    if(err) {
                        reject(err);
                    } else {
                        // console.log(result);
                        // resolve({
                        //     data : result,
                        //     info: {
                        //         totalRows: result.length,
                        //         currentPage: page,
                        //         rowsPerPage: rowsPerPage
                        //     }
                        // });
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

    const convertAtendimento = async (atendimento) => {

        const criterios = {
            c1: extractPontos('S02','Q01', atendimento.raw),
            c2: extractPontos('S02','Q02', atendimento.raw),
            c3: extractPontos('S02','Q03', atendimento.raw),
            c4: extractPontos('S02','Q04', atendimento.raw),
            c5: extractPontos('S02','Q05', atendimento.raw),
            c6: extractPontos('S02','Q06', atendimento.raw),
            c7: extractPontos('S02','Q07', atendimento.raw),
            c8: extractPontos('S02','Q08', atendimento.raw),
            c9: extractPontos('S02','Q09', atendimento.raw),
            c10: extractPontos('S02','Q10', atendimento.raw),
            c11: extractPontos('S02','Q11', atendimento.raw),
            c12: extractPontos('S02','Q12', atendimento.raw),
            c13: extractPontos('S02','Q13', atendimento.raw),
            c14: extractPontos('S02','Q14', atendimento.raw),
        };

        atendimento.criterios = criterios;
        atendimento.escalas = calculaEscalas(atendimento.criterios);
        await app.server.service.v2.avalins.atendimentoService.insertOne(atendimento);

    }

    return { insertOne, findAll, findById, convertAtendimento }
}