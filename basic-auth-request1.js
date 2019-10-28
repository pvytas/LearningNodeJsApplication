var request = require('request')
var username = 'admin'
var password = 'test1234'


/**
 * the following does not authenticate with Bitnobi's passport system.
 */


request.get('http://localhost:8000/workflows', function (err, res, body) {
    if (err) {
        console.dir(err)
        return
    }
    console.log ('headers', res.headers)
    console.log ('status code', res.statusCode)
    console.log (body)
}).auth(username, password, false);


