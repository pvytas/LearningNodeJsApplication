/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


  var ZongJi = require('zongji');

  var zongji = new ZongJi({
//	host     : '130.63.218.35',
        host: '10.0.1.11',
        port: '3307',
	user     : 'zongji',
	password : 'zongji',
//        database: 'test_zongji'
//	insecureAuth: true,
//	debug: true
  });
  
  zongji.start({
	includeEvents: ['tablemap','writerows', 'updaterows', 'deleterows'],
        binlogName: 'mysql-bin.000001',
        binlogNextPos: 154,
//        includeSchema: {'test_zongji': true}
        includeSchema: {'db_mediportal': true}
        
  });
  
 zongji.on('error', function(error) {
	console.log("+++++ERROR+++++ ");
	console.log(error);
  });

  zongji.on('binlog', function(evt) {
	console.log("+++++Inside binlog event++++");
	evt.dump();
//        console.log ('event name: '+ evt.constructor.name);
//        console.log('Date: %s', new Date(evt.timestamp));
//        console.log('Next log position: %d', evt.nextPosition);
  });
  
  process.on('SIGINT', function() {
	console.log('Got SIGINT.');
	zongji.stop();
	process.exit();
  });
  
