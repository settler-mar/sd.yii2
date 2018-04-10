var NotificationPromo = BackboneContent.View.extend({
    id: "letyshops-notification-extend-activated-container",
    template: Handlebars.templates.notification_promo,

    initialize: function (options) {
        var self = this;
        self.options = options;
        self.events = {
            "click #letyshops-notification-close": "dismiss",
            "click #letyshops-notification-heart": "onFavoriteClick"
        };
        framework.extension.attachEvent(UPDATE_FAVORITE_STATUS_FROM_BG, function (firedData) {
            if (firedData.data && firedData.data.id) {
                var id = firedData.data.id;
                var isFavorite = firedData.data.isFavorite;
                var validNotification = $("i[store-id='" + id + "']");
                if (validNotification) {
                    var isFavoriteHere = validNotification.attr('favorite') === "true";
                    if (isFavorite === isFavoriteHere) {
                        validNotification.toggleClass("red-heart grey-heart");
                        validNotification.attr("favorite", isFavorite ? "false" : "true");
                        validNotification.text(isFavorite ? "favorite_border" : "favorite");
                    }
                }
            }
        });
    },

    dismiss: _.throttle(function () {
        var self = this;
        framework.extension.fireEvent(NOTIFICATION_DISMISS,
            {
                tabId: null,
                data: self.model.id
            },
            _.bind(function () {
                this.$el.fadeOut();
            }, self));
    }, 1000),

    delegateEvents: function () {
        return BackboneContent.View.prototype.delegateEvents.apply(this, arguments);
    },

    onFavoriteClick: function (e) {
        var self = this;
        var $clickedElement = $(e.currentTarget);
        var id = $clickedElement.attr("store-id");
        var isFavorite = $clickedElement.attr('favorite') === "true";
        $clickedElement.toggleClass("red-heart grey-heart");
        $clickedElement.attr("favorite", isFavorite ? "false" : "true");
        $clickedElement.text(isFavorite ? "favorite_border" : "favorite");
        framework.extension.fireEvent(UPDATE_FAVORITE_STATUS_FROM_NOTIFICATION,
            {
                tabId: null,
                data: {
                    id: id,
                    isFavorite: isFavorite
                }
            }
        );
    },

    render: function (merchant) {
        var self = this;
        if (!$.contains(window.document, this.el)) {
            this.$el.empty().append($(this.template(merchant || _.extend(_.clone(self.model), self.options.promo))));

            var styles;
            if($('#letyshops-notify-price-container').length){
                styles = {
                    "position": "fixed",
                    "margin-top": "10px",
                    "right": "10px",
                    "border": "0",
                    "padding": "0",
                    "display": "none"
                }
            } else {
                styles = {
                    "position": "fixed",
                    "z-index": "2147483647",
                    "top": "10px",
                    "right": "10px",
                    "border": "0",
                    "padding": "0",
                    "display": "none"
                }
            }

            this.$el.appendTo($('#letyshops-notify-price-container').length ? $('#letyshops-notify-price-container') : window.document.body).css(styles);

            self.$el.fadeIn(1000, function () {
                _.defer(function () {
                    self.delegateEvents();
                });
            });

            _.delay(function ($el) {
                framework.extension.fireEvent(NOTIFICATION_DISMISS, {
                        tabId: null,
                        data: self.model.id
                    }
                );
                self.$el.fadeOut();
            }, 5000, this.$el);


            return this;
        }
    }
});