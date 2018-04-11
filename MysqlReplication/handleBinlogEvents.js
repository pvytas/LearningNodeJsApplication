/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written, March 2018.
 */

/*
 * handleBinlogEvents - handles a MySQL replication event emitted from 
 * the zongji module. Expected event types are:
 * 
 * TableMap    - sets the schema and table name of the event to follow
 * WriteEvent  - insert one or more rows into a table
 * UpdateEvent - update one or more rows in a table
 * DeleteEvent - delete one or more rows from a table
 */


var PersistenceSpecs = require ("./persistenceSpecs");

var REPLICATION_STATE_COLLECTION_NAME = 'MysqlReplicationState';


function HandleBinlogEvents (functionGetBinlogName, functionGetBinlogNextPos) {
    this.getBinlogName = functionGetBinlogName;
    this.getBinlogNextPos = functionGetBinlogNextPos;
};

HandleBinlogEvents.prototype.handleTableMap = function (event) { 
    // fetch specifications of which columns to persist for target schema and table.
    this.persistenceSpecs = new PersistenceSpecs (event.schemaName, 
        event.tableName);
};


HandleBinlogEvents.prototype.getMongoCollectionName = function () {
    return this.persistenceSpecs.getMongoCollectionName();
};

/*
 * filterWriteRows - iterates through rows and columns of binlog WriteEvent.
 * For each column listed in the spec, creates an array of objects like:
 * 
 * {
 *      column1: value,
 *      column4: value,
 *      .
 *      .
 *      .
 *      columnn: value
 * }
 * 
 */
 
HandleBinlogEvents.prototype.filterWriteRows = function (event) {
    var specs = this.persistenceSpecs;
    if (!specs.requireCurrentTable()) return [];
    
    var output = [];
    event.rows.forEach(function(row) {
        var rowOutput = {};

        Object.keys(row).forEach(function(name) {
          if (specs.requireColumn (name)) {
              rowOutput[name] = row[name];
          }
        });

        output.push (rowOutput);               
    });    
    return (output);
};


/*
 * formatDWAttr - adds elements for persisting to DataWarehouse collection.
 * Accepts an array of rows with each row like:
 * 
 * {
 *      column1: value,
 *      column4: value,
 *      .
 *      .
 *      .
 *      columnn: value 
 * }
 * 
 * and returns a formatted array of rows where each row is like:
 * 
 * {
 *    data: {
 *      column1: value,
 *      column4: value,
 *      .
 *      .
 *      .
 *      columnn: value },
 *    startDate: current_date,
 *    endDate: max_date
 * }
 * 
 */

function formatDWAttr (row) {
     var output = {
        'data': row,
        'startDate': new Date(),
        'endDate': PersistenceSpecs.getSurrogateHighDate()
    };   

    return (output);
};


function formatDWAttrArray (rows) {
    var output = [];
    if ((!rows) || rows.length === 0) return (output);  

    rows.forEach(function(row) {
        var rowOutput = formatDWAttr(row);
        output.push (rowOutput);               
    });    
    return (output);
};



/*
 * formatResultAttr - adds elements for persisting to result-MC collection.
 * Accepts an array of rows with each row like:
 * 
 * {
 *      column1: value,
 *      column4: value,
 *      .
 *      .
 *      .
 *      columnn: value 
 * }
 * 
 * and returns a formatted array of rows where each row is like:
 * 
 * {
 *    ownerId: 'MC',
 *    dateAdded: current_date,
 *    data: {
 *      column1: value,
 *      column4: value,
 *      .
 *      .
 *      .
 *      columnn: value },
 *    sourceExportable: true,
 *    exportable: true
 * }
 * 
 */
 
function formatResultAttr (row) {
    var output = {
        'ownerId': 'MC',
        'dateAdded': new Date(),
        'data': row,
        'sourceExportable': true,
        'exportable': true
    };

    return (output);
};


function formatResultAttrArray (rows) {
    var output = [];
    if ((!rows) || rows.length === 0) return (output);  

    rows.forEach(function(row) {
        var rowOutput = formatResultAttr(row);
        output.push (rowOutput);               
    });    
    return (output);
};

/*
 * persistWriteRows - persist an array of rows to data warehouse
 * mongo collection and to the result-xxx mongo collection.
 * 
 * 
 * @param {type} db  - connection provided by MongoClient.connect()
 * @param {type} data - array of row objects formatted for data warehouse
 * @param {type} rsData - array of row objects formatted for result-xxx collection
 * @param {type} cb  - function called when insert is complete
 * @returns {undefined}
 */

HandleBinlogEvents.prototype.persistWriteRows = function (db, data, rsData, cb) {
    if ((!data) || data.length === 0) return;   
    var collectionName = this.persistenceSpecs.getMongoCollectionName();
    if (!collectionName) return;
    
    var collection = db.collection(collectionName);
    collection.insert(data, {w:1}, function(err, result) {  });
    
    var rsCollection = db.collection('result-' + collectionName);
    rsCollection.insert(rsData, {w:1}, function(err, result) {
        if (cb !== undefined) cb(err);
    });
};

/*
 * 
 * @param {type} db
 * @returns {undefined}
 */
HandleBinlogEvents.prototype.persistBinlogState = function (db, cb) {
    var collection = db.collection(REPLICATION_STATE_COLLECTION_NAME);

    var binlogStateData = {
        binlogName: this.getBinlogName(),
        binlogNextPos: this.getBinlogNextPos()
    };

    collection.updateOne({}, binlogStateData, {upsert: true, w: 1},
            function (err, result) {
                if (!(cb === undefined))
                    cb(err);
            });
};

/*
 * handleWriteRows - accepts a WriteRows binlog event and 
 * persists to MongoDB collections.
 * 
 * @param {type} db - connection provided by MongoClient.connect()
 * @param {type} event - binlog WriteRows event
 * @returns {undefined}
 */
HandleBinlogEvents.prototype.handleWriteRows = function (db, event, cb) {
    var filteredData = this.filterWriteRows(event);
    var dwData = formatDWAttrArray(filteredData);
    var rsData = formatResultAttrArray(filteredData);
    var self = this;
    
    this.persistWriteRows(db, dwData, rsData, function (err, result) {
        if (filteredData.length > 0) {
            self.persistBinlogState(db, function (err) {
                if (!(cb === undefined))
                    cb(err);
            });
        }
    });
};


/*
 * filterUpdateRows - iterates through rows and columns of binlog UpdateRows event.
 * For each column listed in the spec, creates an array of objects like:
 * 
 * {
 *      column1: value,
 *      column4: value,
 *      .
 *      .
 *      .
 *      columnn: value
 * }
 * 
 *  that can be persisted to a MongoDB collection.
 *  
 *  optimization: emit empty row if there are no changes in the columns
 *  of interest. Note that if value is a date object, comparison
 *  must use date.getTime() function.
 */
 
HandleBinlogEvents.prototype.filterUpdateRows = function (event) {
    var specs = this.persistenceSpecs;
    if (!specs.requireCurrentTable()) return [];
    
    var output = [];
    event.rows.forEach(function(row) {
        var rowOutput = {};

// optimization: emit empty row if there are no changes in the columns
//  of interest.
        var changeFound = false;
        Object.keys(row.before).forEach(function(name) {
            if (specs.requireColumn (name)) {
                rowOutput[name] = row.after[name];
                
                var before = row.before[name];
                var after = row.after[name];

                if ((before !== null) && (before.constructor === Date)) {
                    if (before.getTime() !== after.getTime()) {
//                        console.log ('dates diff %s value %s -> %s', name, before, after);
                        changeFound = true;
                    }
                } else {
                    if (before !== after) {
//                        console.log ('diff %s value %s -> %s', name, before, after);
                        changeFound = true;
                    }
                }
            }
        });
        
        if (changeFound) {
           output.push (rowOutput);
        }
    });    
    return (output);
};


HandleBinlogEvents.prototype.persistUpdateRows = function (db, dwData, rsData) {
    if ((!dwData) || dwData.length === 0)
        return;
    var dwCollectionName = this.persistenceSpecs.getMongoCollectionName();
    if (!dwCollectionName)
        return;

    var dwCollection = db.collection(dwCollectionName);
    var primaryKey = this.persistenceSpecs.getPrimaryKey();

// if there are multiple rows in the update event, they must be for the
// same schema and table.
    dwData.forEach(function (row) {
        // find the existing row with the matching primary key value
        // and mark it as expired by setting the endDate to the new
        // row's startDate.
        var query = {};
        query['data.'.concat(primaryKey)] = row.data[primaryKey];
        query.endDate = PersistenceSpecs.getSurrogateHighDate();

        dwCollection.update(query, {$set: {endDate: row.startDate}},
                function (err, result) {
                    if (err)
                        console.log(err.message);
                });

        // insert the new row into the collection
        dwCollection.insert(row, {w: 1}, function (err, result) {
            if (err)
                console.log(err.message);
        });
    });

    var rsCollection = db.collection('result-' + dwCollectionName);
    rsData.forEach(function (row) {
        // in the results-xx collection, replace the contents of the 
        // existing row matching the primary key with the new row
        var query = {};
        query['data.'.concat(primaryKey)] = row.data[primaryKey];
        rsCollection.replaceOne(query, row);
    });
};


/*
 * handleUpdateRows - accepts an UpdateRows binlog event and 
 * persists to MongoDB collections.
 * 
 * @param {type} db - connection provided by MongoClient.connect()
 * @param {type} event - binlog UpdateRows event
 * @returns {undefined}
 */
HandleBinlogEvents.prototype.handleUpdateRows = function (db, event) {
    var filteredData = this.filterUpdateRows(event);
    var dwData = formatDWAttrArray(filteredData);
    var rsData = formatResultAttrArray(filteredData);

    this.persistUpdateRows(db, dwData, rsData);
    var self = this;
    
    if (filteredData.length > 0) {
        self.persistBinlogState(db, function (err) { });
    }
};



HandleBinlogEvents.prototype.persistDeleteRows = function (db, dwData, rsData) {
    if ((!dwData) || dwData.length === 0) return;   
    var dwCollectionName = this.persistenceSpecs.getMongoCollectionName();
    if (!dwCollectionName) return;
    
    var dwCollection = db.collection(dwCollectionName);
    var primaryKey = this.persistenceSpecs.getPrimaryKey();

    
// if there are multiple rows in the update event, they must be for the
// same schema and table.
    dwData.forEach (function (row) {       
        var query = {};
        query['data.'.concat(primaryKey)] = row.data[primaryKey];
        query.endDate = PersistenceSpecs.getSurrogateHighDate();
        dwCollection.update (query, {$set: {endDate: new Date()}}, 
            function(err, result) {
                if (err) {
                    console.log(err.message);
                }
            });
    });
    
    var rsCollection = db.collection('result-' + dwCollectionName);
    rsData.forEach (function (row) {
        // in the results-xx collection, delete the row matching the 
        // primary key with the new row
        var query = {};
        query['data.'.concat(primaryKey)] = row.data[primaryKey];
        rsCollection.deleteOne (query);
    });
}; 


/*
 * handleDeleteRows - accepts an DeleteRows binlog event and 
 * persists to MongoDB collections.
 * 
 * @param {type} db - connection provided by MongoClient.connect()
 * @param {type} event - binlog DeleteRows event
 * @returns {undefined}
 */
HandleBinlogEvents.prototype.handleDeleteRows = function (db, event) {
    //rows data is in same format as WriteRows event
    var filteredData = this.filterWriteRows(event);
    var dwData = formatDWAttrArray(filteredData);
    var rsData = formatResultAttrArray(filteredData);

    this.persistDeleteRows(db, dwData, rsData);
    
    var self = this;
    if (filteredData.length > 0) {
        self.persistBinlogState(db, function (err) { });
    }
};


module.exports = HandleBinlogEvents;
module.exports.formatDWAttr = formatDWAttr;
module.exports.formatDWAttrArray = formatDWAttrArray;
module.exports.formatResultAttr = formatResultAttr;
module.exports.formatResultAttrArray = formatResultAttrArray;



