/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mysqlReplication = require('./mysqlReplication');
var HandleBinlogEvents = require ('./handleBinlogEvents');
var MongoClient = require('mongodb').MongoClient;

var h  = new HandleBinlogEvents();
var db = {};

mysqlReplication.init(
// Pass the connection settings
        {
            host: '10.0.1.11',
            port: '3307',
            user: 'zongji',
            password: 'zongji'
        },
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
                  var data = h.filteredWriteRows(event);
                  h.persistWriteRows (db, data);
                  break;
                  
                case 'UpdateRows':
                  var data = h.filteredUpdateRows(event);
                  h.persistUpdateRows (db, data);                 
                  break;
                  
                case 'DeleteRows':
                  var data = h.filteredDeleteRows(event);
                  h.persistDeleteRows (db, data);                 
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
MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, new_db) {
    if(err) { return console.dir(err); }

    db = new_db;
    mysqlReplication.start();
});


