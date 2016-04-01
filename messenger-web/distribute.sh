#/usr/bin/bash

# copy default app
rm -rf ./node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/default_app/package.json
rm -rf ./node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/default_app/main.js
rm -rf ./node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/default_app/index.html

# copy app
cp ./desktop/main.js ./node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/default_app
cp ./desktop/package.json ./node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/default_app
cp -r ./dist/* ./node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/default_app

# update executable
rm -rf ./node_modules/electron-prebuilt/dist/Electron.app/Contents/Info.plist
cp ./desktop/Info.plist ./node_modules/electron-prebuilt/dist/Electron.app/Contents

rm -rf ./node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/atom.icns
cp ./desktop/atom.icns ./node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/atom.icns

#sed -i -- 's/Electron/Magnet Messenger/g' ./node_modules/electron-prebuilt/dist/Electron.app/Contents/Info.plist
#sed -i -- 's/Electron/MagnetMessenger/g' ./node_modules/electron-prebuilt/dist/Electron.app/Contents/Frameworks/Electron\ Helper.app/Contents/Info.plist

mv ./node_modules/electron-prebuilt/dist/Electron.app ./node_modules/electron-prebuilt/dist/Magnet\ Messenger.app

#./node_modules/asar/bin/asar pack ./dist ./node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/app.asar

# package app
cd ./node_modules/electron-prebuilt/dist
zip -r ../../../../target/magnet-messenger-desktop-js-native.zip .
