/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 */

/*
 * mysqlReplMongoTest - exercises the mysqlReplication module and 
 * handleBinlogEvents modules. Connects to a remote MySQL database,
 * accepts replication events with mysqlReplication and calls 
 * handleBinlogEvents to process the events and persist to a MongoDB
 * test database.
 * 
 * Depends on manual validation of persisted Mongo data. 
 */

var mysqlReplication = require('../mysqlReplication');
var HandleBinlogEvents = require ('../handleBinlogEvents');
var MongoClient = require('mongodb').MongoClient;
var testConfig = require('./testConfig');

var h  = new HandleBinlogEvents();
var db = {};

mysqlReplication.init(
// Pass the connection settings
        testConfig.mysqlDsn,
        
// Pass the options
// Must include rotate events for binlogName and binlogNextPos properties
        {
            includeEvents: ['rotate', 'tablemap', 'writerows', 'updaterows', 'deleterows'],
            binlogName: 'mysql-bin.000001',
            binlogNextPos: 154,
            includeSchema: {'db_mediportal': true}
        },
// Callback each time that Binlog event is received.
        function (event) {
//            console.log("+++++Inside binlog event++++");
//            event.dump();
            switch (event.getTypeName()) {
                case 'TableMap':
                  h.tableMap(event);
                  break;
                  
                case 'WriteRows':
                  h.handleWriteRows (db, event);
                  break;
                  
                case 'UpdateRows':
                  h.handleUpdateRows (db, event);
                  break;
                  
                case 'DeleteRows':
                  h.handleDeleteRows (db, event);
                  break;
                  
                default:
                    console.log('unexpected event.');
            }
});
 


process.on('SIGINT', function () {
    console.log('Got SIGINT.');
    mysqlReplication.stop();
    db.close();
    process.exit();
});


// Connect to the db
MongoClient.connect(testConfig.mongoUrl, function(err, new_db) {
    if(err) { return console.dir(err); }

    db = new_db;
    mysqlReplication.start();
});


