'use strict';

describe('Controller: CreatesnippetCtrl', function () {

  // load the controller's module
  beforeEach(module('messengerApp'));

  var CreatesnippetCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CreatesnippetCtrl = $controller('CreatesnippetCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
