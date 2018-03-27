document.querySelector('.secretdiscounter-pupup__logo').onclick = logoClick;

function logoClick() {
    chrome.tabs.create({url: 'http://secretdiscounter.ru'});
}
