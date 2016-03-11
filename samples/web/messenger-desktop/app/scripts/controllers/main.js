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

    $scope.updateAvatar = function(el) {
      var user = Max.getCurrentUser();

      // upload avatar for current user
      user.setAvatar(el.files[0]).success(function() {
        try {
          el.value = null;
        } catch(ex) { }
        if (el.value) {
          el.parentNode.replaceChild(el.cloneNode(true), el);
        }
        authService.currentUser = Max.getCurrentUser();
        // get avatar from url, appending timestamp to bust browser cache
        authService.userAvatar = authService.currentUser.getAvatarUrl()+'&'+new Date().getTime();

        $scope.safeApply(function() {
          $scope.authService.userAvatar = authService.userAvatar;
        });

      }).error(function(e) {
        alert(e);
      })
    };

    $scope.$watch(function () {
      return navService.currentChannel
    }, function(newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
          $scope.navService = navService;
        }
    });

    $scope.$watch(function () {
      return authService.userAvatar
    }, function(newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
          $scope.authService = authService;
        }
    });

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

  });
