

const express = require('express');
const app = express();



var i = 1;

function myLoop (res) {
    setTimeout(function () {
        console.log('sending batch %d', i);

        // var data = [
        //     {i: i, j: 1, data: 'test string'},
        //     {i: i, j: 2, data: 'test string'},
        //     {i: i, j: 3, data: 'test string'}
        // ];

        var data = {i: i, j: 1, data: 'test string'};

        res.write(JSON.stringify(data));

        if (i < 5) {
            myLoop(res);
        } else {
            console.log('sending end()');
            res.end();
        }

        i++;
    }, 2000)
}

function handleRequest(req, res) {
    console.log('received request.');
    res.setHeader("Content-Type", "application/json");
    i = 1;
    myLoop(res);

}

app.use('/', handleRequest);


var server = app.listen(3000);
console.log('Server running at http://localhost:3000/');

//module.exports = app;

app.set('server', server);


module.exports = app;