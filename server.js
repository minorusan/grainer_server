// содежимое index.js
const MongoClient = require('mongodb').MongoClient;
const test = require('assert');
const express = require('express')
const app = express()
const port = process.env.PORT || 8080;
app.use(express.json()); // to support JSON-encoded bodies

const url = 'mongodb+srv://niceguyklim:0951737429aAA@cluster0-f7zsa.gcp.mongodb.net/test?retryWrites=true&w=majority';
// Database Name
const invalidAppkeyMessage = "Invalid app key"
const dbName = 'grainer';
const collectionName = 'level_indexes'
// Connect using MongoClient
MongoClient.connect(url, function (err, client) {
    // Use the admin database for the operation
    const adminDb = client.db(dbName).admin();
    const appKey = "729yfd8as97sdf9yw7894gf7ygbdfs79e67789wyfgyds";
    // List all the available databases
    const col = client.db(dbName).collection(collectionName);
    col.find({}).toArray(function (err, docs) {
        console.log("Connected to db. Docs count::" + docs.length);
    });


    app.put('/api/modifylvl/', (request, response) => {
        if (request.body.appKey != appKey) {
            response.statusCode = 500;
            response.send({message:invalidAppkeyMessage, content:""});
            return;
        }
        col.updateOne({
            levelID: request.body.levelID
        }, {
            $set: {
                minTurnsCount: request.body.minTurnsCount
            }
        }, function (err, result) {
            response.statusCode = err == null ? 200 : 400;
            var message = err == null ? "Set min turns count for levelID " + request.body.levelID + " to " + request.body.minTurnsCount : "Error updating levelID " + request.body.levelID
            response.send({message:message, content:""});
        });
    })

    app.put('/api/seeddb/', (request, response) => {
        console.log(request.body);
        if (request.body.appKey == appKey) {
            col.deleteMany({}, function (err, result) {
                if(err != null)
                {
                    console.log(err);
                    response.statusCode = 500;
                    response.send({message:invalidAppkeyMessage, content:""});
                    return;
                }
                var arr = [];
                for (var i = 0; i < request.body.lvlCount; i++) {
                    arr.push({
                        levelID: i,
                        minTurnsCount: 100
                    });
                }
                col.insertMany(arr, function (err, result) {
                    response.statusCode = err == null ? 200 : 400;
                    var message = err == null ? "Success reseting database" : "Error filling database";
                    response.send({message:message, content:""});
                });
            });

        } else {
            response.statusCode = 500;
            response.send({message:invalidAppkeyMessage, content:""});
        }
    })

    app.put('/api/getitems/', (request, response) => {
        if (request.body.appKey != appKey) {
            response.statusCode = 500;
            response.send({message:invalidAppkeyMessage, content:""});
            return;
        }
        col.find({}).toArray(function (err, docs) {
            response.statusCode = err == null ? 200 : 400;
            var message = err == null ? "Success retrieving " + docs.length + " documents" : "Error retrieving documents";
            response.send({message:message, content:docs});
        });
    })

    app.listen(port, (err) => {
        if (err) {
            return console.log('something bad happened', err)
        }
        console.log(`server is listening on ${port}`)
    })
});