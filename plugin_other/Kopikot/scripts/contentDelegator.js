function checkURLSupport(hostname, cb) {
	chrome.runtime.sendMessage({
		detectionTld: true,
		hostname: hostname
	}, cb);
}

function handleDetectionTld(data) {
	if (data.has) {
		/**
		 * Render banner part, three states
		 * 1, actived => renderActivedBanner
		 * 2, inActived? => renderInactivedBanner
		 * 3, hijacked => renderHijackedBanner
		 */
		checkCampaignStatus(data.campaignDetails, function (state) {
			// if user logged in then render the banner
			if (data.user.id && data.user.password) {
				switch (state) {
				case 'actived':
					renderActiveBanner(data);
					break;
				case 'inActived':
					renderInactivedBanner(data);
					break;
				case 'hijacked':
					renderHijackedBanner(data);
					break;
				}
			}
		});
	}
}

function renderHijackedBanner(data) {
	$('.kopikot-extension').remove();
	var bannerStr = _.template(chrome.i18n.getMessage("warnningCashbackBanner"));
	var linkUrl = baseUrl + 'waiting/' + data.user.id + '/' + data.campaignDetails.id + '?type=2';
	var compiledbannerStr = bannerStr({
		name: chrome.i18n.getMessage("name"),
		shop: data.campaignDetails.title,
		summ: commisionStr(data.campaignDetails.commissions)
	});
	var body = $('body').prepend('<div class="kopikot-extension">\
                            <div class="kopikot-extension-logo">\
                                <a href="' + baseUrl + '" target="_blank">\
                                    <img src="' + topBannerLogo + '" alt="" />\
                                </a>\
                            </div>\
                            <div class="kopikot-extension-content"> ' + compiledbannerStr + '</div>\
                            <div class="kopikot-extension-get">\
                                <a class="kopikot-extension-btn" href="#">' + chrome.i18n.getMessage('get_cashback') + ' </a>\
                            </div>\
                            <div class="kopikot-extension-close">\
                                <div class="kopikot-extension-icon">×</div>\
                            </div>\
                        </div>');

	body.find('.kopikot-extension-close').click(function () {
		// add timestamp for next 24hrs
		localStorage.setItem(data.campaignDetails.id, new Date().getTime() + (24 * 60 * 60 * 1000));
		$('.kopikot-extension').remove();
	});
	body.find(".kopikot-extension-get").click(function (ev) {
		ev.preventDefault();
		if (!checkAdBlock()) {
			setCashbacked(data.campaignDetails, function () {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
				} else {
					document.location = linkUrl;
				}
			})
		}
	});
}

function renderActiveBanner(data) {
	$('.kopikot-extension').remove();
	var text = (typeof data.campaignDetails.ext_banner_text != "undefined" && data.campaignDetails.ext_banner_text) ? data.campaignDetails.ext_banner_text : chrome.i18n.getMessage("activatedCashbackBanner");
	var bannerStr = _.template(text);
	var compiledbannerStr = bannerStr({
		shop: data.campaignDetails.title,
		summ: commisionStr(data.campaignDetails.commissions)
	});
	setTimeout(checkAdBlock, 1000);
	$('body')
		.prepend('<div class="kopikot-extension">\
                <div class="kopikot-extension-logo">\
                    <a href="' + baseUrl + '" target="_blank">\
                        <img src="' + topBannerLogo + '" alt="" />\
                    </a>\
                </div>\
                <div class="kopikot-extension-content"> ' + compiledbannerStr + ' </div>\
                <div  class="kopikot-extension-close">\
                    <div class="kopikot-extension-icon">×</div>\
                </div>\
            </div>')

		.find('.kopikot-extension-close')
		.click(function () {
			$('.kopikot-extension').remove();
		});
}

function renderInactivedBanner(data) {
	$('.kopikot-extension').remove();
	var text = (typeof data.campaignDetails.ext_banner_text != "undefined" && data.campaignDetails.ext_banner_text) ? data.campaignDetails.ext_banner_text : chrome.i18n.getMessage("nonActivatedCashbackBanner");
	var bannerStr = _.template(text);
	var linkUrl = baseUrl + 'waiting/' + data.user.id + '/' + data.campaignDetails.id + '?type=2';
	var compiledbannerStr = bannerStr({
		name: chrome.i18n.getMessage("name"),
		shop: data.campaignDetails.title,
		summ: commisionStr(data.campaignDetails.commissions)
	});

	var showInactiveBanner = function () {
		var body = $('body').prepend('<div class="kopikot-extension">\
                              <div class="kopikot-extension-logo">\
                                  <a href="' + baseUrl + '" target="_blank">\
                                      <img src="' + topBannerLogo + '" alt="" />\
                                  </a>\
                              </div>\
                              <div class="kopikot-extension-content"> ' + compiledbannerStr + '</div>\
                              <div class="kopikot-extension-get">\
                                  <a class="kopikot-extension-btn" href="#">' + chrome.i18n.getMessage('get_cashback') + ' </a>\
                              </div>\
                              <div class="kopikot-extension-close">\
                                  <div class="kopikot-extension-icon">×</div>\
                              </div>\
                          </div>');

		body.find('.kopikot-extension-close').click(function () {
			// add timestamp for next 24hrs
			localStorage.setItem(data.campaignDetails.id, new Date().getTime() + (24 * 60 * 60 * 1000));
			$('.kopikot-extension').remove();
		});
		body.find(".kopikot-extension-get").click(function (ev) {
			ev.preventDefault();
			if (!checkAdBlock()) {
				setCashbacked(data.campaignDetails, function () {
					if (chrome.runtime.lastError) {
						console.log(chrome.runtime.lastError);
					} else {
						document.location = linkUrl;
					}
				})
			}
		});
	};

	// check the last click time
	if (localStorage.getItem(data.campaignDetails.id)) {
		if (new Date().getTime() > localStorage.getItem(data.campaignDetails.id)) {
			localStorage.removeItem(data.campaignDetails.id);
			showInactiveBanner();
		}
	} else {
		showInactiveBanner();
	}
}

function handleGoogleAds(data) {
	if (data.has && data.user.id) {
		var bannerStr = _.template(chrome.i18n.getMessage("nonActivatedCashbackBanner"));
		//var linkUrl = baseUrl + 'waiting/' + data.user.id + '/' + data.campaignDetails.id + '?type=2';
		var linkUrl = baseUrl + 'stores/' + data.campaignDetails.url_name + '/' + data.campaignDetails.id;
		var compiledBannerStr = bannerStr({
			name: chrome.i18n.getMessage("name"),
			shop: data.campaignDetails.title,
			summ: commisionStr(data.campaignDetails.commissions)
		});
		$('.inj-cont').remove();
		$('#ires').find("._Rm").eq(0).parent().before('<div class="inj-cont"><img src="' + googleAdsLogo + '" alt=""> <a href="' + linkUrl + '" class="kopikot-extension-get" target="_blank"> ' + compiledBannerStr + ' </a></div>');
		$('body').find(".inj-cont .kopikot-extension-get").click(function (ev) {
			ev.preventDefault();
			if (!checkAdBlock()) {
				setCashbacked(data.campaignDetails, function () {
					if (chrome.runtime.lastError) {
						console.log(chrome.runtime.lastError);
					} else {
						document.location = linkUrl;
					}
				})
			}
		});
	}
}

function handleBlackFriday(){
  var main;
  checkUrl("/offers?type=tag1&limit=3&offset=0&order=popularity", {
    success: function (offers) {
      if (offers.length > 0) {
        main = $("#center_col").prepend(
        	'<div class="google-search-box">\
						<div class="google-search-box-bw">\
							<div class="google-search-bw-banner">\
								<a href="' + baseUrl + '" target="_blank"><img src="' + smallLogo + '" alt="" /></a>\
								<p>BLACK FRIDAY</p>\
								<div class="kopikot-extension-close"><p class="kopikot-extension-icon">×</p></div>\
							</div>\
							<div class="google-search-bw-content"></div>\
						</div>\
					</div>'
				);

        appendStoreInfoBlackFriday(offers);
        appendBlackFridayFooter();

        main.find('.kopikot-extension-close').click(function () {
          chrome.storage.local.set({
            blackFridayClosed: true
          });
          $('.google-search-box').remove();
        });
      }
    }
  }, "new");
}

function appendStoreInfoBlackFriday (offers) {
	offers.forEach(function(offer) {
		$(".google-search-bw-content").append(
			'<div class="google-search-offer-item" id="google-search-'+ offer.id +'">'
				+ '<img src="'+ offer.image.url +'"/>'
				+ '<div class="google-search-store-wrap">'
      		+ '<div class="google-search-store-logo"><img src="'+ offer.campaign.image.url +'"/></div>'
					+ '<div class="google-search-store-info"><p>' + commStrNewApi(offer.campaign.commission.max) + '</p></div>'
				+'</div>'
      	+ '<div class="google-search-offer-item-wrap">'
					+ '<p class="google-search-offer-name">' + offer.title + '</p>'
					+ '<p class="google-search-offer-desc">' + offer.description+ '</p>'
      	+'</div>'
			+'</div>'
		);

    $("#center_col").find('#google-search-'+ offer.id).click(function () {
      chrome.storage.local.get('userData', function (userData) {
      	if (userData.userData && userData.userData.id){
          window.open(baseUrl + '/waiting/offer/' + userData.userData.id + '/' + offer.campaign.id + '/' + offer.id + '?type=2' ,'_blank');
        } else {
          window.open(baseUrl + 'offer?section=tag1' ,'_blank');
				}
			});
    });
	});
}

function appendBlackFridayFooter(){
	$(".google-search-box").append(
		'<div class="google-search-box-bw-footer">'
		+'<a href="'+ baseUrl + 'offer?section=tag1"' +' target="_blank">'+ chrome.i18n.getMessage("showAll") +'</a></div>'
	);
}