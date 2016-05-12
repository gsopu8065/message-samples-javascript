'use strict';

describe('Controller: UpdateproductCtrl', function () {

  // load the controller's module
  beforeEach(module('messengerApp'));

  var UpdateproductCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UpdateproductCtrl = $controller('UpdateproductCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
