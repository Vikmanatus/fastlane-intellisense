#!/bin/bash

echo "Installing client dependencies..."
echo -e "\n"

cd ./src/client && yarn install

cd ..

echo -e "\n"

echo "Installing server dependencies..."
echo -e "\n"
cd ./server && yarn install

cd ../../
