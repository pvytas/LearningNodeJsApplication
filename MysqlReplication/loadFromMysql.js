/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 */


var PersistenceSpecs = require ("./persistenceSpecs");
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
 * formatMysqlRow - takes one row of result set from mysql and formats
 * it for persistance to MongoDB.
 */
function formatMysqlRow (row) {
    var output = { data: {} };

    Object.keys(row).forEach(function(name) {
         output.data[name] = row[name];
    });

    output.startDate = new Date();
    output.endDate = PersistenceSpecs.getSurrogateHighDate();

    return (output);    
}


function loadMysqlFromSpec(connection, spec, db, cb) {
    connection.query(mysqlSelectFromSpec(spec))
            .stream()
            .pipe(stream.Transform({
                objectMode: true,
                transform: function (row, encoding, callback) {
                    var data = formatMysqlRow(row);
                    var collection = db.collection(spec.mongoCollectionName);
                    collection.insert(data, {w: 1}, function (err, result) {
                        callback();
                    });
//                  console.log(data);
                }
            })
                    .on('finish', function () {
                        if (!(cb === undefined))
                            cb();
                    }));
}




module.exports = LoadFromMysql;
module.exports.mysqlSelectFromSpec = mysqlSelectFromSpec;
module.exports.formatMysqlRow = formatMysqlRow;
module.exports.loadMysqlFromSpec = loadMysqlFromSpec;