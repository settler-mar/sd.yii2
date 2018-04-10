var storeHtml = '<div class="secretdiscounter-extension__shop"><img class="secretdiscounter-extension__shop-logo" src="{{storeLogo}}"/>'+
    '<div class="secretdiscounter-extension__shop-text">Кэшбэк{{storeText}}</div>'+
    '</div>'+
    '<div class="secretdiscounter-extension__buttons">'+
    '<div class="secretdiscounter-extension__buttons-tariffs">{{storeTariffs}}</div>'+
    '<a class="secretdiscounter-extension__link btn" href="{{storeUrl}}">{{btnText}}</a>'+
    'Магазин с активированным кэшбэком откроется в новом окне'+
    '</div>';
var notificationHTML = '<div class="secretdiscounter-extension__notificaton">'+
    '<div class="secretdiscounter-extension__notificaton-date">{{notyDate}}</div>'+
    '<div class="secretdiscounter-extension__notificaton-title">{{notyTitle}}</div>'+
    '<div class="secretdiscounter-extension__notificaton-text">{{notyText}}</div>'+
    '</div>';
var favoriteHTML ='<div class="secretdiscounter-extension__shop"><img class="secretdiscounter-extension__shop-logo" src="{{storeLogo}}"/>'+
    '<div class="secretdiscounter-extension__shop-text">Кэшбэк{{storeText}}</div>'+
    '<a class="secretdiscounter-extension__link btn" href="{{storeUrl}}">Активировать<br>кэшбэк</a>'+
    '</div>';

var storePluginHtml = '<div class="secretdiscounter-extension__header">'+
    '<a href="{{siteUrl}}" class="secretdiscounter-extension__logo"><img class="secretdiscounter-extension__logo-img" src="{{logoImage}}"/></a>'+
    '<div class="secretdiscounter-extension__button_close"><span class="secretdiscounter-extension__button_icon">&times;</span></div>'+
    '</div>'+
    '<div class="secretdiscounter-extension__shop"><img class="secretdiscounter-extension__shop-logo" src="{{storeLogo}}"/>'+
    '<div class="secretdiscounter-extension__shop-text">Кэшбэк{{storeText}}</div>'+
    '<div class="secretdiscounter-extension__shop-favorites">{{favoritesLink}}</div>'+
    '</div>'+
    '<div class="secretdiscounter-extension__buttons">'+
    '<a class="secretdiscounter-extension__link btn" href="{{storeUrl}}">Активировать&nbsp;кэшбэк</a>'+
    '<span class="secretdiscounter-extension__buttons-message">Вы остаётесь на текущей странице</span>'+
    '</div>';
var couponHtml = '<div class="secretdiscounter-extension__coupon">'+
    '<div class="secretdiscounter-extension__coupon-left">'+
    '<a href="{{couponUrl}}">{{couponName}}</a>'+
    '<div class="secretdiscounter-extension__coupon-date">Осталось: <span>{{couponDateEnd}}</span></div>'+
    '<div class="secretdiscounter-extension__coupon-used">Воспользовались: <span>{{couponUsed}}</span></div>'+
    '</div>'+
    '<div class="secretdiscounter-extension__coupon-right">'+
    '<span class="secretdiscounter-extension__coupon-promocode-title">Промокод</span>'+
    '<span class="secretdiscounter-extension__coupon-promocode">{{couponPromocode}}</span>'+
    '<a class="secretdiscounter-extension__coupon-promocode-link btn" href="{{couponUseLink}}">Использовать промокод</a>'+
    '</div>'+
    '</div>';
