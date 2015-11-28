var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');

var router = express.Router();

var mongoose = require('mongoose');
var Freezer = mongoose.model('Freezer');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var url = 'mongodb://localhost:27017/freezers';





/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Lab' });
});

// GET admin page. Need to build
/*router.get('/admin', function(req, res, next) {
  res.render('admin', { title: 'Administration' });
});*/


router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({message: 'Pending user approval'})
  });
});



router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
  	//console.log(user);
    if(err){ return next(err); }

    

    if(user.approved){
      
      return res.json({token: user.generateJWT()});
    } else {

      return res.status(401).json({message: 'Pending user approval'});
    }
  })(req, res, next);
});







router.get('/admin/users', auth, function(req, res, next) {

  

  if (req.payload.admin){

  User.find(function(err, users){
    if(err){ return next(err); }

    var user_list = [];

    for (i = 0; i < users.length; i++){

      user_list.push({"_id":users[i]._id, "username": users[i].username, "admin": users[i].admin, "approved": users[i].approved})

    };

    

    res.json(user_list);
  });

}
else{

  return res.status(401).json({message: 'Unauthorized'});

};
});




router.post('/admin/users', auth, function(req, res, next) {

if(req.payload.admin){


  


  var conditions = {_id : req.body._id};

  //console.log(conditions);

  var update = {$set : {

    admin : req.body.admin,
    approved: req.body.approved


  }};



 User.update(conditions, update, function(err, user){
    if(err){ return next(err); }

    

    res.json(user);

  });


}
else{

  return res.status(401).json({message: 'Unauthorized'});


};

});


router.post('/admin/delete_users', auth, function(req, res, next) {

if(req.payload.admin){

	//console.log(req.body);


  var query = {_id : req.body._id}


  
 
User.remove(query, function (err,removed) {
  if (err) return err;

  

  res.json(removed);
  
});

}
else{

  return res.status(401).json({message: 'Unauthorized'});


};

});






router.get('/freezers', auth, function(req, res, next) {

  

  
  Freezer.find(function(err, freezers){
    if(err){ return next(err); }

    console.log(freezers)

    console.log(JSON.stringify(freezers,null,2));

    res.json(freezers);
  });
});




 
//Create a new freezer
router.post('/freezers', auth, function(req, res, next) {
  var freezer = new Freezer(req.body);

  
  

  freezer.author = req.payload.username;

  freezer.save(function(err, freezer){
    if(err){ return next(err); }

    

    res.json(freezer);
  });
});

router.post('/add_shelf', function(req, res, next) {

  
  var shelf = req.body.shelf
  var shelfname = req.body.shelf.shelfname;
  var _id = req.body._id;

  var ObjectId = require('mongodb').ObjectID;




  var conditions = {"_id" : ObjectId(_id)} ;
  


//begin mongoclient.connect function
  MongoClient.connect(url, function (err, db) {

  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);
    

    // Add shelf object
  
    //Dynamically create a shelf field in "shelves" object
    var shelfObj = {};


    shelfObj["shelfname"] = shelfname;
    shelfObj["racks"] = {};

    var placeholder = ("shelves." + shelfname);
   

    var set = {};
    set[placeholder] = shelfObj;


    
    db.collection('freezers').update(conditions, {$set : set}, function (err,result){


      console.log("done");

      db.close();

    })


  };
  
    
    

    
  //end of mongoclient.connect function

  

  });


  




});


router.post('/add_rack', function(req, res, next) {

  console.log(req.body);

  var rackname = req.body.rack.rackname;
  var shelfname = req.body.rack.shelfname;
  var columns = req.body.rack.columns;
  var rows = req.body.rack.rows;

  var spaces = req.body.rack.spaces;

  //console.log(req.body.rack);

  var _id = req.body._id


  var ObjectId = require('mongodb').ObjectID;




  var conditions = {"_id" : ObjectId(_id)} ;

//console.log(conditions);






  //begin mongoclient.connect function
  MongoClient.connect(url, function (err, db) {

  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);
    

    // do some work here with the database.

 

    rackObj = {};

    console.log("rackname in rackobj: " + rackname);

    rackObj["rackname"] = rackname;

    rackObj["rows"] = rows;

    rackObj["columns"] = columns;

    rackObj["spaces"] = spaces;

    console.log(rackObj);


    var placeholder = ("shelves" + '.' + shelfname + '.' + "racks" + "." + rackname);

    console.log(placeholder);

    var set = {};

    set[placeholder] = rackObj;


   

    db.collection('freezers').update(conditions, {$set: set}, function (err,result){


      //console.log(JSON.stringify(result));

      db.close();

    })


  };
  
    
    

    
  //end of mongoclient.connect function

  

  });


  

});


























 router.post('/update_freezers', auth, function(req, res, next) {


 	


  var conditions = {_id : req.body._id};

  var update = {$set : {

  	freezername: req.body.freezername,
  	building : req.body.building,
  	floor : req.body.floor,
  	room : req.body.room


  }};



 Freezer.update(conditions, update, function(err, freezer){
    if(err){ return next(err); }

    

    res.json(freezer);

  });
});

 router.post('/delete_freezers', auth, function(req, res, next) {

 //var freezer = new Freezer(req.body);
 
 
 var query = {_id : req.body._id}


  
 
Freezer.remove(query, function (err,removed) {
  if (err) return err;

  

  res.json(removed);
  
});


});






module.exports = router;
