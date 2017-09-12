$(document).ready(function() {
    $("iframe[src*=insigit]").css("display", "none");

    /***************** Waypoints ******************/
    $('.wp1').waypoint(function() {
        $('.wp1').addClass('animated fadeInUp');
    }, {
        offset: '75%'
    });
    $('.wp2').waypoint(function() {
        $('.wp2').addClass('animated fadeInUp');
    }, {
        offset: '75%'
    });
    $('.wp3').waypoint(function() {
        $('.wp3').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp4').waypoint(function() {
        $('.wp4').addClass('animated fadeInUp');
    }, {
        offset: '95%'
    });
    $('.wp5').waypoint(function() {
        $('.wp5').addClass('animated fadeInUp');
    }, {
        offset: '93%'
    });
    $('.wp6').waypoint(function() {
        $('.wp6').addClass('animated fadeInUp');
    }, {
        offset: '90%'
    });

    /***************** Initiate Flexslider ******************/
    $('.flexslider').flexslider({
        animation: "slide",
        slideshowSpeed: 10000,
        animationDuration: 400,
        pauseOnHover: true
    });

    /***************** Initiate Fancybox ******************/
    $('.single_image').fancybox({
        padding: 4,
    });

    /***************** Tooltips ******************/
    $('[data-toggle="tooltip"]').tooltip();

    /***************** Nav Transformicon ******************/
    /* When user clicks the Icon */
    $('.nav-toggle').click(function() {
        $(this).toggleClass('active');
        $('.header-nav').toggleClass('open');
        event.preventDefault();
    });
    /* When user clicks a link */
    $('.header-nav li a').click(function() {
        $('.nav-toggle').toggleClass('active');
        $('.header-nav').toggleClass('open');
    });

    /***************** Header BG Scroll ******************/
    $(function() {
        var scroll = {
            control: {
                fixeds: function() {
                    $('section.navigation').addClass('fixed');
                    $('section.navigation').removeClass('not-fixed');
                    $('header').css({
                        "border-bottom": "solid 1px rgba(255, 255, 255, 0)",
                        "padding": "10px 0"
                    });
                    $('header .member-actions').css({
                        "top": "17px",
                    });
                    $('header .navicon').css({
                        "top": "23px",
                    });
                },
                notfixed: function() {
                    $('section.navigation').removeClass('fixed');
                    $('section.navigation').addClass('not-fixed');
                    $('header').css({
                        "border-bottom": "solid 1px rgba(255, 255, 255, 0.2)",
                        "padding": "10px 0"
                    });
                    $('header .member-actions').css({
                        "top": "17px",
                    });
                    $('header .navicon').css({
                        "top": "23px",
                    });
                },
                init: function() {
                    var scroll = $(window).scrollTop();

                    if (scroll >= 20) {
                        this.fixeds();
                    } else {
                        this.notfixed();
                    }   
                },
                events: function() {
                    var self = this;
                    self.init();

                    $(window).scroll(function() {
                        self.init();
                    });
                }
            }
        }

        scroll.control.events();
    });

    /***************** Smooth Scrolling ******************/
    $(function() {
        $('a[href*=#]:not([href=#])').click(function() {
            var href = $(this).attr('href').replace(/#.*$/, '');
            if (href === '') {
//            if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - $('.navigation').height()
                    }, 1000);
                    return false;
                }
            }
        });
    });
});