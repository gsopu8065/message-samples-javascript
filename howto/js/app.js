// initialize the messaging SDK
Max.init({
    clientId: '<your client id>',
    clientSecret: '<your client secret>'
});

// application logic should occur after onReady() is fired
Max.onReady(function() {

    // if current user is returned, it means the user is already logged in
    if (Max.getCurrentUser()) {
        handleLogin(true);
    } else {
        handleLogin();
    }
});