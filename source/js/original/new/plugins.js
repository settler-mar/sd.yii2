var plugins = (function(){
    var isOpera = navigator.userAgent.indexOf(' OPR/') >= 0;
    var pluginInstallDivClass = 'install-plugin-index';
    var pluginInstallDivAccountClass = 'install-plugin-account';
    var cookiePanelHidden = 'sd-install-plugin-hidden';
    var cookieAccountDivHidden = 'sd-install-plugin-account-hidden';
    var extensions = {
        'chrome': {
            'div_id': 'sd_chrome_app',
            'used': !!window.chrome && window.chrome.webstore !== null && !isOpera,
            'text':'Вы можете установить плагин для Хром бесплатно ....',
            'href': 'https://chrome.google.com/webstore/category/extensions',
            'install_button_class': 'plugin-browsers-link-chrome'

        },
        'firefox': {
            'div_id': 'sd_firefox_app',
            'used':  typeof InstallTrigger !== 'undefined',
            'text':'Вы можете установить плагин для Fairfox бесплатно ....',
            'href': 'https://addons.mozilla.org/ru/firefox/',
            'install_button_class': 'plugin-browsers-link-firefox'
        },
        'opera': {
            'div_id': 'sd_opera_app',
            'used': isOpera,
            'text':'Вы можете установить плагин для Opera бесплатно ....',
            'href': 'https://addons.opera.com/ru/extensions/?ref=page',
            'install_button_class': 'plugin-browsers-link-opera'
        }
    };


    function setPanel(text, href) {
        var pluginInstallPanel = document.querySelector('#plugin-install-panel');//выводить ли панель
        if (pluginInstallPanel && getCookie(cookiePanelHidden) !== '1' ) {
            //если выводить и в куки не выключили
            var closeDiv = document.createElement('a');
            closeDiv.innerHTML = '&times;';
            closeDiv.className = 'btn btn-mini btn-red btn-round install-plugin_close';
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