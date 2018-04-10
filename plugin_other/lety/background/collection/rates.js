var Rates = Backbone.Collection.extend({
    model: Rate,
    flag: "codes",
    updateFlag: "codesLastUpdated",
    url: API.userCodes(),

    initialize: function () {
        var self = this;
        self.on("reset", function () {
            self.save();
        });
        self.fetch();
    },

    save: function () {
        Storage.set(this.flag, this.toJSON());
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

    fetch: function (force) {
        var self = this,
            _callee = arguments.callee;

        Storage.get(this.updateFlag, function (timeLastUpdated) {
                if (!timeLastUpdated || _.now() - timeLastUpdated > UPDATE_INTERVAL_CODES || force) {
                    Backbone.Collection.prototype.fetch.call(self, {reset: true}).always(function () {
                        Storage.set(self.updateFlag, _.now());
                    });
                } else {
                    Storage.get(self.flag, function (codes) {
                        if (_.isObject(codes)) {
                            self.set(codes);
                        } else if (!codes) {
                            Storage.set(self.updateFlag, 0);
                            _callee.apply(self, arguments);
                        }
                    });
                }
                if (!!self.fetchTimeout) {
                    window.clearTimeout(self.fetchTimeout);
                    self.fetchTimeout = null;
                }
                self.fetchTimeout = window.setTimeout(function () {
                    _callee.apply(self, arguments);
                }, UPDATE_INTERVAL_CODES);
            }
        );
    },

    parse: function (response) {
        if (response != null) {
            return response;
        } else {
            return null;
        }
    }
});