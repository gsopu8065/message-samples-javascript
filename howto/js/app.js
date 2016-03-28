// application logic should occur after onReady() is fired
Max.onReady(function() {

    // if current user is returned, it means the user is already logged in
    if (Max.getCurrentUser()) {
        handleLogin(true);
        listenForInvites();
    } else {
        handleLogin();
    }
});

function listenForInvites() {
    // register a listener to listen for channel invites
    var listener = new Max.EventListener('myInviteListener', {

        // listen for incoming channel invitation requests from other users
        invite: function(invite) {
            // invitation has been received
            var comments = invite.comments;
            var sender = invite.sender;
            var channel = invite.channel;

            var confirmation = confirm('You have received an invitation to join the channel "'
                + channel.name + '" ' + 'from user "' + sender.userName + '" with comment "' + comments + '".');

            if (confirmation) {
                var acceptComment = 'sure, thank you!';
                invite.accept(acceptComment).success(function() {
                    // invitation has been accepted. current user is now subscribed to the channel
                });
            } else {
                var declineComment = 'no thanks, im not interested';
                invite.decline(declineComment).success(function() {
                    // invitation has been declined.
                });
            }
        },

        // listen for incoming responses to channel invitations the current user has sent out
        inviteResponse: function(inviteResponse) {

            var user = inviteResponse.sender; // the invitation response sender
            var channel = inviteResponse.channel;
            var comments = inviteResponse.comments;
            var hasAcceptedInvite = inviteResponse.accepted; // true if invitee accepted

            alert('User "' + user.userName + '" has ' + (hasAcceptedInvite ? 'accepted' : 'declined') + ' the' +
                ' invitation to channel "' + channel.name + '" with comment "'+comments+'".');
        }

    });
    Max.registerListener(listener);
}