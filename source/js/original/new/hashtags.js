var hashTags = (function(){

    var hash = window.location.hash;
    if (hash != "") {
        var hashBody = hash.split("?");
        if (hashBody[1]) {
            window.location = location.origin + location.pathname + '?' + hashBody[1] + hashBody[0];
        } else {
            var links = $('a[href="' + hashBody[0] + '"].modals_open');
            if (links.length) {
                $(links[0]).click();
            }
        }
    }

})();