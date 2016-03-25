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

            updateResults('created new channel "' + myNewChannel.name + '"', true);

            if (tags.length) {
                // set tags for the newly created channel
                myNewChannel.setTags(tags).success(function() {

                    updateResults('assigned tags [' + tags.join(', ') + '] to channel "' + myNewChannel.name + '"');

                }).error(function(e) {
                    updateResults('ERROR! ' + e);
                });
            }

        }).error(function(e) {
            updateResults('ERROR! ' + e);
        });
    },

    getSubscriptions: function() {
        var html = '';

        // get all channels the current user is subscribed to
        Max.Channel.getAllSubscriptions().success(function(channels) {

            updateResults(channelDisplayHelper(channels));

        }).error(function(e) {
            updateResults('ERROR! ' + e);
        });
    },

    getPublicChannels: function() {
        var html = '';

        // get a list of all public channels
        var resultsPerPage = 100, offset = 0;
        Max.Channel.findPublicChannels(null, resultsPerPage, offset).success(function(channels) {

            updateResults(channelDisplayHelper(channels));

        }).error(function(e) {
            updateResults('ERROR! ' + e);
        });
    },

    getPrivateChannels: function() {
        var html = '';

        // get a list of all private channels the current user owns
        var resultsPerPage = 100, offset = 0;
        Max.Channel.findPrivateChannels(null, resultsPerPage, offset).success(function(channels) {

            updateResults(channelDisplayHelper(channels));

        }).error(function(e) {
            updateResults('ERROR! ' + e);
        });
    },

    findByName: function() {
        var inputs = collectFormData('feature-container');

        if (inputs.isPublic) {
            // find a single public channel by name
            Max.Channel.getPublicChannel(inputs.channelName).success(function(channel) {

                updateResults(channelDisplayHelper(channel));

            }).error(function(e) {
                updateResults('ERROR! ' + e);
            });
        } else {
            // find a single private channel by name
            Max.Channel.getPrivateChannel(inputs.channelName).success(function(channel) {

                updateResults(channelDisplayHelper(channel));

            }).error(function(e) {
                updateResults('ERROR! ' + e);
            });
        }
    },

    findByPrefix: function() {
        var inputs = collectFormData('feature-container'), html = '';
        var resultsPerPage = 100, offset = 0;

        if (inputs.isPublic) {
            // find public channels using channel name prefix
            Max.Channel.findPublicChannels(inputs.channelPrefix, resultsPerPage, offset).success(function(channels) {

                updateResults(channelDisplayHelper(channels));

            }).error(function(e) {
                updateResults('ERROR! ' + e);
            });
        } else {
            // find private channels using channel name prefix. only returns private channels owned by the current user
            Max.Channel.findPrivateChannels(inputs.channelPrefix, resultsPerPage, offset).success(function(channels) {

                updateResults(channelDisplayHelper(channels));

            }).error(function(e) {
                updateResults('ERROR! ' + e);
            });
        }
    },

    findByTags: function() {
        var inputs = collectFormData('feature-container'), html = '';
        var tags = inputs.tags.length ? inputs.tags.split(' ') : [];
        var resultsPerPage = 100, offset = 0;

        // find channels by tags associated with the channel
        Max.Channel.findByTags(tags, resultsPerPage, offset).success(function(channels) {

            updateResults(channelDisplayHelper(channels));

        }).error(function(e) {
            updateResults('ERROR! ' + e);
        });
    },

    goToChannel: function(e, channelName, channelOwnerId, channelIsPublic) {
        e.preventDefault();

        renderTmpl('Channel-Chat', channelName);

        if (channelIsPublic) {
            // get a public channel by channel name
            Max.Channel.getPublicChannel(channelName).success(function(channel) {
                Channel.myCurrentChannel = channel;

                // not subscribed to this channel, subscribe to it
                if (!Channel.myCurrentChannel.isSubscribed) {
                    Channel.myCurrentChannel.subscribe();
                }
            });
        } else {
            // get a private channel by channel name
            Max.Channel.getPrivateChannel(channelName).success(function(channel) {
                Channel.myCurrentChannel = channel;
                registerListener();
            });
        }

        // register a listener to listen for incoming messages and invites
        var listener = new Max.EventListener('myListener', {

            // listen for incoming messages
            message: function(message) {

                // right now, lets just handle incoming messages published to the current channel
                if (message.channel.name == channelName) {
                    updateResults('<b>' + message.sender.userName + '</b>: '
                        + message.messageContent.message + '<br />', 'prepend');
                }
            },

            // listen for incoming channel invitation requests from other users
            invite: function(invite) {
                // invitation has been received
                var comment = invite.comment;
                var sender = invite.sender;
                var channel = invite.channel;

                var confirmation = confirm('You have received an invitation to join the channel "'
                    + channel.name + '" ' + 'from user "' + sender.userName + '" with comment "' + comment + '".');

                if (confirmation) {
                    var acceptComment = 'sure, thank you!';
                    invite.accept(acceptComment).success(function() {
                        // invitation has been accepted. current user is now subscribed to the channel
                    });
                } else {
                    var declineComment = 'no thanks, im not interested';
                    invite.decline(declineComment).success(function() {
                        // invitation has been declined.
                    });
                }
            },

            // listen for incoming responses to channel invitations the current user has sent out
            inviteResponse: function(inviteResponse) {

                var user = inviteResponse.sender; // the invitation response sender
                var channel = inviteResponse.channel;
                var comments = inviteResponse.comments;
                var hasAcceptedInvite = inviteResponse.accepted; // true if invitee accepted

                alert('User "' + user.userName + '" has ' + (hasAcceptedInvite ? 'accepted' : 'declined') + ' the' +
                    ' invitation to channel "' + channel.name + '" with comment "'+comments+'".');
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
        Channel.myCurrentChannel.publish(channelMsg);
    },

    fetchMessages: function() {
        var html = '';

        var startDate = new Date();
        startDate = startDate.setDate(startDate.getDate() - 1);
        var endDate = new Date();
        var resultsPerPage = 1000;
        var offset = 0;
        var ascending = false;

        // fetch all the messages posted in the last 24 hours
        Channel.myCurrentChannel.getMessages(startDate, endDate, resultsPerPage, offset, ascending).success(function(messages) {

            // render each of the messages returned
            for (var i=0;i<messages.length;++i) {
                html += '<b>' + messages[i].sender.userName + '</b>: '
                    + messages[i].messageContent.message + '<br />';
            }

            updateResults(html);

        }).error(function(err) {
            // handle error
        });
    },

    getAllSubscribers: function() {
        var html = '';
        var resultsPerPage = 1000;
        var offset = 0;

        // fetch all the users subscribed to the given channel
        Channel.myCurrentChannel.getAllSubscribers(resultsPerPage, offset).success(function(users) {

            // render each of the users returned
            for (var key in users) {
                html += '<li><b>' + users[key].userName + '</b> (id: ' + users[key].userId + ')' +  '</li>';
            }

            updateResults('<ul>' + html + '</ul>', null, '#subscriber-list');
        });
    },

    inviteUsers: function() {
        var inputs = collectFormData('feature-container'), html = '';

        var invitees = [inputs.userName];
        Max.User.getUsersByUserNames(invitees).success(function(users) {

            // no users found, dont continue with invitation
            if (!users.length) {
                updateResults('no users by that userName found', null, '#subscriber-list');
                return;
            }

            // invite users to the channel
            var comments = 'please join my channel!';
            Channel.myCurrentChannel.inviteUsers(users, comments).success(function() {
                updateResults('user "' + users[0].userName + '" has been invited to channel "'
                    + Channel.myCurrentChannel.name + '".', null, '#subscriber-list');
            });
        });

    },

    addSubscribers: function() {
        var inputs = collectFormData('feature-container'), html = '';

        var invitees = [inputs.userName];
        Max.User.getUsersByUserNames(invitees).success(function(users) {

            // no users found, dont continue subscribing the user
            if (!users.length) {
                updateResults('no users by that userName found', null, '#subscriber-list');
                return;
            }

            // subscribe users to the channel
            Channel.myCurrentChannel.addSubscribers(users).success(function() {
                updateResults('user "' + users[0].userName + '" has been subscribed to channel "'
                    + Channel.myCurrentChannel.name + '".', null, '#subscriber-list');
            });
        });

    }

};
