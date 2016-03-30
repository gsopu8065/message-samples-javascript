var Channel = {
    myCurrentChannel: null,

    create: function() {
        var inputs = collectFormData('feature-container');
        var tags = inputs.tags.length ? inputs.tags.split(' ') : [];

        // create a new channel
        Max.Channel.create({
            name: inputs.name,
            summary: inputs.summary,
            isPublic: inputs.isPublic,
            publishPermission: inputs.publishPermission
        }).success(function(myNewChannel) {

            renderResults('created new channel "' + myNewChannel.name + '"');

            if (tags.length) {
                // set tags for the newly created channel
                myNewChannel.setTags(tags).success(function() {

                    renderResults('assigned tags [' + tags.join(', ') + '] to channel "' + myNewChannel.name + '"', true);

                }).error(function(e) {
                    renderResults('ERROR! ' + e);
                });
            }

        }).error(function(e) {
            renderResults('ERROR! ' + e);
        });
    },

    getSubscriptions: function() {

        // get all channels the current user is subscribed to
        Max.Channel.getAllSubscriptions().success(function(channels) {

            renderResults(channelDisplayHelper(channels));
        });
    },

    getPublicChannels: function() {

        // get a list of all public channels
        var resultsPerPage = 100, offset = 0;
        Max.Channel.findPublicChannels(null, resultsPerPage, offset).success(function(channels) {

            renderResults(channelDisplayHelper(channels));

        }).error(function(e) {
            renderResults('<div class="panel panel-default">ERROR! ' + e + '</div>');
        });
    },

    getPrivateChannels: function() {

        // get a list of all private channels the current user owns
        var resultsPerPage = 100, offset = 0;
        Max.Channel.findPrivateChannels(null, resultsPerPage, offset).success(function(channels) {

            renderResults(channelDisplayHelper(channels));

        }).error(function(e) {
            renderResults('<div class="panel panel-default">ERROR! ' + e + '</div>');
        });
    },

    findByName: function() {
        var inputs = collectFormData('feature-container');

        if (inputs.isPublic) {
            // find a single public channel by name
            Max.Channel.getPublicChannel(inputs.channelName).success(function(channel) {

                renderResults(channelDisplayHelper(channel));

            }).error(function(e) {
                renderResults('<div class="panel panel-default">ERROR! ' + e + '</div>');
            });
        } else {
            // find a single private channel by name
            Max.Channel.getPrivateChannel(inputs.channelName).success(function(channel) {

                renderResults(channelDisplayHelper(channel));

            }).error(function(e) {
                renderResults('<div class="panel panel-default">ERROR! ' + e + '</div>');
            });
        }
    },

    findByPrefix: function() {
        var inputs = collectFormData('feature-container');
        var resultsPerPage = 100, offset = 0;

        if (inputs.isPublic) {
            // find public channels using channel name prefix
            Max.Channel.findPublicChannels(inputs.channelPrefix, resultsPerPage, offset).success(function(channels) {

                renderResults(channelDisplayHelper(channels));

            }).error(function(e) {
                renderResults('<div class="panel panel-default">ERROR! ' + e + '</div>');
            });
        } else {
            // find private channels using channel name prefix. only returns private channels owned by the current user
            Max.Channel.findPrivateChannels(inputs.channelPrefix, resultsPerPage, offset).success(function(channels) {

                renderResults(channelDisplayHelper(channels));

            }).error(function(e) {
                renderResults('<div class="panel panel-default">ERROR! ' + e + '</div>');
            });
        }
    },

    findByTags: function() {
        var inputs = collectFormData('feature-container');
        var tags = inputs.tags.length ? inputs.tags.split(' ') : [];
        var resultsPerPage = 100, offset = 0;

        // find channels by tags associated with the channel
        Max.Channel.findByTags(tags, resultsPerPage, offset).success(function(channels) {

            renderResults(channelDisplayHelper(channels));

        }).error(function(e) {
            renderResults('<div class="panel panel-default">ERROR! ' + e + '</div>');
        });
    },

    goToChannel: function(e, channel) {
        e.preventDefault();

        renderTmpl('Channel-Chat', channel.name);

        Channel.myCurrentChannel = channel;

        // not subscribed to this channel, subscribe to it
        if (!Channel.myCurrentChannel.isSubscribed) {
            Channel.myCurrentChannel.subscribe();
        }

        // register a listener to listen for incoming messages
        var listener = new Max.EventListener('myListener', {

            // listen for incoming messages
            message: function(message) {

                // right now, lets only handle incoming messages published to the current channel
                if (message.channel.name == channel.name) {
                    renderResults(messageDisplayHelper(message), 'prepend');
                }
            }

        });
        Max.registerListener(listener);
    },

    publish: function() {
        var inputs = collectFormData('feature-container');

        // publish a message to the channel
        var channelMsg = new Max.Message({
            message: inputs.message
        });
        Channel.myCurrentChannel.publish(channelMsg).error(function(e) {
            renderResults('ERROR! ' + e);
        });
    },

    fetchMessages: function() {
        var startDate = new Date();
        startDate = startDate.setDate(startDate.getDate() - 1);
        var endDate = new Date();
        var resultsPerPage = 1000;
        var offset = 0;
        var ascending = false;

        // fetch all the messages posted in the last 24 hours
        Channel.myCurrentChannel.getMessages(startDate, endDate, resultsPerPage, offset, ascending).success(function(messages) {

            // render each of the messages returned
            renderResults(messageDisplayHelper(messages));

        }).error(function(e) {
            renderResults('ERROR! ' + e);
        });
    },

    getAllSubscribers: function() {
        var resultsPerPage = 1000;
        var offset = 0;

        // fetch all the users subscribed to the given channel
        Channel.myCurrentChannel.getAllSubscribers(resultsPerPage, offset).success(function(users) {

            // display each of the users returned
            renderResults(userDisplayHelper(users), null, '#subscriber-list');
        });
    },

    inviteUsers: function() {
        var inputs = collectFormData('feature-container');

        var invitees = [inputs.inviteUserName];
        Max.User.getUsersByUserNames(invitees).success(function(users) {

            // no users found, don't continue with invitation
            if (!users.length) {
                renderResults('<div class="panel panel-default">ERROR! no users by that userName found</div>', null, '#subscriber-list');
                return;
            }

            // invite users to the channel
            var comments = 'please join my channel!';
            Channel.myCurrentChannel.inviteUsers(users, comments).success(function() {

                renderResults('user "' + users[0].userName + '" has been invited to channel "'
                    + Channel.myCurrentChannel.name + '".', null, '#subscriber-list');
            });
        });

    },

    addSubscribers: function() {
        var inputs = collectFormData('feature-container');

        var invitees = [inputs.subscriberUserName];
        Max.User.getUsersByUserNames(invitees).success(function(users) {

            // no users found, don't continue subscribing the user
            if (!users.length) {
                renderResults('<div class="panel panel-default">ERROR! no users by that userName found</div>', null, '#subscriber-list');
                return;
            }

            // subscribe users to the channel
            Channel.myCurrentChannel.addSubscribers(users).success(function() {

                renderResults('<div class="panel panel-default">user "' + users[0].userName + '" has been subscribed to channel "'
                    + Channel.myCurrentChannel.name + '".</div>', null, '#subscriber-list');
            });
        });

    }

};
