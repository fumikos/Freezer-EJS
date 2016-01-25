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





//return all freezers to the client
router.get('/freezers', auth, function(req, res, next) {

  

  
  Freezer.find({},function(err, freezers){
    if(err){ return next(err); }


    console.log(JSON.stringify(freezers,null,2));

    res.json(freezers);
  });
});



//search boxes for criteria

router.get('/search/', auth, function(req, res, next){

  var queries = ["group_name","subgroup_name","sample_name","slices_per_slide","slice_spacing","slice_thickness","date_sectioned","date_created","author","slide_number"];

  //array containing resulting documents
  var results = [];

 

  



MongoClient.connect(url, function (err, db) {

  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    //found object flag. Set to "false" and exit loop when match is found


    
    var counter = 0

    



    for(var i = 0; i < queries.length; i++){

      

    

      var query = {};

      var placeholder1 = queries[i];

      var placeholder2 = {};
  

      placeholder2[placeholder1] = req.query.query;


      query["spaces"] = {$elemMatch : placeholder2};


     
     
    //set cursor array to send results
    var cursor_array = [];

    var counter = queries.length;

    db.collection('boxes').find(query).toArray(function(err,documents){


    
      counter--;

      

      

      if(documents.length !== 0){

              
               //only return matching spaces array elements within matching document
              for (var i = 0; i < documents.length; i++){


                for(var k = 0; k < documents[i].spaces.length; k++){

                  
                  var current_query = req.query.query

                

                  for (var j = 0; j < queries.length; j++){

                    var key = queries[j];

                    if(documents[i]["spaces"][k][key] === current_query){

                      var item = documents[i]["spaces"][k]

                      item.box_ID = documents[i]._id

                      //console.log(item);
                      //console.log("break");
                      

                      cursor_array.push(item);
                     // cursor_array.push("break");
                      
                     

                      
                    };
                  
                  
                 
                  

                


                };

                
               

              }


      }


    }

      if(counter === 0){

      
        //Check for duplicate values
        var tmp_array = cursor_array.slice(0,1)

     

        var found = false;

        for (var i = 0; i < cursor_array.length; i++){

           console.log("break")



          
          found = false;

        

          for (var j = 0; j < tmp_array.length; j++){

            console.log("j: ",j)
            console.log(tmp_array[j])
            

            //convert objects into JSON to compare, otherwise it will compare by reference!!
            if(JSON.stringify(tmp_array[j]) === JSON.stringify(cursor_array[i])){

              var found = true;
              




            }

           

            if(j === tmp_array.length-1 && found === false){

           
            
              tmp_array.push(cursor_array[i])

            }
            



          }

        }
       
       
        res.json(tmp_array);

        db.close();
      }

    });



    





    










   };



  };

 

});



});








 //get contents of box and return to user as json object
router.get('/box_contents/', auth, function(req, res, next) {

 

  var ObjectId = require('mongodb').ObjectID;

  var boxID = ObjectId(req.query.box_ID);





  console.log("request received")

  console.log(boxID)
  


  var conditions = {"_id" : boxID};



  console.log(conditions);
  
   //begin mongoclient.connect function
  MongoClient.connect(url, function (err, db) {

  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);


    
    db.collection('boxes').findOne(conditions, function (err,result){

      if(err){

        console.log(err);

        db.close();
      }

      else{

        res.json(result);

       
        db.close();
      }
      

      

    })


  };
  
    
    

    
  

  

  });
  

  //end of mongoclient.connect function

  

  

  

  
  
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

      
      shelfObj["racks"][i] = {"rack_name" : "EMPTY"};


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
  var rack_index = req.body.rack.rack_index
  

  //delete row count, column count, rack_index
  delete rack.row_count
  delete rack.column_count 
  delete rack.rack_index
 




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

    

    var placeholder = "shelves." + shelf_space + ".racks." + rack_index;

    set[placeholder] = rack;

    console.log("SET: " + JSON.stringify(set));
    

   
  

    db.collection('freezers').update(conditions, {$set : set}, function (err,result){


      //console.log(JSON.stringify(result));

      db.close();

    })
      }


  
  
    
    

    
  //end of mongoclient.connect function

  

  });


  

});










router.post('/add_box', auth, function(req, res, next) {


   var ObjectId = require('mongodb').ObjectID;

   console.log(req.body);


  var shelves = req.body.shelves





  var shelf_name = req.body.box.shelf_name;


  var rack_name = req.body.box.rack_name;
  var row_name = req.body.box.row_name;
  var column_name = req.body.box.column_name;



  //console.log(row_name,column_name)

  var box = req.body.box;

  var _id = req.body._id;
  var conditions = {"_id" : ObjectId(_id)} ;






 

  var box_ID = new ObjectId;

  box["box_ID"] = box_ID;

  console.log(box);

 

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


      console.log(result);

      db.close();

    })

   


  };
  
    
    

    
 
  

  });

   //end of mongoclient.connect function



  

});



router.post('/add_sample', auth, function(req, res, next) {


//create sample from req.body
var sample = req.body.sample

//Assign author to sample based on token payload
sample.author = req.payload.username;



var ObjectId = require('mongodb').ObjectID;


var box_ID = new ObjectId(sample.box_ID);






var quantity = sample.quantity;
var start_space = parseInt(sample.start_space) - 1;


//assign create date to sample
var date = new Date();
var now = date.toString();
sample.date_created = now;



delete sample.quantity;
delete sample.box_ID;
delete sample.start_space;






var samples = [];



var conditions = {"_id" : box_ID} ;



for (var i = 0; i < quantity; i++){

  var temp_sample = {};

  //clone sample (so not passed by reference)
  temp_sample = JSON.parse(JSON.stringify(sample))

  temp_sample.slide_number = (i + 1).toString();

  

  samples.push(temp_sample);



};



var inserted_sample = {

  "box_Id": box_ID
};






  //begin mongoclient.connect function
  MongoClient.connect(url, function (err, db) {

  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    }

   

    //insert slides at designated start space
    db.collection('boxes').findOne(conditions, function (err,box){

      

      if(err){
        console.log(err)
        db.close();
      }
      else if (box) {

        //check if new start space has blank spaces between it and last slide, and if so fill those with 'EMPTY' value
        


        


        if(box.spaces){

          var box_length = box.spaces.length;

        };

        


      
        var spaces_update;

        //populate box.spaces with "EMPTY" if start_space is greater than current box array length
        if (start_space > (box_length - 1)){

          for (var j = box_length; j < start_space; j++){

            box.spaces[j] = "EMPTY";


          };

          //add samples array to box.spaces
          box.spaces = box.spaces.concat(samples);

          spaces_update = box.spaces;

        }

        
      //replace sample if necessary, i.e. if sample already exists in start space
      
      if (box.spaces[start_space]){

        for(var i = start_space; i < samples.length; i++){

          box.spaces[i] = samples[i];



        }

        spaces_update = box.spaces;

      }
      

      




  

      db.collection('boxes').update(conditions, {$set: {"spaces" : spaces_update}}, function (err,result){

        if(err){
          console.log(err)
          db.close()
        }

        else{
          console.log("success!");
          db.close();
        }


      });



        


    }

    else if (start_space === 0) {

      db.collection('boxes').insert({"_id" : box_ID, "spaces":samples}, function(err,result){

        if(err){
          console.log(err);
          db.close();
        }
        else{
          console.log("success!");
          db.close();
        }



      });


    }

    //prepend samples array with 'EMPTY' values
    else{

      for (var i = 0; i < start_space; i++){

        samples.unshift("EMPTY");

      }

    db.collection('boxes').insert({"_id" : box_ID, "spaces" : samples}, function (err,result){


      if(err){
        console.log(err);
      }

      else{
        console.log("success!");
        db.close();
      }



    })


    }

    
      

    });


  


  });

  //end mongoclient.connect function

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
