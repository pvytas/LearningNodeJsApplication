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
 * writeRows - iterates through rows and columns of binlog WriteEvent.
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
    if (!specs.requireCurrentTable()) return;
    
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


HandleBinlogEvents.prototype.persistWriteRows = function (db, data) {
    if (!data) return;   
    var collectionName = this.persistenceSpecs.getMongoCollectionName();
    if (!collectionName) return;
    
    var collection = db.collection(collectionName);
    collection.insert(data, {w:1}, function(err, result) {});
};


module.exports = HandleBinlogEvents;