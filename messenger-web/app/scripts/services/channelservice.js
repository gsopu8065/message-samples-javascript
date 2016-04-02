'use strict';

/**
 * @ngdoc service
 * @name messengerApp.channelService
 * @description
 * # channelService
 * Service in the messengerApp.
 */
angular.module('messengerApp')
  .service('channelService', function () {

    return {
      channelSummaries: [],
      forums: [],
      reset: function() {
        this.channelSummaries = [];
        this.forums = [];
      }
    };

  });
