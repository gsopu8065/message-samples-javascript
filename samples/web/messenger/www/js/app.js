angular.module('starter', ['ionic', 'starter.services', 'starter.controllers', 'monospaced.elastic', 'angularMoment'])

.run(function($ionicPlatform, $rootScope, authService, $state, $ionicLoading) {

  $ionicLoading.show({
    template: '<p><img src="img/messenger-icon.png" /> <br /><ion-spinner></ion-spinner>'
  });

  // initialize the MessageSDK by setting client information
  Max.init({
      clientId: '76b4e8f6-1066-49e0-a537-160d436ce78c',
      clientSecret: 'xAq8auJL_VK5ZEWxXGNgm55WxZi67XeaFVBqxFYUCDI',
      baseUrl: 'http://192.168.58.1:7777/api'
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

  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  // make sure Message SDK is ready by having application logic execute after the onReady call
  Max.onReady(function() {
    setTimeout(function() {
      $ionicLoading.hide();
    }, 500);
  });

})

.config(function($stateProvider, $urlRouterProvider) {
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

  .state('app.details', {
    url: '/channels/:channelName/:userId/details',
    views: {
      'menuContent': {
        templateUrl: 'templates/channel_details.html',
        controller: 'ChannelDetailsCtrl'
      }
    }
  })

  .state('app.channelUsers', {
    url: '/channels/:channelName/:userId/users',
    views: {
      'menuContent': {
        templateUrl: 'templates/users.html',
        controller: 'UsersCtrl'
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

  $urlRouterProvider.otherwise('app/login');

});
