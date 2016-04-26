var featureContainer;
var featureTitle;
var featureList;
var allFeatureItems;
var noAuthFeatureItems;
var resultContainer;
var userInfoContainer;
var loginFeatureItem;

$(document).ready(function() {
    featureContainer = $('#feature-container');
    featureTitle = $('#feature-title');
    featureList = $('#feature-list a');
    allFeatureItems = $('.list-group-item');
    noAuthFeatureItems = $('.list-group-item[class~="no-auth-required"]');
    userInfoContainer = $('#user-info-container');
    loginFeatureItem = $('.list-group-item.no-auth-required').first();

    featureList.click(function(e) {
        e.preventDefault();
        featureList.removeClass('active');
        $(this).addClass('active');
    });

    featureContainer.find('a').click(function(e) {
        e.preventDefault();
        return false;
    });
});

function renderTmpl(id, title, extras) {
    extras = extras || {};
    featureTitle.html((id ? id.replace(/-/g, ' ') : '') + (title ? (' - ' + title) : ''));
    featureContainer.html(id ? tmpl(id, Max.Utils.mergeObj(extras, {
        currentUser: Max.getCurrentUser()
    })) : '');
}

function handleLogin(enable) {
    if (enable) {
        allFeatureItems.show();
        userInfoContainer.html('logged in as <b>' + (Max.getCurrentUser() || {}).userName + '</b>');
    } else {
        allFeatureItems.hide();
        noAuthFeatureItems.show();
        userInfoContainer.html('');
        renderTmpl();
        loginFeatureItem.addClass('active').next().addClass('in');
    }
}

function collectFormData(containerId) {
    var obj = {};
    $('#' + containerId).find('input, textarea, select').each(function() {
        var val = $.trim($(this).val());
        if (['true', 'false'].indexOf(val) != -1) {
            val = val === 'true';
        }
        obj[$(this).attr('name')] = val
    });
    return obj;
}

function clearFormData(containerId) {
    $('#' + containerId).find('input, textarea, select').each(function() {
        $(this).val('');
    });
}

function renderResults(output, insertType, target) {
    insertType = (insertType === true || insertType === false) ? 'append' : insertType;
    resultContainer = $(target || '#results');
    resultContainer[insertType ? insertType : 'html'](output);
    resultContainer.css('opacity', 0);
    resultContainer.animate({
        opacity: 1
    }, 500);
}

function channelDisplayHelper(channelsOrChannels) {
    var parent = $('<ul class="list-group"></ul>');

    if (channelsOrChannels.constructor !== Array) {
        channelsOrChannels = [channelsOrChannels];
    }

    for (var key in channelsOrChannels) {
        var channel = channelsOrChannels[key];
        var row = $('<a href="#" class="list-group-item" index="' + key + '">' + channel.name
            + (channel.isPublic ? '' : ' <span class="glyphicon glyphicon-lock"></span>') + '</a>');

        row.click(function(event) {
            Channel.goToChannel(event, channelsOrChannels[parseInt($(this).attr('index'))]);
        });

        parent.append(row);
    }
    return channelsOrChannels.length ? (parent) : '<div class="panel panel-default">no channels found</div>';
}

function userDisplayHelper(userOrUsers) {
    var html = '';

    if (userOrUsers.constructor !== Array) {
        userOrUsers = [userOrUsers];
    }

    for (var key in userOrUsers) {
        html += '<li class="list-group-item" did="' + userOrUsers[key].userId + '"><b>'
            + userOrUsers[key].userName + '</b> (id: ' + userOrUsers[key].userId + ')' +  '</li>';
    }
    return userOrUsers.length ? ('<ul class="list-group">' + html + '</ul>') : '<div class="panel panel-default">no users found</div>';
}

function messageDisplayHelper(messageOrMessages) {
    var html = '';

    if (messageOrMessages.constructor !== Array) {
        messageOrMessages = [messageOrMessages];
    }

    for (var i=0;i<messageOrMessages.length;++i) {
        html += '<b>' + messageOrMessages[i].sender.userName + '</b>: '
            + messageOrMessages[i].messageContent.message + '<br />';
    }
    return html || 'no messages found';
}
