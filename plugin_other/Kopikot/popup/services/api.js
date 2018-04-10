angular.module('starter')
	.service('api', function (config, $http, $q) {

		this.login = function (email, password) {
			var url = config.api.baseURL + 'api/login';
			var that = this;
			return $q(function (resolve, reject) {
				$http({
					method: 'POST',
					data: JSON.stringify({
						"email": email,
						"password": password
					}),
					url: url
				}).then(function (data) {
					if (data.data.challenge) {
						var obj = {
							error: "you need to login from the website"
						};
						if (extensionType === 'Firefox') {
							browser.tabs.create({
								"url": chrome.i18n.getMessage("baseUrl")
							});
							resolve(obj);
						} else {
							window.open(chrome.i18n.getMessage("baseUrl"), '_blank');
							resolve(obj);
						}
					} else {
						that.fetchUserDetails(data.data.id, data.data.password).then(function (data) {
							resolve(data);
						}, function (err) {
							reject(err);
						})
					}
				}, function (err) {
					reject(err);
				});
			});
		};

		this.fetchUserDetails = function (uid, password) {
			var url = config.api.baseURL + 'api/user/' + uid + '/' + password;
			return $q(function (resolve, reject) {
				$http({
					method: 'get',
					url: url
				}).then(function (data) {
					resolve(data.data);
				}, function (err) {
					reject(err);
				});
			});
		};
	});
