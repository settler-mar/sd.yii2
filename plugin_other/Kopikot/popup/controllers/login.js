angular.module('starter').controller('LoginCtrl', function ($scope, api, utils, $state, $rootScope, $http) {
	$scope.error = {};
	$scope.loginInfoText = {
		email: chrome.i18n.getMessage('email'),
		password: chrome.i18n.getMessage('password'),
		sign_in: chrome.i18n.getMessage('sign_in')
	};
	$scope.loading = false;
	$scope.promoSignUp = {
		'no_account_yet': chrome.i18n.getMessage('no_account_yet'),
		'join_now': chrome.i18n.getMessage('join_now'),
		'join_now_url': chrome.i18n.getMessage('join_now_url')
	};

	if (chrome.i18n.getMessage('nameApp') === "Kopikot") {
		$scope.socialBtns = [{
				class: 'but vk',
				url: utils.baseUrl + 'api/sociallogin?service=Vkontakte'
			},
			{
				class: 'but ok',
				url: utils.baseUrl + 'api/sociallogin?service=Odnoklassniki'
			},
			{
				class: 'but mail',
				url: utils.baseUrl + 'api/sociallogin?service=Mailru'
			},
			{
				class: 'but fb',
				url: utils.baseUrl + 'api/sociallogin?service=Facebook'
			}
		];
	} else if (chrome.i18n.getMessage('nameApp')=== "Kopikot.by") {
		$scope.socialBtns = [{
				class: 'but vk',
				url: 'https://oauth.vk.com/authorize?client_id=6109583&redirect_uri=https://www.kopikot.by/oauth-login?type=vkontakte&response_type=token&scope=email,offline&display=page'
			},
			{
				class: 'but ok',
				url: 'https://connect.ok.ru/oauth/authorize?client_id=1107767808&scope=GET_EMAIL&response_type=token&redirect_uri=https://www.kopikot.by/oauth-login?type=ok&layout=w&state=fuck'
			},
			{
				class: 'but yandex',
				url: 'https://oauth.yandex.ru/authorize?response_type=token&client_id=b7aeb08fe54d4af7a5e8a0049d569597'
			},
			{
				class: 'but fb',
				url: 'https://www.facebook.com/v2.5/dialog/oauth?response_type=token&client_id=922686721206063&redirect_uri=https://www.kopikot.by/oauth-login?type=facebook&scope=email,public_profile,user_friends'
			},
			{
				class: 'but google',
				url: 'https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=https://www.kopikot.by/oauth-login?type=google&prompt=consent&response_type=code&client_id=350518387970-57r0uafh686ig61fou0k65r4jmmriovo.apps.googleusercontent.com&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile&access_type=offline'
			}
		];
	} else if (chrome.i18n.getMessage('nameApp') === "Bonusway.kz") {
		$scope.socialBtns = [{
				class: 'but vk',
				url: 'https://oauth.vk.com/authorize?client_id=6081961&redirect_uri=https://www.bonusway.kz/oauth-login?type=vkontakte&response_type=token&scope=email,offline&display=page'
			},
			{
				class: 'but ok',
				url: 'https://connect.ok.ru/oauth/authorize?client_id=1251672320&scope=GET_EMAIL&response_type=token&redirect_uri=https://www.bonusway.kz/oauth-login?type=ok&layout=w&state=fuck'
			},
			{
				class: 'but yandex',
				url: 'https://oauth.yandex.ru/authorize?response_type=token&client_id=866fe1f3c761498fba5dcdb73a243b31'
			},
			{
				class: 'but fb',
				url: 'https://www.facebook.com/v2.5/dialog/oauth?response_type=token&client_id=1935399350083062&redirect_uri=https://www.bonusway.kz/oauth-login?type=facebook&scope=email,public_profile,user_friends'
			},
			{
				class: 'but google',
				url: 'https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=https://www.bonusway.kz/oauth-login?type=google&prompt=consent&response_type=code&client_id=350518387970-57r0uafh686ig61fou0k65r4jmmriovo.apps.googleusercontent.com&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile&access_type=offline'
			}
		];
	} else {
		$scope.socialBtns = [{
			class: 'but fb fb-all',
			url: utils.baseUrl + 'api/sociallogin?service=Facebook',
			text: 'Facebook'
		}];
	}
	$scope.login = function (email, password) {
		$scope.loading = true;
		$scope.error = {};
		if (utils.isValidEmail(email)) {
			api.login(email, password).then(function (userData) {
				// if reCap require then redirect to the site
				// otherwise, continue
				if (userData.error) {
					if (userData.error.indexOf('credentials') > -1) {
						$scope.error = {
							text: chrome.i18n.getMessage('incorrect_user_data')
						}
					} else {
						$scope.error = {
							text: userData.error
						}
					}
				} else {
					$rootScope.user = userData;
					chrome.runtime.sendMessage({
						handleUserData: {
							action: 'save'
						},
						userData: userData
					});
					pluginNotify(userData);
					$scope.loading = false;
					$state.go('shops');

				}
			})
		} else {
			$scope.loading = false;
			$scope.error = {
				text: chrome.i18n.getMessage('invalid_email')
			}
		}
	}
	$scope.getUser = function () {
		var user = utils.getUser(function (user) {
			if (user.id && user.password) {
				$rootScope.user = user;
				$state.go('shops');
			}
		});
	}
	$scope.getUser();
});
