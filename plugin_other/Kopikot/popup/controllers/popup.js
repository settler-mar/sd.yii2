angular.module('starter').controller('PopupCtrl', function ($scope, $state, utils, config) {
	var nameApp = chrome.i18n.getMessage("nameApp");

	$scope.showBLogo = (nameApp.indexOf("Bonusway") > -1 && nameApp.indexOf("Bonusway.ro") == -1) ? true : false;
	$scope.showALogo = (nameApp.indexOf("Art") > -1) ? true : false;
	$scope.showKLogo = (nameApp.indexOf("Kopikot") > -1) ? true : false;
	$scope.showRLogo = (nameApp.indexOf("Bonusway.ro") > -1) ? true : false;

	$scope.openMainSite = function () {
		var url = config.api.baseURL;
		window.open(url, '_blank');
		window.close();
	};




	$scope.logout = function () {
		localStorage.clear();
		chrome.cookies.remove({
			url: utils.baseUrl,
			name: "un"
		});
		chrome.cookies.remove({
			url: utils.baseUrl,
			name: "up"
		});
		$state.go("login");
	};


});
