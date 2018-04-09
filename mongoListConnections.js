/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 * Each line should be prefixed with  * 
 */


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


// Connect to the db
MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, db) {
    if (err) {
        return console.dir(err);
    }

    db.listCollections().toArray(function (err, collections) {
        var test = collections;
        collections.forEach(function (value) {
            var item = value;
            console.log('value=', JSON.stringify(value));
        });

        console.log('checking for MC-test-table1');

        collectionExists(db, 'MC-test-table1')
                .then(function (exists) {
                    console.log('exists=', exists);
                    db.close();

                });


//        db.listCollections({name: "MC-test-table1"}).toArray(function (err, items) {
//            if (err) {
//                console.log('err=', err);
//            } else {
//                console.log('items.length=%s', items.length);
//            }
//            


    });

});


   
