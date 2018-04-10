var baseUrl = chrome.i18n.getMessage("baseUrl");
var nameApp = chrome.i18n.getMessage("nameApp");
if (nameApp.indexOf("Kopikot") > -1) {
	var topBannerLogo = chrome.extension.getURL("img/kopikot_nega.png");
  var smallLogo = chrome.extension.getURL("img/kNoBackGround.png");
	var googleAdsLogo = chrome.extension.getURL("img/k1.png");
} else if (nameApp.indexOf("Bonus") > -1) {
	var topBannerLogo = chrome.extension.getURL("img/bonusbay_nega.png");
  var smallLogo = chrome.extension.getURL("img/bNoBackGround.png");
	var googleAdsLogo = chrome.extension.getURL("img/b.png");
} else if (nameApp.indexOf("Art") > -1) {
	var topBannerLogo = chrome.extension.getURL("img/artiway_nega.png");
  var smallLogo = chrome.extension.getURL("img/aNoBackGround.png");
	var googleAdsLogo = chrome.extension.getURL("img/a.png");
} else if (nameApp.indexOf('Cash') > -1) {
	var topBannerLogo = chrome.extension.getURL("img/cashout-bonusway_nega.png");
  var smallLogo = chrome.extension.getURL("img/bNoBackGround.png");
	var googleAdsLogo = chrome.extension.getURL("img/b.png");
}
