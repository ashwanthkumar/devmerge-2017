const express         = require('express');
const fs              = require('fs');
const bodyParser      = require('body-parser');
const context         = require('aws-lambda-mock-context');

var   skill           = require('./skill');
var   SERVER_PORT     = process.env.PORT || 8123;

const app = express();

app.use(bodyParser.json({ type: 'application/json' }));

// your service will be available on <YOUR_IP>/alexa
app.post('/alexa/', function (req, res) {
    var ctx = context();
    skill.handler(req.body,ctx);
    ctx.Promise
        .then(resp => {  return res.status(200).json(resp); })
        .catch(err => {
          console.log(err);
        })
});

app.listen(SERVER_PORT, function() {
  console.log('Alexa Skill service ready on :'+SERVER_PORT+". Be happy!");
});
