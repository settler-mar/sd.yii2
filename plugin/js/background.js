chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == "xhttp") {


        var xhr = new XMLHttpRequest();
        xhr.open(request.method, request.url, true); //  ГЕТ
        xhr.responseType='json';
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) // если всё прошло хорошо, выполняем, что в скобках
            {
                callback(xhr.response);
            }
        };
        xhr.send();

        return true; // prevents the callback from being called too early on return
    }
});




