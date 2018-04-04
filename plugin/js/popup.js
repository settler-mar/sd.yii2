document.querySelector('.secretdiscounter-pupup__logo-link').onclick = doClick;
document.querySelector('.secretdiscounter-pupup__info').onclick = doClick;

function doClick() {
    chrome.tabs.create({url: this.getAttribute('href')});
}

var siteUrl = 'https://secretdiscounter.ru/';
//var siteUrl = 'http://sdyii/';
var userUrl = 'account/notification';
var usersData;

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
    }
};

getUser(displayUser);
