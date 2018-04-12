var storeHtml = '<div class="secretdiscounter-extension__shop"><img class="secretdiscounter-extension__shop-logo" src="{{storeLogo}}"/>'+
    '<div class="secretdiscounter-extension__shop-text">Кэшбэк{{storeText}}</div>'+
    '</div>'+
    '<div class="secretdiscounter-extension__buttons">'+
    '<div class="secretdiscounter-extension__buttons-tariffs">{{storeTariffs}}</div>'+
    '<a class="secretdiscounter-extension__buttons-link secretdiscounter-extension__link sd_button {{buttonsClass}}" data-store="{{storeRoute}}" href="{{storeUrl}}" target="_blank">{{btnText}}</a>'+
    '<span class="secretdiscounter-extension__buttons-title {{buttonsClass}}">Магазин с активированным кэшбэком<br> откроется в новом окне</span>'+
    '</div>';
var notificationHTML = '<div class="secretdiscounter-extension__notificaton">'+
    '<div class="secretdiscounter-extension__notificaton-date">{{notyDate}}</div>'+
    '<div class="secretdiscounter-extension__notificaton-title">{{notyTitle}}</div>'+
    '<div class="secretdiscounter-extension__notificaton-text">{{notyText}}</div>'+
    '</div>';
var favoriteHTML ='<div class="secretdiscounter-extension__shop"><img class="secretdiscounter-extension__shop-logo" src="{{storeLogo}}"/>'+
    '<div class="secretdiscounter-extension__shop-text">Кэшбэк{{storeText}}</div>'+
    '<a class="secretdiscounter-extension__link sd_button {{buttonClass}}" data-store="{{storeRoute}}" href="{{storeUrl}}">Активировать<br>кэшбэк</a>'+
    '</div>';

var storePluginHtml = '<div class="secretdiscounter-extension__header">'+
    '<a href="{{siteUrl}}" class="secretdiscounter-extension__logo"><img class="secretdiscounter-extension__logo-img" src="{{logoImage}}"/></a>'+
    '<div class="secretdiscounter-extension__button_close">'+
    //'<span class="secretdiscounter-extension__button_icon">&times;</span>'+
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Capa_1" x="0px" y="0px" width="12px" height="12px" viewBox="0 0 357 357" style="enable-background:new 0 0 357 357;" xml:space="preserve"><g>'+
        '<g id="close"><polygon points="357,35.7 321.3,0 178.5,142.8 35.7,0 0,35.7 142.8,178.5 0,321.3 35.7,357 178.5,214.2 321.3,357 357,321.3     214.2,178.5   " fill="#FFFFFF"/>'+
    '</svg>'+
    '</div>'+
    '</div>'+
    '<div class="secretdiscounter-extension__shop"><img class="secretdiscounter-extension__shop-logo" src="{{storeLogo}}"/>'+
    '<div class="secretdiscounter-extension__shop-text">{{storeText}}</div>'+
    '<div class="secretdiscounter-extension__shop-favorites">{{favoritesLink}}</div>'+
    '</div>'+
    '<div class="secretdiscounter-extension__buttons {{buttonsClass}}">'+
    '<a class="secretdiscounter-extension__link sd_button" href="{{storeUrl}}" data-store="{{storeRoute}}" target="_blank">Активировать&nbsp;кэшбэк</a>'+
    '<span class="secretdiscounter-extension__buttons-message">Магазин с активированным кэшбэком<br> откроется в новом окне</span>'+
    '</div>';
var couponHtml = '<div class="secretdiscounter-extension__coupon">'+
  '<a href="{{couponUrl}}" class="secretdiscounter-extension__coupon-href">{{couponName}}</a>'+
  '<div class="secretdiscounter-extension__coupon-left">'+
  '<div class="secretdiscounter-extension__coupon-item secretdiscounter-extension__coupon-date">Осталось: <span>{{couponDateEnd}}</span></div>'+
  '<div class="secretdiscounter-extension__coupon-item secretdiscounter-extension__coupon-used">Воспользовались: <span>{{couponUsed}}</span></div>'+
  '<div class="secretdiscounter-extension__coupon-item secretdiscounter-extension__coupon-promocode">Промокод: <span>{{couponPromocode}}</span></div>'+
  '</div>'+
  '<div class="secretdiscounter-extension__coupon-right">'+
  '<a class="secretdiscounter-extension__coupon-promocode-link sd_button" href="{{couponUseLink}}">Использовать промокод</a>'+
  '</div>'+
  '</div>';