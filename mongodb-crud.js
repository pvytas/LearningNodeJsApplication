/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
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
        var primaryKey = 'id';

        var row = { data: {id: '2', column1: 'update', column2: 'c7' },
        startDate: new Date(),
        endDate: new Date(9999, 5, 24, 11, 33, 30, 0) };
        console.log ('row=', row);

        var query = {};
        query['data.'.concat(primaryKey)] = row.data[primaryKey];
        query.endDate = new Date(9999, 5, 24, 11, 33, 30, 0);
        console.log ('query=', query);

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


