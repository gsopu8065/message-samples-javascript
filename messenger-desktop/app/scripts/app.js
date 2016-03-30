'use strict';

/**
 * @ngdoc overview
 * @name messengerApp
 * @description
 * # messengerApp
 *
 * Main module of the application.
 */
angular
  .module('messengerApp', [
    'ngAnimate',
    'ngResource',
    'ui.router',
    'ngSanitize',
    'ngTouch',
    'monospaced.elastic',
    'angularMoment',
    'ui.bootstrap',
    'ui.ace'
  ])

  .run(function($location, authService, $rootScope, $state) {

    // handle not authorized and session expiry errors by redirecting to login page
    Max.on('not-authenticated', function() {
      authService.isAuthenticated = false;
      authService.currentUser = null;
      $state.go('login');
    });

    // handle authentication by redirecting to home page
    Max.on('authenticated', function() {
      authService.isAuthenticated = true;
      authService.currentUser = Max.getCurrentUser();
      authService.initials = authService.getInitials(authService.currentUser);
      authService.userAvatar = (authService.currentUser.extras && authService.currentUser.extras.hasAvatar)
        ? authService.currentUser.getAvatarUrl() : null;
      bootstrapPublicChannels();
      setConfigDefaults();
      $state.go('app');
    });

    // make sure Message SDK is ready by having application logic execute after the onReady call
    Max.onReady(function() {
      setTimeout(function() {
        // do something
        loading_screen.finish();
      }, 500);
    });

    var bootstrapped = false;

    function bootstrapPublicChannels() {
      if (bootstrapped) return;
      bootstrapped = true;

      var publicChannels = ['global_dev_week'];
      createIfNotExist(publicChannels, 0);
    }

    // create public channels if they don't already exist
    function createIfNotExist(channels, index) {
      if (!channels[index]) return;

      Max.Channel.getPublicChannel(channels[index]).success(function(existingChannel) {
        existingChannel.subscribe().success(function() {
          createIfNotExist(channels, ++index);
        });
      }).error(function() {
        Max.Channel.create({
          name: channels[index],
          summary: channels[index],
          isPublic: true,
          publishPermission: 'subscribers'
        }).success(function() {
          createIfNotExist(channels, ++index);
        });
      });
    }

    function setConfigDefaults() {
      if (!authService.currentUser.extras || typeof authService.currentUser.extras.audioNotify === 'undefined') {

        // set some custom configuration associated with the current user
        authService.currentUser.extras = authService.currentUser.extras || {};
        authService.currentUser.extras.audioNotify = false;
        Max.User.updateProfile(authService.currentUser);
      }
    }

    // shim for trim
    if(typeof String.prototype.trim !== 'function') {
      String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
      }
    }

  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('app', {
      url: '/chat',
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })

    .state('login', {
      url: '/login',
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })

    .state('register', {
      url: '/register',
      templateUrl: 'views/register.html',
      controller: 'RegisterCtrl'
    })

    .state('app.chat', {
      url: '/:channelName/:userId',
      templateUrl: 'views/chat.html',
      controller: 'ChatCtrl'
    });

    $urlRouterProvider.otherwise('/login');

  });
