var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var mongoosePaginate = require('mongoose-paginate');

// Define our Response schema
var ResponseSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    qsnr_id: { type: String, required: true },
    answers: [{ qstn_id: String, value: [String] }]
});

//Add auto timestamping
ResponseSchema.plugin(timestamps);

//Add Pagination
mongoosePaginate(ResponseSchema);

// Export the Mongoose model
module.exports = mongoose.model('responses', ResponseSchema);
