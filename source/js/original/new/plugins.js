var plugins = (function(){
    var isOpera = navigator.userAgent.indexOf(' OPR/') >= 0;
    var extensions = {
        'chrome': {
            'div_id': 'sd_chrome_app',
            'used': !!window.chrome && window.chrome.webstore !== null && !isOpera,
            'text':'Вы можете установить плагин для Хром бесплатно ....',
            'href': 'https://chrome.google.com/webstore/category/extensions'
        },
        'firefox': {
            'div_id': 'sd_firefox_app',
            'used':  typeof InstallTrigger !== 'undefined',
            'text':'Вы можете установить плагин для Fairfox бесплатно ....',
            'href': 'https://addons.mozilla.org/ru/firefox/'
        },
        'opera': {
            'div_id': 'sd_opera_app',
            'used': isOpera,
            'text':'Вы можете установить плагин для Opera бесплатно ....',
            'href': 'https://addons.opera.com/ru/extensions/?ref=page'
        }
    };


    function setPanel(text, href) {
        var closeDiv = document.createElement('a');
        closeDiv.innerHTML = '&times;';
        closeDiv.className = 'btn btn-mini btn-red btn-round install-plugin_close';
        closeDiv.onclick = closeClick;
        var textIn = '<div class="install-plugin_text">'+text+'</div>' +
            '<a class="btn btn-mini btn-round"  href="'+href+'" target="_blank">Установить&nbsp;плагин</a>';
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

    function closeClick(){
        $('.install-plugin').addClass('install-plugin_hidden');
    }

    window.onload = function() {
         setTimeout(function(){
            for (var key in extensions) {
                if (extensions[key].used) {
                    var appId = document.querySelector('#'+extensions[key].div_id);
                    if (!appId) {
                        setPanel(extensions[key].text, extensions[key].href);
                    }
                }
            }
        }, 3000);
    };

})();