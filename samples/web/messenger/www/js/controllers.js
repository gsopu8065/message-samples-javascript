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
  navService.currentPage = 'register';
  navService.$currentScope = $scope;

  $scope.registerData = {
    username : '',
    password : ''
  };

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
  navService.currentPage = 'login';
  navService.$currentScope = $scope;

  $scope.loginData = {
    username : '',
    password : ''
  };

  $scope.doLogin = function() {

    // login user by supplying credentials
    Max.User.login($scope.loginData).success(function() {
      $state.go('app.channels');
    }).error(function(err) {
      alert(JSON.stringify(err));
    });
  }

})

.controller('ChannelsCtrl', function($scope, $state, navService) {
  navService.currentPage = 'channels';
  navService.$currentScope = $scope;

  $scope.data = {};
  $scope.data.developerWeekChannel = null;
  $scope.data.channelSummaries = null;

  Max.onReady(function() {

    // find a public channel by name
    Max.Channel.findPublicChannelsByName('DeveloperWeek').success(function(channels) {
      if (!channels.length) return;

      $scope.$apply(function () {
        $scope.data.developerWeekChannel = channels[0];

        // subscribe to the channel
        $scope.data.developerWeekChannel.subscribe().success(function() {
          console.log('subscribed to developerweek');
        });

      });
    });

    // retrieve all channels the current user is subscribed to
    Max.Channel.getAllSubscriptions().success(function(channels) {
      if (!channels.length) return;

      $scope.data.channels = channels;

      // retrieve detailed channel information, including subscribers and past messages
      Max.Channel.getChannelSummary(channels, 3, 1).success(function(channelSummaries) {

        for (var i=0;i<channelSummaries.length;++i) {
          var subscriberNames = [];
          for (var j=0;j<channelSummaries[i].subscribers.length;++j) {
            subscriberNames.push(channelSummaries[i].subscribers[j].displayName);
          }
          channelSummaries[i].subscriberNames = subscriberNames.join(', ');
          channelSummaries[i].ownerId = channelSummaries[i].owner.userId.split('%')[0];
          if (channelSummaries[i].messages && channelSummaries[i].messages[0] && channelSummaries[i].messages[0].content)
            channelSummaries[i].latestMessage = channelSummaries[i].messages[0].content.message;
        }
        $scope.$apply(function () {
          $scope.data.channelSummaries = channelSummaries;
        });
      });
    });
  });

})

.controller('ChannelCtrl', function($scope, $stateParams, $state, navService) {
  navService.currentPage = 'channel';
  navService.$currentScope = $scope;

  $scope.data = {
    messageContent: ''
  };
  // TODO: improve the apis for obtaining private channel details
  var channel = new Max.Channel({
    name: $stateParams.channelName,
    userId: $stateParams.userId
  });

  // retrieve detailed channel information, including subscribers and past messages
  Max.Channel.getChannelSummary([channel], 1, 30).success(function(channelSummaries) {
    if (!channelSummaries.length) return;

    $scope.data.channelSummary = channelSummaries[0];
  });

  $scope.sendMessage = function() {

    // publish message to the channel
    var msg = new Max.Message({
        message: $scope.data.messageContent
    });
    channel.publish(msg);
  }

})


.controller('UsersCtrl', function($scope, authService, navService, $state) {
  navService.currentPage = 'userlist';
  navService.$currentScope = $scope;

  $scope.users = null;
  $scope.authService = authService;

  // retrieve a list of users
  Max.User.search({
      limit: 100,
      offset: 0,
      query: 'userName:*'
  }).success(function(users) {
    $scope.users = users;
  });

  $scope.toggleSelection = function(user) {
    user.uiActive = user.uiActive ? false : true;
  };

  $scope.startConversation = function() {
    var uids = [];
    for (var key in $scope.users) {
      if ($scope.users[key].uiActive) {
        uids.push($scope.users[key].userIdentifier);
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
