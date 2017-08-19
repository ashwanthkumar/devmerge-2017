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

module.exports = {
  extractUserId: extractUserId
}
