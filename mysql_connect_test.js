/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mysql = require('mysql');
//const connection = mysql.createConnection({
//  host: '10.0.1.31',
//  user: 'pvytas',
//  password: 'eriglo2',
//  database: 'db_mediportal_2017_11_28'
//});

var connection = mysql.createConnection({
  host: '10.7.200.183',
  user: 'bitnobi',
  password: 'Bitnobi2017!',
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

connection.query('SELECT * FROM users', function (err,rows) {
  if(err) throw err;

  console.log('Data received from Db:\n');
  console.log(rows);
});


connection.end (function (err) {
 
});



