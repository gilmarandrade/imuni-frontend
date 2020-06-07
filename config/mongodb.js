const { mongoUris } = require('./environment');

// var MongoClient = require( 'mongodb' ).MongoClient;
var _db;
module.exports = function(callback) {
    var MongoClient = require( 'mongodb' ).MongoClient;
    MongoClient.connect( 'mongodb://localhost:27017', function( err, client ) {
        const db = client.db('planilhas');
        const collection = db.collection('documents');
        // Insert some documents
        collection.insertMany([
          {a : 'simmm'}, {a : 'merda'}, {a : 'funcionou?'}
        ], function(err, result) {
          console.log("Inserted 3 documents into the collection");
          client.close();
        });
      } );
};