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

  function testURL(here, currentUrl) {
    //console.log(here, currentUrl);

    currentUrl = clearURL(currentUrl);
    //тест полного совпадения
    if (here === currentUrl)return true;

    //проверка на частичное совпадение
    var pos = here.indexOf(currentUrl);
    if (pos < 0)return false;

    //проверка на суб домен перед URL
    if(here[pos-1]!='.') return false;
    //Проверка домена с отсечкой суба
    if(here.substr(pos)==currentUrl) return true;
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
    stores.forEach(function (item) {
      if (testURL(here, item.url)) {
        callback(item);
        return false;
      }

      if (item.url_alternative && item.url_alternative.length > 3) {
        var urls = item.url_alternative.split(',');
        for (var i = 0; i < urls.length; i++) {
          if (testURL(here, urls[i])) {
            callback(item);
            return false;
          }
        }
      }
    });
  }

  return {
    findShop: findShop
  };


})();