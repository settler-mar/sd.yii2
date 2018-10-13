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
  var slide_interval=4000;
  var scrolls_block = $('.scroll_box');

  if (scrolls_block.length == 0) return;
  //$('<div class="scroll_box-wrap"></div>').wrapAll(scrolls_block);
  $(scrolls_block).wrap('<div class="scroll_box-wrap"></div>');

  init_scroll();
  calc_scroll();

  $(window ).on("load", function() {
    calc_scroll();
  });
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

    var timeoutId = setTimeout(next_slide.bind($this), slide_interval);
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

    if (form.yiiActiveForm) {
      form.off('afterValidate')
      form.on('afterValidate', yiiValidation.bind(data));

      form.yiiActiveForm('validate', true);
      var d = form.data('yiiActiveForm');
      if (d) {
        d.validated = true;
        form.data('yiiActiveForm', d);
        form.yiiActiveForm('validate');
        isValid = d.validated;
      }
      e.stopImmediatePropagation();
      e.stopPropagation();
      return false
    }

    isValid = isValid && (form.find(data.param.error_class).length == 0);

    if (!isValid) {
      return false;
    } else {
      e.stopImmediatePropagation();
      e.stopPropagation();

      sendForm(data);
    }
  }

  function yiiValidation(e) {
    var form = data.form;

    if(form.find(data.param.error_class).length == 0){
      sendForm(this);
    }
    return true;
  }

  function sendForm(data){
    var form = data.form;

    if (!form.serializeObject)addSRO();

    var postData = form.serializeObject();
    form.addClass('loading');
    form.html('');
    data.wrap.html('<div style="text-align:center;"><p>'+lg('sending_data')+'</p></div>');

    data.url += (data.url.indexOf('?') > 0 ? '&' : '?') + 'rc=' + Math.random();
    //console.log(data.url);

    /*if(!postData.returnUrl){
      postData.returnUrl=location.href;
    }*/

    if(typeof lang != "undefined" && data.url.indexOf(lang["href_prefix"])==-1){
      data.url="/"+lang["href_prefix"]+data.url;
      data.url=data.url.replace('//','/').replace('//','/');
    }

    $.post(
      data.url,
      postData,
      onPost.bind(data),
      'json'
    ).fail(onFail.bind(data));
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
var sdTooltip = (function () {

    var tooltipTimeOut = null;
    var displayTimeOver = 0;
    var displayTimeClick = 3000;
    var hideTime = 100;
    var arrow = 10;
    var arrowWidth = 8;
    var tooltip;
    var size = 'small';
    var hideClass = 'hidden';
    var tooltipElements;
    var currentElement;

    function tooltipInit() {
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
    }

    function checkMousePos(e) {
        if (e.clientX > $(currentElement).offset().left && e.clientX < $(currentElement).offset().left + $(currentElement).outerWidth()
            && e.clientY > $(currentElement).offset().top && e.clientY < $(currentElement).offset().top + $(currentElement).outerHeight()) {
            tooltipShow(currentElement, displayTimeOver);
        }
    }

    function tooltipShow(elem, displayTime) {
        clearTimeout(tooltipTimeOut);

        var title = $(elem).data('original-title');
        var html = $('#'+$(elem).data('original-html')).html();
        if (html) {
            title = html;
            $(tooltip).addClass('tipso_bubble_html');
        } else {
            $(tooltip).removeClass('tipso_bubble_html');
        }
        var position = $(elem).data('placement') || 'bottom';
        $(tooltip).removeClass("top_right_corner bottom_right_corner top_left_corner bottom_left_corner");

        $(tooltip).find('.titso_title').html(title);
        setPositon(elem, position);
        $(tooltip).removeClass(hideClass);
        currentElement = elem;

        if (displayTime > 0) {
            tooltipTimeOut = setTimeout(tooltipHide, displayTime);
        }
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




    function setEvents() {

        tooltipElements = $('[data-toggle=tooltip]');

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
    }

    // $(document).ready(function () {
    //     tooltipInit();
    //     setEvents();
    // });
    //
    return {
        init: tooltipInit,
        setEvents: setEvents
    }
})();

$(document).ready(function() {
    sdTooltip.init();
    sdTooltip.setEvents();
});


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
    'black',
    'blue',
    'dark-blue',
    'red',
    'orange',
    'green',
    'light-green',
    'dark-green',
    'pink',
    'yellow'
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
                if(lang["href_prefix"].length>0 && item.data.route.indexOf(lang["href_prefix"])==-1){
                  item.data.route='/'+lang["href_prefix"]+item.data.route;
                  item.data.route=item.data.route.replace('//','/');
                }
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
  });

  $('.form-popup-select li').on('click', function(){

    var hidden = $(this).data('id2');
    $('#'+hidden).attr('value', $(this).data('value2'));
    var text = $(this).data('id1');
    $('#'+text).html($(this).data('value1'));
    var searchtext = $(this).data('id3');
    $('#'+searchtext).attr('placeholder', $(this).data('value3'));

    $(this).closest('.header-search_form-group').find('.header-search_form-input-module-label').addClass('close').removeClass('active');
  });

  $('.header-search_form-input-module').on('click', function(){
    $(this).closest('.header-search_form-input-module-label').toggleClass('active').removeClass('close');
  });

  $('.header-search_form-input-module-label').on('mouseover', function(){
        $(this).removeClass('close');
  });



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
      var message = lg("promocode_view_all",{"url":"/"+lang["href_prefix"]+"coupons"});
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
      var message = lg("promocode_view_all",{"url":"/"+lang["href_prefix"]+"coupons"});
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
        '<a href="' + that.attr('href') + '" target="_blank" class="btn notification-close">'+lg("use_promocode")+'</a>' +
        '<a href="#'+lang["href_prefix"]+'registration" class="btn btn-transform modals_open">'+lg("register")+'</a>' +
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

  $('.catalog_product_link').click(function(){
      var that = $(this);
      notification.alert({
        'buttonYes': false,
            'notyfy_class': "notify_box-alert",
            'title': lg("product_use"),
            'question': '<div class="notify_box-coupon-noregister">' +
        '<img src="/images/templates/swa.png" alt="">' +
        '<p><b>'+lg("product_use_without_cashback_or_register")+'</b></p>' +
        '</div>' +
        '<div class="notify_box-buttons">' +
        '<a href="' + that.attr('href') + '" target="_blank" class="btn notification-close">'+lg("product_use")+'</a>' +
        '<a href="#registration" class="btn btn-transform modals_open">'+lg("register")+'</a>' +
        '</div>'}
        );
      return false;
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

      case 7:
        placeholder = lg("withdraw_skrill");
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

  $('.form-test-link').on('submit',function(e){
    e.preventDefault();
    var form = $('.form-test-link');
    if(form.hasClass('loading'))return;
    form.find('.help-block').html("");

    var url = form.find('[name=url]').val();
    form.removeClass('has-error');

    if(url.length<3){
      form.find('.help-block').html(lg('required'));
      form.addClass('has-error');
      return;
    }else{

    }

    form.addClass('loading');
    form.find('input').attr('disabled',true);
    $.post(form.attr('action'),{url:url},function(d){
      form.find('input').attr('disabled',false);
      form.removeClass('loading');
      form.find('.help-block').html(d);
    });
  })
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
function share42(){
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
}

share42();

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

      if(text.indexOf('|')>0){
        text=text.split('|');
        text=text[0]+"<span>"+text[1]+"</span>"
      }

      var div = $('<label/>',{
        'class':'placeholder',
        'html': text,
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
(function () {

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
        $.get(url, {'g':'ajax_load'}, function(data){
            var content = $(data).find('#content-wrap').html();
            $('body').find('#content-wrap').html(content);
            share42();//t отобразились кнопки Поделиться
            sdTooltip.setEvents();//работали тултипы
            banner.refresh();//обновить баннер от гугл
            window.history.pushState("object or string", "Title", url);

            if (top > scrollTop) {
                $('html, body').animate({scrollTop: scrollTop}, 500);
            }

        }).fail(function() {
            $(that).removeClass('loading');
            notification.notifi({type:'err', 'title':lg('error'), 'message':lg('error_querying_data')});
        });
    });


})();

banner = (function() {
    function refresh(){
        for(i=0;i<$('.adsbygoogle').length;i++) {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.log(e);
                break;
            }
        }
    }
    return {refresh: refresh}
})();
var country_select = function(){

    $('.header-countries_dialog-close').click(function() {
        dialogClose(this);
    });

    $('.header-countries_dialog-dialog-button-apply').click(function() {
        var date = new(Date);
        date = date.getTime();
        setCookie('_sd_country_dialog_close', Math.round(date/1000), 7);
        dialogClose(this);
    });

    $('.header-countries_dialog-dialog-button-choose').click(function() {
        //добавляем класс, имитировать hover
        $('#header-upline-region-select-button').addClass("open");
        dialogClose(this);
    });

    $('.header-upline_lang-list').on('mouseenter', function(){
        $(this).removeClass('open');
    });

    var dialogClose = function(elem) {
        $(elem).closest('.header-countries_dialog').fadeOut();
    };
}();
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
    box_html += '<div>'+data.title+'</div>';
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
    var class_name=(href.indexOf('video') === 0 ? 'modals-full_screen' : 'notify_white') + ' ' + notyClass;
    var data = {
      buttonYes: false,
      notyfy_class: "loading " + class_name,
      question: ''
    };
    notification.alert(data);

    $.get('/' + href, function (data) {

      var data_msg = {
        buttonYes: false,
        notyfy_class: class_name,
        question: data.html,
      };

      if (data.title) {
        data_msg['title']=data.title;
      }

      /*if(data.buttonYes){
        data_msg['buttonYes']=data.buttonYes;
      }*/
      notification.alert(data_msg);
      ajaxForm($('.notify_box .notify_content'));
    }, 'json');

    //console.log(this);
    return false;
  });

  $('body').on('click', '.modals_popup', function (e) {
    //при клике всплывашка с текстом
    var that = this;
    e.preventDefault();
    var title = $(that).data('original-h');
    if(!title)title="";
    var html = $('#' + $(that).data('original-html')).html();
    var content = html ? html : $(that).data('original-title');
    var notyClass = $(that).data('notyclass');
    var data = {
      buttonYes: false,
      notyfy_class: "notify_white " + notyClass,
      question: content,
      title: title
    };
    notification.alert(data);

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

if (!String.prototype.trim) {
  (function() {
    // Вырезаем BOM и неразрывный пробел
    String.prototype.trim = function() {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
  })();
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
/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @version 1.2.1
 *
 * http://wenzhixin.net.cn/p/multiple-select/
 */

(function ($) {

    'use strict';

    // it only does '%s', and return '' when arguments are undefined
    var sprintf = function (str) {
        var args = arguments,
            flag = true,
            i = 1;

        str = str.replace(/%s/g, function () {
            var arg = args[i++];

            if (typeof arg === 'undefined') {
                flag = false;
                return '';
            }
            return arg;
        });
        return flag ? str : '';
    };

    var removeDiacritics = function (str) {
        var defaultDiacriticsRemovalMap = [
            {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
            {'base':'AA','letters':/[\uA732]/g},
            {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
            {'base':'AO','letters':/[\uA734]/g},
            {'base':'AU','letters':/[\uA736]/g},
            {'base':'AV','letters':/[\uA738\uA73A]/g},
            {'base':'AY','letters':/[\uA73C]/g},
            {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
            {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
            {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
            {'base':'DZ','letters':/[\u01F1\u01C4]/g},
            {'base':'Dz','letters':/[\u01F2\u01C5]/g},
            {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
            {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
            {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
            {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
            {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
            {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
            {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
            {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
            {'base':'LJ','letters':/[\u01C7]/g},
            {'base':'Lj','letters':/[\u01C8]/g},
            {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
            {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
            {'base':'NJ','letters':/[\u01CA]/g},
            {'base':'Nj','letters':/[\u01CB]/g},
            {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
            {'base':'OI','letters':/[\u01A2]/g},
            {'base':'OO','letters':/[\uA74E]/g},
            {'base':'OU','letters':/[\u0222]/g},
            {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
            {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
            {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
            {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
            {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
            {'base':'TZ','letters':/[\uA728]/g},
            {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
            {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
            {'base':'VY','letters':/[\uA760]/g},
            {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
            {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
            {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
            {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
            {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
            {'base':'aa','letters':/[\uA733]/g},
            {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
            {'base':'ao','letters':/[\uA735]/g},
            {'base':'au','letters':/[\uA737]/g},
            {'base':'av','letters':/[\uA739\uA73B]/g},
            {'base':'ay','letters':/[\uA73D]/g},
            {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
            {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
            {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
            {'base':'dz','letters':/[\u01F3\u01C6]/g},
            {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
            {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
            {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
            {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
            {'base':'hv','letters':/[\u0195]/g},
            {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
            {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
            {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
            {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
            {'base':'lj','letters':/[\u01C9]/g},
            {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
            {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
            {'base':'nj','letters':/[\u01CC]/g},
            {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
            {'base':'oi','letters':/[\u01A3]/g},
            {'base':'ou','letters':/[\u0223]/g},
            {'base':'oo','letters':/[\uA74F]/g},
            {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
            {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
            {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
            {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
            {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
            {'base':'tz','letters':/[\uA729]/g},
            {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
            {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
            {'base':'vy','letters':/[\uA761]/g},
            {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
            {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
            {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
            {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
        ];

        for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
            str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
        }

        return str;

   };

    function MultipleSelect($el, options) {
        var that = this,
            name = $el.attr('name') || options.name || '';

        this.options = options;

        // hide select element
        this.$el = $el.hide();

        // label element
        this.$label = this.$el.closest('label');
        if (this.$label.length === 0 && this.$el.attr('id')) {
            this.$label = $(sprintf('label[for="%s"]', this.$el.attr('id').replace(/:/g, '\\:')));
        }

        // restore class and title from select element
        this.$parent = $(sprintf(
            '<div class="ms-parent %s" %s/>',
            $el.attr('class') || '',
            sprintf('title="%s"', $el.attr('title'))));

        // add placeholder to choice button
        this.$choice = $(sprintf([
                '<button type="button" class="ms-choice">',
                '<span class="placeholder">%s</span>',
                '<div></div>',
                '</button>'
            ].join(''),
            this.options.placeholder));

        // default position is bottom
        this.$drop = $(sprintf('<div class="ms-drop %s"%s></div>',
            this.options.position,
            sprintf(' style="width: %s"', this.options.dropWidth)));

        this.$el.after(this.$parent);
        this.$parent.append(this.$choice);
        this.$parent.append(this.$drop);

        if (this.$el.prop('disabled')) {
            this.$choice.addClass('disabled');
        }
        this.$parent.css('width',
            this.options.width ||
            this.$el.css('width') ||
            this.$el.outerWidth() + 20);

        this.selectAllName = 'data-name="selectAll' + name + '"';
        this.selectGroupName = 'data-name="selectGroup' + name + '"';
        this.selectItemName = 'data-name="selectItem' + name + '"';

        if (!this.options.keepOpen) {
            $(document).click(function (e) {
                if ($(e.target)[0] === that.$choice[0] ||
                    $(e.target).parents('.ms-choice')[0] === that.$choice[0]) {
                    return;
                }
                if (($(e.target)[0] === that.$drop[0] ||
                    $(e.target).parents('.ms-drop')[0] !== that.$drop[0] && e.target !== $el[0]) &&
                    that.options.isOpen) {
                    that.close();
                }
            });
        }
    }

    MultipleSelect.prototype = {
        constructor: MultipleSelect,

        init: function () {
            var that = this,
                $ul = $('<ul></ul>');

            this.$drop.html('');

            if (this.options.filter) {
                this.$drop.append([
                    '<div class="ms-search">',
                    '<input type="text" autocomplete="off" autocorrect="off" autocapitilize="off" spellcheck="false">',
                    '</div>'].join('')
                );
            }

            if (this.options.selectAll && !this.options.single) {
                $ul.append([
                    '<li class="ms-select-all">',
                    '<label>',
                    sprintf('<input type="checkbox" %s /> ', this.selectAllName),
                    this.options.selectAllDelimiter[0],
                    this.options.selectAllText,
                    this.options.selectAllDelimiter[1],
                    '</label>',
                    '</li>'
                ].join(''));
            }

            $.each(this.$el.children(), function (i, elm) {
                $ul.append(that.optionToHtml(i, elm));
            });
            $ul.append(sprintf('<li class="ms-no-results">%s</li>', this.options.noMatchesFound));
            this.$drop.append($ul);

            this.$drop.find('ul').css('max-height', this.options.maxHeight + 'px');
            this.$drop.find('.multiple').css('width', this.options.multipleWidth + 'px');

            this.$searchInput = this.$drop.find('.ms-search input');
            this.$selectAll = this.$drop.find('input[' + this.selectAllName + ']');
            this.$selectGroups = this.$drop.find('input[' + this.selectGroupName + ']');
            this.$selectItems = this.$drop.find('input[' + this.selectItemName + ']:enabled');
            this.$disableItems = this.$drop.find('input[' + this.selectItemName + ']:disabled');
            this.$noResults = this.$drop.find('.ms-no-results');

            this.events();
            this.updateSelectAll(true);
            this.update(true);

            if (this.options.isOpen) {
                this.open();
            }
        },

        optionToHtml: function (i, elm, group, groupDisabled) {
            var that = this,
                $elm = $(elm),
                classes = $elm.attr('class') || '',
                title = sprintf('title="%s"', $elm.attr('title')),
                multiple = this.options.multiple ? 'multiple' : '',
                disabled,
                type = this.options.single ? 'radio' : 'checkbox';

            if ($elm.is('option')) {
                var value = $elm.val(),
                    text = that.options.textTemplate($elm),
                    selected = $elm.prop('selected'),
                    style = sprintf('style="%s"', this.options.styler(value)),
                    $el;

                disabled = groupDisabled || $elm.prop('disabled');

                $el = $([
                    sprintf('<li class="%s %s" %s %s>', multiple, classes, title, style),
                    sprintf('<label class="%s">', disabled ? 'disabled' : ''),
                    sprintf('<input type="%s" %s%s%s%s>',
                        type, this.selectItemName,
                        selected ? ' checked="checked"' : '',
                        disabled ? ' disabled="disabled"' : '',
                        sprintf(' data-group="%s"', group)),
                    sprintf('<span>%s</span>', text),
                    '</label>',
                    '</li>'
                ].join(''));
                $el.find('input').val(value);
                return $el;
            }
            if ($elm.is('optgroup')) {
                var label = that.options.labelTemplate($elm),
                    $group = $('<div/>');

                group = 'group_' + i;
                disabled = $elm.prop('disabled');

                $group.append([
                    '<li class="group">',
                    sprintf('<label class="optgroup %s" data-group="%s">', disabled ? 'disabled' : '', group),
                    this.options.hideOptgroupCheckboxes || this.options.single ? '' :
                        sprintf('<input type="checkbox" %s %s>',
                        this.selectGroupName, disabled ? 'disabled="disabled"' : ''),
                    label,
                    '</label>',
                    '</li>'
                ].join(''));

                $.each($elm.children(), function (i, elm) {
                    $group.append(that.optionToHtml(i, elm, group, disabled));
                });
                return $group.html();
            }
        },

        events: function () {
            var that = this,
                toggleOpen = function (e) {
                    e.preventDefault();
                    that[that.options.isOpen ? 'close' : 'open']();
                };

            if (this.$label) {
                this.$label.off('click').on('click', function (e) {
                    if (e.target.nodeName.toLowerCase() !== 'label' || e.target !== this) {
                        return;
                    }
                    toggleOpen(e);
                    if (!that.options.filter || !that.options.isOpen) {
                        that.focus();
                    }
                    e.stopPropagation(); // Causes lost focus otherwise
                });
            }

            this.$choice.off('click').on('click', toggleOpen)
                .off('focus').on('focus', this.options.onFocus)
                .off('blur').on('blur', this.options.onBlur);

            this.$parent.off('keydown').on('keydown', function (e) {
                switch (e.which) {
                    case 27: // esc key
                        that.close();
                        that.$choice.focus();
                        break;
                }
            });

            this.$searchInput.off('keydown').on('keydown',function (e) {
                // Ensure shift-tab causes lost focus from filter as with clicking away
                if (e.keyCode === 9 && e.shiftKey) {
                    that.close();
                }
            }).off('keyup').on('keyup', function (e) {
                // enter or space
                // Avoid selecting/deselecting if no choices made
                if (that.options.filterAcceptOnEnter && (e.which === 13 || e.which == 32) && that.$searchInput.val()) {
                    that.$selectAll.click();
                    that.close();
                    that.focus();
                    return;
                }
                that.filter();
            });

            this.$selectAll.off('click').on('click', function () {
                var checked = $(this).prop('checked'),
                    $items = that.$selectItems.filter(':visible');

                if ($items.length === that.$selectItems.length) {
                    that[checked ? 'checkAll' : 'uncheckAll']();
                } else { // when the filter option is true
                    that.$selectGroups.prop('checked', checked);
                    $items.prop('checked', checked);
                    that.options[checked ? 'onCheckAll' : 'onUncheckAll']();
                    that.update();
                }
            });
            this.$selectGroups.off('click').on('click', function () {
                var group = $(this).parent().attr('data-group'),
                    $items = that.$selectItems.filter(':visible'),
                    $children = $items.filter(sprintf('[data-group="%s"]', group)),
                    checked = $children.length !== $children.filter(':checked').length;

                $children.prop('checked', checked);
                that.updateSelectAll();
                that.update();
                that.options.onOptgroupClick({
                    label: $(this).parent().text(),
                    checked: checked,
                    children: $children.get(),
                    instance: that
                });
            });
            this.$selectItems.off('click').on('click', function () {
                that.updateSelectAll();
                that.update();
                that.updateOptGroupSelect();
                that.options.onClick({
                    label: $(this).parent().text(),
                    value: $(this).val(),
                    checked: $(this).prop('checked'),
                    instance: that
                });

                if (that.options.single && that.options.isOpen && !that.options.keepOpen) {
                    that.close();
                }

                if (that.options.single) {
                    var clickedVal = $(this).val();
                    that.$selectItems.filter(function() {
                        return $(this).val() !== clickedVal;
                    }).each(function() {
                        $(this).prop('checked', false);
                    });
                    that.update();
                }
            });
        },

        open: function () {
            if (this.$choice.hasClass('disabled')) {
                return;
            }
            this.options.isOpen = true;
            this.$choice.find('>div').addClass('open');
            this.$drop[this.animateMethod('show')]();

            // fix filter bug: no results show
            this.$selectAll.parent().show();
            this.$noResults.hide();

            // Fix #77: 'All selected' when no options
            if (!this.$el.children().length) {
                this.$selectAll.parent().hide();
                this.$noResults.show();
            }

            if (this.options.container) {
                var offset = this.$drop.offset();
                this.$drop.appendTo($(this.options.container));
                this.$drop.offset({
                    top: offset.top,
                    left: offset.left
                });
            }

            if (this.options.filter) {
                this.$searchInput.val('');
                this.$searchInput.focus();
                this.filter();
            }
            this.options.onOpen();
        },

        close: function () {
            this.options.isOpen = false;
            this.$choice.find('>div').removeClass('open');
            this.$drop[this.animateMethod('hide')]();
            if (this.options.container) {
                this.$parent.append(this.$drop);
                this.$drop.css({
                    'top': 'auto',
                    'left': 'auto'
                });
            }
            this.options.onClose();
        },

        animateMethod: function (method) {
            var methods = {
                show: {
                    fade: 'fadeIn',
                    slide: 'slideDown'
                },
                hide: {
                    fade: 'fadeOut',
                    slide: 'slideUp'
                }
            };

            return methods[method][this.options.animate] || method;
        },

        update: function (isInit) {
            var selects = this.options.displayValues ? this.getSelects() : this.getSelects('text'),
                $span = this.$choice.find('>span'),
                sl = selects.length;

            if (sl === 0) {
                $span.addClass('placeholder').html(this.options.placeholder);
            } else if (this.options.allSelected && sl === this.$selectItems.length + this.$disableItems.length) {
                $span.removeClass('placeholder').html(this.options.allSelected);
            } else if (this.options.ellipsis && sl > this.options.minimumCountSelected) {
                $span.removeClass('placeholder').text(selects.slice(0, this.options.minimumCountSelected)
                    .join(this.options.delimiter) + '...');
            } else if (this.options.countSelected && sl > this.options.minimumCountSelected) {
                $span.removeClass('placeholder').html(this.options.countSelected
                    .replace('#', selects.length)
                    .replace('%', this.$selectItems.length + this.$disableItems.length));
            } else {
                $span.removeClass('placeholder').text(selects.join(this.options.delimiter));
            }

            if (this.options.addTitle) {
                $span.prop('title', this.getSelects('text'));
            }

            // set selects to select
            this.$el.val(this.getSelects()).trigger('change');

            // add selected class to selected li
            this.$drop.find('li').removeClass('selected');
            this.$drop.find('input:checked').each(function () {
                $(this).parents('li').first().addClass('selected');
            });

            // trigger <select> change event
            if (!isInit) {
                this.$el.trigger('change');
            }
        },

        updateSelectAll: function (isInit) {
            var $items = this.$selectItems;

            if (!isInit) {
                $items = $items.filter(':visible');
            }
            this.$selectAll.prop('checked', $items.length &&
                $items.length === $items.filter(':checked').length);
            if (!isInit && this.$selectAll.prop('checked')) {
                this.options.onCheckAll();
            }
        },

        updateOptGroupSelect: function () {
            var $items = this.$selectItems.filter(':visible');
            $.each(this.$selectGroups, function (i, val) {
                var group = $(val).parent().attr('data-group'),
                    $children = $items.filter(sprintf('[data-group="%s"]', group));
                $(val).prop('checked', $children.length &&
                    $children.length === $children.filter(':checked').length);
            });
        },

        //value or text, default: 'value'
        getSelects: function (type) {
            var that = this,
                texts = [],
                values = [];
            this.$drop.find(sprintf('input[%s]:checked', this.selectItemName)).each(function () {
                texts.push($(this).parents('li').first().text());
                values.push($(this).val());
            });

            if (type === 'text' && this.$selectGroups.length) {
                texts = [];
                this.$selectGroups.each(function () {
                    var html = [],
                        text = $.trim($(this).parent().text()),
                        group = $(this).parent().data('group'),
                        $children = that.$drop.find(sprintf('[%s][data-group="%s"]', that.selectItemName, group)),
                        $selected = $children.filter(':checked');

                    if (!$selected.length) {
                        return;
                    }

                    html.push('[');
                    html.push(text);
                    if ($children.length > $selected.length) {
                        var list = [];
                        $selected.each(function () {
                            list.push($(this).parent().text());
                        });
                        html.push(': ' + list.join(', '));
                    }
                    html.push(']');
                    texts.push(html.join(''));
                });
            }
            return type === 'text' ? texts : values;
        },

        setSelects: function (values) {
            var that = this;
            this.$selectItems.prop('checked', false);
            this.$disableItems.prop('checked', false);
            $.each(values, function (i, value) {
                that.$selectItems.filter(sprintf('[value="%s"]', value)).prop('checked', true);
                that.$disableItems.filter(sprintf('[value="%s"]', value)).prop('checked', true);
            });
            this.$selectAll.prop('checked', this.$selectItems.length ===
                this.$selectItems.filter(':checked').length + this.$disableItems.filter(':checked').length);

            $.each(that.$selectGroups, function (i, val) {
                var group = $(val).parent().attr('data-group'),
                    $children = that.$selectItems.filter('[data-group="' + group + '"]');
                $(val).prop('checked', $children.length &&
                    $children.length === $children.filter(':checked').length);
            });

            this.update();
        },

        enable: function () {
            this.$choice.removeClass('disabled');
        },

        disable: function () {
            this.$choice.addClass('disabled');
        },

        checkAll: function () {
            this.$selectItems.prop('checked', true);
            this.$selectGroups.prop('checked', true);
            this.$selectAll.prop('checked', true);
            this.update();
            this.options.onCheckAll();
        },

        uncheckAll: function () {
            this.$selectItems.prop('checked', false);
            this.$selectGroups.prop('checked', false);
            this.$selectAll.prop('checked', false);
            this.update();
            this.options.onUncheckAll();
        },

        focus: function () {
            this.$choice.focus();
            this.options.onFocus();
        },

        blur: function () {
            this.$choice.blur();
            this.options.onBlur();
        },

        refresh: function () {
            this.init();
        },
		
        destroy: function () {
            this.$el.show();
            this.$parent.remove();
            this.$el.data('multipleSelect', null);
        },

        filter: function () {
            var that = this,
                text = $.trim(this.$searchInput.val()).toLowerCase();

            if (text.length === 0) {
                this.$selectAll.parent().show();
                this.$selectItems.parent().show();
                this.$disableItems.parent().show();
                this.$selectGroups.parent().show();
                this.$noResults.hide();
            } else {
                this.$selectItems.each(function () {
                    var $parent = $(this).parent();
                    $parent[removeDiacritics($parent.text().toLowerCase()).indexOf(removeDiacritics(text)) < 0 ? 'hide' : 'show']();
                });
                this.$disableItems.parent().hide();
                this.$selectGroups.each(function () {
                    var $parent = $(this).parent();
                    var group = $parent.attr('data-group'),
                        $items = that.$selectItems.filter(':visible');
                    $parent[$items.filter(sprintf('[data-group="%s"]', group)).length ? 'show' : 'hide']();
                });

                //Check if no matches found
                if (this.$selectItems.parent().filter(':visible').length) {
                    this.$selectAll.parent().show();
                    this.$noResults.hide();
                } else {
                    this.$selectAll.parent().hide();
                    this.$noResults.show();
                }
            }
            this.updateOptGroupSelect();
            this.updateSelectAll();
            this.options.onFilter(text);
        }
    };

    $.fn.multipleSelect = function () {
        var option = arguments[0],
            args = arguments,

            value,
            allowedMethods = [
                'getSelects', 'setSelects',
                'enable', 'disable',
                'open', 'close',
                'checkAll', 'uncheckAll',
                'focus', 'blur',
                'refresh', 'destroy'
            ];

        this.each(function () {
            var $this = $(this),
                data = $this.data('multipleSelect'),
                options = $.extend({}, $.fn.multipleSelect.defaults,
                    $this.data(), typeof option === 'object' && option);

            if (!data) {
                data = new MultipleSelect($this, options);
                $this.data('multipleSelect', data);
            }

            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0) {
                    throw 'Unknown method: ' + option;
                }
                value = data[option](args[1]);
            } else {
                data.init();
                if (args[1]) {
                    value = data[args[1]].apply(data, [].slice.call(args, 2));
                }
            }
        });

        return typeof value !== 'undefined' ? value : this;
    };

    $.fn.multipleSelect.defaults = {
        name: '',
        isOpen: false,
        placeholder: '',
        selectAll: true,
        selectAllDelimiter: ['[', ']'],
        minimumCountSelected: 3,
        ellipsis: false,
        multiple: false,
        multipleWidth: 80,
        single: false,
        filter: false,
        width: undefined,
        dropWidth: undefined,
        maxHeight: 250,
        container: null,
        position: 'bottom',
        keepOpen: false,
        animate: 'none', // 'none', 'fade', 'slide'
        displayValues: false,
        delimiter: ', ',
        addTitle: false,
        filterAcceptOnEnter: false,
        hideOptgroupCheckboxes: false,

        selectAllText: 'Select all',
        allSelected: 'All selected',
        countSelected: '# of % selected',
        noMatchesFound: 'No matches found',

        styler: function () {
            return false;
        },
        textTemplate: function ($elm) {
            return $elm.html();
        },
        labelTemplate: function ($elm) {
            return $elm.attr('label');
        },

        onOpen: function () {
            return false;
        },
        onClose: function () {
            return false;
        },
        onCheckAll: function () {
            return false;
        },
        onUncheckAll: function () {
            return false;
        },
        onFocus: function () {
            return false;
        },
        onBlur: function () {
            return false;
        },
        onOptgroupClick: function () {
            return false;
        },
        onClick: function () {
            return false;
        },
        onFilter: function () {
            return false;
        }
    };

  $('select[multiple]').multipleSelect();
})(jQuery);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxhbmd1YWdlLmpzIiwibGFuZy5qcyIsImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsInRvb2x0aXAuanMiLCJhY2NvdW50X25vdGlmaWNhdGlvbi5qcyIsInNsaWRlci5qcyIsImhlYWRlcl9tZW51X2FuZF9zZWFyY2guanMiLCJjYWxjLWNhc2hiYWNrLmpzIiwiYXV0b19oaWRlX2NvbnRyb2wuanMiLCJoaWRlX3Nob3dfYWxsLmpzIiwiY2xvY2suanMiLCJsaXN0X3R5cGVfc3dpdGNoZXIuanMiLCJzZWxlY3QuanMiLCJzZWFyY2guanMiLCJnb3RvLmpzIiwiYWNjb3VudC13aXRoZHJhdy5qcyIsImFqYXguanMiLCJkb2Jyby5qcyIsImxlZnQtbWVudS10b2dnbGUuanMiLCJzaGFyZTQyLmpzIiwidXNlcl9yZXZpZXdzLmpzIiwicGxhY2Vob2xkZXIuanMiLCJhamF4LWxvYWQuanMiLCJiYW5uZXIuanMiLCJjb3VudHJ5X3NlbGVjdC5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsIm1vZGFscy5qcyIsImZvb3Rlcl9tZW51LmpzIiwicmF0aW5nLmpzIiwiZmF2b3JpdGVzLmpzIiwic2Nyb2xsX3RvLmpzIiwiY29weV90b19jbGlwYm9hcmQuanMiLCJpbWcuanMiLCJwYXJlbnRzX29wZW5fd2luZG93cy5qcyIsImZvcm1zLmpzIiwiY29va2llLmpzIiwidGFibGUuanMiLCJhamF4X3JlbW92ZS5qcyIsImZpeGVzLmpzIiwibGlua3MuanMiLCJzdG9yZV9wb2ludHMuanMiLCJoYXNodGFncy5qcyIsInBsdWdpbnMuanMiLCJtdWx0aXBsZS1zZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JnQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDak5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGxnID0gKGZ1bmN0aW9uKCkge1xyXG4gIHZhciBsYW5nPXt9O1xyXG4gIHVybD0nL2xhbmd1YWdlLycrZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcrJy5qc29uJztcclxuICAkLmdldCh1cmwsZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgIC8vY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICBmb3IodmFyIGluZGV4IGluIGRhdGEpIHtcclxuICAgICAgZGF0YVtpbmRleF09Y2xlYXJWYXIoZGF0YVtpbmRleF0pO1xyXG4gICAgfVxyXG4gICAgbGFuZz1kYXRhO1xyXG4gICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KFwibGFuZ3VhZ2VfbG9hZGVkXCIpO1xyXG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEsIGV2ZW50KTtcclxuICB9LCdqc29uJyk7XHJcblxyXG4gIGZ1bmN0aW9uIGNsZWFyVmFyKHR4dCl7XHJcbiAgICB0eHQ9dHh0LnJlcGxhY2UoL1xccysvZyxcIiBcIik7Ly/Rg9C00LDQu9C10L3QuNC1INC30LDQtNCy0L7QtdC90LjQtSDQv9GA0L7QsdC10LvQvtCyXHJcblxyXG4gICAgLy/Qp9C40YHRgtC40Lwg0L/QvtC00YHRgtCw0LLQu9GP0LXQvNGL0LUg0L/QtdGA0LXQvNC10L3QvdGL0LVcclxuICAgIHN0cj10eHQubWF0Y2goL1xceyguKj8pXFx9L2cpO1xyXG4gICAgaWYgKCBzdHIgIT0gbnVsbCkge1xyXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBzdHJfdD1zdHJbaV0ucmVwbGFjZSgvIC9nLFwiXCIpO1xyXG4gICAgICAgIHR4dD10eHQucmVwbGFjZShzdHJbaV0sc3RyX3QpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHh0O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZ1bmN0aW9uKHRwbCwgZGF0YSl7XHJcbiAgICBpZih0eXBlb2YobGFuZ1t0cGxdKT09XCJ1bmRlZmluZWRcIil7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwibGFuZyBub3QgZm91bmQ6IFwiK3RwbCk7XHJcbiAgICAgIHJldHVybiB0cGw7XHJcbiAgICB9XHJcbiAgICB0cGw9bGFuZ1t0cGxdO1xyXG4gICAgaWYodHlwZW9mKGRhdGEpPT1cIm9iamVjdFwiKXtcclxuICAgICAgZm9yKHZhciBpbmRleCBpbiBkYXRhKSB7XHJcbiAgICAgICAgdHBsPXRwbC5zcGxpdChcIntcIitpbmRleCtcIn1cIikuam9pbihkYXRhW2luZGV4XSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0cGw7XHJcbiAgfVxyXG59KSgpOyIsInZhciBsYW5nID0gKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgY29kZSA9ICcnO1xyXG4gICAgdmFyIGtleSA9ICcnO1xyXG4gICAgdmFyIGhyZWZfcHJlZml4ID0gJyc7XHJcblxyXG4gICAgdmFyIGxhbmdsaXN0ID0gJChcIiNzZF9sYW5nX2xpc3RcIikuZGF0YSgnanNvbicpO1xyXG4gICAgdmFyIGxvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG5cclxuICAgIGlmIChsYW5nbGlzdCkge1xyXG4gICAgICAgIHZhciBsYW5nS2V5ID0gKGxvY2F0aW9uLmxlbmd0aCA9PT0gMyB8fCBsb2NhdGlvbi5zdWJzdHIoMywxKSA9PT0gJy8nKSA/IGxvY2F0aW9uLnN1YnN0cigxLDIpIDogJyc7XHJcbiAgICAgICAgaWYgKGxhbmdLZXkgJiYgbGFuZ2xpc3RbbGFuZ0tleV0pIHtcclxuICAgICAgICAgICAgY29kZSA9IGxhbmdsaXN0W2xhbmdLZXldO1xyXG4gICAgICAgICAgICBrZXkgPSBsYW5nS2V5O1xyXG4gICAgICAgICAgICBocmVmX3ByZWZpeCA9IGtleSA9PT0gJ3J1JyA/ICcnIDoga2V5KycvJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBrZXkgPSAncnUnO1xyXG4gICAgICAgICAgICBjb2RlID0gbGFuZ2xpc3Rba2V5XSA/IGxhbmdsaXN0W2tleV0gOiAnJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgaHJlZl9wcmVmaXg6IGhyZWZfcHJlZml4XHJcbiAgICB9XHJcbn0pKCk7XHJcbiIsIm9iamVjdHMgPSBmdW5jdGlvbiAoYSwgYikge1xyXG4gIHZhciBjID0gYixcclxuICAgIGtleTtcclxuICBmb3IgKGtleSBpbiBhKSB7XHJcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgIGNba2V5XSA9IGtleSBpbiBiID8gYltrZXldIDogYVtrZXldO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gYztcclxufTtcclxuXHJcbmZ1bmN0aW9uIGxvZ2luX3JlZGlyZWN0KG5ld19ocmVmKSB7XHJcbiAgaHJlZiA9IGxvY2F0aW9uLmhyZWY7XHJcbiAgaWYgKGhyZWYuaW5kZXhPZignc3RvcmUnKSA+IDAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKSA+IDAgfHwgaHJlZi5pbmRleE9mKCd1cmwoJykgPiAwKSB7XHJcbiAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgbG9jYXRpb24uaHJlZiA9IG5ld19ocmVmO1xyXG4gIH1cclxufVxyXG4iLCIoZnVuY3Rpb24gKHcsIGQsICQpIHtcclxuICB2YXIgc2xpZGVfaW50ZXJ2YWw9NDAwMDtcclxuICB2YXIgc2Nyb2xsc19ibG9jayA9ICQoJy5zY3JvbGxfYm94Jyk7XHJcblxyXG4gIGlmIChzY3JvbGxzX2Jsb2NrLmxlbmd0aCA9PSAwKSByZXR1cm47XHJcbiAgLy8kKCc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC13cmFwXCI+PC9kaXY+Jykud3JhcEFsbChzY3JvbGxzX2Jsb2NrKTtcclxuICAkKHNjcm9sbHNfYmxvY2spLndyYXAoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKTtcclxuXHJcbiAgaW5pdF9zY3JvbGwoKTtcclxuICBjYWxjX3Njcm9sbCgpO1xyXG5cclxuICAkKHdpbmRvdyApLm9uKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcclxuICAgIGNhbGNfc2Nyb2xsKCk7XHJcbiAgfSk7XHJcbiAgdmFyIHQxLCB0MjtcclxuXHJcbiAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbiAoKSB7XHJcbiAgICBjbGVhclRpbWVvdXQodDEpO1xyXG4gICAgY2xlYXJUaW1lb3V0KHQyKTtcclxuICAgIHQxID0gc2V0VGltZW91dChjYWxjX3Njcm9sbCwgMzAwKTtcclxuICAgIHQyID0gc2V0VGltZW91dChjYWxjX3Njcm9sbCwgODAwKTtcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gaW5pdF9zY3JvbGwoKSB7XHJcbiAgICB2YXIgY29udHJvbCA9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sXCI+PC9kaXY+JztcclxuICAgIGNvbnRyb2wgPSAkKGNvbnRyb2wpO1xyXG4gICAgY29udHJvbC5pbnNlcnRBZnRlcihzY3JvbGxzX2Jsb2NrKTtcclxuICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7XHJcblxyXG4gICAgc2Nyb2xsc19ibG9jay5wcmVwZW5kKCc8ZGl2IGNsYXNzPXNjcm9sbF9ib3gtbW92ZXI+PC9kaXY+Jyk7XHJcblxyXG4gICAgY29udHJvbC5vbignY2xpY2snLCAnLnNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgdmFyIGNvbnRyb2wgPSAkdGhpcy5wYXJlbnQoKTtcclxuICAgICAgdmFyIGkgPSAkdGhpcy5pbmRleCgpO1xyXG4gICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2FjdGl2ZScpKXJldHVybjtcclxuICAgICAgY29udHJvbC5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAkdGhpcy5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICB2YXIgZHggPSBjb250cm9sLmRhdGEoJ3NsaWRlLWR4Jyk7XHJcbiAgICAgIHZhciBlbCA9IGNvbnRyb2wucHJldigpO1xyXG4gICAgICBlbC5maW5kKCcuc2Nyb2xsX2JveC1tb3ZlcicpLmNzcygnbWFyZ2luLWxlZnQnLCAtZHggKiBpKTtcclxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBpKTtcclxuXHJcbiAgICAgIHN0b3BTY3JvbC5iaW5kKGVsKSgpO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGZvciAodmFyIGogPSAwOyBqIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGorKykge1xyXG4gICAgdmFyIGVsID0gc2Nyb2xsc19ibG9jay5lcShqKTtcclxuICAgIGVsLnBhcmVudCgpLmhvdmVyKHN0b3BTY3JvbC5iaW5kKGVsKSwgc3RhcnRTY3JvbC5iaW5kKGVsKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzdGFydFNjcm9sKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgIGlmICghJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XHJcblxyXG4gICAgdmFyIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZS5iaW5kKCR0aGlzKSwgc2xpZGVfaW50ZXJ2YWwpO1xyXG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJywgdGltZW91dElkKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3RvcFNjcm9sKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgIHZhciB0aW1lb3V0SWQgPSAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKTtcclxuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIGZhbHNlKTtcclxuICAgIGlmICghJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSB8fCAhdGltZW91dElkKXJldHVybjtcclxuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLCBmYWxzZSk7XHJcbiAgICBpZiAoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xyXG5cclxuICAgIHZhciBjb250cm9scyA9ICR0aGlzLm5leHQoKS5maW5kKCc+KicpO1xyXG4gICAgdmFyIGFjdGl2ZSA9ICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xyXG4gICAgdmFyIHBvaW50X2NudCA9IGNvbnRyb2xzLmxlbmd0aDtcclxuICAgIGlmICghYWN0aXZlKWFjdGl2ZSA9IDA7XHJcbiAgICBhY3RpdmUrKztcclxuICAgIGlmIChhY3RpdmUgPj0gcG9pbnRfY250KWFjdGl2ZSA9IDA7XHJcbiAgICAkdGhpcy5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xyXG5cclxuICAgIGNvbnRyb2xzLmVxKGFjdGl2ZSkuY2xpY2soKTtcclxuICAgIHN0YXJ0U2Nyb2wuYmluZCgkdGhpcykoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNhbGNfc2Nyb2xsKCkge1xyXG4gICAgZm9yIChpID0gMDsgaSA8IHNjcm9sbHNfYmxvY2subGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gc2Nyb2xsc19ibG9jay5lcShpKTtcclxuICAgICAgdmFyIGNvbnRyb2wgPSBlbC5uZXh0KCk7XHJcbiAgICAgIHZhciB3aWR0aF9tYXggPSBlbC5kYXRhKCdzY3JvbGwtd2lkdGgtbWF4Jyk7XHJcbiAgICAgIHcgPSBlbC53aWR0aCgpO1xyXG5cclxuICAgICAgLy/QtNC10LvQsNC10Lwg0LrQvtC90YLRgNC+0LvRjCDQvtCz0YDQsNC90LjRh9C10L3QuNGPINGI0LjRgNC40L3Riy4g0JXRgdC70Lgg0L/RgNC10LLRi9GI0LXQvdC+INGC0L4g0L7RgtC60LvRjtGH0LDQtdC8INGB0LrRgNC+0Lsg0Lgg0L/QtdGA0LXRhdC+0LTQuNC8INC6INGB0LvQtdC00YPRjtGJ0LXQvNGDINGN0LvQtdC80LXQvdGC0YNcclxuICAgICAgaWYgKHdpZHRoX21heCAmJiB3ID4gd2lkdGhfbWF4KSB7XHJcbiAgICAgICAgY29udHJvbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBub19jbGFzcyA9IGVsLmRhdGEoJ3Njcm9sbC1lbGVtZXQtaWdub3JlLWNsYXNzJyk7XHJcbiAgICAgIHZhciBjaGlsZHJlbiA9IGVsLmZpbmQoJz4qJykubm90KCcuc2Nyb2xsX2JveC1tb3ZlcicpO1xyXG4gICAgICBpZiAobm9fY2xhc3MpIHtcclxuICAgICAgICBjaGlsZHJlbiA9IGNoaWxkcmVuLm5vdCgnLicgKyBub19jbGFzcylcclxuICAgICAgfVxyXG5cclxuICAgICAgLy/QldGB0LvQuCDQvdC10YIg0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXHJcbiAgICAgIGlmIChjaGlsZHJlbiA9PSAwKSB7XHJcbiAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcclxuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZl9lbCA9IGNoaWxkcmVuLmVxKDEpO1xyXG4gICAgICB2YXIgY2hpbGRyZW5fdyA9IGZfZWwub3V0ZXJXaWR0aCgpOyAvL9Cy0YHQtdCz0L4g0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXHJcbiAgICAgIGNoaWxkcmVuX3cgKz0gcGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLWxlZnQnKSk7XHJcbiAgICAgIGNoaWxkcmVuX3cgKz0gcGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLXJpZ2h0JykpO1xyXG5cclxuICAgICAgdmFyIHNjcmVhbl9jb3VudCA9IE1hdGguZmxvb3IodyAvIGNoaWxkcmVuX3cpO1xyXG5cclxuICAgICAgLy/QldGB0LvQuCDQstGB0LUg0LLQu9Cw0LfQuNGCINC90LAg0Y3QutGA0LDQvVxyXG4gICAgICBpZiAoY2hpbGRyZW4gPD0gc2NyZWFuX2NvdW50KSB7XHJcbiAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcclxuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL9Cj0LbQtSDRgtC+0YfQvdC+INC30L3QsNC10Lwg0YfRgtC+INGB0LrRgNC+0Lsg0L3Rg9C20LXQvVxyXG4gICAgICBlbC5hZGRDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG5cclxuICAgICAgdmFyIHBvaW50X2NudCA9IGNoaWxkcmVuLmxlbmd0aCAtIHNjcmVhbl9jb3VudCArIDE7XHJcbiAgICAgIC8v0LXRgdC70Lgg0L3QtSDQvdCw0LTQviDQvtCx0L3QvtCy0LvRj9GC0Ywg0LrQvtC90YLRgNC+0Lsg0YLQviDQstGL0YXQvtC00LjQvCwg0L3QtSDQt9Cw0LHRi9Cy0LDRjyDQvtCx0L3QvtCy0LjRgtGMINGI0LjRgNC40L3RgyDQtNC+0YfQtdGA0L3QuNGFXHJcbiAgICAgIGlmIChjb250cm9sLmZpbmQoJz4qJykubGVuZ3RoID09IHBvaW50X2NudCkge1xyXG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgYWN0aXZlID0gZWwuZGF0YSgnc2xpZGUtYWN0aXZlJyk7XHJcbiAgICAgIGlmICghYWN0aXZlKWFjdGl2ZSA9IDA7XHJcbiAgICAgIGlmIChhY3RpdmUgPj0gcG9pbnRfY250KWFjdGl2ZSA9IHBvaW50X2NudCAtIDE7XHJcbiAgICAgIHZhciBvdXQgPSAnJztcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwb2ludF9jbnQ7IGorKykge1xyXG4gICAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcgKyAoaiA9PSBhY3RpdmUgPyAnIGFjdGl2ZScgOiAnJykgKyAnXCI+PC9kaXY+JztcclxuICAgICAgfVxyXG4gICAgICBjb250cm9sLmh0bWwob3V0KTtcclxuXHJcbiAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgYWN0aXZlKTtcclxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1jb3VudCcsIHBvaW50X2NudCk7XHJcbiAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcclxuXHJcbiAgICAgIGlmICghZWwuZGF0YSgnc2xpZGUtdGltZW91dElkJykpIHtcclxuICAgICAgICBzdGFydFNjcm9sLmJpbmQoZWwpKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0od2luZG93LCBkb2N1bWVudCwgalF1ZXJ5KSk7XHJcbiIsInZhciBhY2NvcmRpb25Db250cm9sID0gJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKTtcclxuXHJcbmFjY29yZGlvbkNvbnRyb2wub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICRhY2NvcmRpb24gPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uJyk7XHJcblxyXG5cclxuICBpZiAoJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLXRpdGxlJykuaGFzQ2xhc3MoJ2FjY29yZGlvbi10aXRsZS1kaXNhYmxlZCcpKXJldHVybjtcclxuXHJcbiAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgLyppZigkYWNjb3JkaW9uLmhhc0NsYXNzKCdhY2NvcmRpb24tb25seV9vbmUnKSl7XHJcbiAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgIH0qL1xyXG4gICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zbGlkZVVwKDMwMCk7XHJcbiAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKSB7XHJcbiAgICAgICRvdGhlciA9ICQoJy5hY2NvcmRpb24tb25seV9vbmUnKTtcclxuICAgICAgJG90aGVyLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXHJcbiAgICAgICAgLnNsaWRlVXAoMzAwKVxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XHJcbiAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAkb3RoZXIucmVtb3ZlQ2xhc3MoJ2xhc3Qtb3BlbicpO1xyXG5cclxuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XHJcbiAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpO1xyXG4gICAgfVxyXG4gICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zbGlkZURvd24oMzAwKTtcclxuICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKTtcclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59KTtcclxuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XHJcblxyXG5cclxuJCgnLmFjY29yZGlvbi13cmFwLm9wZW5fZmlyc3QgLmFjY29yZGlvbjpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XHJcbiQoJy5hY2NvcmRpb24td3JhcCAuYWNjb3JkaW9uLmFjY29yZGlvbi1zbGltOmZpcnN0LWNoaWxkJykuYWRkQ2xhc3MoJ29wZW4nKTtcclxuJCgnLmFjY29yZGlvbi1zbGltJykuYWRkQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpO1xyXG5cclxuLy/QtNC70Y8g0YHQuNC80L7QsiDQvtGC0LrRgNGL0LLQsNC10Lwg0LXRgdC70Lgg0LXRgdGC0Ywg0L/QvtC80LXRgtC60LAgb3BlbiDRgtC+INC/0YDQuNGB0LLQsNC40LLQsNC10Lwg0LLRgdC1INC+0YHRgtCw0LvRjNC90YvQtSDQutC70LDRgdGLXHJcbmFjY29yZGlvblNsaW0gPSAkKCcuYWNjb3JkaW9uLmFjY29yZGlvbi1vbmx5X29uZScpO1xyXG5pZiAoYWNjb3JkaW9uU2xpbS5sZW5ndGggPiAwKSB7XHJcbiAgYWNjb3JkaW9uU2xpbS5wYXJlbnQoKS5maW5kKCcuYWNjb3JkaW9uLm9wZW4nKVxyXG4gICAgLmFkZENsYXNzKCdsYXN0LW9wZW4nKVxyXG4gICAgLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXHJcbiAgICAuc2hvdygzMDApXHJcbiAgICAuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xyXG59XHJcblxyXG4kKCdib2R5Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICQoJy5hY2NvcmRpb25fZnVsbHNjcmVhbl9jbG9zZS5vcGVuIC5hY2NvcmRpb24tY29udHJvbDpmaXJzdC1jaGlsZCcpLmNsaWNrKClcclxufSk7XHJcblxyXG4kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGlmIChlLnRhcmdldC50YWdOYW1lICE9ICdBJykge1xyXG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuYWNjb3JkaW9uJykuZmluZCgnLmFjY29yZGlvbi1jb250cm9sLmFjY29yZGlvbi10aXRsZScpLmNsaWNrKCk7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59KTtcclxuXHJcbiQoJy5hY2NvcmRpb24tY29udGVudCBhJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgaWYgKCR0aGlzLmhhc0NsYXNzKCdhbmdsZS11cCcpKXJldHVybjtcclxuICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbn0pO1xyXG5cclxuKGZ1bmN0aW9uKCl7XHJcbiAgdmFyIGVscyA9ICQoJy5hY2NvcmRpb25fbW9yZScpO1xyXG5cclxuICBmdW5jdGlvbiBhZGRCdXR0b24oZWwsIGNsYXNzTmFtZSwgdGl0bGUpIHtcclxuICAgICAgdmFyIGJ1dHRvbnMgPSAkKGVsKS5maW5kKCcuJytjbGFzc05hbWUpO1xyXG4gICAgICBpZiAoYnV0dG9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIHZhciBidXR0b24gPSAkKCc8ZGl2PicpLmFkZENsYXNzKGNsYXNzTmFtZSkuYWRkQ2xhc3MoJ2FjY29yZGlvbl9tb3JlX2J1dHRvbicpO1xyXG4gICAgICAgICAgdmFyIGEgPSAkKCc8YT4nKS5hdHRyKCdocmVmJywgXCJcIikuYWRkQ2xhc3MoJ2JsdWUnKS5odG1sKHRpdGxlKTtcclxuICAgICAgICAgICQoYnV0dG9uKS5hcHBlbmQoYSk7XHJcbiAgICAgICAgICAkKGVsKS5hcHBlbmQoYnV0dG9uKTtcclxuICAgICAgfVxyXG4gIH1cclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5hY2NvcmRpb25fbW9yZV9idXR0b25fbW9yZScsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQodGhpcykuY2xvc2VzdCgnLmFjY29yZGlvbl9tb3JlJykuYWRkQ2xhc3MoJ29wZW4nKTtcclxuICB9KTtcclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5hY2NvcmRpb25fbW9yZV9idXR0b25fbGVzcycsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQodGhpcykuY2xvc2VzdCgnLmFjY29yZGlvbl9tb3JlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICB9KTtcclxuXHJcblxyXG5cclxuICBmdW5jdGlvbiByZWJ1aWxkKCl7XHJcbiAgICAkKGVscykuZWFjaChmdW5jdGlvbihrZXksIGl0ZW0pe1xyXG4gICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgIHZhciBjb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuYWNjb3JkaW9uX21vcmVfY29udGVudCcpO1xyXG4gICAgICBpZiAoY29udGVudC5zY3JvbGxIZWlnaHQgPiBjb250ZW50LmNsaWVudEhlaWdodCkge1xyXG4gICAgICAgIGFkZEJ1dHRvbihpdGVtLCAnYWNjb3JkaW9uX21vcmVfYnV0dG9uX21vcmUnLCAn0J/QvtC00YDQvtCx0L3QtdC1Jyk7XHJcbiAgICAgICAgYWRkQnV0dG9uKGl0ZW0sICdhY2NvcmRpb25fbW9yZV9idXR0b25fbGVzcycsICfQodC60YDRi9GC0YwnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKGl0ZW0pLmZpbmQoJy5hY2NvcmRpb25fbW9yZV9idXR0b24nKS5yZW1vdmUoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gIH1cclxuXHJcbiAgJCh3aW5kb3cpLnJlc2l6ZShyZWJ1aWxkKTtcclxuXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbGFuZ3VhZ2VfbG9hZGVkJywgZnVuY3Rpb24oKXtcclxuICAgIHJlYnVpbGQoKTtcclxuICB9LCBmYWxzZSk7XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbiIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xyXG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xyXG4gIHZhciBkZWZhdWx0cyA9IHtcclxuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcidcclxuICB9O1xyXG4gIHZhciBsYXN0X3Bvc3QgPSBmYWxzZTtcclxuXHJcbiAgZnVuY3Rpb24gb25Qb3N0KHBvc3QpIHtcclxuICAgIGxhc3RfcG9zdCA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgLy9jb25zb2xlLmxvZyhwb3N0LCB0aGlzKTtcclxuICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xyXG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XHJcbiAgICB2YXIgd3JhcF9odG1sID0gZGF0YS53cmFwX2h0bWw7XHJcblxyXG4gICAgaWYgKHBvc3QucmVuZGVyKSB7XHJcbiAgICAgIHBvc3Qubm90eWZ5X2NsYXNzID0gXCJub3RpZnlfd2hpdGVcIjtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHBvc3QpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICBmb3JtLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgIGlmIChwb3N0Lmh0bWwpIHtcclxuICAgICAgICB3cmFwLmh0bWwocG9zdC5odG1sKTtcclxuICAgICAgICBhamF4Rm9ybSh3cmFwKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoIXBvc3QuZXJyb3IpIHtcclxuICAgICAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgICAgIHdyYXAuaHRtbCh3cmFwX2h0bWwpO1xyXG4gICAgICAgICAgZm9ybS5maW5kKCdpbnB1dFt0eXBlPXRleHRdLHRleHRhcmVhJykudmFsKCcnKTtcclxuICAgICAgICAgIGFqYXhGb3JtKHdyYXApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgcG9zdC5lcnJvciA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICBmb3IgKHZhciBpbmRleCBpbiBwb3N0LmVycm9yKSB7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgICAndHlwZSc6ICdlcnInLFxyXG4gICAgICAgICAgJ3RpdGxlJzogcG9zdC50aXRsZSA/IHBvc3QudGl0bGUgOiBsZygnZXJyb3InKSxcclxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpbmRleF1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zdC5lcnJvci5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcclxuICAgICAgICAgICd0aXRsZSc6IHBvc3QudGl0bGUgPyBwb3N0LnRpdGxlIDogbGcoJ2Vycm9yJyksXHJcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QuZXJyb3JbaV1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHBvc3QuZXJyb3IgfHwgcG9zdC5tZXNzYWdlKSB7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgICAndHlwZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ3N1Y2Nlc3MnIDogJ2VycicsXHJcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IChwb3N0LmVycm9yID09PSBmYWxzZSA/IGxnKCdzdWNjZXNzJykgOiBsZygnZXJyb3InKSksXHJcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3JcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy9cclxuICAgIC8vIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgLy8gICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcclxuICAgIC8vICAgICAndGl0bGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICfQo9GB0L/QtdGI0L3QvicgOiAn0J7RiNC40LHQutCwJyxcclxuICAgIC8vICAgICAnbWVzc2FnZSc6IEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikgPyBwb3N0LmVycm9yWzBdIDogKHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3IpXHJcbiAgICAvLyB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uRmFpbCgpIHtcclxuICAgIGxhc3RfcG9zdCA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcclxuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIHdyYXAuaHRtbChcclxuICAgICAgICAnPGgzPicrbGcoJ3NvcnJ5X25vdF9leHBlY3RlZF9lcnJvcicpKyc8aDM+JyArXHJcbiAgICAgICAgbGcoJ2l0X2hhcHBlbnNfc29tZXRpbWVzJylcclxuICAgICk7XHJcbiAgICBhamF4Rm9ybSh3cmFwKTtcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvblN1Ym1pdChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAvL2Uuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAvL2Uuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgdmFyIGN1cnJlbnRUaW1lTWlsbGlzID0gK25ldyBEYXRlKCk7XHJcbiAgICBpZiAoY3VycmVudFRpbWVNaWxsaXMgLSBsYXN0X3Bvc3QgPCAxMDAwICogMikge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgbGFzdF9wb3N0ID0gY3VycmVudFRpbWVNaWxsaXM7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xyXG4gICAgZGF0YS53cmFwX2h0bWw9d3JhcC5odG1sKCk7XHJcbiAgICB2YXIgaXNWYWxpZCA9IHRydWU7XHJcblxyXG4gICAgLy9pbml0KHdyYXApO1xyXG5cclxuICAgIHZhciByZXF1aXJlZCA9IGZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQsIHRleHRhcmVhLnJlcXVpcmVkLCBpbnB1dFtpZD1cInN1cHBvcnQtcmVjYXB0Y2hhXCJdJyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlcXVpcmVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBoZWxwQmxvY2sgPSByZXF1aXJlZC5lcShpKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmZpbmQoJy5oZWxwLWJsb2NrJyk7XHJcbiAgICAgIHZhciBoZWxwTWVzc2FnZSA9IGhlbHBCbG9jayAmJiBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpID8gaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA6IGxnKCdyZXF1aXJlZCcpO1xyXG5cclxuICAgICAgaWYgKHJlcXVpcmVkLmVxKGkpLnZhbCgpLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICBoZWxwQmxvY2suaHRtbChoZWxwTWVzc2FnZSk7XHJcbiAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGhlbHBCbG9jay5odG1sKCcnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZm9ybS55aWlBY3RpdmVGb3JtKSB7XHJcbiAgICAgIGZvcm0ub2ZmKCdhZnRlclZhbGlkYXRlJylcclxuICAgICAgZm9ybS5vbignYWZ0ZXJWYWxpZGF0ZScsIHlpaVZhbGlkYXRpb24uYmluZChkYXRhKSk7XHJcblxyXG4gICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJywgdHJ1ZSk7XHJcbiAgICAgIHZhciBkID0gZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJyk7XHJcbiAgICAgIGlmIChkKSB7XHJcbiAgICAgICAgZC52YWxpZGF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScsIGQpO1xyXG4gICAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcclxuICAgICAgICBpc1ZhbGlkID0gZC52YWxpZGF0ZWQ7XHJcbiAgICAgIH1cclxuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgaXNWYWxpZCA9IGlzVmFsaWQgJiYgKGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGggPT0gMCk7XHJcblxyXG4gICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICBzZW5kRm9ybShkYXRhKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHlpaVZhbGlkYXRpb24oZSkge1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcblxyXG4gICAgaWYoZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aCA9PSAwKXtcclxuICAgICAgc2VuZEZvcm0odGhpcyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNlbmRGb3JtKGRhdGEpe1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcblxyXG4gICAgaWYgKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcclxuXHJcbiAgICB2YXIgcG9zdERhdGEgPSBmb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xyXG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xyXG4gICAgZm9ybS5odG1sKCcnKTtcclxuICAgIGRhdGEud3JhcC5odG1sKCc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHA+JytsZygnc2VuZGluZ19kYXRhJykrJzwvcD48L2Rpdj4nKTtcclxuXHJcbiAgICBkYXRhLnVybCArPSAoZGF0YS51cmwuaW5kZXhPZignPycpID4gMCA/ICcmJyA6ICc/JykgKyAncmM9JyArIE1hdGgucmFuZG9tKCk7XHJcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEudXJsKTtcclxuXHJcbiAgICAvKmlmKCFwb3N0RGF0YS5yZXR1cm5Vcmwpe1xyXG4gICAgICBwb3N0RGF0YS5yZXR1cm5Vcmw9bG9jYXRpb24uaHJlZjtcclxuICAgIH0qL1xyXG5cclxuICAgIGlmKHR5cGVvZiBsYW5nICE9IFwidW5kZWZpbmVkXCIgJiYgZGF0YS51cmwuaW5kZXhPZihsYW5nW1wiaHJlZl9wcmVmaXhcIl0pPT0tMSl7XHJcbiAgICAgIGRhdGEudXJsPVwiL1wiK2xhbmdbXCJocmVmX3ByZWZpeFwiXStkYXRhLnVybDtcclxuICAgICAgZGF0YS51cmw9ZGF0YS51cmwucmVwbGFjZSgnLy8nLCcvJykucmVwbGFjZSgnLy8nLCcvJyk7XHJcbiAgICB9XHJcblxyXG4gICAgJC5wb3N0KFxyXG4gICAgICBkYXRhLnVybCxcclxuICAgICAgcG9zdERhdGEsXHJcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxyXG4gICAgICAnanNvbidcclxuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0KHdyYXApIHtcclxuICAgIGZvcm0gPSB3cmFwLmZpbmQoJ2Zvcm0nKTtcclxuICAgIGRhdGEgPSB7XHJcbiAgICAgIGZvcm06IGZvcm0sXHJcbiAgICAgIHBhcmFtOiBkZWZhdWx0cyxcclxuICAgICAgd3JhcDogd3JhcFxyXG4gICAgfTtcclxuICAgIGRhdGEudXJsID0gZm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xyXG4gICAgZGF0YS5tZXRob2QgPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcclxuICAgIGZvcm0udW5iaW5kKCdzdWJtaXQnKTtcclxuICAgIC8vZm9ybS5vZmYoJ3N1Ym1pdCcpO1xyXG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XHJcbiAgfVxyXG5cclxuICBlbHMuZmluZCgnW3JlcXVpcmVkXScpXHJcbiAgICAuYWRkQ2xhc3MoJ3JlcXVpcmVkJylcclxuICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpO1xyXG5cclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgIGluaXQoZWxzLmVxKGkpKTtcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2YgcGxhY2Vob2xkZXIgPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBwbGFjZWhvbGRlcigpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFNSTygpIHtcclxuICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvID0ge307XHJcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcclxuICAgICQuZWFjaChhLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcclxuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XHJcbiAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbztcclxuICB9O1xyXG59O1xyXG5hZGRTUk8oKTsiLCJ2YXIgc2RUb29sdGlwID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB2YXIgdG9vbHRpcFRpbWVPdXQgPSBudWxsO1xyXG4gICAgdmFyIGRpc3BsYXlUaW1lT3ZlciA9IDA7XHJcbiAgICB2YXIgZGlzcGxheVRpbWVDbGljayA9IDMwMDA7XHJcbiAgICB2YXIgaGlkZVRpbWUgPSAxMDA7XHJcbiAgICB2YXIgYXJyb3cgPSAxMDtcclxuICAgIHZhciBhcnJvd1dpZHRoID0gODtcclxuICAgIHZhciB0b29sdGlwO1xyXG4gICAgdmFyIHNpemUgPSAnc21hbGwnO1xyXG4gICAgdmFyIGhpZGVDbGFzcyA9ICdoaWRkZW4nO1xyXG4gICAgdmFyIHRvb2x0aXBFbGVtZW50cztcclxuICAgIHZhciBjdXJyZW50RWxlbWVudDtcclxuXHJcbiAgICBmdW5jdGlvbiB0b29sdGlwSW5pdCgpIHtcclxuICAgICAgICB0b29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndGlwc29fYnViYmxlJykuYWRkQ2xhc3Moc2l6ZSkuYWRkQ2xhc3MoaGlkZUNsYXNzKVxyXG4gICAgICAgICAgICAuaHRtbCgnPGRpdiBjbGFzcz1cInRpcHNvX2Fycm93XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRpdHNvX3RpdGxlXCI+PC9kaXY+PGRpdiBjbGFzcz1cInRpcHNvX2NvbnRlbnRcIj48L2Rpdj4nKTtcclxuICAgICAgICAkKHRvb2x0aXApLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBjaGVja01vdXNlUG9zKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodG9vbHRpcCkub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGNoZWNrTW91c2VQb3MoZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0b29sdGlwKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjaGVja01vdXNlUG9zKGUpIHtcclxuICAgICAgICBpZiAoZS5jbGllbnRYID4gJChjdXJyZW50RWxlbWVudCkub2Zmc2V0KCkubGVmdCAmJiBlLmNsaWVudFggPCAkKGN1cnJlbnRFbGVtZW50KS5vZmZzZXQoKS5sZWZ0ICsgJChjdXJyZW50RWxlbWVudCkub3V0ZXJXaWR0aCgpXHJcbiAgICAgICAgICAgICYmIGUuY2xpZW50WSA+ICQoY3VycmVudEVsZW1lbnQpLm9mZnNldCgpLnRvcCAmJiBlLmNsaWVudFkgPCAkKGN1cnJlbnRFbGVtZW50KS5vZmZzZXQoKS50b3AgKyAkKGN1cnJlbnRFbGVtZW50KS5vdXRlckhlaWdodCgpKSB7XHJcbiAgICAgICAgICAgIHRvb2x0aXBTaG93KGN1cnJlbnRFbGVtZW50LCBkaXNwbGF5VGltZU92ZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0b29sdGlwU2hvdyhlbGVtLCBkaXNwbGF5VGltZSkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0b29sdGlwVGltZU91dCk7XHJcblxyXG4gICAgICAgIHZhciB0aXRsZSA9ICQoZWxlbSkuZGF0YSgnb3JpZ2luYWwtdGl0bGUnKTtcclxuICAgICAgICB2YXIgaHRtbCA9ICQoJyMnKyQoZWxlbSkuZGF0YSgnb3JpZ2luYWwtaHRtbCcpKS5odG1sKCk7XHJcbiAgICAgICAgaWYgKGh0bWwpIHtcclxuICAgICAgICAgICAgdGl0bGUgPSBodG1sO1xyXG4gICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCd0aXBzb19idWJibGVfaHRtbCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RpcHNvX2J1YmJsZV9odG1sJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9ICQoZWxlbSkuZGF0YSgncGxhY2VtZW50JykgfHwgJ2JvdHRvbSc7XHJcbiAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcyhcInRvcF9yaWdodF9jb3JuZXIgYm90dG9tX3JpZ2h0X2Nvcm5lciB0b3BfbGVmdF9jb3JuZXIgYm90dG9tX2xlZnRfY29ybmVyXCIpO1xyXG5cclxuICAgICAgICAkKHRvb2x0aXApLmZpbmQoJy50aXRzb190aXRsZScpLmh0bWwodGl0bGUpO1xyXG4gICAgICAgIHNldFBvc2l0b24oZWxlbSwgcG9zaXRpb24pO1xyXG4gICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoaGlkZUNsYXNzKTtcclxuICAgICAgICBjdXJyZW50RWxlbWVudCA9IGVsZW07XHJcblxyXG4gICAgICAgIGlmIChkaXNwbGF5VGltZSA+IDApIHtcclxuICAgICAgICAgICAgdG9vbHRpcFRpbWVPdXQgPSBzZXRUaW1lb3V0KHRvb2x0aXBIaWRlLCBkaXNwbGF5VGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gdG9vbHRpcEhpZGUoKSB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRvb2x0aXBUaW1lT3V0KTtcclxuICAgICAgICB0b29sdGlwVGltZU91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcyhoaWRlQ2xhc3MpO1xyXG4gICAgICAgIH0sIGhpZGVUaW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRQb3NpdG9uKGVsZW0sIHBvc2l0aW9uKXtcclxuICAgICAgICB2YXIgJGUgPSAkKGVsZW0pO1xyXG4gICAgICAgIHZhciAkd2luID0gJCh3aW5kb3cpO1xyXG4gICAgICAgIHZhciBjdXN0b21Ub3AgPSAkKGVsZW0pLmRhdGEoJ3RvcCcpOy8v0LfQsNC00LDQvdCwINC/0L7Qt9C40YbQuNGPINCy0L3Rg9GC0YDQuCDRjdC70LXQvNC10L3RgtCwXHJcbiAgICAgICAgdmFyIGN1c3RvbUxlZnQgPSAkKGVsZW0pLmRhdGEoJ2xlZnQnKTsvL9C30LDQtNCw0L3QsCDQv9C+0LfQuNGG0LjRjyDQstC90YPRgtGA0Lgg0Y3Qu9C10LzQtdC90YLQsFxyXG4gICAgICAgIHZhciBub3JldmVydCA9ICQoZWxlbSkuZGF0YSgnbm9yZXZlcnQnKTsvL9C90LUg0L/QtdGA0LXQstC+0YDQsNGH0LjQstCw0YLRjFxyXG4gICAgICAgIHN3aXRjaChwb3NpdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgICAgICAgICAgcG9zX2xlZnQgPSAkZS5vZmZzZXQoKS5sZWZ0ICsgKGN1c3RvbUxlZnQgPyBjdXN0b21MZWZ0IDogJGUub3V0ZXJXaWR0aCgpIC8gMikgLSAkKHRvb2x0aXApLm91dGVyV2lkdGgoKSAvIDI7XHJcbiAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wIC0gJCh0b29sdGlwKS5vdXRlckhlaWdodCgpICsgKGN1c3RvbVRvcCA/IGN1c3RvbVRvcCA6IDApIC0gYXJyb3c7XHJcbiAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmZpbmQoJy50aXBzb19hcnJvdycpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogLWFycm93V2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHBvc190b3AgPCAkd2luLnNjcm9sbFRvcCgpKSAmJiAhbm9yZXZlcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wICsoY3VzdG9tVG9wID8gY3VzdG9tVG9wIDogJGUub3V0ZXJIZWlnaHQoKSkgKyBhcnJvdztcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKCd0b3AgYm90dG9tIGxlZnQgcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCdib3R0b20nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ3RvcCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICBwb3NfbGVmdCA9ICRlLm9mZnNldCgpLmxlZnQgKyAoY3VzdG9tTGVmdCA/IGN1c3RvbUxlZnQgOiAkZS5vdXRlcldpZHRoKCkgLyAyKSAtICQodG9vbHRpcCkub3V0ZXJXaWR0aCgpIC8gMjtcclxuICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgKyAoY3VzdG9tVG9wID8gY3VzdG9tVG9wIDogJGUub3V0ZXJIZWlnaHQoKSkgKyBhcnJvdztcclxuICAgICAgICAgICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpcHNvX2Fycm93JykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5MZWZ0OiAtYXJyb3dXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICgocG9zX3RvcCArICQodG9vbHRpcCkuaGVpZ2h0KCkgPiAkd2luLnNjcm9sbFRvcCgpICsgJHdpbi5vdXRlckhlaWdodCgpKSAmJiAhbm9yZXZlcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wIC0gJCh0b29sdGlwKS5oZWlnaHQoKSArIChjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAwKSAtIGFycm93O1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ3RvcCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygnYm90dG9tJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgJCh0b29sdGlwKS5jc3Moe1xyXG4gICAgICAgICAgICBsZWZ0OiAgcG9zX2xlZnQsXHJcbiAgICAgICAgICAgIHRvcDogcG9zX3RvcFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEV2ZW50cygpIHtcclxuXHJcbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzID0gJCgnW2RhdGEtdG9nZ2xlPXRvb2x0aXBdJyk7XHJcblxyXG4gICAgICAgIHRvb2x0aXBFbGVtZW50cy5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5kYXRhKCdjbGlja2FibGUnKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQodG9vbHRpcCkuaGFzQ2xhc3MoaGlkZUNsYXNzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBTaG93KHRoaXMsIGRpc3BsYXlUaW1lQ2xpY2spO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwSGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0b29sdGlwRWxlbWVudHMub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMDI0KSB7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwU2hvdyh0aGlzLCBkaXNwbGF5VGltZU92ZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPj0gMTAyNCkge1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcFNob3codGhpcywgZGlzcGxheVRpbWVPdmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRvb2x0aXBFbGVtZW50cy5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpe1xyXG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPj0gMTAyNCkge1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcEhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgIC8vICAgICB0b29sdGlwSW5pdCgpO1xyXG4gICAgLy8gICAgIHNldEV2ZW50cygpO1xyXG4gICAgLy8gfSk7XHJcbiAgICAvL1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpbml0OiB0b29sdGlwSW5pdCxcclxuICAgICAgICBzZXRFdmVudHM6IHNldEV2ZW50c1xyXG4gICAgfVxyXG59KSgpO1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICBzZFRvb2x0aXAuaW5pdCgpO1xyXG4gICAgc2RUb29sdGlwLnNldEV2ZW50cygpO1xyXG59KTtcclxuXHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgdmFyICRub3R5ZmlfYnRuID0gJCgnLmhlYWRlci1sb2dvX25vdHknKTtcclxuICBpZiAoJG5vdHlmaV9idG4ubGVuZ3RoID09IDApIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHZhciBocmVmID0gJy8nK2xhbmcuaHJlZl9wcmVmaXgrJ2FjY291bnQvbm90aWZpY2F0aW9uJztcclxuXHJcbiAgJC5nZXQoaHJlZiwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgIGlmICghZGF0YS5ub3RpZmljYXRpb25zIHx8IGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGggPT0gMCkgcmV0dXJuO1xyXG5cclxuICAgIHZhciBvdXQgPSAnPGRpdiBjbGFzcz1oZWFkZXItbm90eS1ib3g+PGRpdiBjbGFzcz1oZWFkZXItbm90eS1ib3gtaW5uZXI+PHVsIGNsYXNzPVwiaGVhZGVyLW5vdHktbGlzdFwiPic7XHJcbiAgICAkbm90eWZpX2J0bi5maW5kKCdhJykucmVtb3ZlQXR0cignaHJlZicpO1xyXG4gICAgdmFyIGhhc19uZXcgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5ub3RpZmljYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGVsID0gZGF0YS5ub3RpZmljYXRpb25zW2ldO1xyXG4gICAgICB2YXIgaXNfbmV3ID0gKGVsLmlzX3ZpZXdlZCA9PSAwICYmIGVsLnR5cGVfaWQgPT0gMik7XHJcbiAgICAgIG91dCArPSAnPGxpIGNsYXNzPVwiaGVhZGVyLW5vdHktaXRlbScgKyAoaXNfbmV3ID8gJyBoZWFkZXItbm90eS1pdGVtX25ldycgOiAnJykgKyAnXCI+JztcclxuICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWRhdGE+JyArIGVsLmRhdGEgKyAnPC9kaXY+JztcclxuICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LXRleHQ+JyArIGVsLnRleHQgKyAnPC9kaXY+JztcclxuICAgICAgb3V0ICs9ICc8L2xpPic7XHJcbiAgICAgIGhhc19uZXcgPSBoYXNfbmV3IHx8IGlzX25ldztcclxuICAgIH1cclxuXHJcbiAgICBvdXQgKz0gJzwvdWw+JztcclxuICAgIG91dCArPSAnPGEgY2xhc3M9XCJidG4gaGVhZGVyLW5vdHktYm94LWJ0blwiIGhyZWY9XCInK2hyZWYrJ1wiPicgKyBkYXRhLmJ0biArICc8L2E+JztcclxuICAgIG91dCArPSAnPC9kaXY+PC9kaXY+JztcclxuICAgICQoJy5oZWFkZXInKS5hcHBlbmQob3V0KTtcclxuXHJcbiAgICBpZiAoaGFzX25ldykge1xyXG4gICAgICAkbm90eWZpX2J0bi5hZGRDbGFzcygndG9vbHRpcCcpLmFkZENsYXNzKCdoYXMtbm90eScpO1xyXG4gICAgfVxyXG5cclxuICAgICRub3R5ZmlfYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgaWYgKCQoJy5oZWFkZXItbm90eS1ib3gnKS5oYXNDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKSkge1xyXG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5yZW1vdmVDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykuYWRkQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XHJcbiAgICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XHJcblxyXG4gICAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdoYXMtbm90eScpKSB7XHJcbiAgICAgICAgICAkLnBvc3QoJy9hY2NvdW50L25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmhlYWRlci1sb2dvX25vdHknKS5yZW1vdmVDbGFzcygndG9vbHRpcCcpLnJlbW92ZUNsYXNzKCdoYXMtbm90eScpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5yZW1vdmVDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLW5vdHktbGlzdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSlcclxuICB9LCAnanNvbicpO1xyXG5cclxufSkoKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaWYgKHR5cGVvZiBtaWhhaWxkZXYgPT0gXCJ1bmRlZmluZWRcIiB8fCAhbWloYWlsZGV2KSB7XHJcbiAgICB2YXIgbWloYWlsZGV2ID0ge307XHJcbiAgICBtaWhhaWxkZXYuZWxGaW5kZXIgPSB7XHJcbiAgICAgICAgb3Blbk1hbmFnZXI6IGZ1bmN0aW9uKG9wdGlvbnMpe1xyXG4gICAgICAgICAgICB2YXIgcGFyYW1zID0gXCJtZW51YmFyPW5vLHRvb2xiYXI9bm8sbG9jYXRpb249bm8sZGlyZWN0b3JpZXM9bm8sc3RhdHVzPW5vLGZ1bGxzY3JlZW49bm9cIjtcclxuICAgICAgICAgICAgaWYob3B0aW9ucy53aWR0aCA9PSAnYXV0bycpe1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy53aWR0aCA9ICQod2luZG93KS53aWR0aCgpLzEuNTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYob3B0aW9ucy5oZWlnaHQgPT0gJ2F1dG8nKXtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMuaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLzEuNTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGFyYW1zID0gcGFyYW1zICsgXCIsd2lkdGg9XCIgKyBvcHRpb25zLndpZHRoO1xyXG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMgKyBcIixoZWlnaHQ9XCIgKyBvcHRpb25zLmhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2cocGFyYW1zKTtcclxuICAgICAgICAgICAgdmFyIHdpbiA9IHdpbmRvdy5vcGVuKG9wdGlvbnMudXJsLCAnRWxGaW5kZXJNYW5hZ2VyJyArIG9wdGlvbnMuaWQsIHBhcmFtcyk7XHJcbiAgICAgICAgICAgIHdpbi5mb2N1cygpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmdW5jdGlvbnM6IHt9LFxyXG4gICAgICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihpZCwgZnVuYyl7XHJcbiAgICAgICAgICAgIHRoaXMuZnVuY3Rpb25zW2lkXSA9IGZ1bmM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjYWxsRnVuY3Rpb246IGZ1bmN0aW9uKGlkLCBmaWxlKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZnVuY3Rpb25zW2lkXShmaWxlLCBpZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmdW5jdGlvblJldHVyblRvSW5wdXQ6IGZ1bmN0aW9uKGZpbGUsIGlkKXtcclxuICAgICAgICAgICAgalF1ZXJ5KCcjJyArIGlkKS52YWwoZmlsZS51cmwpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxufVxyXG5cclxuXHJcblxyXG52YXIgbWVnYXNsaWRlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIHNsaWRlcl9kYXRhID0gZmFsc2U7XHJcbiAgdmFyIGNvbnRhaW5lcl9pZCA9IFwic2VjdGlvbiNtZWdhX3NsaWRlclwiO1xyXG4gIHZhciBwYXJhbGxheF9ncm91cCA9IGZhbHNlO1xyXG4gIHZhciBwYXJhbGxheF90aW1lciA9IGZhbHNlO1xyXG4gIHZhciBwYXJhbGxheF9jb3VudGVyID0gMDtcclxuICB2YXIgcGFyYWxsYXhfZCA9IDE7XHJcbiAgdmFyIG1vYmlsZV9tb2RlID0gLTE7XHJcbiAgdmFyIG1heF90aW1lX2xvYWRfcGljID0gMzAwO1xyXG4gIHZhciBtb2JpbGVfc2l6ZSA9IDcwMDtcclxuICB2YXIgcmVuZGVyX3NsaWRlX25vbSA9IDA7XHJcbiAgdmFyIHRvdF9pbWdfd2FpdDtcclxuICB2YXIgc2xpZGVzO1xyXG4gIHZhciBzbGlkZV9zZWxlY3RfYm94O1xyXG4gIHZhciBlZGl0b3I7XHJcbiAgdmFyIHRpbWVvdXRJZDtcclxuICB2YXIgc2Nyb2xsX3BlcmlvZCA9IDYwMDA7XHJcblxyXG4gIHZhciBwb3NBcnIgPSBbXHJcbiAgICAnc2xpZGVyX190ZXh0LWx0JywgJ3NsaWRlcl9fdGV4dC1jdCcsICdzbGlkZXJfX3RleHQtcnQnLFxyXG4gICAgJ3NsaWRlcl9fdGV4dC1sYycsICdzbGlkZXJfX3RleHQtY2MnLCAnc2xpZGVyX190ZXh0LXJjJyxcclxuICAgICdzbGlkZXJfX3RleHQtbGInLCAnc2xpZGVyX190ZXh0LWNiJywgJ3NsaWRlcl9fdGV4dC1yYicsXHJcbiAgXTtcclxuICB2YXIgcG9zX2xpc3QgPSBbXHJcbiAgICAn0JvQtdCy0L4g0LLQtdGA0YUnLCAn0YbQtdC90YLRgCDQstC10YDRhScsICfQv9GA0LDQstC+INCy0LXRgNGFJyxcclxuICAgICfQm9C10LLQviDRhtC10L3RgtGAJywgJ9GG0LXQvdGC0YAnLCAn0L/RgNCw0LLQviDRhtC10L3RgtGAJyxcclxuICAgICfQm9C10LLQviDQvdC40LcnLCAn0YbQtdC90YLRgCDQvdC40LcnLCAn0L/RgNCw0LLQviDQvdC40LcnLFxyXG4gIF07XHJcbiAgdmFyIHNob3dfZGVsYXkgPSBbXHJcbiAgICAnc2hvd19ub19kZWxheScsXHJcbiAgICAnc2hvd19kZWxheV8wNScsXHJcbiAgICAnc2hvd19kZWxheV8xMCcsXHJcbiAgICAnc2hvd19kZWxheV8xNScsXHJcbiAgICAnc2hvd19kZWxheV8yMCcsXHJcbiAgICAnc2hvd19kZWxheV8yNScsXHJcbiAgICAnc2hvd19kZWxheV8zMCdcclxuICBdO1xyXG4gIHZhciBoaWRlX2RlbGF5ID0gW1xyXG4gICAgJ2hpZGVfbm9fZGVsYXknLFxyXG4gICAgJ2hpZGVfZGVsYXlfMDUnLFxyXG4gICAgJ2hpZGVfZGVsYXlfMTAnLFxyXG4gICAgJ2hpZGVfZGVsYXlfMTUnLFxyXG4gICAgJ2hpZGVfZGVsYXlfMjAnXHJcbiAgXTtcclxuICB2YXIgeWVzX25vX2FyciA9IFtcclxuICAgICdubycsXHJcbiAgICAneWVzJ1xyXG4gIF07XHJcbiAgdmFyIHllc19ub192YWwgPSBbXHJcbiAgICAnJyxcclxuICAgICdmaXhlZF9fZnVsbC1oZWlnaHQnXHJcbiAgXTtcclxuICB2YXIgYnRuX3N0eWxlID0gW1xyXG4gICAgJ25vbmUnLFxyXG4gICAgJ2JvcmRvJyxcclxuICAgICdibGFjaycsXHJcbiAgICAnYmx1ZScsXHJcbiAgICAnZGFyay1ibHVlJyxcclxuICAgICdyZWQnLFxyXG4gICAgJ29yYW5nZScsXHJcbiAgICAnZ3JlZW4nLFxyXG4gICAgJ2xpZ2h0LWdyZWVuJyxcclxuICAgICdkYXJrLWdyZWVuJyxcclxuICAgICdwaW5rJyxcclxuICAgICd5ZWxsb3cnXHJcbiAgXTtcclxuICB2YXIgc2hvd19hbmltYXRpb25zID0gW1xyXG4gICAgXCJub3RfYW5pbWF0ZVwiLFxyXG4gICAgXCJib3VuY2VJblwiLFxyXG4gICAgXCJib3VuY2VJbkRvd25cIixcclxuICAgIFwiYm91bmNlSW5MZWZ0XCIsXHJcbiAgICBcImJvdW5jZUluUmlnaHRcIixcclxuICAgIFwiYm91bmNlSW5VcFwiLFxyXG4gICAgXCJmYWRlSW5cIixcclxuICAgIFwiZmFkZUluRG93blwiLFxyXG4gICAgXCJmYWRlSW5MZWZ0XCIsXHJcbiAgICBcImZhZGVJblJpZ2h0XCIsXHJcbiAgICBcImZhZGVJblVwXCIsXHJcbiAgICBcImZsaXBJblhcIixcclxuICAgIFwiZmxpcEluWVwiLFxyXG4gICAgXCJsaWdodFNwZWVkSW5cIixcclxuICAgIFwicm90YXRlSW5cIixcclxuICAgIFwicm90YXRlSW5Eb3duTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVJblVwTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVJblVwUmlnaHRcIixcclxuICAgIFwiamFja0luVGhlQm94XCIsXHJcbiAgICBcInJvbGxJblwiLFxyXG4gICAgXCJ6b29tSW5cIlxyXG4gIF07XHJcblxyXG4gIHZhciBoaWRlX2FuaW1hdGlvbnMgPSBbXHJcbiAgICBcIm5vdF9hbmltYXRlXCIsXHJcbiAgICBcImJvdW5jZU91dFwiLFxyXG4gICAgXCJib3VuY2VPdXREb3duXCIsXHJcbiAgICBcImJvdW5jZU91dExlZnRcIixcclxuICAgIFwiYm91bmNlT3V0UmlnaHRcIixcclxuICAgIFwiYm91bmNlT3V0VXBcIixcclxuICAgIFwiZmFkZU91dFwiLFxyXG4gICAgXCJmYWRlT3V0RG93blwiLFxyXG4gICAgXCJmYWRlT3V0TGVmdFwiLFxyXG4gICAgXCJmYWRlT3V0UmlnaHRcIixcclxuICAgIFwiZmFkZU91dFVwXCIsXHJcbiAgICBcImZsaXBPdXRYXCIsXHJcbiAgICBcImxpcE91dFlcIixcclxuICAgIFwibGlnaHRTcGVlZE91dFwiLFxyXG4gICAgXCJyb3RhdGVPdXRcIixcclxuICAgIFwicm90YXRlT3V0RG93bkxlZnRcIixcclxuICAgIFwicm90YXRlT3V0RG93blJpZ2h0XCIsXHJcbiAgICBcInJvdGF0ZU91dFVwTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVPdXRVcFJpZ2h0XCIsXHJcbiAgICBcImhpbmdlXCIsXHJcbiAgICBcInJvbGxPdXRcIlxyXG4gIF07XHJcbiAgdmFyIHN0VGFibGU7XHJcbiAgdmFyIHBhcmFsYXhUYWJsZTtcclxuXHJcbiAgZnVuY3Rpb24gaW5pdEltYWdlU2VydmVyU2VsZWN0KGVscykge1xyXG4gICAgaWYgKGVscy5sZW5ndGggPT0gMClyZXR1cm47XHJcbiAgICBlbHMud3JhcCgnPGRpdiBjbGFzcz1cInNlbGVjdF9pbWdcIj4nKTtcclxuICAgIGVscyA9IGVscy5wYXJlbnQoKTtcclxuICAgIGVscy5hcHBlbmQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmlsZV9idXR0b25cIj48aSBjbGFzcz1cIm1jZS1pY28gbWNlLWktYnJvd3NlXCI+PC9pPjwvYnV0dG9uPicpO1xyXG4gICAgLyplbHMuZmluZCgnYnV0dG9uJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoKSB7XHJcbiAgICAgJCgnI3JveHlDdXN0b21QYW5lbDInKS5hZGRDbGFzcygnb3BlbicpXHJcbiAgICAgfSk7Ki9cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBlbCA9IGVscy5lcShpKS5maW5kKCdpbnB1dCcpO1xyXG4gICAgICBpZiAoIWVsLmF0dHIoJ2lkJykpIHtcclxuICAgICAgICBlbC5hdHRyKCdpZCcsICdmaWxlXycgKyBpICsgJ18nICsgRGF0ZS5ub3coKSlcclxuICAgICAgfVxyXG4gICAgICB2YXIgdF9pZCA9IGVsLmF0dHIoJ2lkJyk7XHJcbiAgICAgIG1paGFpbGRldi5lbEZpbmRlci5yZWdpc3Rlcih0X2lkLCBmdW5jdGlvbiAoZmlsZSwgaWQpIHtcclxuICAgICAgICAvLyQodGhpcykudmFsKGZpbGUudXJsKS50cmlnZ2VyKCdjaGFuZ2UnLCBbZmlsZSwgaWRdKTtcclxuICAgICAgICAkKCcjJyArIGlkKS52YWwoZmlsZS51cmwpLmNoYW5nZSgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIDtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmZpbGVfYnV0dG9uJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnByZXYoKTtcclxuICAgICAgdmFyIGlkID0gJHRoaXMuYXR0cignaWQnKTtcclxuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLm9wZW5NYW5hZ2VyKHtcclxuICAgICAgICBcInVybFwiOiBcIi9tYW5hZ2VyL2VsZmluZGVyP2ZpbHRlcj1pbWFnZSZjYWxsYmFjaz1cIiArIGlkICsgXCImbGFuZz1ydVwiLFxyXG4gICAgICAgIFwid2lkdGhcIjogXCJhdXRvXCIsXHJcbiAgICAgICAgXCJoZWlnaHRcIjogXCJhdXRvXCIsXHJcbiAgICAgICAgXCJpZFwiOiBpZFxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuSW5wdXQoZGF0YSkge1xyXG4gICAgdmFyIGlucHV0ID0gJzxpbnB1dCBjbGFzcz1cIicgKyAoZGF0YS5pbnB1dENsYXNzIHx8ICcnKSArICdcIiB2YWx1ZT1cIicgKyAoZGF0YS52YWx1ZSB8fCAnJykgKyAnXCI+JztcclxuICAgIGlmIChkYXRhLmxhYmVsKSB7XHJcbiAgICAgIGlucHV0ID0gJzxsYWJlbD48c3Bhbj4nICsgZGF0YS5sYWJlbCArICc8L3NwYW4+JyArIGlucHV0ICsgJzwvbGFiZWw+JztcclxuICAgIH1cclxuICAgIGlmIChkYXRhLnBhcmVudCkge1xyXG4gICAgICBpbnB1dCA9ICc8JyArIGRhdGEucGFyZW50ICsgJz4nICsgaW5wdXQgKyAnPC8nICsgZGF0YS5wYXJlbnQgKyAnPic7XHJcbiAgICB9XHJcbiAgICBpbnB1dCA9ICQoaW5wdXQpO1xyXG5cclxuICAgIGlmIChkYXRhLm9uQ2hhbmdlKSB7XHJcbiAgICAgIHZhciBvbkNoYW5nZTtcclxuICAgICAgaWYgKGRhdGEuYmluZCkge1xyXG4gICAgICAgIGRhdGEuYmluZC5pbnB1dCA9IGlucHV0LmZpbmQoJ2lucHV0Jyk7XHJcbiAgICAgICAgb25DaGFuZ2UgPSBkYXRhLm9uQ2hhbmdlLmJpbmQoZGF0YS5iaW5kKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChpbnB1dC5maW5kKCdpbnB1dCcpKTtcclxuICAgICAgfVxyXG4gICAgICBpbnB1dC5maW5kKCdpbnB1dCcpLm9uKCdjaGFuZ2UnLCBvbkNoYW5nZSlcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlblNlbGVjdChkYXRhKSB7XHJcbiAgICB2YXIgaW5wdXQgPSAkKCc8c2VsZWN0Lz4nKTtcclxuXHJcbiAgICB2YXIgZWwgPSBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXTtcclxuICAgIGlmIChkYXRhLmluZGV4ICE9PSBmYWxzZSkge1xyXG4gICAgICBlbCA9IGVsW2RhdGEuaW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbFtkYXRhLnBhcmFtXSkge1xyXG4gICAgICBkYXRhLnZhbHVlID0gZWxbZGF0YS5wYXJhbV07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkYXRhLnZhbHVlID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZGF0YS5zdGFydF9vcHRpb24pIHtcclxuICAgICAgaW5wdXQuYXBwZW5kKGRhdGEuc3RhcnRfb3B0aW9uKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5saXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciB2YWw7XHJcbiAgICAgIHZhciB0eHQgPSBkYXRhLmxpc3RbaV07XHJcbiAgICAgIGlmIChkYXRhLnZhbF90eXBlID09IDApIHtcclxuICAgICAgICB2YWwgPSBkYXRhLmxpc3RbaV07XHJcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWxfdHlwZSA9PSAxKSB7XHJcbiAgICAgICAgdmFsID0gaTtcclxuICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbF90eXBlID09IDIpIHtcclxuICAgICAgICAvL3ZhbD1kYXRhLnZhbF9saXN0W2ldO1xyXG4gICAgICAgIHZhbCA9IGk7XHJcbiAgICAgICAgdHh0ID0gZGF0YS52YWxfbGlzdFtpXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHNlbCA9ICh2YWwgPT0gZGF0YS52YWx1ZSA/ICdzZWxlY3RlZCcgOiAnJyk7XHJcbiAgICAgIGlmIChzZWwgPT0gJ3NlbGVjdGVkJykge1xyXG4gICAgICAgIGlucHV0LmF0dHIoJ3RfdmFsJywgZGF0YS5saXN0W2ldKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgb3B0aW9uID0gJzxvcHRpb24gdmFsdWU9XCInICsgdmFsICsgJ1wiICcgKyBzZWwgKyAnPicgKyB0eHQgKyAnPC9vcHRpb24+JztcclxuICAgICAgaWYgKGRhdGEudmFsX3R5cGUgPT0gMikge1xyXG4gICAgICAgIG9wdGlvbiA9ICQob3B0aW9uKS5hdHRyKCdjb2RlJywgZGF0YS5saXN0W2ldKTtcclxuICAgICAgfVxyXG4gICAgICBpbnB1dC5hcHBlbmQob3B0aW9uKVxyXG4gICAgfVxyXG5cclxuICAgIGlucHV0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGRhdGEgPSB0aGlzO1xyXG4gICAgICB2YXIgdmFsID0gZGF0YS5lbC52YWwoKTtcclxuICAgICAgdmFyIHNsX29wID0gZGF0YS5lbC5maW5kKCdvcHRpb25bdmFsdWU9JyArIHZhbCArICddJyk7XHJcbiAgICAgIHZhciBjbHMgPSBzbF9vcC50ZXh0KCk7XHJcbiAgICAgIHZhciBjaCA9IHNsX29wLmF0dHIoJ2NvZGUnKTtcclxuICAgICAgaWYgKCFjaCljaCA9IGNscztcclxuICAgICAgaWYgKGRhdGEuaW5kZXggIT09IGZhbHNlKSB7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5pbmRleF1bZGF0YS5wYXJhbV0gPSB2YWw7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5wYXJhbV0gPSB2YWw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRhdGEub2JqLnJlbW92ZUNsYXNzKGRhdGEucHJlZml4ICsgZGF0YS5lbC5hdHRyKCd0X3ZhbCcpKTtcclxuICAgICAgZGF0YS5vYmouYWRkQ2xhc3MoZGF0YS5wcmVmaXggKyBjaCk7XHJcbiAgICAgIGRhdGEuZWwuYXR0cigndF92YWwnLCBjaCk7XHJcblxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBlbDogaW5wdXQsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06IGRhdGEucGFyYW0sXHJcbiAgICAgIHByZWZpeDogZGF0YS5wcmVmaXggfHwgJydcclxuICAgIH0pKTtcclxuXHJcbiAgICBpZiAoZGF0YS5wYXJlbnQpIHtcclxuICAgICAgdmFyIHBhcmVudCA9ICQoJzwnICsgZGF0YS5wYXJlbnQgKyAnLz4nKTtcclxuICAgICAgcGFyZW50LmFwcGVuZChpbnB1dCk7XHJcbiAgICAgIHJldHVybiBwYXJlbnQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRTZWxBbmltYXRpb25Db250cm9sbChkYXRhKSB7XHJcbiAgICB2YXIgYW5pbV9zZWwgPSBbXTtcclxuICAgIHZhciBvdXQ7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPlNob3cgYW5pbWF0aW9uPC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBzaG93X2FuaW1hdGlvbnMsXHJcbiAgICAgIHZhbF90eXBlOiAwLFxyXG4gICAgICBvYmo6IGRhdGEub2JqLFxyXG4gICAgICBncjogZGF0YS5ncixcclxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXHJcbiAgICAgIHBhcmFtOiAnc2hvd19hbmltYXRpb24nLFxyXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XHJcbiAgICB9KSk7XHJcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+U2hvdyBkZWxheTwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogc2hvd19kZWxheSxcclxuICAgICAgdmFsX3R5cGU6IDEsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ICdzaG93X2RlbGF5JyxcclxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcclxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8YnIvPicpO1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5IaWRlIGFuaW1hdGlvbjwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogaGlkZV9hbmltYXRpb25zLFxyXG4gICAgICB2YWxfdHlwZTogMCxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogJ2hpZGVfYW5pbWF0aW9uJyxcclxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcclxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPkhpZGUgZGVsYXk8L3NwYW4+Jyk7XHJcbiAgICB9XHJcbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IGhpZGVfZGVsYXksXHJcbiAgICAgIHZhbF90eXBlOiAxLFxyXG4gICAgICBvYmo6IGRhdGEub2JqLFxyXG4gICAgICBncjogZGF0YS5ncixcclxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXHJcbiAgICAgIHBhcmFtOiAnaGlkZV9kZWxheScsXHJcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcclxuICAgIH0pKTtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcclxuICAgICAgb3V0ID0gJCgnPGRpdiBjbGFzcz1cImFuaW1fc2VsXCIvPicpO1xyXG4gICAgICBvdXQuYXBwZW5kKGFuaW1fc2VsKTtcclxuICAgIH1cclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMSkge1xyXG4gICAgICBvdXQgPSBhbmltX3NlbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3V0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdF9lZGl0b3IoKSB7XHJcbiAgICAkKCcjdzEnKS5yZW1vdmUoKTtcclxuICAgICQoJyN3MV9idXR0b24nKS5yZW1vdmUoKTtcclxuICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9IHNsaWRlcl9kYXRhWzBdLm1vYmlsZS5zcGxpdCgnPycpWzBdO1xyXG5cclxuICAgIHZhciBlbCA9ICQoJyNtZWdhX3NsaWRlcl9jb250cm9sZScpO1xyXG4gICAgdmFyIGJ0bnNfYm94ID0gJCgnPGRpdiBjbGFzcz1cImJ0bl9ib3hcIi8+Jyk7XHJcblxyXG4gICAgZWwuYXBwZW5kKCc8aDI+0KPQv9GA0LDQstC70LXQvdC40LU8L2gyPicpO1xyXG4gICAgZWwuYXBwZW5kKCQoJzx0ZXh0YXJlYS8+Jywge1xyXG4gICAgICB0ZXh0OiBKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSksXHJcbiAgICAgIGlkOiAnc2xpZGVfZGF0YScsXHJcbiAgICAgIG5hbWU6IGVkaXRvclxyXG4gICAgfSkpO1xyXG5cclxuICAgIHZhciBidG4gPSAkKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQkNC60YLQuNCy0LjRgNC+0LLQsNGC0Ywg0YHQu9Cw0LnQtFwiKTtcclxuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xyXG4gICAgYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnaGlkZV9zbGlkZScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGJ0biA9ICQoJzxidXR0b24gY2xhc3M9XCJcIi8+JykudGV4dChcItCU0LXQsNC60YLQuNCy0LjRgNC+0LLQsNGC0Ywg0YHQu9Cw0LnQtFwiKTtcclxuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xyXG4gICAgYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5hZGRDbGFzcygnaGlkZV9zbGlkZScpO1xyXG4gICAgfSk7XHJcbiAgICBlbC5hcHBlbmQoYnRuc19ib3gpO1xyXG5cclxuICAgIGVsLmFwcGVuZCgnPGgyPtCe0LHRidC40LUg0L/QsNGA0LDQvNC10YLRgNGLPC9oMj4nKTtcclxuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5tb2JpbGUsXHJcbiAgICAgIGxhYmVsOiBcItCh0LvQsNC50LQg0LTQu9GPINGC0LXQu9C10YTQvtC90LBcIixcclxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSAkKHRoaXMpLnZhbCgpXHJcbiAgICAgICAgJCgnLm1vYl9iZycpLmVxKDApLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSArICcpJyk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcblxyXG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmZvbixcclxuICAgICAgbGFiZWw6IFwi0J7RgdC90L7QvdC+0Lkg0YTQvtC9XCIsXHJcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uZm9uID0gJCh0aGlzKS52YWwoKVxyXG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBzbGlkZXJfZGF0YVswXS5mb24gKyAnKScpXHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGJ0bl9jaCA9ICQoJzxkaXYgY2xhc3M9XCJidG5zXCIvPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZCgnPGgzPtCa0L3QvtC/0LrQsCDQv9C10YDQtdGF0L7QtNCwKNC00LvRjyDQn9CaINCy0LXRgNGB0LjQuCk8L2gzPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCxcclxuICAgICAgbGFiZWw6IFwi0KLQtdC60YHRglwiLFxyXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCkudGV4dChzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9LFxyXG4gICAgfSkpO1xyXG5cclxuICAgIHZhciBidXRfc2wgPSAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApO1xyXG4gICAgYnRuX2NoLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5idXR0b24uaHJlZixcclxuICAgICAgbGFiZWw6IFwi0KHRgdGL0LvQutCwXCIsXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5idXR0b24uaHJlZiA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS5hdHRyKCdocmVmJyxzbGlkZXJfZGF0YVswXS5idXR0b24uaHJlZik7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9LFxyXG4gICAgfSkpO1xyXG5cclxuICAgIGJ0bl9jaC5hcHBlbmQoJzxici8+Jyk7XHJcbiAgICB2YXIgd3JhcF9sYWIgPSAkKCc8bGFiZWwvPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZCh3cmFwX2xhYik7XHJcbiAgICB3cmFwX2xhYi5hcHBlbmQoJzxzcGFuPtCe0YTQvtGA0LzQu9C10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcclxuICAgIHdyYXBfbGFiLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBidG5fc3R5bGUsXHJcbiAgICAgIHZhbF90eXBlOiAwLFxyXG4gICAgICBvYmo6IGJ1dF9zbCxcclxuICAgICAgZ3I6ICdidXR0b24nLFxyXG4gICAgICBpbmRleDogZmFsc2UsXHJcbiAgICAgIHBhcmFtOiAnY29sb3InXHJcbiAgICB9KSk7XHJcblxyXG4gICAgYnRuX2NoLmFwcGVuZCgnPGJyLz4nKTtcclxuICAgIHdyYXBfbGFiID0gJCgnPGxhYmVsLz4nKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQod3JhcF9sYWIpO1xyXG4gICAgd3JhcF9sYWIuYXBwZW5kKCc8c3Bhbj7Qn9C+0LvQvtC20LXQvdC40LUg0LrQvdC+0L/QutC4PC9zcGFuPicpO1xyXG4gICAgd3JhcF9sYWIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHBvc0FycixcclxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxyXG4gICAgICB2YWxfdHlwZTogMixcclxuICAgICAgb2JqOiBidXRfc2wucGFyZW50KCkucGFyZW50KCksXHJcbiAgICAgIGdyOiAnYnV0dG9uJyxcclxuICAgICAgaW5kZXg6IGZhbHNlLFxyXG4gICAgICBwYXJhbTogJ3BvcydcclxuICAgIH0pKTtcclxuXHJcbiAgICBidG5fY2guYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgb2JqOiBidXRfc2wucGFyZW50KCksXHJcbiAgICAgIGdyOiAnYnV0dG9uJyxcclxuICAgICAgaW5kZXg6IGZhbHNlXHJcbiAgICB9KSk7XHJcbiAgICBlbC5hcHBlbmQoYnRuX2NoKTtcclxuXHJcbiAgICB2YXIgbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwiZml4ZWRfbGF5ZXJcIi8+Jyk7XHJcbiAgICBsYXllci5hcHBlbmQoJzxoMj7QodGC0LDRgtC40YfQtdGB0LrQuNC1INGB0LvQvtC4PC9oMj4nKTtcclxuICAgIHZhciB0aCA9IFwiPHRoPuKEljwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QodC70L7QuSDQvdCwINCy0YHRjiDQstGL0YHQvtGC0YM8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XHJcbiAgICBzdFRhYmxlID0gJCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+JyArIHRoICsgJzwvdHI+PC90YWJsZT4nKTtcclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbMF0uZml4ZWQ7XHJcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYWRkVHJTdGF0aWMoZGF0YVtpXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGxheWVyLmFwcGVuZChzdFRhYmxlKTtcclxuICAgIHZhciBhZGRCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XHJcbiAgICAgIHRleHQ6IFwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXHJcbiAgICB9KTtcclxuICAgIGFkZEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGRhdGEgPSBhZGRUclN0YXRpYyhmYWxzZSk7XHJcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xyXG4gICAgZWwuYXBwZW5kKGxheWVyKTtcclxuXHJcbiAgICB2YXIgbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxheF9sYXllclwiLz4nKTtcclxuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCf0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lg8L2gyPicpO1xyXG4gICAgdmFyIHRoID0gXCI8dGg+4oSWPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCj0LTQsNC70LXQvdC90L7RgdGC0YwgKNGG0LXQu9C+0LUg0L/QvtC70L7QttC40YLQtdC70YzQvdC+0LUg0YfQuNGB0LvQvik8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XHJcblxyXG4gICAgcGFyYWxheFRhYmxlID0gJCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+JyArIHRoICsgJzwvdHI+PC90YWJsZT4nKTtcclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbMF0ucGFyYWxheDtcclxuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhZGRUclBhcmFsYXgoZGF0YVtpXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGxheWVyLmFwcGVuZChwYXJhbGF4VGFibGUpO1xyXG4gICAgdmFyIGFkZEJ0biA9ICQoJzxidXR0b24vPicsIHtcclxuICAgICAgdGV4dDogXCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcclxuICAgIH0pO1xyXG4gICAgYWRkQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZGF0YSA9IGFkZFRyUGFyYWxheChmYWxzZSk7XHJcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuXHJcbiAgICBsYXllci5hcHBlbmQoYWRkQnRuKTtcclxuICAgIGVsLmFwcGVuZChsYXllcik7XHJcblxyXG4gICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGVsLmZpbmQoJy5maWxlU2VsZWN0JykpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkVHJTdGF0aWMoZGF0YSkge1xyXG4gICAgdmFyIGkgPSBzdFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoIC0gMTtcclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICBkYXRhID0ge1xyXG4gICAgICAgIFwiaW1nXCI6IFwiXCIsXHJcbiAgICAgICAgXCJmdWxsX2hlaWdodFwiOiAwLFxyXG4gICAgICAgIFwicG9zXCI6IDAsXHJcbiAgICAgICAgXCJzaG93X2RlbGF5XCI6IDEsXHJcbiAgICAgICAgXCJzaG93X2FuaW1hdGlvblwiOiBcImxpZ2h0U3BlZWRJblwiLFxyXG4gICAgICAgIFwiaGlkZV9kZWxheVwiOiAxLFxyXG4gICAgICAgIFwiaGlkZV9hbmltYXRpb25cIjogXCJib3VuY2VPdXRcIlxyXG4gICAgICB9O1xyXG4gICAgICBzbGlkZXJfZGF0YVswXS5maXhlZC5wdXNoKGRhdGEpO1xyXG4gICAgICB2YXIgZml4ID0gJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCcpO1xyXG4gICAgICBhZGRTdGF0aWNMYXllcihkYXRhLCBmaXgsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgO1xyXG5cclxuICAgIHZhciB0ciA9ICQoJzx0ci8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogZGF0YS5pbWcsXHJcbiAgICAgIGxhYmVsOiBmYWxzZSxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcclxuICAgICAgYmluZDoge1xyXG4gICAgICAgIGdyOiAnZml4ZWQnLFxyXG4gICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcclxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcclxuICAgICAgfSxcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmlucHV0LnZhbCgpICsgJyknKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5maXhlZFtkYXRhLmluZGV4XS5pbWcgPSBkYXRhLmlucHV0LnZhbCgpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHBvc0FycixcclxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxyXG4gICAgICB2YWxfdHlwZTogMixcclxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKSxcclxuICAgICAgZ3I6ICdmaXhlZCcsXHJcbiAgICAgIGluZGV4OiBpLFxyXG4gICAgICBwYXJhbTogJ3BvcycsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiB5ZXNfbm9fdmFsLFxyXG4gICAgICB2YWxfbGlzdDogeWVzX25vX2FycixcclxuICAgICAgdmFsX3R5cGU6IDIsXHJcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXHJcbiAgICAgIGdyOiAnZml4ZWQnLFxyXG4gICAgICBpbmRleDogaSxcclxuICAgICAgcGFyYW06ICdmdWxsX2hlaWdodCcsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XHJcbiAgICAgIHR5cGU6IDEsXHJcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxyXG4gICAgICBncjogJ2ZpeGVkJyxcclxuICAgICAgaW5kZXg6IGksXHJcbiAgICAgIHBhcmVudDogJ3RkJ1xyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0biA9ICQoJzxidXR0b24vPicsIHtcclxuICAgICAgdGV4dDogXCLQo9C00LDQu9C40YLRjFwiXHJcbiAgICB9KTtcclxuICAgIGRlbEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcy5lbCk7XHJcbiAgICAgIGkgPSAkdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCkgLSAxO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcclxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcclxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5maXhlZC5zcGxpY2UoaSwgMSk7IC8v0YPQtNCw0LvRj9C10Lwg0LjQtyDQutC+0L3RhNC40LPQsCDRgdC70LDQudC00LBcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBlbDogZGVsQnRuLFxyXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuICAgIHZhciBkZWxCdG5UZCA9ICQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XHJcbiAgICB0ci5hcHBlbmQoZGVsQnRuVGQpO1xyXG4gICAgc3RUYWJsZS5hcHBlbmQodHIpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZWRpdG9yOiB0cixcclxuICAgICAgZGF0YTogZGF0YVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkVHJQYXJhbGF4KGRhdGEpIHtcclxuICAgIHZhciBpID0gcGFyYWxheFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoIC0gMTtcclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICBkYXRhID0ge1xyXG4gICAgICAgIFwiaW1nXCI6IFwiXCIsXHJcbiAgICAgICAgXCJ6XCI6IDFcclxuICAgICAgfTtcclxuICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheC5wdXNoKGRhdGEpO1xyXG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwJyk7XHJcbiAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKTtcclxuICAgIH1cclxuICAgIDtcclxuICAgIHZhciB0ciA9ICQoJzx0ci8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogZGF0YS5pbWcsXHJcbiAgICAgIGxhYmVsOiBmYWxzZSxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcclxuICAgICAgYmluZDoge1xyXG4gICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcclxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXHJcbiAgICAgIH0sXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbnB1dC52YWwoKSArICcpJyk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS5pbWcgPSBkYXRhLmlucHV0LnZhbCgpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHBvc0FycixcclxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxyXG4gICAgICB2YWxfdHlwZTogMixcclxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxyXG4gICAgICBncjogJ3BhcmFsYXgnLFxyXG4gICAgICBpbmRleDogaSxcclxuICAgICAgcGFyYW06ICdwb3MnLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICAgIHN0YXJ0X29wdGlvbjogJzxvcHRpb24gdmFsdWU9XCJcIiBjb2RlPVwiXCI+0L3QsCDQstC10YHRjCDRjdC60YDQsNC9PC9vcHRpb24+J1xyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IGRhdGEueixcclxuICAgICAgbGFiZWw6IGZhbHNlLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICAgIGJpbmQ6IHtcclxuICAgICAgICBpbmRleDogaSxcclxuICAgICAgICBwYXJhbTogJ2ltZycsXHJcbiAgICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSksXHJcbiAgICAgIH0sXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICAgICAgZGF0YS5vYmouYXR0cigneicsIGRhdGEuaW5wdXQudmFsKCkpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0ueiA9IGRhdGEuaW5wdXQudmFsKCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGRlbEJ0biA9ICQoJzxidXR0b24vPicsIHtcclxuICAgICAgdGV4dDogXCLQo9C00LDQu9C40YLRjFwiXHJcbiAgICB9KTtcclxuICAgIGRlbEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcy5lbCk7XHJcbiAgICAgIGkgPSAkdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCkgLSAxO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcclxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcclxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5wYXJhbGF4LnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOiBkZWxCdG4sXHJcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0blRkID0gJCgnPHRkLz4nKS5hcHBlbmQoZGVsQnRuKTtcclxuICAgIHRyLmFwcGVuZChkZWxCdG5UZCk7XHJcbiAgICBwYXJhbGF4VGFibGUuYXBwZW5kKHRyKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVkaXRvcjogdHIsXHJcbiAgICAgIGRhdGE6IGRhdGFcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZF9hbmltYXRpb24oZWwsIGRhdGEpIHtcclxuICAgIHZhciBvdXQgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICdjbGFzcyc6ICdhbmltYXRpb25fbGF5ZXInXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAodHlwZW9mKGRhdGEuc2hvd19kZWxheSkgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgb3V0LmFkZENsYXNzKHNob3dfZGVsYXlbZGF0YS5zaG93X2RlbGF5XSk7XHJcbiAgICAgIGlmIChkYXRhLnNob3dfYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nICsgZGF0YS5zaG93X2FuaW1hdGlvbik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mKGRhdGEuaGlkZV9kZWxheSkgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgb3V0LmFkZENsYXNzKGhpZGVfZGVsYXlbZGF0YS5oaWRlX2RlbGF5XSk7XHJcbiAgICAgIGlmIChkYXRhLmhpZGVfYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nICsgZGF0YS5oaWRlX2FuaW1hdGlvbik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBlbC5hcHBlbmQob3V0KTtcclxuICAgIHJldHVybiBlbDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlX3NsaWRlKGRhdGEpIHtcclxuICAgIHZhciBzbGlkZSA9ICQoJzxkaXYgY2xhc3M9XCJzbGlkZVwiLz4nKTtcclxuXHJcbiAgICB2YXIgbW9iX2JnID0gJCgnPGEgY2xhc3M9XCJtb2JfYmdcIiBocmVmPVwiJyArIGRhdGEuYnV0dG9uLmhyZWYgKyAnXCIvPicpO1xyXG4gICAgbW9iX2JnLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEubW9iaWxlICsgJyknKVxyXG5cclxuICAgIHNsaWRlLmFwcGVuZChtb2JfYmcpO1xyXG4gICAgaWYgKG1vYmlsZV9tb2RlKSB7XHJcbiAgICAgIHJldHVybiBzbGlkZTtcclxuICAgIH1cclxuXHJcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINGE0L7QvSDRgtC+INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgaWYgKGRhdGEuZm9uKSB7XHJcbiAgICAgIHNsaWRlLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuZm9uICsgJyknKVxyXG4gICAgfVxyXG5cclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIGlmIChkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIHBhcmFsYXhfZ3IgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2dyb3VwXCIvPicpO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGFyYWxheC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLnBhcmFsYXhbaV0sIHBhcmFsYXhfZ3IpXHJcbiAgICAgIH1cclxuICAgICAgc2xpZGUuYXBwZW5kKHBhcmFsYXhfZ3IpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGZpeCA9ICQoJzxkaXYgY2xhc3M9XCJmaXhlZF9ncm91cFwiLz4nKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICBhZGRTdGF0aWNMYXllcihkYXRhLmZpeGVkW2ldLCBmaXgpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRvcF9ibGsgPSAkKFwiPGRpdiBjbGFzcz0nZml4ZWRfX2xheWVyJy8+XCIpO1xyXG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5idXR0b24ucG9zXSk7XHJcbiAgICB2YXIgYnV0ID0gJChcIjxhIGNsYXNzPSdzbGlkZXJfX2hyZWYnLz5cIik7XHJcbiAgICBidXQuYXR0cignaHJlZicsIGRhdGEuYnV0dG9uLmhyZWYpO1xyXG4gICAgYnV0LnRleHQoZGF0YS5idXR0b24udGV4dCk7XHJcbiAgICBidXQuYWRkQ2xhc3MoZGF0YS5idXR0b24uY29sb3IpO1xyXG4gICAgZG9wX2JsayA9IGFkZF9hbmltYXRpb24oZG9wX2JsaywgZGF0YS5idXR0b24pO1xyXG4gICAgZG9wX2Jsay5maW5kKCdkaXYnKS5hcHBlbmQoYnV0KTtcclxuICAgIGZpeC5hcHBlbmQoZG9wX2Jsayk7XHJcblxyXG4gICAgc2xpZGUuYXBwZW5kKGZpeCk7XHJcbiAgICByZXR1cm4gc2xpZGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRQYXJhbGF4TGF5ZXIoZGF0YSwgcGFyYWxheF9ncikge1xyXG4gICAgdmFyIHBhcmFsbGF4X2xheWVyID0gJCgnPGRpdiBjbGFzcz1cInBhcmFsbGF4X19sYXllclwiXFw+Jyk7XHJcbiAgICBwYXJhbGxheF9sYXllci5hdHRyKCd6JywgZGF0YS56IHx8IGkgKiAxMCk7XHJcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8c3BhbiBjbGFzcz0nc2xpZGVyX190ZXh0Jy8+XCIpO1xyXG4gICAgaWYgKGRhdGEucG9zKSB7XHJcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XHJcbiAgICB9XHJcbiAgICBkb3BfYmxrLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcclxuICAgIHBhcmFsbGF4X2xheWVyLmFwcGVuZChkb3BfYmxrKTtcclxuICAgIHBhcmFsYXhfZ3IuYXBwZW5kKHBhcmFsbGF4X2xheWVyKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCwgYmVmb3JfYnV0dG9uKSB7XHJcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XHJcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLnBvc10pO1xyXG4gICAgaWYgKGRhdGEuZnVsbF9oZWlnaHQpIHtcclxuICAgICAgZG9wX2Jsay5hZGRDbGFzcygnZml4ZWRfX2Z1bGwtaGVpZ2h0Jyk7XHJcbiAgICB9XHJcbiAgICBkb3BfYmxrID0gYWRkX2FuaW1hdGlvbihkb3BfYmxrLCBkYXRhKTtcclxuICAgIGRvcF9ibGsuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcclxuXHJcbiAgICBpZiAoYmVmb3JfYnV0dG9uKSB7XHJcbiAgICAgIGZpeC5maW5kKCcuc2xpZGVyX19ocmVmJykuY2xvc2VzdCgnLmZpeGVkX19sYXllcicpLmJlZm9yZShkb3BfYmxrKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZml4LmFwcGVuZChkb3BfYmxrKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcclxuICAgIGlmICgkKCcjbWVnYV9zbGlkZXInKS5oYXNDbGFzcygnc3RvcF9zbGlkZScpKXJldHVybjtcclxuXHJcbiAgICB2YXIgc2xpZGVfcG9pbnRzID0gJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlX3NlbGVjdCcpXHJcbiAgICB2YXIgc2xpZGVfY250ID0gc2xpZGVfcG9pbnRzLmxlbmd0aDtcclxuICAgIHZhciBhY3RpdmUgPSAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVyLWFjdGl2ZScpLmluZGV4KCkgKyAxO1xyXG4gICAgaWYgKGFjdGl2ZSA+PSBzbGlkZV9jbnQpYWN0aXZlID0gMDtcclxuICAgIHNsaWRlX3BvaW50cy5lcShhY3RpdmUpLmNsaWNrKCk7XHJcblxyXG4gICAgdGltZW91dElkPXNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbWdfdG9fbG9hZChzcmMpIHtcclxuICAgIHZhciBpbWcgPSAkKCc8aW1nLz4nKTtcclxuICAgIGltZy5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgdG90X2ltZ193YWl0LS07XHJcblxyXG4gICAgICBpZiAodG90X2ltZ193YWl0ID09IDApIHtcclxuXHJcbiAgICAgICAgc2xpZGVzLmFwcGVuZChnZW5lcmF0ZV9zbGlkZShzbGlkZXJfZGF0YVtyZW5kZXJfc2xpZGVfbm9tXSkpO1xyXG4gICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcShyZW5kZXJfc2xpZGVfbm9tKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuXHJcbiAgICAgICAgaWYgKHJlbmRlcl9zbGlkZV9ub20gPT0gMCkge1xyXG4gICAgICAgICAgc2xpZGVzLmZpbmQoJy5zbGlkZScpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgaWYgKCFlZGl0b3IpIHtcclxuICAgICAgICAgICAgaWYodGltZW91dElkKWNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xyXG4gICAgICAgICAgICB0aW1lb3V0SWQ9c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuZmlyc3Rfc2hvdycpLnJlbW92ZUNsYXNzKCdmaXJzdF9zaG93Jyk7XHJcbiAgICAgICAgICAgIH0uYmluZChzbGlkZXMpLCBzY3JvbGxfcGVyaW9kKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAobW9iaWxlX21vZGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHBhcmFsbGF4X2dyb3VwID0gJChjb250YWluZXJfaWQgKyAnIC5zbGlkZXItYWN0aXZlIC5wYXJhbGxheF9fZ3JvdXA+KicpO1xyXG4gICAgICAgICAgICBwYXJhbGxheF9jb3VudGVyID0gMDtcclxuICAgICAgICAgICAgcGFyYWxsYXhfdGltZXIgPSBzZXRJbnRlcnZhbChyZW5kZXIsIDEwMCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGVkaXRvcikge1xyXG4gICAgICAgICAgICBpbml0X2VkaXRvcigpXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZih0aW1lb3V0SWQpY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XHJcblxyXG4gICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCcpLm9uKCdjbGljaycsICcuc2xpZGVfc2VsZWN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdzbGlkZXItYWN0aXZlJykpcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkdGhpcy5pbmRleCgpO1xyXG4gICAgICAgICAgICAgICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGUnKS5lcShpbmRleCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuaG92ZXIoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIGlmKHRpbWVvdXRJZCljbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5hZGRDbGFzcygnc3RvcF9zbGlkZScpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcclxuICAgICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5yZW1vdmVDbGFzcygnc3RvcF9zbGlkZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlbmRlcl9zbGlkZV9ub20rKztcclxuICAgICAgICBpZiAocmVuZGVyX3NsaWRlX25vbSA8IHNsaWRlcl9kYXRhLmxlbmd0aCkge1xyXG4gICAgICAgICAgbG9hZF9zbGlkZV9pbWcoKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSkub24oJ2Vycm9yJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB0b3RfaW1nX3dhaXQtLTtcclxuICAgIH0pO1xyXG4gICAgaW1nLnByb3AoJ3NyYycsIHNyYyk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBsb2FkX3NsaWRlX2ltZygpIHtcclxuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbcmVuZGVyX3NsaWRlX25vbV07XHJcbiAgICB0b3RfaW1nX3dhaXQgPSAxO1xyXG5cclxuICAgIGlmIChtb2JpbGVfbW9kZSA9PT0gZmFsc2UpIHtcclxuICAgICAgdG90X2ltZ193YWl0Kys7XHJcbiAgICAgIGltZ190b19sb2FkKGRhdGEuZm9uKTtcclxuICAgICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgICBpZiAoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEucGFyYWxheC5sZW5ndGg7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnBhcmFsYXgubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEucGFyYWxheFtpXS5pbWcpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChkYXRhLmZpeGVkICYmIGRhdGEuZml4ZWQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRvdF9pbWdfd2FpdCArPSBkYXRhLmZpeGVkLmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuZml4ZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEuZml4ZWRbaV0uaW1nKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGltZ190b19sb2FkKGRhdGEubW9iaWxlKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN0YXJ0X2luaXRfc2xpZGUoZGF0YSkge1xyXG4gICAgdmFyIG4gPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIHZhciBpbWcgPSAkKCc8aW1nLz4nKTtcclxuICAgIGltZy5hdHRyKCd0aW1lJywgbik7XHJcblxyXG4gICAgZnVuY3Rpb24gb25faW1nX2xvYWQoKSB7XHJcbiAgICAgIHZhciBuID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgIGltZyA9ICQodGhpcyk7XHJcbiAgICAgIG4gPSBuIC0gcGFyc2VJbnQoaW1nLmF0dHIoJ3RpbWUnKSk7XHJcbiAgICAgIGlmIChuID4gbWF4X3RpbWVfbG9hZF9waWMpIHtcclxuICAgICAgICBtb2JpbGVfbW9kZSA9IHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIG1heF9zaXplID0gKHNjcmVlbi5oZWlnaHQgPiBzY3JlZW4ud2lkdGggPyBzY3JlZW4uaGVpZ2h0IDogc2NyZWVuLndpZHRoKTtcclxuICAgICAgICBpZiAobWF4X3NpemUgPCBtb2JpbGVfc2l6ZSkge1xyXG4gICAgICAgICAgbW9iaWxlX21vZGUgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtb2JpbGVfbW9kZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAobW9iaWxlX21vZGUgPT0gdHJ1ZSkge1xyXG4gICAgICAgICQoY29udGFpbmVyX2lkKS5hZGRDbGFzcygnbW9iaWxlX21vZGUnKVxyXG4gICAgICB9XHJcbiAgICAgIHJlbmRlcl9zbGlkZV9ub20gPSAwO1xyXG4gICAgICBsb2FkX3NsaWRlX2ltZygpO1xyXG4gICAgICAkKCcuc2stZm9sZGluZy1jdWJlJykucmVtb3ZlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGltZy5vbignbG9hZCcsIG9uX2ltZ19sb2FkKCkpO1xyXG4gICAgaWYgKHNsaWRlcl9kYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gc2xpZGVyX2RhdGFbMF0ubW9iaWxlICsgJz9yPScgKyBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICBpbWcucHJvcCgnc3JjJywgc2xpZGVyX2RhdGFbMF0ubW9iaWxlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG9uX2ltZ19sb2FkKCkuYmluZChpbWcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdChkYXRhLCBlZGl0b3JfaW5pdCkge1xyXG4gICAgc2xpZGVyX2RhdGEgPSBkYXRhO1xyXG4gICAgZWRpdG9yID0gZWRpdG9yX2luaXQ7XHJcbiAgICAvL9C90LDRhdC+0LTQuNC8INC60L7QvdGC0LXQudC90LXRgCDQuCDQvtGH0LjRidCw0LXQvCDQtdCz0L5cclxuICAgIHZhciBjb250YWluZXIgPSAkKGNvbnRhaW5lcl9pZCk7XHJcbiAgICBjb250YWluZXIuaHRtbCgnJyk7XHJcblxyXG4gICAgLy/RgdC+0LfQttCw0LXQvCDQsdCw0LfQvtCy0YvQtSDQutC+0L3RgtC10LnQvdC10YDRiyDQtNC70Y8g0YHQsNC80LjRhSDRgdC70LDQudC00L7QsiDQuCDQtNC70Y8g0L/QtdGA0LXQutC70Y7Rh9Cw0YLQtdC70LXQuVxyXG4gICAgc2xpZGVzID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAnY2xhc3MnOiAnc2xpZGVzJ1xyXG4gICAgfSk7XHJcbiAgICB2YXIgc2xpZGVfY29udHJvbCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgJ2NsYXNzJzogJ3NsaWRlX2NvbnRyb2wnXHJcbiAgICB9KTtcclxuICAgIHNsaWRlX3NlbGVjdF9ib3ggPSAkKCc8dWwvPicsIHtcclxuICAgICAgJ2NsYXNzJzogJ3NsaWRlX3NlbGVjdF9ib3gnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQuNC90LTQuNC60LDRgtC+0YAg0LfQsNCz0YDRg9C30LrQuFxyXG4gICAgdmFyIGwgPSAnPGRpdiBjbGFzcz1cInNrLWZvbGRpbmctY3ViZVwiPicgK1xyXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUxIHNrLWN1YmVcIj48L2Rpdj4nICtcclxuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMiBzay1jdWJlXCI+PC9kaXY+JyArXHJcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTQgc2stY3ViZVwiPjwvZGl2PicgK1xyXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUzIHNrLWN1YmVcIj48L2Rpdj4nICtcclxuICAgICAgJzwvZGl2Pic7XHJcbiAgICBjb250YWluZXIuaHRtbChsKTtcclxuXHJcblxyXG4gICAgc3RhcnRfaW5pdF9zbGlkZShkYXRhWzBdKTtcclxuXHJcbiAgICAvL9Cz0LXQvdC10YDQuNGA0YPQtdC8INC60L3QvtC/0LrQuCDQuCDRgdC70LDQudC00YtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAvL3NsaWRlcy5hcHBlbmQoZ2VuZXJhdGVfc2xpZGUoZGF0YVtpXSkpO1xyXG4gICAgICBzbGlkZV9zZWxlY3RfYm94LmFwcGVuZCgnPGxpIGNsYXNzPVwic2xpZGVfc2VsZWN0IGRpc2FibGVkXCIvPicpXHJcbiAgICB9XHJcblxyXG4gICAgLypzbGlkZXMuZmluZCgnLnNsaWRlJykuZXEoMClcclxuICAgICAuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKVxyXG4gICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpO1xyXG4gICAgIHNsaWRlX2NvbnRyb2wuZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpOyovXHJcblxyXG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZXMpO1xyXG4gICAgc2xpZGVfY29udHJvbC5hcHBlbmQoc2xpZGVfc2VsZWN0X2JveCk7XHJcbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlX2NvbnRyb2wpO1xyXG5cclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICBpZiAoIXBhcmFsbGF4X2dyb3VwKXJldHVybiBmYWxzZTtcclxuICAgIHZhciBwYXJhbGxheF9rID0gKHBhcmFsbGF4X2NvdW50ZXIgLSAxMCkgLyAyO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYWxsYXhfZ3JvdXAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gcGFyYWxsYXhfZ3JvdXAuZXEoaSk7XHJcbiAgICAgIHZhciBqID0gZWwuYXR0cigneicpO1xyXG4gICAgICB2YXIgdHIgPSAncm90YXRlM2QoMC4xLDAuOCwwLCcgKyAocGFyYWxsYXhfaykgKyAnZGVnKSBzY2FsZSgnICsgKDEgKyBqICogMC41KSArICcpIHRyYW5zbGF0ZVooLScgKyAoMTAgKyBqICogMjApICsgJ3B4KSc7XHJcbiAgICAgIGVsLmNzcygndHJhbnNmb3JtJywgdHIpXHJcbiAgICB9XHJcbiAgICBwYXJhbGxheF9jb3VudGVyICs9IHBhcmFsbGF4X2QgKiAwLjE7XHJcbiAgICBpZiAocGFyYWxsYXhfY291bnRlciA+PSAyMClwYXJhbGxheF9kID0gLXBhcmFsbGF4X2Q7XHJcbiAgICBpZiAocGFyYWxsYXhfY291bnRlciA8PSAwKXBhcmFsbGF4X2QgPSAtcGFyYWxsYXhfZDtcclxuICB9XHJcblxyXG4gIGluaXRJbWFnZVNlcnZlclNlbGVjdCgkKCcuZmlsZVNlbGVjdCcpKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGluaXQ6IGluaXRcclxuICB9O1xyXG59KCkpO1xyXG4iLCJ2YXIgaGVhZGVyQWN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgc2Nyb2xsZWREb3duID0gZmFsc2U7XHJcbiAgdmFyIHNoYWRvd2VkRG93biA9IGZhbHNlO1xyXG5cclxuICAkKCcubWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xyXG4gICAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgJCgnLmRyb3AtbWVudScpLnJlbW92ZUNsYXNzKCdvcGVuJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJykuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgaWYgKCQoJy5oZWFkZXInKS5oYXNDbGFzcygnaGVhZGVyX29wZW4tbWVudScpKSB7XHJcbiAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XHJcbiAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcuc2VhcmNoLXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgJCgnLmhlYWRlcicpLnRvZ2dsZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcclxuICAgICQoJyNhdXRvY29tcGxldGUnKS5mYWRlT3V0KCk7XHJcbiAgICBpZiAoJCgnLmhlYWRlcicpLmhhc0NsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKSkge1xyXG4gICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnI2hlYWRlcicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoZS50YXJnZXQuaWQgPT0gJ2hlYWRlcicpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcclxuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCh0aGlzKS5jbG9zZXN0KCdmb3JtJykuc3VibWl0KCk7XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItc2Vjb25kbGluZV9jbG9zZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xyXG4gIH0pO1xyXG5cclxuICAkKCcuaGVhZGVyLXVwbGluZScpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKCFzY3JvbGxlZERvd24pcmV0dXJuO1xyXG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgMTAyNCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxuICB9KTtcclxuXHJcbiAgJCh3aW5kb3cpLm9uKCdsb2FkIHJlc2l6ZSBzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2hhZG93SGVpZ2h0ID0gNTA7XHJcbiAgICB2YXIgaGlkZUhlaWdodCA9IDIwMDtcclxuICAgIHZhciBoZWFkZXJTZWNvbmRMaW5lID0gJCgnLmhlYWRlci1zZWNvbmRsaW5lJyk7XHJcbiAgICB2YXIgaG92ZXJzID0gaGVhZGVyU2Vjb25kTGluZS5maW5kKCc6aG92ZXInKTtcclxuICAgIHZhciBoZWFkZXIgPSAkKCcuaGVhZGVyJyk7XHJcblxyXG4gICAgaWYgKCFob3ZlcnMubGVuZ3RoKSB7XHJcbiAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgICAgaGVhZGVyLnJlbW92ZUNsYXNzKCdzY3JvbGxhYmxlJyk7XHJcbiAgICAgIC8vZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxyXG4gICAgICB2YXIgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG4gICAgICBpZiAoc2Nyb2xsVG9wID4gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gZmFsc2UpIHtcclxuICAgICAgICBzaGFkb3dlZERvd24gPSB0cnVlO1xyXG4gICAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3NoYWRvd2VkJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNjcm9sbFRvcCA8PSBzaGFkb3dIZWlnaHQgJiYgc2hhZG93ZWREb3duID09PSB0cnVlKSB7XHJcbiAgICAgICAgc2hhZG93ZWREb3duID0gZmFsc2U7XHJcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2hhZG93ZWQnKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoc2Nyb2xsVG9wID4gaGlkZUhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgc2Nyb2xsZWREb3duID0gdHJ1ZTtcclxuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzY3JvbGwtZG93bicpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzY3JvbGxUb3AgPD0gaGlkZUhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IHRydWUpIHtcclxuICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzY3JvbGwtZG93bicpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XHJcbiAgICAgIGhlYWRlci5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcubWVudV9hbmdsZS1kb3duLCAuZHJvcC1tZW51X2dyb3VwX191cC1oZWFkZXInKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyIG1lbnVPcGVuID0gJCh0aGlzKS5jbG9zZXN0KCcuaGVhZGVyX29wZW4tbWVudSwgLmNhdGFsb2ctY2F0ZWdvcmllcycpO1xyXG4gICAgaWYgKCFtZW51T3Blbi5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgcGFyZW50ID0gJCh0aGlzKS5jbG9zZXN0KCcuZHJvcC1tZW51X2dyb3VwX191cCwgLm1lbnUtZ3JvdXAnKTtcclxuICAgIHZhciBwYXJlbnRNZW51ID0gJCh0aGlzKS5jbG9zZXN0KCcuZHJvcC1tZW51Jyk7XHJcbiAgICBpZiAocGFyZW50TWVudSkge1xyXG4gICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgIH1cclxuICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICQocGFyZW50KS50b2dnbGVDbGFzcygnb3BlbicpO1xyXG4gICAgICBpZiAocGFyZW50Lmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgICAgICAkKHBhcmVudCkucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLmFkZENsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgIGlmIChwYXJlbnRNZW51KSB7XHJcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLmFkZENsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5hZGRDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgIGlmIChwYXJlbnRNZW51KSB7XHJcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcblxyXG4gIHZhciBhY2NvdW50TWVudVRpbWVPdXQgPSBudWxsO1xyXG4gIHZhciBhY2NvdW50TWVudU9wZW5UaW1lID0gMDtcclxuICB2YXIgYWNjb3VudE1lbnUgPSAkKCcuYWNjb3VudC1tZW51Jyk7XHJcblxyXG4gICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IDEwMjQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XHJcbiAgICB2YXIgdGhhdCA9ICQodGhpcyk7XHJcblxyXG4gICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xyXG5cclxuICAgIGlmIChhY2NvdW50TWVudS5oYXNDbGFzcygnaGlkZGVuJykpIHtcclxuICAgICAgbWVudUFjY291bnRVcCh0aGF0KTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGF0LnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgIGFjY291bnRNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgLy/Qv9C+0LrQsNC3INC80LXQvdGOINCw0LrQutCw0YPQvdGCXHJcbiAgZnVuY3Rpb24gbWVudUFjY291bnRVcCh0b2dnbGVCdXR0b24pIHtcclxuICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcclxuICAgIHRvZ2dsZUJ1dHRvbi5hZGRDbGFzcygnb3BlbicpO1xyXG4gICAgYWNjb3VudE1lbnUucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IDEwMjQpIHtcclxuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGFjY291bnRNZW51T3BlblRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgYWNjb3VudE1lbnVUaW1lT3V0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IDEwMjQpIHtcclxuICAgICAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKChuZXcgRGF0ZSgpIC0gYWNjb3VudE1lbnVPcGVuVGltZSkgPiAxMDAwICogNykge1xyXG4gICAgICAgIGFjY291bnRNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB0b2dnbGVCdXR0b24ucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XHJcbiAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSwgMTAwMCk7XHJcbiAgfVxyXG5cclxuICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzLWFjY291bnRfbWVudS1oZWFkZXInKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgYWNjb3VudE1lbnVPcGVuVGltZSA9IG5ldyBEYXRlKCk7XHJcbiAgfSk7XHJcbiAgJCgnLmFjY291bnQtbWVudScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoJChlLnRhcmdldCkuaGFzQ2xhc3MoJ2FjY291bnQtbWVudScpKSB7XHJcbiAgICAgICQoZS50YXJnZXQpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KCk7XHJcbiIsIiQoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIHBhcnNlTnVtKHN0cikge1xyXG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoXHJcbiAgICAgIFN0cmluZyhzdHIpXHJcbiAgICAgICAgLnJlcGxhY2UoJywnLCAnLicpXHJcbiAgICAgICAgLm1hdGNoKC8tP1xcZCsoPzpcXC5cXGQrKT8vZywgJycpIHx8IDBcclxuICAgICAgLCAxMFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gICQoJy5zaG9ydC1jYWxjLWNhc2hiYWNrJykuZmluZCgnc2VsZWN0LGlucHV0Jykub24oJ2NoYW5nZSBrZXl1cCBjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcykuY2xvc2VzdCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKTtcclxuICAgIHZhciBjdXJzID0gcGFyc2VOdW0oJHRoaXMuZmluZCgnc2VsZWN0JykudmFsKCkpO1xyXG4gICAgdmFyIHZhbCA9ICR0aGlzLmZpbmQoJ2lucHV0JykudmFsKCk7XHJcbiAgICBpZiAocGFyc2VOdW0odmFsKSAhPSB2YWwpIHtcclxuICAgICAgdmFsID0gJHRoaXMuZmluZCgnaW5wdXQnKS52YWwocGFyc2VOdW0odmFsKSk7XHJcbiAgICB9XHJcbiAgICB2YWwgPSBwYXJzZU51bSh2YWwpO1xyXG5cclxuICAgIHZhciBrb2VmID0gJHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrJykudHJpbSgpO1xyXG4gICAgdmFyIHByb21vID0gJHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLXByb21vJykudHJpbSgpO1xyXG4gICAgdmFyIGN1cnJlbmN5ID0gJHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLWN1cnJlbmN5JykudHJpbSgpO1xyXG4gICAgdmFyIHJlc3VsdCA9IDA7XHJcbiAgICB2YXIgb3V0ID0gMDtcclxuXHJcbiAgICBpZiAoa29lZiA9PSBwcm9tbykge1xyXG4gICAgICBwcm9tbyA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGtvZWYuaW5kZXhPZignJScpID4gMCkge1xyXG4gICAgICByZXN1bHQgPSBwYXJzZU51bShrb2VmKSAqIHZhbCAqIGN1cnMgLyAxMDA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjdXJzID0gcGFyc2VOdW0oJHRoaXMuZmluZCgnW2NvZGU9JyArIGN1cnJlbmN5ICsgJ10nKS52YWwoKSk7XHJcbiAgICAgIHJlc3VsdCA9IHBhcnNlTnVtKGtvZWYpICogY3Vyc1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChwYXJzZU51bShwcm9tbykgPiAwKSB7XHJcbiAgICAgIGlmIChwcm9tby5pbmRleE9mKCclJykgPiAwKSB7XHJcbiAgICAgICAgcHJvbW8gPSBwYXJzZU51bShwcm9tbykgKiB2YWwgKiBjdXJzIC8gMTAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHByb21vID0gcGFyc2VOdW0ocHJvbW8pICogY3Vyc1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocHJvbW8gPiAwKSB7XHJcbiAgICAgICAgb3V0ID0gXCI8c3BhbiBjbGFzcz1vbGRfcHJpY2U+XCIgKyByZXN1bHQudG9GaXhlZCgyKSArIFwiPC9zcGFuPiBcIiArIHByb21vLnRvRml4ZWQoMik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb3V0ID0gcmVzdWx0LnRvRml4ZWQoMik7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG91dCA9IHJlc3VsdC50b0ZpeGVkKDIpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAkdGhpcy5maW5kKCcuY2FsYy1yZXN1bHRfdmFsdWUnKS5odG1sKG91dClcclxuICB9KS5jbGljaygpXHJcbn0pO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gIHZhciBlbHMgPSAkKCcuYXV0b19oaWRlX2NvbnRyb2wnKTtcclxuICBpZiAoZWxzLmxlbmd0aCA9PSAwKXJldHVybjtcclxuXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgXCIuc2Nyb2xsX2JveC1zaG93X21vcmVcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxyXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibm90aWZ5X3doaXRlIG5vdGlmeV9ub3RfYmlnXCJcclxuICAgIH07XHJcblxyXG4gICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgdmFyIGNvbnRlbnQgPSAkdGhpcy5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtJykuY2xvbmUoKTtcclxuICAgIGNvbnRlbnQgPSBjb250ZW50WzBdO1xyXG4gICAgY29udGVudC5jbGFzc05hbWUgKz0gJyBzY3JvbGxfYm94LWl0ZW0tbW9kYWwnO1xyXG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZGl2LmNsYXNzTmFtZSA9ICdjb21tZW50cyc7XHJcbiAgICBkaXYuYXBwZW5kKGNvbnRlbnQpO1xyXG4gICAgJChkaXYpLmZpbmQoJy5zY3JvbGxfYm94LXNob3dfbW9yZScpLnJlbW92ZSgpO1xyXG4gICAgJChkaXYpLmZpbmQoJy5tYXhfdGV4dF9oaWRlJylcclxuICAgICAgLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLXgyJylcclxuICAgICAgLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlJyk7XHJcbiAgICBkYXRhLnF1ZXN0aW9uID0gZGl2Lm91dGVySFRNTDtcclxuXHJcbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGhhc1Njcm9sbChlbCkge1xyXG4gICAgaWYgKCFlbCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZWwuc2Nyb2xsSGVpZ2h0ID4gZWwuY2xpZW50SGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVidWlsZCgpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBlbCA9IGVscy5lcShpKTtcclxuICAgICAgdmFyIGlzX2hpZGUgPSBmYWxzZTtcclxuICAgICAgaWYgKGVsLmhlaWdodCgpIDwgMTApIHtcclxuICAgICAgICBpc19oaWRlID0gdHJ1ZTtcclxuICAgICAgICBlbC5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtLWhpZGUnKS5zaG93KDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgdGV4dCA9IGVsLmZpbmQoJy5zY3JvbGxfYm94LXRleHQnKTtcclxuICAgICAgdmFyIGFuc3dlciA9IGVsLmZpbmQoJy5zY3JvbGxfYm94LWFuc3dlcicpO1xyXG4gICAgICB2YXIgc2hvd19tb3JlID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtc2hvd19tb3JlJyk7XHJcblxyXG4gICAgICB2YXIgc2hvd19idG4gPSBmYWxzZTtcclxuICAgICAgaWYgKGhhc1Njcm9sbCh0ZXh0WzBdKSkge1xyXG4gICAgICAgIHNob3dfYnRuID0gdHJ1ZTtcclxuICAgICAgICB0ZXh0LnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0ZXh0LmFkZENsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFuc3dlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgLy/QtdGB0YLRjCDQvtGC0LLQtdGCINCw0LTQvNC40L3QsFxyXG4gICAgICAgIGlmIChoYXNTY3JvbGwoYW5zd2VyWzBdKSkge1xyXG4gICAgICAgICAgc2hvd19idG4gPSB0cnVlO1xyXG4gICAgICAgICAgYW5zd2VyLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYW5zd2VyLmFkZENsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzaG93X2J0bikge1xyXG4gICAgICAgIHNob3dfbW9yZS5zaG93KCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2hvd19tb3JlLmhpZGUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGlzX2hpZGUpIHtcclxuICAgICAgICBlbC5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtLWhpZGUnKS5oaWRlKDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkKHdpbmRvdykucmVzaXplKHJlYnVpbGQpO1xyXG4gIHJlYnVpbGQoKTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5zaG93X2FsbCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgY2xzID0gJCh0aGlzKS5kYXRhKCdjbnRybC1jbGFzcycpO1xyXG4gICAgJCgnLmhpZGVfYWxsW2RhdGEtY250cmwtY2xhc3NdJykuc2hvdygpO1xyXG4gICAgJCh0aGlzKS5oaWRlKCk7XHJcbiAgICAkKCcuJyArIGNscykuc2hvdygpO1xyXG4gIH0pO1xyXG5cclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5oaWRlX2FsbCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgY2xzID0gJCh0aGlzKS5kYXRhKCdjbnRybC1jbGFzcycpO1xyXG4gICAgJCgnLnNob3dfYWxsW2RhdGEtY250cmwtY2xhc3NdJykuc2hvdygpO1xyXG4gICAgJCh0aGlzKS5oaWRlKCk7XHJcbiAgICAkKCcuJyArIGNscykuaGlkZSgpO1xyXG4gIH0pO1xyXG59KSgpO1xyXG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gZGVjbE9mTnVtKG51bWJlciwgdGl0bGVzKSB7XHJcbiAgICBjYXNlcyA9IFsyLCAwLCAxLCAxLCAxLCAyXTtcclxuICAgIHJldHVybiB0aXRsZXNbKG51bWJlciAlIDEwMCA+IDQgJiYgbnVtYmVyICUgMTAwIDwgMjApID8gMiA6IGNhc2VzWyhudW1iZXIgJSAxMCA8IDUpID8gbnVtYmVyICUgMTAgOiA1XV07XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmaXJzdFplcm8odikge1xyXG4gICAgdiA9IE1hdGguZmxvb3Iodik7XHJcbiAgICBpZiAodiA8IDEwKVxyXG4gICAgICByZXR1cm4gJzAnICsgdjtcclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuIHY7XHJcbiAgfVxyXG5cclxuICB2YXIgY2xvY2tzID0gJCgnLmNsb2NrJyk7XHJcbiAgaWYgKGNsb2Nrcy5sZW5ndGggPiAwKSB7XHJcbiAgICBmdW5jdGlvbiB1cGRhdGVDbG9jaygpIHtcclxuICAgICAgdmFyIGNsb2NrcyA9ICQodGhpcyk7XHJcbiAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsb2Nrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBjID0gY2xvY2tzLmVxKGkpO1xyXG4gICAgICAgIHZhciBlbmQgPSBuZXcgRGF0ZShjLmRhdGEoJ2VuZCcpLnJlcGxhY2UoLy0vZywgXCIvXCIpKTtcclxuICAgICAgICB2YXIgZCA9IChlbmQuZ2V0VGltZSgpIC0gbm93LmdldFRpbWUoKSkgLyAxMDAwO1xyXG5cclxuICAgICAgICAvL9C10YHQu9C4INGB0YDQvtC6INC/0YDQvtGI0LXQu1xyXG4gICAgICAgIGlmIChkIDw9IDApIHtcclxuICAgICAgICAgIGMudGV4dChsZyhcInByb21vY29kZV9leHBpcmVzXCIpKTtcclxuICAgICAgICAgIGMuYWRkQ2xhc3MoJ2Nsb2NrLWV4cGlyZWQnKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy/QtdGB0LvQuCDRgdGA0L7QuiDQsdC+0LvQtdC1IDMwINC00L3QtdC5XHJcbiAgICAgICAgaWYgKGQgPiAzMCAqIDYwICogNjAgKiAyNCkge1xyXG4gICAgICAgICAgYy5odG1sKGxnKCBcInByb21vY29kZV9sZWZ0XzMwX2RheXNcIikpO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcyA9IGQgJSA2MDtcclxuICAgICAgICBkID0gKGQgLSBzKSAvIDYwO1xyXG4gICAgICAgIHZhciBtID0gZCAlIDYwO1xyXG4gICAgICAgIGQgPSAoZCAtIG0pIC8gNjA7XHJcbiAgICAgICAgdmFyIGggPSBkICUgMjQ7XHJcbiAgICAgICAgZCA9IChkIC0gaCkgLyAyNDtcclxuXHJcbiAgICAgICAgdmFyIHN0ciA9IGZpcnN0WmVybyhoKSArIFwiOlwiICsgZmlyc3RaZXJvKG0pICsgXCI6XCIgKyBmaXJzdFplcm8ocyk7XHJcbiAgICAgICAgaWYgKGQgPiAwKSB7XHJcbiAgICAgICAgICBzdHIgPSBkICsgXCIgXCIgKyBkZWNsT2ZOdW0oZCwgW2xnKFwiZGF5X2Nhc2VfMFwiKSwgbGcoXCJkYXlfY2FzZV8xXCIpLCBsZyhcImRheV9jYXNlXzJcIildKSArIFwiICBcIiArIHN0cjtcclxuICAgICAgICB9XHJcbiAgICAgICAgYy5odG1sKFwi0J7RgdGC0LDQu9C+0YHRjDogPHNwYW4+XCIgKyBzdHIgKyBcIjwvc3Bhbj5cIik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRJbnRlcnZhbCh1cGRhdGVDbG9jay5iaW5kKGNsb2NrcyksIDEwMDApO1xyXG4gICAgdXBkYXRlQ2xvY2suYmluZChjbG9ja3MpKCk7XHJcbiAgfVxyXG59KTtcclxuIiwidmFyIGNhdGFsb2dUeXBlU3dpdGNoZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIGNhdGFsb2cgPSAkKCcuY2F0YWxvZ19saXN0Jyk7XHJcbiAgaWYgKGNhdGFsb2cubGVuZ3RoID09IDApcmV0dXJuO1xyXG5cclxuICAkKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLmZpbmQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbicpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XHJcbiAgICAkKHRoaXMpLmFkZENsYXNzKCdjaGVja2VkJyk7XHJcbiAgICBpZiAoY2F0YWxvZykge1xyXG4gICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykpIHtcclxuICAgICAgICBjYXRhbG9nLnJlbW92ZUNsYXNzKCduYXJyb3cnKTtcclxuICAgICAgICBzZXRDb29raWUoJ2NvdXBvbnNfdmlldycsICcnKVxyXG4gICAgICB9XHJcbiAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdjYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLW5hcnJvdycpKSB7XHJcbiAgICAgICAgY2F0YWxvZy5hZGRDbGFzcygnbmFycm93Jyk7XHJcbiAgICAgICAgc2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnLCAnbmFycm93Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgaWYgKGdldENvb2tpZSgnY291cG9uc192aWV3JykgPT0gJ25hcnJvdycgJiYgIWNhdGFsb2cuaGFzQ2xhc3MoJ25hcnJvd19vZmYnKSkge1xyXG4gICAgY2F0YWxvZy5hZGRDbGFzcygnbmFycm93Jyk7XHJcbiAgICAkKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1uYXJyb3cnKS5hZGRDbGFzcygnY2hlY2tlZCcpO1xyXG4gICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbGlzdCcpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XHJcbiAgfVxyXG59KCk7XHJcbiIsIiQoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5zZC1zZWxlY3Qtc2VsZWN0ZWQnKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcclxuICAgIHZhciBkcm9wQmxvY2sgPSAkKHBhcmVudCkuZmluZCgnLnNkLXNlbGVjdC1kcm9wJyk7XHJcblxyXG4gICAgaWYgKGRyb3BCbG9jay5pcygnOmhpZGRlbicpKSB7XHJcbiAgICAgIGRyb3BCbG9jay5zbGlkZURvd24oKTtcclxuXHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgaWYgKCFwYXJlbnQuaGFzQ2xhc3MoJ2xpbmtlZCcpKSB7XHJcblxyXG4gICAgICAgICQoJy5zZC1zZWxlY3QtZHJvcCcpLmZpbmQoJ2EnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG5cclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIHZhciBzZWxlY3RSZXN1bHQgPSAkKHRoaXMpLmh0bWwoKTtcclxuXHJcbiAgICAgICAgICAkKHBhcmVudCkuZmluZCgnaW5wdXQnKS52YWwoc2VsZWN0UmVzdWx0KTtcclxuXHJcbiAgICAgICAgICAkKHBhcmVudCkuZmluZCgnLnNkLXNlbGVjdC1zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5odG1sKHNlbGVjdFJlc3VsdCk7XHJcblxyXG4gICAgICAgICAgZHJvcEJsb2NrLnNsaWRlVXAoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICBkcm9wQmxvY2suc2xpZGVVcCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG5cclxufSk7XHJcbiIsInNlYXJjaCA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgb3BlbkF1dG9jb21wbGV0ZTtcclxuXHJcbiAgJCgnLnNlYXJjaC1mb3JtLWlucHV0Jykub24oJ2lucHV0JywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgIHZhciBxdWVyeSA9ICR0aGlzLnZhbCgpO1xyXG4gICAgdmFyIGRhdGEgPSAkdGhpcy5jbG9zZXN0KCdmb3JtJykuc2VyaWFsaXplKCk7XHJcbiAgICB2YXIgYXV0b2NvbXBsZXRlID0gJHRoaXMuY2xvc2VzdCgnLnN0b3Jlc19zZWFyY2gnKS5maW5kKCcuYXV0b2NvbXBsZXRlLXdyYXAnKTsvLyAkKCcjYXV0b2NvbXBsZXRlJyksXHJcbiAgICB2YXIgYXV0b2NvbXBsZXRlTGlzdCA9ICQoYXV0b2NvbXBsZXRlKS5maW5kKCd1bCcpO1xyXG4gICAgb3BlbkF1dG9jb21wbGV0ZSA9IGF1dG9jb21wbGV0ZTtcclxuICAgIGlmIChxdWVyeS5sZW5ndGggPiAxKSB7XHJcbiAgICAgIHVybCA9ICR0aGlzLmNsb3Nlc3QoJ2Zvcm0nKS5hdHRyKCdhY3Rpb24nKSB8fCAnL3NlYXJjaCc7XHJcbiAgICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgdHlwZTogJ2dldCcsXHJcbiAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucykge1xyXG4gICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgJChhdXRvY29tcGxldGVMaXN0KS5odG1sKCcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGlmKGxhbmdbXCJocmVmX3ByZWZpeFwiXS5sZW5ndGg+MCAmJiBpdGVtLmRhdGEucm91dGUuaW5kZXhPZihsYW5nW1wiaHJlZl9wcmVmaXhcIl0pPT0tMSl7XHJcbiAgICAgICAgICAgICAgICAgIGl0ZW0uZGF0YS5yb3V0ZT0nLycrbGFuZ1tcImhyZWZfcHJlZml4XCJdK2l0ZW0uZGF0YS5yb3V0ZTtcclxuICAgICAgICAgICAgICAgICAgaXRlbS5kYXRhLnJvdXRlPWl0ZW0uZGF0YS5yb3V0ZS5yZXBsYWNlKCcvLycsJy8nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBodG1sID0gJzxhIGNsYXNzPVwiYXV0b2NvbXBsZXRlX2xpbmtcIiBocmVmPVwiJyArIGl0ZW0uZGF0YS5yb3V0ZSArICdcIicgKyAnPicgKyBpdGVtLnZhbHVlICsgaXRlbS5jYXNoYmFjayArICc8L2E+JztcclxuICAgICAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICAgICAgICAgICAgICBsaS5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGVMaXN0KS5hcHBlbmQobGkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlSW4oKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xyXG4gICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuaHRtbCgnJyk7XHJcbiAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pLm9uKCdmb2N1c291dCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoISQoZS5yZWxhdGVkVGFyZ2V0KS5oYXNDbGFzcygnYXV0b2NvbXBsZXRlX2xpbmsnKSkge1xyXG4gICAgICAvLyQoJyNhdXRvY29tcGxldGUnKS5oaWRlKCk7XHJcbiAgICAgICQob3BlbkF1dG9jb21wbGV0ZSkuZGVsYXkoMTAwKS5zbGlkZVVwKDEwMClcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnYm9keScpLm9uKCdzdWJtaXQnLCAnLnN0b3Jlcy1zZWFyY2hfZm9ybScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgdmFsID0gJCh0aGlzKS5maW5kKCcuc2VhcmNoLWZvcm0taW5wdXQnKS52YWwoKTtcclxuICAgIGlmICh2YWwubGVuZ3RoIDwgMikge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5mb3JtLXBvcHVwLXNlbGVjdCBsaScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgdmFyIGhpZGRlbiA9ICQodGhpcykuZGF0YSgnaWQyJyk7XHJcbiAgICAkKCcjJytoaWRkZW4pLmF0dHIoJ3ZhbHVlJywgJCh0aGlzKS5kYXRhKCd2YWx1ZTInKSk7XHJcbiAgICB2YXIgdGV4dCA9ICQodGhpcykuZGF0YSgnaWQxJyk7XHJcbiAgICAkKCcjJyt0ZXh0KS5odG1sKCQodGhpcykuZGF0YSgndmFsdWUxJykpO1xyXG4gICAgdmFyIHNlYXJjaHRleHQgPSAkKHRoaXMpLmRhdGEoJ2lkMycpO1xyXG4gICAgJCgnIycrc2VhcmNodGV4dCkuYXR0cigncGxhY2Vob2xkZXInLCAkKHRoaXMpLmRhdGEoJ3ZhbHVlMycpKTtcclxuXHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5oZWFkZXItc2VhcmNoX2Zvcm0tZ3JvdXAnKS5maW5kKCcuaGVhZGVyLXNlYXJjaF9mb3JtLWlucHV0LW1vZHVsZS1sYWJlbCcpLmFkZENsYXNzKCdjbG9zZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dC1tb2R1bGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuaGVhZGVyLXNlYXJjaF9mb3JtLWlucHV0LW1vZHVsZS1sYWJlbCcpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dC1tb2R1bGUtbGFiZWwnKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gIH0pO1xyXG5cclxuXHJcblxyXG59KCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICQoJy5jb3Vwb25zLWxpc3RfaXRlbS1jb250ZW50LWdvdG8tcHJvbW9jb2RlLWxpbmsnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyIHRoYXQgPSAkKHRoaXMpO1xyXG4gICAgdmFyIGV4cGlyZWQgPSB0aGF0LmNsb3Nlc3QoJy5jb3Vwb25zLWxpc3RfaXRlbScpLmZpbmQoJy5jbG9jay1leHBpcmVkJyk7XHJcbiAgICB2YXIgdXNlcklkID0gJCh0aGF0KS5kYXRhKCd1c2VyJyk7XHJcbiAgICB2YXIgaW5hY3RpdmUgPSAkKHRoYXQpLmRhdGEoJ2luYWN0aXZlJyk7XHJcbiAgICB2YXIgZGF0YV9tZXNzYWdlID0gJCh0aGF0KS5kYXRhKCdtZXNzYWdlJyk7XHJcblxyXG4gICAgaWYgKGluYWN0aXZlKSB7XHJcbiAgICAgIHZhciB0aXRsZSA9IGRhdGFfbWVzc2FnZSA/IGRhdGFfbWVzc2FnZSA6IGxnKFwicHJvbW9jb2RlX2lzX2luYWN0aXZlXCIpO1xyXG4gICAgICB2YXIgbWVzc2FnZSA9IGxnKFwicHJvbW9jb2RlX3ZpZXdfYWxsXCIse1widXJsXCI6XCIvXCIrbGFuZ1tcImhyZWZfcHJlZml4XCJdK1wiY291cG9uc1wifSk7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XHJcbiAgICAgICAgJ3RpdGxlJzogdGl0bGUsXHJcbiAgICAgICAgJ3F1ZXN0aW9uJzogbWVzc2FnZSxcclxuICAgICAgICAnYnV0dG9uWWVzJzogJ09rJyxcclxuICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcclxuICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2UgaWYgKGV4cGlyZWQubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgdGl0bGUgPSBsZyhcInByb21vY29kZV9pc19leHBpcmVzXCIpO1xyXG4gICAgICB2YXIgbWVzc2FnZSA9IGxnKFwicHJvbW9jb2RlX3ZpZXdfYWxsXCIse1widXJsXCI6XCIvXCIrbGFuZ1tcImhyZWZfcHJlZml4XCJdK1wiY291cG9uc1wifSk7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XHJcbiAgICAgICAgJ3RpdGxlJzogdGl0bGUsXHJcbiAgICAgICAgJ3F1ZXN0aW9uJzogbWVzc2FnZSxcclxuICAgICAgICAnYnV0dG9uWWVzJzogJ09rJyxcclxuICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcclxuICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2UgaWYgKCF1c2VySWQpIHtcclxuICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgJ2J1dHRvblllcyc6IGZhbHNlLFxyXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiBcIm5vdGlmeV9ib3gtYWxlcnRcIixcclxuICAgICAgICAndGl0bGUnOiBsZyhcInVzZV9wcm9tb2NvZGVcIiksXHJcbiAgICAgICAgJ3F1ZXN0aW9uJzogJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWNvdXBvbi1ub3JlZ2lzdGVyXCI+JyArXHJcbiAgICAgICAgJzxpbWcgc3JjPVwiL2ltYWdlcy90ZW1wbGF0ZXMvc3dhLnBuZ1wiIGFsdD1cIlwiPicgK1xyXG4gICAgICAgICc8cD48Yj4nK2xnKFwicHJvbW9jb2RlX3VzZV93aXRob3V0X2Nhc2hiYWNrX29yX3JlZ2lzdGVyXCIpKyc8L2I+PC9wPicgK1xyXG4gICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtYnV0dG9uc1wiPicgK1xyXG4gICAgICAgICc8YSBocmVmPVwiJyArIHRoYXQuYXR0cignaHJlZicpICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiIGNsYXNzPVwiYnRuIG5vdGlmaWNhdGlvbi1jbG9zZVwiPicrbGcoXCJ1c2VfcHJvbW9jb2RlXCIpKyc8L2E+JyArXHJcbiAgICAgICAgJzxhIGhyZWY9XCIjJytsYW5nW1wiaHJlZl9wcmVmaXhcIl0rJ3JlZ2lzdHJhdGlvblwiIGNsYXNzPVwiYnRuIGJ0bi10cmFuc2Zvcm0gbW9kYWxzX29wZW5cIj4nK2xnKFwicmVnaXN0ZXJcIikrJzwvYT4nICtcclxuICAgICAgICAnPC9kaXY+J1xyXG4gICAgICB9O1xyXG4gICAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnI3Nob3BfaGVhZGVyLWdvdG8tY2hlY2tib3gnKS5jbGljayhmdW5jdGlvbigpe1xyXG4gICAgIGlmICghJCh0aGlzKS5pcygnOmNoZWNrZWQnKSkge1xyXG4gICAgICAgICBub3RpZmljYXRpb24uYWxlcnQoe1xyXG4gICAgICAgICAgICAgJ3RpdGxlJzogbGcoXCJhdHRlbnRpb25zXCIpLFxyXG4gICAgICAgICAgICAgJ3F1ZXN0aW9uJzogbGcoXCJwcm9tb2NvZGVfcmVjb21tZW5kYXRpb25zXCIpLFxyXG4gICAgICAgICAgICAgJ2J1dHRvblllcyc6IGxnKFwiY2xvc2VcIiksXHJcbiAgICAgICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcclxuICAgICAgICAgICAgICdub3R5ZnlfY2xhc3MnOiAnbm90aWZ5X2JveC1hbGVydCdcclxuICAgICAgICAgfSk7XHJcbiAgICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcuY2F0YWxvZ19wcm9kdWN0X2xpbmsnKS5jbGljayhmdW5jdGlvbigpe1xyXG4gICAgICB2YXIgdGhhdCA9ICQodGhpcyk7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XHJcbiAgICAgICAgJ2J1dHRvblllcyc6IGZhbHNlLFxyXG4gICAgICAgICAgICAnbm90eWZ5X2NsYXNzJzogXCJub3RpZnlfYm94LWFsZXJ0XCIsXHJcbiAgICAgICAgICAgICd0aXRsZSc6IGxnKFwicHJvZHVjdF91c2VcIiksXHJcbiAgICAgICAgICAgICdxdWVzdGlvbic6ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveC1jb3Vwb24tbm9yZWdpc3RlclwiPicgK1xyXG4gICAgICAgICc8aW1nIHNyYz1cIi9pbWFnZXMvdGVtcGxhdGVzL3N3YS5wbmdcIiBhbHQ9XCJcIj4nICtcclxuICAgICAgICAnPHA+PGI+JytsZyhcInByb2R1Y3RfdXNlX3dpdGhvdXRfY2FzaGJhY2tfb3JfcmVnaXN0ZXJcIikrJzwvYj48L3A+JyArXHJcbiAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveC1idXR0b25zXCI+JyArXHJcbiAgICAgICAgJzxhIGhyZWY9XCInICsgdGhhdC5hdHRyKCdocmVmJykgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJidG4gbm90aWZpY2F0aW9uLWNsb3NlXCI+JytsZyhcInByb2R1Y3RfdXNlXCIpKyc8L2E+JyArXHJcbiAgICAgICAgJzxhIGhyZWY9XCIjcmVnaXN0cmF0aW9uXCIgY2xhc3M9XCJidG4gYnRuLXRyYW5zZm9ybSBtb2RhbHNfb3BlblwiPicrbGcoXCJyZWdpc3RlclwiKSsnPC9hPicgK1xyXG4gICAgICAgICc8L2Rpdj4nfVxyXG4gICAgICAgICk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLmFjY291bnQtd2l0aGRyYXctbWV0aG9kc19pdGVtLW9wdGlvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgb3B0aW9uID0gJCh0aGlzKS5kYXRhKCdvcHRpb24tcHJvY2VzcycpLFxyXG4gICAgICBwbGFjZWhvbGRlciA9ICcnO1xyXG4gICAgc3dpdGNoIChvcHRpb24pIHtcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19jYXNoX251bWJlclwiKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgMjpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfcl9udW1iZXJcIik7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDM6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X3Bob25lX251bWJlclwiKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgNDpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfY2FydF9udW1iZXJcIik7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDU6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X2VtYWlsXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSA2OlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19waG9uZV9udW1iZXJcIik7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDc6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X3NrcmlsbFwiKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICAkKHRoaXMpLnBhcmVudCgpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgJCh0aGlzKS5wYXJlbnQoKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAkKFwiI3VzZXJzd2l0aGRyYXctYmlsbFwiKS5wcmV2KFwiLnBsYWNlaG9sZGVyXCIpLmh0bWwocGxhY2Vob2xkZXIpO1xyXG4gICAgJCgnI3VzZXJzd2l0aGRyYXctcHJvY2Vzc19pZCcpLnZhbChvcHRpb24pO1xyXG4gIH0pO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gIGFqYXhGb3JtKCQoJy5hamF4X2Zvcm0nKSk7XHJcblxyXG4gICQoJy5mb3JtLXRlc3QtbGluaycpLm9uKCdzdWJtaXQnLGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGZvcm0gPSAkKCcuZm9ybS10ZXN0LWxpbmsnKTtcclxuICAgIGlmKGZvcm0uaGFzQ2xhc3MoJ2xvYWRpbmcnKSlyZXR1cm47XHJcbiAgICBmb3JtLmZpbmQoJy5oZWxwLWJsb2NrJykuaHRtbChcIlwiKTtcclxuXHJcbiAgICB2YXIgdXJsID0gZm9ybS5maW5kKCdbbmFtZT11cmxdJykudmFsKCk7XHJcbiAgICBmb3JtLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcclxuXHJcbiAgICBpZih1cmwubGVuZ3RoPDMpe1xyXG4gICAgICBmb3JtLmZpbmQoJy5oZWxwLWJsb2NrJykuaHRtbChsZygncmVxdWlyZWQnKSk7XHJcbiAgICAgIGZvcm0uYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9ZWxzZXtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xyXG4gICAgZm9ybS5maW5kKCdpbnB1dCcpLmF0dHIoJ2Rpc2FibGVkJyx0cnVlKTtcclxuICAgICQucG9zdChmb3JtLmF0dHIoJ2FjdGlvbicpLHt1cmw6dXJsfSxmdW5jdGlvbihkKXtcclxuICAgICAgZm9ybS5maW5kKCdpbnB1dCcpLmF0dHIoJ2Rpc2FibGVkJyxmYWxzZSk7XHJcbiAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgZm9ybS5maW5kKCcuaGVscC1ibG9jaycpLmh0bWwoZCk7XHJcbiAgICB9KTtcclxuICB9KVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5kb2Jyby1mdW5kc19pdGVtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAkKCcjZG9icm8tc2VuZC1mb3JtLWNoYXJpdHktcHJvY2VzcycpLnZhbCgkKHRoaXMpLmRhdGEoJ2lkJykpO1xyXG4gIH0pO1xyXG5cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnYm9keScpLmFkZENsYXNzKCdub19zY3JvbGwnKTtcclxuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQnKS5hZGRDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LW9wZW4nKTtcclxuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5hZGRDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlLW9wZW4nKTtcclxuICB9KTtcclxuICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LWNsb3NlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcclxuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQnKS5yZW1vdmVDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LW9wZW4nKTtcclxuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5yZW1vdmVDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlLW9wZW4nKTtcclxuICB9KTtcclxufSkoKTtcclxuIiwiLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xyXG5mdW5jdGlvbiBzaGFyZTQyKCl7XHJcbiAgZT1kb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzaGFyZTQyaW5pdCcpO1xyXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgZS5sZW5ndGg7IGsrKykge1xyXG4gICAgdmFyIHUgPSBcIlwiO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNvY2lhbHMnKSAhPSAtMSlcclxuICAgICAgdmFyIHNvY2lhbHMgPSBKU09OLnBhcnNlKCdbJytlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zb2NpYWxzJykrJ10nKTtcclxuICAgIHZhciBpY29uX3R5cGU9ZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi10eXBlJykgIT0gLTE/ZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi10eXBlJyk6Jyc7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXJsJykgIT0gLTEpXHJcbiAgICAgIHUgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKTtcclxuICAgIHZhciBwcm9tbyA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXByb21vJyk7XHJcbiAgICBpZihwcm9tbyAmJiBwcm9tby5sZW5ndGg+MCkge1xyXG4gICAgICB2YXIga2V5ID0gJ3Byb21vPScsXHJcbiAgICAgICAgcHJvbW9TdGFydCA9IHUuaW5kZXhPZihrZXkpLFxyXG4gICAgICAgIHByb21vRW5kID0gdS5pbmRleE9mKCcmJywgcHJvbW9TdGFydCksXHJcbiAgICAgICAgcHJvbW9MZW5ndGggPSBwcm9tb0VuZCA+IHByb21vU3RhcnQgPyBwcm9tb0VuZCAtIHByb21vU3RhcnQgLSBrZXkubGVuZ3RoIDogdS5sZW5ndGggLSBwcm9tb1N0YXJ0IC0ga2V5Lmxlbmd0aDtcclxuICAgICAgaWYocHJvbW9TdGFydCA+IDApIHtcclxuICAgICAgICBwcm9tbyA9IHUuc3Vic3RyKHByb21vU3RhcnQgKyBrZXkubGVuZ3RoLCBwcm9tb0xlbmd0aCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHZhciBzZWxmX3Byb21vID0gKHByb21vICYmIHByb21vLmxlbmd0aCA+IDApPyBcInNldFRpbWVvdXQoZnVuY3Rpb24oKXtzZW5kX3Byb21vKCdcIitwcm9tbytcIicpO30sMjAwMCk7XCIgOiBcIlwiO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tc2l6ZScpICE9IC0xKVxyXG4gICAgICB2YXIgaWNvbl9zaXplID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi1zaXplJyk7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnKSAhPSAtMSlcclxuICAgICAgdmFyIHQgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWltYWdlJykgIT0gLTEpXHJcbiAgICAgIHZhciBpID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1hZ2UnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1kZXNjcmlwdGlvbicpICE9IC0xKVxyXG4gICAgICB2YXIgZCA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWRlc2NyaXB0aW9uJyk7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF0aCcpICE9IC0xKVxyXG4gICAgICB2YXIgZiA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXBhdGgnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29ucy1maWxlJykgIT0gLTEpXHJcbiAgICAgIHZhciBmbiA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb25zLWZpbGUnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zY3JpcHQtYWZ0ZXInKSkge1xyXG4gICAgICBzZWxmX3Byb21vICs9IFwic2V0VGltZW91dChmdW5jdGlvbigpe1wiK2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNjcmlwdC1hZnRlcicpK1wifSwzMDAwKTtcIjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWYpIHtcclxuICAgICAgZnVuY3Rpb24gcGF0aChuYW1lKSB7XHJcbiAgICAgICAgdmFyIHNjID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpXHJcbiAgICAgICAgICAsIHNyID0gbmV3IFJlZ0V4cCgnXiguKi98KSgnICsgbmFtZSArICcpKFsjP118JCknKTtcclxuICAgICAgICBmb3IgKHZhciBwID0gMCwgc2NMID0gc2MubGVuZ3RoOyBwIDwgc2NMOyBwKyspIHtcclxuICAgICAgICAgIHZhciBtID0gU3RyaW5nKHNjW3BdLnNyYykubWF0Y2goc3IpO1xyXG4gICAgICAgICAgaWYgKG0pIHtcclxuICAgICAgICAgICAgaWYgKG1bMV0ubWF0Y2goL14oKGh0dHBzP3xmaWxlKVxcOlxcL3syLH18XFx3OltcXC9cXFxcXSkvKSlcclxuICAgICAgICAgICAgICByZXR1cm4gbVsxXTtcclxuICAgICAgICAgICAgaWYgKG1bMV0uaW5kZXhPZihcIi9cIikgPT0gMClcclxuICAgICAgICAgICAgICByZXR1cm4gbVsxXTtcclxuICAgICAgICAgICAgYiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdiYXNlJyk7XHJcbiAgICAgICAgICAgIGlmIChiWzBdICYmIGJbMF0uaHJlZilcclxuICAgICAgICAgICAgICByZXR1cm4gYlswXS5ocmVmICsgbVsxXTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvKC4qW1xcL1xcXFxdKS8pWzBdICsgbVsxXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgZiA9IHBhdGgoJ3NoYXJlNDIuanMnKTtcclxuICAgIH1cclxuICAgIGlmICghdSlcclxuICAgICAgdSA9IGxvY2F0aW9uLmhyZWY7XHJcbiAgICBpZiAoIXQpXHJcbiAgICAgIHQgPSBkb2N1bWVudC50aXRsZTtcclxuICAgIGlmICghZm4pXHJcbiAgICAgIGZuID0gJ2ljb25zLnBuZyc7XHJcbiAgICBmdW5jdGlvbiBkZXNjKCkge1xyXG4gICAgICB2YXIgbWV0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtZXRhJyk7XHJcbiAgICAgIGZvciAodmFyIG0gPSAwOyBtIDwgbWV0YS5sZW5ndGg7IG0rKykge1xyXG4gICAgICAgIGlmIChtZXRhW21dLm5hbWUudG9Mb3dlckNhc2UoKSA9PSAnZGVzY3JpcHRpb24nKSB7XHJcbiAgICAgICAgICByZXR1cm4gbWV0YVttXS5jb250ZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gJyc7XHJcbiAgICB9XHJcbiAgICBpZiAoIWQpXHJcbiAgICAgIGQgPSBkZXNjKCk7XHJcbiAgICB1ID0gZW5jb2RlVVJJQ29tcG9uZW50KHUpO1xyXG4gICAgdCA9IGVuY29kZVVSSUNvbXBvbmVudCh0KTtcclxuICAgIHQgPSB0LnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XHJcbiAgICBpID0gZW5jb2RlVVJJQ29tcG9uZW50KGkpO1xyXG4gICAgdmFyIGRfb3JpZz1kLnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XHJcbiAgICBkID0gZW5jb2RlVVJJQ29tcG9uZW50KGQpO1xyXG4gICAgZCA9IGQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcclxuICAgIHZhciBmYlF1ZXJ5ID0gJ3U9JyArIHU7XHJcbiAgICBpZiAoaSAhPSAnbnVsbCcgJiYgaSAhPSAnJylcclxuICAgICAgZmJRdWVyeSA9ICdzPTEwMCZwW3VybF09JyArIHUgKyAnJnBbdGl0bGVdPScgKyB0ICsgJyZwW3N1bW1hcnldPScgKyBkICsgJyZwW2ltYWdlc11bMF09JyArIGk7XHJcbiAgICB2YXIgdmtJbWFnZSA9ICcnO1xyXG4gICAgaWYgKGkgIT0gJ251bGwnICYmIGkgIT0gJycpXHJcbiAgICAgIHZrSW1hZ2UgPSAnJmltYWdlPScgKyBpO1xyXG4gICAgdmFyIHMgPSBuZXcgQXJyYXkoXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwiZmJcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT0nICsgdSArJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgRmFjZWJvb2tcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidmtcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3ZrLmNvbS9zaGFyZS5waHA/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArIHZrSW1hZ2UgKyAnJmRlc2NyaXB0aW9uPScgKyBkICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0JIg0JrQvtC90YLQsNC60YLQtVwiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJvZGtsXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9jb25uZWN0Lm9rLnJ1L29mZmVyP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnJmRlc2NyaXB0aW9uPScrIGQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQlNC+0LHQsNCy0LjRgtGMINCyINCe0LTQvdC+0LrQu9Cw0YHRgdC90LjQutC4XCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInR3aVwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9JyArIHQgKyAnJnVybD0nICsgdSArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIgVHdpdHRlclwiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJncGx1c1wiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vcGx1cy5nb29nbGUuY29tL3NoYXJlP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBHb29nbGUrXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cIm1haWxcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL2Nvbm5lY3QubWFpbC5ydS9zaGFyZT91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgJyZkZXNjcmlwdGlvbj0nICsgZCArICcmaW1hZ2V1cmw9JyArIGkgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiDQnNC+0LXQvCDQnNC40YDQtUBNYWlsLlJ1XCInLFxyXG4gICAgICAnXCIvL3d3dy5saXZlam91cm5hbC5jb20vdXBkYXRlLmJtbD9ldmVudD0nICsgdSArICcmc3ViamVjdD0nICsgdCArICdcIiB0aXRsZT1cItCe0L/Rg9Cx0LvQuNC60L7QstCw0YLRjCDQsiBMaXZlSm91cm5hbFwiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJwaW5cIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3BpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD0nICsgdSArICcmbWVkaWE9JyArIGkgKyAnJmRlc2NyaXB0aW9uPScgKyB0ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD02MDAsIGhlaWdodD0zMDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiBQaW50ZXJlc3RcIicsXHJcbiAgICAgICdcIlwiIG9uY2xpY2s9XCJyZXR1cm4gZmF2KHRoaXMpO1wiIHRpdGxlPVwi0KHQvtGF0YDQsNC90LjRgtGMINCyINC40LfQsdGA0LDQvdC90L7QtSDQsdGA0LDRg9C30LXRgNCwXCInLFxyXG4gICAgICAnXCIjXCIgb25jbGljaz1cInByaW50KCk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQoNCw0YHQv9C10YfQsNGC0LDRgtGMXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInRlbGVncmFtXCIgb25jbGljaz1cIndpbmRvdy5vcGVuKFxcJy8vdGVsZWdyYW0ubWUvc2hhcmUvdXJsP3VybD0nICsgdSArJyZ0ZXh0PScgKyB0ICsgJ1xcJywgXFwndGVsZWdyYW1cXCcsIFxcJ3dpZHRoPTU1MCxoZWlnaHQ9NDQwLGxlZnQ9MTAwLHRvcD0xMDBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgVGVsZWdyYW1cIicsXHJcbiAgICAgICdcInZpYmVyOi8vZm9yd2FyZD90ZXh0PScrIHUgKycgLSAnICsgdCArICdcIiBkYXRhLWNvdW50PVwidmliZXJcIiByZWw9XCJub2ZvbGxvdyBub29wZW5lclwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgVmliZXJcIicsXHJcbiAgICAgICdcIndoYXRzYXBwOi8vc2VuZD90ZXh0PScrIHUgKycgLSAnICsgdCArICdcIiBkYXRhLWNvdW50PVwid2hhdHNhcHBcIiByZWw9XCJub2ZvbGxvdyBub29wZW5lclwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgV2hhdHNBcHBcIidcclxuXHJcbiAgICApO1xyXG5cclxuICAgIHZhciBsID0gJyc7XHJcblxyXG4gICAgaWYoc29jaWFscy5sZW5ndGg+MSl7XHJcbiAgICAgIGZvciAocSA9IDA7IHEgPCBzb2NpYWxzLmxlbmd0aDsgcSsrKXtcclxuICAgICAgICBqPXNvY2lhbHNbcV07XHJcbiAgICAgICAgbCArPSAnPGEgcmVsPVwibm9mb2xsb3dcIiBocmVmPScgKyBzW2pdICsgJyB0YXJnZXQ9XCJfYmxhbmtcIiAnK2dldEljb24oc1tqXSxqLGljb25fdHlwZSxmLGZuLGljb25fc2l6ZSkrJz48L2E+JztcclxuICAgICAgfVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGZvciAoaiA9IDA7IGogPCBzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgbCArPSAnPGEgcmVsPVwibm9mb2xsb3dcIiBocmVmPScgKyBzW2pdICsgJyB0YXJnZXQ9XCJfYmxhbmtcIiAnK2dldEljb24oc1tqXSxqLGljb25fdHlwZSxmLGZuLGljb25fc2l6ZSkrJz48L2E+JztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZVtrXS5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJzaGFyZTQyX3dyYXBcIj4nICsgbCArICc8L3NwYW4+JztcclxuICB9XHJcbiAgXHJcbi8vfSwgZmFsc2UpO1xyXG59XHJcblxyXG5zaGFyZTQyKCk7XHJcblxyXG5mdW5jdGlvbiBnZXRJY29uKHMsaix0LGYsZm4sc2l6ZSkge1xyXG4gIGlmKCFzaXplKXtcclxuICAgIHNpemU9MzI7XHJcbiAgfVxyXG4gIGlmKHQ9PSdjc3MnKXtcclxuICAgIGo9cy5pbmRleE9mKCdkYXRhLWNvdW50PVwiJykrMTI7XHJcbiAgICB2YXIgbD1zLmluZGV4T2YoJ1wiJyxqKS1qO1xyXG4gICAgdmFyIGwyPXMuaW5kZXhPZignLicsaiktajtcclxuICAgIGw9bD5sMiAmJiBsMj4wID9sMjpsO1xyXG4gICAgLy92YXIgaWNvbj0nY2xhc3M9XCJzb2MtaWNvbiBpY29uLScrcy5zdWJzdHIoaixsKSsnXCInO1xyXG4gICAgdmFyIGljb249J2NsYXNzPVwic29jLWljb24tc2QgaWNvbi1zZC0nK3Muc3Vic3RyKGosbCkrJ1wiJztcclxuICB9ZWxzZSBpZih0PT0nc3ZnJyl7XHJcbiAgICB2YXIgc3ZnPVtcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsMTExLjk0LDE3Ny4wOClcIiBkPVwiTTAgMCAwIDcwLjMgMjMuNiA3MC4zIDI3LjEgOTcuNyAwIDk3LjcgMCAxMTUuMkMwIDEyMy4yIDIuMiAxMjguNiAxMy42IDEyOC42TDI4LjEgMTI4LjYgMjguMSAxNTMuMUMyNS42IDE1My40IDE3IDE1NC4yIDYuOSAxNTQuMi0xNCAxNTQuMi0yOC4zIDE0MS40LTI4LjMgMTE3LjlMLTI4LjMgOTcuNy01MiA5Ny43LTUyIDcwLjMtMjguMyA3MC4zLTI4LjMgMCAwIDBaXCIvPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDk4LjI3NCwxNDUuNTIpXCIgZD1cIk0wIDAgOS42IDBDOS42IDAgMTIuNSAwLjMgMTQgMS45IDE1LjQgMy40IDE1LjMgNi4xIDE1LjMgNi4xIDE1LjMgNi4xIDE1LjEgMTkgMjEuMSAyMSAyNyAyMi44IDM0LjYgOC41IDQyLjcgMyA0OC43LTEuMiA1My4zLTAuMyA1My4zLTAuM0w3NC44IDBDNzQuOCAwIDg2LjEgMC43IDgwLjcgOS41IDgwLjMgMTAuMyA3Ny42IDE2LjEgNjQuOCAyOCA1MS4zIDQwLjUgNTMuMSAzOC41IDY5LjMgNjAuMSA3OS4yIDczLjMgODMuMiA4MS40IDgxLjkgODQuOCA4MC44IDg4LjEgNzMuNSA4Ny4yIDczLjUgODcuMkw0OS4zIDg3LjFDNDkuMyA4Ny4xIDQ3LjUgODcuMyA0Ni4yIDg2LjUgNDQuOSA4NS43IDQ0IDgzLjkgNDQgODMuOSA0NCA4My45IDQwLjIgNzMuNyAzNS4xIDY1LjEgMjQuMyA0Ni44IDIwIDQ1LjggMTguMyA0Ni45IDE0LjIgNDkuNiAxNS4yIDU3LjYgMTUuMiA2My4yIDE1LjIgODEgMTcuOSA4OC40IDkuOSA5MC4zIDcuMyA5MC45IDUuNCA5MS4zLTEuNCA5MS40LTEwIDkxLjUtMTcuMyA5MS40LTIxLjQgODkuMy0yNC4yIDg4LTI2LjMgODUtMjUgODQuOC0yMy40IDg0LjYtMTkuOCA4My44LTE3LjkgODEuMi0xNS40IDc3LjktMTUuNSA3MC4zLTE1LjUgNzAuMy0xNS41IDcwLjMtMTQuMSA0OS40LTE4LjggNDYuOC0yMi4xIDQ1LTI2LjUgNDguNy0zNi4xIDY1LjMtNDEuMSA3My44LTQ0LjggODMuMi00NC44IDgzLjItNDQuOCA4My4yLTQ1LjUgODQuOS00Ni44IDg1LjktNDguMyA4Ny01MC41IDg3LjQtNTAuNSA4Ny40TC03My41IDg3LjJDLTczLjUgODcuMi03Ni45IDg3LjEtNzguMiA4NS42LTc5LjMgODQuMy03OC4zIDgxLjUtNzguMyA4MS41LTc4LjMgODEuNS02MC4zIDM5LjQtMzkuOSAxOC4yLTIxLjItMS4zIDAgMCAwIDBcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDEwNi44OCwxODMuNjEpXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKC02Ljg4MDUsLTEwMClcIiBzdHlsZT1cInN0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIj48cGF0aCBkPVwiTSAwLDAgQyA4LjE0NiwwIDE0Ljc2OSwtNi42MjUgMTQuNzY5LC0xNC43NyAxNC43NjksLTIyLjkwNyA4LjE0NiwtMjkuNTMzIDAsLTI5LjUzMyAtOC4xMzYsLTI5LjUzMyAtMTQuNzY5LC0yMi45MDcgLTE0Ljc2OSwtMTQuNzcgLTE0Ljc2OSwtNi42MjUgLTguMTM2LDAgMCwwIE0gMCwtNTAuNDI5IEMgMTkuNjc2LC01MC40MjkgMzUuNjcsLTM0LjQzNSAzNS42NywtMTQuNzcgMzUuNjcsNC45MDMgMTkuNjc2LDIwLjkwMyAwLDIwLjkwMyAtMTkuNjcxLDIwLjkwMyAtMzUuNjY5LDQuOTAzIC0zNS42NjksLTE0Ljc3IC0zNS42NjksLTM0LjQzNSAtMTkuNjcxLC01MC40MjkgMCwtNTAuNDI5XCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsNy41NTE2LC01NC41NzcpXCIgc3R5bGU9XCJzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCI+PHBhdGggZD1cIk0gMCwwIEMgNy4yNjIsMS42NTUgMTQuMjY0LDQuNTI2IDIwLjcxNCw4LjU3OCAyNS41OTUsMTEuNjU0IDI3LjA2NiwxOC4xMDggMjMuOTksMjIuOTg5IDIwLjkxNywyNy44ODEgMTQuNDY5LDI5LjM1MiA5LjU3OSwyNi4yNzUgLTUuMDMyLDE3LjA4NiAtMjMuODQzLDE3LjA5MiAtMzguNDQ2LDI2LjI3NSAtNDMuMzM2LDI5LjM1MiAtNDkuNzg0LDI3Ljg4MSAtNTIuODUyLDIyLjk4OSAtNTUuOTI4LDE4LjEwNCAtNTQuNDYxLDExLjY1NCAtNDkuNTgsOC41NzggLTQzLjEzMiw0LjUzMSAtMzYuMTI4LDEuNjU1IC0yOC44NjcsMCBMIC00OC44MDksLTE5Ljk0MSBDIC01Mi44ODYsLTI0LjAyMiAtNTIuODg2LC0zMC42MzkgLTQ4LjgwNSwtMzQuNzIgLTQ2Ljc2MiwtMzYuNzU4IC00NC4wOSwtMzcuNzc5IC00MS40MTgsLTM3Ljc3OSAtMzguNzQyLC0zNy43NzkgLTM2LjA2NSwtMzYuNzU4IC0zNC4wMjMsLTM0LjcyIEwgLTE0LjQzNiwtMTUuMTIzIDUuMTY5LC0zNC43MiBDIDkuMjQ2LC0zOC44MDEgMTUuODYyLC0zOC44MDEgMTkuOTQzLC0zNC43MiAyNC4wMjgsLTMwLjYzOSAyNC4wMjgsLTI0LjAxOSAxOS45NDMsLTE5Ljk0MSBMIDAsMCBaXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48L2c+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsMTY5Ljc2LDU2LjcyNylcIiBkPVwiTTAgMEMtNS4xLTIuMy0xMC42LTMuOC0xNi40LTQuNS0xMC41LTEtNiA0LjYtMy45IDExLjMtOS40IDgtMTUuNSA1LjctMjIgNC40LTI3LjMgOS45LTM0LjcgMTMuNC00Mi45IDEzLjQtNTguNyAxMy40LTcxLjYgMC42LTcxLjYtMTUuMi03MS42LTE3LjQtNzEuMy0xOS42LTcwLjgtMjEuNy05NC42LTIwLjUtMTE1LjctOS4xLTEyOS44IDguMi0xMzIuMyA0LTEzMy43LTEtMTMzLjctNi4yLTEzMy43LTE2LjEtMTI4LjYtMjQuOS0xMjAuOS0zMC0xMjUuNi0yOS45LTEzMC4xLTI4LjYtMTMzLjktMjYuNS0xMzMuOS0yNi42LTEzMy45LTI2LjctMTMzLjktMjYuOC0xMzMuOS00MC43LTEyNC01Mi4zLTExMS01NC45LTExMy40LTU1LjUtMTE1LjktNTUuOS0xMTguNS01NS45LTEyMC4zLTU1LjktMTIyLjEtNTUuNy0xMjMuOS01NS40LTEyMC4yLTY2LjctMTA5LjctNzUtOTcuMS03NS4zLTEwNi45LTgyLjktMTE5LjMtODcuNS0xMzIuNy04Ny41LTEzNS04Ny41LTEzNy4zLTg3LjQtMTM5LjUtODcuMS0xMjYuOC05NS4yLTExMS44LTEwMC05NS42LTEwMC00My0xMDAtMTQuMi01Ni4zLTE0LjItMTguNS0xNC4yLTE3LjMtMTQuMi0xNi0xNC4zLTE0LjgtOC43LTEwLjgtMy44LTUuNyAwIDBcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMSAwIDAgLTEgNzIuMzgxIDkwLjE3MilcIj48cGF0aCBkPVwiTTg3LjIgMCA4Ny4yIDE3LjEgNzUgMTcuMSA3NSAwIDU3LjkgMCA1Ny45LTEyLjIgNzUtMTIuMiA3NS0yOS4zIDg3LjItMjkuMyA4Ny4yLTEyLjIgMTA0LjMtMTIuMiAxMDQuMyAwIDg3LjIgMFpcIi8+PHBhdGggZD1cIk0wIDAgMC0xOS42IDI2LjItMTkuNkMyNS40LTIzLjcgMjMuOC0yNy41IDIwLjgtMzAuNiAxMC4zLTQyLjEtOS4zLTQyLTIwLjUtMzAuNC0zMS43LTE4LjktMzEuNi0wLjMtMjAuMiAxMS4xLTkuNCAyMS45IDggMjIuNCAxOC42IDEyLjFMMTguNSAxMi4xIDMyLjggMjYuNEMxMy43IDQzLjgtMTUuOCA0My41LTM0LjUgMjUuMS01My44IDYuMS01NC0yNS0zNC45LTQ0LjMtMTUuOS02My41IDE3LjEtNjMuNyAzNC45LTQ0LjYgNDUuNi0zMyA0OC43LTE2LjQgNDYuMiAwTDAgMFpcIi8+PC9nPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDk3LjY3Niw2Mi40MTEpXCIgZD1cIk0wIDBDMTAuMiAwIDE5LjktNC41IDI2LjktMTEuNkwyNi45LTExLjZDMjYuOS04LjIgMjkuMi01LjcgMzIuNC01LjdMMzMuMi01LjdDMzguMi01LjcgMzkuMi0xMC40IDM5LjItMTEuOUwzOS4yLTY0LjhDMzguOS02OC4yIDQyLjgtNzAgNDUtNjcuOCA1My41LTU5LjEgNjMuNi0yMi45IDM5LjctMiAxNy40IDE3LjYtMTIuNSAxNC4zLTI4LjUgMy40LTQ1LjQtOC4zLTU2LjItMzQuMS00NS43LTU4LjQtMzQuMi04NC45LTEuNC05Mi44IDE4LjEtODQuOSAyOC04MC45IDMyLjUtOTQuMyAyMi4zLTk4LjYgNi44LTEwNS4yLTM2LjQtMTA0LjUtNTYuNS02OS42LTcwLjEtNDYuMS02OS40LTQuNi0zMy4zIDE2LjktNS43IDMzLjMgMzAuNyAyOC44IDUyLjcgNS44IDc1LjYtMTguMiA3NC4zLTYzIDUxLjktODAuNSA0MS44LTg4LjQgMjYuNy04MC43IDI2LjgtNjkuMkwyNi43LTY1LjRDMTkuNi03Mi40IDEwLjItNzYuNSAwLTc2LjUtMjAuMi03Ni41LTM4LTU4LjctMzgtMzguNC0zOC0xOC0yMC4yIDAgMCAwTTI1LjUtMzdDMjQuNy0yMi4yIDEzLjctMTMuMyAwLjQtMTMuM0wtMC4xLTEzLjNDLTE1LjQtMTMuMy0yMy45LTI1LjMtMjMuOS0zOS0yMy45LTU0LjMtMTMuNi02NC0wLjEtNjQgMTQuOS02NCAyNC44LTUzIDI1LjUtNDBMMjUuNS0zN1pcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMC40MjYyMyAwIDAgMC40MjYyMyAzNC45OTkgMzUpXCI+PHBhdGggZD1cIk0xNjAuNyAxOS41Yy0xOC45IDAtMzcuMyAzLjctNTQuNyAxMC45TDc2LjQgMC43Yy0wLjgtMC44LTIuMS0xLTMuMS0wLjRDNDQuNCAxOC4yIDE5LjggNDIuOSAxLjkgNzEuN2MtMC42IDEtMC41IDIuMyAwLjQgMy4xbDI4LjQgMjguNGMtOC41IDE4LjYtMTIuOCAzOC41LTEyLjggNTkuMSAwIDc4LjcgNjQgMTQyLjggMTQyLjggMTQyLjggNzguNyAwIDE0Mi44LTY0IDE0Mi44LTE0Mi44QzMwMy40IDgzLjUgMjM5LjQgMTkuNSAxNjAuNyAxOS41ek0yMTcuMiAxNDguN2w5LjkgNDIuMSA5LjUgNDQuNCAtNDQuMy05LjUgLTQyLjEtOS45TDM2LjcgMTAyLjFjMTQuMy0yOS4zIDM4LjMtNTIuNiA2OC4xLTY1LjhMMjE3LjIgMTQ4Ljd6XCIvPjxwYXRoIGQ9XCJNMjIxLjggMTg3LjRsLTcuNS0zM2MtMjUuOSAxMS45LTQ2LjQgMzIuNC01OC4zIDU4LjNsMzMgNy41QzE5NiAyMDYuMiAyMDcuNyAxOTQuNCAyMjEuOCAxODcuNHpcIi8+PC9nPjwvc3ZnPicsXHJcbiAgICAgICcnLC8vcGluXHJcbiAgICAgICcnLC8vZmF2XHJcbiAgICAgICcnLC8vcHJpbnRcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsNzEuMjY0LDEwNi45MylcIiBkPVwiTTAgMCA2OC42IDQzLjFDNzIgNDUuMyA3My4xIDQyLjggNzEuNiA0MS4xTDE0LjYtMTAuMiAxMS43LTM1LjggMCAwWk04Ny4xIDYyLjktMzMuNCAxNy4yQy00MCAxNS4zLTM5LjggOC44LTM0LjkgNy4zTC00LjctMi4yIDYuOC0zNy42QzguMi00MS41IDkuNC00Mi45IDExLjgtNDMgMTQuMy00MyAxNS4zLTQyLjEgMTcuOS0zOS44IDIwLjktMzYuOSAyNS42LTMyLjMgMzMtMjUuMkw2NC40LTQ4LjRDNzAuMi01MS42IDc0LjMtNDkuOSA3NS44LTQzTDk1LjUgNTQuNEM5Ny42IDYyLjkgOTIuNiA2NS40IDg3LjEgNjIuOVwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMzUuMzMsMTE5Ljg1KVwiIGQ9XCJNMCAwQy0yLjQtNS40LTYuNS05LTEyLjItMTAuNi0xNC4zLTExLjItMTYuMy0xMC43LTE4LjItOS45LTQ0LjQgMS4yLTYzLjMgMTkuNi03NCA0Ni4yLTc0LjggNDguMS03NS4zIDUwLjEtNzUuMiA1MS45LTc1LjIgNTguNy02OS4yIDY1LTYyLjYgNjUuNC02MC44IDY1LjUtNTkuMiA2NC45LTU3LjkgNjMuNy01My4zIDU5LjMtNDkuNiA1NC4zLTQ2LjkgNDguNi00NS40IDQ1LjUtNDYgNDMuMy00OC43IDQxLjEtNDkuMSA0MC43LTQ5LjUgNDAuNC01MCA0MC4xLTUzLjUgMzcuNS01NC4zIDM0LjktNTIuNiAzMC44LTQ5LjggMjQuMi00NS40IDE5LTM5LjMgMTUuMS0zNyAxMy42LTM0LjcgMTIuMi0zMiAxMS41LTI5LjYgMTAuOC0yNy43IDExLjUtMjYuMSAxMy40LTI1LjkgMTMuNi0yNS44IDEzLjktMjUuNiAxNC4xLTIyLjMgMTguOC0xOC42IDE5LjYtMTMuNyAxNi41LTkuNiAxMy45LTUuNiAxMS0xLjggNy44IDAuNyA1LjYgMS4zIDMgMCAwTS0xOC4yIDM2LjdDLTE4LjMgMzUuOS0xOC4zIDM1LjQtMTguNCAzNC45LTE4LjYgMzQtMTkuMiAzMy40LTIwLjIgMzMuNC0yMS4zIDMzLjQtMjEuOSAzNC0yMi4yIDM0LjktMjIuMyAzNS41LTIyLjQgMzYuMi0yMi41IDM2LjktMjMuMiA0MC4zLTI1LjIgNDIuNi0yOC42IDQzLjYtMjkuMSA0My43LTI5LjUgNDMuNy0yOS45IDQzLjgtMzEgNDQuMS0zMi40IDQ0LjItMzIuNCA0NS44LTMyLjUgNDcuMS0zMS41IDQ3LjktMjkuNiA0OC0yOC40IDQ4LjEtMjYuNSA0Ny41LTI1LjQgNDYuOS0yMC45IDQ0LjctMTguNyA0MS42LTE4LjIgMzYuN00tMjUuNSA1MS4yQy0yOCA1Mi4xLTMwLjUgNTIuOC0zMy4yIDUzLjItMzQuNSA1My40LTM1LjQgNTQuMS0zNS4xIDU1LjYtMzQuOSA1Ny0zNCA1Ny41LTMyLjYgNTcuNC0yNCA1Ni42LTE3LjMgNTMuNC0xMi42IDQ2LTEwLjUgNDIuNS05LjIgMzcuNS05LjQgMzMuOC05LjUgMzEuMi05LjkgMzAuNS0xMS40IDMwLjUtMTMuNiAzMC42LTEzLjMgMzIuNC0xMy41IDMzLjctMTMuNyAzNS43LTE0LjIgMzcuNy0xNC43IDM5LjctMTYuMyA0NS40LTE5LjkgNDkuMy0yNS41IDUxLjJNLTM4IDY0LjRDLTM3LjkgNjUuOS0zNyA2Ni41LTM1LjUgNjYuNC0yMy4yIDY1LjgtMTMuOSA2Mi4yLTYuNyA1Mi41LTIuNSA0Ni45LTAuMiAzOS4yIDAgMzIuMiAwIDMxLjEgMCAzMCAwIDI5LTAuMSAyNy44LTAuNiAyNi45LTEuOSAyNi45LTMuMiAyNi45LTMuOSAyNy42LTQgMjktNC4zIDM0LjItNS4zIDM5LjMtNy4zIDQ0LjEtMTEuMiA1My41LTE4LjYgNTguNi0yOC4xIDYxLjEtMzAuNyA2MS43LTMzLjIgNjIuMi0zNS44IDYyLjUtMzcgNjIuNS0zOCA2Mi44LTM4IDY0LjRNMTEuNSA3NC4xQzYuNiA3OC4zIDAuOSA4MC44LTUuMyA4Mi40LTIwLjggODYuNS0zNi41IDg3LjUtNTIuNCA4NS4zLTYwLjUgODQuMi02OC4zIDgyLjEtNzUuNCA3OC4xLTgzLjggNzMuNC04OS42IDY2LjYtOTIuMiA1Ny4xLTk0IDUwLjQtOTQuOSA0My42LTk1LjIgMzYuNi05NS43IDI2LjQtOTUuNCAxNi4zLTkyLjggNi4zLTg5LjgtNS4zLTgzLjItMTMuOC03MS45LTE4LjMtNzAuNy0xOC44LTY5LjUtMTkuNS02OC4zLTIwLTY3LjItMjAuNC02Ni44LTIxLjItNjYuOC0yMi40LTY2LjktMzAuNC02Ni44LTM4LjQtNjYuOC00Ni43LTYzLjktNDMuOS02MS44LTQxLjgtNjAuMy00MC4xLTU1LjktMzUuMS01MS43LTMwLjktNDcuMS0yNi4xLTQ0LjctMjMuNy00NS43LTIzLjgtNDIuMS0yMy44LTM3LjgtMjMuOS0zMS0yNC4xLTI2LjgtMjMuOC0xOC42LTIzLjEtMTAuNi0yMi4xLTIuNy0xOS43IDcuMi0xNi43IDE1LjItMTEuNCAxOS4yLTEuMyAyMC4zIDEuMyAyMS40IDQgMjIgNi44IDI1LjkgMjIuOSAyNS40IDM4LjkgMjIuMiA1NSAyMC42IDYyLjQgMTcuNSA2OSAxMS41IDc0LjFcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsMTMwLjg0LDExMi43KVwiIGQ9XCJNMCAwQy0xLjYgMC45LTkuNCA1LjEtMTAuOCA1LjctMTIuMyA2LjMtMTMuNCA2LjYtMTQuNSA1LTE1LjYgMy40LTE4LjktMC4xLTE5LjktMS4xLTIwLjgtMi4yLTIxLjgtMi4zLTIzLjQtMS40LTI1LTAuNS0zMC4xIDEuNC0zNi4xIDcuMS00MC43IDExLjUtNDMuNyAxNy00NC42IDE4LjYtNDUuNSAyMC4zLTQ0LjYgMjEuMS00My44IDIxLjktNDMgMjIuNi00Mi4xIDIzLjctNDEuMyAyNC42LTQwLjQgMjUuNS00MC4xIDI2LjItMzkuNSAyNy4yLTM5IDI4LjMtMzkuMiAyOS4zLTM5LjYgMzAuMS0zOS45IDMwLjktNDIuOSAzOS00NC4xIDQyLjMtNDUuMyA0NS41LTQ2LjcgNDUtNDcuNiA0NS4xLTQ4LjYgNDUuMS00OS42IDQ1LjMtNTAuNyA0NS4zLTUxLjggNDUuNC01My42IDQ1LTU1LjEgNDMuNS01Ni42IDQxLjktNjEgMzguMi02MS4zIDMwLjItNjEuNiAyMi4zLTU2LjEgMTQuNC01NS4zIDEzLjMtNTQuNSAxMi4yLTQ0LjgtNS4xLTI4LjYtMTIuMS0xMi40LTE5LjItMTIuNC0xNy4xLTkuNC0xNi45LTYuNC0xNi44IDAuMy0xMy40IDEuOC05LjYgMy4zLTUuOSAzLjQtMi43IDMtMiAyLjYtMS4zIDEuNi0wLjkgMCAwTS0yOS43LTM4LjNDLTQwLjQtMzguMy01MC4zLTM1LjEtNTguNi0yOS42TC03OC45LTM2LjEtNzIuMy0xNi41Qy03OC42LTcuOC04Mi4zIDIuOC04Mi4zIDE0LjQtODIuMyA0My40LTU4LjcgNjcuMS0yOS43IDY3LjEtMC42IDY3LjEgMjMgNDMuNCAyMyAxNC40IDIzLTE0LjctMC42LTM4LjMtMjkuNy0zOC4zTS0yOS43IDc3LjZDLTY0LjYgNzcuNi05Mi45IDQ5LjMtOTIuOSAxNC40LTkyLjkgMi40LTg5LjYtOC44LTgzLjktMTguM0wtOTUuMy01Mi4yLTYwLjItNDFDLTUxLjItNDYtNDAuOC00OC45LTI5LjctNDguOSA1LjMtNDguOSAzMy42LTIwLjYgMzMuNiAxNC40IDMzLjYgNDkuMyA1LjMgNzcuNi0yOS43IDc3LjZcIi8+PC9zdmc+JyxcclxuICAgIF07XHJcbiAgICB2YXIgaWNvbj1zdmdbal07XHJcbiAgICB2YXIgY3NzPScgc3R5bGU9XCJ3aWR0aDonK3NpemUrJ3B4O2hlaWdodDonK3NpemUrJ3B4XCIgJztcclxuICAgIGljb249JzxzdmcgY2xhc3M9XCJzb2MtaWNvbi1zZCBpY29uLXNkLXN2Z1wiJytjc3MraWNvbi5zdWJzdHJpbmcoNCk7XHJcbiAgICBpY29uPSc+JytpY29uLnN1YnN0cmluZygwLCBpY29uLmxlbmd0aCAtIDEpO1xyXG4gIH1lbHNle1xyXG4gICAgaWNvbj0nc3R5bGU9XCJkaXNwbGF5OmlubGluZS1ibG9jazt2ZXJ0aWNhbC1hbGlnbjpib3R0b207d2lkdGg6JytzaXplKydweDtoZWlnaHQ6JytzaXplKydweDttYXJnaW46MCA2cHggNnB4IDA7cGFkZGluZzowO291dGxpbmU6bm9uZTtiYWNrZ3JvdW5kOnVybCgnICsgZiArIGZuICsgJykgLScgKyBzaXplICogaiArICdweCAwIG5vLXJlcGVhdDsgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcIidcclxuICB9XHJcbiAgcmV0dXJuIGljb247XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZhdihhKSB7XHJcbiAgdmFyIHRpdGxlID0gZG9jdW1lbnQudGl0bGU7XHJcbiAgdmFyIHVybCA9IGRvY3VtZW50LmxvY2F0aW9uO1xyXG4gIHRyeSB7XHJcbiAgICB3aW5kb3cuZXh0ZXJuYWwuQWRkRmF2b3JpdGUodXJsLCB0aXRsZSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgd2luZG93LnNpZGViYXIuYWRkUGFuZWwodGl0bGUsIHVybCwgJycpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBpZiAodHlwZW9mIChvcGVyYSkgPT0gJ29iamVjdCcgfHwgd2luZG93LnNpZGViYXIpIHtcclxuICAgICAgICBhLnJlbCA9ICdzaWRlYmFyJztcclxuICAgICAgICBhLnRpdGxlID0gdGl0bGU7XHJcbiAgICAgICAgYS51cmwgPSB1cmw7XHJcbiAgICAgICAgYS5ocmVmID0gdXJsO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGFsZXJ0KCfQndCw0LbQvNC40YLQtSBDdHJsLUQsINGH0YLQvtCx0Ysg0LTQvtCx0LDQstC40YLRjCDRgdGC0YDQsNC90LjRhtGDINCyINC30LDQutC70LDQtNC60LgnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbmRfcHJvbW8ocHJvbW8pe1xyXG4gICQuYWpheCh7XHJcbiAgICBtZXRob2Q6IFwicG9zdFwiLFxyXG4gICAgdXJsOiBcIi9hY2NvdW50L3Byb21vXCIsXHJcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgZGF0YToge3Byb21vOiBwcm9tb30sXHJcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgIGlmIChkYXRhLnRpdGxlICE9IG51bGwgJiYgZGF0YS5tZXNzYWdlICE9IG51bGwpIHtcclxuICAgICAgICBvbl9wcm9tbz0kKCcub25fcHJvbW8nKTtcclxuICAgICAgICBpZihvbl9wcm9tby5sZW5ndGg9PTAgfHwgIW9uX3Byb21vLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRhdGEubWVzc2FnZVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIG9uX3Byb21vLnNob3coKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcbiIsIiQoJy5zY3JvbGxfYm94LXRleHQnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG5cclxuICAgJCh0aGlzKS5jbG9zZXN0KCcuc2Nyb2xsX2JveCcpLmZpbmQoJy5zY3JvbGxfYm94LWl0ZW0nKS5yZW1vdmVDbGFzcygnc2Nyb2xsX2JveC1pdGVtLWxvdycpO1xyXG5cclxufSk7IiwidmFyIHBsYWNlaG9sZGVyID0gKGZ1bmN0aW9uKCl7XHJcbiAgZnVuY3Rpb24gb25CbHVyKCl7XHJcbiAgICB2YXIgaW5wdXRWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcbiAgICBpZiAoIGlucHV0VmFsdWUgPT0gXCJcIiApIHtcclxuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdmb2N1c2VkJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvbkZvY3VzKCl7XHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiBydW4ocGFyKSB7XHJcbiAgICB2YXIgZWxzO1xyXG4gICAgaWYoIXBhcilcclxuICAgICAgZWxzPSQoJy5mb3JtLWdyb3VwIFtwbGFjZWhvbGRlcl0nKTtcclxuICAgIGVsc2VcclxuICAgICAgZWxzPSQocGFyKS5maW5kKCcuZm9ybS1ncm91cCBbcGxhY2Vob2xkZXJdJyk7XHJcblxyXG4gICAgZWxzLmZvY3VzKG9uRm9jdXMpO1xyXG4gICAgZWxzLmJsdXIob25CbHVyKTtcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpPGVscy5sZW5ndGg7aSsrKXtcclxuICAgICAgdmFyIGVsPWVscy5lcShpKTtcclxuICAgICAgdmFyIHRleHQgPSBlbC5hdHRyKCdwbGFjZWhvbGRlcicpO1xyXG4gICAgICBlbC5hdHRyKCdwbGFjZWhvbGRlcicsJycpO1xyXG4gICAgICBpZih0ZXh0Lmxlbmd0aDwyKWNvbnRpbnVlO1xyXG4gICAgICAvL2lmKGVsLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykubGVuZ3RoPT0wKXJldHVybjtcclxuXHJcbiAgICAgIHZhciBpbnB1dFZhbHVlID0gZWwudmFsKCk7XHJcbiAgICAgIHZhciBlbF9pZCA9IGVsLmF0dHIoJ2lkJyk7XHJcbiAgICAgIGlmKCFlbF9pZCl7XHJcbiAgICAgICAgZWxfaWQ9J2VsX2Zvcm1zXycrTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKjEwMDAwKTtcclxuICAgICAgICBlbC5hdHRyKCdpZCcsZWxfaWQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKHRleHQuaW5kZXhPZignfCcpPjApe1xyXG4gICAgICAgIHRleHQ9dGV4dC5zcGxpdCgnfCcpO1xyXG4gICAgICAgIHRleHQ9dGV4dFswXStcIjxzcGFuPlwiK3RleHRbMV0rXCI8L3NwYW4+XCJcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGRpdiA9ICQoJzxsYWJlbC8+Jyx7XHJcbiAgICAgICAgJ2NsYXNzJzoncGxhY2Vob2xkZXInLFxyXG4gICAgICAgICdodG1sJzogdGV4dCxcclxuICAgICAgICAnZm9yJzplbF9pZFxyXG4gICAgICB9KTtcclxuICAgICAgZWwuYmVmb3JlKGRpdik7XHJcblxyXG4gICAgICBvbkZvY3VzLmJpbmQoZWwpKClcclxuICAgICAgb25CbHVyLmJpbmQoZWwpKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJ1bigpO1xyXG4gIHJldHVybiBydW47XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5hamF4X2xvYWQnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICB2YXIgdXJsID0gJCh0aGF0KS5hdHRyKCdocmVmJyk7XHJcbiAgICAgICAgdmFyIHRvcCA9IE1hdGgubWF4KGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wLCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wKTtcclxuICAgICAgICB2YXIgc3RvcmVzU29ydCA9ICQoJy5jYXRhbG9nLXN0b3Jlc19zb3J0Jyk7Ly/QsdC70L7QuiDRgdC+0YDRgtC40YDQvtCy0LrQuCDRjdC70LXQvNC10L3RgtC+0LJcclxuICAgICAgICB2YXIgdGFibGUgPSAkKCd0YWJsZS50YWJsZScpOy8v0YLQsNCx0LvQuNGG0LAg0LIgYWNjb3VudFxyXG4gICAgICAgIC8vc2Nyb2xsINGC0YPQtNCwINC40LvQuCDRgtGD0LTQsFxyXG4gICAgICAgIHZhciBzY3JvbGxUb3AgPSBzdG9yZXNTb3J0Lmxlbmd0aCA/ICQoc3RvcmVzU29ydFswXSkub2Zmc2V0KCkudG9wIC0gJCgnI2hlYWRlcj4qJykuZXEoMCkuaGVpZ2h0KCkgLSA1MCA6IDA7XHJcbiAgICAgICAgaWYgKHNjcm9sbFRvcCA9PT0wICYmIHRhYmxlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzY3JvbGxUb3AgPSAkKHRhYmxlWzBdKS5vZmZzZXQoKS50b3AgLSAkKCcjaGVhZGVyPionKS5lcSgwKS5oZWlnaHQoKSAtIDUwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJCh0aGF0KS5hZGRDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICAgICQuZ2V0KHVybCwgeydnJzonYWpheF9sb2FkJ30sIGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICB2YXIgY29udGVudCA9ICQoZGF0YSkuZmluZCgnI2NvbnRlbnQtd3JhcCcpLmh0bWwoKTtcclxuICAgICAgICAgICAgJCgnYm9keScpLmZpbmQoJyNjb250ZW50LXdyYXAnKS5odG1sKGNvbnRlbnQpO1xyXG4gICAgICAgICAgICBzaGFyZTQyKCk7Ly90INC+0YLQvtCx0YDQsNC30LjQu9C40YHRjCDQutC90L7Qv9C60Lgg0J/QvtC00LXQu9C40YLRjNGB0Y9cclxuICAgICAgICAgICAgc2RUb29sdGlwLnNldEV2ZW50cygpOy8v0YDQsNCx0L7RgtCw0LvQuCDRgtGD0LvRgtC40L/Ri1xyXG4gICAgICAgICAgICBiYW5uZXIucmVmcmVzaCgpOy8v0L7QsdC90L7QstC40YLRjCDQsdCw0L3QvdC10YAg0L7RgiDQs9GD0LPQu1xyXG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoXCJvYmplY3Qgb3Igc3RyaW5nXCIsIFwiVGl0bGVcIiwgdXJsKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0b3AgPiBzY3JvbGxUb3ApIHtcclxuICAgICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IHNjcm9sbFRvcH0sIDUwMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSkuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCh0aGF0KS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHt0eXBlOidlcnInLCAndGl0bGUnOmxnKCdlcnJvcicpLCAnbWVzc2FnZSc6bGcoJ2Vycm9yX3F1ZXJ5aW5nX2RhdGEnKX0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG5cclxufSkoKTtcclxuIiwiYmFubmVyID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgZnVuY3Rpb24gcmVmcmVzaCgpe1xyXG4gICAgICAgIGZvcihpPTA7aTwkKCcuYWRzYnlnb29nbGUnKS5sZW5ndGg7aSsrKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAoYWRzYnlnb29nbGUgPSB3aW5kb3cuYWRzYnlnb29nbGUgfHwgW10pLnB1c2goe30pO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtyZWZyZXNoOiByZWZyZXNofVxyXG59KSgpOyIsInZhciBjb3VudHJ5X3NlbGVjdCA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgJCgnLmhlYWRlci1jb3VudHJpZXNfZGlhbG9nLWNsb3NlJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZGlhbG9nQ2xvc2UodGhpcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLWNvdW50cmllc19kaWFsb2ctZGlhbG9nLWJ1dHRvbi1hcHBseScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBkYXRlID0gbmV3KERhdGUpO1xyXG4gICAgICAgIGRhdGUgPSBkYXRlLmdldFRpbWUoKTtcclxuICAgICAgICBzZXRDb29raWUoJ19zZF9jb3VudHJ5X2RpYWxvZ19jbG9zZScsIE1hdGgucm91bmQoZGF0ZS8xMDAwKSwgNyk7XHJcbiAgICAgICAgZGlhbG9nQ2xvc2UodGhpcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLWNvdW50cmllc19kaWFsb2ctZGlhbG9nLWJ1dHRvbi1jaG9vc2UnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQutC70LDRgdGBLCDQuNC80LjRgtC40YDQvtCy0LDRgtGMIGhvdmVyXHJcbiAgICAgICAgJCgnI2hlYWRlci11cGxpbmUtcmVnaW9uLXNlbGVjdC1idXR0b24nKS5hZGRDbGFzcyhcIm9wZW5cIik7XHJcbiAgICAgICAgZGlhbG9nQ2xvc2UodGhpcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLXVwbGluZV9sYW5nLWxpc3QnKS5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGRpYWxvZ0Nsb3NlID0gZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICQoZWxlbSkuY2xvc2VzdCgnLmhlYWRlci1jb3VudHJpZXNfZGlhbG9nJykuZmFkZU91dCgpO1xyXG4gICAgfTtcclxufSgpOyIsInZhciBub3RpZmljYXRpb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gIHZhciBjb250ZWluZXI7XHJcbiAgdmFyIG1vdXNlT3ZlciA9IDA7XHJcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xyXG4gIHZhciBhbmltYXRpb25FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCc7XHJcbiAgdmFyIHRpbWUgPSAxMDAwMDtcclxuXHJcbiAgdmFyIG5vdGlmaWNhdGlvbl9ib3ggPSBmYWxzZTtcclxuICB2YXIgaXNfaW5pdCA9IGZhbHNlO1xyXG4gIHZhciBjb25maXJtX29wdCA9IHtcclxuICAgIC8vIHRpdGxlOiBsZygnZGVsZXRpbmcnKSxcclxuICAgIC8vIHF1ZXN0aW9uOiBsZygnYXJlX3lvdV9zdXJlX3RvX2RlbGV0ZScpLFxyXG4gICAgLy8gYnV0dG9uWWVzOiBsZygneWVzJyksXHJcbiAgICAvLyBidXR0b25ObzogbGcoJ25vJyksXHJcbiAgICBjYWxsYmFja1llczogZmFsc2UsXHJcbiAgICBjYWxsYmFja05vOiBmYWxzZSxcclxuICAgIG9iajogZmFsc2UsXHJcbiAgICBidXR0b25UYWc6ICdkaXYnLFxyXG4gICAgYnV0dG9uWWVzRG9wOiAnJyxcclxuICAgIGJ1dHRvbk5vRG9wOiAnJ1xyXG4gIH07XHJcbiAgdmFyIGFsZXJ0X29wdCA9IHtcclxuICAgIHRpdGxlOiBcIlwiLFxyXG4gICAgcXVlc3Rpb246ICdtZXNzYWdlJyxcclxuICAgIC8vIGJ1dHRvblllczogbGcoJ3llcycpLFxyXG4gICAgY2FsbGJhY2tZZXM6IGZhbHNlLFxyXG4gICAgYnV0dG9uVGFnOiAnZGl2JyxcclxuICAgIG9iajogZmFsc2VcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiB0ZXN0SXBob25lKCkge1xyXG4gICAgaWYgKCEvKGlQaG9uZXxpUGFkfGlQb2QpLiooT1MgMTEpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSByZXR1cm47XHJcbiAgICBub3RpZmljYXRpb25fYm94LmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guY3NzKCd0b3AnLCAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgaXNfaW5pdCA9IHRydWU7XHJcbiAgICBub3RpZmljYXRpb25fYm94ID0gJCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcclxuICAgIGlmIChub3RpZmljYXRpb25fYm94Lmxlbmd0aCA+IDApcmV0dXJuO1xyXG5cclxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XHJcbiAgICBub3RpZmljYXRpb25fYm94ID0gJCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcclxuXHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2NvbnRyb2wnLCBjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgJy5ub3RpZnlfY2xvc2UnLCBjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgY2xvc2VNb2RhbEZvbik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCkge1xyXG4gICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgJCgnLm5vdGlmaWNhdGlvbl9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbCgnJyk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpIHtcclxuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcbiAgICBpZiAodGFyZ2V0LmNsYXNzTmFtZSA9PSBcIm5vdGlmaWNhdGlvbl9ib3hcIikge1xyXG4gICAgICBjbG9zZU1vZGFsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB2YXIgX3NldFVwTGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubm90aWZpY2F0aW9uX2Nsb3NlJywgX2Nsb3NlUG9wdXApO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uTGVhdmUpO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25FbnRlciA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgaWYgKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAodGltZXJDbGVhckFsbCAhPSBudWxsKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lckNsZWFyQWxsKTtcclxuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICB2YXIgb3B0aW9uID0gJCh0aGlzKS5kYXRhKCdvcHRpb24nKTtcclxuICAgICAgaWYgKG9wdGlvbi50aW1lcikge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChvcHRpb24udGltZXIpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDE7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9vbkxlYXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcclxuICAgICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICB2YXIgb3B0aW9uID0gJHRoaXMuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmIChvcHRpb24udGltZSA+IDApIHtcclxuICAgICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQob3B0aW9uLmNsb3NlKSwgb3B0aW9uLnRpbWUgLSAxNTAwICsgMTAwICogaSk7XHJcbiAgICAgICAgJHRoaXMuZGF0YSgnb3B0aW9uJywgb3B0aW9uKVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDA7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9jbG9zZVBvcHVwID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICB9KTtcclxuICAgICR0aGlzLmFkZENsYXNzKCdub3RpZmljYXRpb25faGlkZScpXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcclxuICAgIGFsZXJ0X29wdCA9IG9iamVjdHMoYWxlcnRfb3B0LCB7XHJcbiAgICAgICAgYnV0dG9uWWVzOiBsZygneWVzJylcclxuICAgIH0pO1xyXG4gICAgZGF0YSA9IG9iamVjdHMoYWxlcnRfb3B0LCBkYXRhKTtcclxuXHJcbiAgICBpZiAoIWlzX2luaXQpaW5pdCgpO1xyXG4gICAgdGVzdElwaG9uZSgpO1xyXG5cclxuICAgIG5vdHlmeV9jbGFzcyA9ICdub3RpZnlfYm94ICc7XHJcbiAgICBpZiAoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzICs9IGRhdGEubm90eWZ5X2NsYXNzO1xyXG5cclxuICAgIGJveF9odG1sID0gJzxkaXYgY2xhc3M9XCInICsgbm90eWZ5X2NsYXNzICsgJ1wiPic7XHJcbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCArPSAnPGRpdj4nK2RhdGEudGl0bGUrJzwvZGl2Pic7XHJcbiAgICBib3hfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGlmIChkYXRhLmJ1dHRvblllcyB8fCBkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzwnICsgZGF0YS5idXR0b25UYWcgKyAnIGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIiAnICsgZGF0YS5idXR0b25ZZXNEb3AgKyAnPicgKyBkYXRhLmJ1dHRvblllcyArICc8LycgKyBkYXRhLmJ1dHRvblRhZyArICc+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnICsgZGF0YS5idXR0b25UYWcgKyAnIGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiICcgKyBkYXRhLmJ1dHRvbk5vRG9wICsgJz4nICsgZGF0YS5idXR0b25ObyArICc8LycgKyBkYXRhLmJ1dHRvblRhZyArICc+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xyXG5cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgfSwgMTAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xyXG4gICAgY29uZmlybV9vcHQgPSBvYmplY3RzKGNvbmZpcm1fb3B0LCB7XHJcbiAgICAgICAgdGl0bGU6IGxnKCdkZWxldGluZycpLFxyXG4gICAgICAgIHF1ZXN0aW9uOiBsZygnYXJlX3lvdV9zdXJlX3RvX2RlbGV0ZScpLFxyXG4gICAgICAgIGJ1dHRvblllczogbGcoJ3llcycpLFxyXG4gICAgICAgIGJ1dHRvbk5vOiBsZygnbm8nKVxyXG4gICAgfSk7XHJcbiAgICBkYXRhID0gb2JqZWN0cyhjb25maXJtX29wdCwgZGF0YSk7XHJcbiAgICBpZiAodHlwZW9mKGRhdGEuY2FsbGJhY2tZZXMpID09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHZhciBjb2RlID0gJ2RhdGEuY2FsbGJhY2tZZXMgPSBmdW5jdGlvbigpeycrZGF0YS5jYWxsYmFja1llcysnfSc7XHJcbiAgICAgIGV2YWwoY29kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc19pbml0KWluaXQoKTtcclxuICAgIHRlc3RJcGhvbmUoKTtcclxuICAgIC8vYm94X2h0bWw9JzxkaXYgY2xhc3M9XCJub3RpZnlfYm94XCI+JztcclxuXHJcbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xyXG4gICAgaWYgKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcyArPSBkYXRhLm5vdHlmeV9jbGFzcztcclxuXHJcbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xyXG5cclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sICs9IGRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGlmIChkYXRhLmJ1dHRvblllcyB8fCBkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xyXG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG4gICAgaWYgKGRhdGEuY2FsbGJhY2tZZXMgIT0gZmFsc2UpIHtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrWWVzLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuICAgIGlmIChkYXRhLmNhbGxiYWNrTm8gIT0gZmFsc2UpIHtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsIGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sIDEwMClcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcclxuICAgIHZhciBvcHRpb24gPSB7dGltZTogKGRhdGEudGltZSB8fCBkYXRhLnRpbWUgPT09IDApID8gZGF0YS50aW1lIDogdGltZX07XHJcbiAgICBpZiAoIWNvbnRlaW5lcikge1xyXG4gICAgICBjb250ZWluZXIgPSAkKCc8dWwvPicsIHtcclxuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XHJcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xyXG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9pdGVtJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSkge1xyXG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNsb3NlID0gJCgnPHNwYW4vPicsIHtcclxuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25fY2xvc2UnXHJcbiAgICB9KTtcclxuICAgIG9wdGlvbi5jbG9zZSA9IGNsb3NlO1xyXG4gICAgbGkuYXBwZW5kKGNsb3NlKTtcclxuXHJcbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciB0aXRsZSA9ICQoJzxoNS8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRleHQgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90ZXh0XCJcclxuICAgIH0pO1xyXG4gICAgdGV4dC5odG1sKGRhdGEubWVzc2FnZSk7XHJcblxyXG4gICAgaWYgKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcclxuICAgICAgfSk7XHJcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XHJcbiAgICAgIHZhciB3cmFwID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIndyYXBcIlxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHdyYXAuYXBwZW5kKGltZyk7XHJcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh3cmFwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRleHQpO1xyXG4gICAgfVxyXG4gICAgbGkuYXBwZW5kKGNvbnRlbnQpO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcclxuICAgIC8vICAgdmFyIHRpdGxlID0gJCgnPHAvPicsIHtcclxuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxyXG4gICAgLy8gICB9KTtcclxuICAgIC8vICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcclxuICAgIC8vICAgbGkuYXBwZW5kKHRpdGxlKTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xyXG4gICAgLy8gICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xyXG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxyXG4gICAgLy8gICB9KTtcclxuICAgIC8vICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XHJcbiAgICAvLyAgIGxpLmFwcGVuZChpbWcpO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuICAgIC8vIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XHJcbiAgICAvLyAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxyXG4gICAgLy8gfSk7XHJcbiAgICAvLyBjb250ZW50Lmh0bWwoZGF0YS5tZXNzYWdlKTtcclxuICAgIC8vXHJcbiAgICAvLyBsaS5hcHBlbmQoY29udGVudCk7XHJcbiAgICAvL1xyXG4gICAgY29udGVpbmVyLmFwcGVuZChsaSk7XHJcblxyXG4gICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xyXG4gICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQoY2xvc2UpLCBvcHRpb24udGltZSk7XHJcbiAgICB9XHJcbiAgICBsaS5kYXRhKCdvcHRpb24nLCBvcHRpb24pXHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYWxlcnQ6IGFsZXJ0LFxyXG4gICAgY29uZmlybTogY29uZmlybSxcclxuICAgIG5vdGlmaTogbm90aWZpXHJcbiAgfTtcclxuXHJcbn0pKCk7XHJcblxyXG5cclxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XHJcbiAgZGF0YSA9IGVsLmRhdGEoKTtcclxuXHJcbiAgZGF0YS5xdWVzdGlvbiA9IGVsLmh0bWwoKTtcclxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcbn0pO1xyXG5cclxuJCgnW3JlZj1jb25maXJtXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBlbCA9ICQoJHRoaXMuYXR0cignaHJlZicpKTtcclxuICBkYXRhID0gZWwuZGF0YSgpO1xyXG4gIGRhdGEucXVlc3Rpb24gPSBlbC5odG1sKCk7XHJcbiAgbm90aWZpY2F0aW9uLmNvbmZpcm0oZGF0YSk7XHJcbn0pO1xyXG5cclxuXHJcbiQoJy5kaXNhYmxlZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBkYXRhID0gJHRoaXMuZGF0YSgpO1xyXG4gIGlmIChkYXRhWydidXR0b25feWVzJ10pIHtcclxuICAgIGRhdGFbJ2J1dHRvblllcyddID0gZGF0YVsnYnV0dG9uX3llcyddO1xyXG4gIH1cclxuICBpZiAoZGF0YVsnYnV0dG9uX3llcyddID09PSBmYWxzZSkge1xyXG4gICAgZGF0YVsnYnV0dG9uWWVzJ10gPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tb2RhbHNfb3BlbicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcblxyXG4gICAgLy/Qv9GA0Lgg0L7RgtC60YDRi9GC0LjQuCDRhNC+0YDQvNGLINGA0LXQs9C40YHRgtGA0LDRhtC40Lgg0LfQsNC60YDRi9GC0YwsINC10YHQu9C4INC+0YLRgNGL0YLQviAtINC/0L7Qv9Cw0L8g0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40Y8g0LrRg9C/0L7QvdCwINCx0LXQtyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4XHJcbiAgICB2YXIgcG9wdXAgPSAkKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikuZGF0YSgncG9wdXAnKTtcclxuICAgIGlmIChwb3B1cCkge1xyXG4gICAgICBwb3B1cC5jbG9zZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcG9wdXAgPSAkKCdkaXYucG9wdXBfY29udCwgZGl2LnBvcHVwX2JhY2snKTtcclxuICAgICAgaWYgKHBvcHVwKSB7XHJcbiAgICAgICAgcG9wdXAuaGlkZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhyZWYgPSB0aGlzLmhyZWYuc3BsaXQoJyMnKTtcclxuICAgIGhyZWYgPSBocmVmW2hyZWYubGVuZ3RoIC0gMV07XHJcbiAgICB2YXIgbm90eUNsYXNzID0gJCh0aGlzKS5kYXRhKCdub3R5Y2xhc3MnKTtcclxuICAgIHZhciBjbGFzc19uYW1lPShocmVmLmluZGV4T2YoJ3ZpZGVvJykgPT09IDAgPyAnbW9kYWxzLWZ1bGxfc2NyZWVuJyA6ICdub3RpZnlfd2hpdGUnKSArICcgJyArIG5vdHlDbGFzcztcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxyXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibG9hZGluZyBcIiArIGNsYXNzX25hbWUsXHJcbiAgICAgIHF1ZXN0aW9uOiAnJ1xyXG4gICAgfTtcclxuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuXHJcbiAgICAkLmdldCgnLycgKyBocmVmLCBmdW5jdGlvbiAoZGF0YSkge1xyXG5cclxuICAgICAgdmFyIGRhdGFfbXNnID0ge1xyXG4gICAgICAgIGJ1dHRvblllczogZmFsc2UsXHJcbiAgICAgICAgbm90eWZ5X2NsYXNzOiBjbGFzc19uYW1lLFxyXG4gICAgICAgIHF1ZXN0aW9uOiBkYXRhLmh0bWwsXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpZiAoZGF0YS50aXRsZSkge1xyXG4gICAgICAgIGRhdGFfbXNnWyd0aXRsZSddPWRhdGEudGl0bGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qaWYoZGF0YS5idXR0b25ZZXMpe1xyXG4gICAgICAgIGRhdGFfbXNnWydidXR0b25ZZXMnXT1kYXRhLmJ1dHRvblllcztcclxuICAgICAgfSovXHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhX21zZyk7XHJcbiAgICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcclxuICAgIH0sICdqc29uJyk7XHJcblxyXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuXHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcubW9kYWxzX3BvcHVwJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIC8v0L/RgNC4INC60LvQuNC60LUg0LLRgdC/0LvRi9Cy0LDRiNC60LAg0YEg0YLQtdC60YHRgtC+0LxcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciB0aXRsZSA9ICQodGhhdCkuZGF0YSgnb3JpZ2luYWwtaCcpO1xyXG4gICAgaWYoIXRpdGxlKXRpdGxlPVwiXCI7XHJcbiAgICB2YXIgaHRtbCA9ICQoJyMnICsgJCh0aGF0KS5kYXRhKCdvcmlnaW5hbC1odG1sJykpLmh0bWwoKTtcclxuICAgIHZhciBjb250ZW50ID0gaHRtbCA/IGh0bWwgOiAkKHRoYXQpLmRhdGEoJ29yaWdpbmFsLXRpdGxlJyk7XHJcbiAgICB2YXIgbm90eUNsYXNzID0gJCh0aGF0KS5kYXRhKCdub3R5Y2xhc3MnKTtcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxyXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibm90aWZ5X3doaXRlIFwiICsgbm90eUNsYXNzLFxyXG4gICAgICBxdWVzdGlvbjogY29udGVudCxcclxuICAgICAgdGl0bGU6IHRpdGxlXHJcbiAgICB9O1xyXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KVxyXG59KCkpO1xyXG4iLCIkKCcuZm9vdGVyLW1lbnUtdGl0bGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKSkge1xyXG4gICAgJHRoaXMucmVtb3ZlQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKVxyXG4gIH0gZWxzZSB7XHJcbiAgICAkKCcuZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpO1xyXG4gIH1cclxuXHJcbn0pO1xyXG4iLCIkKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBzdGFyTm9taW5hdGlvbihpbmRleCkge1xyXG4gICAgdmFyIHN0YXJzID0gJChcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIik7XHJcbiAgICBzdGFycy5hZGRDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcclxuICAgICAgc3RhcnMuZXEoaSkucmVtb3ZlQ2xhc3MoXCJyYXRpbmctc3Rhci1vcGVuXCIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJChkb2N1bWVudCkub24oXCJtb3VzZW92ZXJcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuICB9KS5vbihcIm1vdXNlbGVhdmVcIiwgXCIucmF0aW5nLXdyYXBwZXJcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIHN0YXJOb21pbmF0aW9uKCQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCkpO1xyXG4gIH0pLm9uKFwiY2xpY2tcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuXHJcbiAgICAkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuICB9KTtcclxufSk7XHJcbiIsIi8v0LjQt9Cx0YDQsNC90L3QvtC1XHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAkKFwiLmZhdm9yaXRlLWxpbmtcIikub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICB2YXIgc2VsZiA9ICQodGhpcyk7XHJcbiAgICB2YXIgdHlwZSA9IHNlbGYuYXR0cihcImRhdGEtc3RhdGVcIiksXHJcbiAgICAgIGFmZmlsaWF0ZV9pZCA9IHNlbGYuYXR0cihcImRhdGEtYWZmaWxpYXRlLWlkXCIpO1xyXG5cclxuICAgIGlmICghYWZmaWxpYXRlX2lkKSB7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgIHRpdGxlOiBsZyhcInJlZ2lzdHJhdGlvbl9pc19yZXF1aXJlZFwiKSxcclxuICAgICAgICBtZXNzYWdlOiBsZyhcImFkZF90b19mYXZvcml0ZV9tYXlfb25seV9yZWdpc3RlcmVkX3VzZXJcIiksXHJcbiAgICAgICAgdHlwZTogJ2VycidcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlbGYuaGFzQ2xhc3MoJ2Rpc2FibGVkJykpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBzZWxmLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgIC8qaWYodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgc2VsZi5maW5kKFwiLml0ZW1faWNvblwiKS5yZW1vdmVDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgIH0qL1xyXG5cclxuICAgICQucG9zdChcIi9hY2NvdW50L2Zhdm9yaXRlc1wiLCB7XHJcbiAgICAgIFwidHlwZVwiOiB0eXBlLFxyXG4gICAgICBcImFmZmlsaWF0ZV9pZFwiOiBhZmZpbGlhdGVfaWRcclxuICAgIH0sIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgIGlmIChkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKCdzdmcnKS5yZW1vdmVDbGFzcyhcInNwaW5cIik7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTogZGF0YS5lcnJvciwgdHlwZTogJ2VycicsICd0aXRsZSc6IChkYXRhLnRpdGxlID8gZGF0YS50aXRsZSA6IGZhbHNlKX0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgbWVzc2FnZTogZGF0YS5tc2csXHJcbiAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICd0aXRsZSc6IChkYXRhLnRpdGxlID8gZGF0YS50aXRsZSA6IGZhbHNlKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHNlbGYuYXR0cih7XHJcbiAgICAgICAgXCJkYXRhLXN0YXRlXCI6IGRhdGFbXCJkYXRhLXN0YXRlXCJdLFxyXG4gICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiOiBkYXRhWydkYXRhLW9yaWdpbmFsLXRpdGxlJ11cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb2ZmXCIpLmFkZENsYXNzKFwiaW5fZmF2X29uXCIpO1xyXG4gICAgICAgIHNlbGYuZGF0YSgnb3JpZ2luYWwtdGl0bGUnLCBsZyhcImZhdm9yaXRlc19zaG9wX3JlbW92ZVwiKSk7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRlbGV0ZVwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb25cIikuYWRkQ2xhc3MoXCJpbl9mYXZfb2ZmXCIpO1xyXG4gICAgICAgIHNlbGYuZGF0YSgnb3JpZ2luYWwtdGl0bGUnLCBsZyhcImZhdm9yaXRlc19zaG9wX2FkZFwiKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LCAnanNvbicpLmZhaWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICBtZXNzYWdlOiBsZyhcInRoZXJlX2lzX3RlY2huaWNhbF93b3Jrc19ub3dcIiksXHJcbiAgICAgICAgdHlwZTogJ2VycidcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb2ZmXCIpLmFkZENsYXNzKFwiaW5fZmF2X29uXCIpO1xyXG4gICAgICAgIHNlbGYuZGF0YSgnb3JpZ2luYWwtdGl0bGUnLCBsZyhcImZhdm9yaXRlc19zaG9wX3JlbW92ZVwiKSk7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRlbGV0ZVwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb25cIikuYWRkQ2xhc3MoXCJpbl9mYXZfb2ZmXCIpO1xyXG4gICAgICAgIHNlbGYuZGF0YSgnb3JpZ2luYWwtdGl0bGUnLCBsZyhcImZhdm9yaXRlc19zaG9wX2FkZFwiKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9KVxyXG4gIH0pO1xyXG59KTtcclxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5zY3JvbGxfdG8nKS5jbGljayhmdW5jdGlvbiAoZSkgeyAvLyDQu9C+0LLQuNC8INC60LvQuNC6INC/0L4g0YHRgdGL0LvQutC1INGBINC60LvQsNGB0YHQvtC8IGdvX3RvXHJcbiAgICB2YXIgc2Nyb2xsX2VsID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7IC8vINCy0L7Qt9GM0LzQtdC8INGB0L7QtNC10YDQttC40LzQvtC1INCw0YLRgNC40LHRg9GC0LAgaHJlZiwg0LTQvtC70LbQtdC9INCx0YvRgtGMINGB0LXQu9C10LrRgtC+0YDQvtC8LCDRgi7QtS4g0L3QsNC/0YDQuNC80LXRgCDQvdCw0YfQuNC90LDRgtGM0YHRjyDRgSAjINC40LvQuCAuXHJcbiAgICBzY3JvbGxfZWwgPSAkKHNjcm9sbF9lbCk7XHJcbiAgICBpZiAoc2Nyb2xsX2VsLmxlbmd0aCAhPSAwKSB7IC8vINC/0YDQvtCy0LXRgNC40Lwg0YHRg9GJ0LXRgdGC0LLQvtCy0LDQvdC40LUg0Y3Qu9C10LzQtdC90YLQsCDRh9GC0L7QsdGLINC40LfQsdC10LbQsNGC0Ywg0L7RiNC40LHQutC4XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogc2Nyb2xsX2VsLm9mZnNldCgpLnRvcCAtICQoJyNoZWFkZXI+KicpLmVxKDApLmhlaWdodCgpIC0gNTB9LCA1MDApOyAvLyDQsNC90LjQvNC40YDRg9C10Lwg0YHQutGA0L7QvtC70LjQvdCzINC6INGN0LvQtdC80LXQvdGC0YMgc2Nyb2xsX2VsXHJcbiAgICAgIGlmIChzY3JvbGxfZWwuaGFzQ2xhc3MoJ2FjY29yZGlvbicpICYmICFzY3JvbGxfZWwuaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAgIHNjcm9sbF9lbC5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wnKS5jbGljaygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7IC8vINCy0YvQutC70Y7Rh9Cw0LXQvCDRgdGC0LDQvdC00LDRgNGC0L3QvtC1INC00LXQudGB0YLQstC40LVcclxuICB9KTtcclxufSk7XHJcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAkKFwiYm9keVwiKS5vbignY2xpY2snLCAnLnNldF9jbGlwYm9hcmQnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgIGNvcHlUb0NsaXBib2FyZCgkdGhpcy5kYXRhKCdjbGlwYm9hcmQnKSwgJHRoaXMuZGF0YSgnY2xpcGJvYXJkLW5vdGlmeScpKTtcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gY29weVRvQ2xpcGJvYXJkKGNvZGUsIG1zZykge1xyXG4gICAgdmFyICR0ZW1wID0gJChcIjxpbnB1dD5cIik7XHJcbiAgICAkKFwiYm9keVwiKS5hcHBlbmQoJHRlbXApO1xyXG4gICAgJHRlbXAudmFsKGNvZGUpLnNlbGVjdCgpO1xyXG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJjb3B5XCIpO1xyXG4gICAgJHRlbXAucmVtb3ZlKCk7XHJcblxyXG4gICAgaWYgKCFtc2cpIHtcclxuICAgICAgbXNnID0gbGcoXCJkYXRhX2NvcGllZF90b19jbGlwYm9hcmRcIik7XHJcbiAgICB9XHJcbiAgICBub3RpZmljYXRpb24ubm90aWZpKHsndHlwZSc6ICdpbmZvJywgJ21lc3NhZ2UnOiBtc2csICd0aXRsZSc6IGxnKCdzdWNjZXNzJyl9KVxyXG4gIH1cclxuXHJcbiAgJChcImJvZHlcIikub24oJ2NsaWNrJywgXCJpbnB1dC5saW5rXCIsIGZ1bmN0aW9uICgpIHtcdC8vINC/0L7Qu9GD0YfQtdC90LjQtSDRhNC+0LrRg9GB0LAg0YLQtdC60YHRgtC+0LLRi9C8INC/0L7Qu9C10Lwt0YHRgdGL0LvQutC+0LlcclxuICAgICQodGhpcykuc2VsZWN0KCk7XHJcbiAgfSk7XHJcbn0pO1xyXG4iLCIvL9GB0LrQsNGH0LjQstCw0L3QuNC1INC60LDRgNGC0LjQvdC+0LpcclxuKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKSB7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICB2YXIgaW1nID0gZGF0YS5pbWc7XHJcbiAgICBpbWcud3JhcCgnPGRpdiBjbGFzcz1cImRvd25sb2FkXCI+PC9kaXY+Jyk7XHJcbiAgICB2YXIgd3JhcCA9IGltZy5wYXJlbnQoKTtcclxuICAgICQoJy5kb3dubG9hZF90ZXN0JykuYXBwZW5kKGRhdGEuZWwpO1xyXG4gICAgc2l6ZSA9IGRhdGEuZWwud2lkdGgoKSArIFwieFwiICsgZGF0YS5lbC5oZWlnaHQoKTtcclxuXHJcbiAgICB3PWRhdGEuZWwud2lkdGgoKSowLjg7XHJcbiAgICBpbWdcclxuICAgICAgLmhlaWdodCgnYXV0bycpXHJcbiAgICAgIC8vLndpZHRoKHcpXHJcbiAgICAgIC5jc3MoJ21heC13aWR0aCcsJzk5JScpO1xyXG5cclxuXHJcbiAgICBkYXRhLmVsLnJlbW92ZSgpO1xyXG4gICAgd3JhcC5hcHBlbmQoJzxzcGFuPicgKyBzaXplICsgJzwvc3Bhbj4gPGEgaHJlZj1cIicgKyBkYXRhLnNyYyArICdcIiBkb3dubG9hZD4nK2xnKFwiZG93bmxvYWRcIikrJzwvYT4nKTtcclxuICB9XHJcblxyXG4gIHZhciBpbWdzID0gJCgnLmRvd25sb2Fkc19pbWcgaW1nJyk7XHJcbiAgaWYoaW1ncy5sZW5ndGg9PTApcmV0dXJuO1xyXG5cclxuICAkKCdib2R5JykuYXBwZW5kKCc8ZGl2IGNsYXNzPWRvd25sb2FkX3Rlc3Q+PC9kaXY+Jyk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgaW1nID0gaW1ncy5lcShpKTtcclxuICAgIHZhciBzcmMgPSBpbWcuYXR0cignc3JjJyk7XHJcbiAgICBpbWFnZSA9ICQoJzxpbWcvPicsIHtcclxuICAgICAgc3JjOiBzcmNcclxuICAgIH0pO1xyXG4gICAgZGF0YSA9IHtcclxuICAgICAgc3JjOiBzcmMsXHJcbiAgICAgIGltZzogaW1nLFxyXG4gICAgICBlbDogaW1hZ2VcclxuICAgIH07XHJcbiAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxyXG4gIH1cclxufSkoKTtcclxuXHJcbi8v0YfRgtC+INCxINC40YTRgNC10LnQvNGLINC4INC60LDRgNGC0LjQvdC60Lgg0L3QtSDQstGL0LvQsNC30LjQu9C4XHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgLyptX3cgPSAkKCcudGV4dC1jb250ZW50Jykud2lkdGgoKVxyXG4gICBpZiAobV93IDwgNTApbV93ID0gc2NyZWVuLndpZHRoIC0gNDAqL1xyXG4gIHZhciBtdz1zY3JlZW4ud2lkdGgtNDA7XHJcblxyXG4gIGZ1bmN0aW9uIG9wdGltYXNlKGVsKXtcclxuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnQoKTtcclxuICAgIGlmKHBhcmVudC5sZW5ndGg9PTAgfHwgcGFyZW50WzBdLnRhZ05hbWU9PVwiQVwiKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYoZWwuaGFzQ2xhc3MoJ25vX29wdG9taXplJykpcmV0dXJuO1xyXG5cclxuICAgIG1fdyA9IHBhcmVudC53aWR0aCgpLTMwO1xyXG4gICAgdmFyIHc9ZWwud2lkdGgoKTtcclxuXHJcbiAgICAvL9Cx0LXQtyDRjdGC0L7Qs9C+INC/0LvRjtGJ0LjRgiDQsdCw0L3QtdGA0Ysg0LIg0LDQutCw0YDQtNC40L7QvdC1XHJcbiAgICBpZih3PDMgfHwgbV93PDMpe1xyXG4gICAgICBlbFxyXG4gICAgICAgIC5oZWlnaHQoJ2F1dG8nKVxyXG4gICAgICAgIC5jc3MoJ21heC13aWR0aCcsJzk5JScpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZWwud2lkdGgoJ2F1dG8nKTtcclxuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSU1HXCIgJiYgdz5lbC53aWR0aCgpKXc9ZWwud2lkdGgoKTtcclxuXHJcbiAgICBpZiAobXc+NTAgJiYgbV93ID4gbXcpbV93ID0gbXc7XHJcbiAgICBpZiAodz5tX3cpIHtcclxuICAgICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIil7XHJcbiAgICAgICAgayA9IHcgLyBtX3c7XHJcbiAgICAgICAgZWwuaGVpZ2h0KGVsLmhlaWdodCgpIC8gayk7XHJcbiAgICAgIH1cclxuICAgICAgZWwud2lkdGgobV93KVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGVsLndpZHRoKHcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICB2YXIgZWw9JCh0aGlzKTtcclxuICAgIG9wdGltYXNlKGVsKTtcclxuICB9XHJcblxyXG4gIHZhciBwID0gJCgnLmNvbnRlbnQtd3JhcCBpbWcsLmNvbnRlbnQtd3JhcCBpZnJhbWUnKTtcclxuICAkKCcuY29udGVudC13cmFwIGltZzpub3QoLm5vX29wdG9taXplKScpLmhlaWdodCgnYXV0bycpO1xyXG4gIC8vJCgnLmNvbnRhaW5lciBpbWcnKS53aWR0aCgnYXV0bycpO1xyXG4gIGZvciAoaSA9IDA7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBlbCA9IHAuZXEoaSk7XHJcbiAgICBpZihlbFswXS50YWdOYW1lPT1cIklGUkFNRVwiKSB7XHJcbiAgICAgIG9wdGltYXNlKGVsKTtcclxuICAgIH1lbHNle1xyXG4gICAgICB2YXIgc3JjPWVsLmF0dHIoJ3NyYycpO1xyXG4gICAgICBpbWFnZSA9ICQoJzxpbWcvPicsIHtcclxuICAgICAgICBzcmM6IHNyY1xyXG4gICAgICB9KTtcclxuICAgICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChlbCkpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG5cclxuLy/Qn9GA0L7QstC10YDQutCwINCx0LjRgtGLINC60LDRgNGC0LjQvdC+0LouXHJcbi8vICEhISEhIVxyXG4vLyDQndGD0LbQvdC+INC/0YDQvtCy0LXRgNC40YLRjC4g0JLRi9C30YvQstCw0LvQviDQs9C70Y7QutC4INC/0YDQuCDQsNCy0YLQvtGA0LfQsNGG0LjQuCDRh9C10YDQtdC3INCk0JEg0L3QsCDRgdCw0YTQsNGA0LhcclxuLy8gISEhISEhXHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgaWYoZGF0YS50YWdOYW1lKXtcclxuICAgICAgZGF0YT0kKGRhdGEpLmRhdGEoJ2RhdGEnKTtcclxuICAgIH1cclxuICAgIHZhciBpbWc9ZGF0YS5pbWc7XHJcbiAgICAvL3ZhciB0bj1pbWdbMF0udGFnTmFtZTtcclxuICAgIC8vaWYgKHRuIT0nSU1HJ3x8dG4hPSdESVYnfHx0biE9J1NQQU4nKXJldHVybjtcclxuICAgIGlmKGRhdGEudHlwZT09MCkge1xyXG4gICAgICBpbWcuYXR0cignc3JjJywgZGF0YS5zcmMpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcrZGF0YS5zcmMrJyknKTtcclxuICAgICAgaW1nLnJlbW92ZUNsYXNzKCdub19hdmEnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHRlc3RJbWcoaW1ncyxub19pbWcpe1xyXG4gICAgaWYoIWltZ3MgfHwgaW1ncy5sZW5ndGg9PTApcmV0dXJuO1xyXG5cclxuICAgIGlmKCFub19pbWcpbm9faW1nPScvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJztcclxuXHJcbiAgICBmb3IgKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspe1xyXG4gICAgICB2YXIgaW1nPWltZ3MuZXEoaSk7XHJcbiAgICAgIGlmKGltZy5oYXNDbGFzcygnbm9fYXZhJykpe1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZGF0YT17XHJcbiAgICAgICAgaW1nOmltZ1xyXG4gICAgICB9O1xyXG4gICAgICB2YXIgc3JjO1xyXG4gICAgICBpZihpbWdbMF0udGFnTmFtZT09XCJJTUdcIil7XHJcbiAgICAgICAgZGF0YS50eXBlPTA7XHJcbiAgICAgICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcclxuICAgICAgICBpbWcuYXR0cignc3JjJyxub19pbWcpO1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICBkYXRhLnR5cGU9MTtcclxuICAgICAgICBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xyXG4gICAgICAgIGlmKCFzcmMpY29udGludWU7XHJcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCd1cmwoXCInLCcnKTtcclxuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ1wiKScsJycpO1xyXG4gICAgICAgIC8v0LIg0YHRhNGE0LDRgNC4INCyINC80LDQuiDQvtGBINCx0LXQtyDQutC+0LLRi9GH0LXQui4g0LLQtdC30LTQtSDRgSDQutCw0LLRi9GH0LrQsNC80LhcclxuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybCgnLCcnKTtcclxuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJyknLCcnKTtcclxuICAgICAgICBpbWcuYWRkQ2xhc3MoJ25vX2F2YScpO1xyXG4gICAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytub19pbWcrJyknKTtcclxuICAgICAgfVxyXG4gICAgICBkYXRhLnNyYz1zcmM7XHJcbiAgICAgIHZhciBpbWFnZT0kKCc8aW1nLz4nLHtcclxuICAgICAgICBzcmM6c3JjXHJcbiAgICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSk7XHJcbiAgICAgIGltYWdlLmRhdGEoJ2RhdGEnLGRhdGEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy/RgtC10YHRgiDQu9C+0LPQviDQvNCw0LPQsNC30LjQvdCwXHJcbiAgdmFyIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJyk7XHJcbiAgaW1ncz1pbWdzLmZpbmQoJy5sb2dvIGltZycpO1xyXG4gIHRlc3RJbWcoaW1ncywnL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZycpO1xyXG5cclxuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxyXG4gIGltZ3M9JCgnLmNvbW1lbnQtcGhvdG8sLnNjcm9sbF9ib3gtYXZhdGFyJyk7XHJcbiAgdGVzdEltZyhpbWdzLCcvaW1hZ2VzL25vX2F2YV9zcXVhcmUucG5nJyk7XHJcbn0pO1xyXG4iLCIvL9C10YHQu9C4INC+0YLQutGA0YvRgtC+INC60LDQuiDQtNC+0YfQtdGA0L3QtdC1XHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgaWYgKCF3aW5kb3cub3BlbmVyKXJldHVybjtcclxuICB0cnkge1xyXG4gICAgaHJlZiA9IHdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZjtcclxuICAgIGlmIChcclxuICAgICAgaHJlZi5pbmRleE9mKCdhY2NvdW50L29mZmxpbmUnKSA+IDBcclxuICAgICkge1xyXG4gICAgICB3aW5kb3cucHJpbnQoKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChkb2N1bWVudC5yZWZlcnJlci5pbmRleE9mKCdzZWNyZXRkaXNjb3VudGVyJykgPCAwKXJldHVybjtcclxuXHJcbiAgICBpZiAoXHJcbiAgICAgIGhyZWYuaW5kZXhPZignc29jaWFscycpID4gMCB8fFxyXG4gICAgICBocmVmLmluZGV4T2YoJ2xvZ2luJykgPiAwIHx8XHJcbiAgICAgIGhyZWYuaW5kZXhPZignYWRtaW4nKSA+IDAgfHxcclxuICAgICAgaHJlZi5pbmRleE9mKCdhY2NvdW50JykgPiAwXHJcbiAgICApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChocmVmLmluZGV4T2YoJ3N0b3JlJykgPiAwIHx8IGhyZWYuaW5kZXhPZignY291cG9uJykgPiAwIHx8IGhyZWYuaW5kZXhPZignc2V0dGluZ3MnKSA+IDApIHtcclxuICAgICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZiA9IGxvY2F0aW9uLmhyZWY7XHJcbiAgICB9XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuXHJcbiAgfVxyXG59KSgpO1xyXG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgJCgnaW5wdXRbdHlwZT1maWxlXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICB2YXIgZmlsZSA9IGV2dC50YXJnZXQuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxyXG4gICAgdmFyIGYgPSBmaWxlWzBdO1xyXG4gICAgLy8gT25seSBwcm9jZXNzIGltYWdlIGZpbGVzLlxyXG4gICAgaWYgKCFmLnR5cGUubWF0Y2goJ2ltYWdlLionKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgICBkYXRhID0ge1xyXG4gICAgICAnZWwnOiB0aGlzLFxyXG4gICAgICAnZic6IGZcclxuICAgIH07XHJcbiAgICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGltZyA9ICQoJ1tmb3I9XCInICsgZGF0YS5lbC5uYW1lICsgJ1wiXScpO1xyXG4gICAgICAgIGlmIChpbWcubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgaW1nLmF0dHIoJ3NyYycsIGUudGFyZ2V0LnJlc3VsdClcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9KShkYXRhKTtcclxuICAgIC8vIFJlYWQgaW4gdGhlIGltYWdlIGZpbGUgYXMgYSBkYXRhIFVSTC5cclxuICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGYpO1xyXG4gIH0pO1xyXG5cclxuICAkKCcuZHVibGljYXRlX3ZhbHVlJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICB2YXIgc2VsID0gJCgkdGhpcy5kYXRhKCdzZWxlY3RvcicpKTtcclxuICAgIHNlbC52YWwodGhpcy52YWx1ZSk7XHJcbiAgfSlcclxufSk7XHJcbiIsIlxyXG5mdW5jdGlvbiBnZXRDb29raWUobikge1xyXG4gIHJldHVybiB1bmVzY2FwZSgoUmVnRXhwKG4gKyAnPShbXjtdKyknKS5leGVjKGRvY3VtZW50LmNvb2tpZSkgfHwgWzEsICcnXSlbMV0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRDb29raWUobmFtZSwgdmFsdWUsIGRheXMpIHtcclxuICB2YXIgZXhwaXJlcyA9ICcnO1xyXG4gIGlmIChkYXlzKSB7XHJcbiAgICAgIHZhciBkYXRlID0gbmV3IERhdGU7XHJcbiAgICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSArIGRheXMpO1xyXG4gICAgICBleHBpcmVzID0gJzsgZXhwaXJlcz0nICsgZGF0ZS50b1VUQ1N0cmluZygpO1xyXG4gIH1cclxuICBkb2N1bWVudC5jb29raWUgPSBuYW1lICsgXCI9XCIgKyBlc2NhcGUgKCB2YWx1ZSApICsgZXhwaXJlcztcclxufVxyXG5cclxuZnVuY3Rpb24gZXJhc2VDb29raWUobmFtZSl7XHJcbiAgdmFyIGNvb2tpZV9zdHJpbmcgPSBuYW1lICsgXCI9MFwiICtcIjsgZXhwaXJlcz1XZWQsIDAxIE9jdCAyMDE3IDAwOjAwOjAwIEdNVFwiO1xyXG4gIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZV9zdHJpbmc7XHJcbn1cclxuXHJcbmRvY3VtZW50LmNvb2tpZS5zcGxpdChcIjtcIikuZm9yRWFjaChmdW5jdGlvbihjKSB7IGRvY3VtZW50LmNvb2tpZSA9IGMucmVwbGFjZSgvXiArLywgXCJcIikucmVwbGFjZSgvPS4qLywgXCI9O2V4cGlyZXM9XCIgKyBuZXcgRGF0ZSgpLnRvVVRDU3RyaW5nKCkgKyBcIjtwYXRoPS9cIik7IH0pOyIsIihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICB2YXIgdGFibGVzID0gJCgndGFibGUuYWRhcHRpdmUnKTtcclxuXHJcbiAgaWYgKHRhYmxlcy5sZW5ndGggPT0gMClyZXR1cm47XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyB0YWJsZXMubGVuZ3RoID4gaTsgaSsrKSB7XHJcbiAgICB2YXIgdGFibGUgPSB0YWJsZXMuZXEoaSk7XHJcbiAgICB2YXIgdGggPSB0YWJsZS5maW5kKCd0aGVhZCcpO1xyXG4gICAgaWYgKHRoLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIHRoID0gdGFibGUuZmluZCgndHInKS5lcSgwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoID0gdGguZmluZCgndHInKS5lcSgwKTtcclxuICAgIH1cclxuICAgIHRoID0gdGguYWRkQ2xhc3MoJ3RhYmxlLWhlYWRlcicpLmZpbmQoJ3RkLHRoJyk7XHJcblxyXG4gICAgdmFyIHRyID0gdGFibGUuZmluZCgndHInKS5ub3QoJy50YWJsZS1oZWFkZXInKTtcclxuXHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgIHZhciBrID0gaiArIDE7XHJcbiAgICAgIHZhciB0ZCA9IHRyLmZpbmQoJ3RkOm50aC1jaGlsZCgnICsgayArICcpJyk7XHJcbiAgICAgIHRkLmF0dHIoJ2xhYmVsJywgdGguZXEoaikudGV4dCgpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG59KSh3aW5kb3csIGRvY3VtZW50KTtcclxuIiwiO1xyXG4kKGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIG9uUmVtb3ZlKCl7XHJcbiAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgcG9zdD17XHJcbiAgICAgIGlkOiR0aGlzLmF0dHIoJ3VpZCcpLFxyXG4gICAgICB0eXBlOiR0aGlzLmF0dHIoJ21vZGUnKVxyXG4gICAgfTtcclxuICAgICQucG9zdCgkdGhpcy5hdHRyKCd1cmwnKSxwb3N0LGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICBpZihkYXRhICYmIGRhdGE9PSdlcnInKXtcclxuICAgICAgICBtc2c9JHRoaXMuZGF0YSgncmVtb3ZlLWVycm9yJyk7XHJcbiAgICAgICAgaWYoIW1zZyl7XHJcbiAgICAgICAgICBtc2c9J9Cd0LXQstC+0LfQvNC+0LbQvdC+INGD0LTQsNC70LjRgtGMINGN0LvQtdC80LXQvdGCJztcclxuICAgICAgICB9XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTptc2csdHlwZTonZXJyJ30pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbW9kZT0kdGhpcy5hdHRyKCdtb2RlJyk7XHJcbiAgICAgIGlmKCFtb2RlKXtcclxuICAgICAgICBtb2RlPSdybSc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKG1vZGU9PSdybScpIHtcclxuICAgICAgICBybSA9ICR0aGlzLmNsb3Nlc3QoJy50b19yZW1vdmUnKTtcclxuICAgICAgICBybV9jbGFzcyA9IHJtLmF0dHIoJ3JtX2NsYXNzJyk7XHJcbiAgICAgICAgaWYgKHJtX2NsYXNzKSB7XHJcbiAgICAgICAgICAkKHJtX2NsYXNzKS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJtLnJlbW92ZSgpO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cj0YHQv9C10YjQvdC+0LUg0YPQtNCw0LvQtdC90LjQtS4nLHR5cGU6J2luZm8nfSlcclxuICAgICAgfVxyXG4gICAgICBpZihtb2RlPT0ncmVsb2FkJyl7XHJcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgbG9jYXRpb24uaHJlZj1sb2NhdGlvbi5ocmVmO1xyXG4gICAgICB9XHJcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKCl7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Ce0YjQuNCx0LrQsCDRg9C00LDQu9C90LjRjycsdHlwZTonZXJyJ30pO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuYWpheF9yZW1vdmUnLGZ1bmN0aW9uKCl7XHJcbiAgICBub3RpZmljYXRpb24uY29uZmlybSh7XHJcbiAgICAgIGNhbGxiYWNrWWVzOm9uUmVtb3ZlLFxyXG4gICAgICBvYmo6JCh0aGlzKSxcclxuICAgICAgbm90eWZ5X2NsYXNzOiBcIm5vdGlmeV9ib3gtYWxlcnRcIlxyXG4gICAgfSlcclxuICB9KTtcclxuXHJcbn0pO1xyXG5cclxuIiwiaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xyXG4gIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKG9UaGlzKSB7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgLy8g0LHQu9C40LbQsNC50YjQuNC5INCw0L3QsNC70L7QsyDQstC90YPRgtGA0LXQvdC90LXQuSDRhNGD0L3QutGG0LjQuFxyXG4gICAgICAvLyBJc0NhbGxhYmxlINCyIEVDTUFTY3JpcHQgNVxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBhQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXHJcbiAgICAgIGZUb0JpbmQgPSB0aGlzLFxyXG4gICAgICBmTk9QID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB9LFxyXG4gICAgICBmQm91bmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1AgJiYgb1RoaXNcclxuICAgICAgICAgICAgPyB0aGlzXHJcbiAgICAgICAgICAgIDogb1RoaXMsXHJcbiAgICAgICAgICBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xyXG4gICAgICB9O1xyXG5cclxuICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XHJcbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcclxuXHJcbiAgICByZXR1cm4gZkJvdW5kO1xyXG4gIH07XHJcbn1cclxuXHJcbmlmICghU3RyaW5nLnByb3RvdHlwZS50cmltKSB7XHJcbiAgKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8g0JLRi9GA0LXQt9Cw0LXQvCBCT00g0Lgg0L3QtdGA0LDQt9GA0YvQstC90YvQuSDQv9GA0L7QsdC10LtcclxuICAgIFN0cmluZy5wcm90b3R5cGUudHJpbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9eW1xcc1xcdUZFRkZcXHhBMF0rfFtcXHNcXHVGRUZGXFx4QTBdKyQvZywgJycpO1xyXG4gICAgfTtcclxuICB9KSgpO1xyXG59IiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuaGlkZGVuLWxpbmsnKS5yZXBsYWNlV2l0aChmdW5jdGlvbiAoKSB7XHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICByZXR1cm4gJzxhIGhyZWY9XCInICsgJHRoaXMuZGF0YSgnbGluaycpICsgJ1wiIHJlbD1cIicrICR0aGlzLmRhdGEoJ3JlbCcpICsnXCIgY2xhc3M9XCInICsgJHRoaXMuYXR0cignY2xhc3MnKSArICdcIj4nICsgJHRoaXMudGV4dCgpICsgJzwvYT4nO1xyXG4gIH0pXHJcbn0pKCk7XHJcbiIsInZhciBzdG9yZV9wb2ludHMgPSAoZnVuY3Rpb24oKXtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gY2hhbmdlQ291bnRyeSgpe1xyXG4gICAgICAgIHZhciB0aGF0ID0gJCgnI3N0b3JlX3BvaW50X2NvdW50cnknKTtcclxuICAgICAgICBpZiAodGhhdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdE9wdGlvbnMgPSAkKHRoYXQpLmZpbmQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmRhdGEoJ2NpdGllcycpLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRzID0gJCgnI3N0b3JlLXBvaW50cycpLFxyXG4gICAgICAgICAgICAgICAgY291bnRyeSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmF0dHIoJ3ZhbHVlJyk7XHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RPcHRpb25zLmxlbmd0aCA+IDEgJiYgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0b3JlX3BvaW50X2NpdHknKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3ZhciBvcHRpb25zID0gJzxvcHRpb24gdmFsdWU9XCJcIj7QktGL0LHQtdGA0LjRgtC1INCz0L7RgNC+0LQ8L29wdGlvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb25zID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgaXRlbSArICdcIj4nICsgaXRlbSArICc8L29wdGlvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdC5pbm5lckhUTUwgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vJChwb2ludHMpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgLy8gZ29vZ2xlTWFwLnNob3dNYXAoKTtcclxuICAgICAgICAgICAgLy8gZ29vZ2xlTWFwLnNob3dNYXJrZXIoY291bnRyeSwgJycpO1xyXG4gICAgICAgICAgICBjaGFuZ2VDaXR5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjaGFuZ2VDaXR5KCl7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBnb29nbGVNYXAgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHRoYXQgPSAkKCcjc3RvcmVfcG9pbnRfY2l0eScpO1xyXG4gICAgICAgIGlmICh0aGF0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgY2l0eSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmF0dHIoJ3ZhbHVlJyksXHJcbiAgICAgICAgICAgICAgICBjb3VudHJ5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgJCgnI3N0b3JlX3BvaW50X2NvdW50cnknKSkuYXR0cigndmFsdWUnKSxcclxuICAgICAgICAgICAgICAgIHBvaW50cyA9ICQoJyNzdG9yZS1wb2ludHMnKTtcclxuICAgICAgICAgICAgaWYgKGNvdW50cnkgJiYgY2l0eSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gcG9pbnRzLmZpbmQoJy5zdG9yZS1wb2ludHNfX3BvaW50c19yb3cnKSxcclxuICAgICAgICAgICAgICAgICAgICB2aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5zaG93TWFya2VyKGNvdW50cnksIGNpdHkpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQuZWFjaChpdGVtcywgZnVuY3Rpb24gKGluZGV4LCBkaXYpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJChkaXYpLmRhdGEoJ2NpdHknKSA9PSBjaXR5ICYmICQoZGl2KS5kYXRhKCdjb3VudHJ5JykgPT0gY291bnRyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGRpdikucmVtb3ZlQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzX3Jvdy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChkaXYpLmFkZENsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50c19yb3ctaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQocG9pbnRzKS5yZW1vdmVDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHMtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwLnNob3dNYXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQocG9pbnRzKS5hZGRDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHMtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwLmhpZGVNYXAoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQocG9pbnRzKS5hZGRDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHMtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICBnb29nbGVNYXAuaGlkZU1hcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8v0LTQu9GPINGC0L7Rh9C10Log0L/RgNC+0LTQsNC2LCDRgdC+0LHRi9GC0LjRjyDQvdCwINCy0YvQsdC+0YAg0YHQtdC70LXQutGC0L7QslxyXG4gICAgdmFyIGJvZHkgPSAkKCdib2R5Jyk7XHJcblxyXG4gICAgJChib2R5KS5vbignY2hhbmdlJywgJyNzdG9yZV9wb2ludF9jb3VudHJ5JywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGNoYW5nZUNvdW50cnkoKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICAkKGJvZHkpLm9uKCdjaGFuZ2UnLCAnI3N0b3JlX3BvaW50X2NpdHknLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgY2hhbmdlQ2l0eSgpO1xyXG5cclxuICAgIH0pO1xyXG5cclxuICAgIGNoYW5nZUNvdW50cnkoKTtcclxuXHJcblxyXG59KSgpO1xyXG5cclxuXHJcblxyXG5cclxuIiwidmFyIGhhc2hUYWdzID0gKGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgZnVuY3Rpb24gbG9jYXRpb25IYXNoKCkge1xyXG4gICAgICAgIHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XHJcblxyXG4gICAgICAgIGlmIChoYXNoICE9IFwiXCIpIHtcclxuICAgICAgICAgICAgdmFyIGhhc2hCb2R5ID0gaGFzaC5zcGxpdChcIj9cIik7XHJcbiAgICAgICAgICAgIGlmIChoYXNoQm9keVsxXSkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gbG9jYXRpb24ub3JpZ2luICsgbG9jYXRpb24ucGF0aG5hbWUgKyAnPycgKyBoYXNoQm9keVsxXSArIGhhc2hCb2R5WzBdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpbmtzID0gJCgnYVtocmVmPVwiJyArIGhhc2hCb2R5WzBdICsgJ1wiXS5tb2RhbHNfb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxpbmtzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQobGlua3NbMF0pLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbG9jYXRpb25IYXNoKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBsb2NhdGlvbkhhc2goKVxyXG5cclxufSkoKTsiLCJ2YXIgcGx1Z2lucyA9IChmdW5jdGlvbigpe1xyXG4gICAgdmFyIGljb25DbG9zZSA9ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJDYXBhXzFcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHdpZHRoPVwiMTJweFwiIGhlaWdodD1cIjEycHhcIiB2aWV3Qm94PVwiMCAwIDM1NyAzNTdcIiBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzU3IDM1NztcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPjxnPicrXHJcbiAgICAgICAgJzxnIGlkPVwiY2xvc2VcIj48cG9seWdvbiBwb2ludHM9XCIzNTcsMzUuNyAzMjEuMywwIDE3OC41LDE0Mi44IDM1LjcsMCAwLDM1LjcgMTQyLjgsMTc4LjUgMCwzMjEuMyAzNS43LDM1NyAxNzguNSwyMTQuMiAzMjEuMywzNTcgMzU3LDMyMS4zICAgICAyMTQuMiwxNzguNSAgIFwiIGZpbGw9XCIjRkZGRkZGXCIvPicrXHJcbiAgICAgICAgJzwvc3ZnPic7XHJcbiAgICB2YXIgdGVtcGxhdGU9JzxkaXYgY2xhc3M9XCJwYWdlLXdyYXAgaW5zdGFsbC1wbHVnaW5faW5uZXJcIj4nK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJpbnN0YWxsLXBsdWdpbl90ZXh0XCI+e3t0ZXh0fX08L2Rpdj4nK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJpbnN0YWxsLXBsdWdpbl9idXR0b25zXCI+JytcclxuICAgICAgICAgICAgICAgICAgICAnPGEgY2xhc3M9XCJidG4gYnRuLW1pbmkgYnRuLXJvdW5kIGluc3RhbGwtcGx1Z2luX2J1dHRvblwiICBocmVmPVwie3tocmVmfX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj57e3RpdGxlfX08L2E+JytcclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImluc3RhbGwtcGx1Z2luX2J1dHRvbi1jbG9zZVwiPicraWNvbkNsb3NlKyc8L2Rpdj4nK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicrXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgdmFyIHBsdWdpbkluc3RhbGxEaXZDbGFzcyA9ICdpbnN0YWxsLXBsdWdpbi1pbmRleCc7XHJcbiAgICB2YXIgcGx1Z2luSW5zdGFsbERpdkFjY291bnRDbGFzcyA9ICdpbnN0YWxsLXBsdWdpbi1hY2NvdW50JztcclxuICAgIHZhciBjb29raWVQYW5lbEhpZGRlbiA9ICdzZC1pbnN0YWxsLXBsdWdpbi1oaWRkZW4nO1xyXG4gICAgdmFyIGNvb2tpZUFjY291bnREaXZIaWRkZW4gPSAnc2QtaW5zdGFsbC1wbHVnaW4tYWNjb3VudC1oaWRkZW4nO1xyXG4gICAgdmFyIGlzT3BlcmEgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJyBPUFIvJykgPj0gMDtcclxuICAgIHZhciBpc1lhbmRleCA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignIFlhQnJvd3Nlci8nKSA+PSAwO1xyXG4gICAgdmFyIGV4dGVuc2lvbnMgPSB7XHJcbiAgICAgICAgJ2Nocm9tZSc6IHtcclxuICAgICAgICAgICAgJ2Rpdl9pZCc6ICdzZF9jaHJvbWVfYXBwJyxcclxuICAgICAgICAgICAgJ3VzZWQnOiAhIXdpbmRvdy5jaHJvbWUgJiYgd2luZG93LmNocm9tZS53ZWJzdG9yZSAhPT0gbnVsbCAmJiAhaXNPcGVyYSAmJiAhaXNZYW5kZXgsXHJcbiAgICAgICAgICAgIC8vJ3RleHQnOiBsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcclxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9jaHJvbWUuZ29vZ2xlLmNvbS93ZWJzdG9yZS9kZXRhaWwvc2VjcmV0ZGlzY291bnRlcnJ1LSVFMiU4MCU5My0lRDAlQkElRDElOEQlRDElODglRDAlQjEvbWNvbGhoZW1mYWNwb2FnaGppZGhsaWVjcGlhbnBuam4nLFxyXG4gICAgICAgICAgICAnaW5zdGFsbF9idXR0b25fY2xhc3MnOiAncGx1Z2luLWJyb3dzZXJzLWxpbmstY2hyb21lJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2ZpcmVmb3gnOiB7XHJcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2RfZmlyZWZveF9hcHAnLFxyXG4gICAgICAgICAgICAndXNlZCc6ICB0eXBlb2YgSW5zdGFsbFRyaWdnZXIgIT09ICd1bmRlZmluZWQnLFxyXG4gICAgICAgICAgICAvLyd0ZXh0JzpsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcclxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMubW96aWxsYS5vcmcvcnUvZmlyZWZveC9hZGRvbi9zZWNyZXRkaXNjb3VudGVyLSVEMCVCQSVEMSU4RCVEMSU4OCVEMCVCMSVEMSU4RCVEMCVCQS0lRDElODElRDAlQjUlRDElODAlRDAlQjIlRDAlQjglRDElODEvJyxcclxuICAgICAgICAgICAgJ2luc3RhbGxfYnV0dG9uX2NsYXNzJzogJ3BsdWdpbi1icm93c2Vycy1saW5rLWZpcmVmb3gnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnb3BlcmEnOiB7XHJcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2Rfb3BlcmFfYXBwJyxcclxuICAgICAgICAgICAgJ3VzZWQnOiBpc09wZXJhLFxyXG4gICAgICAgICAgICAvLyd0ZXh0JzpsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcclxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMub3BlcmEuY29tL3J1L2V4dGVuc2lvbnMvP3JlZj1wYWdlJyxcclxuICAgICAgICAgICAgJ2luc3RhbGxfYnV0dG9uX2NsYXNzJzogJ3BsdWdpbi1icm93c2Vycy1saW5rLW9wZXJhJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ3lhbmRleCc6IHtcclxuICAgICAgICAgICAgJ2Rpdl9pZCc6ICdzZF95YW5kZXhfYXBwJyxcclxuICAgICAgICAgICAgJ3VzZWQnOiBpc1lhbmRleCxcclxuICAgICAgICAgICAgLy8ndGV4dCc6bGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIiksXHJcbiAgICAgICAgICAgICdocmVmJzogJ2h0dHBzOi8vYWRkb25zLm9wZXJhLmNvbS9ydS9leHRlbnNpb25zLz9yZWY9cGFnZScsXHJcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay15YW5kZXgnXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gc2V0UGFuZWwoaHJlZikge1xyXG4gICAgICAgIHZhciBwbHVnaW5JbnN0YWxsUGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGx1Z2luLWluc3RhbGwtcGFuZWwnKTsvL9Cy0YvQstC+0LTQuNGC0Ywg0LvQuCDQv9Cw0L3QtdC70YxcclxuICAgICAgICBpZiAocGx1Z2luSW5zdGFsbFBhbmVsICYmIGdldENvb2tpZShjb29raWVQYW5lbEhpZGRlbikgIT09ICcxJyApIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7e3RleHR9fScsIGxnKFwiaW5zdGFsbF9wbHVnaW5fYW5kX2l0X3dpbGxfbm90aWNlX2Fib3V0X2Nhc2hiYWNrXCIpKTtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7e2hyZWZ9fScsIGhyZWYpO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7dGl0bGV9fScsIGxnKFwiaW5zdGFsbF9wbHVnaW5cIikpO1xyXG4gICAgICAgICAgICB2YXIgc2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcclxuICAgICAgICAgICAgc2VjdGlvbi5jbGFzc05hbWUgPSAnaW5zdGFsbC1wbHVnaW4nO1xyXG4gICAgICAgICAgICBzZWN0aW9uLmlubmVySFRNTCA9IHRlbXBsYXRlO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNlY29uZGxpbmUgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJy5oZWFkZXItc2Vjb25kbGluZScpO1xyXG4gICAgICAgICAgICBpZiAoc2Vjb25kbGluZSkge1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kbGluZS5hcHBlbmRDaGlsZChzZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbnN0YWxsLXBsdWdpbl9idXR0b24tY2xvc2UnKS5vbmNsaWNrID0gY2xvc2VDbGljaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRCdXR0b25JbnN0YWxsVmlzaWJsZShidXR0b25DbGFzcykge1xyXG4gICAgICAgICQoJy4nICsgcGx1Z2luSW5zdGFsbERpdkNsYXNzKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgJCgnLicgKyBidXR0b25DbGFzcykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIGlmIChnZXRDb29raWUoY29va2llQWNjb3VudERpdkhpZGRlbikgIT09ICcxJykge1xyXG4gICAgICAgICAgICAkKCcuJyArIHBsdWdpbkluc3RhbGxEaXZBY2NvdW50Q2xhc3MpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xvc2VDbGljaygpe1xyXG4gICAgICAgICQoJy5pbnN0YWxsLXBsdWdpbicpLmFkZENsYXNzKCdpbnN0YWxsLXBsdWdpbl9oaWRkZW4nKTtcclxuICAgICAgICBzZXRDb29raWUoY29va2llUGFuZWxIaWRkZW4sICcxJywgMTApO1xyXG4gICAgfVxyXG5cclxuICAgICQoJy5pbnN0YWxsLXBsdWdpbi1hY2NvdW50LWxhdGVyJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzZXRDb29raWUoY29va2llQWNjb3VudERpdkhpZGRlbiwgJzEnLCAxMCk7XHJcbiAgICAgICAgJCgnLmluc3RhbGwtcGx1Z2luLWFjY291bnQnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBleHRlbnNpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9uc1trZXldLnVzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYXBwSWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjJytleHRlbnNpb25zW2tleV0uZGl2X2lkKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWFwcElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v0L/QsNC90LXQu9GMINGBINC60L3QvtC/0LrQvtC5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFBhbmVsKGV4dGVuc2lvbnNba2V5XS5ocmVmKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy/QvdCwINCz0LvQsNCy0L3QvtC5ICDQuCDQsiAvYWNjb3VudCDQsdC70L7QutC4INGBINC40LrQvtC90LrQsNC80Lgg0Lgg0LrQvdC+0L/QutCw0LzQuFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRCdXR0b25JbnN0YWxsVmlzaWJsZShleHRlbnNpb25zW2tleV0uaW5zdGFsbF9idXR0b25fY2xhc3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIDMwMDApO1xyXG4gICAgfTtcclxuXHJcbn0pKCk7IiwiLyoqXHJcbiAqIEBhdXRob3IgemhpeGluIHdlbiA8d2VuemhpeGluMjAxMEBnbWFpbC5jb20+XHJcbiAqIEB2ZXJzaW9uIDEuMi4xXHJcbiAqXHJcbiAqIGh0dHA6Ly93ZW56aGl4aW4ubmV0LmNuL3AvbXVsdGlwbGUtc2VsZWN0L1xyXG4gKi9cclxuXHJcbihmdW5jdGlvbiAoJCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvLyBpdCBvbmx5IGRvZXMgJyVzJywgYW5kIHJldHVybiAnJyB3aGVuIGFyZ3VtZW50cyBhcmUgdW5kZWZpbmVkXHJcbiAgICB2YXIgc3ByaW50ZiA9IGZ1bmN0aW9uIChzdHIpIHtcclxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcclxuICAgICAgICAgICAgZmxhZyA9IHRydWUsXHJcbiAgICAgICAgICAgIGkgPSAxO1xyXG5cclxuICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgYXJnID0gYXJnc1tpKytdO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBmbGFnID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGFyZztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZmxhZyA/IHN0ciA6ICcnO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgcmVtb3ZlRGlhY3JpdGljcyA9IGZ1bmN0aW9uIChzdHIpIHtcclxuICAgICAgICB2YXIgZGVmYXVsdERpYWNyaXRpY3NSZW1vdmFsTWFwID0gW1xyXG4gICAgICAgICAgICB7J2Jhc2UnOidBJywgJ2xldHRlcnMnOi9bXFx1MDA0MVxcdTI0QjZcXHVGRjIxXFx1MDBDMFxcdTAwQzFcXHUwMEMyXFx1MUVBNlxcdTFFQTRcXHUxRUFBXFx1MUVBOFxcdTAwQzNcXHUwMTAwXFx1MDEwMlxcdTFFQjBcXHUxRUFFXFx1MUVCNFxcdTFFQjJcXHUwMjI2XFx1MDFFMFxcdTAwQzRcXHUwMURFXFx1MUVBMlxcdTAwQzVcXHUwMUZBXFx1MDFDRFxcdTAyMDBcXHUwMjAyXFx1MUVBMFxcdTFFQUNcXHUxRUI2XFx1MUUwMFxcdTAxMDRcXHUwMjNBXFx1MkM2Rl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0FBJywnbGV0dGVycyc6L1tcXHVBNzMyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQUUnLCdsZXR0ZXJzJzovW1xcdTAwQzZcXHUwMUZDXFx1MDFFMl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0FPJywnbGV0dGVycyc6L1tcXHVBNzM0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQVUnLCdsZXR0ZXJzJzovW1xcdUE3MzZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidBVicsJ2xldHRlcnMnOi9bXFx1QTczOFxcdUE3M0FdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidBWScsJ2xldHRlcnMnOi9bXFx1QTczQ10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0InLCAnbGV0dGVycyc6L1tcXHUwMDQyXFx1MjRCN1xcdUZGMjJcXHUxRTAyXFx1MUUwNFxcdTFFMDZcXHUwMjQzXFx1MDE4MlxcdTAxODFdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidDJywgJ2xldHRlcnMnOi9bXFx1MDA0M1xcdTI0QjhcXHVGRjIzXFx1MDEwNlxcdTAxMDhcXHUwMTBBXFx1MDEwQ1xcdTAwQzdcXHUxRTA4XFx1MDE4N1xcdTAyM0JcXHVBNzNFXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonRCcsICdsZXR0ZXJzJzovW1xcdTAwNDRcXHUyNEI5XFx1RkYyNFxcdTFFMEFcXHUwMTBFXFx1MUUwQ1xcdTFFMTBcXHUxRTEyXFx1MUUwRVxcdTAxMTBcXHUwMThCXFx1MDE4QVxcdTAxODlcXHVBNzc5XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonRFonLCdsZXR0ZXJzJzovW1xcdTAxRjFcXHUwMUM0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonRHonLCdsZXR0ZXJzJzovW1xcdTAxRjJcXHUwMUM1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonRScsICdsZXR0ZXJzJzovW1xcdTAwNDVcXHUyNEJBXFx1RkYyNVxcdTAwQzhcXHUwMEM5XFx1MDBDQVxcdTFFQzBcXHUxRUJFXFx1MUVDNFxcdTFFQzJcXHUxRUJDXFx1MDExMlxcdTFFMTRcXHUxRTE2XFx1MDExNFxcdTAxMTZcXHUwMENCXFx1MUVCQVxcdTAxMUFcXHUwMjA0XFx1MDIwNlxcdTFFQjhcXHUxRUM2XFx1MDIyOFxcdTFFMUNcXHUwMTE4XFx1MUUxOFxcdTFFMUFcXHUwMTkwXFx1MDE4RV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0YnLCAnbGV0dGVycyc6L1tcXHUwMDQ2XFx1MjRCQlxcdUZGMjZcXHUxRTFFXFx1MDE5MVxcdUE3N0JdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidHJywgJ2xldHRlcnMnOi9bXFx1MDA0N1xcdTI0QkNcXHVGRjI3XFx1MDFGNFxcdTAxMUNcXHUxRTIwXFx1MDExRVxcdTAxMjBcXHUwMUU2XFx1MDEyMlxcdTAxRTRcXHUwMTkzXFx1QTdBMFxcdUE3N0RcXHVBNzdFXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonSCcsICdsZXR0ZXJzJzovW1xcdTAwNDhcXHUyNEJEXFx1RkYyOFxcdTAxMjRcXHUxRTIyXFx1MUUyNlxcdTAyMUVcXHUxRTI0XFx1MUUyOFxcdTFFMkFcXHUwMTI2XFx1MkM2N1xcdTJDNzVcXHVBNzhEXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonSScsICdsZXR0ZXJzJzovW1xcdTAwNDlcXHUyNEJFXFx1RkYyOVxcdTAwQ0NcXHUwMENEXFx1MDBDRVxcdTAxMjhcXHUwMTJBXFx1MDEyQ1xcdTAxMzBcXHUwMENGXFx1MUUyRVxcdTFFQzhcXHUwMUNGXFx1MDIwOFxcdTAyMEFcXHUxRUNBXFx1MDEyRVxcdTFFMkNcXHUwMTk3XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonSicsICdsZXR0ZXJzJzovW1xcdTAwNEFcXHUyNEJGXFx1RkYyQVxcdTAxMzRcXHUwMjQ4XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonSycsICdsZXR0ZXJzJzovW1xcdTAwNEJcXHUyNEMwXFx1RkYyQlxcdTFFMzBcXHUwMUU4XFx1MUUzMlxcdTAxMzZcXHUxRTM0XFx1MDE5OFxcdTJDNjlcXHVBNzQwXFx1QTc0MlxcdUE3NDRcXHVBN0EyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTCcsICdsZXR0ZXJzJzovW1xcdTAwNENcXHUyNEMxXFx1RkYyQ1xcdTAxM0ZcXHUwMTM5XFx1MDEzRFxcdTFFMzZcXHUxRTM4XFx1MDEzQlxcdTFFM0NcXHUxRTNBXFx1MDE0MVxcdTAyM0RcXHUyQzYyXFx1MkM2MFxcdUE3NDhcXHVBNzQ2XFx1QTc4MF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0xKJywnbGV0dGVycyc6L1tcXHUwMUM3XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTGonLCdsZXR0ZXJzJzovW1xcdTAxQzhdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidNJywgJ2xldHRlcnMnOi9bXFx1MDA0RFxcdTI0QzJcXHVGRjJEXFx1MUUzRVxcdTFFNDBcXHUxRTQyXFx1MkM2RVxcdTAxOUNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidOJywgJ2xldHRlcnMnOi9bXFx1MDA0RVxcdTI0QzNcXHVGRjJFXFx1MDFGOFxcdTAxNDNcXHUwMEQxXFx1MUU0NFxcdTAxNDdcXHUxRTQ2XFx1MDE0NVxcdTFFNEFcXHUxRTQ4XFx1MDIyMFxcdTAxOURcXHVBNzkwXFx1QTdBNF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J05KJywnbGV0dGVycyc6L1tcXHUwMUNBXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTmonLCdsZXR0ZXJzJzovW1xcdTAxQ0JdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidPJywgJ2xldHRlcnMnOi9bXFx1MDA0RlxcdTI0QzRcXHVGRjJGXFx1MDBEMlxcdTAwRDNcXHUwMEQ0XFx1MUVEMlxcdTFFRDBcXHUxRUQ2XFx1MUVENFxcdTAwRDVcXHUxRTRDXFx1MDIyQ1xcdTFFNEVcXHUwMTRDXFx1MUU1MFxcdTFFNTJcXHUwMTRFXFx1MDIyRVxcdTAyMzBcXHUwMEQ2XFx1MDIyQVxcdTFFQ0VcXHUwMTUwXFx1MDFEMVxcdTAyMENcXHUwMjBFXFx1MDFBMFxcdTFFRENcXHUxRURBXFx1MUVFMFxcdTFFREVcXHUxRUUyXFx1MUVDQ1xcdTFFRDhcXHUwMUVBXFx1MDFFQ1xcdTAwRDhcXHUwMUZFXFx1MDE4NlxcdTAxOUZcXHVBNzRBXFx1QTc0Q10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J09JJywnbGV0dGVycyc6L1tcXHUwMUEyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonT08nLCdsZXR0ZXJzJzovW1xcdUE3NEVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidPVScsJ2xldHRlcnMnOi9bXFx1MDIyMl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1AnLCAnbGV0dGVycyc6L1tcXHUwMDUwXFx1MjRDNVxcdUZGMzBcXHUxRTU0XFx1MUU1NlxcdTAxQTRcXHUyQzYzXFx1QTc1MFxcdUE3NTJcXHVBNzU0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonUScsICdsZXR0ZXJzJzovW1xcdTAwNTFcXHUyNEM2XFx1RkYzMVxcdUE3NTZcXHVBNzU4XFx1MDI0QV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1InLCAnbGV0dGVycyc6L1tcXHUwMDUyXFx1MjRDN1xcdUZGMzJcXHUwMTU0XFx1MUU1OFxcdTAxNThcXHUwMjEwXFx1MDIxMlxcdTFFNUFcXHUxRTVDXFx1MDE1NlxcdTFFNUVcXHUwMjRDXFx1MkM2NFxcdUE3NUFcXHVBN0E2XFx1QTc4Ml0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1MnLCAnbGV0dGVycyc6L1tcXHUwMDUzXFx1MjRDOFxcdUZGMzNcXHUxRTlFXFx1MDE1QVxcdTFFNjRcXHUwMTVDXFx1MUU2MFxcdTAxNjBcXHUxRTY2XFx1MUU2MlxcdTFFNjhcXHUwMjE4XFx1MDE1RVxcdTJDN0VcXHVBN0E4XFx1QTc4NF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1QnLCAnbGV0dGVycyc6L1tcXHUwMDU0XFx1MjRDOVxcdUZGMzRcXHUxRTZBXFx1MDE2NFxcdTFFNkNcXHUwMjFBXFx1MDE2MlxcdTFFNzBcXHUxRTZFXFx1MDE2NlxcdTAxQUNcXHUwMUFFXFx1MDIzRVxcdUE3ODZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidUWicsJ2xldHRlcnMnOi9bXFx1QTcyOF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1UnLCAnbGV0dGVycyc6L1tcXHUwMDU1XFx1MjRDQVxcdUZGMzVcXHUwMEQ5XFx1MDBEQVxcdTAwREJcXHUwMTY4XFx1MUU3OFxcdTAxNkFcXHUxRTdBXFx1MDE2Q1xcdTAwRENcXHUwMURCXFx1MDFEN1xcdTAxRDVcXHUwMUQ5XFx1MUVFNlxcdTAxNkVcXHUwMTcwXFx1MDFEM1xcdTAyMTRcXHUwMjE2XFx1MDFBRlxcdTFFRUFcXHUxRUU4XFx1MUVFRVxcdTFFRUNcXHUxRUYwXFx1MUVFNFxcdTFFNzJcXHUwMTcyXFx1MUU3NlxcdTFFNzRcXHUwMjQ0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonVicsICdsZXR0ZXJzJzovW1xcdTAwNTZcXHUyNENCXFx1RkYzNlxcdTFFN0NcXHUxRTdFXFx1MDFCMlxcdUE3NUVcXHUwMjQ1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonVlknLCdsZXR0ZXJzJzovW1xcdUE3NjBdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidXJywgJ2xldHRlcnMnOi9bXFx1MDA1N1xcdTI0Q0NcXHVGRjM3XFx1MUU4MFxcdTFFODJcXHUwMTc0XFx1MUU4NlxcdTFFODRcXHUxRTg4XFx1MkM3Ml0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1gnLCAnbGV0dGVycyc6L1tcXHUwMDU4XFx1MjRDRFxcdUZGMzhcXHUxRThBXFx1MUU4Q10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1knLCAnbGV0dGVycyc6L1tcXHUwMDU5XFx1MjRDRVxcdUZGMzlcXHUxRUYyXFx1MDBERFxcdTAxNzZcXHUxRUY4XFx1MDIzMlxcdTFFOEVcXHUwMTc4XFx1MUVGNlxcdTFFRjRcXHUwMUIzXFx1MDI0RVxcdTFFRkVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidaJywgJ2xldHRlcnMnOi9bXFx1MDA1QVxcdTI0Q0ZcXHVGRjNBXFx1MDE3OVxcdTFFOTBcXHUwMTdCXFx1MDE3RFxcdTFFOTJcXHUxRTk0XFx1MDFCNVxcdTAyMjRcXHUyQzdGXFx1MkM2QlxcdUE3NjJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidhJywgJ2xldHRlcnMnOi9bXFx1MDA2MVxcdTI0RDBcXHVGRjQxXFx1MUU5QVxcdTAwRTBcXHUwMEUxXFx1MDBFMlxcdTFFQTdcXHUxRUE1XFx1MUVBQlxcdTFFQTlcXHUwMEUzXFx1MDEwMVxcdTAxMDNcXHUxRUIxXFx1MUVBRlxcdTFFQjVcXHUxRUIzXFx1MDIyN1xcdTAxRTFcXHUwMEU0XFx1MDFERlxcdTFFQTNcXHUwMEU1XFx1MDFGQlxcdTAxQ0VcXHUwMjAxXFx1MDIwM1xcdTFFQTFcXHUxRUFEXFx1MUVCN1xcdTFFMDFcXHUwMTA1XFx1MkM2NVxcdTAyNTBdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidhYScsJ2xldHRlcnMnOi9bXFx1QTczM10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2FlJywnbGV0dGVycyc6L1tcXHUwMEU2XFx1MDFGRFxcdTAxRTNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidhbycsJ2xldHRlcnMnOi9bXFx1QTczNV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2F1JywnbGV0dGVycyc6L1tcXHVBNzM3XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYXYnLCdsZXR0ZXJzJzovW1xcdUE3MzlcXHVBNzNCXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYXknLCdsZXR0ZXJzJzovW1xcdUE3M0RdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidiJywgJ2xldHRlcnMnOi9bXFx1MDA2MlxcdTI0RDFcXHVGRjQyXFx1MUUwM1xcdTFFMDVcXHUxRTA3XFx1MDE4MFxcdTAxODNcXHUwMjUzXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYycsICdsZXR0ZXJzJzovW1xcdTAwNjNcXHUyNEQyXFx1RkY0M1xcdTAxMDdcXHUwMTA5XFx1MDEwQlxcdTAxMERcXHUwMEU3XFx1MUUwOVxcdTAxODhcXHUwMjNDXFx1QTczRlxcdTIxODRdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidkJywgJ2xldHRlcnMnOi9bXFx1MDA2NFxcdTI0RDNcXHVGRjQ0XFx1MUUwQlxcdTAxMEZcXHUxRTBEXFx1MUUxMVxcdTFFMTNcXHUxRTBGXFx1MDExMVxcdTAxOENcXHUwMjU2XFx1MDI1N1xcdUE3N0FdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidkeicsJ2xldHRlcnMnOi9bXFx1MDFGM1xcdTAxQzZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidlJywgJ2xldHRlcnMnOi9bXFx1MDA2NVxcdTI0RDRcXHVGRjQ1XFx1MDBFOFxcdTAwRTlcXHUwMEVBXFx1MUVDMVxcdTFFQkZcXHUxRUM1XFx1MUVDM1xcdTFFQkRcXHUwMTEzXFx1MUUxNVxcdTFFMTdcXHUwMTE1XFx1MDExN1xcdTAwRUJcXHUxRUJCXFx1MDExQlxcdTAyMDVcXHUwMjA3XFx1MUVCOVxcdTFFQzdcXHUwMjI5XFx1MUUxRFxcdTAxMTlcXHUxRTE5XFx1MUUxQlxcdTAyNDdcXHUwMjVCXFx1MDFERF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2YnLCAnbGV0dGVycyc6L1tcXHUwMDY2XFx1MjRENVxcdUZGNDZcXHUxRTFGXFx1MDE5MlxcdUE3N0NdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidnJywgJ2xldHRlcnMnOi9bXFx1MDA2N1xcdTI0RDZcXHVGRjQ3XFx1MDFGNVxcdTAxMURcXHUxRTIxXFx1MDExRlxcdTAxMjFcXHUwMUU3XFx1MDEyM1xcdTAxRTVcXHUwMjYwXFx1QTdBMVxcdTFENzlcXHVBNzdGXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonaCcsICdsZXR0ZXJzJzovW1xcdTAwNjhcXHUyNEQ3XFx1RkY0OFxcdTAxMjVcXHUxRTIzXFx1MUUyN1xcdTAyMUZcXHUxRTI1XFx1MUUyOVxcdTFFMkJcXHUxRTk2XFx1MDEyN1xcdTJDNjhcXHUyQzc2XFx1MDI2NV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2h2JywnbGV0dGVycyc6L1tcXHUwMTk1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonaScsICdsZXR0ZXJzJzovW1xcdTAwNjlcXHUyNEQ4XFx1RkY0OVxcdTAwRUNcXHUwMEVEXFx1MDBFRVxcdTAxMjlcXHUwMTJCXFx1MDEyRFxcdTAwRUZcXHUxRTJGXFx1MUVDOVxcdTAxRDBcXHUwMjA5XFx1MDIwQlxcdTFFQ0JcXHUwMTJGXFx1MUUyRFxcdTAyNjhcXHUwMTMxXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonaicsICdsZXR0ZXJzJzovW1xcdTAwNkFcXHUyNEQ5XFx1RkY0QVxcdTAxMzVcXHUwMUYwXFx1MDI0OV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2snLCAnbGV0dGVycyc6L1tcXHUwMDZCXFx1MjREQVxcdUZGNEJcXHUxRTMxXFx1MDFFOVxcdTFFMzNcXHUwMTM3XFx1MUUzNVxcdTAxOTlcXHUyQzZBXFx1QTc0MVxcdUE3NDNcXHVBNzQ1XFx1QTdBM10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2wnLCAnbGV0dGVycyc6L1tcXHUwMDZDXFx1MjREQlxcdUZGNENcXHUwMTQwXFx1MDEzQVxcdTAxM0VcXHUxRTM3XFx1MUUzOVxcdTAxM0NcXHUxRTNEXFx1MUUzQlxcdTAxN0ZcXHUwMTQyXFx1MDE5QVxcdTAyNkJcXHUyQzYxXFx1QTc0OVxcdUE3ODFcXHVBNzQ3XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonbGonLCdsZXR0ZXJzJzovW1xcdTAxQzldL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidtJywgJ2xldHRlcnMnOi9bXFx1MDA2RFxcdTI0RENcXHVGRjREXFx1MUUzRlxcdTFFNDFcXHUxRTQzXFx1MDI3MVxcdTAyNkZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOiduJywgJ2xldHRlcnMnOi9bXFx1MDA2RVxcdTI0RERcXHVGRjRFXFx1MDFGOVxcdTAxNDRcXHUwMEYxXFx1MUU0NVxcdTAxNDhcXHUxRTQ3XFx1MDE0NlxcdTFFNEJcXHUxRTQ5XFx1MDE5RVxcdTAyNzJcXHUwMTQ5XFx1QTc5MVxcdUE3QTVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOiduaicsJ2xldHRlcnMnOi9bXFx1MDFDQ10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J28nLCAnbGV0dGVycyc6L1tcXHUwMDZGXFx1MjRERVxcdUZGNEZcXHUwMEYyXFx1MDBGM1xcdTAwRjRcXHUxRUQzXFx1MUVEMVxcdTFFRDdcXHUxRUQ1XFx1MDBGNVxcdTFFNERcXHUwMjJEXFx1MUU0RlxcdTAxNERcXHUxRTUxXFx1MUU1M1xcdTAxNEZcXHUwMjJGXFx1MDIzMVxcdTAwRjZcXHUwMjJCXFx1MUVDRlxcdTAxNTFcXHUwMUQyXFx1MDIwRFxcdTAyMEZcXHUwMUExXFx1MUVERFxcdTFFREJcXHUxRUUxXFx1MUVERlxcdTFFRTNcXHUxRUNEXFx1MUVEOVxcdTAxRUJcXHUwMUVEXFx1MDBGOFxcdTAxRkZcXHUwMjU0XFx1QTc0QlxcdUE3NERcXHUwMjc1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonb2knLCdsZXR0ZXJzJzovW1xcdTAxQTNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidvdScsJ2xldHRlcnMnOi9bXFx1MDIyM10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J29vJywnbGV0dGVycyc6L1tcXHVBNzRGXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoncCcsJ2xldHRlcnMnOi9bXFx1MDA3MFxcdTI0REZcXHVGRjUwXFx1MUU1NVxcdTFFNTdcXHUwMUE1XFx1MUQ3RFxcdUE3NTFcXHVBNzUzXFx1QTc1NV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3EnLCdsZXR0ZXJzJzovW1xcdTAwNzFcXHUyNEUwXFx1RkY1MVxcdTAyNEJcXHVBNzU3XFx1QTc1OV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3InLCdsZXR0ZXJzJzovW1xcdTAwNzJcXHUyNEUxXFx1RkY1MlxcdTAxNTVcXHUxRTU5XFx1MDE1OVxcdTAyMTFcXHUwMjEzXFx1MUU1QlxcdTFFNURcXHUwMTU3XFx1MUU1RlxcdTAyNERcXHUwMjdEXFx1QTc1QlxcdUE3QTdcXHVBNzgzXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoncycsJ2xldHRlcnMnOi9bXFx1MDA3M1xcdTI0RTJcXHVGRjUzXFx1MDBERlxcdTAxNUJcXHUxRTY1XFx1MDE1RFxcdTFFNjFcXHUwMTYxXFx1MUU2N1xcdTFFNjNcXHUxRTY5XFx1MDIxOVxcdTAxNUZcXHUwMjNGXFx1QTdBOVxcdUE3ODVcXHUxRTlCXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzondCcsJ2xldHRlcnMnOi9bXFx1MDA3NFxcdTI0RTNcXHVGRjU0XFx1MUU2QlxcdTFFOTdcXHUwMTY1XFx1MUU2RFxcdTAyMUJcXHUwMTYzXFx1MUU3MVxcdTFFNkZcXHUwMTY3XFx1MDFBRFxcdTAyODhcXHUyQzY2XFx1QTc4N10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3R6JywnbGV0dGVycyc6L1tcXHVBNzI5XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzondScsJ2xldHRlcnMnOi9bXFx1MDA3NVxcdTI0RTRcXHVGRjU1XFx1MDBGOVxcdTAwRkFcXHUwMEZCXFx1MDE2OVxcdTFFNzlcXHUwMTZCXFx1MUU3QlxcdTAxNkRcXHUwMEZDXFx1MDFEQ1xcdTAxRDhcXHUwMUQ2XFx1MDFEQVxcdTFFRTdcXHUwMTZGXFx1MDE3MVxcdTAxRDRcXHUwMjE1XFx1MDIxN1xcdTAxQjBcXHUxRUVCXFx1MUVFOVxcdTFFRUZcXHUxRUVEXFx1MUVGMVxcdTFFRTVcXHUxRTczXFx1MDE3M1xcdTFFNzdcXHUxRTc1XFx1MDI4OV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3YnLCdsZXR0ZXJzJzovW1xcdTAwNzZcXHUyNEU1XFx1RkY1NlxcdTFFN0RcXHUxRTdGXFx1MDI4QlxcdUE3NUZcXHUwMjhDXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzondnknLCdsZXR0ZXJzJzovW1xcdUE3NjFdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid3JywnbGV0dGVycyc6L1tcXHUwMDc3XFx1MjRFNlxcdUZGNTdcXHUxRTgxXFx1MUU4M1xcdTAxNzVcXHUxRTg3XFx1MUU4NVxcdTFFOThcXHUxRTg5XFx1MkM3M10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3gnLCdsZXR0ZXJzJzovW1xcdTAwNzhcXHUyNEU3XFx1RkY1OFxcdTFFOEJcXHUxRThEXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoneScsJ2xldHRlcnMnOi9bXFx1MDA3OVxcdTI0RThcXHVGRjU5XFx1MUVGM1xcdTAwRkRcXHUwMTc3XFx1MUVGOVxcdTAyMzNcXHUxRThGXFx1MDBGRlxcdTFFRjdcXHUxRTk5XFx1MUVGNVxcdTAxQjRcXHUwMjRGXFx1MUVGRl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3onLCdsZXR0ZXJzJzovW1xcdTAwN0FcXHUyNEU5XFx1RkY1QVxcdTAxN0FcXHUxRTkxXFx1MDE3Q1xcdTAxN0VcXHUxRTkzXFx1MUU5NVxcdTAxQjZcXHUwMjI1XFx1MDI0MFxcdTJDNkNcXHVBNzYzXS9nfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGVmYXVsdERpYWNyaXRpY3NSZW1vdmFsTWFwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKGRlZmF1bHREaWFjcml0aWNzUmVtb3ZhbE1hcFtpXS5sZXR0ZXJzLCBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXBbaV0uYmFzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG5cclxuICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBNdWx0aXBsZVNlbGVjdCgkZWwsIG9wdGlvbnMpIHtcclxuICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgIG5hbWUgPSAkZWwuYXR0cignbmFtZScpIHx8IG9wdGlvbnMubmFtZSB8fCAnJztcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuXHJcbiAgICAgICAgLy8gaGlkZSBzZWxlY3QgZWxlbWVudFxyXG4gICAgICAgIHRoaXMuJGVsID0gJGVsLmhpZGUoKTtcclxuXHJcbiAgICAgICAgLy8gbGFiZWwgZWxlbWVudFxyXG4gICAgICAgIHRoaXMuJGxhYmVsID0gdGhpcy4kZWwuY2xvc2VzdCgnbGFiZWwnKTtcclxuICAgICAgICBpZiAodGhpcy4kbGFiZWwubGVuZ3RoID09PSAwICYmIHRoaXMuJGVsLmF0dHIoJ2lkJykpIHtcclxuICAgICAgICAgICAgdGhpcy4kbGFiZWwgPSAkKHNwcmludGYoJ2xhYmVsW2Zvcj1cIiVzXCJdJywgdGhpcy4kZWwuYXR0cignaWQnKS5yZXBsYWNlKC86L2csICdcXFxcOicpKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZXN0b3JlIGNsYXNzIGFuZCB0aXRsZSBmcm9tIHNlbGVjdCBlbGVtZW50XHJcbiAgICAgICAgdGhpcy4kcGFyZW50ID0gJChzcHJpbnRmKFxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1zLXBhcmVudCAlc1wiICVzLz4nLFxyXG4gICAgICAgICAgICAkZWwuYXR0cignY2xhc3MnKSB8fCAnJyxcclxuICAgICAgICAgICAgc3ByaW50ZigndGl0bGU9XCIlc1wiJywgJGVsLmF0dHIoJ3RpdGxlJykpKSk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBwbGFjZWhvbGRlciB0byBjaG9pY2UgYnV0dG9uXHJcbiAgICAgICAgdGhpcy4kY2hvaWNlID0gJChzcHJpbnRmKFtcclxuICAgICAgICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cIm1zLWNob2ljZVwiPicsXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJwbGFjZWhvbGRlclwiPiVzPC9zcGFuPicsXHJcbiAgICAgICAgICAgICAgICAnPGRpdj48L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgJzwvYnV0dG9uPidcclxuICAgICAgICAgICAgXS5qb2luKCcnKSxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyKSk7XHJcblxyXG4gICAgICAgIC8vIGRlZmF1bHQgcG9zaXRpb24gaXMgYm90dG9tXHJcbiAgICAgICAgdGhpcy4kZHJvcCA9ICQoc3ByaW50ZignPGRpdiBjbGFzcz1cIm1zLWRyb3AgJXNcIiVzPjwvZGl2PicsXHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbixcclxuICAgICAgICAgICAgc3ByaW50ZignIHN0eWxlPVwid2lkdGg6ICVzXCInLCB0aGlzLm9wdGlvbnMuZHJvcFdpZHRoKSkpO1xyXG5cclxuICAgICAgICB0aGlzLiRlbC5hZnRlcih0aGlzLiRwYXJlbnQpO1xyXG4gICAgICAgIHRoaXMuJHBhcmVudC5hcHBlbmQodGhpcy4kY2hvaWNlKTtcclxuICAgICAgICB0aGlzLiRwYXJlbnQuYXBwZW5kKHRoaXMuJGRyb3ApO1xyXG5cclxuICAgICAgICBpZiAodGhpcy4kZWwucHJvcCgnZGlzYWJsZWQnKSkge1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuJHBhcmVudC5jc3MoJ3dpZHRoJyxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLndpZHRoIHx8XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmNzcygnd2lkdGgnKSB8fFxyXG4gICAgICAgICAgICB0aGlzLiRlbC5vdXRlcldpZHRoKCkgKyAyMCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2VsZWN0QWxsTmFtZSA9ICdkYXRhLW5hbWU9XCJzZWxlY3RBbGwnICsgbmFtZSArICdcIic7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RHcm91cE5hbWUgPSAnZGF0YS1uYW1lPVwic2VsZWN0R3JvdXAnICsgbmFtZSArICdcIic7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RJdGVtTmFtZSA9ICdkYXRhLW5hbWU9XCJzZWxlY3RJdGVtJyArIG5hbWUgKyAnXCInO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5rZWVwT3Blbikge1xyXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpWzBdID09PSB0aGF0LiRjaG9pY2VbMF0gfHxcclxuICAgICAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCcubXMtY2hvaWNlJylbMF0gPT09IHRoYXQuJGNob2ljZVswXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgoJChlLnRhcmdldClbMF0gPT09IHRoYXQuJGRyb3BbMF0gfHxcclxuICAgICAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCcubXMtZHJvcCcpWzBdICE9PSB0aGF0LiRkcm9wWzBdICYmIGUudGFyZ2V0ICE9PSAkZWxbMF0pICYmXHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIE11bHRpcGxlU2VsZWN0LnByb3RvdHlwZSA9IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcjogTXVsdGlwbGVTZWxlY3QsXHJcblxyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgJHVsID0gJCgnPHVsPjwvdWw+Jyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmh0bWwoJycpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5maWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRyb3AuYXBwZW5kKFtcclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1zLXNlYXJjaFwiPicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwidGV4dFwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiIGF1dG9jb3JyZWN0PVwib2ZmXCIgYXV0b2NhcGl0aWxpemU9XCJvZmZcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIj4nLFxyXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nXS5qb2luKCcnKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zZWxlY3RBbGwgJiYgIXRoaXMub3B0aW9ucy5zaW5nbGUpIHtcclxuICAgICAgICAgICAgICAgICR1bC5hcHBlbmQoW1xyXG4gICAgICAgICAgICAgICAgICAgICc8bGkgY2xhc3M9XCJtcy1zZWxlY3QtYWxsXCI+JyxcclxuICAgICAgICAgICAgICAgICAgICAnPGxhYmVsPicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGlucHV0IHR5cGU9XCJjaGVja2JveFwiICVzIC8+ICcsIHRoaXMuc2VsZWN0QWxsTmFtZSksXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNlbGVjdEFsbERlbGltaXRlclswXSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0QWxsVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0QWxsRGVsaW1pdGVyWzFdLFxyXG4gICAgICAgICAgICAgICAgICAgICc8L2xhYmVsPicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvbGk+J1xyXG4gICAgICAgICAgICAgICAgXS5qb2luKCcnKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQuZWFjaCh0aGlzLiRlbC5jaGlsZHJlbigpLCBmdW5jdGlvbiAoaSwgZWxtKSB7XHJcbiAgICAgICAgICAgICAgICAkdWwuYXBwZW5kKHRoYXQub3B0aW9uVG9IdG1sKGksIGVsbSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHVsLmFwcGVuZChzcHJpbnRmKCc8bGkgY2xhc3M9XCJtcy1uby1yZXN1bHRzXCI+JXM8L2xpPicsIHRoaXMub3B0aW9ucy5ub01hdGNoZXNGb3VuZCkpO1xyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmFwcGVuZCgkdWwpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKCd1bCcpLmNzcygnbWF4LWhlaWdodCcsIHRoaXMub3B0aW9ucy5tYXhIZWlnaHQgKyAncHgnKTtcclxuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKCcubXVsdGlwbGUnKS5jc3MoJ3dpZHRoJywgdGhpcy5vcHRpb25zLm11bHRpcGxlV2lkdGggKyAncHgnKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHNlYXJjaElucHV0ID0gdGhpcy4kZHJvcC5maW5kKCcubXMtc2VhcmNoIGlucHV0Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbCA9IHRoaXMuJGRyb3AuZmluZCgnaW5wdXRbJyArIHRoaXMuc2VsZWN0QWxsTmFtZSArICddJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3VwcyA9IHRoaXMuJGRyb3AuZmluZCgnaW5wdXRbJyArIHRoaXMuc2VsZWN0R3JvdXBOYW1lICsgJ10nKTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMgPSB0aGlzLiRkcm9wLmZpbmQoJ2lucHV0WycgKyB0aGlzLnNlbGVjdEl0ZW1OYW1lICsgJ106ZW5hYmxlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLiRkaXNhYmxlSXRlbXMgPSB0aGlzLiRkcm9wLmZpbmQoJ2lucHV0WycgKyB0aGlzLnNlbGVjdEl0ZW1OYW1lICsgJ106ZGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzID0gdGhpcy4kZHJvcC5maW5kKCcubXMtbm8tcmVzdWx0cycpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTZWxlY3RBbGwodHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHRydWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb3B0aW9uVG9IdG1sOiBmdW5jdGlvbiAoaSwgZWxtLCBncm91cCwgZ3JvdXBEaXNhYmxlZCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAkZWxtID0gJChlbG0pLFxyXG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9ICRlbG0uYXR0cignY2xhc3MnKSB8fCAnJyxcclxuICAgICAgICAgICAgICAgIHRpdGxlID0gc3ByaW50ZigndGl0bGU9XCIlc1wiJywgJGVsbS5hdHRyKCd0aXRsZScpKSxcclxuICAgICAgICAgICAgICAgIG11bHRpcGxlID0gdGhpcy5vcHRpb25zLm11bHRpcGxlID8gJ211bHRpcGxlJyA6ICcnLFxyXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQsXHJcbiAgICAgICAgICAgICAgICB0eXBlID0gdGhpcy5vcHRpb25zLnNpbmdsZSA/ICdyYWRpbycgOiAnY2hlY2tib3gnO1xyXG5cclxuICAgICAgICAgICAgaWYgKCRlbG0uaXMoJ29wdGlvbicpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAkZWxtLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0aGF0Lm9wdGlvbnMudGV4dFRlbXBsYXRlKCRlbG0pLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gJGVsbS5wcm9wKCdzZWxlY3RlZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlID0gc3ByaW50Zignc3R5bGU9XCIlc1wiJywgdGhpcy5vcHRpb25zLnN0eWxlcih2YWx1ZSkpLFxyXG4gICAgICAgICAgICAgICAgICAgICRlbDtcclxuXHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZCA9IGdyb3VwRGlzYWJsZWQgfHwgJGVsbS5wcm9wKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICRlbCA9ICQoW1xyXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxsaSBjbGFzcz1cIiVzICVzXCIgJXMgJXM+JywgbXVsdGlwbGUsIGNsYXNzZXMsIHRpdGxlLCBzdHlsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGxhYmVsIGNsYXNzPVwiJXNcIj4nLCBkaXNhYmxlZCA/ICdkaXNhYmxlZCcgOiAnJyksXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGlucHV0IHR5cGU9XCIlc1wiICVzJXMlcyVzPicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUsIHRoaXMuc2VsZWN0SXRlbU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkID8gJyBjaGVja2VkPVwiY2hlY2tlZFwiJyA6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZCA/ICcgZGlzYWJsZWQ9XCJkaXNhYmxlZFwiJyA6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCcgZGF0YS1ncm91cD1cIiVzXCInLCBncm91cCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxzcGFuPiVzPC9zcGFuPicsIHRleHQpLFxyXG4gICAgICAgICAgICAgICAgICAgICc8L2xhYmVsPicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvbGk+J1xyXG4gICAgICAgICAgICAgICAgXS5qb2luKCcnKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgnaW5wdXQnKS52YWwodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRlbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJGVsbS5pcygnb3B0Z3JvdXAnKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gdGhhdC5vcHRpb25zLmxhYmVsVGVtcGxhdGUoJGVsbSksXHJcbiAgICAgICAgICAgICAgICAgICAgJGdyb3VwID0gJCgnPGRpdi8+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgZ3JvdXAgPSAnZ3JvdXBfJyArIGk7XHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZCA9ICRlbG0ucHJvcCgnZGlzYWJsZWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkZ3JvdXAuYXBwZW5kKFtcclxuICAgICAgICAgICAgICAgICAgICAnPGxpIGNsYXNzPVwiZ3JvdXBcIj4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxsYWJlbCBjbGFzcz1cIm9wdGdyb3VwICVzXCIgZGF0YS1ncm91cD1cIiVzXCI+JywgZGlzYWJsZWQgPyAnZGlzYWJsZWQnIDogJycsIGdyb3VwKSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuaGlkZU9wdGdyb3VwQ2hlY2tib3hlcyB8fCB0aGlzLm9wdGlvbnMuc2luZ2xlID8gJycgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgJXMgJXM+JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RHcm91cE5hbWUsIGRpc2FibGVkID8gJ2Rpc2FibGVkPVwiZGlzYWJsZWRcIicgOiAnJyksXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvbGFiZWw+JyxcclxuICAgICAgICAgICAgICAgICAgICAnPC9saT4nXHJcbiAgICAgICAgICAgICAgICBdLmpvaW4oJycpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmVhY2goJGVsbS5jaGlsZHJlbigpLCBmdW5jdGlvbiAoaSwgZWxtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGdyb3VwLmFwcGVuZCh0aGF0Lm9wdGlvblRvSHRtbChpLCBlbG0sIGdyb3VwLCBkaXNhYmxlZCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGdyb3VwLmh0bWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGV2ZW50czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB0b2dnbGVPcGVuID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdFt0aGF0Lm9wdGlvbnMuaXNPcGVuID8gJ2Nsb3NlJyA6ICdvcGVuJ10oKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy4kbGFiZWwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGxhYmVsLm9mZignY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnbGFiZWwnIHx8IGUudGFyZ2V0ICE9PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlT3BlbihlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5maWx0ZXIgfHwgIXRoYXQub3B0aW9ucy5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpOyAvLyBDYXVzZXMgbG9zdCBmb2N1cyBvdGhlcndpc2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2Uub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIHRvZ2dsZU9wZW4pXHJcbiAgICAgICAgICAgICAgICAub2ZmKCdmb2N1cycpLm9uKCdmb2N1cycsIHRoaXMub3B0aW9ucy5vbkZvY3VzKVxyXG4gICAgICAgICAgICAgICAgLm9mZignYmx1cicpLm9uKCdibHVyJywgdGhpcy5vcHRpb25zLm9uQmx1cik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRwYXJlbnQub2ZmKCdrZXlkb3duJykub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyNzogLy8gZXNjIGtleVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuJGNob2ljZS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRzZWFyY2hJbnB1dC5vZmYoJ2tleWRvd24nKS5vbigna2V5ZG93bicsZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIEVuc3VyZSBzaGlmdC10YWIgY2F1c2VzIGxvc3QgZm9jdXMgZnJvbSBmaWx0ZXIgYXMgd2l0aCBjbGlja2luZyBhd2F5XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSA5ICYmIGUuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLm9mZigna2V5dXAnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZW50ZXIgb3Igc3BhY2VcclxuICAgICAgICAgICAgICAgIC8vIEF2b2lkIHNlbGVjdGluZy9kZXNlbGVjdGluZyBpZiBubyBjaG9pY2VzIG1hZGVcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuZmlsdGVyQWNjZXB0T25FbnRlciAmJiAoZS53aGljaCA9PT0gMTMgfHwgZS53aGljaCA9PSAzMikgJiYgdGhhdC4kc2VhcmNoSW5wdXQudmFsKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RBbGwuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoYXQuZmlsdGVyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLm9mZignY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2hlY2tlZCA9ICQodGhpcykucHJvcCgnY2hlY2tlZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtcyA9IHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcignOnZpc2libGUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoJGl0ZW1zLmxlbmd0aCA9PT0gdGhhdC4kc2VsZWN0SXRlbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdFtjaGVja2VkID8gJ2NoZWNrQWxsJyA6ICd1bmNoZWNrQWxsJ10oKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIHdoZW4gdGhlIGZpbHRlciBvcHRpb24gaXMgdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEdyb3Vwcy5wcm9wKCdjaGVja2VkJywgY2hlY2tlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLnByb3AoJ2NoZWNrZWQnLCBjaGVja2VkKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnNbY2hlY2tlZCA/ICdvbkNoZWNrQWxsJyA6ICdvblVuY2hlY2tBbGwnXSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICQodGhpcykucGFyZW50KCkuYXR0cignZGF0YS1ncm91cCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtcyA9IHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcignOnZpc2libGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4gPSAkaXRlbXMuZmlsdGVyKHNwcmludGYoJ1tkYXRhLWdyb3VwPVwiJXNcIl0nLCBncm91cCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQgPSAkY2hpbGRyZW4ubGVuZ3RoICE9PSAkY2hpbGRyZW4uZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAkY2hpbGRyZW4ucHJvcCgnY2hlY2tlZCcsIGNoZWNrZWQpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGVTZWxlY3RBbGwoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25PcHRncm91cENsaWNrKHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZDogY2hlY2tlZCxcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogJGNoaWxkcmVuLmdldCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlOiB0aGF0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLm9mZignY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZVNlbGVjdEFsbCgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlT3B0R3JvdXBTZWxlY3QoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQub3B0aW9ucy5vbkNsaWNrKHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICQodGhpcykudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZDogJCh0aGlzKS5wcm9wKCdjaGVja2VkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2U6IHRoYXRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuc2luZ2xlICYmIHRoYXQub3B0aW9ucy5pc09wZW4gJiYgIXRoYXQub3B0aW9ucy5rZWVwT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnNpbmdsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjbGlja2VkVmFsID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKHRoaXMpLnZhbCgpICE9PSBjbGlja2VkVmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvcGVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLiRjaG9pY2UuaGFzQ2xhc3MoJ2Rpc2FibGVkJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmZpbmQoJz5kaXYnKS5hZGRDbGFzcygnb3BlbicpO1xyXG4gICAgICAgICAgICB0aGlzLiRkcm9wW3RoaXMuYW5pbWF0ZU1ldGhvZCgnc2hvdycpXSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gZml4IGZpbHRlciBidWc6IG5vIHJlc3VsdHMgc2hvd1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gRml4ICM3NzogJ0FsbCBzZWxlY3RlZCcgd2hlbiBubyBvcHRpb25zXHJcbiAgICAgICAgICAgIGlmICghdGhpcy4kZWwuY2hpbGRyZW4oKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuJGRyb3Aub2Zmc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkcm9wLmFwcGVuZFRvKCQodGhpcy5vcHRpb25zLmNvbnRhaW5lcikpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5vZmZzZXQoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogb2Zmc2V0LnRvcCxcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWFyY2hJbnB1dC52YWwoJycpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VhcmNoSW5wdXQuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uT3BlbigpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNsb3NlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmZpbmQoJz5kaXYnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAgICAgICB0aGlzLiRkcm9wW3RoaXMuYW5pbWF0ZU1ldGhvZCgnaGlkZScpXSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kcGFyZW50LmFwcGVuZCh0aGlzLiRkcm9wKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRyb3AuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAndG9wJzogJ2F1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgICdsZWZ0JzogJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25DbG9zZSgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFuaW1hdGVNZXRob2Q6IGZ1bmN0aW9uIChtZXRob2QpIHtcclxuICAgICAgICAgICAgdmFyIG1ldGhvZHMgPSB7XHJcbiAgICAgICAgICAgICAgICBzaG93OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFkZTogJ2ZhZGVJbicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGU6ICdzbGlkZURvd24nXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaGlkZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGZhZGU6ICdmYWRlT3V0JyxcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZTogJ3NsaWRlVXAnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kc1ttZXRob2RdW3RoaXMub3B0aW9ucy5hbmltYXRlXSB8fCBtZXRob2Q7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAoaXNJbml0KSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RzID0gdGhpcy5vcHRpb25zLmRpc3BsYXlWYWx1ZXMgPyB0aGlzLmdldFNlbGVjdHMoKSA6IHRoaXMuZ2V0U2VsZWN0cygndGV4dCcpLFxyXG4gICAgICAgICAgICAgICAgJHNwYW4gPSB0aGlzLiRjaG9pY2UuZmluZCgnPnNwYW4nKSxcclxuICAgICAgICAgICAgICAgIHNsID0gc2VsZWN0cy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2wgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICRzcGFuLmFkZENsYXNzKCdwbGFjZWhvbGRlcicpLmh0bWwodGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuYWxsU2VsZWN0ZWQgJiYgc2wgPT09IHRoaXMuJHNlbGVjdEl0ZW1zLmxlbmd0aCArIHRoaXMuJGRpc2FibGVJdGVtcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLmh0bWwodGhpcy5vcHRpb25zLmFsbFNlbGVjdGVkKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZWxsaXBzaXMgJiYgc2wgPiB0aGlzLm9wdGlvbnMubWluaW11bUNvdW50U2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLnRleHQoc2VsZWN0cy5zbGljZSgwLCB0aGlzLm9wdGlvbnMubWluaW11bUNvdW50U2VsZWN0ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4odGhpcy5vcHRpb25zLmRlbGltaXRlcikgKyAnLi4uJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmNvdW50U2VsZWN0ZWQgJiYgc2wgPiB0aGlzLm9wdGlvbnMubWluaW11bUNvdW50U2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLmh0bWwodGhpcy5vcHRpb25zLmNvdW50U2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgnIycsIHNlbGVjdHMubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCclJywgdGhpcy4kc2VsZWN0SXRlbXMubGVuZ3RoICsgdGhpcy4kZGlzYWJsZUl0ZW1zLmxlbmd0aCkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJHNwYW4ucmVtb3ZlQ2xhc3MoJ3BsYWNlaG9sZGVyJykudGV4dChzZWxlY3RzLmpvaW4odGhpcy5vcHRpb25zLmRlbGltaXRlcikpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFkZFRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICAkc3Bhbi5wcm9wKCd0aXRsZScsIHRoaXMuZ2V0U2VsZWN0cygndGV4dCcpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gc2V0IHNlbGVjdHMgdG8gc2VsZWN0XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLnZhbCh0aGlzLmdldFNlbGVjdHMoKSkudHJpZ2dlcignY2hhbmdlJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgc2VsZWN0ZWQgY2xhc3MgdG8gc2VsZWN0ZWQgbGlcclxuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoJ2lucHV0OmNoZWNrZWQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50cygnbGknKS5maXJzdCgpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIHRyaWdnZXIgPHNlbGVjdD4gY2hhbmdlIGV2ZW50XHJcbiAgICAgICAgICAgIGlmICghaXNJbml0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHVwZGF0ZVNlbGVjdEFsbDogZnVuY3Rpb24gKGlzSW5pdCkge1xyXG4gICAgICAgICAgICB2YXIgJGl0ZW1zID0gdGhpcy4kc2VsZWN0SXRlbXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWlzSW5pdCkge1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zID0gJGl0ZW1zLmZpbHRlcignOnZpc2libGUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucHJvcCgnY2hlY2tlZCcsICRpdGVtcy5sZW5ndGggJiZcclxuICAgICAgICAgICAgICAgICRpdGVtcy5sZW5ndGggPT09ICRpdGVtcy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcclxuICAgICAgICAgICAgaWYgKCFpc0luaXQgJiYgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2hlY2tBbGwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHVwZGF0ZU9wdEdyb3VwU2VsZWN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkaXRlbXMgPSB0aGlzLiRzZWxlY3RJdGVtcy5maWx0ZXIoJzp2aXNpYmxlJyk7XHJcbiAgICAgICAgICAgICQuZWFjaCh0aGlzLiRzZWxlY3RHcm91cHMsIGZ1bmN0aW9uIChpLCB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICQodmFsKS5wYXJlbnQoKS5hdHRyKCdkYXRhLWdyb3VwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuID0gJGl0ZW1zLmZpbHRlcihzcHJpbnRmKCdbZGF0YS1ncm91cD1cIiVzXCJdJywgZ3JvdXApKTtcclxuICAgICAgICAgICAgICAgICQodmFsKS5wcm9wKCdjaGVja2VkJywgJGNoaWxkcmVuLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbi5sZW5ndGggPT09ICRjaGlsZHJlbi5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy92YWx1ZSBvciB0ZXh0LCBkZWZhdWx0OiAndmFsdWUnXHJcbiAgICAgICAgZ2V0U2VsZWN0czogZnVuY3Rpb24gKHR5cGUpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgdGV4dHMgPSBbXSxcclxuICAgICAgICAgICAgICAgIHZhbHVlcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoc3ByaW50ZignaW5wdXRbJXNdOmNoZWNrZWQnLCB0aGlzLnNlbGVjdEl0ZW1OYW1lKSkuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0cy5wdXNoKCQodGhpcykucGFyZW50cygnbGknKS5maXJzdCgpLnRleHQoKSk7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZXMucHVzaCgkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3RleHQnICYmIHRoaXMuJHNlbGVjdEdyb3Vwcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRleHRzID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9ICQudHJpbSgkKHRoaXMpLnBhcmVudCgpLnRleHQoKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwID0gJCh0aGlzKS5wYXJlbnQoKS5kYXRhKCdncm91cCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4gPSB0aGF0LiRkcm9wLmZpbmQoc3ByaW50ZignWyVzXVtkYXRhLWdyb3VwPVwiJXNcIl0nLCB0aGF0LnNlbGVjdEl0ZW1OYW1lLCBncm91cCkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2VsZWN0ZWQgPSAkY2hpbGRyZW4uZmlsdGVyKCc6Y2hlY2tlZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoISRzZWxlY3RlZC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKCdbJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkY2hpbGRyZW4ubGVuZ3RoID4gJHNlbGVjdGVkLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2VsZWN0ZWQuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKCc6ICcgKyBsaXN0LmpvaW4oJywgJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2goJ10nKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0cy5wdXNoKGh0bWwuam9pbignJykpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHR5cGUgPT09ICd0ZXh0JyA/IHRleHRzIDogdmFsdWVzO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldFNlbGVjdHM6IGZ1bmN0aW9uICh2YWx1ZXMpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLiRkaXNhYmxlSXRlbXMucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgJC5lYWNoKHZhbHVlcywgZnVuY3Rpb24gKGksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoc3ByaW50ZignW3ZhbHVlPVwiJXNcIl0nLCB2YWx1ZSkpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuJGRpc2FibGVJdGVtcy5maWx0ZXIoc3ByaW50ZignW3ZhbHVlPVwiJXNcIl0nLCB2YWx1ZSkpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgdGhpcy4kc2VsZWN0SXRlbXMubGVuZ3RoID09PVxyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCArIHRoaXMuJGRpc2FibGVJdGVtcy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICQuZWFjaCh0aGF0LiRzZWxlY3RHcm91cHMsIGZ1bmN0aW9uIChpLCB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICQodmFsKS5wYXJlbnQoKS5hdHRyKCdkYXRhLWdyb3VwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuID0gdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKCdbZGF0YS1ncm91cD1cIicgKyBncm91cCArICdcIl0nKTtcclxuICAgICAgICAgICAgICAgICQodmFsKS5wcm9wKCdjaGVja2VkJywgJGNoaWxkcmVuLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbi5sZW5ndGggPT09ICRjaGlsZHJlbi5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY2hlY2tBbGw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25DaGVja0FsbCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHVuY2hlY2tBbGw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25VbmNoZWNrQWxsKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZm9jdXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkZvY3VzKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYmx1cjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuYmx1cigpO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25CbHVyKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcmVmcmVzaDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB9LFxyXG5cdFx0XHJcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuJHBhcmVudC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy4kZWwuZGF0YSgnbXVsdGlwbGVTZWxlY3QnLCBudWxsKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgdGV4dCA9ICQudHJpbSh0aGlzLiRzZWFyY2hJbnB1dC52YWwoKSkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLnBhcmVudCgpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcy5wYXJlbnQoKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMucGFyZW50KCkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkcGFyZW50W3JlbW92ZURpYWNyaXRpY3MoJHBhcmVudC50ZXh0KCkudG9Mb3dlckNhc2UoKSkuaW5kZXhPZihyZW1vdmVEaWFjcml0aWNzKHRleHQpKSA8IDAgPyAnaGlkZScgOiAnc2hvdyddKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcy5wYXJlbnQoKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICRwYXJlbnQuYXR0cignZGF0YS1ncm91cCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMgPSB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoJzp2aXNpYmxlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBhcmVudFskaXRlbXMuZmlsdGVyKHNwcmludGYoJ1tkYXRhLWdyb3VwPVwiJXNcIl0nLCBncm91cCkpLmxlbmd0aCA/ICdzaG93JyA6ICdoaWRlJ10oKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgbm8gbWF0Y2hlcyBmb3VuZFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJHNlbGVjdEl0ZW1zLnBhcmVudCgpLmZpbHRlcignOnZpc2libGUnKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJG5vUmVzdWx0cy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU9wdEdyb3VwU2VsZWN0KCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0QWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkZpbHRlcih0ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICQuZm4ubXVsdGlwbGVTZWxlY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50c1swXSxcclxuICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50cyxcclxuXHJcbiAgICAgICAgICAgIHZhbHVlLFxyXG4gICAgICAgICAgICBhbGxvd2VkTWV0aG9kcyA9IFtcclxuICAgICAgICAgICAgICAgICdnZXRTZWxlY3RzJywgJ3NldFNlbGVjdHMnLFxyXG4gICAgICAgICAgICAgICAgJ2VuYWJsZScsICdkaXNhYmxlJyxcclxuICAgICAgICAgICAgICAgICdvcGVuJywgJ2Nsb3NlJyxcclxuICAgICAgICAgICAgICAgICdjaGVja0FsbCcsICd1bmNoZWNrQWxsJyxcclxuICAgICAgICAgICAgICAgICdmb2N1cycsICdibHVyJyxcclxuICAgICAgICAgICAgICAgICdyZWZyZXNoJywgJ2Rlc3Ryb3knXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBkYXRhID0gJHRoaXMuZGF0YSgnbXVsdGlwbGVTZWxlY3QnKSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgJC5mbi5tdWx0aXBsZVNlbGVjdC5kZWZhdWx0cyxcclxuICAgICAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKCksIHR5cGVvZiBvcHRpb24gPT09ICdvYmplY3QnICYmIG9wdGlvbik7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBuZXcgTXVsdGlwbGVTZWxlY3QoJHRoaXMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnbXVsdGlwbGVTZWxlY3QnLCBkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJC5pbkFycmF5KG9wdGlvbiwgYWxsb3dlZE1ldGhvZHMpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdVbmtub3duIG1ldGhvZDogJyArIG9wdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhbHVlID0gZGF0YVtvcHRpb25dKGFyZ3NbMV0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5pbml0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXJnc1sxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gZGF0YVthcmdzWzFdXS5hcHBseShkYXRhLCBbXS5zbGljZS5jYWxsKGFyZ3MsIDIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJyA/IHZhbHVlIDogdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgJC5mbi5tdWx0aXBsZVNlbGVjdC5kZWZhdWx0cyA9IHtcclxuICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICBpc09wZW46IGZhbHNlLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnJyxcclxuICAgICAgICBzZWxlY3RBbGw6IHRydWUsXHJcbiAgICAgICAgc2VsZWN0QWxsRGVsaW1pdGVyOiBbJ1snLCAnXSddLFxyXG4gICAgICAgIG1pbmltdW1Db3VudFNlbGVjdGVkOiAzLFxyXG4gICAgICAgIGVsbGlwc2lzOiBmYWxzZSxcclxuICAgICAgICBtdWx0aXBsZTogZmFsc2UsXHJcbiAgICAgICAgbXVsdGlwbGVXaWR0aDogODAsXHJcbiAgICAgICAgc2luZ2xlOiBmYWxzZSxcclxuICAgICAgICBmaWx0ZXI6IGZhbHNlLFxyXG4gICAgICAgIHdpZHRoOiB1bmRlZmluZWQsXHJcbiAgICAgICAgZHJvcFdpZHRoOiB1bmRlZmluZWQsXHJcbiAgICAgICAgbWF4SGVpZ2h0OiAyNTAsXHJcbiAgICAgICAgY29udGFpbmVyOiBudWxsLFxyXG4gICAgICAgIHBvc2l0aW9uOiAnYm90dG9tJyxcclxuICAgICAgICBrZWVwT3BlbjogZmFsc2UsXHJcbiAgICAgICAgYW5pbWF0ZTogJ25vbmUnLCAvLyAnbm9uZScsICdmYWRlJywgJ3NsaWRlJ1xyXG4gICAgICAgIGRpc3BsYXlWYWx1ZXM6IGZhbHNlLFxyXG4gICAgICAgIGRlbGltaXRlcjogJywgJyxcclxuICAgICAgICBhZGRUaXRsZTogZmFsc2UsXHJcbiAgICAgICAgZmlsdGVyQWNjZXB0T25FbnRlcjogZmFsc2UsXHJcbiAgICAgICAgaGlkZU9wdGdyb3VwQ2hlY2tib3hlczogZmFsc2UsXHJcblxyXG4gICAgICAgIHNlbGVjdEFsbFRleHQ6ICdTZWxlY3QgYWxsJyxcclxuICAgICAgICBhbGxTZWxlY3RlZDogJ0FsbCBzZWxlY3RlZCcsXHJcbiAgICAgICAgY291bnRTZWxlY3RlZDogJyMgb2YgJSBzZWxlY3RlZCcsXHJcbiAgICAgICAgbm9NYXRjaGVzRm91bmQ6ICdObyBtYXRjaGVzIGZvdW5kJyxcclxuXHJcbiAgICAgICAgc3R5bGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRleHRUZW1wbGF0ZTogZnVuY3Rpb24gKCRlbG0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICRlbG0uaHRtbCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGFiZWxUZW1wbGF0ZTogZnVuY3Rpb24gKCRlbG0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICRlbG0uYXR0cignbGFiZWwnKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbk9wZW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25DbG9zZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkNoZWNrQWxsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uVW5jaGVja0FsbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uQmx1cjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbk9wdGdyb3VwQ2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkZpbHRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgJCgnc2VsZWN0W211bHRpcGxlXScpLm11bHRpcGxlU2VsZWN0KCk7XHJcbn0pKGpRdWVyeSk7XHJcbiJdfQ==
