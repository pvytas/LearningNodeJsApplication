/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 * Each line should be prefixed with  * 
 */

var Q = require("q");


function action(title, timeout) {
    var deferred = Q.defer();
    
    console.log('  %s started with %s msec timeout', title, timeout.toString());
    setTimeout(function () {
        console.log('  %s completed.', title);
        deferred.resolve();
    }, timeout);
    
    return deferred.promise;
}


var actionOnArray = function(titles) {
  var deferred = Q.defer();

  var loop = function(index) {
    if (index >= titles.length) {
      deferred.resolve();
    } else {
      action(titles[index], 1000).then(function() {
        loop(index + 1);
      });
    }
  };

  loop(0); // Start!

  return deferred.promise;
};


actionOnArray(['step1', 'step2', 'step3']).then (function () {
            console.log ('array processing complete.');
});
