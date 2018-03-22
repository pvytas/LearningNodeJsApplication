/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const express = require('express');
const app = express();


function helloWorld(req, res) {
  console.log('received request.');
  res.status(200).send('Hello World');
};

app.use('/', helloWorld);


var server = app.listen(3000);
console.log('Server running at http://localhost:3000/');

//module.exports = app;

app.set('server', server);


module.exports = app;