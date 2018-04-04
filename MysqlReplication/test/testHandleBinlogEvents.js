/* 
 * Mocha based tests for handleBinlogEvents module.
 */

var assert = require("assert");
var PersistenceSpecs = require ('../persistenceSpecs');
var HandleBinlogEvents = require ('../handleBinlogEvents');
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

PersistenceSpecs.loadSpecs(testSpecs);

var tableMapEvent1 = {
    schemaName: 'test_schema',
    tableName: 'test_table1'
};

/*
 * simulates the structures of interest in the zongji WriteRows event.
 */
var writeRowsEvent1 = {
    rows: [
        {
            id: '1',
            column1: 'c2',
            column2: 'c3',
            column3: 'c4',
            column4: 'c5'
        }, {
            id: '2',
            column1: 'c6',
            column2: 'c7',
            column3: 'c8',
            column4: 'c9'
        }, {
            id: '3',
            column1: 'c10',
            column2: 'c11',
            column3: 'c12',
            column4: 'c13'
        }
    ]
};

var expectedFilteredOutput1 = [
    {id: '1', column1: 'c2', column2: 'c3'},
    {id: '2', column1: 'c6', column2: 'c7'},
    {id: '3', column1: 'c10', column2: 'c11'}
];



var expectedOutput1 = [
    {data: {id: '1', column1: 'c2', column2: 'c3'},
        startDate: new Date(2018, 3, 23),
        endDate: PersistenceSpecs.getSurrogateHighDate()},

    {data: {id: '2', column1: 'c6', column2: 'c7'},
        startDate: new Date(2018, 3, 23),
        endDate: PersistenceSpecs.getSurrogateHighDate()},

    {data: {id: '3', column1: 'c10', column2: 'c11'},
        startDate: new Date(2018, 3, 23),
        endDate: PersistenceSpecs.getSurrogateHighDate()}
];



var expectedResultFormat1 = [
    {'ownerId': 'MC',
        'dateAdded': new Date(2018, 3, 23),
        'data': {id: '1', column1: 'c2', column2: 'c3'},
        'sourceExportable': true,
        'exportable': true},

    {'ownerId': 'MC',
        'dateAdded': new Date(2018, 3, 23),
        'data': {id: '2', column1: 'c6', column2: 'c7'},
        'sourceExportable': true,
        'exportable': true},

    {'ownerId': 'MC',
        'dateAdded': new Date(2018, 3, 23),
        'data': {id: '3', column1: 'c10', column2: 'c11'},
        'sourceExportable': true,
        'exportable': true}
];



var tableMapEvent2 = {
    schemaName: 'test_schema',
    tableName: 'test_table1'
};


/*
 * simulates the structures of interest in the zongji UpdateRows event.
 */
var updateRowsEvent2 = {
    rows: [
        {
            before:
                    {
                        id: '1',
                        column1: 'c2',
                        column2: 'c3',
                        column3: 'c4',
                        column4: 'c5'
                    },
            after:
                    {
                        id: '1',
                        column1: 'updated',
                        column2: 'c3',
                        column3: 'c4',
                        column4: 'c5'
                    }
        }, {
            before:
                    {
                        id: '2',
                        column1: 'c6',
                        column2: 'c7',
                        column3: 'c8',
                        column4: 'c9'
                    },
            after:
                    {
                        id: '2',
                        column1: 'c6',
                        column2: 'c7',
                        column3: 'updated',
                        column4: 'c9'
                    }
        }, {
            before:
                    {
                        id: '3',
                        column1: 'c10',
                        column2: 'c11',
                        column3: 'c12',
                        column4: 'c13'
                    },
            after:
                    {
                        id: '3',
                        column1: 'c10',
                        column2: 'updated',
                        column3: 'c12',
                        column4: 'c13'
                    }
        }
    ]
};

var expectedFilteredOutput2 = [
    {id: '1', column1: 'updated', column2: 'c3'},
//  should not generate row if no columns of interest have changed.
//  { id: '2', column1: 'c6', column2: 'c7' }},
    {id: '3', column1: 'c10', column2: 'updated'}
];


var tableMapEvent3 = {
    schemaName: 'test_schema',
    tableName: 'test_table1'
};

/*
 * simulates the structures of interest in the zongji UpdateRows event.
 */
var updateRowsEvent3 = {
    rows: [
        {
            before:
                    {
                        id: '2',
                        column1: 'c6',
                        column2: 'c7',
                        column3: 'c8',
                        column4: 'c9'
                    },
            after:
                    {
                        id: '2',
                        column1: 'c6',
                        column2: 'c7',
                        column3: 'updated',
                        column4: 'c9'
                    }
        }
    ]
};

var expectedOutput3 = [];



var tableMapEvent4 = {
    schemaName: 'test_schema',
    tableName: 'test_table1'
};


/*
 * simulates the structures of interest in the zongji WriteRows event.
 */
var deleteRowsEvent4 = {
    rows: [
        {
            id: '1',
            column1: 'c2',
            column2: 'c3',
            column3: 'c4',
            column4: 'c5'
        }, {
            id: '2',
            column1: 'c6',
            column2: 'c7',
            column3: 'c8',
            column4: 'c9'
        }
    ]
};


var expectedOutput4 = [
    {data: {id: '1', column1: 'c2', column2: 'c3'}},
    {data: {id: '2', column1: 'c6', column2: 'c7'}}
];




describe('test HandleBinlogEvents filtering and formatting functions', function () {

    it('test filterWriteRows()', function () {
        var h = new HandleBinlogEvents();
        h.tableMap(tableMapEvent1);
        var output = h.filterWriteRows(writeRowsEvent1);

        assert(_.isEqual(expectedFilteredOutput1, output),
                'output should match expected output.');
    });


    var tableMapEventDontCareTable = {
        schemaName: 'test_schema',
        tableName: 'dont_care_table1'
    };

    it('test filterWriteRows() for table that we don\'t care about', function () {
        var h = new HandleBinlogEvents();
        h.tableMap(tableMapEventDontCareTable);
        var output = h.filterWriteRows(writeRowsEvent1);
        assert((output.length === 0), 'output should be undefined.');
    });


    it('test formatDWAttrArray()', function () {
        var h = new HandleBinlogEvents();
        var output = HandleBinlogEvents.formatDWAttrArray(expectedFilteredOutput1);

// startDate will always be changing, so let's over-write it with
// a constant value for test purposes.
        output.forEach(function (row) {
            row.startDate = new Date(2018, 3, 23);
        });

        assert(_.isEqual(expectedOutput1, output),
                'output should match expected output.');
    });



    it('test formatResultAttrArray()', function () {
        var h = new HandleBinlogEvents();
        var output = HandleBinlogEvents.formatResultAttrArray(expectedFilteredOutput1);

// startDate will always be changing, so let's over-write it with
// a constant value for test purposes.
        output.forEach(function (row) {
            row.dateAdded = new Date(2018, 3, 23);
        });

        assert(_.isEqual(expectedResultFormat1, output),
                'output should match expected output.');
    });



    it('test filteredUpdateRows()', function () {
        var h = new HandleBinlogEvents();
        h.tableMap(tableMapEvent2);
        var output = h.filterUpdateRows(updateRowsEvent2);

        assert(_.isEqual(expectedFilteredOutput2, output),
                'output should match expected output.');
    });



    it('test filteredUpdateRows() with no changes of interest in event', function () {
        var h = new HandleBinlogEvents();
        h.tableMap(tableMapEvent3);
        var output = h.filterUpdateRows(updateRowsEvent3);
        assert((output.length === 0), 'output should be empty.');
    });

    it('test filteredDeleteRows()', function () {
        var h = new HandleBinlogEvents();
        h.tableMap(tableMapEvent4);
        var output = h.filteredDeleteRows(deleteRowsEvent4);
        assert(_.isEqual(expectedOutput4, output),
                'output should match expected output.');
    });

    it('test filteredDeleteRows() for table that we don\'t care about', function () {
        var h = new HandleBinlogEvents();
        h.tableMap(tableMapEventDontCareTable);
        var output = h.filteredDeleteRows(deleteRowsEvent4);
        assert((output.length === 0), 'output should be undefined.');
    });
});


var MongoClient = require('mongodb').MongoClient;
var db;
// Connect to the db


describe('test HandleBinlogEvents persistence functions', function () {
// before running these tests, open a mongodb connection.
    before(function (done) {
        MongoClient.connect("mongodb://localhost:27017/binlog-test", function (err, new_db) {
            if (err) {
                return console.dir(err);
            }

            db = new_db;
            done();
        });
    });


    it('test persistWriteRows()', function (done) {
        var h = new HandleBinlogEvents();
        h.tableMap(tableMapEvent1);
        var filteredData = h.filterWriteRows(writeRowsEvent1);
        var dwData = HandleBinlogEvents.formatDWAttrArray(filteredData);
        var rsData = HandleBinlogEvents.formatResultAttrArray(filteredData);

        h.persistWriteRows(db, dwData, rsData, function (err) {
            var collection = db.collection('MC-test-table1');
            collection.find().toArray(function (err, output) {
                // startDate will always be changing, so let's over-write it with
                // a constant value for comparison purposes. Also delete the _id field.
                output.forEach(function (row) {
                    row.startDate = new Date(2018, 3, 23);
                    delete row._id;
                });
                assert(_.isEqual(expectedOutput1, output),
                        'output should match expected output.');

                //cleanup what we have inserted.
                collection.drop();

                var rsCollection = db.collection('result-MC-test-table1');
                rsCollection.find().toArray(function (err, output) {
                    // startDate will always be changing, so let's over-write it with
                    // a constant value for comparison purposes. Also delete the _id field.
                    output.forEach(function (row) {
                        row.dateAdded = new Date(2018, 3, 23);
                        delete row._id;
                    });
                    assert(_.isEqual(expectedResultFormat1, output),
                            'output should match expected output.');

                    //cleanup what we have inserted.
                    rsCollection.drop();
                    done();
                });
            });
        });
    });
    
    
    //After all tests are finished close the database connection.
    after(function(done){
        db.close();
        done();
    });
});
