var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var mongoosePaginate = require('mongoose-paginate');

// Define our Mailing Users schema
var MailingUsersSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true }
});

//Add auto timestamping
MailingUsersSchema.plugin(timestamps);

//Add Pagination
mongoosePaginate(MailingUsersSchema);

// Export the Mongoose model
module.exports = mongoose.model('mailingusers', MailingUsersSchema);
