# DevMerge 2017 Hackathon

## Problem Statement
Teaching assistent for helping you learn concepts in Computer Science.

## Solution
We plan to scrap the quiz data from [geeksforgeeks.org](http://www.geeksforgeeks.org/quiz-corner-gq/) and build a quiz skill on Alexa for the first cut.

- You can enter the quiz by saying "Alexa, start gate quiz"
- Alexa then would guide you through various usages on how to start the quiz (on various topics like heap, binary trees, graph, recursion, sorting etc.)

## Components
The repository is configured as follows

- `infra` - Contains infrastructure related scripts. Not to bring up but mostly to setup things. Currently this is hosted on DO by manually bringing up a droplet.
- `scrapper` - Contains a NodeJS script (`index.js`) to convert a given Quiz URL (from [geeksforgeeks.org](http://www.geeksforgeeks.org/quiz-corner-gq/)) to JSON with questions, options and the right answer. The scripts the output to STDOUT. We then load this into Mongo from which our alexa skill will read it.
- `alexa` - Contains the Alexa skill server that serves as the backend for the skill. It runs on port 8153 and serves it on `localhost:8153/alexa/`.

## License
https://www.apache.org/licenses/LICENSE-2.0
