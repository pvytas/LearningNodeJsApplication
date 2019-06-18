

var Q = require('q');

var MongoClient = require('mongodb').MongoClient;


function collectionExists(mongoDb, collectionName) {
    var deferred = Q.defer();
    mongoDb.listCollections({name: collectionName}).toArray(function (err, items) {
        if (items.length > 0) {
            deferred.resolve(true);
        }
        deferred.resolve(false);
    });

    return deferred.promise;
}


// Connect to MongoDB

const mongoURL = 'mongodb://localhost';
const dbName = 'mean-dev';

const mongoClient = new MongoClient(mongoURL, {useNewUrlParser: true});

// Connect to the db
mongoClient.connect(function (err) {
    if (err) {
        return console.dir(err);
    }

    const db = mongoClient.db(dbName);

    db.listCollections().toArray(function (err, collections) {
        collections.forEach(function (value) {
            console.log('value=', JSON.stringify(value));
        });

        console.log('checking for MC-test-table1');

        collectionExists(db, 'MC-test-table1')
            .then(function (exists) {
                console.log('exists=', exists);
                mongoClient.close();
            });
    });
});


   
