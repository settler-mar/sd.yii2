document.querySelector('.secretdiscounter-pupup__logo-link').onclick = doClick;
document.querySelector('.secretdiscounter-pupup__info').onclick = doClick;
document.querySelector('.secretdiscounter-pupup__login').onclick = doClick;


function doClick() {
    chrome.tabs.create({url: this.getAttribute('href')});
}

var usersData;


function getUser(callback){
    //вызываем событие для запроса из background.js
    chrome.runtime.sendMessage({
        action: 'xhttp',
        url: siteUrl + userUrl
    }, function (responseData) {
        usersData = responseData;
        console.log(usersData);
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



function makeFavorites(){
    console.log(usersData.user);
    if (!usersData || !usersData.user.favorites_full) {
        return '';
    }
    result = '';
    for (var i = 0 ; i < usersData.user.favorites_full.length; i++) {
        result += utils.replaceTemplate(favoriteHTML, {
            'storeLogo': siteUrl + 'images/logos/'+ usersData.user.favorites_full[i].logo,
            'storeText': utils.makeCashback(
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
        result += utils.replaceTemplate(notificationHTML, {
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
