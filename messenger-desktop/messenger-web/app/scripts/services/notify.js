'use strict';

/**
 * @ngdoc service
 * @name messengerApp.notify
 * @description
 * # notify
 * Service in the messengerApp.
 */
angular.module('messengerApp')
  .service('notify', function () {

    return {
      enabled: false,
      show: function (title, message) {
        if (!this.enabled) return;

        if (typeof require === typeof Function) {
          // native desktop notification
          var notifier = require('node-notifier'), path = require('path');

          notifier.notify({
            title: title,
            message: message,
            icon: path.join(__dirname, 'images/messenger-icon.png'),
            sound: false,
            wait: false,
            time: 5000
          });
        } else if (window.Notification || window.mozNotification || window.webkitNotification) {
          // HTML5 notification API
          var notification = window.Notification || window.mozNotification || window.webkitNotification;

          notification.requestPermission(function() {
              var notify = new notification(title, {
                body: message,
                dir: 'auto',
                lang: 'EN',
                tag: 'notificationPopup',
                icon: 'images/messenger-icon.png'
              }
            );

            setTimeout(function() {
              notify.close();
            }, 5000);

            notify.onclick = function(e) {
              console.log('notification.Click', e);
            }
          });

        }

      }
    }
  });
