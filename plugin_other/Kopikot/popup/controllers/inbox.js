angular.module('starter').controller('InboxCtrl', function (inbox, $scope, $state, $rootScope) {
	$scope.page = 1;
	$scope.perPage = 10;
	$scope.dateFormat = 'YYYY-MM-DD HH:mm:ss';
	$scope.fromDateFormat = 'YYYY-MM-DDTHH:mm:ss[Z]';
	$scope.cashText = chrome.i18n.getMessage('cash');
	$scope.noMoreData = true;
	$scope.messages = [];
	$scope.error = false;
	$scope.loading = false;
	$scope.inboxMenu = chrome.i18n.getMessage('inbox');
	$scope.shopMenu = chrome.i18n.getMessage('shop');
	$scope.markAllWord = chrome.i18n.getMessage('markAllAsRead');
	$scope.loadMoreButton = chrome.i18n.getMessage('loadmore');

	load();

	function load() {
		$scope.loading = true;
		return inbox.fetchMessages($scope.page, $scope.perPage).then((data) => {
			$scope.loading = false;
			if (data.length) {
				if (data.length == $scope.perPage) {
					$scope.noMoreData = false;
				}
				$scope.messages = $scope.messages.concat(data);
			} else {
				$scope.noMoreData = true;
			}

		}, () => {
			$scope.loading = false;
			$scope.error = {
				text: "cannot get message"
			};
		});
	}

	$scope.fetchMessage = function (message) {
		inbox.putMessage(message.id, {
			read: true
		}).then((data) => {
			$state.go("messageDetail", {
				messageId: message.id
			});
		}, (err) => {
			$scope.error = {
				text: "Cannot get single message"
			};
		});
	}

	$scope.markAll = function () {
		inbox.markAllasRead().then(() => {
			$scope.messages.forEach((message) => {
				message.read = true;
			});
			chrome.browserAction.setBadgeText({
				text: ''
			});
			$rootScope.user.messageNotification = 0;
			console.log($rootScope.user.messageNotification);
		}, () => {
			$scope.error = {
				text: "cannot mark all as read"
			};
		});
	}

	$scope.loadMore = function () {
		$scope.page++;
		load();
	}
});
