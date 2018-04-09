/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 */

/*
 * This module uses Express node.js application framework to route
 * incoming HTTP requests
 */

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var config = require('./config');
var PersistenceSpecs = require ('./persistenceSpecs');

module.exports = function () {
    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.get('/', function (req, res) {
        console.log('requested: /');
        res.send('Hello MySQL replication server!');
    });

    app.post('/launch', function (req, res) {
        var body = req.body;
        if (body.type) {
            switch (body.type) {
                case 'start':
                    console.log('request to start replication from MySQL ---- ');
                    config.setMysqlDsn (req.body);
//                    console.log('newDsn:' + JSON.stringify(config.getMysqlDsn(), undefined, 2));
                    
                    res.jsonp({
                        polling: config.replicationRunning,
                        retrying: config.retrying,
                        msg: 'Replicating MySQL events.'
                    });
                    break;

                case 'stop':
                    console.log('request to stop replication from MySQL ---- ');
                    res.jsonp({
                        polling: config.replicationRunning,
                        retrying: config.retrying,
                        msg: 'Replication from MySQL halted.'
                    });
                    break;

                case 'status':
                    console.log('request to replication status ---- ');

                    res.jsonp({
                        polling: config.replicationRunning,
                        retrying: config.retrying
                    });
                    break;

                case 'listAllowableTables':
                    console.log('request to list allowable tables ---- ');
                    var nameArray = PersistenceSpecs.getMongoCollectionNameArray();
                    res.jsonp({tablesList : nameArray});
                    break;

                default:
                    console.log('unexpected body.type=' + body.type);
                    res.send(400);
            }
            ;
        } else {
            console.log('undefined body.type=');
            res.send(400);
        }
    });
    
    var server = http.createServer(app);
    server.timeout = 0;
    app.set('server', server);
    return app;
};


