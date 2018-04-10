angular.module('starter')
	.service('inbox', function (config, $http, $q, $rootScope) {
		this.fetchMessages = fetchMessages;
		this.checkMessages = checkMessages;
		this.fetchMessage = fetchMessage;
		this.markAllasRead = markAllasRead;
		this.putMessage = putMessage;

		function fetchMessages(page, perPage) {
			page = page || 1;
			perPage = perPage || 10;

			var offset = (page - 1) * perPage;
			var url = config.newApi + "/users/" + $rootScope.user.id + "/messages?limit=" + perPage + "&offset=" + offset;

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
		}

		function checkMessages() {
			var url = config.newApi + "/users/" + $rootScope.user.id + "/messages?checkNew=1";

			return $q(function (resolve, reject) {
				$http({
					method: 'get',
					url: url
				}).then(function (data) {
					resolve(data.data);
					$rootScope.user.messageNotification = '';
				}, function (err) {
					reject(err);
				});
			});
		}

		function markAllasRead() {
			var url = config.newApi + "/users/" + $rootScope.user.id + "/messages/markAllasRead";

			return $q(function (resolve, reject) {
				$http({
					method: 'put',
					url: url
				}).then(function (data) {
					resolve(data.data);
				}, function (err) {
					reject(err);
				});
			});
		}

		function fetchMessage(id) {
			var url = config.newApi + "/users/" + $rootScope.user.id + "/messages/" + id;

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
		}

		function putMessage(id, obj) {
			var url = config.newApi + "/users/" + $rootScope.user.id + "/messages/" + id;

			// if only need to make as read then payload can only be:
			// { id: xxx, read: true }
			return $q(function (resolve, reject) {
				$http({
					method: 'put',
					url: url,
					data: obj
				}).then(function (data) {
					resolve(data.data);
				}, function (err) {
					reject(err);
				});
			});
		}
	});
