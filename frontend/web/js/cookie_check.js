(function (window, document) {

    var transitionHref = $('#transition-href').attr('href');
    var enabledTransition = true;

    var Checker = {
        cookiesEnabled: false,
        adblockEnabled: false,

        init: function() {
            this.isMobile=!!isMobile.any();
            this.testCookies();
                if(this.isMobile && !this.cookiesEnabled){
                    enabledTransition = false;
                    this.showPop();
                } else {
                    this.testAd();
                }
        },
        testCookies: function () {
            setCookie('testWork','test');
            this.cookiesEnabled = (getCookie('testWork')==='test' ? true : false);
            eraseCookie('testWork');
        },
        testAd: function () {
            var $adDetect = $('.ad-detect:visible').length;
            this.adblockEnabled = ($adDetect>0);

            if((!this.adblockEnabled)){
                enabledTransition = false;
                this.showPop();
            }
        },
        showPop: function() {
            setTimeout(showMessage, 500);
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

    function showMessage(){
        var messageDiv = $('#transition-message');
        if (messageDiv) {
            var html = messageDiv.html();
            messageDiv.remove();
            $(html).find('#transition-message-transition-link').attr('href', transitionHref);
            $('#transition-wrapper').find('.center-block').addClass('transition-message').html(html);
        }
    }
    function goTransition(){
        if (enabledTransition) {
            window.location = transitionHref;
        }
    }
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
    setTimeout(goTransition, 5000);
}(window, document));