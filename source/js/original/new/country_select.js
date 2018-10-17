var country_select = function(){

    $('.header-countries_dialog-close').click(function() {
        dialogClose(this);
    });

    $('.header-countries_dialog-dialog-button-apply').click(function() {
        var date = new(Date);
        date = Math.round(date.getTime()/1000);
        setCookieAjax('_sd_country_dialog_close', date, 7);
        dialogClose(this);
    });

    $('.header-countries_dialog-dialog-button-choose').click(function() {
        //добавляем класс, имитировать hover
        $('#header-upline-region-select-button').addClass("open");
        dialogClose(this);
    });

    $('.header-upline_lang-list').on('mouseenter', function(){
        $(this).removeClass('open');
    });

    var dialogClose = function(elem) {
        $('.header-upline_lang-list').removeClass('inactive');
        $(elem).closest('.header-countries_dialog').fadeOut();
    };
}();