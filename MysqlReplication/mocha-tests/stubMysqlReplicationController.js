/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 * Each line should be prefixed with  * 
 */

/*
 * This module contains stub functions the top-level functions for the MySQL Replication
 * Server and is used for testing the router via the Bitnobi UI.
 */

'use strict';

var Q = require('q');
var mysql = require('mysql');
var MongoClient = require('mongodb').MongoClient;
var LoadFromMysql = require('./loadFromMysql');
var config = require('./testConfig');
var PersistenceSpecs = require ('../persistenceSpecs');

var toggle = 1;

function loadInitialTables () {
    var deferred = Q.defer();
    
    console.log('request to load initial tables from MySQL ---- ');
    console.log('using DSN settings:');
    console.log(JSON.stringify(config.getMysqlDsn()));

    config.replicationRunning = false;
        
    setTimeout(function () {
        if (toggle === 1) {
            toggle = 0;
            deferred.reject('failed to start.');            
        } else {
            toggle = 1;
            deferred.resolve('Successfully loaded tables:\n  table1 123 rows,\n  table2 456 rows.');
        }
    }, 3000);

    return deferred.promise;    
}


function startReplication() {
    var deferred = Q.defer();

    console.log('request to start replication from MySQL ---- ');
    console.log('using DSN settings:');
    console.log(JSON.stringify(config.getMysqlDsn()));
        
    setTimeout(function () {
        if (toggle === 1) {
            toggle = 0;
            config.replicationRunning = false;
            deferred.reject('failed to start.');            
        } else {
            toggle = 1;
            config.replicationRunning = true;
            deferred.resolve('started successfully.');
        }
    }, 3000);

    return deferred.promise;
}


function testConnection() {
    var deferred = Q.defer();

    console.log('request to test connection to MySQL ---- ');
    console.log('using DSN settings:');
    console.log(JSON.stringify(config.getMysqlDsn()));

    setTimeout(function () {
        if (toggle === 1) {
            toggle = 0;
            deferred.reject('connection failed');            
        } else {
            toggle = 1;
            deferred.resolve('connection succeeded');
        }
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

module.exports.loadInitialTables = loadInitialTables;
module.exports.startReplication = startReplication;
module.exports.testConnection = testConnection;
module.exports.stopReplication = stopReplication;

