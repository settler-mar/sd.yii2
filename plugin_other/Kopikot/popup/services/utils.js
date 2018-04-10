angular.module('starter')
	.service('utils', function (api) {
		this.baseUrl = chrome.i18n.getMessage("baseUrl");
		this.isValidEmail = function (email) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		};

		this.getUser = function (cb) {
			var that = this;
			chrome.cookies.getAll({
				url: that.baseUrl
			}, function (cookies) {
				var userData = cookies.reduce(function (obj, item) {
					if (item.name == "up" || item.name == "un" || item.name == "partly-login-email") {
						obj[item.name] = item.value;
					}
					return obj;
				}, {});
				if (typeof userData.un !== 'undefined' && typeof userData.up !== 'undefined' && typeof userData["partly-login-email"] === "undefined") {
					chrome.extension.getBackgroundPage().console.log(userData);
					api.fetchUserDetails(userData.un, userData.up).then(function (data) {
						cb(data);
						chrome.runtime.sendMessage({
							handleUserData: {
								action: 'save'
							},
							userData: data
						});
					})
				} else {
					chrome.runtime.sendMessage({
						handleUserData: {
							action: 'remove'
						}
					});
					cb({});
				}
			});
		};

		// check the current page supported or not
		// if support return general information of the campaign
		this.checkCampaign = function (cb) {
			var that = this;
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function (tabs) {
				var host = parseUrl(tabs[0].url).hostname;
				console.log('host', host);
				chrome.runtime.sendMessage({
					detectionTld: true,
					hostname: host
				}, cb);
			});
		};

	});
