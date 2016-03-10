'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:ChanneldetailsCtrl
 * @description
 * # ChanneldetailsCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('ChanneldetailsCtrl', function ($scope, authService, navService, $state, $uibModalInstance) {

  if (!authService.isAuthenticated) return $state.go('login');

  var channel;
  $scope.authService = authService;
  $scope.data = {
    users: []
  };

  // get current user information
  $scope.data.currentUser = Max.getCurrentUser();

  // create an instance of channel given channel name and userId (if exists)
  channel = new Max.Channel({
    name: navService.currentChannel.name,
    userId: navService.currentChannel.userId
  });

  // get all the users subscribed to the channel
  channel.getAllSubscribers(100).success(function(subscribers) {
    $scope.$apply(function() {
      $scope.data.users = subscribers;
      $scope.data.isOwner = channel.isOwner();
    });
  });

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

});
