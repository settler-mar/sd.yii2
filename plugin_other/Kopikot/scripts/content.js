$(function () {
	/**
	 *
	 * listen on click event on document to capture the link afsrc
	 * In this case, handle the afsrc is only the parameter to the server
	 * but ui can not get the afsrc paramter after redirection
	 *
	 */
	// var elements = document.getElementsByTagName('a');
	// for (var i = 0, len = elements.length; i < len; i++) {
	// 	elements[i].onclick = function (event) {
	// 		console.log('event', this.href);
	// 		if (this.href) {
	// 			var parsed = parseUrl(this.href);
	// 			console.log(parsed);
	// 			console.log(parsed.search);
	// 			if (parsed.search.indexOf('afsrc=') !== -1 || parsed.search.match(/afsrc=/i) || parsed.search.match(/cj/ig) !== null || parsed.search.match(/CommissionJunction/ig) !== null || parsed.search.match(/Conversant/ig) !== null) {
	// 				var now = Date.now();
	// 				var target = location.href;
	// 				var delay = now + 1000 * 60 * 15;
	// 				// start to store in Storage
	// 				chrome.runtime.sendMessage({
	// 					handleAfsrc: true,
	// 					referrer: target,
	// 					delay: delay
	// 				});
	// 			}
	// 		}
	// 	};
	// }
	// need to handle when the page is redirected from a page contain afsrc first
	afsrcReferrer(document.referrer, function (needDelay) {
		// then need to handle when the page url contain afsrc
		if (!afsrc(location.search) && !needDelay) {
			detectAdBlock();

			/**
			 *    send current page url to the background for two purposes:
			 *    1, let the background to highlight the icon if support.
			 *    2, fetch the detectionTld data that render the highlight banner.
			 **/
			detectAdBlock();

			// check if the tab inside the black list
			chrome.runtime.sendMessage({
				blackList: true
			}, function (traceUrls) {
				console.log('traceUrls', traceUrls);
				if (!inBlackList(traceUrls)) {
					inBlackReferrers(document.referrer, function (exist) {
						console.log('exist referrer--->', exist);
						if (!exist) {
							chrome.runtime.sendMessage({
								currentTag: true
							}, function (currentTag) {
								console.log('currentTag', currentTag);
								chrome.runtime.sendMessage({
									getBlackTabIds: true
								}, function (blackTabIds) {
									console.log('black tab ids--->', blackTabIds);
									var isFirefox = true;
									if (typeof currentTag.openerTabId !== 'undefined') {
										// meaning not firefox
										isFirefox = false;
									}
									console.log('isFirefox..', isFirefox);
									if ( (blackTabIds.indexOf(currentTag.id) === -1) && (blackTabIds.indexOf(currentTag.openerTabId) === -1) && !isFirefox) {
										checkURLSupport(location.hostname, handleDetectionTld);
									} else if ((blackTabIds.indexOf(currentTag.id) === -1) && (blackTabIds.indexOf(currentTag.windowId) === -1) && isFirefox) {
										checkURLSupport(location.hostname, handleDetectionTld);
									} else {
										console.log('setBlackTabIds...');
										chrome.runtime.sendMessage({
											setBlackTabIds: true
										});
									}
								});


							});

						} else {
							chrome.runtime.sendMessage({
								setBlackTabIds: true
							});
						}
					})
				} else {
					chrome.runtime.sendMessage({
						setBlackTabIds: true
					});
				}
			});

			/**
			 *
			 * Check the first google search items
			 *
			 */

			checkGoogle();
			checkBlackFriday();
		}
	});

	function checkGoogle() {
		if (/\.*google\./ig.test(location.hostname)) {
			setTimeout(function () {
				var url = parseUrl($('#ires').find("._Rm").eq(0).text());
				if (url.hostname) {
					checkURLSupport(url.hostname, handleGoogleAds);
				}
			}, 1000)
		}
	}

	// check if user search for black friday
	function checkBlackFriday(){
    if (/(?:(?:black\+friday))|(?:(?:blackfriday))/ig.test(window.location.href) && (/\.*google\./ig.test(location.hostname))) {
      chrome.storage.local.get('blackFridayClosed', function(data){
      	if(jQuery.isEmptyObject(data)){
          handleBlackFriday();
				}
			});
		}
	}


	// set debouncer here
	var debouncer = new Debouncer(1000);

	// start observer
	var observer = new MutationObserver(debouncer.debounce(checkGoogle));
	observer.observe(document.querySelector('body'), {
		childList: true
	});

})
