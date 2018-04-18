var plugins = (function(){
    var iconClose = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Capa_1" x="0px" y="0px" width="12px" height="12px" viewBox="0 0 357 357" style="enable-background:new 0 0 357 357;" xml:space="preserve"><g>'+
        '<g id="close"><polygon points="357,35.7 321.3,0 178.5,142.8 35.7,0 0,35.7 142.8,178.5 0,321.3 35.7,357 178.5,214.2 321.3,357 357,321.3     214.2,178.5   " fill="#FFFFFF"/>'+
        '</svg>';
    var isOpera = navigator.userAgent.indexOf(' OPR/') >= 0;
    var pluginInstallDivClass = 'install-plugin-index';
    var pluginInstallDivAccountClass = 'install-plugin-account';
    var cookiePanelHidden = 'sd-install-plugin-hidden';
    var cookieAccountDivHidden = 'sd-install-plugin-account-hidden';
    var extensions = {
        'chrome': {
            'div_id': 'sd_chrome_app',
            'used': !!window.chrome && window.chrome.webstore !== null && !isOpera,
            'text':'Установите наше расширение для браузера и больше никогда не пропустите кэшбэк!',
            'href': 'https://chrome.google.com/webstore/category/extensions',
            'install_button_class': 'plugin-browsers-link-chrome'

        },
        'firefox': {
            'div_id': 'sd_firefox_app',
            'used':  typeof InstallTrigger !== 'undefined',
            'text':'Установите наше расширение для браузера и больше никогда не пропустите кэшбэк!',
            'href': 'https://addons.mozilla.org/ru/firefox/',
            'install_button_class': 'plugin-browsers-link-firefox'
        },
        'opera': {
            'div_id': 'sd_opera_app',
            'used': isOpera,
            'text':'Установите наше расширение для браузера и больше никогда не пропустите кэшбэк!',
            'href': 'https://addons.opera.com/ru/extensions/?ref=page',
            'install_button_class': 'plugin-browsers-link-opera'
        }
    };


    function setPanel(text, href) {
        var pluginInstallPanel = document.querySelector('#plugin-install-panel');//выводить ли панель
        if (pluginInstallPanel && getCookie(cookiePanelHidden) !== '1' ) {
            //если выводить и в куки не выключили
            var closeDiv = document.createElement('a');
            closeDiv.innerHTML = iconClose;
            //closeDiv.className = 'btn btn-mini btn-red btn-round install-plugin_close';
            closeDiv.className = 'install-plugin_button-close';
            closeDiv.onclick = closeClick;
            var textIn = '<div class="install-plugin_text">' + text + '</div>' +
                '<a class="btn btn-mini btn-round"  href="' + href + '" target="_blank">Установить&nbsp;плагин</a>';
            var sectionInner = document.createElement('div');
            sectionInner.className = 'page-wrap install-plugin_inner';
            sectionInner.innerHTML = textIn;
            sectionInner.appendChild(closeDiv);
            var section = document.createElement('section');
            section.className = 'install-plugin';
            section.appendChild(sectionInner);
            var contentWrap = document.body.querySelector('.content-wrap');
            if (contentWrap) {
                contentWrap.insertBefore(section, contentWrap.firstChild);
            }
        }
    }

    function setButtonInstallVisible(buttonClass) {
        $('.' + pluginInstallDivClass).removeClass('hidden');
        $('.' + buttonClass).removeClass('hidden');
        if (getCookie(cookieAccountDivHidden) !== '1') {
            $('.' + pluginInstallDivAccountClass).removeClass('hidden');
        }
    }

    function closeClick(){
        $('.install-plugin').addClass('install-plugin_hidden');
        setCookie(cookiePanelHidden, '1');
    }

    $('.install-plugin-account-later').click(function(e) {
        e.preventDefault();
        setCookie(cookieAccountDivHidden, '1');
        $('.install-plugin-account').addClass('hidden');
    });


    window.onload = function() {
         setTimeout(function(){
            for (var key in extensions) {
                if (extensions[key].used) {
                    var appId = document.querySelector('#'+extensions[key].div_id);
                    if (!appId) {
                        //панель с кнопкой
                        setPanel(extensions[key].text, extensions[key].href);
                        //на главной  и в /account блоки с иконками и кнопками
                        setButtonInstallVisible(extensions[key].install_button_class);
                    }
                }
            }
        }, 3000);
    };

})();