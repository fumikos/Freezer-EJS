var mongoose = require('mongoose');

var FreezerSchema = new mongoose.Schema({
  freezername: String,
  building: String,
  floor: {type: String},
  room: {type: String},
  shelves: {},
  author: String,
  date_created: { type: Date, default: Date.now }
}, { strict: false });


mongoose.model('Freezer', FreezerSchema);





