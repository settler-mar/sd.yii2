function addMetaTags(name, browserName, extensionVersion, local, pattern) {
    if (local.match(pattern)) {
        $('<meta/>', {
            name: name,
            type: browserName,
            version: extensionVersion
        }).appendTo('head');

        $('<meta/>', {
            name: 'LetyShops',
            type: browserName,
            version: extensionVersion
        }).appendTo('head');
    }
}