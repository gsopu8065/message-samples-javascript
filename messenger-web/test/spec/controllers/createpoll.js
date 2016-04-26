'use strict';

describe('Controller: CreatepollCtrl', function () {

  // load the controller's module
  beforeEach(module('messengerApp'));

  var CreatepollCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CreatepollCtrl = $controller('CreatepollCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
