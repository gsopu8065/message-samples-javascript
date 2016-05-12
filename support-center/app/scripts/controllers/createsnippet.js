'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:CreatesnippetCtrl
 * @description
 * # CreatesnippetCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('CreatesnippetCtrl', function ($scope, $uibModalInstance) {

    $scope.data = {
      snippet: '',
      lang: 'plain_text'
    };

    $scope.createSnippet = function() {
      $uibModalInstance.close($scope.data);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  });
