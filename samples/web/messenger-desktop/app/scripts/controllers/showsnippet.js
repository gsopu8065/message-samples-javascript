'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:ShowsnippetCtrl
 * @description
 * # ShowsnippetCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('ShowsnippetCtrl', function ($scope, items, $uibModalInstance) {

    $scope.data = items;

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  });
