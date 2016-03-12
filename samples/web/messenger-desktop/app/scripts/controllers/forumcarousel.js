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
      image: 'images/bg_msg_askmagnet.png',
      text: 'Ask Magnet',
      channel: 'AskMagnet',
      id: currIndex++
    });

    slides.push({
      image: 'images/bg_msg_devweek.png',
      text: 'Developer Week',
      channel: 'DeveloperWeek',
      id: currIndex++
    });

    slides.push({
      image: 'images/bg_msg_news.png',
      text: 'News',
      channel: 'News',
      id: currIndex++
    });

    $scope.goToConversation = function(channelName) {
      $state.go('app.chat', {
        channelName: channelName,
        userId: '*'
      });
    }

  });
