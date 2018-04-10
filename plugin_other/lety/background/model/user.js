var User = Backbone.Model.extend({
        urlRoot: API.user,
        updateFlag: "userLastAuthorization",
        timerUpdate: null,

        defaults: {
            "token": null,
            "name": "",
            "balance": "",
            "balanceInfo": [],
            "image": "",
            "partnerUrl": "",
            "partnerPercent": "",
            "rates": new Rates(),
            "notifications": [],
            "favorites": [],
            "recommended": [],
            "viewed": []
        },

        /**
         * create Object
         */
        initialize: function () {
            var self = this;
            self.rates = self.get("rates");
            framework.extension.attachEvent(ON_USER_LOGIN, function (event) {
                self.logIn(event.data.cookie);
            });
            framework.extension.attachEvent(ON_USER_LOGOUT, function (event) {
                self.logOut();
            });
            Storage.get(LOGIN_TOKEN, function (cookie) {
                if (cookie && cookie.length && typeof cookie === "string") {
                    self.logIn(cookie);
                }
            });
            Storage.set(OFFLINE_LIKES, []);
        },

        /**
         * logIn user
         * @param cookie
         */
        logIn: function (cookie) {
            var self = this;

            function fetchNotifyIntoLogin() {
                self.fetchNotifications(false, (value) => {
                    self.set("notifications", value);
                    if (_.findWhere(value, {status: "1"})) {
                        Button.setBadge(_.where(value, {status: "1"}).length);
                        framework.extension.fireEvent(SET_NOTIFICATIONS_POPUP, {tabId: null});
                        Storage.set(POPUP_FIRST_OPENING_TOKEN, "Wow!");
                    } else {
                        Button.clearCounter();
                    }
                });
            }

            if (!!cookie && cookie !== self.get("token")) {
                Storage.get(POPUP_FIRST_OPENING_TOKEN, function (token) {
                    if (!token)
                        Button.setBadge("");
                });
                self.userUpdated = false;
                self.notifUpdated = false;
                self.favUpdated = false;
                self.recomUpdated = false;
                self.viewUpdated = false;
                if (self.rates.codesUpdated) {
                    self.rates.codesUpdated = false;
                }

                clearInterval(self.mainInterval);

                self.fetch({
                    success: function (model, data) {
                        if (data.name) {
                            self.response = data;
                            self.set("token", cookie);
                            Storage.set(LOGIN_TOKEN, cookie);

                        } else {
                            self.set("token", null);
                            Storage.set(LOGIN_TOKEN, null);
                            self.logOut();
                        }
                    }
                });

                clearInterval(self.mainInterval);
                fetchNotifyIntoLogin();

                self.mainInterval = setInterval(_.bind(function () {
                    fetchNotifyIntoLogin();
                }, self), 5 * 60 * 1000);


                if (!!cookie && cookie !== self.get("token")) {
                    self.set("token", cookie);
                    Storage.set(LOGIN_TOKEN, cookie);
                }
            }

            Storage.get(OFFLINE_LIKES, function (data) {
                _.each(data, function (id) {
                    self.pushLiked(id)
                }, self);
            });

        },

        /**
         * logOut user
         */
        logOut: function () {
            var self = this;
            if (self.get("token") !== null) {

                self.set("token", null);
                Storage.set(LOGIN_TOKEN, null);

                self.userUpdated = false;
                self.notifUpdated = false;
                self.favUpdated = false;
                self.recomUpdated = false;
                self.viewUpdated = false;
                if (self.rates.codesUpdated) {
                    self.rates.codesUpdated = false;
                }

                clearInterval(self.mainInterval);

                _.each(self.attributes, function (attributeVal, attributeName) {
                    self.unset(attributeName);
                });
                if (!!self.timerUpdate) {
                    window.clearTimeout(self.timerUpdate);
                    self.timerUpdate = null;
                }
            }
        },

        /**
         * check login user
         */
        isLogin: function () {
            return this.get("token");
        },

        /**
         *FETCH COMMON USERS DATA
         */
        fetch: function () {
            if (!arguments[0]) {
                arguments[0] = {};
                arguments.length = 1;
            }
            var self = this,
                _arguments = arguments,
                _options = arguments[0],
                _callee = arguments.callee;

            var _success = _options.success;
            var _error = _options.error;
            if (!self.userUpdated || _.now() - self.userUpdated > UPDATE_INTERVAL_USER) {
                self.userUpdated = _.now();
                Backbone.Model.prototype.fetch.apply(self, _arguments);
            }
        },

        /**
         * fetch Notifications user
         * @param forceUpdate
         * @param callback
         * @param force
         */
        fetchNotifications: function (forceUpdate, callback, force) {
            var self = this;

            if (!!self.isLogin()) {
                return;
            }

            if (!self.notifUpdated || _.now() - self.notifUpdated > UPDATE_INTERVAL_USER_NOTIFICATION || force) {

                $.ajax({
                    url: API.notifications(),
                    type: "GET",
                    dataType: "json",
                    success: function (data) {
                        self.notifUpdated = _.now();

                        if (data && data.length > 0) {
                            let value = _.map(data, function (notif) {
                                return {
                                    "id": notif.id + "",
                                    "status": notif.status, // 1 - unread 2- read
                                    "markup": notif.markup,
                                    "showed": !notif.status === 1,
                                    "date": self.convertDate(notif.date),
                                    "url": notif.url
                                }
                            });
                            callback && callback(value);
                        } else {
                            callback && callback([]);
                        }
                    },
                    error: function (jqXHR) {
                        if ('403' === jqXHR.status || "Forbidden" === jqXHR.statusText) {
                            framework.extension.log("fetchNotify - Forbidden");
                        }
                    }
                });
            } else {

            }
            if (forceUpdate)
                _.delay(_.bind(self.fetchNotifications, self), UPDATE_INTERVAL_USER_NOTIFICATION, true, callback);
        },

        /**
         * push Reviewed Notifications by user
         * @param id
         */
        pushReviewedNotifications: function (id) {
            var self = this;
            var notifications = self.get("notifications");
            var certainNotify = _.findWhere(notifications, {id: id + ""});
            if (certainNotify) {
                $.ajax({
                        url: API.notifications(),
                        type: "POST",
                        data: {"notification_ids": [id]},
                        processData: true,
                        success: function (data) {
                            if (data && data.numUpdated > 0) {
                                framework.extension.log(data + ", " + data.numUpdated);
                                self.fetchNotifications(false, function (value) {
                                    self.set("notifications", value);
                                    if (_.findWhere(value, {status: "1"})) {
                                        Button.setBadge(_.where(value, {status: "1"}).length);
                                    } else {
                                        Button.clearCounter();
                                    }
                                }, true);
                            }
                        },
                        error: function (jqXHR) {
                            if (jqXHR.status == '400' || jqXHR.statusText == "Bad Request") {
                                framework.extension.log("pushNotify - Forbidden");
                            }
                        }
                    }
                );
            }
        },


        pushLiked: function (id) {
            var self = this;
            $.ajax({
                    url: API.favoriteMerchants(),
                    type: "POST",
                    data: {
                        "shops_liked": [
                            {
                                "shop_id": id + "",
                                "date": self.currentDate()
                            }
                        ]
                    },
                    processData: true,
                    success: function (data) {
                        if (data && (data.numInserted > 0 || data.numUpdated > 0)) {
                            if (data.numInserted > 0) {
                                framework.extension.log(data + ", " + data.numInserted + ", " + data.numUpdated);
                            }
                        }
                    },
                    error: function (jqXHR) {
                        if (jqXHR.status == '400' || jqXHR.statusText == "Bad Request") {
                            framework.extension.log("pushLiked - ​Missing parameters");
                        } else if (jqXHR.status == '403') {
                            framework.extension.log("pushLiked -  ​Access Denied");
                            Storage.get(OFFLINE_LIKES, function (data) {
                                data.push(id);
                                Storage.set(OFFLINE_LIKES, data);
                            });
                        }
                    }
                }
            );
        },

        pushDisliked: function (id) {
            var self = this;
            $.ajax({
                    url: API.deleteFavoriteMerchant(),
                    type: "POST",
                    data: {"shops_disliked": [id + ""]},
                    processData: true,
                    success: function (data) {
                        if (data && data.numUpdated > 0) {
                            if (data.numDeleted > 0) {
                                framework.extension.log(data + ", " + data.numDeleted);
                            }
                        }
                    },
                    error: function (jqXHR) {
                        if (jqXHR.status == '400' || jqXHR.statusText == "Bad Request") {
                            framework.extension.log("pushDisliked - ​Missing parameters");
                        } else if (jqXHR.status == '403') {
                            framework.extension.log("pushDisliked -  ​Access Denied");
                            Storage.get(OFFLINE_LIKES, function (data) {
                                var dislikeIndex = data.indexOf(id);
                                if (dislikeIndex > -1) {
                                    data.splice(dislikeIndex, 1);
                                    Storage.set(OFFLINE_LIKES, data);
                                }
                            });
                        }
                    }
                }
            );
        },

        rewriteViewed: function (id) {
            var self = this;
            var data = [];
            if ($.inArray(id, self.get("viewed")) === -1) {
                _.each(self.get("viewed"), function (result, key) {
                    if (key === 0) {
                        data[0] = id;
                        data[key + 1] = result;
                    } else if (self.get("viewed").length === key + 1) {
                        return;
                    } else {
                        data[key + 1] = result;
                    }
                });
                self.set("viewed", data);
                Storage.set('viewedMerchants', data);
            }
        },

        //TODO: Доделать отправку просмотреных магазинов
        pushViewedMerchant: function (id) {
            var self = this;
            //post
            // $.ajax({
            //         url: API.visitedMerchants(),
            //         type: "POST",
            //         data: {
            //             "shops_viewed": [
            //                 {
            //                     "shop_id": id + "",
            //                     "date": self.currentDate()
            //                 }
            //             ]
            //         },
            //         processData: true,
            //         success: function (data, textStatus) {
            //             if (data && data.numInserted > 0) {
            //                 framework.extension.log(data + ", " + data.numInserted);
            //                 _.delay(_.bind(self.fetchViewed, self), 10000, false, function (value) {
            //                     self.set("viewed", value);
            //                 });
            //             }
            //         },
            //         error: function (jqXHR, textStatus, errorThrown) {
            //             if (jqXHR.status == '400' || jqXHR.statusText == "Bad Request") {
            //                 framework.extension.log("pushViewedMerchant - Forbidden");
            //             }
            //         }
            //     }
            // );
        },

        /**
         * PARSE common request
         * @param rawResponse
         * @returns {*}
         */
        parse: function (rawResponse) {
            return _.object(
                [
                    "name",
                    "balance",
                    "balanceInfo",
                    "image",
                    "partnerUrl",
                    "partnerPercent",
                    "viewed",
                    "favorites",
                    "recommended"
                ],
                [
                    rawResponse.name,
                    rawResponse.balance,
                    !!rawResponse && rawResponse.balance_info
                    && Object.keys(rawResponse.balance_info).length > 0
                        ? _.object(
                        [
                            "totalBalance",
                            "currency",
                            "currencyFormatted"
                        ],
                        [
                            rawResponse.balance_info.total_balance,
                            rawResponse.balance_info.currency,
                            rawResponse.balance_info.currency_formatted,
                        ]) : [],
                    rawResponse.image,
                    rawResponse.partner_url,
                    rawResponse.partner_percent,
                    rawResponse.shops_viewed,
                    rawResponse.shops_liked,
                    rawResponse.shops_recomended
                ]
            )
        },

        /**
         * CONVERT timestamp to readable format
         * @param str
         * @returns {string}
         */
        convertDate: function (str) {
            if (framework.browser.name == 'Safari') {
                str = str.slice(0, -5);
            }
            var date = new Date(str);
            var allMonth = ["янв.", "фев.", "мар.", "апр.", "май", "июн.", "июл.", "авг.", "сен", "окт.", "ноя.", "дек."];
            var month = date.getMonth();
            return date.getDate() + " " + allMonth[month];
        },

        /**
         * current Date
         * @returns {string}
         */
        currentDate: function () {
            var date = new Date();
            return date.toISOString();
        }
    })
;