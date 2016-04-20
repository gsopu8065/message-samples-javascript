'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:CreatepollCtrl
 * @description
 * # CreatepollCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('CreatepollCtrl', function ($scope, channel, $uibModalInstance) {

    $scope.data = {
      options: [],
      allowMultiChoice: 'true',
      hideResultsFromOthers: 'false'
    };

    $scope.createPoll = function() {
      var options = [];
      for (var i= 0;i<$scope.data.options.length;++i) {
        if ($scope.data.options[i].name.length) {
          options.push(new Max.PollOption($scope.data.options[i].name));
        }
      }

      if (options.length < 2) return alert('there should be at least two options!');

      // create a poll and publish it to the channel
      var poll = new Max.Poll({
        name: $scope.data.name,
        question: $scope.data.question,
        options: options,
        allowMultiChoice: $scope.data.allowMultiChoice === 'true',
        hideResultsFromOthers: $scope.data.hideResultsFromOthers === 'true'
      });

      poll.publish(channel).success(function() {
        $uibModalInstance.close();
      }).error(function(e) {
        alert(e);
      });
    };

    $scope.addRow = function() {
      $scope.data.options.push({
        name: '',
        id: new Date()
      });
    };

    $scope.removeRow = function(index) {
      $scope.data.options.splice(index, 1);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  });
