(function () {

    $('body').on('click', '.ajax_load', function(e) {
        e.preventDefault();
        var that = this;
        var url = $(that).attr('href');
        var top = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
        var storesSort = $('.catalog-stores_sort');
        var scrollTop = storesSort.length ? $(storesSort[0]).offset().top - $('#header>*').eq(0).height() - 50 : 0;

        $(that).addClass('loading');
        $.get(url, {'g':'ajax_load'}, function(data){
            var content = $(data).find('#content-wrap').html();
            $('body').find('#content-wrap').html(content);
            window.history.pushState("object or string", "Title", url);

            if (top > scrollTop) {
                $('html, body').animate({scrollTop: scrollTop}, 500);
            }

        }).fail(function() {
            $(that).removeClass('loading');
            notification.notifi({type:'err', 'title':lg('error'), 'message':lg('error_querying_data')});
        });
    });


})();
