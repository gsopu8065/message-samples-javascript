angular.module('starter', ['ionic', 'starter.services', 'starter.controllers', 'monospaced.elastic', 'angularMoment'])

.run(function($ionicPlatform, $rootScope, authService, $state, $ionicLoading) {

  $ionicLoading.show({
    template: '<p><img src="img/messenger-icon.png" /> <br /><ion-spinner></ion-spinner>'
  });

  // initialize the MessageSDK by setting client information
  //Max.init({
  //    clientId: '<your client id>',
  //    clientSecret: '<your client secret>',
  //    baseUrl: 'https://sandbox.magnet.com/mobile/api'
  //});
//Max.init({
//  clientId: '0f7f9f4c-d7fb-43f8-b1c9-818decca4de0',
//  clientSecret: 'uBAW0jgfHqj1R10cCcQFPztgNTRb54VoB4vhA7WWaRU',
//  baseUrl: 'https://sandy.magnet.com/mobile/api'
//});
Max.init({
  clientId: 'b5925354-828e-4a8c-8ef8-4836e015d7bb',
  clientSecret: 'sVGCDxBpS5hDFdxa_5OoEsgm5NKtSV20BTt2mORfCp4',
  baseUrl: 'https://dandy.magnet.com/mobile/api'
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
