var mongoose = require('mongoose');

var FreezerSchema = new mongoose.Schema({
  freezername: String,
  building: String,
  floor: {type: Number, default: 0},
  room: {type: Number, default: 0},
  shelves: {type: Number, default: 0},
  racks: {type: Number, default: 0}
});

mongoose.model('Freezer', FreezerSchema);





