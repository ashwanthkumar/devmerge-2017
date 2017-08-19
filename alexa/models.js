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

var OptionsSchema = new Schema({
  label: {type: String},
  text: {type: String},
  is_correct: {type: Boolean}
})

var QuestionSchema = new Schema({
  topic: {type: String, index: true, lowercase: true },
  text: {type: String},
  explanation: {type: String},
  options: [OptionsSchema]
});

exports.User = mongoose.model('user', UserSchema);
exports.Question = mongoose.model('question', QuestionSchema);
