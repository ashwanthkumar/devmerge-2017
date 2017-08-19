'use strict'
var mongoose = require('mongoose');
var mongoose = require('./mongo');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  userId: { type: String, index: { unique: true } },
  attributes: {
    type: {
      endedSessionCount: Number,
      topic: String,
      correct: Number,
      skipped: Number,
      questions: Number
    }
  }
});

exports.User = mongoose.model('user', UserSchema);
