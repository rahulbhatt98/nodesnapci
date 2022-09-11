"use strict"

const mongoose  = require('mongoose'),
      Schema    = mongoose.Schema,
      ObjectId       = Schema.ObjectId;

let DeviceIdSchema = new Schema({
  user_id              : {type: ObjectId,  required: true },    
  device_id            : {type: String, required: true},
  device_type          : {type: Number, required: true}
},{ timestamps : true });

module.exports = mongoose.model('DeviceId', DeviceIdSchema);

