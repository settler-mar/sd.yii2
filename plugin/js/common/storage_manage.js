var storageDataKeyStores = 'secretdiscounter_local_stores';
var storageDataKeyDate = 'secretdiscounter_local_date';
var storageDataStores = false;
var storageDataDate = false;


function getData(callback) {
    console.log('get data');
    //getRequest(storesUrl, storageDataKeyStores);

    chrome.runtime.sendMessage({
        action: 'sd_xhttp',
        url: siteUrl + storesUrl
    }, function (responseData) {
        if (debug) {
            console.log(siteUrl+storesUrl, 'data is ready', responseData);
        }
        // set a storage key
        Storage.set(storageDataKeyStores, responseData);
        Storage.set(storageDataKeyDate, new Date().getTime());
        if (callback) {
            callback();
        }
    });

}

Storage.configure({
    scope: "local" //or sync
});


