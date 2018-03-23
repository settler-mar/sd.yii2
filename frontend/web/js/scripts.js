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
          form.find('input[type=text],textarea').val('')
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
    var displayTimeOver = 500;
    var displayTimeClick = 3000;
    var displayTime = 0;
    var arrow = 10;
    var arrowWidth = 8;
    var tooltip;
    var size = 'small';
    var hideClass = 'hidden';
    var tooltipElements = $('[data-toggle=tooltip]');

    var tooltipInit = function () {
        tooltip = document.createElement('div');
        $(tooltip).addClass('tipso_bubble').addClass(size).addClass(hideClass)
            .html('<div class="tipso_arrow"></div><div class="titso_title"></div><div class="tipso_content"></div>');
        $('body').append(tooltip);
    };

    function tooltipShow(elem) {

        var title = $(elem).data('original-title');
        var position = $(elem).data('placement') || 'bottom';
        $(tooltip).removeClass("top_right_corner bottom_right_corner top_left_corner bottom_left_corner");
        $(tooltip).find('.titso_title').html(title);
        setPositon(elem, position);
        $(tooltip).removeClass(hideClass);
        clearTimeout(tooltipTimeOut);
        if (displayTime > 0) {
            tooltipTimeOut = setTimeout(tooltipHide, displayTime);
        }

    }
    function tooltipHide() {
        $(tooltip).addClass(hideClass);
    }

    function setPositon(elem, position){
        var $e = $(elem);
        var $win = $(window);
        switch(position) {
            case 'top':
                pos_left = $e.offset().left + ($e.outerWidth() / 2) - $(tooltip).outerWidth() / 2;
                pos_top = $e.offset().top - $(tooltip).outerHeight() - arrow;
                $(tooltip).find('.tipso_arrow').css({
                    marginLeft: -arrowWidth,
                    marginTop: ''
                });
                if (pos_top < $win.scrollTop()) {
                    pos_top = $e.offset().top + $e.outerHeight() + arrow;
                    $(tooltip).removeClass('top bottom left right');
                    $(tooltip).addClass('bottom');
                }
                else {
                    $(tooltip).removeClass('top bottom left right');
                    $(tooltip).addClass('top');
                }
                break;
            case 'bottom':
                pos_left = $e.offset().left + ($e.outerWidth() / 2) - $(tooltip).outerWidth() / 2;
                pos_top = $e.offset().top + $e.outerHeight() + arrow;
                $(tooltip).find('.tipso_arrow').css({
                    marginLeft: -arrowWidth,
                    marginTop: ''
                });
                if (pos_top + $(tooltip).height() > $win.scrollTop() + $win.outerHeight()) {
                    pos_top = $e.offset().top - $(tooltip).height() - arrow;
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
            left: pos_left,
            top: pos_top
        });
    }


    tooltipElements.on('click', function (e) {
      if ($(this).data('clickable')) {
          displayTime = displayTimeClick;
          if ($(tooltip).hasClass(hideClass)) {
              tooltipShow(this);
          } else {
              tooltipHide();
          }

      }
    });

    tooltipElements.on('mouseover', function (e) {
        if (window.innerWidth >= 1024) {
            displayTime = 0;
            tooltipShow(this);
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
  var scroll_period = 5000;

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
      anim_sel.push('<span>Анимация появления</span>');
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
      anim_sel.push('<span>Задержка появления</span>');
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
      anim_sel.push('<span>Анимация исчезновения</span>');
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
      anim_sel.push('<span>Задержка исчезновения</span>');
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

    btn_ch.append('<br/>');
    btn_ch.append('<span>Оформление кнопки</span>');
    btn_ch.append(genSelect({
      list: btn_style,
      val_type: 0,
      obj: but_sl,
      gr: 'button',
      index: false,
      param: 'color'
    }));

    btn_ch.append('<br/>');
    btn_ch.append('<span>Положение кнопки</span>');
    btn_ch.append(genSelect({
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

    setTimeout(next_slide, scroll_period);
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
            setTimeout(function () {
              $(this).find('.first_show').removeClass('first_show');
            }.bind(slides), 5000);
          }

          if (mobile_mode === false) {
            parallax_group = $(container_id + ' .slider-active .parallax__group>*');
            parallax_counter = 0;
            parallax_timer = setInterval(render, 100);
          }

          if (editor) {
            init_editor()
          } else {
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
              clearTimeout(timeoutId);
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
    if(promo == -1) {
      var key = 'promo=',
        promoStart = u.indexOf(key),
        promoEnd = u.indexOf('&', promoStart),
        promoLength = promoEnd > promoStart ? promoEnd - promoStart - key.length : u.length - promoStart - key.length;
      if(promoStart > 0) {
        promo = u.substr(promoStart + key.length, promoLength);
      }
    }
    var self_promo = promo !=-1 ? "setTimeout(function(){send_promo('"+promo+"')},2000);" : "";
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
    url: "account/promo",
    dataType: 'json',
    data: {promo: promo},
    success: function(data) {
      if (data.title != null && data.message != null) {
        on_promo=$('.on_promo');
        if(on_promo.length==0 || !on_promo.is(':visible')) {
          notification.notifi({
            type: 'success',
            title: data.title,
            message: data.message
          });

          on_promo.show();
        }
      }
    }
  });
}

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
  if (data['button_yes'])data['buttonYes'] = data['button_yes']

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
      if([0].tagName=="IMG"){
        data.type=0;
        src=img.attr('src');
        img.attr('src',no_img);
      }else{
        data.type=1;
        src=img.css('background-image');
        if(!src)continue;
        src=src.replace('url("','');
        src=src.replace('")','');
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

function setCookie(name, value) {
  var cookie_string = name + "=" + escape ( value );
  document.cookie = cookie_string;
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

    //для точек продаж, события на выбор селектов
    $('body').on('change', '#store_point_country', function(e) {
        var data = $('option:selected', this).data('cities'),
            points= $('#store-points'),
            country = $('option:selected', this).attr('value');
        data = data.split(',');
        if (data.length > 0) {
            var select = document.getElementById('store_point_city');
            var options = '<option value=""></option>';
            data.forEach(function(item){
                options += '<option value="'+item+'">'+item+'</option>';
            });
            select.innerHTML = options;
        }
        $(points).addClass('hidden');
        googleMap.showMap();
        googleMap.showMarker(country, '');

        //googleMap.hideMap();
    });

    $('body').on('change', '#store_point_city', function(e) {
        var city = $('option:selected', this).attr('value'),
            country = $('option:selected', $('#store_point_country')).attr('value'),
            points= $('#store-points');
        if (country && city) {
            var items = points.find('.store-points__points_row'),
                visible = false;
            try {
                googleMap.showMarker(country, city);
            } catch (err) {
                console.log(err);
            }
            $.each(items, function(index, div){
                if ($(div).data('city') == city && $(div).data('country') == country){
                    $(div).removeClass('store-points__points_row-hidden');
                    visible = true;
                } else {
                    $(div).addClass('store-points__points_row-hidden') ;
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

    });


})();


var hashTags = (function(){

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

})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsInRvb2x0aXAuanMiLCJhY2NvdW50X25vdGlmaWNhdGlvbi5qcyIsInNsaWRlci5qcyIsImhlYWRlcl9tZW51X2FuZF9zZWFyY2guanMiLCJjYWxjLWNhc2hiYWNrLmpzIiwiYXV0b19oaWRlX2NvbnRyb2wuanMiLCJoaWRlX3Nob3dfYWxsLmpzIiwiY2xvY2suanMiLCJsaXN0X3R5cGVfc3dpdGNoZXIuanMiLCJzZWxlY3QuanMiLCJzZWFyY2guanMiLCJnb3RvLmpzIiwiYWNjb3VudC13aXRoZHJhdy5qcyIsImFqYXguanMiLCJkb2Jyby5qcyIsImxlZnQtbWVudS10b2dnbGUuanMiLCJzaGFyZTQyLmpzIiwibm90aWZpY2F0aW9uLmpzIiwibW9kYWxzLmpzIiwiZm9vdGVyX21lbnUuanMiLCJyYXRpbmcuanMiLCJmYXZvcml0ZXMuanMiLCJzY3JvbGxfdG8uanMiLCJjb3B5X3RvX2NsaXBib2FyZC5qcyIsImltZy5qcyIsInBhcmVudHNfb3Blbl93aW5kb3dzLmpzIiwiZm9ybXMuanMiLCJjb29raWUuanMiLCJ0YWJsZS5qcyIsImFqYXhfcmVtb3ZlLmpzIiwiZml4ZXMuanMiLCJsaW5rcy5qcyIsInN0b3JlX3BvaW50cy5qcyIsImhhc2h0YWdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuOEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJvYmplY3RzID0gZnVuY3Rpb24gKGEsIGIpIHtcclxuICB2YXIgYyA9IGIsXHJcbiAgICBrZXk7XHJcbiAgZm9yIChrZXkgaW4gYSkge1xyXG4gICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGM7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBsb2dpbl9yZWRpcmVjdChuZXdfaHJlZikge1xyXG4gIGhyZWYgPSBsb2NhdGlvbi5ocmVmO1xyXG4gIGlmIChocmVmLmluZGV4T2YoJ3N0b3JlJykgPiAwIHx8IGhyZWYuaW5kZXhPZignY291cG9uJykgPiAwIHx8IGhyZWYuaW5kZXhPZigndXJsKCcpID4gMCkge1xyXG4gICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGxvY2F0aW9uLmhyZWYgPSBuZXdfaHJlZjtcclxuICB9XHJcbn1cclxuIiwiKGZ1bmN0aW9uICh3LCBkLCAkKSB7XHJcbiAgdmFyIHNjcm9sbHNfYmxvY2sgPSAkKCcuc2Nyb2xsX2JveCcpO1xyXG5cclxuICBpZiAoc2Nyb2xsc19ibG9jay5sZW5ndGggPT0gMCkgcmV0dXJuO1xyXG4gIC8vJCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpLndyYXBBbGwoc2Nyb2xsc19ibG9jayk7XHJcbiAgJChzY3JvbGxzX2Jsb2NrKS53cmFwKCc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC13cmFwXCI+PC9kaXY+Jyk7XHJcblxyXG4gIGluaXRfc2Nyb2xsKCk7XHJcbiAgY2FsY19zY3JvbGwoKTtcclxuXHJcbiAgdmFyIHQxLCB0MjtcclxuXHJcbiAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbiAoKSB7XHJcbiAgICBjbGVhclRpbWVvdXQodDEpO1xyXG4gICAgY2xlYXJUaW1lb3V0KHQyKTtcclxuICAgIHQxID0gc2V0VGltZW91dChjYWxjX3Njcm9sbCwgMzAwKTtcclxuICAgIHQyID0gc2V0VGltZW91dChjYWxjX3Njcm9sbCwgODAwKTtcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gaW5pdF9zY3JvbGwoKSB7XHJcbiAgICB2YXIgY29udHJvbCA9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sXCI+PC9kaXY+JztcclxuICAgIGNvbnRyb2wgPSAkKGNvbnRyb2wpO1xyXG4gICAgY29udHJvbC5pbnNlcnRBZnRlcihzY3JvbGxzX2Jsb2NrKTtcclxuICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7XHJcblxyXG4gICAgc2Nyb2xsc19ibG9jay5wcmVwZW5kKCc8ZGl2IGNsYXNzPXNjcm9sbF9ib3gtbW92ZXI+PC9kaXY+Jyk7XHJcblxyXG4gICAgY29udHJvbC5vbignY2xpY2snLCAnLnNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgdmFyIGNvbnRyb2wgPSAkdGhpcy5wYXJlbnQoKTtcclxuICAgICAgdmFyIGkgPSAkdGhpcy5pbmRleCgpO1xyXG4gICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2FjdGl2ZScpKXJldHVybjtcclxuICAgICAgY29udHJvbC5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAkdGhpcy5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICB2YXIgZHggPSBjb250cm9sLmRhdGEoJ3NsaWRlLWR4Jyk7XHJcbiAgICAgIHZhciBlbCA9IGNvbnRyb2wucHJldigpO1xyXG4gICAgICBlbC5maW5kKCcuc2Nyb2xsX2JveC1tb3ZlcicpLmNzcygnbWFyZ2luLWxlZnQnLCAtZHggKiBpKTtcclxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBpKTtcclxuXHJcbiAgICAgIHN0b3BTY3JvbC5iaW5kKGVsKSgpO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGZvciAodmFyIGogPSAwOyBqIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGorKykge1xyXG4gICAgdmFyIGVsID0gc2Nyb2xsc19ibG9jay5lcShqKTtcclxuICAgIGVsLnBhcmVudCgpLmhvdmVyKHN0b3BTY3JvbC5iaW5kKGVsKSwgc3RhcnRTY3JvbC5iaW5kKGVsKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzdGFydFNjcm9sKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgIGlmICghJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XHJcblxyXG4gICAgdmFyIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZS5iaW5kKCR0aGlzKSwgMjAwMCk7XHJcbiAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLCB0aW1lb3V0SWQpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzdG9wU2Nyb2woKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHRpbWVvdXRJZCA9ICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpO1xyXG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJywgZmFsc2UpO1xyXG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpIHx8ICF0aW1lb3V0SWQpcmV0dXJuO1xyXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIGZhbHNlKTtcclxuICAgIGlmICghJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XHJcblxyXG4gICAgdmFyIGNvbnRyb2xzID0gJHRoaXMubmV4dCgpLmZpbmQoJz4qJyk7XHJcbiAgICB2YXIgYWN0aXZlID0gJHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJyk7XHJcbiAgICB2YXIgcG9pbnRfY250ID0gY29udHJvbHMubGVuZ3RoO1xyXG4gICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcclxuICAgIGFjdGl2ZSsrO1xyXG4gICAgaWYgKGFjdGl2ZSA+PSBwb2ludF9jbnQpYWN0aXZlID0gMDtcclxuICAgICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XHJcblxyXG4gICAgY29udHJvbHMuZXEoYWN0aXZlKS5jbGljaygpO1xyXG4gICAgc3RhcnRTY3JvbC5iaW5kKCR0aGlzKSgpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2FsY19zY3JvbGwoKSB7XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGkpO1xyXG4gICAgICB2YXIgY29udHJvbCA9IGVsLm5leHQoKTtcclxuICAgICAgdmFyIHdpZHRoX21heCA9IGVsLmRhdGEoJ3Njcm9sbC13aWR0aC1tYXgnKTtcclxuICAgICAgdyA9IGVsLndpZHRoKCk7XHJcblxyXG4gICAgICAvL9C00LXQu9Cw0LXQvCDQutC+0L3RgtGA0L7Qu9GMINC+0LPRgNCw0L3QuNGH0LXQvdC40Y8g0YjQuNGA0LjQvdGLLiDQldGB0LvQuCDQv9GA0LXQstGL0YjQtdC90L4g0YLQviDQvtGC0LrQu9GO0YfQsNC10Lwg0YHQutGA0L7QuyDQuCDQv9C10YDQtdGF0L7QtNC40Lwg0Log0YHQu9C10LTRg9GO0YnQtdC80YMg0Y3Qu9C10LzQtdC90YLRg1xyXG4gICAgICBpZiAod2lkdGhfbWF4ICYmIHcgPiB3aWR0aF9tYXgpIHtcclxuICAgICAgICBjb250cm9sLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XHJcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIG5vX2NsYXNzID0gZWwuZGF0YSgnc2Nyb2xsLWVsZW1ldC1pZ25vcmUtY2xhc3MnKTtcclxuICAgICAgdmFyIGNoaWxkcmVuID0gZWwuZmluZCgnPionKS5ub3QoJy5zY3JvbGxfYm94LW1vdmVyJyk7XHJcbiAgICAgIGlmIChub19jbGFzcykge1xyXG4gICAgICAgIGNoaWxkcmVuID0gY2hpbGRyZW4ubm90KCcuJyArIG5vX2NsYXNzKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvL9CV0YHQu9C4INC90LXRgiDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcclxuICAgICAgaWYgKGNoaWxkcmVuID09IDApIHtcclxuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBmX2VsID0gY2hpbGRyZW4uZXEoMSk7XHJcbiAgICAgIHZhciBjaGlsZHJlbl93ID0gZl9lbC5vdXRlcldpZHRoKCk7IC8v0LLRgdC10LPQviDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcclxuICAgICAgY2hpbGRyZW5fdyArPSBwYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tbGVmdCcpKTtcclxuICAgICAgY2hpbGRyZW5fdyArPSBwYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tcmlnaHQnKSk7XHJcblxyXG4gICAgICB2YXIgc2NyZWFuX2NvdW50ID0gTWF0aC5mbG9vcih3IC8gY2hpbGRyZW5fdyk7XHJcblxyXG4gICAgICAvL9CV0YHQu9C4INCy0YHQtSDQstC70LDQt9C40YIg0L3QsCDRjdC60YDQsNC9XHJcbiAgICAgIGlmIChjaGlsZHJlbiA8PSBzY3JlYW5fY291bnQpIHtcclxuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8v0KPQttC1INGC0L7Rh9C90L4g0LfQvdCw0LXQvCDRh9GC0L4g0YHQutGA0L7QuyDQvdGD0LbQtdC9XHJcbiAgICAgIGVsLmFkZENsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XHJcblxyXG4gICAgICB2YXIgcG9pbnRfY250ID0gY2hpbGRyZW4ubGVuZ3RoIC0gc2NyZWFuX2NvdW50ICsgMTtcclxuICAgICAgLy/QtdGB0LvQuCDQvdC1INC90LDQtNC+INC+0LHQvdC+0LLQu9GP0YLRjCDQutC+0L3RgtGA0L7QuyDRgtC+INCy0YvRhdC+0LTQuNC8LCDQvdC1INC30LDQsdGL0LLQsNGPINC+0LHQvdC+0LLQuNGC0Ywg0YjQuNGA0LjQvdGDINC00L7Rh9C10YDQvdC40YVcclxuICAgICAgaWYgKGNvbnRyb2wuZmluZCgnPionKS5sZW5ndGggPT0gcG9pbnRfY250KSB7XHJcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhY3RpdmUgPSBlbC5kYXRhKCdzbGlkZS1hY3RpdmUnKTtcclxuICAgICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcclxuICAgICAgaWYgKGFjdGl2ZSA+PSBwb2ludF9jbnQpYWN0aXZlID0gcG9pbnRfY250IC0gMTtcclxuICAgICAgdmFyIG91dCA9ICcnO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvaW50X2NudDsgaisrKSB7XHJcbiAgICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sX3BvaW50JyArIChqID09IGFjdGl2ZSA/ICcgYWN0aXZlJyA6ICcnKSArICdcIj48L2Rpdj4nO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnRyb2wuaHRtbChvdXQpO1xyXG5cclxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xyXG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWNvdW50JywgcG9pbnRfY250KTtcclxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xyXG5cclxuICAgICAgaWYgKCFlbC5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKSkge1xyXG4gICAgICAgIHN0YXJ0U2Nyb2wuYmluZChlbCkoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSh3aW5kb3csIGRvY3VtZW50LCBqUXVlcnkpKTtcclxuIiwidmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xyXG5cclxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcclxuXHJcblxyXG4gIGlmICgkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tdGl0bGUnKS5oYXNDbGFzcygnYWNjb3JkaW9uLXRpdGxlLWRpc2FibGVkJykpcmV0dXJuO1xyXG5cclxuICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAvKmlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKXtcclxuICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgfSovXHJcbiAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlVXAoMzAwKTtcclxuICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxyXG4gIH0gZWxzZSB7XHJcbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJykpIHtcclxuICAgICAgJG90aGVyID0gJCgnLmFjY29yZGlvbi1vbmx5X29uZScpO1xyXG4gICAgICAkb3RoZXIuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcclxuICAgICAgICAuc2xpZGVVcCgzMDApXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcclxuICAgICAgJG90aGVyLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnbGFzdC1vcGVuJyk7XHJcblxyXG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmFkZENsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcclxuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnbGFzdC1vcGVuJyk7XHJcbiAgICB9XHJcbiAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlRG93bigzMDApO1xyXG4gICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn0pO1xyXG5hY2NvcmRpb25Db250cm9sLnNob3coKTtcclxuXHJcblxyXG4kKCcuYWNjb3JkaW9uLXdyYXAub3Blbl9maXJzdCAuYWNjb3JkaW9uOmZpcnN0LWNoaWxkJykuYWRkQ2xhc3MoJ29wZW4nKTtcclxuJCgnLmFjY29yZGlvbi13cmFwIC5hY2NvcmRpb24uYWNjb3JkaW9uLXNsaW06Zmlyc3QtY2hpbGQnKS5hZGRDbGFzcygnb3BlbicpO1xyXG4kKCcuYWNjb3JkaW9uLXNsaW0nKS5hZGRDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJyk7XHJcblxyXG4vL9C00LvRjyDRgdC40LzQvtCyINC+0YLQutGA0YvQstCw0LXQvCDQtdGB0LvQuCDQtdGB0YLRjCDQv9C+0LzQtdGC0LrQsCBvcGVuINGC0L4g0L/RgNC40YHQstCw0LjQstCw0LXQvCDQstGB0LUg0L7RgdGC0LDQu9GM0L3Ri9C1INC60LvQsNGB0YtcclxuYWNjb3JkaW9uU2xpbSA9ICQoJy5hY2NvcmRpb24uYWNjb3JkaW9uLW9ubHlfb25lJyk7XHJcbmlmIChhY2NvcmRpb25TbGltLmxlbmd0aCA+IDApIHtcclxuICBhY2NvcmRpb25TbGltLnBhcmVudCgpLmZpbmQoJy5hY2NvcmRpb24ub3BlbicpXHJcbiAgICAuYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpXHJcbiAgICAuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcclxuICAgIC5zaG93KDMwMClcclxuICAgIC5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XHJcbn1cclxuXHJcbiQoJ2JvZHknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLmFjY29yZGlvbl9mdWxsc2NyZWFuX2Nsb3NlLm9wZW4gLmFjY29yZGlvbi1jb250cm9sOmZpcnN0LWNoaWxkJykuY2xpY2soKVxyXG59KTtcclxuXHJcbiQoJy5hY2NvcmRpb24tY29udGVudCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgIT0gJ0EnKSB7XHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb24nKS5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wuYWNjb3JkaW9uLXRpdGxlJykuY2xpY2soKTtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn0pO1xyXG5cclxuJCgnLmFjY29yZGlvbi1jb250ZW50IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2FuZ2xlLXVwJykpcmV0dXJuO1xyXG4gIGUuc3RvcFByb3BhZ2F0aW9uKClcclxufSk7XHJcblxyXG4iLCJmdW5jdGlvbiBhamF4Rm9ybShlbHMpIHtcclxuICB2YXIgZmlsZUFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiA/IHRydWUgOiBmYWxzZTtcclxuICB2YXIgZGVmYXVsdHMgPSB7XHJcbiAgICBlcnJvcl9jbGFzczogJy5oYXMtZXJyb3InXHJcbiAgfTtcclxuICB2YXIgbGFzdF9wb3N0ID0gZmFsc2U7XHJcblxyXG4gIGZ1bmN0aW9uIG9uUG9zdChwb3N0KSB7XHJcbiAgICBsYXN0X3Bvc3QgPSArbmV3IERhdGUoKTtcclxuICAgIC8vY29uc29sZS5sb2cocG9zdCwgdGhpcyk7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xyXG4gICAgdmFyIHdyYXBfaHRtbCA9IGRhdGEud3JhcF9odG1sO1xyXG5cclxuICAgIGlmIChwb3N0LnJlbmRlcikge1xyXG4gICAgICBwb3N0Lm5vdHlmeV9jbGFzcyA9IFwibm90aWZ5X3doaXRlXCI7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICBpZiAocG9zdC5odG1sKSB7XHJcbiAgICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XHJcbiAgICAgICAgYWpheEZvcm0od3JhcCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKCFwb3N0LmVycm9yKSB7XHJcbiAgICAgICAgICBmb3JtLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgICB3cmFwLmh0bWwod3JhcF9odG1sKTtcclxuICAgICAgICAgIGZvcm0uZmluZCgnaW5wdXRbdHlwZT10ZXh0XSx0ZXh0YXJlYScpLnZhbCgnJylcclxuICAgICAgICAgIGFqYXhGb3JtKHdyYXApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgcG9zdC5lcnJvciA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICBmb3IgKHZhciBpbmRleCBpbiBwb3N0LmVycm9yKSB7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgICAndHlwZSc6ICdlcnInLFxyXG4gICAgICAgICAgJ3RpdGxlJzogJ9Ce0YjQuNCx0LrQsCcsXHJcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QuZXJyb3JbaW5kZXhdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwb3N0LmVycm9yKSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvc3QuZXJyb3IubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICd0eXBlJzogJ2VycicsXHJcbiAgICAgICAgICAndGl0bGUnOiAn0J7RiNC40LHQutCwJyxcclxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocG9zdC5lcnJvciB8fCBwb3N0Lm1lc3NhZ2UpIHtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcclxuICAgICAgICAgICd0aXRsZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ9Cj0YHQv9C10YjQvdC+JyA6ICfQntGI0LjQsdC60LAnLFxyXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0Lm1lc3NhZ2UgPyBwb3N0Lm1lc3NhZ2UgOiBwb3N0LmVycm9yXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgIC8vICAgICAndHlwZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ3N1Y2Nlc3MnIDogJ2VycicsXHJcbiAgICAvLyAgICAgJ3RpdGxlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAn0KPRgdC/0LXRiNC90L4nIDogJ9Ce0YjQuNCx0LrQsCcsXHJcbiAgICAvLyAgICAgJ21lc3NhZ2UnOiBBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpID8gcG9zdC5lcnJvclswXSA6IChwb3N0Lm1lc3NhZ2UgPyBwb3N0Lm1lc3NhZ2UgOiBwb3N0LmVycm9yKVxyXG4gICAgLy8gfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvbkZhaWwoKSB7XHJcbiAgICBsYXN0X3Bvc3QgPSArbmV3IERhdGUoKTtcclxuICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xyXG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XHJcbiAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICB3cmFwLmh0bWwoJzxoMz7Qo9C/0YEuLi4g0JLQvtC30L3QuNC60LvQsCDQvdC10L/RgNC10LTQstC40LTQtdC90L3QsNGPINC+0YjQuNCx0LrQsDxoMz4nICtcclxuICAgICAgJzxwPtCn0LDRgdGC0L4g0Y3RgtC+INC/0YDQvtC40YHRhdC+0LTQuNGCINCyINGB0LvRg9GH0LDQtSwg0LXRgdC70Lgg0LLRiyDQvdC10YHQutC+0LvRjNC60L4g0YDQsNC3INC/0L7QtNGA0Y/QtCDQvdC10LLQtdGA0L3QviDQstCy0LXQu9C4INGB0LLQvtC4INGD0YfQtdGC0L3Ri9C1INC00LDQvdC90YvQtS4g0J3QviDQstC+0LfQvNC+0LbQvdGLINC4INC00YDRg9Cz0LjQtSDQv9GA0LjRh9C40L3Riy4g0JIg0LvRjtCx0L7QvCDRgdC70YPRh9Cw0LUg0L3QtSDRgNCw0YHRgdGC0YDQsNC40LLQsNC50YLQtdGB0Ywg0Lgg0L/RgNC+0YHRgtC+INC+0LHRgNCw0YLQuNGC0LXRgdGMINC6INC90LDRiNC10LzRgyDQvtC/0LXRgNCw0YLQvtGA0YMg0YHQu9GD0LbQsdGLINC/0L7QtNC00LXRgNC20LrQuC48L3A+PGJyPicgK1xyXG4gICAgICAnPHA+0KHQv9Cw0YHQuNCx0L4uPC9wPicpO1xyXG4gICAgYWpheEZvcm0od3JhcCk7XHJcblxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25TdWJtaXQoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgLy9lLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgLy9lLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgIHZhciBjdXJyZW50VGltZU1pbGxpcyA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgaWYgKGN1cnJlbnRUaW1lTWlsbGlzIC0gbGFzdF9wb3N0IDwgMTAwMCAqIDIpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGxhc3RfcG9zdCA9IGN1cnJlbnRUaW1lTWlsbGlzO1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcclxuICAgIGRhdGEud3JhcF9odG1sPXdyYXAuaHRtbCgpO1xyXG4gICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xyXG5cclxuICAgIC8vaW5pdCh3cmFwKTtcclxuXHJcbiAgICBpZiAoZm9ybS55aWlBY3RpdmVGb3JtKSB7XHJcbiAgICAgIHZhciBkID0gZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJyk7XHJcbiAgICAgIGlmIChkKSB7XHJcbiAgICAgICAgZC52YWxpZGF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScsIGQpO1xyXG4gICAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcclxuICAgICAgICBpc1ZhbGlkID0gZC52YWxpZGF0ZWQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc1ZhbGlkID0gaXNWYWxpZCAmJiAoZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aCA9PSAwKTtcclxuXHJcbiAgICBpZiAoIWlzVmFsaWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIHZhciByZXF1aXJlZCA9IGZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQnKTtcclxuICAgICAgZm9yIChpID0gMDsgaSA8IHJlcXVpcmVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGhlbHBCbG9jayA9IHJlcXVpcmVkLmVxKGkpLmF0dHIoJ3R5cGUnKSA9PSAnaGlkZGVuJyA/IHJlcXVpcmVkLmVxKGkpLm5leHQoJy5oZWxwLWJsb2NrJykgOlxyXG4gICAgICAgICAgcmVxdWlyZWQuZXEoaSkuY2xvc2VzdCgnLmZvcm0taW5wdXQtZ3JvdXAnKS5uZXh0KCcuaGVscC1ibG9jaycpO1xyXG4gICAgICAgIHZhciBoZWxwTWVzc2FnZSA9IGhlbHBCbG9jayAmJiBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpID8gaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA6ICfQndC10L7QsdGF0L7QtNC40LzQviDQt9Cw0L/QvtC70L3QuNGC0YwnO1xyXG5cclxuICAgICAgICBpZiAocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgaGVscEJsb2NrLmh0bWwoaGVscE1lc3NhZ2UpO1xyXG4gICAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBoZWxwQmxvY2suaHRtbCgnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICghaXNWYWxpZCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghZm9ybS5zZXJpYWxpemVPYmplY3QpYWRkU1JPKCk7XHJcblxyXG4gICAgdmFyIHBvc3REYXRhID0gZm9ybS5zZXJpYWxpemVPYmplY3QoKTtcclxuICAgIGZvcm0uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIGZvcm0uaHRtbCgnJyk7XHJcbiAgICB3cmFwLmh0bWwoJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48cD7QntGC0L/RgNCw0LLQutCwINC00LDQvdC90YvRhTwvcD48L2Rpdj4nKTtcclxuXHJcbiAgICBkYXRhLnVybCArPSAoZGF0YS51cmwuaW5kZXhPZignPycpID4gMCA/ICcmJyA6ICc/JykgKyAncmM9JyArIE1hdGgucmFuZG9tKCk7XHJcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEudXJsKTtcclxuXHJcbiAgICAkLnBvc3QoXHJcbiAgICAgIGRhdGEudXJsLFxyXG4gICAgICBwb3N0RGF0YSxcclxuICAgICAgb25Qb3N0LmJpbmQoZGF0YSksXHJcbiAgICAgICdqc29uJ1xyXG4gICAgKS5mYWlsKG9uRmFpbC5iaW5kKGRhdGEpKTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0KHdyYXApIHtcclxuICAgIGZvcm0gPSB3cmFwLmZpbmQoJ2Zvcm0nKTtcclxuICAgIGRhdGEgPSB7XHJcbiAgICAgIGZvcm06IGZvcm0sXHJcbiAgICAgIHBhcmFtOiBkZWZhdWx0cyxcclxuICAgICAgd3JhcDogd3JhcFxyXG4gICAgfTtcclxuICAgIGRhdGEudXJsID0gZm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xyXG4gICAgZGF0YS5tZXRob2QgPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcclxuICAgIGZvcm0udW5iaW5kKCdzdWJtaXQnKTtcclxuICAgIC8vZm9ybS5vZmYoJ3N1Ym1pdCcpO1xyXG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XHJcbiAgfVxyXG5cclxuICBlbHMuZmluZCgnW3JlcXVpcmVkXScpXHJcbiAgICAuYWRkQ2xhc3MoJ3JlcXVpcmVkJylcclxuICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpO1xyXG5cclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgIGluaXQoZWxzLmVxKGkpKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFNSTygpIHtcclxuICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvID0ge307XHJcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcclxuICAgICQuZWFjaChhLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcclxuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XHJcbiAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbztcclxuICB9O1xyXG59O1xyXG5hZGRTUk8oKTsiLCJ2YXIgc2RUb29sdGlwID0gZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIHZhciB0b29sdGlwVGltZU91dCA9IG51bGw7XHJcbiAgICB2YXIgZGlzcGxheVRpbWVPdmVyID0gNTAwO1xyXG4gICAgdmFyIGRpc3BsYXlUaW1lQ2xpY2sgPSAzMDAwO1xyXG4gICAgdmFyIGRpc3BsYXlUaW1lID0gMDtcclxuICAgIHZhciBhcnJvdyA9IDEwO1xyXG4gICAgdmFyIGFycm93V2lkdGggPSA4O1xyXG4gICAgdmFyIHRvb2x0aXA7XHJcbiAgICB2YXIgc2l6ZSA9ICdzbWFsbCc7XHJcbiAgICB2YXIgaGlkZUNsYXNzID0gJ2hpZGRlbic7XHJcbiAgICB2YXIgdG9vbHRpcEVsZW1lbnRzID0gJCgnW2RhdGEtdG9nZ2xlPXRvb2x0aXBdJyk7XHJcblxyXG4gICAgdmFyIHRvb2x0aXBJbml0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCd0aXBzb19idWJibGUnKS5hZGRDbGFzcyhzaXplKS5hZGRDbGFzcyhoaWRlQ2xhc3MpXHJcbiAgICAgICAgICAgIC5odG1sKCc8ZGl2IGNsYXNzPVwidGlwc29fYXJyb3dcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGl0c29fdGl0bGVcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGlwc29fY29udGVudFwiPjwvZGl2PicpO1xyXG4gICAgICAgICQoJ2JvZHknKS5hcHBlbmQodG9vbHRpcCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIHRvb2x0aXBTaG93KGVsZW0pIHtcclxuXHJcbiAgICAgICAgdmFyIHRpdGxlID0gJChlbGVtKS5kYXRhKCdvcmlnaW5hbC10aXRsZScpO1xyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9ICQoZWxlbSkuZGF0YSgncGxhY2VtZW50JykgfHwgJ2JvdHRvbSc7XHJcbiAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcyhcInRvcF9yaWdodF9jb3JuZXIgYm90dG9tX3JpZ2h0X2Nvcm5lciB0b3BfbGVmdF9jb3JuZXIgYm90dG9tX2xlZnRfY29ybmVyXCIpO1xyXG4gICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpdHNvX3RpdGxlJykuaHRtbCh0aXRsZSk7XHJcbiAgICAgICAgc2V0UG9zaXRvbihlbGVtLCBwb3NpdGlvbik7XHJcbiAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcyhoaWRlQ2xhc3MpO1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0b29sdGlwVGltZU91dCk7XHJcbiAgICAgICAgaWYgKGRpc3BsYXlUaW1lID4gMCkge1xyXG4gICAgICAgICAgICB0b29sdGlwVGltZU91dCA9IHNldFRpbWVvdXQodG9vbHRpcEhpZGUsIGRpc3BsYXlUaW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gdG9vbHRpcEhpZGUoKSB7XHJcbiAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcyhoaWRlQ2xhc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldFBvc2l0b24oZWxlbSwgcG9zaXRpb24pe1xyXG4gICAgICAgIHZhciAkZSA9ICQoZWxlbSk7XHJcbiAgICAgICAgdmFyICR3aW4gPSAkKHdpbmRvdyk7XHJcbiAgICAgICAgc3dpdGNoKHBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICBwb3NfbGVmdCA9ICRlLm9mZnNldCgpLmxlZnQgKyAoJGUub3V0ZXJXaWR0aCgpIC8gMikgLSAkKHRvb2x0aXApLm91dGVyV2lkdGgoKSAvIDI7XHJcbiAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wIC0gJCh0b29sdGlwKS5vdXRlckhlaWdodCgpIC0gYXJyb3c7XHJcbiAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmZpbmQoJy50aXBzb19hcnJvdycpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogLWFycm93V2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocG9zX3RvcCA8ICR3aW4uc2Nyb2xsVG9wKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wICsgJGUub3V0ZXJIZWlnaHQoKSArIGFycm93O1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ2JvdHRvbScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndG9wJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICAgICAgICAgIHBvc19sZWZ0ID0gJGUub2Zmc2V0KCkubGVmdCArICgkZS5vdXRlcldpZHRoKCkgLyAyKSAtICQodG9vbHRpcCkub3V0ZXJXaWR0aCgpIC8gMjtcclxuICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgKyAkZS5vdXRlckhlaWdodCgpICsgYXJyb3c7XHJcbiAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmZpbmQoJy50aXBzb19hcnJvdycpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogLWFycm93V2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocG9zX3RvcCArICQodG9vbHRpcCkuaGVpZ2h0KCkgPiAkd2luLnNjcm9sbFRvcCgpICsgJHdpbi5vdXRlckhlaWdodCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zX3RvcCA9ICRlLm9mZnNldCgpLnRvcCAtICQodG9vbHRpcCkuaGVpZ2h0KCkgLSBhcnJvdztcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKCd0b3AgYm90dG9tIGxlZnQgcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCd0b3AnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ2JvdHRvbScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQodG9vbHRpcCkuY3NzKHtcclxuICAgICAgICAgICAgbGVmdDogcG9zX2xlZnQsXHJcbiAgICAgICAgICAgIHRvcDogcG9zX3RvcFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICB0b29sdGlwRWxlbWVudHMub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgaWYgKCQodGhpcykuZGF0YSgnY2xpY2thYmxlJykpIHtcclxuICAgICAgICAgIGRpc3BsYXlUaW1lID0gZGlzcGxheVRpbWVDbGljaztcclxuICAgICAgICAgIGlmICgkKHRvb2x0aXApLmhhc0NsYXNzKGhpZGVDbGFzcykpIHtcclxuICAgICAgICAgICAgICB0b29sdGlwU2hvdyh0aGlzKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdG9vbHRpcEhpZGUoKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRvb2x0aXBFbGVtZW50cy5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPj0gMTAyNCkge1xyXG4gICAgICAgICAgICBkaXNwbGF5VGltZSA9IDA7XHJcbiAgICAgICAgICAgIHRvb2x0aXBTaG93KHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24gKCl7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IDEwMjQpIHtcclxuICAgICAgICAgICAgdG9vbHRpcEhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdG9vbHRpcEluaXQoKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbn0oKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgJG5vdHlmaV9idG4gPSAkKCcuaGVhZGVyLWxvZ29fbm90eScpO1xyXG4gIGlmICgkbm90eWZpX2J0bi5sZW5ndGggPT0gMCkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgJC5nZXQoJy9hY2NvdW50L25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEubm90aWZpY2F0aW9ucyB8fCBkYXRhLm5vdGlmaWNhdGlvbnMubGVuZ3RoID09IDApIHJldHVybjtcclxuXHJcbiAgICB2YXIgb3V0ID0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktYm94PjxkaXYgY2xhc3M9aGVhZGVyLW5vdHktYm94LWlubmVyPjx1bCBjbGFzcz1cImhlYWRlci1ub3R5LWxpc3RcIj4nO1xyXG4gICAgJG5vdHlmaV9idG4uZmluZCgnYScpLnJlbW92ZUF0dHIoJ2hyZWYnKTtcclxuICAgIHZhciBoYXNfbmV3ID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBlbCA9IGRhdGEubm90aWZpY2F0aW9uc1tpXTtcclxuICAgICAgdmFyIGlzX25ldyA9IChlbC5pc192aWV3ZWQgPT0gMCAmJiBlbC50eXBlX2lkID09IDIpO1xyXG4gICAgICBvdXQgKz0gJzxsaSBjbGFzcz1cImhlYWRlci1ub3R5LWl0ZW0nICsgKGlzX25ldyA/ICcgaGVhZGVyLW5vdHktaXRlbV9uZXcnIDogJycpICsgJ1wiPic7XHJcbiAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1oZWFkZXItbm90eS1kYXRhPicgKyBlbC5kYXRhICsgJzwvZGl2Pic7XHJcbiAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1oZWFkZXItbm90eS10ZXh0PicgKyBlbC50ZXh0ICsgJzwvZGl2Pic7XHJcbiAgICAgIG91dCArPSAnPC9saT4nO1xyXG4gICAgICBoYXNfbmV3ID0gaGFzX25ldyB8fCBpc19uZXc7XHJcbiAgICB9XHJcblxyXG4gICAgb3V0ICs9ICc8L3VsPic7XHJcbiAgICBvdXQgKz0gJzxhIGNsYXNzPVwiYnRuIGhlYWRlci1ub3R5LWJveC1idG5cIiBocmVmPVwiL2FjY291bnQvbm90aWZpY2F0aW9uXCI+JyArIGRhdGEuYnRuICsgJzwvYT4nO1xyXG4gICAgb3V0ICs9ICc8L2Rpdj48L2Rpdj4nO1xyXG4gICAgJCgnLmhlYWRlcicpLmFwcGVuZChvdXQpO1xyXG5cclxuICAgIGlmIChoYXNfbmV3KSB7XHJcbiAgICAgICRub3R5ZmlfYnRuLmFkZENsYXNzKCd0b29sdGlwJykuYWRkQ2xhc3MoJ2hhcy1ub3R5Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgJG5vdHlmaV9idG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBpZiAoJCgnLmhlYWRlci1ub3R5LWJveCcpLmhhc0NsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpKSB7XHJcbiAgICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xyXG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5hZGRDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuXHJcbiAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2hhcy1ub3R5JykpIHtcclxuICAgICAgICAgICQucG9zdCgnL2FjY291bnQvbm90aWZpY2F0aW9uJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuaGVhZGVyLWxvZ29fbm90eScpLnJlbW92ZUNsYXNzKCd0b29sdGlwJykucmVtb3ZlQ2xhc3MoJ2hhcy1ub3R5Jyk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLW5vdHktYm94Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xyXG4gICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5oZWFkZXItbm90eS1saXN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KVxyXG4gIH0sICdqc29uJyk7XHJcblxyXG59KSgpO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgbWVnYXNsaWRlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIHNsaWRlcl9kYXRhID0gZmFsc2U7XHJcbiAgdmFyIGNvbnRhaW5lcl9pZCA9IFwic2VjdGlvbiNtZWdhX3NsaWRlclwiO1xyXG4gIHZhciBwYXJhbGxheF9ncm91cCA9IGZhbHNlO1xyXG4gIHZhciBwYXJhbGxheF90aW1lciA9IGZhbHNlO1xyXG4gIHZhciBwYXJhbGxheF9jb3VudGVyID0gMDtcclxuICB2YXIgcGFyYWxsYXhfZCA9IDE7XHJcbiAgdmFyIG1vYmlsZV9tb2RlID0gLTE7XHJcbiAgdmFyIG1heF90aW1lX2xvYWRfcGljID0gMzAwO1xyXG4gIHZhciBtb2JpbGVfc2l6ZSA9IDcwMDtcclxuICB2YXIgcmVuZGVyX3NsaWRlX25vbSA9IDA7XHJcbiAgdmFyIHRvdF9pbWdfd2FpdDtcclxuICB2YXIgc2xpZGVzO1xyXG4gIHZhciBzbGlkZV9zZWxlY3RfYm94O1xyXG4gIHZhciBlZGl0b3I7XHJcbiAgdmFyIHRpbWVvdXRJZDtcclxuICB2YXIgc2Nyb2xsX3BlcmlvZCA9IDUwMDA7XHJcblxyXG4gIHZhciBwb3NBcnIgPSBbXHJcbiAgICAnc2xpZGVyX190ZXh0LWx0JywgJ3NsaWRlcl9fdGV4dC1jdCcsICdzbGlkZXJfX3RleHQtcnQnLFxyXG4gICAgJ3NsaWRlcl9fdGV4dC1sYycsICdzbGlkZXJfX3RleHQtY2MnLCAnc2xpZGVyX190ZXh0LXJjJyxcclxuICAgICdzbGlkZXJfX3RleHQtbGInLCAnc2xpZGVyX190ZXh0LWNiJywgJ3NsaWRlcl9fdGV4dC1yYicsXHJcbiAgXTtcclxuICB2YXIgcG9zX2xpc3QgPSBbXHJcbiAgICAn0JvQtdCy0L4g0LLQtdGA0YUnLCAn0YbQtdC90YLRgCDQstC10YDRhScsICfQv9GA0LDQstC+INCy0LXRgNGFJyxcclxuICAgICfQm9C10LLQviDRhtC10L3RgtGAJywgJ9GG0LXQvdGC0YAnLCAn0L/RgNCw0LLQviDRhtC10L3RgtGAJyxcclxuICAgICfQm9C10LLQviDQvdC40LcnLCAn0YbQtdC90YLRgCDQvdC40LcnLCAn0L/RgNCw0LLQviDQvdC40LcnLFxyXG4gIF07XHJcbiAgdmFyIHNob3dfZGVsYXkgPSBbXHJcbiAgICAnc2hvd19ub19kZWxheScsXHJcbiAgICAnc2hvd19kZWxheV8wNScsXHJcbiAgICAnc2hvd19kZWxheV8xMCcsXHJcbiAgICAnc2hvd19kZWxheV8xNScsXHJcbiAgICAnc2hvd19kZWxheV8yMCcsXHJcbiAgICAnc2hvd19kZWxheV8yNScsXHJcbiAgICAnc2hvd19kZWxheV8zMCdcclxuICBdO1xyXG4gIHZhciBoaWRlX2RlbGF5ID0gW1xyXG4gICAgJ2hpZGVfbm9fZGVsYXknLFxyXG4gICAgJ2hpZGVfZGVsYXlfMDUnLFxyXG4gICAgJ2hpZGVfZGVsYXlfMTAnLFxyXG4gICAgJ2hpZGVfZGVsYXlfMTUnLFxyXG4gICAgJ2hpZGVfZGVsYXlfMjAnXHJcbiAgXTtcclxuICB2YXIgeWVzX25vX2FyciA9IFtcclxuICAgICdubycsXHJcbiAgICAneWVzJ1xyXG4gIF07XHJcbiAgdmFyIHllc19ub192YWwgPSBbXHJcbiAgICAnJyxcclxuICAgICdmaXhlZF9fZnVsbC1oZWlnaHQnXHJcbiAgXTtcclxuICB2YXIgYnRuX3N0eWxlID0gW1xyXG4gICAgJ25vbmUnLFxyXG4gICAgJ2JvcmRvJyxcclxuICBdO1xyXG4gIHZhciBzaG93X2FuaW1hdGlvbnMgPSBbXHJcbiAgICBcIm5vdF9hbmltYXRlXCIsXHJcbiAgICBcImJvdW5jZUluXCIsXHJcbiAgICBcImJvdW5jZUluRG93blwiLFxyXG4gICAgXCJib3VuY2VJbkxlZnRcIixcclxuICAgIFwiYm91bmNlSW5SaWdodFwiLFxyXG4gICAgXCJib3VuY2VJblVwXCIsXHJcbiAgICBcImZhZGVJblwiLFxyXG4gICAgXCJmYWRlSW5Eb3duXCIsXHJcbiAgICBcImZhZGVJbkxlZnRcIixcclxuICAgIFwiZmFkZUluUmlnaHRcIixcclxuICAgIFwiZmFkZUluVXBcIixcclxuICAgIFwiZmxpcEluWFwiLFxyXG4gICAgXCJmbGlwSW5ZXCIsXHJcbiAgICBcImxpZ2h0U3BlZWRJblwiLFxyXG4gICAgXCJyb3RhdGVJblwiLFxyXG4gICAgXCJyb3RhdGVJbkRvd25MZWZ0XCIsXHJcbiAgICBcInJvdGF0ZUluVXBMZWZ0XCIsXHJcbiAgICBcInJvdGF0ZUluVXBSaWdodFwiLFxyXG4gICAgXCJqYWNrSW5UaGVCb3hcIixcclxuICAgIFwicm9sbEluXCIsXHJcbiAgICBcInpvb21JblwiXHJcbiAgXTtcclxuXHJcbiAgdmFyIGhpZGVfYW5pbWF0aW9ucyA9IFtcclxuICAgIFwibm90X2FuaW1hdGVcIixcclxuICAgIFwiYm91bmNlT3V0XCIsXHJcbiAgICBcImJvdW5jZU91dERvd25cIixcclxuICAgIFwiYm91bmNlT3V0TGVmdFwiLFxyXG4gICAgXCJib3VuY2VPdXRSaWdodFwiLFxyXG4gICAgXCJib3VuY2VPdXRVcFwiLFxyXG4gICAgXCJmYWRlT3V0XCIsXHJcbiAgICBcImZhZGVPdXREb3duXCIsXHJcbiAgICBcImZhZGVPdXRMZWZ0XCIsXHJcbiAgICBcImZhZGVPdXRSaWdodFwiLFxyXG4gICAgXCJmYWRlT3V0VXBcIixcclxuICAgIFwiZmxpcE91dFhcIixcclxuICAgIFwibGlwT3V0WVwiLFxyXG4gICAgXCJsaWdodFNwZWVkT3V0XCIsXHJcbiAgICBcInJvdGF0ZU91dFwiLFxyXG4gICAgXCJyb3RhdGVPdXREb3duTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVPdXREb3duUmlnaHRcIixcclxuICAgIFwicm90YXRlT3V0VXBMZWZ0XCIsXHJcbiAgICBcInJvdGF0ZU91dFVwUmlnaHRcIixcclxuICAgIFwiaGluZ2VcIixcclxuICAgIFwicm9sbE91dFwiXHJcbiAgXTtcclxuICB2YXIgc3RUYWJsZTtcclxuICB2YXIgcGFyYWxheFRhYmxlO1xyXG5cclxuICBmdW5jdGlvbiBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWxzKSB7XHJcbiAgICBpZiAoZWxzLmxlbmd0aCA9PSAwKXJldHVybjtcclxuICAgIGVscy53cmFwKCc8ZGl2IGNsYXNzPVwic2VsZWN0X2ltZ1wiPicpO1xyXG4gICAgZWxzID0gZWxzLnBhcmVudCgpO1xyXG4gICAgZWxzLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmaWxlX2J1dHRvblwiPjxpIGNsYXNzPVwibWNlLWljbyBtY2UtaS1icm93c2VcIj48L2k+PC9idXR0b24+Jyk7XHJcbiAgICAvKmVscy5maW5kKCdidXR0b24nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcclxuICAgICAkKCcjcm94eUN1c3RvbVBhbmVsMicpLmFkZENsYXNzKCdvcGVuJylcclxuICAgICB9KTsqL1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gZWxzLmVxKGkpLmZpbmQoJ2lucHV0Jyk7XHJcbiAgICAgIGlmICghZWwuYXR0cignaWQnKSkge1xyXG4gICAgICAgIGVsLmF0dHIoJ2lkJywgJ2ZpbGVfJyArIGkgKyAnXycgKyBEYXRlLm5vdygpKVxyXG4gICAgICB9XHJcbiAgICAgIHZhciB0X2lkID0gZWwuYXR0cignaWQnKTtcclxuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLnJlZ2lzdGVyKHRfaWQsIGZ1bmN0aW9uIChmaWxlLCBpZCkge1xyXG4gICAgICAgIC8vJCh0aGlzKS52YWwoZmlsZS51cmwpLnRyaWdnZXIoJ2NoYW5nZScsIFtmaWxlLCBpZF0pO1xyXG4gICAgICAgICQoJyMnICsgaWQpLnZhbChmaWxlLnVybCkuY2hhbmdlKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZmlsZV9idXR0b24nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcykucHJldigpO1xyXG4gICAgICB2YXIgaWQgPSAkdGhpcy5hdHRyKCdpZCcpO1xyXG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIub3Blbk1hbmFnZXIoe1xyXG4gICAgICAgIFwidXJsXCI6IFwiL21hbmFnZXIvZWxmaW5kZXI/ZmlsdGVyPWltYWdlJmNhbGxiYWNrPVwiICsgaWQgKyBcIiZsYW5nPXJ1XCIsXHJcbiAgICAgICAgXCJ3aWR0aFwiOiBcImF1dG9cIixcclxuICAgICAgICBcImhlaWdodFwiOiBcImF1dG9cIixcclxuICAgICAgICBcImlkXCI6IGlkXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5JbnB1dChkYXRhKSB7XHJcbiAgICB2YXIgaW5wdXQgPSAnPGlucHV0IGNsYXNzPVwiJyArIChkYXRhLmlucHV0Q2xhc3MgfHwgJycpICsgJ1wiIHZhbHVlPVwiJyArIChkYXRhLnZhbHVlIHx8ICcnKSArICdcIj4nO1xyXG4gICAgaWYgKGRhdGEubGFiZWwpIHtcclxuICAgICAgaW5wdXQgPSAnPGxhYmVsPjxzcGFuPicgKyBkYXRhLmxhYmVsICsgJzwvc3Bhbj4nICsgaW5wdXQgKyAnPC9sYWJlbD4nO1xyXG4gICAgfVxyXG4gICAgaWYgKGRhdGEucGFyZW50KSB7XHJcbiAgICAgIGlucHV0ID0gJzwnICsgZGF0YS5wYXJlbnQgKyAnPicgKyBpbnB1dCArICc8LycgKyBkYXRhLnBhcmVudCArICc+JztcclxuICAgIH1cclxuICAgIGlucHV0ID0gJChpbnB1dCk7XHJcblxyXG4gICAgaWYgKGRhdGEub25DaGFuZ2UpIHtcclxuICAgICAgdmFyIG9uQ2hhbmdlO1xyXG4gICAgICBpZiAoZGF0YS5iaW5kKSB7XHJcbiAgICAgICAgZGF0YS5iaW5kLmlucHV0ID0gaW5wdXQuZmluZCgnaW5wdXQnKTtcclxuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChkYXRhLmJpbmQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGlucHV0LmZpbmQoJ2lucHV0JykpO1xyXG4gICAgICB9XHJcbiAgICAgIGlucHV0LmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIG9uQ2hhbmdlKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlucHV0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuU2VsZWN0KGRhdGEpIHtcclxuICAgIHZhciBpbnB1dCA9ICQoJzxzZWxlY3QvPicpO1xyXG5cclxuICAgIHZhciBlbCA9IHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdO1xyXG4gICAgaWYgKGRhdGEuaW5kZXggIT09IGZhbHNlKSB7XHJcbiAgICAgIGVsID0gZWxbZGF0YS5pbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVsW2RhdGEucGFyYW1dKSB7XHJcbiAgICAgIGRhdGEudmFsdWUgPSBlbFtkYXRhLnBhcmFtXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRhdGEudmFsdWUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkYXRhLnN0YXJ0X29wdGlvbikge1xyXG4gICAgICBpbnB1dC5hcHBlbmQoZGF0YS5zdGFydF9vcHRpb24pXHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHZhbDtcclxuICAgICAgdmFyIHR4dCA9IGRhdGEubGlzdFtpXTtcclxuICAgICAgaWYgKGRhdGEudmFsX3R5cGUgPT0gMCkge1xyXG4gICAgICAgIHZhbCA9IGRhdGEubGlzdFtpXTtcclxuICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbF90eXBlID09IDEpIHtcclxuICAgICAgICB2YWwgPSBpO1xyXG4gICAgICB9IGVsc2UgaWYgKGRhdGEudmFsX3R5cGUgPT0gMikge1xyXG4gICAgICAgIC8vdmFsPWRhdGEudmFsX2xpc3RbaV07XHJcbiAgICAgICAgdmFsID0gaTtcclxuICAgICAgICB0eHQgPSBkYXRhLnZhbF9saXN0W2ldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2VsID0gKHZhbCA9PSBkYXRhLnZhbHVlID8gJ3NlbGVjdGVkJyA6ICcnKTtcclxuICAgICAgaWYgKHNlbCA9PSAnc2VsZWN0ZWQnKSB7XHJcbiAgICAgICAgaW5wdXQuYXR0cigndF92YWwnLCBkYXRhLmxpc3RbaV0pO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBvcHRpb24gPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyB2YWwgKyAnXCIgJyArIHNlbCArICc+JyArIHR4dCArICc8L29wdGlvbj4nO1xyXG4gICAgICBpZiAoZGF0YS52YWxfdHlwZSA9PSAyKSB7XHJcbiAgICAgICAgb3B0aW9uID0gJChvcHRpb24pLmF0dHIoJ2NvZGUnLCBkYXRhLmxpc3RbaV0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlucHV0LmFwcGVuZChvcHRpb24pXHJcbiAgICB9XHJcblxyXG4gICAgaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgZGF0YSA9IHRoaXM7XHJcbiAgICAgIHZhciB2YWwgPSBkYXRhLmVsLnZhbCgpO1xyXG4gICAgICB2YXIgc2xfb3AgPSBkYXRhLmVsLmZpbmQoJ29wdGlvblt2YWx1ZT0nICsgdmFsICsgJ10nKTtcclxuICAgICAgdmFyIGNscyA9IHNsX29wLnRleHQoKTtcclxuICAgICAgdmFyIGNoID0gc2xfb3AuYXR0cignY29kZScpO1xyXG4gICAgICBpZiAoIWNoKWNoID0gY2xzO1xyXG4gICAgICBpZiAoZGF0YS5pbmRleCAhPT0gZmFsc2UpIHtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLmluZGV4XVtkYXRhLnBhcmFtXSA9IHZhbDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLnBhcmFtXSA9IHZhbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgZGF0YS5vYmoucmVtb3ZlQ2xhc3MoZGF0YS5wcmVmaXggKyBkYXRhLmVsLmF0dHIoJ3RfdmFsJykpO1xyXG4gICAgICBkYXRhLm9iai5hZGRDbGFzcyhkYXRhLnByZWZpeCArIGNoKTtcclxuICAgICAgZGF0YS5lbC5hdHRyKCd0X3ZhbCcsIGNoKTtcclxuXHJcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOiBpbnB1dCxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogZGF0YS5wYXJhbSxcclxuICAgICAgcHJlZml4OiBkYXRhLnByZWZpeCB8fCAnJ1xyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmIChkYXRhLnBhcmVudCkge1xyXG4gICAgICB2YXIgcGFyZW50ID0gJCgnPCcgKyBkYXRhLnBhcmVudCArICcvPicpO1xyXG4gICAgICBwYXJlbnQuYXBwZW5kKGlucHV0KTtcclxuICAgICAgcmV0dXJuIHBhcmVudDtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKGRhdGEpIHtcclxuICAgIHZhciBhbmltX3NlbCA9IFtdO1xyXG4gICAgdmFyIG91dDtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3NwYW4+Jyk7XHJcbiAgICB9XHJcbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHNob3dfYW5pbWF0aW9ucyxcclxuICAgICAgdmFsX3R5cGU6IDAsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ICdzaG93X2FuaW1hdGlvbicsXHJcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcclxuICAgIH0pKTtcclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj7Ql9Cw0LTQtdGA0LbQutCwINC/0L7Rj9Cy0LvQtdC90LjRjzwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogc2hvd19kZWxheSxcclxuICAgICAgdmFsX3R5cGU6IDEsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ICdzaG93X2RlbGF5JyxcclxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcclxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8YnIvPicpO1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogaGlkZV9hbmltYXRpb25zLFxyXG4gICAgICB2YWxfdHlwZTogMCxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogJ2hpZGVfYW5pbWF0aW9uJyxcclxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcclxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCX0LDQtNC10YDQttC60LAg0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBoaWRlX2RlbGF5LFxyXG4gICAgICB2YWxfdHlwZTogMSxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogJ2hpZGVfZGVsYXknLFxyXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XHJcbiAgICB9KSk7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XHJcbiAgICAgIG91dCA9ICQoJzxkaXYgY2xhc3M9XCJhbmltX3NlbFwiLz4nKTtcclxuICAgICAgb3V0LmFwcGVuZChhbmltX3NlbCk7XHJcbiAgICB9XHJcbiAgICBpZiAoZGF0YS50eXBlID09IDEpIHtcclxuICAgICAgb3V0ID0gYW5pbV9zZWw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG91dDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRfZWRpdG9yKCkge1xyXG4gICAgJCgnI3cxJykucmVtb3ZlKCk7XHJcbiAgICAkKCcjdzFfYnV0dG9uJykucmVtb3ZlKCk7XHJcbiAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUuc3BsaXQoJz8nKVswXTtcclxuXHJcbiAgICB2YXIgZWwgPSAkKCcjbWVnYV9zbGlkZXJfY29udHJvbGUnKTtcclxuICAgIHZhciBidG5zX2JveCA9ICQoJzxkaXYgY2xhc3M9XCJidG5fYm94XCIvPicpO1xyXG5cclxuICAgIGVsLmFwcGVuZCgnPGgyPtCj0L/RgNCw0LLQu9C10L3QuNC1PC9oMj4nKTtcclxuICAgIGVsLmFwcGVuZCgkKCc8dGV4dGFyZWEvPicsIHtcclxuICAgICAgdGV4dDogSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pLFxyXG4gICAgICBpZDogJ3NsaWRlX2RhdGEnLFxyXG4gICAgICBuYW1lOiBlZGl0b3JcclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgYnRuID0gJCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XHJcbiAgICBidG5zX2JveC5hcHBlbmQoYnRuKTtcclxuICAgIGJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkucmVtb3ZlQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBidG4gPSAkKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQlNC10LDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XHJcbiAgICBidG5zX2JveC5hcHBlbmQoYnRuKTtcclxuICAgIGJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcclxuICAgIH0pO1xyXG4gICAgZWwuYXBwZW5kKGJ0bnNfYm94KTtcclxuXHJcbiAgICBlbC5hcHBlbmQoJzxoMj7QntCx0YnQuNC1INC/0LDRgNCw0LzQtdGC0YDRizwvaDI+Jyk7XHJcbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0ubW9iaWxlLFxyXG4gICAgICBsYWJlbDogXCLQodC70LDQudC0INC00LvRjyDRgtC10LvQtdGE0L7QvdCwXCIsXHJcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gJCh0aGlzKS52YWwoKVxyXG4gICAgICAgICQoJy5tb2JfYmcnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnKScpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG5cclxuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5mb24sXHJcbiAgICAgIGxhYmVsOiBcItCe0YHQvdC+0L3QvtC5INGE0L7QvVwiLFxyXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZvbiA9ICQodGhpcykudmFsKClcclxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgc2xpZGVyX2RhdGFbMF0uZm9uICsgJyknKVxyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG5cclxuICAgIHZhciBidG5fY2ggPSAkKCc8ZGl2IGNsYXNzPVwiYnRuc1wiLz4nKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQoJzxoMz7QmtC90L7Qv9C60LAg0L/QtdGA0LXRhdC+0LTQsCjQtNC70Y8g0J/QmiDQstC10YDRgdC40LgpPC9oMz4nKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQsXHJcbiAgICAgIGxhYmVsOiBcItCi0LXQutGB0YJcIixcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0ID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApLnRleHQoc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfSxcclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgYnV0X3NsID0gJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKTtcclxuXHJcbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZCgnPHNwYW4+0J7RhNC+0YDQvNC70LXQvdC40LUg0LrQvdC+0L/QutC4PC9zcGFuPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBidG5fc3R5bGUsXHJcbiAgICAgIHZhbF90eXBlOiAwLFxyXG4gICAgICBvYmo6IGJ1dF9zbCxcclxuICAgICAgZ3I6ICdidXR0b24nLFxyXG4gICAgICBpbmRleDogZmFsc2UsXHJcbiAgICAgIHBhcmFtOiAnY29sb3InXHJcbiAgICB9KSk7XHJcblxyXG4gICAgYnRuX2NoLmFwcGVuZCgnPGJyLz4nKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQoJzxzcGFuPtCf0L7Qu9C+0LbQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHBvc0FycixcclxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxyXG4gICAgICB2YWxfdHlwZTogMixcclxuICAgICAgb2JqOiBidXRfc2wucGFyZW50KCkucGFyZW50KCksXHJcbiAgICAgIGdyOiAnYnV0dG9uJyxcclxuICAgICAgaW5kZXg6IGZhbHNlLFxyXG4gICAgICBwYXJhbTogJ3BvcydcclxuICAgIH0pKTtcclxuXHJcbiAgICBidG5fY2guYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgb2JqOiBidXRfc2wucGFyZW50KCksXHJcbiAgICAgIGdyOiAnYnV0dG9uJyxcclxuICAgICAgaW5kZXg6IGZhbHNlXHJcbiAgICB9KSk7XHJcbiAgICBlbC5hcHBlbmQoYnRuX2NoKTtcclxuXHJcbiAgICB2YXIgbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwiZml4ZWRfbGF5ZXJcIi8+Jyk7XHJcbiAgICBsYXllci5hcHBlbmQoJzxoMj7QodGC0LDRgtC40YfQtdGB0LrQuNC1INGB0LvQvtC4PC9oMj4nKTtcclxuICAgIHZhciB0aCA9IFwiPHRoPuKEljwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QodC70L7QuSDQvdCwINCy0YHRjiDQstGL0YHQvtGC0YM8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XHJcbiAgICBzdFRhYmxlID0gJCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+JyArIHRoICsgJzwvdHI+PC90YWJsZT4nKTtcclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbMF0uZml4ZWQ7XHJcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYWRkVHJTdGF0aWMoZGF0YVtpXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGxheWVyLmFwcGVuZChzdFRhYmxlKTtcclxuICAgIHZhciBhZGRCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XHJcbiAgICAgIHRleHQ6IFwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXHJcbiAgICB9KTtcclxuICAgIGFkZEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGRhdGEgPSBhZGRUclN0YXRpYyhmYWxzZSk7XHJcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xyXG4gICAgZWwuYXBwZW5kKGxheWVyKTtcclxuXHJcbiAgICB2YXIgbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxheF9sYXllclwiLz4nKTtcclxuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCf0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lg8L2gyPicpO1xyXG4gICAgdmFyIHRoID0gXCI8dGg+4oSWPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCj0LTQsNC70LXQvdC90L7RgdGC0YwgKNGG0LXQu9C+0LUg0L/QvtC70L7QttC40YLQtdC70YzQvdC+0LUg0YfQuNGB0LvQvik8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XHJcblxyXG4gICAgcGFyYWxheFRhYmxlID0gJCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+JyArIHRoICsgJzwvdHI+PC90YWJsZT4nKTtcclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbMF0ucGFyYWxheDtcclxuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhZGRUclBhcmFsYXgoZGF0YVtpXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGxheWVyLmFwcGVuZChwYXJhbGF4VGFibGUpO1xyXG4gICAgdmFyIGFkZEJ0biA9ICQoJzxidXR0b24vPicsIHtcclxuICAgICAgdGV4dDogXCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcclxuICAgIH0pO1xyXG4gICAgYWRkQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZGF0YSA9IGFkZFRyUGFyYWxheChmYWxzZSk7XHJcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuXHJcbiAgICBsYXllci5hcHBlbmQoYWRkQnRuKTtcclxuICAgIGVsLmFwcGVuZChsYXllcik7XHJcblxyXG4gICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGVsLmZpbmQoJy5maWxlU2VsZWN0JykpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkVHJTdGF0aWMoZGF0YSkge1xyXG4gICAgdmFyIGkgPSBzdFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoIC0gMTtcclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICBkYXRhID0ge1xyXG4gICAgICAgIFwiaW1nXCI6IFwiXCIsXHJcbiAgICAgICAgXCJmdWxsX2hlaWdodFwiOiAwLFxyXG4gICAgICAgIFwicG9zXCI6IDAsXHJcbiAgICAgICAgXCJzaG93X2RlbGF5XCI6IDEsXHJcbiAgICAgICAgXCJzaG93X2FuaW1hdGlvblwiOiBcImxpZ2h0U3BlZWRJblwiLFxyXG4gICAgICAgIFwiaGlkZV9kZWxheVwiOiAxLFxyXG4gICAgICAgIFwiaGlkZV9hbmltYXRpb25cIjogXCJib3VuY2VPdXRcIlxyXG4gICAgICB9O1xyXG4gICAgICBzbGlkZXJfZGF0YVswXS5maXhlZC5wdXNoKGRhdGEpO1xyXG4gICAgICB2YXIgZml4ID0gJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCcpO1xyXG4gICAgICBhZGRTdGF0aWNMYXllcihkYXRhLCBmaXgsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgO1xyXG5cclxuICAgIHZhciB0ciA9ICQoJzx0ci8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogZGF0YS5pbWcsXHJcbiAgICAgIGxhYmVsOiBmYWxzZSxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcclxuICAgICAgYmluZDoge1xyXG4gICAgICAgIGdyOiAnZml4ZWQnLFxyXG4gICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcclxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcclxuICAgICAgfSxcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmlucHV0LnZhbCgpICsgJyknKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5maXhlZFtkYXRhLmluZGV4XS5pbWcgPSBkYXRhLmlucHV0LnZhbCgpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHBvc0FycixcclxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxyXG4gICAgICB2YWxfdHlwZTogMixcclxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKSxcclxuICAgICAgZ3I6ICdmaXhlZCcsXHJcbiAgICAgIGluZGV4OiBpLFxyXG4gICAgICBwYXJhbTogJ3BvcycsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiB5ZXNfbm9fdmFsLFxyXG4gICAgICB2YWxfbGlzdDogeWVzX25vX2FycixcclxuICAgICAgdmFsX3R5cGU6IDIsXHJcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXHJcbiAgICAgIGdyOiAnZml4ZWQnLFxyXG4gICAgICBpbmRleDogaSxcclxuICAgICAgcGFyYW06ICdmdWxsX2hlaWdodCcsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XHJcbiAgICAgIHR5cGU6IDEsXHJcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxyXG4gICAgICBncjogJ2ZpeGVkJyxcclxuICAgICAgaW5kZXg6IGksXHJcbiAgICAgIHBhcmVudDogJ3RkJ1xyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0biA9ICQoJzxidXR0b24vPicsIHtcclxuICAgICAgdGV4dDogXCLQo9C00LDQu9C40YLRjFwiXHJcbiAgICB9KTtcclxuICAgIGRlbEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcy5lbCk7XHJcbiAgICAgIGkgPSAkdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCkgLSAxO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcclxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcclxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5maXhlZC5zcGxpY2UoaSwgMSk7IC8v0YPQtNCw0LvRj9C10Lwg0LjQtyDQutC+0L3RhNC40LPQsCDRgdC70LDQudC00LBcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBlbDogZGVsQnRuLFxyXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuICAgIHZhciBkZWxCdG5UZCA9ICQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XHJcbiAgICB0ci5hcHBlbmQoZGVsQnRuVGQpO1xyXG4gICAgc3RUYWJsZS5hcHBlbmQodHIpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZWRpdG9yOiB0cixcclxuICAgICAgZGF0YTogZGF0YVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkVHJQYXJhbGF4KGRhdGEpIHtcclxuICAgIHZhciBpID0gcGFyYWxheFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoIC0gMTtcclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICBkYXRhID0ge1xyXG4gICAgICAgIFwiaW1nXCI6IFwiXCIsXHJcbiAgICAgICAgXCJ6XCI6IDFcclxuICAgICAgfTtcclxuICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheC5wdXNoKGRhdGEpO1xyXG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwJyk7XHJcbiAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKTtcclxuICAgIH1cclxuICAgIDtcclxuICAgIHZhciB0ciA9ICQoJzx0ci8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogZGF0YS5pbWcsXHJcbiAgICAgIGxhYmVsOiBmYWxzZSxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcclxuICAgICAgYmluZDoge1xyXG4gICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcclxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXHJcbiAgICAgIH0sXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbnB1dC52YWwoKSArICcpJyk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS5pbWcgPSBkYXRhLmlucHV0LnZhbCgpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHBvc0FycixcclxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxyXG4gICAgICB2YWxfdHlwZTogMixcclxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxyXG4gICAgICBncjogJ3BhcmFsYXgnLFxyXG4gICAgICBpbmRleDogaSxcclxuICAgICAgcGFyYW06ICdwb3MnLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICAgIHN0YXJ0X29wdGlvbjogJzxvcHRpb24gdmFsdWU9XCJcIiBjb2RlPVwiXCI+0L3QsCDQstC10YHRjCDRjdC60YDQsNC9PC9vcHRpb24+J1xyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IGRhdGEueixcclxuICAgICAgbGFiZWw6IGZhbHNlLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICAgIGJpbmQ6IHtcclxuICAgICAgICBpbmRleDogaSxcclxuICAgICAgICBwYXJhbTogJ2ltZycsXHJcbiAgICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSksXHJcbiAgICAgIH0sXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICAgICAgZGF0YS5vYmouYXR0cigneicsIGRhdGEuaW5wdXQudmFsKCkpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0ueiA9IGRhdGEuaW5wdXQudmFsKCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGRlbEJ0biA9ICQoJzxidXR0b24vPicsIHtcclxuICAgICAgdGV4dDogXCLQo9C00LDQu9C40YLRjFwiXHJcbiAgICB9KTtcclxuICAgIGRlbEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcy5lbCk7XHJcbiAgICAgIGkgPSAkdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCkgLSAxO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcclxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcclxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5wYXJhbGF4LnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOiBkZWxCdG4sXHJcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0blRkID0gJCgnPHRkLz4nKS5hcHBlbmQoZGVsQnRuKTtcclxuICAgIHRyLmFwcGVuZChkZWxCdG5UZCk7XHJcbiAgICBwYXJhbGF4VGFibGUuYXBwZW5kKHRyKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVkaXRvcjogdHIsXHJcbiAgICAgIGRhdGE6IGRhdGFcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZF9hbmltYXRpb24oZWwsIGRhdGEpIHtcclxuICAgIHZhciBvdXQgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICdjbGFzcyc6ICdhbmltYXRpb25fbGF5ZXInXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAodHlwZW9mKGRhdGEuc2hvd19kZWxheSkgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgb3V0LmFkZENsYXNzKHNob3dfZGVsYXlbZGF0YS5zaG93X2RlbGF5XSk7XHJcbiAgICAgIGlmIChkYXRhLnNob3dfYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nICsgZGF0YS5zaG93X2FuaW1hdGlvbik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mKGRhdGEuaGlkZV9kZWxheSkgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgb3V0LmFkZENsYXNzKGhpZGVfZGVsYXlbZGF0YS5oaWRlX2RlbGF5XSk7XHJcbiAgICAgIGlmIChkYXRhLmhpZGVfYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nICsgZGF0YS5oaWRlX2FuaW1hdGlvbik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBlbC5hcHBlbmQob3V0KTtcclxuICAgIHJldHVybiBlbDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlX3NsaWRlKGRhdGEpIHtcclxuICAgIHZhciBzbGlkZSA9ICQoJzxkaXYgY2xhc3M9XCJzbGlkZVwiLz4nKTtcclxuXHJcbiAgICB2YXIgbW9iX2JnID0gJCgnPGEgY2xhc3M9XCJtb2JfYmdcIiBocmVmPVwiJyArIGRhdGEuYnV0dG9uLmhyZWYgKyAnXCIvPicpO1xyXG4gICAgbW9iX2JnLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEubW9iaWxlICsgJyknKVxyXG5cclxuICAgIHNsaWRlLmFwcGVuZChtb2JfYmcpO1xyXG4gICAgaWYgKG1vYmlsZV9tb2RlKSB7XHJcbiAgICAgIHJldHVybiBzbGlkZTtcclxuICAgIH1cclxuXHJcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINGE0L7QvSDRgtC+INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgaWYgKGRhdGEuZm9uKSB7XHJcbiAgICAgIHNsaWRlLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuZm9uICsgJyknKVxyXG4gICAgfVxyXG5cclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIGlmIChkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIHBhcmFsYXhfZ3IgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2dyb3VwXCIvPicpO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGFyYWxheC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLnBhcmFsYXhbaV0sIHBhcmFsYXhfZ3IpXHJcbiAgICAgIH1cclxuICAgICAgc2xpZGUuYXBwZW5kKHBhcmFsYXhfZ3IpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGZpeCA9ICQoJzxkaXYgY2xhc3M9XCJmaXhlZF9ncm91cFwiLz4nKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICBhZGRTdGF0aWNMYXllcihkYXRhLmZpeGVkW2ldLCBmaXgpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRvcF9ibGsgPSAkKFwiPGRpdiBjbGFzcz0nZml4ZWRfX2xheWVyJy8+XCIpO1xyXG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5idXR0b24ucG9zXSk7XHJcbiAgICB2YXIgYnV0ID0gJChcIjxhIGNsYXNzPSdzbGlkZXJfX2hyZWYnLz5cIik7XHJcbiAgICBidXQuYXR0cignaHJlZicsIGRhdGEuYnV0dG9uLmhyZWYpO1xyXG4gICAgYnV0LnRleHQoZGF0YS5idXR0b24udGV4dCk7XHJcbiAgICBidXQuYWRkQ2xhc3MoZGF0YS5idXR0b24uY29sb3IpO1xyXG4gICAgZG9wX2JsayA9IGFkZF9hbmltYXRpb24oZG9wX2JsaywgZGF0YS5idXR0b24pO1xyXG4gICAgZG9wX2Jsay5maW5kKCdkaXYnKS5hcHBlbmQoYnV0KTtcclxuICAgIGZpeC5hcHBlbmQoZG9wX2Jsayk7XHJcblxyXG4gICAgc2xpZGUuYXBwZW5kKGZpeCk7XHJcbiAgICByZXR1cm4gc2xpZGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRQYXJhbGF4TGF5ZXIoZGF0YSwgcGFyYWxheF9ncikge1xyXG4gICAgdmFyIHBhcmFsbGF4X2xheWVyID0gJCgnPGRpdiBjbGFzcz1cInBhcmFsbGF4X19sYXllclwiXFw+Jyk7XHJcbiAgICBwYXJhbGxheF9sYXllci5hdHRyKCd6JywgZGF0YS56IHx8IGkgKiAxMCk7XHJcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8c3BhbiBjbGFzcz0nc2xpZGVyX190ZXh0Jy8+XCIpO1xyXG4gICAgaWYgKGRhdGEucG9zKSB7XHJcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XHJcbiAgICB9XHJcbiAgICBkb3BfYmxrLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcclxuICAgIHBhcmFsbGF4X2xheWVyLmFwcGVuZChkb3BfYmxrKTtcclxuICAgIHBhcmFsYXhfZ3IuYXBwZW5kKHBhcmFsbGF4X2xheWVyKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCwgYmVmb3JfYnV0dG9uKSB7XHJcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XHJcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLnBvc10pO1xyXG4gICAgaWYgKGRhdGEuZnVsbF9oZWlnaHQpIHtcclxuICAgICAgZG9wX2Jsay5hZGRDbGFzcygnZml4ZWRfX2Z1bGwtaGVpZ2h0Jyk7XHJcbiAgICB9XHJcbiAgICBkb3BfYmxrID0gYWRkX2FuaW1hdGlvbihkb3BfYmxrLCBkYXRhKTtcclxuICAgIGRvcF9ibGsuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcclxuXHJcbiAgICBpZiAoYmVmb3JfYnV0dG9uKSB7XHJcbiAgICAgIGZpeC5maW5kKCcuc2xpZGVyX19ocmVmJykuY2xvc2VzdCgnLmZpeGVkX19sYXllcicpLmJlZm9yZShkb3BfYmxrKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZml4LmFwcGVuZChkb3BfYmxrKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcclxuICAgIGlmICgkKCcjbWVnYV9zbGlkZXInKS5oYXNDbGFzcygnc3RvcF9zbGlkZScpKXJldHVybjtcclxuXHJcbiAgICB2YXIgc2xpZGVfcG9pbnRzID0gJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlX3NlbGVjdCcpXHJcbiAgICB2YXIgc2xpZGVfY250ID0gc2xpZGVfcG9pbnRzLmxlbmd0aDtcclxuICAgIHZhciBhY3RpdmUgPSAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVyLWFjdGl2ZScpLmluZGV4KCkgKyAxO1xyXG4gICAgaWYgKGFjdGl2ZSA+PSBzbGlkZV9jbnQpYWN0aXZlID0gMDtcclxuICAgIHNsaWRlX3BvaW50cy5lcShhY3RpdmUpLmNsaWNrKCk7XHJcblxyXG4gICAgc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGltZ190b19sb2FkKHNyYykge1xyXG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xyXG4gICAgaW1nLm9uKCdsb2FkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB0b3RfaW1nX3dhaXQtLTtcclxuXHJcbiAgICAgIGlmICh0b3RfaW1nX3dhaXQgPT0gMCkge1xyXG5cclxuICAgICAgICBzbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dKSk7XHJcbiAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKHJlbmRlcl9zbGlkZV9ub20pLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgICAgICBpZiAocmVuZGVyX3NsaWRlX25vbSA9PSAwKSB7XHJcbiAgICAgICAgICBzbGlkZXMuZmluZCgnLnNsaWRlJylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93JylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICBpZiAoIWVkaXRvcikge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5maXJzdF9zaG93JykucmVtb3ZlQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcclxuICAgICAgICAgICAgfS5iaW5kKHNsaWRlcyksIDUwMDApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChtb2JpbGVfbW9kZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XHJcbiAgICAgICAgICAgIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICBwYXJhbGxheF90aW1lciA9IHNldEludGVydmFsKHJlbmRlciwgMTAwKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoZWRpdG9yKSB7XHJcbiAgICAgICAgICAgIGluaXRfZWRpdG9yKClcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XHJcblxyXG4gICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCcpLm9uKCdjbGljaycsICcuc2xpZGVfc2VsZWN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdzbGlkZXItYWN0aXZlJykpcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkdGhpcy5pbmRleCgpO1xyXG4gICAgICAgICAgICAgICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGUnKS5lcShpbmRleCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuaG92ZXIoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xyXG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmFkZENsYXNzKCdzdG9wX3NsaWRlJyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xyXG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLnJlbW92ZUNsYXNzKCdzdG9wX3NsaWRlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVyX3NsaWRlX25vbSsrO1xyXG4gICAgICAgIGlmIChyZW5kZXJfc2xpZGVfbm9tIDwgc2xpZGVyX2RhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgICBsb2FkX3NsaWRlX2ltZygpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KS5vbignZXJyb3InLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xyXG4gICAgfSk7XHJcbiAgICBpbWcucHJvcCgnc3JjJywgc3JjKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGxvYWRfc2xpZGVfaW1nKCkge1xyXG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVtyZW5kZXJfc2xpZGVfbm9tXTtcclxuICAgIHRvdF9pbWdfd2FpdCA9IDE7XHJcblxyXG4gICAgaWYgKG1vYmlsZV9tb2RlID09PSBmYWxzZSkge1xyXG4gICAgICB0b3RfaW1nX3dhaXQrKztcclxuICAgICAgaW1nX3RvX2xvYWQoZGF0YS5mb24pO1xyXG4gICAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XHJcbiAgICAgIGlmIChkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0b3RfaW1nX3dhaXQgKz0gZGF0YS5wYXJhbGF4Lmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGFyYWxheC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5wYXJhbGF4W2ldLmltZylcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRhdGEuZml4ZWQgJiYgZGF0YS5maXhlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEuZml4ZWQubGVuZ3RoO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5maXhlZFtpXS5pbWcpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW1nX3RvX2xvYWQoZGF0YS5tb2JpbGUpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3RhcnRfaW5pdF9zbGlkZShkYXRhKSB7XHJcbiAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xyXG4gICAgaW1nLmF0dHIoJ3RpbWUnLCBuKTtcclxuXHJcbiAgICBmdW5jdGlvbiBvbl9pbWdfbG9hZCgpIHtcclxuICAgICAgdmFyIG4gPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgaW1nID0gJCh0aGlzKTtcclxuICAgICAgbiA9IG4gLSBwYXJzZUludChpbWcuYXR0cigndGltZScpKTtcclxuICAgICAgaWYgKG4gPiBtYXhfdGltZV9sb2FkX3BpYykge1xyXG4gICAgICAgIG1vYmlsZV9tb2RlID0gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgbWF4X3NpemUgPSAoc2NyZWVuLmhlaWdodCA+IHNjcmVlbi53aWR0aCA/IHNjcmVlbi5oZWlnaHQgOiBzY3JlZW4ud2lkdGgpO1xyXG4gICAgICAgIGlmIChtYXhfc2l6ZSA8IG1vYmlsZV9zaXplKSB7XHJcbiAgICAgICAgICBtb2JpbGVfbW9kZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vYmlsZV9tb2RlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChtb2JpbGVfbW9kZSA9PSB0cnVlKSB7XHJcbiAgICAgICAgJChjb250YWluZXJfaWQpLmFkZENsYXNzKCdtb2JpbGVfbW9kZScpXHJcbiAgICAgIH1cclxuICAgICAgcmVuZGVyX3NsaWRlX25vbSA9IDA7XHJcbiAgICAgIGxvYWRfc2xpZGVfaW1nKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGltZy5vbignbG9hZCcsIG9uX2ltZ19sb2FkKCkpO1xyXG4gICAgaWYgKHNsaWRlcl9kYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gc2xpZGVyX2RhdGFbMF0ubW9iaWxlICsgJz9yPScgKyBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICBpbWcucHJvcCgnc3JjJywgc2xpZGVyX2RhdGFbMF0ubW9iaWxlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG9uX2ltZ19sb2FkKCkuYmluZChpbWcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdChkYXRhLCBlZGl0b3JfaW5pdCkge1xyXG4gICAgc2xpZGVyX2RhdGEgPSBkYXRhO1xyXG4gICAgZWRpdG9yID0gZWRpdG9yX2luaXQ7XHJcbiAgICAvL9C90LDRhdC+0LTQuNC8INC60L7QvdGC0LXQudC90LXRgCDQuCDQvtGH0LjRidCw0LXQvCDQtdCz0L5cclxuICAgIHZhciBjb250YWluZXIgPSAkKGNvbnRhaW5lcl9pZCk7XHJcbiAgICBjb250YWluZXIuaHRtbCgnJyk7XHJcblxyXG4gICAgLy/RgdC+0LfQttCw0LXQvCDQsdCw0LfQvtCy0YvQtSDQutC+0L3RgtC10LnQvdC10YDRiyDQtNC70Y8g0YHQsNC80LjRhSDRgdC70LDQudC00L7QsiDQuCDQtNC70Y8g0L/QtdGA0LXQutC70Y7Rh9Cw0YLQtdC70LXQuVxyXG4gICAgc2xpZGVzID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAnY2xhc3MnOiAnc2xpZGVzJ1xyXG4gICAgfSk7XHJcbiAgICB2YXIgc2xpZGVfY29udHJvbCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgJ2NsYXNzJzogJ3NsaWRlX2NvbnRyb2wnXHJcbiAgICB9KTtcclxuICAgIHNsaWRlX3NlbGVjdF9ib3ggPSAkKCc8dWwvPicsIHtcclxuICAgICAgJ2NsYXNzJzogJ3NsaWRlX3NlbGVjdF9ib3gnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQuNC90LTQuNC60LDRgtC+0YAg0LfQsNCz0YDRg9C30LrQuFxyXG4gICAgdmFyIGwgPSAnPGRpdiBjbGFzcz1cInNrLWZvbGRpbmctY3ViZVwiPicgK1xyXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUxIHNrLWN1YmVcIj48L2Rpdj4nICtcclxuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMiBzay1jdWJlXCI+PC9kaXY+JyArXHJcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTQgc2stY3ViZVwiPjwvZGl2PicgK1xyXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUzIHNrLWN1YmVcIj48L2Rpdj4nICtcclxuICAgICAgJzwvZGl2Pic7XHJcbiAgICBjb250YWluZXIuaHRtbChsKTtcclxuXHJcblxyXG4gICAgc3RhcnRfaW5pdF9zbGlkZShkYXRhWzBdKTtcclxuXHJcbiAgICAvL9Cz0LXQvdC10YDQuNGA0YPQtdC8INC60L3QvtC/0LrQuCDQuCDRgdC70LDQudC00YtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAvL3NsaWRlcy5hcHBlbmQoZ2VuZXJhdGVfc2xpZGUoZGF0YVtpXSkpO1xyXG4gICAgICBzbGlkZV9zZWxlY3RfYm94LmFwcGVuZCgnPGxpIGNsYXNzPVwic2xpZGVfc2VsZWN0IGRpc2FibGVkXCIvPicpXHJcbiAgICB9XHJcblxyXG4gICAgLypzbGlkZXMuZmluZCgnLnNsaWRlJykuZXEoMClcclxuICAgICAuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKVxyXG4gICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpO1xyXG4gICAgIHNsaWRlX2NvbnRyb2wuZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpOyovXHJcblxyXG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZXMpO1xyXG4gICAgc2xpZGVfY29udHJvbC5hcHBlbmQoc2xpZGVfc2VsZWN0X2JveCk7XHJcbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlX2NvbnRyb2wpO1xyXG5cclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICBpZiAoIXBhcmFsbGF4X2dyb3VwKXJldHVybiBmYWxzZTtcclxuICAgIHZhciBwYXJhbGxheF9rID0gKHBhcmFsbGF4X2NvdW50ZXIgLSAxMCkgLyAyO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYWxsYXhfZ3JvdXAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gcGFyYWxsYXhfZ3JvdXAuZXEoaSk7XHJcbiAgICAgIHZhciBqID0gZWwuYXR0cigneicpO1xyXG4gICAgICB2YXIgdHIgPSAncm90YXRlM2QoMC4xLDAuOCwwLCcgKyAocGFyYWxsYXhfaykgKyAnZGVnKSBzY2FsZSgnICsgKDEgKyBqICogMC41KSArICcpIHRyYW5zbGF0ZVooLScgKyAoMTAgKyBqICogMjApICsgJ3B4KSc7XHJcbiAgICAgIGVsLmNzcygndHJhbnNmb3JtJywgdHIpXHJcbiAgICB9XHJcbiAgICBwYXJhbGxheF9jb3VudGVyICs9IHBhcmFsbGF4X2QgKiAwLjE7XHJcbiAgICBpZiAocGFyYWxsYXhfY291bnRlciA+PSAyMClwYXJhbGxheF9kID0gLXBhcmFsbGF4X2Q7XHJcbiAgICBpZiAocGFyYWxsYXhfY291bnRlciA8PSAwKXBhcmFsbGF4X2QgPSAtcGFyYWxsYXhfZDtcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBpbml0OiBpbml0XHJcbiAgfTtcclxufSgpKTtcclxuIiwidmFyIGhlYWRlckFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG4gIHZhciBzaGFkb3dlZERvd24gPSBmYWxzZTtcclxuXHJcbiAgJCgnLm1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgICQoJy5kcm9wLW1lbnUnKS5yZW1vdmVDbGFzcygnb3BlbicpLnJlbW92ZUNsYXNzKCdjbG9zZScpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKSkge1xyXG4gICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnLnNlYXJjaC10b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xyXG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XHJcbiAgICAkKCcjYXV0b2NvbXBsZXRlJykuZmFkZU91dCgpO1xyXG4gICAgaWYgKCQoJy5oZWFkZXInKS5oYXNDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJykpIHtcclxuICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJyNoZWFkZXInKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKGUudGFyZ2V0LmlkID09ICdoZWFkZXInKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XHJcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQodGhpcykuY2xvc2VzdCgnZm9ybScpLnN1Ym1pdCgpO1xyXG4gIH0pO1xyXG5cclxuICAkKCcuaGVhZGVyLXNlY29uZGxpbmVfY2xvc2UnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmhlYWRlci11cGxpbmUnKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICghc2Nyb2xsZWREb3duKXJldHVybjtcclxuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDEwMjQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgc2Nyb2xsZWREb3duID0gZmFsc2U7XHJcbiAgfSk7XHJcblxyXG4gICQod2luZG93KS5vbignbG9hZCByZXNpemUgc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHNoYWRvd0hlaWdodCA9IDUwO1xyXG4gICAgdmFyIGhpZGVIZWlnaHQgPSAyMDA7XHJcbiAgICB2YXIgaGVhZGVyU2Vjb25kTGluZSA9ICQoJy5oZWFkZXItc2Vjb25kbGluZScpO1xyXG4gICAgdmFyIGhvdmVycyA9IGhlYWRlclNlY29uZExpbmUuZmluZCgnOmhvdmVyJyk7XHJcbiAgICB2YXIgaGVhZGVyID0gJCgnLmhlYWRlcicpO1xyXG5cclxuICAgIGlmICghaG92ZXJzLmxlbmd0aCkge1xyXG4gICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzY3JvbGxhYmxlJyk7XHJcbiAgICAgIGhlYWRlci5yZW1vdmVDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgICAvL2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3BcclxuICAgICAgdmFyIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuICAgICAgaWYgKHNjcm9sbFRvcCA+IHNoYWRvd0hlaWdodCAmJiBzaGFkb3dlZERvd24gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgc2hhZG93ZWREb3duID0gdHJ1ZTtcclxuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzaGFkb3dlZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzY3JvbGxUb3AgPD0gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHNoYWRvd2VkRG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3NoYWRvd2VkJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNjcm9sbFRvcCA+IGhpZGVIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSBmYWxzZSkge1xyXG4gICAgICAgIHNjcm9sbGVkRG93biA9IHRydWU7XHJcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoc2Nyb2xsVG9wIDw9IGhpZGVIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSB0cnVlKSB7XHJcbiAgICAgICAgc2Nyb2xsZWREb3duID0gZmFsc2U7XHJcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgICBoZWFkZXIuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnLm1lbnVfYW5nbGUtZG93biwgLmRyb3AtbWVudV9ncm91cF9fdXAtaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBtZW51T3BlbiA9ICQodGhpcykuY2xvc2VzdCgnLmhlYWRlcl9vcGVuLW1lbnUsIC5jYXRhbG9nLWNhdGVnb3JpZXMnKTtcclxuICAgIGlmICghbWVudU9wZW4ubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIHBhcmVudCA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudV9ncm91cF9fdXAsIC5tZW51LWdyb3VwJyk7XHJcbiAgICB2YXIgcGFyZW50TWVudSA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudScpO1xyXG4gICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICB9XHJcbiAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAkKHBhcmVudCkudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgaWYgKHBhcmVudC5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAgICAgJChwYXJlbnQpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICBpZiAocGFyZW50TWVudSkge1xyXG4gICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICBpZiAocGFyZW50TWVudSkge1xyXG4gICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG5cclxuICB2YXIgYWNjb3VudE1lbnVUaW1lT3V0ID0gbnVsbDtcclxuICB2YXIgYWNjb3VudE1lbnVPcGVuVGltZSA9IDA7XHJcbiAgdmFyIGFjY291bnRNZW51ID0gJCgnLmFjY291bnQtbWVudScpO1xyXG5cclxuICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPiAxMDI0KSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgdmFyIHRoYXQgPSAkKHRoaXMpO1xyXG5cclxuICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcclxuXHJcbiAgICBpZiAoYWNjb3VudE1lbnUuaGFzQ2xhc3MoJ2hpZGRlbicpKSB7XHJcbiAgICAgIG1lbnVBY2NvdW50VXAodGhhdCk7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhhdC5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICBhY2NvdW50TWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8v0L/QvtC60LDQtyDQvNC10L3RjiDQsNC60LrQsNGD0L3RglxyXG4gIGZ1bmN0aW9uIG1lbnVBY2NvdW50VXAodG9nZ2xlQnV0dG9uKSB7XHJcbiAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XHJcbiAgICB0b2dnbGVCdXR0b24uYWRkQ2xhc3MoJ29wZW4nKTtcclxuICAgIGFjY291bnRNZW51LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSAxMDI0KSB7XHJcbiAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgIH1cclxuXHJcbiAgICBhY2NvdW50TWVudU9wZW5UaW1lID0gbmV3IERhdGUoKTtcclxuICAgIGFjY291bnRNZW51VGltZU91dCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSAxMDI0KSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICgobmV3IERhdGUoKSAtIGFjY291bnRNZW51T3BlblRpbWUpID4gMTAwMCAqIDcpIHtcclxuICAgICAgICBhY2NvdW50TWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgdG9nZ2xlQnV0dG9uLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xyXG4gICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sIDEwMDApO1xyXG4gIH1cclxuXHJcbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllcy1hY2NvdW50X21lbnUtaGVhZGVyJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgIGFjY291bnRNZW51T3BlblRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gIH0pO1xyXG4gICQoJy5hY2NvdW50LW1lbnUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCdhY2NvdW50LW1lbnUnKSkge1xyXG4gICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgIH1cclxuICB9KTtcclxufSgpO1xyXG4iLCIkKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBwYXJzZU51bShzdHIpIHtcclxuICAgIHJldHVybiBwYXJzZUZsb2F0KFxyXG4gICAgICBTdHJpbmcoc3RyKVxyXG4gICAgICAgIC5yZXBsYWNlKCcsJywgJy4nKVxyXG4gICAgICAgIC5tYXRjaCgvLT9cXGQrKD86XFwuXFxkKyk/L2csICcnKSB8fCAwXHJcbiAgICAgICwgMTBcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAkKCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpLmZpbmQoJ3NlbGVjdCxpbnB1dCcpLm9uKCdjaGFuZ2Uga2V5dXAgY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLmNsb3Nlc3QoJy5zaG9ydC1jYWxjLWNhc2hiYWNrJyk7XHJcbiAgICB2YXIgY3VycyA9IHBhcnNlTnVtKCR0aGlzLmZpbmQoJ3NlbGVjdCcpLnZhbCgpKTtcclxuICAgIHZhciB2YWwgPSAkdGhpcy5maW5kKCdpbnB1dCcpLnZhbCgpO1xyXG4gICAgaWYgKHBhcnNlTnVtKHZhbCkgIT0gdmFsKSB7XHJcbiAgICAgIHZhbCA9ICR0aGlzLmZpbmQoJ2lucHV0JykudmFsKHBhcnNlTnVtKHZhbCkpO1xyXG4gICAgfVxyXG4gICAgdmFsID0gcGFyc2VOdW0odmFsKTtcclxuXHJcbiAgICB2YXIga29lZiA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjaycpLnRyaW0oKTtcclxuICAgIHZhciBwcm9tbyA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1wcm9tbycpLnRyaW0oKTtcclxuICAgIHZhciBjdXJyZW5jeSA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1jdXJyZW5jeScpLnRyaW0oKTtcclxuICAgIHZhciByZXN1bHQgPSAwO1xyXG4gICAgdmFyIG91dCA9IDA7XHJcblxyXG4gICAgaWYgKGtvZWYgPT0gcHJvbW8pIHtcclxuICAgICAgcHJvbW8gPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChrb2VmLmluZGV4T2YoJyUnKSA+IDApIHtcclxuICAgICAgcmVzdWx0ID0gcGFyc2VOdW0oa29lZikgKiB2YWwgKiBjdXJzIC8gMTAwO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY3VycyA9IHBhcnNlTnVtKCR0aGlzLmZpbmQoJ1tjb2RlPScgKyBjdXJyZW5jeSArICddJykudmFsKCkpO1xyXG4gICAgICByZXN1bHQgPSBwYXJzZU51bShrb2VmKSAqIGN1cnNcclxuICAgIH1cclxuXHJcbiAgICBpZiAocGFyc2VOdW0ocHJvbW8pID4gMCkge1xyXG4gICAgICBpZiAocHJvbW8uaW5kZXhPZignJScpID4gMCkge1xyXG4gICAgICAgIHByb21vID0gcGFyc2VOdW0ocHJvbW8pICogdmFsICogY3VycyAvIDEwMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwcm9tbyA9IHBhcnNlTnVtKHByb21vKSAqIGN1cnNcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHByb21vID4gMCkge1xyXG4gICAgICAgIG91dCA9IFwiPHNwYW4gY2xhc3M9b2xkX3ByaWNlPlwiICsgcmVzdWx0LnRvRml4ZWQoMikgKyBcIjwvc3Bhbj4gXCIgKyBwcm9tby50b0ZpeGVkKDIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG91dCA9IHJlc3VsdC50b0ZpeGVkKDIpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvdXQgPSByZXN1bHQudG9GaXhlZCgyKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgJHRoaXMuZmluZCgnLmNhbGMtcmVzdWx0X3ZhbHVlJykuaHRtbChvdXQpXHJcbiAgfSkuY2xpY2soKVxyXG59KTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgZWxzID0gJCgnLmF1dG9faGlkZV9jb250cm9sJyk7XHJcbiAgaWYgKGVscy5sZW5ndGggPT0gMClyZXR1cm47XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiLnNjcm9sbF9ib3gtc2hvd19tb3JlXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgYnV0dG9uWWVzOiBmYWxzZSxcclxuICAgICAgbm90eWZ5X2NsYXNzOiBcIm5vdGlmeV93aGl0ZSBub3RpZnlfbm90X2JpZ1wiXHJcbiAgICB9O1xyXG5cclxuICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgIHZhciBjb250ZW50ID0gJHRoaXMuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbScpLmNsb25lKCk7XHJcbiAgICBjb250ZW50ID0gY29udGVudFswXTtcclxuICAgIGNvbnRlbnQuY2xhc3NOYW1lICs9ICcgc2Nyb2xsX2JveC1pdGVtLW1vZGFsJztcclxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGRpdi5jbGFzc05hbWUgPSAnY29tbWVudHMnO1xyXG4gICAgZGl2LmFwcGVuZChjb250ZW50KTtcclxuICAgICQoZGl2KS5maW5kKCcuc2Nyb2xsX2JveC1zaG93X21vcmUnKS5yZW1vdmUoKTtcclxuICAgICQoZGl2KS5maW5kKCcubWF4X3RleHRfaGlkZScpXHJcbiAgICAgIC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS14MicpXHJcbiAgICAgIC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZScpO1xyXG4gICAgZGF0YS5xdWVzdGlvbiA9IGRpdi5vdXRlckhUTUw7XHJcblxyXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBoYXNTY3JvbGwoZWwpIHtcclxuICAgIHJldHVybiBlbC5zY3JvbGxIZWlnaHQgPiBlbC5jbGllbnRIZWlnaHQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZWJ1aWxkKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gZWxzLmVxKGkpO1xyXG4gICAgICB2YXIgaXNfaGlkZSA9IGZhbHNlO1xyXG4gICAgICBpZiAoZWwuaGVpZ2h0KCkgPCAxMCkge1xyXG4gICAgICAgIGlzX2hpZGUgPSB0cnVlO1xyXG4gICAgICAgIGVsLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0taGlkZScpLnNob3coMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciB0ZXh0ID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtdGV4dCcpO1xyXG4gICAgICB2YXIgYW5zd2VyID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtYW5zd2VyJyk7XHJcbiAgICAgIHZhciBzaG93X21vcmUgPSBlbC5maW5kKCcuc2Nyb2xsX2JveC1zaG93X21vcmUnKTtcclxuXHJcbiAgICAgIHZhciBzaG93X2J0biA9IGZhbHNlO1xyXG4gICAgICBpZiAoaGFzU2Nyb2xsKHRleHRbMF0pKSB7XHJcbiAgICAgICAgc2hvd19idG4gPSB0cnVlO1xyXG4gICAgICAgIHRleHQucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRleHQuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYW5zd2VyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAvL9C10YHRgtGMINC+0YLQstC10YIg0LDQtNC80LjQvdCwXHJcbiAgICAgICAgaWYgKGhhc1Njcm9sbChhbnN3ZXJbMF0pKSB7XHJcbiAgICAgICAgICBzaG93X2J0biA9IHRydWU7XHJcbiAgICAgICAgICBhbnN3ZXIucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBhbnN3ZXIuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNob3dfYnRuKSB7XHJcbiAgICAgICAgc2hvd19tb3JlLnNob3coKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzaG93X21vcmUuaGlkZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaXNfaGlkZSkge1xyXG4gICAgICAgIGVsLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0taGlkZScpLmhpZGUoMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gICQod2luZG93KS5yZXNpemUocmVidWlsZCk7XHJcbiAgcmVidWlsZCgpO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnNob3dfYWxsJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBjbHMgPSAkKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XHJcbiAgICAkKCcuaGlkZV9hbGxbZGF0YS1jbnRybC1jbGFzc10nKS5zaG93KCk7XHJcbiAgICAkKHRoaXMpLmhpZGUoKTtcclxuICAgICQoJy4nICsgY2xzKS5zaG93KCk7XHJcbiAgfSk7XHJcblxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmhpZGVfYWxsJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBjbHMgPSAkKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XHJcbiAgICAkKCcuc2hvd19hbGxbZGF0YS1jbnRybC1jbGFzc10nKS5zaG93KCk7XHJcbiAgICAkKHRoaXMpLmhpZGUoKTtcclxuICAgICQoJy4nICsgY2xzKS5oaWRlKCk7XHJcbiAgfSk7XHJcbn0pKCk7XHJcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBkZWNsT2ZOdW0obnVtYmVyLCB0aXRsZXMpIHtcclxuICAgIGNhc2VzID0gWzIsIDAsIDEsIDEsIDEsIDJdO1xyXG4gICAgcmV0dXJuIHRpdGxlc1sobnVtYmVyICUgMTAwID4gNCAmJiBudW1iZXIgJSAxMDAgPCAyMCkgPyAyIDogY2FzZXNbKG51bWJlciAlIDEwIDwgNSkgPyBudW1iZXIgJSAxMCA6IDVdXTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpcnN0WmVybyh2KSB7XHJcbiAgICB2ID0gTWF0aC5mbG9vcih2KTtcclxuICAgIGlmICh2IDwgMTApXHJcbiAgICAgIHJldHVybiAnMCcgKyB2O1xyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gdjtcclxuICB9XHJcblxyXG4gIHZhciBjbG9ja3MgPSAkKCcuY2xvY2snKTtcclxuICBpZiAoY2xvY2tzLmxlbmd0aCA+IDApIHtcclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUNsb2NrKCkge1xyXG4gICAgICB2YXIgY2xvY2tzID0gJCh0aGlzKTtcclxuICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xvY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGMgPSBjbG9ja3MuZXEoaSk7XHJcbiAgICAgICAgdmFyIGVuZCA9IG5ldyBEYXRlKGMuZGF0YSgnZW5kJykucmVwbGFjZSgvLS9nLCBcIi9cIikpO1xyXG4gICAgICAgIHZhciBkID0gKGVuZC5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XHJcblxyXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0L/RgNC+0YjQtdC7XHJcbiAgICAgICAgaWYgKGQgPD0gMCkge1xyXG4gICAgICAgICAgYy50ZXh0KCfQn9GA0L7QvNC+0LrQvtC0INC40YHRgtC10LonKTtcclxuICAgICAgICAgIGMuYWRkQ2xhc3MoJ2Nsb2NrLWV4cGlyZWQnKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy/QtdGB0LvQuCDRgdGA0L7QuiDQsdC+0LvQtdC1IDMwINC00L3QtdC5XHJcbiAgICAgICAgaWYgKGQgPiAzMCAqIDYwICogNjAgKiAyNCkge1xyXG4gICAgICAgICAgYy5odG1sKCfQntGB0YLQsNC70L7RgdGMOiA8c3Bhbj7QsdC+0LvQtdC1IDMwINC00L3QtdC5PC9zcGFuPicpO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcyA9IGQgJSA2MDtcclxuICAgICAgICBkID0gKGQgLSBzKSAvIDYwO1xyXG4gICAgICAgIHZhciBtID0gZCAlIDYwO1xyXG4gICAgICAgIGQgPSAoZCAtIG0pIC8gNjA7XHJcbiAgICAgICAgdmFyIGggPSBkICUgMjQ7XHJcbiAgICAgICAgZCA9IChkIC0gaCkgLyAyNDtcclxuXHJcbiAgICAgICAgdmFyIHN0ciA9IGZpcnN0WmVybyhoKSArIFwiOlwiICsgZmlyc3RaZXJvKG0pICsgXCI6XCIgKyBmaXJzdFplcm8ocyk7XHJcbiAgICAgICAgaWYgKGQgPiAwKSB7XHJcbiAgICAgICAgICBzdHIgPSBkICsgXCIgXCIgKyBkZWNsT2ZOdW0oZCwgWyfQtNC10L3RjCcsICfQtNC90Y8nLCAn0LTQvdC10LknXSkgKyBcIiAgXCIgKyBzdHI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGMuaHRtbChcItCe0YHRgtCw0LvQvtGB0Yw6IDxzcGFuPlwiICsgc3RyICsgXCI8L3NwYW4+XCIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SW50ZXJ2YWwodXBkYXRlQ2xvY2suYmluZChjbG9ja3MpLCAxMDAwKTtcclxuICAgIHVwZGF0ZUNsb2NrLmJpbmQoY2xvY2tzKSgpO1xyXG4gIH1cclxufSk7XHJcbiIsInZhciBjYXRhbG9nVHlwZVN3aXRjaGVyID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBjYXRhbG9nID0gJCgnLmNhdGFsb2dfbGlzdCcpO1xyXG4gIGlmIChjYXRhbG9nLmxlbmd0aCA9PSAwKXJldHVybjtcclxuXHJcbiAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5maW5kKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24nKS5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xyXG4gICAgJCh0aGlzKS5hZGRDbGFzcygnY2hlY2tlZCcpO1xyXG4gICAgaWYgKGNhdGFsb2cpIHtcclxuICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2NhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbGlzdCcpKSB7XHJcbiAgICAgICAgY2F0YWxvZy5yZW1vdmVDbGFzcygnbmFycm93Jyk7XHJcbiAgICAgICAgc2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnLCAnJylcclxuICAgICAgfVxyXG4gICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1uYXJyb3cnKSkge1xyXG4gICAgICAgIGNhdGFsb2cuYWRkQ2xhc3MoJ25hcnJvdycpO1xyXG4gICAgICAgIHNldENvb2tpZSgnY291cG9uc192aWV3JywgJ25hcnJvdycpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGlmIChnZXRDb29raWUoJ2NvdXBvbnNfdmlldycpID09ICduYXJyb3cnICYmICFjYXRhbG9nLmhhc0NsYXNzKCduYXJyb3dfb2ZmJykpIHtcclxuICAgIGNhdGFsb2cuYWRkQ2xhc3MoJ25hcnJvdycpO1xyXG4gICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbmFycm93JykuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICAgICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLWxpc3QnKS5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xyXG4gIH1cclxufSgpO1xyXG4iLCIkKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuc2Qtc2VsZWN0LXNlbGVjdGVkJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHBhcmVudCA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICB2YXIgZHJvcEJsb2NrID0gJChwYXJlbnQpLmZpbmQoJy5zZC1zZWxlY3QtZHJvcCcpO1xyXG5cclxuICAgIGlmIChkcm9wQmxvY2suaXMoJzpoaWRkZW4nKSkge1xyXG4gICAgICBkcm9wQmxvY2suc2xpZGVEb3duKCk7XHJcblxyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgIGlmICghcGFyZW50Lmhhc0NsYXNzKCdsaW5rZWQnKSkge1xyXG5cclxuICAgICAgICAkKCcuc2Qtc2VsZWN0LWRyb3AnKS5maW5kKCdhJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICB2YXIgc2VsZWN0UmVzdWx0ID0gJCh0aGlzKS5odG1sKCk7XHJcblxyXG4gICAgICAgICAgJChwYXJlbnQpLmZpbmQoJ2lucHV0JykudmFsKHNlbGVjdFJlc3VsdCk7XHJcblxyXG4gICAgICAgICAgJChwYXJlbnQpLmZpbmQoJy5zZC1zZWxlY3Qtc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcygnYWN0aXZlJykuaHRtbChzZWxlY3RSZXN1bHQpO1xyXG5cclxuICAgICAgICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgZHJvcEJsb2NrLnNsaWRlVXAoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuXHJcbn0pO1xyXG4iLCJzZWFyY2ggPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIG9wZW5BdXRvY29tcGxldGU7XHJcblxyXG4gICQoJy5zZWFyY2gtZm9ybS1pbnB1dCcpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICB2YXIgcXVlcnkgPSAkdGhpcy52YWwoKTtcclxuICAgIHZhciBkYXRhID0gJHRoaXMuY2xvc2VzdCgnZm9ybScpLnNlcmlhbGl6ZSgpO1xyXG4gICAgdmFyIGF1dG9jb21wbGV0ZSA9ICR0aGlzLmNsb3Nlc3QoJy5zdG9yZXNfc2VhcmNoJykuZmluZCgnLmF1dG9jb21wbGV0ZS13cmFwJyk7Ly8gJCgnI2F1dG9jb21wbGV0ZScpLFxyXG4gICAgdmFyIGF1dG9jb21wbGV0ZUxpc3QgPSAkKGF1dG9jb21wbGV0ZSkuZmluZCgndWwnKTtcclxuICAgIG9wZW5BdXRvY29tcGxldGUgPSBhdXRvY29tcGxldGU7XHJcbiAgICBpZiAocXVlcnkubGVuZ3RoID4gMSkge1xyXG4gICAgICB1cmwgPSAkdGhpcy5jbG9zZXN0KCdmb3JtJykuYXR0cignYWN0aW9uJykgfHwgJy9zZWFyY2gnO1xyXG4gICAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMpIHtcclxuICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuaHRtbCgnJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9ICc8YSBjbGFzcz1cImF1dG9jb21wbGV0ZV9saW5rXCIgaHJlZj1cIicgKyBpdGVtLmRhdGEucm91dGUgKyAnXCInICsgJz4nICsgaXRlbS52YWx1ZSArIGl0ZW0uY2FzaGJhY2sgKyAnPC9hPic7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgICAgICAgICAgICAgbGkuaW5uZXJIVE1MID0gaHRtbDtcclxuICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuYXBwZW5kKGxpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZSkuZmFkZUluKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xyXG4gICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KS5vbignZm9jdXNvdXQnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKCEkKGUucmVsYXRlZFRhcmdldCkuaGFzQ2xhc3MoJ2F1dG9jb21wbGV0ZV9saW5rJykpIHtcclxuICAgICAgLy8kKCcjYXV0b2NvbXBsZXRlJykuaGlkZSgpO1xyXG4gICAgICAkKG9wZW5BdXRvY29tcGxldGUpLmRlbGF5KDEwMCkuc2xpZGVVcCgxMDApXHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJ2JvZHknKS5vbignc3VibWl0JywgJy5zdG9yZXMtc2VhcmNoX2Zvcm0nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyIHZhbCA9ICQodGhpcykuZmluZCgnLnNlYXJjaC1mb3JtLWlucHV0JykudmFsKCk7XHJcbiAgICBpZiAodmFsLmxlbmd0aCA8IDIpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0pXHJcbn0oKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgJCgnLmNvdXBvbnMtbGlzdF9pdGVtLWNvbnRlbnQtZ290by1wcm9tb2NvZGUtbGluaycpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgdGhhdCA9ICQodGhpcyk7XHJcbiAgICB2YXIgZXhwaXJlZCA9IHRoYXQuY2xvc2VzdCgnLmNvdXBvbnMtbGlzdF9pdGVtJykuZmluZCgnLmNsb2NrLWV4cGlyZWQnKTtcclxuICAgIHZhciB1c2VySWQgPSAkKHRoYXQpLmRhdGEoJ3VzZXInKTtcclxuICAgIHZhciBpbmFjdGl2ZSA9ICQodGhhdCkuZGF0YSgnaW5hY3RpdmUnKTtcclxuICAgIHZhciBkYXRhX21lc3NhZ2UgPSAkKHRoYXQpLmRhdGEoJ21lc3NhZ2UnKTtcclxuXHJcbiAgICBpZiAoaW5hY3RpdmUpIHtcclxuICAgICAgdmFyIHRpdGxlID0gZGF0YV9tZXNzYWdlID8gZGF0YV9tZXNzYWdlIDogJ9CaINGB0L7QttCw0LvQtdC90LjRjiwg0L/RgNC+0LzQvtC60L7QtCDQvdC10LDQutGC0LjQstC10L0nO1xyXG4gICAgICB2YXIgbWVzc2FnZSA9ICfQktGB0LUg0LTQtdC50YHRgtCy0YPRjtGJ0LjQtSDQv9GA0L7QvNC+0LrQvtC00Ysg0LLRiyDQvNC+0LbQtdGC0LUgPGEgaHJlZj1cIi9jb3Vwb25zXCI+0L/QvtGB0LzQvtGC0YDQtdGC0Ywg0LfQtNC10YHRjDwvYT4nO1xyXG4gICAgICBub3RpZmljYXRpb24uYWxlcnQoe1xyXG4gICAgICAgICd0aXRsZSc6IHRpdGxlLFxyXG4gICAgICAgICdxdWVzdGlvbic6IG1lc3NhZ2UsXHJcbiAgICAgICAgJ2J1dHRvblllcyc6ICdPaycsXHJcbiAgICAgICAgJ2J1dHRvbk5vJzogZmFsc2UsXHJcbiAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmIChleHBpcmVkLmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIHRpdGxlID0gJ9CaINGB0L7QttCw0LvQtdC90LjRjiwg0YHRgNC+0Log0LTQtdC50YHRgtCy0LjRjyDQtNCw0L3QvdC+0LPQviDQv9GA0L7QvNC+0LrQvtC00LAg0LjRgdGC0LXQuic7XHJcbiAgICAgIHZhciBtZXNzYWdlID0gJ9CS0YHQtSDQtNC10LnRgdGC0LLRg9GO0YnQuNC1INC/0YDQvtC80L7QutC+0LTRiyDQstGLINC80L7QttC10YLQtSA8YSBocmVmPVwiL2NvdXBvbnNcIj7Qv9C+0YHQvNC+0YLRgNC10YLRjCDQt9C00LXRgdGMPC9hPic7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XHJcbiAgICAgICAgJ3RpdGxlJzogdGl0bGUsXHJcbiAgICAgICAgJ3F1ZXN0aW9uJzogbWVzc2FnZSxcclxuICAgICAgICAnYnV0dG9uWWVzJzogJ09rJyxcclxuICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcclxuICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2UgaWYgKCF1c2VySWQpIHtcclxuICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgJ2J1dHRvblllcyc6IGZhbHNlLFxyXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiBcIm5vdGlmeV9ib3gtYWxlcnRcIixcclxuICAgICAgICAndGl0bGUnOiAn0JjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMINC/0YDQvtC80L7QutC+0LQnLFxyXG4gICAgICAgICdxdWVzdGlvbic6ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveC1jb3Vwb24tbm9yZWdpc3RlclwiPicgK1xyXG4gICAgICAgICc8aW1nIHNyYz1cIi9pbWFnZXMvdGVtcGxhdGVzL3N3YS5wbmdcIiBhbHQ9XCJcIj4nICtcclxuICAgICAgICAnPHA+PGI+0JXRgdC70Lgg0LLRiyDRhdC+0YLQuNGC0LUg0L/QvtC70YPRh9Cw0YLRjCDQtdGJ0LUg0Lgg0JrQrdCo0JHQrdCaICjQstC+0LfQstGA0LDRgiDQtNC10L3QtdCzKSwg0LLQsNC8INC90LXQvtCx0YXQvtC00LjQvNC+INC30LDRgNC10LPQuNGB0YLRgNC40YDQvtCy0LDRgtGM0YHRjy4g0J3QviDQvNC+0LbQtdGC0LUg0Lgg0L/RgNC+0YHRgtC+INCy0L7RgdC/0L7Qu9GM0LfQvtCy0LDRgtGM0YHRjyDQv9GA0L7QvNC+0LrQvtC00L7QvCwg0LHQtdC3INC60Y3RiNCx0Y3QutCwLjwvYj48L3A+JyArXHJcbiAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveC1idXR0b25zXCI+JyArXHJcbiAgICAgICAgJzxhIGhyZWY9XCInICsgdGhhdC5hdHRyKCdocmVmJykgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJidG5cIj7QmNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0L/RgNC+0LzQvtC60L7QtDwvYT4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIiNyZWdpc3RyYXRpb25cIiBjbGFzcz1cImJ0biBidG4tdHJhbnNmb3JtIG1vZGFsc19vcGVuXCI+0JfQsNGA0LXQs9C40YHRgtGA0LjRgNC+0LLQsNGC0YzRgdGPPC9hPicgK1xyXG4gICAgICAgICc8L2Rpdj4nXHJcbiAgICAgIH07XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcjc2hvcF9oZWFkZXItZ290by1jaGVja2JveCcpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcbiAgICAgaWYgKCEkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpKSB7XHJcbiAgICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XHJcbiAgICAgICAgICAgICAndGl0bGUnOiAn0JLQvdC40LzQsNC90LjQtScsXHJcbiAgICAgICAgICAgICAncXVlc3Rpb24nOiAn0J3QtSDRgNC10LrQvtC80LXQvdC00YPQtdGC0YHRjyDRgdC+0LLQtdGA0YjQsNGC0Ywg0L/QvtC60YPQv9C60Lgg0LHQtdC3INC+0LfQvdCw0LrQvtC80LvQtdC90LjRjzxicj4g0YEgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9mb2xsb3cgbm9vcGVyIG5vcmVmZXJyZXJcIiBocmVmPVwiL3JlY29tbWVuZGF0aW9uc1wiPtCf0YDQsNCy0LjQu9Cw0LzQuCDQv9C+0LrRg9C/0L7QuiDRgSDQutGN0YjQsdGN0LrQvtC8PC9hPicsXHJcbiAgICAgICAgICAgICAnYnV0dG9uWWVzJzogJ9CX0LDQutGA0YvRgtGMJyxcclxuICAgICAgICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xyXG4gICAgICAgICB9KTtcclxuICAgICB9XHJcbiAgfSk7XHJcblxyXG5cclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLmFjY291bnQtd2l0aGRyYXctbWV0aG9kc19pdGVtLW9wdGlvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgb3B0aW9uID0gJCh0aGlzKS5kYXRhKCdvcHRpb24tcHJvY2VzcycpLFxyXG4gICAgICBwbGFjZWhvbGRlciA9ICcnO1xyXG4gICAgc3dpdGNoIChvcHRpb24pIHtcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINGB0YfRkdGC0LBcIjtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgMjpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCBSLdC60L7RiNC10LvRjNC60LBcIjtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDRgtC10LvQtdGE0L7QvdCwXCI7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDQ6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0LrQsNGA0YLRi1wiO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSA1OlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSBlbWFpbCDQsNC00YDQtdGBXCI7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDY6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YLQtdC70LXRhNC+0L3QsFwiO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICQoXCIjdXNlcnN3aXRoZHJhdy1iaWxsXCIpLmF0dHIoXCJwbGFjZWhvbGRlclwiLCBwbGFjZWhvbGRlcik7XHJcbiAgICAkKCcjdXNlcnN3aXRoZHJhdy1wcm9jZXNzX2lkJykudmFsKG9wdGlvbik7XHJcbiAgfSk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgYWpheEZvcm0oJCgnLmFqYXhfZm9ybScpKTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuZG9icm8tZnVuZHNfaXRlbS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgJCgnI2RvYnJvLXNlbmQtZm9ybS1jaGFyaXR5LXByb2Nlc3MnKS52YWwoJCh0aGlzKS5kYXRhKCdpZCcpKTtcclxuICB9KTtcclxuXHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ2JvZHknKS5hZGRDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0JykuYWRkQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdC1vcGVuJyk7XHJcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykuYWRkQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZS1vcGVuJyk7XHJcbiAgfSk7XHJcbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdC1jbG9zZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0JykucmVtb3ZlQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdC1vcGVuJyk7XHJcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZS1vcGVuJyk7XHJcbiAgfSk7XHJcbn0pKCk7XHJcbiIsIi8vd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcclxuc2hhcmU0MiA9IGZ1bmN0aW9uICgpe1xyXG4gIGU9ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2hhcmU0MmluaXQnKTtcclxuICBmb3IgKHZhciBrID0gMDsgayA8IGUubGVuZ3RoOyBrKyspIHtcclxuICAgIHZhciB1ID0gXCJcIjtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zb2NpYWxzJykgIT0gLTEpXHJcbiAgICAgIHZhciBzb2NpYWxzID0gSlNPTi5wYXJzZSgnWycrZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29jaWFscycpKyddJyk7XHJcbiAgICB2YXIgaWNvbl90eXBlPWVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tdHlwZScpICE9IC0xP2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tdHlwZScpOicnO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXVybCcpICE9IC0xKVxyXG4gICAgICB1ID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXJsJyk7XHJcbiAgICB2YXIgcHJvbW8gPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9tbycpO1xyXG4gICAgaWYocHJvbW8gPT0gLTEpIHtcclxuICAgICAgdmFyIGtleSA9ICdwcm9tbz0nLFxyXG4gICAgICAgIHByb21vU3RhcnQgPSB1LmluZGV4T2Yoa2V5KSxcclxuICAgICAgICBwcm9tb0VuZCA9IHUuaW5kZXhPZignJicsIHByb21vU3RhcnQpLFxyXG4gICAgICAgIHByb21vTGVuZ3RoID0gcHJvbW9FbmQgPiBwcm9tb1N0YXJ0ID8gcHJvbW9FbmQgLSBwcm9tb1N0YXJ0IC0ga2V5Lmxlbmd0aCA6IHUubGVuZ3RoIC0gcHJvbW9TdGFydCAtIGtleS5sZW5ndGg7XHJcbiAgICAgIGlmKHByb21vU3RhcnQgPiAwKSB7XHJcbiAgICAgICAgcHJvbW8gPSB1LnN1YnN0cihwcm9tb1N0YXJ0ICsga2V5Lmxlbmd0aCwgcHJvbW9MZW5ndGgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgc2VsZl9wcm9tbyA9IHByb21vICE9LTEgPyBcInNldFRpbWVvdXQoZnVuY3Rpb24oKXtzZW5kX3Byb21vKCdcIitwcm9tbytcIicpfSwyMDAwKTtcIiA6IFwiXCI7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi1zaXplJykgIT0gLTEpXHJcbiAgICAgIHZhciBpY29uX3NpemUgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXNpemUnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpICE9IC0xKVxyXG4gICAgICB2YXIgdCA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJyk7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1hZ2UnKSAhPSAtMSlcclxuICAgICAgdmFyIGkgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pbWFnZScpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWRlc2NyaXB0aW9uJykgIT0gLTEpXHJcbiAgICAgIHZhciBkID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzY3JpcHRpb24nKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wYXRoJykgIT0gLTEpXHJcbiAgICAgIHZhciBmID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF0aCcpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb25zLWZpbGUnKSAhPSAtMSlcclxuICAgICAgdmFyIGZuID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbnMtZmlsZScpO1xyXG4gICAgaWYgKCFmKSB7XHJcbiAgICAgIGZ1bmN0aW9uIHBhdGgobmFtZSkge1xyXG4gICAgICAgIHZhciBzYyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVxyXG4gICAgICAgICAgLCBzciA9IG5ldyBSZWdFeHAoJ14oLiovfCkoJyArIG5hbWUgKyAnKShbIz9dfCQpJyk7XHJcbiAgICAgICAgZm9yICh2YXIgcCA9IDAsIHNjTCA9IHNjLmxlbmd0aDsgcCA8IHNjTDsgcCsrKSB7XHJcbiAgICAgICAgICB2YXIgbSA9IFN0cmluZyhzY1twXS5zcmMpLm1hdGNoKHNyKTtcclxuICAgICAgICAgIGlmIChtKSB7XHJcbiAgICAgICAgICAgIGlmIChtWzFdLm1hdGNoKC9eKChodHRwcz98ZmlsZSlcXDpcXC97Mix9fFxcdzpbXFwvXFxcXF0pLykpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIG1bMV07XHJcbiAgICAgICAgICAgIGlmIChtWzFdLmluZGV4T2YoXCIvXCIpID09IDApXHJcbiAgICAgICAgICAgICAgcmV0dXJuIG1bMV07XHJcbiAgICAgICAgICAgIGIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYmFzZScpO1xyXG4gICAgICAgICAgICBpZiAoYlswXSAmJiBiWzBdLmhyZWYpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGJbMF0uaHJlZiArIG1bMV07XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUubWF0Y2goLyguKltcXC9cXFxcXSkvKVswXSArIG1bMV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGYgPSBwYXRoKCdzaGFyZTQyLmpzJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoIXUpXHJcbiAgICAgIHUgPSBsb2NhdGlvbi5ocmVmO1xyXG4gICAgaWYgKCF0KVxyXG4gICAgICB0ID0gZG9jdW1lbnQudGl0bGU7XHJcbiAgICBpZiAoIWZuKVxyXG4gICAgICBmbiA9ICdpY29ucy5wbmcnO1xyXG4gICAgZnVuY3Rpb24gZGVzYygpIHtcclxuICAgICAgdmFyIG1ldGEgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWV0YScpO1xyXG4gICAgICBmb3IgKHZhciBtID0gMDsgbSA8IG1ldGEubGVuZ3RoOyBtKyspIHtcclxuICAgICAgICBpZiAobWV0YVttXS5uYW1lLnRvTG93ZXJDYXNlKCkgPT0gJ2Rlc2NyaXB0aW9uJykge1xyXG4gICAgICAgICAgcmV0dXJuIG1ldGFbbV0uY29udGVudDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG4gICAgaWYgKCFkKVxyXG4gICAgICBkID0gZGVzYygpO1xyXG4gICAgdSA9IGVuY29kZVVSSUNvbXBvbmVudCh1KTtcclxuICAgIHQgPSBlbmNvZGVVUklDb21wb25lbnQodCk7XHJcbiAgICB0ID0gdC5yZXBsYWNlKC9cXCcvZywgJyUyNycpO1xyXG4gICAgaSA9IGVuY29kZVVSSUNvbXBvbmVudChpKTtcclxuICAgIHZhciBkX29yaWc9ZC5yZXBsYWNlKC9cXCcvZywgJyUyNycpO1xyXG4gICAgZCA9IGVuY29kZVVSSUNvbXBvbmVudChkKTtcclxuICAgIGQgPSBkLnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XHJcbiAgICB2YXIgZmJRdWVyeSA9ICd1PScgKyB1O1xyXG4gICAgaWYgKGkgIT0gJ251bGwnICYmIGkgIT0gJycpXHJcbiAgICAgIGZiUXVlcnkgPSAncz0xMDAmcFt1cmxdPScgKyB1ICsgJyZwW3RpdGxlXT0nICsgdCArICcmcFtzdW1tYXJ5XT0nICsgZCArICcmcFtpbWFnZXNdWzBdPScgKyBpO1xyXG4gICAgdmFyIHZrSW1hZ2UgPSAnJztcclxuICAgIGlmIChpICE9ICdudWxsJyAmJiBpICE9ICcnKVxyXG4gICAgICB2a0ltYWdlID0gJyZpbWFnZT0nICsgaTtcclxuICAgIHZhciBzID0gbmV3IEFycmF5KFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cImZiXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9JyArIHUgKydcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIEZhY2Vib29rXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInZrXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy92ay5jb20vc2hhcmUucGhwP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyB2a0ltYWdlICsgJyZkZXNjcmlwdGlvbj0nICsgZCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCSINCa0L7QvdGC0LDQutGC0LVcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwib2RrbFwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vY29ubmVjdC5vay5ydS9vZmZlcj91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgJyZkZXNjcmlwdGlvbj0nKyBkICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiDQntC00L3QvtC60LvQsNGB0YHQvdC40LrQuFwiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJ0d2lcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3R3aXR0ZXIuY29tL2ludGVudC90d2VldD90ZXh0PScgKyB0ICsgJyZ1cmw9JyArIHUgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQlNC+0LHQsNCy0LjRgtGMINCyIFR3aXR0ZXJcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwiZ3BsdXNcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3BsdXMuZ29vZ2xlLmNvbS9zaGFyZT91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgR29vZ2xlK1wiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJtYWlsXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9jb25uZWN0Lm1haWwucnUvc2hhcmU/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICcmZGVzY3JpcHRpb249JyArIGQgKyAnJmltYWdldXJsPScgKyBpICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIg0JzQvtC10Lwg0JzQuNGA0LVATWFpbC5SdVwiJyxcclxuICAgICAgJ1wiLy93d3cubGl2ZWpvdXJuYWwuY29tL3VwZGF0ZS5ibWw/ZXZlbnQ9JyArIHUgKyAnJnN1YmplY3Q9JyArIHQgKyAnXCIgdGl0bGU9XCLQntC/0YPQsdC70LjQutC+0LLQsNGC0Ywg0LIgTGl2ZUpvdXJuYWxcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwicGluXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9waW50ZXJlc3QuY29tL3Bpbi9jcmVhdGUvYnV0dG9uLz91cmw9JyArIHUgKyAnJm1lZGlhPScgKyBpICsgJyZkZXNjcmlwdGlvbj0nICsgdCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NjAwLCBoZWlnaHQ9MzAwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIgUGludGVyZXN0XCInLFxyXG4gICAgICAnXCJcIiBvbmNsaWNrPVwicmV0dXJuIGZhdih0aGlzKTtcIiB0aXRsZT1cItCh0L7RhdGA0LDQvdC40YLRjCDQsiDQuNC30LHRgNCw0L3QvdC+0LUg0LHRgNCw0YPQt9C10YDQsFwiJyxcclxuICAgICAgJ1wiI1wiIG9uY2xpY2s9XCJwcmludCgpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0KDQsNGB0L/QtdGH0LDRgtCw0YLRjFwiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJ0ZWxlZ3JhbVwiIG9uY2xpY2s9XCJ3aW5kb3cub3BlbihcXCcvL3RlbGVncmFtLm1lL3NoYXJlL3VybD91cmw9JyArIHUgKycmdGV4dD0nICsgdCArICdcXCcsIFxcJ3RlbGVncmFtXFwnLCBcXCd3aWR0aD01NTAsaGVpZ2h0PTQ0MCxsZWZ0PTEwMCx0b3A9MTAwXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIFRlbGVncmFtXCInLFxyXG4gICAgICAnXCJ2aWJlcjovL2ZvcndhcmQ/dGV4dD0nKyB1ICsnIC0gJyArIHQgKyAnXCIgZGF0YS1jb3VudD1cInZpYmVyXCIgcmVsPVwibm9mb2xsb3cgbm9vcGVuZXJcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIFZpYmVyXCInLFxyXG4gICAgICAnXCJ3aGF0c2FwcDovL3NlbmQ/dGV4dD0nKyB1ICsnIC0gJyArIHQgKyAnXCIgZGF0YS1jb3VudD1cIndoYXRzYXBwXCIgcmVsPVwibm9mb2xsb3cgbm9vcGVuZXJcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIFdoYXRzQXBwXCInXHJcblxyXG4gICAgKTtcclxuXHJcbiAgICB2YXIgbCA9ICcnO1xyXG5cclxuICAgIGlmKHNvY2lhbHMubGVuZ3RoPjEpe1xyXG4gICAgICBmb3IgKHEgPSAwOyBxIDwgc29jaWFscy5sZW5ndGg7IHErKyl7XHJcbiAgICAgICAgaj1zb2NpYWxzW3FdO1xyXG4gICAgICAgIGwgKz0gJzxhIHJlbD1cIm5vZm9sbG93XCIgaHJlZj0nICsgc1tqXSArICcgdGFyZ2V0PVwiX2JsYW5rXCIgJytnZXRJY29uKHNbal0saixpY29uX3R5cGUsZixmbixpY29uX3NpemUpKyc+PC9hPic7XHJcbiAgICAgIH1cclxuICAgIH1lbHNle1xyXG4gICAgICBmb3IgKGogPSAwOyBqIDwgcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgIGwgKz0gJzxhIHJlbD1cIm5vZm9sbG93XCIgaHJlZj0nICsgc1tqXSArICcgdGFyZ2V0PVwiX2JsYW5rXCIgJytnZXRJY29uKHNbal0saixpY29uX3R5cGUsZixmbixpY29uX3NpemUpKyc+PC9hPic7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVba10uaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPVwic2hhcmU0Ml93cmFwXCI+JyArIGwgKyAnPC9zcGFuPic7XHJcbiAgfVxyXG4gIFxyXG4vL30sIGZhbHNlKTtcclxufSgpO1xyXG5cclxuZnVuY3Rpb24gZ2V0SWNvbihzLGosdCxmLGZuLHNpemUpIHtcclxuICBpZighc2l6ZSl7XHJcbiAgICBzaXplPTMyO1xyXG4gIH1cclxuICBpZih0PT0nY3NzJyl7XHJcbiAgICBqPXMuaW5kZXhPZignZGF0YS1jb3VudD1cIicpKzEyO1xyXG4gICAgdmFyIGw9cy5pbmRleE9mKCdcIicsaiktajtcclxuICAgIHZhciBsMj1zLmluZGV4T2YoJy4nLGopLWo7XHJcbiAgICBsPWw+bDIgJiYgbDI+MCA/bDI6bDtcclxuICAgIC8vdmFyIGljb249J2NsYXNzPVwic29jLWljb24gaWNvbi0nK3Muc3Vic3RyKGosbCkrJ1wiJztcclxuICAgIHZhciBpY29uPSdjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2QtJytzLnN1YnN0cihqLGwpKydcIic7XHJcbiAgfWVsc2UgaWYodD09J3N2Zycpe1xyXG4gICAgdmFyIHN2Zz1bXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDExMS45NCwxNzcuMDgpXCIgZD1cIk0wIDAgMCA3MC4zIDIzLjYgNzAuMyAyNy4xIDk3LjcgMCA5Ny43IDAgMTE1LjJDMCAxMjMuMiAyLjIgMTI4LjYgMTMuNiAxMjguNkwyOC4xIDEyOC42IDI4LjEgMTUzLjFDMjUuNiAxNTMuNCAxNyAxNTQuMiA2LjkgMTU0LjItMTQgMTU0LjItMjguMyAxNDEuNC0yOC4zIDExNy45TC0yOC4zIDk3LjctNTIgOTcuNy01MiA3MC4zLTI4LjMgNzAuMy0yOC4zIDAgMCAwWlwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw5OC4yNzQsMTQ1LjUyKVwiIGQ9XCJNMCAwIDkuNiAwQzkuNiAwIDEyLjUgMC4zIDE0IDEuOSAxNS40IDMuNCAxNS4zIDYuMSAxNS4zIDYuMSAxNS4zIDYuMSAxNS4xIDE5IDIxLjEgMjEgMjcgMjIuOCAzNC42IDguNSA0Mi43IDMgNDguNy0xLjIgNTMuMy0wLjMgNTMuMy0wLjNMNzQuOCAwQzc0LjggMCA4Ni4xIDAuNyA4MC43IDkuNSA4MC4zIDEwLjMgNzcuNiAxNi4xIDY0LjggMjggNTEuMyA0MC41IDUzLjEgMzguNSA2OS4zIDYwLjEgNzkuMiA3My4zIDgzLjIgODEuNCA4MS45IDg0LjggODAuOCA4OC4xIDczLjUgODcuMiA3My41IDg3LjJMNDkuMyA4Ny4xQzQ5LjMgODcuMSA0Ny41IDg3LjMgNDYuMiA4Ni41IDQ0LjkgODUuNyA0NCA4My45IDQ0IDgzLjkgNDQgODMuOSA0MC4yIDczLjcgMzUuMSA2NS4xIDI0LjMgNDYuOCAyMCA0NS44IDE4LjMgNDYuOSAxNC4yIDQ5LjYgMTUuMiA1Ny42IDE1LjIgNjMuMiAxNS4yIDgxIDE3LjkgODguNCA5LjkgOTAuMyA3LjMgOTAuOSA1LjQgOTEuMy0xLjQgOTEuNC0xMCA5MS41LTE3LjMgOTEuNC0yMS40IDg5LjMtMjQuMiA4OC0yNi4zIDg1LTI1IDg0LjgtMjMuNCA4NC42LTE5LjggODMuOC0xNy45IDgxLjItMTUuNCA3Ny45LTE1LjUgNzAuMy0xNS41IDcwLjMtMTUuNSA3MC4zLTE0LjEgNDkuNC0xOC44IDQ2LjgtMjIuMSA0NS0yNi41IDQ4LjctMzYuMSA2NS4zLTQxLjEgNzMuOC00NC44IDgzLjItNDQuOCA4My4yLTQ0LjggODMuMi00NS41IDg0LjktNDYuOCA4NS45LTQ4LjMgODctNTAuNSA4Ny40LTUwLjUgODcuNEwtNzMuNSA4Ny4yQy03My41IDg3LjItNzYuOSA4Ny4xLTc4LjIgODUuNi03OS4zIDg0LjMtNzguMyA4MS41LTc4LjMgODEuNS03OC4zIDgxLjUtNjAuMyAzOS40LTM5LjkgMTguMi0yMS4yLTEuMyAwIDAgMCAwXCIvPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHZlcnNpb249XCIxLjFcIiB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgxMDYuODgsMTgzLjYxKVwiPjxnIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgtNi44ODA1LC0xMDApXCIgc3R5bGU9XCJzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCI+PHBhdGggZD1cIk0gMCwwIEMgOC4xNDYsMCAxNC43NjksLTYuNjI1IDE0Ljc2OSwtMTQuNzcgMTQuNzY5LC0yMi45MDcgOC4xNDYsLTI5LjUzMyAwLC0yOS41MzMgLTguMTM2LC0yOS41MzMgLTE0Ljc2OSwtMjIuOTA3IC0xNC43NjksLTE0Ljc3IC0xNC43NjksLTYuNjI1IC04LjEzNiwwIDAsMCBNIDAsLTUwLjQyOSBDIDE5LjY3NiwtNTAuNDI5IDM1LjY3LC0zNC40MzUgMzUuNjcsLTE0Ljc3IDM1LjY3LDQuOTAzIDE5LjY3NiwyMC45MDMgMCwyMC45MDMgLTE5LjY3MSwyMC45MDMgLTM1LjY2OSw0LjkwMyAtMzUuNjY5LC0xNC43NyAtMzUuNjY5LC0zNC40MzUgLTE5LjY3MSwtNTAuNDI5IDAsLTUwLjQyOVwiIHN0eWxlPVwiZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLW9wYWNpdHk6MVwiLz48L2c+PGcgdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDcuNTUxNiwtNTQuNTc3KVwiIHN0eWxlPVwic3Ryb2tlOm5vbmU7c3Ryb2tlLW9wYWNpdHk6MVwiPjxwYXRoIGQ9XCJNIDAsMCBDIDcuMjYyLDEuNjU1IDE0LjI2NCw0LjUyNiAyMC43MTQsOC41NzggMjUuNTk1LDExLjY1NCAyNy4wNjYsMTguMTA4IDIzLjk5LDIyLjk4OSAyMC45MTcsMjcuODgxIDE0LjQ2OSwyOS4zNTIgOS41NzksMjYuMjc1IC01LjAzMiwxNy4wODYgLTIzLjg0MywxNy4wOTIgLTM4LjQ0NiwyNi4yNzUgLTQzLjMzNiwyOS4zNTIgLTQ5Ljc4NCwyNy44ODEgLTUyLjg1MiwyMi45ODkgLTU1LjkyOCwxOC4xMDQgLTU0LjQ2MSwxMS42NTQgLTQ5LjU4LDguNTc4IC00My4xMzIsNC41MzEgLTM2LjEyOCwxLjY1NSAtMjguODY3LDAgTCAtNDguODA5LC0xOS45NDEgQyAtNTIuODg2LC0yNC4wMjIgLTUyLjg4NiwtMzAuNjM5IC00OC44MDUsLTM0LjcyIC00Ni43NjIsLTM2Ljc1OCAtNDQuMDksLTM3Ljc3OSAtNDEuNDE4LC0zNy43NzkgLTM4Ljc0MiwtMzcuNzc5IC0zNi4wNjUsLTM2Ljc1OCAtMzQuMDIzLC0zNC43MiBMIC0xNC40MzYsLTE1LjEyMyA1LjE2OSwtMzQuNzIgQyA5LjI0NiwtMzguODAxIDE1Ljg2MiwtMzguODAxIDE5Ljk0MywtMzQuNzIgMjQuMDI4LC0zMC42MzkgMjQuMDI4LC0yNC4wMTkgMTkuOTQzLC0xOS45NDEgTCAwLDAgWlwiIHN0eWxlPVwiZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLW9wYWNpdHk6MVwiLz48L2c+PC9nPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDE2OS43Niw1Ni43MjcpXCIgZD1cIk0wIDBDLTUuMS0yLjMtMTAuNi0zLjgtMTYuNC00LjUtMTAuNS0xLTYgNC42LTMuOSAxMS4zLTkuNCA4LTE1LjUgNS43LTIyIDQuNC0yNy4zIDkuOS0zNC43IDEzLjQtNDIuOSAxMy40LTU4LjcgMTMuNC03MS42IDAuNi03MS42LTE1LjItNzEuNi0xNy40LTcxLjMtMTkuNi03MC44LTIxLjctOTQuNi0yMC41LTExNS43LTkuMS0xMjkuOCA4LjItMTMyLjMgNC0xMzMuNy0xLTEzMy43LTYuMi0xMzMuNy0xNi4xLTEyOC42LTI0LjktMTIwLjktMzAtMTI1LjYtMjkuOS0xMzAuMS0yOC42LTEzMy45LTI2LjUtMTMzLjktMjYuNi0xMzMuOS0yNi43LTEzMy45LTI2LjgtMTMzLjktNDAuNy0xMjQtNTIuMy0xMTEtNTQuOS0xMTMuNC01NS41LTExNS45LTU1LjktMTE4LjUtNTUuOS0xMjAuMy01NS45LTEyMi4xLTU1LjctMTIzLjktNTUuNC0xMjAuMi02Ni43LTEwOS43LTc1LTk3LjEtNzUuMy0xMDYuOS04Mi45LTExOS4zLTg3LjUtMTMyLjctODcuNS0xMzUtODcuNS0xMzcuMy04Ny40LTEzOS41LTg3LjEtMTI2LjgtOTUuMi0xMTEuOC0xMDAtOTUuNi0xMDAtNDMtMTAwLTE0LjItNTYuMy0xNC4yLTE4LjUtMTQuMi0xNy4zLTE0LjItMTYtMTQuMy0xNC44LTguNy0xMC44LTMuOC01LjcgMCAwXCIvPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwibWF0cml4KDEgMCAwIC0xIDcyLjM4MSA5MC4xNzIpXCI+PHBhdGggZD1cIk04Ny4yIDAgODcuMiAxNy4xIDc1IDE3LjEgNzUgMCA1Ny45IDAgNTcuOS0xMi4yIDc1LTEyLjIgNzUtMjkuMyA4Ny4yLTI5LjMgODcuMi0xMi4yIDEwNC4zLTEyLjIgMTA0LjMgMCA4Ny4yIDBaXCIvPjxwYXRoIGQ9XCJNMCAwIDAtMTkuNiAyNi4yLTE5LjZDMjUuNC0yMy43IDIzLjgtMjcuNSAyMC44LTMwLjYgMTAuMy00Mi4xLTkuMy00Mi0yMC41LTMwLjQtMzEuNy0xOC45LTMxLjYtMC4zLTIwLjIgMTEuMS05LjQgMjEuOSA4IDIyLjQgMTguNiAxMi4xTDE4LjUgMTIuMSAzMi44IDI2LjRDMTMuNyA0My44LTE1LjggNDMuNS0zNC41IDI1LjEtNTMuOCA2LjEtNTQtMjUtMzQuOS00NC4zLTE1LjktNjMuNSAxNy4xLTYzLjcgMzQuOS00NC42IDQ1LjYtMzMgNDguNy0xNi40IDQ2LjIgMEwwIDBaXCIvPjwvZz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw5Ny42NzYsNjIuNDExKVwiIGQ9XCJNMCAwQzEwLjIgMCAxOS45LTQuNSAyNi45LTExLjZMMjYuOS0xMS42QzI2LjktOC4yIDI5LjItNS43IDMyLjQtNS43TDMzLjItNS43QzM4LjItNS43IDM5LjItMTAuNCAzOS4yLTExLjlMMzkuMi02NC44QzM4LjktNjguMiA0Mi44LTcwIDQ1LTY3LjggNTMuNS01OS4xIDYzLjYtMjIuOSAzOS43LTIgMTcuNCAxNy42LTEyLjUgMTQuMy0yOC41IDMuNC00NS40LTguMy01Ni4yLTM0LjEtNDUuNy01OC40LTM0LjItODQuOS0xLjQtOTIuOCAxOC4xLTg0LjkgMjgtODAuOSAzMi41LTk0LjMgMjIuMy05OC42IDYuOC0xMDUuMi0zNi40LTEwNC41LTU2LjUtNjkuNi03MC4xLTQ2LjEtNjkuNC00LjYtMzMuMyAxNi45LTUuNyAzMy4zIDMwLjcgMjguOCA1Mi43IDUuOCA3NS42LTE4LjIgNzQuMy02MyA1MS45LTgwLjUgNDEuOC04OC40IDI2LjctODAuNyAyNi44LTY5LjJMMjYuNy02NS40QzE5LjYtNzIuNCAxMC4yLTc2LjUgMC03Ni41LTIwLjItNzYuNS0zOC01OC43LTM4LTM4LjQtMzgtMTgtMjAuMiAwIDAgME0yNS41LTM3QzI0LjctMjIuMiAxMy43LTEzLjMgMC40LTEzLjNMLTAuMS0xMy4zQy0xNS40LTEzLjMtMjMuOS0yNS4zLTIzLjktMzktMjMuOS01NC4zLTEzLjYtNjQtMC4xLTY0IDE0LjktNjQgMjQuOC01MyAyNS41LTQwTDI1LjUtMzdaXCIvPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwibWF0cml4KDAuNDI2MjMgMCAwIDAuNDI2MjMgMzQuOTk5IDM1KVwiPjxwYXRoIGQ9XCJNMTYwLjcgMTkuNWMtMTguOSAwLTM3LjMgMy43LTU0LjcgMTAuOUw3Ni40IDAuN2MtMC44LTAuOC0yLjEtMS0zLjEtMC40QzQ0LjQgMTguMiAxOS44IDQyLjkgMS45IDcxLjdjLTAuNiAxLTAuNSAyLjMgMC40IDMuMWwyOC40IDI4LjRjLTguNSAxOC42LTEyLjggMzguNS0xMi44IDU5LjEgMCA3OC43IDY0IDE0Mi44IDE0Mi44IDE0Mi44IDc4LjcgMCAxNDIuOC02NCAxNDIuOC0xNDIuOEMzMDMuNCA4My41IDIzOS40IDE5LjUgMTYwLjcgMTkuNXpNMjE3LjIgMTQ4LjdsOS45IDQyLjEgOS41IDQ0LjQgLTQ0LjMtOS41IC00Mi4xLTkuOUwzNi43IDEwMi4xYzE0LjMtMjkuMyAzOC4zLTUyLjYgNjguMS02NS44TDIxNy4yIDE0OC43elwiLz48cGF0aCBkPVwiTTIyMS44IDE4Ny40bC03LjUtMzNjLTI1LjkgMTEuOS00Ni40IDMyLjQtNTguMyA1OC4zbDMzIDcuNUMxOTYgMjA2LjIgMjA3LjcgMTk0LjQgMjIxLjggMTg3LjR6XCIvPjwvZz48L3N2Zz4nLFxyXG4gICAgICAnJywvL3BpblxyXG4gICAgICAnJywvL2ZhdlxyXG4gICAgICAnJywvL3ByaW50XHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDcxLjI2NCwxMDYuOTMpXCIgZD1cIk0wIDAgNjguNiA0My4xQzcyIDQ1LjMgNzMuMSA0Mi44IDcxLjYgNDEuMUwxNC42LTEwLjIgMTEuNy0zNS44IDAgMFpNODcuMSA2Mi45LTMzLjQgMTcuMkMtNDAgMTUuMy0zOS44IDguOC0zNC45IDcuM0wtNC43LTIuMiA2LjgtMzcuNkM4LjItNDEuNSA5LjQtNDIuOSAxMS44LTQzIDE0LjMtNDMgMTUuMy00Mi4xIDE3LjktMzkuOCAyMC45LTM2LjkgMjUuNi0zMi4zIDMzLTI1LjJMNjQuNC00OC40QzcwLjItNTEuNiA3NC4zLTQ5LjkgNzUuOC00M0w5NS41IDU0LjRDOTcuNiA2Mi45IDkyLjYgNjUuNCA4Ny4xIDYyLjlcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsMTM1LjMzLDExOS44NSlcIiBkPVwiTTAgMEMtMi40LTUuNC02LjUtOS0xMi4yLTEwLjYtMTQuMy0xMS4yLTE2LjMtMTAuNy0xOC4yLTkuOS00NC40IDEuMi02My4zIDE5LjYtNzQgNDYuMi03NC44IDQ4LjEtNzUuMyA1MC4xLTc1LjIgNTEuOS03NS4yIDU4LjctNjkuMiA2NS02Mi42IDY1LjQtNjAuOCA2NS41LTU5LjIgNjQuOS01Ny45IDYzLjctNTMuMyA1OS4zLTQ5LjYgNTQuMy00Ni45IDQ4LjYtNDUuNCA0NS41LTQ2IDQzLjMtNDguNyA0MS4xLTQ5LjEgNDAuNy00OS41IDQwLjQtNTAgNDAuMS01My41IDM3LjUtNTQuMyAzNC45LTUyLjYgMzAuOC00OS44IDI0LjItNDUuNCAxOS0zOS4zIDE1LjEtMzcgMTMuNi0zNC43IDEyLjItMzIgMTEuNS0yOS42IDEwLjgtMjcuNyAxMS41LTI2LjEgMTMuNC0yNS45IDEzLjYtMjUuOCAxMy45LTI1LjYgMTQuMS0yMi4zIDE4LjgtMTguNiAxOS42LTEzLjcgMTYuNS05LjYgMTMuOS01LjYgMTEtMS44IDcuOCAwLjcgNS42IDEuMyAzIDAgME0tMTguMiAzNi43Qy0xOC4zIDM1LjktMTguMyAzNS40LTE4LjQgMzQuOS0xOC42IDM0LTE5LjIgMzMuNC0yMC4yIDMzLjQtMjEuMyAzMy40LTIxLjkgMzQtMjIuMiAzNC45LTIyLjMgMzUuNS0yMi40IDM2LjItMjIuNSAzNi45LTIzLjIgNDAuMy0yNS4yIDQyLjYtMjguNiA0My42LTI5LjEgNDMuNy0yOS41IDQzLjctMjkuOSA0My44LTMxIDQ0LjEtMzIuNCA0NC4yLTMyLjQgNDUuOC0zMi41IDQ3LjEtMzEuNSA0Ny45LTI5LjYgNDgtMjguNCA0OC4xLTI2LjUgNDcuNS0yNS40IDQ2LjktMjAuOSA0NC43LTE4LjcgNDEuNi0xOC4yIDM2LjdNLTI1LjUgNTEuMkMtMjggNTIuMS0zMC41IDUyLjgtMzMuMiA1My4yLTM0LjUgNTMuNC0zNS40IDU0LjEtMzUuMSA1NS42LTM0LjkgNTctMzQgNTcuNS0zMi42IDU3LjQtMjQgNTYuNi0xNy4zIDUzLjQtMTIuNiA0Ni0xMC41IDQyLjUtOS4yIDM3LjUtOS40IDMzLjgtOS41IDMxLjItOS45IDMwLjUtMTEuNCAzMC41LTEzLjYgMzAuNi0xMy4zIDMyLjQtMTMuNSAzMy43LTEzLjcgMzUuNy0xNC4yIDM3LjctMTQuNyAzOS43LTE2LjMgNDUuNC0xOS45IDQ5LjMtMjUuNSA1MS4yTS0zOCA2NC40Qy0zNy45IDY1LjktMzcgNjYuNS0zNS41IDY2LjQtMjMuMiA2NS44LTEzLjkgNjIuMi02LjcgNTIuNS0yLjUgNDYuOS0wLjIgMzkuMiAwIDMyLjIgMCAzMS4xIDAgMzAgMCAyOS0wLjEgMjcuOC0wLjYgMjYuOS0xLjkgMjYuOS0zLjIgMjYuOS0zLjkgMjcuNi00IDI5LTQuMyAzNC4yLTUuMyAzOS4zLTcuMyA0NC4xLTExLjIgNTMuNS0xOC42IDU4LjYtMjguMSA2MS4xLTMwLjcgNjEuNy0zMy4yIDYyLjItMzUuOCA2Mi41LTM3IDYyLjUtMzggNjIuOC0zOCA2NC40TTExLjUgNzQuMUM2LjYgNzguMyAwLjkgODAuOC01LjMgODIuNC0yMC44IDg2LjUtMzYuNSA4Ny41LTUyLjQgODUuMy02MC41IDg0LjItNjguMyA4Mi4xLTc1LjQgNzguMS04My44IDczLjQtODkuNiA2Ni42LTkyLjIgNTcuMS05NCA1MC40LTk0LjkgNDMuNi05NS4yIDM2LjYtOTUuNyAyNi40LTk1LjQgMTYuMy05Mi44IDYuMy04OS44LTUuMy04My4yLTEzLjgtNzEuOS0xOC4zLTcwLjctMTguOC02OS41LTE5LjUtNjguMy0yMC02Ny4yLTIwLjQtNjYuOC0yMS4yLTY2LjgtMjIuNC02Ni45LTMwLjQtNjYuOC0zOC40LTY2LjgtNDYuNy02My45LTQzLjktNjEuOC00MS44LTYwLjMtNDAuMS01NS45LTM1LjEtNTEuNy0zMC45LTQ3LjEtMjYuMS00NC43LTIzLjctNDUuNy0yMy44LTQyLjEtMjMuOC0zNy44LTIzLjktMzEtMjQuMS0yNi44LTIzLjgtMTguNi0yMy4xLTEwLjYtMjIuMS0yLjctMTkuNyA3LjItMTYuNyAxNS4yLTExLjQgMTkuMi0xLjMgMjAuMyAxLjMgMjEuNCA0IDIyIDYuOCAyNS45IDIyLjkgMjUuNCAzOC45IDIyLjIgNTUgMjAuNiA2Mi40IDE3LjUgNjkgMTEuNSA3NC4xXCIvPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDEzMC44NCwxMTIuNylcIiBkPVwiTTAgMEMtMS42IDAuOS05LjQgNS4xLTEwLjggNS43LTEyLjMgNi4zLTEzLjQgNi42LTE0LjUgNS0xNS42IDMuNC0xOC45LTAuMS0xOS45LTEuMS0yMC44LTIuMi0yMS44LTIuMy0yMy40LTEuNC0yNS0wLjUtMzAuMSAxLjQtMzYuMSA3LjEtNDAuNyAxMS41LTQzLjcgMTctNDQuNiAxOC42LTQ1LjUgMjAuMy00NC42IDIxLjEtNDMuOCAyMS45LTQzIDIyLjYtNDIuMSAyMy43LTQxLjMgMjQuNi00MC40IDI1LjUtNDAuMSAyNi4yLTM5LjUgMjcuMi0zOSAyOC4zLTM5LjIgMjkuMy0zOS42IDMwLjEtMzkuOSAzMC45LTQyLjkgMzktNDQuMSA0Mi4zLTQ1LjMgNDUuNS00Ni43IDQ1LTQ3LjYgNDUuMS00OC42IDQ1LjEtNDkuNiA0NS4zLTUwLjcgNDUuMy01MS44IDQ1LjQtNTMuNiA0NS01NS4xIDQzLjUtNTYuNiA0MS45LTYxIDM4LjItNjEuMyAzMC4yLTYxLjYgMjIuMy01Ni4xIDE0LjQtNTUuMyAxMy4zLTU0LjUgMTIuMi00NC44LTUuMS0yOC42LTEyLjEtMTIuNC0xOS4yLTEyLjQtMTcuMS05LjQtMTYuOS02LjQtMTYuOCAwLjMtMTMuNCAxLjgtOS42IDMuMy01LjkgMy40LTIuNyAzLTIgMi42LTEuMyAxLjYtMC45IDAgME0tMjkuNy0zOC4zQy00MC40LTM4LjMtNTAuMy0zNS4xLTU4LjYtMjkuNkwtNzguOS0zNi4xLTcyLjMtMTYuNUMtNzguNi03LjgtODIuMyAyLjgtODIuMyAxNC40LTgyLjMgNDMuNC01OC43IDY3LjEtMjkuNyA2Ny4xLTAuNiA2Ny4xIDIzIDQzLjQgMjMgMTQuNCAyMy0xNC43LTAuNi0zOC4zLTI5LjctMzguM00tMjkuNyA3Ny42Qy02NC42IDc3LjYtOTIuOSA0OS4zLTkyLjkgMTQuNC05Mi45IDIuNC04OS42LTguOC04My45LTE4LjNMLTk1LjMtNTIuMi02MC4yLTQxQy01MS4yLTQ2LTQwLjgtNDguOS0yOS43LTQ4LjkgNS4zLTQ4LjkgMzMuNi0yMC42IDMzLjYgMTQuNCAzMy42IDQ5LjMgNS4zIDc3LjYtMjkuNyA3Ny42XCIvPjwvc3ZnPicsXHJcbiAgICBdO1xyXG4gICAgdmFyIGljb249c3ZnW2pdO1xyXG4gICAgdmFyIGNzcz0nIHN0eWxlPVwid2lkdGg6JytzaXplKydweDtoZWlnaHQ6JytzaXplKydweFwiICc7XHJcbiAgICBpY29uPSc8c3ZnIGNsYXNzPVwic29jLWljb24tc2QgaWNvbi1zZC1zdmdcIicrY3NzK2ljb24uc3Vic3RyaW5nKDQpO1xyXG4gICAgaWNvbj0nPicraWNvbi5zdWJzdHJpbmcoMCwgaWNvbi5sZW5ndGggLSAxKTtcclxuICB9ZWxzZXtcclxuICAgIGljb249J3N0eWxlPVwiZGlzcGxheTppbmxpbmUtYmxvY2s7dmVydGljYWwtYWxpZ246Ym90dG9tO3dpZHRoOicrc2l6ZSsncHg7aGVpZ2h0Oicrc2l6ZSsncHg7bWFyZ2luOjAgNnB4IDZweCAwO3BhZGRpbmc6MDtvdXRsaW5lOm5vbmU7YmFja2dyb3VuZDp1cmwoJyArIGYgKyBmbiArICcpIC0nICsgc2l6ZSAqIGogKyAncHggMCBuby1yZXBlYXQ7IGJhY2tncm91bmQtc2l6ZTogY292ZXI7XCInXHJcbiAgfVxyXG4gIHJldHVybiBpY29uO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmYXYoYSkge1xyXG4gIHZhciB0aXRsZSA9IGRvY3VtZW50LnRpdGxlO1xyXG4gIHZhciB1cmwgPSBkb2N1bWVudC5sb2NhdGlvbjtcclxuICB0cnkge1xyXG4gICAgd2luZG93LmV4dGVybmFsLkFkZEZhdm9yaXRlKHVybCwgdGl0bGUpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHdpbmRvdy5zaWRlYmFyLmFkZFBhbmVsKHRpdGxlLCB1cmwsICcnKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgaWYgKHR5cGVvZiAob3BlcmEpID09ICdvYmplY3QnIHx8IHdpbmRvdy5zaWRlYmFyKSB7XHJcbiAgICAgICAgYS5yZWwgPSAnc2lkZWJhcic7XHJcbiAgICAgICAgYS50aXRsZSA9IHRpdGxlO1xyXG4gICAgICAgIGEudXJsID0gdXJsO1xyXG4gICAgICAgIGEuaHJlZiA9IHVybDtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhbGVydCgn0J3QsNC20LzQuNGC0LUgQ3RybC1ELCDRh9GC0L7QsdGLINC00L7QsdCw0LLQuNGC0Ywg0YHRgtGA0LDQvdC40YbRgyDQsiDQt9Cw0LrQu9Cw0LTQutC4Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZW5kX3Byb21vKHByb21vKXtcclxuICAkLmFqYXgoe1xyXG4gICAgbWV0aG9kOiBcInBvc3RcIixcclxuICAgIHVybDogXCJhY2NvdW50L3Byb21vXCIsXHJcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgZGF0YToge3Byb21vOiBwcm9tb30sXHJcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgIGlmIChkYXRhLnRpdGxlICE9IG51bGwgJiYgZGF0YS5tZXNzYWdlICE9IG51bGwpIHtcclxuICAgICAgICBvbl9wcm9tbz0kKCcub25fcHJvbW8nKTtcclxuICAgICAgICBpZihvbl9wcm9tby5sZW5ndGg9PTAgfHwgIW9uX3Byb21vLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICB0aXRsZTogZGF0YS50aXRsZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBvbl9wcm9tby5zaG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuIiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIGNvbnRlaW5lcjtcclxuICB2YXIgbW91c2VPdmVyID0gMDtcclxuICB2YXIgdGltZXJDbGVhckFsbCA9IG51bGw7XHJcbiAgdmFyIGFuaW1hdGlvbkVuZCA9ICd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJztcclxuICB2YXIgdGltZSA9IDEwMDAwO1xyXG5cclxuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9IGZhbHNlO1xyXG4gIHZhciBpc19pbml0ID0gZmFsc2U7XHJcbiAgdmFyIGNvbmZpcm1fb3B0ID0ge1xyXG4gICAgdGl0bGU6IFwi0KPQtNCw0LvQtdC90LjQtVwiLFxyXG4gICAgcXVlc3Rpb246IFwi0JLRiyDQtNC10LnRgdGC0LLQuNGC0LXQu9GM0L3QviDRhdC+0YLQuNGC0LUg0YPQtNCw0LvQuNGC0Yw/XCIsXHJcbiAgICBidXR0b25ZZXM6IFwi0JTQsFwiLFxyXG4gICAgYnV0dG9uTm86IFwi0J3QtdGCXCIsXHJcbiAgICBjYWxsYmFja1llczogZmFsc2UsXHJcbiAgICBjYWxsYmFja05vOiBmYWxzZSxcclxuICAgIG9iajogZmFsc2UsXHJcbiAgICBidXR0b25UYWc6ICdkaXYnLFxyXG4gICAgYnV0dG9uWWVzRG9wOiAnJyxcclxuICAgIGJ1dHRvbk5vRG9wOiAnJyxcclxuICB9O1xyXG4gIHZhciBhbGVydF9vcHQgPSB7XHJcbiAgICB0aXRsZTogXCJcIixcclxuICAgIHF1ZXN0aW9uOiBcItCh0L7QvtCx0YnQtdC90LjQtVwiLFxyXG4gICAgYnV0dG9uWWVzOiBcItCU0LBcIixcclxuICAgIGNhbGxiYWNrWWVzOiBmYWxzZSxcclxuICAgIGJ1dHRvblRhZzogJ2RpdicsXHJcbiAgICBvYmo6IGZhbHNlLFxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHRlc3RJcGhvbmUoKSB7XHJcbiAgICBpZiAoIS8oaVBob25lfGlQYWR8aVBvZCkuKihPUyAxMSkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHJldHVyblxyXG4gICAgbm90aWZpY2F0aW9uX2JveC5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XHJcbiAgICBub3RpZmljYXRpb25fYm94LmNzcygndG9wJywgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgIGlzX2luaXQgPSB0cnVlO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveCA9ICQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcbiAgICBpZiAobm90aWZpY2F0aW9uX2JveC5sZW5ndGggPiAwKXJldHVybjtcclxuXHJcbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveCA9ICQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcblxyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCAnLm5vdGlmeV9jb250cm9sJywgY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2Nsb3NlJywgY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsIGNsb3NlTW9kYWxGb24pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpIHtcclxuICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICQoJy5ub3RpZmljYXRpb25fYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoJycpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpIHtcclxuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcbiAgICBpZiAodGFyZ2V0LmNsYXNzTmFtZSA9PSBcIm5vdGlmaWNhdGlvbl9ib3hcIikge1xyXG4gICAgICBjbG9zZU1vZGFsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB2YXIgX3NldFVwTGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubm90aWZpY2F0aW9uX2Nsb3NlJywgX2Nsb3NlUG9wdXApO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uTGVhdmUpO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25FbnRlciA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgaWYgKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAodGltZXJDbGVhckFsbCAhPSBudWxsKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lckNsZWFyQWxsKTtcclxuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICB2YXIgb3B0aW9uID0gJCh0aGlzKS5kYXRhKCdvcHRpb24nKTtcclxuICAgICAgaWYgKG9wdGlvbi50aW1lcikge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChvcHRpb24udGltZXIpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDE7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9vbkxlYXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcclxuICAgICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICB2YXIgb3B0aW9uID0gJHRoaXMuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmIChvcHRpb24udGltZSA+IDApIHtcclxuICAgICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQob3B0aW9uLmNsb3NlKSwgb3B0aW9uLnRpbWUgLSAxNTAwICsgMTAwICogaSk7XHJcbiAgICAgICAgJHRoaXMuZGF0YSgnb3B0aW9uJywgb3B0aW9uKVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDA7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9jbG9zZVBvcHVwID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICB9KTtcclxuICAgICR0aGlzLmFkZENsYXNzKCdub3RpZmljYXRpb25faGlkZScpXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcclxuICAgIGRhdGEgPSBvYmplY3RzKGFsZXJ0X29wdCwgZGF0YSk7XHJcblxyXG4gICAgaWYgKCFpc19pbml0KWluaXQoKTtcclxuICAgIHRlc3RJcGhvbmUoKTtcclxuXHJcbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xyXG4gICAgaWYgKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcyArPSBkYXRhLm5vdHlmeV9jbGFzcztcclxuXHJcbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gZGF0YS50aXRsZTtcclxuICAgIGJveF9odG1sICs9ICc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiICcgKyBkYXRhLmJ1dHRvblllc0RvcCArICc+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJyArIGRhdGEuYnV0dG9uTm9Eb3AgKyAnPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xyXG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH1cclxuICAgIDtcclxuXHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LCAxMDApXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb25maXJtKGRhdGEpIHtcclxuICAgIGlmICghZGF0YSlkYXRhID0ge307XHJcbiAgICBkYXRhID0gb2JqZWN0cyhjb25maXJtX29wdCwgZGF0YSk7XHJcbiAgICBpZiAodHlwZW9mKGRhdGEuY2FsbGJhY2tZZXMpID09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHZhciBjb2RlID0gJ2RhdGEuY2FsbGJhY2tZZXMgPSBmdW5jdGlvbigpeycrZGF0YS5jYWxsYmFja1llcysnfSc7XHJcbiAgICAgIGV2YWwoY29kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc19pbml0KWluaXQoKTtcclxuICAgIHRlc3RJcGhvbmUoKTtcclxuICAgIC8vYm94X2h0bWw9JzxkaXYgY2xhc3M9XCJub3RpZnlfYm94XCI+JztcclxuXHJcbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xyXG4gICAgaWYgKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcyArPSBkYXRhLm5vdHlmeV9jbGFzcztcclxuXHJcbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xyXG5cclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sICs9IGRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGlmIChkYXRhLmJ1dHRvblllcyB8fCBkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xyXG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG4gICAgaWYgKGRhdGEuY2FsbGJhY2tZZXMgIT0gZmFsc2UpIHtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrWWVzLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuICAgIGlmIChkYXRhLmNhbGxiYWNrTm8gIT0gZmFsc2UpIHtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsIGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sIDEwMClcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcclxuICAgIHZhciBvcHRpb24gPSB7dGltZTogKGRhdGEudGltZSB8fCBkYXRhLnRpbWUgPT09IDApID8gZGF0YS50aW1lIDogdGltZX07XHJcbiAgICBpZiAoIWNvbnRlaW5lcikge1xyXG4gICAgICBjb250ZWluZXIgPSAkKCc8dWwvPicsIHtcclxuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XHJcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xyXG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9pdGVtJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSkge1xyXG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNsb3NlID0gJCgnPHNwYW4vPicsIHtcclxuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25fY2xvc2UnXHJcbiAgICB9KTtcclxuICAgIG9wdGlvbi5jbG9zZSA9IGNsb3NlO1xyXG4gICAgbGkuYXBwZW5kKGNsb3NlKTtcclxuXHJcbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciB0aXRsZSA9ICQoJzxoNS8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRleHQgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90ZXh0XCJcclxuICAgIH0pO1xyXG4gICAgdGV4dC5odG1sKGRhdGEubWVzc2FnZSk7XHJcblxyXG4gICAgaWYgKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcclxuICAgICAgfSk7XHJcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XHJcbiAgICAgIHZhciB3cmFwID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIndyYXBcIlxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHdyYXAuYXBwZW5kKGltZyk7XHJcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh3cmFwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRleHQpO1xyXG4gICAgfVxyXG4gICAgbGkuYXBwZW5kKGNvbnRlbnQpO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcclxuICAgIC8vICAgdmFyIHRpdGxlID0gJCgnPHAvPicsIHtcclxuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxyXG4gICAgLy8gICB9KTtcclxuICAgIC8vICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcclxuICAgIC8vICAgbGkuYXBwZW5kKHRpdGxlKTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xyXG4gICAgLy8gICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xyXG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxyXG4gICAgLy8gICB9KTtcclxuICAgIC8vICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XHJcbiAgICAvLyAgIGxpLmFwcGVuZChpbWcpO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuICAgIC8vIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XHJcbiAgICAvLyAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxyXG4gICAgLy8gfSk7XHJcbiAgICAvLyBjb250ZW50Lmh0bWwoZGF0YS5tZXNzYWdlKTtcclxuICAgIC8vXHJcbiAgICAvLyBsaS5hcHBlbmQoY29udGVudCk7XHJcbiAgICAvL1xyXG4gICAgY29udGVpbmVyLmFwcGVuZChsaSk7XHJcblxyXG4gICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xyXG4gICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQoY2xvc2UpLCBvcHRpb24udGltZSk7XHJcbiAgICB9XHJcbiAgICBsaS5kYXRhKCdvcHRpb24nLCBvcHRpb24pXHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYWxlcnQ6IGFsZXJ0LFxyXG4gICAgY29uZmlybTogY29uZmlybSxcclxuICAgIG5vdGlmaTogbm90aWZpLFxyXG4gIH07XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gIGVsID0gJCgkdGhpcy5hdHRyKCdocmVmJykpO1xyXG4gIGRhdGEgPSBlbC5kYXRhKCk7XHJcblxyXG4gIGRhdGEucXVlc3Rpb24gPSBlbC5odG1sKCk7XHJcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG59KTtcclxuXHJcbiQoJ1tyZWY9Y29uZmlybV0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XHJcbiAgZGF0YSA9IGVsLmRhdGEoKTtcclxuICBkYXRhLnF1ZXN0aW9uID0gZWwuaHRtbCgpO1xyXG4gIG5vdGlmaWNhdGlvbi5jb25maXJtKGRhdGEpO1xyXG59KTtcclxuXHJcblxyXG4kKCcuZGlzYWJsZWQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgZGF0YSA9ICR0aGlzLmRhdGEoKTtcclxuICBpZiAoZGF0YVsnYnV0dG9uX3llcyddKWRhdGFbJ2J1dHRvblllcyddID0gZGF0YVsnYnV0dG9uX3llcyddXHJcblxyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tb2RhbHNfb3BlbicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcblxyXG4gICAgLy/Qv9GA0Lgg0L7RgtC60YDRi9GC0LjQuCDRhNC+0YDQvNGLINGA0LXQs9C40YHRgtGA0LDRhtC40Lgg0LfQsNC60YDRi9GC0YwsINC10YHQu9C4INC+0YLRgNGL0YLQviAtINC/0L7Qv9Cw0L8g0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40Y8g0LrRg9C/0L7QvdCwINCx0LXQtyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4XHJcbiAgICB2YXIgcG9wdXAgPSAkKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikuZGF0YSgncG9wdXAnKTtcclxuICAgIGlmIChwb3B1cCkge1xyXG4gICAgICBwb3B1cC5jbG9zZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcG9wdXAgPSAkKCdkaXYucG9wdXBfY29udCwgZGl2LnBvcHVwX2JhY2snKTtcclxuICAgICAgaWYgKHBvcHVwKSB7XHJcbiAgICAgICAgcG9wdXAuaGlkZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhyZWYgPSB0aGlzLmhyZWYuc3BsaXQoJyMnKTtcclxuICAgIGhyZWYgPSBocmVmW2hyZWYubGVuZ3RoIC0gMV07XHJcbiAgICB2YXIgbm90eUNsYXNzID0gJCh0aGlzKS5kYXRhKCdub3R5Y2xhc3MnKTtcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxyXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibG9hZGluZyBcIiArIChocmVmLmluZGV4T2YoJ3ZpZGVvJykgPT09IDAgPyAnbW9kYWxzLWZ1bGxfc2NyZWVuJyA6ICdub3RpZnlfd2hpdGUnKSArICcgJyArIG5vdHlDbGFzcyxcclxuICAgICAgcXVlc3Rpb246ICcnXHJcbiAgICB9O1xyXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG5cclxuICAgICQuZ2V0KCcvJyArIGhyZWYsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbChkYXRhLmh0bWwpO1xyXG4gICAgICBhamF4Rm9ybSgkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKSk7XHJcbiAgICB9LCAnanNvbicpO1xyXG5cclxuICAgIC8vY29uc29sZS5sb2codGhpcyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSlcclxufSgpKTtcclxuIiwiJCgnLmZvb3Rlci1tZW51LXRpdGxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgaWYgKCR0aGlzLmhhc0NsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJykpIHtcclxuICAgICR0aGlzLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJylcclxuICB9IGVsc2Uge1xyXG4gICAgJCgnLmZvb3Rlci1tZW51LXRpdGxlX29wZW4nKS5yZW1vdmVDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpO1xyXG4gICAgJHRoaXMuYWRkQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKTtcclxuICB9XHJcblxyXG59KTtcclxuIiwiJChmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gc3Rhck5vbWluYXRpb24oaW5kZXgpIHtcclxuICAgIHZhciBzdGFycyA9ICQoXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIpO1xyXG4gICAgc3RhcnMuYWRkQ2xhc3MoXCJyYXRpbmctc3Rhci1vcGVuXCIpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XHJcbiAgICAgIHN0YXJzLmVxKGkpLnJlbW92ZUNsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKFwibW91c2VvdmVyXCIsIFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcbiAgfSkub24oXCJtb3VzZWxlYXZlXCIsIFwiLnJhdGluZy13cmFwcGVyXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgpKTtcclxuICB9KS5vbihcImNsaWNrXCIsIFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcblxyXG4gICAgJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcbiAgfSk7XHJcbn0pO1xyXG4iLCIvL9C40LfQsdGA0LDQvdC90L7QtVxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgJChcIi5mYXZvcml0ZS1saW5rXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHR5cGUgPSBzZWxmLmF0dHIoXCJkYXRhLXN0YXRlXCIpLFxyXG4gICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmF0dHIoXCJkYXRhLWFmZmlsaWF0ZS1pZFwiKTtcclxuXHJcbiAgICBpZiAoIWFmZmlsaWF0ZV9pZCkge1xyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICB0aXRsZTogXCLQndC10L7QsdGF0L7QtNC40LzQviDQsNCy0YLQvtGA0LjQt9C+0LLQsNGC0YzRgdGPXCIsXHJcbiAgICAgICAgbWVzc2FnZTogJ9CU0L7QsdCw0LLQuNGC0Ywg0LIg0LjQt9Cx0YDQsNC90L3QvtC1INC80L7QttC10YIg0YLQvtC70YzQutC+INCw0LLRgtC+0YDQuNC30L7QstCw0L3QvdGL0Lkg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GMLjwvYnI+JyArXHJcbiAgICAgICAgJzxhIGhyZWY9XCIjbG9naW5cIiBjbGFzcz1cIm1vZGFsc19vcGVuXCI+0JLRhdC+0LQ8L2E+ICAvIDxhIGhyZWY9XCIjcmVnaXN0cmF0aW9uXCIgY2xhc3M9XCJtb2RhbHNfb3BlblwiPtCg0LXQs9C40YHRgtGA0LDRhtC40Y88L2E+JyxcclxuICAgICAgICB0eXBlOiAnZXJyJ1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2VsZi5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHNlbGYuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcblxyXG4gICAgLyppZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICBzZWxmLmZpbmQoXCIuaXRlbV9pY29uXCIpLnJlbW92ZUNsYXNzKFwibXV0ZWRcIik7XHJcbiAgICAgfSovXHJcblxyXG4gICAgJC5wb3N0KFwiL2FjY291bnQvZmF2b3JpdGVzXCIsIHtcclxuICAgICAgXCJ0eXBlXCI6IHR5cGUsXHJcbiAgICAgIFwiYWZmaWxpYXRlX2lkXCI6IGFmZmlsaWF0ZV9pZFxyXG4gICAgfSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgaWYgKGRhdGEuZXJyb3IpIHtcclxuICAgICAgICBzZWxmLmZpbmQoJ3N2ZycpLnJlbW92ZUNsYXNzKFwic3BpblwiKTtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOiBkYXRhLmVycm9yLCB0eXBlOiAnZXJyJywgJ3RpdGxlJzogKGRhdGEudGl0bGUgPyBkYXRhLnRpdGxlIDogZmFsc2UpfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICBtZXNzYWdlOiBkYXRhLm1zZyxcclxuICAgICAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICAgICAgJ3RpdGxlJzogKGRhdGEudGl0bGUgPyBkYXRhLnRpdGxlIDogZmFsc2UpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcIi5pdGVtX2ljb25cIikuYWRkQ2xhc3MoXCJzdmctbm8tZmlsbFwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VsZi5hdHRyKHtcclxuICAgICAgICBcImRhdGEtc3RhdGVcIjogZGF0YVtcImRhdGEtc3RhdGVcIl0sXHJcbiAgICAgICAgXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCI6IGRhdGFbJ2RhdGEtb3JpZ2luYWwtdGl0bGUnXVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmICh0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluIHN2Zy1uby1maWxsXCIpO1xyXG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJkZWxldGVcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW5cIikuYWRkQ2xhc3MoXCJzdmctbm8tZmlsbFwiKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sICdqc29uJykuZmFpbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgIG1lc3NhZ2U6IFwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgK1xyXG4gICAgICAgIFwiINC/0YDQvtC40LfQstC10LTRkdC90L3QvtC1INC00LXQudGB0YLQstC40LUg0L3QtdCy0L7Qt9C80L7QttC90L4uINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC/0L7Qt9C20LUuXCIgK1xyXG4gICAgICAgIFwiINCf0YDQuNC90L7RgdC40Lwg0YHQstC+0Lgg0LjQt9Cy0LjQvdC10L3QuNGPINC30LAg0L3QtdGD0LTQvtCx0YHRgtCy0L4uXCIsIHR5cGU6ICdlcnInXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5hZGRDbGFzcyhcInN2Zy1uby1maWxsXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW5cIik7XHJcbiAgICB9KVxyXG4gIH0pO1xyXG59KTtcclxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5zY3JvbGxfdG8nKS5jbGljayhmdW5jdGlvbiAoZSkgeyAvLyDQu9C+0LLQuNC8INC60LvQuNC6INC/0L4g0YHRgdGL0LvQutC1INGBINC60LvQsNGB0YHQvtC8IGdvX3RvXHJcbiAgICB2YXIgc2Nyb2xsX2VsID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7IC8vINCy0L7Qt9GM0LzQtdC8INGB0L7QtNC10YDQttC40LzQvtC1INCw0YLRgNC40LHRg9GC0LAgaHJlZiwg0LTQvtC70LbQtdC9INCx0YvRgtGMINGB0LXQu9C10LrRgtC+0YDQvtC8LCDRgi7QtS4g0L3QsNC/0YDQuNC80LXRgCDQvdCw0YfQuNC90LDRgtGM0YHRjyDRgSAjINC40LvQuCAuXHJcbiAgICBzY3JvbGxfZWwgPSAkKHNjcm9sbF9lbCk7XHJcbiAgICBpZiAoc2Nyb2xsX2VsLmxlbmd0aCAhPSAwKSB7IC8vINC/0YDQvtCy0LXRgNC40Lwg0YHRg9GJ0LXRgdGC0LLQvtCy0LDQvdC40LUg0Y3Qu9C10LzQtdC90YLQsCDRh9GC0L7QsdGLINC40LfQsdC10LbQsNGC0Ywg0L7RiNC40LHQutC4XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogc2Nyb2xsX2VsLm9mZnNldCgpLnRvcCAtICQoJyNoZWFkZXI+KicpLmVxKDApLmhlaWdodCgpIC0gNTB9LCA1MDApOyAvLyDQsNC90LjQvNC40YDRg9C10Lwg0YHQutGA0L7QvtC70LjQvdCzINC6INGN0LvQtdC80LXQvdGC0YMgc2Nyb2xsX2VsXHJcbiAgICAgIGlmIChzY3JvbGxfZWwuaGFzQ2xhc3MoJ2FjY29yZGlvbicpICYmICFzY3JvbGxfZWwuaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAgIHNjcm9sbF9lbC5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wnKS5jbGljaygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7IC8vINCy0YvQutC70Y7Rh9Cw0LXQvCDRgdGC0LDQvdC00LDRgNGC0L3QvtC1INC00LXQudGB0YLQstC40LVcclxuICB9KTtcclxufSk7XHJcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAkKFwiYm9keVwiKS5vbignY2xpY2snLCAnLnNldF9jbGlwYm9hcmQnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgIGNvcHlUb0NsaXBib2FyZCgkdGhpcy5kYXRhKCdjbGlwYm9hcmQnKSwgJHRoaXMuZGF0YSgnY2xpcGJvYXJkLW5vdGlmeScpKTtcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gY29weVRvQ2xpcGJvYXJkKGNvZGUsIG1zZykge1xyXG4gICAgdmFyICR0ZW1wID0gJChcIjxpbnB1dD5cIik7XHJcbiAgICAkKFwiYm9keVwiKS5hcHBlbmQoJHRlbXApO1xyXG4gICAgJHRlbXAudmFsKGNvZGUpLnNlbGVjdCgpO1xyXG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJjb3B5XCIpO1xyXG4gICAgJHRlbXAucmVtb3ZlKCk7XHJcblxyXG4gICAgaWYgKCFtc2cpIHtcclxuICAgICAgbXNnID0gXCLQlNCw0L3QvdGL0LUg0YPRgdC/0LXRiNC90L4g0YHQutC+0L/QuNGA0L7QstCw0L3RiyDQsiDQsdGD0YTQtdGAINC+0LHQvNC10L3QsFwiO1xyXG4gICAgfVxyXG4gICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7J3R5cGUnOiAnaW5mbycsICdtZXNzYWdlJzogbXNnLCAndGl0bGUnOiAn0KPRgdC/0LXRiNC90L4nfSlcclxuICB9XHJcblxyXG4gICQoXCJib2R5XCIpLm9uKCdjbGljaycsIFwiaW5wdXQubGlua1wiLCBmdW5jdGlvbiAoKSB7XHQvLyDQv9C+0LvRg9GH0LXQvdC40LUg0YTQvtC60YPRgdCwINGC0LXQutGB0YLQvtCy0YvQvCDQv9C+0LvQtdC8LdGB0YHRi9C70LrQvtC5XHJcbiAgICAkKHRoaXMpLnNlbGVjdCgpO1xyXG4gIH0pO1xyXG59KTtcclxuIiwiLy/RgdC60LDRh9C40LLQsNC90LjQtSDQutCw0YDRgtC40L3QvtC6XHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCkge1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGltZyA9IGRhdGEuaW1nO1xyXG4gICAgaW1nLndyYXAoJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPjwvZGl2PicpO1xyXG4gICAgdmFyIHdyYXAgPSBpbWcucGFyZW50KCk7XHJcbiAgICAkKCcuZG93bmxvYWRfdGVzdCcpLmFwcGVuZChkYXRhLmVsKTtcclxuICAgIHNpemUgPSBkYXRhLmVsLndpZHRoKCkgKyBcInhcIiArIGRhdGEuZWwuaGVpZ2h0KCk7XHJcblxyXG4gICAgdz1kYXRhLmVsLndpZHRoKCkqMC44O1xyXG4gICAgaW1nXHJcbiAgICAgIC5oZWlnaHQoJ2F1dG8nKVxyXG4gICAgICAvLy53aWR0aCh3KVxyXG4gICAgICAuY3NzKCdtYXgtd2lkdGgnLCc5OSUnKTtcclxuXHJcblxyXG4gICAgZGF0YS5lbC5yZW1vdmUoKTtcclxuICAgIHdyYXAuYXBwZW5kKCc8c3Bhbj4nICsgc2l6ZSArICc8L3NwYW4+IDxhIGhyZWY9XCInICsgZGF0YS5zcmMgKyAnXCIgZG93bmxvYWQ+0KHQutCw0YfQsNGC0Yw8L2E+Jyk7XHJcbiAgfVxyXG5cclxuICB2YXIgaW1ncyA9ICQoJy5kb3dubG9hZHNfaW1nIGltZycpO1xyXG4gIGlmKGltZ3MubGVuZ3RoPT0wKXJldHVybjtcclxuXHJcbiAgJCgnYm9keScpLmFwcGVuZCgnPGRpdiBjbGFzcz1kb3dubG9hZF90ZXN0PjwvZGl2PicpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGltZyA9IGltZ3MuZXEoaSk7XHJcbiAgICB2YXIgc3JjID0gaW1nLmF0dHIoJ3NyYycpO1xyXG4gICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XHJcbiAgICAgIHNyYzogc3JjXHJcbiAgICB9KTtcclxuICAgIGRhdGEgPSB7XHJcbiAgICAgIHNyYzogc3JjLFxyXG4gICAgICBpbWc6IGltZyxcclxuICAgICAgZWw6IGltYWdlXHJcbiAgICB9O1xyXG4gICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcclxuICB9XHJcbn0pKCk7XHJcblxyXG4vL9GH0YLQviDQsSDQuNGE0YDQtdC50LzRiyDQuCDQutCw0YDRgtC40L3QutC4INC90LUg0LLRi9C70LDQt9C40LvQuFxyXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gIC8qbV93ID0gJCgnLnRleHQtY29udGVudCcpLndpZHRoKClcclxuICAgaWYgKG1fdyA8IDUwKW1fdyA9IHNjcmVlbi53aWR0aCAtIDQwKi9cclxuICB2YXIgbXc9c2NyZWVuLndpZHRoLTQwO1xyXG5cclxuICBmdW5jdGlvbiBvcHRpbWFzZShlbCl7XHJcbiAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50KCk7XHJcbiAgICBpZihwYXJlbnQubGVuZ3RoPT0wIHx8IHBhcmVudFswXS50YWdOYW1lPT1cIkFcIil7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmKGVsLmhhc0NsYXNzKCdub19vcHRvbWl6ZScpKXJldHVybjtcclxuXHJcbiAgICBtX3cgPSBwYXJlbnQud2lkdGgoKS0zMDtcclxuICAgIHZhciB3PWVsLndpZHRoKCk7XHJcblxyXG4gICAgLy/QsdC10Lcg0Y3RgtC+0LPQviDQv9C70Y7RidC40YIg0LHQsNC90LXRgNGLINCyINCw0LrQsNGA0LTQuNC+0L3QtVxyXG4gICAgaWYodzwzIHx8IG1fdzwzKXtcclxuICAgICAgZWxcclxuICAgICAgICAuaGVpZ2h0KCdhdXRvJylcclxuICAgICAgICAuY3NzKCdtYXgtd2lkdGgnLCc5OSUnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGVsLndpZHRoKCdhdXRvJyk7XHJcbiAgICBpZihlbFswXS50YWdOYW1lPT1cIklNR1wiICYmIHc+ZWwud2lkdGgoKSl3PWVsLndpZHRoKCk7XHJcblxyXG4gICAgaWYgKG13PjUwICYmIG1fdyA+IG13KW1fdyA9IG13O1xyXG4gICAgaWYgKHc+bV93KSB7XHJcbiAgICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpe1xyXG4gICAgICAgIGsgPSB3IC8gbV93O1xyXG4gICAgICAgIGVsLmhlaWdodChlbC5oZWlnaHQoKSAvIGspO1xyXG4gICAgICB9XHJcbiAgICAgIGVsLndpZHRoKG1fdylcclxuICAgIH1lbHNle1xyXG4gICAgICBlbC53aWR0aCh3KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xyXG4gICAgdmFyIGVsPSQodGhpcyk7XHJcbiAgICBvcHRpbWFzZShlbCk7XHJcbiAgfVxyXG5cclxuICB2YXIgcCA9ICQoJy5jb250ZW50LXdyYXAgaW1nLC5jb250ZW50LXdyYXAgaWZyYW1lJyk7XHJcbiAgJCgnLmNvbnRlbnQtd3JhcCBpbWc6bm90KC5ub19vcHRvbWl6ZSknKS5oZWlnaHQoJ2F1dG8nKTtcclxuICAvLyQoJy5jb250YWluZXIgaW1nJykud2lkdGgoJ2F1dG8nKTtcclxuICBmb3IgKGkgPSAwOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgZWwgPSBwLmVxKGkpO1xyXG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIikge1xyXG4gICAgICBvcHRpbWFzZShlbCk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgdmFyIHNyYz1lbC5hdHRyKCdzcmMnKTtcclxuICAgICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XHJcbiAgICAgICAgc3JjOiBzcmNcclxuICAgICAgfSk7XHJcbiAgICAgIGltYWdlLm9uKCdsb2FkJywgaW1nX2xvYWRfZmluaXNoLmJpbmQoZWwpKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuXHJcbi8v0J/RgNC+0LLQtdGA0LrQsCDQsdC40YLRiyDQutCw0YDRgtC40L3QvtC6LlxyXG4vLyAhISEhISFcclxuLy8g0J3Rg9C20L3QviDQv9GA0L7QstC10YDQuNGC0YwuINCS0YvQt9GL0LLQsNC70L4g0LPQu9GO0LrQuCDQv9GA0Lgg0LDQstGC0L7RgNC30LDRhtC40Lgg0YfQtdGA0LXQtyDQpNCRINC90LAg0YHQsNGE0LDRgNC4XHJcbi8vICEhISEhIVxyXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xyXG4gICAgdmFyIGRhdGE9dGhpcztcclxuICAgIGlmKGRhdGEudGFnTmFtZSl7XHJcbiAgICAgIGRhdGE9JChkYXRhKS5kYXRhKCdkYXRhJyk7XHJcbiAgICB9XHJcbiAgICB2YXIgaW1nPWRhdGEuaW1nO1xyXG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XHJcbiAgICAgIGltZy5hdHRyKCdzcmMnLCBkYXRhLnNyYyk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJytkYXRhLnNyYysnKScpO1xyXG4gICAgICBpbWcucmVtb3ZlQ2xhc3MoJ25vX2F2YScpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdGVzdEltZyhpbWdzLG5vX2ltZyl7XHJcbiAgICBpZighaW1ncyB8fCBpbWdzLmxlbmd0aD09MClyZXR1cm47XHJcblxyXG4gICAgaWYoIW5vX2ltZylub19pbWc9Jy9pbWFnZXMvdGVtcGxhdGUtbG9nby5qcGcnO1xyXG5cclxuICAgIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XHJcbiAgICAgIHZhciBpbWc9aW1ncy5lcShpKTtcclxuICAgICAgaWYoaW1nLmhhc0NsYXNzKCdub19hdmEnKSl7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBkYXRhPXtcclxuICAgICAgICBpbWc6aW1nXHJcbiAgICAgIH07XHJcbiAgICAgIHZhciBzcmM7XHJcbiAgICAgIGlmKFswXS50YWdOYW1lPT1cIklNR1wiKXtcclxuICAgICAgICBkYXRhLnR5cGU9MDtcclxuICAgICAgICBzcmM9aW1nLmF0dHIoJ3NyYycpO1xyXG4gICAgICAgIGltZy5hdHRyKCdzcmMnLG5vX2ltZyk7XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIGRhdGEudHlwZT0xO1xyXG4gICAgICAgIHNyYz1pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyk7XHJcbiAgICAgICAgaWYoIXNyYyljb250aW51ZTtcclxuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybChcIicsJycpO1xyXG4gICAgICAgIHNyYz1zcmMucmVwbGFjZSgnXCIpJywnJyk7XHJcbiAgICAgICAgaW1nLmFkZENsYXNzKCdub19hdmEnKTtcclxuICAgICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrbm9faW1nKycpJyk7XHJcbiAgICAgIH1cclxuICAgICAgZGF0YS5zcmM9c3JjO1xyXG4gICAgICB2YXIgaW1hZ2U9JCgnPGltZy8+Jyx7XHJcbiAgICAgICAgc3JjOnNyY1xyXG4gICAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpO1xyXG4gICAgICBpbWFnZS5kYXRhKCdkYXRhJyxkYXRhKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8v0YLQtdGB0YIg0LvQvtCz0L4g0LzQsNCz0LDQt9C40L3QsFxyXG4gIHZhciBpbWdzPSQoJ3NlY3Rpb246bm90KC5uYXZpZ2F0aW9uKScpO1xyXG4gIGltZ3M9aW1ncy5maW5kKCcubG9nbyBpbWcnKTtcclxuICB0ZXN0SW1nKGltZ3MsJy9pbWFnZXMvdGVtcGxhdGUtbG9nby5qcGcnKTtcclxuXHJcbiAgLy/RgtC10YHRgiDQsNCy0LDRgtCw0YDQvtC6INCyINC60L7QvNC10L3RgtCw0YDQuNGP0YVcclxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvLC5zY3JvbGxfYm94LWF2YXRhcicpO1xyXG4gIHRlc3RJbWcoaW1ncywnL2ltYWdlcy9ub19hdmFfc3F1YXJlLnBuZycpO1xyXG59KTtcclxuIiwiLy/QtdGB0LvQuCDQvtGC0LrRgNGL0YLQviDQutCw0Log0LTQvtGH0LXRgNC90LXQtVxyXG4oZnVuY3Rpb24gKCkge1xyXG4gIGlmICghd2luZG93Lm9wZW5lcilyZXR1cm47XHJcblxyXG4gIGhyZWYgPSB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY7XHJcbiAgaWYgKFxyXG4gICAgaHJlZi5pbmRleE9mKCdhY2NvdW50L29mZmxpbmUnKSA+IDBcclxuICApIHtcclxuICAgIHdpbmRvdy5wcmludCgpXHJcbiAgfVxyXG5cclxuICBpZiAoZG9jdW1lbnQucmVmZXJyZXIuaW5kZXhPZignc2VjcmV0ZGlzY291bnRlcicpIDwgMClyZXR1cm47XHJcblxyXG4gIGlmIChcclxuICAgIGhyZWYuaW5kZXhPZignc29jaWFscycpID4gMCB8fFxyXG4gICAgaHJlZi5pbmRleE9mKCdsb2dpbicpID4gMCB8fFxyXG4gICAgaHJlZi5pbmRleE9mKCdhZG1pbicpID4gMCB8fFxyXG4gICAgaHJlZi5pbmRleE9mKCdhY2NvdW50JykgPiAwXHJcbiAgKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAoaHJlZi5pbmRleE9mKCdzdG9yZScpID4gMCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpID4gMCB8fCBocmVmLmluZGV4T2YoJ3NldHRpbmdzJykgPiAwKSB7XHJcbiAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xyXG4gIH1cclxuICB3aW5kb3cuY2xvc2UoKTtcclxufSkoKTtcclxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgdmFyIGZpbGUgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcclxuICAgIHZhciBmID0gZmlsZVswXTtcclxuICAgIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cclxuICAgIGlmICghZi50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgZGF0YSA9IHtcclxuICAgICAgJ2VsJzogdGhpcyxcclxuICAgICAgJ2YnOiBmXHJcbiAgICB9O1xyXG4gICAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpbWcgPSAkKCdbZm9yPVwiJyArIGRhdGEuZWwubmFtZSArICdcIl0nKTtcclxuICAgICAgICBpZiAoaW1nLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGltZy5hdHRyKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfSkoZGF0YSk7XHJcbiAgICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXHJcbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmR1YmxpY2F0ZV92YWx1ZScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHNlbCA9ICQoJHRoaXMuZGF0YSgnc2VsZWN0b3InKSk7XHJcbiAgICBzZWwudmFsKHRoaXMudmFsdWUpO1xyXG4gIH0pXHJcbn0pO1xyXG4iLCJcclxuZnVuY3Rpb24gZ2V0Q29va2llKG4pIHtcclxuICByZXR1cm4gdW5lc2NhcGUoKFJlZ0V4cChuICsgJz0oW147XSspJykuZXhlYyhkb2N1bWVudC5jb29raWUpIHx8IFsxLCAnJ10pWzFdKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsIHZhbHVlKSB7XHJcbiAgdmFyIGNvb2tpZV9zdHJpbmcgPSBuYW1lICsgXCI9XCIgKyBlc2NhcGUgKCB2YWx1ZSApO1xyXG4gIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZV9zdHJpbmc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVyYXNlQ29va2llKG5hbWUpe1xyXG4gIHZhciBjb29raWVfc3RyaW5nID0gbmFtZSArIFwiPTBcIiArXCI7IGV4cGlyZXM9V2VkLCAwMSBPY3QgMjAxNyAwMDowMDowMCBHTVRcIjtcclxuICBkb2N1bWVudC5jb29raWUgPSBjb29raWVfc3RyaW5nO1xyXG59XHJcbiIsIihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICB2YXIgdGFibGVzID0gJCgndGFibGUuYWRhcHRpdmUnKTtcclxuXHJcbiAgaWYgKHRhYmxlcy5sZW5ndGggPT0gMClyZXR1cm47XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyB0YWJsZXMubGVuZ3RoID4gaTsgaSsrKSB7XHJcbiAgICB2YXIgdGFibGUgPSB0YWJsZXMuZXEoaSk7XHJcbiAgICB2YXIgdGggPSB0YWJsZS5maW5kKCd0aGVhZCcpO1xyXG4gICAgaWYgKHRoLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIHRoID0gdGFibGUuZmluZCgndHInKS5lcSgwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoID0gdGguZmluZCgndHInKS5lcSgwKTtcclxuICAgIH1cclxuICAgIHRoID0gdGguYWRkQ2xhc3MoJ3RhYmxlLWhlYWRlcicpLmZpbmQoJ3RkLHRoJyk7XHJcblxyXG4gICAgdmFyIHRyID0gdGFibGUuZmluZCgndHInKS5ub3QoJy50YWJsZS1oZWFkZXInKTtcclxuXHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgIHZhciBrID0gaiArIDE7XHJcbiAgICAgIHZhciB0ZCA9IHRyLmZpbmQoJ3RkOm50aC1jaGlsZCgnICsgayArICcpJyk7XHJcbiAgICAgIHRkLmF0dHIoJ2xhYmVsJywgdGguZXEoaikudGV4dCgpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG59KSh3aW5kb3csIGRvY3VtZW50KTtcclxuIiwiO1xyXG4kKGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIG9uUmVtb3ZlKCl7XHJcbiAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgcG9zdD17XHJcbiAgICAgIGlkOiR0aGlzLmF0dHIoJ3VpZCcpLFxyXG4gICAgICB0eXBlOiR0aGlzLmF0dHIoJ21vZGUnKVxyXG4gICAgfTtcclxuICAgICQucG9zdCgkdGhpcy5hdHRyKCd1cmwnKSxwb3N0LGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICBpZihkYXRhICYmIGRhdGE9PSdlcnInKXtcclxuICAgICAgICBtc2c9JHRoaXMuZGF0YSgncmVtb3ZlLWVycm9yJyk7XHJcbiAgICAgICAgaWYoIW1zZyl7XHJcbiAgICAgICAgICBtc2c9J9Cd0LXQstC+0LfQvNC+0LbQvdC+INGD0LTQsNC70LjRgtGMINGN0LvQtdC80LXQvdGCJztcclxuICAgICAgICB9XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTptc2csdHlwZTonZXJyJ30pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbW9kZT0kdGhpcy5hdHRyKCdtb2RlJyk7XHJcbiAgICAgIGlmKCFtb2RlKXtcclxuICAgICAgICBtb2RlPSdybSc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKG1vZGU9PSdybScpIHtcclxuICAgICAgICBybSA9ICR0aGlzLmNsb3Nlc3QoJy50b19yZW1vdmUnKTtcclxuICAgICAgICBybV9jbGFzcyA9IHJtLmF0dHIoJ3JtX2NsYXNzJyk7XHJcbiAgICAgICAgaWYgKHJtX2NsYXNzKSB7XHJcbiAgICAgICAgICAkKHJtX2NsYXNzKS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJtLnJlbW92ZSgpO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cj0YHQv9C10YjQvdC+0LUg0YPQtNCw0LvQtdC90LjQtS4nLHR5cGU6J2luZm8nfSlcclxuICAgICAgfVxyXG4gICAgICBpZihtb2RlPT0ncmVsb2FkJyl7XHJcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgbG9jYXRpb24uaHJlZj1sb2NhdGlvbi5ocmVmO1xyXG4gICAgICB9XHJcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKCl7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Ce0YjQuNCx0LrQsCDRg9C00LDQu9C90LjRjycsdHlwZTonZXJyJ30pO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuYWpheF9yZW1vdmUnLGZ1bmN0aW9uKCl7XHJcbiAgICBub3RpZmljYXRpb24uY29uZmlybSh7XHJcbiAgICAgIGNhbGxiYWNrWWVzOm9uUmVtb3ZlLFxyXG4gICAgICBvYmo6JCh0aGlzKSxcclxuICAgICAgbm90eWZ5X2NsYXNzOiBcIm5vdGlmeV9ib3gtYWxlcnRcIlxyXG4gICAgfSlcclxuICB9KTtcclxuXHJcbn0pO1xyXG5cclxuIiwiaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xyXG4gIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKG9UaGlzKSB7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgLy8g0LHQu9C40LbQsNC50YjQuNC5INCw0L3QsNC70L7QsyDQstC90YPRgtGA0LXQvdC90LXQuSDRhNGD0L3QutGG0LjQuFxyXG4gICAgICAvLyBJc0NhbGxhYmxlINCyIEVDTUFTY3JpcHQgNVxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBhQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXHJcbiAgICAgIGZUb0JpbmQgPSB0aGlzLFxyXG4gICAgICBmTk9QID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB9LFxyXG4gICAgICBmQm91bmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1AgJiYgb1RoaXNcclxuICAgICAgICAgICAgPyB0aGlzXHJcbiAgICAgICAgICAgIDogb1RoaXMsXHJcbiAgICAgICAgICBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xyXG4gICAgICB9O1xyXG5cclxuICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XHJcbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcclxuXHJcbiAgICByZXR1cm4gZkJvdW5kO1xyXG4gIH07XHJcbn1cclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuaGlkZGVuLWxpbmsnKS5yZXBsYWNlV2l0aChmdW5jdGlvbiAoKSB7XHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICByZXR1cm4gJzxhIGhyZWY9XCInICsgJHRoaXMuZGF0YSgnbGluaycpICsgJ1wiIHJlbD1cIicrICR0aGlzLmRhdGEoJ3JlbCcpICsnXCIgY2xhc3M9XCInICsgJHRoaXMuYXR0cignY2xhc3MnKSArICdcIj4nICsgJHRoaXMudGV4dCgpICsgJzwvYT4nO1xyXG4gIH0pXHJcbn0pKCk7XHJcbiIsInZhciBzdG9yZV9wb2ludHMgPSAoZnVuY3Rpb24oKXtcclxuXHJcbiAgICAvL9C00LvRjyDRgtC+0YfQtdC6INC/0YDQvtC00LDQtiwg0YHQvtCx0YvRgtC40Y8g0L3QsCDQstGL0LHQvtGAINGB0LXQu9C10LrRgtC+0LJcclxuICAgICQoJ2JvZHknKS5vbignY2hhbmdlJywgJyNzdG9yZV9wb2ludF9jb3VudHJ5JywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBkYXRhID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgdGhpcykuZGF0YSgnY2l0aWVzJyksXHJcbiAgICAgICAgICAgIHBvaW50cz0gJCgnI3N0b3JlLXBvaW50cycpLFxyXG4gICAgICAgICAgICBjb3VudHJ5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgdGhpcykuYXR0cigndmFsdWUnKTtcclxuICAgICAgICBkYXRhID0gZGF0YS5zcGxpdCgnLCcpO1xyXG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9yZV9wb2ludF9jaXR5Jyk7XHJcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gJzxvcHRpb24gdmFsdWU9XCJcIj48L29wdGlvbj4nO1xyXG4gICAgICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zICs9ICc8b3B0aW9uIHZhbHVlPVwiJytpdGVtKydcIj4nK2l0ZW0rJzwvb3B0aW9uPic7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzZWxlY3QuaW5uZXJIVE1MID0gb3B0aW9ucztcclxuICAgICAgICB9XHJcbiAgICAgICAgJChwb2ludHMpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICBnb29nbGVNYXAuc2hvd01hcCgpO1xyXG4gICAgICAgIGdvb2dsZU1hcC5zaG93TWFya2VyKGNvdW50cnksICcnKTtcclxuXHJcbiAgICAgICAgLy9nb29nbGVNYXAuaGlkZU1hcCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnYm9keScpLm9uKCdjaGFuZ2UnLCAnI3N0b3JlX3BvaW50X2NpdHknLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIGNpdHkgPSAkKCdvcHRpb246c2VsZWN0ZWQnLCB0aGlzKS5hdHRyKCd2YWx1ZScpLFxyXG4gICAgICAgICAgICBjb3VudHJ5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgJCgnI3N0b3JlX3BvaW50X2NvdW50cnknKSkuYXR0cigndmFsdWUnKSxcclxuICAgICAgICAgICAgcG9pbnRzPSAkKCcjc3RvcmUtcG9pbnRzJyk7XHJcbiAgICAgICAgaWYgKGNvdW50cnkgJiYgY2l0eSkge1xyXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBwb2ludHMuZmluZCgnLnN0b3JlLXBvaW50c19fcG9pbnRzX3JvdycpLFxyXG4gICAgICAgICAgICAgICAgdmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xlTWFwLnNob3dNYXJrZXIoY291bnRyeSwgY2l0eSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkLmVhY2goaXRlbXMsIGZ1bmN0aW9uKGluZGV4LCBkaXYpe1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoZGl2KS5kYXRhKCdjaXR5JykgPT0gY2l0eSAmJiAkKGRpdikuZGF0YSgnY291bnRyeScpID09IGNvdW50cnkpe1xyXG4gICAgICAgICAgICAgICAgICAgICQoZGl2KS5yZW1vdmVDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHNfcm93LWhpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGRpdikuYWRkQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzX3Jvdy1oaWRkZW4nKSA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAodmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgJChwb2ludHMpLnJlbW92ZUNsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50cy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5zaG93TWFwKCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChwb2ludHMpLmFkZENsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50cy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5oaWRlTWFwKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKHBvaW50cykuYWRkQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzLWhpZGRlbicpO1xyXG4gICAgICAgICAgICBnb29nbGVNYXAuaGlkZU1hcCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KTtcclxuXHJcblxyXG59KSgpO1xyXG5cclxuIiwidmFyIGhhc2hUYWdzID0gKGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgdmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcclxuICAgIGlmIChoYXNoICE9IFwiXCIpIHtcclxuICAgICAgICB2YXIgaGFzaEJvZHkgPSBoYXNoLnNwbGl0KFwiP1wiKTtcclxuICAgICAgICBpZiAoaGFzaEJvZHlbMV0pIHtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gbG9jYXRpb24ub3JpZ2luICsgbG9jYXRpb24ucGF0aG5hbWUgKyAnPycgKyBoYXNoQm9keVsxXSArIGhhc2hCb2R5WzBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBsaW5rcyA9ICQoJ2FbaHJlZj1cIicgKyBoYXNoQm9keVswXSArICdcIl0ubW9kYWxzX29wZW4nKTtcclxuICAgICAgICAgICAgaWYgKGxpbmtzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgJChsaW5rc1swXSkuY2xpY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7Il19
