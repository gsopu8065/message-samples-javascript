angular.module('starter.services', [])

  .factory('authService', function() {

    return {
      isAuthenticated: false
    }

  })


  .factory('navService', function() {

    return {
      currentPage: null,
      $currentScope: null,
      currentChannel: null
    }

  });
