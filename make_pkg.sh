#/usr/bin/bash

### INIT ###
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

cd $SCRIPT_DIR

if [ -z ${1+x} ] || [ -z ${2+x} ]; then
	echo "Usage: $0 app_name app_version, e.g. $0 message-samples-javascript 1.0.0"
	exit 1
fi

APP_NAME=$1
APP_VERSION=$2
BUILD_NUMBER=$3

mkdir target

# zip the sample apps

cd getstarted
if [ -f js/libs/magnet-max-sdk.js ] ; then
	echo "found SDK, importing into howto app"
	sed -i -- 's/\/\/cdn.magnet.com\/downloads\/magnet-max-sdk.min.js/js\/libs\/magnet-max-sdk.js/g' app/index.html
fi
zip -r ../target/magnet-getstarted-js.zip .

cd ../kitchen-sink
zip -r ../target/magnet-kitchensink-js.zip .

cd ../howto
zip -r ../target/magnet-howto-js.zip .

cd ../messenger/www
zip -r ../../target/magnet-messenger-mobileweb-js.zip .

cd ../../messenger-desktop

### sdk location update ##

if [ -f app/scripts/magnet-max-sdk.js ] ; then
	echo "found SDK, importing into messenger-desktop app"
	sed -i -- 's/\/\/cdn.magnet.com\/downloads\/magnet-max-sdk.min.js/scripts\/magnet-max-sdk.js/g' app/index.html
fi

npm install
bower install
grunt build
cd dist
zip -r ../../target/magnet-messenger-desktop-js-build.zip .