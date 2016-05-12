'use strict';

/**
 * @ngdoc service
 * @name messengerApp.productService
 * @description
 * # productService
 * Service in the messengerApp.
 */
angular.module('messengerApp')
  .service('productService', function($http) {

    return {
      selectProduct: function(productId) {
        this.selectedProduct = productId;
      },
      getProducts: function(cb) {
        var baseUrl = Max.Config.baseUrl.replace('/api', '');
        $http({
          method: 'GET',
          url: baseUrl + '/ODataSvc.svc/Products'
        }).then(function successCallback(products) {
          for (var i=0;i<products.data.value.length;++i) {
            products.data.value[i].imageUrl = products.data.value[i].imageUrl.replace('../', Max.Config.baseUrl.replace('/api', '/assets/'));
          }
          cb(products.data.value);
        }, function errorCallback(response) {

        });
      },
      updateProduct: function(product, cb) {
        var baseUrl = Max.Config.baseUrl.replace('/api', '');
        product['@odata.context'] = '$metadata#Products/$entity';
        $http({
          method: 'PATCH',
          url: baseUrl + '/ODataSvc.svc/Products('+product.identifier+')',
          data: product,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function successCallback() {
          cb();
        }, function errorCallback(response) {

        });
      },
      createProduct: function(product, cb) {
        var baseUrl = Max.Config.baseUrl.replace('/api', '');
        var newProd = angular.extend({}, {
          "@odata.context": "$metadata#Products/$entity",
          "identifier": 2000,
           "stockQuantity": 10,
          "productName": "",
          "productDescription": "",
          "mainCategoryName": "",
          "mainCategoryId": "",
          "supplierId": "100000000",
          "supplierName": "BestBuy",
          "lastModified": "2015-02-25",
          "price": 1599.99,
          "dimensionWidth": 0.3,
          "dimensionHeight": 0.03,
          "dimensionDepth": 0.18,
          "dimensionUnit": "m",
          "imageUrl": "../localService/mockdata/images/HT-1000.jpg",
          "quantityUnit": "EA",
          "measureUnit": "each",
          "averageRating": 4.33,
          "ratingCount": 4,
          "weightMeasure": 4.2,
          "weightUnit": "kg"
        }, product);

        $http({
          method: 'POST',
          url: baseUrl + '/ODataSvc.svc/Products',
          data: newProd
        }).then(function successCallback() {
          cb(products.data.value);
        }, function errorCallback(response) {

        });
      }
    }

  });
