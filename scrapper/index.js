'use strict'

if (process. argv. length <= 2) {
  console. log("Usage: " + __filename + " [geeksforgeeks_quiz_url]");
  process. exit(-1);
}

const cheerio = require('cheerio');
const request = require('request');

var url = process.argv[2];
// var url = "http://www.geeksforgeeks.org/data-structure-gq/linked-list-gq/";
request(url, function(err, response, body) {
  if (response) {
    const $ = cheerio.load(body);
    var quiz_id = parseInt($("[data-quizid]").attr("data-quizid"));
    // half because the page numbers appear both on top and bottom
    var totalPages = $("[data-pageid]").length / 2;
    var title = $("[id*=mtq_quiztitle] h2");
    if(title.length > 0) {
      title = title.text();
    }
    var totalQuestions = parseInt($("input[name=mtq_total_questions]").attr('value'));

    var questions = parseQuestions($, $(".mtq_question"))

    var quiz = {
      id: quiz_id,
      total_pages: totalPages,
      total_questions: totalQuestions,
      title: title,
      questions: questions
    }
    console.log(JSON.stringify(quiz, null, 0));
  }
});

function parseQuestions($, questions) {
  return questions.map(function(i, q) { return parseQuestion($, q); }).get();
}

function parseQuestion($, question) {
  var label = $(".mtq_question_label", question).text();
  var q_text = $(".mtq_question_text", question).html().trim();
  var explanation = $(".mtq_explanation-text", question).html();
  var choices = $("table.mtq_answer_table tr.mtq_clickable", question).map(function(i, e) {
    var isCorrect = $(".mtq_correct_marker", e).length > 0;
    var isWrong = !isCorrect;

    var option_text = $(".mtq_answer_text", e).text().trim();
    var option = $(".mtq_css_letter_button", e).text().trim();
    return {
      option: option,
      text: option_text,
      is_correct: isCorrect,
      is_wrong: isWrong
    }
  }).get();
  return {
    label: label,
    question: q_text,
    choices: choices,
    explanation: explanation
  };
}
