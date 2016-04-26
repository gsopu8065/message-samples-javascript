'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:ChanneldetailsCtrl
 * @description
 * # ChanneldetailsCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('ChanneldetailsCtrl', function ($scope, authService, navService, $state, $uibModalInstance, channelService) {

  if (!authService.isAuthenticated) return $state.go('login');

  var channel;
  var fetchingActive = false;
  var recordOffset = 0;

  $scope.authService = authService;
  $scope.data = {
    users: [],
    fetchEndReached: false,
    isMuted: false
  };

  // get current user information
  $scope.data.currentUser = Max.getCurrentUser();

  // create an instance of channel given channel name and userId (if exists)
  channel = channelService.getChannel(navService.currentChannel.name, navService.currentChannel.userId);
  $scope.data.isMuted = channel.isMuted;

  $scope.updateMute = function(isMuted) {
    if (isMuted) {
      channel.mute();
    } else {
      channel.unmute();
    }
  };

  $scope.fetchUsers = function(offset, cb) {

    if (!offset) {
      $scope.data.fetchEndReached = false;
      recordOffset = 0;
      offset = 0;
    }

    // get all the users subscribed to the channel
    channel.getAllSubscribers(10, offset).success(function(subscribers) {

      if (!subscribers.length) {
        // no more users, set flag
        $scope.safeApply(function() {
          $scope.data.fetchEndReached = true;
        });
        return;
      }

      $scope.$apply(function() {
        $scope.data.users = $scope.data.users.concat(subscribers);
        $scope.data.isOwner = channel.isOwner();
        (cb || angular.noop)();
      });
    });

  };

  $scope.onUserScroll = function() {
    // if there are no more records to fetch, stop fetching upon scroll
    if ($scope.data.fetchEndReached) return;
    // don't check for records if records are currently being fetched
    if (fetchingActive) return;

    // infinite scroll of messages
    fetchingActive = true;

    var lastScrollHeight = document.getElementById('member-list').scrollHeight;
    recordOffset += 10;

    $scope.fetchUsers(recordOffset, function() {
      var viewScroll = document.getElementById('member-list');
      var currentScrollHeight = document.getElementById('member-list').scrollHeight;
      viewScroll.scrollTop = currentScrollHeight - lastScrollHeight;
      fetchingActive = false;
    });
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.fetchUsers();

});
