'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:ChannellistCtrl
 * @description
 * # ChannellistCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('ChannellistCtrl', function ($scope, authService, navService, channelService, $state, Alerts, notify) {

    if (!authService.isAuthenticated) return $state.go('login');
    channelService.reset();

    $scope.data = {};
    $scope.data.developerWeekChannel = null;
    $scope.data.channelSummaries = channelService.channelSummaries;
    $scope.data.forums = channelService.forums;
    $scope.data.unreads = {};
    $scope.data.searchFilter = '';
    navService.list = $scope;

    navService.getUnreads(function(unreads) {
      $scope.data.unreads = unreads;
    });

    // register a listener to listen for messages and update the channel summaries
    var listener = new Max.EventListener('receivedMessageListener', function(mmxMessage) {

      if (mmxMessage.sender.userId != Max.getCurrentUser().userId) {
       Audio.onReceive();
      }

      if (mmxMessage.sender.userId != Max.getCurrentUser().userId
        && (!navService.currentChannel
        || (navService.currentChannel
        && (navService.currentChannel.name != mmxMessage.channel.name)
        || (navService.currentChannel.name == mmxMessage.channel.name && isHiddenSupported() && isPageHidden())))) {

        var title = mmxMessage.sender.displayName
          || authService.getDisplayName(mmxMessage.sender)
          || mmxMessage.sender.userName;

        notify.show(title, mmxMessage, getLatestMessage(mmxMessage));
      }

      var isExistingChannel = false;
      if (mmxMessage.channel
        && mmxMessage.channel.name
        && mmxMessage.channel.name != 'askMagnet'
        && !mmxMessage.channel.isPublic) {
        for (var i=0;i<$scope.data.channelSummaries.length;++i) {
          if ($scope.data.channelSummaries[i].channelName == mmxMessage.channel.name) {
            isExistingChannel = true;
            $scope.$apply(function() {
              $scope.data.channelSummaries[i].latestMsgTime = mmxMessage.timestamp;
              $scope.data.channelSummaries[i].latestMsgTimestamp = roundToThousand(mmxMessage.timestamp.getTime());
              $scope.data.channelSummaries[i].lastPublishedTime = Max.Utils.dateToISO8601(mmxMessage.timestamp);
              $scope.data.channelSummaries[i].latestMessage = getLatestMessage(mmxMessage);

              if (navService.currentChannel && mmxMessage.channel.name == navService.currentChannel.name) {
                $scope.clearUnread($scope.data.channelSummaries[i]);
              }

              sortChannelSummary();
            });
          }
        }
        if (!isExistingChannel) {
          $scope.refreshChannelList();
        }
      }
    });
    Max.registerListener(listener);

    $scope.refreshChannelList = function() {

      // retrieve all channels the current user is subscribed to
      Max.Channel.getAllSubscriptions().success(function(channels) {
        if (!channels.length) return;

        var supportedChannels = [];

        for (var i=0;i<channels.length;++i) {
          if (channels[i].name != 'askMagnet' && !channels[i].isPublic) {
            supportedChannels.push(channels[i]);
          }
        }

        $scope.data.channels = supportedChannels;

        // retrieve detailed channel information, including subscribers and past messages
        Max.Channel.getChannelSummary(supportedChannels, 10, 1).success(function(channelSummaries) {

          var ownerIds = [];
          for(var i = 0; i < channelSummaries.length; ++i) {
            ownerIds.push(channelSummaries[i].owner.userId);
          }

          Max.User.getUsersByUserIds(ownerIds).success(function(owners) {

            for(var i = 0; i < channelSummaries.length; ++i) {
              var subscriberNames = [];
              var chatPhotoUser = null;

              for (var j = 0; j < channelSummaries[i].subscribers.length; ++j) {
                if (channelSummaries[i].subscribers[j].userId != Max.getCurrentUser().userId) {
                  subscriberNames.push(authService.getDisplayName(channelSummaries[i].subscribers[j]));
                  chatPhotoUser = channelSummaries[i].subscribers[j];
                }
              }
              channelSummaries[i].subscriberNames = subscriberNames.length === 0
                ? authService.getDisplayName(Max.getCurrentUser()) : subscriberNames.join(', ');

              channelSummaries[i].owner = getUserById(owners, channelSummaries[i].owner.userId);
              channelSummaries[i].ownerId = channelSummaries[i].owner.userId;

              if (isDefaultName(channelSummaries[i].channel.summary, channelSummaries[i].owner.userName)) {
                channelSummaries[i].displayName = channelSummaries[i].subscriberNames;
              } else {
                channelSummaries[i].displayName = channelSummaries[i].channel.summary;
              }

              if (channelSummaries[i].messages
                && channelSummaries[i].messages[0]
                && channelSummaries[i].messages[0].messageContent) {
                channelSummaries[i].latestMessage = getLatestMessage(channelSummaries[i].messages[0]);
                channelSummaries[i].latestMsgTime = channelSummaries[i].messages[0].timestamp;
                channelSummaries[i].latestMsgTimestamp = roundToThousand(channelSummaries[i].messages[0].timestamp.getTime());
              }

              if (!chatPhotoUser) {
                chatPhotoUser = Max.getCurrentUser();
              }
              channelSummaries[i].chatPhoto = {
                url: chatPhotoUser.getAvatarUrl(),
                initials: authService.getInitials(chatPhotoUser)
              };

              channelService.channelSummaries.push(channelSummaries[i]);
            }

            $scope.$apply(function() {
              $scope.data.channelSummaries = channelSummaries;
              sortChannelSummary();
            });

          });

        });
      });
    };

    $scope.refreshForumList = function() {
      // get all the public channels
      Max.Channel.findPublicChannels(null, 1000).success(function(channels) {
          channelService.forums = channels;
      });
    };

    $scope.goToConversation = function(e, channel) {
      e.preventDefault();
      $state.go('app.chat', {
        channelName: channel.name,
        userId: '*'
      });
      // subscribe to the public channel if not already subscribed
      if (!channel.isSubscribed) {
        channel.subscribe();
      }
    };

    $scope.$watch(function() {
      return channelService.channelSummaries
    }, function(newVal) {
        if (typeof newVal !== 'undefined') {
            $scope.data.channelSummaries = channelService.channelSummaries;
        }
    });

    $scope.$watch(function() {
      return channelService.forums
    }, function(newVal) {
        if (typeof newVal !== 'undefined') {
            $scope.data.forums = channelService.forums;
        }
    });

    $scope.$watch(function () {
      return navService.currentChannel
    }, function(newVal) {
        if (typeof newVal !== 'undefined') {
          for (var i = 0; i < $scope.data.channelSummaries.length; ++i) {
            if (navService.currentChannel
              && navService.currentChannel.name
              && $scope.data.channelSummaries[i].channel.name == navService.currentChannel.name) {
              $scope.data.channelSummaries[i].isUnread = false;
            }
          }
        }
    });

    function getLatestMessage(mmxMessage) {
      var msg;
      if (mmxMessage.messageContent && mmxMessage.messageContent.message) msg = mmxMessage.messageContent.message;
      if (mmxMessage.attachments && mmxMessage.attachments.length) msg = 'a file was uploaded';
      if (mmxMessage.messageContent.type == 'location') msg = 'a location was posted';
      if (mmxMessage.payload && mmxMessage.payload.TYPE == Max.MessageType.POLL_IDENTIFIER) msg = 'a poll was created';
      if (mmxMessage.payload && mmxMessage.payload.TYPE == Max.MessageType.POLL_ANSWER) msg = 'a poll was updated';
      if (!msg) msg = 'a message was posted';
      return msg;
    }

    $scope.leaveConversation = function(channelSummary) {
      var channel = channelSummary.channel;

      Alerts.Confirm({
          title       : 'Leave This Chat?',
          description : 'Are you sure you wish to leave this chat room?'
      }, function() {
        // leave the channel by unsubscribing, then refresh the view
        channel.unsubscribe().success(function() {

          for (var i=0;i<$scope.data.channelSummaries.length;++i) {
            if ($scope.data.channelSummaries[i].channelName == channel.name) {
              $scope.$apply(function() {
                $scope.data.channelSummaries.splice(i, 1);
              });
              navService.currentChannel = null;
              break;
            }
          }
        })
      });
    };

    $scope.onLoadAttempt = function(channelSummary, state) {
      $scope.$apply(function() {
        channelSummary.showPhoto = state;
      });
    };

    $scope.updateSubscribers = function(channel, newUsers) {
      var subscriberNames = [];
      for (var i=0;i<$scope.data.channelSummaries.length;++i) {
        if (channel.name == $scope.data.channelSummaries[i].channelName) {

          $scope.data.channelSummaries[i].subscribers = $scope.data.channelSummaries[i].subscribers.concat(newUsers);
          for (var j = 0; j < $scope.data.channelSummaries[i].subscribers.length; ++j) {
            if ($scope.data.channelSummaries[i].subscribers[j].userId != Max.getCurrentUser().userId) {
              subscriberNames.push(authService.getDisplayName($scope.data.channelSummaries[i].subscribers[j]));
            }
          }

          $scope.$apply(function() {
            $scope.data.channelSummaries[i].subscriberNames = subscriberNames.join(', ');
          });
          break;
        }
      }
    };

    $scope.clearUnread = function(channelSummary) {
      if (channelSummary.latestMsgTimestamp) {
        $scope.data.unreads[channelSummary.channelName] = channelSummary.latestMsgTimestamp;
        navService.setUnreads($scope.data.unreads);
      }
    };

    function sortChannelSummary() {
      $scope.data.channelSummaries.sort(function(a, b) {
        return (a.lastPublishedTime > b.lastPublishedTime)
          ? 1 : ((b.lastPublishedTime > a.lastPublishedTime) ? -1 : 0);
      });
    }

    $scope.userFilter = function(channelSummary) {
      return channelSummary.subscriberNames.toLowerCase().indexOf($scope.data.searchFilter.toLowerCase()) != -1;
    };

    $scope.refreshChannelList();
    $scope.refreshForumList();

    function isHiddenSupported() {
      return typeof (document.hidden || document.msHidden || document.webkitHidden) != 'undefined';
    }

    function isPageHidden() {
      return document.hidden || document.msHidden || document.webkitHidden;
    }

    function isDefaultName(summary, ownerUsername) {
      return !summary || (summary && (
        summary.trim() == '' ||
        endsWith(summary, 'private chat') ||
        summary == '[CHAT KIT]' ||
        summary.toLowerCase() == ownerUsername.toLowerCase()));
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function getUserById(users, id) {
      var user;
      for (var i=0;i<users.length;++i) {
        if (users[i].userId == id) user = users[i];
      }
      return user;
    }

    function roundToThousand(num) {
      return Math.floor(num / 1000) * 1000;
    }

  });
