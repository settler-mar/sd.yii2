var storageDataKeyStores = 'secretdiscounter_local_stores';
var storageDataKeyDate = 'secretdiscounter_local_date';
var storageDataKeyVersion = 'secretdiscounter_local_version';
var storageDataKeyLanguage = 'secretdiscounter_local_language';
var storageDataKeyLanguageCurrent = 'secretdiscounter_local_language_current';
var storageDataStores = false;
var storageDataDate = false;
var storageDataVersion = false;
var storageDataLanguage = false;

function getData(callback) {
    if (debug) {
        console.log('get data');
    }
    //getRequest(storesUrl, storageDataKeyStores);

    chrome.runtime.sendMessage({
        action: 'sd_xhttp',
        url: siteUrl + utils.href(storesUrl)
    }, function (responseData) {
        if (debug) {
            console.log(siteUrl+storesUrl, 'data is ready', responseData);
        }
        // set a storage key
        Storage.set(storageDataKeyStores, responseData);
        Storage.set(storageDataKeyVersion, chrome.runtime.getManifest().version);
        Storage.set(storageDataKeyDate, new Date().getTime());
        Storage.set(storageDataKeyLanguage, language);
        if (callback) {
            callback();
        }
    });

}

Storage.configure({
    scope: "local" //or sync
});


