'use strict'
var messages = require("./assets/messages").messages;
var Alexa = require("alexa-sdk");
var AlexaSpeech = require('alexa-speech');

const APP_ID = 'amzn1.ask.skill.040101e2-9a96-4b38-95a0-30dc6f2093cf';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers, startHandlers, quizHandlers);
    alexa.execute();
};

var states = {
    START: "_START",
    QUIZ: "_QUIZ"
};

var handlers = {
    "LaunchRequest": function() {
      this.handler.state = states.START;
      this.emitWithState("Start");
     },
    "QuizIntent": function() {
      console.log(JSON.stringify(this));
      this.handler.state = states.QUIZ;
      this.emitWithState("Quiz");
    },
    'QuestionsIntent': function () {
      console.log(JSON.stringify(this));
      var topic = getTopic(this.event.request.intent.slots);
      this.response
        .speak("Starting the questions on " + topic)
        .listen("Please select a valid option as A, B, C or D. If you're not sure you can say Pass");
      this.emit(":responseReady");
    },
    'AnswerIntent': function() {
      console.log("AnswerIntent in Global")
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

var startHandlers = Alexa.CreateStateHandler(states.START, {
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
    'TopicIntent': function() {
      console.log("TopicIntent in START");
      console.log(JSON.stringify(this));
      var topic = getTopic(this.event.request.intent.slots);
      this.attributes["topic"] = topic;
      this.attributes["correct"] = 0;
      this.attributes["questions"] = 0;
      this.handler.state = states.QUIZ;
      this.emitWithState("AskQuestion");
    },
    "AMAZON.StopIntent": function() {
      this.emit(":tell", messages.EXIT_SKILL_MESSAGE);
    },
    "AMAZON.CancelIntent": function() {
      this.emit(":tell", messages.EXIT_SKILL_MESSAGE);
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
      var topic = getTopic(this.event.request.intent.slots);
      this.attributes["topic"] = topic;
      this.attributes["correct"] = 0;
      this.attributes["questions"] = 0;
      this.handler.state = states.QUIZ;
      this.emitWithState("AskQuestion");
    },
    'AskQuestion': function() {
      console.log("AskQuestion in Global");
      var topic = this.attributes["topic"];
      var questionNumber = this.attributes["questions"] + 1;
      console.log("Starting to ask a question on " + topic);
      var speech = new AlexaSpeech.Speech();
      speech.add("This is your question - Q")
            .add(questionNumber)
            .add(".")
            .pause(0.5)
            .add("Your valid options are A, B, C or D. If you're not sure you can say Pass.")
      var text = speech.render(true);
      this.emit(":askWithCard", text, "I'm still here waiting, if you're wondering.", "Question " + questionNumber, "Question content");
    },
    'AnswerIntent': function() {
      console.log("AnswerIntent in Global")
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
      this.handler.state = states.QUIZ;
      this.emitWithState("AskQuestion")
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
