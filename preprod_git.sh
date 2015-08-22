#!/bin/bash
git push origin master:preprod -f
git branch -D preprod
sleep 1
git checkout preprod

