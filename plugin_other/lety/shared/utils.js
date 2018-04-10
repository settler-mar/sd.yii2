var Utils = (function () {

    var self = {};

    self.getDomain = function (url) {
        var match;

        if (url) {
            match = /^(?:https?:\/\/)?(?:www[1-9]*\.)?([^:\/\n]+)/i.exec(url);
        }

        return match && ('www.' + match[1].toLowerCase());
    };

    self.getStyle = function (element, cssProperty) {
        if (element.currentStyle) {
            return element.currentStyle[cssProperty];
        } else if (window.document.defaultView && window.document.defaultView.getComputedStyle) {
            var style = window.document.defaultView.getComputedStyle(element, '');
            return style ? style[cssProperty] : null;
        } else if (element.style) {
            return element.style[cssProperty];
        }
    };

    self.getListOfAbsoluteElements = function (parent, deep, opt_parentIsAbsolute) {
        var list = [];

        for (
            var i = 0
            ; i < parent.childNodes.length
            ; ++i
        ) {
            if (
                parent.childNodes[i]
                && 1 === parent.childNodes[i].nodeType
            ) {
                var pos = this.getStyle(parent.childNodes[i], 'position');

                if (!opt_parentIsAbsolute && 'absolute' === pos || 'fixed' === pos) {
                    if ('auto' !== this.getStyle(parent.childNodes[i], 'top')) {
                        list.push(parent.childNodes[i]);
                    }
                }

                var abs = ('absolute' === pos || 'fixed' === pos || 'relative' === pos) || opt_parentIsAbsolute;
                if (parent.childNodes[i].childNodes && 0 < deep) {
                    var res = this.getListOfAbsoluteElements(
                        parent.childNodes[i]
                        , deep - 1
                        , abs
                    );

                    if (res && res.length) {
                        list = list.concat(res);
                    }
                }
            }
        }

        return list;
    };

    self.guid = function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    self.fixedEncodeURIComponent = function (str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
            return '%' + c.charCodeAt(0).toString(16);
        });
    };

    Number.prototype.pad = function (size) {
        var a = String(this).substring(0, 1);
        var s = String(Math.abs(this));
        while (s.length < (size || 2)) {
            s = "0" + s;
        }
        return a == '-' ? '+' + s + ':00' : '-' + s + ':00';
    };

    self.getFullInfo = function () {
        var browser,
            version,
            mobile,
            os,
            osversion,
            bit,
            ua = window.navigator.userAgent,
            platform = window.navigator.platform;


        //Internet Explorer
        if (/MSIE/.test(ua)) {

            browser = 'Internet Explorer';

            if (/IEMobile/.test(ua)) {
                mobile = 1;
            }

            version = /MSIE \d+[.]\d+/.exec(ua)[0].split(' ')[1];


            //YaBrowser
        } else if (/YaBrowser/.test(ua)) {

            //Chromebooks
            if (/CrOS/.test(ua)) {
                platform = 'CrOS';
            }

            browser = 'YaBrowser';
            version = /YaBrowser\/[\d\.]+/.exec(ua)[0].split('/')[1];


            // Opera Browser
        } else if (/Opera/.test(ua) || /OPR/.test(ua)) {

            browser = 'Opera';
            version = /OPR\/[\d\.]+/.exec(ua)[0].split('/')[1];

            if (/mini/.test(ua) || /Mobile/.test(ua)) {
                mobile = 1;
            }

            // Chrome Browser
        } else if (/Chrome/.test(ua)) {

            //Chromebooks
            if (/CrOS/.test(ua)) {
                platform = 'CrOS';
            }

            browser = 'Chrome';
            version = /Chrome\/[\d\.]+/.exec(ua)[0].split('/')[1];

            // Opera Browser
        } else if (/Android/.test(ua)) {

            browser = 'Android Webkit Browser';
            mobile = 1;
            os = /Android\s[\.\d]+/.exec(ua)[0];


            //Mozilla firefox
        } else if (/Firefox/.test(ua)) {

            browser = 'Firefox';

            if (/Fennec/.test(ua)) {
                mobile = 1;
            }
            version = /Firefox\/[\.\d]+/.exec(ua)[0].split('/')[1];


            //Safari
        } else if (/Safari/.test(ua)) {

            browser = 'Safari';

            if ((/iPhone/.test(ua)) || (/iPad/.test(ua)) || (/iPod/.test(ua))) {
                os = 'iOS';
                mobile = 1;
            }

        }

        if (!version) {

            version = /Version\/[\.\d]+/.exec(ua);

            if (version) {
                version = version[0].split('/')[1];
            } else {
                version = framework.browser.version;;
            }

        }

        if (platform === 'MacIntel' || platform === 'MacPPC') {
            os = 'Mac OS X';
            osversion = /10[\.\_\d]+/.exec(ua)[0];
            if (/[\_]/.test(osversion)) {
                osversion = osversion.split('_').join('.');
            }
        } else if (platform === 'CrOS') {
            os = 'ChromeOS';
        } else if (platform === 'Win32' || platform == 'Win64') {
            os = 'Windows';
            bit = platform.replace(/[^0-9]+/, '');
        } else if (!os && /Android/.test(ua)) {
            os = 'Android';
        } else if (!os && /Linux/.test(platform)) {
            os = 'Linux';
        } else if (!os && /Windows/.test(ua)) {
            os = 'Windows';
        }

        return fullInfo = {
            browser: browser,
            version: version,
            mobile: mobile,
            os: os,
            osversion: osversion,
            bit: bit
        };
    };

    self.getAllUrlParams = function (url) {

        // извлекаем строку из URL или объекта window
        var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

        // объект для хранения параметров
        var obj = {};

        // если есть строка запроса
        if (queryString) {

            // данные после знака # будут опущены
            queryString = queryString.split('#')[0];

            // разделяем параметры
            var arr = queryString.split('&');

            for (var i = 0; i < arr.length; i++) {
                // разделяем параметр на ключ => значение
                var a = arr[i].split('=');

                // обработка данных вида: list[]=thing1&list[]=thing2
                var paramNum = undefined;
                var paramName = a[0].replace(/\[\d*\]/, function (v) {
                    paramNum = v.slice(1, -1);
                    return '';
                });

                // передача значения параметра ('true' если значение не задано)
                var paramValue = typeof(a[1]) === 'undefined' || a[1] === null ? '' : a[1];

                // преобразование регистра
                paramName = paramName.toLowerCase();
                paramValue = paramValue.toLowerCase();

                // если ключ параметра уже задан
                if (obj[paramName]) {
                    // преобразуем текущее значение в массив
                    if (typeof obj[paramName] === 'string') {
                        obj[paramName] = [obj[paramName]];
                    }
                    // если не задан индекс...
                    if (typeof paramNum === 'undefined') {
                        // помещаем значение в конец массива
                        obj[paramName].push(paramValue);
                    }
                    // если индекс задан...
                    else {
                        // размещаем элемент по заданному индексу
                        obj[paramName][paramNum] = paramValue;
                    }
                }
                // если параметр не задан, делаем это вручную
                else {
                    obj[paramName] = paramValue;
                }
            }
        }

        return obj;
    }


    self.getDomainPrice = function (host) {
        if (host && host.length > 0) {
            var domainPrice = null;
            if (host.indexOf('aliexpress') !== -1) {
                domainPrice = 'aliexpress';
            } else if (host.indexOf('gearbest') !== -1 && location.host.startsWith('www.gearbest')) {
                domainPrice = 'gearbest';
            } else if (host.indexOf('ru.gearbest') !== -1 && location.host.startsWith('ru.gearbest')) {
                domainPrice = 'ru.gearbest';
            } else if (host.indexOf('banggood') !== -1 && location.host.startsWith('www.banggood')) {
                domainPrice = 'banggood';
            } else if (host.indexOf('eu.banggood') !== -1 && location.host.startsWith('eu.banggood')) {
                domainPrice = 'eu.banggood';
            } else if (host.indexOf('us.banggood') !== -1 && location.host.startsWith('us.banggood')) {
                domainPrice = 'us.banggood';
            } else if (host.indexOf('lightinthebox') !== -1) {
                domainPrice = 'lightinthebox';
            } else if (host.indexOf('miniinthebox') !== -1) {
                domainPrice = 'miniinthebox';
            } else if (host.indexOf('tomtop') !== -1) {
                domainPrice = 'tomtop';
            }
        }
        return domainPrice;
    };

    self.getProductId = function (domainPrice, pathname) {
        if (domainPrice && domainPrice.length > 0) {
            var id = null;
            switch (domainPrice) {
                case 'aliexpress':
                    id = pathname.matchAll(REGEX_ALI_PRODUCT_ID)[0][1];
                    id = id + '_aliexpress';
                    break;
                case 'gearbest':
                    id = pathname.matchAll(REGEX_GEARBEST_PRODUCT_ID)[0][1];
                    id = id + '_gearbest';
                    break;
                case 'ru.gearbest':
                    id = pathname.matchAll(REGEX_GEARBEST_PRODUCT_ID)[0][1];
                    id = id + '_ru_gearbest';
                    break;
                case 'banggood':
                    id = pathname.matchAll(REGEX_BANG_GOOD_PRODUCT_ID)[0][1];
                    id = id + '_banggood';
                    break;
                case 'eu.banggood':
                    id = pathname.matchAll(REGEX_BANG_GOOD_EU_PRODUCT_ID)[0][1];
                    id = id + '_eu_banggood';
                    break;
                case 'us.banggood':
                    id = pathname.matchAll(REGEX_BANG_GOOD_US_PRODUCT_ID)[0][1];
                    id = id + '_us_banggood';
                    break;
                case 'lightinthebox':
                    id = pathname.matchAll(REGEX_LIGHT_IN_THE_BOX_PRODUCT_ID)[0][1];
                    id = id + '_lightinthebox';
                    break;
                case 'miniinthebox':
                    id = pathname.matchAll(REGEX_LIGHT_IN_THE_BOX_PRODUCT_ID)[0][1];
                    id = id + '_miniinthebox';
                    break;
                case 'tomtop':
                    id = pathname.matchAll(REGEX_TOM_TOP_PRODUCT_ID)[0][1];
                    id = id + '_tomtop';
                    break;
            }
        }
        return id;
    };

    function getTimeZoneOffset() {
        try {
            return new Date().toString().match(/([-\+][0-9]+)\s/)[1]
        } catch (e) {
            return null
        }
    };

    function getPriceAliexpress(text) {
        try {
            var priceMin;
            var priceMax;
            var currency;

            var priceStr = getPriceStrAliexpress();

            try {
                priceMin = parseFloat(parseFloat(text.matchAll(REGEX_ACT_MIN_PRICE)[0][1]).toFixed(2));
            } catch (e) {
                priceMin = parseFloat(parseFloat(text.matchAll(REGEX_MIN_PRICE)[0][1]).toFixed(2));
            }

            try {
                priceMax = parseFloat(parseFloat(text.matchAll(REGEX_ACT_MAX_PRICE)[0][1]).toFixed(2));
            } catch (e) {
                priceMax = parseFloat(parseFloat(text.matchAll(REGEX_MAX_PRICE)[0][1]).toFixed(2));
            }

            currency = text.matchAll(REGEX_BASE_CURRENCY_CODE)[0][1];

            if (!currency) {
                throw new Error('getPriceObj currency bad string');
            }
            if (priceMin > priceMax) {
                throw new Error('getPriceObj priceMin > priceMax');
            }
            if (!(priceMin > 0 && priceMax > 0)) {
                throw new Error('getPriceObj priceMin or priceMax less or equal 0');
            }

            var obj = getDisplayPriceAliexpress(priceStr);

            return {
                currency: currency,
                priceMin: priceMin,
                priceMax: priceMax,
                currencyDisplay: obj.currency,
                priceMinDisplay: obj.priceMin,
                priceMaxDisplay: obj.priceMax
            };

        } catch (e) {

            try {
                var objGroup = getDisplayPriceAliexpress(priceStr);

                return {
                    currency: null,
                    priceMin: null,
                    priceMax: null,
                    currencyDisplay: objGroup.currency,
                    priceMinDisplay: objGroup.priceMin,
                    priceMaxDisplay: objGroup.priceMax
                };
            } catch (e) {
                console.log('Error', e);
                return {
                    currency: null,
                    priceMin: null,
                    priceMax: null,
                    currencyDisplay: null,
                    priceMinDisplay: null,
                    priceMaxDisplay: null
                };
            }
        }
    };

    function getPriceGearbest() {
        try {
            var priceMin = parseFloat(parseFloat($(CHECK_ELEMENT_GEARBEST).val()).toFixed(2));
            var priceMax = parseFloat(parseFloat($(CHECK_ELEMENT_GEARBEST).val()).toFixed(2));
            var currency = 'USD';

            if (!currency) {
                throw new Error('getPriceObj currency bad string');
            }
            if (priceMin > priceMax) {
                throw new Error('getPriceObj priceMin > priceMax');
            }
            if (!(priceMin > 0 && priceMax > 0)) {
                throw new Error('getPriceObj priceMin or priceMax less or equal 0');
            }

            var obj = getDisplayPriceGearBest();

            return {
                currency: currency,
                priceMin: priceMin,
                priceMax: priceMax,
                currencyDisplay: obj.currency,
                priceMinDisplay: obj.priceMin,
                priceMaxDisplay: obj.priceMax
            };
        } catch (e) {
            console.log('Error', e);
            return {
                currency: null,
                priceMin: null,
                priceMax: null,
                currencyDisplay: null,
                priceMinDisplay: null,
                priceMaxDisplay: null
            };
        }


    };

    function getPriceBanggood() {
        try {
            var priceMin = parseFloat($('.item_box.price .now').attr('oriattrmin'));
            var price = parseFloat($('.item_box.price .now').attr('oriprice'));
            var priceMax = parseFloat($('.item_box.price .now').attr('oriattrmax'));

            if (!priceMin || price < priceMin) {
                priceMin = price;
            }

            if (!priceMax) {
                priceMax = priceMin;
            }

            $('.item_warehouse_list li[value!="US"] .item_warehouse_price').each(function () {
                if (parseFloat($(this).attr('oriprice')) < priceMin) { // important oriPrice => oriprice looks like bug in cheerio
                    priceMin = parseFloat($(this).attr('oriprice'));
                }

                if (parseFloat($(this).attr('oriprice')) > priceMax) {
                    priceMax = parseFloat($(this).attr('oriprice'));
                }
            });

            var currency = $('.item_box.price [itemprop="priceCurrency"]').attr('content').toUpperCase().trim();

            if (!currency) {
                throw new Error('getPriceObj currency bad string');
            }
            if (priceMin > priceMax) {
                throw new Error('getPriceObj priceMin > priceMax');
            }
            if (!(priceMin > 0 && priceMax > 0)) {
                throw new Error('getPriceObj priceMin or priceMax less or equal 0');
            }

            var obj = getDisplayPriceBanggood();

            return {
                currency: currency,
                priceMin: priceMin,
                priceMax: priceMax,
                currencyDisplay: obj.currency,
                priceMinDisplay: obj.priceMin,
                priceMaxDisplay: obj.priceMax
            };
        } catch (e) {
            console.log('Error', e);
            return {
                currency: null,
                priceMin: null,
                priceMax: null,
                currencyDisplay: null,
                priceMinDisplay: null,
                priceMaxDisplay: null
            };
        }
    };

    function getPriceUsEuBanggood() {
        try {
            var priceMin = parseFloat($('.pro_price [itemprop="price"]').text());
            var priceMax = parseFloat($('.pro_price [itemprop="price"]').text());

            var currencyConfig = {
                'USD': 'US$',
                'EUR': '€',
                'GBP': '£',
                'AUD': 'AU$',
                'CAD': 'CA$',
                'RUB': 'руб.',
                'BRL': 'R$',
                'CHF': 'SFr',
                'DKK': 'Dkr',
                'PHP': '₱',
                'SGD': 'S$',
                'CZK': 'Kč',
                'HUF': 'Ft',
                'MXN': 'Mex$',
                'NOK': 'Kr',
                'NZD': 'NZD$',
                'PLN': 'zł',
                'THB': '฿',
                'HKD': 'HK$',
                'ILS': '₪',
                'SEK': 'Kr',
                'ZAR': 'R',
                'KRW': '₩',
                'CLP': '$',
                'TRY': 'TRY',
                'INR': 'Rs',
                'JPY': 'JPY',
                'AED': 'AED',
                'MYR': 'RM',
                'IDR': 'Rp',
                'UAH': '₴',
                'KWD': 'K.D.',
                'QAR': 'QR.',
                'BHD': 'BD.',
                'SAR': 'S.R.'
            };
            var currencyKeys = Object.keys(currencyConfig);
            var currencySign = $('.item_box.price .hbactive b').text();
            if (!currencySign) { // for eu and us
                currencySign = $('.pro_price .currency .currency_Prefix').text();
            }
            var currency;
            for (var i in currencyKeys) {
                if (currencyConfig[currencyKeys[i]] === currencySign) {
                    currency = currencyKeys[i];
                    break;
                }
            }

            if (!currency) {
                throw new Error('getPriceObj currency bad string');
            }
            if (priceMin > priceMax) {
                throw new Error('getPriceObj priceMin > priceMax');
            }
            if (!(priceMin > 0 && priceMax > 0)) {
                throw new Error('getPriceObj priceMin or priceMax less or equal 0');
            }

            var obj = getDisplayPriceBanggood();

            return {
                currency: currency,
                priceMin: priceMin,
                priceMax: priceMax,
                currencyDisplay: obj.currency,
                priceMinDisplay: obj.priceMin,
                priceMaxDisplay: obj.priceMax
            };
        } catch (e) {
            console.log('Error', e);
            return {
                currency: null,
                priceMin: null,
                priceMax: null,
                currencyDisplay: null,
                priceMinDisplay: null,
                priceMaxDisplay: null
            };
        }
    };

    function getPriceLightinthebox() {

        function _getPriceMinLightinthebox(currency, priceText, itemId) {
            try {
                if (!currency) {
                    throw new Error('getPriceObjLightinthebox currency bad');
                }

                if (typeof priceText !== 'string') {
                    throw new Error('getPriceObjLightinthebox priceText not string');
                }

                /* eslint-disable */
                var currencyConfig = {
                    'USD': '.', 'EUR': '.', 'GBP': '.', 'CAD': '.', 'AUD': '.',
                    'CHF': '.', 'HKD': '.', 'JPY': '.', 'RUB': ',', 'BRL': ',',
                    'CLP': ',', 'NOK': ',', 'DKK': ',', 'SAR': '.', 'SEK': '.',
                    'KRW': '.', 'ILS': '.', 'MXN': '.', 'SGD': '.', 'NZD': '.',
                    'ARS': ',', 'INR': '.', 'COP': ',', 'AED': '.', 'CZK': '.',
                    'PLN': ',', 'CNY': '.'
                };
                /* eslint-enable */

                var decimal = currencyConfig[currency];
                if (decimal === null) {
                    throw new Error('getPriceObjLightinthebox can not decimal for this currency');
                }

                var regex = new RegExp('[^0-9' + decimal + ']', ['g']);
                return parseFloat(priceText.replace(regex, '').replace(/^\./gmi, '').replace(decimal, '.'));
            } catch (e) {
                console.log('getPriceObjLightinthebox error', {err: e, itemId: itemId});
                return null;
            }
        }

        function getPriceObjLightinthebox() {
            try {
                var currency = $('.current-price .widget dt').text().replace(/\s\s+/g, ' ').trim().toUpperCase();

                var priceMin = _getPriceMinLightinthebox(currency, $('.current-price .sale-price').text());
                var priceMax = priceMin;

                var prodInfoConfig = JSON.parse($('#_prodInfoConfig_').attr('data-config'));
                var targetSourceId = Object.keys(prodInfoConfig)[0];
                var attributes = prodInfoConfig[targetSourceId].attributes;
                for (var attr in attributes) {
                    for (var item in attr.items) {
                        if (item.price > 0) {
                            var possibleMaxPrice = parseFloat((priceMin + parseFloat(item.price)).toFixed(2));
                            if (possibleMaxPrice > priceMax) {
                                priceMax = possibleMaxPrice;
                            }
                        }
                    }
                }

                if (!currency) {
                    throw new Error('getPriceObjLightinthebox currency bad string');
                }
                if (priceMin > priceMax) {
                    throw new Error('getPriceObjLightinthebox priceMin > priceMax');
                }
                if (!(priceMin > 0 && priceMax > 0)) {
                    throw new Error('getPriceObjLightinthebox priceMin or priceMax less or equal 0');
                }
                return {
                    currency: currency,
                    priceMin: priceMin,
                    priceMax: priceMax,
                    currencyDisplay: currency,
                    priceMinDisplay: priceMin,
                    priceMaxDisplay: priceMax
                };
            } catch (e) {
                console.log('Error', e);
                return {
                    currency: null,
                    priceMin: null,
                    priceMax: null,
                    currencyDisplay: null,
                    priceMinDisplay: null,
                    priceMaxDisplay: null
                };
            }
        }

        return getPriceObjLightinthebox();
    };

    /**
     *
     * @param bodyText
     * @returns {*}
     */
    function getPriceTomtop(bodyText) {
        try {
            var product;
            try {
                product = JSON.parse(bodyText.matchAll(/var\s+product\s*=(.*)/gmi)[0][1]);
            } catch (e) {
                product = null;
            }
            var mainContent;
            try {
                mainContent = JSON.parse(bodyText.matchAll(/var\s+mainContent\s*=(.*)?;/gmi)[0][1]);
            } catch (e) {
                mainContent = null;
            }
            var timeLimit;
            try {
                timeLimit = JSON.parse(bodyText.matchAll(/var\s+timeLimit\s*=(.*)?;/gmi)[0][1]);
            } catch (e) {
                timeLimit = null;
            }
            var productPrice = product ? parseFloat(product.saleprice ? product.saleprice : product.price) : null;
            var productCurrency = product ? product.currency : null;
            var mainContentPrices = [];
            if (typeof mainContent === 'object' && mainContent && mainContent.length > 0) {
                mainContent.forEach(function (row) {
                    if (typeof row.whouse === 'object' && row.whouse) {
                        Object.keys(row.whouse).forEach(function (whouse) {
                            mainContentPrices.push({
                                listingId: row.listingId,
                                depotId: row.whouse[whouse].depotId,
                                symbol: row.whouse[whouse].symbol,
                                nowprice: parseFloat(row.whouse[whouse].nowprice),
                                origprice: parseFloat(row.whouse[whouse].origprice),
                                us_nowprice: parseFloat(row.whouse[whouse].us_nowprice),
                                us_origprice: parseFloat(row.whouse[whouse].us_origprice),
                                saleStartDate: row.whouse[whouse].saleStartDate,
                                saleEndDate: row.whouse[whouse].saleEndDate
                            });
                        });
                    }
                });
            }
            var timeLimitPrices = [];
            if (typeof timeLimit === 'object' && timeLimit) {
                Object.keys(timeLimit).forEach(function (sku) {
                    if (typeof timeLimit[sku] === 'object' && timeLimit[sku]) {
                        Object.keys(timeLimit[sku]).forEach(function (subRow) {
                            timeLimitPrices.push({
                                listingId: timeLimit[sku][subRow].listingId,
                                depotId: timeLimit[sku][subRow].depot,
                                actPrice: parseFloat(timeLimit[sku][subRow].actPrice),
                                nowprice: parseFloat(timeLimit[sku][subRow].nowprice)
                            });
                        });
                    }
                });
            }
            var currency = 'USD';
            var currencyDisplay = productCurrency;
            var priceMinArr = {};
            var priceMaxArr = {};
            var priceMinDisplayArr = {};
            var priceMaxDisplayArr = {};
            var hasTimeLimitsListingAndDepotIds = [];
            if (timeLimitPrices.length > 0) {
                timeLimitPrices.forEach(function (row) {
                    hasTimeLimitsListingAndDepotIds.push(row.depotId + '_' + row.listingId);
                    if (!priceMinArr[row.listingId]) priceMinArr[row.listingId] = row.actPrice;
                    if (!priceMaxArr[row.listingId]) priceMaxArr[row.listingId] = row.actPrice;
                    if (row.actPrice < priceMinArr[row.listingId]) priceMinArr[row.listingId] = row.actPrice;
                    if (row.actPrice > priceMaxArr[row.listingId]) priceMaxArr[row.listingId] = row.actPrice;
                    if (!priceMinDisplayArr[row.listingId]) priceMinDisplayArr[row.listingId] = row.nowprice;
                    if (!priceMaxDisplayArr[row.listingId]) priceMaxDisplayArr[row.listingId] = row.nowprice;
                    if (row.nowprice < priceMinDisplayArr[row.listingId]) priceMinDisplayArr[row.listingId] = row.nowprice;
                    if (row.nowprice > priceMaxDisplayArr[row.listingId]) priceMaxDisplayArr[row.listingId] = row.nowprice;
                });
            }
            if (mainContentPrices.length > 0) {
                mainContentPrices.forEach(function (row) {
                    if (hasTimeLimitsListingAndDepotIds.indexOf(row.depotId + '_' + row.listingId) !== -1) {
                        return 0; //continue
                    }
                    if (!priceMinArr[row.listingId]) priceMinArr[row.listingId] = row.us_nowprice;
                    if (!priceMaxArr[row.listingId]) priceMaxArr[row.listingId] = row.us_nowprice;
                    if (row.us_nowprice < priceMinArr[row.listingId]) priceMinArr[row.listingId] = row.us_nowprice;
                    if (row.us_nowprice > priceMaxArr[row.listingId]) priceMaxArr[row.listingId] = row.us_nowprice;
                    if (!priceMinDisplayArr[row.listingId]) priceMinDisplayArr[row.listingId] = row.nowprice;
                    if (!priceMaxDisplayArr[row.listingId]) priceMaxDisplayArr[row.listingId] = row.nowprice;
                    if (row.nowprice < priceMinDisplayArr[row.listingId]) priceMinDisplayArr[row.listingId] = row.nowprice;
                    if (row.nowprice > priceMaxDisplayArr[row.listingId]) priceMaxDisplayArr[row.listingId] = row.nowprice;
                });
            }
            var priceMin = null;
            var priceMax = null;
            var priceMinDisplay = null;
            var priceMaxDisplay = null;
            Object.keys(priceMinArr).forEach(function (listingId) {
                if (!priceMin) priceMin = priceMinArr[listingId];
                if (priceMinArr[listingId] < priceMin) priceMin = priceMinArr[listingId];
            });
            Object.keys(priceMaxArr).forEach(function (listingId) {
                if (!priceMax) priceMax = priceMaxArr[listingId];
                if (priceMaxArr[listingId] > priceMax) priceMax = priceMaxArr[listingId];
            });
            Object.keys(priceMinDisplayArr).forEach(function (listingId) {
                if (!priceMinDisplay) priceMinDisplay = priceMinDisplayArr[listingId];
                if (priceMinDisplayArr[listingId] < priceMinDisplay) priceMinDisplay = priceMinDisplayArr[listingId];
            });
            Object.keys(priceMaxDisplayArr).forEach(function (listingId) {
                if (!priceMaxDisplay) priceMaxDisplay = priceMaxDisplayArr[listingId];
                if (priceMaxDisplayArr[listingId] > priceMaxDisplay) priceMaxDisplay = priceMaxDisplayArr[listingId];
            });
            if (!priceMinDisplay) priceMinDisplay = productPrice;
            if (!priceMaxDisplay) priceMaxDisplay = productPrice;
            if (productPrice < priceMinDisplay) priceMinDisplay = productPrice;
            if (productPrice > priceMaxDisplay) priceMaxDisplay = productPrice;
            if (!currency) {
                throw new Error('getPriceObj currency bad string');
            }
            if (priceMin > priceMax) {
                throw new Error('getPriceObj priceMin > priceMax');
            }
            if (!(priceMin > 0 && priceMax > 0)) {
                throw new Error('getPriceObj priceMin or priceMax less or equal 0');
            }
            if (!currencyDisplay) {
                throw new Error('getPriceObj currencyDisplay bad string');
            }
            if (priceMinDisplay > priceMaxDisplay) {
                throw new Error('getPriceObj priceMinDisplay > priceMaxDisplay');
            }
            if (!(priceMinDisplay > 0 && priceMaxDisplay > 0)) {
                throw new Error('getPriceObj priceMinDisplay or priceMaxDisplay less or equal 0');
            }
            return {
                currency: currency,
                priceMin: priceMin,
                priceMax: priceMax,
                currencyDisplay: currencyDisplay,
                priceMinDisplay: priceMinDisplay,
                priceMaxDisplay: priceMaxDisplay
            };
        } catch (e) {
            console.error('Error', e);
            return {
                currency: null,
                priceMin: null,
                priceMax: null,
                currencyDisplay: null,
                priceMinDisplay: null,
                priceMaxDisplay: null
            };
        }
    };

    /**
     *
     * @returns {{currency, priceMin, priceMax}}
     */
    function getDisplayPriceBanggood() {
        function getPriceObj() {
            try {
                var price = $('.item_box.price .now').text().split('~');
                var priceMin = parseFloat(price[0]);
                var priceMax = parseFloat(price[1]);

                if (!priceMin) { // for eu and us
                    priceMin = parseFloat($('.pro_price [itemprop="price"]').text());
                    priceMax = priceMin;
                }

                if (!(priceMin > 0)) {
                    throw new Error('getPriceObj priceMin should be more than 0');
                }

                if (!priceMax) {
                    priceMax = priceMin;
                }

                $('.item_warehouse_list .item_warehouse_price').each(function () {
                    var priceWarehouse = parseFloat($(this).text().replace(/[,\s]/gmi, '').match(/\d+[.\d+]*/gmi)[0]);
                    if (priceWarehouse < priceMin) {
                        priceMin = priceWarehouse;
                    }
                    if (priceWarehouse > priceMax) {
                        priceMax = priceWarehouse;
                    }
                });

                var currencyConfig = {
                    'USD': 'US$',
                    'EUR': '€',
                    'GBP': '£',
                    'AUD': 'AU$',
                    'CAD': 'CA$',
                    'RUB': 'руб.',
                    'BRL': 'R$',
                    'CHF': 'SFr',
                    'DKK': 'Dkr',
                    'PHP': '₱',
                    'SGD': 'S$',
                    'CZK': 'Kč',
                    'HUF': 'Ft',
                    'MXN': 'Mex$',
                    'NOK': 'Kr',
                    'NZD': 'NZD$',
                    'PLN': 'zł',
                    'THB': '฿',
                    'HKD': 'HK$',
                    'ILS': '₪',
                    'SEK': 'Kr',
                    'ZAR': 'R',
                    'KRW': '₩',
                    'CLP': '$',
                    'TRY': 'TRY',
                    'INR': 'Rs',
                    'JPY': 'JPY',
                    'AED': 'AED',
                    'MYR': 'RM',
                    'IDR': 'Rp',
                    'UAH': '₴',
                    'KWD': 'K.D.',
                    'QAR': 'QR.',
                    'BHD': 'BD.',
                    'SAR': 'S.R.'
                };
                var currencyKeys = Object.keys(currencyConfig);
                var currencySign = $('.item_box.price .hbactive b').text();
                if (!currencySign) { // for eu and us
                    currencySign = $('.pro_price .currency .currency_Prefix').text();
                }
                var currency;
                for (var i in currencyKeys) {
                    if (currencyConfig[currencyKeys[i]] === currencySign) {
                        currency = currencyKeys[i];
                        break;
                    }
                }

                if (!currency) {
                    throw new Error('getPriceObj currency bad string');
                }
                if (priceMin > priceMax) {
                    throw new Error('getPriceObj priceMin > priceMax');
                }
                if (!(priceMin > 0 && priceMax > 0)) {
                    throw new Error('getPriceObj priceMin or priceMax less or equal 0');
                }
                return {currency: currency, priceMin: priceMin, priceMax: priceMax};
            } catch (e) {
                console.log('Error', e);
                return {currency: null, priceMin: null, priceMax: null};
            }
        }

        return getPriceObj();
    }

    /**
     *
     * @returns {{currency, priceMin, priceMax}}
     */
    function getDisplayPriceGearBest() {
        function getPriceObj(currency, priceText) {
            try {
                if (!currency) {
                    throw new Error('getPriceObj currency bad string');
                }

                if (typeof priceText !== 'string') {
                    throw new Error('getPriceObj priceText not string');
                }

                var priceMin = parseFloat(priceText.match(/\d+[.\d+]*/gmi)[0]);
                var priceMax = priceMin;

                if (priceMin > priceMax) {
                    throw new Error('getPriceObj priceMin > priceMax');
                }
                if (!(priceMin > 0 && priceMax > 0)) {
                    throw new Error('getPriceObj priceMin or priceMax less or equal 0');
                }
                return {currency: currency, priceMin: priceMin, priceMax: priceMax};
            } catch (e) {
                console.log('Error', e);
                return {currency: null, priceMin: null, priceMax: null};
            }
        }

        var currency = $('.goods_price .bizhong').eq(0).text();
        var priceStr = $('#unit_price').text();

        return getPriceObj(currency, priceStr);
    }

    /**
     *
     * @param priceText
     * @returns {*}
     */
    function getDisplayPriceAliexpress(priceText) {
        try {
            if (typeof priceText !== 'string') {
                throw new Error('getPriceObj priceText not string');
            }

            var currencyConfig = [
                [/US.*\$/gmi, 'USD', '.'],
                [/руб\./gmi, 'RUB', ','],
                [/￡/gmi, 'GBP', '.'],
                [/R\$/gmi, 'BRL', ','],
                [/C\$/gmi, 'CAD', '.'],
                [/AU.*\$/gmi, 'AUD', '.'],
                [/€/gmi, 'EUR', ','],
                [/Rs\./gmi, 'INR', '.'],
                [/грн\./gmi, 'UAH', ','],
                [/￥/gmi, 'JPY', '.'], // decimal not found dot by default
                [/MXN\$/gmi, 'MXN', '.'],
                [/Rp/gmi, 'IDR', '.'],
                [/TL/gmi, 'TRY', '.'],
                [/SEK/gmi, 'SEK', '.'],
                [/CLP/gmi, 'CLP', '.'], // decimal not found dot by default
                [/₩/gmi, 'KRW', '.'], // decimal not found dot by default
                [/SG\$/gmi, 'SGD', '.'],
                [/NZ\$/gmi, 'NZD', '.'],
                [/CHF/gmi, 'CHF', '.'],
                [/zł/gmi, 'PLN', ',']
            ];

            var currency = null;
            var decimal = null;
            for (var i = 0; i < currencyConfig.length; i++) {
                var settingRow = currencyConfig[i];
                if (settingRow[0].test(priceText)) {
                    currency = settingRow[1];
                    decimal = settingRow[2];
                    priceText = priceText.replace(settingRow[0], '');
                    break;
                }
            }
            if (currency === null || decimal === null) {
                throw new Error('getPriceObj can not find currency (USD, RUB)');
            }

            var price = priceText.toLowerCase().match(/[\d.,-]+/gmi).join('').split('-');
            if (!price || !(price.length === 1 || price.length === 2) || !price[0]) {
                throw new Error('getPriceObj can not match');
            }

            var regex = new RegExp('[^0-9-' + decimal + ']', ['g']);

            var priceMin = parseFloat(price[0].replace(regex, '').replace(decimal, '.'));
            var priceMax = priceMin;
            if (price[1]) {
                priceMax = parseFloat(price[1].replace(regex, '').replace(decimal, '.'));
            }
            if (priceMin > priceMax) {
                throw new Error('getPriceObj priceMin > priceMax');
            }
            if (!(priceMin > 0 && priceMax > 0)) {
                throw new Error('getPriceObj priceMin or priceMax less or equal 0');
            }
            return {currency: currency, priceMin: priceMin, priceMax: priceMax};
        } catch (e) {
            console.log('Error', e);
            return {currency: null, priceMin: null, priceMax: null};
        }
    }

    /**
     *
     * @returns {*|jQuery}
     */
    function getPriceStrAliexpress() {
        var priceStr = $('.product-multi-price-main #j-multi-currency-price, .product-multi-price-main span[itemprop="priceCurrency"]').text();
        if (!priceStr) {
            priceStr = $('.p-price-content .p-symbol, .p-price-content .p-price').text();
        }

        if (!priceStr) {
            priceStr = $('div.p-price span.p-price').text();
        }

        if (!priceStr) {
            priceStr = $('.detail-price-container .price-span').text();
        }
        return priceStr;
    }

    /**
     *
     * @param domainPrice
     * @returns {{}}
     */
    self.getPrice = function (domainPrice) {

        if (domainPrice && domainPrice.length > 0) {
            var obj = {};
            switch (domainPrice) {
                case 'aliexpress':
                    obj = getPriceAliexpress($('body').text());
                    break;
                case 'gearbest':
                case 'ru.gearbest':
                    obj = getPriceGearbest();
                    break;
                case 'banggood':
                    obj = getPriceBanggood();
                    break;
                case 'us.banggood':
                case 'eu.banggood':
                    obj = getPriceUsEuBanggood();
                    break;
                case 'lightinthebox':
                case 'miniinthebox':
                    obj = getPriceLightinthebox();
                    break;
                case 'tomtop':
                    obj = getPriceTomtop($('body').text());
                    break;
            }
        }

        obj.timezone = getTimeZoneOffset();
        return obj;
    };

    return self;
})();

String.prototype.matchAll = function (regexp) {
    var matches = [];
    this.replace(regexp, function () {
        var arr = ([]).slice.call(arguments, 0);
        var extras = arr.splice(-2);
        arr.index = extras[0];
        matches.push(arr);
    });
    return matches.length ? JSON.parse(JSON.stringify(matches)) : null;
};

URL.prototype.isEqual = function (domain) {
    const host = this.host.split('.');
    const loc = decodeURIComponent(new URL(domain.replace('*', '_')).host).split('.');

    if (host.length === loc.length) {
        return host.length === loc.filter((part, index) => {
            if(part === '_') {
            return true;
        }
        return part === host[index];
    }).length;
    }
};

function log() {//custom log
    if (DEBUG && console.info) {
        console.info.apply(null, arguments);
    }
}

function warn() {//custom warn
    if (DEBUG && console.warn) {
        console.warn.apply(null, arguments);
    }
}

function error() {//custom error
    if (DEBUG && console.error) {
        console.error.apply(null, arguments);
    }
}