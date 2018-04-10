var NotificationSearch = BackboneContent.View.extend({
    id: "letyshops-notification-container-search",
    template: Handlebars.templates.notification_search,

    initialize: function (options) {
        var self = this;
        self.options = options;
        self.events = {
            "click #letyshops-notification-activate": "activate",
            "click #letyshops-notification-search-close": "close"
        };
    },

    delegateEvents: function () {
        return BackboneContent.View.prototype.delegateEvents.apply(this, arguments);
    },


    close: function (e) {
        $(this.el.children).removeClass('letyshops-notification-search-tooltip--active');
        $($(this.$el.find('i')).parents()[1]).attr('style', 'display: none');
        var self = this;
        self.options.show = false;
    },

    render: function () {
        if (!$.contains(window.document, this.el)) {

            var self = this;
            this.$el.empty().append($(this.template({
                dataSearch: {
                    merchant: self.model,
                    show: self.options.show
                }
            })));

            $(self.options.element).prepend(this.$el);

            if (!!self.options.show) {
                $(this.$el[0].firstElementChild).addClass('letyshops-notification-search-tooltip--active');
            }

            this.$el.fadeIn(100, function () {
                _.defer(function () {
                    self.delegateEvents();
                });
            });
            return this;
        }
    }
});