/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 */

/*
 * loadFromMysql  - selects data from a MySQL database and persists it to
 * a MongoDB collections. The name of the schema, table and columns to be
 * extracted as well as the target MongoDB collection name are specified
 * in a specification object (see module persistenceSpecs).
 * 
 * Main entrypoint: loadFromMysqlMany()
 * 
 */


var PersistenceSpecs = require ("./persistenceSpecs");
var HandleBinlogEvents = require ("./handleBinlogEvents");
var mysql = require('mysql');
var stream = require('stream');
var Q = require("q");


/*
 * mysqlSelectFromSpec - builds a select statement to retrieve the
 * columns described in the spec. The expected spec format is:
 * 
 *  {
 *       schemaName: 'test_schema',
 *       tableName: 'test_table1',
 *       mongoCollectionName: 'MC-test-table1',
 *       primaryKey: 'id',
 *       columns: [
 *           'id',
 *           'column1',
 *           'column2'     
 *       ]
 *   }
 * 
 */

function mysqlSelectFromSpec (spec) {
    var output = 'SELECT ';
    
    spec.columns.forEach(function (name) {
        output += '`' + name + '`, ';
    });
    
    //remove the last comma.
    output = output.slice(0, -2);
    
    output += ' FROM `' + spec.schemaName + '`.`' + spec.tableName + '`;';
    
    return output;
}

/*
 * collectionExists - tests if a MongoDB collections exists.
 * 
 * Returns a promise that resolves to true if collection exists, false
 * if it does not.
 * 
 * @param {type} mongoDb
 * @param {type} collectionName
 * @returns {.Q@call;defer.promise}
 */

function collectionExists(mongoDb, collectionName) {
    var deferred = Q.defer();
    mongoDb.listCollections({name: collectionName}).toArray(function (err, items) {
        if (items.length > 0) {
            deferred.resolve(true);
        };
        deferred.resolve(false);
    });

    return deferred.promise;
}


function dropCollectionIfExists(mongoDb, collectionName) {
    var deferred = Q.defer();
    mongoDb.listCollections({name: collectionName}).toArray(function (err, items) {
        if (items.length > 0) {
            var collection = mongoDb.collection(collectionName);
            collection.drop(function (err, delOK) {
                if (err) {
                    deferred.reject(err);
                }
                deferred.resolve(true);
            });
        }
        deferred.resolve(false);
    });
    return deferred.promise;
}
                
/*
 * dropMongoCollectionsFromSpec  - drops the MongDB collection named in the
 * spec along with associated result-xxx collection.
 * 
 * This function is called before calling loadFromMysql to remove any
 * extraneous data from the collections prior to loading new data.
 * 
 * spec       - persistence specification for one table to be copied
 * mongoDb         - open MongoDB connection (destination)
 * 
 * returns a promise 
 */
function dropMongoCollectionsFromSpec(mongoDb, spec) {
    var deferred = Q.defer();

    dropCollectionIfExists(mongoDb, spec.mongoCollectionName)
            .then(function () {
                return dropCollectionIfExists(mongoDb, 'result-' + spec.mongoCollectionName);
            }).then(function () {
                deferred.resolve();
    });

    return deferred.promise;
}


/*
 * loadFromMysql  - selects data from a MySQL database and persists it to
 * a MongoDB collections. The name of the schema, table and columns to be
 * extracted as well as the target MongoDB collection name are specified
 * in a specification object (see module persistenceSpecs).
 * 
 * connection - open MySQL connection (source)
 * spec       - persistence specification for one table to be copied
 * mongoDb         - open MongoDB connection (destination)
 * 
 * returns a promise
 * done       - function called when all rows are copied.
 * 
 */
   
    
function loadFromMysql(connection, spec, mongoDb) {
    var deferred = Q.defer();

    connection.query(mysqlSelectFromSpec(spec))
            .stream()
            .pipe(stream.Transform({
                objectMode: true,
                transform: function (row, encoding, callback) {
                    var dwData = HandleBinlogEvents.formatDWAttr(row);
                    var rsData = HandleBinlogEvents.formatResultAttr(row);

                    var collection = mongoDb.collection(spec.mongoCollectionName);
                    collection.insert(dwData, {w: 1}, function (err, result) {
                        var rsCollection = mongoDb.collection('result-' + spec.mongoCollectionName);
                        rsCollection.insert(rsData, {w: 1}, function (err, result) {
                            callback();
                        });
//                  console.log(data);
                    });
                }
            })
                    .on('finish', function () {
                        deferred.resolve();
                    }));

    return deferred.promise;
}



/*
 * loadFromMysqlMany  - selects data from a MySQL database and persists it to
 * MongoDB collections. The name of the schemas, tables and columns to be
 * extracted as well as the target MongoDB collection names are specified
 * in an array of specification objects (see module persistenceSpecs).
 * 
 * connection - open MySQL connection (source)
 * specArray  - array of persistence specifications
 * mongoDb    - open MongoDB connection (destination)
 * 
 */

function loadFromMysqlMany(connection, specArray, mongoDb) {
    var deferred = Q.defer();

    var loop = function (index) {
        if (index >= specArray.length) {
            deferred.resolve();
        } else {
            var spec = specArray[index];

            dropMongoCollectionsFromSpec(mongoDb, spec)
                    .then(function () {
                        return loadFromMysql(connection, spec, mongoDb);
                    })
                    .then(function () {
                        loop(index + 1);
                    });
        }
    };

    loop(0); // Start!

    return deferred.promise;
}


module.exports.mysqlSelectFromSpec = mysqlSelectFromSpec;
module.exports.collectionExists = collectionExists;
module.exports.dropCollectionIfExists = dropCollectionIfExists;
module.exports.dropMongoCollectionsFromSpec = dropMongoCollectionsFromSpec;
module.exports.loadFromMysql = loadFromMysql;

// main entry point:
module.exports.loadFromMysqlMany = loadFromMysqlMany;

