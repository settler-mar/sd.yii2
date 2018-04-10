var NotificationTab = Backbone.View.extend({
    el: "#letyshops-content-container-notification",
    template: Handlebars.templates.notification_tab,

    initialize: function (options) {
        var self = this;
        self.options = options;
    },

    delegateEvents: function () {
        return Backbone.View.prototype.delegateEvents.apply(this, arguments);
    },

    changeColorAndStatusReading: function (notifications) {
        var self = this;
        var unreadNotifications = notifications && notifications.length && _.filter(notifications, function (notification) {
                return notification.status == "1"
            });
        if (unreadNotifications && unreadNotifications.length) {
            var multiplier = 1;
            _.each(unreadNotifications, function (notify) {
                setTimeout(function () {
                    self.$el.find("." + notify.id).find(".letyshops-notification-markup").removeClass("letyshops-notification-markup-special");
                    self.trigger(POPUP_PUSH_REVIEWED_NOTIFY, notify.id);
                }, 1000);
                multiplier++;
            })
        }
    },

    render: function (notifications) {
        var self = this;
        var settings = {
            autoReinitialise: true,
            showArrows: false,
            horizontalGutter: 2,
            verticalGutter: 10,
            mouseWheelSpeed: 5,
            hideFocus: true
        };
        self.$el.empty().html(this.template(notifications)).find(".scroll-pane").jScrollPane(settings);
        self.changeColorAndStatusReading(notifications);
        return this;
    }
});