var OffersTab = Backbone.View.extend({
    el: "#letyshops-content-container-offer",
    template: Handlebars.templates.offers_tab,

    initialize: function (options) {
        var self = this;
        self.options = options;

        self.events = {
            "click #letyshops-offer-tab-item": "onActivate",
            "click #letyshops-offer-heart": "onFavoriteClick",
            "click #letyshops-offers-tab-item-special": "onSpecialClick"
        };

        self.listenTo(self.model, "reset", function () {
            self.render()
        });
        self.listenTo(self.model, POPUP_MERCHANTS_UPDATE, function () {
            self.render()
        });
    },

    delegateEvents: function () {
        return Backbone.View.prototype.delegateEvents.apply(this, arguments);
    },

    onActivate: function (e) {
        var self = this;
        var $targetElement = $(e.target);
        if (!$targetElement.hasClass("letyshops-offer-heart")) {
            if (!($targetElement.prop("tagName") == "I")) {
                var $clickedElement = $(e.currentTarget);
                if ($clickedElement.attr("offer-id") != null) {
                    var offerId = $clickedElement.attr("offer-id");
                    self.specialOffer && self.offers.push(self.specialOffer);
                    var offer = _.findWhere(self.offers, {"id": +offerId});
                    var merchant = _.findWhere(self.model.models, {"id": +(offer.mId | offer.shopId)});
                    var url = new URL(API.link() + offer.activateOfferUrl);
                    url.searchParams.set('utm_term', 'extension');

                    if (self.options.user.isLogin() && merchant) {
                        framework.extension.fireEvent(CLOSE_ALL_NOTIFICATION, {
                            tabId: framework.browser.ALLTABS,
                            data: merchant.attributes
                        });
                        self.options.app.sendGoogleAnalyticsEvent('Extension', 'Click on sales', merchant.get('title'));
                        self.model.get(offer.shopId).trigger(PROMO_ACTIVATE, offer.id);
                        self.options.user.pushViewedMerchant(offer.shopId);
                    }

                    // self.options.user.rewriteViewed(merchant.id);
                    framework.browser.navigate({
                            tabId: framework.browser.NEWTAB,
                            url: url.href
                        }
                    );
                    window.close();
                }
            }
        }
    },

    onSpecialClick: function () {
        framework.browser.navigate({
                tabId: framework.browser.NEWTAB,
                url: API.hotDealsPage()
            }
        );
        window.close();
    },

    /*CLICK ON HEART*/

    onFavoriteClick: function (e) {
        var self = this;
        var user = self.options.user;
        var $clickedElement = $(e.currentTarget);
        if (user && user.isLogin()) {
            var id = $clickedElement.attr("store-id");
            var isFavorite = $clickedElement.attr('favorite') == "true";
            var allHeartElements = $("i[store-id='" + id + "']");
            self.trigger(POPUP_TO_UPDATE_FAVORITE_STATUS, {id: id, isFavorite: isFavorite});
            isFavorite ? user.pushDisliked(id) : user.pushLiked(id);
            _.each(allHeartElements, function (element) {
                $(element).toggleClass("red grey");
                $(element).attr("favorite", isFavorite ? "false" : "true");
                $(element).text(isFavorite ? "favorite_border" : "favorite");
            });
        }
    },

    onScrollList: function () {
        var self = this;
        var verticalPosition = self.$el.find("#letyshops-scroll-list").scrollTop();
        var listHeight = self.$el.find(".letyshops-offers-tab-wrapper").height();
        if (listHeight - verticalPosition > 320) {
            self.trigger(POPUP_UPDATE_FOOTER, {
                stateSpecBtn: FOOTER_ALL_OFFERS
            });
        } else if (listHeight - verticalPosition < 320) {
            self.trigger(POPUP_UPDATE_FOOTER, {
                stateSpecBtn: FOOTER_LABEL
            });
        }
    },

    render: function (data) {
        var self = this;
        if (!data) {
            data = self.options.app.getPreparedOffers();
        }
        var offers = data.offers;
        for (var i = 0; i < offers.length; i++) {
            var id = offers[i].mId | offers[i].shopId;
            var merchant = _.findWhere(self.model.models, {"id": +id});
            if (!merchant) {
                data.offers.splice(i, 1);
            }
        }

        if (data) {
            self.offers = data.offers;
            if (data.specialOffer) {
                self.specialOffer = data.specialOffer;
            }
            self.$el.empty().html(self.template(_.extend(data, {isLogin: self.options.user.isLogin()})));
        } else {
            self.$el.empty().html(self.template(_.extend(data, {isLogin: self.options.user.isLogin()})));
        }
        var listHeight = self.$el.find(".letyshops-offers-tab-wrapper").height();
        if (listHeight > 380) {
            self.$el.find("#letyshops-scroll-list").on("scroll", _.bind(self.onScrollList, self));
            setTimeout(_.bind(function () {
                self.trigger(POPUP_INITIALIZE_FOOTER_FOR_OFFERS, {
                    tab: "offers",
                    stateSpecBtn: FOOTER_ALL_OFFERS
                });
            }, self), 0);
        } else {
            setTimeout(_.bind(function () {
                self.trigger(POPUP_INITIALIZE_FOOTER_FOR_OFFERS, {
                    tab: "offers",
                    stateSpecBtn: FOOTER_LABEL
                });
            }, self), 0);
        }
        return self;
    }
});