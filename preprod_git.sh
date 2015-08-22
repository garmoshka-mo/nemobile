#!/bin/bash
git push origin master:preprod -f
git branch -D preprod
git checkout preprod

