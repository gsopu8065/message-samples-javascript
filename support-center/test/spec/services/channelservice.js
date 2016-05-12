'use strict';

describe('Service: channelService', function () {

  // load the service's module
  beforeEach(module('messengerApp'));

  // instantiate service
  var channelService;
  beforeEach(inject(function (_channelService_) {
    channelService = _channelService_;
  }));

  it('should do something', function () {
    expect(!!channelService).toBe(true);
  });

});
