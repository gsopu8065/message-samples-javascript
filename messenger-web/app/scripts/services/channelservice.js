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
      subscribedChannels: [],
      getChannel: function(name, ownerId) {
        var channel;
        for (var i=0;i<this.subscribedChannels.length;++i) {
          if (this.subscribedChannels[i].name == name &&
            (!ownerId || this.subscribedChannels[i].ownerUserId == ownerId)) {
            channel = this.subscribedChannels[i];
          }
        }
        return channel;
      },
      forums: [],
      reset: function() {
        this.channelSummaries = [];
        this.forums = [];
      }
    };

  });
