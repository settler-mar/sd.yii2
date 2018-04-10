var nameApp = chrome.i18n.getMessage("nameApp").toLocaleLowerCase();
var normalIconPng = chrome.i18n.getMessage("icon");
var activeIconPng = chrome.i18n.getMessage("activeIcon");
var timeInterval = 900000; //15minute

var debug = false;
debug && chrome.storage.local.clear();

// reset the storage everytime load from scratch
chrome.storage.local.clear();

// set up the storage scaffolding
chrome.storage.local.get(function (data) {
	console.log('check data scaffolding', data);
	// set up cashbacked
	if (!data.cashbacked) {
		data.cashbacked = {};
	}

	// set up afsrc array
	if (!data.afsrc) {
		data.afsrc = {};
	}

	// black tab id
	if (!data.blackTabIds) {
		data.blackTabIds = [];
	}

	// setup blackReferrers
	if (!data.blackReferrers) {
		data.blackReferrers = [];
	}

	chrome.storage.local.set(data, onStorageSet);
});

setInterval(sendRequestCheckMessage, timeInterval);

checkUrl("api/campaign/top", {
	success: function (data) {
		if (data.length > 0) {
			chrome.storage.local.set({
				campaignTop: data
			}, onStorageSet);
		}
	}
});

checkUrl("api/campaign/all", {
	success: function (campaignAll) {
		if (campaignAll.length > 0) {
			chrome.storage.local.get('campaignTop', function (data) {
				var topIndex = data.campaignTop.reduce(function (container, item, index) {
					container[item.id] = index;
					return container;
				}, {});
				var topToAll = campaignAll.reduce(function (container, item, index, data) {
					if (item.extension_visibility == "0") return container;
					if (typeof topIndex[item.id] == "number") {
						container[topIndex[item.id]] = item;
					}
					return container;
				}, []);
				topToAll = topToAll.reduce(function (box, item, index) {
					if (item) {
						box.push(item);
						return box;
					}
				}, []);
				campaignAll = campaignAll.filter(function (item1) {
					return -1 == topToAll.findIndex(function (item2) {
						return item2.id == item1.id;
					});
				});
				var concatData = topToAll.concat(campaignAll);

				chrome.storage.local.set({
					campaignAll: concatData
				}, onStorageSet);
				chrome.storage.local.set({
					campaignAllTrigger: {
						date: Date()
					}
				}, onStorageSet);
			});
		}
	}
});

checkUrl("api/campaign/get_tld", {
	success: function (data) {
		if (data.length > 0) {
			localStorage.detectionTld = JSON.stringify(data);
			chrome.storage.local.set({
				detectionTld: data
			}, onStorageSet);
		}
	}
});

var timestampRequestStart = {};

var initWebRequestsObserver = function(){
  var opts = ["responseHeaders"];
  var filter = {urls: ["<all_urls>"]};
  var cbProcessDetails = function(details){
    if (details.type !== 'main_frame') return;
    if (details.tabId < 0) return;
    console.log("webRequest", details.requestId, details);
    Tracer.addWebRequestInfo(details.tabId, details, timestampRequestStart[details.requestId] );
    delete timestampRequestStart[details.requestId];
  };
  chrome.webRequest.onBeforeRequest.addListener(function(details){
    if (details.type !== 'main_frame') return;
    if (details.tabId < 0) return;
    timestampRequestStart[details.requestId] = Date.now();
  }, filter, []);
  chrome.webRequest.onBeforeRedirect.addListener(cbProcessDetails,filter,opts);
  chrome.webRequest.onCompleted.addListener(cbProcessDetails,filter,opts);
};


// initialize webRequest and webNavigation observer
initWebRequestsObserver();



chrome.tabs.onRemoved.addListener(function (tabId) {
	console.log('tab id is removing.....', tabId);
	chrome.storage.local.get('blackTabIds', function (data) {
		if (data.blackTabIds.indexOf(tabId) !== -1) {
				data.blackTabIds.splice(data.blackTabIds.indexOf(data),1)
		}

		chrome.storage.local.set({
			blackTabIds: data.blackTabIds
		});
	});
});
