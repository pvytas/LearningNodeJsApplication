/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 */


'use strict';

var mysqlDsn = {
        host: '130.63.217.58',
//        host: '10.0.1.11',
        port: '3307',
        user: 'zongji',
        password: 'zongji'
    };

module.exports = {
    
    mongoUrl: 'mongodb://localhost/mean-dev',
    replicationServerPort: 7000,
    replicationRunning: false,
    retrying: false,
    
    getMysqlDsn: function () { return mysqlDsn; },
    
    setMysqlDsn: function (newDsn) {
        mysqlDsn.host = newDsn.ip;
        mysqlDsn.port = newDsn.port;
        mysqlDsn.user = newDsn.userName;
        mysqlDsn.password = newDsn.password;
    },
    
    zongjiOptions: {
        // Must include rotate events for updating binlogName and binlogNextPos properties
        includeEvents: ['rotate', 'tablemap', 'writerows', 'updaterows', 'deleterows'],
        binlogName: 'mysql-bin.000001',
        binlogNextPos: 154,
        includeSchema: {'db_mediportal': true}
    }
};


