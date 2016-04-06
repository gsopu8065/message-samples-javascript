'use strict';

/**
 * @ngdoc service
 * @name messengerApp.alerts
 * @description
 * # alerts
 * Service in the messengerApp.
 */
angular.module('messengerApp')
  .factory('Alerts', function($uibModal) {
        return {
            General : function(obj, cb) {
                var modalInstance = $uibModal.open({
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
                var modalInstance = $uibModal.open({
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
                var modalInstance = $uibModal.open({
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
                var modalInstance = $uibModal.open({
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
  }).controller('GeneralAlertCtrl', ['$scope', '$uibModalInstance', 'params', function($scope, $uibModalInstance, params) {
        $scope.data = params;
        $scope.ok = function(result, result2) {
            $uibModalInstance.close(result || $scope, result2);
        };
        $scope.action = function(action) {
            if (params && typeof params[action] === typeof Function) {
                params[action].apply(null, arguments);
            }
        };
        $scope.close = function() {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.validators = params ? params.validators : {};
    }
]);
