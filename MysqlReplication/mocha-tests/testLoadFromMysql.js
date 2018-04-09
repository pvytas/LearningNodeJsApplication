/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 */

/* 
 * Mocha based tests for loadFromMysql module.
 */

var assert = require("assert");
var Q = require('q');
var PersistenceSpecs = require ('../persistenceSpecs');
var testConfig = require('./testConfig');
var MongoClient = require('mongodb').MongoClient;
var db = {};
var LoadFromMysql = require ('../loadFromMysql');
var _ = require('lodash');


function collectionExists(mongoDb, collectionName, done) {
    var deferred = Q.defer();
    mongoDb.listCollections({name: collectionName}).toArray(function (err, items) {
        if (items.length > 0) {
            deferred.resolve(true);
        }
        deferred.resolve(false);
    });

    return deferred.promise;
}



describe('test loadFromMysql', function () {

// before running these tests, open a MongoDB connection.
    before(function (done) {
        MongoClient.connect(testConfig.mongoUrl, function (err, new_db) {
            if (err) {
                return console.dir(err);
            }

            db = new_db;
            done();
        });
    });


    var testSpecs = [
        {
            schemaName: 'test_schema',
            tableName: 'test_table1',
            mongoCollectionName: 'MC-test-table1',
            primaryKey: 'id',
            columns: [
                'id',
                'column1',
                'column2'
            ]
        }, {
            schemaName: 'test_schema',
            tableName: 'test_table2',
            mongoCollectionName: 'MC-test-table2',
            primaryKey: 'id',
            columns: [
                'id',
                'column3',
                'column4'
            ]
        }];

    var expected_select0 = 'SELECT `id`, `column1`, `column2` FROM `test_schema`.`test_table1`;';
    var expected_select1 = 'SELECT `id`, `column3`, `column4` FROM `test_schema`.`test_table2`;';

    it('test mysqlSelectFromSpec()', function () {
        var output = LoadFromMysql.mysqlSelectFromSpec(testSpecs[0]);
        assert.equal(output, expected_select0, 'Expecting: ' + expected_select0);

        output = LoadFromMysql.mysqlSelectFromSpec(testSpecs[1]);
        assert.equal(output, expected_select1, 'Expecting: ' + expected_select1);
    });


    it('test dropMongoCollection()', function (done) {
        // create collections for 'MC-test-table1' and 'result-MC-test-table1'
        var dwName = testSpecs[0].mongoCollectionName;
        var rwName = 'result-' + dwName;
        var dwCollection = db.collection(dwName);
        var rsCollection = db.collection(rwName);

        dwCollection.insert({dwcolumn1: 'test'}, {w: 1})
                .then(function (err, result) {
                    return rsCollection.insert({rscolumn1: 'test'}, {w: 1});
                })
                .then(function (err, result) {
                    return LoadFromMysql.dropMongoCollection(testSpecs[0], db);
                })
                .then(function () {
                    return collectionExists(db, dwName);
                })
                .then(function (exists) {
                    assert.equal(exists, false, 'Expecting MC-test-table1 to be dropped.');
                    return collectionExists(db, rwName);
                })
                .then(function (exists) {
                    assert.equal(exists, false, 'Expecting result-MC-test-table1 to be dropped.');
                    done();
                })
                .catch(function (err) {
                    console.log(err);
                    done();
                });
    });


    //After all tests are finished close the MongoDB connection.
    after(function (done) {
        db.close();
        done();
    });
});
