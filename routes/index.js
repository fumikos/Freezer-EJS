var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Freezer = mongoose.model('Freezer');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Lab' });
});





router.get('/freezers', function(req, res, next) {
  Freezer.find(function(err, freezers){
    if(err){ return next(err); }

    res.json(freezers);
  });
});

router.post('/freezers', function(req, res, next) {
  var freezer = new Freezer(req.body);
 

  freezer.save(function(err, freezer){
    if(err){ return next(err); }

    //console.log(freezer);

    res.json(freezer);
  });
});



 router.post('/update_freezers', function(req, res, next) {


 	


  var conditions = {_id : req.body._id};

  var update = {$set : {

  	freezername: req.body.freezername,
  	building : req.body.building,
  	floor : req.body.floor,
  	room : req.body.room,
  	shelves : req.body.shelves,
  	racks: req.body.racks


  }};



 Freezer.update(conditions, update, function(err, freezer){
    if(err){ return next(err); }

    

    res.json(freezer);

  });
});

 router.post('/delete_freezers', function(req, res, next) {

 //var freezer = new Freezer(req.body);
 
 console.log(req.body);
 console.log(req.body._id);
 var query = {_id : req.body._id}


  
 
Freezer.remove(query, function (err,removed) {
  if (err) return err;

  

  res.json(removed);
  
});


});






module.exports = router;
