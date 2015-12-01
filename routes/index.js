var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');

var router = express.Router();

var mongoose = require('mongoose');
var Freezer = mongoose.model('Freezer');
var slide_box_100 = mongoose.model('slide_box_100')
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

  

  
  Freezer.find({},function(err, freezers){
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


//Create a new slide box
router.post('/100_slide_box', auth, function(req, res, next) {
  var slide_box = new slide_box_100(req.body);

  
  

  slide_box_100.author = req.payload.username;

  freezer.save(function(err, freezer){
    if(err){ return next(err); }

    

    res.json(freezer);
  });
});













//add new shelf to freezer
router.post('/add_shelf', auth, function(req, res, next) {

  
  var shelf = req.body.shelf
  var shelf_name = req.body.shelf.shelf_name;
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


    shelfObj["shelf_name"] = shelf_name;
    shelfObj["racks"] = {};

    var placeholder = ("shelves." + shelf_name);
   

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


router.post('/add_rack', auth, function(req, res, next) {

  console.log(req.body);

  var rack = req.body.rack
  var rack_name = req.body.rack.rack_name;
  var shelf_name = req.body.rack.shelf_name;
  var row_count = req.body.rack.row_count;
  var column_count = req.body.rack.column_count;


  console.log("HERE IS THE RACK OBJECT")
  console.log(req.body.rack);

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




    var placeholder = ("shelves" + '.' + shelf_name + '.' + "racks" + "." + rack_name);

    //get rid of shelf_name property of rack
    delete rack.shelf_name;

    console.log("Here is the updated rack without shelf_name:");
    console.log(rack);

    var set = {};

    set[placeholder] = rack;


   

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
