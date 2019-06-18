/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , August 2018.
 */


const MongoClient = require('mongodb').MongoClient;


const mongoURL = 'mongodb://localhost';
const dbName = 'mean-dev';

const mongoClient = new MongoClient(mongoURL, { useNewUrlParser: true });

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
    ]).toArray(function (err, workflows) {
        if (err) throw err;

        for (let workflow of workflows) {
            console.log("workflow name=%s, ID=%s, userName=%s, userID=%s",
                workflow.name,
                workflow._id,
                workflow.userDetails[0].username,
                workflow.user
            );
        }
        mongoClient.close();
    })
});


   
