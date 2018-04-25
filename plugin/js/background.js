var iconFlashInterval;
var iconFlashIntervalMax;
var defaultIcon = true;
var iconFlashTime = 300;//время мерцания
var stop = true;
var maxFlashInterval = 10000;//время для принудительного выключения
var storeCashback = false;
var currentTab = false;
var tabsCashback = [];

function displayCashback(cashback){
    cashback = cashback ? cashback.toString() : '';

    chrome.browserAction.setBadgeBackgroundColor({
        color: "#666"
    });

    cashback = cashback.replace(/^\s+/, "");

    chrome.browserAction.setBadgeText({
        text: cashback
    });
}

function toggleIcon() {
    var icon = defaultIcon ? 'img/favicon-32x32-little.png' : 'img/favicon-32x32.png';
    defaultIcon = !defaultIcon;

    chrome.browserAction.setIcon({
        path: icon
    });

    displayCashback(storeCashback);

    if (stop && defaultIcon){
        clearInterval(iconFlashInterval);
    }
}

function iconFlashStart(cashback) {
    tabsCashback[currentTab] = cashback;

    storeCashback = cashback;
    if (stop) {
        defaultIcon = true;
        clearInterval(iconFlashInterval);
        toggleIcon();
        iconFlashInterval = setInterval(toggleIcon, iconFlashTime);
    }
    stop = false;
    clearTimeout(iconFlashIntervalMax);
    //если не пришла команда на выключение, то выключаем сами
    iconFlashIntervalMax = setTimeout(iconFlashStop, maxFlashInterval);
}
//жёсткий стоп
function iconFlashForceStop(){
    stop = true;
    defaultIcon = true;
    chrome.browserAction.setIcon({
        path: 'img/favicon-32x32.png'
    });
    displayCashback(false);
    clearInterval(iconFlashInterval);
    clearTimeout(iconFlashIntervalMax);
}
//мягкий стоп
function iconFlashStop() {
    stop = true;
}

function encodeQueryData(data) {
    var result = [];
    for (var key in data)
        result.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    return result.join('&');
}

//очистка цифр иконки и стирание данных для текущей вкладки
function iconFlashClear(){
    iconFlashForceStop();
    tabsCashback[currentTab] = false;
    displayCashback(false);
}

chrome.tabs.onActiveChanged.addListener(function (tabId){
    iconFlashForceStop();
    currentTab = tabId;
    currentCashback = tabsCashback[currentTab] !== undefined && tabsCashback[currentTab] !== null ? tabsCashback[currentTab] : false;
    displayCashback(currentCashback);
});


chrome.runtime.onMessage.addListener(function(request, sender, callback) {

    if (request.action == "sd_xhttp") {

        var xhr = new XMLHttpRequest();
        var method = request.method || 'GET';
        if (method === 'GET') {
            request.url +='?g=plugin';
        } else if (method.toUpperCase() === 'POST') {
            request.data['g'] = 'plugin';
        }
        xhr.open(method, request.url, true);
        xhr.responseType='json';
        xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            //console.log(request.url, xhr.readyState, xhr.response);
            if (xhr.readyState == 4) // если всё прошло хорошо, выполняем, что в скобках
            {
                callback(xhr.response);
            }
        };
        xhr.send(encodeQueryData(request.data));

        return true; // prevents the callback from being called too early on return
    }

    if (request.action === "icon_flash_start") {
        iconFlashStart(request.cashback);
    }
    if (request.action === "icon_flash_stop") {
        iconFlashStop();
    }
    if (request.action === "icon_flash_clear") {
        iconFlashClear();
    }

});





