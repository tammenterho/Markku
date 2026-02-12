#!/bin/bash
set -e

echo "Deployment started ..."


# Make sure NVM is available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Stop current PM2 process
pm2 stop markku || true

# Pull the latest version of the app
git pull origin main
echo "New changes copied to server !"

# Installing client dependencies
cd /client
echo "Installing Dependencies..."
npm install

# Build 
echo "Building application"
npm run build

# Copying dist to /var/www/
echo "Copying dist to /var/www/markku/client"
sudo cp -r dist/* /var/www/markku/client

# Installing server dependencies
cd ../server
npm install

# Build server
echo "Building server"
npm run build

# Copying server dist to /var/www/
echo "Copying dist to /var/www/markku/server"
sudo cp -r dist/* package.json package-lock.json /var/www/markku/server

# Start PM2 process
cd /var/www/markku/server
npm run start:prod

echo "Deployment Finished!"