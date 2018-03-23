/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written, March 2018.
 */

/*
 * persistenceSpecs - module to interrogate replication specification.
 * Only the schema, tables and columns described in schemaReplicationSpecs
 * are replicated and others are ignored.
 */


/*
 * hard-wired array of objects for testing. to be replaced by data loaded
 * from MongoDB.
 */

var schemaReplicationSpecs = [
    {
        schemaName: 'db_mediportal',
        tableName: 'rtw_reasons',
        mongoCollectionName: 'MC-rtw-reasons',
        primaryKey: 'id',
        columns: [
            'id',
            'description',
            'roi_including'     
        ]
    },
    
    {
        schemaName: 'db_mediportal',
        tableName: 'time_lost_waiting',
        mongoCollectionName: 'MC-time-lost-waiting',
        primaryKey: 'id',
        columns: [
            'id',
            'booking_id',
            'time_lost'     
        ]
    }
];

/*
 * loadSpecs - load a new replication specification (e.g. from MongoDB collection)
 * @param {type} newSpecs
 *
 */
function loadSpecs (newSpecs) {
    schemaReplicationSpecs = newSpecs;
};

/*
 * Constructor for PersistenceSpecs object
 * 
 * @param {string} schemaName - schema name of event object being handled
 * @param {type} tableName - table name of event object being handled
 */
function PersistenceSpecs (schemaName, tableName) {
    this.currentSchemaName = schemaName;
    this.currentTableName = tableName;
    
    this.currentTableSpec = null;
    self = this;
    schemaReplicationSpecs.forEach(function (tableSpec){
        if ((tableSpec.schemaName === schemaName) && (tableSpec.tableName === tableName)) {
            self.currentTableSpec = tableSpec;
        }          
    });
};

/*
 * returns true if current table is required by specs.
 */
PersistenceSpecs.prototype.requireCurrentTable = function () {
    if (this.currentTableSpec) 
        return true;
 
    return false;
};

/*
 * returns true if column is required by specs.
 */
PersistenceSpecs.prototype.requireColumn = function (columnName) {
    if (!this.currentTableSpec) return false;
    
    var columnArray = this.currentTableSpec.columns;
    if (columnArray.includes(columnName)) return true;
    
    return false;
};


PersistenceSpecs.prototype.getMongoCollectionName = function () {
    if (this.currentTableSpec) 
        return this.currentTableSpec.mongoCollectionName;
 
    return false;
};

module.exports = PersistenceSpecs;
module.exports.loadSpecs = loadSpecs;

