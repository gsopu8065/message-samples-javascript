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
        if (!user) return '';
        if (user.firstName && user.lastName) {
          a = user.firstName.charAt(0);
          b = user.lastName.charAt(0);
        } else if (user.displayName && user.displayName.indexOf(' ') != -1) {
          fn = user.displayName.split(' ');
          a = fn[0];
          b = fn[1];
        } else if (user.userName && user.userName.indexOf(' ') != -1) {
          fn = user.userName.split(' ');
          a = fn[0];
          b = fn[1];
        } else if (user.displayName) {
          a = user.displayName[0];
          b = '';
        } else {
          if (user.firstName) a = user.firstName.charAt(0);
          if (user.lastName) b = user.lastName.charAt(0);
        }
        return a.toUpperCase() + '' + b.toUpperCase();
      },
      getDisplayName: function(user) {
        return (user.firstName || '') + ' ' + (user.lastName || '');
      }
    }
  })
  .factory('navService', function() {
    return {
      currentPage: null,
      $currentScope: null,
      currentChannel: null,
      list: null,
      setUnreads: function(unreads) {
        if (window.localStorage && Max.getCurrentUser()) {
          setTimeout(function() {
            var user = Max.getCurrentUser();
            localStorage.setItem(user.userId + '_unreads', JSON.stringify(unreads));
          }, 0);
        }
      },
      getUnreads: function(cb) {
        var unreads = {};
        if (!window.localStorage || !Max.getCurrentUser()) return cb(unreads);

        setTimeout(function() {
          var user = Max.getCurrentUser();
          var stored = localStorage.getItem(user.userId + '_unreads');
          if (stored) {
            unreads = JSON.parse(stored);
          }
          cb(unreads);
        }, 0);
      },
      resetUnreads: function() {
        if (window.localStorage && Max.getCurrentUser()) {
          var user = Max.getCurrentUser();
          localStorage.removeItem(user.userId + '_unreads');
        }
      }
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
      scope: {
        loadstate: '@loadstate'
      },
      link: function(scope, element, attrs) {
        if (attrs['imageonload']) return;

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
      var dir = raw.getAttribute('direction');

      if (dir == 'up' && raw.scrollTop < 30) {
        scope.$apply(attr.whenScrolled);
      }
      if (dir == 'down' && raw.scrollTop > (raw.scrollHeight - raw.clientHeight - 30)) {
        scope.$apply(attr.whenScrolled);
      }
    });
  };
})

.directive('resizable', function() {
    var toCall;
    function throttle(fun) {
        if (toCall === undefined) {
            toCall = fun;
            setTimeout(function() {
                toCall();
                toCall = undefined;
            }, 100);
        } else {
            toCall = fun;
        }
    }
    return {
        restrict: 'AE',
        scope: {
            rDirections: '=',
            rCenteredX: '=',
            rCenteredY: '=',
            rAffectedSibling: '=',
            rMinHeight: '=',
            rWidth: '=',
            rHeight: '=',
            rFlex: '=',
            rGrabber: '@',
            rDisabled: '@'
        },
        link: function(scope, element, attr) {
            var flexBasis = 'flexBasis' in document.documentElement.style ? 'flexBasis' :
                'webkitFlexBasis' in document.documentElement.style ? 'webkitFlexBasis' :
                'msFlexPreferredSize' in document.documentElement.style ? 'msFlexPreferredSize' : 'flexBasis';

            // register watchers on width and height attributes if they are set
            scope.$watch('rWidth', function(value){
                element[0].style.width = scope.rWidth + 'px';
            });
            scope.$watch('rHeight', function(value){
                element[0].style.height = scope.rHeight + 'px';
            });

            element.addClass('resizable');

            var style = window.getComputedStyle(element[0], null),
                w,
                h,
                dir = scope.rDirections,
                vx = scope.rCenteredX ? 2 : 1, // if centered double velocity
                vy = scope.rCenteredY ? 2 : 1, // if centered double velocity
                inner = scope.rGrabber ? scope.rGrabber : '<span></span>',
                minHeight = scope.rMinHeight ? scope.rMinHeight : 0,
                start,
                dragDir,
                axis,
                info = {},
                affectedSibling,
                parentElement,
                setValue;

            if (scope.rAffectedSibling) {
              parentElement = element[0].parentElement;
              affectedSibling = document.getElementById(scope.rAffectedSibling);
            }

            var updateInfo = function(e) {
                info.width = false; info.height = false;
                if(axis === 'x')
                    info.width = parseInt(element[0].style[scope.rFlex ? flexBasis : 'width']);
                else
                    info.height = parseInt(element[0].style[scope.rFlex ? flexBasis : 'height']);
                info.id = element[0].id;
                info.evt = e;
            };

            var dragging = function(e) {
                var prop, offset = axis === 'x' ? start - e.clientX : start - e.clientY;
                switch(dragDir) {
                    case 'top':
                        setValue = h + (offset * vy);
                        if (setValue < minHeight
                          || (scope.rAffectedSibling && (parentElement.clientHeight - setValue < minHeight))) {
                          return;
                        }
                        prop = scope.rFlex ? flexBasis : 'height';
                        element[0].style[prop] = setValue + 'px';
                        if (scope.rAffectedSibling) {
                          affectedSibling.style[prop] = parentElement.clientHeight - setValue + 'px';
                        }
                        break;
                    case 'bottom':
                        setValue = h - (offset * vy);
                        if (setValue < minHeight
                          || (scope.rAffectedSibling && (parentElement.clientHeight - setValue < minHeight))) {
                          return;
                        }
                        prop = scope.rFlex ? flexBasis : 'height';
                        element[0].style[prop] = setValue + 'px';
                        if (scope.rAffectedSibling) {
                          affectedSibling.style[prop] = parentElement.clientHeight - setValue + 'px';
                        }
                        break;
                    case 'right':
                        prop = scope.rFlex ? flexBasis : 'width';
                        element[0].style[prop] = w - (offset * vx) + 'px';
                        if (scope.rAffectedSibling) {
                          affectedSibling.style[prop] = parentElement.clientHeight - (w - (offset * vx)) + 'px';
                        }
                        break;
                    case 'left':
                        prop = scope.rFlex ? flexBasis : 'width';
                        element[0].style[prop] = w + (offset * vx) + 'px';
                        if (scope.rAffectedSibling) {
                          affectedSibling.style[prop] = parentElement.clientHeight - (w + (offset * vx)) + 'px';
                        }
                        break;
                }
                updateInfo(e);
                throttle(function() { scope.$emit('angular-resizable.resizing', info);});
            };
            var dragEnd = function(e) {
                updateInfo();
                scope.$emit('angular-resizable.resizeEnd', info);
                scope.$apply();
                document.removeEventListener('mouseup', dragEnd, false);
                document.removeEventListener('mousemove', dragging, false);
                element.removeClass('no-transition');
            };
            var dragStart = function(e, direction) {
                dragDir = direction;
                axis = dragDir === 'left' || dragDir === 'right' ? 'x' : 'y';
                start = axis === 'x' ? e.clientX : e.clientY;
                w = parseInt(style.getPropertyValue('width'));
                h = parseInt(style.getPropertyValue('height'));

                //prevent transition while dragging
                element.addClass('no-transition');

                document.addEventListener('mouseup', dragEnd, false);
                document.addEventListener('mousemove', dragging, false);

                // Disable highlighting while dragging
                if(e.stopPropagation) e.stopPropagation();
                if(e.preventDefault) e.preventDefault();
                e.cancelBubble = true;
                e.returnValue = false;

                updateInfo(e);
                scope.$emit('angular-resizable.resizeStart', info);
                scope.$apply();
            };

            dir.forEach(function (direction) {
                var grabber = document.createElement('div');

                // add class for styling purposes
                grabber.setAttribute('class', 'rg-' + direction);
                grabber.innerHTML = inner;
                element[0].appendChild(grabber);
                grabber.ondragstart = function() { return false; };
                grabber.addEventListener('mousedown', function(e) {
                    var disabled = (scope.rDisabled === 'true');
                    if (!disabled && e.which === 1) {
                        // left mouse click
                        dragStart(e, direction);
                    }
                }, false);
            });
        }
    }})

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

.directive('onEnterKeypress', function () {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.onEnterKeypress);
                });
                event.preventDefault();
            }
        });
    };
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

var Audio = {
  enabled: false,
  receive: new Howl({
    urls: ['sounds/whistle.mp3', 'sounds/whistle.ogg']
  }),
  send: new Howl({
    urls: ['sounds/click.mp3', 'sounds/click.ogg']
  }),
  onReceive: function() {
    if (this.enabled)
      this.receive.play();
  },
  onSend: function() {
    // too annoying!
    if (this.enabled && 1 == 2)
      this.send.play();
  }
};

var Cookie = {
    create : function(name, val, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        }
        document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(val) + expires + '; path=/';
    },
    get : function(name) {
        var nameEQ = encodeURIComponent(name) + '=';
        var ca = document.cookie.split(';');
        for (var i=0;i<ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1, c.length)
            };
            if (c.indexOf(nameEQ) == 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length))
            }
        }
        return null;
    },
    remove : function(name) {
        this.create(name, "", -1);
    }
};
