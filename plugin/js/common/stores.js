var storeUtil = (function(){

    function findShop(stores, url, callback){
        //console.log('поиск шопа', storageDataStores, url);
        if (!stores || stores.length === 0) {
            return null;
        }
        //найти магазин, если на нем находимся
        url = url || window.location.host;
        var here = url.replace('www.', '');
        stores.forEach(function (item) {

            currentUrl = item.url.split('//')[1].replace('www.', '').split('/')[0];
            //console.log(here, currentUrl);

            if (here === currentUrl || here.indexOf(currentUrl) > -1) {
                //нашли, мы находимся здесь
                callback(item);

                return false;
            }
        });
    }

    return {
        findShop: findShop
    };


})();