var lang = (function(){
    var code = '';
    var key = '';

    var langlist = $("#sd_lang_list").data('json');
    var url_prefix = $("#sd_lang_list").data('url-prefix');
    var location = window.location.pathname;

    if (langlist) {
        var langKey = (location.length === 3 || location.substr(3,1) === '/') ? location.substr(1,2) : '';
        if (langKey && langlist[langKey]) {
            code = langlist[langKey];
            key = langKey;
        } else {
            key = 'ru';
            code = langlist[key] ? langlist[key] : '';
        }
    }
    return {
        code: code,
        key: key,
        href_prefix: url_prefix ? '/'+url_prefix : ''
    }
})();
