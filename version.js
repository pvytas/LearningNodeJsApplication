/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var p = {
  "name": "Bitnobi",
  "description": "Bitnobi build for Medical Confidence. Support for MySQL Polling Server.",
  "version": "0.2.3",
  "build-date": "Thursday March 18, 2018",
  "engines": {
    "node": "6.13.0",
    "npm": "3.10.10"
  }
 };

const version = '0.1.0';
const build_date = 'Wednesday December 6, 2017';
const name = 'Bitnobi';

var about_info = {};
about_info.name = p.name;
about_info.version = p.version;
about_info['build-date'] = p['build-date'];


console.log(about_info);

console.log(JSON.stringify(about_info));

/*
console.log ('version : ', version);
console.log ('build date :', build_date);
*/