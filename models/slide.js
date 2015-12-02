var mongoose = require('mongoose');


var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var Slide_Schema = new Schema({
  box_Id: ObjectId,
  sample_group_name: String,
  sample_group_number: Number,
  sample_name: String,
  slices_per_slide: Number,
  slice_spacing: Number,
  date_sectioned: { type: Date, default: Date.now },
  date_created: { type: Date, default: Date.now }
  author: String
}, { strict: true });


mongoose.model('slide', Slide_Schema);





