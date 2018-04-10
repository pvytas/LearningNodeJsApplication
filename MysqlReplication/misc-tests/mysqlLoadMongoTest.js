/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 */

/*
 * This test exercised loadFromMysql.js by loading the contents of the
 * `clients_booking` table into mongoDB MC_clients_booking collection.
 */

var mysql = require('mysql');
var testConfig = require('./testConfig');
var MongoClient = require('mongodb').MongoClient;
var LoadFromMysql = require('../loadFromMysql');
var db = {};

var spec = {
    schemaName: 'db_mediportal',
    tableName: 'clients_booking',
    mongoCollectionName: 'MC-clients-booking',
    primaryKey: 'booking_id',
    columns: [
        'booking_id',
        'case_status',
        'disability_classification',
        'request_individual_province',
        'business_line',
        'secondary_business_line',
        'consult_wait_time',
        'treatment_wait_time',
        'ps_fa_wait_time',
        'ps_t_wait_time',
        'booking_app_date',
        'date_treatment_initiated',
        'returns_to_work',
        'reason_to_rtw',
        'monthly_claim_benefit',
        'service_cost'
    ]
};

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
        return console.dir(err);
    }

    db = new_db;

    connection = mysql.createConnection(testConfig.mysqlDsn);
    connection.connect(function (err) {
        if (err) {
            console.log('Error connecting to Db');
            console.log(err);
            return;
        }
        console.log('Connection established');

        LoadFromMysql.loadFromMysql(connection, spec, db)
                .then(function () {
                    console.log('done');
                    connection.end(function (err) { });
                    db.close();
                });
    });
});

