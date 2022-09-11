"use strict"

const mongoose  = require('mongoose'),
      Schema    = mongoose.Schema;

let UserSchema = new Schema({
  email                : {type: String, required: false},
  username             : {type: String, required: false},
  password             : {type: String, required: false},
  phone_number         : {type: String, required: false},
  social_media_id      : {type: String, required: false},
  social_media_platform: {type: Number, required: false},
  role_id              : {type: Number, required: true, default: 2}, 
  status               : {type: Boolean, required: true, default: 0},  
  active               : {type: Number, required: true, default: true}
},{ timestamps : true });

module.exports = mongoose.model('User', UserSchema);

