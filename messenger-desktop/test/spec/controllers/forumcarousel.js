'use strict';

describe('Controller: ForumcarouselCtrl', function () {

  // load the controller's module
  beforeEach(module('messengerApp'));

  var ForumcarouselCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ForumcarouselCtrl = $controller('ForumcarouselCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
