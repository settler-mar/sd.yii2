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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxhbmd1YWdlLmpzIiwibGFuZy5qcyIsImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsInRvb2x0aXAuanMiLCJhY2NvdW50X25vdGlmaWNhdGlvbi5qcyIsInNsaWRlci5qcyIsImhlYWRlcl9tZW51X2FuZF9zZWFyY2guanMiLCJjYWxjLWNhc2hiYWNrLmpzIiwiYXV0b19oaWRlX2NvbnRyb2wuanMiLCJoaWRlX3Nob3dfYWxsLmpzIiwiY2xvY2suanMiLCJsaXN0X3R5cGVfc3dpdGNoZXIuanMiLCJzZWxlY3QuanMiLCJzZWFyY2guanMiLCJnb3RvLmpzIiwiYWNjb3VudC13aXRoZHJhdy5qcyIsImFqYXguanMiLCJkb2Jyby5qcyIsImxlZnQtbWVudS10b2dnbGUuanMiLCJzaGFyZTQyLmpzIiwidXNlcl9yZXZpZXdzLmpzIiwicGxhY2Vob2xkZXIuanMiLCJhamF4LWxvYWQuanMiLCJiYW5uZXIuanMiLCJub3RpZmljYXRpb24uanMiLCJtb2RhbHMuanMiLCJmb290ZXJfbWVudS5qcyIsInJhdGluZy5qcyIsImZhdm9yaXRlcy5qcyIsInNjcm9sbF90by5qcyIsImNvcHlfdG9fY2xpcGJvYXJkLmpzIiwiaW1nLmpzIiwicGFyZW50c19vcGVuX3dpbmRvd3MuanMiLCJmb3Jtcy5qcyIsImNvb2tpZS5qcyIsInRhYmxlLmpzIiwiYWpheF9yZW1vdmUuanMiLCJmaXhlcy5qcyIsImxpbmtzLmpzIiwic3RvcmVfcG9pbnRzLmpzIiwiaGFzaHRhZ3MuanMiLCJwbHVnaW5zLmpzIiwibXVsdGlwbGUtc2VsZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyZ0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDak5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM1VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgbGcgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBsYW5nPXt9O1xuICB1cmw9Jy9sYW5ndWFnZS8nK2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5sYW5nKycuanNvbic7XG4gICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xuICAgIC8vY29uc29sZS5sb2coZGF0YSk7XG4gICAgZm9yKHZhciBpbmRleCBpbiBkYXRhKSB7XG4gICAgICBkYXRhW2luZGV4XT1jbGVhclZhcihkYXRhW2luZGV4XSk7XG4gICAgfVxuICAgIGxhbmc9ZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJsYW5ndWFnZV9sb2FkZWRcIik7XG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgLy9jb25zb2xlLmxvZyhkYXRhLCBldmVudCk7XG4gIH0sJ2pzb24nKTtcblxuICBmdW5jdGlvbiBjbGVhclZhcih0eHQpe1xuICAgIHR4dD10eHQucmVwbGFjZSgvXFxzKy9nLFwiIFwiKTsvL9GD0LTQsNC70LXQvdC40LUg0LfQsNC00LLQvtC10L3QuNC1INC/0YDQvtCx0LXQu9C+0LJcblxuICAgIC8v0KfQuNGB0YLQuNC8INC/0L7QtNGB0YLQsNCy0LvRj9C10LzRi9C1INC/0LXRgNC10LzQtdC90L3Ri9C1XG4gICAgc3RyPXR4dC5tYXRjaCgvXFx7KC4qPylcXH0vZyk7XG4gICAgaWYgKCBzdHIgIT0gbnVsbCkge1xuICAgICAgZm9yICggaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHN0cl90PXN0cltpXS5yZXBsYWNlKC8gL2csXCJcIik7XG4gICAgICAgIHR4dD10eHQucmVwbGFjZShzdHJbaV0sc3RyX3QpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHh0O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHRwbCwgZGF0YSl7XG4gICAgaWYodHlwZW9mKGxhbmdbdHBsXSk9PVwidW5kZWZpbmVkXCIpe1xuICAgICAgY29uc29sZS5sb2coXCJsYW5nIG5vdCBmb3VuZDogXCIrdHBsKTtcbiAgICAgIHJldHVybiB0cGw7XG4gICAgfVxuICAgIHRwbD1sYW5nW3RwbF07XG4gICAgaWYodHlwZW9mKGRhdGEpPT1cIm9iamVjdFwiKXtcbiAgICAgIGZvcih2YXIgaW5kZXggaW4gZGF0YSkge1xuICAgICAgICB0cGw9dHBsLnNwbGl0KFwie1wiK2luZGV4K1wifVwiKS5qb2luKGRhdGFbaW5kZXhdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRwbDtcbiAgfVxufSkoKTsiLCJ2YXIgbGFuZyA9IChmdW5jdGlvbigpe1xuICAgIHZhciBjb2RlID0gJyc7XG4gICAgdmFyIGtleSA9ICcnO1xuICAgIHZhciBocmVmX3ByZWZpeCA9ICcnO1xuXG4gICAgdmFyIGxhbmdsaXN0ID0gJChcIiNzZF9sYW5nX2xpc3RcIikuZGF0YSgnanNvbicpO1xuICAgIHZhciBsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcblxuICAgIGlmIChsYW5nbGlzdCkge1xuICAgICAgICB2YXIgbGFuZ0tleSA9IChsb2NhdGlvbi5sZW5ndGggPT09IDMgfHwgbG9jYXRpb24uc3Vic3RyKDMsMSkgPT09ICcvJykgPyBsb2NhdGlvbi5zdWJzdHIoMSwyKSA6ICcnO1xuICAgICAgICBpZiAobGFuZ0tleSAmJiBsYW5nbGlzdFtsYW5nS2V5XSkge1xuICAgICAgICAgICAgY29kZSA9IGxhbmdsaXN0W2xhbmdLZXldO1xuICAgICAgICAgICAga2V5ID0gbGFuZ0tleTtcbiAgICAgICAgICAgIGhyZWZfcHJlZml4ID0ga2V5ID09PSAncnUnID8gJycgOiBrZXkrJy8nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5ID0gJ3J1JztcbiAgICAgICAgICAgIGNvZGUgPSBsYW5nbGlzdFtrZXldID8gbGFuZ2xpc3Rba2V5XSA6ICcnO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGNvZGU6IGNvZGUsXG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBocmVmX3ByZWZpeDogaHJlZl9wcmVmaXhcbiAgICB9XG59KSgpO1xuIiwib2JqZWN0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIHZhciBjID0gYixcbiAgICBrZXk7XG4gIGZvciAoa2V5IGluIGEpIHtcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGM7XG59O1xuXG5mdW5jdGlvbiBsb2dpbl9yZWRpcmVjdChuZXdfaHJlZikge1xuICBocmVmID0gbG9jYXRpb24uaHJlZjtcbiAgaWYgKGhyZWYuaW5kZXhPZignc3RvcmUnKSA+IDAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKSA+IDAgfHwgaHJlZi5pbmRleE9mKCd1cmwoJykgPiAwKSB7XG4gICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gIH0gZWxzZSB7XG4gICAgbG9jYXRpb24uaHJlZiA9IG5ld19ocmVmO1xuICB9XG59XG4iLCIoZnVuY3Rpb24gKHcsIGQsICQpIHtcbiAgdmFyIHNsaWRlX2ludGVydmFsPTQwMDA7XG4gIHZhciBzY3JvbGxzX2Jsb2NrID0gJCgnLnNjcm9sbF9ib3gnKTtcblxuICBpZiAoc2Nyb2xsc19ibG9jay5sZW5ndGggPT0gMCkgcmV0dXJuO1xuICAvLyQoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKS53cmFwQWxsKHNjcm9sbHNfYmxvY2spO1xuICAkKHNjcm9sbHNfYmxvY2spLndyYXAoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKTtcblxuICBpbml0X3Njcm9sbCgpO1xuICBjYWxjX3Njcm9sbCgpO1xuXG4gICQod2luZG93ICkub24oXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgIGNhbGNfc2Nyb2xsKCk7XG4gIH0pO1xuICB2YXIgdDEsIHQyO1xuXG4gICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0MSk7XG4gICAgY2xlYXJUaW1lb3V0KHQyKTtcbiAgICB0MSA9IHNldFRpbWVvdXQoY2FsY19zY3JvbGwsIDMwMCk7XG4gICAgdDIgPSBzZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLCA4MDApO1xuICB9KTtcblxuICBmdW5jdGlvbiBpbml0X3Njcm9sbCgpIHtcbiAgICB2YXIgY29udHJvbCA9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sXCI+PC9kaXY+JztcbiAgICBjb250cm9sID0gJChjb250cm9sKTtcbiAgICBjb250cm9sLmluc2VydEFmdGVyKHNjcm9sbHNfYmxvY2spO1xuICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7XG5cbiAgICBzY3JvbGxzX2Jsb2NrLnByZXBlbmQoJzxkaXYgY2xhc3M9c2Nyb2xsX2JveC1tb3Zlcj48L2Rpdj4nKTtcblxuICAgIGNvbnRyb2wub24oJ2NsaWNrJywgJy5zY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgdmFyIGNvbnRyb2wgPSAkdGhpcy5wYXJlbnQoKTtcbiAgICAgIHZhciBpID0gJHRoaXMuaW5kZXgoKTtcbiAgICAgIGlmICgkdGhpcy5oYXNDbGFzcygnYWN0aXZlJykpcmV0dXJuO1xuICAgICAgY29udHJvbC5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgJHRoaXMuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgICB2YXIgZHggPSBjb250cm9sLmRhdGEoJ3NsaWRlLWR4Jyk7XG4gICAgICB2YXIgZWwgPSBjb250cm9sLnByZXYoKTtcbiAgICAgIGVsLmZpbmQoJy5zY3JvbGxfYm94LW1vdmVyJykuY3NzKCdtYXJnaW4tbGVmdCcsIC1keCAqIGkpO1xuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBpKTtcblxuICAgICAgc3RvcFNjcm9sLmJpbmQoZWwpKCk7XG4gICAgfSlcbiAgfVxuXG4gIGZvciAodmFyIGogPSAwOyBqIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGorKykge1xuICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaik7XG4gICAgZWwucGFyZW50KCkuaG92ZXIoc3RvcFNjcm9sLmJpbmQoZWwpLCBzdGFydFNjcm9sLmJpbmQoZWwpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0U2Nyb2woKSB7XG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICBpZiAoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xuXG4gICAgdmFyIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZS5iaW5kKCR0aGlzKSwgc2xpZGVfaW50ZXJ2YWwpO1xuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIHRpbWVvdXRJZClcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3BTY3JvbCgpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgIHZhciB0aW1lb3V0SWQgPSAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKTtcbiAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLCBmYWxzZSk7XG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpIHx8ICF0aW1lb3V0SWQpcmV0dXJuO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIGZhbHNlKTtcbiAgICBpZiAoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xuXG4gICAgdmFyIGNvbnRyb2xzID0gJHRoaXMubmV4dCgpLmZpbmQoJz4qJyk7XG4gICAgdmFyIGFjdGl2ZSA9ICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xuICAgIHZhciBwb2ludF9jbnQgPSBjb250cm9scy5sZW5ndGg7XG4gICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcbiAgICBhY3RpdmUrKztcbiAgICBpZiAoYWN0aXZlID49IHBvaW50X2NudClhY3RpdmUgPSAwO1xuICAgICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XG5cbiAgICBjb250cm9scy5lcShhY3RpdmUpLmNsaWNrKCk7XG4gICAgc3RhcnRTY3JvbC5iaW5kKCR0aGlzKSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FsY19zY3JvbGwoKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IHNjcm9sbHNfYmxvY2subGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaSk7XG4gICAgICB2YXIgY29udHJvbCA9IGVsLm5leHQoKTtcbiAgICAgIHZhciB3aWR0aF9tYXggPSBlbC5kYXRhKCdzY3JvbGwtd2lkdGgtbWF4Jyk7XG4gICAgICB3ID0gZWwud2lkdGgoKTtcblxuICAgICAgLy/QtNC10LvQsNC10Lwg0LrQvtC90YLRgNC+0LvRjCDQvtCz0YDQsNC90LjRh9C10L3QuNGPINGI0LjRgNC40L3Riy4g0JXRgdC70Lgg0L/RgNC10LLRi9GI0LXQvdC+INGC0L4g0L7RgtC60LvRjtGH0LDQtdC8INGB0LrRgNC+0Lsg0Lgg0L/QtdGA0LXRhdC+0LTQuNC8INC6INGB0LvQtdC00YPRjtGJ0LXQvNGDINGN0LvQtdC80LXQvdGC0YNcbiAgICAgIGlmICh3aWR0aF9tYXggJiYgdyA+IHdpZHRoX21heCkge1xuICAgICAgICBjb250cm9sLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgbm9fY2xhc3MgPSBlbC5kYXRhKCdzY3JvbGwtZWxlbWV0LWlnbm9yZS1jbGFzcycpO1xuICAgICAgdmFyIGNoaWxkcmVuID0gZWwuZmluZCgnPionKS5ub3QoJy5zY3JvbGxfYm94LW1vdmVyJyk7XG4gICAgICBpZiAobm9fY2xhc3MpIHtcbiAgICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5ub3QoJy4nICsgbm9fY2xhc3MpXG4gICAgICB9XG5cbiAgICAgIC8v0JXRgdC70Lgg0L3QtdGCINC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxuICAgICAgaWYgKGNoaWxkcmVuID09IDApIHtcbiAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBmX2VsID0gY2hpbGRyZW4uZXEoMSk7XG4gICAgICB2YXIgY2hpbGRyZW5fdyA9IGZfZWwub3V0ZXJXaWR0aCgpOyAvL9Cy0YHQtdCz0L4g0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXG4gICAgICBjaGlsZHJlbl93ICs9IHBhcnNlRmxvYXQoZl9lbC5jc3MoJ21hcmdpbi1sZWZ0JykpO1xuICAgICAgY2hpbGRyZW5fdyArPSBwYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tcmlnaHQnKSk7XG5cbiAgICAgIHZhciBzY3JlYW5fY291bnQgPSBNYXRoLmZsb29yKHcgLyBjaGlsZHJlbl93KTtcblxuICAgICAgLy/QldGB0LvQuCDQstGB0LUg0LLQu9Cw0LfQuNGCINC90LAg0Y3QutGA0LDQvVxuICAgICAgaWYgKGNoaWxkcmVuIDw9IHNjcmVhbl9jb3VudCkge1xuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy/Qo9C20LUg0YLQvtGH0L3QviDQt9C90LDQtdC8INGH0YLQviDRgdC60YDQvtC7INC90YPQttC10L1cbiAgICAgIGVsLmFkZENsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG5cbiAgICAgIHZhciBwb2ludF9jbnQgPSBjaGlsZHJlbi5sZW5ndGggLSBzY3JlYW5fY291bnQgKyAxO1xuICAgICAgLy/QtdGB0LvQuCDQvdC1INC90LDQtNC+INC+0LHQvdC+0LLQu9GP0YLRjCDQutC+0L3RgtGA0L7QuyDRgtC+INCy0YvRhdC+0LTQuNC8LCDQvdC1INC30LDQsdGL0LLQsNGPINC+0LHQvdC+0LLQuNGC0Ywg0YjQuNGA0LjQvdGDINC00L7Rh9C10YDQvdC40YVcbiAgICAgIGlmIChjb250cm9sLmZpbmQoJz4qJykubGVuZ3RoID09IHBvaW50X2NudCkge1xuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWR4JywgY2hpbGRyZW5fdyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBhY3RpdmUgPSBlbC5kYXRhKCdzbGlkZS1hY3RpdmUnKTtcbiAgICAgIGlmICghYWN0aXZlKWFjdGl2ZSA9IDA7XG4gICAgICBpZiAoYWN0aXZlID49IHBvaW50X2NudClhY3RpdmUgPSBwb2ludF9jbnQgLSAxO1xuICAgICAgdmFyIG91dCA9ICcnO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwb2ludF9jbnQ7IGorKykge1xuICAgICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnICsgKGogPT0gYWN0aXZlID8gJyBhY3RpdmUnIDogJycpICsgJ1wiPjwvZGl2Pic7XG4gICAgICB9XG4gICAgICBjb250cm9sLmh0bWwob3V0KTtcblxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1jb3VudCcsIHBvaW50X2NudCk7XG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWR4JywgY2hpbGRyZW5fdyk7XG5cbiAgICAgIGlmICghZWwuZGF0YSgnc2xpZGUtdGltZW91dElkJykpIHtcbiAgICAgICAgc3RhcnRTY3JvbC5iaW5kKGVsKSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSh3aW5kb3csIGRvY3VtZW50LCBqUXVlcnkpKTtcbiIsInZhciBhY2NvcmRpb25Db250cm9sID0gJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKTtcblxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcblxuXG4gIGlmICgkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tdGl0bGUnKS5oYXNDbGFzcygnYWNjb3JkaW9uLXRpdGxlLWRpc2FibGVkJykpcmV0dXJuO1xuXG4gIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAvKmlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKXtcbiAgICAgcmV0dXJuIGZhbHNlO1xuICAgICB9Ki9cbiAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlVXAoMzAwKTtcbiAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcbiAgfSBlbHNlIHtcbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJykpIHtcbiAgICAgICRvdGhlciA9ICQoJy5hY2NvcmRpb24tb25seV9vbmUnKTtcbiAgICAgICRvdGhlci5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKVxuICAgICAgICAuc2xpZGVVcCgzMDApXG4gICAgICAgIC5yZW1vdmVDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG4gICAgICAkb3RoZXIucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnbGFzdC1vcGVuJyk7XG5cbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnbGFzdC1vcGVuJyk7XG4gICAgfVxuICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2xpZGVEb3duKDMwMCk7XG4gICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn0pO1xuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XG5cblxuJCgnLmFjY29yZGlvbi13cmFwLm9wZW5fZmlyc3QgLmFjY29yZGlvbjpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XG4kKCcuYWNjb3JkaW9uLXdyYXAgLmFjY29yZGlvbi5hY2NvcmRpb24tc2xpbTpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XG4kKCcuYWNjb3JkaW9uLXNsaW0nKS5hZGRDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJyk7XG5cbi8v0LTQu9GPINGB0LjQvNC+0LIg0L7RgtC60YDRi9Cy0LDQtdC8INC10YHQu9C4INC10YHRgtGMINC/0L7QvNC10YLQutCwIG9wZW4g0YLQviDQv9GA0LjRgdCy0LDQuNCy0LDQtdC8INCy0YHQtSDQvtGB0YLQsNC70YzQvdGL0LUg0LrQu9Cw0YHRi1xuYWNjb3JkaW9uU2xpbSA9ICQoJy5hY2NvcmRpb24uYWNjb3JkaW9uLW9ubHlfb25lJyk7XG5pZiAoYWNjb3JkaW9uU2xpbS5sZW5ndGggPiAwKSB7XG4gIGFjY29yZGlvblNsaW0ucGFyZW50KCkuZmluZCgnLmFjY29yZGlvbi5vcGVuJylcbiAgICAuYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpXG4gICAgLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXG4gICAgLnNob3coMzAwKVxuICAgIC5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG59XG5cbiQoJ2JvZHknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICQoJy5hY2NvcmRpb25fZnVsbHNjcmVhbl9jbG9zZS5vcGVuIC5hY2NvcmRpb24tY29udHJvbDpmaXJzdC1jaGlsZCcpLmNsaWNrKClcbn0pO1xuXG4kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBpZiAoZS50YXJnZXQudGFnTmFtZSAhPSAnQScpIHtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb24nKS5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wuYWNjb3JkaW9uLXRpdGxlJykuY2xpY2soKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59KTtcblxuJCgnLmFjY29yZGlvbi1jb250ZW50IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAkdGhpcyA9ICQodGhpcyk7XG4gIGlmICgkdGhpcy5oYXNDbGFzcygnYW5nbGUtdXAnKSlyZXR1cm47XG4gIGUuc3RvcFByb3BhZ2F0aW9uKClcbn0pO1xuXG4oZnVuY3Rpb24oKXtcbiAgdmFyIGVscyA9ICQoJy5hY2NvcmRpb25fbW9yZScpO1xuXG4gIGZ1bmN0aW9uIGFkZEJ1dHRvbihlbCwgY2xhc3NOYW1lLCB0aXRsZSkge1xuICAgICAgdmFyIGJ1dHRvbnMgPSAkKGVsKS5maW5kKCcuJytjbGFzc05hbWUpO1xuICAgICAgaWYgKGJ1dHRvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdmFyIGJ1dHRvbiA9ICQoJzxkaXY+JykuYWRkQ2xhc3MoY2xhc3NOYW1lKS5hZGRDbGFzcygnYWNjb3JkaW9uX21vcmVfYnV0dG9uJyk7XG4gICAgICAgICAgdmFyIGEgPSAkKCc8YT4nKS5hdHRyKCdocmVmJywgXCJcIikuYWRkQ2xhc3MoJ2JsdWUnKS5odG1sKHRpdGxlKTtcbiAgICAgICAgICAkKGJ1dHRvbikuYXBwZW5kKGEpO1xuICAgICAgICAgICQoZWwpLmFwcGVuZChidXR0b24pO1xuICAgICAgfVxuICB9XG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFjY29yZGlvbl9tb3JlX2J1dHRvbl9tb3JlJywgZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb25fbW9yZScpLmFkZENsYXNzKCdvcGVuJyk7XG4gIH0pO1xuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5hY2NvcmRpb25fbW9yZV9idXR0b25fbGVzcycsIGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuYWNjb3JkaW9uX21vcmUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICB9KTtcblxuXG5cbiAgZnVuY3Rpb24gcmVidWlsZCgpe1xuICAgICQoZWxzKS5lYWNoKGZ1bmN0aW9uKGtleSwgaXRlbSl7XG4gICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICB2YXIgY29udGVudCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmFjY29yZGlvbl9tb3JlX2NvbnRlbnQnKTtcbiAgICAgIGlmIChjb250ZW50LnNjcm9sbEhlaWdodCA+IGNvbnRlbnQuY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgIGFkZEJ1dHRvbihpdGVtLCAnYWNjb3JkaW9uX21vcmVfYnV0dG9uX21vcmUnLCAn0J/QvtC00YDQvtCx0L3QtdC1Jyk7XG4gICAgICAgIGFkZEJ1dHRvbihpdGVtLCAnYWNjb3JkaW9uX21vcmVfYnV0dG9uX2xlc3MnLCAn0KHQutGA0YvRgtGMJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKGl0ZW0pLmZpbmQoJy5hY2NvcmRpb25fbW9yZV9idXR0b24nKS5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICB9XG5cbiAgJCh3aW5kb3cpLnJlc2l6ZShyZWJ1aWxkKTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdsYW5ndWFnZV9sb2FkZWQnLCBmdW5jdGlvbigpe1xuICAgIHJlYnVpbGQoKTtcbiAgfSwgZmFsc2UpO1xuXG59KSgpO1xuXG5cbiIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xuICB2YXIgZmlsZUFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiA/IHRydWUgOiBmYWxzZTtcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcidcbiAgfTtcbiAgdmFyIGxhc3RfcG9zdCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIG9uUG9zdChwb3N0KSB7XG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XG4gICAgLy9jb25zb2xlLmxvZyhwb3N0LCB0aGlzKTtcbiAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XG4gICAgdmFyIHdyYXBfaHRtbCA9IGRhdGEud3JhcF9odG1sO1xuXG4gICAgaWYgKHBvc3QucmVuZGVyKSB7XG4gICAgICBwb3N0Lm5vdHlmeV9jbGFzcyA9IFwibm90aWZ5X3doaXRlXCI7XG4gICAgICBub3RpZmljYXRpb24uYWxlcnQocG9zdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIGlmIChwb3N0Lmh0bWwpIHtcbiAgICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XG4gICAgICAgIGFqYXhGb3JtKHdyYXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFwb3N0LmVycm9yKSB7XG4gICAgICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgIHdyYXAuaHRtbCh3cmFwX2h0bWwpO1xuICAgICAgICAgIGZvcm0uZmluZCgnaW5wdXRbdHlwZT10ZXh0XSx0ZXh0YXJlYScpLnZhbCgnJyk7XG4gICAgICAgICAgYWpheEZvcm0od3JhcCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBvc3QuZXJyb3IgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGZvciAodmFyIGluZGV4IGluIHBvc3QuZXJyb3IpIHtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IGxnKCdlcnJvcicpLFxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpbmRleF1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvc3QuZXJyb3IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IGxnKCdlcnJvcicpLFxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpXVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHBvc3QuZXJyb3IgfHwgcG9zdC5tZXNzYWdlKSB7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IChwb3N0LmVycm9yID09PSBmYWxzZSA/IGxnKCdzdWNjZXNzJykgOiBsZygnZXJyb3InKSksXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0Lm1lc3NhZ2UgPyBwb3N0Lm1lc3NhZ2UgOiBwb3N0LmVycm9yXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICAvL1xuICAgIC8vIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgIC8vICAgICAndHlwZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ3N1Y2Nlc3MnIDogJ2VycicsXG4gICAgLy8gICAgICd0aXRsZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ9Cj0YHQv9C10YjQvdC+JyA6ICfQntGI0LjQsdC60LAnLFxuICAgIC8vICAgICAnbWVzc2FnZSc6IEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikgPyBwb3N0LmVycm9yWzBdIDogKHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3IpXG4gICAgLy8gfSk7XG4gIH1cblxuICBmdW5jdGlvbiBvbkZhaWwoKSB7XG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICB3cmFwLmh0bWwoXG4gICAgICAgICc8aDM+JytsZygnc29ycnlfbm90X2V4cGVjdGVkX2Vycm9yJykrJzxoMz4nICtcbiAgICAgICAgbGcoJ2l0X2hhcHBlbnNfc29tZXRpbWVzJylcbiAgICApO1xuICAgIGFqYXhGb3JtKHdyYXApO1xuXG4gIH1cblxuICBmdW5jdGlvbiBvblN1Ym1pdChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAvL2Uuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB2YXIgY3VycmVudFRpbWVNaWxsaXMgPSArbmV3IERhdGUoKTtcbiAgICBpZiAoY3VycmVudFRpbWVNaWxsaXMgLSBsYXN0X3Bvc3QgPCAxMDAwICogMikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxhc3RfcG9zdCA9IGN1cnJlbnRUaW1lTWlsbGlzO1xuICAgIHZhciBkYXRhID0gdGhpcztcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcbiAgICBkYXRhLndyYXBfaHRtbD13cmFwLmh0bWwoKTtcbiAgICB2YXIgaXNWYWxpZCA9IHRydWU7XG5cbiAgICAvL2luaXQod3JhcCk7XG5cbiAgICB2YXIgcmVxdWlyZWQgPSBmb3JtLmZpbmQoJ2lucHV0LnJlcXVpcmVkLCB0ZXh0YXJlYS5yZXF1aXJlZCwgaW5wdXRbaWQ9XCJzdXBwb3J0LXJlY2FwdGNoYVwiXScpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVxdWlyZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWxwQmxvY2sgPSByZXF1aXJlZC5lcShpKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmZpbmQoJy5oZWxwLWJsb2NrJyk7XG4gICAgICB2YXIgaGVscE1lc3NhZ2UgPSBoZWxwQmxvY2sgJiYgaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA/IGhlbHBCbG9jay5kYXRhKCdtZXNzYWdlJykgOiBsZygncmVxdWlyZWQnKTtcblxuICAgICAgaWYgKHJlcXVpcmVkLmVxKGkpLnZhbCgpLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgaGVscEJsb2NrLmh0bWwoaGVscE1lc3NhZ2UpO1xuICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoZWxwQmxvY2suaHRtbCgnJyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChmb3JtLnlpaUFjdGl2ZUZvcm0pIHtcbiAgICAgIGZvcm0ub2ZmKCdhZnRlclZhbGlkYXRlJylcbiAgICAgIGZvcm0ub24oJ2FmdGVyVmFsaWRhdGUnLCB5aWlWYWxpZGF0aW9uLmJpbmQoZGF0YSkpO1xuXG4gICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJywgdHJ1ZSk7XG4gICAgICB2YXIgZCA9IGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScpO1xuICAgICAgaWYgKGQpIHtcbiAgICAgICAgZC52YWxpZGF0ZWQgPSB0cnVlO1xuICAgICAgICBmb3JtLmRhdGEoJ3lpaUFjdGl2ZUZvcm0nLCBkKTtcbiAgICAgICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScpO1xuICAgICAgICBpc1ZhbGlkID0gZC52YWxpZGF0ZWQ7XG4gICAgICB9XG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGlzVmFsaWQgPSBpc1ZhbGlkICYmIChmb3JtLmZpbmQoZGF0YS5wYXJhbS5lcnJvcl9jbGFzcykubGVuZ3RoID09IDApO1xuXG4gICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICBzZW5kRm9ybShkYXRhKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB5aWlWYWxpZGF0aW9uKGUpIHtcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcblxuICAgIGlmKGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGggPT0gMCl7XG4gICAgICBzZW5kRm9ybSh0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBzZW5kRm9ybShkYXRhKXtcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcblxuICAgIGlmICghZm9ybS5zZXJpYWxpemVPYmplY3QpYWRkU1JPKCk7XG5cbiAgICB2YXIgcG9zdERhdGEgPSBmb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xuICAgIGZvcm0uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICBmb3JtLmh0bWwoJycpO1xuICAgIGRhdGEud3JhcC5odG1sKCc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHA+JytsZygnc2VuZGluZ19kYXRhJykrJzwvcD48L2Rpdj4nKTtcblxuICAgIGRhdGEudXJsICs9IChkYXRhLnVybC5pbmRleE9mKCc/JykgPiAwID8gJyYnIDogJz8nKSArICdyYz0nICsgTWF0aC5yYW5kb20oKTtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEudXJsKTtcblxuICAgIC8qaWYoIXBvc3REYXRhLnJldHVyblVybCl7XG4gICAgICBwb3N0RGF0YS5yZXR1cm5Vcmw9bG9jYXRpb24uaHJlZjtcbiAgICB9Ki9cblxuICAgIGlmKHR5cGVvZiBsYW5nICE9IFwidW5kZWZpbmVkXCIgJiYgZGF0YS51cmwuaW5kZXhPZihsYW5nW1wiaHJlZl9wcmVmaXhcIl0pPT0tMSl7XG4gICAgICBkYXRhLnVybD1cIi9cIitsYW5nW1wiaHJlZl9wcmVmaXhcIl0rZGF0YS51cmw7XG4gICAgICBkYXRhLnVybD1kYXRhLnVybC5yZXBsYWNlKCcvLycsJy8nKS5yZXBsYWNlKCcvLycsJy8nKTtcbiAgICB9XG5cbiAgICAkLnBvc3QoXG4gICAgICBkYXRhLnVybCxcbiAgICAgIHBvc3REYXRhLFxuICAgICAgb25Qb3N0LmJpbmQoZGF0YSksXG4gICAgICAnanNvbidcbiAgICApLmZhaWwob25GYWlsLmJpbmQoZGF0YSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCh3cmFwKSB7XG4gICAgZm9ybSA9IHdyYXAuZmluZCgnZm9ybScpO1xuICAgIGRhdGEgPSB7XG4gICAgICBmb3JtOiBmb3JtLFxuICAgICAgcGFyYW06IGRlZmF1bHRzLFxuICAgICAgd3JhcDogd3JhcFxuICAgIH07XG4gICAgZGF0YS51cmwgPSBmb3JtLmF0dHIoJ2FjdGlvbicpIHx8IGxvY2F0aW9uLmhyZWY7XG4gICAgZGF0YS5tZXRob2QgPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcbiAgICBmb3JtLnVuYmluZCgnc3VibWl0Jyk7XG4gICAgLy9mb3JtLm9mZignc3VibWl0Jyk7XG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XG4gIH1cblxuICBlbHMuZmluZCgnW3JlcXVpcmVkXScpXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXG4gICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJyk7XG5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xuICAgIGluaXQoZWxzLmVxKGkpKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcGxhY2Vob2xkZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcGxhY2Vob2xkZXIoKTtcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGFkZFNSTygpIHtcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG8gPSB7fTtcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XG4gICAgICAgIH1cbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvO1xuICB9O1xufTtcbmFkZFNSTygpOyIsInZhciBzZFRvb2x0aXAgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHRvb2x0aXBUaW1lT3V0ID0gbnVsbDtcbiAgICB2YXIgZGlzcGxheVRpbWVPdmVyID0gMDtcbiAgICB2YXIgZGlzcGxheVRpbWVDbGljayA9IDMwMDA7XG4gICAgdmFyIGhpZGVUaW1lID0gMTAwO1xuICAgIHZhciBhcnJvdyA9IDEwO1xuICAgIHZhciBhcnJvd1dpZHRoID0gODtcbiAgICB2YXIgdG9vbHRpcDtcbiAgICB2YXIgc2l6ZSA9ICdzbWFsbCc7XG4gICAgdmFyIGhpZGVDbGFzcyA9ICdoaWRkZW4nO1xuICAgIHZhciB0b29sdGlwRWxlbWVudHM7XG4gICAgdmFyIGN1cnJlbnRFbGVtZW50O1xuXG4gICAgZnVuY3Rpb24gdG9vbHRpcEluaXQoKSB7XG4gICAgICAgIHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndGlwc29fYnViYmxlJykuYWRkQ2xhc3Moc2l6ZSkuYWRkQ2xhc3MoaGlkZUNsYXNzKVxuICAgICAgICAgICAgLmh0bWwoJzxkaXYgY2xhc3M9XCJ0aXBzb19hcnJvd1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXRzb190aXRsZVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXBzb19jb250ZW50XCI+PC9kaXY+Jyk7XG4gICAgICAgICQodG9vbHRpcCkub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjaGVja01vdXNlUG9zKGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCh0b29sdGlwKS5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGNoZWNrTW91c2VQb3MoZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRvb2x0aXApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrTW91c2VQb3MoZSkge1xuICAgICAgICBpZiAoZS5jbGllbnRYID4gJChjdXJyZW50RWxlbWVudCkub2Zmc2V0KCkubGVmdCAmJiBlLmNsaWVudFggPCAkKGN1cnJlbnRFbGVtZW50KS5vZmZzZXQoKS5sZWZ0ICsgJChjdXJyZW50RWxlbWVudCkub3V0ZXJXaWR0aCgpXG4gICAgICAgICAgICAmJiBlLmNsaWVudFkgPiAkKGN1cnJlbnRFbGVtZW50KS5vZmZzZXQoKS50b3AgJiYgZS5jbGllbnRZIDwgJChjdXJyZW50RWxlbWVudCkub2Zmc2V0KCkudG9wICsgJChjdXJyZW50RWxlbWVudCkub3V0ZXJIZWlnaHQoKSkge1xuICAgICAgICAgICAgdG9vbHRpcFNob3coY3VycmVudEVsZW1lbnQsIGRpc3BsYXlUaW1lT3Zlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b29sdGlwU2hvdyhlbGVtLCBkaXNwbGF5VGltZSkge1xuICAgICAgICBjbGVhclRpbWVvdXQodG9vbHRpcFRpbWVPdXQpO1xuXG4gICAgICAgIHZhciB0aXRsZSA9ICQoZWxlbSkuZGF0YSgnb3JpZ2luYWwtdGl0bGUnKTtcbiAgICAgICAgdmFyIGh0bWwgPSAkKCcjJyskKGVsZW0pLmRhdGEoJ29yaWdpbmFsLWh0bWwnKSkuaHRtbCgpO1xuICAgICAgICBpZiAoaHRtbCkge1xuICAgICAgICAgICAgdGl0bGUgPSBodG1sO1xuICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndGlwc29fYnViYmxlX2h0bWwnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RpcHNvX2J1YmJsZV9odG1sJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBvc2l0aW9uID0gJChlbGVtKS5kYXRhKCdwbGFjZW1lbnQnKSB8fCAnYm90dG9tJztcbiAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcyhcInRvcF9yaWdodF9jb3JuZXIgYm90dG9tX3JpZ2h0X2Nvcm5lciB0b3BfbGVmdF9jb3JuZXIgYm90dG9tX2xlZnRfY29ybmVyXCIpO1xuXG4gICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpdHNvX3RpdGxlJykuaHRtbCh0aXRsZSk7XG4gICAgICAgIHNldFBvc2l0b24oZWxlbSwgcG9zaXRpb24pO1xuICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKGhpZGVDbGFzcyk7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50ID0gZWxlbTtcblxuICAgICAgICBpZiAoZGlzcGxheVRpbWUgPiAwKSB7XG4gICAgICAgICAgICB0b29sdGlwVGltZU91dCA9IHNldFRpbWVvdXQodG9vbHRpcEhpZGUsIGRpc3BsYXlUaW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB0b29sdGlwSGlkZSgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRvb2x0aXBUaW1lT3V0KTtcbiAgICAgICAgdG9vbHRpcFRpbWVPdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKGhpZGVDbGFzcyk7XG4gICAgICAgIH0sIGhpZGVUaW1lKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRQb3NpdG9uKGVsZW0sIHBvc2l0aW9uKXtcbiAgICAgICAgdmFyICRlID0gJChlbGVtKTtcbiAgICAgICAgdmFyICR3aW4gPSAkKHdpbmRvdyk7XG4gICAgICAgIHZhciBjdXN0b21Ub3AgPSAkKGVsZW0pLmRhdGEoJ3RvcCcpOy8v0LfQsNC00LDQvdCwINC/0L7Qt9C40YbQuNGPINCy0L3Rg9GC0YDQuCDRjdC70LXQvNC10L3RgtCwXG4gICAgICAgIHZhciBjdXN0b21MZWZ0ID0gJChlbGVtKS5kYXRhKCdsZWZ0Jyk7Ly/Qt9Cw0LTQsNC90LAg0L/QvtC30LjRhtC40Y8g0LLQvdGD0YLRgNC4INGN0LvQtdC80LXQvdGC0LBcbiAgICAgICAgdmFyIG5vcmV2ZXJ0ID0gJChlbGVtKS5kYXRhKCdub3JldmVydCcpOy8v0L3QtSDQv9C10YDQtdCy0L7RgNCw0YfQuNCy0LDRgtGMXG4gICAgICAgIHN3aXRjaChwb3NpdGlvbikge1xuICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICBwb3NfbGVmdCA9ICRlLm9mZnNldCgpLmxlZnQgKyAoY3VzdG9tTGVmdCA/IGN1c3RvbUxlZnQgOiAkZS5vdXRlcldpZHRoKCkgLyAyKSAtICQodG9vbHRpcCkub3V0ZXJXaWR0aCgpIC8gMjtcbiAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wIC0gJCh0b29sdGlwKS5vdXRlckhlaWdodCgpICsgKGN1c3RvbVRvcCA/IGN1c3RvbVRvcCA6IDApIC0gYXJyb3c7XG4gICAgICAgICAgICAgICAgJCh0b29sdGlwKS5maW5kKCcudGlwc29fYXJyb3cnKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5MZWZ0OiAtYXJyb3dXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICgocG9zX3RvcCA8ICR3aW4uc2Nyb2xsVG9wKCkpICYmICFub3JldmVydCkge1xuICAgICAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wICsoY3VzdG9tVG9wID8gY3VzdG9tVG9wIDogJGUub3V0ZXJIZWlnaHQoKSkgKyBhcnJvdztcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ2JvdHRvbScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ3RvcCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgcG9zX2xlZnQgPSAkZS5vZmZzZXQoKS5sZWZ0ICsgKGN1c3RvbUxlZnQgPyBjdXN0b21MZWZ0IDogJGUub3V0ZXJXaWR0aCgpIC8gMikgLSAkKHRvb2x0aXApLm91dGVyV2lkdGgoKSAvIDI7XG4gICAgICAgICAgICAgICAgcG9zX3RvcCA9ICRlLm9mZnNldCgpLnRvcCArIChjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAkZS5vdXRlckhlaWdodCgpKSArIGFycm93O1xuICAgICAgICAgICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpcHNvX2Fycm93JykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogLWFycm93V2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoKHBvc190b3AgKyAkKHRvb2x0aXApLmhlaWdodCgpID4gJHdpbi5zY3JvbGxUb3AoKSArICR3aW4ub3V0ZXJIZWlnaHQoKSkgJiYgIW5vcmV2ZXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgLSAkKHRvb2x0aXApLmhlaWdodCgpICsgKGN1c3RvbVRvcCA/IGN1c3RvbVRvcCA6IDApIC0gYXJyb3c7XG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCd0b3AnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCdib3R0b20nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgJCh0b29sdGlwKS5jc3Moe1xuICAgICAgICAgICAgbGVmdDogIHBvc19sZWZ0LFxuICAgICAgICAgICAgdG9wOiBwb3NfdG9wXG4gICAgICAgIH0pO1xuICAgIH1cblxuXG5cblxuICAgIGZ1bmN0aW9uIHNldEV2ZW50cygpIHtcblxuICAgICAgICB0b29sdGlwRWxlbWVudHMgPSAkKCdbZGF0YS10b2dnbGU9dG9vbHRpcF0nKTtcblxuICAgICAgICB0b29sdGlwRWxlbWVudHMub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmRhdGEoJ2NsaWNrYWJsZScpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQodG9vbHRpcCkuaGFzQ2xhc3MoaGlkZUNsYXNzKSkge1xuICAgICAgICAgICAgICAgICAgICB0b29sdGlwU2hvdyh0aGlzLCBkaXNwbGF5VGltZUNsaWNrKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b29sdGlwSGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0b29sdGlwRWxlbWVudHMub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPj0gMTAyNCkge1xuICAgICAgICAgICAgICAgIHRvb2x0aXBTaG93KHRoaXMsIGRpc3BsYXlUaW1lT3Zlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0b29sdGlwRWxlbWVudHMub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPj0gMTAyNCkge1xuICAgICAgICAgICAgICAgIHRvb2x0aXBTaG93KHRoaXMsIGRpc3BsYXlUaW1lT3Zlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0b29sdGlwRWxlbWVudHMub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoKXtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMDI0KSB7XG4gICAgICAgICAgICAgICAgdG9vbHRpcEhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgIC8vICAgICB0b29sdGlwSW5pdCgpO1xuICAgIC8vICAgICBzZXRFdmVudHMoKTtcbiAgICAvLyB9KTtcbiAgICAvL1xuICAgIHJldHVybiB7XG4gICAgICAgIGluaXQ6IHRvb2x0aXBJbml0LFxuICAgICAgICBzZXRFdmVudHM6IHNldEV2ZW50c1xuICAgIH1cbn0pKCk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIHNkVG9vbHRpcC5pbml0KCk7XG4gICAgc2RUb29sdGlwLnNldEV2ZW50cygpO1xufSk7XG5cbiIsIihmdW5jdGlvbiAoKSB7XG4gIHZhciAkbm90eWZpX2J0biA9ICQoJy5oZWFkZXItbG9nb19ub3R5Jyk7XG4gIGlmICgkbm90eWZpX2J0bi5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBocmVmID0gJy8nK2xhbmcuaHJlZl9wcmVmaXgrJ2FjY291bnQvbm90aWZpY2F0aW9uJztcblxuICAkLmdldChocmVmLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGlmICghZGF0YS5ub3RpZmljYXRpb25zIHx8IGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGggPT0gMCkgcmV0dXJuO1xuXG4gICAgdmFyIG91dCA9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWJveD48ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWJveC1pbm5lcj48dWwgY2xhc3M9XCJoZWFkZXItbm90eS1saXN0XCI+JztcbiAgICAkbm90eWZpX2J0bi5maW5kKCdhJykucmVtb3ZlQXR0cignaHJlZicpO1xuICAgIHZhciBoYXNfbmV3ID0gZmFsc2U7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm5vdGlmaWNhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGVsID0gZGF0YS5ub3RpZmljYXRpb25zW2ldO1xuICAgICAgdmFyIGlzX25ldyA9IChlbC5pc192aWV3ZWQgPT0gMCAmJiBlbC50eXBlX2lkID09IDIpO1xuICAgICAgb3V0ICs9ICc8bGkgY2xhc3M9XCJoZWFkZXItbm90eS1pdGVtJyArIChpc19uZXcgPyAnIGhlYWRlci1ub3R5LWl0ZW1fbmV3JyA6ICcnKSArICdcIj4nO1xuICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWRhdGE+JyArIGVsLmRhdGEgKyAnPC9kaXY+JztcbiAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1oZWFkZXItbm90eS10ZXh0PicgKyBlbC50ZXh0ICsgJzwvZGl2Pic7XG4gICAgICBvdXQgKz0gJzwvbGk+JztcbiAgICAgIGhhc19uZXcgPSBoYXNfbmV3IHx8IGlzX25ldztcbiAgICB9XG5cbiAgICBvdXQgKz0gJzwvdWw+JztcbiAgICBvdXQgKz0gJzxhIGNsYXNzPVwiYnRuIGhlYWRlci1ub3R5LWJveC1idG5cIiBocmVmPVwiJytocmVmKydcIj4nICsgZGF0YS5idG4gKyAnPC9hPic7XG4gICAgb3V0ICs9ICc8L2Rpdj48L2Rpdj4nO1xuICAgICQoJy5oZWFkZXInKS5hcHBlbmQob3V0KTtcblxuICAgIGlmIChoYXNfbmV3KSB7XG4gICAgICAkbm90eWZpX2J0bi5hZGRDbGFzcygndG9vbHRpcCcpLmFkZENsYXNzKCdoYXMtbm90eScpO1xuICAgIH1cblxuICAgICRub3R5ZmlfYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAoJCgnLmhlYWRlci1ub3R5LWJveCcpLmhhc0NsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpKSB7XG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5yZW1vdmVDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcbiAgICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykuYWRkQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XG4gICAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xuXG4gICAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdoYXMtbm90eScpKSB7XG4gICAgICAgICAgJC5wb3N0KCcvYWNjb3VudC9ub3RpZmljYXRpb24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKCcuaGVhZGVyLWxvZ29fbm90eScpLnJlbW92ZUNsYXNzKCd0b29sdGlwJykucmVtb3ZlQ2xhc3MoJ2hhcy1ub3R5Jyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XG4gICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcbiAgICB9KTtcblxuICAgICQoJy5oZWFkZXItbm90eS1saXN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KVxuICB9LCAnanNvbicpO1xuXG59KSgpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pZiAodHlwZW9mIG1paGFpbGRldiA9PSBcInVuZGVmaW5lZFwiIHx8ICFtaWhhaWxkZXYpIHtcbiAgICB2YXIgbWloYWlsZGV2ID0ge307XG4gICAgbWloYWlsZGV2LmVsRmluZGVyID0ge1xuICAgICAgICBvcGVuTWFuYWdlcjogZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICAgICAgICB2YXIgcGFyYW1zID0gXCJtZW51YmFyPW5vLHRvb2xiYXI9bm8sbG9jYXRpb249bm8sZGlyZWN0b3JpZXM9bm8sc3RhdHVzPW5vLGZ1bGxzY3JlZW49bm9cIjtcbiAgICAgICAgICAgIGlmKG9wdGlvbnMud2lkdGggPT0gJ2F1dG8nKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLndpZHRoID0gJCh3aW5kb3cpLndpZHRoKCkvMS41O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihvcHRpb25zLmhlaWdodCA9PSAnYXV0bycpe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLzEuNTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcGFyYW1zID0gcGFyYW1zICsgXCIsd2lkdGg9XCIgKyBvcHRpb25zLndpZHRoO1xuICAgICAgICAgICAgcGFyYW1zID0gcGFyYW1zICsgXCIsaGVpZ2h0PVwiICsgb3B0aW9ucy5oZWlnaHQ7XG5cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2cocGFyYW1zKTtcbiAgICAgICAgICAgIHZhciB3aW4gPSB3aW5kb3cub3BlbihvcHRpb25zLnVybCwgJ0VsRmluZGVyTWFuYWdlcicgKyBvcHRpb25zLmlkLCBwYXJhbXMpO1xuICAgICAgICAgICAgd2luLmZvY3VzKClcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb25zOiB7fSxcbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGlkLCBmdW5jKXtcbiAgICAgICAgICAgIHRoaXMuZnVuY3Rpb25zW2lkXSA9IGZ1bmM7XG4gICAgICAgIH0sXG4gICAgICAgIGNhbGxGdW5jdGlvbjogZnVuY3Rpb24oaWQsIGZpbGUpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZnVuY3Rpb25zW2lkXShmaWxlLCBpZCk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uUmV0dXJuVG9JbnB1dDogZnVuY3Rpb24oZmlsZSwgaWQpe1xuICAgICAgICAgICAgalF1ZXJ5KCcjJyArIGlkKS52YWwoZmlsZS51cmwpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG59XG5cblxuXG52YXIgbWVnYXNsaWRlciA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBzbGlkZXJfZGF0YSA9IGZhbHNlO1xuICB2YXIgY29udGFpbmVyX2lkID0gXCJzZWN0aW9uI21lZ2Ffc2xpZGVyXCI7XG4gIHZhciBwYXJhbGxheF9ncm91cCA9IGZhbHNlO1xuICB2YXIgcGFyYWxsYXhfdGltZXIgPSBmYWxzZTtcbiAgdmFyIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xuICB2YXIgcGFyYWxsYXhfZCA9IDE7XG4gIHZhciBtb2JpbGVfbW9kZSA9IC0xO1xuICB2YXIgbWF4X3RpbWVfbG9hZF9waWMgPSAzMDA7XG4gIHZhciBtb2JpbGVfc2l6ZSA9IDcwMDtcbiAgdmFyIHJlbmRlcl9zbGlkZV9ub20gPSAwO1xuICB2YXIgdG90X2ltZ193YWl0O1xuICB2YXIgc2xpZGVzO1xuICB2YXIgc2xpZGVfc2VsZWN0X2JveDtcbiAgdmFyIGVkaXRvcjtcbiAgdmFyIHRpbWVvdXRJZDtcbiAgdmFyIHNjcm9sbF9wZXJpb2QgPSA2MDAwO1xuXG4gIHZhciBwb3NBcnIgPSBbXG4gICAgJ3NsaWRlcl9fdGV4dC1sdCcsICdzbGlkZXJfX3RleHQtY3QnLCAnc2xpZGVyX190ZXh0LXJ0JyxcbiAgICAnc2xpZGVyX190ZXh0LWxjJywgJ3NsaWRlcl9fdGV4dC1jYycsICdzbGlkZXJfX3RleHQtcmMnLFxuICAgICdzbGlkZXJfX3RleHQtbGInLCAnc2xpZGVyX190ZXh0LWNiJywgJ3NsaWRlcl9fdGV4dC1yYicsXG4gIF07XG4gIHZhciBwb3NfbGlzdCA9IFtcbiAgICAn0JvQtdCy0L4g0LLQtdGA0YUnLCAn0YbQtdC90YLRgCDQstC10YDRhScsICfQv9GA0LDQstC+INCy0LXRgNGFJyxcbiAgICAn0JvQtdCy0L4g0YbQtdC90YLRgCcsICfRhtC10L3RgtGAJywgJ9C/0YDQsNCy0L4g0YbQtdC90YLRgCcsXG4gICAgJ9Cb0LXQstC+INC90LjQtycsICfRhtC10L3RgtGAINC90LjQtycsICfQv9GA0LDQstC+INC90LjQtycsXG4gIF07XG4gIHZhciBzaG93X2RlbGF5ID0gW1xuICAgICdzaG93X25vX2RlbGF5JyxcbiAgICAnc2hvd19kZWxheV8wNScsXG4gICAgJ3Nob3dfZGVsYXlfMTAnLFxuICAgICdzaG93X2RlbGF5XzE1JyxcbiAgICAnc2hvd19kZWxheV8yMCcsXG4gICAgJ3Nob3dfZGVsYXlfMjUnLFxuICAgICdzaG93X2RlbGF5XzMwJ1xuICBdO1xuICB2YXIgaGlkZV9kZWxheSA9IFtcbiAgICAnaGlkZV9ub19kZWxheScsXG4gICAgJ2hpZGVfZGVsYXlfMDUnLFxuICAgICdoaWRlX2RlbGF5XzEwJyxcbiAgICAnaGlkZV9kZWxheV8xNScsXG4gICAgJ2hpZGVfZGVsYXlfMjAnXG4gIF07XG4gIHZhciB5ZXNfbm9fYXJyID0gW1xuICAgICdubycsXG4gICAgJ3llcydcbiAgXTtcbiAgdmFyIHllc19ub192YWwgPSBbXG4gICAgJycsXG4gICAgJ2ZpeGVkX19mdWxsLWhlaWdodCdcbiAgXTtcbiAgdmFyIGJ0bl9zdHlsZSA9IFtcbiAgICAnbm9uZScsXG4gICAgJ2JvcmRvJyxcbiAgICAnYmxhY2snLFxuICAgICdibHVlJyxcbiAgICAnZGFyay1ibHVlJyxcbiAgICAncmVkJyxcbiAgICAnb3JhbmdlJyxcbiAgICAnZ3JlZW4nLFxuICAgICdsaWdodC1ncmVlbicsXG4gICAgJ2RhcmstZ3JlZW4nLFxuICAgICdwaW5rJyxcbiAgICAneWVsbG93J1xuICBdO1xuICB2YXIgc2hvd19hbmltYXRpb25zID0gW1xuICAgIFwibm90X2FuaW1hdGVcIixcbiAgICBcImJvdW5jZUluXCIsXG4gICAgXCJib3VuY2VJbkRvd25cIixcbiAgICBcImJvdW5jZUluTGVmdFwiLFxuICAgIFwiYm91bmNlSW5SaWdodFwiLFxuICAgIFwiYm91bmNlSW5VcFwiLFxuICAgIFwiZmFkZUluXCIsXG4gICAgXCJmYWRlSW5Eb3duXCIsXG4gICAgXCJmYWRlSW5MZWZ0XCIsXG4gICAgXCJmYWRlSW5SaWdodFwiLFxuICAgIFwiZmFkZUluVXBcIixcbiAgICBcImZsaXBJblhcIixcbiAgICBcImZsaXBJbllcIixcbiAgICBcImxpZ2h0U3BlZWRJblwiLFxuICAgIFwicm90YXRlSW5cIixcbiAgICBcInJvdGF0ZUluRG93bkxlZnRcIixcbiAgICBcInJvdGF0ZUluVXBMZWZ0XCIsXG4gICAgXCJyb3RhdGVJblVwUmlnaHRcIixcbiAgICBcImphY2tJblRoZUJveFwiLFxuICAgIFwicm9sbEluXCIsXG4gICAgXCJ6b29tSW5cIlxuICBdO1xuXG4gIHZhciBoaWRlX2FuaW1hdGlvbnMgPSBbXG4gICAgXCJub3RfYW5pbWF0ZVwiLFxuICAgIFwiYm91bmNlT3V0XCIsXG4gICAgXCJib3VuY2VPdXREb3duXCIsXG4gICAgXCJib3VuY2VPdXRMZWZ0XCIsXG4gICAgXCJib3VuY2VPdXRSaWdodFwiLFxuICAgIFwiYm91bmNlT3V0VXBcIixcbiAgICBcImZhZGVPdXRcIixcbiAgICBcImZhZGVPdXREb3duXCIsXG4gICAgXCJmYWRlT3V0TGVmdFwiLFxuICAgIFwiZmFkZU91dFJpZ2h0XCIsXG4gICAgXCJmYWRlT3V0VXBcIixcbiAgICBcImZsaXBPdXRYXCIsXG4gICAgXCJsaXBPdXRZXCIsXG4gICAgXCJsaWdodFNwZWVkT3V0XCIsXG4gICAgXCJyb3RhdGVPdXRcIixcbiAgICBcInJvdGF0ZU91dERvd25MZWZ0XCIsXG4gICAgXCJyb3RhdGVPdXREb3duUmlnaHRcIixcbiAgICBcInJvdGF0ZU91dFVwTGVmdFwiLFxuICAgIFwicm90YXRlT3V0VXBSaWdodFwiLFxuICAgIFwiaGluZ2VcIixcbiAgICBcInJvbGxPdXRcIlxuICBdO1xuICB2YXIgc3RUYWJsZTtcbiAgdmFyIHBhcmFsYXhUYWJsZTtcblxuICBmdW5jdGlvbiBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWxzKSB7XG4gICAgaWYgKGVscy5sZW5ndGggPT0gMClyZXR1cm47XG4gICAgZWxzLndyYXAoJzxkaXYgY2xhc3M9XCJzZWxlY3RfaW1nXCI+Jyk7XG4gICAgZWxzID0gZWxzLnBhcmVudCgpO1xuICAgIGVscy5hcHBlbmQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmlsZV9idXR0b25cIj48aSBjbGFzcz1cIm1jZS1pY28gbWNlLWktYnJvd3NlXCI+PC9pPjwvYnV0dG9uPicpO1xuICAgIC8qZWxzLmZpbmQoJ2J1dHRvbicpLm9uKCdjbGljaycsZnVuY3Rpb24gKCkge1xuICAgICAkKCcjcm94eUN1c3RvbVBhbmVsMicpLmFkZENsYXNzKCdvcGVuJylcbiAgICAgfSk7Ki9cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGVsID0gZWxzLmVxKGkpLmZpbmQoJ2lucHV0Jyk7XG4gICAgICBpZiAoIWVsLmF0dHIoJ2lkJykpIHtcbiAgICAgICAgZWwuYXR0cignaWQnLCAnZmlsZV8nICsgaSArICdfJyArIERhdGUubm93KCkpXG4gICAgICB9XG4gICAgICB2YXIgdF9pZCA9IGVsLmF0dHIoJ2lkJyk7XG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIucmVnaXN0ZXIodF9pZCwgZnVuY3Rpb24gKGZpbGUsIGlkKSB7XG4gICAgICAgIC8vJCh0aGlzKS52YWwoZmlsZS51cmwpLnRyaWdnZXIoJ2NoYW5nZScsIFtmaWxlLCBpZF0pO1xuICAgICAgICAkKCcjJyArIGlkKS52YWwoZmlsZS51cmwpLmNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICA7XG5cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmZpbGVfYnV0dG9uJywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKS5wcmV2KCk7XG4gICAgICB2YXIgaWQgPSAkdGhpcy5hdHRyKCdpZCcpO1xuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLm9wZW5NYW5hZ2VyKHtcbiAgICAgICAgXCJ1cmxcIjogXCIvbWFuYWdlci9lbGZpbmRlcj9maWx0ZXI9aW1hZ2UmY2FsbGJhY2s9XCIgKyBpZCArIFwiJmxhbmc9cnVcIixcbiAgICAgICAgXCJ3aWR0aFwiOiBcImF1dG9cIixcbiAgICAgICAgXCJoZWlnaHRcIjogXCJhdXRvXCIsXG4gICAgICAgIFwiaWRcIjogaWRcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuSW5wdXQoZGF0YSkge1xuICAgIHZhciBpbnB1dCA9ICc8aW5wdXQgY2xhc3M9XCInICsgKGRhdGEuaW5wdXRDbGFzcyB8fCAnJykgKyAnXCIgdmFsdWU9XCInICsgKGRhdGEudmFsdWUgfHwgJycpICsgJ1wiPic7XG4gICAgaWYgKGRhdGEubGFiZWwpIHtcbiAgICAgIGlucHV0ID0gJzxsYWJlbD48c3Bhbj4nICsgZGF0YS5sYWJlbCArICc8L3NwYW4+JyArIGlucHV0ICsgJzwvbGFiZWw+JztcbiAgICB9XG4gICAgaWYgKGRhdGEucGFyZW50KSB7XG4gICAgICBpbnB1dCA9ICc8JyArIGRhdGEucGFyZW50ICsgJz4nICsgaW5wdXQgKyAnPC8nICsgZGF0YS5wYXJlbnQgKyAnPic7XG4gICAgfVxuICAgIGlucHV0ID0gJChpbnB1dCk7XG5cbiAgICBpZiAoZGF0YS5vbkNoYW5nZSkge1xuICAgICAgdmFyIG9uQ2hhbmdlO1xuICAgICAgaWYgKGRhdGEuYmluZCkge1xuICAgICAgICBkYXRhLmJpbmQuaW5wdXQgPSBpbnB1dC5maW5kKCdpbnB1dCcpO1xuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChkYXRhLmJpbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb25DaGFuZ2UgPSBkYXRhLm9uQ2hhbmdlLmJpbmQoaW5wdXQuZmluZCgnaW5wdXQnKSk7XG4gICAgICB9XG4gICAgICBpbnB1dC5maW5kKCdpbnB1dCcpLm9uKCdjaGFuZ2UnLCBvbkNoYW5nZSlcbiAgICB9XG4gICAgcmV0dXJuIGlucHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuU2VsZWN0KGRhdGEpIHtcbiAgICB2YXIgaW5wdXQgPSAkKCc8c2VsZWN0Lz4nKTtcblxuICAgIHZhciBlbCA9IHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdO1xuICAgIGlmIChkYXRhLmluZGV4ICE9PSBmYWxzZSkge1xuICAgICAgZWwgPSBlbFtkYXRhLmluZGV4XTtcbiAgICB9XG5cbiAgICBpZiAoZWxbZGF0YS5wYXJhbV0pIHtcbiAgICAgIGRhdGEudmFsdWUgPSBlbFtkYXRhLnBhcmFtXTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YS52YWx1ZSA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEuc3RhcnRfb3B0aW9uKSB7XG4gICAgICBpbnB1dC5hcHBlbmQoZGF0YS5zdGFydF9vcHRpb24pXG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWw7XG4gICAgICB2YXIgdHh0ID0gZGF0YS5saXN0W2ldO1xuICAgICAgaWYgKGRhdGEudmFsX3R5cGUgPT0gMCkge1xuICAgICAgICB2YWwgPSBkYXRhLmxpc3RbaV07XG4gICAgICB9IGVsc2UgaWYgKGRhdGEudmFsX3R5cGUgPT0gMSkge1xuICAgICAgICB2YWwgPSBpO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbF90eXBlID09IDIpIHtcbiAgICAgICAgLy92YWw9ZGF0YS52YWxfbGlzdFtpXTtcbiAgICAgICAgdmFsID0gaTtcbiAgICAgICAgdHh0ID0gZGF0YS52YWxfbGlzdFtpXTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNlbCA9ICh2YWwgPT0gZGF0YS52YWx1ZSA/ICdzZWxlY3RlZCcgOiAnJyk7XG4gICAgICBpZiAoc2VsID09ICdzZWxlY3RlZCcpIHtcbiAgICAgICAgaW5wdXQuYXR0cigndF92YWwnLCBkYXRhLmxpc3RbaV0pO1xuICAgICAgfVxuICAgICAgdmFyIG9wdGlvbiA9ICc8b3B0aW9uIHZhbHVlPVwiJyArIHZhbCArICdcIiAnICsgc2VsICsgJz4nICsgdHh0ICsgJzwvb3B0aW9uPic7XG4gICAgICBpZiAoZGF0YS52YWxfdHlwZSA9PSAyKSB7XG4gICAgICAgIG9wdGlvbiA9ICQob3B0aW9uKS5hdHRyKCdjb2RlJywgZGF0YS5saXN0W2ldKTtcbiAgICAgIH1cbiAgICAgIGlucHV0LmFwcGVuZChvcHRpb24pXG4gICAgfVxuXG4gICAgaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEgPSB0aGlzO1xuICAgICAgdmFyIHZhbCA9IGRhdGEuZWwudmFsKCk7XG4gICAgICB2YXIgc2xfb3AgPSBkYXRhLmVsLmZpbmQoJ29wdGlvblt2YWx1ZT0nICsgdmFsICsgJ10nKTtcbiAgICAgIHZhciBjbHMgPSBzbF9vcC50ZXh0KCk7XG4gICAgICB2YXIgY2ggPSBzbF9vcC5hdHRyKCdjb2RlJyk7XG4gICAgICBpZiAoIWNoKWNoID0gY2xzO1xuICAgICAgaWYgKGRhdGEuaW5kZXggIT09IGZhbHNlKSB7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdW2RhdGEuaW5kZXhdW2RhdGEucGFyYW1dID0gdmFsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5wYXJhbV0gPSB2YWw7XG4gICAgICB9XG5cbiAgICAgIGRhdGEub2JqLnJlbW92ZUNsYXNzKGRhdGEucHJlZml4ICsgZGF0YS5lbC5hdHRyKCd0X3ZhbCcpKTtcbiAgICAgIGRhdGEub2JqLmFkZENsYXNzKGRhdGEucHJlZml4ICsgY2gpO1xuICAgICAgZGF0YS5lbC5hdHRyKCd0X3ZhbCcsIGNoKTtcblxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBlbDogaW5wdXQsXG4gICAgICBvYmo6IGRhdGEub2JqLFxuICAgICAgZ3I6IGRhdGEuZ3IsXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOiBkYXRhLnBhcmFtLFxuICAgICAgcHJlZml4OiBkYXRhLnByZWZpeCB8fCAnJ1xuICAgIH0pKTtcblxuICAgIGlmIChkYXRhLnBhcmVudCkge1xuICAgICAgdmFyIHBhcmVudCA9ICQoJzwnICsgZGF0YS5wYXJlbnQgKyAnLz4nKTtcbiAgICAgIHBhcmVudC5hcHBlbmQoaW5wdXQpO1xuICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIGlucHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoZGF0YSkge1xuICAgIHZhciBhbmltX3NlbCA9IFtdO1xuICAgIHZhciBvdXQ7XG5cbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPlNob3cgYW5pbWF0aW9uPC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBzaG93X2FuaW1hdGlvbnMsXG4gICAgICB2YWxfdHlwZTogMCxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ICdzaG93X2FuaW1hdGlvbicsXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxuICAgIH0pKTtcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPlNob3cgZGVsYXk8L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHNob3dfZGVsYXksXG4gICAgICB2YWxfdHlwZTogMSxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ICdzaG93X2RlbGF5JyxcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XG4gICAgfSkpO1xuXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8YnIvPicpO1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+SGlkZSBhbmltYXRpb248L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IGhpZGVfYW5pbWF0aW9ucyxcbiAgICAgIHZhbF90eXBlOiAwLFxuICAgICAgb2JqOiBkYXRhLm9iaixcbiAgICAgIGdyOiBkYXRhLmdyLFxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTogJ2hpZGVfYW5pbWF0aW9uJyxcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XG4gICAgfSkpO1xuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+SGlkZSBkZWxheTwvc3Bhbj4nKTtcbiAgICB9XG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogaGlkZV9kZWxheSxcbiAgICAgIHZhbF90eXBlOiAxLFxuICAgICAgb2JqOiBkYXRhLm9iaixcbiAgICAgIGdyOiBkYXRhLmdyLFxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTogJ2hpZGVfZGVsYXknLFxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcbiAgICB9KSk7XG5cbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcbiAgICAgIG91dCA9ICQoJzxkaXYgY2xhc3M9XCJhbmltX3NlbFwiLz4nKTtcbiAgICAgIG91dC5hcHBlbmQoYW5pbV9zZWwpO1xuICAgIH1cbiAgICBpZiAoZGF0YS50eXBlID09IDEpIHtcbiAgICAgIG91dCA9IGFuaW1fc2VsO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0X2VkaXRvcigpIHtcbiAgICAkKCcjdzEnKS5yZW1vdmUoKTtcbiAgICAkKCcjdzFfYnV0dG9uJykucmVtb3ZlKCk7XG4gICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gc2xpZGVyX2RhdGFbMF0ubW9iaWxlLnNwbGl0KCc/JylbMF07XG5cbiAgICB2YXIgZWwgPSAkKCcjbWVnYV9zbGlkZXJfY29udHJvbGUnKTtcbiAgICB2YXIgYnRuc19ib3ggPSAkKCc8ZGl2IGNsYXNzPVwiYnRuX2JveFwiLz4nKTtcblxuICAgIGVsLmFwcGVuZCgnPGgyPtCj0L/RgNCw0LLQu9C10L3QuNC1PC9oMj4nKTtcbiAgICBlbC5hcHBlbmQoJCgnPHRleHRhcmVhLz4nLCB7XG4gICAgICB0ZXh0OiBKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSksXG4gICAgICBpZDogJ3NsaWRlX2RhdGEnLFxuICAgICAgbmFtZTogZWRpdG9yXG4gICAgfSkpO1xuXG4gICAgdmFyIGJ0biA9ICQoJzxidXR0b24gY2xhc3M9XCJcIi8+JykudGV4dChcItCQ0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xuICAgIGJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkucmVtb3ZlQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcbiAgICB9KTtcblxuICAgIHZhciBidG4gPSAkKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQlNC10LDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XG4gICAgYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5hZGRDbGFzcygnaGlkZV9zbGlkZScpO1xuICAgIH0pO1xuICAgIGVsLmFwcGVuZChidG5zX2JveCk7XG5cbiAgICBlbC5hcHBlbmQoJzxoMj7QntCx0YnQuNC1INC/0LDRgNCw0LzQtdGC0YDRizwvaDI+Jyk7XG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5tb2JpbGUsXG4gICAgICBsYWJlbDogXCLQodC70LDQudC0INC00LvRjyDRgtC10LvQtdGE0L7QvdCwXCIsXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9ICQodGhpcykudmFsKClcbiAgICAgICAgJCgnLm1vYl9iZycpLmVxKDApLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSArICcpJyk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmZvbixcbiAgICAgIGxhYmVsOiBcItCe0YHQvdC+0L3QvtC5INGE0L7QvVwiLFxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5mb24gPSAkKHRoaXMpLnZhbCgpXG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBzbGlkZXJfZGF0YVswXS5mb24gKyAnKScpXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICB2YXIgYnRuX2NoID0gJCgnPGRpdiBjbGFzcz1cImJ0bnNcIi8+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZCgnPGgzPtCa0L3QvtC/0LrQsCDQv9C10YDQtdGF0L7QtNCwKNC00LvRjyDQn9CaINCy0LXRgNGB0LjQuCk8L2gzPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0LFxuICAgICAgbGFiZWw6IFwi0KLQtdC60YHRglwiLFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApLnRleHQoc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9LFxuICAgIH0pKTtcblxuICAgIHZhciBidXRfc2wgPSAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApO1xuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmLFxuICAgICAgbGFiZWw6IFwi0KHRgdGL0LvQutCwXCIsXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5idXR0b24uaHJlZiA9ICQodGhpcykudmFsKCk7XG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCkuYXR0cignaHJlZicsc2xpZGVyX2RhdGFbMF0uYnV0dG9uLmhyZWYpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9LFxuICAgIH0pKTtcblxuICAgIGJ0bl9jaC5hcHBlbmQoJzxici8+Jyk7XG4gICAgdmFyIHdyYXBfbGFiID0gJCgnPGxhYmVsLz4nKTtcbiAgICBidG5fY2guYXBwZW5kKHdyYXBfbGFiKTtcbiAgICB3cmFwX2xhYi5hcHBlbmQoJzxzcGFuPtCe0YTQvtGA0LzQu9C10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcbiAgICB3cmFwX2xhYi5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IGJ0bl9zdHlsZSxcbiAgICAgIHZhbF90eXBlOiAwLFxuICAgICAgb2JqOiBidXRfc2wsXG4gICAgICBncjogJ2J1dHRvbicsXG4gICAgICBpbmRleDogZmFsc2UsXG4gICAgICBwYXJhbTogJ2NvbG9yJ1xuICAgIH0pKTtcblxuICAgIGJ0bl9jaC5hcHBlbmQoJzxici8+Jyk7XG4gICAgd3JhcF9sYWIgPSAkKCc8bGFiZWwvPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQod3JhcF9sYWIpO1xuICAgIHdyYXBfbGFiLmFwcGVuZCgnPHNwYW4+0J/QvtC70L7QttC10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcbiAgICB3cmFwX2xhYi5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHBvc0FycixcbiAgICAgIHZhbF9saXN0OiBwb3NfbGlzdCxcbiAgICAgIHZhbF90eXBlOiAyLFxuICAgICAgb2JqOiBidXRfc2wucGFyZW50KCkucGFyZW50KCksXG4gICAgICBncjogJ2J1dHRvbicsXG4gICAgICBpbmRleDogZmFsc2UsXG4gICAgICBwYXJhbTogJ3BvcydcbiAgICB9KSk7XG5cbiAgICBidG5fY2guYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcbiAgICAgIHR5cGU6IDAsXG4gICAgICBvYmo6IGJ1dF9zbC5wYXJlbnQoKSxcbiAgICAgIGdyOiAnYnV0dG9uJyxcbiAgICAgIGluZGV4OiBmYWxzZVxuICAgIH0pKTtcbiAgICBlbC5hcHBlbmQoYnRuX2NoKTtcblxuICAgIHZhciBsYXllciA9ICQoJzxkaXYgY2xhc3M9XCJmaXhlZF9sYXllclwiLz4nKTtcbiAgICBsYXllci5hcHBlbmQoJzxoMj7QodGC0LDRgtC40YfQtdGB0LrQuNC1INGB0LvQvtC4PC9oMj4nKTtcbiAgICB2YXIgdGggPSBcIjx0aD7ihJY8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIgK1xuICAgICAgXCI8dGg+0KHQu9C+0Lkg0L3QsCDQstGB0Y4g0LLRi9GB0L7RgtGDPC90aD5cIiArXG4gICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC/0L7Rj9Cy0LvQtdC90LjRjzwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiICtcbiAgICAgIFwiPHRoPtCQ0L3QuNC80LDRhtC40Y8g0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC90aD5cIiArXG4gICAgICBcIjx0aD7Ql9Cw0LTQtdGA0LbQutCwINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XG4gICAgc3RUYWJsZSA9ICQoJzx0YWJsZSBib3JkZXI9XCIxXCI+PHRyPicgKyB0aCArICc8L3RyPjwvdGFibGU+Jyk7XG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbMF0uZml4ZWQ7XG4gICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYWRkVHJTdGF0aWMoZGF0YVtpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxheWVyLmFwcGVuZChzdFRhYmxlKTtcbiAgICB2YXIgYWRkQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xuICAgICAgdGV4dDogXCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcbiAgICB9KTtcbiAgICBhZGRCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGRhdGEgPSBhZGRUclN0YXRpYyhmYWxzZSk7XG4gICAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZGF0YS5lZGl0b3IuZmluZCgnLmZpbGVTZWxlY3QnKSk7XG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXG4gICAgfSkpO1xuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xuICAgIGVsLmFwcGVuZChsYXllcik7XG5cbiAgICB2YXIgbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxheF9sYXllclwiLz4nKTtcbiAgICBsYXllci5hcHBlbmQoJzxoMj7Qn9Cw0YDQsNC70LDQutGBINGB0LvQvtC4PC9oMj4nKTtcbiAgICB2YXIgdGggPSBcIjx0aD7ihJY8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIgK1xuICAgICAgXCI8dGg+0KPQtNCw0LvQtdC90L3QvtGB0YLRjCAo0YbQtdC70L7QtSDQv9C+0LvQvtC20LjRgtC10LvRjNC90L7QtSDRh9C40YHQu9C+KTwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XG5cbiAgICBwYXJhbGF4VGFibGUgPSAkKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nICsgdGggKyAnPC90cj48L3RhYmxlPicpO1xuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICB2YXIgZGF0YSA9IHNsaWRlcl9kYXRhWzBdLnBhcmFsYXg7XG4gICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYWRkVHJQYXJhbGF4KGRhdGFbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXllci5hcHBlbmQocGFyYWxheFRhYmxlKTtcbiAgICB2YXIgYWRkQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xuICAgICAgdGV4dDogXCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcbiAgICB9KTtcbiAgICBhZGRCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGRhdGEgPSBhZGRUclBhcmFsYXgoZmFsc2UpO1xuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxuICAgIH0pKTtcblxuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xuICAgIGVsLmFwcGVuZChsYXllcik7XG5cbiAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWwuZmluZCgnLmZpbGVTZWxlY3QnKSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRUclN0YXRpYyhkYXRhKSB7XG4gICAgdmFyIGkgPSBzdFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoIC0gMTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIGRhdGEgPSB7XG4gICAgICAgIFwiaW1nXCI6IFwiXCIsXG4gICAgICAgIFwiZnVsbF9oZWlnaHRcIjogMCxcbiAgICAgICAgXCJwb3NcIjogMCxcbiAgICAgICAgXCJzaG93X2RlbGF5XCI6IDEsXG4gICAgICAgIFwic2hvd19hbmltYXRpb25cIjogXCJsaWdodFNwZWVkSW5cIixcbiAgICAgICAgXCJoaWRlX2RlbGF5XCI6IDEsXG4gICAgICAgIFwiaGlkZV9hbmltYXRpb25cIjogXCJib3VuY2VPdXRcIlxuICAgICAgfTtcbiAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkLnB1c2goZGF0YSk7XG4gICAgICB2YXIgZml4ID0gJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCcpO1xuICAgICAgYWRkU3RhdGljTGF5ZXIoZGF0YSwgZml4LCB0cnVlKTtcbiAgICB9XG4gICAgO1xuXG4gICAgdmFyIHRyID0gJCgnPHRyLz4nKTtcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBkYXRhLmltZyxcbiAgICAgIGxhYmVsOiBmYWxzZSxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxuICAgICAgYmluZDoge1xuICAgICAgICBncjogJ2ZpeGVkJyxcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcbiAgICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5maW5kKCcuYW5pbWF0aW9uX2xheWVyJyksXG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmlucHV0LnZhbCgpICsgJyknKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uZml4ZWRbZGF0YS5pbmRleF0uaW1nID0gZGF0YS5pbnB1dC52YWwoKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHBvc0FycixcbiAgICAgIHZhbF9saXN0OiBwb3NfbGlzdCxcbiAgICAgIHZhbF90eXBlOiAyLFxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKSxcbiAgICAgIGdyOiAnZml4ZWQnLFxuICAgICAgaW5kZXg6IGksXG4gICAgICBwYXJhbTogJ3BvcycsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogeWVzX25vX3ZhbCxcbiAgICAgIHZhbF9saXN0OiB5ZXNfbm9fYXJyLFxuICAgICAgdmFsX3R5cGU6IDIsXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLFxuICAgICAgZ3I6ICdmaXhlZCcsXG4gICAgICBpbmRleDogaSxcbiAgICAgIHBhcmFtOiAnZnVsbF9oZWlnaHQnLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoe1xuICAgICAgdHlwZTogMSxcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxuICAgICAgZ3I6ICdmaXhlZCcsXG4gICAgICBpbmRleDogaSxcbiAgICAgIHBhcmVudDogJ3RkJ1xuICAgIH0pKTtcbiAgICB2YXIgZGVsQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xuICAgICAgdGV4dDogXCLQo9C00LDQu9C40YLRjFwiXG4gICAgfSk7XG4gICAgZGVsQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMuZWwpO1xuICAgICAgaSA9ICR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKSAtIDE7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcbiAgICAgICR0aGlzLmNsb3Nlc3QoJ3RyJykucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHRgtGA0L7QutGDINCyINGC0LDQsdC70LjRhtC1XG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLmZpeGVkLnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIGVsOiBkZWxCdG4sXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcbiAgICB9KSk7XG4gICAgdmFyIGRlbEJ0blRkID0gJCgnPHRkLz4nKS5hcHBlbmQoZGVsQnRuKTtcbiAgICB0ci5hcHBlbmQoZGVsQnRuVGQpO1xuICAgIHN0VGFibGUuYXBwZW5kKHRyKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVkaXRvcjogdHIsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYWRkVHJQYXJhbGF4KGRhdGEpIHtcbiAgICB2YXIgaSA9IHBhcmFsYXhUYWJsZS5maW5kKCd0cicpLmxlbmd0aCAtIDE7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICBkYXRhID0ge1xuICAgICAgICBcImltZ1wiOiBcIlwiLFxuICAgICAgICBcInpcIjogMVxuICAgICAgfTtcbiAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXgucHVzaChkYXRhKTtcbiAgICAgIHZhciBwYXJhbGF4X2dyID0gJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAnKTtcbiAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKTtcbiAgICB9XG4gICAgO1xuICAgIHZhciB0ciA9ICQoJzx0ci8+Jyk7XG4gICAgdHIuYXBwZW5kKCc8dGQgY2xhc3M9XCJ0ZF9jb3VudGVyXCIvPicpO1xuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogZGF0YS5pbWcsXG4gICAgICBsYWJlbDogZmFsc2UsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcbiAgICAgIGJpbmQ6IHtcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcbiAgICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxuICAgICAgfSxcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbnB1dC52YWwoKSArICcpJyk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0uaW1nID0gZGF0YS5pbnB1dC52YWwoKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHBvc0FycixcbiAgICAgIHZhbF9saXN0OiBwb3NfbGlzdCxcbiAgICAgIHZhbF90eXBlOiAyLFxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxuICAgICAgZ3I6ICdwYXJhbGF4JyxcbiAgICAgIGluZGV4OiBpLFxuICAgICAgcGFyYW06ICdwb3MnLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgICAgc3RhcnRfb3B0aW9uOiAnPG9wdGlvbiB2YWx1ZT1cIlwiIGNvZGU9XCJcIj7QvdCwINCy0LXRgdGMINGN0LrRgNCw0L08L29wdGlvbj4nXG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogZGF0YS56LFxuICAgICAgbGFiZWw6IGZhbHNlLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgICAgYmluZDoge1xuICAgICAgICBpbmRleDogaSxcbiAgICAgICAgcGFyYW06ICdpbWcnLFxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKSxcbiAgICAgIH0sXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgICAgIGRhdGEub2JqLmF0dHIoJ3onLCBkYXRhLmlucHV0LnZhbCgpKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS56ID0gZGF0YS5pbnB1dC52YWwoKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHZhciBkZWxCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XG4gICAgICB0ZXh0OiBcItCj0LTQsNC70LjRgtGMXCJcbiAgICB9KTtcbiAgICBkZWxCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcy5lbCk7XG4gICAgICBpID0gJHRoaXMuY2xvc2VzdCgndHInKS5pbmRleCgpIC0gMTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcbiAgICAgIHRoaXMuc2xpZGVyX2RhdGFbMF0ucGFyYWxheC5zcGxpY2UoaSwgMSk7IC8v0YPQtNCw0LvRj9C10Lwg0LjQtyDQutC+0L3RhNC40LPQsCDRgdC70LDQudC00LBcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBlbDogZGVsQnRuLFxuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXG4gICAgfSkpO1xuICAgIHZhciBkZWxCdG5UZCA9ICQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcbiAgICBwYXJhbGF4VGFibGUuYXBwZW5kKHRyKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVkaXRvcjogdHIsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYWRkX2FuaW1hdGlvbihlbCwgZGF0YSkge1xuICAgIHZhciBvdXQgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAnY2xhc3MnOiAnYW5pbWF0aW9uX2xheWVyJ1xuICAgIH0pO1xuXG4gICAgaWYgKHR5cGVvZihkYXRhLnNob3dfZGVsYXkpICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICBvdXQuYWRkQ2xhc3Moc2hvd19kZWxheVtkYXRhLnNob3dfZGVsYXldKTtcbiAgICAgIGlmIChkYXRhLnNob3dfYW5pbWF0aW9uKSB7XG4gICAgICAgIG91dC5hZGRDbGFzcygnc2xpZGVfJyArIGRhdGEuc2hvd19hbmltYXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YoZGF0YS5oaWRlX2RlbGF5KSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgb3V0LmFkZENsYXNzKGhpZGVfZGVsYXlbZGF0YS5oaWRlX2RlbGF5XSk7XG4gICAgICBpZiAoZGF0YS5oaWRlX2FuaW1hdGlvbikge1xuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycgKyBkYXRhLmhpZGVfYW5pbWF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlbC5hcHBlbmQob3V0KTtcbiAgICByZXR1cm4gZWw7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZV9zbGlkZShkYXRhKSB7XG4gICAgdmFyIHNsaWRlID0gJCgnPGRpdiBjbGFzcz1cInNsaWRlXCIvPicpO1xuXG4gICAgdmFyIG1vYl9iZyA9ICQoJzxhIGNsYXNzPVwibW9iX2JnXCIgaHJlZj1cIicgKyBkYXRhLmJ1dHRvbi5ocmVmICsgJ1wiLz4nKTtcbiAgICBtb2JfYmcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5tb2JpbGUgKyAnKScpXG5cbiAgICBzbGlkZS5hcHBlbmQobW9iX2JnKTtcbiAgICBpZiAobW9iaWxlX21vZGUpIHtcbiAgICAgIHJldHVybiBzbGlkZTtcbiAgICB9XG5cbiAgICAvL9C10YHQu9C4INC10YHRgtGMINGE0L7QvSDRgtC+INC30LDQv9C+0LvQvdGP0LXQvFxuICAgIGlmIChkYXRhLmZvbikge1xuICAgICAgc2xpZGUuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5mb24gKyAnKScpXG4gICAgfVxuXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxuICAgIGlmIChkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBwYXJhbGF4X2dyID0gJCgnPGRpdiBjbGFzcz1cInBhcmFsbGF4X19ncm91cFwiLz4nKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5wYXJhbGF4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLnBhcmFsYXhbaV0sIHBhcmFsYXhfZ3IpXG4gICAgICB9XG4gICAgICBzbGlkZS5hcHBlbmQocGFyYWxheF9ncilcbiAgICB9XG5cbiAgICB2YXIgZml4ID0gJCgnPGRpdiBjbGFzcz1cImZpeGVkX2dyb3VwXCIvPicpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xuICAgICAgYWRkU3RhdGljTGF5ZXIoZGF0YS5maXhlZFtpXSwgZml4KVxuICAgIH1cblxuICAgIHZhciBkb3BfYmxrID0gJChcIjxkaXYgY2xhc3M9J2ZpeGVkX19sYXllcicvPlwiKTtcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLmJ1dHRvbi5wb3NdKTtcbiAgICB2YXIgYnV0ID0gJChcIjxhIGNsYXNzPSdzbGlkZXJfX2hyZWYnLz5cIik7XG4gICAgYnV0LmF0dHIoJ2hyZWYnLCBkYXRhLmJ1dHRvbi5ocmVmKTtcbiAgICBidXQudGV4dChkYXRhLmJ1dHRvbi50ZXh0KTtcbiAgICBidXQuYWRkQ2xhc3MoZGF0YS5idXR0b24uY29sb3IpO1xuICAgIGRvcF9ibGsgPSBhZGRfYW5pbWF0aW9uKGRvcF9ibGssIGRhdGEuYnV0dG9uKTtcbiAgICBkb3BfYmxrLmZpbmQoJ2RpdicpLmFwcGVuZChidXQpO1xuICAgIGZpeC5hcHBlbmQoZG9wX2Jsayk7XG5cbiAgICBzbGlkZS5hcHBlbmQoZml4KTtcbiAgICByZXR1cm4gc2xpZGU7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRQYXJhbGF4TGF5ZXIoZGF0YSwgcGFyYWxheF9ncikge1xuICAgIHZhciBwYXJhbGxheF9sYXllciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fbGF5ZXJcIlxcPicpO1xuICAgIHBhcmFsbGF4X2xheWVyLmF0dHIoJ3onLCBkYXRhLnogfHwgaSAqIDEwKTtcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8c3BhbiBjbGFzcz0nc2xpZGVyX190ZXh0Jy8+XCIpO1xuICAgIGlmIChkYXRhLnBvcykge1xuICAgICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcbiAgICB9XG4gICAgZG9wX2Jsay5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XG4gICAgcGFyYWxsYXhfbGF5ZXIuYXBwZW5kKGRvcF9ibGspO1xuICAgIHBhcmFsYXhfZ3IuYXBwZW5kKHBhcmFsbGF4X2xheWVyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCwgYmVmb3JfYnV0dG9uKSB7XG4gICAgdmFyIGRvcF9ibGsgPSAkKFwiPGRpdiBjbGFzcz0nZml4ZWRfX2xheWVyJy8+XCIpO1xuICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XG4gICAgaWYgKGRhdGEuZnVsbF9oZWlnaHQpIHtcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MoJ2ZpeGVkX19mdWxsLWhlaWdodCcpO1xuICAgIH1cbiAgICBkb3BfYmxrID0gYWRkX2FuaW1hdGlvbihkb3BfYmxrLCBkYXRhKTtcbiAgICBkb3BfYmxrLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XG5cbiAgICBpZiAoYmVmb3JfYnV0dG9uKSB7XG4gICAgICBmaXguZmluZCgnLnNsaWRlcl9faHJlZicpLmNsb3Nlc3QoJy5maXhlZF9fbGF5ZXInKS5iZWZvcmUoZG9wX2JsaylcbiAgICB9IGVsc2Uge1xuICAgICAgZml4LmFwcGVuZChkb3BfYmxrKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5leHRfc2xpZGUoKSB7XG4gICAgaWYgKCQoJyNtZWdhX3NsaWRlcicpLmhhc0NsYXNzKCdzdG9wX3NsaWRlJykpcmV0dXJuO1xuXG4gICAgdmFyIHNsaWRlX3BvaW50cyA9ICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZV9zZWxlY3QnKVxuICAgIHZhciBzbGlkZV9jbnQgPSBzbGlkZV9wb2ludHMubGVuZ3RoO1xuICAgIHZhciBhY3RpdmUgPSAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVyLWFjdGl2ZScpLmluZGV4KCkgKyAxO1xuICAgIGlmIChhY3RpdmUgPj0gc2xpZGVfY250KWFjdGl2ZSA9IDA7XG4gICAgc2xpZGVfcG9pbnRzLmVxKGFjdGl2ZSkuY2xpY2soKTtcblxuICAgIHRpbWVvdXRJZD1zZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW1nX3RvX2xvYWQoc3JjKSB7XG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xuICAgIGltZy5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xuXG4gICAgICBpZiAodG90X2ltZ193YWl0ID09IDApIHtcblxuICAgICAgICBzbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dKSk7XG4gICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcShyZW5kZXJfc2xpZGVfbm9tKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblxuICAgICAgICBpZiAocmVuZGVyX3NsaWRlX25vbSA9PSAwKSB7XG4gICAgICAgICAgc2xpZGVzLmZpbmQoJy5zbGlkZScpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2ZpcnN0X3Nob3cnKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG5cbiAgICAgICAgICBpZiAoIWVkaXRvcikge1xuICAgICAgICAgICAgaWYodGltZW91dElkKWNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgdGltZW91dElkPXNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5maXJzdF9zaG93JykucmVtb3ZlQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcbiAgICAgICAgICAgIH0uYmluZChzbGlkZXMpLCBzY3JvbGxfcGVyaW9kKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9iaWxlX21vZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcbiAgICAgICAgICAgIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xuICAgICAgICAgICAgcGFyYWxsYXhfdGltZXIgPSBzZXRJbnRlcnZhbChyZW5kZXIsIDEwMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGVkaXRvcikge1xuICAgICAgICAgICAgaW5pdF9lZGl0b3IoKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZih0aW1lb3V0SWQpY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xuXG4gICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCcpLm9uKCdjbGljaycsICcuc2xpZGVfc2VsZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKSlyZXR1cm47XG5cbiAgICAgICAgICAgICAgdmFyIGluZGV4ID0gJHRoaXMuaW5kZXgoKTtcbiAgICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuXG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGUuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGUnKS5lcShpbmRleCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcblxuICAgICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5ob3ZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGlmKHRpbWVvdXRJZCljbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuYWRkQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykucmVtb3ZlQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlbmRlcl9zbGlkZV9ub20rKztcbiAgICAgICAgaWYgKHJlbmRlcl9zbGlkZV9ub20gPCBzbGlkZXJfZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICBsb2FkX3NsaWRlX2ltZygpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5vbignZXJyb3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0b3RfaW1nX3dhaXQtLTtcbiAgICB9KTtcbiAgICBpbWcucHJvcCgnc3JjJywgc3JjKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRfc2xpZGVfaW1nKCkge1xuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbcmVuZGVyX3NsaWRlX25vbV07XG4gICAgdG90X2ltZ193YWl0ID0gMTtcblxuICAgIGlmIChtb2JpbGVfbW9kZSA9PT0gZmFsc2UpIHtcbiAgICAgIHRvdF9pbWdfd2FpdCsrO1xuICAgICAgaW1nX3RvX2xvYWQoZGF0YS5mb24pO1xuICAgICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxuICAgICAgaWYgKGRhdGEucGFyYWxheCAmJiBkYXRhLnBhcmFsYXgubGVuZ3RoID4gMCkge1xuICAgICAgICB0b3RfaW1nX3dhaXQgKz0gZGF0YS5wYXJhbGF4Lmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnBhcmFsYXgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpbWdfdG9fbG9hZChkYXRhLnBhcmFsYXhbaV0uaW1nKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZGF0YS5maXhlZCAmJiBkYXRhLmZpeGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEuZml4ZWQubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuZml4ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpbWdfdG9fbG9hZChkYXRhLmZpeGVkW2ldLmltZylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGltZ190b19sb2FkKGRhdGEubW9iaWxlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0X2luaXRfc2xpZGUoZGF0YSkge1xuICAgIHZhciBuID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xuICAgIGltZy5hdHRyKCd0aW1lJywgbik7XG5cbiAgICBmdW5jdGlvbiBvbl9pbWdfbG9hZCgpIHtcbiAgICAgIHZhciBuID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBpbWcgPSAkKHRoaXMpO1xuICAgICAgbiA9IG4gLSBwYXJzZUludChpbWcuYXR0cigndGltZScpKTtcbiAgICAgIGlmIChuID4gbWF4X3RpbWVfbG9hZF9waWMpIHtcbiAgICAgICAgbW9iaWxlX21vZGUgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG1heF9zaXplID0gKHNjcmVlbi5oZWlnaHQgPiBzY3JlZW4ud2lkdGggPyBzY3JlZW4uaGVpZ2h0IDogc2NyZWVuLndpZHRoKTtcbiAgICAgICAgaWYgKG1heF9zaXplIDwgbW9iaWxlX3NpemUpIHtcbiAgICAgICAgICBtb2JpbGVfbW9kZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9iaWxlX21vZGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1vYmlsZV9tb2RlID09IHRydWUpIHtcbiAgICAgICAgJChjb250YWluZXJfaWQpLmFkZENsYXNzKCdtb2JpbGVfbW9kZScpXG4gICAgICB9XG4gICAgICByZW5kZXJfc2xpZGVfbm9tID0gMDtcbiAgICAgIGxvYWRfc2xpZGVfaW1nKCk7XG4gICAgICAkKCcuc2stZm9sZGluZy1jdWJlJykucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIGltZy5vbignbG9hZCcsIG9uX2ltZ19sb2FkKCkpO1xuICAgIGlmIChzbGlkZXJfZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnP3I9JyArIE1hdGgucmFuZG9tKCk7XG4gICAgICBpbWcucHJvcCgnc3JjJywgc2xpZGVyX2RhdGFbMF0ubW9iaWxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb25faW1nX2xvYWQoKS5iaW5kKGltZyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdChkYXRhLCBlZGl0b3JfaW5pdCkge1xuICAgIHNsaWRlcl9kYXRhID0gZGF0YTtcbiAgICBlZGl0b3IgPSBlZGl0b3JfaW5pdDtcbiAgICAvL9C90LDRhdC+0LTQuNC8INC60L7QvdGC0LXQudC90LXRgCDQuCDQvtGH0LjRidCw0LXQvCDQtdCz0L5cbiAgICB2YXIgY29udGFpbmVyID0gJChjb250YWluZXJfaWQpO1xuICAgIGNvbnRhaW5lci5odG1sKCcnKTtcblxuICAgIC8v0YHQvtC30LbQsNC10Lwg0LHQsNC30L7QstGL0LUg0LrQvtC90YLQtdC50L3QtdGA0Ysg0LTQu9GPINGB0LDQvNC40YUg0YHQu9Cw0LnQtNC+0LIg0Lgg0LTQu9GPINC/0LXRgNC10LrQu9GO0YfQsNGC0LXQu9C10LlcbiAgICBzbGlkZXMgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAnY2xhc3MnOiAnc2xpZGVzJ1xuICAgIH0pO1xuICAgIHZhciBzbGlkZV9jb250cm9sID0gJCgnPGRpdi8+Jywge1xuICAgICAgJ2NsYXNzJzogJ3NsaWRlX2NvbnRyb2wnXG4gICAgfSk7XG4gICAgc2xpZGVfc2VsZWN0X2JveCA9ICQoJzx1bC8+Jywge1xuICAgICAgJ2NsYXNzJzogJ3NsaWRlX3NlbGVjdF9ib3gnXG4gICAgfSk7XG5cbiAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQuNC90LTQuNC60LDRgtC+0YAg0LfQsNCz0YDRg9C30LrQuFxuICAgIHZhciBsID0gJzxkaXYgY2xhc3M9XCJzay1mb2xkaW5nLWN1YmVcIj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTEgc2stY3ViZVwiPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMiBzay1jdWJlXCI+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmU0IHNrLWN1YmVcIj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTMgc2stY3ViZVwiPjwvZGl2PicgK1xuICAgICAgJzwvZGl2Pic7XG4gICAgY29udGFpbmVyLmh0bWwobCk7XG5cblxuICAgIHN0YXJ0X2luaXRfc2xpZGUoZGF0YVswXSk7XG5cbiAgICAvL9Cz0LXQvdC10YDQuNGA0YPQtdC8INC60L3QvtC/0LrQuCDQuCDRgdC70LDQudC00YtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vc2xpZGVzLmFwcGVuZChnZW5lcmF0ZV9zbGlkZShkYXRhW2ldKSk7XG4gICAgICBzbGlkZV9zZWxlY3RfYm94LmFwcGVuZCgnPGxpIGNsYXNzPVwic2xpZGVfc2VsZWN0IGRpc2FibGVkXCIvPicpXG4gICAgfVxuXG4gICAgLypzbGlkZXMuZmluZCgnLnNsaWRlJykuZXEoMClcbiAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJylcbiAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93Jyk7XG4gICAgIHNsaWRlX2NvbnRyb2wuZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpOyovXG5cbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlcyk7XG4gICAgc2xpZGVfY29udHJvbC5hcHBlbmQoc2xpZGVfc2VsZWN0X2JveCk7XG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZV9jb250cm9sKTtcblxuXG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgaWYgKCFwYXJhbGxheF9ncm91cClyZXR1cm4gZmFsc2U7XG4gICAgdmFyIHBhcmFsbGF4X2sgPSAocGFyYWxsYXhfY291bnRlciAtIDEwKSAvIDI7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFsbGF4X2dyb3VwLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZWwgPSBwYXJhbGxheF9ncm91cC5lcShpKTtcbiAgICAgIHZhciBqID0gZWwuYXR0cigneicpO1xuICAgICAgdmFyIHRyID0gJ3JvdGF0ZTNkKDAuMSwwLjgsMCwnICsgKHBhcmFsbGF4X2spICsgJ2RlZykgc2NhbGUoJyArICgxICsgaiAqIDAuNSkgKyAnKSB0cmFuc2xhdGVaKC0nICsgKDEwICsgaiAqIDIwKSArICdweCknO1xuICAgICAgZWwuY3NzKCd0cmFuc2Zvcm0nLCB0cilcbiAgICB9XG4gICAgcGFyYWxsYXhfY291bnRlciArPSBwYXJhbGxheF9kICogMC4xO1xuICAgIGlmIChwYXJhbGxheF9jb3VudGVyID49IDIwKXBhcmFsbGF4X2QgPSAtcGFyYWxsYXhfZDtcbiAgICBpZiAocGFyYWxsYXhfY291bnRlciA8PSAwKXBhcmFsbGF4X2QgPSAtcGFyYWxsYXhfZDtcbiAgfVxuXG4gIGluaXRJbWFnZVNlcnZlclNlbGVjdCgkKCcuZmlsZVNlbGVjdCcpKTtcblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcbn0oKSk7XG4iLCJ2YXIgaGVhZGVyQWN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuICB2YXIgc2hhZG93ZWREb3duID0gZmFsc2U7XG5cbiAgJCgnLm1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgICQoJy5kcm9wLW1lbnUnKS5yZW1vdmVDbGFzcygnb3BlbicpLnJlbW92ZUNsYXNzKCdjbG9zZScpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICBpZiAoJCgnLmhlYWRlcicpLmhhc0NsYXNzKCdoZWFkZXJfb3Blbi1tZW51JykpIHtcbiAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJCgnLnNlYXJjaC10b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgJCgnLmhlYWRlcicpLnRvZ2dsZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcbiAgICAkKCcjYXV0b2NvbXBsZXRlJykuZmFkZU91dCgpO1xuICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpKSB7XG4gICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoJyNoZWFkZXInKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlLnRhcmdldC5pZCA9PSAnaGVhZGVyJykge1xuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJ2Zvcm0nKS5zdWJtaXQoKTtcbiAgfSk7XG5cbiAgJCgnLmhlYWRlci1zZWNvbmRsaW5lX2Nsb3NlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICB9KTtcblxuICAkKCcuaGVhZGVyLXVwbGluZScpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmICghc2Nyb2xsZWREb3duKXJldHVybjtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCAxMDI0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oJ2xvYWQgcmVzaXplIHNjcm9sbCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2hhZG93SGVpZ2h0ID0gNTA7XG4gICAgdmFyIGhpZGVIZWlnaHQgPSAyMDA7XG4gICAgdmFyIGhlYWRlclNlY29uZExpbmUgPSAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKTtcbiAgICB2YXIgaG92ZXJzID0gaGVhZGVyU2Vjb25kTGluZS5maW5kKCc6aG92ZXInKTtcbiAgICB2YXIgaGVhZGVyID0gJCgnLmhlYWRlcicpO1xuXG4gICAgaWYgKCFob3ZlcnMubGVuZ3RoKSB7XG4gICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgICBoZWFkZXIucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcbiAgICAgIC8vZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuICAgICAgdmFyIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgIGlmIChzY3JvbGxUb3AgPiBzaGFkb3dIZWlnaHQgJiYgc2hhZG93ZWREb3duID09PSBmYWxzZSkge1xuICAgICAgICBzaGFkb3dlZERvd24gPSB0cnVlO1xuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzaGFkb3dlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKHNjcm9sbFRvcCA8PSBzaGFkb3dIZWlnaHQgJiYgc2hhZG93ZWREb3duID09PSB0cnVlKSB7XG4gICAgICAgIHNoYWRvd2VkRG93biA9IGZhbHNlO1xuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzaGFkb3dlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKHNjcm9sbFRvcCA+IGhpZGVIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSBmYWxzZSkge1xuICAgICAgICBzY3JvbGxlZERvd24gPSB0cnVlO1xuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzY3JvbGwtZG93bicpO1xuICAgICAgfVxuICAgICAgaWYgKHNjcm9sbFRvcCA8PSBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xuICAgICAgaGVhZGVyLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgfVxuICB9KTtcblxuICAkKCcubWVudV9hbmdsZS1kb3duLCAuZHJvcC1tZW51X2dyb3VwX191cC1oZWFkZXInKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIHZhciBtZW51T3BlbiA9ICQodGhpcykuY2xvc2VzdCgnLmhlYWRlcl9vcGVuLW1lbnUsIC5jYXRhbG9nLWNhdGVnb3JpZXMnKTtcbiAgICBpZiAoIW1lbnVPcGVuLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgcGFyZW50ID0gJCh0aGlzKS5jbG9zZXN0KCcuZHJvcC1tZW51X2dyb3VwX191cCwgLm1lbnUtZ3JvdXAnKTtcbiAgICB2YXIgcGFyZW50TWVudSA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudScpO1xuICAgIGlmIChwYXJlbnRNZW51KSB7XG4gICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICB9XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAkKHBhcmVudCkudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgICAgIGlmIChwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgICAkKHBhcmVudCkucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLmFkZENsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gIHZhciBhY2NvdW50TWVudVRpbWVPdXQgPSBudWxsO1xuICB2YXIgYWNjb3VudE1lbnVPcGVuVGltZSA9IDA7XG4gIHZhciBhY2NvdW50TWVudSA9ICQoJy5hY2NvdW50LW1lbnUnKTtcblxuICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IDEwMjQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xuICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcblxuICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcblxuICAgIGlmIChhY2NvdW50TWVudS5oYXNDbGFzcygnaGlkZGVuJykpIHtcbiAgICAgIG1lbnVBY2NvdW50VXAodGhhdCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhhdC5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgYWNjb3VudE1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgIH1cblxuICB9KTtcblxuICAvL9C/0L7QutCw0Lcg0LzQtdC90Y4g0LDQutC60LDRg9C90YJcbiAgZnVuY3Rpb24gbWVudUFjY291bnRVcCh0b2dnbGVCdXR0b24pIHtcbiAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XG4gICAgdG9nZ2xlQnV0dG9uLmFkZENsYXNzKCdvcGVuJyk7XG4gICAgYWNjb3VudE1lbnUucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSAxMDI0KSB7XG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XG4gICAgfVxuXG4gICAgYWNjb3VudE1lbnVPcGVuVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgYWNjb3VudE1lbnVUaW1lT3V0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gMTAyNCkge1xuICAgICAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XG4gICAgICB9XG4gICAgICBpZiAoKG5ldyBEYXRlKCkgLSBhY2NvdW50TWVudU9wZW5UaW1lKSA+IDEwMDAgKiA3KSB7XG4gICAgICAgIGFjY291bnRNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgdG9nZ2xlQnV0dG9uLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcbiAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgICAgfVxuXG4gICAgfSwgMTAwMCk7XG4gIH1cblxuICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzLWFjY291bnRfbWVudS1oZWFkZXInKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKCkge1xuICAgIGFjY291bnRNZW51T3BlblRpbWUgPSBuZXcgRGF0ZSgpO1xuICB9KTtcbiAgJCgnLmFjY291bnQtbWVudScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCdhY2NvdW50LW1lbnUnKSkge1xuICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgIH1cbiAgfSk7XG59KCk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gcGFyc2VOdW0oc3RyKSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoXG4gICAgICBTdHJpbmcoc3RyKVxuICAgICAgICAucmVwbGFjZSgnLCcsICcuJylcbiAgICAgICAgLm1hdGNoKC8tP1xcZCsoPzpcXC5cXGQrKT8vZywgJycpIHx8IDBcbiAgICAgICwgMTBcbiAgICApO1xuICB9XG5cbiAgJCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKS5maW5kKCdzZWxlY3QsaW5wdXQnKS5vbignY2hhbmdlIGtleXVwIGNsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGhpcyA9ICQodGhpcykuY2xvc2VzdCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKTtcbiAgICB2YXIgY3VycyA9IHBhcnNlTnVtKCR0aGlzLmZpbmQoJ3NlbGVjdCcpLnZhbCgpKTtcbiAgICB2YXIgdmFsID0gJHRoaXMuZmluZCgnaW5wdXQnKS52YWwoKTtcbiAgICBpZiAocGFyc2VOdW0odmFsKSAhPSB2YWwpIHtcbiAgICAgIHZhbCA9ICR0aGlzLmZpbmQoJ2lucHV0JykudmFsKHBhcnNlTnVtKHZhbCkpO1xuICAgIH1cbiAgICB2YWwgPSBwYXJzZU51bSh2YWwpO1xuXG4gICAgdmFyIGtvZWYgPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2snKS50cmltKCk7XG4gICAgdmFyIHByb21vID0gJHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLXByb21vJykudHJpbSgpO1xuICAgIHZhciBjdXJyZW5jeSA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1jdXJyZW5jeScpLnRyaW0oKTtcbiAgICB2YXIgcmVzdWx0ID0gMDtcbiAgICB2YXIgb3V0ID0gMDtcblxuICAgIGlmIChrb2VmID09IHByb21vKSB7XG4gICAgICBwcm9tbyA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGtvZWYuaW5kZXhPZignJScpID4gMCkge1xuICAgICAgcmVzdWx0ID0gcGFyc2VOdW0oa29lZikgKiB2YWwgKiBjdXJzIC8gMTAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJzID0gcGFyc2VOdW0oJHRoaXMuZmluZCgnW2NvZGU9JyArIGN1cnJlbmN5ICsgJ10nKS52YWwoKSk7XG4gICAgICByZXN1bHQgPSBwYXJzZU51bShrb2VmKSAqIGN1cnNcbiAgICB9XG5cbiAgICBpZiAocGFyc2VOdW0ocHJvbW8pID4gMCkge1xuICAgICAgaWYgKHByb21vLmluZGV4T2YoJyUnKSA+IDApIHtcbiAgICAgICAgcHJvbW8gPSBwYXJzZU51bShwcm9tbykgKiB2YWwgKiBjdXJzIC8gMTAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbW8gPSBwYXJzZU51bShwcm9tbykgKiBjdXJzXG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9tbyA+IDApIHtcbiAgICAgICAgb3V0ID0gXCI8c3BhbiBjbGFzcz1vbGRfcHJpY2U+XCIgKyByZXN1bHQudG9GaXhlZCgyKSArIFwiPC9zcGFuPiBcIiArIHByb21vLnRvRml4ZWQoMik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXQgPSByZXN1bHQudG9GaXhlZCgyKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gcmVzdWx0LnRvRml4ZWQoMik7XG4gICAgfVxuXG5cbiAgICAkdGhpcy5maW5kKCcuY2FsYy1yZXN1bHRfdmFsdWUnKS5odG1sKG91dClcbiAgfSkuY2xpY2soKVxufSk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICB2YXIgZWxzID0gJCgnLmF1dG9faGlkZV9jb250cm9sJyk7XG4gIGlmIChlbHMubGVuZ3RoID09IDApcmV0dXJuO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiLnNjcm9sbF9ib3gtc2hvd19tb3JlXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgYnV0dG9uWWVzOiBmYWxzZSxcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfd2hpdGUgbm90aWZ5X25vdF9iaWdcIlxuICAgIH07XG5cbiAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgdmFyIGNvbnRlbnQgPSAkdGhpcy5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtJykuY2xvbmUoKTtcbiAgICBjb250ZW50ID0gY29udGVudFswXTtcbiAgICBjb250ZW50LmNsYXNzTmFtZSArPSAnIHNjcm9sbF9ib3gtaXRlbS1tb2RhbCc7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5jbGFzc05hbWUgPSAnY29tbWVudHMnO1xuICAgIGRpdi5hcHBlbmQoY29udGVudCk7XG4gICAgJChkaXYpLmZpbmQoJy5zY3JvbGxfYm94LXNob3dfbW9yZScpLnJlbW92ZSgpO1xuICAgICQoZGl2KS5maW5kKCcubWF4X3RleHRfaGlkZScpXG4gICAgICAucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUteDInKVxuICAgICAgLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlJyk7XG4gICAgZGF0YS5xdWVzdGlvbiA9IGRpdi5vdXRlckhUTUw7XG5cbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhc1Njcm9sbChlbCkge1xuICAgIGlmICghZWwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGVsLnNjcm9sbEhlaWdodCA+IGVsLmNsaWVudEhlaWdodDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYnVpbGQoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbCA9IGVscy5lcShpKTtcbiAgICAgIHZhciBpc19oaWRlID0gZmFsc2U7XG4gICAgICBpZiAoZWwuaGVpZ2h0KCkgPCAxMCkge1xuICAgICAgICBpc19oaWRlID0gdHJ1ZTtcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuc2hvdygwKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRleHQgPSBlbC5maW5kKCcuc2Nyb2xsX2JveC10ZXh0Jyk7XG4gICAgICB2YXIgYW5zd2VyID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtYW5zd2VyJyk7XG4gICAgICB2YXIgc2hvd19tb3JlID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtc2hvd19tb3JlJyk7XG5cbiAgICAgIHZhciBzaG93X2J0biA9IGZhbHNlO1xuICAgICAgaWYgKGhhc1Njcm9sbCh0ZXh0WzBdKSkge1xuICAgICAgICBzaG93X2J0biA9IHRydWU7XG4gICAgICAgIHRleHQucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dC5hZGRDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChhbnN3ZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAvL9C10YHRgtGMINC+0YLQstC10YIg0LDQtNC80LjQvdCwXG4gICAgICAgIGlmIChoYXNTY3JvbGwoYW5zd2VyWzBdKSkge1xuICAgICAgICAgIHNob3dfYnRuID0gdHJ1ZTtcbiAgICAgICAgICBhbnN3ZXIucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFuc3dlci5hZGRDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNob3dfYnRuKSB7XG4gICAgICAgIHNob3dfbW9yZS5zaG93KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaG93X21vcmUuaGlkZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNfaGlkZSkge1xuICAgICAgICBlbC5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtLWhpZGUnKS5oaWRlKDApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gICQod2luZG93KS5yZXNpemUocmVidWlsZCk7XG4gIHJlYnVpbGQoKTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5zaG93X2FsbCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBjbHMgPSAkKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XG4gICAgJCgnLmhpZGVfYWxsW2RhdGEtY250cmwtY2xhc3NdJykuc2hvdygpO1xuICAgICQodGhpcykuaGlkZSgpO1xuICAgICQoJy4nICsgY2xzKS5zaG93KCk7XG4gIH0pO1xuXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmhpZGVfYWxsJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGNscyA9ICQodGhpcykuZGF0YSgnY250cmwtY2xhc3MnKTtcbiAgICAkKCcuc2hvd19hbGxbZGF0YS1jbnRybC1jbGFzc10nKS5zaG93KCk7XG4gICAgJCh0aGlzKS5oaWRlKCk7XG4gICAgJCgnLicgKyBjbHMpLmhpZGUoKTtcbiAgfSk7XG59KSgpO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBkZWNsT2ZOdW0obnVtYmVyLCB0aXRsZXMpIHtcbiAgICBjYXNlcyA9IFsyLCAwLCAxLCAxLCAxLCAyXTtcbiAgICByZXR1cm4gdGl0bGVzWyhudW1iZXIgJSAxMDAgPiA0ICYmIG51bWJlciAlIDEwMCA8IDIwKSA/IDIgOiBjYXNlc1sobnVtYmVyICUgMTAgPCA1KSA/IG51bWJlciAlIDEwIDogNV1dO1xuICB9XG5cbiAgZnVuY3Rpb24gZmlyc3RaZXJvKHYpIHtcbiAgICB2ID0gTWF0aC5mbG9vcih2KTtcbiAgICBpZiAodiA8IDEwKVxuICAgICAgcmV0dXJuICcwJyArIHY7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHY7XG4gIH1cblxuICB2YXIgY2xvY2tzID0gJCgnLmNsb2NrJyk7XG4gIGlmIChjbG9ja3MubGVuZ3RoID4gMCkge1xuICAgIGZ1bmN0aW9uIHVwZGF0ZUNsb2NrKCkge1xuICAgICAgdmFyIGNsb2NrcyA9ICQodGhpcyk7XG4gICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjID0gY2xvY2tzLmVxKGkpO1xuICAgICAgICB2YXIgZW5kID0gbmV3IERhdGUoYy5kYXRhKCdlbmQnKS5yZXBsYWNlKC8tL2csIFwiL1wiKSk7XG4gICAgICAgIHZhciBkID0gKGVuZC5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XG5cbiAgICAgICAgLy/QtdGB0LvQuCDRgdGA0L7QuiDQv9GA0L7RiNC10LtcbiAgICAgICAgaWYgKGQgPD0gMCkge1xuICAgICAgICAgIGMudGV4dChsZyhcInByb21vY29kZV9leHBpcmVzXCIpKTtcbiAgICAgICAgICBjLmFkZENsYXNzKCdjbG9jay1leHBpcmVkJyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL9C10YHQu9C4INGB0YDQvtC6INCx0L7Qu9C10LUgMzAg0LTQvdC10LlcbiAgICAgICAgaWYgKGQgPiAzMCAqIDYwICogNjAgKiAyNCkge1xuICAgICAgICAgIGMuaHRtbChsZyggXCJwcm9tb2NvZGVfbGVmdF8zMF9kYXlzXCIpKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzID0gZCAlIDYwO1xuICAgICAgICBkID0gKGQgLSBzKSAvIDYwO1xuICAgICAgICB2YXIgbSA9IGQgJSA2MDtcbiAgICAgICAgZCA9IChkIC0gbSkgLyA2MDtcbiAgICAgICAgdmFyIGggPSBkICUgMjQ7XG4gICAgICAgIGQgPSAoZCAtIGgpIC8gMjQ7XG5cbiAgICAgICAgdmFyIHN0ciA9IGZpcnN0WmVybyhoKSArIFwiOlwiICsgZmlyc3RaZXJvKG0pICsgXCI6XCIgKyBmaXJzdFplcm8ocyk7XG4gICAgICAgIGlmIChkID4gMCkge1xuICAgICAgICAgIHN0ciA9IGQgKyBcIiBcIiArIGRlY2xPZk51bShkLCBbbGcoXCJkYXlfY2FzZV8wXCIpLCBsZyhcImRheV9jYXNlXzFcIiksIGxnKFwiZGF5X2Nhc2VfMlwiKV0pICsgXCIgIFwiICsgc3RyO1xuICAgICAgICB9XG4gICAgICAgIGMuaHRtbChcItCe0YHRgtCw0LvQvtGB0Yw6IDxzcGFuPlwiICsgc3RyICsgXCI8L3NwYW4+XCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNldEludGVydmFsKHVwZGF0ZUNsb2NrLmJpbmQoY2xvY2tzKSwgMTAwMCk7XG4gICAgdXBkYXRlQ2xvY2suYmluZChjbG9ja3MpKCk7XG4gIH1cbn0pO1xuIiwidmFyIGNhdGFsb2dUeXBlU3dpdGNoZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjYXRhbG9nID0gJCgnLmNhdGFsb2dfbGlzdCcpO1xuICBpZiAoY2F0YWxvZy5sZW5ndGggPT0gMClyZXR1cm47XG5cbiAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLmZpbmQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbicpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XG4gICAgJCh0aGlzKS5hZGRDbGFzcygnY2hlY2tlZCcpO1xuICAgIGlmIChjYXRhbG9nKSB7XG4gICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykpIHtcbiAgICAgICAgY2F0YWxvZy5yZW1vdmVDbGFzcygnbmFycm93Jyk7XG4gICAgICAgIHNldENvb2tpZSgnY291cG9uc192aWV3JywgJycpXG4gICAgICB9XG4gICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1uYXJyb3cnKSkge1xuICAgICAgICBjYXRhbG9nLmFkZENsYXNzKCduYXJyb3cnKTtcbiAgICAgICAgc2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnLCAnbmFycm93Jyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAoZ2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnKSA9PSAnbmFycm93JyAmJiAhY2F0YWxvZy5oYXNDbGFzcygnbmFycm93X29mZicpKSB7XG4gICAgY2F0YWxvZy5hZGRDbGFzcygnbmFycm93Jyk7XG4gICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbmFycm93JykuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcbiAgICAkKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykucmVtb3ZlQ2xhc3MoJ2NoZWNrZWQnKTtcbiAgfVxufSgpO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gICQoJy5zZC1zZWxlY3Qtc2VsZWN0ZWQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBhcmVudCA9ICQodGhpcykucGFyZW50KCk7XG4gICAgdmFyIGRyb3BCbG9jayA9ICQocGFyZW50KS5maW5kKCcuc2Qtc2VsZWN0LWRyb3AnKTtcblxuICAgIGlmIChkcm9wQmxvY2suaXMoJzpoaWRkZW4nKSkge1xuICAgICAgZHJvcEJsb2NrLnNsaWRlRG93bigpO1xuXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuICAgICAgaWYgKCFwYXJlbnQuaGFzQ2xhc3MoJ2xpbmtlZCcpKSB7XG5cbiAgICAgICAgJCgnLnNkLXNlbGVjdC1kcm9wJykuZmluZCgnYScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdmFyIHNlbGVjdFJlc3VsdCA9ICQodGhpcykuaHRtbCgpO1xuXG4gICAgICAgICAgJChwYXJlbnQpLmZpbmQoJ2lucHV0JykudmFsKHNlbGVjdFJlc3VsdCk7XG5cbiAgICAgICAgICAkKHBhcmVudCkuZmluZCgnLnNkLXNlbGVjdC1zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5odG1sKHNlbGVjdFJlc3VsdCk7XG5cbiAgICAgICAgICBkcm9wQmxvY2suc2xpZGVVcCgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbn0pO1xuIiwic2VhcmNoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3BlbkF1dG9jb21wbGV0ZTtcblxuICAkKCcuc2VhcmNoLWZvcm0taW5wdXQnKS5vbignaW5wdXQnLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgdmFyIHF1ZXJ5ID0gJHRoaXMudmFsKCk7XG4gICAgdmFyIGRhdGEgPSAkdGhpcy5jbG9zZXN0KCdmb3JtJykuc2VyaWFsaXplKCk7XG4gICAgdmFyIGF1dG9jb21wbGV0ZSA9ICR0aGlzLmNsb3Nlc3QoJy5zdG9yZXNfc2VhcmNoJykuZmluZCgnLmF1dG9jb21wbGV0ZS13cmFwJyk7Ly8gJCgnI2F1dG9jb21wbGV0ZScpLFxuICAgIHZhciBhdXRvY29tcGxldGVMaXN0ID0gJChhdXRvY29tcGxldGUpLmZpbmQoJ3VsJyk7XG4gICAgb3BlbkF1dG9jb21wbGV0ZSA9IGF1dG9jb21wbGV0ZTtcbiAgICBpZiAocXVlcnkubGVuZ3RoID4gMSkge1xuICAgICAgdXJsID0gJHRoaXMuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicpIHx8ICcvc2VhcmNoJztcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICB0eXBlOiAnZ2V0JyxcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGRhdGEuc3VnZ2VzdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIGlmKGxhbmdbXCJocmVmX3ByZWZpeFwiXS5sZW5ndGg+MCAmJiBpdGVtLmRhdGEucm91dGUuaW5kZXhPZihsYW5nW1wiaHJlZl9wcmVmaXhcIl0pPT0tMSl7XG4gICAgICAgICAgICAgICAgICBpdGVtLmRhdGEucm91dGU9Jy8nK2xhbmdbXCJocmVmX3ByZWZpeFwiXStpdGVtLmRhdGEucm91dGU7XG4gICAgICAgICAgICAgICAgICBpdGVtLmRhdGEucm91dGU9aXRlbS5kYXRhLnJvdXRlLnJlcGxhY2UoJy8vJywnLycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9ICc8YSBjbGFzcz1cImF1dG9jb21wbGV0ZV9saW5rXCIgaHJlZj1cIicgKyBpdGVtLmRhdGEucm91dGUgKyAnXCInICsgJz4nICsgaXRlbS52YWx1ZSArIGl0ZW0uY2FzaGJhY2sgKyAnPC9hPic7XG4gICAgICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgICAgICBsaS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmFwcGVuZChsaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XG4gICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuaHRtbCgnJyk7XG4gICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSkub24oJ2ZvY3Vzb3V0JywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoISQoZS5yZWxhdGVkVGFyZ2V0KS5oYXNDbGFzcygnYXV0b2NvbXBsZXRlX2xpbmsnKSkge1xuICAgICAgLy8kKCcjYXV0b2NvbXBsZXRlJykuaGlkZSgpO1xuICAgICAgJChvcGVuQXV0b2NvbXBsZXRlKS5kZWxheSgxMDApLnNsaWRlVXAoMTAwKVxuICAgIH1cbiAgfSk7XG5cbiAgJCgnYm9keScpLm9uKCdzdWJtaXQnLCAnLnN0b3Jlcy1zZWFyY2hfZm9ybScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIHZhbCA9ICQodGhpcykuZmluZCgnLnNlYXJjaC1mb3JtLWlucHV0JykudmFsKCk7XG4gICAgaWYgKHZhbC5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9KVxufSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAkKCcuY291cG9ucy1saXN0X2l0ZW0tY29udGVudC1nb3RvLXByb21vY29kZS1saW5rJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgdGhhdCA9ICQodGhpcyk7XG4gICAgdmFyIGV4cGlyZWQgPSB0aGF0LmNsb3Nlc3QoJy5jb3Vwb25zLWxpc3RfaXRlbScpLmZpbmQoJy5jbG9jay1leHBpcmVkJyk7XG4gICAgdmFyIHVzZXJJZCA9ICQodGhhdCkuZGF0YSgndXNlcicpO1xuICAgIHZhciBpbmFjdGl2ZSA9ICQodGhhdCkuZGF0YSgnaW5hY3RpdmUnKTtcbiAgICB2YXIgZGF0YV9tZXNzYWdlID0gJCh0aGF0KS5kYXRhKCdtZXNzYWdlJyk7XG5cbiAgICBpZiAoaW5hY3RpdmUpIHtcbiAgICAgIHZhciB0aXRsZSA9IGRhdGFfbWVzc2FnZSA/IGRhdGFfbWVzc2FnZSA6IGxnKFwicHJvbW9jb2RlX2lzX2luYWN0aXZlXCIpO1xuICAgICAgdmFyIG1lc3NhZ2UgPSBsZyhcInByb21vY29kZV92aWV3X2FsbFwiLHtcInVybFwiOlwiL1wiK2xhbmdbXCJocmVmX3ByZWZpeFwiXStcImNvdXBvbnNcIn0pO1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcbiAgICAgICAgJ3RpdGxlJzogdGl0bGUsXG4gICAgICAgICdxdWVzdGlvbic6IG1lc3NhZ2UsXG4gICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxuICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcbiAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChleHBpcmVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciB0aXRsZSA9IGxnKFwicHJvbW9jb2RlX2lzX2V4cGlyZXNcIik7XG4gICAgICB2YXIgbWVzc2FnZSA9IGxnKFwicHJvbW9jb2RlX3ZpZXdfYWxsXCIse1widXJsXCI6XCIvXCIrbGFuZ1tcImhyZWZfcHJlZml4XCJdK1wiY291cG9uc1wifSk7XG4gICAgICBub3RpZmljYXRpb24uYWxlcnQoe1xuICAgICAgICAndGl0bGUnOiB0aXRsZSxcbiAgICAgICAgJ3F1ZXN0aW9uJzogbWVzc2FnZSxcbiAgICAgICAgJ2J1dHRvblllcyc6ICdPaycsXG4gICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxuICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKCF1c2VySWQpIHtcbiAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAnYnV0dG9uWWVzJzogZmFsc2UsXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiBcIm5vdGlmeV9ib3gtYWxlcnRcIixcbiAgICAgICAgJ3RpdGxlJzogbGcoXCJ1c2VfcHJvbW9jb2RlXCIpLFxuICAgICAgICAncXVlc3Rpb24nOiAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtY291cG9uLW5vcmVnaXN0ZXJcIj4nICtcbiAgICAgICAgJzxpbWcgc3JjPVwiL2ltYWdlcy90ZW1wbGF0ZXMvc3dhLnBuZ1wiIGFsdD1cIlwiPicgK1xuICAgICAgICAnPHA+PGI+JytsZyhcInByb21vY29kZV91c2Vfd2l0aG91dF9jYXNoYmFja19vcl9yZWdpc3RlclwiKSsnPC9iPjwvcD4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtYnV0dG9uc1wiPicgK1xuICAgICAgICAnPGEgaHJlZj1cIicgKyB0aGF0LmF0dHIoJ2hyZWYnKSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImJ0biBub3RpZmljYXRpb24tY2xvc2VcIj4nK2xnKFwidXNlX3Byb21vY29kZVwiKSsnPC9hPicgK1xuICAgICAgICAnPGEgaHJlZj1cIiMnK2xhbmdbXCJocmVmX3ByZWZpeFwiXSsncmVnaXN0cmF0aW9uXCIgY2xhc3M9XCJidG4gYnRuLXRyYW5zZm9ybSBtb2RhbHNfb3BlblwiPicrbGcoXCJyZWdpc3RlclwiKSsnPC9hPicgK1xuICAgICAgICAnPC9kaXY+J1xuICAgICAgfTtcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pO1xuXG4gICQoJyNzaG9wX2hlYWRlci1nb3RvLWNoZWNrYm94JykuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgaWYgKCEkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpKSB7XG4gICAgICAgICBub3RpZmljYXRpb24uYWxlcnQoe1xuICAgICAgICAgICAgICd0aXRsZSc6IGxnKFwiYXR0ZW50aW9uc1wiKSxcbiAgICAgICAgICAgICAncXVlc3Rpb24nOiBsZyhcInByb21vY29kZV9yZWNvbW1lbmRhdGlvbnNcIiksXG4gICAgICAgICAgICAgJ2J1dHRvblllcyc6IGxnKFwiY2xvc2VcIiksXG4gICAgICAgICAgICAgJ2J1dHRvbk5vJzogZmFsc2UsXG4gICAgICAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xuICAgICAgICAgfSk7XG4gICAgIH1cbiAgfSk7XG5cbiAgJCgnLmNhdGFsb2dfcHJvZHVjdF9saW5rJykuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XG4gICAgICAgICdidXR0b25ZZXMnOiBmYWxzZSxcbiAgICAgICAgICAgICdub3R5ZnlfY2xhc3MnOiBcIm5vdGlmeV9ib3gtYWxlcnRcIixcbiAgICAgICAgICAgICd0aXRsZSc6IGxnKFwicHJvZHVjdF91c2VcIiksXG4gICAgICAgICAgICAncXVlc3Rpb24nOiAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtY291cG9uLW5vcmVnaXN0ZXJcIj4nICtcbiAgICAgICAgJzxpbWcgc3JjPVwiL2ltYWdlcy90ZW1wbGF0ZXMvc3dhLnBuZ1wiIGFsdD1cIlwiPicgK1xuICAgICAgICAnPHA+PGI+JytsZyhcInByb2R1Y3RfdXNlX3dpdGhvdXRfY2FzaGJhY2tfb3JfcmVnaXN0ZXJcIikrJzwvYj48L3A+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWJ1dHRvbnNcIj4nICtcbiAgICAgICAgJzxhIGhyZWY9XCInICsgdGhhdC5hdHRyKCdocmVmJykgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJidG4gbm90aWZpY2F0aW9uLWNsb3NlXCI+JytsZyhcInByb2R1Y3RfdXNlXCIpKyc8L2E+JyArXG4gICAgICAgICc8YSBocmVmPVwiI3JlZ2lzdHJhdGlvblwiIGNsYXNzPVwiYnRuIGJ0bi10cmFuc2Zvcm0gbW9kYWxzX29wZW5cIj4nK2xnKFwicmVnaXN0ZXJcIikrJzwvYT4nICtcbiAgICAgICAgJzwvZGl2Pid9XG4gICAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnLmFjY291bnQtd2l0aGRyYXctbWV0aG9kc19pdGVtLW9wdGlvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBvcHRpb24gPSAkKHRoaXMpLmRhdGEoJ29wdGlvbi1wcm9jZXNzJyksXG4gICAgICBwbGFjZWhvbGRlciA9ICcnO1xuICAgIHN3aXRjaCAob3B0aW9uKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19jYXNoX251bWJlclwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X3JfbnVtYmVyXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAzOlxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfcGhvbmVfbnVtYmVyXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA0OlxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfY2FydF9udW1iZXJcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDU6XG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19lbWFpbFwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgNjpcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X3Bob25lX251bWJlclwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgNzpcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X3NrcmlsbFwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAkKFwiI3VzZXJzd2l0aGRyYXctYmlsbFwiKS5wcmV2KFwiLnBsYWNlaG9sZGVyXCIpLmh0bWwocGxhY2Vob2xkZXIpO1xuICAgICQoJyN1c2Vyc3dpdGhkcmF3LXByb2Nlc3NfaWQnKS52YWwob3B0aW9uKTtcbiAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgYWpheEZvcm0oJCgnLmFqYXhfZm9ybScpKTtcblxuICAkKCcuZm9ybS10ZXN0LWxpbmsnKS5vbignc3VibWl0JyxmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGZvcm0gPSAkKCcuZm9ybS10ZXN0LWxpbmsnKTtcbiAgICBpZihmb3JtLmhhc0NsYXNzKCdsb2FkaW5nJykpcmV0dXJuO1xuICAgIGZvcm0uZmluZCgnLmhlbHAtYmxvY2snKS5odG1sKFwiXCIpO1xuXG4gICAgdmFyIHVybCA9IGZvcm0uZmluZCgnW25hbWU9dXJsXScpLnZhbCgpO1xuICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXG4gICAgaWYodXJsLmxlbmd0aDwzKXtcbiAgICAgIGZvcm0uZmluZCgnLmhlbHAtYmxvY2snKS5odG1sKGxnKCdyZXF1aXJlZCcpKTtcbiAgICAgIGZvcm0uYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1lbHNle1xuXG4gICAgfVxuXG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xuICAgIGZvcm0uZmluZCgnaW5wdXQnKS5hdHRyKCdkaXNhYmxlZCcsdHJ1ZSk7XG4gICAgJC5wb3N0KGZvcm0uYXR0cignYWN0aW9uJykse3VybDp1cmx9LGZ1bmN0aW9uKGQpe1xuICAgICAgZm9ybS5maW5kKCdpbnB1dCcpLmF0dHIoJ2Rpc2FibGVkJyxmYWxzZSk7XG4gICAgICBmb3JtLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICBmb3JtLmZpbmQoJy5oZWxwLWJsb2NrJykuaHRtbChkKTtcbiAgICB9KTtcbiAgfSlcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAkKCcuZG9icm8tZnVuZHNfaXRlbS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICQoJyNkb2Jyby1zZW5kLWZvcm0tY2hhcml0eS1wcm9jZXNzJykudmFsKCQodGhpcykuZGF0YSgnaWQnKSk7XG4gIH0pO1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQnKS5hZGRDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LW9wZW4nKTtcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykuYWRkQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZS1vcGVuJyk7XG4gIH0pO1xuICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LWNsb3NlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdCcpLnJlbW92ZUNsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtb3BlbicpO1xuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5yZW1vdmVDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlLW9wZW4nKTtcbiAgfSk7XG59KSgpO1xuIiwiLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xuZnVuY3Rpb24gc2hhcmU0Migpe1xuICBlPWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXJlNDJpbml0Jyk7XG4gIGZvciAodmFyIGsgPSAwOyBrIDwgZS5sZW5ndGg7IGsrKykge1xuICAgIHZhciB1ID0gXCJcIjtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29jaWFscycpICE9IC0xKVxuICAgICAgdmFyIHNvY2lhbHMgPSBKU09OLnBhcnNlKCdbJytlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zb2NpYWxzJykrJ10nKTtcbiAgICB2YXIgaWNvbl90eXBlPWVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tdHlwZScpICE9IC0xP2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tdHlwZScpOicnO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKSAhPSAtMSlcbiAgICAgIHUgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKTtcbiAgICB2YXIgcHJvbW8gPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9tbycpO1xuICAgIGlmKHByb21vICYmIHByb21vLmxlbmd0aD4wKSB7XG4gICAgICB2YXIga2V5ID0gJ3Byb21vPScsXG4gICAgICAgIHByb21vU3RhcnQgPSB1LmluZGV4T2Yoa2V5KSxcbiAgICAgICAgcHJvbW9FbmQgPSB1LmluZGV4T2YoJyYnLCBwcm9tb1N0YXJ0KSxcbiAgICAgICAgcHJvbW9MZW5ndGggPSBwcm9tb0VuZCA+IHByb21vU3RhcnQgPyBwcm9tb0VuZCAtIHByb21vU3RhcnQgLSBrZXkubGVuZ3RoIDogdS5sZW5ndGggLSBwcm9tb1N0YXJ0IC0ga2V5Lmxlbmd0aDtcbiAgICAgIGlmKHByb21vU3RhcnQgPiAwKSB7XG4gICAgICAgIHByb21vID0gdS5zdWJzdHIocHJvbW9TdGFydCArIGtleS5sZW5ndGgsIHByb21vTGVuZ3RoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIHNlbGZfcHJvbW8gPSAocHJvbW8gJiYgcHJvbW8ubGVuZ3RoID4gMCk/IFwic2V0VGltZW91dChmdW5jdGlvbigpe3NlbmRfcHJvbW8oJ1wiK3Byb21vK1wiJyk7fSwyMDAwKTtcIiA6IFwiXCI7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tc2l6ZScpICE9IC0xKVxuICAgICAgdmFyIGljb25fc2l6ZSA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tc2l6ZScpO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpICE9IC0xKVxuICAgICAgdmFyIHQgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pbWFnZScpICE9IC0xKVxuICAgICAgdmFyIGkgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pbWFnZScpO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1kZXNjcmlwdGlvbicpICE9IC0xKVxuICAgICAgdmFyIGQgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1kZXNjcmlwdGlvbicpO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wYXRoJykgIT0gLTEpXG4gICAgICB2YXIgZiA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXBhdGgnKTtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbnMtZmlsZScpICE9IC0xKVxuICAgICAgdmFyIGZuID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbnMtZmlsZScpO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zY3JpcHQtYWZ0ZXInKSkge1xuICAgICAgc2VsZl9wcm9tbyArPSBcInNldFRpbWVvdXQoZnVuY3Rpb24oKXtcIitlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zY3JpcHQtYWZ0ZXInKStcIn0sMzAwMCk7XCI7XG4gICAgfVxuXG4gICAgaWYgKCFmKSB7XG4gICAgICBmdW5jdGlvbiBwYXRoKG5hbWUpIHtcbiAgICAgICAgdmFyIHNjID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpXG4gICAgICAgICAgLCBzciA9IG5ldyBSZWdFeHAoJ14oLiovfCkoJyArIG5hbWUgKyAnKShbIz9dfCQpJyk7XG4gICAgICAgIGZvciAodmFyIHAgPSAwLCBzY0wgPSBzYy5sZW5ndGg7IHAgPCBzY0w7IHArKykge1xuICAgICAgICAgIHZhciBtID0gU3RyaW5nKHNjW3BdLnNyYykubWF0Y2goc3IpO1xuICAgICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgICBpZiAobVsxXS5tYXRjaCgvXigoaHR0cHM/fGZpbGUpXFw6XFwvezIsfXxcXHc6W1xcL1xcXFxdKS8pKVxuICAgICAgICAgICAgICByZXR1cm4gbVsxXTtcbiAgICAgICAgICAgIGlmIChtWzFdLmluZGV4T2YoXCIvXCIpID09IDApXG4gICAgICAgICAgICAgIHJldHVybiBtWzFdO1xuICAgICAgICAgICAgYiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdiYXNlJyk7XG4gICAgICAgICAgICBpZiAoYlswXSAmJiBiWzBdLmhyZWYpXG4gICAgICAgICAgICAgIHJldHVybiBiWzBdLmhyZWYgKyBtWzFdO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUubWF0Y2goLyguKltcXC9cXFxcXSkvKVswXSArIG1bMV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZiA9IHBhdGgoJ3NoYXJlNDIuanMnKTtcbiAgICB9XG4gICAgaWYgKCF1KVxuICAgICAgdSA9IGxvY2F0aW9uLmhyZWY7XG4gICAgaWYgKCF0KVxuICAgICAgdCA9IGRvY3VtZW50LnRpdGxlO1xuICAgIGlmICghZm4pXG4gICAgICBmbiA9ICdpY29ucy5wbmcnO1xuICAgIGZ1bmN0aW9uIGRlc2MoKSB7XG4gICAgICB2YXIgbWV0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtZXRhJyk7XG4gICAgICBmb3IgKHZhciBtID0gMDsgbSA8IG1ldGEubGVuZ3RoOyBtKyspIHtcbiAgICAgICAgaWYgKG1ldGFbbV0ubmFtZS50b0xvd2VyQ2FzZSgpID09ICdkZXNjcmlwdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gbWV0YVttXS5jb250ZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGlmICghZClcbiAgICAgIGQgPSBkZXNjKCk7XG4gICAgdSA9IGVuY29kZVVSSUNvbXBvbmVudCh1KTtcbiAgICB0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHQpO1xuICAgIHQgPSB0LnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XG4gICAgaSA9IGVuY29kZVVSSUNvbXBvbmVudChpKTtcbiAgICB2YXIgZF9vcmlnPWQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcbiAgICBkID0gZW5jb2RlVVJJQ29tcG9uZW50KGQpO1xuICAgIGQgPSBkLnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XG4gICAgdmFyIGZiUXVlcnkgPSAndT0nICsgdTtcbiAgICBpZiAoaSAhPSAnbnVsbCcgJiYgaSAhPSAnJylcbiAgICAgIGZiUXVlcnkgPSAncz0xMDAmcFt1cmxdPScgKyB1ICsgJyZwW3RpdGxlXT0nICsgdCArICcmcFtzdW1tYXJ5XT0nICsgZCArICcmcFtpbWFnZXNdWzBdPScgKyBpO1xuICAgIHZhciB2a0ltYWdlID0gJyc7XG4gICAgaWYgKGkgIT0gJ251bGwnICYmIGkgIT0gJycpXG4gICAgICB2a0ltYWdlID0gJyZpbWFnZT0nICsgaTtcbiAgICB2YXIgcyA9IG5ldyBBcnJheShcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwiZmJcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT0nICsgdSArJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgRmFjZWJvb2tcIicsXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInZrXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy92ay5jb20vc2hhcmUucGhwP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyB2a0ltYWdlICsgJyZkZXNjcmlwdGlvbj0nICsgZCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCSINCa0L7QvdGC0LDQutGC0LVcIicsXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cIm9ka2xcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL2Nvbm5lY3Qub2sucnUvb2ZmZXI/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICcmZGVzY3JpcHRpb249JysgZCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIg0J7QtNC90L7QutC70LDRgdGB0L3QuNC60LhcIicsXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInR3aVwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9JyArIHQgKyAnJnVybD0nICsgdSArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIgVHdpdHRlclwiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwiZ3BsdXNcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3BsdXMuZ29vZ2xlLmNvbS9zaGFyZT91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgR29vZ2xlK1wiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwibWFpbFwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vY29ubmVjdC5tYWlsLnJ1L3NoYXJlP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnJmRlc2NyaXB0aW9uPScgKyBkICsgJyZpbWFnZXVybD0nICsgaSArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyINCc0L7QtdC8INCc0LjRgNC1QE1haWwuUnVcIicsXG4gICAgICAnXCIvL3d3dy5saXZlam91cm5hbC5jb20vdXBkYXRlLmJtbD9ldmVudD0nICsgdSArICcmc3ViamVjdD0nICsgdCArICdcIiB0aXRsZT1cItCe0L/Rg9Cx0LvQuNC60L7QstCw0YLRjCDQsiBMaXZlSm91cm5hbFwiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwicGluXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9waW50ZXJlc3QuY29tL3Bpbi9jcmVhdGUvYnV0dG9uLz91cmw9JyArIHUgKyAnJm1lZGlhPScgKyBpICsgJyZkZXNjcmlwdGlvbj0nICsgdCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NjAwLCBoZWlnaHQ9MzAwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIgUGludGVyZXN0XCInLFxuICAgICAgJ1wiXCIgb25jbGljaz1cInJldHVybiBmYXYodGhpcyk7XCIgdGl0bGU9XCLQodC+0YXRgNCw0L3QuNGC0Ywg0LIg0LjQt9Cx0YDQsNC90L3QvtC1INCx0YDQsNGD0LfQtdGA0LBcIicsXG4gICAgICAnXCIjXCIgb25jbGljaz1cInByaW50KCk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQoNCw0YHQv9C10YfQsNGC0LDRgtGMXCInLFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJ0ZWxlZ3JhbVwiIG9uY2xpY2s9XCJ3aW5kb3cub3BlbihcXCcvL3RlbGVncmFtLm1lL3NoYXJlL3VybD91cmw9JyArIHUgKycmdGV4dD0nICsgdCArICdcXCcsIFxcJ3RlbGVncmFtXFwnLCBcXCd3aWR0aD01NTAsaGVpZ2h0PTQ0MCxsZWZ0PTEwMCx0b3A9MTAwXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIFRlbGVncmFtXCInLFxuICAgICAgJ1widmliZXI6Ly9mb3J3YXJkP3RleHQ9JysgdSArJyAtICcgKyB0ICsgJ1wiIGRhdGEtY291bnQ9XCJ2aWJlclwiIHJlbD1cIm5vZm9sbG93IG5vb3BlbmVyXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBWaWJlclwiJyxcbiAgICAgICdcIndoYXRzYXBwOi8vc2VuZD90ZXh0PScrIHUgKycgLSAnICsgdCArICdcIiBkYXRhLWNvdW50PVwid2hhdHNhcHBcIiByZWw9XCJub2ZvbGxvdyBub29wZW5lclwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgV2hhdHNBcHBcIidcblxuICAgICk7XG5cbiAgICB2YXIgbCA9ICcnO1xuXG4gICAgaWYoc29jaWFscy5sZW5ndGg+MSl7XG4gICAgICBmb3IgKHEgPSAwOyBxIDwgc29jaWFscy5sZW5ndGg7IHErKyl7XG4gICAgICAgIGo9c29jaWFsc1txXTtcbiAgICAgICAgbCArPSAnPGEgcmVsPVwibm9mb2xsb3dcIiBocmVmPScgKyBzW2pdICsgJyB0YXJnZXQ9XCJfYmxhbmtcIiAnK2dldEljb24oc1tqXSxqLGljb25fdHlwZSxmLGZuLGljb25fc2l6ZSkrJz48L2E+JztcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGZvciAoaiA9IDA7IGogPCBzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGwgKz0gJzxhIHJlbD1cIm5vZm9sbG93XCIgaHJlZj0nICsgc1tqXSArICcgdGFyZ2V0PVwiX2JsYW5rXCIgJytnZXRJY29uKHNbal0saixpY29uX3R5cGUsZixmbixpY29uX3NpemUpKyc+PC9hPic7XG4gICAgICB9XG4gICAgfVxuICAgIGVba10uaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPVwic2hhcmU0Ml93cmFwXCI+JyArIGwgKyAnPC9zcGFuPic7XG4gIH1cbiAgXG4vL30sIGZhbHNlKTtcbn1cblxuc2hhcmU0MigpO1xuXG5mdW5jdGlvbiBnZXRJY29uKHMsaix0LGYsZm4sc2l6ZSkge1xuICBpZighc2l6ZSl7XG4gICAgc2l6ZT0zMjtcbiAgfVxuICBpZih0PT0nY3NzJyl7XG4gICAgaj1zLmluZGV4T2YoJ2RhdGEtY291bnQ9XCInKSsxMjtcbiAgICB2YXIgbD1zLmluZGV4T2YoJ1wiJyxqKS1qO1xuICAgIHZhciBsMj1zLmluZGV4T2YoJy4nLGopLWo7XG4gICAgbD1sPmwyICYmIGwyPjAgP2wyOmw7XG4gICAgLy92YXIgaWNvbj0nY2xhc3M9XCJzb2MtaWNvbiBpY29uLScrcy5zdWJzdHIoaixsKSsnXCInO1xuICAgIHZhciBpY29uPSdjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2QtJytzLnN1YnN0cihqLGwpKydcIic7XG4gIH1lbHNlIGlmKHQ9PSdzdmcnKXtcbiAgICB2YXIgc3ZnPVtcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDExMS45NCwxNzcuMDgpXCIgZD1cIk0wIDAgMCA3MC4zIDIzLjYgNzAuMyAyNy4xIDk3LjcgMCA5Ny43IDAgMTE1LjJDMCAxMjMuMiAyLjIgMTI4LjYgMTMuNiAxMjguNkwyOC4xIDEyOC42IDI4LjEgMTUzLjFDMjUuNiAxNTMuNCAxNyAxNTQuMiA2LjkgMTU0LjItMTQgMTU0LjItMjguMyAxNDEuNC0yOC4zIDExNy45TC0yOC4zIDk3LjctNTIgOTcuNy01MiA3MC4zLTI4LjMgNzAuMy0yOC4zIDAgMCAwWlwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsOTguMjc0LDE0NS41MilcIiBkPVwiTTAgMCA5LjYgMEM5LjYgMCAxMi41IDAuMyAxNCAxLjkgMTUuNCAzLjQgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMSAxOSAyMS4xIDIxIDI3IDIyLjggMzQuNiA4LjUgNDIuNyAzIDQ4LjctMS4yIDUzLjMtMC4zIDUzLjMtMC4zTDc0LjggMEM3NC44IDAgODYuMSAwLjcgODAuNyA5LjUgODAuMyAxMC4zIDc3LjYgMTYuMSA2NC44IDI4IDUxLjMgNDAuNSA1My4xIDM4LjUgNjkuMyA2MC4xIDc5LjIgNzMuMyA4My4yIDgxLjQgODEuOSA4NC44IDgwLjggODguMSA3My41IDg3LjIgNzMuNSA4Ny4yTDQ5LjMgODcuMUM0OS4zIDg3LjEgNDcuNSA4Ny4zIDQ2LjIgODYuNSA0NC45IDg1LjcgNDQgODMuOSA0NCA4My45IDQ0IDgzLjkgNDAuMiA3My43IDM1LjEgNjUuMSAyNC4zIDQ2LjggMjAgNDUuOCAxOC4zIDQ2LjkgMTQuMiA0OS42IDE1LjIgNTcuNiAxNS4yIDYzLjIgMTUuMiA4MSAxNy45IDg4LjQgOS45IDkwLjMgNy4zIDkwLjkgNS40IDkxLjMtMS40IDkxLjQtMTAgOTEuNS0xNy4zIDkxLjQtMjEuNCA4OS4zLTI0LjIgODgtMjYuMyA4NS0yNSA4NC44LTIzLjQgODQuNi0xOS44IDgzLjgtMTcuOSA4MS4yLTE1LjQgNzcuOS0xNS41IDcwLjMtMTUuNSA3MC4zLTE1LjUgNzAuMy0xNC4xIDQ5LjQtMTguOCA0Ni44LTIyLjEgNDUtMjYuNSA0OC43LTM2LjEgNjUuMy00MS4xIDczLjgtNDQuOCA4My4yLTQ0LjggODMuMi00NC44IDgzLjItNDUuNSA4NC45LTQ2LjggODUuOS00OC4zIDg3LTUwLjUgODcuNC01MC41IDg3LjRMLTczLjUgODcuMkMtNzMuNSA4Ny4yLTc2LjkgODcuMS03OC4yIDg1LjYtNzkuMyA4NC4zLTc4LjMgODEuNS03OC4zIDgxLjUtNzguMyA4MS41LTYwLjMgMzkuNC0zOS45IDE4LjItMjEuMi0xLjMgMCAwIDAgMFwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDEwNi44OCwxODMuNjEpXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKC02Ljg4MDUsLTEwMClcIiBzdHlsZT1cInN0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIj48cGF0aCBkPVwiTSAwLDAgQyA4LjE0NiwwIDE0Ljc2OSwtNi42MjUgMTQuNzY5LC0xNC43NyAxNC43NjksLTIyLjkwNyA4LjE0NiwtMjkuNTMzIDAsLTI5LjUzMyAtOC4xMzYsLTI5LjUzMyAtMTQuNzY5LC0yMi45MDcgLTE0Ljc2OSwtMTQuNzcgLTE0Ljc2OSwtNi42MjUgLTguMTM2LDAgMCwwIE0gMCwtNTAuNDI5IEMgMTkuNjc2LC01MC40MjkgMzUuNjcsLTM0LjQzNSAzNS42NywtMTQuNzcgMzUuNjcsNC45MDMgMTkuNjc2LDIwLjkwMyAwLDIwLjkwMyAtMTkuNjcxLDIwLjkwMyAtMzUuNjY5LDQuOTAzIC0zNS42NjksLTE0Ljc3IC0zNS42NjksLTM0LjQzNSAtMTkuNjcxLC01MC40MjkgMCwtNTAuNDI5XCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsNy41NTE2LC01NC41NzcpXCIgc3R5bGU9XCJzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCI+PHBhdGggZD1cIk0gMCwwIEMgNy4yNjIsMS42NTUgMTQuMjY0LDQuNTI2IDIwLjcxNCw4LjU3OCAyNS41OTUsMTEuNjU0IDI3LjA2NiwxOC4xMDggMjMuOTksMjIuOTg5IDIwLjkxNywyNy44ODEgMTQuNDY5LDI5LjM1MiA5LjU3OSwyNi4yNzUgLTUuMDMyLDE3LjA4NiAtMjMuODQzLDE3LjA5MiAtMzguNDQ2LDI2LjI3NSAtNDMuMzM2LDI5LjM1MiAtNDkuNzg0LDI3Ljg4MSAtNTIuODUyLDIyLjk4OSAtNTUuOTI4LDE4LjEwNCAtNTQuNDYxLDExLjY1NCAtNDkuNTgsOC41NzggLTQzLjEzMiw0LjUzMSAtMzYuMTI4LDEuNjU1IC0yOC44NjcsMCBMIC00OC44MDksLTE5Ljk0MSBDIC01Mi44ODYsLTI0LjAyMiAtNTIuODg2LC0zMC42MzkgLTQ4LjgwNSwtMzQuNzIgLTQ2Ljc2MiwtMzYuNzU4IC00NC4wOSwtMzcuNzc5IC00MS40MTgsLTM3Ljc3OSAtMzguNzQyLC0zNy43NzkgLTM2LjA2NSwtMzYuNzU4IC0zNC4wMjMsLTM0LjcyIEwgLTE0LjQzNiwtMTUuMTIzIDUuMTY5LC0zNC43MiBDIDkuMjQ2LC0zOC44MDEgMTUuODYyLC0zOC44MDEgMTkuOTQzLC0zNC43MiAyNC4wMjgsLTMwLjYzOSAyNC4wMjgsLTI0LjAxOSAxOS45NDMsLTE5Ljk0MSBMIDAsMCBaXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48L2c+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDE2OS43Niw1Ni43MjcpXCIgZD1cIk0wIDBDLTUuMS0yLjMtMTAuNi0zLjgtMTYuNC00LjUtMTAuNS0xLTYgNC42LTMuOSAxMS4zLTkuNCA4LTE1LjUgNS43LTIyIDQuNC0yNy4zIDkuOS0zNC43IDEzLjQtNDIuOSAxMy40LTU4LjcgMTMuNC03MS42IDAuNi03MS42LTE1LjItNzEuNi0xNy40LTcxLjMtMTkuNi03MC44LTIxLjctOTQuNi0yMC41LTExNS43LTkuMS0xMjkuOCA4LjItMTMyLjMgNC0xMzMuNy0xLTEzMy43LTYuMi0xMzMuNy0xNi4xLTEyOC42LTI0LjktMTIwLjktMzAtMTI1LjYtMjkuOS0xMzAuMS0yOC42LTEzMy45LTI2LjUtMTMzLjktMjYuNi0xMzMuOS0yNi43LTEzMy45LTI2LjgtMTMzLjktNDAuNy0xMjQtNTIuMy0xMTEtNTQuOS0xMTMuNC01NS41LTExNS45LTU1LjktMTE4LjUtNTUuOS0xMjAuMy01NS45LTEyMi4xLTU1LjctMTIzLjktNTUuNC0xMjAuMi02Ni43LTEwOS43LTc1LTk3LjEtNzUuMy0xMDYuOS04Mi45LTExOS4zLTg3LjUtMTMyLjctODcuNS0xMzUtODcuNS0xMzcuMy04Ny40LTEzOS41LTg3LjEtMTI2LjgtOTUuMi0xMTEuOC0xMDAtOTUuNi0xMDAtNDMtMTAwLTE0LjItNTYuMy0xNC4yLTE4LjUtMTQuMi0xNy4zLTE0LjItMTYtMTQuMy0xNC44LTguNy0xMC44LTMuOC01LjcgMCAwXCIvPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgxIDAgMCAtMSA3Mi4zODEgOTAuMTcyKVwiPjxwYXRoIGQ9XCJNODcuMiAwIDg3LjIgMTcuMSA3NSAxNy4xIDc1IDAgNTcuOSAwIDU3LjktMTIuMiA3NS0xMi4yIDc1LTI5LjMgODcuMi0yOS4zIDg3LjItMTIuMiAxMDQuMy0xMi4yIDEwNC4zIDAgODcuMiAwWlwiLz48cGF0aCBkPVwiTTAgMCAwLTE5LjYgMjYuMi0xOS42QzI1LjQtMjMuNyAyMy44LTI3LjUgMjAuOC0zMC42IDEwLjMtNDIuMS05LjMtNDItMjAuNS0zMC40LTMxLjctMTguOS0zMS42LTAuMy0yMC4yIDExLjEtOS40IDIxLjkgOCAyMi40IDE4LjYgMTIuMUwxOC41IDEyLjEgMzIuOCAyNi40QzEzLjcgNDMuOC0xNS44IDQzLjUtMzQuNSAyNS4xLTUzLjggNi4xLTU0LTI1LTM0LjktNDQuMy0xNS45LTYzLjUgMTcuMS02My43IDM0LjktNDQuNiA0NS42LTMzIDQ4LjctMTYuNCA0Ni4yIDBMMCAwWlwiLz48L2c+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDk3LjY3Niw2Mi40MTEpXCIgZD1cIk0wIDBDMTAuMiAwIDE5LjktNC41IDI2LjktMTEuNkwyNi45LTExLjZDMjYuOS04LjIgMjkuMi01LjcgMzIuNC01LjdMMzMuMi01LjdDMzguMi01LjcgMzkuMi0xMC40IDM5LjItMTEuOUwzOS4yLTY0LjhDMzguOS02OC4yIDQyLjgtNzAgNDUtNjcuOCA1My41LTU5LjEgNjMuNi0yMi45IDM5LjctMiAxNy40IDE3LjYtMTIuNSAxNC4zLTI4LjUgMy40LTQ1LjQtOC4zLTU2LjItMzQuMS00NS43LTU4LjQtMzQuMi04NC45LTEuNC05Mi44IDE4LjEtODQuOSAyOC04MC45IDMyLjUtOTQuMyAyMi4zLTk4LjYgNi44LTEwNS4yLTM2LjQtMTA0LjUtNTYuNS02OS42LTcwLjEtNDYuMS02OS40LTQuNi0zMy4zIDE2LjktNS43IDMzLjMgMzAuNyAyOC44IDUyLjcgNS44IDc1LjYtMTguMiA3NC4zLTYzIDUxLjktODAuNSA0MS44LTg4LjQgMjYuNy04MC43IDI2LjgtNjkuMkwyNi43LTY1LjRDMTkuNi03Mi40IDEwLjItNzYuNSAwLTc2LjUtMjAuMi03Ni41LTM4LTU4LjctMzgtMzguNC0zOC0xOC0yMC4yIDAgMCAwTTI1LjUtMzdDMjQuNy0yMi4yIDEzLjctMTMuMyAwLjQtMTMuM0wtMC4xLTEzLjNDLTE1LjQtMTMuMy0yMy45LTI1LjMtMjMuOS0zOS0yMy45LTU0LjMtMTMuNi02NC0wLjEtNjQgMTQuOS02NCAyNC44LTUzIDI1LjUtNDBMMjUuNS0zN1pcIi8+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwibWF0cml4KDAuNDI2MjMgMCAwIDAuNDI2MjMgMzQuOTk5IDM1KVwiPjxwYXRoIGQ9XCJNMTYwLjcgMTkuNWMtMTguOSAwLTM3LjMgMy43LTU0LjcgMTAuOUw3Ni40IDAuN2MtMC44LTAuOC0yLjEtMS0zLjEtMC40QzQ0LjQgMTguMiAxOS44IDQyLjkgMS45IDcxLjdjLTAuNiAxLTAuNSAyLjMgMC40IDMuMWwyOC40IDI4LjRjLTguNSAxOC42LTEyLjggMzguNS0xMi44IDU5LjEgMCA3OC43IDY0IDE0Mi44IDE0Mi44IDE0Mi44IDc4LjcgMCAxNDIuOC02NCAxNDIuOC0xNDIuOEMzMDMuNCA4My41IDIzOS40IDE5LjUgMTYwLjcgMTkuNXpNMjE3LjIgMTQ4LjdsOS45IDQyLjEgOS41IDQ0LjQgLTQ0LjMtOS41IC00Mi4xLTkuOUwzNi43IDEwMi4xYzE0LjMtMjkuMyAzOC4zLTUyLjYgNjguMS02NS44TDIxNy4yIDE0OC43elwiLz48cGF0aCBkPVwiTTIyMS44IDE4Ny40bC03LjUtMzNjLTI1LjkgMTEuOS00Ni40IDMyLjQtNTguMyA1OC4zbDMzIDcuNUMxOTYgMjA2LjIgMjA3LjcgMTk0LjQgMjIxLjggMTg3LjR6XCIvPjwvZz48L3N2Zz4nLFxuICAgICAgJycsLy9waW5cbiAgICAgICcnLC8vZmF2XG4gICAgICAnJywvL3ByaW50XG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw3MS4yNjQsMTA2LjkzKVwiIGQ9XCJNMCAwIDY4LjYgNDMuMUM3MiA0NS4zIDczLjEgNDIuOCA3MS42IDQxLjFMMTQuNi0xMC4yIDExLjctMzUuOCAwIDBaTTg3LjEgNjIuOS0zMy40IDE3LjJDLTQwIDE1LjMtMzkuOCA4LjgtMzQuOSA3LjNMLTQuNy0yLjIgNi44LTM3LjZDOC4yLTQxLjUgOS40LTQyLjkgMTEuOC00MyAxNC4zLTQzIDE1LjMtNDIuMSAxNy45LTM5LjggMjAuOS0zNi45IDI1LjYtMzIuMyAzMy0yNS4yTDY0LjQtNDguNEM3MC4yLTUxLjYgNzQuMy00OS45IDc1LjgtNDNMOTUuNSA1NC40Qzk3LjYgNjIuOSA5Mi42IDY1LjQgODcuMSA2Mi45XCIvPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMzUuMzMsMTE5Ljg1KVwiIGQ9XCJNMCAwQy0yLjQtNS40LTYuNS05LTEyLjItMTAuNi0xNC4zLTExLjItMTYuMy0xMC43LTE4LjItOS45LTQ0LjQgMS4yLTYzLjMgMTkuNi03NCA0Ni4yLTc0LjggNDguMS03NS4zIDUwLjEtNzUuMiA1MS45LTc1LjIgNTguNy02OS4yIDY1LTYyLjYgNjUuNC02MC44IDY1LjUtNTkuMiA2NC45LTU3LjkgNjMuNy01My4zIDU5LjMtNDkuNiA1NC4zLTQ2LjkgNDguNi00NS40IDQ1LjUtNDYgNDMuMy00OC43IDQxLjEtNDkuMSA0MC43LTQ5LjUgNDAuNC01MCA0MC4xLTUzLjUgMzcuNS01NC4zIDM0LjktNTIuNiAzMC44LTQ5LjggMjQuMi00NS40IDE5LTM5LjMgMTUuMS0zNyAxMy42LTM0LjcgMTIuMi0zMiAxMS41LTI5LjYgMTAuOC0yNy43IDExLjUtMjYuMSAxMy40LTI1LjkgMTMuNi0yNS44IDEzLjktMjUuNiAxNC4xLTIyLjMgMTguOC0xOC42IDE5LjYtMTMuNyAxNi41LTkuNiAxMy45LTUuNiAxMS0xLjggNy44IDAuNyA1LjYgMS4zIDMgMCAwTS0xOC4yIDM2LjdDLTE4LjMgMzUuOS0xOC4zIDM1LjQtMTguNCAzNC45LTE4LjYgMzQtMTkuMiAzMy40LTIwLjIgMzMuNC0yMS4zIDMzLjQtMjEuOSAzNC0yMi4yIDM0LjktMjIuMyAzNS41LTIyLjQgMzYuMi0yMi41IDM2LjktMjMuMiA0MC4zLTI1LjIgNDIuNi0yOC42IDQzLjYtMjkuMSA0My43LTI5LjUgNDMuNy0yOS45IDQzLjgtMzEgNDQuMS0zMi40IDQ0LjItMzIuNCA0NS44LTMyLjUgNDcuMS0zMS41IDQ3LjktMjkuNiA0OC0yOC40IDQ4LjEtMjYuNSA0Ny41LTI1LjQgNDYuOS0yMC45IDQ0LjctMTguNyA0MS42LTE4LjIgMzYuN00tMjUuNSA1MS4yQy0yOCA1Mi4xLTMwLjUgNTIuOC0zMy4yIDUzLjItMzQuNSA1My40LTM1LjQgNTQuMS0zNS4xIDU1LjYtMzQuOSA1Ny0zNCA1Ny41LTMyLjYgNTcuNC0yNCA1Ni42LTE3LjMgNTMuNC0xMi42IDQ2LTEwLjUgNDIuNS05LjIgMzcuNS05LjQgMzMuOC05LjUgMzEuMi05LjkgMzAuNS0xMS40IDMwLjUtMTMuNiAzMC42LTEzLjMgMzIuNC0xMy41IDMzLjctMTMuNyAzNS43LTE0LjIgMzcuNy0xNC43IDM5LjctMTYuMyA0NS40LTE5LjkgNDkuMy0yNS41IDUxLjJNLTM4IDY0LjRDLTM3LjkgNjUuOS0zNyA2Ni41LTM1LjUgNjYuNC0yMy4yIDY1LjgtMTMuOSA2Mi4yLTYuNyA1Mi41LTIuNSA0Ni45LTAuMiAzOS4yIDAgMzIuMiAwIDMxLjEgMCAzMCAwIDI5LTAuMSAyNy44LTAuNiAyNi45LTEuOSAyNi45LTMuMiAyNi45LTMuOSAyNy42LTQgMjktNC4zIDM0LjItNS4zIDM5LjMtNy4zIDQ0LjEtMTEuMiA1My41LTE4LjYgNTguNi0yOC4xIDYxLjEtMzAuNyA2MS43LTMzLjIgNjIuMi0zNS44IDYyLjUtMzcgNjIuNS0zOCA2Mi44LTM4IDY0LjRNMTEuNSA3NC4xQzYuNiA3OC4zIDAuOSA4MC44LTUuMyA4Mi40LTIwLjggODYuNS0zNi41IDg3LjUtNTIuNCA4NS4zLTYwLjUgODQuMi02OC4zIDgyLjEtNzUuNCA3OC4xLTgzLjggNzMuNC04OS42IDY2LjYtOTIuMiA1Ny4xLTk0IDUwLjQtOTQuOSA0My42LTk1LjIgMzYuNi05NS43IDI2LjQtOTUuNCAxNi4zLTkyLjggNi4zLTg5LjgtNS4zLTgzLjItMTMuOC03MS45LTE4LjMtNzAuNy0xOC44LTY5LjUtMTkuNS02OC4zLTIwLTY3LjItMjAuNC02Ni44LTIxLjItNjYuOC0yMi40LTY2LjktMzAuNC02Ni44LTM4LjQtNjYuOC00Ni43LTYzLjktNDMuOS02MS44LTQxLjgtNjAuMy00MC4xLTU1LjktMzUuMS01MS43LTMwLjktNDcuMS0yNi4xLTQ0LjctMjMuNy00NS43LTIzLjgtNDIuMS0yMy44LTM3LjgtMjMuOS0zMS0yNC4xLTI2LjgtMjMuOC0xOC42LTIzLjEtMTAuNi0yMi4xLTIuNy0xOS43IDcuMi0xNi43IDE1LjItMTEuNCAxOS4yLTEuMyAyMC4zIDEuMyAyMS40IDQgMjIgNi44IDI1LjkgMjIuOSAyNS40IDM4LjkgMjIuMiA1NSAyMC42IDYyLjQgMTcuNSA2OSAxMS41IDc0LjFcIi8+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDEzMC44NCwxMTIuNylcIiBkPVwiTTAgMEMtMS42IDAuOS05LjQgNS4xLTEwLjggNS43LTEyLjMgNi4zLTEzLjQgNi42LTE0LjUgNS0xNS42IDMuNC0xOC45LTAuMS0xOS45LTEuMS0yMC44LTIuMi0yMS44LTIuMy0yMy40LTEuNC0yNS0wLjUtMzAuMSAxLjQtMzYuMSA3LjEtNDAuNyAxMS41LTQzLjcgMTctNDQuNiAxOC42LTQ1LjUgMjAuMy00NC42IDIxLjEtNDMuOCAyMS45LTQzIDIyLjYtNDIuMSAyMy43LTQxLjMgMjQuNi00MC40IDI1LjUtNDAuMSAyNi4yLTM5LjUgMjcuMi0zOSAyOC4zLTM5LjIgMjkuMy0zOS42IDMwLjEtMzkuOSAzMC45LTQyLjkgMzktNDQuMSA0Mi4zLTQ1LjMgNDUuNS00Ni43IDQ1LTQ3LjYgNDUuMS00OC42IDQ1LjEtNDkuNiA0NS4zLTUwLjcgNDUuMy01MS44IDQ1LjQtNTMuNiA0NS01NS4xIDQzLjUtNTYuNiA0MS45LTYxIDM4LjItNjEuMyAzMC4yLTYxLjYgMjIuMy01Ni4xIDE0LjQtNTUuMyAxMy4zLTU0LjUgMTIuMi00NC44LTUuMS0yOC42LTEyLjEtMTIuNC0xOS4yLTEyLjQtMTcuMS05LjQtMTYuOS02LjQtMTYuOCAwLjMtMTMuNCAxLjgtOS42IDMuMy01LjkgMy40LTIuNyAzLTIgMi42LTEuMyAxLjYtMC45IDAgME0tMjkuNy0zOC4zQy00MC40LTM4LjMtNTAuMy0zNS4xLTU4LjYtMjkuNkwtNzguOS0zNi4xLTcyLjMtMTYuNUMtNzguNi03LjgtODIuMyAyLjgtODIuMyAxNC40LTgyLjMgNDMuNC01OC43IDY3LjEtMjkuNyA2Ny4xLTAuNiA2Ny4xIDIzIDQzLjQgMjMgMTQuNCAyMy0xNC43LTAuNi0zOC4zLTI5LjctMzguM00tMjkuNyA3Ny42Qy02NC42IDc3LjYtOTIuOSA0OS4zLTkyLjkgMTQuNC05Mi45IDIuNC04OS42LTguOC04My45LTE4LjNMLTk1LjMtNTIuMi02MC4yLTQxQy01MS4yLTQ2LTQwLjgtNDguOS0yOS43LTQ4LjkgNS4zLTQ4LjkgMzMuNi0yMC42IDMzLjYgMTQuNCAzMy42IDQ5LjMgNS4zIDc3LjYtMjkuNyA3Ny42XCIvPjwvc3ZnPicsXG4gICAgXTtcbiAgICB2YXIgaWNvbj1zdmdbal07XG4gICAgdmFyIGNzcz0nIHN0eWxlPVwid2lkdGg6JytzaXplKydweDtoZWlnaHQ6JytzaXplKydweFwiICc7XG4gICAgaWNvbj0nPHN2ZyBjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2Qtc3ZnXCInK2NzcytpY29uLnN1YnN0cmluZyg0KTtcbiAgICBpY29uPSc+JytpY29uLnN1YnN0cmluZygwLCBpY29uLmxlbmd0aCAtIDEpO1xuICB9ZWxzZXtcbiAgICBpY29uPSdzdHlsZT1cImRpc3BsYXk6aW5saW5lLWJsb2NrO3ZlcnRpY2FsLWFsaWduOmJvdHRvbTt3aWR0aDonK3NpemUrJ3B4O2hlaWdodDonK3NpemUrJ3B4O21hcmdpbjowIDZweCA2cHggMDtwYWRkaW5nOjA7b3V0bGluZTpub25lO2JhY2tncm91bmQ6dXJsKCcgKyBmICsgZm4gKyAnKSAtJyArIHNpemUgKiBqICsgJ3B4IDAgbm8tcmVwZWF0OyBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1wiJ1xuICB9XG4gIHJldHVybiBpY29uO1xufVxuXG5mdW5jdGlvbiBmYXYoYSkge1xuICB2YXIgdGl0bGUgPSBkb2N1bWVudC50aXRsZTtcbiAgdmFyIHVybCA9IGRvY3VtZW50LmxvY2F0aW9uO1xuICB0cnkge1xuICAgIHdpbmRvdy5leHRlcm5hbC5BZGRGYXZvcml0ZSh1cmwsIHRpdGxlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRyeSB7XG4gICAgICB3aW5kb3cuc2lkZWJhci5hZGRQYW5lbCh0aXRsZSwgdXJsLCAnJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKHR5cGVvZiAob3BlcmEpID09ICdvYmplY3QnIHx8IHdpbmRvdy5zaWRlYmFyKSB7XG4gICAgICAgIGEucmVsID0gJ3NpZGViYXInO1xuICAgICAgICBhLnRpdGxlID0gdGl0bGU7XG4gICAgICAgIGEudXJsID0gdXJsO1xuICAgICAgICBhLmhyZWYgPSB1cmw7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoJ9Cd0LDQttC80LjRgtC1IEN0cmwtRCwg0YfRgtC+0LHRiyDQtNC+0LHQsNCy0LjRgtGMINGB0YLRgNCw0L3QuNGG0YMg0LIg0LfQsNC60LvQsNC00LrQuCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHNlbmRfcHJvbW8ocHJvbW8pe1xuICAkLmFqYXgoe1xuICAgIG1ldGhvZDogXCJwb3N0XCIsXG4gICAgdXJsOiBcIi9hY2NvdW50L3Byb21vXCIsXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICBkYXRhOiB7cHJvbW86IHByb21vfSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZiAoZGF0YS50aXRsZSAhPSBudWxsICYmIGRhdGEubWVzc2FnZSAhPSBudWxsKSB7XG4gICAgICAgIG9uX3Byb21vPSQoJy5vbl9wcm9tbycpO1xuICAgICAgICBpZihvbl9wcm9tby5sZW5ndGg9PTAgfHwgIW9uX3Byb21vLmlzKCc6dmlzaWJsZScpKSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBvbl9wcm9tby5zaG93KCk7XG4gICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuIiwiJCgnLnNjcm9sbF9ib3gtdGV4dCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cbiAgICQodGhpcykuY2xvc2VzdCgnLnNjcm9sbF9ib3gnKS5maW5kKCcuc2Nyb2xsX2JveC1pdGVtJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbF9ib3gtaXRlbS1sb3cnKTtcblxufSk7IiwidmFyIHBsYWNlaG9sZGVyID0gKGZ1bmN0aW9uKCl7XG4gIGZ1bmN0aW9uIG9uQmx1cigpe1xuICAgIHZhciBpbnB1dFZhbHVlID0gJCh0aGlzKS52YWwoKTtcbiAgICBpZiAoIGlucHV0VmFsdWUgPT0gXCJcIiApIHtcbiAgICAgICQodGhpcykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnZm9jdXNlZCcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRm9jdXMoKXtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2ZvY3VzZWQnKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gcnVuKHBhcikge1xuICAgIHZhciBlbHM7XG4gICAgaWYoIXBhcilcbiAgICAgIGVscz0kKCcuZm9ybS1ncm91cCBbcGxhY2Vob2xkZXJdJyk7XG4gICAgZWxzZVxuICAgICAgZWxzPSQocGFyKS5maW5kKCcuZm9ybS1ncm91cCBbcGxhY2Vob2xkZXJdJyk7XG5cbiAgICBlbHMuZm9jdXMob25Gb2N1cyk7XG4gICAgZWxzLmJsdXIob25CbHVyKTtcblxuICAgIGZvcih2YXIgaSA9IDA7IGk8ZWxzLmxlbmd0aDtpKyspe1xuICAgICAgdmFyIGVsPWVscy5lcShpKTtcbiAgICAgIHZhciB0ZXh0ID0gZWwuYXR0cigncGxhY2Vob2xkZXInKTtcbiAgICAgIGVsLmF0dHIoJ3BsYWNlaG9sZGVyJywnJyk7XG4gICAgICBpZih0ZXh0Lmxlbmd0aDwyKWNvbnRpbnVlO1xuICAgICAgLy9pZihlbC5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmxlbmd0aD09MClyZXR1cm47XG5cbiAgICAgIHZhciBpbnB1dFZhbHVlID0gZWwudmFsKCk7XG4gICAgICB2YXIgZWxfaWQgPSBlbC5hdHRyKCdpZCcpO1xuICAgICAgaWYoIWVsX2lkKXtcbiAgICAgICAgZWxfaWQ9J2VsX2Zvcm1zXycrTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKjEwMDAwKTtcbiAgICAgICAgZWwuYXR0cignaWQnLGVsX2lkKVxuICAgICAgfVxuXG4gICAgICBpZih0ZXh0LmluZGV4T2YoJ3wnKT4wKXtcbiAgICAgICAgdGV4dD10ZXh0LnNwbGl0KCd8Jyk7XG4gICAgICAgIHRleHQ9dGV4dFswXStcIjxzcGFuPlwiK3RleHRbMV0rXCI8L3NwYW4+XCJcbiAgICAgIH1cblxuICAgICAgdmFyIGRpdiA9ICQoJzxsYWJlbC8+Jyx7XG4gICAgICAgICdjbGFzcyc6J3BsYWNlaG9sZGVyJyxcbiAgICAgICAgJ2h0bWwnOiB0ZXh0LFxuICAgICAgICAnZm9yJzplbF9pZFxuICAgICAgfSk7XG4gICAgICBlbC5iZWZvcmUoZGl2KTtcblxuICAgICAgb25Gb2N1cy5iaW5kKGVsKSgpXG4gICAgICBvbkJsdXIuYmluZChlbCkoKVxuICAgIH1cbiAgfVxuXG4gIHJ1bigpO1xuICByZXR1cm4gcnVuO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcuYWpheF9sb2FkJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdmFyIHVybCA9ICQodGhhdCkuYXR0cignaHJlZicpO1xuICAgICAgICB2YXIgdG9wID0gTWF0aC5tYXgoZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApO1xuICAgICAgICB2YXIgc3RvcmVzU29ydCA9ICQoJy5jYXRhbG9nLXN0b3Jlc19zb3J0Jyk7Ly/QsdC70L7QuiDRgdC+0YDRgtC40YDQvtCy0LrQuCDRjdC70LXQvNC10L3RgtC+0LJcbiAgICAgICAgdmFyIHRhYmxlID0gJCgndGFibGUudGFibGUnKTsvL9GC0LDQsdC70LjRhtCwINCyIGFjY291bnRcbiAgICAgICAgLy9zY3JvbGwg0YLRg9C00LAg0LjQu9C4INGC0YPQtNCwXG4gICAgICAgIHZhciBzY3JvbGxUb3AgPSBzdG9yZXNTb3J0Lmxlbmd0aCA/ICQoc3RvcmVzU29ydFswXSkub2Zmc2V0KCkudG9wIC0gJCgnI2hlYWRlcj4qJykuZXEoMCkuaGVpZ2h0KCkgLSA1MCA6IDA7XG4gICAgICAgIGlmIChzY3JvbGxUb3AgPT09MCAmJiB0YWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQodGFibGVbMF0pLm9mZnNldCgpLnRvcCAtICQoJyNoZWFkZXI+KicpLmVxKDApLmhlaWdodCgpIC0gNTA7XG4gICAgICAgIH1cblxuICAgICAgICAkKHRoYXQpLmFkZENsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAgICQuZ2V0KHVybCwgeydnJzonYWpheF9sb2FkJ30sIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSAkKGRhdGEpLmZpbmQoJyNjb250ZW50LXdyYXAnKS5odG1sKCk7XG4gICAgICAgICAgICAkKCdib2R5JykuZmluZCgnI2NvbnRlbnQtd3JhcCcpLmh0bWwoY29udGVudCk7XG4gICAgICAgICAgICBzaGFyZTQyKCk7Ly90INC+0YLQvtCx0YDQsNC30LjQu9C40YHRjCDQutC90L7Qv9C60Lgg0J/QvtC00LXQu9C40YLRjNGB0Y9cbiAgICAgICAgICAgIHNkVG9vbHRpcC5zZXRFdmVudHMoKTsvL9GA0LDQsdC+0YLQsNC70Lgg0YLRg9C70YLQuNC/0YtcbiAgICAgICAgICAgIGJhbm5lci5yZWZyZXNoKCk7Ly/QvtCx0L3QvtCy0LjRgtGMINCx0LDQvdC90LXRgCDQvtGCINCz0YPQs9C7XG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoXCJvYmplY3Qgb3Igc3RyaW5nXCIsIFwiVGl0bGVcIiwgdXJsKTtcblxuICAgICAgICAgICAgaWYgKHRvcCA+IHNjcm9sbFRvcCkge1xuICAgICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IHNjcm9sbFRvcH0sIDUwMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkuZmFpbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQodGhhdCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe3R5cGU6J2VycicsICd0aXRsZSc6bGcoJ2Vycm9yJyksICdtZXNzYWdlJzpsZygnZXJyb3JfcXVlcnlpbmdfZGF0YScpfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG5cbn0pKCk7XG4iLCJiYW5uZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gcmVmcmVzaCgpe1xuICAgICAgICBmb3IoaT0wO2k8JCgnLmFkc2J5Z29vZ2xlJykubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAoYWRzYnlnb29nbGUgPSB3aW5kb3cuYWRzYnlnb29nbGUgfHwgW10pLnB1c2goe30pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7cmVmcmVzaDogcmVmcmVzaH1cbn0pKCk7IiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBjb250ZWluZXI7XG4gIHZhciBtb3VzZU92ZXIgPSAwO1xuICB2YXIgdGltZXJDbGVhckFsbCA9IG51bGw7XG4gIHZhciBhbmltYXRpb25FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCc7XG4gIHZhciB0aW1lID0gMTAwMDA7XG5cbiAgdmFyIG5vdGlmaWNhdGlvbl9ib3ggPSBmYWxzZTtcbiAgdmFyIGlzX2luaXQgPSBmYWxzZTtcbiAgdmFyIGNvbmZpcm1fb3B0ID0ge1xuICAgIC8vIHRpdGxlOiBsZygnZGVsZXRpbmcnKSxcbiAgICAvLyBxdWVzdGlvbjogbGcoJ2FyZV95b3Vfc3VyZV90b19kZWxldGUnKSxcbiAgICAvLyBidXR0b25ZZXM6IGxnKCd5ZXMnKSxcbiAgICAvLyBidXR0b25ObzogbGcoJ25vJyksXG4gICAgY2FsbGJhY2tZZXM6IGZhbHNlLFxuICAgIGNhbGxiYWNrTm86IGZhbHNlLFxuICAgIG9iajogZmFsc2UsXG4gICAgYnV0dG9uVGFnOiAnZGl2JyxcbiAgICBidXR0b25ZZXNEb3A6ICcnLFxuICAgIGJ1dHRvbk5vRG9wOiAnJ1xuICB9O1xuICB2YXIgYWxlcnRfb3B0ID0ge1xuICAgIHRpdGxlOiBcIlwiLFxuICAgIHF1ZXN0aW9uOiAnbWVzc2FnZScsXG4gICAgLy8gYnV0dG9uWWVzOiBsZygneWVzJyksXG4gICAgY2FsbGJhY2tZZXM6IGZhbHNlLFxuICAgIGJ1dHRvblRhZzogJ2RpdicsXG4gICAgb2JqOiBmYWxzZVxuICB9O1xuXG4gIGZ1bmN0aW9uIHRlc3RJcGhvbmUoKSB7XG4gICAgaWYgKCEvKGlQaG9uZXxpUGFkfGlQb2QpLiooT1MgMTEpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSByZXR1cm47XG4gICAgbm90aWZpY2F0aW9uX2JveC5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5jc3MoJ3RvcCcsICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgaXNfaW5pdCA9IHRydWU7XG4gICAgbm90aWZpY2F0aW9uX2JveCA9ICQoJy5ub3RpZmljYXRpb25fYm94Jyk7XG4gICAgaWYgKG5vdGlmaWNhdGlvbl9ib3gubGVuZ3RoID4gMClyZXR1cm47XG5cbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3ggPSAkKCcubm90aWZpY2F0aW9uX2JveCcpO1xuXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCAnLm5vdGlmeV9jb250cm9sJywgY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCAnLm5vdGlmeV9jbG9zZScsIGNsb3NlTW9kYWwpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgY2xvc2VNb2RhbEZvbik7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCkge1xuICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICAkKCcubm90aWZpY2F0aW9uX2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKCcnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWxGb24oZSkge1xuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgaWYgKHRhcmdldC5jbGFzc05hbWUgPT0gXCJub3RpZmljYXRpb25fYm94XCIpIHtcbiAgICAgIGNsb3NlTW9kYWwoKTtcbiAgICB9XG4gIH1cblxuICB2YXIgX3NldFVwTGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm5vdGlmaWNhdGlvbl9jbG9zZScsIF9jbG9zZVBvcHVwKTtcbiAgICAkKCdib2R5Jykub24oJ21vdXNlZW50ZXInLCAnLm5vdGlmaWNhdGlvbl9jb250YWluZXInLCBfb25FbnRlcik7XG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uTGVhdmUpO1xuICB9O1xuXG4gIHZhciBfb25FbnRlciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICh0aW1lckNsZWFyQWxsICE9IG51bGwpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lckNsZWFyQWxsKTtcbiAgICAgIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xuICAgIH1cbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgdmFyIG9wdGlvbiA9ICQodGhpcykuZGF0YSgnb3B0aW9uJyk7XG4gICAgICBpZiAob3B0aW9uLnRpbWVyKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChvcHRpb24udGltZXIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG1vdXNlT3ZlciA9IDE7XG4gIH07XG5cbiAgdmFyIF9vbkxlYXZlID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgICB2YXIgb3B0aW9uID0gJHRoaXMuZGF0YSgnb3B0aW9uJyk7XG4gICAgICBpZiAob3B0aW9uLnRpbWUgPiAwKSB7XG4gICAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChvcHRpb24uY2xvc2UpLCBvcHRpb24udGltZSAtIDE1MDAgKyAxMDAgKiBpKTtcbiAgICAgICAgJHRoaXMuZGF0YSgnb3B0aW9uJywgb3B0aW9uKVxuICAgICAgfVxuICAgIH0pO1xuICAgIG1vdXNlT3ZlciA9IDA7XG4gIH07XG5cbiAgdmFyIF9jbG9zZVBvcHVwID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpO1xuICAgICR0aGlzLm9uKGFuaW1hdGlvbkVuZCwgZnVuY3Rpb24gKCkge1xuICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICB9KTtcbiAgICAkdGhpcy5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2hpZGUnKVxuICB9O1xuXG4gIGZ1bmN0aW9uIGFsZXJ0KGRhdGEpIHtcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xuICAgIGFsZXJ0X29wdCA9IG9iamVjdHMoYWxlcnRfb3B0LCB7XG4gICAgICAgIGJ1dHRvblllczogbGcoJ3llcycpXG4gICAgfSk7XG4gICAgZGF0YSA9IG9iamVjdHMoYWxlcnRfb3B0LCBkYXRhKTtcblxuICAgIGlmICghaXNfaW5pdClpbml0KCk7XG4gICAgdGVzdElwaG9uZSgpO1xuXG4gICAgbm90eWZ5X2NsYXNzID0gJ25vdGlmeV9ib3ggJztcbiAgICBpZiAoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzICs9IGRhdGEubm90eWZ5X2NsYXNzO1xuXG4gICAgYm94X2h0bWwgPSAnPGRpdiBjbGFzcz1cIicgKyBub3R5ZnlfY2xhc3MgKyAnXCI+JztcbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwgKz0gJzxkaXY+JytkYXRhLnRpdGxlKyc8L2Rpdj4nO1xuICAgIGJveF9odG1sICs9ICc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XG4gICAgYm94X2h0bWwgKz0gZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcblxuICAgIGlmIChkYXRhLmJ1dHRvblllcyB8fCBkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiICcgKyBkYXRhLmJ1dHRvblllc0RvcCArICc+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnICsgZGF0YS5idXR0b25UYWcgKyAnIGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiICcgKyBkYXRhLmJ1dHRvbk5vRG9wICsgJz4nICsgZGF0YS5idXR0b25ObyArICc8LycgKyBkYXRhLmJ1dHRvblRhZyArICc+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cblxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XG5cblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sIDEwMClcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbmZpcm0oZGF0YSkge1xuICAgIGlmICghZGF0YSlkYXRhID0ge307XG4gICAgY29uZmlybV9vcHQgPSBvYmplY3RzKGNvbmZpcm1fb3B0LCB7XG4gICAgICAgIHRpdGxlOiBsZygnZGVsZXRpbmcnKSxcbiAgICAgICAgcXVlc3Rpb246IGxnKCdhcmVfeW91X3N1cmVfdG9fZGVsZXRlJyksXG4gICAgICAgIGJ1dHRvblllczogbGcoJ3llcycpLFxuICAgICAgICBidXR0b25ObzogbGcoJ25vJylcbiAgICB9KTtcbiAgICBkYXRhID0gb2JqZWN0cyhjb25maXJtX29wdCwgZGF0YSk7XG4gICAgaWYgKHR5cGVvZihkYXRhLmNhbGxiYWNrWWVzKSA9PSAnc3RyaW5nJykge1xuICAgICAgdmFyIGNvZGUgPSAnZGF0YS5jYWxsYmFja1llcyA9IGZ1bmN0aW9uKCl7JytkYXRhLmNhbGxiYWNrWWVzKyd9JztcbiAgICAgIGV2YWwoY29kZSk7XG4gICAgfVxuXG4gICAgaWYgKCFpc19pbml0KWluaXQoKTtcbiAgICB0ZXN0SXBob25lKCk7XG4gICAgLy9ib3hfaHRtbD0nPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3hcIj4nO1xuXG4gICAgbm90eWZ5X2NsYXNzID0gJ25vdGlmeV9ib3ggJztcbiAgICBpZiAoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzICs9IGRhdGEubm90eWZ5X2NsYXNzO1xuXG4gICAgYm94X2h0bWwgPSAnPGRpdiBjbGFzcz1cIicgKyBub3R5ZnlfY2xhc3MgKyAnXCI+JztcblxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCArPSBkYXRhLnRpdGxlO1xuICAgIGJveF9odG1sICs9ICc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XG4gICAgYm94X2h0bWwgKz0gZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcblxuICAgIGlmIChkYXRhLmJ1dHRvblllcyB8fCBkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuICAgIGlmIChkYXRhLmNhbGxiYWNrWWVzICE9IGZhbHNlKSB7XG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsIGRhdGEuY2FsbGJhY2tZZXMuYmluZChkYXRhLm9iaikpO1xuICAgIH1cbiAgICBpZiAoZGF0YS5jYWxsYmFja05vICE9IGZhbHNlKSB7XG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX25vJykub24oJ2NsaWNrJywgZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LCAxMDApXG5cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vdGlmaShkYXRhKSB7XG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcbiAgICB2YXIgb3B0aW9uID0ge3RpbWU6IChkYXRhLnRpbWUgfHwgZGF0YS50aW1lID09PSAwKSA/IGRhdGEudGltZSA6IHRpbWV9O1xuICAgIGlmICghY29udGVpbmVyKSB7XG4gICAgICBjb250ZWluZXIgPSAkKCc8dWwvPicsIHtcbiAgICAgICAgJ2NsYXNzJzogJ25vdGlmaWNhdGlvbl9jb250YWluZXInXG4gICAgICB9KTtcblxuICAgICAgJCgnYm9keScpLmFwcGVuZChjb250ZWluZXIpO1xuICAgICAgX3NldFVwTGlzdGVuZXJzKCk7XG4gICAgfVxuXG4gICAgdmFyIGxpID0gJCgnPGxpLz4nLCB7XG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9pdGVtJ1xuICAgIH0pO1xuXG4gICAgaWYgKGRhdGEudHlwZSkge1xuICAgICAgbGkuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9pdGVtLScgKyBkYXRhLnR5cGUpO1xuICAgIH1cblxuICAgIHZhciBjbG9zZSA9ICQoJzxzcGFuLz4nLCB7XG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9jbG9zZSdcbiAgICB9KTtcbiAgICBvcHRpb24uY2xvc2UgPSBjbG9zZTtcbiAgICBsaS5hcHBlbmQoY2xvc2UpO1xuXG4gICAgdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICBjbGFzczogXCJub3RpZmljYXRpb25fY29udGVudFwiXG4gICAgfSk7XG5cbiAgICBpZiAoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciB0aXRsZSA9ICQoJzxoNS8+Jywge1xuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxuICAgICAgfSk7XG4gICAgICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xuICAgICAgY29udGVudC5hcHBlbmQodGl0bGUpO1xuICAgIH1cblxuICAgIHZhciB0ZXh0ID0gJCgnPGRpdi8+Jywge1xuICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RleHRcIlxuICAgIH0pO1xuICAgIHRleHQuaHRtbChkYXRhLm1lc3NhZ2UpO1xuXG4gICAgaWYgKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxuICAgICAgfSk7XG4gICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xuICAgICAgdmFyIHdyYXAgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgIGNsYXNzOiBcIndyYXBcIlxuICAgICAgfSk7XG5cbiAgICAgIHdyYXAuYXBwZW5kKGltZyk7XG4gICAgICB3cmFwLmFwcGVuZCh0ZXh0KTtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHdyYXApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50LmFwcGVuZCh0ZXh0KTtcbiAgICB9XG4gICAgbGkuYXBwZW5kKGNvbnRlbnQpO1xuXG4gICAgLy9cbiAgICAvLyBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcbiAgICAvLyAgIHZhciB0aXRsZSA9ICQoJzxwLz4nLCB7XG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXG4gICAgLy8gICB9KTtcbiAgICAvLyAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XG4gICAgLy8gICBsaS5hcHBlbmQodGl0bGUpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XG4gICAgLy8gICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcbiAgICAvLyAgIH0pO1xuICAgIC8vICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XG4gICAgLy8gICBsaS5hcHBlbmQoaW1nKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xuICAgIC8vICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXG4gICAgLy8gfSk7XG4gICAgLy8gY29udGVudC5odG1sKGRhdGEubWVzc2FnZSk7XG4gICAgLy9cbiAgICAvLyBsaS5hcHBlbmQoY29udGVudCk7XG4gICAgLy9cbiAgICBjb250ZWluZXIuYXBwZW5kKGxpKTtcblxuICAgIGlmIChvcHRpb24udGltZSA+IDApIHtcbiAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChjbG9zZSksIG9wdGlvbi50aW1lKTtcbiAgICB9XG4gICAgbGkuZGF0YSgnb3B0aW9uJywgb3B0aW9uKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhbGVydDogYWxlcnQsXG4gICAgY29uZmlybTogY29uZmlybSxcbiAgICBub3RpZmk6IG5vdGlmaVxuICB9O1xuXG59KSgpO1xuXG5cbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkdGhpcyA9ICQodGhpcyk7XG4gIGVsID0gJCgkdGhpcy5hdHRyKCdocmVmJykpO1xuICBkYXRhID0gZWwuZGF0YSgpO1xuXG4gIGRhdGEucXVlc3Rpb24gPSBlbC5odG1sKCk7XG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcbn0pO1xuXG4kKCdbcmVmPWNvbmZpcm1dJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkdGhpcyA9ICQodGhpcyk7XG4gIGVsID0gJCgkdGhpcy5hdHRyKCdocmVmJykpO1xuICBkYXRhID0gZWwuZGF0YSgpO1xuICBkYXRhLnF1ZXN0aW9uID0gZWwuaHRtbCgpO1xuICBub3RpZmljYXRpb24uY29uZmlybShkYXRhKTtcbn0pO1xuXG5cbiQoJy5kaXNhYmxlZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJHRoaXMgPSAkKHRoaXMpO1xuICBkYXRhID0gJHRoaXMuZGF0YSgpO1xuICBpZiAoZGF0YVsnYnV0dG9uX3llcyddKSB7XG4gICAgZGF0YVsnYnV0dG9uWWVzJ10gPSBkYXRhWydidXR0b25feWVzJ107XG4gIH1cbiAgaWYgKGRhdGFbJ2J1dHRvbl95ZXMnXSA9PT0gZmFsc2UpIHtcbiAgICBkYXRhWydidXR0b25ZZXMnXSA9IGZhbHNlO1xuICB9XG5cbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xufSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcubW9kYWxzX29wZW4nLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuXG4gICAgLy/Qv9GA0Lgg0L7RgtC60YDRi9GC0LjQuCDRhNC+0YDQvNGLINGA0LXQs9C40YHRgtGA0LDRhtC40Lgg0LfQsNC60YDRi9GC0YwsINC10YHQu9C4INC+0YLRgNGL0YLQviAtINC/0L7Qv9Cw0L8g0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40Y8g0LrRg9C/0L7QvdCwINCx0LXQtyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4XG4gICAgdmFyIHBvcHVwID0gJChcImFbaHJlZj0nI3Nob3dwcm9tb2NvZGUtbm9yZWdpc3RlciddXCIpLmRhdGEoJ3BvcHVwJyk7XG4gICAgaWYgKHBvcHVwKSB7XG4gICAgICBwb3B1cC5jbG9zZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb3B1cCA9ICQoJ2Rpdi5wb3B1cF9jb250LCBkaXYucG9wdXBfYmFjaycpO1xuICAgICAgaWYgKHBvcHVwKSB7XG4gICAgICAgIHBvcHVwLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaHJlZiA9IHRoaXMuaHJlZi5zcGxpdCgnIycpO1xuICAgIGhyZWYgPSBocmVmW2hyZWYubGVuZ3RoIC0gMV07XG4gICAgdmFyIG5vdHlDbGFzcyA9ICQodGhpcykuZGF0YSgnbm90eWNsYXNzJyk7XG4gICAgdmFyIGNsYXNzX25hbWU9KGhyZWYuaW5kZXhPZigndmlkZW8nKSA9PT0gMCA/ICdtb2RhbHMtZnVsbF9zY3JlZW4nIDogJ25vdGlmeV93aGl0ZScpICsgJyAnICsgbm90eUNsYXNzO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgYnV0dG9uWWVzOiBmYWxzZSxcbiAgICAgIG5vdHlmeV9jbGFzczogXCJsb2FkaW5nIFwiICsgY2xhc3NfbmFtZSxcbiAgICAgIHF1ZXN0aW9uOiAnJ1xuICAgIH07XG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuXG4gICAgJC5nZXQoJy8nICsgaHJlZiwgZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgdmFyIGRhdGFfbXNnID0ge1xuICAgICAgICBidXR0b25ZZXM6IGZhbHNlLFxuICAgICAgICBub3R5ZnlfY2xhc3M6IGNsYXNzX25hbWUsXG4gICAgICAgIHF1ZXN0aW9uOiBkYXRhLmh0bWwsXG4gICAgICB9O1xuXG4gICAgICBpZiAoZGF0YS50aXRsZSkge1xuICAgICAgICBkYXRhX21zZ1sndGl0bGUnXT1kYXRhLnRpdGxlO1xuICAgICAgfVxuXG4gICAgICAvKmlmKGRhdGEuYnV0dG9uWWVzKXtcbiAgICAgICAgZGF0YV9tc2dbJ2J1dHRvblllcyddPWRhdGEuYnV0dG9uWWVzO1xuICAgICAgfSovXG4gICAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YV9tc2cpO1xuICAgICAgYWpheEZvcm0oJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykpO1xuICAgIH0sICdqc29uJyk7XG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcubW9kYWxzX3BvcHVwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAvL9C/0YDQuCDQutC70LjQutC1INCy0YHQv9C70YvQstCw0YjQutCwINGBINGC0LXQutGB0YLQvtC8XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgdGl0bGUgPSAkKHRoYXQpLmRhdGEoJ29yaWdpbmFsLWgnKTtcbiAgICBpZighdGl0bGUpdGl0bGU9XCJcIjtcbiAgICB2YXIgaHRtbCA9ICQoJyMnICsgJCh0aGF0KS5kYXRhKCdvcmlnaW5hbC1odG1sJykpLmh0bWwoKTtcbiAgICB2YXIgY29udGVudCA9IGh0bWwgPyBodG1sIDogJCh0aGF0KS5kYXRhKCdvcmlnaW5hbC10aXRsZScpO1xuICAgIHZhciBub3R5Q2xhc3MgPSAkKHRoYXQpLmRhdGEoJ25vdHljbGFzcycpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgYnV0dG9uWWVzOiBmYWxzZSxcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfd2hpdGUgXCIgKyBub3R5Q2xhc3MsXG4gICAgICBxdWVzdGlvbjogY29udGVudCxcbiAgICAgIHRpdGxlOiB0aXRsZVxuICAgIH07XG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KVxufSgpKTtcbiIsIiQoJy5mb290ZXItbWVudS10aXRsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgaWYgKCR0aGlzLmhhc0NsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJykpIHtcbiAgICAkdGhpcy5yZW1vdmVDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpXG4gIH0gZWxzZSB7XG4gICAgJCgnLmZvb3Rlci1tZW51LXRpdGxlX29wZW4nKS5yZW1vdmVDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpO1xuICAgICR0aGlzLmFkZENsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XG4gIH1cblxufSk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gc3Rhck5vbWluYXRpb24oaW5kZXgpIHtcbiAgICB2YXIgc3RhcnMgPSAkKFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiKTtcbiAgICBzdGFycy5hZGRDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XG4gICAgICBzdGFycy5lcShpKS5yZW1vdmVDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XG4gICAgfVxuICB9XG5cbiAgJChkb2N1bWVudCkub24oXCJtb3VzZW92ZXJcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XG4gIH0pLm9uKFwibW91c2VsZWF2ZVwiLCBcIi5yYXRpbmctd3JhcHBlclwiLCBmdW5jdGlvbiAoZSkge1xuICAgIHN0YXJOb21pbmF0aW9uKCQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCkpO1xuICB9KS5vbihcImNsaWNrXCIsIFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiLCBmdW5jdGlvbiAoZSkge1xuICAgIHN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xuXG4gICAgJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoJCh0aGlzKS5pbmRleCgpICsgMSk7XG4gIH0pO1xufSk7XG4iLCIvL9C40LfQsdGA0LDQvdC90L7QtVxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAkKFwiLmZhdm9yaXRlLWxpbmtcIikub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgc2VsZiA9ICQodGhpcyk7XG4gICAgdmFyIHR5cGUgPSBzZWxmLmF0dHIoXCJkYXRhLXN0YXRlXCIpLFxuICAgICAgYWZmaWxpYXRlX2lkID0gc2VsZi5hdHRyKFwiZGF0YS1hZmZpbGlhdGUtaWRcIik7XG5cbiAgICBpZiAoIWFmZmlsaWF0ZV9pZCkge1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgIHRpdGxlOiBsZyhcInJlZ2lzdHJhdGlvbl9pc19yZXF1aXJlZFwiKSxcbiAgICAgICAgbWVzc2FnZTogbGcoXCJhZGRfdG9fZmF2b3JpdGVfbWF5X29ubHlfcmVnaXN0ZXJlZF91c2VyXCIpLFxuICAgICAgICB0eXBlOiAnZXJyJ1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICB9XG5cbiAgICBpZiAoc2VsZi5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHNlbGYuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cbiAgICAvKmlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICBzZWxmLmZpbmQoXCIuaXRlbV9pY29uXCIpLnJlbW92ZUNsYXNzKFwibXV0ZWRcIik7XG4gICAgIH0qL1xuXG4gICAgJC5wb3N0KFwiL2FjY291bnQvZmF2b3JpdGVzXCIsIHtcbiAgICAgIFwidHlwZVwiOiB0eXBlLFxuICAgICAgXCJhZmZpbGlhdGVfaWRcIjogYWZmaWxpYXRlX2lkXG4gICAgfSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICBpZiAoZGF0YS5lcnJvcikge1xuICAgICAgICBzZWxmLmZpbmQoJ3N2ZycpLnJlbW92ZUNsYXNzKFwic3BpblwiKTtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTogZGF0YS5lcnJvciwgdHlwZTogJ2VycicsICd0aXRsZSc6IChkYXRhLnRpdGxlID8gZGF0YS50aXRsZSA6IGZhbHNlKX0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICBtZXNzYWdlOiBkYXRhLm1zZyxcbiAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAndGl0bGUnOiAoZGF0YS50aXRsZSA/IGRhdGEudGl0bGUgOiBmYWxzZSlcbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLmF0dHIoe1xuICAgICAgICBcImRhdGEtc3RhdGVcIjogZGF0YVtcImRhdGEtc3RhdGVcIl0sXG4gICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiOiBkYXRhWydkYXRhLW9yaWdpbmFsLXRpdGxlJ11cbiAgICAgIH0pO1xuXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gaW5fZmF2X29mZlwiKS5hZGRDbGFzcyhcImluX2Zhdl9vblwiKTtcbiAgICAgICAgc2VsZi5kYXRhKCdvcmlnaW5hbC10aXRsZScsIGxnKFwiZmF2b3JpdGVzX3Nob3BfcmVtb3ZlXCIpKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRlbGV0ZVwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gaW5fZmF2X29uXCIpLmFkZENsYXNzKFwiaW5fZmF2X29mZlwiKTtcbiAgICAgICAgc2VsZi5kYXRhKCdvcmlnaW5hbC10aXRsZScsIGxnKFwiZmF2b3JpdGVzX3Nob3BfYWRkXCIpKTtcbiAgICAgIH1cblxuICAgIH0sICdqc29uJykuZmFpbChmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgIG1lc3NhZ2U6IGxnKFwidGhlcmVfaXNfdGVjaG5pY2FsX3dvcmtzX25vd1wiKSxcbiAgICAgICAgdHlwZTogJ2VycidcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gaW5fZmF2X29mZlwiKS5hZGRDbGFzcyhcImluX2Zhdl9vblwiKTtcbiAgICAgICAgc2VsZi5kYXRhKCdvcmlnaW5hbC10aXRsZScsIGxnKFwiZmF2b3JpdGVzX3Nob3BfcmVtb3ZlXCIpKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRlbGV0ZVwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gaW5fZmF2X29uXCIpLmFkZENsYXNzKFwiaW5fZmF2X29mZlwiKTtcbiAgICAgICAgc2VsZi5kYXRhKCdvcmlnaW5hbC10aXRsZScsIGxnKFwiZmF2b3JpdGVzX3Nob3BfYWRkXCIpKTtcbiAgICAgIH1cblxuICAgIH0pXG4gIH0pO1xufSk7XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICQoJy5zY3JvbGxfdG8nKS5jbGljayhmdW5jdGlvbiAoZSkgeyAvLyDQu9C+0LLQuNC8INC60LvQuNC6INC/0L4g0YHRgdGL0LvQutC1INGBINC60LvQsNGB0YHQvtC8IGdvX3RvXG4gICAgdmFyIHNjcm9sbF9lbCA9ICQodGhpcykuYXR0cignaHJlZicpOyAvLyDQstC+0LfRjNC80LXQvCDRgdC+0LTQtdGA0LbQuNC80L7QtSDQsNGC0YDQuNCx0YPRgtCwIGhyZWYsINC00L7Qu9C20LXQvSDQsdGL0YLRjCDRgdC10LvQtdC60YLQvtGA0L7QvCwg0YIu0LUuINC90LDQv9GA0LjQvNC10YAg0L3QsNGH0LjQvdCw0YLRjNGB0Y8g0YEgIyDQuNC70LggLlxuICAgIHNjcm9sbF9lbCA9ICQoc2Nyb2xsX2VsKTtcbiAgICBpZiAoc2Nyb2xsX2VsLmxlbmd0aCAhPSAwKSB7IC8vINC/0YDQvtCy0LXRgNC40Lwg0YHRg9GJ0LXRgdGC0LLQvtCy0LDQvdC40LUg0Y3Qu9C10LzQtdC90YLQsCDRh9GC0L7QsdGLINC40LfQsdC10LbQsNGC0Ywg0L7RiNC40LHQutC4XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiBzY3JvbGxfZWwub2Zmc2V0KCkudG9wIC0gJCgnI2hlYWRlcj4qJykuZXEoMCkuaGVpZ2h0KCkgLSA1MH0sIDUwMCk7IC8vINCw0L3QuNC80LjRgNGD0LXQvCDRgdC60YDQvtC+0LvQuNC90LMg0Log0Y3Qu9C10LzQtdC90YLRgyBzY3JvbGxfZWxcbiAgICAgIGlmIChzY3JvbGxfZWwuaGFzQ2xhc3MoJ2FjY29yZGlvbicpICYmICFzY3JvbGxfZWwuaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgICBzY3JvbGxfZWwuZmluZCgnLmFjY29yZGlvbi1jb250cm9sJykuY2xpY2soKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlOyAvLyDQstGL0LrQu9GO0YfQsNC10Lwg0YHRgtCw0L3QtNCw0YDRgtC90L7QtSDQtNC10LnRgdGC0LLQuNC1XG4gIH0pO1xufSk7XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICQoXCJib2R5XCIpLm9uKCdjbGljaycsICcuc2V0X2NsaXBib2FyZCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgY29weVRvQ2xpcGJvYXJkKCR0aGlzLmRhdGEoJ2NsaXBib2FyZCcpLCAkdGhpcy5kYXRhKCdjbGlwYm9hcmQtbm90aWZ5JykpO1xuICB9KTtcblxuICBmdW5jdGlvbiBjb3B5VG9DbGlwYm9hcmQoY29kZSwgbXNnKSB7XG4gICAgdmFyICR0ZW1wID0gJChcIjxpbnB1dD5cIik7XG4gICAgJChcImJvZHlcIikuYXBwZW5kKCR0ZW1wKTtcbiAgICAkdGVtcC52YWwoY29kZSkuc2VsZWN0KCk7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJjb3B5XCIpO1xuICAgICR0ZW1wLnJlbW92ZSgpO1xuXG4gICAgaWYgKCFtc2cpIHtcbiAgICAgIG1zZyA9IGxnKFwiZGF0YV9jb3BpZWRfdG9fY2xpcGJvYXJkXCIpO1xuICAgIH1cbiAgICBub3RpZmljYXRpb24ubm90aWZpKHsndHlwZSc6ICdpbmZvJywgJ21lc3NhZ2UnOiBtc2csICd0aXRsZSc6IGxnKCdzdWNjZXNzJyl9KVxuICB9XG5cbiAgJChcImJvZHlcIikub24oJ2NsaWNrJywgXCJpbnB1dC5saW5rXCIsIGZ1bmN0aW9uICgpIHtcdC8vINC/0L7Qu9GD0YfQtdC90LjQtSDRhNC+0LrRg9GB0LAg0YLQtdC60YHRgtC+0LLRi9C8INC/0L7Qu9C10Lwt0YHRgdGL0LvQutC+0LlcbiAgICAkKHRoaXMpLnNlbGVjdCgpO1xuICB9KTtcbn0pO1xuIiwiLy/RgdC60LDRh9C40LLQsNC90LjQtSDQutCw0YDRgtC40L3QvtC6XG4oZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgIHZhciBpbWcgPSBkYXRhLmltZztcbiAgICBpbWcud3JhcCgnPGRpdiBjbGFzcz1cImRvd25sb2FkXCI+PC9kaXY+Jyk7XG4gICAgdmFyIHdyYXAgPSBpbWcucGFyZW50KCk7XG4gICAgJCgnLmRvd25sb2FkX3Rlc3QnKS5hcHBlbmQoZGF0YS5lbCk7XG4gICAgc2l6ZSA9IGRhdGEuZWwud2lkdGgoKSArIFwieFwiICsgZGF0YS5lbC5oZWlnaHQoKTtcblxuICAgIHc9ZGF0YS5lbC53aWR0aCgpKjAuODtcbiAgICBpbWdcbiAgICAgIC5oZWlnaHQoJ2F1dG8nKVxuICAgICAgLy8ud2lkdGgodylcbiAgICAgIC5jc3MoJ21heC13aWR0aCcsJzk5JScpO1xuXG5cbiAgICBkYXRhLmVsLnJlbW92ZSgpO1xuICAgIHdyYXAuYXBwZW5kKCc8c3Bhbj4nICsgc2l6ZSArICc8L3NwYW4+IDxhIGhyZWY9XCInICsgZGF0YS5zcmMgKyAnXCIgZG93bmxvYWQ+JytsZyhcImRvd25sb2FkXCIpKyc8L2E+Jyk7XG4gIH1cblxuICB2YXIgaW1ncyA9ICQoJy5kb3dubG9hZHNfaW1nIGltZycpO1xuICBpZihpbWdzLmxlbmd0aD09MClyZXR1cm47XG5cbiAgJCgnYm9keScpLmFwcGVuZCgnPGRpdiBjbGFzcz1kb3dubG9hZF90ZXN0PjwvZGl2PicpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGltZ3MubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaW1nID0gaW1ncy5lcShpKTtcbiAgICB2YXIgc3JjID0gaW1nLmF0dHIoJ3NyYycpO1xuICAgIGltYWdlID0gJCgnPGltZy8+Jywge1xuICAgICAgc3JjOiBzcmNcbiAgICB9KTtcbiAgICBkYXRhID0ge1xuICAgICAgc3JjOiBzcmMsXG4gICAgICBpbWc6IGltZyxcbiAgICAgIGVsOiBpbWFnZVxuICAgIH07XG4gICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcbiAgfVxufSkoKTtcblxuLy/Rh9GC0L4g0LEg0LjRhNGA0LXQudC80Ysg0Lgg0LrQsNGA0YLQuNC90LrQuCDQvdC1INCy0YvQu9Cw0LfQuNC70LhcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIC8qbV93ID0gJCgnLnRleHQtY29udGVudCcpLndpZHRoKClcbiAgIGlmIChtX3cgPCA1MCltX3cgPSBzY3JlZW4ud2lkdGggLSA0MCovXG4gIHZhciBtdz1zY3JlZW4ud2lkdGgtNDA7XG5cbiAgZnVuY3Rpb24gb3B0aW1hc2UoZWwpe1xuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnQoKTtcbiAgICBpZihwYXJlbnQubGVuZ3RoPT0wIHx8IHBhcmVudFswXS50YWdOYW1lPT1cIkFcIil7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKGVsLmhhc0NsYXNzKCdub19vcHRvbWl6ZScpKXJldHVybjtcblxuICAgIG1fdyA9IHBhcmVudC53aWR0aCgpLTMwO1xuICAgIHZhciB3PWVsLndpZHRoKCk7XG5cbiAgICAvL9Cx0LXQtyDRjdGC0L7Qs9C+INC/0LvRjtGJ0LjRgiDQsdCw0L3QtdGA0Ysg0LIg0LDQutCw0YDQtNC40L7QvdC1XG4gICAgaWYodzwzIHx8IG1fdzwzKXtcbiAgICAgIGVsXG4gICAgICAgIC5oZWlnaHQoJ2F1dG8nKVxuICAgICAgICAuY3NzKCdtYXgtd2lkdGgnLCc5OSUnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlbC53aWR0aCgnYXV0bycpO1xuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSU1HXCIgJiYgdz5lbC53aWR0aCgpKXc9ZWwud2lkdGgoKTtcblxuICAgIGlmIChtdz41MCAmJiBtX3cgPiBtdyltX3cgPSBtdztcbiAgICBpZiAodz5tX3cpIHtcbiAgICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpe1xuICAgICAgICBrID0gdyAvIG1fdztcbiAgICAgICAgZWwuaGVpZ2h0KGVsLmhlaWdodCgpIC8gayk7XG4gICAgICB9XG4gICAgICBlbC53aWR0aChtX3cpXG4gICAgfWVsc2V7XG4gICAgICBlbC53aWR0aCh3KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcbiAgICB2YXIgZWw9JCh0aGlzKTtcbiAgICBvcHRpbWFzZShlbCk7XG4gIH1cblxuICB2YXIgcCA9ICQoJy5jb250ZW50LXdyYXAgaW1nLC5jb250ZW50LXdyYXAgaWZyYW1lJyk7XG4gICQoJy5jb250ZW50LXdyYXAgaW1nOm5vdCgubm9fb3B0b21pemUpJykuaGVpZ2h0KCdhdXRvJyk7XG4gIC8vJCgnLmNvbnRhaW5lciBpbWcnKS53aWR0aCgnYXV0bycpO1xuICBmb3IgKGkgPSAwOyBpIDwgcC5sZW5ndGg7IGkrKykge1xuICAgIGVsID0gcC5lcShpKTtcbiAgICBpZihlbFswXS50YWdOYW1lPT1cIklGUkFNRVwiKSB7XG4gICAgICBvcHRpbWFzZShlbCk7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgc3JjPWVsLmF0dHIoJ3NyYycpO1xuICAgICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XG4gICAgICAgIHNyYzogc3JjXG4gICAgICB9KTtcbiAgICAgIGltYWdlLm9uKCdsb2FkJywgaW1nX2xvYWRfZmluaXNoLmJpbmQoZWwpKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5cbi8v0J/RgNC+0LLQtdGA0LrQsCDQsdC40YLRiyDQutCw0YDRgtC40L3QvtC6LlxuLy8gISEhISEhXG4vLyDQndGD0LbQvdC+INC/0YDQvtCy0LXRgNC40YLRjC4g0JLRi9C30YvQstCw0LvQviDQs9C70Y7QutC4INC/0YDQuCDQsNCy0YLQvtGA0LfQsNGG0LjQuCDRh9C10YDQtdC3INCk0JEg0L3QsCDRgdCw0YTQsNGA0Lhcbi8vICEhISEhIVxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBpZihkYXRhLnRhZ05hbWUpe1xuICAgICAgZGF0YT0kKGRhdGEpLmRhdGEoJ2RhdGEnKTtcbiAgICB9XG4gICAgdmFyIGltZz1kYXRhLmltZztcbiAgICAvL3ZhciB0bj1pbWdbMF0udGFnTmFtZTtcbiAgICAvL2lmICh0biE9J0lNRyd8fHRuIT0nRElWJ3x8dG4hPSdTUEFOJylyZXR1cm47XG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XG4gICAgICBpbWcuYXR0cignc3JjJywgZGF0YS5zcmMpO1xuICAgIH1lbHNle1xuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJytkYXRhLnNyYysnKScpO1xuICAgICAgaW1nLnJlbW92ZUNsYXNzKCdub19hdmEnKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0ZXN0SW1nKGltZ3Msbm9faW1nKXtcbiAgICBpZighaW1ncyB8fCBpbWdzLmxlbmd0aD09MClyZXR1cm47XG5cbiAgICBpZighbm9faW1nKW5vX2ltZz0nL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZyc7XG5cbiAgICBmb3IgKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspe1xuICAgICAgdmFyIGltZz1pbWdzLmVxKGkpO1xuICAgICAgaWYoaW1nLmhhc0NsYXNzKCdub19hdmEnKSl7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgZGF0YT17XG4gICAgICAgIGltZzppbWdcbiAgICAgIH07XG4gICAgICB2YXIgc3JjO1xuICAgICAgaWYoaW1nWzBdLnRhZ05hbWU9PVwiSU1HXCIpe1xuICAgICAgICBkYXRhLnR5cGU9MDtcbiAgICAgICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcbiAgICAgICAgaW1nLmF0dHIoJ3NyYycsbm9faW1nKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBkYXRhLnR5cGU9MTtcbiAgICAgICAgc3JjPWltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKTtcbiAgICAgICAgaWYoIXNyYyljb250aW51ZTtcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCd1cmwoXCInLCcnKTtcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCdcIiknLCcnKTtcbiAgICAgICAgLy/QsiDRgdGE0YTQsNGA0Lgg0LIg0LzQsNC6INC+0YEg0LHQtdC3INC60L7QstGL0YfQtdC6LiDQstC10LfQtNC1INGBINC60LDQstGL0YfQutCw0LzQuFxuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybCgnLCcnKTtcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCcpJywnJyk7XG4gICAgICAgIGltZy5hZGRDbGFzcygnbm9fYXZhJyk7XG4gICAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytub19pbWcrJyknKTtcbiAgICAgIH1cbiAgICAgIGRhdGEuc3JjPXNyYztcbiAgICAgIHZhciBpbWFnZT0kKCc8aW1nLz4nLHtcbiAgICAgICAgc3JjOnNyY1xuICAgICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKTtcbiAgICAgIGltYWdlLmRhdGEoJ2RhdGEnLGRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIC8v0YLQtdGB0YIg0LvQvtCz0L4g0LzQsNCz0LDQt9C40L3QsFxuICB2YXIgaW1ncz0kKCdzZWN0aW9uOm5vdCgubmF2aWdhdGlvbiknKTtcbiAgaW1ncz1pbWdzLmZpbmQoJy5sb2dvIGltZycpO1xuICB0ZXN0SW1nKGltZ3MsJy9pbWFnZXMvdGVtcGxhdGUtbG9nby5qcGcnKTtcblxuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvLC5zY3JvbGxfYm94LWF2YXRhcicpO1xuICB0ZXN0SW1nKGltZ3MsJy9pbWFnZXMvbm9fYXZhX3NxdWFyZS5wbmcnKTtcbn0pO1xuIiwiLy/QtdGB0LvQuCDQvtGC0LrRgNGL0YLQviDQutCw0Log0LTQvtGH0LXRgNC90LXQtVxuKGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF3aW5kb3cub3BlbmVyKXJldHVybjtcbiAgdHJ5IHtcbiAgICBocmVmID0gd2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmO1xuICAgIGlmIChcbiAgICAgIGhyZWYuaW5kZXhPZignYWNjb3VudC9vZmZsaW5lJykgPiAwXG4gICAgKSB7XG4gICAgICB3aW5kb3cucHJpbnQoKVxuICAgIH1cblxuICAgIGlmIChkb2N1bWVudC5yZWZlcnJlci5pbmRleE9mKCdzZWNyZXRkaXNjb3VudGVyJykgPCAwKXJldHVybjtcblxuICAgIGlmIChcbiAgICAgIGhyZWYuaW5kZXhPZignc29jaWFscycpID4gMCB8fFxuICAgICAgaHJlZi5pbmRleE9mKCdsb2dpbicpID4gMCB8fFxuICAgICAgaHJlZi5pbmRleE9mKCdhZG1pbicpID4gMCB8fFxuICAgICAgaHJlZi5pbmRleE9mKCdhY2NvdW50JykgPiAwXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGhyZWYuaW5kZXhPZignc3RvcmUnKSA+IDAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKSA+IDAgfHwgaHJlZi5pbmRleE9mKCdzZXR0aW5ncycpID4gMCkge1xuICAgICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmID0gbG9jYXRpb24uaHJlZjtcbiAgICB9XG4gICAgd2luZG93LmNsb3NlKCk7XG4gIH0gY2F0Y2ggKGVycikge1xuXG4gIH1cbn0pKCk7XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKGV2dCkge1xuICAgIHZhciBmaWxlID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XG4gICAgdmFyIGYgPSBmaWxlWzBdO1xuICAgIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cbiAgICBpZiAoIWYudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgZGF0YSA9IHtcbiAgICAgICdlbCc6IHRoaXMsXG4gICAgICAnZic6IGZcbiAgICB9O1xuICAgIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpbWcgPSAkKCdbZm9yPVwiJyArIGRhdGEuZWwubmFtZSArICdcIl0nKTtcbiAgICAgICAgaWYgKGltZy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgaW1nLmF0dHIoJ3NyYycsIGUudGFyZ2V0LnJlc3VsdClcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KShkYXRhKTtcbiAgICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXG4gICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZik7XG4gIH0pO1xuXG4gICQoJy5kdWJsaWNhdGVfdmFsdWUnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgdmFyIHNlbCA9ICQoJHRoaXMuZGF0YSgnc2VsZWN0b3InKSk7XG4gICAgc2VsLnZhbCh0aGlzLnZhbHVlKTtcbiAgfSlcbn0pO1xuIiwiXG5mdW5jdGlvbiBnZXRDb29raWUobikge1xuICByZXR1cm4gdW5lc2NhcGUoKFJlZ0V4cChuICsgJz0oW147XSspJykuZXhlYyhkb2N1bWVudC5jb29raWUpIHx8IFsxLCAnJ10pWzFdKTtcbn1cblxuZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsIHZhbHVlLCBkYXlzKSB7XG4gIHZhciBleHBpcmVzID0gJyc7XG4gIGlmIChkYXlzKSB7XG4gICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlO1xuICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgZGF5cyk7XG4gICAgICBleHBpcmVzID0gJzsgZXhwaXJlcz0nICsgZGF0ZS50b1VUQ1N0cmluZygpO1xuICB9XG4gIGRvY3VtZW50LmNvb2tpZSA9IG5hbWUgKyBcIj1cIiArIGVzY2FwZSAoIHZhbHVlICkgKyBleHBpcmVzO1xufVxuXG5mdW5jdGlvbiBlcmFzZUNvb2tpZShuYW1lKXtcbiAgdmFyIGNvb2tpZV9zdHJpbmcgPSBuYW1lICsgXCI9MFwiICtcIjsgZXhwaXJlcz1XZWQsIDAxIE9jdCAyMDE3IDAwOjAwOjAwIEdNVFwiO1xuICBkb2N1bWVudC5jb29raWUgPSBjb29raWVfc3RyaW5nO1xufVxuXG5kb2N1bWVudC5jb29raWUuc3BsaXQoXCI7XCIpLmZvckVhY2goZnVuY3Rpb24oYykgeyBkb2N1bWVudC5jb29raWUgPSBjLnJlcGxhY2UoL14gKy8sIFwiXCIpLnJlcGxhY2UoLz0uKi8sIFwiPTtleHBpcmVzPVwiICsgbmV3IERhdGUoKS50b1VUQ1N0cmluZygpICsgXCI7cGF0aD0vXCIpOyB9KTsiLCIoZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIHRhYmxlcyA9ICQoJ3RhYmxlLmFkYXB0aXZlJyk7XG5cbiAgaWYgKHRhYmxlcy5sZW5ndGggPT0gMClyZXR1cm47XG5cbiAgZm9yICh2YXIgaSA9IDA7IHRhYmxlcy5sZW5ndGggPiBpOyBpKyspIHtcbiAgICB2YXIgdGFibGUgPSB0YWJsZXMuZXEoaSk7XG4gICAgdmFyIHRoID0gdGFibGUuZmluZCgndGhlYWQnKTtcbiAgICBpZiAodGgubGVuZ3RoID09IDApIHtcbiAgICAgIHRoID0gdGFibGUuZmluZCgndHInKS5lcSgwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGggPSB0aC5maW5kKCd0cicpLmVxKDApO1xuICAgIH1cbiAgICB0aCA9IHRoLmFkZENsYXNzKCd0YWJsZS1oZWFkZXInKS5maW5kKCd0ZCx0aCcpO1xuXG4gICAgdmFyIHRyID0gdGFibGUuZmluZCgndHInKS5ub3QoJy50YWJsZS1oZWFkZXInKTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGgubGVuZ3RoOyBqKyspIHtcbiAgICAgIHZhciBrID0gaiArIDE7XG4gICAgICB2YXIgdGQgPSB0ci5maW5kKCd0ZDpudGgtY2hpbGQoJyArIGsgKyAnKScpO1xuICAgICAgdGQuYXR0cignbGFiZWwnLCB0aC5lcShqKS50ZXh0KCkpO1xuICAgIH1cbiAgfVxuXG59KSh3aW5kb3csIGRvY3VtZW50KTtcbiIsIjtcbiQoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIG9uUmVtb3ZlKCl7XG4gICAgJHRoaXM9JCh0aGlzKTtcbiAgICBwb3N0PXtcbiAgICAgIGlkOiR0aGlzLmF0dHIoJ3VpZCcpLFxuICAgICAgdHlwZTokdGhpcy5hdHRyKCdtb2RlJylcbiAgICB9O1xuICAgICQucG9zdCgkdGhpcy5hdHRyKCd1cmwnKSxwb3N0LGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgaWYoZGF0YSAmJiBkYXRhPT0nZXJyJyl7XG4gICAgICAgIG1zZz0kdGhpcy5kYXRhKCdyZW1vdmUtZXJyb3InKTtcbiAgICAgICAgaWYoIW1zZyl7XG4gICAgICAgICAgbXNnPSfQndC10LLQvtC30LzQvtC20L3QviDRg9C00LDQu9C40YLRjCDRjdC70LXQvNC10L3Rgic7XG4gICAgICAgIH1cbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTptc2csdHlwZTonZXJyJ30pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG1vZGU9JHRoaXMuYXR0cignbW9kZScpO1xuICAgICAgaWYoIW1vZGUpe1xuICAgICAgICBtb2RlPSdybSc7XG4gICAgICB9XG5cbiAgICAgIGlmKG1vZGU9PSdybScpIHtcbiAgICAgICAgcm0gPSAkdGhpcy5jbG9zZXN0KCcudG9fcmVtb3ZlJyk7XG4gICAgICAgIHJtX2NsYXNzID0gcm0uYXR0cigncm1fY2xhc3MnKTtcbiAgICAgICAgaWYgKHJtX2NsYXNzKSB7XG4gICAgICAgICAgJChybV9jbGFzcykucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBybS5yZW1vdmUoKTtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0KPRgdC/0LXRiNC90L7QtSDRg9C00LDQu9C10L3QuNC1LicsdHlwZTonaW5mbyd9KVxuICAgICAgfVxuICAgICAgaWYobW9kZT09J3JlbG9hZCcpe1xuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgbG9jYXRpb24uaHJlZj1sb2NhdGlvbi5ocmVmO1xuICAgICAgfVxuICAgIH0pLmZhaWwoZnVuY3Rpb24oKXtcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Ce0YjQuNCx0LrQsCDRg9C00LDQu9C90LjRjycsdHlwZTonZXJyJ30pO1xuICAgIH0pXG4gIH1cblxuICAkKCdib2R5Jykub24oJ2NsaWNrJywnLmFqYXhfcmVtb3ZlJyxmdW5jdGlvbigpe1xuICAgIG5vdGlmaWNhdGlvbi5jb25maXJtKHtcbiAgICAgIGNhbGxiYWNrWWVzOm9uUmVtb3ZlLFxuICAgICAgb2JqOiQodGhpcyksXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibm90aWZ5X2JveC1hbGVydFwiXG4gICAgfSlcbiAgfSk7XG5cbn0pO1xuXG4iLCJpZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKG9UaGlzKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyDQsdC70LjQttCw0LnRiNC40Lkg0LDQvdCw0LvQvtCzINCy0L3Rg9GC0YDQtdC90L3QtdC5INGE0YPQvdC60YbQuNC4XG4gICAgICAvLyBJc0NhbGxhYmxlINCyIEVDTUFTY3JpcHQgNVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgLSB3aGF0IGlzIHRyeWluZyB0byBiZSBib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcbiAgICB9XG5cbiAgICB2YXIgYUFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgZlRvQmluZCA9IHRoaXMsXG4gICAgICBmTk9QID0gZnVuY3Rpb24gKCkge1xuICAgICAgfSxcbiAgICAgIGZCb3VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1AgJiYgb1RoaXNcbiAgICAgICAgICAgID8gdGhpc1xuICAgICAgICAgICAgOiBvVGhpcyxcbiAgICAgICAgICBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgfTtcblxuICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XG4gICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG5cbiAgICByZXR1cm4gZkJvdW5kO1xuICB9O1xufVxuXG5pZiAoIVN0cmluZy5wcm90b3R5cGUudHJpbSkge1xuICAoZnVuY3Rpb24oKSB7XG4gICAgLy8g0JLRi9GA0LXQt9Cw0LXQvCBCT00g0Lgg0L3QtdGA0LDQt9GA0YvQstC90YvQuSDQv9GA0L7QsdC10LtcbiAgICBTdHJpbmcucHJvdG90eXBlLnRyaW0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL15bXFxzXFx1RkVGRlxceEEwXSt8W1xcc1xcdUZFRkZcXHhBMF0rJC9nLCAnJyk7XG4gICAgfTtcbiAgfSkoKTtcbn0iLCIoZnVuY3Rpb24gKCkge1xuICAkKCcuaGlkZGVuLWxpbmsnKS5yZXBsYWNlV2l0aChmdW5jdGlvbiAoKSB7XG4gICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgIHJldHVybiAnPGEgaHJlZj1cIicgKyAkdGhpcy5kYXRhKCdsaW5rJykgKyAnXCIgcmVsPVwiJysgJHRoaXMuZGF0YSgncmVsJykgKydcIiBjbGFzcz1cIicgKyAkdGhpcy5hdHRyKCdjbGFzcycpICsgJ1wiPicgKyAkdGhpcy50ZXh0KCkgKyAnPC9hPic7XG4gIH0pXG59KSgpO1xuIiwidmFyIHN0b3JlX3BvaW50cyA9IChmdW5jdGlvbigpe1xuXG5cbiAgICBmdW5jdGlvbiBjaGFuZ2VDb3VudHJ5KCl7XG4gICAgICAgIHZhciB0aGF0ID0gJCgnI3N0b3JlX3BvaW50X2NvdW50cnknKTtcbiAgICAgICAgaWYgKHRoYXQubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0T3B0aW9ucyA9ICQodGhhdCkuZmluZCgnb3B0aW9uJyk7XG4gICAgICAgICAgICB2YXIgZGF0YSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmRhdGEoJ2NpdGllcycpLFxuICAgICAgICAgICAgICAgIHBvaW50cyA9ICQoJyNzdG9yZS1wb2ludHMnKSxcbiAgICAgICAgICAgICAgICBjb3VudHJ5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgdGhhdCkuYXR0cigndmFsdWUnKTtcbiAgICAgICAgICAgIGlmIChzZWxlY3RPcHRpb25zLmxlbmd0aCA+IDEgJiYgZGF0YSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0b3JlX3BvaW50X2NpdHknKTtcbiAgICAgICAgICAgICAgICAgICAgLy92YXIgb3B0aW9ucyA9ICc8b3B0aW9uIHZhbHVlPVwiXCI+0JLRi9Cx0LXRgNC40YLQtSDQs9C+0YDQvtC0PC9vcHRpb24+JztcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIGl0ZW0gKyAnXCI+JyArIGl0ZW0gKyAnPC9vcHRpb24+JztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdC5pbm5lckhUTUwgPSBvcHRpb25zO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vJChwb2ludHMpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgICAgIC8vIGdvb2dsZU1hcC5zaG93TWFwKCk7XG4gICAgICAgICAgICAvLyBnb29nbGVNYXAuc2hvd01hcmtlcihjb3VudHJ5LCAnJyk7XG4gICAgICAgICAgICBjaGFuZ2VDaXR5KCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoYW5nZUNpdHkoKXtcbiAgICAgICAgaWYgKHR5cGVvZiBnb29nbGVNYXAgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0aGF0ID0gJCgnI3N0b3JlX3BvaW50X2NpdHknKTtcbiAgICAgICAgaWYgKHRoYXQubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgY2l0eSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmF0dHIoJ3ZhbHVlJyksXG4gICAgICAgICAgICAgICAgY291bnRyeSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsICQoJyNzdG9yZV9wb2ludF9jb3VudHJ5JykpLmF0dHIoJ3ZhbHVlJyksXG4gICAgICAgICAgICAgICAgcG9pbnRzID0gJCgnI3N0b3JlLXBvaW50cycpO1xuICAgICAgICAgICAgaWYgKGNvdW50cnkgJiYgY2l0eSkge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IHBvaW50cy5maW5kKCcuc3RvcmUtcG9pbnRzX19wb2ludHNfcm93JyksXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXAuc2hvd01hcmtlcihjb3VudHJ5LCBjaXR5KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJC5lYWNoKGl0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIGRpdikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoJChkaXYpLmRhdGEoJ2NpdHknKSA9PSBjaXR5ICYmICQoZGl2KS5kYXRhKCdjb3VudHJ5JykgPT0gY291bnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChkaXYpLnJlbW92ZUNsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50c19yb3ctaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZGl2KS5hZGRDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHNfcm93LWhpZGRlbicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgJChwb2ludHMpLnJlbW92ZUNsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50cy1oaWRkZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwLnNob3dNYXAoKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICQocG9pbnRzKS5hZGRDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHMtaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5oaWRlTWFwKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKHBvaW50cykuYWRkQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzLWhpZGRlbicpO1xuICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5oaWRlTWFwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL9C00LvRjyDRgtC+0YfQtdC6INC/0YDQvtC00LDQtiwg0YHQvtCx0YvRgtC40Y8g0L3QsCDQstGL0LHQvtGAINGB0LXQu9C10LrRgtC+0LJcbiAgICB2YXIgYm9keSA9ICQoJ2JvZHknKTtcblxuICAgICQoYm9keSkub24oJ2NoYW5nZScsICcjc3RvcmVfcG9pbnRfY291bnRyeScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY2hhbmdlQ291bnRyeSgpO1xuICAgIH0pO1xuXG5cbiAgICAkKGJvZHkpLm9uKCdjaGFuZ2UnLCAnI3N0b3JlX3BvaW50X2NpdHknLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGNoYW5nZUNpdHkoKTtcblxuICAgIH0pO1xuXG4gICAgY2hhbmdlQ291bnRyeSgpO1xuXG5cbn0pKCk7XG5cblxuXG5cbiIsInZhciBoYXNoVGFncyA9IChmdW5jdGlvbigpe1xuXG4gICAgZnVuY3Rpb24gbG9jYXRpb25IYXNoKCkge1xuICAgICAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXG4gICAgICAgIGlmIChoYXNoICE9IFwiXCIpIHtcbiAgICAgICAgICAgIHZhciBoYXNoQm9keSA9IGhhc2guc3BsaXQoXCI/XCIpO1xuICAgICAgICAgICAgaWYgKGhhc2hCb2R5WzFdKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gbG9jYXRpb24ub3JpZ2luICsgbG9jYXRpb24ucGF0aG5hbWUgKyAnPycgKyBoYXNoQm9keVsxXSArIGhhc2hCb2R5WzBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbGlua3MgPSAkKCdhW2hyZWY9XCInICsgaGFzaEJvZHlbMF0gKyAnXCJdLm1vZGFsc19vcGVuJyk7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmtzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAkKGxpbmtzWzBdKS5jbGljaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiaGFzaGNoYW5nZVwiLCBmdW5jdGlvbigpe1xuICAgICAgICBsb2NhdGlvbkhhc2goKTtcbiAgICB9KTtcblxuICAgIGxvY2F0aW9uSGFzaCgpXG5cbn0pKCk7IiwidmFyIHBsdWdpbnMgPSAoZnVuY3Rpb24oKXtcbiAgICB2YXIgaWNvbkNsb3NlID0gJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHg9XCIwcHhcIiB5PVwiMHB4XCIgd2lkdGg9XCIxMnB4XCIgaGVpZ2h0PVwiMTJweFwiIHZpZXdCb3g9XCIwIDAgMzU3IDM1N1wiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzNTcgMzU3O1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+PGc+JytcbiAgICAgICAgJzxnIGlkPVwiY2xvc2VcIj48cG9seWdvbiBwb2ludHM9XCIzNTcsMzUuNyAzMjEuMywwIDE3OC41LDE0Mi44IDM1LjcsMCAwLDM1LjcgMTQyLjgsMTc4LjUgMCwzMjEuMyAzNS43LDM1NyAxNzguNSwyMTQuMiAzMjEuMywzNTcgMzU3LDMyMS4zICAgICAyMTQuMiwxNzguNSAgIFwiIGZpbGw9XCIjRkZGRkZGXCIvPicrXG4gICAgICAgICc8L3N2Zz4nO1xuICAgIHZhciB0ZW1wbGF0ZT0nPGRpdiBjbGFzcz1cInBhZ2Utd3JhcCBpbnN0YWxsLXBsdWdpbl9pbm5lclwiPicrXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJpbnN0YWxsLXBsdWdpbl90ZXh0XCI+e3t0ZXh0fX08L2Rpdj4nK1xuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaW5zdGFsbC1wbHVnaW5fYnV0dG9uc1wiPicrXG4gICAgICAgICAgICAgICAgICAgICc8YSBjbGFzcz1cImJ0biBidG4tbWluaSBidG4tcm91bmQgaW5zdGFsbC1wbHVnaW5fYnV0dG9uXCIgIGhyZWY9XCJ7e2hyZWZ9fVwiIHRhcmdldD1cIl9ibGFua1wiPnt7dGl0bGV9fTwvYT4nK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImluc3RhbGwtcGx1Z2luX2J1dHRvbi1jbG9zZVwiPicraWNvbkNsb3NlKyc8L2Rpdj4nK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nK1xuICAgICAgICAgICAgJzwvZGl2Pic7XG4gICAgdmFyIHBsdWdpbkluc3RhbGxEaXZDbGFzcyA9ICdpbnN0YWxsLXBsdWdpbi1pbmRleCc7XG4gICAgdmFyIHBsdWdpbkluc3RhbGxEaXZBY2NvdW50Q2xhc3MgPSAnaW5zdGFsbC1wbHVnaW4tYWNjb3VudCc7XG4gICAgdmFyIGNvb2tpZVBhbmVsSGlkZGVuID0gJ3NkLWluc3RhbGwtcGx1Z2luLWhpZGRlbic7XG4gICAgdmFyIGNvb2tpZUFjY291bnREaXZIaWRkZW4gPSAnc2QtaW5zdGFsbC1wbHVnaW4tYWNjb3VudC1oaWRkZW4nO1xuICAgIHZhciBpc09wZXJhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCcgT1BSLycpID49IDA7XG4gICAgdmFyIGlzWWFuZGV4ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCcgWWFCcm93c2VyLycpID49IDA7XG4gICAgdmFyIGV4dGVuc2lvbnMgPSB7XG4gICAgICAgICdjaHJvbWUnOiB7XG4gICAgICAgICAgICAnZGl2X2lkJzogJ3NkX2Nocm9tZV9hcHAnLFxuICAgICAgICAgICAgJ3VzZWQnOiAhIXdpbmRvdy5jaHJvbWUgJiYgd2luZG93LmNocm9tZS53ZWJzdG9yZSAhPT0gbnVsbCAmJiAhaXNPcGVyYSAmJiAhaXNZYW5kZXgsXG4gICAgICAgICAgICAvLyd0ZXh0JzogbGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIiksXG4gICAgICAgICAgICAnaHJlZic6ICdodHRwczovL2Nocm9tZS5nb29nbGUuY29tL3dlYnN0b3JlL2RldGFpbC9zZWNyZXRkaXNjb3VudGVycnUtJUUyJTgwJTkzLSVEMCVCQSVEMSU4RCVEMSU4OCVEMCVCMS9tY29saGhlbWZhY3BvYWdoamlkaGxpZWNwaWFucG5qbicsXG4gICAgICAgICAgICAnaW5zdGFsbF9idXR0b25fY2xhc3MnOiAncGx1Z2luLWJyb3dzZXJzLWxpbmstY2hyb21lJ1xuICAgICAgICB9LFxuICAgICAgICAnZmlyZWZveCc6IHtcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2RfZmlyZWZveF9hcHAnLFxuICAgICAgICAgICAgJ3VzZWQnOiAgdHlwZW9mIEluc3RhbGxUcmlnZ2VyICE9PSAndW5kZWZpbmVkJyxcbiAgICAgICAgICAgIC8vJ3RleHQnOmxnKFwiaW5zdGFsbF9wbHVnaW5fYW5kX2l0X3dpbGxfbm90aWNlX2Fib3V0X2Nhc2hiYWNrXCIpLFxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMubW96aWxsYS5vcmcvcnUvZmlyZWZveC9hZGRvbi9zZWNyZXRkaXNjb3VudGVyLSVEMCVCQSVEMSU4RCVEMSU4OCVEMCVCMSVEMSU4RCVEMCVCQS0lRDElODElRDAlQjUlRDElODAlRDAlQjIlRDAlQjglRDElODEvJyxcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay1maXJlZm94J1xuICAgICAgICB9LFxuICAgICAgICAnb3BlcmEnOiB7XG4gICAgICAgICAgICAnZGl2X2lkJzogJ3NkX29wZXJhX2FwcCcsXG4gICAgICAgICAgICAndXNlZCc6IGlzT3BlcmEsXG4gICAgICAgICAgICAvLyd0ZXh0JzpsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcbiAgICAgICAgICAgICdocmVmJzogJ2h0dHBzOi8vYWRkb25zLm9wZXJhLmNvbS9ydS9leHRlbnNpb25zLz9yZWY9cGFnZScsXG4gICAgICAgICAgICAnaW5zdGFsbF9idXR0b25fY2xhc3MnOiAncGx1Z2luLWJyb3dzZXJzLWxpbmstb3BlcmEnXG4gICAgICAgIH0sXG4gICAgICAgICd5YW5kZXgnOiB7XG4gICAgICAgICAgICAnZGl2X2lkJzogJ3NkX3lhbmRleF9hcHAnLFxuICAgICAgICAgICAgJ3VzZWQnOiBpc1lhbmRleCxcbiAgICAgICAgICAgIC8vJ3RleHQnOmxnKFwiaW5zdGFsbF9wbHVnaW5fYW5kX2l0X3dpbGxfbm90aWNlX2Fib3V0X2Nhc2hiYWNrXCIpLFxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMub3BlcmEuY29tL3J1L2V4dGVuc2lvbnMvP3JlZj1wYWdlJyxcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay15YW5kZXgnXG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBmdW5jdGlvbiBzZXRQYW5lbChocmVmKSB7XG4gICAgICAgIHZhciBwbHVnaW5JbnN0YWxsUGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGx1Z2luLWluc3RhbGwtcGFuZWwnKTsvL9Cy0YvQstC+0LTQuNGC0Ywg0LvQuCDQv9Cw0L3QtdC70YxcbiAgICAgICAgaWYgKHBsdWdpbkluc3RhbGxQYW5lbCAmJiBnZXRDb29raWUoY29va2llUGFuZWxIaWRkZW4pICE9PSAnMScgKSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7dGV4dH19JywgbGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIikpO1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7e2hyZWZ9fScsIGhyZWYpO1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7e3RpdGxlfX0nLCBsZyhcImluc3RhbGxfcGx1Z2luXCIpKTtcbiAgICAgICAgICAgIHZhciBzZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xuICAgICAgICAgICAgc2VjdGlvbi5jbGFzc05hbWUgPSAnaW5zdGFsbC1wbHVnaW4nO1xuICAgICAgICAgICAgc2VjdGlvbi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcblxuICAgICAgICAgICAgdmFyIHNlY29uZGxpbmUgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJy5oZWFkZXItc2Vjb25kbGluZScpO1xuICAgICAgICAgICAgaWYgKHNlY29uZGxpbmUpIHtcbiAgICAgICAgICAgICAgICBzZWNvbmRsaW5lLmFwcGVuZENoaWxkKHNlY3Rpb24pO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbnN0YWxsLXBsdWdpbl9idXR0b24tY2xvc2UnKS5vbmNsaWNrID0gY2xvc2VDbGljaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldEJ1dHRvbkluc3RhbGxWaXNpYmxlKGJ1dHRvbkNsYXNzKSB7XG4gICAgICAgICQoJy4nICsgcGx1Z2luSW5zdGFsbERpdkNsYXNzKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICQoJy4nICsgYnV0dG9uQ2xhc3MpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgaWYgKGdldENvb2tpZShjb29raWVBY2NvdW50RGl2SGlkZGVuKSAhPT0gJzEnKSB7XG4gICAgICAgICAgICAkKCcuJyArIHBsdWdpbkluc3RhbGxEaXZBY2NvdW50Q2xhc3MpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsb3NlQ2xpY2soKXtcbiAgICAgICAgJCgnLmluc3RhbGwtcGx1Z2luJykuYWRkQ2xhc3MoJ2luc3RhbGwtcGx1Z2luX2hpZGRlbicpO1xuICAgICAgICBzZXRDb29raWUoY29va2llUGFuZWxIaWRkZW4sICcxJywgMTApO1xuICAgIH1cblxuICAgICQoJy5pbnN0YWxsLXBsdWdpbi1hY2NvdW50LWxhdGVyJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNldENvb2tpZShjb29raWVBY2NvdW50RGl2SGlkZGVuLCAnMScsIDEwKTtcbiAgICAgICAgJCgnLmluc3RhbGwtcGx1Z2luLWFjY291bnQnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfSk7XG5cblxuICAgIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBleHRlbnNpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnNba2V5XS51c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcHBJZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyMnK2V4dGVuc2lvbnNba2V5XS5kaXZfaWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWFwcElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL9C/0LDQvdC10LvRjCDRgSDQutC90L7Qv9C60L7QuVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0UGFuZWwoZXh0ZW5zaW9uc1trZXldLmhyZWYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/QvdCwINCz0LvQsNCy0L3QvtC5ICDQuCDQsiAvYWNjb3VudCDQsdC70L7QutC4INGBINC40LrQvtC90LrQsNC80Lgg0Lgg0LrQvdC+0L/QutCw0LzQuFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0QnV0dG9uSW5zdGFsbFZpc2libGUoZXh0ZW5zaW9uc1trZXldLmluc3RhbGxfYnV0dG9uX2NsYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMzAwMCk7XG4gICAgfTtcblxufSkoKTsiLCIvKipcbiAqIEBhdXRob3IgemhpeGluIHdlbiA8d2VuemhpeGluMjAxMEBnbWFpbC5jb20+XG4gKiBAdmVyc2lvbiAxLjIuMVxuICpcbiAqIGh0dHA6Ly93ZW56aGl4aW4ubmV0LmNuL3AvbXVsdGlwbGUtc2VsZWN0L1xuICovXG5cbihmdW5jdGlvbiAoJCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gaXQgb25seSBkb2VzICclcycsIGFuZCByZXR1cm4gJycgd2hlbiBhcmd1bWVudHMgYXJlIHVuZGVmaW5lZFxuICAgIHZhciBzcHJpbnRmID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIGZsYWcgPSB0cnVlLFxuICAgICAgICAgICAgaSA9IDE7XG5cbiAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoLyVzL2csIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmcgPSBhcmdzW2krK107XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGZsYWcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXJnO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZsYWcgPyBzdHIgOiAnJztcbiAgICB9O1xuXG4gICAgdmFyIHJlbW92ZURpYWNyaXRpY3MgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXAgPSBbXG4gICAgICAgICAgICB7J2Jhc2UnOidBJywgJ2xldHRlcnMnOi9bXFx1MDA0MVxcdTI0QjZcXHVGRjIxXFx1MDBDMFxcdTAwQzFcXHUwMEMyXFx1MUVBNlxcdTFFQTRcXHUxRUFBXFx1MUVBOFxcdTAwQzNcXHUwMTAwXFx1MDEwMlxcdTFFQjBcXHUxRUFFXFx1MUVCNFxcdTFFQjJcXHUwMjI2XFx1MDFFMFxcdTAwQzRcXHUwMURFXFx1MUVBMlxcdTAwQzVcXHUwMUZBXFx1MDFDRFxcdTAyMDBcXHUwMjAyXFx1MUVBMFxcdTFFQUNcXHUxRUI2XFx1MUUwMFxcdTAxMDRcXHUwMjNBXFx1MkM2Rl0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidBQScsJ2xldHRlcnMnOi9bXFx1QTczMl0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidBRScsJ2xldHRlcnMnOi9bXFx1MDBDNlxcdTAxRkNcXHUwMUUyXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0FPJywnbGV0dGVycyc6L1tcXHVBNzM0XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0FVJywnbGV0dGVycyc6L1tcXHVBNzM2XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0FWJywnbGV0dGVycyc6L1tcXHVBNzM4XFx1QTczQV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidBWScsJ2xldHRlcnMnOi9bXFx1QTczQ10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidCJywgJ2xldHRlcnMnOi9bXFx1MDA0MlxcdTI0QjdcXHVGRjIyXFx1MUUwMlxcdTFFMDRcXHUxRTA2XFx1MDI0M1xcdTAxODJcXHUwMTgxXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0MnLCAnbGV0dGVycyc6L1tcXHUwMDQzXFx1MjRCOFxcdUZGMjNcXHUwMTA2XFx1MDEwOFxcdTAxMEFcXHUwMTBDXFx1MDBDN1xcdTFFMDhcXHUwMTg3XFx1MDIzQlxcdUE3M0VdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonRCcsICdsZXR0ZXJzJzovW1xcdTAwNDRcXHUyNEI5XFx1RkYyNFxcdTFFMEFcXHUwMTBFXFx1MUUwQ1xcdTFFMTBcXHUxRTEyXFx1MUUwRVxcdTAxMTBcXHUwMThCXFx1MDE4QVxcdTAxODlcXHVBNzc5XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0RaJywnbGV0dGVycyc6L1tcXHUwMUYxXFx1MDFDNF0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidEeicsJ2xldHRlcnMnOi9bXFx1MDFGMlxcdTAxQzVdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonRScsICdsZXR0ZXJzJzovW1xcdTAwNDVcXHUyNEJBXFx1RkYyNVxcdTAwQzhcXHUwMEM5XFx1MDBDQVxcdTFFQzBcXHUxRUJFXFx1MUVDNFxcdTFFQzJcXHUxRUJDXFx1MDExMlxcdTFFMTRcXHUxRTE2XFx1MDExNFxcdTAxMTZcXHUwMENCXFx1MUVCQVxcdTAxMUFcXHUwMjA0XFx1MDIwNlxcdTFFQjhcXHUxRUM2XFx1MDIyOFxcdTFFMUNcXHUwMTE4XFx1MUUxOFxcdTFFMUFcXHUwMTkwXFx1MDE4RV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidGJywgJ2xldHRlcnMnOi9bXFx1MDA0NlxcdTI0QkJcXHVGRjI2XFx1MUUxRVxcdTAxOTFcXHVBNzdCXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0cnLCAnbGV0dGVycyc6L1tcXHUwMDQ3XFx1MjRCQ1xcdUZGMjdcXHUwMUY0XFx1MDExQ1xcdTFFMjBcXHUwMTFFXFx1MDEyMFxcdTAxRTZcXHUwMTIyXFx1MDFFNFxcdTAxOTNcXHVBN0EwXFx1QTc3RFxcdUE3N0VdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonSCcsICdsZXR0ZXJzJzovW1xcdTAwNDhcXHUyNEJEXFx1RkYyOFxcdTAxMjRcXHUxRTIyXFx1MUUyNlxcdTAyMUVcXHUxRTI0XFx1MUUyOFxcdTFFMkFcXHUwMTI2XFx1MkM2N1xcdTJDNzVcXHVBNzhEXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0knLCAnbGV0dGVycyc6L1tcXHUwMDQ5XFx1MjRCRVxcdUZGMjlcXHUwMENDXFx1MDBDRFxcdTAwQ0VcXHUwMTI4XFx1MDEyQVxcdTAxMkNcXHUwMTMwXFx1MDBDRlxcdTFFMkVcXHUxRUM4XFx1MDFDRlxcdTAyMDhcXHUwMjBBXFx1MUVDQVxcdTAxMkVcXHUxRTJDXFx1MDE5N10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidKJywgJ2xldHRlcnMnOi9bXFx1MDA0QVxcdTI0QkZcXHVGRjJBXFx1MDEzNFxcdTAyNDhdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonSycsICdsZXR0ZXJzJzovW1xcdTAwNEJcXHUyNEMwXFx1RkYyQlxcdTFFMzBcXHUwMUU4XFx1MUUzMlxcdTAxMzZcXHUxRTM0XFx1MDE5OFxcdTJDNjlcXHVBNzQwXFx1QTc0MlxcdUE3NDRcXHVBN0EyXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0wnLCAnbGV0dGVycyc6L1tcXHUwMDRDXFx1MjRDMVxcdUZGMkNcXHUwMTNGXFx1MDEzOVxcdTAxM0RcXHUxRTM2XFx1MUUzOFxcdTAxM0JcXHUxRTNDXFx1MUUzQVxcdTAxNDFcXHUwMjNEXFx1MkM2MlxcdTJDNjBcXHVBNzQ4XFx1QTc0NlxcdUE3ODBdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonTEonLCdsZXR0ZXJzJzovW1xcdTAxQzddL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonTGonLCdsZXR0ZXJzJzovW1xcdTAxQzhdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonTScsICdsZXR0ZXJzJzovW1xcdTAwNERcXHUyNEMyXFx1RkYyRFxcdTFFM0VcXHUxRTQwXFx1MUU0MlxcdTJDNkVcXHUwMTlDXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J04nLCAnbGV0dGVycyc6L1tcXHUwMDRFXFx1MjRDM1xcdUZGMkVcXHUwMUY4XFx1MDE0M1xcdTAwRDFcXHUxRTQ0XFx1MDE0N1xcdTFFNDZcXHUwMTQ1XFx1MUU0QVxcdTFFNDhcXHUwMjIwXFx1MDE5RFxcdUE3OTBcXHVBN0E0XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J05KJywnbGV0dGVycyc6L1tcXHUwMUNBXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J05qJywnbGV0dGVycyc6L1tcXHUwMUNCXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J08nLCAnbGV0dGVycyc6L1tcXHUwMDRGXFx1MjRDNFxcdUZGMkZcXHUwMEQyXFx1MDBEM1xcdTAwRDRcXHUxRUQyXFx1MUVEMFxcdTFFRDZcXHUxRUQ0XFx1MDBENVxcdTFFNENcXHUwMjJDXFx1MUU0RVxcdTAxNENcXHUxRTUwXFx1MUU1MlxcdTAxNEVcXHUwMjJFXFx1MDIzMFxcdTAwRDZcXHUwMjJBXFx1MUVDRVxcdTAxNTBcXHUwMUQxXFx1MDIwQ1xcdTAyMEVcXHUwMUEwXFx1MUVEQ1xcdTFFREFcXHUxRUUwXFx1MUVERVxcdTFFRTJcXHUxRUNDXFx1MUVEOFxcdTAxRUFcXHUwMUVDXFx1MDBEOFxcdTAxRkVcXHUwMTg2XFx1MDE5RlxcdUE3NEFcXHVBNzRDXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J09JJywnbGV0dGVycyc6L1tcXHUwMUEyXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J09PJywnbGV0dGVycyc6L1tcXHVBNzRFXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J09VJywnbGV0dGVycyc6L1tcXHUwMjIyXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1AnLCAnbGV0dGVycyc6L1tcXHUwMDUwXFx1MjRDNVxcdUZGMzBcXHUxRTU0XFx1MUU1NlxcdTAxQTRcXHUyQzYzXFx1QTc1MFxcdUE3NTJcXHVBNzU0XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1EnLCAnbGV0dGVycyc6L1tcXHUwMDUxXFx1MjRDNlxcdUZGMzFcXHVBNzU2XFx1QTc1OFxcdTAyNEFdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonUicsICdsZXR0ZXJzJzovW1xcdTAwNTJcXHUyNEM3XFx1RkYzMlxcdTAxNTRcXHUxRTU4XFx1MDE1OFxcdTAyMTBcXHUwMjEyXFx1MUU1QVxcdTFFNUNcXHUwMTU2XFx1MUU1RVxcdTAyNENcXHUyQzY0XFx1QTc1QVxcdUE3QTZcXHVBNzgyXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1MnLCAnbGV0dGVycyc6L1tcXHUwMDUzXFx1MjRDOFxcdUZGMzNcXHUxRTlFXFx1MDE1QVxcdTFFNjRcXHUwMTVDXFx1MUU2MFxcdTAxNjBcXHUxRTY2XFx1MUU2MlxcdTFFNjhcXHUwMjE4XFx1MDE1RVxcdTJDN0VcXHVBN0E4XFx1QTc4NF0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidUJywgJ2xldHRlcnMnOi9bXFx1MDA1NFxcdTI0QzlcXHVGRjM0XFx1MUU2QVxcdTAxNjRcXHUxRTZDXFx1MDIxQVxcdTAxNjJcXHUxRTcwXFx1MUU2RVxcdTAxNjZcXHUwMUFDXFx1MDFBRVxcdTAyM0VcXHVBNzg2XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1RaJywnbGV0dGVycyc6L1tcXHVBNzI4XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1UnLCAnbGV0dGVycyc6L1tcXHUwMDU1XFx1MjRDQVxcdUZGMzVcXHUwMEQ5XFx1MDBEQVxcdTAwREJcXHUwMTY4XFx1MUU3OFxcdTAxNkFcXHUxRTdBXFx1MDE2Q1xcdTAwRENcXHUwMURCXFx1MDFEN1xcdTAxRDVcXHUwMUQ5XFx1MUVFNlxcdTAxNkVcXHUwMTcwXFx1MDFEM1xcdTAyMTRcXHUwMjE2XFx1MDFBRlxcdTFFRUFcXHUxRUU4XFx1MUVFRVxcdTFFRUNcXHUxRUYwXFx1MUVFNFxcdTFFNzJcXHUwMTcyXFx1MUU3NlxcdTFFNzRcXHUwMjQ0XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1YnLCAnbGV0dGVycyc6L1tcXHUwMDU2XFx1MjRDQlxcdUZGMzZcXHUxRTdDXFx1MUU3RVxcdTAxQjJcXHVBNzVFXFx1MDI0NV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidWWScsJ2xldHRlcnMnOi9bXFx1QTc2MF0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidXJywgJ2xldHRlcnMnOi9bXFx1MDA1N1xcdTI0Q0NcXHVGRjM3XFx1MUU4MFxcdTFFODJcXHUwMTc0XFx1MUU4NlxcdTFFODRcXHUxRTg4XFx1MkM3Ml0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidYJywgJ2xldHRlcnMnOi9bXFx1MDA1OFxcdTI0Q0RcXHVGRjM4XFx1MUU4QVxcdTFFOENdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonWScsICdsZXR0ZXJzJzovW1xcdTAwNTlcXHUyNENFXFx1RkYzOVxcdTFFRjJcXHUwMEREXFx1MDE3NlxcdTFFRjhcXHUwMjMyXFx1MUU4RVxcdTAxNzhcXHUxRUY2XFx1MUVGNFxcdTAxQjNcXHUwMjRFXFx1MUVGRV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidaJywgJ2xldHRlcnMnOi9bXFx1MDA1QVxcdTI0Q0ZcXHVGRjNBXFx1MDE3OVxcdTFFOTBcXHUwMTdCXFx1MDE3RFxcdTFFOTJcXHUxRTk0XFx1MDFCNVxcdTAyMjRcXHUyQzdGXFx1MkM2QlxcdUE3NjJdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYScsICdsZXR0ZXJzJzovW1xcdTAwNjFcXHUyNEQwXFx1RkY0MVxcdTFFOUFcXHUwMEUwXFx1MDBFMVxcdTAwRTJcXHUxRUE3XFx1MUVBNVxcdTFFQUJcXHUxRUE5XFx1MDBFM1xcdTAxMDFcXHUwMTAzXFx1MUVCMVxcdTFFQUZcXHUxRUI1XFx1MUVCM1xcdTAyMjdcXHUwMUUxXFx1MDBFNFxcdTAxREZcXHUxRUEzXFx1MDBFNVxcdTAxRkJcXHUwMUNFXFx1MDIwMVxcdTAyMDNcXHUxRUExXFx1MUVBRFxcdTFFQjdcXHUxRTAxXFx1MDEwNVxcdTJDNjVcXHUwMjUwXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2FhJywnbGV0dGVycyc6L1tcXHVBNzMzXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2FlJywnbGV0dGVycyc6L1tcXHUwMEU2XFx1MDFGRFxcdTAxRTNdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYW8nLCdsZXR0ZXJzJzovW1xcdUE3MzVdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYXUnLCdsZXR0ZXJzJzovW1xcdUE3MzddL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYXYnLCdsZXR0ZXJzJzovW1xcdUE3MzlcXHVBNzNCXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2F5JywnbGV0dGVycyc6L1tcXHVBNzNEXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2InLCAnbGV0dGVycyc6L1tcXHUwMDYyXFx1MjREMVxcdUZGNDJcXHUxRTAzXFx1MUUwNVxcdTFFMDdcXHUwMTgwXFx1MDE4M1xcdTAyNTNdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYycsICdsZXR0ZXJzJzovW1xcdTAwNjNcXHUyNEQyXFx1RkY0M1xcdTAxMDdcXHUwMTA5XFx1MDEwQlxcdTAxMERcXHUwMEU3XFx1MUUwOVxcdTAxODhcXHUwMjNDXFx1QTczRlxcdTIxODRdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonZCcsICdsZXR0ZXJzJzovW1xcdTAwNjRcXHUyNEQzXFx1RkY0NFxcdTFFMEJcXHUwMTBGXFx1MUUwRFxcdTFFMTFcXHUxRTEzXFx1MUUwRlxcdTAxMTFcXHUwMThDXFx1MDI1NlxcdTAyNTdcXHVBNzdBXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2R6JywnbGV0dGVycyc6L1tcXHUwMUYzXFx1MDFDNl0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidlJywgJ2xldHRlcnMnOi9bXFx1MDA2NVxcdTI0RDRcXHVGRjQ1XFx1MDBFOFxcdTAwRTlcXHUwMEVBXFx1MUVDMVxcdTFFQkZcXHUxRUM1XFx1MUVDM1xcdTFFQkRcXHUwMTEzXFx1MUUxNVxcdTFFMTdcXHUwMTE1XFx1MDExN1xcdTAwRUJcXHUxRUJCXFx1MDExQlxcdTAyMDVcXHUwMjA3XFx1MUVCOVxcdTFFQzdcXHUwMjI5XFx1MUUxRFxcdTAxMTlcXHUxRTE5XFx1MUUxQlxcdTAyNDdcXHUwMjVCXFx1MDFERF0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidmJywgJ2xldHRlcnMnOi9bXFx1MDA2NlxcdTI0RDVcXHVGRjQ2XFx1MUUxRlxcdTAxOTJcXHVBNzdDXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2cnLCAnbGV0dGVycyc6L1tcXHUwMDY3XFx1MjRENlxcdUZGNDdcXHUwMUY1XFx1MDExRFxcdTFFMjFcXHUwMTFGXFx1MDEyMVxcdTAxRTdcXHUwMTIzXFx1MDFFNVxcdTAyNjBcXHVBN0ExXFx1MUQ3OVxcdUE3N0ZdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonaCcsICdsZXR0ZXJzJzovW1xcdTAwNjhcXHUyNEQ3XFx1RkY0OFxcdTAxMjVcXHUxRTIzXFx1MUUyN1xcdTAyMUZcXHUxRTI1XFx1MUUyOVxcdTFFMkJcXHUxRTk2XFx1MDEyN1xcdTJDNjhcXHUyQzc2XFx1MDI2NV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidodicsJ2xldHRlcnMnOi9bXFx1MDE5NV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidpJywgJ2xldHRlcnMnOi9bXFx1MDA2OVxcdTI0RDhcXHVGRjQ5XFx1MDBFQ1xcdTAwRURcXHUwMEVFXFx1MDEyOVxcdTAxMkJcXHUwMTJEXFx1MDBFRlxcdTFFMkZcXHUxRUM5XFx1MDFEMFxcdTAyMDlcXHUwMjBCXFx1MUVDQlxcdTAxMkZcXHUxRTJEXFx1MDI2OFxcdTAxMzFdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonaicsICdsZXR0ZXJzJzovW1xcdTAwNkFcXHUyNEQ5XFx1RkY0QVxcdTAxMzVcXHUwMUYwXFx1MDI0OV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidrJywgJ2xldHRlcnMnOi9bXFx1MDA2QlxcdTI0REFcXHVGRjRCXFx1MUUzMVxcdTAxRTlcXHUxRTMzXFx1MDEzN1xcdTFFMzVcXHUwMTk5XFx1MkM2QVxcdUE3NDFcXHVBNzQzXFx1QTc0NVxcdUE3QTNdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonbCcsICdsZXR0ZXJzJzovW1xcdTAwNkNcXHUyNERCXFx1RkY0Q1xcdTAxNDBcXHUwMTNBXFx1MDEzRVxcdTFFMzdcXHUxRTM5XFx1MDEzQ1xcdTFFM0RcXHUxRTNCXFx1MDE3RlxcdTAxNDJcXHUwMTlBXFx1MDI2QlxcdTJDNjFcXHVBNzQ5XFx1QTc4MVxcdUE3NDddL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonbGonLCdsZXR0ZXJzJzovW1xcdTAxQzldL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonbScsICdsZXR0ZXJzJzovW1xcdTAwNkRcXHUyNERDXFx1RkY0RFxcdTFFM0ZcXHUxRTQxXFx1MUU0M1xcdTAyNzFcXHUwMjZGXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J24nLCAnbGV0dGVycyc6L1tcXHUwMDZFXFx1MjRERFxcdUZGNEVcXHUwMUY5XFx1MDE0NFxcdTAwRjFcXHUxRTQ1XFx1MDE0OFxcdTFFNDdcXHUwMTQ2XFx1MUU0QlxcdTFFNDlcXHUwMTlFXFx1MDI3MlxcdTAxNDlcXHVBNzkxXFx1QTdBNV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOiduaicsJ2xldHRlcnMnOi9bXFx1MDFDQ10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidvJywgJ2xldHRlcnMnOi9bXFx1MDA2RlxcdTI0REVcXHVGRjRGXFx1MDBGMlxcdTAwRjNcXHUwMEY0XFx1MUVEM1xcdTFFRDFcXHUxRUQ3XFx1MUVENVxcdTAwRjVcXHUxRTREXFx1MDIyRFxcdTFFNEZcXHUwMTREXFx1MUU1MVxcdTFFNTNcXHUwMTRGXFx1MDIyRlxcdTAyMzFcXHUwMEY2XFx1MDIyQlxcdTFFQ0ZcXHUwMTUxXFx1MDFEMlxcdTAyMERcXHUwMjBGXFx1MDFBMVxcdTFFRERcXHUxRURCXFx1MUVFMVxcdTFFREZcXHUxRUUzXFx1MUVDRFxcdTFFRDlcXHUwMUVCXFx1MDFFRFxcdTAwRjhcXHUwMUZGXFx1MDI1NFxcdUE3NEJcXHVBNzREXFx1MDI3NV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidvaScsJ2xldHRlcnMnOi9bXFx1MDFBM10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidvdScsJ2xldHRlcnMnOi9bXFx1MDIyM10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidvbycsJ2xldHRlcnMnOi9bXFx1QTc0Rl0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidwJywnbGV0dGVycyc6L1tcXHUwMDcwXFx1MjRERlxcdUZGNTBcXHUxRTU1XFx1MUU1N1xcdTAxQTVcXHUxRDdEXFx1QTc1MVxcdUE3NTNcXHVBNzU1XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3EnLCdsZXR0ZXJzJzovW1xcdTAwNzFcXHUyNEUwXFx1RkY1MVxcdTAyNEJcXHVBNzU3XFx1QTc1OV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidyJywnbGV0dGVycyc6L1tcXHUwMDcyXFx1MjRFMVxcdUZGNTJcXHUwMTU1XFx1MUU1OVxcdTAxNTlcXHUwMjExXFx1MDIxM1xcdTFFNUJcXHUxRTVEXFx1MDE1N1xcdTFFNUZcXHUwMjREXFx1MDI3RFxcdUE3NUJcXHVBN0E3XFx1QTc4M10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidzJywnbGV0dGVycyc6L1tcXHUwMDczXFx1MjRFMlxcdUZGNTNcXHUwMERGXFx1MDE1QlxcdTFFNjVcXHUwMTVEXFx1MUU2MVxcdTAxNjFcXHUxRTY3XFx1MUU2M1xcdTFFNjlcXHUwMjE5XFx1MDE1RlxcdTAyM0ZcXHVBN0E5XFx1QTc4NVxcdTFFOUJdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzondCcsJ2xldHRlcnMnOi9bXFx1MDA3NFxcdTI0RTNcXHVGRjU0XFx1MUU2QlxcdTFFOTdcXHUwMTY1XFx1MUU2RFxcdTAyMUJcXHUwMTYzXFx1MUU3MVxcdTFFNkZcXHUwMTY3XFx1MDFBRFxcdTAyODhcXHUyQzY2XFx1QTc4N10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOid0eicsJ2xldHRlcnMnOi9bXFx1QTcyOV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOid1JywnbGV0dGVycyc6L1tcXHUwMDc1XFx1MjRFNFxcdUZGNTVcXHUwMEY5XFx1MDBGQVxcdTAwRkJcXHUwMTY5XFx1MUU3OVxcdTAxNkJcXHUxRTdCXFx1MDE2RFxcdTAwRkNcXHUwMURDXFx1MDFEOFxcdTAxRDZcXHUwMURBXFx1MUVFN1xcdTAxNkZcXHUwMTcxXFx1MDFENFxcdTAyMTVcXHUwMjE3XFx1MDFCMFxcdTFFRUJcXHUxRUU5XFx1MUVFRlxcdTFFRURcXHUxRUYxXFx1MUVFNVxcdTFFNzNcXHUwMTczXFx1MUU3N1xcdTFFNzVcXHUwMjg5XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3YnLCdsZXR0ZXJzJzovW1xcdTAwNzZcXHUyNEU1XFx1RkY1NlxcdTFFN0RcXHUxRTdGXFx1MDI4QlxcdUE3NUZcXHUwMjhDXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3Z5JywnbGV0dGVycyc6L1tcXHVBNzYxXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3cnLCdsZXR0ZXJzJzovW1xcdTAwNzdcXHUyNEU2XFx1RkY1N1xcdTFFODFcXHUxRTgzXFx1MDE3NVxcdTFFODdcXHUxRTg1XFx1MUU5OFxcdTFFODlcXHUyQzczXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3gnLCdsZXR0ZXJzJzovW1xcdTAwNzhcXHUyNEU3XFx1RkY1OFxcdTFFOEJcXHUxRThEXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3knLCdsZXR0ZXJzJzovW1xcdTAwNzlcXHUyNEU4XFx1RkY1OVxcdTFFRjNcXHUwMEZEXFx1MDE3N1xcdTFFRjlcXHUwMjMzXFx1MUU4RlxcdTAwRkZcXHUxRUY3XFx1MUU5OVxcdTFFRjVcXHUwMUI0XFx1MDI0RlxcdTFFRkZdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzoneicsJ2xldHRlcnMnOi9bXFx1MDA3QVxcdTI0RTlcXHVGRjVBXFx1MDE3QVxcdTFFOTFcXHUwMTdDXFx1MDE3RVxcdTFFOTNcXHUxRTk1XFx1MDFCNlxcdTAyMjVcXHUwMjQwXFx1MkM2Q1xcdUE3NjNdL2d9XG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKGRlZmF1bHREaWFjcml0aWNzUmVtb3ZhbE1hcFtpXS5sZXR0ZXJzLCBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXBbaV0uYmFzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3RyO1xuXG4gICB9O1xuXG4gICAgZnVuY3Rpb24gTXVsdGlwbGVTZWxlY3QoJGVsLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIG5hbWUgPSAkZWwuYXR0cignbmFtZScpIHx8IG9wdGlvbnMubmFtZSB8fCAnJztcblxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICAgIC8vIGhpZGUgc2VsZWN0IGVsZW1lbnRcbiAgICAgICAgdGhpcy4kZWwgPSAkZWwuaGlkZSgpO1xuXG4gICAgICAgIC8vIGxhYmVsIGVsZW1lbnRcbiAgICAgICAgdGhpcy4kbGFiZWwgPSB0aGlzLiRlbC5jbG9zZXN0KCdsYWJlbCcpO1xuICAgICAgICBpZiAodGhpcy4kbGFiZWwubGVuZ3RoID09PSAwICYmIHRoaXMuJGVsLmF0dHIoJ2lkJykpIHtcbiAgICAgICAgICAgIHRoaXMuJGxhYmVsID0gJChzcHJpbnRmKCdsYWJlbFtmb3I9XCIlc1wiXScsIHRoaXMuJGVsLmF0dHIoJ2lkJykucmVwbGFjZSgvOi9nLCAnXFxcXDonKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVzdG9yZSBjbGFzcyBhbmQgdGl0bGUgZnJvbSBzZWxlY3QgZWxlbWVudFxuICAgICAgICB0aGlzLiRwYXJlbnQgPSAkKHNwcmludGYoXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1zLXBhcmVudCAlc1wiICVzLz4nLFxuICAgICAgICAgICAgJGVsLmF0dHIoJ2NsYXNzJykgfHwgJycsXG4gICAgICAgICAgICBzcHJpbnRmKCd0aXRsZT1cIiVzXCInLCAkZWwuYXR0cigndGl0bGUnKSkpKTtcblxuICAgICAgICAvLyBhZGQgcGxhY2Vob2xkZXIgdG8gY2hvaWNlIGJ1dHRvblxuICAgICAgICB0aGlzLiRjaG9pY2UgPSAkKHNwcmludGYoW1xuICAgICAgICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cIm1zLWNob2ljZVwiPicsXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwicGxhY2Vob2xkZXJcIj4lczwvc3Bhbj4nLFxuICAgICAgICAgICAgICAgICc8ZGl2PjwvZGl2PicsXG4gICAgICAgICAgICAgICAgJzwvYnV0dG9uPidcbiAgICAgICAgICAgIF0uam9pbignJyksXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIpKTtcblxuICAgICAgICAvLyBkZWZhdWx0IHBvc2l0aW9uIGlzIGJvdHRvbVxuICAgICAgICB0aGlzLiRkcm9wID0gJChzcHJpbnRmKCc8ZGl2IGNsYXNzPVwibXMtZHJvcCAlc1wiJXM+PC9kaXY+JyxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbixcbiAgICAgICAgICAgIHNwcmludGYoJyBzdHlsZT1cIndpZHRoOiAlc1wiJywgdGhpcy5vcHRpb25zLmRyb3BXaWR0aCkpKTtcblxuICAgICAgICB0aGlzLiRlbC5hZnRlcih0aGlzLiRwYXJlbnQpO1xuICAgICAgICB0aGlzLiRwYXJlbnQuYXBwZW5kKHRoaXMuJGNob2ljZSk7XG4gICAgICAgIHRoaXMuJHBhcmVudC5hcHBlbmQodGhpcy4kZHJvcCk7XG5cbiAgICAgICAgaWYgKHRoaXMuJGVsLnByb3AoJ2Rpc2FibGVkJykpIHtcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRwYXJlbnQuY3NzKCd3aWR0aCcsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMud2lkdGggfHxcbiAgICAgICAgICAgIHRoaXMuJGVsLmNzcygnd2lkdGgnKSB8fFxuICAgICAgICAgICAgdGhpcy4kZWwub3V0ZXJXaWR0aCgpICsgMjApO1xuXG4gICAgICAgIHRoaXMuc2VsZWN0QWxsTmFtZSA9ICdkYXRhLW5hbWU9XCJzZWxlY3RBbGwnICsgbmFtZSArICdcIic7XG4gICAgICAgIHRoaXMuc2VsZWN0R3JvdXBOYW1lID0gJ2RhdGEtbmFtZT1cInNlbGVjdEdyb3VwJyArIG5hbWUgKyAnXCInO1xuICAgICAgICB0aGlzLnNlbGVjdEl0ZW1OYW1lID0gJ2RhdGEtbmFtZT1cInNlbGVjdEl0ZW0nICsgbmFtZSArICdcIic7XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMua2VlcE9wZW4pIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpWzBdID09PSB0aGF0LiRjaG9pY2VbMF0gfHxcbiAgICAgICAgICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50cygnLm1zLWNob2ljZScpWzBdID09PSB0aGF0LiRjaG9pY2VbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoKCQoZS50YXJnZXQpWzBdID09PSB0aGF0LiRkcm9wWzBdIHx8XG4gICAgICAgICAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJy5tcy1kcm9wJylbMF0gIT09IHRoYXQuJGRyb3BbMF0gJiYgZS50YXJnZXQgIT09ICRlbFswXSkgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLmlzT3Blbikge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBNdWx0aXBsZVNlbGVjdC5wcm90b3R5cGUgPSB7XG4gICAgICAgIGNvbnN0cnVjdG9yOiBNdWx0aXBsZVNlbGVjdCxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJHVsID0gJCgnPHVsPjwvdWw+Jyk7XG5cbiAgICAgICAgICAgIHRoaXMuJGRyb3AuaHRtbCgnJyk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5hcHBlbmQoW1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1zLXNlYXJjaFwiPicsXG4gICAgICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBhdXRvY29ycmVjdD1cIm9mZlwiIGF1dG9jYXBpdGlsaXplPVwib2ZmXCIgc3BlbGxjaGVjaz1cImZhbHNlXCI+JyxcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PiddLmpvaW4oJycpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zZWxlY3RBbGwgJiYgIXRoaXMub3B0aW9ucy5zaW5nbGUpIHtcbiAgICAgICAgICAgICAgICAkdWwuYXBwZW5kKFtcbiAgICAgICAgICAgICAgICAgICAgJzxsaSBjbGFzcz1cIm1zLXNlbGVjdC1hbGxcIj4nLFxuICAgICAgICAgICAgICAgICAgICAnPGxhYmVsPicsXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAlcyAvPiAnLCB0aGlzLnNlbGVjdEFsbE5hbWUpLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0QWxsRGVsaW1pdGVyWzBdLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0QWxsVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNlbGVjdEFsbERlbGltaXRlclsxXSxcbiAgICAgICAgICAgICAgICAgICAgJzwvbGFiZWw+JyxcbiAgICAgICAgICAgICAgICAgICAgJzwvbGk+J1xuICAgICAgICAgICAgICAgIF0uam9pbignJykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmVhY2godGhpcy4kZWwuY2hpbGRyZW4oKSwgZnVuY3Rpb24gKGksIGVsbSkge1xuICAgICAgICAgICAgICAgICR1bC5hcHBlbmQodGhhdC5vcHRpb25Ub0h0bWwoaSwgZWxtKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICR1bC5hcHBlbmQoc3ByaW50ZignPGxpIGNsYXNzPVwibXMtbm8tcmVzdWx0c1wiPiVzPC9saT4nLCB0aGlzLm9wdGlvbnMubm9NYXRjaGVzRm91bmQpKTtcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuYXBwZW5kKCR1bCk7XG5cbiAgICAgICAgICAgIHRoaXMuJGRyb3AuZmluZCgndWwnKS5jc3MoJ21heC1oZWlnaHQnLCB0aGlzLm9wdGlvbnMubWF4SGVpZ2h0ICsgJ3B4Jyk7XG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoJy5tdWx0aXBsZScpLmNzcygnd2lkdGgnLCB0aGlzLm9wdGlvbnMubXVsdGlwbGVXaWR0aCArICdweCcpO1xuXG4gICAgICAgICAgICB0aGlzLiRzZWFyY2hJbnB1dCA9IHRoaXMuJGRyb3AuZmluZCgnLm1zLXNlYXJjaCBpbnB1dCcpO1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsID0gdGhpcy4kZHJvcC5maW5kKCdpbnB1dFsnICsgdGhpcy5zZWxlY3RBbGxOYW1lICsgJ10nKTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3VwcyA9IHRoaXMuJGRyb3AuZmluZCgnaW5wdXRbJyArIHRoaXMuc2VsZWN0R3JvdXBOYW1lICsgJ10nKTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zID0gdGhpcy4kZHJvcC5maW5kKCdpbnB1dFsnICsgdGhpcy5zZWxlY3RJdGVtTmFtZSArICddOmVuYWJsZWQnKTtcbiAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcyA9IHRoaXMuJGRyb3AuZmluZCgnaW5wdXRbJyArIHRoaXMuc2VsZWN0SXRlbU5hbWUgKyAnXTpkaXNhYmxlZCcpO1xuICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzID0gdGhpcy4kZHJvcC5maW5kKCcubXMtbm8tcmVzdWx0cycpO1xuXG4gICAgICAgICAgICB0aGlzLmV2ZW50cygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTZWxlY3RBbGwodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0cnVlKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc09wZW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvcHRpb25Ub0h0bWw6IGZ1bmN0aW9uIChpLCBlbG0sIGdyb3VwLCBncm91cERpc2FibGVkKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJGVsbSA9ICQoZWxtKSxcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gJGVsbS5hdHRyKCdjbGFzcycpIHx8ICcnLFxuICAgICAgICAgICAgICAgIHRpdGxlID0gc3ByaW50ZigndGl0bGU9XCIlc1wiJywgJGVsbS5hdHRyKCd0aXRsZScpKSxcbiAgICAgICAgICAgICAgICBtdWx0aXBsZSA9IHRoaXMub3B0aW9ucy5tdWx0aXBsZSA/ICdtdWx0aXBsZScgOiAnJyxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICB0eXBlID0gdGhpcy5vcHRpb25zLnNpbmdsZSA/ICdyYWRpbycgOiAnY2hlY2tib3gnO1xuXG4gICAgICAgICAgICBpZiAoJGVsbS5pcygnb3B0aW9uJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAkZWxtLnZhbCgpLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdGhhdC5vcHRpb25zLnRleHRUZW1wbGF0ZSgkZWxtKSxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSAkZWxtLnByb3AoJ3NlbGVjdGVkJyksXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlID0gc3ByaW50Zignc3R5bGU9XCIlc1wiJywgdGhpcy5vcHRpb25zLnN0eWxlcih2YWx1ZSkpLFxuICAgICAgICAgICAgICAgICAgICAkZWw7XG5cbiAgICAgICAgICAgICAgICBkaXNhYmxlZCA9IGdyb3VwRGlzYWJsZWQgfHwgJGVsbS5wcm9wKCdkaXNhYmxlZCcpO1xuXG4gICAgICAgICAgICAgICAgJGVsID0gJChbXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxsaSBjbGFzcz1cIiVzICVzXCIgJXMgJXM+JywgbXVsdGlwbGUsIGNsYXNzZXMsIHRpdGxlLCBzdHlsZSksXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxsYWJlbCBjbGFzcz1cIiVzXCI+JywgZGlzYWJsZWQgPyAnZGlzYWJsZWQnIDogJycpLFxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8aW5wdXQgdHlwZT1cIiVzXCIgJXMlcyVzJXM+JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUsIHRoaXMuc2VsZWN0SXRlbU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZCA/ICcgY2hlY2tlZD1cImNoZWNrZWRcIicgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkID8gJyBkaXNhYmxlZD1cImRpc2FibGVkXCInIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCcgZGF0YS1ncm91cD1cIiVzXCInLCBncm91cCkpLFxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8c3Bhbj4lczwvc3Bhbj4nLCB0ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgJzwvbGFiZWw+JyxcbiAgICAgICAgICAgICAgICAgICAgJzwvbGk+J1xuICAgICAgICAgICAgICAgIF0uam9pbignJykpO1xuICAgICAgICAgICAgICAgICRlbC5maW5kKCdpbnB1dCcpLnZhbCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkZWxtLmlzKCdvcHRncm91cCcpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gdGhhdC5vcHRpb25zLmxhYmVsVGVtcGxhdGUoJGVsbSksXG4gICAgICAgICAgICAgICAgICAgICRncm91cCA9ICQoJzxkaXYvPicpO1xuXG4gICAgICAgICAgICAgICAgZ3JvdXAgPSAnZ3JvdXBfJyArIGk7XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQgPSAkZWxtLnByb3AoJ2Rpc2FibGVkJyk7XG5cbiAgICAgICAgICAgICAgICAkZ3JvdXAuYXBwZW5kKFtcbiAgICAgICAgICAgICAgICAgICAgJzxsaSBjbGFzcz1cImdyb3VwXCI+JyxcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGxhYmVsIGNsYXNzPVwib3B0Z3JvdXAgJXNcIiBkYXRhLWdyb3VwPVwiJXNcIj4nLCBkaXNhYmxlZCA/ICdkaXNhYmxlZCcgOiAnJywgZ3JvdXApLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuaGlkZU9wdGdyb3VwQ2hlY2tib3hlcyB8fCB0aGlzLm9wdGlvbnMuc2luZ2xlID8gJycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGlucHV0IHR5cGU9XCJjaGVja2JveFwiICVzICVzPicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdEdyb3VwTmFtZSwgZGlzYWJsZWQgPyAnZGlzYWJsZWQ9XCJkaXNhYmxlZFwiJyA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICc8L2xhYmVsPicsXG4gICAgICAgICAgICAgICAgICAgICc8L2xpPidcbiAgICAgICAgICAgICAgICBdLmpvaW4oJycpKTtcblxuICAgICAgICAgICAgICAgICQuZWFjaCgkZWxtLmNoaWxkcmVuKCksIGZ1bmN0aW9uIChpLCBlbG0pIHtcbiAgICAgICAgICAgICAgICAgICAgJGdyb3VwLmFwcGVuZCh0aGF0Lm9wdGlvblRvSHRtbChpLCBlbG0sIGdyb3VwLCBkaXNhYmxlZCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiAkZ3JvdXAuaHRtbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHRvZ2dsZU9wZW4gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXRbdGhhdC5vcHRpb25zLmlzT3BlbiA/ICdjbG9zZScgOiAnb3BlbiddKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuJGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kbGFiZWwub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnbGFiZWwnIHx8IGUudGFyZ2V0ICE9PSB0aGlzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlT3BlbihlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMuZmlsdGVyIHx8ICF0aGF0Lm9wdGlvbnMuaXNPcGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTsgLy8gQ2F1c2VzIGxvc3QgZm9jdXMgb3RoZXJ3aXNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgdG9nZ2xlT3BlbilcbiAgICAgICAgICAgICAgICAub2ZmKCdmb2N1cycpLm9uKCdmb2N1cycsIHRoaXMub3B0aW9ucy5vbkZvY3VzKVxuICAgICAgICAgICAgICAgIC5vZmYoJ2JsdXInKS5vbignYmx1cicsIHRoaXMub3B0aW9ucy5vbkJsdXIpO1xuXG4gICAgICAgICAgICB0aGlzLiRwYXJlbnQub2ZmKCdrZXlkb3duJykub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI3OiAvLyBlc2Mga2V5XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LiRjaG9pY2UuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiRzZWFyY2hJbnB1dC5vZmYoJ2tleWRvd24nKS5vbigna2V5ZG93bicsZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgc2hpZnQtdGFiIGNhdXNlcyBsb3N0IGZvY3VzIGZyb20gZmlsdGVyIGFzIHdpdGggY2xpY2tpbmcgYXdheVxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDkgJiYgZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkub2ZmKCdrZXl1cCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgLy8gZW50ZXIgb3Igc3BhY2VcbiAgICAgICAgICAgICAgICAvLyBBdm9pZCBzZWxlY3RpbmcvZGVzZWxlY3RpbmcgaWYgbm8gY2hvaWNlcyBtYWRlXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5maWx0ZXJBY2NlcHRPbkVudGVyICYmIChlLndoaWNoID09PSAxMyB8fCBlLndoaWNoID09IDMyKSAmJiB0aGF0LiRzZWFyY2hJbnB1dC52YWwoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RBbGwuY2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhhdC5maWx0ZXIoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hlY2tlZCA9ICQodGhpcykucHJvcCgnY2hlY2tlZCcpLFxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMgPSB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoJzp2aXNpYmxlJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoJGl0ZW1zLmxlbmd0aCA9PT0gdGhhdC4kc2VsZWN0SXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXRbY2hlY2tlZCA/ICdjaGVja0FsbCcgOiAndW5jaGVja0FsbCddKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gd2hlbiB0aGUgZmlsdGVyIG9wdGlvbiBpcyB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEdyb3Vwcy5wcm9wKCdjaGVja2VkJywgY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICRpdGVtcy5wcm9wKCdjaGVja2VkJywgY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub3B0aW9uc1tjaGVja2VkID8gJ29uQ2hlY2tBbGwnIDogJ29uVW5jaGVja0FsbCddKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSAkKHRoaXMpLnBhcmVudCgpLmF0dHIoJ2RhdGEtZ3JvdXAnKSxcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zID0gdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpLFxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4gPSAkaXRlbXMuZmlsdGVyKHNwcmludGYoJ1tkYXRhLWdyb3VwPVwiJXNcIl0nLCBncm91cCkpLFxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkID0gJGNoaWxkcmVuLmxlbmd0aCAhPT0gJGNoaWxkcmVuLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICAkY2hpbGRyZW4ucHJvcCgnY2hlY2tlZCcsIGNoZWNrZWQpO1xuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlU2VsZWN0QWxsKCk7XG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25PcHRncm91cENsaWNrKHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICQodGhpcykucGFyZW50KCkudGV4dCgpLFxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiBjaGVja2VkLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogJGNoaWxkcmVuLmdldCgpLFxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZTogdGhhdFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlU2VsZWN0QWxsKCk7XG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZU9wdEdyb3VwU2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uQ2xpY2soe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCksXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAkKHRoaXMpLnZhbCgpLFxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiAkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2U6IHRoYXRcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuc2luZ2xlICYmIHRoYXQub3B0aW9ucy5pc09wZW4gJiYgIXRoYXQub3B0aW9ucy5rZWVwT3Blbikge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5zaW5nbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsaWNrZWRWYWwgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJCh0aGlzKS52YWwoKSAhPT0gY2xpY2tlZFZhbDtcbiAgICAgICAgICAgICAgICAgICAgfSkuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb3BlbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuJGNob2ljZS5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc09wZW4gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmZpbmQoJz5kaXYnKS5hZGRDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgdGhpcy4kZHJvcFt0aGlzLmFuaW1hdGVNZXRob2QoJ3Nob3cnKV0oKTtcblxuICAgICAgICAgICAgLy8gZml4IGZpbHRlciBidWc6IG5vIHJlc3VsdHMgc2hvd1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMuJG5vUmVzdWx0cy5oaWRlKCk7XG5cbiAgICAgICAgICAgIC8vIEZpeCAjNzc6ICdBbGwgc2VsZWN0ZWQnIHdoZW4gbm8gb3B0aW9uc1xuICAgICAgICAgICAgaWYgKCF0aGlzLiRlbC5jaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLnNob3coKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy4kZHJvcC5vZmZzZXQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRkcm9wLmFwcGVuZFRvKCQodGhpcy5vcHRpb25zLmNvbnRhaW5lcikpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGRyb3Aub2Zmc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBvZmZzZXQudG9wLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmZpbHRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNlYXJjaElucHV0LnZhbCgnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VhcmNoSW5wdXQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uT3BlbigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuaXNPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuZmluZCgnPmRpdicpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICB0aGlzLiRkcm9wW3RoaXMuYW5pbWF0ZU1ldGhvZCgnaGlkZScpXSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRwYXJlbnQuYXBwZW5kKHRoaXMuJGRyb3ApO1xuICAgICAgICAgICAgICAgIHRoaXMuJGRyb3AuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgJ3RvcCc6ICdhdXRvJyxcbiAgICAgICAgICAgICAgICAgICAgJ2xlZnQnOiAnYXV0bydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYW5pbWF0ZU1ldGhvZDogZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICAgICAgdmFyIG1ldGhvZHMgPSB7XG4gICAgICAgICAgICAgICAgc2hvdzoge1xuICAgICAgICAgICAgICAgICAgICBmYWRlOiAnZmFkZUluJyxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGU6ICdzbGlkZURvd24nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBoaWRlOiB7XG4gICAgICAgICAgICAgICAgICAgIGZhZGU6ICdmYWRlT3V0JyxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGU6ICdzbGlkZVVwJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzW21ldGhvZF1bdGhpcy5vcHRpb25zLmFuaW1hdGVdIHx8IG1ldGhvZDtcbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChpc0luaXQpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3RzID0gdGhpcy5vcHRpb25zLmRpc3BsYXlWYWx1ZXMgPyB0aGlzLmdldFNlbGVjdHMoKSA6IHRoaXMuZ2V0U2VsZWN0cygndGV4dCcpLFxuICAgICAgICAgICAgICAgICRzcGFuID0gdGhpcy4kY2hvaWNlLmZpbmQoJz5zcGFuJyksXG4gICAgICAgICAgICAgICAgc2wgPSBzZWxlY3RzLmxlbmd0aDtcblxuICAgICAgICAgICAgaWYgKHNsID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJHNwYW4uYWRkQ2xhc3MoJ3BsYWNlaG9sZGVyJykuaHRtbCh0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuYWxsU2VsZWN0ZWQgJiYgc2wgPT09IHRoaXMuJHNlbGVjdEl0ZW1zLmxlbmd0aCArIHRoaXMuJGRpc2FibGVJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkc3Bhbi5yZW1vdmVDbGFzcygncGxhY2Vob2xkZXInKS5odG1sKHRoaXMub3B0aW9ucy5hbGxTZWxlY3RlZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5lbGxpcHNpcyAmJiBzbCA+IHRoaXMub3B0aW9ucy5taW5pbXVtQ291bnRTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLnRleHQoc2VsZWN0cy5zbGljZSgwLCB0aGlzLm9wdGlvbnMubWluaW11bUNvdW50U2VsZWN0ZWQpXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIpICsgJy4uLicpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuY291bnRTZWxlY3RlZCAmJiBzbCA+IHRoaXMub3B0aW9ucy5taW5pbXVtQ291bnRTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLmh0bWwodGhpcy5vcHRpb25zLmNvdW50U2VsZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJyMnLCBzZWxlY3RzLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJyUnLCB0aGlzLiRzZWxlY3RJdGVtcy5sZW5ndGggKyB0aGlzLiRkaXNhYmxlSXRlbXMubGVuZ3RoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLnRleHQoc2VsZWN0cy5qb2luKHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hZGRUaXRsZSkge1xuICAgICAgICAgICAgICAgICRzcGFuLnByb3AoJ3RpdGxlJywgdGhpcy5nZXRTZWxlY3RzKCd0ZXh0JykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzZXQgc2VsZWN0cyB0byBzZWxlY3RcbiAgICAgICAgICAgIHRoaXMuJGVsLnZhbCh0aGlzLmdldFNlbGVjdHMoKSkudHJpZ2dlcignY2hhbmdlJyk7XG5cbiAgICAgICAgICAgIC8vIGFkZCBzZWxlY3RlZCBjbGFzcyB0byBzZWxlY3RlZCBsaVxuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKCdpbnB1dDpjaGVja2VkJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCdsaScpLmZpcnN0KCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gdHJpZ2dlciA8c2VsZWN0PiBjaGFuZ2UgZXZlbnRcbiAgICAgICAgICAgIGlmICghaXNJbml0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwudHJpZ2dlcignY2hhbmdlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlU2VsZWN0QWxsOiBmdW5jdGlvbiAoaXNJbml0KSB7XG4gICAgICAgICAgICB2YXIgJGl0ZW1zID0gdGhpcy4kc2VsZWN0SXRlbXM7XG5cbiAgICAgICAgICAgIGlmICghaXNJbml0KSB7XG4gICAgICAgICAgICAgICAgJGl0ZW1zID0gJGl0ZW1zLmZpbHRlcignOnZpc2libGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgJGl0ZW1zLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgICRpdGVtcy5sZW5ndGggPT09ICRpdGVtcy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcbiAgICAgICAgICAgIGlmICghaXNJbml0ICYmIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMub25DaGVja0FsbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZU9wdEdyb3VwU2VsZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJGl0ZW1zID0gdGhpcy4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpO1xuICAgICAgICAgICAgJC5lYWNoKHRoaXMuJHNlbGVjdEdyb3VwcywgZnVuY3Rpb24gKGksIHZhbCkge1xuICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICQodmFsKS5wYXJlbnQoKS5hdHRyKCdkYXRhLWdyb3VwJyksXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9ICRpdGVtcy5maWx0ZXIoc3ByaW50ZignW2RhdGEtZ3JvdXA9XCIlc1wiXScsIGdyb3VwKSk7XG4gICAgICAgICAgICAgICAgJCh2YWwpLnByb3AoJ2NoZWNrZWQnLCAkY2hpbGRyZW4ubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbi5sZW5ndGggPT09ICRjaGlsZHJlbi5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vdmFsdWUgb3IgdGV4dCwgZGVmYXVsdDogJ3ZhbHVlJ1xuICAgICAgICBnZXRTZWxlY3RzOiBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHRleHRzID0gW10sXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gW107XG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoc3ByaW50ZignaW5wdXRbJXNdOmNoZWNrZWQnLCB0aGlzLnNlbGVjdEl0ZW1OYW1lKSkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGV4dHMucHVzaCgkKHRoaXMpLnBhcmVudHMoJ2xpJykuZmlyc3QoKS50ZXh0KCkpO1xuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKCQodGhpcykudmFsKCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlID09PSAndGV4dCcgJiYgdGhpcy4kc2VsZWN0R3JvdXBzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRleHRzID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9ICQudHJpbSgkKHRoaXMpLnBhcmVudCgpLnRleHQoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cCA9ICQodGhpcykucGFyZW50KCkuZGF0YSgnZ3JvdXAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9IHRoYXQuJGRyb3AuZmluZChzcHJpbnRmKCdbJXNdW2RhdGEtZ3JvdXA9XCIlc1wiXScsIHRoYXQuc2VsZWN0SXRlbU5hbWUsIGdyb3VwKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2VsZWN0ZWQgPSAkY2hpbGRyZW4uZmlsdGVyKCc6Y2hlY2tlZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghJHNlbGVjdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKCdbJyk7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaCh0ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRjaGlsZHJlbi5sZW5ndGggPiAkc2VsZWN0ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGVjdGVkLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaCgkKHRoaXMpLnBhcmVudCgpLnRleHQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaCgnOiAnICsgbGlzdC5qb2luKCcsICcpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2goJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgdGV4dHMucHVzaChodG1sLmpvaW4oJycpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0eXBlID09PSAndGV4dCcgPyB0ZXh0cyA6IHZhbHVlcztcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRTZWxlY3RzOiBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy4kZGlzYWJsZUl0ZW1zLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICAkLmVhY2godmFsdWVzLCBmdW5jdGlvbiAoaSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoc3ByaW50ZignW3ZhbHVlPVwiJXNcIl0nLCB2YWx1ZSkpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGF0LiRkaXNhYmxlSXRlbXMuZmlsdGVyKHNwcmludGYoJ1t2YWx1ZT1cIiVzXCJdJywgdmFsdWUpKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgdGhpcy4kc2VsZWN0SXRlbXMubGVuZ3RoID09PVxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGggKyB0aGlzLiRkaXNhYmxlSXRlbXMuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICQuZWFjaCh0aGF0LiRzZWxlY3RHcm91cHMsIGZ1bmN0aW9uIChpLCB2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSAkKHZhbCkucGFyZW50KCkuYXR0cignZGF0YS1ncm91cCcpLFxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4gPSB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoJ1tkYXRhLWdyb3VwPVwiJyArIGdyb3VwICsgJ1wiXScpO1xuICAgICAgICAgICAgICAgICQodmFsKS5wcm9wKCdjaGVja2VkJywgJGNoaWxkcmVuLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4ubGVuZ3RoID09PSAkY2hpbGRyZW4uZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hlY2tBbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNoZWNrQWxsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW5jaGVja0FsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uVW5jaGVja0FsbCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkZvY3VzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmJsdXIoKTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkJsdXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWZyZXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgfSxcblx0XHRcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuc2hvdygpO1xuICAgICAgICAgICAgdGhpcy4kcGFyZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy4kZWwuZGF0YSgnbXVsdGlwbGVTZWxlY3QnLCBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB0ZXh0ID0gJC50cmltKHRoaXMuJHNlYXJjaElucHV0LnZhbCgpKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBpZiAodGV4dC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLnBhcmVudCgpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNhYmxlSXRlbXMucGFyZW50KCkuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5wYXJlbnQoKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLmhpZGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciAkcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgJHBhcmVudFtyZW1vdmVEaWFjcml0aWNzKCRwYXJlbnQudGV4dCgpLnRvTG93ZXJDYXNlKCkpLmluZGV4T2YocmVtb3ZlRGlhY3JpdGljcyh0ZXh0KSkgPCAwID8gJ2hpZGUnIDogJ3Nob3cnXSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcy5wYXJlbnQoKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9ICQodGhpcykucGFyZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICRwYXJlbnQuYXR0cignZGF0YS1ncm91cCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW1zID0gdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpO1xuICAgICAgICAgICAgICAgICAgICAkcGFyZW50WyRpdGVtcy5maWx0ZXIoc3ByaW50ZignW2RhdGEtZ3JvdXA9XCIlc1wiXScsIGdyb3VwKSkubGVuZ3RoID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy9DaGVjayBpZiBubyBtYXRjaGVzIGZvdW5kXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJHNlbGVjdEl0ZW1zLnBhcmVudCgpLmZpbHRlcignOnZpc2libGUnKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudXBkYXRlT3B0R3JvdXBTZWxlY3QoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0QWxsKCk7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25GaWx0ZXIodGV4dCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgJC5mbi5tdWx0aXBsZVNlbGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50c1swXSxcbiAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHMsXG5cbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgYWxsb3dlZE1ldGhvZHMgPSBbXG4gICAgICAgICAgICAgICAgJ2dldFNlbGVjdHMnLCAnc2V0U2VsZWN0cycsXG4gICAgICAgICAgICAgICAgJ2VuYWJsZScsICdkaXNhYmxlJyxcbiAgICAgICAgICAgICAgICAnb3BlbicsICdjbG9zZScsXG4gICAgICAgICAgICAgICAgJ2NoZWNrQWxsJywgJ3VuY2hlY2tBbGwnLFxuICAgICAgICAgICAgICAgICdmb2N1cycsICdibHVyJyxcbiAgICAgICAgICAgICAgICAncmVmcmVzaCcsICdkZXN0cm95J1xuICAgICAgICAgICAgXTtcblxuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBkYXRhID0gJHRoaXMuZGF0YSgnbXVsdGlwbGVTZWxlY3QnKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gJC5leHRlbmQoe30sICQuZm4ubXVsdGlwbGVTZWxlY3QuZGVmYXVsdHMsXG4gICAgICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PT0gJ29iamVjdCcgJiYgb3B0aW9uKTtcblxuICAgICAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IG5ldyBNdWx0aXBsZVNlbGVjdCgkdGhpcywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnbXVsdGlwbGVTZWxlY3QnLCBkYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQuaW5BcnJheShvcHRpb24sIGFsbG93ZWRNZXRob2RzKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ1Vua25vd24gbWV0aG9kOiAnICsgb3B0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGRhdGFbb3B0aW9uXShhcmdzWzFdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGF0YS5pbml0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3NbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhW2FyZ3NbMV1dLmFwcGx5KGRhdGEsIFtdLnNsaWNlLmNhbGwoYXJncywgMikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgPyB2YWx1ZSA6IHRoaXM7XG4gICAgfTtcblxuICAgICQuZm4ubXVsdGlwbGVTZWxlY3QuZGVmYXVsdHMgPSB7XG4gICAgICAgIG5hbWU6ICcnLFxuICAgICAgICBpc09wZW46IGZhbHNlLFxuICAgICAgICBwbGFjZWhvbGRlcjogJycsXG4gICAgICAgIHNlbGVjdEFsbDogdHJ1ZSxcbiAgICAgICAgc2VsZWN0QWxsRGVsaW1pdGVyOiBbJ1snLCAnXSddLFxuICAgICAgICBtaW5pbXVtQ291bnRTZWxlY3RlZDogMyxcbiAgICAgICAgZWxsaXBzaXM6IGZhbHNlLFxuICAgICAgICBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgIG11bHRpcGxlV2lkdGg6IDgwLFxuICAgICAgICBzaW5nbGU6IGZhbHNlLFxuICAgICAgICBmaWx0ZXI6IGZhbHNlLFxuICAgICAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgICAgICBkcm9wV2lkdGg6IHVuZGVmaW5lZCxcbiAgICAgICAgbWF4SGVpZ2h0OiAyNTAsXG4gICAgICAgIGNvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgcG9zaXRpb246ICdib3R0b20nLFxuICAgICAgICBrZWVwT3BlbjogZmFsc2UsXG4gICAgICAgIGFuaW1hdGU6ICdub25lJywgLy8gJ25vbmUnLCAnZmFkZScsICdzbGlkZSdcbiAgICAgICAgZGlzcGxheVZhbHVlczogZmFsc2UsXG4gICAgICAgIGRlbGltaXRlcjogJywgJyxcbiAgICAgICAgYWRkVGl0bGU6IGZhbHNlLFxuICAgICAgICBmaWx0ZXJBY2NlcHRPbkVudGVyOiBmYWxzZSxcbiAgICAgICAgaGlkZU9wdGdyb3VwQ2hlY2tib3hlczogZmFsc2UsXG5cbiAgICAgICAgc2VsZWN0QWxsVGV4dDogJ1NlbGVjdCBhbGwnLFxuICAgICAgICBhbGxTZWxlY3RlZDogJ0FsbCBzZWxlY3RlZCcsXG4gICAgICAgIGNvdW50U2VsZWN0ZWQ6ICcjIG9mICUgc2VsZWN0ZWQnLFxuICAgICAgICBub01hdGNoZXNGb3VuZDogJ05vIG1hdGNoZXMgZm91bmQnLFxuXG4gICAgICAgIHN0eWxlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICB0ZXh0VGVtcGxhdGU6IGZ1bmN0aW9uICgkZWxtKSB7XG4gICAgICAgICAgICByZXR1cm4gJGVsbS5odG1sKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGxhYmVsVGVtcGxhdGU6IGZ1bmN0aW9uICgkZWxtKSB7XG4gICAgICAgICAgICByZXR1cm4gJGVsbS5hdHRyKCdsYWJlbCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uT3BlbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIG9uQ2hlY2tBbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgb25VbmNoZWNrQWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIG9uT3B0Z3JvdXBDbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIG9uRmlsdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICQoJ3NlbGVjdFttdWx0aXBsZV0nKS5tdWx0aXBsZVNlbGVjdCgpO1xufSkoalF1ZXJ5KTtcbiJdfQ==
