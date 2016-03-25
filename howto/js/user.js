var User = {

    register: function() {
        var inputs = collectFormData('feature-container');

        // register a new user
        Max.User.register(inputs).success(function(user) {
            updateResults('user registered!');

            // login with the newly registered user
            Max.User.login(inputs.userName, inputs.password).success(function() {
                updateResults('<br />logged in!', true);
                handleLogin(true);
            });

        }).error(function(e) {
            updateResults('ERROR! ' + e);
        });
    },

    login: function() {
        var inputs = collectFormData('feature-container');

        // login with the given user
        Max.User.login(inputs.userName, inputs.password).success(function() {
            updateResults('logged in!');
            handleLogin(true);
        }).error(function(e) {
            updateResults('ERROR! ' + e);
        });
    },

    logout: function() {

        // logout to clear session and disconnect
        Max.User.logout().success(function() {
            updateResults('logged out!');
            handleLogin();
        });
    },

    search: function() {
        var inputs = collectFormData('feature-container'), html = '';

        // search for users using query. accepts key-value pairs like {userName: 'jane.doe'} or advanced ElasticSearch
        // query string such as: userName:*jane.doe* or firstName:*jane*%20OR%20lastName:*doe*
        var resultsPerPage = 10, offset = 0;
        Max.User.search(inputs.searchQuery, resultsPerPage, offset).success(function(users) {
            for (var key in users) {
                html += '<li><b>' + users[key].userName + '</b> (id: ' + users[key].userId + ')' +  '</li>';
            }
            updateResults('<ul>' + html + '</ul>');
        });
    },

    getUsersByUserNames: function() {
        var inputs = collectFormData('feature-container'), html = '';

        // search for users using a list of userNames
        var userNameList = [inputs.userName];
        Max.User.getUsersByUserNames(userNameList).success(function(users) {
            for (var key in users) {
                html += '<li><b>' + users[key].userName + '</b> (id: ' + users[key].userId + ')' +  '</li>';
            }
            updateResults('<ul>' + html + '</ul>');
        });
    },

    getUsersByUserIds: function() {
        var inputs = collectFormData('feature-container'), html = '';

        // search for users using a list of userNames
        var userIdList = [inputs.userId];
        Max.User.getUsersByUserIds(userIdList).success(function(users) {
            for (var key in users) {
                html += '<li><b>' + users[key].userName + '</b> (id: ' + users[key].userId + ')' +  '</li>';
            }
            updateResults('<ul>' + html + '</ul>');
        });
    },

    updateProfile: function() {
        var inputs = collectFormData('feature-container');

        // update user profile
        var currentUser = Max.getCurrentUser();
        currentUser.updateProfile(inputs).success(function() {

            var updatedUser = Max.getCurrentUser();

            updateResults('updated user!' +
                '<br />' + 'userName: ' + updatedUser.userName +
                ', ' + 'firstName: ' + updatedUser.firstName +
                ', ' + 'lastName: ' + updatedUser.lastName
            );
        }).error(function(e) {
            updateResults('ERROR! ' + e);
        });
    }
};