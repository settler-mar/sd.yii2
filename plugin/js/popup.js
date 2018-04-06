document.querySelector('.secretdiscounter-pupup__logo-link').onclick = doClick;
document.querySelector('.secretdiscounter-pupup__info').onclick = doClick;
document.querySelector('.secretdiscounter-pupup__login').onclick = doClick;


function doClick() {
    chrome.tabs.create({url: this.getAttribute('href')});
}

//var siteUrl = 'https://secretdiscounter.ru/';
var siteUrl = 'http://sdyii/';
var userUrl = 'account/notification';
var usersData;
var storeHtml = '<div class="secretdiscounter-extension__shop"><img class="secretdiscounter-extension__shop-logo" src="{{storeLogo}}"/>'+
    '<div class="secretdiscounter-extension__shop-text">{{storeText}}</div>'+
    '</div>'+
    '<div class="secretdiscounter-extension__buttons">'+
    '<a class="secretdiscounter-extension__link" href="{{storeUrl}}" target="_blank">Активировать&nbsp;кэшбэк</a>'+
    '</div>';
var notificationHTML = '<div class="secretdiscounter-extension__notificaton">'+
    '<div class="secretdiscounter-extension__notificaton-date">{{notyDate}}</div>'+
    '<div class="secretdiscounter-extension__notificaton-title">{{notyTitle}}</div>'+
    '<div class="secretdiscounter-extension__notificaton-text">{{notyText}}</div>'+
    '</div>';
var favoriteHTML = //'<div class="secretdiscounter-extension__favorite">'+
    '<div class="secretdiscounter-extension__shop"><img class="secretdiscounter-extension__shop-logo" src="{{storeLogo}}"/>'+
    '<div class="secretdiscounter-extension__shop-text">{{storeText}}</div>'+
    '<a class="secretdiscounter-extension__link" href="{{storeUrl}}" target="_blank">Активировать<br>кэшбэк</a>'+
    '</div>';
    //'</div>';

function getUser(callback){
    //вызываем событие для запроса из background.js
    chrome.runtime.sendMessage({
        action: 'xhttp',
        url: siteUrl + userUrl
    }, function (responseData) {
        usersData = responseData;
        //console.log(usersData);
        callback()
    });
}
var displayUser = function(){
    //console.log(usersData);
    if (usersData && usersData.user) {
        document.querySelector('.secretdiscounter-pupup__info-logo-circle').innerHTML = '<img class="secretdiscounter-pupup__info-logo-img" src="'+siteUrl+usersData.user.photo+'"/>';
        document.querySelector('.secretdiscounter-pupup__info-name').innerHTML = usersData.user.name;
        document.querySelector('.secretdiscounter-pupup__info-balance-current').innerHTML = usersData.user.balance.current;
        document.querySelector('.secretdiscounter-pupup__info-balance-pending').innerHTML = '&nbsp;/&nbsp;'+usersData.user.balance.pending;
        document.querySelector('.secretdiscounter-pupup__tab-favorites').style.display = 'block';
        document.querySelector('.secretdiscounter-pupup__tab-notifications').style.display = 'block';
        document.querySelector('.secretdiscounter-pupup__tab-shop label').style.display = 'block';
        document.querySelector('.secretdiscounter-pupup__login').style.display = 'none';
        document.querySelector('.secretdiscounter-pupup__logo-link').setAttribute('href', siteUrl);
        document.querySelector('.secretdiscounter-pupup__info').style.display = 'flex';
        document.querySelector('.secretdiscounter-pupup__tab-notifications .secretdiscounter-pupup__tab-content').innerHTML = makeNotifications();
        document.querySelector('.secretdiscounter-pupup__tab-favorites .secretdiscounter-pupup__tab-content').innerHTML = makeFavorites();

    } else {
        document.querySelector('.secretdiscounter-pupup__logo-link').setAttribute('href', siteUrl+'#login');
        document.querySelector('.secretdiscounter-pupup__info').style.display = 'none';
        document.querySelector('.secretdiscounter-pupup__login').style.display = 'block';
        document.querySelector('.secretdiscounter-pupup__tab-favorites').style.display = 'none';
        document.querySelector('.secretdiscounter-pupup__tab-notifications').style.display = 'none';
        document.querySelector('.secretdiscounter-pupup__tab-shop label').style.display = 'none';
        document.querySelector('.secretdiscounter-pupup__tab-notifications .secretdiscounter-pupup__tab-content').innerHTML = '';
        document.querySelector('.secretdiscounter-pupup__tab-favorites .secretdiscounter-pupup__tab-content').innerHTML = '';
    }

};

function replaceTemplate(template, items){
    items = items || {};
    for (var key in items) {
        template = template.replace('{{'+key+'}}', items[key]);
    }
    return template;
}
function makeCashback(displayedCashback, currency, action){
    var result = 'Кэшбэк<span class="cashback">';
    var cashbackNum = parseFloat(displayedCashback.replace(/[^\d.]+/g,""));
    var cashbackNumFinal = action == 1 ? cashbackNum * 2 : cashbackNum;
    if (!cashbackNum) {
        result += '10%';
    } else {
        result += displayedCashback.replace(/[\d.]+/, cashbackNumFinal) +
            (displayedCashback.match(/\%/) ? "" : " " + currency);
    }
    result +='</span>';
    result +=  (action == 1 && cashbackNum ? '<span class="cashback_old">'+cashbackNum+'</span>':'');
    return result;
}


function makeFavorites(){
    console.log(usersData.user);
    if (!usersData || !usersData.user.favorites_full) {
        return '';
    }
    result = '';
    for (var i = 0 ; i < usersData.user.favorites_full.length; i++) {
        result += replaceTemplate(favoriteHTML, {
            'storeLogo': siteUrl + 'images/logos/'+ usersData.user.favorites_full[i].logo,
            'storeText': makeCashback(
                usersData.user.favorites_full[i].displayed_cashback,
                usersData.user.favorites_full[i].currency,
                usersData.user.favorites_full[i].action_id
            ),
            'storeUrl': siteUrl + 'goto/store:' + usersData.user.favorites_full[i].uid
        });
    }
    return result;

}
function makeNotifications(){
    console.log(usersData);
    if (!usersData || !usersData.notifications) {
        return '';
    }
    result = '';
    for (var i = 0 ; i < usersData.notifications.length; i++) {
        result += replaceTemplate(notificationHTML, {
            'notyDate': usersData.notifications[i].data,
            'notyTitle': usersData.notifications[i].title,
            'notyText': usersData.notifications[i].text
        });
    }
    if (usersData.btn) {
        result += '<div class=""><a href="'+siteUrl + userUrl+'">'+usersData.btn+'</a></div>';
    }
    return result;
}

function getShop(callback) {
    callback();
}
var displayShop = function(){
    document.querySelector('.secretdiscounter-pupup__tab-shop .secretdiscounter-pupup__tab-content').innerHTML = storeHtml;
};

getUser(displayUser);

getShop(displayShop);
