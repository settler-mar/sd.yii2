angular.module('starter')
	.service('config', function () {
		this.api = {
			baseURL: chrome.i18n.getMessage("baseUrl")
		};
		this.newApi = "https://api.bonusway.com";
	});
