
utils.makeHrefs(document);//события для ссылок на форме

var usersData;


function getUser(callback){
    //вызываем событие для запроса из background.js
    chrome.runtime.sendMessage({
        action: 'sd_xhttp',
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
        document.querySelector('.secretdiscounter-pupup__tabs').classList.remove('logout');
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
        var tabNotifications = document.querySelector('.secretdiscounter-pupup__tab-notifications .secretdiscounter-pupup__tab-content');
        tabNotifications.innerHTML = makeNotifications();
        utils.makeHrefs(tabNotifications);
        var tabFavorites = document.querySelector('.secretdiscounter-pupup__tab-favorites .secretdiscounter-pupup__tab-content');
        tabFavorites.innerHTML = makeFavorites();
        utils.makeHrefs(tabFavorites)
    } else {
        document.querySelector('.secretdiscounter-pupup__tabs').classList.add('logout');
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
    //console.log(usersData.user);
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
    //console.log(usersData);
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
        result += '<div class="secretdiscounter-extension__notification-button"><a class="secretdiscounter-extension__notificaton-link btn" href="'+siteUrl + userUrl+'">'+usersData.btn+'</a></div>';
    }
    return result;
}


var displayShop = function(shop){
    console.log('вывод шопа', shop);
    document.querySelector('.secretdiscounter-pupup__tab-shop .secretdiscounter-pupup__tab-content').innerHTML =
        utils.replaceTemplate(storeHtml, {
            'storeLogo': siteUrl + 'images/logos/'+ shop.logo,
            'storeText': utils.makeCashback(
                shop.displayed_cashback,
                shop.currency,
                shop.action_id
            ),
            'storeUrl': siteUrl + 'goto/store:' + shop.uid,
            'btnText': usersData && usersData.user ? 'Активировать&nbsp;кэшбэк' : 'Активировать&nbsp;кэшбэк',
            'storeTariffs': shop.conditions ? shop.conditions : ''
        });
};

getUser(displayUser);

chrome.tabs.getSelected(null,function(tab) {
    //получить юрл текущей вкладки
    //затем грузим данные, после - поиск шопа и вывод
    //console.log(tab, tab.url);
    Storage.load(function () {
        storageDataDate = Storage.get(storageDataKeyDate);
        storageDataStores = Storage.get(storageDataKeyStores);
        console.log('storage load');
        if (!storageDataDate || !storageDataStores
            || storageDataDate + 1000 * 60 * 60 * 24 < new Date().getTime()) {
            getData(storeUtil.findShop(storageDataStores.stores, tab.url, displayShop));
            //поиск шопа или после загрузки данных
        } else {
            storeUtil.findShop(storageDataStores.stores, tab.url, displayShop);
            //или сразу
        }
    });

});




