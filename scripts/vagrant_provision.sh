#!/usr/bin/env bash

apt-get update

########################
#  Locales
########################

locale-gen UTF-8 en_US en_US.UTF-8 ru_RU ru_RU.UTF-8
echo "

export LC_CTYPE=en_US.UTF-8
export LC_ALL=en_US.UTF-8

" >> /home/vagrant/.bashrc

########################
#  Node modules
########################

npm install npm -g
npm install -g gulp


