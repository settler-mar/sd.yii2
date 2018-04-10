var Merchant = Backbone.Model.extend({
    defaults: {
        "id": "",
        "title": "",
        "aliases": [],
        "domain": "",
        "pattern": "",
        "domains_enabled": "",
        "domains_disabled": "",
        "logo": "",
        "shortDesc": "",
        "longDesc": "",
        "url": "",
        "activateUrl": '',
        "promo": [],
        "settings": {
            "globalDisabled": false,    //передавать в расширение, но нигде не выводить
            "partnerList": false,   //выводить в списке магазинов, активным
            "partnerListNoActive": false,   //выводить в списке магазинов, неактивным
            "browserAction": false, //активировать иконку при заходе на магазин
            "injectNotification": false,    //разрешается инъекция с предложением активации кб
            "injectNotificationWithoutActivate": false, //разрешается инъекция без предложения активации кб
            "injectSuccessNotification": false, //разрешается показать уведомление «Кэшбэк активирован» при переходе по партнерской ссылке
            "injectRewriteNotification": false, //разрешается показать уведомление о перезаписи партнерской ссылки
            "showInSearchEngine": false, //Показывать в поисковых системах
            "iconClickPage": false    //при клике на иконку вести по ссылке
        },
        "checkUrlParams": null,
        "checkCookieParams": null,
        "isFavorite": false,
        "isRecommended": false,
        "isViewed": false,
        "isActivated": false,
        "isSuppressed": false,
        "hasPromoActivated": "",
        "rewrite": false,
        "savedParams": [],
        "animated": "",
        "delayActivate": null,
        "thankyoupage": [],
        "cashbackRate": {
            "rate": null,
            "rateFormated": null,
            "isFloating": null,
            "suffixFormated": null,
            "type": null,
            "conditionsFormated": []
        },
        "rate": null,
        "rate_formated": null,
        "is_floating": null,
        "suffix": null,
        "type": null,
        "conditionsFormated": null,
        "cashback": null,
        "userCashback": null,
        "cashbackFloated": null,
        "clickPageUrl": ''
    },

    initialize: function () {
        var self = this;
        self.on(CASHBACK_ACTIVATE, self.activate);
        self.on(PROMO_ACTIVATE, self.activatePromo);
        self.on(MERCHANT_SUPPRESSED, self.suppressed);
    },

    suppressed: function () {
        this.set("isSuppressed", true);
    },

    activate: function () {
        var self = this;
        self.set({"isActivated": true});
        self.unset("isSuppressed");
        if (self.get('delayActivate')) {
            clearTimeout(self.get('delayActivate'));
            self.unset('delayActivate');
        }
        self.set('delayActivate', _.delay(_.bind(self.reset, self), UPDATE_INTERVAL_ACTIVATE));
    },

    activatePromo: function (promoId) {
        var self = this;
        self.set("hasPromoActivated", promoId + "");
        self.unset("isSuppressed");
        if (self.get('delayActivate')) {
            clearTimeout(self.get('delayActivate'));
            self.unset('delayActivate');
        }
        self.set('delayActivate', _.delay(_.bind(self.reset, self), UPDATE_INTERVAL_ACTIVATE));
    },

    reset: function () {
        this.unset("isActivated");
        this.unset("isSuppressed");
        this.unset("savedParams");
        this.unset("savedCookie");
        framework.extension.fireEvent(BUTTON_UPDATE, {tabId: null});
    },

    resetSavedParams: function () {
        this.set("savedParams", []);
    }
});