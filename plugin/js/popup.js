document.querySelector('.secretdiscounter-pupup__logo').onclick = logoClick;

function logoClick() {
    chrome.tabs.create({url: 'http://secretdiscounter.ru'});
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
    console.log(usersData);
    if (usersData && usersData.user) {
        document.querySelector('.secretdiscounter-pupup__info-logo').innerHTML = '<img src="'+siteUrl+usersData.user.photo+'"/>';
        document.querySelector('.secretdiscounter-pupup__info-name').innerHTML = usersData.user.name;
        document.querySelector('.secretdiscounter-pupup__info-balance').innerHTML = 'Баланс '+usersData.user.balance.current;
    }
};

getUser(displayUser);
