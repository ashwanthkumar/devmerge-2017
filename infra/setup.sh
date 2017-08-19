#!/bin/bash

## Set things up on the home folder
pushd ~/

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org htop
sudo service mongod start

## Setup NVM + Node + NPM for the app
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
source ~/.bashrc
nvm install v6.6.0
nvm alias default v6.6.0

## Setup CaddyServer for automatic HTTPS
mkdir caddy
pushd caddy
curl -L "https://caddyserver.com/download/linux/amd64?plugins=http.ratelimit" > caddy_v0.10.6_linux_amd64_custom.tar.gz
gunzip caddy_v0.10.6_linux_amd64_custom.tar.gz
tar xf caddy_v0.10.6.tar
chmod +x start_caddy.sh
sudo ./start_caddy.sh ## Starting it as sudo so we've 80 port access
popd

popd
