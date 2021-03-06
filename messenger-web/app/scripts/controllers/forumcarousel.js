'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:ForumcarouselCtrl
 * @description
 * # ForumcarouselCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('ForumcarouselCtrl', function ($scope, $state) {

    $scope.slideInterval = 10000;
    $scope.noWrapSlides = false;
    $scope.active = 0;
    var slides = $scope.slides = [];
    var currIndex = 0;

    slides.push({
      image: 'images/bg_msg_devweek.png',
      text: 'Developer Week',
      channel: 'global_dev_week',
      id: currIndex++
    });

    $scope.goToConversation = function(channelName) {
      $state.go('app.chat', {
        channelName: channelName,
        userId: '*'
      });
    }

  });
