$('.menu-toggle').click(function(e) {
    e.preventDefault();
    $('.header').toggleClass('header_open-menu');
});

$('.search-toggle').click(function(e) {
    e.preventDefault();
    $('.header-search').toggleClass('open');
});

$('.header-secondline').click(function(e){
    $('.header').removeClass('header_open-menu');
});

var scrolledDown = false;

window.onscroll = function() {
    var scrollHeight = 50;
    if (document.documentElement.scrollTop > scrollHeight && scrolledDown === false) {
        scrolledDown = true;
        $('.header-secondline').addClass('scroll-down');
    }
    if (document.documentElement.scrollTop <= scrollHeight && scrolledDown === true) {
        scrolledDown = false;
        $('.header-secondline').removeClass('scroll-down');
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

