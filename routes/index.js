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

    res.json(freezer);
  });
});

//Need to fix update_freezers post. Does not work (look in Mongoose documenation?)

 /*

 router.post('/update_freezers', function(req, res, next) {
  var freezer = new Freezer(req.body);

  console.log(req.body);

  console.log(req.body.floor);

  var query = { 'freezername': req.body.freezername };
  var update = { $set: {'floor': req.body.floor }};

  freezer.findOneAndUpdate(query, update, function(err, freezer){
    if(err){ return next(err); }

    res.json(freezer);

  });
});

*/




module.exports = router;
