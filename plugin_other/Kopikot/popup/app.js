angular.module('starter', ['ui.router'])
	.run(function ($rootScope, inbox, $http, utils, $state) {
		utils.getUser(function (user) {
			if (user.id && user.password) {
				$rootScope.user = user;
				$rootScope.unClickAble = false;
				$http.defaults.headers.common.Authorization = 'Bonusway version="1.0" token="' + $rootScope.user.password + '" verification=""';
				$http.defaults.headers.common["X-Bonusway-Locale"] = chrome.i18n.getMessage('defaultLocale');

				inbox.checkMessages().then(function (data) {
					$rootScope.user.messageNotification = data.count;
					if (data.count != "0") {
						$state.go('inbox');
					} else {
						$state.go('shops')
					}
				}, (err) => {
					$rootScope.user.messageNotification = '';
				});
			} else {
				$state.go('login');
			}
		});

		$rootScope.$on("$stateChangeStart", (event, toState, toParams, fromState, fromParams) => {
			if ($rootScope.user) {
				// right now all of the request require state.change, so we will append the headers when state change, later on if we want to develop this
				// create an interceptor service
				$http.defaults.headers.common.Authorization = 'Bonusway version="1.0" token="' + $rootScope.user.password + '" verification=""';
				$http.defaults.headers.common["X-Bonusway-Locale"] = chrome.i18n.getMessage('defaultLocale');
				inbox.checkMessages().then(function (data) {
					$rootScope.user.messageNotification = data.count;
					if (data.count != "0" && fromState.name == "login") {
						$state.go('inbox');
					}
				}, (err) => {
					$rootScope.user.messageNotification = '';
				});
			}
		});
	})
	.config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('login', {
				url: '/login',
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl'
			})
			.state('shops', {
				url: '/shops',
				templateUrl: 'views/shops.html',
				controller: 'ShopsCtrl'
			})
			.state('inbox', {
				url: '/inbox',
				templateUrl: 'views/inbox.html',
				controller: 'InboxCtrl'
			})
			.state('messageDetail', {
				url: '/message/:messageId',
				templateUrl: 'views/messageDetail.html',
				controller: 'MessageDetailCtrl'
			})
		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/shops');
	});
