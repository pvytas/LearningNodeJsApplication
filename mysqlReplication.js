/*
 * Wrapper around zongji module that catches MySQL errors (esp. connection errors)
 * and restarts zongji after a timeout period.
 * It is important to enable listening for "rotate" events to accuratedly
 * update the current binlog name and position so that on restart no events
 * are missed or duplicated.
 */


var ZongJi = require('zongji');
var RETRY_TIMEOUT = 4000;


/*
  
  init() - initialize parameters for MySQL replication

  Parameters:
    dsn: data source name with the format:
        {
         host: '130.63.216.93',
         port: '3307',
         user: 'zongji',
         password: 'zongji',
         }

    options: binlog events to include, initial binlog name and position, 
    and which schemas to include. Must include rotate events for 
    binlogName and binlogNextPos properties.
        {
          includeEvents: ['rotate', 'tablemap', 'writerows', 'updaterows', 'deleterows'],
          binlogName: 'mysql-bin.000001',
          binlogNextPos: 154,
          includeSchema: {'db_mediportal': true}
        },

    onBinlog: callback to handle binlog events:
        function(event)
 */

var state = {};

exports.init = function (dsn, options, onBinlog) {
    state.dsn = dsn;
    state.options = options;
    state.onBinlog = onBinlog;
    state.zongji = new ZongJi(state.dsn, state.options);
    state.zongji.on('error', _error_handler);
    state.zongji.on('binlog', state.onBinlog);
};




// To check if it works
var errorCount = 0;
var restartCount = 0;
//setInterval(function() { 
//    console.log('Events:', errorCount, ' Restarts:', restartCount); 
//}, 10000);

// check heap memory usage periodically.
var used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`Initial heapUsed = ${used} MB`);
    
setInterval(function() { 
//    console.log('Events:', eventCount);
    console.log('restartCount:', restartCount);
    
    used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`heapUsed = ${used} MB`);
    
}, 60000);


/*
 * _error_handler - catches MySQL connection errors and restarts
 * replication from where it left off. Stops the current Zongji session and
 * creates a new Zongji object. The old Zongji object is left to be 
 * garbage collected.
 */
_error_handler = function (reason) {
    errorCount++;
//    console.log ('errorCount: ', errorCount);
//    console.log ('error: ', reason);
    
    state.zongji.removeListener('binlog', state.onBinlog);
    var restartInProgress = false;
    state.zongji.stop();

    setTimeout(function() {
        // If multiple errors happened, a new instance may have already been created
        if(!(restartInProgress)) {
            restartInProgress = true;
            restartCount++;
//            console.log('state.zongji.binlogName', state.zongji.binlogName);
//            
            // capture the current binlog name and position for old zongji instance.
            if(state.zongji.binlogName) {
                state.options.binlogName = state.zongji.binlogName;
                state.options.binlogNextPos = state.zongji.binlogNextPos;
            };
//            console.log('state.dsn=', state.dsn);
//            console.log('state.options=', state.options);

            var newZongji = new ZongJi(state.dsn, state.options);
            state.zongji = newZongji;   
            state.zongji.on('error', _error_handler);
            state.zongji.on('binlog', state.onBinlog);
            state.zongji.start(state.options);

      }
    }, RETRY_TIMEOUT);
};


/*
 * start - starts replication from state defined with init()
 */
exports.start = function () {

    state.zongji.start(state.options);
};

/*
 * stop - halts replication, closes MySQL connection. Also returns the 
 * current options settings so that they can be persisted for restarting 
 * in a future session.
 */
exports.stop = function () {
    state.zongji.stop();
    return state.options;
};



