var storeUtil = (function () {

  function clearURL(url) {
    url = url.toLowerCase();
    url = url.split('//');
    if (url.length > 1) {
      url = url[1];
    } else {
      url = url[0];
    }
    url = url
      .replace('www.', '')
      .split('/')[0]
      .split('?')[0];
    return url;
  }

  function testURL(here, currentUrl, subdomen) {
    subdomen = subdomen || false;
    currentUrl = clearURL(currentUrl);
    //тест полного совпадения
    if (here === currentUrl) {
      return  true;
    }

    if (subdomen) {
        //проверка на частичное совпадение
        var pos = here.indexOf(currentUrl);
        if (pos < 0) return false;

        //проверка на суб домен перед URL
        if (here[pos - 1] != '.') return false;
        //Проверка домена с отсечкой суба
        if (here.substr(pos) == currentUrl) {
            return true;
        }
    }
    return false;
  }

  function findShop(stores, url, callback) {
    //console.log('поиск шопа', storageDataStores, url);
    if (!stores || stores.length === 0) {
      return null;
    }
    //найти магазин, если на нем находимся
    url = url || window.location.host;
    var here = clearURL(url);
    var store = false;
    //первый проход на точные совпадения
    stores.forEach(function (item) {
      if (!store && testURL(here, item.url, false)) {
        store = true;
        callback(item);
        return false;
      }
      if (!store && item.url_alternative && item.url_alternative.length > 3) {
        var urls = item.url_alternative.split(',');
        for (var i = 0; i < urls.length; i++) {
          if (testURL(here, urls[i]), false) {
            store = true;
            callback(item);
            return false;
          }
        }
      }
    });
    //если не нашли, второй по субдоменам
    if (!store) {
        stores.forEach(function (item) {
            if (!store && testURL(here, item.url, true)) {
                store = true;
                callback(item);
                return false;
            }
            if (!store && item.url_alternative && item.url_alternative.length > 3) {
                var urls = item.url_alternative.split(',');
                for (var i = 0; i < urls.length; i++) {
                    if (testURL(here, urls[i], true)) {
                        callback(item);
                        return false;
                    }
                }
            }
        });
    }
  }

  function analizeActivated() {
      //проверка, что на странице имеется див с атрибутом
      var shopId = document.querySelector('#sd_shop_id');
      if (debug) {
          console.log('див для goto ',shopId);
      }
      if (shopId && shopId.getAttribute('code')) {
          Storage.set(storeActiveStorageName + shopId.getAttribute('code'), new Date().getTime());
          if (debug) {
              console.log(storeActiveStorageName + shopId.getAttribute('code')+' '+Storage.get(storeActiveStorageName + shopId.getAttribute('code')));
          }
      }
  }

  return {
    findShop: findShop,
    analizeActivated: analizeActivated
  };


})();