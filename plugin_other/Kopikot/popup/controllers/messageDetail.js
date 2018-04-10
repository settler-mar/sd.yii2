angular.module('starter').controller('MessageDetailCtrl', function (inbox, $scope, $state, $stateParams, $sce) {
	$scope.cashText = chrome.i18n.getMessage('cash');
	$scope.error = false;
	$scope.inboxMenu = chrome.i18n.getMessage('inbox');
	$scope.shopMenu = chrome.i18n.getMessage('shop');
	$scope.backText = chrome.i18n.getMessage('back');
	load();

	function load() {
		return inbox.fetchMessage($stateParams.messageId).then((data) => {
			$scope.message = data;
			var bodyMessage = window.markdown.toHTML(data.body);
			var pattern = /a href=/g;
			bodyMessage = bodyMessage.replace(pattern, "a target='_blank' href=");
			$scope.message.body = $sce.trustAsHtml(bodyMessage);
			$scope.message.created = convertDate($scope.message.created);
		}, () => {
			$scope.error = {
				text: "cannot get message"
			};
		});
	}

	function convertDate(date) {
		var dateString = new Date(date); // return to dd/mm/yyyy hh:mm

		var month = dateString.getMonth() + 1;
		var fullMonth = ('0' + month).slice(-2);
		var fullDate = ('0' + dateString.getDate()).slice(-2);
		var fullHour = ('0' + dateString.getHours()).slice(-2);
		var fullMinute = ('0' + dateString.getMinutes()).slice(-2);
		var fullSeconds = ('0' + dateString.getSeconds()).slice(-2);

		var dateConverted = fullDate + '/' + fullMonth + '/' + dateString.getFullYear() + "\n" + fullHour + ":" + fullMinute + ":" + fullSeconds;
		return dateConverted;
	}

	$scope.fetchMessage = function (message) {
		$state.go("messageDetail", {
			messageId: message.id
		});
	}
});
