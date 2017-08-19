'use strict'

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/gatequiz', {
  useMongoClient: true
});

module.exports = mongoose;
