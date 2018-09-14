(function (window, document) {

  var transitionHref = document.querySelector('#transition-href').getAttribute('href');
  var storeRoute = document.querySelector('#transition-href').getAttribute('data-route');
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
      //this.makeEnabledId();

    },
    testCookies: function () {
      setCookie('testWork','test');
      this.cookiesEnabled = (getCookie('testWork')==='test' ? true : false);
      eraseCookie('testWork');
    },
    testAd: function () {
      var adDetect = document.querySelector('.ad-detect');
      this.adblockEnabled = adDetect && (adDetect.style.display !== 'none');

      if((!this.adblockEnabled)){
        enabledTransition = false;
        this.showPop();
      }
    },
    showPop: function() {
      setTimeout(showMessage, 500);
    }
    //,
    // makeEnabledId: function () {
    //     if (enabledTransition) {
    //         var divId =  document.createElement('div');
    //         divId.id = 'sd_shop_id';
    //         divId.setAttribute('code', storeRoute);
    //         divId.className = 'transition_hidden';
    //         document.body.insertBefore(divId, document.body.firstChild);
    //     }
    // }
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
    var messageDiv = document.querySelector('#transition-message');
    if (messageDiv) {
      var html = messageDiv.innerHTML;
      messageDiv.remove();
      var centerBlock = document.querySelector('#transition-wrapper .center-block');
      centerBlock.classList.add('transition-message');
      centerBlock.innerHTML = html;
      document.querySelector('#transition-message-transition-link').setAttribute('href', transitionHref);
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