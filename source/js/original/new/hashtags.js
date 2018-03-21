var hashTags = (function(){

    var hash = window.location.hash;
    if (hash != "") {
        var links = $('a[href="'+hash+'"].modals_open');
        if (links.length) {
            $(links[0]).click();
        }
    }

})();