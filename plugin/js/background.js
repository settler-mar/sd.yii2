var showCashback = true;//это настройка, выводить ли кэшбек
var iconFlashInterval;
var iconFlashIntervalMax;
var defaultIcon = true;
var iconFlashTime = 300;//время мерцания
var stop = true;
var maxFlashInterval = 10000;//время для принудительного выключения
var storeCashback = false;


function toggleIcon() {
    var icon = defaultIcon ? 'img/favicon-32x32-little.png' : 'img/favicon-32x32.png';
    defaultIcon = !defaultIcon;
    var cashback = storeCashback ? storeCashback.toString() : '';

    chrome.browserAction.setIcon({
        path: icon
    });
    chrome.browserAction.setBadgeBackgroundColor({
       color: "#666"
    });

    cashback = cashback.replace(/^\s+/, "");

    chrome.browserAction.setBadgeText({
        text: cashback
    });

    if (stop && defaultIcon){
        clearInterval(iconFlashInterval);
    }
}

function iconFlashStart(cashback) {
    //todo пока только передали кэшбэк
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

function iconFlashStop() {
    //storeCashback = false;
    stop = true;
}

function iconFlashClearCashback(){
    storeCashback = false;
    if (!stop) {
        //если идёт моргание, пусть само правильно закончится
        stop = true;
    } else {
        //иначе просто очищаем надпись
        chrome.browserAction.setBadgeText({
            text: ''
        });
    }
}

function encodeQueryData(data) {
    var result = [];
    for (var key in data)
        result.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    return result.join('&');
}


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
    if (request.action === "icon_flash_clear_cashback") {
        iconFlashClearCashback();
    }

});





