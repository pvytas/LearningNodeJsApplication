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
var MysqlReplicationController = require ('./mysqlReplicationController');


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
                case 'loadInitialTables':
                    MysqlReplicationController.loadInitialTables().then(function () {
                        res.jsonp({
                            polling: config.replicationRunning,
                            retrying: config.retrying,
                            msg: 'Initial tables loaded.'
                        });
                    }).catch(function (err) {
                        res.status(400).send({
                            polling: config.replicationRunning,
                            retrying: config.retrying,
                            msg: 'Retrying connection',
                            error: err
                        });
                    });
                    break;

                case 'start':
                    if ((req.body.ip) && (req.body.ip.length > 0)) {
                        config.setMysqlDsn(req.body);
                    }

                    MysqlReplicationController.startReplication().then(function () {
                        res.jsonp({
                            polling: config.replicationRunning,
                            retrying: config.retrying,
                            msg: 'Replication started.'
                        });
                    }).catch(function (err) {
                        res.status(400).send({
                            polling: config.replicationRunning,
                            retrying: config.retrying,
                            msg: 'Retrying connection',
                            error: err
                        });
                    });

                    break;

                case 'stop':
                    MysqlReplicationController.stopReplication().then(function () {
                        res.jsonp({
                            polling: config.replicationRunning,
                            retrying: config.retrying,
                            msg: 'Replication stopped.'
                        });
                    }).catch(function (err) {
                        res.status(400).send({
                            polling: config.replicationRunning,
                            retrying: config.retrying,
                            msg: 'Retrying connection',
                            error: err
                        });
                    });
                    break;

                case 'status':
                    console.log('request for replication status ---- ');

                    res.jsonp({
                        polling: config.replicationRunning,
                        retrying: config.retrying,
                        msg: [ 'message line 1.', 'message line 2.', 'message line 3.'],
                        error: 'error message'
                    });
                    break;

                case 'listAllowableTables':
                    console.log('request to list allowable tables ---- ');
                    var nameArray = PersistenceSpecs.getMongoCollectionNameArray();
                    res.jsonp({tablesList: nameArray});
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


