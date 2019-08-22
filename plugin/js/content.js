var usersData = false;
var userLanguage = false;
//var appCookieName = 'secretdiscounter-extension-window';
//var appCookieValue = 'hidden';
var isOpera = navigator.userAgent.indexOf(' OPR/') >= 0;
var repeatTimes=false;
var appIds = {
  'chrome': {
    'id': 'sd_chrome_app',
    'search_delay': 0
  },
  'firefox': {
    'id': 'sd_firefox_app',
    'search_delay': 0
  },
  'opera': {
    'id': 'sd_opera_app',
    'search_delay': 100
  },
  'yandex': {
    'id': 'sd_yandex_app',
    'search_delay': 100
  }
};
var currentBrowser = 'chrome';
if (navigator.userAgent.indexOf(' OPR/') >= 0) {
  currentBrowser = 'opera';
} else if (navigator.userAgent.indexOf(' YaBrowser/') >= 0) {
  currentBrowser = 'yandex';
} else if (!!window.chrome && !!window.chrome.webstore) {
  currentBrowser = 'chrome';
} else if (typeof InstallTrigger !== 'undefined') {
  currentBrowser = 'firefox';
}
if (debug) {
  console.log(currentBrowser)
}


function closeClick() {
  var store = this.getAttribute('data-store');
  storeUtil.setPopupClosed(store);
  document.querySelector('.secretdiscounter-extension').style.display = 'none';
}

function getUsers() {
  if (debug) {
     console.log('getusers');
  }
  chrome.runtime.sendMessage({
    action: 'sd_xhttp',
    url: siteUrl + utils.href(userUrl)
  }, function (responseData) {
      if (debug) {
        console.log('getusers success', responseData);
      }
      var lng = false;
      usersData = responseData;
      if (responseData.user) {
          lng = usersData && usersData.user && usersData.user.language ? usersData.user.language : false;
      } else if (responseData.language) {
          lng = responseData.language;
      }
      if (lng) {
          //получили из оккаунта язык
          language = lng;
          userLanguage = lng;
          if (Storage._loaded) {
              //cохранить в storage;
              Storage.set(storageDataKeyLanguageCurrent, language);
          }

      }
  });
}

function changeFavorite(e) {
  e.preventDefault();
  var that = this;
  var storeId = that.getAttribute('data-id');
  var type = that.getAttribute('data-type');
  that.onclick = null;
  chrome.runtime.sendMessage({
    action: 'sd_xhttp',
    method: 'POST',
    url: siteUrl + utils.href(userFavoriteUrl),
    data: {'affiliate_id': storeId, 'type': type}
  }, function (responseData) {
    //console.log('changeFavorites success', responseData);
    that.onclick = changeFavorite;
    if (responseData && !responseData.error) {
      if (type === 'add') {
        usersData.user.favorites.push(storeId);
      } else {
        var index = usersData.user.favorites.indexOf(storeId);
        if (index > -1) {
          usersData.user.favorites.splice(index, 1);
        }
      }
      displayFavoriteLinks(storeId);
    }
  });
}

function displayFavoriteLinks(storeId) {
  var elemAdd = document.querySelector('.secretdiscounter-extension__shop .favorite-add');
  var elemRemove = document.querySelector('.secretdiscounter-extension__shop .favorite-remove');

  if (!usersData || !usersData.user) {
    if (elemAdd) {
      elemAdd.classList.add('sd_hidden');
    }
    if (elemRemove) {
      elemRemove.classList.add('sd_hidden');
    }
    return null;
  }
  if (!usersData.user.favorites || usersData.user.favorites.indexOf(storeId) < 0) {
    if (elemAdd) {
      elemAdd.classList.remove('sd_hidden');
    }
    if (elemRemove) {
      elemRemove.classList.add('sd_hidden')
    }
  } else {
    if (elemAdd) {
      elemAdd.classList.add('sd_hidden');
    }
    if (elemRemove) {
      elemRemove.classList.remove('sd_hidden');
    }
  }

}

function findShop() {
  if (debug) {
    console.log('findShop');
  }

  //надо дождаться, когда будут пользователи
  if (usersData !== false) {
    //находим в данных текущий шоп, если нашли то коллбэк
      if(storageDataStores && storageDataStores.stores) {
          storeUtil.findShop(storageDataStores.stores, false, displayShop);
      }
  } else {
    //если пользователей нет, то ждём
    var tryCount = 10;
    var findShopInterval = setInterval(function () {
      tryCount--;
      if (debug) {
          console.log(usersData);
      }
      if (usersData !== false) {
        //находим в данных текущий шоп, если нашли то коллбэк
        if(storageDataStores && storageDataStores.stores) {
              storeUtil.findShop(storageDataStores.stores, false, displayShop);
        }
        clearInterval(findShopInterval);
      }
      if (tryCount < 0) {
        clearInterval(findShopInterval);
      }
    }, 1000);
  }

}

function testDisplayPage(display){
    //показывать ли на странице шопа
    if (debug) {
        console.log('display on page '+(display === undefined || display === null || display == 1 || display == 3));
    }
    return display === undefined || display === null || display == 1 || display == 3;
}

function displayShop(item) {

  if (!testDisplayPage(item.display)) {
    return;
  }
  if (item) {
      chrome.runtime.sendMessage({
          action: 'icon_flash_start',
          cashback: utils.makeCashback(item.displayed_cashback, item.currency, item.action_id, true),
          tab_url: window.location.href
      });
      setTimeout(function () {
          chrome.runtime.sendMessage({action: 'icon_flash_stop'});
      }, 5000);
  }


  div = document.querySelector('.secretdiscounter-extension');

  //есть шоп и нет див и (дебаг или (попап на шопе не закрыт  и шоп не активирован)
  if (item && !div && (debug || (!storeUtil.popupClosed(item.store_route) && !storeUtil.isActivated(item.store_route)))) {

    var url = '', pluginSiteUrl = '', favoritesLink = '', storesUrl = '';
    if (usersData && usersData.user) {
      url = frontUrl + utils.href('goto/store:' + item.uid);
      storesUrl = frontUrl + utils.href('stores');
      pluginSiteUrl = frontUrl + utils.href('');
      favoritesLink = '<a title="'+lg('add_to_favorite')+'" data-id="' + item.uid + '" data-type="add" class="favorite-add" href="'+utils.href('#vaforite_add')+'">' + iconFavoriteClose + '</a>' +
        '<a title="'+lg('remove_from_favorite')+'" data-id="' + item.uid + '" data-type="delete" class="sd_hidden favorite-remove" href="'+utils.href('#vaforite_remove')+'">' + iconFavoriteOpen + '</a>';
    } else {
      url = frontUrl + utils.href('stores/' + item.store_route + '#login');
      pluginSiteUrl = frontUrl + utils.href('#login');
      storesUrl = frontUrl + utils.href('stores#login');
    }
    //var message = utils.replaceTemplate(storageDataStores.searchtext, {'cashback': utils.makeCashback(item.displayed_cashback, item.currency, item.action_id)});
    var message = lg('searchtext {{cashback}}', {'cashback': utils.makeCashback(item.displayed_cashback, item.currency, item.action_id)});
    var storeIsActivate = storeUtil.isActivated(item.store_route);
    //var template = parseFloat(item.displayed_cashback.replace(/[^\d.]+/g,"")) > 0 ? storePluginHtml : storePluginHtmlCharity;
    var shopDiv = utils.replaceTemplate(storePluginHtml, {
      'storeLogo': frontUrl + 'images/logos/' + item.logo,
      'storeUrl': url,
      'storeText': message,
      'siteUrl': pluginSiteUrl,
      'favoritesLink': favoritesLink,
      'logoImage': logoImage,
      'storeRoute' : item.store_route,
      'buttonsClass' : storeIsActivate ? 'sd_hidden' : '',
      'storesUrl' : storesUrl,
      'buttonText': lg('activate_cashback'),
      'buttonMessage': lg('store_will_open_in_new_window')
    });
    div = document.createElement('div');
    div.className = 'secretdiscounter-extension';
    div.innerHTML = shopDiv;
    //div.style.right = document.body.clientWidth > 1200 ? (document.body.clientWidth - 1200) / 2 + 'px' : 0;
    div.style.right = '20px';
    div.style.top = '10px';

    var tryCount = 10;
    var divInsertInterval = setInterval(function () {
      tryCount--;
      var body = document.body;
      if (body) {
        clearInterval(divInsertInterval);
        body.insertBefore(div, body.firstChild);
        document.querySelector('.secretdiscounter-extension__button_close').onclick = closeClick;
        if (usersData && usersData.user) {
          document.querySelector('.secretdiscounter-extension__shop-favorites .favorite-add').onclick = changeFavorite;
          document.querySelector('.secretdiscounter-extension__shop-favorites .favorite-remove').onclick = changeFavorite;
        }
        displayFavoriteLinks(item.uid);
        utils.makeHrefs(document.querySelector('.secretdiscounter-extension__buttons'), utils.doClickPlugunClose);//меняем отработчик ссылки не активацию на свой
      }
      if (tryCount < 0) {
        clearInterval(divInsertInterval);
      }
    }, 1000);


  }
}


function setAppId() {

  var div = document.createElement('div');
  div.id = appIds[currentBrowser].id;
  div.style = 'display:none;';
  document.body.appendChild(div);
  if (debug) {
    console.log(appIds[currentBrowser]);
  }
}

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : false;
}

//получаем пользователя
getUsers();

var appVersion = chrome.runtime.getManifest().version;

Storage.load(function () {
  storageDataDate = Storage.get(storageDataKeyDate);
  storageDataStores = Storage.get(storageDataKeyStores);
  storageDataVersion = Storage.get(storageDataKeyVersion);
  storageDataLanguage = Storage.get(storageDataKeyLanguage);
  var lng = Storage.get(storageDataKeyLanguageCurrent);
  if (userLanguage && lng !== userLanguage) {
     lng = userLanguage;
     Storage.set(storageDataKeyLanguageCurrent, lng);
  }
  if (lng) {
    language = lng;
  }
  if (debug) {
    console.log('storage load', storageDataStores, storageDataDate, storageDataVersion, storageDataLanguage, lng);
    console.log(appVersion);
  }
  if (!storageDataDate || !storageDataStores || !storageDataVersion|| !storageDataLanguage
    //|| storageDataDate + 1000 * 60 * 60 * 24 < new Date().getTime()
    || (new Date().getTime() - storageDataDate)/(1000 * 3600) > 24 //больше 24 часов с момента загрузки
    || storageDataVersion !== appVersion
    || storageDataLanguage !== language
  ) {
      if (debug) {
        console.log('start load data from server');
      }

    getData(findShop);
    //поиск шопа или после загрузки данных
  } else {
    findShop();
    //или сразу
  }
});

chrome.runtime.sendMessage({action: 'icon_flash_clear'});

//window.onload = analizPage;
document.addEventListener("DOMContentLoaded", analizPage);//в firefox window.onload = не хочет работать

function analizPage() {
  if (debug) {
    console.log('analize Page');
  }

  storeUtil.analizeActivated();//проверка что goto пройдено

  setAppId();

  searchAnalize.analize();//проверка поиска

  searchAnalize.yandexHandlerSet();//установка события для яндекс

  //if(debug) Storage.clear();//для тестов удалить, чтобы при загрузке получить снова
}






