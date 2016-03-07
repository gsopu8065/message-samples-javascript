angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, authService, navService) {

    $scope.logout = function() {
      // logout user
      Max.User.logout();
      authService.isAuthenticated = false;
      $state.go('app.login');
    };

    $scope.authService = authService;
    $scope.navService = navService;

    $scope.startConversation = function() {
      $scope.navService.$currentScope.startConversation();
    };

    $scope.gotoConversationDetails = function() {
      $scope.navService.$currentScope.gotoConversationDetails();
    }

})

.controller('RegisterCtrl', function($scope, $state, navService) {
  $scope.registerData = {
    userName : '',
    password : ''
  };

  $scope.$on('$ionicView.enter', function() {
    navService.currentPage = 'register';
    navService.$currentScope = $scope;
  });

  $scope.doRegister = function() {
    // register user by supplying credentials
    Max.User.register($scope.registerData).success(function() {

      // login with the newly registered user
      Max.User.login($scope.registerData).success(function() {
        $state.go('app.channels');
      }).error(function(err) {
        alert(err);
      });

    }).error(function(err) {
      alert(JSON.stringify(err));
    });
  }

})

.controller('LoginCtrl', function($scope, $state, navService, $ionicSideMenuDelegate) {
  $scope.loginData = {
    userName : '',
    password : ''
  };

  $scope.$on('$ionicView.enter', function() {
    navService.currentPage = 'login';
    navService.$currentScope = $scope;

    $ionicSideMenuDelegate.toggleLeft(false);
  });

  $scope.doLogin = function() {

    // login user by supplying credentials
    Max.User.login($scope.loginData).success(function() {
      $state.go('app.channels');
    }).error(function(err) {
      alert(JSON.stringify(err));
    });
  }

})

.controller('ChannelsCtrl', function($scope, $state, navService, authService, $ionicPopup) {
  $scope.data = {};
  $scope.data.developerWeekChannel = null;
  $scope.data.channelSummaries = [];
  var listener;

  $scope.$on('$ionicView.enter', function() {
    if (!authService.isAuthenticated) return $state.go('app.login');

    navService.currentPage = 'channels';
    navService.$currentScope = $scope;

    // register a listener to listen for messages and update the channel summaries
    listener = new Max.MessageListener('receivedMessageListener', function(mmxMessage) {
      Audio.onReceive();

      var isExistingChannel = false;
      if (mmxMessage.channel && mmxMessage.channel.name) {
        for (var i=0;i<$scope.data.channelSummaries.length;++i) {
          if ($scope.data.channelSummaries[i].channelName == mmxMessage.channel.name) {
            isExistingChannel = true;
            $scope.$apply(function() {
              $scope.data.channelSummaries[i].latestMessage = getLatestMessage(mmxMessage);
              $scope.data.channelSummaries[i].isUnread = true;
            });
          }
        }
        if (!isExistingChannel) {
          refreshChannelList();
        }
      }
    });
    Max.registerListener(listener);

    refreshChannelList();
  });

  function refreshChannelList() {

    // find a public channel by name
    Max.Channel.findPublicChannels('DeveloperWeek').success(function (channels) {
      if (!channels.length) return;

      $scope.$apply(function() {
        $scope.data.developerWeekChannel = channels[0];

        // subscribe to the channel
        $scope.data.developerWeekChannel.subscribe();

      });
    });

    // retrieve all channels the current user is subscribed to
    Max.Channel.getAllSubscriptions().success(function(channels) {
      if (!channels.length) return;

      $scope.data.channels = channels;

      // retrieve detailed channel information, including subscribers and past messages
      Max.Channel.getChannelSummary(channels, 5, 1).success(function(channelSummaries) {

        for (var i = 0; i < channelSummaries.length; ++i) {
          var subscriberNames = [];
          for (var j = 0; j < channelSummaries[i].subscribers.length; ++j) {
            subscriberNames.push(channelSummaries[i].subscribers[j].userName);
          }
          channelSummaries[i].subscriberNames = subscriberNames.join(', ');
          channelSummaries[i].ownerId = channelSummaries[i].owner.userId;
          if (channelSummaries[i].messages && channelSummaries[i].messages[0] && channelSummaries[i].messages[0].messageContent)
            channelSummaries[i].latestMessage = getLatestMessage(channelSummaries[i].messages[0]);
        }
        $scope.$apply(function() {
          $scope.data.channelSummaries = channelSummaries;
        });
      });
    });
  }

  function getLatestMessage(mmxMessage) {
    var msg = ('"'+mmxMessage.messageContent.message+'"');
    if (mmxMessage.attachments && mmxMessage.attachments.length) msg = 'a file was uploaded';
    if (mmxMessage.messageContent.type == 'location') msg = 'a location was posted';
    return msg
  }

  $scope.$on('$ionicView.leave', function() {
    // IMPORTANT: always make sure to unregister the listener when you leave the page
    Max.unregisterListener(listener);
  });

  $scope.confirmLeave = function(channelSummary) {
    var channel = channelSummary.channel;

    $ionicPopup.confirm({
      title: 'Leave this channel?',
      template: 'Are you sure you wish to leave this chat room?'
    }).then(function(yes) {
      if (yes) {
        // leave the channel by unsubscribing, then refresh the view
        channel.unsubscribe().success(function() {

          for (var i=0;i<$scope.data.channelSummaries.length;++i) {
            if ($scope.data.channelSummaries[i].channelName == channel.name) {
              $scope.$apply(function() {
                $scope.data.channelSummaries.splice(i, 1);
              });
              break;
            }
          }
        })
      }
    });
  };

})

.controller('ChannelCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$ionicActionSheet',
  '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval', 'navService', 'authService',
  function($scope, $rootScope, $state, $stateParams, $ionicActionSheet,
    $ionicPopup, $ionicScrollDelegate, $timeout, $interval, navService, authService) {

  var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
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

  $scope.$on('$ionicView.enter', function() {
    if (!authService.isAuthenticated) return $state.go('app.login');

    navService.currentPage = 'channel';
    navService.$currentScope = $scope;

    Max.unregisterListener(listener);

    var i;
    $scope.data.messages = [];
    $scope.data.message = '';
    $scope.data.subscribers = {};
    messageOffset = null;
    messageStartDate = new Date();
    $scope.data.messageEndReached = false;
    fetchingMessagesActive = false;

    $scope.data.channelTitle = $stateParams.channelName == 'DeveloperWeek' ? $stateParams.channelName : 'Private Chat';

    // get current user information
    $scope.data.currentUser = Max.getCurrentUser();

    // create an instance of channel given channel name and userId (if exists)
    channel = new Max.Channel({
      name: $stateParams.channelName,
      userId: $stateParams.channelName == 'DeveloperWeek' ? null : $stateParams.userId
    });

    // get a list of users subscribed to the current channel
    channel.getAllSubscribers(100).success(function(subscribers) {
      for (i=0;i<subscribers.length;++i) {
        $scope.data.subscribers[subscribers[i].userId] = subscribers[i].userName;
      }
    });

    // fetch initial set of messages. messages received afterwards will be added in real-time with the listener.
    fetchMessages(function() {
        $timeout(function() {
          viewScroll.scrollBottom();
        }, 0);
    });

    // create a listener to listen for messages and populate the chat UI. make sure to register the listener!
    listener = new Max.MessageListener('channelMessageListener', function(mmxMessage) {
      // dont take action on messages not sent to the current channel
      if (!mmxMessage.channel || mmxMessage.channel.name != channel.name.toLowerCase()) return;

      Audio.onReceive();
      // TODO: this can be replaced with a real profile pic
      mmxMessage.pic = 'img/messenger-icon.png';
      $scope.data.messages.push(mmxMessage);

      // this tells us to add the sender to the list of subscribers
      if (!$scope.data.subscribers[mmxMessage.sender.userId]) {
        Max.User.search({
          limit: 1,
          offset: 0,
          query: {
            userId: mmxMessage.sender.userId
          }
        }).success(function (users) {
          if (users.length) {
            var user = users[0];
            $scope.safeApply(function() {
              $scope.data.subscribers[user.userId] = user.userName;
            });
          }
        });
      }

      $timeout(function() {
        viewScroll.scrollBottom();
      }, 0);
    });

    // register the listener
    Max.registerListener(listener);

    $timeout(function() {
      footerBar = document.body.querySelector('#userMessagesView .bar-footer');
      scroller = document.body.querySelector('#userMessagesView .scroll-content');
      txtInput = angular.element(footerBar.querySelector('textarea'));
    }, 0);

  });

  $scope.$on('$ionicView.leave', function() {
    // IMPORTANT: always make sure to unregister the listener when you leave the page
    Max.unregisterListener(listener);
  });

  $scope.sendMessage = function() {
    keepKeyboardOpen();
    if (!$scope.data.message.length) return $scope.data.message = '';

    // publish message to the channel
    var msg = new Max.Message({
        message: $scope.data.message,
        type: 'text'
    });
    setTimeout(function() {
      $scope.data.message = '';
    }, 10);
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
    channel.publish(msg, el.files[0]).success(function() {
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

  $scope.onMessageScroll = function() {
    // if there are no more messages to fetch, stop fetching upon scroll
    if ($scope.data.messageEndReached) return;
    // don't check for messages if messages are currently being fetched
    if (fetchingMessagesActive) return;

    // infinite scroll of messages
    if (viewScroll.getScrollPosition().top <= 30) {
      lastScrollHeight = document.getElementById('channel-messages').scrollHeight;
        fetchingMessagesActive = true;
        fetchMessages(function(messageLength) {
          var currentScrollHeight = document.getElementById('channel-messages').scrollHeight;
          var lastPosition = currentScrollHeight - lastScrollHeight + (messageLength * 50);
          viewScroll.scrollTo(0, lastPosition, false);
          fetchingMessagesActive = false;
      });
    }
  };

  function fetchMessages(cb) {
    messageOffset = messageOffset === null ? 0 : (messageOffset + 20);

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
        // TODO: these can be replaced with real profile pics
          messages[i].pic = 'img/messenger-icon.png';
      }

      $scope.safeApply(function() {
        // append messages to message history
        $scope.data.messages = messages.concat($scope.data.messages);
      });

      (cb || angular.noop)(messages.length);
    });
  }

  // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
  function keepKeyboardOpen() {
    txtInput.one('blur', function() {
      txtInput[0].focus();
    });
  }

  function showLoading() {
    $scope.safeApply(function() {
      $scope.data.isLoading = true;
      viewScroll.scrollBottom();
    });
  }

  function hideLoading() {
    $scope.$apply(function() {
      $scope.data.isLoading = false;
    });
  }

  function clearFileInput(ctrl) {
    try {
      ctrl.value = null;
    } catch(ex) { }
    if (ctrl.value) {
      ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
    }
  }

  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  // TODO: implement actions when a message is long-pressed
  $scope.onMessageHold = function(e, itemIndex, message) {
    $ionicActionSheet.show({
      buttons: [{
        text: 'Copy Text'
      }, {
        text: 'Delete Message'
      }],
      buttonClicked: function(index) {
        switch (index) {
          case 0: // Copy Text
            //cordova.plugins.clipboard.copy(message.text);
            break;
          case 1: // Delete
            // TODO: need to implement on server
            $scope.messages.splice(itemIndex, 1);
            $timeout(function() {
              viewScroll.resize();
            }, 0);

            break;
        }

        return true;
      }
    });
  };

  $scope.gotoConversationDetails = function() {
    $state.go('app.details', {
      channelName: channel.name,
      userId: channel.userId
    });
  };

  // TODO: implement user profile
  $scope.viewProfile = function(msg) {
    if (msg.userId === $scope.user._id) {
      // go to your profile
    } else {
      // go to other users profile
    }
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

}])

.controller('ChannelDetailsCtrl', function($scope, authService, navService, $state, $stateParams) {
  var channel;
  $scope.authService = authService;
  $scope.data = {
    users: []
  };

  $scope.$on('$ionicView.enter', function() {
    if (!authService.isAuthenticated) return $state.go('app.login');

    navService.currentPage = 'channeldetails';
    navService.$currentScope = $scope;

    // get current user information
    $scope.data.currentUser = Max.getCurrentUser();

    // create an instance of channel given channel name and userId (if exists)
    channel = new Max.Channel({
      name: $stateParams.channelName,
      userId: $stateParams.channelName == 'DeveloperWeek' ? null : $stateParams.userId
    });

    // get all the users subscribed to the channel
    channel.getAllSubscribers(100).success(function(subscribers) {
      $scope.$apply(function() {
        $scope.data.users = subscribers;
        $scope.data.isOwner = channel.isOwner();
      });
    });

  });

  $scope.addContacts = function() {
    $state.go('app.channelUsers', {
      channelName: channel.name,
      userId: channel.userId
    });
  }

})

.controller('UsersCtrl', function($scope, authService, navService, $state, $stateParams) {
  var channel;
  $scope.authService = authService;

  $scope.$on('$ionicView.enter', function() {
    if (!authService.isAuthenticated) return $state.go('app.login');

    $scope.data = {
      users: []
    };
    navService.currentPage = 'userlist';
    navService.$currentScope = $scope;

    if ($stateParams.channelName) {
      // create an instance of channel given channel name and userId (if exists)
      channel = new Max.Channel({
        name: $stateParams.channelName,
        userId: $stateParams.userId
      });
    }

    // retrieve a list of users
    Max.User.search({
      limit: 100,
      offset: 0,
      query: {userName: '*'}
    }).success(function (users) {

      if (channel) {
        // get all the users subscribed to the channel
        channel.getAllSubscribers(100).success(function(subscribers) {
          var uids = getUIDs(subscribers);

          $scope.$apply(function() {
            for (var i=0;i<users.length;++i) {
              if (uids.indexOf(users[i].userId) == -1) {
                $scope.data.users.push(users[i]);
              }
            }
          });
        });
      } else {
        $scope.$apply(function () {
          $scope.data.users = users;
        });
      }
    });
  });

  $scope.toggleSelection = function(user) {
    user.uiActive = user.uiActive ? false : true;
  };

  $scope.startConversation = function() {
    var uids = [];
    for (var key in $scope.data.users) {
      if ($scope.data.users[key].uiActive) {
        uids.push($scope.data.users[key].userId);
      }
    }

    if (!uids.length) return alert('no users selected');
    if (channel) return subscribeUsers(channel, uids);

    // create a new private channel
    var channelName = new Date().getTime();
    Max.Channel.create({
      name: channelName,
      summary: authService.currentUser.userName,
      isPublic: false,
      publishPermissions: 'subscribers'
    }).success(function(mmxPrivateChannel) {
      subscribeUsers(mmxPrivateChannel, uids);
    });

  };

  function subscribeUsers(channel, uids) {
    // subscribe the selected users to the private channel
    channel.addSubscribers(uids).success(function() {
      $state.go('app.single', {
        channelName: channel.name,
        userId: channel.userId
      });
    });
  }

  function getUIDs(users) {
    var uids = [];
    for (var i=0;i<users.length;++i) {
      uids.push(users[i].userId);
    }
    return uids;
  }

});

var Audio = {
  receive: new Howl({
    urls: ['sounds/whistle.mp3', 'sounds/whistle.ogg']
  }),
  send: new Howl({
    urls: ['sounds/click.mp3', 'sounds/click.ogg']
  }),
  onReceive: function() {
    this.receive.play();
  },
  onSend: function() {
    this.send.play();
  }
};
