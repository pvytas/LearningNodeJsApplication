/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 */

/*
 * mysqlReplTest - exercises the mysqlReplication module.
 * 
 * Connects to a remote MySQL database, accepts replication events with 
 * mysqlReplication and displays binlog replication events to the console
 * 
 * Depends on configuration of MySQL server to generate RowFormat replication.
 * User must execute scripts on MySQL server to generate replication
 * events.
 */

var mysqlReplication = require('../mysqlReplication');
var testConfig = require('./testConfig');

mysqlReplication.init(
        
// Pass the connection settings
        testConfig.dsn,
        
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
            console.log("+++++Inside binlog event++++");
            event.dump();
        });


process.on('SIGINT', function () {
    console.log('Got SIGINT.');
    mysqlReplication.stop();
    process.exit();
});

mysqlReplication.start();


