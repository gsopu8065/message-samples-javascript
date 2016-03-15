'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('ChatCtrl', function ($scope, $rootScope, $state, $stateParams, $timeout,
                                    $interval, navService, authService, $uibModal) {

    var footerBar;
    var scroller;
    var txtInput;
    var lastScrollHeight;
    var messageOffset;
    var messageStartDate;
    var fetchingMessagesActive;

    var channel;
    var listener;

    $scope.data = {
      channelTitle: null,
      messages: [],
      currentUser: null,
      message: '',
      subscribers: {},
      isLoading: false,
      messageEndReached: false
    };

    $scope.authService = authService;

    if (!authService.isAuthenticated) return $state.go('login');

    navService.currentChannel = {
      name: $stateParams.channelName,
      userId: $stateParams.userId == '*' ? null : $stateParams.userId
    };

    var i;
    $scope.data.messages = [];
    $scope.data.message = '';
    $scope.data.subscribers = {};
    messageOffset = null;
    messageStartDate = new Date();
    $scope.data.messageEndReached = false;
    fetchingMessagesActive = false;

    $scope.data.channelTitle = $stateParams.userId == '*' ? $stateParams.channelName : 'Private Chat';

    // get current user information
    $scope.data.currentUser = Max.getCurrentUser();

    // create an instance of channel given channel name and userId (if exists)
    channel = new Max.Channel({
      name: $stateParams.channelName,
      userId: $stateParams.userId == '*' ? null : $stateParams.userId
    });

    // get a list of users subscribed to the current channel
    channel.getAllSubscribers(100).success(function(subscribers) {
      for (i=0;i<subscribers.length;++i) {
        subscribers[i].initials = authService.getInitials(subscribers[i]);
        $scope.data.subscribers[subscribers[i].userId] = subscribers[i];
      }

      // fetch initial set of messages. messages received afterwards will be added in real-time with the listener.
      fetchMessages(function() {
          scrollBottom();
      });
    });

    // create a listener to listen for messages and populate the chat UI. make sure to register the listener!
    listener = new Max.MessageListener('channelMessageListener', function(mmxMessage) {
      // dont take action on messages not sent to the current channel
      if (!mmxMessage.channel || mmxMessage.channel.name != channel.name) return;

      Audio.onReceive();

      mmxMessage.sender.initials = authService.getInitials(mmxMessage.sender);

      if (mmxMessage.messageContent.format == 'code') {
        mmxMessage.messageContent.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      // this tells us to add the sender to the list of subscribers
      if (!$scope.data.subscribers[mmxMessage.sender.userId]) {
        Max.User.search({ userId: mmxMessage.sender.userId }, 1, 0).success(function (users) {
          if (users.length) {
            var user = users[0];
            $scope.safeApply(function() {
              $scope.data.subscribers[user.userId] = user;
              setUserUsername(mmxMessage);

              $scope.data.messages.push(mmxMessage);
            });
          }
        });
      } else {
        $scope.safeApply(function() {
          setUserUsername(mmxMessage);
          $scope.data.messages.push(mmxMessage);
        });
      }

      scrollBottom();
    });

    // register the listener
    Max.registerListener(listener);

    $timeout(function() {
      footerBar = document.body.querySelector('#userMessagesScroll .bar-footer');
      scroller = document.body.querySelector('#userMessagesScroll .scroll-content');
      txtInput = angular.element(footerBar.querySelector('textarea'));
    }, 0);

    //$scope.$on('$ionicView.leave', function() {
    //  // IMPORTANT: always make sure to unregister the listener when you leave the page
    //  Max.unregisterListener(listener);
    //});

    $scope.sendMessage = function() {
      if (!$scope.data.message.length) return $scope.data.message = '';

      // publish message to the channel
      var msg = new Max.Message({
          message: $scope.data.message,
          type: 'text'
      });
      $scope.safeApply(function() {
        $scope.data.message = '';
      });
      channel.publish(msg).success(function() {
        Audio.onSend();
      }).error(function(err) {
        alert(err);
      });
    };

    $scope.onFileSelect = function(el, type) {
      showLoading();

      // upload file to the channel
      var msg = new Max.Message({
        type: type
      });
      channel.publish(msg, el.files).success(function() {
        Audio.onSend();
      }).error(function(err) {
        alert(err);
      }).always(function() {
        clearFileInput(el);
        hideLoading();
      });
    };

    $scope.onLocationSend = function() {
      var err = 'unable to obtain your location.';
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(pos) {
            showLoading();

            // send location to the channel
            var msg = new Max.Message({
              type: 'location',
              latitude: pos.coords.latitude.toString(),
              longitude: pos.coords.longitude.toString()
            });
            channel.publish(msg).success(function() {
              Audio.onSend();
            }).error(function(err) {
              alert(err);
            }).always(function() {
              hideLoading();
            });
          }, function() {
            alert(err);
          });
      } else {
        alert(err);
      }
    };

    $scope.onCreateCodeSnippet = function() {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'SendCodeSnippet.html',
        controller: 'CreatesnippetCtrl'
      });

      modalInstance.result.then(function(codeObj) {
        $scope.sendCodeSnippet(codeObj);
      });
    };

    $scope.sendCodeSnippet = function(codeObj) {
      showLoading();

      // publish code snippet to the channel
      var msg = new Max.Message({
        type: 'text',
        format: 'code',
        lang: codeObj.lang,
        message: codeObj.snippet
      });
      channel.publish(msg).success(function() {
        Audio.onSend();
      }).error(function(err) {
        alert(err);
      }).always(function() {
        hideLoading();
      });
    };

    $scope.onMessageScroll = function() {
      // if there are no more messages to fetch, stop fetching upon scroll
      if ($scope.data.messageEndReached) return;
      // don't check for messages if messages are currently being fetched
      if (fetchingMessagesActive) return;

      // infinite scroll of messages
      fetchingMessagesActive = true;
      lastScrollHeight = document.getElementById('channel-messages').scrollHeight;
      fetchMessages(function(messageLength) {
        var viewScroll = document.getElementById('channel-messages');
        var currentScrollHeight = document.getElementById('channel-messages').scrollHeight;
        var lastPosition = currentScrollHeight - lastScrollHeight;
        viewScroll.scrollTop = lastPosition;
        fetchingMessagesActive = false;
      });
    };

    function fetchMessages(cb) {
      messageOffset = messageOffset === null ? 0 : (messageOffset + 30);
      // fetch chat history ending with the time user enters the view (messages created afterwards are not loaded)
      channel.getMessages(null, messageStartDate, 30, messageOffset, true).success(function(messages, total) {

        if (!messages.length) {
          // no more messages, set flag
          $scope.safeApply(function() {
            $scope.data.messageEndReached = true;
          });
          return;
        }

        for (i=0;i<messages.length;++i) {
          messages[i].sender.initials = authService.getInitials(messages[i].sender);
          if (messages[i].messageContent.format == 'code') {
            messages[i].messageContent.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          }
          setUserUsername(messages[i]);
        }

        $scope.safeApply(function() {
          // append messages to message history
          $scope.data.messages = messages.concat($scope.data.messages);
          setTimeout(function() {
            (cb || angular.noop)(messages.length);
          }, 20);
        });

      });
    }

    function showLoading() {
      $scope.safeApply(function() {
        $scope.data.isLoading = true;
        scrollBottom();
      });
    }

    function hideLoading() {
      $scope.$apply(function() {
        $scope.data.isLoading = false;
      });
    }

    function scrollBottom() {
      setTimeout(function() {
        var viewScroll = document.getElementById('channel-messages');
        if (viewScroll) {
          viewScroll.scrollTop = viewScroll.scrollHeight;
        }
      }, 5);
    }

    function clearFileInput(ctrl) {
      try {
        ctrl.value = null;
      } catch(ex) { }
      if (ctrl.value) {
        ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
      }
    }

    function setUserUsername(message) {
      if (!message.sender.userName && $scope.data.subscribers[user.userId]) {
        message.sender.userName = $scope.data.subscribers[user.userId].firstName
          + ' ' + $scope.data.subscribers[user.userId].lastName;
      }
    }

    $scope.gotoConversationDetails = function() {
      $state.go('app.details', {
        channelName: channel.name,
        userId: channel.userId
      });
    };

    $scope.aceLoaded = function(_editor) {
      _editor.setReadOnly(true);
      _editor.setOptions({
          readOnly: true,
          highlightActiveLine: false,
          highlightGutterLine: false
      });
      _editor.renderer.$cursorLayer.element.style.opacity = 0;
      _editor.container.style.pointerEvents = 'none';
      _editor.renderer.setStyle('disabled', true);
      _editor.blur();
    };

    $scope.showFullSnippet = function(messageContent) {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'ShowCodeSnippet.html',
        controller: 'ShowsnippetCtrl',
        resolve: {
          items: function() {
            return messageContent;
          }
        }
      });
    };

    $scope.$on('taResize', function(e, ta) {
      if (!ta) return;

      var taHeight = ta[0].offsetHeight;

      if (!footerBar) return;

      var newFooterHeight = taHeight + 10;
      newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

      footerBar.style.height = newFooterHeight + 'px';
      scroller.style.bottom = newFooterHeight + 'px';
    });

    $scope.$watch(function () {
      return authService.userAvatar
    }, function(newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
          $scope.authService = authService;
        }
    });

  });
