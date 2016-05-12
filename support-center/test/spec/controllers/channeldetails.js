'use strict';

describe('Controller: ChanneldetailsCtrl', function () {

  // load the controller's module
  beforeEach(module('messengerApp'));

  var ChanneldetailsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ChanneldetailsCtrl = $controller('ChanneldetailsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
