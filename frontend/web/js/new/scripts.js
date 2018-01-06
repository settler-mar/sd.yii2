$('.menu-toggle').click(function(e) {
    e.preventDefault();
    $('.header').toggleClass('header_open-menu');
});

$('.search-toggle').click(function(e) {
    e.preventDefault();
    $('.header-search').toggleClass('open');
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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIkKCcubWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxufSk7XHJcblxyXG4kKCcuc2VhcmNoLXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQoJy5oZWFkZXItc2VhcmNoJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcclxufSk7XHJcbnZhciBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxud2luZG93Lm9uc2Nyb2xsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2Nyb2xsSGVpZ2h0ID0gNTA7XHJcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA+IHNjcm9sbEhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgc2Nyb2xsZWREb3duID0gdHJ1ZTtcclxuICAgICAgICAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKS5hZGRDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgIH1cclxuICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIDw9IHNjcm9sbEhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IHRydWUpIHtcclxuICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxuICAgICAgICAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgIH1cclxufTtcclxuXHJcbiJdfQ==
