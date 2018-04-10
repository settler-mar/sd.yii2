angular.module('starter').controller('ShopsCtrl', function ($scope, $state, utils, config, $timeout, $rootScope, inbox, $http) {
	// campaigns contains the original campaigns;
	$scope.campaigns = [];
	$scope.activeCampaign;
	$scope.hideActiveCampBtn = false;
	$scope.cashText = chrome.i18n.getMessage('cash');
	$scope.get_cashbackText = chrome.i18n.getMessage('get_cashback');
	$scope.inboxMenu = chrome.i18n.getMessage('inbox');
	$scope.shopMenu = chrome.i18n.getMessage('shop');

	// the container is use for dynamically change and show to the user search results
	$scope.searchCampaignsContainer = [];
	$scope.searchKeyword = '';
	$scope.baseURL = config.api.baseURL;
	$scope.commisionStr = commisionStr;

	// variables for debouncing
	var filterTextTimeout;

	$scope.fetchShops = function () {
		$scope.loading = true;
		chrome.storage.local.get('campaignAll', function (data) {
			$scope.searchCampaignsContainer = $scope.campaigns = data.campaignAll;
			$scope.loading = false;
			$scope.$apply();
		});
	};

	$scope.openCampaign = function (uid, itemId) {
		var url = $scope.baseURL + '/waiting/' + uid + '/' + itemId + '?type=2';
		var win = null;

		var timer = setTimeout(function () {
			win = window.open(url, '_blank');
			window.close();
		}, 100);

		setCashbacked({
			id: itemId
		}, function () {
			win = window.open(url, '_blank');
			if (win) {
				clearTimeout(timer);
				window.close();
			}
		});
	};

	$scope.$watch('searchKeyword', function (val) {
		if (filterTextTimeout) $timeout.cancel(filterTextTimeout);

		filterTextTimeout = $timeout(function () {
			$scope.triggerSearch(val)
		}, 250);
	});

	$scope.triggerSearch = function (searchKeyword) {
		var txtInput = searchKeyword.toLowerCase();

		var results = $scope.campaigns;

		results = results.filter(function (item) {
			if (!item || !item.title) {
				return false;
			}
			return (item.title.toLocaleLowerCase().indexOf(txtInput) >= 0) ? true : false;
		});
		$scope.searchCampaignsContainer = results;
		$scope.$apply();
	};

	function checkCampaign() {
		utils.checkCampaign(function (data) {
			console.log('get response from background in POPup', data);
			if (data.has) {
				$scope.activeCampaign = data.campaignDetails;

				// check if the current campaign's status (inactive/active/banned)
				// then decide to hide or show button
				checkCampaignStatus(data.campaignDetails, function (state) {
					if (state === 'actived') {
						$scope.hideActiveCampBtn = true;
						$scope.loading = false;
						$scope.$apply();
					} else {
						$scope.hideActiveCampBtn = false;
						$scope.loading = false;
						$scope.$apply();
					}
				});
			} else {
				$scope.fetchShops();
			}
		});
	}

	$scope.init = function () {
		// the init function will first check the user status, redirect to login page if not logged in
		// then check if the url supported
		// if yes, render the specific campaign page instead of listing all the campaigns
		// if no, render all campaigns

		if ($rootScope.user) {
			$rootScope.unClickAble = false;
		} else {
			$rootScope.unClickAble = true;
		}
		$scope.loading = true;
		pluginNotify($rootScope.user);
		checkCampaign();
	};

	$scope.init();
});
