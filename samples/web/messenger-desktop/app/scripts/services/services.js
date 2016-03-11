'use strict';

/**
 * @ngdoc service
 * @name messengerApp.services
 * @description
 * # services
 * Service in the messengerApp.
 */
angular.module('messengerApp')

  .factory('authService', function() {
    return {
      isAuthenticated: false,
      userAvatar: null,
      getInitials: function(user) {
        var a = '', b =  '', fn;
        if (!user || !user.userName) return '';
        if (user.firstName && user.lastName) {
          a = user.firstName.charAt(0);
          b = user.lastName.charAt(0);
        } else if (user.userName && user.userName.indexOf(' ') != -1) {
          fn = user.userName.split(' ');
          a = fn[0];
          b = fn[1];
        } else {
          if (user.firstName) a = user.firstName.charAt(0);
          if (user.lastName) b = user.lastName.charAt(0);
        }
        return a.toUpperCase() + '' + b.toUpperCase();
      }
    }
  })
  .factory('navService', function() {
    return {
      currentPage: null,
      $currentScope: null,
      currentChannel: null
    }
  })

// filters
.filter('nl2br', ['$filter',
  function($filter) {
    return function(data) {
      if (!data) return data;
      return data.replace(/\n\r?/g, '<br />');
    };
  }
])

// directives
.directive('imageonload', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.bind('load', function() {
          var view = document.getElementById('channel-messages');
          view.scrollTop = view.scrollHeight;
        });
      }
    };
})

.directive('opendialog', function() {
 return {
    link : function(scope, element, attrs) {
      function openDialog() {
        var element = angular.element('#userSelectModal');
        var ctrl = element.controller();
        scope.initModal(function() {
          ctrl.setModel(scope.data);
          element.modal('show');
        });
      }
      element.bind('click', openDialog);
    }
  };
})

.directive('focusMe', function($timeout) {
  return {
    scope: { trigger: '=focusMe' },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value === true) {
          $timeout(function() {
            element[0].focus();
            scope.trigger = false;
          });
        }
      });
    }
  };
})

.directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = elm[0];

    elm.bind('scroll', function() {
      if (raw.scrollTop < 30) {
          scope.$apply(attr.whenScrolled);
      }
    });
  };
})

.directive('imageload', function() {
  return {
    restrict: 'A',
    scope: {
      method:'&imageload',
      item: '=item'
    },
    link: function(scope, element, attrs) {
      var expressionHandler = scope.method();

      element.bind('load', function() {
          expressionHandler(scope.item, true);
      });
      element.bind('error', function() {
          expressionHandler(scope.item);
      });
    }
  }
})

.directive('autolinker', ['$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        $timeout(function() {
          var eleHtml = element.html();

          if (eleHtml === '') {
            return false;
          }

          var text = Autolinker.link(eleHtml, {
            className: 'autolinker',
            newWindow: false
          });

          element.html(text);

          var autolinks = element[0].getElementsByClassName('autolinker');

          for (var i = 0; i < autolinks.length; i++) {
            angular.element(autolinks[i]).bind('click', function(e) {
              var href = e.target.href;

              if (href) {
                //window.open(href, '_system');
                window.open(href, '_blank');
              }

              e.preventDefault();
              return false;
            });
          }
        }, 0);
      }
    }
  }
]);

// configure moment relative time
moment.locale('en', {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "%d sec",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years"
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
