chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.detectionTld) {
		debug && console.log('get detectionTld event', request);
		/**
		 *
		 * There are two tasks need to be handled when get this event
		 * 1, fetch the detectionTld data from storage
		 * 2, check the url get from content if support or not, to avoid multiple checks in the content script side.
		 * 3, also return the user data if logged in to avoid other separated call.
		 */
		chrome.storage.local.get('detectionTld', function (data) {
			debug && console.log('data in detectionTld', data);
			hasCurrentUrl(data, request.hostname, function (has, info) {
				/* 1, has  -> true | false */
				/* 2, info -> campaign detail infomation related to the url */
				/* 3, data.user -> user info */
				if (has) {
					// highlight the icon
					toggleIcon(true);

					data.has = true;
					data.info = info;
					data.user = {};

					// if has, do a further step, to query the detailed info of that campaign
					chrome.storage.local.get('campaignAll', function (campaignData) {
						data.campaignDetails = campaignData.campaignAll.find(function (campaign) {
							return campaign.id === info.id
						});
						// first need to check if the cookies still there
						// the reason why we need to set a checking process here
						// is, if the user logged/logout in from the web site, but never click the popup icon button
						// from the extension point of view, there is no user data been set to the storage.
						// thus, we need to setup this checking procedure
						chrome.cookies.getAll({
							url: baseUrl
						}, function (cookies) {
							var userDataFromCookies = cookies.reduce(function (obj, item) {
								if (item.name == "up" || item.name == "un") {
									obj[item.name] = item.value;
								}
								return obj;
							}, {});

							if (typeof userDataFromCookies.un !== 'undefined' && typeof userDataFromCookies.up !== 'undefined') {
								userDataFromCookies.id = userDataFromCookies.un;
								userDataFromCookies.password = userDataFromCookies.up;
								// fetch the user Data from the storage
								chrome.storage.local.get('userData', function (userData) {
									console.log('before', data.user);
									console.log('userData', userData);
									if (userData.userData) {
										data.user = userData.userData;
									}
									console.log('after', data.user);
									if (data.user.id && data.user.password) {
										sendResponse(data);
									} else {
										data.user = userDataFromCookies;
										chrome.runtime.sendMessage({
											handleUserData: {
												action: 'save'
											},
											userData: userDataFromCookies
										});
										console.log('send sendResponse', data);
										sendResponse(data);
									}
								})
							} else {
								chrome.runtime.sendMessage({
									handleUserData: {
										action: 'remove'
									}
								});
								sendResponse(data);
							}
						});
					});
				} else {
					toggleIcon(false);
					data.has = false;
					sendResponse(data);
				}
			})
		})
		return true;
	} else if (request.notification) {
		chrome.notifications.create({
			"type": "basic",
			"title": request.title,
			"iconUrl": activeIconPng,
			"message": request.message
		});
	} else if (request.handleUserData) {
		if (request.handleUserData.action === 'save') {
			chrome.storage.local.set({
				userData: request.userData
			}, onStorageSet);
		} else {
			chrome.storage.local.set({
				userData: {}
			}, onStorageSet);
		}
	} else if (request.handleAfsrc) {
		chrome.storage.local.get('afsrc', function (data) {
			var target = data.afsrc;
			target[request.referrer] = request.delay;
			chrome.storage.local.set({
				afsrc: target
			}, function () {
				console.log('set afsrc handler done!')
			});
		});
	} else if (request.setBlackReferrers) {
		console.log('request setBlackReferrers url', request.url);
		chrome.storage.local.get('blackReferrers', function (data) {
			if (data.blackReferrers.indexOf(request.url) === -1) {
				data.blackReferrers.push(request.url);
				chrome.storage.local.set({
					blackReferrers: data.blackReferrers
				}, function () {
					sendResponse(data.blackReferrers);
				});
			} else {
				console.log('blackReferrer url exist', request.url);
				sendResponse(data.blackReferrers);
			}
		});
	} else if (request.getBlackReferrers) {
		console.log('getBlackReferrers Received');
		chrome.storage.local.get('blackReferrers', function (data) {
			console.log('getBlackReferrers', data);
			sendResponse(data.blackReferrers);
		});
		return true;
	} else if (request.blackList) {
		console.log('currentTabId in bg', sender.tab.id);
		var logInfo = Tracer.getLog(sender.tab.id);
		console.log('logInfo in bg', logInfo);
		sendResponse(logInfo);
	} else if (request.setBlackTabIds) {
		chrome.tabs.query({active: true}, function(tabs){
			var tab = tabs[0];
			var tabId = tab.id;
			var openerTabId = tab.openerTabId;
			console.log('inside setBlackTabIds ===> tab', tab);
			console.log('inside setBlackTabIds ===> currentTabId', tabId);

			if (typeof openerTabId === 'undefined') {
				// means firefox
				openerTabId = tab.windowId;
			}
			console.log('inside setBlackTabIds ===> openerTabId', openerTabId);
			chrome.storage.local.get('blackTabIds', function (data) {
				if (data.blackTabIds.indexOf(tabId) === -1) {
					data.blackTabIds.push(tabId);
				}

				if (data.blackTabIds.indexOf(openerTabId) === -1) {
					data.blackTabIds.push(openerTabId);
				}

				chrome.storage.local.set({
					blackTabIds: data.blackTabIds
				}, function () {
					sendResponse(data.blackTabIds);
				});
			});

		});
	} else if (request.getBlackTabIds) {
		chrome.storage.local.get('blackTabIds', function (data) {
			console.log('blackTabIds', data);
			sendResponse(data.blackTabIds);
		});
		return true;
	} else if (request.currentTag) {
		chrome.tabs.query({active: true}, function(tabs){
			var tab = tabs[0];

			sendResponse(tab);
		});
		return true;
	}
});
