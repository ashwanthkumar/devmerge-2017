'use strict'

// use extractUserId(this.event) from a handler to extract userId
function extractUserId(event) {
  var userId;
  if (event.context) {
    userId = event.context.System.user.userId;
  } else if (event.session) {
    userId = event.session.user.userId;
  }
  return userId;
}

function pickRandom(items) {
  var item = items[Math.floor(Math.random()*items.length)];
  return item;
}

function standardizeTopic(topic) {
  switch(topic.toLowerCase()) {
    case "lists":
    case "linked list":
    case "list":
    case "linked lists":
    case "array list":
    case "connected list":
      return "linked list";

    case "stack":
    case "stacks":
      return "stack";

    default:
      return "NA";
  }
}

function standardizeAnswer(answer) {
  switch(answer.toLowerCase()) {
    case "e":
    case "eee":
      return "E";

    case "d":
    case "dee":
    case "d as in delta":
      return "D";

    case "c":
    case "see":
    case "c as in cat":
      return "C";

    case "b":
    case "bee":
    case "b as in ball":
    case "b as in bob":
      return "B";

    case "a":
    case "a as in apple":
      return "A";

    case "pass":
    case "move on":
    case "next":
    case "i don't know":
      return "pass";

    default:
      return "NA";
  }
}

function wrapWithEndOfSentence(phrase) {
  if (phrase.trim().endsWith(".")) return phrase + " ";
  else return phrase.trim() + ". ";
}

module.exports = {
  extractUserId: extractUserId,
  pickRandom: pickRandom,
  standardizeTopic: standardizeTopic,
  standardizeAnswer: standardizeAnswer,
  wrapWithEndOfSentence: wrapWithEndOfSentence
}
