var Storage = (function (browserName) {
    var self = {};

    self.get = function (item, callback) {
        framework.extension.getItem(item, function (value) {
            callback && callback(value);
        });
    };

    self.syncGet = function (item) {
        var deferred = $.Deferred();

        if (BROWSER_NAME_IE === browserName){
            _getLargeWithDeferred(item, deferred);
        } else{
            framework.extension.getItem(item, function (value) {
                deferred.resolve(value);
            });
        }
        return deferred.promise();
    };

    self.set = function (item, value) {
        framework.extension.setItem(item, value)
    };

    function _getLargeWithDeferred(item, deferred) {
        $.when(_getLarge(item))
            .always(function (value) {
                deferred.resolve(value);
            });
    }

    function _getLarge(item) {
        var deferred = $.Deferred();

        framework.extension.getItem(item + '_count', function (valuePartsCount) {
            if (valuePartsCount) {
                var getters = [];

                for (var i = 0; i < valuePartsCount; ++i)
                    getters.push((function () {
                        var deferred = $.Deferred();

                        framework.extension.getItem(item + '_' + i, function (value) {
                            deferred.resolve(value);
                        });

                        return deferred.promise();
                    })());

                $.when.apply($, getters).then(function () {
                    var value = '';

                    for (var i = 0; i < arguments.length; ++i)
                        value += arguments[i];

                    deferred.resolve(value);
                });
            } else
                framework.extension.getItem(item, function (value) {
                    deferred.resolve(value);
                });
        });

        return deferred.promise();
    }

    function _setLarge(item, value) {
        if ('string' !== typeof value) return;

        var valuePartsCount = Math.ceil(value.length / _ieRegistryMaxValue);

        framework.extension.setItem(item + '_count', valuePartsCount);

        for (var i = 0; i < valuePartsCount; ++i)
            framework.extension.setItem(item + '_' + i, value.substring(i * _ieRegistryMaxValue, i * _ieRegistryMaxValue + _ieRegistryMaxValue));
    }

    var _ieRegistryMaxValue = 16000;

    return self;
})(('undefined' !== typeof framework && framework.browser && framework.browser.name) || BROWSER_NAME_SAFARI);
