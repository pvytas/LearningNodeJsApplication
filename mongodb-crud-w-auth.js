/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * connects to mongodb database "test" using username "test".
 */

require('dotenv').config();

// Retrieve
var MongoClient = require('mongodb').MongoClient;

// compose the connection URL
let url = "mongodb://" +
    process.env.DATABASE_USER + ":" +
    process.env.DATABASE_PASSWORD + "@" +
    process.env.DATABASE_HOST + ":" +
    process.env.DATABASE_PORT + "/" +
    process.env.DATABASE_NAME;

console.log ("url="+url);

// Connect to the db
MongoClient.connect(url, function(err, db) {
  if(err) { return console.dir(err); }

  var collection = db.collection('test');
  
//  var doc1 = {'hello':'doc1'};
//  var doc2 = {'hello':'doc2'};
//  var lotsOfDocs = [{'hello':'doc3'}, {'hello':'doc4'}];
//  collection.insert(doc1);
//
//  collection.insert(doc2, {w:1}, function(err, result) {});
//
//  collection.insert(lotsOfDocs, {w:1}, function(err, result) {});

//   var nestedDocs = {'data': [{'hello':'doc5'}, {'hello':'doc6'} ]};
//   collection.insert(nestedDocs, {w:1}, function(err, result) {});
   
   var expectedOutput1 = [ 
  { data: {id: '1', column1: 'c2', column2: 'c3' },
    startDate: new Date(),
    endDate: new Date(9999, 5, 24, 11, 33, 30, 0) },

  { data: { id: '2', column1: 'c6', column2: 'c7' },
    startDate: new Date(),
    endDate: new Date(9999, 5, 24, 11, 33, 30, 0)  },

  { data: { id: '3', column1: 'c10', column2: 'c11' },
    startDate: new Date(),
    endDate: new Date(9999, 5, 24, 11, 33, 30, 0)  } 
    ];

    collection.insert(expectedOutput1, {w:1}, function(err, result) {
        console.log('result=\n%s\n', JSON.stringify(result));
        console.log('_id for record 0=%s\n', result.ops[0]._id.toString());

        var primaryKey = 'id';

        var row = { data: {id: '2', column1: 'update', column2: 'c7' },
        startDate: new Date(),
        endDate: new Date(9999, 5, 24, 11, 33, 30, 0) };
        console.log ('row=%s\n', row);

        var query = {};
        query['data.'.concat(primaryKey)] = row.data[primaryKey];
        query.endDate = new Date(9999, 5, 24, 11, 33, 30, 0);
        console.log ('query=%s\n', query);

        collection.update (query, {$set: {endDate: row.startDate}}, 
            function(err, result) {
                if (err) {
                    console.log(err.message);
                }
            });

        collection.insert(row, {w:1}, function(err, result) {
                if (err) {
                    console.log(err.message);
                }
                
                db.close();
        });

    });

});

console.log('done.');


