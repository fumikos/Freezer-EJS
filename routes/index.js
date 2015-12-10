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

  
  var shelf = req.body.shelf;
  var rack_spaces = req.body.shelf.rack_spaces;
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
  
    //Dynamically create a shelf field in "shelves" object array
    var shelfObj = {};


    shelfObj["shelf_name"] = shelf_name;
    shelfObj["racks"] = [];

    for(var i = 0; i < rack_spaces; i++){

      j = i+1;

      //rack_position set as j (i+1) to not confuse user (they usually don't know the first array index is '0')
      shelfObj["racks"][i] = {"rack_name" : "EMPTY", "rack_position" : j};


    };



    
    db.collection('freezers').update(conditions, {$push : {shelves: shelfObj} }, function (err,result){


      console.log("done");

      db.close();

    })


  };
  
    
    

    
  //end of mongoclient.connect function

  

  });


  




});


router.post('/add_rack', auth, function(req, res, next) {

  console.log("request rack: " + JSON.stringify(req.body.rack));

  var shelves = req.body.shelves
  var rack = req.body.rack
  var rack_name = req.body.rack.rack_name;
  var shelf_name = req.body.rack.shelf_name;
  var rack_position = req.body.rack.rack_position

  //delete row count and column count
  delete rack.row_count
  delete rack.column_count 
  delete rack.rack_position




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


    //get rid of shelf_name property of rack
    delete rack.shelf_name;


   console.log("RACK: " + JSON.stringify(rack));

    for(var i = 0; i < shelves.length; i ++){
      console.log(shelves[i]);

      if(shelves[i].shelf_name === shelf_name){


        var shelf_space = i;
        console.log("shelf space: " + shelf_space);

      }

    }

    var set = {}

    --rack_position;

    var placeholder = "shelves." + shelf_space + ".racks." + rack_position;

    set[placeholder] = rack;

    console.log("SET: " + JSON.stringify(set));
    

   
   //pick up here 12/02/2015

    db.collection('freezers').update(conditions, {$set : set}, function (err,result){


      //console.log(JSON.stringify(result));

      db.close();

    })
      }


  
  
    
    

    
  //end of mongoclient.connect function

  

  });


  

});










router.post('/add_box', auth, function(req, res, next) {


   console.log(req.body);


  var shelves = req.body.shelves





  var shelf_name = req.body.box.shelf_name;


  var rack_name = req.body.box.rack_name;
  var row_name = req.body.box.row_name;
  var column_name = req.body.box.column_name;



  //console.log(row_name,column_name)

  var box = req.body.box;

  var _id = req.body._id;

  box.spaces = [];




  var ObjectId = require('mongodb').ObjectID;

  var box_ID = new ObjectId;

  box["box_ID"] = box_ID;

  console.log(box);

  var conditions = {"_id" : ObjectId(_id)} ;

  for(var i = 0; i < shelves.length; i ++){
      

      if(shelves[i].shelf_name === shelf_name){


        var shelf_space = i;
        //console.log("shelf space: " + shelf_space);

        console.log("shelf_space: " + shelf_space);

        console.log("rack length: " + shelves[shelf_space].racks.length);



        for(var j = 0; j < shelves[shelf_space].racks.length; j++){
      

      if(shelves[shelf_space].racks[j].rack_name === rack_name){


        var rack_space = j;

        console.log("rack_space: " + rack_space);

        for(var k = 0; k < shelves[shelf_space].racks[rack_space].rows.length; k++){



          if(shelves[shelf_space].racks[rack_space].rows[k].row_name === row_name){

            var row_space = k;


            for(var l = 0; l < shelves[shelf_space].racks[rack_space].rows[row_space].columns.length; l++){



          if(shelves[shelf_space].racks[rack_space].rows[row_space].columns[l].column_name === column_name){

            var column_space = l;

            







          }
        }






          }
        }
        

      }

    }

      };

    }








  //begin mongoclient.connect function
  MongoClient.connect(url, function (err, db) {

  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);
    

      var set = {};

  

      var placeholder = ("shelves" + '.' + shelf_space + '.' + "racks" + "." + rack_space + "." + "rows" + "." + row_space + "." + "columns" + "." + column_space + "." + "box");

      console.log(placeholder);



    //get rid of shelf_name property of rack
    delete box.shelf_name;
    delete box.rack_name;
    delete box.row_name;
    delete box.column_name;

    



    

    set[placeholder] = box;


   

    db.collection('freezers').update(conditions, {$set: set}, function (err,result){


      //console.log(JSON.stringify(result));

      db.close();

    })

   


  };
  
    
    

    
  //end of mongoclient.connect function

  

  });


  

});



router.post('/add_slide', auth, function(req, res, next) {


   console.log(req.body);


  var shelves = req.body.shelves





  var shelf_name = req.body.box.shelf_name;


  var rack_name = req.body.box.rack_name;
  var row_name = req.body.box.row_name;
  var column_name = req.body.box.column_name;



  //console.log(row_name,column_name)

  var box = req.body.box;

  var _id = req.body._id;

  box.spaces = [];




  var ObjectId = require('mongodb').ObjectID;

  var box_ID = new ObjectId;

  box["box_ID"] = box_ID;

  console.log(box);

  var conditions = {"_id" : ObjectId(_id)} ;

  for(var i = 0; i < shelves.length; i ++){
      

      if(shelves[i].shelf_name === shelf_name){


        var shelf_space = i;
        //console.log("shelf space: " + shelf_space);

        console.log("shelf_space: " + shelf_space);

        console.log("rack length: " + shelves[shelf_space].racks.length);



        for(var j = 0; j < shelves[shelf_space].racks.length; j++){
      

      if(shelves[shelf_space].racks[j].rack_name === rack_name){


        var rack_space = j;

        console.log("rack_space: " + rack_space);

        for(var k = 0; k < shelves[shelf_space].racks[rack_space].rows.length; k++){



          if(shelves[shelf_space].racks[rack_space].rows[k].row_name === row_name){

            var row_space = k;


            for(var l = 0; l < shelves[shelf_space].racks[rack_space].rows[row_space].columns.length; l++){



          if(shelves[shelf_space].racks[rack_space].rows[row_space].columns[l].column_name === column_name){

            var column_space = l;

            







          }
        }






          }
        }
        

      }

    }

      };

    }








  //begin mongoclient.connect function
  MongoClient.connect(url, function (err, db) {

  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);
    

      var set = {};

  

      var placeholder = ("shelves" + '.' + shelf_space + '.' + "racks" + "." + rack_space + "." + "rows" + "." + row_space + "." + "columns" + "." + column_space + "." + "box");

      console.log(placeholder);



    //get rid of shelf_name property of rack
    delete box.shelf_name;
    delete box.rack_name;
    delete box.row_name;
    delete box.column_name;

    



    

    set[placeholder] = box;


   

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
