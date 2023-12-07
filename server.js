const assert = require('assert');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const mongourl = 'mongodb+srv://s1316100:Laoha123321@cluster0.dsv5xag.mongodb.net/?retryWrites=true&w=majority'; 
const dbName = 'champion';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('cookie-session');
const SECRETKEY = 'cs381';

var usersinfo = new Array(
    {name: "user1", password: "cs381"},
    {name: "user2", password: "cs381"},
    {name: "user3", password: "cs381"}
);
var path = require('path');
var documents = {};
//Main Body
app.set('view engine', 'ejs');
app.use(session({
    userid: "session",  
    keys: [SECRETKEY],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));

const createDocument = function(db, createddocuments, callback){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("successfully connect mongodb");
        const db = client.db(dbName);

        db.collection('champion').insertOne(createddocuments, function(error, results){
            if(error){
                throw error
            };
            console.log(results);
            return callback();
        });
    });
}

const findDocument =  function(db, criteria, callback){
    let cursor = db.collection('champion').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray(function(err, docs){
        assert.equal(err, null);
        console.log(`findDocument: ${docs.length}`);
        return callback(docs);
    });
}

const handle_Find = function(res, criteria){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("successfully connect mongodb");
        const db = client.db(dbName);

        findDocument(db, criteria, function(docs){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('display', {nItems: docs.length, items: docs});
        });
    });
}

const handle_Edit = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("successfully connect mongodb");
        const db = client.db(dbName);

        let documentID = {};
        documentID['_id'] = ObjectID(criteria._id)
        let cursor = db.collection('champion').find(documentID);
        cursor.toArray(function(err,docs) {
            client.close();
            assert.equal(err,null);
            res.status(200).render('edit',{item: docs[0]});

        });
    });
}

const handle_Details = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("successfully connect mongodb");
        const db = client.db(dbName);

        let documentID = {};
        documentID['_id'] = ObjectID(criteria._id)
        findDocument(db, documentID, function(docs){ 
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('details', {item: docs[0]});
        });
    });
}

const updateDocument = function(criteria, updatedocument, callback){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("successfully connect mongodb");
        const db = client.db(dbName);
        console.log(criteria);
        console.log(updatedocument);

        db.collection('champion').updateOne(criteria,{
                $set: updatedocument
            }, function(err, results){
                client.close();
                assert.equal(err, null);
                return callback(results);
            }
        );
    });
}

const deleteDocument = function(db, criteria, callback){
console.log(criteria);
        db.collection('champion').deleteOne(criteria, function(err, results){
        assert.equal(err, null);
        console.log(results);
        return callback();
        });

};

app.get('/delete', function(req, res){
    res.render('delete'); // Render the delete.ejs page for the user to enter championID
});

app.get('/delete-champion', function(req, res){
    const championID = req.query.championID;
    const ownerID = req.session.userid;

    if(championID && ownerID){
        const client = new MongoClient(mongourl);
        client.connect(function(err) {
            console.log("successfully connect mongodb");
            const db = client.db(dbName);

            let criteria = {
                "_id": ObjectID(championID),
                "ownerID": ownerID
            };

            deleteDocument(db, criteria, function(results){
                client.close();
                console.log("close database");
                if (results.deletedCount > 0) {
                    return res.status(200).render('info', {message: "delete champion information already"});
                } else {
                    return res.status(200).render('info', {message: "Error - You can't delete the champion information"});
                }
            });
        });
    } else {
        return res.status(400).render('info', {message: "Missing championID"});
    }
});

app.post('/delete', function(req, res){
    // Handle the form submission (delete logic) here
    const championID = req.body.championID;

    if (!championID) {
        return res.status(400).render('info', { message: "Champion ID is required for deletion." });
    }

    const client = new MongoClient(mongourl);

    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let criteria = {
            championID: championID,
            ownerID: req.session.userid
        };

        db.collection('champion').deleteOne(criteria, function(err, result) {
            client.close();

            if (err) {
                console.error("Error deleting champion information:", err);
                return res.status(500).render('info', { message: "Error deleting champion information." });
            }

            if (result.deletedCount === 1) {
                console.log("Champion information deleted already");
                return res.render('info', { message: "Champion information deleted already" });
            } else {
                console.log("Caution: Champion information not found");
                return res.render('info', { message: "Caution: Champion information not found" });
            }
        });
    });
});


app.get('/', function(req, res){
    if (req.session.authenticated) {
        console.log("...Hello, welcome back");
        return res.redirect("/home");
    } else {
        console.log("...Not authenticated; directing to login");
        return res.redirect("/login");
    }
});

//login
app.get('/login', function(req, res){
    console.log("...Welcome to login page.")
    res.sendFile(__dirname + '/public/login.html');
    return res.status(200).render("login");
});

app.post('/login', function(req, res){
    console.log("...Handling your login request");
    for (var i=0; i<usersinfo.length; i++){
        if (usersinfo[i].name == req.body.username && usersinfo[i].password == req.body.password) {
        req.session.authenticated = true;
        req.session.userid = usersinfo[i].name;
        console.log(req.session.userid);
        return res.status(200).redirect("/home");
        }
    }
        console.log("Error username or password.");
        return res.redirect("/");
});

app.get('/logout', function(req, res){
    req.session = null;
    req.authenticated = false;
    res.redirect('/login');
});

app.get('/home', function(req, res){
    console.log("home");
    return res.status(200).render("home");
});

app.get('/list', function(req, res){
    console.log("list info");
    handle_Find(res,req.query.docs);
    
});

app.get('/find', function(req, res){
    return res.status(200).render("search");
});

app.post('/search', function(req, res){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("successfully connect mongodb");
        const db = client.db(dbName);
    
    var searchID={};
    searchID['championID'] = req.body.championID;
    
    if (searchID.championID){
    console.log("search champion");
    findDocument(db, searchID, function(docs){
            client.close();
            console.log("close connect");
            res.status(200).render('display', {nItems: docs.length, items: docs});
        });
    }
    else{
    console.log("Missing Champion ID");
    res.status(200).redirect('/find');
    }         
        });
});

app.get('/details', function(req,res){
    handle_Details(res, req.query);
});

app.get('/edit', function(req,res) {
    handle_Edit(res, req.query);
})

app.get('/create', function(req, res){
    return res.status(200).render("create");
});

app.post('/create', function(req, res){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("successfully connect mongodb!");
        const db = client.db(dbName);
        
        documents["_id"] = ObjectID;        
        documents["championID"] = req.body.championID;
        documents['name']= req.body.name;
        documents['role']= req.body.role;
        documents['abilities']= req.body.abilities;
        documents['difficulty']= req.body.difficulty;
        documents['description']= req.body.description;
        console.log("...putting data into documents");

        documents["ownerID"] = `${req.session.userid}`;
        
        if(documents.championID){
            console.log("...Creating the document");
            createDocument(db, documents, function(docs){
                client.close();
                console.log("Closed DB connection");
                return res.status(200).render('info', {message: "created campion"});
            });
        } else{
            client.close();
            console.log("Closed DB connection");
            return res.status(200).render('info', {message: "Invalid entry - Champion ID is compulsory!"});
        }
    });
    //client.close();
    //return res.status(200).render('info', {message: "Document created"}); 
});


app.post('/update', function(req, res){
    var updatedocument={};
    const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null, err);
            console.log("successfully connect mongodb");
            
                if(req.body.name){
                updatedocument["ownerID"] = `${req.session.userid}`
                updatedocument['name']= req.body.name;
                updatedocument['role']= req.body.role;
                updatedocument['abilities']= req.body.abilities;
                updatedocument['difficulty']= req.body.difficulty;
                updatedocument['description']= req.body.description;

                let updateDoc = {};
                updateDoc['championID'] = req.body.postId;
                console.log(updateDoc);

                updateDocument(updateDoc, updatedocument, function(docs) {
                    client.close();
                    console.log("close database");
                    return res.render('info', {message: "campion information updated"});
                    
                })
            }
            else{
                return res.render('info', {message: "Missing champion name"});
            }
    });
    
});

//Restful
//insert
app.post('/api/item/championtID/:championID', function(req,res) {
    if (req.params.championID) {
        console.log(req.body)
        const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null,err);
            console.log("successfully connect mongodb");
            const db = client.db(dbName);
            let newDocument = {};
            newDocument['championtID'] = req.body.championID;

        db.collection('champion').insertOne(newDocument, function(err,results){
                assert.equal(err,null);
                client.close()
                res.status(200).end()
                    });
          
                })
            }
        else {
        res.status(500).json({"error": "missing champion ID"});
    }
})

//find
app.get('/api/item/championID/:championID', function(req,res) {
    if (req.params.championID) {
        let criteria = {};
        criteria['championID'] = req.params.championID;
        const client = new MongoClient(mongourl);
        client.connect(function(err) {
            assert.equal(null, err);
            console.log("successfully connect mongodb");
            const db = client.db(dbName);

            findDocument(db, criteria, function(docs){
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing champion id"});
    }
})

//delete
app.delete('/api/item/championID/:championID', function(req,res){
    if (req.params.championID) {
        let criteria = {};
        criteria['championID'] = req.params.championID;
        const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null, err);
            console.log("successfully connect mongodb");
            const db = client.db(dbName);

            db.collection('champion').deleteMany(criteria, function(err,results) {
                assert.equal(err,null)
                client.close()
                res.status(200).end();
            })
        });
    } else {
        res.status(500).json({"error": "missing champion id"});       
    }
})

app.listen(app.listen(process.env.PORT || 8099));
