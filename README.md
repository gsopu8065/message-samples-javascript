# Magnet Message JavaScript Sample Apps

Magnet Message is a powerful, open source mobile messaging framework enabling real-time user engagement for your mobile apps. Send relevant and targeted communications to customers or employees. These sample Android apps serve as introductory sample code - get familiar with our API, extend our samples and get coding today.

## [Get Started](getstarted)

A basic web app created to demonstrate how to create channels and send/receive messages.

### Instructions
1. Sign in at [Magnet Sandbox](https://sandbox.magnet.com).
2. Create an app, and copy the `Client Id` and `Client Secret`.
3. Place the keys into the `init` function in getstarted/index.html.
    ```
        Max.init({
            clientId: '<your client id>',
            clientSecret: '<your client secret>'
        });
    ```
4. Open getstarted/index.html in a web browser.
5. From the Sandbox, try sending some messages to the `GetStarted` channel. You should receive messages from your web page.


## [Kitchen Sink](kitchen-sink)

A basic web app created to showcase Magnet Message JS SDK APIs.

### Instructions
1. Sign in at [Magnet Sandbox](https://sandbox.magnet.com).
2. Create an app, and copy the `Client Id` and `Client Secret`.
3. Place the keys into the `init` function in kitchen-sink/index.html.
    ```
        Max.init({
            clientId: '<your client id>',
            clientSecret: '<your client secret>'
        });
    ```
4. Open kitchen-sink/index.html in a web browser.
5. The app will call several APIs from the SDK in succession and display them alongside the API.


## [Magnet Messenger - Desktop](messenger-desktop)

A full-featured chat app created with Magnet Message on top of the of [AngularJS](https://angularjs.org/). Demonstrates
how to create public and private channels, and invite/chat with members of the channels.

### Prerequisites

1. Install [Node.js](https://nodejs.org/).
2. Install [Grunt](http://gruntjs.com/).
3. Install [Bower](http://bower.io/).

### Installation

1. Navigate to the `messenger-desktop` directory from your command line.
2. Execute the command `npm install` to install build tool dependencies.
3. Execute the command `bower install` to install application dependencies.

### Instructions
1. Sign in at [Magnet Sandbox](https://sandbox.magnet.com).
2. Create an app, and copy the `Client Id` and `Client Secret`.
3. Place the keys into the `init` function in kitchen-sink/index.html.
    ```
        Max.init({
            clientId: '<your client id>',
            clientSecret: '<your client secret>'
        });
    ```
4. Navigate to the `messenger-desktop` directory from your command line.
5. Execute the command `grunt serve` to start a server to host the app.
6. Open `http://localhost:9000` in your web browser.
7. To start sending and receiving messages, register two new users from two different browsers. From the first browser, invite the
other user. You will now be able to communicate between the users through a chat screen.


## [Magnet Messenger - Ionic](messenger)

A basic chat app created with Magnet Message on top of the [Ionic](http://ionicframework.com/) framework. Demonstrates
how to create public and private channels, and invite/chat with members of the channels.

### Prerequisites

1. Install [Node.js](https://nodejs.org/).
2. Install [Ionic](http://ionicframework.com/).

### Instructions
1. Sign in at [Magnet Sandbox](https://sandbox.magnet.com).
2. Create an app, and copy the `Client Id` and `Client Secret`.
3. Place the keys into the `init` function in messenger/www/js/app.js.
    ```
        Max.init({
            clientId: '<your client id>',
            clientSecret: '<your client secret>'
        });
    ```
4. Navigate to the `messenger` directory from your command line.
5. Execute the command `ionic serve` to start a server to host the app.
6. Open `http://localhost:8100` in your web browser.
7. To start sending and receiving messages, register two new users from two different browsers. From the first browser, invite the
other user. You will now be able to communicate between the users through a chat screen.


## Feedback

We are constantly adding features and welcome feedback. 
Please, ask questions or file requests [here](https://github.com/magnetsystems/message-samples-android/issues).

## License

Licensed under the **[Apache License, Version 2.0] [license]** (the "License");
you may not use this software except in compliance with the License.

## Copyright

Copyright © 2016 Magnet Systems, Inc. All rights reserved.

[website]: http://www.magnet.com/
[techdoc]: https://www.magnet.com/documentation-home/
[license]: http://www.apache.org/licenses/LICENSE-2.0

