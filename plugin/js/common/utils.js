console.log('utils.js');

var utils = (function(){

    function replaceTemplate(template, items){
        items = items || {};
        for (var key in items) {
            template = template.replace('{{'+key+'}}', items[key]);
        }
        return template;
    }
    function makeCashback(displayedCashback, currency, action){
        var result = 'Кэшбэк<span class="cashback">';
        var cashbackNum = parseFloat(displayedCashback.replace(/[^\d.]+/g,""));
        var cashbackNumFinal = action == 1 ? cashbackNum * 2 : cashbackNum;
        if (!cashbackNum) {
            result += '10%';
        } else {
            result += displayedCashback.replace(/[\d.]+/, cashbackNumFinal) +
                (displayedCashback.match(/\%/) ? "" : " " + currency);
        }
        result +='</span>';
        result +=  (action == 1 && cashbackNum ? '<span class="cashback_old">'+cashbackNum+'</span>':'');
        return result;
    }

    function ucfirst(str) {   // Make a string&#039;s first character uppercase
        var f = str.charAt(0).toUpperCase();
        return f + str.substr(1, str.length - 1);
    }

    return {
        replaceTemplate: replaceTemplate,
        makeCashback: makeCashback,
        ucfirst: ucfirst
    }

})();

