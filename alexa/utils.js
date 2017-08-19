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

module.exports = {
  extractUserId: extractUserId,
  pickRandom: pickRandom
}
