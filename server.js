var express = require('express');
var mongodb = require('mongodb');
var bodyparser = require('body-parser');
var assert = require('assert');
var multer = require('multer');
var engine = require('gridfs-storage-engine');

const FILES_COLLECTION = "fs.files";
// Connection Url
const MONGO_URL = 'mongodb://localhost:27017/wsdemo';

// Create express app
var app = express();
// Use body parser middleware
app.use(bodyparser.urlencoded({extended: true}));

// Create mongodb client
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;
// Gridfs storage engine
var storage = engine({ url: MONGO_URL });
// multer
var upload = multer({ storage: storage });

var db;
var bucket;

// Create a express router
var router = express.Router();

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
router.post('/', upload.single('file'), function(req, res, next) {
    res.status(201).json(req.file.gridfsEntry);
    next();
});

router.get('/download/:id', function(req, res) {
    db.collection(FILES_COLLECTION).findOne({ _id: new ObjectId(req.params.id) },
        function(err, doc) {
            assert.equal(null, err);
            res.setHeader('Content-disposition', 'attachment; filename=' + doc.filename);
            res.setHeader('Content-Type', 'application/octet-stream');
            bucket.openDownloadStream(new ObjectId(req.params.id)).pipe(res);
        });
});

// use router on /api
app.use('/api/v1', router);

// Connect
MongoClient.connect(MONGO_URL, function(err, database) {
    assert.equal(null, err);
    db = database;
    bucket = new mongodb.GridFSBucket(db);
    console.log("Connected to mongodb");

    // start listening
    app.listen(5000, function() {
        console.log("server listening on port 5000");
    });
});
