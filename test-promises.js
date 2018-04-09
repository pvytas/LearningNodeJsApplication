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


function action1() {
    return action('action1', 1000);
}
function action2() {
    return action('action2', 2000);
}
function action3() {
    return action('action3', 3000);
}


//console.log("executing sequence of 3 actions using Q.defer()");
//action1()
//        .then(action2)
//        .then(action3)
//        .then(function () {
//
//            console.log("\nexecuting actions in parallel using Q.all()");
//            Q.all([action1(), action2(), action3()])
//                    .done(function () {
//                        console.log('all actions complete.');
//                    },
//                            function () {
//                                console.log('rejected');
//                            });
//        });


console.log("executing actions in parallel using Q.all()");
Q.all([action1(), action2(), action3()])
        .then(function () {
            console.log('\nthen in sequence.');
        })
        .then(action1)
        .then(action2)
        .then(action3)
        .done(function () {
            console.log('\ncalling actionx directly.');
            action('actionx', 1000);
            console.log('\nall actions complete.');
        },
                function () {
                    console.log('rejected');
                });

