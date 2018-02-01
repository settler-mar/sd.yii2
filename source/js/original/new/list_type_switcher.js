var catalogTypeSwitcher = function() {

    $('.catalog-stores_switcher-item-button').click(function (e) {
        e.preventDefault();
        $(this).parent().siblings().find('.catalog-stores_switcher-item-button').removeClass('checked');
        $(this).addClass('checked');
        var catalog = $('.catalog_list');
        if (catalog) {
            if ($(this).hasClass('catalog-stores_switcher-item-button-type-list')) {
                catalog.removeClass('narrow');
            }
            if ($(this).hasClass('catalog-stores_switcher-item-button-type-narrow')) {
                catalog.addClass('narrow');
            }
        }
    });

}();