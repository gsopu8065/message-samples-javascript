'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('MainCtrl', function ($scope, authService, navService, $uibModal, Alerts) {

    $scope.navService = navService;
    $scope.authService = authService;

    $scope.logout = function() {
      Alerts.Confirm({
          title       : 'Sign Out?',
          description : 'Are you sure you wish to sign out?'
      }, function() {

        // logout user
        Max.User.logout();
        // logout redirect is handled by Max.on('not-authenticated') listener in app.js
        authService.isAuthenticated = false;
      });

    };

    $scope.authService = authService;
    $scope.navService = navService;

    $scope.createConversation = function() {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'InviteUsers.html',
        controller: 'UserselectCtrl',
        resolve: {
          items: function() {
            return 'new';
          }
        }
      });
    };

    $scope.inviteUsers = function() {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'InviteUsers.html',
        controller: 'UserselectCtrl',
        resolve: {
          items: function() {
            return 'existing';
          }
        }
      });
    };

    $scope.viewChannelDetails = function() {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'ChannelDetails.html',
        controller: 'ChanneldetailsCtrl'
      });
    };

    $scope.$watch(function () {
      return navService.currentChannel
    }, function(newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
          $scope.navService = navService;
        }
    });

  });
