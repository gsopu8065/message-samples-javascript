'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:ModalCtrl
 * @description
 * # ModalCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('ModalCtrl', function ($scope) {

   this.setModel = function(data) {
      $scope.$apply(function() {
         $scope.data = data;
      });
   };

   $scope.setModel = this.setModel;

  });
