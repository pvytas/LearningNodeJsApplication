var request = require('request')
var username = 'admin'
var password = 'test1234'



// request.post (options, function (err, res, body) {
//     if (err) {
//         console.dir(err)
//         return
//     }
//     console.log ('headers', res.headers)
//     console.log ('status code', res.statusCode)
//     console.log (body)
// })


let setCookie;

request.post({
    url: 'http://localhost:8000/auth/signin',
    form: {username: 'admin', password: 'test1234'}
}, function (err, res, body) {
    if (err) {
        console.dir(err);
        return
    }
    console.log('headers', res.headers);
    setCookie = res.headers['set-cookie'];
    console.log('cookie=', setCookie);
    console.log('status code', res.statusCode);
    console.log(body);

    let cookieString = setCookie[setCookie.length - 1];
    console.log ('cookieString ', cookieString);
    let cookieArray = cookieString.split(';');
    console.log ('cookieArray ', cookieArray);
    let sessionCookie = cookieArray[0];
    console.log ('sessionCookie ', sessionCookie);


    request.get({
        url: 'http://localhost:8000/workflows',
        headers: {
            'Cookie': sessionCookie
        }
    }, function (err, res, body) {
        if (err) {
            console.dir(err);
            return
        }
        console.log('headers', res.headers);
        let cookie = res.headers['set-cookie'];
        console.log('cookie=', cookie);
        console.log('status code', res.statusCode);
        console.log(body);
    });
});








