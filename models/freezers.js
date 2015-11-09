var mongoose = require('mongoose');

var FreezerSchema = new mongoose.Schema({
  freezername: String,
  building: String,
  floor: {type: String},
  room: {type: String},
  shelves: {type: String},
  racks: {type: String},
  author: String,
  date_created: { type: Date, default: Date.now }
});

mongoose.model('Freezer', FreezerSchema);





