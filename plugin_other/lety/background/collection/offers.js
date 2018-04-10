var Offers = Backbone.Collection.extend({
    model: Offer,
    flag: "offers",
    updateFlag: "offersLastUpdated",
    url: API.offers,

    initialize: function () {
        var self = this;
        self.on("reset", function () {
            self.save();
        });
        self.fetch();
    },

    toJSON: function (models) {
        if (models) {
            return _.map(models, function (model) {
                    return model.toJSON();
                }
            );
        } else {
            if (this.models) {
                return _.map(this.models, function (model) {
                        return model.toJSON();
                    }
                );
            } else {
                return null;
            }
        }
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

        Storage.get(this.updateFlag, function (timeLastUpdated) {
                if (!timeLastUpdated || _.now() - timeLastUpdated > UPDATE_INTERVAL_OFFERS) {
                    var _success = _options.success;
                    var _error = _options.error;
                    _options.success = function () {
                        Storage.set(self.updateFlag, _.now());
                        _success && _success.apply(this, arguments);
                    };
                    _options.reset = true;
                    Backbone.Collection.prototype.fetch.apply(self, _arguments).always(function () {
                        _options.success = _success;
                        _options.error = _error;
                    });
                } else {
                    Storage.get(self.flag, function (offers) {
                        if (offers && _.isString(offers)) {
                            offers = JSON.parse(offers);
                        }
                        if (_.isObject(offers)) {
                            self.set(offers);
                        } else if (!offers) {
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
                }, UPDATE_INTERVAL_OFFERS);
            }
        );
    },

    parse: function (response) {
        return _.map(response, function (offer) {
            return _.object(
                [
                    "id",
                    "title",
                    "image",
                    "code",
                    "isTop",
                    "shopId",
                    "injDesc",
                    "shortDesc",
                    "activateOfferUrl"
                ],
                [
                    offer.id,
                    offer.a,
                    offer.b,
                    offer.h,
                    offer.c,
                    offer.d,
                    offer.g,
                    offer.f,
                    offer.e
                ]
            );
        });
    },

    selectById: function (id) {
        return this.findWhere({"id": id});
    },

    getTopOffer: function () {
        return this.findWhere({"isTop": true});
    },

    getNoTopOffers: function (id) {
        return this.filter(function (offer) {
            return offer.get("id") !== id;
        })
    }
});