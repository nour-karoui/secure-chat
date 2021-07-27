const mongoose = require('mongoose'),
Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  messages: {
    type: String
  },
  usersChannels: {
    type: Array,
    default: ['Public-Main']
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
