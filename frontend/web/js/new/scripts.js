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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJCgnLm1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCgnLmhlYWRlcicpLnRvZ2dsZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbn0pO1xyXG5cclxuJCgnLnNlYXJjaC10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKCcuaGVhZGVyLXNlYXJjaCcpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbn0pO1xyXG5cclxudmFyIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG5cclxud2luZG93Lm9uc2Nyb2xsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2Nyb2xsSGVpZ2h0ID0gNTA7XHJcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA+IHNjcm9sbEhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgc2Nyb2xsZWREb3duID0gdHJ1ZTtcclxuICAgICAgICAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKS5hZGRDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgIH1cclxuICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIDw9IHNjcm9sbEhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IHRydWUpIHtcclxuICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxuICAgICAgICAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgIH1cclxufTtcclxuXHJcbiJdfQ==
