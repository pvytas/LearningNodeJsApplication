/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 */


/*
 * Data Source Name (DSN) for connecting to MySQL database and MongoDB URL
 * to use for use by unit tests in this directory.
 */

'use strict';

module.exports = {
    mysqlDsn: {
        host: '130.63.217.211',
//        host: '10.0.1.11',
        port: '3307',
        user: 'zongji',
        password: 'zongji'
    },

    zongjiOptions: {
        // Must include rotate events for updating binlogName and binlogNextPos properties
        includeEvents: ['rotate', 'tablemap', 'writerows', 'updaterows', 'deleterows'],
        
        // binlog name and position are updated as events are processed 
        // by handleBinlogEvents(). This is to support restarting replication.
        binlogName: 'mysql-bin.000001',
        binlogNextPos: 154,
        includeSchema: {'db_mediportal': true}
    },
    
    mongoUrl: "mongodb://localhost:27017/exampleDb"
};

