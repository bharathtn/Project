var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var mongoosePaginate = require('mongoose-paginate');

// Define our Mailing List schema
var MailingListsSchema = new mongoose.Schema({
    name: String,
    user_id: { type: String, required: true },
    people: [String]
});

//Add auto timestamping
MailingListsSchema.plugin(timestamps);

//Add Pagination
mongoosePaginate(MailingListsSchema);

// Export the Mongoose model
module.exports = mongoose.model('mailinglists', MailingListsSchema);
