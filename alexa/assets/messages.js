var AlexaSpeech = require('alexa-speech');

module.exports = {
  messages: {
    "WELCOME_MESSAGE": "Welcome to the GATE Quiz!",
    "MESSAGE_AFTER_WELCOME": "Please choose a topic to continue",
    "HELP_MESSAGE": "You can ask me to start a quiz on lists, heaps, sorting or even searching.",
    // See if we can inject the list of topics as random list of items
    "CHOOSE_TOPIC": "Choose a topic to start a quiz on. I can ask about heaps, lists, sorting or even searching.",
    "PLEASE_CHOOSE_A_TOPIC": "Please choose a topic",
    "EXIT_SKILL_MESSAGE": "Thank you for using GATE Quiz. Come back soon to learn more."
  },
  waiting_messages: [
    "Take your time. I'm not going anywhere.",
    "I'm right here, if you're wondering.",
    "The attempt is more important than the result.",
    "I'm going down for a power nap, wake me up when you're done."
  ],
  right_answers: [
    new AlexaSpeech.Speech()
      .interjection("Bam!")
      .add("your answer is correct. ").render(true),
    new AlexaSpeech.Speech()
      .interjection("Awesome!").render(true),
    new AlexaSpeech.Speech()
      .add("You're on fire today. ").render(true)
  ]
}
