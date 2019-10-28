const request = require('request');

console.log('sending GET request.');

// waits until HTTP response is complete.
// request.get('http://localhost:3000/query', function(err, res, body) {
//     if (err) {
//         console.log('Error:'+JSON.stringify(err));
//     } else {
//         console.log(body);
//     }
// });


// using a writeable stream to consume chunks of data as they come in over HTTP.

const {Writable} = require('stream');

const myStream = new Writable({
    write(chunk, encoding, callback) {
        console.log(chunk.toString());
        callback();
    }
});


console.log('myStream.writableHighWaterMark=%d', myStream.writableHighWaterMark);

request.get('http://localhost:3000/query')
    .pipe(myStream)
    .on('finish', function () {
        console.log('Done downloading.')
    });

