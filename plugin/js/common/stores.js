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

  function setShopActivated(storeRoute, status){
      status = status || true;
      if (status) {
          Storage.set(storeActiveStorageName + storeRoute, new Date().getTime());
      } else {
          Storage.remove(storeActiveStorageName + storeRoute);
      }
      if (debug) {
          console.log('активация шопа '+storeActiveStorageName + storeRoute+' '+Storage.get(storeActiveStorageName + storeRoute));
      }
  }

  function analizeActivated() {
      //проверка, что на странице имеется картинка с атрибутом
      var image = document.querySelector('.ad-detect');
      var store = image ? image.getAttribute('data-store-route') : false;
      var visible = image ? image.style.display !== 'none' : false;
      if (debug) {
          console.log('картинка для goto для шоп ' + (image ? ' yes ' : ' no ') + store + ' видимая ' + visible);
      }
      if (image && store && visible) {
          setShopActivated(store, true);
          var ifAddBlockExistsInterval = setInterval( function() {
              image = document.querySelector('.ad-detect');
              visible = image ? image.style.display !== 'none' : false;
              if (debug) {
                  console.log('проверка видимости картинки на goto ' + visible);
              }
              if (!visible) {
                  setShopActivated(store, false);
                  clearInterval(ifAddBlockExistsInterval)
              }
          }, 500);
      }
  }

  function isActivated(storeRoute){
    var storeActiveDate = Storage.get(storeActiveStorageName+storeRoute);
    var isActive = storeActiveDate !== null &&  new Date().getTime() - storeActiveDate < storeActiveInterval * 60 * 1000;
    if (debug) {
        console.log(storeActiveStorageName+storeRoute,  storeActiveDate, isActive, (new Date().getTime() - storeActiveDate)/(60 * 1000));
    }
    return isActive;
  }

  function setPopupClosedStatus(storeRoute, status) {
      status = status || true;
      var storageKey = storePopupClosedStorageName + storeRoute;
      if (status) {
          Storage.set(storageKey, new Date().getTime());
      } else {
          Storage.remove(storageKey);
      }
      if (debug) {
          console.log('статус попап шопа '+storageKey+' '+Storage.get(storageKey));
      }
  }

  function getPopupClosedStatus(storeRoute) {
      var storageKey = storePopupClosedStorageName + storeRoute;
      var storePopupCloseDate = Storage.get(storageKey);
      var closed = storePopupCloseDate !== null && new Date().getTime() - storePopupCloseDate < storePopupCloseInterval * 60 * 1000;
      if (debug) {
         console.log('Cтатус попап шопа '+storageKey+' закрыт - '+closed);
      }
      return closed;
  }

  return {
    findShop: findShop,
    analizeActivated: analizeActivated,
    isActivated: isActivated,
    setPopupClosed: setPopupClosedStatus,
    popupClosed: getPopupClosedStatus
  };


})();