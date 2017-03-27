const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const MessageSchema = mongoose.Schema({
  come         : {type: ObjectId, ref: 'Admin'},
  to           : {type: ObjectId, ref: 'Admin'},
  msg          : Object,
  create_time  : {type: Date, default: Date.now}
});

module.exports = mongoose.model('Message', MessageSchema);
