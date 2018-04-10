var Merchants = Backbone.Collection.extend({
    model: Merchant,
    flag: "merchants",
    flagRates: "merchantsRates",

    updateFlag: "merchantsLastUpdated",
    updateFlagRates: 'merchantsLastUpdated',

    url: API.merchants,

    initialize: function () {
        var self = this;
        self.on("reset", function () {
            self.save();
        });
        self.fetch();
    },

    resetAll: function () {
        var self = this;
        _.each(self.models, function (merchant) {
            merchant.unset('bonus');
            merchant.unset('userCashback');
            _.each(merchant.get('conditionsFormated'), function (value) {
                value.currentRateFormated = value.rateFormated;
                value.currentRate = value.rate;
            });
            merchant.reset();
        });
    },

    toJSON: function (models) {
        if (models && models.length > 0) {
            return _.map(models, function (model) {
                    return model && model.toJSON();
                }
            );
        } else {
            if (this.models && this.models.length > 0) {
                return _.map(this.models, function (model) {
                        return model && model.toJSON();
                    }
                );
            } else {
                return null;
            }
        }
    },

    setPersonalCashback: function (rates) {
        var self = this;

        if (rates && rates[0] && _.isArray(rates[0])) {
            rates = rates[0];
        }
        if (self.models.length === 0) {
            return;
        }

        var flag = true;
        _.each(self.models, function (merchant) {
            if (!merchant.get('rate') && merchant.get('rate') !== 0) {
                flag = false;
            }
        });

        if (!flag) {
            self.fetchRates();
            setTimeout(_.bind(function () {
                self.setPersonalCashback(rates);
            }, self), 100);

        } else {
            if (rates && rates.length) {
                rates.sort(function (a, b) {
                    return b.bonus - a.bonus;
                });

                var listShopsExclude = [];
                _.each(rates, function (code) {
                    if ("undefined" === typeof code.exclude_shop_ids) {
                        return true;
                    } else if (!code.exclude_shop_ids) {
                        listShopsExclude.push(code);
                    }
                });

                rates = rates.filter(function (i) {
                    return listShopsExclude.indexOf(i) < 0;
                });

                _.each(self.models, function (merchant) {
                    if (rates && rates.length > 0) {
                        _.each(rates, function (code) {
                            if ("undefined" === typeof code.exclude_shop_ids) {
                                if (merchant && ( !merchant.get('bonus') || code.bonus > merchant.get('bonus') )) {
                                    self.countPersonalCashback(merchant, code);
                                }
                            } else if (code.exclude_shop_ids) {
                                _.each(code.shop_ids, function (id) {
                                    if (merchant && merchant.id !== parseInt(id) &&
                                        ( !merchant.get('bonus') || code.bonus > merchant.get('bonus') )) {
                                        self.countPersonalCashback(merchant, code);
                                    }
                                });
                            }
                        });
                    } else {
                        merchant.unset('bonus');
                        merchant.set({userCashback: merchant.get('cashback')});
                        _.each(merchant.get('conditionsFormated'), function (value) {
                            value.currentRateFormated = value.rateFormated;
                            value.currentRate = value.rate;
                        });
                    }
                });

                _.each(listShopsExclude, function (code) {
                    _.each(code.shop_ids, function (id) {
                        var merchant = self.selectById(id);
                        if (merchant && ( !merchant.get('bonus') || code.bonus > merchant.get('bonus') )) {
                            self.countPersonalCashback(merchant, code);
                        }
                    });
                })
            }
        }
    },

    countPersonalCashback: function (merchant, code) {
        if (merchant.get('conditionsFormated') && merchant.get('conditionsFormated').length > 0) {
            _.each(merchant.get('conditionsFormated'), function (value) {
                value.currentRate = ((+value.rate) * (((+code.bonus) + 100) / 100)).toFixed(2);
                value.currentRateFormated = ((+value.currentRate * 100) / 100) + '' + value.suffix;
            });
        }

        var cashback = ((+merchant.get('rate')) * (((+code.bonus) + 100) / 100)).toFixed(2);
        var formatted = ((+cashback * 100) / 100) + '' + merchant.get('suffix');
        merchant.set({
            userCashback: formatted,
            bonus: code.bonus
        });
    },

    setFavorites: function (ids) {
        var self = this;
        if (self.models.length == 0) {
            return;
        }
        _.each(self.models, function (merchnat) {
            merchnat.set("isFavorite", false);
        });
        _.each(ids, function (id) {
            self.get(id + "") && self.get(id + "").set("isFavorite", true);
        });
        self.trigger(POPUP_MERCHANTS_UPDATE);
    },

    setRecommended: function (ids) {
        var self = this;
        if (self.models.length === 0) {
            return;
        }
        _.each(self.models, function (merchnat) {
            merchnat.set("isRecommended", false);
        });
        _.each(ids, function (id) {
            self.get(id + "") && self.get(id + "").set("isRecommended", true);
        });
        self.trigger(POPUP_MERCHANTS_UPDATE);
    },

    setViewed: function (ids) {
        var self = this;
        if (self.models.length === 0){
            return;
        }
        _.each(self.models, function (merchnat) {
            merchnat.set("isViewed", false);
        });
        _.each(ids, function (id) {
            self.get(id + "") && self.get(id + "").set("isViewed", true);
        });
        self.trigger(POPUP_MERCHANTS_UPDATE);
    },

    save: function () {
        Storage.set(this.flag, this.toJSON());
    },

    fetch: function () {
        if (!arguments[0]) {
            arguments[0] = {};
            arguments.length = 1;
        }
        var self = this,
            _arguments = arguments,
            _options = arguments[0],
            _callee = arguments.callee;  // it is reference on the function
        // Storage.set(self.updateFlag, 0);

        Storage.get(self.updateFlag, function (timeLastUpdated) {
                if (!timeLastUpdated || _.now() - timeLastUpdated > UPDATE_INTERVAL_MERCHANT) {
                    var _success = _options.success;
                    var _error = _options.error;
                    _options.success = function () {
                        Storage.set(self.updateFlag, _.now());
                        // self.fetchRates(true);
                        _success && _success.apply(self, arguments);
                    };
                    _options.reset = true;
                    Backbone.Collection.prototype.fetch.apply(self, _arguments).always(function () {
                        _options.success = _success;
                        _options.error = _error;
                    });
                } else {
                    Storage.get(self.flag, function (merchants) {
                        if (merchants && _.isString(merchants)) {
                            merchants = JSON.parse(merchants);
                        }
                        if (_.isObject(merchants)) {
                            self.reset(merchants);
                            // self.fetchRates();
                        } else if (!merchants) {
                            Storage.set(self.updateFlag, 0);
                            _callee.apply(self, _arguments);
                        }
                    });
                }
                if (!!self.fetchTimeout) {
                    window.clearTimeout(self.fetchTimeout);
                    self.fetchTimeout = null;
                }
                self.fetchTimeout = window.setTimeout(function () {
                    _callee.apply(self, _arguments);
                }, UPDATE_INTERVAL_MERCHANT);
            }
        );
    },

    fetchRates: function (force) {
        var self = this;
        Storage.get(self.updateFlagRates, function (updateFlagRates) {
            if (!updateFlagRates || _.now() - updateFlagRates > UPDATE_INTERVAL_MERCHANT || force) {
                $.ajax({
                        url: API.cashRates(),
                        type: "get",
                        success: function (data) {
                            self.addRates(data);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.error(jqXHR, textStatus, errorThrown);
                            self.addRates(self.models);
                        }
                    }
                );
            } else {
                Storage.get(self.flagRates, function (data) {
                    self.addRates(data);
                });

            }
        });

    },

    addRates: function (data) {
        var self = this;
        _.each(data, function (rate) {
            var merchant = self.findWhere({id: rate.id});
            if (merchant) {
                merchant.set({
                    rate: rate.a,
                    rate_formated: rate.b,
                    is_floating: rate.c,
                    suffix: rate.d,
                    type: rate.e,
                    conditionsFormated: rate.f,
                    cashback: rate.b,
                    userCashback: rate.b
                });
                if (rate.c && rate.c > 0) {
                    merchant.set({cashbackFloated: true});
                }
            }

        });

        if (data) {
            Storage.set(self.updateFlagRates, _.now());
            Storage.set(self.flagRates, data);
        }
        self.ratesAdded = true;
        self.save()
    },

    parse: function (response) {
        response = _.filter(response, function (merchant) {
            return !!merchant.id && !!merchant.c;
        });
        return _.map(response, function (merchant) {
            return _.object(
                [
                    "id",
                    "title",
                    "aliases",
                    "thankyoupage",
                    "cashback",
                    "cashbackFloated",
                    "userCashback",
                    "domain",
                    "pattern",
                    "domains_enabled",
                    "domains_disabled",
                    "logo",
                    "shortDesc",
                    "longDesc",
                    "url",
                    "activateUrl",
                    "promo",
                    "checkUrlParams",
                    "checkCookieParams",
                    "countDomainLevel",
                    "settings",
                    "cashbackRate",
                    "rate",
                    "rate_formated",
                    "is_floating",
                    "suffix",
                    "type",
                    "conditionsFormated",
                    "cashback",
                    "userCashback",
                    "cashbackFloated",
                    "clickPageUrl"
                ],
                [
                    merchant.id,
                    merchant.a,
                    merchant.h,
                    merchant.o,
                    merchant.i,
                    merchant.j,
                    merchant.i,
                    merchant.c,
                    merchant.c,
                    merchant.de,
                    merchant.dd,
                    merchant.d,
                    merchant.e,
                    merchant.f,
                    merchant.b,
                    merchant.m,
                    merchant.k,
                    merchant.l,
                    merchant.n,
                    merchant.c.match(/\./gi) != null ? merchant.c.match(/\./gi).length : 0,
                    _.isArray(merchant.g) ? _.object([
                        "globalDisabled",
                        "partnerList",
                        "partnerListNoActive",
                        "browserAction",
                        "injectNotification",
                        "injectNotificationWithoutActivate",
                        "injectSuccessNotification",
                        "injectRewriteNotification",
                        "showInSearchEngine",
                        "dontShowInformer",
                        "iconClickPage"
                    ], [
                        _.indexOf(merchant.g, "global_disabled") !== -1,
                        _.indexOf(merchant.g, "partner_list") !== -1,
                        _.indexOf(merchant.g, "partner_list_noactive") !== -1,
                        _.indexOf(merchant.g, "browser_action") !== -1,
                        _.indexOf(merchant.g, "inject_notification") !== -1,
                        _.indexOf(merchant.g, "inject_notification_without_activate") !== -1,
                        _.indexOf(merchant.g, "inject_success_notification") !== -1,
                        _.indexOf(merchant.g, "inject_rewrite_notification") !== -1,
                        _.indexOf(merchant.g, "show_in_search_engine") !== -1,
                        _.indexOf(merchant.g, "dont_show_informer") !== -1,
                        _.indexOf(merchant.g, "icon_click_page") !== -1
                    ]) : {},
                    Object.keys(merchant.p).length > 0 ? _.object(
                        [
                            "rate",
                            "rateFormated",
                            "isFloating",
                            "suffixFormated",
                            "type",
                            "conditionsFormated"
                        ],
                        [
                            merchant.p.a,
                            merchant.p.b,
                            merchant.p.c,
                            merchant.p.d,
                            merchant.p.e,
                            merchant.p.f
                        ]) : {},
                    merchant.p.a,
                    merchant.p.b,
                    merchant.p.c,
                    merchant.p.d,
                    merchant.p.e,
                    merchant.p.f,
                    merchant.p.b,
                    merchant.p.b,
                    merchant.p.c && merchant.p.c > 0,
                    merchant.q
                ]);
        });
    },

    /*METHODS FOR SELECT BY CONDITION*/

    selectByDomain: function (domain) {
        var self = this;
        var regExp = new RegExp(domain);
        var checkDomain = domain.substr(4);
        var origin = new URL('http://' + checkDomain);

        var merchants = self.find(function (merchant) {
            if ($.isArray(merchant.get("domains_enabled")) && $.isArray(merchant.get("domains_disabled"))) {
                return $.inArray(checkDomain, merchant.get("domains_disabled")) === -1 &&
                        merchant.get("domains_enabled").filter(domain => origin.isEqual('http://' + domain)).length;
            } else {
                return regExp.test(merchant.get("pattern"));
            }
        });
        if (!merchants) {
            var sortedMerchants = self.sortBy(function (merchant) {
                var countDomainLevel = merchant.get("countDomainLevel");
                return 10 - countDomainLevel;
            });
            merchants = _.find(sortedMerchants, function (merchant) {
                if (merchant.get("domains_enabled") && merchant.get("domains_disabled") &&
                    merchant.get("domains_enabled").length && merchant.get("domains_disabled").length) {
                    if (~$.inArray(checkDomain, merchant.get("domains_disabled")) &&
                        ($.inArray(checkDomain, merchant.get("domains_enabled")) >= 0 || checkDomain === merchant.get("domains_enabled")[0]) &&
                        $.inArray('*.' + merchant.get("pattern"), merchant.get("domains_disabled"))
                    ) {
                        return true;
                    }
                } else {
                    return (merchant.get('settings').partnerList && domain.lastIndexOf(merchant.get("pattern")) == 0 && domain.length == merchant.get("pattern").length) ||
                        (domain.lastIndexOf(merchant.get("pattern")) > 0 && domain.charAt(domain.lastIndexOf(merchant.get("pattern")) - 1) == ".");
                }
            });
        }
        return merchants;
    },

    selectById: function (id) {
        var self = this;
        var merchant = self.findWhere({"id": +id});
        if (merchant) {
            if (merchant.get('settings').partnerList || merchant.get('settings').partnerListNoActive
                || merchant.get('settings').browserAction || merchant.get('settings').injectNotification
                || merchant.get('settings').injectSuccessNotification || merchant.get('settings').injectRewriteNotification
                || merchant.get('settings').iconClickPage) {
                return merchant;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    },

    getInfoForOffer: function (id) {
        var self = this;
        var merchant = self.findWhere({"id": +id});
        if (merchant && !merchant.get('settings').partnerList) {
            return {
                mId: merchant.get("id"),
                logo: merchant.get("logo"),
                cashback: merchant.get("userCashback") ? merchant.get("userCashback") : merchant.get("cashback"),
                cashbackFloated: merchant.get("cashbackFloated"),
                isFavorite: merchant.get("isFavorite"),
                url: merchant.get("url"),
                activateUrl: merchant.get("activateUrl")
            }
        }
        return null;
    },

    checkOOfferMerchant: function (offers) {
        var self = this;
        var offersList = [];
        offers.forEach(function (item) {
            if (item.attributes.shopId) {
                var merchant = self.findWhere({"id": +item.attributes.shopId});
                if (merchant && merchant.get("settings").partnerList) {
                    offersList.push(item);
                }
            }
        });
        return offersList.length > 0 ? offersList : [];
    },

    selectFavorites: function () {
        var self = this;
        var favoritesList = [];
        self.where({"isFavorite": true}).forEach(function (item) {
            if (item.get('settings').partnerList || item.get('settings').partnerListNoActive) {
                favoritesList.push(item);
            }
        });
        return favoritesList.length > 0 ? self.toJSON(favoritesList) : [];
    },

    selectRecommended: function () {
        var self = this;
        var recommendedList = [];
        self.where({"isRecommended": true}).forEach(function (item) {
            if (item.get('settings').partnerList || item.get('settings').partnerListNoActive) {
                recommendedList.push(item);
            }
        });
        return recommendedList.length > 0 ? self.toJSON(recommendedList) : [];
    },

    selectViewed: function () {
        var self = this;
        var viewedList = [];
        self.where({"isViewed": true}).forEach(function (item) {
            if (item.get('settings').partnerList || item.get('settings').partnerListNoActive) {
                viewedList.push(item);
            }
        });
        return viewedList.length > 0 ? self.toJSON(viewedList) : [];
    },

    select50First: function (exceptIds) {
        var models = _.filter(this.models, function (merchant) {
            return merchant.get("settings").partnerList && !_.contains(exceptIds, merchant.id);
        });
        if (models && models.length) {
            if (models.length > 50) models.length = 50;
            return this.toJSON(models);
        } else {
            return null;
        }
    },

    selectRandom50: function (exceptIds) {
        var models = _.filter(this.models, function (merchant) {
            return merchant.get("settings").partnerList && !_.contains(exceptIds, merchant.id);
        });
        if (models && models.length) {
            models = _.shuffle(models);
            if (models.length > 50) models.length = 50;
            return this.toJSON(models);
        } else {
            return null;
        }
    },

    selectByAlias: function (value) {
        var self = this;
        if (_.isString(value)) {
            var models = self.filter(function (merchant) {
                var equals = false;
                (merchant.get("settings").partnerList || merchant.get("settings").partnerListNoActive) && merchant.get("aliases") && merchant.get("aliases").length > 0 &&
                _.each(merchant.get("aliases"), function (alias) {
                    if (alias.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
                        equals = true;
                    }
                });
                return equals;
            });
            if (models && models.length)
                return self.toJSON(models);
            else
                return null;
        } else
            return null;
    },

    selectByAliasNew: function (value) {
        var self = this;
        if (_.isString(value)) {
            var models = self.filter(function (merchant) {
                var equals = false;
                (merchant.get("settings").partnerList || merchant.get("settings").partnerListNoActive || merchant.get("settings").globalDisabled) && merchant.get("aliases") && merchant.get("aliases").length > 0 &&
                _.each(merchant.get("aliases"), function (alias) {
                    if (alias.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
                        equals = true;
                    }
                });
                return equals;
            });
            if (models && models.length) {
                models = self.toJSON(models);
                models = _.sortBy(models, function (merchant) {
                    var orderIndex = 100;
                    _.each(merchant.aliases, function (alias) {
                        var currentIndex = alias.toLowerCase().indexOf(value.toLowerCase());
                        if (orderIndex > currentIndex && currentIndex !== -1) orderIndex = currentIndex;
                    });
                    return orderIndex;
                });
                return models;
            }
            else
                return null;
        } else
            return null;
    }
});