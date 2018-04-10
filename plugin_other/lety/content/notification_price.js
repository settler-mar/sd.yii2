var NotificationPrice = BackboneContent.View.extend({
    id: "letyshops-notify-container",
    template: Handlebars.templates.notification_price,

    initialize: function (options) {
        var self = this;
        self.options = options;
        self.events = {
            "click #letyshops-show-area": "openFullForm",
            "click #letyshops-link-popup-seller-analysis": "letyshopsLinkPopupSellerAnalysis",
            "click #letyshops-link-popup-price-dynamics": "letyshopsLinkPopupPriceDynamics",
            "click .letyshops-popup-close": "letyshopsPopupClose",
            "click .letyshops-btn-favourites": "letyshopsBtnFavourites",
            "click #letyshops-header-settings": 'toSettings',
            "click #letyshops-notification-button-price": 'activateCashbackPrice'
        };

        $(window).bind('scroll', function (ev) {
            self.scrollHideForm(ev);
        });

        $('body').bind('click', function (e) {
            self.letyshopsPopupCloseBody(e)
        });
    },

    activateCashbackPrice: function (e) {
        var self = this;
        framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS,
            {
                tabId: null,
                data: {
                    type: 'event',
                    category: 'Monitor',
                    action: 'Click activate cashback popup',
                    label: self.model.merchant.title
                }
            }
        );
    },

    toSettings: function () {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else if (navigator.userAgent.indexOf(BROWSER_NAME_FF) !== -1) {
            framework.browser.navigate({
                url: chrome.runtime.getURL('options.html'),
                tabId: framework.browser.NEWTAB
            });
        } else {
            framework.browser.navigate({
                url: 'chrome://extensions/?options=' + chrome.runtime.id,
                tabId: framework.browser.NEWTAB
            });
        }

        framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS,
            {
                tabId: null,
                data: {
                    type: 'event',
                    category: 'Monitor',
                    action: 'Click on Setting',
                    label: 'Setting'
                }
            }
        );
    },

    delegateEvents: function () {
        return BackboneContent.View.prototype.delegateEvents.apply(this, arguments);
    },

    scrollHideForm: function () {
        if ($('#short-letyshops-item-logo').hasClass('letyshops-item-logo-active') && !$('#full-letyshops-item-logo').hasClass('self-open')) {
            $('#letyshops-notify-price-container').toggleClass('letyshops-open');
            $('#letyshops-notify-price-container').removeClass('letyshops-open-popup');
            $('#full-letyshops-item-logo').toggleClass('letyshops-item-logo-active');
            $('#short-letyshops-item-logo').toggleClass('letyshops-item-logo-active');
        }
    },

    openFullForm: function (e) {
        var self = this;

        $('#full-letyshops-item-logo').addClass('self-open');
        $('#letyshops-notify-price-container').toggleClass('letyshops-open');
        $('#letyshops-notify-price-container').removeClass('letyshops-open-popup');
        $('#full-letyshops-item-logo').toggleClass('letyshops-item-logo-active');
        $('#short-letyshops-item-logo').toggleClass('letyshops-item-logo-active');

        if ($('#letyshops-notify-price-container').hasClass('letyshops-open')) {
            framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS, {
                tabId: null,
                data: {
                    type: 'pageview',
                    page: gaPrefixMonitor + 'small-view/' + self.model.merchant.title + '/'
                }
            });
        } else {
            framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS, {
                tabId: null,
                data: {
                    type: 'pageview',
                    page: gaPrefixMonitor + 'large-view/' + self.model.merchant.title + '/'
                }
            });
        }


    },

    letyshopsLinkPopupSellerAnalysis: function () {
        var self = this;

        if ($('#letyshops-progress').length && !$('#letyshops-progress').hasClass('letyshops-circliful')) {
            $('#letyshops-progress').circliful();
        }

        if ($('#full-letyshops-item-logo').hasClass('letyshops-item-logo-active')) {
            $('#letyshops-popup-price-dynamics').removeClass('letyshops-popup-open');
            $('#letyshops-link-popup-price-dynamics').removeClass('active');


            $('#full-letyshops-item-logo').removeClass('letyshops-item-logo-active self-open');
            $('#full-letyshops-item-logo').addClass('self-open');
            $('#short-letyshops-item-logo').addClass('letyshops-item-logo-active');


            $('#letyshops-popup-seller-analysis').addClass('letyshops-popup-open');
            $('#letyshops-link-popup-seller-analysis').addClass('active');

            $('#letyshops-notify-price-container').addClass('letyshops-open letyshops-open-popup');

        } else {
            $('#letyshops-popup-price-dynamics').removeClass('letyshops-popup-open');
            $('#letyshops-link-popup-price-dynamics').removeClass('active');

            $('#letyshops-popup-seller-analysis').toggleClass('letyshops-popup-open');
            $('#letyshops-link-popup-seller-analysis').toggleClass('active');

            $('#letyshops-notify-price-container').toggleClass('letyshops-open-popup');
        }

        framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS, {
            tabId: null,
            data: {
                type: 'pageview',
                page: gaPrefixMonitor + 'view/seller/' + self.model.merchant.title + '/'
            }
        });
    },

    letyshopsLinkPopupPriceDynamics: function () {
        var self = this;

        if ($('#full-letyshops-item-logo').hasClass('letyshops-item-logo-active')) {
            $('#letyshops-popup-seller-analysis').removeClass('letyshops-popup-open');
            $('#letyshops-link-popup-seller-analysis').removeClass('active');

            $('#full-letyshops-item-logo').removeClass('letyshops-item-logo-active');
            $('#full-letyshops-item-logo').addClass('self-open');
            $('#short-letyshops-item-logo').addClass('letyshops-item-logo-active');


            $('#letyshops-popup-price-dynamics').addClass('letyshops-popup-open');
            $('#letyshops-link-popup-price-dynamics').addClass('active');

            $('#letyshops-notify-price-container').addClass('letyshops-open letyshops-open-popup');
        } else {
            $('#letyshops-popup-seller-analysis').removeClass('letyshops-popup-open');
            $('#letyshops-link-popup-seller-analysis').removeClass('active');

            $('#letyshops-popup-price-dynamics').toggleClass('letyshops-popup-open');
            $('#letyshops-link-popup-price-dynamics').toggleClass('active');

            $('#letyshops-notify-price-container').toggleClass('letyshops-open-popup');
        }


        if ($('#letyshops-popup-price-dynamics').hasClass('letyshops-popup-open')) {


            try {
                try {
                    var damainPrice = Utils.getDomainPrice(location.host);
                    var id = Utils.getProductId(damainPrice, location.pathname);
                } catch (e) {
                }

                if (id && id.length > 0) {

                    var dataPrice = Utils.getPrice(damainPrice);

                    Storage.get(id + '_' + dataPrice.currencyDisplay + '_chartTimeLastUpdated', function (timeLastUpdated) {
                        if (!timeLastUpdated || _.now() - timeLastUpdated > UPDATE_INTERVAL_INFO_HISTORY_PRICE) {
                            framework.extension.fireEvent(GET_PRICE_HISTORY, {
                                    tabId: null,
                                    data: {itemInfo: self.model.targetInfo.itemInfo}
                                },
                                function (data) {
                                    if (data) {
                                        Storage.set(id + '_' + dataPrice.currencyDisplay + '_chartData', data);
                                        Storage.set(id + '_' + dataPrice.currencyDisplay + '_chartTimeLastUpdated', _.now());
                                        self.showChart(data);
                                    }
                                });
                        } else {
                            Storage.get(id + '_' + dataPrice.currencyDisplay + '_chartData', function (data) {
                                if (data) {
                                    self.showChart(data);
                                }
                            })
                        }
                    });
                }


            } catch (e) {
                framework.extension.fireEvent(GET_PRICE_HISTORY, {
                        tabId: null,
                        data: {itemInfo: self.model.targetInfo.itemInfo}
                    },
                    function (data) {
                        if (data) {
                            self.showChart(data);
                        }
                    });
            }
        }

        framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS, {
            tabId: null,
            data: {
                type: 'pageview',
                page: gaPrefixMonitor + 'view/price/' + self.model.merchant.title + '/'
            }
        });
    },

    showChart: function (data) {
        var self = this;

        /**
         *
         * @param previous
         * @param current
         * @returns {Array}
         */
        function getArrayFromPeriodDate(previous, current) {
            var arr = [];

            //fix temp
            previous = new Date(previous);
            previous.setDate(previous.getDate() - 3);

            current = new Date(current);
            current.setDate(current.getDate() + 3);


            arr.push(new Date(previous).getDate() + ' ' + month[new Date(previous).getMonth()] + ' ' + new Date(previous).getFullYear());
            while (previous < current) {
                previous = new Date(previous);
                previous.setDate(previous.getDate() + 1);
                arr.push(new Date(previous).getDate() + ' ' + month[new Date(previous).getMonth()] + ' ' + new Date(previous).getFullYear());
            }
            return arr;
        }

        if ($('#myChart').length === 0) {
            $('#letyshops-schedule-svg').remove();
            var canvas = '<canvas id="myChart" width="306" height="146"></canvas>';
            $('#letyshops-schedule').append(canvas);

            var currentDate = new Date().getTime();
            var previousDate = (new Date(currentDate - (30 * 86400000))).getTime(); //  30 дней назад

            var month = ['янв', 'фев', 'мрт', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'нбр', 'дек'];
            var monthFull = ['Январь', 'Февраль', 'Март', 'Апрель', ' Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

            var arrDatePriceFullPeriod = getArrayFromPeriodDate(previousDate, currentDate);

            var arrMinPrice = [];
            var signPrice = data.list[0].currency.sign;
            var dataPriceDate = [];

            _.each(data.list.reverse(), function (item) {

                if (item.timestamp * 1000 < previousDate) {
                    var startDate = new Date(previousDate);
                    startDate.setDate(startDate.getDate() - 3);

                    if (dataPriceDate.length > 0) {
                        dataPriceDate[0].x = startDate.getDate() + ' ' + month[startDate.getMonth()] + ' ' + startDate.getFullYear();
                        dataPriceDate[0].y = item.min;
                        dataPriceDate[0].time = item.timestamp * 1000;
                    } else {
                        dataPriceDate.push({
                            x: startDate.getDate() + ' ' + month[startDate.getMonth()] + ' ' + startDate.getFullYear(),
                            y: item.min,
                            time: item.timestamp * 1000
                        });
                    }
                }

                if (item.timestamp * 1000 > previousDate && item.timestamp * 1000 < currentDate) {
                    var date = new Date(item.timestamp * 1000);
                    arrMinPrice.push(item.min);
                    dataPriceDate.push({
                        x: date.getDate() + ' ' + month[date.getMonth()] + ' ' + date.getFullYear(),
                        y: item.min,
                        time: item.timestamp * 1000
                    });
                }
            });

            currentDate = new Date(currentDate);
            previousDate = new Date(previousDate);

            var minPrice = Math.min.apply(Math, arrMinPrice);
            var maxPrice = Math.max.apply(Math, arrMinPrice);

            if (dataPriceDate.length > 1) {
                if (signPrice === '₽') {
                    $('.letyshops-max').text(maxPrice.toFixed(2).replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1 ") + ' руб.');
                    $('.letyshops-min').text(minPrice.toFixed(2).replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1 ") + ' руб.');
                } else {
                    $('.letyshops-max').text(signPrice + '' + maxPrice.toFixed(2).replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1 "));
                    $('.letyshops-min').text(signPrice + '' + minPrice.toFixed(2).replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1 "));
                }
            }

            var myChart = new Chart($('#myChart'), {
                type: 'line',
                data: {
                    labels: arrDatePriceFullPeriod,
                    datasets: [
                        {
                            data: dataPriceDate,
                            fill: false,
                            backgroundColor: Color('#00b0ff').rgbString(),
                            borderColor: Color('#00b0ff').alpha(0.2).rgbString(),
                            lineTension: 0.1,
                            cubicInterpolationMode: 'monotone'
                        }]
                },
                options: {
                    legend: {
                        display: false
                    },
                    tooltips: {
                        mode: 'nearest',
                        intersect: false,
                        displayColors: false,
                        callbacks: {
                            title: function (tooltipItem) {
                                if (signPrice === '₽') {
                                    return tooltipItem[0].yLabel.toFixed(2).replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1 ") + ' руб.';
                                }
                                return signPrice + '' + tooltipItem[0].yLabel.toFixed(2).replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1 ")
                            },
                            label: function (tooltipItem, dataPriceDate) {
                                var value = dataPriceDate.datasets[0].data[tooltipItem.index];
                                var date = new Date(value.time);

                                framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS,
                                    {
                                        tabId: null,
                                        data: {
                                            type: 'event',
                                            category: 'Monitor',
                                            action: 'View Price Point',
                                            label: 'View Price Point'
                                        }
                                    }
                                );

                                return date.getDate() + ' ' + month[date.getMonth()]
                            }
                        }
                    },
                    scales:
                        {
                            xAxes: [{
                                display: false,
                                ticks: {
                                    gridLines: {
                                        offsetGridLines: true
                                    }
                                }
                            }],
                            yAxes: [{
                                gridLines: {
                                    borderDash: [5, 5],
                                    offsetGridLines: false
                                },
                                ticks: {
                                    min: 0,
                                    stepSize: Math.ceil(Math.ceil(maxPrice + (maxPrice * 0.1)) / 4)
                                }
                            }]
                        }
                }
            });

            var period = '<span class="letyshops-interval-down"></span>';
            $('#letyshops-schedule').append(period);
            $('.letyshops-interval-down').text('За последние 30 дней');

            if ($('#j-end-btn').length > 0 && $('.sold-out-icon').length > 0) {
                var oneItem = '<div id="letyshops-url-item-one" class="letyshops-item-one"> ' +
                    '<div class="letyshops-item-one-text">Товар по акционой цене распродан</div>' +
                    '<a href="' + self.model.targetInfo.itemInfo.url + '" target="_blank" ' +
                    'class="letyshops-url-item-one">Перейти к товару с актуальной ценой</a>' +
                    '</div>';
                $('.letyshops-price-dynamics').prepend(oneItem);
            }
        }
    },

    letyshopsPopupClose: function (e) {
        $(e.currentTarget.parentNode).removeClass('letyshops-popup-open');
        $('.letyshops-saller-info').removeClass('active');

        if (e.currentTarget.parentNode.id === 'letyshops-popup-seller-analysis') {
            framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS,
                {
                    tabId: null,
                    data: {
                        type: 'event',
                        category: 'Monitor',
                        action: 'Close Seller',
                        label: 'Close Seller'
                    }
                }
            );
        }
        if (e.currentTarget.parentNode.id === 'letyshops-popup-price-dynamics') {
            framework.extension.fireEvent(SEND_GOOGLE_ANALYTICS,
                {
                    tabId: null,
                    data: {
                        type: 'event',
                        category: 'Monitor',
                        action: 'Close Price',
                        label: 'Close Price'
                    }
                }
            );
        }
    },

    letyshopsPopupCloseBody: function (e) {
        if ($('.letyshops-pm').has(e.target).length === 0) {
            if ($('.letyshops-popup').hasClass('letyshops-popup-open')) {
                $('.letyshops-popup').removeClass('letyshops-popup-open');
                $('.letyshops-saller-info').removeClass('active');
            }
        }
    },

    letyshopsBtnFavourites: function (e) {
        e.preventDefault();
        if (!$('.letyshops-btn-favourites').hasClass('active')) {
            $('.letyshops-btn-favourites').addClass('active');
            $('.letyshops-i-favourites').addClass('active');
            $('.letyshops-btn-favourites').find('span').text('Смотреть в списке желаний');
            $('.letyshops-btn-favourites').attr({target: "_blank", href: "https://letyshops.ru/user"});

            framework.extension.fireEvent(SEND_ITEM_TO_WISH_LIST, {
                tabId: null,
                data: {itemInfo: this.model.targetInfo.itemInfo}
            });
        }
    },

    dismiss: _.throttle(function () {
        var self = this;
        framework.extension.fireEvent(USER_NOTIFICATION_DISMISS,
            {
                tabId: null,
                data: self.model.targetInfo.id
            },
            _.bind(function () {
                this.$el.fadeOut();
            }, self));
    }, 1000),

    render: function (model) {
        if (!$.contains(window.document, this.el)) {
            var self = this;

            $('body').css({
                "padding-top": "85px"
            });

            this.$el.empty().append($(this.template(model || self.model)));

            this.$el.appendTo(window.document.body).css({
                "position": "fixed",
                "z-index": "2147483647",
                "top": "10px",
                "right": "10px",
                "border": "0",
                "padding": "0",
                "margin": "0"
            });

            this.$el.fadeIn(250, function () {
                _.defer(function () {
                    self.delegateEvents();
                });
            });
            return this;
        }
    }
});
