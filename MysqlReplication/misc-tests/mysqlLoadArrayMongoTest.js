/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 */

/*
 * This test exercised loadFromMysql.js by loading the contents of the
 * tables described in persistenceSpecs into mongoDB  collections.
 */

var mysql = require('mysql');
var testConfig = require('./testConfig');
var MongoClient = require('mongodb').MongoClient;
var LoadFromMysql = require('../loadFromMysql');
var PersistenceSpecs = require ("../persistenceSpecs");

var db = {};


var connection;

process.on('SIGINT', function () {
    console.log('Got SIGINT.');
    db.close();
    connection.end(function (err) {
    });
    process.exit();
});


// Connect to the db
MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, new_db) {
    if (err) {
        return console.dir(err);
    }

    db = new_db;
    connection = mysql.createConnection(testConfig.dsn);

    connection.connect(function (err) {
        if (err) {
            console.log('Error connecting to Db');
            console.log(err);
            return;
        }
        console.log('Connection established');
    });

    LoadFromMysql.loadMysqlFromSpecArray(connection, 
    PersistenceSpecs.schemaReplicationSpecs, db, function () {
        console.log('done');

        connection.end(function (err) {
        });

        db.close();
    });
});






