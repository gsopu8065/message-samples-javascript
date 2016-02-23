// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.services', 'starter.controllers'])

.run(function($ionicPlatform, $rootScope, authService, $state) {

  // initialize the MessageSDK by setting client information
  Max.init({
      clientId: 'c8638779-df94-41ac-94de-e2f499bc0131',
      clientSecret: '8zLsWjqhT1AzdNgGV9ebk0XZqTuY84iZkqVBh4JYjn4',
      baseUrl: 'http://localhost:7777/api'
  });

  // handle not authorized and session expiry errors by redirecting to login page
  Max.on('not-authenticated', function() {
    authService.isAuthenticated = false;
    authService.currentUser = null;
    $state.go('app.login');
  });

  // handle authentication by redirecting to home page
  Max.on('authenticated', function() {
    authService.isAuthenticated = true;
    authService.currentUser = Max.getCurrentUser();
    $state.go('app.channels');
  });

  // make sure Message SDK is ready by having application logic execute after the onReady call
  Max.onReady(function() {

    $ionicPlatform.ready(function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });

  });

})

.config(function($stateProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })

  .state('app.register', {
    url: '/register',
    views: {
      'menuContent': {
        templateUrl: 'templates/register.html',
        controller: 'RegisterCtrl'
      }
    }
  })

  .state('app.channels', {
    url: '/channels',
    views: {
      'menuContent': {
        templateUrl: 'templates/channels.html',
        controller: 'ChannelsCtrl'
      }
    }
  })

  .state('app.single', {
    url: '/channels/:channelName/:userId',
    views: {
      'menuContent': {
        templateUrl: 'templates/channel.html',
        controller: 'ChannelCtrl'
      }
    }
  })

  .state('app.users', {
    url: '/users',
    views: {
      'menuContent': {
        templateUrl: 'templates/users.html',
        controller: 'UsersCtrl'
      }
    }
  });

});
