var debug = false;
if (!debug) {
    window.console.log = function () {
    };
}

;(function () {
    injectCSS();
})();

$(function init() {
    if (typeof framework === "undefined") {
        setTimeout(init, 100);
        return;
    }
    window.popup = new Popup({bg: framework.extension.getBackgroundPage()});
});


window.Popup = Backbone.Model.extend({

    initialize: function () {
        var self = this;
        var bg = self.get("bg");

        if (BROWSER_NAME_FF === framework.browser.name) {
            var defaultWidth = $('#letyshops-content-container').css("width");
            $('#letyshops-content-container').attr('style', 'width: ' + (parseInt(defaultWidth) + 6) + 'px !important');
        }

        _.extend(this, _.object(
            [
                "app",
                "user",
                "merchants",
                "offers",
                "tabs"
            ],
            [
                bg.application,
                bg.application.user,
                bg.application.merchants,
                bg.application.offers,
                bg.application.tabs
            ]
        ));

        self.user.fetch();

        self.app.onPopupFirstOpening();

        // create and render main components of popup           
        self.footer = new Footer().render();
        self.storesTab = new StoresTab({
            model: self.merchants,
            user: self.user
        }).render(null, null, true);
        self.offersTab = new OffersTab({
            app: self.app,
            model: self.merchants,
            user: self.user
        }).render();
        self.notificationTab = new NotificationTab();
        self.invitationTab = new InvitationTab();
        self.header = new Header().render(self.user);

        // Assign listeners for popup event
        // favorite listener
        self.storesTab.on(POPUP_TO_UPDATE_FAVORITE_STATUS, _.bind(self.onFavoriteClick, self));

        self.header.on(POPUP_TO_NOTIFICATION_TAB, _.bind(self.toNotificationTab, self));
        self.header.on(POPUP_TO_INVITATION_TAB, _.bind(self.toInvitationTab, self));
        self.storesTab.on(POPUP_TO_MERCHANT_CARD, _.bind(self.toStoreCard, self));
        self.header.on(POPUP_UPDATE_FOOTER, _.bind(self.onListScrolls, self));
        self.notificationTab.on(POPUP_PUSH_REVIEWED_NOTIFY, _.bind(self.user.pushReviewedNotifications, self.user));
        self.storesTab.on(POPUP_UPDATE_FOOTER, _.bind(self.onListScrolls, self));
        self.storesTab.on(POPUP_INITIALIZE_FOOTER_FOR_STORES, _.bind(self.onAppropriatingState, self));
        self.offersTab.on(POPUP_UPDATE_FOOTER, _.bind(self.onListScrolls, self));
        self.offersTab.on(POPUP_INITIALIZE_FOOTER_FOR_OFFERS, _.bind(self.onAppropriatingState, self));

        self.listenTo(self.user, "change:token", function (model, value, options) {
            self.header.render(model)
        });
        self.listenTo(self.user, "change:balance", function (model, value, options) {
            self.header.render(model)
        });
        self.listenTo(self.user, "change:notifications", function (model, value, options) {
            self.header.render(model)
        });
        self.listenTo(self.app, "change:currentMerchant", function (model, value, options) {
            self.toStoreCard(value);
        });
        var currentMercantId = self.app.get("currentMerchant"),
            currentPopupTab = self.app.get("currentPopupTab");
        if (currentMercantId) {
            var merchant = self.app.merchants.selectById(currentMercantId);

            if (merchant != null && merchant.get('settings').iconClickPage) {
                framework.browser.navigate({
                        tabId: framework.browser.NEWTAB,
                        url: merchant.get("clickPageUrl")
                    }
                );
            }else {
                if (merchant) {
                    self.app.sendGoogleAnalyticsPageView(gaPageShops + merchant.get('title') + '/');
                    self.toStoreCard(currentMercantId);
                }
            }

        } else if (currentPopupTab == 'stores') {
            self.app.sendGoogleAnalyticsPageView(gaPageShops);
        }
        setInterval(function () {
            _.each($('.letyshops-stores-tab-item'), function (element) {
                if ($(element).find('.letyshops-store-cashback-default').text().replace('до ', '') == $(element).find('.letyshops-store-cashback-user').text().replace('до ', '')) {
                    $(element).find('.letyshops-store-cashback-default').hide()
                }
            });
        }, 500);

        $("body").on("click", "a", function () {
            if (!$(this).attr('target')) {
                framework.browser.navigate({
                        tabId: framework.browser.NEWTAB,
                        url: $(this).attr('href')
                    }
                );
            }
            window.close();
        });
    },

    /**
     * to Invitation Tab
     */
    toInvitationTab: function () {
        var self = this;
        self.invitationTab.render(self.user.toJSON());
        $('#letyshops-referral-box-link').bind('copy', function (e) {
            self.app.sendGoogleAnalyticsEvent('Extension', 'Invite friend', 'Copy Link Keyboard');
        });
    },

    /**
     * to Notification Tab
     */
    toNotificationTab: function () {
        var self = this;
        self.notificationTab.render(self.user.get("notifications"));
    },

    /**
     * to Store Card
     * @param id
     */
    toStoreCard: function (id) {
        var self = this;
        var merchant = self.merchants.selectById(id);
        if (self.storeCard == null) {
            self.storeCard = new StoreCard({
                app: self.app,
                user: self.user
            });
            self.storeCard.on(POPUP_TO_UPDATE_FAVORITE_STATUS, _.bind(self.onFavoriteClick, self));
            self.storeCard.on(POPUP_UPDATE_FOOTER, _.bind(self.onListScrolls, self));
        }
        if (merchant != null) {
            self.header.switchOffTabs(true);
            self.storeCard.render(merchant);
            var tab = self.tabs.selectById();
            if (tab && (new RegExp(merchant.get("pattern")).test(tab.get("domain")))) {
                if (merchant.get('settings').partnerList){
                    self.storeCard.addInfoStore();
                }

            }
        }
    },

    /**
     * on Favorite Click
     * @param data
     */
    onFavoriteClick: function (data) {
        var self = this;
        var merchant = self.merchants.selectById(data.id);
        merchant.set("isFavorite", !data.isFavorite);
        self.app.updateFavoriteStatusInContent(data);
    },

    /**
     * on List Scrolls
     * @param data
     */
    onListScrolls: function (data) {
        var self = this;
        self.footer.render(data);
    },

    /**
     * on Appropriating State
     * @param data
     */
    onAppropriatingState: function (data) {
        var self = this;
        self.header.toAppropriateOfferState(data)
    }
});
