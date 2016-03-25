var Chat = {

    sendMessage: function() {
        var inputs = collectFormData('feature-container');

        // register a listener to listen for incoming messages
        var listener = new Max.EventListener('myListener', {
            message: function(message) {

                // handle incoming messages
                updateResults('received message: <b>' + message.messageContent.myMessage + '</b><br />', true);
            }
        });
        Max.registerListener(listener);

        // find recipient using the userName provided
        var userNameList = [inputs.recipient];
        Max.User.getUsersByUserNames(userNameList).success(function(users) {

            // no users found, dont send the message
            if (!users.length) {
                updateResults('no users by that userName found');
                return;
            }

            // instantiate a new message object, passing in your custom message payload and a list of recipients
            var message = new Max.Message({
                myMessage: inputs.message
            }, users);

            updateResults('sending message... <br />');

            // send the message
            message.send().success(function() {

            }).error(function(e) {
                updateResults('ERROR! ' + e);
            });
        });
    },

    sendAttachment: function() {
        var inputs = collectFormData('feature-container');

        // register a listener to listen for incoming messages
        var listener = new Max.EventListener('myListener', {
            message: function(message) {

                // handle incoming messages
                updateResults('received message with attachment: <b>' +
                    message.messageContent.myMessage + '</b><br />', true);

                // insert attachment download url into an image tag
                if (message.attachments && message.attachments.length) {
                    updateResults('<img src="' + message.attachments[0].downloadUrl + '" /><br />', true);
                }
            }
        });
        Max.registerListener(listener);

        // find recipient using the userName provided
        var userNameList = [inputs.recipient];
        var files = $('#fileUpload').prop('files');
        Max.User.getUsersByUserNames(userNameList).success(function(users) {

            // no users found, dont send the message
            if (!users.length) {
                updateResults('no users by that userName found');
                return;
            }

            // instantiate a new message object, passing in your custom message payload,
            // a list of recipients, and an attachment
            var message = new Max.Message({
                myMessage: inputs.message
            }, users, files);

            updateResults('sending message... <br />');

            // send the message
            message.send().success(function() {

            }).error(function(e) {
                updateResults('ERROR! ' + e);
            });
        });
    },

    startReply: function() {
        var inputs = collectFormData('feature-container');

        // register a listener to listen for incoming messages
        var listener = new Max.EventListener('myListener', {
            message: function(message) {

                updateResults('received message: <b>' +
                    message.messageContent.myMessage + '</b><br />', true);

                // reply to any incoming messages automatically
                message.reply({
                    myMessage: inputs.message
                }).success(function() {

                    // reply to the recipient
                    updateResults('sent reply: <b>' + inputs.message + '</b> <br />', true);

                }).error(function(e) {
                    updateResults('ERROR! ' + e);
                });
            }
        });
        Max.registerListener(listener);
    }

};