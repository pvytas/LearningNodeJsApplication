/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , October 2019.
 */


const MongoClient = require('mongodb').MongoClient;


const mongoURL = 'mongodb://localhost';
const dbName = 'mean-dev';

const mongoClient = new MongoClient(mongoURL, { useNewUrlParser: true });

function getWorkflowResultSize (db, workflowID) {
    return new Promise((resolve, reject) => {
        let resultsetName = `result-${workflowID}`;
        // console.log (`getWorkflowResultSize() for ${resultsetName}`);

        db.collection(resultsetName, function (err, collection) {
            if (err) {
                console.log ('error: ', err);
                reject(err);
            } else if (collection) {
                collection.countDocuments ({}, function (err, result) {
                    // console.log (`count=${result}`);
                    resolve (result);
                })
            } else {
                console.log ('no collection for ' + resultsetName);
                reject('no result set');
            }
        })
    });
}



// Connect to the db
mongoClient.connect(function (err) {
    if (err) {
        console.log('Mongo client.connect error=', err);
        return(' ');
    }

    const db = mongoClient.db(dbName);

    db.collection('workflows').aggregate([
        {
            $lookup:
                {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
        }
    ]).toArray(async function (err, workflows) {
        if (err) throw err;

        for (let workflow of workflows) {
            let count = await getWorkflowResultSize (db, workflow._id);

            // console.log("workflow name=%s, ID=%s, count=%d, userName=%s, lastRun=%s",
            //     workflow.name,
            //     workflow._id,
            //     count,
            //     workflow.userDetails[0].username,
            //     workflow.started
            // );
            console.log("workflow name=%s, ID=%s, count=%d",
                workflow.name,
                workflow._id,
                count
            );
        }
        mongoClient.close();
    })
});


   
