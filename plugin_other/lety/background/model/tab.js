var Tab = Backbone.Model.extend({

    defaults: {
        id: "",
        domain: "",
        url: "",
        history: [],
        interstitialPageId: "",
        animation: false
    },

    initialize: function () {
        var self = this;
        this.reset = _.debounce(this.immediateReset, 20 * 1000);
    },

    immediateReset: function () {
        var self = this;

        _.delay(function () {
            log("TABS.JS: immediateReset", self);
            self.unset('state');
            self.unset('interstitialPageId');
            self.unset('activatingMerchantId');
        }, 2000);
    }
});