'use strict';

/**
 * @ngdoc function
 * @name messengerApp.controller:ProductCtrl
 * @description
 * # ProductCtrl
 * Controller of the messengerApp
 */
angular.module('messengerApp')
  .controller('ProductCtrl', function ($scope, productService, $uibModal, Alerts, navService) {

    $scope.data = {
      selectedProduct: null
    };

    $scope.updateProduct = function(product) {
      productService.currentProduct = product;

      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'UpdateProductModal.html',
        controller: 'UpdateproductCtrl'
      });

      modalInstance.result.then(function() {
        Alerts.Success({
            title       : 'Product Updated',
            description : 'Your product has been updated successfully.'
        });
      });
    };

    $scope.sendProduct = function(product) {
      if (navService.currentChannel && navService.currentChannel.name) {
        var channel = new Max.Channel({
          name: navService.currentChannel.name,
          userId: navService.currentChannel.userId
        });

        var msg = new Max.Message({
          message: null,
          type: 'text'
        });
        var Product = function(product) {
          this.TYPE = 'Product';
          angular.extend(this, product || {});
        };
        var productPayload = new Product({
          identifier: product.identifier,
          productName: product.productName,
          supplierName: product.supplierName,
          price: product.price,
          stockQuantity: product.stockQuantity,
          imageUrl: product.imageUrl
        });
        msg.addPayload(productPayload);
        channel.publish(msg).success(function() {
          Audio.onSend();
        }).error(function(err) {
          alert(err);
        });
      }
    };

    productService.getProducts(function(products) {
      $scope.data.products = products;
    });

    $scope.$watch(function () {
      return productService.selectedProduct
    }, function(newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
          $scope.data.selectedProduct = productService.selectedProduct;
        }
    });

  });
