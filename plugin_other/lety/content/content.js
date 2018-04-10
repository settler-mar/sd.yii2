var debug = true;
if (!debug) {
    window.console.log = function () {
    };
}
;$(function () {
        _.delay(function () {
            (function initContent() {
                if (typeof framework === "undefined") {
                    _.delay(initContent, 1000);
                } else {
                    var searchLineCurrent = location.search;

                    injectCSS();

                    setNotificationSearch();

                    framework.extension.fireEvent(SEND_THANKS_YOU_PAGE_DATA, {});

                    var patternOwnerPage = null;
                    try {
                        patternOwnerPage = location.href.matchAll(CHECK_LETYSHOPS)[0][0];
                    } catch (e) {
                    }

                    Cookie.checkUserCookie();
                    Cookie.checkMerchantCookie();
                    Cookie.getMerchantCookie();
                    Cookie.getTokensCookies();
                    framework.extension.attachEvent(TAB_WAS_CHANGED, function (event) {
                            Cookie.checkMerchantCookie();
                        }
                    );

                    document.addEventListener(USER_APPLIED_LETY_CODES, function () {
                        framework.extension.fireEvent(UPDATE_LETY_CODES, {});
                    });

                    framework.extension.attachEvent(SEND_EXTENSION_INFO, function (event) {
                        if(patternOwnerPage && patternOwnerPage != null){
                            addMetaTags(event.data.name, framework.browser.name, event.data.version, location.href, patternOwnerPage);
                            Cookie.setCookie(COOKIE_EXTENSION_NAME, COOKIE_EXTENSION_VALUE, COOKIE_EXTENSION_EXPIRES, '.' + API.domain);
                        }
                    });

                    framework.extension.fireEvent(GET_EXTENSION_INFO, {tabId: null});

                    framework.extension.fireEvent(SEND_PAGE_INFO, {
                        tabId: null,
                        data: {
                            referer: document.referrer,
                            url: document.location.href,
                            date: JSON.stringify(new Date())
                        }
                    });

                    if (location.href.match(patternOwnerPage)) {
                        var sci = document.cookie.match(new RegExp("(?:^|; )" + '_ga'.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
                        if (sci) {
                            framework.extension.fireEvent(SEND_GA_CID, {tabId: null, data: decodeURIComponent(sci[1])});
                        }
                    }


                    _.delay(function () {

                        try {
                            var damainPrice = Utils.getDomainPrice(location.host);
                            var id = Utils.getProductId(damainPrice, location.pathname);
                        } catch (e) {
                        }

                        if (id && id.length > 0) {

                            var dataPrice = Utils.getPrice(damainPrice);

                            Storage.get(id + '_' + dataPrice.currencyDisplay + '_timeUpdateItemInfo', function (timeLastUpdated) {

                                if (!timeLastUpdated || _.now() - timeLastUpdated > UPDATE_INTERVAL_INFO_HISTORY_PRICE) {
                                    framework.extension.fireEvent(NOTIFICATION_GET_PRICE, {
                                        tabId: null,
                                        data: {
                                            data: dataPrice,
                                            updateInfo: true
                                        }
                                    }, function (data) {
                                        if (data && data !== null && data.targetInfo &&
                                            data.targetInfo.itemInfo !== null && data.targetInfo.itemInfo.dynamic) {
                                            Storage.set(id + '_' + dataPrice.currencyDisplay, data.targetInfo);
                                            Storage.set(id + '_' + dataPrice.currencyDisplay + '_timeUpdateItemInfo', _.now());

                                            var notificationPriceData = {
                                                merchant: data.merchant,
                                                isLogin: data.isLogin,
                                                targetInfo: data.targetInfo
                                            };

                                            new NotificationPrice({model: notificationPriceData}).render();
                                            framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS, {
                                                tabId: null,
                                                data: {
                                                    type: 'pageview',
                                                    page: gaPrefixMonitor + 'show/' + data.merchant.title + '/'
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    framework.extension.fireEvent(NOTIFICATION_GET_PRICE, {
                                        tabId: null,
                                        data: {
                                            data: dataPrice,
                                            updateInfo: false
                                        }
                                    }, function (data) {
                                        if (data) {
                                            Storage.get(id + '_' + dataPrice.currencyDisplay, function (targetInfo) {

                                                var notificationPriceData = {
                                                    merchant: data.merchant,
                                                    isLogin: data.isLogin,
                                                    targetInfo: targetInfo
                                                };

                                                new NotificationPrice({model: notificationPriceData}).render();
                                                framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS, {
                                                    tabId: null,
                                                    data: {
                                                        type: 'pageview',
                                                        page: gaPrefixMonitor + 'show/' + data.merchant.title + '/'
                                                    }
                                                });
                                            })
                                        }
                                    });
                                }
                            });
                        }

                    }, 100);

                    _.delay(function () {
                        framework.extension.fireEvent(NOTIFICATION_GET_INFO, {tabId: null}, function (data) {
                            if (data) {
                                var merchant = data;
                                var tab = data.extendedTab;
                            }

                            if (merchant && tab && verificationWindow()) {
                                if (merchant && !merchant.isSuppressed) {
                                    var notification;
                                    if (merchant.isActivated && merchant.settings.injectSuccessNotification) {
                                        if (checkNotificationContainer()) {
                                            if (merchant.hasPromoActivated) {
                                                new NotificationPromo({model: merchant, promo: data.promo}).render();
                                                framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS, {
                                                    tabId: null,
                                                    data: {
                                                        type: 'pageview',
                                                        page: gaPagePopup + 'activate-cashback-sale-done/' + merchant.title + '/'
                                                    }
                                                });
                                            } else {
                                                notification = new NotificationActivated({model: merchant}).render();
                                                if (!!merchant.hotProducts && merchant.hotProducts.length > 0) {
                                                    try {
                                                        var damainPriceActivate = Utils.getDomainPrice(location.host);
                                                        var idActivate = Utils.getProductId(damainPriceActivate, location.pathname);
                                                    } catch (e) {
                                                    }

                                                    if (idActivate && idActivate.length > 0) {
                                                        _.each(merchant.hotProducts, function (item) {
                                                            if (Object.keys(item).includes(idActivate)) {
                                                                notification.addRateForHotProduct(item);
                                                            }
                                                        });
                                                    }
                                                }
                                                framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS, {
                                                    tabId: null,
                                                    data: {
                                                        type: 'pageview',
                                                        page: gaPagePopup + 'activate-cashback-done/' + merchant.title + '/'
                                                    }
                                                });
                                                framework.extension.fireEvent(SEND_ACTIVATION_DATA, {
                                                    tabId: null,
                                                    data: {
                                                        tab: tab,
                                                        merchant: merchant
                                                    }
                                                });
                                            }
                                        }
                                    } else if (!merchant.isActivated && merchant.settings.injectNotification) {
                                        if (checkNotificationContainer()) {
                                            notification = new Notification({model: merchant}).render();
                                            if (merchant.checkUrlParams.length > 0) {
                                                notification.addInfo();
                                            }
                                            if (merchant.rewrite === true) {

                                                if (!!merchant.hotProducts) {

                                                    try {
                                                        var damainPriceRewrite = Utils.getDomainPrice(location.host);
                                                        var idRewrite = Utils.getProductId(damainPriceRewrite, location.pathname);
                                                    } catch (e) {
                                                    }

                                                    if (idRewrite && idRewrite.length > 0) {
                                                        var hotProductsArr = [];
                                                        _.each(merchant.hotProducts, function (item) {
                                                            if (Object.keys(item).includes(idRewrite)) {
                                                                notification.addWarningHotProduct(item);
                                                            } else {
                                                                hotProductsArr.push(item);
                                                            }
                                                        });
                                                        framework.extension.fireEvent(UPDATE_MERCHANTS_HOT_PRODUCTS, {
                                                            data: {
                                                                hotProductsArr: hotProductsArr,
                                                                id: merchant.id
                                                            }
                                                        });
                                                    }

                                                } else {
                                                    notification.addWarning();
                                                }

                                                // notification.addWarning();
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
                                            } else {
                                                framework.extension.fireEvent(CLEAR_COOKIES, {
                                                    tabId: null,
                                                    data: {merchant: merchant}
                                                });
                                                framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS, {
                                                    tabId: null,
                                                    data: {
                                                        type: 'pageview',
                                                        page: gaPagePopup + 'activate-cashback/' + merchant.title + '/'
                                                    }
                                                });
                                            }
                                        }
                                    } else if (!merchant.isActivated && merchant.settings.injectRewriteNotification &&
                                        merchant.rewrite === true && merchant.checkUrlParams.length > 0) {

                                        if (checkNotificationContainer()) {
                                            notification = new Notification({model: merchant}).render();
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

                                    } else if (!merchant.isActivated && merchant.settings.injectNotificationWithoutActivate) {

                                        new NotificationWithoutActivate({model: merchant}).render();
                                    }

                                    if ($('.letyshops-notification-merchant-default').text().replace('до ', '').replace('%', '') ===
                                        $('.letyshops-notification-merchant-rebate').find('span').text().replace('до ', '').replace('%', '')) {
                                        $('.letyshops-notification-merchant-default').hide()
                                    }
                                }
                            }
                        });
                    }, 2000);

                    framework.extension.attachEvent(CLOSE_ALL_NOTIFICATION, function (event) {
                        if (location.host.indexOf(event.data.pattern) > -1) {
                            $('body #letyshops-notification-container').fadeOut(400);
                        }
                    });

                    function verificationWindow() {
                        if ($(window).width() < 700) return false;
                        if (framework.browser.name === 'Chrome') {
                            if (location.href.indexOf('http') === 0 && (window.locationbar && window.locationbar.visible) || !window.locationbar) {
                                return true;
                            }
                        } else if ((window.menubar && window.menubar.visible) || !window.menubar) {
                            return true;
                        }
                        return false;
                    }

                    function checkNotificationContainer() {
                        return $('#letyshops-notification-container').css('display') === 'none' || "undefined" === typeof $('#letyshops-notification-container').css('display');
                    }

                    function setNotificationSearch() {
                        var searchUrls = [];
                        if (!$('.letyshops-notification-search__icon').length) {
                            if (location.host.startsWith('yandex')) {

                                _.each($('li.serp-item div.organic__subtitle'), function (item) {
                                    if ($(item).find('span').length < 4) {
                                        if (!$(item).text().includes('реклама')) {
                                            searchUrls.push(item.children[0])
                                        }

                                    }
                                });

                                document.body.addEventListener("DOMSubtreeModified", function () {
                                    var searchLineModifyed = location.search;
                                    if ($('.letyshops-notification-search__icon').length === 0 && searchLineModifyed !== searchLineCurrent) {
                                        searchLineCurrent = searchLineModifyed;
                                        setTimeout(function () {
                                            setNotificationSearch();
                                        }, 1000);
                                    }
                                });

                            }
                            if (location.host.startsWith('www.google') || location.host.startsWith('google')) {
                                searchUrls = $('#search cite');
                            }

                            _.each(searchUrls, function (item, index) {
                                var searchUrl = $(item).text().indexOf('http') !== 0 ? location.protocol + '//' + $(item).text() : $(item).text();
                                var firstShow = index === 0;

                                function renderLetyshopsNotificationToSearchPage(element, merchant, show) {
                                    new NotificationSearch({model: merchant, element: element, show: show}).render();
                                }

                                framework.extension.fireEvent(GET_INFO_MERCHANT, {
                                    data: {
                                        dataUrlPage: searchUrl.match(REG_URL)[0],
                                        firstShow: firstShow
                                    }
                                }, function (data) {
                                    if (!!data && !!data.merchant) {
                                        var merchant = data.merchant;
                                        var firstShow = data.firstShow;

                                        const urlParams = new URL(location.href).searchParams,
                                              query = urlParams.get('q') || urlParams.get('text');

                                        const branded = merchant.aliases.reduce((prev, alias) => {
                                            return prev + (decodeURIComponent(query).toLocaleLowerCase().indexOf(alias.toLowerCase()) + 1);
                                        }, 0);

                                        Storage.get("showCashbackHints", function (showCashbackHints) {
                                            if ((typeof showCashbackHints === 'undefined' || showCashbackHints) &&
                                                merchant.settings.showInSearchEngine &&
                                                (merchant.settings.dontShowInformer ? !branded : true)
                                            ) {
                                                const element = $(item).attr('class') === 'path organic__path' ?
                                                    $(item).parents()[2] : $(item).closest('div[data-hveid]').find('a').eq(0);

                                                renderLetyshopsNotificationToSearchPage(element, merchant, firstShow);
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    }
                }
            })();
        }, 200);
    }
);
