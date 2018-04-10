Handlebars.registerHelper('pickNum', function () {
    if (arguments.length > 0 && arguments[0]) {
        try {
            var num;
            var numChar;
            if (arguments[0]) {
                numChar = (parseFloat(arguments[0]) + "").length;
                num = arguments[0].substring(0, numChar);

                if (!num) {
                    numChar = (parseFloat(arguments[1]) + "").length;
                    num = arguments[1].substring(0, numChar);
                }
            }
            else {
                numChar = (parseFloat(arguments[1]) + "").length;
                num = arguments[1].substring(0, numChar);
            }

            return num;
        } catch (e) {
            framework.extension.log("pickNum - " + arguments[0]);
            return arguments[0];
        }
    }
});


Handlebars.registerHelper('cashbackConverter', function () {
    if (arguments.length > 0) {
        if (arguments[0].cashbackFloated) {
            return "+ до " + arguments[0].cashback + " кэшбэк";
        } else {
            return "+ " + arguments[0].cashback + " кэшбэк";
        }
    }
});

Handlebars.registerHelper('getHtml', function () {
    if (arguments.length > 0) {
        if (!arguments[0].indexOf("<") + 1) {
            return $(arguments[0]);
        } else {
            return arguments[0];
        }
    }
});

Handlebars.registerHelper('getTypeSpecBtn', function () {
    if (arguments.length > 0) {
        if (arguments[0] == FOOTER_ALL_STORES) {
            return "ВСЕ МАГАЗИНЫ";
        } else if (arguments[0] == FOOTER_ALL_OFFERS) {
            return "ВСЕ МАГАЗИНЫ С АКЦИЯМИ";
        }
    }
});

Handlebars.registerHelper('isUnread', function () {
    if (arguments.length > 0) {
        if (arguments[0] == "1") {
            return "letyshops-notification-markup-special";
        } else {
            return "";
        }
    }
    return ""
});

Handlebars.registerHelper('conditions', function () {
    if (arguments.length > 0) {
        if (arguments[0] != arguments[1]) {
            return "<span class='letyshops-store-cashback-default-line-through'>" + arguments[0] + "</span> - ";
        }
    }
    return "";
});

Handlebars.registerHelper('haveActiveNotify', function (conditional, options) {
    if (conditional && conditional.length) {
        if (_.findWhere(conditional, {status: "1"}))
            return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('updatestores', function () {
    if (framework.browser.name.toLowerCase() == 'safari') {
        _.delay(function () {
            popup.storesTab.render(null, null, false);
        }, 500);
    }
});

Handlebars.registerHelper('isUserLoginAndMerchantActive', function (isMerchantActive, isUser, opts) {
    if (isMerchantActive && isUser) {
        return opts.fn(this);
    }
    return opts.inverse(this);
});