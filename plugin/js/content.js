var usersData = false;
var debug = true;
var appCookieName = 'secretdiscounter-extension-window';
var appCookieValue = 'hidden';
var isOpera = navigator.userAgent.indexOf(' OPR/') >= 0;
var appIds = {
  'chrome': {
    'id': 'sd_chrome_app',
    //'used': !!window.chrome && !!window.chrome.webstore
    //'used': window.chrome !== null && window.chrome.webstore !== null && !isOpera,
    'search_delay': 0
  },
  'firefox': {
    'id': 'sd_firefox_app',
    //'used':  typeof InstallTrigger !== 'undefined',
    'search_delay': 0
  },
  'opera': {
    'id': 'sd_opera_app',
    //'used': isOpera,
    'search_delay': 100
  }
};
var currentBrowser = 'chrome';
if (navigator.userAgent.indexOf(' OPR/') >= 0) {
  currentBrowser = 'opera';
} else if (!!window.chrome && !!window.chrome.webstore) {
  currentBrowser = 'chrome';
} else if (typeof InstallTrigger !== 'undefined') {
  currentBrowser = 'firefox';
}

var searchEngines = {
  'google': {
    'search_selector': '#lst-ib',
    'location_href': 'google',
    'location_href_index': 1,
    'result_selector': '#res',
    'result_first_item': 1,
    'repeat': 0,
    'styles': ''
  },
  'bing': {
    'search_selector': '#sb_form_q',
    'location_href': 'bing',
    'location_href_index': 1,
    'result_selector': '#b_results',
    'result_first_item': 0,
    'repeat': 0,
    'styles': 'margin-left:5px;'
  },
  'yandex': {
    'search_selector': 'div.serp-header__main input.input__control',
    'location_href': 'yandex',
    'location_href_index': [0, 1],
    'result_selector': '.serp-list',
    'result_first_item': 0,
    'dom_change_selector': '.main .main__center .main__content',
    'repeat': 5, //повтор вывода
    'styles': 'margin-left:-40px;'
  }
};


function closeClick() {
  document.querySelector('.secretdiscounter-extension').style.display = 'none';
  document.cookie = appCookieName + '=' + appCookieValue;
}

function getUsers() {
  console.log('getusers');
  chrome.runtime.sendMessage({
    action: 'sd_xhttp',
    url: siteUrl + userUrl
  }, function (responseData) {
    console.log('getusers success', responseData);
    usersData = responseData;

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
    url: siteUrl + userFavoriteUrl,
    data: {'affiliate_id': storeId, 'type': type}
  }, function (responseData) {
    //console.log('changeFavorites success', responseData);
    that.onclick = changeFavorite;
    if (!responseData.error) {
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
  if (!usersData || !usersData.user) {
    document.querySelector('.secretdiscounter-extension__shop a[href="#vaforite_add"]').className = 'sd_hidden';
    document.querySelector('.secretdiscounter-extension__shop a[href="#vaforite_remove"]').className = 'sd_hidden';
    return null;
  }
  if (!usersData.user.favorites || usersData.user.favorites.indexOf(storeId) < 0) {
    document.querySelector('.secretdiscounter-extension__shop a[href="#vaforite_add"]').className = '';
    document.querySelector('.secretdiscounter-extension__shop a[href="#vaforite_remove"]').className = 'sd_hidden';
  } else {
    document.querySelector('.secretdiscounter-extension__shop a[href="#vaforite_add"]').className = 'sd_hidden';
    document.querySelector('.secretdiscounter-extension__shop a[href="#vaforite_remove"]').className = '';
  }

}

function findShop() {
  console.log(findShop);
  if (!debug && getCookie(appCookieName) !== appCookieValue) {
    //надо дождаться, когда будут пользователи
    if (usersData !== false) {
      //находим в данных текущий шоп, если нашли то коллбэк
      storeUtil.findShop(storageDataStores.stores, false, displayShop);
    } else {
      //если пользователей нет, то ждём
      var tryCount = 10;
      var findShopInterval = setInterval(function () {
        tryCount--;
        console.log(usersData);
        if (usersData !== false) {
          //находим в данных текущий шоп, если нашли то коллбэк
          storeUtil.findShop(storageDataStores.stores, false, displayShop);
          clearInterval(findShopInterval);
        }
        if (tryCount < 0) {
          clearInterval(findShopInterval);
        }
      }, 1000);
    }
  }
}

function displayShop(item) {
  div = document.querySelector('.secretdiscounter-extension');
  if (item && !div) {

    var url = '', pluginSiteUrl = '', favoritesLink = '';
    if (usersData && usersData.user) {
      url = siteUrl + 'goto/store:' + item.uid;
      pluginSiteUrl = siteUrl;
      favoritesLink = '<a title="Добавить в избранное" data-id="' + item.uid + '" data-type="add" class="" href="#vaforite_add">' + iconFavoriteClose + '</a>' +
        '<a title="Убрать из избранных" data-id="' + item.uid + '" data-type="delete" class="sd_hidden" href="#vaforite_remove">' + iconFavoriteOpen + '</a>';
    } else {
      url = siteUrl + 'stores/' + item.store_route + '#login';
      pluginSiteUrl = siteUrl + '#login';
    }
    var message = utils.replaceTemplate(storageDataStores.searchtext, {'cashback': utils.makeCashback(item.displayed_cashback, item.currency, item.action_id)});
    var shopDiv = utils.replaceTemplate(storePluginHtml, {
      'storeLogo': siteUrl + 'images/logos/' + item.logo,
      'storeUrl': url,
      'storeText': message,
      'siteUrl': pluginSiteUrl,
      'favoritesLink': favoritesLink,
      'logoImage': siteUrl + 'images/templates/logo_sd_horizontal_white_thin.svg'
    });
    div = document.createElement('div');
    div.className = 'secretdiscounter-extension';
    div.innerHTML = shopDiv;
    div.style.right = document.body.clientWidth > 1200 ? (document.body.clientWidth - 1200) / 2 + 'px' : 0;

    var tryCount = 10;
    var divInsertInterval = setInterval(function () {
      tryCount--;
      var body = document.body;
      if (body) {
        clearInterval(divInsertInterval);
        body.insertBefore(div, body.firstChild);
        document.querySelector('.secretdiscounter-extension__button_close').onclick = closeClick;
        if (usersData && usersData.user) {
          document.querySelector('.secretdiscounter-extension__shop-favorites  [href="#vaforite_add"]').onclick = changeFavorite;
          document.querySelector('.secretdiscounter-extension__shop-favorites  [href="#vaforite_remove"]').onclick = changeFavorite;
        }
        displayFavoriteLinks(item.uid);
      }
      if (tryCount < 0) {
        clearInterval(divInsertInterval);
      }
    }, 1000);


  }
}

//изменение поиска
function checkSearch(searchString, engine) {
  if (storageDataStores == null || storageDataStores.stores.length == 0) {
    return null;
  }
  var div = document.createElement('div');
  var message = false;
  storageDataStores.stores.forEach(function (item) {
    //проверка, что строка поиска включена в название или урл магазина
    if ((item.name.toUpperCase().indexOf(searchString) >= 0 || item.url.toUpperCase().indexOf(searchString) >= 0) && !message) {
      console.log(item, usersData);
      message = utils.replaceTemplate(storageDataStores.searchtext, {
        'cashback': utils.makeCashback(item.displayed_cashback, item.currency, item.action_id),
        'currentUrl': siteUrl + item.url,
        'storename': utils.ucfirst(item.name)
      });
      var url = '';
      if (usersData && usersData.user) {
        url = siteUrl + 'goto/store:' + item.uid;
      } else {
        url = siteUrl + 'stores/' + item.store_route + '#login';
      }
      div.innerHTML = "<a href='" + url + "'target='_blank'>" +
        // "<span style='margin-right:5px;height:18px;vertical-align:middle'>"+searchFormImage+"</span>"+message;
        searchFormImage + message;
      div.id = 'secretdiscounter-search';
      div.className = 'secretdiscounter-search';
      div.setAttribute('style', engine.styles);

      if (engine.repeat < 2) {
        //просто положить
        var searchResult = document.querySelector(engine.result_selector);
        if (searchResult && !document.querySelector('#secretdiscounter-search')) {
          //имеется блок, куда есть выкладывать и нет нашего блока
          var nextElement = engine.result_first_item ? searchResult.parentNode.childNodes[0] : searchResult;
          searchResult.parentElement.insertBefore(div, nextElement);
        }
      } else {
        //делаем повторы, если нет нашего блока
        var repeatTimes = engine.repeat;
        var searchResultInterval = setInterval(function () {
          var searchResult = document.querySelector(engine.result_selector);
          if (searchResult && !document.querySelector('#secretdiscounter-search')) {
            //имеется блок, куда есть выкладывать и нет нашего блока
            var nextElement = engine.result_first_item ? searchResult.parentNode.childNodes[0] : searchResult;
            searchResult.parentElement.insertBefore(div, nextElement);
          }
          repeatTimes--;
          if (repeatTimes < 1) {
            clearInterval(searchResultInterval);
          }
        }, 1000);
      }
      return false;
    }
  })
}

function setAppId() {

  var div = document.createElement('div');
  div.id = appIds[currentBrowser].id;
  div.style = 'display:none;';
  document.body.appendChild(div);
  console.log(appIds[currentBrowser]);
}

function checkLocation(href, index, key) {
  if (index instanceof Array) {
    for (var i = 0; i < index.length; i++) {
      if (href[index[i]] === key) {
        return true;
      }
    }
  } else if (typeof(index) === 'number') {
    return href[index] === key
  }
  return false;
}

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : false;
}


//console.log('start');

//получаем пользователя
getUsers();

Storage.load(function () {
  storageDataDate = Storage.get(storageDataKeyDate);
  storageDataStores = Storage.get(storageDataKeyStores);
  if (!storageDataDate || !storageDataStores
    || storageDataDate + 1000 * 60 * 60 * 24 < new Date().getTime()) {
    //||storageData.date + 100 < new Date().getTime() ) {
    getData(findShop());
    //поиск шопа или после загрузки данных
  } else {
    findShop();
    //или сразу
  }
});


window.onload = function () {
  setAppId();

  //событие для яндекса при повторном поиске
  var yandexDomElementChange = document.querySelector(searchEngines.yandex.dom_change_selector);
  var yandexInput = document.querySelector(searchEngines.yandex.search_selector);
  if (yandexDomElementChange && yandexInput) {
    var yandexSearchTimeOut = null;
    yandexDomElementChange.addEventListener('DOMSubtreeModified', function () {
      if (yandexSearchTimeOut === null) {
        yandexSearchTimeOut = setTimeout(function () {
          clearTimeout(yandexSearchTimeOut);
          yandexSearchTimeOut = null;
        }, 8000);
        checkSearch(yandexInput.value.toUpperCase(), searchEngines.yandex);
        //запускаем, после этого XX сек. запуск невозможен
      }

    });
  }

  //для гугл,  бинг, яндекс(первый запрос)
  var locationHref = location.hostname.split('.');
  for (key in searchEngines) {
    var engine = searchEngines[key];
    var input = document.querySelector(engine.search_selector);
    if (input && checkLocation(locationHref, engine.location_href_index, engine.location_href)) {// locationHref[engine.location_href_index] == engine.location_href) {
      var value = input.value;
      if (value != null && value !== '') {
        if (appIds[currentBrowser].search_delay) {
          setTimeout(function () {
            checkSearch(value.toUpperCase(), engine);
          }, appIds[currentBrowser].search_delay);
        } else {
          checkSearch(value.toUpperCase(), engine);
        }
      }
      break;
    }
  }

  //Storage.clear();//для тестов удалить, чтобы при загрузке получить снова
};






