/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mysql = require('mysql');
var stream = require('stream');
var testConfig = require('./testConfig');

var connection = mysql.createConnection(testConfig.mysqlDsn);


connection.connect(function (err) {
if(err){
    console.log('Error connecting to Db');
    console.log(err);
    return;
  }
  console.log('Connection established');
});

//connection.query('SELECT * FROM rtw_reasons', function (err,rows) {
//  if(err) throw err;
//
//  console.log('Data received from Db:\n');
//  console.log(rows);
//});

connection.query('SELECT * FROM `db_mediportal`.`rtw_reasons`;')
        .stream()
        .pipe(stream.Transform({
          objectMode: true,
          transform: function(data,encoding,callback) {
//            console.log(data);
            console.log (JSON.stringify(data));
            callback();
          }
         })
         .on('finish',function() { 
             console.log('done');
        }));


connection.end (function (err) {
 
});



