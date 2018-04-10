/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 */

/*
 * This is main module for running the mysqlReplicationServer.
 */

'use strict';


process.on('uncaughtException', function (err) {
    console.log(err);
    console.log("Connection reset...");
});

var config = require('./config');


var app = require('./mysqlReplicationRoutes')();

app.get('server').listen(config.replicationServerPort);
console.log('mysqlReplicationServer up and running at localhost:%s', config.replicationServerPort);
