/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var callCount = 0;
var inspectionCount = 0;

// check heap memory usage periodically.
var used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`Initial heapUsed = ${used} MB`);
    
setInterval(function() { 
    inspectionCount++;
    console.log('inspectionCount:', inspectionCount, ' callCount:', callCount);
    
    used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`heapUsed = ${used} MB`);
    
}, 10000);


// use memory and then allow it to be garbage collected.    
setInterval(function() { 
    callCount++;
    let arr = Array(1e6).fill("some string");
    arr.reverse();
    
}, 100);
