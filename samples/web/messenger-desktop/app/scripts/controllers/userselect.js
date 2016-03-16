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
  var fetchingActive = false;
  var recordOffset = 0;
  $scope.authService = authService;

  $scope.data = {
    users: [],
    selectCount: 0,
    channelState: items,
    search: '',
    searchError: null,
    selectedUsers: {},
    fetchEndReached: false
  };

  if (items === 'existing') {
    // create an instance of channel given channel name and userId (if exists)
    channel = new Max.Channel({
      name: navService.currentChannel.name,
      userId: navService.currentChannel.userId
    });
  }

  $scope.searchUsers = function(offset, cb) {

    if (!offset) {
      $scope.data.users = [];
      $scope.data.fetchEndReached = false;
      recordOffset = 0;
      offset = 0;
    }

    // search for users based on username
    Max.User.search({userName: '*' + $scope.data.search + '*'}, 10, offset).success(function (users) {

      if (!users.length) {
        // no more users, set flag
        $scope.safeApply(function() {
          $scope.data.fetchEndReached = true;
        });
        return;
      }

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
            (cb || angular.noop)();
          });
        });
      } else {
        $scope.$apply(function () {
          $scope.data.users = $scope.data.users.concat(users);
          (cb || angular.noop)();
        });
      }
    });
  };

  $scope.addUser = function(user) {
    $scope.data.selectCount += 1;
    $scope.data.selectedUsers[user.userId] = user;
  };

  $scope.removeUser = function(user) {
    $scope.data.selectCount -= 1;
    delete $scope.data.selectedUsers[user.userId];
  };

  $scope.startConversation = function() {
    var users = [];
    for (var key in $scope.data.selectedUsers) {
      users.push($scope.data.selectedUsers[key]);
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

  $scope.onUserScroll = function() {
    // if there are no more records to fetch, stop fetching upon scroll
    if ($scope.data.fetchEndReached) return;
    // don't check for records if records are currently being fetched
    if (fetchingActive) return;

    // infinite scroll of messages
    fetchingActive = true;

    var lastScrollHeight = document.getElementById('user-selection-list').scrollHeight;
    recordOffset += 10;

    $scope.searchUsers(recordOffset, function() {
      var viewScroll = document.getElementById('user-selection-list');
      var currentScrollHeight = document.getElementById('user-selection-list').scrollHeight;
      viewScroll.scrollTop = currentScrollHeight - lastScrollHeight;
      fetchingActive = false;
    });
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $scope.searchUsers();

});
