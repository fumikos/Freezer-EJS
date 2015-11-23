var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');

var router = express.Router();

var mongoose = require('mongoose');
var Freezer = mongoose.model('Freezer');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});



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
  	console.log(user);
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

  console.log(conditions);

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

	console.log(req.body);


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

  console.log(shelf);

  
  var conditions = {_id : req.body._id};
console.log(conditions);

  Freezer.update(conditions,{$push : {shelves : {"shelfname": shelfname, "racks" : []}}}, function(err,doc){

    console.log(doc);
  })




});


router.post('/add_rack', function(req, res, next) {

  console.log(req.body);
  var rackname = req.body.rackname
  var shelfname = req.body.rack.shelfname;
  var columns = req.body.rack.columns
  var rows = req.body.rack.rows

  var conditions = {_id : req.body._id};

  

  //Find index of shelf in freezer

  Freezer.find(conditions, 'shelves', function(err,shelves){
    
    var shelves = shelves[0].shelves;

    
    for(i = 0; i < shelves.length; i++){

      if (shelves[i].shelfname === shelfname){

        var shelfindex = i;

        console.log(shelfindex)

        //Add rack to shelf with shelfindex !!! DOES NOT WORK 11/22/15

        /*Freezer.update(conditions, {$push: {shelves[shelfindex].racks : "ALA MODE"}}, function (err, doc){

          console.log(doc);
        })*/




      }

    }

  })






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
