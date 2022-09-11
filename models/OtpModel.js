"use strict"

const mongoose  = require('mongoose'),
      Schema    = mongoose.Schema,
      ObjectId       = Schema.ObjectId;

let OtpSchema = new Schema({
  user_id              : {type: ObjectId,  required: true },    
  otp                  : {type: Number, required: true}
},{ timestamps : true });

module.exports = mongoose.model('Otp', OtpSchema);