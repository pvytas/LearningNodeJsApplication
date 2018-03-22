/* 
 * Sample program to illustrate graceful restarting on.
 * Found on GitHub Gist in numtel / example.js
 * https://gist.github.com/numtel/5b37b2a7f47b380c1a099596c6f3db2f
 */


var ZongJi = require('zongji');

var RETRY_TIMEOUT = 4000;

/*
 * Wrapper around zongji that catches MySQL errors (esp. connection errors)
 * and restarts zongji after a timeout period.
 * It is important to enable listening for "rotate" events to accuratedly
 * update the current binlog name and position so that on restart no events
 * are missed or duplicated.
 */

var retryCount = 0;

function zongjiManager(dsn, options, onBinlog) {
  var newInst = new ZongJi(dsn, options);
  newInst.on('error', function(reason) {
    newInst.removeListener('binlog', onBinlog);
    setTimeout(function() {
      // If multiple errors happened, a new instance may have already been created
      if(!('child' in newInst)) {
        retryCount++;
        newInst.child = zongjiManager(dsn, Object.assign({}, options, {
          binlogName: newInst.binlogName,
          binlogNextPos: newInst.binlogNextPos
        }), onBinlog);
        newInst.emit('child', newInst.child, reason);
        newInst.child.on('child', child => newInst.emit('child', child));
      }
    }, RETRY_TIMEOUT);
  });
  newInst.on('binlog', onBinlog);
  newInst.start(options);
  return newInst;
}


// To check if it works
//var eventCount = 0;

// check heap memory usage periodically.
var used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`Initial heapUsed = ${used} MB`);
    
setInterval(function() { 
//    console.log('Events:', eventCount);
    console.log('RetryCount:', retryCount);
    
    used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`heapUsed = ${used} MB`);
    
}, 60000);

var currentSchemaName = "";
var currentTableName = "";

var zongji = zongjiManager(
// Pass the connection settings
{
	host: '130.63.216.93',
        port: '3307',
	user: 'zongji',
	password: 'zongji',
},
// Pass the options
// Must include rotate events for binlogName and binlogNextPos properties
{
  includeEvents: ['rotate', 'tablemap', 'writerows', 'updaterows', 'deleterows'],
  binlogName: 'mysql-bin.000001',
  binlogNextPos: 154,
  includeSchema: {'db_mediportal': true}
},
// Binlog callback that will be attached each time Zongji is restarted
function(event) {
  eventCount++
//  event.dump();
 
  console.log('event name: '+ event.getTypeName());
  console.log('Date: %s', new Date(event.timestamp));
  switch (event.getTypeName()) {
      case 'TableMap':
        currentSchemaName = event.schemaName;
        currentTableName = event.tableName;
        break;
      case 'WriteRows':
        console.log ('schema=', currentSchemaName, 'table=', currentTableName);
        event.rows.forEach(function(row) {
            console.log('--');
            Object.keys(row).forEach(function(name) {
              console.log('Column: %s, Type: %s, Value: %s', name, typeof row[name], row[name]);
            });
        });
        break;
      case 'UpdateRows':
        console.log ('schema=', currentSchemaName, 'table=', currentTableName);
        event.rows.forEach(function(row) {
            console.log('--');
            Object.keys(row.before).forEach(function(name) {
              console.log('Column: %s, Value: %s => %s', name, row.before[name], row.after[name]);
            });
        });
        break;
      case 'DeleteRows':
        console.log ('schema=', currentSchemaName, 'table=', currentTableName);
        event.rows.forEach(function(row) {
            console.log('--');
            Object.keys(row).forEach(function(name) {
              console.log('Column: %s, Value: %s', name, row[name]);
            });
        });
        break;
      default:
          console.log('unexpected event.');
  }
});

var newest = zongji;

zongji.on('child', function(child, reason) {
  console.log('New Instance Created', reason);
  newest.stop();
  newest = child;
});

process.on('SIGINT', function() {
  console.log('Got SIGINT.');
  newest.stop();
  process.exit();
});
