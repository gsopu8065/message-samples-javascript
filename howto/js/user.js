var User = {

    register: function() {
        var inputs = collectFormData('feature-container');

        // register a new user
        Max.User.register(inputs).success(function(user) {
            renderResults('user registered!');

            // login with the newly registered user
            Max.User.login(inputs.userName, inputs.password).success(function() {
                renderResults('<br />logged in!', true);
                handleLogin(true);
                listenForInvites();
            });

        }).error(function(e) {
            renderResults('ERROR! ' + e);
        });
    },

    login: function() {
        var inputs = collectFormData('feature-container');

        // login with the given user
        Max.User.login(inputs.userName, inputs.password).success(function() {
            renderResults('logged in!');
            handleLogin(true);
            listenForInvites();
        }).error(function(e) {
            renderResults('ERROR! ' + e);
        });
    },

    logout: function() {

        // logout to clear session and disconnect
        Max.User.logout().success(function() {
            renderResults('logged out!');
            handleLogin();
        });
    },

    search: function() {
        var inputs = collectFormData('feature-container');

        // search for users using query. accepts key-value pairs like {userName: 'jane.doe'} or advanced ElasticSearch
        // query string such as: userName:*jane.doe* or firstName:*jane*%20OR%20lastName:*doe*
        var resultsPerPage = 1000, offset = 0;
        Max.User.search(inputs.searchQuery, resultsPerPage, offset).success(function(users) {

            renderResults(userDisplayHelper(users));
        });
    },

    getUsersByUserNames: function() {
        var inputs = collectFormData('feature-container');

        // search for users using a list of userNames
        var userNameList = [inputs.userName];
        Max.User.getUsersByUserNames(userNameList).success(function(users) {

            renderResults(userDisplayHelper(users));
        });
    },

    getUsersByUserIds: function() {
        var inputs = collectFormData('feature-container');

        // search for users using a list of userNames
        var userIdList = [inputs.userId];
        Max.User.getUsersByUserIds(userIdList).success(function(users) {

            renderResults(userDisplayHelper(users));
        });
    },

    updateProfile: function() {
        var inputs = collectFormData('feature-container');

        // update user profile
        var currentUser = Max.getCurrentUser();
        currentUser.updateProfile(inputs).success(function() {

            var updatedUser = Max.getCurrentUser();

            renderResults('updated user!' +
                '<br />' + 'userName: ' + updatedUser.userName +
                ', ' + 'firstName: ' + updatedUser.firstName +
                ', ' + 'lastName: ' + updatedUser.lastName
            );
        }).error(function(e) {
            renderResults('ERROR! ' + e);
        });
    }
};