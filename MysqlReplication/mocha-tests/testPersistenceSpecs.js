/* 
 * Mocha based tests for persistenceSpecs module.
 */

var assert = require("assert");
var PersistenceSpecs = require ('../persistenceSpecs');
var _ = require('lodash');

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

PersistenceSpecs.loadSpecs (testSpecs);


describe('test PersistenceSpecs', function () {

    it('test requireCurrentTable()', function () {
        var testSpec = new PersistenceSpecs ('test_schema', 'test_table2');
        assert(testSpec.requireCurrentTable(), 'Should require test_schema.test_table2');
        
        testSpec = new PersistenceSpecs ('test_schema', 'unknown_table');
        assert(!testSpec.requireCurrentTable(), 'Should not require \'test_schema.unknown_table\'');
        
        testSpec = new PersistenceSpecs ('unknown_schema', 'test_table2');
        assert(!testSpec.requireCurrentTable(), 'Should not require \'unknown_schema.test_table2\'');

    });

    it('test requireColumn()', function () {
        var testSpec = new PersistenceSpecs ('test_schema', 'test_table1');
        assert(testSpec.requireColumn('column1'), 'Should require column \'column1\'');
        assert(!testSpec.requireColumn('column3'), 'Should not require column \'column3\'');
    });

    it('test getMongoCollectionName()', function () {
        var testSpec = new PersistenceSpecs ('test_schema', 'test_table1');
        assert.equal(testSpec.getMongoCollectionName(), 'MC-test-table1', 'Expecting \'MC-test-table1\'');
        
        testSpec = new PersistenceSpecs ('test_schema', 'unknown_table');
        assert(!testSpec.getMongoCollectionName(), 'Should return false for \'test_schema.unknown_table\'');
       
        testSpec = new PersistenceSpecs ('unknown_schema', 'test_table2');
        assert(!testSpec.getMongoCollectionName(), 'Should return false for \'unknown_schema.test_table2\'');
    });


    it('test getPrimaryKey()', function () {
        var testSpec = new PersistenceSpecs ('test_schema', 'test_table1');
        assert.equal(testSpec.getPrimaryKey(), 'id', 'Expecting \'id\'');
        
        testSpec = new PersistenceSpecs ('test_schema', 'unknown_table');
        assert(!testSpec.getPrimaryKey(), 'Should return false for \'test_schema.unknown_table\'');
       
        testSpec = new PersistenceSpecs ('unknown_schema', 'test_table2');
        assert(!testSpec.getPrimaryKey(), 'Should return false for \'unknown_schema.test_table2\'');
    });


    it('test getMongoCollectionNameArray()', function () {
        var nameArray = PersistenceSpecs.getMongoCollectionNameArray();
        
        assert(_.isEqual(nameArray, ['MC-test-table1', 'MC-test-table2']), 
            'name array should match expected values.');
    });


});







