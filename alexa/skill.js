'use strict'
var messages = require("./assets/messages").messages;
var Alexa = require("alexa-sdk");
var AlexaSpeech = require('alexa-speech');
var mongoose = require('./mongo');
var Utils = require('./utils');

var User = require('./models').User;

const APP_ID = 'amzn1.ask.skill.040101e2-9a96-4b38-95a0-30dc6f2093cf';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // alexa.dynamoDBTableName = 'this is required to trigger :saveState';
    alexa.registerHandlers(handlers, startHandlers, quizHandlers);
    alexa.execute();
};

var states = {
    START: "_START",
    QUIZ: "_QUIZ"
};

var handlers = {
  'NewSession': function() {
    console.log("NewSession @ Global");
    console.log(JSON.stringify(this));
    console.log("looking to see if we know " + Utils.extractUserId(this.event));
    User.findOne({ userId: Utils.extractUserId(this.event) }, (err, user) => {
      if (user) {
        console.log("Found user - " + user.userId);
        Object.assign(this.event.session.attributes, user.attributes);
        if (this.event.request.intent) {
          this.emit(this.event.request.intent.name);
        } else {
          this.emit(this.event.request.type);
        }
      } else {
        console.log("Some error -- " + err);
      }
    });
  },
  'LaunchRequest': function() {
    this.handler.state = states.START;
    this.emitWithState('Start');
   },
  'QuizIntent': function() {
    this.handler.state = states.QUIZ;
    this.emitWithState('Quiz');
  },
  'QuestionsIntent': function () {
    this.handler.state = states.QUIZ;
    this.emitWithState("TopicChoosen");
  },
  'AnswerIntent': function() {
    this.handler.state = states.QUIZ;
    this.emitWithState("Quiz");
  },
  'Unhandled': function() {
    this.emit("NotSure");
  },
  'AMAZON.CancelIntent': function() {
    this.emit(":saveState", () => {
      this.response
        .speak('<say-as interpret-as="interjection">ta ta</say-as>');
      this.emit(":responseReady");
    });
  },
  'AMAZON.StopIntent': function() {
    this.response
      .speak("Thank you for trying out GATE Quiz by Ashwanth. Have a nice day!")
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
  },
  'SessionEndedRequest': function () {
    this.emit('AMAZON.CancelIntent');
  },
  ':saveState': function(callback) {
    var userId = Utils.extractUserId(this.event);

    // save state only if we've a valid userId set
    if(userId && userId != '') {
      var user = new User();
      user.userId = userId;
      user.attributes = this.attributes;
      user.save((err) => {
        if(err) {
          return this.emit(':saveStateError', err);
        }
        console.log("state saved for " + userId + ", as " + JSON.stringify(user.attributes));
        // invoke the callback
        callback();
      });
    } else {
      console.log("skip saving state since userId is not set");
    }
  }
};

var startHandlers = Alexa.CreateStateHandler(states.START, {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'Start': function() {
    console.log("Start");
    console.log(JSON.stringify(this));
    var speech = new AlexaSpeech.Speech();
    speech.add(messages.WELCOME_MESSAGE)
          .pause(0.5)
          .add(messages.MESSAGE_AFTER_WELCOME);
    var text = speech.render(true);

    this.response
      .speak(text)
      .listen(messages.HELP_MESSAGE);
    this.emit(":responseReady");
  },
  'QuizIntent': function() {
    console.log("QuizIntent in START");
    console.log(JSON.stringify(this));
    this.handler.state = states.QUIZ;
    this.emitWithState("Quiz");
  },
  'AnswerIntent': function() {
    console.log(JSON.stringify(this));
    this.handler.state = states.QUIZ;
    this.emitWithState("Quiz");
  },
  'TopicIntent': function() {
    this.handler.state = states.QUIZ;
    this.emitWithState("TopicChoosen");
  },
  'AMAZON.CancelIntent': function() {
    console.log("AMAZON.CancelIntent in START");
    this.emit("AMAZON.CancelIntent");
  },
  'AMAZON.StopIntent': function() {
    this.emit("AMAZON.StopIntent");
  },
  'SessionEndedRequest': function() {
    this.emit("SessionEndedRequest");
  },
  "AMAZON.HelpIntent": function() {
    this.emit(":ask", messages.HELP_MESSAGE, messages.HELP_MESSAGE);
  },
  'Unhandled': function() {
    console.log("Unhandled at START")
    console.log(JSON.stringify(this));
    this.emitWithState("Start");
  }
});

var quizHandlers = Alexa.CreateStateHandler(states.QUIZ, {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'Quiz': function() {
    var topic = this.attributes["topic"];
    if (!topic) {
      this.response
        .speak(messages.CHOOSE_TOPIC)
        .listen(messages.PLEASE_CHOOSE_A_TOPIC);
      this.emit(":responseReady");
    } else {
      this.emit("AskQuestion");
    }
  },
  'TopicIntent': function() {
    console.log("TopicIntent in QUIZ");
    console.log(JSON.stringify(this));
    this.emitWithState("TopicChoosen");
  },
  'TopicChoosen': function() {
    var topic = getTopic(this.event.request.intent.slots);
    this.attributes["topic"] = topic;
    this.attributes["correct"] = 0;
    this.attributes["skipped"] = 0;
    this.attributes["questions"] = 0;
    this.attributes["endedSessionCount"] = 0;
    this.emitWithState("AskQuestion");
  },
  'AskQuestion': function() {
    console.log("AskQuestion in QUIZ");
    var topic = this.attributes["topic"];
    var questionNumber = this.attributes["questions"] + 1;
    console.log("Starting to ask a question on " + topic);
    var existingResponse = this.attributes["response"] || "";
    var speech = new AlexaSpeech.Speech();
    speech.add(existingResponse)
          .add("This is your question - Q")
          .add(questionNumber)
          .add(".")
          .pause(0.5)
          .add("Your valid options are A, B, C or D. If you're not sure you can say Pass.")
    var text = speech.render(true);
    // reset the response so it doesn't follow across dialogs
    this.attributes["response"] = "";
    this.response.shouldEndSession = false;
    this.emit(":askWithCard", text, "I'm still here waiting, if you're wondering.", "Question " + questionNumber, "Question content");
  },
  'AnswerIntent': function() {
    console.log("AnswerIntent in Global")
    console.log(JSON.stringify(this));
    var answer = getAnswer(this.event.request.intent.slots);
    var speech = new AlexaSpeech.Speech();
    if (!answer || answer == "pass") {
      speech.add("Skipping to next question. ");
      this.attributes["skipped"]++;
    } else {
      speech.add("Selected Answer is ")
        .add(answer + ".")
        .pause(0.75)
        .interjection('Bam!')
        .add("your answer is correct. ")
        .add("Now moving onto the next question. ")
      this.attributes["correct"]++;
    }
    var text = speech.render(true);
    this.attributes["questions"]++;

    this.attributes["response"] += text;
    this.handler.state = states.QUIZ;
    this.emitWithState("AskQuestion");
  },
  'AMAZON.CancelIntent': function() {
    console.log("AMAZON.CancelIntent in QUIZ");
    this.emit("AMAZON.CancelIntent");
  },
  'SessionEndedRequest': function() {
    this.emit("SessionEndedRequest");
  },
  'Unhandled': function() {
    console.log("Unhandled in Quiz")
    console.log(JSON.stringify(this));
    this.emitWithState("Quiz");
  }
});

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
