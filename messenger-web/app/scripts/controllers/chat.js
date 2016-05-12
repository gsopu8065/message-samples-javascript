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
                                    $interval, navService, authService, $uibModal, Alerts, notify) {

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
      messageEndReached: false,
      downloadSupported: ('download' in document.createElement('a'))
    };

    $scope.Max = {
      MessageType: Max.MessageType
    };

    $scope.authService = authService;

    if (!authService.isAuthenticated) return $state.go('login');

    navService.currentChannel = {
      name: $stateParams.channelName,
      userId: $stateParams.userId == '*' ? null : $stateParams.userId
    };

    $scope.data.channelTitle = $stateParams.userId == '*' ? $stateParams.channelName : 'Private Chat';

    // get current user information
    $scope.data.currentUser = Max.getCurrentUser();

    var i, j;
    $scope.data.messages = [];
    $scope.data.polls = {};
    $scope.data.message = '';
    $scope.data.subscribers = {};
    $scope.data.isOwner = $scope.data.currentUser.userId === $stateParams.userId;
    messageOffset = null;
    messageStartDate = new Date();
    $scope.data.messageEndReached = false;
    fetchingMessagesActive = false;

    // create an instance of channel given channel name and userId (if exists)
    channel = new Max.Channel({
      name: $stateParams.channelName,
      userId: $stateParams.userId == '*' ? null : $stateParams.userId
    });

    notify.resetChannel(channel);

    // fetch initial set of messages. messages received afterwards will be added in real-time with the listener.
    fetchMessages(function() {
        scrollBottom();
    });

    // create a listener to listen for messages and populate the chat UI. make sure to register the listener!
    listener = new Max.MessageListener('channelMessageListener', function(mmxMessage) {
      // dont take action on messages not sent to the current channel
      if (!mmxMessage.channel || mmxMessage.channel.name != channel.name) return;

      if (mmxMessage.messageContent.format == 'code') {
        mmxMessage.messageContent.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      handleMessages([mmxMessage], 0, function() {
        addMessage(mmxMessage);
      });
    });

    function addMessage(mmxMessage) {
      // this tells us to add the sender to the list of subscribers
      if (!$scope.data.subscribers[mmxMessage.sender.userId]) {
        Max.User.search({ userId: mmxMessage.sender.userId }, 1, 0).success(function (users) {
          if (users.length) {
            var user = users[0];
            setUserUsername(mmxMessage);
            $scope.safeApply(function() {
              user.initials = authService.getInitials(user);
              user.displayName = authService.getDisplayName(user);
              $scope.data.subscribers[user.userId] = user;
              $scope.data.messages.push(mmxMessage);
            });
          }
        });
      } else {
        setUserUsername(mmxMessage);
        $scope.safeApply(function() {
          $scope.data.messages.push(mmxMessage);
        });
      }

      var msgContainer = document.getElementById('channel-messages');
      if ((msgContainer.scrollHeight - msgContainer.offsetHeight - msgContainer.scrollTop) < 220
      || (mmxMessage.contentType && mmxMessage.contentType.indexOf(Max.MessageType.POLL_IDENTIFIER) != -1)) {
        scrollBottom();
      }
    }

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

    $scope.onCreatePoll = function() {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'CreatePoll.html',
        controller: 'CreatepollCtrl',
        resolve: {
          channel: function() {
            return channel;
          }
        }
      });
    };

    $scope.isUpdatingPoll = false;

    $scope.togglePollOption = function(pollId, option) {
      if ($scope.isUpdatingPoll) return;
      $scope.isUpdatingPoll = true;

      var selectedOptions = [];
      var poll = $scope.data.polls[pollId];

      for (i=0;i<poll.options.length;++i) {
        if (!poll.allowMultiChoice && poll.options[i].optionId !== option.optionId) {
          poll.options[i].myVote = false;
        }
        if (poll.options[i].optionId === option.optionId) {
          poll.options[i].myVote = !option.myVote;
        }
        if (poll.options[i].myVote) {
          selectedOptions.push(poll.options[i]);
        }
      }
      // update poll choices for the current user
      poll.choose(selectedOptions).success(function() {
        Audio.onSend();
        $scope.safeApply(function() {
          addMyVotes(poll);
        });
      }).error(function(err) {
        alert(err);
      }).always(function() {
        $scope.isUpdatingPoll = false;
      });
    };

    $scope.refreshPoll = function(pollId) {
      getPoll(pollId, function(poll) {
        // if results are hidden from other users, the owner must manually refresh the poll to obtain results
        poll.refreshResults().success(function() {

          $scope.safeApply(function() {
            $scope.data.polls[pollId] = poll;
            addMyVotes($scope.data.polls[pollId]);
          });
        });
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
        viewScroll.scrollTop = currentScrollHeight - lastScrollHeight;
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

        var uids = [];

        for (i=0;i<messages.length;++i) {
          uids.push(messages[i].sender.userId);
          if (messages[i].messageContent.format == 'code') {
            messages[i].messageContent.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          }
          if (messageOffset > 0) messages[i].scrolled = true;
        }

        // get users given user ids who sent messages within the result set
        Max.User.getUsersByUserIds(uids).success(function(users) {

          for (i=0;i<users.length;++i) {
            users[i].initials = authService.getInitials(users[i]);
            users[i].displayName = authService.getDisplayName(users[i]);
            $scope.data.subscribers[users[i].userId] = users[i];
          }

          for (i=0;i<messages.length;++i) {
            setUserUsername(messages[i]);
          }

          handleMessages(messages, 0, function() {
            $scope.safeApply(function() {
              // append messages to message history
              $scope.data.messages = messages.concat($scope.data.messages);
              setTimeout(function() {
                (cb || angular.noop)(messages.length);
              }, 20);
            });
          }, true);

        });

      });
    }

    function handleMessages(messages, index, done, isFetchedMessage) {
      if (!messages[index]) return done();

      var typedPayload = messages[index].payload;

      // if incoming message contains a poll identifier, get the poll object and display it
      if (messages[index].contentType && messages[index].contentType.indexOf(Max.MessageType.POLL_IDENTIFIER) != -1) {
        var pollId = typedPayload.pollId;

        getPoll(pollId, function(poll) {
          handleMessages(messages, ++index, done, isFetchedMessage);
        });
      } else if (messages[index].contentType
        && messages[index].contentType.indexOf(Max.MessageType.POLL_ANSWER) != -1) {
        // incoming message contained a poll answer, so we should populate the displayed poll UI
        getPoll(typedPayload.pollId, function(poll) {

          messages[index].payload.selections = [];

          if (!isFetchedMessage) {
            // only update the poll with poll answers if the message was received from the message listener.
            // otherwise, the poll result counts will become inaccurate.
            poll.updateResults(typedPayload);
          }
          for (i=0;i<typedPayload.currentSelection.length;++i) {
            messages[index].payload.selections.push(typedPayload.currentSelection[i].text);
          }

          messages[index].payload.selections = messages[index].payload.selections.join(', ');

          handleMessages(messages, ++index, done, isFetchedMessage);
        });
      } else {
        handleMessages(messages, ++index, done, isFetchedMessage);
      }
    }

    function getPoll(pollId, cb) {
      if ($scope.data.polls[pollId]) {
        addMyVotes($scope.data.polls[pollId]);
        return cb($scope.data.polls[pollId]);
      }
      // get poll object using pollId
      Max.Poll.get(pollId).success(function(poll) {
        $scope.data.polls[pollId] = poll;
        addMyVotes($scope.data.polls[pollId]);
        cb($scope.data.polls[pollId]);
      }).error(function(err) {
        alert(err);
      });
    }

    function addMyVotes(poll) {
      if (poll.myVotes) {
        for (var i=0;i<poll.options.length;++i) {
          poll.options[i].myVote = poll.options[i].myVote === true;
          for (var j=0;j<poll.myVotes.length;++j) {
            if (poll.options[i].optionId === poll.myVotes[j].optionId) {
              poll.options[i].myVote = true;
            }
          }
        }
      }
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
      if (!message.sender.displayName && $scope.data.subscribers[message.sender.userId]) {
        message.sender.displayName = authService.getDisplayName($scope.data.subscribers[message.sender.userId]);
      }
      message.sender.initials = authService.getInitials(message.sender);
    }

    $scope.gotoConversationDetails = function() {
      $state.go('app.details', {
        channelName: channel.name,
        userId: channel.userId
      });
    };

    $scope.deleteMessage = function(message, index) {
      // delete message. only available if current user is channel owner or message creator.
      channel.deleteMessage(message.messageID).success(function(e) {
        $scope.safeApply(function() {
          $scope.data.messages.splice(index, 1);
        });
      }).error(function(e) {
        console.log(e);
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
