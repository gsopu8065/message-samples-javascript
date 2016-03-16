'use strict';

describe('Controller: ShowsnippetCtrl', function () {

  // load the controller's module
  beforeEach(module('messengerApp'));

  var ShowsnippetCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ShowsnippetCtrl = $controller('ShowsnippetCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
