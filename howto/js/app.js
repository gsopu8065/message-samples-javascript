// initialize the messaging SDK
Max.init({
    clientId: '<your client id>',
    clientSecret: '<your client secret>',
    baseUrl: 'https://sandbox.magnet.com/mobile/api'
});

Max.Config.payloadLogging = true;
Max.Config.logLevel = 'FINE';

// application logic should occur after onReady() is fired
Max.onReady(function() {

    // if current user is returned, it means the user is already logged in
    if (Max.getCurrentUser()) {
        handleLogin(true);
    } else {
        handleLogin();
    }
});