var showCashback = true;//это настройка, выводить ли кэшбек
var iconFlashInterval;
var iconFlashIntervalMax;
var defaultIcon = true;
var iconFlashTime = 300;//время мерцания
var stop = true;
var maxFlashInterval = 10000;//время для принудительного выключения
var storeCashback = false;

function getImage(src, cashback, callback) {
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d')
    var img = new Image();
    var imgWidth = 32;
    var imgHeight = 32;
    var textHeight = 14;
    var textWidth = 28;
    var imageData = null;
    img.crossOrigin = 'anonymous';

    img.onload = function() {
        c.width = imgWidth;//this.width;
        c.height = imgWidth;//this.height;
        ctx.drawImage(this, 0, 0);
        if (cashback !== false && showCashback) {
            //ctx.font = "bold 20px Verdana";
            ctx.font = (textHeight + 4) + "px Arial";
            ctx.fillStyle = "#333";
            ctx.fillRect(0, imgHeight-textHeight-4, textWidth, textHeight+4);
            ctx.fillStyle = "#fff";
            ctx.fillText(cashback, 1, imgHeight - 2);
        }
        imageData = ctx.getImageData(0, 0, c.width, c.height);
        callback(imageData);
    };

    img.src = src;
}



function toggleIcon() {
    var icon = defaultIcon ? 'img/favicon-32x32-little.png' : 'img/favicon-32x32.png';
    //var icon = defaultIcon ? 'img/logo_mini_32.png' : 'img/favicon-32x32.png';
    defaultIcon = !defaultIcon;
    // chrome.browserAction.setIcon({
    //     path: icon
    // });
    getImage(icon, storeCashback,  function(imageData) {
        chrome.browserAction.setIcon({
            imageData: imageData
        });
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
    storeCashback = false;
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
        iconFlashStart(request.cashback);
    }
    if (request.action === "icon_flash_stop") {
        iconFlashStop();
    }

});





