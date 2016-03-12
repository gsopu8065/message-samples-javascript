'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:ChannellistCtrl
 * @description
 * # ChannellistCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('ChannellistCtrl', function ($scope, authService, navService, channelService, $state, Alerts) {

    if (!authService.isAuthenticated) return $state.go('login');
    channelService.reset();

    $scope.data = {};
    $scope.data.developerWeekChannel = null;
    $scope.data.channelSummaries = channelService.channelSummaries;

    // register a listener to listen for messages and update the channel summaries
    var listener = new Max.MessageListener('receivedMessageListener', function(mmxMessage) {
      Audio.onReceive();

      var isExistingChannel = false;
      if (mmxMessage.channel && mmxMessage.channel.name) {
        for (var i=0;i<$scope.data.channelSummaries.length;++i) {
          if ($scope.data.channelSummaries[i].channelName == mmxMessage.channel.name) {
            isExistingChannel = true;
            $scope.$apply(function() {
              $scope.data.channelSummaries[i].latestMsgTime = mmxMessage.timestamp;
              $scope.data.channelSummaries[i].latestMessage = getLatestMessage(mmxMessage);
              if (!navService.currentChannel || mmxMessage.channel.name != navService.currentChannel.name) {
                $scope.data.channelSummaries[i].isUnread = true;
              }
            });
          }
        }
        if (!isExistingChannel) {
          refreshChannelList(mmxMessage.channel.name);
        }
      }
    });
    Max.registerListener(listener);

    function refreshChannelList(newChannelName) {

      // retrieve all channels the current user is subscribed to
      Max.Channel.getAllSubscriptions().success(function(channels) {
        if (!channels.length) return;

        $scope.data.channels = channels;

        // retrieve detailed channel information, including subscribers and past messages
        Max.Channel.getChannelSummary(channels, 5, 1).success(function(channelSummaries) {
          for(var i = 0; i < channelSummaries.length; ++i) {
            var subscriberNames = [];
            var chatPhotoUser = null;

            for (var j = 0; j < channelSummaries[i].subscribers.length; ++j) {
              if (channelSummaries[i].subscribers[j].userId != Max.getCurrentUser().userId) {
                subscriberNames.push(channelSummaries[i].subscribers[j].userName);
                chatPhotoUser = channelSummaries[i].subscribers[j];
              }
            }
            channelSummaries[i].subscriberNames = subscriberNames.length === 0
              ? Max.getCurrentUser().userName : subscriberNames.join(', ');
            channelSummaries[i].ownerId = channelSummaries[i].owner.userId;

            if (channelSummaries[i].messages
              && channelSummaries[i].messages[0]
              && channelSummaries[i].messages[0].messageContent) {
              channelSummaries[i].latestMessage = getLatestMessage(channelSummaries[i].messages[0]);
              channelSummaries[i].latestMsgTime = channelSummaries[i].messages[0].timestamp;
              if (newChannelName && channelSummaries[i].channel.name == newChannelName
                && newChannelName != navService.currentChannel.name) {
                channelSummaries[i].isUnread = true;
              }
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
          });
        });
      });
    }

    $scope.$watch(function() {
      return channelService.channelSummaries
    }, function(newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
            $scope.data.channelSummaries = channelService.channelSummaries;
        }
    });

    $scope.$watch(function () {
      return navService.currentChannel
    }, function(newVal, oldVal) {
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
      var msg = (mmxMessage.messageContent.message);
      if (mmxMessage.attachments && mmxMessage.attachments.length) msg = 'a file was uploaded';
      if (mmxMessage.messageContent.type == 'location') msg = 'a location was posted';
      return msg
    }

    //$scope.$on('$ionicView.leave', function() {
    //  // IMPORTANT: always make sure to unregister the listener when you leave the page
    //  Max.unregisterListener(listener);
    //});

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

    refreshChannelList();

  });
