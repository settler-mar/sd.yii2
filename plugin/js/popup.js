utils.makeHrefs(document);//события для ссылок на форме

var usersData;
var userLanguage = false;


function getUser(callback) {
  //вызываем событие для запроса из background.js
  chrome.runtime.sendMessage({
    action: 'sd_xhttp',
    url: siteUrl + utils.href(userUrl)
  }, function (responseData) {
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
      if (debug) {
          console.log(lng, language);
      }
      callback();
  });
}
function getCoupons(shop, callback) {
  //вызываем событие для запроса из background.js
  if (!shop || !shop.store_route) {
    return null;
  }
  chrome.runtime.sendMessage({
    action: 'sd_xhttp',
    url: siteUrl + utils.href(couponUrl + '/' + shop.store_route)
  }, function (responseData) {
    //console.log(siteUrl + utils.href(couponUrl + '/' + shop.store_route),responseData);
    callback(responseData);
  });
}


var displayUser = function () {
  if (usersData && usersData.user) {
    // var lng = usersData.user.language;
    // if (lng) {
    //   //получили из оккаунта язык
    //   language = lng;
    //   //cохранить в storage;
    //   Storage.set(storageDataKeyLanguageCurrent, language);
    // }

    document.querySelector('.secretdiscounter-pupup').classList.remove('logout');
    document.querySelector('.secretdiscounter-pupup__info-logo-circle').innerHTML = '<img class="secretdiscounter-pupup__info-logo-img" src="' + utils.getAvatar(usersData.user.photo) + '"/>';
    document.querySelector('.secretdiscounter-pupup__info-balance').innerHTML =
        '<span class="secretdiscounter-pupup__info-balance-current">'+usersData.user.balance.current+'</span>'+
        '<span class="secretdiscounter-pupup__info-balance-pending">'+
        (usersData.user.balance.pending ? '&nbsp;/&nbsp;'+usersData.user.balance.pending: '')+
        '&nbsp;'+usersData.user.currency+'</span>';
    //document.querySelector('.secretdiscounter-pupup__tab-favorites').style.display = 'block';
    document.querySelector('.secretdiscounter-pupup__tab-notifications').style.display = 'block';
    //document.querySelector('.secretdiscounter-pupup__tab-shop').style.display = 'block';
    document.querySelector('.secretdiscounter-pupup__login').style.display = 'none';
    document.querySelector('.secretdiscounter-pupup__logo-link').setAttribute('href', siteUrl + utils.href(''));
    document.querySelector('.secretdiscounter-pupup__info').style.display = 'flex';
    var tabNotifications = document.querySelector('.secretdiscounter-pupup__tab-notifications .secretdiscounter-pupup__tab-content');
    tabNotifications.innerHTML = makeNotifications();
    utils.makeHrefs(tabNotifications);
    var tabFavorites = document.querySelector('.secretdiscounter-pupup__tab-favorites .secretdiscounter-pupup__tab-content');
    tabFavorites.innerHTML = makeFavorites();
    utils.makeHrefs(tabFavorites);
  } else {
    document.querySelector('.secretdiscounter-pupup__tabs').style.display="none";
    resetStyles();
  }
  document.querySelector('.secretdiscounter-pupup').style.display = 'block';
  document.querySelector('.secretdiscounter-pupup__tab-shop .secretdiscounter-pupup__tab-checkboxtab').checked = true;

};

function resetStyles() {
  document.querySelector('.secretdiscounter-pupup').classList.add('logout');
  document.querySelector('.secretdiscounter-pupup__logo-link').setAttribute('href', siteUrl + utils.href('#login'));
  document.querySelector('.secretdiscounter-pupup__logo-link').innerHTML = logoImage;
  document.querySelector('.secretdiscounter-pupup__info').style.display = 'none';
  document.querySelector('.secretdiscounter-pupup__login').style.display = 'block';
  document.querySelector('.secretdiscounter-pupup__tab-favorites').style.display = 'none';
  document.querySelector('.secretdiscounter-pupup__tab-coupons').style.display = 'none';
  document.querySelector('.secretdiscounter-pupup__tab-notifications').style.display = 'none';
  //document.querySelector('.secretdiscounter-pupup__tab-notifications .secretdiscounter-pupup__tab-checkboxtab').checked = true;
  document.querySelector('.secretdiscounter-pupup__tab-shop').style.display = 'none';
  document.querySelector('.secretdiscounter-pupup__tab-notifications .secretdiscounter-pupup__tab-content').innerHTML = '';
  document.querySelector('.secretdiscounter-pupup__tab-favorites').style.display = 'block';
  //document.querySelector('.secretdiscounter-pupup__tab-favorites .secretdiscounter-pupup__tab-checkboxtab').checked = true;
  document.querySelector('.secretdiscounter-pupup__tab-favorites .secretdiscounter-pupup__tab-content').innerHTML = lg('refreshing_data');
}


function makeFavorites() {
  //console.log(usersData.user);
  if (!usersData || !usersData.user.favorites_full || usersData.user.favorites_full.length == 0) {
    //document.querySelector('.secretdiscounter-pupup__tab-notifications .secretdiscounter-pupup__tab-checkboxtab').checked = true;
    return lg('you_have_not_favorites');
  }
  result = '';
  for (var i = 0; i < usersData.user.favorites_full.length; i++) {
    var storeIsActivate = storeUtil.isActivated(usersData.user.favorites_full[i].route);
    result += utils.replaceTemplate(favoriteHTML, {
      'storeLogo': siteUrl + 'images/logos/' + usersData.user.favorites_full[i].logo,
      'storeText': utils.makeCashback(
        usersData.user.favorites_full[i].displayed_cashback,
        usersData.user.favorites_full[i].currency,
        usersData.user.favorites_full[i].action_id
      ),
      'storeUrl': siteUrl + utils.href('goto/store:' + usersData.user.favorites_full[i].uid),
      'storeRoute' : utils.href(usersData.user.favorites_full[i].route),
      'buttonClass' : storeIsActivate ? 'sd_hidden' : '',
      'cashback': lg('cashback'),
      'buttonText': lg('activate_cashback_to_line')
    });
  }
  result += '<div class="secretdiscounter-extension__notification-button"><a class="secretdiscounter-extension__link" href="' + siteUrl + '/stores">'+lg('all_stores')+'</a></div>';
  return result;

}
function makeNotifications() {
  //console.log(usersData);
  if (!usersData || !usersData.notifications) {
    return '';
  }
  result = '';
  for (var i = 0; i < usersData.notifications.length; i++) {
    result += utils.replaceTemplate(notificationHTML, {
      'notyDate': usersData.notifications[i].data,
      'notyTitle': usersData.notifications[i].title,
      'notyText': usersData.notifications[i].text
    });
  }
  if (usersData.btn) {
    result += '<div class="secretdiscounter-extension__notification-button"><a class="secretdiscounter-extension__link" href="' + siteUrl + utils.href(userUrl) + '">' + usersData.btn + '</a></div>';
  }
  return result;
}


var displayShop = function (shop) {
  if (debug) {
    console.log('вывод шопа', shop);
  }

  var tabShop = document.querySelector('.secretdiscounter-pupup__tab-shop');
  tabShop.style.display = 'block';
  document.querySelector('.secretdiscounter-pupup__tab-shop .secretdiscounter-pupup__tab-checkboxtab').checked = true;
  //var storeTemplate = storeHtml;//который из шаблонов

  if (shop) {
      var storeIsActivate = storeUtil.isActivated(shop.store_route);
      if (debug) {
          console.log('шоп активирован ', storeIsActivate);
      }
      document.querySelector('.secretdiscounter-pupup__tab-shop .secretdiscounter-pupup__tab-content').innerHTML =
          utils.replaceTemplate(storeHtml, {
              'storeLogo': siteUrl + 'images/logos/' + shop.logo,
              'storeText': utils.makeCashback(
                  shop.displayed_cashback,
                  shop.currency,
                  shop.action_id
              ),
              'storeUrl': siteUrl + utils.href('goto/store:' + shop.uid),
              'btnText': lg('activate_cashback'),
              'storeTariffs': shop.conditions ?
                  '<div class="secretdiscounter-extension__buttons-tariffs-header">'+lg('terms_and_conditions')+':</div>' + shop.conditions : '',
              'storeRoute' : utils.href(shop.store_route),
              'buttonsClass': storeIsActivate ? 'sd_hidden' : '',
              'cashback': lg('cashback'),
              'buttonMessage': lg('store_will_open_in_new_window')
          });
      getCoupons(shop, displayCoupons);//запрос на купоны для шопа
  } else {
    //вывод пустого шопа, если находимся на любой странице
      document.querySelector('.secretdiscounter-pupup__tab-shop .secretdiscounter-pupup__tab-content').innerHTML =
          utils.replaceTemplate(storeHtmlEmpty, {
              'emptyCashbackMessage':lg('this_store_has_no_cashback'),
              'allStores':lg('all_stores_with_cashback')
          });
  }
  utils.makeHrefs(tabShop);
};

var displayCoupons = function (response) {
  if (debug) {
    console.log('вывод купонов', response);
  }
  if (response.coupons && response.coupons.length) {
    var html = '';
    for (var i = 0; i < response.coupons.length; i++) {
      //console.log(response.coupons[i]);
      html += utils.replaceTemplate(couponHtml, {
        'couponName': response.coupons[i].name,
        'couponDateEnd': response.coupons[i].date_end,
        //'couponUsed': response.coupons[i].visit,
        'couponPromocode': response.coupons[i].promocode ?
            response.coupons[i].promocode+'<span title="'+lg('copy_to_clipboard')+'"  class="secretdiscounter-extension__coupon-promocode-text-copy sd_button copy-clipboard" data-clipboard="'+response.coupons[i].promocode+'">'+iconCopy+'</span>' :
            lg('code_not_required'),
        'couponUseLink': siteUrl + utils.href('goto/coupon:' + response.coupons[i].uid),
        'couponUrl': siteUrl + utils.href('coupons/' + response.coupons[i].store_route + '/' + response.coupons[i].uid),
        'storeRoute': utils.href(response.coupons[i].store_route),
        'dateExpireMessage': lg('coupon_date_end'),
        'promocodeText': lg('coupon'),
        'usePromocode': lg('use_coupon_code')
      });
    }
    var tabCoupons = document.querySelector('.secretdiscounter-pupup__tab-coupons .secretdiscounter-pupup__tab-content');
    tabCoupons.innerHTML = html;
    utils.makeHrefs(tabCoupons);
    utils.setClickHandlers(tabCoupons, 'copy-clipboard', utils.copyToClipboard);
    document.querySelector('.secretdiscounter-pupup__tab-coupons').style.display = 'block';
  }

};
//смена языка для html
var htmlLanguage = function(){
  var items = document.getElementsByClassName('language_item');
  var text, href;
  for (var i=0 ; i < items.length ; i++) {
      text = lg(items[i].getAttribute('data-language'));
      items[i].innerHTML = text;
  }
  items = document.getElementsByClassName('language_item-href');
  for (i=0 ; i < items.length ; i++) {
      href = lg(items[i].getAttribute('data-href'));
      items[i].setAttribute('href', siteUrl + utils.href(href));
  }
};

//после загрузки данных
var refreshData = function(){
    htmlLanguage();
    storeUtil.findShop(storageDataStores.stores, tabUrl, displayShop);
};

resetStyles();

displayShop(false);//пустой магазин

getUser(displayUser);

var appVersion = chrome.runtime.getManifest().version;

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    tabUrl = tabs[0].url;
    if (debug) {
        console.log('получили урл текущей вкладки' + tabUrl);
    }

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
            console.log('storage load');
        }
        if (!storageDataDate || !storageDataStores || !storageDataVersion
            || storageDataDate + 1000 * 60 * 60 * 24 < new Date().getTime()
            || storageDataVersion !== appVersion
            || storageDataLanguage !== language
        ) {
            getData(refreshData());
            //поиск шопа и смена языка или после загрузки данных
        } else {
            refreshData();
            //или сразу
        }

    });
});





