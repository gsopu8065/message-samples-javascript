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
    username : '',
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
    username : '',
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

    Max.onReady(function() {

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
  });

  function refreshChannelList() {

    // find a public channel by name
    Max.Channel.findPublicChannelsByName('developerweek').success(function (channels) {
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
          channelSummaries[i].ownerId = channelSummaries[i].owner.userIdentifier;
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

  var channel;
  var listener;

  $scope.data = {
    channelTitle: null,
    messages: [],
    currentUser: null,
    message: '',
    subscribers: {},
    isLoading: false
  };

  $scope.$on('$ionicView.enter', function() {
    if (!authService.isAuthenticated) return $state.go('app.login');

    navService.currentPage = 'channel';
    navService.$currentScope = $scope;

    var i;
    $scope.data.messages = [];
    $scope.data.message = '';
    $scope.data.subscribers = {};

    $scope.data.channelTitle = $stateParams.channelName == 'developerweek' ? $stateParams.channelName : 'Private Chat';

    // get current user information
    $scope.data.currentUser = Max.getCurrentUser();

    // create an instance of channel given channel name and userId (if exists)
    channel = new Max.Channel({
      name: $stateParams.channelName,
      userId: $stateParams.channelName == 'developerweek' ? null : $stateParams.userId
    });

    // you only need to fetch chat history when you enter the page.
    // messages sent and received later will be added in real-time with the listener.
    Max.Channel.getChannelSummary([channel], 100, 30).success(function(channelSummaries) {
      $scope.doneLoading = true;

      if (!channelSummaries.length || !channelSummaries[0].messages.length) return;

      for (i=0;i<channelSummaries[0].messages.length;++i) {
        // TODO: these can be replaced with real profile pics
          channelSummaries[0].messages[i].pic = 'img/messenger-icon.png';
      }
      // populate message history
      $scope.data.messages = channelSummaries[0].messages;

      // maintain a list of subscribers
      for (i=0;i<channelSummaries[0].subscribers.length;++i) {
        $scope.data.subscribers[channelSummaries[0].subscribers[i].userIdentifier] = channelSummaries[0].subscribers[i].userName;
      }

      $timeout(function() {
        viewScroll.scrollBottom();
      }, 0);

    });

    // register a listener to listen for messages and populate the chat UI
    listener = new Max.MessageListener('channelMessageListener', function(mmxMessage) {
      // dont take action on messages not sent to the current channel
      if (!mmxMessage.channel || mmxMessage.channel.name != channel.name) return;

      Audio.onReceive();
      // TODO: this can be replaced with a real profile pic
      mmxMessage.pic = 'img/messenger-icon.png';
      $scope.data.messages.push(mmxMessage);

      // this tells us to add the sender to the list of subscribers
      if (!$scope.data.subscribers[mmxMessage.sender.userIdentifier]) {
        $scope.data.subscribers[mmxMessage.sender.userIdentifier] = mmxMessage.sender.userName;
      }

      $timeout(function() {
        viewScroll.scrollBottom();
      }, 0);
    });
    Max.onReady(function() {
      Max.registerListener(listener);
    });

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
    showLoading();

    // publish message to the channel
    var msg = new Max.Message({
        message: $scope.data.message,
        type: 'text'
    });
    channel.publish(msg).success(function() {
      $scope.data.message = '';
      Audio.onSend();
    }).always(function() {
      hideLoading();
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
    }).always(function() {
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

  // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
  function keepKeyboardOpen() {
    txtInput.one('blur', function() {
      txtInput[0].focus();
    });
  }

  function showLoading() {
    $scope.$apply(function() {
      $scope.data.isLoading = true;
    });
  }

  function hideLoading() {
    $scope.$apply(function() {
      $scope.data.isLoading = false;
    });
  }

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
      userId: $stateParams.channelName == 'developerweek' ? null : $stateParams.userId
    });

    // get all the users subscribed to the channel
    channel.getAllSubscribers().success(function(subscribers) {
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
      query: 'userName:*'
    }).success(function (users) {

      if (channel) {
        // get all the users subscribed to the channel
        channel.getAllSubscribers().success(function(subscribers) {
          var uids = getUIDs(subscribers);

          $scope.$apply(function() {
            for (var i=0;i<users.length;++i) {
              if (uids.indexOf(users[i].userIdentifier) == -1) {
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
        uids.push($scope.data.users[key].userIdentifier);
      }
    }

    if (!uids.length) return alert('no users selected');
    if (channel) return subscribeUsers(channel, uids);

    // create a new private channel
    var channelName = new Date().getTime();
    Max.Channel.create({
      name: channelName,
      description: authService.currentUser.userName,
      private: true,
      publishPermission: 'subscribers'
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
      uids.push(users[i].userIdentifier);
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
