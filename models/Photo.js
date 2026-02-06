const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// create schema
const PhotoSchema = new Schema({
  title: String,
  description: String,
  image: {
    type: String,
    default: ""   // ✅ default mutlaka type içinde
  },
  dateCreated:{
  type:Date,
  default:Date.now,
  },
});
const Photo = mongoose.model('Photo', PhotoSchema);
module.exports=Photo;

