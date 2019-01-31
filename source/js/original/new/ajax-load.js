(function () {

    //блоки подлежащие загрузке Если такие есть , то сразу запрос

    if (typeof ajax_requests !== 'undefined') {
        requests = JSON.parse(ajax_requests);
        //console.log(requests);
        for (var i=0 ; i < requests.length; i++)  {
            //console.log(requests[i]);
            var url = requests[i].url ? requests[i].url : location.href;
            //console.log(url);
            getData(url, requests[i].blocks, function() {
                share42();//t отобразились кнопки Поделиться
                sdTooltip.setEvents();//работали тултипы
                banner.refresh();//обновить баннер от гугл
                //window.history.pushState("object or string", "Title", url);
            }, null);
        }
    }


    //при клике на кнопки
    $('body').on('click', '.ajax_load', function(e) {
        e.preventDefault();
        var that = this;
        var url = $(that).attr('href');
        var top = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
        var storesSort = $('.catalog-stores_sort');//блок сортировки элементов
        var table = $('table.table');//таблица в account
        //scroll туда или туда
        var scrollTop = storesSort.length ? $(storesSort[0]).offset().top - $('#header>*').eq(0).height() - 50 : 0;
        if (scrollTop ===0 && table.length) {
            scrollTop = $(table[0]).offset().top - $('#header>*').eq(0).height() - 50;
        }

        $(that).addClass('loading');


        getData(url, ['content-wrap'], function(){
            share42();//отобразились кнопки Поделиться
            sdTooltip.setEvents();//работали тултипы
            banner.refresh();//обновить баннер от гугл
            window.history.pushState("object or string", "Title", url);
            if (top > scrollTop) {
                $('html, body').animate({scrollTop: scrollTop}, 500);
            }
        },function(){
            $(that).removeClass('loading');
            notification.notifi({type:'err', 'title':lg('error'), 'message':lg('error_querying_data')});
        });
        // $.get(url, {'g':'ajax_load'}, function(data){
        //     var content = $(data).find('#content-wrap').html();
        //     $('body').find('#content-wrap').html(content);
        //     share42();//t отобразились кнопки Поделиться
        //     sdTooltip.setEvents();//работали тултипы
        //     banner.refresh();//обновить баннер от гугл
        //     window.history.pushState("object or string", "Title", url);
        //
        //     if (top > scrollTop) {
        //         $('html, body').animate({scrollTop: scrollTop}, 500);
        //     }
        //
        // }).fail(function() {
        //     $(that).removeClass('loading');
        //     notification.notifi({type:'err', 'title':lg('error'), 'message':lg('error_querying_data')});
        // });
    });

    function getData(url, blocks, success, fail) { //url, blocks, succesCollback, failCallback
        //console.log(url);
        $.get(url, {}, function (data) {
            //console.log('get');
            for (var i = 0; i < blocks.length; i++) {
                //console.log(blocks[i]);
                //console.log($(data).find('#' + blocks[i]));
                $('body').find('#' + blocks[i]).html($(data).find('#' + blocks[i]).html());
            }
            if (success) {
                success();
            }
        }).fail(function () {
            console.log('error');
            if (fail) {
                fail();
            }
        });
    }

})();
