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

  .run(function($location, authService, $rootScope, $state, notify) {

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
        ? Max.User.getAvatarUrl() : null;
      notify.reset();
      //bootstrapPublicChannels();
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

    var Product = function(product) {
        this.TYPE = 'Product';
        angular.extend(this, product || {});
    };

    Max.registerPayloadType('Product', Product);

    function setConfigDefaults() {
      if (!authService.currentUser.extras || typeof authService.currentUser.extras.visualNotify === 'undefined') {

        // set some custom configuration associated with the current user
        authService.currentUser.extras = authService.currentUser.extras || {};
        if (typeof authService.currentUser.extras.audioNotify === 'undefined') {
          authService.currentUser.extras.audioNotify = false;
        }
        if (typeof authService.currentUser.extras.visualNotify === 'undefined') {
          authService.currentUser.extras.visualNotify = true;
        }
        Max.User.updateProfile(authService.currentUser);
      }
    }

    // shim for trim
    if(typeof String.prototype.trim !== 'function') {
      String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
      }
    }

    // configure moment relative time
    moment.locale('en', {
      relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "%d sec",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years"
      }
    });

    if (typeof require === typeof Function) {
      document.addEventListener('dragover', function (event) {
        event.preventDefault();
        return false;
      }, false);

      document.addEventListener('drop', function (event) {
        event.preventDefault();
        return false;
      }, false);
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
