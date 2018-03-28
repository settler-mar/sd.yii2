var plugins = (function(){

    var myAppId = 'sd_chrome_app';

    var isChrome = !!window.chrome && !!window.chrome.webstore;
    //console.log(isChrome);

    if (isChrome) {

        var myAppDiv = $('#'+myAppId);
        if (myAppDiv) {
          //console.log('Установлен плагин');
        } else {
            //напоминание что можно ставить плагин
        }
        // console.log('send_message');
        // chrome.runtime.sendMessage('sd_chrome_extension_125689', {
        //     action: 'chrome_plugin_installed'
        // }, function (data) {
        //     console.log('data', data);
        //
        // });

    }




})();