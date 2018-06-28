var lg = (function() {
  var lang={};
  url='/language/'+document.documentElement.lang+'.json';
  $.get(url,function (data) {
    //console.log(data);
    for(var index in data) {
      data[index]=clearVar(data[index]);
    }
    lang=data;
    var event = new CustomEvent("language_loaded");
    document.dispatchEvent(event);
    //console.log(data, event);
  },'json');

  function clearVar(txt){
    txt=txt.replace(/\s+/g," ");//удаление задвоение пробелов

    //Чистим подставляемые переменные
    str=txt.match(/\{(.*?)\}/g);
    if ( str != null) {
      for ( i = 0; i < str.length; i++ ) {
        str_t=str[i].replace(/ /g,"");
        txt=txt.replace(str[i],str_t);
      }
    }
    return txt;
  }

  return function(tpl, data){
    if(typeof(lang[tpl])=="undefined"){
      console.log("lang not found: "+tpl);
      return tpl;
    }
    tpl=lang[tpl];
    if(typeof(data)=="object"){
      for(var index in data) {
        tpl=tpl.split("{"+index+"}").join(data[index]);
      }
    }
    return tpl;
  }
})();
var lang = (function(){
    var code = '';
    var key = '';
    var href_prefix = '';

    var langlist = $("#sd_lang_list").data('json');
    var location = window.location.pathname;

    if (langlist) {
        var langKey = (location.length === 3 || location.substr(3,1) === '/') ? location.substr(1,2) : '';
        if (langKey && langlist[langKey]) {
            code = langlist[langKey];
            key = langKey;
            href_prefix = key === 'ru' ? '' : key+'/';
        } else {
            key = 'ru';
            code = langlist[key] ? langlist[key] : '';
        }
    }
    return {
        code: code,
        key: key,
        href_prefix: href_prefix
    }
})();

objects = function (a, b) {
  var c = b,
    key;
  for (key in a) {
    if (a.hasOwnProperty(key)) {
      c[key] = key in b ? b[key] : a[key];
    }
  }
  return c;
};

function login_redirect(new_href) {
  href = location.href;
  if (href.indexOf('store') > 0 || href.indexOf('coupon') > 0 || href.indexOf('url(') > 0) {
    location.reload();
  } else {
    location.href = new_href;
  }
}

(function (w, d, $) {
  var scrolls_block = $('.scroll_box');

  if (scrolls_block.length == 0) return;
  //$('<div class="scroll_box-wrap"></div>').wrapAll(scrolls_block);
  $(scrolls_block).wrap('<div class="scroll_box-wrap"></div>');

  init_scroll();
  calc_scroll();

  var t1, t2;

  $(window).resize(function () {
    clearTimeout(t1);
    clearTimeout(t2);
    t1 = setTimeout(calc_scroll, 300);
    t2 = setTimeout(calc_scroll, 800);
  });

  function init_scroll() {
    var control = '<div class="scroll_box-control"></div>';
    control = $(control);
    control.insertAfter(scrolls_block);
    control.data('slide-active', 0);

    scrolls_block.prepend('<div class=scroll_box-mover></div>');

    control.on('click', '.scroll_box-control_point', function () {
      var $this = $(this);
      var control = $this.parent();
      var i = $this.index();
      if ($this.hasClass('active'))return;
      control.find('.active').removeClass('active');
      $this.addClass('active');

      var dx = control.data('slide-dx');
      var el = control.prev();
      el.find('.scroll_box-mover').css('margin-left', -dx * i);
      control.data('slide-active', i);

      stopScrol.bind(el)();
    })
  }

  for (var j = 0; j < scrolls_block.length; j++) {
    var el = scrolls_block.eq(j);
    el.parent().hover(stopScrol.bind(el), startScrol.bind(el));
  }

  function startScrol() {
    var $this = $(this);
    if (!$this.hasClass("scroll_box-active"))return;

    var timeoutId = setTimeout(next_slide.bind($this), 2000);
    $this.data('slide-timeoutId', timeoutId)
  }

  function stopScrol() {
    var $this = $(this);
    var timeoutId = $this.data('slide-timeoutId');
    $this.data('slide-timeoutId', false);
    if (!$this.hasClass("scroll_box-active") || !timeoutId)return;
    clearTimeout(timeoutId);
  }

  function next_slide() {
    var $this = $(this);
    $this.data('slide-timeoutId', false);
    if (!$this.hasClass("scroll_box-active"))return;

    var controls = $this.next().find('>*');
    var active = $this.data('slide-active');
    var point_cnt = controls.length;
    if (!active)active = 0;
    active++;
    if (active >= point_cnt)active = 0;
    $this.data('slide-active', active);

    controls.eq(active).click();
    startScrol.bind($this)();
  }

  function calc_scroll() {
    for (i = 0; i < scrolls_block.length; i++) {
      var el = scrolls_block.eq(i);
      var control = el.next();
      var width_max = el.data('scroll-width-max');
      w = el.width();

      //делаем контроль ограничения ширины. Если превышено то отключаем скрол и переходим к следующему элементу
      if (width_max && w > width_max) {
        control.removeClass("scroll_box-active");
        control.data('slide-active', 0); //сброс счетчика
        continue;
      }

      var no_class = el.data('scroll-elemet-ignore-class');
      var children = el.find('>*').not('.scroll_box-mover');
      if (no_class) {
        children = children.not('.' + no_class)
      }

      //Если нет дочерних для скрола
      if (children == 0) {
        el.removeClass("scroll_box-active");
        control.data('slide-active', 0); //сброс счетчика
        continue;
      }

      var f_el = children.eq(1);
      var children_w = f_el.outerWidth(); //всего дочерних для скрола
      children_w += parseFloat(f_el.css('margin-left'));
      children_w += parseFloat(f_el.css('margin-right'));

      var screan_count = Math.floor(w / children_w);

      //Если все влазит на экран
      if (children <= screan_count) {
        el.removeClass("scroll_box-active");
        control.data('slide-active', 0); //сброс счетчика
        continue;
      }

      //Уже точно знаем что скрол нужен
      el.addClass("scroll_box-active");

      var point_cnt = children.length - screan_count + 1;
      //если не надо обновлять контрол то выходим, не забывая обновить ширину дочерних
      if (control.find('>*').length == point_cnt) {
        control.data('slide-dx', children_w);
        continue;
      }

      active = el.data('slide-active');
      if (!active)active = 0;
      if (active >= point_cnt)active = point_cnt - 1;
      var out = '';
      for (var j = 0; j < point_cnt; j++) {
        out += '<div class="scroll_box-control_point' + (j == active ? ' active' : '') + '"></div>';
      }
      control.html(out);

      control.data('slide-active', active);
      control.data('slide-count', point_cnt);
      control.data('slide-dx', children_w);

      if (!el.data('slide-timeoutId')) {
        startScrol.bind(el)();
      }
    }
  }
}(window, document, jQuery));

var accordionControl = $('.accordion .accordion-control');

accordionControl.on('click', function (e) {
  e.preventDefault();
  $this = $(this);
  $accordion = $this.closest('.accordion');


  if ($accordion.find('.accordion-title').hasClass('accordion-title-disabled'))return;

  if ($accordion.hasClass('open')) {
    /*if($accordion.hasClass('accordion-only_one')){
     return false;
     }*/
    $accordion.find('.accordion-content').slideUp(300);
    $accordion.removeClass('open')
  } else {
    if ($accordion.hasClass('accordion-only_one')) {
      $other = $('.accordion-only_one');
      $other.find('.accordion-content')
        .slideUp(300)
        .removeClass('accordion-content_last-open');
      $other.removeClass('open');
      $other.removeClass('last-open');

      $accordion.find('.accordion-content').addClass('accordion-content_last-open');
      $accordion.addClass('last-open');
    }
    $accordion.find('.accordion-content').slideDown(300);
    $accordion.addClass('open');
  }
  return false;
});
accordionControl.show();


$('.accordion-wrap.open_first .accordion:first-child').addClass('open');
$('.accordion-wrap .accordion.accordion-slim:first-child').addClass('open');
$('.accordion-slim').addClass('accordion-only_one');

//для симов открываем если есть пометка open то присваиваем все остальные класы
accordionSlim = $('.accordion.accordion-only_one');
if (accordionSlim.length > 0) {
  accordionSlim.parent().find('.accordion.open')
    .addClass('last-open')
    .find('.accordion-content')
    .show(300)
    .addClass('accordion-content_last-open');
}

$('body').on('click', function () {
  $('.accordion_fullscrean_close.open .accordion-control:first-child').click()
});

$('.accordion-content').on('click', function (e) {
  if (e.target.tagName != 'A') {
    $(this).closest('.accordion').find('.accordion-control.accordion-title').click();
    e.preventDefault();
    return false;
  }
});

$('.accordion-content a').on('click', function (e) {
  $this = $(this);
  if ($this.hasClass('angle-up'))return;
  e.stopPropagation()
});

(function(){
  var els = $('.accordion_more');

  function addButton(el, className, title) {
      var buttons = $(el).find('.'+className);
      if (buttons.length === 0) {
          var button = $('<div>').addClass(className).addClass('accordion_more_button');
          var a = $('<a>').attr('href', "").addClass('blue').html(title);
          $(button).append(a);
          $(el).append(button);
      }
  }
  $('body').on('click', '.accordion_more_button_more', function(e){
      e.preventDefault();
      $(this).closest('.accordion_more').addClass('open');
  });
  $('body').on('click', '.accordion_more_button_less', function(e){
      e.preventDefault();
      $(this).closest('.accordion_more').removeClass('open');
  });



  function rebuild(){
    $(els).each(function(key, item){
      $(item).removeClass('open');
      var content = item.querySelector('.accordion_more_content');
      if (content.scrollHeight > content.clientHeight) {
        addButton(item, 'accordion_more_button_more', 'Подробнее');
        addButton(item, 'accordion_more_button_less', 'Скрыть');
      } else {
        $(item).find('.accordion_more_button').remove();
      }
    });

  }

  $(window).resize(rebuild);

  document.addEventListener('language_loaded', function(){
    rebuild();
  }, false);

})();



function ajaxForm(els) {
  var fileApi = window.File && window.FileReader && window.FileList && window.Blob ? true : false;
  var defaults = {
    error_class: '.has-error'
  };
  var last_post = false;

  function onPost(post) {
    last_post = +new Date();
    //console.log(post, this);
    var data = this;
    var form = data.form;
    var wrap = data.wrap;
    var wrap_html = data.wrap_html;

    if (post.render) {
      post.notyfy_class = "notify_white";
      notification.alert(post);
    } else {
      wrap.removeClass('loading');
      form.removeClass('loading');
      if (post.html) {
        wrap.html(post.html);
        ajaxForm(wrap);
      } else {
        if (!post.error) {
          form.removeClass('loading');
          wrap.html(wrap_html);
          form.find('input[type=text],textarea').val('');
          ajaxForm(wrap);
        }
      }
    }

    if (typeof post.error === "object") {
      for (var index in post.error) {
        notification.notifi({
          'type': 'err',
          'title': post.title ? post.title : lg('error'),
          'message': post.error[index]
        });
      }
    } else if (Array.isArray(post.error)) {
      for (var i = 0; i < post.error.length; i++) {
        notification.notifi({
          'type': 'err',
          'title': post.title ? post.title : lg('error'),
          'message': post.error[i]
        });
      }
    } else {
      if (post.error || post.message) {
        notification.notifi({
          'type': post.error === false ? 'success' : 'err',
          'title': post.title ? post.title : (post.error === false ? lg('success') : lg('error')),
          'message': post.message ? post.message : post.error
        });
      }
    }
    //
    // notification.notifi({
    //     'type': post.error === false ? 'success' : 'err',
    //     'title': post.error === false ? 'Успешно' : 'Ошибка',
    //     'message': Array.isArray(post.error) ? post.error[0] : (post.message ? post.message : post.error)
    // });
  }

  function onFail() {
    last_post = +new Date();
    var data = this;
    var form = data.form;
    var wrap = data.wrap;
    wrap.removeClass('loading');
    wrap.html(
        '<h3>'+lg('sorry_not_expected_error')+'<h3>' +
        lg('it_happens_sometimes')
    );
    ajaxForm(wrap);

  }

  function onSubmit(e) {
    e.preventDefault();
    //e.stopImmediatePropagation();
    //e.stopPropagation();

    var currentTimeMillis = +new Date();
    if (currentTimeMillis - last_post < 1000 * 2) {
      return false;
    }

    last_post = currentTimeMillis;
    var data = this;
    var form = data.form;
    var wrap = data.wrap;
    data.wrap_html=wrap.html();
    var isValid = true;

    //init(wrap);

    if (form.yiiActiveForm) {
      var d = form.data('yiiActiveForm');
      if (d) {
        d.validated = true;
        form.data('yiiActiveForm', d);
        form.yiiActiveForm('validate');
        isValid = d.validated;
      }
    }

    isValid = isValid && (form.find(data.param.error_class).length == 0);

    if (!isValid) {
      return false;
    } else {

      e.stopImmediatePropagation();
      e.stopPropagation();
      var required = form.find('input.required, textarea.required, input[id="support-recaptcha"]');
      for (var i = 0; i < required.length; i++) {
        var helpBlock = required.eq(i).closest('.form-group').find('.help-block');
        var helpMessage = helpBlock && helpBlock.data('message') ? helpBlock.data('message') : lg('required');

        if (required.eq(i).val().length < 1) {
          helpBlock.html(helpMessage);
          isValid = false;
        } else {
          helpBlock.html('');
        }
      }
      if (!isValid) {
        return false;
      }
    }

    if (!form.serializeObject)addSRO();

    var postData = form.serializeObject();
    form.addClass('loading');
    form.html('');
    wrap.html('<div style="text-align:center;"><p>'+lg('sending_data')+'</p></div>');

    data.url += (data.url.indexOf('?') > 0 ? '&' : '?') + 'rc=' + Math.random();
    //console.log(data.url);

    /*if(!postData.returnUrl){
      postData.returnUrl=location.href;
    }*/

    $.post(
      data.url,
      postData,
      onPost.bind(data),
      'json'
    ).fail(onFail.bind(data));

    return false;
  }

  function init(wrap) {
    form = wrap.find('form');
    data = {
      form: form,
      param: defaults,
      wrap: wrap
    };
    data.url = form.attr('action') || location.href;
    data.method = form.attr('method') || 'post';
    form.unbind('submit');
    //form.off('submit');
    form.on('submit', onSubmit.bind(data));
  }

  els.find('[required]')
    .addClass('required')
    .removeAttr('required');


  for (var i = 0; i < els.length; i++) {
    init(els.eq(i));
  }

  if (typeof placeholder == 'function') {
      placeholder();
  }

}

function addSRO() {
  $.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
      if (o[this.name]) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };
};
addSRO();
var sdTooltip = function () {

    var tooltipTimeOut = null;
    var displayTimeOver = 0;
    var displayTimeClick = 3000;
    var hideTime = 100;
    var arrow = 10;
    var arrowWidth = 8;
    var tooltip;
    var size = 'small';
    var hideClass = 'hidden';
    var tooltipElements = $('[data-toggle=tooltip]');
    var currentElement;

    var tooltipInit = function () {
        tooltip = document.createElement('div');
        $(tooltip).addClass('tipso_bubble').addClass(size).addClass(hideClass)
            .html('<div class="tipso_arrow"></div><div class="titso_title"></div><div class="tipso_content"></div>');
        $(tooltip).on('mouseover', function (e) {
            checkMousePos(e);
        });
        $(tooltip).on('mousemove', function (e) {
            checkMousePos(e);
        });
        $('body').append(tooltip);
    };

    function checkMousePos(e) {
        if (e.clientX > $(currentElement).offset().left && e.clientX < $(currentElement).offset().left + $(currentElement).outerWidth()
            && e.clientY > $(currentElement).offset().top && e.clientY < $(currentElement).offset().top + $(currentElement).outerHeight()) {
            tooltipShow(currentElement, displayTimeOver);
        }
    }

    function tooltipShow(elem, displayTime) {
        clearTimeout(tooltipTimeOut);
        //if ($(tooltip).hasClass(hideClass)) {
            var title = $(elem).data('original-title');
            var position = $(elem).data('placement') || 'bottom';
            $(tooltip).removeClass("top_right_corner bottom_right_corner top_left_corner bottom_left_corner");
            $(tooltip).find('.titso_title').html(title);
            setPositon(elem, position);
            $(tooltip).removeClass(hideClass);
            currentElement = elem;

            if (displayTime > 0) {
                tooltipTimeOut = setTimeout(tooltipHide, displayTime);
            }
       // }

    }
    function tooltipHide() {
        clearTimeout(tooltipTimeOut);
        tooltipTimeOut = setTimeout(function(){
            $(tooltip).addClass(hideClass);
        }, hideTime);
    }

    function setPositon(elem, position){
        var $e = $(elem);
        var $win = $(window);
        var customTop = $(elem).data('top');//задана позиция внутри элемента
        var customLeft = $(elem).data('left');//задана позиция внутри элемента
        var norevert = $(elem).data('norevert');//не переворачивать
        switch(position) {
            case 'top':
                pos_left = $e.offset().left + (customLeft ? customLeft : $e.outerWidth() / 2) - $(tooltip).outerWidth() / 2;
                pos_top = $e.offset().top - $(tooltip).outerHeight() + (customTop ? customTop : 0) - arrow;
                $(tooltip).find('.tipso_arrow').css({
                    marginLeft: -arrowWidth,
                    marginTop: ''
                });
                if ((pos_top < $win.scrollTop()) && !norevert) {
                    pos_top = $e.offset().top +(customTop ? customTop : $e.outerHeight()) + arrow;
                    $(tooltip).removeClass('top bottom left right');
                    $(tooltip).addClass('bottom');
                }
                else {
                    $(tooltip).removeClass('top bottom left right');
                    $(tooltip).addClass('top');
                }
                break;
            case 'bottom':
                pos_left = $e.offset().left + (customLeft ? customLeft : $e.outerWidth() / 2) - $(tooltip).outerWidth() / 2;
                pos_top = $e.offset().top + (customTop ? customTop : $e.outerHeight()) + arrow;
                $(tooltip).find('.tipso_arrow').css({
                    marginLeft: -arrowWidth,
                    marginTop: ''
                });
                if ((pos_top + $(tooltip).height() > $win.scrollTop() + $win.outerHeight()) && !norevert) {
                    pos_top = $e.offset().top - $(tooltip).height() + (customTop ? customTop : 0) - arrow;
                    $(tooltip).removeClass('top bottom left right');
                    $(tooltip).addClass('top');
                }
                else {
                    $(tooltip).removeClass('top bottom left right');
                    $(tooltip).addClass('bottom');
                }
                break;
        }
        $(tooltip).css({
            left:  pos_left,
            top: pos_top
        });
    }


    tooltipElements.on('click', function (e) {
      if ($(this).data('clickable')) {
          if ($(tooltip).hasClass(hideClass)) {
              tooltipShow(this, displayTimeClick);
          } else {
              tooltipHide();
          }

      }
    });

    tooltipElements.on('mouseover', function (e) {
        if (window.innerWidth >= 1024) {
            tooltipShow(this, displayTimeOver);
        }
    });
    tooltipElements.on('mousemove', function (e) {
        if (window.innerWidth >= 1024) {
            tooltipShow(this, displayTimeOver);
        }
    });
    tooltipElements.on('mouseleave', function (){
        if (window.innerWidth >= 1024) {
            tooltipHide();
        }
    });

    $(document).ready(function () {
        tooltipInit();
    });


}();

(function () {
  var $notyfi_btn = $('.header-logo_noty');
  if ($notyfi_btn.length == 0) {
    return;
  }

  var href = '/'+lang.href_prefix+'account/notification';

  $.get(href, function (data) {
    if (!data.notifications || data.notifications.length == 0) return;

    var out = '<div class=header-noty-box><div class=header-noty-box-inner><ul class="header-noty-list">';
    $notyfi_btn.find('a').removeAttr('href');
    var has_new = false;
    for (var i = 0; i < data.notifications.length; i++) {
      el = data.notifications[i];
      var is_new = (el.is_viewed == 0 && el.type_id == 2);
      out += '<li class="header-noty-item' + (is_new ? ' header-noty-item_new' : '') + '">';
      out += '<div class=header-noty-data>' + el.data + '</div>';
      out += '<div class=header-noty-text>' + el.text + '</div>';
      out += '</li>';
      has_new = has_new || is_new;
    }

    out += '</ul>';
    out += '<a class="btn header-noty-box-btn" href="'+href+'">' + data.btn + '</a>';
    out += '</div></div>';
    $('.header').append(out);

    if (has_new) {
      $notyfi_btn.addClass('tooltip').addClass('has-noty');
    }

    $notyfi_btn.on('click', function (e) {
      e.preventDefault();
      if ($('.header-noty-box').hasClass('header-noty-box_open')) {
        $('.header-noty-box').removeClass('header-noty-box_open');
        $('html').removeClass('no_scrol_laptop_min');
      } else {
        $('.header-noty-box').addClass('header-noty-box_open');
        $('html').addClass('no_scrol_laptop_min');

        if ($(this).hasClass('has-noty')) {
          $.post('/account/notification', function () {
            $('.header-logo_noty').removeClass('tooltip').removeClass('has-noty');
          })
        }
      }
      return false;
    });

    $('.header-noty-box').on('click', function (e) {
      $('.header-noty-box').removeClass('header-noty-box_open');
      $('html').removeClass('no_scrol_laptop_min');
    });

    $('.header-noty-list').on('click', function (e) {
      e.preventDefault();
      return false;
    })
  }, 'json');

})();

'use strict';

if (typeof mihaildev == "undefined" || !mihaildev) {
    var mihaildev = {};
    mihaildev.elFinder = {
        openManager: function(options){
            var params = "menubar=no,toolbar=no,location=no,directories=no,status=no,fullscreen=no";
            if(options.width == 'auto'){
                options.width = $(window).width()/1.5;
            }

            if(options.height == 'auto'){
                options.height = $(window).height()/1.5;
            }

            params = params + ",width=" + options.width;
            params = params + ",height=" + options.height;

            //console.log(params);
            var win = window.open(options.url, 'ElFinderManager' + options.id, params);
            win.focus()
        },
        functions: {},
        register: function(id, func){
            this.functions[id] = func;
        },
        callFunction: function(id, file){
            return this.functions[id](file, id);
        },
        functionReturnToInput: function(file, id){
            jQuery('#' + id).val(file.url);
            return true;
        }
    };

}



var megaslider = (function () {
  var slider_data = false;
  var container_id = "section#mega_slider";
  var parallax_group = false;
  var parallax_timer = false;
  var parallax_counter = 0;
  var parallax_d = 1;
  var mobile_mode = -1;
  var max_time_load_pic = 300;
  var mobile_size = 700;
  var render_slide_nom = 0;
  var tot_img_wait;
  var slides;
  var slide_select_box;
  var editor;
  var timeoutId;
  var scroll_period = 6000;

  var posArr = [
    'slider__text-lt', 'slider__text-ct', 'slider__text-rt',
    'slider__text-lc', 'slider__text-cc', 'slider__text-rc',
    'slider__text-lb', 'slider__text-cb', 'slider__text-rb',
  ];
  var pos_list = [
    'Лево верх', 'центр верх', 'право верх',
    'Лево центр', 'центр', 'право центр',
    'Лево низ', 'центр низ', 'право низ',
  ];
  var show_delay = [
    'show_no_delay',
    'show_delay_05',
    'show_delay_10',
    'show_delay_15',
    'show_delay_20',
    'show_delay_25',
    'show_delay_30'
  ];
  var hide_delay = [
    'hide_no_delay',
    'hide_delay_05',
    'hide_delay_10',
    'hide_delay_15',
    'hide_delay_20'
  ];
  var yes_no_arr = [
    'no',
    'yes'
  ];
  var yes_no_val = [
    '',
    'fixed__full-height'
  ];
  var btn_style = [
    'none',
    'bordo',
  ];
  var show_animations = [
    "not_animate",
    "bounceIn",
    "bounceInDown",
    "bounceInLeft",
    "bounceInRight",
    "bounceInUp",
    "fadeIn",
    "fadeInDown",
    "fadeInLeft",
    "fadeInRight",
    "fadeInUp",
    "flipInX",
    "flipInY",
    "lightSpeedIn",
    "rotateIn",
    "rotateInDownLeft",
    "rotateInUpLeft",
    "rotateInUpRight",
    "jackInTheBox",
    "rollIn",
    "zoomIn"
  ];

  var hide_animations = [
    "not_animate",
    "bounceOut",
    "bounceOutDown",
    "bounceOutLeft",
    "bounceOutRight",
    "bounceOutUp",
    "fadeOut",
    "fadeOutDown",
    "fadeOutLeft",
    "fadeOutRight",
    "fadeOutUp",
    "flipOutX",
    "lipOutY",
    "lightSpeedOut",
    "rotateOut",
    "rotateOutDownLeft",
    "rotateOutDownRight",
    "rotateOutUpLeft",
    "rotateOutUpRight",
    "hinge",
    "rollOut"
  ];
  var stTable;
  var paralaxTable;

  function initImageServerSelect(els) {
    if (els.length == 0)return;
    els.wrap('<div class="select_img">');
    els = els.parent();
    els.append('<button type="button" class="file_button"><i class="mce-ico mce-i-browse"></i></button>');
    /*els.find('button').on('click',function () {
     $('#roxyCustomPanel2').addClass('open')
     });*/
    for (var i = 0; i < els.length; i++) {
      var el = els.eq(i).find('input');
      if (!el.attr('id')) {
        el.attr('id', 'file_' + i + '_' + Date.now())
      }
      var t_id = el.attr('id');
      mihaildev.elFinder.register(t_id, function (file, id) {
        //$(this).val(file.url).trigger('change', [file, id]);
        $('#' + id).val(file.url).change();
        return true;
      });
    }
    ;

    $(document).on('click', '.file_button', function () {
      var $this = $(this).prev();
      var id = $this.attr('id');
      mihaildev.elFinder.openManager({
        "url": "/manager/elfinder?filter=image&callback=" + id + "&lang=ru",
        "width": "auto",
        "height": "auto",
        "id": id
      });
    });
  }

  function genInput(data) {
    var input = '<input class="' + (data.inputClass || '') + '" value="' + (data.value || '') + '">';
    if (data.label) {
      input = '<label><span>' + data.label + '</span>' + input + '</label>';
    }
    if (data.parent) {
      input = '<' + data.parent + '>' + input + '</' + data.parent + '>';
    }
    input = $(input);

    if (data.onChange) {
      var onChange;
      if (data.bind) {
        data.bind.input = input.find('input');
        onChange = data.onChange.bind(data.bind);
      } else {
        onChange = data.onChange.bind(input.find('input'));
      }
      input.find('input').on('change', onChange)
    }
    return input;
  }

  function genSelect(data) {
    var input = $('<select/>');

    var el = slider_data[0][data.gr];
    if (data.index !== false) {
      el = el[data.index];
    }

    if (el[data.param]) {
      data.value = el[data.param];
    } else {
      data.value = 0;
    }

    if (data.start_option) {
      input.append(data.start_option)
    }

    for (var i = 0; i < data.list.length; i++) {
      var val;
      var txt = data.list[i];
      if (data.val_type == 0) {
        val = data.list[i];
      } else if (data.val_type == 1) {
        val = i;
      } else if (data.val_type == 2) {
        //val=data.val_list[i];
        val = i;
        txt = data.val_list[i];
      }

      var sel = (val == data.value ? 'selected' : '');
      if (sel == 'selected') {
        input.attr('t_val', data.list[i]);
      }
      var option = '<option value="' + val + '" ' + sel + '>' + txt + '</option>';
      if (data.val_type == 2) {
        option = $(option).attr('code', data.list[i]);
      }
      input.append(option)
    }

    input.on('change', function () {
      data = this;
      var val = data.el.val();
      var sl_op = data.el.find('option[value=' + val + ']');
      var cls = sl_op.text();
      var ch = sl_op.attr('code');
      if (!ch)ch = cls;
      if (data.index !== false) {
        slider_data[0][data.gr][data.index][data.param] = val;
      } else {
        slider_data[0][data.gr][data.param] = val;
      }

      data.obj.removeClass(data.prefix + data.el.attr('t_val'));
      data.obj.addClass(data.prefix + ch);
      data.el.attr('t_val', ch);

      $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
    }.bind({
      el: input,
      obj: data.obj,
      gr: data.gr,
      index: data.index,
      param: data.param,
      prefix: data.prefix || ''
    }));

    if (data.parent) {
      var parent = $('<' + data.parent + '/>');
      parent.append(input);
      return parent;
    }
    return input;
  }

  function getSelAnimationControll(data) {
    var anim_sel = [];
    var out;

    if (data.type == 0) {
      anim_sel.push('<span>Show animation</span>');
    }
    anim_sel.push(genSelect({
      list: show_animations,
      val_type: 0,
      obj: data.obj,
      gr: data.gr,
      index: data.index,
      param: 'show_animation',
      prefix: 'slide_',
      parent: data.parent
    }));
    if (data.type == 0) {
      anim_sel.push('<span>Show delay</span>');
    }
    anim_sel.push(genSelect({
      list: show_delay,
      val_type: 1,
      obj: data.obj,
      gr: data.gr,
      index: data.index,
      param: 'show_delay',
      prefix: 'slide_',
      parent: data.parent
    }));

    if (data.type == 0) {
      anim_sel.push('<br/>');
      anim_sel.push('<span>Hide animation</span>');
    }
    anim_sel.push(genSelect({
      list: hide_animations,
      val_type: 0,
      obj: data.obj,
      gr: data.gr,
      index: data.index,
      param: 'hide_animation',
      prefix: 'slide_',
      parent: data.parent
    }));
    if (data.type == 0) {
      anim_sel.push('<span>Hide delay</span>');
    }
    anim_sel.push(genSelect({
      list: hide_delay,
      val_type: 1,
      obj: data.obj,
      gr: data.gr,
      index: data.index,
      param: 'hide_delay',
      prefix: 'slide_',
      parent: data.parent
    }));

    if (data.type == 0) {
      out = $('<div class="anim_sel"/>');
      out.append(anim_sel);
    }
    if (data.type == 1) {
      out = anim_sel;
    }

    return out;
  }

  function init_editor() {
    $('#w1').remove();
    $('#w1_button').remove();
    slider_data[0].mobile = slider_data[0].mobile.split('?')[0];

    var el = $('#mega_slider_controle');
    var btns_box = $('<div class="btn_box"/>');

    el.append('<h2>Управление</h2>');
    el.append($('<textarea/>', {
      text: JSON.stringify(slider_data[0]),
      id: 'slide_data',
      name: editor
    }));

    var btn = $('<button class=""/>').text("Активировать слайд");
    btns_box.append(btn);
    btn.on('click', function (e) {
      e.preventDefault();
      $('#mega_slider .slide').eq(0).addClass('slider-active');
      $('#mega_slider .slide').eq(0).removeClass('hide_slide');
    });

    var btn = $('<button class=""/>').text("Деактивировать слайд");
    btns_box.append(btn);
    btn.on('click', function (e) {
      e.preventDefault();
      $('#mega_slider .slide').eq(0).removeClass('slider-active');
      $('#mega_slider .slide').eq(0).addClass('hide_slide');
    });
    el.append(btns_box);

    el.append('<h2>Общие параметры</h2>');
    el.append(genInput({
      value: slider_data[0].mobile,
      label: "Слайд для телефона",
      inputClass: "fileSelect",
      onChange: function (e) {
        e.preventDefault();
        slider_data[0].mobile = $(this).val()
        $('.mob_bg').eq(0).css('background-image', 'url(' + slider_data[0].mobile + ')');
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));

    el.append(genInput({
      value: slider_data[0].fon,
      label: "Осноной фон",
      inputClass: "fileSelect",
      onChange: function (e) {
        e.preventDefault();
        slider_data[0].fon = $(this).val()
        $('#mega_slider .slide').eq(0).css('background-image', 'url(' + slider_data[0].fon + ')')
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));

    var btn_ch = $('<div class="btns"/>');
    btn_ch.append('<h3>Кнопка перехода(для ПК версии)</h3>');
    btn_ch.append(genInput({
      value: slider_data[0].button.text,
      label: "Текст",
      onChange: function (e) {
        e.preventDefault();
        slider_data[0].button.text = $(this).val();
        $('#mega_slider .slider__href').eq(0).text(slider_data[0].button.text);
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      },
    }));

    var but_sl = $('#mega_slider .slider__href').eq(0);
    btn_ch.append(genInput({
      value: slider_data[0].button.href,
      label: "Ссылка",
      onChange: function (e) {
        e.preventDefault();
        slider_data[0].button.href = $(this).val();
        $('#mega_slider .slider__href').eq(0).attr('href',slider_data[0].button.href);
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      },
    }));

    btn_ch.append('<br/>');
    var wrap_lab = $('<label/>');
    btn_ch.append(wrap_lab);
    wrap_lab.append('<span>Оформление кнопки</span>');
    wrap_lab.append(genSelect({
      list: btn_style,
      val_type: 0,
      obj: but_sl,
      gr: 'button',
      index: false,
      param: 'color'
    }));

    btn_ch.append('<br/>');
    wrap_lab = $('<label/>');
    btn_ch.append(wrap_lab);
    wrap_lab.append('<span>Положение кнопки</span>');
    wrap_lab.append(genSelect({
      list: posArr,
      val_list: pos_list,
      val_type: 2,
      obj: but_sl.parent().parent(),
      gr: 'button',
      index: false,
      param: 'pos'
    }));

    btn_ch.append(getSelAnimationControll({
      type: 0,
      obj: but_sl.parent(),
      gr: 'button',
      index: false
    }));
    el.append(btn_ch);

    var layer = $('<div class="fixed_layer"/>');
    layer.append('<h2>Статические слои</h2>');
    var th = "<th>№</th>" +
      "<th>Картинка</th>" +
      "<th>Положение</th>" +
      "<th>Слой на всю высоту</th>" +
      "<th>Анимация появления</th>" +
      "<th>Задержка появления</th>" +
      "<th>Анимация исчезновения</th>" +
      "<th>Задержка исчезновения</th>" +
      "<th>Действие</th>";
    stTable = $('<table border="1"><tr>' + th + '</tr></table>');
    //если есть паралакс слои заполняем
    var data = slider_data[0].fixed;
    if (data && data.length > 0) {
      for (var i = 0; i < data.length; i++) {
        addTrStatic(data[i]);
      }
    }
    layer.append(stTable);
    var addBtn = $('<button/>', {
      text: "Добавить слой"
    });
    addBtn.on('click', function (e) {
      e.preventDefault();
      data = addTrStatic(false);
      initImageServerSelect(data.editor.find('.fileSelect'));
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      slider_data: slider_data
    }));
    layer.append(addBtn);
    el.append(layer);

    var layer = $('<div class="paralax_layer"/>');
    layer.append('<h2>Паралакс слои</h2>');
    var th = "<th>№</th>" +
      "<th>Картинка</th>" +
      "<th>Положение</th>" +
      "<th>Удаленность (целое положительное число)</th>" +
      "<th>Действие</th>";

    paralaxTable = $('<table border="1"><tr>' + th + '</tr></table>');
    //если есть паралакс слои заполняем
    var data = slider_data[0].paralax;
    if (data && data.length > 0) {
      for (var i = 0; i < data.length; i++) {
        addTrParalax(data[i]);
      }
    }
    layer.append(paralaxTable);
    var addBtn = $('<button/>', {
      text: "Добавить слой"
    });
    addBtn.on('click', function (e) {
      e.preventDefault();
      data = addTrParalax(false);
      initImageServerSelect(data.editor.find('.fileSelect'));
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      slider_data: slider_data
    }));

    layer.append(addBtn);
    el.append(layer);

    initImageServerSelect(el.find('.fileSelect'));
  }

  function addTrStatic(data) {
    var i = stTable.find('tr').length - 1;
    if (!data) {
      data = {
        "img": "",
        "full_height": 0,
        "pos": 0,
        "show_delay": 1,
        "show_animation": "lightSpeedIn",
        "hide_delay": 1,
        "hide_animation": "bounceOut"
      };
      slider_data[0].fixed.push(data);
      var fix = $('#mega_slider .fixed_group');
      addStaticLayer(data, fix, true);
    }
    ;

    var tr = $('<tr/>');
    tr.append('<td class="td_counter"/>');
    tr.append(genInput({
      value: data.img,
      label: false,
      parent: 'td',
      inputClass: "fileSelect",
      bind: {
        gr: 'fixed',
        index: i,
        param: 'img',
        obj: $('#mega_slider .fixed_group .fixed__layer').eq(i).find('.animation_layer'),
      },
      onChange: function (e) {
        e.preventDefault();
        var data = this;
        data.obj.css('background-image', 'url(' + data.input.val() + ')');
        slider_data[0].fixed[data.index].img = data.input.val();
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));
    tr.append(genSelect({
      list: posArr,
      val_list: pos_list,
      val_type: 2,
      obj: $('#mega_slider .fixed_group .fixed__layer').eq(i),
      gr: 'fixed',
      index: i,
      param: 'pos',
      parent: 'td',
    }));
    tr.append(genSelect({
      list: yes_no_val,
      val_list: yes_no_arr,
      val_type: 2,
      obj: $('#mega_slider .fixed_group .fixed__layer').eq(i),
      gr: 'fixed',
      index: i,
      param: 'full_height',
      parent: 'td',
    }));
    tr.append(getSelAnimationControll({
      type: 1,
      obj: $('#mega_slider .fixed_group .fixed__layer').eq(i).find('.animation_layer'),
      gr: 'fixed',
      index: i,
      parent: 'td'
    }));
    var delBtn = $('<button/>', {
      text: "Удалить"
    });
    delBtn.on('click', function (e) {
      e.preventDefault();
      var $this = $(this.el);
      i = $this.closest('tr').index() - 1;
      $('#mega_slider .fixed_group .fixed__layer').eq(i).remove(); //удаляем слой на слайдере
      $this.closest('tr').remove(); //удаляем строку в таблице
      this.slider_data[0].fixed.splice(i, 1); //удаляем из конфига слайда
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      el: delBtn,
      slider_data: slider_data
    }));
    var delBtnTd = $('<td/>').append(delBtn);
    tr.append(delBtnTd);
    stTable.append(tr)

    return {
      editor: tr,
      data: data
    }
  }

  function addTrParalax(data) {
    var i = paralaxTable.find('tr').length - 1;
    if (!data) {
      data = {
        "img": "",
        "z": 1
      };
      slider_data[0].paralax.push(data);
      var paralax_gr = $('#mega_slider .parallax__group');
      addParalaxLayer(data, paralax_gr);
    }
    ;
    var tr = $('<tr/>');
    tr.append('<td class="td_counter"/>');
    tr.append(genInput({
      value: data.img,
      label: false,
      parent: 'td',
      inputClass: "fileSelect",
      bind: {
        index: i,
        param: 'img',
        obj: $('#mega_slider .parallax__group .parallax__layer').eq(i).find('span'),
      },
      onChange: function (e) {
        e.preventDefault();
        var data = this;
        data.obj.css('background-image', 'url(' + data.input.val() + ')');
        slider_data[0].paralax[data.index].img = data.input.val();
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));
    tr.append(genSelect({
      list: posArr,
      val_list: pos_list,
      val_type: 2,
      obj: $('#mega_slider .parallax__group .parallax__layer').eq(i).find('span'),
      gr: 'paralax',
      index: i,
      param: 'pos',
      parent: 'td',
      start_option: '<option value="" code="">на весь экран</option>'
    }));
    tr.append(genInput({
      value: data.z,
      label: false,
      parent: 'td',
      bind: {
        index: i,
        param: 'img',
        obj: $('#mega_slider .parallax__group .parallax__layer').eq(i),
      },
      onChange: function (e) {
        e.preventDefault();
        var data = this;
        data.obj.attr('z', data.input.val());
        slider_data[0].paralax[data.index].z = data.input.val();
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));

    var delBtn = $('<button/>', {
      text: "Удалить"
    });
    delBtn.on('click', function (e) {
      e.preventDefault();
      var $this = $(this.el);
      i = $this.closest('tr').index() - 1;
      $('#mega_slider .fixed_group .fixed__layer').eq(i).remove(); //удаляем слой на слайдере
      $this.closest('tr').remove(); //удаляем строку в таблице
      this.slider_data[0].paralax.splice(i, 1); //удаляем из конфига слайда
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      el: delBtn,
      slider_data: slider_data
    }));
    var delBtnTd = $('<td/>').append(delBtn);
    tr.append(delBtnTd);
    paralaxTable.append(tr)

    return {
      editor: tr,
      data: data
    }
  }

  function add_animation(el, data) {
    var out = $('<div/>', {
      'class': 'animation_layer'
    });

    if (typeof(data.show_delay) != 'undefined') {
      out.addClass(show_delay[data.show_delay]);
      if (data.show_animation) {
        out.addClass('slide_' + data.show_animation);
      }
    }

    if (typeof(data.hide_delay) != 'undefined') {
      out.addClass(hide_delay[data.hide_delay]);
      if (data.hide_animation) {
        out.addClass('slide_' + data.hide_animation);
      }
    }

    el.append(out);
    return el;
  }

  function generate_slide(data) {
    var slide = $('<div class="slide"/>');

    var mob_bg = $('<a class="mob_bg" href="' + data.button.href + '"/>');
    mob_bg.css('background-image', 'url(' + data.mobile + ')')

    slide.append(mob_bg);
    if (mobile_mode) {
      return slide;
    }

    //если есть фон то заполняем
    if (data.fon) {
      slide.css('background-image', 'url(' + data.fon + ')')
    }

    //если есть паралакс слои заполняем
    if (data.paralax && data.paralax.length > 0) {
      var paralax_gr = $('<div class="parallax__group"/>');
      for (var i = 0; i < data.paralax.length; i++) {
        addParalaxLayer(data.paralax[i], paralax_gr)
      }
      slide.append(paralax_gr)
    }

    var fix = $('<div class="fixed_group"/>');
    for (var i = 0; i < data.fixed.length; i++) {
      addStaticLayer(data.fixed[i], fix)
    }

    var dop_blk = $("<div class='fixed__layer'/>");
    dop_blk.addClass(posArr[data.button.pos]);
    var but = $("<a class='slider__href'/>");
    but.attr('href', data.button.href);
    but.text(data.button.text);
    but.addClass(data.button.color);
    dop_blk = add_animation(dop_blk, data.button);
    dop_blk.find('div').append(but);
    fix.append(dop_blk);

    slide.append(fix);
    return slide;
  }

  function addParalaxLayer(data, paralax_gr) {
    var parallax_layer = $('<div class="parallax__layer"\>');
    parallax_layer.attr('z', data.z || i * 10);
    var dop_blk = $("<span class='slider__text'/>");
    if (data.pos) {
      dop_blk.addClass(posArr[data.pos]);
    }
    dop_blk.css('background-image', 'url(' + data.img + ')');
    parallax_layer.append(dop_blk);
    paralax_gr.append(parallax_layer);
  }

  function addStaticLayer(data, fix, befor_button) {
    var dop_blk = $("<div class='fixed__layer'/>");
    dop_blk.addClass(posArr[data.pos]);
    if (data.full_height) {
      dop_blk.addClass('fixed__full-height');
    }
    dop_blk = add_animation(dop_blk, data);
    dop_blk.find('.animation_layer').css('background-image', 'url(' + data.img + ')');

    if (befor_button) {
      fix.find('.slider__href').closest('.fixed__layer').before(dop_blk)
    } else {
      fix.append(dop_blk)
    }
  }

  function next_slide() {
    if ($('#mega_slider').hasClass('stop_slide'))return;

    var slide_points = $('.slide_select_box .slide_select')
    var slide_cnt = slide_points.length;
    var active = $('.slide_select_box .slider-active').index() + 1;
    if (active >= slide_cnt)active = 0;
    slide_points.eq(active).click();

    timeoutId=setTimeout(next_slide, scroll_period);
  }

  function img_to_load(src) {
    var img = $('<img/>');
    img.on('load', function () {
      tot_img_wait--;

      if (tot_img_wait == 0) {

        slides.append(generate_slide(slider_data[render_slide_nom]));
        slide_select_box.find('li').eq(render_slide_nom).removeClass('disabled');

        if (render_slide_nom == 0) {
          slides.find('.slide')
            .addClass('first_show')
            .addClass('slider-active');
          slide_select_box.find('li').eq(0).addClass('slider-active');

          if (!editor) {
            if(timeoutId)clearTimeout(timeoutId);
            timeoutId=setTimeout(function () {
              $(this).find('.first_show').removeClass('first_show');
            }.bind(slides), scroll_period);
          }

          if (mobile_mode === false) {
            parallax_group = $(container_id + ' .slider-active .parallax__group>*');
            parallax_counter = 0;
            parallax_timer = setInterval(render, 100);
          }

          if (editor) {
            init_editor()
          } else {
            if(timeoutId)clearTimeout(timeoutId);
            timeoutId = setTimeout(next_slide, scroll_period);

            $('.slide_select_box').on('click', '.slide_select', function () {
              var $this = $(this);
              if ($this.hasClass('slider-active'))return;

              var index = $this.index();
              $('.slide_select_box .slider-active').removeClass('slider-active');
              $this.addClass('slider-active');

              $(container_id + ' .slide.slider-active').removeClass('slider-active');
              $(container_id + ' .slide').eq(index).addClass('slider-active');

              parallax_group = $(container_id + ' .slider-active .parallax__group>*');
            });

            $('#mega_slider').hover(function () {
              if(timeoutId)clearTimeout(timeoutId);
              $('#mega_slider').addClass('stop_slide');
            }, function () {
              timeoutId = setTimeout(next_slide, scroll_period);
              $('#mega_slider').removeClass('stop_slide');
            });
          }
        }

        render_slide_nom++;
        if (render_slide_nom < slider_data.length) {
          load_slide_img()
        }
      }
    }).on('error', function () {
      tot_img_wait--;
    });
    img.prop('src', src);
  }

  function load_slide_img() {
    var data = slider_data[render_slide_nom];
    tot_img_wait = 1;

    if (mobile_mode === false) {
      tot_img_wait++;
      img_to_load(data.fon);
      //если есть паралакс слои заполняем
      if (data.paralax && data.paralax.length > 0) {
        tot_img_wait += data.paralax.length;
        for (var i = 0; i < data.paralax.length; i++) {
          img_to_load(data.paralax[i].img)
        }
      }
      if (data.fixed && data.fixed.length > 0) {
        tot_img_wait += data.fixed.length;
        for (var i = 0; i < data.fixed.length; i++) {
          img_to_load(data.fixed[i].img)
        }
      }
    }

    img_to_load(data.mobile);
  }

  function start_init_slide(data) {
    var n = performance.now();
    var img = $('<img/>');
    img.attr('time', n);

    function on_img_load() {
      var n = performance.now();
      img = $(this);
      n = n - parseInt(img.attr('time'));
      if (n > max_time_load_pic) {
        mobile_mode = true;
      } else {
        var max_size = (screen.height > screen.width ? screen.height : screen.width);
        if (max_size < mobile_size) {
          mobile_mode = true;
        } else {
          mobile_mode = false;
        }
      }
      if (mobile_mode == true) {
        $(container_id).addClass('mobile_mode')
      }
      render_slide_nom = 0;
      load_slide_img();
      $('.sk-folding-cube').remove();
    };

    img.on('load', on_img_load());
    if (slider_data.length > 0) {
      slider_data[0].mobile = slider_data[0].mobile + '?r=' + Math.random();
      img.prop('src', slider_data[0].mobile);
    } else {
      on_img_load().bind(img);
    }
  }

  function init(data, editor_init) {
    slider_data = data;
    editor = editor_init;
    //находим контейнер и очищаем его
    var container = $(container_id);
    container.html('');

    //созжаем базовые контейнеры для самих слайдов и для переключателей
    slides = $('<div/>', {
      'class': 'slides'
    });
    var slide_control = $('<div/>', {
      'class': 'slide_control'
    });
    slide_select_box = $('<ul/>', {
      'class': 'slide_select_box'
    });

    //добавляем индикатор загрузки
    var l = '<div class="sk-folding-cube">' +
      '<div class="sk-cube1 sk-cube"></div>' +
      '<div class="sk-cube2 sk-cube"></div>' +
      '<div class="sk-cube4 sk-cube"></div>' +
      '<div class="sk-cube3 sk-cube"></div>' +
      '</div>';
    container.html(l);


    start_init_slide(data[0]);

    //генерируем кнопки и слайды
    for (var i = 0; i < data.length; i++) {
      //slides.append(generate_slide(data[i]));
      slide_select_box.append('<li class="slide_select disabled"/>')
    }

    /*slides.find('.slide').eq(0)
     .addClass('slider-active')
     .addClass('first_show');
     slide_control.find('li').eq(0).addClass('slider-active');*/

    container.append(slides);
    slide_control.append(slide_select_box);
    container.append(slide_control);


  }

  function render() {
    if (!parallax_group)return false;
    var parallax_k = (parallax_counter - 10) / 2;

    for (var i = 0; i < parallax_group.length; i++) {
      var el = parallax_group.eq(i);
      var j = el.attr('z');
      var tr = 'rotate3d(0.1,0.8,0,' + (parallax_k) + 'deg) scale(' + (1 + j * 0.5) + ') translateZ(-' + (10 + j * 20) + 'px)';
      el.css('transform', tr)
    }
    parallax_counter += parallax_d * 0.1;
    if (parallax_counter >= 20)parallax_d = -parallax_d;
    if (parallax_counter <= 0)parallax_d = -parallax_d;
  }

  initImageServerSelect($('.fileSelect'));

  return {
    init: init
  };
}());

var headerActions = function () {
  var scrolledDown = false;
  var shadowedDown = false;

  $('.menu-toggle').click(function (e) {
    e.preventDefault();
    $('body').removeClass('no_scroll_account');
    $('.account-menu-toggle').removeClass('open');
    $('.account-menu').addClass('hidden');
    $('.header').toggleClass('header_open-menu');
    $('.drop-menu').removeClass('open').removeClass('close').find('li').removeClass('open').removeClass('close');
    if ($('.header').hasClass('header_open-menu')) {
      $('.header').removeClass('header-search-open');
      $('body').addClass('no_scroll');
    } else {
      $('body').removeClass('no_scroll');
    }
  });

  $('.search-toggle').click(function (e) {
    e.preventDefault();
    $('body').removeClass('no_scroll_account');
    $('.account-menu').addClass('hidden');
    $('.account-menu-toggle').removeClass('open');
    $('.header').toggleClass('header-search-open');
    $('#autocomplete').fadeOut();
    if ($('.header').hasClass('header-search-open')) {
      $('.header').removeClass('header_open-menu');
    }
  });

  $('#header').click(function (e) {
    if (e.target.id == 'header') {
      $(this).removeClass('header_open-menu');
      $(this).removeClass('header-search-open');
      $('body').removeClass('no_scroll');
    }
  });

  $('.header-search_form-button').click(function (e) {
    e.preventDefault();
    $(this).closest('form').submit();
  });

  $('.header-secondline_close').click(function (e) {
    $('.header').removeClass('header_open-menu');
    $('.account-menu').addClass('hidden');
    $('body').removeClass('no_scroll');
    $('body').removeClass('no_scroll_account');
  });

  $('.header-upline').on('mouseover', function (e) {
    if (!scrolledDown)return;
    if (window.innerWidth < 1024) {
      return null;
    }

    $('.header-secondline').removeClass('scroll-down');
    $('body').removeClass('no_scroll');
    scrolledDown = false;
  });

  $(window).on('load resize scroll', function () {
    var shadowHeight = 50;
    var hideHeight = 200;
    var headerSecondLine = $('.header-secondline');
    var hovers = headerSecondLine.find(':hover');
    var header = $('.header');

    if (!hovers.length) {
      headerSecondLine.removeClass('scrollable');
      header.removeClass('scrollable');
      //document.documentElement.scrollTop
      var scrollTop = $(window).scrollTop();
      if (scrollTop > shadowHeight && shadowedDown === false) {
        shadowedDown = true;
        headerSecondLine.addClass('shadowed');
      }
      if (scrollTop <= shadowHeight && shadowedDown === true) {
        shadowedDown = false;
        headerSecondLine.removeClass('shadowed');
      }
      if (scrollTop > hideHeight && scrolledDown === false) {
        scrolledDown = true;
        headerSecondLine.addClass('scroll-down');
      }
      if (scrollTop <= hideHeight && scrolledDown === true) {
        scrolledDown = false;
        headerSecondLine.removeClass('scroll-down');
      }
    } else {
      headerSecondLine.addClass('scrollable');
      header.addClass('scrollable');
    }
  });

  $('.menu_angle-down, .drop-menu_group__up-header').click(function (e) {
    var menuOpen = $(this).closest('.header_open-menu, .catalog-categories');
    if (!menuOpen.length) {
      return true;
    }
    e.preventDefault();
    var parent = $(this).closest('.drop-menu_group__up, .menu-group');
    var parentMenu = $(this).closest('.drop-menu');
    if (parentMenu) {
      $(parentMenu).siblings('ul').find('li').removeClass('open');
    }
    if (parent) {
      $(parent).siblings('li').removeClass('open');
      $(parent).toggleClass('open');
      if (parent.hasClass('open')) {
        $(parent).removeClass('close');
        $(parent).siblings('li').addClass('close');
        if (parentMenu) {
          $(parentMenu).siblings('ul').children('li').addClass('close');
          $(parentMenu).siblings('ul').addClass('close');
        }
      } else {
        $(parent).siblings('li').removeClass('close');
        if (parentMenu) {
          $(parentMenu).siblings('ul').children('li').removeClass('close');
          $(parentMenu).siblings('ul').removeClass('close');
        }
      }
    }

    return false;
  });

  var accountMenuTimeOut = null;
  var accountMenuOpenTime = 0;
  var accountMenu = $('.account-menu');

  $('.account-menu-toggle').click(function (e) {
    e.preventDefault();
    if (window.innerWidth > 1024) {
      return null;
    }
    $('.header').removeClass('header_open-menu');
    $('.header').removeClass('header-search-open');
    var that = $(this);

    clearInterval(accountMenuTimeOut);

    if (accountMenu.hasClass('hidden')) {
      menuAccountUp(that);

    } else {
      that.removeClass('open');
      accountMenu.addClass('hidden');
      $('body').removeClass('no_scroll_account');
    }

  });

  //показ меню аккаунт
  function menuAccountUp(toggleButton) {
    clearInterval(accountMenuTimeOut);
    toggleButton.addClass('open');
    accountMenu.removeClass('hidden');
    if (window.innerWidth <= 1024) {
      $('body').addClass('no_scroll_account');
    }

    accountMenuOpenTime = new Date();
    accountMenuTimeOut = setInterval(function () {

      if (window.innerWidth <= 1024) {
        clearInterval(accountMenuTimeOut);
      }
      if ((new Date() - accountMenuOpenTime) > 1000 * 7) {
        accountMenu.addClass('hidden');
        toggleButton.removeClass('open');
        clearInterval(accountMenuTimeOut);
        $('body').removeClass('no_scroll_account');
      }

    }, 1000);
  }

  $('.catalog-categories-account_menu-header').on('mouseover', function () {
    accountMenuOpenTime = new Date();
  });
  $('.account-menu').click(function (e) {
    if ($(e.target).hasClass('account-menu')) {
      $(e.target).addClass('hidden');
      $('.account-menu-toggle').removeClass('open');
    }
  });
}();

$(function () {
  function parseNum(str) {
    return parseFloat(
      String(str)
        .replace(',', '.')
        .match(/-?\d+(?:\.\d+)?/g, '') || 0
      , 10
    );
  }

  $('.short-calc-cashback').find('select,input').on('change keyup click', function () {
    var $this = $(this).closest('.short-calc-cashback');
    var curs = parseNum($this.find('select').val());
    var val = $this.find('input').val();
    if (parseNum(val) != val) {
      val = $this.find('input').val(parseNum(val));
    }
    val = parseNum(val);

    var koef = $this.find('input').attr('data-cashback').trim();
    var promo = $this.find('input').attr('data-cashback-promo').trim();
    var currency = $this.find('input').attr('data-cashback-currency').trim();
    var result = 0;
    var out = 0;

    if (koef == promo) {
      promo = 0;
    }

    if (koef.indexOf('%') > 0) {
      result = parseNum(koef) * val * curs / 100;
    } else {
      curs = parseNum($this.find('[code=' + currency + ']').val());
      result = parseNum(koef) * curs
    }

    if (parseNum(promo) > 0) {
      if (promo.indexOf('%') > 0) {
        promo = parseNum(promo) * val * curs / 100;
      } else {
        promo = parseNum(promo) * curs
      }

      if (promo > 0) {
        out = "<span class=old_price>" + result.toFixed(2) + "</span> " + promo.toFixed(2);
      } else {
        out = result.toFixed(2);
      }
    } else {
      out = result.toFixed(2);
    }


    $this.find('.calc-result_value').html(out)
  }).click()
});

(function () {
  var els = $('.auto_hide_control');
  if (els.length == 0)return;

  $(document).on('click', ".scroll_box-show_more", function (e) {
    e.preventDefault();
    var data = {
      buttonYes: false,
      notyfy_class: "notify_white notify_not_big"
    };

    $this = $(this);
    var content = $this.closest('.scroll_box-item').clone();
    content = content[0];
    content.className += ' scroll_box-item-modal';
    var div = document.createElement('div');
    div.className = 'comments';
    div.append(content);
    $(div).find('.scroll_box-show_more').remove();
    $(div).find('.max_text_hide')
      .removeClass('max_text_hide-x2')
      .removeClass('max_text_hide');
    data.question = div.outerHTML;

    notification.alert(data);
  });

  function hasScroll(el) {
    if (!el) {
      return false;
    }
    return el.scrollHeight > el.clientHeight;
  }

  function rebuild() {
    for (var i = 0; i < els.length; i++) {
      var el = els.eq(i);
      var is_hide = false;
      if (el.height() < 10) {
        is_hide = true;
        el.closest('.scroll_box-item-hide').show(0);
      }

      var text = el.find('.scroll_box-text');
      var answer = el.find('.scroll_box-answer');
      var show_more = el.find('.scroll_box-show_more');

      var show_btn = false;
      if (hasScroll(text[0])) {
        show_btn = true;
        text.removeClass('max_text_hide-hide');
      } else {
        text.addClass('max_text_hide-hide');
      }

      if (answer.length > 0) {
        //есть ответ админа
        if (hasScroll(answer[0])) {
          show_btn = true;
          answer.removeClass('max_text_hide-hide');
        } else {
          answer.addClass('max_text_hide-hide');
        }
      }

      if (show_btn) {
        show_more.show();
      } else {
        show_more.hide();
      }

      if (is_hide) {
        el.closest('.scroll_box-item-hide').hide(0);
      }
    }
  }

  $(window).resize(rebuild);
  rebuild();
})();

(function () {
  $('body').on('click', '.show_all', function (e) {
    e.preventDefault();
    var cls = $(this).data('cntrl-class');
    $('.hide_all[data-cntrl-class]').show();
    $(this).hide();
    $('.' + cls).show();
  });

  $('body').on('click', '.hide_all', function (e) {
    e.preventDefault();
    var cls = $(this).data('cntrl-class');
    $('.show_all[data-cntrl-class]').show();
    $(this).hide();
    $('.' + cls).hide();
  });
})();

$(document).ready(function () {
  function declOfNum(number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
  }

  function firstZero(v) {
    v = Math.floor(v);
    if (v < 10)
      return '0' + v;
    else
      return v;
  }

  var clocks = $('.clock');
  if (clocks.length > 0) {
    function updateClock() {
      var clocks = $(this);
      var now = new Date();
      for (var i = 0; i < clocks.length; i++) {
        var c = clocks.eq(i);
        var end = new Date(c.data('end').replace(/-/g, "/"));
        var d = (end.getTime() - now.getTime()) / 1000;

        //если срок прошел
        if (d <= 0) {
          c.text(lg("promocode_expires"));
          c.addClass('clock-expired');
          continue;
        }

        //если срок более 30 дней
        if (d > 30 * 60 * 60 * 24) {
          c.html(lg( "promocode_left_30_days"));
          continue;
        }

        var s = d % 60;
        d = (d - s) / 60;
        var m = d % 60;
        d = (d - m) / 60;
        var h = d % 24;
        d = (d - h) / 24;

        var str = firstZero(h) + ":" + firstZero(m) + ":" + firstZero(s);
        if (d > 0) {
          str = d + " " + declOfNum(d, [lg("day_case_0"), lg("day_case_1"), lg("day_case_2")]) + "  " + str;
        }
        c.html("Осталось: <span>" + str + "</span>");
      }
    }

    setInterval(updateClock.bind(clocks), 1000);
    updateClock.bind(clocks)();
  }
});

var catalogTypeSwitcher = function () {
  var catalog = $('.catalog_list');
  if (catalog.length == 0)return;

  $('.catalog-stores_switcher-item-button').click(function (e) {
    e.preventDefault();
    $(this).parent().siblings().find('.catalog-stores_switcher-item-button').removeClass('checked');
    $(this).addClass('checked');
    if (catalog) {
      if ($(this).hasClass('catalog-stores_switcher-item-button-type-list')) {
        catalog.removeClass('narrow');
        setCookie('coupons_view', '')
      }
      if ($(this).hasClass('catalog-stores_switcher-item-button-type-narrow')) {
        catalog.addClass('narrow');
        setCookie('coupons_view', 'narrow');
      }
    }
  });

  if (getCookie('coupons_view') == 'narrow' && !catalog.hasClass('narrow_off')) {
    catalog.addClass('narrow');
    $('.catalog-stores_switcher-item-button-type-narrow').addClass('checked');
    $('.catalog-stores_switcher-item-button-type-list').removeClass('checked');
  }
}();

$(function () {
  $('.sd-select-selected').click(function () {
    var parent = $(this).parent();
    var dropBlock = $(parent).find('.sd-select-drop');

    if (dropBlock.is(':hidden')) {
      dropBlock.slideDown();

      $(this).addClass('active');

      if (!parent.hasClass('linked')) {

        $('.sd-select-drop').find('a').click(function (e) {

          e.preventDefault();
          var selectResult = $(this).html();

          $(parent).find('input').val(selectResult);

          $(parent).find('.sd-select-selected').removeClass('active').html(selectResult);

          dropBlock.slideUp();
        });
      }

    } else {
      $(this).removeClass('active');
      dropBlock.slideUp();
    }
    return false;
  });

});

search = function () {
  var openAutocomplete;

  $('.search-form-input').on('input', function (e) {
    e.preventDefault();
    $this = $(this);
    var query = $this.val();
    var data = $this.closest('form').serialize();
    var autocomplete = $this.closest('.stores_search').find('.autocomplete-wrap');// $('#autocomplete'),
    var autocompleteList = $(autocomplete).find('ul');
    openAutocomplete = autocomplete;
    if (query.length > 1) {
      url = $this.closest('form').attr('action') || '/search';
      $.ajax({
        url: url,
        type: 'get',
        data: data,
        dataType: 'json',
        success: function (data) {
          if (data.suggestions) {
            if (autocomplete) {
              $(autocompleteList).html('');
            }
            if (data.suggestions.length) {
              data.suggestions.forEach(function (item) {
                var html = '<a class="autocomplete_link" href="' + item.data.route + '"' + '>' + item.value + item.cashback + '</a>';
                var li = document.createElement('li');
                li.innerHTML = html;
                if (autocompleteList) {
                  $(autocompleteList).append(li);
                }
              });
              if (autocomplete) {
                $(autocomplete).fadeIn();
              }
            } else {
              if (autocomplete) {
                $(autocomplete).fadeOut();
              }
            }
          }
        }
      });
    } else {
      if (autocomplete) {
        $(autocompleteList).html('');
        $(autocomplete).fadeOut();
      }
    }
    return false;
  }).on('focusout', function (e) {
    if (!$(e.relatedTarget).hasClass('autocomplete_link')) {
      //$('#autocomplete').hide();
      $(openAutocomplete).delay(100).slideUp(100)
    }
  });

  $('body').on('submit', '.stores-search_form', function (e) {
    var val = $(this).find('.search-form-input').val();
    if (val.length < 2) {
      return false;
    }
  })
}();

(function () {

  $('.coupons-list_item-content-goto-promocode-link').click(function (e) {
    var that = $(this);
    var expired = that.closest('.coupons-list_item').find('.clock-expired');
    var userId = $(that).data('user');
    var inactive = $(that).data('inactive');
    var data_message = $(that).data('message');

    if (inactive) {
      var title = data_message ? data_message : lg("promocode_is_inactive");
      var message = lg("promocode_view_all");
      notification.alert({
        'title': title,
        'question': message,
        'buttonYes': 'Ok',
        'buttonNo': false,
        'notyfy_class': 'notify_box-alert'
      });
      return false;
    } else if (expired.length > 0) {
      var title = lg("promocode_is_expires");
      var message = lg("promocode_view_all");
      notification.alert({
        'title': title,
        'question': message,
        'buttonYes': 'Ok',
        'buttonNo': false,
        'notyfy_class': 'notify_box-alert'
      });
      return false;
    } else if (!userId) {
      var data = {
        'buttonYes': false,
        'notyfy_class': "notify_box-alert",
        'title': lg("use_promocode"),
        'question': '<div class="notify_box-coupon-noregister">' +
        '<img src="/images/templates/swa.png" alt="">' +
        '<p><b>'+lg("promocode_use_without_cashback_or_register")+'</b></p>' +
        '</div>' +
        '<div class="notify_box-buttons">' +
        '<a href="' + that.attr('href') + '" target="_blank" class="btn">'+lg("use_promocode")+'</a>' +
        '<a href="#registration" class="btn btn-transform modals_open">'+lg("register")+'</a>' +
        '</div>'
      };
      notification.alert(data);
      return false;
    }
  });

  $('#shop_header-goto-checkbox').click(function(){
     if (!$(this).is(':checked')) {
         notification.alert({
             'title': lg("attentions"),
             'question': lg("promocode_recommendations"),
             'buttonYes': lg("close"),
             'buttonNo': false,
             'notyfy_class': 'notify_box-alert'
         });
     }
  });



}());

(function () {
  $('.account-withdraw-methods_item-option').click(function (e) {
    e.preventDefault();
    var option = $(this).data('option-process'),
      placeholder = '';
    switch (option) {
      case 1:
        placeholder = lg("withdraw_cash_number");
        break;

      case 2:
        placeholder = lg("withdraw_r_number");
        break;

      case 3:
        placeholder = lg("withdraw_phone_number");
        break;

      case 4:
        placeholder = lg("withdraw_cart_number");
        break;

      case 5:
        placeholder = lg("withdraw_email");
        break;

      case 6:
        placeholder = lg("withdraw_phone_number");
        break;
    }

    $(this).parent().siblings().removeClass('active');
    $(this).parent().addClass('active');
    $("#userswithdraw-bill").prev(".placeholder").html(placeholder);
    $('#userswithdraw-process_id').val(option);
  });
})();

(function () {
  ajaxForm($('.ajax_form'));
})();

(function () {
  $('.dobro-funds_item-button').click(function (e) {
    $('#dobro-send-form-charity-process').val($(this).data('id'));
  });

})();

(function () {
  $('.catalog-categories_tree-toggle').on('click', function () {
    $('body').addClass('no_scroll');
    $('.catalog-categories_tree-cat').addClass('catalog-categories_tree-cat-open');
    $('.catalog-categories_tree-toggle').addClass('catalog-categories_tree-toggle-open');
  });
  $('.catalog-categories_tree-cat-close').on('click', function () {
    $('body').removeClass('no_scroll');
    $('.catalog-categories_tree-cat').removeClass('catalog-categories_tree-cat-open');
    $('.catalog-categories_tree-toggle').removeClass('catalog-categories_tree-toggle-open');
  });
})();

//window.addEventListener('load', function() {
share42 = function (){
  e=document.getElementsByClassName('share42init');
  for (var k = 0; k < e.length; k++) {
    var u = "";
    if (e[k].getAttribute('data-socials') != -1)
      var socials = JSON.parse('['+e[k].getAttribute('data-socials')+']');
    var icon_type=e[k].getAttribute('data-icon-type') != -1?e[k].getAttribute('data-icon-type'):'';
    if (e[k].getAttribute('data-url') != -1)
      u = e[k].getAttribute('data-url');
    var promo = e[k].getAttribute('data-promo');
    if(promo && promo.length>0) {
      var key = 'promo=',
        promoStart = u.indexOf(key),
        promoEnd = u.indexOf('&', promoStart),
        promoLength = promoEnd > promoStart ? promoEnd - promoStart - key.length : u.length - promoStart - key.length;
      if(promoStart > 0) {
        promo = u.substr(promoStart + key.length, promoLength);
      }
    }
    var self_promo = (promo && promo.length > 0)? "setTimeout(function(){send_promo('"+promo+"');},2000);" : "";
    if (e[k].getAttribute('data-icon-size') != -1)
      var icon_size = e[k].getAttribute('data-icon-size');
    if (e[k].getAttribute('data-title') != -1)
      var t = e[k].getAttribute('data-title');
    if (e[k].getAttribute('data-image') != -1)
      var i = e[k].getAttribute('data-image');
    if (e[k].getAttribute('data-description') != -1)
      var d = e[k].getAttribute('data-description');
    if (e[k].getAttribute('data-path') != -1)
      var f = e[k].getAttribute('data-path');
    if (e[k].getAttribute('data-icons-file') != -1)
      var fn = e[k].getAttribute('data-icons-file');
    if (e[k].getAttribute('data-script-after')) {
      self_promo += "setTimeout(function(){"+e[k].getAttribute('data-script-after')+"},3000);";
    }

    if (!f) {
      function path(name) {
        var sc = document.getElementsByTagName('script')
          , sr = new RegExp('^(.*/|)(' + name + ')([#?]|$)');
        for (var p = 0, scL = sc.length; p < scL; p++) {
          var m = String(sc[p].src).match(sr);
          if (m) {
            if (m[1].match(/^((https?|file)\:\/{2,}|\w:[\/\\])/))
              return m[1];
            if (m[1].indexOf("/") == 0)
              return m[1];
            b = document.getElementsByTagName('base');
            if (b[0] && b[0].href)
              return b[0].href + m[1];
            else
              return document.location.pathname.match(/(.*[\/\\])/)[0] + m[1];
          }
        }
        return null;
      }
      f = path('share42.js');
    }
    if (!u)
      u = location.href;
    if (!t)
      t = document.title;
    if (!fn)
      fn = 'icons.png';
    function desc() {
      var meta = document.getElementsByTagName('meta');
      for (var m = 0; m < meta.length; m++) {
        if (meta[m].name.toLowerCase() == 'description') {
          return meta[m].content;
        }
      }
      return '';
    }
    if (!d)
      d = desc();
    u = encodeURIComponent(u);
    t = encodeURIComponent(t);
    t = t.replace(/\'/g, '%27');
    i = encodeURIComponent(i);
    var d_orig=d.replace(/\'/g, '%27');
    d = encodeURIComponent(d);
    d = d.replace(/\'/g, '%27');
    var fbQuery = 'u=' + u;
    if (i != 'null' && i != '')
      fbQuery = 's=100&p[url]=' + u + '&p[title]=' + t + '&p[summary]=' + d + '&p[images][0]=' + i;
    var vkImage = '';
    if (i != 'null' && i != '')
      vkImage = '&image=' + i;
    var s = new Array(
      '"#" data-count="fb" onclick="'+self_promo+'window.open(\'//www.facebook.com/sharer/sharer.php?u=' + u +'\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Поделиться в Facebook"',
      '"#" data-count="vk" onclick="'+self_promo+'window.open(\'//vk.com/share.php?url=' + u + '&title=' + t + vkImage + '&description=' + d + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Поделиться В Контакте"',
      '"#" data-count="odkl" onclick="'+self_promo+'window.open(\'//connect.ok.ru/offer?url=' + u + '&title=' + t + '&description='+ d + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Добавить в Одноклассники"',
      '"#" data-count="twi" onclick="'+self_promo+'window.open(\'//twitter.com/intent/tweet?text=' + t + '&url=' + u + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Добавить в Twitter"',
      '"#" data-count="gplus" onclick="'+self_promo+'window.open(\'//plus.google.com/share?url=' + u + '&title=' + t + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Поделиться в Google+"',
      '"#" data-count="mail" onclick="'+self_promo+'window.open(\'//connect.mail.ru/share?url=' + u + '&title=' + t + '&description=' + d + '&imageurl=' + i + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Поделиться в Моем Мире@Mail.Ru"',
      '"//www.livejournal.com/update.bml?event=' + u + '&subject=' + t + '" title="Опубликовать в LiveJournal"',
      '"#" data-count="pin" onclick="'+self_promo+'window.open(\'//pinterest.com/pin/create/button/?url=' + u + '&media=' + i + '&description=' + t + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=600, height=300, toolbar=0, status=0\');return false" title="Добавить в Pinterest"',
      '"" onclick="return fav(this);" title="Сохранить в избранное браузера"',
      '"#" onclick="print();return false" title="Распечатать"',
      '"#" data-count="telegram" onclick="window.open(\'//telegram.me/share/url?url=' + u +'&text=' + t + '\', \'telegram\', \'width=550,height=440,left=100,top=100\');return false" title="Поделиться в Telegram"',
      '"viber://forward?text='+ u +' - ' + t + '" data-count="viber" rel="nofollow noopener" title="Поделиться в Viber"',
      '"whatsapp://send?text='+ u +' - ' + t + '" data-count="whatsapp" rel="nofollow noopener" title="Поделиться в WhatsApp"'

    );

    var l = '';

    if(socials.length>1){
      for (q = 0; q < socials.length; q++){
        j=socials[q];
        l += '<a rel="nofollow" href=' + s[j] + ' target="_blank" '+getIcon(s[j],j,icon_type,f,fn,icon_size)+'></a>';
      }
    }else{
      for (j = 0; j < s.length; j++) {
        l += '<a rel="nofollow" href=' + s[j] + ' target="_blank" '+getIcon(s[j],j,icon_type,f,fn,icon_size)+'></a>';
      }
    }
    e[k].innerHTML = '<span class="share42_wrap">' + l + '</span>';
  }
  
//}, false);
}();

function getIcon(s,j,t,f,fn,size) {
  if(!size){
    size=32;
  }
  if(t=='css'){
    j=s.indexOf('data-count="')+12;
    var l=s.indexOf('"',j)-j;
    var l2=s.indexOf('.',j)-j;
    l=l>l2 && l2>0 ?l2:l;
    //var icon='class="soc-icon icon-'+s.substr(j,l)+'"';
    var icon='class="soc-icon-sd icon-sd-'+s.substr(j,l)+'"';
  }else if(t=='svg'){
    var svg=[
      '<svg width="200" height="200" viewBox="0 0 200 200"><path transform="matrix(1,0,0,-1,111.94,177.08)" d="M0 0 0 70.3 23.6 70.3 27.1 97.7 0 97.7 0 115.2C0 123.2 2.2 128.6 13.6 128.6L28.1 128.6 28.1 153.1C25.6 153.4 17 154.2 6.9 154.2-14 154.2-28.3 141.4-28.3 117.9L-28.3 97.7-52 97.7-52 70.3-28.3 70.3-28.3 0 0 0Z"/></svg>',
      '<svg width="200" height="200" viewBox="0 0 200 200"><path transform="matrix(1,0,0,-1,98.274,145.52)" d="M0 0 9.6 0C9.6 0 12.5 0.3 14 1.9 15.4 3.4 15.3 6.1 15.3 6.1 15.3 6.1 15.1 19 21.1 21 27 22.8 34.6 8.5 42.7 3 48.7-1.2 53.3-0.3 53.3-0.3L74.8 0C74.8 0 86.1 0.7 80.7 9.5 80.3 10.3 77.6 16.1 64.8 28 51.3 40.5 53.1 38.5 69.3 60.1 79.2 73.3 83.2 81.4 81.9 84.8 80.8 88.1 73.5 87.2 73.5 87.2L49.3 87.1C49.3 87.1 47.5 87.3 46.2 86.5 44.9 85.7 44 83.9 44 83.9 44 83.9 40.2 73.7 35.1 65.1 24.3 46.8 20 45.8 18.3 46.9 14.2 49.6 15.2 57.6 15.2 63.2 15.2 81 17.9 88.4 9.9 90.3 7.3 90.9 5.4 91.3-1.4 91.4-10 91.5-17.3 91.4-21.4 89.3-24.2 88-26.3 85-25 84.8-23.4 84.6-19.8 83.8-17.9 81.2-15.4 77.9-15.5 70.3-15.5 70.3-15.5 70.3-14.1 49.4-18.8 46.8-22.1 45-26.5 48.7-36.1 65.3-41.1 73.8-44.8 83.2-44.8 83.2-44.8 83.2-45.5 84.9-46.8 85.9-48.3 87-50.5 87.4-50.5 87.4L-73.5 87.2C-73.5 87.2-76.9 87.1-78.2 85.6-79.3 84.3-78.3 81.5-78.3 81.5-78.3 81.5-60.3 39.4-39.9 18.2-21.2-1.3 0 0 0 0"/></svg>',
      '<svg version="1.1" width="200" height="200" viewBox="0 0 200 200"><g transform="translate(106.88,183.61)"><g transform="translate(-6.8805,-100)" style="stroke:none;stroke-opacity:1"><path d="M 0,0 C 8.146,0 14.769,-6.625 14.769,-14.77 14.769,-22.907 8.146,-29.533 0,-29.533 -8.136,-29.533 -14.769,-22.907 -14.769,-14.77 -14.769,-6.625 -8.136,0 0,0 M 0,-50.429 C 19.676,-50.429 35.67,-34.435 35.67,-14.77 35.67,4.903 19.676,20.903 0,20.903 -19.671,20.903 -35.669,4.903 -35.669,-14.77 -35.669,-34.435 -19.671,-50.429 0,-50.429" style="fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-opacity:1"/></g><g transform="matrix(1,0,0,-1,7.5516,-54.577)" style="stroke:none;stroke-opacity:1"><path d="M 0,0 C 7.262,1.655 14.264,4.526 20.714,8.578 25.595,11.654 27.066,18.108 23.99,22.989 20.917,27.881 14.469,29.352 9.579,26.275 -5.032,17.086 -23.843,17.092 -38.446,26.275 -43.336,29.352 -49.784,27.881 -52.852,22.989 -55.928,18.104 -54.461,11.654 -49.58,8.578 -43.132,4.531 -36.128,1.655 -28.867,0 L -48.809,-19.941 C -52.886,-24.022 -52.886,-30.639 -48.805,-34.72 -46.762,-36.758 -44.09,-37.779 -41.418,-37.779 -38.742,-37.779 -36.065,-36.758 -34.023,-34.72 L -14.436,-15.123 5.169,-34.72 C 9.246,-38.801 15.862,-38.801 19.943,-34.72 24.028,-30.639 24.028,-24.019 19.943,-19.941 L 0,0 Z" style="fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-opacity:1"/></g></g></svg>',
      '<svg width="200" height="200" viewBox="0 0 200 200"><path transform="matrix(1,0,0,-1,169.76,56.727)" d="M0 0C-5.1-2.3-10.6-3.8-16.4-4.5-10.5-1-6 4.6-3.9 11.3-9.4 8-15.5 5.7-22 4.4-27.3 9.9-34.7 13.4-42.9 13.4-58.7 13.4-71.6 0.6-71.6-15.2-71.6-17.4-71.3-19.6-70.8-21.7-94.6-20.5-115.7-9.1-129.8 8.2-132.3 4-133.7-1-133.7-6.2-133.7-16.1-128.6-24.9-120.9-30-125.6-29.9-130.1-28.6-133.9-26.5-133.9-26.6-133.9-26.7-133.9-26.8-133.9-40.7-124-52.3-111-54.9-113.4-55.5-115.9-55.9-118.5-55.9-120.3-55.9-122.1-55.7-123.9-55.4-120.2-66.7-109.7-75-97.1-75.3-106.9-82.9-119.3-87.5-132.7-87.5-135-87.5-137.3-87.4-139.5-87.1-126.8-95.2-111.8-100-95.6-100-43-100-14.2-56.3-14.2-18.5-14.2-17.3-14.2-16-14.3-14.8-8.7-10.8-3.8-5.7 0 0"/></svg>',
      '<svg width="200" height="200" viewBox="0 0 200 200"><g transform="matrix(1 0 0 -1 72.381 90.172)"><path d="M87.2 0 87.2 17.1 75 17.1 75 0 57.9 0 57.9-12.2 75-12.2 75-29.3 87.2-29.3 87.2-12.2 104.3-12.2 104.3 0 87.2 0Z"/><path d="M0 0 0-19.6 26.2-19.6C25.4-23.7 23.8-27.5 20.8-30.6 10.3-42.1-9.3-42-20.5-30.4-31.7-18.9-31.6-0.3-20.2 11.1-9.4 21.9 8 22.4 18.6 12.1L18.5 12.1 32.8 26.4C13.7 43.8-15.8 43.5-34.5 25.1-53.8 6.1-54-25-34.9-44.3-15.9-63.5 17.1-63.7 34.9-44.6 45.6-33 48.7-16.4 46.2 0L0 0Z"/></g></svg>',
      '<svg width="200" height="200" viewBox="0 0 200 200"><path transform="matrix(1,0,0,-1,97.676,62.411)" d="M0 0C10.2 0 19.9-4.5 26.9-11.6L26.9-11.6C26.9-8.2 29.2-5.7 32.4-5.7L33.2-5.7C38.2-5.7 39.2-10.4 39.2-11.9L39.2-64.8C38.9-68.2 42.8-70 45-67.8 53.5-59.1 63.6-22.9 39.7-2 17.4 17.6-12.5 14.3-28.5 3.4-45.4-8.3-56.2-34.1-45.7-58.4-34.2-84.9-1.4-92.8 18.1-84.9 28-80.9 32.5-94.3 22.3-98.6 6.8-105.2-36.4-104.5-56.5-69.6-70.1-46.1-69.4-4.6-33.3 16.9-5.7 33.3 30.7 28.8 52.7 5.8 75.6-18.2 74.3-63 51.9-80.5 41.8-88.4 26.7-80.7 26.8-69.2L26.7-65.4C19.6-72.4 10.2-76.5 0-76.5-20.2-76.5-38-58.7-38-38.4-38-18-20.2 0 0 0M25.5-37C24.7-22.2 13.7-13.3 0.4-13.3L-0.1-13.3C-15.4-13.3-23.9-25.3-23.9-39-23.9-54.3-13.6-64-0.1-64 14.9-64 24.8-53 25.5-40L25.5-37Z"/></svg>',
      '<svg width="200" height="200" viewBox="0 0 200 200"><g transform="matrix(0.42623 0 0 0.42623 34.999 35)"><path d="M160.7 19.5c-18.9 0-37.3 3.7-54.7 10.9L76.4 0.7c-0.8-0.8-2.1-1-3.1-0.4C44.4 18.2 19.8 42.9 1.9 71.7c-0.6 1-0.5 2.3 0.4 3.1l28.4 28.4c-8.5 18.6-12.8 38.5-12.8 59.1 0 78.7 64 142.8 142.8 142.8 78.7 0 142.8-64 142.8-142.8C303.4 83.5 239.4 19.5 160.7 19.5zM217.2 148.7l9.9 42.1 9.5 44.4 -44.3-9.5 -42.1-9.9L36.7 102.1c14.3-29.3 38.3-52.6 68.1-65.8L217.2 148.7z"/><path d="M221.8 187.4l-7.5-33c-25.9 11.9-46.4 32.4-58.3 58.3l33 7.5C196 206.2 207.7 194.4 221.8 187.4z"/></g></svg>',
      '',//pin
      '',//fav
      '',//print
      '<svg width="200" height="200" viewBox="0 0 200 200"><path transform="matrix(1,0,0,-1,71.264,106.93)" d="M0 0 68.6 43.1C72 45.3 73.1 42.8 71.6 41.1L14.6-10.2 11.7-35.8 0 0ZM87.1 62.9-33.4 17.2C-40 15.3-39.8 8.8-34.9 7.3L-4.7-2.2 6.8-37.6C8.2-41.5 9.4-42.9 11.8-43 14.3-43 15.3-42.1 17.9-39.8 20.9-36.9 25.6-32.3 33-25.2L64.4-48.4C70.2-51.6 74.3-49.9 75.8-43L95.5 54.4C97.6 62.9 92.6 65.4 87.1 62.9"/></svg>',
      '<svg width="200" height="200" viewBox="0 0 200 200"><path transform="matrix(1,0,0,-1,135.33,119.85)" d="M0 0C-2.4-5.4-6.5-9-12.2-10.6-14.3-11.2-16.3-10.7-18.2-9.9-44.4 1.2-63.3 19.6-74 46.2-74.8 48.1-75.3 50.1-75.2 51.9-75.2 58.7-69.2 65-62.6 65.4-60.8 65.5-59.2 64.9-57.9 63.7-53.3 59.3-49.6 54.3-46.9 48.6-45.4 45.5-46 43.3-48.7 41.1-49.1 40.7-49.5 40.4-50 40.1-53.5 37.5-54.3 34.9-52.6 30.8-49.8 24.2-45.4 19-39.3 15.1-37 13.6-34.7 12.2-32 11.5-29.6 10.8-27.7 11.5-26.1 13.4-25.9 13.6-25.8 13.9-25.6 14.1-22.3 18.8-18.6 19.6-13.7 16.5-9.6 13.9-5.6 11-1.8 7.8 0.7 5.6 1.3 3 0 0M-18.2 36.7C-18.3 35.9-18.3 35.4-18.4 34.9-18.6 34-19.2 33.4-20.2 33.4-21.3 33.4-21.9 34-22.2 34.9-22.3 35.5-22.4 36.2-22.5 36.9-23.2 40.3-25.2 42.6-28.6 43.6-29.1 43.7-29.5 43.7-29.9 43.8-31 44.1-32.4 44.2-32.4 45.8-32.5 47.1-31.5 47.9-29.6 48-28.4 48.1-26.5 47.5-25.4 46.9-20.9 44.7-18.7 41.6-18.2 36.7M-25.5 51.2C-28 52.1-30.5 52.8-33.2 53.2-34.5 53.4-35.4 54.1-35.1 55.6-34.9 57-34 57.5-32.6 57.4-24 56.6-17.3 53.4-12.6 46-10.5 42.5-9.2 37.5-9.4 33.8-9.5 31.2-9.9 30.5-11.4 30.5-13.6 30.6-13.3 32.4-13.5 33.7-13.7 35.7-14.2 37.7-14.7 39.7-16.3 45.4-19.9 49.3-25.5 51.2M-38 64.4C-37.9 65.9-37 66.5-35.5 66.4-23.2 65.8-13.9 62.2-6.7 52.5-2.5 46.9-0.2 39.2 0 32.2 0 31.1 0 30 0 29-0.1 27.8-0.6 26.9-1.9 26.9-3.2 26.9-3.9 27.6-4 29-4.3 34.2-5.3 39.3-7.3 44.1-11.2 53.5-18.6 58.6-28.1 61.1-30.7 61.7-33.2 62.2-35.8 62.5-37 62.5-38 62.8-38 64.4M11.5 74.1C6.6 78.3 0.9 80.8-5.3 82.4-20.8 86.5-36.5 87.5-52.4 85.3-60.5 84.2-68.3 82.1-75.4 78.1-83.8 73.4-89.6 66.6-92.2 57.1-94 50.4-94.9 43.6-95.2 36.6-95.7 26.4-95.4 16.3-92.8 6.3-89.8-5.3-83.2-13.8-71.9-18.3-70.7-18.8-69.5-19.5-68.3-20-67.2-20.4-66.8-21.2-66.8-22.4-66.9-30.4-66.8-38.4-66.8-46.7-63.9-43.9-61.8-41.8-60.3-40.1-55.9-35.1-51.7-30.9-47.1-26.1-44.7-23.7-45.7-23.8-42.1-23.8-37.8-23.9-31-24.1-26.8-23.8-18.6-23.1-10.6-22.1-2.7-19.7 7.2-16.7 15.2-11.4 19.2-1.3 20.3 1.3 21.4 4 22 6.8 25.9 22.9 25.4 38.9 22.2 55 20.6 62.4 17.5 69 11.5 74.1"/></svg>',
      '<svg width="200" height="200" viewBox="0 0 200 200"><path transform="matrix(1,0,0,-1,130.84,112.7)" d="M0 0C-1.6 0.9-9.4 5.1-10.8 5.7-12.3 6.3-13.4 6.6-14.5 5-15.6 3.4-18.9-0.1-19.9-1.1-20.8-2.2-21.8-2.3-23.4-1.4-25-0.5-30.1 1.4-36.1 7.1-40.7 11.5-43.7 17-44.6 18.6-45.5 20.3-44.6 21.1-43.8 21.9-43 22.6-42.1 23.7-41.3 24.6-40.4 25.5-40.1 26.2-39.5 27.2-39 28.3-39.2 29.3-39.6 30.1-39.9 30.9-42.9 39-44.1 42.3-45.3 45.5-46.7 45-47.6 45.1-48.6 45.1-49.6 45.3-50.7 45.3-51.8 45.4-53.6 45-55.1 43.5-56.6 41.9-61 38.2-61.3 30.2-61.6 22.3-56.1 14.4-55.3 13.3-54.5 12.2-44.8-5.1-28.6-12.1-12.4-19.2-12.4-17.1-9.4-16.9-6.4-16.8 0.3-13.4 1.8-9.6 3.3-5.9 3.4-2.7 3-2 2.6-1.3 1.6-0.9 0 0M-29.7-38.3C-40.4-38.3-50.3-35.1-58.6-29.6L-78.9-36.1-72.3-16.5C-78.6-7.8-82.3 2.8-82.3 14.4-82.3 43.4-58.7 67.1-29.7 67.1-0.6 67.1 23 43.4 23 14.4 23-14.7-0.6-38.3-29.7-38.3M-29.7 77.6C-64.6 77.6-92.9 49.3-92.9 14.4-92.9 2.4-89.6-8.8-83.9-18.3L-95.3-52.2-60.2-41C-51.2-46-40.8-48.9-29.7-48.9 5.3-48.9 33.6-20.6 33.6 14.4 33.6 49.3 5.3 77.6-29.7 77.6"/></svg>',
    ];
    var icon=svg[j];
    var css=' style="width:'+size+'px;height:'+size+'px" ';
    icon='<svg class="soc-icon-sd icon-sd-svg"'+css+icon.substring(4);
    icon='>'+icon.substring(0, icon.length - 1);
  }else{
    icon='style="display:inline-block;vertical-align:bottom;width:'+size+'px;height:'+size+'px;margin:0 6px 6px 0;padding:0;outline:none;background:url(' + f + fn + ') -' + size * j + 'px 0 no-repeat; background-size: cover;"'
  }
  return icon;
}

function fav(a) {
  var title = document.title;
  var url = document.location;
  try {
    window.external.AddFavorite(url, title);
  } catch (e) {
    try {
      window.sidebar.addPanel(title, url, '');
    } catch (e) {
      if (typeof (opera) == 'object' || window.sidebar) {
        a.rel = 'sidebar';
        a.title = title;
        a.url = url;
        a.href = url;
        return true;
      } else {
        alert('Нажмите Ctrl-D, чтобы добавить страницу в закладки');
      }
    }
  }
  return false;
}

function send_promo(promo){
  $.ajax({
    method: "post",
    url: "/account/promo",
    dataType: 'json',
    data: {promo: promo},
    success: function(data) {
      if (data.title != null && data.message != null) {
        on_promo=$('.on_promo');
        if(on_promo.length==0 || !on_promo.is(':visible')) {
          setTimeout(function(){
              notification.notifi({
                  type: 'success',
                  title: data.title,
                  message: data.message
              });
              on_promo.show();
          }, 2000);
        }
      }
    }
  });
}

$('.scroll_box-text').on('click', function(){

   $(this).closest('.scroll_box').find('.scroll_box-item').removeClass('scroll_box-item-low');

});
var placeholder = (function(){
  function onBlur(){
    var inputValue = $(this).val();
    if ( inputValue == "" ) {
      $(this).closest('.form-group').removeClass('focused');
    }
  }

  function onFocus(){
    $(this).closest('.form-group').addClass('focused');
  }


  function run(par) {
    var els;
    if(!par)
      els=$('.form-group [placeholder]');
    else
      els=$(par).find('.form-group [placeholder]');

    els.focus(onFocus);
    els.blur(onBlur);

    for(var i = 0; i<els.length;i++){
      var el=els.eq(i);
      var text = el.attr('placeholder');
      el.attr('placeholder','');
      if(text.length<2)continue;
      //if(el.closest('.form-group').length==0)return;

      var inputValue = el.val();
      var el_id = el.attr('id');
      if(!el_id){
        el_id='el_forms_'+Math.round(Math.random()*10000);
        el.attr('id',el_id)
      }

      var div = $('<label/>',{
        'class':'placeholder',
        'text': text,
        'for':el_id
      });
      el.before(div);

      onFocus.bind(el)()
      onBlur.bind(el)()
    }
  }

  run();
  return run;
})();
var notification = (function () {
  var conteiner;
  var mouseOver = 0;
  var timerClearAll = null;
  var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
  var time = 10000;

  var notification_box = false;
  var is_init = false;
  var confirm_opt = {
    // title: lg('deleting'),
    // question: lg('are_you_sure_to_delete'),
    // buttonYes: lg('yes'),
    // buttonNo: lg('no'),
    callbackYes: false,
    callbackNo: false,
    obj: false,
    buttonTag: 'div',
    buttonYesDop: '',
    buttonNoDop: ''
  };
  var alert_opt = {
    title: "",
    question: 'message',
    // buttonYes: lg('yes'),
    callbackYes: false,
    buttonTag: 'div',
    obj: false
  };

  function testIphone() {
    if (!/(iPhone|iPad|iPod).*(OS 11)/.test(navigator.userAgent)) return;
    notification_box.css('position', 'absolute');
    notification_box.css('top', $(document).scrollTop());
  }

  function init() {
    is_init = true;
    notification_box = $('.notification_box');
    if (notification_box.length > 0)return;

    $('body').append("<div class='notification_box'></div>");
    notification_box = $('.notification_box');

    notification_box.on('click', '.notify_control', closeModal);
    notification_box.on('click', '.notify_close', closeModal);
    notification_box.on('click', closeModalFon);
  }

  function closeModal() {
    $('html').removeClass('show_notifi');
    $('.notification_box .notify_content').html('');
  }

  function closeModalFon(e) {
    var target = e.target || e.srcElement;
    if (target.className == "notification_box") {
      closeModal();
    }
  }

  var _setUpListeners = function () {
    $('body').on('click', '.notification_close', _closePopup);
    $('body').on('mouseenter', '.notification_container', _onEnter);
    $('body').on('mouseleave', '.notification_container', _onLeave);
  };

  var _onEnter = function (event) {
    if (event)event.preventDefault();
    if (timerClearAll != null) {
      clearTimeout(timerClearAll);
      timerClearAll = null;
    }
    conteiner.find('.notification_item').each(function (i) {
      var option = $(this).data('option');
      if (option.timer) {
        clearTimeout(option.timer);
      }
    });
    mouseOver = 1;
  };

  var _onLeave = function () {
    conteiner.find('.notification_item').each(function (i) {
      $this = $(this);
      var option = $this.data('option');
      if (option.time > 0) {
        option.timer = setTimeout(_closePopup.bind(option.close), option.time - 1500 + 100 * i);
        $this.data('option', option)
      }
    });
    mouseOver = 0;
  };

  var _closePopup = function (event) {
    if (event)event.preventDefault();

    var $this = $(this).parent();
    $this.on(animationEnd, function () {
      $(this).remove();
    });
    $this.addClass('notification_hide')
  };

  function alert(data) {
    if (!data)data = {};
    alert_opt = objects(alert_opt, {
        buttonYes: lg('yes')
    });
    data = objects(alert_opt, data);

    if (!is_init)init();
    testIphone();

    notyfy_class = 'notify_box ';
    if (data.notyfy_class)notyfy_class += data.notyfy_class;

    box_html = '<div class="' + notyfy_class + '">';
    box_html += '<div class="notify_title">';
    box_html += data.title;
    box_html += '<span class="notify_close"></span>';
    box_html += '</div>';

    box_html += '<div class="notify_content">';
    box_html += data.question;
    box_html += '</div>';

    if (data.buttonYes || data.buttonNo) {
      box_html += '<div class="notify_control">';
      if (data.buttonYes)box_html += '<' + data.buttonTag + ' class="notify_btn_yes" ' + data.buttonYesDop + '>' + data.buttonYes + '</' + data.buttonTag + '>';
      if (data.buttonNo)box_html += '<' + data.buttonTag + ' class="notify_btn_no" ' + data.buttonNoDop + '>' + data.buttonNo + '</' + data.buttonTag + '>';
      box_html += '</div>';
    }

    box_html += '</div>';
    notification_box.html(box_html);


    setTimeout(function () {
      $('html').addClass('show_notifi');
    }, 100)
  }

  function confirm(data) {
    if (!data)data = {};
    confirm_opt = objects(confirm_opt, {
        title: lg('deleting'),
        question: lg('are_you_sure_to_delete'),
        buttonYes: lg('yes'),
        buttonNo: lg('no')
    });
    data = objects(confirm_opt, data);
    if (typeof(data.callbackYes) == 'string') {
      var code = 'data.callbackYes = function(){'+data.callbackYes+'}';
      eval(code);
    }

    if (!is_init)init();
    testIphone();
    //box_html='<div class="notify_box">';

    notyfy_class = 'notify_box ';
    if (data.notyfy_class)notyfy_class += data.notyfy_class;

    box_html = '<div class="' + notyfy_class + '">';

    box_html += '<div class="notify_title">';
    box_html += data.title;
    box_html += '<span class="notify_close"></span>';
    box_html += '</div>';

    box_html += '<div class="notify_content">';
    box_html += data.question;
    box_html += '</div>';

    if (data.buttonYes || data.buttonNo) {
      box_html += '<div class="notify_control">';
      if (data.buttonYes)box_html += '<div class="notify_btn_yes">' + data.buttonYes + '</div>';
      if (data.buttonNo)box_html += '<div class="notify_btn_no">' + data.buttonNo + '</div>';
      box_html += '</div>';
    }

    box_html += '</div>';
    notification_box.html(box_html);

    if (data.callbackYes != false) {
      notification_box.find('.notify_btn_yes').on('click', data.callbackYes.bind(data.obj));
    }
    if (data.callbackNo != false) {
      notification_box.find('.notify_btn_no').on('click', data.callbackNo.bind(data.obj));
    }

    setTimeout(function () {
      $('html').addClass('show_notifi');
    }, 100)

  }

  function notifi(data) {
    if (!data)data = {};
    var option = {time: (data.time || data.time === 0) ? data.time : time};
    if (!conteiner) {
      conteiner = $('<ul/>', {
        'class': 'notification_container'
      });

      $('body').append(conteiner);
      _setUpListeners();
    }

    var li = $('<li/>', {
      class: 'notification_item'
    });

    if (data.type) {
      li.addClass('notification_item-' + data.type);
    }

    var close = $('<span/>', {
      class: 'notification_close'
    });
    option.close = close;
    li.append(close);

    var content = $('<div/>', {
      class: "notification_content"
    });

    if (data.title && data.title.length > 0) {
      var title = $('<h5/>', {
        class: "notification_title"
      });
      title.html(data.title);
      content.append(title);
    }

    var text = $('<div/>', {
      class: "notification_text"
    });
    text.html(data.message);

    if (data.img && data.img.length > 0) {
      var img = $('<div/>', {
        class: "notification_img"
      });
      img.css('background-image', 'url(' + data.img + ')');
      var wrap = $('<div/>', {
        class: "wrap"
      });

      wrap.append(img);
      wrap.append(text);
      content.append(wrap);
    } else {
      content.append(text);
    }
    li.append(content);

    //
    // if(data.title && data.title.length>0) {
    //   var title = $('<p/>', {
    //     class: "notification_title"
    //   });
    //   title.html(data.title);
    //   li.append(title);
    // }
    //
    // if(data.img && data.img.length>0) {
    //   var img = $('<div/>', {
    //     class: "notification_img"
    //   });
    //   img.css('background-image','url('+data.img+')');
    //   li.append(img);
    // }
    //
    // var content = $('<div/>',{
    //   class:"notification_content"
    // });
    // content.html(data.message);
    //
    // li.append(content);
    //
    conteiner.append(li);

    if (option.time > 0) {
      option.timer = setTimeout(_closePopup.bind(close), option.time);
    }
    li.data('option', option)
  }

  return {
    alert: alert,
    confirm: confirm,
    notifi: notifi
  };

})();


$('[ref=popup]').on('click', function (e) {
  e.preventDefault();
  $this = $(this);
  el = $($this.attr('href'));
  data = el.data();

  data.question = el.html();
  notification.alert(data);
});

$('[ref=confirm]').on('click', function (e) {
  e.preventDefault();
  $this = $(this);
  el = $($this.attr('href'));
  data = el.data();
  data.question = el.html();
  notification.confirm(data);
});


$('.disabled').on('click', function (e) {
  e.preventDefault();
  $this = $(this);
  data = $this.data();
  if (data['button_yes']) {
    data['buttonYes'] = data['button_yes'];
  }
  if (data['button_yes'] === false) {
    data['buttonYes'] = false;
  }

  notification.alert(data);
});
(function () {
  $('body').on('click', '.modals_open', function (e) {
    e.preventDefault();

    $('.header').removeClass('header_open-menu');

    //при открытии формы регистрации закрыть, если отрыто - попап использования купона без регистрации
    var popup = $("a[href='#showpromocode-noregister']").data('popup');
    if (popup) {
      popup.close();
    } else {
      popup = $('div.popup_cont, div.popup_back');
      if (popup) {
        popup.hide();
      }
    }

    var href = this.href.split('#');
    href = href[href.length - 1];
    var notyClass = $(this).data('notyclass');
    var data = {
      buttonYes: false,
      notyfy_class: "loading " + (href.indexOf('video') === 0 ? 'modals-full_screen' : 'notify_white') + ' ' + notyClass,
      question: ''
    };
    notification.alert(data);

    $.get('/' + href, function (data) {
      $('.notify_box').removeClass('loading');
      $('.notify_box .notify_content').html(data.html);
      ajaxForm($('.notify_box .notify_content'));
    }, 'json');

    //console.log(this);
    return false;
  })
}());

$('.footer-menu-title').on('click', function (e) {
  $this = $(this);
  if ($this.hasClass('footer-menu-title_open')) {
    $this.removeClass('footer-menu-title_open')
  } else {
    $('.footer-menu-title_open').removeClass('footer-menu-title_open');
    $this.addClass('footer-menu-title_open');
  }

});

$(function () {
  function starNomination(index) {
    var stars = $(".rating-wrapper .rating-star");
    stars.addClass("rating-star-open");
    for (var i = 0; i < index; i++) {
      stars.eq(i).removeClass("rating-star-open");
    }
  }

  $(document).on("mouseover", ".rating-wrapper .rating-star", function (e) {
    starNomination($(this).index() + 1);
  }).on("mouseleave", ".rating-wrapper", function (e) {
    starNomination($(".notify_content input[name=\"Reviews[rating]\"]").val());
  }).on("click", ".rating-wrapper .rating-star", function (e) {
    starNomination($(this).index() + 1);

    $(".notify_content input[name=\"Reviews[rating]\"]").val($(this).index() + 1);
  });
});

//избранное
$(document).ready(function () {
  $(".favorite-link").on('click', function (e) {
    e.preventDefault();

    var self = $(this);
    var type = self.attr("data-state"),
      affiliate_id = self.attr("data-affiliate-id");

    if (!affiliate_id) {
      notification.notifi({
        title: lg("registration_is_required"),
        message: lg("add_to_favorite_may_only_registered_user"),
        type: 'err'
      });
      return false;

    }

    if (self.hasClass('disabled')) {
      return null;
    }
    self.addClass('disabled');

    /*if(type == "add") {
     self.find(".item_icon").removeClass("muted");
     }*/

    $.post("/account/favorites", {
      "type": type,
      "affiliate_id": affiliate_id
    }, function (data) {
      self.removeClass('disabled');
      if (data.error) {
        self.find('svg').removeClass("spin");
        notification.notifi({message: data.error, type: 'err', 'title': (data.title ? data.title : false)});
        return;
      }

      notification.notifi({
        message: data.msg,
        type: 'success',
        'title': (data.title ? data.title : false)
      });

      self.attr({
        "data-state": data["data-state"],
        "data-original-title": data['data-original-title']
      });

      if (type == "add") {
        self.find("svg").removeClass("spin in_fav_off").addClass("in_fav_on");
        self.data('original-title', lg("favorites_shop_remove"));
      } else if (type == "delete") {
        self.find("svg").removeClass("spin in_fav_on").addClass("in_fav_off");
        self.data('original-title', lg("favorites_shop_add"));
      }

    }, 'json').fail(function () {
      self.removeClass('disabled');
      notification.notifi({
        message: lg("there_is_technical_works_now"),
        type: 'err'
      });

      if (type == "add") {
        self.find("svg").removeClass("spin in_fav_off").addClass("in_fav_on");
        self.data('original-title', lg("favorites_shop_remove"));
      } else if (type == "delete") {
        self.find("svg").removeClass("spin in_fav_on").addClass("in_fav_off");
        self.data('original-title', lg("favorites_shop_add"));
      }

    })
  });
});

$(document).ready(function () {
  $('.scroll_to').click(function (e) { // ловим клик по ссылке с классом go_to
    var scroll_el = $(this).attr('href'); // возьмем содержимое атрибута href, должен быть селектором, т.е. например начинаться с # или .
    scroll_el = $(scroll_el);
    if (scroll_el.length != 0) { // проверим существование элемента чтобы избежать ошибки
      e.preventDefault();
      $('html, body').animate({scrollTop: scroll_el.offset().top - $('#header>*').eq(0).height() - 50}, 500); // анимируем скроолинг к элементу scroll_el
      if (scroll_el.hasClass('accordion') && !scroll_el.hasClass('open')) {
        scroll_el.find('.accordion-control').click();
      }
    }
    return false; // выключаем стандартное действие
  });
});

$(document).ready(function () {
  $("body").on('click', '.set_clipboard', function (e) {
    e.preventDefault();
    var $this = $(this);
    copyToClipboard($this.data('clipboard'), $this.data('clipboard-notify'));
  });

  function copyToClipboard(code, msg) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(code).select();
    document.execCommand("copy");
    $temp.remove();

    if (!msg) {
      msg = lg("data_copied_to_clipboard");
    }
    notification.notifi({'type': 'info', 'message': msg, 'title': lg('success')})
  }

  $("body").on('click', "input.link", function () {	// получение фокуса текстовым полем-ссылкой
    $(this).select();
  });
});

//скачивание картинок
(function () {
  function img_load_finish() {
    var data = this;
    var img = data.img;
    img.wrap('<div class="download"></div>');
    var wrap = img.parent();
    $('.download_test').append(data.el);
    size = data.el.width() + "x" + data.el.height();

    w=data.el.width()*0.8;
    img
      .height('auto')
      //.width(w)
      .css('max-width','99%');


    data.el.remove();
    wrap.append('<span>' + size + '</span> <a href="' + data.src + '" download>'+lg("download")+'</a>');
  }

  var imgs = $('.downloads_img img');
  if(imgs.length==0)return;

  $('body').append('<div class=download_test></div>');
  for (var i = 0; i < imgs.length; i++) {
    var img = imgs.eq(i);
    var src = img.attr('src');
    image = $('<img/>', {
      src: src
    });
    data = {
      src: src,
      img: img,
      el: image
    };
    image.on('load', img_load_finish.bind(data))
  }
})();

//что б ифреймы и картинки не вылазили
$( document ).ready(function() {
  /*m_w = $('.text-content').width()
   if (m_w < 50)m_w = screen.width - 40*/
  var mw=screen.width-40;

  function optimase(el){
    var parent = el.parent();
    if(parent.length==0 || parent[0].tagName=="A"){
      return;
    }
    if(el.hasClass('no_optomize'))return;

    m_w = parent.width()-30;
    var w=el.width();

    //без этого плющит банеры в акардионе
    if(w<3 || m_w<3){
      el
        .height('auto')
        .css('max-width','99%');
      return;
    }

    el.width('auto');
    if(el[0].tagName=="IMG" && w>el.width())w=el.width();

    if (mw>50 && m_w > mw)m_w = mw;
    if (w>m_w) {
      if(el[0].tagName=="IFRAME"){
        k = w / m_w;
        el.height(el.height() / k);
      }
      el.width(m_w)
    }else{
      el.width(w);
    }
  }

  function img_load_finish(){
    var el=$(this);
    optimase(el);
  }

  var p = $('.content-wrap img,.content-wrap iframe');
  $('.content-wrap img:not(.no_optomize)').height('auto');
  //$('.container img').width('auto');
  for (i = 0; i < p.length; i++) {
    el = p.eq(i);
    if(el[0].tagName=="IFRAME") {
      optimase(el);
    }else{
      var src=el.attr('src');
      image = $('<img/>', {
        src: src
      });
      image.on('load', img_load_finish.bind(el));
    }
  }
});


//Проверка биты картинок.
// !!!!!!
// Нужно проверить. Вызывало глюки при авторзации через ФБ на сафари
// !!!!!!
$( document ).ready(function() {
  function img_load_finish(){
    var data=this;
    if(data.tagName){
      data=$(data).data('data');
    }
    var img=data.img;
    //var tn=img[0].tagName;
    //if (tn!='IMG'||tn!='DIV'||tn!='SPAN')return;
    if(data.type==0) {
      img.attr('src', data.src);
    }else{
      img.css('background-image', 'url('+data.src+')');
      img.removeClass('no_ava');
    }
  }

  function testImg(imgs,no_img){
    if(!imgs || imgs.length==0)return;

    if(!no_img)no_img='/images/template-logo.jpg';

    for (var i=0;i<imgs.length;i++){
      var img=imgs.eq(i);
      if(img.hasClass('no_ava')){
        continue;
      }

      var data={
        img:img
      };
      var src;
      if(img[0].tagName=="IMG"){
        data.type=0;
        src=img.attr('src');
        img.attr('src',no_img);
      }else{
        data.type=1;
        src=img.css('background-image');
        if(!src)continue;
        src=src.replace('url("','');
        src=src.replace('")','');
        //в сффари в мак ос без ковычек. везде с кавычками
        src=src.replace('url(','');
        src=src.replace(')','');
        img.addClass('no_ava');
        img.css('background-image','url('+no_img+')');
      }
      data.src=src;
      var image=$('<img/>',{
        src:src
      }).on('load',img_load_finish.bind(data));
      image.data('data',data);
    }
  }

  //тест лого магазина
  var imgs=$('section:not(.navigation)');
  imgs=imgs.find('.logo img');
  testImg(imgs,'/images/template-logo.jpg');

  //тест аватарок в коментариях
  imgs=$('.comment-photo,.scroll_box-avatar');
  testImg(imgs,'/images/no_ava_square.png');
});

//если открыто как дочернее
(function () {
  if (!window.opener)return;
  try {
    href = window.opener.location.href;
    if (
      href.indexOf('account/offline') > 0
    ) {
      window.print()
    }

    if (document.referrer.indexOf('secretdiscounter') < 0)return;

    if (
      href.indexOf('socials') > 0 ||
      href.indexOf('login') > 0 ||
      href.indexOf('admin') > 0 ||
      href.indexOf('account') > 0
    ) {
      return;
    }

    if (href.indexOf('store') > 0 || href.indexOf('coupon') > 0 || href.indexOf('settings') > 0) {
      window.opener.location.reload();
    } else {
      window.opener.location.href = location.href;
    }
    window.close();
  } catch (err) {

  }
})();

$(document).ready(function () {
  $('input[type=file]').on('change', function (evt) {
    var file = evt.target.files; // FileList object
    var f = file[0];
    // Only process image files.
    if (!f.type.match('image.*')) {
      return false;
    }
    var reader = new FileReader();

    data = {
      'el': this,
      'f': f
    };
    reader.onload = (function (data) {
      return function (e) {
        img = $('[for="' + data.el.name + '"]');
        if (img.length > 0) {
          img.attr('src', e.target.result)
        }
      };
    })(data);
    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
  });

  $('.dublicate_value').on('change', function () {
    var $this = $(this);
    var sel = $($this.data('selector'));
    sel.val(this.value);
  })
});


function getCookie(n) {
  return unescape((RegExp(n + '=([^;]+)').exec(document.cookie) || [1, ''])[1]);
}

function setCookie(name, value, days) {
  var expires = '';
  if (days) {
      var date = new Date;
      date.setDate(date.getDate() + days);
      expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + "=" + escape ( value ) + expires;
}

function eraseCookie(name){
  var cookie_string = name + "=0" +"; expires=Wed, 01 Oct 2017 00:00:00 GMT";
  document.cookie = cookie_string;
}

document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
(function (window, document) {
  "use strict";

  var tables = $('table.adaptive');

  if (tables.length == 0)return;

  for (var i = 0; tables.length > i; i++) {
    var table = tables.eq(i);
    var th = table.find('thead');
    if (th.length == 0) {
      th = table.find('tr').eq(0);
    } else {
      th = th.find('tr').eq(0);
    }
    th = th.addClass('table-header').find('td,th');

    var tr = table.find('tr').not('.table-header');

    for (var j = 0; j < th.length; j++) {
      var k = j + 1;
      var td = tr.find('td:nth-child(' + k + ')');
      td.attr('label', th.eq(j).text());
    }
  }

})(window, document);

;
$(function() {
  function onRemove(){
    $this=$(this);
    post={
      id:$this.attr('uid'),
      type:$this.attr('mode')
    };
    $.post($this.attr('url'),post,function(data){
      if(data && data=='err'){
        msg=$this.data('remove-error');
        if(!msg){
          msg='Невозможно удалить элемент';
        }
        notification.notifi({message:msg,type:'err'});
        return;
      }

      mode=$this.attr('mode');
      if(!mode){
        mode='rm';
      }

      if(mode=='rm') {
        rm = $this.closest('.to_remove');
        rm_class = rm.attr('rm_class');
        if (rm_class) {
          $(rm_class).remove();
        }

        rm.remove();
        notification.notifi({message:'Успешное удаление.',type:'info'})
      }
      if(mode=='reload'){
        location.reload();
        location.href=location.href;
      }
    }).fail(function(){
      notification.notifi({message:'Ошибка удалния',type:'err'});
    })
  }

  $('body').on('click','.ajax_remove',function(){
    notification.confirm({
      callbackYes:onRemove,
      obj:$(this),
      notyfy_class: "notify_box-alert"
    })
  });

});


if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== 'function') {
      // ближайший аналог внутренней функции
      // IsCallable в ECMAScript 5
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function () {
      },
      fBound = function () {
        return fToBind.apply(this instanceof fNOP && oThis
            ? this
            : oThis,
          aArgs.concat(Array.prototype.slice.call(arguments)));
      };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

(function () {
  $('.hidden-link').replaceWith(function () {
    $this = $(this);
    return '<a href="' + $this.data('link') + '" rel="'+ $this.data('rel') +'" class="' + $this.attr('class') + '">' + $this.text() + '</a>';
  })
})();

var store_points = (function(){


    function changeCountry(){
        var that = $('#store_point_country');
        if (that.length) {
            var selectOptions = $(that).find('option');
            var data = $('option:selected', that).data('cities'),
                points = $('#store-points'),
                country = $('option:selected', that).attr('value');
            if (selectOptions.length > 1 && data) {
                data = data.split(',');
                if (data.length > 0) {
                    var select = document.getElementById('store_point_city');
                    //var options = '<option value="">Выберите город</option>';
                    var options = '';
                    data.forEach(function (item) {
                        options += '<option value="' + item + '">' + item + '</option>';
                    });
                    select.innerHTML = options;
                }
            }
            //$(points).addClass('hidden');
            // googleMap.showMap();
            // googleMap.showMarker(country, '');
            changeCity();
        }

    }

    function changeCity(){
        if (typeof googleMap === 'undefined') {
            return null;
        }

        var that = $('#store_point_city');
        if (that.length) {
            var city = $('option:selected', that).attr('value'),
                country = $('option:selected', $('#store_point_country')).attr('value'),
                points = $('#store-points');
            if (country && city) {
                var items = points.find('.store-points__points_row'),
                    visible = false;
                try {
                    googleMap.showMarker(country, city);
                } catch (err) {
                    console.log(err);
                }
                $.each(items, function (index, div) {
                    if ($(div).data('city') == city && $(div).data('country') == country) {
                        $(div).removeClass('store-points__points_row-hidden');
                        visible = true;
                    } else {
                        $(div).addClass('store-points__points_row-hidden');
                    }
                });
                if (visible) {
                    $(points).removeClass('store-points__points-hidden');
                    googleMap.showMap();

                } else {
                    $(points).addClass('store-points__points-hidden');
                    googleMap.hideMap();
                }
            } else {
                $(points).addClass('store-points__points-hidden');
                googleMap.hideMap();
            }
        }
    }

    //для точек продаж, события на выбор селектов
    var body = $('body');

    $(body).on('change', '#store_point_country', function(e) {
        changeCountry();
    });


    $(body).on('change', '#store_point_city', function(e) {
        changeCity();

    });

    changeCountry();


})();





var hashTags = (function(){

    function locationHash() {
        var hash = window.location.hash;

        if (hash != "") {
            var hashBody = hash.split("?");
            if (hashBody[1]) {
                window.location = location.origin + location.pathname + '?' + hashBody[1] + hashBody[0];
            } else {
                var links = $('a[href="' + hashBody[0] + '"].modals_open');
                if (links.length) {
                    $(links[0]).click();
                }
            }
        }
    }

    window.addEventListener("hashchange", function(){
        locationHash();
    });

    locationHash()

})();
var plugins = (function(){
    var iconClose = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Capa_1" x="0px" y="0px" width="12px" height="12px" viewBox="0 0 357 357" style="enable-background:new 0 0 357 357;" xml:space="preserve"><g>'+
        '<g id="close"><polygon points="357,35.7 321.3,0 178.5,142.8 35.7,0 0,35.7 142.8,178.5 0,321.3 35.7,357 178.5,214.2 321.3,357 357,321.3     214.2,178.5   " fill="#FFFFFF"/>'+
        '</svg>';
    var template='<div class="page-wrap install-plugin_inner">'+
                '<div class="install-plugin_text">{{text}}</div>'+
                '<div class="install-plugin_buttons">'+
                    '<a class="btn btn-mini btn-round install-plugin_button"  href="{{href}}" target="_blank">{{title}}</a>'+
                    '<div class="install-plugin_button-close">'+iconClose+'</div>'+
                '</div>'+
            '</div>';
    var pluginInstallDivClass = 'install-plugin-index';
    var pluginInstallDivAccountClass = 'install-plugin-account';
    var cookiePanelHidden = 'sd-install-plugin-hidden';
    var cookieAccountDivHidden = 'sd-install-plugin-account-hidden';
    var isOpera = navigator.userAgent.indexOf(' OPR/') >= 0;
    var isYandex = navigator.userAgent.indexOf(' YaBrowser/') >= 0;
    var extensions = {
        'chrome': {
            'div_id': 'sd_chrome_app',
            'used': !!window.chrome && window.chrome.webstore !== null && !isOpera && !isYandex,
            //'text': lg("install_plugin_and_it_will_notice_about_cashback"),
            'href': 'https://chrome.google.com/webstore/detail/secretdiscounterru-%E2%80%93-%D0%BA%D1%8D%D1%88%D0%B1/mcolhhemfacpoaghjidhliecpianpnjn',
            'install_button_class': 'plugin-browsers-link-chrome'
        },
        'firefox': {
            'div_id': 'sd_firefox_app',
            'used':  typeof InstallTrigger !== 'undefined',
            //'text':lg("install_plugin_and_it_will_notice_about_cashback"),
            'href': 'https://addons.mozilla.org/ru/firefox/addon/secretdiscounter-%D0%BA%D1%8D%D1%88%D0%B1%D1%8D%D0%BA-%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81/',
            'install_button_class': 'plugin-browsers-link-firefox'
        },
        'opera': {
            'div_id': 'sd_opera_app',
            'used': isOpera,
            //'text':lg("install_plugin_and_it_will_notice_about_cashback"),
            'href': 'https://addons.opera.com/ru/extensions/?ref=page',
            'install_button_class': 'plugin-browsers-link-opera'
        },
        'yandex': {
            'div_id': 'sd_yandex_app',
            'used': isYandex,
            //'text':lg("install_plugin_and_it_will_notice_about_cashback"),
            'href': 'https://addons.opera.com/ru/extensions/?ref=page',
            'install_button_class': 'plugin-browsers-link-yandex'
        }
    };


    function setPanel(href) {
        var pluginInstallPanel = document.querySelector('#plugin-install-panel');//выводить ли панель
        if (pluginInstallPanel && getCookie(cookiePanelHidden) !== '1' ) {
            template = template.replace('{{text}}', lg("install_plugin_and_it_will_notice_about_cashback"));
            template = template.replace('{{href}}', href);
            template = template.replace('{{title}}', lg("install_plugin"));
            var section = document.createElement('section');
            section.className = 'install-plugin';
            section.innerHTML = template;

            var secondline = document.body.querySelector('.header-secondline');
            if (secondline) {
                secondline.appendChild(section);
                document.querySelector('.install-plugin_button-close').onclick = closeClick;
            }
        }
    }

    function setButtonInstallVisible(buttonClass) {
        $('.' + pluginInstallDivClass).removeClass('hidden');
        $('.' + buttonClass).removeClass('hidden');
        if (getCookie(cookieAccountDivHidden) !== '1') {
            $('.' + pluginInstallDivAccountClass).removeClass('hidden');
        }
    }

    function closeClick(){
        $('.install-plugin').addClass('install-plugin_hidden');
        setCookie(cookiePanelHidden, '1', 10);
    }

    $('.install-plugin-account-later').click(function(e) {
        e.preventDefault();
        setCookie(cookieAccountDivHidden, '1', 10);
        $('.install-plugin-account').addClass('hidden');
    });


    window.onload = function() {
         setTimeout(function(){
            for (var key in extensions) {
                if (extensions[key].used) {
                    var appId = document.querySelector('#'+extensions[key].div_id);
                    if (!appId) {
                        //панель с кнопкой
                        setPanel(extensions[key].href);
                        //на главной  и в /account блоки с иконками и кнопками
                        setButtonInstallVisible(extensions[key].install_button_class);
                    }
                }
            }
        }, 3000);
    };

})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxhbmd1YWdlLmpzIiwibGFuZy5qcyIsImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsInRvb2x0aXAuanMiLCJhY2NvdW50X25vdGlmaWNhdGlvbi5qcyIsInNsaWRlci5qcyIsImhlYWRlcl9tZW51X2FuZF9zZWFyY2guanMiLCJjYWxjLWNhc2hiYWNrLmpzIiwiYXV0b19oaWRlX2NvbnRyb2wuanMiLCJoaWRlX3Nob3dfYWxsLmpzIiwiY2xvY2suanMiLCJsaXN0X3R5cGVfc3dpdGNoZXIuanMiLCJzZWxlY3QuanMiLCJzZWFyY2guanMiLCJnb3RvLmpzIiwiYWNjb3VudC13aXRoZHJhdy5qcyIsImFqYXguanMiLCJkb2Jyby5qcyIsImxlZnQtbWVudS10b2dnbGUuanMiLCJzaGFyZTQyLmpzIiwidXNlcl9yZXZpZXdzLmpzIiwicGxhY2Vob2xkZXIuanMiLCJub3RpZmljYXRpb24uanMiLCJtb2RhbHMuanMiLCJmb290ZXJfbWVudS5qcyIsInJhdGluZy5qcyIsImZhdm9yaXRlcy5qcyIsInNjcm9sbF90by5qcyIsImNvcHlfdG9fY2xpcGJvYXJkLmpzIiwiaW1nLmpzIiwicGFyZW50c19vcGVuX3dpbmRvd3MuanMiLCJmb3Jtcy5qcyIsImNvb2tpZS5qcyIsInRhYmxlLmpzIiwiYWpheF9yZW1vdmUuanMiLCJmaXhlcy5qcyIsImxpbmtzLmpzIiwic3RvcmVfcG9pbnRzLmpzIiwiaGFzaHRhZ3MuanMiLCJwbHVnaW5zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgbGcgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBsYW5nPXt9O1xuICB1cmw9Jy9sYW5ndWFnZS8nK2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5sYW5nKycuanNvbic7XG4gICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xuICAgIC8vY29uc29sZS5sb2coZGF0YSk7XG4gICAgZm9yKHZhciBpbmRleCBpbiBkYXRhKSB7XG4gICAgICBkYXRhW2luZGV4XT1jbGVhclZhcihkYXRhW2luZGV4XSk7XG4gICAgfVxuICAgIGxhbmc9ZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJsYW5ndWFnZV9sb2FkZWRcIik7XG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgLy9jb25zb2xlLmxvZyhkYXRhLCBldmVudCk7XG4gIH0sJ2pzb24nKTtcblxuICBmdW5jdGlvbiBjbGVhclZhcih0eHQpe1xuICAgIHR4dD10eHQucmVwbGFjZSgvXFxzKy9nLFwiIFwiKTsvL9GD0LTQsNC70LXQvdC40LUg0LfQsNC00LLQvtC10L3QuNC1INC/0YDQvtCx0LXQu9C+0LJcblxuICAgIC8v0KfQuNGB0YLQuNC8INC/0L7QtNGB0YLQsNCy0LvRj9C10LzRi9C1INC/0LXRgNC10LzQtdC90L3Ri9C1XG4gICAgc3RyPXR4dC5tYXRjaCgvXFx7KC4qPylcXH0vZyk7XG4gICAgaWYgKCBzdHIgIT0gbnVsbCkge1xuICAgICAgZm9yICggaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHN0cl90PXN0cltpXS5yZXBsYWNlKC8gL2csXCJcIik7XG4gICAgICAgIHR4dD10eHQucmVwbGFjZShzdHJbaV0sc3RyX3QpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHh0O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHRwbCwgZGF0YSl7XG4gICAgaWYodHlwZW9mKGxhbmdbdHBsXSk9PVwidW5kZWZpbmVkXCIpe1xuICAgICAgY29uc29sZS5sb2coXCJsYW5nIG5vdCBmb3VuZDogXCIrdHBsKTtcbiAgICAgIHJldHVybiB0cGw7XG4gICAgfVxuICAgIHRwbD1sYW5nW3RwbF07XG4gICAgaWYodHlwZW9mKGRhdGEpPT1cIm9iamVjdFwiKXtcbiAgICAgIGZvcih2YXIgaW5kZXggaW4gZGF0YSkge1xuICAgICAgICB0cGw9dHBsLnNwbGl0KFwie1wiK2luZGV4K1wifVwiKS5qb2luKGRhdGFbaW5kZXhdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRwbDtcbiAgfVxufSkoKTsiLCJ2YXIgbGFuZyA9IChmdW5jdGlvbigpe1xuICAgIHZhciBjb2RlID0gJyc7XG4gICAgdmFyIGtleSA9ICcnO1xuICAgIHZhciBocmVmX3ByZWZpeCA9ICcnO1xuXG4gICAgdmFyIGxhbmdsaXN0ID0gJChcIiNzZF9sYW5nX2xpc3RcIikuZGF0YSgnanNvbicpO1xuICAgIHZhciBsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcblxuICAgIGlmIChsYW5nbGlzdCkge1xuICAgICAgICB2YXIgbGFuZ0tleSA9IChsb2NhdGlvbi5sZW5ndGggPT09IDMgfHwgbG9jYXRpb24uc3Vic3RyKDMsMSkgPT09ICcvJykgPyBsb2NhdGlvbi5zdWJzdHIoMSwyKSA6ICcnO1xuICAgICAgICBpZiAobGFuZ0tleSAmJiBsYW5nbGlzdFtsYW5nS2V5XSkge1xuICAgICAgICAgICAgY29kZSA9IGxhbmdsaXN0W2xhbmdLZXldO1xuICAgICAgICAgICAga2V5ID0gbGFuZ0tleTtcbiAgICAgICAgICAgIGhyZWZfcHJlZml4ID0ga2V5ID09PSAncnUnID8gJycgOiBrZXkrJy8nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5ID0gJ3J1JztcbiAgICAgICAgICAgIGNvZGUgPSBsYW5nbGlzdFtrZXldID8gbGFuZ2xpc3Rba2V5XSA6ICcnO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGNvZGU6IGNvZGUsXG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBocmVmX3ByZWZpeDogaHJlZl9wcmVmaXhcbiAgICB9XG59KSgpO1xuIiwib2JqZWN0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIHZhciBjID0gYixcbiAgICBrZXk7XG4gIGZvciAoa2V5IGluIGEpIHtcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGM7XG59O1xuXG5mdW5jdGlvbiBsb2dpbl9yZWRpcmVjdChuZXdfaHJlZikge1xuICBocmVmID0gbG9jYXRpb24uaHJlZjtcbiAgaWYgKGhyZWYuaW5kZXhPZignc3RvcmUnKSA+IDAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKSA+IDAgfHwgaHJlZi5pbmRleE9mKCd1cmwoJykgPiAwKSB7XG4gICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gIH0gZWxzZSB7XG4gICAgbG9jYXRpb24uaHJlZiA9IG5ld19ocmVmO1xuICB9XG59XG4iLCIoZnVuY3Rpb24gKHcsIGQsICQpIHtcbiAgdmFyIHNjcm9sbHNfYmxvY2sgPSAkKCcuc2Nyb2xsX2JveCcpO1xuXG4gIGlmIChzY3JvbGxzX2Jsb2NrLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gIC8vJCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpLndyYXBBbGwoc2Nyb2xsc19ibG9jayk7XG4gICQoc2Nyb2xsc19ibG9jaykud3JhcCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpO1xuXG4gIGluaXRfc2Nyb2xsKCk7XG4gIGNhbGNfc2Nyb2xsKCk7XG5cbiAgdmFyIHQxLCB0MjtcblxuICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodDEpO1xuICAgIGNsZWFyVGltZW91dCh0Mik7XG4gICAgdDEgPSBzZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLCAzMDApO1xuICAgIHQyID0gc2V0VGltZW91dChjYWxjX3Njcm9sbCwgODAwKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gaW5pdF9zY3JvbGwoKSB7XG4gICAgdmFyIGNvbnRyb2wgPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbFwiPjwvZGl2Pic7XG4gICAgY29udHJvbCA9ICQoY29udHJvbCk7XG4gICAgY29udHJvbC5pbnNlcnRBZnRlcihzY3JvbGxzX2Jsb2NrKTtcbiAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApO1xuXG4gICAgc2Nyb2xsc19ibG9jay5wcmVwZW5kKCc8ZGl2IGNsYXNzPXNjcm9sbF9ib3gtbW92ZXI+PC9kaXY+Jyk7XG5cbiAgICBjb250cm9sLm9uKCdjbGljaycsICcuc2Nyb2xsX2JveC1jb250cm9sX3BvaW50JywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgIHZhciBjb250cm9sID0gJHRoaXMucGFyZW50KCk7XG4gICAgICB2YXIgaSA9ICR0aGlzLmluZGV4KCk7XG4gICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2FjdGl2ZScpKXJldHVybjtcbiAgICAgIGNvbnRyb2wuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICR0aGlzLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuICAgICAgdmFyIGR4ID0gY29udHJvbC5kYXRhKCdzbGlkZS1keCcpO1xuICAgICAgdmFyIGVsID0gY29udHJvbC5wcmV2KCk7XG4gICAgICBlbC5maW5kKCcuc2Nyb2xsX2JveC1tb3ZlcicpLmNzcygnbWFyZ2luLWxlZnQnLCAtZHggKiBpKTtcbiAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgaSk7XG5cbiAgICAgIHN0b3BTY3JvbC5iaW5kKGVsKSgpO1xuICAgIH0pXG4gIH1cblxuICBmb3IgKHZhciBqID0gMDsgaiA8IHNjcm9sbHNfYmxvY2subGVuZ3RoOyBqKyspIHtcbiAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGopO1xuICAgIGVsLnBhcmVudCgpLmhvdmVyKHN0b3BTY3JvbC5iaW5kKGVsKSwgc3RhcnRTY3JvbC5iaW5kKGVsKSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydFNjcm9sKCkge1xuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpKXJldHVybjtcblxuICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUuYmluZCgkdGhpcyksIDIwMDApO1xuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIHRpbWVvdXRJZClcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3BTY3JvbCgpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgIHZhciB0aW1lb3V0SWQgPSAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKTtcbiAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLCBmYWxzZSk7XG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpIHx8ICF0aW1lb3V0SWQpcmV0dXJuO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIGZhbHNlKTtcbiAgICBpZiAoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xuXG4gICAgdmFyIGNvbnRyb2xzID0gJHRoaXMubmV4dCgpLmZpbmQoJz4qJyk7XG4gICAgdmFyIGFjdGl2ZSA9ICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xuICAgIHZhciBwb2ludF9jbnQgPSBjb250cm9scy5sZW5ndGg7XG4gICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcbiAgICBhY3RpdmUrKztcbiAgICBpZiAoYWN0aXZlID49IHBvaW50X2NudClhY3RpdmUgPSAwO1xuICAgICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XG5cbiAgICBjb250cm9scy5lcShhY3RpdmUpLmNsaWNrKCk7XG4gICAgc3RhcnRTY3JvbC5iaW5kKCR0aGlzKSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FsY19zY3JvbGwoKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IHNjcm9sbHNfYmxvY2subGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaSk7XG4gICAgICB2YXIgY29udHJvbCA9IGVsLm5leHQoKTtcbiAgICAgIHZhciB3aWR0aF9tYXggPSBlbC5kYXRhKCdzY3JvbGwtd2lkdGgtbWF4Jyk7XG4gICAgICB3ID0gZWwud2lkdGgoKTtcblxuICAgICAgLy/QtNC10LvQsNC10Lwg0LrQvtC90YLRgNC+0LvRjCDQvtCz0YDQsNC90LjRh9C10L3QuNGPINGI0LjRgNC40L3Riy4g0JXRgdC70Lgg0L/RgNC10LLRi9GI0LXQvdC+INGC0L4g0L7RgtC60LvRjtGH0LDQtdC8INGB0LrRgNC+0Lsg0Lgg0L/QtdGA0LXRhdC+0LTQuNC8INC6INGB0LvQtdC00YPRjtGJ0LXQvNGDINGN0LvQtdC80LXQvdGC0YNcbiAgICAgIGlmICh3aWR0aF9tYXggJiYgdyA+IHdpZHRoX21heCkge1xuICAgICAgICBjb250cm9sLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgbm9fY2xhc3MgPSBlbC5kYXRhKCdzY3JvbGwtZWxlbWV0LWlnbm9yZS1jbGFzcycpO1xuICAgICAgdmFyIGNoaWxkcmVuID0gZWwuZmluZCgnPionKS5ub3QoJy5zY3JvbGxfYm94LW1vdmVyJyk7XG4gICAgICBpZiAobm9fY2xhc3MpIHtcbiAgICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5ub3QoJy4nICsgbm9fY2xhc3MpXG4gICAgICB9XG5cbiAgICAgIC8v0JXRgdC70Lgg0L3QtdGCINC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxuICAgICAgaWYgKGNoaWxkcmVuID09IDApIHtcbiAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBmX2VsID0gY2hpbGRyZW4uZXEoMSk7XG4gICAgICB2YXIgY2hpbGRyZW5fdyA9IGZfZWwub3V0ZXJXaWR0aCgpOyAvL9Cy0YHQtdCz0L4g0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXG4gICAgICBjaGlsZHJlbl93ICs9IHBhcnNlRmxvYXQoZl9lbC5jc3MoJ21hcmdpbi1sZWZ0JykpO1xuICAgICAgY2hpbGRyZW5fdyArPSBwYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tcmlnaHQnKSk7XG5cbiAgICAgIHZhciBzY3JlYW5fY291bnQgPSBNYXRoLmZsb29yKHcgLyBjaGlsZHJlbl93KTtcblxuICAgICAgLy/QldGB0LvQuCDQstGB0LUg0LLQu9Cw0LfQuNGCINC90LAg0Y3QutGA0LDQvVxuICAgICAgaWYgKGNoaWxkcmVuIDw9IHNjcmVhbl9jb3VudCkge1xuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy/Qo9C20LUg0YLQvtGH0L3QviDQt9C90LDQtdC8INGH0YLQviDRgdC60YDQvtC7INC90YPQttC10L1cbiAgICAgIGVsLmFkZENsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG5cbiAgICAgIHZhciBwb2ludF9jbnQgPSBjaGlsZHJlbi5sZW5ndGggLSBzY3JlYW5fY291bnQgKyAxO1xuICAgICAgLy/QtdGB0LvQuCDQvdC1INC90LDQtNC+INC+0LHQvdC+0LLQu9GP0YLRjCDQutC+0L3RgtGA0L7QuyDRgtC+INCy0YvRhdC+0LTQuNC8LCDQvdC1INC30LDQsdGL0LLQsNGPINC+0LHQvdC+0LLQuNGC0Ywg0YjQuNGA0LjQvdGDINC00L7Rh9C10YDQvdC40YVcbiAgICAgIGlmIChjb250cm9sLmZpbmQoJz4qJykubGVuZ3RoID09IHBvaW50X2NudCkge1xuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWR4JywgY2hpbGRyZW5fdyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBhY3RpdmUgPSBlbC5kYXRhKCdzbGlkZS1hY3RpdmUnKTtcbiAgICAgIGlmICghYWN0aXZlKWFjdGl2ZSA9IDA7XG4gICAgICBpZiAoYWN0aXZlID49IHBvaW50X2NudClhY3RpdmUgPSBwb2ludF9jbnQgLSAxO1xuICAgICAgdmFyIG91dCA9ICcnO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwb2ludF9jbnQ7IGorKykge1xuICAgICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnICsgKGogPT0gYWN0aXZlID8gJyBhY3RpdmUnIDogJycpICsgJ1wiPjwvZGl2Pic7XG4gICAgICB9XG4gICAgICBjb250cm9sLmh0bWwob3V0KTtcblxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1jb3VudCcsIHBvaW50X2NudCk7XG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWR4JywgY2hpbGRyZW5fdyk7XG5cbiAgICAgIGlmICghZWwuZGF0YSgnc2xpZGUtdGltZW91dElkJykpIHtcbiAgICAgICAgc3RhcnRTY3JvbC5iaW5kKGVsKSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSh3aW5kb3csIGRvY3VtZW50LCBqUXVlcnkpKTtcbiIsInZhciBhY2NvcmRpb25Db250cm9sID0gJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKTtcblxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcblxuXG4gIGlmICgkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tdGl0bGUnKS5oYXNDbGFzcygnYWNjb3JkaW9uLXRpdGxlLWRpc2FibGVkJykpcmV0dXJuO1xuXG4gIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAvKmlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKXtcbiAgICAgcmV0dXJuIGZhbHNlO1xuICAgICB9Ki9cbiAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlVXAoMzAwKTtcbiAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcbiAgfSBlbHNlIHtcbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJykpIHtcbiAgICAgICRvdGhlciA9ICQoJy5hY2NvcmRpb24tb25seV9vbmUnKTtcbiAgICAgICRvdGhlci5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKVxuICAgICAgICAuc2xpZGVVcCgzMDApXG4gICAgICAgIC5yZW1vdmVDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG4gICAgICAkb3RoZXIucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnbGFzdC1vcGVuJyk7XG5cbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnbGFzdC1vcGVuJyk7XG4gICAgfVxuICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2xpZGVEb3duKDMwMCk7XG4gICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn0pO1xuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XG5cblxuJCgnLmFjY29yZGlvbi13cmFwLm9wZW5fZmlyc3QgLmFjY29yZGlvbjpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XG4kKCcuYWNjb3JkaW9uLXdyYXAgLmFjY29yZGlvbi5hY2NvcmRpb24tc2xpbTpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XG4kKCcuYWNjb3JkaW9uLXNsaW0nKS5hZGRDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJyk7XG5cbi8v0LTQu9GPINGB0LjQvNC+0LIg0L7RgtC60YDRi9Cy0LDQtdC8INC10YHQu9C4INC10YHRgtGMINC/0L7QvNC10YLQutCwIG9wZW4g0YLQviDQv9GA0LjRgdCy0LDQuNCy0LDQtdC8INCy0YHQtSDQvtGB0YLQsNC70YzQvdGL0LUg0LrQu9Cw0YHRi1xuYWNjb3JkaW9uU2xpbSA9ICQoJy5hY2NvcmRpb24uYWNjb3JkaW9uLW9ubHlfb25lJyk7XG5pZiAoYWNjb3JkaW9uU2xpbS5sZW5ndGggPiAwKSB7XG4gIGFjY29yZGlvblNsaW0ucGFyZW50KCkuZmluZCgnLmFjY29yZGlvbi5vcGVuJylcbiAgICAuYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpXG4gICAgLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXG4gICAgLnNob3coMzAwKVxuICAgIC5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG59XG5cbiQoJ2JvZHknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICQoJy5hY2NvcmRpb25fZnVsbHNjcmVhbl9jbG9zZS5vcGVuIC5hY2NvcmRpb24tY29udHJvbDpmaXJzdC1jaGlsZCcpLmNsaWNrKClcbn0pO1xuXG4kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBpZiAoZS50YXJnZXQudGFnTmFtZSAhPSAnQScpIHtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb24nKS5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wuYWNjb3JkaW9uLXRpdGxlJykuY2xpY2soKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59KTtcblxuJCgnLmFjY29yZGlvbi1jb250ZW50IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAkdGhpcyA9ICQodGhpcyk7XG4gIGlmICgkdGhpcy5oYXNDbGFzcygnYW5nbGUtdXAnKSlyZXR1cm47XG4gIGUuc3RvcFByb3BhZ2F0aW9uKClcbn0pO1xuXG4oZnVuY3Rpb24oKXtcbiAgdmFyIGVscyA9ICQoJy5hY2NvcmRpb25fbW9yZScpO1xuXG4gIGZ1bmN0aW9uIGFkZEJ1dHRvbihlbCwgY2xhc3NOYW1lLCB0aXRsZSkge1xuICAgICAgdmFyIGJ1dHRvbnMgPSAkKGVsKS5maW5kKCcuJytjbGFzc05hbWUpO1xuICAgICAgaWYgKGJ1dHRvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdmFyIGJ1dHRvbiA9ICQoJzxkaXY+JykuYWRkQ2xhc3MoY2xhc3NOYW1lKS5hZGRDbGFzcygnYWNjb3JkaW9uX21vcmVfYnV0dG9uJyk7XG4gICAgICAgICAgdmFyIGEgPSAkKCc8YT4nKS5hdHRyKCdocmVmJywgXCJcIikuYWRkQ2xhc3MoJ2JsdWUnKS5odG1sKHRpdGxlKTtcbiAgICAgICAgICAkKGJ1dHRvbikuYXBwZW5kKGEpO1xuICAgICAgICAgICQoZWwpLmFwcGVuZChidXR0b24pO1xuICAgICAgfVxuICB9XG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFjY29yZGlvbl9tb3JlX2J1dHRvbl9tb3JlJywgZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb25fbW9yZScpLmFkZENsYXNzKCdvcGVuJyk7XG4gIH0pO1xuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5hY2NvcmRpb25fbW9yZV9idXR0b25fbGVzcycsIGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuYWNjb3JkaW9uX21vcmUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICB9KTtcblxuXG5cbiAgZnVuY3Rpb24gcmVidWlsZCgpe1xuICAgICQoZWxzKS5lYWNoKGZ1bmN0aW9uKGtleSwgaXRlbSl7XG4gICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICB2YXIgY29udGVudCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmFjY29yZGlvbl9tb3JlX2NvbnRlbnQnKTtcbiAgICAgIGlmIChjb250ZW50LnNjcm9sbEhlaWdodCA+IGNvbnRlbnQuY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgIGFkZEJ1dHRvbihpdGVtLCAnYWNjb3JkaW9uX21vcmVfYnV0dG9uX21vcmUnLCAn0J/QvtC00YDQvtCx0L3QtdC1Jyk7XG4gICAgICAgIGFkZEJ1dHRvbihpdGVtLCAnYWNjb3JkaW9uX21vcmVfYnV0dG9uX2xlc3MnLCAn0KHQutGA0YvRgtGMJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKGl0ZW0pLmZpbmQoJy5hY2NvcmRpb25fbW9yZV9idXR0b24nKS5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICB9XG5cbiAgJCh3aW5kb3cpLnJlc2l6ZShyZWJ1aWxkKTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdsYW5ndWFnZV9sb2FkZWQnLCBmdW5jdGlvbigpe1xuICAgIHJlYnVpbGQoKTtcbiAgfSwgZmFsc2UpO1xuXG59KSgpO1xuXG5cbiIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xuICB2YXIgZmlsZUFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiA/IHRydWUgOiBmYWxzZTtcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcidcbiAgfTtcbiAgdmFyIGxhc3RfcG9zdCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIG9uUG9zdChwb3N0KSB7XG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XG4gICAgLy9jb25zb2xlLmxvZyhwb3N0LCB0aGlzKTtcbiAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XG4gICAgdmFyIHdyYXBfaHRtbCA9IGRhdGEud3JhcF9odG1sO1xuXG4gICAgaWYgKHBvc3QucmVuZGVyKSB7XG4gICAgICBwb3N0Lm5vdHlmeV9jbGFzcyA9IFwibm90aWZ5X3doaXRlXCI7XG4gICAgICBub3RpZmljYXRpb24uYWxlcnQocG9zdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIGlmIChwb3N0Lmh0bWwpIHtcbiAgICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XG4gICAgICAgIGFqYXhGb3JtKHdyYXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFwb3N0LmVycm9yKSB7XG4gICAgICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgIHdyYXAuaHRtbCh3cmFwX2h0bWwpO1xuICAgICAgICAgIGZvcm0uZmluZCgnaW5wdXRbdHlwZT10ZXh0XSx0ZXh0YXJlYScpLnZhbCgnJyk7XG4gICAgICAgICAgYWpheEZvcm0od3JhcCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBvc3QuZXJyb3IgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGZvciAodmFyIGluZGV4IGluIHBvc3QuZXJyb3IpIHtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IGxnKCdlcnJvcicpLFxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpbmRleF1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvc3QuZXJyb3IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IGxnKCdlcnJvcicpLFxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpXVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHBvc3QuZXJyb3IgfHwgcG9zdC5tZXNzYWdlKSB7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IChwb3N0LmVycm9yID09PSBmYWxzZSA/IGxnKCdzdWNjZXNzJykgOiBsZygnZXJyb3InKSksXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0Lm1lc3NhZ2UgPyBwb3N0Lm1lc3NhZ2UgOiBwb3N0LmVycm9yXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICAvL1xuICAgIC8vIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgIC8vICAgICAndHlwZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ3N1Y2Nlc3MnIDogJ2VycicsXG4gICAgLy8gICAgICd0aXRsZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ9Cj0YHQv9C10YjQvdC+JyA6ICfQntGI0LjQsdC60LAnLFxuICAgIC8vICAgICAnbWVzc2FnZSc6IEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikgPyBwb3N0LmVycm9yWzBdIDogKHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3IpXG4gICAgLy8gfSk7XG4gIH1cblxuICBmdW5jdGlvbiBvbkZhaWwoKSB7XG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICB3cmFwLmh0bWwoXG4gICAgICAgICc8aDM+JytsZygnc29ycnlfbm90X2V4cGVjdGVkX2Vycm9yJykrJzxoMz4nICtcbiAgICAgICAgbGcoJ2l0X2hhcHBlbnNfc29tZXRpbWVzJylcbiAgICApO1xuICAgIGFqYXhGb3JtKHdyYXApO1xuXG4gIH1cblxuICBmdW5jdGlvbiBvblN1Ym1pdChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAvL2Uuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB2YXIgY3VycmVudFRpbWVNaWxsaXMgPSArbmV3IERhdGUoKTtcbiAgICBpZiAoY3VycmVudFRpbWVNaWxsaXMgLSBsYXN0X3Bvc3QgPCAxMDAwICogMikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxhc3RfcG9zdCA9IGN1cnJlbnRUaW1lTWlsbGlzO1xuICAgIHZhciBkYXRhID0gdGhpcztcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcbiAgICBkYXRhLndyYXBfaHRtbD13cmFwLmh0bWwoKTtcbiAgICB2YXIgaXNWYWxpZCA9IHRydWU7XG5cbiAgICAvL2luaXQod3JhcCk7XG5cbiAgICBpZiAoZm9ybS55aWlBY3RpdmVGb3JtKSB7XG4gICAgICB2YXIgZCA9IGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScpO1xuICAgICAgaWYgKGQpIHtcbiAgICAgICAgZC52YWxpZGF0ZWQgPSB0cnVlO1xuICAgICAgICBmb3JtLmRhdGEoJ3lpaUFjdGl2ZUZvcm0nLCBkKTtcbiAgICAgICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScpO1xuICAgICAgICBpc1ZhbGlkID0gZC52YWxpZGF0ZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaXNWYWxpZCA9IGlzVmFsaWQgJiYgKGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGggPT0gMCk7XG5cbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuXG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHZhciByZXF1aXJlZCA9IGZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQsIHRleHRhcmVhLnJlcXVpcmVkLCBpbnB1dFtpZD1cInN1cHBvcnQtcmVjYXB0Y2hhXCJdJyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlcXVpcmVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBoZWxwQmxvY2sgPSByZXF1aXJlZC5lcShpKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmZpbmQoJy5oZWxwLWJsb2NrJyk7XG4gICAgICAgIHZhciBoZWxwTWVzc2FnZSA9IGhlbHBCbG9jayAmJiBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpID8gaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA6IGxnKCdyZXF1aXJlZCcpO1xuXG4gICAgICAgIGlmIChyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgaGVscEJsb2NrLmh0bWwoaGVscE1lc3NhZ2UpO1xuICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoZWxwQmxvY2suaHRtbCgnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcblxuICAgIHZhciBwb3N0RGF0YSA9IGZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xuICAgIGZvcm0uaHRtbCgnJyk7XG4gICAgd3JhcC5odG1sKCc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHA+JytsZygnc2VuZGluZ19kYXRhJykrJzwvcD48L2Rpdj4nKTtcblxuICAgIGRhdGEudXJsICs9IChkYXRhLnVybC5pbmRleE9mKCc/JykgPiAwID8gJyYnIDogJz8nKSArICdyYz0nICsgTWF0aC5yYW5kb20oKTtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEudXJsKTtcblxuICAgIC8qaWYoIXBvc3REYXRhLnJldHVyblVybCl7XG4gICAgICBwb3N0RGF0YS5yZXR1cm5Vcmw9bG9jYXRpb24uaHJlZjtcbiAgICB9Ki9cblxuICAgICQucG9zdChcbiAgICAgIGRhdGEudXJsLFxuICAgICAgcG9zdERhdGEsXG4gICAgICBvblBvc3QuYmluZChkYXRhKSxcbiAgICAgICdqc29uJ1xuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0KHdyYXApIHtcbiAgICBmb3JtID0gd3JhcC5maW5kKCdmb3JtJyk7XG4gICAgZGF0YSA9IHtcbiAgICAgIGZvcm06IGZvcm0sXG4gICAgICBwYXJhbTogZGVmYXVsdHMsXG4gICAgICB3cmFwOiB3cmFwXG4gICAgfTtcbiAgICBkYXRhLnVybCA9IGZvcm0uYXR0cignYWN0aW9uJykgfHwgbG9jYXRpb24uaHJlZjtcbiAgICBkYXRhLm1ldGhvZCA9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xuICAgIGZvcm0udW5iaW5kKCdzdWJtaXQnKTtcbiAgICAvL2Zvcm0ub2ZmKCdzdWJtaXQnKTtcbiAgICBmb3JtLm9uKCdzdWJtaXQnLCBvblN1Ym1pdC5iaW5kKGRhdGEpKTtcbiAgfVxuXG4gIGVscy5maW5kKCdbcmVxdWlyZWRdJylcbiAgICAuYWRkQ2xhc3MoJ3JlcXVpcmVkJylcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcblxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgaW5pdChlbHMuZXEoaSkpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwbGFjZWhvbGRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwbGFjZWhvbGRlcigpO1xuICB9XG5cbn1cblxuZnVuY3Rpb24gYWRkU1JPKCkge1xuICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbyA9IHt9O1xuICAgIHZhciBhID0gdGhpcy5zZXJpYWxpemVBcnJheSgpO1xuICAgICQuZWFjaChhLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAob1t0aGlzLm5hbWVdKSB7XG4gICAgICAgIGlmICghb1t0aGlzLm5hbWVdLnB1c2gpIHtcbiAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcbiAgICAgICAgfVxuICAgICAgICBvW3RoaXMubmFtZV0ucHVzaCh0aGlzLnZhbHVlIHx8ICcnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9bdGhpcy5uYW1lXSA9IHRoaXMudmFsdWUgfHwgJyc7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG87XG4gIH07XG59O1xuYWRkU1JPKCk7IiwidmFyIHNkVG9vbHRpcCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciB0b29sdGlwVGltZU91dCA9IG51bGw7XG4gICAgdmFyIGRpc3BsYXlUaW1lT3ZlciA9IDA7XG4gICAgdmFyIGRpc3BsYXlUaW1lQ2xpY2sgPSAzMDAwO1xuICAgIHZhciBoaWRlVGltZSA9IDEwMDtcbiAgICB2YXIgYXJyb3cgPSAxMDtcbiAgICB2YXIgYXJyb3dXaWR0aCA9IDg7XG4gICAgdmFyIHRvb2x0aXA7XG4gICAgdmFyIHNpemUgPSAnc21hbGwnO1xuICAgIHZhciBoaWRlQ2xhc3MgPSAnaGlkZGVuJztcbiAgICB2YXIgdG9vbHRpcEVsZW1lbnRzID0gJCgnW2RhdGEtdG9nZ2xlPXRvb2x0aXBdJyk7XG4gICAgdmFyIGN1cnJlbnRFbGVtZW50O1xuXG4gICAgdmFyIHRvb2x0aXBJbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0b29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ3RpcHNvX2J1YmJsZScpLmFkZENsYXNzKHNpemUpLmFkZENsYXNzKGhpZGVDbGFzcylcbiAgICAgICAgICAgIC5odG1sKCc8ZGl2IGNsYXNzPVwidGlwc29fYXJyb3dcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGl0c29fdGl0bGVcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGlwc29fY29udGVudFwiPjwvZGl2PicpO1xuICAgICAgICAkKHRvb2x0aXApLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgY2hlY2tNb3VzZVBvcyhlKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQodG9vbHRpcCkub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjaGVja01vdXNlUG9zKGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0b29sdGlwKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY2hlY2tNb3VzZVBvcyhlKSB7XG4gICAgICAgIGlmIChlLmNsaWVudFggPiAkKGN1cnJlbnRFbGVtZW50KS5vZmZzZXQoKS5sZWZ0ICYmIGUuY2xpZW50WCA8ICQoY3VycmVudEVsZW1lbnQpLm9mZnNldCgpLmxlZnQgKyAkKGN1cnJlbnRFbGVtZW50KS5vdXRlcldpZHRoKClcbiAgICAgICAgICAgICYmIGUuY2xpZW50WSA+ICQoY3VycmVudEVsZW1lbnQpLm9mZnNldCgpLnRvcCAmJiBlLmNsaWVudFkgPCAkKGN1cnJlbnRFbGVtZW50KS5vZmZzZXQoKS50b3AgKyAkKGN1cnJlbnRFbGVtZW50KS5vdXRlckhlaWdodCgpKSB7XG4gICAgICAgICAgICB0b29sdGlwU2hvdyhjdXJyZW50RWxlbWVudCwgZGlzcGxheVRpbWVPdmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvb2x0aXBTaG93KGVsZW0sIGRpc3BsYXlUaW1lKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0b29sdGlwVGltZU91dCk7XG4gICAgICAgIC8vaWYgKCQodG9vbHRpcCkuaGFzQ2xhc3MoaGlkZUNsYXNzKSkge1xuICAgICAgICAgICAgdmFyIHRpdGxlID0gJChlbGVtKS5kYXRhKCdvcmlnaW5hbC10aXRsZScpO1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gJChlbGVtKS5kYXRhKCdwbGFjZW1lbnQnKSB8fCAnYm90dG9tJztcbiAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyIGJvdHRvbV9yaWdodF9jb3JuZXIgdG9wX2xlZnRfY29ybmVyIGJvdHRvbV9sZWZ0X2Nvcm5lclwiKTtcbiAgICAgICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpdHNvX3RpdGxlJykuaHRtbCh0aXRsZSk7XG4gICAgICAgICAgICBzZXRQb3NpdG9uKGVsZW0sIHBvc2l0aW9uKTtcbiAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoaGlkZUNsYXNzKTtcbiAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50ID0gZWxlbTtcblxuICAgICAgICAgICAgaWYgKGRpc3BsYXlUaW1lID4gMCkge1xuICAgICAgICAgICAgICAgIHRvb2x0aXBUaW1lT3V0ID0gc2V0VGltZW91dCh0b29sdGlwSGlkZSwgZGlzcGxheVRpbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgIC8vIH1cblxuICAgIH1cbiAgICBmdW5jdGlvbiB0b29sdGlwSGlkZSgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRvb2x0aXBUaW1lT3V0KTtcbiAgICAgICAgdG9vbHRpcFRpbWVPdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKGhpZGVDbGFzcyk7XG4gICAgICAgIH0sIGhpZGVUaW1lKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRQb3NpdG9uKGVsZW0sIHBvc2l0aW9uKXtcbiAgICAgICAgdmFyICRlID0gJChlbGVtKTtcbiAgICAgICAgdmFyICR3aW4gPSAkKHdpbmRvdyk7XG4gICAgICAgIHZhciBjdXN0b21Ub3AgPSAkKGVsZW0pLmRhdGEoJ3RvcCcpOy8v0LfQsNC00LDQvdCwINC/0L7Qt9C40YbQuNGPINCy0L3Rg9GC0YDQuCDRjdC70LXQvNC10L3RgtCwXG4gICAgICAgIHZhciBjdXN0b21MZWZ0ID0gJChlbGVtKS5kYXRhKCdsZWZ0Jyk7Ly/Qt9Cw0LTQsNC90LAg0L/QvtC30LjRhtC40Y8g0LLQvdGD0YLRgNC4INGN0LvQtdC80LXQvdGC0LBcbiAgICAgICAgdmFyIG5vcmV2ZXJ0ID0gJChlbGVtKS5kYXRhKCdub3JldmVydCcpOy8v0L3QtSDQv9C10YDQtdCy0L7RgNCw0YfQuNCy0LDRgtGMXG4gICAgICAgIHN3aXRjaChwb3NpdGlvbikge1xuICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICBwb3NfbGVmdCA9ICRlLm9mZnNldCgpLmxlZnQgKyAoY3VzdG9tTGVmdCA/IGN1c3RvbUxlZnQgOiAkZS5vdXRlcldpZHRoKCkgLyAyKSAtICQodG9vbHRpcCkub3V0ZXJXaWR0aCgpIC8gMjtcbiAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wIC0gJCh0b29sdGlwKS5vdXRlckhlaWdodCgpICsgKGN1c3RvbVRvcCA/IGN1c3RvbVRvcCA6IDApIC0gYXJyb3c7XG4gICAgICAgICAgICAgICAgJCh0b29sdGlwKS5maW5kKCcudGlwc29fYXJyb3cnKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5MZWZ0OiAtYXJyb3dXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICgocG9zX3RvcCA8ICR3aW4uc2Nyb2xsVG9wKCkpICYmICFub3JldmVydCkge1xuICAgICAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wICsoY3VzdG9tVG9wID8gY3VzdG9tVG9wIDogJGUub3V0ZXJIZWlnaHQoKSkgKyBhcnJvdztcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ2JvdHRvbScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ3RvcCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgcG9zX2xlZnQgPSAkZS5vZmZzZXQoKS5sZWZ0ICsgKGN1c3RvbUxlZnQgPyBjdXN0b21MZWZ0IDogJGUub3V0ZXJXaWR0aCgpIC8gMikgLSAkKHRvb2x0aXApLm91dGVyV2lkdGgoKSAvIDI7XG4gICAgICAgICAgICAgICAgcG9zX3RvcCA9ICRlLm9mZnNldCgpLnRvcCArIChjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAkZS5vdXRlckhlaWdodCgpKSArIGFycm93O1xuICAgICAgICAgICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpcHNvX2Fycm93JykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogLWFycm93V2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoKHBvc190b3AgKyAkKHRvb2x0aXApLmhlaWdodCgpID4gJHdpbi5zY3JvbGxUb3AoKSArICR3aW4ub3V0ZXJIZWlnaHQoKSkgJiYgIW5vcmV2ZXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgLSAkKHRvb2x0aXApLmhlaWdodCgpICsgKGN1c3RvbVRvcCA/IGN1c3RvbVRvcCA6IDApIC0gYXJyb3c7XG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCd0b3AnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCdib3R0b20nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgJCh0b29sdGlwKS5jc3Moe1xuICAgICAgICAgICAgbGVmdDogIHBvc19sZWZ0LFxuICAgICAgICAgICAgdG9wOiBwb3NfdG9wXG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoJCh0aGlzKS5kYXRhKCdjbGlja2FibGUnKSkge1xuICAgICAgICAgIGlmICgkKHRvb2x0aXApLmhhc0NsYXNzKGhpZGVDbGFzcykpIHtcbiAgICAgICAgICAgICAgdG9vbHRpcFNob3codGhpcywgZGlzcGxheVRpbWVDbGljayk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdG9vbHRpcEhpZGUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvb2x0aXBFbGVtZW50cy5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IDEwMjQpIHtcbiAgICAgICAgICAgIHRvb2x0aXBTaG93KHRoaXMsIGRpc3BsYXlUaW1lT3Zlcik7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB0b29sdGlwRWxlbWVudHMub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMDI0KSB7XG4gICAgICAgICAgICB0b29sdGlwU2hvdyh0aGlzLCBkaXNwbGF5VGltZU92ZXIpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24gKCl7XG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMDI0KSB7XG4gICAgICAgICAgICB0b29sdGlwSGlkZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRvb2x0aXBJbml0KCk7XG4gICAgfSk7XG5cblxufSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgdmFyICRub3R5ZmlfYnRuID0gJCgnLmhlYWRlci1sb2dvX25vdHknKTtcbiAgaWYgKCRub3R5ZmlfYnRuLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGhyZWYgPSAnLycrbGFuZy5ocmVmX3ByZWZpeCsnYWNjb3VudC9ub3RpZmljYXRpb24nO1xuXG4gICQuZ2V0KGhyZWYsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYgKCFkYXRhLm5vdGlmaWNhdGlvbnMgfHwgZGF0YS5ub3RpZmljYXRpb25zLmxlbmd0aCA9PSAwKSByZXR1cm47XG5cbiAgICB2YXIgb3V0ID0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktYm94PjxkaXYgY2xhc3M9aGVhZGVyLW5vdHktYm94LWlubmVyPjx1bCBjbGFzcz1cImhlYWRlci1ub3R5LWxpc3RcIj4nO1xuICAgICRub3R5ZmlfYnRuLmZpbmQoJ2EnKS5yZW1vdmVBdHRyKCdocmVmJyk7XG4gICAgdmFyIGhhc19uZXcgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgZWwgPSBkYXRhLm5vdGlmaWNhdGlvbnNbaV07XG4gICAgICB2YXIgaXNfbmV3ID0gKGVsLmlzX3ZpZXdlZCA9PSAwICYmIGVsLnR5cGVfaWQgPT0gMik7XG4gICAgICBvdXQgKz0gJzxsaSBjbGFzcz1cImhlYWRlci1ub3R5LWl0ZW0nICsgKGlzX25ldyA/ICcgaGVhZGVyLW5vdHktaXRlbV9uZXcnIDogJycpICsgJ1wiPic7XG4gICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktZGF0YT4nICsgZWwuZGF0YSArICc8L2Rpdj4nO1xuICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LXRleHQ+JyArIGVsLnRleHQgKyAnPC9kaXY+JztcbiAgICAgIG91dCArPSAnPC9saT4nO1xuICAgICAgaGFzX25ldyA9IGhhc19uZXcgfHwgaXNfbmV3O1xuICAgIH1cblxuICAgIG91dCArPSAnPC91bD4nO1xuICAgIG91dCArPSAnPGEgY2xhc3M9XCJidG4gaGVhZGVyLW5vdHktYm94LWJ0blwiIGhyZWY9XCInK2hyZWYrJ1wiPicgKyBkYXRhLmJ0biArICc8L2E+JztcbiAgICBvdXQgKz0gJzwvZGl2PjwvZGl2Pic7XG4gICAgJCgnLmhlYWRlcicpLmFwcGVuZChvdXQpO1xuXG4gICAgaWYgKGhhc19uZXcpIHtcbiAgICAgICRub3R5ZmlfYnRuLmFkZENsYXNzKCd0b29sdGlwJykuYWRkQ2xhc3MoJ2hhcy1ub3R5Jyk7XG4gICAgfVxuXG4gICAgJG5vdHlmaV9idG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmICgkKCcuaGVhZGVyLW5vdHktYm94JykuaGFzQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJykpIHtcbiAgICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xuICAgICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5hZGRDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcbiAgICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XG5cbiAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2hhcy1ub3R5JykpIHtcbiAgICAgICAgICAkLnBvc3QoJy9hY2NvdW50L25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICQoJy5oZWFkZXItbG9nb19ub3R5JykucmVtb3ZlQ2xhc3MoJ3Rvb2x0aXAnKS5yZW1vdmVDbGFzcygnaGFzLW5vdHknKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICAkKCcuaGVhZGVyLW5vdHktYm94Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5yZW1vdmVDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcbiAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xuICAgIH0pO1xuXG4gICAgJCgnLmhlYWRlci1ub3R5LWxpc3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pXG4gIH0sICdqc29uJyk7XG5cbn0pKCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmlmICh0eXBlb2YgbWloYWlsZGV2ID09IFwidW5kZWZpbmVkXCIgfHwgIW1paGFpbGRldikge1xuICAgIHZhciBtaWhhaWxkZXYgPSB7fTtcbiAgICBtaWhhaWxkZXYuZWxGaW5kZXIgPSB7XG4gICAgICAgIG9wZW5NYW5hZ2VyOiBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSBcIm1lbnViYXI9bm8sdG9vbGJhcj1ubyxsb2NhdGlvbj1ubyxkaXJlY3Rvcmllcz1ubyxzdGF0dXM9bm8sZnVsbHNjcmVlbj1ub1wiO1xuICAgICAgICAgICAgaWYob3B0aW9ucy53aWR0aCA9PSAnYXV0bycpe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMud2lkdGggPSAkKHdpbmRvdykud2lkdGgoKS8xLjU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKG9wdGlvbnMuaGVpZ2h0ID09ICdhdXRvJyl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5oZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCkvMS41O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMgKyBcIix3aWR0aD1cIiArIG9wdGlvbnMud2lkdGg7XG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMgKyBcIixoZWlnaHQ9XCIgKyBvcHRpb25zLmhlaWdodDtcblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhwYXJhbXMpO1xuICAgICAgICAgICAgdmFyIHdpbiA9IHdpbmRvdy5vcGVuKG9wdGlvbnMudXJsLCAnRWxGaW5kZXJNYW5hZ2VyJyArIG9wdGlvbnMuaWQsIHBhcmFtcyk7XG4gICAgICAgICAgICB3aW4uZm9jdXMoKVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbnM6IHt9LFxuICAgICAgICByZWdpc3RlcjogZnVuY3Rpb24oaWQsIGZ1bmMpe1xuICAgICAgICAgICAgdGhpcy5mdW5jdGlvbnNbaWRdID0gZnVuYztcbiAgICAgICAgfSxcbiAgICAgICAgY2FsbEZ1bmN0aW9uOiBmdW5jdGlvbihpZCwgZmlsZSl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mdW5jdGlvbnNbaWRdKGZpbGUsIGlkKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb25SZXR1cm5Ub0lucHV0OiBmdW5jdGlvbihmaWxlLCBpZCl7XG4gICAgICAgICAgICBqUXVlcnkoJyMnICsgaWQpLnZhbChmaWxlLnVybCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG5cbn1cblxuXG5cbnZhciBtZWdhc2xpZGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNsaWRlcl9kYXRhID0gZmFsc2U7XG4gIHZhciBjb250YWluZXJfaWQgPSBcInNlY3Rpb24jbWVnYV9zbGlkZXJcIjtcbiAgdmFyIHBhcmFsbGF4X2dyb3VwID0gZmFsc2U7XG4gIHZhciBwYXJhbGxheF90aW1lciA9IGZhbHNlO1xuICB2YXIgcGFyYWxsYXhfY291bnRlciA9IDA7XG4gIHZhciBwYXJhbGxheF9kID0gMTtcbiAgdmFyIG1vYmlsZV9tb2RlID0gLTE7XG4gIHZhciBtYXhfdGltZV9sb2FkX3BpYyA9IDMwMDtcbiAgdmFyIG1vYmlsZV9zaXplID0gNzAwO1xuICB2YXIgcmVuZGVyX3NsaWRlX25vbSA9IDA7XG4gIHZhciB0b3RfaW1nX3dhaXQ7XG4gIHZhciBzbGlkZXM7XG4gIHZhciBzbGlkZV9zZWxlY3RfYm94O1xuICB2YXIgZWRpdG9yO1xuICB2YXIgdGltZW91dElkO1xuICB2YXIgc2Nyb2xsX3BlcmlvZCA9IDYwMDA7XG5cbiAgdmFyIHBvc0FyciA9IFtcbiAgICAnc2xpZGVyX190ZXh0LWx0JywgJ3NsaWRlcl9fdGV4dC1jdCcsICdzbGlkZXJfX3RleHQtcnQnLFxuICAgICdzbGlkZXJfX3RleHQtbGMnLCAnc2xpZGVyX190ZXh0LWNjJywgJ3NsaWRlcl9fdGV4dC1yYycsXG4gICAgJ3NsaWRlcl9fdGV4dC1sYicsICdzbGlkZXJfX3RleHQtY2InLCAnc2xpZGVyX190ZXh0LXJiJyxcbiAgXTtcbiAgdmFyIHBvc19saXN0ID0gW1xuICAgICfQm9C10LLQviDQstC10YDRhScsICfRhtC10L3RgtGAINCy0LXRgNGFJywgJ9C/0YDQsNCy0L4g0LLQtdGA0YUnLFxuICAgICfQm9C10LLQviDRhtC10L3RgtGAJywgJ9GG0LXQvdGC0YAnLCAn0L/RgNCw0LLQviDRhtC10L3RgtGAJyxcbiAgICAn0JvQtdCy0L4g0L3QuNC3JywgJ9GG0LXQvdGC0YAg0L3QuNC3JywgJ9C/0YDQsNCy0L4g0L3QuNC3JyxcbiAgXTtcbiAgdmFyIHNob3dfZGVsYXkgPSBbXG4gICAgJ3Nob3dfbm9fZGVsYXknLFxuICAgICdzaG93X2RlbGF5XzA1JyxcbiAgICAnc2hvd19kZWxheV8xMCcsXG4gICAgJ3Nob3dfZGVsYXlfMTUnLFxuICAgICdzaG93X2RlbGF5XzIwJyxcbiAgICAnc2hvd19kZWxheV8yNScsXG4gICAgJ3Nob3dfZGVsYXlfMzAnXG4gIF07XG4gIHZhciBoaWRlX2RlbGF5ID0gW1xuICAgICdoaWRlX25vX2RlbGF5JyxcbiAgICAnaGlkZV9kZWxheV8wNScsXG4gICAgJ2hpZGVfZGVsYXlfMTAnLFxuICAgICdoaWRlX2RlbGF5XzE1JyxcbiAgICAnaGlkZV9kZWxheV8yMCdcbiAgXTtcbiAgdmFyIHllc19ub19hcnIgPSBbXG4gICAgJ25vJyxcbiAgICAneWVzJ1xuICBdO1xuICB2YXIgeWVzX25vX3ZhbCA9IFtcbiAgICAnJyxcbiAgICAnZml4ZWRfX2Z1bGwtaGVpZ2h0J1xuICBdO1xuICB2YXIgYnRuX3N0eWxlID0gW1xuICAgICdub25lJyxcbiAgICAnYm9yZG8nLFxuICBdO1xuICB2YXIgc2hvd19hbmltYXRpb25zID0gW1xuICAgIFwibm90X2FuaW1hdGVcIixcbiAgICBcImJvdW5jZUluXCIsXG4gICAgXCJib3VuY2VJbkRvd25cIixcbiAgICBcImJvdW5jZUluTGVmdFwiLFxuICAgIFwiYm91bmNlSW5SaWdodFwiLFxuICAgIFwiYm91bmNlSW5VcFwiLFxuICAgIFwiZmFkZUluXCIsXG4gICAgXCJmYWRlSW5Eb3duXCIsXG4gICAgXCJmYWRlSW5MZWZ0XCIsXG4gICAgXCJmYWRlSW5SaWdodFwiLFxuICAgIFwiZmFkZUluVXBcIixcbiAgICBcImZsaXBJblhcIixcbiAgICBcImZsaXBJbllcIixcbiAgICBcImxpZ2h0U3BlZWRJblwiLFxuICAgIFwicm90YXRlSW5cIixcbiAgICBcInJvdGF0ZUluRG93bkxlZnRcIixcbiAgICBcInJvdGF0ZUluVXBMZWZ0XCIsXG4gICAgXCJyb3RhdGVJblVwUmlnaHRcIixcbiAgICBcImphY2tJblRoZUJveFwiLFxuICAgIFwicm9sbEluXCIsXG4gICAgXCJ6b29tSW5cIlxuICBdO1xuXG4gIHZhciBoaWRlX2FuaW1hdGlvbnMgPSBbXG4gICAgXCJub3RfYW5pbWF0ZVwiLFxuICAgIFwiYm91bmNlT3V0XCIsXG4gICAgXCJib3VuY2VPdXREb3duXCIsXG4gICAgXCJib3VuY2VPdXRMZWZ0XCIsXG4gICAgXCJib3VuY2VPdXRSaWdodFwiLFxuICAgIFwiYm91bmNlT3V0VXBcIixcbiAgICBcImZhZGVPdXRcIixcbiAgICBcImZhZGVPdXREb3duXCIsXG4gICAgXCJmYWRlT3V0TGVmdFwiLFxuICAgIFwiZmFkZU91dFJpZ2h0XCIsXG4gICAgXCJmYWRlT3V0VXBcIixcbiAgICBcImZsaXBPdXRYXCIsXG4gICAgXCJsaXBPdXRZXCIsXG4gICAgXCJsaWdodFNwZWVkT3V0XCIsXG4gICAgXCJyb3RhdGVPdXRcIixcbiAgICBcInJvdGF0ZU91dERvd25MZWZ0XCIsXG4gICAgXCJyb3RhdGVPdXREb3duUmlnaHRcIixcbiAgICBcInJvdGF0ZU91dFVwTGVmdFwiLFxuICAgIFwicm90YXRlT3V0VXBSaWdodFwiLFxuICAgIFwiaGluZ2VcIixcbiAgICBcInJvbGxPdXRcIlxuICBdO1xuICB2YXIgc3RUYWJsZTtcbiAgdmFyIHBhcmFsYXhUYWJsZTtcblxuICBmdW5jdGlvbiBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWxzKSB7XG4gICAgaWYgKGVscy5sZW5ndGggPT0gMClyZXR1cm47XG4gICAgZWxzLndyYXAoJzxkaXYgY2xhc3M9XCJzZWxlY3RfaW1nXCI+Jyk7XG4gICAgZWxzID0gZWxzLnBhcmVudCgpO1xuICAgIGVscy5hcHBlbmQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmlsZV9idXR0b25cIj48aSBjbGFzcz1cIm1jZS1pY28gbWNlLWktYnJvd3NlXCI+PC9pPjwvYnV0dG9uPicpO1xuICAgIC8qZWxzLmZpbmQoJ2J1dHRvbicpLm9uKCdjbGljaycsZnVuY3Rpb24gKCkge1xuICAgICAkKCcjcm94eUN1c3RvbVBhbmVsMicpLmFkZENsYXNzKCdvcGVuJylcbiAgICAgfSk7Ki9cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGVsID0gZWxzLmVxKGkpLmZpbmQoJ2lucHV0Jyk7XG4gICAgICBpZiAoIWVsLmF0dHIoJ2lkJykpIHtcbiAgICAgICAgZWwuYXR0cignaWQnLCAnZmlsZV8nICsgaSArICdfJyArIERhdGUubm93KCkpXG4gICAgICB9XG4gICAgICB2YXIgdF9pZCA9IGVsLmF0dHIoJ2lkJyk7XG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIucmVnaXN0ZXIodF9pZCwgZnVuY3Rpb24gKGZpbGUsIGlkKSB7XG4gICAgICAgIC8vJCh0aGlzKS52YWwoZmlsZS51cmwpLnRyaWdnZXIoJ2NoYW5nZScsIFtmaWxlLCBpZF0pO1xuICAgICAgICAkKCcjJyArIGlkKS52YWwoZmlsZS51cmwpLmNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICA7XG5cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmZpbGVfYnV0dG9uJywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKS5wcmV2KCk7XG4gICAgICB2YXIgaWQgPSAkdGhpcy5hdHRyKCdpZCcpO1xuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLm9wZW5NYW5hZ2VyKHtcbiAgICAgICAgXCJ1cmxcIjogXCIvbWFuYWdlci9lbGZpbmRlcj9maWx0ZXI9aW1hZ2UmY2FsbGJhY2s9XCIgKyBpZCArIFwiJmxhbmc9cnVcIixcbiAgICAgICAgXCJ3aWR0aFwiOiBcImF1dG9cIixcbiAgICAgICAgXCJoZWlnaHRcIjogXCJhdXRvXCIsXG4gICAgICAgIFwiaWRcIjogaWRcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuSW5wdXQoZGF0YSkge1xuICAgIHZhciBpbnB1dCA9ICc8aW5wdXQgY2xhc3M9XCInICsgKGRhdGEuaW5wdXRDbGFzcyB8fCAnJykgKyAnXCIgdmFsdWU9XCInICsgKGRhdGEudmFsdWUgfHwgJycpICsgJ1wiPic7XG4gICAgaWYgKGRhdGEubGFiZWwpIHtcbiAgICAgIGlucHV0ID0gJzxsYWJlbD48c3Bhbj4nICsgZGF0YS5sYWJlbCArICc8L3NwYW4+JyArIGlucHV0ICsgJzwvbGFiZWw+JztcbiAgICB9XG4gICAgaWYgKGRhdGEucGFyZW50KSB7XG4gICAgICBpbnB1dCA9ICc8JyArIGRhdGEucGFyZW50ICsgJz4nICsgaW5wdXQgKyAnPC8nICsgZGF0YS5wYXJlbnQgKyAnPic7XG4gICAgfVxuICAgIGlucHV0ID0gJChpbnB1dCk7XG5cbiAgICBpZiAoZGF0YS5vbkNoYW5nZSkge1xuICAgICAgdmFyIG9uQ2hhbmdlO1xuICAgICAgaWYgKGRhdGEuYmluZCkge1xuICAgICAgICBkYXRhLmJpbmQuaW5wdXQgPSBpbnB1dC5maW5kKCdpbnB1dCcpO1xuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChkYXRhLmJpbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb25DaGFuZ2UgPSBkYXRhLm9uQ2hhbmdlLmJpbmQoaW5wdXQuZmluZCgnaW5wdXQnKSk7XG4gICAgICB9XG4gICAgICBpbnB1dC5maW5kKCdpbnB1dCcpLm9uKCdjaGFuZ2UnLCBvbkNoYW5nZSlcbiAgICB9XG4gICAgcmV0dXJuIGlucHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuU2VsZWN0KGRhdGEpIHtcbiAgICB2YXIgaW5wdXQgPSAkKCc8c2VsZWN0Lz4nKTtcblxuICAgIHZhciBlbCA9IHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdO1xuICAgIGlmIChkYXRhLmluZGV4ICE9PSBmYWxzZSkge1xuICAgICAgZWwgPSBlbFtkYXRhLmluZGV4XTtcbiAgICB9XG5cbiAgICBpZiAoZWxbZGF0YS5wYXJhbV0pIHtcbiAgICAgIGRhdGEudmFsdWUgPSBlbFtkYXRhLnBhcmFtXTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YS52YWx1ZSA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEuc3RhcnRfb3B0aW9uKSB7XG4gICAgICBpbnB1dC5hcHBlbmQoZGF0YS5zdGFydF9vcHRpb24pXG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWw7XG4gICAgICB2YXIgdHh0ID0gZGF0YS5saXN0W2ldO1xuICAgICAgaWYgKGRhdGEudmFsX3R5cGUgPT0gMCkge1xuICAgICAgICB2YWwgPSBkYXRhLmxpc3RbaV07XG4gICAgICB9IGVsc2UgaWYgKGRhdGEudmFsX3R5cGUgPT0gMSkge1xuICAgICAgICB2YWwgPSBpO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbF90eXBlID09IDIpIHtcbiAgICAgICAgLy92YWw9ZGF0YS52YWxfbGlzdFtpXTtcbiAgICAgICAgdmFsID0gaTtcbiAgICAgICAgdHh0ID0gZGF0YS52YWxfbGlzdFtpXTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNlbCA9ICh2YWwgPT0gZGF0YS52YWx1ZSA/ICdzZWxlY3RlZCcgOiAnJyk7XG4gICAgICBpZiAoc2VsID09ICdzZWxlY3RlZCcpIHtcbiAgICAgICAgaW5wdXQuYXR0cigndF92YWwnLCBkYXRhLmxpc3RbaV0pO1xuICAgICAgfVxuICAgICAgdmFyIG9wdGlvbiA9ICc8b3B0aW9uIHZhbHVlPVwiJyArIHZhbCArICdcIiAnICsgc2VsICsgJz4nICsgdHh0ICsgJzwvb3B0aW9uPic7XG4gICAgICBpZiAoZGF0YS52YWxfdHlwZSA9PSAyKSB7XG4gICAgICAgIG9wdGlvbiA9ICQob3B0aW9uKS5hdHRyKCdjb2RlJywgZGF0YS5saXN0W2ldKTtcbiAgICAgIH1cbiAgICAgIGlucHV0LmFwcGVuZChvcHRpb24pXG4gICAgfVxuXG4gICAgaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEgPSB0aGlzO1xuICAgICAgdmFyIHZhbCA9IGRhdGEuZWwudmFsKCk7XG4gICAgICB2YXIgc2xfb3AgPSBkYXRhLmVsLmZpbmQoJ29wdGlvblt2YWx1ZT0nICsgdmFsICsgJ10nKTtcbiAgICAgIHZhciBjbHMgPSBzbF9vcC50ZXh0KCk7XG4gICAgICB2YXIgY2ggPSBzbF9vcC5hdHRyKCdjb2RlJyk7XG4gICAgICBpZiAoIWNoKWNoID0gY2xzO1xuICAgICAgaWYgKGRhdGEuaW5kZXggIT09IGZhbHNlKSB7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdW2RhdGEuaW5kZXhdW2RhdGEucGFyYW1dID0gdmFsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5wYXJhbV0gPSB2YWw7XG4gICAgICB9XG5cbiAgICAgIGRhdGEub2JqLnJlbW92ZUNsYXNzKGRhdGEucHJlZml4ICsgZGF0YS5lbC5hdHRyKCd0X3ZhbCcpKTtcbiAgICAgIGRhdGEub2JqLmFkZENsYXNzKGRhdGEucHJlZml4ICsgY2gpO1xuICAgICAgZGF0YS5lbC5hdHRyKCd0X3ZhbCcsIGNoKTtcblxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBlbDogaW5wdXQsXG4gICAgICBvYmo6IGRhdGEub2JqLFxuICAgICAgZ3I6IGRhdGEuZ3IsXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOiBkYXRhLnBhcmFtLFxuICAgICAgcHJlZml4OiBkYXRhLnByZWZpeCB8fCAnJ1xuICAgIH0pKTtcblxuICAgIGlmIChkYXRhLnBhcmVudCkge1xuICAgICAgdmFyIHBhcmVudCA9ICQoJzwnICsgZGF0YS5wYXJlbnQgKyAnLz4nKTtcbiAgICAgIHBhcmVudC5hcHBlbmQoaW5wdXQpO1xuICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIGlucHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoZGF0YSkge1xuICAgIHZhciBhbmltX3NlbCA9IFtdO1xuICAgIHZhciBvdXQ7XG5cbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPlNob3cgYW5pbWF0aW9uPC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBzaG93X2FuaW1hdGlvbnMsXG4gICAgICB2YWxfdHlwZTogMCxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ICdzaG93X2FuaW1hdGlvbicsXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxuICAgIH0pKTtcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPlNob3cgZGVsYXk8L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHNob3dfZGVsYXksXG4gICAgICB2YWxfdHlwZTogMSxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ICdzaG93X2RlbGF5JyxcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XG4gICAgfSkpO1xuXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8YnIvPicpO1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+SGlkZSBhbmltYXRpb248L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IGhpZGVfYW5pbWF0aW9ucyxcbiAgICAgIHZhbF90eXBlOiAwLFxuICAgICAgb2JqOiBkYXRhLm9iaixcbiAgICAgIGdyOiBkYXRhLmdyLFxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTogJ2hpZGVfYW5pbWF0aW9uJyxcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XG4gICAgfSkpO1xuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+SGlkZSBkZWxheTwvc3Bhbj4nKTtcbiAgICB9XG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogaGlkZV9kZWxheSxcbiAgICAgIHZhbF90eXBlOiAxLFxuICAgICAgb2JqOiBkYXRhLm9iaixcbiAgICAgIGdyOiBkYXRhLmdyLFxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTogJ2hpZGVfZGVsYXknLFxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcbiAgICB9KSk7XG5cbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcbiAgICAgIG91dCA9ICQoJzxkaXYgY2xhc3M9XCJhbmltX3NlbFwiLz4nKTtcbiAgICAgIG91dC5hcHBlbmQoYW5pbV9zZWwpO1xuICAgIH1cbiAgICBpZiAoZGF0YS50eXBlID09IDEpIHtcbiAgICAgIG91dCA9IGFuaW1fc2VsO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0X2VkaXRvcigpIHtcbiAgICAkKCcjdzEnKS5yZW1vdmUoKTtcbiAgICAkKCcjdzFfYnV0dG9uJykucmVtb3ZlKCk7XG4gICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gc2xpZGVyX2RhdGFbMF0ubW9iaWxlLnNwbGl0KCc/JylbMF07XG5cbiAgICB2YXIgZWwgPSAkKCcjbWVnYV9zbGlkZXJfY29udHJvbGUnKTtcbiAgICB2YXIgYnRuc19ib3ggPSAkKCc8ZGl2IGNsYXNzPVwiYnRuX2JveFwiLz4nKTtcblxuICAgIGVsLmFwcGVuZCgnPGgyPtCj0L/RgNCw0LLQu9C10L3QuNC1PC9oMj4nKTtcbiAgICBlbC5hcHBlbmQoJCgnPHRleHRhcmVhLz4nLCB7XG4gICAgICB0ZXh0OiBKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSksXG4gICAgICBpZDogJ3NsaWRlX2RhdGEnLFxuICAgICAgbmFtZTogZWRpdG9yXG4gICAgfSkpO1xuXG4gICAgdmFyIGJ0biA9ICQoJzxidXR0b24gY2xhc3M9XCJcIi8+JykudGV4dChcItCQ0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xuICAgIGJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkucmVtb3ZlQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcbiAgICB9KTtcblxuICAgIHZhciBidG4gPSAkKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQlNC10LDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XG4gICAgYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5hZGRDbGFzcygnaGlkZV9zbGlkZScpO1xuICAgIH0pO1xuICAgIGVsLmFwcGVuZChidG5zX2JveCk7XG5cbiAgICBlbC5hcHBlbmQoJzxoMj7QntCx0YnQuNC1INC/0LDRgNCw0LzQtdGC0YDRizwvaDI+Jyk7XG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5tb2JpbGUsXG4gICAgICBsYWJlbDogXCLQodC70LDQudC0INC00LvRjyDRgtC10LvQtdGE0L7QvdCwXCIsXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9ICQodGhpcykudmFsKClcbiAgICAgICAgJCgnLm1vYl9iZycpLmVxKDApLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSArICcpJyk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmZvbixcbiAgICAgIGxhYmVsOiBcItCe0YHQvdC+0L3QvtC5INGE0L7QvVwiLFxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5mb24gPSAkKHRoaXMpLnZhbCgpXG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBzbGlkZXJfZGF0YVswXS5mb24gKyAnKScpXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICB2YXIgYnRuX2NoID0gJCgnPGRpdiBjbGFzcz1cImJ0bnNcIi8+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZCgnPGgzPtCa0L3QvtC/0LrQsCDQv9C10YDQtdGF0L7QtNCwKNC00LvRjyDQn9CaINCy0LXRgNGB0LjQuCk8L2gzPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0LFxuICAgICAgbGFiZWw6IFwi0KLQtdC60YHRglwiLFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApLnRleHQoc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9LFxuICAgIH0pKTtcblxuICAgIHZhciBidXRfc2wgPSAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApO1xuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmLFxuICAgICAgbGFiZWw6IFwi0KHRgdGL0LvQutCwXCIsXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5idXR0b24uaHJlZiA9ICQodGhpcykudmFsKCk7XG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCkuYXR0cignaHJlZicsc2xpZGVyX2RhdGFbMF0uYnV0dG9uLmhyZWYpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9LFxuICAgIH0pKTtcblxuICAgIGJ0bl9jaC5hcHBlbmQoJzxici8+Jyk7XG4gICAgdmFyIHdyYXBfbGFiID0gJCgnPGxhYmVsLz4nKTtcbiAgICBidG5fY2guYXBwZW5kKHdyYXBfbGFiKTtcbiAgICB3cmFwX2xhYi5hcHBlbmQoJzxzcGFuPtCe0YTQvtGA0LzQu9C10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcbiAgICB3cmFwX2xhYi5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IGJ0bl9zdHlsZSxcbiAgICAgIHZhbF90eXBlOiAwLFxuICAgICAgb2JqOiBidXRfc2wsXG4gICAgICBncjogJ2J1dHRvbicsXG4gICAgICBpbmRleDogZmFsc2UsXG4gICAgICBwYXJhbTogJ2NvbG9yJ1xuICAgIH0pKTtcblxuICAgIGJ0bl9jaC5hcHBlbmQoJzxici8+Jyk7XG4gICAgd3JhcF9sYWIgPSAkKCc8bGFiZWwvPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQod3JhcF9sYWIpO1xuICAgIHdyYXBfbGFiLmFwcGVuZCgnPHNwYW4+0J/QvtC70L7QttC10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcbiAgICB3cmFwX2xhYi5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHBvc0FycixcbiAgICAgIHZhbF9saXN0OiBwb3NfbGlzdCxcbiAgICAgIHZhbF90eXBlOiAyLFxuICAgICAgb2JqOiBidXRfc2wucGFyZW50KCkucGFyZW50KCksXG4gICAgICBncjogJ2J1dHRvbicsXG4gICAgICBpbmRleDogZmFsc2UsXG4gICAgICBwYXJhbTogJ3BvcydcbiAgICB9KSk7XG5cbiAgICBidG5fY2guYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcbiAgICAgIHR5cGU6IDAsXG4gICAgICBvYmo6IGJ1dF9zbC5wYXJlbnQoKSxcbiAgICAgIGdyOiAnYnV0dG9uJyxcbiAgICAgIGluZGV4OiBmYWxzZVxuICAgIH0pKTtcbiAgICBlbC5hcHBlbmQoYnRuX2NoKTtcblxuICAgIHZhciBsYXllciA9ICQoJzxkaXYgY2xhc3M9XCJmaXhlZF9sYXllclwiLz4nKTtcbiAgICBsYXllci5hcHBlbmQoJzxoMj7QodGC0LDRgtC40YfQtdGB0LrQuNC1INGB0LvQvtC4PC9oMj4nKTtcbiAgICB2YXIgdGggPSBcIjx0aD7ihJY8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIgK1xuICAgICAgXCI8dGg+0KHQu9C+0Lkg0L3QsCDQstGB0Y4g0LLRi9GB0L7RgtGDPC90aD5cIiArXG4gICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC/0L7Rj9Cy0LvQtdC90LjRjzwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiICtcbiAgICAgIFwiPHRoPtCQ0L3QuNC80LDRhtC40Y8g0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC90aD5cIiArXG4gICAgICBcIjx0aD7Ql9Cw0LTQtdGA0LbQutCwINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XG4gICAgc3RUYWJsZSA9ICQoJzx0YWJsZSBib3JkZXI9XCIxXCI+PHRyPicgKyB0aCArICc8L3RyPjwvdGFibGU+Jyk7XG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbMF0uZml4ZWQ7XG4gICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYWRkVHJTdGF0aWMoZGF0YVtpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxheWVyLmFwcGVuZChzdFRhYmxlKTtcbiAgICB2YXIgYWRkQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xuICAgICAgdGV4dDogXCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcbiAgICB9KTtcbiAgICBhZGRCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGRhdGEgPSBhZGRUclN0YXRpYyhmYWxzZSk7XG4gICAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZGF0YS5lZGl0b3IuZmluZCgnLmZpbGVTZWxlY3QnKSk7XG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXG4gICAgfSkpO1xuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xuICAgIGVsLmFwcGVuZChsYXllcik7XG5cbiAgICB2YXIgbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxheF9sYXllclwiLz4nKTtcbiAgICBsYXllci5hcHBlbmQoJzxoMj7Qn9Cw0YDQsNC70LDQutGBINGB0LvQvtC4PC9oMj4nKTtcbiAgICB2YXIgdGggPSBcIjx0aD7ihJY8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIgK1xuICAgICAgXCI8dGg+0KPQtNCw0LvQtdC90L3QvtGB0YLRjCAo0YbQtdC70L7QtSDQv9C+0LvQvtC20LjRgtC10LvRjNC90L7QtSDRh9C40YHQu9C+KTwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XG5cbiAgICBwYXJhbGF4VGFibGUgPSAkKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nICsgdGggKyAnPC90cj48L3RhYmxlPicpO1xuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICB2YXIgZGF0YSA9IHNsaWRlcl9kYXRhWzBdLnBhcmFsYXg7XG4gICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYWRkVHJQYXJhbGF4KGRhdGFbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXllci5hcHBlbmQocGFyYWxheFRhYmxlKTtcbiAgICB2YXIgYWRkQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xuICAgICAgdGV4dDogXCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcbiAgICB9KTtcbiAgICBhZGRCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGRhdGEgPSBhZGRUclBhcmFsYXgoZmFsc2UpO1xuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxuICAgIH0pKTtcblxuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xuICAgIGVsLmFwcGVuZChsYXllcik7XG5cbiAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWwuZmluZCgnLmZpbGVTZWxlY3QnKSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRUclN0YXRpYyhkYXRhKSB7XG4gICAgdmFyIGkgPSBzdFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoIC0gMTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIGRhdGEgPSB7XG4gICAgICAgIFwiaW1nXCI6IFwiXCIsXG4gICAgICAgIFwiZnVsbF9oZWlnaHRcIjogMCxcbiAgICAgICAgXCJwb3NcIjogMCxcbiAgICAgICAgXCJzaG93X2RlbGF5XCI6IDEsXG4gICAgICAgIFwic2hvd19hbmltYXRpb25cIjogXCJsaWdodFNwZWVkSW5cIixcbiAgICAgICAgXCJoaWRlX2RlbGF5XCI6IDEsXG4gICAgICAgIFwiaGlkZV9hbmltYXRpb25cIjogXCJib3VuY2VPdXRcIlxuICAgICAgfTtcbiAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkLnB1c2goZGF0YSk7XG4gICAgICB2YXIgZml4ID0gJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCcpO1xuICAgICAgYWRkU3RhdGljTGF5ZXIoZGF0YSwgZml4LCB0cnVlKTtcbiAgICB9XG4gICAgO1xuXG4gICAgdmFyIHRyID0gJCgnPHRyLz4nKTtcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBkYXRhLmltZyxcbiAgICAgIGxhYmVsOiBmYWxzZSxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxuICAgICAgYmluZDoge1xuICAgICAgICBncjogJ2ZpeGVkJyxcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcbiAgICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5maW5kKCcuYW5pbWF0aW9uX2xheWVyJyksXG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmlucHV0LnZhbCgpICsgJyknKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uZml4ZWRbZGF0YS5pbmRleF0uaW1nID0gZGF0YS5pbnB1dC52YWwoKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHBvc0FycixcbiAgICAgIHZhbF9saXN0OiBwb3NfbGlzdCxcbiAgICAgIHZhbF90eXBlOiAyLFxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKSxcbiAgICAgIGdyOiAnZml4ZWQnLFxuICAgICAgaW5kZXg6IGksXG4gICAgICBwYXJhbTogJ3BvcycsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogeWVzX25vX3ZhbCxcbiAgICAgIHZhbF9saXN0OiB5ZXNfbm9fYXJyLFxuICAgICAgdmFsX3R5cGU6IDIsXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLFxuICAgICAgZ3I6ICdmaXhlZCcsXG4gICAgICBpbmRleDogaSxcbiAgICAgIHBhcmFtOiAnZnVsbF9oZWlnaHQnLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoe1xuICAgICAgdHlwZTogMSxcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxuICAgICAgZ3I6ICdmaXhlZCcsXG4gICAgICBpbmRleDogaSxcbiAgICAgIHBhcmVudDogJ3RkJ1xuICAgIH0pKTtcbiAgICB2YXIgZGVsQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xuICAgICAgdGV4dDogXCLQo9C00LDQu9C40YLRjFwiXG4gICAgfSk7XG4gICAgZGVsQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMuZWwpO1xuICAgICAgaSA9ICR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKSAtIDE7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcbiAgICAgICR0aGlzLmNsb3Nlc3QoJ3RyJykucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHRgtGA0L7QutGDINCyINGC0LDQsdC70LjRhtC1XG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLmZpeGVkLnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIGVsOiBkZWxCdG4sXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcbiAgICB9KSk7XG4gICAgdmFyIGRlbEJ0blRkID0gJCgnPHRkLz4nKS5hcHBlbmQoZGVsQnRuKTtcbiAgICB0ci5hcHBlbmQoZGVsQnRuVGQpO1xuICAgIHN0VGFibGUuYXBwZW5kKHRyKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVkaXRvcjogdHIsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYWRkVHJQYXJhbGF4KGRhdGEpIHtcbiAgICB2YXIgaSA9IHBhcmFsYXhUYWJsZS5maW5kKCd0cicpLmxlbmd0aCAtIDE7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICBkYXRhID0ge1xuICAgICAgICBcImltZ1wiOiBcIlwiLFxuICAgICAgICBcInpcIjogMVxuICAgICAgfTtcbiAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXgucHVzaChkYXRhKTtcbiAgICAgIHZhciBwYXJhbGF4X2dyID0gJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAnKTtcbiAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKTtcbiAgICB9XG4gICAgO1xuICAgIHZhciB0ciA9ICQoJzx0ci8+Jyk7XG4gICAgdHIuYXBwZW5kKCc8dGQgY2xhc3M9XCJ0ZF9jb3VudGVyXCIvPicpO1xuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogZGF0YS5pbWcsXG4gICAgICBsYWJlbDogZmFsc2UsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcbiAgICAgIGJpbmQ6IHtcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcbiAgICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxuICAgICAgfSxcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbnB1dC52YWwoKSArICcpJyk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0uaW1nID0gZGF0YS5pbnB1dC52YWwoKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHBvc0FycixcbiAgICAgIHZhbF9saXN0OiBwb3NfbGlzdCxcbiAgICAgIHZhbF90eXBlOiAyLFxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxuICAgICAgZ3I6ICdwYXJhbGF4JyxcbiAgICAgIGluZGV4OiBpLFxuICAgICAgcGFyYW06ICdwb3MnLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgICAgc3RhcnRfb3B0aW9uOiAnPG9wdGlvbiB2YWx1ZT1cIlwiIGNvZGU9XCJcIj7QvdCwINCy0LXRgdGMINGN0LrRgNCw0L08L29wdGlvbj4nXG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogZGF0YS56LFxuICAgICAgbGFiZWw6IGZhbHNlLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgICAgYmluZDoge1xuICAgICAgICBpbmRleDogaSxcbiAgICAgICAgcGFyYW06ICdpbWcnLFxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKSxcbiAgICAgIH0sXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgICAgIGRhdGEub2JqLmF0dHIoJ3onLCBkYXRhLmlucHV0LnZhbCgpKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS56ID0gZGF0YS5pbnB1dC52YWwoKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHZhciBkZWxCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XG4gICAgICB0ZXh0OiBcItCj0LTQsNC70LjRgtGMXCJcbiAgICB9KTtcbiAgICBkZWxCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcy5lbCk7XG4gICAgICBpID0gJHRoaXMuY2xvc2VzdCgndHInKS5pbmRleCgpIC0gMTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcbiAgICAgIHRoaXMuc2xpZGVyX2RhdGFbMF0ucGFyYWxheC5zcGxpY2UoaSwgMSk7IC8v0YPQtNCw0LvRj9C10Lwg0LjQtyDQutC+0L3RhNC40LPQsCDRgdC70LDQudC00LBcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBlbDogZGVsQnRuLFxuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXG4gICAgfSkpO1xuICAgIHZhciBkZWxCdG5UZCA9ICQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcbiAgICBwYXJhbGF4VGFibGUuYXBwZW5kKHRyKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVkaXRvcjogdHIsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYWRkX2FuaW1hdGlvbihlbCwgZGF0YSkge1xuICAgIHZhciBvdXQgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAnY2xhc3MnOiAnYW5pbWF0aW9uX2xheWVyJ1xuICAgIH0pO1xuXG4gICAgaWYgKHR5cGVvZihkYXRhLnNob3dfZGVsYXkpICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICBvdXQuYWRkQ2xhc3Moc2hvd19kZWxheVtkYXRhLnNob3dfZGVsYXldKTtcbiAgICAgIGlmIChkYXRhLnNob3dfYW5pbWF0aW9uKSB7XG4gICAgICAgIG91dC5hZGRDbGFzcygnc2xpZGVfJyArIGRhdGEuc2hvd19hbmltYXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YoZGF0YS5oaWRlX2RlbGF5KSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgb3V0LmFkZENsYXNzKGhpZGVfZGVsYXlbZGF0YS5oaWRlX2RlbGF5XSk7XG4gICAgICBpZiAoZGF0YS5oaWRlX2FuaW1hdGlvbikge1xuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycgKyBkYXRhLmhpZGVfYW5pbWF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlbC5hcHBlbmQob3V0KTtcbiAgICByZXR1cm4gZWw7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZV9zbGlkZShkYXRhKSB7XG4gICAgdmFyIHNsaWRlID0gJCgnPGRpdiBjbGFzcz1cInNsaWRlXCIvPicpO1xuXG4gICAgdmFyIG1vYl9iZyA9ICQoJzxhIGNsYXNzPVwibW9iX2JnXCIgaHJlZj1cIicgKyBkYXRhLmJ1dHRvbi5ocmVmICsgJ1wiLz4nKTtcbiAgICBtb2JfYmcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5tb2JpbGUgKyAnKScpXG5cbiAgICBzbGlkZS5hcHBlbmQobW9iX2JnKTtcbiAgICBpZiAobW9iaWxlX21vZGUpIHtcbiAgICAgIHJldHVybiBzbGlkZTtcbiAgICB9XG5cbiAgICAvL9C10YHQu9C4INC10YHRgtGMINGE0L7QvSDRgtC+INC30LDQv9C+0LvQvdGP0LXQvFxuICAgIGlmIChkYXRhLmZvbikge1xuICAgICAgc2xpZGUuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5mb24gKyAnKScpXG4gICAgfVxuXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxuICAgIGlmIChkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBwYXJhbGF4X2dyID0gJCgnPGRpdiBjbGFzcz1cInBhcmFsbGF4X19ncm91cFwiLz4nKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5wYXJhbGF4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLnBhcmFsYXhbaV0sIHBhcmFsYXhfZ3IpXG4gICAgICB9XG4gICAgICBzbGlkZS5hcHBlbmQocGFyYWxheF9ncilcbiAgICB9XG5cbiAgICB2YXIgZml4ID0gJCgnPGRpdiBjbGFzcz1cImZpeGVkX2dyb3VwXCIvPicpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xuICAgICAgYWRkU3RhdGljTGF5ZXIoZGF0YS5maXhlZFtpXSwgZml4KVxuICAgIH1cblxuICAgIHZhciBkb3BfYmxrID0gJChcIjxkaXYgY2xhc3M9J2ZpeGVkX19sYXllcicvPlwiKTtcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLmJ1dHRvbi5wb3NdKTtcbiAgICB2YXIgYnV0ID0gJChcIjxhIGNsYXNzPSdzbGlkZXJfX2hyZWYnLz5cIik7XG4gICAgYnV0LmF0dHIoJ2hyZWYnLCBkYXRhLmJ1dHRvbi5ocmVmKTtcbiAgICBidXQudGV4dChkYXRhLmJ1dHRvbi50ZXh0KTtcbiAgICBidXQuYWRkQ2xhc3MoZGF0YS5idXR0b24uY29sb3IpO1xuICAgIGRvcF9ibGsgPSBhZGRfYW5pbWF0aW9uKGRvcF9ibGssIGRhdGEuYnV0dG9uKTtcbiAgICBkb3BfYmxrLmZpbmQoJ2RpdicpLmFwcGVuZChidXQpO1xuICAgIGZpeC5hcHBlbmQoZG9wX2Jsayk7XG5cbiAgICBzbGlkZS5hcHBlbmQoZml4KTtcbiAgICByZXR1cm4gc2xpZGU7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRQYXJhbGF4TGF5ZXIoZGF0YSwgcGFyYWxheF9ncikge1xuICAgIHZhciBwYXJhbGxheF9sYXllciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fbGF5ZXJcIlxcPicpO1xuICAgIHBhcmFsbGF4X2xheWVyLmF0dHIoJ3onLCBkYXRhLnogfHwgaSAqIDEwKTtcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8c3BhbiBjbGFzcz0nc2xpZGVyX190ZXh0Jy8+XCIpO1xuICAgIGlmIChkYXRhLnBvcykge1xuICAgICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcbiAgICB9XG4gICAgZG9wX2Jsay5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XG4gICAgcGFyYWxsYXhfbGF5ZXIuYXBwZW5kKGRvcF9ibGspO1xuICAgIHBhcmFsYXhfZ3IuYXBwZW5kKHBhcmFsbGF4X2xheWVyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCwgYmVmb3JfYnV0dG9uKSB7XG4gICAgdmFyIGRvcF9ibGsgPSAkKFwiPGRpdiBjbGFzcz0nZml4ZWRfX2xheWVyJy8+XCIpO1xuICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XG4gICAgaWYgKGRhdGEuZnVsbF9oZWlnaHQpIHtcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MoJ2ZpeGVkX19mdWxsLWhlaWdodCcpO1xuICAgIH1cbiAgICBkb3BfYmxrID0gYWRkX2FuaW1hdGlvbihkb3BfYmxrLCBkYXRhKTtcbiAgICBkb3BfYmxrLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XG5cbiAgICBpZiAoYmVmb3JfYnV0dG9uKSB7XG4gICAgICBmaXguZmluZCgnLnNsaWRlcl9faHJlZicpLmNsb3Nlc3QoJy5maXhlZF9fbGF5ZXInKS5iZWZvcmUoZG9wX2JsaylcbiAgICB9IGVsc2Uge1xuICAgICAgZml4LmFwcGVuZChkb3BfYmxrKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5leHRfc2xpZGUoKSB7XG4gICAgaWYgKCQoJyNtZWdhX3NsaWRlcicpLmhhc0NsYXNzKCdzdG9wX3NsaWRlJykpcmV0dXJuO1xuXG4gICAgdmFyIHNsaWRlX3BvaW50cyA9ICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZV9zZWxlY3QnKVxuICAgIHZhciBzbGlkZV9jbnQgPSBzbGlkZV9wb2ludHMubGVuZ3RoO1xuICAgIHZhciBhY3RpdmUgPSAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVyLWFjdGl2ZScpLmluZGV4KCkgKyAxO1xuICAgIGlmIChhY3RpdmUgPj0gc2xpZGVfY250KWFjdGl2ZSA9IDA7XG4gICAgc2xpZGVfcG9pbnRzLmVxKGFjdGl2ZSkuY2xpY2soKTtcblxuICAgIHRpbWVvdXRJZD1zZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW1nX3RvX2xvYWQoc3JjKSB7XG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xuICAgIGltZy5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xuXG4gICAgICBpZiAodG90X2ltZ193YWl0ID09IDApIHtcblxuICAgICAgICBzbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dKSk7XG4gICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcShyZW5kZXJfc2xpZGVfbm9tKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblxuICAgICAgICBpZiAocmVuZGVyX3NsaWRlX25vbSA9PSAwKSB7XG4gICAgICAgICAgc2xpZGVzLmZpbmQoJy5zbGlkZScpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2ZpcnN0X3Nob3cnKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG5cbiAgICAgICAgICBpZiAoIWVkaXRvcikge1xuICAgICAgICAgICAgaWYodGltZW91dElkKWNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgdGltZW91dElkPXNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5maXJzdF9zaG93JykucmVtb3ZlQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcbiAgICAgICAgICAgIH0uYmluZChzbGlkZXMpLCBzY3JvbGxfcGVyaW9kKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9iaWxlX21vZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcbiAgICAgICAgICAgIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xuICAgICAgICAgICAgcGFyYWxsYXhfdGltZXIgPSBzZXRJbnRlcnZhbChyZW5kZXIsIDEwMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGVkaXRvcikge1xuICAgICAgICAgICAgaW5pdF9lZGl0b3IoKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZih0aW1lb3V0SWQpY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xuXG4gICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCcpLm9uKCdjbGljaycsICcuc2xpZGVfc2VsZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKSlyZXR1cm47XG5cbiAgICAgICAgICAgICAgdmFyIGluZGV4ID0gJHRoaXMuaW5kZXgoKTtcbiAgICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuXG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGUuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGUnKS5lcShpbmRleCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcblxuICAgICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5ob3ZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGlmKHRpbWVvdXRJZCljbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuYWRkQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykucmVtb3ZlQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlbmRlcl9zbGlkZV9ub20rKztcbiAgICAgICAgaWYgKHJlbmRlcl9zbGlkZV9ub20gPCBzbGlkZXJfZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICBsb2FkX3NsaWRlX2ltZygpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5vbignZXJyb3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0b3RfaW1nX3dhaXQtLTtcbiAgICB9KTtcbiAgICBpbWcucHJvcCgnc3JjJywgc3JjKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRfc2xpZGVfaW1nKCkge1xuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbcmVuZGVyX3NsaWRlX25vbV07XG4gICAgdG90X2ltZ193YWl0ID0gMTtcblxuICAgIGlmIChtb2JpbGVfbW9kZSA9PT0gZmFsc2UpIHtcbiAgICAgIHRvdF9pbWdfd2FpdCsrO1xuICAgICAgaW1nX3RvX2xvYWQoZGF0YS5mb24pO1xuICAgICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxuICAgICAgaWYgKGRhdGEucGFyYWxheCAmJiBkYXRhLnBhcmFsYXgubGVuZ3RoID4gMCkge1xuICAgICAgICB0b3RfaW1nX3dhaXQgKz0gZGF0YS5wYXJhbGF4Lmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnBhcmFsYXgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpbWdfdG9fbG9hZChkYXRhLnBhcmFsYXhbaV0uaW1nKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZGF0YS5maXhlZCAmJiBkYXRhLmZpeGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEuZml4ZWQubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuZml4ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpbWdfdG9fbG9hZChkYXRhLmZpeGVkW2ldLmltZylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGltZ190b19sb2FkKGRhdGEubW9iaWxlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0X2luaXRfc2xpZGUoZGF0YSkge1xuICAgIHZhciBuID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xuICAgIGltZy5hdHRyKCd0aW1lJywgbik7XG5cbiAgICBmdW5jdGlvbiBvbl9pbWdfbG9hZCgpIHtcbiAgICAgIHZhciBuID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBpbWcgPSAkKHRoaXMpO1xuICAgICAgbiA9IG4gLSBwYXJzZUludChpbWcuYXR0cigndGltZScpKTtcbiAgICAgIGlmIChuID4gbWF4X3RpbWVfbG9hZF9waWMpIHtcbiAgICAgICAgbW9iaWxlX21vZGUgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG1heF9zaXplID0gKHNjcmVlbi5oZWlnaHQgPiBzY3JlZW4ud2lkdGggPyBzY3JlZW4uaGVpZ2h0IDogc2NyZWVuLndpZHRoKTtcbiAgICAgICAgaWYgKG1heF9zaXplIDwgbW9iaWxlX3NpemUpIHtcbiAgICAgICAgICBtb2JpbGVfbW9kZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9iaWxlX21vZGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1vYmlsZV9tb2RlID09IHRydWUpIHtcbiAgICAgICAgJChjb250YWluZXJfaWQpLmFkZENsYXNzKCdtb2JpbGVfbW9kZScpXG4gICAgICB9XG4gICAgICByZW5kZXJfc2xpZGVfbm9tID0gMDtcbiAgICAgIGxvYWRfc2xpZGVfaW1nKCk7XG4gICAgICAkKCcuc2stZm9sZGluZy1jdWJlJykucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIGltZy5vbignbG9hZCcsIG9uX2ltZ19sb2FkKCkpO1xuICAgIGlmIChzbGlkZXJfZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnP3I9JyArIE1hdGgucmFuZG9tKCk7XG4gICAgICBpbWcucHJvcCgnc3JjJywgc2xpZGVyX2RhdGFbMF0ubW9iaWxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb25faW1nX2xvYWQoKS5iaW5kKGltZyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdChkYXRhLCBlZGl0b3JfaW5pdCkge1xuICAgIHNsaWRlcl9kYXRhID0gZGF0YTtcbiAgICBlZGl0b3IgPSBlZGl0b3JfaW5pdDtcbiAgICAvL9C90LDRhdC+0LTQuNC8INC60L7QvdGC0LXQudC90LXRgCDQuCDQvtGH0LjRidCw0LXQvCDQtdCz0L5cbiAgICB2YXIgY29udGFpbmVyID0gJChjb250YWluZXJfaWQpO1xuICAgIGNvbnRhaW5lci5odG1sKCcnKTtcblxuICAgIC8v0YHQvtC30LbQsNC10Lwg0LHQsNC30L7QstGL0LUg0LrQvtC90YLQtdC50L3QtdGA0Ysg0LTQu9GPINGB0LDQvNC40YUg0YHQu9Cw0LnQtNC+0LIg0Lgg0LTQu9GPINC/0LXRgNC10LrQu9GO0YfQsNGC0LXQu9C10LlcbiAgICBzbGlkZXMgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAnY2xhc3MnOiAnc2xpZGVzJ1xuICAgIH0pO1xuICAgIHZhciBzbGlkZV9jb250cm9sID0gJCgnPGRpdi8+Jywge1xuICAgICAgJ2NsYXNzJzogJ3NsaWRlX2NvbnRyb2wnXG4gICAgfSk7XG4gICAgc2xpZGVfc2VsZWN0X2JveCA9ICQoJzx1bC8+Jywge1xuICAgICAgJ2NsYXNzJzogJ3NsaWRlX3NlbGVjdF9ib3gnXG4gICAgfSk7XG5cbiAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQuNC90LTQuNC60LDRgtC+0YAg0LfQsNCz0YDRg9C30LrQuFxuICAgIHZhciBsID0gJzxkaXYgY2xhc3M9XCJzay1mb2xkaW5nLWN1YmVcIj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTEgc2stY3ViZVwiPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMiBzay1jdWJlXCI+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmU0IHNrLWN1YmVcIj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTMgc2stY3ViZVwiPjwvZGl2PicgK1xuICAgICAgJzwvZGl2Pic7XG4gICAgY29udGFpbmVyLmh0bWwobCk7XG5cblxuICAgIHN0YXJ0X2luaXRfc2xpZGUoZGF0YVswXSk7XG5cbiAgICAvL9Cz0LXQvdC10YDQuNGA0YPQtdC8INC60L3QvtC/0LrQuCDQuCDRgdC70LDQudC00YtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vc2xpZGVzLmFwcGVuZChnZW5lcmF0ZV9zbGlkZShkYXRhW2ldKSk7XG4gICAgICBzbGlkZV9zZWxlY3RfYm94LmFwcGVuZCgnPGxpIGNsYXNzPVwic2xpZGVfc2VsZWN0IGRpc2FibGVkXCIvPicpXG4gICAgfVxuXG4gICAgLypzbGlkZXMuZmluZCgnLnNsaWRlJykuZXEoMClcbiAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJylcbiAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93Jyk7XG4gICAgIHNsaWRlX2NvbnRyb2wuZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpOyovXG5cbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlcyk7XG4gICAgc2xpZGVfY29udHJvbC5hcHBlbmQoc2xpZGVfc2VsZWN0X2JveCk7XG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZV9jb250cm9sKTtcblxuXG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgaWYgKCFwYXJhbGxheF9ncm91cClyZXR1cm4gZmFsc2U7XG4gICAgdmFyIHBhcmFsbGF4X2sgPSAocGFyYWxsYXhfY291bnRlciAtIDEwKSAvIDI7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFsbGF4X2dyb3VwLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZWwgPSBwYXJhbGxheF9ncm91cC5lcShpKTtcbiAgICAgIHZhciBqID0gZWwuYXR0cigneicpO1xuICAgICAgdmFyIHRyID0gJ3JvdGF0ZTNkKDAuMSwwLjgsMCwnICsgKHBhcmFsbGF4X2spICsgJ2RlZykgc2NhbGUoJyArICgxICsgaiAqIDAuNSkgKyAnKSB0cmFuc2xhdGVaKC0nICsgKDEwICsgaiAqIDIwKSArICdweCknO1xuICAgICAgZWwuY3NzKCd0cmFuc2Zvcm0nLCB0cilcbiAgICB9XG4gICAgcGFyYWxsYXhfY291bnRlciArPSBwYXJhbGxheF9kICogMC4xO1xuICAgIGlmIChwYXJhbGxheF9jb3VudGVyID49IDIwKXBhcmFsbGF4X2QgPSAtcGFyYWxsYXhfZDtcbiAgICBpZiAocGFyYWxsYXhfY291bnRlciA8PSAwKXBhcmFsbGF4X2QgPSAtcGFyYWxsYXhfZDtcbiAgfVxuXG4gIGluaXRJbWFnZVNlcnZlclNlbGVjdCgkKCcuZmlsZVNlbGVjdCcpKTtcblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcbn0oKSk7XG4iLCJ2YXIgaGVhZGVyQWN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuICB2YXIgc2hhZG93ZWREb3duID0gZmFsc2U7XG5cbiAgJCgnLm1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgICQoJy5kcm9wLW1lbnUnKS5yZW1vdmVDbGFzcygnb3BlbicpLnJlbW92ZUNsYXNzKCdjbG9zZScpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICBpZiAoJCgnLmhlYWRlcicpLmhhc0NsYXNzKCdoZWFkZXJfb3Blbi1tZW51JykpIHtcbiAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJCgnLnNlYXJjaC10b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgJCgnLmhlYWRlcicpLnRvZ2dsZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcbiAgICAkKCcjYXV0b2NvbXBsZXRlJykuZmFkZU91dCgpO1xuICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpKSB7XG4gICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoJyNoZWFkZXInKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlLnRhcmdldC5pZCA9PSAnaGVhZGVyJykge1xuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJ2Zvcm0nKS5zdWJtaXQoKTtcbiAgfSk7XG5cbiAgJCgnLmhlYWRlci1zZWNvbmRsaW5lX2Nsb3NlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICB9KTtcblxuICAkKCcuaGVhZGVyLXVwbGluZScpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmICghc2Nyb2xsZWREb3duKXJldHVybjtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCAxMDI0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oJ2xvYWQgcmVzaXplIHNjcm9sbCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2hhZG93SGVpZ2h0ID0gNTA7XG4gICAgdmFyIGhpZGVIZWlnaHQgPSAyMDA7XG4gICAgdmFyIGhlYWRlclNlY29uZExpbmUgPSAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKTtcbiAgICB2YXIgaG92ZXJzID0gaGVhZGVyU2Vjb25kTGluZS5maW5kKCc6aG92ZXInKTtcbiAgICB2YXIgaGVhZGVyID0gJCgnLmhlYWRlcicpO1xuXG4gICAgaWYgKCFob3ZlcnMubGVuZ3RoKSB7XG4gICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgICBoZWFkZXIucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcbiAgICAgIC8vZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuICAgICAgdmFyIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgIGlmIChzY3JvbGxUb3AgPiBzaGFkb3dIZWlnaHQgJiYgc2hhZG93ZWREb3duID09PSBmYWxzZSkge1xuICAgICAgICBzaGFkb3dlZERvd24gPSB0cnVlO1xuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzaGFkb3dlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKHNjcm9sbFRvcCA8PSBzaGFkb3dIZWlnaHQgJiYgc2hhZG93ZWREb3duID09PSB0cnVlKSB7XG4gICAgICAgIHNoYWRvd2VkRG93biA9IGZhbHNlO1xuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzaGFkb3dlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKHNjcm9sbFRvcCA+IGhpZGVIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSBmYWxzZSkge1xuICAgICAgICBzY3JvbGxlZERvd24gPSB0cnVlO1xuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzY3JvbGwtZG93bicpO1xuICAgICAgfVxuICAgICAgaWYgKHNjcm9sbFRvcCA8PSBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xuICAgICAgaGVhZGVyLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgfVxuICB9KTtcblxuICAkKCcubWVudV9hbmdsZS1kb3duLCAuZHJvcC1tZW51X2dyb3VwX191cC1oZWFkZXInKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIHZhciBtZW51T3BlbiA9ICQodGhpcykuY2xvc2VzdCgnLmhlYWRlcl9vcGVuLW1lbnUsIC5jYXRhbG9nLWNhdGVnb3JpZXMnKTtcbiAgICBpZiAoIW1lbnVPcGVuLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgcGFyZW50ID0gJCh0aGlzKS5jbG9zZXN0KCcuZHJvcC1tZW51X2dyb3VwX191cCwgLm1lbnUtZ3JvdXAnKTtcbiAgICB2YXIgcGFyZW50TWVudSA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudScpO1xuICAgIGlmIChwYXJlbnRNZW51KSB7XG4gICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICB9XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAkKHBhcmVudCkudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgICAgIGlmIChwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgICAkKHBhcmVudCkucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLmFkZENsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gIHZhciBhY2NvdW50TWVudVRpbWVPdXQgPSBudWxsO1xuICB2YXIgYWNjb3VudE1lbnVPcGVuVGltZSA9IDA7XG4gIHZhciBhY2NvdW50TWVudSA9ICQoJy5hY2NvdW50LW1lbnUnKTtcblxuICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IDEwMjQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xuICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcblxuICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcblxuICAgIGlmIChhY2NvdW50TWVudS5oYXNDbGFzcygnaGlkZGVuJykpIHtcbiAgICAgIG1lbnVBY2NvdW50VXAodGhhdCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhhdC5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgYWNjb3VudE1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgIH1cblxuICB9KTtcblxuICAvL9C/0L7QutCw0Lcg0LzQtdC90Y4g0LDQutC60LDRg9C90YJcbiAgZnVuY3Rpb24gbWVudUFjY291bnRVcCh0b2dnbGVCdXR0b24pIHtcbiAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XG4gICAgdG9nZ2xlQnV0dG9uLmFkZENsYXNzKCdvcGVuJyk7XG4gICAgYWNjb3VudE1lbnUucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSAxMDI0KSB7XG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XG4gICAgfVxuXG4gICAgYWNjb3VudE1lbnVPcGVuVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgYWNjb3VudE1lbnVUaW1lT3V0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gMTAyNCkge1xuICAgICAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XG4gICAgICB9XG4gICAgICBpZiAoKG5ldyBEYXRlKCkgLSBhY2NvdW50TWVudU9wZW5UaW1lKSA+IDEwMDAgKiA3KSB7XG4gICAgICAgIGFjY291bnRNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgdG9nZ2xlQnV0dG9uLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcbiAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgICAgfVxuXG4gICAgfSwgMTAwMCk7XG4gIH1cblxuICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzLWFjY291bnRfbWVudS1oZWFkZXInKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKCkge1xuICAgIGFjY291bnRNZW51T3BlblRpbWUgPSBuZXcgRGF0ZSgpO1xuICB9KTtcbiAgJCgnLmFjY291bnQtbWVudScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCdhY2NvdW50LW1lbnUnKSkge1xuICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgIH1cbiAgfSk7XG59KCk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gcGFyc2VOdW0oc3RyKSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoXG4gICAgICBTdHJpbmcoc3RyKVxuICAgICAgICAucmVwbGFjZSgnLCcsICcuJylcbiAgICAgICAgLm1hdGNoKC8tP1xcZCsoPzpcXC5cXGQrKT8vZywgJycpIHx8IDBcbiAgICAgICwgMTBcbiAgICApO1xuICB9XG5cbiAgJCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKS5maW5kKCdzZWxlY3QsaW5wdXQnKS5vbignY2hhbmdlIGtleXVwIGNsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGhpcyA9ICQodGhpcykuY2xvc2VzdCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKTtcbiAgICB2YXIgY3VycyA9IHBhcnNlTnVtKCR0aGlzLmZpbmQoJ3NlbGVjdCcpLnZhbCgpKTtcbiAgICB2YXIgdmFsID0gJHRoaXMuZmluZCgnaW5wdXQnKS52YWwoKTtcbiAgICBpZiAocGFyc2VOdW0odmFsKSAhPSB2YWwpIHtcbiAgICAgIHZhbCA9ICR0aGlzLmZpbmQoJ2lucHV0JykudmFsKHBhcnNlTnVtKHZhbCkpO1xuICAgIH1cbiAgICB2YWwgPSBwYXJzZU51bSh2YWwpO1xuXG4gICAgdmFyIGtvZWYgPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2snKS50cmltKCk7XG4gICAgdmFyIHByb21vID0gJHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLXByb21vJykudHJpbSgpO1xuICAgIHZhciBjdXJyZW5jeSA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1jdXJyZW5jeScpLnRyaW0oKTtcbiAgICB2YXIgcmVzdWx0ID0gMDtcbiAgICB2YXIgb3V0ID0gMDtcblxuICAgIGlmIChrb2VmID09IHByb21vKSB7XG4gICAgICBwcm9tbyA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGtvZWYuaW5kZXhPZignJScpID4gMCkge1xuICAgICAgcmVzdWx0ID0gcGFyc2VOdW0oa29lZikgKiB2YWwgKiBjdXJzIC8gMTAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJzID0gcGFyc2VOdW0oJHRoaXMuZmluZCgnW2NvZGU9JyArIGN1cnJlbmN5ICsgJ10nKS52YWwoKSk7XG4gICAgICByZXN1bHQgPSBwYXJzZU51bShrb2VmKSAqIGN1cnNcbiAgICB9XG5cbiAgICBpZiAocGFyc2VOdW0ocHJvbW8pID4gMCkge1xuICAgICAgaWYgKHByb21vLmluZGV4T2YoJyUnKSA+IDApIHtcbiAgICAgICAgcHJvbW8gPSBwYXJzZU51bShwcm9tbykgKiB2YWwgKiBjdXJzIC8gMTAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbW8gPSBwYXJzZU51bShwcm9tbykgKiBjdXJzXG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9tbyA+IDApIHtcbiAgICAgICAgb3V0ID0gXCI8c3BhbiBjbGFzcz1vbGRfcHJpY2U+XCIgKyByZXN1bHQudG9GaXhlZCgyKSArIFwiPC9zcGFuPiBcIiArIHByb21vLnRvRml4ZWQoMik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXQgPSByZXN1bHQudG9GaXhlZCgyKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gcmVzdWx0LnRvRml4ZWQoMik7XG4gICAgfVxuXG5cbiAgICAkdGhpcy5maW5kKCcuY2FsYy1yZXN1bHRfdmFsdWUnKS5odG1sKG91dClcbiAgfSkuY2xpY2soKVxufSk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICB2YXIgZWxzID0gJCgnLmF1dG9faGlkZV9jb250cm9sJyk7XG4gIGlmIChlbHMubGVuZ3RoID09IDApcmV0dXJuO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiLnNjcm9sbF9ib3gtc2hvd19tb3JlXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgYnV0dG9uWWVzOiBmYWxzZSxcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfd2hpdGUgbm90aWZ5X25vdF9iaWdcIlxuICAgIH07XG5cbiAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgdmFyIGNvbnRlbnQgPSAkdGhpcy5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtJykuY2xvbmUoKTtcbiAgICBjb250ZW50ID0gY29udGVudFswXTtcbiAgICBjb250ZW50LmNsYXNzTmFtZSArPSAnIHNjcm9sbF9ib3gtaXRlbS1tb2RhbCc7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5jbGFzc05hbWUgPSAnY29tbWVudHMnO1xuICAgIGRpdi5hcHBlbmQoY29udGVudCk7XG4gICAgJChkaXYpLmZpbmQoJy5zY3JvbGxfYm94LXNob3dfbW9yZScpLnJlbW92ZSgpO1xuICAgICQoZGl2KS5maW5kKCcubWF4X3RleHRfaGlkZScpXG4gICAgICAucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUteDInKVxuICAgICAgLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlJyk7XG4gICAgZGF0YS5xdWVzdGlvbiA9IGRpdi5vdXRlckhUTUw7XG5cbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhc1Njcm9sbChlbCkge1xuICAgIGlmICghZWwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGVsLnNjcm9sbEhlaWdodCA+IGVsLmNsaWVudEhlaWdodDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYnVpbGQoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbCA9IGVscy5lcShpKTtcbiAgICAgIHZhciBpc19oaWRlID0gZmFsc2U7XG4gICAgICBpZiAoZWwuaGVpZ2h0KCkgPCAxMCkge1xuICAgICAgICBpc19oaWRlID0gdHJ1ZTtcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuc2hvdygwKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRleHQgPSBlbC5maW5kKCcuc2Nyb2xsX2JveC10ZXh0Jyk7XG4gICAgICB2YXIgYW5zd2VyID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtYW5zd2VyJyk7XG4gICAgICB2YXIgc2hvd19tb3JlID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtc2hvd19tb3JlJyk7XG5cbiAgICAgIHZhciBzaG93X2J0biA9IGZhbHNlO1xuICAgICAgaWYgKGhhc1Njcm9sbCh0ZXh0WzBdKSkge1xuICAgICAgICBzaG93X2J0biA9IHRydWU7XG4gICAgICAgIHRleHQucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dC5hZGRDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChhbnN3ZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAvL9C10YHRgtGMINC+0YLQstC10YIg0LDQtNC80LjQvdCwXG4gICAgICAgIGlmIChoYXNTY3JvbGwoYW5zd2VyWzBdKSkge1xuICAgICAgICAgIHNob3dfYnRuID0gdHJ1ZTtcbiAgICAgICAgICBhbnN3ZXIucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFuc3dlci5hZGRDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNob3dfYnRuKSB7XG4gICAgICAgIHNob3dfbW9yZS5zaG93KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaG93X21vcmUuaGlkZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNfaGlkZSkge1xuICAgICAgICBlbC5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtLWhpZGUnKS5oaWRlKDApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gICQod2luZG93KS5yZXNpemUocmVidWlsZCk7XG4gIHJlYnVpbGQoKTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5zaG93X2FsbCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBjbHMgPSAkKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XG4gICAgJCgnLmhpZGVfYWxsW2RhdGEtY250cmwtY2xhc3NdJykuc2hvdygpO1xuICAgICQodGhpcykuaGlkZSgpO1xuICAgICQoJy4nICsgY2xzKS5zaG93KCk7XG4gIH0pO1xuXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmhpZGVfYWxsJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGNscyA9ICQodGhpcykuZGF0YSgnY250cmwtY2xhc3MnKTtcbiAgICAkKCcuc2hvd19hbGxbZGF0YS1jbnRybC1jbGFzc10nKS5zaG93KCk7XG4gICAgJCh0aGlzKS5oaWRlKCk7XG4gICAgJCgnLicgKyBjbHMpLmhpZGUoKTtcbiAgfSk7XG59KSgpO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBkZWNsT2ZOdW0obnVtYmVyLCB0aXRsZXMpIHtcbiAgICBjYXNlcyA9IFsyLCAwLCAxLCAxLCAxLCAyXTtcbiAgICByZXR1cm4gdGl0bGVzWyhudW1iZXIgJSAxMDAgPiA0ICYmIG51bWJlciAlIDEwMCA8IDIwKSA/IDIgOiBjYXNlc1sobnVtYmVyICUgMTAgPCA1KSA/IG51bWJlciAlIDEwIDogNV1dO1xuICB9XG5cbiAgZnVuY3Rpb24gZmlyc3RaZXJvKHYpIHtcbiAgICB2ID0gTWF0aC5mbG9vcih2KTtcbiAgICBpZiAodiA8IDEwKVxuICAgICAgcmV0dXJuICcwJyArIHY7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHY7XG4gIH1cblxuICB2YXIgY2xvY2tzID0gJCgnLmNsb2NrJyk7XG4gIGlmIChjbG9ja3MubGVuZ3RoID4gMCkge1xuICAgIGZ1bmN0aW9uIHVwZGF0ZUNsb2NrKCkge1xuICAgICAgdmFyIGNsb2NrcyA9ICQodGhpcyk7XG4gICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjID0gY2xvY2tzLmVxKGkpO1xuICAgICAgICB2YXIgZW5kID0gbmV3IERhdGUoYy5kYXRhKCdlbmQnKS5yZXBsYWNlKC8tL2csIFwiL1wiKSk7XG4gICAgICAgIHZhciBkID0gKGVuZC5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XG5cbiAgICAgICAgLy/QtdGB0LvQuCDRgdGA0L7QuiDQv9GA0L7RiNC10LtcbiAgICAgICAgaWYgKGQgPD0gMCkge1xuICAgICAgICAgIGMudGV4dChsZyhcInByb21vY29kZV9leHBpcmVzXCIpKTtcbiAgICAgICAgICBjLmFkZENsYXNzKCdjbG9jay1leHBpcmVkJyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL9C10YHQu9C4INGB0YDQvtC6INCx0L7Qu9C10LUgMzAg0LTQvdC10LlcbiAgICAgICAgaWYgKGQgPiAzMCAqIDYwICogNjAgKiAyNCkge1xuICAgICAgICAgIGMuaHRtbChsZyggXCJwcm9tb2NvZGVfbGVmdF8zMF9kYXlzXCIpKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzID0gZCAlIDYwO1xuICAgICAgICBkID0gKGQgLSBzKSAvIDYwO1xuICAgICAgICB2YXIgbSA9IGQgJSA2MDtcbiAgICAgICAgZCA9IChkIC0gbSkgLyA2MDtcbiAgICAgICAgdmFyIGggPSBkICUgMjQ7XG4gICAgICAgIGQgPSAoZCAtIGgpIC8gMjQ7XG5cbiAgICAgICAgdmFyIHN0ciA9IGZpcnN0WmVybyhoKSArIFwiOlwiICsgZmlyc3RaZXJvKG0pICsgXCI6XCIgKyBmaXJzdFplcm8ocyk7XG4gICAgICAgIGlmIChkID4gMCkge1xuICAgICAgICAgIHN0ciA9IGQgKyBcIiBcIiArIGRlY2xPZk51bShkLCBbbGcoXCJkYXlfY2FzZV8wXCIpLCBsZyhcImRheV9jYXNlXzFcIiksIGxnKFwiZGF5X2Nhc2VfMlwiKV0pICsgXCIgIFwiICsgc3RyO1xuICAgICAgICB9XG4gICAgICAgIGMuaHRtbChcItCe0YHRgtCw0LvQvtGB0Yw6IDxzcGFuPlwiICsgc3RyICsgXCI8L3NwYW4+XCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNldEludGVydmFsKHVwZGF0ZUNsb2NrLmJpbmQoY2xvY2tzKSwgMTAwMCk7XG4gICAgdXBkYXRlQ2xvY2suYmluZChjbG9ja3MpKCk7XG4gIH1cbn0pO1xuIiwidmFyIGNhdGFsb2dUeXBlU3dpdGNoZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjYXRhbG9nID0gJCgnLmNhdGFsb2dfbGlzdCcpO1xuICBpZiAoY2F0YWxvZy5sZW5ndGggPT0gMClyZXR1cm47XG5cbiAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLmZpbmQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbicpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XG4gICAgJCh0aGlzKS5hZGRDbGFzcygnY2hlY2tlZCcpO1xuICAgIGlmIChjYXRhbG9nKSB7XG4gICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykpIHtcbiAgICAgICAgY2F0YWxvZy5yZW1vdmVDbGFzcygnbmFycm93Jyk7XG4gICAgICAgIHNldENvb2tpZSgnY291cG9uc192aWV3JywgJycpXG4gICAgICB9XG4gICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1uYXJyb3cnKSkge1xuICAgICAgICBjYXRhbG9nLmFkZENsYXNzKCduYXJyb3cnKTtcbiAgICAgICAgc2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnLCAnbmFycm93Jyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAoZ2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnKSA9PSAnbmFycm93JyAmJiAhY2F0YWxvZy5oYXNDbGFzcygnbmFycm93X29mZicpKSB7XG4gICAgY2F0YWxvZy5hZGRDbGFzcygnbmFycm93Jyk7XG4gICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbmFycm93JykuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcbiAgICAkKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykucmVtb3ZlQ2xhc3MoJ2NoZWNrZWQnKTtcbiAgfVxufSgpO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gICQoJy5zZC1zZWxlY3Qtc2VsZWN0ZWQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBhcmVudCA9ICQodGhpcykucGFyZW50KCk7XG4gICAgdmFyIGRyb3BCbG9jayA9ICQocGFyZW50KS5maW5kKCcuc2Qtc2VsZWN0LWRyb3AnKTtcblxuICAgIGlmIChkcm9wQmxvY2suaXMoJzpoaWRkZW4nKSkge1xuICAgICAgZHJvcEJsb2NrLnNsaWRlRG93bigpO1xuXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuICAgICAgaWYgKCFwYXJlbnQuaGFzQ2xhc3MoJ2xpbmtlZCcpKSB7XG5cbiAgICAgICAgJCgnLnNkLXNlbGVjdC1kcm9wJykuZmluZCgnYScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdmFyIHNlbGVjdFJlc3VsdCA9ICQodGhpcykuaHRtbCgpO1xuXG4gICAgICAgICAgJChwYXJlbnQpLmZpbmQoJ2lucHV0JykudmFsKHNlbGVjdFJlc3VsdCk7XG5cbiAgICAgICAgICAkKHBhcmVudCkuZmluZCgnLnNkLXNlbGVjdC1zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5odG1sKHNlbGVjdFJlc3VsdCk7XG5cbiAgICAgICAgICBkcm9wQmxvY2suc2xpZGVVcCgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbn0pO1xuIiwic2VhcmNoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3BlbkF1dG9jb21wbGV0ZTtcblxuICAkKCcuc2VhcmNoLWZvcm0taW5wdXQnKS5vbignaW5wdXQnLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgdmFyIHF1ZXJ5ID0gJHRoaXMudmFsKCk7XG4gICAgdmFyIGRhdGEgPSAkdGhpcy5jbG9zZXN0KCdmb3JtJykuc2VyaWFsaXplKCk7XG4gICAgdmFyIGF1dG9jb21wbGV0ZSA9ICR0aGlzLmNsb3Nlc3QoJy5zdG9yZXNfc2VhcmNoJykuZmluZCgnLmF1dG9jb21wbGV0ZS13cmFwJyk7Ly8gJCgnI2F1dG9jb21wbGV0ZScpLFxuICAgIHZhciBhdXRvY29tcGxldGVMaXN0ID0gJChhdXRvY29tcGxldGUpLmZpbmQoJ3VsJyk7XG4gICAgb3BlbkF1dG9jb21wbGV0ZSA9IGF1dG9jb21wbGV0ZTtcbiAgICBpZiAocXVlcnkubGVuZ3RoID4gMSkge1xuICAgICAgdXJsID0gJHRoaXMuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicpIHx8ICcvc2VhcmNoJztcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICB0eXBlOiAnZ2V0JyxcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGRhdGEuc3VnZ2VzdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBodG1sID0gJzxhIGNsYXNzPVwiYXV0b2NvbXBsZXRlX2xpbmtcIiBocmVmPVwiJyArIGl0ZW0uZGF0YS5yb3V0ZSArICdcIicgKyAnPicgKyBpdGVtLnZhbHVlICsgaXRlbS5jYXNoYmFjayArICc8L2E+JztcbiAgICAgICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICAgICAgICAgIGxpLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuYXBwZW5kKGxpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVJbigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgJChhdXRvY29tcGxldGVMaXN0KS5odG1sKCcnKTtcbiAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KS5vbignZm9jdXNvdXQnLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmICghJChlLnJlbGF0ZWRUYXJnZXQpLmhhc0NsYXNzKCdhdXRvY29tcGxldGVfbGluaycpKSB7XG4gICAgICAvLyQoJyNhdXRvY29tcGxldGUnKS5oaWRlKCk7XG4gICAgICAkKG9wZW5BdXRvY29tcGxldGUpLmRlbGF5KDEwMCkuc2xpZGVVcCgxMDApXG4gICAgfVxuICB9KTtcblxuICAkKCdib2R5Jykub24oJ3N1Ym1pdCcsICcuc3RvcmVzLXNlYXJjaF9mb3JtJywgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgdmFsID0gJCh0aGlzKS5maW5kKCcuc2VhcmNoLWZvcm0taW5wdXQnKS52YWwoKTtcbiAgICBpZiAodmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pXG59KCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICQoJy5jb3Vwb25zLWxpc3RfaXRlbS1jb250ZW50LWdvdG8tcHJvbW9jb2RlLWxpbmsnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcbiAgICB2YXIgZXhwaXJlZCA9IHRoYXQuY2xvc2VzdCgnLmNvdXBvbnMtbGlzdF9pdGVtJykuZmluZCgnLmNsb2NrLWV4cGlyZWQnKTtcbiAgICB2YXIgdXNlcklkID0gJCh0aGF0KS5kYXRhKCd1c2VyJyk7XG4gICAgdmFyIGluYWN0aXZlID0gJCh0aGF0KS5kYXRhKCdpbmFjdGl2ZScpO1xuICAgIHZhciBkYXRhX21lc3NhZ2UgPSAkKHRoYXQpLmRhdGEoJ21lc3NhZ2UnKTtcblxuICAgIGlmIChpbmFjdGl2ZSkge1xuICAgICAgdmFyIHRpdGxlID0gZGF0YV9tZXNzYWdlID8gZGF0YV9tZXNzYWdlIDogbGcoXCJwcm9tb2NvZGVfaXNfaW5hY3RpdmVcIik7XG4gICAgICB2YXIgbWVzc2FnZSA9IGxnKFwicHJvbW9jb2RlX3ZpZXdfYWxsXCIpO1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcbiAgICAgICAgJ3RpdGxlJzogdGl0bGUsXG4gICAgICAgICdxdWVzdGlvbic6IG1lc3NhZ2UsXG4gICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxuICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcbiAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChleHBpcmVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciB0aXRsZSA9IGxnKFwicHJvbW9jb2RlX2lzX2V4cGlyZXNcIik7XG4gICAgICB2YXIgbWVzc2FnZSA9IGxnKFwicHJvbW9jb2RlX3ZpZXdfYWxsXCIpO1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcbiAgICAgICAgJ3RpdGxlJzogdGl0bGUsXG4gICAgICAgICdxdWVzdGlvbic6IG1lc3NhZ2UsXG4gICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxuICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcbiAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmICghdXNlcklkKSB7XG4gICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgJ2J1dHRvblllcyc6IGZhbHNlLFxuICAgICAgICAnbm90eWZ5X2NsYXNzJzogXCJub3RpZnlfYm94LWFsZXJ0XCIsXG4gICAgICAgICd0aXRsZSc6IGxnKFwidXNlX3Byb21vY29kZVwiKSxcbiAgICAgICAgJ3F1ZXN0aW9uJzogJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWNvdXBvbi1ub3JlZ2lzdGVyXCI+JyArXG4gICAgICAgICc8aW1nIHNyYz1cIi9pbWFnZXMvdGVtcGxhdGVzL3N3YS5wbmdcIiBhbHQ9XCJcIj4nICtcbiAgICAgICAgJzxwPjxiPicrbGcoXCJwcm9tb2NvZGVfdXNlX3dpdGhvdXRfY2FzaGJhY2tfb3JfcmVnaXN0ZXJcIikrJzwvYj48L3A+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWJ1dHRvbnNcIj4nICtcbiAgICAgICAgJzxhIGhyZWY9XCInICsgdGhhdC5hdHRyKCdocmVmJykgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJidG5cIj4nK2xnKFwidXNlX3Byb21vY29kZVwiKSsnPC9hPicgK1xuICAgICAgICAnPGEgaHJlZj1cIiNyZWdpc3RyYXRpb25cIiBjbGFzcz1cImJ0biBidG4tdHJhbnNmb3JtIG1vZGFsc19vcGVuXCI+JytsZyhcInJlZ2lzdGVyXCIpKyc8L2E+JyArXG4gICAgICAgICc8L2Rpdj4nXG4gICAgICB9O1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSk7XG5cbiAgJCgnI3Nob3BfaGVhZGVyLWdvdG8tY2hlY2tib3gnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICBpZiAoISQodGhpcykuaXMoJzpjaGVja2VkJykpIHtcbiAgICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XG4gICAgICAgICAgICAgJ3RpdGxlJzogbGcoXCJhdHRlbnRpb25zXCIpLFxuICAgICAgICAgICAgICdxdWVzdGlvbic6IGxnKFwicHJvbW9jb2RlX3JlY29tbWVuZGF0aW9uc1wiKSxcbiAgICAgICAgICAgICAnYnV0dG9uWWVzJzogbGcoXCJjbG9zZVwiKSxcbiAgICAgICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcbiAgICAgICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXG4gICAgICAgICB9KTtcbiAgICAgfVxuICB9KTtcblxuXG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAkKCcuYWNjb3VudC13aXRoZHJhdy1tZXRob2RzX2l0ZW0tb3B0aW9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIG9wdGlvbiA9ICQodGhpcykuZGF0YSgnb3B0aW9uLXByb2Nlc3MnKSxcbiAgICAgIHBsYWNlaG9sZGVyID0gJyc7XG4gICAgc3dpdGNoIChvcHRpb24pIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X2Nhc2hfbnVtYmVyXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAyOlxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfcl9udW1iZXJcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM6XG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19waG9uZV9udW1iZXJcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDQ6XG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19jYXJ0X251bWJlclwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgNTpcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X2VtYWlsXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA2OlxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfcGhvbmVfbnVtYmVyXCIpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAkKHRoaXMpLnBhcmVudCgpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICQodGhpcykucGFyZW50KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICQoXCIjdXNlcnN3aXRoZHJhdy1iaWxsXCIpLnByZXYoXCIucGxhY2Vob2xkZXJcIikuaHRtbChwbGFjZWhvbGRlcik7XG4gICAgJCgnI3VzZXJzd2l0aGRyYXctcHJvY2Vzc19pZCcpLnZhbChvcHRpb24pO1xuICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICBhamF4Rm9ybSgkKCcuYWpheF9mb3JtJykpO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICQoJy5kb2Jyby1mdW5kc19pdGVtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgJCgnI2RvYnJvLXNlbmQtZm9ybS1jaGFyaXR5LXByb2Nlc3MnKS52YWwoJCh0aGlzKS5kYXRhKCdpZCcpKTtcbiAgfSk7XG5cbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICQoJ2JvZHknKS5hZGRDbGFzcygnbm9fc2Nyb2xsJyk7XG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdCcpLmFkZENsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtb3BlbicpO1xuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5hZGRDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlLW9wZW4nKTtcbiAgfSk7XG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtY2xvc2UnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0JykucmVtb3ZlQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdC1vcGVuJyk7XG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUtb3BlbicpO1xuICB9KTtcbn0pKCk7XG4iLCIvL3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKSB7XG5zaGFyZTQyID0gZnVuY3Rpb24gKCl7XG4gIGU9ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2hhcmU0MmluaXQnKTtcbiAgZm9yICh2YXIgayA9IDA7IGsgPCBlLmxlbmd0aDsgaysrKSB7XG4gICAgdmFyIHUgPSBcIlwiO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zb2NpYWxzJykgIT0gLTEpXG4gICAgICB2YXIgc29jaWFscyA9IEpTT04ucGFyc2UoJ1snK2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNvY2lhbHMnKSsnXScpO1xuICAgIHZhciBpY29uX3R5cGU9ZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi10eXBlJykgIT0gLTE/ZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi10eXBlJyk6Jyc7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXVybCcpICE9IC0xKVxuICAgICAgdSA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXVybCcpO1xuICAgIHZhciBwcm9tbyA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXByb21vJyk7XG4gICAgaWYocHJvbW8gJiYgcHJvbW8ubGVuZ3RoPjApIHtcbiAgICAgIHZhciBrZXkgPSAncHJvbW89JyxcbiAgICAgICAgcHJvbW9TdGFydCA9IHUuaW5kZXhPZihrZXkpLFxuICAgICAgICBwcm9tb0VuZCA9IHUuaW5kZXhPZignJicsIHByb21vU3RhcnQpLFxuICAgICAgICBwcm9tb0xlbmd0aCA9IHByb21vRW5kID4gcHJvbW9TdGFydCA/IHByb21vRW5kIC0gcHJvbW9TdGFydCAtIGtleS5sZW5ndGggOiB1Lmxlbmd0aCAtIHByb21vU3RhcnQgLSBrZXkubGVuZ3RoO1xuICAgICAgaWYocHJvbW9TdGFydCA+IDApIHtcbiAgICAgICAgcHJvbW8gPSB1LnN1YnN0cihwcm9tb1N0YXJ0ICsga2V5Lmxlbmd0aCwgcHJvbW9MZW5ndGgpO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgc2VsZl9wcm9tbyA9IChwcm9tbyAmJiBwcm9tby5sZW5ndGggPiAwKT8gXCJzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2VuZF9wcm9tbygnXCIrcHJvbW8rXCInKTt9LDIwMDApO1wiIDogXCJcIjtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi1zaXplJykgIT0gLTEpXG4gICAgICB2YXIgaWNvbl9zaXplID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi1zaXplJyk7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJykgIT0gLTEpXG4gICAgICB2YXIgdCA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJyk7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWltYWdlJykgIT0gLTEpXG4gICAgICB2YXIgaSA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWltYWdlJyk7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWRlc2NyaXB0aW9uJykgIT0gLTEpXG4gICAgICB2YXIgZCA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWRlc2NyaXB0aW9uJyk7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXBhdGgnKSAhPSAtMSlcbiAgICAgIHZhciBmID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF0aCcpO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29ucy1maWxlJykgIT0gLTEpXG4gICAgICB2YXIgZm4gPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29ucy1maWxlJyk7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNjcmlwdC1hZnRlcicpKSB7XG4gICAgICBzZWxmX3Byb21vICs9IFwic2V0VGltZW91dChmdW5jdGlvbigpe1wiK2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNjcmlwdC1hZnRlcicpK1wifSwzMDAwKTtcIjtcbiAgICB9XG5cbiAgICBpZiAoIWYpIHtcbiAgICAgIGZ1bmN0aW9uIHBhdGgobmFtZSkge1xuICAgICAgICB2YXIgc2MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylcbiAgICAgICAgICAsIHNyID0gbmV3IFJlZ0V4cCgnXiguKi98KSgnICsgbmFtZSArICcpKFsjP118JCknKTtcbiAgICAgICAgZm9yICh2YXIgcCA9IDAsIHNjTCA9IHNjLmxlbmd0aDsgcCA8IHNjTDsgcCsrKSB7XG4gICAgICAgICAgdmFyIG0gPSBTdHJpbmcoc2NbcF0uc3JjKS5tYXRjaChzcik7XG4gICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgIGlmIChtWzFdLm1hdGNoKC9eKChodHRwcz98ZmlsZSlcXDpcXC97Mix9fFxcdzpbXFwvXFxcXF0pLykpXG4gICAgICAgICAgICAgIHJldHVybiBtWzFdO1xuICAgICAgICAgICAgaWYgKG1bMV0uaW5kZXhPZihcIi9cIikgPT0gMClcbiAgICAgICAgICAgICAgcmV0dXJuIG1bMV07XG4gICAgICAgICAgICBiID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2Jhc2UnKTtcbiAgICAgICAgICAgIGlmIChiWzBdICYmIGJbMF0uaHJlZilcbiAgICAgICAgICAgICAgcmV0dXJuIGJbMF0uaHJlZiArIG1bMV07XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvKC4qW1xcL1xcXFxdKS8pWzBdICsgbVsxXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBmID0gcGF0aCgnc2hhcmU0Mi5qcycpO1xuICAgIH1cbiAgICBpZiAoIXUpXG4gICAgICB1ID0gbG9jYXRpb24uaHJlZjtcbiAgICBpZiAoIXQpXG4gICAgICB0ID0gZG9jdW1lbnQudGl0bGU7XG4gICAgaWYgKCFmbilcbiAgICAgIGZuID0gJ2ljb25zLnBuZyc7XG4gICAgZnVuY3Rpb24gZGVzYygpIHtcbiAgICAgIHZhciBtZXRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ldGEnKTtcbiAgICAgIGZvciAodmFyIG0gPSAwOyBtIDwgbWV0YS5sZW5ndGg7IG0rKykge1xuICAgICAgICBpZiAobWV0YVttXS5uYW1lLnRvTG93ZXJDYXNlKCkgPT0gJ2Rlc2NyaXB0aW9uJykge1xuICAgICAgICAgIHJldHVybiBtZXRhW21dLmNvbnRlbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgaWYgKCFkKVxuICAgICAgZCA9IGRlc2MoKTtcbiAgICB1ID0gZW5jb2RlVVJJQ29tcG9uZW50KHUpO1xuICAgIHQgPSBlbmNvZGVVUklDb21wb25lbnQodCk7XG4gICAgdCA9IHQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcbiAgICBpID0gZW5jb2RlVVJJQ29tcG9uZW50KGkpO1xuICAgIHZhciBkX29yaWc9ZC5yZXBsYWNlKC9cXCcvZywgJyUyNycpO1xuICAgIGQgPSBlbmNvZGVVUklDb21wb25lbnQoZCk7XG4gICAgZCA9IGQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcbiAgICB2YXIgZmJRdWVyeSA9ICd1PScgKyB1O1xuICAgIGlmIChpICE9ICdudWxsJyAmJiBpICE9ICcnKVxuICAgICAgZmJRdWVyeSA9ICdzPTEwMCZwW3VybF09JyArIHUgKyAnJnBbdGl0bGVdPScgKyB0ICsgJyZwW3N1bW1hcnldPScgKyBkICsgJyZwW2ltYWdlc11bMF09JyArIGk7XG4gICAgdmFyIHZrSW1hZ2UgPSAnJztcbiAgICBpZiAoaSAhPSAnbnVsbCcgJiYgaSAhPSAnJylcbiAgICAgIHZrSW1hZ2UgPSAnJmltYWdlPScgKyBpO1xuICAgIHZhciBzID0gbmV3IEFycmF5KFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJmYlwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PScgKyB1ICsnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBGYWNlYm9va1wiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidmtcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3ZrLmNvbS9zaGFyZS5waHA/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArIHZrSW1hZ2UgKyAnJmRlc2NyaXB0aW9uPScgKyBkICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0JIg0JrQvtC90YLQsNC60YLQtVwiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwib2RrbFwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vY29ubmVjdC5vay5ydS9vZmZlcj91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgJyZkZXNjcmlwdGlvbj0nKyBkICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiDQntC00L3QvtC60LvQsNGB0YHQvdC40LrQuFwiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidHdpXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD0nICsgdCArICcmdXJsPScgKyB1ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiBUd2l0dGVyXCInLFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJncGx1c1wiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vcGx1cy5nb29nbGUuY29tL3NoYXJlP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBHb29nbGUrXCInLFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJtYWlsXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9jb25uZWN0Lm1haWwucnUvc2hhcmU/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICcmZGVzY3JpcHRpb249JyArIGQgKyAnJmltYWdldXJsPScgKyBpICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIg0JzQvtC10Lwg0JzQuNGA0LVATWFpbC5SdVwiJyxcbiAgICAgICdcIi8vd3d3LmxpdmVqb3VybmFsLmNvbS91cGRhdGUuYm1sP2V2ZW50PScgKyB1ICsgJyZzdWJqZWN0PScgKyB0ICsgJ1wiIHRpdGxlPVwi0J7Qv9GD0LHQu9C40LrQvtCy0LDRgtGMINCyIExpdmVKb3VybmFsXCInLFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJwaW5cIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3BpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD0nICsgdSArICcmbWVkaWE9JyArIGkgKyAnJmRlc2NyaXB0aW9uPScgKyB0ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD02MDAsIGhlaWdodD0zMDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiBQaW50ZXJlc3RcIicsXG4gICAgICAnXCJcIiBvbmNsaWNrPVwicmV0dXJuIGZhdih0aGlzKTtcIiB0aXRsZT1cItCh0L7RhdGA0LDQvdC40YLRjCDQsiDQuNC30LHRgNCw0L3QvdC+0LUg0LHRgNCw0YPQt9C10YDQsFwiJyxcbiAgICAgICdcIiNcIiBvbmNsaWNrPVwicHJpbnQoKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCg0LDRgdC/0LXRh9Cw0YLQsNGC0YxcIicsXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInRlbGVncmFtXCIgb25jbGljaz1cIndpbmRvdy5vcGVuKFxcJy8vdGVsZWdyYW0ubWUvc2hhcmUvdXJsP3VybD0nICsgdSArJyZ0ZXh0PScgKyB0ICsgJ1xcJywgXFwndGVsZWdyYW1cXCcsIFxcJ3dpZHRoPTU1MCxoZWlnaHQ9NDQwLGxlZnQ9MTAwLHRvcD0xMDBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgVGVsZWdyYW1cIicsXG4gICAgICAnXCJ2aWJlcjovL2ZvcndhcmQ/dGV4dD0nKyB1ICsnIC0gJyArIHQgKyAnXCIgZGF0YS1jb3VudD1cInZpYmVyXCIgcmVsPVwibm9mb2xsb3cgbm9vcGVuZXJcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIFZpYmVyXCInLFxuICAgICAgJ1wid2hhdHNhcHA6Ly9zZW5kP3RleHQ9JysgdSArJyAtICcgKyB0ICsgJ1wiIGRhdGEtY291bnQ9XCJ3aGF0c2FwcFwiIHJlbD1cIm5vZm9sbG93IG5vb3BlbmVyXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBXaGF0c0FwcFwiJ1xuXG4gICAgKTtcblxuICAgIHZhciBsID0gJyc7XG5cbiAgICBpZihzb2NpYWxzLmxlbmd0aD4xKXtcbiAgICAgIGZvciAocSA9IDA7IHEgPCBzb2NpYWxzLmxlbmd0aDsgcSsrKXtcbiAgICAgICAgaj1zb2NpYWxzW3FdO1xuICAgICAgICBsICs9ICc8YSByZWw9XCJub2ZvbGxvd1wiIGhyZWY9JyArIHNbal0gKyAnIHRhcmdldD1cIl9ibGFua1wiICcrZ2V0SWNvbihzW2pdLGosaWNvbl90eXBlLGYsZm4saWNvbl9zaXplKSsnPjwvYT4nO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgZm9yIChqID0gMDsgaiA8IHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgbCArPSAnPGEgcmVsPVwibm9mb2xsb3dcIiBocmVmPScgKyBzW2pdICsgJyB0YXJnZXQ9XCJfYmxhbmtcIiAnK2dldEljb24oc1tqXSxqLGljb25fdHlwZSxmLGZuLGljb25fc2l6ZSkrJz48L2E+JztcbiAgICAgIH1cbiAgICB9XG4gICAgZVtrXS5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJzaGFyZTQyX3dyYXBcIj4nICsgbCArICc8L3NwYW4+JztcbiAgfVxuICBcbi8vfSwgZmFsc2UpO1xufSgpO1xuXG5mdW5jdGlvbiBnZXRJY29uKHMsaix0LGYsZm4sc2l6ZSkge1xuICBpZighc2l6ZSl7XG4gICAgc2l6ZT0zMjtcbiAgfVxuICBpZih0PT0nY3NzJyl7XG4gICAgaj1zLmluZGV4T2YoJ2RhdGEtY291bnQ9XCInKSsxMjtcbiAgICB2YXIgbD1zLmluZGV4T2YoJ1wiJyxqKS1qO1xuICAgIHZhciBsMj1zLmluZGV4T2YoJy4nLGopLWo7XG4gICAgbD1sPmwyICYmIGwyPjAgP2wyOmw7XG4gICAgLy92YXIgaWNvbj0nY2xhc3M9XCJzb2MtaWNvbiBpY29uLScrcy5zdWJzdHIoaixsKSsnXCInO1xuICAgIHZhciBpY29uPSdjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2QtJytzLnN1YnN0cihqLGwpKydcIic7XG4gIH1lbHNlIGlmKHQ9PSdzdmcnKXtcbiAgICB2YXIgc3ZnPVtcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDExMS45NCwxNzcuMDgpXCIgZD1cIk0wIDAgMCA3MC4zIDIzLjYgNzAuMyAyNy4xIDk3LjcgMCA5Ny43IDAgMTE1LjJDMCAxMjMuMiAyLjIgMTI4LjYgMTMuNiAxMjguNkwyOC4xIDEyOC42IDI4LjEgMTUzLjFDMjUuNiAxNTMuNCAxNyAxNTQuMiA2LjkgMTU0LjItMTQgMTU0LjItMjguMyAxNDEuNC0yOC4zIDExNy45TC0yOC4zIDk3LjctNTIgOTcuNy01MiA3MC4zLTI4LjMgNzAuMy0yOC4zIDAgMCAwWlwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsOTguMjc0LDE0NS41MilcIiBkPVwiTTAgMCA5LjYgMEM5LjYgMCAxMi41IDAuMyAxNCAxLjkgMTUuNCAzLjQgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMSAxOSAyMS4xIDIxIDI3IDIyLjggMzQuNiA4LjUgNDIuNyAzIDQ4LjctMS4yIDUzLjMtMC4zIDUzLjMtMC4zTDc0LjggMEM3NC44IDAgODYuMSAwLjcgODAuNyA5LjUgODAuMyAxMC4zIDc3LjYgMTYuMSA2NC44IDI4IDUxLjMgNDAuNSA1My4xIDM4LjUgNjkuMyA2MC4xIDc5LjIgNzMuMyA4My4yIDgxLjQgODEuOSA4NC44IDgwLjggODguMSA3My41IDg3LjIgNzMuNSA4Ny4yTDQ5LjMgODcuMUM0OS4zIDg3LjEgNDcuNSA4Ny4zIDQ2LjIgODYuNSA0NC45IDg1LjcgNDQgODMuOSA0NCA4My45IDQ0IDgzLjkgNDAuMiA3My43IDM1LjEgNjUuMSAyNC4zIDQ2LjggMjAgNDUuOCAxOC4zIDQ2LjkgMTQuMiA0OS42IDE1LjIgNTcuNiAxNS4yIDYzLjIgMTUuMiA4MSAxNy45IDg4LjQgOS45IDkwLjMgNy4zIDkwLjkgNS40IDkxLjMtMS40IDkxLjQtMTAgOTEuNS0xNy4zIDkxLjQtMjEuNCA4OS4zLTI0LjIgODgtMjYuMyA4NS0yNSA4NC44LTIzLjQgODQuNi0xOS44IDgzLjgtMTcuOSA4MS4yLTE1LjQgNzcuOS0xNS41IDcwLjMtMTUuNSA3MC4zLTE1LjUgNzAuMy0xNC4xIDQ5LjQtMTguOCA0Ni44LTIyLjEgNDUtMjYuNSA0OC43LTM2LjEgNjUuMy00MS4xIDczLjgtNDQuOCA4My4yLTQ0LjggODMuMi00NC44IDgzLjItNDUuNSA4NC45LTQ2LjggODUuOS00OC4zIDg3LTUwLjUgODcuNC01MC41IDg3LjRMLTczLjUgODcuMkMtNzMuNSA4Ny4yLTc2LjkgODcuMS03OC4yIDg1LjYtNzkuMyA4NC4zLTc4LjMgODEuNS03OC4zIDgxLjUtNzguMyA4MS41LTYwLjMgMzkuNC0zOS45IDE4LjItMjEuMi0xLjMgMCAwIDAgMFwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDEwNi44OCwxODMuNjEpXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKC02Ljg4MDUsLTEwMClcIiBzdHlsZT1cInN0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIj48cGF0aCBkPVwiTSAwLDAgQyA4LjE0NiwwIDE0Ljc2OSwtNi42MjUgMTQuNzY5LC0xNC43NyAxNC43NjksLTIyLjkwNyA4LjE0NiwtMjkuNTMzIDAsLTI5LjUzMyAtOC4xMzYsLTI5LjUzMyAtMTQuNzY5LC0yMi45MDcgLTE0Ljc2OSwtMTQuNzcgLTE0Ljc2OSwtNi42MjUgLTguMTM2LDAgMCwwIE0gMCwtNTAuNDI5IEMgMTkuNjc2LC01MC40MjkgMzUuNjcsLTM0LjQzNSAzNS42NywtMTQuNzcgMzUuNjcsNC45MDMgMTkuNjc2LDIwLjkwMyAwLDIwLjkwMyAtMTkuNjcxLDIwLjkwMyAtMzUuNjY5LDQuOTAzIC0zNS42NjksLTE0Ljc3IC0zNS42NjksLTM0LjQzNSAtMTkuNjcxLC01MC40MjkgMCwtNTAuNDI5XCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsNy41NTE2LC01NC41NzcpXCIgc3R5bGU9XCJzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCI+PHBhdGggZD1cIk0gMCwwIEMgNy4yNjIsMS42NTUgMTQuMjY0LDQuNTI2IDIwLjcxNCw4LjU3OCAyNS41OTUsMTEuNjU0IDI3LjA2NiwxOC4xMDggMjMuOTksMjIuOTg5IDIwLjkxNywyNy44ODEgMTQuNDY5LDI5LjM1MiA5LjU3OSwyNi4yNzUgLTUuMDMyLDE3LjA4NiAtMjMuODQzLDE3LjA5MiAtMzguNDQ2LDI2LjI3NSAtNDMuMzM2LDI5LjM1MiAtNDkuNzg0LDI3Ljg4MSAtNTIuODUyLDIyLjk4OSAtNTUuOTI4LDE4LjEwNCAtNTQuNDYxLDExLjY1NCAtNDkuNTgsOC41NzggLTQzLjEzMiw0LjUzMSAtMzYuMTI4LDEuNjU1IC0yOC44NjcsMCBMIC00OC44MDksLTE5Ljk0MSBDIC01Mi44ODYsLTI0LjAyMiAtNTIuODg2LC0zMC42MzkgLTQ4LjgwNSwtMzQuNzIgLTQ2Ljc2MiwtMzYuNzU4IC00NC4wOSwtMzcuNzc5IC00MS40MTgsLTM3Ljc3OSAtMzguNzQyLC0zNy43NzkgLTM2LjA2NSwtMzYuNzU4IC0zNC4wMjMsLTM0LjcyIEwgLTE0LjQzNiwtMTUuMTIzIDUuMTY5LC0zNC43MiBDIDkuMjQ2LC0zOC44MDEgMTUuODYyLC0zOC44MDEgMTkuOTQzLC0zNC43MiAyNC4wMjgsLTMwLjYzOSAyNC4wMjgsLTI0LjAxOSAxOS45NDMsLTE5Ljk0MSBMIDAsMCBaXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48L2c+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDE2OS43Niw1Ni43MjcpXCIgZD1cIk0wIDBDLTUuMS0yLjMtMTAuNi0zLjgtMTYuNC00LjUtMTAuNS0xLTYgNC42LTMuOSAxMS4zLTkuNCA4LTE1LjUgNS43LTIyIDQuNC0yNy4zIDkuOS0zNC43IDEzLjQtNDIuOSAxMy40LTU4LjcgMTMuNC03MS42IDAuNi03MS42LTE1LjItNzEuNi0xNy40LTcxLjMtMTkuNi03MC44LTIxLjctOTQuNi0yMC41LTExNS43LTkuMS0xMjkuOCA4LjItMTMyLjMgNC0xMzMuNy0xLTEzMy43LTYuMi0xMzMuNy0xNi4xLTEyOC42LTI0LjktMTIwLjktMzAtMTI1LjYtMjkuOS0xMzAuMS0yOC42LTEzMy45LTI2LjUtMTMzLjktMjYuNi0xMzMuOS0yNi43LTEzMy45LTI2LjgtMTMzLjktNDAuNy0xMjQtNTIuMy0xMTEtNTQuOS0xMTMuNC01NS41LTExNS45LTU1LjktMTE4LjUtNTUuOS0xMjAuMy01NS45LTEyMi4xLTU1LjctMTIzLjktNTUuNC0xMjAuMi02Ni43LTEwOS43LTc1LTk3LjEtNzUuMy0xMDYuOS04Mi45LTExOS4zLTg3LjUtMTMyLjctODcuNS0xMzUtODcuNS0xMzcuMy04Ny40LTEzOS41LTg3LjEtMTI2LjgtOTUuMi0xMTEuOC0xMDAtOTUuNi0xMDAtNDMtMTAwLTE0LjItNTYuMy0xNC4yLTE4LjUtMTQuMi0xNy4zLTE0LjItMTYtMTQuMy0xNC44LTguNy0xMC44LTMuOC01LjcgMCAwXCIvPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgxIDAgMCAtMSA3Mi4zODEgOTAuMTcyKVwiPjxwYXRoIGQ9XCJNODcuMiAwIDg3LjIgMTcuMSA3NSAxNy4xIDc1IDAgNTcuOSAwIDU3LjktMTIuMiA3NS0xMi4yIDc1LTI5LjMgODcuMi0yOS4zIDg3LjItMTIuMiAxMDQuMy0xMi4yIDEwNC4zIDAgODcuMiAwWlwiLz48cGF0aCBkPVwiTTAgMCAwLTE5LjYgMjYuMi0xOS42QzI1LjQtMjMuNyAyMy44LTI3LjUgMjAuOC0zMC42IDEwLjMtNDIuMS05LjMtNDItMjAuNS0zMC40LTMxLjctMTguOS0zMS42LTAuMy0yMC4yIDExLjEtOS40IDIxLjkgOCAyMi40IDE4LjYgMTIuMUwxOC41IDEyLjEgMzIuOCAyNi40QzEzLjcgNDMuOC0xNS44IDQzLjUtMzQuNSAyNS4xLTUzLjggNi4xLTU0LTI1LTM0LjktNDQuMy0xNS45LTYzLjUgMTcuMS02My43IDM0LjktNDQuNiA0NS42LTMzIDQ4LjctMTYuNCA0Ni4yIDBMMCAwWlwiLz48L2c+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDk3LjY3Niw2Mi40MTEpXCIgZD1cIk0wIDBDMTAuMiAwIDE5LjktNC41IDI2LjktMTEuNkwyNi45LTExLjZDMjYuOS04LjIgMjkuMi01LjcgMzIuNC01LjdMMzMuMi01LjdDMzguMi01LjcgMzkuMi0xMC40IDM5LjItMTEuOUwzOS4yLTY0LjhDMzguOS02OC4yIDQyLjgtNzAgNDUtNjcuOCA1My41LTU5LjEgNjMuNi0yMi45IDM5LjctMiAxNy40IDE3LjYtMTIuNSAxNC4zLTI4LjUgMy40LTQ1LjQtOC4zLTU2LjItMzQuMS00NS43LTU4LjQtMzQuMi04NC45LTEuNC05Mi44IDE4LjEtODQuOSAyOC04MC45IDMyLjUtOTQuMyAyMi4zLTk4LjYgNi44LTEwNS4yLTM2LjQtMTA0LjUtNTYuNS02OS42LTcwLjEtNDYuMS02OS40LTQuNi0zMy4zIDE2LjktNS43IDMzLjMgMzAuNyAyOC44IDUyLjcgNS44IDc1LjYtMTguMiA3NC4zLTYzIDUxLjktODAuNSA0MS44LTg4LjQgMjYuNy04MC43IDI2LjgtNjkuMkwyNi43LTY1LjRDMTkuNi03Mi40IDEwLjItNzYuNSAwLTc2LjUtMjAuMi03Ni41LTM4LTU4LjctMzgtMzguNC0zOC0xOC0yMC4yIDAgMCAwTTI1LjUtMzdDMjQuNy0yMi4yIDEzLjctMTMuMyAwLjQtMTMuM0wtMC4xLTEzLjNDLTE1LjQtMTMuMy0yMy45LTI1LjMtMjMuOS0zOS0yMy45LTU0LjMtMTMuNi02NC0wLjEtNjQgMTQuOS02NCAyNC44LTUzIDI1LjUtNDBMMjUuNS0zN1pcIi8+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwibWF0cml4KDAuNDI2MjMgMCAwIDAuNDI2MjMgMzQuOTk5IDM1KVwiPjxwYXRoIGQ9XCJNMTYwLjcgMTkuNWMtMTguOSAwLTM3LjMgMy43LTU0LjcgMTAuOUw3Ni40IDAuN2MtMC44LTAuOC0yLjEtMS0zLjEtMC40QzQ0LjQgMTguMiAxOS44IDQyLjkgMS45IDcxLjdjLTAuNiAxLTAuNSAyLjMgMC40IDMuMWwyOC40IDI4LjRjLTguNSAxOC42LTEyLjggMzguNS0xMi44IDU5LjEgMCA3OC43IDY0IDE0Mi44IDE0Mi44IDE0Mi44IDc4LjcgMCAxNDIuOC02NCAxNDIuOC0xNDIuOEMzMDMuNCA4My41IDIzOS40IDE5LjUgMTYwLjcgMTkuNXpNMjE3LjIgMTQ4LjdsOS45IDQyLjEgOS41IDQ0LjQgLTQ0LjMtOS41IC00Mi4xLTkuOUwzNi43IDEwMi4xYzE0LjMtMjkuMyAzOC4zLTUyLjYgNjguMS02NS44TDIxNy4yIDE0OC43elwiLz48cGF0aCBkPVwiTTIyMS44IDE4Ny40bC03LjUtMzNjLTI1LjkgMTEuOS00Ni40IDMyLjQtNTguMyA1OC4zbDMzIDcuNUMxOTYgMjA2LjIgMjA3LjcgMTk0LjQgMjIxLjggMTg3LjR6XCIvPjwvZz48L3N2Zz4nLFxuICAgICAgJycsLy9waW5cbiAgICAgICcnLC8vZmF2XG4gICAgICAnJywvL3ByaW50XG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw3MS4yNjQsMTA2LjkzKVwiIGQ9XCJNMCAwIDY4LjYgNDMuMUM3MiA0NS4zIDczLjEgNDIuOCA3MS42IDQxLjFMMTQuNi0xMC4yIDExLjctMzUuOCAwIDBaTTg3LjEgNjIuOS0zMy40IDE3LjJDLTQwIDE1LjMtMzkuOCA4LjgtMzQuOSA3LjNMLTQuNy0yLjIgNi44LTM3LjZDOC4yLTQxLjUgOS40LTQyLjkgMTEuOC00MyAxNC4zLTQzIDE1LjMtNDIuMSAxNy45LTM5LjggMjAuOS0zNi45IDI1LjYtMzIuMyAzMy0yNS4yTDY0LjQtNDguNEM3MC4yLTUxLjYgNzQuMy00OS45IDc1LjgtNDNMOTUuNSA1NC40Qzk3LjYgNjIuOSA5Mi42IDY1LjQgODcuMSA2Mi45XCIvPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMzUuMzMsMTE5Ljg1KVwiIGQ9XCJNMCAwQy0yLjQtNS40LTYuNS05LTEyLjItMTAuNi0xNC4zLTExLjItMTYuMy0xMC43LTE4LjItOS45LTQ0LjQgMS4yLTYzLjMgMTkuNi03NCA0Ni4yLTc0LjggNDguMS03NS4zIDUwLjEtNzUuMiA1MS45LTc1LjIgNTguNy02OS4yIDY1LTYyLjYgNjUuNC02MC44IDY1LjUtNTkuMiA2NC45LTU3LjkgNjMuNy01My4zIDU5LjMtNDkuNiA1NC4zLTQ2LjkgNDguNi00NS40IDQ1LjUtNDYgNDMuMy00OC43IDQxLjEtNDkuMSA0MC43LTQ5LjUgNDAuNC01MCA0MC4xLTUzLjUgMzcuNS01NC4zIDM0LjktNTIuNiAzMC44LTQ5LjggMjQuMi00NS40IDE5LTM5LjMgMTUuMS0zNyAxMy42LTM0LjcgMTIuMi0zMiAxMS41LTI5LjYgMTAuOC0yNy43IDExLjUtMjYuMSAxMy40LTI1LjkgMTMuNi0yNS44IDEzLjktMjUuNiAxNC4xLTIyLjMgMTguOC0xOC42IDE5LjYtMTMuNyAxNi41LTkuNiAxMy45LTUuNiAxMS0xLjggNy44IDAuNyA1LjYgMS4zIDMgMCAwTS0xOC4yIDM2LjdDLTE4LjMgMzUuOS0xOC4zIDM1LjQtMTguNCAzNC45LTE4LjYgMzQtMTkuMiAzMy40LTIwLjIgMzMuNC0yMS4zIDMzLjQtMjEuOSAzNC0yMi4yIDM0LjktMjIuMyAzNS41LTIyLjQgMzYuMi0yMi41IDM2LjktMjMuMiA0MC4zLTI1LjIgNDIuNi0yOC42IDQzLjYtMjkuMSA0My43LTI5LjUgNDMuNy0yOS45IDQzLjgtMzEgNDQuMS0zMi40IDQ0LjItMzIuNCA0NS44LTMyLjUgNDcuMS0zMS41IDQ3LjktMjkuNiA0OC0yOC40IDQ4LjEtMjYuNSA0Ny41LTI1LjQgNDYuOS0yMC45IDQ0LjctMTguNyA0MS42LTE4LjIgMzYuN00tMjUuNSA1MS4yQy0yOCA1Mi4xLTMwLjUgNTIuOC0zMy4yIDUzLjItMzQuNSA1My40LTM1LjQgNTQuMS0zNS4xIDU1LjYtMzQuOSA1Ny0zNCA1Ny41LTMyLjYgNTcuNC0yNCA1Ni42LTE3LjMgNTMuNC0xMi42IDQ2LTEwLjUgNDIuNS05LjIgMzcuNS05LjQgMzMuOC05LjUgMzEuMi05LjkgMzAuNS0xMS40IDMwLjUtMTMuNiAzMC42LTEzLjMgMzIuNC0xMy41IDMzLjctMTMuNyAzNS43LTE0LjIgMzcuNy0xNC43IDM5LjctMTYuMyA0NS40LTE5LjkgNDkuMy0yNS41IDUxLjJNLTM4IDY0LjRDLTM3LjkgNjUuOS0zNyA2Ni41LTM1LjUgNjYuNC0yMy4yIDY1LjgtMTMuOSA2Mi4yLTYuNyA1Mi41LTIuNSA0Ni45LTAuMiAzOS4yIDAgMzIuMiAwIDMxLjEgMCAzMCAwIDI5LTAuMSAyNy44LTAuNiAyNi45LTEuOSAyNi45LTMuMiAyNi45LTMuOSAyNy42LTQgMjktNC4zIDM0LjItNS4zIDM5LjMtNy4zIDQ0LjEtMTEuMiA1My41LTE4LjYgNTguNi0yOC4xIDYxLjEtMzAuNyA2MS43LTMzLjIgNjIuMi0zNS44IDYyLjUtMzcgNjIuNS0zOCA2Mi44LTM4IDY0LjRNMTEuNSA3NC4xQzYuNiA3OC4zIDAuOSA4MC44LTUuMyA4Mi40LTIwLjggODYuNS0zNi41IDg3LjUtNTIuNCA4NS4zLTYwLjUgODQuMi02OC4zIDgyLjEtNzUuNCA3OC4xLTgzLjggNzMuNC04OS42IDY2LjYtOTIuMiA1Ny4xLTk0IDUwLjQtOTQuOSA0My42LTk1LjIgMzYuNi05NS43IDI2LjQtOTUuNCAxNi4zLTkyLjggNi4zLTg5LjgtNS4zLTgzLjItMTMuOC03MS45LTE4LjMtNzAuNy0xOC44LTY5LjUtMTkuNS02OC4zLTIwLTY3LjItMjAuNC02Ni44LTIxLjItNjYuOC0yMi40LTY2LjktMzAuNC02Ni44LTM4LjQtNjYuOC00Ni43LTYzLjktNDMuOS02MS44LTQxLjgtNjAuMy00MC4xLTU1LjktMzUuMS01MS43LTMwLjktNDcuMS0yNi4xLTQ0LjctMjMuNy00NS43LTIzLjgtNDIuMS0yMy44LTM3LjgtMjMuOS0zMS0yNC4xLTI2LjgtMjMuOC0xOC42LTIzLjEtMTAuNi0yMi4xLTIuNy0xOS43IDcuMi0xNi43IDE1LjItMTEuNCAxOS4yLTEuMyAyMC4zIDEuMyAyMS40IDQgMjIgNi44IDI1LjkgMjIuOSAyNS40IDM4LjkgMjIuMiA1NSAyMC42IDYyLjQgMTcuNSA2OSAxMS41IDc0LjFcIi8+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDEzMC44NCwxMTIuNylcIiBkPVwiTTAgMEMtMS42IDAuOS05LjQgNS4xLTEwLjggNS43LTEyLjMgNi4zLTEzLjQgNi42LTE0LjUgNS0xNS42IDMuNC0xOC45LTAuMS0xOS45LTEuMS0yMC44LTIuMi0yMS44LTIuMy0yMy40LTEuNC0yNS0wLjUtMzAuMSAxLjQtMzYuMSA3LjEtNDAuNyAxMS41LTQzLjcgMTctNDQuNiAxOC42LTQ1LjUgMjAuMy00NC42IDIxLjEtNDMuOCAyMS45LTQzIDIyLjYtNDIuMSAyMy43LTQxLjMgMjQuNi00MC40IDI1LjUtNDAuMSAyNi4yLTM5LjUgMjcuMi0zOSAyOC4zLTM5LjIgMjkuMy0zOS42IDMwLjEtMzkuOSAzMC45LTQyLjkgMzktNDQuMSA0Mi4zLTQ1LjMgNDUuNS00Ni43IDQ1LTQ3LjYgNDUuMS00OC42IDQ1LjEtNDkuNiA0NS4zLTUwLjcgNDUuMy01MS44IDQ1LjQtNTMuNiA0NS01NS4xIDQzLjUtNTYuNiA0MS45LTYxIDM4LjItNjEuMyAzMC4yLTYxLjYgMjIuMy01Ni4xIDE0LjQtNTUuMyAxMy4zLTU0LjUgMTIuMi00NC44LTUuMS0yOC42LTEyLjEtMTIuNC0xOS4yLTEyLjQtMTcuMS05LjQtMTYuOS02LjQtMTYuOCAwLjMtMTMuNCAxLjgtOS42IDMuMy01LjkgMy40LTIuNyAzLTIgMi42LTEuMyAxLjYtMC45IDAgME0tMjkuNy0zOC4zQy00MC40LTM4LjMtNTAuMy0zNS4xLTU4LjYtMjkuNkwtNzguOS0zNi4xLTcyLjMtMTYuNUMtNzguNi03LjgtODIuMyAyLjgtODIuMyAxNC40LTgyLjMgNDMuNC01OC43IDY3LjEtMjkuNyA2Ny4xLTAuNiA2Ny4xIDIzIDQzLjQgMjMgMTQuNCAyMy0xNC43LTAuNi0zOC4zLTI5LjctMzguM00tMjkuNyA3Ny42Qy02NC42IDc3LjYtOTIuOSA0OS4zLTkyLjkgMTQuNC05Mi45IDIuNC04OS42LTguOC04My45LTE4LjNMLTk1LjMtNTIuMi02MC4yLTQxQy01MS4yLTQ2LTQwLjgtNDguOS0yOS43LTQ4LjkgNS4zLTQ4LjkgMzMuNi0yMC42IDMzLjYgMTQuNCAzMy42IDQ5LjMgNS4zIDc3LjYtMjkuNyA3Ny42XCIvPjwvc3ZnPicsXG4gICAgXTtcbiAgICB2YXIgaWNvbj1zdmdbal07XG4gICAgdmFyIGNzcz0nIHN0eWxlPVwid2lkdGg6JytzaXplKydweDtoZWlnaHQ6JytzaXplKydweFwiICc7XG4gICAgaWNvbj0nPHN2ZyBjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2Qtc3ZnXCInK2NzcytpY29uLnN1YnN0cmluZyg0KTtcbiAgICBpY29uPSc+JytpY29uLnN1YnN0cmluZygwLCBpY29uLmxlbmd0aCAtIDEpO1xuICB9ZWxzZXtcbiAgICBpY29uPSdzdHlsZT1cImRpc3BsYXk6aW5saW5lLWJsb2NrO3ZlcnRpY2FsLWFsaWduOmJvdHRvbTt3aWR0aDonK3NpemUrJ3B4O2hlaWdodDonK3NpemUrJ3B4O21hcmdpbjowIDZweCA2cHggMDtwYWRkaW5nOjA7b3V0bGluZTpub25lO2JhY2tncm91bmQ6dXJsKCcgKyBmICsgZm4gKyAnKSAtJyArIHNpemUgKiBqICsgJ3B4IDAgbm8tcmVwZWF0OyBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1wiJ1xuICB9XG4gIHJldHVybiBpY29uO1xufVxuXG5mdW5jdGlvbiBmYXYoYSkge1xuICB2YXIgdGl0bGUgPSBkb2N1bWVudC50aXRsZTtcbiAgdmFyIHVybCA9IGRvY3VtZW50LmxvY2F0aW9uO1xuICB0cnkge1xuICAgIHdpbmRvdy5leHRlcm5hbC5BZGRGYXZvcml0ZSh1cmwsIHRpdGxlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRyeSB7XG4gICAgICB3aW5kb3cuc2lkZWJhci5hZGRQYW5lbCh0aXRsZSwgdXJsLCAnJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKHR5cGVvZiAob3BlcmEpID09ICdvYmplY3QnIHx8IHdpbmRvdy5zaWRlYmFyKSB7XG4gICAgICAgIGEucmVsID0gJ3NpZGViYXInO1xuICAgICAgICBhLnRpdGxlID0gdGl0bGU7XG4gICAgICAgIGEudXJsID0gdXJsO1xuICAgICAgICBhLmhyZWYgPSB1cmw7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoJ9Cd0LDQttC80LjRgtC1IEN0cmwtRCwg0YfRgtC+0LHRiyDQtNC+0LHQsNCy0LjRgtGMINGB0YLRgNCw0L3QuNGG0YMg0LIg0LfQsNC60LvQsNC00LrQuCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHNlbmRfcHJvbW8ocHJvbW8pe1xuICAkLmFqYXgoe1xuICAgIG1ldGhvZDogXCJwb3N0XCIsXG4gICAgdXJsOiBcIi9hY2NvdW50L3Byb21vXCIsXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICBkYXRhOiB7cHJvbW86IHByb21vfSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZiAoZGF0YS50aXRsZSAhPSBudWxsICYmIGRhdGEubWVzc2FnZSAhPSBudWxsKSB7XG4gICAgICAgIG9uX3Byb21vPSQoJy5vbl9wcm9tbycpO1xuICAgICAgICBpZihvbl9wcm9tby5sZW5ndGg9PTAgfHwgIW9uX3Byb21vLmlzKCc6dmlzaWJsZScpKSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBvbl9wcm9tby5zaG93KCk7XG4gICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuIiwiJCgnLnNjcm9sbF9ib3gtdGV4dCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cbiAgICQodGhpcykuY2xvc2VzdCgnLnNjcm9sbF9ib3gnKS5maW5kKCcuc2Nyb2xsX2JveC1pdGVtJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbF9ib3gtaXRlbS1sb3cnKTtcblxufSk7IiwidmFyIHBsYWNlaG9sZGVyID0gKGZ1bmN0aW9uKCl7XG4gIGZ1bmN0aW9uIG9uQmx1cigpe1xuICAgIHZhciBpbnB1dFZhbHVlID0gJCh0aGlzKS52YWwoKTtcbiAgICBpZiAoIGlucHV0VmFsdWUgPT0gXCJcIiApIHtcbiAgICAgICQodGhpcykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnZm9jdXNlZCcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRm9jdXMoKXtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2ZvY3VzZWQnKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gcnVuKHBhcikge1xuICAgIHZhciBlbHM7XG4gICAgaWYoIXBhcilcbiAgICAgIGVscz0kKCcuZm9ybS1ncm91cCBbcGxhY2Vob2xkZXJdJyk7XG4gICAgZWxzZVxuICAgICAgZWxzPSQocGFyKS5maW5kKCcuZm9ybS1ncm91cCBbcGxhY2Vob2xkZXJdJyk7XG5cbiAgICBlbHMuZm9jdXMob25Gb2N1cyk7XG4gICAgZWxzLmJsdXIob25CbHVyKTtcblxuICAgIGZvcih2YXIgaSA9IDA7IGk8ZWxzLmxlbmd0aDtpKyspe1xuICAgICAgdmFyIGVsPWVscy5lcShpKTtcbiAgICAgIHZhciB0ZXh0ID0gZWwuYXR0cigncGxhY2Vob2xkZXInKTtcbiAgICAgIGVsLmF0dHIoJ3BsYWNlaG9sZGVyJywnJyk7XG4gICAgICBpZih0ZXh0Lmxlbmd0aDwyKWNvbnRpbnVlO1xuICAgICAgLy9pZihlbC5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmxlbmd0aD09MClyZXR1cm47XG5cbiAgICAgIHZhciBpbnB1dFZhbHVlID0gZWwudmFsKCk7XG4gICAgICB2YXIgZWxfaWQgPSBlbC5hdHRyKCdpZCcpO1xuICAgICAgaWYoIWVsX2lkKXtcbiAgICAgICAgZWxfaWQ9J2VsX2Zvcm1zXycrTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKjEwMDAwKTtcbiAgICAgICAgZWwuYXR0cignaWQnLGVsX2lkKVxuICAgICAgfVxuXG4gICAgICB2YXIgZGl2ID0gJCgnPGxhYmVsLz4nLHtcbiAgICAgICAgJ2NsYXNzJzoncGxhY2Vob2xkZXInLFxuICAgICAgICAndGV4dCc6IHRleHQsXG4gICAgICAgICdmb3InOmVsX2lkXG4gICAgICB9KTtcbiAgICAgIGVsLmJlZm9yZShkaXYpO1xuXG4gICAgICBvbkZvY3VzLmJpbmQoZWwpKClcbiAgICAgIG9uQmx1ci5iaW5kKGVsKSgpXG4gICAgfVxuICB9XG5cbiAgcnVuKCk7XG4gIHJldHVybiBydW47XG59KSgpOyIsInZhciBub3RpZmljYXRpb24gPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgY29udGVpbmVyO1xuICB2YXIgbW91c2VPdmVyID0gMDtcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xuICB2YXIgdGltZSA9IDEwMDAwO1xuXG4gIHZhciBub3RpZmljYXRpb25fYm94ID0gZmFsc2U7XG4gIHZhciBpc19pbml0ID0gZmFsc2U7XG4gIHZhciBjb25maXJtX29wdCA9IHtcbiAgICAvLyB0aXRsZTogbGcoJ2RlbGV0aW5nJyksXG4gICAgLy8gcXVlc3Rpb246IGxnKCdhcmVfeW91X3N1cmVfdG9fZGVsZXRlJyksXG4gICAgLy8gYnV0dG9uWWVzOiBsZygneWVzJyksXG4gICAgLy8gYnV0dG9uTm86IGxnKCdubycpLFxuICAgIGNhbGxiYWNrWWVzOiBmYWxzZSxcbiAgICBjYWxsYmFja05vOiBmYWxzZSxcbiAgICBvYmo6IGZhbHNlLFxuICAgIGJ1dHRvblRhZzogJ2RpdicsXG4gICAgYnV0dG9uWWVzRG9wOiAnJyxcbiAgICBidXR0b25Ob0RvcDogJydcbiAgfTtcbiAgdmFyIGFsZXJ0X29wdCA9IHtcbiAgICB0aXRsZTogXCJcIixcbiAgICBxdWVzdGlvbjogJ21lc3NhZ2UnLFxuICAgIC8vIGJ1dHRvblllczogbGcoJ3llcycpLFxuICAgIGNhbGxiYWNrWWVzOiBmYWxzZSxcbiAgICBidXR0b25UYWc6ICdkaXYnLFxuICAgIG9iajogZmFsc2VcbiAgfTtcblxuICBmdW5jdGlvbiB0ZXN0SXBob25lKCkge1xuICAgIGlmICghLyhpUGhvbmV8aVBhZHxpUG9kKS4qKE9TIDExKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgcmV0dXJuO1xuICAgIG5vdGlmaWNhdGlvbl9ib3guY3NzKCdwb3NpdGlvbicsICdhYnNvbHV0ZScpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3guY3NzKCd0b3AnLCAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIGlzX2luaXQgPSB0cnVlO1xuICAgIG5vdGlmaWNhdGlvbl9ib3ggPSAkKCcubm90aWZpY2F0aW9uX2JveCcpO1xuICAgIGlmIChub3RpZmljYXRpb25fYm94Lmxlbmd0aCA+IDApcmV0dXJuO1xuXG4gICAgJCgnYm9keScpLmFwcGVuZChcIjxkaXYgY2xhc3M9J25vdGlmaWNhdGlvbl9ib3gnPjwvZGl2PlwiKTtcbiAgICBub3RpZmljYXRpb25fYm94ID0gJCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcblxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgJy5ub3RpZnlfY29udHJvbCcsIGNsb3NlTW9kYWwpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgJy5ub3RpZnlfY2xvc2UnLCBjbG9zZU1vZGFsKTtcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsIGNsb3NlTW9kYWxGb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpIHtcbiAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgJCgnLm5vdGlmaWNhdGlvbl9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbCgnJyk7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgIGlmICh0YXJnZXQuY2xhc3NOYW1lID09IFwibm90aWZpY2F0aW9uX2JveFwiKSB7XG4gICAgICBjbG9zZU1vZGFsKCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5ub3RpZmljYXRpb25fY2xvc2UnLCBfY2xvc2VQb3B1cCk7XG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcbiAgfTtcblxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodGltZXJDbGVhckFsbCAhPSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJDbGVhckFsbCk7XG4gICAgICB0aW1lckNsZWFyQWxsID0gbnVsbDtcbiAgICB9XG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgIHZhciBvcHRpb24gPSAkKHRoaXMpLmRhdGEoJ29wdGlvbicpO1xuICAgICAgaWYgKG9wdGlvbi50aW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAxO1xuICB9O1xuXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgdmFyIG9wdGlvbiA9ICR0aGlzLmRhdGEoJ29wdGlvbicpO1xuICAgICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xuICAgICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQob3B0aW9uLmNsb3NlKSwgb3B0aW9uLnRpbWUgLSAxNTAwICsgMTAwICogaSk7XG4gICAgICAgICR0aGlzLmRhdGEoJ29wdGlvbicsIG9wdGlvbilcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAwO1xuICB9O1xuXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAkdGhpcy5vbihhbmltYXRpb25FbmQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgfSk7XG4gICAgJHRoaXMuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9oaWRlJylcbiAgfTtcblxuICBmdW5jdGlvbiBhbGVydChkYXRhKSB7XG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcbiAgICBhbGVydF9vcHQgPSBvYmplY3RzKGFsZXJ0X29wdCwge1xuICAgICAgICBidXR0b25ZZXM6IGxnKCd5ZXMnKVxuICAgIH0pO1xuICAgIGRhdGEgPSBvYmplY3RzKGFsZXJ0X29wdCwgZGF0YSk7XG5cbiAgICBpZiAoIWlzX2luaXQpaW5pdCgpO1xuICAgIHRlc3RJcGhvbmUoKTtcblxuICAgIG5vdHlmeV9jbGFzcyA9ICdub3RpZnlfYm94ICc7XG4gICAgaWYgKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcyArPSBkYXRhLm5vdHlmeV9jbGFzcztcblxuICAgIGJveF9odG1sID0gJzxkaXYgY2xhc3M9XCInICsgbm90eWZ5X2NsYXNzICsgJ1wiPic7XG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xuICAgIGJveF9odG1sICs9IGRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8JyArIGRhdGEuYnV0dG9uVGFnICsgJyBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCIgJyArIGRhdGEuYnV0dG9uWWVzRG9wICsgJz4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC8nICsgZGF0YS5idXR0b25UYWcgKyAnPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJyArIGRhdGEuYnV0dG9uTm9Eb3AgKyAnPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgfSwgMTAwKVxuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKSB7XG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcbiAgICBjb25maXJtX29wdCA9IG9iamVjdHMoY29uZmlybV9vcHQsIHtcbiAgICAgICAgdGl0bGU6IGxnKCdkZWxldGluZycpLFxuICAgICAgICBxdWVzdGlvbjogbGcoJ2FyZV95b3Vfc3VyZV90b19kZWxldGUnKSxcbiAgICAgICAgYnV0dG9uWWVzOiBsZygneWVzJyksXG4gICAgICAgIGJ1dHRvbk5vOiBsZygnbm8nKVxuICAgIH0pO1xuICAgIGRhdGEgPSBvYmplY3RzKGNvbmZpcm1fb3B0LCBkYXRhKTtcbiAgICBpZiAodHlwZW9mKGRhdGEuY2FsbGJhY2tZZXMpID09ICdzdHJpbmcnKSB7XG4gICAgICB2YXIgY29kZSA9ICdkYXRhLmNhbGxiYWNrWWVzID0gZnVuY3Rpb24oKXsnK2RhdGEuY2FsbGJhY2tZZXMrJ30nO1xuICAgICAgZXZhbChjb2RlKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzX2luaXQpaW5pdCgpO1xuICAgIHRlc3RJcGhvbmUoKTtcbiAgICAvL2JveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XG5cbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XG5cbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xuXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xuICAgIGJveF9odG1sICs9IGRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG5cbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG4gICAgaWYgKGRhdGEuY2FsbGJhY2tZZXMgIT0gZmFsc2UpIHtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5feWVzJykub24oJ2NsaWNrJywgZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuICAgIGlmIChkYXRhLmNhbGxiYWNrTm8gIT0gZmFsc2UpIHtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrTm8uYmluZChkYXRhLm9iaikpO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sIDEwMClcblxuICB9XG5cbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xuICAgIHZhciBvcHRpb24gPSB7dGltZTogKGRhdGEudGltZSB8fCBkYXRhLnRpbWUgPT09IDApID8gZGF0YS50aW1lIDogdGltZX07XG4gICAgaWYgKCFjb250ZWluZXIpIHtcbiAgICAgIGNvbnRlaW5lciA9ICQoJzx1bC8+Jywge1xuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcbiAgICAgIH0pO1xuXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XG4gICAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgICB9XG5cbiAgICB2YXIgbGkgPSAkKCc8bGkvPicsIHtcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2l0ZW0nXG4gICAgfSk7XG5cbiAgICBpZiAoZGF0YS50eXBlKSB7XG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XG4gICAgfVxuXG4gICAgdmFyIGNsb3NlID0gJCgnPHNwYW4vPicsIHtcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2Nsb3NlJ1xuICAgIH0pO1xuICAgIG9wdGlvbi5jbG9zZSA9IGNsb3NlO1xuICAgIGxpLmFwcGVuZChjbG9zZSk7XG5cbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicsIHtcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcbiAgICB9KTtcblxuICAgIGlmIChkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHRpdGxlID0gJCgnPGg1Lz4nLCB7XG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXG4gICAgICB9KTtcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XG4gICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSk7XG4gICAgfVxuXG4gICAgdmFyIHRleHQgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGV4dFwiXG4gICAgfSk7XG4gICAgdGV4dC5odG1sKGRhdGEubWVzc2FnZSk7XG5cbiAgICBpZiAoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXG4gICAgICB9KTtcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XG4gICAgICB2YXIgd3JhcCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwid3JhcFwiXG4gICAgICB9KTtcblxuICAgICAgd3JhcC5hcHBlbmQoaW1nKTtcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xuICAgICAgY29udGVudC5hcHBlbmQod3JhcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRleHQpO1xuICAgIH1cbiAgICBsaS5hcHBlbmQoY29udGVudCk7XG5cbiAgICAvL1xuICAgIC8vIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xuICAgIC8vICAgdmFyIHRpdGxlID0gJCgnPHAvPicsIHtcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcbiAgICAvLyAgIH0pO1xuICAgIC8vICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcbiAgICAvLyAgIGxpLmFwcGVuZCh0aXRsZSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcbiAgICAvLyAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxuICAgIC8vICAgfSk7XG4gICAgLy8gICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcbiAgICAvLyAgIGxpLmFwcGVuZChpbWcpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XG4gICAgLy8gICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcbiAgICAvLyB9KTtcbiAgICAvLyBjb250ZW50Lmh0bWwoZGF0YS5tZXNzYWdlKTtcbiAgICAvL1xuICAgIC8vIGxpLmFwcGVuZChjb250ZW50KTtcbiAgICAvL1xuICAgIGNvbnRlaW5lci5hcHBlbmQobGkpO1xuXG4gICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xuICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKGNsb3NlKSwgb3B0aW9uLnRpbWUpO1xuICAgIH1cbiAgICBsaS5kYXRhKCdvcHRpb24nLCBvcHRpb24pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFsZXJ0OiBhbGVydCxcbiAgICBjb25maXJtOiBjb25maXJtLFxuICAgIG5vdGlmaTogbm90aWZpXG4gIH07XG5cbn0pKCk7XG5cblxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGEgPSBlbC5kYXRhKCk7XG5cbiAgZGF0YS5xdWVzdGlvbiA9IGVsLmh0bWwoKTtcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xufSk7XG5cbiQoJ1tyZWY9Y29uZmlybV0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGEgPSBlbC5kYXRhKCk7XG4gIGRhdGEucXVlc3Rpb24gPSBlbC5odG1sKCk7XG4gIG5vdGlmaWNhdGlvbi5jb25maXJtKGRhdGEpO1xufSk7XG5cblxuJCgnLmRpc2FibGVkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkdGhpcyA9ICQodGhpcyk7XG4gIGRhdGEgPSAkdGhpcy5kYXRhKCk7XG4gIGlmIChkYXRhWydidXR0b25feWVzJ10pIHtcbiAgICBkYXRhWydidXR0b25ZZXMnXSA9IGRhdGFbJ2J1dHRvbl95ZXMnXTtcbiAgfVxuICBpZiAoZGF0YVsnYnV0dG9uX3llcyddID09PSBmYWxzZSkge1xuICAgIGRhdGFbJ2J1dHRvblllcyddID0gZmFsc2U7XG4gIH1cblxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tb2RhbHNfb3BlbicsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG5cbiAgICAvL9C/0YDQuCDQvtGC0LrRgNGL0YLQuNC4INGE0L7RgNC80Ysg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuCDQt9Cw0LrRgNGL0YLRjCwg0LXRgdC70Lgg0L7RgtGA0YvRgtC+IC0g0L/QvtC/0LDQvyDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjyDQutGD0L/QvtC90LAg0LHQtdC3INGA0LXQs9C40YHRgtGA0LDRhtC40LhcbiAgICB2YXIgcG9wdXAgPSAkKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikuZGF0YSgncG9wdXAnKTtcbiAgICBpZiAocG9wdXApIHtcbiAgICAgIHBvcHVwLmNsb3NlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvcHVwID0gJCgnZGl2LnBvcHVwX2NvbnQsIGRpdi5wb3B1cF9iYWNrJyk7XG4gICAgICBpZiAocG9wdXApIHtcbiAgICAgICAgcG9wdXAuaGlkZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBocmVmID0gdGhpcy5ocmVmLnNwbGl0KCcjJyk7XG4gICAgaHJlZiA9IGhyZWZbaHJlZi5sZW5ndGggLSAxXTtcbiAgICB2YXIgbm90eUNsYXNzID0gJCh0aGlzKS5kYXRhKCdub3R5Y2xhc3MnKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGJ1dHRvblllczogZmFsc2UsXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibG9hZGluZyBcIiArIChocmVmLmluZGV4T2YoJ3ZpZGVvJykgPT09IDAgPyAnbW9kYWxzLWZ1bGxfc2NyZWVuJyA6ICdub3RpZnlfd2hpdGUnKSArICcgJyArIG5vdHlDbGFzcyxcbiAgICAgIHF1ZXN0aW9uOiAnJ1xuICAgIH07XG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuXG4gICAgJC5nZXQoJy8nICsgaHJlZiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcbiAgICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcbiAgICB9LCAnanNvbicpO1xuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pXG59KCkpO1xuIiwiJCgnLmZvb3Rlci1tZW51LXRpdGxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgJHRoaXMgPSAkKHRoaXMpO1xuICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKSkge1xuICAgICR0aGlzLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJylcbiAgfSBlbHNlIHtcbiAgICAkKCcuZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XG4gICAgJHRoaXMuYWRkQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKTtcbiAgfVxuXG59KTtcbiIsIiQoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBzdGFyTm9taW5hdGlvbihpbmRleCkge1xuICAgIHZhciBzdGFycyA9ICQoXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIpO1xuICAgIHN0YXJzLmFkZENsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcbiAgICAgIHN0YXJzLmVxKGkpLnJlbW92ZUNsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcbiAgICB9XG4gIH1cblxuICAkKGRvY3VtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcbiAgfSkub24oXCJtb3VzZWxlYXZlXCIsIFwiLnJhdGluZy13cmFwcGVyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoKSk7XG4gIH0pLm9uKFwiY2xpY2tcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XG5cbiAgICAkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgkKHRoaXMpLmluZGV4KCkgKyAxKTtcbiAgfSk7XG59KTtcbiIsIi8v0LjQt9Cx0YDQsNC90L3QvtC1XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICQoXCIuZmF2b3JpdGUtbGlua1wiKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBzZWxmID0gJCh0aGlzKTtcbiAgICB2YXIgdHlwZSA9IHNlbGYuYXR0cihcImRhdGEtc3RhdGVcIiksXG4gICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmF0dHIoXCJkYXRhLWFmZmlsaWF0ZS1pZFwiKTtcblxuICAgIGlmICghYWZmaWxpYXRlX2lkKSB7XG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgdGl0bGU6IGxnKFwicmVnaXN0cmF0aW9uX2lzX3JlcXVpcmVkXCIpLFxuICAgICAgICBtZXNzYWdlOiBsZyhcImFkZF90b19mYXZvcml0ZV9tYXlfb25seV9yZWdpc3RlcmVkX3VzZXJcIiksXG4gICAgICAgIHR5cGU6ICdlcnInXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIH1cblxuICAgIGlmIChzZWxmLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgc2VsZi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblxuICAgIC8qaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgIHNlbGYuZmluZChcIi5pdGVtX2ljb25cIikucmVtb3ZlQ2xhc3MoXCJtdXRlZFwiKTtcbiAgICAgfSovXG5cbiAgICAkLnBvc3QoXCIvYWNjb3VudC9mYXZvcml0ZXNcIiwge1xuICAgICAgXCJ0eXBlXCI6IHR5cGUsXG4gICAgICBcImFmZmlsaWF0ZV9pZFwiOiBhZmZpbGlhdGVfaWRcbiAgICB9LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIGlmIChkYXRhLmVycm9yKSB7XG4gICAgICAgIHNlbGYuZmluZCgnc3ZnJykucmVtb3ZlQ2xhc3MoXCJzcGluXCIpO1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOiBkYXRhLmVycm9yLCB0eXBlOiAnZXJyJywgJ3RpdGxlJzogKGRhdGEudGl0bGUgPyBkYXRhLnRpdGxlIDogZmFsc2UpfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgIG1lc3NhZ2U6IGRhdGEubXNnLFxuICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICd0aXRsZSc6IChkYXRhLnRpdGxlID8gZGF0YS50aXRsZSA6IGZhbHNlKVxuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuYXR0cih7XG4gICAgICAgIFwiZGF0YS1zdGF0ZVwiOiBkYXRhW1wiZGF0YS1zdGF0ZVwiXSxcbiAgICAgICAgXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCI6IGRhdGFbJ2RhdGEtb3JpZ2luYWwtdGl0bGUnXVxuICAgICAgfSk7XG5cbiAgICAgIGlmICh0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb2ZmXCIpLmFkZENsYXNzKFwiaW5fZmF2X29uXCIpO1xuICAgICAgICBzZWxmLmRhdGEoJ29yaWdpbmFsLXRpdGxlJywgbGcoXCJmYXZvcml0ZXNfc2hvcF9yZW1vdmVcIikpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiZGVsZXRlXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb25cIikuYWRkQ2xhc3MoXCJpbl9mYXZfb2ZmXCIpO1xuICAgICAgICBzZWxmLmRhdGEoJ29yaWdpbmFsLXRpdGxlJywgbGcoXCJmYXZvcml0ZXNfc2hvcF9hZGRcIikpO1xuICAgICAgfVxuXG4gICAgfSwgJ2pzb24nKS5mYWlsKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgbWVzc2FnZTogbGcoXCJ0aGVyZV9pc190ZWNobmljYWxfd29ya3Nfbm93XCIpLFxuICAgICAgICB0eXBlOiAnZXJyJ1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb2ZmXCIpLmFkZENsYXNzKFwiaW5fZmF2X29uXCIpO1xuICAgICAgICBzZWxmLmRhdGEoJ29yaWdpbmFsLXRpdGxlJywgbGcoXCJmYXZvcml0ZXNfc2hvcF9yZW1vdmVcIikpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiZGVsZXRlXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb25cIikuYWRkQ2xhc3MoXCJpbl9mYXZfb2ZmXCIpO1xuICAgICAgICBzZWxmLmRhdGEoJ29yaWdpbmFsLXRpdGxlJywgbGcoXCJmYXZvcml0ZXNfc2hvcF9hZGRcIikpO1xuICAgICAgfVxuXG4gICAgfSlcbiAgfSk7XG59KTtcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgJCgnLnNjcm9sbF90bycpLmNsaWNrKGZ1bmN0aW9uIChlKSB7IC8vINC70L7QstC40Lwg0LrQu9C40Log0L/QviDRgdGB0YvQu9C60LUg0YEg0LrQu9Cw0YHRgdC+0LwgZ29fdG9cbiAgICB2YXIgc2Nyb2xsX2VsID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7IC8vINCy0L7Qt9GM0LzQtdC8INGB0L7QtNC10YDQttC40LzQvtC1INCw0YLRgNC40LHRg9GC0LAgaHJlZiwg0LTQvtC70LbQtdC9INCx0YvRgtGMINGB0LXQu9C10LrRgtC+0YDQvtC8LCDRgi7QtS4g0L3QsNC/0YDQuNC80LXRgCDQvdCw0YfQuNC90LDRgtGM0YHRjyDRgSAjINC40LvQuCAuXG4gICAgc2Nyb2xsX2VsID0gJChzY3JvbGxfZWwpO1xuICAgIGlmIChzY3JvbGxfZWwubGVuZ3RoICE9IDApIHsgLy8g0L/RgNC+0LLQtdGA0LjQvCDRgdGD0YnQtdGB0YLQstC+0LLQsNC90LjQtSDRjdC70LXQvNC10L3RgtCwINGH0YLQvtCx0Ysg0LjQt9Cx0LXQttCw0YLRjCDQvtGI0LjQsdC60LhcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IHNjcm9sbF9lbC5vZmZzZXQoKS50b3AgLSAkKCcjaGVhZGVyPionKS5lcSgwKS5oZWlnaHQoKSAtIDUwfSwgNTAwKTsgLy8g0LDQvdC40LzQuNGA0YPQtdC8INGB0LrRgNC+0L7Qu9C40L3QsyDQuiDRjdC70LXQvNC10L3RgtGDIHNjcm9sbF9lbFxuICAgICAgaWYgKHNjcm9sbF9lbC5oYXNDbGFzcygnYWNjb3JkaW9uJykgJiYgIXNjcm9sbF9lbC5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAgIHNjcm9sbF9lbC5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wnKS5jbGljaygpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7IC8vINCy0YvQutC70Y7Rh9Cw0LXQvCDRgdGC0LDQvdC00LDRgNGC0L3QvtC1INC00LXQudGB0YLQstC40LVcbiAgfSk7XG59KTtcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgJChcImJvZHlcIikub24oJ2NsaWNrJywgJy5zZXRfY2xpcGJvYXJkJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICBjb3B5VG9DbGlwYm9hcmQoJHRoaXMuZGF0YSgnY2xpcGJvYXJkJyksICR0aGlzLmRhdGEoJ2NsaXBib2FyZC1ub3RpZnknKSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGNvcHlUb0NsaXBib2FyZChjb2RlLCBtc2cpIHtcbiAgICB2YXIgJHRlbXAgPSAkKFwiPGlucHV0PlwiKTtcbiAgICAkKFwiYm9keVwiKS5hcHBlbmQoJHRlbXApO1xuICAgICR0ZW1wLnZhbChjb2RlKS5zZWxlY3QoKTtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIik7XG4gICAgJHRlbXAucmVtb3ZlKCk7XG5cbiAgICBpZiAoIW1zZykge1xuICAgICAgbXNnID0gbGcoXCJkYXRhX2NvcGllZF90b19jbGlwYm9hcmRcIik7XG4gICAgfVxuICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoeyd0eXBlJzogJ2luZm8nLCAnbWVzc2FnZSc6IG1zZywgJ3RpdGxlJzogbGcoJ3N1Y2Nlc3MnKX0pXG4gIH1cblxuICAkKFwiYm9keVwiKS5vbignY2xpY2snLCBcImlucHV0LmxpbmtcIiwgZnVuY3Rpb24gKCkge1x0Ly8g0L/QvtC70YPRh9C10L3QuNC1INGE0L7QutGD0YHQsCDRgtC10LrRgdGC0L7QstGL0Lwg0L/QvtC70LXQvC3RgdGB0YvQu9C60L7QuVxuICAgICQodGhpcykuc2VsZWN0KCk7XG4gIH0pO1xufSk7XG4iLCIvL9GB0LrQsNGH0LjQstCw0L3QuNC1INC60LDRgNGC0LjQvdC+0LpcbihmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgdmFyIGltZyA9IGRhdGEuaW1nO1xuICAgIGltZy53cmFwKCc8ZGl2IGNsYXNzPVwiZG93bmxvYWRcIj48L2Rpdj4nKTtcbiAgICB2YXIgd3JhcCA9IGltZy5wYXJlbnQoKTtcbiAgICAkKCcuZG93bmxvYWRfdGVzdCcpLmFwcGVuZChkYXRhLmVsKTtcbiAgICBzaXplID0gZGF0YS5lbC53aWR0aCgpICsgXCJ4XCIgKyBkYXRhLmVsLmhlaWdodCgpO1xuXG4gICAgdz1kYXRhLmVsLndpZHRoKCkqMC44O1xuICAgIGltZ1xuICAgICAgLmhlaWdodCgnYXV0bycpXG4gICAgICAvLy53aWR0aCh3KVxuICAgICAgLmNzcygnbWF4LXdpZHRoJywnOTklJyk7XG5cblxuICAgIGRhdGEuZWwucmVtb3ZlKCk7XG4gICAgd3JhcC5hcHBlbmQoJzxzcGFuPicgKyBzaXplICsgJzwvc3Bhbj4gPGEgaHJlZj1cIicgKyBkYXRhLnNyYyArICdcIiBkb3dubG9hZD4nK2xnKFwiZG93bmxvYWRcIikrJzwvYT4nKTtcbiAgfVxuXG4gIHZhciBpbWdzID0gJCgnLmRvd25sb2Fkc19pbWcgaW1nJyk7XG4gIGlmKGltZ3MubGVuZ3RoPT0wKXJldHVybjtcblxuICAkKCdib2R5JykuYXBwZW5kKCc8ZGl2IGNsYXNzPWRvd25sb2FkX3Rlc3Q+PC9kaXY+Jyk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpbWcgPSBpbWdzLmVxKGkpO1xuICAgIHZhciBzcmMgPSBpbWcuYXR0cignc3JjJyk7XG4gICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XG4gICAgICBzcmM6IHNyY1xuICAgIH0pO1xuICAgIGRhdGEgPSB7XG4gICAgICBzcmM6IHNyYyxcbiAgICAgIGltZzogaW1nLFxuICAgICAgZWw6IGltYWdlXG4gICAgfTtcbiAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxuICB9XG59KSgpO1xuXG4vL9GH0YLQviDQsSDQuNGE0YDQtdC50LzRiyDQuCDQutCw0YDRgtC40L3QutC4INC90LUg0LLRi9C70LDQt9C40LvQuFxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgLyptX3cgPSAkKCcudGV4dC1jb250ZW50Jykud2lkdGgoKVxuICAgaWYgKG1fdyA8IDUwKW1fdyA9IHNjcmVlbi53aWR0aCAtIDQwKi9cbiAgdmFyIG13PXNjcmVlbi53aWR0aC00MDtcblxuICBmdW5jdGlvbiBvcHRpbWFzZShlbCl7XG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudCgpO1xuICAgIGlmKHBhcmVudC5sZW5ndGg9PTAgfHwgcGFyZW50WzBdLnRhZ05hbWU9PVwiQVwiKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYoZWwuaGFzQ2xhc3MoJ25vX29wdG9taXplJykpcmV0dXJuO1xuXG4gICAgbV93ID0gcGFyZW50LndpZHRoKCktMzA7XG4gICAgdmFyIHc9ZWwud2lkdGgoKTtcblxuICAgIC8v0LHQtdC3INGN0YLQvtCz0L4g0L/Qu9GO0YnQuNGCINCx0LDQvdC10YDRiyDQsiDQsNC60LDRgNC00LjQvtC90LVcbiAgICBpZih3PDMgfHwgbV93PDMpe1xuICAgICAgZWxcbiAgICAgICAgLmhlaWdodCgnYXV0bycpXG4gICAgICAgIC5jc3MoJ21heC13aWR0aCcsJzk5JScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGVsLndpZHRoKCdhdXRvJyk7XG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJTUdcIiAmJiB3PmVsLndpZHRoKCkpdz1lbC53aWR0aCgpO1xuXG4gICAgaWYgKG13PjUwICYmIG1fdyA+IG13KW1fdyA9IG13O1xuICAgIGlmICh3Pm1fdykge1xuICAgICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIil7XG4gICAgICAgIGsgPSB3IC8gbV93O1xuICAgICAgICBlbC5oZWlnaHQoZWwuaGVpZ2h0KCkgLyBrKTtcbiAgICAgIH1cbiAgICAgIGVsLndpZHRoKG1fdylcbiAgICB9ZWxzZXtcbiAgICAgIGVsLndpZHRoKHcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xuICAgIHZhciBlbD0kKHRoaXMpO1xuICAgIG9wdGltYXNlKGVsKTtcbiAgfVxuXG4gIHZhciBwID0gJCgnLmNvbnRlbnQtd3JhcCBpbWcsLmNvbnRlbnQtd3JhcCBpZnJhbWUnKTtcbiAgJCgnLmNvbnRlbnQtd3JhcCBpbWc6bm90KC5ub19vcHRvbWl6ZSknKS5oZWlnaHQoJ2F1dG8nKTtcbiAgLy8kKCcuY29udGFpbmVyIGltZycpLndpZHRoKCdhdXRvJyk7XG4gIGZvciAoaSA9IDA7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgZWwgPSBwLmVxKGkpO1xuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpIHtcbiAgICAgIG9wdGltYXNlKGVsKTtcbiAgICB9ZWxzZXtcbiAgICAgIHZhciBzcmM9ZWwuYXR0cignc3JjJyk7XG4gICAgICBpbWFnZSA9ICQoJzxpbWcvPicsIHtcbiAgICAgICAgc3JjOiBzcmNcbiAgICAgIH0pO1xuICAgICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChlbCkpO1xuICAgIH1cbiAgfVxufSk7XG5cblxuLy/Qn9GA0L7QstC10YDQutCwINCx0LjRgtGLINC60LDRgNGC0LjQvdC+0LouXG4vLyAhISEhISFcbi8vINCd0YPQttC90L4g0L/RgNC+0LLQtdGA0LjRgtGMLiDQktGL0LfRi9Cy0LDQu9C+INCz0LvRjtC60Lgg0L/RgNC4INCw0LLRgtC+0YDQt9Cw0YbQuNC4INGH0LXRgNC10Lcg0KTQkSDQvdCwINGB0LDRhNCw0YDQuFxuLy8gISEhISEhXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcbiAgICB2YXIgZGF0YT10aGlzO1xuICAgIGlmKGRhdGEudGFnTmFtZSl7XG4gICAgICBkYXRhPSQoZGF0YSkuZGF0YSgnZGF0YScpO1xuICAgIH1cbiAgICB2YXIgaW1nPWRhdGEuaW1nO1xuICAgIC8vdmFyIHRuPWltZ1swXS50YWdOYW1lO1xuICAgIC8vaWYgKHRuIT0nSU1HJ3x8dG4hPSdESVYnfHx0biE9J1NQQU4nKXJldHVybjtcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcbiAgICAgIGltZy5hdHRyKCdzcmMnLCBkYXRhLnNyYyk7XG4gICAgfWVsc2V7XG4gICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XG4gICAgICBpbWcucmVtb3ZlQ2xhc3MoJ25vX2F2YScpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRlc3RJbWcoaW1ncyxub19pbWcpe1xuICAgIGlmKCFpbWdzIHx8IGltZ3MubGVuZ3RoPT0wKXJldHVybjtcblxuICAgIGlmKCFub19pbWcpbm9faW1nPScvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJztcblxuICAgIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XG4gICAgICB2YXIgaW1nPWltZ3MuZXEoaSk7XG4gICAgICBpZihpbWcuaGFzQ2xhc3MoJ25vX2F2YScpKXtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBkYXRhPXtcbiAgICAgICAgaW1nOmltZ1xuICAgICAgfTtcbiAgICAgIHZhciBzcmM7XG4gICAgICBpZihpbWdbMF0udGFnTmFtZT09XCJJTUdcIil7XG4gICAgICAgIGRhdGEudHlwZT0wO1xuICAgICAgICBzcmM9aW1nLmF0dHIoJ3NyYycpO1xuICAgICAgICBpbWcuYXR0cignc3JjJyxub19pbWcpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGRhdGEudHlwZT0xO1xuICAgICAgICBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xuICAgICAgICBpZighc3JjKWNvbnRpbnVlO1xuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybChcIicsJycpO1xuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ1wiKScsJycpO1xuICAgICAgICAvL9CyINGB0YTRhNCw0YDQuCDQsiDQvNCw0Log0L7RgSDQsdC10Lcg0LrQvtCy0YvRh9C10LouINCy0LXQt9C00LUg0YEg0LrQsNCy0YvRh9C60LDQvNC4XG4gICAgICAgIHNyYz1zcmMucmVwbGFjZSgndXJsKCcsJycpO1xuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJyknLCcnKTtcbiAgICAgICAgaW1nLmFkZENsYXNzKCdub19hdmEnKTtcbiAgICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK25vX2ltZysnKScpO1xuICAgICAgfVxuICAgICAgZGF0YS5zcmM9c3JjO1xuICAgICAgdmFyIGltYWdlPSQoJzxpbWcvPicse1xuICAgICAgICBzcmM6c3JjXG4gICAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpO1xuICAgICAgaW1hZ2UuZGF0YSgnZGF0YScsZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgLy/RgtC10YHRgiDQu9C+0LPQviDQvNCw0LPQsNC30LjQvdCwXG4gIHZhciBpbWdzPSQoJ3NlY3Rpb246bm90KC5uYXZpZ2F0aW9uKScpO1xuICBpbWdzPWltZ3MuZmluZCgnLmxvZ28gaW1nJyk7XG4gIHRlc3RJbWcoaW1ncywnL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZycpO1xuXG4gIC8v0YLQtdGB0YIg0LDQstCw0YLQsNGA0L7QuiDQsiDQutC+0LzQtdC90YLQsNGA0LjRj9GFXG4gIGltZ3M9JCgnLmNvbW1lbnQtcGhvdG8sLnNjcm9sbF9ib3gtYXZhdGFyJyk7XG4gIHRlc3RJbWcoaW1ncywnL2ltYWdlcy9ub19hdmFfc3F1YXJlLnBuZycpO1xufSk7XG4iLCIvL9C10YHQu9C4INC+0YLQutGA0YvRgtC+INC60LDQuiDQtNC+0YfQtdGA0L3QtdC1XG4oZnVuY3Rpb24gKCkge1xuICBpZiAoIXdpbmRvdy5vcGVuZXIpcmV0dXJuO1xuICB0cnkge1xuICAgIGhyZWYgPSB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY7XG4gICAgaWYgKFxuICAgICAgaHJlZi5pbmRleE9mKCdhY2NvdW50L29mZmxpbmUnKSA+IDBcbiAgICApIHtcbiAgICAgIHdpbmRvdy5wcmludCgpXG4gICAgfVxuXG4gICAgaWYgKGRvY3VtZW50LnJlZmVycmVyLmluZGV4T2YoJ3NlY3JldGRpc2NvdW50ZXInKSA8IDApcmV0dXJuO1xuXG4gICAgaWYgKFxuICAgICAgaHJlZi5pbmRleE9mKCdzb2NpYWxzJykgPiAwIHx8XG4gICAgICBocmVmLmluZGV4T2YoJ2xvZ2luJykgPiAwIHx8XG4gICAgICBocmVmLmluZGV4T2YoJ2FkbWluJykgPiAwIHx8XG4gICAgICBocmVmLmluZGV4T2YoJ2FjY291bnQnKSA+IDBcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoaHJlZi5pbmRleE9mKCdzdG9yZScpID4gMCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpID4gMCB8fCBocmVmLmluZGV4T2YoJ3NldHRpbmdzJykgPiAwKSB7XG4gICAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xuICAgIH1cbiAgICB3aW5kb3cuY2xvc2UoKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG5cbiAgfVxufSkoKTtcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgJCgnaW5wdXRbdHlwZT1maWxlXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgdmFyIGZpbGUgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcbiAgICB2YXIgZiA9IGZpbGVbMF07XG4gICAgLy8gT25seSBwcm9jZXNzIGltYWdlIGZpbGVzLlxuICAgIGlmICghZi50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgICBkYXRhID0ge1xuICAgICAgJ2VsJzogdGhpcyxcbiAgICAgICdmJzogZlxuICAgIH07XG4gICAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGltZyA9ICQoJ1tmb3I9XCInICsgZGF0YS5lbC5uYW1lICsgJ1wiXScpO1xuICAgICAgICBpZiAoaW1nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBpbWcuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKGRhdGEpO1xuICAgIC8vIFJlYWQgaW4gdGhlIGltYWdlIGZpbGUgYXMgYSBkYXRhIFVSTC5cbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmKTtcbiAgfSk7XG5cbiAgJCgnLmR1YmxpY2F0ZV92YWx1ZScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICB2YXIgc2VsID0gJCgkdGhpcy5kYXRhKCdzZWxlY3RvcicpKTtcbiAgICBzZWwudmFsKHRoaXMudmFsdWUpO1xuICB9KVxufSk7XG4iLCJcbmZ1bmN0aW9uIGdldENvb2tpZShuKSB7XG4gIHJldHVybiB1bmVzY2FwZSgoUmVnRXhwKG4gKyAnPShbXjtdKyknKS5leGVjKGRvY3VtZW50LmNvb2tpZSkgfHwgWzEsICcnXSlbMV0pO1xufVxuXG5mdW5jdGlvbiBzZXRDb29raWUobmFtZSwgdmFsdWUsIGRheXMpIHtcbiAgdmFyIGV4cGlyZXMgPSAnJztcbiAgaWYgKGRheXMpIHtcbiAgICAgIHZhciBkYXRlID0gbmV3IERhdGU7XG4gICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBkYXlzKTtcbiAgICAgIGV4cGlyZXMgPSAnOyBleHBpcmVzPScgKyBkYXRlLnRvVVRDU3RyaW5nKCk7XG4gIH1cbiAgZG9jdW1lbnQuY29va2llID0gbmFtZSArIFwiPVwiICsgZXNjYXBlICggdmFsdWUgKSArIGV4cGlyZXM7XG59XG5cbmZ1bmN0aW9uIGVyYXNlQ29va2llKG5hbWUpe1xuICB2YXIgY29va2llX3N0cmluZyA9IG5hbWUgKyBcIj0wXCIgK1wiOyBleHBpcmVzPVdlZCwgMDEgT2N0IDIwMTcgMDA6MDA6MDAgR01UXCI7XG4gIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZV9zdHJpbmc7XG59XG5cbmRvY3VtZW50LmNvb2tpZS5zcGxpdChcIjtcIikuZm9yRWFjaChmdW5jdGlvbihjKSB7IGRvY3VtZW50LmNvb2tpZSA9IGMucmVwbGFjZSgvXiArLywgXCJcIikucmVwbGFjZSgvPS4qLywgXCI9O2V4cGlyZXM9XCIgKyBuZXcgRGF0ZSgpLnRvVVRDU3RyaW5nKCkgKyBcIjtwYXRoPS9cIik7IH0pOyIsIihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgdGFibGVzID0gJCgndGFibGUuYWRhcHRpdmUnKTtcblxuICBpZiAodGFibGVzLmxlbmd0aCA9PSAwKXJldHVybjtcblxuICBmb3IgKHZhciBpID0gMDsgdGFibGVzLmxlbmd0aCA+IGk7IGkrKykge1xuICAgIHZhciB0YWJsZSA9IHRhYmxlcy5lcShpKTtcbiAgICB2YXIgdGggPSB0YWJsZS5maW5kKCd0aGVhZCcpO1xuICAgIGlmICh0aC5sZW5ndGggPT0gMCkge1xuICAgICAgdGggPSB0YWJsZS5maW5kKCd0cicpLmVxKDApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aCA9IHRoLmZpbmQoJ3RyJykuZXEoMCk7XG4gICAgfVxuICAgIHRoID0gdGguYWRkQ2xhc3MoJ3RhYmxlLWhlYWRlcicpLmZpbmQoJ3RkLHRoJyk7XG5cbiAgICB2YXIgdHIgPSB0YWJsZS5maW5kKCd0cicpLm5vdCgnLnRhYmxlLWhlYWRlcicpO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aC5sZW5ndGg7IGorKykge1xuICAgICAgdmFyIGsgPSBqICsgMTtcbiAgICAgIHZhciB0ZCA9IHRyLmZpbmQoJ3RkOm50aC1jaGlsZCgnICsgayArICcpJyk7XG4gICAgICB0ZC5hdHRyKCdsYWJlbCcsIHRoLmVxKGopLnRleHQoKSk7XG4gICAgfVxuICB9XG5cbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuIiwiO1xuJChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gb25SZW1vdmUoKXtcbiAgICAkdGhpcz0kKHRoaXMpO1xuICAgIHBvc3Q9e1xuICAgICAgaWQ6JHRoaXMuYXR0cigndWlkJyksXG4gICAgICB0eXBlOiR0aGlzLmF0dHIoJ21vZGUnKVxuICAgIH07XG4gICAgJC5wb3N0KCR0aGlzLmF0dHIoJ3VybCcpLHBvc3QsZnVuY3Rpb24oZGF0YSl7XG4gICAgICBpZihkYXRhICYmIGRhdGE9PSdlcnInKXtcbiAgICAgICAgbXNnPSR0aGlzLmRhdGEoJ3JlbW92ZS1lcnJvcicpO1xuICAgICAgICBpZighbXNnKXtcbiAgICAgICAgICBtc2c9J9Cd0LXQstC+0LfQvNC+0LbQvdC+INGD0LTQsNC70LjRgtGMINGN0LvQtdC80LXQvdGCJztcbiAgICAgICAgfVxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOm1zZyx0eXBlOidlcnInfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbW9kZT0kdGhpcy5hdHRyKCdtb2RlJyk7XG4gICAgICBpZighbW9kZSl7XG4gICAgICAgIG1vZGU9J3JtJztcbiAgICAgIH1cblxuICAgICAgaWYobW9kZT09J3JtJykge1xuICAgICAgICBybSA9ICR0aGlzLmNsb3Nlc3QoJy50b19yZW1vdmUnKTtcbiAgICAgICAgcm1fY2xhc3MgPSBybS5hdHRyKCdybV9jbGFzcycpO1xuICAgICAgICBpZiAocm1fY2xhc3MpIHtcbiAgICAgICAgICAkKHJtX2NsYXNzKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJtLnJlbW92ZSgpO1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQo9GB0L/QtdGI0L3QvtC1INGD0LTQsNC70LXQvdC40LUuJyx0eXBlOidpbmZvJ30pXG4gICAgICB9XG4gICAgICBpZihtb2RlPT0ncmVsb2FkJyl7XG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICBsb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XG4gICAgICB9XG4gICAgfSkuZmFpbChmdW5jdGlvbigpe1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J7RiNC40LHQutCwINGD0LTQsNC70L3QuNGPJyx0eXBlOidlcnInfSk7XG4gICAgfSlcbiAgfVxuXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuYWpheF9yZW1vdmUnLGZ1bmN0aW9uKCl7XG4gICAgbm90aWZpY2F0aW9uLmNvbmZpcm0oe1xuICAgICAgY2FsbGJhY2tZZXM6b25SZW1vdmUsXG4gICAgICBvYmo6JCh0aGlzKSxcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfYm94LWFsZXJ0XCJcbiAgICB9KVxuICB9KTtcblxufSk7XG5cbiIsImlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAob1RoaXMpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vINCx0LvQuNC20LDQudGI0LjQuSDQsNC90LDQu9C+0LMg0LLQvdGD0YLRgNC10L3QvdC10Lkg0YTRg9C90LrRhtC40LhcbiAgICAgIC8vIElzQ2FsbGFibGUg0LIgRUNNQVNjcmlwdCA1XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgIH1cblxuICAgIHZhciBhQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICBmVG9CaW5kID0gdGhpcyxcbiAgICAgIGZOT1AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB9LFxuICAgICAgZkJvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUCAmJiBvVGhpc1xuICAgICAgICAgICAgPyB0aGlzXG4gICAgICAgICAgICA6IG9UaGlzLFxuICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICB9O1xuXG4gICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcblxuICAgIHJldHVybiBmQm91bmQ7XG4gIH07XG59XG4iLCIoZnVuY3Rpb24gKCkge1xuICAkKCcuaGlkZGVuLWxpbmsnKS5yZXBsYWNlV2l0aChmdW5jdGlvbiAoKSB7XG4gICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgIHJldHVybiAnPGEgaHJlZj1cIicgKyAkdGhpcy5kYXRhKCdsaW5rJykgKyAnXCIgcmVsPVwiJysgJHRoaXMuZGF0YSgncmVsJykgKydcIiBjbGFzcz1cIicgKyAkdGhpcy5hdHRyKCdjbGFzcycpICsgJ1wiPicgKyAkdGhpcy50ZXh0KCkgKyAnPC9hPic7XG4gIH0pXG59KSgpO1xuIiwidmFyIHN0b3JlX3BvaW50cyA9IChmdW5jdGlvbigpe1xuXG5cbiAgICBmdW5jdGlvbiBjaGFuZ2VDb3VudHJ5KCl7XG4gICAgICAgIHZhciB0aGF0ID0gJCgnI3N0b3JlX3BvaW50X2NvdW50cnknKTtcbiAgICAgICAgaWYgKHRoYXQubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0T3B0aW9ucyA9ICQodGhhdCkuZmluZCgnb3B0aW9uJyk7XG4gICAgICAgICAgICB2YXIgZGF0YSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmRhdGEoJ2NpdGllcycpLFxuICAgICAgICAgICAgICAgIHBvaW50cyA9ICQoJyNzdG9yZS1wb2ludHMnKSxcbiAgICAgICAgICAgICAgICBjb3VudHJ5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgdGhhdCkuYXR0cigndmFsdWUnKTtcbiAgICAgICAgICAgIGlmIChzZWxlY3RPcHRpb25zLmxlbmd0aCA+IDEgJiYgZGF0YSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0b3JlX3BvaW50X2NpdHknKTtcbiAgICAgICAgICAgICAgICAgICAgLy92YXIgb3B0aW9ucyA9ICc8b3B0aW9uIHZhbHVlPVwiXCI+0JLRi9Cx0LXRgNC40YLQtSDQs9C+0YDQvtC0PC9vcHRpb24+JztcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIGl0ZW0gKyAnXCI+JyArIGl0ZW0gKyAnPC9vcHRpb24+JztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdC5pbm5lckhUTUwgPSBvcHRpb25zO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vJChwb2ludHMpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgICAgIC8vIGdvb2dsZU1hcC5zaG93TWFwKCk7XG4gICAgICAgICAgICAvLyBnb29nbGVNYXAuc2hvd01hcmtlcihjb3VudHJ5LCAnJyk7XG4gICAgICAgICAgICBjaGFuZ2VDaXR5KCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoYW5nZUNpdHkoKXtcbiAgICAgICAgaWYgKHR5cGVvZiBnb29nbGVNYXAgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0aGF0ID0gJCgnI3N0b3JlX3BvaW50X2NpdHknKTtcbiAgICAgICAgaWYgKHRoYXQubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgY2l0eSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmF0dHIoJ3ZhbHVlJyksXG4gICAgICAgICAgICAgICAgY291bnRyeSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsICQoJyNzdG9yZV9wb2ludF9jb3VudHJ5JykpLmF0dHIoJ3ZhbHVlJyksXG4gICAgICAgICAgICAgICAgcG9pbnRzID0gJCgnI3N0b3JlLXBvaW50cycpO1xuICAgICAgICAgICAgaWYgKGNvdW50cnkgJiYgY2l0eSkge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IHBvaW50cy5maW5kKCcuc3RvcmUtcG9pbnRzX19wb2ludHNfcm93JyksXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXAuc2hvd01hcmtlcihjb3VudHJ5LCBjaXR5KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJC5lYWNoKGl0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIGRpdikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoJChkaXYpLmRhdGEoJ2NpdHknKSA9PSBjaXR5ICYmICQoZGl2KS5kYXRhKCdjb3VudHJ5JykgPT0gY291bnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChkaXYpLnJlbW92ZUNsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50c19yb3ctaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZGl2KS5hZGRDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHNfcm93LWhpZGRlbicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgJChwb2ludHMpLnJlbW92ZUNsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50cy1oaWRkZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwLnNob3dNYXAoKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICQocG9pbnRzKS5hZGRDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHMtaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5oaWRlTWFwKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKHBvaW50cykuYWRkQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzLWhpZGRlbicpO1xuICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5oaWRlTWFwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL9C00LvRjyDRgtC+0YfQtdC6INC/0YDQvtC00LDQtiwg0YHQvtCx0YvRgtC40Y8g0L3QsCDQstGL0LHQvtGAINGB0LXQu9C10LrRgtC+0LJcbiAgICB2YXIgYm9keSA9ICQoJ2JvZHknKTtcblxuICAgICQoYm9keSkub24oJ2NoYW5nZScsICcjc3RvcmVfcG9pbnRfY291bnRyeScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY2hhbmdlQ291bnRyeSgpO1xuICAgIH0pO1xuXG5cbiAgICAkKGJvZHkpLm9uKCdjaGFuZ2UnLCAnI3N0b3JlX3BvaW50X2NpdHknLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGNoYW5nZUNpdHkoKTtcblxuICAgIH0pO1xuXG4gICAgY2hhbmdlQ291bnRyeSgpO1xuXG5cbn0pKCk7XG5cblxuXG5cbiIsInZhciBoYXNoVGFncyA9IChmdW5jdGlvbigpe1xuXG4gICAgZnVuY3Rpb24gbG9jYXRpb25IYXNoKCkge1xuICAgICAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXG4gICAgICAgIGlmIChoYXNoICE9IFwiXCIpIHtcbiAgICAgICAgICAgIHZhciBoYXNoQm9keSA9IGhhc2guc3BsaXQoXCI/XCIpO1xuICAgICAgICAgICAgaWYgKGhhc2hCb2R5WzFdKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gbG9jYXRpb24ub3JpZ2luICsgbG9jYXRpb24ucGF0aG5hbWUgKyAnPycgKyBoYXNoQm9keVsxXSArIGhhc2hCb2R5WzBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbGlua3MgPSAkKCdhW2hyZWY9XCInICsgaGFzaEJvZHlbMF0gKyAnXCJdLm1vZGFsc19vcGVuJyk7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmtzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAkKGxpbmtzWzBdKS5jbGljaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiaGFzaGNoYW5nZVwiLCBmdW5jdGlvbigpe1xuICAgICAgICBsb2NhdGlvbkhhc2goKTtcbiAgICB9KTtcblxuICAgIGxvY2F0aW9uSGFzaCgpXG5cbn0pKCk7IiwidmFyIHBsdWdpbnMgPSAoZnVuY3Rpb24oKXtcbiAgICB2YXIgaWNvbkNsb3NlID0gJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHg9XCIwcHhcIiB5PVwiMHB4XCIgd2lkdGg9XCIxMnB4XCIgaGVpZ2h0PVwiMTJweFwiIHZpZXdCb3g9XCIwIDAgMzU3IDM1N1wiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzNTcgMzU3O1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+PGc+JytcbiAgICAgICAgJzxnIGlkPVwiY2xvc2VcIj48cG9seWdvbiBwb2ludHM9XCIzNTcsMzUuNyAzMjEuMywwIDE3OC41LDE0Mi44IDM1LjcsMCAwLDM1LjcgMTQyLjgsMTc4LjUgMCwzMjEuMyAzNS43LDM1NyAxNzguNSwyMTQuMiAzMjEuMywzNTcgMzU3LDMyMS4zICAgICAyMTQuMiwxNzguNSAgIFwiIGZpbGw9XCIjRkZGRkZGXCIvPicrXG4gICAgICAgICc8L3N2Zz4nO1xuICAgIHZhciB0ZW1wbGF0ZT0nPGRpdiBjbGFzcz1cInBhZ2Utd3JhcCBpbnN0YWxsLXBsdWdpbl9pbm5lclwiPicrXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJpbnN0YWxsLXBsdWdpbl90ZXh0XCI+e3t0ZXh0fX08L2Rpdj4nK1xuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaW5zdGFsbC1wbHVnaW5fYnV0dG9uc1wiPicrXG4gICAgICAgICAgICAgICAgICAgICc8YSBjbGFzcz1cImJ0biBidG4tbWluaSBidG4tcm91bmQgaW5zdGFsbC1wbHVnaW5fYnV0dG9uXCIgIGhyZWY9XCJ7e2hyZWZ9fVwiIHRhcmdldD1cIl9ibGFua1wiPnt7dGl0bGV9fTwvYT4nK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImluc3RhbGwtcGx1Z2luX2J1dHRvbi1jbG9zZVwiPicraWNvbkNsb3NlKyc8L2Rpdj4nK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nK1xuICAgICAgICAgICAgJzwvZGl2Pic7XG4gICAgdmFyIHBsdWdpbkluc3RhbGxEaXZDbGFzcyA9ICdpbnN0YWxsLXBsdWdpbi1pbmRleCc7XG4gICAgdmFyIHBsdWdpbkluc3RhbGxEaXZBY2NvdW50Q2xhc3MgPSAnaW5zdGFsbC1wbHVnaW4tYWNjb3VudCc7XG4gICAgdmFyIGNvb2tpZVBhbmVsSGlkZGVuID0gJ3NkLWluc3RhbGwtcGx1Z2luLWhpZGRlbic7XG4gICAgdmFyIGNvb2tpZUFjY291bnREaXZIaWRkZW4gPSAnc2QtaW5zdGFsbC1wbHVnaW4tYWNjb3VudC1oaWRkZW4nO1xuICAgIHZhciBpc09wZXJhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCcgT1BSLycpID49IDA7XG4gICAgdmFyIGlzWWFuZGV4ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCcgWWFCcm93c2VyLycpID49IDA7XG4gICAgdmFyIGV4dGVuc2lvbnMgPSB7XG4gICAgICAgICdjaHJvbWUnOiB7XG4gICAgICAgICAgICAnZGl2X2lkJzogJ3NkX2Nocm9tZV9hcHAnLFxuICAgICAgICAgICAgJ3VzZWQnOiAhIXdpbmRvdy5jaHJvbWUgJiYgd2luZG93LmNocm9tZS53ZWJzdG9yZSAhPT0gbnVsbCAmJiAhaXNPcGVyYSAmJiAhaXNZYW5kZXgsXG4gICAgICAgICAgICAvLyd0ZXh0JzogbGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIiksXG4gICAgICAgICAgICAnaHJlZic6ICdodHRwczovL2Nocm9tZS5nb29nbGUuY29tL3dlYnN0b3JlL2RldGFpbC9zZWNyZXRkaXNjb3VudGVycnUtJUUyJTgwJTkzLSVEMCVCQSVEMSU4RCVEMSU4OCVEMCVCMS9tY29saGhlbWZhY3BvYWdoamlkaGxpZWNwaWFucG5qbicsXG4gICAgICAgICAgICAnaW5zdGFsbF9idXR0b25fY2xhc3MnOiAncGx1Z2luLWJyb3dzZXJzLWxpbmstY2hyb21lJ1xuICAgICAgICB9LFxuICAgICAgICAnZmlyZWZveCc6IHtcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2RfZmlyZWZveF9hcHAnLFxuICAgICAgICAgICAgJ3VzZWQnOiAgdHlwZW9mIEluc3RhbGxUcmlnZ2VyICE9PSAndW5kZWZpbmVkJyxcbiAgICAgICAgICAgIC8vJ3RleHQnOmxnKFwiaW5zdGFsbF9wbHVnaW5fYW5kX2l0X3dpbGxfbm90aWNlX2Fib3V0X2Nhc2hiYWNrXCIpLFxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMubW96aWxsYS5vcmcvcnUvZmlyZWZveC9hZGRvbi9zZWNyZXRkaXNjb3VudGVyLSVEMCVCQSVEMSU4RCVEMSU4OCVEMCVCMSVEMSU4RCVEMCVCQS0lRDElODElRDAlQjUlRDElODAlRDAlQjIlRDAlQjglRDElODEvJyxcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay1maXJlZm94J1xuICAgICAgICB9LFxuICAgICAgICAnb3BlcmEnOiB7XG4gICAgICAgICAgICAnZGl2X2lkJzogJ3NkX29wZXJhX2FwcCcsXG4gICAgICAgICAgICAndXNlZCc6IGlzT3BlcmEsXG4gICAgICAgICAgICAvLyd0ZXh0JzpsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcbiAgICAgICAgICAgICdocmVmJzogJ2h0dHBzOi8vYWRkb25zLm9wZXJhLmNvbS9ydS9leHRlbnNpb25zLz9yZWY9cGFnZScsXG4gICAgICAgICAgICAnaW5zdGFsbF9idXR0b25fY2xhc3MnOiAncGx1Z2luLWJyb3dzZXJzLWxpbmstb3BlcmEnXG4gICAgICAgIH0sXG4gICAgICAgICd5YW5kZXgnOiB7XG4gICAgICAgICAgICAnZGl2X2lkJzogJ3NkX3lhbmRleF9hcHAnLFxuICAgICAgICAgICAgJ3VzZWQnOiBpc1lhbmRleCxcbiAgICAgICAgICAgIC8vJ3RleHQnOmxnKFwiaW5zdGFsbF9wbHVnaW5fYW5kX2l0X3dpbGxfbm90aWNlX2Fib3V0X2Nhc2hiYWNrXCIpLFxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMub3BlcmEuY29tL3J1L2V4dGVuc2lvbnMvP3JlZj1wYWdlJyxcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay15YW5kZXgnXG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBmdW5jdGlvbiBzZXRQYW5lbChocmVmKSB7XG4gICAgICAgIHZhciBwbHVnaW5JbnN0YWxsUGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGx1Z2luLWluc3RhbGwtcGFuZWwnKTsvL9Cy0YvQstC+0LTQuNGC0Ywg0LvQuCDQv9Cw0L3QtdC70YxcbiAgICAgICAgaWYgKHBsdWdpbkluc3RhbGxQYW5lbCAmJiBnZXRDb29raWUoY29va2llUGFuZWxIaWRkZW4pICE9PSAnMScgKSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7dGV4dH19JywgbGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIikpO1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7e2hyZWZ9fScsIGhyZWYpO1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7e3RpdGxlfX0nLCBsZyhcImluc3RhbGxfcGx1Z2luXCIpKTtcbiAgICAgICAgICAgIHZhciBzZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xuICAgICAgICAgICAgc2VjdGlvbi5jbGFzc05hbWUgPSAnaW5zdGFsbC1wbHVnaW4nO1xuICAgICAgICAgICAgc2VjdGlvbi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcblxuICAgICAgICAgICAgdmFyIHNlY29uZGxpbmUgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJy5oZWFkZXItc2Vjb25kbGluZScpO1xuICAgICAgICAgICAgaWYgKHNlY29uZGxpbmUpIHtcbiAgICAgICAgICAgICAgICBzZWNvbmRsaW5lLmFwcGVuZENoaWxkKHNlY3Rpb24pO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbnN0YWxsLXBsdWdpbl9idXR0b24tY2xvc2UnKS5vbmNsaWNrID0gY2xvc2VDbGljaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldEJ1dHRvbkluc3RhbGxWaXNpYmxlKGJ1dHRvbkNsYXNzKSB7XG4gICAgICAgICQoJy4nICsgcGx1Z2luSW5zdGFsbERpdkNsYXNzKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICQoJy4nICsgYnV0dG9uQ2xhc3MpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgaWYgKGdldENvb2tpZShjb29raWVBY2NvdW50RGl2SGlkZGVuKSAhPT0gJzEnKSB7XG4gICAgICAgICAgICAkKCcuJyArIHBsdWdpbkluc3RhbGxEaXZBY2NvdW50Q2xhc3MpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsb3NlQ2xpY2soKXtcbiAgICAgICAgJCgnLmluc3RhbGwtcGx1Z2luJykuYWRkQ2xhc3MoJ2luc3RhbGwtcGx1Z2luX2hpZGRlbicpO1xuICAgICAgICBzZXRDb29raWUoY29va2llUGFuZWxIaWRkZW4sICcxJywgMTApO1xuICAgIH1cblxuICAgICQoJy5pbnN0YWxsLXBsdWdpbi1hY2NvdW50LWxhdGVyJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNldENvb2tpZShjb29raWVBY2NvdW50RGl2SGlkZGVuLCAnMScsIDEwKTtcbiAgICAgICAgJCgnLmluc3RhbGwtcGx1Z2luLWFjY291bnQnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfSk7XG5cblxuICAgIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBleHRlbnNpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnNba2V5XS51c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcHBJZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyMnK2V4dGVuc2lvbnNba2V5XS5kaXZfaWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWFwcElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL9C/0LDQvdC10LvRjCDRgSDQutC90L7Qv9C60L7QuVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0UGFuZWwoZXh0ZW5zaW9uc1trZXldLmhyZWYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/QvdCwINCz0LvQsNCy0L3QvtC5ICDQuCDQsiAvYWNjb3VudCDQsdC70L7QutC4INGBINC40LrQvtC90LrQsNC80Lgg0Lgg0LrQvdC+0L/QutCw0LzQuFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0QnV0dG9uSW5zdGFsbFZpc2libGUoZXh0ZW5zaW9uc1trZXldLmluc3RhbGxfYnV0dG9uX2NsYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMzAwMCk7XG4gICAgfTtcblxufSkoKTsiXX0=
