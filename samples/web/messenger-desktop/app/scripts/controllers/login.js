'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('LoginCtrl', function ($scope) {

      $scope.data = {
        userName : '',
        password : ''
      };

      $scope.doLogin = function() {

        // login user by supplying credentials
        var username = $scope.data.userName;
        var password = $scope.data.password;
        Max.User.login(username, password).success(function() {
          // login redirect is handled by Max.on('authenticated') listener in app.js
        }).error(function(err) {
          alert(JSON.stringify(err));
        });
      }


  });
