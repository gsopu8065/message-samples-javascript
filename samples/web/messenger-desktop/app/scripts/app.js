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
      console.log('not');
      authService.isAuthenticated = false;
      authService.currentUser = null;
      $state.go('login');
    });

    // handle authentication by redirecting to home page
    Max.on('authenticated', function() {
      console.log('auth');
      authService.isAuthenticated = true;
      authService.currentUser = Max.getCurrentUser();
      authService.initials = authService.getInitials(authService.currentUser);
      authService.userAvatar = (authService.currentUser.extras && authService.currentUser.extras.hasAvatar)
        ? authService.currentUser.getAvatarUrl() : null;
      bootstrapPublicChannels();
      $state.go('app');
    });

    // make sure Message SDK is ready by having application logic execute after the onReady call
    Max.onReady(function() {
      setTimeout(function() {
        // do something
      console.log('ready');
        loading_screen.finish();
      }, 500);
    });

    var bootstrapped = false;

    function bootstrapPublicChannels() {
      if (bootstrapped) return;
      bootstrapped = true;

      var publicChannels = ['DeveloperWeek'];
      createIfNotExist(publicChannels, 0);
    }

    // create public channels if they don't already exist
    function createIfNotExist(channels, index) {
      if (!channels[index]) return;

      Max.Channel.getPublicChannel(channels[index]).success(function() {
        createIfNotExist(channels, ++index);
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
