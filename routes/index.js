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



module.exports = router;
