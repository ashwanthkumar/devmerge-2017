'use strict'

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/gatequiz');

exports.mongoose = mongoose;
