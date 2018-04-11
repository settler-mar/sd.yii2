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
    function makeCashback(displayedCashback, currency, action){
        var cashbackNum = parseFloat(displayedCashback.replace(/[^\d.]+/g,""));
        var cashbackNumFinal = action == 1 ? cashbackNum * 2 : cashbackNum;

        result = '<span class="cashback">'+displayedCashback.replace(/[\d.]+/, cashbackNumFinal) +
            (displayedCashback.match(/\%/) ? "" : " " + currency) +'</span>';
        if (action == 1 && cashbackNum > 0) {
            var cashbackOld = displayedCashback + (displayedCashback.match(/\%/) ? "" : " " + currency);
            result +=  '<span class="cashback_old">'+cashbackOld+'</span>';
        }
        return result;
    }

    function ucfirst(str) {   // Make a string&#039;s first character uppercase
        var f = str.charAt(0).toUpperCase();
        return f + str.substr(1, str.length - 1);
    }

    function doClick(e){
        //e.preventDefault();
        var store = this.getAttribute('data-store');
        if (store) {
            Storage.set(storeActiveStorageName+store, new Date().getTime());
            // if (debug) {
            //     console.log(store, Storage.get(storeActiveStorageName+store));
            // }
        }
        chrome.tabs.create({url: this.getAttribute('href')});
    }

    function storeIsActivate(storeRoute){
        var storeActiveDate = Storage.get(storeActiveStorageName+storeRoute);
        var isActive = storeActiveDate !== null &&  new Date().getTime() - storeActiveDate < storeActiveInterval * 60 * 1000;
        if (debug) {
            //console.log(storeActiveDate, isActive, (new Date().getTime() - storeActiveDate)/(60 * 1000));
        }
        return isActive;
    }

    function makeHrefs(elem){
        elements = elem.getElementsByTagName('a');
        for (var i = 0; i < elements.length; i++){
            elements[i].onclick = doClick;
        }
    }

    return {
        replaceTemplate: replaceTemplate,
        makeCashback: makeCashback,
        ucfirst: ucfirst,
        makeHrefs: makeHrefs,
        storeIsActivate: storeIsActivate
    }

})();

