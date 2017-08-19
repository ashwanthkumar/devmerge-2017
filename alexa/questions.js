'use strict'

var mongoose = require('./mongo');
var Question = require('./models').Question;

exports.addQuestion = function(req, res) {
  var payload = req.body;
  Question.findOneAndUpdate(
    {topic: payload.topic, text: payload.text},
    payload,
    {upsert: true, setDefaultsOnInsert: true},
    (err) => {
      if(err) {
        return res.status(500).json(err);  
      }
      return res.status(200).json("OK");
    }
  );
}

exports.getQuestions = function(req, res) {
  Question.find().exec().then((err, docs) => {
    if (!err) {
      return res.status(200).json(docs);
    } else {
      return res.status(500).json(err);
    }
  });
}
