var InvitationTab = Backbone.View.extend({
    el: "#letyshops-content-container-invitation",
    template: Handlebars.templates.invitation_tab,
    width: 650,
    height: 450,
    inviteMsg: "LetyShops возвращает до 30% с каждой твоей интернет-покупки. Регистрируйся и получи Premium аккаунт в подарок! ",

    initialize: function (options) {
        var self = this;
        self.options = options;
        self.app = framework.extension.getBackgroundPage().application;

        this.events = {
            "click #letyshops-invitation-vk": "onInviteByVk",
            "click #letyshops-invitation-goo": "onInviteByGoogle",
            "click #letyshops-invitation-fb": "onInviteByFb",
            "click #letyshops-invitation-ok": "onInviteByOk",
            "click #letyshops-invitation-tw": "onInviteByTwitter",
            "click #letyshops-invitation-mv": "onInviteByMyWorld",
            "click #letyshops-referral-link-copy": "onCopy"
        };
    },

    delegateEvents: function () {
        return Backbone.View.prototype.delegateEvents.apply(this, arguments);
    },

    /* Invitations */
    onInviteByVk: function () {
        var self = this;
        self.app.sendGoogleAnalyticsEvent('Extension', 'Invite friend', 'VK');
        self.openWindow('http://vk.com/share.php?' + $.param({
                url: self.user.partnerUrl,
                title: self.inviteMsg
            }));
    },

    onInviteByGoogle: function () {
        var self = this;
        self.app.sendGoogleAnalyticsEvent('Extension', 'Invite friend', 'GP');
        self.openWindow('https://plus.google.com/share?' + $.param({
                url: self.user.partnerUrl,
                hl: 'ru'
            }));
    },

    onInviteByFbOld: function () {
        var self = this;
        var FB_APP_ID = "889046637871751";
        self.app.sendGoogleAnalyticsEvent('Extension', 'Invite friend', 'FB');
        self.openWindow('http://www.facebook.com/dialog/send?' + $.param({
                display: framework.browser.name === BROWSER_NAME_SAFARI ? 'page' : 'popup',
                app_id: 889046637871751,
                link: self.user.partnerUrl,
                redirect_uri: API.root(),
                title: self.inviteMsg
            }));
    },

    onInviteByFb: function () {
        var self = this;
        var FB_APP_ID = "889046637871751";
        self.app.sendGoogleAnalyticsEvent('Extension', 'Invite friend', 'FB');
        self.openWindow('http://www.facebook.com/dialog/share?' + $.param({
                app_id: 889046637871751,
                display: framework.browser.name === BROWSER_NAME_SAFARI ? 'page' : 'popup',
                href: self.user.partnerUrl,
                quote: self.inviteMsg
            }));
    },

    onInviteByOk: function () {
        var self = this;
        self.app.sendGoogleAnalyticsEvent('Extension', 'Invite friend', 'OK');
        self.openWindow('https://connect.ok.ru/dk?' + $.param({
                'st.cmd': 'OAuth2Login',
                'st.layout': 'w',
                'st.redirect': '/dk?cmd=WidgetSharePreview&amp;st.cmd=WidgetSharePreview&amp;st.shareUrl=' + encodeURIComponent(self.user.partnerUrl),
                'st.client_id': -1
            }));
    },

    onInviteByTwitter: function () {
        var self = this;
        self.app.sendGoogleAnalyticsEvent('Extension', 'Invite friend', 'Tw');
        self.openWindow('https://twitter.com/intent/tweet?' + $.param({
                text: self.inviteMsg + self.user.partnerUrl
            }));
    },

    onInviteByMyWorld: function () {
        var self = this;
        self.app.sendGoogleAnalyticsEvent('Extension', 'Invite friend', 'MW');
        self.openWindow('https://connect.mail.ru/login?' + $.param({
                connect: '1',
                page: 'https://connect.mail.ru/share?share_url=' + self.user.partnerUrl
            }));
    },

    openWindow: function (url) {
        var self = this;
        if (framework.browser.name === BROWSER_NAME_SAFARI) {
            framework.browser.navigate({
                url: url,
                tabId: framework.browser.NEWTAB
            });
            window.close();
        } else {
            window.open(url, 'LetyShops.ru', 'width=' + self.width + ', height=' + self.height + ',left=' + (screen.availWidth - self.width) / 2 + ',top=' + (screen.availHeight - self.height) / 2);
        }
    },

    // copy to clipboard
    onCopy: function (e) {
        var self = this;
        self.app.sendGoogleAnalyticsEvent('Extension', 'Invite friend', 'Copy Link Button');
        try {
            const input = document.createElement('input');
            input.style.position = 'fixed';
            input.style.opacity = 0;
            input.value = self.user.partnerUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('Copy');
            document.body.removeChild(input);
            if (framework.browser.name != BROWSER_NAME_SAFARI) {
                var tooltip = self.$el.find('.copy-success')
                tooltip.fadeIn();
                _.delay(function ($el) {
                    $el.fadeOut();
                }, 1500, tooltip);
            }
        } catch (e) {
        }
    },

    render: function (user) {
        var self = this;
        self.user = user;
        var settings = {
            autoReinitialise: true,
            showArrows: false,
            horizontalGutter: 2,
            verticalGutter: 10,
            mouseWheelSpeed: 5,
            hideFocus: true
        };
        self.$el.empty().html(self.template(user)).find(".scroll-pane").jScrollPane(settings);
        return self;
    }
});