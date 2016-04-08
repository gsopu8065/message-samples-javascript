'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('RegisterCtrl', function ($scope, authService) {

      $scope.data = {
        userName : '',
        firstName: '',
        lastName: '',
        password : ''
      };

    var emailRxp = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;

      $scope.doRegister = function() {
        if (!$scope.data.firstName || !$scope.data.firstName.trim().length) return alert('first name is required');
        if (!$scope.data.lastName || !$scope.data.lastName.trim().length) return alert('last name is required');
        if (!$scope.data.userName || !$scope.data.userName.trim().length) return alert('email is required');
        if (!emailRxp.test($scope.data.userName)) return alert('invalid email address');
        if (!$scope.data.password || !$scope.data.password.trim().length) return alert('password is required');

        // register user by supplying credentials
        Max.User.register($scope.data).success(function() {

          authService.password = $scope.data.password;

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
