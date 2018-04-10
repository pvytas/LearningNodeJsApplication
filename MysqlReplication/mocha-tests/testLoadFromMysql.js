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


    it('test dropCollectionIfExists()', function (done) {
        // create collection for 'test-collection'
        var collectionName = 'test-collection';
        var collection = db.collection(collectionName);
        collection.insert({column1: 'test'}, {w: 1})
               .then(function (err, result) {
                    return LoadFromMysql.dropCollectionIfExists(db, collectionName);
                })
                .then(function () {
                    return LoadFromMysql.collectionExists(db, collectionName);
                })
                .then(function (exists) {
                    assert.equal(exists, false, 'Expecting test-collection to be dropped.');
                    return LoadFromMysql.dropCollectionIfExists(db, collectionName);
                })
                .then(function (exists) {
                    assert.equal(exists, false, 'Expecting no errors if test-collection dropped again.');
                    done();
                })
                .catch(function (err) {
                    console.log(err);
                    done();
                });
    });


    it('test dropMongoCollectionsFromSpec()', function (done) {
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
                    return LoadFromMysql.dropMongoCollectionsFromSpec(db, testSpecs[0]);
                })
                .then(function () {
                    return LoadFromMysql.collectionExists(db, dwName);
                })
                .then(function (exists) {
                    assert.equal(exists, false, 'Expecting MC-test-table1 to be dropped.');
                    return LoadFromMysql.collectionExists(db, rwName);
                })
                .then(function (exists) {
                    assert.equal(exists, false, 'Expecting result-MC-test-table1 to be dropped.');
                    done();
                })
                .catch(function (err) {
                    assert.fail(1, err, 'Did not expect an error.', "!");
                    done();
                });
    });


    //After all tests are finished close the MongoDB connection.
    after(function (done) {
        db.close();
        done();
    });
});
