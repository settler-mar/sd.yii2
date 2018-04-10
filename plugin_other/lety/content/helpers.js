Handlebars.registerHelper('pickNum', function () {
    if (arguments.length > 0 && arguments[0]) {
        try {
            var numChar = (parseFloat(arguments[0]) + "").length;
            return arguments[0].substring(0, numChar);
        } catch (e) {
            framework.extension.log("pickNum - " + arguments[0]);
            return arguments[0];
        }
    }
});

Handlebars.registerHelper('href', function () {
    if (arguments.length > 0) {
        return API.link() + arguments[0].activateUrl + PARAMETER_DEEP_LINK + encodeURIComponent(window.location.origin) + encodeURIComponent(window.location.pathname) +
            '&utm_source=extension&utm_campaign=notification_get_cashback&utm_term=' + framework.browser.name.toLowerCase();
    }
});

Handlebars.registerHelper('equals', function (state, value, opts) {
    if (state === value) {
        return opts.fn(this);
    }
    return opts.inverse(this);
});

Handlebars.registerHelper('formatPriceSign', function (currencySign, dynamicValue) {
    if (currencySign === '₽') {
        return dynamicValue.toFixed(2).replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1 ") + ' руб.';
    }
    return currencySign + '' + dynamicValue.toFixed(2).replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1 ");
});

Handlebars.registerHelper('isUserLoginAndMerchantActive', function (isMerchantActive, isUser, opts) {
    if (isMerchantActive && isUser) {
        return opts.fn(this);
    }
    return opts.inverse(this);
});