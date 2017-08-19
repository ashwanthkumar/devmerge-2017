'use strict'
var messages = require("./assets/messages")
var Alexa = require("alexa-sdk");
var AlexaSpeech = require('alexa-speech');

const APP_ID = 'amzn1.ask.skill.040101e2-9a96-4b38-95a0-30dc6f2093cf';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var states = {
    START: "_START",
    QUIZ: "_QUIZ"
};

var handlers = {
    'QuestionsIntent': function () {
      console.log(JSON.stringify(this));
      var topic = getTopic(this.event.request.intent.slots);
      this.response
        .speak("Starting the questions on " + topic)
        .listen("Please select a valid option as A, B, C or D. If you're not sure you can say Pass");
      this.emit(":responseReady");
    },
    'AnswerIntent': function() {
      console.log(JSON.stringify(this));
      var answer = getAnswer(this.event.request.intent.slots);
      var speech = new AlexaSpeech.Speech();
      speech.add("Selected Answer is ")
            .add(answer + ".")
            .pause(0.75)
            .interjection('Bam!')
            .add("your answer is correct. ")
            .add("Now moving onto the next question.")
      var text = speech.render(true);

      this.response.speak(text)
      this.emit(":responseReady")
    },
    'Unhandled': function() {
      this.emit("NotSure");
    },
    'AMAZON.CancelIntent': function() {
      this.response
        .speak('<say-as interpret-as="interjection">ta ta</say-as>')
      this.emit(":responseReady")
    },
    'AMAZON.StopIntent': function() {
      this.response
        .speak("Thank you for trying out GATE Quiz by Ashwanth Kumar. Have a nice day!")
      this.emit(":responseReady")
    },
    'AMAZON.HelpIntent': function() {
      this.response
        .speak('You can ask me to start a quiz on lists or heaps or trees');
      this.emit(":responseReady");
    },
    'NotSure': function() {
      this.response
        .speak("I didn't quite catch that")
        .listen('<say-as interpret-as="interjection">tick-tock!</say-as>. You can ask me to start a quiz on lists or heaps or trees');
      this.emit(":responseReady");
    }
};

function getTopic(slots) {
  for(var slot in slots) {
    if(slots[slot].name == "TOPIC") {
      return slots[slot].value;
    }
  }

  return "NA";
}

function getAnswer(slots) {
  for(var slot in slots) {
    if(slots[slot].name == "MCQ_ANSWER") {
      return slots[slot].value;
    }
  }

  return "NA";
}
