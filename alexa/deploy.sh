#!/bin/bash

rsync -avzrR --exclude 'node_modules' --progress alexa/ root@gatequiz.ashwanthkumar.in:~/
ssh root@gatequiz.ashwanthkumar.in "cd alexa; npm install; npm update"
