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
    'ui.bootstrap'
  ])

  .run(function($location, authService, $rootScope, $state) {

    // initialize the MessageSDK by setting client information
    Max.init({
        clientId: '39f1ee1c-e84c-4ce0-b517-1a4b5b61cf44',
        clientSecret: 'qjlysq_NTzzGetj4cGR8rvu3pM9oVUkj_BE0LDXEnEY',
        baseUrl: 'http://192.168.58.1:8443/api'
    });

    //Max.Config.logging = true;
    //Max.Config.payloadLogging = true;
    //Max.Config.logLevel = 'FINE';

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
      $state.go('app');
    });

    // make sure Message SDK is ready by having application logic execute after the onReady call
    Max.onReady(function() {
      setTimeout(function() {
        // do something
      }, 500);
    });

    $rootScope.$safeApply = function(_$scope, fn) {
      fn = fn || function() {};
      if (_$scope.$$phase) {
        fn();
      } else {
        _$scope.$apply(fn);
      }
    };

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
