var Notification = BackboneContent.View.extend({
    id: "letyshops-notification-container",
    template: Handlebars.templates.notification,

    initialize: function (options) {
        var self = this;
        self.options = options;
        self.events = {
            "click #letyshops-notification-activate": "activate",
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
                        validNotification.text(isFavorite ? "favorite_border" : "favorite");         //point
                    }
                }
            }
        });
    },

    delegateEvents: function () {
        return BackboneContent.View.prototype.delegateEvents.apply(this, arguments);
    },

    activate: _.throttle(function () {
        var self = this;
        framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS,
            {
                tabId: null,
                data: {
                    type: 'event',
                    category: 'Extension',
                    action: ($('.letyshops-notification-warning').length === 0) ? 'Click activate cashback popup' : 'Click reactivate cashback popup',
                    label: self.model.title
                }
            }
        );
        framework.extension.fireEvent(NOTIFICATION_CASHBACK_ACTIVATE,
            {
                tabId: null,
                data: {
                    merchantId: self.model.id
                }
            },
            _.bind(function () {
                this.$el.fadeOut();
            }, self));
    }, 1000),

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
        if (!$.contains(window.document, this.el)) {

            var self = this;
            this.$el.empty().append($(this.template(merchant || self.model)));

            var styles;
            if ($('#letyshops-notify-price-container').length) {
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

            this.$el.fadeIn(1000, function () {
                _.defer(function () {
                    self.delegateEvents();
                });
            });
            return this;
        }
    },

    addWarning: function () {
        if ($('.letyshops-notification-warning').length === 0) {
            var template = Handlebars.templates['warning'];
            var oldText = $('#letyshops-notification-button').html(),
                oldHref = $('.letyshops-notification-shell-button > a').first().attr('href');
            $('.letyshops-notification-button-wrapper').prepend(template({link: "#"}));
            $('.letyshops-notification-shell-button > a').first().attr('href', oldHref.replace('notification_get_cashback', 'notification_re_activate_cashback'));
            $('.letyshops-notification-warning-message').click(function () {
                var win = window.open(API.reasonCashbackReactivate(), '_blank');
                win.focus();
            });
            $('#letyshops-notification-button').text(oldText.replace('Активировать кэшбэк', "Активировать кэшбэк снова"));
        }
    },

    addWarningHotProduct: function (hotProduct) {
        if ($('.letyshops-notification-warning').length === 0) {
            var template = Handlebars.templates['warning'];
            var oldText = $('#letyshops-notification-button').html(),
                oldHref = $('.letyshops-notification-shell-button > a').first().attr('href');
            $('.letyshops-notification-button-wrapper').prepend(template({link: "#"}));
            $('.letyshops-notification-shell-button > a').first().attr('href', oldHref.replace('notification_get_cashback', 'notification_re_activate_cashback'));
            $('.letyshops-notification-warning-message').click(function () {
                var win = window.open(API.reasonCashbackReactivate(), '_blank');
                win.focus();
            });
            $('#letyshops-notification-button').text(oldText.replace('Активировать кэшбэк', "Активировать кэшбэк для данного товара снова"));
            $($('#letyshops-notification-activate').find('a')[0]).attr('href', 'https://letyshops.com/view/13366481?hot_product_id='
                + hotProduct[Object.keys(hotProduct)].hot_product_id + '&rate=' + hotProduct[Object.keys(hotProduct)].rate);
            $('.letyshops-notification-merchant-rebate').html('<span>'+ hotProduct[Object.keys(hotProduct)].rate + '</span>%')
        }
    },

    addInfo: function () {
        if ($('.letyshops-notification-info').length === 0) {
            var template = Handlebars.templates['info'];
            $('.letyshops-notification-button-wrapper').append(template({info: 'Вы останетесь на текущей странице'}));
        }
    }
});