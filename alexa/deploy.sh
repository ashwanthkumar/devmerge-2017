#!/bin/bash

rsync -avzrR --exclude 'node_modules' --progress . root@gatequiz.ashwanthkumar.in:~/alexa
#ssh root@gatequiz.ashwanthkumar.in "/bin/bash -c 'cd alexa; npm install; npm update'"
