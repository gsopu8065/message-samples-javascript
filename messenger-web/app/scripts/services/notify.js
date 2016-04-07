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
      msgCtr: 0,
      channelBadges: {},
      enabled: false,
      reset: function() {
        this.msgCtr = 0;
        this.channelBadges = {};
        this.setBadge('');
      },
      resetChannel: function(channel) {
        var badgeCtr = this.channelBadges[channel.name] || 0;
        this.msgCtr = this.msgCtr - badgeCtr;
        this.channelBadges[channel.name] = 0;
        this.setBadge(this.msgCtr.toString());
      },
      show: function (title, mmxMessage, message) {
        if (!this.enabled) return;

        this.channelBadges[mmxMessage.channel.name] = this.channelBadges[mmxMessage.channel.name] || 0;
        this.channelBadges[mmxMessage.channel.name] += 1;

        this.msgCtr += 1;
        this.setBadge(this.msgCtr.toString());

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

          this.setBadge(this.msgCtr.toString());

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
      },
      setBadge: function (text) {
        if (typeof require !== typeof Function) return;
        if (text === '0') text = '';

        var remote = require('electron').remote;
        var app = remote.app;

        if (process.platform === 'darwin') {
          app.dock.setBadge('' + text);
        } else if (process.platform === 'win32') {
          var win = remote.getCurrentWindow();

          if (text === '') {
            win.setOverlayIcon(null, '');
            return;
          }

          var canvas = document.createElement('canvas');
          canvas.height = 140;
          canvas.width = 140;
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.ellipse(70, 70, 70, 70, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.textAlign = 'center';
          ctx.fillStyle = 'white';

          if (text.length > 2) {
            ctx.font = '75px sans-serif';
            ctx.fillText('' + text, 70, 98);
          } else if (text.length > 1) {
            ctx.font = '100px sans-serif';
            ctx.fillText('' + text, 70, 105);
          } else {
            ctx.font = '125px sans-serif';
            ctx.fillText('' + text, 70, 112);
          }

          var badgeDataURL = canvas.toDataURL();
          var img = NativeImage.createFromDataUrl(badgeDataURL);

          win.setOverlayIcon(img, text);
        }
      }
    }
  });
