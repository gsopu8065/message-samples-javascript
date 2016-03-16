'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:UserselectCtrl
 * @description
 * # UserselectCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('UserselectCtrl', function ($scope, authService, navService, $state, $uibModalInstance, items) {

  if (!authService.isAuthenticated) return $state.go('login');

  var channel;
  $scope.authService = authService;

  $scope.data = {
    users: [],
    selectCount: 0,
    channelState: items,
    search: '',
    searchError: null
  };

  if (items === 'existing') {
    // create an instance of channel given channel name and userId (if exists)
    channel = new Max.Channel({
      name: navService.currentChannel.name,
      userId: navService.currentChannel.userId
    });
  }

  // retrieve a list of users
  Max.User.search({userName: '*'}, 20, 0).success(function (users) {
    if (channel) {
      // get all the users subscribed to the channel
      channel.getAllSubscribers(100).success(function(subscribers) {
        var uids = getUIDs(subscribers);

        $scope.$apply(function() {
          for (var i=0;i<users.length;++i) {
            if (uids.indexOf(users[i].userId) == -1) {
              $scope.data.users.push(users[i]);
            }
          }
        });
      });
    } else {
      $scope.$apply(function () {
        $scope.data.users = users;
      });
    }
  });

  $scope.searchUsers = function() {
    $scope.data.users = [];
    $scope.data.searchError = $scope.data.search.trim().length < 2;
    if ($scope.data.search.trim().length < 2) return;

    // search for users based on username
    Max.User.search({userName: '*' + $scope.data.search + '*'}, 10, 0).success(function (users) {

      if (!users.length) return;

      if (channel) {
        // get all the users subscribed to the channel
        channel.getAllSubscribers(100).success(function(subscribers) {
          var uids = getUIDs(subscribers);

          $scope.$apply(function() {
            $scope.data.users = [];
            for (var i=0;i<users.length;++i) {
              if (uids.indexOf(users[i].userId) == -1) {
                $scope.data.users.push(users[i]);
              }
            }
          });
        });
      } else {
        $scope.$apply(function () {
        $scope.data.users = [];
          $scope.data.users = users;
        });
      }
    });
  };

  $scope.toggleSelection = function(user) {
    user.uiActive = user.uiActive ? false : true;
    if (user.uiActive) {
      $scope.data.selectCount += 1;
    } else {
      $scope.data.selectCount -= 1;
    }
  };

  $scope.startConversation = function() {
    var users = [];
    for (var key in $scope.data.users) {
      if ($scope.data.users[key].uiActive) {
        users.push($scope.data.users[key]);
      }
    }

    if (!users.length) return alert('no users selected');
    if (channel) return subscribeUsers(channel, users);

    // check if a channel already exists that contains the same users.
    // if so, just join the existing channel instead of creating a new one.
    var potentialSubscribers = angular.copy(users);
    potentialSubscribers.push(Max.getCurrentUser());
    Max.Channel.findChannelsBySubscribers(potentialSubscribers).success(function(channels) {

      var matchedChannel;

      for (var i=0;i<channels.length;++i) {
        if (!channels[i].isPublic) {
          matchedChannel = channels[i];
        }
      }

      if (matchedChannel) {
        $state.go('app.chat', {
          channelName: matchedChannel.name,
          userId: matchedChannel.userId
        });

        $uibModalInstance.close(users);

      } else {

        // no matching channel found, just create a new private channel
        var channelName = new Date().getTime();
        Max.Channel.create({
          name: channelName,
          summary: authService.currentUser.userName,
          isPublic: false,
          publishPermissions: 'subscribers'
        }).success(function(mmxPrivateChannel) {
          subscribeUsers(mmxPrivateChannel, users, true);
        });

      }
    });

  };

  function subscribeUsers(channel, users, isNew) {
    // subscribe the selected users to the private channel
    channel.addSubscribers(users).success(function() {

      if (isNew) {
        navService.list.refreshChannelList();
      } else if (navService.currentChannel) {
        navService.list.updateSubscribers(navService.currentChannel, users);
      }

      $state.go('app.chat', {
        channelName: channel.name,
        userId: channel.userId
      });

      $uibModalInstance.close(users);
    });
  }

  function getUIDs(users) {
    var uids = [];
    for (var i=0;i<users.length;++i) {
      uids.push(users[i].userId);
    }
    return uids;
  }

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

});
