const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator"); //use as a plugins having extra functionality on schema

const advertiserSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true},
  password: { type: String, required: true},
  username: {type: String, required: true},
  });

advertiserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Advertiser', advertiserSchema);//collection will be User
