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
        $(helpBlock).closest('.form-group').addClass('has-error');
        helpBlock.html(helpMessage);
        helpBlock.addClass('help-block-error');
        isValid = false;
      } else {
        helpBlock.html('');
        $(helpBlock).closest('.form-group').removeClass('has-error');
        helpBlock.removeClass('help-block-error');
      }
    }
    if (!isValid) {
      return false;
    }

    if (form.yiiActiveForm) {
      form.off('afterValidate');
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
    if ($(window).width() < 768) {
        $(this).toggleClass('active');
        //var parent = $(this).parent();
        //var dropBlock = $(parent).find('.sd-select-drop');

        // if (dropBlock.is(':hidden')) {
        //     dropBlock.slideDown();
        //
        //     $(this).addClass('active');
        //
        //     if (!parent.hasClass('linked')) {
        //
        //         $('.sd-select-drop').find('a').click(function (e) {
        //
        //             e.preventDefault();
        //             var selectResult = $(this).html();
        //
        //             $(parent).find('input').val(selectResult);
        //
        //             $(parent).find('.sd-select-selected').removeClass('active').html(selectResult);
        //
        //             dropBlock.slideUp();
        //         });
        //     }
        //
        // } else {
        //     $(this).removeClass('active');
        //     dropBlock.slideUp();
        // }
    }
    //return false;
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
    var limit = $(this).data('id4');
    $('#'+limit).attr('value', $(this).data('value4'));

    var action = $(this).data('action');

    $(this).closest('form').attr('action', action);

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
        date = Math.round(date.getTime()/1000);
        setCookieAjax('_sd_country_dialog_close', date, 7);
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
        $('.header-upline_lang-list').removeClass('inactive');
        $(elem).closest('.header-countries_dialog').fadeOut();
    };
}();
(function () {


    // setInterval(function() {
    //     var time = (new Date).getTime()/1000;
    //     var users = 100 * Math.sin(time) + 2 * Math.sin(time/10+3)* time;
    //     console.log(users);
    // }, 1500);



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
    var type = self.data("state"),
      affiliate_id = self.data("affiliate-id"),
      product_id = self.data("product-id");

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
      "affiliate_id": affiliate_id,
      "product_id": product_id
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

      self.data("state", data["data-state"]);
      self.data("original-title", data["data-original-title"]);
      self.find('.title').html(data["data-original-title"]);

      if (type == "add") {
        self.find("svg").removeClass("spin in_fav_off").addClass("in_fav_on");
      } else if (type == "delete") {
        self.find("svg").removeClass("spin in_fav_on").addClass("in_fav_off");
      }

    }, 'json').fail(function () {
      self.removeClass('disabled');
      notification.notifi({
        message: lg("there_is_technical_works_now"),
        type: 'err'
      });

      if (type == "add") {
        self.find("svg").removeClass("spin in_fav_off").addClass("in_fav_on");
        self.data('original-title', lg("favorites_shop_remove"+(product_id ? '_product' : '')));
        self.find('.title').html(lg("favorites_shop_remove"+(product_id ? '_product' : '')));
      } else if (type == "delete") {
        self.find("svg").removeClass("spin in_fav_on").addClass("in_fav_off");
        self.data('original-title', lg("favorites_shop_add"+(product_id ? '_product' : '')));
        self.find('.title').html(lg("favorites_shop_add"+(product_id ? '_product' : '')));
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

  function testImg(imgs, no_img){
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

  //тест картинок продуктов
  imgs = $('.catalog_products_item_image-wrap img');
  testImg(imgs);

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


function setCookieAjax(name, value, days) {
    $.post('/cookie', {name:name, value:value, days:days}, function(data){
        if (data.error !== 0) {
            console.log(data);
        }
    }, 'json');
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
            //'href': 'https://addons.mozilla.org/ru/firefox/addon/secretdiscounter-%D0%BA%D1%8D%D1%88%D0%B1%D1%8D%D0%BA-%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81/',
            'href': 'https://addons.mozilla.org/ru/firefox/addon/secretdiscounter-cashback',
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxhbmd1YWdlLmpzIiwibGFuZy5qcyIsImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsInRvb2x0aXAuanMiLCJhY2NvdW50X25vdGlmaWNhdGlvbi5qcyIsInNsaWRlci5qcyIsImhlYWRlcl9tZW51X2FuZF9zZWFyY2guanMiLCJjYWxjLWNhc2hiYWNrLmpzIiwiYXV0b19oaWRlX2NvbnRyb2wuanMiLCJoaWRlX3Nob3dfYWxsLmpzIiwiY2xvY2suanMiLCJsaXN0X3R5cGVfc3dpdGNoZXIuanMiLCJzZWxlY3QuanMiLCJzZWFyY2guanMiLCJnb3RvLmpzIiwiYWNjb3VudC13aXRoZHJhdy5qcyIsImFqYXguanMiLCJkb2Jyby5qcyIsImxlZnQtbWVudS10b2dnbGUuanMiLCJzaGFyZTQyLmpzIiwidXNlcl9yZXZpZXdzLmpzIiwicGxhY2Vob2xkZXIuanMiLCJhamF4LWxvYWQuanMiLCJiYW5uZXIuanMiLCJjb3VudHJ5X3NlbGVjdC5qcyIsInVzZXJzX29ubGluZS5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsIm1vZGFscy5qcyIsImZvb3Rlcl9tZW51LmpzIiwicmF0aW5nLmpzIiwiZmF2b3JpdGVzLmpzIiwic2Nyb2xsX3RvLmpzIiwiY29weV90b19jbGlwYm9hcmQuanMiLCJpbWcuanMiLCJwYXJlbnRzX29wZW5fd2luZG93cy5qcyIsImZvcm1zLmpzIiwiY29va2llLmpzIiwidGFibGUuanMiLCJhamF4X3JlbW92ZS5qcyIsImZpeGVzLmpzIiwibGlua3MuanMiLCJzdG9yZV9wb2ludHMuanMiLCJoYXNodGFncy5qcyIsInBsdWdpbnMuanMiLCJtdWx0aXBsZS1zZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcmdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgbGcgPSAoZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGxhbmc9e307XHJcbiAgdXJsPScvbGFuZ3VhZ2UvJytkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZysnLmpzb24nO1xyXG4gICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgLy9jb25zb2xlLmxvZyhkYXRhKTtcclxuICAgIGZvcih2YXIgaW5kZXggaW4gZGF0YSkge1xyXG4gICAgICBkYXRhW2luZGV4XT1jbGVhclZhcihkYXRhW2luZGV4XSk7XHJcbiAgICB9XHJcbiAgICBsYW5nPWRhdGE7XHJcbiAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJsYW5ndWFnZV9sb2FkZWRcIik7XHJcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgIC8vY29uc29sZS5sb2coZGF0YSwgZXZlbnQpO1xyXG4gIH0sJ2pzb24nKTtcclxuXHJcbiAgZnVuY3Rpb24gY2xlYXJWYXIodHh0KXtcclxuICAgIHR4dD10eHQucmVwbGFjZSgvXFxzKy9nLFwiIFwiKTsvL9GD0LTQsNC70LXQvdC40LUg0LfQsNC00LLQvtC10L3QuNC1INC/0YDQvtCx0LXQu9C+0LJcclxuXHJcbiAgICAvL9Cn0LjRgdGC0LjQvCDQv9C+0LTRgdGC0LDQstC70Y/QtdC80YvQtSDQv9C10YDQtdC80LXQvdC90YvQtVxyXG4gICAgc3RyPXR4dC5tYXRjaCgvXFx7KC4qPylcXH0vZyk7XHJcbiAgICBpZiAoIHN0ciAhPSBudWxsKSB7XHJcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIHN0cl90PXN0cltpXS5yZXBsYWNlKC8gL2csXCJcIik7XHJcbiAgICAgICAgdHh0PXR4dC5yZXBsYWNlKHN0cltpXSxzdHJfdCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0eHQ7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZnVuY3Rpb24odHBsLCBkYXRhKXtcclxuICAgIGlmKHR5cGVvZihsYW5nW3RwbF0pPT1cInVuZGVmaW5lZFwiKXtcclxuICAgICAgY29uc29sZS5sb2coXCJsYW5nIG5vdCBmb3VuZDogXCIrdHBsKTtcclxuICAgICAgcmV0dXJuIHRwbDtcclxuICAgIH1cclxuICAgIHRwbD1sYW5nW3RwbF07XHJcbiAgICBpZih0eXBlb2YoZGF0YSk9PVwib2JqZWN0XCIpe1xyXG4gICAgICBmb3IodmFyIGluZGV4IGluIGRhdGEpIHtcclxuICAgICAgICB0cGw9dHBsLnNwbGl0KFwie1wiK2luZGV4K1wifVwiKS5qb2luKGRhdGFbaW5kZXhdKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRwbDtcclxuICB9XHJcbn0pKCk7IiwidmFyIGxhbmcgPSAoZnVuY3Rpb24oKXtcclxuICAgIHZhciBjb2RlID0gJyc7XHJcbiAgICB2YXIga2V5ID0gJyc7XHJcbiAgICB2YXIgaHJlZl9wcmVmaXggPSAnJztcclxuXHJcbiAgICB2YXIgbGFuZ2xpc3QgPSAkKFwiI3NkX2xhbmdfbGlzdFwiKS5kYXRhKCdqc29uJyk7XHJcbiAgICB2YXIgbG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XHJcblxyXG4gICAgaWYgKGxhbmdsaXN0KSB7XHJcbiAgICAgICAgdmFyIGxhbmdLZXkgPSAobG9jYXRpb24ubGVuZ3RoID09PSAzIHx8IGxvY2F0aW9uLnN1YnN0cigzLDEpID09PSAnLycpID8gbG9jYXRpb24uc3Vic3RyKDEsMikgOiAnJztcclxuICAgICAgICBpZiAobGFuZ0tleSAmJiBsYW5nbGlzdFtsYW5nS2V5XSkge1xyXG4gICAgICAgICAgICBjb2RlID0gbGFuZ2xpc3RbbGFuZ0tleV07XHJcbiAgICAgICAgICAgIGtleSA9IGxhbmdLZXk7XHJcbiAgICAgICAgICAgIGhyZWZfcHJlZml4ID0ga2V5ID09PSAncnUnID8gJycgOiBrZXkrJy8nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGtleSA9ICdydSc7XHJcbiAgICAgICAgICAgIGNvZGUgPSBsYW5nbGlzdFtrZXldID8gbGFuZ2xpc3Rba2V5XSA6ICcnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICBocmVmX3ByZWZpeDogaHJlZl9wcmVmaXhcclxuICAgIH1cclxufSkoKTtcclxuIiwib2JqZWN0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgdmFyIGMgPSBiLFxyXG4gICAga2V5O1xyXG4gIGZvciAoa2V5IGluIGEpIHtcclxuICAgIGlmIChhLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBjO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gbG9naW5fcmVkaXJlY3QobmV3X2hyZWYpIHtcclxuICBocmVmID0gbG9jYXRpb24uaHJlZjtcclxuICBpZiAoaHJlZi5pbmRleE9mKCdzdG9yZScpID4gMCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpID4gMCB8fCBocmVmLmluZGV4T2YoJ3VybCgnKSA+IDApIHtcclxuICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsb2NhdGlvbi5ocmVmID0gbmV3X2hyZWY7XHJcbiAgfVxyXG59XHJcbiIsIihmdW5jdGlvbiAodywgZCwgJCkge1xyXG4gIHZhciBzbGlkZV9pbnRlcnZhbD00MDAwO1xyXG4gIHZhciBzY3JvbGxzX2Jsb2NrID0gJCgnLnNjcm9sbF9ib3gnKTtcclxuXHJcbiAgaWYgKHNjcm9sbHNfYmxvY2subGVuZ3RoID09IDApIHJldHVybjtcclxuICAvLyQoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKS53cmFwQWxsKHNjcm9sbHNfYmxvY2spO1xyXG4gICQoc2Nyb2xsc19ibG9jaykud3JhcCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpO1xyXG5cclxuICBpbml0X3Njcm9sbCgpO1xyXG4gIGNhbGNfc2Nyb2xsKCk7XHJcblxyXG4gICQod2luZG93ICkub24oXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgY2FsY19zY3JvbGwoKTtcclxuICB9KTtcclxuICB2YXIgdDEsIHQyO1xyXG5cclxuICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uICgpIHtcclxuICAgIGNsZWFyVGltZW91dCh0MSk7XHJcbiAgICBjbGVhclRpbWVvdXQodDIpO1xyXG4gICAgdDEgPSBzZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLCAzMDApO1xyXG4gICAgdDIgPSBzZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLCA4MDApO1xyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBpbml0X3Njcm9sbCgpIHtcclxuICAgIHZhciBjb250cm9sID0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xcIj48L2Rpdj4nO1xyXG4gICAgY29udHJvbCA9ICQoY29udHJvbCk7XHJcbiAgICBjb250cm9sLmluc2VydEFmdGVyKHNjcm9sbHNfYmxvY2spO1xyXG4gICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTtcclxuXHJcbiAgICBzY3JvbGxzX2Jsb2NrLnByZXBlbmQoJzxkaXYgY2xhc3M9c2Nyb2xsX2JveC1tb3Zlcj48L2Rpdj4nKTtcclxuXHJcbiAgICBjb250cm9sLm9uKCdjbGljaycsICcuc2Nyb2xsX2JveC1jb250cm9sX3BvaW50JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICB2YXIgY29udHJvbCA9ICR0aGlzLnBhcmVudCgpO1xyXG4gICAgICB2YXIgaSA9ICR0aGlzLmluZGV4KCk7XHJcbiAgICAgIGlmICgkdGhpcy5oYXNDbGFzcygnYWN0aXZlJykpcmV0dXJuO1xyXG4gICAgICBjb250cm9sLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICR0aGlzLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgIHZhciBkeCA9IGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnKTtcclxuICAgICAgdmFyIGVsID0gY29udHJvbC5wcmV2KCk7XHJcbiAgICAgIGVsLmZpbmQoJy5zY3JvbGxfYm94LW1vdmVyJykuY3NzKCdtYXJnaW4tbGVmdCcsIC1keCAqIGkpO1xyXG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGkpO1xyXG5cclxuICAgICAgc3RvcFNjcm9sLmJpbmQoZWwpKCk7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIgaiA9IDA7IGogPCBzY3JvbGxzX2Jsb2NrLmxlbmd0aDsgaisrKSB7XHJcbiAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGopO1xyXG4gICAgZWwucGFyZW50KCkuaG92ZXIoc3RvcFNjcm9sLmJpbmQoZWwpLCBzdGFydFNjcm9sLmJpbmQoZWwpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN0YXJ0U2Nyb2woKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpKXJldHVybjtcclxuXHJcbiAgICB2YXIgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLmJpbmQoJHRoaXMpLCBzbGlkZV9pbnRlcnZhbCk7XHJcbiAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLCB0aW1lb3V0SWQpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzdG9wU2Nyb2woKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHRpbWVvdXRJZCA9ICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpO1xyXG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJywgZmFsc2UpO1xyXG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpIHx8ICF0aW1lb3V0SWQpcmV0dXJuO1xyXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIGZhbHNlKTtcclxuICAgIGlmICghJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XHJcblxyXG4gICAgdmFyIGNvbnRyb2xzID0gJHRoaXMubmV4dCgpLmZpbmQoJz4qJyk7XHJcbiAgICB2YXIgYWN0aXZlID0gJHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJyk7XHJcbiAgICB2YXIgcG9pbnRfY250ID0gY29udHJvbHMubGVuZ3RoO1xyXG4gICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcclxuICAgIGFjdGl2ZSsrO1xyXG4gICAgaWYgKGFjdGl2ZSA+PSBwb2ludF9jbnQpYWN0aXZlID0gMDtcclxuICAgICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XHJcblxyXG4gICAgY29udHJvbHMuZXEoYWN0aXZlKS5jbGljaygpO1xyXG4gICAgc3RhcnRTY3JvbC5iaW5kKCR0aGlzKSgpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2FsY19zY3JvbGwoKSB7XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGkpO1xyXG4gICAgICB2YXIgY29udHJvbCA9IGVsLm5leHQoKTtcclxuICAgICAgdmFyIHdpZHRoX21heCA9IGVsLmRhdGEoJ3Njcm9sbC13aWR0aC1tYXgnKTtcclxuICAgICAgdyA9IGVsLndpZHRoKCk7XHJcblxyXG4gICAgICAvL9C00LXQu9Cw0LXQvCDQutC+0L3RgtGA0L7Qu9GMINC+0LPRgNCw0L3QuNGH0LXQvdC40Y8g0YjQuNGA0LjQvdGLLiDQldGB0LvQuCDQv9GA0LXQstGL0YjQtdC90L4g0YLQviDQvtGC0LrQu9GO0YfQsNC10Lwg0YHQutGA0L7QuyDQuCDQv9C10YDQtdGF0L7QtNC40Lwg0Log0YHQu9C10LTRg9GO0YnQtdC80YMg0Y3Qu9C10LzQtdC90YLRg1xyXG4gICAgICBpZiAod2lkdGhfbWF4ICYmIHcgPiB3aWR0aF9tYXgpIHtcclxuICAgICAgICBjb250cm9sLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XHJcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIG5vX2NsYXNzID0gZWwuZGF0YSgnc2Nyb2xsLWVsZW1ldC1pZ25vcmUtY2xhc3MnKTtcclxuICAgICAgdmFyIGNoaWxkcmVuID0gZWwuZmluZCgnPionKS5ub3QoJy5zY3JvbGxfYm94LW1vdmVyJyk7XHJcbiAgICAgIGlmIChub19jbGFzcykge1xyXG4gICAgICAgIGNoaWxkcmVuID0gY2hpbGRyZW4ubm90KCcuJyArIG5vX2NsYXNzKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvL9CV0YHQu9C4INC90LXRgiDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcclxuICAgICAgaWYgKGNoaWxkcmVuID09IDApIHtcclxuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBmX2VsID0gY2hpbGRyZW4uZXEoMSk7XHJcbiAgICAgIHZhciBjaGlsZHJlbl93ID0gZl9lbC5vdXRlcldpZHRoKCk7IC8v0LLRgdC10LPQviDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcclxuICAgICAgY2hpbGRyZW5fdyArPSBwYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tbGVmdCcpKTtcclxuICAgICAgY2hpbGRyZW5fdyArPSBwYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tcmlnaHQnKSk7XHJcblxyXG4gICAgICB2YXIgc2NyZWFuX2NvdW50ID0gTWF0aC5mbG9vcih3IC8gY2hpbGRyZW5fdyk7XHJcblxyXG4gICAgICAvL9CV0YHQu9C4INCy0YHQtSDQstC70LDQt9C40YIg0L3QsCDRjdC60YDQsNC9XHJcbiAgICAgIGlmIChjaGlsZHJlbiA8PSBzY3JlYW5fY291bnQpIHtcclxuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8v0KPQttC1INGC0L7Rh9C90L4g0LfQvdCw0LXQvCDRh9GC0L4g0YHQutGA0L7QuyDQvdGD0LbQtdC9XHJcbiAgICAgIGVsLmFkZENsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XHJcblxyXG4gICAgICB2YXIgcG9pbnRfY250ID0gY2hpbGRyZW4ubGVuZ3RoIC0gc2NyZWFuX2NvdW50ICsgMTtcclxuICAgICAgLy/QtdGB0LvQuCDQvdC1INC90LDQtNC+INC+0LHQvdC+0LLQu9GP0YLRjCDQutC+0L3RgtGA0L7QuyDRgtC+INCy0YvRhdC+0LTQuNC8LCDQvdC1INC30LDQsdGL0LLQsNGPINC+0LHQvdC+0LLQuNGC0Ywg0YjQuNGA0LjQvdGDINC00L7Rh9C10YDQvdC40YVcclxuICAgICAgaWYgKGNvbnRyb2wuZmluZCgnPionKS5sZW5ndGggPT0gcG9pbnRfY250KSB7XHJcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhY3RpdmUgPSBlbC5kYXRhKCdzbGlkZS1hY3RpdmUnKTtcclxuICAgICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcclxuICAgICAgaWYgKGFjdGl2ZSA+PSBwb2ludF9jbnQpYWN0aXZlID0gcG9pbnRfY250IC0gMTtcclxuICAgICAgdmFyIG91dCA9ICcnO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvaW50X2NudDsgaisrKSB7XHJcbiAgICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sX3BvaW50JyArIChqID09IGFjdGl2ZSA/ICcgYWN0aXZlJyA6ICcnKSArICdcIj48L2Rpdj4nO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnRyb2wuaHRtbChvdXQpO1xyXG5cclxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xyXG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWNvdW50JywgcG9pbnRfY250KTtcclxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xyXG5cclxuICAgICAgaWYgKCFlbC5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKSkge1xyXG4gICAgICAgIHN0YXJ0U2Nyb2wuYmluZChlbCkoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSh3aW5kb3csIGRvY3VtZW50LCBqUXVlcnkpKTtcclxuIiwidmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xyXG5cclxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcclxuXHJcblxyXG4gIGlmICgkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tdGl0bGUnKS5oYXNDbGFzcygnYWNjb3JkaW9uLXRpdGxlLWRpc2FibGVkJykpcmV0dXJuO1xyXG5cclxuICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAvKmlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKXtcclxuICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgfSovXHJcbiAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlVXAoMzAwKTtcclxuICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxyXG4gIH0gZWxzZSB7XHJcbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJykpIHtcclxuICAgICAgJG90aGVyID0gJCgnLmFjY29yZGlvbi1vbmx5X29uZScpO1xyXG4gICAgICAkb3RoZXIuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcclxuICAgICAgICAuc2xpZGVVcCgzMDApXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcclxuICAgICAgJG90aGVyLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnbGFzdC1vcGVuJyk7XHJcblxyXG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmFkZENsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcclxuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnbGFzdC1vcGVuJyk7XHJcbiAgICB9XHJcbiAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlRG93bigzMDApO1xyXG4gICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn0pO1xyXG5hY2NvcmRpb25Db250cm9sLnNob3coKTtcclxuXHJcblxyXG4kKCcuYWNjb3JkaW9uLXdyYXAub3Blbl9maXJzdCAuYWNjb3JkaW9uOmZpcnN0LWNoaWxkJykuYWRkQ2xhc3MoJ29wZW4nKTtcclxuJCgnLmFjY29yZGlvbi13cmFwIC5hY2NvcmRpb24uYWNjb3JkaW9uLXNsaW06Zmlyc3QtY2hpbGQnKS5hZGRDbGFzcygnb3BlbicpO1xyXG4kKCcuYWNjb3JkaW9uLXNsaW0nKS5hZGRDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJyk7XHJcblxyXG4vL9C00LvRjyDRgdC40LzQvtCyINC+0YLQutGA0YvQstCw0LXQvCDQtdGB0LvQuCDQtdGB0YLRjCDQv9C+0LzQtdGC0LrQsCBvcGVuINGC0L4g0L/RgNC40YHQstCw0LjQstCw0LXQvCDQstGB0LUg0L7RgdGC0LDQu9GM0L3Ri9C1INC60LvQsNGB0YtcclxuYWNjb3JkaW9uU2xpbSA9ICQoJy5hY2NvcmRpb24uYWNjb3JkaW9uLW9ubHlfb25lJyk7XHJcbmlmIChhY2NvcmRpb25TbGltLmxlbmd0aCA+IDApIHtcclxuICBhY2NvcmRpb25TbGltLnBhcmVudCgpLmZpbmQoJy5hY2NvcmRpb24ub3BlbicpXHJcbiAgICAuYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpXHJcbiAgICAuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcclxuICAgIC5zaG93KDMwMClcclxuICAgIC5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XHJcbn1cclxuXHJcbiQoJ2JvZHknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLmFjY29yZGlvbl9mdWxsc2NyZWFuX2Nsb3NlLm9wZW4gLmFjY29yZGlvbi1jb250cm9sOmZpcnN0LWNoaWxkJykuY2xpY2soKVxyXG59KTtcclxuXHJcbiQoJy5hY2NvcmRpb24tY29udGVudCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgIT0gJ0EnKSB7XHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb24nKS5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wuYWNjb3JkaW9uLXRpdGxlJykuY2xpY2soKTtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn0pO1xyXG5cclxuJCgnLmFjY29yZGlvbi1jb250ZW50IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2FuZ2xlLXVwJykpcmV0dXJuO1xyXG4gIGUuc3RvcFByb3BhZ2F0aW9uKClcclxufSk7XHJcblxyXG4oZnVuY3Rpb24oKXtcclxuICB2YXIgZWxzID0gJCgnLmFjY29yZGlvbl9tb3JlJyk7XHJcblxyXG4gIGZ1bmN0aW9uIGFkZEJ1dHRvbihlbCwgY2xhc3NOYW1lLCB0aXRsZSkge1xyXG4gICAgICB2YXIgYnV0dG9ucyA9ICQoZWwpLmZpbmQoJy4nK2NsYXNzTmFtZSk7XHJcbiAgICAgIGlmIChidXR0b25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgdmFyIGJ1dHRvbiA9ICQoJzxkaXY+JykuYWRkQ2xhc3MoY2xhc3NOYW1lKS5hZGRDbGFzcygnYWNjb3JkaW9uX21vcmVfYnV0dG9uJyk7XHJcbiAgICAgICAgICB2YXIgYSA9ICQoJzxhPicpLmF0dHIoJ2hyZWYnLCBcIlwiKS5hZGRDbGFzcygnYmx1ZScpLmh0bWwodGl0bGUpO1xyXG4gICAgICAgICAgJChidXR0b24pLmFwcGVuZChhKTtcclxuICAgICAgICAgICQoZWwpLmFwcGVuZChidXR0b24pO1xyXG4gICAgICB9XHJcbiAgfVxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFjY29yZGlvbl9tb3JlX2J1dHRvbl9tb3JlJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuYWNjb3JkaW9uX21vcmUnKS5hZGRDbGFzcygnb3BlbicpO1xyXG4gIH0pO1xyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFjY29yZGlvbl9tb3JlX2J1dHRvbl9sZXNzJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuYWNjb3JkaW9uX21vcmUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gIH0pO1xyXG5cclxuXHJcblxyXG4gIGZ1bmN0aW9uIHJlYnVpbGQoKXtcclxuICAgICQoZWxzKS5lYWNoKGZ1bmN0aW9uKGtleSwgaXRlbSl7XHJcbiAgICAgICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgdmFyIGNvbnRlbnQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5hY2NvcmRpb25fbW9yZV9jb250ZW50Jyk7XHJcbiAgICAgIGlmIChjb250ZW50LnNjcm9sbEhlaWdodCA+IGNvbnRlbnQuY2xpZW50SGVpZ2h0KSB7XHJcbiAgICAgICAgYWRkQnV0dG9uKGl0ZW0sICdhY2NvcmRpb25fbW9yZV9idXR0b25fbW9yZScsICfQn9C+0LTRgNC+0LHQvdC10LUnKTtcclxuICAgICAgICBhZGRCdXR0b24oaXRlbSwgJ2FjY29yZGlvbl9tb3JlX2J1dHRvbl9sZXNzJywgJ9Ch0LrRgNGL0YLRjCcpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQoaXRlbSkuZmluZCgnLmFjY29yZGlvbl9tb3JlX2J1dHRvbicpLnJlbW92ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfVxyXG5cclxuICAkKHdpbmRvdykucmVzaXplKHJlYnVpbGQpO1xyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdsYW5ndWFnZV9sb2FkZWQnLCBmdW5jdGlvbigpe1xyXG4gICAgcmVidWlsZCgpO1xyXG4gIH0sIGZhbHNlKTtcclxuXHJcbn0pKCk7XHJcblxyXG5cclxuIiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XHJcbiAgdmFyIGZpbGVBcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IgPyB0cnVlIDogZmFsc2U7XHJcbiAgdmFyIGRlZmF1bHRzID0ge1xyXG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJ1xyXG4gIH07XHJcbiAgdmFyIGxhc3RfcG9zdCA9IGZhbHNlO1xyXG5cclxuICBmdW5jdGlvbiBvblBvc3QocG9zdCkge1xyXG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XHJcbiAgICAvL2NvbnNvbGUubG9nKHBvc3QsIHRoaXMpO1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcclxuICAgIHZhciB3cmFwX2h0bWwgPSBkYXRhLndyYXBfaHRtbDtcclxuXHJcbiAgICBpZiAocG9zdC5yZW5kZXIpIHtcclxuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3MgPSBcIm5vdGlmeV93aGl0ZVwiO1xyXG4gICAgICBub3RpZmljYXRpb24uYWxlcnQocG9zdCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgaWYgKHBvc3QuaHRtbCkge1xyXG4gICAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xyXG4gICAgICAgIGFqYXhGb3JtKHdyYXApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICghcG9zdC5lcnJvcikge1xyXG4gICAgICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICAgICAgd3JhcC5odG1sKHdyYXBfaHRtbCk7XHJcbiAgICAgICAgICBmb3JtLmZpbmQoJ2lucHV0W3R5cGU9dGV4dF0sdGV4dGFyZWEnKS52YWwoJycpO1xyXG4gICAgICAgICAgYWpheEZvcm0od3JhcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBwb3N0LmVycm9yID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgIGZvciAodmFyIGluZGV4IGluIHBvc3QuZXJyb3IpIHtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICd0eXBlJzogJ2VycicsXHJcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IGxnKCdlcnJvcicpLFxyXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0LmVycm9yW2luZGV4XVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb3N0LmVycm9yLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgICAndHlwZSc6ICdlcnInLFxyXG4gICAgICAgICAgJ3RpdGxlJzogcG9zdC50aXRsZSA/IHBvc3QudGl0bGUgOiBsZygnZXJyb3InKSxcclxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocG9zdC5lcnJvciB8fCBwb3N0Lm1lc3NhZ2UpIHtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcclxuICAgICAgICAgICd0aXRsZSc6IHBvc3QudGl0bGUgPyBwb3N0LnRpdGxlIDogKHBvc3QuZXJyb3IgPT09IGZhbHNlID8gbGcoJ3N1Y2Nlc3MnKSA6IGxnKCdlcnJvcicpKSxcclxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5tZXNzYWdlID8gcG9zdC5tZXNzYWdlIDogcG9zdC5lcnJvclxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvL1xyXG4gICAgLy8gbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAvLyAgICAgJ3R5cGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICdzdWNjZXNzJyA6ICdlcnInLFxyXG4gICAgLy8gICAgICd0aXRsZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ9Cj0YHQv9C10YjQvdC+JyA6ICfQntGI0LjQsdC60LAnLFxyXG4gICAgLy8gICAgICdtZXNzYWdlJzogQXJyYXkuaXNBcnJheShwb3N0LmVycm9yKSA/IHBvc3QuZXJyb3JbMF0gOiAocG9zdC5tZXNzYWdlID8gcG9zdC5tZXNzYWdlIDogcG9zdC5lcnJvcilcclxuICAgIC8vIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25GYWlsKCkge1xyXG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xyXG4gICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgd3JhcC5odG1sKFxyXG4gICAgICAgICc8aDM+JytsZygnc29ycnlfbm90X2V4cGVjdGVkX2Vycm9yJykrJzxoMz4nICtcclxuICAgICAgICBsZygnaXRfaGFwcGVuc19zb21ldGltZXMnKVxyXG4gICAgKTtcclxuICAgIGFqYXhGb3JtKHdyYXApO1xyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uU3VibWl0KGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIC8vZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgIC8vZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICB2YXIgY3VycmVudFRpbWVNaWxsaXMgPSArbmV3IERhdGUoKTtcclxuICAgIGlmIChjdXJyZW50VGltZU1pbGxpcyAtIGxhc3RfcG9zdCA8IDEwMDAgKiAyKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBsYXN0X3Bvc3QgPSBjdXJyZW50VGltZU1pbGxpcztcclxuICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xyXG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XHJcbiAgICBkYXRhLndyYXBfaHRtbD13cmFwLmh0bWwoKTtcclxuICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcclxuXHJcbiAgICAvL2luaXQod3JhcCk7XHJcblxyXG4gICAgdmFyIHJlcXVpcmVkID0gZm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCwgdGV4dGFyZWEucmVxdWlyZWQsIGlucHV0W2lkPVwic3VwcG9ydC1yZWNhcHRjaGFcIl0nKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVxdWlyZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGhlbHBCbG9jayA9IHJlcXVpcmVkLmVxKGkpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuZmluZCgnLmhlbHAtYmxvY2snKTtcclxuICAgICAgdmFyIGhlbHBNZXNzYWdlID0gaGVscEJsb2NrICYmIGhlbHBCbG9jay5kYXRhKCdtZXNzYWdlJykgPyBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpIDogbGcoJ3JlcXVpcmVkJyk7XHJcblxyXG4gICAgICBpZiAocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICQoaGVscEJsb2NrKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcclxuICAgICAgICBoZWxwQmxvY2suaHRtbChoZWxwTWVzc2FnZSk7XHJcbiAgICAgICAgaGVscEJsb2NrLmFkZENsYXNzKCdoZWxwLWJsb2NrLWVycm9yJyk7XHJcbiAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGhlbHBCbG9jay5odG1sKCcnKTtcclxuICAgICAgICAkKGhlbHBCbG9jaykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgaGVscEJsb2NrLnJlbW92ZUNsYXNzKCdoZWxwLWJsb2NrLWVycm9yJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICghaXNWYWxpZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGZvcm0ueWlpQWN0aXZlRm9ybSkge1xyXG4gICAgICBmb3JtLm9mZignYWZ0ZXJWYWxpZGF0ZScpO1xyXG4gICAgICBmb3JtLm9uKCdhZnRlclZhbGlkYXRlJywgeWlpVmFsaWRhdGlvbi5iaW5kKGRhdGEpKTtcclxuXHJcbiAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnLCB0cnVlKTtcclxuICAgICAgdmFyIGQgPSBmb3JtLmRhdGEoJ3lpaUFjdGl2ZUZvcm0nKTtcclxuICAgICAgaWYgKGQpIHtcclxuICAgICAgICBkLnZhbGlkYXRlZCA9IHRydWU7XHJcbiAgICAgICAgZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJywgZCk7XHJcbiAgICAgICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScpO1xyXG4gICAgICAgIGlzVmFsaWQgPSBkLnZhbGlkYXRlZDtcclxuICAgICAgfVxyXG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpc1ZhbGlkID0gaXNWYWxpZCAmJiAoZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aCA9PSAwKTtcclxuXHJcbiAgICBpZiAoIWlzVmFsaWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgIHNlbmRGb3JtKGRhdGEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24geWlpVmFsaWRhdGlvbihlKSB7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuXHJcbiAgICBpZihmb3JtLmZpbmQoZGF0YS5wYXJhbS5lcnJvcl9jbGFzcykubGVuZ3RoID09IDApe1xyXG4gICAgICBzZW5kRm9ybSh0aGlzKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2VuZEZvcm0oZGF0YSl7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuXHJcbiAgICBpZiAoIWZvcm0uc2VyaWFsaXplT2JqZWN0KWFkZFNSTygpO1xyXG5cclxuICAgIHZhciBwb3N0RGF0YSA9IGZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XHJcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICBmb3JtLmh0bWwoJycpO1xyXG4gICAgZGF0YS53cmFwLmh0bWwoJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48cD4nK2xnKCdzZW5kaW5nX2RhdGEnKSsnPC9wPjwvZGl2PicpO1xyXG5cclxuICAgIGRhdGEudXJsICs9IChkYXRhLnVybC5pbmRleE9mKCc/JykgPiAwID8gJyYnIDogJz8nKSArICdyYz0nICsgTWF0aC5yYW5kb20oKTtcclxuICAgIC8vY29uc29sZS5sb2coZGF0YS51cmwpO1xyXG5cclxuICAgIC8qaWYoIXBvc3REYXRhLnJldHVyblVybCl7XHJcbiAgICAgIHBvc3REYXRhLnJldHVyblVybD1sb2NhdGlvbi5ocmVmO1xyXG4gICAgfSovXHJcblxyXG4gICAgaWYodHlwZW9mIGxhbmcgIT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhLnVybC5pbmRleE9mKGxhbmdbXCJocmVmX3ByZWZpeFwiXSk9PS0xKXtcclxuICAgICAgZGF0YS51cmw9XCIvXCIrbGFuZ1tcImhyZWZfcHJlZml4XCJdK2RhdGEudXJsO1xyXG4gICAgICBkYXRhLnVybD1kYXRhLnVybC5yZXBsYWNlKCcvLycsJy8nKS5yZXBsYWNlKCcvLycsJy8nKTtcclxuICAgIH1cclxuXHJcbiAgICAkLnBvc3QoXHJcbiAgICAgIGRhdGEudXJsLFxyXG4gICAgICBwb3N0RGF0YSxcclxuICAgICAgb25Qb3N0LmJpbmQoZGF0YSksXHJcbiAgICAgICdqc29uJ1xyXG4gICAgKS5mYWlsKG9uRmFpbC5iaW5kKGRhdGEpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQod3JhcCkge1xyXG4gICAgZm9ybSA9IHdyYXAuZmluZCgnZm9ybScpO1xyXG4gICAgZGF0YSA9IHtcclxuICAgICAgZm9ybTogZm9ybSxcclxuICAgICAgcGFyYW06IGRlZmF1bHRzLFxyXG4gICAgICB3cmFwOiB3cmFwXHJcbiAgICB9O1xyXG4gICAgZGF0YS51cmwgPSBmb3JtLmF0dHIoJ2FjdGlvbicpIHx8IGxvY2F0aW9uLmhyZWY7XHJcbiAgICBkYXRhLm1ldGhvZCA9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xyXG4gICAgZm9ybS51bmJpbmQoJ3N1Ym1pdCcpO1xyXG4gICAgLy9mb3JtLm9mZignc3VibWl0Jyk7XHJcbiAgICBmb3JtLm9uKCdzdWJtaXQnLCBvblN1Ym1pdC5iaW5kKGRhdGEpKTtcclxuICB9XHJcblxyXG4gIGVscy5maW5kKCdbcmVxdWlyZWRdJylcclxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxyXG4gICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJyk7XHJcblxyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgaW5pdChlbHMuZXEoaSkpO1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiBwbGFjZWhvbGRlciA9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHBsYWNlaG9sZGVyKCk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gYWRkU1JPKCkge1xyXG4gICQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG8gPSB7fTtcclxuICAgIHZhciBhID0gdGhpcy5zZXJpYWxpemVBcnJheSgpO1xyXG4gICAgJC5lYWNoKGEsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xyXG4gICAgICAgIGlmICghb1t0aGlzLm5hbWVdLnB1c2gpIHtcclxuICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvW3RoaXMubmFtZV0ucHVzaCh0aGlzLnZhbHVlIHx8ICcnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBvO1xyXG4gIH07XHJcbn07XHJcbmFkZFNSTygpOyIsInZhciBzZFRvb2x0aXAgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIHZhciB0b29sdGlwVGltZU91dCA9IG51bGw7XHJcbiAgICB2YXIgZGlzcGxheVRpbWVPdmVyID0gMDtcclxuICAgIHZhciBkaXNwbGF5VGltZUNsaWNrID0gMzAwMDtcclxuICAgIHZhciBoaWRlVGltZSA9IDEwMDtcclxuICAgIHZhciBhcnJvdyA9IDEwO1xyXG4gICAgdmFyIGFycm93V2lkdGggPSA4O1xyXG4gICAgdmFyIHRvb2x0aXA7XHJcbiAgICB2YXIgc2l6ZSA9ICdzbWFsbCc7XHJcbiAgICB2YXIgaGlkZUNsYXNzID0gJ2hpZGRlbic7XHJcbiAgICB2YXIgdG9vbHRpcEVsZW1lbnRzO1xyXG4gICAgdmFyIGN1cnJlbnRFbGVtZW50O1xyXG5cclxuICAgIGZ1bmN0aW9uIHRvb2x0aXBJbml0KCkge1xyXG4gICAgICAgIHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCd0aXBzb19idWJibGUnKS5hZGRDbGFzcyhzaXplKS5hZGRDbGFzcyhoaWRlQ2xhc3MpXHJcbiAgICAgICAgICAgIC5odG1sKCc8ZGl2IGNsYXNzPVwidGlwc29fYXJyb3dcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGl0c29fdGl0bGVcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGlwc29fY29udGVudFwiPjwvZGl2PicpO1xyXG4gICAgICAgICQodG9vbHRpcCkub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGNoZWNrTW91c2VQb3MoZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh0b29sdGlwKS5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgY2hlY2tNb3VzZVBvcyhlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRvb2x0aXApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoZWNrTW91c2VQb3MoZSkge1xyXG4gICAgICAgIGlmIChlLmNsaWVudFggPiAkKGN1cnJlbnRFbGVtZW50KS5vZmZzZXQoKS5sZWZ0ICYmIGUuY2xpZW50WCA8ICQoY3VycmVudEVsZW1lbnQpLm9mZnNldCgpLmxlZnQgKyAkKGN1cnJlbnRFbGVtZW50KS5vdXRlcldpZHRoKClcclxuICAgICAgICAgICAgJiYgZS5jbGllbnRZID4gJChjdXJyZW50RWxlbWVudCkub2Zmc2V0KCkudG9wICYmIGUuY2xpZW50WSA8ICQoY3VycmVudEVsZW1lbnQpLm9mZnNldCgpLnRvcCArICQoY3VycmVudEVsZW1lbnQpLm91dGVySGVpZ2h0KCkpIHtcclxuICAgICAgICAgICAgdG9vbHRpcFNob3coY3VycmVudEVsZW1lbnQsIGRpc3BsYXlUaW1lT3Zlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRvb2x0aXBTaG93KGVsZW0sIGRpc3BsYXlUaW1lKSB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRvb2x0aXBUaW1lT3V0KTtcclxuXHJcbiAgICAgICAgdmFyIHRpdGxlID0gJChlbGVtKS5kYXRhKCdvcmlnaW5hbC10aXRsZScpO1xyXG4gICAgICAgIHZhciBodG1sID0gJCgnIycrJChlbGVtKS5kYXRhKCdvcmlnaW5hbC1odG1sJykpLmh0bWwoKTtcclxuICAgICAgICBpZiAoaHRtbCkge1xyXG4gICAgICAgICAgICB0aXRsZSA9IGh0bWw7XHJcbiAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ3RpcHNvX2J1YmJsZV9odG1sJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndGlwc29fYnViYmxlX2h0bWwnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gJChlbGVtKS5kYXRhKCdwbGFjZW1lbnQnKSB8fCAnYm90dG9tJztcclxuICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lciBib3R0b21fcmlnaHRfY29ybmVyIHRvcF9sZWZ0X2Nvcm5lciBib3R0b21fbGVmdF9jb3JuZXJcIik7XHJcblxyXG4gICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpdHNvX3RpdGxlJykuaHRtbCh0aXRsZSk7XHJcbiAgICAgICAgc2V0UG9zaXRvbihlbGVtLCBwb3NpdGlvbik7XHJcbiAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcyhoaWRlQ2xhc3MpO1xyXG4gICAgICAgIGN1cnJlbnRFbGVtZW50ID0gZWxlbTtcclxuXHJcbiAgICAgICAgaWYgKGRpc3BsYXlUaW1lID4gMCkge1xyXG4gICAgICAgICAgICB0b29sdGlwVGltZU91dCA9IHNldFRpbWVvdXQodG9vbHRpcEhpZGUsIGRpc3BsYXlUaW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0b29sdGlwSGlkZSgpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodG9vbHRpcFRpbWVPdXQpO1xyXG4gICAgICAgIHRvb2x0aXBUaW1lT3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKGhpZGVDbGFzcyk7XHJcbiAgICAgICAgfSwgaGlkZVRpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldFBvc2l0b24oZWxlbSwgcG9zaXRpb24pe1xyXG4gICAgICAgIHZhciAkZSA9ICQoZWxlbSk7XHJcbiAgICAgICAgdmFyICR3aW4gPSAkKHdpbmRvdyk7XHJcbiAgICAgICAgdmFyIGN1c3RvbVRvcCA9ICQoZWxlbSkuZGF0YSgndG9wJyk7Ly/Qt9Cw0LTQsNC90LAg0L/QvtC30LjRhtC40Y8g0LLQvdGD0YLRgNC4INGN0LvQtdC80LXQvdGC0LBcclxuICAgICAgICB2YXIgY3VzdG9tTGVmdCA9ICQoZWxlbSkuZGF0YSgnbGVmdCcpOy8v0LfQsNC00LDQvdCwINC/0L7Qt9C40YbQuNGPINCy0L3Rg9GC0YDQuCDRjdC70LXQvNC10L3RgtCwXHJcbiAgICAgICAgdmFyIG5vcmV2ZXJ0ID0gJChlbGVtKS5kYXRhKCdub3JldmVydCcpOy8v0L3QtSDQv9C10YDQtdCy0L7RgNCw0YfQuNCy0LDRgtGMXHJcbiAgICAgICAgc3dpdGNoKHBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICBwb3NfbGVmdCA9ICRlLm9mZnNldCgpLmxlZnQgKyAoY3VzdG9tTGVmdCA/IGN1c3RvbUxlZnQgOiAkZS5vdXRlcldpZHRoKCkgLyAyKSAtICQodG9vbHRpcCkub3V0ZXJXaWR0aCgpIC8gMjtcclxuICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgLSAkKHRvb2x0aXApLm91dGVySGVpZ2h0KCkgKyAoY3VzdG9tVG9wID8gY3VzdG9tVG9wIDogMCkgLSBhcnJvdztcclxuICAgICAgICAgICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpcHNvX2Fycm93JykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5MZWZ0OiAtYXJyb3dXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICgocG9zX3RvcCA8ICR3aW4uc2Nyb2xsVG9wKCkpICYmICFub3JldmVydCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgKyhjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAkZS5vdXRlckhlaWdodCgpKSArIGFycm93O1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ2JvdHRvbScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndG9wJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICAgICAgICAgIHBvc19sZWZ0ID0gJGUub2Zmc2V0KCkubGVmdCArIChjdXN0b21MZWZ0ID8gY3VzdG9tTGVmdCA6ICRlLm91dGVyV2lkdGgoKSAvIDIpIC0gJCh0b29sdGlwKS5vdXRlcldpZHRoKCkgLyAyO1xyXG4gICAgICAgICAgICAgICAgcG9zX3RvcCA9ICRlLm9mZnNldCgpLnRvcCArIChjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAkZS5vdXRlckhlaWdodCgpKSArIGFycm93O1xyXG4gICAgICAgICAgICAgICAgJCh0b29sdGlwKS5maW5kKCcudGlwc29fYXJyb3cnKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQ6IC1hcnJvd1dpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJydcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKChwb3NfdG9wICsgJCh0b29sdGlwKS5oZWlnaHQoKSA+ICR3aW4uc2Nyb2xsVG9wKCkgKyAkd2luLm91dGVySGVpZ2h0KCkpICYmICFub3JldmVydCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgLSAkKHRvb2x0aXApLmhlaWdodCgpICsgKGN1c3RvbVRvcCA/IGN1c3RvbVRvcCA6IDApIC0gYXJyb3c7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndG9wJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKCd0b3AgYm90dG9tIGxlZnQgcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCdib3R0b20nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKHRvb2x0aXApLmNzcyh7XHJcbiAgICAgICAgICAgIGxlZnQ6ICBwb3NfbGVmdCxcclxuICAgICAgICAgICAgdG9wOiBwb3NfdG9wXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gc2V0RXZlbnRzKCkge1xyXG5cclxuICAgICAgICB0b29sdGlwRWxlbWVudHMgPSAkKCdbZGF0YS10b2dnbGU9dG9vbHRpcF0nKTtcclxuXHJcbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmRhdGEoJ2NsaWNrYWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCh0b29sdGlwKS5oYXNDbGFzcyhoaWRlQ2xhc3MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcFNob3codGhpcywgZGlzcGxheVRpbWVDbGljayk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBIaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRvb2x0aXBFbGVtZW50cy5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IDEwMjQpIHtcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBTaG93KHRoaXMsIGRpc3BsYXlUaW1lT3Zlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0b29sdGlwRWxlbWVudHMub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMDI0KSB7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwU2hvdyh0aGlzLCBkaXNwbGF5VGltZU92ZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24gKCl7XHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMDI0KSB7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwSGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gICAgIHRvb2x0aXBJbml0KCk7XHJcbiAgICAvLyAgICAgc2V0RXZlbnRzKCk7XHJcbiAgICAvLyB9KTtcclxuICAgIC8vXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGluaXQ6IHRvb2x0aXBJbml0LFxyXG4gICAgICAgIHNldEV2ZW50czogc2V0RXZlbnRzXHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIHNkVG9vbHRpcC5pbml0KCk7XHJcbiAgICBzZFRvb2x0aXAuc2V0RXZlbnRzKCk7XHJcbn0pO1xyXG5cclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgJG5vdHlmaV9idG4gPSAkKCcuaGVhZGVyLWxvZ29fbm90eScpO1xyXG4gIGlmICgkbm90eWZpX2J0bi5sZW5ndGggPT0gMCkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdmFyIGhyZWYgPSAnLycrbGFuZy5ocmVmX3ByZWZpeCsnYWNjb3VudC9ub3RpZmljYXRpb24nO1xyXG5cclxuICAkLmdldChocmVmLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhLm5vdGlmaWNhdGlvbnMgfHwgZGF0YS5ub3RpZmljYXRpb25zLmxlbmd0aCA9PSAwKSByZXR1cm47XHJcblxyXG4gICAgdmFyIG91dCA9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWJveD48ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWJveC1pbm5lcj48dWwgY2xhc3M9XCJoZWFkZXItbm90eS1saXN0XCI+JztcclxuICAgICRub3R5ZmlfYnRuLmZpbmQoJ2EnKS5yZW1vdmVBdHRyKCdocmVmJyk7XHJcbiAgICB2YXIgaGFzX25ldyA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm5vdGlmaWNhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgZWwgPSBkYXRhLm5vdGlmaWNhdGlvbnNbaV07XHJcbiAgICAgIHZhciBpc19uZXcgPSAoZWwuaXNfdmlld2VkID09IDAgJiYgZWwudHlwZV9pZCA9PSAyKTtcclxuICAgICAgb3V0ICs9ICc8bGkgY2xhc3M9XCJoZWFkZXItbm90eS1pdGVtJyArIChpc19uZXcgPyAnIGhlYWRlci1ub3R5LWl0ZW1fbmV3JyA6ICcnKSArICdcIj4nO1xyXG4gICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktZGF0YT4nICsgZWwuZGF0YSArICc8L2Rpdj4nO1xyXG4gICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktdGV4dD4nICsgZWwudGV4dCArICc8L2Rpdj4nO1xyXG4gICAgICBvdXQgKz0gJzwvbGk+JztcclxuICAgICAgaGFzX25ldyA9IGhhc19uZXcgfHwgaXNfbmV3O1xyXG4gICAgfVxyXG5cclxuICAgIG91dCArPSAnPC91bD4nO1xyXG4gICAgb3V0ICs9ICc8YSBjbGFzcz1cImJ0biBoZWFkZXItbm90eS1ib3gtYnRuXCIgaHJlZj1cIicraHJlZisnXCI+JyArIGRhdGEuYnRuICsgJzwvYT4nO1xyXG4gICAgb3V0ICs9ICc8L2Rpdj48L2Rpdj4nO1xyXG4gICAgJCgnLmhlYWRlcicpLmFwcGVuZChvdXQpO1xyXG5cclxuICAgIGlmIChoYXNfbmV3KSB7XHJcbiAgICAgICRub3R5ZmlfYnRuLmFkZENsYXNzKCd0b29sdGlwJykuYWRkQ2xhc3MoJ2hhcy1ub3R5Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgJG5vdHlmaV9idG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBpZiAoJCgnLmhlYWRlci1ub3R5LWJveCcpLmhhc0NsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpKSB7XHJcbiAgICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xyXG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5hZGRDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuXHJcbiAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2hhcy1ub3R5JykpIHtcclxuICAgICAgICAgICQucG9zdCgnL2FjY291bnQvbm90aWZpY2F0aW9uJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuaGVhZGVyLWxvZ29fbm90eScpLnJlbW92ZUNsYXNzKCd0b29sdGlwJykucmVtb3ZlQ2xhc3MoJ2hhcy1ub3R5Jyk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLW5vdHktYm94Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xyXG4gICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5oZWFkZXItbm90eS1saXN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KVxyXG4gIH0sICdqc29uJyk7XHJcblxyXG59KSgpO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pZiAodHlwZW9mIG1paGFpbGRldiA9PSBcInVuZGVmaW5lZFwiIHx8ICFtaWhhaWxkZXYpIHtcclxuICAgIHZhciBtaWhhaWxkZXYgPSB7fTtcclxuICAgIG1paGFpbGRldi5lbEZpbmRlciA9IHtcclxuICAgICAgICBvcGVuTWFuYWdlcjogZnVuY3Rpb24ob3B0aW9ucyl7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSBcIm1lbnViYXI9bm8sdG9vbGJhcj1ubyxsb2NhdGlvbj1ubyxkaXJlY3Rvcmllcz1ubyxzdGF0dXM9bm8sZnVsbHNjcmVlbj1ub1wiO1xyXG4gICAgICAgICAgICBpZihvcHRpb25zLndpZHRoID09ICdhdXRvJyl7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLndpZHRoID0gJCh3aW5kb3cpLndpZHRoKCkvMS41O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihvcHRpb25zLmhlaWdodCA9PSAnYXV0bycpe1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5oZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCkvMS41O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMgKyBcIix3aWR0aD1cIiArIG9wdGlvbnMud2lkdGg7XHJcbiAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcyArIFwiLGhlaWdodD1cIiArIG9wdGlvbnMuaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhwYXJhbXMpO1xyXG4gICAgICAgICAgICB2YXIgd2luID0gd2luZG93Lm9wZW4ob3B0aW9ucy51cmwsICdFbEZpbmRlck1hbmFnZXInICsgb3B0aW9ucy5pZCwgcGFyYW1zKTtcclxuICAgICAgICAgICAgd2luLmZvY3VzKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uczoge30sXHJcbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGlkLCBmdW5jKXtcclxuICAgICAgICAgICAgdGhpcy5mdW5jdGlvbnNbaWRdID0gZnVuYztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNhbGxGdW5jdGlvbjogZnVuY3Rpb24oaWQsIGZpbGUpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mdW5jdGlvbnNbaWRdKGZpbGUsIGlkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uUmV0dXJuVG9JbnB1dDogZnVuY3Rpb24oZmlsZSwgaWQpe1xyXG4gICAgICAgICAgICBqUXVlcnkoJyMnICsgaWQpLnZhbChmaWxlLnVybCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG59XHJcblxyXG5cclxuXHJcbnZhciBtZWdhc2xpZGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgc2xpZGVyX2RhdGEgPSBmYWxzZTtcclxuICB2YXIgY29udGFpbmVyX2lkID0gXCJzZWN0aW9uI21lZ2Ffc2xpZGVyXCI7XHJcbiAgdmFyIHBhcmFsbGF4X2dyb3VwID0gZmFsc2U7XHJcbiAgdmFyIHBhcmFsbGF4X3RpbWVyID0gZmFsc2U7XHJcbiAgdmFyIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xyXG4gIHZhciBwYXJhbGxheF9kID0gMTtcclxuICB2YXIgbW9iaWxlX21vZGUgPSAtMTtcclxuICB2YXIgbWF4X3RpbWVfbG9hZF9waWMgPSAzMDA7XHJcbiAgdmFyIG1vYmlsZV9zaXplID0gNzAwO1xyXG4gIHZhciByZW5kZXJfc2xpZGVfbm9tID0gMDtcclxuICB2YXIgdG90X2ltZ193YWl0O1xyXG4gIHZhciBzbGlkZXM7XHJcbiAgdmFyIHNsaWRlX3NlbGVjdF9ib3g7XHJcbiAgdmFyIGVkaXRvcjtcclxuICB2YXIgdGltZW91dElkO1xyXG4gIHZhciBzY3JvbGxfcGVyaW9kID0gNjAwMDtcclxuXHJcbiAgdmFyIHBvc0FyciA9IFtcclxuICAgICdzbGlkZXJfX3RleHQtbHQnLCAnc2xpZGVyX190ZXh0LWN0JywgJ3NsaWRlcl9fdGV4dC1ydCcsXHJcbiAgICAnc2xpZGVyX190ZXh0LWxjJywgJ3NsaWRlcl9fdGV4dC1jYycsICdzbGlkZXJfX3RleHQtcmMnLFxyXG4gICAgJ3NsaWRlcl9fdGV4dC1sYicsICdzbGlkZXJfX3RleHQtY2InLCAnc2xpZGVyX190ZXh0LXJiJyxcclxuICBdO1xyXG4gIHZhciBwb3NfbGlzdCA9IFtcclxuICAgICfQm9C10LLQviDQstC10YDRhScsICfRhtC10L3RgtGAINCy0LXRgNGFJywgJ9C/0YDQsNCy0L4g0LLQtdGA0YUnLFxyXG4gICAgJ9Cb0LXQstC+INGG0LXQvdGC0YAnLCAn0YbQtdC90YLRgCcsICfQv9GA0LDQstC+INGG0LXQvdGC0YAnLFxyXG4gICAgJ9Cb0LXQstC+INC90LjQtycsICfRhtC10L3RgtGAINC90LjQtycsICfQv9GA0LDQstC+INC90LjQtycsXHJcbiAgXTtcclxuICB2YXIgc2hvd19kZWxheSA9IFtcclxuICAgICdzaG93X25vX2RlbGF5JyxcclxuICAgICdzaG93X2RlbGF5XzA1JyxcclxuICAgICdzaG93X2RlbGF5XzEwJyxcclxuICAgICdzaG93X2RlbGF5XzE1JyxcclxuICAgICdzaG93X2RlbGF5XzIwJyxcclxuICAgICdzaG93X2RlbGF5XzI1JyxcclxuICAgICdzaG93X2RlbGF5XzMwJ1xyXG4gIF07XHJcbiAgdmFyIGhpZGVfZGVsYXkgPSBbXHJcbiAgICAnaGlkZV9ub19kZWxheScsXHJcbiAgICAnaGlkZV9kZWxheV8wNScsXHJcbiAgICAnaGlkZV9kZWxheV8xMCcsXHJcbiAgICAnaGlkZV9kZWxheV8xNScsXHJcbiAgICAnaGlkZV9kZWxheV8yMCdcclxuICBdO1xyXG4gIHZhciB5ZXNfbm9fYXJyID0gW1xyXG4gICAgJ25vJyxcclxuICAgICd5ZXMnXHJcbiAgXTtcclxuICB2YXIgeWVzX25vX3ZhbCA9IFtcclxuICAgICcnLFxyXG4gICAgJ2ZpeGVkX19mdWxsLWhlaWdodCdcclxuICBdO1xyXG4gIHZhciBidG5fc3R5bGUgPSBbXHJcbiAgICAnbm9uZScsXHJcbiAgICAnYm9yZG8nLFxyXG4gICAgJ2JsYWNrJyxcclxuICAgICdibHVlJyxcclxuICAgICdkYXJrLWJsdWUnLFxyXG4gICAgJ3JlZCcsXHJcbiAgICAnb3JhbmdlJyxcclxuICAgICdncmVlbicsXHJcbiAgICAnbGlnaHQtZ3JlZW4nLFxyXG4gICAgJ2RhcmstZ3JlZW4nLFxyXG4gICAgJ3BpbmsnLFxyXG4gICAgJ3llbGxvdydcclxuICBdO1xyXG4gIHZhciBzaG93X2FuaW1hdGlvbnMgPSBbXHJcbiAgICBcIm5vdF9hbmltYXRlXCIsXHJcbiAgICBcImJvdW5jZUluXCIsXHJcbiAgICBcImJvdW5jZUluRG93blwiLFxyXG4gICAgXCJib3VuY2VJbkxlZnRcIixcclxuICAgIFwiYm91bmNlSW5SaWdodFwiLFxyXG4gICAgXCJib3VuY2VJblVwXCIsXHJcbiAgICBcImZhZGVJblwiLFxyXG4gICAgXCJmYWRlSW5Eb3duXCIsXHJcbiAgICBcImZhZGVJbkxlZnRcIixcclxuICAgIFwiZmFkZUluUmlnaHRcIixcclxuICAgIFwiZmFkZUluVXBcIixcclxuICAgIFwiZmxpcEluWFwiLFxyXG4gICAgXCJmbGlwSW5ZXCIsXHJcbiAgICBcImxpZ2h0U3BlZWRJblwiLFxyXG4gICAgXCJyb3RhdGVJblwiLFxyXG4gICAgXCJyb3RhdGVJbkRvd25MZWZ0XCIsXHJcbiAgICBcInJvdGF0ZUluVXBMZWZ0XCIsXHJcbiAgICBcInJvdGF0ZUluVXBSaWdodFwiLFxyXG4gICAgXCJqYWNrSW5UaGVCb3hcIixcclxuICAgIFwicm9sbEluXCIsXHJcbiAgICBcInpvb21JblwiXHJcbiAgXTtcclxuXHJcbiAgdmFyIGhpZGVfYW5pbWF0aW9ucyA9IFtcclxuICAgIFwibm90X2FuaW1hdGVcIixcclxuICAgIFwiYm91bmNlT3V0XCIsXHJcbiAgICBcImJvdW5jZU91dERvd25cIixcclxuICAgIFwiYm91bmNlT3V0TGVmdFwiLFxyXG4gICAgXCJib3VuY2VPdXRSaWdodFwiLFxyXG4gICAgXCJib3VuY2VPdXRVcFwiLFxyXG4gICAgXCJmYWRlT3V0XCIsXHJcbiAgICBcImZhZGVPdXREb3duXCIsXHJcbiAgICBcImZhZGVPdXRMZWZ0XCIsXHJcbiAgICBcImZhZGVPdXRSaWdodFwiLFxyXG4gICAgXCJmYWRlT3V0VXBcIixcclxuICAgIFwiZmxpcE91dFhcIixcclxuICAgIFwibGlwT3V0WVwiLFxyXG4gICAgXCJsaWdodFNwZWVkT3V0XCIsXHJcbiAgICBcInJvdGF0ZU91dFwiLFxyXG4gICAgXCJyb3RhdGVPdXREb3duTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVPdXREb3duUmlnaHRcIixcclxuICAgIFwicm90YXRlT3V0VXBMZWZ0XCIsXHJcbiAgICBcInJvdGF0ZU91dFVwUmlnaHRcIixcclxuICAgIFwiaGluZ2VcIixcclxuICAgIFwicm9sbE91dFwiXHJcbiAgXTtcclxuICB2YXIgc3RUYWJsZTtcclxuICB2YXIgcGFyYWxheFRhYmxlO1xyXG5cclxuICBmdW5jdGlvbiBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWxzKSB7XHJcbiAgICBpZiAoZWxzLmxlbmd0aCA9PSAwKXJldHVybjtcclxuICAgIGVscy53cmFwKCc8ZGl2IGNsYXNzPVwic2VsZWN0X2ltZ1wiPicpO1xyXG4gICAgZWxzID0gZWxzLnBhcmVudCgpO1xyXG4gICAgZWxzLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmaWxlX2J1dHRvblwiPjxpIGNsYXNzPVwibWNlLWljbyBtY2UtaS1icm93c2VcIj48L2k+PC9idXR0b24+Jyk7XHJcbiAgICAvKmVscy5maW5kKCdidXR0b24nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcclxuICAgICAkKCcjcm94eUN1c3RvbVBhbmVsMicpLmFkZENsYXNzKCdvcGVuJylcclxuICAgICB9KTsqL1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gZWxzLmVxKGkpLmZpbmQoJ2lucHV0Jyk7XHJcbiAgICAgIGlmICghZWwuYXR0cignaWQnKSkge1xyXG4gICAgICAgIGVsLmF0dHIoJ2lkJywgJ2ZpbGVfJyArIGkgKyAnXycgKyBEYXRlLm5vdygpKVxyXG4gICAgICB9XHJcbiAgICAgIHZhciB0X2lkID0gZWwuYXR0cignaWQnKTtcclxuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLnJlZ2lzdGVyKHRfaWQsIGZ1bmN0aW9uIChmaWxlLCBpZCkge1xyXG4gICAgICAgIC8vJCh0aGlzKS52YWwoZmlsZS51cmwpLnRyaWdnZXIoJ2NoYW5nZScsIFtmaWxlLCBpZF0pO1xyXG4gICAgICAgICQoJyMnICsgaWQpLnZhbChmaWxlLnVybCkuY2hhbmdlKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZmlsZV9idXR0b24nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcykucHJldigpO1xyXG4gICAgICB2YXIgaWQgPSAkdGhpcy5hdHRyKCdpZCcpO1xyXG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIub3Blbk1hbmFnZXIoe1xyXG4gICAgICAgIFwidXJsXCI6IFwiL21hbmFnZXIvZWxmaW5kZXI/ZmlsdGVyPWltYWdlJmNhbGxiYWNrPVwiICsgaWQgKyBcIiZsYW5nPXJ1XCIsXHJcbiAgICAgICAgXCJ3aWR0aFwiOiBcImF1dG9cIixcclxuICAgICAgICBcImhlaWdodFwiOiBcImF1dG9cIixcclxuICAgICAgICBcImlkXCI6IGlkXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5JbnB1dChkYXRhKSB7XHJcbiAgICB2YXIgaW5wdXQgPSAnPGlucHV0IGNsYXNzPVwiJyArIChkYXRhLmlucHV0Q2xhc3MgfHwgJycpICsgJ1wiIHZhbHVlPVwiJyArIChkYXRhLnZhbHVlIHx8ICcnKSArICdcIj4nO1xyXG4gICAgaWYgKGRhdGEubGFiZWwpIHtcclxuICAgICAgaW5wdXQgPSAnPGxhYmVsPjxzcGFuPicgKyBkYXRhLmxhYmVsICsgJzwvc3Bhbj4nICsgaW5wdXQgKyAnPC9sYWJlbD4nO1xyXG4gICAgfVxyXG4gICAgaWYgKGRhdGEucGFyZW50KSB7XHJcbiAgICAgIGlucHV0ID0gJzwnICsgZGF0YS5wYXJlbnQgKyAnPicgKyBpbnB1dCArICc8LycgKyBkYXRhLnBhcmVudCArICc+JztcclxuICAgIH1cclxuICAgIGlucHV0ID0gJChpbnB1dCk7XHJcblxyXG4gICAgaWYgKGRhdGEub25DaGFuZ2UpIHtcclxuICAgICAgdmFyIG9uQ2hhbmdlO1xyXG4gICAgICBpZiAoZGF0YS5iaW5kKSB7XHJcbiAgICAgICAgZGF0YS5iaW5kLmlucHV0ID0gaW5wdXQuZmluZCgnaW5wdXQnKTtcclxuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChkYXRhLmJpbmQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGlucHV0LmZpbmQoJ2lucHV0JykpO1xyXG4gICAgICB9XHJcbiAgICAgIGlucHV0LmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIG9uQ2hhbmdlKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlucHV0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuU2VsZWN0KGRhdGEpIHtcclxuICAgIHZhciBpbnB1dCA9ICQoJzxzZWxlY3QvPicpO1xyXG5cclxuICAgIHZhciBlbCA9IHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdO1xyXG4gICAgaWYgKGRhdGEuaW5kZXggIT09IGZhbHNlKSB7XHJcbiAgICAgIGVsID0gZWxbZGF0YS5pbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVsW2RhdGEucGFyYW1dKSB7XHJcbiAgICAgIGRhdGEudmFsdWUgPSBlbFtkYXRhLnBhcmFtXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRhdGEudmFsdWUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkYXRhLnN0YXJ0X29wdGlvbikge1xyXG4gICAgICBpbnB1dC5hcHBlbmQoZGF0YS5zdGFydF9vcHRpb24pXHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHZhbDtcclxuICAgICAgdmFyIHR4dCA9IGRhdGEubGlzdFtpXTtcclxuICAgICAgaWYgKGRhdGEudmFsX3R5cGUgPT0gMCkge1xyXG4gICAgICAgIHZhbCA9IGRhdGEubGlzdFtpXTtcclxuICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbF90eXBlID09IDEpIHtcclxuICAgICAgICB2YWwgPSBpO1xyXG4gICAgICB9IGVsc2UgaWYgKGRhdGEudmFsX3R5cGUgPT0gMikge1xyXG4gICAgICAgIC8vdmFsPWRhdGEudmFsX2xpc3RbaV07XHJcbiAgICAgICAgdmFsID0gaTtcclxuICAgICAgICB0eHQgPSBkYXRhLnZhbF9saXN0W2ldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2VsID0gKHZhbCA9PSBkYXRhLnZhbHVlID8gJ3NlbGVjdGVkJyA6ICcnKTtcclxuICAgICAgaWYgKHNlbCA9PSAnc2VsZWN0ZWQnKSB7XHJcbiAgICAgICAgaW5wdXQuYXR0cigndF92YWwnLCBkYXRhLmxpc3RbaV0pO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBvcHRpb24gPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyB2YWwgKyAnXCIgJyArIHNlbCArICc+JyArIHR4dCArICc8L29wdGlvbj4nO1xyXG4gICAgICBpZiAoZGF0YS52YWxfdHlwZSA9PSAyKSB7XHJcbiAgICAgICAgb3B0aW9uID0gJChvcHRpb24pLmF0dHIoJ2NvZGUnLCBkYXRhLmxpc3RbaV0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlucHV0LmFwcGVuZChvcHRpb24pXHJcbiAgICB9XHJcblxyXG4gICAgaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgZGF0YSA9IHRoaXM7XHJcbiAgICAgIHZhciB2YWwgPSBkYXRhLmVsLnZhbCgpO1xyXG4gICAgICB2YXIgc2xfb3AgPSBkYXRhLmVsLmZpbmQoJ29wdGlvblt2YWx1ZT0nICsgdmFsICsgJ10nKTtcclxuICAgICAgdmFyIGNscyA9IHNsX29wLnRleHQoKTtcclxuICAgICAgdmFyIGNoID0gc2xfb3AuYXR0cignY29kZScpO1xyXG4gICAgICBpZiAoIWNoKWNoID0gY2xzO1xyXG4gICAgICBpZiAoZGF0YS5pbmRleCAhPT0gZmFsc2UpIHtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLmluZGV4XVtkYXRhLnBhcmFtXSA9IHZhbDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLnBhcmFtXSA9IHZhbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgZGF0YS5vYmoucmVtb3ZlQ2xhc3MoZGF0YS5wcmVmaXggKyBkYXRhLmVsLmF0dHIoJ3RfdmFsJykpO1xyXG4gICAgICBkYXRhLm9iai5hZGRDbGFzcyhkYXRhLnByZWZpeCArIGNoKTtcclxuICAgICAgZGF0YS5lbC5hdHRyKCd0X3ZhbCcsIGNoKTtcclxuXHJcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOiBpbnB1dCxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogZGF0YS5wYXJhbSxcclxuICAgICAgcHJlZml4OiBkYXRhLnByZWZpeCB8fCAnJ1xyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmIChkYXRhLnBhcmVudCkge1xyXG4gICAgICB2YXIgcGFyZW50ID0gJCgnPCcgKyBkYXRhLnBhcmVudCArICcvPicpO1xyXG4gICAgICBwYXJlbnQuYXBwZW5kKGlucHV0KTtcclxuICAgICAgcmV0dXJuIHBhcmVudDtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKGRhdGEpIHtcclxuICAgIHZhciBhbmltX3NlbCA9IFtdO1xyXG4gICAgdmFyIG91dDtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+U2hvdyBhbmltYXRpb248L3NwYW4+Jyk7XHJcbiAgICB9XHJcbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHNob3dfYW5pbWF0aW9ucyxcclxuICAgICAgdmFsX3R5cGU6IDAsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ICdzaG93X2FuaW1hdGlvbicsXHJcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcclxuICAgIH0pKTtcclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5TaG93IGRlbGF5PC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBzaG93X2RlbGF5LFxyXG4gICAgICB2YWxfdHlwZTogMSxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogJ3Nob3dfZGVsYXknLFxyXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XHJcbiAgICB9KSk7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxici8+Jyk7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPkhpZGUgYW5pbWF0aW9uPC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBoaWRlX2FuaW1hdGlvbnMsXHJcbiAgICAgIHZhbF90eXBlOiAwLFxyXG4gICAgICBvYmo6IGRhdGEub2JqLFxyXG4gICAgICBncjogZGF0YS5ncixcclxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXHJcbiAgICAgIHBhcmFtOiAnaGlkZV9hbmltYXRpb24nLFxyXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XHJcbiAgICB9KSk7XHJcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+SGlkZSBkZWxheTwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogaGlkZV9kZWxheSxcclxuICAgICAgdmFsX3R5cGU6IDEsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ICdoaWRlX2RlbGF5JyxcclxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcclxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xyXG4gICAgICBvdXQgPSAkKCc8ZGl2IGNsYXNzPVwiYW5pbV9zZWxcIi8+Jyk7XHJcbiAgICAgIG91dC5hcHBlbmQoYW5pbV9zZWwpO1xyXG4gICAgfVxyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAxKSB7XHJcbiAgICAgIG91dCA9IGFuaW1fc2VsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvdXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0X2VkaXRvcigpIHtcclxuICAgICQoJyN3MScpLnJlbW92ZSgpO1xyXG4gICAgJCgnI3cxX2J1dHRvbicpLnJlbW92ZSgpO1xyXG4gICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gc2xpZGVyX2RhdGFbMF0ubW9iaWxlLnNwbGl0KCc/JylbMF07XHJcblxyXG4gICAgdmFyIGVsID0gJCgnI21lZ2Ffc2xpZGVyX2NvbnRyb2xlJyk7XHJcbiAgICB2YXIgYnRuc19ib3ggPSAkKCc8ZGl2IGNsYXNzPVwiYnRuX2JveFwiLz4nKTtcclxuXHJcbiAgICBlbC5hcHBlbmQoJzxoMj7Qo9C/0YDQsNCy0LvQtdC90LjQtTwvaDI+Jyk7XHJcbiAgICBlbC5hcHBlbmQoJCgnPHRleHRhcmVhLz4nLCB7XHJcbiAgICAgIHRleHQ6IEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSxcclxuICAgICAgaWQ6ICdzbGlkZV9kYXRhJyxcclxuICAgICAgbmFtZTogZWRpdG9yXHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGJ0biA9ICQoJzxidXR0b24gY2xhc3M9XCJcIi8+JykudGV4dChcItCQ0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xyXG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XHJcbiAgICBidG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdoaWRlX3NsaWRlJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgYnRuID0gJCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JTQtdCw0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xyXG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XHJcbiAgICBidG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmFkZENsYXNzKCdoaWRlX3NsaWRlJyk7XHJcbiAgICB9KTtcclxuICAgIGVsLmFwcGVuZChidG5zX2JveCk7XHJcblxyXG4gICAgZWwuYXBwZW5kKCc8aDI+0J7QsdGJ0LjQtSDQv9Cw0YDQsNC80LXRgtGA0Ys8L2gyPicpO1xyXG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLm1vYmlsZSxcclxuICAgICAgbGFiZWw6IFwi0KHQu9Cw0LnQtCDQtNC70Y8g0YLQtdC70LXRhNC+0L3QsFwiLFxyXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9ICQodGhpcykudmFsKClcclxuICAgICAgICAkKCcubW9iX2JnJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgc2xpZGVyX2RhdGFbMF0ubW9iaWxlICsgJyknKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0uZm9uLFxyXG4gICAgICBsYWJlbDogXCLQntGB0L3QvtC90L7QuSDRhNC+0L1cIixcclxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5mb24gPSAkKHRoaXMpLnZhbCgpXHJcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIHNsaWRlcl9kYXRhWzBdLmZvbiArICcpJylcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgYnRuX2NoID0gJCgnPGRpdiBjbGFzcz1cImJ0bnNcIi8+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKCc8aDM+0JrQvdC+0L/QutCwINC/0LXRgNC10YXQvtC00LAo0LTQu9GPINCf0Jog0LLQtdGA0YHQuNC4KTwvaDM+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0LFxyXG4gICAgICBsYWJlbDogXCLQotC10LrRgdGCXCIsXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS50ZXh0KHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0KTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH0sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGJ1dF9zbCA9ICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCk7XHJcbiAgICBidG5fY2guYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmLFxyXG4gICAgICBsYWJlbDogXCLQodGB0YvQu9C60LBcIixcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApLmF0dHIoJ2hyZWYnLHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH0sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgYnRuX2NoLmFwcGVuZCgnPGJyLz4nKTtcclxuICAgIHZhciB3cmFwX2xhYiA9ICQoJzxsYWJlbC8+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKHdyYXBfbGFiKTtcclxuICAgIHdyYXBfbGFiLmFwcGVuZCgnPHNwYW4+0J7RhNC+0YDQvNC70LXQvdC40LUg0LrQvdC+0L/QutC4PC9zcGFuPicpO1xyXG4gICAgd3JhcF9sYWIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IGJ0bl9zdHlsZSxcclxuICAgICAgdmFsX3R5cGU6IDAsXHJcbiAgICAgIG9iajogYnV0X3NsLFxyXG4gICAgICBncjogJ2J1dHRvbicsXHJcbiAgICAgIGluZGV4OiBmYWxzZSxcclxuICAgICAgcGFyYW06ICdjb2xvcidcclxuICAgIH0pKTtcclxuXHJcbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xyXG4gICAgd3JhcF9sYWIgPSAkKCc8bGFiZWwvPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZCh3cmFwX2xhYik7XHJcbiAgICB3cmFwX2xhYi5hcHBlbmQoJzxzcGFuPtCf0L7Qu9C+0LbQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XHJcbiAgICB3cmFwX2xhYi5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogcG9zQXJyLFxyXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXHJcbiAgICAgIHZhbF90eXBlOiAyLFxyXG4gICAgICBvYmo6IGJ1dF9zbC5wYXJlbnQoKS5wYXJlbnQoKSxcclxuICAgICAgZ3I6ICdidXR0b24nLFxyXG4gICAgICBpbmRleDogZmFsc2UsXHJcbiAgICAgIHBhcmFtOiAncG9zJ1xyXG4gICAgfSkpO1xyXG5cclxuICAgIGJ0bl9jaC5hcHBlbmQoZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoe1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICBvYmo6IGJ1dF9zbC5wYXJlbnQoKSxcclxuICAgICAgZ3I6ICdidXR0b24nLFxyXG4gICAgICBpbmRleDogZmFsc2VcclxuICAgIH0pKTtcclxuICAgIGVsLmFwcGVuZChidG5fY2gpO1xyXG5cclxuICAgIHZhciBsYXllciA9ICQoJzxkaXYgY2xhc3M9XCJmaXhlZF9sYXllclwiLz4nKTtcclxuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCh0YLQsNGC0LjRh9C10YHQutC40LUg0YHQu9C+0Lg8L2gyPicpO1xyXG4gICAgdmFyIHRoID0gXCI8dGg+4oSWPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCh0LvQvtC5INC90LAg0LLRgdGOINCy0YvRgdC+0YLRgzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC/0L7Rj9Cy0LvQtdC90LjRjzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7Ql9Cw0LTQtdGA0LbQutCwINC/0L7Rj9Cy0LvQtdC90LjRjzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7Ql9Cw0LTQtdGA0LbQutCwINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QlNC10LnRgdGC0LLQuNC1PC90aD5cIjtcclxuICAgIHN0VGFibGUgPSAkKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nICsgdGggKyAnPC90cj48L3RhYmxlPicpO1xyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVswXS5maXhlZDtcclxuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhZGRUclN0YXRpYyhkYXRhW2ldKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGF5ZXIuYXBwZW5kKHN0VGFibGUpO1xyXG4gICAgdmFyIGFkZEJ0biA9ICQoJzxidXR0b24vPicsIHtcclxuICAgICAgdGV4dDogXCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcclxuICAgIH0pO1xyXG4gICAgYWRkQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZGF0YSA9IGFkZFRyU3RhdGljKGZhbHNlKTtcclxuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XHJcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xyXG5cclxuICAgIHZhciBsYXllciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGF4X2xheWVyXCIvPicpO1xyXG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0J/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuDwvaDI+Jyk7XHJcbiAgICB2YXIgdGggPSBcIjx0aD7ihJY8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JrQsNGA0YLQuNC90LrQsDwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0KPQtNCw0LvQtdC90L3QvtGB0YLRjCAo0YbQtdC70L7QtSDQv9C+0LvQvtC20LjRgtC10LvRjNC90L7QtSDRh9C40YHQu9C+KTwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QlNC10LnRgdGC0LLQuNC1PC90aD5cIjtcclxuXHJcbiAgICBwYXJhbGF4VGFibGUgPSAkKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nICsgdGggKyAnPC90cj48L3RhYmxlPicpO1xyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVswXS5wYXJhbGF4O1xyXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFkZFRyUGFyYWxheChkYXRhW2ldKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGF5ZXIuYXBwZW5kKHBhcmFsYXhUYWJsZSk7XHJcbiAgICB2YXIgYWRkQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xyXG4gICAgICB0ZXh0OiBcItCU0L7QsdCw0LLQuNGC0Ywg0YHQu9C+0LlcIlxyXG4gICAgfSk7XHJcbiAgICBhZGRCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBkYXRhID0gYWRkVHJQYXJhbGF4KGZhbHNlKTtcclxuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG5cclxuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xyXG4gICAgZWwuYXBwZW5kKGxheWVyKTtcclxuXHJcbiAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWwuZmluZCgnLmZpbGVTZWxlY3QnKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRUclN0YXRpYyhkYXRhKSB7XHJcbiAgICB2YXIgaSA9IHN0VGFibGUuZmluZCgndHInKS5sZW5ndGggLSAxO1xyXG4gICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgXCJpbWdcIjogXCJcIixcclxuICAgICAgICBcImZ1bGxfaGVpZ2h0XCI6IDAsXHJcbiAgICAgICAgXCJwb3NcIjogMCxcclxuICAgICAgICBcInNob3dfZGVsYXlcIjogMSxcclxuICAgICAgICBcInNob3dfYW5pbWF0aW9uXCI6IFwibGlnaHRTcGVlZEluXCIsXHJcbiAgICAgICAgXCJoaWRlX2RlbGF5XCI6IDEsXHJcbiAgICAgICAgXCJoaWRlX2FuaW1hdGlvblwiOiBcImJvdW5jZU91dFwiXHJcbiAgICAgIH07XHJcbiAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkLnB1c2goZGF0YSk7XHJcbiAgICAgIHZhciBmaXggPSAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwJyk7XHJcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICA7XHJcblxyXG4gICAgdmFyIHRyID0gJCgnPHRyLz4nKTtcclxuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcclxuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBkYXRhLmltZyxcclxuICAgICAgbGFiZWw6IGZhbHNlLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBiaW5kOiB7XHJcbiAgICAgICAgZ3I6ICdmaXhlZCcsXHJcbiAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgcGFyYW06ICdpbWcnLFxyXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxyXG4gICAgICB9LFxyXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgICAgIGRhdGEub2JqLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW5wdXQudmFsKCkgKyAnKScpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkW2RhdGEuaW5kZXhdLmltZyA9IGRhdGEuaW5wdXQudmFsKCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogcG9zQXJyLFxyXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXHJcbiAgICAgIHZhbF90eXBlOiAyLFxyXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLFxyXG4gICAgICBncjogJ2ZpeGVkJyxcclxuICAgICAgaW5kZXg6IGksXHJcbiAgICAgIHBhcmFtOiAncG9zJyxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHllc19ub192YWwsXHJcbiAgICAgIHZhbF9saXN0OiB5ZXNfbm9fYXJyLFxyXG4gICAgICB2YWxfdHlwZTogMixcclxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKSxcclxuICAgICAgZ3I6ICdmaXhlZCcsXHJcbiAgICAgIGluZGV4OiBpLFxyXG4gICAgICBwYXJhbTogJ2Z1bGxfaGVpZ2h0JyxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcclxuICAgICAgdHlwZTogMSxcclxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5maW5kKCcuYW5pbWF0aW9uX2xheWVyJyksXHJcbiAgICAgIGdyOiAnZml4ZWQnLFxyXG4gICAgICBpbmRleDogaSxcclxuICAgICAgcGFyZW50OiAndGQnXHJcbiAgICB9KSk7XHJcbiAgICB2YXIgZGVsQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xyXG4gICAgICB0ZXh0OiBcItCj0LTQsNC70LjRgtGMXCJcclxuICAgIH0pO1xyXG4gICAgZGVsQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzLmVsKTtcclxuICAgICAgaSA9ICR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKSAtIDE7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxyXG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxyXG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLmZpeGVkLnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOiBkZWxCdG4sXHJcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0blRkID0gJCgnPHRkLz4nKS5hcHBlbmQoZGVsQnRuKTtcclxuICAgIHRyLmFwcGVuZChkZWxCdG5UZCk7XHJcbiAgICBzdFRhYmxlLmFwcGVuZCh0cilcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlZGl0b3I6IHRyLFxyXG4gICAgICBkYXRhOiBkYXRhXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRUclBhcmFsYXgoZGF0YSkge1xyXG4gICAgdmFyIGkgPSBwYXJhbGF4VGFibGUuZmluZCgndHInKS5sZW5ndGggLSAxO1xyXG4gICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgXCJpbWdcIjogXCJcIixcclxuICAgICAgICBcInpcIjogMVxyXG4gICAgICB9O1xyXG4gICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4LnB1c2goZGF0YSk7XHJcbiAgICAgIHZhciBwYXJhbGF4X2dyID0gJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAnKTtcclxuICAgICAgYWRkUGFyYWxheExheWVyKGRhdGEsIHBhcmFsYXhfZ3IpO1xyXG4gICAgfVxyXG4gICAgO1xyXG4gICAgdmFyIHRyID0gJCgnPHRyLz4nKTtcclxuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcclxuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBkYXRhLmltZyxcclxuICAgICAgbGFiZWw6IGZhbHNlLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBiaW5kOiB7XHJcbiAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgcGFyYW06ICdpbWcnLFxyXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLmZpbmQoJ3NwYW4nKSxcclxuICAgICAgfSxcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmlucHV0LnZhbCgpICsgJyknKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLmltZyA9IGRhdGEuaW5wdXQudmFsKCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogcG9zQXJyLFxyXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXHJcbiAgICAgIHZhbF90eXBlOiAyLFxyXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXHJcbiAgICAgIGdyOiAncGFyYWxheCcsXHJcbiAgICAgIGluZGV4OiBpLFxyXG4gICAgICBwYXJhbTogJ3BvcycsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgICAgc3RhcnRfb3B0aW9uOiAnPG9wdGlvbiB2YWx1ZT1cIlwiIGNvZGU9XCJcIj7QvdCwINCy0LXRgdGMINGN0LrRgNCw0L08L29wdGlvbj4nXHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogZGF0YS56LFxyXG4gICAgICBsYWJlbDogZmFsc2UsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgICAgYmluZDoge1xyXG4gICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcclxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKSxcclxuICAgICAgfSxcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgICAgICBkYXRhLm9iai5hdHRyKCd6JywgZGF0YS5pbnB1dC52YWwoKSk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS56ID0gZGF0YS5pbnB1dC52YWwoKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgZGVsQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xyXG4gICAgICB0ZXh0OiBcItCj0LTQsNC70LjRgtGMXCJcclxuICAgIH0pO1xyXG4gICAgZGVsQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzLmVsKTtcclxuICAgICAgaSA9ICR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKSAtIDE7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxyXG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxyXG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLnBhcmFsYXguc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXHJcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgfS5iaW5kKHtcclxuICAgICAgZWw6IGRlbEJ0bixcclxuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXHJcbiAgICB9KSk7XHJcbiAgICB2YXIgZGVsQnRuVGQgPSAkKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xyXG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcclxuICAgIHBhcmFsYXhUYWJsZS5hcHBlbmQodHIpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZWRpdG9yOiB0cixcclxuICAgICAgZGF0YTogZGF0YVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkX2FuaW1hdGlvbihlbCwgZGF0YSkge1xyXG4gICAgdmFyIG91dCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgJ2NsYXNzJzogJ2FuaW1hdGlvbl9sYXllcidcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICh0eXBlb2YoZGF0YS5zaG93X2RlbGF5KSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICBvdXQuYWRkQ2xhc3Moc2hvd19kZWxheVtkYXRhLnNob3dfZGVsYXldKTtcclxuICAgICAgaWYgKGRhdGEuc2hvd19hbmltYXRpb24pIHtcclxuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycgKyBkYXRhLnNob3dfYW5pbWF0aW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YoZGF0YS5oaWRlX2RlbGF5KSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICBvdXQuYWRkQ2xhc3MoaGlkZV9kZWxheVtkYXRhLmhpZGVfZGVsYXldKTtcclxuICAgICAgaWYgKGRhdGEuaGlkZV9hbmltYXRpb24pIHtcclxuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycgKyBkYXRhLmhpZGVfYW5pbWF0aW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGVsLmFwcGVuZChvdXQpO1xyXG4gICAgcmV0dXJuIGVsO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVfc2xpZGUoZGF0YSkge1xyXG4gICAgdmFyIHNsaWRlID0gJCgnPGRpdiBjbGFzcz1cInNsaWRlXCIvPicpO1xyXG5cclxuICAgIHZhciBtb2JfYmcgPSAkKCc8YSBjbGFzcz1cIm1vYl9iZ1wiIGhyZWY9XCInICsgZGF0YS5idXR0b24uaHJlZiArICdcIi8+Jyk7XHJcbiAgICBtb2JfYmcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5tb2JpbGUgKyAnKScpXHJcblxyXG4gICAgc2xpZGUuYXBwZW5kKG1vYl9iZyk7XHJcbiAgICBpZiAobW9iaWxlX21vZGUpIHtcclxuICAgICAgcmV0dXJuIHNsaWRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0YTQvtC9INGC0L4g0LfQsNC/0L7Qu9C90Y/QtdC8XHJcbiAgICBpZiAoZGF0YS5mb24pIHtcclxuICAgICAgc2xpZGUuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5mb24gKyAnKScpXHJcbiAgICB9XHJcblxyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgaWYgKGRhdGEucGFyYWxheCAmJiBkYXRhLnBhcmFsYXgubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fZ3JvdXBcIi8+Jyk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5wYXJhbGF4Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYWRkUGFyYWxheExheWVyKGRhdGEucGFyYWxheFtpXSwgcGFyYWxheF9ncilcclxuICAgICAgfVxyXG4gICAgICBzbGlkZS5hcHBlbmQocGFyYWxheF9ncilcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZml4ID0gJCgnPGRpdiBjbGFzcz1cImZpeGVkX2dyb3VwXCIvPicpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmZpeGVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEuZml4ZWRbaV0sIGZpeClcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XHJcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLmJ1dHRvbi5wb3NdKTtcclxuICAgIHZhciBidXQgPSAkKFwiPGEgY2xhc3M9J3NsaWRlcl9faHJlZicvPlwiKTtcclxuICAgIGJ1dC5hdHRyKCdocmVmJywgZGF0YS5idXR0b24uaHJlZik7XHJcbiAgICBidXQudGV4dChkYXRhLmJ1dHRvbi50ZXh0KTtcclxuICAgIGJ1dC5hZGRDbGFzcyhkYXRhLmJ1dHRvbi5jb2xvcik7XHJcbiAgICBkb3BfYmxrID0gYWRkX2FuaW1hdGlvbihkb3BfYmxrLCBkYXRhLmJ1dHRvbik7XHJcbiAgICBkb3BfYmxrLmZpbmQoJ2RpdicpLmFwcGVuZChidXQpO1xyXG4gICAgZml4LmFwcGVuZChkb3BfYmxrKTtcclxuXHJcbiAgICBzbGlkZS5hcHBlbmQoZml4KTtcclxuICAgIHJldHVybiBzbGlkZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKSB7XHJcbiAgICB2YXIgcGFyYWxsYXhfbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2xheWVyXCJcXD4nKTtcclxuICAgIHBhcmFsbGF4X2xheWVyLmF0dHIoJ3onLCBkYXRhLnogfHwgaSAqIDEwKTtcclxuICAgIHZhciBkb3BfYmxrID0gJChcIjxzcGFuIGNsYXNzPSdzbGlkZXJfX3RleHQnLz5cIik7XHJcbiAgICBpZiAoZGF0YS5wb3MpIHtcclxuICAgICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcclxuICAgIH1cclxuICAgIGRvcF9ibGsuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xyXG4gICAgcGFyYWxsYXhfbGF5ZXIuYXBwZW5kKGRvcF9ibGspO1xyXG4gICAgcGFyYWxheF9nci5hcHBlbmQocGFyYWxsYXhfbGF5ZXIpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkU3RhdGljTGF5ZXIoZGF0YSwgZml4LCBiZWZvcl9idXR0b24pIHtcclxuICAgIHZhciBkb3BfYmxrID0gJChcIjxkaXYgY2xhc3M9J2ZpeGVkX19sYXllcicvPlwiKTtcclxuICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XHJcbiAgICBpZiAoZGF0YS5mdWxsX2hlaWdodCkge1xyXG4gICAgICBkb3BfYmxrLmFkZENsYXNzKCdmaXhlZF9fZnVsbC1oZWlnaHQnKTtcclxuICAgIH1cclxuICAgIGRvcF9ibGsgPSBhZGRfYW5pbWF0aW9uKGRvcF9ibGssIGRhdGEpO1xyXG4gICAgZG9wX2Jsay5maW5kKCcuYW5pbWF0aW9uX2xheWVyJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xyXG5cclxuICAgIGlmIChiZWZvcl9idXR0b24pIHtcclxuICAgICAgZml4LmZpbmQoJy5zbGlkZXJfX2hyZWYnKS5jbG9zZXN0KCcuZml4ZWRfX2xheWVyJykuYmVmb3JlKGRvcF9ibGspXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmaXguYXBwZW5kKGRvcF9ibGspXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xyXG4gICAgaWYgKCQoJyNtZWdhX3NsaWRlcicpLmhhc0NsYXNzKCdzdG9wX3NsaWRlJykpcmV0dXJuO1xyXG5cclxuICAgIHZhciBzbGlkZV9wb2ludHMgPSAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVfc2VsZWN0JylcclxuICAgIHZhciBzbGlkZV9jbnQgPSBzbGlkZV9wb2ludHMubGVuZ3RoO1xyXG4gICAgdmFyIGFjdGl2ZSA9ICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykuaW5kZXgoKSArIDE7XHJcbiAgICBpZiAoYWN0aXZlID49IHNsaWRlX2NudClhY3RpdmUgPSAwO1xyXG4gICAgc2xpZGVfcG9pbnRzLmVxKGFjdGl2ZSkuY2xpY2soKTtcclxuXHJcbiAgICB0aW1lb3V0SWQ9c2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGltZ190b19sb2FkKHNyYykge1xyXG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xyXG4gICAgaW1nLm9uKCdsb2FkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB0b3RfaW1nX3dhaXQtLTtcclxuXHJcbiAgICAgIGlmICh0b3RfaW1nX3dhaXQgPT0gMCkge1xyXG5cclxuICAgICAgICBzbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dKSk7XHJcbiAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKHJlbmRlcl9zbGlkZV9ub20pLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgICAgICBpZiAocmVuZGVyX3NsaWRlX25vbSA9PSAwKSB7XHJcbiAgICAgICAgICBzbGlkZXMuZmluZCgnLnNsaWRlJylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93JylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICBpZiAoIWVkaXRvcikge1xyXG4gICAgICAgICAgICBpZih0aW1lb3V0SWQpY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgIHRpbWVvdXRJZD1zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5maXJzdF9zaG93JykucmVtb3ZlQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcclxuICAgICAgICAgICAgfS5iaW5kKHNsaWRlcyksIHNjcm9sbF9wZXJpb2QpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChtb2JpbGVfbW9kZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XHJcbiAgICAgICAgICAgIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICBwYXJhbGxheF90aW1lciA9IHNldEludGVydmFsKHJlbmRlciwgMTAwKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoZWRpdG9yKSB7XHJcbiAgICAgICAgICAgIGluaXRfZWRpdG9yKClcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKHRpbWVvdXRJZCljbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcclxuXHJcbiAgICAgICAgICAgICQoJy5zbGlkZV9zZWxlY3RfYm94Jykub24oJ2NsaWNrJywgJy5zbGlkZV9zZWxlY3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKSlyZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgIHZhciBpbmRleCA9ICR0aGlzLmluZGV4KCk7XHJcbiAgICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICR0aGlzLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGUuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgJChjb250YWluZXJfaWQgKyAnIC5zbGlkZScpLmVxKGluZGV4KS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5ob3ZlcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgaWYodGltZW91dElkKWNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xyXG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmFkZENsYXNzKCdzdG9wX3NsaWRlJyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xyXG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLnJlbW92ZUNsYXNzKCdzdG9wX3NsaWRlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVyX3NsaWRlX25vbSsrO1xyXG4gICAgICAgIGlmIChyZW5kZXJfc2xpZGVfbm9tIDwgc2xpZGVyX2RhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgICBsb2FkX3NsaWRlX2ltZygpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KS5vbignZXJyb3InLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xyXG4gICAgfSk7XHJcbiAgICBpbWcucHJvcCgnc3JjJywgc3JjKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGxvYWRfc2xpZGVfaW1nKCkge1xyXG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVtyZW5kZXJfc2xpZGVfbm9tXTtcclxuICAgIHRvdF9pbWdfd2FpdCA9IDE7XHJcblxyXG4gICAgaWYgKG1vYmlsZV9tb2RlID09PSBmYWxzZSkge1xyXG4gICAgICB0b3RfaW1nX3dhaXQrKztcclxuICAgICAgaW1nX3RvX2xvYWQoZGF0YS5mb24pO1xyXG4gICAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XHJcbiAgICAgIGlmIChkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0b3RfaW1nX3dhaXQgKz0gZGF0YS5wYXJhbGF4Lmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGFyYWxheC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5wYXJhbGF4W2ldLmltZylcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRhdGEuZml4ZWQgJiYgZGF0YS5maXhlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEuZml4ZWQubGVuZ3RoO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5maXhlZFtpXS5pbWcpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW1nX3RvX2xvYWQoZGF0YS5tb2JpbGUpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3RhcnRfaW5pdF9zbGlkZShkYXRhKSB7XHJcbiAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xyXG4gICAgaW1nLmF0dHIoJ3RpbWUnLCBuKTtcclxuXHJcbiAgICBmdW5jdGlvbiBvbl9pbWdfbG9hZCgpIHtcclxuICAgICAgdmFyIG4gPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgaW1nID0gJCh0aGlzKTtcclxuICAgICAgbiA9IG4gLSBwYXJzZUludChpbWcuYXR0cigndGltZScpKTtcclxuICAgICAgaWYgKG4gPiBtYXhfdGltZV9sb2FkX3BpYykge1xyXG4gICAgICAgIG1vYmlsZV9tb2RlID0gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgbWF4X3NpemUgPSAoc2NyZWVuLmhlaWdodCA+IHNjcmVlbi53aWR0aCA/IHNjcmVlbi5oZWlnaHQgOiBzY3JlZW4ud2lkdGgpO1xyXG4gICAgICAgIGlmIChtYXhfc2l6ZSA8IG1vYmlsZV9zaXplKSB7XHJcbiAgICAgICAgICBtb2JpbGVfbW9kZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vYmlsZV9tb2RlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChtb2JpbGVfbW9kZSA9PSB0cnVlKSB7XHJcbiAgICAgICAgJChjb250YWluZXJfaWQpLmFkZENsYXNzKCdtb2JpbGVfbW9kZScpXHJcbiAgICAgIH1cclxuICAgICAgcmVuZGVyX3NsaWRlX25vbSA9IDA7XHJcbiAgICAgIGxvYWRfc2xpZGVfaW1nKCk7XHJcbiAgICAgICQoJy5zay1mb2xkaW5nLWN1YmUnKS5yZW1vdmUoKTtcclxuICAgIH07XHJcblxyXG4gICAgaW1nLm9uKCdsb2FkJywgb25faW1nX2xvYWQoKSk7XHJcbiAgICBpZiAoc2xpZGVyX2RhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnP3I9JyArIE1hdGgucmFuZG9tKCk7XHJcbiAgICAgIGltZy5wcm9wKCdzcmMnLCBzbGlkZXJfZGF0YVswXS5tb2JpbGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb25faW1nX2xvYWQoKS5iaW5kKGltZyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0KGRhdGEsIGVkaXRvcl9pbml0KSB7XHJcbiAgICBzbGlkZXJfZGF0YSA9IGRhdGE7XHJcbiAgICBlZGl0b3IgPSBlZGl0b3JfaW5pdDtcclxuICAgIC8v0L3QsNGF0L7QtNC40Lwg0LrQvtC90YLQtdC50L3QtdGAINC4INC+0YfQuNGJ0LDQtdC8INC10LPQvlxyXG4gICAgdmFyIGNvbnRhaW5lciA9ICQoY29udGFpbmVyX2lkKTtcclxuICAgIGNvbnRhaW5lci5odG1sKCcnKTtcclxuXHJcbiAgICAvL9GB0L7Qt9C20LDQtdC8INCx0LDQt9C+0LLRi9C1INC60L7QvdGC0LXQudC90LXRgNGLINC00LvRjyDRgdCw0LzQuNGFINGB0LvQsNC50LTQvtCyINC4INC00LvRjyDQv9C10YDQtdC60LvRjtGH0LDRgtC10LvQtdC5XHJcbiAgICBzbGlkZXMgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICdjbGFzcyc6ICdzbGlkZXMnXHJcbiAgICB9KTtcclxuICAgIHZhciBzbGlkZV9jb250cm9sID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAnY2xhc3MnOiAnc2xpZGVfY29udHJvbCdcclxuICAgIH0pO1xyXG4gICAgc2xpZGVfc2VsZWN0X2JveCA9ICQoJzx1bC8+Jywge1xyXG4gICAgICAnY2xhc3MnOiAnc2xpZGVfc2VsZWN0X2JveCdcclxuICAgIH0pO1xyXG5cclxuICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INC40L3QtNC40LrQsNGC0L7RgCDQt9Cw0LPRgNGD0LfQutC4XHJcbiAgICB2YXIgbCA9ICc8ZGl2IGNsYXNzPVwic2stZm9sZGluZy1jdWJlXCI+JyArXHJcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTEgc2stY3ViZVwiPjwvZGl2PicgK1xyXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUyIHNrLWN1YmVcIj48L2Rpdj4nICtcclxuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlNCBzay1jdWJlXCI+PC9kaXY+JyArXHJcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTMgc2stY3ViZVwiPjwvZGl2PicgK1xyXG4gICAgICAnPC9kaXY+JztcclxuICAgIGNvbnRhaW5lci5odG1sKGwpO1xyXG5cclxuXHJcbiAgICBzdGFydF9pbml0X3NsaWRlKGRhdGFbMF0pO1xyXG5cclxuICAgIC8v0LPQtdC90LXRgNC40YDRg9C10Lwg0LrQvdC+0L/QutC4INC4INGB0LvQsNC50LTRi1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIC8vc2xpZGVzLmFwcGVuZChnZW5lcmF0ZV9zbGlkZShkYXRhW2ldKSk7XHJcbiAgICAgIHNsaWRlX3NlbGVjdF9ib3guYXBwZW5kKCc8bGkgY2xhc3M9XCJzbGlkZV9zZWxlY3QgZGlzYWJsZWRcIi8+JylcclxuICAgIH1cclxuXHJcbiAgICAvKnNsaWRlcy5maW5kKCcuc2xpZGUnKS5lcSgwKVxyXG4gICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpXHJcbiAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93Jyk7XHJcbiAgICAgc2xpZGVfY29udHJvbC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7Ki9cclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlcyk7XHJcbiAgICBzbGlkZV9jb250cm9sLmFwcGVuZChzbGlkZV9zZWxlY3RfYm94KTtcclxuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVfY29udHJvbCk7XHJcblxyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICAgIGlmICghcGFyYWxsYXhfZ3JvdXApcmV0dXJuIGZhbHNlO1xyXG4gICAgdmFyIHBhcmFsbGF4X2sgPSAocGFyYWxsYXhfY291bnRlciAtIDEwKSAvIDI7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbGxheF9ncm91cC5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgZWwgPSBwYXJhbGxheF9ncm91cC5lcShpKTtcclxuICAgICAgdmFyIGogPSBlbC5hdHRyKCd6Jyk7XHJcbiAgICAgIHZhciB0ciA9ICdyb3RhdGUzZCgwLjEsMC44LDAsJyArIChwYXJhbGxheF9rKSArICdkZWcpIHNjYWxlKCcgKyAoMSArIGogKiAwLjUpICsgJykgdHJhbnNsYXRlWigtJyArICgxMCArIGogKiAyMCkgKyAncHgpJztcclxuICAgICAgZWwuY3NzKCd0cmFuc2Zvcm0nLCB0cilcclxuICAgIH1cclxuICAgIHBhcmFsbGF4X2NvdW50ZXIgKz0gcGFyYWxsYXhfZCAqIDAuMTtcclxuICAgIGlmIChwYXJhbGxheF9jb3VudGVyID49IDIwKXBhcmFsbGF4X2QgPSAtcGFyYWxsYXhfZDtcclxuICAgIGlmIChwYXJhbGxheF9jb3VudGVyIDw9IDApcGFyYWxsYXhfZCA9IC1wYXJhbGxheF9kO1xyXG4gIH1cclxuXHJcbiAgaW5pdEltYWdlU2VydmVyU2VsZWN0KCQoJy5maWxlU2VsZWN0JykpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgaW5pdDogaW5pdFxyXG4gIH07XHJcbn0oKSk7XHJcbiIsInZhciBoZWFkZXJBY3Rpb25zID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxuICB2YXIgc2hhZG93ZWREb3duID0gZmFsc2U7XHJcblxyXG4gICQoJy5tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgJCgnLmhlYWRlcicpLnRvZ2dsZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAkKCcuZHJvcC1tZW51JykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICBpZiAoJCgnLmhlYWRlcicpLmhhc0NsYXNzKCdoZWFkZXJfb3Blbi1tZW51JykpIHtcclxuICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcclxuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdub19zY3JvbGwnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5zZWFyY2gtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgJCgnI2F1dG9jb21wbGV0ZScpLmZhZGVPdXQoKTtcclxuICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpKSB7XHJcbiAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcjaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmIChlLnRhcmdldC5pZCA9PSAnaGVhZGVyJykge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcuaGVhZGVyLXNlYXJjaF9mb3JtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJ2Zvcm0nKS5zdWJtaXQoKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmhlYWRlci1zZWNvbmRsaW5lX2Nsb3NlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItdXBsaW5lJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoIXNjcm9sbGVkRG93bilyZXR1cm47XHJcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCAxMDI0KSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgICQoJy5oZWFkZXItc2Vjb25kbGluZScpLnJlbW92ZUNsYXNzKCdzY3JvbGwtZG93bicpO1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcclxuICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG4gIH0pO1xyXG5cclxuICAkKHdpbmRvdykub24oJ2xvYWQgcmVzaXplIHNjcm9sbCcsIGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBzaGFkb3dIZWlnaHQgPSA1MDtcclxuICAgIHZhciBoaWRlSGVpZ2h0ID0gMjAwO1xyXG4gICAgdmFyIGhlYWRlclNlY29uZExpbmUgPSAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKTtcclxuICAgIHZhciBob3ZlcnMgPSBoZWFkZXJTZWNvbmRMaW5lLmZpbmQoJzpob3ZlcicpO1xyXG4gICAgdmFyIGhlYWRlciA9ICQoJy5oZWFkZXInKTtcclxuXHJcbiAgICBpZiAoIWhvdmVycy5sZW5ndGgpIHtcclxuICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgICBoZWFkZXIucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgICAgLy9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXHJcbiAgICAgIHZhciBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XHJcbiAgICAgIGlmIChzY3JvbGxUb3AgPiBzaGFkb3dIZWlnaHQgJiYgc2hhZG93ZWREb3duID09PSBmYWxzZSkge1xyXG4gICAgICAgIHNoYWRvd2VkRG93biA9IHRydWU7XHJcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2hhZG93ZWQnKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoc2Nyb2xsVG9wIDw9IHNoYWRvd0hlaWdodCAmJiBzaGFkb3dlZERvd24gPT09IHRydWUpIHtcclxuICAgICAgICBzaGFkb3dlZERvd24gPSBmYWxzZTtcclxuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzaGFkb3dlZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzY3JvbGxUb3AgPiBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gZmFsc2UpIHtcclxuICAgICAgICBzY3JvbGxlZERvd24gPSB0cnVlO1xyXG4gICAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNjcm9sbFRvcCA8PSBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgICAgaGVhZGVyLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5tZW51X2FuZ2xlLWRvd24sIC5kcm9wLW1lbnVfZ3JvdXBfX3VwLWhlYWRlcicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgbWVudU9wZW4gPSAkKHRoaXMpLmNsb3Nlc3QoJy5oZWFkZXJfb3Blbi1tZW51LCAuY2F0YWxvZy1jYXRlZ29yaWVzJyk7XHJcbiAgICBpZiAoIW1lbnVPcGVuLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBwYXJlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnVfZ3JvdXBfX3VwLCAubWVudS1ncm91cCcpO1xyXG4gICAgdmFyIHBhcmVudE1lbnUgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnUnKTtcclxuICAgIGlmIChwYXJlbnRNZW51KSB7XHJcbiAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgfVxyXG4gICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgJChwYXJlbnQpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgIGlmIChwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAgICQocGFyZW50KS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuY2hpbGRyZW4oJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmFkZENsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuY2hpbGRyZW4oJ2xpJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuXHJcbiAgdmFyIGFjY291bnRNZW51VGltZU91dCA9IG51bGw7XHJcbiAgdmFyIGFjY291bnRNZW51T3BlblRpbWUgPSAwO1xyXG4gIHZhciBhY2NvdW50TWVudSA9ICQoJy5hY2NvdW50LW1lbnUnKTtcclxuXHJcbiAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gMTAyNCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcclxuICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcclxuXHJcbiAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XHJcblxyXG4gICAgaWYgKGFjY291bnRNZW51Lmhhc0NsYXNzKCdoaWRkZW4nKSkge1xyXG4gICAgICBtZW51QWNjb3VudFVwKHRoYXQpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoYXQucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgYWNjb3VudE1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvL9C/0L7QutCw0Lcg0LzQtdC90Y4g0LDQutC60LDRg9C90YJcclxuICBmdW5jdGlvbiBtZW51QWNjb3VudFVwKHRvZ2dsZUJ1dHRvbikge1xyXG4gICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xyXG4gICAgdG9nZ2xlQnV0dG9uLmFkZENsYXNzKCdvcGVuJyk7XHJcbiAgICBhY2NvdW50TWVudS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gMTAyNCkge1xyXG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgYWNjb3VudE1lbnVPcGVuVGltZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBhY2NvdW50TWVudVRpbWVPdXQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gMTAyNCkge1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoKG5ldyBEYXRlKCkgLSBhY2NvdW50TWVudU9wZW5UaW1lKSA+IDEwMDAgKiA3KSB7XHJcbiAgICAgICAgYWNjb3VudE1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIHRvZ2dsZUJ1dHRvbi5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcclxuICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LCAxMDAwKTtcclxuICB9XHJcblxyXG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXMtYWNjb3VudF9tZW51LWhlYWRlcicpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBhY2NvdW50TWVudU9wZW5UaW1lID0gbmV3IERhdGUoKTtcclxuICB9KTtcclxuICAkKCcuYWNjb3VudC1tZW51JykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICgkKGUudGFyZ2V0KS5oYXNDbGFzcygnYWNjb3VudC1tZW51JykpIHtcclxuICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0oKTtcclxuIiwiJChmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gcGFyc2VOdW0oc3RyKSB7XHJcbiAgICByZXR1cm4gcGFyc2VGbG9hdChcclxuICAgICAgU3RyaW5nKHN0cilcclxuICAgICAgICAucmVwbGFjZSgnLCcsICcuJylcclxuICAgICAgICAubWF0Y2goLy0/XFxkKyg/OlxcLlxcZCspPy9nLCAnJykgfHwgMFxyXG4gICAgICAsIDEwXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgJCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKS5maW5kKCdzZWxlY3QsaW5wdXQnKS5vbignY2hhbmdlIGtleXVwIGNsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKS5jbG9zZXN0KCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpO1xyXG4gICAgdmFyIGN1cnMgPSBwYXJzZU51bSgkdGhpcy5maW5kKCdzZWxlY3QnKS52YWwoKSk7XHJcbiAgICB2YXIgdmFsID0gJHRoaXMuZmluZCgnaW5wdXQnKS52YWwoKTtcclxuICAgIGlmIChwYXJzZU51bSh2YWwpICE9IHZhbCkge1xyXG4gICAgICB2YWwgPSAkdGhpcy5maW5kKCdpbnB1dCcpLnZhbChwYXJzZU51bSh2YWwpKTtcclxuICAgIH1cclxuICAgIHZhbCA9IHBhcnNlTnVtKHZhbCk7XHJcblxyXG4gICAgdmFyIGtvZWYgPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2snKS50cmltKCk7XHJcbiAgICB2YXIgcHJvbW8gPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2stcHJvbW8nKS50cmltKCk7XHJcbiAgICB2YXIgY3VycmVuY3kgPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2stY3VycmVuY3knKS50cmltKCk7XHJcbiAgICB2YXIgcmVzdWx0ID0gMDtcclxuICAgIHZhciBvdXQgPSAwO1xyXG5cclxuICAgIGlmIChrb2VmID09IHByb21vKSB7XHJcbiAgICAgIHByb21vID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoa29lZi5pbmRleE9mKCclJykgPiAwKSB7XHJcbiAgICAgIHJlc3VsdCA9IHBhcnNlTnVtKGtvZWYpICogdmFsICogY3VycyAvIDEwMDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGN1cnMgPSBwYXJzZU51bSgkdGhpcy5maW5kKCdbY29kZT0nICsgY3VycmVuY3kgKyAnXScpLnZhbCgpKTtcclxuICAgICAgcmVzdWx0ID0gcGFyc2VOdW0oa29lZikgKiBjdXJzXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHBhcnNlTnVtKHByb21vKSA+IDApIHtcclxuICAgICAgaWYgKHByb21vLmluZGV4T2YoJyUnKSA+IDApIHtcclxuICAgICAgICBwcm9tbyA9IHBhcnNlTnVtKHByb21vKSAqIHZhbCAqIGN1cnMgLyAxMDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcHJvbW8gPSBwYXJzZU51bShwcm9tbykgKiBjdXJzXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChwcm9tbyA+IDApIHtcclxuICAgICAgICBvdXQgPSBcIjxzcGFuIGNsYXNzPW9sZF9wcmljZT5cIiArIHJlc3VsdC50b0ZpeGVkKDIpICsgXCI8L3NwYW4+IFwiICsgcHJvbW8udG9GaXhlZCgyKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvdXQgPSByZXN1bHQudG9GaXhlZCgyKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3V0ID0gcmVzdWx0LnRvRml4ZWQoMik7XHJcbiAgICB9XHJcblxyXG5cclxuICAgICR0aGlzLmZpbmQoJy5jYWxjLXJlc3VsdF92YWx1ZScpLmh0bWwob3V0KVxyXG4gIH0pLmNsaWNrKClcclxufSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIGVscyA9ICQoJy5hdXRvX2hpZGVfY29udHJvbCcpO1xyXG4gIGlmIChlbHMubGVuZ3RoID09IDApcmV0dXJuO1xyXG5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBcIi5zY3JvbGxfYm94LXNob3dfbW9yZVwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgIGJ1dHRvblllczogZmFsc2UsXHJcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfd2hpdGUgbm90aWZ5X25vdF9iaWdcIlxyXG4gICAgfTtcclxuXHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICB2YXIgY29udGVudCA9ICR0aGlzLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0nKS5jbG9uZSgpO1xyXG4gICAgY29udGVudCA9IGNvbnRlbnRbMF07XHJcbiAgICBjb250ZW50LmNsYXNzTmFtZSArPSAnIHNjcm9sbF9ib3gtaXRlbS1tb2RhbCc7XHJcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBkaXYuY2xhc3NOYW1lID0gJ2NvbW1lbnRzJztcclxuICAgIGRpdi5hcHBlbmQoY29udGVudCk7XHJcbiAgICAkKGRpdikuZmluZCgnLnNjcm9sbF9ib3gtc2hvd19tb3JlJykucmVtb3ZlKCk7XHJcbiAgICAkKGRpdikuZmluZCgnLm1heF90ZXh0X2hpZGUnKVxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUteDInKVxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUnKTtcclxuICAgIGRhdGEucXVlc3Rpb24gPSBkaXYub3V0ZXJIVE1MO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gaGFzU2Nyb2xsKGVsKSB7XHJcbiAgICBpZiAoIWVsKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBlbC5zY3JvbGxIZWlnaHQgPiBlbC5jbGllbnRIZWlnaHQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZWJ1aWxkKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gZWxzLmVxKGkpO1xyXG4gICAgICB2YXIgaXNfaGlkZSA9IGZhbHNlO1xyXG4gICAgICBpZiAoZWwuaGVpZ2h0KCkgPCAxMCkge1xyXG4gICAgICAgIGlzX2hpZGUgPSB0cnVlO1xyXG4gICAgICAgIGVsLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0taGlkZScpLnNob3coMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciB0ZXh0ID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtdGV4dCcpO1xyXG4gICAgICB2YXIgYW5zd2VyID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtYW5zd2VyJyk7XHJcbiAgICAgIHZhciBzaG93X21vcmUgPSBlbC5maW5kKCcuc2Nyb2xsX2JveC1zaG93X21vcmUnKTtcclxuXHJcbiAgICAgIHZhciBzaG93X2J0biA9IGZhbHNlO1xyXG4gICAgICBpZiAoaGFzU2Nyb2xsKHRleHRbMF0pKSB7XHJcbiAgICAgICAgc2hvd19idG4gPSB0cnVlO1xyXG4gICAgICAgIHRleHQucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRleHQuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYW5zd2VyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAvL9C10YHRgtGMINC+0YLQstC10YIg0LDQtNC80LjQvdCwXHJcbiAgICAgICAgaWYgKGhhc1Njcm9sbChhbnN3ZXJbMF0pKSB7XHJcbiAgICAgICAgICBzaG93X2J0biA9IHRydWU7XHJcbiAgICAgICAgICBhbnN3ZXIucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBhbnN3ZXIuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNob3dfYnRuKSB7XHJcbiAgICAgICAgc2hvd19tb3JlLnNob3coKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzaG93X21vcmUuaGlkZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaXNfaGlkZSkge1xyXG4gICAgICAgIGVsLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0taGlkZScpLmhpZGUoMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gICQod2luZG93KS5yZXNpemUocmVidWlsZCk7XHJcbiAgcmVidWlsZCgpO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnNob3dfYWxsJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBjbHMgPSAkKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XHJcbiAgICAkKCcuaGlkZV9hbGxbZGF0YS1jbnRybC1jbGFzc10nKS5zaG93KCk7XHJcbiAgICAkKHRoaXMpLmhpZGUoKTtcclxuICAgICQoJy4nICsgY2xzKS5zaG93KCk7XHJcbiAgfSk7XHJcblxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmhpZGVfYWxsJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBjbHMgPSAkKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XHJcbiAgICAkKCcuc2hvd19hbGxbZGF0YS1jbnRybC1jbGFzc10nKS5zaG93KCk7XHJcbiAgICAkKHRoaXMpLmhpZGUoKTtcclxuICAgICQoJy4nICsgY2xzKS5oaWRlKCk7XHJcbiAgfSk7XHJcbn0pKCk7XHJcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBkZWNsT2ZOdW0obnVtYmVyLCB0aXRsZXMpIHtcclxuICAgIGNhc2VzID0gWzIsIDAsIDEsIDEsIDEsIDJdO1xyXG4gICAgcmV0dXJuIHRpdGxlc1sobnVtYmVyICUgMTAwID4gNCAmJiBudW1iZXIgJSAxMDAgPCAyMCkgPyAyIDogY2FzZXNbKG51bWJlciAlIDEwIDwgNSkgPyBudW1iZXIgJSAxMCA6IDVdXTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpcnN0WmVybyh2KSB7XHJcbiAgICB2ID0gTWF0aC5mbG9vcih2KTtcclxuICAgIGlmICh2IDwgMTApXHJcbiAgICAgIHJldHVybiAnMCcgKyB2O1xyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gdjtcclxuICB9XHJcblxyXG4gIHZhciBjbG9ja3MgPSAkKCcuY2xvY2snKTtcclxuICBpZiAoY2xvY2tzLmxlbmd0aCA+IDApIHtcclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUNsb2NrKCkge1xyXG4gICAgICB2YXIgY2xvY2tzID0gJCh0aGlzKTtcclxuICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xvY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGMgPSBjbG9ja3MuZXEoaSk7XHJcbiAgICAgICAgdmFyIGVuZCA9IG5ldyBEYXRlKGMuZGF0YSgnZW5kJykucmVwbGFjZSgvLS9nLCBcIi9cIikpO1xyXG4gICAgICAgIHZhciBkID0gKGVuZC5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XHJcblxyXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0L/RgNC+0YjQtdC7XHJcbiAgICAgICAgaWYgKGQgPD0gMCkge1xyXG4gICAgICAgICAgYy50ZXh0KGxnKFwicHJvbW9jb2RlX2V4cGlyZXNcIikpO1xyXG4gICAgICAgICAgYy5hZGRDbGFzcygnY2xvY2stZXhwaXJlZCcpO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL9C10YHQu9C4INGB0YDQvtC6INCx0L7Qu9C10LUgMzAg0LTQvdC10LlcclxuICAgICAgICBpZiAoZCA+IDMwICogNjAgKiA2MCAqIDI0KSB7XHJcbiAgICAgICAgICBjLmh0bWwobGcoIFwicHJvbW9jb2RlX2xlZnRfMzBfZGF5c1wiKSk7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzID0gZCAlIDYwO1xyXG4gICAgICAgIGQgPSAoZCAtIHMpIC8gNjA7XHJcbiAgICAgICAgdmFyIG0gPSBkICUgNjA7XHJcbiAgICAgICAgZCA9IChkIC0gbSkgLyA2MDtcclxuICAgICAgICB2YXIgaCA9IGQgJSAyNDtcclxuICAgICAgICBkID0gKGQgLSBoKSAvIDI0O1xyXG5cclxuICAgICAgICB2YXIgc3RyID0gZmlyc3RaZXJvKGgpICsgXCI6XCIgKyBmaXJzdFplcm8obSkgKyBcIjpcIiArIGZpcnN0WmVybyhzKTtcclxuICAgICAgICBpZiAoZCA+IDApIHtcclxuICAgICAgICAgIHN0ciA9IGQgKyBcIiBcIiArIGRlY2xPZk51bShkLCBbbGcoXCJkYXlfY2FzZV8wXCIpLCBsZyhcImRheV9jYXNlXzFcIiksIGxnKFwiZGF5X2Nhc2VfMlwiKV0pICsgXCIgIFwiICsgc3RyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjLmh0bWwoXCLQntGB0YLQsNC70L7RgdGMOiA8c3Bhbj5cIiArIHN0ciArIFwiPC9zcGFuPlwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldEludGVydmFsKHVwZGF0ZUNsb2NrLmJpbmQoY2xvY2tzKSwgMTAwMCk7XHJcbiAgICB1cGRhdGVDbG9jay5iaW5kKGNsb2NrcykoKTtcclxuICB9XHJcbn0pO1xyXG4iLCJ2YXIgY2F0YWxvZ1R5cGVTd2l0Y2hlciA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgY2F0YWxvZyA9ICQoJy5jYXRhbG9nX2xpc3QnKTtcclxuICBpZiAoY2F0YWxvZy5sZW5ndGggPT0gMClyZXR1cm47XHJcblxyXG4gICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKHRoaXMpLnBhcmVudCgpLnNpYmxpbmdzKCkuZmluZCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICAgICQodGhpcykuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICAgIGlmIChjYXRhbG9nKSB7XHJcbiAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdjYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLWxpc3QnKSkge1xyXG4gICAgICAgIGNhdGFsb2cucmVtb3ZlQ2xhc3MoJ25hcnJvdycpO1xyXG4gICAgICAgIHNldENvb2tpZSgnY291cG9uc192aWV3JywgJycpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2NhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbmFycm93JykpIHtcclxuICAgICAgICBjYXRhbG9nLmFkZENsYXNzKCduYXJyb3cnKTtcclxuICAgICAgICBzZXRDb29raWUoJ2NvdXBvbnNfdmlldycsICduYXJyb3cnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBpZiAoZ2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnKSA9PSAnbmFycm93JyAmJiAhY2F0YWxvZy5oYXNDbGFzcygnbmFycm93X29mZicpKSB7XHJcbiAgICBjYXRhbG9nLmFkZENsYXNzKCduYXJyb3cnKTtcclxuICAgICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLW5hcnJvdycpLmFkZENsYXNzKCdjaGVja2VkJyk7XHJcbiAgICAkKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykucmVtb3ZlQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICB9XHJcbn0oKTtcclxuIiwiJChmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLnNkLXNlbGVjdC1zZWxlY3RlZCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA8IDc2OCkge1xyXG4gICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIC8vdmFyIHBhcmVudCA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAgICAgLy92YXIgZHJvcEJsb2NrID0gJChwYXJlbnQpLmZpbmQoJy5zZC1zZWxlY3QtZHJvcCcpO1xyXG5cclxuICAgICAgICAvLyBpZiAoZHJvcEJsb2NrLmlzKCc6aGlkZGVuJykpIHtcclxuICAgICAgICAvLyAgICAgZHJvcEJsb2NrLnNsaWRlRG93bigpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgIGlmICghcGFyZW50Lmhhc0NsYXNzKCdsaW5rZWQnKSkge1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgICAgICAkKCcuc2Qtc2VsZWN0LWRyb3AnKS5maW5kKCdhJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAvLyAgICAgICAgICAgICB2YXIgc2VsZWN0UmVzdWx0ID0gJCh0aGlzKS5odG1sKCk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgICAgICAgICAgICAkKHBhcmVudCkuZmluZCgnaW5wdXQnKS52YWwoc2VsZWN0UmVzdWx0KTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICQocGFyZW50KS5maW5kKCcuc2Qtc2VsZWN0LXNlbGVjdGVkJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLmh0bWwoc2VsZWN0UmVzdWx0KTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XHJcbiAgICAgICAgLy8gICAgICAgICB9KTtcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gfSBlbHNlIHtcclxuICAgICAgICAvLyAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgLy8gICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG4gICAgLy9yZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcblxyXG59KTtcclxuIiwic2VhcmNoID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBvcGVuQXV0b2NvbXBsZXRlO1xyXG5cclxuICAkKCcuc2VhcmNoLWZvcm0taW5wdXQnKS5vbignaW5wdXQnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHF1ZXJ5ID0gJHRoaXMudmFsKCk7XHJcbiAgICB2YXIgZGF0YSA9ICR0aGlzLmNsb3Nlc3QoJ2Zvcm0nKS5zZXJpYWxpemUoKTtcclxuICAgIHZhciBhdXRvY29tcGxldGUgPSAkdGhpcy5jbG9zZXN0KCcuc3RvcmVzX3NlYXJjaCcpLmZpbmQoJy5hdXRvY29tcGxldGUtd3JhcCcpOy8vICQoJyNhdXRvY29tcGxldGUnKSxcclxuICAgIHZhciBhdXRvY29tcGxldGVMaXN0ID0gJChhdXRvY29tcGxldGUpLmZpbmQoJ3VsJyk7XHJcbiAgICBvcGVuQXV0b2NvbXBsZXRlID0gYXV0b2NvbXBsZXRlO1xyXG4gICAgaWYgKHF1ZXJ5Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgdXJsID0gJHRoaXMuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicpIHx8ICcvc2VhcmNoJztcclxuICAgICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICB0eXBlOiAnZ2V0JyxcclxuICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgIGlmIChkYXRhLnN1Z2dlc3Rpb25zKSB7XHJcbiAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3VnZ2VzdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWYobGFuZ1tcImhyZWZfcHJlZml4XCJdLmxlbmd0aD4wICYmIGl0ZW0uZGF0YS5yb3V0ZS5pbmRleE9mKGxhbmdbXCJocmVmX3ByZWZpeFwiXSk9PS0xKXtcclxuICAgICAgICAgICAgICAgICAgaXRlbS5kYXRhLnJvdXRlPScvJytsYW5nW1wiaHJlZl9wcmVmaXhcIl0raXRlbS5kYXRhLnJvdXRlO1xyXG4gICAgICAgICAgICAgICAgICBpdGVtLmRhdGEucm91dGU9aXRlbS5kYXRhLnJvdXRlLnJlcGxhY2UoJy8vJywnLycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSAnPGEgY2xhc3M9XCJhdXRvY29tcGxldGVfbGlua1wiIGhyZWY9XCInICsgaXRlbS5kYXRhLnJvdXRlICsgJ1wiJyArICc+JyArIGl0ZW0udmFsdWUgKyBpdGVtLmNhc2hiYWNrICsgJzwvYT4nO1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgICAgICAgICAgICAgIGxpLmlubmVySFRNTCA9IGh0bWw7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmFwcGVuZChsaSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVJbigpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZSkuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgJChhdXRvY29tcGxldGVMaXN0KS5odG1sKCcnKTtcclxuICAgICAgICAkKGF1dG9jb21wbGV0ZSkuZmFkZU91dCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSkub24oJ2ZvY3Vzb3V0JywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICghJChlLnJlbGF0ZWRUYXJnZXQpLmhhc0NsYXNzKCdhdXRvY29tcGxldGVfbGluaycpKSB7XHJcbiAgICAgIC8vJCgnI2F1dG9jb21wbGV0ZScpLmhpZGUoKTtcclxuICAgICAgJChvcGVuQXV0b2NvbXBsZXRlKS5kZWxheSgxMDApLnNsaWRlVXAoMTAwKVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCdib2R5Jykub24oJ3N1Ym1pdCcsICcuc3RvcmVzLXNlYXJjaF9mb3JtJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciB2YWwgPSAkKHRoaXMpLmZpbmQoJy5zZWFyY2gtZm9ybS1pbnB1dCcpLnZhbCgpO1xyXG4gICAgaWYgKHZhbC5sZW5ndGggPCAyKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnLmZvcm0tcG9wdXAtc2VsZWN0IGxpJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuXHJcbiAgICB2YXIgaGlkZGVuID0gJCh0aGlzKS5kYXRhKCdpZDInKTtcclxuICAgICQoJyMnK2hpZGRlbikuYXR0cigndmFsdWUnLCAkKHRoaXMpLmRhdGEoJ3ZhbHVlMicpKTtcclxuICAgIHZhciB0ZXh0ID0gJCh0aGlzKS5kYXRhKCdpZDEnKTtcclxuICAgICQoJyMnK3RleHQpLmh0bWwoJCh0aGlzKS5kYXRhKCd2YWx1ZTEnKSk7XHJcbiAgICB2YXIgc2VhcmNodGV4dCA9ICQodGhpcykuZGF0YSgnaWQzJyk7XHJcbiAgICAkKCcjJytzZWFyY2h0ZXh0KS5hdHRyKCdwbGFjZWhvbGRlcicsICQodGhpcykuZGF0YSgndmFsdWUzJykpO1xyXG4gICAgdmFyIGxpbWl0ID0gJCh0aGlzKS5kYXRhKCdpZDQnKTtcclxuICAgICQoJyMnK2xpbWl0KS5hdHRyKCd2YWx1ZScsICQodGhpcykuZGF0YSgndmFsdWU0JykpO1xyXG5cclxuICAgIHZhciBhY3Rpb24gPSAkKHRoaXMpLmRhdGEoJ2FjdGlvbicpO1xyXG5cclxuICAgICQodGhpcykuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicsIGFjdGlvbik7XHJcblxyXG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuaGVhZGVyLXNlYXJjaF9mb3JtLWdyb3VwJykuZmluZCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dC1tb2R1bGUtbGFiZWwnKS5hZGRDbGFzcygnY2xvc2UnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0taW5wdXQtbW9kdWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICQodGhpcykuY2xvc2VzdCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dC1tb2R1bGUtbGFiZWwnKS50b2dnbGVDbGFzcygnYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0taW5wdXQtbW9kdWxlLWxhYmVsJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICB9KTtcclxuXHJcbn0oKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgJCgnLmNvdXBvbnMtbGlzdF9pdGVtLWNvbnRlbnQtZ290by1wcm9tb2NvZGUtbGluaycpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgdGhhdCA9ICQodGhpcyk7XHJcbiAgICB2YXIgZXhwaXJlZCA9IHRoYXQuY2xvc2VzdCgnLmNvdXBvbnMtbGlzdF9pdGVtJykuZmluZCgnLmNsb2NrLWV4cGlyZWQnKTtcclxuICAgIHZhciB1c2VySWQgPSAkKHRoYXQpLmRhdGEoJ3VzZXInKTtcclxuICAgIHZhciBpbmFjdGl2ZSA9ICQodGhhdCkuZGF0YSgnaW5hY3RpdmUnKTtcclxuICAgIHZhciBkYXRhX21lc3NhZ2UgPSAkKHRoYXQpLmRhdGEoJ21lc3NhZ2UnKTtcclxuXHJcbiAgICBpZiAoaW5hY3RpdmUpIHtcclxuICAgICAgdmFyIHRpdGxlID0gZGF0YV9tZXNzYWdlID8gZGF0YV9tZXNzYWdlIDogbGcoXCJwcm9tb2NvZGVfaXNfaW5hY3RpdmVcIik7XHJcbiAgICAgIHZhciBtZXNzYWdlID0gbGcoXCJwcm9tb2NvZGVfdmlld19hbGxcIix7XCJ1cmxcIjpcIi9cIitsYW5nW1wiaHJlZl9wcmVmaXhcIl0rXCJjb3Vwb25zXCJ9KTtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcclxuICAgICAgICAndGl0bGUnOiB0aXRsZSxcclxuICAgICAgICAncXVlc3Rpb24nOiBtZXNzYWdlLFxyXG4gICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxyXG4gICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxyXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiAnbm90aWZ5X2JveC1hbGVydCdcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSBpZiAoZXhwaXJlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciB0aXRsZSA9IGxnKFwicHJvbW9jb2RlX2lzX2V4cGlyZXNcIik7XHJcbiAgICAgIHZhciBtZXNzYWdlID0gbGcoXCJwcm9tb2NvZGVfdmlld19hbGxcIix7XCJ1cmxcIjpcIi9cIitsYW5nW1wiaHJlZl9wcmVmaXhcIl0rXCJjb3Vwb25zXCJ9KTtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcclxuICAgICAgICAndGl0bGUnOiB0aXRsZSxcclxuICAgICAgICAncXVlc3Rpb24nOiBtZXNzYWdlLFxyXG4gICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxyXG4gICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxyXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiAnbm90aWZ5X2JveC1hbGVydCdcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSBpZiAoIXVzZXJJZCkge1xyXG4gICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAnYnV0dG9uWWVzJzogZmFsc2UsXHJcbiAgICAgICAgJ25vdHlmeV9jbGFzcyc6IFwibm90aWZ5X2JveC1hbGVydFwiLFxyXG4gICAgICAgICd0aXRsZSc6IGxnKFwidXNlX3Byb21vY29kZVwiKSxcclxuICAgICAgICAncXVlc3Rpb24nOiAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtY291cG9uLW5vcmVnaXN0ZXJcIj4nICtcclxuICAgICAgICAnPGltZyBzcmM9XCIvaW1hZ2VzL3RlbXBsYXRlcy9zd2EucG5nXCIgYWx0PVwiXCI+JyArXHJcbiAgICAgICAgJzxwPjxiPicrbGcoXCJwcm9tb2NvZGVfdXNlX3dpdGhvdXRfY2FzaGJhY2tfb3JfcmVnaXN0ZXJcIikrJzwvYj48L3A+JyArXHJcbiAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveC1idXR0b25zXCI+JyArXHJcbiAgICAgICAgJzxhIGhyZWY9XCInICsgdGhhdC5hdHRyKCdocmVmJykgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJidG4gbm90aWZpY2F0aW9uLWNsb3NlXCI+JytsZyhcInVzZV9wcm9tb2NvZGVcIikrJzwvYT4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIiMnK2xhbmdbXCJocmVmX3ByZWZpeFwiXSsncmVnaXN0cmF0aW9uXCIgY2xhc3M9XCJidG4gYnRuLXRyYW5zZm9ybSBtb2RhbHNfb3BlblwiPicrbGcoXCJyZWdpc3RlclwiKSsnPC9hPicgK1xyXG4gICAgICAgICc8L2Rpdj4nXHJcbiAgICAgIH07XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcjc2hvcF9oZWFkZXItZ290by1jaGVja2JveCcpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcbiAgICAgaWYgKCEkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpKSB7XHJcbiAgICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XHJcbiAgICAgICAgICAgICAndGl0bGUnOiBsZyhcImF0dGVudGlvbnNcIiksXHJcbiAgICAgICAgICAgICAncXVlc3Rpb24nOiBsZyhcInByb21vY29kZV9yZWNvbW1lbmRhdGlvbnNcIiksXHJcbiAgICAgICAgICAgICAnYnV0dG9uWWVzJzogbGcoXCJjbG9zZVwiKSxcclxuICAgICAgICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xyXG4gICAgICAgICB9KTtcclxuICAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5jYXRhbG9nX3Byb2R1Y3RfbGluaycpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcclxuICAgICAgICAnYnV0dG9uWWVzJzogZmFsc2UsXHJcbiAgICAgICAgICAgICdub3R5ZnlfY2xhc3MnOiBcIm5vdGlmeV9ib3gtYWxlcnRcIixcclxuICAgICAgICAgICAgJ3RpdGxlJzogbGcoXCJwcm9kdWN0X3VzZVwiKSxcclxuICAgICAgICAgICAgJ3F1ZXN0aW9uJzogJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWNvdXBvbi1ub3JlZ2lzdGVyXCI+JyArXHJcbiAgICAgICAgJzxpbWcgc3JjPVwiL2ltYWdlcy90ZW1wbGF0ZXMvc3dhLnBuZ1wiIGFsdD1cIlwiPicgK1xyXG4gICAgICAgICc8cD48Yj4nK2xnKFwicHJvZHVjdF91c2Vfd2l0aG91dF9jYXNoYmFja19vcl9yZWdpc3RlclwiKSsnPC9iPjwvcD4nICtcclxuICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWJ1dHRvbnNcIj4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIicgKyB0aGF0LmF0dHIoJ2hyZWYnKSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImJ0biBub3RpZmljYXRpb24tY2xvc2VcIj4nK2xnKFwicHJvZHVjdF91c2VcIikrJzwvYT4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIiNyZWdpc3RyYXRpb25cIiBjbGFzcz1cImJ0biBidG4tdHJhbnNmb3JtIG1vZGFsc19vcGVuXCI+JytsZyhcInJlZ2lzdGVyXCIpKyc8L2E+JyArXHJcbiAgICAgICAgJzwvZGl2Pid9XHJcbiAgICAgICAgKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuYWNjb3VudC13aXRoZHJhdy1tZXRob2RzX2l0ZW0tb3B0aW9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBvcHRpb24gPSAkKHRoaXMpLmRhdGEoJ29wdGlvbi1wcm9jZXNzJyksXHJcbiAgICAgIHBsYWNlaG9sZGVyID0gJyc7XHJcbiAgICBzd2l0Y2ggKG9wdGlvbikge1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X2Nhc2hfbnVtYmVyXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19yX251bWJlclwiKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfcGhvbmVfbnVtYmVyXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSA0OlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19jYXJ0X251bWJlclwiKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgNTpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfZW1haWxcIik7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDY6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X3Bob25lX251bWJlclwiKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgNzpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfc2tyaWxsXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICQoXCIjdXNlcnN3aXRoZHJhdy1iaWxsXCIpLnByZXYoXCIucGxhY2Vob2xkZXJcIikuaHRtbChwbGFjZWhvbGRlcik7XHJcbiAgICAkKCcjdXNlcnN3aXRoZHJhdy1wcm9jZXNzX2lkJykudmFsKG9wdGlvbik7XHJcbiAgfSk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgYWpheEZvcm0oJCgnLmFqYXhfZm9ybScpKTtcclxuXHJcbiAgJCgnLmZvcm0tdGVzdC1saW5rJykub24oJ3N1Ym1pdCcsZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgZm9ybSA9ICQoJy5mb3JtLXRlc3QtbGluaycpO1xyXG4gICAgaWYoZm9ybS5oYXNDbGFzcygnbG9hZGluZycpKXJldHVybjtcclxuICAgIGZvcm0uZmluZCgnLmhlbHAtYmxvY2snKS5odG1sKFwiXCIpO1xyXG5cclxuICAgIHZhciB1cmwgPSBmb3JtLmZpbmQoJ1tuYW1lPXVybF0nKS52YWwoKTtcclxuICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xyXG5cclxuICAgIGlmKHVybC5sZW5ndGg8Myl7XHJcbiAgICAgIGZvcm0uZmluZCgnLmhlbHAtYmxvY2snKS5odG1sKGxnKCdyZXF1aXJlZCcpKTtcclxuICAgICAgZm9ybS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1lbHNle1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICBmb3JtLmZpbmQoJ2lucHV0JykuYXR0cignZGlzYWJsZWQnLHRydWUpO1xyXG4gICAgJC5wb3N0KGZvcm0uYXR0cignYWN0aW9uJykse3VybDp1cmx9LGZ1bmN0aW9uKGQpe1xyXG4gICAgICBmb3JtLmZpbmQoJ2lucHV0JykuYXR0cignZGlzYWJsZWQnLGZhbHNlKTtcclxuICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICBmb3JtLmZpbmQoJy5oZWxwLWJsb2NrJykuaHRtbChkKTtcclxuICAgIH0pO1xyXG4gIH0pXHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLmRvYnJvLWZ1bmRzX2l0ZW0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICQoJyNkb2Jyby1zZW5kLWZvcm0tY2hhcml0eS1wcm9jZXNzJykudmFsKCQodGhpcykuZGF0YSgnaWQnKSk7XHJcbiAgfSk7XHJcblxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdCcpLmFkZENsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtb3BlbicpO1xyXG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLmFkZENsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUtb3BlbicpO1xyXG4gIH0pO1xyXG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtY2xvc2UnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdCcpLnJlbW92ZUNsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtb3BlbicpO1xyXG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUtb3BlbicpO1xyXG4gIH0pO1xyXG59KSgpO1xyXG4iLCIvL3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKSB7XHJcbmZ1bmN0aW9uIHNoYXJlNDIoKXtcclxuICBlPWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXJlNDJpbml0Jyk7XHJcbiAgZm9yICh2YXIgayA9IDA7IGsgPCBlLmxlbmd0aDsgaysrKSB7XHJcbiAgICB2YXIgdSA9IFwiXCI7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29jaWFscycpICE9IC0xKVxyXG4gICAgICB2YXIgc29jaWFscyA9IEpTT04ucGFyc2UoJ1snK2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNvY2lhbHMnKSsnXScpO1xyXG4gICAgdmFyIGljb25fdHlwZT1lW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXR5cGUnKSAhPSAtMT9lW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXR5cGUnKTonJztcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKSAhPSAtMSlcclxuICAgICAgdSA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXVybCcpO1xyXG4gICAgdmFyIHByb21vID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvbW8nKTtcclxuICAgIGlmKHByb21vICYmIHByb21vLmxlbmd0aD4wKSB7XHJcbiAgICAgIHZhciBrZXkgPSAncHJvbW89JyxcclxuICAgICAgICBwcm9tb1N0YXJ0ID0gdS5pbmRleE9mKGtleSksXHJcbiAgICAgICAgcHJvbW9FbmQgPSB1LmluZGV4T2YoJyYnLCBwcm9tb1N0YXJ0KSxcclxuICAgICAgICBwcm9tb0xlbmd0aCA9IHByb21vRW5kID4gcHJvbW9TdGFydCA/IHByb21vRW5kIC0gcHJvbW9TdGFydCAtIGtleS5sZW5ndGggOiB1Lmxlbmd0aCAtIHByb21vU3RhcnQgLSBrZXkubGVuZ3RoO1xyXG4gICAgICBpZihwcm9tb1N0YXJ0ID4gMCkge1xyXG4gICAgICAgIHByb21vID0gdS5zdWJzdHIocHJvbW9TdGFydCArIGtleS5sZW5ndGgsIHByb21vTGVuZ3RoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdmFyIHNlbGZfcHJvbW8gPSAocHJvbW8gJiYgcHJvbW8ubGVuZ3RoID4gMCk/IFwic2V0VGltZW91dChmdW5jdGlvbigpe3NlbmRfcHJvbW8oJ1wiK3Byb21vK1wiJyk7fSwyMDAwKTtcIiA6IFwiXCI7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi1zaXplJykgIT0gLTEpXHJcbiAgICAgIHZhciBpY29uX3NpemUgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXNpemUnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpICE9IC0xKVxyXG4gICAgICB2YXIgdCA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJyk7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1hZ2UnKSAhPSAtMSlcclxuICAgICAgdmFyIGkgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pbWFnZScpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWRlc2NyaXB0aW9uJykgIT0gLTEpXHJcbiAgICAgIHZhciBkID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzY3JpcHRpb24nKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wYXRoJykgIT0gLTEpXHJcbiAgICAgIHZhciBmID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF0aCcpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb25zLWZpbGUnKSAhPSAtMSlcclxuICAgICAgdmFyIGZuID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbnMtZmlsZScpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNjcmlwdC1hZnRlcicpKSB7XHJcbiAgICAgIHNlbGZfcHJvbW8gKz0gXCJzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XCIrZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2NyaXB0LWFmdGVyJykrXCJ9LDMwMDApO1wiO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZikge1xyXG4gICAgICBmdW5jdGlvbiBwYXRoKG5hbWUpIHtcclxuICAgICAgICB2YXIgc2MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylcclxuICAgICAgICAgICwgc3IgPSBuZXcgUmVnRXhwKCdeKC4qL3wpKCcgKyBuYW1lICsgJykoWyM/XXwkKScpO1xyXG4gICAgICAgIGZvciAodmFyIHAgPSAwLCBzY0wgPSBzYy5sZW5ndGg7IHAgPCBzY0w7IHArKykge1xyXG4gICAgICAgICAgdmFyIG0gPSBTdHJpbmcoc2NbcF0uc3JjKS5tYXRjaChzcik7XHJcbiAgICAgICAgICBpZiAobSkge1xyXG4gICAgICAgICAgICBpZiAobVsxXS5tYXRjaCgvXigoaHR0cHM/fGZpbGUpXFw6XFwvezIsfXxcXHc6W1xcL1xcXFxdKS8pKVxyXG4gICAgICAgICAgICAgIHJldHVybiBtWzFdO1xyXG4gICAgICAgICAgICBpZiAobVsxXS5pbmRleE9mKFwiL1wiKSA9PSAwKVxyXG4gICAgICAgICAgICAgIHJldHVybiBtWzFdO1xyXG4gICAgICAgICAgICBiID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2Jhc2UnKTtcclxuICAgICAgICAgICAgaWYgKGJbMF0gJiYgYlswXS5ocmVmKVxyXG4gICAgICAgICAgICAgIHJldHVybiBiWzBdLmhyZWYgKyBtWzFdO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC8oLipbXFwvXFxcXF0pLylbMF0gKyBtWzFdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBmID0gcGF0aCgnc2hhcmU0Mi5qcycpO1xyXG4gICAgfVxyXG4gICAgaWYgKCF1KVxyXG4gICAgICB1ID0gbG9jYXRpb24uaHJlZjtcclxuICAgIGlmICghdClcclxuICAgICAgdCA9IGRvY3VtZW50LnRpdGxlO1xyXG4gICAgaWYgKCFmbilcclxuICAgICAgZm4gPSAnaWNvbnMucG5nJztcclxuICAgIGZ1bmN0aW9uIGRlc2MoKSB7XHJcbiAgICAgIHZhciBtZXRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ldGEnKTtcclxuICAgICAgZm9yICh2YXIgbSA9IDA7IG0gPCBtZXRhLmxlbmd0aDsgbSsrKSB7XHJcbiAgICAgICAgaWYgKG1ldGFbbV0ubmFtZS50b0xvd2VyQ2FzZSgpID09ICdkZXNjcmlwdGlvbicpIHtcclxuICAgICAgICAgIHJldHVybiBtZXRhW21dLmNvbnRlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuICAgIGlmICghZClcclxuICAgICAgZCA9IGRlc2MoKTtcclxuICAgIHUgPSBlbmNvZGVVUklDb21wb25lbnQodSk7XHJcbiAgICB0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHQpO1xyXG4gICAgdCA9IHQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcclxuICAgIGkgPSBlbmNvZGVVUklDb21wb25lbnQoaSk7XHJcbiAgICB2YXIgZF9vcmlnPWQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcclxuICAgIGQgPSBlbmNvZGVVUklDb21wb25lbnQoZCk7XHJcbiAgICBkID0gZC5yZXBsYWNlKC9cXCcvZywgJyUyNycpO1xyXG4gICAgdmFyIGZiUXVlcnkgPSAndT0nICsgdTtcclxuICAgIGlmIChpICE9ICdudWxsJyAmJiBpICE9ICcnKVxyXG4gICAgICBmYlF1ZXJ5ID0gJ3M9MTAwJnBbdXJsXT0nICsgdSArICcmcFt0aXRsZV09JyArIHQgKyAnJnBbc3VtbWFyeV09JyArIGQgKyAnJnBbaW1hZ2VzXVswXT0nICsgaTtcclxuICAgIHZhciB2a0ltYWdlID0gJyc7XHJcbiAgICBpZiAoaSAhPSAnbnVsbCcgJiYgaSAhPSAnJylcclxuICAgICAgdmtJbWFnZSA9ICcmaW1hZ2U9JyArIGk7XHJcbiAgICB2YXIgcyA9IG5ldyBBcnJheShcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJmYlwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PScgKyB1ICsnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBGYWNlYm9va1wiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJ2a1wiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vdmsuY29tL3NoYXJlLnBocD91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgdmtJbWFnZSArICcmZGVzY3JpcHRpb249JyArIGQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQkiDQmtC+0L3RgtCw0LrRgtC1XCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cIm9ka2xcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL2Nvbm5lY3Qub2sucnUvb2ZmZXI/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICcmZGVzY3JpcHRpb249JysgZCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIg0J7QtNC90L7QutC70LDRgdGB0L3QuNC60LhcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidHdpXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD0nICsgdCArICcmdXJsPScgKyB1ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiBUd2l0dGVyXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cImdwbHVzXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9wbHVzLmdvb2dsZS5jb20vc2hhcmU/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIEdvb2dsZStcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwibWFpbFwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vY29ubmVjdC5tYWlsLnJ1L3NoYXJlP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnJmRlc2NyaXB0aW9uPScgKyBkICsgJyZpbWFnZXVybD0nICsgaSArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyINCc0L7QtdC8INCc0LjRgNC1QE1haWwuUnVcIicsXHJcbiAgICAgICdcIi8vd3d3LmxpdmVqb3VybmFsLmNvbS91cGRhdGUuYm1sP2V2ZW50PScgKyB1ICsgJyZzdWJqZWN0PScgKyB0ICsgJ1wiIHRpdGxlPVwi0J7Qv9GD0LHQu9C40LrQvtCy0LDRgtGMINCyIExpdmVKb3VybmFsXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInBpblwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vcGludGVyZXN0LmNvbS9waW4vY3JlYXRlL2J1dHRvbi8/dXJsPScgKyB1ICsgJyZtZWRpYT0nICsgaSArICcmZGVzY3JpcHRpb249JyArIHQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTYwMCwgaGVpZ2h0PTMwMCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQlNC+0LHQsNCy0LjRgtGMINCyIFBpbnRlcmVzdFwiJyxcclxuICAgICAgJ1wiXCIgb25jbGljaz1cInJldHVybiBmYXYodGhpcyk7XCIgdGl0bGU9XCLQodC+0YXRgNCw0L3QuNGC0Ywg0LIg0LjQt9Cx0YDQsNC90L3QvtC1INCx0YDQsNGD0LfQtdGA0LBcIicsXHJcbiAgICAgICdcIiNcIiBvbmNsaWNrPVwicHJpbnQoKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCg0LDRgdC/0LXRh9Cw0YLQsNGC0YxcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidGVsZWdyYW1cIiBvbmNsaWNrPVwid2luZG93Lm9wZW4oXFwnLy90ZWxlZ3JhbS5tZS9zaGFyZS91cmw/dXJsPScgKyB1ICsnJnRleHQ9JyArIHQgKyAnXFwnLCBcXCd0ZWxlZ3JhbVxcJywgXFwnd2lkdGg9NTUwLGhlaWdodD00NDAsbGVmdD0xMDAsdG9wPTEwMFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBUZWxlZ3JhbVwiJyxcclxuICAgICAgJ1widmliZXI6Ly9mb3J3YXJkP3RleHQ9JysgdSArJyAtICcgKyB0ICsgJ1wiIGRhdGEtY291bnQ9XCJ2aWJlclwiIHJlbD1cIm5vZm9sbG93IG5vb3BlbmVyXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBWaWJlclwiJyxcclxuICAgICAgJ1wid2hhdHNhcHA6Ly9zZW5kP3RleHQ9JysgdSArJyAtICcgKyB0ICsgJ1wiIGRhdGEtY291bnQ9XCJ3aGF0c2FwcFwiIHJlbD1cIm5vZm9sbG93IG5vb3BlbmVyXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBXaGF0c0FwcFwiJ1xyXG5cclxuICAgICk7XHJcblxyXG4gICAgdmFyIGwgPSAnJztcclxuXHJcbiAgICBpZihzb2NpYWxzLmxlbmd0aD4xKXtcclxuICAgICAgZm9yIChxID0gMDsgcSA8IHNvY2lhbHMubGVuZ3RoOyBxKyspe1xyXG4gICAgICAgIGo9c29jaWFsc1txXTtcclxuICAgICAgICBsICs9ICc8YSByZWw9XCJub2ZvbGxvd1wiIGhyZWY9JyArIHNbal0gKyAnIHRhcmdldD1cIl9ibGFua1wiICcrZ2V0SWNvbihzW2pdLGosaWNvbl90eXBlLGYsZm4saWNvbl9zaXplKSsnPjwvYT4nO1xyXG4gICAgICB9XHJcbiAgICB9ZWxzZXtcclxuICAgICAgZm9yIChqID0gMDsgaiA8IHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBsICs9ICc8YSByZWw9XCJub2ZvbGxvd1wiIGhyZWY9JyArIHNbal0gKyAnIHRhcmdldD1cIl9ibGFua1wiICcrZ2V0SWNvbihzW2pdLGosaWNvbl90eXBlLGYsZm4saWNvbl9zaXplKSsnPjwvYT4nO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlW2tdLmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cInNoYXJlNDJfd3JhcFwiPicgKyBsICsgJzwvc3Bhbj4nO1xyXG4gIH1cclxuICBcclxuLy99LCBmYWxzZSk7XHJcbn1cclxuXHJcbnNoYXJlNDIoKTtcclxuXHJcbmZ1bmN0aW9uIGdldEljb24ocyxqLHQsZixmbixzaXplKSB7XHJcbiAgaWYoIXNpemUpe1xyXG4gICAgc2l6ZT0zMjtcclxuICB9XHJcbiAgaWYodD09J2Nzcycpe1xyXG4gICAgaj1zLmluZGV4T2YoJ2RhdGEtY291bnQ9XCInKSsxMjtcclxuICAgIHZhciBsPXMuaW5kZXhPZignXCInLGopLWo7XHJcbiAgICB2YXIgbDI9cy5pbmRleE9mKCcuJyxqKS1qO1xyXG4gICAgbD1sPmwyICYmIGwyPjAgP2wyOmw7XHJcbiAgICAvL3ZhciBpY29uPSdjbGFzcz1cInNvYy1pY29uIGljb24tJytzLnN1YnN0cihqLGwpKydcIic7XHJcbiAgICB2YXIgaWNvbj0nY2xhc3M9XCJzb2MtaWNvbi1zZCBpY29uLXNkLScrcy5zdWJzdHIoaixsKSsnXCInO1xyXG4gIH1lbHNlIGlmKHQ9PSdzdmcnKXtcclxuICAgIHZhciBzdmc9W1xyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMTEuOTQsMTc3LjA4KVwiIGQ9XCJNMCAwIDAgNzAuMyAyMy42IDcwLjMgMjcuMSA5Ny43IDAgOTcuNyAwIDExNS4yQzAgMTIzLjIgMi4yIDEyOC42IDEzLjYgMTI4LjZMMjguMSAxMjguNiAyOC4xIDE1My4xQzI1LjYgMTUzLjQgMTcgMTU0LjIgNi45IDE1NC4yLTE0IDE1NC4yLTI4LjMgMTQxLjQtMjguMyAxMTcuOUwtMjguMyA5Ny43LTUyIDk3LjctNTIgNzAuMy0yOC4zIDcwLjMtMjguMyAwIDAgMFpcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsOTguMjc0LDE0NS41MilcIiBkPVwiTTAgMCA5LjYgMEM5LjYgMCAxMi41IDAuMyAxNCAxLjkgMTUuNCAzLjQgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMSAxOSAyMS4xIDIxIDI3IDIyLjggMzQuNiA4LjUgNDIuNyAzIDQ4LjctMS4yIDUzLjMtMC4zIDUzLjMtMC4zTDc0LjggMEM3NC44IDAgODYuMSAwLjcgODAuNyA5LjUgODAuMyAxMC4zIDc3LjYgMTYuMSA2NC44IDI4IDUxLjMgNDAuNSA1My4xIDM4LjUgNjkuMyA2MC4xIDc5LjIgNzMuMyA4My4yIDgxLjQgODEuOSA4NC44IDgwLjggODguMSA3My41IDg3LjIgNzMuNSA4Ny4yTDQ5LjMgODcuMUM0OS4zIDg3LjEgNDcuNSA4Ny4zIDQ2LjIgODYuNSA0NC45IDg1LjcgNDQgODMuOSA0NCA4My45IDQ0IDgzLjkgNDAuMiA3My43IDM1LjEgNjUuMSAyNC4zIDQ2LjggMjAgNDUuOCAxOC4zIDQ2LjkgMTQuMiA0OS42IDE1LjIgNTcuNiAxNS4yIDYzLjIgMTUuMiA4MSAxNy45IDg4LjQgOS45IDkwLjMgNy4zIDkwLjkgNS40IDkxLjMtMS40IDkxLjQtMTAgOTEuNS0xNy4zIDkxLjQtMjEuNCA4OS4zLTI0LjIgODgtMjYuMyA4NS0yNSA4NC44LTIzLjQgODQuNi0xOS44IDgzLjgtMTcuOSA4MS4yLTE1LjQgNzcuOS0xNS41IDcwLjMtMTUuNSA3MC4zLTE1LjUgNzAuMy0xNC4xIDQ5LjQtMTguOCA0Ni44LTIyLjEgNDUtMjYuNSA0OC43LTM2LjEgNjUuMy00MS4xIDczLjgtNDQuOCA4My4yLTQ0LjggODMuMi00NC44IDgzLjItNDUuNSA4NC45LTQ2LjggODUuOS00OC4zIDg3LTUwLjUgODcuNC01MC41IDg3LjRMLTczLjUgODcuMkMtNzMuNSA4Ny4yLTc2LjkgODcuMS03OC4yIDg1LjYtNzkuMyA4NC4zLTc4LjMgODEuNS03OC4zIDgxLjUtNzguMyA4MS41LTYwLjMgMzkuNC0zOS45IDE4LjItMjEuMi0xLjMgMCAwIDAgMFwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48ZyB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoMTA2Ljg4LDE4My42MSlcIj48ZyB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoLTYuODgwNSwtMTAwKVwiIHN0eWxlPVwic3Ryb2tlOm5vbmU7c3Ryb2tlLW9wYWNpdHk6MVwiPjxwYXRoIGQ9XCJNIDAsMCBDIDguMTQ2LDAgMTQuNzY5LC02LjYyNSAxNC43NjksLTE0Ljc3IDE0Ljc2OSwtMjIuOTA3IDguMTQ2LC0yOS41MzMgMCwtMjkuNTMzIC04LjEzNiwtMjkuNTMzIC0xNC43NjksLTIyLjkwNyAtMTQuNzY5LC0xNC43NyAtMTQuNzY5LC02LjYyNSAtOC4xMzYsMCAwLDAgTSAwLC01MC40MjkgQyAxOS42NzYsLTUwLjQyOSAzNS42NywtMzQuNDM1IDM1LjY3LC0xNC43NyAzNS42Nyw0LjkwMyAxOS42NzYsMjAuOTAzIDAsMjAuOTAzIC0xOS42NzEsMjAuOTAzIC0zNS42NjksNC45MDMgLTM1LjY2OSwtMTQuNzcgLTM1LjY2OSwtMzQuNDM1IC0xOS42NzEsLTUwLjQyOSAwLC01MC40MjlcIiBzdHlsZT1cImZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIi8+PC9nPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw3LjU1MTYsLTU0LjU3NylcIiBzdHlsZT1cInN0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIj48cGF0aCBkPVwiTSAwLDAgQyA3LjI2MiwxLjY1NSAxNC4yNjQsNC41MjYgMjAuNzE0LDguNTc4IDI1LjU5NSwxMS42NTQgMjcuMDY2LDE4LjEwOCAyMy45OSwyMi45ODkgMjAuOTE3LDI3Ljg4MSAxNC40NjksMjkuMzUyIDkuNTc5LDI2LjI3NSAtNS4wMzIsMTcuMDg2IC0yMy44NDMsMTcuMDkyIC0zOC40NDYsMjYuMjc1IC00My4zMzYsMjkuMzUyIC00OS43ODQsMjcuODgxIC01Mi44NTIsMjIuOTg5IC01NS45MjgsMTguMTA0IC01NC40NjEsMTEuNjU0IC00OS41OCw4LjU3OCAtNDMuMTMyLDQuNTMxIC0zNi4xMjgsMS42NTUgLTI4Ljg2NywwIEwgLTQ4LjgwOSwtMTkuOTQxIEMgLTUyLjg4NiwtMjQuMDIyIC01Mi44ODYsLTMwLjYzOSAtNDguODA1LC0zNC43MiAtNDYuNzYyLC0zNi43NTggLTQ0LjA5LC0zNy43NzkgLTQxLjQxOCwtMzcuNzc5IC0zOC43NDIsLTM3Ljc3OSAtMzYuMDY1LC0zNi43NTggLTM0LjAyMywtMzQuNzIgTCAtMTQuNDM2LC0xNS4xMjMgNS4xNjksLTM0LjcyIEMgOS4yNDYsLTM4LjgwMSAxNS44NjIsLTM4LjgwMSAxOS45NDMsLTM0LjcyIDI0LjAyOCwtMzAuNjM5IDI0LjAyOCwtMjQuMDE5IDE5Ljk0MywtMTkuOTQxIEwgMCwwIFpcIiBzdHlsZT1cImZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIi8+PC9nPjwvZz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxNjkuNzYsNTYuNzI3KVwiIGQ9XCJNMCAwQy01LjEtMi4zLTEwLjYtMy44LTE2LjQtNC41LTEwLjUtMS02IDQuNi0zLjkgMTEuMy05LjQgOC0xNS41IDUuNy0yMiA0LjQtMjcuMyA5LjktMzQuNyAxMy40LTQyLjkgMTMuNC01OC43IDEzLjQtNzEuNiAwLjYtNzEuNi0xNS4yLTcxLjYtMTcuNC03MS4zLTE5LjYtNzAuOC0yMS43LTk0LjYtMjAuNS0xMTUuNy05LjEtMTI5LjggOC4yLTEzMi4zIDQtMTMzLjctMS0xMzMuNy02LjItMTMzLjctMTYuMS0xMjguNi0yNC45LTEyMC45LTMwLTEyNS42LTI5LjktMTMwLjEtMjguNi0xMzMuOS0yNi41LTEzMy45LTI2LjYtMTMzLjktMjYuNy0xMzMuOS0yNi44LTEzMy45LTQwLjctMTI0LTUyLjMtMTExLTU0LjktMTEzLjQtNTUuNS0xMTUuOS01NS45LTExOC41LTU1LjktMTIwLjMtNTUuOS0xMjIuMS01NS43LTEyMy45LTU1LjQtMTIwLjItNjYuNy0xMDkuNy03NS05Ny4xLTc1LjMtMTA2LjktODIuOS0xMTkuMy04Ny41LTEzMi43LTg3LjUtMTM1LTg3LjUtMTM3LjMtODcuNC0xMzkuNS04Ny4xLTEyNi44LTk1LjItMTExLjgtMTAwLTk1LjYtMTAwLTQzLTEwMC0xNC4yLTU2LjMtMTQuMi0xOC41LTE0LjItMTcuMy0xNC4yLTE2LTE0LjMtMTQuOC04LjctMTAuOC0zLjgtNS43IDAgMFwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgxIDAgMCAtMSA3Mi4zODEgOTAuMTcyKVwiPjxwYXRoIGQ9XCJNODcuMiAwIDg3LjIgMTcuMSA3NSAxNy4xIDc1IDAgNTcuOSAwIDU3LjktMTIuMiA3NS0xMi4yIDc1LTI5LjMgODcuMi0yOS4zIDg3LjItMTIuMiAxMDQuMy0xMi4yIDEwNC4zIDAgODcuMiAwWlwiLz48cGF0aCBkPVwiTTAgMCAwLTE5LjYgMjYuMi0xOS42QzI1LjQtMjMuNyAyMy44LTI3LjUgMjAuOC0zMC42IDEwLjMtNDIuMS05LjMtNDItMjAuNS0zMC40LTMxLjctMTguOS0zMS42LTAuMy0yMC4yIDExLjEtOS40IDIxLjkgOCAyMi40IDE4LjYgMTIuMUwxOC41IDEyLjEgMzIuOCAyNi40QzEzLjcgNDMuOC0xNS44IDQzLjUtMzQuNSAyNS4xLTUzLjggNi4xLTU0LTI1LTM0LjktNDQuMy0xNS45LTYzLjUgMTcuMS02My43IDM0LjktNDQuNiA0NS42LTMzIDQ4LjctMTYuNCA0Ni4yIDBMMCAwWlwiLz48L2c+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsOTcuNjc2LDYyLjQxMSlcIiBkPVwiTTAgMEMxMC4yIDAgMTkuOS00LjUgMjYuOS0xMS42TDI2LjktMTEuNkMyNi45LTguMiAyOS4yLTUuNyAzMi40LTUuN0wzMy4yLTUuN0MzOC4yLTUuNyAzOS4yLTEwLjQgMzkuMi0xMS45TDM5LjItNjQuOEMzOC45LTY4LjIgNDIuOC03MCA0NS02Ny44IDUzLjUtNTkuMSA2My42LTIyLjkgMzkuNy0yIDE3LjQgMTcuNi0xMi41IDE0LjMtMjguNSAzLjQtNDUuNC04LjMtNTYuMi0zNC4xLTQ1LjctNTguNC0zNC4yLTg0LjktMS40LTkyLjggMTguMS04NC45IDI4LTgwLjkgMzIuNS05NC4zIDIyLjMtOTguNiA2LjgtMTA1LjItMzYuNC0xMDQuNS01Ni41LTY5LjYtNzAuMS00Ni4xLTY5LjQtNC42LTMzLjMgMTYuOS01LjcgMzMuMyAzMC43IDI4LjggNTIuNyA1LjggNzUuNi0xOC4yIDc0LjMtNjMgNTEuOS04MC41IDQxLjgtODguNCAyNi43LTgwLjcgMjYuOC02OS4yTDI2LjctNjUuNEMxOS42LTcyLjQgMTAuMi03Ni41IDAtNzYuNS0yMC4yLTc2LjUtMzgtNTguNy0zOC0zOC40LTM4LTE4LTIwLjIgMCAwIDBNMjUuNS0zN0MyNC43LTIyLjIgMTMuNy0xMy4zIDAuNC0xMy4zTC0wLjEtMTMuM0MtMTUuNC0xMy4zLTIzLjktMjUuMy0yMy45LTM5LTIzLjktNTQuMy0xMy42LTY0LTAuMS02NCAxNC45LTY0IDI0LjgtNTMgMjUuNS00MEwyNS41LTM3WlwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgwLjQyNjIzIDAgMCAwLjQyNjIzIDM0Ljk5OSAzNSlcIj48cGF0aCBkPVwiTTE2MC43IDE5LjVjLTE4LjkgMC0zNy4zIDMuNy01NC43IDEwLjlMNzYuNCAwLjdjLTAuOC0wLjgtMi4xLTEtMy4xLTAuNEM0NC40IDE4LjIgMTkuOCA0Mi45IDEuOSA3MS43Yy0wLjYgMS0wLjUgMi4zIDAuNCAzLjFsMjguNCAyOC40Yy04LjUgMTguNi0xMi44IDM4LjUtMTIuOCA1OS4xIDAgNzguNyA2NCAxNDIuOCAxNDIuOCAxNDIuOCA3OC43IDAgMTQyLjgtNjQgMTQyLjgtMTQyLjhDMzAzLjQgODMuNSAyMzkuNCAxOS41IDE2MC43IDE5LjV6TTIxNy4yIDE0OC43bDkuOSA0Mi4xIDkuNSA0NC40IC00NC4zLTkuNSAtNDIuMS05LjlMMzYuNyAxMDIuMWMxNC4zLTI5LjMgMzguMy01Mi42IDY4LjEtNjUuOEwyMTcuMiAxNDguN3pcIi8+PHBhdGggZD1cIk0yMjEuOCAxODcuNGwtNy41LTMzYy0yNS45IDExLjktNDYuNCAzMi40LTU4LjMgNTguM2wzMyA3LjVDMTk2IDIwNi4yIDIwNy43IDE5NC40IDIyMS44IDE4Ny40elwiLz48L2c+PC9zdmc+JyxcclxuICAgICAgJycsLy9waW5cclxuICAgICAgJycsLy9mYXZcclxuICAgICAgJycsLy9wcmludFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw3MS4yNjQsMTA2LjkzKVwiIGQ9XCJNMCAwIDY4LjYgNDMuMUM3MiA0NS4zIDczLjEgNDIuOCA3MS42IDQxLjFMMTQuNi0xMC4yIDExLjctMzUuOCAwIDBaTTg3LjEgNjIuOS0zMy40IDE3LjJDLTQwIDE1LjMtMzkuOCA4LjgtMzQuOSA3LjNMLTQuNy0yLjIgNi44LTM3LjZDOC4yLTQxLjUgOS40LTQyLjkgMTEuOC00MyAxNC4zLTQzIDE1LjMtNDIuMSAxNy45LTM5LjggMjAuOS0zNi45IDI1LjYtMzIuMyAzMy0yNS4yTDY0LjQtNDguNEM3MC4yLTUxLjYgNzQuMy00OS45IDc1LjgtNDNMOTUuNSA1NC40Qzk3LjYgNjIuOSA5Mi42IDY1LjQgODcuMSA2Mi45XCIvPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDEzNS4zMywxMTkuODUpXCIgZD1cIk0wIDBDLTIuNC01LjQtNi41LTktMTIuMi0xMC42LTE0LjMtMTEuMi0xNi4zLTEwLjctMTguMi05LjktNDQuNCAxLjItNjMuMyAxOS42LTc0IDQ2LjItNzQuOCA0OC4xLTc1LjMgNTAuMS03NS4yIDUxLjktNzUuMiA1OC43LTY5LjIgNjUtNjIuNiA2NS40LTYwLjggNjUuNS01OS4yIDY0LjktNTcuOSA2My43LTUzLjMgNTkuMy00OS42IDU0LjMtNDYuOSA0OC42LTQ1LjQgNDUuNS00NiA0My4zLTQ4LjcgNDEuMS00OS4xIDQwLjctNDkuNSA0MC40LTUwIDQwLjEtNTMuNSAzNy41LTU0LjMgMzQuOS01Mi42IDMwLjgtNDkuOCAyNC4yLTQ1LjQgMTktMzkuMyAxNS4xLTM3IDEzLjYtMzQuNyAxMi4yLTMyIDExLjUtMjkuNiAxMC44LTI3LjcgMTEuNS0yNi4xIDEzLjQtMjUuOSAxMy42LTI1LjggMTMuOS0yNS42IDE0LjEtMjIuMyAxOC44LTE4LjYgMTkuNi0xMy43IDE2LjUtOS42IDEzLjktNS42IDExLTEuOCA3LjggMC43IDUuNiAxLjMgMyAwIDBNLTE4LjIgMzYuN0MtMTguMyAzNS45LTE4LjMgMzUuNC0xOC40IDM0LjktMTguNiAzNC0xOS4yIDMzLjQtMjAuMiAzMy40LTIxLjMgMzMuNC0yMS45IDM0LTIyLjIgMzQuOS0yMi4zIDM1LjUtMjIuNCAzNi4yLTIyLjUgMzYuOS0yMy4yIDQwLjMtMjUuMiA0Mi42LTI4LjYgNDMuNi0yOS4xIDQzLjctMjkuNSA0My43LTI5LjkgNDMuOC0zMSA0NC4xLTMyLjQgNDQuMi0zMi40IDQ1LjgtMzIuNSA0Ny4xLTMxLjUgNDcuOS0yOS42IDQ4LTI4LjQgNDguMS0yNi41IDQ3LjUtMjUuNCA0Ni45LTIwLjkgNDQuNy0xOC43IDQxLjYtMTguMiAzNi43TS0yNS41IDUxLjJDLTI4IDUyLjEtMzAuNSA1Mi44LTMzLjIgNTMuMi0zNC41IDUzLjQtMzUuNCA1NC4xLTM1LjEgNTUuNi0zNC45IDU3LTM0IDU3LjUtMzIuNiA1Ny40LTI0IDU2LjYtMTcuMyA1My40LTEyLjYgNDYtMTAuNSA0Mi41LTkuMiAzNy41LTkuNCAzMy44LTkuNSAzMS4yLTkuOSAzMC41LTExLjQgMzAuNS0xMy42IDMwLjYtMTMuMyAzMi40LTEzLjUgMzMuNy0xMy43IDM1LjctMTQuMiAzNy43LTE0LjcgMzkuNy0xNi4zIDQ1LjQtMTkuOSA0OS4zLTI1LjUgNTEuMk0tMzggNjQuNEMtMzcuOSA2NS45LTM3IDY2LjUtMzUuNSA2Ni40LTIzLjIgNjUuOC0xMy45IDYyLjItNi43IDUyLjUtMi41IDQ2LjktMC4yIDM5LjIgMCAzMi4yIDAgMzEuMSAwIDMwIDAgMjktMC4xIDI3LjgtMC42IDI2LjktMS45IDI2LjktMy4yIDI2LjktMy45IDI3LjYtNCAyOS00LjMgMzQuMi01LjMgMzkuMy03LjMgNDQuMS0xMS4yIDUzLjUtMTguNiA1OC42LTI4LjEgNjEuMS0zMC43IDYxLjctMzMuMiA2Mi4yLTM1LjggNjIuNS0zNyA2Mi41LTM4IDYyLjgtMzggNjQuNE0xMS41IDc0LjFDNi42IDc4LjMgMC45IDgwLjgtNS4zIDgyLjQtMjAuOCA4Ni41LTM2LjUgODcuNS01Mi40IDg1LjMtNjAuNSA4NC4yLTY4LjMgODIuMS03NS40IDc4LjEtODMuOCA3My40LTg5LjYgNjYuNi05Mi4yIDU3LjEtOTQgNTAuNC05NC45IDQzLjYtOTUuMiAzNi42LTk1LjcgMjYuNC05NS40IDE2LjMtOTIuOCA2LjMtODkuOC01LjMtODMuMi0xMy44LTcxLjktMTguMy03MC43LTE4LjgtNjkuNS0xOS41LTY4LjMtMjAtNjcuMi0yMC40LTY2LjgtMjEuMi02Ni44LTIyLjQtNjYuOS0zMC40LTY2LjgtMzguNC02Ni44LTQ2LjctNjMuOS00My45LTYxLjgtNDEuOC02MC4zLTQwLjEtNTUuOS0zNS4xLTUxLjctMzAuOS00Ny4xLTI2LjEtNDQuNy0yMy43LTQ1LjctMjMuOC00Mi4xLTIzLjgtMzcuOC0yMy45LTMxLTI0LjEtMjYuOC0yMy44LTE4LjYtMjMuMS0xMC42LTIyLjEtMi43LTE5LjcgNy4yLTE2LjcgMTUuMi0xMS40IDE5LjItMS4zIDIwLjMgMS4zIDIxLjQgNCAyMiA2LjggMjUuOSAyMi45IDI1LjQgMzguOSAyMi4yIDU1IDIwLjYgNjIuNCAxNy41IDY5IDExLjUgNzQuMVwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMzAuODQsMTEyLjcpXCIgZD1cIk0wIDBDLTEuNiAwLjktOS40IDUuMS0xMC44IDUuNy0xMi4zIDYuMy0xMy40IDYuNi0xNC41IDUtMTUuNiAzLjQtMTguOS0wLjEtMTkuOS0xLjEtMjAuOC0yLjItMjEuOC0yLjMtMjMuNC0xLjQtMjUtMC41LTMwLjEgMS40LTM2LjEgNy4xLTQwLjcgMTEuNS00My43IDE3LTQ0LjYgMTguNi00NS41IDIwLjMtNDQuNiAyMS4xLTQzLjggMjEuOS00MyAyMi42LTQyLjEgMjMuNy00MS4zIDI0LjYtNDAuNCAyNS41LTQwLjEgMjYuMi0zOS41IDI3LjItMzkgMjguMy0zOS4yIDI5LjMtMzkuNiAzMC4xLTM5LjkgMzAuOS00Mi45IDM5LTQ0LjEgNDIuMy00NS4zIDQ1LjUtNDYuNyA0NS00Ny42IDQ1LjEtNDguNiA0NS4xLTQ5LjYgNDUuMy01MC43IDQ1LjMtNTEuOCA0NS40LTUzLjYgNDUtNTUuMSA0My41LTU2LjYgNDEuOS02MSAzOC4yLTYxLjMgMzAuMi02MS42IDIyLjMtNTYuMSAxNC40LTU1LjMgMTMuMy01NC41IDEyLjItNDQuOC01LjEtMjguNi0xMi4xLTEyLjQtMTkuMi0xMi40LTE3LjEtOS40LTE2LjktNi40LTE2LjggMC4zLTEzLjQgMS44LTkuNiAzLjMtNS45IDMuNC0yLjcgMy0yIDIuNi0xLjMgMS42LTAuOSAwIDBNLTI5LjctMzguM0MtNDAuNC0zOC4zLTUwLjMtMzUuMS01OC42LTI5LjZMLTc4LjktMzYuMS03Mi4zLTE2LjVDLTc4LjYtNy44LTgyLjMgMi44LTgyLjMgMTQuNC04Mi4zIDQzLjQtNTguNyA2Ny4xLTI5LjcgNjcuMS0wLjYgNjcuMSAyMyA0My40IDIzIDE0LjQgMjMtMTQuNy0wLjYtMzguMy0yOS43LTM4LjNNLTI5LjcgNzcuNkMtNjQuNiA3Ny42LTkyLjkgNDkuMy05Mi45IDE0LjQtOTIuOSAyLjQtODkuNi04LjgtODMuOS0xOC4zTC05NS4zLTUyLjItNjAuMi00MUMtNTEuMi00Ni00MC44LTQ4LjktMjkuNy00OC45IDUuMy00OC45IDMzLjYtMjAuNiAzMy42IDE0LjQgMzMuNiA0OS4zIDUuMyA3Ny42LTI5LjcgNzcuNlwiLz48L3N2Zz4nLFxyXG4gICAgXTtcclxuICAgIHZhciBpY29uPXN2Z1tqXTtcclxuICAgIHZhciBjc3M9JyBzdHlsZT1cIndpZHRoOicrc2l6ZSsncHg7aGVpZ2h0Oicrc2l6ZSsncHhcIiAnO1xyXG4gICAgaWNvbj0nPHN2ZyBjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2Qtc3ZnXCInK2NzcytpY29uLnN1YnN0cmluZyg0KTtcclxuICAgIGljb249Jz4nK2ljb24uc3Vic3RyaW5nKDAsIGljb24ubGVuZ3RoIC0gMSk7XHJcbiAgfWVsc2V7XHJcbiAgICBpY29uPSdzdHlsZT1cImRpc3BsYXk6aW5saW5lLWJsb2NrO3ZlcnRpY2FsLWFsaWduOmJvdHRvbTt3aWR0aDonK3NpemUrJ3B4O2hlaWdodDonK3NpemUrJ3B4O21hcmdpbjowIDZweCA2cHggMDtwYWRkaW5nOjA7b3V0bGluZTpub25lO2JhY2tncm91bmQ6dXJsKCcgKyBmICsgZm4gKyAnKSAtJyArIHNpemUgKiBqICsgJ3B4IDAgbm8tcmVwZWF0OyBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1wiJ1xyXG4gIH1cclxuICByZXR1cm4gaWNvbjtcclxufVxyXG5cclxuZnVuY3Rpb24gZmF2KGEpIHtcclxuICB2YXIgdGl0bGUgPSBkb2N1bWVudC50aXRsZTtcclxuICB2YXIgdXJsID0gZG9jdW1lbnQubG9jYXRpb247XHJcbiAgdHJ5IHtcclxuICAgIHdpbmRvdy5leHRlcm5hbC5BZGRGYXZvcml0ZSh1cmwsIHRpdGxlKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICB3aW5kb3cuc2lkZWJhci5hZGRQYW5lbCh0aXRsZSwgdXJsLCAnJyk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgKG9wZXJhKSA9PSAnb2JqZWN0JyB8fCB3aW5kb3cuc2lkZWJhcikge1xyXG4gICAgICAgIGEucmVsID0gJ3NpZGViYXInO1xyXG4gICAgICAgIGEudGl0bGUgPSB0aXRsZTtcclxuICAgICAgICBhLnVybCA9IHVybDtcclxuICAgICAgICBhLmhyZWYgPSB1cmw7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYWxlcnQoJ9Cd0LDQttC80LjRgtC1IEN0cmwtRCwg0YfRgtC+0LHRiyDQtNC+0LHQsNCy0LjRgtGMINGB0YLRgNCw0L3QuNGG0YMg0LIg0LfQsNC60LvQsNC00LrQuCcpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VuZF9wcm9tbyhwcm9tbyl7XHJcbiAgJC5hamF4KHtcclxuICAgIG1ldGhvZDogXCJwb3N0XCIsXHJcbiAgICB1cmw6IFwiL2FjY291bnQvcHJvbW9cIixcclxuICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICBkYXRhOiB7cHJvbW86IHByb21vfSxcclxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgaWYgKGRhdGEudGl0bGUgIT0gbnVsbCAmJiBkYXRhLm1lc3NhZ2UgIT0gbnVsbCkge1xyXG4gICAgICAgIG9uX3Byb21vPSQoJy5vbl9wcm9tbycpO1xyXG4gICAgICAgIGlmKG9uX3Byb21vLmxlbmd0aD09MCB8fCAhb25fcHJvbW8uaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgb25fcHJvbW8uc2hvdygpO1xyXG4gICAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuIiwiJCgnLnNjcm9sbF9ib3gtdGV4dCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcblxyXG4gICAkKHRoaXMpLmNsb3Nlc3QoJy5zY3JvbGxfYm94JykuZmluZCgnLnNjcm9sbF9ib3gtaXRlbScpLnJlbW92ZUNsYXNzKCdzY3JvbGxfYm94LWl0ZW0tbG93Jyk7XHJcblxyXG59KTsiLCJ2YXIgcGxhY2Vob2xkZXIgPSAoZnVuY3Rpb24oKXtcclxuICBmdW5jdGlvbiBvbkJsdXIoKXtcclxuICAgIHZhciBpbnB1dFZhbHVlID0gJCh0aGlzKS52YWwoKTtcclxuICAgIGlmICggaW5wdXRWYWx1ZSA9PSBcIlwiICkge1xyXG4gICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykucmVtb3ZlQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uRm9jdXMoKXtcclxuICAgICQodGhpcykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnZm9jdXNlZCcpO1xyXG4gIH1cclxuXHJcblxyXG4gIGZ1bmN0aW9uIHJ1bihwYXIpIHtcclxuICAgIHZhciBlbHM7XHJcbiAgICBpZighcGFyKVxyXG4gICAgICBlbHM9JCgnLmZvcm0tZ3JvdXAgW3BsYWNlaG9sZGVyXScpO1xyXG4gICAgZWxzZVxyXG4gICAgICBlbHM9JChwYXIpLmZpbmQoJy5mb3JtLWdyb3VwIFtwbGFjZWhvbGRlcl0nKTtcclxuXHJcbiAgICBlbHMuZm9jdXMob25Gb2N1cyk7XHJcbiAgICBlbHMuYmx1cihvbkJsdXIpO1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGk8ZWxzLmxlbmd0aDtpKyspe1xyXG4gICAgICB2YXIgZWw9ZWxzLmVxKGkpO1xyXG4gICAgICB2YXIgdGV4dCA9IGVsLmF0dHIoJ3BsYWNlaG9sZGVyJyk7XHJcbiAgICAgIGVsLmF0dHIoJ3BsYWNlaG9sZGVyJywnJyk7XHJcbiAgICAgIGlmKHRleHQubGVuZ3RoPDIpY29udGludWU7XHJcbiAgICAgIC8vaWYoZWwuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5sZW5ndGg9PTApcmV0dXJuO1xyXG5cclxuICAgICAgdmFyIGlucHV0VmFsdWUgPSBlbC52YWwoKTtcclxuICAgICAgdmFyIGVsX2lkID0gZWwuYXR0cignaWQnKTtcclxuICAgICAgaWYoIWVsX2lkKXtcclxuICAgICAgICBlbF9pZD0nZWxfZm9ybXNfJytNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkqMTAwMDApO1xyXG4gICAgICAgIGVsLmF0dHIoJ2lkJyxlbF9pZClcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYodGV4dC5pbmRleE9mKCd8Jyk+MCl7XHJcbiAgICAgICAgdGV4dD10ZXh0LnNwbGl0KCd8Jyk7XHJcbiAgICAgICAgdGV4dD10ZXh0WzBdK1wiPHNwYW4+XCIrdGV4dFsxXStcIjwvc3Bhbj5cIlxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZGl2ID0gJCgnPGxhYmVsLz4nLHtcclxuICAgICAgICAnY2xhc3MnOidwbGFjZWhvbGRlcicsXHJcbiAgICAgICAgJ2h0bWwnOiB0ZXh0LFxyXG4gICAgICAgICdmb3InOmVsX2lkXHJcbiAgICAgIH0pO1xyXG4gICAgICBlbC5iZWZvcmUoZGl2KTtcclxuXHJcbiAgICAgIG9uRm9jdXMuYmluZChlbCkoKVxyXG4gICAgICBvbkJsdXIuYmluZChlbCkoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcnVuKCk7XHJcbiAgcmV0dXJuIHJ1bjtcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFqYXhfbG9hZCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHZhciB1cmwgPSAkKHRoYXQpLmF0dHIoJ2hyZWYnKTtcclxuICAgICAgICB2YXIgdG9wID0gTWF0aC5tYXgoZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApO1xyXG4gICAgICAgIHZhciBzdG9yZXNTb3J0ID0gJCgnLmNhdGFsb2ctc3RvcmVzX3NvcnQnKTsvL9Cx0LvQvtC6INGB0L7RgNGC0LjRgNC+0LLQutC4INGN0LvQtdC80LXQvdGC0L7QslxyXG4gICAgICAgIHZhciB0YWJsZSA9ICQoJ3RhYmxlLnRhYmxlJyk7Ly/RgtCw0LHQu9C40YbQsCDQsiBhY2NvdW50XHJcbiAgICAgICAgLy9zY3JvbGwg0YLRg9C00LAg0LjQu9C4INGC0YPQtNCwXHJcbiAgICAgICAgdmFyIHNjcm9sbFRvcCA9IHN0b3Jlc1NvcnQubGVuZ3RoID8gJChzdG9yZXNTb3J0WzBdKS5vZmZzZXQoKS50b3AgLSAkKCcjaGVhZGVyPionKS5lcSgwKS5oZWlnaHQoKSAtIDUwIDogMDtcclxuICAgICAgICBpZiAoc2Nyb2xsVG9wID09PTAgJiYgdGFibGUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQodGFibGVbMF0pLm9mZnNldCgpLnRvcCAtICQoJyNoZWFkZXI+KicpLmVxKDApLmhlaWdodCgpIC0gNTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKHRoYXQpLmFkZENsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgJC5nZXQodXJsLCB7J2cnOidhamF4X2xvYWQnfSwgZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gJChkYXRhKS5maW5kKCcjY29udGVudC13cmFwJykuaHRtbCgpO1xyXG4gICAgICAgICAgICAkKCdib2R5JykuZmluZCgnI2NvbnRlbnQtd3JhcCcpLmh0bWwoY29udGVudCk7XHJcbiAgICAgICAgICAgIHNoYXJlNDIoKTsvL3Qg0L7RgtC+0LHRgNCw0LfQuNC70LjRgdGMINC60L3QvtC/0LrQuCDQn9C+0LTQtdC70LjRgtGM0YHRj1xyXG4gICAgICAgICAgICBzZFRvb2x0aXAuc2V0RXZlbnRzKCk7Ly/RgNCw0LHQvtGC0LDQu9C4INGC0YPQu9GC0LjQv9GLXHJcbiAgICAgICAgICAgIGJhbm5lci5yZWZyZXNoKCk7Ly/QvtCx0L3QvtCy0LjRgtGMINCx0LDQvdC90LXRgCDQvtGCINCz0YPQs9C7XHJcbiAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShcIm9iamVjdCBvciBzdHJpbmdcIiwgXCJUaXRsZVwiLCB1cmwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRvcCA+IHNjcm9sbFRvcCkge1xyXG4gICAgICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogc2Nyb2xsVG9wfSwgNTAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKHRoYXQpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe3R5cGU6J2VycicsICd0aXRsZSc6bGcoJ2Vycm9yJyksICdtZXNzYWdlJzpsZygnZXJyb3JfcXVlcnlpbmdfZGF0YScpfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcblxyXG59KSgpO1xyXG4iLCJiYW5uZXIgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICBmdW5jdGlvbiByZWZyZXNoKCl7XHJcbiAgICAgICAgZm9yKGk9MDtpPCQoJy5hZHNieWdvb2dsZScpLmxlbmd0aDtpKyspIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIChhZHNieWdvb2dsZSA9IHdpbmRvdy5hZHNieWdvb2dsZSB8fCBbXSkucHVzaCh7fSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge3JlZnJlc2g6IHJlZnJlc2h9XHJcbn0pKCk7IiwidmFyIGNvdW50cnlfc2VsZWN0ID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICAkKCcuaGVhZGVyLWNvdW50cmllc19kaWFsb2ctY2xvc2UnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBkaWFsb2dDbG9zZSh0aGlzKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5oZWFkZXItY291bnRyaWVzX2RpYWxvZy1kaWFsb2ctYnV0dG9uLWFwcGx5JykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcoRGF0ZSk7XHJcbiAgICAgICAgZGF0ZSA9IE1hdGgucm91bmQoZGF0ZS5nZXRUaW1lKCkvMTAwMCk7XHJcbiAgICAgICAgc2V0Q29va2llQWpheCgnX3NkX2NvdW50cnlfZGlhbG9nX2Nsb3NlJywgZGF0ZSwgNyk7XHJcbiAgICAgICAgZGlhbG9nQ2xvc2UodGhpcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLWNvdW50cmllc19kaWFsb2ctZGlhbG9nLWJ1dHRvbi1jaG9vc2UnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQutC70LDRgdGBLCDQuNC80LjRgtC40YDQvtCy0LDRgtGMIGhvdmVyXHJcbiAgICAgICAgJCgnI2hlYWRlci11cGxpbmUtcmVnaW9uLXNlbGVjdC1idXR0b24nKS5hZGRDbGFzcyhcIm9wZW5cIik7XHJcbiAgICAgICAgZGlhbG9nQ2xvc2UodGhpcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLXVwbGluZV9sYW5nLWxpc3QnKS5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGRpYWxvZ0Nsb3NlID0gZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICQoJy5oZWFkZXItdXBsaW5lX2xhbmctbGlzdCcpLnJlbW92ZUNsYXNzKCdpbmFjdGl2ZScpO1xyXG4gICAgICAgICQoZWxlbSkuY2xvc2VzdCgnLmhlYWRlci1jb3VudHJpZXNfZGlhbG9nJykuZmFkZU91dCgpO1xyXG4gICAgfTtcclxufSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcblxyXG5cclxuICAgIC8vIHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgIHZhciB0aW1lID0gKG5ldyBEYXRlKS5nZXRUaW1lKCkvMTAwMDtcclxuICAgIC8vICAgICB2YXIgdXNlcnMgPSAxMDAgKiBNYXRoLnNpbih0aW1lKSArIDIgKiBNYXRoLnNpbih0aW1lLzEwKzMpKiB0aW1lO1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKHVzZXJzKTtcclxuICAgIC8vIH0sIDE1MDApO1xyXG5cclxuXHJcblxyXG59KSgpOyIsInZhciBub3RpZmljYXRpb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gIHZhciBjb250ZWluZXI7XHJcbiAgdmFyIG1vdXNlT3ZlciA9IDA7XHJcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xyXG4gIHZhciBhbmltYXRpb25FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCc7XHJcbiAgdmFyIHRpbWUgPSAxMDAwMDtcclxuXHJcbiAgdmFyIG5vdGlmaWNhdGlvbl9ib3ggPSBmYWxzZTtcclxuICB2YXIgaXNfaW5pdCA9IGZhbHNlO1xyXG4gIHZhciBjb25maXJtX29wdCA9IHtcclxuICAgIC8vIHRpdGxlOiBsZygnZGVsZXRpbmcnKSxcclxuICAgIC8vIHF1ZXN0aW9uOiBsZygnYXJlX3lvdV9zdXJlX3RvX2RlbGV0ZScpLFxyXG4gICAgLy8gYnV0dG9uWWVzOiBsZygneWVzJyksXHJcbiAgICAvLyBidXR0b25ObzogbGcoJ25vJyksXHJcbiAgICBjYWxsYmFja1llczogZmFsc2UsXHJcbiAgICBjYWxsYmFja05vOiBmYWxzZSxcclxuICAgIG9iajogZmFsc2UsXHJcbiAgICBidXR0b25UYWc6ICdkaXYnLFxyXG4gICAgYnV0dG9uWWVzRG9wOiAnJyxcclxuICAgIGJ1dHRvbk5vRG9wOiAnJ1xyXG4gIH07XHJcbiAgdmFyIGFsZXJ0X29wdCA9IHtcclxuICAgIHRpdGxlOiBcIlwiLFxyXG4gICAgcXVlc3Rpb246ICdtZXNzYWdlJyxcclxuICAgIC8vIGJ1dHRvblllczogbGcoJ3llcycpLFxyXG4gICAgY2FsbGJhY2tZZXM6IGZhbHNlLFxyXG4gICAgYnV0dG9uVGFnOiAnZGl2JyxcclxuICAgIG9iajogZmFsc2VcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiB0ZXN0SXBob25lKCkge1xyXG4gICAgaWYgKCEvKGlQaG9uZXxpUGFkfGlQb2QpLiooT1MgMTEpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSByZXR1cm47XHJcbiAgICBub3RpZmljYXRpb25fYm94LmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guY3NzKCd0b3AnLCAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgaXNfaW5pdCA9IHRydWU7XHJcbiAgICBub3RpZmljYXRpb25fYm94ID0gJCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcclxuICAgIGlmIChub3RpZmljYXRpb25fYm94Lmxlbmd0aCA+IDApcmV0dXJuO1xyXG5cclxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XHJcbiAgICBub3RpZmljYXRpb25fYm94ID0gJCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcclxuXHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2NvbnRyb2wnLCBjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgJy5ub3RpZnlfY2xvc2UnLCBjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgY2xvc2VNb2RhbEZvbik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCkge1xyXG4gICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgJCgnLm5vdGlmaWNhdGlvbl9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbCgnJyk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpIHtcclxuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcbiAgICBpZiAodGFyZ2V0LmNsYXNzTmFtZSA9PSBcIm5vdGlmaWNhdGlvbl9ib3hcIikge1xyXG4gICAgICBjbG9zZU1vZGFsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB2YXIgX3NldFVwTGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubm90aWZpY2F0aW9uX2Nsb3NlJywgX2Nsb3NlUG9wdXApO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uTGVhdmUpO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25FbnRlciA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgaWYgKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAodGltZXJDbGVhckFsbCAhPSBudWxsKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lckNsZWFyQWxsKTtcclxuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICB2YXIgb3B0aW9uID0gJCh0aGlzKS5kYXRhKCdvcHRpb24nKTtcclxuICAgICAgaWYgKG9wdGlvbi50aW1lcikge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChvcHRpb24udGltZXIpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDE7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9vbkxlYXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcclxuICAgICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICB2YXIgb3B0aW9uID0gJHRoaXMuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmIChvcHRpb24udGltZSA+IDApIHtcclxuICAgICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQob3B0aW9uLmNsb3NlKSwgb3B0aW9uLnRpbWUgLSAxNTAwICsgMTAwICogaSk7XHJcbiAgICAgICAgJHRoaXMuZGF0YSgnb3B0aW9uJywgb3B0aW9uKVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDA7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9jbG9zZVBvcHVwID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICB9KTtcclxuICAgICR0aGlzLmFkZENsYXNzKCdub3RpZmljYXRpb25faGlkZScpXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcclxuICAgIGFsZXJ0X29wdCA9IG9iamVjdHMoYWxlcnRfb3B0LCB7XHJcbiAgICAgICAgYnV0dG9uWWVzOiBsZygneWVzJylcclxuICAgIH0pO1xyXG4gICAgZGF0YSA9IG9iamVjdHMoYWxlcnRfb3B0LCBkYXRhKTtcclxuXHJcbiAgICBpZiAoIWlzX2luaXQpaW5pdCgpO1xyXG4gICAgdGVzdElwaG9uZSgpO1xyXG5cclxuICAgIG5vdHlmeV9jbGFzcyA9ICdub3RpZnlfYm94ICc7XHJcbiAgICBpZiAoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzICs9IGRhdGEubm90eWZ5X2NsYXNzO1xyXG5cclxuICAgIGJveF9odG1sID0gJzxkaXYgY2xhc3M9XCInICsgbm90eWZ5X2NsYXNzICsgJ1wiPic7XHJcbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCArPSAnPGRpdj4nK2RhdGEudGl0bGUrJzwvZGl2Pic7XHJcbiAgICBib3hfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGlmIChkYXRhLmJ1dHRvblllcyB8fCBkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzwnICsgZGF0YS5idXR0b25UYWcgKyAnIGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIiAnICsgZGF0YS5idXR0b25ZZXNEb3AgKyAnPicgKyBkYXRhLmJ1dHRvblllcyArICc8LycgKyBkYXRhLmJ1dHRvblRhZyArICc+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnICsgZGF0YS5idXR0b25UYWcgKyAnIGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiICcgKyBkYXRhLmJ1dHRvbk5vRG9wICsgJz4nICsgZGF0YS5idXR0b25ObyArICc8LycgKyBkYXRhLmJ1dHRvblRhZyArICc+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xyXG5cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgfSwgMTAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xyXG4gICAgY29uZmlybV9vcHQgPSBvYmplY3RzKGNvbmZpcm1fb3B0LCB7XHJcbiAgICAgICAgdGl0bGU6IGxnKCdkZWxldGluZycpLFxyXG4gICAgICAgIHF1ZXN0aW9uOiBsZygnYXJlX3lvdV9zdXJlX3RvX2RlbGV0ZScpLFxyXG4gICAgICAgIGJ1dHRvblllczogbGcoJ3llcycpLFxyXG4gICAgICAgIGJ1dHRvbk5vOiBsZygnbm8nKVxyXG4gICAgfSk7XHJcbiAgICBkYXRhID0gb2JqZWN0cyhjb25maXJtX29wdCwgZGF0YSk7XHJcbiAgICBpZiAodHlwZW9mKGRhdGEuY2FsbGJhY2tZZXMpID09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHZhciBjb2RlID0gJ2RhdGEuY2FsbGJhY2tZZXMgPSBmdW5jdGlvbigpeycrZGF0YS5jYWxsYmFja1llcysnfSc7XHJcbiAgICAgIGV2YWwoY29kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc19pbml0KWluaXQoKTtcclxuICAgIHRlc3RJcGhvbmUoKTtcclxuICAgIC8vYm94X2h0bWw9JzxkaXYgY2xhc3M9XCJub3RpZnlfYm94XCI+JztcclxuXHJcbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xyXG4gICAgaWYgKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcyArPSBkYXRhLm5vdHlmeV9jbGFzcztcclxuXHJcbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xyXG5cclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sICs9IGRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGlmIChkYXRhLmJ1dHRvblllcyB8fCBkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xyXG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG4gICAgaWYgKGRhdGEuY2FsbGJhY2tZZXMgIT0gZmFsc2UpIHtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrWWVzLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuICAgIGlmIChkYXRhLmNhbGxiYWNrTm8gIT0gZmFsc2UpIHtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsIGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sIDEwMClcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcclxuICAgIHZhciBvcHRpb24gPSB7dGltZTogKGRhdGEudGltZSB8fCBkYXRhLnRpbWUgPT09IDApID8gZGF0YS50aW1lIDogdGltZX07XHJcbiAgICBpZiAoIWNvbnRlaW5lcikge1xyXG4gICAgICBjb250ZWluZXIgPSAkKCc8dWwvPicsIHtcclxuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XHJcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xyXG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9pdGVtJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSkge1xyXG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNsb3NlID0gJCgnPHNwYW4vPicsIHtcclxuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25fY2xvc2UnXHJcbiAgICB9KTtcclxuICAgIG9wdGlvbi5jbG9zZSA9IGNsb3NlO1xyXG4gICAgbGkuYXBwZW5kKGNsb3NlKTtcclxuXHJcbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciB0aXRsZSA9ICQoJzxoNS8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRleHQgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90ZXh0XCJcclxuICAgIH0pO1xyXG4gICAgdGV4dC5odG1sKGRhdGEubWVzc2FnZSk7XHJcblxyXG4gICAgaWYgKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcclxuICAgICAgfSk7XHJcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XHJcbiAgICAgIHZhciB3cmFwID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIndyYXBcIlxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHdyYXAuYXBwZW5kKGltZyk7XHJcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh3cmFwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRleHQpO1xyXG4gICAgfVxyXG4gICAgbGkuYXBwZW5kKGNvbnRlbnQpO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcclxuICAgIC8vICAgdmFyIHRpdGxlID0gJCgnPHAvPicsIHtcclxuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxyXG4gICAgLy8gICB9KTtcclxuICAgIC8vICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcclxuICAgIC8vICAgbGkuYXBwZW5kKHRpdGxlKTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xyXG4gICAgLy8gICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xyXG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxyXG4gICAgLy8gICB9KTtcclxuICAgIC8vICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XHJcbiAgICAvLyAgIGxpLmFwcGVuZChpbWcpO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuICAgIC8vIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XHJcbiAgICAvLyAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxyXG4gICAgLy8gfSk7XHJcbiAgICAvLyBjb250ZW50Lmh0bWwoZGF0YS5tZXNzYWdlKTtcclxuICAgIC8vXHJcbiAgICAvLyBsaS5hcHBlbmQoY29udGVudCk7XHJcbiAgICAvL1xyXG4gICAgY29udGVpbmVyLmFwcGVuZChsaSk7XHJcblxyXG4gICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xyXG4gICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQoY2xvc2UpLCBvcHRpb24udGltZSk7XHJcbiAgICB9XHJcbiAgICBsaS5kYXRhKCdvcHRpb24nLCBvcHRpb24pXHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYWxlcnQ6IGFsZXJ0LFxyXG4gICAgY29uZmlybTogY29uZmlybSxcclxuICAgIG5vdGlmaTogbm90aWZpXHJcbiAgfTtcclxuXHJcbn0pKCk7XHJcblxyXG5cclxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XHJcbiAgZGF0YSA9IGVsLmRhdGEoKTtcclxuXHJcbiAgZGF0YS5xdWVzdGlvbiA9IGVsLmh0bWwoKTtcclxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcbn0pO1xyXG5cclxuJCgnW3JlZj1jb25maXJtXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBlbCA9ICQoJHRoaXMuYXR0cignaHJlZicpKTtcclxuICBkYXRhID0gZWwuZGF0YSgpO1xyXG4gIGRhdGEucXVlc3Rpb24gPSBlbC5odG1sKCk7XHJcbiAgbm90aWZpY2F0aW9uLmNvbmZpcm0oZGF0YSk7XHJcbn0pO1xyXG5cclxuXHJcbiQoJy5kaXNhYmxlZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBkYXRhID0gJHRoaXMuZGF0YSgpO1xyXG4gIGlmIChkYXRhWydidXR0b25feWVzJ10pIHtcclxuICAgIGRhdGFbJ2J1dHRvblllcyddID0gZGF0YVsnYnV0dG9uX3llcyddO1xyXG4gIH1cclxuICBpZiAoZGF0YVsnYnV0dG9uX3llcyddID09PSBmYWxzZSkge1xyXG4gICAgZGF0YVsnYnV0dG9uWWVzJ10gPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tb2RhbHNfb3BlbicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcblxyXG4gICAgLy/Qv9GA0Lgg0L7RgtC60YDRi9GC0LjQuCDRhNC+0YDQvNGLINGA0LXQs9C40YHRgtGA0LDRhtC40Lgg0LfQsNC60YDRi9GC0YwsINC10YHQu9C4INC+0YLRgNGL0YLQviAtINC/0L7Qv9Cw0L8g0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40Y8g0LrRg9C/0L7QvdCwINCx0LXQtyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4XHJcbiAgICB2YXIgcG9wdXAgPSAkKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikuZGF0YSgncG9wdXAnKTtcclxuICAgIGlmIChwb3B1cCkge1xyXG4gICAgICBwb3B1cC5jbG9zZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcG9wdXAgPSAkKCdkaXYucG9wdXBfY29udCwgZGl2LnBvcHVwX2JhY2snKTtcclxuICAgICAgaWYgKHBvcHVwKSB7XHJcbiAgICAgICAgcG9wdXAuaGlkZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhyZWYgPSB0aGlzLmhyZWYuc3BsaXQoJyMnKTtcclxuICAgIGhyZWYgPSBocmVmW2hyZWYubGVuZ3RoIC0gMV07XHJcbiAgICB2YXIgbm90eUNsYXNzID0gJCh0aGlzKS5kYXRhKCdub3R5Y2xhc3MnKTtcclxuICAgIHZhciBjbGFzc19uYW1lPShocmVmLmluZGV4T2YoJ3ZpZGVvJykgPT09IDAgPyAnbW9kYWxzLWZ1bGxfc2NyZWVuJyA6ICdub3RpZnlfd2hpdGUnKSArICcgJyArIG5vdHlDbGFzcztcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxyXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibG9hZGluZyBcIiArIGNsYXNzX25hbWUsXHJcbiAgICAgIHF1ZXN0aW9uOiAnJ1xyXG4gICAgfTtcclxuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuXHJcbiAgICAkLmdldCgnLycgKyBocmVmLCBmdW5jdGlvbiAoZGF0YSkge1xyXG5cclxuICAgICAgdmFyIGRhdGFfbXNnID0ge1xyXG4gICAgICAgIGJ1dHRvblllczogZmFsc2UsXHJcbiAgICAgICAgbm90eWZ5X2NsYXNzOiBjbGFzc19uYW1lLFxyXG4gICAgICAgIHF1ZXN0aW9uOiBkYXRhLmh0bWwsXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpZiAoZGF0YS50aXRsZSkge1xyXG4gICAgICAgIGRhdGFfbXNnWyd0aXRsZSddPWRhdGEudGl0bGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qaWYoZGF0YS5idXR0b25ZZXMpe1xyXG4gICAgICAgIGRhdGFfbXNnWydidXR0b25ZZXMnXT1kYXRhLmJ1dHRvblllcztcclxuICAgICAgfSovXHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhX21zZyk7XHJcbiAgICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcclxuICAgIH0sICdqc29uJyk7XHJcblxyXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuXHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcubW9kYWxzX3BvcHVwJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIC8v0L/RgNC4INC60LvQuNC60LUg0LLRgdC/0LvRi9Cy0LDRiNC60LAg0YEg0YLQtdC60YHRgtC+0LxcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciB0aXRsZSA9ICQodGhhdCkuZGF0YSgnb3JpZ2luYWwtaCcpO1xyXG4gICAgaWYoIXRpdGxlKXRpdGxlPVwiXCI7XHJcbiAgICB2YXIgaHRtbCA9ICQoJyMnICsgJCh0aGF0KS5kYXRhKCdvcmlnaW5hbC1odG1sJykpLmh0bWwoKTtcclxuICAgIHZhciBjb250ZW50ID0gaHRtbCA/IGh0bWwgOiAkKHRoYXQpLmRhdGEoJ29yaWdpbmFsLXRpdGxlJyk7XHJcbiAgICB2YXIgbm90eUNsYXNzID0gJCh0aGF0KS5kYXRhKCdub3R5Y2xhc3MnKTtcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxyXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibm90aWZ5X3doaXRlIFwiICsgbm90eUNsYXNzLFxyXG4gICAgICBxdWVzdGlvbjogY29udGVudCxcclxuICAgICAgdGl0bGU6IHRpdGxlXHJcbiAgICB9O1xyXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KVxyXG59KCkpO1xyXG4iLCIkKCcuZm9vdGVyLW1lbnUtdGl0bGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKSkge1xyXG4gICAgJHRoaXMucmVtb3ZlQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKVxyXG4gIH0gZWxzZSB7XHJcbiAgICAkKCcuZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpO1xyXG4gIH1cclxuXHJcbn0pO1xyXG4iLCIkKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBzdGFyTm9taW5hdGlvbihpbmRleCkge1xyXG4gICAgdmFyIHN0YXJzID0gJChcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIik7XHJcbiAgICBzdGFycy5hZGRDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcclxuICAgICAgc3RhcnMuZXEoaSkucmVtb3ZlQ2xhc3MoXCJyYXRpbmctc3Rhci1vcGVuXCIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJChkb2N1bWVudCkub24oXCJtb3VzZW92ZXJcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuICB9KS5vbihcIm1vdXNlbGVhdmVcIiwgXCIucmF0aW5nLXdyYXBwZXJcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIHN0YXJOb21pbmF0aW9uKCQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCkpO1xyXG4gIH0pLm9uKFwiY2xpY2tcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuXHJcbiAgICAkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuICB9KTtcclxufSk7XHJcbiIsIi8v0LjQt9Cx0YDQsNC90L3QvtC1XHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAkKFwiLmZhdm9yaXRlLWxpbmtcIikub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICB2YXIgc2VsZiA9ICQodGhpcyk7XHJcbiAgICB2YXIgdHlwZSA9IHNlbGYuZGF0YShcInN0YXRlXCIpLFxyXG4gICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmRhdGEoXCJhZmZpbGlhdGUtaWRcIiksXHJcbiAgICAgIHByb2R1Y3RfaWQgPSBzZWxmLmRhdGEoXCJwcm9kdWN0LWlkXCIpO1xyXG5cclxuICAgIGlmICghYWZmaWxpYXRlX2lkKSB7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgIHRpdGxlOiBsZyhcInJlZ2lzdHJhdGlvbl9pc19yZXF1aXJlZFwiKSxcclxuICAgICAgICBtZXNzYWdlOiBsZyhcImFkZF90b19mYXZvcml0ZV9tYXlfb25seV9yZWdpc3RlcmVkX3VzZXJcIiksXHJcbiAgICAgICAgdHlwZTogJ2VycidcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlbGYuaGFzQ2xhc3MoJ2Rpc2FibGVkJykpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBzZWxmLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgIC8qaWYodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgc2VsZi5maW5kKFwiLml0ZW1faWNvblwiKS5yZW1vdmVDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgIH0qL1xyXG5cclxuICAgICQucG9zdChcIi9hY2NvdW50L2Zhdm9yaXRlc1wiLCB7XHJcbiAgICAgIFwidHlwZVwiOiB0eXBlLFxyXG4gICAgICBcImFmZmlsaWF0ZV9pZFwiOiBhZmZpbGlhdGVfaWQsXHJcbiAgICAgIFwicHJvZHVjdF9pZFwiOiBwcm9kdWN0X2lkXHJcbiAgICB9LCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICBpZiAoZGF0YS5lcnJvcikge1xyXG4gICAgICAgIHNlbGYuZmluZCgnc3ZnJykucmVtb3ZlQ2xhc3MoXCJzcGluXCIpO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6IGRhdGEuZXJyb3IsIHR5cGU6ICdlcnInLCAndGl0bGUnOiAoZGF0YS50aXRsZSA/IGRhdGEudGl0bGUgOiBmYWxzZSl9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgIG1lc3NhZ2U6IGRhdGEubXNnLFxyXG4gICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAndGl0bGUnOiAoZGF0YS50aXRsZSA/IGRhdGEudGl0bGUgOiBmYWxzZSlcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBzZWxmLmRhdGEoXCJzdGF0ZVwiLCBkYXRhW1wiZGF0YS1zdGF0ZVwiXSk7XHJcbiAgICAgIHNlbGYuZGF0YShcIm9yaWdpbmFsLXRpdGxlXCIsIGRhdGFbXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCJdKTtcclxuICAgICAgc2VsZi5maW5kKCcudGl0bGUnKS5odG1sKGRhdGFbXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCJdKTtcclxuXHJcbiAgICAgIGlmICh0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluIGluX2Zhdl9vZmZcIikuYWRkQ2xhc3MoXCJpbl9mYXZfb25cIik7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRlbGV0ZVwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb25cIikuYWRkQ2xhc3MoXCJpbl9mYXZfb2ZmXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSwgJ2pzb24nKS5mYWlsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgbWVzc2FnZTogbGcoXCJ0aGVyZV9pc190ZWNobmljYWxfd29ya3Nfbm93XCIpLFxyXG4gICAgICAgIHR5cGU6ICdlcnInXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gaW5fZmF2X29mZlwiKS5hZGRDbGFzcyhcImluX2Zhdl9vblwiKTtcclxuICAgICAgICBzZWxmLmRhdGEoJ29yaWdpbmFsLXRpdGxlJywgbGcoXCJmYXZvcml0ZXNfc2hvcF9yZW1vdmVcIisocHJvZHVjdF9pZCA/ICdfcHJvZHVjdCcgOiAnJykpKTtcclxuICAgICAgICBzZWxmLmZpbmQoJy50aXRsZScpLmh0bWwobGcoXCJmYXZvcml0ZXNfc2hvcF9yZW1vdmVcIisocHJvZHVjdF9pZCA/ICdfcHJvZHVjdCcgOiAnJykpKTtcclxuICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiZGVsZXRlXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluIGluX2Zhdl9vblwiKS5hZGRDbGFzcyhcImluX2Zhdl9vZmZcIik7XHJcbiAgICAgICAgc2VsZi5kYXRhKCdvcmlnaW5hbC10aXRsZScsIGxnKFwiZmF2b3JpdGVzX3Nob3BfYWRkXCIrKHByb2R1Y3RfaWQgPyAnX3Byb2R1Y3QnIDogJycpKSk7XHJcbiAgICAgICAgc2VsZi5maW5kKCcudGl0bGUnKS5odG1sKGxnKFwiZmF2b3JpdGVzX3Nob3BfYWRkXCIrKHByb2R1Y3RfaWQgPyAnX3Byb2R1Y3QnIDogJycpKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9KVxyXG4gIH0pO1xyXG59KTtcclxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5zY3JvbGxfdG8nKS5jbGljayhmdW5jdGlvbiAoZSkgeyAvLyDQu9C+0LLQuNC8INC60LvQuNC6INC/0L4g0YHRgdGL0LvQutC1INGBINC60LvQsNGB0YHQvtC8IGdvX3RvXHJcbiAgICB2YXIgc2Nyb2xsX2VsID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7IC8vINCy0L7Qt9GM0LzQtdC8INGB0L7QtNC10YDQttC40LzQvtC1INCw0YLRgNC40LHRg9GC0LAgaHJlZiwg0LTQvtC70LbQtdC9INCx0YvRgtGMINGB0LXQu9C10LrRgtC+0YDQvtC8LCDRgi7QtS4g0L3QsNC/0YDQuNC80LXRgCDQvdCw0YfQuNC90LDRgtGM0YHRjyDRgSAjINC40LvQuCAuXHJcbiAgICBzY3JvbGxfZWwgPSAkKHNjcm9sbF9lbCk7XHJcbiAgICBpZiAoc2Nyb2xsX2VsLmxlbmd0aCAhPSAwKSB7IC8vINC/0YDQvtCy0LXRgNC40Lwg0YHRg9GJ0LXRgdGC0LLQvtCy0LDQvdC40LUg0Y3Qu9C10LzQtdC90YLQsCDRh9GC0L7QsdGLINC40LfQsdC10LbQsNGC0Ywg0L7RiNC40LHQutC4XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogc2Nyb2xsX2VsLm9mZnNldCgpLnRvcCAtICQoJyNoZWFkZXI+KicpLmVxKDApLmhlaWdodCgpIC0gNTB9LCA1MDApOyAvLyDQsNC90LjQvNC40YDRg9C10Lwg0YHQutGA0L7QvtC70LjQvdCzINC6INGN0LvQtdC80LXQvdGC0YMgc2Nyb2xsX2VsXHJcbiAgICAgIGlmIChzY3JvbGxfZWwuaGFzQ2xhc3MoJ2FjY29yZGlvbicpICYmICFzY3JvbGxfZWwuaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAgIHNjcm9sbF9lbC5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wnKS5jbGljaygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7IC8vINCy0YvQutC70Y7Rh9Cw0LXQvCDRgdGC0LDQvdC00LDRgNGC0L3QvtC1INC00LXQudGB0YLQstC40LVcclxuICB9KTtcclxufSk7XHJcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAkKFwiYm9keVwiKS5vbignY2xpY2snLCAnLnNldF9jbGlwYm9hcmQnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgIGNvcHlUb0NsaXBib2FyZCgkdGhpcy5kYXRhKCdjbGlwYm9hcmQnKSwgJHRoaXMuZGF0YSgnY2xpcGJvYXJkLW5vdGlmeScpKTtcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gY29weVRvQ2xpcGJvYXJkKGNvZGUsIG1zZykge1xyXG4gICAgdmFyICR0ZW1wID0gJChcIjxpbnB1dD5cIik7XHJcbiAgICAkKFwiYm9keVwiKS5hcHBlbmQoJHRlbXApO1xyXG4gICAgJHRlbXAudmFsKGNvZGUpLnNlbGVjdCgpO1xyXG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJjb3B5XCIpO1xyXG4gICAgJHRlbXAucmVtb3ZlKCk7XHJcblxyXG4gICAgaWYgKCFtc2cpIHtcclxuICAgICAgbXNnID0gbGcoXCJkYXRhX2NvcGllZF90b19jbGlwYm9hcmRcIik7XHJcbiAgICB9XHJcbiAgICBub3RpZmljYXRpb24ubm90aWZpKHsndHlwZSc6ICdpbmZvJywgJ21lc3NhZ2UnOiBtc2csICd0aXRsZSc6IGxnKCdzdWNjZXNzJyl9KVxyXG4gIH1cclxuXHJcbiAgJChcImJvZHlcIikub24oJ2NsaWNrJywgXCJpbnB1dC5saW5rXCIsIGZ1bmN0aW9uICgpIHtcdC8vINC/0L7Qu9GD0YfQtdC90LjQtSDRhNC+0LrRg9GB0LAg0YLQtdC60YHRgtC+0LLRi9C8INC/0L7Qu9C10Lwt0YHRgdGL0LvQutC+0LlcclxuICAgICQodGhpcykuc2VsZWN0KCk7XHJcbiAgfSk7XHJcbn0pO1xyXG4iLCIvL9GB0LrQsNGH0LjQstCw0L3QuNC1INC60LDRgNGC0LjQvdC+0LpcclxuKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKSB7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICB2YXIgaW1nID0gZGF0YS5pbWc7XHJcbiAgICBpbWcud3JhcCgnPGRpdiBjbGFzcz1cImRvd25sb2FkXCI+PC9kaXY+Jyk7XHJcbiAgICB2YXIgd3JhcCA9IGltZy5wYXJlbnQoKTtcclxuICAgICQoJy5kb3dubG9hZF90ZXN0JykuYXBwZW5kKGRhdGEuZWwpO1xyXG4gICAgc2l6ZSA9IGRhdGEuZWwud2lkdGgoKSArIFwieFwiICsgZGF0YS5lbC5oZWlnaHQoKTtcclxuXHJcbiAgICB3PWRhdGEuZWwud2lkdGgoKSowLjg7XHJcbiAgICBpbWdcclxuICAgICAgLmhlaWdodCgnYXV0bycpXHJcbiAgICAgIC8vLndpZHRoKHcpXHJcbiAgICAgIC5jc3MoJ21heC13aWR0aCcsJzk5JScpO1xyXG5cclxuXHJcbiAgICBkYXRhLmVsLnJlbW92ZSgpO1xyXG4gICAgd3JhcC5hcHBlbmQoJzxzcGFuPicgKyBzaXplICsgJzwvc3Bhbj4gPGEgaHJlZj1cIicgKyBkYXRhLnNyYyArICdcIiBkb3dubG9hZD4nK2xnKFwiZG93bmxvYWRcIikrJzwvYT4nKTtcclxuICB9XHJcblxyXG4gIHZhciBpbWdzID0gJCgnLmRvd25sb2Fkc19pbWcgaW1nJyk7XHJcbiAgaWYoaW1ncy5sZW5ndGg9PTApcmV0dXJuO1xyXG5cclxuICAkKCdib2R5JykuYXBwZW5kKCc8ZGl2IGNsYXNzPWRvd25sb2FkX3Rlc3Q+PC9kaXY+Jyk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgaW1nID0gaW1ncy5lcShpKTtcclxuICAgIHZhciBzcmMgPSBpbWcuYXR0cignc3JjJyk7XHJcbiAgICBpbWFnZSA9ICQoJzxpbWcvPicsIHtcclxuICAgICAgc3JjOiBzcmNcclxuICAgIH0pO1xyXG4gICAgZGF0YSA9IHtcclxuICAgICAgc3JjOiBzcmMsXHJcbiAgICAgIGltZzogaW1nLFxyXG4gICAgICBlbDogaW1hZ2VcclxuICAgIH07XHJcbiAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxyXG4gIH1cclxufSkoKTtcclxuXHJcbi8v0YfRgtC+INCxINC40YTRgNC10LnQvNGLINC4INC60LDRgNGC0LjQvdC60Lgg0L3QtSDQstGL0LvQsNC30LjQu9C4XHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgLyptX3cgPSAkKCcudGV4dC1jb250ZW50Jykud2lkdGgoKVxyXG4gICBpZiAobV93IDwgNTApbV93ID0gc2NyZWVuLndpZHRoIC0gNDAqL1xyXG4gIHZhciBtdz1zY3JlZW4ud2lkdGgtNDA7XHJcblxyXG4gIGZ1bmN0aW9uIG9wdGltYXNlKGVsKXtcclxuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnQoKTtcclxuICAgIGlmKHBhcmVudC5sZW5ndGg9PTAgfHwgcGFyZW50WzBdLnRhZ05hbWU9PVwiQVwiKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYoZWwuaGFzQ2xhc3MoJ25vX29wdG9taXplJykpcmV0dXJuO1xyXG5cclxuICAgIG1fdyA9IHBhcmVudC53aWR0aCgpLTMwO1xyXG4gICAgdmFyIHc9ZWwud2lkdGgoKTtcclxuXHJcbiAgICAvL9Cx0LXQtyDRjdGC0L7Qs9C+INC/0LvRjtGJ0LjRgiDQsdCw0L3QtdGA0Ysg0LIg0LDQutCw0YDQtNC40L7QvdC1XHJcbiAgICBpZih3PDMgfHwgbV93PDMpe1xyXG4gICAgICBlbFxyXG4gICAgICAgIC5oZWlnaHQoJ2F1dG8nKVxyXG4gICAgICAgIC5jc3MoJ21heC13aWR0aCcsJzk5JScpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZWwud2lkdGgoJ2F1dG8nKTtcclxuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSU1HXCIgJiYgdz5lbC53aWR0aCgpKXc9ZWwud2lkdGgoKTtcclxuXHJcbiAgICBpZiAobXc+NTAgJiYgbV93ID4gbXcpbV93ID0gbXc7XHJcbiAgICBpZiAodz5tX3cpIHtcclxuICAgICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIil7XHJcbiAgICAgICAgayA9IHcgLyBtX3c7XHJcbiAgICAgICAgZWwuaGVpZ2h0KGVsLmhlaWdodCgpIC8gayk7XHJcbiAgICAgIH1cclxuICAgICAgZWwud2lkdGgobV93KVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGVsLndpZHRoKHcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICB2YXIgZWw9JCh0aGlzKTtcclxuICAgIG9wdGltYXNlKGVsKTtcclxuICB9XHJcblxyXG4gIHZhciBwID0gJCgnLmNvbnRlbnQtd3JhcCBpbWcsLmNvbnRlbnQtd3JhcCBpZnJhbWUnKTtcclxuICAkKCcuY29udGVudC13cmFwIGltZzpub3QoLm5vX29wdG9taXplKScpLmhlaWdodCgnYXV0bycpO1xyXG4gIC8vJCgnLmNvbnRhaW5lciBpbWcnKS53aWR0aCgnYXV0bycpO1xyXG4gIGZvciAoaSA9IDA7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBlbCA9IHAuZXEoaSk7XHJcbiAgICBpZihlbFswXS50YWdOYW1lPT1cIklGUkFNRVwiKSB7XHJcbiAgICAgIG9wdGltYXNlKGVsKTtcclxuICAgIH1lbHNle1xyXG4gICAgICB2YXIgc3JjPWVsLmF0dHIoJ3NyYycpO1xyXG4gICAgICBpbWFnZSA9ICQoJzxpbWcvPicsIHtcclxuICAgICAgICBzcmM6IHNyY1xyXG4gICAgICB9KTtcclxuICAgICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChlbCkpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG5cclxuLy/Qn9GA0L7QstC10YDQutCwINCx0LjRgtGLINC60LDRgNGC0LjQvdC+0LouXHJcbi8vICEhISEhIVxyXG4vLyDQndGD0LbQvdC+INC/0YDQvtCy0LXRgNC40YLRjC4g0JLRi9C30YvQstCw0LvQviDQs9C70Y7QutC4INC/0YDQuCDQsNCy0YLQvtGA0LfQsNGG0LjQuCDRh9C10YDQtdC3INCk0JEg0L3QsCDRgdCw0YTQsNGA0LhcclxuLy8gISEhISEhXHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgaWYoZGF0YS50YWdOYW1lKXtcclxuICAgICAgZGF0YT0kKGRhdGEpLmRhdGEoJ2RhdGEnKTtcclxuICAgIH1cclxuICAgIHZhciBpbWc9ZGF0YS5pbWc7XHJcbiAgICAvL3ZhciB0bj1pbWdbMF0udGFnTmFtZTtcclxuICAgIC8vaWYgKHRuIT0nSU1HJ3x8dG4hPSdESVYnfHx0biE9J1NQQU4nKXJldHVybjtcclxuICAgIGlmKGRhdGEudHlwZT09MCkge1xyXG4gICAgICBpbWcuYXR0cignc3JjJywgZGF0YS5zcmMpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcrZGF0YS5zcmMrJyknKTtcclxuICAgICAgaW1nLnJlbW92ZUNsYXNzKCdub19hdmEnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHRlc3RJbWcoaW1ncywgbm9faW1nKXtcclxuICAgIGlmKCFpbWdzIHx8IGltZ3MubGVuZ3RoPT0wKXJldHVybjtcclxuXHJcbiAgICBpZighbm9faW1nKW5vX2ltZz0nL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZyc7XHJcblxyXG4gICAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcclxuICAgICAgdmFyIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgICBpZihpbWcuaGFzQ2xhc3MoJ25vX2F2YScpKXtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGRhdGE9e1xyXG4gICAgICAgIGltZzppbWdcclxuICAgICAgfTtcclxuICAgICAgdmFyIHNyYztcclxuICAgICAgaWYoaW1nWzBdLnRhZ05hbWU9PVwiSU1HXCIpe1xyXG4gICAgICAgIGRhdGEudHlwZT0wO1xyXG4gICAgICAgIHNyYz1pbWcuYXR0cignc3JjJyk7XHJcbiAgICAgICAgaW1nLmF0dHIoJ3NyYycsbm9faW1nKTtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgZGF0YS50eXBlPTE7XHJcbiAgICAgICAgc3JjPWltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKTtcclxuICAgICAgICBpZighc3JjKWNvbnRpbnVlO1xyXG4gICAgICAgIHNyYz1zcmMucmVwbGFjZSgndXJsKFwiJywnJyk7XHJcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCdcIiknLCcnKTtcclxuICAgICAgICAvL9CyINGB0YTRhNCw0YDQuCDQsiDQvNCw0Log0L7RgSDQsdC10Lcg0LrQvtCy0YvRh9C10LouINCy0LXQt9C00LUg0YEg0LrQsNCy0YvRh9C60LDQvNC4XHJcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCd1cmwoJywnJyk7XHJcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCcpJywnJyk7XHJcbiAgICAgICAgaW1nLmFkZENsYXNzKCdub19hdmEnKTtcclxuICAgICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrbm9faW1nKycpJyk7XHJcbiAgICAgIH1cclxuICAgICAgZGF0YS5zcmM9c3JjO1xyXG4gICAgICB2YXIgaW1hZ2U9JCgnPGltZy8+Jyx7XHJcbiAgICAgICAgc3JjOnNyY1xyXG4gICAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpO1xyXG4gICAgICBpbWFnZS5kYXRhKCdkYXRhJyxkYXRhKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8v0YLQtdGB0YIg0LvQvtCz0L4g0LzQsNCz0LDQt9C40L3QsFxyXG4gIHZhciBpbWdzPSQoJ3NlY3Rpb246bm90KC5uYXZpZ2F0aW9uKScpO1xyXG4gIGltZ3M9aW1ncy5maW5kKCcubG9nbyBpbWcnKTtcclxuICB0ZXN0SW1nKGltZ3MsJy9pbWFnZXMvdGVtcGxhdGUtbG9nby5qcGcnKTtcclxuXHJcbiAgLy/RgtC10YHRgiDQsNCy0LDRgtCw0YDQvtC6INCyINC60L7QvNC10L3RgtCw0YDQuNGP0YVcclxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvLC5zY3JvbGxfYm94LWF2YXRhcicpO1xyXG4gIHRlc3RJbWcoaW1ncywnL2ltYWdlcy9ub19hdmFfc3F1YXJlLnBuZycpO1xyXG5cclxuICAvL9GC0LXRgdGCINC60LDRgNGC0LjQvdC+0Log0L/RgNC+0LTRg9C60YLQvtCyXHJcbiAgaW1ncyA9ICQoJy5jYXRhbG9nX3Byb2R1Y3RzX2l0ZW1faW1hZ2Utd3JhcCBpbWcnKTtcclxuICB0ZXN0SW1nKGltZ3MpO1xyXG5cclxufSk7XHJcbiIsIi8v0LXRgdC70Lgg0L7RgtC60YDRi9GC0L4g0LrQsNC6INC00L7Rh9C10YDQvdC10LVcclxuKGZ1bmN0aW9uICgpIHtcclxuICBpZiAoIXdpbmRvdy5vcGVuZXIpcmV0dXJuO1xyXG4gIHRyeSB7XHJcbiAgICBocmVmID0gd2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmO1xyXG4gICAgaWYgKFxyXG4gICAgICBocmVmLmluZGV4T2YoJ2FjY291bnQvb2ZmbGluZScpID4gMFxyXG4gICAgKSB7XHJcbiAgICAgIHdpbmRvdy5wcmludCgpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRvY3VtZW50LnJlZmVycmVyLmluZGV4T2YoJ3NlY3JldGRpc2NvdW50ZXInKSA8IDApcmV0dXJuO1xyXG5cclxuICAgIGlmIChcclxuICAgICAgaHJlZi5pbmRleE9mKCdzb2NpYWxzJykgPiAwIHx8XHJcbiAgICAgIGhyZWYuaW5kZXhPZignbG9naW4nKSA+IDAgfHxcclxuICAgICAgaHJlZi5pbmRleE9mKCdhZG1pbicpID4gMCB8fFxyXG4gICAgICBocmVmLmluZGV4T2YoJ2FjY291bnQnKSA+IDBcclxuICAgICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGhyZWYuaW5kZXhPZignc3RvcmUnKSA+IDAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKSA+IDAgfHwgaHJlZi5pbmRleE9mKCdzZXR0aW5ncycpID4gMCkge1xyXG4gICAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmID0gbG9jYXRpb24uaHJlZjtcclxuICAgIH1cclxuICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG5cclxuICB9XHJcbn0pKCk7XHJcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAkKCdpbnB1dFt0eXBlPWZpbGVdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChldnQpIHtcclxuICAgIHZhciBmaWxlID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XHJcbiAgICB2YXIgZiA9IGZpbGVbMF07XHJcbiAgICAvLyBPbmx5IHByb2Nlc3MgaW1hZ2UgZmlsZXMuXHJcbiAgICBpZiAoIWYudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICAgIGRhdGEgPSB7XHJcbiAgICAgICdlbCc6IHRoaXMsXHJcbiAgICAgICdmJzogZlxyXG4gICAgfTtcclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaW1nID0gJCgnW2Zvcj1cIicgKyBkYXRhLmVsLm5hbWUgKyAnXCJdJyk7XHJcbiAgICAgICAgaWYgKGltZy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBpbWcuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH0pKGRhdGEpO1xyXG4gICAgLy8gUmVhZCBpbiB0aGUgaW1hZ2UgZmlsZSBhcyBhIGRhdGEgVVJMLlxyXG4gICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZik7XHJcbiAgfSk7XHJcblxyXG4gICQoJy5kdWJsaWNhdGVfdmFsdWUnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgIHZhciBzZWwgPSAkKCR0aGlzLmRhdGEoJ3NlbGVjdG9yJykpO1xyXG4gICAgc2VsLnZhbCh0aGlzLnZhbHVlKTtcclxuICB9KVxyXG59KTtcclxuIiwiXHJcbmZ1bmN0aW9uIGdldENvb2tpZShuKSB7XHJcbiAgcmV0dXJuIHVuZXNjYXBlKChSZWdFeHAobiArICc9KFteO10rKScpLmV4ZWMoZG9jdW1lbnQuY29va2llKSB8fCBbMSwgJyddKVsxXSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldENvb2tpZShuYW1lLCB2YWx1ZSwgZGF5cykge1xyXG4gIHZhciBleHBpcmVzID0gJyc7XHJcbiAgaWYgKGRheXMpIHtcclxuICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZTtcclxuICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgZGF5cyk7XHJcbiAgICAgIGV4cGlyZXMgPSAnOyBleHBpcmVzPScgKyBkYXRlLnRvVVRDU3RyaW5nKCk7XHJcbiAgfVxyXG4gIGRvY3VtZW50LmNvb2tpZSA9IG5hbWUgKyBcIj1cIiArIGVzY2FwZSAoIHZhbHVlICkgKyBleHBpcmVzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBlcmFzZUNvb2tpZShuYW1lKXtcclxuICB2YXIgY29va2llX3N0cmluZyA9IG5hbWUgKyBcIj0wXCIgK1wiOyBleHBpcmVzPVdlZCwgMDEgT2N0IDIwMTcgMDA6MDA6MDAgR01UXCI7XHJcbiAgZG9jdW1lbnQuY29va2llID0gY29va2llX3N0cmluZztcclxufVxyXG5cclxuZG9jdW1lbnQuY29va2llLnNwbGl0KFwiO1wiKS5mb3JFYWNoKGZ1bmN0aW9uKGMpIHsgZG9jdW1lbnQuY29va2llID0gYy5yZXBsYWNlKC9eICsvLCBcIlwiKS5yZXBsYWNlKC89LiovLCBcIj07ZXhwaXJlcz1cIiArIG5ldyBEYXRlKCkudG9VVENTdHJpbmcoKSArIFwiO3BhdGg9L1wiKTsgfSk7XHJcblxyXG5cclxuZnVuY3Rpb24gc2V0Q29va2llQWpheChuYW1lLCB2YWx1ZSwgZGF5cykge1xyXG4gICAgJC5wb3N0KCcvY29va2llJywge25hbWU6bmFtZSwgdmFsdWU6dmFsdWUsIGRheXM6ZGF5c30sIGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgIGlmIChkYXRhLmVycm9yICE9PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sICdqc29uJyk7XHJcbn0iLCIoZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQpIHtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgdmFyIHRhYmxlcyA9ICQoJ3RhYmxlLmFkYXB0aXZlJyk7XHJcblxyXG4gIGlmICh0YWJsZXMubGVuZ3RoID09IDApcmV0dXJuO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgdGFibGVzLmxlbmd0aCA+IGk7IGkrKykge1xyXG4gICAgdmFyIHRhYmxlID0gdGFibGVzLmVxKGkpO1xyXG4gICAgdmFyIHRoID0gdGFibGUuZmluZCgndGhlYWQnKTtcclxuICAgIGlmICh0aC5sZW5ndGggPT0gMCkge1xyXG4gICAgICB0aCA9IHRhYmxlLmZpbmQoJ3RyJykuZXEoMCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aCA9IHRoLmZpbmQoJ3RyJykuZXEoMCk7XHJcbiAgICB9XHJcbiAgICB0aCA9IHRoLmFkZENsYXNzKCd0YWJsZS1oZWFkZXInKS5maW5kKCd0ZCx0aCcpO1xyXG5cclxuICAgIHZhciB0ciA9IHRhYmxlLmZpbmQoJ3RyJykubm90KCcudGFibGUtaGVhZGVyJyk7XHJcblxyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aC5sZW5ndGg7IGorKykge1xyXG4gICAgICB2YXIgayA9IGogKyAxO1xyXG4gICAgICB2YXIgdGQgPSB0ci5maW5kKCd0ZDpudGgtY2hpbGQoJyArIGsgKyAnKScpO1xyXG4gICAgICB0ZC5hdHRyKCdsYWJlbCcsIHRoLmVxKGopLnRleHQoKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufSkod2luZG93LCBkb2N1bWVudCk7XHJcbiIsIjtcclxuJChmdW5jdGlvbigpIHtcclxuICBmdW5jdGlvbiBvblJlbW92ZSgpe1xyXG4gICAgJHRoaXM9JCh0aGlzKTtcclxuICAgIHBvc3Q9e1xyXG4gICAgICBpZDokdGhpcy5hdHRyKCd1aWQnKSxcclxuICAgICAgdHlwZTokdGhpcy5hdHRyKCdtb2RlJylcclxuICAgIH07XHJcbiAgICAkLnBvc3QoJHRoaXMuYXR0cigndXJsJykscG9zdCxmdW5jdGlvbihkYXRhKXtcclxuICAgICAgaWYoZGF0YSAmJiBkYXRhPT0nZXJyJyl7XHJcbiAgICAgICAgbXNnPSR0aGlzLmRhdGEoJ3JlbW92ZS1lcnJvcicpO1xyXG4gICAgICAgIGlmKCFtc2cpe1xyXG4gICAgICAgICAgbXNnPSfQndC10LLQvtC30LzQvtC20L3QviDRg9C00LDQu9C40YLRjCDRjdC70LXQvNC10L3Rgic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6bXNnLHR5cGU6J2Vycid9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG1vZGU9JHRoaXMuYXR0cignbW9kZScpO1xyXG4gICAgICBpZighbW9kZSl7XHJcbiAgICAgICAgbW9kZT0ncm0nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZihtb2RlPT0ncm0nKSB7XHJcbiAgICAgICAgcm0gPSAkdGhpcy5jbG9zZXN0KCcudG9fcmVtb3ZlJyk7XHJcbiAgICAgICAgcm1fY2xhc3MgPSBybS5hdHRyKCdybV9jbGFzcycpO1xyXG4gICAgICAgIGlmIChybV9jbGFzcykge1xyXG4gICAgICAgICAgJChybV9jbGFzcykucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBybS5yZW1vdmUoKTtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQo9GB0L/QtdGI0L3QvtC1INGD0LTQsNC70LXQvdC40LUuJyx0eXBlOidpbmZvJ30pXHJcbiAgICAgIH1cclxuICAgICAgaWYobW9kZT09J3JlbG9hZCcpe1xyXG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgIGxvY2F0aW9uLmhyZWY9bG9jYXRpb24uaHJlZjtcclxuICAgICAgfVxyXG4gICAgfSkuZmFpbChmdW5jdGlvbigpe1xyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQntGI0LjQsdC60LAg0YPQtNCw0LvQvdC40Y8nLHR5cGU6J2Vycid9KTtcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywnLmFqYXhfcmVtb3ZlJyxmdW5jdGlvbigpe1xyXG4gICAgbm90aWZpY2F0aW9uLmNvbmZpcm0oe1xyXG4gICAgICBjYWxsYmFja1llczpvblJlbW92ZSxcclxuICAgICAgb2JqOiQodGhpcyksXHJcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfYm94LWFsZXJ0XCJcclxuICAgIH0pXHJcbiAgfSk7XHJcblxyXG59KTtcclxuXHJcbiIsImlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcclxuICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uIChvVGhpcykge1xyXG4gICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIC8vINCx0LvQuNC20LDQudGI0LjQuSDQsNC90LDQu9C+0LMg0LLQvdGD0YLRgNC10L3QvdC10Lkg0YTRg9C90LrRhtC40LhcclxuICAgICAgLy8gSXNDYWxsYWJsZSDQsiBFQ01BU2NyaXB0IDVcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgLSB3aGF0IGlzIHRyeWluZyB0byBiZSBib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYUFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxyXG4gICAgICBmVG9CaW5kID0gdGhpcyxcclxuICAgICAgZk5PUCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgfSxcclxuICAgICAgZkJvdW5kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBmVG9CaW5kLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBmTk9QICYmIG9UaGlzXHJcbiAgICAgICAgICAgID8gdGhpc1xyXG4gICAgICAgICAgICA6IG9UaGlzLFxyXG4gICAgICAgICAgYUFyZ3MuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcclxuICAgICAgfTtcclxuXHJcbiAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xyXG4gICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XHJcblxyXG4gICAgcmV0dXJuIGZCb3VuZDtcclxuICB9O1xyXG59XHJcblxyXG5pZiAoIVN0cmluZy5wcm90b3R5cGUudHJpbSkge1xyXG4gIChmdW5jdGlvbigpIHtcclxuICAgIC8vINCS0YvRgNC10LfQsNC10LwgQk9NINC4INC90LXRgNCw0LfRgNGL0LLQvdGL0Lkg0L/RgNC+0LHQtdC7XHJcbiAgICBTdHJpbmcucHJvdG90eXBlLnRyaW0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZSgvXltcXHNcXHVGRUZGXFx4QTBdK3xbXFxzXFx1RkVGRlxceEEwXSskL2csICcnKTtcclxuICAgIH07XHJcbiAgfSkoKTtcclxufSIsIihmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLmhpZGRlbi1saW5rJykucmVwbGFjZVdpdGgoZnVuY3Rpb24gKCkge1xyXG4gICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgcmV0dXJuICc8YSBocmVmPVwiJyArICR0aGlzLmRhdGEoJ2xpbmsnKSArICdcIiByZWw9XCInKyAkdGhpcy5kYXRhKCdyZWwnKSArJ1wiIGNsYXNzPVwiJyArICR0aGlzLmF0dHIoJ2NsYXNzJykgKyAnXCI+JyArICR0aGlzLnRleHQoKSArICc8L2E+JztcclxuICB9KVxyXG59KSgpO1xyXG4iLCJ2YXIgc3RvcmVfcG9pbnRzID0gKGZ1bmN0aW9uKCl7XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGNoYW5nZUNvdW50cnkoKXtcclxuICAgICAgICB2YXIgdGhhdCA9ICQoJyNzdG9yZV9wb2ludF9jb3VudHJ5Jyk7XHJcbiAgICAgICAgaWYgKHRoYXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RPcHRpb25zID0gJCh0aGF0KS5maW5kKCdvcHRpb24nKTtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSAkKCdvcHRpb246c2VsZWN0ZWQnLCB0aGF0KS5kYXRhKCdjaXRpZXMnKSxcclxuICAgICAgICAgICAgICAgIHBvaW50cyA9ICQoJyNzdG9yZS1wb2ludHMnKSxcclxuICAgICAgICAgICAgICAgIGNvdW50cnkgPSAkKCdvcHRpb246c2VsZWN0ZWQnLCB0aGF0KS5hdHRyKCd2YWx1ZScpO1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0T3B0aW9ucy5sZW5ndGggPiAxICYmIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9yZV9wb2ludF9jaXR5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy92YXIgb3B0aW9ucyA9ICc8b3B0aW9uIHZhbHVlPVwiXCI+0JLRi9Cx0LXRgNC40YLQtSDQs9C+0YDQvtC0PC9vcHRpb24+JztcclxuICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIGl0ZW0gKyAnXCI+JyArIGl0ZW0gKyAnPC9vcHRpb24+JztcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3QuaW5uZXJIVE1MID0gb3B0aW9ucztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyQocG9pbnRzKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIC8vIGdvb2dsZU1hcC5zaG93TWFwKCk7XHJcbiAgICAgICAgICAgIC8vIGdvb2dsZU1hcC5zaG93TWFya2VyKGNvdW50cnksICcnKTtcclxuICAgICAgICAgICAgY2hhbmdlQ2l0eSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2hhbmdlQ2l0eSgpe1xyXG4gICAgICAgIGlmICh0eXBlb2YgZ29vZ2xlTWFwID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB0aGF0ID0gJCgnI3N0b3JlX3BvaW50X2NpdHknKTtcclxuICAgICAgICBpZiAodGhhdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIGNpdHkgPSAkKCdvcHRpb246c2VsZWN0ZWQnLCB0aGF0KS5hdHRyKCd2YWx1ZScpLFxyXG4gICAgICAgICAgICAgICAgY291bnRyeSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsICQoJyNzdG9yZV9wb2ludF9jb3VudHJ5JykpLmF0dHIoJ3ZhbHVlJyksXHJcbiAgICAgICAgICAgICAgICBwb2ludHMgPSAkKCcjc3RvcmUtcG9pbnRzJyk7XHJcbiAgICAgICAgICAgIGlmIChjb3VudHJ5ICYmIGNpdHkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IHBvaW50cy5maW5kKCcuc3RvcmUtcG9pbnRzX19wb2ludHNfcm93JyksXHJcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXAuc2hvd01hcmtlcihjb3VudHJ5LCBjaXR5KTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkLmVhY2goaXRlbXMsIGZ1bmN0aW9uIChpbmRleCwgZGl2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQoZGl2KS5kYXRhKCdjaXR5JykgPT0gY2l0eSAmJiAkKGRpdikuZGF0YSgnY291bnRyeScpID09IGNvdW50cnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChkaXYpLnJlbW92ZUNsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50c19yb3ctaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZGl2KS5hZGRDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHNfcm93LWhpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHBvaW50cykucmVtb3ZlQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzLWhpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5zaG93TWFwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHBvaW50cykuYWRkQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzLWhpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5oaWRlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKHBvaW50cykuYWRkQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzLWhpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xlTWFwLmhpZGVNYXAoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL9C00LvRjyDRgtC+0YfQtdC6INC/0YDQvtC00LDQtiwg0YHQvtCx0YvRgtC40Y8g0L3QsCDQstGL0LHQvtGAINGB0LXQu9C10LrRgtC+0LJcclxuICAgIHZhciBib2R5ID0gJCgnYm9keScpO1xyXG5cclxuICAgICQoYm9keSkub24oJ2NoYW5nZScsICcjc3RvcmVfcG9pbnRfY291bnRyeScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBjaGFuZ2VDb3VudHJ5KCk7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgJChib2R5KS5vbignY2hhbmdlJywgJyNzdG9yZV9wb2ludF9jaXR5JywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGNoYW5nZUNpdHkoKTtcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBjaGFuZ2VDb3VudHJ5KCk7XHJcblxyXG5cclxufSkoKTtcclxuXHJcblxyXG5cclxuXHJcbiIsInZhciBoYXNoVGFncyA9IChmdW5jdGlvbigpe1xyXG5cclxuICAgIGZ1bmN0aW9uIGxvY2F0aW9uSGFzaCgpIHtcclxuICAgICAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xyXG5cclxuICAgICAgICBpZiAoaGFzaCAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHZhciBoYXNoQm9keSA9IGhhc2guc3BsaXQoXCI/XCIpO1xyXG4gICAgICAgICAgICBpZiAoaGFzaEJvZHlbMV0pIHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGxvY2F0aW9uLm9yaWdpbiArIGxvY2F0aW9uLnBhdGhuYW1lICsgJz8nICsgaGFzaEJvZHlbMV0gKyBoYXNoQm9keVswXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBsaW5rcyA9ICQoJ2FbaHJlZj1cIicgKyBoYXNoQm9keVswXSArICdcIl0ubW9kYWxzX29wZW4nKTtcclxuICAgICAgICAgICAgICAgIGlmIChsaW5rcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGxpbmtzWzBdKS5jbGljaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiaGFzaGNoYW5nZVwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIGxvY2F0aW9uSGFzaCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgbG9jYXRpb25IYXNoKClcclxuXHJcbn0pKCk7IiwidmFyIHBsdWdpbnMgPSAoZnVuY3Rpb24oKXtcclxuICAgIHZhciBpY29uQ2xvc2UgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwiQ2FwYV8xXCIgeD1cIjBweFwiIHk9XCIwcHhcIiB3aWR0aD1cIjEycHhcIiBoZWlnaHQ9XCIxMnB4XCIgdmlld0JveD1cIjAgMCAzNTcgMzU3XCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM1NyAzNTc7XCIgeG1sOnNwYWNlPVwicHJlc2VydmVcIj48Zz4nK1xyXG4gICAgICAgICc8ZyBpZD1cImNsb3NlXCI+PHBvbHlnb24gcG9pbnRzPVwiMzU3LDM1LjcgMzIxLjMsMCAxNzguNSwxNDIuOCAzNS43LDAgMCwzNS43IDE0Mi44LDE3OC41IDAsMzIxLjMgMzUuNywzNTcgMTc4LjUsMjE0LjIgMzIxLjMsMzU3IDM1NywzMjEuMyAgICAgMjE0LjIsMTc4LjUgICBcIiBmaWxsPVwiI0ZGRkZGRlwiLz4nK1xyXG4gICAgICAgICc8L3N2Zz4nO1xyXG4gICAgdmFyIHRlbXBsYXRlPSc8ZGl2IGNsYXNzPVwicGFnZS13cmFwIGluc3RhbGwtcGx1Z2luX2lubmVyXCI+JytcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaW5zdGFsbC1wbHVnaW5fdGV4dFwiPnt7dGV4dH19PC9kaXY+JytcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaW5zdGFsbC1wbHVnaW5fYnV0dG9uc1wiPicrXHJcbiAgICAgICAgICAgICAgICAgICAgJzxhIGNsYXNzPVwiYnRuIGJ0bi1taW5pIGJ0bi1yb3VuZCBpbnN0YWxsLXBsdWdpbl9idXR0b25cIiAgaHJlZj1cInt7aHJlZn19XCIgdGFyZ2V0PVwiX2JsYW5rXCI+e3t0aXRsZX19PC9hPicrXHJcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJpbnN0YWxsLXBsdWdpbl9idXR0b24tY2xvc2VcIj4nK2ljb25DbG9zZSsnPC9kaXY+JytcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nK1xyXG4gICAgICAgICAgICAnPC9kaXY+JztcclxuICAgIHZhciBwbHVnaW5JbnN0YWxsRGl2Q2xhc3MgPSAnaW5zdGFsbC1wbHVnaW4taW5kZXgnO1xyXG4gICAgdmFyIHBsdWdpbkluc3RhbGxEaXZBY2NvdW50Q2xhc3MgPSAnaW5zdGFsbC1wbHVnaW4tYWNjb3VudCc7XHJcbiAgICB2YXIgY29va2llUGFuZWxIaWRkZW4gPSAnc2QtaW5zdGFsbC1wbHVnaW4taGlkZGVuJztcclxuICAgIHZhciBjb29raWVBY2NvdW50RGl2SGlkZGVuID0gJ3NkLWluc3RhbGwtcGx1Z2luLWFjY291bnQtaGlkZGVuJztcclxuICAgIHZhciBpc09wZXJhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCcgT1BSLycpID49IDA7XHJcbiAgICB2YXIgaXNZYW5kZXggPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJyBZYUJyb3dzZXIvJykgPj0gMDtcclxuICAgIHZhciBleHRlbnNpb25zID0ge1xyXG4gICAgICAgICdjaHJvbWUnOiB7XHJcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2RfY2hyb21lX2FwcCcsXHJcbiAgICAgICAgICAgICd1c2VkJzogISF3aW5kb3cuY2hyb21lICYmIHdpbmRvdy5jaHJvbWUud2Vic3RvcmUgIT09IG51bGwgJiYgIWlzT3BlcmEgJiYgIWlzWWFuZGV4LFxyXG4gICAgICAgICAgICAvLyd0ZXh0JzogbGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIiksXHJcbiAgICAgICAgICAgICdocmVmJzogJ2h0dHBzOi8vY2hyb21lLmdvb2dsZS5jb20vd2Vic3RvcmUvZGV0YWlsL3NlY3JldGRpc2NvdW50ZXJydS0lRTIlODAlOTMtJUQwJUJBJUQxJThEJUQxJTg4JUQwJUIxL21jb2xoaGVtZmFjcG9hZ2hqaWRobGllY3BpYW5wbmpuJyxcclxuICAgICAgICAgICAgJ2luc3RhbGxfYnV0dG9uX2NsYXNzJzogJ3BsdWdpbi1icm93c2Vycy1saW5rLWNocm9tZSdcclxuICAgICAgICB9LFxyXG4gICAgICAgICdmaXJlZm94Jzoge1xyXG4gICAgICAgICAgICAnZGl2X2lkJzogJ3NkX2ZpcmVmb3hfYXBwJyxcclxuICAgICAgICAgICAgJ3VzZWQnOiAgdHlwZW9mIEluc3RhbGxUcmlnZ2VyICE9PSAndW5kZWZpbmVkJyxcclxuICAgICAgICAgICAgLy8ndGV4dCc6bGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIiksXHJcbiAgICAgICAgICAgIC8vJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMubW96aWxsYS5vcmcvcnUvZmlyZWZveC9hZGRvbi9zZWNyZXRkaXNjb3VudGVyLSVEMCVCQSVEMSU4RCVEMSU4OCVEMCVCMSVEMSU4RCVEMCVCQS0lRDElODElRDAlQjUlRDElODAlRDAlQjIlRDAlQjglRDElODEvJyxcclxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMubW96aWxsYS5vcmcvcnUvZmlyZWZveC9hZGRvbi9zZWNyZXRkaXNjb3VudGVyLWNhc2hiYWNrJyxcclxuICAgICAgICAgICAgJ2luc3RhbGxfYnV0dG9uX2NsYXNzJzogJ3BsdWdpbi1icm93c2Vycy1saW5rLWZpcmVmb3gnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnb3BlcmEnOiB7XHJcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2Rfb3BlcmFfYXBwJyxcclxuICAgICAgICAgICAgJ3VzZWQnOiBpc09wZXJhLFxyXG4gICAgICAgICAgICAvLyd0ZXh0JzpsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcclxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMub3BlcmEuY29tL3J1L2V4dGVuc2lvbnMvP3JlZj1wYWdlJyxcclxuICAgICAgICAgICAgJ2luc3RhbGxfYnV0dG9uX2NsYXNzJzogJ3BsdWdpbi1icm93c2Vycy1saW5rLW9wZXJhJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ3lhbmRleCc6IHtcclxuICAgICAgICAgICAgJ2Rpdl9pZCc6ICdzZF95YW5kZXhfYXBwJyxcclxuICAgICAgICAgICAgJ3VzZWQnOiBpc1lhbmRleCxcclxuICAgICAgICAgICAgLy8ndGV4dCc6bGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIiksXHJcbiAgICAgICAgICAgICdocmVmJzogJ2h0dHBzOi8vYWRkb25zLm9wZXJhLmNvbS9ydS9leHRlbnNpb25zLz9yZWY9cGFnZScsXHJcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay15YW5kZXgnXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gc2V0UGFuZWwoaHJlZikge1xyXG4gICAgICAgIHZhciBwbHVnaW5JbnN0YWxsUGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGx1Z2luLWluc3RhbGwtcGFuZWwnKTsvL9Cy0YvQstC+0LTQuNGC0Ywg0LvQuCDQv9Cw0L3QtdC70YxcclxuICAgICAgICBpZiAocGx1Z2luSW5zdGFsbFBhbmVsICYmIGdldENvb2tpZShjb29raWVQYW5lbEhpZGRlbikgIT09ICcxJyApIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7e3RleHR9fScsIGxnKFwiaW5zdGFsbF9wbHVnaW5fYW5kX2l0X3dpbGxfbm90aWNlX2Fib3V0X2Nhc2hiYWNrXCIpKTtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7e2hyZWZ9fScsIGhyZWYpO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7dGl0bGV9fScsIGxnKFwiaW5zdGFsbF9wbHVnaW5cIikpO1xyXG4gICAgICAgICAgICB2YXIgc2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcclxuICAgICAgICAgICAgc2VjdGlvbi5jbGFzc05hbWUgPSAnaW5zdGFsbC1wbHVnaW4nO1xyXG4gICAgICAgICAgICBzZWN0aW9uLmlubmVySFRNTCA9IHRlbXBsYXRlO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNlY29uZGxpbmUgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJy5oZWFkZXItc2Vjb25kbGluZScpO1xyXG4gICAgICAgICAgICBpZiAoc2Vjb25kbGluZSkge1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kbGluZS5hcHBlbmRDaGlsZChzZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbnN0YWxsLXBsdWdpbl9idXR0b24tY2xvc2UnKS5vbmNsaWNrID0gY2xvc2VDbGljaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRCdXR0b25JbnN0YWxsVmlzaWJsZShidXR0b25DbGFzcykge1xyXG4gICAgICAgICQoJy4nICsgcGx1Z2luSW5zdGFsbERpdkNsYXNzKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgJCgnLicgKyBidXR0b25DbGFzcykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIGlmIChnZXRDb29raWUoY29va2llQWNjb3VudERpdkhpZGRlbikgIT09ICcxJykge1xyXG4gICAgICAgICAgICAkKCcuJyArIHBsdWdpbkluc3RhbGxEaXZBY2NvdW50Q2xhc3MpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xvc2VDbGljaygpe1xyXG4gICAgICAgICQoJy5pbnN0YWxsLXBsdWdpbicpLmFkZENsYXNzKCdpbnN0YWxsLXBsdWdpbl9oaWRkZW4nKTtcclxuICAgICAgICBzZXRDb29raWUoY29va2llUGFuZWxIaWRkZW4sICcxJywgMTApO1xyXG4gICAgfVxyXG5cclxuICAgICQoJy5pbnN0YWxsLXBsdWdpbi1hY2NvdW50LWxhdGVyJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzZXRDb29raWUoY29va2llQWNjb3VudERpdkhpZGRlbiwgJzEnLCAxMCk7XHJcbiAgICAgICAgJCgnLmluc3RhbGwtcGx1Z2luLWFjY291bnQnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBleHRlbnNpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9uc1trZXldLnVzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYXBwSWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjJytleHRlbnNpb25zW2tleV0uZGl2X2lkKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWFwcElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v0L/QsNC90LXQu9GMINGBINC60L3QvtC/0LrQvtC5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFBhbmVsKGV4dGVuc2lvbnNba2V5XS5ocmVmKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy/QvdCwINCz0LvQsNCy0L3QvtC5ICDQuCDQsiAvYWNjb3VudCDQsdC70L7QutC4INGBINC40LrQvtC90LrQsNC80Lgg0Lgg0LrQvdC+0L/QutCw0LzQuFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRCdXR0b25JbnN0YWxsVmlzaWJsZShleHRlbnNpb25zW2tleV0uaW5zdGFsbF9idXR0b25fY2xhc3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIDMwMDApO1xyXG4gICAgfTtcclxuXHJcbn0pKCk7IiwiLyoqXHJcbiAqIEBhdXRob3IgemhpeGluIHdlbiA8d2VuemhpeGluMjAxMEBnbWFpbC5jb20+XHJcbiAqIEB2ZXJzaW9uIDEuMi4xXHJcbiAqXHJcbiAqIGh0dHA6Ly93ZW56aGl4aW4ubmV0LmNuL3AvbXVsdGlwbGUtc2VsZWN0L1xyXG4gKi9cclxuXHJcbihmdW5jdGlvbiAoJCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvLyBpdCBvbmx5IGRvZXMgJyVzJywgYW5kIHJldHVybiAnJyB3aGVuIGFyZ3VtZW50cyBhcmUgdW5kZWZpbmVkXHJcbiAgICB2YXIgc3ByaW50ZiA9IGZ1bmN0aW9uIChzdHIpIHtcclxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcclxuICAgICAgICAgICAgZmxhZyA9IHRydWUsXHJcbiAgICAgICAgICAgIGkgPSAxO1xyXG5cclxuICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgYXJnID0gYXJnc1tpKytdO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBmbGFnID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGFyZztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZmxhZyA/IHN0ciA6ICcnO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgcmVtb3ZlRGlhY3JpdGljcyA9IGZ1bmN0aW9uIChzdHIpIHtcclxuICAgICAgICB2YXIgZGVmYXVsdERpYWNyaXRpY3NSZW1vdmFsTWFwID0gW1xyXG4gICAgICAgICAgICB7J2Jhc2UnOidBJywgJ2xldHRlcnMnOi9bXFx1MDA0MVxcdTI0QjZcXHVGRjIxXFx1MDBDMFxcdTAwQzFcXHUwMEMyXFx1MUVBNlxcdTFFQTRcXHUxRUFBXFx1MUVBOFxcdTAwQzNcXHUwMTAwXFx1MDEwMlxcdTFFQjBcXHUxRUFFXFx1MUVCNFxcdTFFQjJcXHUwMjI2XFx1MDFFMFxcdTAwQzRcXHUwMURFXFx1MUVBMlxcdTAwQzVcXHUwMUZBXFx1MDFDRFxcdTAyMDBcXHUwMjAyXFx1MUVBMFxcdTFFQUNcXHUxRUI2XFx1MUUwMFxcdTAxMDRcXHUwMjNBXFx1MkM2Rl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0FBJywnbGV0dGVycyc6L1tcXHVBNzMyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQUUnLCdsZXR0ZXJzJzovW1xcdTAwQzZcXHUwMUZDXFx1MDFFMl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0FPJywnbGV0dGVycyc6L1tcXHVBNzM0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQVUnLCdsZXR0ZXJzJzovW1xcdUE3MzZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidBVicsJ2xldHRlcnMnOi9bXFx1QTczOFxcdUE3M0FdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidBWScsJ2xldHRlcnMnOi9bXFx1QTczQ10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0InLCAnbGV0dGVycyc6L1tcXHUwMDQyXFx1MjRCN1xcdUZGMjJcXHUxRTAyXFx1MUUwNFxcdTFFMDZcXHUwMjQzXFx1MDE4MlxcdTAxODFdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidDJywgJ2xldHRlcnMnOi9bXFx1MDA0M1xcdTI0QjhcXHVGRjIzXFx1MDEwNlxcdTAxMDhcXHUwMTBBXFx1MDEwQ1xcdTAwQzdcXHUxRTA4XFx1MDE4N1xcdTAyM0JcXHVBNzNFXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonRCcsICdsZXR0ZXJzJzovW1xcdTAwNDRcXHUyNEI5XFx1RkYyNFxcdTFFMEFcXHUwMTBFXFx1MUUwQ1xcdTFFMTBcXHUxRTEyXFx1MUUwRVxcdTAxMTBcXHUwMThCXFx1MDE4QVxcdTAxODlcXHVBNzc5XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonRFonLCdsZXR0ZXJzJzovW1xcdTAxRjFcXHUwMUM0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonRHonLCdsZXR0ZXJzJzovW1xcdTAxRjJcXHUwMUM1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonRScsICdsZXR0ZXJzJzovW1xcdTAwNDVcXHUyNEJBXFx1RkYyNVxcdTAwQzhcXHUwMEM5XFx1MDBDQVxcdTFFQzBcXHUxRUJFXFx1MUVDNFxcdTFFQzJcXHUxRUJDXFx1MDExMlxcdTFFMTRcXHUxRTE2XFx1MDExNFxcdTAxMTZcXHUwMENCXFx1MUVCQVxcdTAxMUFcXHUwMjA0XFx1MDIwNlxcdTFFQjhcXHUxRUM2XFx1MDIyOFxcdTFFMUNcXHUwMTE4XFx1MUUxOFxcdTFFMUFcXHUwMTkwXFx1MDE4RV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0YnLCAnbGV0dGVycyc6L1tcXHUwMDQ2XFx1MjRCQlxcdUZGMjZcXHUxRTFFXFx1MDE5MVxcdUE3N0JdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidHJywgJ2xldHRlcnMnOi9bXFx1MDA0N1xcdTI0QkNcXHVGRjI3XFx1MDFGNFxcdTAxMUNcXHUxRTIwXFx1MDExRVxcdTAxMjBcXHUwMUU2XFx1MDEyMlxcdTAxRTRcXHUwMTkzXFx1QTdBMFxcdUE3N0RcXHVBNzdFXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonSCcsICdsZXR0ZXJzJzovW1xcdTAwNDhcXHUyNEJEXFx1RkYyOFxcdTAxMjRcXHUxRTIyXFx1MUUyNlxcdTAyMUVcXHUxRTI0XFx1MUUyOFxcdTFFMkFcXHUwMTI2XFx1MkM2N1xcdTJDNzVcXHVBNzhEXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonSScsICdsZXR0ZXJzJzovW1xcdTAwNDlcXHUyNEJFXFx1RkYyOVxcdTAwQ0NcXHUwMENEXFx1MDBDRVxcdTAxMjhcXHUwMTJBXFx1MDEyQ1xcdTAxMzBcXHUwMENGXFx1MUUyRVxcdTFFQzhcXHUwMUNGXFx1MDIwOFxcdTAyMEFcXHUxRUNBXFx1MDEyRVxcdTFFMkNcXHUwMTk3XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonSicsICdsZXR0ZXJzJzovW1xcdTAwNEFcXHUyNEJGXFx1RkYyQVxcdTAxMzRcXHUwMjQ4XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonSycsICdsZXR0ZXJzJzovW1xcdTAwNEJcXHUyNEMwXFx1RkYyQlxcdTFFMzBcXHUwMUU4XFx1MUUzMlxcdTAxMzZcXHUxRTM0XFx1MDE5OFxcdTJDNjlcXHVBNzQwXFx1QTc0MlxcdUE3NDRcXHVBN0EyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTCcsICdsZXR0ZXJzJzovW1xcdTAwNENcXHUyNEMxXFx1RkYyQ1xcdTAxM0ZcXHUwMTM5XFx1MDEzRFxcdTFFMzZcXHUxRTM4XFx1MDEzQlxcdTFFM0NcXHUxRTNBXFx1MDE0MVxcdTAyM0RcXHUyQzYyXFx1MkM2MFxcdUE3NDhcXHVBNzQ2XFx1QTc4MF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0xKJywnbGV0dGVycyc6L1tcXHUwMUM3XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTGonLCdsZXR0ZXJzJzovW1xcdTAxQzhdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidNJywgJ2xldHRlcnMnOi9bXFx1MDA0RFxcdTI0QzJcXHVGRjJEXFx1MUUzRVxcdTFFNDBcXHUxRTQyXFx1MkM2RVxcdTAxOUNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidOJywgJ2xldHRlcnMnOi9bXFx1MDA0RVxcdTI0QzNcXHVGRjJFXFx1MDFGOFxcdTAxNDNcXHUwMEQxXFx1MUU0NFxcdTAxNDdcXHUxRTQ2XFx1MDE0NVxcdTFFNEFcXHUxRTQ4XFx1MDIyMFxcdTAxOURcXHVBNzkwXFx1QTdBNF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J05KJywnbGV0dGVycyc6L1tcXHUwMUNBXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTmonLCdsZXR0ZXJzJzovW1xcdTAxQ0JdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidPJywgJ2xldHRlcnMnOi9bXFx1MDA0RlxcdTI0QzRcXHVGRjJGXFx1MDBEMlxcdTAwRDNcXHUwMEQ0XFx1MUVEMlxcdTFFRDBcXHUxRUQ2XFx1MUVENFxcdTAwRDVcXHUxRTRDXFx1MDIyQ1xcdTFFNEVcXHUwMTRDXFx1MUU1MFxcdTFFNTJcXHUwMTRFXFx1MDIyRVxcdTAyMzBcXHUwMEQ2XFx1MDIyQVxcdTFFQ0VcXHUwMTUwXFx1MDFEMVxcdTAyMENcXHUwMjBFXFx1MDFBMFxcdTFFRENcXHUxRURBXFx1MUVFMFxcdTFFREVcXHUxRUUyXFx1MUVDQ1xcdTFFRDhcXHUwMUVBXFx1MDFFQ1xcdTAwRDhcXHUwMUZFXFx1MDE4NlxcdTAxOUZcXHVBNzRBXFx1QTc0Q10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J09JJywnbGV0dGVycyc6L1tcXHUwMUEyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonT08nLCdsZXR0ZXJzJzovW1xcdUE3NEVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidPVScsJ2xldHRlcnMnOi9bXFx1MDIyMl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1AnLCAnbGV0dGVycyc6L1tcXHUwMDUwXFx1MjRDNVxcdUZGMzBcXHUxRTU0XFx1MUU1NlxcdTAxQTRcXHUyQzYzXFx1QTc1MFxcdUE3NTJcXHVBNzU0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonUScsICdsZXR0ZXJzJzovW1xcdTAwNTFcXHUyNEM2XFx1RkYzMVxcdUE3NTZcXHVBNzU4XFx1MDI0QV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1InLCAnbGV0dGVycyc6L1tcXHUwMDUyXFx1MjRDN1xcdUZGMzJcXHUwMTU0XFx1MUU1OFxcdTAxNThcXHUwMjEwXFx1MDIxMlxcdTFFNUFcXHUxRTVDXFx1MDE1NlxcdTFFNUVcXHUwMjRDXFx1MkM2NFxcdUE3NUFcXHVBN0E2XFx1QTc4Ml0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1MnLCAnbGV0dGVycyc6L1tcXHUwMDUzXFx1MjRDOFxcdUZGMzNcXHUxRTlFXFx1MDE1QVxcdTFFNjRcXHUwMTVDXFx1MUU2MFxcdTAxNjBcXHUxRTY2XFx1MUU2MlxcdTFFNjhcXHUwMjE4XFx1MDE1RVxcdTJDN0VcXHVBN0E4XFx1QTc4NF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1QnLCAnbGV0dGVycyc6L1tcXHUwMDU0XFx1MjRDOVxcdUZGMzRcXHUxRTZBXFx1MDE2NFxcdTFFNkNcXHUwMjFBXFx1MDE2MlxcdTFFNzBcXHUxRTZFXFx1MDE2NlxcdTAxQUNcXHUwMUFFXFx1MDIzRVxcdUE3ODZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidUWicsJ2xldHRlcnMnOi9bXFx1QTcyOF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1UnLCAnbGV0dGVycyc6L1tcXHUwMDU1XFx1MjRDQVxcdUZGMzVcXHUwMEQ5XFx1MDBEQVxcdTAwREJcXHUwMTY4XFx1MUU3OFxcdTAxNkFcXHUxRTdBXFx1MDE2Q1xcdTAwRENcXHUwMURCXFx1MDFEN1xcdTAxRDVcXHUwMUQ5XFx1MUVFNlxcdTAxNkVcXHUwMTcwXFx1MDFEM1xcdTAyMTRcXHUwMjE2XFx1MDFBRlxcdTFFRUFcXHUxRUU4XFx1MUVFRVxcdTFFRUNcXHUxRUYwXFx1MUVFNFxcdTFFNzJcXHUwMTcyXFx1MUU3NlxcdTFFNzRcXHUwMjQ0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonVicsICdsZXR0ZXJzJzovW1xcdTAwNTZcXHUyNENCXFx1RkYzNlxcdTFFN0NcXHUxRTdFXFx1MDFCMlxcdUE3NUVcXHUwMjQ1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonVlknLCdsZXR0ZXJzJzovW1xcdUE3NjBdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidXJywgJ2xldHRlcnMnOi9bXFx1MDA1N1xcdTI0Q0NcXHVGRjM3XFx1MUU4MFxcdTFFODJcXHUwMTc0XFx1MUU4NlxcdTFFODRcXHUxRTg4XFx1MkM3Ml0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1gnLCAnbGV0dGVycyc6L1tcXHUwMDU4XFx1MjRDRFxcdUZGMzhcXHUxRThBXFx1MUU4Q10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1knLCAnbGV0dGVycyc6L1tcXHUwMDU5XFx1MjRDRVxcdUZGMzlcXHUxRUYyXFx1MDBERFxcdTAxNzZcXHUxRUY4XFx1MDIzMlxcdTFFOEVcXHUwMTc4XFx1MUVGNlxcdTFFRjRcXHUwMUIzXFx1MDI0RVxcdTFFRkVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidaJywgJ2xldHRlcnMnOi9bXFx1MDA1QVxcdTI0Q0ZcXHVGRjNBXFx1MDE3OVxcdTFFOTBcXHUwMTdCXFx1MDE3RFxcdTFFOTJcXHUxRTk0XFx1MDFCNVxcdTAyMjRcXHUyQzdGXFx1MkM2QlxcdUE3NjJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidhJywgJ2xldHRlcnMnOi9bXFx1MDA2MVxcdTI0RDBcXHVGRjQxXFx1MUU5QVxcdTAwRTBcXHUwMEUxXFx1MDBFMlxcdTFFQTdcXHUxRUE1XFx1MUVBQlxcdTFFQTlcXHUwMEUzXFx1MDEwMVxcdTAxMDNcXHUxRUIxXFx1MUVBRlxcdTFFQjVcXHUxRUIzXFx1MDIyN1xcdTAxRTFcXHUwMEU0XFx1MDFERlxcdTFFQTNcXHUwMEU1XFx1MDFGQlxcdTAxQ0VcXHUwMjAxXFx1MDIwM1xcdTFFQTFcXHUxRUFEXFx1MUVCN1xcdTFFMDFcXHUwMTA1XFx1MkM2NVxcdTAyNTBdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidhYScsJ2xldHRlcnMnOi9bXFx1QTczM10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2FlJywnbGV0dGVycyc6L1tcXHUwMEU2XFx1MDFGRFxcdTAxRTNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidhbycsJ2xldHRlcnMnOi9bXFx1QTczNV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2F1JywnbGV0dGVycyc6L1tcXHVBNzM3XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYXYnLCdsZXR0ZXJzJzovW1xcdUE3MzlcXHVBNzNCXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYXknLCdsZXR0ZXJzJzovW1xcdUE3M0RdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidiJywgJ2xldHRlcnMnOi9bXFx1MDA2MlxcdTI0RDFcXHVGRjQyXFx1MUUwM1xcdTFFMDVcXHUxRTA3XFx1MDE4MFxcdTAxODNcXHUwMjUzXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYycsICdsZXR0ZXJzJzovW1xcdTAwNjNcXHUyNEQyXFx1RkY0M1xcdTAxMDdcXHUwMTA5XFx1MDEwQlxcdTAxMERcXHUwMEU3XFx1MUUwOVxcdTAxODhcXHUwMjNDXFx1QTczRlxcdTIxODRdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidkJywgJ2xldHRlcnMnOi9bXFx1MDA2NFxcdTI0RDNcXHVGRjQ0XFx1MUUwQlxcdTAxMEZcXHUxRTBEXFx1MUUxMVxcdTFFMTNcXHUxRTBGXFx1MDExMVxcdTAxOENcXHUwMjU2XFx1MDI1N1xcdUE3N0FdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidkeicsJ2xldHRlcnMnOi9bXFx1MDFGM1xcdTAxQzZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidlJywgJ2xldHRlcnMnOi9bXFx1MDA2NVxcdTI0RDRcXHVGRjQ1XFx1MDBFOFxcdTAwRTlcXHUwMEVBXFx1MUVDMVxcdTFFQkZcXHUxRUM1XFx1MUVDM1xcdTFFQkRcXHUwMTEzXFx1MUUxNVxcdTFFMTdcXHUwMTE1XFx1MDExN1xcdTAwRUJcXHUxRUJCXFx1MDExQlxcdTAyMDVcXHUwMjA3XFx1MUVCOVxcdTFFQzdcXHUwMjI5XFx1MUUxRFxcdTAxMTlcXHUxRTE5XFx1MUUxQlxcdTAyNDdcXHUwMjVCXFx1MDFERF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2YnLCAnbGV0dGVycyc6L1tcXHUwMDY2XFx1MjRENVxcdUZGNDZcXHUxRTFGXFx1MDE5MlxcdUE3N0NdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidnJywgJ2xldHRlcnMnOi9bXFx1MDA2N1xcdTI0RDZcXHVGRjQ3XFx1MDFGNVxcdTAxMURcXHUxRTIxXFx1MDExRlxcdTAxMjFcXHUwMUU3XFx1MDEyM1xcdTAxRTVcXHUwMjYwXFx1QTdBMVxcdTFENzlcXHVBNzdGXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonaCcsICdsZXR0ZXJzJzovW1xcdTAwNjhcXHUyNEQ3XFx1RkY0OFxcdTAxMjVcXHUxRTIzXFx1MUUyN1xcdTAyMUZcXHUxRTI1XFx1MUUyOVxcdTFFMkJcXHUxRTk2XFx1MDEyN1xcdTJDNjhcXHUyQzc2XFx1MDI2NV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2h2JywnbGV0dGVycyc6L1tcXHUwMTk1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonaScsICdsZXR0ZXJzJzovW1xcdTAwNjlcXHUyNEQ4XFx1RkY0OVxcdTAwRUNcXHUwMEVEXFx1MDBFRVxcdTAxMjlcXHUwMTJCXFx1MDEyRFxcdTAwRUZcXHUxRTJGXFx1MUVDOVxcdTAxRDBcXHUwMjA5XFx1MDIwQlxcdTFFQ0JcXHUwMTJGXFx1MUUyRFxcdTAyNjhcXHUwMTMxXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonaicsICdsZXR0ZXJzJzovW1xcdTAwNkFcXHUyNEQ5XFx1RkY0QVxcdTAxMzVcXHUwMUYwXFx1MDI0OV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2snLCAnbGV0dGVycyc6L1tcXHUwMDZCXFx1MjREQVxcdUZGNEJcXHUxRTMxXFx1MDFFOVxcdTFFMzNcXHUwMTM3XFx1MUUzNVxcdTAxOTlcXHUyQzZBXFx1QTc0MVxcdUE3NDNcXHVBNzQ1XFx1QTdBM10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2wnLCAnbGV0dGVycyc6L1tcXHUwMDZDXFx1MjREQlxcdUZGNENcXHUwMTQwXFx1MDEzQVxcdTAxM0VcXHUxRTM3XFx1MUUzOVxcdTAxM0NcXHUxRTNEXFx1MUUzQlxcdTAxN0ZcXHUwMTQyXFx1MDE5QVxcdTAyNkJcXHUyQzYxXFx1QTc0OVxcdUE3ODFcXHVBNzQ3XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonbGonLCdsZXR0ZXJzJzovW1xcdTAxQzldL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidtJywgJ2xldHRlcnMnOi9bXFx1MDA2RFxcdTI0RENcXHVGRjREXFx1MUUzRlxcdTFFNDFcXHUxRTQzXFx1MDI3MVxcdTAyNkZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOiduJywgJ2xldHRlcnMnOi9bXFx1MDA2RVxcdTI0RERcXHVGRjRFXFx1MDFGOVxcdTAxNDRcXHUwMEYxXFx1MUU0NVxcdTAxNDhcXHUxRTQ3XFx1MDE0NlxcdTFFNEJcXHUxRTQ5XFx1MDE5RVxcdTAyNzJcXHUwMTQ5XFx1QTc5MVxcdUE3QTVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOiduaicsJ2xldHRlcnMnOi9bXFx1MDFDQ10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J28nLCAnbGV0dGVycyc6L1tcXHUwMDZGXFx1MjRERVxcdUZGNEZcXHUwMEYyXFx1MDBGM1xcdTAwRjRcXHUxRUQzXFx1MUVEMVxcdTFFRDdcXHUxRUQ1XFx1MDBGNVxcdTFFNERcXHUwMjJEXFx1MUU0RlxcdTAxNERcXHUxRTUxXFx1MUU1M1xcdTAxNEZcXHUwMjJGXFx1MDIzMVxcdTAwRjZcXHUwMjJCXFx1MUVDRlxcdTAxNTFcXHUwMUQyXFx1MDIwRFxcdTAyMEZcXHUwMUExXFx1MUVERFxcdTFFREJcXHUxRUUxXFx1MUVERlxcdTFFRTNcXHUxRUNEXFx1MUVEOVxcdTAxRUJcXHUwMUVEXFx1MDBGOFxcdTAxRkZcXHUwMjU0XFx1QTc0QlxcdUE3NERcXHUwMjc1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonb2knLCdsZXR0ZXJzJzovW1xcdTAxQTNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidvdScsJ2xldHRlcnMnOi9bXFx1MDIyM10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J29vJywnbGV0dGVycyc6L1tcXHVBNzRGXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoncCcsJ2xldHRlcnMnOi9bXFx1MDA3MFxcdTI0REZcXHVGRjUwXFx1MUU1NVxcdTFFNTdcXHUwMUE1XFx1MUQ3RFxcdUE3NTFcXHVBNzUzXFx1QTc1NV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3EnLCdsZXR0ZXJzJzovW1xcdTAwNzFcXHUyNEUwXFx1RkY1MVxcdTAyNEJcXHVBNzU3XFx1QTc1OV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3InLCdsZXR0ZXJzJzovW1xcdTAwNzJcXHUyNEUxXFx1RkY1MlxcdTAxNTVcXHUxRTU5XFx1MDE1OVxcdTAyMTFcXHUwMjEzXFx1MUU1QlxcdTFFNURcXHUwMTU3XFx1MUU1RlxcdTAyNERcXHUwMjdEXFx1QTc1QlxcdUE3QTdcXHVBNzgzXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoncycsJ2xldHRlcnMnOi9bXFx1MDA3M1xcdTI0RTJcXHVGRjUzXFx1MDBERlxcdTAxNUJcXHUxRTY1XFx1MDE1RFxcdTFFNjFcXHUwMTYxXFx1MUU2N1xcdTFFNjNcXHUxRTY5XFx1MDIxOVxcdTAxNUZcXHUwMjNGXFx1QTdBOVxcdUE3ODVcXHUxRTlCXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzondCcsJ2xldHRlcnMnOi9bXFx1MDA3NFxcdTI0RTNcXHVGRjU0XFx1MUU2QlxcdTFFOTdcXHUwMTY1XFx1MUU2RFxcdTAyMUJcXHUwMTYzXFx1MUU3MVxcdTFFNkZcXHUwMTY3XFx1MDFBRFxcdTAyODhcXHUyQzY2XFx1QTc4N10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3R6JywnbGV0dGVycyc6L1tcXHVBNzI5XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzondScsJ2xldHRlcnMnOi9bXFx1MDA3NVxcdTI0RTRcXHVGRjU1XFx1MDBGOVxcdTAwRkFcXHUwMEZCXFx1MDE2OVxcdTFFNzlcXHUwMTZCXFx1MUU3QlxcdTAxNkRcXHUwMEZDXFx1MDFEQ1xcdTAxRDhcXHUwMUQ2XFx1MDFEQVxcdTFFRTdcXHUwMTZGXFx1MDE3MVxcdTAxRDRcXHUwMjE1XFx1MDIxN1xcdTAxQjBcXHUxRUVCXFx1MUVFOVxcdTFFRUZcXHUxRUVEXFx1MUVGMVxcdTFFRTVcXHUxRTczXFx1MDE3M1xcdTFFNzdcXHUxRTc1XFx1MDI4OV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3YnLCdsZXR0ZXJzJzovW1xcdTAwNzZcXHUyNEU1XFx1RkY1NlxcdTFFN0RcXHUxRTdGXFx1MDI4QlxcdUE3NUZcXHUwMjhDXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzondnknLCdsZXR0ZXJzJzovW1xcdUE3NjFdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid3JywnbGV0dGVycyc6L1tcXHUwMDc3XFx1MjRFNlxcdUZGNTdcXHUxRTgxXFx1MUU4M1xcdTAxNzVcXHUxRTg3XFx1MUU4NVxcdTFFOThcXHUxRTg5XFx1MkM3M10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3gnLCdsZXR0ZXJzJzovW1xcdTAwNzhcXHUyNEU3XFx1RkY1OFxcdTFFOEJcXHUxRThEXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoneScsJ2xldHRlcnMnOi9bXFx1MDA3OVxcdTI0RThcXHVGRjU5XFx1MUVGM1xcdTAwRkRcXHUwMTc3XFx1MUVGOVxcdTAyMzNcXHUxRThGXFx1MDBGRlxcdTFFRjdcXHUxRTk5XFx1MUVGNVxcdTAxQjRcXHUwMjRGXFx1MUVGRl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3onLCdsZXR0ZXJzJzovW1xcdTAwN0FcXHUyNEU5XFx1RkY1QVxcdTAxN0FcXHUxRTkxXFx1MDE3Q1xcdTAxN0VcXHUxRTkzXFx1MUU5NVxcdTAxQjZcXHUwMjI1XFx1MDI0MFxcdTJDNkNcXHVBNzYzXS9nfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGVmYXVsdERpYWNyaXRpY3NSZW1vdmFsTWFwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKGRlZmF1bHREaWFjcml0aWNzUmVtb3ZhbE1hcFtpXS5sZXR0ZXJzLCBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXBbaV0uYmFzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG5cclxuICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBNdWx0aXBsZVNlbGVjdCgkZWwsIG9wdGlvbnMpIHtcclxuICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgIG5hbWUgPSAkZWwuYXR0cignbmFtZScpIHx8IG9wdGlvbnMubmFtZSB8fCAnJztcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuXHJcbiAgICAgICAgLy8gaGlkZSBzZWxlY3QgZWxlbWVudFxyXG4gICAgICAgIHRoaXMuJGVsID0gJGVsLmhpZGUoKTtcclxuXHJcbiAgICAgICAgLy8gbGFiZWwgZWxlbWVudFxyXG4gICAgICAgIHRoaXMuJGxhYmVsID0gdGhpcy4kZWwuY2xvc2VzdCgnbGFiZWwnKTtcclxuICAgICAgICBpZiAodGhpcy4kbGFiZWwubGVuZ3RoID09PSAwICYmIHRoaXMuJGVsLmF0dHIoJ2lkJykpIHtcclxuICAgICAgICAgICAgdGhpcy4kbGFiZWwgPSAkKHNwcmludGYoJ2xhYmVsW2Zvcj1cIiVzXCJdJywgdGhpcy4kZWwuYXR0cignaWQnKS5yZXBsYWNlKC86L2csICdcXFxcOicpKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZXN0b3JlIGNsYXNzIGFuZCB0aXRsZSBmcm9tIHNlbGVjdCBlbGVtZW50XHJcbiAgICAgICAgdGhpcy4kcGFyZW50ID0gJChzcHJpbnRmKFxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1zLXBhcmVudCAlc1wiICVzLz4nLFxyXG4gICAgICAgICAgICAkZWwuYXR0cignY2xhc3MnKSB8fCAnJyxcclxuICAgICAgICAgICAgc3ByaW50ZigndGl0bGU9XCIlc1wiJywgJGVsLmF0dHIoJ3RpdGxlJykpKSk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBwbGFjZWhvbGRlciB0byBjaG9pY2UgYnV0dG9uXHJcbiAgICAgICAgdGhpcy4kY2hvaWNlID0gJChzcHJpbnRmKFtcclxuICAgICAgICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cIm1zLWNob2ljZVwiPicsXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJwbGFjZWhvbGRlclwiPiVzPC9zcGFuPicsXHJcbiAgICAgICAgICAgICAgICAnPGRpdj48L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgJzwvYnV0dG9uPidcclxuICAgICAgICAgICAgXS5qb2luKCcnKSxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyKSk7XHJcblxyXG4gICAgICAgIC8vIGRlZmF1bHQgcG9zaXRpb24gaXMgYm90dG9tXHJcbiAgICAgICAgdGhpcy4kZHJvcCA9ICQoc3ByaW50ZignPGRpdiBjbGFzcz1cIm1zLWRyb3AgJXNcIiVzPjwvZGl2PicsXHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbixcclxuICAgICAgICAgICAgc3ByaW50ZignIHN0eWxlPVwid2lkdGg6ICVzXCInLCB0aGlzLm9wdGlvbnMuZHJvcFdpZHRoKSkpO1xyXG5cclxuICAgICAgICB0aGlzLiRlbC5hZnRlcih0aGlzLiRwYXJlbnQpO1xyXG4gICAgICAgIHRoaXMuJHBhcmVudC5hcHBlbmQodGhpcy4kY2hvaWNlKTtcclxuICAgICAgICB0aGlzLiRwYXJlbnQuYXBwZW5kKHRoaXMuJGRyb3ApO1xyXG5cclxuICAgICAgICBpZiAodGhpcy4kZWwucHJvcCgnZGlzYWJsZWQnKSkge1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuJHBhcmVudC5jc3MoJ3dpZHRoJyxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLndpZHRoIHx8XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmNzcygnd2lkdGgnKSB8fFxyXG4gICAgICAgICAgICB0aGlzLiRlbC5vdXRlcldpZHRoKCkgKyAyMCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2VsZWN0QWxsTmFtZSA9ICdkYXRhLW5hbWU9XCJzZWxlY3RBbGwnICsgbmFtZSArICdcIic7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RHcm91cE5hbWUgPSAnZGF0YS1uYW1lPVwic2VsZWN0R3JvdXAnICsgbmFtZSArICdcIic7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RJdGVtTmFtZSA9ICdkYXRhLW5hbWU9XCJzZWxlY3RJdGVtJyArIG5hbWUgKyAnXCInO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5rZWVwT3Blbikge1xyXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpWzBdID09PSB0aGF0LiRjaG9pY2VbMF0gfHxcclxuICAgICAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCcubXMtY2hvaWNlJylbMF0gPT09IHRoYXQuJGNob2ljZVswXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgoJChlLnRhcmdldClbMF0gPT09IHRoYXQuJGRyb3BbMF0gfHxcclxuICAgICAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCcubXMtZHJvcCcpWzBdICE9PSB0aGF0LiRkcm9wWzBdICYmIGUudGFyZ2V0ICE9PSAkZWxbMF0pICYmXHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIE11bHRpcGxlU2VsZWN0LnByb3RvdHlwZSA9IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcjogTXVsdGlwbGVTZWxlY3QsXHJcblxyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgJHVsID0gJCgnPHVsPjwvdWw+Jyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmh0bWwoJycpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5maWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRyb3AuYXBwZW5kKFtcclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1zLXNlYXJjaFwiPicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwidGV4dFwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiIGF1dG9jb3JyZWN0PVwib2ZmXCIgYXV0b2NhcGl0aWxpemU9XCJvZmZcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIj4nLFxyXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nXS5qb2luKCcnKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zZWxlY3RBbGwgJiYgIXRoaXMub3B0aW9ucy5zaW5nbGUpIHtcclxuICAgICAgICAgICAgICAgICR1bC5hcHBlbmQoW1xyXG4gICAgICAgICAgICAgICAgICAgICc8bGkgY2xhc3M9XCJtcy1zZWxlY3QtYWxsXCI+JyxcclxuICAgICAgICAgICAgICAgICAgICAnPGxhYmVsPicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGlucHV0IHR5cGU9XCJjaGVja2JveFwiICVzIC8+ICcsIHRoaXMuc2VsZWN0QWxsTmFtZSksXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNlbGVjdEFsbERlbGltaXRlclswXSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0QWxsVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0QWxsRGVsaW1pdGVyWzFdLFxyXG4gICAgICAgICAgICAgICAgICAgICc8L2xhYmVsPicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvbGk+J1xyXG4gICAgICAgICAgICAgICAgXS5qb2luKCcnKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQuZWFjaCh0aGlzLiRlbC5jaGlsZHJlbigpLCBmdW5jdGlvbiAoaSwgZWxtKSB7XHJcbiAgICAgICAgICAgICAgICAkdWwuYXBwZW5kKHRoYXQub3B0aW9uVG9IdG1sKGksIGVsbSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHVsLmFwcGVuZChzcHJpbnRmKCc8bGkgY2xhc3M9XCJtcy1uby1yZXN1bHRzXCI+JXM8L2xpPicsIHRoaXMub3B0aW9ucy5ub01hdGNoZXNGb3VuZCkpO1xyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmFwcGVuZCgkdWwpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKCd1bCcpLmNzcygnbWF4LWhlaWdodCcsIHRoaXMub3B0aW9ucy5tYXhIZWlnaHQgKyAncHgnKTtcclxuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKCcubXVsdGlwbGUnKS5jc3MoJ3dpZHRoJywgdGhpcy5vcHRpb25zLm11bHRpcGxlV2lkdGggKyAncHgnKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHNlYXJjaElucHV0ID0gdGhpcy4kZHJvcC5maW5kKCcubXMtc2VhcmNoIGlucHV0Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbCA9IHRoaXMuJGRyb3AuZmluZCgnaW5wdXRbJyArIHRoaXMuc2VsZWN0QWxsTmFtZSArICddJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3VwcyA9IHRoaXMuJGRyb3AuZmluZCgnaW5wdXRbJyArIHRoaXMuc2VsZWN0R3JvdXBOYW1lICsgJ10nKTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMgPSB0aGlzLiRkcm9wLmZpbmQoJ2lucHV0WycgKyB0aGlzLnNlbGVjdEl0ZW1OYW1lICsgJ106ZW5hYmxlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLiRkaXNhYmxlSXRlbXMgPSB0aGlzLiRkcm9wLmZpbmQoJ2lucHV0WycgKyB0aGlzLnNlbGVjdEl0ZW1OYW1lICsgJ106ZGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzID0gdGhpcy4kZHJvcC5maW5kKCcubXMtbm8tcmVzdWx0cycpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTZWxlY3RBbGwodHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHRydWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb3B0aW9uVG9IdG1sOiBmdW5jdGlvbiAoaSwgZWxtLCBncm91cCwgZ3JvdXBEaXNhYmxlZCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAkZWxtID0gJChlbG0pLFxyXG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9ICRlbG0uYXR0cignY2xhc3MnKSB8fCAnJyxcclxuICAgICAgICAgICAgICAgIHRpdGxlID0gc3ByaW50ZigndGl0bGU9XCIlc1wiJywgJGVsbS5hdHRyKCd0aXRsZScpKSxcclxuICAgICAgICAgICAgICAgIG11bHRpcGxlID0gdGhpcy5vcHRpb25zLm11bHRpcGxlID8gJ211bHRpcGxlJyA6ICcnLFxyXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQsXHJcbiAgICAgICAgICAgICAgICB0eXBlID0gdGhpcy5vcHRpb25zLnNpbmdsZSA/ICdyYWRpbycgOiAnY2hlY2tib3gnO1xyXG5cclxuICAgICAgICAgICAgaWYgKCRlbG0uaXMoJ29wdGlvbicpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAkZWxtLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0aGF0Lm9wdGlvbnMudGV4dFRlbXBsYXRlKCRlbG0pLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gJGVsbS5wcm9wKCdzZWxlY3RlZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlID0gc3ByaW50Zignc3R5bGU9XCIlc1wiJywgdGhpcy5vcHRpb25zLnN0eWxlcih2YWx1ZSkpLFxyXG4gICAgICAgICAgICAgICAgICAgICRlbDtcclxuXHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZCA9IGdyb3VwRGlzYWJsZWQgfHwgJGVsbS5wcm9wKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICRlbCA9ICQoW1xyXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxsaSBjbGFzcz1cIiVzICVzXCIgJXMgJXM+JywgbXVsdGlwbGUsIGNsYXNzZXMsIHRpdGxlLCBzdHlsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGxhYmVsIGNsYXNzPVwiJXNcIj4nLCBkaXNhYmxlZCA/ICdkaXNhYmxlZCcgOiAnJyksXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGlucHV0IHR5cGU9XCIlc1wiICVzJXMlcyVzPicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUsIHRoaXMuc2VsZWN0SXRlbU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkID8gJyBjaGVja2VkPVwiY2hlY2tlZFwiJyA6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZCA/ICcgZGlzYWJsZWQ9XCJkaXNhYmxlZFwiJyA6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCcgZGF0YS1ncm91cD1cIiVzXCInLCBncm91cCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxzcGFuPiVzPC9zcGFuPicsIHRleHQpLFxyXG4gICAgICAgICAgICAgICAgICAgICc8L2xhYmVsPicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvbGk+J1xyXG4gICAgICAgICAgICAgICAgXS5qb2luKCcnKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgnaW5wdXQnKS52YWwodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRlbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJGVsbS5pcygnb3B0Z3JvdXAnKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gdGhhdC5vcHRpb25zLmxhYmVsVGVtcGxhdGUoJGVsbSksXHJcbiAgICAgICAgICAgICAgICAgICAgJGdyb3VwID0gJCgnPGRpdi8+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgZ3JvdXAgPSAnZ3JvdXBfJyArIGk7XHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZCA9ICRlbG0ucHJvcCgnZGlzYWJsZWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkZ3JvdXAuYXBwZW5kKFtcclxuICAgICAgICAgICAgICAgICAgICAnPGxpIGNsYXNzPVwiZ3JvdXBcIj4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxsYWJlbCBjbGFzcz1cIm9wdGdyb3VwICVzXCIgZGF0YS1ncm91cD1cIiVzXCI+JywgZGlzYWJsZWQgPyAnZGlzYWJsZWQnIDogJycsIGdyb3VwKSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuaGlkZU9wdGdyb3VwQ2hlY2tib3hlcyB8fCB0aGlzLm9wdGlvbnMuc2luZ2xlID8gJycgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgJXMgJXM+JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RHcm91cE5hbWUsIGRpc2FibGVkID8gJ2Rpc2FibGVkPVwiZGlzYWJsZWRcIicgOiAnJyksXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvbGFiZWw+JyxcclxuICAgICAgICAgICAgICAgICAgICAnPC9saT4nXHJcbiAgICAgICAgICAgICAgICBdLmpvaW4oJycpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmVhY2goJGVsbS5jaGlsZHJlbigpLCBmdW5jdGlvbiAoaSwgZWxtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGdyb3VwLmFwcGVuZCh0aGF0Lm9wdGlvblRvSHRtbChpLCBlbG0sIGdyb3VwLCBkaXNhYmxlZCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGdyb3VwLmh0bWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGV2ZW50czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB0b2dnbGVPcGVuID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdFt0aGF0Lm9wdGlvbnMuaXNPcGVuID8gJ2Nsb3NlJyA6ICdvcGVuJ10oKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy4kbGFiZWwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGxhYmVsLm9mZignY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnbGFiZWwnIHx8IGUudGFyZ2V0ICE9PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlT3BlbihlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5maWx0ZXIgfHwgIXRoYXQub3B0aW9ucy5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpOyAvLyBDYXVzZXMgbG9zdCBmb2N1cyBvdGhlcndpc2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2Uub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIHRvZ2dsZU9wZW4pXHJcbiAgICAgICAgICAgICAgICAub2ZmKCdmb2N1cycpLm9uKCdmb2N1cycsIHRoaXMub3B0aW9ucy5vbkZvY3VzKVxyXG4gICAgICAgICAgICAgICAgLm9mZignYmx1cicpLm9uKCdibHVyJywgdGhpcy5vcHRpb25zLm9uQmx1cik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRwYXJlbnQub2ZmKCdrZXlkb3duJykub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyNzogLy8gZXNjIGtleVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuJGNob2ljZS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRzZWFyY2hJbnB1dC5vZmYoJ2tleWRvd24nKS5vbigna2V5ZG93bicsZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIEVuc3VyZSBzaGlmdC10YWIgY2F1c2VzIGxvc3QgZm9jdXMgZnJvbSBmaWx0ZXIgYXMgd2l0aCBjbGlja2luZyBhd2F5XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSA5ICYmIGUuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLm9mZigna2V5dXAnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZW50ZXIgb3Igc3BhY2VcclxuICAgICAgICAgICAgICAgIC8vIEF2b2lkIHNlbGVjdGluZy9kZXNlbGVjdGluZyBpZiBubyBjaG9pY2VzIG1hZGVcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuZmlsdGVyQWNjZXB0T25FbnRlciAmJiAoZS53aGljaCA9PT0gMTMgfHwgZS53aGljaCA9PSAzMikgJiYgdGhhdC4kc2VhcmNoSW5wdXQudmFsKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RBbGwuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoYXQuZmlsdGVyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLm9mZignY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2hlY2tlZCA9ICQodGhpcykucHJvcCgnY2hlY2tlZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtcyA9IHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcignOnZpc2libGUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoJGl0ZW1zLmxlbmd0aCA9PT0gdGhhdC4kc2VsZWN0SXRlbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdFtjaGVja2VkID8gJ2NoZWNrQWxsJyA6ICd1bmNoZWNrQWxsJ10oKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIHdoZW4gdGhlIGZpbHRlciBvcHRpb24gaXMgdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEdyb3Vwcy5wcm9wKCdjaGVja2VkJywgY2hlY2tlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLnByb3AoJ2NoZWNrZWQnLCBjaGVja2VkKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnNbY2hlY2tlZCA/ICdvbkNoZWNrQWxsJyA6ICdvblVuY2hlY2tBbGwnXSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICQodGhpcykucGFyZW50KCkuYXR0cignZGF0YS1ncm91cCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtcyA9IHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcignOnZpc2libGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4gPSAkaXRlbXMuZmlsdGVyKHNwcmludGYoJ1tkYXRhLWdyb3VwPVwiJXNcIl0nLCBncm91cCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQgPSAkY2hpbGRyZW4ubGVuZ3RoICE9PSAkY2hpbGRyZW4uZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAkY2hpbGRyZW4ucHJvcCgnY2hlY2tlZCcsIGNoZWNrZWQpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGVTZWxlY3RBbGwoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25PcHRncm91cENsaWNrKHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZDogY2hlY2tlZCxcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogJGNoaWxkcmVuLmdldCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlOiB0aGF0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLm9mZignY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZVNlbGVjdEFsbCgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlT3B0R3JvdXBTZWxlY3QoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQub3B0aW9ucy5vbkNsaWNrKHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICQodGhpcykudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZDogJCh0aGlzKS5wcm9wKCdjaGVja2VkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2U6IHRoYXRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuc2luZ2xlICYmIHRoYXQub3B0aW9ucy5pc09wZW4gJiYgIXRoYXQub3B0aW9ucy5rZWVwT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnNpbmdsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjbGlja2VkVmFsID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKHRoaXMpLnZhbCgpICE9PSBjbGlja2VkVmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvcGVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLiRjaG9pY2UuaGFzQ2xhc3MoJ2Rpc2FibGVkJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmZpbmQoJz5kaXYnKS5hZGRDbGFzcygnb3BlbicpO1xyXG4gICAgICAgICAgICB0aGlzLiRkcm9wW3RoaXMuYW5pbWF0ZU1ldGhvZCgnc2hvdycpXSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gZml4IGZpbHRlciBidWc6IG5vIHJlc3VsdHMgc2hvd1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gRml4ICM3NzogJ0FsbCBzZWxlY3RlZCcgd2hlbiBubyBvcHRpb25zXHJcbiAgICAgICAgICAgIGlmICghdGhpcy4kZWwuY2hpbGRyZW4oKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuJGRyb3Aub2Zmc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkcm9wLmFwcGVuZFRvKCQodGhpcy5vcHRpb25zLmNvbnRhaW5lcikpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5vZmZzZXQoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogb2Zmc2V0LnRvcCxcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWFyY2hJbnB1dC52YWwoJycpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VhcmNoSW5wdXQuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uT3BlbigpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNsb3NlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmZpbmQoJz5kaXYnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAgICAgICB0aGlzLiRkcm9wW3RoaXMuYW5pbWF0ZU1ldGhvZCgnaGlkZScpXSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kcGFyZW50LmFwcGVuZCh0aGlzLiRkcm9wKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRyb3AuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAndG9wJzogJ2F1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgICdsZWZ0JzogJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25DbG9zZSgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFuaW1hdGVNZXRob2Q6IGZ1bmN0aW9uIChtZXRob2QpIHtcclxuICAgICAgICAgICAgdmFyIG1ldGhvZHMgPSB7XHJcbiAgICAgICAgICAgICAgICBzaG93OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFkZTogJ2ZhZGVJbicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGU6ICdzbGlkZURvd24nXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaGlkZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGZhZGU6ICdmYWRlT3V0JyxcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZTogJ3NsaWRlVXAnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kc1ttZXRob2RdW3RoaXMub3B0aW9ucy5hbmltYXRlXSB8fCBtZXRob2Q7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAoaXNJbml0KSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RzID0gdGhpcy5vcHRpb25zLmRpc3BsYXlWYWx1ZXMgPyB0aGlzLmdldFNlbGVjdHMoKSA6IHRoaXMuZ2V0U2VsZWN0cygndGV4dCcpLFxyXG4gICAgICAgICAgICAgICAgJHNwYW4gPSB0aGlzLiRjaG9pY2UuZmluZCgnPnNwYW4nKSxcclxuICAgICAgICAgICAgICAgIHNsID0gc2VsZWN0cy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2wgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICRzcGFuLmFkZENsYXNzKCdwbGFjZWhvbGRlcicpLmh0bWwodGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuYWxsU2VsZWN0ZWQgJiYgc2wgPT09IHRoaXMuJHNlbGVjdEl0ZW1zLmxlbmd0aCArIHRoaXMuJGRpc2FibGVJdGVtcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLmh0bWwodGhpcy5vcHRpb25zLmFsbFNlbGVjdGVkKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZWxsaXBzaXMgJiYgc2wgPiB0aGlzLm9wdGlvbnMubWluaW11bUNvdW50U2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLnRleHQoc2VsZWN0cy5zbGljZSgwLCB0aGlzLm9wdGlvbnMubWluaW11bUNvdW50U2VsZWN0ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4odGhpcy5vcHRpb25zLmRlbGltaXRlcikgKyAnLi4uJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmNvdW50U2VsZWN0ZWQgJiYgc2wgPiB0aGlzLm9wdGlvbnMubWluaW11bUNvdW50U2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLmh0bWwodGhpcy5vcHRpb25zLmNvdW50U2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgnIycsIHNlbGVjdHMubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCclJywgdGhpcy4kc2VsZWN0SXRlbXMubGVuZ3RoICsgdGhpcy4kZGlzYWJsZUl0ZW1zLmxlbmd0aCkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJHNwYW4ucmVtb3ZlQ2xhc3MoJ3BsYWNlaG9sZGVyJykudGV4dChzZWxlY3RzLmpvaW4odGhpcy5vcHRpb25zLmRlbGltaXRlcikpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFkZFRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICAkc3Bhbi5wcm9wKCd0aXRsZScsIHRoaXMuZ2V0U2VsZWN0cygndGV4dCcpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gc2V0IHNlbGVjdHMgdG8gc2VsZWN0XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLnZhbCh0aGlzLmdldFNlbGVjdHMoKSkudHJpZ2dlcignY2hhbmdlJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgc2VsZWN0ZWQgY2xhc3MgdG8gc2VsZWN0ZWQgbGlcclxuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoJ2lucHV0OmNoZWNrZWQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50cygnbGknKS5maXJzdCgpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIHRyaWdnZXIgPHNlbGVjdD4gY2hhbmdlIGV2ZW50XHJcbiAgICAgICAgICAgIGlmICghaXNJbml0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHVwZGF0ZVNlbGVjdEFsbDogZnVuY3Rpb24gKGlzSW5pdCkge1xyXG4gICAgICAgICAgICB2YXIgJGl0ZW1zID0gdGhpcy4kc2VsZWN0SXRlbXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWlzSW5pdCkge1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zID0gJGl0ZW1zLmZpbHRlcignOnZpc2libGUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucHJvcCgnY2hlY2tlZCcsICRpdGVtcy5sZW5ndGggJiZcclxuICAgICAgICAgICAgICAgICRpdGVtcy5sZW5ndGggPT09ICRpdGVtcy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcclxuICAgICAgICAgICAgaWYgKCFpc0luaXQgJiYgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2hlY2tBbGwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHVwZGF0ZU9wdEdyb3VwU2VsZWN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkaXRlbXMgPSB0aGlzLiRzZWxlY3RJdGVtcy5maWx0ZXIoJzp2aXNpYmxlJyk7XHJcbiAgICAgICAgICAgICQuZWFjaCh0aGlzLiRzZWxlY3RHcm91cHMsIGZ1bmN0aW9uIChpLCB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICQodmFsKS5wYXJlbnQoKS5hdHRyKCdkYXRhLWdyb3VwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuID0gJGl0ZW1zLmZpbHRlcihzcHJpbnRmKCdbZGF0YS1ncm91cD1cIiVzXCJdJywgZ3JvdXApKTtcclxuICAgICAgICAgICAgICAgICQodmFsKS5wcm9wKCdjaGVja2VkJywgJGNoaWxkcmVuLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbi5sZW5ndGggPT09ICRjaGlsZHJlbi5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy92YWx1ZSBvciB0ZXh0LCBkZWZhdWx0OiAndmFsdWUnXHJcbiAgICAgICAgZ2V0U2VsZWN0czogZnVuY3Rpb24gKHR5cGUpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgdGV4dHMgPSBbXSxcclxuICAgICAgICAgICAgICAgIHZhbHVlcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoc3ByaW50ZignaW5wdXRbJXNdOmNoZWNrZWQnLCB0aGlzLnNlbGVjdEl0ZW1OYW1lKSkuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0cy5wdXNoKCQodGhpcykucGFyZW50cygnbGknKS5maXJzdCgpLnRleHQoKSk7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZXMucHVzaCgkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3RleHQnICYmIHRoaXMuJHNlbGVjdEdyb3Vwcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRleHRzID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9ICQudHJpbSgkKHRoaXMpLnBhcmVudCgpLnRleHQoKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwID0gJCh0aGlzKS5wYXJlbnQoKS5kYXRhKCdncm91cCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4gPSB0aGF0LiRkcm9wLmZpbmQoc3ByaW50ZignWyVzXVtkYXRhLWdyb3VwPVwiJXNcIl0nLCB0aGF0LnNlbGVjdEl0ZW1OYW1lLCBncm91cCkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2VsZWN0ZWQgPSAkY2hpbGRyZW4uZmlsdGVyKCc6Y2hlY2tlZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoISRzZWxlY3RlZC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKCdbJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkY2hpbGRyZW4ubGVuZ3RoID4gJHNlbGVjdGVkLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2VsZWN0ZWQuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKCc6ICcgKyBsaXN0LmpvaW4oJywgJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2goJ10nKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0cy5wdXNoKGh0bWwuam9pbignJykpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHR5cGUgPT09ICd0ZXh0JyA/IHRleHRzIDogdmFsdWVzO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldFNlbGVjdHM6IGZ1bmN0aW9uICh2YWx1ZXMpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLiRkaXNhYmxlSXRlbXMucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgJC5lYWNoKHZhbHVlcywgZnVuY3Rpb24gKGksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoc3ByaW50ZignW3ZhbHVlPVwiJXNcIl0nLCB2YWx1ZSkpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuJGRpc2FibGVJdGVtcy5maWx0ZXIoc3ByaW50ZignW3ZhbHVlPVwiJXNcIl0nLCB2YWx1ZSkpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgdGhpcy4kc2VsZWN0SXRlbXMubGVuZ3RoID09PVxyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCArIHRoaXMuJGRpc2FibGVJdGVtcy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICQuZWFjaCh0aGF0LiRzZWxlY3RHcm91cHMsIGZ1bmN0aW9uIChpLCB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICQodmFsKS5wYXJlbnQoKS5hdHRyKCdkYXRhLWdyb3VwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuID0gdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKCdbZGF0YS1ncm91cD1cIicgKyBncm91cCArICdcIl0nKTtcclxuICAgICAgICAgICAgICAgICQodmFsKS5wcm9wKCdjaGVja2VkJywgJGNoaWxkcmVuLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbi5sZW5ndGggPT09ICRjaGlsZHJlbi5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY2hlY2tBbGw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25DaGVja0FsbCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHVuY2hlY2tBbGw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25VbmNoZWNrQWxsKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZm9jdXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkZvY3VzKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYmx1cjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuYmx1cigpO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25CbHVyKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcmVmcmVzaDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB9LFxyXG5cdFx0XHJcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuJHBhcmVudC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy4kZWwuZGF0YSgnbXVsdGlwbGVTZWxlY3QnLCBudWxsKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgdGV4dCA9ICQudHJpbSh0aGlzLiRzZWFyY2hJbnB1dC52YWwoKSkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLnBhcmVudCgpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcy5wYXJlbnQoKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMucGFyZW50KCkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkcGFyZW50W3JlbW92ZURpYWNyaXRpY3MoJHBhcmVudC50ZXh0KCkudG9Mb3dlckNhc2UoKSkuaW5kZXhPZihyZW1vdmVEaWFjcml0aWNzKHRleHQpKSA8IDAgPyAnaGlkZScgOiAnc2hvdyddKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcy5wYXJlbnQoKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICRwYXJlbnQuYXR0cignZGF0YS1ncm91cCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMgPSB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoJzp2aXNpYmxlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBhcmVudFskaXRlbXMuZmlsdGVyKHNwcmludGYoJ1tkYXRhLWdyb3VwPVwiJXNcIl0nLCBncm91cCkpLmxlbmd0aCA/ICdzaG93JyA6ICdoaWRlJ10oKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgbm8gbWF0Y2hlcyBmb3VuZFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJHNlbGVjdEl0ZW1zLnBhcmVudCgpLmZpbHRlcignOnZpc2libGUnKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJG5vUmVzdWx0cy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU9wdEdyb3VwU2VsZWN0KCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0QWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkZpbHRlcih0ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICQuZm4ubXVsdGlwbGVTZWxlY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50c1swXSxcclxuICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50cyxcclxuXHJcbiAgICAgICAgICAgIHZhbHVlLFxyXG4gICAgICAgICAgICBhbGxvd2VkTWV0aG9kcyA9IFtcclxuICAgICAgICAgICAgICAgICdnZXRTZWxlY3RzJywgJ3NldFNlbGVjdHMnLFxyXG4gICAgICAgICAgICAgICAgJ2VuYWJsZScsICdkaXNhYmxlJyxcclxuICAgICAgICAgICAgICAgICdvcGVuJywgJ2Nsb3NlJyxcclxuICAgICAgICAgICAgICAgICdjaGVja0FsbCcsICd1bmNoZWNrQWxsJyxcclxuICAgICAgICAgICAgICAgICdmb2N1cycsICdibHVyJyxcclxuICAgICAgICAgICAgICAgICdyZWZyZXNoJywgJ2Rlc3Ryb3knXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBkYXRhID0gJHRoaXMuZGF0YSgnbXVsdGlwbGVTZWxlY3QnKSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgJC5mbi5tdWx0aXBsZVNlbGVjdC5kZWZhdWx0cyxcclxuICAgICAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKCksIHR5cGVvZiBvcHRpb24gPT09ICdvYmplY3QnICYmIG9wdGlvbik7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBuZXcgTXVsdGlwbGVTZWxlY3QoJHRoaXMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnbXVsdGlwbGVTZWxlY3QnLCBkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJC5pbkFycmF5KG9wdGlvbiwgYWxsb3dlZE1ldGhvZHMpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdVbmtub3duIG1ldGhvZDogJyArIG9wdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhbHVlID0gZGF0YVtvcHRpb25dKGFyZ3NbMV0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5pbml0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXJnc1sxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gZGF0YVthcmdzWzFdXS5hcHBseShkYXRhLCBbXS5zbGljZS5jYWxsKGFyZ3MsIDIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJyA/IHZhbHVlIDogdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgJC5mbi5tdWx0aXBsZVNlbGVjdC5kZWZhdWx0cyA9IHtcclxuICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICBpc09wZW46IGZhbHNlLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnJyxcclxuICAgICAgICBzZWxlY3RBbGw6IHRydWUsXHJcbiAgICAgICAgc2VsZWN0QWxsRGVsaW1pdGVyOiBbJ1snLCAnXSddLFxyXG4gICAgICAgIG1pbmltdW1Db3VudFNlbGVjdGVkOiAzLFxyXG4gICAgICAgIGVsbGlwc2lzOiBmYWxzZSxcclxuICAgICAgICBtdWx0aXBsZTogZmFsc2UsXHJcbiAgICAgICAgbXVsdGlwbGVXaWR0aDogODAsXHJcbiAgICAgICAgc2luZ2xlOiBmYWxzZSxcclxuICAgICAgICBmaWx0ZXI6IGZhbHNlLFxyXG4gICAgICAgIHdpZHRoOiB1bmRlZmluZWQsXHJcbiAgICAgICAgZHJvcFdpZHRoOiB1bmRlZmluZWQsXHJcbiAgICAgICAgbWF4SGVpZ2h0OiAyNTAsXHJcbiAgICAgICAgY29udGFpbmVyOiBudWxsLFxyXG4gICAgICAgIHBvc2l0aW9uOiAnYm90dG9tJyxcclxuICAgICAgICBrZWVwT3BlbjogZmFsc2UsXHJcbiAgICAgICAgYW5pbWF0ZTogJ25vbmUnLCAvLyAnbm9uZScsICdmYWRlJywgJ3NsaWRlJ1xyXG4gICAgICAgIGRpc3BsYXlWYWx1ZXM6IGZhbHNlLFxyXG4gICAgICAgIGRlbGltaXRlcjogJywgJyxcclxuICAgICAgICBhZGRUaXRsZTogZmFsc2UsXHJcbiAgICAgICAgZmlsdGVyQWNjZXB0T25FbnRlcjogZmFsc2UsXHJcbiAgICAgICAgaGlkZU9wdGdyb3VwQ2hlY2tib3hlczogZmFsc2UsXHJcblxyXG4gICAgICAgIHNlbGVjdEFsbFRleHQ6ICdTZWxlY3QgYWxsJyxcclxuICAgICAgICBhbGxTZWxlY3RlZDogJ0FsbCBzZWxlY3RlZCcsXHJcbiAgICAgICAgY291bnRTZWxlY3RlZDogJyMgb2YgJSBzZWxlY3RlZCcsXHJcbiAgICAgICAgbm9NYXRjaGVzRm91bmQ6ICdObyBtYXRjaGVzIGZvdW5kJyxcclxuXHJcbiAgICAgICAgc3R5bGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRleHRUZW1wbGF0ZTogZnVuY3Rpb24gKCRlbG0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICRlbG0uaHRtbCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGFiZWxUZW1wbGF0ZTogZnVuY3Rpb24gKCRlbG0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICRlbG0uYXR0cignbGFiZWwnKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbk9wZW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25DbG9zZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkNoZWNrQWxsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uVW5jaGVja0FsbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uQmx1cjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbk9wdGdyb3VwQ2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkZpbHRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgJCgnc2VsZWN0W211bHRpcGxlXScpLm11bHRpcGxlU2VsZWN0KCk7XHJcbn0pKGpRdWVyeSk7XHJcbiJdfQ==
