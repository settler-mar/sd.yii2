(function (window, document) {

    var Checker = {
        cookiesEnabled: false,
        adblockEnabled: false,

        options: {
            showPopup: true,
            allowClose: false,
            lang: 'ru'
        },

        href:'abp:subscribe?location=https://secretdiscounter.ru/adblock.txt&title=secretdiscounter',
        langText: {
            ru: {
                title: 'ВНИМАНИЕ: <span style="color:red;">Ваш кэшбэк не отслеживается!</span>',
                description: 'Настройки вашего браузера не позволяют использовать файлы cookies, без которых невозможно отследить ваш кэшбэк или использовать промокод, возможны и другие ошибки.',
                listTitle: 'Проблема может быть вызвана:',
                button: 'Настроить Adblock',
                browserSettings: '<h4>Настройками вашего браузера</h4> ' +
                '<p>Зайдите в настройки браузера и разрешите использование файлов cookie. </p>',
                adblockSettings: '<h4>Сторонним расширением типа AdBlock</h4> ' +
                '<p>Просто добавьте наш сайт в <a href="___adblockLink___">белый список</a> в настройках AdBlock. </p>'
            },
        },

        init: function() {
            this.isMobile=!!isMobile.any();
            /*this.testCookies();
            if(this.isMobile && !this.cookiesEnabled){
                this.showPopup();
            }else{
                this.testAd();
            }*/
            if(!this.isMobile){
                this.testAd();
            }
        },
        testCookies: function () {
            setCookie('testWork','test');
            this.cookiesEnabled = (getCookie('testWork')==='test'?true:false);
            eraseCookie('testWork');
        },
        testAd: function () {
            var $adDetect = $('.ad-detect:visible').length;
            this.adblockEnabled = ($adDetect>0);

            if((!this.adblockEnabled || !this.cookiesEnabled)){
                this.showPopup();
            }
        },
        showPopup: function() {
            setTimeout(this.showPop.bind(this),500);
        },
        showPop: function() {
            if(getCookie('adBlockShow')){
                return;
            }
            setCookie('adBlockShow','show');

            var lang = this.langText.ru;
            var text='';


            text+='<h3 style="text-align: center;font-weight: bold;">';
            text+=lang.title;
            text+='</h3>';
            text+='<p>';
            text+=lang.description;
            text+='</p>';
            text+='<h3>';
            text+=lang.listTitle;
            text+='</h3>';
            text+='<div class="ad_recomend help-msg">';
            text+='<div>'+lang.browserSettings+'</div>';
            text+='<div>'+lang.adblockSettings+'</div>';
            text+='</div>';

            text=text.replace('___adblockLink___',this.href);
            notification.alert({
                buttonYes:lang.button,
                buttonTag:'a',
                buttonYesDop:'href="'+this.href+'"',
                notyfy_class:"notify_white",
                question: text,

            });
        }
    };

    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    function getCookie(n) {
        return unescape((RegExp(n + '=([^;]+)').exec(document.cookie) || [1, ''])[1]);
    }
    function setCookie(name, value) {
        var cookie_string = name + "=" + escape ( value );
        document.cookie = cookie_string;
    }
    function eraseCookie(name){
        var cookie_string = name + "=0" +"; expires=Wed, 01 Oct 2017 00:00:00 GMT";
        document.cookie = cookie_string;
    }
    Checker.init();
    //setTimeout(Checker.init,100);
}(window, document));