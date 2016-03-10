'use strict';

/**
 * @ngdoc service
 * @name messengerApp.alerts
 * @description
 * # alerts
 * Service in the messengerApp.
 */
angular.module('messengerApp')
  .factory('Alerts', function($modal) {
        return {
            General : function(obj, cb) {
                $modal.open({
                    templateUrl : 'AlertGeneralModal.html',
                    controller  : 'GeneralAlertCtrl',
                    resolve     : {
                        params : function() {
                            return obj;
                        }
                    }
                }).result.then((function() {
                    if (typeof cb === typeof Function) cb();
                }), function() {
                    if (typeof cb === typeof Function) cb();
                });
            },
            Confirm : function(obj, yes, no, custom) {
                $modal.open({
                    templateUrl : 'AlertConfirmModal.html',
                    controller  : 'GeneralAlertCtrl',
                    resolve     : {
                        params : function() {
                            return obj;
                        }
                    }
                }).result.then((function(data) {
                    if (data == 'custom' && typeof custom === typeof Function) return custom();
                    if (typeof yes === typeof Function) yes();
                }), function() {
                    if (typeof no === typeof Function) no();
                });
            },
            Success : function(obj, cb) {
                $modal.open({
                    templateUrl : 'AlertSuccessModal.html',
                    controller  : 'GeneralAlertCtrl',
                    resolve     : {
                        params : function() {
                            return obj;
                        }
                    }
                }).result.then((function() {
                    if (typeof cb === typeof Function) cb();
                }), function() {
                    if (typeof cb === typeof Function) cb();
                });
            },
            Error : function(obj, cb) {
                $modal.open({
                    templateUrl : 'AlertErrorModal.html',
                    controller  : 'GeneralAlertCtrl',
                    resolve     : {
                        params : function() {
                            return obj;
                        }
                    }
                }).result.then((function() {
                    if (typeof cb === typeof Function) cb();
                }), function() { });
            }
        }
  }).controller('GeneralAlertCtrl', ['$scope', '$modalInstance', 'params', function($scope, $modalInstance, params) {
        $scope.data = params;
        $scope.ok = function(result, result2) {
            $modalInstance.close(result || $scope, result2);
        };
        $scope.action = function(action) {
            if (params && typeof params[action] === typeof Function) {
                params[action].apply(null, arguments);
            }
        };
        $scope.close = function() {
            $modalInstance.dismiss('cancel');
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
        $scope.validators = params ? params.validators : {};
    }
]);
