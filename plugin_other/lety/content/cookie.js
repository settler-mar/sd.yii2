var Cookie = (function () {
    var self = this;

    self.checkUserCookie = function () {
        if (!!window.document.domain && (window.document.domain.indexOf(API.domain) === 0)) {
            let cookie = self.getCookie(API.cookieKey);
            if (!!cookie) {
                framework.extension.fireEvent(ON_USER_LOGIN, {tabId: null, data: {cookie: cookie}});
            } else {
                framework.extension.fireEvent(ON_USER_LOGOUT, {tabId: null});
            }
        }
    };

    self.getMerchantCookie = function () {
        const pageCookies = _.chain(window.document.cookie.split("; "))
            .map(function (cookie) {
                return [
                    cookie.split("=")[0],
                    cookie.split("=")[1]
                ]
            })
            .object().value();

        framework.extension.fireEvent(GET_PAGE_COOKIES, {
            tabId: null,
            data: {pageCookies: pageCookies}
        });
    };

    self.checkMerchantCookie = function () {
        if (window.document.domain) {
            framework.extension.fireEvent(CHECK_MERCHANT_COOKIES, {tabId: null}, function (data) {
                var merchant = data && data.merchant;
                if (merchant && merchant.isActivated) {
                    var checkCookieCollection = merchant.checkCookieParams;
                    var pageCookies = _.chain(window.document.cookie.split("; "))
                        .map(function (cookie) {
                            return [
                                cookie.split("=")[0],
                                cookie.split("=")[1]
                            ]
                        })
                        .object().value();

                    if (merchant.savedCookie) {
                        var cashbackCookie = merchant.savedCookie;
                        var rightSet = _.filter(checkCookieCollection, function (checkCookieSet) {
                            return _.isEqual(_.keys(checkCookieSet), _.keys(cashbackCookie));
                        });
                        _.each(rightSet[0], function (pattern, cookieName) {
                            if (!new RegExp(pattern, "i").test(pageCookies[cookieName]) || (cashbackCookie[cookieName] !== pageCookies[cookieName])) {
                                framework.extension.fireEvent(CASHBACK_DEACTIVATE, {
                                    tabId: null,
                                    data: {merchantId: merchant.id, pageCookies: pageCookies}
                                });

                                var notification = new Notification({model: merchant}).render();
                                notification.addInfo();
                                notification.addWarning();
                                framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS, {
                                    tabId: null,
                                    data: {
                                        type: 'pageview',
                                        page: gaPagePopup + 'activate-cashback-reactivate/' + merchant.title + '/'
                                    }
                                });
                                framework.extension.fireEvent(SAW_REWRITE, {
                                    tabId: null,
                                    data: {id: merchant.id}
                                });
                            }
                        });
                    } else {
                        var complete = false;
                        _.each(checkCookieCollection, function (checkCookieSet) {
                            if (complete) return;
                            var cookieValues = _.chain(checkCookieSet)
                                .map(function (pattern, cookieName) {
                                    if (_.has(pageCookies, cookieName) && new RegExp(pattern, "i").test(pageCookies[cookieName])) {
                                        return [cookieName, pageCookies[cookieName]];
                                    } else {
                                        return null;
                                    }
                                })
                                .compact()
                                .object()
                                .value();
                            if (_.keys(cookieValues).length === _.keys(checkCookieSet).length) {
                                framework.extension.fireEvent(SET_MERCHANT_COOKIES, {
                                    tabId: null,
                                    data: {merchantId: merchant.id, cookie: cookieValues}
                                });
                                complete = true;
                            }
                        });
                    }
                }
            });
        }
    };

    self.getTokensCookies = function () {
        var tokenCookies = {};
        var checkId = setInterval(function () {
            var cookies = _.chain(window.document.cookie.split("; "))
                .map(function (cookie) {
                    return [
                        cookie.split("=")[0],
                        cookie.split("=")[1]
                    ]
                })
                .object().value();

            _.each(cookies, function (key, cookie) {
                if ((cookie === 'eaetkn' || cookie === 'eautkn') && Object.keys(tokenCookies).length < 2) {
                    tokenCookies[cookie] = decodeURIComponent(key);
                }
            });
        }, 100);

        setTimeout(function () {
            clearInterval(checkId);

            framework.extension.fireEvent(GET_TOKEN_COOKIES, {
                tabId: null,
                data: {tokenCookies: tokenCookies}
            });

        }, 500);
    };

    /**
     *
     * @param name
     * @returns {any}
     */
    self.getCookie = function (name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined
    };

    /**
     *
     * @param cookieName
     * @param cookieValue
     * @param cookieExpires
     * @param cookieDomain
     */
    self.setCookie = function (cookieName, cookieValue, cookieExpires, cookieDomain) {

        var d = new Date();
        d.setTime(d.getTime() + (cookieExpires * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        var domain = ";domain=" + cookieDomain;
        document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";" + domain + ";path=/";

    };

    /**
     *
     * @param name
     */
    self.deleteCookie = function (name) {
        self.setCookie(name, null, {expires: -1})
    };

    return self;
})();
