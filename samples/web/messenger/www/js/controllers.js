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
        alert(JSON.stringify(err));
      });

    }).error(function(err) {
      alert(JSON.stringify(err));
    });
  }

})

.controller('LoginCtrl', function($scope, $state, navService) {
  $scope.loginData = {
    username : '',
    password : ''
  };

  $scope.$on('$ionicView.enter', function() {
    navService.currentPage = 'login';
    navService.$currentScope = $scope;
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

.controller('ChannelsCtrl', function($scope, $state, navService, authService) {
  $scope.data = {};
  $scope.data.developerWeekChannel = null;
  $scope.data.channelSummaries = null;
  var listener;

  $scope.$on('$ionicView.enter', function() {
    if (!authService.isAuthenticated) return $state.go('app.login');

    navService.currentPage = 'channels';
    navService.$currentScope = $scope;

    Max.onReady(function() {

      // register a listener to listen for messages and update the channel summaries
      listener = new Max.MessageListener('receivedMessageListener', function(mmxMessage) {
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
      Max.Channel.getChannelSummary(channels, 3, 1).success(function(channelSummaries) {

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
    var hasAttachments = mmxMessage.attachments && mmxMessage.attachments.length;
    return hasAttachments ? 'a file was uploaded' : ('"'+mmxMessage.messageContent.message+'"');
  }

  $scope.$on('$ionicView.leave', function() {
    // IMPORTANT: always make sure to unregister the listener when you leave the page
    Max.unregisterListener(listener);
  });

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
    subscribers: {}
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

    // publish message to the channel
    var msg = new Max.Message({
        message: $scope.data.message,
        type: 'text'
    });
    channel.publish(msg).success(function() {
      $scope.data.message = '';
    });

  };

  $scope.onFileSelect = function(el) {
    if (!(window.FileReader && window.Blob)) {
      return alert('uploading not supported');
    }
    $scope.$apply(function(scope) {

      var reader = new FileReader();

      reader.addEventListener('load', function() {

         var file = {
           mimeType: el.files[0].type,
           val: reader.result
         };
        // upload file to the channel
        var msg = new Max.Message({
          type: 'photo'
        });
        channel.publish(msg, el.files[0]).success(function() {

        });
      }, false);

      if (el.files[0]) {
        reader.readAsDataURL(el.files[0]);
      }
    });
  };

  // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
  function keepKeyboardOpen() {
    txtInput.one('blur', function() {
      txtInput[0].focus();
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

.controller('UsersCtrl', function($scope, authService, navService, $state) {
  $scope.data = {
    users: []
  };
  $scope.authService = authService;

  $scope.$on('$ionicView.enter', function() {
    if (!authService.isAuthenticated) return $state.go('app.login');

    navService.currentPage = 'userlist';
    navService.$currentScope = $scope;

    // retrieve a list of users
    Max.User.search({
      limit: 100,
      offset: 0,
      query: 'userName:*'
    }).success(function (users) {

      $scope.$apply(function () {
        $scope.data.users = users;
      });
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

    // create a new private channel
    var channelName = new Date().getTime();
    Max.Channel.create({
      name: channelName,
      description: authService.currentUser.userName,
      private: true,
      publishPermission: 'subscribers'
    }).success(function(mmxPrivateChannel) {

      // invite the selected users to the private channel
      mmxPrivateChannel.addSubscribers(uids).success(function() {

        $state.go('app.channels', {
          channelName: channelName,
          userId: authService.currentUser.userIdentifier
        });
      });

    });

  }

});
