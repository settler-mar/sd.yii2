/*===================================================================================
=            This utils file is shared by both popup and content scripts            =
===================================================================================*/

/**
 *
 * 7 days valid after user click a link, during this period when user visit the site, the banner will show as active;
 *
 */

var baseUrl = chrome.i18n.getMessage("baseUrl");

var cashbackValidTime = 1000 * 60 * 60 * 24 * 7;
var ifContentAdBlock = false;
var newApi = "https://api.bonusway.com";

var Content_DEBUG = false;
if (!Content_DEBUG) {
	if (!window.console) window.console = {};
	var methods = ["log", "debug", "warn", "info"];
	for (var i = 0; i < methods.length; i++) {
		console[methods[i]] = function () {};
	}
}

function afsrc(search) {
	var now = Date.now();
	if (search.indexOf('afsrc=') !== -1 || search.match(/afsrc=/i) || search.match(/cj/ig) !== null || search.match(/CommissionJunction/ig) !== null || search.match(/Conversant/ig) !== null) {
		localStorage.afsrc_delay = now + 1000 * 60 * 15;
	}
	var delay = localStorage.afsrc_delay ? parseInt(localStorage.afsrc_delay) : 0;
	return delay > now;
}

function afsrcReferrer(referrer, cb) {
	console.log('referrer', referrer);
	chrome.storage.local.get('afsrc', function (data) {
		var now = Date.now();
		var delay = data.afsrc[referrer] ? parseInt(data.afsrc[referrer]) : 0;
		console.log('afsrcReferrer delay', delay);
		var needDelay = delay > now;
		console.log('afsrcReferrer needDelay', needDelay);
		cb(needDelay);
	});
}

// adBlock detect
function detectAdBlock() {
	var test = document.createElement('div');
	test.innerHTML = '&nbsp;';
	test.className = 'adsbox';
	console.log('document', document);
	document.body.appendChild(test);
	window.setTimeout(function () {
		if (test.offsetHeight === 0) {
			console.log('adblcok enabled!!!!!');
			ifContentAdBlock = true;
		} else {
			console.log('adblcok disabled');
			test.remove();
		}
	}, 100);
}

function checkAdBlock() {
	if (ifContentAdBlock) {
		chrome.runtime.sendMessage({
			notification: true,
			title: chrome.i18n.getMessage("ad_block_title"),
			message: chrome.i18n.getMessage("ad_block_desc")
		});
		return true;
	} else {
		return false;
	}
}

/**
 *
 *   Content script specifc utils
 *
 **/
function commStrNewApi(commission){
  var reverse_currency_pos = (chrome.i18n.getMessage("reverse_currency_pos") === "true") ? true : false;
  var reverse_percent_pos = (chrome.i18n.getMessage("reverse_percent_pos") === "true") ? true : false;
  var res;

  if(commission && commission.amount == 0){
  	res = chrome.i18n.getMessage('no_bonus');
	} else if(commission && commission.amount != 0){
  	res = chrome.i18n.getMessage("currency_to") + " ";
		if (!reverse_currency_pos || !reverse_percent_pos){
			res += commission.amount;
			res += (commission.unit != "%") ? chrome.i18n.getMessage('type_currency') : commission.unit;
		} else {
			res += (commission.unit != "%") ? chrome.i18n.getMessage('type_currency') : commission.unit;
			res += commission.amount;
		}
  }

  return res;
}

function commisionStr(commissions) {
	var reverse_currency_pos = (chrome.i18n.getMessage("reverse_currency_pos") === "true") ? true : false;
	var reverse_percent_pos = (chrome.i18n.getMessage("reverse_percent_pos") === "true") ? true : false;

	if (commissions) {
		var commisionProc = commissions
			.filter(function (item) {
				return item.CPS_proc_out && true;
			})
			.sort(function (a, b) {
				if (a.CPS_proc_out.indexOf(',') !== -1 && b.CPS_proc_out.indexOf(',') !== -1) {
					return parseFloat(a.CPS_proc_out.replace(',', '.').replace(' ', '')) - parseFloat(b.CPS_proc_out.replace(',', '.').replace(' ', ''));
				} else {
					return parseFloat(a.CPS_proc_out) - parseFloat(b.CPS_proc_out);
				}
			})
			.pop();

		var commissionFlat = commissions
			.filter(function (item) {
				return item.CPS_flat_out && true;
			})
			.sort(function (a, b) {
				return parseFloat(a.CPS_flat_out.replace(/\s/g, '')) - parseFloat(b.CPS_flat_out.replace(/\s/g, ''));
			})
			.pop();

		var summStr = (commissions.length > 1) ? chrome.i18n.getMessage("currency_to") + " " : "";
	} else {
		var summStr = "";
	}


	if (commisionProc) {
		summStr += reverse_percent_pos ?
			"%" + commisionProc.CPS_proc_out :
			commisionProc.CPS_proc_out + "%";
	} else if (commissionFlat) {
		summStr += reverse_currency_pos ?
			chrome.i18n.getMessage('type_currency') + commissionFlat.CPS_flat_out :
			commissionFlat.CPS_flat_out + chrome.i18n.getMessage('type_currency');
	} else {
		summStr = chrome.i18n.getMessage('no_bonus');
	}
	return summStr
}

/**
 *
 * To set the enabled campaigns records
 *
 */

function setCashbacked(campaignInfo, cb, url) {
	var transaction = [];
	if (url) {
		transaction.push(url);
	}
	chrome.storage.local.get('cashbacked', function (data) {
		data.cashbacked[campaignInfo.id] = {
			expire: new Date().getTime() + cashbackValidTime,
			transaction: transaction
		};
		chrome.storage.local.set({
			cashbacked: data.cashbacked
		}, cb);
	});
}

/**
 *  There are 3 status 2 cases that one campaign could have

    1, active 2, inactive 3, hijacking

    case1: (data.cashbacked[:id] not exist) -> inactive status

    case2: (data.cashbacked[:id] exist) -> data.cashbacked[:id].expire expired?
        - yes -> inactive
        - else ->
            - data.cashbacked[:id].transaction empty? -> check url is affiliate format ->
                - if yes -> save the current url inside and show active banner.
                - else  -> render inactive banner.
                - Potential bug here, if the user click the link from popup/google ads but our api/out didn't redirect the user to the shop sucessfully,
                and paste other format affiliate url, it will still show the active banner. But if the user to do that deliberately, then the UX doesn't matter,
                it will no get paid from us.

            - data.cashbacked[:id].transaction.length === 1? -> check the URL is affiliate format
                - if yes -> check current affiliate url === the one inside transaction
                        -> yes? -> show active
                        -> no? -> show hijacking
                - else -> show active
 */

function checkCampaignStatus(campaignInfo, cb) {
	var campaignId = campaignInfo.id;
	chrome.storage.local.get('cashbacked', function (data) {
		console.log('campaignId in data.cashbacked', campaignId in data.cashbacked);
		if (campaignId in data.cashbacked) {
			if (isExpire(data.cashbacked[campaignId])) {
				console.log('is expire');
				cb('inActived');
			} else {
				console.log('not expire');
				if (!data.cashbacked[campaignId].transaction.length) {
					if (isAffiliateURL(location.href)) {
						setCashbacked(campaignInfo, function () {
							if (chrome.runtime.lastError) {
								console.log(chrome.runtime.lastError);
							} else {
								cb('actived');
							}
						}, location.href)
					} else {
						cb('actived');
					}
				} else if (data.cashbacked[campaignId].transaction.length === 1) {
					if (isAffiliateURL(location.href)) {
						if (location.href === data.cashbacked[campaignId].transaction[0]) {
							cb('actived');
						} else {
							cb('hijacked');
						}
					} else {
						cb('actived');
					}
				} else {
					cb('hijacked');
				}
			}
		} else {
			// not exists
			cb('inActived');
		}
	});
}

function isAffiliateURL(url) {
	var query = parseQueryString(url);
	if (
		typeof (query.admitad_uidtypeof) !== 'undefined' ||
		typeof (query.aff_platform) !== 'undefined' ||
		typeof (query.partner) !== 'undefined' ||
		typeof (query.utm_medium) !== 'undefined' ||
		typeof (query.omniturecode) !== 'undefined' ||
		typeof (query.label) !== 'undefined' ||
		typeof (query.aid) !== 'undefined' ||
		typeof (query.zanpid) !== 'undefined' ||
		typeof (query.aff_trace_key) !== "undefined" ||
		(typeof (query.utm_source) !== "undefined" && (query.utm_source === "actionpay_cpo" || query.utm_source === "amtd_cpo")) ||
		(
			(typeof (query.utm_source) !== "undefined" && query.utm_source === "lap") &&
			(typeof (query.utm_campaign) !== "undefined" &&
				query.utm_campaign.toString().indexOf("partner") >= 0))
	) {
		return true;
	} else {
		return false;
	}
}

function parseQueryString(query) {
	var args = {};
	var pos = query.indexOf('?');
	if (pos != -1) {
		query = query.substring(pos + 1);
	}
	var pairs = query.split('&');
	for (var i in pairs) {
		if (typeof (pairs[i]) == 'string') {
			var pair = pairs[i].split('=');
			// Ignore the 'q' path argument, if present.
			if (pair[0] != 'q' && pair[1]) {
				args[decodeURIComponent(pair[0].replace(/\+/g, ' '))] = decodeURIComponent(pair[1].replace(/\+/g, ' '));
			}
		}
	}
	return args;
};

function isExpire(timestamp) {
	var now = new Date().getTime().toString();
	return now > timestamp;
}


function pluginNotify(user) {
	var browser = extensionType;
	if (user) {
		if (!!user.id) {
			checkUrl("api/plugin?loadstats=" + browser, {
				success: function () {}
			});
		}
	}
}


/**
 *
 *   Background script specifc utils
 *
 **/

function checkUrl(currentHostname, param, apiVersion) {
	var xhr = new XMLHttpRequest();
	var url = (apiVersion == "new") ? newApi : baseUrl;
	xhr.open("GET", url + currentHostname, true);

  if(apiVersion && apiVersion == "new"){
    xhr.setRequestHeader('X-Bonusway-Locale', chrome.i18n.getMessage('defaultLocale'));
    xhr.setRequestHeader('Authorization', 'Bonusway version="1.0" token="" verification=""');
  }

	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			var data = JSON.parse(xhr.responseText);
			param.success(data);
		}
	};
	xhr.onprogress = function (e) {};
	xhr.send();
}

function onStorageSet() {
	if (chrome.runtime.lastError) {
		debug && console.log(chrome.runtime.lastError);
	} else {
		debug && console.log("SET STORAGE OK");
	}
}

function toggleIcon(active) {
	if (active) {
		chrome.browserAction.setIcon({
			path: activeIconPng
		});
	} else {
		chrome.browserAction.setIcon({
			path: normalIconPng
		});
	}
}

/**
 *
 *   Common utils
 *
 **/

function hasCurrentUrl(data, url, callback) {
	var has, dataFilter;
	has = data.detectionTld.some(function (item) {
		if (!item.tld || item.tld.length === 0) return false;
		if (url.indexOf(item.tld) >= 0) {
			var parser = document.createElement('a');
			parser.href = '//' + item.tld;
			var parserRemoveSub = parser.hostname;
			if (parserRemoveSub.split('.').length > 2) {
				parserRemoveSub = parser.hostname.replace(/^[^.]+\./g, "");
			}

			var hostRemoveSub = url;
			if (hostRemoveSub.split('.').length > 2) {
				hostRemoveSub = url.replace(/^[^.]+\./g, "");
			}
			return (parserRemoveSub == hostRemoveSub) ? true : false;
		} else {
			return false;
		}
	});
	dataFilter = data.detectionTld.filter(function (item) {
		if (!item.tld || item.tld.length === 0) return false;
		if (url.indexOf(item.tld) >= 0) {
			var parser = document.createElement('a');
			parser.href = '//' + item.tld;
			var parserRemoveSub = parser.hostname;
			if (parserRemoveSub.split('.').length > 2) {
				parserRemoveSub = parser.hostname.replace(/^[^.]+\./g, "");
			}

			var hostRemoveSub = url;
			if (hostRemoveSub.split('.').length > 2) {
				hostRemoveSub = url.replace(/^[^.]+\./g, "");
			}

			return (parserRemoveSub == hostRemoveSub) ? true : false;
		} else {
			return false;
		}
	});
	if (!has) {
		callback(false, null);
	} else {
		callback(has, dataFilter[0]);
	}
}

function parseUrl(url) {
	if (!/^https?:\/\//i.test(url)) {
		url = 'http://' + url;
	}
	var parser = document.createElement('a');
	parser.href = url;
	return parser;
}

function inBlackList(arr) {
	var ret = false;
	var blackList = [
		'apmebf.com',
		'anrdoezrs.net',
		'commission-junction.com',
		'dpbolvw.net',
		'jdoqocy.com',
		'kqzyfj.com',
		'qksrv.net',
		'tkqlhce.com',
		'qksz.net',
		'emjcd.com',
		'afcyhf.com',
		'awltovhc.com',
		'ftjcfx.com',
		'lduhtrp.net',
		'tqlkg.com',
		'awxibrm.com',
		'cualbr.com',
		'rnsfpw.net',
		'vofzpwh.com',
		'yceml.net',
		'cj.com'
	];

	for (var i = 0; i < arr.length; i++) {
		var parsed = parseUrl(arr[i].url);
		console.log('parsed.hostname', parsed.hostname);
		for (var j = 0; j < blackList.length; j++) {
			console.log('blackList', blackList[j]);
			if (parsed.hostname.toString().indexOf(blackList[j]) !== -1) {
				updateBlackReferrers(document.location.href);
				ret = true;
				break;
			}
		}
		if (ret) {
			break;
		}
	}

	console.log('ret', ret);
	return ret;
}

function inBlackReferrers(referrerUrl, cb) {
	console.log('check if inBlackReferrers', referrerUrl);
	chrome.runtime.sendMessage({
		getBlackReferrers: true
	}, function (data) {
		console.log('blackReferrers--->', data);
		var exist = false;
		for (var i = 0; i < data.length; i++) {
			if (referrerUrl === data[i]) {
				chrome.runtime.sendMessage({
					setBlackReferrers: true,
					url: document.location.href
				}, function (data) {
						console.log('referrerUrl in blackReferrers list and update it');
				});
				exist = true;
			}
		}

		cb(exist);
	});
}

function updateBlackReferrers(url, cb) {
	chrome.runtime.sendMessage({
		setBlackReferrers: true,
		url: url
	}, function () {

	});
	// var str = localStorage.getItem('blackReferrers');
	// var arr;
	// if (str) {
	// 		arr = JSON.parse(str);
	// 		arr.push(url);
	// } else {
	// 		arr = [url]
	// }
	// localStorage.setItem('blackReferrers', JSON.stringify(arr));
	// console.log('updatedBlackReferrers ', arr);
}

/**
 *
 * Simple Utility for debouncing
 *
 */

function Debouncer(delay) {
	this.tid = null;
	this.delay = delay;
}

Debouncer.prototype.debounce = function (cb) {
	var that = this;
	return function () {
		if (that.tid) {
			clearTimeout(that.tid);
		}
		that.tid = setTimeout(cb, that.delay);
	}
}

function sendRequestCheckMessage() {
	chrome.storage.local.get("userData", function (result) {
		if (chrome.runtime.lastError) {
			chrome.browserAction.setBadgeText({
				text: ''
			});
		}

		if (result.userData && result.userData.id && result.userData.password) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", newApi + "/users/" + result.userData.id + "/messages?checkNew=1", true);
			xhr.setRequestHeader('Authorization', 'Bonusway version="1.0" token="' + result.userData.password + '" verification=""');
			xhr.setRequestHeader('X-Bonusway-Locale', 'fi');
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						var data = JSON.parse(xhr.responseText);
						if (data.count > 0) {
							chrome.browserAction.setBadgeText({
								text: data.count
							});
							chrome.browserAction.setBadgeBackgroundColor({
								color: '#FF0000'
							});
						} else {
							chrome.browserAction.setBadgeText({
								text: ''
							});
						}
					} else {
						chrome.browserAction.setBadgeText({
							text: ''
						});
					}

				}
			};
			xhr.onprogress = function (e) {};
			xhr.send();
		}
	});

}
