var Tabs = Backbone.Collection.extend({
    model: Tab,

    initialize: function () {
        var self = this;
        _.each(
            {
                'browser': _.object(
                    [
                        framework.browser.TABCLOSED,
                        framework.browser.BEFORENAVIGATE,
                        framework.browser.DOCUMENTCOMPLETE,
                        framework.browser.TABCHANGED
                    ],
                    [
                        _.bind(self.tabWasClosed, self),
                        _.bind(self.tabWasWalkingAlongChain, self),
                        self.tabWasChanged,
                        _.bind(self.tabWasSwitched, self)
                    ]
                ),

                'extension': _.object(
                    [
                        TAB_CHANGED
                    ],
                    [
                        self.tabWasChanged
                    ]
                )
            },

            function (event2callback, context) {
                _.each(event2callback, function (callback, event) {
                    framework[context].attachEvent(event, callback);
                });
            }
        );
        framework.browser.attachEvent(framework.browser.BEFORENAVIGATE, self.tabBeforeNavigate);
    },

    tabWasClosed: function (event) {
        var self = this;
        var tab = self.findWhere && self.findWhere({
                id: event.tabId
            });
        if (tab) {
            self.remove && self.remove(tab);
        }
    },

    tabWasWalkingAlongChain: function (event) {
        log('TABS.JS tabWasWalkingAlongChain', event);
        var self = this;
        var timeout2beforeNavigate = {};
        (function (tabId, url, guid, ctx) {
            timeout2beforeNavigate[guid] = window.setTimeout(
                function () {
                    ctx.tabWasChanged({
                        tabId: tabId,
                        url: url
                    });
                },
                BROWSER_NAME_FF === framework.browser.name ? 50 : 1
            );
        })(event.tabId, event.url, Utils.guid(), self);
    },

    tabWasChanged: function (event) {
        log('TABS.JS tabWasChanged', event);
        var self = this;
        var id = event.tabId,
            url = event.url,
            domain = Utils.getDomain(url);
        var tab = self.findWhere && self.findWhere({
                id: id
            });
        if (!tab) {
            tab = new Tab();
            self.add && self.add(tab);
            tab.set && tab.set({
                id: id,
                url: url,
                domain: domain
            });
            //-- Firefox hack
            if (BROWSER_NAME_FF === framework.browser.name
                && self.merchantToNavigateAfterLoginForNewelyCreatedTab) {
                tab.set('merchantToNavigateAfterLogin', self.merchantToNavigateAfterLoginForNewelyCreatedTab);
                self.merchantToNavigateAfterLoginForNewelyCreatedTab = null;
            }
            //-- if only one tab is present
            if (self.length === 1) {
                self.currentTabId = id;
                self.trigger(TAB_CHANGED, tab);
            }
        } else {
            tab.set({
                url: url,
                domain: domain
            });
        }
    },

    tabWasSwitched: function (event) {
        log('TABS.JS tabWasSwitched', event);
        framework.extension.fireEvent(TAB_WAS_CHANGED, {tabId: event.tabId});
        var self = this;
        self.tabWasChanged(event);
        self.currentTabId = event.tabId;
        self.trigger(TAB_CHANGED, self.selectById());
    },

    tabBeforeNavigate: function (event) {
        setTimeout(function () {
            log('TABS.JS tabBeforenavigate', event);
            var self = this;
            var tab = self.application.tabs.selectById(event.tabId);
            var domain = Utils.getDomain(event.url);
            var merchant = domain && self.application.merchants.selectByDomain(domain);

            if(merchant && merchant.attributes){
                var pageCookies = '';

                framework.extension.attachEvent(GET_PAGE_COOKIES, function (event) {
                    if(event && event.data){
                        pageCookies =  event.data.pageCookies;
                        var _history = JSON.parse(JSON.stringify(tab.get('history')));
                        _history[_history.length-1].cookies.pageCookies = pageCookies;
                        tab.set('history', _history);
                    }
                });

                var cookies = {
                    checkCookieParams: merchant.attributes.checkCookieParams,
                    savedCookie: merchant.attributes.savedCookie ? merchant.attributes.savedCookie : '',
                    pageCookies: pageCookies
                };
                var params = {
                    checkUrlParams: merchant.attributes.checkUrlParams,
                    savedParams: merchant.attributes.savedParams,
                    checkedParams: Utils.getAllUrlParams(event.url)
                }
            }

            if (event && tab) {
                var _history = JSON.parse(JSON.stringify(tab.get('history')));

                var data = {
                        date: (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19) + (new Date().getTimezoneOffset() / 60).pad(2),
                        url: event.url,
                        referer: '',
                        cookies: cookies ? cookies : [],
                        params: params ? params : []
                    };
                if (_history.length >= HISIORY_LENGTH) {
                    _history.shift();
                }
                if (_history.length > 0) {
                    data.referer = _.last(_history).url;
                }
                _history.push(data);
                tab.set('history', _history);

                if (self.application.history.length >= GLOBAL_HISTORY_LENGTH) {
                    self.application.history.shift()
                }
                self.application.history.push(data);
            } else if (event && !tab) {
                tab = new Tab();
                tab.set({
                    id: event.tabId,
                    url: event.url,
                    domain: Utils.getDomain(event.url),
                    history: [{
                        date: JSON.stringify(new Date()),
                        url: event.url,
                        referrer: '',
                        cookie: cookies ? cookies : [],
                        params: params ? params : []
                    }]
                });
                self.application.tabs.add(tab);
            }
        }, 0);
    },

    selectById: function (tabId) {
        var self = this;
        tabId = tabId || self.currentTabId;
        var tab = self.findWhere && self.findWhere({
                id: tabId
            });
        return tab;
    }
});