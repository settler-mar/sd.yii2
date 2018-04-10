var StoresTab = Backbone.View.extend({
    el: "#letyshops-content-container-store",
    template: Handlebars.templates.stores_tab,
    isRenderedSearchRequest: false,

    /**
     * initialize
     * @param options
     */
    initialize: function (options) {
        var self = this;
        self.app = framework.extension.getBackgroundPage().application;
        self.options = options;
        self.events = {
            "click #letyshops-stores-tab-item": "onStoreClick",
            "click #letyshops-stores-tab-item-special": "onSpecialClick",
            "click #letyshops-store-heart": "onFavoriteClick",
            "click #letyshops-search-bar-btn": "onSearch",
            "input #letyshops-search-bar": "onSearch"
        };
        self.listenTo(self.model, "reset", function () {
            if (!self.isRenderedSearchRequest)
                self.render(null, null, false)
        });
        self.listenTo(self.model, POPUP_MERCHANTS_UPDATE, function (isFavorite) {
            if (!self.isRenderedSearchRequest)
                self.render(null, null, false)
        });
    },

    delegateEvents: function () {
        return Backbone.View.prototype.delegateEvents.apply(this, arguments);
    },

    /**
     * HANDLER SEARCH REQUEST
     * @param event
     */
    onSearch: function (event) {
        var self = this;
        var matchedModels;
        var searchEvent = {
            term: self.$el.find('#letyshops-search-bar').val().trim(),
            caretStart: event.target.selectionStart || 0,
            caretEnd: event.target.selectionEnd || 0
        };
        if (self.lastTerm === searchEvent.term) {
            return;
        }
        if (searchEvent.term.length >= 1) {
            $('#letyshops-search-bar').val(searchEvent.term);
            matchedModels = self.model.selectByAliasNew(searchEvent.term);
            if (matchedModels && matchedModels.length && matchedModels.length > 0) {
                var merchantPartnerList = [];
                var merchantGlobalDisabled = [];
                _.each(matchedModels, function (merchant) {
                    if (merchant.settings.partnerList || merchant.settings.partnerListNoActive) {
                        merchantPartnerList.push(merchant);
                    }
                    if (merchant.settings.globalDisabled) {
                        merchantGlobalDisabled.push(merchant);
                    }
                });
                if (merchantPartnerList && merchantPartnerList.length > 0) {
                    self.render({
                        merchants: merchantPartnerList
                    }, searchEvent, true);
                } else if (merchantGlobalDisabled && merchantGlobalDisabled.length > 0) {
                    self.render({
                        merchants: null,
                        merchantsDisabled: true
                    }, searchEvent, true);
                }

            } else {
                self.render({
                    merchants: null
                }, searchEvent, true);
            }
            $('#letyshops-search-bar').val(searchEvent.term).on('focusout', function (event) {
                self.app.sendGoogleAnalyticsEvent('Extension', 'Search', searchEvent.term, matchedModels ? matchedModels.length : '0');
            });
        } else {
            self.render(null, searchEvent, true);
            self.$el.find('#letyshops-search-bar').attr('placeholder', 'Искать магазины');
        }
    },

    /**
     * CLICK ON ITEM STORE LIST
     * @param e
     */
    onStoreClick: function (e) {
        var self = this;
        // var user = self.options.user;
        var $targetElement = $(e.target);
        if (!$targetElement.hasClass("letyshops-store-heart")) {
            if (!($targetElement.prop("tagName") === "I")) {
                var $clickedElement = $(e.currentTarget);
                if ($clickedElement.attr("store-id") != null) {
                    var merchant = self.app.merchants.selectById($clickedElement.attr("store-id"));
                    self.app.sendGoogleAnalyticsPageView(gaPageShops + merchant.get('title') + '/');
                    self.trigger(POPUP_TO_MERCHANT_CARD, $clickedElement.attr("store-id"));
                    // user.rewriteViewed(merchant.id);
                }
            }
        }

    },

    /**
     * CLICK ON FLOATING BUTTON
     */
    onSpecialClick: function () {
        framework.browser.navigate({
                tabId: framework.browser.NEWTAB,
                url: API.allStoresPage()
            }
        );
        window.close();
    },

    /**
     * CLICK ON HEART
     * @param e
     */
    onFavoriteClick: function (e) {
        var self = this;
        var user = self.options.user;
        var $clickedElement = $(e.currentTarget);
        if (user && user.isLogin()) {
            var id = $clickedElement.attr("store-id"),
                merchant = self.app.merchants.selectById(id);
            var isFavorite = $clickedElement.attr('favorite') == "true";
            var allHeartElements = $("i[store-id='" + id + "']");
            self.trigger(POPUP_TO_UPDATE_FAVORITE_STATUS, {id: id, isFavorite: isFavorite});
            if (isFavorite) {
                self.app.sendGoogleAnalyticsEvent('Extension', 'Favorite reset', merchant.get('title'));
                //user.pushDisliked(id);
            } else {
                self.app.sendGoogleAnalyticsEvent('Extension', 'Favorite set', merchant.get('title'));
                //user.pushLiked(id);
            }
            _.each(allHeartElements, function (element) {
                $(element).toggleClass("red grey");
                $(element).attr("favorite", isFavorite ? "false" : "true");
                $(element).text(isFavorite ? "favorite_border" : "favorite");
            });
        }
    },

    /**
     * HANDLER LOGIC OF FLOATING BUTTON
     */
    onScrollList: function () {
        var self = this;
        var listHeight = 40;
        var verticalPosition = self.$el.find("#letyshops-scroll-list").scrollTop();
        _.each(self.$el.find(".letyshops-stores-tab-wrapper"), function (wrapper) {
            listHeight += $(wrapper).height();
        });
        if (listHeight - verticalPosition > 300) {
            self.trigger(POPUP_UPDATE_FOOTER, {
                stateSpecBtn: FOOTER_ALL_STORES
            });
        } else if (listHeight - verticalPosition < 300) {
            self.trigger(POPUP_UPDATE_FOOTER, {
                stateSpecBtn: FOOTER_LABEL
            });
        }
    },

    /**
     * RENDER
     * @param data
     * @param searchEvent
     * @param updateFooterNow
     * @returns {StoresTab}
     */
    render: function (data, searchEvent, updateFooterNow) {
        var self = this;
        var isLogin = self.options.user.isLogin();
        if (!data) {
            if (!isLogin) {
                data = {
                    merchants: self.model.select50First()
                }
            } else {
                var sortedViewed = [];
                _.each(self.options.user.get('viewed'), function (id) {
                    _.each(self.model.selectViewed(), function (model) {
                        if (model.id === id) {
                            sortedViewed.push(model)
                        }
                    })
                });
                var sortedRecommended = [];
                _.each(self.options.user.get('recommended'), function (id) {
                    _.each(self.model.selectRecommended(), function (model) {
                        if (model.id === id) {
                            sortedRecommended.push(model);
                        }
                    })
                });
                if (sortedViewed && sortedRecommended) {
                    data = {
                        merchants: {
                            viewed: sortedViewed,
                            recommended: sortedRecommended
                        }
                    }
                }
            }
            self.isRenderedSearchRequest = false;
            self.merchantsDisabled = false;
        } else {
            self.isRenderedSearchRequest = true;
            self.merchantsDisabled = true;
        }

        data = _.extend(data, {isFilled: data.merchants && (data.merchants.length > 0 || data.merchants.recommended.length > 0)},
            {isLogin: isLogin},
            {isRenderedSearchRequest: self.isRenderedSearchRequest}
        );
        self.$el.empty().html(self.template(data));

        // handlers search bar and footer bar behaviour after update tab
        searchEvent && self.renderSearchBar(searchEvent);
        self.renderFooterState(updateFooterNow);
        return self;
    },

    /**
     * renderSearchBar
     * @param searchEvent
     */
    renderSearchBar: function (searchEvent) {
        var self = this;
        self.lastTerm = searchEvent.term;
        var searchBar = document.getElementById('letyshops-search-bar');
        if (searchEvent.term && searchEvent.term.length >= 1) self.$el.find('#letyshops-search-bar').val(searchEvent.term);
        if (searchBar.createTextRange) {
            var range = searchBar.createTextRange();
            range.collapse(true);
            range.moveEnd('character', searchEvent.caretEnd);
            range.moveStart('character', searchEvent.caretStart);
            range.select();
        } else {
            searchBar.focus();
            searchBar.selectionStart = searchEvent.caretStart;
            searchBar.selectionEnd = searchEvent.caretEnd;
        }
    },

    /**
     * HANDLER OF FOOTER CONTENT
     * @param updateNow
     */
    renderFooterState: function (updateNow) {
        var self = this;
        var listHeight = 40;
        _.each(self.$el.find(".letyshops-stores-tab-wrapper"), function (wrapper) {
            listHeight += $(wrapper).height();
        });
        if (listHeight > 500) {
            self.$el.find("#letyshops-scroll-list").on("scroll", _.bind(self.onScrollList, self));
            if (updateNow)
                self.trigger(POPUP_UPDATE_FOOTER, {
                    stateSpecBtn: FOOTER_ALL_STORES
                });
            setTimeout(_.bind(function () {
                self.trigger(POPUP_INITIALIZE_FOOTER_FOR_STORES, {
                    tab: "stores",
                    stateSpecBtn: FOOTER_ALL_STORES
                });
            }, self), 0);
        } else {
            if (updateNow)
                self.trigger(POPUP_UPDATE_FOOTER, {
                    stateSpecBtn: FOOTER_LABEL
                });
            setTimeout(_.bind(function () {
                self.trigger(POPUP_INITIALIZE_FOOTER_FOR_STORES, {
                    tab: "stores",
                    stateSpecBtn: FOOTER_LABEL
                })
            }, self), 0);
        }
    }
});