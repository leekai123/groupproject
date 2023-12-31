const art = require('assert');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const mongourl = 'mongodb+srv://s1316100:Laoha123321@cluster0.dsv5xag.mongodb.net/?retryWrites=true&w=majority'; 
const dbName = 'champion';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('cookie-session');
const KEY = 'cs381';

var usersinfo = new Array(
    {name: "user1", password: "cs381"},
    {name: "user2", password: "cs381"},
    {name: "user3", password: "cs381"}
);
var path = require('path');
var championsinfo = {};
//Main Body
app.set('view engine', 'ejs');
app.use(session({
    userid: "session",  
    keys: [KEY],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));

const createChampion = function(db, createdchampionsinfo, callback){
    const custor = new MongoClient(mongourl);
    custor.connect(function(err) {
        art.equal(null, err);
        console.log("successfully connect mongodb");
        const db = custor.db(dbName);

        db.collection('champion').insertOne(createdchampionsinfo, function(error, results){
            if(error){
                throw error
            };
            console.log(results);
            return callback();
        });
    });
}

const findChampion =  function(db, osct, callback){
    let cursor = db.collection('champion').find(osct);
    console.log(`findChampion: ${JSON.stringify(osct)}`);
    cursor.toArray(function(err, docs){
        art.equal(err, null);
        console.log(`findChampion: ${docs.length}`);
        return callback(docs);
    });
}

const execfind = function(res, osct){
    const custor = new MongoClient(mongourl);
    custor.connect(function(err) {
        art.equal(null, err);
        console.log("successfully connect mongodb");
        const db = custor.db(dbName);

        findChampion(db, osct, function(docs){
            custor.close();
            console.log("Closed DB connection");
            res.status(200).render('display', {nItems: docs.length, items: docs});
        });
    });
}

const execedit = function(res, osct) {
    const custor = new MongoClient(mongourl);
    custor.connect(function(err) {
        art.equal(null, err);
        console.log("successfully connect mongodb");
        const db = custor.db(dbName);

        let documentID = {};
        documentID['_id'] = ObjectID(osct._id)
        let cursor = db.collection('champion').find(documentID);
        cursor.toArray(function(err,docs) {
            custor.close();
            art.equal(err,null);
            res.status(200).render('edit',{item: docs[0]});

        });
    });
}

const execdetails = function(res, osct) {
    const custor = new MongoClient(mongourl);
    custor.connect(function(err) {
        art.equal(null, err);
        console.log("successfully connect mongodb");
        const db = custor.db(dbName);

        let documentID = {};
        documentID['_id'] = ObjectID(osct._id)
        findChampion(db, documentID, function(docs){ 
            custor.close();
            console.log("Closed DB connection");
            res.status(200).render('details', {item: docs[0]});
        });
    });
}

const updateChampion = function(osct, updatechampion, callback){
    const custor = new MongoClient(mongourl);
    custor.connect(function(err){
        art.equal(null, err);
        console.log("successfully connect mongodb");
        const db = custor.db(dbName);
        console.log(osct);
        console.log(updatechampion);

        db.collection('champion').updateOne(osct,{
                $set: updatechampion
            }, function(err, results){
                custor.close();
                art.equal(err, null);
                return callback(results);
            }
        );
    });
}

const deleteChampion = function(db, osct, callback){
console.log(osct);
        db.collection('champion').deleteOne(osct, function(err, results){
        art.equal(err, null);
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
        const custor = new MongoClient(mongourl);
        custor.connect(function(err) {
            console.log("successfully connect mongodb");
            const db = custor.db(dbName);

            let osct = {
                "_id": ObjectID(championID),
                "ownerID": ownerID
            };

            deleteChampion(db, osct, function(results){
                custor.close();
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

    const custor = new MongoClient(mongourl);

    custor.connect(function(err) {
        art.equal(null, err);
        console.log("Connected successfully to server");
        const db = custor.db(dbName);

        let osct = {
            championID: championID,
            ownerID: req.session.userid
        };

        db.collection('champion').deleteOne(osct, function(err, result) {
            custor.close();

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
    execfind(res,req.query.docs);
    
});

app.get('/find', function(req, res){
    return res.status(200).render("search");
});

app.post('/search', function(req, res){
    const custor = new MongoClient(mongourl);
    custor.connect(function(err){
        art.equal(null, err);
        console.log("successfully connect mongodb");
        const db = custor.db(dbName);
    
    var searchID={};
    searchID['championID'] = req.body.championID;
    
    if (searchID.championID){
    console.log("search champion");
    findChampion(db, searchID, function(docs){
            custor.close();
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
    execdetails(res, req.query);
});

app.get('/edit', function(req,res) {
    execedit(res, req.query);
})

app.get('/create', function(req, res){
    return res.status(200).render("create");
});

app.post('/create', function(req, res){
    const custor = new MongoClient(mongourl);
    custor.connect(function(err){
        art.equal(null, err);
        console.log("successfully connect mongodb!");
        const db = custor.db(dbName);
        
        championsinfo["_id"] = ObjectID;        
        championsinfo["championID"] = req.body.championID;
        championsinfo['name']= req.body.name;
        championsinfo['role']= req.body.role;
        championsinfo['abilities']= req.body.abilities;
        championsinfo['difficulty']= req.body.difficulty;
        championsinfo['description']= req.body.description;
        console.log("...putting data into championsinfo");

        championsinfo["ownerID"] = `${req.session.userid}`;
        
        if(championsinfo.championID){
            console.log("...Creating the document");
            createChampion(db, championsinfo, function(docs){
                custor.close();
                console.log("Closed DB connection");
                return res.status(200).render('info', {message: "created campion"});
            });
        } else{
            custor.close();
            console.log("Closed DB connection");
            return res.status(200).render('info', {message: "Invalid entry - Champion ID is compulsory!"});
        }
    });
});


app.post('/update', function(req, res){
    var updatechampion={};
    const custor = new MongoClient(mongourl);
        custor.connect(function(err){
            art.equal(null, err);
            console.log("successfully connect mongodb");
            
                if(req.body.name){
                updatechampion["ownerID"] = `${req.session.userid}`
                updatechampion['name']= req.body.name;
                updatechampion['role']= req.body.role;
                updatechampion['abilities']= req.body.abilities;
                updatechampion['difficulty']= req.body.difficulty;
                updatechampion['description']= req.body.description;

                let updateDoc = {};
                updateDoc['championID'] = req.body.postId;
                console.log(updateDoc);

                updateChampion(updateDoc, updatechampion, function(docs) {
                    custor.close();
                    console.log("close database");
                    return res.render('info', {message: "campion information updated"});
                    
                })
            }
            else{
                return res.render('info', {message: "Missing champion name"});
            }
    });
    
});

app.post('/api/item/championtID/:championID', function(req,res) {
    if (req.params.championID) {
        console.log(req.body)
        const custor = new MongoClient(mongourl);
        custor.connect(function(err){
            art.equal(null,err);
            console.log("successfully connect mongodb");
            const db = custor.db(dbName);
            let newChampion = {};
            newChampion['championtID'] = req.body.championID;

        db.collection('champion').insertOne(newChampion, function(err,results){
                art.equal(err,null);
                custor.close()
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
        let osct = {};
        osct['championID'] = req.params.championID;
        const custor = new MongoClient(mongourl);
        custor.connect(function(err) {
            art.equal(null, err);
            console.log("successfully connect mongodb");
            const db = custor.db(dbName);

            findChampion(db, osct, function(docs){
                custor.close();
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
        let osct = {};
        osct['championID'] = req.params.championID;
        const custor = new MongoClient(mongourl);
        custor.connect(function(err){
            art.equal(null, err);
            console.log("successfully connect mongodb");
            const db = custor.db(dbName);

            db.collection('champion').deleteMany(osct, function(err,results) {
                art.equal(err,null)
                custor.close()
                res.status(200).end();
            })
        });
    } else {
        res.status(500).json({"error": "missing champion id"});       
    }
})

app.listen(app.listen(process.env.PORT || 8099));
