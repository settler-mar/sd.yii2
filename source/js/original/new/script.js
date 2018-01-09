var headerActions = function () {
    var scrolledDown = false;

    $('.menu-toggle').click(function(e) {
        e.preventDefault();
        $('.header').toggleClass('header_open-menu');
    });

    $('.search-toggle').click(function(e) {
        e.preventDefault();
        $('.header-search').toggleClass('open');
    });

    $('.header-secondline_close').click(function(e){
        $('.header').removeClass('header_open-menu');
    });

    window.onscroll = function() {
        var scrollHeight = 50;
        var headerSecondLine = $('.header-secondline');
        var hovers = headerSecondLine.find(':hover');
        var header = $('.header');

        if (!hovers.length) {
            headerSecondLine.removeClass('scrollable');
            header.removeClass('scrollable');
            if (document.documentElement.scrollTop > scrollHeight && scrolledDown === false) {
                scrolledDown = true;
                headerSecondLine.addClass('scroll-down');
            }
            if (document.documentElement.scrollTop <= scrollHeight && scrolledDown === true) {
                scrolledDown = false;
                headerSecondLine.removeClass('scroll-down');
            }
        } else {
            headerSecondLine.addClass('scrollable');
            header.addClass('scrollable');
        }
    };

    $('.menu_angle-down').click(function(e) {
        e.preventDefault();
        var parent = $(this).closest('.drop-menu_group__up, .menu-group');
        if (parent) {
            $(parent).siblings('li').removeClass('open');
            $(parent).toggleClass('open');
        }

        return false;
    });

    var accountMenuTimeOut = null;
    $('.account-menu-toggle').click(function(e){
        e.preventDefault();
        var menu = $('.account-menu');
        if (menu) {
            clearTimeout(accountMenuTimeOut);
            menu.toggleClass('hidden');
            if (!menu.hasClass('hidden')) {
                accountMenuTimeOut = setTimeout(function () {
                    menu.addClass('hidden');
                }, 7000);
            }
        }

    });
}();



