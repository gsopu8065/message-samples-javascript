var featureContainer;
var featureTitle;
var featureList;
var allFeatureItems;
var noAuthFeatureItems;
var resultContainer;
var userInfoContainer;

$(document).ready(function() {
    featureContainer = $('#feature-container');
    featureTitle = $('#feature-title');
    featureList = $('#feature-list a');
    allFeatureItems = $('.list-group-item');
    noAuthFeatureItems = $('.list-group-item[class~="no-auth-required"]');
    userInfoContainer = $('#user-info-container');

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

function renderTmpl(id) {
    featureTitle.html(id || '');
    featureContainer.html(id ? tmpl(id, Max.getCurrentUser()) : '');
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
    }
}

function collectFormData(containerId) {
    var obj = {};
    $('#' + containerId).find('input, textarea').each(function() {
        obj[$(this).attr('name')] = $(this).val();
    });
    return obj;
}

function updateResults(output, isAppend) {
    resultContainer = $('#results');
    resultContainer[isAppend ? 'append' : 'html'](output);
    resultContainer.css('opacity', 0).css('background-color', '#dff0d8').css('border', 'solid 1px #888');
    resultContainer.animate({
        opacity: 1
    }, 1000, function() {
        setTimeout(function() {
            resultContainer.css('background-color', '#fff');
        }, 3000);
    });
}