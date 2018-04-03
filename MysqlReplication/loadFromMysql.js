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
 */


var PersistenceSpecs = require ("./persistenceSpecs");
var HandleBinlogEvents = require ("./handleBinlogEvents");
var mysql = require('mysql');
var stream = require('stream');

function LoadFromMysql (mysqlDsn) {
    this.mysqlDsn = mysqlDsn;
}

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
 * loadFromMysql  - selects data from a MySQL database and persists it to
 * a MongoDB collections. The name of the schema, table and columns to be
 * extracted as well as the target MongoDB collection name are specified
 * in a specification object (see module persistenceSpecs).
 * 
 * connection - open MySQL connection (source)
 * spec       - persistence specification for one table to be copied
 * db         - open MongoDB connection (destination)
 * i          - counter variable needed for loadMysqlFromSpecArray()
 * done       - function called when all rows are copied.
 * 
 */
   
    
function loadMysqlFromSpec(connection, spec, db, i, done) {
    connection.query(mysqlSelectFromSpec(spec))
            .stream()
            .pipe(stream.Transform({
                objectMode: true,
                transform: function (row, encoding, callback) {
                    var dwData = HandleBinlogEvents.formatDWAttr(row);
                    var rsData = HandleBinlogEvents.formatResultAttr(row);

                    var collection = db.collection(spec.mongoCollectionName);
                    collection.insert(dwData, {w: 1}, function (err, result) {
                        var rsCollection = db.collection('result-' + spec.mongoCollectionName);
                        rsCollection.insert(rsData, {w: 1}, function (err, result) {
                            callback();
                        });
//                  console.log(data);
                    });
                }
            })
                    .on('finish', function () {
                        if (!(done === undefined))
                            done();
                    }));
}


/*
 * loadFromMysqlArray  - selects data from a MySQL database and persists it to
 * a MongoDB collections. The name of the schemas, tables and columns to be
 * extracted as well as the target MongoDB collection names are specified
 * in an array of specification objects (see module persistenceSpecs).
 * 
 * connection - open MySQL connection (source)
 * specArray  - array of persistence specifications
 * db         - open MongoDB connection (destination)
 * done       - function called when all tables are copied.
 * 
 */

function loadMysqlFromSpecArray(connection, specArray, db, done) {
    if (specArray.length > 0) {
        var loop = function (connection, specArray, db, i, done) {
            loadMysqlFromSpec(connection, specArray[i], db, i, function () {
                if (++i < specArray.length) {
                    setTimeout(function () {
                        loop(connection, specArray, db, i, done);
                    }, 0);
                } else {
                    done();
                }
            });
        };
        loop(connection, specArray, db, 0, done);
    } else {
        done();
    }
}


module.exports = LoadFromMysql;
module.exports.mysqlSelectFromSpec = mysqlSelectFromSpec;
module.exports.loadMysqlFromSpec = loadMysqlFromSpec;
module.exports.loadMysqlFromSpecArray = loadMysqlFromSpecArray;