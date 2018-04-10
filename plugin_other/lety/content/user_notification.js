var UserNotification = BackboneContent.View.extend({
    id: "letyshops-notify-container",
    template: Handlebars.templates.user_notification,

    initialize: function (options) {
        var self = this;
        self.options = options;
        self.events = {
            "click #letyshops-notify-close": "dismiss"
        };
    },

    delegateEvents: function () {
        return BackboneContent.View.prototype.delegateEvents.apply(this, arguments);
    },

    dismiss: _.throttle(function () {
        var self = this;
        framework.extension.fireEvent(USER_NOTIFICATION_DISMISS,
            {
                tabId: null,
                data: self.model.id
            },
            _.bind(function () {
                this.$el.fadeOut();
            }, self));
    }, 1000),

    render: function (index, notification) {
        var self = this;
        self.model = notification;
        if (!$.contains(window.document, self.el)) {
            self.$el.empty().append($(self.template(notification)));

            var bottom = 10 + (index * 85);

            self.$el.appendTo(window.document.body).css({
                "position": "fixed",
                "z-index": "2147483647",
                "bottom": bottom + "px",
                "right": "10px",
                "border": "0",
                "padding": "0",
                "margin": "0",
                "display": "none"
            });

            self.$el.fadeIn(750, function () {
                _.defer(function () {
                    self.delegateEvents();
                });
            });
            _.delay(function ($el) {
                $el.fadeOut();
            }, 5000, self.$el);

            return self;
        }
    }
});