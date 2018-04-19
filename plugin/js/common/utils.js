console.log('utils.js');

var utils = (function(){
    function replaceTemplate(template, items){
        items = items || {};
        for (var key in items) {
            //template = template.replace('{{'+key+'}}', items[key]);
            template = template.replace(new RegExp('{{'+key+'}}', 'g'), items[key]);
        }
        return template;
    }

    function makeCashback(displayedCashback, currency, action, simple){
        //simple = simple || false;//просто кешбек без тэгов
        var cashbackNum = parseFloat(displayedCashback.replace(/[^\d.]+/g,""));
        var cashbackNumFinal = action == 1 ? cashbackNum * 2 : cashbackNum;

        //если простой вывод то отсекаем лишние символы
        if(simple){
            displayedCashback=cashbackNum+(displayedCashback.indexOf('%')>0?' %':'');
        }

        if (cashbackNum > 0) {
            result = displayedCashback.replace(/[\d.]+/, cashbackNumFinal) + (displayedCashback.match(/\%/) ? "" : " " + currency);
            result = simple ? result : '<span class="cashback">'+ result +'</span>';
        } else {
            result = simple ? '\u2764' : '<span class="cashback cashback-charity">&#x2764;</span>';

        }
        if (action == 1 && cashbackNum > 0 && !simple) {
            var cashbackOld = displayedCashback + (displayedCashback.match(/\%/) ? "" : " " + currency);
            result +=  '<span class="cashback_old">'+cashbackOld+'</span>';
        }
        return result;
    }

    // function makeCashbackNum(displayedCashback, action){
    //     var cashbackNum = parseFloat(displayedCashback.replace(/[^\d.]+/g,""));
    //     return action == 1 ? cashbackNum * 2 : cashbackNum;
    // }

    function ucfirst(str) {   // Make a string&#039;s first character uppercase
        var f = str.charAt(0).toUpperCase();
        return f + str.substr(1, str.length - 1);
    }

    function doClick(e){
        var store = this.getAttribute('data-store');
        if (store) {
            Storage.set(storeActiveStorageName+store, new Date().getTime());
            if (debug) {
                console.log(storeActiveStorageName+store, Storage.get(storeActiveStorageName+store));
            }
        }
        if (chrome.tabs){
            //из окна плагина
            e.preventDefault();
            chrome.tabs.create({url: this.getAttribute('href')});
        }
    }

    function doClickPlugunClose(e){
        var store = this.getAttribute('data-store');
        if (store) {
            Storage.set(storeActiveStorageName+store, new Date().getTime());
            if (debug) {
                console.log(storeActiveStorageName+store, Storage.get(storeActiveStorageName+store));
            }
        }
        document.querySelector('.secretdiscounter-extension').style.display = 'none';
        if (chrome.tabs){
            //из окна плагина
            e.preventDefault();
            chrome.tabs.create({url: this.getAttribute('href')});
        }
    }

    function storeIsActivate(storeRoute){
        var storeActiveDate = Storage.get(storeActiveStorageName+storeRoute);
        var isActive = storeActiveDate !== null &&  new Date().getTime() - storeActiveDate < storeActiveInterval * 60 * 1000;
        // if (debug) {
        //     console.log(storeActiveStorageName+storeRoute,  storeActiveDate, isActive, (new Date().getTime() - storeActiveDate)/(60 * 1000));
        // }
        return isActive;
    }

    function makeHrefs(elem, handler){
        handler = handler || doClick;
        var elements = elem.getElementsByTagName('a');
        for (var i = 0; i < elements.length; i++){
            elements[i].onclick = handler;
        }
    }

    function copyToClipboard() {
        var code = this.getAttribute('data-clipboard');
        var temp = document.createElement('input');
        document.body.appendChild(temp);
        temp.value = code;
        temp.select();
        document.execCommand("copy");
        temp.remove();
        var buttons = document.getElementsByClassName('copy-clipboard');
        for ( var i = 0 ; i < buttons.length ; i++ ) {
            buttons[i].classList.remove('copied');
        }
        this.classList.add('copied');
    }

    function setClickHandlers(elem, className, handler) {
        elements = elem.getElementsByClassName(className);
        for ( var i = 0 ; i < elements.length ; i++ ) {
            elements[i].onclick = handler;
        }
    }

    function getAvatar(avatar, techAvatar) {
        techAvatar = techAvatar || siteUrl + 'images/no_ava_square.png';
        if (!avatar) {
            return techAvatar;
        } else if (avatar.indexOf('http') > -1) {
            avatar.replace('http:', 'https:');
            return $avatar;
        } else if (avatar.indexOf('//') === 0) {
            return 'https:'+avatar;
        } else {
            return siteUrl + avatar;
        }
    }

    function log() {
        if (debug){
            for (var i = 0; i < arguments.length; i++) {
                console.log(arguments[i]);
            }
        }
    }


    return {
        replaceTemplate: replaceTemplate,
        makeCashback: makeCashback,
        //makeCashbackNum: makeCashbackNum,
        ucfirst: ucfirst,
        makeHrefs: makeHrefs,
        storeIsActivate: storeIsActivate,
        setClickHandlers: setClickHandlers,
        copyToClipboard:copyToClipboard,
        getAvatar: getAvatar,
        log: log,
        doClickPlugunClose: doClickPlugunClose
    }

})();

