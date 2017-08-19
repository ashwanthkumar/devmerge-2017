'use strict'
var messages = require("./assets/messages").messages;
var waiting_messages = require("./assets/messages").waiting_messages;
var right_answers = require("./assets/messages").right_answers;
var wrong_answers = require("./assets/messages").wrong_answers;
var Alexa = require("alexa-sdk");
var AlexaSpeech = require('alexa-speech');
var mongoose = require('./mongo');
var Utils = require('./utils');

var User = require('./models').User,
    Question = require('./models').Question;
var mongoAttributesHelper = require('./mongo_alexa_sdk_helper');

const APP_ID = 'amzn1.ask.skill.040101e2-9a96-4b38-95a0-30dc6f2093cf';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.dynamoDBTableName = 'this is required to trigger :saveState';
    alexa.attributesHelper = mongoAttributesHelper;
    alexa.saveBeforeResponse = true;
    alexa.registerHandlers(handlers, startHandlers, quizHandlers);
    alexa.execute();
};

var states = {
    START: "_START",
    QUIZ: "_QUIZ"
};

var handlers = {
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
    this.response
      .speak('<say-as interpret-as="interjection">ta ta</say-as>');
    this.emit(":responseReady");
    this.emit(":saveState", true);
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
    if (this.attributes.topic) {
      console.log("Existing topic found as " + this.attributes.topic + ", so moving to Quiz");
      this.handler.state = states.QUIZ;
      this.emitWithState("Quiz");
    } else {
      var speech = new AlexaSpeech.Speech();
      speech.add(messages.WELCOME_MESSAGE)
            .pause(0.5)
            .add(messages.MESSAGE_AFTER_WELCOME);
      var text = speech.render(true);

      this.response
        .speak(text)
        .listen(messages.HELP_MESSAGE);
      this.emit(":responseReady");
    }
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
    this.handler.state = '';
    this.emitWithState("SessionEndedRequest");
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
    Question.find({topic: topic}).count().then((count) => {
      this.attributes["topic"] = topic;
      this.attributes["correct"] = 0;
      this.attributes["wrong"] = 0;
      this.attributes["skipped"] = 0;
      this.attributes["questions"] = 0;
      this.attributes["endedSessionCount"] = 0;
      this.attributes["total_questions"] = count;
      this.emitWithState("AskQuestion");
    });
  },
  'AskQuestion': function() {
    console.log("AskQuestion in QUIZ");
    var topic = Utils.standardizeTopic(this.attributes["topic"]);
    var existingResponse = this.attributes["response"] || "";
    var questionNumber = this.attributes["questions"] + 1;
    if(questionNumber > this.attributes["total_questions"]) {
      delete this.attributes.topic;
      delete this.attributes.STATE;
      this.attributes["completed"] = true;
      User.findOneAndRemove({userId: Utils.extractUserId(this.event)});

      var speech = new AlexaSpeech.Speech();
      speech.add(existingResponse);

      speech.add("You've reached the end of the quiz. Your score is ")
        .add(this.attributes["correct"])
        .add(" out of ")
        .add(this.attributes["total_questions"])
        .add(". Thank you for using GATE Quiz. Have a nice day!");

      var text = speech.render(true);
      // delete the response so it doesn't follow across flows
      this.attributes["response"] = "";
      this.handler.state = states.START;
      this.emit(":tell", text);
      // we've completed the quiz
      return;
    }
    console.log("Starting to ask a question on " + topic);
    var speech = new AlexaSpeech.Speech();
    
    Question.findOne({topic: topic}).skip(questionNumber - 1).then((question, err) => {
      var questionText = question.text;
      console.log(questionText);

      speech.add(existingResponse)
            .add("This is your question - Q")
            .add(questionNumber)
            .add(". ")
            .add(questionText)
            .pause(0.5)
            .add(". Your Options are ");
            // .add("Your options are A, B, C or D. If you're not sure you can say Pass.")
      question.options.forEach((option) => {
        console.log(option);
        speech.add(Utils.wrapWithEndOfSentence(option.label))
          .add(Utils.wrapWithEndOfSentence(option.text))
          .add(" ");
          if(option.is_correct) {
            this.attributes["answer"] = option.label;
          }
      });
      speech.add(" If you're not sure you can say Pass.").pause(5.0);
      var text = speech.render(true);
      // delete the response so it doesn't follow across flows
      this.attributes["response"] = "";
      this.response.shouldEndSession = false;
      this.emit(":askWithCard", text, Utils.pickRandom(waiting_messages), "Question " + questionNumber, "Question content");
    });
  },
  'AnswerIntent': function() {
    console.log("AnswerIntent in QUIZ");
    console.log(JSON.stringify(this));
    var answer = getAnswer(this.event.request.intent.slots);
    var speech = new AlexaSpeech.Speech();
    if (!answer || answer == "pass") {
      speech.add("Skipping to next question. ");
      this.attributes["skipped"]++;
    } else if(answer !== this.attributes["answer"]) {
      var expression = Utils.pickRandom(wrong_answers);
      speech.add("Selected Answer is ")
        .add(answer + ".")
        .pause(0.75)
        .add(expression)
        .add("Now moving onto the next question. ");
      this.attributes["wrong"]++;  
    } else {
      var expression = Utils.pickRandom(right_answers);
      speech.add("Selected Answer is ")
        .add(answer + ".")
        .pause(0.75)
        .add(expression)
        .add(" ")
        .add("Now moving onto the next question. ");
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
    this.handler.state = '';
    this.emitWithState("SessionEndedRequest");
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
      return Utils.standardizeTopic(slots[slot].value);
    }
  }

  return "NA";
}

function getAnswer(slots) {
  for(var slot in slots) {
    if(slots[slot].name == "MCQ_ANSWER") {
      return Utils.standardizeAnswer(slots[slot].value);
    }
  }

  return "NA";
}
