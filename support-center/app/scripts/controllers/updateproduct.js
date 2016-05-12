'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:UpdateproductCtrl
 * @description
 * # UpdateproductCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('UpdateproductCtrl', function ($scope, authService, productService, $state, $uibModalInstance, channelService) {

    if (!authService.isAuthenticated) return $state.go('login');

    $scope.data = {};

    $scope.data.product = productService.currentProduct;

    $scope.saveChanges = function() {
      var product = {
        identifier: $scope.data.product.identifier,
        productName: $scope.data.product.productName,
        productDescription: $scope.data.product.productDescription,
        stockQuantity: parseInt($scope.data.product.stockQuantity),
        supplierName: $scope.data.product.supplierName,
        price: parseFloat($scope.data.product.price)
      };
      productService.updateProduct(product, function() {
        $uibModalInstance.close();
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  });
