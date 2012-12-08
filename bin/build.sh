#!/usr/bin/env bash
mkdir ./build
cp -R ./css ./build/css
cp -R ./fons ./build/fonts
cp -R ./html ./build/html
cp -R ./js ./build/js
rm -rf ./build/js/tmpl/*.html
cp ./manifest.json ./build/manifest.json