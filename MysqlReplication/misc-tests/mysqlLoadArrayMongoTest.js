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
MongoClient.connect(testConfig.mongoUrl, function (err, new_db) {
    if (err) {
        console.log('Error connecting to MongoDB database.');
        return console.dir(err);
    }

    db = new_db;
    connection = mysql.createConnection(testConfig.mysqlDsn);

    connection.connect(function (err) {
        if (err) {
            console.log('Error connecting to MySQL database.');
            console.log(err);
            db.close();
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






