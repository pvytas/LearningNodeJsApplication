
var should = require('should'),
    request = require('supertest'),
    app = require('../server'),

    agent = request.agent(app);
    


describe('Server HTTP send via supertest.', function () {
    before(function (done) {
    setTimeout(function(){
      done();
    }, 500);
  });
  
    it ('try sending a get request.', function (done) {
        agent.get('/hello')
                .expect('Hello World')
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        
    });
    
//    it('should be able to save Workflow instance if logged in', function (done) {
//        agent.post('/auth/signin')
//        .send('Hello world.')
//        .expect(200)
//        .end(function (signinErr, signinRes) {
//            if (signinErr) {
//                console.log('Signin error: '+ signinErr);
//                done(signinErr);
//            }
//
//        }

   after(function(done){
        app.get('server').close (function() {
            console.log ('halting server.');
            done();
        });
       // setTimeout (function() { process.exit() }, 2000);

//        console.log ('halting server.');
//        process.exit();

    });
});