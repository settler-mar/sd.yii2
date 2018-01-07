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

$('.account-menu-toggle').click(function(e){
    e.preventDefault();
    $('.account-menu').toggleClass('hidden');
});


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIkKCcubWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxufSk7XHJcblxyXG4kKCcuc2VhcmNoLXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQoJy5oZWFkZXItc2VhcmNoJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcclxufSk7XHJcblxyXG4kKCcuaGVhZGVyLXNlY29uZGxpbmVfY2xvc2UnKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG59KTtcclxuXHJcbnZhciBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxuXHJcbndpbmRvdy5vbnNjcm9sbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNjcm9sbEhlaWdodCA9IDUwO1xyXG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgPiBzY3JvbGxIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSBmYWxzZSkge1xyXG4gICAgICAgIHNjcm9sbGVkRG93biA9IHRydWU7XHJcbiAgICAgICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lJykuYWRkQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA8PSBzY3JvbGxIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSB0cnVlKSB7XHJcbiAgICAgICAgc2Nyb2xsZWREb3duID0gZmFsc2U7XHJcbiAgICAgICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4kKCcubWVudV9hbmdsZS1kb3duJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgIHZhciBwYXJlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnVfZ3JvdXBfX3VwLCAubWVudS1ncm91cCcpO1xyXG4gICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgICQocGFyZW50KS50b2dnbGVDbGFzcygnb3BlbicpO1xyXG4gICB9XHJcbiAgIHJldHVybiBmYWxzZTtcclxufSk7XHJcblxyXG4kKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCgnLmFjY291bnQtbWVudScpLnRvZ2dsZUNsYXNzKCdoaWRkZW4nKTtcclxufSk7XHJcblxyXG4iXX0=
