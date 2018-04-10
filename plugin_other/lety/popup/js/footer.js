var Footer = Backbone.View.extend({
    el: "#letyshops-footer-container",
    template: Handlebars.templates.footer,
    initialize: function () {
        var self = this;
        this.app = framework.extension.getBackgroundPage().application;

        this.events = {
            "click #letyshops-footer-all-stores": "toAllStores",
            "click #letyshops-footer-help": "onHelp",
            "click #letyshops-footer-settings": "toSettings"
        };
    },

    delegateEvents: function () {
        return Backbone.View.prototype.delegateEvents.apply(this, arguments);
    },

    toAllStores: function () {
        if ($('#letyshops-tab-offers').attr('class').indexOf('unselected-tab') > -1) {
            this.app.sendGoogleAnalyticsEvent('Extension', 'Click on All Shops');
            framework.browser.navigate({
                    tabId: framework.browser.NEWTAB,
                    url: API.allStoresPage()
                }
            );
        } else {
            this.app.sendGoogleAnalyticsEvent('Extension', 'Click on All Shops With Sales');
            framework.browser.navigate({
                    tabId: framework.browser.NEWTAB,
                    url: API.hotDealsPage()
                }
            );
        }
        window.close();
    },

    onHelp: function () {
        this.app.sendGoogleAnalyticsEvent('Extension', 'Click on Help');
        framework.browser.navigate({
                tabId: framework.browser.NEWTAB,
                url: API.helpPage()
            }
        );
        window.close();
    },

    toSettings: function () {
        // TODO in next release
    },

    render: function (data) {
        var self = this;
        if (data) {
            self.$el.empty().html(self.template(data));
        } else {
            self.$el.empty().html(self.template({stateSpecBtn: FOOTER_ALL_STORES}));
        }
        return self;
    }

});