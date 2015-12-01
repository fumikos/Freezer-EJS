var mongoose = require('mongoose');

var Slide_Box_100_Schema = new mongoose.Schema({
  boxname: String,
  rows: Number,
  columns: Number,
  spaces: [],
  author: String,
  date_created: { type: Date, default: Date.now }
}, { strict: false });


mongoose.model('slide_box_100', Slide_Box_100_Schema);





