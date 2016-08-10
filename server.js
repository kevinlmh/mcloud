var express = require('express');
var mongodb = require('mongodb');
var Grid = require('gridfs-stream');
var bodyparser = require('body-parser');
var assert = require('assert');

const FILES_COLLECTION = "fs.files";

// Create express app
var app = express();
// Use body parser middleware
app.use(bodyparser.urlencoded({extended: true}));

// Create mongodb client
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;
var db;
var bucket;
var gfs;

// Connection Url
var mongoUrl = 'mongodb://localhost:27017/mfiles';

// Create a express router
var router = express.Router();

// access allow origin hack
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// return all files
router.get('/', function(req, res) {
    db.collection(FILES_COLLECTION).find().toArray(function(err, docs) {
        assert.equal(null, err);
        res.status(200).json(docs);
    });
});

// return file with id
router.get('/:id', function(req, res) {
    db.collection(FILES_COLLECTION).findOne(
        { _id: new ObjectId(req.params.id) },
        function(err, doc) {
            assert.equal(null, err);
            res.status(200).json(doc);
        });
});

// upload new file
router.post('/', function(req, res) {

});

// download a file
router.get('/download/:id', function(req, res) {
    db.collection(FILES_COLLECTION).findOne({ _id: new ObjectId(req.params.id) },
        function(err, doc) {
            assert.equal(null, err);
            res.setHeader('Content-disposition', 'attachment; filename=' + doc.filename);
            res.setHeader('Content-Type', 'application/octet-stream');
            bucket.openDownloadStream(new ObjectId(req.params.id)).pipe(res);
            // gfs.createReadStream({ _id: new ObjectId(req.params.id) }).pipe(res);
        });
});

// use router on /api
app.use('/api/v1', router);

// Connect
MongoClient.connect(mongoUrl, function(err, database) {
    assert.equal(null, err);
    db = database;
    bucket = new mongodb.GridFSBucket(db);
    gfs = Grid(db, mongodb);
    console.log("Connected to mongodb");

    // start listening
    app.listen(5000, function() {
        console.log("server listening on port 5000");
    });
});
