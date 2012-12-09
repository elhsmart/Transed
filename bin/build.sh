#!/usr/bin/env bash
mkdir ./../build
cp -R ./../css ./../build/css
cp -R ./../fonts ./../build/fonts
cp -R ./../html ./../build/html
cp -R ./../js ./../build/js
cp -R ./../images ./../build/images
rm -rf ./../build/js/tmpl/*.html
cp ./../manifest.json ./../build/manifest.json
cd ./../build/
zip -r build.zip *
cd ..
cp ./build/build.zip build.zip
rm -rf ./build/*
rm ./build
cd bin