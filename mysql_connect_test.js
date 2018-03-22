/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mysql = require('mysql');


var connection = mysql.createConnection({
  host: '10.0.1.11',
  port: '3307',
  user: 'bitnobi',
  password: 'bitnobi',
  database: 'db_mediportal'
});


connection.connect(function (err) {
if(err){
    console.log('Error connecting to Db');
    console.log(err);
    return;
  }
  console.log('Connection established');
});

connection.query('SELECT * FROM rtw_reasons', function (err,rows) {
  if(err) throw err;

  console.log('Data received from Db:\n');
  console.log(rows);
});


connection.end (function (err) {
 
});



