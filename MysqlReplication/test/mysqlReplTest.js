/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
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


