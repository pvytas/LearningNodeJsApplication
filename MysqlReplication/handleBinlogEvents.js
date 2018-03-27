/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written, March 2018.
 */



PersistenceSpecs = require ("./persistenceSpecs");

function HandleBinlogEvents () {
};

HandleBinlogEvents.prototype.tableMap = function (event) {
  
    // fetch specifications of which columns to persist for target schema and table.
    this.persistenceSpecs = new PersistenceSpecs (event.schemaName, 
        event.tableName);
};

HandleBinlogEvents.prototype.getMongoCollectionName = function () {
    return this.persistenceSpecs.getMongoCollectionName();
};

/*
 * filteredWriteRows - iterates through rows and columns of binlog WriteEvent.
 * For each column listed in the spec, creates an array of objects like:
 * 
 * {
 *    data: [
 *      column1: value,
 *      column4: value,
 *      .
 *      .
 *      .
 *      columnn: value ],
 *    startDate: current_date,
 *    endDate: max_date
 * }
 * 
 *  that can be persisted to a MongoDB collection.
 */
 
HandleBinlogEvents.prototype.filteredWriteRows = function (event) {
    var specs = this.persistenceSpecs;
    if (!specs.requireCurrentTable()) return [];
    
    var output = [];
    event.rows.forEach(function(row) {
        var rowOutput = { data: {} };

        Object.keys(row).forEach(function(name) {
          if (specs.requireColumn (name)) {
              rowOutput.data[name] = row[name];
          }
        });
        
        rowOutput.startDate = new Date();
        rowOutput.endDate = new Date(9999, 5, 24, 11, 33, 30, 0);
        
        output.push (rowOutput);               
    });    
    return (output);
};


HandleBinlogEvents.prototype.persistWriteRows = function (db, data, cb) {
    if ((!data) || data.length === 0) return;   
    var collectionName = this.persistenceSpecs.getMongoCollectionName();
    if (!collectionName) return;
    
    var collection = db.collection(collectionName);
    collection.insert(data, {w:1}, function(err, result) {
        if (!(cb === undefined)) cb(err);
    });
};



/*
 * filteredUpdateRows - iterates through rows and columns of binlog UpdateRows event.
 * For each column listed in the spec, creates an array of objects like:
 * 
 * {
 *    data: [
 *      column1: value,
 *      column4: value,
 *      .
 *      .
 *      .
 *      columnn: value ],
 *    startDate: current_date,
 *    endDate: max_date
 * }
 * 
 *  that can be persisted to a MongoDB collection.
 *  
 *  optimization: emit empty row if there are no changes in the columns
 *  of interest.
 */
 
HandleBinlogEvents.prototype.filteredUpdateRows = function (event) {
    var specs = this.persistenceSpecs;
    if (!specs.requireCurrentTable()) return [];
    
    var output = [];
    event.rows.forEach(function(row) {
        var rowOutput = { data: {} };

// optimization: emit empty row if there are no changes in the columns
//  of interest.
        var changeFound = false;
        Object.keys(row.before).forEach(function(name) {
          if (specs.requireColumn (name)) {
              rowOutput.data[name] = row.after[name];
              if (!(row.before[name] === row.after[name])) {
                  changeFound = true;
              }
          }
        });
        
        if (changeFound) {
            rowOutput.startDate = new Date();
            rowOutput.endDate = new Date(9999, 5, 24, 11, 33, 30, 0);
            output.push (rowOutput);
        }
    });    
    return (output);
};


HandleBinlogEvents.prototype.persistUpdateRows = function (db, data) {
    if ((!data) || data.length === 0) return;   
    var collectionName = this.persistenceSpecs.getMongoCollectionName();
    if (!collectionName) return;
    
    var collection = db.collection(collectionName);
    var primaryKey = this.persistenceSpecs.getPrimaryKey();
    
// if there are multiple rows in the update event, they must be for the
// same schema and table.
    data.forEach (function (row) {
        
        var query = {};
        query['data.'.concat(primaryKey)] = row.data[primaryKey];
        query.endDate = new Date(9999, 5, 24, 11, 33, 30, 0);
        collection.update (query, {$set: {endDate: row.startDate}}, 
            function(err, result) {
                if (err) {
                    console.log(err.message);
                }
            });
    
        collection.insert(row, {w:1}, function(err, result) {
                if (err) {
                    console.log(err.message);
                }
            });
    });
};



/*
 * filteredDeleteRows - iterates through rows and columns of binlog DeleteRows event.
 * For each column listed in the spec, creates an array of objects like:
 * 
 * {
 *    data: [
 *      column1: value,
 *      column4: value,
 *      .
 *      .
 *      .
 *      columnn: value ],
 * }
 * 
 *  that can be persisted to a MongoDB collection.
 */
 
HandleBinlogEvents.prototype.filteredDeleteRows = function (event) {
    var specs = this.persistenceSpecs;
    if (!specs.requireCurrentTable()) return [];
    
    var output = [];
    event.rows.forEach(function(row) {
        var rowOutput = { data: {} };

        Object.keys(row).forEach(function(name) {
          if (specs.requireColumn (name)) {
              rowOutput.data[name] = row[name];
          }
        });
                
        output.push (rowOutput);               
    });    
    return (output);
};



HandleBinlogEvents.prototype.persistDeleteRows = function (db, data) {
    if ((!data) || data.length === 0) return;   
    var collectionName = this.persistenceSpecs.getMongoCollectionName();
    if (!collectionName) return;
    
    var collection = db.collection(collectionName);
    var primaryKey = this.persistenceSpecs.getPrimaryKey();
    
// if there are multiple rows in the update event, they must be for the
// same schema and table.
    data.forEach (function (row) {
        
        var query = {};
        query['data.'.concat(primaryKey)] = row.data[primaryKey];
        query.endDate = new Date(9999, 5, 24, 11, 33, 30, 0);
        collection.update (query, {$set: {endDate: new Date()}}, 
            function(err, result) {
                if (err) {
                    console.log(err.message);
                }
            });
    });
}; 


module.exports = HandleBinlogEvents;