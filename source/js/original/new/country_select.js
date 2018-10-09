var country_select = function(){

    $('.header-countries_dialog-close').click(function() {
        dialogClose(this);
    });

    $('.header-countries_dialog-dialog-button-apply').click(function() {
        var date = new(Date);
        date = date.getTime();
        setCookie('_sd_country_dialog_close', Math.round(date/1000), 7);
        dialogClose(this);
    });

    $('.header-countries_dialog-dialog-button-choose').click(function() {
        dialogClose(this);
    });

    var dialogClose = function(elem) {
        $(elem).closest('.header-countries_dialog').fadeOut();
    };
}();