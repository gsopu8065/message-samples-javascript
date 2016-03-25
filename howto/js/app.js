// initialize the messaging SDK
Max.init({
    clientId: 'edb2dfc4-0615-4c1d-822a-53e1612e14f5',
    clientSecret: 'CXL1lMmLoYayY1n84txOT_4e7IASUZf8tLz_6eF3C3c',
    baseUrl: 'http://192.168.58.1:8443/api'
});

Max.Config.payloadLogging = true;
Max.Config.logLevel = 'FINE';

// application logic should occur after onReady() is fired
Max.onReady(function() {

    // if current user is returned, that means the user is already logged in
    if (Max.getCurrentUser()) {
        handleLogin(true);
    } else {
        handleLogin();
    }
});