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

    if (!authService.isAuthenticated) return;

    $scope.navService = navService;
    $scope.authService = authService;
    $scope.showDrawer = false;
    $scope.shownDeleteAvatar = false;

    $scope.data = {
      extras: authService.currentUser.extras || {}
    };

    Audio.enabled = (authService.currentUser.extras &&
      (authService.currentUser.extras.audioNotify === true || authService.currentUser.extras.audioNotify === 'true'));

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

    $scope.updateProfile = function() {
      if (!$scope.data.firstName.trim().length) return alert('first name is required');
      if (!$scope.data.lastName.trim().length) return alert('last name is required');
      if ($scope.data.password.trim().length && $scope.data.password != $scope.data.confirm)
        return alert('passwords don\'t match');

      var updatedUser = angular.merge(authService.currentUser, $scope.data);

      Max.User.updateProfile(updatedUser).success(function() {
        Alerts.Success({
            title       : 'Profile Updated',
            description : 'Your profile has been updated successfully.'
        }, function() {
          $scope.data.password = '';
          $scope.data.confirm = '';

          refreshUserData();
        });
      });
    };

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
      // upload avatar for current user
      Max.User.setAvatar(el.files[0]).success(function() {
        try {
          el.value = null;
        } catch(ex) { }
        if (el.value) {
          el.parentNode.replaceChild(el.cloneNode(true), el);
        }
        refreshUserData(true);

      }).error(function(e) {
        alert(e);
      })
    };

    $scope.deleteAvatar = function() {
      // delete avatar of the current user
      Max.User.deleteAvatar().success(function() {

        refreshUserData(true);
      });
    };

    $scope.showDeleteAvatar = function() {
      $scope.shownDeleteAvatar = true;
    };

    $scope.hideDeleteAvatar = function() {
      $scope.shownDeleteAvatar = false;
    };

    $scope.toggleDrawer = function(forceClose) {
      $scope.showDrawer = forceClose === true ? false : !$scope.showDrawer;
    };

    $scope.toggleMessageList = function(forceClose) {
      $scope.showMessageList = forceClose === true ? false : !$scope.showMessageList;
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

    function refreshUserData(isAvatarUpdate) {

      authService.currentUser = Max.getCurrentUser();
      authService.initials = authService.getInitials(authService.currentUser);
      // get avatar from url, appending timestamp to bust browser cache
      if (isAvatarUpdate) {
        authService.userAvatar = (authService.currentUser.extras && authService.currentUser.extras.hasAvatar)
          ? Max.User.getAvatarUrl() : null;
      }

      $scope.safeApply(function() {
        $scope.data.firstName = authService.currentUser.firstName;
        $scope.data.lastName = authService.currentUser.lastName;
        $scope.data.password = '';
        $scope.data.confirm = '';

        $scope.authService.userAvatar = authService.userAvatar;
        $scope.authService.initials = authService.initials;
      });

      Audio.enabled = (authService.currentUser.extras &&
        (authService.currentUser.extras.audioNotify === true || authService.currentUser.extras.audioNotify === 'true'));

    }

    refreshUserData();

  });
