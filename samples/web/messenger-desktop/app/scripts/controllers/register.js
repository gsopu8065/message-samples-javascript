'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('RegisterCtrl', function ($scope) {

      $scope.data = {
        userName : '',
        password : ''
      };

      $scope.doRegister = function() {
        if (!$scope.data.userName.trim().length) return alert('username is required');
        if (!$scope.data.firstName.trim().length) return alert('first name is required');
        if (!$scope.data.lastName.trim().length) return alert('last name is required');
        if (!$scope.data.password.trim().length) return alert('password is required');

        // register user by supplying credentials
        Max.User.register($scope.data).success(function() {

          // login with the newly registered user
          var username = $scope.data.userName;
          var password = $scope.data.password;
          Max.User.login(username, password).success(function() {
            // login redirect is handled by Max.on('authenticated') listener in app.js
          }).error(function(err) {
            alert(err);
          });

        }).error(function(err) {
          alert(JSON.stringify(err));
        });
      }

  });
