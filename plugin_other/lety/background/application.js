var apps4cashback = Backbone.Model.extend({
    models: [
        "user",
        "merchants",
        "offers",
        "tabs"
    ],
    history: [],

    defaults: {
        "merchants": new Merchants(),
        "offers": new Offers(),
        "user": new User(),
        "tabs": new Tabs(),
        "currentMerchant": null,
        "currentPopupTab": 'stores',
        "visitedMerchants": []
    },

    initialize: function () {
        var self = this;
        var isHotProduct = false;
        var hotProductId = null;
        var rate = null;
        //-- initialize jQuery specific options
        $.support.cors = true;
        self.initPopup();
        self.onInstalledAndDelete();
        Button.standard();

        _.extend(this, _.object(
            _.map(self.models,
                function (name) {
                    return [name, self.attributes[name]];
                }
            )
        ));

        self.merchants.listenTo(self.user, "change:viewed", function (model, value) {
            Storage.get('viewedMerchants', function (dataViewedMerchants) {
                if (dataViewedMerchants && dataViewedMerchants.length > 0) {
                    self.user.set('viewed', dataViewedMerchants);
                    self.merchants.setViewed(dataViewedMerchants);
                } else {
                    self.merchants.setViewed(value);
                }
            })

        });
        self.merchants.listenTo(self.user, "change:favorites", function (model, value) {
            self.merchants.setFavorites(value);
        });
        self.merchants.listenTo(self.user, "change:recommended", function (model, value) {
            self.merchants.setRecommended(value);
        });

        self.merchants.listenTo(self.user, "change:token", function () {
            self.user.rates.fetch(true);
        });

        self.merchants.listenTo(self.user.get("rates"), "reset", function (collection) {
            self.merchants.setPersonalCashback(collection.toJSON());
        });

        self.user.listenTo(self.merchants, "reset", function (collection) {
            if (self.user.isLogin()) {
                Storage.get('viewedMerchants', function (dataViewedMerchants) {
                    if (dataViewedMerchants && dataViewedMerchants.length > 0) {
                        self.user.set('viewed', dataViewedMerchants);
                        self.merchants.setViewed(dataViewedMerchants);
                        collection.setViewed(dataViewedMerchants);
                    } else {
                        collection.setViewed(self.user.get("viewed"));
                    }
                });
                collection.setRecommended(self.user.get("recommended"));
                collection.setFavorites(self.user.get("favorites"));
            }
        });

        self.listenTo(self.tabs, 'change:url', self.initializeInterstitialPageActivationHandler);
        self.on(CASHBACK_ACTIVATE, self.activateFromPopup); // is used in store card

        self.usersNotifyHandler();
        self.promoNotifyHandlerAjax();
        self.promoNotifyHandlerTimer();
        framework.browser.attachEvent(framework.browser.TABCHANGED, _.bind(self.initializeCookieHandler, self));

        self.initializeNotificationHandler();
        self.initializeParamsHandler();
        self.initializeCookieHandler();
        self.initializeIconAnimation();
        self.initializeGoogleAnalyticsHandler();

        self.setSettingsFromApi();
        self.rivalAddListHandlerAjax();

        clearInterval(self.intervalPushlogRequest);
        self.intervalPushlogRequest = setInterval(function () {
            self.pushLogRequest(API.logRequest());
        }, INTERVAL_PUSH_LOG_REQUEST);

        _.delay(function () {
            Storage.get(POPUP_FIRST_OPENING_TOKEN, function (token) {
                if (!token && !self.user.isLogin()) {
                    Button.setBadge("!");
                }
            });
        }, 4000);

        setInterval(_.bind(function () {
            self.periodicPushViewedMerchant(self.get('visitedMerchants'), API.visitedMerchants());
            self.set('visitedMerchants', []);
        }, self), PERIODIC_SHOP_VIEWED);

        function checkActivateCachback(event) {
            if (!((event.url.indexOf('s.click.aliexpress') > 0) || (event.url.indexOf('affiliates.rozetka.com.ua') > 0))) {
                var domain = Utils.getDomain(event.url);
                var merchant = self.merchants.selectByDomain(domain);


                var hotProductsUrl = new URL(event.url);
                if (!!hotProductsUrl.search.substr(1).match('hot_product_id=')) {

                    function getUrlParameter(sParam) {
                        var sPageURL = decodeURIComponent(hotProductsUrl.search.substring(1)),
                            sURLVariables = sPageURL.split('&'),
                            sParameterName,
                            i;

                        for (i = 0; i < sURLVariables.length; i++) {
                            sParameterName = sURLVariables[i].split('=');

                            if (sParameterName[0] === sParam) {
                                return sParameterName[1] === undefined ? true : sParameterName[1];
                            }
                        }
                    };

                    hotProductId = getUrlParameter('hot_product_id');
                    rate = getUrlParameter('rate');

                    isHotProduct = true;
                }
                if (!!merchant && !!merchant.attributes && isHotProduct) {
                    if(!merchant.attributes.hotProducts){
                        merchant.attributes.hotProducts = [];
                    }
                    var damainPrice = Utils.getDomainPrice(hotProductsUrl.host);
                    var id = Utils.getProductId(damainPrice, hotProductsUrl.pathname);

                    var objHotProduct = {};
                    objHotProduct[id] = {
                        hot_product_id: hotProductId,
                        rate: rate
                    };

                    if(!!merchant.attributes.hotProducts && merchant.attributes.hotProducts.length > 0){
                        _.each(merchant.attributes.hotProducts, function (item) {
                            if (!Object.keys(item).includes(id)) {
                                merchant.attributes.hotProducts.push(objHotProduct);
                            }
                        });
                    } else {
                        merchant.attributes.hotProducts.push(objHotProduct);
                    }

                    isHotProduct = false;
                    hotProductId = null;
                    rate = null;
                }

                if (merchant && self.user.isLogin()) {
                    if (!merchant.get("isActivated") && !merchant.get("savedParams") && !merchant.get("rewrite")) {
                        self.onParameterSave(event);
                        if (merchant.get("savedParams")) {
                            merchant.trigger(CASHBACK_ACTIVATE);
                        }
                    } else if (merchant.get("isActivated") && merchant.get("savedParams")) {
                        self.onParameterResearch(event);
                    }
                }
            }
        }

        if (framework.browser.name === BROWSER_NAME_SAFARI) {
            safari.application.addEventListener("beforeNavigate", function (event) {
                checkActivateCachback(event);
            }, false);
        } else {
            chrome.webRequest.onBeforeSendHeaders.addListener(function (event) {
                checkActivateCachback(event);
            }, {urls: ["<all_urls>"]});
        }
    },

    /**
     *
     */
    setSettingsFromApi: function () {
        var self = this;
        Storage.get('settings', function (data) {
            if (data) {
                if (data.updateIntervals) {
                    _.each(Object.keys(data.updateIntervals), function (item, index) {
                        switch (item) {
                            case 'shops':
                                UPDATE_INTERVAL_MERCHANT = Object.values(data.updateIntervals)[index];
                                break;
                            case 'promotions':
                                UPDATE_INTERVAL_OFFERS = Object.values(data.updateIntervals)[index];
                                break;
                            case 'lety-codes':
                                UPDATE_INTERVAL_CODES = Object.values(data.updateIntervals)[index];
                                break;
                            case 'settings':
                                UPDATE_INTERVAL_SETTINGS = Object.values(data.updateIntervals)[index]
                                break;
                            case 'urls':
                                UPDATE_INTERVAL_URLS = Object.values(data.updateIntervals)[index]
                                break;
                            case 'promo-notifications':
                                PROMO_NOTIFY_INTERVAL = Object.values(data.updateIntervals)[index]
                                break;
                            case 'dd-list':
                                R_LIST_ADD_PERIOD = Object.values(data.updateIntervals)[index]
                                break;
                            case 'user_notifications':
                                USER_NOTIFY_INTERVAL = Object.values(data.updateIntervals)[index]
                                break;
                        }
                    })
                }

                if (data.autoUpdate.shops) {
                    self.user.rates.fetch(true);
                }

                if (data.regExr && Object.keys(data.regExr).length > 0) {
                    _.each(data.regExr, function (item) {
                        _.each(Object.keys(item), function (param, index) {
                            switch (param) {
                                case 'CheckElementAli':
                                    CHECK_ELEMENT_ALI = Object.values(item)[index];
                                    break;
                                case 'RegExIDProductAli':
                                    REGEX_ALI_PRODUCT_ID = Object.values(item)[index];
                                    break;
                                case 'RegExActMinPriceAli':
                                    REGEX_ACT_MIN_PRICE = Object.values(item)[index];
                                    break;
                                case 'RegExMinPriceAli':
                                    REGEX_MIN_PRICE = Object.values(item)[index];
                                    break;
                                case 'RegExActMaxPriceAli':
                                    REGEX_ACT_MAX_PRICE = Object.values(item)[index];
                                    break;
                                case 'RegExMaxPriceAli':
                                    REGEX_MAX_PRICE = Object.values(item)[index];
                                    break;
                                case 'RegExBaseCurrencyCodeAli':
                                    REGEX_BASE_CURRENCY_CODE = Object.values(item)[index];
                                    break;
                                case 'CheckElementPriceGb':
                                    CHECK_ELEMENT_GEARBEST = Object.values(item)[index];
                                    break;
                                case 'RegExIDProductGb':
                                    REGEX_GEARBEST_PRODUCT_ID = Object.values(item)[index];
                                    break;
                            }
                        });
                    })
                }

                if (data.regExrDomain && Object.keys(data.regExrDomain).length > 0) {
                    _.each(Object.keys(data.regExrDomain), function (item, index) {
                        switch (item) {
                            case 'check_letyshops':
                                CHECK_LETYSHOPS = Object.values(data.regExrDomain)[index];
                                break;
                            case 'check_letyshops_view':
                                CHECK_LETYSHOPS_VIEW = Object.values(data.regExrDomain)[index];
                                break;
                            case 'lety-check_letyshops_view_id':
                                CHECK_LETYSHOPS_VIEW_ID = Object.values(data.regExrDomain)[index];
                                break;
                        }
                    })
                }
            }
        });

        setTimeout(function () {
            self.usersNotifyHandler();
        }, 15 * 60 * 1000);
    },


    /**
     * GET OFFERS TOGETHER WITH MERCHANT INFO
     * @returns {*}
     */
    getPreparedOffers: function () {
        var self = this;
        var topOffer = self.offers.getTopOffer();
        var offers = self.offers.getNoTopOffers(topOffer.id);
        offers = self.merchants.checkOOfferMerchant(offers);
        if ((topOffer && (topOffer.length > 0 || Object.keys(topOffer).length > 0)) || (offers && offers.length > 0)) {
            return _.object(
                [
                    "specialOffer",
                    "offers"
                ],
                [
                    _.extend(
                        topOffer.toJSON(),
                        self.merchants.getInfoForOffer(topOffer.get("shopId"))),
                    _.map(
                        offers,
                        function (offer, index, arr) {
                            return _.extend(
                                offer.toJSON(),
                                self.merchants.getInfoForOffer(offer.get("shopId"))
                            )
                        }
                    )
                ]
            )
        } else {
            return null;
        }
    },

    /**
     * WHEN ACTIVATE FROM POPUP
     * @param merchantId
     * @param callback
     */
    activateFromPopup: function (merchantId, callback) {
        var self = this;
        var browser = framework.browser.name.toLowerCase();
        var merchant = self.merchants.selectById(merchantId);
        if (merchant) {
            var tab = self.tabs.selectById();
            if (tab && (new RegExp(merchant.get("pattern")).test(tab.get("domain")))) {
                var parameterDeepLink = tab.get("url") ? encodeURIComponent(tab.get("url")) : '';
                framework.browser.navigate({
                        tabId: tab.id,
                        url: API.link() + merchant.get("activateUrl") + PARAMETER_DEEP_LINK + parameterDeepLink + '&utm_source=extension&utm_campaign=partner_info&utm_term=' + browser
                    }
                );
            } else {
                var utmParams = merchant.get('url').split('/');
                framework.browser.navigate({
                        tabId: framework.browser.NEWTAB,
                        url: API.link() + merchant.get("activateUrl") + '?utm_source=extension&utm_campaign=' + utmParams[0] + '&utm_content=' + utmParams[1] + '&utm_term=' + browser
                    }
                );
            }
            callback && callback();
        }
    },

    /**
     * MAIN HANDLERS
     */
    initializeNotificationHandler: function () {
        var self = this;
        framework.extension.attachEvent(NOTIFICATION_DISMISS, function (event, callback) {
            if (event.data) {
                var merchant = self.merchants.selectById(event.data);
                merchant && merchant.trigger(MERCHANT_SUPPRESSED);
                callback && callback();
            }
        });
        framework.extension.attachEvent(NOTIFICATION_CASHBACK_ACTIVATE, function (event, callback) {
            if (event.data) {
                var merchant;
                if (event.data && event.data.merchantId) {
                    merchant = self.merchants.selectById(event.data.merchantId);
                } else {
                    merchant = self.merchants.selectByDomain(Utils.getDomain(event.url));
                }
                framework.extension.fireEvent(CLOSE_ALL_NOTIFICATION, {
                    tabId: framework.browser.ALLTABS,
                    data: merchant.toJSON()
                });
            }
        });
        framework.extension.attachEvent(NOTIFICATION_GET_INFO, _.bind(self.globalPageHandler, self));
        framework.browser.attachEvent(framework.browser.DOCUMENTCOMPLETE, _.bind(self.globalPageHandler, self));
        framework.browser.attachEvent(framework.browser.TABCHANGED, _.bind(self.globalPageHandler, self));


        framework.browser.attachEvent(framework.browser.BEFORENAVIGATE, function (event) {
            Storage.get('settings', function (data) {
                if (data && data.redirectUrl && data.redirectUrl.length > 0) {
                    var url = new URL(event.url);

                    var patternOwnerPage = null;
                    try {
                        patternOwnerPage = location.href.matchAll(CHECK_LETYSHOPS)[0][0];
                    } catch (e) {
                    }

                    if (new RegExp(patternOwnerPage, "i").test(url.host) && !new RegExp(patternOwnerPage, "i").test(new URL(data.redirectUrl).host)) {
                        framework.browser.navigate({
                                tabId: self.tabs.currentTabId,
                                url: data.redirectUrl + url.pathname + url.search
                            }
                        );
                    }
                }
            });
        });

        framework.extension.attachEvent(USER_NOTIFICATION_DISMISS, _.bind(self.usersNotifyDismiss, self));
        framework.extension.attachEvent(UPDATE_FAVORITE_STATUS_FROM_NOTIFICATION, _.bind(self.onFavoriteClick, self));
        framework.extension.attachEvent(ANIMATE_ICON, _.bind(self.animateIcon, self));
        framework.extension.attachEvent(SEND_GA_CID, _.bind(self.writeGoogleAnalyticsCID, self));
        framework.extension.attachEvent(SEND_ACTIVATION_DATA, _.bind(self.sendActivationData, self));
        framework.extension.attachEvent(SEND_THANKS_YOU_PAGE_DATA, _.bind(self.sendThanksYouPageData, self));
        framework.extension.attachEvent(SAW_REWRITE, _.bind(self.unRewrite, self));
        framework.extension.attachEvent(BUTTON_UPDATE, _.bind(function () {
            var self = this,
                merchant = self.get('currentMerchant') ? self.merchants.selectById(self.get('currentMerchant')) : false;
            if (!merchant) {
                Button.standard();
            } else if (merchant.get('isActivated')) {
                Button.green();
            } else {
                Button.red();
            }
        }, self));

        framework.extension.attachEvent(UPDATE_LETY_CODES, function () {
            self.user.rates.fetch(true);
        });

        framework.extension.attachEvent(UPDATE_MERCHANTS_HOT_PRODUCTS, function (data) {
            var merchant = self.merchants.selectById(data.data.id);
            if(!!merchant && !!merchant.attributes){
                merchant.attributes.hotProducts = data.data.hotProductsArr;
            }
        });

        framework.extension.attachEvent(GET_INFO_MERCHANT, function (data, callback) {

            Storage.get('firstShowTitleForUser', function (firstShowTitleForUser) {
                var firstShow = data.data.firstShow;
                if (!!firstShowTitleForUser) {
                    firstShow = false;
                } else {
                    if (!!firstShow) {
                        Storage.set('firstShowTitleForUser', true);
                    }
                }

                var domain = Utils.getDomain(data.data.dataUrlPage);
                var merchant = domain && self.merchants.selectByDomain(domain);
                if (!!merchant && !!merchant.attributes) {
                    var dataSearch = {
                        merchant: merchant.attributes,
                        firstShow: firstShow
                    };
                    callback && callback(!!merchant ? dataSearch : null);
                }
            });
        });

        framework.extension.attachEvent(SEND_ITEM_TO_WISH_LIST, function (event) {
            self.sendItemToWishList(self.user, event.data.itemInfo);
        });

        framework.extension.attachEvent(GET_PRICE_HISTORY, function (event, callback) {
            var priceHistory = self.getPriceHistory(event, self.user);
            callback && callback(priceHistory);
        });

        framework.extension.attachEvent(NOTIFICATION_GET_PRICE, _.bind(self.globalPriceHandler, self));

        framework.extension.attachEvent(GET_TOKEN_COOKIES, function (event) {
            var url = new URL(event.url);
            var tab = self.tabs.selectById(self.tabs.currentTabId);
            var referer = tab && tab.get('history') && tab.get('history').length > 0 ? tab.get('history')[tab.get('history').length - 1].referer : '';
            var user = application.user;
            if (event && event.data && _.compact(_.uniq(_.keys(event.data.tokenCookies))).length !== 0) {
                user.set({
                    tokenCookies: event.data.tokenCookies
                });
            }

            var domain = Utils.getDomain(event.url);
            var merchant = domain && self.merchants.selectByDomain(domain);
            var isCashbackAvailable = merchant ? merchant.attributes.isCashbackAvailable : {};

            if (merchant && merchant.get('isCashbackAvailable') && (isCashbackAvailable.code === 0
                    || isCashbackAvailable.code === 1 && _.now() - isCashbackAvailable.lastTimeRequest > isCashbackAvailable.expire)) {
                self.sendCashbackIsAvailable(user, url, referer);
                return true;
            } else {
                var pattern = /^((http|https):\/\/)/;
                if (pattern.test(event.url)) {
                    Storage.get("ddList", function (ddList) {
                        function isVariableInArray() {
                            var next = true;
                            _.each(ddList, function (item) {
                                if (new RegExp(item, "i").test(url.host)) {
                                    next = false;
                                }
                            });
                            return next;
                        }

                        if (ddList) {
                            if (isVariableInArray()) {
                                Storage.get('isCashbackAvailable', function (isCashbackAvailable) {
                                    if (!isCashbackAvailable) {
                                        self.sendCashbackIsAvailable(user, url, referer);
                                    } else {
                                        var listTmpUrls = [];
                                        _.each(isCashbackAvailable, function (item) {
                                            listTmpUrls.push(item.url);
                                        });
                                        if ($.inArray(url.host, listTmpUrls) !== -1) {
                                            _.each(isCashbackAvailable, function (item) {
                                                if (item.url === url.host && (item.code === 0 || item.code === 1 && _.now() - item.lastTimeRequest > item.expire)) {
                                                    self.sendCashbackIsAvailable(user, url, referer);
                                                }
                                            });
                                        } else {
                                            self.sendCashbackIsAvailable(user, url, referer);
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });

        framework.browser.attachEvent(framework.browser.BEFORENAVIGATE, function (event) {
            Storage.get('settings', function (data) {
                if (data && data.redirectUrl && data.redirectUrl.length > 0) {
                    var url = new URL(event.url);
                    var patternOwnerPage = null;
                    try {
                        patternOwnerPage = location.href.matchAll(CHECK_LETYSHOPS)[0][0];
                    } catch (e) {
                    }

                    if (patternOwnerPage === url.host
                        && url.host !== new URL(data.redirectUrl).host) {
                        framework.browser.navigate({
                                tabId: self.tabs.currentTabId,
                                url: data.redirectUrl + url.pathname + url.search
                            }
                        );
                    }
                }
            });
        });
    },

    /**
     *
     * @param event
     * @param callback
     */
    globalPriceHandler: function (event, callback) {
        var self = this;
        Storage.get('showPrice', function (item) {
            if (item || typeof item === "undefined" || BROWSER_NAME_SAFARI === framework.browser.name) {
                var domain = Utils.getDomain(event.url);
                var tab = self.tabs.selectById(event.tabId);
                var user = self.user;
                var merchant = domain && self.merchants.selectByDomain(domain);
                if (merchant && (ARRAY_MERCHANTS_PRICE.includes(merchant.id))) {
                    if (event.data.updateInfo) {
                        var targetInfo = self.getTargetInfo(event.url, self.user, event.data);
                        if (targetInfo && targetInfo.itemInfo && targetInfo.itemInfo.dynamic) {

                            if (targetInfo.itemInfo.dynamic.value > 0) {
                                targetInfo.itemInfo.dynamic.sign = '+';
                            } else if (targetInfo.itemInfo.dynamic.value < 0) {
                                targetInfo.itemInfo.dynamic.sign = '-';
                            } else {
                                targetInfo.itemInfo.dynamic.sign = '';
                            }

                            targetInfo.itemInfo.dynamic.value = Math.abs(targetInfo.itemInfo.dynamic.value);

                            targetInfo.itemInfo.dynamic.ItemDynamic = self.getDecodeItemDynamic(targetInfo);
                            if (event.data && _.compact(_.uniq(_.keys(event.data))).length !== 0) {
                                targetInfo.itemInfo.priceLast.dataPricePage = event.data;
                            }
                        }
                        if (targetInfo && targetInfo.itemInfo !== null && targetInfo.itemInfo.seller !== null) {
                            targetInfo.itemInfo.seller.resume.score.value = parseInt(targetInfo.itemInfo.seller.resume.score.value);
                            targetInfo.itemInfo.seller.resume.decodeNotes = self.getDecodeNotes(targetInfo);
                        }
                    }
                    var promo = merchant && merchant.get("hasPromoActivated") ? self.offers.get(+merchant.get("hasPromoActivated")) : null;
                    merchant.attributes.extendedTab = tab.attributes;
                    merchant.attributes.extendedPromo = promo;
                    var data = {
                        merchant: merchant.attributes,
                        isLogin: user.isLogin(),
                        targetInfo: targetInfo ? targetInfo : ''
                    }
                }
                callback && callback(data ? data : null);
            }
        });
    },

    globalPageHandler: function (event, callback) {
        var self = this;
        var domain = Utils.getDomain(event.url);
        var tab = self.tabs.selectById(event.tabId);
        var user = self.user;
        var merchant = domain && self.merchants.selectByDomain(domain);
        if (merchant && self.tabs.currentTabId === event.tabId) {
            if (merchant.get("settings").partnerList || merchant.get("settings").partnerListNoActive) {
                user.rewriteViewed(merchant.id);
            }
            self.attributes.currentMerchant = merchant.id;
            var _visitedMerchant = self.attributes.visitedMerchants;
            if (!_.findWhere(_visitedMerchant, {shop_id: merchant.id})) {
                _visitedMerchant.push({
                    shop_id: merchant.id,
                    date: new Date().toISOString()
                });
                self.attributes.visitedMerchants = _visitedMerchant;
            }
            if (merchant && merchant.get("settings").browserAction && self.tabs.currentTabId === tab.id) {
                if (merchant.get("isActivated") && self.user.isLogin()) {
                    Button.green()
                } else if (merchant.get('animated') !== 'red' && !tab.get('animation')) {
                    merchant.set('animated', 'red');
                    tab.set('animation', true);
                    _.delay(function () {
                        tab.set('animation', false)
                    }, 1500);
                    framework.extension.fireEvent(ANIMATE_ICON, {tabId: null});
                } else {
                    Button.red();
                }
            } else if (merchant && self.tabs.currentTabId === tab.id) {
                Button.standard();
            }
        } else {
            self.attributes.currentMerchant = null;
            if (tab && self.tabs.currentTabId === tab.id)
                Button.standard();
        }

        if (!merchant || !tab || !domain) {
            return;
        }

        var tabState = tab && tab.get('state');
        var interstitialPageId = tab.get('interstitialPageId');

        var interstitialPageRegExp = null;
        try {
            interstitialPageRegExp = url.matchAll(CHECK_LETYSHOPS_VIEW)[0][0];
        } catch (e) {
        }

        if (event.name === framework.browser.DOCUMENTCOMPLETE && !new RegExp(interstitialPageRegExp, "i").test(event.url)) {
            tab.immediateReset();
        }

        if (!(TAB_STATE_INTERSTITIAL_REDIRECT === (tabState & TAB_STATE_INTERSTITIAL_REDIRECT))
            && (TAB_STATE_3RD_PARTY === (tabState & TAB_STATE_3RD_PARTY))) {
            merchant.trigger(MERCHANT_SUPPRESSED);
        } else if (TAB_STATE_INTERSTITIAL_REDIRECT === (tabState & TAB_STATE_INTERSTITIAL_REDIRECT)) {
            if (merchant && merchant.get("settings").browserAction && self.tabs.currentTabId === tab.id) {
                if (!tab.get('animation')) {
                    if (merchant.get("isActivated")) {
                        tab.set('animation', true);
                        _.delay(function () {
                            tab.set('animation', false)
                        }, 1500);
                        framework.extension.fireEvent(ANIMATE_ICON, {tabId: null});
                    } else {
                        Button.red();
                    }
                }
            }
        }
        var promo = merchant.get("hasPromoActivated") ? self.offers.get(+merchant.get("hasPromoActivated")) : null;
        merchant.attributes.extendedTab = tab.attributes;
        merchant.attributes.extendedPromo = promo;
        callback && callback(merchant.attributes);
    },

    /**
     * INTERSTITIAL PAGE
     * @param tab
     * @param url
     * @param options
     */
    initializeInterstitialPageActivationHandler: function (tab, url, options) {
        var self = this;
        if (!url) return;
        if (url.indexOf(API.domain) !== -1) {
            var interstitialPageRegExp = null;
            try {
                interstitialPageRegExp = url.matchAll(CHECK_LETYSHOPS_VIEW)[0][0];
            } catch (e) {
            }

            if (new RegExp(interstitialPageRegExp, "i").test(url)) {
                var id = parseInt((new URL(url).pathname).matchAll(CHECK_LETYSHOPS_VIEW_ID)[0][0]);
                if (id) {
                    var merchant = self.merchants.selectById(id);
                    if (!merchant) {
                        merchant = _.filter(self.merchants.models, _.bind(function (model) {
                            return _.contains(model.get('promo'), parseInt(id))
                        }, self))
                    }
                    if (merchant) {
                        if (_.isArray(merchant)) {
                            merchant = merchant[0];
                        }
                        if (merchant) {
                            merchant.set({savedCookie: null});
                            merchant.reset && merchant.reset();
                            if (merchant && self.user && self.user.isLogin()) {
                                self.user && self.user.pushViewedMerchant(merchant.id);
                            }
                        }


                        merchant.set({
                            extendedTabThanksPage: {
                                state: tab.get('state') | TAB_STATE_INTERSTITIAL_REDIRECT,
                                interstitialPageId: id,
                                shopId: id,
                                interstitialPage: url,
                                tabInfo: tab.attributes
                            }
                        });

                        tab.set('state', tab.get('state') | TAB_STATE_INTERSTITIAL_REDIRECT);
                        tab.set('interstitialPageId', id); // mark who interstitial page I was visited
                        tab.set('shopId', id);
                        tab.set('interstitialPage', url);


                    }
                }
            }
        } else {
            $.each(THIRD_PARTY_LINKS, function (i, link) {
                if (url.indexOf(link) !== -1) {
                    tab.set('state', tab.get('state') | TAB_STATE_3RD_PARTY);
                    return false;
                }
            });
        }
    },

    /**
     *
     * @param data
     */
    sendActivationData: function (data) {
        var self = this,
            tab = data.data.tab.cid ? data.data.tab : self.tabs.selectById(data.data.tab.id),
            merchant = data.data.merchant;
        var type = new RegExp('notification_re_activate_cashback').test(tab.get('interstitialPage')) ? 2 : 1;
        var _history = JSON.parse(JSON.stringify(tab.get('history')));
        var referer = _.findWhere(tab.get('history'), {url: tab.get('interstitialPage')}),
            activateData = {
                shop_id: merchant.id,
                type: type,
                interstitial_page: {
                    url: tab.get('interstitialPage') ? tab.get('interstitialPage') : '',
                    referer: referer && referer.referer ? referer && referer.referer : '',
                    date: referer && referer.date ? referer && referer.date : ''
                },
                cookies: self.merchants.selectById(merchant.id).get('savedCookie'),
                transitions: _history ? _history : ''
            };
        self.merchants.selectById(merchant.id).activationLog = activateData;
        $.post(API.logActivate(), activateData);
    },

    /**
     *
     * @param event
     */
    sendThanksYouPageData: function (event) {
        var self = this;
        var domain = Utils.getDomain(event.url);
        var tab = self.tabs.selectById(event.tabId);
        var merchant = domain && self.merchants.selectByDomain(domain) && self.merchants.selectByDomain(domain).attributes;

        if (merchant && merchant && merchant.thankyoupage && merchant.thankyoupage.length > 0
            && tab.attributes.url.indexOf(merchant.thankyoupage[0].url) > 0) {

            var _history = JSON.parse(JSON.stringify(!!merchant.extendedTabThanksPage ? merchant.extendedTabThanksPage.tabInfo.history : tab.get('history')));

            var referer = _.findWhere(_history,
                (!!merchant.extendedTabThanksPage ? merchant.extendedTabThanksPage.interstitialPage : _history[_history.length - 1].url));


            var thanksYouPageData = {
                shop_id: merchant.id,
                interstitial_page: {
                    url: !!merchant.extendedTabThanksPage ? merchant.extendedTabThanksPage.interstitialPage : tab.get('url'),
                    referer: referer && referer.referer ? referer && referer.referer : tab.get('url'),
                    date: referer && referer.date ? referer && referer.date : ''
                },
                cookies: merchant.savedCookie,
                transitions: _history
            };
            if (!!self.merchants.selectById(merchant.id)) {
                self.merchants.selectById(merchant.id).thanksYouPageData = thanksYouPageData;
            }
            $.post(API.logThanksGiving(), thanksYouPageData);
        }
    },

    /**
     * USER NOTIFY
     */
    usersNotifyHandler: function () {
        var self = this;

        Storage.get("showUserNotifications", function (showUserNotifications) {
            if (typeof showUserNotifications !== 'undefined' && !showUserNotifications) {
                return;
            }

            if (self.user) {
                var notifications = self.user.get("notifications");
                var filteredNotifications = _.where(notifications, {"status": "1", showed: false});

                if (filteredNotifications && filteredNotifications.length) {
                    self.user.set("notifications", _.map(notifications, function (notification) {
                        notification.showed = true;
                        return notification;
                    }));
                    Storage.get("showed_notifications", function (lastShowedNotifications) {
                        var updatedShowedNotifications;
                        if (lastShowedNotifications || typeof lastShowedNotifications == "string") {
                            lastShowedNotifications = JSON.parse(lastShowedNotifications);
                            filteredNotifications = _.filter(filteredNotifications, function (n) {
                                return !_.contains(lastShowedNotifications, n.id);
                            });
                            updatedShowedNotifications = lastShowedNotifications.concat(_.pluck(filteredNotifications, "id"));
                        } else {
                            updatedShowedNotifications = _.pluck(filteredNotifications, "id");
                        }
                        Storage.set("showed_notifications", JSON.stringify(updatedShowedNotifications));
                        if (filteredNotifications && filteredNotifications.length) {
                            $.each(filteredNotifications, function (i, value) {
                                var notify = self.createNotification(value['markup'].replace(/<\/?[^>]+(>|$)/g, ""), 'images/btn/logo65.png', 'Новое сообщение!');

                                notify.onclose = _.bind(function (event) {
                                    self.user.pushReviewedNotifications(value.id)
                                }, this);
                                notify.onclick = _.bind(function () {
                                    framework.browser.navigate({
                                            tabId: framework.browser.NEWTAB,
                                            url: API._root + value['url']
                                        }
                                    );
                                    self.user.pushReviewedNotifications(value.id);
                                    notify.close();
                                }, this);
                            });
                        }
                    });
                }
            }
        });

        setTimeout(function () {
            self.usersNotifyHandler();
        }, USER_NOTIFY_INTERVAL);
    },

    /**
     * get data from ajax for promo Notify
     */
    promoNotifyHandlerAjax: function () {
        var self = this;
        var settings = {
            url: API.promoNotifications(),
            type: "get"
        };
        $.ajax(settings).done(function (data) {
            Storage.set('promoNotifications', data);
        });

        clearInterval(self.intervalPromoNotifyHandlerAjax);
        self.intervalPromoNotifyHandlerAjax = setInterval(function () {
            self.promoNotifyHandlerAjax();
        }, PROMO_NOTIFY_PERIOD);
    },


    /**
     * promo Notifications for users
     */
    promoNotifyHandler: function () {
        var self = this;
        var promoNotifications = "promoNotifications";
        var tab = self.tabs.selectById(self.tabs.currentTabId);

        Storage.get("showPromoNotifications", function (showPromoNotifications) {
            if ((typeof showPromoNotifications === "undefined" || showPromoNotifications) && tab && tab.attributes) {
                var url = new URL(tab.get('url'));
                Storage.get(promoNotifications, function (data) {
                    if (data) {
                        $.each(data, function (i, value) {
                            if ($.inArray("*", value["domains"]) !== -1 || $.inArray(url.origin, value["domains"]) === 0) {
                                Storage.get(promoNotifications + "_" + i, function (result) {
                                    if ((!result && _.now() > new Date(value["_notificateAt"]).getTime() && _.now() < new Date(value["_expireAt"]).getTime())) {
                                        showPush(value, function () {
                                            Storage.set(promoNotifications + "_" + i, _.now());
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

        function showPush(value, cb) {
            var imageLogo = 'images/btn/logo65.png';
            if (value['_href_logo'] || value['_href_logo'].startsWith('http')) {
                imageLogo = value['_href_logo'];
            }
            if (framework.browser.name !== BROWSER_NAME_FF) {
                var notify = self.createNotification(value['message'], imageLogo, value['title']);
                notify.onclick = _.bind(function () {
                    framework.browser.navigate({
                            tabId: framework.browser.NEWTAB,
                            url: value['_href']
                        }
                    );
                    notify.close();
                }, this);
                if (typeof cb === 'function') {
                    cb();
                }
            } else if (framework.browser.name === BROWSER_NAME_FF) {
                var notificationId = value['_href'];
                var optons = {
                    "type": "basic",
                    "iconUrl": imageLogo,
                    "title": value['title'],
                    "message": value['message']
                };

                chrome.notifications.create(notificationId, optons);

                chrome.notifications.onClicked.addListener(function (notificationId) {
                    framework.browser.navigate({
                            tabId: framework.browser.NEWTAB,
                            url: value['_href']
                        }
                    );
                    chrome.notifications.clear(notificationId);
                });
                if (typeof cb === 'function') {
                    cb();
                }
            }
        }
    },

    /**
     *
     */
    promoNotifyHandlerTimer: function () {
        var self = this;
        clearInterval(self.intervalPromoNotifyHandler);
        self.intervalPromoNotifyHandler = setInterval(function () {
            self.promoNotifyHandler();
        }, PROMO_NOTIFY_INTERVAL);
    },

    /**
     * DON'T USE
     */
    usersNotifyDismiss: function (event, callback) {
        var self = this;
        if (event.data) {
            self.user && self.user.pushReviewedNotifications(event.data);
        }
        callback && callback();
    },

    /**
     * INITIALIZE HANDLERS (PARAMS, COOKIE)
     */
    initializeParamsHandler: function () {
        var self = this;
        framework.extension.attachEvent(GET_EXTENSION_INFO, function (event) {
            framework.extension.fireEvent(SEND_EXTENSION_INFO, {
                tabId: event.tabId,
                data: {version: framework.extension.version, name: framework.extension.name}
            });
        });
    },

    /**
     * HANDLER OF CHECKING REWRITE COOKIE
     */
    initializeCookieHandler: function () {
        var self = this;
        var savedCookie = '';
        framework.extension.attachEvent(SET_MERCHANT_COOKIES, function (event, callback) {
            if (event.data) {
                var merchant = self.merchants.selectById(event.data.merchantId);
                merchant.set("savedCookie", event.data.cookie);
            }
        });
        framework.extension.attachEvent(CASHBACK_DEACTIVATE, function (event, callback) {
            if (event.data) {
                var merchant = self.merchants.selectById(event.data.merchantId);
                var savedCookie = merchant.attributes.savedCookie;
                if (merchant.attributes.rewrite === false) {
                    Button.red();
                    merchant.reset();
                    merchant.set({rewrite: true});
                    var _history = JSON.parse(JSON.stringify(merchant.activationLog.transitions.concat(self.history.slice(-5))));
                    var data = {
                        checkCookieParams: merchant.attributes.checkCookieParams,
                        savedCookie: savedCookie,
                        pageCookies: event.data.pageCookies
                    };
                    var rewriteData = {
                        shop_id: merchant.id,
                        rewrite_type: "cookie",
                        transitions: merchant.activationLog.transitions ? merchant.activationLog.transitions : tab.get('history'),
                        data: data
                    };
                    $.post(API.logRewrite(), rewriteData);
                }
            }
        });
        framework.extension.attachEvent(CHECK_MERCHANT_COOKIES, function (event, callback) {
            var domain = Utils.getDomain(event.url);
            var merchant = domain && self.merchants.selectByDomain(domain);
            if (merchant && merchant.get("checkCookieParams") && merchant.get("checkCookieParams").length) {
                callback && callback({merchant: merchant.toJSON()});
            }
        });
        framework.extension.attachEvent(CLEAR_COOKIES, function (event, callback) {
            var domain = Utils.getDomain(event.url);
            var merchant = domain && self.merchants.selectByDomain(domain);
            if (merchant) {
                merchant.set('savedCookie', null);
            }
        });
    },

    /**
     * HANDLER OF CHECKING REWRITE PARAMS
     */
    onParameterResearch: function (event) {
        var self = this;
        var url = event.url;
        var domain = Utils.getDomain(url);
        var checkedParams = {};
        var merchant = self.merchants.selectByDomain(domain);
        if (merchant && merchant.get("checkUrlParams") && merchant.get("checkUrlParams").length && merchant.get("isActivated")) {
            var checkParamsCollection = merchant.get("checkUrlParams");
            if (merchant.get("savedParams") && merchant.get("savedParams").length > 0) {
                var cashbackParams = merchant.get("savedParams");
                var flag;

                if (_.keys(Utils.getAllUrlParams(url)).length > 0) {
                    var checkFlagParams = true;
                    _.each(cashbackParams, function (params) {
                        if (checkFlagParams) {
                            var rightSetForCheck = _.filter(checkParamsCollection, function (checkParamsSet) {
                                return _.isEqual(_.keys(checkParamsSet), _.keys(params));
                            });
                            _.each(rightSetForCheck[0], function (pattern, paramName) {
                                var firstParamValue = new RegExp(paramName.replace("$", "\\$") + "=([^&]+)", "i").exec(decodeURIComponent(url));
                                if (firstParamValue) {
                                    var paramValue = new RegExp(paramName.replace("$", "\\$") + "=([^;]+)", "i").exec(firstParamValue[0]);
                                    if (paramValue !== null && new RegExp(pattern, "i").test(paramValue[1])) {
                                        return checkedParams[paramName] = paramValue[1];
                                    }
                                    return checkedParams[paramName] = null;
                                }
                            });

                            if (JSON.stringify(_.keys(checkedParams)) === JSON.stringify(_.keys(params))) {
                                flag = JSON.stringify(params) === JSON.stringify(checkedParams);
                            } else if (_.compact(_.uniq(_.values(checkedParams))).length !== 0) {
                                flag = true;
                                _.each(checkedParams, function (item, keyItem) {
                                    if (Object.keys(params).indexOf(keyItem) !== -1) {
                                        var flagTmp = Object.values(params).indexOf(item) !== -1;
                                        if (!flagTmp) {
                                            flag = flagTmp;
                                        }
                                    }
                                });
                            } else {
                                flag = true;
                            }
                            if (!flag) {
                                checkFlagParams = false;
                            }
                        }

                    });
                } else {
                    flag = true;
                }

                if (!flag) {
                    // deactivate merchant because params were rewritten
                    var tab = self.tabs.selectById(event.tabId),
                        data = {
                            checkUrlParams: merchant.attributes.checkUrlParams,
                            savedParams: merchant.attributes.savedParams,
                            checkedParams: checkedParams
                        },
                        rewriteData = {
                            shop_id: merchant.id,
                            rewrite_type: "get",
                            transitions: tab.get('history') ? tab.get('history') : merchant.activationLog.transitions,
                            data: data
                        };
                    $.post(API.logRewrite(), rewriteData);
                    merchant.reset();
                    merchant.set({rewrite: true});
                    if (self.tabs.currentTabId === event.tabId) {
                        Button.red();
                    }
                    merchant.unset('isActivated');
                    merchant.set('extendedTabThanksPage');
                }
            }
        }

    },

    onParameterSave: function (event) {
        var self = this;
        var url = event.originUrl ? event.originUrl : event.url,
            domain = Utils.getDomain(url),
            merchant = self.merchants.selectByDomain(domain);


        if (_.keys(Utils.getAllUrlParams(url)).length > 0 ||
            _.keys(Utils.getAllUrlParams(url)).length === 0 && "undefined" !== typeof merchant.get('mainFrame')) {
            if (merchant && merchant.get("checkUrlParams") && merchant.get("checkUrlParams").length && !merchant.get("isActivated") && !merchant.get("savedParams")) {
                var checkParamsCollection = merchant.get("checkUrlParams");
                var complete = false;
                var params = [];

                _.each(checkParamsCollection, function (checkParamsSet) {
                    if (complete) {
                        return;
                    }
                    var paramValues = _.chain(checkParamsSet)
                        .map(function (pattern, paramName) {
                            var firstParamValue = new RegExp(paramName.replace("$", "\\$") + "=([^&]+)", "i").exec(decodeURIComponent(url));
                            if (firstParamValue) {
                                var paramValue = new RegExp(paramName.replace("$", "\\$") + "=([^;]+)", "i").exec(firstParamValue[0]);
                                if (paramValue !== null && new RegExp(pattern, "i").test(paramValue[1])) {
                                    return [paramName, paramValue[1]];
                                }
                                return [paramName, null];
                            }
                        })
                        .compact()
                        .object()
                        .value();

                    var clearParamValues = [];
                    $.each(paramValues, function (index, value) {
                        clearParamValues.push(value);
                    });

                    if (clearParamValues.length > 0 && !clearParamValues.includes(null)) {
                        params.push(paramValues);
                    }
                });
                if (params && params.length > 0) {
                    merchant.set("savedParams", params);
                }
                return true;
            } else if (merchant && !merchant.get('isActivated') && !merchant.get('rewrite') && _.isEmpty(merchant.get("checkUrlParams"))) {
                this.unset("mainFrame");
                merchant.set("isActivated", true);
                merchant.trigger(CASHBACK_ACTIVATE);
            }
        } else {
            merchant.set("mainFrame", true);
        }
    },

    unRewrite: function (data) {
        var self = this,
            merchant = self.merchants.selectById(data.data.id);
        merchant.set({rewrite: false});
        merchant.reset();
        merchant.resetSavedParams();
    },

    /**
     * FAVORITE HANDLERS
     */
    onFavoriteClick: function (event) {
        var self = this;
        if (event.data) {
            var id = event.data.id;
            var isFavorite = event.data.isFavorite;
            isFavorite ? self.user.pushDisliked(id) : self.user.pushLiked(id);
            var merchant = self.merchants.selectById(id);
            merchant.set("isFavorite", !isFavorite);
        }
    },

    updateFavoriteStatusInContent: function (data) {
        framework.extension.fireEvent(UPDATE_FAVORITE_STATUS_FROM_BG,
            {
                tabId: framework.browser.ALLTABS,
                data: data
            }
        );
    },

    /**
     * POPUP BEHAVIOR
     */
    initPopup: function () {
        var self = this;
        framework.ui.button.setPopup({
            'url': 'popup/popup.html',
            'width': POPUP_WIDTH,
            'height': POPUP_HEIGHT
        });
    },

    onPopupFirstOpening: function () {
        Button.setBadge("");
        Storage.get(POPUP_FIRST_OPENING_TOKEN, function (token) {
            if (!token) {
                Storage.set(POPUP_FIRST_OPENING_TOKEN, "Wow!");
            }
        });
    },

    /**
     * ACTIVITIES AFTER INSTALL OR DELETE EXTENSION (chrome)
     */
    onInstalledAndDelete: function () {
        var self = this;
        Storage.get('afterInstallPageIsShown', function (afterInstallPageIsShown) {
                if (!afterInstallPageIsShown) {
                    Storage.set('afterInstallPageIsShown', true);

                    //log after install
                    self.pushLogInstall();

                    //after install
                    _.delay(function () {
                        framework.browser.navigate({
                            tabId: framework.browser.NEWTAB, url: API.afterInstall()
                        })
                    }, 500);
                    //after delete
                    var browser = framework.browser.name;
                    if (browser === BROWSER_NAME_CHROME) {
                        chrome.runtime.setUninstallURL(API.afterDelete());
                    } else if (browser === BROWSER_NAME_FF) {
                        var UninstallObserver = {
                            'onUninstalling': function (ffaddon) {
                                if (ffaddon['id'] === 'letyshops@LetyShops') {
                                    framework.browser.navigate({
                                        tabId: framework.browser.NEWTAB,
                                        url: API.afterDelete()
                                    });
                                }
                            },
                            'register': function () {
                                var observerService = Components['classes']['@mozilla.org/observer-service;1']['getService'](Components['interfaces']['nsIObserverService']);
                                observerService['addObserver'](UninstallObserver, 'quit-application-granted', false);
                                Components['utils']['import']('resource://gre/modules/AddonManager.jsm');
                                AddonManager['addAddonListener'](UninstallObserver);
                            }
                        };
                        UninstallObserver.register();
                    }
                }
            }
        );
    },

    pushLogInstall: function () {
        var self = this;
        var user = self.user;
        if (user && user.isLogin()) {
            var inf = Utils.getFullInfo();
            var request = {
                os: inf.os,
                browser: inf.browser,
                browser_version: inf.version,
                extension_version: framework.extension.version
            };
            $.post(API.logInstall(), request);
            clearInterval(self.intervalPushLogInstall);
        } else {
            clearInterval(self.intervalPushLogInstall);
            self.intervalPushLogInstall = setInterval(function () {
                self.pushLogInstall(API.logInstall());
            }, INTERVAL_PUSH_LOG);
        }
    },

    pushLogRequest: function () {
        var self = this;
        var user = self.user;
        var timePushLogRequest = 'timePushLogRequest';
        Storage.get('afterInstallPageIsShown', function (afterInstallPageIsShown) {
            if (afterInstallPageIsShown) {
                Storage.get(timePushLogRequest, function (result) {
                    if (!result || _.now() - result > UPDATE_LOG_REQUEST) {
                        if (user && user.isLogin()) {
                            var inf = Utils.getFullInfo();
                            var request = {
                                os: inf.os,
                                browser: inf.browser,
                                browser_version: inf.version,
                                extension_version: framework.extension.version
                            };
                            $.post(API.logRequest(), request);
                            clearInterval(self.intervalShotPushLogRequest);
                            Storage.set(timePushLogRequest, _.now());
                        }
                    }
                });
            }
        });
    },

    //TODO: Что то сделать с этим...
    periodicPushViewedMerchant: function (data, url) {
        var self = this;
        //post
        // if (data) {
        //     $.ajax({
        //             url: url,
        //             type: "POST",
        //             data: {shops_viewed: data},
        //             processData: true,
        //             error: function (jqXHR, textStatus, errorThrown) {
        //                 if (jqXHR.status == '400' || jqXHR.statusText == "Bad Request") {
        //                     framework.extension.log("pushViewedMerchant - Forbidden");
        //                 }
        //             }
        //         }
        //     );
        // }
    },

    /**
     * ICON ANIMATION
     */
    ease: function (x) {
        return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
    },

    initializeIconAnimation: function () {
        var self = this;
        $(function () {
            $('<canvas/>', {
                id: 'canvas_id',
                width: 19,
                height: 19
            }).appendTo('body');

            $('#canvas_id').attr('width', 19).attr('height', 19);

            $('<img/>', {
                id: 'animate_icon',
                src: 'images/btn/logo19colorful.svg'
            }).appendTo('body');

            self.animationFrames = framework.browser.name == 'Safari' ? 1 : 270;
            self.animationSpeed = 1;
            self.canvas = document.getElementById('canvas_id');
            self.animateIco = document.getElementById('animate_icon');
            self.canvasContext = self.canvas.getContext('2d');
            self.rotation = 0;
        });

    },

    animateIcon: function (iconPath) {
        var self = this;
        iconPath = 'images/btn/logo19colorful.svg';
        self.rotation += 1 / self.animationFrames;
        self.drawRotatedIcon();

        if (self.rotation <= 1) {
            setTimeout(function () {
                self.animateIcon(iconPath);
            }, self.animationSpeed);
        } else {
            self.rotation = 0;
            self.firstAnimation = false;
            var merchant = self.get('currentMerchant') ? self.merchants.selectById(self.get('currentMerchant')) : false;
            if (!merchant) {
                Button.standard();
            } else if (merchant && merchant.get('isActivated')) {
                Button.green()
            } else {
                Button.red()
            }
        }
    },

    drawRotatedIcon: function () {
        var self = this;
        self.canvasContext.save();
        self.canvasContext.clearRect(0, 0, self.canvas.width, self.canvas.height);
        self.canvasContext.translate(
            Math.ceil(self.canvas.width / 2),
            Math.ceil(self.canvas.height / 2));
        self.canvasContext.rotate(8 * Math.PI * self.ease(self.rotation));
        self.canvasContext.drawImage(self.animateIco,
            -Math.ceil(self.canvas.width / 2),
            -Math.ceil(self.canvas.height / 2));
        self.canvasContext.restore();

        framework.ui.button.setIcon(self.canvas.toDataURL());
    },

    createNotification: function (Body, Icon, Title) {
        var options = {
            body: Body,
            icon: Icon
        };
        return new Notification(Title, options);
    },

    /**
     * google analytics
     */
    initializeGoogleAnalyticsHandler: function () {
        var self = this;
        framework.extension.attachEvent(SEND_GOOGLE_ANALYTICS, function (event) {
            var data = event.data;
            if (data.type == 'pageview') {
                self.sendGoogleAnalyticsPageView(data.page);
            } else if (data.type == 'event') {
                self.sendGoogleAnalyticsEvent(data.category, data.action, data.label, data.value);
            }
        });
    },

    writeGoogleAnalyticsCID: function (event) {
        this.user.set('googleAnalyticsCID', event.data);
    },

    sendGoogleAnalyticsPageView: function (documentPage) {
        var self = this,
            options = {
                v: 1,
                tid: googleAnalyticsTID,
                cid: self.user.get('googleAnalyticsCID') || 'anonymous',
                t: 'pageview',
                dp: documentPage,
                cd1: self.user.get('token'),
                cd2: self.user.get('googleAnalyticsCID') || 'anonymous',
                cd4: Date.now(),
                cd5: framework.extension.version
            };
        if (!options.cd1) {
            delete options['cd1'];
        }
        $.post(googleAnalyticsURLCollect, options);
    },

    sendGoogleAnalyticsEvent: function (category, action, label, value) {
        var self = this,
            options = {
                v: 1,
                tid: googleAnalyticsTID,
                cid: self.user.get('googleAnalyticsCID') || 'anonymous',
                t: 'event',
                ec: category,
                ea: action,
                el: label,
                ev: value,
                cd1: self.user.get('token'),
                cd2: self.user.get('googleAnalyticsCID') || 'anonymous',
                cd4: Date.now(),
                cd5: framework.extension.version
            };
        if (!options.cd1) {
            delete options['cd1'];
        }
        $.post(googleAnalyticsURLCollect, options);
    },

    rivalAddListHandlerAjax: function () {
        var self = this;
        $.ajax({
            url: API.ddList(),
            type: "get",
            success: function (data) {
                Storage.set('ddList', data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(jqXHR, textStatus, errorThrown);
            }
        });

        clearInterval(self.intervalRListHandlerAjax);
        self.intervalRListHandlerAjax = setInterval(function () {
            self.promoNotifyHandlerAjax();
        }, R_LIST_ADD_PERIOD);
    },

    /**
     *
     * @param user
     * @param url
     * @param referer
     */
    sendCashbackIsAvailable: function (user, url, referer) {
        var self = this;
        var settings = {
            async: true,
            crossDomain: true,
            url: API.cashbackIsAvailable(),
            method: "GET",
            headers: {
                "app-token": APP_TOKEN,
                "extension-token": user.attributes.tokenCookies && user.attributes.tokenCookies.eaetkn ? user.attributes.tokenCookies.eaetkn : '',
                "user-token": user.attributes.tokenCookies && user.attributes.tokenCookies.eautkn ? user.attributes.tokenCookies.eautkn : '',
                "accept": "application/json",
                "referrer": referer,
                "version-ext": framework.extension.version
            },
            data: {
                url: url.href
            },
            dataType: 'json'
        };

        $.ajax(settings).done(function (response) {
            var domain = Utils.getDomain(url.origin);
            var merchant = domain && self.merchants.selectByDomain(domain);
            if (merchant) {
                merchant.set({
                    isCashbackAvailable: {
                        code: response.code,
                        expire: response.expire * 1000,
                        lastTimeRequest: _.now()
                    }
                });
            } else {
                Storage.get('isCashbackAvailable', function (isCashbackAvailable) {
                    if (!isCashbackAvailable) {
                        isCashbackAvailable = [];
                        isCashbackAvailable.push({
                            url: url.host,
                            code: response.code,
                            expire: response.expire * 1000,
                            lastTimeRequest: _.now()
                        });
                        Storage.set('isCashbackAvailable', isCashbackAvailable);
                    }
                    else {
                        var listUrls = [];
                        _.each(isCashbackAvailable, function (item) {
                            listUrls.push(item.url);
                        });
                        if ($.inArray(url.host, listUrls) !== -1) {
                            _.each(isCashbackAvailable, function (item) {
                                if (url.host === item.url) {
                                    item.url = url.host;
                                    item.code = response.code;
                                    item.expire = response.expire * 1000;
                                    item.lastTimeRequest = _.now();
                                }
                            });
                            Storage.set('isCashbackAvailable', isCashbackAvailable);
                        } else {
                            isCashbackAvailable.push({
                                url: url.host,
                                code: response.code,
                                expire: response.expire * 1000,
                                lastTimeRequest: _.now()
                            });
                            Storage.set('isCashbackAvailable', isCashbackAvailable);
                        }
                    }
                });
            }
        });
    },

    /**
     *
     * @param url
     * @param user
     * @param dataPage
     */
    getTargetInfo: function (url, user, dataPage) {

        return function () {
            var result = null;
            var dataPageLength = _.compact(_.uniq(_.keys(dataPage.data))).length;

            var settings = {
                async: false,
                crossDomain: true,
                url: API.itemInfo(),
                type: "GET",
                headers: {
                    "Accept": "application/json",
                    "app-token": APP_TOKEN,
                    "extension-token": user.attributes.tokenCookies && user.attributes.tokenCookies.eaetkn ? user.attributes.tokenCookies.eaetkn : '',
                    "user-token": user.attributes.tokenCookies && user.attributes.tokenCookies.eautkn ? user.attributes.tokenCookies.eautkn : '',
                    "version-ext": framework.extension.version
                },
                data: {
                    url: url,
                    priceMin: dataPage && dataPageLength !== 0 ? dataPage.data.priceMin : '',
                    priceMax: dataPage && dataPageLength !== 0 ? dataPage.data.priceMax : '',
                    currency: dataPage && dataPageLength !== 0 ? dataPage.data.currency : '',
                    priceMinDisplay: dataPage && dataPageLength !== 0 ? dataPage.data.priceMinDisplay : '',
                    priceMaxDisplay: dataPage && dataPageLength !== 0 ? dataPage.data.priceMaxDisplay : '',
                    currencyDisplay: dataPage && dataPageLength !== 0 ? dataPage.data.currencyDisplay : '',
                    timezone: dataPage && dataPageLength !== 0 ? dataPage.data.timezone : ''
                },
                dataType: 'json'
            };

            $.ajax(settings).done(function (data) {
                result = data
            });
            return result;
        }();
    },

    /**
     *
     * @param event
     * @param user
     */
    getPriceHistory: function (event, user) {

        var itemInfo = event.data.itemInfo;
        var dataPageLength = _.compact(_.uniq(_.keys(itemInfo.priceLast.dataPricePage.data))).length;
        var dataPricePage = itemInfo.priceLast.dataPricePage.data;

        return function () {
            var result = null;

            var settings = {
                async: false,
                crossDomain: true,
                url: API.itemHistory(),
                type: "GET",
                headers: {
                    "Accept": "application/json",
                    "app-token": APP_TOKEN,
                    "extension-token": user.attributes.tokenCookies && user.attributes.tokenCookies.eaetkn ? user.attributes.tokenCookies.eaetkn : '',
                    "user-token": user.attributes.tokenCookies && user.attributes.tokenCookies.eautkn ? user.attributes.tokenCookies.eautkn : '',
                    "version-ext": framework.extension.version
                },
                data: {
                    id: itemInfo.id.id,
                    type: itemInfo.id.type,
                    priceMin: itemInfo && dataPageLength !== 0 ? dataPricePage.priceMin : '',
                    priceMax: itemInfo && dataPageLength !== 0 ? dataPricePage.priceMax : '',
                    currency: itemInfo && dataPageLength !== 0 ? dataPricePage.currency : '',
                    priceMinDisplay: itemInfo && dataPageLength !== 0 ? dataPricePage.priceMinDisplay : '',
                    priceMaxDisplay: itemInfo && dataPageLength !== 0 ? dataPricePage.priceMaxDisplay : '',
                    currencyDisplay: itemInfo && dataPageLength !== 0 ? dataPricePage.currencyDisplay : '',
                    timezone: itemInfo && dataPageLength !== 0 ? dataPricePage.timezone : ''
                },
                dataType: 'json'
            };

            $.ajax(settings).done(function (data) {
                result = data
            });
            return result;
        }();
    },

    /**
     *
     * @param user
     * @param itemInfo
     */
    sendItemToWishList: function (user, itemInfo) {
        var data = {
            itemId: {
                id: itemInfo.id.id,
                type: itemInfo.id.type
            },
            wishState: {
                state: 1
            }
        };

        if (user.attributes.tokenCookies && _.compact(_.uniq(_.keys(user.attributes.tokenCookies))).length !== 0) {
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": API.itemWishUpdate(),
                "method": "POST",
                "data": JSON.stringify(data),
                "headers": {
                    "app-token": APP_TOKEN,
                    "extension-token": user.attributes.tokenCookies.eaetkn,
                    "user-token": user.attributes.tokenCookies.eautkn,
                    "accept": "application/json",
                    "version-ext": framework.extension.version
                }
            };
            $.ajax(settings).done(function (response) {
                console.log(response);

            }).error(function (jqXHR, textStatus, errorThrown) {
                console.error(jqXHR, textStatus, errorThrown);
            });
        }
    },

    /**
     *
     * @param targetInfo
     * @returns {{}}
     */
    getDecodeNotes: function (targetInfo) {
        var decodeNotes = {};
        var resume = targetInfo.itemInfo.seller.resume;

        const GROUP_SCORE = 0;
        const GROUP_FEEDBACK = 1;
        const GROUP_AGE = 2;
        const GROUP_DESCRIPTION = 3;
        const GROUP_COMMUNICATION = 4;
        const GROUP_SHIPPING = 5;

        function getLevel(level) {
            var obj = {};
            switch (level) {
                case LEVEL_ERROR:
                    obj.color = LEVEL_ERROR_COLOR;
                    obj.status = LEVEL_ERROR_STATUS;
                    break;
                case LEVEL_WARNING:
                    obj.color = LEVEL_WARNING_COLOR;
                    obj.status = LEVEL_WARNING_STATUS;
                    break;
                case LEVEL_INFO:
                    obj.color = LEVEL_INFO_COLOR;
                    obj.status = LEVEL_INFO_STATUS;
                    break;
            }

            return obj;
        }

        function getScoreText(type, notesScore) {
            switch (type) {
                case 0:
                    notesScore.text = TYPE_SCORE_1;
                    break;
                case 1:
                    notesScore.text = TYPE_SCORE_2;
                    break;
                case 2:
                    notesScore.text = TYPE_SCORE_3;
                    break;
                case 3:
                    notesScore.text = TYPE_SCORE_4;
                    break;
            }
        }

        function getFeedbackText(type, notesFeedback) {
            switch (type) {
                case 4:
                    notesFeedback.text = TYPE_FEEDBACK_1;
                    break;
                case 5:
                    notesFeedback.text = TYPE_FEEDBACK_2;
                    break;
                case 6:
                    notesFeedback.text = TYPE_FEEDBACK_3;
                    break;
                case 7:
                    notesFeedback.text = TYPE_FEEDBACK_4;
                    break;
            }
        }

        function getAgeText(type, notesAge, year) {
            switch (type) {
                case 8:
                    notesAge.text = TYPE_AGE_1;
                    break;
                case 9:
                    notesAge.text = TYPE_AGE_2;
                    break;
                case 10:
                    notesAge.text = TYPE_AGE_3_1 + year + TYPE_AGE_3_2;
                    break;
            }
        }

        function getDescriptionText(type, notesDescription) {
            switch (type) {
                case 11:
                    notesDescription.text = TYPE_DESCRIPTION_1;
                    break;
                case 12:
                    notesDescription.text = TYPE_DESCRIPTION_2;
                    break;
                case 13:
                    notesDescription.text = TYPE_DESCRIPTION_3;
                    break;
                case 14:
                    notesDescription.text = TYPE_DESCRIPTION_4;
                    break;
                case 15:
                    notesDescription.text = TYPE_DESCRIPTION_5;
                    break;
            }
        }

        function getCommunicationText(type, notesCommunication) {
            switch (type) {
                case 16:
                    notesCommunication.text = TYPE_COMMUNICATION_1;
                    break;
                case 17:
                    notesCommunication.text = TYPE_COMMUNICATION_2;
                    break;
                case 18:
                    notesCommunication.text = TYPE_COMMUNICATION_3;
                    break;
                case 19:
                    notesCommunication.text = TYPE_COMMUNICATION_4;
                    break;
                case 20:
                    notesCommunication.text = TYPE_COMMUNICATION_5;
                    break;
            }
        }

        function getShippingText(type, notesShipping) {
            switch (type) {
                case 21:
                    notesShipping.text = TYPE_SHIPPING_1;
                    break;
                case 22:
                    notesShipping.text = TYPE_SHIPPING_2;
                    break;
                case 23:
                    notesShipping.text = TYPE_SHIPPING_3;
                    break;
                case 24:
                    notesShipping.text = TYPE_SHIPPING_4;
                    break;
                case 25:
                    notesShipping.text = TYPE_SHIPPING_5;
                    break;
            }
        }


        var notesScore = {};
        var notesFeedback = {};
        var notesAge = {};
        var notesDescription = {};
        var notesCommunication = {};
        var notesShipping = {};

        _.each(resume.notes, function (item) {

            switch (item.group) {
                case GROUP_SCORE:
                    notesScore = getLevel(item.level);
                    getScoreText(item.type, notesScore);
                    decodeNotes = {
                        notesScore: notesScore
                    };
                    break;
                case GROUP_FEEDBACK:
                    notesFeedback = getLevel(item.level);
                    getFeedbackText(item.type, notesFeedback);
                    decodeNotes = {
                        notesFeedback: notesFeedback
                    };
                    break;
                case GROUP_AGE:
                    notesAge = getLevel(item.level);
                    var year = item.tokens[0].value;
                    getAgeText(item.type, notesAge, year);
                    decodeNotes = {
                        notesAge: notesAge
                    };
                    break;
                case GROUP_DESCRIPTION:
                    notesDescription = getLevel(item.level);
                    getDescriptionText(item.type, notesDescription);
                    decodeNotes = {
                        notesDescription: notesDescription
                    };
                    break;
                case GROUP_COMMUNICATION:
                    notesCommunication = getLevel(item.level);
                    getCommunicationText(item.type, notesCommunication);
                    decodeNotes = {
                        notesCommunication: notesCommunication
                    };
                    break;
                case GROUP_SHIPPING:
                    notesShipping = getLevel(item.level);
                    getShippingText(item.type, notesShipping);
                    decodeNotes = {
                        notesShipping: notesShipping
                    };
                    break;
            }
        });
        decodeNotes = {
            notesScore: notesScore,
            notesFeedback: notesFeedback,
            notesAge: notesAge,
            notesDescription: notesDescription,
            notesCommunication: notesCommunication,
            notesShipping: notesShipping
        };

        return decodeNotes;
    },

    /**
     *
     * @param targetInfo
     * @returns {{ItemDynamicSvg: {}}|*}
     */
    getDecodeItemDynamic: function (targetInfo) {
        var ItemDynamic;

        var ItemDynamicSvg = {};
        switch (targetInfo.itemInfo.dynamic.type) {
            case TYPE_NO_CHANGE:
                ItemDynamicSvg.svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">\n' +
                    '<path fill="#1EB1FC" fill-rule="evenodd" d="M16.492 17.85a.747.747 0 0 1-1.057-1.058l4.004-4.004H2.747a.747.747 0 0 1 0-1.495h16.709l-4.018-4.017a.747.747 0 0 1 1.058-1.057l5.285 5.285a.747.747 0 0 1 0 1.058l-5.289 5.287z"/>\n' +
                    '</svg>';
                ItemDynamicSvg.text = TYPE_NO_CHANGE_TEXT;
                break;
            case TYPE_MINOR_DOWN:
                ItemDynamicSvg.svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">\n' +
                    '<path fill="#00C853" fill-rule="evenodd" d="M11.065 19.323a.747.747 0 0 1 0-1.495h5.662L4.924 6.025a.747.747 0 0 1 1.057-1.057l11.815 11.814v-5.681a.747.747 0 0 1 1.495 0v7.475a.747.747 0 0 1-.748.747h-7.478z"/>\n' +
                    '</svg>';
                ItemDynamicSvg.text = TYPE_MINOR_DOWN_TEXT;
                break;
            case TYPE_DOWN:
                ItemDynamicSvg.svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">\n' +
                    '<path fill="#00C853" fill-rule="evenodd" d="M6.185 16.527a.747.747 0 0 1 1.057-1.058l4.004 4.003V2.783a.747.747 0 0 1 1.495 0V19.49l4.018-4.018a.747.747 0 0 1 1.057 1.058l-5.285 5.285a.747.747 0 0 1-1.058 \t0l-5.287-5.288z"/>\n' +
                    '</svg>';
                ItemDynamicSvg.text = TYPE_DOWN_TEXT;
                break;
            case TYPE_MINOR_DOWN_AFTER_UP:
                ItemDynamicSvg.svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">\n' +
                    '<path fill="#00C853" fill-rule="evenodd" d="M11.711 8.829l7.016 6.999h-5.662a.747.747 0 1 0 0 1.495h7.478a.747.747 0 0 0 .748-.747V9.1a.747.747 0 0 0-1.495 0v5.681L12.355 7.36a.769.769 0 0 0-.069-.078c-.268-.268-.682-.29-.923-.048l-.08.08a.761.761 0 0 0-.032.032L3.045 15.55c-.241.242-.22.655.05.924.268.268.681.29.923.048L11.71 8.83z"/>\n' +
                    '</svg>';
                ItemDynamicSvg.text = TYPE_MINOR_DOWN_AFTER_UP_TEXT;
                break;
            case TYPE_MINOR_UP_AFTER_DOWN:
                ItemDynamicSvg.svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">\n' +
                    '<path fill="#F44336" fill-rule="evenodd" d="M11.711 15.56l7.016-7h-5.662a.747.747 0 1 1 0-1.495h7.478c.413 0 .748.334.748.747v7.475a.747.747 0 0 1-1.495 0V9.606l-7.441 7.423a.769.769 0 0 1-.069.078c-.268.268-.682.29-.923.048l-.08-.08a.761.761 0 0 1-.032-.032L3.045 8.838c-.241-.242-.22-.655.05-.924.268-.268.681-.29.923-.048l7.693 7.693z"/>\n' +
                    '</svg>';
                ItemDynamicSvg.text = TYPE_MINOR_UP_AFTER_DOWN_TEXT;
                break;
            case TYPE_UP:
                ItemDynamicSvg.svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">\n' +
                    '<path fill="#F44336" fill-rule="evenodd" d="M17.815 7.542a.747.747 0 0 1-1.057 1.057l-4.004-4.004v16.692a.747.747 0 0 1-1.495 0V4.578L7.242 8.596a.747.747 0 0 1-1.057-1.057l5.285-5.286a.747.747 0 0 1 1.058 0l5.287 5.289z"/>\n' +
                    '</svg>';
                ItemDynamicSvg.text = TYPE_UP_TEXT;
                break;
            case TYPE_MINOR_UP:
                ItemDynamicSvg.svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">\n' +
                    '<path fill="#F44336" fill-rule="evenodd" d="M19.289 12.97a.747.747 0 0 1-1.495 0V7.306L5.99 19.11a.747.747 0 0 1-1.057-1.057L16.748 6.238h-5.681a.747.747 0 0 1 0-1.495h7.475c.413 0 .747.335.747.748v7.478z"/>\n' +
                    '</svg>';
                ItemDynamicSvg.text = TYPE_MINOR_UP_TEXT;
                break;
        }
        ItemDynamic = {
            ItemDynamicSvg: ItemDynamicSvg
        };

        return ItemDynamic;
    }
});
