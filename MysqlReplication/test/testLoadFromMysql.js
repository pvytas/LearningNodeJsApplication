/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 */

/* 
 * Mocha based tests for persistenceSpecs module.
 */

var assert = require("assert");
var PersistenceSpecs = require ('../persistenceSpecs');
var LoadFromMysql = require ('../loadFromMysql');

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
    },
    
    {
        schemaName: 'test_schema',
        tableName: 'test_table2',
        mongoCollectionName: 'MC-test-table2',
        primaryKey: 'id',
        columns: [
            'id',
            'column3',
            'column4'     
        ]
    }
];

var expected_select0 = 'SELECT `id`, `column1`, `column2` FROM `test_schema`.`test_table1`;';
var expected_select1 = 'SELECT `id`, `column3`, `column4` FROM `test_schema`.`test_table2`;';


describe('test loadFromMysql', function () {

    it('test mysqlSelectFromSpec()', function () {
        var output = LoadFromMysql.mysqlSelectFromSpec (testSpecs[0]);
        assert.equal (output, expected_select0, 'Expecting: '+expected_select0);
        
        output = LoadFromMysql.mysqlSelectFromSpec (testSpecs[1]);
        assert.equal (output, expected_select1, 'Expecting: '+expected_select1);
    });
});


var mysqlDsn = {
  host: '10.0.1.11',
  port: '3307',
  user: 'bitnobi',
  password: 'bitnobi',
  database: 'db_mediportal'
};


