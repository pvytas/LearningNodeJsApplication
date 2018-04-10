/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 * Each line should be prefixed with  * 
 */

/*
 * This module contains the top-level functions for the MySQL Replication
 * Server and is called by the router.
 */

'use strict';

var Q = require('q');
var mysql = require('mysql');
var MongoClient = require('mongodb').MongoClient;
var LoadFromMysql = require('./loadFromMysql');
var config = require('./config');
var PersistenceSpecs = require ('./persistenceSpecs');


function loadInitialTables () {
    var deferred = Q.defer();
    
    console.log('request to load initial tables from MySQL ---- ');
    
    setTimeout(function () {
        config.replicationRunning = false;
        deferred.resolve();
    }, 3000);

    return deferred.promise;    
}

function startReplication() {
    var deferred = Q.defer();

    console.log('request to start replication from MySQL ---- ');
    console.log('using DSN settings:');
    console.log(JSON.stringify(config.getMysqlDsn()));

    setTimeout(function () {
        config.replicationRunning = true;
        deferred.resolve();
    }, 3000);

    return deferred.promise;
}


function stopReplication () {
    var deferred = Q.defer();
    
    console.log('request to stop replication from MySQL ---- ');
    
    setTimeout(function () {
        config.replicationRunning = false;
        deferred.resolve();
    }, 3000);

    return deferred.promise;
}

module.exports.loadInitialCollections = loadInitialTables;
module.exports.startReplication = startReplication;
module.exports.stopReplication = stopReplication;

