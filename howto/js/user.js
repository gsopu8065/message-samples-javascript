var User = {

    register: function() {
        var inputs = collectFormData('feature-container');

        // register a new user
        Max.User.register(inputs).success(function(user) {
            renderResults('user registered!');

            // login with the newly registered user
            Max.User.login(inputs.userName, inputs.password).success(function() {
                renderResults('<br />logged in!', true);
                clearFormData('feature-container');
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
            clearFormData('feature-container');
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
        Max.User.updateProfile(inputs).success(function() {

            var updatedUser = Max.getCurrentUser();

            renderResults('updated user!' +
                '<br />' + 'userName: ' + updatedUser.userName +
                ', ' + 'firstName: ' + updatedUser.firstName +
                ', ' + 'lastName: ' + updatedUser.lastName
            );
        }).error(function(e) {
            renderResults('ERROR! ' + e);
        });
    },

    getBlockedUsers: function() {
        var self = this;

        // get all users blocked by the current user
        Max.UserPreferences.getBlockedUsers().success(function(users) {
            renderResults(userDisplayHelper(users));

            $('#results .list-group-item').each(function() {
                $(this).append(' <button class="btn btn-primary btn-sm">Unblock</button>').click(function() {
                    self.unblockUsers($(this).attr('did'));
                });
            });

        }).error(function(e) {
            renderResults('ERROR! ' + e);
        });

    },

    blockUsers: function() {
        var inputs = collectFormData('feature-container');

        // find recipient using the userName provided
        var userNameList = [inputs.userName];
        Max.User.getUsersByUserNames(userNameList).success(function(users) {

            // no users found, dont continue
            if (!users.length) {
                renderResults('no users by that userName found');
                return;
            }

            // block communication with the specified users
            Max.UserPreferences.blockUsers(users).success(function(status) {
                renderResults('<div class="panel panel-default">' + status + '</div>');
            }).error(function(e) {
                renderResults('ERROR! ' + e);
            });
        });

    },

    unblockUsers: function(userId) {

        // unblock communication with the specified users
        Max.UserPreferences.unblockUsers(userId).success(function(status) {
            renderResults('<div class="panel panel-default">' + status + '</div>');
        }).error(function(e) {
            renderResults('ERROR! ' + e);
        });
    }

};
