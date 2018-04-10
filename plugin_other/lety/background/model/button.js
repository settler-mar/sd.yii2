var Button = (function () {
    var self = {};
    var counter = "";
    var iconPath = "images/btn/";
    var icons = {
        standard: iconPath + "logo18.png",
        animated: iconPath + 'logo19.svg',
        rainbow: iconPath + "logo18rainbow.svg",
        red: iconPath + "logo18red.png",
        green: iconPath + "logo18green.png",
        safari: iconPath + "logo18safari.png",
        safari_act: iconPath + "logo18safari_activated.png",
        safari_info: iconPath + "logo18safari_info.png"
    };

    self.attach = function (callback) {
        framework.ui.button.attachEvent(framework.ui.button.CLICK, callback);
    };

    self.detach = function (callback) {
        framework.ui.button.detachEvent(framework.ui.button.CLICK, callback);
    };

    self.green = function () {
        var self = this;
        if (BROWSER_NAME_SAFARI === framework.browser.name) {
            self.setIcon("safari_act");
        } else {
            self.setIcon("green");
        }
    };

    self.red = function () {
        var self = this;
        if (BROWSER_NAME_SAFARI === framework.browser.name) {
            self.setIcon("safari_info");
        } else {
            self.setIcon("red");
        }
    };

    self.standard = function () {
        var self = this;
        if (BROWSER_NAME_SAFARI === framework.browser.name) {
            self.setIcon("safari");
        } else {
            self.setIcon("standard");
        }
    };

    self.setBadge = function (value) {
        if (value && (typeof value == "number" || value == "!"))
            counter = value;
        value != null ? framework.ui.button.setBadgeText(value) : framework.ui.button.setBadgeText(counter);
    };

    self.clearCounter = function () {
        var self = this;
        if (counter != "!") {
            counter = "";
            self.setBadge();
        }
    };

    self.setTitle = function (title) {
        framework.ui.button.setTitle(
            title ? title : 'Кэшбэк-сервис LetyShops'
        );
    };

    self.setIcon = function (icon) {
        framework.ui.button.setIcon(icons[icon]);
    };

    return self;
})();