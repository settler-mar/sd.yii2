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
  rebuild();
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
          'title': 'Ошибка',
          'message': post.error[index]
        });
      }
    } else if (Array.isArray(post.error)) {
      for (var i = 0; i < post.error.length; i++) {
        notification.notifi({
          'type': 'err',
          'title': 'Ошибка',
          'message': post.error[i]
        });
      }
    } else {
      if (post.error || post.message) {
        notification.notifi({
          'type': post.error === false ? 'success' : 'err',
          'title': post.error === false ? 'Успешно' : 'Ошибка',
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
    wrap.html('<h3>Упс... Возникла непредвиденная ошибка<h3>' +
      '<p>Часто это происходит в случае, если вы несколько раз подряд неверно ввели свои учетные данные. Но возможны и другие причины. В любом случае не расстраивайтесь и просто обратитесь к нашему оператору службы поддержки.</p><br>' +
      '<p>Спасибо.</p>');
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
      var required = form.find('input.required');
      for (i = 0; i < required.length; i++) {
        var helpBlock = required.eq(i).attr('type') == 'hidden' ? required.eq(i).next('.help-block') :
          required.eq(i).closest('.form-input-group').next('.help-block');
        var helpMessage = helpBlock && helpBlock.data('message') ? helpBlock.data('message') : 'Необходимо заполнить';

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
    wrap.html('<div style="text-align:center;"><p>Отправка данных</p></div>');

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

  $.get('/account/notification', function (data) {
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
    out += '<a class="btn header-noty-box-btn" href="/account/notification">' + data.btn + '</a>';
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
          c.text('Промокод истек');
          c.addClass('clock-expired');
          continue;
        }

        //если срок более 30 дней
        if (d > 30 * 60 * 60 * 24) {
          c.html('Осталось: <span>более 30 дней</span>');
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
          str = d + " " + declOfNum(d, ['день', 'дня', 'дней']) + "  " + str;
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
      var title = data_message ? data_message : 'К сожалению, промокод неактивен';
      var message = 'Все действующие промокоды вы можете <a href="/coupons">посмотреть здесь</a>';
      notification.alert({
        'title': title,
        'question': message,
        'buttonYes': 'Ok',
        'buttonNo': false,
        'notyfy_class': 'notify_box-alert'
      });
      return false;
    } else if (expired.length > 0) {
      var title = 'К сожалению, срок действия данного промокода истек';
      var message = 'Все действующие промокоды вы можете <a href="/coupons">посмотреть здесь</a>';
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
        'title': 'Использовать промокод',
        'question': '<div class="notify_box-coupon-noregister">' +
        '<img src="/images/templates/swa.png" alt="">' +
        '<p><b>Если вы хотите получать еще и КЭШБЭК (возврат денег), вам необходимо зарегистрироваться. Но можете и просто воспользоваться промокодом, без кэшбэка.</b></p>' +
        '</div>' +
        '<div class="notify_box-buttons">' +
        '<a href="' + that.attr('href') + '" target="_blank" class="btn">Использовать промокод</a>' +
        '<a href="#registration" class="btn btn-transform modals_open">Зарегистрироваться</a>' +
        '</div>'
      };
      notification.alert(data);
      return false;
    }
  });

  $('#shop_header-goto-checkbox').click(function(){
     if (!$(this).is(':checked')) {
         notification.alert({
             'title': 'Внимание',
             'question': 'Не рекомендуется совершать покупки без ознакомления<br> с <a target="_blank" rel="nofollow nooper noreferrer" href="/recommendations">Правилами покупок с кэшбэком</a>',
             'buttonYes': 'Закрыть',
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
        placeholder = "Введите номер счёта";
        break;

      case 2:
        placeholder = "Введите номер R-кошелька";
        break;

      case 3:
        placeholder = "Введите номер телефона";
        break;

      case 4:
        placeholder = "Введите номер карты";
        break;

      case 5:
        placeholder = "Введите email адрес";
        break;

      case 6:
        placeholder = "Введите номер телефона";
        break;
    }

    $(this).parent().siblings().removeClass('active');
    $(this).parent().addClass('active');
    $("#userswithdraw-bill").attr("placeholder", placeholder);
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
    title: "Удаление",
    question: "Вы действительно хотите удалить?",
    buttonYes: "Да",
    buttonNo: "Нет",
    callbackYes: false,
    callbackNo: false,
    obj: false,
    buttonTag: 'div',
    buttonYesDop: '',
    buttonNoDop: '',
  };
  var alert_opt = {
    title: "",
    question: "Сообщение",
    buttonYes: "Да",
    callbackYes: false,
    buttonTag: 'div',
    obj: false,
  };

  function testIphone() {
    if (!/(iPhone|iPad|iPod).*(OS 11)/.test(navigator.userAgent)) return
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
    $('.notification_box .notify_content').html('')
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
    ;

    box_html += '</div>';
    notification_box.html(box_html);


    setTimeout(function () {
      $('html').addClass('show_notifi');
    }, 100)
  }

  function confirm(data) {
    if (!data)data = {};
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
    notifi: notifi,
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
        title: "Необходимо авторизоваться",
        message: 'Добавить в избранное может только авторизованный пользователь.</br>' +
        '<a href="#login" class="modals_open">Вход</a>  / <a href="#registration" class="modals_open">Регистрация</a>',
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

      if (type == "add") {
        self.find(".item_icon").addClass("svg-no-fill");
      }

      self.attr({
        "data-state": data["data-state"],
        "data-original-title": data['data-original-title']
      });

      if (type == "add") {
        self.find("svg").removeClass("spin svg-no-fill");
      } else if (type == "delete") {
        self.find("svg").removeClass("spin").addClass("svg-no-fill");
      }

    }, 'json').fail(function () {
      self.removeClass('disabled');
      notification.notifi({
        message: "<b>Технические работы!</b><br>В данный момент времени" +
        " произведённое действие невозможно. Попробуйте позже." +
        " Приносим свои извинения за неудобство.", type: 'err'
      });

      if (type == "add") {
        self.find("svg").addClass("svg-no-fill");
      }
      self.find("svg").removeClass("spin");
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
      msg = "Данные успешно скопированы в буфер обмена";
    }
    notification.notifi({'type': 'info', 'message': msg, 'title': 'Успешно'})
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
    wrap.append('<span>' + size + '</span> <a href="' + data.src + '" download>Скачать</a>');
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
                    '<a class="btn btn-mini btn-round install-plugin_button"  href="{{href}}" target="_blank">Установить&nbsp;плагин</a>'+
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
            'text':'Установите наше расширение для браузера, и оно само напомнит о кэшбэке на сайте магазина!',
            'href': 'https://chrome.google.com/webstore/detail/secretdiscounterru-%E2%80%93-%D0%BA%D1%8D%D1%88%D0%B1/mcolhhemfacpoaghjidhliecpianpnjn',
            'install_button_class': 'plugin-browsers-link-chrome'
        },
        'firefox': {
            'div_id': 'sd_firefox_app',
            'used':  typeof InstallTrigger !== 'undefined',
            'text':'Установите наше расширение для браузера, и оно само напомнит о кэшбэке на сайте магазина!',
            'href': 'https://addons.mozilla.org/ru/firefox/addon/secretdiscounter-%D0%BA%D1%8D%D1%88%D0%B1%D1%8D%D0%BA-%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81/',
            'install_button_class': 'plugin-browsers-link-firefox'
        },
        'opera': {
            'div_id': 'sd_opera_app',
            'used': isOpera,
            'text':'Установите наше расширение для браузера, и оно само напомнит о кэшбэке на сайте магазина!',
            'href': 'https://addons.opera.com/ru/extensions/?ref=page',
            'install_button_class': 'plugin-browsers-link-opera'
        },
        'yandex': {
            'div_id': 'sd_yandex_app',
            'used': isYandex,
            'text':'Установите наше расширение для браузера, и оно само напомнит о кэшбэке на сайте магазина!',
            'href': 'https://addons.opera.com/ru/extensions/?ref=page',
            'install_button_class': 'plugin-browsers-link-yandex'
        }
    };


    function setPanel(text, href) {
        var pluginInstallPanel = document.querySelector('#plugin-install-panel');//выводить ли панель
        if (pluginInstallPanel && getCookie(cookiePanelHidden) !== '1' ) {
            template = template.replace('{{text}}', text);
            template = template.replace('{{href}}', href);
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
                        setPanel(extensions[key].text, extensions[key].href);
                        //на главной  и в /account блоки с иконками и кнопками
                        setButtonInstallVisible(extensions[key].install_button_class);
                    }
                }
            }
        }, 3000);
    };

})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsInRvb2x0aXAuanMiLCJhY2NvdW50X25vdGlmaWNhdGlvbi5qcyIsInNsaWRlci5qcyIsImhlYWRlcl9tZW51X2FuZF9zZWFyY2guanMiLCJjYWxjLWNhc2hiYWNrLmpzIiwiYXV0b19oaWRlX2NvbnRyb2wuanMiLCJoaWRlX3Nob3dfYWxsLmpzIiwiY2xvY2suanMiLCJsaXN0X3R5cGVfc3dpdGNoZXIuanMiLCJzZWxlY3QuanMiLCJzZWFyY2guanMiLCJnb3RvLmpzIiwiYWNjb3VudC13aXRoZHJhdy5qcyIsImFqYXguanMiLCJkb2Jyby5qcyIsImxlZnQtbWVudS10b2dnbGUuanMiLCJzaGFyZTQyLmpzIiwidXNlcl9yZXZpZXdzLmpzIiwicGxhY2Vob2xkZXIuanMiLCJub3RpZmljYXRpb24uanMiLCJtb2RhbHMuanMiLCJmb290ZXJfbWVudS5qcyIsInJhdGluZy5qcyIsImZhdm9yaXRlcy5qcyIsInNjcm9sbF90by5qcyIsImNvcHlfdG9fY2xpcGJvYXJkLmpzIiwiaW1nLmpzIiwicGFyZW50c19vcGVuX3dpbmRvd3MuanMiLCJmb3Jtcy5qcyIsImNvb2tpZS5qcyIsInRhYmxlLmpzIiwiYWpheF9yZW1vdmUuanMiLCJmaXhlcy5qcyIsImxpbmtzLmpzIiwic3RvcmVfcG9pbnRzLmpzIiwiaGFzaHRhZ3MuanMiLCJwbHVnaW5zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3A5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsib2JqZWN0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgdmFyIGMgPSBiLFxyXG4gICAga2V5O1xyXG4gIGZvciAoa2V5IGluIGEpIHtcclxuICAgIGlmIChhLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBjO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gbG9naW5fcmVkaXJlY3QobmV3X2hyZWYpIHtcclxuICBocmVmID0gbG9jYXRpb24uaHJlZjtcclxuICBpZiAoaHJlZi5pbmRleE9mKCdzdG9yZScpID4gMCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpID4gMCB8fCBocmVmLmluZGV4T2YoJ3VybCgnKSA+IDApIHtcclxuICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsb2NhdGlvbi5ocmVmID0gbmV3X2hyZWY7XHJcbiAgfVxyXG59XHJcbiIsIihmdW5jdGlvbiAodywgZCwgJCkge1xyXG4gIHZhciBzY3JvbGxzX2Jsb2NrID0gJCgnLnNjcm9sbF9ib3gnKTtcclxuXHJcbiAgaWYgKHNjcm9sbHNfYmxvY2subGVuZ3RoID09IDApIHJldHVybjtcclxuICAvLyQoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKS53cmFwQWxsKHNjcm9sbHNfYmxvY2spO1xyXG4gICQoc2Nyb2xsc19ibG9jaykud3JhcCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpO1xyXG5cclxuICBpbml0X3Njcm9sbCgpO1xyXG4gIGNhbGNfc2Nyb2xsKCk7XHJcblxyXG4gIHZhciB0MSwgdDI7XHJcblxyXG4gICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24gKCkge1xyXG4gICAgY2xlYXJUaW1lb3V0KHQxKTtcclxuICAgIGNsZWFyVGltZW91dCh0Mik7XHJcbiAgICB0MSA9IHNldFRpbWVvdXQoY2FsY19zY3JvbGwsIDMwMCk7XHJcbiAgICB0MiA9IHNldFRpbWVvdXQoY2FsY19zY3JvbGwsIDgwMCk7XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRfc2Nyb2xsKCkge1xyXG4gICAgdmFyIGNvbnRyb2wgPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbFwiPjwvZGl2Pic7XHJcbiAgICBjb250cm9sID0gJChjb250cm9sKTtcclxuICAgIGNvbnRyb2wuaW5zZXJ0QWZ0ZXIoc2Nyb2xsc19ibG9jayk7XHJcbiAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApO1xyXG5cclxuICAgIHNjcm9sbHNfYmxvY2sucHJlcGVuZCgnPGRpdiBjbGFzcz1zY3JvbGxfYm94LW1vdmVyPjwvZGl2PicpO1xyXG5cclxuICAgIGNvbnRyb2wub24oJ2NsaWNrJywgJy5zY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgIHZhciBjb250cm9sID0gJHRoaXMucGFyZW50KCk7XHJcbiAgICAgIHZhciBpID0gJHRoaXMuaW5kZXgoKTtcclxuICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdhY3RpdmUnKSlyZXR1cm47XHJcbiAgICAgIGNvbnRyb2wuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgJHRoaXMuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgdmFyIGR4ID0gY29udHJvbC5kYXRhKCdzbGlkZS1keCcpO1xyXG4gICAgICB2YXIgZWwgPSBjb250cm9sLnByZXYoKTtcclxuICAgICAgZWwuZmluZCgnLnNjcm9sbF9ib3gtbW92ZXInKS5jc3MoJ21hcmdpbi1sZWZ0JywgLWR4ICogaSk7XHJcbiAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgaSk7XHJcblxyXG4gICAgICBzdG9wU2Nyb2wuYmluZChlbCkoKTtcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBmb3IgKHZhciBqID0gMDsgaiA8IHNjcm9sbHNfYmxvY2subGVuZ3RoOyBqKyspIHtcclxuICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaik7XHJcbiAgICBlbC5wYXJlbnQoKS5ob3ZlcihzdG9wU2Nyb2wuYmluZChlbCksIHN0YXJ0U2Nyb2wuYmluZChlbCkpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3RhcnRTY3JvbCgpIHtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICBpZiAoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xyXG5cclxuICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUuYmluZCgkdGhpcyksIDIwMDApO1xyXG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJywgdGltZW91dElkKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3RvcFNjcm9sKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgIHZhciB0aW1lb3V0SWQgPSAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKTtcclxuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIGZhbHNlKTtcclxuICAgIGlmICghJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSB8fCAhdGltZW91dElkKXJldHVybjtcclxuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLCBmYWxzZSk7XHJcbiAgICBpZiAoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xyXG5cclxuICAgIHZhciBjb250cm9scyA9ICR0aGlzLm5leHQoKS5maW5kKCc+KicpO1xyXG4gICAgdmFyIGFjdGl2ZSA9ICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xyXG4gICAgdmFyIHBvaW50X2NudCA9IGNvbnRyb2xzLmxlbmd0aDtcclxuICAgIGlmICghYWN0aXZlKWFjdGl2ZSA9IDA7XHJcbiAgICBhY3RpdmUrKztcclxuICAgIGlmIChhY3RpdmUgPj0gcG9pbnRfY250KWFjdGl2ZSA9IDA7XHJcbiAgICAkdGhpcy5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xyXG5cclxuICAgIGNvbnRyb2xzLmVxKGFjdGl2ZSkuY2xpY2soKTtcclxuICAgIHN0YXJ0U2Nyb2wuYmluZCgkdGhpcykoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNhbGNfc2Nyb2xsKCkge1xyXG4gICAgZm9yIChpID0gMDsgaSA8IHNjcm9sbHNfYmxvY2subGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gc2Nyb2xsc19ibG9jay5lcShpKTtcclxuICAgICAgdmFyIGNvbnRyb2wgPSBlbC5uZXh0KCk7XHJcbiAgICAgIHZhciB3aWR0aF9tYXggPSBlbC5kYXRhKCdzY3JvbGwtd2lkdGgtbWF4Jyk7XHJcbiAgICAgIHcgPSBlbC53aWR0aCgpO1xyXG5cclxuICAgICAgLy/QtNC10LvQsNC10Lwg0LrQvtC90YLRgNC+0LvRjCDQvtCz0YDQsNC90LjRh9C10L3QuNGPINGI0LjRgNC40L3Riy4g0JXRgdC70Lgg0L/RgNC10LLRi9GI0LXQvdC+INGC0L4g0L7RgtC60LvRjtGH0LDQtdC8INGB0LrRgNC+0Lsg0Lgg0L/QtdGA0LXRhdC+0LTQuNC8INC6INGB0LvQtdC00YPRjtGJ0LXQvNGDINGN0LvQtdC80LXQvdGC0YNcclxuICAgICAgaWYgKHdpZHRoX21heCAmJiB3ID4gd2lkdGhfbWF4KSB7XHJcbiAgICAgICAgY29udHJvbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBub19jbGFzcyA9IGVsLmRhdGEoJ3Njcm9sbC1lbGVtZXQtaWdub3JlLWNsYXNzJyk7XHJcbiAgICAgIHZhciBjaGlsZHJlbiA9IGVsLmZpbmQoJz4qJykubm90KCcuc2Nyb2xsX2JveC1tb3ZlcicpO1xyXG4gICAgICBpZiAobm9fY2xhc3MpIHtcclxuICAgICAgICBjaGlsZHJlbiA9IGNoaWxkcmVuLm5vdCgnLicgKyBub19jbGFzcylcclxuICAgICAgfVxyXG5cclxuICAgICAgLy/QldGB0LvQuCDQvdC10YIg0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXHJcbiAgICAgIGlmIChjaGlsZHJlbiA9PSAwKSB7XHJcbiAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcclxuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZl9lbCA9IGNoaWxkcmVuLmVxKDEpO1xyXG4gICAgICB2YXIgY2hpbGRyZW5fdyA9IGZfZWwub3V0ZXJXaWR0aCgpOyAvL9Cy0YHQtdCz0L4g0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXHJcbiAgICAgIGNoaWxkcmVuX3cgKz0gcGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLWxlZnQnKSk7XHJcbiAgICAgIGNoaWxkcmVuX3cgKz0gcGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLXJpZ2h0JykpO1xyXG5cclxuICAgICAgdmFyIHNjcmVhbl9jb3VudCA9IE1hdGguZmxvb3IodyAvIGNoaWxkcmVuX3cpO1xyXG5cclxuICAgICAgLy/QldGB0LvQuCDQstGB0LUg0LLQu9Cw0LfQuNGCINC90LAg0Y3QutGA0LDQvVxyXG4gICAgICBpZiAoY2hpbGRyZW4gPD0gc2NyZWFuX2NvdW50KSB7XHJcbiAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcclxuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL9Cj0LbQtSDRgtC+0YfQvdC+INC30L3QsNC10Lwg0YfRgtC+INGB0LrRgNC+0Lsg0L3Rg9C20LXQvVxyXG4gICAgICBlbC5hZGRDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG5cclxuICAgICAgdmFyIHBvaW50X2NudCA9IGNoaWxkcmVuLmxlbmd0aCAtIHNjcmVhbl9jb3VudCArIDE7XHJcbiAgICAgIC8v0LXRgdC70Lgg0L3QtSDQvdCw0LTQviDQvtCx0L3QvtCy0LvRj9GC0Ywg0LrQvtC90YLRgNC+0Lsg0YLQviDQstGL0YXQvtC00LjQvCwg0L3QtSDQt9Cw0LHRi9Cy0LDRjyDQvtCx0L3QvtCy0LjRgtGMINGI0LjRgNC40L3RgyDQtNC+0YfQtdGA0L3QuNGFXHJcbiAgICAgIGlmIChjb250cm9sLmZpbmQoJz4qJykubGVuZ3RoID09IHBvaW50X2NudCkge1xyXG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgYWN0aXZlID0gZWwuZGF0YSgnc2xpZGUtYWN0aXZlJyk7XHJcbiAgICAgIGlmICghYWN0aXZlKWFjdGl2ZSA9IDA7XHJcbiAgICAgIGlmIChhY3RpdmUgPj0gcG9pbnRfY250KWFjdGl2ZSA9IHBvaW50X2NudCAtIDE7XHJcbiAgICAgIHZhciBvdXQgPSAnJztcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwb2ludF9jbnQ7IGorKykge1xyXG4gICAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcgKyAoaiA9PSBhY3RpdmUgPyAnIGFjdGl2ZScgOiAnJykgKyAnXCI+PC9kaXY+JztcclxuICAgICAgfVxyXG4gICAgICBjb250cm9sLmh0bWwob3V0KTtcclxuXHJcbiAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgYWN0aXZlKTtcclxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1jb3VudCcsIHBvaW50X2NudCk7XHJcbiAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcclxuXHJcbiAgICAgIGlmICghZWwuZGF0YSgnc2xpZGUtdGltZW91dElkJykpIHtcclxuICAgICAgICBzdGFydFNjcm9sLmJpbmQoZWwpKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0od2luZG93LCBkb2N1bWVudCwgalF1ZXJ5KSk7XHJcbiIsInZhciBhY2NvcmRpb25Db250cm9sID0gJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKTtcclxuXHJcbmFjY29yZGlvbkNvbnRyb2wub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICRhY2NvcmRpb24gPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uJyk7XHJcblxyXG5cclxuICBpZiAoJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLXRpdGxlJykuaGFzQ2xhc3MoJ2FjY29yZGlvbi10aXRsZS1kaXNhYmxlZCcpKXJldHVybjtcclxuXHJcbiAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgLyppZigkYWNjb3JkaW9uLmhhc0NsYXNzKCdhY2NvcmRpb24tb25seV9vbmUnKSl7XHJcbiAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgIH0qL1xyXG4gICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zbGlkZVVwKDMwMCk7XHJcbiAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKSB7XHJcbiAgICAgICRvdGhlciA9ICQoJy5hY2NvcmRpb24tb25seV9vbmUnKTtcclxuICAgICAgJG90aGVyLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXHJcbiAgICAgICAgLnNsaWRlVXAoMzAwKVxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XHJcbiAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAkb3RoZXIucmVtb3ZlQ2xhc3MoJ2xhc3Qtb3BlbicpO1xyXG5cclxuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XHJcbiAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpO1xyXG4gICAgfVxyXG4gICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zbGlkZURvd24oMzAwKTtcclxuICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKTtcclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59KTtcclxuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XHJcblxyXG5cclxuJCgnLmFjY29yZGlvbi13cmFwLm9wZW5fZmlyc3QgLmFjY29yZGlvbjpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XHJcbiQoJy5hY2NvcmRpb24td3JhcCAuYWNjb3JkaW9uLmFjY29yZGlvbi1zbGltOmZpcnN0LWNoaWxkJykuYWRkQ2xhc3MoJ29wZW4nKTtcclxuJCgnLmFjY29yZGlvbi1zbGltJykuYWRkQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpO1xyXG5cclxuLy/QtNC70Y8g0YHQuNC80L7QsiDQvtGC0LrRgNGL0LLQsNC10Lwg0LXRgdC70Lgg0LXRgdGC0Ywg0L/QvtC80LXRgtC60LAgb3BlbiDRgtC+INC/0YDQuNGB0LLQsNC40LLQsNC10Lwg0LLRgdC1INC+0YHRgtCw0LvRjNC90YvQtSDQutC70LDRgdGLXHJcbmFjY29yZGlvblNsaW0gPSAkKCcuYWNjb3JkaW9uLmFjY29yZGlvbi1vbmx5X29uZScpO1xyXG5pZiAoYWNjb3JkaW9uU2xpbS5sZW5ndGggPiAwKSB7XHJcbiAgYWNjb3JkaW9uU2xpbS5wYXJlbnQoKS5maW5kKCcuYWNjb3JkaW9uLm9wZW4nKVxyXG4gICAgLmFkZENsYXNzKCdsYXN0LW9wZW4nKVxyXG4gICAgLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXHJcbiAgICAuc2hvdygzMDApXHJcbiAgICAuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xyXG59XHJcblxyXG4kKCdib2R5Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICQoJy5hY2NvcmRpb25fZnVsbHNjcmVhbl9jbG9zZS5vcGVuIC5hY2NvcmRpb24tY29udHJvbDpmaXJzdC1jaGlsZCcpLmNsaWNrKClcclxufSk7XHJcblxyXG4kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGlmIChlLnRhcmdldC50YWdOYW1lICE9ICdBJykge1xyXG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuYWNjb3JkaW9uJykuZmluZCgnLmFjY29yZGlvbi1jb250cm9sLmFjY29yZGlvbi10aXRsZScpLmNsaWNrKCk7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59KTtcclxuXHJcbiQoJy5hY2NvcmRpb24tY29udGVudCBhJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgaWYgKCR0aGlzLmhhc0NsYXNzKCdhbmdsZS11cCcpKXJldHVybjtcclxuICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbn0pO1xyXG5cclxuKGZ1bmN0aW9uKCl7XHJcbiAgdmFyIGVscyA9ICQoJy5hY2NvcmRpb25fbW9yZScpO1xyXG5cclxuICBmdW5jdGlvbiBhZGRCdXR0b24oZWwsIGNsYXNzTmFtZSwgdGl0bGUpIHtcclxuICAgICAgdmFyIGJ1dHRvbnMgPSAkKGVsKS5maW5kKCcuJytjbGFzc05hbWUpO1xyXG4gICAgICBpZiAoYnV0dG9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIHZhciBidXR0b24gPSAkKCc8ZGl2PicpLmFkZENsYXNzKGNsYXNzTmFtZSkuYWRkQ2xhc3MoJ2FjY29yZGlvbl9tb3JlX2J1dHRvbicpO1xyXG4gICAgICAgICAgdmFyIGEgPSAkKCc8YT4nKS5hdHRyKCdocmVmJywgXCJcIikuYWRkQ2xhc3MoJ2JsdWUnKS5odG1sKHRpdGxlKTtcclxuICAgICAgICAgICQoYnV0dG9uKS5hcHBlbmQoYSk7XHJcbiAgICAgICAgICAkKGVsKS5hcHBlbmQoYnV0dG9uKTtcclxuICAgICAgfVxyXG4gIH1cclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5hY2NvcmRpb25fbW9yZV9idXR0b25fbW9yZScsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQodGhpcykuY2xvc2VzdCgnLmFjY29yZGlvbl9tb3JlJykuYWRkQ2xhc3MoJ29wZW4nKTtcclxuICB9KTtcclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5hY2NvcmRpb25fbW9yZV9idXR0b25fbGVzcycsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQodGhpcykuY2xvc2VzdCgnLmFjY29yZGlvbl9tb3JlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICB9KTtcclxuXHJcblxyXG5cclxuICBmdW5jdGlvbiByZWJ1aWxkKCl7XHJcbiAgICAkKGVscykuZWFjaChmdW5jdGlvbihrZXksIGl0ZW0pe1xyXG4gICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgIHZhciBjb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuYWNjb3JkaW9uX21vcmVfY29udGVudCcpO1xyXG4gICAgICBpZiAoY29udGVudC5zY3JvbGxIZWlnaHQgPiBjb250ZW50LmNsaWVudEhlaWdodCkge1xyXG4gICAgICAgIGFkZEJ1dHRvbihpdGVtLCAnYWNjb3JkaW9uX21vcmVfYnV0dG9uX21vcmUnLCAn0J/QvtC00YDQvtCx0L3QtdC1Jyk7XHJcbiAgICAgICAgYWRkQnV0dG9uKGl0ZW0sICdhY2NvcmRpb25fbW9yZV9idXR0b25fbGVzcycsICfQodC60YDRi9GC0YwnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKGl0ZW0pLmZpbmQoJy5hY2NvcmRpb25fbW9yZV9idXR0b24nKS5yZW1vdmUoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gIH1cclxuXHJcbiAgJCh3aW5kb3cpLnJlc2l6ZShyZWJ1aWxkKTtcclxuICByZWJ1aWxkKCk7XHJcbn0pKCk7XHJcblxyXG5cclxuIiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XHJcbiAgdmFyIGZpbGVBcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IgPyB0cnVlIDogZmFsc2U7XHJcbiAgdmFyIGRlZmF1bHRzID0ge1xyXG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJ1xyXG4gIH07XHJcbiAgdmFyIGxhc3RfcG9zdCA9IGZhbHNlO1xyXG5cclxuICBmdW5jdGlvbiBvblBvc3QocG9zdCkge1xyXG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XHJcbiAgICAvL2NvbnNvbGUubG9nKHBvc3QsIHRoaXMpO1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcclxuICAgIHZhciB3cmFwX2h0bWwgPSBkYXRhLndyYXBfaHRtbDtcclxuXHJcbiAgICBpZiAocG9zdC5yZW5kZXIpIHtcclxuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3MgPSBcIm5vdGlmeV93aGl0ZVwiO1xyXG4gICAgICBub3RpZmljYXRpb24uYWxlcnQocG9zdCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgaWYgKHBvc3QuaHRtbCkge1xyXG4gICAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xyXG4gICAgICAgIGFqYXhGb3JtKHdyYXApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICghcG9zdC5lcnJvcikge1xyXG4gICAgICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICAgICAgd3JhcC5odG1sKHdyYXBfaHRtbCk7XHJcbiAgICAgICAgICBmb3JtLmZpbmQoJ2lucHV0W3R5cGU9dGV4dF0sdGV4dGFyZWEnKS52YWwoJycpO1xyXG4gICAgICAgICAgYWpheEZvcm0od3JhcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBwb3N0LmVycm9yID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgIGZvciAodmFyIGluZGV4IGluIHBvc3QuZXJyb3IpIHtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICd0eXBlJzogJ2VycicsXHJcbiAgICAgICAgICAndGl0bGUnOiAn0J7RiNC40LHQutCwJyxcclxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpbmRleF1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zdC5lcnJvci5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcclxuICAgICAgICAgICd0aXRsZSc6ICfQntGI0LjQsdC60LAnLFxyXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0LmVycm9yW2ldXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChwb3N0LmVycm9yIHx8IHBvc3QubWVzc2FnZSkge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgJ3R5cGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICdzdWNjZXNzJyA6ICdlcnInLFxyXG4gICAgICAgICAgJ3RpdGxlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAn0KPRgdC/0LXRiNC90L4nIDogJ9Ce0YjQuNCx0LrQsCcsXHJcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3JcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy9cclxuICAgIC8vIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgLy8gICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcclxuICAgIC8vICAgICAndGl0bGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICfQo9GB0L/QtdGI0L3QvicgOiAn0J7RiNC40LHQutCwJyxcclxuICAgIC8vICAgICAnbWVzc2FnZSc6IEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikgPyBwb3N0LmVycm9yWzBdIDogKHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3IpXHJcbiAgICAvLyB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uRmFpbCgpIHtcclxuICAgIGxhc3RfcG9zdCA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcclxuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIHdyYXAuaHRtbCgnPGgzPtCj0L/RgS4uLiDQktC+0LfQvdC40LrQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwPGgzPicgK1xyXG4gICAgICAnPHA+0KfQsNGB0YLQviDRjdGC0L4g0L/RgNC+0LjRgdGF0L7QtNC40YIg0LIg0YHQu9GD0YfQsNC1LCDQtdGB0LvQuCDQstGLINC90LXRgdC60L7Qu9GM0LrQviDRgNCw0Lcg0L/QvtC00YDRj9C0INC90LXQstC10YDQvdC+INCy0LLQtdC70Lgg0YHQstC+0Lgg0YPRh9C10YLQvdGL0LUg0LTQsNC90L3Ri9C1LiDQndC+INCy0L7Qt9C80L7QttC90Ysg0Lgg0LTRgNGD0LPQuNC1INC/0YDQuNGH0LjQvdGLLiDQkiDQu9GO0LHQvtC8INGB0LvRg9GH0LDQtSDQvdC1INGA0LDRgdGB0YLRgNCw0LjQstCw0LnRgtC10YHRjCDQuCDQv9GA0L7RgdGC0L4g0L7QsdGA0LDRgtC40YLQtdGB0Ywg0Log0L3QsNGI0LXQvNGDINC+0L/QtdGA0LDRgtC+0YDRgyDRgdC70YPQttCx0Ysg0L/QvtC00LTQtdGA0LbQutC4LjwvcD48YnI+JyArXHJcbiAgICAgICc8cD7QodC/0LDRgdC40LHQvi48L3A+Jyk7XHJcbiAgICBhamF4Rm9ybSh3cmFwKTtcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvblN1Ym1pdChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAvL2Uuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAvL2Uuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgdmFyIGN1cnJlbnRUaW1lTWlsbGlzID0gK25ldyBEYXRlKCk7XHJcbiAgICBpZiAoY3VycmVudFRpbWVNaWxsaXMgLSBsYXN0X3Bvc3QgPCAxMDAwICogMikge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgbGFzdF9wb3N0ID0gY3VycmVudFRpbWVNaWxsaXM7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xyXG4gICAgZGF0YS53cmFwX2h0bWw9d3JhcC5odG1sKCk7XHJcbiAgICB2YXIgaXNWYWxpZCA9IHRydWU7XHJcblxyXG4gICAgLy9pbml0KHdyYXApO1xyXG5cclxuICAgIGlmIChmb3JtLnlpaUFjdGl2ZUZvcm0pIHtcclxuICAgICAgdmFyIGQgPSBmb3JtLmRhdGEoJ3lpaUFjdGl2ZUZvcm0nKTtcclxuICAgICAgaWYgKGQpIHtcclxuICAgICAgICBkLnZhbGlkYXRlZCA9IHRydWU7XHJcbiAgICAgICAgZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJywgZCk7XHJcbiAgICAgICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScpO1xyXG4gICAgICAgIGlzVmFsaWQgPSBkLnZhbGlkYXRlZDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzVmFsaWQgPSBpc1ZhbGlkICYmIChmb3JtLmZpbmQoZGF0YS5wYXJhbS5lcnJvcl9jbGFzcykubGVuZ3RoID09IDApO1xyXG5cclxuICAgIGlmICghaXNWYWxpZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgdmFyIHJlcXVpcmVkID0gZm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCcpO1xyXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgcmVxdWlyZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgaGVscEJsb2NrID0gcmVxdWlyZWQuZXEoaSkuYXR0cigndHlwZScpID09ICdoaWRkZW4nID8gcmVxdWlyZWQuZXEoaSkubmV4dCgnLmhlbHAtYmxvY2snKSA6XHJcbiAgICAgICAgICByZXF1aXJlZC5lcShpKS5jbG9zZXN0KCcuZm9ybS1pbnB1dC1ncm91cCcpLm5leHQoJy5oZWxwLWJsb2NrJyk7XHJcbiAgICAgICAgdmFyIGhlbHBNZXNzYWdlID0gaGVscEJsb2NrICYmIGhlbHBCbG9jay5kYXRhKCdtZXNzYWdlJykgPyBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpIDogJ9Cd0LXQvtCx0YXQvtC00LjQvNC+INC30LDQv9C+0LvQvdC40YLRjCc7XHJcblxyXG4gICAgICAgIGlmIChyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICBoZWxwQmxvY2suaHRtbChoZWxwTWVzc2FnZSk7XHJcbiAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGhlbHBCbG9jay5odG1sKCcnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcclxuXHJcbiAgICB2YXIgcG9zdERhdGEgPSBmb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xyXG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xyXG4gICAgZm9ybS5odG1sKCcnKTtcclxuICAgIHdyYXAuaHRtbCgnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxwPtCe0YLQv9GA0LDQstC60LAg0LTQsNC90L3Ri9GFPC9wPjwvZGl2PicpO1xyXG5cclxuICAgIGRhdGEudXJsICs9IChkYXRhLnVybC5pbmRleE9mKCc/JykgPiAwID8gJyYnIDogJz8nKSArICdyYz0nICsgTWF0aC5yYW5kb20oKTtcclxuICAgIC8vY29uc29sZS5sb2coZGF0YS51cmwpO1xyXG5cclxuICAgIC8qaWYoIXBvc3REYXRhLnJldHVyblVybCl7XHJcbiAgICAgIHBvc3REYXRhLnJldHVyblVybD1sb2NhdGlvbi5ocmVmO1xyXG4gICAgfSovXHJcblxyXG4gICAgJC5wb3N0KFxyXG4gICAgICBkYXRhLnVybCxcclxuICAgICAgcG9zdERhdGEsXHJcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxyXG4gICAgICAnanNvbidcclxuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdCh3cmFwKSB7XHJcbiAgICBmb3JtID0gd3JhcC5maW5kKCdmb3JtJyk7XHJcbiAgICBkYXRhID0ge1xyXG4gICAgICBmb3JtOiBmb3JtLFxyXG4gICAgICBwYXJhbTogZGVmYXVsdHMsXHJcbiAgICAgIHdyYXA6IHdyYXBcclxuICAgIH07XHJcbiAgICBkYXRhLnVybCA9IGZvcm0uYXR0cignYWN0aW9uJykgfHwgbG9jYXRpb24uaHJlZjtcclxuICAgIGRhdGEubWV0aG9kID0gZm9ybS5hdHRyKCdtZXRob2QnKSB8fCAncG9zdCc7XHJcbiAgICBmb3JtLnVuYmluZCgnc3VibWl0Jyk7XHJcbiAgICAvL2Zvcm0ub2ZmKCdzdWJtaXQnKTtcclxuICAgIGZvcm0ub24oJ3N1Ym1pdCcsIG9uU3VibWl0LmJpbmQoZGF0YSkpO1xyXG4gIH1cclxuXHJcbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxyXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXHJcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcclxuXHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpbml0KGVscy5lcShpKSk7XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIHBsYWNlaG9sZGVyID09ICdmdW5jdGlvbicpIHtcclxuICAgICAgcGxhY2Vob2xkZXIoKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRTUk8oKSB7XHJcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbyA9IHt9O1xyXG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XHJcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAob1t0aGlzLm5hbWVdKSB7XHJcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xyXG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9bdGhpcy5uYW1lXSA9IHRoaXMudmFsdWUgfHwgJyc7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG87XHJcbiAgfTtcclxufTtcclxuYWRkU1JPKCk7IiwidmFyIHNkVG9vbHRpcCA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB2YXIgdG9vbHRpcFRpbWVPdXQgPSBudWxsO1xyXG4gICAgdmFyIGRpc3BsYXlUaW1lT3ZlciA9IDA7XHJcbiAgICB2YXIgZGlzcGxheVRpbWVDbGljayA9IDMwMDA7XHJcbiAgICB2YXIgaGlkZVRpbWUgPSAxMDA7XHJcbiAgICB2YXIgYXJyb3cgPSAxMDtcclxuICAgIHZhciBhcnJvd1dpZHRoID0gODtcclxuICAgIHZhciB0b29sdGlwO1xyXG4gICAgdmFyIHNpemUgPSAnc21hbGwnO1xyXG4gICAgdmFyIGhpZGVDbGFzcyA9ICdoaWRkZW4nO1xyXG4gICAgdmFyIHRvb2x0aXBFbGVtZW50cyA9ICQoJ1tkYXRhLXRvZ2dsZT10b29sdGlwXScpO1xyXG4gICAgdmFyIGN1cnJlbnRFbGVtZW50O1xyXG5cclxuICAgIHZhciB0b29sdGlwSW5pdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0b29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndGlwc29fYnViYmxlJykuYWRkQ2xhc3Moc2l6ZSkuYWRkQ2xhc3MoaGlkZUNsYXNzKVxyXG4gICAgICAgICAgICAuaHRtbCgnPGRpdiBjbGFzcz1cInRpcHNvX2Fycm93XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRpdHNvX3RpdGxlXCI+PC9kaXY+PGRpdiBjbGFzcz1cInRpcHNvX2NvbnRlbnRcIj48L2Rpdj4nKTtcclxuICAgICAgICAkKHRvb2x0aXApLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBjaGVja01vdXNlUG9zKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodG9vbHRpcCkub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGNoZWNrTW91c2VQb3MoZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0b29sdGlwKTtcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gY2hlY2tNb3VzZVBvcyhlKSB7XHJcbiAgICAgICAgaWYgKGUuY2xpZW50WCA+ICQoY3VycmVudEVsZW1lbnQpLm9mZnNldCgpLmxlZnQgJiYgZS5jbGllbnRYIDwgJChjdXJyZW50RWxlbWVudCkub2Zmc2V0KCkubGVmdCArICQoY3VycmVudEVsZW1lbnQpLm91dGVyV2lkdGgoKVxyXG4gICAgICAgICAgICAmJiBlLmNsaWVudFkgPiAkKGN1cnJlbnRFbGVtZW50KS5vZmZzZXQoKS50b3AgJiYgZS5jbGllbnRZIDwgJChjdXJyZW50RWxlbWVudCkub2Zmc2V0KCkudG9wICsgJChjdXJyZW50RWxlbWVudCkub3V0ZXJIZWlnaHQoKSkge1xyXG4gICAgICAgICAgICB0b29sdGlwU2hvdyhjdXJyZW50RWxlbWVudCwgZGlzcGxheVRpbWVPdmVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdG9vbHRpcFNob3coZWxlbSwgZGlzcGxheVRpbWUpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodG9vbHRpcFRpbWVPdXQpO1xyXG4gICAgICAgIC8vaWYgKCQodG9vbHRpcCkuaGFzQ2xhc3MoaGlkZUNsYXNzKSkge1xyXG4gICAgICAgICAgICB2YXIgdGl0bGUgPSAkKGVsZW0pLmRhdGEoJ29yaWdpbmFsLXRpdGxlJyk7XHJcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9ICQoZWxlbSkuZGF0YSgncGxhY2VtZW50JykgfHwgJ2JvdHRvbSc7XHJcbiAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyIGJvdHRvbV9yaWdodF9jb3JuZXIgdG9wX2xlZnRfY29ybmVyIGJvdHRvbV9sZWZ0X2Nvcm5lclwiKTtcclxuICAgICAgICAgICAgJCh0b29sdGlwKS5maW5kKCcudGl0c29fdGl0bGUnKS5odG1sKHRpdGxlKTtcclxuICAgICAgICAgICAgc2V0UG9zaXRvbihlbGVtLCBwb3NpdGlvbik7XHJcbiAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoaGlkZUNsYXNzKTtcclxuICAgICAgICAgICAgY3VycmVudEVsZW1lbnQgPSBlbGVtO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRpc3BsYXlUaW1lID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcFRpbWVPdXQgPSBzZXRUaW1lb3V0KHRvb2x0aXBIaWRlLCBkaXNwbGF5VGltZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgIC8vIH1cclxuXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0b29sdGlwSGlkZSgpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodG9vbHRpcFRpbWVPdXQpO1xyXG4gICAgICAgIHRvb2x0aXBUaW1lT3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKGhpZGVDbGFzcyk7XHJcbiAgICAgICAgfSwgaGlkZVRpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldFBvc2l0b24oZWxlbSwgcG9zaXRpb24pe1xyXG4gICAgICAgIHZhciAkZSA9ICQoZWxlbSk7XHJcbiAgICAgICAgdmFyICR3aW4gPSAkKHdpbmRvdyk7XHJcbiAgICAgICAgdmFyIGN1c3RvbVRvcCA9ICQoZWxlbSkuZGF0YSgndG9wJyk7Ly/Qt9Cw0LTQsNC90LAg0L/QvtC30LjRhtC40Y8g0LLQvdGD0YLRgNC4INGN0LvQtdC80LXQvdGC0LBcclxuICAgICAgICB2YXIgY3VzdG9tTGVmdCA9ICQoZWxlbSkuZGF0YSgnbGVmdCcpOy8v0LfQsNC00LDQvdCwINC/0L7Qt9C40YbQuNGPINCy0L3Rg9GC0YDQuCDRjdC70LXQvNC10L3RgtCwXHJcbiAgICAgICAgdmFyIG5vcmV2ZXJ0ID0gJChlbGVtKS5kYXRhKCdub3JldmVydCcpOy8v0L3QtSDQv9C10YDQtdCy0L7RgNCw0YfQuNCy0LDRgtGMXHJcbiAgICAgICAgc3dpdGNoKHBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICBwb3NfbGVmdCA9ICRlLm9mZnNldCgpLmxlZnQgKyAoY3VzdG9tTGVmdCA/IGN1c3RvbUxlZnQgOiAkZS5vdXRlcldpZHRoKCkgLyAyKSAtICQodG9vbHRpcCkub3V0ZXJXaWR0aCgpIC8gMjtcclxuICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgLSAkKHRvb2x0aXApLm91dGVySGVpZ2h0KCkgKyAoY3VzdG9tVG9wID8gY3VzdG9tVG9wIDogMCkgLSBhcnJvdztcclxuICAgICAgICAgICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpcHNvX2Fycm93JykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5MZWZ0OiAtYXJyb3dXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICgocG9zX3RvcCA8ICR3aW4uc2Nyb2xsVG9wKCkpICYmICFub3JldmVydCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgKyhjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAkZS5vdXRlckhlaWdodCgpKSArIGFycm93O1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ2JvdHRvbScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndG9wJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICAgICAgICAgIHBvc19sZWZ0ID0gJGUub2Zmc2V0KCkubGVmdCArIChjdXN0b21MZWZ0ID8gY3VzdG9tTGVmdCA6ICRlLm91dGVyV2lkdGgoKSAvIDIpIC0gJCh0b29sdGlwKS5vdXRlcldpZHRoKCkgLyAyO1xyXG4gICAgICAgICAgICAgICAgcG9zX3RvcCA9ICRlLm9mZnNldCgpLnRvcCArIChjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAkZS5vdXRlckhlaWdodCgpKSArIGFycm93O1xyXG4gICAgICAgICAgICAgICAgJCh0b29sdGlwKS5maW5kKCcudGlwc29fYXJyb3cnKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQ6IC1hcnJvd1dpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJydcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKChwb3NfdG9wICsgJCh0b29sdGlwKS5oZWlnaHQoKSA+ICR3aW4uc2Nyb2xsVG9wKCkgKyAkd2luLm91dGVySGVpZ2h0KCkpICYmICFub3JldmVydCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgLSAkKHRvb2x0aXApLmhlaWdodCgpICsgKGN1c3RvbVRvcCA/IGN1c3RvbVRvcCA6IDApIC0gYXJyb3c7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndG9wJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKCd0b3AgYm90dG9tIGxlZnQgcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCdib3R0b20nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKHRvb2x0aXApLmNzcyh7XHJcbiAgICAgICAgICAgIGxlZnQ6ICBwb3NfbGVmdCxcclxuICAgICAgICAgICAgdG9wOiBwb3NfdG9wXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHRvb2x0aXBFbGVtZW50cy5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBpZiAoJCh0aGlzKS5kYXRhKCdjbGlja2FibGUnKSkge1xyXG4gICAgICAgICAgaWYgKCQodG9vbHRpcCkuaGFzQ2xhc3MoaGlkZUNsYXNzKSkge1xyXG4gICAgICAgICAgICAgIHRvb2x0aXBTaG93KHRoaXMsIGRpc3BsYXlUaW1lQ2xpY2spO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0b29sdGlwSGlkZSgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMDI0KSB7XHJcbiAgICAgICAgICAgIHRvb2x0aXBTaG93KHRoaXMsIGRpc3BsYXlUaW1lT3Zlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICB0b29sdGlwRWxlbWVudHMub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IDEwMjQpIHtcclxuICAgICAgICAgICAgdG9vbHRpcFNob3codGhpcywgZGlzcGxheVRpbWVPdmVyKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHRvb2x0aXBFbGVtZW50cy5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpe1xyXG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMDI0KSB7XHJcbiAgICAgICAgICAgIHRvb2x0aXBIaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRvb2x0aXBJbml0KCk7XHJcbiAgICB9KTtcclxuXHJcblxyXG59KCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgdmFyICRub3R5ZmlfYnRuID0gJCgnLmhlYWRlci1sb2dvX25vdHknKTtcclxuICBpZiAoJG5vdHlmaV9idG4ubGVuZ3RoID09IDApIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gICQuZ2V0KCcvYWNjb3VudC9ub3RpZmljYXRpb24nLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhLm5vdGlmaWNhdGlvbnMgfHwgZGF0YS5ub3RpZmljYXRpb25zLmxlbmd0aCA9PSAwKSByZXR1cm47XHJcblxyXG4gICAgdmFyIG91dCA9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWJveD48ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWJveC1pbm5lcj48dWwgY2xhc3M9XCJoZWFkZXItbm90eS1saXN0XCI+JztcclxuICAgICRub3R5ZmlfYnRuLmZpbmQoJ2EnKS5yZW1vdmVBdHRyKCdocmVmJyk7XHJcbiAgICB2YXIgaGFzX25ldyA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm5vdGlmaWNhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgZWwgPSBkYXRhLm5vdGlmaWNhdGlvbnNbaV07XHJcbiAgICAgIHZhciBpc19uZXcgPSAoZWwuaXNfdmlld2VkID09IDAgJiYgZWwudHlwZV9pZCA9PSAyKTtcclxuICAgICAgb3V0ICs9ICc8bGkgY2xhc3M9XCJoZWFkZXItbm90eS1pdGVtJyArIChpc19uZXcgPyAnIGhlYWRlci1ub3R5LWl0ZW1fbmV3JyA6ICcnKSArICdcIj4nO1xyXG4gICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktZGF0YT4nICsgZWwuZGF0YSArICc8L2Rpdj4nO1xyXG4gICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktdGV4dD4nICsgZWwudGV4dCArICc8L2Rpdj4nO1xyXG4gICAgICBvdXQgKz0gJzwvbGk+JztcclxuICAgICAgaGFzX25ldyA9IGhhc19uZXcgfHwgaXNfbmV3O1xyXG4gICAgfVxyXG5cclxuICAgIG91dCArPSAnPC91bD4nO1xyXG4gICAgb3V0ICs9ICc8YSBjbGFzcz1cImJ0biBoZWFkZXItbm90eS1ib3gtYnRuXCIgaHJlZj1cIi9hY2NvdW50L25vdGlmaWNhdGlvblwiPicgKyBkYXRhLmJ0biArICc8L2E+JztcclxuICAgIG91dCArPSAnPC9kaXY+PC9kaXY+JztcclxuICAgICQoJy5oZWFkZXInKS5hcHBlbmQob3V0KTtcclxuXHJcbiAgICBpZiAoaGFzX25ldykge1xyXG4gICAgICAkbm90eWZpX2J0bi5hZGRDbGFzcygndG9vbHRpcCcpLmFkZENsYXNzKCdoYXMtbm90eScpO1xyXG4gICAgfVxyXG5cclxuICAgICRub3R5ZmlfYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgaWYgKCQoJy5oZWFkZXItbm90eS1ib3gnKS5oYXNDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKSkge1xyXG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5yZW1vdmVDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykuYWRkQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XHJcbiAgICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XHJcblxyXG4gICAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdoYXMtbm90eScpKSB7XHJcbiAgICAgICAgICAkLnBvc3QoJy9hY2NvdW50L25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmhlYWRlci1sb2dvX25vdHknKS5yZW1vdmVDbGFzcygndG9vbHRpcCcpLnJlbW92ZUNsYXNzKCdoYXMtbm90eScpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5yZW1vdmVDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLW5vdHktbGlzdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSlcclxuICB9LCAnanNvbicpO1xyXG5cclxufSkoKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIG1lZ2FzbGlkZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gIHZhciBzbGlkZXJfZGF0YSA9IGZhbHNlO1xyXG4gIHZhciBjb250YWluZXJfaWQgPSBcInNlY3Rpb24jbWVnYV9zbGlkZXJcIjtcclxuICB2YXIgcGFyYWxsYXhfZ3JvdXAgPSBmYWxzZTtcclxuICB2YXIgcGFyYWxsYXhfdGltZXIgPSBmYWxzZTtcclxuICB2YXIgcGFyYWxsYXhfY291bnRlciA9IDA7XHJcbiAgdmFyIHBhcmFsbGF4X2QgPSAxO1xyXG4gIHZhciBtb2JpbGVfbW9kZSA9IC0xO1xyXG4gIHZhciBtYXhfdGltZV9sb2FkX3BpYyA9IDMwMDtcclxuICB2YXIgbW9iaWxlX3NpemUgPSA3MDA7XHJcbiAgdmFyIHJlbmRlcl9zbGlkZV9ub20gPSAwO1xyXG4gIHZhciB0b3RfaW1nX3dhaXQ7XHJcbiAgdmFyIHNsaWRlcztcclxuICB2YXIgc2xpZGVfc2VsZWN0X2JveDtcclxuICB2YXIgZWRpdG9yO1xyXG4gIHZhciB0aW1lb3V0SWQ7XHJcbiAgdmFyIHNjcm9sbF9wZXJpb2QgPSA2MDAwO1xyXG5cclxuICB2YXIgcG9zQXJyID0gW1xyXG4gICAgJ3NsaWRlcl9fdGV4dC1sdCcsICdzbGlkZXJfX3RleHQtY3QnLCAnc2xpZGVyX190ZXh0LXJ0JyxcclxuICAgICdzbGlkZXJfX3RleHQtbGMnLCAnc2xpZGVyX190ZXh0LWNjJywgJ3NsaWRlcl9fdGV4dC1yYycsXHJcbiAgICAnc2xpZGVyX190ZXh0LWxiJywgJ3NsaWRlcl9fdGV4dC1jYicsICdzbGlkZXJfX3RleHQtcmInLFxyXG4gIF07XHJcbiAgdmFyIHBvc19saXN0ID0gW1xyXG4gICAgJ9Cb0LXQstC+INCy0LXRgNGFJywgJ9GG0LXQvdGC0YAg0LLQtdGA0YUnLCAn0L/RgNCw0LLQviDQstC10YDRhScsXHJcbiAgICAn0JvQtdCy0L4g0YbQtdC90YLRgCcsICfRhtC10L3RgtGAJywgJ9C/0YDQsNCy0L4g0YbQtdC90YLRgCcsXHJcbiAgICAn0JvQtdCy0L4g0L3QuNC3JywgJ9GG0LXQvdGC0YAg0L3QuNC3JywgJ9C/0YDQsNCy0L4g0L3QuNC3JyxcclxuICBdO1xyXG4gIHZhciBzaG93X2RlbGF5ID0gW1xyXG4gICAgJ3Nob3dfbm9fZGVsYXknLFxyXG4gICAgJ3Nob3dfZGVsYXlfMDUnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMTAnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMTUnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMjAnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMjUnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMzAnXHJcbiAgXTtcclxuICB2YXIgaGlkZV9kZWxheSA9IFtcclxuICAgICdoaWRlX25vX2RlbGF5JyxcclxuICAgICdoaWRlX2RlbGF5XzA1JyxcclxuICAgICdoaWRlX2RlbGF5XzEwJyxcclxuICAgICdoaWRlX2RlbGF5XzE1JyxcclxuICAgICdoaWRlX2RlbGF5XzIwJ1xyXG4gIF07XHJcbiAgdmFyIHllc19ub19hcnIgPSBbXHJcbiAgICAnbm8nLFxyXG4gICAgJ3llcydcclxuICBdO1xyXG4gIHZhciB5ZXNfbm9fdmFsID0gW1xyXG4gICAgJycsXHJcbiAgICAnZml4ZWRfX2Z1bGwtaGVpZ2h0J1xyXG4gIF07XHJcbiAgdmFyIGJ0bl9zdHlsZSA9IFtcclxuICAgICdub25lJyxcclxuICAgICdib3JkbycsXHJcbiAgXTtcclxuICB2YXIgc2hvd19hbmltYXRpb25zID0gW1xyXG4gICAgXCJub3RfYW5pbWF0ZVwiLFxyXG4gICAgXCJib3VuY2VJblwiLFxyXG4gICAgXCJib3VuY2VJbkRvd25cIixcclxuICAgIFwiYm91bmNlSW5MZWZ0XCIsXHJcbiAgICBcImJvdW5jZUluUmlnaHRcIixcclxuICAgIFwiYm91bmNlSW5VcFwiLFxyXG4gICAgXCJmYWRlSW5cIixcclxuICAgIFwiZmFkZUluRG93blwiLFxyXG4gICAgXCJmYWRlSW5MZWZ0XCIsXHJcbiAgICBcImZhZGVJblJpZ2h0XCIsXHJcbiAgICBcImZhZGVJblVwXCIsXHJcbiAgICBcImZsaXBJblhcIixcclxuICAgIFwiZmxpcEluWVwiLFxyXG4gICAgXCJsaWdodFNwZWVkSW5cIixcclxuICAgIFwicm90YXRlSW5cIixcclxuICAgIFwicm90YXRlSW5Eb3duTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVJblVwTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVJblVwUmlnaHRcIixcclxuICAgIFwiamFja0luVGhlQm94XCIsXHJcbiAgICBcInJvbGxJblwiLFxyXG4gICAgXCJ6b29tSW5cIlxyXG4gIF07XHJcblxyXG4gIHZhciBoaWRlX2FuaW1hdGlvbnMgPSBbXHJcbiAgICBcIm5vdF9hbmltYXRlXCIsXHJcbiAgICBcImJvdW5jZU91dFwiLFxyXG4gICAgXCJib3VuY2VPdXREb3duXCIsXHJcbiAgICBcImJvdW5jZU91dExlZnRcIixcclxuICAgIFwiYm91bmNlT3V0UmlnaHRcIixcclxuICAgIFwiYm91bmNlT3V0VXBcIixcclxuICAgIFwiZmFkZU91dFwiLFxyXG4gICAgXCJmYWRlT3V0RG93blwiLFxyXG4gICAgXCJmYWRlT3V0TGVmdFwiLFxyXG4gICAgXCJmYWRlT3V0UmlnaHRcIixcclxuICAgIFwiZmFkZU91dFVwXCIsXHJcbiAgICBcImZsaXBPdXRYXCIsXHJcbiAgICBcImxpcE91dFlcIixcclxuICAgIFwibGlnaHRTcGVlZE91dFwiLFxyXG4gICAgXCJyb3RhdGVPdXRcIixcclxuICAgIFwicm90YXRlT3V0RG93bkxlZnRcIixcclxuICAgIFwicm90YXRlT3V0RG93blJpZ2h0XCIsXHJcbiAgICBcInJvdGF0ZU91dFVwTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVPdXRVcFJpZ2h0XCIsXHJcbiAgICBcImhpbmdlXCIsXHJcbiAgICBcInJvbGxPdXRcIlxyXG4gIF07XHJcbiAgdmFyIHN0VGFibGU7XHJcbiAgdmFyIHBhcmFsYXhUYWJsZTtcclxuXHJcbiAgZnVuY3Rpb24gaW5pdEltYWdlU2VydmVyU2VsZWN0KGVscykge1xyXG4gICAgaWYgKGVscy5sZW5ndGggPT0gMClyZXR1cm47XHJcbiAgICBlbHMud3JhcCgnPGRpdiBjbGFzcz1cInNlbGVjdF9pbWdcIj4nKTtcclxuICAgIGVscyA9IGVscy5wYXJlbnQoKTtcclxuICAgIGVscy5hcHBlbmQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmlsZV9idXR0b25cIj48aSBjbGFzcz1cIm1jZS1pY28gbWNlLWktYnJvd3NlXCI+PC9pPjwvYnV0dG9uPicpO1xyXG4gICAgLyplbHMuZmluZCgnYnV0dG9uJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoKSB7XHJcbiAgICAgJCgnI3JveHlDdXN0b21QYW5lbDInKS5hZGRDbGFzcygnb3BlbicpXHJcbiAgICAgfSk7Ki9cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBlbCA9IGVscy5lcShpKS5maW5kKCdpbnB1dCcpO1xyXG4gICAgICBpZiAoIWVsLmF0dHIoJ2lkJykpIHtcclxuICAgICAgICBlbC5hdHRyKCdpZCcsICdmaWxlXycgKyBpICsgJ18nICsgRGF0ZS5ub3coKSlcclxuICAgICAgfVxyXG4gICAgICB2YXIgdF9pZCA9IGVsLmF0dHIoJ2lkJyk7XHJcbiAgICAgIG1paGFpbGRldi5lbEZpbmRlci5yZWdpc3Rlcih0X2lkLCBmdW5jdGlvbiAoZmlsZSwgaWQpIHtcclxuICAgICAgICAvLyQodGhpcykudmFsKGZpbGUudXJsKS50cmlnZ2VyKCdjaGFuZ2UnLCBbZmlsZSwgaWRdKTtcclxuICAgICAgICAkKCcjJyArIGlkKS52YWwoZmlsZS51cmwpLmNoYW5nZSgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIDtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmZpbGVfYnV0dG9uJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnByZXYoKTtcclxuICAgICAgdmFyIGlkID0gJHRoaXMuYXR0cignaWQnKTtcclxuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLm9wZW5NYW5hZ2VyKHtcclxuICAgICAgICBcInVybFwiOiBcIi9tYW5hZ2VyL2VsZmluZGVyP2ZpbHRlcj1pbWFnZSZjYWxsYmFjaz1cIiArIGlkICsgXCImbGFuZz1ydVwiLFxyXG4gICAgICAgIFwid2lkdGhcIjogXCJhdXRvXCIsXHJcbiAgICAgICAgXCJoZWlnaHRcIjogXCJhdXRvXCIsXHJcbiAgICAgICAgXCJpZFwiOiBpZFxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuSW5wdXQoZGF0YSkge1xyXG4gICAgdmFyIGlucHV0ID0gJzxpbnB1dCBjbGFzcz1cIicgKyAoZGF0YS5pbnB1dENsYXNzIHx8ICcnKSArICdcIiB2YWx1ZT1cIicgKyAoZGF0YS52YWx1ZSB8fCAnJykgKyAnXCI+JztcclxuICAgIGlmIChkYXRhLmxhYmVsKSB7XHJcbiAgICAgIGlucHV0ID0gJzxsYWJlbD48c3Bhbj4nICsgZGF0YS5sYWJlbCArICc8L3NwYW4+JyArIGlucHV0ICsgJzwvbGFiZWw+JztcclxuICAgIH1cclxuICAgIGlmIChkYXRhLnBhcmVudCkge1xyXG4gICAgICBpbnB1dCA9ICc8JyArIGRhdGEucGFyZW50ICsgJz4nICsgaW5wdXQgKyAnPC8nICsgZGF0YS5wYXJlbnQgKyAnPic7XHJcbiAgICB9XHJcbiAgICBpbnB1dCA9ICQoaW5wdXQpO1xyXG5cclxuICAgIGlmIChkYXRhLm9uQ2hhbmdlKSB7XHJcbiAgICAgIHZhciBvbkNoYW5nZTtcclxuICAgICAgaWYgKGRhdGEuYmluZCkge1xyXG4gICAgICAgIGRhdGEuYmluZC5pbnB1dCA9IGlucHV0LmZpbmQoJ2lucHV0Jyk7XHJcbiAgICAgICAgb25DaGFuZ2UgPSBkYXRhLm9uQ2hhbmdlLmJpbmQoZGF0YS5iaW5kKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChpbnB1dC5maW5kKCdpbnB1dCcpKTtcclxuICAgICAgfVxyXG4gICAgICBpbnB1dC5maW5kKCdpbnB1dCcpLm9uKCdjaGFuZ2UnLCBvbkNoYW5nZSlcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlblNlbGVjdChkYXRhKSB7XHJcbiAgICB2YXIgaW5wdXQgPSAkKCc8c2VsZWN0Lz4nKTtcclxuXHJcbiAgICB2YXIgZWwgPSBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXTtcclxuICAgIGlmIChkYXRhLmluZGV4ICE9PSBmYWxzZSkge1xyXG4gICAgICBlbCA9IGVsW2RhdGEuaW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbFtkYXRhLnBhcmFtXSkge1xyXG4gICAgICBkYXRhLnZhbHVlID0gZWxbZGF0YS5wYXJhbV07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkYXRhLnZhbHVlID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZGF0YS5zdGFydF9vcHRpb24pIHtcclxuICAgICAgaW5wdXQuYXBwZW5kKGRhdGEuc3RhcnRfb3B0aW9uKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5saXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciB2YWw7XHJcbiAgICAgIHZhciB0eHQgPSBkYXRhLmxpc3RbaV07XHJcbiAgICAgIGlmIChkYXRhLnZhbF90eXBlID09IDApIHtcclxuICAgICAgICB2YWwgPSBkYXRhLmxpc3RbaV07XHJcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWxfdHlwZSA9PSAxKSB7XHJcbiAgICAgICAgdmFsID0gaTtcclxuICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbF90eXBlID09IDIpIHtcclxuICAgICAgICAvL3ZhbD1kYXRhLnZhbF9saXN0W2ldO1xyXG4gICAgICAgIHZhbCA9IGk7XHJcbiAgICAgICAgdHh0ID0gZGF0YS52YWxfbGlzdFtpXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHNlbCA9ICh2YWwgPT0gZGF0YS52YWx1ZSA/ICdzZWxlY3RlZCcgOiAnJyk7XHJcbiAgICAgIGlmIChzZWwgPT0gJ3NlbGVjdGVkJykge1xyXG4gICAgICAgIGlucHV0LmF0dHIoJ3RfdmFsJywgZGF0YS5saXN0W2ldKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgb3B0aW9uID0gJzxvcHRpb24gdmFsdWU9XCInICsgdmFsICsgJ1wiICcgKyBzZWwgKyAnPicgKyB0eHQgKyAnPC9vcHRpb24+JztcclxuICAgICAgaWYgKGRhdGEudmFsX3R5cGUgPT0gMikge1xyXG4gICAgICAgIG9wdGlvbiA9ICQob3B0aW9uKS5hdHRyKCdjb2RlJywgZGF0YS5saXN0W2ldKTtcclxuICAgICAgfVxyXG4gICAgICBpbnB1dC5hcHBlbmQob3B0aW9uKVxyXG4gICAgfVxyXG5cclxuICAgIGlucHV0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGRhdGEgPSB0aGlzO1xyXG4gICAgICB2YXIgdmFsID0gZGF0YS5lbC52YWwoKTtcclxuICAgICAgdmFyIHNsX29wID0gZGF0YS5lbC5maW5kKCdvcHRpb25bdmFsdWU9JyArIHZhbCArICddJyk7XHJcbiAgICAgIHZhciBjbHMgPSBzbF9vcC50ZXh0KCk7XHJcbiAgICAgIHZhciBjaCA9IHNsX29wLmF0dHIoJ2NvZGUnKTtcclxuICAgICAgaWYgKCFjaCljaCA9IGNscztcclxuICAgICAgaWYgKGRhdGEuaW5kZXggIT09IGZhbHNlKSB7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5pbmRleF1bZGF0YS5wYXJhbV0gPSB2YWw7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5wYXJhbV0gPSB2YWw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRhdGEub2JqLnJlbW92ZUNsYXNzKGRhdGEucHJlZml4ICsgZGF0YS5lbC5hdHRyKCd0X3ZhbCcpKTtcclxuICAgICAgZGF0YS5vYmouYWRkQ2xhc3MoZGF0YS5wcmVmaXggKyBjaCk7XHJcbiAgICAgIGRhdGEuZWwuYXR0cigndF92YWwnLCBjaCk7XHJcblxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBlbDogaW5wdXQsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06IGRhdGEucGFyYW0sXHJcbiAgICAgIHByZWZpeDogZGF0YS5wcmVmaXggfHwgJydcclxuICAgIH0pKTtcclxuXHJcbiAgICBpZiAoZGF0YS5wYXJlbnQpIHtcclxuICAgICAgdmFyIHBhcmVudCA9ICQoJzwnICsgZGF0YS5wYXJlbnQgKyAnLz4nKTtcclxuICAgICAgcGFyZW50LmFwcGVuZChpbnB1dCk7XHJcbiAgICAgIHJldHVybiBwYXJlbnQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRTZWxBbmltYXRpb25Db250cm9sbChkYXRhKSB7XHJcbiAgICB2YXIgYW5pbV9zZWwgPSBbXTtcclxuICAgIHZhciBvdXQ7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPlNob3cgYW5pbWF0aW9uPC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBzaG93X2FuaW1hdGlvbnMsXHJcbiAgICAgIHZhbF90eXBlOiAwLFxyXG4gICAgICBvYmo6IGRhdGEub2JqLFxyXG4gICAgICBncjogZGF0YS5ncixcclxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXHJcbiAgICAgIHBhcmFtOiAnc2hvd19hbmltYXRpb24nLFxyXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XHJcbiAgICB9KSk7XHJcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+U2hvdyBkZWxheTwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogc2hvd19kZWxheSxcclxuICAgICAgdmFsX3R5cGU6IDEsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ICdzaG93X2RlbGF5JyxcclxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcclxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8YnIvPicpO1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5IaWRlIGFuaW1hdGlvbjwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogaGlkZV9hbmltYXRpb25zLFxyXG4gICAgICB2YWxfdHlwZTogMCxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogJ2hpZGVfYW5pbWF0aW9uJyxcclxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcclxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPkhpZGUgZGVsYXk8L3NwYW4+Jyk7XHJcbiAgICB9XHJcbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IGhpZGVfZGVsYXksXHJcbiAgICAgIHZhbF90eXBlOiAxLFxyXG4gICAgICBvYmo6IGRhdGEub2JqLFxyXG4gICAgICBncjogZGF0YS5ncixcclxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXHJcbiAgICAgIHBhcmFtOiAnaGlkZV9kZWxheScsXHJcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcclxuICAgIH0pKTtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcclxuICAgICAgb3V0ID0gJCgnPGRpdiBjbGFzcz1cImFuaW1fc2VsXCIvPicpO1xyXG4gICAgICBvdXQuYXBwZW5kKGFuaW1fc2VsKTtcclxuICAgIH1cclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMSkge1xyXG4gICAgICBvdXQgPSBhbmltX3NlbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3V0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdF9lZGl0b3IoKSB7XHJcbiAgICAkKCcjdzEnKS5yZW1vdmUoKTtcclxuICAgICQoJyN3MV9idXR0b24nKS5yZW1vdmUoKTtcclxuICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9IHNsaWRlcl9kYXRhWzBdLm1vYmlsZS5zcGxpdCgnPycpWzBdO1xyXG5cclxuICAgIHZhciBlbCA9ICQoJyNtZWdhX3NsaWRlcl9jb250cm9sZScpO1xyXG4gICAgdmFyIGJ0bnNfYm94ID0gJCgnPGRpdiBjbGFzcz1cImJ0bl9ib3hcIi8+Jyk7XHJcblxyXG4gICAgZWwuYXBwZW5kKCc8aDI+0KPQv9GA0LDQstC70LXQvdC40LU8L2gyPicpO1xyXG4gICAgZWwuYXBwZW5kKCQoJzx0ZXh0YXJlYS8+Jywge1xyXG4gICAgICB0ZXh0OiBKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSksXHJcbiAgICAgIGlkOiAnc2xpZGVfZGF0YScsXHJcbiAgICAgIG5hbWU6IGVkaXRvclxyXG4gICAgfSkpO1xyXG5cclxuICAgIHZhciBidG4gPSAkKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQkNC60YLQuNCy0LjRgNC+0LLQsNGC0Ywg0YHQu9Cw0LnQtFwiKTtcclxuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xyXG4gICAgYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnaGlkZV9zbGlkZScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGJ0biA9ICQoJzxidXR0b24gY2xhc3M9XCJcIi8+JykudGV4dChcItCU0LXQsNC60YLQuNCy0LjRgNC+0LLQsNGC0Ywg0YHQu9Cw0LnQtFwiKTtcclxuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xyXG4gICAgYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5hZGRDbGFzcygnaGlkZV9zbGlkZScpO1xyXG4gICAgfSk7XHJcbiAgICBlbC5hcHBlbmQoYnRuc19ib3gpO1xyXG5cclxuICAgIGVsLmFwcGVuZCgnPGgyPtCe0LHRidC40LUg0L/QsNGA0LDQvNC10YLRgNGLPC9oMj4nKTtcclxuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5tb2JpbGUsXHJcbiAgICAgIGxhYmVsOiBcItCh0LvQsNC50LQg0LTQu9GPINGC0LXQu9C10YTQvtC90LBcIixcclxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSAkKHRoaXMpLnZhbCgpXHJcbiAgICAgICAgJCgnLm1vYl9iZycpLmVxKDApLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSArICcpJyk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcblxyXG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmZvbixcclxuICAgICAgbGFiZWw6IFwi0J7RgdC90L7QvdC+0Lkg0YTQvtC9XCIsXHJcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uZm9uID0gJCh0aGlzKS52YWwoKVxyXG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBzbGlkZXJfZGF0YVswXS5mb24gKyAnKScpXHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGJ0bl9jaCA9ICQoJzxkaXYgY2xhc3M9XCJidG5zXCIvPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZCgnPGgzPtCa0L3QvtC/0LrQsCDQv9C10YDQtdGF0L7QtNCwKNC00LvRjyDQn9CaINCy0LXRgNGB0LjQuCk8L2gzPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCxcclxuICAgICAgbGFiZWw6IFwi0KLQtdC60YHRglwiLFxyXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCkudGV4dChzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9LFxyXG4gICAgfSkpO1xyXG5cclxuICAgIHZhciBidXRfc2wgPSAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApO1xyXG4gICAgYnRuX2NoLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5idXR0b24uaHJlZixcclxuICAgICAgbGFiZWw6IFwi0KHRgdGL0LvQutCwXCIsXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5idXR0b24uaHJlZiA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS5hdHRyKCdocmVmJyxzbGlkZXJfZGF0YVswXS5idXR0b24uaHJlZik7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9LFxyXG4gICAgfSkpO1xyXG5cclxuICAgIGJ0bl9jaC5hcHBlbmQoJzxici8+Jyk7XHJcbiAgICB2YXIgd3JhcF9sYWIgPSAkKCc8bGFiZWwvPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZCh3cmFwX2xhYik7XHJcbiAgICB3cmFwX2xhYi5hcHBlbmQoJzxzcGFuPtCe0YTQvtGA0LzQu9C10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcclxuICAgIHdyYXBfbGFiLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBidG5fc3R5bGUsXHJcbiAgICAgIHZhbF90eXBlOiAwLFxyXG4gICAgICBvYmo6IGJ1dF9zbCxcclxuICAgICAgZ3I6ICdidXR0b24nLFxyXG4gICAgICBpbmRleDogZmFsc2UsXHJcbiAgICAgIHBhcmFtOiAnY29sb3InXHJcbiAgICB9KSk7XHJcblxyXG4gICAgYnRuX2NoLmFwcGVuZCgnPGJyLz4nKTtcclxuICAgIHdyYXBfbGFiID0gJCgnPGxhYmVsLz4nKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQod3JhcF9sYWIpO1xyXG4gICAgd3JhcF9sYWIuYXBwZW5kKCc8c3Bhbj7Qn9C+0LvQvtC20LXQvdC40LUg0LrQvdC+0L/QutC4PC9zcGFuPicpO1xyXG4gICAgd3JhcF9sYWIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHBvc0FycixcclxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxyXG4gICAgICB2YWxfdHlwZTogMixcclxuICAgICAgb2JqOiBidXRfc2wucGFyZW50KCkucGFyZW50KCksXHJcbiAgICAgIGdyOiAnYnV0dG9uJyxcclxuICAgICAgaW5kZXg6IGZhbHNlLFxyXG4gICAgICBwYXJhbTogJ3BvcydcclxuICAgIH0pKTtcclxuXHJcbiAgICBidG5fY2guYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgb2JqOiBidXRfc2wucGFyZW50KCksXHJcbiAgICAgIGdyOiAnYnV0dG9uJyxcclxuICAgICAgaW5kZXg6IGZhbHNlXHJcbiAgICB9KSk7XHJcbiAgICBlbC5hcHBlbmQoYnRuX2NoKTtcclxuXHJcbiAgICB2YXIgbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwiZml4ZWRfbGF5ZXJcIi8+Jyk7XHJcbiAgICBsYXllci5hcHBlbmQoJzxoMj7QodGC0LDRgtC40YfQtdGB0LrQuNC1INGB0LvQvtC4PC9oMj4nKTtcclxuICAgIHZhciB0aCA9IFwiPHRoPuKEljwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QodC70L7QuSDQvdCwINCy0YHRjiDQstGL0YHQvtGC0YM8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XHJcbiAgICBzdFRhYmxlID0gJCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+JyArIHRoICsgJzwvdHI+PC90YWJsZT4nKTtcclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbMF0uZml4ZWQ7XHJcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYWRkVHJTdGF0aWMoZGF0YVtpXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGxheWVyLmFwcGVuZChzdFRhYmxlKTtcclxuICAgIHZhciBhZGRCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XHJcbiAgICAgIHRleHQ6IFwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXHJcbiAgICB9KTtcclxuICAgIGFkZEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGRhdGEgPSBhZGRUclN0YXRpYyhmYWxzZSk7XHJcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xyXG4gICAgZWwuYXBwZW5kKGxheWVyKTtcclxuXHJcbiAgICB2YXIgbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxheF9sYXllclwiLz4nKTtcclxuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCf0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lg8L2gyPicpO1xyXG4gICAgdmFyIHRoID0gXCI8dGg+4oSWPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCj0LTQsNC70LXQvdC90L7RgdGC0YwgKNGG0LXQu9C+0LUg0L/QvtC70L7QttC40YLQtdC70YzQvdC+0LUg0YfQuNGB0LvQvik8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XHJcblxyXG4gICAgcGFyYWxheFRhYmxlID0gJCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+JyArIHRoICsgJzwvdHI+PC90YWJsZT4nKTtcclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbMF0ucGFyYWxheDtcclxuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhZGRUclBhcmFsYXgoZGF0YVtpXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGxheWVyLmFwcGVuZChwYXJhbGF4VGFibGUpO1xyXG4gICAgdmFyIGFkZEJ0biA9ICQoJzxidXR0b24vPicsIHtcclxuICAgICAgdGV4dDogXCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcclxuICAgIH0pO1xyXG4gICAgYWRkQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZGF0YSA9IGFkZFRyUGFyYWxheChmYWxzZSk7XHJcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuXHJcbiAgICBsYXllci5hcHBlbmQoYWRkQnRuKTtcclxuICAgIGVsLmFwcGVuZChsYXllcik7XHJcblxyXG4gICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGVsLmZpbmQoJy5maWxlU2VsZWN0JykpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkVHJTdGF0aWMoZGF0YSkge1xyXG4gICAgdmFyIGkgPSBzdFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoIC0gMTtcclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICBkYXRhID0ge1xyXG4gICAgICAgIFwiaW1nXCI6IFwiXCIsXHJcbiAgICAgICAgXCJmdWxsX2hlaWdodFwiOiAwLFxyXG4gICAgICAgIFwicG9zXCI6IDAsXHJcbiAgICAgICAgXCJzaG93X2RlbGF5XCI6IDEsXHJcbiAgICAgICAgXCJzaG93X2FuaW1hdGlvblwiOiBcImxpZ2h0U3BlZWRJblwiLFxyXG4gICAgICAgIFwiaGlkZV9kZWxheVwiOiAxLFxyXG4gICAgICAgIFwiaGlkZV9hbmltYXRpb25cIjogXCJib3VuY2VPdXRcIlxyXG4gICAgICB9O1xyXG4gICAgICBzbGlkZXJfZGF0YVswXS5maXhlZC5wdXNoKGRhdGEpO1xyXG4gICAgICB2YXIgZml4ID0gJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCcpO1xyXG4gICAgICBhZGRTdGF0aWNMYXllcihkYXRhLCBmaXgsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgO1xyXG5cclxuICAgIHZhciB0ciA9ICQoJzx0ci8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogZGF0YS5pbWcsXHJcbiAgICAgIGxhYmVsOiBmYWxzZSxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcclxuICAgICAgYmluZDoge1xyXG4gICAgICAgIGdyOiAnZml4ZWQnLFxyXG4gICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcclxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcclxuICAgICAgfSxcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmlucHV0LnZhbCgpICsgJyknKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5maXhlZFtkYXRhLmluZGV4XS5pbWcgPSBkYXRhLmlucHV0LnZhbCgpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHBvc0FycixcclxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxyXG4gICAgICB2YWxfdHlwZTogMixcclxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKSxcclxuICAgICAgZ3I6ICdmaXhlZCcsXHJcbiAgICAgIGluZGV4OiBpLFxyXG4gICAgICBwYXJhbTogJ3BvcycsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiB5ZXNfbm9fdmFsLFxyXG4gICAgICB2YWxfbGlzdDogeWVzX25vX2FycixcclxuICAgICAgdmFsX3R5cGU6IDIsXHJcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXHJcbiAgICAgIGdyOiAnZml4ZWQnLFxyXG4gICAgICBpbmRleDogaSxcclxuICAgICAgcGFyYW06ICdmdWxsX2hlaWdodCcsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XHJcbiAgICAgIHR5cGU6IDEsXHJcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxyXG4gICAgICBncjogJ2ZpeGVkJyxcclxuICAgICAgaW5kZXg6IGksXHJcbiAgICAgIHBhcmVudDogJ3RkJ1xyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0biA9ICQoJzxidXR0b24vPicsIHtcclxuICAgICAgdGV4dDogXCLQo9C00LDQu9C40YLRjFwiXHJcbiAgICB9KTtcclxuICAgIGRlbEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcy5lbCk7XHJcbiAgICAgIGkgPSAkdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCkgLSAxO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcclxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcclxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5maXhlZC5zcGxpY2UoaSwgMSk7IC8v0YPQtNCw0LvRj9C10Lwg0LjQtyDQutC+0L3RhNC40LPQsCDRgdC70LDQudC00LBcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBlbDogZGVsQnRuLFxyXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuICAgIHZhciBkZWxCdG5UZCA9ICQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XHJcbiAgICB0ci5hcHBlbmQoZGVsQnRuVGQpO1xyXG4gICAgc3RUYWJsZS5hcHBlbmQodHIpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZWRpdG9yOiB0cixcclxuICAgICAgZGF0YTogZGF0YVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkVHJQYXJhbGF4KGRhdGEpIHtcclxuICAgIHZhciBpID0gcGFyYWxheFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoIC0gMTtcclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICBkYXRhID0ge1xyXG4gICAgICAgIFwiaW1nXCI6IFwiXCIsXHJcbiAgICAgICAgXCJ6XCI6IDFcclxuICAgICAgfTtcclxuICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheC5wdXNoKGRhdGEpO1xyXG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwJyk7XHJcbiAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKTtcclxuICAgIH1cclxuICAgIDtcclxuICAgIHZhciB0ciA9ICQoJzx0ci8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogZGF0YS5pbWcsXHJcbiAgICAgIGxhYmVsOiBmYWxzZSxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcclxuICAgICAgYmluZDoge1xyXG4gICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcclxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXHJcbiAgICAgIH0sXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbnB1dC52YWwoKSArICcpJyk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS5pbWcgPSBkYXRhLmlucHV0LnZhbCgpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHBvc0FycixcclxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxyXG4gICAgICB2YWxfdHlwZTogMixcclxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxyXG4gICAgICBncjogJ3BhcmFsYXgnLFxyXG4gICAgICBpbmRleDogaSxcclxuICAgICAgcGFyYW06ICdwb3MnLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICAgIHN0YXJ0X29wdGlvbjogJzxvcHRpb24gdmFsdWU9XCJcIiBjb2RlPVwiXCI+0L3QsCDQstC10YHRjCDRjdC60YDQsNC9PC9vcHRpb24+J1xyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IGRhdGEueixcclxuICAgICAgbGFiZWw6IGZhbHNlLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICAgIGJpbmQ6IHtcclxuICAgICAgICBpbmRleDogaSxcclxuICAgICAgICBwYXJhbTogJ2ltZycsXHJcbiAgICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSksXHJcbiAgICAgIH0sXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICAgICAgZGF0YS5vYmouYXR0cigneicsIGRhdGEuaW5wdXQudmFsKCkpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0ueiA9IGRhdGEuaW5wdXQudmFsKCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGRlbEJ0biA9ICQoJzxidXR0b24vPicsIHtcclxuICAgICAgdGV4dDogXCLQo9C00LDQu9C40YLRjFwiXHJcbiAgICB9KTtcclxuICAgIGRlbEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcy5lbCk7XHJcbiAgICAgIGkgPSAkdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCkgLSAxO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcclxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcclxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5wYXJhbGF4LnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOiBkZWxCdG4sXHJcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0blRkID0gJCgnPHRkLz4nKS5hcHBlbmQoZGVsQnRuKTtcclxuICAgIHRyLmFwcGVuZChkZWxCdG5UZCk7XHJcbiAgICBwYXJhbGF4VGFibGUuYXBwZW5kKHRyKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVkaXRvcjogdHIsXHJcbiAgICAgIGRhdGE6IGRhdGFcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZF9hbmltYXRpb24oZWwsIGRhdGEpIHtcclxuICAgIHZhciBvdXQgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICdjbGFzcyc6ICdhbmltYXRpb25fbGF5ZXInXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAodHlwZW9mKGRhdGEuc2hvd19kZWxheSkgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgb3V0LmFkZENsYXNzKHNob3dfZGVsYXlbZGF0YS5zaG93X2RlbGF5XSk7XHJcbiAgICAgIGlmIChkYXRhLnNob3dfYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nICsgZGF0YS5zaG93X2FuaW1hdGlvbik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mKGRhdGEuaGlkZV9kZWxheSkgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgb3V0LmFkZENsYXNzKGhpZGVfZGVsYXlbZGF0YS5oaWRlX2RlbGF5XSk7XHJcbiAgICAgIGlmIChkYXRhLmhpZGVfYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nICsgZGF0YS5oaWRlX2FuaW1hdGlvbik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBlbC5hcHBlbmQob3V0KTtcclxuICAgIHJldHVybiBlbDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlX3NsaWRlKGRhdGEpIHtcclxuICAgIHZhciBzbGlkZSA9ICQoJzxkaXYgY2xhc3M9XCJzbGlkZVwiLz4nKTtcclxuXHJcbiAgICB2YXIgbW9iX2JnID0gJCgnPGEgY2xhc3M9XCJtb2JfYmdcIiBocmVmPVwiJyArIGRhdGEuYnV0dG9uLmhyZWYgKyAnXCIvPicpO1xyXG4gICAgbW9iX2JnLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEubW9iaWxlICsgJyknKVxyXG5cclxuICAgIHNsaWRlLmFwcGVuZChtb2JfYmcpO1xyXG4gICAgaWYgKG1vYmlsZV9tb2RlKSB7XHJcbiAgICAgIHJldHVybiBzbGlkZTtcclxuICAgIH1cclxuXHJcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINGE0L7QvSDRgtC+INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgaWYgKGRhdGEuZm9uKSB7XHJcbiAgICAgIHNsaWRlLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuZm9uICsgJyknKVxyXG4gICAgfVxyXG5cclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIGlmIChkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIHBhcmFsYXhfZ3IgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2dyb3VwXCIvPicpO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGFyYWxheC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLnBhcmFsYXhbaV0sIHBhcmFsYXhfZ3IpXHJcbiAgICAgIH1cclxuICAgICAgc2xpZGUuYXBwZW5kKHBhcmFsYXhfZ3IpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGZpeCA9ICQoJzxkaXYgY2xhc3M9XCJmaXhlZF9ncm91cFwiLz4nKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICBhZGRTdGF0aWNMYXllcihkYXRhLmZpeGVkW2ldLCBmaXgpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRvcF9ibGsgPSAkKFwiPGRpdiBjbGFzcz0nZml4ZWRfX2xheWVyJy8+XCIpO1xyXG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5idXR0b24ucG9zXSk7XHJcbiAgICB2YXIgYnV0ID0gJChcIjxhIGNsYXNzPSdzbGlkZXJfX2hyZWYnLz5cIik7XHJcbiAgICBidXQuYXR0cignaHJlZicsIGRhdGEuYnV0dG9uLmhyZWYpO1xyXG4gICAgYnV0LnRleHQoZGF0YS5idXR0b24udGV4dCk7XHJcbiAgICBidXQuYWRkQ2xhc3MoZGF0YS5idXR0b24uY29sb3IpO1xyXG4gICAgZG9wX2JsayA9IGFkZF9hbmltYXRpb24oZG9wX2JsaywgZGF0YS5idXR0b24pO1xyXG4gICAgZG9wX2Jsay5maW5kKCdkaXYnKS5hcHBlbmQoYnV0KTtcclxuICAgIGZpeC5hcHBlbmQoZG9wX2Jsayk7XHJcblxyXG4gICAgc2xpZGUuYXBwZW5kKGZpeCk7XHJcbiAgICByZXR1cm4gc2xpZGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRQYXJhbGF4TGF5ZXIoZGF0YSwgcGFyYWxheF9ncikge1xyXG4gICAgdmFyIHBhcmFsbGF4X2xheWVyID0gJCgnPGRpdiBjbGFzcz1cInBhcmFsbGF4X19sYXllclwiXFw+Jyk7XHJcbiAgICBwYXJhbGxheF9sYXllci5hdHRyKCd6JywgZGF0YS56IHx8IGkgKiAxMCk7XHJcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8c3BhbiBjbGFzcz0nc2xpZGVyX190ZXh0Jy8+XCIpO1xyXG4gICAgaWYgKGRhdGEucG9zKSB7XHJcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XHJcbiAgICB9XHJcbiAgICBkb3BfYmxrLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcclxuICAgIHBhcmFsbGF4X2xheWVyLmFwcGVuZChkb3BfYmxrKTtcclxuICAgIHBhcmFsYXhfZ3IuYXBwZW5kKHBhcmFsbGF4X2xheWVyKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCwgYmVmb3JfYnV0dG9uKSB7XHJcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XHJcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLnBvc10pO1xyXG4gICAgaWYgKGRhdGEuZnVsbF9oZWlnaHQpIHtcclxuICAgICAgZG9wX2Jsay5hZGRDbGFzcygnZml4ZWRfX2Z1bGwtaGVpZ2h0Jyk7XHJcbiAgICB9XHJcbiAgICBkb3BfYmxrID0gYWRkX2FuaW1hdGlvbihkb3BfYmxrLCBkYXRhKTtcclxuICAgIGRvcF9ibGsuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcclxuXHJcbiAgICBpZiAoYmVmb3JfYnV0dG9uKSB7XHJcbiAgICAgIGZpeC5maW5kKCcuc2xpZGVyX19ocmVmJykuY2xvc2VzdCgnLmZpeGVkX19sYXllcicpLmJlZm9yZShkb3BfYmxrKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZml4LmFwcGVuZChkb3BfYmxrKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcclxuICAgIGlmICgkKCcjbWVnYV9zbGlkZXInKS5oYXNDbGFzcygnc3RvcF9zbGlkZScpKXJldHVybjtcclxuXHJcbiAgICB2YXIgc2xpZGVfcG9pbnRzID0gJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlX3NlbGVjdCcpXHJcbiAgICB2YXIgc2xpZGVfY250ID0gc2xpZGVfcG9pbnRzLmxlbmd0aDtcclxuICAgIHZhciBhY3RpdmUgPSAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVyLWFjdGl2ZScpLmluZGV4KCkgKyAxO1xyXG4gICAgaWYgKGFjdGl2ZSA+PSBzbGlkZV9jbnQpYWN0aXZlID0gMDtcclxuICAgIHNsaWRlX3BvaW50cy5lcShhY3RpdmUpLmNsaWNrKCk7XHJcblxyXG4gICAgdGltZW91dElkPXNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbWdfdG9fbG9hZChzcmMpIHtcclxuICAgIHZhciBpbWcgPSAkKCc8aW1nLz4nKTtcclxuICAgIGltZy5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgdG90X2ltZ193YWl0LS07XHJcblxyXG4gICAgICBpZiAodG90X2ltZ193YWl0ID09IDApIHtcclxuXHJcbiAgICAgICAgc2xpZGVzLmFwcGVuZChnZW5lcmF0ZV9zbGlkZShzbGlkZXJfZGF0YVtyZW5kZXJfc2xpZGVfbm9tXSkpO1xyXG4gICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcShyZW5kZXJfc2xpZGVfbm9tKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuXHJcbiAgICAgICAgaWYgKHJlbmRlcl9zbGlkZV9ub20gPT0gMCkge1xyXG4gICAgICAgICAgc2xpZGVzLmZpbmQoJy5zbGlkZScpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgaWYgKCFlZGl0b3IpIHtcclxuICAgICAgICAgICAgaWYodGltZW91dElkKWNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xyXG4gICAgICAgICAgICB0aW1lb3V0SWQ9c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuZmlyc3Rfc2hvdycpLnJlbW92ZUNsYXNzKCdmaXJzdF9zaG93Jyk7XHJcbiAgICAgICAgICAgIH0uYmluZChzbGlkZXMpLCBzY3JvbGxfcGVyaW9kKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAobW9iaWxlX21vZGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHBhcmFsbGF4X2dyb3VwID0gJChjb250YWluZXJfaWQgKyAnIC5zbGlkZXItYWN0aXZlIC5wYXJhbGxheF9fZ3JvdXA+KicpO1xyXG4gICAgICAgICAgICBwYXJhbGxheF9jb3VudGVyID0gMDtcclxuICAgICAgICAgICAgcGFyYWxsYXhfdGltZXIgPSBzZXRJbnRlcnZhbChyZW5kZXIsIDEwMCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGVkaXRvcikge1xyXG4gICAgICAgICAgICBpbml0X2VkaXRvcigpXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZih0aW1lb3V0SWQpY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XHJcblxyXG4gICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCcpLm9uKCdjbGljaycsICcuc2xpZGVfc2VsZWN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdzbGlkZXItYWN0aXZlJykpcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkdGhpcy5pbmRleCgpO1xyXG4gICAgICAgICAgICAgICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGUnKS5lcShpbmRleCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuaG92ZXIoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIGlmKHRpbWVvdXRJZCljbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5hZGRDbGFzcygnc3RvcF9zbGlkZScpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcclxuICAgICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5yZW1vdmVDbGFzcygnc3RvcF9zbGlkZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlbmRlcl9zbGlkZV9ub20rKztcclxuICAgICAgICBpZiAocmVuZGVyX3NsaWRlX25vbSA8IHNsaWRlcl9kYXRhLmxlbmd0aCkge1xyXG4gICAgICAgICAgbG9hZF9zbGlkZV9pbWcoKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSkub24oJ2Vycm9yJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB0b3RfaW1nX3dhaXQtLTtcclxuICAgIH0pO1xyXG4gICAgaW1nLnByb3AoJ3NyYycsIHNyYyk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBsb2FkX3NsaWRlX2ltZygpIHtcclxuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbcmVuZGVyX3NsaWRlX25vbV07XHJcbiAgICB0b3RfaW1nX3dhaXQgPSAxO1xyXG5cclxuICAgIGlmIChtb2JpbGVfbW9kZSA9PT0gZmFsc2UpIHtcclxuICAgICAgdG90X2ltZ193YWl0Kys7XHJcbiAgICAgIGltZ190b19sb2FkKGRhdGEuZm9uKTtcclxuICAgICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgICBpZiAoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEucGFyYWxheC5sZW5ndGg7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnBhcmFsYXgubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEucGFyYWxheFtpXS5pbWcpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChkYXRhLmZpeGVkICYmIGRhdGEuZml4ZWQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRvdF9pbWdfd2FpdCArPSBkYXRhLmZpeGVkLmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuZml4ZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEuZml4ZWRbaV0uaW1nKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGltZ190b19sb2FkKGRhdGEubW9iaWxlKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN0YXJ0X2luaXRfc2xpZGUoZGF0YSkge1xyXG4gICAgdmFyIG4gPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIHZhciBpbWcgPSAkKCc8aW1nLz4nKTtcclxuICAgIGltZy5hdHRyKCd0aW1lJywgbik7XHJcblxyXG4gICAgZnVuY3Rpb24gb25faW1nX2xvYWQoKSB7XHJcbiAgICAgIHZhciBuID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgIGltZyA9ICQodGhpcyk7XHJcbiAgICAgIG4gPSBuIC0gcGFyc2VJbnQoaW1nLmF0dHIoJ3RpbWUnKSk7XHJcbiAgICAgIGlmIChuID4gbWF4X3RpbWVfbG9hZF9waWMpIHtcclxuICAgICAgICBtb2JpbGVfbW9kZSA9IHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIG1heF9zaXplID0gKHNjcmVlbi5oZWlnaHQgPiBzY3JlZW4ud2lkdGggPyBzY3JlZW4uaGVpZ2h0IDogc2NyZWVuLndpZHRoKTtcclxuICAgICAgICBpZiAobWF4X3NpemUgPCBtb2JpbGVfc2l6ZSkge1xyXG4gICAgICAgICAgbW9iaWxlX21vZGUgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtb2JpbGVfbW9kZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAobW9iaWxlX21vZGUgPT0gdHJ1ZSkge1xyXG4gICAgICAgICQoY29udGFpbmVyX2lkKS5hZGRDbGFzcygnbW9iaWxlX21vZGUnKVxyXG4gICAgICB9XHJcbiAgICAgIHJlbmRlcl9zbGlkZV9ub20gPSAwO1xyXG4gICAgICBsb2FkX3NsaWRlX2ltZygpO1xyXG4gICAgICAkKCcuc2stZm9sZGluZy1jdWJlJykucmVtb3ZlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGltZy5vbignbG9hZCcsIG9uX2ltZ19sb2FkKCkpO1xyXG4gICAgaWYgKHNsaWRlcl9kYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gc2xpZGVyX2RhdGFbMF0ubW9iaWxlICsgJz9yPScgKyBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICBpbWcucHJvcCgnc3JjJywgc2xpZGVyX2RhdGFbMF0ubW9iaWxlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG9uX2ltZ19sb2FkKCkuYmluZChpbWcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdChkYXRhLCBlZGl0b3JfaW5pdCkge1xyXG4gICAgc2xpZGVyX2RhdGEgPSBkYXRhO1xyXG4gICAgZWRpdG9yID0gZWRpdG9yX2luaXQ7XHJcbiAgICAvL9C90LDRhdC+0LTQuNC8INC60L7QvdGC0LXQudC90LXRgCDQuCDQvtGH0LjRidCw0LXQvCDQtdCz0L5cclxuICAgIHZhciBjb250YWluZXIgPSAkKGNvbnRhaW5lcl9pZCk7XHJcbiAgICBjb250YWluZXIuaHRtbCgnJyk7XHJcblxyXG4gICAgLy/RgdC+0LfQttCw0LXQvCDQsdCw0LfQvtCy0YvQtSDQutC+0L3RgtC10LnQvdC10YDRiyDQtNC70Y8g0YHQsNC80LjRhSDRgdC70LDQudC00L7QsiDQuCDQtNC70Y8g0L/QtdGA0LXQutC70Y7Rh9Cw0YLQtdC70LXQuVxyXG4gICAgc2xpZGVzID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAnY2xhc3MnOiAnc2xpZGVzJ1xyXG4gICAgfSk7XHJcbiAgICB2YXIgc2xpZGVfY29udHJvbCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgJ2NsYXNzJzogJ3NsaWRlX2NvbnRyb2wnXHJcbiAgICB9KTtcclxuICAgIHNsaWRlX3NlbGVjdF9ib3ggPSAkKCc8dWwvPicsIHtcclxuICAgICAgJ2NsYXNzJzogJ3NsaWRlX3NlbGVjdF9ib3gnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQuNC90LTQuNC60LDRgtC+0YAg0LfQsNCz0YDRg9C30LrQuFxyXG4gICAgdmFyIGwgPSAnPGRpdiBjbGFzcz1cInNrLWZvbGRpbmctY3ViZVwiPicgK1xyXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUxIHNrLWN1YmVcIj48L2Rpdj4nICtcclxuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMiBzay1jdWJlXCI+PC9kaXY+JyArXHJcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTQgc2stY3ViZVwiPjwvZGl2PicgK1xyXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUzIHNrLWN1YmVcIj48L2Rpdj4nICtcclxuICAgICAgJzwvZGl2Pic7XHJcbiAgICBjb250YWluZXIuaHRtbChsKTtcclxuXHJcblxyXG4gICAgc3RhcnRfaW5pdF9zbGlkZShkYXRhWzBdKTtcclxuXHJcbiAgICAvL9Cz0LXQvdC10YDQuNGA0YPQtdC8INC60L3QvtC/0LrQuCDQuCDRgdC70LDQudC00YtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAvL3NsaWRlcy5hcHBlbmQoZ2VuZXJhdGVfc2xpZGUoZGF0YVtpXSkpO1xyXG4gICAgICBzbGlkZV9zZWxlY3RfYm94LmFwcGVuZCgnPGxpIGNsYXNzPVwic2xpZGVfc2VsZWN0IGRpc2FibGVkXCIvPicpXHJcbiAgICB9XHJcblxyXG4gICAgLypzbGlkZXMuZmluZCgnLnNsaWRlJykuZXEoMClcclxuICAgICAuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKVxyXG4gICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpO1xyXG4gICAgIHNsaWRlX2NvbnRyb2wuZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpOyovXHJcblxyXG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZXMpO1xyXG4gICAgc2xpZGVfY29udHJvbC5hcHBlbmQoc2xpZGVfc2VsZWN0X2JveCk7XHJcbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlX2NvbnRyb2wpO1xyXG5cclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICBpZiAoIXBhcmFsbGF4X2dyb3VwKXJldHVybiBmYWxzZTtcclxuICAgIHZhciBwYXJhbGxheF9rID0gKHBhcmFsbGF4X2NvdW50ZXIgLSAxMCkgLyAyO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYWxsYXhfZ3JvdXAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gcGFyYWxsYXhfZ3JvdXAuZXEoaSk7XHJcbiAgICAgIHZhciBqID0gZWwuYXR0cigneicpO1xyXG4gICAgICB2YXIgdHIgPSAncm90YXRlM2QoMC4xLDAuOCwwLCcgKyAocGFyYWxsYXhfaykgKyAnZGVnKSBzY2FsZSgnICsgKDEgKyBqICogMC41KSArICcpIHRyYW5zbGF0ZVooLScgKyAoMTAgKyBqICogMjApICsgJ3B4KSc7XHJcbiAgICAgIGVsLmNzcygndHJhbnNmb3JtJywgdHIpXHJcbiAgICB9XHJcbiAgICBwYXJhbGxheF9jb3VudGVyICs9IHBhcmFsbGF4X2QgKiAwLjE7XHJcbiAgICBpZiAocGFyYWxsYXhfY291bnRlciA+PSAyMClwYXJhbGxheF9kID0gLXBhcmFsbGF4X2Q7XHJcbiAgICBpZiAocGFyYWxsYXhfY291bnRlciA8PSAwKXBhcmFsbGF4X2QgPSAtcGFyYWxsYXhfZDtcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBpbml0OiBpbml0XHJcbiAgfTtcclxufSgpKTtcclxuIiwidmFyIGhlYWRlckFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG4gIHZhciBzaGFkb3dlZERvd24gPSBmYWxzZTtcclxuXHJcbiAgJCgnLm1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgICQoJy5kcm9wLW1lbnUnKS5yZW1vdmVDbGFzcygnb3BlbicpLnJlbW92ZUNsYXNzKCdjbG9zZScpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKSkge1xyXG4gICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnLnNlYXJjaC10b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xyXG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XHJcbiAgICAkKCcjYXV0b2NvbXBsZXRlJykuZmFkZU91dCgpO1xyXG4gICAgaWYgKCQoJy5oZWFkZXInKS5oYXNDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJykpIHtcclxuICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJyNoZWFkZXInKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKGUudGFyZ2V0LmlkID09ICdoZWFkZXInKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XHJcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQodGhpcykuY2xvc2VzdCgnZm9ybScpLnN1Ym1pdCgpO1xyXG4gIH0pO1xyXG5cclxuICAkKCcuaGVhZGVyLXNlY29uZGxpbmVfY2xvc2UnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmhlYWRlci11cGxpbmUnKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICghc2Nyb2xsZWREb3duKXJldHVybjtcclxuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDEwMjQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgc2Nyb2xsZWREb3duID0gZmFsc2U7XHJcbiAgfSk7XHJcblxyXG4gICQod2luZG93KS5vbignbG9hZCByZXNpemUgc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHNoYWRvd0hlaWdodCA9IDUwO1xyXG4gICAgdmFyIGhpZGVIZWlnaHQgPSAyMDA7XHJcbiAgICB2YXIgaGVhZGVyU2Vjb25kTGluZSA9ICQoJy5oZWFkZXItc2Vjb25kbGluZScpO1xyXG4gICAgdmFyIGhvdmVycyA9IGhlYWRlclNlY29uZExpbmUuZmluZCgnOmhvdmVyJyk7XHJcbiAgICB2YXIgaGVhZGVyID0gJCgnLmhlYWRlcicpO1xyXG5cclxuICAgIGlmICghaG92ZXJzLmxlbmd0aCkge1xyXG4gICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzY3JvbGxhYmxlJyk7XHJcbiAgICAgIGhlYWRlci5yZW1vdmVDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgICAvL2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3BcclxuICAgICAgdmFyIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuICAgICAgaWYgKHNjcm9sbFRvcCA+IHNoYWRvd0hlaWdodCAmJiBzaGFkb3dlZERvd24gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgc2hhZG93ZWREb3duID0gdHJ1ZTtcclxuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzaGFkb3dlZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzY3JvbGxUb3AgPD0gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHNoYWRvd2VkRG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3NoYWRvd2VkJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNjcm9sbFRvcCA+IGhpZGVIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSBmYWxzZSkge1xyXG4gICAgICAgIHNjcm9sbGVkRG93biA9IHRydWU7XHJcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoc2Nyb2xsVG9wIDw9IGhpZGVIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSB0cnVlKSB7XHJcbiAgICAgICAgc2Nyb2xsZWREb3duID0gZmFsc2U7XHJcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgICBoZWFkZXIuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnLm1lbnVfYW5nbGUtZG93biwgLmRyb3AtbWVudV9ncm91cF9fdXAtaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBtZW51T3BlbiA9ICQodGhpcykuY2xvc2VzdCgnLmhlYWRlcl9vcGVuLW1lbnUsIC5jYXRhbG9nLWNhdGVnb3JpZXMnKTtcclxuICAgIGlmICghbWVudU9wZW4ubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIHBhcmVudCA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudV9ncm91cF9fdXAsIC5tZW51LWdyb3VwJyk7XHJcbiAgICB2YXIgcGFyZW50TWVudSA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudScpO1xyXG4gICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICB9XHJcbiAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAkKHBhcmVudCkudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgaWYgKHBhcmVudC5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAgICAgJChwYXJlbnQpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICBpZiAocGFyZW50TWVudSkge1xyXG4gICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICBpZiAocGFyZW50TWVudSkge1xyXG4gICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG5cclxuICB2YXIgYWNjb3VudE1lbnVUaW1lT3V0ID0gbnVsbDtcclxuICB2YXIgYWNjb3VudE1lbnVPcGVuVGltZSA9IDA7XHJcbiAgdmFyIGFjY291bnRNZW51ID0gJCgnLmFjY291bnQtbWVudScpO1xyXG5cclxuICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPiAxMDI0KSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgdmFyIHRoYXQgPSAkKHRoaXMpO1xyXG5cclxuICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcclxuXHJcbiAgICBpZiAoYWNjb3VudE1lbnUuaGFzQ2xhc3MoJ2hpZGRlbicpKSB7XHJcbiAgICAgIG1lbnVBY2NvdW50VXAodGhhdCk7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhhdC5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICBhY2NvdW50TWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8v0L/QvtC60LDQtyDQvNC10L3RjiDQsNC60LrQsNGD0L3RglxyXG4gIGZ1bmN0aW9uIG1lbnVBY2NvdW50VXAodG9nZ2xlQnV0dG9uKSB7XHJcbiAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XHJcbiAgICB0b2dnbGVCdXR0b24uYWRkQ2xhc3MoJ29wZW4nKTtcclxuICAgIGFjY291bnRNZW51LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSAxMDI0KSB7XHJcbiAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgIH1cclxuXHJcbiAgICBhY2NvdW50TWVudU9wZW5UaW1lID0gbmV3IERhdGUoKTtcclxuICAgIGFjY291bnRNZW51VGltZU91dCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSAxMDI0KSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICgobmV3IERhdGUoKSAtIGFjY291bnRNZW51T3BlblRpbWUpID4gMTAwMCAqIDcpIHtcclxuICAgICAgICBhY2NvdW50TWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgdG9nZ2xlQnV0dG9uLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xyXG4gICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sIDEwMDApO1xyXG4gIH1cclxuXHJcbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllcy1hY2NvdW50X21lbnUtaGVhZGVyJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgIGFjY291bnRNZW51T3BlblRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gIH0pO1xyXG4gICQoJy5hY2NvdW50LW1lbnUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCdhY2NvdW50LW1lbnUnKSkge1xyXG4gICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgIH1cclxuICB9KTtcclxufSgpO1xyXG4iLCIkKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBwYXJzZU51bShzdHIpIHtcclxuICAgIHJldHVybiBwYXJzZUZsb2F0KFxyXG4gICAgICBTdHJpbmcoc3RyKVxyXG4gICAgICAgIC5yZXBsYWNlKCcsJywgJy4nKVxyXG4gICAgICAgIC5tYXRjaCgvLT9cXGQrKD86XFwuXFxkKyk/L2csICcnKSB8fCAwXHJcbiAgICAgICwgMTBcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAkKCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpLmZpbmQoJ3NlbGVjdCxpbnB1dCcpLm9uKCdjaGFuZ2Uga2V5dXAgY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLmNsb3Nlc3QoJy5zaG9ydC1jYWxjLWNhc2hiYWNrJyk7XHJcbiAgICB2YXIgY3VycyA9IHBhcnNlTnVtKCR0aGlzLmZpbmQoJ3NlbGVjdCcpLnZhbCgpKTtcclxuICAgIHZhciB2YWwgPSAkdGhpcy5maW5kKCdpbnB1dCcpLnZhbCgpO1xyXG4gICAgaWYgKHBhcnNlTnVtKHZhbCkgIT0gdmFsKSB7XHJcbiAgICAgIHZhbCA9ICR0aGlzLmZpbmQoJ2lucHV0JykudmFsKHBhcnNlTnVtKHZhbCkpO1xyXG4gICAgfVxyXG4gICAgdmFsID0gcGFyc2VOdW0odmFsKTtcclxuXHJcbiAgICB2YXIga29lZiA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjaycpLnRyaW0oKTtcclxuICAgIHZhciBwcm9tbyA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1wcm9tbycpLnRyaW0oKTtcclxuICAgIHZhciBjdXJyZW5jeSA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1jdXJyZW5jeScpLnRyaW0oKTtcclxuICAgIHZhciByZXN1bHQgPSAwO1xyXG4gICAgdmFyIG91dCA9IDA7XHJcblxyXG4gICAgaWYgKGtvZWYgPT0gcHJvbW8pIHtcclxuICAgICAgcHJvbW8gPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChrb2VmLmluZGV4T2YoJyUnKSA+IDApIHtcclxuICAgICAgcmVzdWx0ID0gcGFyc2VOdW0oa29lZikgKiB2YWwgKiBjdXJzIC8gMTAwO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY3VycyA9IHBhcnNlTnVtKCR0aGlzLmZpbmQoJ1tjb2RlPScgKyBjdXJyZW5jeSArICddJykudmFsKCkpO1xyXG4gICAgICByZXN1bHQgPSBwYXJzZU51bShrb2VmKSAqIGN1cnNcclxuICAgIH1cclxuXHJcbiAgICBpZiAocGFyc2VOdW0ocHJvbW8pID4gMCkge1xyXG4gICAgICBpZiAocHJvbW8uaW5kZXhPZignJScpID4gMCkge1xyXG4gICAgICAgIHByb21vID0gcGFyc2VOdW0ocHJvbW8pICogdmFsICogY3VycyAvIDEwMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwcm9tbyA9IHBhcnNlTnVtKHByb21vKSAqIGN1cnNcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHByb21vID4gMCkge1xyXG4gICAgICAgIG91dCA9IFwiPHNwYW4gY2xhc3M9b2xkX3ByaWNlPlwiICsgcmVzdWx0LnRvRml4ZWQoMikgKyBcIjwvc3Bhbj4gXCIgKyBwcm9tby50b0ZpeGVkKDIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG91dCA9IHJlc3VsdC50b0ZpeGVkKDIpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvdXQgPSByZXN1bHQudG9GaXhlZCgyKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgJHRoaXMuZmluZCgnLmNhbGMtcmVzdWx0X3ZhbHVlJykuaHRtbChvdXQpXHJcbiAgfSkuY2xpY2soKVxyXG59KTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgZWxzID0gJCgnLmF1dG9faGlkZV9jb250cm9sJyk7XHJcbiAgaWYgKGVscy5sZW5ndGggPT0gMClyZXR1cm47XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiLnNjcm9sbF9ib3gtc2hvd19tb3JlXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgYnV0dG9uWWVzOiBmYWxzZSxcclxuICAgICAgbm90eWZ5X2NsYXNzOiBcIm5vdGlmeV93aGl0ZSBub3RpZnlfbm90X2JpZ1wiXHJcbiAgICB9O1xyXG5cclxuICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgIHZhciBjb250ZW50ID0gJHRoaXMuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbScpLmNsb25lKCk7XHJcbiAgICBjb250ZW50ID0gY29udGVudFswXTtcclxuICAgIGNvbnRlbnQuY2xhc3NOYW1lICs9ICcgc2Nyb2xsX2JveC1pdGVtLW1vZGFsJztcclxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGRpdi5jbGFzc05hbWUgPSAnY29tbWVudHMnO1xyXG4gICAgZGl2LmFwcGVuZChjb250ZW50KTtcclxuICAgICQoZGl2KS5maW5kKCcuc2Nyb2xsX2JveC1zaG93X21vcmUnKS5yZW1vdmUoKTtcclxuICAgICQoZGl2KS5maW5kKCcubWF4X3RleHRfaGlkZScpXHJcbiAgICAgIC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS14MicpXHJcbiAgICAgIC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZScpO1xyXG4gICAgZGF0YS5xdWVzdGlvbiA9IGRpdi5vdXRlckhUTUw7XHJcblxyXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBoYXNTY3JvbGwoZWwpIHtcclxuICAgIGlmICghZWwpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVsLnNjcm9sbEhlaWdodCA+IGVsLmNsaWVudEhlaWdodDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlYnVpbGQoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgZWwgPSBlbHMuZXEoaSk7XHJcbiAgICAgIHZhciBpc19oaWRlID0gZmFsc2U7XHJcbiAgICAgIGlmIChlbC5oZWlnaHQoKSA8IDEwKSB7XHJcbiAgICAgICAgaXNfaGlkZSA9IHRydWU7XHJcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuc2hvdygwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHRleHQgPSBlbC5maW5kKCcuc2Nyb2xsX2JveC10ZXh0Jyk7XHJcbiAgICAgIHZhciBhbnN3ZXIgPSBlbC5maW5kKCcuc2Nyb2xsX2JveC1hbnN3ZXInKTtcclxuICAgICAgdmFyIHNob3dfbW9yZSA9IGVsLmZpbmQoJy5zY3JvbGxfYm94LXNob3dfbW9yZScpO1xyXG5cclxuICAgICAgdmFyIHNob3dfYnRuID0gZmFsc2U7XHJcbiAgICAgIGlmIChoYXNTY3JvbGwodGV4dFswXSkpIHtcclxuICAgICAgICBzaG93X2J0biA9IHRydWU7XHJcbiAgICAgICAgdGV4dC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGV4dC5hZGRDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhbnN3ZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIC8v0LXRgdGC0Ywg0L7RgtCy0LXRgiDQsNC00LzQuNC90LBcclxuICAgICAgICBpZiAoaGFzU2Nyb2xsKGFuc3dlclswXSkpIHtcclxuICAgICAgICAgIHNob3dfYnRuID0gdHJ1ZTtcclxuICAgICAgICAgIGFuc3dlci5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGFuc3dlci5hZGRDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2hvd19idG4pIHtcclxuICAgICAgICBzaG93X21vcmUuc2hvdygpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNob3dfbW9yZS5oaWRlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpc19oaWRlKSB7XHJcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuaGlkZSgwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJCh3aW5kb3cpLnJlc2l6ZShyZWJ1aWxkKTtcclxuICByZWJ1aWxkKCk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcuc2hvd19hbGwnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGNscyA9ICQodGhpcykuZGF0YSgnY250cmwtY2xhc3MnKTtcclxuICAgICQoJy5oaWRlX2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcclxuICAgICQodGhpcykuaGlkZSgpO1xyXG4gICAgJCgnLicgKyBjbHMpLnNob3coKTtcclxuICB9KTtcclxuXHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcuaGlkZV9hbGwnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGNscyA9ICQodGhpcykuZGF0YSgnY250cmwtY2xhc3MnKTtcclxuICAgICQoJy5zaG93X2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcclxuICAgICQodGhpcykuaGlkZSgpO1xyXG4gICAgJCgnLicgKyBjbHMpLmhpZGUoKTtcclxuICB9KTtcclxufSkoKTtcclxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIGRlY2xPZk51bShudW1iZXIsIHRpdGxlcykge1xyXG4gICAgY2FzZXMgPSBbMiwgMCwgMSwgMSwgMSwgMl07XHJcbiAgICByZXR1cm4gdGl0bGVzWyhudW1iZXIgJSAxMDAgPiA0ICYmIG51bWJlciAlIDEwMCA8IDIwKSA/IDIgOiBjYXNlc1sobnVtYmVyICUgMTAgPCA1KSA/IG51bWJlciAlIDEwIDogNV1dO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmlyc3RaZXJvKHYpIHtcclxuICAgIHYgPSBNYXRoLmZsb29yKHYpO1xyXG4gICAgaWYgKHYgPCAxMClcclxuICAgICAgcmV0dXJuICcwJyArIHY7XHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiB2O1xyXG4gIH1cclxuXHJcbiAgdmFyIGNsb2NrcyA9ICQoJy5jbG9jaycpO1xyXG4gIGlmIChjbG9ja3MubGVuZ3RoID4gMCkge1xyXG4gICAgZnVuY3Rpb24gdXBkYXRlQ2xvY2soKSB7XHJcbiAgICAgIHZhciBjbG9ja3MgPSAkKHRoaXMpO1xyXG4gICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbG9ja3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgYyA9IGNsb2Nrcy5lcShpKTtcclxuICAgICAgICB2YXIgZW5kID0gbmV3IERhdGUoYy5kYXRhKCdlbmQnKS5yZXBsYWNlKC8tL2csIFwiL1wiKSk7XHJcbiAgICAgICAgdmFyIGQgPSAoZW5kLmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCkpIC8gMTAwMDtcclxuXHJcbiAgICAgICAgLy/QtdGB0LvQuCDRgdGA0L7QuiDQv9GA0L7RiNC10LtcclxuICAgICAgICBpZiAoZCA8PSAwKSB7XHJcbiAgICAgICAgICBjLnRleHQoJ9Cf0YDQvtC80L7QutC+0LQg0LjRgdGC0LXQuicpO1xyXG4gICAgICAgICAgYy5hZGRDbGFzcygnY2xvY2stZXhwaXJlZCcpO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL9C10YHQu9C4INGB0YDQvtC6INCx0L7Qu9C10LUgMzAg0LTQvdC10LlcclxuICAgICAgICBpZiAoZCA+IDMwICogNjAgKiA2MCAqIDI0KSB7XHJcbiAgICAgICAgICBjLmh0bWwoJ9Ce0YHRgtCw0LvQvtGB0Yw6IDxzcGFuPtCx0L7Qu9C10LUgMzAg0LTQvdC10Lk8L3NwYW4+Jyk7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzID0gZCAlIDYwO1xyXG4gICAgICAgIGQgPSAoZCAtIHMpIC8gNjA7XHJcbiAgICAgICAgdmFyIG0gPSBkICUgNjA7XHJcbiAgICAgICAgZCA9IChkIC0gbSkgLyA2MDtcclxuICAgICAgICB2YXIgaCA9IGQgJSAyNDtcclxuICAgICAgICBkID0gKGQgLSBoKSAvIDI0O1xyXG5cclxuICAgICAgICB2YXIgc3RyID0gZmlyc3RaZXJvKGgpICsgXCI6XCIgKyBmaXJzdFplcm8obSkgKyBcIjpcIiArIGZpcnN0WmVybyhzKTtcclxuICAgICAgICBpZiAoZCA+IDApIHtcclxuICAgICAgICAgIHN0ciA9IGQgKyBcIiBcIiArIGRlY2xPZk51bShkLCBbJ9C00LXQvdGMJywgJ9C00L3RjycsICfQtNC90LXQuSddKSArIFwiICBcIiArIHN0cjtcclxuICAgICAgICB9XHJcbiAgICAgICAgYy5odG1sKFwi0J7RgdGC0LDQu9C+0YHRjDogPHNwYW4+XCIgKyBzdHIgKyBcIjwvc3Bhbj5cIik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRJbnRlcnZhbCh1cGRhdGVDbG9jay5iaW5kKGNsb2NrcyksIDEwMDApO1xyXG4gICAgdXBkYXRlQ2xvY2suYmluZChjbG9ja3MpKCk7XHJcbiAgfVxyXG59KTtcclxuIiwidmFyIGNhdGFsb2dUeXBlU3dpdGNoZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIGNhdGFsb2cgPSAkKCcuY2F0YWxvZ19saXN0Jyk7XHJcbiAgaWYgKGNhdGFsb2cubGVuZ3RoID09IDApcmV0dXJuO1xyXG5cclxuICAkKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLmZpbmQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbicpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XHJcbiAgICAkKHRoaXMpLmFkZENsYXNzKCdjaGVja2VkJyk7XHJcbiAgICBpZiAoY2F0YWxvZykge1xyXG4gICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykpIHtcclxuICAgICAgICBjYXRhbG9nLnJlbW92ZUNsYXNzKCduYXJyb3cnKTtcclxuICAgICAgICBzZXRDb29raWUoJ2NvdXBvbnNfdmlldycsICcnKVxyXG4gICAgICB9XHJcbiAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdjYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLW5hcnJvdycpKSB7XHJcbiAgICAgICAgY2F0YWxvZy5hZGRDbGFzcygnbmFycm93Jyk7XHJcbiAgICAgICAgc2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnLCAnbmFycm93Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgaWYgKGdldENvb2tpZSgnY291cG9uc192aWV3JykgPT0gJ25hcnJvdycgJiYgIWNhdGFsb2cuaGFzQ2xhc3MoJ25hcnJvd19vZmYnKSkge1xyXG4gICAgY2F0YWxvZy5hZGRDbGFzcygnbmFycm93Jyk7XHJcbiAgICAkKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1uYXJyb3cnKS5hZGRDbGFzcygnY2hlY2tlZCcpO1xyXG4gICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbGlzdCcpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XHJcbiAgfVxyXG59KCk7XHJcbiIsIiQoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5zZC1zZWxlY3Qtc2VsZWN0ZWQnKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcclxuICAgIHZhciBkcm9wQmxvY2sgPSAkKHBhcmVudCkuZmluZCgnLnNkLXNlbGVjdC1kcm9wJyk7XHJcblxyXG4gICAgaWYgKGRyb3BCbG9jay5pcygnOmhpZGRlbicpKSB7XHJcbiAgICAgIGRyb3BCbG9jay5zbGlkZURvd24oKTtcclxuXHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgaWYgKCFwYXJlbnQuaGFzQ2xhc3MoJ2xpbmtlZCcpKSB7XHJcblxyXG4gICAgICAgICQoJy5zZC1zZWxlY3QtZHJvcCcpLmZpbmQoJ2EnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG5cclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIHZhciBzZWxlY3RSZXN1bHQgPSAkKHRoaXMpLmh0bWwoKTtcclxuXHJcbiAgICAgICAgICAkKHBhcmVudCkuZmluZCgnaW5wdXQnKS52YWwoc2VsZWN0UmVzdWx0KTtcclxuXHJcbiAgICAgICAgICAkKHBhcmVudCkuZmluZCgnLnNkLXNlbGVjdC1zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5odG1sKHNlbGVjdFJlc3VsdCk7XHJcblxyXG4gICAgICAgICAgZHJvcEJsb2NrLnNsaWRlVXAoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICBkcm9wQmxvY2suc2xpZGVVcCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG5cclxufSk7XHJcbiIsInNlYXJjaCA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgb3BlbkF1dG9jb21wbGV0ZTtcclxuXHJcbiAgJCgnLnNlYXJjaC1mb3JtLWlucHV0Jykub24oJ2lucHV0JywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgIHZhciBxdWVyeSA9ICR0aGlzLnZhbCgpO1xyXG4gICAgdmFyIGRhdGEgPSAkdGhpcy5jbG9zZXN0KCdmb3JtJykuc2VyaWFsaXplKCk7XHJcbiAgICB2YXIgYXV0b2NvbXBsZXRlID0gJHRoaXMuY2xvc2VzdCgnLnN0b3Jlc19zZWFyY2gnKS5maW5kKCcuYXV0b2NvbXBsZXRlLXdyYXAnKTsvLyAkKCcjYXV0b2NvbXBsZXRlJyksXHJcbiAgICB2YXIgYXV0b2NvbXBsZXRlTGlzdCA9ICQoYXV0b2NvbXBsZXRlKS5maW5kKCd1bCcpO1xyXG4gICAgb3BlbkF1dG9jb21wbGV0ZSA9IGF1dG9jb21wbGV0ZTtcclxuICAgIGlmIChxdWVyeS5sZW5ndGggPiAxKSB7XHJcbiAgICAgIHVybCA9ICR0aGlzLmNsb3Nlc3QoJ2Zvcm0nKS5hdHRyKCdhY3Rpb24nKSB8fCAnL3NlYXJjaCc7XHJcbiAgICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgdHlwZTogJ2dldCcsXHJcbiAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucykge1xyXG4gICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgJChhdXRvY29tcGxldGVMaXN0KS5odG1sKCcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHZhciBodG1sID0gJzxhIGNsYXNzPVwiYXV0b2NvbXBsZXRlX2xpbmtcIiBocmVmPVwiJyArIGl0ZW0uZGF0YS5yb3V0ZSArICdcIicgKyAnPicgKyBpdGVtLnZhbHVlICsgaXRlbS5jYXNoYmFjayArICc8L2E+JztcclxuICAgICAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICAgICAgICAgICAgICBsaS5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGVMaXN0KS5hcHBlbmQobGkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlSW4oKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xyXG4gICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuaHRtbCgnJyk7XHJcbiAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pLm9uKCdmb2N1c291dCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoISQoZS5yZWxhdGVkVGFyZ2V0KS5oYXNDbGFzcygnYXV0b2NvbXBsZXRlX2xpbmsnKSkge1xyXG4gICAgICAvLyQoJyNhdXRvY29tcGxldGUnKS5oaWRlKCk7XHJcbiAgICAgICQob3BlbkF1dG9jb21wbGV0ZSkuZGVsYXkoMTAwKS5zbGlkZVVwKDEwMClcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnYm9keScpLm9uKCdzdWJtaXQnLCAnLnN0b3Jlcy1zZWFyY2hfZm9ybScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgdmFsID0gJCh0aGlzKS5maW5kKCcuc2VhcmNoLWZvcm0taW5wdXQnKS52YWwoKTtcclxuICAgIGlmICh2YWwubGVuZ3RoIDwgMikge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSlcclxufSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAkKCcuY291cG9ucy1saXN0X2l0ZW0tY29udGVudC1nb3RvLXByb21vY29kZS1saW5rJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcclxuICAgIHZhciBleHBpcmVkID0gdGhhdC5jbG9zZXN0KCcuY291cG9ucy1saXN0X2l0ZW0nKS5maW5kKCcuY2xvY2stZXhwaXJlZCcpO1xyXG4gICAgdmFyIHVzZXJJZCA9ICQodGhhdCkuZGF0YSgndXNlcicpO1xyXG4gICAgdmFyIGluYWN0aXZlID0gJCh0aGF0KS5kYXRhKCdpbmFjdGl2ZScpO1xyXG4gICAgdmFyIGRhdGFfbWVzc2FnZSA9ICQodGhhdCkuZGF0YSgnbWVzc2FnZScpO1xyXG5cclxuICAgIGlmIChpbmFjdGl2ZSkge1xyXG4gICAgICB2YXIgdGl0bGUgPSBkYXRhX21lc3NhZ2UgPyBkYXRhX21lc3NhZ2UgOiAn0Jog0YHQvtC20LDQu9C10L3QuNGOLCDQv9GA0L7QvNC+0LrQvtC0INC90LXQsNC60YLQuNCy0LXQvSc7XHJcbiAgICAgIHZhciBtZXNzYWdlID0gJ9CS0YHQtSDQtNC10LnRgdGC0LLRg9GO0YnQuNC1INC/0YDQvtC80L7QutC+0LTRiyDQstGLINC80L7QttC10YLQtSA8YSBocmVmPVwiL2NvdXBvbnNcIj7Qv9C+0YHQvNC+0YLRgNC10YLRjCDQt9C00LXRgdGMPC9hPic7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XHJcbiAgICAgICAgJ3RpdGxlJzogdGl0bGUsXHJcbiAgICAgICAgJ3F1ZXN0aW9uJzogbWVzc2FnZSxcclxuICAgICAgICAnYnV0dG9uWWVzJzogJ09rJyxcclxuICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcclxuICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2UgaWYgKGV4cGlyZWQubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgdGl0bGUgPSAn0Jog0YHQvtC20LDQu9C10L3QuNGOLCDRgdGA0L7QuiDQtNC10LnRgdGC0LLQuNGPINC00LDQvdC90L7Qs9C+INC/0YDQvtC80L7QutC+0LTQsCDQuNGB0YLQtdC6JztcclxuICAgICAgdmFyIG1lc3NhZ2UgPSAn0JLRgdC1INC00LXQudGB0YLQstGD0Y7RidC40LUg0L/RgNC+0LzQvtC60L7QtNGLINCy0Ysg0LzQvtC20LXRgtC1IDxhIGhyZWY9XCIvY291cG9uc1wiPtC/0L7RgdC80L7RgtGA0LXRgtGMINC30LTQtdGB0Yw8L2E+JztcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcclxuICAgICAgICAndGl0bGUnOiB0aXRsZSxcclxuICAgICAgICAncXVlc3Rpb24nOiBtZXNzYWdlLFxyXG4gICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxyXG4gICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxyXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiAnbm90aWZ5X2JveC1hbGVydCdcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSBpZiAoIXVzZXJJZCkge1xyXG4gICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAnYnV0dG9uWWVzJzogZmFsc2UsXHJcbiAgICAgICAgJ25vdHlmeV9jbGFzcyc6IFwibm90aWZ5X2JveC1hbGVydFwiLFxyXG4gICAgICAgICd0aXRsZSc6ICfQmNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0L/RgNC+0LzQvtC60L7QtCcsXHJcbiAgICAgICAgJ3F1ZXN0aW9uJzogJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWNvdXBvbi1ub3JlZ2lzdGVyXCI+JyArXHJcbiAgICAgICAgJzxpbWcgc3JjPVwiL2ltYWdlcy90ZW1wbGF0ZXMvc3dhLnBuZ1wiIGFsdD1cIlwiPicgK1xyXG4gICAgICAgICc8cD48Yj7QldGB0LvQuCDQstGLINGF0L7RgtC40YLQtSDQv9C+0LvRg9GH0LDRgtGMINC10YnQtSDQuCDQmtCt0KjQkdCt0JogKNCy0L7Qt9Cy0YDQsNGCINC00LXQvdC10LMpLCDQstCw0Lwg0L3QtdC+0LHRhdC+0LTQuNC80L4g0LfQsNGA0LXQs9C40YHRgtGA0LjRgNC+0LLQsNGC0YzRgdGPLiDQndC+INC80L7QttC10YLQtSDQuCDQv9GA0L7RgdGC0L4g0LLQvtGB0L/QvtC70YzQt9C+0LLQsNGC0YzRgdGPINC/0YDQvtC80L7QutC+0LTQvtC8LCDQsdC10Lcg0LrRjdGI0LHRjdC60LAuPC9iPjwvcD4nICtcclxuICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWJ1dHRvbnNcIj4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIicgKyB0aGF0LmF0dHIoJ2hyZWYnKSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImJ0blwiPtCY0YHQv9C+0LvRjNC30L7QstCw0YLRjCDQv9GA0L7QvNC+0LrQvtC0PC9hPicgK1xyXG4gICAgICAgICc8YSBocmVmPVwiI3JlZ2lzdHJhdGlvblwiIGNsYXNzPVwiYnRuIGJ0bi10cmFuc2Zvcm0gbW9kYWxzX29wZW5cIj7Ql9Cw0YDQtdCz0LjRgdGC0YDQuNGA0L7QstCw0YLRjNGB0Y88L2E+JyArXHJcbiAgICAgICAgJzwvZGl2PidcclxuICAgICAgfTtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJyNzaG9wX2hlYWRlci1nb3RvLWNoZWNrYm94JykuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICBpZiAoISQodGhpcykuaXMoJzpjaGVja2VkJykpIHtcclxuICAgICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcclxuICAgICAgICAgICAgICd0aXRsZSc6ICfQktC90LjQvNCw0L3QuNC1JyxcclxuICAgICAgICAgICAgICdxdWVzdGlvbic6ICfQndC1INGA0LXQutC+0LzQtdC90LTRg9C10YLRgdGPINGB0L7QstC10YDRiNCw0YLRjCDQv9C+0LrRg9C/0LrQuCDQsdC10Lcg0L7Qt9C90LDQutC+0LzQu9C10L3QuNGPPGJyPiDRgSA8YSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub2ZvbGxvdyBub29wZXIgbm9yZWZlcnJlclwiIGhyZWY9XCIvcmVjb21tZW5kYXRpb25zXCI+0J/RgNCw0LLQuNC70LDQvNC4INC/0L7QutGD0L/QvtC6INGBINC60Y3RiNCx0Y3QutC+0Lw8L2E+JyxcclxuICAgICAgICAgICAgICdidXR0b25ZZXMnOiAn0JfQsNC60YDRi9GC0YwnLFxyXG4gICAgICAgICAgICAgJ2J1dHRvbk5vJzogZmFsc2UsXHJcbiAgICAgICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXHJcbiAgICAgICAgIH0pO1xyXG4gICAgIH1cclxuICB9KTtcclxuXHJcblxyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuYWNjb3VudC13aXRoZHJhdy1tZXRob2RzX2l0ZW0tb3B0aW9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBvcHRpb24gPSAkKHRoaXMpLmRhdGEoJ29wdGlvbi1wcm9jZXNzJyksXHJcbiAgICAgIHBsYWNlaG9sZGVyID0gJyc7XHJcbiAgICBzd2l0Y2ggKG9wdGlvbikge1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YHRh9GR0YLQsFwiO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAIFIt0LrQvtGI0LXQu9GM0LrQsFwiO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAzOlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINGC0LXQu9C10YTQvtC90LBcIjtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgNDpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDQutCw0YDRgtGLXCI7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDU6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1IGVtYWlsINCw0LTRgNC10YFcIjtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgNjpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDRgtC10LvQtdGE0L7QvdCwXCI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICQodGhpcykucGFyZW50KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgJChcIiN1c2Vyc3dpdGhkcmF3LWJpbGxcIikuYXR0cihcInBsYWNlaG9sZGVyXCIsIHBsYWNlaG9sZGVyKTtcclxuICAgICQoJyN1c2Vyc3dpdGhkcmF3LXByb2Nlc3NfaWQnKS52YWwob3B0aW9uKTtcclxuICB9KTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICBhamF4Rm9ybSgkKCcuYWpheF9mb3JtJykpO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5kb2Jyby1mdW5kc19pdGVtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAkKCcjZG9icm8tc2VuZC1mb3JtLWNoYXJpdHktcHJvY2VzcycpLnZhbCgkKHRoaXMpLmRhdGEoJ2lkJykpO1xyXG4gIH0pO1xyXG5cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnYm9keScpLmFkZENsYXNzKCdub19zY3JvbGwnKTtcclxuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQnKS5hZGRDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LW9wZW4nKTtcclxuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5hZGRDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlLW9wZW4nKTtcclxuICB9KTtcclxuICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LWNsb3NlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcclxuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQnKS5yZW1vdmVDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LW9wZW4nKTtcclxuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5yZW1vdmVDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlLW9wZW4nKTtcclxuICB9KTtcclxufSkoKTtcclxuIiwiLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xyXG5zaGFyZTQyID0gZnVuY3Rpb24gKCl7XHJcbiAgZT1kb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzaGFyZTQyaW5pdCcpO1xyXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgZS5sZW5ndGg7IGsrKykge1xyXG4gICAgdmFyIHUgPSBcIlwiO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNvY2lhbHMnKSAhPSAtMSlcclxuICAgICAgdmFyIHNvY2lhbHMgPSBKU09OLnBhcnNlKCdbJytlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zb2NpYWxzJykrJ10nKTtcclxuICAgIHZhciBpY29uX3R5cGU9ZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi10eXBlJykgIT0gLTE/ZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi10eXBlJyk6Jyc7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXJsJykgIT0gLTEpXHJcbiAgICAgIHUgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKTtcclxuICAgIHZhciBwcm9tbyA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXByb21vJyk7XHJcbiAgICBpZihwcm9tbyAmJiBwcm9tby5sZW5ndGg+MCkge1xyXG4gICAgICB2YXIga2V5ID0gJ3Byb21vPScsXHJcbiAgICAgICAgcHJvbW9TdGFydCA9IHUuaW5kZXhPZihrZXkpLFxyXG4gICAgICAgIHByb21vRW5kID0gdS5pbmRleE9mKCcmJywgcHJvbW9TdGFydCksXHJcbiAgICAgICAgcHJvbW9MZW5ndGggPSBwcm9tb0VuZCA+IHByb21vU3RhcnQgPyBwcm9tb0VuZCAtIHByb21vU3RhcnQgLSBrZXkubGVuZ3RoIDogdS5sZW5ndGggLSBwcm9tb1N0YXJ0IC0ga2V5Lmxlbmd0aDtcclxuICAgICAgaWYocHJvbW9TdGFydCA+IDApIHtcclxuICAgICAgICBwcm9tbyA9IHUuc3Vic3RyKHByb21vU3RhcnQgKyBrZXkubGVuZ3RoLCBwcm9tb0xlbmd0aCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHZhciBzZWxmX3Byb21vID0gKHByb21vICYmIHByb21vLmxlbmd0aCA+IDApPyBcInNldFRpbWVvdXQoZnVuY3Rpb24oKXtzZW5kX3Byb21vKCdcIitwcm9tbytcIicpO30sMjAwMCk7XCIgOiBcIlwiO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tc2l6ZScpICE9IC0xKVxyXG4gICAgICB2YXIgaWNvbl9zaXplID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi1zaXplJyk7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnKSAhPSAtMSlcclxuICAgICAgdmFyIHQgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWltYWdlJykgIT0gLTEpXHJcbiAgICAgIHZhciBpID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1hZ2UnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1kZXNjcmlwdGlvbicpICE9IC0xKVxyXG4gICAgICB2YXIgZCA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWRlc2NyaXB0aW9uJyk7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF0aCcpICE9IC0xKVxyXG4gICAgICB2YXIgZiA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXBhdGgnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29ucy1maWxlJykgIT0gLTEpXHJcbiAgICAgIHZhciBmbiA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb25zLWZpbGUnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zY3JpcHQtYWZ0ZXInKSkge1xyXG4gICAgICBzZWxmX3Byb21vICs9IFwic2V0VGltZW91dChmdW5jdGlvbigpe1wiK2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNjcmlwdC1hZnRlcicpK1wifSwzMDAwKTtcIjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWYpIHtcclxuICAgICAgZnVuY3Rpb24gcGF0aChuYW1lKSB7XHJcbiAgICAgICAgdmFyIHNjID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpXHJcbiAgICAgICAgICAsIHNyID0gbmV3IFJlZ0V4cCgnXiguKi98KSgnICsgbmFtZSArICcpKFsjP118JCknKTtcclxuICAgICAgICBmb3IgKHZhciBwID0gMCwgc2NMID0gc2MubGVuZ3RoOyBwIDwgc2NMOyBwKyspIHtcclxuICAgICAgICAgIHZhciBtID0gU3RyaW5nKHNjW3BdLnNyYykubWF0Y2goc3IpO1xyXG4gICAgICAgICAgaWYgKG0pIHtcclxuICAgICAgICAgICAgaWYgKG1bMV0ubWF0Y2goL14oKGh0dHBzP3xmaWxlKVxcOlxcL3syLH18XFx3OltcXC9cXFxcXSkvKSlcclxuICAgICAgICAgICAgICByZXR1cm4gbVsxXTtcclxuICAgICAgICAgICAgaWYgKG1bMV0uaW5kZXhPZihcIi9cIikgPT0gMClcclxuICAgICAgICAgICAgICByZXR1cm4gbVsxXTtcclxuICAgICAgICAgICAgYiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdiYXNlJyk7XHJcbiAgICAgICAgICAgIGlmIChiWzBdICYmIGJbMF0uaHJlZilcclxuICAgICAgICAgICAgICByZXR1cm4gYlswXS5ocmVmICsgbVsxXTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvKC4qW1xcL1xcXFxdKS8pWzBdICsgbVsxXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgZiA9IHBhdGgoJ3NoYXJlNDIuanMnKTtcclxuICAgIH1cclxuICAgIGlmICghdSlcclxuICAgICAgdSA9IGxvY2F0aW9uLmhyZWY7XHJcbiAgICBpZiAoIXQpXHJcbiAgICAgIHQgPSBkb2N1bWVudC50aXRsZTtcclxuICAgIGlmICghZm4pXHJcbiAgICAgIGZuID0gJ2ljb25zLnBuZyc7XHJcbiAgICBmdW5jdGlvbiBkZXNjKCkge1xyXG4gICAgICB2YXIgbWV0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtZXRhJyk7XHJcbiAgICAgIGZvciAodmFyIG0gPSAwOyBtIDwgbWV0YS5sZW5ndGg7IG0rKykge1xyXG4gICAgICAgIGlmIChtZXRhW21dLm5hbWUudG9Mb3dlckNhc2UoKSA9PSAnZGVzY3JpcHRpb24nKSB7XHJcbiAgICAgICAgICByZXR1cm4gbWV0YVttXS5jb250ZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gJyc7XHJcbiAgICB9XHJcbiAgICBpZiAoIWQpXHJcbiAgICAgIGQgPSBkZXNjKCk7XHJcbiAgICB1ID0gZW5jb2RlVVJJQ29tcG9uZW50KHUpO1xyXG4gICAgdCA9IGVuY29kZVVSSUNvbXBvbmVudCh0KTtcclxuICAgIHQgPSB0LnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XHJcbiAgICBpID0gZW5jb2RlVVJJQ29tcG9uZW50KGkpO1xyXG4gICAgdmFyIGRfb3JpZz1kLnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XHJcbiAgICBkID0gZW5jb2RlVVJJQ29tcG9uZW50KGQpO1xyXG4gICAgZCA9IGQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcclxuICAgIHZhciBmYlF1ZXJ5ID0gJ3U9JyArIHU7XHJcbiAgICBpZiAoaSAhPSAnbnVsbCcgJiYgaSAhPSAnJylcclxuICAgICAgZmJRdWVyeSA9ICdzPTEwMCZwW3VybF09JyArIHUgKyAnJnBbdGl0bGVdPScgKyB0ICsgJyZwW3N1bW1hcnldPScgKyBkICsgJyZwW2ltYWdlc11bMF09JyArIGk7XHJcbiAgICB2YXIgdmtJbWFnZSA9ICcnO1xyXG4gICAgaWYgKGkgIT0gJ251bGwnICYmIGkgIT0gJycpXHJcbiAgICAgIHZrSW1hZ2UgPSAnJmltYWdlPScgKyBpO1xyXG4gICAgdmFyIHMgPSBuZXcgQXJyYXkoXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwiZmJcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT0nICsgdSArJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgRmFjZWJvb2tcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidmtcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3ZrLmNvbS9zaGFyZS5waHA/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArIHZrSW1hZ2UgKyAnJmRlc2NyaXB0aW9uPScgKyBkICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0JIg0JrQvtC90YLQsNC60YLQtVwiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJvZGtsXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9jb25uZWN0Lm9rLnJ1L29mZmVyP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnJmRlc2NyaXB0aW9uPScrIGQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQlNC+0LHQsNCy0LjRgtGMINCyINCe0LTQvdC+0LrQu9Cw0YHRgdC90LjQutC4XCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInR3aVwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9JyArIHQgKyAnJnVybD0nICsgdSArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIgVHdpdHRlclwiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJncGx1c1wiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vcGx1cy5nb29nbGUuY29tL3NoYXJlP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBHb29nbGUrXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cIm1haWxcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL2Nvbm5lY3QubWFpbC5ydS9zaGFyZT91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgJyZkZXNjcmlwdGlvbj0nICsgZCArICcmaW1hZ2V1cmw9JyArIGkgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiDQnNC+0LXQvCDQnNC40YDQtUBNYWlsLlJ1XCInLFxyXG4gICAgICAnXCIvL3d3dy5saXZlam91cm5hbC5jb20vdXBkYXRlLmJtbD9ldmVudD0nICsgdSArICcmc3ViamVjdD0nICsgdCArICdcIiB0aXRsZT1cItCe0L/Rg9Cx0LvQuNC60L7QstCw0YLRjCDQsiBMaXZlSm91cm5hbFwiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJwaW5cIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3BpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD0nICsgdSArICcmbWVkaWE9JyArIGkgKyAnJmRlc2NyaXB0aW9uPScgKyB0ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD02MDAsIGhlaWdodD0zMDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiBQaW50ZXJlc3RcIicsXHJcbiAgICAgICdcIlwiIG9uY2xpY2s9XCJyZXR1cm4gZmF2KHRoaXMpO1wiIHRpdGxlPVwi0KHQvtGF0YDQsNC90LjRgtGMINCyINC40LfQsdGA0LDQvdC90L7QtSDQsdGA0LDRg9C30LXRgNCwXCInLFxyXG4gICAgICAnXCIjXCIgb25jbGljaz1cInByaW50KCk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQoNCw0YHQv9C10YfQsNGC0LDRgtGMXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInRlbGVncmFtXCIgb25jbGljaz1cIndpbmRvdy5vcGVuKFxcJy8vdGVsZWdyYW0ubWUvc2hhcmUvdXJsP3VybD0nICsgdSArJyZ0ZXh0PScgKyB0ICsgJ1xcJywgXFwndGVsZWdyYW1cXCcsIFxcJ3dpZHRoPTU1MCxoZWlnaHQ9NDQwLGxlZnQ9MTAwLHRvcD0xMDBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgVGVsZWdyYW1cIicsXHJcbiAgICAgICdcInZpYmVyOi8vZm9yd2FyZD90ZXh0PScrIHUgKycgLSAnICsgdCArICdcIiBkYXRhLWNvdW50PVwidmliZXJcIiByZWw9XCJub2ZvbGxvdyBub29wZW5lclwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgVmliZXJcIicsXHJcbiAgICAgICdcIndoYXRzYXBwOi8vc2VuZD90ZXh0PScrIHUgKycgLSAnICsgdCArICdcIiBkYXRhLWNvdW50PVwid2hhdHNhcHBcIiByZWw9XCJub2ZvbGxvdyBub29wZW5lclwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgV2hhdHNBcHBcIidcclxuXHJcbiAgICApO1xyXG5cclxuICAgIHZhciBsID0gJyc7XHJcblxyXG4gICAgaWYoc29jaWFscy5sZW5ndGg+MSl7XHJcbiAgICAgIGZvciAocSA9IDA7IHEgPCBzb2NpYWxzLmxlbmd0aDsgcSsrKXtcclxuICAgICAgICBqPXNvY2lhbHNbcV07XHJcbiAgICAgICAgbCArPSAnPGEgcmVsPVwibm9mb2xsb3dcIiBocmVmPScgKyBzW2pdICsgJyB0YXJnZXQ9XCJfYmxhbmtcIiAnK2dldEljb24oc1tqXSxqLGljb25fdHlwZSxmLGZuLGljb25fc2l6ZSkrJz48L2E+JztcclxuICAgICAgfVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGZvciAoaiA9IDA7IGogPCBzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgbCArPSAnPGEgcmVsPVwibm9mb2xsb3dcIiBocmVmPScgKyBzW2pdICsgJyB0YXJnZXQ9XCJfYmxhbmtcIiAnK2dldEljb24oc1tqXSxqLGljb25fdHlwZSxmLGZuLGljb25fc2l6ZSkrJz48L2E+JztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZVtrXS5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJzaGFyZTQyX3dyYXBcIj4nICsgbCArICc8L3NwYW4+JztcclxuICB9XHJcbiAgXHJcbi8vfSwgZmFsc2UpO1xyXG59KCk7XHJcblxyXG5mdW5jdGlvbiBnZXRJY29uKHMsaix0LGYsZm4sc2l6ZSkge1xyXG4gIGlmKCFzaXplKXtcclxuICAgIHNpemU9MzI7XHJcbiAgfVxyXG4gIGlmKHQ9PSdjc3MnKXtcclxuICAgIGo9cy5pbmRleE9mKCdkYXRhLWNvdW50PVwiJykrMTI7XHJcbiAgICB2YXIgbD1zLmluZGV4T2YoJ1wiJyxqKS1qO1xyXG4gICAgdmFyIGwyPXMuaW5kZXhPZignLicsaiktajtcclxuICAgIGw9bD5sMiAmJiBsMj4wID9sMjpsO1xyXG4gICAgLy92YXIgaWNvbj0nY2xhc3M9XCJzb2MtaWNvbiBpY29uLScrcy5zdWJzdHIoaixsKSsnXCInO1xyXG4gICAgdmFyIGljb249J2NsYXNzPVwic29jLWljb24tc2QgaWNvbi1zZC0nK3Muc3Vic3RyKGosbCkrJ1wiJztcclxuICB9ZWxzZSBpZih0PT0nc3ZnJyl7XHJcbiAgICB2YXIgc3ZnPVtcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsMTExLjk0LDE3Ny4wOClcIiBkPVwiTTAgMCAwIDcwLjMgMjMuNiA3MC4zIDI3LjEgOTcuNyAwIDk3LjcgMCAxMTUuMkMwIDEyMy4yIDIuMiAxMjguNiAxMy42IDEyOC42TDI4LjEgMTI4LjYgMjguMSAxNTMuMUMyNS42IDE1My40IDE3IDE1NC4yIDYuOSAxNTQuMi0xNCAxNTQuMi0yOC4zIDE0MS40LTI4LjMgMTE3LjlMLTI4LjMgOTcuNy01MiA5Ny43LTUyIDcwLjMtMjguMyA3MC4zLTI4LjMgMCAwIDBaXCIvPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDk4LjI3NCwxNDUuNTIpXCIgZD1cIk0wIDAgOS42IDBDOS42IDAgMTIuNSAwLjMgMTQgMS45IDE1LjQgMy40IDE1LjMgNi4xIDE1LjMgNi4xIDE1LjMgNi4xIDE1LjEgMTkgMjEuMSAyMSAyNyAyMi44IDM0LjYgOC41IDQyLjcgMyA0OC43LTEuMiA1My4zLTAuMyA1My4zLTAuM0w3NC44IDBDNzQuOCAwIDg2LjEgMC43IDgwLjcgOS41IDgwLjMgMTAuMyA3Ny42IDE2LjEgNjQuOCAyOCA1MS4zIDQwLjUgNTMuMSAzOC41IDY5LjMgNjAuMSA3OS4yIDczLjMgODMuMiA4MS40IDgxLjkgODQuOCA4MC44IDg4LjEgNzMuNSA4Ny4yIDczLjUgODcuMkw0OS4zIDg3LjFDNDkuMyA4Ny4xIDQ3LjUgODcuMyA0Ni4yIDg2LjUgNDQuOSA4NS43IDQ0IDgzLjkgNDQgODMuOSA0NCA4My45IDQwLjIgNzMuNyAzNS4xIDY1LjEgMjQuMyA0Ni44IDIwIDQ1LjggMTguMyA0Ni45IDE0LjIgNDkuNiAxNS4yIDU3LjYgMTUuMiA2My4yIDE1LjIgODEgMTcuOSA4OC40IDkuOSA5MC4zIDcuMyA5MC45IDUuNCA5MS4zLTEuNCA5MS40LTEwIDkxLjUtMTcuMyA5MS40LTIxLjQgODkuMy0yNC4yIDg4LTI2LjMgODUtMjUgODQuOC0yMy40IDg0LjYtMTkuOCA4My44LTE3LjkgODEuMi0xNS40IDc3LjktMTUuNSA3MC4zLTE1LjUgNzAuMy0xNS41IDcwLjMtMTQuMSA0OS40LTE4LjggNDYuOC0yMi4xIDQ1LTI2LjUgNDguNy0zNi4xIDY1LjMtNDEuMSA3My44LTQ0LjggODMuMi00NC44IDgzLjItNDQuOCA4My4yLTQ1LjUgODQuOS00Ni44IDg1LjktNDguMyA4Ny01MC41IDg3LjQtNTAuNSA4Ny40TC03My41IDg3LjJDLTczLjUgODcuMi03Ni45IDg3LjEtNzguMiA4NS42LTc5LjMgODQuMy03OC4zIDgxLjUtNzguMyA4MS41LTc4LjMgODEuNS02MC4zIDM5LjQtMzkuOSAxOC4yLTIxLjItMS4zIDAgMCAwIDBcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDEwNi44OCwxODMuNjEpXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKC02Ljg4MDUsLTEwMClcIiBzdHlsZT1cInN0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIj48cGF0aCBkPVwiTSAwLDAgQyA4LjE0NiwwIDE0Ljc2OSwtNi42MjUgMTQuNzY5LC0xNC43NyAxNC43NjksLTIyLjkwNyA4LjE0NiwtMjkuNTMzIDAsLTI5LjUzMyAtOC4xMzYsLTI5LjUzMyAtMTQuNzY5LC0yMi45MDcgLTE0Ljc2OSwtMTQuNzcgLTE0Ljc2OSwtNi42MjUgLTguMTM2LDAgMCwwIE0gMCwtNTAuNDI5IEMgMTkuNjc2LC01MC40MjkgMzUuNjcsLTM0LjQzNSAzNS42NywtMTQuNzcgMzUuNjcsNC45MDMgMTkuNjc2LDIwLjkwMyAwLDIwLjkwMyAtMTkuNjcxLDIwLjkwMyAtMzUuNjY5LDQuOTAzIC0zNS42NjksLTE0Ljc3IC0zNS42NjksLTM0LjQzNSAtMTkuNjcxLC01MC40MjkgMCwtNTAuNDI5XCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsNy41NTE2LC01NC41NzcpXCIgc3R5bGU9XCJzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCI+PHBhdGggZD1cIk0gMCwwIEMgNy4yNjIsMS42NTUgMTQuMjY0LDQuNTI2IDIwLjcxNCw4LjU3OCAyNS41OTUsMTEuNjU0IDI3LjA2NiwxOC4xMDggMjMuOTksMjIuOTg5IDIwLjkxNywyNy44ODEgMTQuNDY5LDI5LjM1MiA5LjU3OSwyNi4yNzUgLTUuMDMyLDE3LjA4NiAtMjMuODQzLDE3LjA5MiAtMzguNDQ2LDI2LjI3NSAtNDMuMzM2LDI5LjM1MiAtNDkuNzg0LDI3Ljg4MSAtNTIuODUyLDIyLjk4OSAtNTUuOTI4LDE4LjEwNCAtNTQuNDYxLDExLjY1NCAtNDkuNTgsOC41NzggLTQzLjEzMiw0LjUzMSAtMzYuMTI4LDEuNjU1IC0yOC44NjcsMCBMIC00OC44MDksLTE5Ljk0MSBDIC01Mi44ODYsLTI0LjAyMiAtNTIuODg2LC0zMC42MzkgLTQ4LjgwNSwtMzQuNzIgLTQ2Ljc2MiwtMzYuNzU4IC00NC4wOSwtMzcuNzc5IC00MS40MTgsLTM3Ljc3OSAtMzguNzQyLC0zNy43NzkgLTM2LjA2NSwtMzYuNzU4IC0zNC4wMjMsLTM0LjcyIEwgLTE0LjQzNiwtMTUuMTIzIDUuMTY5LC0zNC43MiBDIDkuMjQ2LC0zOC44MDEgMTUuODYyLC0zOC44MDEgMTkuOTQzLC0zNC43MiAyNC4wMjgsLTMwLjYzOSAyNC4wMjgsLTI0LjAxOSAxOS45NDMsLTE5Ljk0MSBMIDAsMCBaXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48L2c+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsMTY5Ljc2LDU2LjcyNylcIiBkPVwiTTAgMEMtNS4xLTIuMy0xMC42LTMuOC0xNi40LTQuNS0xMC41LTEtNiA0LjYtMy45IDExLjMtOS40IDgtMTUuNSA1LjctMjIgNC40LTI3LjMgOS45LTM0LjcgMTMuNC00Mi45IDEzLjQtNTguNyAxMy40LTcxLjYgMC42LTcxLjYtMTUuMi03MS42LTE3LjQtNzEuMy0xOS42LTcwLjgtMjEuNy05NC42LTIwLjUtMTE1LjctOS4xLTEyOS44IDguMi0xMzIuMyA0LTEzMy43LTEtMTMzLjctNi4yLTEzMy43LTE2LjEtMTI4LjYtMjQuOS0xMjAuOS0zMC0xMjUuNi0yOS45LTEzMC4xLTI4LjYtMTMzLjktMjYuNS0xMzMuOS0yNi42LTEzMy45LTI2LjctMTMzLjktMjYuOC0xMzMuOS00MC43LTEyNC01Mi4zLTExMS01NC45LTExMy40LTU1LjUtMTE1LjktNTUuOS0xMTguNS01NS45LTEyMC4zLTU1LjktMTIyLjEtNTUuNy0xMjMuOS01NS40LTEyMC4yLTY2LjctMTA5LjctNzUtOTcuMS03NS4zLTEwNi45LTgyLjktMTE5LjMtODcuNS0xMzIuNy04Ny41LTEzNS04Ny41LTEzNy4zLTg3LjQtMTM5LjUtODcuMS0xMjYuOC05NS4yLTExMS44LTEwMC05NS42LTEwMC00My0xMDAtMTQuMi01Ni4zLTE0LjItMTguNS0xNC4yLTE3LjMtMTQuMi0xNi0xNC4zLTE0LjgtOC43LTEwLjgtMy44LTUuNyAwIDBcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMSAwIDAgLTEgNzIuMzgxIDkwLjE3MilcIj48cGF0aCBkPVwiTTg3LjIgMCA4Ny4yIDE3LjEgNzUgMTcuMSA3NSAwIDU3LjkgMCA1Ny45LTEyLjIgNzUtMTIuMiA3NS0yOS4zIDg3LjItMjkuMyA4Ny4yLTEyLjIgMTA0LjMtMTIuMiAxMDQuMyAwIDg3LjIgMFpcIi8+PHBhdGggZD1cIk0wIDAgMC0xOS42IDI2LjItMTkuNkMyNS40LTIzLjcgMjMuOC0yNy41IDIwLjgtMzAuNiAxMC4zLTQyLjEtOS4zLTQyLTIwLjUtMzAuNC0zMS43LTE4LjktMzEuNi0wLjMtMjAuMiAxMS4xLTkuNCAyMS45IDggMjIuNCAxOC42IDEyLjFMMTguNSAxMi4xIDMyLjggMjYuNEMxMy43IDQzLjgtMTUuOCA0My41LTM0LjUgMjUuMS01My44IDYuMS01NC0yNS0zNC45LTQ0LjMtMTUuOS02My41IDE3LjEtNjMuNyAzNC45LTQ0LjYgNDUuNi0zMyA0OC43LTE2LjQgNDYuMiAwTDAgMFpcIi8+PC9nPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDk3LjY3Niw2Mi40MTEpXCIgZD1cIk0wIDBDMTAuMiAwIDE5LjktNC41IDI2LjktMTEuNkwyNi45LTExLjZDMjYuOS04LjIgMjkuMi01LjcgMzIuNC01LjdMMzMuMi01LjdDMzguMi01LjcgMzkuMi0xMC40IDM5LjItMTEuOUwzOS4yLTY0LjhDMzguOS02OC4yIDQyLjgtNzAgNDUtNjcuOCA1My41LTU5LjEgNjMuNi0yMi45IDM5LjctMiAxNy40IDE3LjYtMTIuNSAxNC4zLTI4LjUgMy40LTQ1LjQtOC4zLTU2LjItMzQuMS00NS43LTU4LjQtMzQuMi04NC45LTEuNC05Mi44IDE4LjEtODQuOSAyOC04MC45IDMyLjUtOTQuMyAyMi4zLTk4LjYgNi44LTEwNS4yLTM2LjQtMTA0LjUtNTYuNS02OS42LTcwLjEtNDYuMS02OS40LTQuNi0zMy4zIDE2LjktNS43IDMzLjMgMzAuNyAyOC44IDUyLjcgNS44IDc1LjYtMTguMiA3NC4zLTYzIDUxLjktODAuNSA0MS44LTg4LjQgMjYuNy04MC43IDI2LjgtNjkuMkwyNi43LTY1LjRDMTkuNi03Mi40IDEwLjItNzYuNSAwLTc2LjUtMjAuMi03Ni41LTM4LTU4LjctMzgtMzguNC0zOC0xOC0yMC4yIDAgMCAwTTI1LjUtMzdDMjQuNy0yMi4yIDEzLjctMTMuMyAwLjQtMTMuM0wtMC4xLTEzLjNDLTE1LjQtMTMuMy0yMy45LTI1LjMtMjMuOS0zOS0yMy45LTU0LjMtMTMuNi02NC0wLjEtNjQgMTQuOS02NCAyNC44LTUzIDI1LjUtNDBMMjUuNS0zN1pcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMC40MjYyMyAwIDAgMC40MjYyMyAzNC45OTkgMzUpXCI+PHBhdGggZD1cIk0xNjAuNyAxOS41Yy0xOC45IDAtMzcuMyAzLjctNTQuNyAxMC45TDc2LjQgMC43Yy0wLjgtMC44LTIuMS0xLTMuMS0wLjRDNDQuNCAxOC4yIDE5LjggNDIuOSAxLjkgNzEuN2MtMC42IDEtMC41IDIuMyAwLjQgMy4xbDI4LjQgMjguNGMtOC41IDE4LjYtMTIuOCAzOC41LTEyLjggNTkuMSAwIDc4LjcgNjQgMTQyLjggMTQyLjggMTQyLjggNzguNyAwIDE0Mi44LTY0IDE0Mi44LTE0Mi44QzMwMy40IDgzLjUgMjM5LjQgMTkuNSAxNjAuNyAxOS41ek0yMTcuMiAxNDguN2w5LjkgNDIuMSA5LjUgNDQuNCAtNDQuMy05LjUgLTQyLjEtOS45TDM2LjcgMTAyLjFjMTQuMy0yOS4zIDM4LjMtNTIuNiA2OC4xLTY1LjhMMjE3LjIgMTQ4Ljd6XCIvPjxwYXRoIGQ9XCJNMjIxLjggMTg3LjRsLTcuNS0zM2MtMjUuOSAxMS45LTQ2LjQgMzIuNC01OC4zIDU4LjNsMzMgNy41QzE5NiAyMDYuMiAyMDcuNyAxOTQuNCAyMjEuOCAxODcuNHpcIi8+PC9nPjwvc3ZnPicsXHJcbiAgICAgICcnLC8vcGluXHJcbiAgICAgICcnLC8vZmF2XHJcbiAgICAgICcnLC8vcHJpbnRcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsNzEuMjY0LDEwNi45MylcIiBkPVwiTTAgMCA2OC42IDQzLjFDNzIgNDUuMyA3My4xIDQyLjggNzEuNiA0MS4xTDE0LjYtMTAuMiAxMS43LTM1LjggMCAwWk04Ny4xIDYyLjktMzMuNCAxNy4yQy00MCAxNS4zLTM5LjggOC44LTM0LjkgNy4zTC00LjctMi4yIDYuOC0zNy42QzguMi00MS41IDkuNC00Mi45IDExLjgtNDMgMTQuMy00MyAxNS4zLTQyLjEgMTcuOS0zOS44IDIwLjktMzYuOSAyNS42LTMyLjMgMzMtMjUuMkw2NC40LTQ4LjRDNzAuMi01MS42IDc0LjMtNDkuOSA3NS44LTQzTDk1LjUgNTQuNEM5Ny42IDYyLjkgOTIuNiA2NS40IDg3LjEgNjIuOVwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMzUuMzMsMTE5Ljg1KVwiIGQ9XCJNMCAwQy0yLjQtNS40LTYuNS05LTEyLjItMTAuNi0xNC4zLTExLjItMTYuMy0xMC43LTE4LjItOS45LTQ0LjQgMS4yLTYzLjMgMTkuNi03NCA0Ni4yLTc0LjggNDguMS03NS4zIDUwLjEtNzUuMiA1MS45LTc1LjIgNTguNy02OS4yIDY1LTYyLjYgNjUuNC02MC44IDY1LjUtNTkuMiA2NC45LTU3LjkgNjMuNy01My4zIDU5LjMtNDkuNiA1NC4zLTQ2LjkgNDguNi00NS40IDQ1LjUtNDYgNDMuMy00OC43IDQxLjEtNDkuMSA0MC43LTQ5LjUgNDAuNC01MCA0MC4xLTUzLjUgMzcuNS01NC4zIDM0LjktNTIuNiAzMC44LTQ5LjggMjQuMi00NS40IDE5LTM5LjMgMTUuMS0zNyAxMy42LTM0LjcgMTIuMi0zMiAxMS41LTI5LjYgMTAuOC0yNy43IDExLjUtMjYuMSAxMy40LTI1LjkgMTMuNi0yNS44IDEzLjktMjUuNiAxNC4xLTIyLjMgMTguOC0xOC42IDE5LjYtMTMuNyAxNi41LTkuNiAxMy45LTUuNiAxMS0xLjggNy44IDAuNyA1LjYgMS4zIDMgMCAwTS0xOC4yIDM2LjdDLTE4LjMgMzUuOS0xOC4zIDM1LjQtMTguNCAzNC45LTE4LjYgMzQtMTkuMiAzMy40LTIwLjIgMzMuNC0yMS4zIDMzLjQtMjEuOSAzNC0yMi4yIDM0LjktMjIuMyAzNS41LTIyLjQgMzYuMi0yMi41IDM2LjktMjMuMiA0MC4zLTI1LjIgNDIuNi0yOC42IDQzLjYtMjkuMSA0My43LTI5LjUgNDMuNy0yOS45IDQzLjgtMzEgNDQuMS0zMi40IDQ0LjItMzIuNCA0NS44LTMyLjUgNDcuMS0zMS41IDQ3LjktMjkuNiA0OC0yOC40IDQ4LjEtMjYuNSA0Ny41LTI1LjQgNDYuOS0yMC45IDQ0LjctMTguNyA0MS42LTE4LjIgMzYuN00tMjUuNSA1MS4yQy0yOCA1Mi4xLTMwLjUgNTIuOC0zMy4yIDUzLjItMzQuNSA1My40LTM1LjQgNTQuMS0zNS4xIDU1LjYtMzQuOSA1Ny0zNCA1Ny41LTMyLjYgNTcuNC0yNCA1Ni42LTE3LjMgNTMuNC0xMi42IDQ2LTEwLjUgNDIuNS05LjIgMzcuNS05LjQgMzMuOC05LjUgMzEuMi05LjkgMzAuNS0xMS40IDMwLjUtMTMuNiAzMC42LTEzLjMgMzIuNC0xMy41IDMzLjctMTMuNyAzNS43LTE0LjIgMzcuNy0xNC43IDM5LjctMTYuMyA0NS40LTE5LjkgNDkuMy0yNS41IDUxLjJNLTM4IDY0LjRDLTM3LjkgNjUuOS0zNyA2Ni41LTM1LjUgNjYuNC0yMy4yIDY1LjgtMTMuOSA2Mi4yLTYuNyA1Mi41LTIuNSA0Ni45LTAuMiAzOS4yIDAgMzIuMiAwIDMxLjEgMCAzMCAwIDI5LTAuMSAyNy44LTAuNiAyNi45LTEuOSAyNi45LTMuMiAyNi45LTMuOSAyNy42LTQgMjktNC4zIDM0LjItNS4zIDM5LjMtNy4zIDQ0LjEtMTEuMiA1My41LTE4LjYgNTguNi0yOC4xIDYxLjEtMzAuNyA2MS43LTMzLjIgNjIuMi0zNS44IDYyLjUtMzcgNjIuNS0zOCA2Mi44LTM4IDY0LjRNMTEuNSA3NC4xQzYuNiA3OC4zIDAuOSA4MC44LTUuMyA4Mi40LTIwLjggODYuNS0zNi41IDg3LjUtNTIuNCA4NS4zLTYwLjUgODQuMi02OC4zIDgyLjEtNzUuNCA3OC4xLTgzLjggNzMuNC04OS42IDY2LjYtOTIuMiA1Ny4xLTk0IDUwLjQtOTQuOSA0My42LTk1LjIgMzYuNi05NS43IDI2LjQtOTUuNCAxNi4zLTkyLjggNi4zLTg5LjgtNS4zLTgzLjItMTMuOC03MS45LTE4LjMtNzAuNy0xOC44LTY5LjUtMTkuNS02OC4zLTIwLTY3LjItMjAuNC02Ni44LTIxLjItNjYuOC0yMi40LTY2LjktMzAuNC02Ni44LTM4LjQtNjYuOC00Ni43LTYzLjktNDMuOS02MS44LTQxLjgtNjAuMy00MC4xLTU1LjktMzUuMS01MS43LTMwLjktNDcuMS0yNi4xLTQ0LjctMjMuNy00NS43LTIzLjgtNDIuMS0yMy44LTM3LjgtMjMuOS0zMS0yNC4xLTI2LjgtMjMuOC0xOC42LTIzLjEtMTAuNi0yMi4xLTIuNy0xOS43IDcuMi0xNi43IDE1LjItMTEuNCAxOS4yLTEuMyAyMC4zIDEuMyAyMS40IDQgMjIgNi44IDI1LjkgMjIuOSAyNS40IDM4LjkgMjIuMiA1NSAyMC42IDYyLjQgMTcuNSA2OSAxMS41IDc0LjFcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsMTMwLjg0LDExMi43KVwiIGQ9XCJNMCAwQy0xLjYgMC45LTkuNCA1LjEtMTAuOCA1LjctMTIuMyA2LjMtMTMuNCA2LjYtMTQuNSA1LTE1LjYgMy40LTE4LjktMC4xLTE5LjktMS4xLTIwLjgtMi4yLTIxLjgtMi4zLTIzLjQtMS40LTI1LTAuNS0zMC4xIDEuNC0zNi4xIDcuMS00MC43IDExLjUtNDMuNyAxNy00NC42IDE4LjYtNDUuNSAyMC4zLTQ0LjYgMjEuMS00My44IDIxLjktNDMgMjIuNi00Mi4xIDIzLjctNDEuMyAyNC42LTQwLjQgMjUuNS00MC4xIDI2LjItMzkuNSAyNy4yLTM5IDI4LjMtMzkuMiAyOS4zLTM5LjYgMzAuMS0zOS45IDMwLjktNDIuOSAzOS00NC4xIDQyLjMtNDUuMyA0NS41LTQ2LjcgNDUtNDcuNiA0NS4xLTQ4LjYgNDUuMS00OS42IDQ1LjMtNTAuNyA0NS4zLTUxLjggNDUuNC01My42IDQ1LTU1LjEgNDMuNS01Ni42IDQxLjktNjEgMzguMi02MS4zIDMwLjItNjEuNiAyMi4zLTU2LjEgMTQuNC01NS4zIDEzLjMtNTQuNSAxMi4yLTQ0LjgtNS4xLTI4LjYtMTIuMS0xMi40LTE5LjItMTIuNC0xNy4xLTkuNC0xNi45LTYuNC0xNi44IDAuMy0xMy40IDEuOC05LjYgMy4zLTUuOSAzLjQtMi43IDMtMiAyLjYtMS4zIDEuNi0wLjkgMCAwTS0yOS43LTM4LjNDLTQwLjQtMzguMy01MC4zLTM1LjEtNTguNi0yOS42TC03OC45LTM2LjEtNzIuMy0xNi41Qy03OC42LTcuOC04Mi4zIDIuOC04Mi4zIDE0LjQtODIuMyA0My40LTU4LjcgNjcuMS0yOS43IDY3LjEtMC42IDY3LjEgMjMgNDMuNCAyMyAxNC40IDIzLTE0LjctMC42LTM4LjMtMjkuNy0zOC4zTS0yOS43IDc3LjZDLTY0LjYgNzcuNi05Mi45IDQ5LjMtOTIuOSAxNC40LTkyLjkgMi40LTg5LjYtOC44LTgzLjktMTguM0wtOTUuMy01Mi4yLTYwLjItNDFDLTUxLjItNDYtNDAuOC00OC45LTI5LjctNDguOSA1LjMtNDguOSAzMy42LTIwLjYgMzMuNiAxNC40IDMzLjYgNDkuMyA1LjMgNzcuNi0yOS43IDc3LjZcIi8+PC9zdmc+JyxcclxuICAgIF07XHJcbiAgICB2YXIgaWNvbj1zdmdbal07XHJcbiAgICB2YXIgY3NzPScgc3R5bGU9XCJ3aWR0aDonK3NpemUrJ3B4O2hlaWdodDonK3NpemUrJ3B4XCIgJztcclxuICAgIGljb249JzxzdmcgY2xhc3M9XCJzb2MtaWNvbi1zZCBpY29uLXNkLXN2Z1wiJytjc3MraWNvbi5zdWJzdHJpbmcoNCk7XHJcbiAgICBpY29uPSc+JytpY29uLnN1YnN0cmluZygwLCBpY29uLmxlbmd0aCAtIDEpO1xyXG4gIH1lbHNle1xyXG4gICAgaWNvbj0nc3R5bGU9XCJkaXNwbGF5OmlubGluZS1ibG9jazt2ZXJ0aWNhbC1hbGlnbjpib3R0b207d2lkdGg6JytzaXplKydweDtoZWlnaHQ6JytzaXplKydweDttYXJnaW46MCA2cHggNnB4IDA7cGFkZGluZzowO291dGxpbmU6bm9uZTtiYWNrZ3JvdW5kOnVybCgnICsgZiArIGZuICsgJykgLScgKyBzaXplICogaiArICdweCAwIG5vLXJlcGVhdDsgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcIidcclxuICB9XHJcbiAgcmV0dXJuIGljb247XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZhdihhKSB7XHJcbiAgdmFyIHRpdGxlID0gZG9jdW1lbnQudGl0bGU7XHJcbiAgdmFyIHVybCA9IGRvY3VtZW50LmxvY2F0aW9uO1xyXG4gIHRyeSB7XHJcbiAgICB3aW5kb3cuZXh0ZXJuYWwuQWRkRmF2b3JpdGUodXJsLCB0aXRsZSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgd2luZG93LnNpZGViYXIuYWRkUGFuZWwodGl0bGUsIHVybCwgJycpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBpZiAodHlwZW9mIChvcGVyYSkgPT0gJ29iamVjdCcgfHwgd2luZG93LnNpZGViYXIpIHtcclxuICAgICAgICBhLnJlbCA9ICdzaWRlYmFyJztcclxuICAgICAgICBhLnRpdGxlID0gdGl0bGU7XHJcbiAgICAgICAgYS51cmwgPSB1cmw7XHJcbiAgICAgICAgYS5ocmVmID0gdXJsO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGFsZXJ0KCfQndCw0LbQvNC40YLQtSBDdHJsLUQsINGH0YLQvtCx0Ysg0LTQvtCx0LDQstC40YLRjCDRgdGC0YDQsNC90LjRhtGDINCyINC30LDQutC70LDQtNC60LgnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbmRfcHJvbW8ocHJvbW8pe1xyXG4gICQuYWpheCh7XHJcbiAgICBtZXRob2Q6IFwicG9zdFwiLFxyXG4gICAgdXJsOiBcIi9hY2NvdW50L3Byb21vXCIsXHJcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgZGF0YToge3Byb21vOiBwcm9tb30sXHJcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgIGlmIChkYXRhLnRpdGxlICE9IG51bGwgJiYgZGF0YS5tZXNzYWdlICE9IG51bGwpIHtcclxuICAgICAgICBvbl9wcm9tbz0kKCcub25fcHJvbW8nKTtcclxuICAgICAgICBpZihvbl9wcm9tby5sZW5ndGg9PTAgfHwgIW9uX3Byb21vLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRhdGEubWVzc2FnZVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIG9uX3Byb21vLnNob3coKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcbiIsIiQoJy5zY3JvbGxfYm94LXRleHQnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG5cclxuICAgJCh0aGlzKS5jbG9zZXN0KCcuc2Nyb2xsX2JveCcpLmZpbmQoJy5zY3JvbGxfYm94LWl0ZW0nKS5yZW1vdmVDbGFzcygnc2Nyb2xsX2JveC1pdGVtLWxvdycpO1xyXG5cclxufSk7IiwidmFyIHBsYWNlaG9sZGVyID0gKGZ1bmN0aW9uKCl7XHJcbiAgZnVuY3Rpb24gb25CbHVyKCl7XHJcbiAgICB2YXIgaW5wdXRWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcbiAgICBpZiAoIGlucHV0VmFsdWUgPT0gXCJcIiApIHtcclxuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdmb2N1c2VkJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvbkZvY3VzKCl7XHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiBydW4ocGFyKSB7XHJcbiAgICB2YXIgZWxzO1xyXG4gICAgaWYoIXBhcilcclxuICAgICAgZWxzPSQoJy5mb3JtLWdyb3VwIFtwbGFjZWhvbGRlcl0nKTtcclxuICAgIGVsc2VcclxuICAgICAgZWxzPSQocGFyKS5maW5kKCcuZm9ybS1ncm91cCBbcGxhY2Vob2xkZXJdJyk7XHJcblxyXG4gICAgZWxzLmZvY3VzKG9uRm9jdXMpO1xyXG4gICAgZWxzLmJsdXIob25CbHVyKTtcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpPGVscy5sZW5ndGg7aSsrKXtcclxuICAgICAgdmFyIGVsPWVscy5lcShpKTtcclxuICAgICAgdmFyIHRleHQgPSBlbC5hdHRyKCdwbGFjZWhvbGRlcicpO1xyXG4gICAgICBlbC5hdHRyKCdwbGFjZWhvbGRlcicsJycpO1xyXG4gICAgICBpZih0ZXh0Lmxlbmd0aDwyKWNvbnRpbnVlO1xyXG4gICAgICAvL2lmKGVsLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykubGVuZ3RoPT0wKXJldHVybjtcclxuXHJcbiAgICAgIHZhciBpbnB1dFZhbHVlID0gZWwudmFsKCk7XHJcbiAgICAgIHZhciBlbF9pZCA9IGVsLmF0dHIoJ2lkJyk7XHJcbiAgICAgIGlmKCFlbF9pZCl7XHJcbiAgICAgICAgZWxfaWQ9J2VsX2Zvcm1zXycrTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKjEwMDAwKTtcclxuICAgICAgICBlbC5hdHRyKCdpZCcsZWxfaWQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBkaXYgPSAkKCc8bGFiZWwvPicse1xyXG4gICAgICAgICdjbGFzcyc6J3BsYWNlaG9sZGVyJyxcclxuICAgICAgICAndGV4dCc6IHRleHQsXHJcbiAgICAgICAgJ2Zvcic6ZWxfaWRcclxuICAgICAgfSk7XHJcbiAgICAgIGVsLmJlZm9yZShkaXYpO1xyXG5cclxuICAgICAgb25Gb2N1cy5iaW5kKGVsKSgpXHJcbiAgICAgIG9uQmx1ci5iaW5kKGVsKSgpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBydW4oKTtcclxuICByZXR1cm4gcnVuO1xyXG59KSgpOyIsInZhciBub3RpZmljYXRpb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gIHZhciBjb250ZWluZXI7XHJcbiAgdmFyIG1vdXNlT3ZlciA9IDA7XHJcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xyXG4gIHZhciBhbmltYXRpb25FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCc7XHJcbiAgdmFyIHRpbWUgPSAxMDAwMDtcclxuXHJcbiAgdmFyIG5vdGlmaWNhdGlvbl9ib3ggPSBmYWxzZTtcclxuICB2YXIgaXNfaW5pdCA9IGZhbHNlO1xyXG4gIHZhciBjb25maXJtX29wdCA9IHtcclxuICAgIHRpdGxlOiBcItCj0LTQsNC70LXQvdC40LVcIixcclxuICAgIHF1ZXN0aW9uOiBcItCS0Ysg0LTQtdC50YHRgtCy0LjRgtC10LvRjNC90L4g0YXQvtGC0LjRgtC1INGD0LTQsNC70LjRgtGMP1wiLFxyXG4gICAgYnV0dG9uWWVzOiBcItCU0LBcIixcclxuICAgIGJ1dHRvbk5vOiBcItCd0LXRglwiLFxyXG4gICAgY2FsbGJhY2tZZXM6IGZhbHNlLFxyXG4gICAgY2FsbGJhY2tObzogZmFsc2UsXHJcbiAgICBvYmo6IGZhbHNlLFxyXG4gICAgYnV0dG9uVGFnOiAnZGl2JyxcclxuICAgIGJ1dHRvblllc0RvcDogJycsXHJcbiAgICBidXR0b25Ob0RvcDogJycsXHJcbiAgfTtcclxuICB2YXIgYWxlcnRfb3B0ID0ge1xyXG4gICAgdGl0bGU6IFwiXCIsXHJcbiAgICBxdWVzdGlvbjogXCLQodC+0L7QsdGJ0LXQvdC40LVcIixcclxuICAgIGJ1dHRvblllczogXCLQlNCwXCIsXHJcbiAgICBjYWxsYmFja1llczogZmFsc2UsXHJcbiAgICBidXR0b25UYWc6ICdkaXYnLFxyXG4gICAgb2JqOiBmYWxzZSxcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiB0ZXN0SXBob25lKCkge1xyXG4gICAgaWYgKCEvKGlQaG9uZXxpUGFkfGlQb2QpLiooT1MgMTEpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSByZXR1cm5cclxuICAgIG5vdGlmaWNhdGlvbl9ib3guY3NzKCdwb3NpdGlvbicsICdhYnNvbHV0ZScpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5jc3MoJ3RvcCcsICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICBpc19pbml0ID0gdHJ1ZTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3ggPSAkKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG4gICAgaWYgKG5vdGlmaWNhdGlvbl9ib3gubGVuZ3RoID4gMClyZXR1cm47XHJcblxyXG4gICAgJCgnYm9keScpLmFwcGVuZChcIjxkaXYgY2xhc3M9J25vdGlmaWNhdGlvbl9ib3gnPjwvZGl2PlwiKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3ggPSAkKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgJy5ub3RpZnlfY29udHJvbCcsIGNsb3NlTW9kYWwpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCAnLm5vdGlmeV9jbG9zZScsIGNsb3NlTW9kYWwpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCBjbG9zZU1vZGFsRm9uKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XHJcbiAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICAkKCcubm90aWZpY2F0aW9uX2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKCcnKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xvc2VNb2RhbEZvbihlKSB7XHJcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgaWYgKHRhcmdldC5jbGFzc05hbWUgPT0gXCJub3RpZmljYXRpb25fYm94XCIpIHtcclxuICAgICAgY2xvc2VNb2RhbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm5vdGlmaWNhdGlvbl9jbG9zZScsIF9jbG9zZVBvcHVwKTtcclxuICAgICQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkVudGVyKTtcclxuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcclxuICB9O1xyXG5cclxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGlmIChldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwgIT0gbnVsbCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGltZXJDbGVhckFsbCk7XHJcbiAgICAgIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcclxuICAgICAgdmFyIG9wdGlvbiA9ICQodGhpcykuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmIChvcHRpb24udGltZXIpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAxO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgdmFyIG9wdGlvbiA9ICR0aGlzLmRhdGEoJ29wdGlvbicpO1xyXG4gICAgICBpZiAob3B0aW9uLnRpbWUgPiAwKSB7XHJcbiAgICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKG9wdGlvbi5jbG9zZSksIG9wdGlvbi50aW1lIC0gMTUwMCArIDEwMCAqIGkpO1xyXG4gICAgICAgICR0aGlzLmRhdGEoJ29wdGlvbicsIG9wdGlvbilcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAwO1xyXG4gIH07XHJcblxyXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgaWYgKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKTtcclxuICAgICR0aGlzLm9uKGFuaW1hdGlvbkVuZCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xyXG4gICAgfSk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2hpZGUnKVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGFsZXJ0KGRhdGEpIHtcclxuICAgIGlmICghZGF0YSlkYXRhID0ge307XHJcbiAgICBkYXRhID0gb2JqZWN0cyhhbGVydF9vcHQsIGRhdGEpO1xyXG5cclxuICAgIGlmICghaXNfaW5pdClpbml0KCk7XHJcbiAgICB0ZXN0SXBob25lKCk7XHJcblxyXG4gICAgbm90eWZ5X2NsYXNzID0gJ25vdGlmeV9ib3ggJztcclxuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XHJcblxyXG4gICAgYm94X2h0bWwgPSAnPGRpdiBjbGFzcz1cIicgKyBub3R5ZnlfY2xhc3MgKyAnXCI+JztcclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sICs9IGRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGlmIChkYXRhLmJ1dHRvblllcyB8fCBkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzwnICsgZGF0YS5idXR0b25UYWcgKyAnIGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIiAnICsgZGF0YS5idXR0b25ZZXNEb3AgKyAnPicgKyBkYXRhLmJ1dHRvblllcyArICc8LycgKyBkYXRhLmJ1dHRvblRhZyArICc+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnICsgZGF0YS5idXR0b25UYWcgKyAnIGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiICcgKyBkYXRhLmJ1dHRvbk5vRG9wICsgJz4nICsgZGF0YS5idXR0b25ObyArICc8LycgKyBkYXRhLmJ1dHRvblRhZyArICc+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9XHJcbiAgICA7XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xyXG5cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgfSwgMTAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xyXG4gICAgZGF0YSA9IG9iamVjdHMoY29uZmlybV9vcHQsIGRhdGEpO1xyXG4gICAgaWYgKHR5cGVvZihkYXRhLmNhbGxiYWNrWWVzKSA9PSAnc3RyaW5nJykge1xyXG4gICAgICB2YXIgY29kZSA9ICdkYXRhLmNhbGxiYWNrWWVzID0gZnVuY3Rpb24oKXsnK2RhdGEuY2FsbGJhY2tZZXMrJ30nO1xyXG4gICAgICBldmFsKGNvZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNfaW5pdClpbml0KCk7XHJcbiAgICB0ZXN0SXBob25lKCk7XHJcbiAgICAvL2JveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XHJcblxyXG4gICAgbm90eWZ5X2NsYXNzID0gJ25vdGlmeV9ib3ggJztcclxuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XHJcblxyXG4gICAgYm94X2h0bWwgPSAnPGRpdiBjbGFzcz1cIicgKyBub3R5ZnlfY2xhc3MgKyAnXCI+JztcclxuXHJcbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCArPSBkYXRhLnRpdGxlO1xyXG4gICAgYm94X2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcclxuICAgIGJveF9odG1sICs9IGRhdGEucXVlc3Rpb247XHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICBpZiAoZGF0YS5idXR0b25ZZXMgfHwgZGF0YS5idXR0b25Obykge1xyXG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xyXG5cclxuICAgIGlmIChkYXRhLmNhbGxiYWNrWWVzICE9IGZhbHNlKSB7XHJcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5feWVzJykub24oJ2NsaWNrJywgZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoZGF0YS5jYWxsYmFja05vICE9IGZhbHNlKSB7XHJcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrTm8uYmluZChkYXRhLm9iaikpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LCAxMDApXHJcblxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcclxuICAgIGlmICghZGF0YSlkYXRhID0ge307XHJcbiAgICB2YXIgb3B0aW9uID0ge3RpbWU6IChkYXRhLnRpbWUgfHwgZGF0YS50aW1lID09PSAwKSA/IGRhdGEudGltZSA6IHRpbWV9O1xyXG4gICAgaWYgKCFjb250ZWluZXIpIHtcclxuICAgICAgY29udGVpbmVyID0gJCgnPHVsLz4nLCB7XHJcbiAgICAgICAgJ2NsYXNzJzogJ25vdGlmaWNhdGlvbl9jb250YWluZXInXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgJCgnYm9keScpLmFwcGVuZChjb250ZWluZXIpO1xyXG4gICAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbGkgPSAkKCc8bGkvPicsIHtcclxuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25faXRlbSdcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChkYXRhLnR5cGUpIHtcclxuICAgICAgbGkuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9pdGVtLScgKyBkYXRhLnR5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjbG9zZSA9ICQoJzxzcGFuLz4nLCB7XHJcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2Nsb3NlJ1xyXG4gICAgfSk7XHJcbiAgICBvcHRpb24uY2xvc2UgPSBjbG9zZTtcclxuICAgIGxpLmFwcGVuZChjbG9zZSk7XHJcblxyXG4gICAgdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgdGl0bGUgPSAkKCc8aDUvPicsIHtcclxuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxyXG4gICAgICB9KTtcclxuICAgICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcclxuICAgICAgY29udGVudC5hcHBlbmQodGl0bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0ZXh0ID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGV4dFwiXHJcbiAgICB9KTtcclxuICAgIHRleHQuaHRtbChkYXRhLm1lc3NhZ2UpO1xyXG5cclxuICAgIGlmIChkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXHJcbiAgICAgIH0pO1xyXG4gICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xyXG4gICAgICB2YXIgd3JhcCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgICBjbGFzczogXCJ3cmFwXCJcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB3cmFwLmFwcGVuZChpbWcpO1xyXG4gICAgICB3cmFwLmFwcGVuZCh0ZXh0KTtcclxuICAgICAgY29udGVudC5hcHBlbmQod3JhcCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh0ZXh0KTtcclxuICAgIH1cclxuICAgIGxpLmFwcGVuZChjb250ZW50KTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XHJcbiAgICAvLyAgIHZhciB0aXRsZSA9ICQoJzxwLz4nLCB7XHJcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcclxuICAgIC8vICAgfSk7XHJcbiAgICAvLyAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XHJcbiAgICAvLyAgIGxpLmFwcGVuZCh0aXRsZSk7XHJcbiAgICAvLyB9XHJcbiAgICAvL1xyXG4gICAgLy8gaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcclxuICAgIC8vICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcclxuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcclxuICAgIC8vICAgfSk7XHJcbiAgICAvLyAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xyXG4gICAgLy8gICBsaS5hcHBlbmQoaW1nKTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xyXG4gICAgLy8gICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcclxuICAgIC8vIH0pO1xyXG4gICAgLy8gY29udGVudC5odG1sKGRhdGEubWVzc2FnZSk7XHJcbiAgICAvL1xyXG4gICAgLy8gbGkuYXBwZW5kKGNvbnRlbnQpO1xyXG4gICAgLy9cclxuICAgIGNvbnRlaW5lci5hcHBlbmQobGkpO1xyXG5cclxuICAgIGlmIChvcHRpb24udGltZSA+IDApIHtcclxuICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKGNsb3NlKSwgb3B0aW9uLnRpbWUpO1xyXG4gICAgfVxyXG4gICAgbGkuZGF0YSgnb3B0aW9uJywgb3B0aW9uKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGFsZXJ0OiBhbGVydCxcclxuICAgIGNvbmZpcm06IGNvbmZpcm0sXHJcbiAgICBub3RpZmk6IG5vdGlmaSxcclxuICB9O1xyXG5cclxufSkoKTtcclxuXHJcblxyXG4kKCdbcmVmPXBvcHVwXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBlbCA9ICQoJHRoaXMuYXR0cignaHJlZicpKTtcclxuICBkYXRhID0gZWwuZGF0YSgpO1xyXG5cclxuICBkYXRhLnF1ZXN0aW9uID0gZWwuaHRtbCgpO1xyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7XHJcblxyXG4kKCdbcmVmPWNvbmZpcm1dJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gIGVsID0gJCgkdGhpcy5hdHRyKCdocmVmJykpO1xyXG4gIGRhdGEgPSBlbC5kYXRhKCk7XHJcbiAgZGF0YS5xdWVzdGlvbiA9IGVsLmh0bWwoKTtcclxuICBub3RpZmljYXRpb24uY29uZmlybShkYXRhKTtcclxufSk7XHJcblxyXG5cclxuJCgnLmRpc2FibGVkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gIGRhdGEgPSAkdGhpcy5kYXRhKCk7XHJcbiAgaWYgKGRhdGFbJ2J1dHRvbl95ZXMnXSkge1xyXG4gICAgZGF0YVsnYnV0dG9uWWVzJ10gPSBkYXRhWydidXR0b25feWVzJ107XHJcbiAgfVxyXG4gIGlmIChkYXRhWydidXR0b25feWVzJ10gPT09IGZhbHNlKSB7XHJcbiAgICBkYXRhWydidXR0b25ZZXMnXSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG59KTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm1vZGFsc19vcGVuJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuXHJcbiAgICAvL9C/0YDQuCDQvtGC0LrRgNGL0YLQuNC4INGE0L7RgNC80Ysg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuCDQt9Cw0LrRgNGL0YLRjCwg0LXRgdC70Lgg0L7RgtGA0YvRgtC+IC0g0L/QvtC/0LDQvyDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjyDQutGD0L/QvtC90LAg0LHQtdC3INGA0LXQs9C40YHRgtGA0LDRhtC40LhcclxuICAgIHZhciBwb3B1cCA9ICQoXCJhW2hyZWY9JyNzaG93cHJvbW9jb2RlLW5vcmVnaXN0ZXInXVwiKS5kYXRhKCdwb3B1cCcpO1xyXG4gICAgaWYgKHBvcHVwKSB7XHJcbiAgICAgIHBvcHVwLmNsb3NlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwb3B1cCA9ICQoJ2Rpdi5wb3B1cF9jb250LCBkaXYucG9wdXBfYmFjaycpO1xyXG4gICAgICBpZiAocG9wdXApIHtcclxuICAgICAgICBwb3B1cC5oaWRlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgaHJlZiA9IHRoaXMuaHJlZi5zcGxpdCgnIycpO1xyXG4gICAgaHJlZiA9IGhyZWZbaHJlZi5sZW5ndGggLSAxXTtcclxuICAgIHZhciBub3R5Q2xhc3MgPSAkKHRoaXMpLmRhdGEoJ25vdHljbGFzcycpO1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgIGJ1dHRvblllczogZmFsc2UsXHJcbiAgICAgIG5vdHlmeV9jbGFzczogXCJsb2FkaW5nIFwiICsgKGhyZWYuaW5kZXhPZigndmlkZW8nKSA9PT0gMCA/ICdtb2RhbHMtZnVsbF9zY3JlZW4nIDogJ25vdGlmeV93aGl0ZScpICsgJyAnICsgbm90eUNsYXNzLFxyXG4gICAgICBxdWVzdGlvbjogJydcclxuICAgIH07XHJcbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcblxyXG4gICAgJC5nZXQoJy8nICsgaHJlZiwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgJCgnLm5vdGlmeV9ib3gnKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKGRhdGEuaHRtbCk7XHJcbiAgICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcclxuICAgIH0sICdqc29uJyk7XHJcblxyXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KVxyXG59KCkpO1xyXG4iLCIkKCcuZm9vdGVyLW1lbnUtdGl0bGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKSkge1xyXG4gICAgJHRoaXMucmVtb3ZlQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKVxyXG4gIH0gZWxzZSB7XHJcbiAgICAkKCcuZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpO1xyXG4gIH1cclxuXHJcbn0pO1xyXG4iLCIkKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBzdGFyTm9taW5hdGlvbihpbmRleCkge1xyXG4gICAgdmFyIHN0YXJzID0gJChcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIik7XHJcbiAgICBzdGFycy5hZGRDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcclxuICAgICAgc3RhcnMuZXEoaSkucmVtb3ZlQ2xhc3MoXCJyYXRpbmctc3Rhci1vcGVuXCIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJChkb2N1bWVudCkub24oXCJtb3VzZW92ZXJcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuICB9KS5vbihcIm1vdXNlbGVhdmVcIiwgXCIucmF0aW5nLXdyYXBwZXJcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIHN0YXJOb21pbmF0aW9uKCQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCkpO1xyXG4gIH0pLm9uKFwiY2xpY2tcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuXHJcbiAgICAkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuICB9KTtcclxufSk7XHJcbiIsIi8v0LjQt9Cx0YDQsNC90L3QvtC1XHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAkKFwiLmZhdm9yaXRlLWxpbmtcIikub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICB2YXIgc2VsZiA9ICQodGhpcyk7XHJcbiAgICB2YXIgdHlwZSA9IHNlbGYuYXR0cihcImRhdGEtc3RhdGVcIiksXHJcbiAgICAgIGFmZmlsaWF0ZV9pZCA9IHNlbGYuYXR0cihcImRhdGEtYWZmaWxpYXRlLWlkXCIpO1xyXG5cclxuICAgIGlmICghYWZmaWxpYXRlX2lkKSB7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgIHRpdGxlOiBcItCd0LXQvtCx0YXQvtC00LjQvNC+INCw0LLRgtC+0YDQuNC30L7QstCw0YLRjNGB0Y9cIixcclxuICAgICAgICBtZXNzYWdlOiAn0JTQvtCx0LDQstC40YLRjCDQsiDQuNC30LHRgNCw0L3QvdC+0LUg0LzQvtC20LXRgiDRgtC+0LvRjNC60L4g0LDQstGC0L7RgNC40LfQvtCy0LDQvdC90YvQuSDQv9C+0LvRjNC30L7QstCw0YLQtdC70YwuPC9icj4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIiNsb2dpblwiIGNsYXNzPVwibW9kYWxzX29wZW5cIj7QktGF0L7QtDwvYT4gIC8gPGEgaHJlZj1cIiNyZWdpc3RyYXRpb25cIiBjbGFzcz1cIm1vZGFsc19vcGVuXCI+0KDQtdCz0LjRgdGC0YDQsNGG0LjRjzwvYT4nLFxyXG4gICAgICAgIHR5cGU6ICdlcnInXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZWxmLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgc2VsZi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuXHJcbiAgICAvKmlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgIHNlbGYuZmluZChcIi5pdGVtX2ljb25cIikucmVtb3ZlQ2xhc3MoXCJtdXRlZFwiKTtcclxuICAgICB9Ki9cclxuXHJcbiAgICAkLnBvc3QoXCIvYWNjb3VudC9mYXZvcml0ZXNcIiwge1xyXG4gICAgICBcInR5cGVcIjogdHlwZSxcclxuICAgICAgXCJhZmZpbGlhdGVfaWRcIjogYWZmaWxpYXRlX2lkXHJcbiAgICB9LCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICBpZiAoZGF0YS5lcnJvcikge1xyXG4gICAgICAgIHNlbGYuZmluZCgnc3ZnJykucmVtb3ZlQ2xhc3MoXCJzcGluXCIpO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6IGRhdGEuZXJyb3IsIHR5cGU6ICdlcnInLCAndGl0bGUnOiAoZGF0YS50aXRsZSA/IGRhdGEudGl0bGUgOiBmYWxzZSl9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgIG1lc3NhZ2U6IGRhdGEubXNnLFxyXG4gICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAndGl0bGUnOiAoZGF0YS50aXRsZSA/IGRhdGEudGl0bGUgOiBmYWxzZSlcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwiLml0ZW1faWNvblwiKS5hZGRDbGFzcyhcInN2Zy1uby1maWxsXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzZWxmLmF0dHIoe1xyXG4gICAgICAgIFwiZGF0YS1zdGF0ZVwiOiBkYXRhW1wiZGF0YS1zdGF0ZVwiXSxcclxuICAgICAgICBcImRhdGEtb3JpZ2luYWwtdGl0bGVcIjogZGF0YVsnZGF0YS1vcmlnaW5hbC10aXRsZSddXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gc3ZnLW5vLWZpbGxcIik7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRlbGV0ZVwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpblwiKS5hZGRDbGFzcyhcInN2Zy1uby1maWxsXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSwgJ2pzb24nKS5mYWlsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgbWVzc2FnZTogXCI8Yj7QotC10YXQvdC40YfQtdGB0LrQuNC1INGA0LDQsdC+0YLRiyE8L2I+PGJyPtCSINC00LDQvdC90YvQuSDQvNC+0LzQtdC90YIg0LLRgNC10LzQtdC90LhcIiArXHJcbiAgICAgICAgXCIg0L/RgNC+0LjQt9Cy0LXQtNGR0L3QvdC+0LUg0LTQtdC50YHRgtCy0LjQtSDQvdC10LLQvtC30LzQvtC20L3Qvi4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtS5cIiArXHJcbiAgICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIiwgdHlwZTogJ2VycidcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLmFkZENsYXNzKFwic3ZnLW5vLWZpbGxcIik7XHJcbiAgICAgIH1cclxuICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpblwiKTtcclxuICAgIH0pXHJcbiAgfSk7XHJcbn0pO1xyXG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLnNjcm9sbF90bycpLmNsaWNrKGZ1bmN0aW9uIChlKSB7IC8vINC70L7QstC40Lwg0LrQu9C40Log0L/QviDRgdGB0YvQu9C60LUg0YEg0LrQu9Cw0YHRgdC+0LwgZ29fdG9cclxuICAgIHZhciBzY3JvbGxfZWwgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTsgLy8g0LLQvtC30YzQvNC10Lwg0YHQvtC00LXRgNC20LjQvNC+0LUg0LDRgtGA0LjQsdGD0YLQsCBocmVmLCDQtNC+0LvQttC10L0g0LHRi9GC0Ywg0YHQtdC70LXQutGC0L7RgNC+0LwsINGCLtC1LiDQvdCw0L/RgNC40LzQtdGAINC90LDRh9C40L3QsNGC0YzRgdGPINGBICMg0LjQu9C4IC5cclxuICAgIHNjcm9sbF9lbCA9ICQoc2Nyb2xsX2VsKTtcclxuICAgIGlmIChzY3JvbGxfZWwubGVuZ3RoICE9IDApIHsgLy8g0L/RgNC+0LLQtdGA0LjQvCDRgdGD0YnQtdGB0YLQstC+0LLQsNC90LjQtSDRjdC70LXQvNC10L3RgtCwINGH0YLQvtCx0Ysg0LjQt9Cx0LXQttCw0YLRjCDQvtGI0LjQsdC60LhcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiBzY3JvbGxfZWwub2Zmc2V0KCkudG9wIC0gJCgnI2hlYWRlcj4qJykuZXEoMCkuaGVpZ2h0KCkgLSA1MH0sIDUwMCk7IC8vINCw0L3QuNC80LjRgNGD0LXQvCDRgdC60YDQvtC+0LvQuNC90LMg0Log0Y3Qu9C10LzQtdC90YLRgyBzY3JvbGxfZWxcclxuICAgICAgaWYgKHNjcm9sbF9lbC5oYXNDbGFzcygnYWNjb3JkaW9uJykgJiYgIXNjcm9sbF9lbC5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAgICAgc2Nyb2xsX2VsLmZpbmQoJy5hY2NvcmRpb24tY29udHJvbCcpLmNsaWNrKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTsgLy8g0LLRi9C60LvRjtGH0LDQtdC8INGB0YLQsNC90LTQsNGA0YLQvdC+0LUg0LTQtdC50YHRgtCy0LjQtVxyXG4gIH0pO1xyXG59KTtcclxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICQoXCJib2R5XCIpLm9uKCdjbGljaycsICcuc2V0X2NsaXBib2FyZCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgY29weVRvQ2xpcGJvYXJkKCR0aGlzLmRhdGEoJ2NsaXBib2FyZCcpLCAkdGhpcy5kYXRhKCdjbGlwYm9hcmQtbm90aWZ5JykpO1xyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBjb3B5VG9DbGlwYm9hcmQoY29kZSwgbXNnKSB7XHJcbiAgICB2YXIgJHRlbXAgPSAkKFwiPGlucHV0PlwiKTtcclxuICAgICQoXCJib2R5XCIpLmFwcGVuZCgkdGVtcCk7XHJcbiAgICAkdGVtcC52YWwoY29kZSkuc2VsZWN0KCk7XHJcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIik7XHJcbiAgICAkdGVtcC5yZW1vdmUoKTtcclxuXHJcbiAgICBpZiAoIW1zZykge1xyXG4gICAgICBtc2cgPSBcItCU0LDQvdC90YvQtSDRg9GB0L/QtdGI0L3QviDRgdC60L7Qv9C40YDQvtCy0LDQvdGLINCyINCx0YPRhNC10YAg0L7QsdC80LXQvdCwXCI7XHJcbiAgICB9XHJcbiAgICBub3RpZmljYXRpb24ubm90aWZpKHsndHlwZSc6ICdpbmZvJywgJ21lc3NhZ2UnOiBtc2csICd0aXRsZSc6ICfQo9GB0L/QtdGI0L3Qvid9KVxyXG4gIH1cclxuXHJcbiAgJChcImJvZHlcIikub24oJ2NsaWNrJywgXCJpbnB1dC5saW5rXCIsIGZ1bmN0aW9uICgpIHtcdC8vINC/0L7Qu9GD0YfQtdC90LjQtSDRhNC+0LrRg9GB0LAg0YLQtdC60YHRgtC+0LLRi9C8INC/0L7Qu9C10Lwt0YHRgdGL0LvQutC+0LlcclxuICAgICQodGhpcykuc2VsZWN0KCk7XHJcbiAgfSk7XHJcbn0pO1xyXG4iLCIvL9GB0LrQsNGH0LjQstCw0L3QuNC1INC60LDRgNGC0LjQvdC+0LpcclxuKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKSB7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICB2YXIgaW1nID0gZGF0YS5pbWc7XHJcbiAgICBpbWcud3JhcCgnPGRpdiBjbGFzcz1cImRvd25sb2FkXCI+PC9kaXY+Jyk7XHJcbiAgICB2YXIgd3JhcCA9IGltZy5wYXJlbnQoKTtcclxuICAgICQoJy5kb3dubG9hZF90ZXN0JykuYXBwZW5kKGRhdGEuZWwpO1xyXG4gICAgc2l6ZSA9IGRhdGEuZWwud2lkdGgoKSArIFwieFwiICsgZGF0YS5lbC5oZWlnaHQoKTtcclxuXHJcbiAgICB3PWRhdGEuZWwud2lkdGgoKSowLjg7XHJcbiAgICBpbWdcclxuICAgICAgLmhlaWdodCgnYXV0bycpXHJcbiAgICAgIC8vLndpZHRoKHcpXHJcbiAgICAgIC5jc3MoJ21heC13aWR0aCcsJzk5JScpO1xyXG5cclxuXHJcbiAgICBkYXRhLmVsLnJlbW92ZSgpO1xyXG4gICAgd3JhcC5hcHBlbmQoJzxzcGFuPicgKyBzaXplICsgJzwvc3Bhbj4gPGEgaHJlZj1cIicgKyBkYXRhLnNyYyArICdcIiBkb3dubG9hZD7QodC60LDRh9Cw0YLRjDwvYT4nKTtcclxuICB9XHJcblxyXG4gIHZhciBpbWdzID0gJCgnLmRvd25sb2Fkc19pbWcgaW1nJyk7XHJcbiAgaWYoaW1ncy5sZW5ndGg9PTApcmV0dXJuO1xyXG5cclxuICAkKCdib2R5JykuYXBwZW5kKCc8ZGl2IGNsYXNzPWRvd25sb2FkX3Rlc3Q+PC9kaXY+Jyk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgaW1nID0gaW1ncy5lcShpKTtcclxuICAgIHZhciBzcmMgPSBpbWcuYXR0cignc3JjJyk7XHJcbiAgICBpbWFnZSA9ICQoJzxpbWcvPicsIHtcclxuICAgICAgc3JjOiBzcmNcclxuICAgIH0pO1xyXG4gICAgZGF0YSA9IHtcclxuICAgICAgc3JjOiBzcmMsXHJcbiAgICAgIGltZzogaW1nLFxyXG4gICAgICBlbDogaW1hZ2VcclxuICAgIH07XHJcbiAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxyXG4gIH1cclxufSkoKTtcclxuXHJcbi8v0YfRgtC+INCxINC40YTRgNC10LnQvNGLINC4INC60LDRgNGC0LjQvdC60Lgg0L3QtSDQstGL0LvQsNC30LjQu9C4XHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgLyptX3cgPSAkKCcudGV4dC1jb250ZW50Jykud2lkdGgoKVxyXG4gICBpZiAobV93IDwgNTApbV93ID0gc2NyZWVuLndpZHRoIC0gNDAqL1xyXG4gIHZhciBtdz1zY3JlZW4ud2lkdGgtNDA7XHJcblxyXG4gIGZ1bmN0aW9uIG9wdGltYXNlKGVsKXtcclxuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnQoKTtcclxuICAgIGlmKHBhcmVudC5sZW5ndGg9PTAgfHwgcGFyZW50WzBdLnRhZ05hbWU9PVwiQVwiKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYoZWwuaGFzQ2xhc3MoJ25vX29wdG9taXplJykpcmV0dXJuO1xyXG5cclxuICAgIG1fdyA9IHBhcmVudC53aWR0aCgpLTMwO1xyXG4gICAgdmFyIHc9ZWwud2lkdGgoKTtcclxuXHJcbiAgICAvL9Cx0LXQtyDRjdGC0L7Qs9C+INC/0LvRjtGJ0LjRgiDQsdCw0L3QtdGA0Ysg0LIg0LDQutCw0YDQtNC40L7QvdC1XHJcbiAgICBpZih3PDMgfHwgbV93PDMpe1xyXG4gICAgICBlbFxyXG4gICAgICAgIC5oZWlnaHQoJ2F1dG8nKVxyXG4gICAgICAgIC5jc3MoJ21heC13aWR0aCcsJzk5JScpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZWwud2lkdGgoJ2F1dG8nKTtcclxuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSU1HXCIgJiYgdz5lbC53aWR0aCgpKXc9ZWwud2lkdGgoKTtcclxuXHJcbiAgICBpZiAobXc+NTAgJiYgbV93ID4gbXcpbV93ID0gbXc7XHJcbiAgICBpZiAodz5tX3cpIHtcclxuICAgICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIil7XHJcbiAgICAgICAgayA9IHcgLyBtX3c7XHJcbiAgICAgICAgZWwuaGVpZ2h0KGVsLmhlaWdodCgpIC8gayk7XHJcbiAgICAgIH1cclxuICAgICAgZWwud2lkdGgobV93KVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGVsLndpZHRoKHcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICB2YXIgZWw9JCh0aGlzKTtcclxuICAgIG9wdGltYXNlKGVsKTtcclxuICB9XHJcblxyXG4gIHZhciBwID0gJCgnLmNvbnRlbnQtd3JhcCBpbWcsLmNvbnRlbnQtd3JhcCBpZnJhbWUnKTtcclxuICAkKCcuY29udGVudC13cmFwIGltZzpub3QoLm5vX29wdG9taXplKScpLmhlaWdodCgnYXV0bycpO1xyXG4gIC8vJCgnLmNvbnRhaW5lciBpbWcnKS53aWR0aCgnYXV0bycpO1xyXG4gIGZvciAoaSA9IDA7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBlbCA9IHAuZXEoaSk7XHJcbiAgICBpZihlbFswXS50YWdOYW1lPT1cIklGUkFNRVwiKSB7XHJcbiAgICAgIG9wdGltYXNlKGVsKTtcclxuICAgIH1lbHNle1xyXG4gICAgICB2YXIgc3JjPWVsLmF0dHIoJ3NyYycpO1xyXG4gICAgICBpbWFnZSA9ICQoJzxpbWcvPicsIHtcclxuICAgICAgICBzcmM6IHNyY1xyXG4gICAgICB9KTtcclxuICAgICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChlbCkpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG5cclxuLy/Qn9GA0L7QstC10YDQutCwINCx0LjRgtGLINC60LDRgNGC0LjQvdC+0LouXHJcbi8vICEhISEhIVxyXG4vLyDQndGD0LbQvdC+INC/0YDQvtCy0LXRgNC40YLRjC4g0JLRi9C30YvQstCw0LvQviDQs9C70Y7QutC4INC/0YDQuCDQsNCy0YLQvtGA0LfQsNGG0LjQuCDRh9C10YDQtdC3INCk0JEg0L3QsCDRgdCw0YTQsNGA0LhcclxuLy8gISEhISEhXHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgaWYoZGF0YS50YWdOYW1lKXtcclxuICAgICAgZGF0YT0kKGRhdGEpLmRhdGEoJ2RhdGEnKTtcclxuICAgIH1cclxuICAgIHZhciBpbWc9ZGF0YS5pbWc7XHJcbiAgICAvL3ZhciB0bj1pbWdbMF0udGFnTmFtZTtcclxuICAgIC8vaWYgKHRuIT0nSU1HJ3x8dG4hPSdESVYnfHx0biE9J1NQQU4nKXJldHVybjtcclxuICAgIGlmKGRhdGEudHlwZT09MCkge1xyXG4gICAgICBpbWcuYXR0cignc3JjJywgZGF0YS5zcmMpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcrZGF0YS5zcmMrJyknKTtcclxuICAgICAgaW1nLnJlbW92ZUNsYXNzKCdub19hdmEnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHRlc3RJbWcoaW1ncyxub19pbWcpe1xyXG4gICAgaWYoIWltZ3MgfHwgaW1ncy5sZW5ndGg9PTApcmV0dXJuO1xyXG5cclxuICAgIGlmKCFub19pbWcpbm9faW1nPScvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJztcclxuXHJcbiAgICBmb3IgKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspe1xyXG4gICAgICB2YXIgaW1nPWltZ3MuZXEoaSk7XHJcbiAgICAgIGlmKGltZy5oYXNDbGFzcygnbm9fYXZhJykpe1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZGF0YT17XHJcbiAgICAgICAgaW1nOmltZ1xyXG4gICAgICB9O1xyXG4gICAgICB2YXIgc3JjO1xyXG4gICAgICBpZihpbWdbMF0udGFnTmFtZT09XCJJTUdcIil7XHJcbiAgICAgICAgZGF0YS50eXBlPTA7XHJcbiAgICAgICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcclxuICAgICAgICBpbWcuYXR0cignc3JjJyxub19pbWcpO1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICBkYXRhLnR5cGU9MTtcclxuICAgICAgICBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xyXG4gICAgICAgIGlmKCFzcmMpY29udGludWU7XHJcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCd1cmwoXCInLCcnKTtcclxuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ1wiKScsJycpO1xyXG4gICAgICAgIC8v0LIg0YHRhNGE0LDRgNC4INCyINC80LDQuiDQvtGBINCx0LXQtyDQutC+0LLRi9GH0LXQui4g0LLQtdC30LTQtSDRgSDQutCw0LLRi9GH0LrQsNC80LhcclxuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybCgnLCcnKTtcclxuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJyknLCcnKTtcclxuICAgICAgICBpbWcuYWRkQ2xhc3MoJ25vX2F2YScpO1xyXG4gICAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytub19pbWcrJyknKTtcclxuICAgICAgfVxyXG4gICAgICBkYXRhLnNyYz1zcmM7XHJcbiAgICAgIHZhciBpbWFnZT0kKCc8aW1nLz4nLHtcclxuICAgICAgICBzcmM6c3JjXHJcbiAgICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSk7XHJcbiAgICAgIGltYWdlLmRhdGEoJ2RhdGEnLGRhdGEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy/RgtC10YHRgiDQu9C+0LPQviDQvNCw0LPQsNC30LjQvdCwXHJcbiAgdmFyIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJyk7XHJcbiAgaW1ncz1pbWdzLmZpbmQoJy5sb2dvIGltZycpO1xyXG4gIHRlc3RJbWcoaW1ncywnL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZycpO1xyXG5cclxuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxyXG4gIGltZ3M9JCgnLmNvbW1lbnQtcGhvdG8sLnNjcm9sbF9ib3gtYXZhdGFyJyk7XHJcbiAgdGVzdEltZyhpbWdzLCcvaW1hZ2VzL25vX2F2YV9zcXVhcmUucG5nJyk7XHJcbn0pO1xyXG4iLCIvL9C10YHQu9C4INC+0YLQutGA0YvRgtC+INC60LDQuiDQtNC+0YfQtdGA0L3QtdC1XHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgaWYgKCF3aW5kb3cub3BlbmVyKXJldHVybjtcclxuICB0cnkge1xyXG4gICAgaHJlZiA9IHdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZjtcclxuICAgIGlmIChcclxuICAgICAgaHJlZi5pbmRleE9mKCdhY2NvdW50L29mZmxpbmUnKSA+IDBcclxuICAgICkge1xyXG4gICAgICB3aW5kb3cucHJpbnQoKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChkb2N1bWVudC5yZWZlcnJlci5pbmRleE9mKCdzZWNyZXRkaXNjb3VudGVyJykgPCAwKXJldHVybjtcclxuXHJcbiAgICBpZiAoXHJcbiAgICAgIGhyZWYuaW5kZXhPZignc29jaWFscycpID4gMCB8fFxyXG4gICAgICBocmVmLmluZGV4T2YoJ2xvZ2luJykgPiAwIHx8XHJcbiAgICAgIGhyZWYuaW5kZXhPZignYWRtaW4nKSA+IDAgfHxcclxuICAgICAgaHJlZi5pbmRleE9mKCdhY2NvdW50JykgPiAwXHJcbiAgICApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChocmVmLmluZGV4T2YoJ3N0b3JlJykgPiAwIHx8IGhyZWYuaW5kZXhPZignY291cG9uJykgPiAwIHx8IGhyZWYuaW5kZXhPZignc2V0dGluZ3MnKSA+IDApIHtcclxuICAgICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZiA9IGxvY2F0aW9uLmhyZWY7XHJcbiAgICB9XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuXHJcbiAgfVxyXG59KSgpO1xyXG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgJCgnaW5wdXRbdHlwZT1maWxlXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICB2YXIgZmlsZSA9IGV2dC50YXJnZXQuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxyXG4gICAgdmFyIGYgPSBmaWxlWzBdO1xyXG4gICAgLy8gT25seSBwcm9jZXNzIGltYWdlIGZpbGVzLlxyXG4gICAgaWYgKCFmLnR5cGUubWF0Y2goJ2ltYWdlLionKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgICBkYXRhID0ge1xyXG4gICAgICAnZWwnOiB0aGlzLFxyXG4gICAgICAnZic6IGZcclxuICAgIH07XHJcbiAgICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGltZyA9ICQoJ1tmb3I9XCInICsgZGF0YS5lbC5uYW1lICsgJ1wiXScpO1xyXG4gICAgICAgIGlmIChpbWcubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgaW1nLmF0dHIoJ3NyYycsIGUudGFyZ2V0LnJlc3VsdClcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9KShkYXRhKTtcclxuICAgIC8vIFJlYWQgaW4gdGhlIGltYWdlIGZpbGUgYXMgYSBkYXRhIFVSTC5cclxuICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGYpO1xyXG4gIH0pO1xyXG5cclxuICAkKCcuZHVibGljYXRlX3ZhbHVlJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICB2YXIgc2VsID0gJCgkdGhpcy5kYXRhKCdzZWxlY3RvcicpKTtcclxuICAgIHNlbC52YWwodGhpcy52YWx1ZSk7XHJcbiAgfSlcclxufSk7XHJcbiIsIlxyXG5mdW5jdGlvbiBnZXRDb29raWUobikge1xyXG4gIHJldHVybiB1bmVzY2FwZSgoUmVnRXhwKG4gKyAnPShbXjtdKyknKS5leGVjKGRvY3VtZW50LmNvb2tpZSkgfHwgWzEsICcnXSlbMV0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRDb29raWUobmFtZSwgdmFsdWUsIGRheXMpIHtcclxuICB2YXIgZXhwaXJlcyA9ICcnO1xyXG4gIGlmIChkYXlzKSB7XHJcbiAgICAgIHZhciBkYXRlID0gbmV3IERhdGU7XHJcbiAgICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSArIGRheXMpO1xyXG4gICAgICBleHBpcmVzID0gJzsgZXhwaXJlcz0nICsgZGF0ZS50b1VUQ1N0cmluZygpO1xyXG4gIH1cclxuICBkb2N1bWVudC5jb29raWUgPSBuYW1lICsgXCI9XCIgKyBlc2NhcGUgKCB2YWx1ZSApICsgZXhwaXJlcztcclxufVxyXG5cclxuZnVuY3Rpb24gZXJhc2VDb29raWUobmFtZSl7XHJcbiAgdmFyIGNvb2tpZV9zdHJpbmcgPSBuYW1lICsgXCI9MFwiICtcIjsgZXhwaXJlcz1XZWQsIDAxIE9jdCAyMDE3IDAwOjAwOjAwIEdNVFwiO1xyXG4gIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZV9zdHJpbmc7XHJcbn1cclxuIiwiKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50KSB7XHJcbiAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gIHZhciB0YWJsZXMgPSAkKCd0YWJsZS5hZGFwdGl2ZScpO1xyXG5cclxuICBpZiAodGFibGVzLmxlbmd0aCA9PSAwKXJldHVybjtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IHRhYmxlcy5sZW5ndGggPiBpOyBpKyspIHtcclxuICAgIHZhciB0YWJsZSA9IHRhYmxlcy5lcShpKTtcclxuICAgIHZhciB0aCA9IHRhYmxlLmZpbmQoJ3RoZWFkJyk7XHJcbiAgICBpZiAodGgubGVuZ3RoID09IDApIHtcclxuICAgICAgdGggPSB0YWJsZS5maW5kKCd0cicpLmVxKDApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGggPSB0aC5maW5kKCd0cicpLmVxKDApO1xyXG4gICAgfVxyXG4gICAgdGggPSB0aC5hZGRDbGFzcygndGFibGUtaGVhZGVyJykuZmluZCgndGQsdGgnKTtcclxuXHJcbiAgICB2YXIgdHIgPSB0YWJsZS5maW5kKCd0cicpLm5vdCgnLnRhYmxlLWhlYWRlcicpO1xyXG5cclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGgubGVuZ3RoOyBqKyspIHtcclxuICAgICAgdmFyIGsgPSBqICsgMTtcclxuICAgICAgdmFyIHRkID0gdHIuZmluZCgndGQ6bnRoLWNoaWxkKCcgKyBrICsgJyknKTtcclxuICAgICAgdGQuYXR0cignbGFiZWwnLCB0aC5lcShqKS50ZXh0KCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xyXG4iLCI7XHJcbiQoZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gb25SZW1vdmUoKXtcclxuICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICBwb3N0PXtcclxuICAgICAgaWQ6JHRoaXMuYXR0cigndWlkJyksXHJcbiAgICAgIHR5cGU6JHRoaXMuYXR0cignbW9kZScpXHJcbiAgICB9O1xyXG4gICAgJC5wb3N0KCR0aGlzLmF0dHIoJ3VybCcpLHBvc3QsZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgIGlmKGRhdGEgJiYgZGF0YT09J2Vycicpe1xyXG4gICAgICAgIG1zZz0kdGhpcy5kYXRhKCdyZW1vdmUtZXJyb3InKTtcclxuICAgICAgICBpZighbXNnKXtcclxuICAgICAgICAgIG1zZz0n0J3QtdCy0L7Qt9C80L7QttC90L4g0YPQtNCw0LvQuNGC0Ywg0Y3Qu9C10LzQtdC90YInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOm1zZyx0eXBlOidlcnInfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtb2RlPSR0aGlzLmF0dHIoJ21vZGUnKTtcclxuICAgICAgaWYoIW1vZGUpe1xyXG4gICAgICAgIG1vZGU9J3JtJztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYobW9kZT09J3JtJykge1xyXG4gICAgICAgIHJtID0gJHRoaXMuY2xvc2VzdCgnLnRvX3JlbW92ZScpO1xyXG4gICAgICAgIHJtX2NsYXNzID0gcm0uYXR0cigncm1fY2xhc3MnKTtcclxuICAgICAgICBpZiAocm1fY2xhc3MpIHtcclxuICAgICAgICAgICQocm1fY2xhc3MpLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcm0ucmVtb3ZlKCk7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0KPRgdC/0LXRiNC90L7QtSDRg9C00LDQu9C10L3QuNC1LicsdHlwZTonaW5mbyd9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmKG1vZGU9PSdyZWxvYWQnKXtcclxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICBsb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XHJcbiAgICAgIH1cclxuICAgIH0pLmZhaWwoZnVuY3Rpb24oKXtcclxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J7RiNC40LHQutCwINGD0LTQsNC70L3QuNGPJyx0eXBlOidlcnInfSk7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5hamF4X3JlbW92ZScsZnVuY3Rpb24oKXtcclxuICAgIG5vdGlmaWNhdGlvbi5jb25maXJtKHtcclxuICAgICAgY2FsbGJhY2tZZXM6b25SZW1vdmUsXHJcbiAgICAgIG9iajokKHRoaXMpLFxyXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibm90aWZ5X2JveC1hbGVydFwiXHJcbiAgICB9KVxyXG4gIH0pO1xyXG5cclxufSk7XHJcblxyXG4iLCJpZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XHJcbiAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAob1RoaXMpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAvLyDQsdC70LjQttCw0LnRiNC40Lkg0LDQvdCw0LvQvtCzINCy0L3Rg9GC0YDQtdC90L3QtdC5INGE0YPQvdC60YbQuNC4XHJcbiAgICAgIC8vIElzQ2FsbGFibGUg0LIgRUNNQVNjcmlwdCA1XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcclxuICAgICAgZlRvQmluZCA9IHRoaXMsXHJcbiAgICAgIGZOT1AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIH0sXHJcbiAgICAgIGZCb3VuZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUCAmJiBvVGhpc1xyXG4gICAgICAgICAgICA/IHRoaXNcclxuICAgICAgICAgICAgOiBvVGhpcyxcclxuICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcclxuICAgIGZCb3VuZC5wcm90b3R5cGUgPSBuZXcgZk5PUCgpO1xyXG5cclxuICAgIHJldHVybiBmQm91bmQ7XHJcbiAgfTtcclxufVxyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5oaWRkZW4tbGluaycpLnJlcGxhY2VXaXRoKGZ1bmN0aW9uICgpIHtcclxuICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgIHJldHVybiAnPGEgaHJlZj1cIicgKyAkdGhpcy5kYXRhKCdsaW5rJykgKyAnXCIgcmVsPVwiJysgJHRoaXMuZGF0YSgncmVsJykgKydcIiBjbGFzcz1cIicgKyAkdGhpcy5hdHRyKCdjbGFzcycpICsgJ1wiPicgKyAkdGhpcy50ZXh0KCkgKyAnPC9hPic7XHJcbiAgfSlcclxufSkoKTtcclxuIiwidmFyIHN0b3JlX3BvaW50cyA9IChmdW5jdGlvbigpe1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBjaGFuZ2VDb3VudHJ5KCl7XHJcbiAgICAgICAgdmFyIHRoYXQgPSAkKCcjc3RvcmVfcG9pbnRfY291bnRyeScpO1xyXG4gICAgICAgIGlmICh0aGF0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZWN0T3B0aW9ucyA9ICQodGhhdCkuZmluZCgnb3B0aW9uJyk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgdGhhdCkuZGF0YSgnY2l0aWVzJyksXHJcbiAgICAgICAgICAgICAgICBwb2ludHMgPSAkKCcjc3RvcmUtcG9pbnRzJyksXHJcbiAgICAgICAgICAgICAgICBjb3VudHJ5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgdGhhdCkuYXR0cigndmFsdWUnKTtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdE9wdGlvbnMubGVuZ3RoID4gMSAmJiBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RvcmVfcG9pbnRfY2l0eScpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdmFyIG9wdGlvbnMgPSAnPG9wdGlvbiB2YWx1ZT1cIlwiPtCS0YvQsdC10YDQuNGC0LUg0LPQvtGA0L7QtDwvb3B0aW9uPic7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyArPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyBpdGVtICsgJ1wiPicgKyBpdGVtICsgJzwvb3B0aW9uPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0LmlubmVySFRNTCA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8kKHBvaW50cykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICAvLyBnb29nbGVNYXAuc2hvd01hcCgpO1xyXG4gICAgICAgICAgICAvLyBnb29nbGVNYXAuc2hvd01hcmtlcihjb3VudHJ5LCAnJyk7XHJcbiAgICAgICAgICAgIGNoYW5nZUNpdHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoYW5nZUNpdHkoKXtcclxuICAgICAgICBpZiAodHlwZW9mIGdvb2dsZU1hcCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgdGhhdCA9ICQoJyNzdG9yZV9wb2ludF9jaXR5Jyk7XHJcbiAgICAgICAgaWYgKHRoYXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZhciBjaXR5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgdGhhdCkuYXR0cigndmFsdWUnKSxcclxuICAgICAgICAgICAgICAgIGNvdW50cnkgPSAkKCdvcHRpb246c2VsZWN0ZWQnLCAkKCcjc3RvcmVfcG9pbnRfY291bnRyeScpKS5hdHRyKCd2YWx1ZScpLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRzID0gJCgnI3N0b3JlLXBvaW50cycpO1xyXG4gICAgICAgICAgICBpZiAoY291bnRyeSAmJiBjaXR5KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBwb2ludHMuZmluZCgnLnN0b3JlLXBvaW50c19fcG9pbnRzX3JvdycpLFxyXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwLnNob3dNYXJrZXIoY291bnRyeSwgY2l0eSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJC5lYWNoKGl0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIGRpdikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkKGRpdikuZGF0YSgnY2l0eScpID09IGNpdHkgJiYgJChkaXYpLmRhdGEoJ2NvdW50cnknKSA9PSBjb3VudHJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZGl2KS5yZW1vdmVDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHNfcm93LWhpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGRpdikuYWRkQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzX3Jvdy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICh2aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChwb2ludHMpLnJlbW92ZUNsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50cy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXAuc2hvd01hcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChwb2ludHMpLmFkZENsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50cy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXAuaGlkZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChwb2ludHMpLmFkZENsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50cy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5oaWRlTWFwKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy/QtNC70Y8g0YLQvtGH0LXQuiDQv9GA0L7QtNCw0LYsINGB0L7QsdGL0YLQuNGPINC90LAg0LLRi9Cx0L7RgCDRgdC10LvQtdC60YLQvtCyXHJcbiAgICB2YXIgYm9keSA9ICQoJ2JvZHknKTtcclxuXHJcbiAgICAkKGJvZHkpLm9uKCdjaGFuZ2UnLCAnI3N0b3JlX3BvaW50X2NvdW50cnknLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgY2hhbmdlQ291bnRyeSgpO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgICQoYm9keSkub24oJ2NoYW5nZScsICcjc3RvcmVfcG9pbnRfY2l0eScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBjaGFuZ2VDaXR5KCk7XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgY2hhbmdlQ291bnRyeSgpO1xyXG5cclxuXHJcbn0pKCk7XHJcblxyXG5cclxuXHJcblxyXG4iLCJ2YXIgaGFzaFRhZ3MgPSAoZnVuY3Rpb24oKXtcclxuXHJcbiAgICBmdW5jdGlvbiBsb2NhdGlvbkhhc2goKSB7XHJcbiAgICAgICAgdmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcclxuXHJcbiAgICAgICAgaWYgKGhhc2ggIT0gXCJcIikge1xyXG4gICAgICAgICAgICB2YXIgaGFzaEJvZHkgPSBoYXNoLnNwbGl0KFwiP1wiKTtcclxuICAgICAgICAgICAgaWYgKGhhc2hCb2R5WzFdKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBsb2NhdGlvbi5vcmlnaW4gKyBsb2NhdGlvbi5wYXRobmFtZSArICc/JyArIGhhc2hCb2R5WzFdICsgaGFzaEJvZHlbMF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlua3MgPSAkKCdhW2hyZWY9XCInICsgaGFzaEJvZHlbMF0gKyAnXCJdLm1vZGFsc19vcGVuJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAobGlua3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChsaW5rc1swXSkuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICBsb2NhdGlvbkhhc2goKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGxvY2F0aW9uSGFzaCgpXHJcblxyXG59KSgpOyIsInZhciBwbHVnaW5zID0gKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgaWNvbkNsb3NlID0gJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHg9XCIwcHhcIiB5PVwiMHB4XCIgd2lkdGg9XCIxMnB4XCIgaGVpZ2h0PVwiMTJweFwiIHZpZXdCb3g9XCIwIDAgMzU3IDM1N1wiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzNTcgMzU3O1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+PGc+JytcclxuICAgICAgICAnPGcgaWQ9XCJjbG9zZVwiPjxwb2x5Z29uIHBvaW50cz1cIjM1NywzNS43IDMyMS4zLDAgMTc4LjUsMTQyLjggMzUuNywwIDAsMzUuNyAxNDIuOCwxNzguNSAwLDMyMS4zIDM1LjcsMzU3IDE3OC41LDIxNC4yIDMyMS4zLDM1NyAzNTcsMzIxLjMgICAgIDIxNC4yLDE3OC41ICAgXCIgZmlsbD1cIiNGRkZGRkZcIi8+JytcclxuICAgICAgICAnPC9zdmc+JztcclxuICAgIHZhciB0ZW1wbGF0ZT0nPGRpdiBjbGFzcz1cInBhZ2Utd3JhcCBpbnN0YWxsLXBsdWdpbl9pbm5lclwiPicrXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImluc3RhbGwtcGx1Z2luX3RleHRcIj57e3RleHR9fTwvZGl2PicrXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImluc3RhbGwtcGx1Z2luX2J1dHRvbnNcIj4nK1xyXG4gICAgICAgICAgICAgICAgICAgICc8YSBjbGFzcz1cImJ0biBidG4tbWluaSBidG4tcm91bmQgaW5zdGFsbC1wbHVnaW5fYnV0dG9uXCIgIGhyZWY9XCJ7e2hyZWZ9fVwiIHRhcmdldD1cIl9ibGFua1wiPtCj0YHRgtCw0L3QvtCy0LjRgtGMJm5ic3A70L/Qu9Cw0LPQuNC9PC9hPicrXHJcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJpbnN0YWxsLXBsdWdpbl9idXR0b24tY2xvc2VcIj4nK2ljb25DbG9zZSsnPC9kaXY+JytcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nK1xyXG4gICAgICAgICAgICAnPC9kaXY+JztcclxuICAgIHZhciBwbHVnaW5JbnN0YWxsRGl2Q2xhc3MgPSAnaW5zdGFsbC1wbHVnaW4taW5kZXgnO1xyXG4gICAgdmFyIHBsdWdpbkluc3RhbGxEaXZBY2NvdW50Q2xhc3MgPSAnaW5zdGFsbC1wbHVnaW4tYWNjb3VudCc7XHJcbiAgICB2YXIgY29va2llUGFuZWxIaWRkZW4gPSAnc2QtaW5zdGFsbC1wbHVnaW4taGlkZGVuJztcclxuICAgIHZhciBjb29raWVBY2NvdW50RGl2SGlkZGVuID0gJ3NkLWluc3RhbGwtcGx1Z2luLWFjY291bnQtaGlkZGVuJztcclxuICAgIHZhciBpc09wZXJhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCcgT1BSLycpID49IDA7XHJcbiAgICB2YXIgaXNZYW5kZXggPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJyBZYUJyb3dzZXIvJykgPj0gMDtcclxuICAgIHZhciBleHRlbnNpb25zID0ge1xyXG4gICAgICAgICdjaHJvbWUnOiB7XHJcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2RfY2hyb21lX2FwcCcsXHJcbiAgICAgICAgICAgICd1c2VkJzogISF3aW5kb3cuY2hyb21lICYmIHdpbmRvdy5jaHJvbWUud2Vic3RvcmUgIT09IG51bGwgJiYgIWlzT3BlcmEgJiYgIWlzWWFuZGV4LFxyXG4gICAgICAgICAgICAndGV4dCc6J9Cj0YHRgtCw0L3QvtCy0LjRgtC1INC90LDRiNC1INGA0LDRgdGI0LjRgNC10L3QuNC1INC00LvRjyDQsdGA0LDRg9C30LXRgNCwLCDQuCDQvtC90L4g0YHQsNC80L4g0L3QsNC/0L7QvNC90LjRgiDQviDQutGN0YjQsdGN0LrQtSDQvdCwINGB0LDQudGC0LUg0LzQsNCz0LDQt9C40L3QsCEnLFxyXG4gICAgICAgICAgICAnaHJlZic6ICdodHRwczovL2Nocm9tZS5nb29nbGUuY29tL3dlYnN0b3JlL2RldGFpbC9zZWNyZXRkaXNjb3VudGVycnUtJUUyJTgwJTkzLSVEMCVCQSVEMSU4RCVEMSU4OCVEMCVCMS9tY29saGhlbWZhY3BvYWdoamlkaGxpZWNwaWFucG5qbicsXHJcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay1jaHJvbWUnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnZmlyZWZveCc6IHtcclxuICAgICAgICAgICAgJ2Rpdl9pZCc6ICdzZF9maXJlZm94X2FwcCcsXHJcbiAgICAgICAgICAgICd1c2VkJzogIHR5cGVvZiBJbnN0YWxsVHJpZ2dlciAhPT0gJ3VuZGVmaW5lZCcsXHJcbiAgICAgICAgICAgICd0ZXh0Jzon0KPRgdGC0LDQvdC+0LLQuNGC0LUg0L3QsNGI0LUg0YDQsNGB0YjQuNGA0LXQvdC40LUg0LTQu9GPINCx0YDQsNGD0LfQtdGA0LAsINC4INC+0L3QviDRgdCw0LzQviDQvdCw0L/QvtC80L3QuNGCINC+INC60Y3RiNCx0Y3QutC1INC90LAg0YHQsNC50YLQtSDQvNCw0LPQsNC30LjQvdCwIScsXHJcbiAgICAgICAgICAgICdocmVmJzogJ2h0dHBzOi8vYWRkb25zLm1vemlsbGEub3JnL3J1L2ZpcmVmb3gvYWRkb24vc2VjcmV0ZGlzY291bnRlci0lRDAlQkElRDElOEQlRDElODglRDAlQjElRDElOEQlRDAlQkEtJUQxJTgxJUQwJUI1JUQxJTgwJUQwJUIyJUQwJUI4JUQxJTgxLycsXHJcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay1maXJlZm94J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ29wZXJhJzoge1xyXG4gICAgICAgICAgICAnZGl2X2lkJzogJ3NkX29wZXJhX2FwcCcsXHJcbiAgICAgICAgICAgICd1c2VkJzogaXNPcGVyYSxcclxuICAgICAgICAgICAgJ3RleHQnOifQo9GB0YLQsNC90L7QstC40YLQtSDQvdCw0YjQtSDRgNCw0YHRiNC40YDQtdC90LjQtSDQtNC70Y8g0LHRgNCw0YPQt9C10YDQsCwg0Lgg0L7QvdC+INGB0LDQvNC+INC90LDQv9C+0LzQvdC40YIg0L4g0LrRjdGI0LHRjdC60LUg0L3QsCDRgdCw0LnRgtC1INC80LDQs9Cw0LfQuNC90LAhJyxcclxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMub3BlcmEuY29tL3J1L2V4dGVuc2lvbnMvP3JlZj1wYWdlJyxcclxuICAgICAgICAgICAgJ2luc3RhbGxfYnV0dG9uX2NsYXNzJzogJ3BsdWdpbi1icm93c2Vycy1saW5rLW9wZXJhJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ3lhbmRleCc6IHtcclxuICAgICAgICAgICAgJ2Rpdl9pZCc6ICdzZF95YW5kZXhfYXBwJyxcclxuICAgICAgICAgICAgJ3VzZWQnOiBpc1lhbmRleCxcclxuICAgICAgICAgICAgJ3RleHQnOifQo9GB0YLQsNC90L7QstC40YLQtSDQvdCw0YjQtSDRgNCw0YHRiNC40YDQtdC90LjQtSDQtNC70Y8g0LHRgNCw0YPQt9C10YDQsCwg0Lgg0L7QvdC+INGB0LDQvNC+INC90LDQv9C+0LzQvdC40YIg0L4g0LrRjdGI0LHRjdC60LUg0L3QsCDRgdCw0LnRgtC1INC80LDQs9Cw0LfQuNC90LAhJyxcclxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMub3BlcmEuY29tL3J1L2V4dGVuc2lvbnMvP3JlZj1wYWdlJyxcclxuICAgICAgICAgICAgJ2luc3RhbGxfYnV0dG9uX2NsYXNzJzogJ3BsdWdpbi1icm93c2Vycy1saW5rLXlhbmRleCdcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRQYW5lbCh0ZXh0LCBocmVmKSB7XHJcbiAgICAgICAgdmFyIHBsdWdpbkluc3RhbGxQYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwbHVnaW4taW5zdGFsbC1wYW5lbCcpOy8v0LLRi9Cy0L7QtNC40YLRjCDQu9C4INC/0LDQvdC10LvRjFxyXG4gICAgICAgIGlmIChwbHVnaW5JbnN0YWxsUGFuZWwgJiYgZ2V0Q29va2llKGNvb2tpZVBhbmVsSGlkZGVuKSAhPT0gJzEnICkge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7dGV4dH19JywgdGV4dCk7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZSgne3tocmVmfX0nLCBocmVmKTtcclxuICAgICAgICAgICAgdmFyIHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XHJcbiAgICAgICAgICAgIHNlY3Rpb24uY2xhc3NOYW1lID0gJ2luc3RhbGwtcGx1Z2luJztcclxuICAgICAgICAgICAgc2VjdGlvbi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzZWNvbmRsaW5lID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcuaGVhZGVyLXNlY29uZGxpbmUnKTtcclxuICAgICAgICAgICAgaWYgKHNlY29uZGxpbmUpIHtcclxuICAgICAgICAgICAgICAgIHNlY29uZGxpbmUuYXBwZW5kQ2hpbGQoc2VjdGlvbik7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaW5zdGFsbC1wbHVnaW5fYnV0dG9uLWNsb3NlJykub25jbGljayA9IGNsb3NlQ2xpY2s7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0QnV0dG9uSW5zdGFsbFZpc2libGUoYnV0dG9uQ2xhc3MpIHtcclxuICAgICAgICAkKCcuJyArIHBsdWdpbkluc3RhbGxEaXZDbGFzcykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICQoJy4nICsgYnV0dG9uQ2xhc3MpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICBpZiAoZ2V0Q29va2llKGNvb2tpZUFjY291bnREaXZIaWRkZW4pICE9PSAnMScpIHtcclxuICAgICAgICAgICAgJCgnLicgKyBwbHVnaW5JbnN0YWxsRGl2QWNjb3VudENsYXNzKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsb3NlQ2xpY2soKXtcclxuICAgICAgICAkKCcuaW5zdGFsbC1wbHVnaW4nKS5hZGRDbGFzcygnaW5zdGFsbC1wbHVnaW5faGlkZGVuJyk7XHJcbiAgICAgICAgc2V0Q29va2llKGNvb2tpZVBhbmVsSGlkZGVuLCAnMScsIDEwKTtcclxuICAgIH1cclxuXHJcbiAgICAkKCcuaW5zdGFsbC1wbHVnaW4tYWNjb3VudC1sYXRlcicpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2V0Q29va2llKGNvb2tpZUFjY291bnREaXZIaWRkZW4sICcxJywgMTApO1xyXG4gICAgICAgICQoJy5pbnN0YWxsLXBsdWdpbi1hY2NvdW50JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gZXh0ZW5zaW9ucykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnNba2V5XS51c2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFwcElkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignIycrZXh0ZW5zaW9uc1trZXldLmRpdl9pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhcHBJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL9C/0LDQvdC10LvRjCDRgSDQutC90L7Qv9C60L7QuVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRQYW5lbChleHRlbnNpb25zW2tleV0udGV4dCwgZXh0ZW5zaW9uc1trZXldLmhyZWYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL9C90LAg0LPQu9Cw0LLQvdC+0LkgINC4INCyIC9hY2NvdW50INCx0LvQvtC60Lgg0YEg0LjQutC+0L3QutCw0LzQuCDQuCDQutC90L7Qv9C60LDQvNC4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEJ1dHRvbkluc3RhbGxWaXNpYmxlKGV4dGVuc2lvbnNba2V5XS5pbnN0YWxsX2J1dHRvbl9jbGFzcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMzAwMCk7XHJcbiAgICB9O1xyXG5cclxufSkoKTsiXX0=
