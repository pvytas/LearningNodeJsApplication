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
        host: '130.63.217.58',
//        host: '10.0.1.11',
        port: '3307',
        user: 'zongji',
        password: 'zongji'
    },
    mongoUrl: "mongodb://localhost:27017/exampleDb"
};

