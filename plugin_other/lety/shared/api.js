/**
 * Letyshops Extension API
 */
var API = (function () {

    var self = {};

    self.domain = 'letyshops.com';
    self.domainRu = 'letyshops.ru';
    self._root = 'https://' + self.domain;
    self._help = 'https://help.' + self.domainRu;
    self._api = 'https://eapi.' + self.domain + '/eapi';
    self._price = 'https://price.' + self.domain;
    self.cookieKey = 'uid';

    self.updateUrlsApi = function () {
        var self = this;
        if (typeof framework !== "undefined") {
            if (Object.keys(framework).length > 2) {
                $.ajax({
                    url: self._api + '/urls',
                    type: "GET",
                    dataType: "json",
                    success: function (data) {
                        if (data) {
                            if (data && data.siteUrl) {
                                self.domain = new URL(data.siteUrl).hostname;
                                self._root = data.siteUrl;
                                self._link = data.siteUrl;
                            }
                            if (data && data.apiUrl) {
                                self._api = data.apiUrl + '/eapi';
                            }
                            if (data && data.apiUrl && data.cdnUrl) {
                                self._cdn = data.cdnUrl + '/eapi';
                            }
                            if(data && data.helpUrl){
                                self.domainRu = data.helpUrl;
                            }
                            Storage.set('dataUrls', data);
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(textStatus + ':' + errorThrown)
                    }
                });

                clearInterval(self.intervalupdateUrlsApiHandlerTimer);
                self.intervalupdateUrlsApiHandlerTimer = setInterval(function () {
                    self.updateUrlsApi();
                }, UPDATE_INTERVAL_URLS);

            } else {
                Storage.get('dataUrls', function (data) {
                    if (data) {
                        if (data && data.siteUrl) {
                            self.domain = new URL(data.siteUrl).hostname;
                            self._root = data.siteUrl;
                            self._link = data.siteUrl;
                        }
                        if (data && data.apiUrl) {
                            self._api = data.apiUrl + '/eapi';
                        }
                        if (data && data.apiUrl && data.siteUrl && data.cdnUrl) {
                            self._cdn = data.cdnUrl + '/eapi';
                        }
                    } else {
                        self.updateUrlsApi();
                    }
                })
            }
        }
    };

    self.updateUrlsApi();

    /**
     * Получаем настройки
     */
    self.getSettings = function () {
        var self = this;

        if (typeof framework !== "undefined" && Object.keys(framework).length > 2) {
            $.ajax({
                url: (self._cdn ? self._cdn : self._api) + '/settings',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data) {
                        Storage.set('settings', data);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(textStatus + ':' + errorThrown)
                }
            });

            clearInterval(self.intervalupdateSettingsApiHandlerTimer);
            self.intervalupdateSettingsApiHandlerTimer = setInterval(function () {
                self.getSettings();
            }, UPDATE_INTERVAL_SETTINGS);
        }


    };

    self.getSettings();

    self.root = function () {
        return self._root + '/';
    };

    self.link = function () {
        return self._link ? self._link + '/' : self.root();
    };

    self.afterInstall = function () {
        var browser = Utils.getFullInfo().browser === BROWSER_NAME_YABROWSER ? 'yabrowser' : framework.browser.name.toLowerCase();
        return self._root + '/extension?action=install&utm_source=extension&utm_campaign=install&utm_term=' + browser;
    };

    self.afterDelete = function () {
        var browser = Utils.getFullInfo().browser === BROWSER_NAME_YABROWSER ? 'yabrowser' : framework.browser.name.toLowerCase();
        return self._root + '/extension?action=uninstall&utm_source=extension&utm_campaign=uninstall&utm_term=' + browser;
    };

    /**
     * GET
     * @returns {string}
     */
    self.user = function () {
        return self._api + '/user';
    };

    /**
     * GET
     * @returns {string}
     */
    self.cashRates = function () {
        return self._api + '/cashback-rates';
    };

    /**
     * GET
     * @returns {string}
     */
    self.userCodes = function () {
        return self._api + '/user/lety-codes';
    };

    /**
     * GET POST
     * @returns {string}
     */
    self.favoriteMerchants = function () {
        return self._api + '/user/shops-liked'
    };

    /**
     * POST
     * @returns {string}
     */
    self.deleteFavoriteMerchant = function () {
        return self._api + '/user/shops-disliked'
    };

    /**
     * GET
     * @returns {string}
     */
    self.merchants = function () {
        return (self._cdn ? self._cdn : self._api) + '/shops';
    };

    /**
     * GET
     * @returns {string}
     */
    self.offers = function () {
        return self._api + '/promotions'
    };

    /**
     * GET POST
     * @returns {string}
     */
    self.visitedMerchants = function () {
        return self._api + '/user/shops-viewed'
    };

    /**
     * GET
     * @returns {string}
     */
    self.recommendMerchants = function () {
        return self._api + '/user/shops-recomended'
    };

    /**
     * GET POST
     * @returns {string}
     */
    self.notifications = function () {
        return self._api + '/user/notifications'
    };

    self.interstitialPage = function () {
        return self._root + '/';
    };

    self.interstitialPageLogIn = function () {
        var browser = framework.browser.name.toLowerCase();
        return self._root + '/?auth=1&utm_source=extension&utm_campaign=popup_login&utm_term=' + browser;
    };

    self.accountPage = function () {
        var browser = framework.browser.name.toLowerCase();
        return self._root + '/user/?utm_source=extension&utm_campaign=popup_user&utm_term=' + browser;
    };

    self.allStoresPage = function () {
        var browser = framework.browser.name.toLowerCase();
        return self._root + '/shops/?utm_source=extension&utm_campaign=shops&utm_term=' + browser;
    };

    self.hotDealsPage = function () {
        var browser = framework.browser.name.toLowerCase();
        return self._root + '/hot-deals/?utm_source=extension&utm_campaign=hot_deals&utm_term=' + browser;
    };

    self.helpPage = function () {
        var browser = framework.browser.name.toLowerCase();
        return self._help + '?utm_source=extension&utm_campaign=support&utm_content=zendesk&utm_term=' + browser;
    };

    self.reasonCashbackReactivate = function () {
        var browser = framework.browser.name.toLowerCase();
        return self._root + '/re-activate-cashback-message?utm_source=extension&utm_campaign=notification_re_activate_cashback&utm_term=' + browser;
    };

    /**
     * POST
     * @returns {string}
     */
    self.logRewrite = function () {
        return self._api + '/log-rewrite';
    };

    /**
     * POST
     * @returns {string}
     */
    self.logActivate = function () {
        return self._api + '/log-activate';
    };

    /**
     * POST
     * @returns {string}
     */
    self.logThanksGiving = function () {
        return self._api + '/log-thanks';
    };

    /**
     * POST
     * @returns {string}
     */
    self.logInstall = function () {
        return self._api + '/extension/install';
    };

    /**
     * POST
     * @returns {string}
     */
    self.logRequest = function () {
        return self._api + '/extension/request';
    };

    /**
     * Get info about promo notifications
     * @returns {string}
     */
    self.promoNotifications = function () {
        return (self._cdn ? self._cdn : self._api) + '/promo-notifications';
    };

    /**
     *
     * @returns {string}
     * @constructor
     */
    self.ddList = function () {
        return (self._cdn ? self._cdn : self._api) + '/dd-list';
    };

    /**
     *
     * @returns {string}
     */
    self.cashbackIsAvailable = function () {
        return self._price + '/api/extension/v1/cashback/is-available';
    };

    /**
     *
     * @returns {string}
     */
    self.itemInfo = function () {
        return self._price + '/api/extension/v1/item/info';
    };

    /**
     *
     * @returns {string}
     */
    self.itemHistory = function () {
        return self._price + '/api/extension/v1/item/history';
    };

    /**
     *
     * @returns {string}
     */
    self.itemWishUpdate = function () {
        return self._price + '/api/extension/v1/item/wish-update';
    };

    /**
     *
     * @returns {string}
     */
    self.itemWishList = function () {
        return self._price + '/api/extension/v1/item/wish-list';
    };


    return self;

})
();