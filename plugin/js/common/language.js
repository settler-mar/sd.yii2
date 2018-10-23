var languages = false;

//var language = 'en-EN';
//по умолчанию
var language = navigator.language ? navigator.language : 'ru-RU';

function lg(code, params) {
    if (!languages) {
        languages = storageDataStores.languages ? storageDataStores.languages : false;
    }
    var out = languages && languages[language] && languages[language][code] ? languages[language][code] : code;
    out = utils.replaceTemplate(out, params);

    return out;
}
