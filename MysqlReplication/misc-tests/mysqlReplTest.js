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
var binlogName = '';



mysqlReplication.init(
        
// Pass the connection settings
        testConfig.mysqlDsn,
        
// Pass the zongji options
        testConfig.zongjiOptions,
        
// Callback each time that Binlog event is received.
        function (event) {
            console.log("+++++Inside binlog event++++");
            var type = event.getTypeName();
            console.log('event type=%s', type);

            if (type==='Rotate') {
                binlogName = event.binlogName;
            }
            
            if ((type==='WriteRows') || (type==='UpdateRows') || (type==='DeleteRows')) {
                console.log('binlogName=%s', binlogName);
                console.log('binlogNextPos=%s', event.nextPosition);
            }

//            event.dump();
        });


process.on('SIGINT', function () {
    console.log('Got SIGINT.');
    mysqlReplication.stop();
    console.log('BinlogName=%s', mysqlReplication.getBinlogName());
    console.log('BinlogNextPos=%s', mysqlReplication.getBinlogNextPos());
    process.exit();
});

mysqlReplication.start();


