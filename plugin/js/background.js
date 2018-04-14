var iconFlashInterval;
var iconFlashIntervalMax;
var defaultIcon = true;
var iconFlashTime = 300;//время мерцания
var stop;
var maxFlashInterval = 10000;//время для принудительного выключения


function toggleIcon() {
    var icon = defaultIcon ? 'img/favicon-32x32-little.png' : 'img/favicon-32x32.png';
    defaultIcon = !defaultIcon;
    chrome.browserAction.setIcon({
        path: icon
    });
    if (stop && defaultIcon){
        clearInterval(iconFlashInterval);
    }
}

function iconFlashStart() {
    stop = false;
    defaultIcon = true;
    toggleIcon();
    iconFlashInterval = setInterval(toggleIcon, iconFlashTime);
    //если не пришла команда на выключение, то выключаем сами
    iconFlashIntervalMax = setInterval(iconFlashStop, maxFlashInterval);
}

function iconFlashStop() {
    stop = true;
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
        iconFlashStart()
    }
    if (request.action === "icon_flash_stop") {
        iconFlashStop()
    }

});





