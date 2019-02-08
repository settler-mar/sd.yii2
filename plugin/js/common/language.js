
var language = navigator.language ? navigator.language : 'ru-RU';

function lg(code, params) {
    var out;
    if (typeof(languages) == "undefined") {
        out = code;
    } else {
        var langArray = languages[language] ? languages[language] : languages['ru-RU'];
        out = langArray[code] ? langArray[code] : code;
    }
    out = utils.replaceTemplate(out, params);

    return out;
}
