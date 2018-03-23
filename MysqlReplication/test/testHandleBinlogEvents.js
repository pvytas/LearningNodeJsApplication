/* 
 * Mocha based tests for handleBinlogEvents module.
 */

var assert = require("assert");
var PersistenceSpecs = require ('../persistenceSpecs');
var HandleBinlogEvents = require ('../handleBinlogEvents');


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

var tableMapEvent1 = {
    schemaName: 'test_schema',
    tableName: 'test_table1'
};

var writeRowsEvent1 = {
    rows: [
        {
            id: '1',
            column1: 'c2',
            column2: 'c3', 
            column3: 'c4',
            column4: 'c5'
        },
                {
            id: '2',
            column1: 'c6',
            column2: 'c7', 
            column3: 'c8',
            column4: 'c9'
        },
                {
            id: '3',
            column1: 'c10',
            column2: 'c11', 
            column3: 'c12',
            column4: 'c13'
        }
    ]
};

var expectedOutput1 = [ 
  { data: [ id: '1', column1: 'c2', column2: 'c3' ],
    endDate: new Date(9999, 5, 24, 11, 33, 30, 0) },

  { data: [ id: '2', column1: 'c6', column2: 'c7' ],
    endDate: new Date(9999, 5, 24, 11, 33, 30, 0)  },

  { data: [ id: '3', column1: 'c10', column2: 'c11' ],
    endDate: new Date(9999, 5, 24, 11, 33, 30, 0)  } ];


//describe('test HandleBinlogEvents', function () {
//
//    it('test writeRows()', function () {
//        var h  = new HandleBinlogEvents();
//        h.tableMap (tableMapEvent1);
//        
//        var output = h.writeRows(writeRowsEvent1);
//       
//        console.log (output);
//    });
//
//});


var h  = new HandleBinlogEvents();
h.tableMap (tableMapEvent1);

var output = h.writeRows(writeRowsEvent1);

console.log (output);

output.forEach(function(row) {
    delete row.startDate;
}

console.log (output);






