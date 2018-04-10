const DEBUG = false;

const LEVEL_ERROR = 0;
const LEVEL_WARNING = 1;
const LEVEL_INFO = 2;

const LEVEL_ERROR_COLOR = '#f44336';
const LEVEL_WARNING_COLOR = '#ffcc00';
const LEVEL_INFO_COLOR = '#00c853';

const LEVEL_ERROR_STATUS = 'bad';
const LEVEL_WARNING_STATUS = 'stranger';
const LEVEL_INFO_STATUS = 'good';

const TYPE_SCORE_1 = 'У покупателей есть сомнения насчет надежности этого продавца. Слишком низкий рейтинг.';
const TYPE_SCORE_2 = 'Будьте внимательны при покупке! Лучше ознакомиться с описанием товара и отзывами других покупателей.';
const TYPE_SCORE_3 = 'Это хороший рейтинг. Для большей уверенности пообщайтесь с продавцом и почитайте отзывы.';
const TYPE_SCORE_4 = 'Это отличный рейтинг! По мнению покупателей, этому продавцу можно доверять.';
/******/
const TYPE_FEEDBACK_1 = 'Пока что у этого продавца слишком мало положительных отзывов от покупателей.';
const TYPE_FEEDBACK_2 = 'Хороший уровень доверия покупателей, много положительных отзывов.';
const TYPE_FEEDBACK_3 = 'Большинство покупателей положительно отзывается о продавце.';
const TYPE_FEEDBACK_4 = 'Супер-продавец! Покупатели оставили огромное количество положительных отзывов!';
/******/
const TYPE_AGE_1 = 'Продавец - новичок на площадке. Работает менее года.';
const TYPE_AGE_2 = 'Продавец работает более года.';
const TYPE_AGE_3_1 = 'Опытный продавец, работает более ';
const TYPE_AGE_3_2 = ' лет.';
/******/
const TYPE_DESCRIPTION_1 = 'По мнению покупателей, товары не соответствуют описанию. Лучше поискать продавцов с более высоким пользовательским рейтингом.';
const TYPE_DESCRIPTION_2 = 'Покупатели недовольны несоответствием описания и товара.';
const TYPE_DESCRIPTION_3 = 'Есть жалобы от покупателей о не соответствующем описании.';
const TYPE_DESCRIPTION_4 = 'Большинство товаров, согласно отзывам покупателей, соответствует описанию.';
const TYPE_DESCRIPTION_5 = 'Покупатели утверждают, что товары полностью соответствуют описанию.';
/******/
const TYPE_COMMUNICATION_1 = 'Покупатели недовольны общением с продавцом.';
const TYPE_COMMUNICATION_2 = 'Большинство покупателей недовольны общением с продавцом.';
const TYPE_COMMUNICATION_3 = 'Больше половины покупателей недовольны общением с продавцом.';
const TYPE_COMMUNICATION_4 = 'В основном, покупатели довольны общением с продавцом и доверяют ему.';
const TYPE_COMMUNICATION_5 = 'Покупатели считают продавца общительным, ответственным и вовремя отвечающим на поставленные вопросы.';
/******/
const TYPE_SHIPPING_1 = 'Покупатели заметили, что продавец постоянно отправляет товар с опозданием.';
const TYPE_SHIPPING_2 = 'Многие покупатели недовольны скоростью отправки товара.';
const TYPE_SHIPPING_3 = 'Покупатели утверждают, что продавец может медлить с отправкой товара.';
const TYPE_SHIPPING_4 = 'Встречаются жалобы на скорость отправки товара.';
const TYPE_SHIPPING_5 = 'Покупатели довольны скоростью отправки товара.';

/******/
const TYPE_NO_CHANGE = 0;
const TYPE_MINOR_DOWN = 1;
const TYPE_DOWN = 2;
const TYPE_MINOR_DOWN_AFTER_UP = 3;
const TYPE_MINOR_UP_AFTER_DOWN = 4;
const TYPE_UP = 5;
const TYPE_MINOR_UP = 6;
/******/
const TYPE_NO_CHANGE_TEXT = 'Цена не менялась';
const TYPE_MINOR_DOWN_TEXT = 'Незначительное падение цены';
const TYPE_DOWN_TEXT = 'Падение цены';
const TYPE_MINOR_DOWN_AFTER_UP_TEXT = 'Незначительное падение цены после роста';
const TYPE_MINOR_UP_AFTER_DOWN_TEXT = 'Незначительный рост цены после падения';
const TYPE_UP_TEXT = 'Рост цены';
const TYPE_MINOR_UP_TEXT = 'Незначительный рост цены';

//-- browser name constants

var BROWSER_NAME_IE = 'Internet Explorer'
    , BROWSER_NAME_FF = 'Firefox'
    , BROWSER_NAME_CHROME = 'Chrome'
    , BROWSER_NAME_SAFARI = 'Safari'
    , BROWSER_NAME_YABROWSER = 'YaBrowser';

// -- reg exp

var PARAMETER_DEEP_LINK = "?ext_referrer=";
var APP_TOKEN = 'Owmeaiaiwlsn3444_aasi344Mgoak';

var REGEX_ACT_MIN_PRICE = /window\.runParams\.actMinPrice="(.+)";/gmi;
var REGEX_ACT_MAX_PRICE = /window\.runParams\.actMaxPrice="(.+)";/gmi;
var REGEX_MIN_PRICE = /window\.runParams\.minPrice="(.+)";/gmi;
var REGEX_MAX_PRICE = /window\.runParams\.maxPrice="(.+)";/gmi;
var REGEX_BASE_CURRENCY_CODE = /window\.runParams\.baseCurrencyCode="(.+)";/gmi;

var REGEX_ALI_PRODUCT_ID = /^\/(?:item(?:\/.*)?\/|s\/item(?:\/.*)?\/|store\/product(?:\/.*)?\/\d+_|\d+\-)([\d]+)(?:\-detail)?\.html/;
var REGEX_GEARBEST_PRODUCT_ID = /^(?:\/.*)?\/pp_([\d]+)\.html/;
var REGEX_BANG_GOOD_PRODUCT_ID  = /^(?:\/.*)?\/(?:.*)?\-p\-([\d]+)\.html/;
var REGEX_BANG_GOOD_US_PRODUCT_ID  = /^(?:\/.*)?\/(?:.*)?\-wp\-Usa\-([\d]+)\.html/;
var REGEX_BANG_GOOD_EU_PRODUCT_ID  = /^(?:\/.*)?\/(?:.*)?\-wp\-Eu\-([\d]+)\.html/;
var REGEX_LIGHT_IN_THE_BOX_PRODUCT_ID = /^(?:\/.*)?\/(?:.*)?_p([\d]+)\.html/;
var REGEX_TOM_TOP_PRODUCT_ID = /^(?:\/.*)?\/p\-(.+)\.html/;


var CHECK_ELEMENT_ALI = '.detail-wrap';
var CHECK_ELEMENT_GEARBEST = '#js_hidden_price';

var CHECK_LETYSHOPS = /\bletyshops.([.*]+\/)?\b([^\/]|\n)+/;
var CHECK_LETYSHOPS_VIEW = /(\bletyshops.([.*]+\/)?\b([^\/]|\n)+\b(:?\/view\/))(:?\d)(?:\d*\.)?\d+/;
var CHECK_LETYSHOPS_VIEW_ID = /(?:\d*\.)?\d+/;

var REG_URL = /(https?:\/\/[^\s]+)/g;

const COOKIE_EXTENSION_NAME = 'extensionInstalled';
const COOKIE_EXTENSION_VALUE = 1;
const COOKIE_EXTENSION_EXPIRES = 120;

var ARRAY_MERCHANTS_PRICE = [
    13366481, // aliexpress
    15131011, // gearbest
    15131239, // banggood
    13433222, // lightinthebox
    13083906, // miniInTheBox
    15223074 // TOMTOP
];

//-- events

var COMMUNICATION_EVENT_NAME_PREFIX = 'LETYSHOPS_',

    LOGIN_TOKEN = COMMUNICATION_EVENT_NAME_PREFIX + 'LOGIN_TOKEN',
    POPUP_FIRST_OPENING_TOKEN = COMMUNICATION_EVENT_NAME_PREFIX + 'POPUP_FIRST_OPENING_TOKEN',

    CASHBACK_ACTIVATE = COMMUNICATION_EVENT_NAME_PREFIX + 'CASHBACK_ACTIVATE',
    CASHBACK_DEACTIVATE = COMMUNICATION_EVENT_NAME_PREFIX + 'CASHBACK_DEACTIVATE',
    CASHBACK_ACTIVATE_FROM_POPUP = COMMUNICATION_EVENT_NAME_PREFIX + 'CASHBACK_ACTIVATE_FROM_POPUP',
    PROMO_ACTIVATE = COMMUNICATION_EVENT_NAME_PREFIX + 'PROMO_ACTIVATE',
    PROMO = COMMUNICATION_EVENT_NAME_PREFIX + 'PROMO',

    NOTIFICATION_CASHBACK_ACTIVATE = COMMUNICATION_EVENT_NAME_PREFIX + 'NOTIFICATION_CASHBACK_ACTIVATE',
    NOTIFICATION_DISMISS = COMMUNICATION_EVENT_NAME_PREFIX + 'NOTIFICATION_DISMISS',
    USER_NOTIFICATION_DISMISS = COMMUNICATION_EVENT_NAME_PREFIX + 'USER_NOTIFICATION_DISMISS',
    NOTIFICATION_GET_INFO = COMMUNICATION_EVENT_NAME_PREFIX + 'NOTIFICATION_GET_INFO',
    NOTIFICATION_GET_PRICE = COMMUNICATION_EVENT_NAME_PREFIX + 'NOTIFICATION_GET_PRICE',
    SHOW_NOTIFICATION_BY_FORCE = COMMUNICATION_EVENT_NAME_PREFIX + 'SHOW_NOTIFICATION_BY_FORCE',
    CLOSE_ALL_NOTIFICATION = COMMUNICATION_EVENT_NAME_PREFIX + 'CLOSE_ALL_NOTIFICATION',
    USER_NOTIFY_GET_INFO = COMMUNICATION_EVENT_NAME_PREFIX + 'USER_NOTIFY_GET_INFO',
    UPDATE_FAVORITE_STATUS_FROM_NOTIFICATION = COMMUNICATION_EVENT_NAME_PREFIX + 'UPDATE_FAVORITE_STATUS_FROM_NOTIFICATION',
    UPDATE_FAVORITE_STATUS_FROM_BG = COMMUNICATION_EVENT_NAME_PREFIX + 'UPDATE_FAVORITE_STATUS_FROM_NOTIFICATION',
    UPDATE_MERCHANTS_HOT_PRODUCTS = COMMUNICATION_EVENT_NAME_PREFIX + 'UPDATE_MERCHANTS_HOT_PRODUCTS',

    GET_EXTENSION_INFO = COMMUNICATION_EVENT_NAME_PREFIX + 'GET_EXTENSION_INFO',
    SEND_EXTENSION_INFO = COMMUNICATION_EVENT_NAME_PREFIX + 'SEND_EXTENSION_INFO',
    GET_PAGE_INFO = COMMUNICATION_EVENT_NAME_PREFIX + 'GET_PAGE_INFO',
    GET_PAGE_COOKIES = COMMUNICATION_EVENT_NAME_PREFIX + 'GET_PAGE_COOKIES',
    SEND_GA_CID = COMMUNICATION_EVENT_NAME_PREFIX + 'SEND_GA_CID',
    SEND_GOOGLE_ANALYTICS = COMMUNICATION_EVENT_NAME_PREFIX + 'SEND_GOOGLE_ANALYTICS',
    SEND_ACTIVATION_DATA = COMMUNICATION_EVENT_NAME_PREFIX + 'SEND_ACTIVATION_DATA',
    SEND_THANKS_YOU_PAGE_DATA = COMMUNICATION_EVENT_NAME_PREFIX + 'SEND_THANKS_YOU_PAGE_DATA',
    SEND_PAGE_INFO = COMMUNICATION_EVENT_NAME_PREFIX + 'SEND_PAGE_INFO',
    ANIMATE_ICON = COMMUNICATION_EVENT_NAME_PREFIX + 'ANIMATE_ICON',
    OFFLINE_LIKES = COMMUNICATION_EVENT_NAME_PREFIX + 'OFFLINE_LIKES',
    SAW_REWRITE = COMMUNICATION_EVENT_NAME_PREFIX + 'SAW_REWRITE',
    SAVE_PARAMS = COMMUNICATION_EVENT_NAME_PREFIX + 'SAVE_PARAMS',
    BUTTON_UPDATE = COMMUNICATION_EVENT_NAME_PREFIX + 'BUTTON_RED',
    SET_NOTIFICATIONS_POPUP = COMMUNICATION_EVENT_NAME_PREFIX + 'SET_NOTIFICATIONS_POPUP',
    TAB_WAS_CHANGED = COMMUNICATION_EVENT_NAME_PREFIX + 'TAB_WAS_CHANGED',
    SEND_ITEM_TO_WISH_LIST = COMMUNICATION_EVENT_NAME_PREFIX + 'SEND_ITEM_TO_WISH_LIST',
    GET_PRICE_HISTORY = COMMUNICATION_EVENT_NAME_PREFIX + 'GET_PRICE_HISTORY',

// check cookies
    CHECK_MERCHANT_COOKIES = COMMUNICATION_EVENT_NAME_PREFIX + 'CHECK_MERCHANT_COOKIES',
    SET_MERCHANT_COOKIES = COMMUNICATION_EVENT_NAME_PREFIX + 'SET_MERCHANT_COOKIES',
    CLEAR_COOKIES = COMMUNICATION_EVENT_NAME_PREFIX + 'CLEAR_COOKIES',
    GET_TOKEN_COOKIES = COMMUNICATION_EVENT_NAME_PREFIX + 'GET_TOKEN_COOKIES',

    MERCHANT_SUPPRESSED = COMMUNICATION_EVENT_NAME_PREFIX + 'MERCHANT_SUPPRESSED',
    MERCHANTS_RESET = COMMUNICATION_EVENT_NAME_PREFIX + 'MERCHANTS_RESET',

    POPUP_MERCHANTS_UPDATE = COMMUNICATION_EVENT_NAME_PREFIX + 'POPUP_MERCHANTS_UPDATE',
    POPUP_TO_NOTIFICATION_TAB = COMMUNICATION_EVENT_NAME_PREFIX + 'POPUP_TO_NOTIFICATION_TAB',
    POPUP_TO_INVITATION_TAB = COMMUNICATION_EVENT_NAME_PREFIX + 'POPUP_TO_INVITATION_TAB',
    POPUP_TO_MERCHANT_CARD = COMMUNICATION_EVENT_NAME_PREFIX + 'POPUP_TO_MERCHANT_CARD',
    POPUP_INITIALIZE_FOOTER_FOR_OFFERS = COMMUNICATION_EVENT_NAME_PREFIX + 'POPUP_INITIALIZE_FOOTER_FOR_OFFERS',
    POPUP_INITIALIZE_FOOTER_FOR_STORES = COMMUNICATION_EVENT_NAME_PREFIX + 'POPUP_INITIALIZE_FOOTER_FOR_STORES',
    POPUP_UPDATE_FOOTER = COMMUNICATION_EVENT_NAME_PREFIX + 'POPUP_UPDATE_FOOTER',
    POPUP_TO_UPDATE_FAVORITE_STATUS = COMMUNICATION_EVENT_NAME_PREFIX + 'POPUP_TO_UPDATE_FAVORITE_STATUS',
    POPUP_PUSH_REVIEWED_NOTIFY = COMMUNICATION_EVENT_NAME_PREFIX + 'POPUP_PUSH_REVIEWED_NOTIFY',
    ON_USER_LOGIN = COMMUNICATION_EVENT_NAME_PREFIX + 'ON_USER_LOGIN',
    ON_USER_LOGOUT = COMMUNICATION_EVENT_NAME_PREFIX + 'ON_USER_LOGOUT',
    USER_FETCH_INFO = COMMUNICATION_EVENT_NAME_PREFIX + 'USER_FETCH_INFO',
    USER_APPLIED_LETY_CODES = COMMUNICATION_EVENT_NAME_PREFIX + 'USER_APPLIED_LETY_CODES',
    UPDATE_LETY_CODES = COMMUNICATION_EVENT_NAME_PREFIX + 'UPDATE_LETY_CODES',
    GET_INFO_MERCHANT = COMMUNICATION_EVENT_NAME_PREFIX + 'GET_INFO_MERCHANT';


var TAB_CHANGED = COMMUNICATION_EVENT_NAME_PREFIX + 'TAB_CHANGED'
    , TAB_SET_MERCHANT_ALIAS_AND_DEEP_LINK = COMMUNICATION_EVENT_NAME_PREFIX + 'TAB_SET_MERCHANT_ALIAS_AND_DEEP_LINK'
    , NOTIFICATION_ACTIVATED_DISMISS = COMMUNICATION_EVENT_NAME_PREFIX + 'NOTIFICATION_ACTIVATED_DISMISS'
    , CASHBACK_ACTIVATE_AFTER_LOG_IN = COMMUNICATION_EVENT_NAME_PREFIX + 'CASHBACK_ACTIVATE_AFTER_LOG_IN'
    , MERCHANT_GET_INFO = COMMUNICATION_EVENT_NAME_PREFIX + 'MERCHANT_GET_INFO'
    , CHECK_BUTTON_INDICATION = COMMUNICATION_EVENT_NAME_PREFIX + 'CHECK_BUTTON_INDICATION';

//-- SIZE OF USER HISTORY

var HISIORY_LENGTH = 10,
    GLOBAL_HISTORY_LENGTH = 100;

//-- UI

var POPUP_WIDTH = 470
    , POPUP_HEIGHT = 560;

var UPDATE_INTERVAL_MERCHANT = 2 * 60 * 60 * 1000, // 2h
    UPDATE_INTERVAL_OFFERS = 15 * 60 * 1000, // 15m
    UPDATE_INTERVAL_CODES = 2 * 60 * 60 * 1000, // 2h
    UPDATE_INTERVAL_USER_AFTER_ERROR = 30 * 1000, //30s
    REQUESTS_PERIOD_IN_CASE_OF_ERROR = 60 * 1000, //1m
    PERIODIC_SHOP_VIEWED = 2 * 60 * 60 * 1000, //2h
    USER_NOTIFY_INTERVAL = 5 * 1000, //5s
    PROMO_AJAX_NOTIFY_INTERVAL = 60 * 60 * 1000, //1h
    PROMO_NOTIFY_INTERVAL = 2 * 60 * 1000, // 2m
    PROMO_NOTIFY_PERIOD = 60 * 60 * 1000,// 1h
    UPDATE_INTERVAL_ACTIVATE = 60 * 60 * 1000,// 1h
    UPDATE_INTERVAL_USER = 60 * 1000, //1 m
    UPDATE_INTERVAL_USER_NOTIFICATION = 60 * 60 * 1000, // 5 m
    UPDATE_INTERVAL_FAVORITE = 2 * 60 * 60 * 1000, // 2h
    UPDATE_INTERVAL_RECOMMENDED = 5 * 60 * 1000, // 3 m
    UPDATE_INTERVAL_VIEWED = 60 * 1000, // 1 m
    UPDATE_READING_LABEL = 5000, // 5s
    UPDATE_LOG_REQUEST = 24 * 60 * 60 * 1000, // 24h
    INTERVAL_PUSH_LOG_REQUEST = 5 * 60 * 1000, // 5 m
    INTERVAL_PUSH_LOG = 60 * 1000, // 1 m
    UPDATE_USER_PERSONAL_CASHBACK = 10 * 1000, //10 s
    UPDATE_INTERVAL_URLS = 2 * 60 * 60 * 1000, // 2h
    UPDATE_INTERVAL_SETTINGS = 2 * 60 * 60 * 1000, // 2h
    R_LIST_ADD_PERIOD = 12 * 60 * 60 * 1000,// 12h
    UPDATE_INTERVAL_INFO_HISTORY_PRICE = 10* 60 * 1000; //10m
//-- tab possible states

var TAB_STATE_3RD_PARTY = 0x02
    , TAB_STATE_INTERSTITIAL_REDIRECT = 0x03;

// footer state
var FOOTER_ALL_STORES = 0x01,
    FOOTER_ALL_OFFERS = 0x02,
    FOOTER_LABEL = 0;

//-- list of 3rd party affiliate links domains

var THIRD_PARTY_LINKS = [
    'event.2parale.ro',
    'www.awin1.com',
    'partners.webmasterplan.com',
    'web.epartner.es',
    'clic.reussissonsensemble.fr',
    'being.successfultogether.co.uk',
    'anrdoezrs.net',
    't.dgm-au.com',
    'google.com/aclk?sa',
    'pepperjamnetwork.com',
    'aos.prf.hn',
    'ad.zanox.com',
    'rover.ebay.com',
    'track.commissionfactory.com.au',
    'clk.tradedoubler.com',
    'tkqlhce.com',
    'partnerprogramma.bol.com',
    'tc.tradetracker.net',
    'tr.rdrtr.com',
    'lead-analytics.nl',
    'partners.adtriplex.com',
    'action.metaffiliation.com',
    'smart4ads.com',
    'gr.linkwi.se',
    'tracking.publicidees.com',
    'fls.doubleclick.net',
    'gan.doubleclick.net',
    'click.linksynergy.com',
    'v2.afilio.com.br',
    'jdoqocy.com',
    'send.onenetworkdirect.net',
    '.7eer.net',
    '.evyy.net',
    '.ojrq.net',
    'affiliate.buy.com',
    'affiliate.rakuten.com',
    'affiliates.abebooks.com',
    'affiliates.babiesrus.com',
    'affiliates.toysrus.com',
    'afsrc=1',
    'aos.prf.hn',
    'commission-junction.com',
    'dpbolvw.net',
    'dpbolvw.net',
    'google.com/aclk',
    'gopjn.com',
    'goto.orientaltrading.com',
    'goto.target.com',
    'goto.target.com/c/',
    'kqzyfj.com',
    'partners.hotwire.com',
    'pepperjamnetwork.com',
    'pjatr.com',
    'pjtra.com',
    'pntra.com',
    'pntrs.com',
    'prf.hn',
    'qksrv.net',
    'shareasale.com',
    't.dgm-au.com',
    'www.linkconnector.com',
    'apytrc.com',
    'ams.apypx.com'
];

var defaultCausebase64 = 'data:image/png;base64,';

//-- google analytics
var googleAnalyticsTID = 'UA-97996247-1',
    googleAnalyticsURL = 'https://www.google-analytics.com',
    googleAnalyticsURLBatch = googleAnalyticsURL + '/batch',
    googleAnalyticsURLCollect = googleAnalyticsURL + '/collect',
    // main extension
    gaPrefix = '/_extension/',
    gaPageShops = gaPrefix + 'shops/',
    gaPagePopup = gaPrefix + 'popup/',
    gaPageSales = gaPrefix + 'sales/',
    gaPageFriends = gaPrefix + 'friends/',
    gaPageHistory = gaPrefix + 'history/',
    // price Monitoring
    gaPrefixMonitor = '_monitor/',

    gaPageError = gaPrefix + '404/';