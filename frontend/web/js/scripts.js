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
    var code = 'ru-RU';
    var key = 'ru';
    var url_prefix ='ru';

    var elem = $("#sd_lang_list");
    if (elem) {
        code = $(elem).data('code') ? $(elem).data('code') : code;
        key = $(elem).data('key') ? $(elem).data('key') : key;
        url_prefix = $(elem).data('url-prefix') ? $(elem).data('url-prefix') : url_prefix;
    }

    return {
        code: code,
        key: key,
        href_prefix: url_prefix
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
  if (href.indexOf('store') > 0 || href.indexOf('shop')>0 || href.indexOf('coupon') > 0 || href.indexOf('url(') > 0) {
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

function sd_accordeon() {

    var accordionControl = $('.accordion .accordion-control');

    accordionControl.on('click', function (e) {
        e.preventDefault();
        $this = $(this);
        $accordion = $this.closest('.accordion');


        if ($accordion.find('.accordion-title').hasClass('accordion-title-disabled')) return;

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
        if ($this.hasClass('angle-up')) return;
        e.stopPropagation()
    });

    (function () {
        var els = $('.accordion_more');

        function addButton(el, className, title) {
            var buttons = $(el).find('.' + className);
            if (buttons.length === 0) {
                var button = $('<div>').addClass(className).addClass('accordion_more_button');
                var a = $('<a>').attr('href', "").addClass('blue').html(title);
                $(button).append(a);
                $(el).append(button);
            }
        }

        $('body').on('click', '.accordion_more_button_more', function (e) {
            e.preventDefault();
            $(this).closest('.accordion_more').addClass('open');
        });
        $('body').on('click', '.accordion_more_button_less', function (e) {
            e.preventDefault();
            $(this).closest('.accordion_more').removeClass('open');
        });


        function rebuild() {
            $(els).each(function (key, item) {
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

        document.addEventListener('language_loaded', function () {
            rebuild();
        }, false);

    })();

//фильтр производителей - фильтрация элементов
    $('#catalog_product_filter-input').keyup(function () {

        var val = $(this).val().length > 2 ? $(this).val().toUpperCase() : false;
        var openCount = 0;
        var list = $(this).closest('.catalog_product_filter-items-item-checkbox');
        if (!val) {
            $(list).removeClass('accordion_hide');
        }
        $('.catalog_product_filter-checkbox_item').each(function (index, item) {
            var name = $(item).find('label').text();
            if (!val) {
                $(item).removeClass('hide');
            } else {
                name = name.substring(0, val.length).toUpperCase();
                if (name == val) {
                    $(item).removeClass('hide');
                    openCount++;
                } else {
                    $(item).addClass('hide');
                }
            }
        });
        if (val && openCount <= 10) {
            $(list).addClass('accordion_hide');
        }

    });

}
sd_accordeon();




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
/*! jQuery UI - v1.12.1 - 2018-12-20
* http://jqueryui.com
* Includes: widget.js, position.js, form-reset-mixin.js, keycode.js, labels.js, unique-id.js, widgets/autocomplete.js, widgets/datepicker.js, widgets/menu.js, widgets/mouse.js, widgets/selectmenu.js, widgets/slider.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

(function(t){"function"==typeof define&&define.amd?define(["jquery"],t):t(jQuery)})(function(t){function e(t){for(var e,i;t.length&&t[0]!==document;){if(e=t.css("position"),("absolute"===e||"relative"===e||"fixed"===e)&&(i=parseInt(t.css("zIndex"),10),!isNaN(i)&&0!==i))return i;t=t.parent()}return 0}function i(){this._curInst=null,this._keyEvent=!1,this._disabledInputs=[],this._datepickerShowing=!1,this._inDialog=!1,this._mainDivId="ui-datepicker-div",this._inlineClass="ui-datepicker-inline",this._appendClass="ui-datepicker-append",this._triggerClass="ui-datepicker-trigger",this._dialogClass="ui-datepicker-dialog",this._disableClass="ui-datepicker-disabled",this._unselectableClass="ui-datepicker-unselectable",this._currentClass="ui-datepicker-current-day",this._dayOverClass="ui-datepicker-days-cell-over",this.regional=[],this.regional[""]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:!1,showMonthAfterYear:!1,yearSuffix:""},this._defaults={showOn:"focus",showAnim:"fadeIn",showOptions:{},defaultDate:null,appendText:"",buttonText:"...",buttonImage:"",buttonImageOnly:!1,hideIfNoPrevNext:!1,navigationAsDateFormat:!1,gotoCurrent:!1,changeMonth:!1,changeYear:!1,yearRange:"c-10:c+10",showOtherMonths:!1,selectOtherMonths:!1,showWeek:!1,calculateWeek:this.iso8601Week,shortYearCutoff:"+10",minDate:null,maxDate:null,duration:"fast",beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:"",altFormat:"",constrainInput:!0,showButtonPanel:!1,autoSize:!1,disabled:!1},t.extend(this._defaults,this.regional[""]),this.regional.en=t.extend(!0,{},this.regional[""]),this.regional["en-US"]=t.extend(!0,{},this.regional.en),this.dpDiv=s(t("<div id='"+this._mainDivId+"' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"))}function s(e){var i="button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";return e.on("mouseout",i,function(){t(this).removeClass("ui-state-hover"),-1!==this.className.indexOf("ui-datepicker-prev")&&t(this).removeClass("ui-datepicker-prev-hover"),-1!==this.className.indexOf("ui-datepicker-next")&&t(this).removeClass("ui-datepicker-next-hover")}).on("mouseover",i,n)}function n(){t.datepicker._isDisabledDatepicker(l.inline?l.dpDiv.parent()[0]:l.input[0])||(t(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover"),t(this).addClass("ui-state-hover"),-1!==this.className.indexOf("ui-datepicker-prev")&&t(this).addClass("ui-datepicker-prev-hover"),-1!==this.className.indexOf("ui-datepicker-next")&&t(this).addClass("ui-datepicker-next-hover"))}function o(e,i){t.extend(e,i);for(var s in i)null==i[s]&&(e[s]=i[s]);return e}t.ui=t.ui||{},t.ui.version="1.12.1";var a=0,r=Array.prototype.slice;t.cleanData=function(e){return function(i){var s,n,o;for(o=0;null!=(n=i[o]);o++)try{s=t._data(n,"events"),s&&s.remove&&t(n).triggerHandler("remove")}catch(a){}e(i)}}(t.cleanData),t.widget=function(e,i,s){var n,o,a,r={},l=e.split(".")[0];e=e.split(".")[1];var h=l+"-"+e;return s||(s=i,i=t.Widget),t.isArray(s)&&(s=t.extend.apply(null,[{}].concat(s))),t.expr[":"][h.toLowerCase()]=function(e){return!!t.data(e,h)},t[l]=t[l]||{},n=t[l][e],o=t[l][e]=function(t,e){return this._createWidget?(arguments.length&&this._createWidget(t,e),void 0):new o(t,e)},t.extend(o,n,{version:s.version,_proto:t.extend({},s),_childConstructors:[]}),a=new i,a.options=t.widget.extend({},a.options),t.each(s,function(e,s){return t.isFunction(s)?(r[e]=function(){function t(){return i.prototype[e].apply(this,arguments)}function n(t){return i.prototype[e].apply(this,t)}return function(){var e,i=this._super,o=this._superApply;return this._super=t,this._superApply=n,e=s.apply(this,arguments),this._super=i,this._superApply=o,e}}(),void 0):(r[e]=s,void 0)}),o.prototype=t.widget.extend(a,{widgetEventPrefix:n?a.widgetEventPrefix||e:e},r,{constructor:o,namespace:l,widgetName:e,widgetFullName:h}),n?(t.each(n._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,o,i._proto)}),delete n._childConstructors):i._childConstructors.push(o),t.widget.bridge(e,o),o},t.widget.extend=function(e){for(var i,s,n=r.call(arguments,1),o=0,a=n.length;a>o;o++)for(i in n[o])s=n[o][i],n[o].hasOwnProperty(i)&&void 0!==s&&(e[i]=t.isPlainObject(s)?t.isPlainObject(e[i])?t.widget.extend({},e[i],s):t.widget.extend({},s):s);return e},t.widget.bridge=function(e,i){var s=i.prototype.widgetFullName||e;t.fn[e]=function(n){var o="string"==typeof n,a=r.call(arguments,1),l=this;return o?this.length||"instance"!==n?this.each(function(){var i,o=t.data(this,s);return"instance"===n?(l=o,!1):o?t.isFunction(o[n])&&"_"!==n.charAt(0)?(i=o[n].apply(o,a),i!==o&&void 0!==i?(l=i&&i.jquery?l.pushStack(i.get()):i,!1):void 0):t.error("no such method '"+n+"' for "+e+" widget instance"):t.error("cannot call methods on "+e+" prior to initialization; "+"attempted to call method '"+n+"'")}):l=void 0:(a.length&&(n=t.widget.extend.apply(null,[n].concat(a))),this.each(function(){var e=t.data(this,s);e?(e.option(n||{}),e._init&&e._init()):t.data(this,s,new i(n,this))})),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{classes:{},disabled:!1,create:null},_createWidget:function(e,i){i=t(i||this.defaultElement||this)[0],this.element=t(i),this.uuid=a++,this.eventNamespace="."+this.widgetName+this.uuid,this.bindings=t(),this.hoverable=t(),this.focusable=t(),this.classesElementLookup={},i!==this&&(t.data(i,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===i&&this.destroy()}}),this.document=t(i.style?i.ownerDocument:i.document||i),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this.options=t.widget.extend({},this.options,this._getCreateOptions(),e),this._create(),this.options.disabled&&this._setOptionDisabled(this.options.disabled),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:function(){return{}},_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){var e=this;this._destroy(),t.each(this.classesElementLookup,function(t,i){e._removeClass(i,t)}),this.element.off(this.eventNamespace).removeData(this.widgetFullName),this.widget().off(this.eventNamespace).removeAttr("aria-disabled"),this.bindings.off(this.eventNamespace)},_destroy:t.noop,widget:function(){return this.element},option:function(e,i){var s,n,o,a=e;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof e)if(a={},s=e.split("."),e=s.shift(),s.length){for(n=a[e]=t.widget.extend({},this.options[e]),o=0;s.length-1>o;o++)n[s[o]]=n[s[o]]||{},n=n[s[o]];if(e=s.pop(),1===arguments.length)return void 0===n[e]?null:n[e];n[e]=i}else{if(1===arguments.length)return void 0===this.options[e]?null:this.options[e];a[e]=i}return this._setOptions(a),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return"classes"===t&&this._setOptionClasses(e),this.options[t]=e,"disabled"===t&&this._setOptionDisabled(e),this},_setOptionClasses:function(e){var i,s,n;for(i in e)n=this.classesElementLookup[i],e[i]!==this.options.classes[i]&&n&&n.length&&(s=t(n.get()),this._removeClass(n,i),s.addClass(this._classes({element:s,keys:i,classes:e,add:!0})))},_setOptionDisabled:function(t){this._toggleClass(this.widget(),this.widgetFullName+"-disabled",null,!!t),t&&(this._removeClass(this.hoverable,null,"ui-state-hover"),this._removeClass(this.focusable,null,"ui-state-focus"))},enable:function(){return this._setOptions({disabled:!1})},disable:function(){return this._setOptions({disabled:!0})},_classes:function(e){function i(i,o){var a,r;for(r=0;i.length>r;r++)a=n.classesElementLookup[i[r]]||t(),a=e.add?t(t.unique(a.get().concat(e.element.get()))):t(a.not(e.element).get()),n.classesElementLookup[i[r]]=a,s.push(i[r]),o&&e.classes[i[r]]&&s.push(e.classes[i[r]])}var s=[],n=this;return e=t.extend({element:this.element,classes:this.options.classes||{}},e),this._on(e.element,{remove:"_untrackClassesElement"}),e.keys&&i(e.keys.match(/\S+/g)||[],!0),e.extra&&i(e.extra.match(/\S+/g)||[]),s.join(" ")},_untrackClassesElement:function(e){var i=this;t.each(i.classesElementLookup,function(s,n){-1!==t.inArray(e.target,n)&&(i.classesElementLookup[s]=t(n.not(e.target).get()))})},_removeClass:function(t,e,i){return this._toggleClass(t,e,i,!1)},_addClass:function(t,e,i){return this._toggleClass(t,e,i,!0)},_toggleClass:function(t,e,i,s){s="boolean"==typeof s?s:i;var n="string"==typeof t||null===t,o={extra:n?e:i,keys:n?t:e,element:n?this.element:t,add:s};return o.element.toggleClass(this._classes(o),s),this},_on:function(e,i,s){var n,o=this;"boolean"!=typeof e&&(s=i,i=e,e=!1),s?(i=n=t(i),this.bindings=this.bindings.add(i)):(s=i,i=this.element,n=this.widget()),t.each(s,function(s,a){function r(){return e||o.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof a?o[a]:a).apply(o,arguments):void 0}"string"!=typeof a&&(r.guid=a.guid=a.guid||r.guid||t.guid++);var l=s.match(/^([\w:-]*)\s*(.*)$/),h=l[1]+o.eventNamespace,c=l[2];c?n.on(h,c,r):i.on(h,r)})},_off:function(e,i){i=(i||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.off(i).off(i),this.bindings=t(this.bindings.not(e).get()),this.focusable=t(this.focusable.not(e).get()),this.hoverable=t(this.hoverable.not(e).get())},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){this._addClass(t(e.currentTarget),null,"ui-state-hover")},mouseleave:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){this._addClass(t(e.currentTarget),null,"ui-state-focus")},focusout:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}}),t.widget,function(){function e(t,e,i){return[parseFloat(t[0])*(u.test(t[0])?e/100:1),parseFloat(t[1])*(u.test(t[1])?i/100:1)]}function i(e,i){return parseInt(t.css(e,i),10)||0}function s(e){var i=e[0];return 9===i.nodeType?{width:e.width(),height:e.height(),offset:{top:0,left:0}}:t.isWindow(i)?{width:e.width(),height:e.height(),offset:{top:e.scrollTop(),left:e.scrollLeft()}}:i.preventDefault?{width:0,height:0,offset:{top:i.pageY,left:i.pageX}}:{width:e.outerWidth(),height:e.outerHeight(),offset:e.offset()}}var n,o=Math.max,a=Math.abs,r=/left|center|right/,l=/top|center|bottom/,h=/[\+\-]\d+(\.[\d]+)?%?/,c=/^\w+/,u=/%$/,d=t.fn.position;t.position={scrollbarWidth:function(){if(void 0!==n)return n;var e,i,s=t("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),o=s.children()[0];return t("body").append(s),e=o.offsetWidth,s.css("overflow","scroll"),i=o.offsetWidth,e===i&&(i=s[0].clientWidth),s.remove(),n=e-i},getScrollInfo:function(e){var i=e.isWindow||e.isDocument?"":e.element.css("overflow-x"),s=e.isWindow||e.isDocument?"":e.element.css("overflow-y"),n="scroll"===i||"auto"===i&&e.width<e.element[0].scrollWidth,o="scroll"===s||"auto"===s&&e.height<e.element[0].scrollHeight;return{width:o?t.position.scrollbarWidth():0,height:n?t.position.scrollbarWidth():0}},getWithinInfo:function(e){var i=t(e||window),s=t.isWindow(i[0]),n=!!i[0]&&9===i[0].nodeType,o=!s&&!n;return{element:i,isWindow:s,isDocument:n,offset:o?t(e).offset():{left:0,top:0},scrollLeft:i.scrollLeft(),scrollTop:i.scrollTop(),width:i.outerWidth(),height:i.outerHeight()}}},t.fn.position=function(n){if(!n||!n.of)return d.apply(this,arguments);n=t.extend({},n);var u,p,f,g,m,_,v=t(n.of),b=t.position.getWithinInfo(n.within),y=t.position.getScrollInfo(b),w=(n.collision||"flip").split(" "),k={};return _=s(v),v[0].preventDefault&&(n.at="left top"),p=_.width,f=_.height,g=_.offset,m=t.extend({},g),t.each(["my","at"],function(){var t,e,i=(n[this]||"").split(" ");1===i.length&&(i=r.test(i[0])?i.concat(["center"]):l.test(i[0])?["center"].concat(i):["center","center"]),i[0]=r.test(i[0])?i[0]:"center",i[1]=l.test(i[1])?i[1]:"center",t=h.exec(i[0]),e=h.exec(i[1]),k[this]=[t?t[0]:0,e?e[0]:0],n[this]=[c.exec(i[0])[0],c.exec(i[1])[0]]}),1===w.length&&(w[1]=w[0]),"right"===n.at[0]?m.left+=p:"center"===n.at[0]&&(m.left+=p/2),"bottom"===n.at[1]?m.top+=f:"center"===n.at[1]&&(m.top+=f/2),u=e(k.at,p,f),m.left+=u[0],m.top+=u[1],this.each(function(){var s,r,l=t(this),h=l.outerWidth(),c=l.outerHeight(),d=i(this,"marginLeft"),_=i(this,"marginTop"),x=h+d+i(this,"marginRight")+y.width,C=c+_+i(this,"marginBottom")+y.height,D=t.extend({},m),T=e(k.my,l.outerWidth(),l.outerHeight());"right"===n.my[0]?D.left-=h:"center"===n.my[0]&&(D.left-=h/2),"bottom"===n.my[1]?D.top-=c:"center"===n.my[1]&&(D.top-=c/2),D.left+=T[0],D.top+=T[1],s={marginLeft:d,marginTop:_},t.each(["left","top"],function(e,i){t.ui.position[w[e]]&&t.ui.position[w[e]][i](D,{targetWidth:p,targetHeight:f,elemWidth:h,elemHeight:c,collisionPosition:s,collisionWidth:x,collisionHeight:C,offset:[u[0]+T[0],u[1]+T[1]],my:n.my,at:n.at,within:b,elem:l})}),n.using&&(r=function(t){var e=g.left-D.left,i=e+p-h,s=g.top-D.top,r=s+f-c,u={target:{element:v,left:g.left,top:g.top,width:p,height:f},element:{element:l,left:D.left,top:D.top,width:h,height:c},horizontal:0>i?"left":e>0?"right":"center",vertical:0>r?"top":s>0?"bottom":"middle"};h>p&&p>a(e+i)&&(u.horizontal="center"),c>f&&f>a(s+r)&&(u.vertical="middle"),u.important=o(a(e),a(i))>o(a(s),a(r))?"horizontal":"vertical",n.using.call(this,t,u)}),l.offset(t.extend(D,{using:r}))})},t.ui.position={fit:{left:function(t,e){var i,s=e.within,n=s.isWindow?s.scrollLeft:s.offset.left,a=s.width,r=t.left-e.collisionPosition.marginLeft,l=n-r,h=r+e.collisionWidth-a-n;e.collisionWidth>a?l>0&&0>=h?(i=t.left+l+e.collisionWidth-a-n,t.left+=l-i):t.left=h>0&&0>=l?n:l>h?n+a-e.collisionWidth:n:l>0?t.left+=l:h>0?t.left-=h:t.left=o(t.left-r,t.left)},top:function(t,e){var i,s=e.within,n=s.isWindow?s.scrollTop:s.offset.top,a=e.within.height,r=t.top-e.collisionPosition.marginTop,l=n-r,h=r+e.collisionHeight-a-n;e.collisionHeight>a?l>0&&0>=h?(i=t.top+l+e.collisionHeight-a-n,t.top+=l-i):t.top=h>0&&0>=l?n:l>h?n+a-e.collisionHeight:n:l>0?t.top+=l:h>0?t.top-=h:t.top=o(t.top-r,t.top)}},flip:{left:function(t,e){var i,s,n=e.within,o=n.offset.left+n.scrollLeft,r=n.width,l=n.isWindow?n.scrollLeft:n.offset.left,h=t.left-e.collisionPosition.marginLeft,c=h-l,u=h+e.collisionWidth-r-l,d="left"===e.my[0]?-e.elemWidth:"right"===e.my[0]?e.elemWidth:0,p="left"===e.at[0]?e.targetWidth:"right"===e.at[0]?-e.targetWidth:0,f=-2*e.offset[0];0>c?(i=t.left+d+p+f+e.collisionWidth-r-o,(0>i||a(c)>i)&&(t.left+=d+p+f)):u>0&&(s=t.left-e.collisionPosition.marginLeft+d+p+f-l,(s>0||u>a(s))&&(t.left+=d+p+f))},top:function(t,e){var i,s,n=e.within,o=n.offset.top+n.scrollTop,r=n.height,l=n.isWindow?n.scrollTop:n.offset.top,h=t.top-e.collisionPosition.marginTop,c=h-l,u=h+e.collisionHeight-r-l,d="top"===e.my[1],p=d?-e.elemHeight:"bottom"===e.my[1]?e.elemHeight:0,f="top"===e.at[1]?e.targetHeight:"bottom"===e.at[1]?-e.targetHeight:0,g=-2*e.offset[1];0>c?(s=t.top+p+f+g+e.collisionHeight-r-o,(0>s||a(c)>s)&&(t.top+=p+f+g)):u>0&&(i=t.top-e.collisionPosition.marginTop+p+f+g-l,(i>0||u>a(i))&&(t.top+=p+f+g))}},flipfit:{left:function(){t.ui.position.flip.left.apply(this,arguments),t.ui.position.fit.left.apply(this,arguments)},top:function(){t.ui.position.flip.top.apply(this,arguments),t.ui.position.fit.top.apply(this,arguments)}}}}(),t.ui.position,t.fn.form=function(){return"string"==typeof this[0].form?this.closest("form"):t(this[0].form)},t.ui.formResetMixin={_formResetHandler:function(){var e=t(this);setTimeout(function(){var i=e.data("ui-form-reset-instances");t.each(i,function(){this.refresh()})})},_bindFormResetHandler:function(){if(this.form=this.element.form(),this.form.length){var t=this.form.data("ui-form-reset-instances")||[];t.length||this.form.on("reset.ui-form-reset",this._formResetHandler),t.push(this),this.form.data("ui-form-reset-instances",t)}},_unbindFormResetHandler:function(){if(this.form.length){var e=this.form.data("ui-form-reset-instances");e.splice(t.inArray(this,e),1),e.length?this.form.data("ui-form-reset-instances",e):this.form.removeData("ui-form-reset-instances").off("reset.ui-form-reset")}}},t.ui.keyCode={BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38},t.ui.escapeSelector=function(){var t=/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g;return function(e){return e.replace(t,"\\$1")}}(),t.fn.labels=function(){var e,i,s,n,o;return this[0].labels&&this[0].labels.length?this.pushStack(this[0].labels):(n=this.eq(0).parents("label"),s=this.attr("id"),s&&(e=this.eq(0).parents().last(),o=e.add(e.length?e.siblings():this.siblings()),i="label[for='"+t.ui.escapeSelector(s)+"']",n=n.add(o.find(i).addBack(i))),this.pushStack(n))},t.fn.extend({uniqueId:function(){var t=0;return function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++t)})}}(),removeUniqueId:function(){return this.each(function(){/^ui-id-\d+$/.test(this.id)&&t(this).removeAttr("id")})}}),t.ui.safeActiveElement=function(t){var e;try{e=t.activeElement}catch(i){e=t.body}return e||(e=t.body),e.nodeName||(e=t.body),e},t.widget("ui.menu",{version:"1.12.1",defaultElement:"<ul>",delay:300,options:{icons:{submenu:"ui-icon-caret-1-e"},items:"> *",menus:"ul",position:{my:"left top",at:"right top"},role:"menu",blur:null,focus:null,select:null},_create:function(){this.activeMenu=this.element,this.mouseHandled=!1,this.element.uniqueId().attr({role:this.options.role,tabIndex:0}),this._addClass("ui-menu","ui-widget ui-widget-content"),this._on({"mousedown .ui-menu-item":function(t){t.preventDefault()},"click .ui-menu-item":function(e){var i=t(e.target),s=t(t.ui.safeActiveElement(this.document[0]));!this.mouseHandled&&i.not(".ui-state-disabled").length&&(this.select(e),e.isPropagationStopped()||(this.mouseHandled=!0),i.has(".ui-menu").length?this.expand(e):!this.element.is(":focus")&&s.closest(".ui-menu").length&&(this.element.trigger("focus",[!0]),this.active&&1===this.active.parents(".ui-menu").length&&clearTimeout(this.timer)))},"mouseenter .ui-menu-item":function(e){if(!this.previousFilter){var i=t(e.target).closest(".ui-menu-item"),s=t(e.currentTarget);i[0]===s[0]&&(this._removeClass(s.siblings().children(".ui-state-active"),null,"ui-state-active"),this.focus(e,s))}},mouseleave:"collapseAll","mouseleave .ui-menu":"collapseAll",focus:function(t,e){var i=this.active||this.element.find(this.options.items).eq(0);e||this.focus(t,i)},blur:function(e){this._delay(function(){var i=!t.contains(this.element[0],t.ui.safeActiveElement(this.document[0]));i&&this.collapseAll(e)})},keydown:"_keydown"}),this.refresh(),this._on(this.document,{click:function(t){this._closeOnDocumentClick(t)&&this.collapseAll(t),this.mouseHandled=!1}})},_destroy:function(){var e=this.element.find(".ui-menu-item").removeAttr("role aria-disabled"),i=e.children(".ui-menu-item-wrapper").removeUniqueId().removeAttr("tabIndex role aria-haspopup");this.element.removeAttr("aria-activedescendant").find(".ui-menu").addBack().removeAttr("role aria-labelledby aria-expanded aria-hidden aria-disabled tabIndex").removeUniqueId().show(),i.children().each(function(){var e=t(this);e.data("ui-menu-submenu-caret")&&e.remove()})},_keydown:function(e){var i,s,n,o,a=!0;switch(e.keyCode){case t.ui.keyCode.PAGE_UP:this.previousPage(e);break;case t.ui.keyCode.PAGE_DOWN:this.nextPage(e);break;case t.ui.keyCode.HOME:this._move("first","first",e);break;case t.ui.keyCode.END:this._move("last","last",e);break;case t.ui.keyCode.UP:this.previous(e);break;case t.ui.keyCode.DOWN:this.next(e);break;case t.ui.keyCode.LEFT:this.collapse(e);break;case t.ui.keyCode.RIGHT:this.active&&!this.active.is(".ui-state-disabled")&&this.expand(e);break;case t.ui.keyCode.ENTER:case t.ui.keyCode.SPACE:this._activate(e);break;case t.ui.keyCode.ESCAPE:this.collapse(e);break;default:a=!1,s=this.previousFilter||"",o=!1,n=e.keyCode>=96&&105>=e.keyCode?""+(e.keyCode-96):String.fromCharCode(e.keyCode),clearTimeout(this.filterTimer),n===s?o=!0:n=s+n,i=this._filterMenuItems(n),i=o&&-1!==i.index(this.active.next())?this.active.nextAll(".ui-menu-item"):i,i.length||(n=String.fromCharCode(e.keyCode),i=this._filterMenuItems(n)),i.length?(this.focus(e,i),this.previousFilter=n,this.filterTimer=this._delay(function(){delete this.previousFilter},1e3)):delete this.previousFilter}a&&e.preventDefault()},_activate:function(t){this.active&&!this.active.is(".ui-state-disabled")&&(this.active.children("[aria-haspopup='true']").length?this.expand(t):this.select(t))},refresh:function(){var e,i,s,n,o,a=this,r=this.options.icons.submenu,l=this.element.find(this.options.menus);this._toggleClass("ui-menu-icons",null,!!this.element.find(".ui-icon").length),s=l.filter(":not(.ui-menu)").hide().attr({role:this.options.role,"aria-hidden":"true","aria-expanded":"false"}).each(function(){var e=t(this),i=e.prev(),s=t("<span>").data("ui-menu-submenu-caret",!0);a._addClass(s,"ui-menu-icon","ui-icon "+r),i.attr("aria-haspopup","true").prepend(s),e.attr("aria-labelledby",i.attr("id"))}),this._addClass(s,"ui-menu","ui-widget ui-widget-content ui-front"),e=l.add(this.element),i=e.find(this.options.items),i.not(".ui-menu-item").each(function(){var e=t(this);a._isDivider(e)&&a._addClass(e,"ui-menu-divider","ui-widget-content")}),n=i.not(".ui-menu-item, .ui-menu-divider"),o=n.children().not(".ui-menu").uniqueId().attr({tabIndex:-1,role:this._itemRole()}),this._addClass(n,"ui-menu-item")._addClass(o,"ui-menu-item-wrapper"),i.filter(".ui-state-disabled").attr("aria-disabled","true"),this.active&&!t.contains(this.element[0],this.active[0])&&this.blur()},_itemRole:function(){return{menu:"menuitem",listbox:"option"}[this.options.role]},_setOption:function(t,e){if("icons"===t){var i=this.element.find(".ui-menu-icon");this._removeClass(i,null,this.options.icons.submenu)._addClass(i,null,e.submenu)}this._super(t,e)},_setOptionDisabled:function(t){this._super(t),this.element.attr("aria-disabled",t+""),this._toggleClass(null,"ui-state-disabled",!!t)},focus:function(t,e){var i,s,n;this.blur(t,t&&"focus"===t.type),this._scrollIntoView(e),this.active=e.first(),s=this.active.children(".ui-menu-item-wrapper"),this._addClass(s,null,"ui-state-active"),this.options.role&&this.element.attr("aria-activedescendant",s.attr("id")),n=this.active.parent().closest(".ui-menu-item").children(".ui-menu-item-wrapper"),this._addClass(n,null,"ui-state-active"),t&&"keydown"===t.type?this._close():this.timer=this._delay(function(){this._close()},this.delay),i=e.children(".ui-menu"),i.length&&t&&/^mouse/.test(t.type)&&this._startOpening(i),this.activeMenu=e.parent(),this._trigger("focus",t,{item:e})},_scrollIntoView:function(e){var i,s,n,o,a,r;this._hasScroll()&&(i=parseFloat(t.css(this.activeMenu[0],"borderTopWidth"))||0,s=parseFloat(t.css(this.activeMenu[0],"paddingTop"))||0,n=e.offset().top-this.activeMenu.offset().top-i-s,o=this.activeMenu.scrollTop(),a=this.activeMenu.height(),r=e.outerHeight(),0>n?this.activeMenu.scrollTop(o+n):n+r>a&&this.activeMenu.scrollTop(o+n-a+r))},blur:function(t,e){e||clearTimeout(this.timer),this.active&&(this._removeClass(this.active.children(".ui-menu-item-wrapper"),null,"ui-state-active"),this._trigger("blur",t,{item:this.active}),this.active=null)},_startOpening:function(t){clearTimeout(this.timer),"true"===t.attr("aria-hidden")&&(this.timer=this._delay(function(){this._close(),this._open(t)},this.delay))},_open:function(e){var i=t.extend({of:this.active},this.options.position);clearTimeout(this.timer),this.element.find(".ui-menu").not(e.parents(".ui-menu")).hide().attr("aria-hidden","true"),e.show().removeAttr("aria-hidden").attr("aria-expanded","true").position(i)},collapseAll:function(e,i){clearTimeout(this.timer),this.timer=this._delay(function(){var s=i?this.element:t(e&&e.target).closest(this.element.find(".ui-menu"));s.length||(s=this.element),this._close(s),this.blur(e),this._removeClass(s.find(".ui-state-active"),null,"ui-state-active"),this.activeMenu=s},this.delay)},_close:function(t){t||(t=this.active?this.active.parent():this.element),t.find(".ui-menu").hide().attr("aria-hidden","true").attr("aria-expanded","false")},_closeOnDocumentClick:function(e){return!t(e.target).closest(".ui-menu").length},_isDivider:function(t){return!/[^\-\u2014\u2013\s]/.test(t.text())},collapse:function(t){var e=this.active&&this.active.parent().closest(".ui-menu-item",this.element);e&&e.length&&(this._close(),this.focus(t,e))},expand:function(t){var e=this.active&&this.active.children(".ui-menu ").find(this.options.items).first();e&&e.length&&(this._open(e.parent()),this._delay(function(){this.focus(t,e)}))},next:function(t){this._move("next","first",t)},previous:function(t){this._move("prev","last",t)},isFirstItem:function(){return this.active&&!this.active.prevAll(".ui-menu-item").length},isLastItem:function(){return this.active&&!this.active.nextAll(".ui-menu-item").length},_move:function(t,e,i){var s;this.active&&(s="first"===t||"last"===t?this.active["first"===t?"prevAll":"nextAll"](".ui-menu-item").eq(-1):this.active[t+"All"](".ui-menu-item").eq(0)),s&&s.length&&this.active||(s=this.activeMenu.find(this.options.items)[e]()),this.focus(i,s)},nextPage:function(e){var i,s,n;return this.active?(this.isLastItem()||(this._hasScroll()?(s=this.active.offset().top,n=this.element.height(),this.active.nextAll(".ui-menu-item").each(function(){return i=t(this),0>i.offset().top-s-n}),this.focus(e,i)):this.focus(e,this.activeMenu.find(this.options.items)[this.active?"last":"first"]())),void 0):(this.next(e),void 0)},previousPage:function(e){var i,s,n;return this.active?(this.isFirstItem()||(this._hasScroll()?(s=this.active.offset().top,n=this.element.height(),this.active.prevAll(".ui-menu-item").each(function(){return i=t(this),i.offset().top-s+n>0}),this.focus(e,i)):this.focus(e,this.activeMenu.find(this.options.items).first())),void 0):(this.next(e),void 0)},_hasScroll:function(){return this.element.outerHeight()<this.element.prop("scrollHeight")},select:function(e){this.active=this.active||t(e.target).closest(".ui-menu-item");var i={item:this.active};this.active.has(".ui-menu").length||this.collapseAll(e,!0),this._trigger("select",e,i)},_filterMenuItems:function(e){var i=e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&"),s=RegExp("^"+i,"i");return this.activeMenu.find(this.options.items).filter(".ui-menu-item").filter(function(){return s.test(t.trim(t(this).children(".ui-menu-item-wrapper").text()))})}}),t.widget("ui.autocomplete",{version:"1.12.1",defaultElement:"<input>",options:{appendTo:null,autoFocus:!1,delay:300,minLength:1,position:{my:"left top",at:"left bottom",collision:"none"},source:null,change:null,close:null,focus:null,open:null,response:null,search:null,select:null},requestIndex:0,pending:0,_create:function(){var e,i,s,n=this.element[0].nodeName.toLowerCase(),o="textarea"===n,a="input"===n;this.isMultiLine=o||!a&&this._isContentEditable(this.element),this.valueMethod=this.element[o||a?"val":"text"],this.isNewMenu=!0,this._addClass("ui-autocomplete-input"),this.element.attr("autocomplete","off"),this._on(this.element,{keydown:function(n){if(this.element.prop("readOnly"))return e=!0,s=!0,i=!0,void 0;e=!1,s=!1,i=!1;var o=t.ui.keyCode;switch(n.keyCode){case o.PAGE_UP:e=!0,this._move("previousPage",n);break;case o.PAGE_DOWN:e=!0,this._move("nextPage",n);break;case o.UP:e=!0,this._keyEvent("previous",n);break;case o.DOWN:e=!0,this._keyEvent("next",n);break;case o.ENTER:this.menu.active&&(e=!0,n.preventDefault(),this.menu.select(n));break;case o.TAB:this.menu.active&&this.menu.select(n);break;case o.ESCAPE:this.menu.element.is(":visible")&&(this.isMultiLine||this._value(this.term),this.close(n),n.preventDefault());break;default:i=!0,this._searchTimeout(n)}},keypress:function(s){if(e)return e=!1,(!this.isMultiLine||this.menu.element.is(":visible"))&&s.preventDefault(),void 0;if(!i){var n=t.ui.keyCode;switch(s.keyCode){case n.PAGE_UP:this._move("previousPage",s);break;case n.PAGE_DOWN:this._move("nextPage",s);break;case n.UP:this._keyEvent("previous",s);break;case n.DOWN:this._keyEvent("next",s)}}},input:function(t){return s?(s=!1,t.preventDefault(),void 0):(this._searchTimeout(t),void 0)},focus:function(){this.selectedItem=null,this.previous=this._value()},blur:function(t){return this.cancelBlur?(delete this.cancelBlur,void 0):(clearTimeout(this.searching),this.close(t),this._change(t),void 0)}}),this._initSource(),this.menu=t("<ul>").appendTo(this._appendTo()).menu({role:null}).hide().menu("instance"),this._addClass(this.menu.element,"ui-autocomplete","ui-front"),this._on(this.menu.element,{mousedown:function(e){e.preventDefault(),this.cancelBlur=!0,this._delay(function(){delete this.cancelBlur,this.element[0]!==t.ui.safeActiveElement(this.document[0])&&this.element.trigger("focus")})},menufocus:function(e,i){var s,n;return this.isNewMenu&&(this.isNewMenu=!1,e.originalEvent&&/^mouse/.test(e.originalEvent.type))?(this.menu.blur(),this.document.one("mousemove",function(){t(e.target).trigger(e.originalEvent)}),void 0):(n=i.item.data("ui-autocomplete-item"),!1!==this._trigger("focus",e,{item:n})&&e.originalEvent&&/^key/.test(e.originalEvent.type)&&this._value(n.value),s=i.item.attr("aria-label")||n.value,s&&t.trim(s).length&&(this.liveRegion.children().hide(),t("<div>").text(s).appendTo(this.liveRegion)),void 0)},menuselect:function(e,i){var s=i.item.data("ui-autocomplete-item"),n=this.previous;this.element[0]!==t.ui.safeActiveElement(this.document[0])&&(this.element.trigger("focus"),this.previous=n,this._delay(function(){this.previous=n,this.selectedItem=s})),!1!==this._trigger("select",e,{item:s})&&this._value(s.value),this.term=this._value(),this.close(e),this.selectedItem=s}}),this.liveRegion=t("<div>",{role:"status","aria-live":"assertive","aria-relevant":"additions"}).appendTo(this.document[0].body),this._addClass(this.liveRegion,null,"ui-helper-hidden-accessible"),this._on(this.window,{beforeunload:function(){this.element.removeAttr("autocomplete")}})},_destroy:function(){clearTimeout(this.searching),this.element.removeAttr("autocomplete"),this.menu.element.remove(),this.liveRegion.remove()},_setOption:function(t,e){this._super(t,e),"source"===t&&this._initSource(),"appendTo"===t&&this.menu.element.appendTo(this._appendTo()),"disabled"===t&&e&&this.xhr&&this.xhr.abort()},_isEventTargetInWidget:function(e){var i=this.menu.element[0];return e.target===this.element[0]||e.target===i||t.contains(i,e.target)},_closeOnClickOutside:function(t){this._isEventTargetInWidget(t)||this.close()
},_appendTo:function(){var e=this.options.appendTo;return e&&(e=e.jquery||e.nodeType?t(e):this.document.find(e).eq(0)),e&&e[0]||(e=this.element.closest(".ui-front, dialog")),e.length||(e=this.document[0].body),e},_initSource:function(){var e,i,s=this;t.isArray(this.options.source)?(e=this.options.source,this.source=function(i,s){s(t.ui.autocomplete.filter(e,i.term))}):"string"==typeof this.options.source?(i=this.options.source,this.source=function(e,n){s.xhr&&s.xhr.abort(),s.xhr=t.ajax({url:i,data:e,dataType:"json",success:function(t){n(t)},error:function(){n([])}})}):this.source=this.options.source},_searchTimeout:function(t){clearTimeout(this.searching),this.searching=this._delay(function(){var e=this.term===this._value(),i=this.menu.element.is(":visible"),s=t.altKey||t.ctrlKey||t.metaKey||t.shiftKey;(!e||e&&!i&&!s)&&(this.selectedItem=null,this.search(null,t))},this.options.delay)},search:function(t,e){return t=null!=t?t:this._value(),this.term=this._value(),t.length<this.options.minLength?this.close(e):this._trigger("search",e)!==!1?this._search(t):void 0},_search:function(t){this.pending++,this._addClass("ui-autocomplete-loading"),this.cancelSearch=!1,this.source({term:t},this._response())},_response:function(){var e=++this.requestIndex;return t.proxy(function(t){e===this.requestIndex&&this.__response(t),this.pending--,this.pending||this._removeClass("ui-autocomplete-loading")},this)},__response:function(t){t&&(t=this._normalize(t)),this._trigger("response",null,{content:t}),!this.options.disabled&&t&&t.length&&!this.cancelSearch?(this._suggest(t),this._trigger("open")):this._close()},close:function(t){this.cancelSearch=!0,this._close(t)},_close:function(t){this._off(this.document,"mousedown"),this.menu.element.is(":visible")&&(this.menu.element.hide(),this.menu.blur(),this.isNewMenu=!0,this._trigger("close",t))},_change:function(t){this.previous!==this._value()&&this._trigger("change",t,{item:this.selectedItem})},_normalize:function(e){return e.length&&e[0].label&&e[0].value?e:t.map(e,function(e){return"string"==typeof e?{label:e,value:e}:t.extend({},e,{label:e.label||e.value,value:e.value||e.label})})},_suggest:function(e){var i=this.menu.element.empty();this._renderMenu(i,e),this.isNewMenu=!0,this.menu.refresh(),i.show(),this._resizeMenu(),i.position(t.extend({of:this.element},this.options.position)),this.options.autoFocus&&this.menu.next(),this._on(this.document,{mousedown:"_closeOnClickOutside"})},_resizeMenu:function(){var t=this.menu.element;t.outerWidth(Math.max(t.width("").outerWidth()+1,this.element.outerWidth()))},_renderMenu:function(e,i){var s=this;t.each(i,function(t,i){s._renderItemData(e,i)})},_renderItemData:function(t,e){return this._renderItem(t,e).data("ui-autocomplete-item",e)},_renderItem:function(e,i){return t("<li>").append(t("<div>").text(i.label)).appendTo(e)},_move:function(t,e){return this.menu.element.is(":visible")?this.menu.isFirstItem()&&/^previous/.test(t)||this.menu.isLastItem()&&/^next/.test(t)?(this.isMultiLine||this._value(this.term),this.menu.blur(),void 0):(this.menu[t](e),void 0):(this.search(null,e),void 0)},widget:function(){return this.menu.element},_value:function(){return this.valueMethod.apply(this.element,arguments)},_keyEvent:function(t,e){(!this.isMultiLine||this.menu.element.is(":visible"))&&(this._move(t,e),e.preventDefault())},_isContentEditable:function(t){if(!t.length)return!1;var e=t.prop("contentEditable");return"inherit"===e?this._isContentEditable(t.parent()):"true"===e}}),t.extend(t.ui.autocomplete,{escapeRegex:function(t){return t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")},filter:function(e,i){var s=RegExp(t.ui.autocomplete.escapeRegex(i),"i");return t.grep(e,function(t){return s.test(t.label||t.value||t)})}}),t.widget("ui.autocomplete",t.ui.autocomplete,{options:{messages:{noResults:"No search results.",results:function(t){return t+(t>1?" results are":" result is")+" available, use up and down arrow keys to navigate."}}},__response:function(e){var i;this._superApply(arguments),this.options.disabled||this.cancelSearch||(i=e&&e.length?this.options.messages.results(e.length):this.options.messages.noResults,this.liveRegion.children().hide(),t("<div>").text(i).appendTo(this.liveRegion))}}),t.ui.autocomplete,t.extend(t.ui,{datepicker:{version:"1.12.1"}});var l;t.extend(i.prototype,{markerClassName:"hasDatepicker",maxRows:4,_widgetDatepicker:function(){return this.dpDiv},setDefaults:function(t){return o(this._defaults,t||{}),this},_attachDatepicker:function(e,i){var s,n,o;s=e.nodeName.toLowerCase(),n="div"===s||"span"===s,e.id||(this.uuid+=1,e.id="dp"+this.uuid),o=this._newInst(t(e),n),o.settings=t.extend({},i||{}),"input"===s?this._connectDatepicker(e,o):n&&this._inlineDatepicker(e,o)},_newInst:function(e,i){var n=e[0].id.replace(/([^A-Za-z0-9_\-])/g,"\\\\$1");return{id:n,input:e,selectedDay:0,selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:i,dpDiv:i?s(t("<div class='"+this._inlineClass+" ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")):this.dpDiv}},_connectDatepicker:function(e,i){var s=t(e);i.append=t([]),i.trigger=t([]),s.hasClass(this.markerClassName)||(this._attachments(s,i),s.addClass(this.markerClassName).on("keydown",this._doKeyDown).on("keypress",this._doKeyPress).on("keyup",this._doKeyUp),this._autoSize(i),t.data(e,"datepicker",i),i.settings.disabled&&this._disableDatepicker(e))},_attachments:function(e,i){var s,n,o,a=this._get(i,"appendText"),r=this._get(i,"isRTL");i.append&&i.append.remove(),a&&(i.append=t("<span class='"+this._appendClass+"'>"+a+"</span>"),e[r?"before":"after"](i.append)),e.off("focus",this._showDatepicker),i.trigger&&i.trigger.remove(),s=this._get(i,"showOn"),("focus"===s||"both"===s)&&e.on("focus",this._showDatepicker),("button"===s||"both"===s)&&(n=this._get(i,"buttonText"),o=this._get(i,"buttonImage"),i.trigger=t(this._get(i,"buttonImageOnly")?t("<img/>").addClass(this._triggerClass).attr({src:o,alt:n,title:n}):t("<button type='button'></button>").addClass(this._triggerClass).html(o?t("<img/>").attr({src:o,alt:n,title:n}):n)),e[r?"before":"after"](i.trigger),i.trigger.on("click",function(){return t.datepicker._datepickerShowing&&t.datepicker._lastInput===e[0]?t.datepicker._hideDatepicker():t.datepicker._datepickerShowing&&t.datepicker._lastInput!==e[0]?(t.datepicker._hideDatepicker(),t.datepicker._showDatepicker(e[0])):t.datepicker._showDatepicker(e[0]),!1}))},_autoSize:function(t){if(this._get(t,"autoSize")&&!t.inline){var e,i,s,n,o=new Date(2009,11,20),a=this._get(t,"dateFormat");a.match(/[DM]/)&&(e=function(t){for(i=0,s=0,n=0;t.length>n;n++)t[n].length>i&&(i=t[n].length,s=n);return s},o.setMonth(e(this._get(t,a.match(/MM/)?"monthNames":"monthNamesShort"))),o.setDate(e(this._get(t,a.match(/DD/)?"dayNames":"dayNamesShort"))+20-o.getDay())),t.input.attr("size",this._formatDate(t,o).length)}},_inlineDatepicker:function(e,i){var s=t(e);s.hasClass(this.markerClassName)||(s.addClass(this.markerClassName).append(i.dpDiv),t.data(e,"datepicker",i),this._setDate(i,this._getDefaultDate(i),!0),this._updateDatepicker(i),this._updateAlternate(i),i.settings.disabled&&this._disableDatepicker(e),i.dpDiv.css("display","block"))},_dialogDatepicker:function(e,i,s,n,a){var r,l,h,c,u,d=this._dialogInst;return d||(this.uuid+=1,r="dp"+this.uuid,this._dialogInput=t("<input type='text' id='"+r+"' style='position: absolute; top: -100px; width: 0px;'/>"),this._dialogInput.on("keydown",this._doKeyDown),t("body").append(this._dialogInput),d=this._dialogInst=this._newInst(this._dialogInput,!1),d.settings={},t.data(this._dialogInput[0],"datepicker",d)),o(d.settings,n||{}),i=i&&i.constructor===Date?this._formatDate(d,i):i,this._dialogInput.val(i),this._pos=a?a.length?a:[a.pageX,a.pageY]:null,this._pos||(l=document.documentElement.clientWidth,h=document.documentElement.clientHeight,c=document.documentElement.scrollLeft||document.body.scrollLeft,u=document.documentElement.scrollTop||document.body.scrollTop,this._pos=[l/2-100+c,h/2-150+u]),this._dialogInput.css("left",this._pos[0]+20+"px").css("top",this._pos[1]+"px"),d.settings.onSelect=s,this._inDialog=!0,this.dpDiv.addClass(this._dialogClass),this._showDatepicker(this._dialogInput[0]),t.blockUI&&t.blockUI(this.dpDiv),t.data(this._dialogInput[0],"datepicker",d),this},_destroyDatepicker:function(e){var i,s=t(e),n=t.data(e,"datepicker");s.hasClass(this.markerClassName)&&(i=e.nodeName.toLowerCase(),t.removeData(e,"datepicker"),"input"===i?(n.append.remove(),n.trigger.remove(),s.removeClass(this.markerClassName).off("focus",this._showDatepicker).off("keydown",this._doKeyDown).off("keypress",this._doKeyPress).off("keyup",this._doKeyUp)):("div"===i||"span"===i)&&s.removeClass(this.markerClassName).empty(),l===n&&(l=null))},_enableDatepicker:function(e){var i,s,n=t(e),o=t.data(e,"datepicker");n.hasClass(this.markerClassName)&&(i=e.nodeName.toLowerCase(),"input"===i?(e.disabled=!1,o.trigger.filter("button").each(function(){this.disabled=!1}).end().filter("img").css({opacity:"1.0",cursor:""})):("div"===i||"span"===i)&&(s=n.children("."+this._inlineClass),s.children().removeClass("ui-state-disabled"),s.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled",!1)),this._disabledInputs=t.map(this._disabledInputs,function(t){return t===e?null:t}))},_disableDatepicker:function(e){var i,s,n=t(e),o=t.data(e,"datepicker");n.hasClass(this.markerClassName)&&(i=e.nodeName.toLowerCase(),"input"===i?(e.disabled=!0,o.trigger.filter("button").each(function(){this.disabled=!0}).end().filter("img").css({opacity:"0.5",cursor:"default"})):("div"===i||"span"===i)&&(s=n.children("."+this._inlineClass),s.children().addClass("ui-state-disabled"),s.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled",!0)),this._disabledInputs=t.map(this._disabledInputs,function(t){return t===e?null:t}),this._disabledInputs[this._disabledInputs.length]=e)},_isDisabledDatepicker:function(t){if(!t)return!1;for(var e=0;this._disabledInputs.length>e;e++)if(this._disabledInputs[e]===t)return!0;return!1},_getInst:function(e){try{return t.data(e,"datepicker")}catch(i){throw"Missing instance data for this datepicker"}},_optionDatepicker:function(e,i,s){var n,a,r,l,h=this._getInst(e);return 2===arguments.length&&"string"==typeof i?"defaults"===i?t.extend({},t.datepicker._defaults):h?"all"===i?t.extend({},h.settings):this._get(h,i):null:(n=i||{},"string"==typeof i&&(n={},n[i]=s),h&&(this._curInst===h&&this._hideDatepicker(),a=this._getDateDatepicker(e,!0),r=this._getMinMaxDate(h,"min"),l=this._getMinMaxDate(h,"max"),o(h.settings,n),null!==r&&void 0!==n.dateFormat&&void 0===n.minDate&&(h.settings.minDate=this._formatDate(h,r)),null!==l&&void 0!==n.dateFormat&&void 0===n.maxDate&&(h.settings.maxDate=this._formatDate(h,l)),"disabled"in n&&(n.disabled?this._disableDatepicker(e):this._enableDatepicker(e)),this._attachments(t(e),h),this._autoSize(h),this._setDate(h,a),this._updateAlternate(h),this._updateDatepicker(h)),void 0)},_changeDatepicker:function(t,e,i){this._optionDatepicker(t,e,i)},_refreshDatepicker:function(t){var e=this._getInst(t);e&&this._updateDatepicker(e)},_setDateDatepicker:function(t,e){var i=this._getInst(t);i&&(this._setDate(i,e),this._updateDatepicker(i),this._updateAlternate(i))},_getDateDatepicker:function(t,e){var i=this._getInst(t);return i&&!i.inline&&this._setDateFromField(i,e),i?this._getDate(i):null},_doKeyDown:function(e){var i,s,n,o=t.datepicker._getInst(e.target),a=!0,r=o.dpDiv.is(".ui-datepicker-rtl");if(o._keyEvent=!0,t.datepicker._datepickerShowing)switch(e.keyCode){case 9:t.datepicker._hideDatepicker(),a=!1;break;case 13:return n=t("td."+t.datepicker._dayOverClass+":not(."+t.datepicker._currentClass+")",o.dpDiv),n[0]&&t.datepicker._selectDay(e.target,o.selectedMonth,o.selectedYear,n[0]),i=t.datepicker._get(o,"onSelect"),i?(s=t.datepicker._formatDate(o),i.apply(o.input?o.input[0]:null,[s,o])):t.datepicker._hideDatepicker(),!1;case 27:t.datepicker._hideDatepicker();break;case 33:t.datepicker._adjustDate(e.target,e.ctrlKey?-t.datepicker._get(o,"stepBigMonths"):-t.datepicker._get(o,"stepMonths"),"M");break;case 34:t.datepicker._adjustDate(e.target,e.ctrlKey?+t.datepicker._get(o,"stepBigMonths"):+t.datepicker._get(o,"stepMonths"),"M");break;case 35:(e.ctrlKey||e.metaKey)&&t.datepicker._clearDate(e.target),a=e.ctrlKey||e.metaKey;break;case 36:(e.ctrlKey||e.metaKey)&&t.datepicker._gotoToday(e.target),a=e.ctrlKey||e.metaKey;break;case 37:(e.ctrlKey||e.metaKey)&&t.datepicker._adjustDate(e.target,r?1:-1,"D"),a=e.ctrlKey||e.metaKey,e.originalEvent.altKey&&t.datepicker._adjustDate(e.target,e.ctrlKey?-t.datepicker._get(o,"stepBigMonths"):-t.datepicker._get(o,"stepMonths"),"M");break;case 38:(e.ctrlKey||e.metaKey)&&t.datepicker._adjustDate(e.target,-7,"D"),a=e.ctrlKey||e.metaKey;break;case 39:(e.ctrlKey||e.metaKey)&&t.datepicker._adjustDate(e.target,r?-1:1,"D"),a=e.ctrlKey||e.metaKey,e.originalEvent.altKey&&t.datepicker._adjustDate(e.target,e.ctrlKey?+t.datepicker._get(o,"stepBigMonths"):+t.datepicker._get(o,"stepMonths"),"M");break;case 40:(e.ctrlKey||e.metaKey)&&t.datepicker._adjustDate(e.target,7,"D"),a=e.ctrlKey||e.metaKey;break;default:a=!1}else 36===e.keyCode&&e.ctrlKey?t.datepicker._showDatepicker(this):a=!1;a&&(e.preventDefault(),e.stopPropagation())},_doKeyPress:function(e){var i,s,n=t.datepicker._getInst(e.target);return t.datepicker._get(n,"constrainInput")?(i=t.datepicker._possibleChars(t.datepicker._get(n,"dateFormat")),s=String.fromCharCode(null==e.charCode?e.keyCode:e.charCode),e.ctrlKey||e.metaKey||" ">s||!i||i.indexOf(s)>-1):void 0},_doKeyUp:function(e){var i,s=t.datepicker._getInst(e.target);if(s.input.val()!==s.lastVal)try{i=t.datepicker.parseDate(t.datepicker._get(s,"dateFormat"),s.input?s.input.val():null,t.datepicker._getFormatConfig(s)),i&&(t.datepicker._setDateFromField(s),t.datepicker._updateAlternate(s),t.datepicker._updateDatepicker(s))}catch(n){}return!0},_showDatepicker:function(i){if(i=i.target||i,"input"!==i.nodeName.toLowerCase()&&(i=t("input",i.parentNode)[0]),!t.datepicker._isDisabledDatepicker(i)&&t.datepicker._lastInput!==i){var s,n,a,r,l,h,c;s=t.datepicker._getInst(i),t.datepicker._curInst&&t.datepicker._curInst!==s&&(t.datepicker._curInst.dpDiv.stop(!0,!0),s&&t.datepicker._datepickerShowing&&t.datepicker._hideDatepicker(t.datepicker._curInst.input[0])),n=t.datepicker._get(s,"beforeShow"),a=n?n.apply(i,[i,s]):{},a!==!1&&(o(s.settings,a),s.lastVal=null,t.datepicker._lastInput=i,t.datepicker._setDateFromField(s),t.datepicker._inDialog&&(i.value=""),t.datepicker._pos||(t.datepicker._pos=t.datepicker._findPos(i),t.datepicker._pos[1]+=i.offsetHeight),r=!1,t(i).parents().each(function(){return r|="fixed"===t(this).css("position"),!r}),l={left:t.datepicker._pos[0],top:t.datepicker._pos[1]},t.datepicker._pos=null,s.dpDiv.empty(),s.dpDiv.css({position:"absolute",display:"block",top:"-1000px"}),t.datepicker._updateDatepicker(s),l=t.datepicker._checkOffset(s,l,r),s.dpDiv.css({position:t.datepicker._inDialog&&t.blockUI?"static":r?"fixed":"absolute",display:"none",left:l.left+"px",top:l.top+"px"}),s.inline||(h=t.datepicker._get(s,"showAnim"),c=t.datepicker._get(s,"duration"),s.dpDiv.css("z-index",e(t(i))+1),t.datepicker._datepickerShowing=!0,t.effects&&t.effects.effect[h]?s.dpDiv.show(h,t.datepicker._get(s,"showOptions"),c):s.dpDiv[h||"show"](h?c:null),t.datepicker._shouldFocusInput(s)&&s.input.trigger("focus"),t.datepicker._curInst=s))}},_updateDatepicker:function(e){this.maxRows=4,l=e,e.dpDiv.empty().append(this._generateHTML(e)),this._attachHandlers(e);var i,s=this._getNumberOfMonths(e),o=s[1],a=17,r=e.dpDiv.find("."+this._dayOverClass+" a");r.length>0&&n.apply(r.get(0)),e.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width(""),o>1&&e.dpDiv.addClass("ui-datepicker-multi-"+o).css("width",a*o+"em"),e.dpDiv[(1!==s[0]||1!==s[1]?"add":"remove")+"Class"]("ui-datepicker-multi"),e.dpDiv[(this._get(e,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl"),e===t.datepicker._curInst&&t.datepicker._datepickerShowing&&t.datepicker._shouldFocusInput(e)&&e.input.trigger("focus"),e.yearshtml&&(i=e.yearshtml,setTimeout(function(){i===e.yearshtml&&e.yearshtml&&e.dpDiv.find("select.ui-datepicker-year:first").replaceWith(e.yearshtml),i=e.yearshtml=null},0))},_shouldFocusInput:function(t){return t.input&&t.input.is(":visible")&&!t.input.is(":disabled")&&!t.input.is(":focus")},_checkOffset:function(e,i,s){var n=e.dpDiv.outerWidth(),o=e.dpDiv.outerHeight(),a=e.input?e.input.outerWidth():0,r=e.input?e.input.outerHeight():0,l=document.documentElement.clientWidth+(s?0:t(document).scrollLeft()),h=document.documentElement.clientHeight+(s?0:t(document).scrollTop());return i.left-=this._get(e,"isRTL")?n-a:0,i.left-=s&&i.left===e.input.offset().left?t(document).scrollLeft():0,i.top-=s&&i.top===e.input.offset().top+r?t(document).scrollTop():0,i.left-=Math.min(i.left,i.left+n>l&&l>n?Math.abs(i.left+n-l):0),i.top-=Math.min(i.top,i.top+o>h&&h>o?Math.abs(o+r):0),i},_findPos:function(e){for(var i,s=this._getInst(e),n=this._get(s,"isRTL");e&&("hidden"===e.type||1!==e.nodeType||t.expr.filters.hidden(e));)e=e[n?"previousSibling":"nextSibling"];return i=t(e).offset(),[i.left,i.top]},_hideDatepicker:function(e){var i,s,n,o,a=this._curInst;!a||e&&a!==t.data(e,"datepicker")||this._datepickerShowing&&(i=this._get(a,"showAnim"),s=this._get(a,"duration"),n=function(){t.datepicker._tidyDialog(a)},t.effects&&(t.effects.effect[i]||t.effects[i])?a.dpDiv.hide(i,t.datepicker._get(a,"showOptions"),s,n):a.dpDiv["slideDown"===i?"slideUp":"fadeIn"===i?"fadeOut":"hide"](i?s:null,n),i||n(),this._datepickerShowing=!1,o=this._get(a,"onClose"),o&&o.apply(a.input?a.input[0]:null,[a.input?a.input.val():"",a]),this._lastInput=null,this._inDialog&&(this._dialogInput.css({position:"absolute",left:"0",top:"-100px"}),t.blockUI&&(t.unblockUI(),t("body").append(this.dpDiv))),this._inDialog=!1)},_tidyDialog:function(t){t.dpDiv.removeClass(this._dialogClass).off(".ui-datepicker-calendar")},_checkExternalClick:function(e){if(t.datepicker._curInst){var i=t(e.target),s=t.datepicker._getInst(i[0]);(i[0].id!==t.datepicker._mainDivId&&0===i.parents("#"+t.datepicker._mainDivId).length&&!i.hasClass(t.datepicker.markerClassName)&&!i.closest("."+t.datepicker._triggerClass).length&&t.datepicker._datepickerShowing&&(!t.datepicker._inDialog||!t.blockUI)||i.hasClass(t.datepicker.markerClassName)&&t.datepicker._curInst!==s)&&t.datepicker._hideDatepicker()}},_adjustDate:function(e,i,s){var n=t(e),o=this._getInst(n[0]);this._isDisabledDatepicker(n[0])||(this._adjustInstDate(o,i+("M"===s?this._get(o,"showCurrentAtPos"):0),s),this._updateDatepicker(o))},_gotoToday:function(e){var i,s=t(e),n=this._getInst(s[0]);this._get(n,"gotoCurrent")&&n.currentDay?(n.selectedDay=n.currentDay,n.drawMonth=n.selectedMonth=n.currentMonth,n.drawYear=n.selectedYear=n.currentYear):(i=new Date,n.selectedDay=i.getDate(),n.drawMonth=n.selectedMonth=i.getMonth(),n.drawYear=n.selectedYear=i.getFullYear()),this._notifyChange(n),this._adjustDate(s)},_selectMonthYear:function(e,i,s){var n=t(e),o=this._getInst(n[0]);o["selected"+("M"===s?"Month":"Year")]=o["draw"+("M"===s?"Month":"Year")]=parseInt(i.options[i.selectedIndex].value,10),this._notifyChange(o),this._adjustDate(n)},_selectDay:function(e,i,s,n){var o,a=t(e);t(n).hasClass(this._unselectableClass)||this._isDisabledDatepicker(a[0])||(o=this._getInst(a[0]),o.selectedDay=o.currentDay=t("a",n).html(),o.selectedMonth=o.currentMonth=i,o.selectedYear=o.currentYear=s,this._selectDate(e,this._formatDate(o,o.currentDay,o.currentMonth,o.currentYear)))},_clearDate:function(e){var i=t(e);this._selectDate(i,"")},_selectDate:function(e,i){var s,n=t(e),o=this._getInst(n[0]);i=null!=i?i:this._formatDate(o),o.input&&o.input.val(i),this._updateAlternate(o),s=this._get(o,"onSelect"),s?s.apply(o.input?o.input[0]:null,[i,o]):o.input&&o.input.trigger("change"),o.inline?this._updateDatepicker(o):(this._hideDatepicker(),this._lastInput=o.input[0],"object"!=typeof o.input[0]&&o.input.trigger("focus"),this._lastInput=null)},_updateAlternate:function(e){var i,s,n,o=this._get(e,"altField");o&&(i=this._get(e,"altFormat")||this._get(e,"dateFormat"),s=this._getDate(e),n=this.formatDate(i,s,this._getFormatConfig(e)),t(o).val(n))},noWeekends:function(t){var e=t.getDay();return[e>0&&6>e,""]},iso8601Week:function(t){var e,i=new Date(t.getTime());return i.setDate(i.getDate()+4-(i.getDay()||7)),e=i.getTime(),i.setMonth(0),i.setDate(1),Math.floor(Math.round((e-i)/864e5)/7)+1},parseDate:function(e,i,s){if(null==e||null==i)throw"Invalid arguments";if(i="object"==typeof i?""+i:i+"",""===i)return null;var n,o,a,r,l=0,h=(s?s.shortYearCutoff:null)||this._defaults.shortYearCutoff,c="string"!=typeof h?h:(new Date).getFullYear()%100+parseInt(h,10),u=(s?s.dayNamesShort:null)||this._defaults.dayNamesShort,d=(s?s.dayNames:null)||this._defaults.dayNames,p=(s?s.monthNamesShort:null)||this._defaults.monthNamesShort,f=(s?s.monthNames:null)||this._defaults.monthNames,g=-1,m=-1,_=-1,v=-1,b=!1,y=function(t){var i=e.length>n+1&&e.charAt(n+1)===t;return i&&n++,i},w=function(t){var e=y(t),s="@"===t?14:"!"===t?20:"y"===t&&e?4:"o"===t?3:2,n="y"===t?s:1,o=RegExp("^\\d{"+n+","+s+"}"),a=i.substring(l).match(o);if(!a)throw"Missing number at position "+l;return l+=a[0].length,parseInt(a[0],10)},k=function(e,s,n){var o=-1,a=t.map(y(e)?n:s,function(t,e){return[[e,t]]}).sort(function(t,e){return-(t[1].length-e[1].length)});if(t.each(a,function(t,e){var s=e[1];return i.substr(l,s.length).toLowerCase()===s.toLowerCase()?(o=e[0],l+=s.length,!1):void 0}),-1!==o)return o+1;throw"Unknown name at position "+l},x=function(){if(i.charAt(l)!==e.charAt(n))throw"Unexpected literal at position "+l;l++};for(n=0;e.length>n;n++)if(b)"'"!==e.charAt(n)||y("'")?x():b=!1;else switch(e.charAt(n)){case"d":_=w("d");break;case"D":k("D",u,d);break;case"o":v=w("o");break;case"m":m=w("m");break;case"M":m=k("M",p,f);break;case"y":g=w("y");break;case"@":r=new Date(w("@")),g=r.getFullYear(),m=r.getMonth()+1,_=r.getDate();break;case"!":r=new Date((w("!")-this._ticksTo1970)/1e4),g=r.getFullYear(),m=r.getMonth()+1,_=r.getDate();break;case"'":y("'")?x():b=!0;break;default:x()}if(i.length>l&&(a=i.substr(l),!/^\s+/.test(a)))throw"Extra/unparsed characters found in date: "+a;if(-1===g?g=(new Date).getFullYear():100>g&&(g+=(new Date).getFullYear()-(new Date).getFullYear()%100+(c>=g?0:-100)),v>-1)for(m=1,_=v;;){if(o=this._getDaysInMonth(g,m-1),o>=_)break;m++,_-=o}if(r=this._daylightSavingAdjust(new Date(g,m-1,_)),r.getFullYear()!==g||r.getMonth()+1!==m||r.getDate()!==_)throw"Invalid date";return r},ATOM:"yy-mm-dd",COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",_ticksTo1970:1e7*60*60*24*(718685+Math.floor(492.5)-Math.floor(19.7)+Math.floor(4.925)),formatDate:function(t,e,i){if(!e)return"";var s,n=(i?i.dayNamesShort:null)||this._defaults.dayNamesShort,o=(i?i.dayNames:null)||this._defaults.dayNames,a=(i?i.monthNamesShort:null)||this._defaults.monthNamesShort,r=(i?i.monthNames:null)||this._defaults.monthNames,l=function(e){var i=t.length>s+1&&t.charAt(s+1)===e;return i&&s++,i},h=function(t,e,i){var s=""+e;if(l(t))for(;i>s.length;)s="0"+s;return s},c=function(t,e,i,s){return l(t)?s[e]:i[e]},u="",d=!1;if(e)for(s=0;t.length>s;s++)if(d)"'"!==t.charAt(s)||l("'")?u+=t.charAt(s):d=!1;else switch(t.charAt(s)){case"d":u+=h("d",e.getDate(),2);break;case"D":u+=c("D",e.getDay(),n,o);break;case"o":u+=h("o",Math.round((new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime()-new Date(e.getFullYear(),0,0).getTime())/864e5),3);break;case"m":u+=h("m",e.getMonth()+1,2);break;case"M":u+=c("M",e.getMonth(),a,r);break;case"y":u+=l("y")?e.getFullYear():(10>e.getFullYear()%100?"0":"")+e.getFullYear()%100;break;case"@":u+=e.getTime();break;case"!":u+=1e4*e.getTime()+this._ticksTo1970;break;case"'":l("'")?u+="'":d=!0;break;default:u+=t.charAt(s)}return u},_possibleChars:function(t){var e,i="",s=!1,n=function(i){var s=t.length>e+1&&t.charAt(e+1)===i;return s&&e++,s};for(e=0;t.length>e;e++)if(s)"'"!==t.charAt(e)||n("'")?i+=t.charAt(e):s=!1;else switch(t.charAt(e)){case"d":case"m":case"y":case"@":i+="0123456789";break;case"D":case"M":return null;case"'":n("'")?i+="'":s=!0;break;default:i+=t.charAt(e)}return i},_get:function(t,e){return void 0!==t.settings[e]?t.settings[e]:this._defaults[e]},_setDateFromField:function(t,e){if(t.input.val()!==t.lastVal){var i=this._get(t,"dateFormat"),s=t.lastVal=t.input?t.input.val():null,n=this._getDefaultDate(t),o=n,a=this._getFormatConfig(t);try{o=this.parseDate(i,s,a)||n}catch(r){s=e?"":s}t.selectedDay=o.getDate(),t.drawMonth=t.selectedMonth=o.getMonth(),t.drawYear=t.selectedYear=o.getFullYear(),t.currentDay=s?o.getDate():0,t.currentMonth=s?o.getMonth():0,t.currentYear=s?o.getFullYear():0,this._adjustInstDate(t)}},_getDefaultDate:function(t){return this._restrictMinMax(t,this._determineDate(t,this._get(t,"defaultDate"),new Date))},_determineDate:function(e,i,s){var n=function(t){var e=new Date;return e.setDate(e.getDate()+t),e},o=function(i){try{return t.datepicker.parseDate(t.datepicker._get(e,"dateFormat"),i,t.datepicker._getFormatConfig(e))}catch(s){}for(var n=(i.toLowerCase().match(/^c/)?t.datepicker._getDate(e):null)||new Date,o=n.getFullYear(),a=n.getMonth(),r=n.getDate(),l=/([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,h=l.exec(i);h;){switch(h[2]||"d"){case"d":case"D":r+=parseInt(h[1],10);break;case"w":case"W":r+=7*parseInt(h[1],10);break;case"m":case"M":a+=parseInt(h[1],10),r=Math.min(r,t.datepicker._getDaysInMonth(o,a));break;case"y":case"Y":o+=parseInt(h[1],10),r=Math.min(r,t.datepicker._getDaysInMonth(o,a))}h=l.exec(i)}return new Date(o,a,r)},a=null==i||""===i?s:"string"==typeof i?o(i):"number"==typeof i?isNaN(i)?s:n(i):new Date(i.getTime());return a=a&&"Invalid Date"==""+a?s:a,a&&(a.setHours(0),a.setMinutes(0),a.setSeconds(0),a.setMilliseconds(0)),this._daylightSavingAdjust(a)},_daylightSavingAdjust:function(t){return t?(t.setHours(t.getHours()>12?t.getHours()+2:0),t):null},_setDate:function(t,e,i){var s=!e,n=t.selectedMonth,o=t.selectedYear,a=this._restrictMinMax(t,this._determineDate(t,e,new Date));t.selectedDay=t.currentDay=a.getDate(),t.drawMonth=t.selectedMonth=t.currentMonth=a.getMonth(),t.drawYear=t.selectedYear=t.currentYear=a.getFullYear(),n===t.selectedMonth&&o===t.selectedYear||i||this._notifyChange(t),this._adjustInstDate(t),t.input&&t.input.val(s?"":this._formatDate(t))},_getDate:function(t){var e=!t.currentYear||t.input&&""===t.input.val()?null:this._daylightSavingAdjust(new Date(t.currentYear,t.currentMonth,t.currentDay));return e},_attachHandlers:function(e){var i=this._get(e,"stepMonths"),s="#"+e.id.replace(/\\\\/g,"\\");e.dpDiv.find("[data-handler]").map(function(){var e={prev:function(){t.datepicker._adjustDate(s,-i,"M")},next:function(){t.datepicker._adjustDate(s,+i,"M")},hide:function(){t.datepicker._hideDatepicker()},today:function(){t.datepicker._gotoToday(s)},selectDay:function(){return t.datepicker._selectDay(s,+this.getAttribute("data-month"),+this.getAttribute("data-year"),this),!1},selectMonth:function(){return t.datepicker._selectMonthYear(s,this,"M"),!1},selectYear:function(){return t.datepicker._selectMonthYear(s,this,"Y"),!1}};t(this).on(this.getAttribute("data-event"),e[this.getAttribute("data-handler")])})},_generateHTML:function(t){var e,i,s,n,o,a,r,l,h,c,u,d,p,f,g,m,_,v,b,y,w,k,x,C,D,T,I,M,P,S,N,H,A,z,O,E,W,F,L,R=new Date,Y=this._daylightSavingAdjust(new Date(R.getFullYear(),R.getMonth(),R.getDate())),B=this._get(t,"isRTL"),j=this._get(t,"showButtonPanel"),q=this._get(t,"hideIfNoPrevNext"),K=this._get(t,"navigationAsDateFormat"),U=this._getNumberOfMonths(t),V=this._get(t,"showCurrentAtPos"),X=this._get(t,"stepMonths"),$=1!==U[0]||1!==U[1],G=this._daylightSavingAdjust(t.currentDay?new Date(t.currentYear,t.currentMonth,t.currentDay):new Date(9999,9,9)),J=this._getMinMaxDate(t,"min"),Q=this._getMinMaxDate(t,"max"),Z=t.drawMonth-V,te=t.drawYear;if(0>Z&&(Z+=12,te--),Q)for(e=this._daylightSavingAdjust(new Date(Q.getFullYear(),Q.getMonth()-U[0]*U[1]+1,Q.getDate())),e=J&&J>e?J:e;this._daylightSavingAdjust(new Date(te,Z,1))>e;)Z--,0>Z&&(Z=11,te--);for(t.drawMonth=Z,t.drawYear=te,i=this._get(t,"prevText"),i=K?this.formatDate(i,this._daylightSavingAdjust(new Date(te,Z-X,1)),this._getFormatConfig(t)):i,s=this._canAdjustMonth(t,-1,te,Z)?"<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click' title='"+i+"'><span class='ui-icon ui-icon-circle-triangle-"+(B?"e":"w")+"'>"+i+"</span></a>":q?"":"<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='"+i+"'><span class='ui-icon ui-icon-circle-triangle-"+(B?"e":"w")+"'>"+i+"</span></a>",n=this._get(t,"nextText"),n=K?this.formatDate(n,this._daylightSavingAdjust(new Date(te,Z+X,1)),this._getFormatConfig(t)):n,o=this._canAdjustMonth(t,1,te,Z)?"<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click' title='"+n+"'><span class='ui-icon ui-icon-circle-triangle-"+(B?"w":"e")+"'>"+n+"</span></a>":q?"":"<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='"+n+"'><span class='ui-icon ui-icon-circle-triangle-"+(B?"w":"e")+"'>"+n+"</span></a>",a=this._get(t,"currentText"),r=this._get(t,"gotoCurrent")&&t.currentDay?G:Y,a=K?this.formatDate(a,r,this._getFormatConfig(t)):a,l=t.inline?"":"<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>"+this._get(t,"closeText")+"</button>",h=j?"<div class='ui-datepicker-buttonpane ui-widget-content'>"+(B?l:"")+(this._isInRange(t,r)?"<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'>"+a+"</button>":"")+(B?"":l)+"</div>":"",c=parseInt(this._get(t,"firstDay"),10),c=isNaN(c)?0:c,u=this._get(t,"showWeek"),d=this._get(t,"dayNames"),p=this._get(t,"dayNamesMin"),f=this._get(t,"monthNames"),g=this._get(t,"monthNamesShort"),m=this._get(t,"beforeShowDay"),_=this._get(t,"showOtherMonths"),v=this._get(t,"selectOtherMonths"),b=this._getDefaultDate(t),y="",k=0;U[0]>k;k++){for(x="",this.maxRows=4,C=0;U[1]>C;C++){if(D=this._daylightSavingAdjust(new Date(te,Z,t.selectedDay)),T=" ui-corner-all",I="",$){if(I+="<div class='ui-datepicker-group",U[1]>1)switch(C){case 0:I+=" ui-datepicker-group-first",T=" ui-corner-"+(B?"right":"left");break;case U[1]-1:I+=" ui-datepicker-group-last",T=" ui-corner-"+(B?"left":"right");break;default:I+=" ui-datepicker-group-middle",T=""}I+="'>"}for(I+="<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix"+T+"'>"+(/all|left/.test(T)&&0===k?B?o:s:"")+(/all|right/.test(T)&&0===k?B?s:o:"")+this._generateMonthYearHeader(t,Z,te,J,Q,k>0||C>0,f,g)+"</div><table class='ui-datepicker-calendar'><thead>"+"<tr>",M=u?"<th class='ui-datepicker-week-col'>"+this._get(t,"weekHeader")+"</th>":"",w=0;7>w;w++)P=(w+c)%7,M+="<th scope='col'"+((w+c+6)%7>=5?" class='ui-datepicker-week-end'":"")+">"+"<span title='"+d[P]+"'>"+p[P]+"</span></th>";for(I+=M+"</tr></thead><tbody>",S=this._getDaysInMonth(te,Z),te===t.selectedYear&&Z===t.selectedMonth&&(t.selectedDay=Math.min(t.selectedDay,S)),N=(this._getFirstDayOfMonth(te,Z)-c+7)%7,H=Math.ceil((N+S)/7),A=$?this.maxRows>H?this.maxRows:H:H,this.maxRows=A,z=this._daylightSavingAdjust(new Date(te,Z,1-N)),O=0;A>O;O++){for(I+="<tr>",E=u?"<td class='ui-datepicker-week-col'>"+this._get(t,"calculateWeek")(z)+"</td>":"",w=0;7>w;w++)W=m?m.apply(t.input?t.input[0]:null,[z]):[!0,""],F=z.getMonth()!==Z,L=F&&!v||!W[0]||J&&J>z||Q&&z>Q,E+="<td class='"+((w+c+6)%7>=5?" ui-datepicker-week-end":"")+(F?" ui-datepicker-other-month":"")+(z.getTime()===D.getTime()&&Z===t.selectedMonth&&t._keyEvent||b.getTime()===z.getTime()&&b.getTime()===D.getTime()?" "+this._dayOverClass:"")+(L?" "+this._unselectableClass+" ui-state-disabled":"")+(F&&!_?"":" "+W[1]+(z.getTime()===G.getTime()?" "+this._currentClass:"")+(z.getTime()===Y.getTime()?" ui-datepicker-today":""))+"'"+(F&&!_||!W[2]?"":" title='"+W[2].replace(/'/g,"&#39;")+"'")+(L?"":" data-handler='selectDay' data-event='click' data-month='"+z.getMonth()+"' data-year='"+z.getFullYear()+"'")+">"+(F&&!_?"&#xa0;":L?"<span class='ui-state-default'>"+z.getDate()+"</span>":"<a class='ui-state-default"+(z.getTime()===Y.getTime()?" ui-state-highlight":"")+(z.getTime()===G.getTime()?" ui-state-active":"")+(F?" ui-priority-secondary":"")+"' href='#'>"+z.getDate()+"</a>")+"</td>",z.setDate(z.getDate()+1),z=this._daylightSavingAdjust(z);
I+=E+"</tr>"}Z++,Z>11&&(Z=0,te++),I+="</tbody></table>"+($?"</div>"+(U[0]>0&&C===U[1]-1?"<div class='ui-datepicker-row-break'></div>":""):""),x+=I}y+=x}return y+=h,t._keyEvent=!1,y},_generateMonthYearHeader:function(t,e,i,s,n,o,a,r){var l,h,c,u,d,p,f,g,m=this._get(t,"changeMonth"),_=this._get(t,"changeYear"),v=this._get(t,"showMonthAfterYear"),b="<div class='ui-datepicker-title'>",y="";if(o||!m)y+="<span class='ui-datepicker-month'>"+a[e]+"</span>";else{for(l=s&&s.getFullYear()===i,h=n&&n.getFullYear()===i,y+="<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>",c=0;12>c;c++)(!l||c>=s.getMonth())&&(!h||n.getMonth()>=c)&&(y+="<option value='"+c+"'"+(c===e?" selected='selected'":"")+">"+r[c]+"</option>");y+="</select>"}if(v||(b+=y+(!o&&m&&_?"":"&#xa0;")),!t.yearshtml)if(t.yearshtml="",o||!_)b+="<span class='ui-datepicker-year'>"+i+"</span>";else{for(u=this._get(t,"yearRange").split(":"),d=(new Date).getFullYear(),p=function(t){var e=t.match(/c[+\-].*/)?i+parseInt(t.substring(1),10):t.match(/[+\-].*/)?d+parseInt(t,10):parseInt(t,10);return isNaN(e)?d:e},f=p(u[0]),g=Math.max(f,p(u[1]||"")),f=s?Math.max(f,s.getFullYear()):f,g=n?Math.min(g,n.getFullYear()):g,t.yearshtml+="<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>";g>=f;f++)t.yearshtml+="<option value='"+f+"'"+(f===i?" selected='selected'":"")+">"+f+"</option>";t.yearshtml+="</select>",b+=t.yearshtml,t.yearshtml=null}return b+=this._get(t,"yearSuffix"),v&&(b+=(!o&&m&&_?"":"&#xa0;")+y),b+="</div>"},_adjustInstDate:function(t,e,i){var s=t.selectedYear+("Y"===i?e:0),n=t.selectedMonth+("M"===i?e:0),o=Math.min(t.selectedDay,this._getDaysInMonth(s,n))+("D"===i?e:0),a=this._restrictMinMax(t,this._daylightSavingAdjust(new Date(s,n,o)));t.selectedDay=a.getDate(),t.drawMonth=t.selectedMonth=a.getMonth(),t.drawYear=t.selectedYear=a.getFullYear(),("M"===i||"Y"===i)&&this._notifyChange(t)},_restrictMinMax:function(t,e){var i=this._getMinMaxDate(t,"min"),s=this._getMinMaxDate(t,"max"),n=i&&i>e?i:e;return s&&n>s?s:n},_notifyChange:function(t){var e=this._get(t,"onChangeMonthYear");e&&e.apply(t.input?t.input[0]:null,[t.selectedYear,t.selectedMonth+1,t])},_getNumberOfMonths:function(t){var e=this._get(t,"numberOfMonths");return null==e?[1,1]:"number"==typeof e?[1,e]:e},_getMinMaxDate:function(t,e){return this._determineDate(t,this._get(t,e+"Date"),null)},_getDaysInMonth:function(t,e){return 32-this._daylightSavingAdjust(new Date(t,e,32)).getDate()},_getFirstDayOfMonth:function(t,e){return new Date(t,e,1).getDay()},_canAdjustMonth:function(t,e,i,s){var n=this._getNumberOfMonths(t),o=this._daylightSavingAdjust(new Date(i,s+(0>e?e:n[0]*n[1]),1));return 0>e&&o.setDate(this._getDaysInMonth(o.getFullYear(),o.getMonth())),this._isInRange(t,o)},_isInRange:function(t,e){var i,s,n=this._getMinMaxDate(t,"min"),o=this._getMinMaxDate(t,"max"),a=null,r=null,l=this._get(t,"yearRange");return l&&(i=l.split(":"),s=(new Date).getFullYear(),a=parseInt(i[0],10),r=parseInt(i[1],10),i[0].match(/[+\-].*/)&&(a+=s),i[1].match(/[+\-].*/)&&(r+=s)),(!n||e.getTime()>=n.getTime())&&(!o||e.getTime()<=o.getTime())&&(!a||e.getFullYear()>=a)&&(!r||r>=e.getFullYear())},_getFormatConfig:function(t){var e=this._get(t,"shortYearCutoff");return e="string"!=typeof e?e:(new Date).getFullYear()%100+parseInt(e,10),{shortYearCutoff:e,dayNamesShort:this._get(t,"dayNamesShort"),dayNames:this._get(t,"dayNames"),monthNamesShort:this._get(t,"monthNamesShort"),monthNames:this._get(t,"monthNames")}},_formatDate:function(t,e,i,s){e||(t.currentDay=t.selectedDay,t.currentMonth=t.selectedMonth,t.currentYear=t.selectedYear);var n=e?"object"==typeof e?e:this._daylightSavingAdjust(new Date(s,i,e)):this._daylightSavingAdjust(new Date(t.currentYear,t.currentMonth,t.currentDay));return this.formatDate(this._get(t,"dateFormat"),n,this._getFormatConfig(t))}}),t.fn.datepicker=function(e){if(!this.length)return this;t.datepicker.initialized||(t(document).on("mousedown",t.datepicker._checkExternalClick),t.datepicker.initialized=!0),0===t("#"+t.datepicker._mainDivId).length&&t("body").append(t.datepicker.dpDiv);var i=Array.prototype.slice.call(arguments,1);return"string"!=typeof e||"isDisabled"!==e&&"getDate"!==e&&"widget"!==e?"option"===e&&2===arguments.length&&"string"==typeof arguments[1]?t.datepicker["_"+e+"Datepicker"].apply(t.datepicker,[this[0]].concat(i)):this.each(function(){"string"==typeof e?t.datepicker["_"+e+"Datepicker"].apply(t.datepicker,[this].concat(i)):t.datepicker._attachDatepicker(this,e)}):t.datepicker["_"+e+"Datepicker"].apply(t.datepicker,[this[0]].concat(i))},t.datepicker=new i,t.datepicker.initialized=!1,t.datepicker.uuid=(new Date).getTime(),t.datepicker.version="1.12.1",t.datepicker,t.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());var h=!1;t(document).on("mouseup",function(){h=!1}),t.widget("ui.mouse",{version:"1.12.1",options:{cancel:"input, textarea, button, select, option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.on("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).on("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):void 0}),this.started=!1},_mouseDestroy:function(){this.element.off("."+this.widgetName),this._mouseMoveDelegate&&this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(e){if(!h){this._mouseMoved=!1,this._mouseStarted&&this._mouseUp(e),this._mouseDownEvent=e;var i=this,s=1===e.which,n="string"==typeof this.options.cancel&&e.target.nodeName?t(e.target).closest(this.options.cancel).length:!1;return s&&!n&&this._mouseCapture(e)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){i.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(e)!==!1,!this._mouseStarted)?(e.preventDefault(),!0):(!0===t.data(e.target,this.widgetName+".preventClickEvent")&&t.removeData(e.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return i._mouseMove(t)},this._mouseUpDelegate=function(t){return i._mouseUp(t)},this.document.on("mousemove."+this.widgetName,this._mouseMoveDelegate).on("mouseup."+this.widgetName,this._mouseUpDelegate),e.preventDefault(),h=!0,!0)):!0}},_mouseMove:function(e){if(this._mouseMoved){if(t.ui.ie&&(!document.documentMode||9>document.documentMode)&&!e.button)return this._mouseUp(e);if(!e.which)if(e.originalEvent.altKey||e.originalEvent.ctrlKey||e.originalEvent.metaKey||e.originalEvent.shiftKey)this.ignoreMissingWhich=!0;else if(!this.ignoreMissingWhich)return this._mouseUp(e)}return(e.which||e.button)&&(this._mouseMoved=!0),this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted)},_mouseUp:function(e){this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),this._mouseDelayTimer&&(clearTimeout(this._mouseDelayTimer),delete this._mouseDelayTimer),this.ignoreMissingWhich=!1,h=!1,e.preventDefault()},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}}),t.widget("ui.selectmenu",[t.ui.formResetMixin,{version:"1.12.1",defaultElement:"<select>",options:{appendTo:null,classes:{"ui-selectmenu-button-open":"ui-corner-top","ui-selectmenu-button-closed":"ui-corner-all"},disabled:null,icons:{button:"ui-icon-triangle-1-s"},position:{my:"left top",at:"left bottom",collision:"none"},width:!1,change:null,close:null,focus:null,open:null,select:null},_create:function(){var e=this.element.uniqueId().attr("id");this.ids={element:e,button:e+"-button",menu:e+"-menu"},this._drawButton(),this._drawMenu(),this._bindFormResetHandler(),this._rendered=!1,this.menuItems=t()},_drawButton:function(){var e,i=this,s=this._parseOption(this.element.find("option:selected"),this.element[0].selectedIndex);this.labels=this.element.labels().attr("for",this.ids.button),this._on(this.labels,{click:function(t){this.button.focus(),t.preventDefault()}}),this.element.hide(),this.button=t("<span>",{tabindex:this.options.disabled?-1:0,id:this.ids.button,role:"combobox","aria-expanded":"false","aria-autocomplete":"list","aria-owns":this.ids.menu,"aria-haspopup":"true",title:this.element.attr("title")}).insertAfter(this.element),this._addClass(this.button,"ui-selectmenu-button ui-selectmenu-button-closed","ui-button ui-widget"),e=t("<span>").appendTo(this.button),this._addClass(e,"ui-selectmenu-icon","ui-icon "+this.options.icons.button),this.buttonItem=this._renderButtonItem(s).appendTo(this.button),this.options.width!==!1&&this._resizeButton(),this._on(this.button,this._buttonEvents),this.button.one("focusin",function(){i._rendered||i._refreshMenu()})},_drawMenu:function(){var e=this;this.menu=t("<ul>",{"aria-hidden":"true","aria-labelledby":this.ids.button,id:this.ids.menu}),this.menuWrap=t("<div>").append(this.menu),this._addClass(this.menuWrap,"ui-selectmenu-menu","ui-front"),this.menuWrap.appendTo(this._appendTo()),this.menuInstance=this.menu.menu({classes:{"ui-menu":"ui-corner-bottom"},role:"listbox",select:function(t,i){t.preventDefault(),e._setSelection(),e._select(i.item.data("ui-selectmenu-item"),t)},focus:function(t,i){var s=i.item.data("ui-selectmenu-item");null!=e.focusIndex&&s.index!==e.focusIndex&&(e._trigger("focus",t,{item:s}),e.isOpen||e._select(s,t)),e.focusIndex=s.index,e.button.attr("aria-activedescendant",e.menuItems.eq(s.index).attr("id"))}}).menu("instance"),this.menuInstance._off(this.menu,"mouseleave"),this.menuInstance._closeOnDocumentClick=function(){return!1},this.menuInstance._isDivider=function(){return!1}},refresh:function(){this._refreshMenu(),this.buttonItem.replaceWith(this.buttonItem=this._renderButtonItem(this._getSelectedItem().data("ui-selectmenu-item")||{})),null===this.options.width&&this._resizeButton()},_refreshMenu:function(){var t,e=this.element.find("option");this.menu.empty(),this._parseOptions(e),this._renderMenu(this.menu,this.items),this.menuInstance.refresh(),this.menuItems=this.menu.find("li").not(".ui-selectmenu-optgroup").find(".ui-menu-item-wrapper"),this._rendered=!0,e.length&&(t=this._getSelectedItem(),this.menuInstance.focus(null,t),this._setAria(t.data("ui-selectmenu-item")),this._setOption("disabled",this.element.prop("disabled")))},open:function(t){this.options.disabled||(this._rendered?(this._removeClass(this.menu.find(".ui-state-active"),null,"ui-state-active"),this.menuInstance.focus(null,this._getSelectedItem())):this._refreshMenu(),this.menuItems.length&&(this.isOpen=!0,this._toggleAttr(),this._resizeMenu(),this._position(),this._on(this.document,this._documentClick),this._trigger("open",t)))},_position:function(){this.menuWrap.position(t.extend({of:this.button},this.options.position))},close:function(t){this.isOpen&&(this.isOpen=!1,this._toggleAttr(),this.range=null,this._off(this.document),this._trigger("close",t))},widget:function(){return this.button},menuWidget:function(){return this.menu},_renderButtonItem:function(e){var i=t("<span>");return this._setText(i,e.label),this._addClass(i,"ui-selectmenu-text"),i},_renderMenu:function(e,i){var s=this,n="";t.each(i,function(i,o){var a;o.optgroup!==n&&(a=t("<li>",{text:o.optgroup}),s._addClass(a,"ui-selectmenu-optgroup","ui-menu-divider"+(o.element.parent("optgroup").prop("disabled")?" ui-state-disabled":"")),a.appendTo(e),n=o.optgroup),s._renderItemData(e,o)})},_renderItemData:function(t,e){return this._renderItem(t,e).data("ui-selectmenu-item",e)},_renderItem:function(e,i){var s=t("<li>"),n=t("<div>",{title:i.element.attr("title")});return i.disabled&&this._addClass(s,null,"ui-state-disabled"),this._setText(n,i.label),s.append(n).appendTo(e)},_setText:function(t,e){e?t.text(e):t.html("&#160;")},_move:function(t,e){var i,s,n=".ui-menu-item";this.isOpen?i=this.menuItems.eq(this.focusIndex).parent("li"):(i=this.menuItems.eq(this.element[0].selectedIndex).parent("li"),n+=":not(.ui-state-disabled)"),s="first"===t||"last"===t?i["first"===t?"prevAll":"nextAll"](n).eq(-1):i[t+"All"](n).eq(0),s.length&&this.menuInstance.focus(e,s)},_getSelectedItem:function(){return this.menuItems.eq(this.element[0].selectedIndex).parent("li")},_toggle:function(t){this[this.isOpen?"close":"open"](t)},_setSelection:function(){var t;this.range&&(window.getSelection?(t=window.getSelection(),t.removeAllRanges(),t.addRange(this.range)):this.range.select(),this.button.focus())},_documentClick:{mousedown:function(e){this.isOpen&&(t(e.target).closest(".ui-selectmenu-menu, #"+t.ui.escapeSelector(this.ids.button)).length||this.close(e))}},_buttonEvents:{mousedown:function(){var t;window.getSelection?(t=window.getSelection(),t.rangeCount&&(this.range=t.getRangeAt(0))):this.range=document.selection.createRange()},click:function(t){this._setSelection(),this._toggle(t)},keydown:function(e){var i=!0;switch(e.keyCode){case t.ui.keyCode.TAB:case t.ui.keyCode.ESCAPE:this.close(e),i=!1;break;case t.ui.keyCode.ENTER:this.isOpen&&this._selectFocusedItem(e);break;case t.ui.keyCode.UP:e.altKey?this._toggle(e):this._move("prev",e);break;case t.ui.keyCode.DOWN:e.altKey?this._toggle(e):this._move("next",e);break;case t.ui.keyCode.SPACE:this.isOpen?this._selectFocusedItem(e):this._toggle(e);break;case t.ui.keyCode.LEFT:this._move("prev",e);break;case t.ui.keyCode.RIGHT:this._move("next",e);break;case t.ui.keyCode.HOME:case t.ui.keyCode.PAGE_UP:this._move("first",e);break;case t.ui.keyCode.END:case t.ui.keyCode.PAGE_DOWN:this._move("last",e);break;default:this.menu.trigger(e),i=!1}i&&e.preventDefault()}},_selectFocusedItem:function(t){var e=this.menuItems.eq(this.focusIndex).parent("li");e.hasClass("ui-state-disabled")||this._select(e.data("ui-selectmenu-item"),t)},_select:function(t,e){var i=this.element[0].selectedIndex;this.element[0].selectedIndex=t.index,this.buttonItem.replaceWith(this.buttonItem=this._renderButtonItem(t)),this._setAria(t),this._trigger("select",e,{item:t}),t.index!==i&&this._trigger("change",e,{item:t}),this.close(e)},_setAria:function(t){var e=this.menuItems.eq(t.index).attr("id");this.button.attr({"aria-labelledby":e,"aria-activedescendant":e}),this.menu.attr("aria-activedescendant",e)},_setOption:function(t,e){if("icons"===t){var i=this.button.find("span.ui-icon");this._removeClass(i,null,this.options.icons.button)._addClass(i,null,e.button)}this._super(t,e),"appendTo"===t&&this.menuWrap.appendTo(this._appendTo()),"width"===t&&this._resizeButton()},_setOptionDisabled:function(t){this._super(t),this.menuInstance.option("disabled",t),this.button.attr("aria-disabled",t),this._toggleClass(this.button,null,"ui-state-disabled",t),this.element.prop("disabled",t),t?(this.button.attr("tabindex",-1),this.close()):this.button.attr("tabindex",0)},_appendTo:function(){var e=this.options.appendTo;return e&&(e=e.jquery||e.nodeType?t(e):this.document.find(e).eq(0)),e&&e[0]||(e=this.element.closest(".ui-front, dialog")),e.length||(e=this.document[0].body),e},_toggleAttr:function(){this.button.attr("aria-expanded",this.isOpen),this._removeClass(this.button,"ui-selectmenu-button-"+(this.isOpen?"closed":"open"))._addClass(this.button,"ui-selectmenu-button-"+(this.isOpen?"open":"closed"))._toggleClass(this.menuWrap,"ui-selectmenu-open",null,this.isOpen),this.menu.attr("aria-hidden",!this.isOpen)},_resizeButton:function(){var t=this.options.width;return t===!1?(this.button.css("width",""),void 0):(null===t&&(t=this.element.show().outerWidth(),this.element.hide()),this.button.outerWidth(t),void 0)},_resizeMenu:function(){this.menu.outerWidth(Math.max(this.button.outerWidth(),this.menu.width("").outerWidth()+1))},_getCreateOptions:function(){var t=this._super();return t.disabled=this.element.prop("disabled"),t},_parseOptions:function(e){var i=this,s=[];e.each(function(e,n){s.push(i._parseOption(t(n),e))}),this.items=s},_parseOption:function(t,e){var i=t.parent("optgroup");return{element:t,index:e,value:t.val(),label:t.text(),optgroup:i.attr("label")||"",disabled:i.prop("disabled")||t.prop("disabled")}},_destroy:function(){this._unbindFormResetHandler(),this.menuWrap.remove(),this.button.remove(),this.element.show(),this.element.removeUniqueId(),this.labels.attr("for",this.ids.element)}}]),t.widget("ui.slider",t.ui.mouse,{version:"1.12.1",widgetEventPrefix:"slide",options:{animate:!1,classes:{"ui-slider":"ui-corner-all","ui-slider-handle":"ui-corner-all","ui-slider-range":"ui-corner-all ui-widget-header"},distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null,change:null,slide:null,start:null,stop:null},numPages:5,_create:function(){this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this._calculateNewMax(),this._addClass("ui-slider ui-slider-"+this.orientation,"ui-widget ui-widget-content"),this._refresh(),this._animateOff=!1},_refresh:function(){this._createRange(),this._createHandles(),this._setupEvents(),this._refreshValue()},_createHandles:function(){var e,i,s=this.options,n=this.element.find(".ui-slider-handle"),o="<span tabindex='0'></span>",a=[];for(i=s.values&&s.values.length||1,n.length>i&&(n.slice(i).remove(),n=n.slice(0,i)),e=n.length;i>e;e++)a.push(o);this.handles=n.add(t(a.join("")).appendTo(this.element)),this._addClass(this.handles,"ui-slider-handle","ui-state-default"),this.handle=this.handles.eq(0),this.handles.each(function(e){t(this).data("ui-slider-handle-index",e).attr("tabIndex",0)})},_createRange:function(){var e=this.options;e.range?(e.range===!0&&(e.values?e.values.length&&2!==e.values.length?e.values=[e.values[0],e.values[0]]:t.isArray(e.values)&&(e.values=e.values.slice(0)):e.values=[this._valueMin(),this._valueMin()]),this.range&&this.range.length?(this._removeClass(this.range,"ui-slider-range-min ui-slider-range-max"),this.range.css({left:"",bottom:""})):(this.range=t("<div>").appendTo(this.element),this._addClass(this.range,"ui-slider-range")),("min"===e.range||"max"===e.range)&&this._addClass(this.range,"ui-slider-range-"+e.range)):(this.range&&this.range.remove(),this.range=null)},_setupEvents:function(){this._off(this.handles),this._on(this.handles,this._handleEvents),this._hoverable(this.handles),this._focusable(this.handles)},_destroy:function(){this.handles.remove(),this.range&&this.range.remove(),this._mouseDestroy()},_mouseCapture:function(e){var i,s,n,o,a,r,l,h,c=this,u=this.options;return u.disabled?!1:(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),i={x:e.pageX,y:e.pageY},s=this._normValueFromMouse(i),n=this._valueMax()-this._valueMin()+1,this.handles.each(function(e){var i=Math.abs(s-c.values(e));(n>i||n===i&&(e===c._lastChangedValue||c.values(e)===u.min))&&(n=i,o=t(this),a=e)}),r=this._start(e,a),r===!1?!1:(this._mouseSliding=!0,this._handleIndex=a,this._addClass(o,null,"ui-state-active"),o.trigger("focus"),l=o.offset(),h=!t(e.target).parents().addBack().is(".ui-slider-handle"),this._clickOffset=h?{left:0,top:0}:{left:e.pageX-l.left-o.width()/2,top:e.pageY-l.top-o.height()/2-(parseInt(o.css("borderTopWidth"),10)||0)-(parseInt(o.css("borderBottomWidth"),10)||0)+(parseInt(o.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(e,a,s),this._animateOff=!0,!0))},_mouseStart:function(){return!0},_mouseDrag:function(t){var e={x:t.pageX,y:t.pageY},i=this._normValueFromMouse(e);return this._slide(t,this._handleIndex,i),!1},_mouseStop:function(t){return this._removeClass(this.handles,null,"ui-state-active"),this._mouseSliding=!1,this._stop(t,this._handleIndex),this._change(t,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1,!1},_detectOrientation:function(){this.orientation="vertical"===this.options.orientation?"vertical":"horizontal"},_normValueFromMouse:function(t){var e,i,s,n,o;return"horizontal"===this.orientation?(e=this.elementSize.width,i=t.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(e=this.elementSize.height,i=t.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),s=i/e,s>1&&(s=1),0>s&&(s=0),"vertical"===this.orientation&&(s=1-s),n=this._valueMax()-this._valueMin(),o=this._valueMin()+s*n,this._trimAlignValue(o)},_uiHash:function(t,e,i){var s={handle:this.handles[t],handleIndex:t,value:void 0!==e?e:this.value()};return this._hasMultipleValues()&&(s.value=void 0!==e?e:this.values(t),s.values=i||this.values()),s},_hasMultipleValues:function(){return this.options.values&&this.options.values.length},_start:function(t,e){return this._trigger("start",t,this._uiHash(e))},_slide:function(t,e,i){var s,n,o=this.value(),a=this.values();this._hasMultipleValues()&&(n=this.values(e?0:1),o=this.values(e),2===this.options.values.length&&this.options.range===!0&&(i=0===e?Math.min(n,i):Math.max(n,i)),a[e]=i),i!==o&&(s=this._trigger("slide",t,this._uiHash(e,i,a)),s!==!1&&(this._hasMultipleValues()?this.values(e,i):this.value(i)))},_stop:function(t,e){this._trigger("stop",t,this._uiHash(e))},_change:function(t,e){this._keySliding||this._mouseSliding||(this._lastChangedValue=e,this._trigger("change",t,this._uiHash(e)))},value:function(t){return arguments.length?(this.options.value=this._trimAlignValue(t),this._refreshValue(),this._change(null,0),void 0):this._value()},values:function(e,i){var s,n,o;if(arguments.length>1)return this.options.values[e]=this._trimAlignValue(i),this._refreshValue(),this._change(null,e),void 0;if(!arguments.length)return this._values();if(!t.isArray(arguments[0]))return this._hasMultipleValues()?this._values(e):this.value();for(s=this.options.values,n=arguments[0],o=0;s.length>o;o+=1)s[o]=this._trimAlignValue(n[o]),this._change(null,o);this._refreshValue()},_setOption:function(e,i){var s,n=0;switch("range"===e&&this.options.range===!0&&("min"===i?(this.options.value=this._values(0),this.options.values=null):"max"===i&&(this.options.value=this._values(this.options.values.length-1),this.options.values=null)),t.isArray(this.options.values)&&(n=this.options.values.length),this._super(e,i),e){case"orientation":this._detectOrientation(),this._removeClass("ui-slider-horizontal ui-slider-vertical")._addClass("ui-slider-"+this.orientation),this._refreshValue(),this.options.range&&this._refreshRange(i),this.handles.css("horizontal"===i?"bottom":"left","");break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":for(this._animateOff=!0,this._refreshValue(),s=n-1;s>=0;s--)this._change(null,s);this._animateOff=!1;break;case"step":case"min":case"max":this._animateOff=!0,this._calculateNewMax(),this._refreshValue(),this._animateOff=!1;break;case"range":this._animateOff=!0,this._refresh(),this._animateOff=!1}},_setOptionDisabled:function(t){this._super(t),this._toggleClass(null,"ui-state-disabled",!!t)},_value:function(){var t=this.options.value;return t=this._trimAlignValue(t)},_values:function(t){var e,i,s;if(arguments.length)return e=this.options.values[t],e=this._trimAlignValue(e);if(this._hasMultipleValues()){for(i=this.options.values.slice(),s=0;i.length>s;s+=1)i[s]=this._trimAlignValue(i[s]);return i}return[]},_trimAlignValue:function(t){if(this._valueMin()>=t)return this._valueMin();if(t>=this._valueMax())return this._valueMax();var e=this.options.step>0?this.options.step:1,i=(t-this._valueMin())%e,s=t-i;return 2*Math.abs(i)>=e&&(s+=i>0?e:-e),parseFloat(s.toFixed(5))},_calculateNewMax:function(){var t=this.options.max,e=this._valueMin(),i=this.options.step,s=Math.round((t-e)/i)*i;t=s+e,t>this.options.max&&(t-=i),this.max=parseFloat(t.toFixed(this._precision()))},_precision:function(){var t=this._precisionOf(this.options.step);return null!==this.options.min&&(t=Math.max(t,this._precisionOf(this.options.min))),t},_precisionOf:function(t){var e=""+t,i=e.indexOf(".");return-1===i?0:e.length-i-1},_valueMin:function(){return this.options.min},_valueMax:function(){return this.max},_refreshRange:function(t){"vertical"===t&&this.range.css({width:"",left:""}),"horizontal"===t&&this.range.css({height:"",bottom:""})},_refreshValue:function(){var e,i,s,n,o,a=this.options.range,r=this.options,l=this,h=this._animateOff?!1:r.animate,c={};this._hasMultipleValues()?this.handles.each(function(s){i=100*((l.values(s)-l._valueMin())/(l._valueMax()-l._valueMin())),c["horizontal"===l.orientation?"left":"bottom"]=i+"%",t(this).stop(1,1)[h?"animate":"css"](c,r.animate),l.options.range===!0&&("horizontal"===l.orientation?(0===s&&l.range.stop(1,1)[h?"animate":"css"]({left:i+"%"},r.animate),1===s&&l.range[h?"animate":"css"]({width:i-e+"%"},{queue:!1,duration:r.animate})):(0===s&&l.range.stop(1,1)[h?"animate":"css"]({bottom:i+"%"},r.animate),1===s&&l.range[h?"animate":"css"]({height:i-e+"%"},{queue:!1,duration:r.animate}))),e=i}):(s=this.value(),n=this._valueMin(),o=this._valueMax(),i=o!==n?100*((s-n)/(o-n)):0,c["horizontal"===this.orientation?"left":"bottom"]=i+"%",this.handle.stop(1,1)[h?"animate":"css"](c,r.animate),"min"===a&&"horizontal"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({width:i+"%"},r.animate),"max"===a&&"horizontal"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({width:100-i+"%"},r.animate),"min"===a&&"vertical"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({height:i+"%"},r.animate),"max"===a&&"vertical"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({height:100-i+"%"},r.animate))},_handleEvents:{keydown:function(e){var i,s,n,o,a=t(e.target).data("ui-slider-handle-index");switch(e.keyCode){case t.ui.keyCode.HOME:case t.ui.keyCode.END:case t.ui.keyCode.PAGE_UP:case t.ui.keyCode.PAGE_DOWN:case t.ui.keyCode.UP:case t.ui.keyCode.RIGHT:case t.ui.keyCode.DOWN:case t.ui.keyCode.LEFT:if(e.preventDefault(),!this._keySliding&&(this._keySliding=!0,this._addClass(t(e.target),null,"ui-state-active"),i=this._start(e,a),i===!1))return}switch(o=this.options.step,s=n=this._hasMultipleValues()?this.values(a):this.value(),e.keyCode){case t.ui.keyCode.HOME:n=this._valueMin();break;case t.ui.keyCode.END:n=this._valueMax();break;case t.ui.keyCode.PAGE_UP:n=this._trimAlignValue(s+(this._valueMax()-this._valueMin())/this.numPages);break;case t.ui.keyCode.PAGE_DOWN:n=this._trimAlignValue(s-(this._valueMax()-this._valueMin())/this.numPages);break;case t.ui.keyCode.UP:case t.ui.keyCode.RIGHT:if(s===this._valueMax())return;n=this._trimAlignValue(s+o);break;case t.ui.keyCode.DOWN:case t.ui.keyCode.LEFT:if(s===this._valueMin())return;n=this._trimAlignValue(s-o)}this._slide(e,a,n)},keyup:function(e){var i=t(e.target).data("ui-slider-handle-index");this._keySliding&&(this._keySliding=!1,this._stop(e,i),this._change(e,i),this._removeClass(t(e.target),null,"ui-state-active"))}}})});
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

  //var href = '/'+lang.href_prefix+'account/notification';
  var href =  $('#account_notifications_link').attr('href');

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
      var href =  $('#account_notifications_link').attr('href');
      e.preventDefault();
      if ($('.header-noty-box').hasClass('header-noty-box_open')) {
        $('.header-noty-box').removeClass('header-noty-box_open');
        $('html').removeClass('no_scrol_laptop_min');
      } else {
        $('.header-noty-box').addClass('header-noty-box_open');
        $('html').addClass('no_scrol_laptop_min');

        if ($(this).hasClass('has-noty')) {
          $.post(href, function () {
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
    if ($this.data('popup') != 1) {
      return;
    }
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
    $('#'+searchtext).data('popup', $(this).data('popup'));

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
        '<a href="#'+lang.href_prefix+'/registration" class="btn btn-transform modals_open">'+lg("register")+'</a>' +
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
        '<a href="#'+lang["href_prefix"]+'/registration" class="btn btn-transform modals_open">'+lg("register")+'</a>' +
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
    var promourl = e[k].getAttribute('data-promourl');
    var self_promo = (promo && promo.length > 0)? "setTimeout(function(){send_promo('"+promo+"',"+promourl+");},2000);" : "";
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

function send_promo(promo, promourl){
  $.ajax({
    method: "post",
    url: promourl,
    //url: "/account/promo",
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

    //блоки подлежащие загрузке Если такие есть , то сразу запрос
    var requests = false;

    if (typeof ajax_requests !== 'undefined') {
        requests = JSON.parse(ajax_requests);
        for (var i=0 ; i < requests.length; i++)  {
            var url = requests[i].url ? requests[i].url : location.href;
            getData(url, requests[i].blocks, function() {
                share42();//t отобразились кнопки Поделиться
                sdTooltip.setEvents();//работали тултипы
                banner.refresh();//обновить баннер от гугл
                imagesTest();//проверка картинок
                sd_accordeon();//работал аккордеон
                product_filter();//ползунок цены
            }, null);
        }
    }


    //при клике на кнопки
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
        var blocks = ['content-wrap'];//блок по умолчаниюю
        if (requests) {
            //если заданы запросы, то замена блоков из с первого запроса
            blocks = requests[0].blocks;
        }


        getData(url, blocks, function(){
            share42();//отобразились кнопки Поделиться
            sdTooltip.setEvents();//работали тултипы
            banner.refresh();//обновить баннер от гугл
            imagesTest();//проверка картинок
            window.history.pushState("object or string", "Title", url);
            $(that).removeClass('loading');
            if (top > scrollTop) {
                $('html, body').animate({scrollTop: scrollTop}, 500);
            }
            sd_accordeon();
        },function(){
            $(that).removeClass('loading');
            notification.notifi({type:'err', 'title':lg('error'), 'message':lg('error_querying_data')});
        });
    });

    function getData(url, blocks, success, fail) { //url, blocks, succesCollback, failCallback
        url += url.indexOf('?') > - 1 ? '&g=ajax_load' : '?g=ajax_load';
        $.get(url, {}, function (data) {
            for (var i = 0; i < blocks.length; i++) {
                $('body').find('#' + blocks[i]).html($(data).find('#' + blocks[i]).html());
            }
            if (success) {
                success();
            }
        }).fail(function () {
            if (fail) {
                fail();
            }
        });
    }

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
function product_filter() {

    var slider = $("#filter-slider-price");
    var textStart = $('#slider-price-start');
    var textFinish = $('#slider-price-end');

    var startRange = parseInt($(textStart).data('range'), 10),
        finishRange = parseInt($(textFinish).data('range'), 10),
        startUser = parseInt($(textStart).data('user'), 10),
        finishUser = parseInt($(textFinish).data('user'), 10);
    //console.log(startRange, finishRange, startUser, finishUser);
    slider.slider({
        range: true,
        min: startRange,
        max: finishRange,
        values: [startUser,
            finishUser],
        slide: function (event, ui) {
            // console.log(ui.values[ 0 ] + " - " + ui.values[ 1 ]);
            $(textStart).val(ui.values[0]);
            $(textFinish).val(ui.values[1]);
        }
    });


    function priceStartChange(e) {
        var that = $(this),
            strValue = that.val(),
            intValue = parseInt(strValue) || 0,//если неправильно, то 0
            startRange = parseInt(that.data('range')),
            finishRange = parseInt(textFinish.val());

        if (intValue < startRange) { //если меньше диапазона, то по нижнему пределу
            intValue = startRange;
        }
        if (intValue > finishRange) { //если выше диапазона, то  верхниму пределу
            intValue = finishRange;
        }
        slider.slider('values', 0, intValue); //новое значение слайдера
        that.val(intValue);  //повтрояем его для самого поля
    }

    function priceFinishChange(e) {
        var that = $(this),
            startRange = parseInt(textStart.val()),
            strValue = that.val(),
            finishRange = parseInt(that.data('range')),
            intValue = parseInt(strValue) || finishRange;//если неправильно, то максимум

        if (intValue < startRange) { //если меньше диапазона, то по нижнему пределу
            intValue = startRange;
        }
        if (intValue > finishRange) { //если выше диапазона, то  верхниму пределу
            intValue = finishRange;
        }
        slider.slider('values', 1, intValue); //новое значение слайдера
        that.val(intValue);  //повтрояем его для самого поля

    }

    textStart.on('change', priceStartChange);//при изменениии полей ввода цены
    textFinish.on('change', priceFinishChange);//при изменениии полей ввода цены

    $('input.catalog_product_filter-checkbox_item-checkbox').on('change', function(){
        if ($(this).prop('checked')) {
            $(this).parent().addClass('checked');
        } else {
            $(this).parent().removeClass('checked');
        }
    });

}
product_filter();
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

  $('body').on('click', '.favorite-link', function(e) {
  //$(".favorite-link").on('click', function (e) {
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
    var href =  $('#account_favorites_link').attr('href');

    $.post(href, {
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
function imagesTest() {
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
      img.removeClass(data.loadingClass);
    }else{
      img.css('background-image', 'url('+data.src+')');
      img.removeClass('no_ava');
    }
  }

  function testImg(imgs, no_img, loadingClass){
    if(!imgs || imgs.length==0)return;
    loadingClass = loadingClass || false;
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
        data.loadingClass = loadingClass ? loadingClass : '';
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
      }).on('load', img_load_finish.bind(data));
      image.data('data',data);
      if (loadingClass) {
        img.addClass(loadingClass);
      }
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
  testImg(imgs, '/images/'+lang.key+'-no-image.png');

}

$(document).ready(function() {
  imagesTest();
});


//если открыто как дочернее
(function () {
  if (!window.opener)return;
  try {
    href = window.opener.location.href;
    if (
      href.indexOf('/account/offline') > 0
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
    $.post(lang.href_prefix+'/cookie', {name:name, value:value, days:days}, function(data){
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxhbmd1YWdlLmpzIiwibGFuZy5qcyIsImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsImpxdWVyeS11aS5taW4uanMiLCJ0b29sdGlwLmpzIiwiYWNjb3VudF9ub3RpZmljYXRpb24uanMiLCJzbGlkZXIuanMiLCJoZWFkZXJfbWVudV9hbmRfc2VhcmNoLmpzIiwiY2FsYy1jYXNoYmFjay5qcyIsImF1dG9faGlkZV9jb250cm9sLmpzIiwiaGlkZV9zaG93X2FsbC5qcyIsImNsb2NrLmpzIiwibGlzdF90eXBlX3N3aXRjaGVyLmpzIiwic2VsZWN0LmpzIiwic2VhcmNoLmpzIiwiZ290by5qcyIsImFjY291bnQtd2l0aGRyYXcuanMiLCJhamF4LmpzIiwiZG9icm8uanMiLCJsZWZ0LW1lbnUtdG9nZ2xlLmpzIiwic2hhcmU0Mi5qcyIsInVzZXJfcmV2aWV3cy5qcyIsInBsYWNlaG9sZGVyLmpzIiwiYWpheC1sb2FkLmpzIiwiYmFubmVyLmpzIiwiY291bnRyeV9zZWxlY3QuanMiLCJ1c2Vyc19vbmxpbmUuanMiLCJwcm9kdWN0X2ZpbHRlci5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsIm1vZGFscy5qcyIsImZvb3Rlcl9tZW51LmpzIiwicmF0aW5nLmpzIiwiZmF2b3JpdGVzLmpzIiwic2Nyb2xsX3RvLmpzIiwiY29weV90b19jbGlwYm9hcmQuanMiLCJpbWcuanMiLCJwYXJlbnRzX29wZW5fd2luZG93cy5qcyIsImZvcm1zLmpzIiwiY29va2llLmpzIiwidGFibGUuanMiLCJhamF4X3JlbW92ZS5qcyIsImZpeGVzLmpzIiwibGlua3MuanMiLCJzdG9yZV9wb2ludHMuanMiLCJoYXNodGFncy5qcyIsInBsdWdpbnMuanMiLCJtdWx0aXBsZS1zZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JnQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM1VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGxnID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbGFuZz17fTtcbiAgdXJsPScvbGFuZ3VhZ2UvJytkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZysnLmpzb24nO1xuICAkLmdldCh1cmwsZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEpO1xuICAgIGZvcih2YXIgaW5kZXggaW4gZGF0YSkge1xuICAgICAgZGF0YVtpbmRleF09Y2xlYXJWYXIoZGF0YVtpbmRleF0pO1xuICAgIH1cbiAgICBsYW5nPWRhdGE7XG4gICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KFwibGFuZ3VhZ2VfbG9hZGVkXCIpO1xuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIC8vY29uc29sZS5sb2coZGF0YSwgZXZlbnQpO1xuICB9LCdqc29uJyk7XG5cbiAgZnVuY3Rpb24gY2xlYXJWYXIodHh0KXtcbiAgICB0eHQ9dHh0LnJlcGxhY2UoL1xccysvZyxcIiBcIik7Ly/Rg9C00LDQu9C10L3QuNC1INC30LDQtNCy0L7QtdC90LjQtSDQv9GA0L7QsdC10LvQvtCyXG5cbiAgICAvL9Cn0LjRgdGC0LjQvCDQv9C+0LTRgdGC0LDQstC70Y/QtdC80YvQtSDQv9C10YDQtdC80LXQvdC90YvQtVxuICAgIHN0cj10eHQubWF0Y2goL1xceyguKj8pXFx9L2cpO1xuICAgIGlmICggc3RyICE9IG51bGwpIHtcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBzdHJfdD1zdHJbaV0ucmVwbGFjZSgvIC9nLFwiXCIpO1xuICAgICAgICB0eHQ9dHh0LnJlcGxhY2Uoc3RyW2ldLHN0cl90KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHR4dDtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbih0cGwsIGRhdGEpe1xuICAgIGlmKHR5cGVvZihsYW5nW3RwbF0pPT1cInVuZGVmaW5lZFwiKXtcbiAgICAgIGNvbnNvbGUubG9nKFwibGFuZyBub3QgZm91bmQ6IFwiK3RwbCk7XG4gICAgICByZXR1cm4gdHBsO1xuICAgIH1cbiAgICB0cGw9bGFuZ1t0cGxdO1xuICAgIGlmKHR5cGVvZihkYXRhKT09XCJvYmplY3RcIil7XG4gICAgICBmb3IodmFyIGluZGV4IGluIGRhdGEpIHtcbiAgICAgICAgdHBsPXRwbC5zcGxpdChcIntcIitpbmRleCtcIn1cIikuam9pbihkYXRhW2luZGV4XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cGw7XG4gIH1cbn0pKCk7IiwidmFyIGxhbmcgPSAoZnVuY3Rpb24oKXtcbiAgICB2YXIgY29kZSA9ICdydS1SVSc7XG4gICAgdmFyIGtleSA9ICdydSc7XG4gICAgdmFyIHVybF9wcmVmaXggPSdydSc7XG5cbiAgICB2YXIgZWxlbSA9ICQoXCIjc2RfbGFuZ19saXN0XCIpO1xuICAgIGlmIChlbGVtKSB7XG4gICAgICAgIGNvZGUgPSAkKGVsZW0pLmRhdGEoJ2NvZGUnKSA/ICQoZWxlbSkuZGF0YSgnY29kZScpIDogY29kZTtcbiAgICAgICAga2V5ID0gJChlbGVtKS5kYXRhKCdrZXknKSA/ICQoZWxlbSkuZGF0YSgna2V5JykgOiBrZXk7XG4gICAgICAgIHVybF9wcmVmaXggPSAkKGVsZW0pLmRhdGEoJ3VybC1wcmVmaXgnKSA/ICQoZWxlbSkuZGF0YSgndXJsLXByZWZpeCcpIDogdXJsX3ByZWZpeDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb2RlOiBjb2RlLFxuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgaHJlZl9wcmVmaXg6IHVybF9wcmVmaXhcbiAgICB9XG59KSgpO1xuIiwib2JqZWN0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIHZhciBjID0gYixcbiAgICBrZXk7XG4gIGZvciAoa2V5IGluIGEpIHtcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGM7XG59O1xuXG5mdW5jdGlvbiBsb2dpbl9yZWRpcmVjdChuZXdfaHJlZikge1xuICBocmVmID0gbG9jYXRpb24uaHJlZjtcbiAgaWYgKGhyZWYuaW5kZXhPZignc3RvcmUnKSA+IDAgfHwgaHJlZi5pbmRleE9mKCdzaG9wJyk+MCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpID4gMCB8fCBocmVmLmluZGV4T2YoJ3VybCgnKSA+IDApIHtcbiAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgfSBlbHNlIHtcbiAgICBsb2NhdGlvbi5ocmVmID0gbmV3X2hyZWY7XG4gIH1cbn1cbiIsIihmdW5jdGlvbiAodywgZCwgJCkge1xuICB2YXIgc2xpZGVfaW50ZXJ2YWw9NDAwMDtcbiAgdmFyIHNjcm9sbHNfYmxvY2sgPSAkKCcuc2Nyb2xsX2JveCcpO1xuXG4gIGlmIChzY3JvbGxzX2Jsb2NrLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gIC8vJCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpLndyYXBBbGwoc2Nyb2xsc19ibG9jayk7XG4gICQoc2Nyb2xsc19ibG9jaykud3JhcCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpO1xuXG4gIGluaXRfc2Nyb2xsKCk7XG4gIGNhbGNfc2Nyb2xsKCk7XG5cbiAgJCh3aW5kb3cgKS5vbihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgY2FsY19zY3JvbGwoKTtcbiAgfSk7XG4gIHZhciB0MSwgdDI7XG5cbiAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHQxKTtcbiAgICBjbGVhclRpbWVvdXQodDIpO1xuICAgIHQxID0gc2V0VGltZW91dChjYWxjX3Njcm9sbCwgMzAwKTtcbiAgICB0MiA9IHNldFRpbWVvdXQoY2FsY19zY3JvbGwsIDgwMCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGluaXRfc2Nyb2xsKCkge1xuICAgIHZhciBjb250cm9sID0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xcIj48L2Rpdj4nO1xuICAgIGNvbnRyb2wgPSAkKGNvbnRyb2wpO1xuICAgIGNvbnRyb2wuaW5zZXJ0QWZ0ZXIoc2Nyb2xsc19ibG9jayk7XG4gICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTtcblxuICAgIHNjcm9sbHNfYmxvY2sucHJlcGVuZCgnPGRpdiBjbGFzcz1zY3JvbGxfYm94LW1vdmVyPjwvZGl2PicpO1xuXG4gICAgY29udHJvbC5vbignY2xpY2snLCAnLnNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICB2YXIgY29udHJvbCA9ICR0aGlzLnBhcmVudCgpO1xuICAgICAgdmFyIGkgPSAkdGhpcy5pbmRleCgpO1xuICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdhY3RpdmUnKSlyZXR1cm47XG4gICAgICBjb250cm9sLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAkdGhpcy5hZGRDbGFzcygnYWN0aXZlJyk7XG5cbiAgICAgIHZhciBkeCA9IGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnKTtcbiAgICAgIHZhciBlbCA9IGNvbnRyb2wucHJldigpO1xuICAgICAgZWwuZmluZCgnLnNjcm9sbF9ib3gtbW92ZXInKS5jc3MoJ21hcmdpbi1sZWZ0JywgLWR4ICogaSk7XG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGkpO1xuXG4gICAgICBzdG9wU2Nyb2wuYmluZChlbCkoKTtcbiAgICB9KVxuICB9XG5cbiAgZm9yICh2YXIgaiA9IDA7IGogPCBzY3JvbGxzX2Jsb2NrLmxlbmd0aDsgaisrKSB7XG4gICAgdmFyIGVsID0gc2Nyb2xsc19ibG9jay5lcShqKTtcbiAgICBlbC5wYXJlbnQoKS5ob3ZlcihzdG9wU2Nyb2wuYmluZChlbCksIHN0YXJ0U2Nyb2wuYmluZChlbCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRTY3JvbCgpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgIGlmICghJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XG5cbiAgICB2YXIgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLmJpbmQoJHRoaXMpLCBzbGlkZV9pbnRlcnZhbCk7XG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJywgdGltZW91dElkKVxuICB9XG5cbiAgZnVuY3Rpb24gc3RvcFNjcm9sKCkge1xuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgdmFyIHRpbWVvdXRJZCA9ICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpO1xuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIGZhbHNlKTtcbiAgICBpZiAoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikgfHwgIXRpbWVvdXRJZClyZXR1cm47XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJywgZmFsc2UpO1xuICAgIGlmICghJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XG5cbiAgICB2YXIgY29udHJvbHMgPSAkdGhpcy5uZXh0KCkuZmluZCgnPionKTtcbiAgICB2YXIgYWN0aXZlID0gJHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJyk7XG4gICAgdmFyIHBvaW50X2NudCA9IGNvbnRyb2xzLmxlbmd0aDtcbiAgICBpZiAoIWFjdGl2ZSlhY3RpdmUgPSAwO1xuICAgIGFjdGl2ZSsrO1xuICAgIGlmIChhY3RpdmUgPj0gcG9pbnRfY250KWFjdGl2ZSA9IDA7XG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJywgYWN0aXZlKTtcblxuICAgIGNvbnRyb2xzLmVxKGFjdGl2ZSkuY2xpY2soKTtcbiAgICBzdGFydFNjcm9sLmJpbmQoJHRoaXMpKCk7XG4gIH1cblxuICBmdW5jdGlvbiBjYWxjX3Njcm9sbCgpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGVsID0gc2Nyb2xsc19ibG9jay5lcShpKTtcbiAgICAgIHZhciBjb250cm9sID0gZWwubmV4dCgpO1xuICAgICAgdmFyIHdpZHRoX21heCA9IGVsLmRhdGEoJ3Njcm9sbC13aWR0aC1tYXgnKTtcbiAgICAgIHcgPSBlbC53aWR0aCgpO1xuXG4gICAgICAvL9C00LXQu9Cw0LXQvCDQutC+0L3RgtGA0L7Qu9GMINC+0LPRgNCw0L3QuNGH0LXQvdC40Y8g0YjQuNGA0LjQvdGLLiDQldGB0LvQuCDQv9GA0LXQstGL0YjQtdC90L4g0YLQviDQvtGC0LrQu9GO0YfQsNC10Lwg0YHQutGA0L7QuyDQuCDQv9C10YDQtdGF0L7QtNC40Lwg0Log0YHQu9C10LTRg9GO0YnQtdC80YMg0Y3Qu9C10LzQtdC90YLRg1xuICAgICAgaWYgKHdpZHRoX21heCAmJiB3ID4gd2lkdGhfbWF4KSB7XG4gICAgICAgIGNvbnRyb2wucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBub19jbGFzcyA9IGVsLmRhdGEoJ3Njcm9sbC1lbGVtZXQtaWdub3JlLWNsYXNzJyk7XG4gICAgICB2YXIgY2hpbGRyZW4gPSBlbC5maW5kKCc+KicpLm5vdCgnLnNjcm9sbF9ib3gtbW92ZXInKTtcbiAgICAgIGlmIChub19jbGFzcykge1xuICAgICAgICBjaGlsZHJlbiA9IGNoaWxkcmVuLm5vdCgnLicgKyBub19jbGFzcylcbiAgICAgIH1cblxuICAgICAgLy/QldGB0LvQuCDQvdC10YIg0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXG4gICAgICBpZiAoY2hpbGRyZW4gPT0gMCkge1xuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGZfZWwgPSBjaGlsZHJlbi5lcSgxKTtcbiAgICAgIHZhciBjaGlsZHJlbl93ID0gZl9lbC5vdXRlcldpZHRoKCk7IC8v0LLRgdC10LPQviDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcbiAgICAgIGNoaWxkcmVuX3cgKz0gcGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLWxlZnQnKSk7XG4gICAgICBjaGlsZHJlbl93ICs9IHBhcnNlRmxvYXQoZl9lbC5jc3MoJ21hcmdpbi1yaWdodCcpKTtcblxuICAgICAgdmFyIHNjcmVhbl9jb3VudCA9IE1hdGguZmxvb3IodyAvIGNoaWxkcmVuX3cpO1xuXG4gICAgICAvL9CV0YHQu9C4INCy0YHQtSDQstC70LDQt9C40YIg0L3QsCDRjdC60YDQsNC9XG4gICAgICBpZiAoY2hpbGRyZW4gPD0gc2NyZWFuX2NvdW50KSB7XG4gICAgICAgIGVsLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvL9Cj0LbQtSDRgtC+0YfQvdC+INC30L3QsNC10Lwg0YfRgtC+INGB0LrRgNC+0Lsg0L3Rg9C20LXQvVxuICAgICAgZWwuYWRkQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcblxuICAgICAgdmFyIHBvaW50X2NudCA9IGNoaWxkcmVuLmxlbmd0aCAtIHNjcmVhbl9jb3VudCArIDE7XG4gICAgICAvL9C10YHQu9C4INC90LUg0L3QsNC00L4g0L7QsdC90L7QstC70Y/RgtGMINC60L7QvdGC0YDQvtC7INGC0L4g0LLRi9GF0L7QtNC40LwsINC90LUg0LfQsNCx0YvQstCw0Y8g0L7QsdC90L7QstC40YLRjCDRiNC40YDQuNC90YMg0LTQvtGH0LXRgNC90LjRhVxuICAgICAgaWYgKGNvbnRyb2wuZmluZCgnPionKS5sZW5ndGggPT0gcG9pbnRfY250KSB7XG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGFjdGl2ZSA9IGVsLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xuICAgICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcbiAgICAgIGlmIChhY3RpdmUgPj0gcG9pbnRfY250KWFjdGl2ZSA9IHBvaW50X2NudCAtIDE7XG4gICAgICB2YXIgb3V0ID0gJyc7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvaW50X2NudDsgaisrKSB7XG4gICAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcgKyAoaiA9PSBhY3RpdmUgPyAnIGFjdGl2ZScgOiAnJykgKyAnXCI+PC9kaXY+JztcbiAgICAgIH1cbiAgICAgIGNvbnRyb2wuaHRtbChvdXQpO1xuXG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWNvdW50JywgcG9pbnRfY250KTtcbiAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcblxuICAgICAgaWYgKCFlbC5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKSkge1xuICAgICAgICBzdGFydFNjcm9sLmJpbmQoZWwpKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSkpO1xuIiwiZnVuY3Rpb24gc2RfYWNjb3JkZW9uKCkge1xuXG4gICAgdmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xuXG4gICAgYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcblxuXG4gICAgICAgIGlmICgkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tdGl0bGUnKS5oYXNDbGFzcygnYWNjb3JkaW9uLXRpdGxlLWRpc2FibGVkJykpIHJldHVybjtcblxuICAgICAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAgICAgICAvKmlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKXtcbiAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgfSovXG4gICAgICAgICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlVXAoMzAwKTtcbiAgICAgICAgICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKSB7XG4gICAgICAgICAgICAgICAgJG90aGVyID0gJCgnLmFjY29yZGlvbi1vbmx5X29uZScpO1xuICAgICAgICAgICAgICAgICRvdGhlci5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKVxuICAgICAgICAgICAgICAgICAgICAuc2xpZGVVcCgzMDApXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG4gICAgICAgICAgICAgICAgJG90aGVyLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICAgICAgJG90aGVyLnJlbW92ZUNsYXNzKCdsYXN0LW9wZW4nKTtcblxuICAgICAgICAgICAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xuICAgICAgICAgICAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zbGlkZURvd24oMzAwKTtcbiAgICAgICAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gICAgYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XG5cblxuICAgICQoJy5hY2NvcmRpb24td3JhcC5vcGVuX2ZpcnN0IC5hY2NvcmRpb246Zmlyc3QtY2hpbGQnKS5hZGRDbGFzcygnb3BlbicpO1xuICAgICQoJy5hY2NvcmRpb24td3JhcCAuYWNjb3JkaW9uLmFjY29yZGlvbi1zbGltOmZpcnN0LWNoaWxkJykuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAkKCcuYWNjb3JkaW9uLXNsaW0nKS5hZGRDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJyk7XG5cbi8v0LTQu9GPINGB0LjQvNC+0LIg0L7RgtC60YDRi9Cy0LDQtdC8INC10YHQu9C4INC10YHRgtGMINC/0L7QvNC10YLQutCwIG9wZW4g0YLQviDQv9GA0LjRgdCy0LDQuNCy0LDQtdC8INCy0YHQtSDQvtGB0YLQsNC70YzQvdGL0LUg0LrQu9Cw0YHRi1xuICAgIGFjY29yZGlvblNsaW0gPSAkKCcuYWNjb3JkaW9uLmFjY29yZGlvbi1vbmx5X29uZScpO1xuICAgIGlmIChhY2NvcmRpb25TbGltLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYWNjb3JkaW9uU2xpbS5wYXJlbnQoKS5maW5kKCcuYWNjb3JkaW9uLm9wZW4nKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdsYXN0LW9wZW4nKVxuICAgICAgICAgICAgLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXG4gICAgICAgICAgICAuc2hvdygzMDApXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xuICAgIH1cblxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJy5hY2NvcmRpb25fZnVsbHNjcmVhbl9jbG9zZS5vcGVuIC5hY2NvcmRpb24tY29udHJvbDpmaXJzdC1jaGlsZCcpLmNsaWNrKClcbiAgICB9KTtcblxuICAgICQoJy5hY2NvcmRpb24tY29udGVudCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC50YWdOYW1lICE9ICdBJykge1xuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuYWNjb3JkaW9uJykuZmluZCgnLmFjY29yZGlvbi1jb250cm9sLmFjY29yZGlvbi10aXRsZScpLmNsaWNrKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgICQoJy5hY2NvcmRpb24tY29udGVudCBhJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2FuZ2xlLXVwJykpIHJldHVybjtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgIH0pO1xuXG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVscyA9ICQoJy5hY2NvcmRpb25fbW9yZScpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGFkZEJ1dHRvbihlbCwgY2xhc3NOYW1lLCB0aXRsZSkge1xuICAgICAgICAgICAgdmFyIGJ1dHRvbnMgPSAkKGVsKS5maW5kKCcuJyArIGNsYXNzTmFtZSk7XG4gICAgICAgICAgICBpZiAoYnV0dG9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgYnV0dG9uID0gJCgnPGRpdj4nKS5hZGRDbGFzcyhjbGFzc05hbWUpLmFkZENsYXNzKCdhY2NvcmRpb25fbW9yZV9idXR0b24nKTtcbiAgICAgICAgICAgICAgICB2YXIgYSA9ICQoJzxhPicpLmF0dHIoJ2hyZWYnLCBcIlwiKS5hZGRDbGFzcygnYmx1ZScpLmh0bWwodGl0bGUpO1xuICAgICAgICAgICAgICAgICQoYnV0dG9uKS5hcHBlbmQoYSk7XG4gICAgICAgICAgICAgICAgJChlbCkuYXBwZW5kKGJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5hY2NvcmRpb25fbW9yZV9idXR0b25fbW9yZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb25fbW9yZScpLmFkZENsYXNzKCdvcGVuJyk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5hY2NvcmRpb25fbW9yZV9idXR0b25fbGVzcycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb25fbW9yZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgZnVuY3Rpb24gcmVidWlsZCgpIHtcbiAgICAgICAgICAgICQoZWxzKS5lYWNoKGZ1bmN0aW9uIChrZXksIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5hY2NvcmRpb25fbW9yZV9jb250ZW50Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRlbnQuc2Nyb2xsSGVpZ2h0ID4gY29udGVudC5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkQnV0dG9uKGl0ZW0sICdhY2NvcmRpb25fbW9yZV9idXR0b25fbW9yZScsICfQn9C+0LTRgNC+0LHQvdC10LUnKTtcbiAgICAgICAgICAgICAgICAgICAgYWRkQnV0dG9uKGl0ZW0sICdhY2NvcmRpb25fbW9yZV9idXR0b25fbGVzcycsICfQodC60YDRi9GC0YwnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkKGl0ZW0pLmZpbmQoJy5hY2NvcmRpb25fbW9yZV9idXR0b24nKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShyZWJ1aWxkKTtcblxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdsYW5ndWFnZV9sb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZWJ1aWxkKCk7XG4gICAgICAgIH0sIGZhbHNlKTtcblxuICAgIH0pKCk7XG5cbi8v0YTQuNC70YzRgtGAINC/0YDQvtC40LfQstC+0LTQuNGC0LXQu9C10LkgLSDRhNC40LvRjNGC0YDQsNGG0LjRjyDRjdC70LXQvNC10L3RgtC+0LJcbiAgICAkKCcjY2F0YWxvZ19wcm9kdWN0X2ZpbHRlci1pbnB1dCcpLmtleXVwKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgdmFsID0gJCh0aGlzKS52YWwoKS5sZW5ndGggPiAyID8gJCh0aGlzKS52YWwoKS50b1VwcGVyQ2FzZSgpIDogZmFsc2U7XG4gICAgICAgIHZhciBvcGVuQ291bnQgPSAwO1xuICAgICAgICB2YXIgbGlzdCA9ICQodGhpcykuY2xvc2VzdCgnLmNhdGFsb2dfcHJvZHVjdF9maWx0ZXItaXRlbXMtaXRlbS1jaGVja2JveCcpO1xuICAgICAgICBpZiAoIXZhbCkge1xuICAgICAgICAgICAgJChsaXN0KS5yZW1vdmVDbGFzcygnYWNjb3JkaW9uX2hpZGUnKTtcbiAgICAgICAgfVxuICAgICAgICAkKCcuY2F0YWxvZ19wcm9kdWN0X2ZpbHRlci1jaGVja2JveF9pdGVtJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0gJChpdGVtKS5maW5kKCdsYWJlbCcpLnRleHQoKTtcbiAgICAgICAgICAgIGlmICghdmFsKSB7XG4gICAgICAgICAgICAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnaGlkZScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMCwgdmFsLmxlbmd0aCkudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSA9PSB2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICBvcGVuQ291bnQrKztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkKGl0ZW0pLmFkZENsYXNzKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHZhbCAmJiBvcGVuQ291bnQgPD0gMTApIHtcbiAgICAgICAgICAgICQobGlzdCkuYWRkQ2xhc3MoJ2FjY29yZGlvbl9oaWRlJyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG59XG5zZF9hY2NvcmRlb24oKTtcblxuXG5cbiIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xuICB2YXIgZmlsZUFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiA/IHRydWUgOiBmYWxzZTtcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcidcbiAgfTtcbiAgdmFyIGxhc3RfcG9zdCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIG9uUG9zdChwb3N0KSB7XG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XG4gICAgLy9jb25zb2xlLmxvZyhwb3N0LCB0aGlzKTtcbiAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XG4gICAgdmFyIHdyYXBfaHRtbCA9IGRhdGEud3JhcF9odG1sO1xuXG4gICAgaWYgKHBvc3QucmVuZGVyKSB7XG4gICAgICBwb3N0Lm5vdHlmeV9jbGFzcyA9IFwibm90aWZ5X3doaXRlXCI7XG4gICAgICBub3RpZmljYXRpb24uYWxlcnQocG9zdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIGlmIChwb3N0Lmh0bWwpIHtcbiAgICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XG4gICAgICAgIGFqYXhGb3JtKHdyYXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFwb3N0LmVycm9yKSB7XG4gICAgICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgIHdyYXAuaHRtbCh3cmFwX2h0bWwpO1xuICAgICAgICAgIGZvcm0uZmluZCgnaW5wdXRbdHlwZT10ZXh0XSx0ZXh0YXJlYScpLnZhbCgnJyk7XG4gICAgICAgICAgYWpheEZvcm0od3JhcCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBvc3QuZXJyb3IgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGZvciAodmFyIGluZGV4IGluIHBvc3QuZXJyb3IpIHtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IGxnKCdlcnJvcicpLFxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpbmRleF1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvc3QuZXJyb3IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IGxnKCdlcnJvcicpLFxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpXVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHBvc3QuZXJyb3IgfHwgcG9zdC5tZXNzYWdlKSB7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IChwb3N0LmVycm9yID09PSBmYWxzZSA/IGxnKCdzdWNjZXNzJykgOiBsZygnZXJyb3InKSksXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0Lm1lc3NhZ2UgPyBwb3N0Lm1lc3NhZ2UgOiBwb3N0LmVycm9yXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICAvL1xuICAgIC8vIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgIC8vICAgICAndHlwZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ3N1Y2Nlc3MnIDogJ2VycicsXG4gICAgLy8gICAgICd0aXRsZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ9Cj0YHQv9C10YjQvdC+JyA6ICfQntGI0LjQsdC60LAnLFxuICAgIC8vICAgICAnbWVzc2FnZSc6IEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikgPyBwb3N0LmVycm9yWzBdIDogKHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3IpXG4gICAgLy8gfSk7XG4gIH1cblxuICBmdW5jdGlvbiBvbkZhaWwoKSB7XG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICB3cmFwLmh0bWwoXG4gICAgICAgICc8aDM+JytsZygnc29ycnlfbm90X2V4cGVjdGVkX2Vycm9yJykrJzxoMz4nICtcbiAgICAgICAgbGcoJ2l0X2hhcHBlbnNfc29tZXRpbWVzJylcbiAgICApO1xuICAgIGFqYXhGb3JtKHdyYXApO1xuXG4gIH1cblxuICBmdW5jdGlvbiBvblN1Ym1pdChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAvL2Uuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB2YXIgY3VycmVudFRpbWVNaWxsaXMgPSArbmV3IERhdGUoKTtcbiAgICBpZiAoY3VycmVudFRpbWVNaWxsaXMgLSBsYXN0X3Bvc3QgPCAxMDAwICogMikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxhc3RfcG9zdCA9IGN1cnJlbnRUaW1lTWlsbGlzO1xuICAgIHZhciBkYXRhID0gdGhpcztcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcbiAgICBkYXRhLndyYXBfaHRtbD13cmFwLmh0bWwoKTtcbiAgICB2YXIgaXNWYWxpZCA9IHRydWU7XG5cbiAgICAvL2luaXQod3JhcCk7XG5cbiAgICB2YXIgcmVxdWlyZWQgPSBmb3JtLmZpbmQoJ2lucHV0LnJlcXVpcmVkLCB0ZXh0YXJlYS5yZXF1aXJlZCwgaW5wdXRbaWQ9XCJzdXBwb3J0LXJlY2FwdGNoYVwiXScpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVxdWlyZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWxwQmxvY2sgPSByZXF1aXJlZC5lcShpKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmZpbmQoJy5oZWxwLWJsb2NrJyk7XG4gICAgICB2YXIgaGVscE1lc3NhZ2UgPSBoZWxwQmxvY2sgJiYgaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA/IGhlbHBCbG9jay5kYXRhKCdtZXNzYWdlJykgOiBsZygncmVxdWlyZWQnKTtcblxuICAgICAgaWYgKHJlcXVpcmVkLmVxKGkpLnZhbCgpLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgJChoZWxwQmxvY2spLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICBoZWxwQmxvY2suaHRtbChoZWxwTWVzc2FnZSk7XG4gICAgICAgIGhlbHBCbG9jay5hZGRDbGFzcygnaGVscC1ibG9jay1lcnJvcicpO1xuICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoZWxwQmxvY2suaHRtbCgnJyk7XG4gICAgICAgICQoaGVscEJsb2NrKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgICAgaGVscEJsb2NrLnJlbW92ZUNsYXNzKCdoZWxwLWJsb2NrLWVycm9yJyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChmb3JtLnlpaUFjdGl2ZUZvcm0pIHtcbiAgICAgIGZvcm0ub2ZmKCdhZnRlclZhbGlkYXRlJyk7XG4gICAgICBmb3JtLm9uKCdhZnRlclZhbGlkYXRlJywgeWlpVmFsaWRhdGlvbi5iaW5kKGRhdGEpKTtcblxuICAgICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScsIHRydWUpO1xuICAgICAgdmFyIGQgPSBmb3JtLmRhdGEoJ3lpaUFjdGl2ZUZvcm0nKTtcbiAgICAgIGlmIChkKSB7XG4gICAgICAgIGQudmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJywgZCk7XG4gICAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcbiAgICAgICAgaXNWYWxpZCA9IGQudmFsaWRhdGVkO1xuICAgICAgfVxuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBpc1ZhbGlkID0gaXNWYWxpZCAmJiAoZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aCA9PSAwKTtcblxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgc2VuZEZvcm0oZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24geWlpVmFsaWRhdGlvbihlKSB7XG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XG5cbiAgICBpZihmb3JtLmZpbmQoZGF0YS5wYXJhbS5lcnJvcl9jbGFzcykubGVuZ3RoID09IDApe1xuICAgICAgc2VuZEZvcm0odGhpcyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VuZEZvcm0oZGF0YSl7XG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XG5cbiAgICBpZiAoIWZvcm0uc2VyaWFsaXplT2JqZWN0KWFkZFNSTygpO1xuXG4gICAgdmFyIHBvc3REYXRhID0gZm9ybS5zZXJpYWxpemVPYmplY3QoKTtcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XG4gICAgZm9ybS5odG1sKCcnKTtcbiAgICBkYXRhLndyYXAuaHRtbCgnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxwPicrbGcoJ3NlbmRpbmdfZGF0YScpKyc8L3A+PC9kaXY+Jyk7XG5cbiAgICBkYXRhLnVybCArPSAoZGF0YS51cmwuaW5kZXhPZignPycpID4gMCA/ICcmJyA6ICc/JykgKyAncmM9JyArIE1hdGgucmFuZG9tKCk7XG4gICAgLy9jb25zb2xlLmxvZyhkYXRhLnVybCk7XG5cbiAgICAvKmlmKCFwb3N0RGF0YS5yZXR1cm5Vcmwpe1xuICAgICAgcG9zdERhdGEucmV0dXJuVXJsPWxvY2F0aW9uLmhyZWY7XG4gICAgfSovXG5cbiAgICBpZih0eXBlb2YgbGFuZyAhPSBcInVuZGVmaW5lZFwiICYmIGRhdGEudXJsLmluZGV4T2YobGFuZ1tcImhyZWZfcHJlZml4XCJdKT09LTEpe1xuICAgICAgZGF0YS51cmw9XCIvXCIrbGFuZ1tcImhyZWZfcHJlZml4XCJdK2RhdGEudXJsO1xuICAgICAgZGF0YS51cmw9ZGF0YS51cmwucmVwbGFjZSgnLy8nLCcvJykucmVwbGFjZSgnLy8nLCcvJyk7XG4gICAgfVxuXG4gICAgJC5wb3N0KFxuICAgICAgZGF0YS51cmwsXG4gICAgICBwb3N0RGF0YSxcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxuICAgICAgJ2pzb24nXG4gICAgKS5mYWlsKG9uRmFpbC5iaW5kKGRhdGEpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQod3JhcCkge1xuICAgIGZvcm0gPSB3cmFwLmZpbmQoJ2Zvcm0nKTtcbiAgICBkYXRhID0ge1xuICAgICAgZm9ybTogZm9ybSxcbiAgICAgIHBhcmFtOiBkZWZhdWx0cyxcbiAgICAgIHdyYXA6IHdyYXBcbiAgICB9O1xuICAgIGRhdGEudXJsID0gZm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xuICAgIGRhdGEubWV0aG9kID0gZm9ybS5hdHRyKCdtZXRob2QnKSB8fCAncG9zdCc7XG4gICAgZm9ybS51bmJpbmQoJ3N1Ym1pdCcpO1xuICAgIC8vZm9ybS5vZmYoJ3N1Ym1pdCcpO1xuICAgIGZvcm0ub24oJ3N1Ym1pdCcsIG9uU3VibWl0LmJpbmQoZGF0YSkpO1xuICB9XG5cbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxuICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpO1xuXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcbiAgICBpbml0KGVscy5lcShpKSk7XG4gIH1cblxuICBpZiAodHlwZW9mIHBsYWNlaG9sZGVyID09ICdmdW5jdGlvbicpIHtcbiAgICAgIHBsYWNlaG9sZGVyKCk7XG4gIH1cblxufVxuXG5mdW5jdGlvbiBhZGRTUk8oKSB7XG4gICQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvID0ge307XG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgJC5lYWNoKGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xuICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xuICAgICAgICB9XG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbztcbiAgfTtcbn07XG5hZGRTUk8oKTsiLCIvKiEgalF1ZXJ5IFVJIC0gdjEuMTIuMSAtIDIwMTgtMTItMjBcbiogaHR0cDovL2pxdWVyeXVpLmNvbVxuKiBJbmNsdWRlczogd2lkZ2V0LmpzLCBwb3NpdGlvbi5qcywgZm9ybS1yZXNldC1taXhpbi5qcywga2V5Y29kZS5qcywgbGFiZWxzLmpzLCB1bmlxdWUtaWQuanMsIHdpZGdldHMvYXV0b2NvbXBsZXRlLmpzLCB3aWRnZXRzL2RhdGVwaWNrZXIuanMsIHdpZGdldHMvbWVudS5qcywgd2lkZ2V0cy9tb3VzZS5qcywgd2lkZ2V0cy9zZWxlY3RtZW51LmpzLCB3aWRnZXRzL3NsaWRlci5qc1xuKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9yczsgTGljZW5zZWQgTUlUICovXG5cbihmdW5jdGlvbih0KXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImpxdWVyeVwiXSx0KTp0KGpRdWVyeSl9KShmdW5jdGlvbih0KXtmdW5jdGlvbiBlKHQpe2Zvcih2YXIgZSxpO3QubGVuZ3RoJiZ0WzBdIT09ZG9jdW1lbnQ7KXtpZihlPXQuY3NzKFwicG9zaXRpb25cIiksKFwiYWJzb2x1dGVcIj09PWV8fFwicmVsYXRpdmVcIj09PWV8fFwiZml4ZWRcIj09PWUpJiYoaT1wYXJzZUludCh0LmNzcyhcInpJbmRleFwiKSwxMCksIWlzTmFOKGkpJiYwIT09aSkpcmV0dXJuIGk7dD10LnBhcmVudCgpfXJldHVybiAwfWZ1bmN0aW9uIGkoKXt0aGlzLl9jdXJJbnN0PW51bGwsdGhpcy5fa2V5RXZlbnQ9ITEsdGhpcy5fZGlzYWJsZWRJbnB1dHM9W10sdGhpcy5fZGF0ZXBpY2tlclNob3dpbmc9ITEsdGhpcy5faW5EaWFsb2c9ITEsdGhpcy5fbWFpbkRpdklkPVwidWktZGF0ZXBpY2tlci1kaXZcIix0aGlzLl9pbmxpbmVDbGFzcz1cInVpLWRhdGVwaWNrZXItaW5saW5lXCIsdGhpcy5fYXBwZW5kQ2xhc3M9XCJ1aS1kYXRlcGlja2VyLWFwcGVuZFwiLHRoaXMuX3RyaWdnZXJDbGFzcz1cInVpLWRhdGVwaWNrZXItdHJpZ2dlclwiLHRoaXMuX2RpYWxvZ0NsYXNzPVwidWktZGF0ZXBpY2tlci1kaWFsb2dcIix0aGlzLl9kaXNhYmxlQ2xhc3M9XCJ1aS1kYXRlcGlja2VyLWRpc2FibGVkXCIsdGhpcy5fdW5zZWxlY3RhYmxlQ2xhc3M9XCJ1aS1kYXRlcGlja2VyLXVuc2VsZWN0YWJsZVwiLHRoaXMuX2N1cnJlbnRDbGFzcz1cInVpLWRhdGVwaWNrZXItY3VycmVudC1kYXlcIix0aGlzLl9kYXlPdmVyQ2xhc3M9XCJ1aS1kYXRlcGlja2VyLWRheXMtY2VsbC1vdmVyXCIsdGhpcy5yZWdpb25hbD1bXSx0aGlzLnJlZ2lvbmFsW1wiXCJdPXtjbG9zZVRleHQ6XCJEb25lXCIscHJldlRleHQ6XCJQcmV2XCIsbmV4dFRleHQ6XCJOZXh0XCIsY3VycmVudFRleHQ6XCJUb2RheVwiLG1vbnRoTmFtZXM6W1wiSmFudWFyeVwiLFwiRmVicnVhcnlcIixcIk1hcmNoXCIsXCJBcHJpbFwiLFwiTWF5XCIsXCJKdW5lXCIsXCJKdWx5XCIsXCJBdWd1c3RcIixcIlNlcHRlbWJlclwiLFwiT2N0b2JlclwiLFwiTm92ZW1iZXJcIixcIkRlY2VtYmVyXCJdLG1vbnRoTmFtZXNTaG9ydDpbXCJKYW5cIixcIkZlYlwiLFwiTWFyXCIsXCJBcHJcIixcIk1heVwiLFwiSnVuXCIsXCJKdWxcIixcIkF1Z1wiLFwiU2VwXCIsXCJPY3RcIixcIk5vdlwiLFwiRGVjXCJdLGRheU5hbWVzOltcIlN1bmRheVwiLFwiTW9uZGF5XCIsXCJUdWVzZGF5XCIsXCJXZWRuZXNkYXlcIixcIlRodXJzZGF5XCIsXCJGcmlkYXlcIixcIlNhdHVyZGF5XCJdLGRheU5hbWVzU2hvcnQ6W1wiU3VuXCIsXCJNb25cIixcIlR1ZVwiLFwiV2VkXCIsXCJUaHVcIixcIkZyaVwiLFwiU2F0XCJdLGRheU5hbWVzTWluOltcIlN1XCIsXCJNb1wiLFwiVHVcIixcIldlXCIsXCJUaFwiLFwiRnJcIixcIlNhXCJdLHdlZWtIZWFkZXI6XCJXa1wiLGRhdGVGb3JtYXQ6XCJtbS9kZC95eVwiLGZpcnN0RGF5OjAsaXNSVEw6ITEsc2hvd01vbnRoQWZ0ZXJZZWFyOiExLHllYXJTdWZmaXg6XCJcIn0sdGhpcy5fZGVmYXVsdHM9e3Nob3dPbjpcImZvY3VzXCIsc2hvd0FuaW06XCJmYWRlSW5cIixzaG93T3B0aW9uczp7fSxkZWZhdWx0RGF0ZTpudWxsLGFwcGVuZFRleHQ6XCJcIixidXR0b25UZXh0OlwiLi4uXCIsYnV0dG9uSW1hZ2U6XCJcIixidXR0b25JbWFnZU9ubHk6ITEsaGlkZUlmTm9QcmV2TmV4dDohMSxuYXZpZ2F0aW9uQXNEYXRlRm9ybWF0OiExLGdvdG9DdXJyZW50OiExLGNoYW5nZU1vbnRoOiExLGNoYW5nZVllYXI6ITEseWVhclJhbmdlOlwiYy0xMDpjKzEwXCIsc2hvd090aGVyTW9udGhzOiExLHNlbGVjdE90aGVyTW9udGhzOiExLHNob3dXZWVrOiExLGNhbGN1bGF0ZVdlZWs6dGhpcy5pc284NjAxV2VlayxzaG9ydFllYXJDdXRvZmY6XCIrMTBcIixtaW5EYXRlOm51bGwsbWF4RGF0ZTpudWxsLGR1cmF0aW9uOlwiZmFzdFwiLGJlZm9yZVNob3dEYXk6bnVsbCxiZWZvcmVTaG93Om51bGwsb25TZWxlY3Q6bnVsbCxvbkNoYW5nZU1vbnRoWWVhcjpudWxsLG9uQ2xvc2U6bnVsbCxudW1iZXJPZk1vbnRoczoxLHNob3dDdXJyZW50QXRQb3M6MCxzdGVwTW9udGhzOjEsc3RlcEJpZ01vbnRoczoxMixhbHRGaWVsZDpcIlwiLGFsdEZvcm1hdDpcIlwiLGNvbnN0cmFpbklucHV0OiEwLHNob3dCdXR0b25QYW5lbDohMSxhdXRvU2l6ZTohMSxkaXNhYmxlZDohMX0sdC5leHRlbmQodGhpcy5fZGVmYXVsdHMsdGhpcy5yZWdpb25hbFtcIlwiXSksdGhpcy5yZWdpb25hbC5lbj10LmV4dGVuZCghMCx7fSx0aGlzLnJlZ2lvbmFsW1wiXCJdKSx0aGlzLnJlZ2lvbmFsW1wiZW4tVVNcIl09dC5leHRlbmQoITAse30sdGhpcy5yZWdpb25hbC5lbiksdGhpcy5kcERpdj1zKHQoXCI8ZGl2IGlkPSdcIit0aGlzLl9tYWluRGl2SWQrXCInIGNsYXNzPSd1aS1kYXRlcGlja2VyIHVpLXdpZGdldCB1aS13aWRnZXQtY29udGVudCB1aS1oZWxwZXItY2xlYXJmaXggdWktY29ybmVyLWFsbCc+PC9kaXY+XCIpKX1mdW5jdGlvbiBzKGUpe3ZhciBpPVwiYnV0dG9uLCAudWktZGF0ZXBpY2tlci1wcmV2LCAudWktZGF0ZXBpY2tlci1uZXh0LCAudWktZGF0ZXBpY2tlci1jYWxlbmRhciB0ZCBhXCI7cmV0dXJuIGUub24oXCJtb3VzZW91dFwiLGksZnVuY3Rpb24oKXt0KHRoaXMpLnJlbW92ZUNsYXNzKFwidWktc3RhdGUtaG92ZXJcIiksLTEhPT10aGlzLmNsYXNzTmFtZS5pbmRleE9mKFwidWktZGF0ZXBpY2tlci1wcmV2XCIpJiZ0KHRoaXMpLnJlbW92ZUNsYXNzKFwidWktZGF0ZXBpY2tlci1wcmV2LWhvdmVyXCIpLC0xIT09dGhpcy5jbGFzc05hbWUuaW5kZXhPZihcInVpLWRhdGVwaWNrZXItbmV4dFwiKSYmdCh0aGlzKS5yZW1vdmVDbGFzcyhcInVpLWRhdGVwaWNrZXItbmV4dC1ob3ZlclwiKX0pLm9uKFwibW91c2VvdmVyXCIsaSxuKX1mdW5jdGlvbiBuKCl7dC5kYXRlcGlja2VyLl9pc0Rpc2FibGVkRGF0ZXBpY2tlcihsLmlubGluZT9sLmRwRGl2LnBhcmVudCgpWzBdOmwuaW5wdXRbMF0pfHwodCh0aGlzKS5wYXJlbnRzKFwiLnVpLWRhdGVwaWNrZXItY2FsZW5kYXJcIikuZmluZChcImFcIikucmVtb3ZlQ2xhc3MoXCJ1aS1zdGF0ZS1ob3ZlclwiKSx0KHRoaXMpLmFkZENsYXNzKFwidWktc3RhdGUtaG92ZXJcIiksLTEhPT10aGlzLmNsYXNzTmFtZS5pbmRleE9mKFwidWktZGF0ZXBpY2tlci1wcmV2XCIpJiZ0KHRoaXMpLmFkZENsYXNzKFwidWktZGF0ZXBpY2tlci1wcmV2LWhvdmVyXCIpLC0xIT09dGhpcy5jbGFzc05hbWUuaW5kZXhPZihcInVpLWRhdGVwaWNrZXItbmV4dFwiKSYmdCh0aGlzKS5hZGRDbGFzcyhcInVpLWRhdGVwaWNrZXItbmV4dC1ob3ZlclwiKSl9ZnVuY3Rpb24gbyhlLGkpe3QuZXh0ZW5kKGUsaSk7Zm9yKHZhciBzIGluIGkpbnVsbD09aVtzXSYmKGVbc109aVtzXSk7cmV0dXJuIGV9dC51aT10LnVpfHx7fSx0LnVpLnZlcnNpb249XCIxLjEyLjFcIjt2YXIgYT0wLHI9QXJyYXkucHJvdG90eXBlLnNsaWNlO3QuY2xlYW5EYXRhPWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbihpKXt2YXIgcyxuLG87Zm9yKG89MDtudWxsIT0obj1pW29dKTtvKyspdHJ5e3M9dC5fZGF0YShuLFwiZXZlbnRzXCIpLHMmJnMucmVtb3ZlJiZ0KG4pLnRyaWdnZXJIYW5kbGVyKFwicmVtb3ZlXCIpfWNhdGNoKGEpe31lKGkpfX0odC5jbGVhbkRhdGEpLHQud2lkZ2V0PWZ1bmN0aW9uKGUsaSxzKXt2YXIgbixvLGEscj17fSxsPWUuc3BsaXQoXCIuXCIpWzBdO2U9ZS5zcGxpdChcIi5cIilbMV07dmFyIGg9bCtcIi1cIitlO3JldHVybiBzfHwocz1pLGk9dC5XaWRnZXQpLHQuaXNBcnJheShzKSYmKHM9dC5leHRlbmQuYXBwbHkobnVsbCxbe31dLmNvbmNhdChzKSkpLHQuZXhwcltcIjpcIl1baC50b0xvd2VyQ2FzZSgpXT1mdW5jdGlvbihlKXtyZXR1cm4hIXQuZGF0YShlLGgpfSx0W2xdPXRbbF18fHt9LG49dFtsXVtlXSxvPXRbbF1bZV09ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5fY3JlYXRlV2lkZ2V0Pyhhcmd1bWVudHMubGVuZ3RoJiZ0aGlzLl9jcmVhdGVXaWRnZXQodCxlKSx2b2lkIDApOm5ldyBvKHQsZSl9LHQuZXh0ZW5kKG8sbix7dmVyc2lvbjpzLnZlcnNpb24sX3Byb3RvOnQuZXh0ZW5kKHt9LHMpLF9jaGlsZENvbnN0cnVjdG9yczpbXX0pLGE9bmV3IGksYS5vcHRpb25zPXQud2lkZ2V0LmV4dGVuZCh7fSxhLm9wdGlvbnMpLHQuZWFjaChzLGZ1bmN0aW9uKGUscyl7cmV0dXJuIHQuaXNGdW5jdGlvbihzKT8ocltlXT1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXtyZXR1cm4gaS5wcm90b3R5cGVbZV0uYXBwbHkodGhpcyxhcmd1bWVudHMpfWZ1bmN0aW9uIG4odCl7cmV0dXJuIGkucHJvdG90eXBlW2VdLmFwcGx5KHRoaXMsdCl9cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGUsaT10aGlzLl9zdXBlcixvPXRoaXMuX3N1cGVyQXBwbHk7cmV0dXJuIHRoaXMuX3N1cGVyPXQsdGhpcy5fc3VwZXJBcHBseT1uLGU9cy5hcHBseSh0aGlzLGFyZ3VtZW50cyksdGhpcy5fc3VwZXI9aSx0aGlzLl9zdXBlckFwcGx5PW8sZX19KCksdm9pZCAwKToocltlXT1zLHZvaWQgMCl9KSxvLnByb3RvdHlwZT10LndpZGdldC5leHRlbmQoYSx7d2lkZ2V0RXZlbnRQcmVmaXg6bj9hLndpZGdldEV2ZW50UHJlZml4fHxlOmV9LHIse2NvbnN0cnVjdG9yOm8sbmFtZXNwYWNlOmwsd2lkZ2V0TmFtZTplLHdpZGdldEZ1bGxOYW1lOmh9KSxuPyh0LmVhY2gobi5fY2hpbGRDb25zdHJ1Y3RvcnMsZnVuY3Rpb24oZSxpKXt2YXIgcz1pLnByb3RvdHlwZTt0LndpZGdldChzLm5hbWVzcGFjZStcIi5cIitzLndpZGdldE5hbWUsbyxpLl9wcm90byl9KSxkZWxldGUgbi5fY2hpbGRDb25zdHJ1Y3RvcnMpOmkuX2NoaWxkQ29uc3RydWN0b3JzLnB1c2gobyksdC53aWRnZXQuYnJpZGdlKGUsbyksb30sdC53aWRnZXQuZXh0ZW5kPWZ1bmN0aW9uKGUpe2Zvcih2YXIgaSxzLG49ci5jYWxsKGFyZ3VtZW50cywxKSxvPTAsYT1uLmxlbmd0aDthPm87bysrKWZvcihpIGluIG5bb10pcz1uW29dW2ldLG5bb10uaGFzT3duUHJvcGVydHkoaSkmJnZvaWQgMCE9PXMmJihlW2ldPXQuaXNQbGFpbk9iamVjdChzKT90LmlzUGxhaW5PYmplY3QoZVtpXSk/dC53aWRnZXQuZXh0ZW5kKHt9LGVbaV0scyk6dC53aWRnZXQuZXh0ZW5kKHt9LHMpOnMpO3JldHVybiBlfSx0LndpZGdldC5icmlkZ2U9ZnVuY3Rpb24oZSxpKXt2YXIgcz1pLnByb3RvdHlwZS53aWRnZXRGdWxsTmFtZXx8ZTt0LmZuW2VdPWZ1bmN0aW9uKG4pe3ZhciBvPVwic3RyaW5nXCI9PXR5cGVvZiBuLGE9ci5jYWxsKGFyZ3VtZW50cywxKSxsPXRoaXM7cmV0dXJuIG8/dGhpcy5sZW5ndGh8fFwiaW5zdGFuY2VcIiE9PW4/dGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGksbz10LmRhdGEodGhpcyxzKTtyZXR1cm5cImluc3RhbmNlXCI9PT1uPyhsPW8sITEpOm8/dC5pc0Z1bmN0aW9uKG9bbl0pJiZcIl9cIiE9PW4uY2hhckF0KDApPyhpPW9bbl0uYXBwbHkobyxhKSxpIT09byYmdm9pZCAwIT09aT8obD1pJiZpLmpxdWVyeT9sLnB1c2hTdGFjayhpLmdldCgpKTppLCExKTp2b2lkIDApOnQuZXJyb3IoXCJubyBzdWNoIG1ldGhvZCAnXCIrbitcIicgZm9yIFwiK2UrXCIgd2lkZ2V0IGluc3RhbmNlXCIpOnQuZXJyb3IoXCJjYW5ub3QgY2FsbCBtZXRob2RzIG9uIFwiK2UrXCIgcHJpb3IgdG8gaW5pdGlhbGl6YXRpb247IFwiK1wiYXR0ZW1wdGVkIHRvIGNhbGwgbWV0aG9kICdcIituK1wiJ1wiKX0pOmw9dm9pZCAwOihhLmxlbmd0aCYmKG49dC53aWRnZXQuZXh0ZW5kLmFwcGx5KG51bGwsW25dLmNvbmNhdChhKSkpLHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBlPXQuZGF0YSh0aGlzLHMpO2U/KGUub3B0aW9uKG58fHt9KSxlLl9pbml0JiZlLl9pbml0KCkpOnQuZGF0YSh0aGlzLHMsbmV3IGkobix0aGlzKSl9KSksbH19LHQuV2lkZ2V0PWZ1bmN0aW9uKCl7fSx0LldpZGdldC5fY2hpbGRDb25zdHJ1Y3RvcnM9W10sdC5XaWRnZXQucHJvdG90eXBlPXt3aWRnZXROYW1lOlwid2lkZ2V0XCIsd2lkZ2V0RXZlbnRQcmVmaXg6XCJcIixkZWZhdWx0RWxlbWVudDpcIjxkaXY+XCIsb3B0aW9uczp7Y2xhc3Nlczp7fSxkaXNhYmxlZDohMSxjcmVhdGU6bnVsbH0sX2NyZWF0ZVdpZGdldDpmdW5jdGlvbihlLGkpe2k9dChpfHx0aGlzLmRlZmF1bHRFbGVtZW50fHx0aGlzKVswXSx0aGlzLmVsZW1lbnQ9dChpKSx0aGlzLnV1aWQ9YSsrLHRoaXMuZXZlbnROYW1lc3BhY2U9XCIuXCIrdGhpcy53aWRnZXROYW1lK3RoaXMudXVpZCx0aGlzLmJpbmRpbmdzPXQoKSx0aGlzLmhvdmVyYWJsZT10KCksdGhpcy5mb2N1c2FibGU9dCgpLHRoaXMuY2xhc3Nlc0VsZW1lbnRMb29rdXA9e30saSE9PXRoaXMmJih0LmRhdGEoaSx0aGlzLndpZGdldEZ1bGxOYW1lLHRoaXMpLHRoaXMuX29uKCEwLHRoaXMuZWxlbWVudCx7cmVtb3ZlOmZ1bmN0aW9uKHQpe3QudGFyZ2V0PT09aSYmdGhpcy5kZXN0cm95KCl9fSksdGhpcy5kb2N1bWVudD10KGkuc3R5bGU/aS5vd25lckRvY3VtZW50OmkuZG9jdW1lbnR8fGkpLHRoaXMud2luZG93PXQodGhpcy5kb2N1bWVudFswXS5kZWZhdWx0Vmlld3x8dGhpcy5kb2N1bWVudFswXS5wYXJlbnRXaW5kb3cpKSx0aGlzLm9wdGlvbnM9dC53aWRnZXQuZXh0ZW5kKHt9LHRoaXMub3B0aW9ucyx0aGlzLl9nZXRDcmVhdGVPcHRpb25zKCksZSksdGhpcy5fY3JlYXRlKCksdGhpcy5vcHRpb25zLmRpc2FibGVkJiZ0aGlzLl9zZXRPcHRpb25EaXNhYmxlZCh0aGlzLm9wdGlvbnMuZGlzYWJsZWQpLHRoaXMuX3RyaWdnZXIoXCJjcmVhdGVcIixudWxsLHRoaXMuX2dldENyZWF0ZUV2ZW50RGF0YSgpKSx0aGlzLl9pbml0KCl9LF9nZXRDcmVhdGVPcHRpb25zOmZ1bmN0aW9uKCl7cmV0dXJue319LF9nZXRDcmVhdGVFdmVudERhdGE6dC5ub29wLF9jcmVhdGU6dC5ub29wLF9pbml0OnQubm9vcCxkZXN0cm95OmZ1bmN0aW9uKCl7dmFyIGU9dGhpczt0aGlzLl9kZXN0cm95KCksdC5lYWNoKHRoaXMuY2xhc3Nlc0VsZW1lbnRMb29rdXAsZnVuY3Rpb24odCxpKXtlLl9yZW1vdmVDbGFzcyhpLHQpfSksdGhpcy5lbGVtZW50Lm9mZih0aGlzLmV2ZW50TmFtZXNwYWNlKS5yZW1vdmVEYXRhKHRoaXMud2lkZ2V0RnVsbE5hbWUpLHRoaXMud2lkZ2V0KCkub2ZmKHRoaXMuZXZlbnROYW1lc3BhY2UpLnJlbW92ZUF0dHIoXCJhcmlhLWRpc2FibGVkXCIpLHRoaXMuYmluZGluZ3Mub2ZmKHRoaXMuZXZlbnROYW1lc3BhY2UpfSxfZGVzdHJveTp0Lm5vb3Asd2lkZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZWxlbWVudH0sb3B0aW9uOmZ1bmN0aW9uKGUsaSl7dmFyIHMsbixvLGE9ZTtpZigwPT09YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdC53aWRnZXQuZXh0ZW5kKHt9LHRoaXMub3B0aW9ucyk7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGUpaWYoYT17fSxzPWUuc3BsaXQoXCIuXCIpLGU9cy5zaGlmdCgpLHMubGVuZ3RoKXtmb3Iobj1hW2VdPXQud2lkZ2V0LmV4dGVuZCh7fSx0aGlzLm9wdGlvbnNbZV0pLG89MDtzLmxlbmd0aC0xPm87bysrKW5bc1tvXV09bltzW29dXXx8e30sbj1uW3Nbb11dO2lmKGU9cy5wb3AoKSwxPT09YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdm9pZCAwPT09bltlXT9udWxsOm5bZV07bltlXT1pfWVsc2V7aWYoMT09PWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHZvaWQgMD09PXRoaXMub3B0aW9uc1tlXT9udWxsOnRoaXMub3B0aW9uc1tlXTthW2VdPWl9cmV0dXJuIHRoaXMuX3NldE9wdGlvbnMoYSksdGhpc30sX3NldE9wdGlvbnM6ZnVuY3Rpb24odCl7dmFyIGU7Zm9yKGUgaW4gdCl0aGlzLl9zZXRPcHRpb24oZSx0W2VdKTtyZXR1cm4gdGhpc30sX3NldE9wdGlvbjpmdW5jdGlvbih0LGUpe3JldHVyblwiY2xhc3Nlc1wiPT09dCYmdGhpcy5fc2V0T3B0aW9uQ2xhc3NlcyhlKSx0aGlzLm9wdGlvbnNbdF09ZSxcImRpc2FibGVkXCI9PT10JiZ0aGlzLl9zZXRPcHRpb25EaXNhYmxlZChlKSx0aGlzfSxfc2V0T3B0aW9uQ2xhc3NlczpmdW5jdGlvbihlKXt2YXIgaSxzLG47Zm9yKGkgaW4gZSluPXRoaXMuY2xhc3Nlc0VsZW1lbnRMb29rdXBbaV0sZVtpXSE9PXRoaXMub3B0aW9ucy5jbGFzc2VzW2ldJiZuJiZuLmxlbmd0aCYmKHM9dChuLmdldCgpKSx0aGlzLl9yZW1vdmVDbGFzcyhuLGkpLHMuYWRkQ2xhc3ModGhpcy5fY2xhc3Nlcyh7ZWxlbWVudDpzLGtleXM6aSxjbGFzc2VzOmUsYWRkOiEwfSkpKX0sX3NldE9wdGlvbkRpc2FibGVkOmZ1bmN0aW9uKHQpe3RoaXMuX3RvZ2dsZUNsYXNzKHRoaXMud2lkZ2V0KCksdGhpcy53aWRnZXRGdWxsTmFtZStcIi1kaXNhYmxlZFwiLG51bGwsISF0KSx0JiYodGhpcy5fcmVtb3ZlQ2xhc3ModGhpcy5ob3ZlcmFibGUsbnVsbCxcInVpLXN0YXRlLWhvdmVyXCIpLHRoaXMuX3JlbW92ZUNsYXNzKHRoaXMuZm9jdXNhYmxlLG51bGwsXCJ1aS1zdGF0ZS1mb2N1c1wiKSl9LGVuYWJsZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zZXRPcHRpb25zKHtkaXNhYmxlZDohMX0pfSxkaXNhYmxlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3NldE9wdGlvbnMoe2Rpc2FibGVkOiEwfSl9LF9jbGFzc2VzOmZ1bmN0aW9uKGUpe2Z1bmN0aW9uIGkoaSxvKXt2YXIgYSxyO2ZvcihyPTA7aS5sZW5ndGg+cjtyKyspYT1uLmNsYXNzZXNFbGVtZW50TG9va3VwW2lbcl1dfHx0KCksYT1lLmFkZD90KHQudW5pcXVlKGEuZ2V0KCkuY29uY2F0KGUuZWxlbWVudC5nZXQoKSkpKTp0KGEubm90KGUuZWxlbWVudCkuZ2V0KCkpLG4uY2xhc3Nlc0VsZW1lbnRMb29rdXBbaVtyXV09YSxzLnB1c2goaVtyXSksbyYmZS5jbGFzc2VzW2lbcl1dJiZzLnB1c2goZS5jbGFzc2VzW2lbcl1dKX12YXIgcz1bXSxuPXRoaXM7cmV0dXJuIGU9dC5leHRlbmQoe2VsZW1lbnQ6dGhpcy5lbGVtZW50LGNsYXNzZXM6dGhpcy5vcHRpb25zLmNsYXNzZXN8fHt9fSxlKSx0aGlzLl9vbihlLmVsZW1lbnQse3JlbW92ZTpcIl91bnRyYWNrQ2xhc3Nlc0VsZW1lbnRcIn0pLGUua2V5cyYmaShlLmtleXMubWF0Y2goL1xcUysvZyl8fFtdLCEwKSxlLmV4dHJhJiZpKGUuZXh0cmEubWF0Y2goL1xcUysvZyl8fFtdKSxzLmpvaW4oXCIgXCIpfSxfdW50cmFja0NsYXNzZXNFbGVtZW50OmZ1bmN0aW9uKGUpe3ZhciBpPXRoaXM7dC5lYWNoKGkuY2xhc3Nlc0VsZW1lbnRMb29rdXAsZnVuY3Rpb24ocyxuKXstMSE9PXQuaW5BcnJheShlLnRhcmdldCxuKSYmKGkuY2xhc3Nlc0VsZW1lbnRMb29rdXBbc109dChuLm5vdChlLnRhcmdldCkuZ2V0KCkpKX0pfSxfcmVtb3ZlQ2xhc3M6ZnVuY3Rpb24odCxlLGkpe3JldHVybiB0aGlzLl90b2dnbGVDbGFzcyh0LGUsaSwhMSl9LF9hZGRDbGFzczpmdW5jdGlvbih0LGUsaSl7cmV0dXJuIHRoaXMuX3RvZ2dsZUNsYXNzKHQsZSxpLCEwKX0sX3RvZ2dsZUNsYXNzOmZ1bmN0aW9uKHQsZSxpLHMpe3M9XCJib29sZWFuXCI9PXR5cGVvZiBzP3M6aTt2YXIgbj1cInN0cmluZ1wiPT10eXBlb2YgdHx8bnVsbD09PXQsbz17ZXh0cmE6bj9lOmksa2V5czpuP3Q6ZSxlbGVtZW50Om4/dGhpcy5lbGVtZW50OnQsYWRkOnN9O3JldHVybiBvLmVsZW1lbnQudG9nZ2xlQ2xhc3ModGhpcy5fY2xhc3NlcyhvKSxzKSx0aGlzfSxfb246ZnVuY3Rpb24oZSxpLHMpe3ZhciBuLG89dGhpcztcImJvb2xlYW5cIiE9dHlwZW9mIGUmJihzPWksaT1lLGU9ITEpLHM/KGk9bj10KGkpLHRoaXMuYmluZGluZ3M9dGhpcy5iaW5kaW5ncy5hZGQoaSkpOihzPWksaT10aGlzLmVsZW1lbnQsbj10aGlzLndpZGdldCgpKSx0LmVhY2gocyxmdW5jdGlvbihzLGEpe2Z1bmN0aW9uIHIoKXtyZXR1cm4gZXx8by5vcHRpb25zLmRpc2FibGVkIT09ITAmJiF0KHRoaXMpLmhhc0NsYXNzKFwidWktc3RhdGUtZGlzYWJsZWRcIik/KFwic3RyaW5nXCI9PXR5cGVvZiBhP29bYV06YSkuYXBwbHkobyxhcmd1bWVudHMpOnZvaWQgMH1cInN0cmluZ1wiIT10eXBlb2YgYSYmKHIuZ3VpZD1hLmd1aWQ9YS5ndWlkfHxyLmd1aWR8fHQuZ3VpZCsrKTt2YXIgbD1zLm1hdGNoKC9eKFtcXHc6LV0qKVxccyooLiopJC8pLGg9bFsxXStvLmV2ZW50TmFtZXNwYWNlLGM9bFsyXTtjP24ub24oaCxjLHIpOmkub24oaCxyKX0pfSxfb2ZmOmZ1bmN0aW9uKGUsaSl7aT0oaXx8XCJcIikuc3BsaXQoXCIgXCIpLmpvaW4odGhpcy5ldmVudE5hbWVzcGFjZStcIiBcIikrdGhpcy5ldmVudE5hbWVzcGFjZSxlLm9mZihpKS5vZmYoaSksdGhpcy5iaW5kaW5ncz10KHRoaXMuYmluZGluZ3Mubm90KGUpLmdldCgpKSx0aGlzLmZvY3VzYWJsZT10KHRoaXMuZm9jdXNhYmxlLm5vdChlKS5nZXQoKSksdGhpcy5ob3ZlcmFibGU9dCh0aGlzLmhvdmVyYWJsZS5ub3QoZSkuZ2V0KCkpfSxfZGVsYXk6ZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKCl7cmV0dXJuKFwic3RyaW5nXCI9PXR5cGVvZiB0P3NbdF06dCkuYXBwbHkocyxhcmd1bWVudHMpfXZhciBzPXRoaXM7cmV0dXJuIHNldFRpbWVvdXQoaSxlfHwwKX0sX2hvdmVyYWJsZTpmdW5jdGlvbihlKXt0aGlzLmhvdmVyYWJsZT10aGlzLmhvdmVyYWJsZS5hZGQoZSksdGhpcy5fb24oZSx7bW91c2VlbnRlcjpmdW5jdGlvbihlKXt0aGlzLl9hZGRDbGFzcyh0KGUuY3VycmVudFRhcmdldCksbnVsbCxcInVpLXN0YXRlLWhvdmVyXCIpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKGUpe3RoaXMuX3JlbW92ZUNsYXNzKHQoZS5jdXJyZW50VGFyZ2V0KSxudWxsLFwidWktc3RhdGUtaG92ZXJcIil9fSl9LF9mb2N1c2FibGU6ZnVuY3Rpb24oZSl7dGhpcy5mb2N1c2FibGU9dGhpcy5mb2N1c2FibGUuYWRkKGUpLHRoaXMuX29uKGUse2ZvY3VzaW46ZnVuY3Rpb24oZSl7dGhpcy5fYWRkQ2xhc3ModChlLmN1cnJlbnRUYXJnZXQpLG51bGwsXCJ1aS1zdGF0ZS1mb2N1c1wiKX0sZm9jdXNvdXQ6ZnVuY3Rpb24oZSl7dGhpcy5fcmVtb3ZlQ2xhc3ModChlLmN1cnJlbnRUYXJnZXQpLG51bGwsXCJ1aS1zdGF0ZS1mb2N1c1wiKX19KX0sX3RyaWdnZXI6ZnVuY3Rpb24oZSxpLHMpe3ZhciBuLG8sYT10aGlzLm9wdGlvbnNbZV07aWYocz1zfHx7fSxpPXQuRXZlbnQoaSksaS50eXBlPShlPT09dGhpcy53aWRnZXRFdmVudFByZWZpeD9lOnRoaXMud2lkZ2V0RXZlbnRQcmVmaXgrZSkudG9Mb3dlckNhc2UoKSxpLnRhcmdldD10aGlzLmVsZW1lbnRbMF0sbz1pLm9yaWdpbmFsRXZlbnQpZm9yKG4gaW4gbyluIGluIGl8fChpW25dPW9bbl0pO3JldHVybiB0aGlzLmVsZW1lbnQudHJpZ2dlcihpLHMpLCEodC5pc0Z1bmN0aW9uKGEpJiZhLmFwcGx5KHRoaXMuZWxlbWVudFswXSxbaV0uY29uY2F0KHMpKT09PSExfHxpLmlzRGVmYXVsdFByZXZlbnRlZCgpKX19LHQuZWFjaCh7c2hvdzpcImZhZGVJblwiLGhpZGU6XCJmYWRlT3V0XCJ9LGZ1bmN0aW9uKGUsaSl7dC5XaWRnZXQucHJvdG90eXBlW1wiX1wiK2VdPWZ1bmN0aW9uKHMsbixvKXtcInN0cmluZ1wiPT10eXBlb2YgbiYmKG49e2VmZmVjdDpufSk7dmFyIGEscj1uP249PT0hMHx8XCJudW1iZXJcIj09dHlwZW9mIG4/aTpuLmVmZmVjdHx8aTplO249bnx8e30sXCJudW1iZXJcIj09dHlwZW9mIG4mJihuPXtkdXJhdGlvbjpufSksYT0hdC5pc0VtcHR5T2JqZWN0KG4pLG4uY29tcGxldGU9byxuLmRlbGF5JiZzLmRlbGF5KG4uZGVsYXkpLGEmJnQuZWZmZWN0cyYmdC5lZmZlY3RzLmVmZmVjdFtyXT9zW2VdKG4pOnIhPT1lJiZzW3JdP3Nbcl0obi5kdXJhdGlvbixuLmVhc2luZyxvKTpzLnF1ZXVlKGZ1bmN0aW9uKGkpe3QodGhpcylbZV0oKSxvJiZvLmNhbGwoc1swXSksaSgpfSl9fSksdC53aWRnZXQsZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsZSxpKXtyZXR1cm5bcGFyc2VGbG9hdCh0WzBdKSoodS50ZXN0KHRbMF0pP2UvMTAwOjEpLHBhcnNlRmxvYXQodFsxXSkqKHUudGVzdCh0WzFdKT9pLzEwMDoxKV19ZnVuY3Rpb24gaShlLGkpe3JldHVybiBwYXJzZUludCh0LmNzcyhlLGkpLDEwKXx8MH1mdW5jdGlvbiBzKGUpe3ZhciBpPWVbMF07cmV0dXJuIDk9PT1pLm5vZGVUeXBlP3t3aWR0aDplLndpZHRoKCksaGVpZ2h0OmUuaGVpZ2h0KCksb2Zmc2V0Ont0b3A6MCxsZWZ0OjB9fTp0LmlzV2luZG93KGkpP3t3aWR0aDplLndpZHRoKCksaGVpZ2h0OmUuaGVpZ2h0KCksb2Zmc2V0Ont0b3A6ZS5zY3JvbGxUb3AoKSxsZWZ0OmUuc2Nyb2xsTGVmdCgpfX06aS5wcmV2ZW50RGVmYXVsdD97d2lkdGg6MCxoZWlnaHQ6MCxvZmZzZXQ6e3RvcDppLnBhZ2VZLGxlZnQ6aS5wYWdlWH19Ont3aWR0aDplLm91dGVyV2lkdGgoKSxoZWlnaHQ6ZS5vdXRlckhlaWdodCgpLG9mZnNldDplLm9mZnNldCgpfX12YXIgbixvPU1hdGgubWF4LGE9TWF0aC5hYnMscj0vbGVmdHxjZW50ZXJ8cmlnaHQvLGw9L3RvcHxjZW50ZXJ8Ym90dG9tLyxoPS9bXFwrXFwtXVxcZCsoXFwuW1xcZF0rKT8lPy8sYz0vXlxcdysvLHU9LyUkLyxkPXQuZm4ucG9zaXRpb247dC5wb3NpdGlvbj17c2Nyb2xsYmFyV2lkdGg6ZnVuY3Rpb24oKXtpZih2b2lkIDAhPT1uKXJldHVybiBuO3ZhciBlLGkscz10KFwiPGRpdiBzdHlsZT0nZGlzcGxheTpibG9jaztwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDo1MHB4O2hlaWdodDo1MHB4O292ZXJmbG93OmhpZGRlbjsnPjxkaXYgc3R5bGU9J2hlaWdodDoxMDBweDt3aWR0aDphdXRvOyc+PC9kaXY+PC9kaXY+XCIpLG89cy5jaGlsZHJlbigpWzBdO3JldHVybiB0KFwiYm9keVwiKS5hcHBlbmQocyksZT1vLm9mZnNldFdpZHRoLHMuY3NzKFwib3ZlcmZsb3dcIixcInNjcm9sbFwiKSxpPW8ub2Zmc2V0V2lkdGgsZT09PWkmJihpPXNbMF0uY2xpZW50V2lkdGgpLHMucmVtb3ZlKCksbj1lLWl9LGdldFNjcm9sbEluZm86ZnVuY3Rpb24oZSl7dmFyIGk9ZS5pc1dpbmRvd3x8ZS5pc0RvY3VtZW50P1wiXCI6ZS5lbGVtZW50LmNzcyhcIm92ZXJmbG93LXhcIikscz1lLmlzV2luZG93fHxlLmlzRG9jdW1lbnQ/XCJcIjplLmVsZW1lbnQuY3NzKFwib3ZlcmZsb3cteVwiKSxuPVwic2Nyb2xsXCI9PT1pfHxcImF1dG9cIj09PWkmJmUud2lkdGg8ZS5lbGVtZW50WzBdLnNjcm9sbFdpZHRoLG89XCJzY3JvbGxcIj09PXN8fFwiYXV0b1wiPT09cyYmZS5oZWlnaHQ8ZS5lbGVtZW50WzBdLnNjcm9sbEhlaWdodDtyZXR1cm57d2lkdGg6bz90LnBvc2l0aW9uLnNjcm9sbGJhcldpZHRoKCk6MCxoZWlnaHQ6bj90LnBvc2l0aW9uLnNjcm9sbGJhcldpZHRoKCk6MH19LGdldFdpdGhpbkluZm86ZnVuY3Rpb24oZSl7dmFyIGk9dChlfHx3aW5kb3cpLHM9dC5pc1dpbmRvdyhpWzBdKSxuPSEhaVswXSYmOT09PWlbMF0ubm9kZVR5cGUsbz0hcyYmIW47cmV0dXJue2VsZW1lbnQ6aSxpc1dpbmRvdzpzLGlzRG9jdW1lbnQ6bixvZmZzZXQ6bz90KGUpLm9mZnNldCgpOntsZWZ0OjAsdG9wOjB9LHNjcm9sbExlZnQ6aS5zY3JvbGxMZWZ0KCksc2Nyb2xsVG9wOmkuc2Nyb2xsVG9wKCksd2lkdGg6aS5vdXRlcldpZHRoKCksaGVpZ2h0Omkub3V0ZXJIZWlnaHQoKX19fSx0LmZuLnBvc2l0aW9uPWZ1bmN0aW9uKG4pe2lmKCFufHwhbi5vZilyZXR1cm4gZC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7bj10LmV4dGVuZCh7fSxuKTt2YXIgdSxwLGYsZyxtLF8sdj10KG4ub2YpLGI9dC5wb3NpdGlvbi5nZXRXaXRoaW5JbmZvKG4ud2l0aGluKSx5PXQucG9zaXRpb24uZ2V0U2Nyb2xsSW5mbyhiKSx3PShuLmNvbGxpc2lvbnx8XCJmbGlwXCIpLnNwbGl0KFwiIFwiKSxrPXt9O3JldHVybiBfPXModiksdlswXS5wcmV2ZW50RGVmYXVsdCYmKG4uYXQ9XCJsZWZ0IHRvcFwiKSxwPV8ud2lkdGgsZj1fLmhlaWdodCxnPV8ub2Zmc2V0LG09dC5leHRlbmQoe30sZyksdC5lYWNoKFtcIm15XCIsXCJhdFwiXSxmdW5jdGlvbigpe3ZhciB0LGUsaT0oblt0aGlzXXx8XCJcIikuc3BsaXQoXCIgXCIpOzE9PT1pLmxlbmd0aCYmKGk9ci50ZXN0KGlbMF0pP2kuY29uY2F0KFtcImNlbnRlclwiXSk6bC50ZXN0KGlbMF0pP1tcImNlbnRlclwiXS5jb25jYXQoaSk6W1wiY2VudGVyXCIsXCJjZW50ZXJcIl0pLGlbMF09ci50ZXN0KGlbMF0pP2lbMF06XCJjZW50ZXJcIixpWzFdPWwudGVzdChpWzFdKT9pWzFdOlwiY2VudGVyXCIsdD1oLmV4ZWMoaVswXSksZT1oLmV4ZWMoaVsxXSksa1t0aGlzXT1bdD90WzBdOjAsZT9lWzBdOjBdLG5bdGhpc109W2MuZXhlYyhpWzBdKVswXSxjLmV4ZWMoaVsxXSlbMF1dfSksMT09PXcubGVuZ3RoJiYod1sxXT13WzBdKSxcInJpZ2h0XCI9PT1uLmF0WzBdP20ubGVmdCs9cDpcImNlbnRlclwiPT09bi5hdFswXSYmKG0ubGVmdCs9cC8yKSxcImJvdHRvbVwiPT09bi5hdFsxXT9tLnRvcCs9ZjpcImNlbnRlclwiPT09bi5hdFsxXSYmKG0udG9wKz1mLzIpLHU9ZShrLmF0LHAsZiksbS5sZWZ0Kz11WzBdLG0udG9wKz11WzFdLHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBzLHIsbD10KHRoaXMpLGg9bC5vdXRlcldpZHRoKCksYz1sLm91dGVySGVpZ2h0KCksZD1pKHRoaXMsXCJtYXJnaW5MZWZ0XCIpLF89aSh0aGlzLFwibWFyZ2luVG9wXCIpLHg9aCtkK2kodGhpcyxcIm1hcmdpblJpZ2h0XCIpK3kud2lkdGgsQz1jK18raSh0aGlzLFwibWFyZ2luQm90dG9tXCIpK3kuaGVpZ2h0LEQ9dC5leHRlbmQoe30sbSksVD1lKGsubXksbC5vdXRlcldpZHRoKCksbC5vdXRlckhlaWdodCgpKTtcInJpZ2h0XCI9PT1uLm15WzBdP0QubGVmdC09aDpcImNlbnRlclwiPT09bi5teVswXSYmKEQubGVmdC09aC8yKSxcImJvdHRvbVwiPT09bi5teVsxXT9ELnRvcC09YzpcImNlbnRlclwiPT09bi5teVsxXSYmKEQudG9wLT1jLzIpLEQubGVmdCs9VFswXSxELnRvcCs9VFsxXSxzPXttYXJnaW5MZWZ0OmQsbWFyZ2luVG9wOl99LHQuZWFjaChbXCJsZWZ0XCIsXCJ0b3BcIl0sZnVuY3Rpb24oZSxpKXt0LnVpLnBvc2l0aW9uW3dbZV1dJiZ0LnVpLnBvc2l0aW9uW3dbZV1dW2ldKEQse3RhcmdldFdpZHRoOnAsdGFyZ2V0SGVpZ2h0OmYsZWxlbVdpZHRoOmgsZWxlbUhlaWdodDpjLGNvbGxpc2lvblBvc2l0aW9uOnMsY29sbGlzaW9uV2lkdGg6eCxjb2xsaXNpb25IZWlnaHQ6QyxvZmZzZXQ6W3VbMF0rVFswXSx1WzFdK1RbMV1dLG15Om4ubXksYXQ6bi5hdCx3aXRoaW46YixlbGVtOmx9KX0pLG4udXNpbmcmJihyPWZ1bmN0aW9uKHQpe3ZhciBlPWcubGVmdC1ELmxlZnQsaT1lK3AtaCxzPWcudG9wLUQudG9wLHI9cytmLWMsdT17dGFyZ2V0OntlbGVtZW50OnYsbGVmdDpnLmxlZnQsdG9wOmcudG9wLHdpZHRoOnAsaGVpZ2h0OmZ9LGVsZW1lbnQ6e2VsZW1lbnQ6bCxsZWZ0OkQubGVmdCx0b3A6RC50b3Asd2lkdGg6aCxoZWlnaHQ6Y30saG9yaXpvbnRhbDowPmk/XCJsZWZ0XCI6ZT4wP1wicmlnaHRcIjpcImNlbnRlclwiLHZlcnRpY2FsOjA+cj9cInRvcFwiOnM+MD9cImJvdHRvbVwiOlwibWlkZGxlXCJ9O2g+cCYmcD5hKGUraSkmJih1Lmhvcml6b250YWw9XCJjZW50ZXJcIiksYz5mJiZmPmEocytyKSYmKHUudmVydGljYWw9XCJtaWRkbGVcIiksdS5pbXBvcnRhbnQ9byhhKGUpLGEoaSkpPm8oYShzKSxhKHIpKT9cImhvcml6b250YWxcIjpcInZlcnRpY2FsXCIsbi51c2luZy5jYWxsKHRoaXMsdCx1KX0pLGwub2Zmc2V0KHQuZXh0ZW5kKEQse3VzaW5nOnJ9KSl9KX0sdC51aS5wb3NpdGlvbj17Zml0OntsZWZ0OmZ1bmN0aW9uKHQsZSl7dmFyIGkscz1lLndpdGhpbixuPXMuaXNXaW5kb3c/cy5zY3JvbGxMZWZ0OnMub2Zmc2V0LmxlZnQsYT1zLndpZHRoLHI9dC5sZWZ0LWUuY29sbGlzaW9uUG9zaXRpb24ubWFyZ2luTGVmdCxsPW4tcixoPXIrZS5jb2xsaXNpb25XaWR0aC1hLW47ZS5jb2xsaXNpb25XaWR0aD5hP2w+MCYmMD49aD8oaT10LmxlZnQrbCtlLmNvbGxpc2lvbldpZHRoLWEtbix0LmxlZnQrPWwtaSk6dC5sZWZ0PWg+MCYmMD49bD9uOmw+aD9uK2EtZS5jb2xsaXNpb25XaWR0aDpuOmw+MD90LmxlZnQrPWw6aD4wP3QubGVmdC09aDp0LmxlZnQ9byh0LmxlZnQtcix0LmxlZnQpfSx0b3A6ZnVuY3Rpb24odCxlKXt2YXIgaSxzPWUud2l0aGluLG49cy5pc1dpbmRvdz9zLnNjcm9sbFRvcDpzLm9mZnNldC50b3AsYT1lLndpdGhpbi5oZWlnaHQscj10LnRvcC1lLmNvbGxpc2lvblBvc2l0aW9uLm1hcmdpblRvcCxsPW4tcixoPXIrZS5jb2xsaXNpb25IZWlnaHQtYS1uO2UuY29sbGlzaW9uSGVpZ2h0PmE/bD4wJiYwPj1oPyhpPXQudG9wK2wrZS5jb2xsaXNpb25IZWlnaHQtYS1uLHQudG9wKz1sLWkpOnQudG9wPWg+MCYmMD49bD9uOmw+aD9uK2EtZS5jb2xsaXNpb25IZWlnaHQ6bjpsPjA/dC50b3ArPWw6aD4wP3QudG9wLT1oOnQudG9wPW8odC50b3Atcix0LnRvcCl9fSxmbGlwOntsZWZ0OmZ1bmN0aW9uKHQsZSl7dmFyIGkscyxuPWUud2l0aGluLG89bi5vZmZzZXQubGVmdCtuLnNjcm9sbExlZnQscj1uLndpZHRoLGw9bi5pc1dpbmRvdz9uLnNjcm9sbExlZnQ6bi5vZmZzZXQubGVmdCxoPXQubGVmdC1lLmNvbGxpc2lvblBvc2l0aW9uLm1hcmdpbkxlZnQsYz1oLWwsdT1oK2UuY29sbGlzaW9uV2lkdGgtci1sLGQ9XCJsZWZ0XCI9PT1lLm15WzBdPy1lLmVsZW1XaWR0aDpcInJpZ2h0XCI9PT1lLm15WzBdP2UuZWxlbVdpZHRoOjAscD1cImxlZnRcIj09PWUuYXRbMF0/ZS50YXJnZXRXaWR0aDpcInJpZ2h0XCI9PT1lLmF0WzBdPy1lLnRhcmdldFdpZHRoOjAsZj0tMiplLm9mZnNldFswXTswPmM/KGk9dC5sZWZ0K2QrcCtmK2UuY29sbGlzaW9uV2lkdGgtci1vLCgwPml8fGEoYyk+aSkmJih0LmxlZnQrPWQrcCtmKSk6dT4wJiYocz10LmxlZnQtZS5jb2xsaXNpb25Qb3NpdGlvbi5tYXJnaW5MZWZ0K2QrcCtmLWwsKHM+MHx8dT5hKHMpKSYmKHQubGVmdCs9ZCtwK2YpKX0sdG9wOmZ1bmN0aW9uKHQsZSl7dmFyIGkscyxuPWUud2l0aGluLG89bi5vZmZzZXQudG9wK24uc2Nyb2xsVG9wLHI9bi5oZWlnaHQsbD1uLmlzV2luZG93P24uc2Nyb2xsVG9wOm4ub2Zmc2V0LnRvcCxoPXQudG9wLWUuY29sbGlzaW9uUG9zaXRpb24ubWFyZ2luVG9wLGM9aC1sLHU9aCtlLmNvbGxpc2lvbkhlaWdodC1yLWwsZD1cInRvcFwiPT09ZS5teVsxXSxwPWQ/LWUuZWxlbUhlaWdodDpcImJvdHRvbVwiPT09ZS5teVsxXT9lLmVsZW1IZWlnaHQ6MCxmPVwidG9wXCI9PT1lLmF0WzFdP2UudGFyZ2V0SGVpZ2h0OlwiYm90dG9tXCI9PT1lLmF0WzFdPy1lLnRhcmdldEhlaWdodDowLGc9LTIqZS5vZmZzZXRbMV07MD5jPyhzPXQudG9wK3ArZitnK2UuY29sbGlzaW9uSGVpZ2h0LXItbywoMD5zfHxhKGMpPnMpJiYodC50b3ArPXArZitnKSk6dT4wJiYoaT10LnRvcC1lLmNvbGxpc2lvblBvc2l0aW9uLm1hcmdpblRvcCtwK2YrZy1sLChpPjB8fHU+YShpKSkmJih0LnRvcCs9cCtmK2cpKX19LGZsaXBmaXQ6e2xlZnQ6ZnVuY3Rpb24oKXt0LnVpLnBvc2l0aW9uLmZsaXAubGVmdC5hcHBseSh0aGlzLGFyZ3VtZW50cyksdC51aS5wb3NpdGlvbi5maXQubGVmdC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9LHRvcDpmdW5jdGlvbigpe3QudWkucG9zaXRpb24uZmxpcC50b3AuYXBwbHkodGhpcyxhcmd1bWVudHMpLHQudWkucG9zaXRpb24uZml0LnRvcC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fX19KCksdC51aS5wb3NpdGlvbix0LmZuLmZvcm09ZnVuY3Rpb24oKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdGhpc1swXS5mb3JtP3RoaXMuY2xvc2VzdChcImZvcm1cIik6dCh0aGlzWzBdLmZvcm0pfSx0LnVpLmZvcm1SZXNldE1peGluPXtfZm9ybVJlc2V0SGFuZGxlcjpmdW5jdGlvbigpe3ZhciBlPXQodGhpcyk7c2V0VGltZW91dChmdW5jdGlvbigpe3ZhciBpPWUuZGF0YShcInVpLWZvcm0tcmVzZXQtaW5zdGFuY2VzXCIpO3QuZWFjaChpLGZ1bmN0aW9uKCl7dGhpcy5yZWZyZXNoKCl9KX0pfSxfYmluZEZvcm1SZXNldEhhbmRsZXI6ZnVuY3Rpb24oKXtpZih0aGlzLmZvcm09dGhpcy5lbGVtZW50LmZvcm0oKSx0aGlzLmZvcm0ubGVuZ3RoKXt2YXIgdD10aGlzLmZvcm0uZGF0YShcInVpLWZvcm0tcmVzZXQtaW5zdGFuY2VzXCIpfHxbXTt0Lmxlbmd0aHx8dGhpcy5mb3JtLm9uKFwicmVzZXQudWktZm9ybS1yZXNldFwiLHRoaXMuX2Zvcm1SZXNldEhhbmRsZXIpLHQucHVzaCh0aGlzKSx0aGlzLmZvcm0uZGF0YShcInVpLWZvcm0tcmVzZXQtaW5zdGFuY2VzXCIsdCl9fSxfdW5iaW5kRm9ybVJlc2V0SGFuZGxlcjpmdW5jdGlvbigpe2lmKHRoaXMuZm9ybS5sZW5ndGgpe3ZhciBlPXRoaXMuZm9ybS5kYXRhKFwidWktZm9ybS1yZXNldC1pbnN0YW5jZXNcIik7ZS5zcGxpY2UodC5pbkFycmF5KHRoaXMsZSksMSksZS5sZW5ndGg/dGhpcy5mb3JtLmRhdGEoXCJ1aS1mb3JtLXJlc2V0LWluc3RhbmNlc1wiLGUpOnRoaXMuZm9ybS5yZW1vdmVEYXRhKFwidWktZm9ybS1yZXNldC1pbnN0YW5jZXNcIikub2ZmKFwicmVzZXQudWktZm9ybS1yZXNldFwiKX19fSx0LnVpLmtleUNvZGU9e0JBQ0tTUEFDRTo4LENPTU1BOjE4OCxERUxFVEU6NDYsRE9XTjo0MCxFTkQ6MzUsRU5URVI6MTMsRVNDQVBFOjI3LEhPTUU6MzYsTEVGVDozNyxQQUdFX0RPV046MzQsUEFHRV9VUDozMyxQRVJJT0Q6MTkwLFJJR0hUOjM5LFNQQUNFOjMyLFRBQjo5LFVQOjM4fSx0LnVpLmVzY2FwZVNlbGVjdG9yPWZ1bmN0aW9uKCl7dmFyIHQ9LyhbIVwiIyQlJicoKSorLC4vOjs8PT4/QFtcXF1eYHt8fX5dKS9nO3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gZS5yZXBsYWNlKHQsXCJcXFxcJDFcIil9fSgpLHQuZm4ubGFiZWxzPWZ1bmN0aW9uKCl7dmFyIGUsaSxzLG4sbztyZXR1cm4gdGhpc1swXS5sYWJlbHMmJnRoaXNbMF0ubGFiZWxzLmxlbmd0aD90aGlzLnB1c2hTdGFjayh0aGlzWzBdLmxhYmVscyk6KG49dGhpcy5lcSgwKS5wYXJlbnRzKFwibGFiZWxcIikscz10aGlzLmF0dHIoXCJpZFwiKSxzJiYoZT10aGlzLmVxKDApLnBhcmVudHMoKS5sYXN0KCksbz1lLmFkZChlLmxlbmd0aD9lLnNpYmxpbmdzKCk6dGhpcy5zaWJsaW5ncygpKSxpPVwibGFiZWxbZm9yPSdcIit0LnVpLmVzY2FwZVNlbGVjdG9yKHMpK1wiJ11cIixuPW4uYWRkKG8uZmluZChpKS5hZGRCYWNrKGkpKSksdGhpcy5wdXNoU3RhY2sobikpfSx0LmZuLmV4dGVuZCh7dW5pcXVlSWQ6ZnVuY3Rpb24oKXt2YXIgdD0wO3JldHVybiBmdW5jdGlvbigpe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt0aGlzLmlkfHwodGhpcy5pZD1cInVpLWlkLVwiKyArK3QpfSl9fSgpLHJlbW92ZVVuaXF1ZUlkOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpey9edWktaWQtXFxkKyQvLnRlc3QodGhpcy5pZCkmJnQodGhpcykucmVtb3ZlQXR0cihcImlkXCIpfSl9fSksdC51aS5zYWZlQWN0aXZlRWxlbWVudD1mdW5jdGlvbih0KXt2YXIgZTt0cnl7ZT10LmFjdGl2ZUVsZW1lbnR9Y2F0Y2goaSl7ZT10LmJvZHl9cmV0dXJuIGV8fChlPXQuYm9keSksZS5ub2RlTmFtZXx8KGU9dC5ib2R5KSxlfSx0LndpZGdldChcInVpLm1lbnVcIix7dmVyc2lvbjpcIjEuMTIuMVwiLGRlZmF1bHRFbGVtZW50OlwiPHVsPlwiLGRlbGF5OjMwMCxvcHRpb25zOntpY29uczp7c3VibWVudTpcInVpLWljb24tY2FyZXQtMS1lXCJ9LGl0ZW1zOlwiPiAqXCIsbWVudXM6XCJ1bFwiLHBvc2l0aW9uOntteTpcImxlZnQgdG9wXCIsYXQ6XCJyaWdodCB0b3BcIn0scm9sZTpcIm1lbnVcIixibHVyOm51bGwsZm9jdXM6bnVsbCxzZWxlY3Q6bnVsbH0sX2NyZWF0ZTpmdW5jdGlvbigpe3RoaXMuYWN0aXZlTWVudT10aGlzLmVsZW1lbnQsdGhpcy5tb3VzZUhhbmRsZWQ9ITEsdGhpcy5lbGVtZW50LnVuaXF1ZUlkKCkuYXR0cih7cm9sZTp0aGlzLm9wdGlvbnMucm9sZSx0YWJJbmRleDowfSksdGhpcy5fYWRkQ2xhc3MoXCJ1aS1tZW51XCIsXCJ1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnRcIiksdGhpcy5fb24oe1wibW91c2Vkb3duIC51aS1tZW51LWl0ZW1cIjpmdW5jdGlvbih0KXt0LnByZXZlbnREZWZhdWx0KCl9LFwiY2xpY2sgLnVpLW1lbnUtaXRlbVwiOmZ1bmN0aW9uKGUpe3ZhciBpPXQoZS50YXJnZXQpLHM9dCh0LnVpLnNhZmVBY3RpdmVFbGVtZW50KHRoaXMuZG9jdW1lbnRbMF0pKTshdGhpcy5tb3VzZUhhbmRsZWQmJmkubm90KFwiLnVpLXN0YXRlLWRpc2FibGVkXCIpLmxlbmd0aCYmKHRoaXMuc2VsZWN0KGUpLGUuaXNQcm9wYWdhdGlvblN0b3BwZWQoKXx8KHRoaXMubW91c2VIYW5kbGVkPSEwKSxpLmhhcyhcIi51aS1tZW51XCIpLmxlbmd0aD90aGlzLmV4cGFuZChlKTohdGhpcy5lbGVtZW50LmlzKFwiOmZvY3VzXCIpJiZzLmNsb3Nlc3QoXCIudWktbWVudVwiKS5sZW5ndGgmJih0aGlzLmVsZW1lbnQudHJpZ2dlcihcImZvY3VzXCIsWyEwXSksdGhpcy5hY3RpdmUmJjE9PT10aGlzLmFjdGl2ZS5wYXJlbnRzKFwiLnVpLW1lbnVcIikubGVuZ3RoJiZjbGVhclRpbWVvdXQodGhpcy50aW1lcikpKX0sXCJtb3VzZWVudGVyIC51aS1tZW51LWl0ZW1cIjpmdW5jdGlvbihlKXtpZighdGhpcy5wcmV2aW91c0ZpbHRlcil7dmFyIGk9dChlLnRhcmdldCkuY2xvc2VzdChcIi51aS1tZW51LWl0ZW1cIikscz10KGUuY3VycmVudFRhcmdldCk7aVswXT09PXNbMF0mJih0aGlzLl9yZW1vdmVDbGFzcyhzLnNpYmxpbmdzKCkuY2hpbGRyZW4oXCIudWktc3RhdGUtYWN0aXZlXCIpLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksdGhpcy5mb2N1cyhlLHMpKX19LG1vdXNlbGVhdmU6XCJjb2xsYXBzZUFsbFwiLFwibW91c2VsZWF2ZSAudWktbWVudVwiOlwiY29sbGFwc2VBbGxcIixmb2N1czpmdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuYWN0aXZlfHx0aGlzLmVsZW1lbnQuZmluZCh0aGlzLm9wdGlvbnMuaXRlbXMpLmVxKDApO2V8fHRoaXMuZm9jdXModCxpKX0sYmx1cjpmdW5jdGlvbihlKXt0aGlzLl9kZWxheShmdW5jdGlvbigpe3ZhciBpPSF0LmNvbnRhaW5zKHRoaXMuZWxlbWVudFswXSx0LnVpLnNhZmVBY3RpdmVFbGVtZW50KHRoaXMuZG9jdW1lbnRbMF0pKTtpJiZ0aGlzLmNvbGxhcHNlQWxsKGUpfSl9LGtleWRvd246XCJfa2V5ZG93blwifSksdGhpcy5yZWZyZXNoKCksdGhpcy5fb24odGhpcy5kb2N1bWVudCx7Y2xpY2s6ZnVuY3Rpb24odCl7dGhpcy5fY2xvc2VPbkRvY3VtZW50Q2xpY2sodCkmJnRoaXMuY29sbGFwc2VBbGwodCksdGhpcy5tb3VzZUhhbmRsZWQ9ITF9fSl9LF9kZXN0cm95OmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5lbGVtZW50LmZpbmQoXCIudWktbWVudS1pdGVtXCIpLnJlbW92ZUF0dHIoXCJyb2xlIGFyaWEtZGlzYWJsZWRcIiksaT1lLmNoaWxkcmVuKFwiLnVpLW1lbnUtaXRlbS13cmFwcGVyXCIpLnJlbW92ZVVuaXF1ZUlkKCkucmVtb3ZlQXR0cihcInRhYkluZGV4IHJvbGUgYXJpYS1oYXNwb3B1cFwiKTt0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiKS5maW5kKFwiLnVpLW1lbnVcIikuYWRkQmFjaygpLnJlbW92ZUF0dHIoXCJyb2xlIGFyaWEtbGFiZWxsZWRieSBhcmlhLWV4cGFuZGVkIGFyaWEtaGlkZGVuIGFyaWEtZGlzYWJsZWQgdGFiSW5kZXhcIikucmVtb3ZlVW5pcXVlSWQoKS5zaG93KCksaS5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpO2UuZGF0YShcInVpLW1lbnUtc3VibWVudS1jYXJldFwiKSYmZS5yZW1vdmUoKX0pfSxfa2V5ZG93bjpmdW5jdGlvbihlKXt2YXIgaSxzLG4sbyxhPSEwO3N3aXRjaChlLmtleUNvZGUpe2Nhc2UgdC51aS5rZXlDb2RlLlBBR0VfVVA6dGhpcy5wcmV2aW91c1BhZ2UoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuUEFHRV9ET1dOOnRoaXMubmV4dFBhZ2UoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuSE9NRTp0aGlzLl9tb3ZlKFwiZmlyc3RcIixcImZpcnN0XCIsZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRU5EOnRoaXMuX21vdmUoXCJsYXN0XCIsXCJsYXN0XCIsZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuVVA6dGhpcy5wcmV2aW91cyhlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5ET1dOOnRoaXMubmV4dChlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5MRUZUOnRoaXMuY29sbGFwc2UoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuUklHSFQ6dGhpcy5hY3RpdmUmJiF0aGlzLmFjdGl2ZS5pcyhcIi51aS1zdGF0ZS1kaXNhYmxlZFwiKSYmdGhpcy5leHBhbmQoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRU5URVI6Y2FzZSB0LnVpLmtleUNvZGUuU1BBQ0U6dGhpcy5fYWN0aXZhdGUoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRVNDQVBFOnRoaXMuY29sbGFwc2UoZSk7YnJlYWs7ZGVmYXVsdDphPSExLHM9dGhpcy5wcmV2aW91c0ZpbHRlcnx8XCJcIixvPSExLG49ZS5rZXlDb2RlPj05NiYmMTA1Pj1lLmtleUNvZGU/XCJcIisoZS5rZXlDb2RlLTk2KTpTdHJpbmcuZnJvbUNoYXJDb2RlKGUua2V5Q29kZSksY2xlYXJUaW1lb3V0KHRoaXMuZmlsdGVyVGltZXIpLG49PT1zP289ITA6bj1zK24saT10aGlzLl9maWx0ZXJNZW51SXRlbXMobiksaT1vJiYtMSE9PWkuaW5kZXgodGhpcy5hY3RpdmUubmV4dCgpKT90aGlzLmFjdGl2ZS5uZXh0QWxsKFwiLnVpLW1lbnUtaXRlbVwiKTppLGkubGVuZ3RofHwobj1TdHJpbmcuZnJvbUNoYXJDb2RlKGUua2V5Q29kZSksaT10aGlzLl9maWx0ZXJNZW51SXRlbXMobikpLGkubGVuZ3RoPyh0aGlzLmZvY3VzKGUsaSksdGhpcy5wcmV2aW91c0ZpbHRlcj1uLHRoaXMuZmlsdGVyVGltZXI9dGhpcy5fZGVsYXkoZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5wcmV2aW91c0ZpbHRlcn0sMWUzKSk6ZGVsZXRlIHRoaXMucHJldmlvdXNGaWx0ZXJ9YSYmZS5wcmV2ZW50RGVmYXVsdCgpfSxfYWN0aXZhdGU6ZnVuY3Rpb24odCl7dGhpcy5hY3RpdmUmJiF0aGlzLmFjdGl2ZS5pcyhcIi51aS1zdGF0ZS1kaXNhYmxlZFwiKSYmKHRoaXMuYWN0aXZlLmNoaWxkcmVuKFwiW2FyaWEtaGFzcG9wdXA9J3RydWUnXVwiKS5sZW5ndGg/dGhpcy5leHBhbmQodCk6dGhpcy5zZWxlY3QodCkpfSxyZWZyZXNoOmZ1bmN0aW9uKCl7dmFyIGUsaSxzLG4sbyxhPXRoaXMscj10aGlzLm9wdGlvbnMuaWNvbnMuc3VibWVudSxsPXRoaXMuZWxlbWVudC5maW5kKHRoaXMub3B0aW9ucy5tZW51cyk7dGhpcy5fdG9nZ2xlQ2xhc3MoXCJ1aS1tZW51LWljb25zXCIsbnVsbCwhIXRoaXMuZWxlbWVudC5maW5kKFwiLnVpLWljb25cIikubGVuZ3RoKSxzPWwuZmlsdGVyKFwiOm5vdCgudWktbWVudSlcIikuaGlkZSgpLmF0dHIoe3JvbGU6dGhpcy5vcHRpb25zLnJvbGUsXCJhcmlhLWhpZGRlblwiOlwidHJ1ZVwiLFwiYXJpYS1leHBhbmRlZFwiOlwiZmFsc2VcIn0pLmVhY2goZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpLGk9ZS5wcmV2KCkscz10KFwiPHNwYW4+XCIpLmRhdGEoXCJ1aS1tZW51LXN1Ym1lbnUtY2FyZXRcIiwhMCk7YS5fYWRkQ2xhc3MocyxcInVpLW1lbnUtaWNvblwiLFwidWktaWNvbiBcIityKSxpLmF0dHIoXCJhcmlhLWhhc3BvcHVwXCIsXCJ0cnVlXCIpLnByZXBlbmQocyksZS5hdHRyKFwiYXJpYS1sYWJlbGxlZGJ5XCIsaS5hdHRyKFwiaWRcIikpfSksdGhpcy5fYWRkQ2xhc3MocyxcInVpLW1lbnVcIixcInVpLXdpZGdldCB1aS13aWRnZXQtY29udGVudCB1aS1mcm9udFwiKSxlPWwuYWRkKHRoaXMuZWxlbWVudCksaT1lLmZpbmQodGhpcy5vcHRpb25zLml0ZW1zKSxpLm5vdChcIi51aS1tZW51LWl0ZW1cIikuZWFjaChmdW5jdGlvbigpe3ZhciBlPXQodGhpcyk7YS5faXNEaXZpZGVyKGUpJiZhLl9hZGRDbGFzcyhlLFwidWktbWVudS1kaXZpZGVyXCIsXCJ1aS13aWRnZXQtY29udGVudFwiKX0pLG49aS5ub3QoXCIudWktbWVudS1pdGVtLCAudWktbWVudS1kaXZpZGVyXCIpLG89bi5jaGlsZHJlbigpLm5vdChcIi51aS1tZW51XCIpLnVuaXF1ZUlkKCkuYXR0cih7dGFiSW5kZXg6LTEscm9sZTp0aGlzLl9pdGVtUm9sZSgpfSksdGhpcy5fYWRkQ2xhc3MobixcInVpLW1lbnUtaXRlbVwiKS5fYWRkQ2xhc3MobyxcInVpLW1lbnUtaXRlbS13cmFwcGVyXCIpLGkuZmlsdGVyKFwiLnVpLXN0YXRlLWRpc2FibGVkXCIpLmF0dHIoXCJhcmlhLWRpc2FibGVkXCIsXCJ0cnVlXCIpLHRoaXMuYWN0aXZlJiYhdC5jb250YWlucyh0aGlzLmVsZW1lbnRbMF0sdGhpcy5hY3RpdmVbMF0pJiZ0aGlzLmJsdXIoKX0sX2l0ZW1Sb2xlOmZ1bmN0aW9uKCl7cmV0dXJue21lbnU6XCJtZW51aXRlbVwiLGxpc3Rib3g6XCJvcHRpb25cIn1bdGhpcy5vcHRpb25zLnJvbGVdfSxfc2V0T3B0aW9uOmZ1bmN0aW9uKHQsZSl7aWYoXCJpY29uc1wiPT09dCl7dmFyIGk9dGhpcy5lbGVtZW50LmZpbmQoXCIudWktbWVudS1pY29uXCIpO3RoaXMuX3JlbW92ZUNsYXNzKGksbnVsbCx0aGlzLm9wdGlvbnMuaWNvbnMuc3VibWVudSkuX2FkZENsYXNzKGksbnVsbCxlLnN1Ym1lbnUpfXRoaXMuX3N1cGVyKHQsZSl9LF9zZXRPcHRpb25EaXNhYmxlZDpmdW5jdGlvbih0KXt0aGlzLl9zdXBlcih0KSx0aGlzLmVsZW1lbnQuYXR0cihcImFyaWEtZGlzYWJsZWRcIix0K1wiXCIpLHRoaXMuX3RvZ2dsZUNsYXNzKG51bGwsXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiLCEhdCl9LGZvY3VzOmZ1bmN0aW9uKHQsZSl7dmFyIGkscyxuO3RoaXMuYmx1cih0LHQmJlwiZm9jdXNcIj09PXQudHlwZSksdGhpcy5fc2Nyb2xsSW50b1ZpZXcoZSksdGhpcy5hY3RpdmU9ZS5maXJzdCgpLHM9dGhpcy5hY3RpdmUuY2hpbGRyZW4oXCIudWktbWVudS1pdGVtLXdyYXBwZXJcIiksdGhpcy5fYWRkQ2xhc3MocyxudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpLHRoaXMub3B0aW9ucy5yb2xlJiZ0aGlzLmVsZW1lbnQuYXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiLHMuYXR0cihcImlkXCIpKSxuPXRoaXMuYWN0aXZlLnBhcmVudCgpLmNsb3Nlc3QoXCIudWktbWVudS1pdGVtXCIpLmNoaWxkcmVuKFwiLnVpLW1lbnUtaXRlbS13cmFwcGVyXCIpLHRoaXMuX2FkZENsYXNzKG4sbnVsbCxcInVpLXN0YXRlLWFjdGl2ZVwiKSx0JiZcImtleWRvd25cIj09PXQudHlwZT90aGlzLl9jbG9zZSgpOnRoaXMudGltZXI9dGhpcy5fZGVsYXkoZnVuY3Rpb24oKXt0aGlzLl9jbG9zZSgpfSx0aGlzLmRlbGF5KSxpPWUuY2hpbGRyZW4oXCIudWktbWVudVwiKSxpLmxlbmd0aCYmdCYmL15tb3VzZS8udGVzdCh0LnR5cGUpJiZ0aGlzLl9zdGFydE9wZW5pbmcoaSksdGhpcy5hY3RpdmVNZW51PWUucGFyZW50KCksdGhpcy5fdHJpZ2dlcihcImZvY3VzXCIsdCx7aXRlbTplfSl9LF9zY3JvbGxJbnRvVmlldzpmdW5jdGlvbihlKXt2YXIgaSxzLG4sbyxhLHI7dGhpcy5faGFzU2Nyb2xsKCkmJihpPXBhcnNlRmxvYXQodC5jc3ModGhpcy5hY3RpdmVNZW51WzBdLFwiYm9yZGVyVG9wV2lkdGhcIikpfHwwLHM9cGFyc2VGbG9hdCh0LmNzcyh0aGlzLmFjdGl2ZU1lbnVbMF0sXCJwYWRkaW5nVG9wXCIpKXx8MCxuPWUub2Zmc2V0KCkudG9wLXRoaXMuYWN0aXZlTWVudS5vZmZzZXQoKS50b3AtaS1zLG89dGhpcy5hY3RpdmVNZW51LnNjcm9sbFRvcCgpLGE9dGhpcy5hY3RpdmVNZW51LmhlaWdodCgpLHI9ZS5vdXRlckhlaWdodCgpLDA+bj90aGlzLmFjdGl2ZU1lbnUuc2Nyb2xsVG9wKG8rbik6bityPmEmJnRoaXMuYWN0aXZlTWVudS5zY3JvbGxUb3AobytuLWErcikpfSxibHVyOmZ1bmN0aW9uKHQsZSl7ZXx8Y2xlYXJUaW1lb3V0KHRoaXMudGltZXIpLHRoaXMuYWN0aXZlJiYodGhpcy5fcmVtb3ZlQ2xhc3ModGhpcy5hY3RpdmUuY2hpbGRyZW4oXCIudWktbWVudS1pdGVtLXdyYXBwZXJcIiksbnVsbCxcInVpLXN0YXRlLWFjdGl2ZVwiKSx0aGlzLl90cmlnZ2VyKFwiYmx1clwiLHQse2l0ZW06dGhpcy5hY3RpdmV9KSx0aGlzLmFjdGl2ZT1udWxsKX0sX3N0YXJ0T3BlbmluZzpmdW5jdGlvbih0KXtjbGVhclRpbWVvdXQodGhpcy50aW1lciksXCJ0cnVlXCI9PT10LmF0dHIoXCJhcmlhLWhpZGRlblwiKSYmKHRoaXMudGltZXI9dGhpcy5fZGVsYXkoZnVuY3Rpb24oKXt0aGlzLl9jbG9zZSgpLHRoaXMuX29wZW4odCl9LHRoaXMuZGVsYXkpKX0sX29wZW46ZnVuY3Rpb24oZSl7dmFyIGk9dC5leHRlbmQoe29mOnRoaXMuYWN0aXZlfSx0aGlzLm9wdGlvbnMucG9zaXRpb24pO2NsZWFyVGltZW91dCh0aGlzLnRpbWVyKSx0aGlzLmVsZW1lbnQuZmluZChcIi51aS1tZW51XCIpLm5vdChlLnBhcmVudHMoXCIudWktbWVudVwiKSkuaGlkZSgpLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKSxlLnNob3coKS5yZW1vdmVBdHRyKFwiYXJpYS1oaWRkZW5cIikuYXR0cihcImFyaWEtZXhwYW5kZWRcIixcInRydWVcIikucG9zaXRpb24oaSl9LGNvbGxhcHNlQWxsOmZ1bmN0aW9uKGUsaSl7Y2xlYXJUaW1lb3V0KHRoaXMudGltZXIpLHRoaXMudGltZXI9dGhpcy5fZGVsYXkoZnVuY3Rpb24oKXt2YXIgcz1pP3RoaXMuZWxlbWVudDp0KGUmJmUudGFyZ2V0KS5jbG9zZXN0KHRoaXMuZWxlbWVudC5maW5kKFwiLnVpLW1lbnVcIikpO3MubGVuZ3RofHwocz10aGlzLmVsZW1lbnQpLHRoaXMuX2Nsb3NlKHMpLHRoaXMuYmx1cihlKSx0aGlzLl9yZW1vdmVDbGFzcyhzLmZpbmQoXCIudWktc3RhdGUtYWN0aXZlXCIpLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksdGhpcy5hY3RpdmVNZW51PXN9LHRoaXMuZGVsYXkpfSxfY2xvc2U6ZnVuY3Rpb24odCl7dHx8KHQ9dGhpcy5hY3RpdmU/dGhpcy5hY3RpdmUucGFyZW50KCk6dGhpcy5lbGVtZW50KSx0LmZpbmQoXCIudWktbWVudVwiKS5oaWRlKCkuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIsXCJmYWxzZVwiKX0sX2Nsb3NlT25Eb2N1bWVudENsaWNrOmZ1bmN0aW9uKGUpe3JldHVybiF0KGUudGFyZ2V0KS5jbG9zZXN0KFwiLnVpLW1lbnVcIikubGVuZ3RofSxfaXNEaXZpZGVyOmZ1bmN0aW9uKHQpe3JldHVybiEvW15cXC1cXHUyMDE0XFx1MjAxM1xcc10vLnRlc3QodC50ZXh0KCkpfSxjb2xsYXBzZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmFjdGl2ZSYmdGhpcy5hY3RpdmUucGFyZW50KCkuY2xvc2VzdChcIi51aS1tZW51LWl0ZW1cIix0aGlzLmVsZW1lbnQpO2UmJmUubGVuZ3RoJiYodGhpcy5fY2xvc2UoKSx0aGlzLmZvY3VzKHQsZSkpfSxleHBhbmQ6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5hY3RpdmUmJnRoaXMuYWN0aXZlLmNoaWxkcmVuKFwiLnVpLW1lbnUgXCIpLmZpbmQodGhpcy5vcHRpb25zLml0ZW1zKS5maXJzdCgpO2UmJmUubGVuZ3RoJiYodGhpcy5fb3BlbihlLnBhcmVudCgpKSx0aGlzLl9kZWxheShmdW5jdGlvbigpe3RoaXMuZm9jdXModCxlKX0pKX0sbmV4dDpmdW5jdGlvbih0KXt0aGlzLl9tb3ZlKFwibmV4dFwiLFwiZmlyc3RcIix0KX0scHJldmlvdXM6ZnVuY3Rpb24odCl7dGhpcy5fbW92ZShcInByZXZcIixcImxhc3RcIix0KX0saXNGaXJzdEl0ZW06ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5hY3RpdmUmJiF0aGlzLmFjdGl2ZS5wcmV2QWxsKFwiLnVpLW1lbnUtaXRlbVwiKS5sZW5ndGh9LGlzTGFzdEl0ZW06ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5hY3RpdmUmJiF0aGlzLmFjdGl2ZS5uZXh0QWxsKFwiLnVpLW1lbnUtaXRlbVwiKS5sZW5ndGh9LF9tb3ZlOmZ1bmN0aW9uKHQsZSxpKXt2YXIgczt0aGlzLmFjdGl2ZSYmKHM9XCJmaXJzdFwiPT09dHx8XCJsYXN0XCI9PT10P3RoaXMuYWN0aXZlW1wiZmlyc3RcIj09PXQ/XCJwcmV2QWxsXCI6XCJuZXh0QWxsXCJdKFwiLnVpLW1lbnUtaXRlbVwiKS5lcSgtMSk6dGhpcy5hY3RpdmVbdCtcIkFsbFwiXShcIi51aS1tZW51LWl0ZW1cIikuZXEoMCkpLHMmJnMubGVuZ3RoJiZ0aGlzLmFjdGl2ZXx8KHM9dGhpcy5hY3RpdmVNZW51LmZpbmQodGhpcy5vcHRpb25zLml0ZW1zKVtlXSgpKSx0aGlzLmZvY3VzKGkscyl9LG5leHRQYWdlOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbjtyZXR1cm4gdGhpcy5hY3RpdmU/KHRoaXMuaXNMYXN0SXRlbSgpfHwodGhpcy5faGFzU2Nyb2xsKCk/KHM9dGhpcy5hY3RpdmUub2Zmc2V0KCkudG9wLG49dGhpcy5lbGVtZW50LmhlaWdodCgpLHRoaXMuYWN0aXZlLm5leHRBbGwoXCIudWktbWVudS1pdGVtXCIpLmVhY2goZnVuY3Rpb24oKXtyZXR1cm4gaT10KHRoaXMpLDA+aS5vZmZzZXQoKS50b3Atcy1ufSksdGhpcy5mb2N1cyhlLGkpKTp0aGlzLmZvY3VzKGUsdGhpcy5hY3RpdmVNZW51LmZpbmQodGhpcy5vcHRpb25zLml0ZW1zKVt0aGlzLmFjdGl2ZT9cImxhc3RcIjpcImZpcnN0XCJdKCkpKSx2b2lkIDApOih0aGlzLm5leHQoZSksdm9pZCAwKX0scHJldmlvdXNQYWdlOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbjtyZXR1cm4gdGhpcy5hY3RpdmU/KHRoaXMuaXNGaXJzdEl0ZW0oKXx8KHRoaXMuX2hhc1Njcm9sbCgpPyhzPXRoaXMuYWN0aXZlLm9mZnNldCgpLnRvcCxuPXRoaXMuZWxlbWVudC5oZWlnaHQoKSx0aGlzLmFjdGl2ZS5wcmV2QWxsKFwiLnVpLW1lbnUtaXRlbVwiKS5lYWNoKGZ1bmN0aW9uKCl7cmV0dXJuIGk9dCh0aGlzKSxpLm9mZnNldCgpLnRvcC1zK24+MH0pLHRoaXMuZm9jdXMoZSxpKSk6dGhpcy5mb2N1cyhlLHRoaXMuYWN0aXZlTWVudS5maW5kKHRoaXMub3B0aW9ucy5pdGVtcykuZmlyc3QoKSkpLHZvaWQgMCk6KHRoaXMubmV4dChlKSx2b2lkIDApfSxfaGFzU2Nyb2xsOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZWxlbWVudC5vdXRlckhlaWdodCgpPHRoaXMuZWxlbWVudC5wcm9wKFwic2Nyb2xsSGVpZ2h0XCIpfSxzZWxlY3Q6ZnVuY3Rpb24oZSl7dGhpcy5hY3RpdmU9dGhpcy5hY3RpdmV8fHQoZS50YXJnZXQpLmNsb3Nlc3QoXCIudWktbWVudS1pdGVtXCIpO3ZhciBpPXtpdGVtOnRoaXMuYWN0aXZlfTt0aGlzLmFjdGl2ZS5oYXMoXCIudWktbWVudVwiKS5sZW5ndGh8fHRoaXMuY29sbGFwc2VBbGwoZSwhMCksdGhpcy5fdHJpZ2dlcihcInNlbGVjdFwiLGUsaSl9LF9maWx0ZXJNZW51SXRlbXM6ZnVuY3Rpb24oZSl7dmFyIGk9ZS5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSorPy4sXFxcXFxcXiR8I1xcc10vZyxcIlxcXFwkJlwiKSxzPVJlZ0V4cChcIl5cIitpLFwiaVwiKTtyZXR1cm4gdGhpcy5hY3RpdmVNZW51LmZpbmQodGhpcy5vcHRpb25zLml0ZW1zKS5maWx0ZXIoXCIudWktbWVudS1pdGVtXCIpLmZpbHRlcihmdW5jdGlvbigpe3JldHVybiBzLnRlc3QodC50cmltKHQodGhpcykuY2hpbGRyZW4oXCIudWktbWVudS1pdGVtLXdyYXBwZXJcIikudGV4dCgpKSl9KX19KSx0LndpZGdldChcInVpLmF1dG9jb21wbGV0ZVwiLHt2ZXJzaW9uOlwiMS4xMi4xXCIsZGVmYXVsdEVsZW1lbnQ6XCI8aW5wdXQ+XCIsb3B0aW9uczp7YXBwZW5kVG86bnVsbCxhdXRvRm9jdXM6ITEsZGVsYXk6MzAwLG1pbkxlbmd0aDoxLHBvc2l0aW9uOntteTpcImxlZnQgdG9wXCIsYXQ6XCJsZWZ0IGJvdHRvbVwiLGNvbGxpc2lvbjpcIm5vbmVcIn0sc291cmNlOm51bGwsY2hhbmdlOm51bGwsY2xvc2U6bnVsbCxmb2N1czpudWxsLG9wZW46bnVsbCxyZXNwb25zZTpudWxsLHNlYXJjaDpudWxsLHNlbGVjdDpudWxsfSxyZXF1ZXN0SW5kZXg6MCxwZW5kaW5nOjAsX2NyZWF0ZTpmdW5jdGlvbigpe3ZhciBlLGkscyxuPXRoaXMuZWxlbWVudFswXS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLG89XCJ0ZXh0YXJlYVwiPT09bixhPVwiaW5wdXRcIj09PW47dGhpcy5pc011bHRpTGluZT1vfHwhYSYmdGhpcy5faXNDb250ZW50RWRpdGFibGUodGhpcy5lbGVtZW50KSx0aGlzLnZhbHVlTWV0aG9kPXRoaXMuZWxlbWVudFtvfHxhP1widmFsXCI6XCJ0ZXh0XCJdLHRoaXMuaXNOZXdNZW51PSEwLHRoaXMuX2FkZENsYXNzKFwidWktYXV0b2NvbXBsZXRlLWlucHV0XCIpLHRoaXMuZWxlbWVudC5hdHRyKFwiYXV0b2NvbXBsZXRlXCIsXCJvZmZcIiksdGhpcy5fb24odGhpcy5lbGVtZW50LHtrZXlkb3duOmZ1bmN0aW9uKG4pe2lmKHRoaXMuZWxlbWVudC5wcm9wKFwicmVhZE9ubHlcIikpcmV0dXJuIGU9ITAscz0hMCxpPSEwLHZvaWQgMDtlPSExLHM9ITEsaT0hMTt2YXIgbz10LnVpLmtleUNvZGU7c3dpdGNoKG4ua2V5Q29kZSl7Y2FzZSBvLlBBR0VfVVA6ZT0hMCx0aGlzLl9tb3ZlKFwicHJldmlvdXNQYWdlXCIsbik7YnJlYWs7Y2FzZSBvLlBBR0VfRE9XTjplPSEwLHRoaXMuX21vdmUoXCJuZXh0UGFnZVwiLG4pO2JyZWFrO2Nhc2Ugby5VUDplPSEwLHRoaXMuX2tleUV2ZW50KFwicHJldmlvdXNcIixuKTticmVhaztjYXNlIG8uRE9XTjplPSEwLHRoaXMuX2tleUV2ZW50KFwibmV4dFwiLG4pO2JyZWFrO2Nhc2Ugby5FTlRFUjp0aGlzLm1lbnUuYWN0aXZlJiYoZT0hMCxuLnByZXZlbnREZWZhdWx0KCksdGhpcy5tZW51LnNlbGVjdChuKSk7YnJlYWs7Y2FzZSBvLlRBQjp0aGlzLm1lbnUuYWN0aXZlJiZ0aGlzLm1lbnUuc2VsZWN0KG4pO2JyZWFrO2Nhc2Ugby5FU0NBUEU6dGhpcy5tZW51LmVsZW1lbnQuaXMoXCI6dmlzaWJsZVwiKSYmKHRoaXMuaXNNdWx0aUxpbmV8fHRoaXMuX3ZhbHVlKHRoaXMudGVybSksdGhpcy5jbG9zZShuKSxuLnByZXZlbnREZWZhdWx0KCkpO2JyZWFrO2RlZmF1bHQ6aT0hMCx0aGlzLl9zZWFyY2hUaW1lb3V0KG4pfX0sa2V5cHJlc3M6ZnVuY3Rpb24ocyl7aWYoZSlyZXR1cm4gZT0hMSwoIXRoaXMuaXNNdWx0aUxpbmV8fHRoaXMubWVudS5lbGVtZW50LmlzKFwiOnZpc2libGVcIikpJiZzLnByZXZlbnREZWZhdWx0KCksdm9pZCAwO2lmKCFpKXt2YXIgbj10LnVpLmtleUNvZGU7c3dpdGNoKHMua2V5Q29kZSl7Y2FzZSBuLlBBR0VfVVA6dGhpcy5fbW92ZShcInByZXZpb3VzUGFnZVwiLHMpO2JyZWFrO2Nhc2Ugbi5QQUdFX0RPV046dGhpcy5fbW92ZShcIm5leHRQYWdlXCIscyk7YnJlYWs7Y2FzZSBuLlVQOnRoaXMuX2tleUV2ZW50KFwicHJldmlvdXNcIixzKTticmVhaztjYXNlIG4uRE9XTjp0aGlzLl9rZXlFdmVudChcIm5leHRcIixzKX19fSxpbnB1dDpmdW5jdGlvbih0KXtyZXR1cm4gcz8ocz0hMSx0LnByZXZlbnREZWZhdWx0KCksdm9pZCAwKToodGhpcy5fc2VhcmNoVGltZW91dCh0KSx2b2lkIDApfSxmb2N1czpmdW5jdGlvbigpe3RoaXMuc2VsZWN0ZWRJdGVtPW51bGwsdGhpcy5wcmV2aW91cz10aGlzLl92YWx1ZSgpfSxibHVyOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmNhbmNlbEJsdXI/KGRlbGV0ZSB0aGlzLmNhbmNlbEJsdXIsdm9pZCAwKTooY2xlYXJUaW1lb3V0KHRoaXMuc2VhcmNoaW5nKSx0aGlzLmNsb3NlKHQpLHRoaXMuX2NoYW5nZSh0KSx2b2lkIDApfX0pLHRoaXMuX2luaXRTb3VyY2UoKSx0aGlzLm1lbnU9dChcIjx1bD5cIikuYXBwZW5kVG8odGhpcy5fYXBwZW5kVG8oKSkubWVudSh7cm9sZTpudWxsfSkuaGlkZSgpLm1lbnUoXCJpbnN0YW5jZVwiKSx0aGlzLl9hZGRDbGFzcyh0aGlzLm1lbnUuZWxlbWVudCxcInVpLWF1dG9jb21wbGV0ZVwiLFwidWktZnJvbnRcIiksdGhpcy5fb24odGhpcy5tZW51LmVsZW1lbnQse21vdXNlZG93bjpmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCksdGhpcy5jYW5jZWxCbHVyPSEwLHRoaXMuX2RlbGF5KGZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMuY2FuY2VsQmx1cix0aGlzLmVsZW1lbnRbMF0hPT10LnVpLnNhZmVBY3RpdmVFbGVtZW50KHRoaXMuZG9jdW1lbnRbMF0pJiZ0aGlzLmVsZW1lbnQudHJpZ2dlcihcImZvY3VzXCIpfSl9LG1lbnVmb2N1czpmdW5jdGlvbihlLGkpe3ZhciBzLG47cmV0dXJuIHRoaXMuaXNOZXdNZW51JiYodGhpcy5pc05ld01lbnU9ITEsZS5vcmlnaW5hbEV2ZW50JiYvXm1vdXNlLy50ZXN0KGUub3JpZ2luYWxFdmVudC50eXBlKSk/KHRoaXMubWVudS5ibHVyKCksdGhpcy5kb2N1bWVudC5vbmUoXCJtb3VzZW1vdmVcIixmdW5jdGlvbigpe3QoZS50YXJnZXQpLnRyaWdnZXIoZS5vcmlnaW5hbEV2ZW50KX0pLHZvaWQgMCk6KG49aS5pdGVtLmRhdGEoXCJ1aS1hdXRvY29tcGxldGUtaXRlbVwiKSwhMSE9PXRoaXMuX3RyaWdnZXIoXCJmb2N1c1wiLGUse2l0ZW06bn0pJiZlLm9yaWdpbmFsRXZlbnQmJi9ea2V5Ly50ZXN0KGUub3JpZ2luYWxFdmVudC50eXBlKSYmdGhpcy5fdmFsdWUobi52YWx1ZSkscz1pLml0ZW0uYXR0cihcImFyaWEtbGFiZWxcIil8fG4udmFsdWUscyYmdC50cmltKHMpLmxlbmd0aCYmKHRoaXMubGl2ZVJlZ2lvbi5jaGlsZHJlbigpLmhpZGUoKSx0KFwiPGRpdj5cIikudGV4dChzKS5hcHBlbmRUbyh0aGlzLmxpdmVSZWdpb24pKSx2b2lkIDApfSxtZW51c2VsZWN0OmZ1bmN0aW9uKGUsaSl7dmFyIHM9aS5pdGVtLmRhdGEoXCJ1aS1hdXRvY29tcGxldGUtaXRlbVwiKSxuPXRoaXMucHJldmlvdXM7dGhpcy5lbGVtZW50WzBdIT09dC51aS5zYWZlQWN0aXZlRWxlbWVudCh0aGlzLmRvY3VtZW50WzBdKSYmKHRoaXMuZWxlbWVudC50cmlnZ2VyKFwiZm9jdXNcIiksdGhpcy5wcmV2aW91cz1uLHRoaXMuX2RlbGF5KGZ1bmN0aW9uKCl7dGhpcy5wcmV2aW91cz1uLHRoaXMuc2VsZWN0ZWRJdGVtPXN9KSksITEhPT10aGlzLl90cmlnZ2VyKFwic2VsZWN0XCIsZSx7aXRlbTpzfSkmJnRoaXMuX3ZhbHVlKHMudmFsdWUpLHRoaXMudGVybT10aGlzLl92YWx1ZSgpLHRoaXMuY2xvc2UoZSksdGhpcy5zZWxlY3RlZEl0ZW09c319KSx0aGlzLmxpdmVSZWdpb249dChcIjxkaXY+XCIse3JvbGU6XCJzdGF0dXNcIixcImFyaWEtbGl2ZVwiOlwiYXNzZXJ0aXZlXCIsXCJhcmlhLXJlbGV2YW50XCI6XCJhZGRpdGlvbnNcIn0pLmFwcGVuZFRvKHRoaXMuZG9jdW1lbnRbMF0uYm9keSksdGhpcy5fYWRkQ2xhc3ModGhpcy5saXZlUmVnaW9uLG51bGwsXCJ1aS1oZWxwZXItaGlkZGVuLWFjY2Vzc2libGVcIiksdGhpcy5fb24odGhpcy53aW5kb3cse2JlZm9yZXVubG9hZDpmdW5jdGlvbigpe3RoaXMuZWxlbWVudC5yZW1vdmVBdHRyKFwiYXV0b2NvbXBsZXRlXCIpfX0pfSxfZGVzdHJveTpmdW5jdGlvbigpe2NsZWFyVGltZW91dCh0aGlzLnNlYXJjaGluZyksdGhpcy5lbGVtZW50LnJlbW92ZUF0dHIoXCJhdXRvY29tcGxldGVcIiksdGhpcy5tZW51LmVsZW1lbnQucmVtb3ZlKCksdGhpcy5saXZlUmVnaW9uLnJlbW92ZSgpfSxfc2V0T3B0aW9uOmZ1bmN0aW9uKHQsZSl7dGhpcy5fc3VwZXIodCxlKSxcInNvdXJjZVwiPT09dCYmdGhpcy5faW5pdFNvdXJjZSgpLFwiYXBwZW5kVG9cIj09PXQmJnRoaXMubWVudS5lbGVtZW50LmFwcGVuZFRvKHRoaXMuX2FwcGVuZFRvKCkpLFwiZGlzYWJsZWRcIj09PXQmJmUmJnRoaXMueGhyJiZ0aGlzLnhoci5hYm9ydCgpfSxfaXNFdmVudFRhcmdldEluV2lkZ2V0OmZ1bmN0aW9uKGUpe3ZhciBpPXRoaXMubWVudS5lbGVtZW50WzBdO3JldHVybiBlLnRhcmdldD09PXRoaXMuZWxlbWVudFswXXx8ZS50YXJnZXQ9PT1pfHx0LmNvbnRhaW5zKGksZS50YXJnZXQpfSxfY2xvc2VPbkNsaWNrT3V0c2lkZTpmdW5jdGlvbih0KXt0aGlzLl9pc0V2ZW50VGFyZ2V0SW5XaWRnZXQodCl8fHRoaXMuY2xvc2UoKVxufSxfYXBwZW5kVG86ZnVuY3Rpb24oKXt2YXIgZT10aGlzLm9wdGlvbnMuYXBwZW5kVG87cmV0dXJuIGUmJihlPWUuanF1ZXJ5fHxlLm5vZGVUeXBlP3QoZSk6dGhpcy5kb2N1bWVudC5maW5kKGUpLmVxKDApKSxlJiZlWzBdfHwoZT10aGlzLmVsZW1lbnQuY2xvc2VzdChcIi51aS1mcm9udCwgZGlhbG9nXCIpKSxlLmxlbmd0aHx8KGU9dGhpcy5kb2N1bWVudFswXS5ib2R5KSxlfSxfaW5pdFNvdXJjZTpmdW5jdGlvbigpe3ZhciBlLGkscz10aGlzO3QuaXNBcnJheSh0aGlzLm9wdGlvbnMuc291cmNlKT8oZT10aGlzLm9wdGlvbnMuc291cmNlLHRoaXMuc291cmNlPWZ1bmN0aW9uKGkscyl7cyh0LnVpLmF1dG9jb21wbGV0ZS5maWx0ZXIoZSxpLnRlcm0pKX0pOlwic3RyaW5nXCI9PXR5cGVvZiB0aGlzLm9wdGlvbnMuc291cmNlPyhpPXRoaXMub3B0aW9ucy5zb3VyY2UsdGhpcy5zb3VyY2U9ZnVuY3Rpb24oZSxuKXtzLnhociYmcy54aHIuYWJvcnQoKSxzLnhocj10LmFqYXgoe3VybDppLGRhdGE6ZSxkYXRhVHlwZTpcImpzb25cIixzdWNjZXNzOmZ1bmN0aW9uKHQpe24odCl9LGVycm9yOmZ1bmN0aW9uKCl7bihbXSl9fSl9KTp0aGlzLnNvdXJjZT10aGlzLm9wdGlvbnMuc291cmNlfSxfc2VhcmNoVGltZW91dDpmdW5jdGlvbih0KXtjbGVhclRpbWVvdXQodGhpcy5zZWFyY2hpbmcpLHRoaXMuc2VhcmNoaW5nPXRoaXMuX2RlbGF5KGZ1bmN0aW9uKCl7dmFyIGU9dGhpcy50ZXJtPT09dGhpcy5fdmFsdWUoKSxpPXRoaXMubWVudS5lbGVtZW50LmlzKFwiOnZpc2libGVcIikscz10LmFsdEtleXx8dC5jdHJsS2V5fHx0Lm1ldGFLZXl8fHQuc2hpZnRLZXk7KCFlfHxlJiYhaSYmIXMpJiYodGhpcy5zZWxlY3RlZEl0ZW09bnVsbCx0aGlzLnNlYXJjaChudWxsLHQpKX0sdGhpcy5vcHRpb25zLmRlbGF5KX0sc2VhcmNoOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQ9bnVsbCE9dD90OnRoaXMuX3ZhbHVlKCksdGhpcy50ZXJtPXRoaXMuX3ZhbHVlKCksdC5sZW5ndGg8dGhpcy5vcHRpb25zLm1pbkxlbmd0aD90aGlzLmNsb3NlKGUpOnRoaXMuX3RyaWdnZXIoXCJzZWFyY2hcIixlKSE9PSExP3RoaXMuX3NlYXJjaCh0KTp2b2lkIDB9LF9zZWFyY2g6ZnVuY3Rpb24odCl7dGhpcy5wZW5kaW5nKyssdGhpcy5fYWRkQ2xhc3MoXCJ1aS1hdXRvY29tcGxldGUtbG9hZGluZ1wiKSx0aGlzLmNhbmNlbFNlYXJjaD0hMSx0aGlzLnNvdXJjZSh7dGVybTp0fSx0aGlzLl9yZXNwb25zZSgpKX0sX3Jlc3BvbnNlOmZ1bmN0aW9uKCl7dmFyIGU9Kyt0aGlzLnJlcXVlc3RJbmRleDtyZXR1cm4gdC5wcm94eShmdW5jdGlvbih0KXtlPT09dGhpcy5yZXF1ZXN0SW5kZXgmJnRoaXMuX19yZXNwb25zZSh0KSx0aGlzLnBlbmRpbmctLSx0aGlzLnBlbmRpbmd8fHRoaXMuX3JlbW92ZUNsYXNzKFwidWktYXV0b2NvbXBsZXRlLWxvYWRpbmdcIil9LHRoaXMpfSxfX3Jlc3BvbnNlOmZ1bmN0aW9uKHQpe3QmJih0PXRoaXMuX25vcm1hbGl6ZSh0KSksdGhpcy5fdHJpZ2dlcihcInJlc3BvbnNlXCIsbnVsbCx7Y29udGVudDp0fSksIXRoaXMub3B0aW9ucy5kaXNhYmxlZCYmdCYmdC5sZW5ndGgmJiF0aGlzLmNhbmNlbFNlYXJjaD8odGhpcy5fc3VnZ2VzdCh0KSx0aGlzLl90cmlnZ2VyKFwib3BlblwiKSk6dGhpcy5fY2xvc2UoKX0sY2xvc2U6ZnVuY3Rpb24odCl7dGhpcy5jYW5jZWxTZWFyY2g9ITAsdGhpcy5fY2xvc2UodCl9LF9jbG9zZTpmdW5jdGlvbih0KXt0aGlzLl9vZmYodGhpcy5kb2N1bWVudCxcIm1vdXNlZG93blwiKSx0aGlzLm1lbnUuZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpJiYodGhpcy5tZW51LmVsZW1lbnQuaGlkZSgpLHRoaXMubWVudS5ibHVyKCksdGhpcy5pc05ld01lbnU9ITAsdGhpcy5fdHJpZ2dlcihcImNsb3NlXCIsdCkpfSxfY2hhbmdlOmZ1bmN0aW9uKHQpe3RoaXMucHJldmlvdXMhPT10aGlzLl92YWx1ZSgpJiZ0aGlzLl90cmlnZ2VyKFwiY2hhbmdlXCIsdCx7aXRlbTp0aGlzLnNlbGVjdGVkSXRlbX0pfSxfbm9ybWFsaXplOmZ1bmN0aW9uKGUpe3JldHVybiBlLmxlbmd0aCYmZVswXS5sYWJlbCYmZVswXS52YWx1ZT9lOnQubWFwKGUsZnVuY3Rpb24oZSl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGU/e2xhYmVsOmUsdmFsdWU6ZX06dC5leHRlbmQoe30sZSx7bGFiZWw6ZS5sYWJlbHx8ZS52YWx1ZSx2YWx1ZTplLnZhbHVlfHxlLmxhYmVsfSl9KX0sX3N1Z2dlc3Q6ZnVuY3Rpb24oZSl7dmFyIGk9dGhpcy5tZW51LmVsZW1lbnQuZW1wdHkoKTt0aGlzLl9yZW5kZXJNZW51KGksZSksdGhpcy5pc05ld01lbnU9ITAsdGhpcy5tZW51LnJlZnJlc2goKSxpLnNob3coKSx0aGlzLl9yZXNpemVNZW51KCksaS5wb3NpdGlvbih0LmV4dGVuZCh7b2Y6dGhpcy5lbGVtZW50fSx0aGlzLm9wdGlvbnMucG9zaXRpb24pKSx0aGlzLm9wdGlvbnMuYXV0b0ZvY3VzJiZ0aGlzLm1lbnUubmV4dCgpLHRoaXMuX29uKHRoaXMuZG9jdW1lbnQse21vdXNlZG93bjpcIl9jbG9zZU9uQ2xpY2tPdXRzaWRlXCJ9KX0sX3Jlc2l6ZU1lbnU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm1lbnUuZWxlbWVudDt0Lm91dGVyV2lkdGgoTWF0aC5tYXgodC53aWR0aChcIlwiKS5vdXRlcldpZHRoKCkrMSx0aGlzLmVsZW1lbnQub3V0ZXJXaWR0aCgpKSl9LF9yZW5kZXJNZW51OmZ1bmN0aW9uKGUsaSl7dmFyIHM9dGhpczt0LmVhY2goaSxmdW5jdGlvbih0LGkpe3MuX3JlbmRlckl0ZW1EYXRhKGUsaSl9KX0sX3JlbmRlckl0ZW1EYXRhOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuX3JlbmRlckl0ZW0odCxlKS5kYXRhKFwidWktYXV0b2NvbXBsZXRlLWl0ZW1cIixlKX0sX3JlbmRlckl0ZW06ZnVuY3Rpb24oZSxpKXtyZXR1cm4gdChcIjxsaT5cIikuYXBwZW5kKHQoXCI8ZGl2PlwiKS50ZXh0KGkubGFiZWwpKS5hcHBlbmRUbyhlKX0sX21vdmU6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5tZW51LmVsZW1lbnQuaXMoXCI6dmlzaWJsZVwiKT90aGlzLm1lbnUuaXNGaXJzdEl0ZW0oKSYmL15wcmV2aW91cy8udGVzdCh0KXx8dGhpcy5tZW51LmlzTGFzdEl0ZW0oKSYmL15uZXh0Ly50ZXN0KHQpPyh0aGlzLmlzTXVsdGlMaW5lfHx0aGlzLl92YWx1ZSh0aGlzLnRlcm0pLHRoaXMubWVudS5ibHVyKCksdm9pZCAwKToodGhpcy5tZW51W3RdKGUpLHZvaWQgMCk6KHRoaXMuc2VhcmNoKG51bGwsZSksdm9pZCAwKX0sd2lkZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubWVudS5lbGVtZW50fSxfdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52YWx1ZU1ldGhvZC5hcHBseSh0aGlzLmVsZW1lbnQsYXJndW1lbnRzKX0sX2tleUV2ZW50OmZ1bmN0aW9uKHQsZSl7KCF0aGlzLmlzTXVsdGlMaW5lfHx0aGlzLm1lbnUuZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpKSYmKHRoaXMuX21vdmUodCxlKSxlLnByZXZlbnREZWZhdWx0KCkpfSxfaXNDb250ZW50RWRpdGFibGU6ZnVuY3Rpb24odCl7aWYoIXQubGVuZ3RoKXJldHVybiExO3ZhciBlPXQucHJvcChcImNvbnRlbnRFZGl0YWJsZVwiKTtyZXR1cm5cImluaGVyaXRcIj09PWU/dGhpcy5faXNDb250ZW50RWRpdGFibGUodC5wYXJlbnQoKSk6XCJ0cnVlXCI9PT1lfX0pLHQuZXh0ZW5kKHQudWkuYXV0b2NvbXBsZXRlLHtlc2NhcGVSZWdleDpmdW5jdGlvbih0KXtyZXR1cm4gdC5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSorPy4sXFxcXFxcXiR8I1xcc10vZyxcIlxcXFwkJlwiKX0sZmlsdGVyOmZ1bmN0aW9uKGUsaSl7dmFyIHM9UmVnRXhwKHQudWkuYXV0b2NvbXBsZXRlLmVzY2FwZVJlZ2V4KGkpLFwiaVwiKTtyZXR1cm4gdC5ncmVwKGUsZnVuY3Rpb24odCl7cmV0dXJuIHMudGVzdCh0LmxhYmVsfHx0LnZhbHVlfHx0KX0pfX0pLHQud2lkZ2V0KFwidWkuYXV0b2NvbXBsZXRlXCIsdC51aS5hdXRvY29tcGxldGUse29wdGlvbnM6e21lc3NhZ2VzOntub1Jlc3VsdHM6XCJObyBzZWFyY2ggcmVzdWx0cy5cIixyZXN1bHRzOmZ1bmN0aW9uKHQpe3JldHVybiB0Kyh0PjE/XCIgcmVzdWx0cyBhcmVcIjpcIiByZXN1bHQgaXNcIikrXCIgYXZhaWxhYmxlLCB1c2UgdXAgYW5kIGRvd24gYXJyb3cga2V5cyB0byBuYXZpZ2F0ZS5cIn19fSxfX3Jlc3BvbnNlOmZ1bmN0aW9uKGUpe3ZhciBpO3RoaXMuX3N1cGVyQXBwbHkoYXJndW1lbnRzKSx0aGlzLm9wdGlvbnMuZGlzYWJsZWR8fHRoaXMuY2FuY2VsU2VhcmNofHwoaT1lJiZlLmxlbmd0aD90aGlzLm9wdGlvbnMubWVzc2FnZXMucmVzdWx0cyhlLmxlbmd0aCk6dGhpcy5vcHRpb25zLm1lc3NhZ2VzLm5vUmVzdWx0cyx0aGlzLmxpdmVSZWdpb24uY2hpbGRyZW4oKS5oaWRlKCksdChcIjxkaXY+XCIpLnRleHQoaSkuYXBwZW5kVG8odGhpcy5saXZlUmVnaW9uKSl9fSksdC51aS5hdXRvY29tcGxldGUsdC5leHRlbmQodC51aSx7ZGF0ZXBpY2tlcjp7dmVyc2lvbjpcIjEuMTIuMVwifX0pO3ZhciBsO3QuZXh0ZW5kKGkucHJvdG90eXBlLHttYXJrZXJDbGFzc05hbWU6XCJoYXNEYXRlcGlja2VyXCIsbWF4Um93czo0LF93aWRnZXREYXRlcGlja2VyOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZHBEaXZ9LHNldERlZmF1bHRzOmZ1bmN0aW9uKHQpe3JldHVybiBvKHRoaXMuX2RlZmF1bHRzLHR8fHt9KSx0aGlzfSxfYXR0YWNoRGF0ZXBpY2tlcjpmdW5jdGlvbihlLGkpe3ZhciBzLG4sbztzPWUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxuPVwiZGl2XCI9PT1zfHxcInNwYW5cIj09PXMsZS5pZHx8KHRoaXMudXVpZCs9MSxlLmlkPVwiZHBcIit0aGlzLnV1aWQpLG89dGhpcy5fbmV3SW5zdCh0KGUpLG4pLG8uc2V0dGluZ3M9dC5leHRlbmQoe30saXx8e30pLFwiaW5wdXRcIj09PXM/dGhpcy5fY29ubmVjdERhdGVwaWNrZXIoZSxvKTpuJiZ0aGlzLl9pbmxpbmVEYXRlcGlja2VyKGUsbyl9LF9uZXdJbnN0OmZ1bmN0aW9uKGUsaSl7dmFyIG49ZVswXS5pZC5yZXBsYWNlKC8oW15BLVphLXowLTlfXFwtXSkvZyxcIlxcXFxcXFxcJDFcIik7cmV0dXJue2lkOm4saW5wdXQ6ZSxzZWxlY3RlZERheTowLHNlbGVjdGVkTW9udGg6MCxzZWxlY3RlZFllYXI6MCxkcmF3TW9udGg6MCxkcmF3WWVhcjowLGlubGluZTppLGRwRGl2Omk/cyh0KFwiPGRpdiBjbGFzcz0nXCIrdGhpcy5faW5saW5lQ2xhc3MrXCIgdWktZGF0ZXBpY2tlciB1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnQgdWktaGVscGVyLWNsZWFyZml4IHVpLWNvcm5lci1hbGwnPjwvZGl2PlwiKSk6dGhpcy5kcERpdn19LF9jb25uZWN0RGF0ZXBpY2tlcjpmdW5jdGlvbihlLGkpe3ZhciBzPXQoZSk7aS5hcHBlbmQ9dChbXSksaS50cmlnZ2VyPXQoW10pLHMuaGFzQ2xhc3ModGhpcy5tYXJrZXJDbGFzc05hbWUpfHwodGhpcy5fYXR0YWNobWVudHMocyxpKSxzLmFkZENsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKS5vbihcImtleWRvd25cIix0aGlzLl9kb0tleURvd24pLm9uKFwia2V5cHJlc3NcIix0aGlzLl9kb0tleVByZXNzKS5vbihcImtleXVwXCIsdGhpcy5fZG9LZXlVcCksdGhpcy5fYXV0b1NpemUoaSksdC5kYXRhKGUsXCJkYXRlcGlja2VyXCIsaSksaS5zZXR0aW5ncy5kaXNhYmxlZCYmdGhpcy5fZGlzYWJsZURhdGVwaWNrZXIoZSkpfSxfYXR0YWNobWVudHM6ZnVuY3Rpb24oZSxpKXt2YXIgcyxuLG8sYT10aGlzLl9nZXQoaSxcImFwcGVuZFRleHRcIikscj10aGlzLl9nZXQoaSxcImlzUlRMXCIpO2kuYXBwZW5kJiZpLmFwcGVuZC5yZW1vdmUoKSxhJiYoaS5hcHBlbmQ9dChcIjxzcGFuIGNsYXNzPSdcIit0aGlzLl9hcHBlbmRDbGFzcytcIic+XCIrYStcIjwvc3Bhbj5cIiksZVtyP1wiYmVmb3JlXCI6XCJhZnRlclwiXShpLmFwcGVuZCkpLGUub2ZmKFwiZm9jdXNcIix0aGlzLl9zaG93RGF0ZXBpY2tlciksaS50cmlnZ2VyJiZpLnRyaWdnZXIucmVtb3ZlKCkscz10aGlzLl9nZXQoaSxcInNob3dPblwiKSwoXCJmb2N1c1wiPT09c3x8XCJib3RoXCI9PT1zKSYmZS5vbihcImZvY3VzXCIsdGhpcy5fc2hvd0RhdGVwaWNrZXIpLChcImJ1dHRvblwiPT09c3x8XCJib3RoXCI9PT1zKSYmKG49dGhpcy5fZ2V0KGksXCJidXR0b25UZXh0XCIpLG89dGhpcy5fZ2V0KGksXCJidXR0b25JbWFnZVwiKSxpLnRyaWdnZXI9dCh0aGlzLl9nZXQoaSxcImJ1dHRvbkltYWdlT25seVwiKT90KFwiPGltZy8+XCIpLmFkZENsYXNzKHRoaXMuX3RyaWdnZXJDbGFzcykuYXR0cih7c3JjOm8sYWx0Om4sdGl0bGU6bn0pOnQoXCI8YnV0dG9uIHR5cGU9J2J1dHRvbic+PC9idXR0b24+XCIpLmFkZENsYXNzKHRoaXMuX3RyaWdnZXJDbGFzcykuaHRtbChvP3QoXCI8aW1nLz5cIikuYXR0cih7c3JjOm8sYWx0Om4sdGl0bGU6bn0pOm4pKSxlW3I/XCJiZWZvcmVcIjpcImFmdGVyXCJdKGkudHJpZ2dlciksaS50cmlnZ2VyLm9uKFwiY2xpY2tcIixmdW5jdGlvbigpe3JldHVybiB0LmRhdGVwaWNrZXIuX2RhdGVwaWNrZXJTaG93aW5nJiZ0LmRhdGVwaWNrZXIuX2xhc3RJbnB1dD09PWVbMF0/dC5kYXRlcGlja2VyLl9oaWRlRGF0ZXBpY2tlcigpOnQuZGF0ZXBpY2tlci5fZGF0ZXBpY2tlclNob3dpbmcmJnQuZGF0ZXBpY2tlci5fbGFzdElucHV0IT09ZVswXT8odC5kYXRlcGlja2VyLl9oaWRlRGF0ZXBpY2tlcigpLHQuZGF0ZXBpY2tlci5fc2hvd0RhdGVwaWNrZXIoZVswXSkpOnQuZGF0ZXBpY2tlci5fc2hvd0RhdGVwaWNrZXIoZVswXSksITF9KSl9LF9hdXRvU2l6ZTpmdW5jdGlvbih0KXtpZih0aGlzLl9nZXQodCxcImF1dG9TaXplXCIpJiYhdC5pbmxpbmUpe3ZhciBlLGkscyxuLG89bmV3IERhdGUoMjAwOSwxMSwyMCksYT10aGlzLl9nZXQodCxcImRhdGVGb3JtYXRcIik7YS5tYXRjaCgvW0RNXS8pJiYoZT1mdW5jdGlvbih0KXtmb3IoaT0wLHM9MCxuPTA7dC5sZW5ndGg+bjtuKyspdFtuXS5sZW5ndGg+aSYmKGk9dFtuXS5sZW5ndGgscz1uKTtyZXR1cm4gc30sby5zZXRNb250aChlKHRoaXMuX2dldCh0LGEubWF0Y2goL01NLyk/XCJtb250aE5hbWVzXCI6XCJtb250aE5hbWVzU2hvcnRcIikpKSxvLnNldERhdGUoZSh0aGlzLl9nZXQodCxhLm1hdGNoKC9ERC8pP1wiZGF5TmFtZXNcIjpcImRheU5hbWVzU2hvcnRcIikpKzIwLW8uZ2V0RGF5KCkpKSx0LmlucHV0LmF0dHIoXCJzaXplXCIsdGhpcy5fZm9ybWF0RGF0ZSh0LG8pLmxlbmd0aCl9fSxfaW5saW5lRGF0ZXBpY2tlcjpmdW5jdGlvbihlLGkpe3ZhciBzPXQoZSk7cy5oYXNDbGFzcyh0aGlzLm1hcmtlckNsYXNzTmFtZSl8fChzLmFkZENsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKS5hcHBlbmQoaS5kcERpdiksdC5kYXRhKGUsXCJkYXRlcGlja2VyXCIsaSksdGhpcy5fc2V0RGF0ZShpLHRoaXMuX2dldERlZmF1bHREYXRlKGkpLCEwKSx0aGlzLl91cGRhdGVEYXRlcGlja2VyKGkpLHRoaXMuX3VwZGF0ZUFsdGVybmF0ZShpKSxpLnNldHRpbmdzLmRpc2FibGVkJiZ0aGlzLl9kaXNhYmxlRGF0ZXBpY2tlcihlKSxpLmRwRGl2LmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpKX0sX2RpYWxvZ0RhdGVwaWNrZXI6ZnVuY3Rpb24oZSxpLHMsbixhKXt2YXIgcixsLGgsYyx1LGQ9dGhpcy5fZGlhbG9nSW5zdDtyZXR1cm4gZHx8KHRoaXMudXVpZCs9MSxyPVwiZHBcIit0aGlzLnV1aWQsdGhpcy5fZGlhbG9nSW5wdXQ9dChcIjxpbnB1dCB0eXBlPSd0ZXh0JyBpZD0nXCIrcitcIicgc3R5bGU9J3Bvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAtMTAwcHg7IHdpZHRoOiAwcHg7Jy8+XCIpLHRoaXMuX2RpYWxvZ0lucHV0Lm9uKFwia2V5ZG93blwiLHRoaXMuX2RvS2V5RG93biksdChcImJvZHlcIikuYXBwZW5kKHRoaXMuX2RpYWxvZ0lucHV0KSxkPXRoaXMuX2RpYWxvZ0luc3Q9dGhpcy5fbmV3SW5zdCh0aGlzLl9kaWFsb2dJbnB1dCwhMSksZC5zZXR0aW5ncz17fSx0LmRhdGEodGhpcy5fZGlhbG9nSW5wdXRbMF0sXCJkYXRlcGlja2VyXCIsZCkpLG8oZC5zZXR0aW5ncyxufHx7fSksaT1pJiZpLmNvbnN0cnVjdG9yPT09RGF0ZT90aGlzLl9mb3JtYXREYXRlKGQsaSk6aSx0aGlzLl9kaWFsb2dJbnB1dC52YWwoaSksdGhpcy5fcG9zPWE/YS5sZW5ndGg/YTpbYS5wYWdlWCxhLnBhZ2VZXTpudWxsLHRoaXMuX3Bvc3x8KGw9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLGg9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCxjPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0fHxkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQsdT1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wfHxkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCx0aGlzLl9wb3M9W2wvMi0xMDArYyxoLzItMTUwK3VdKSx0aGlzLl9kaWFsb2dJbnB1dC5jc3MoXCJsZWZ0XCIsdGhpcy5fcG9zWzBdKzIwK1wicHhcIikuY3NzKFwidG9wXCIsdGhpcy5fcG9zWzFdK1wicHhcIiksZC5zZXR0aW5ncy5vblNlbGVjdD1zLHRoaXMuX2luRGlhbG9nPSEwLHRoaXMuZHBEaXYuYWRkQ2xhc3ModGhpcy5fZGlhbG9nQ2xhc3MpLHRoaXMuX3Nob3dEYXRlcGlja2VyKHRoaXMuX2RpYWxvZ0lucHV0WzBdKSx0LmJsb2NrVUkmJnQuYmxvY2tVSSh0aGlzLmRwRGl2KSx0LmRhdGEodGhpcy5fZGlhbG9nSW5wdXRbMF0sXCJkYXRlcGlja2VyXCIsZCksdGhpc30sX2Rlc3Ryb3lEYXRlcGlja2VyOmZ1bmN0aW9uKGUpe3ZhciBpLHM9dChlKSxuPXQuZGF0YShlLFwiZGF0ZXBpY2tlclwiKTtzLmhhc0NsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKSYmKGk9ZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLHQucmVtb3ZlRGF0YShlLFwiZGF0ZXBpY2tlclwiKSxcImlucHV0XCI9PT1pPyhuLmFwcGVuZC5yZW1vdmUoKSxuLnRyaWdnZXIucmVtb3ZlKCkscy5yZW1vdmVDbGFzcyh0aGlzLm1hcmtlckNsYXNzTmFtZSkub2ZmKFwiZm9jdXNcIix0aGlzLl9zaG93RGF0ZXBpY2tlcikub2ZmKFwia2V5ZG93blwiLHRoaXMuX2RvS2V5RG93bikub2ZmKFwia2V5cHJlc3NcIix0aGlzLl9kb0tleVByZXNzKS5vZmYoXCJrZXl1cFwiLHRoaXMuX2RvS2V5VXApKTooXCJkaXZcIj09PWl8fFwic3BhblwiPT09aSkmJnMucmVtb3ZlQ2xhc3ModGhpcy5tYXJrZXJDbGFzc05hbWUpLmVtcHR5KCksbD09PW4mJihsPW51bGwpKX0sX2VuYWJsZURhdGVwaWNrZXI6ZnVuY3Rpb24oZSl7dmFyIGkscyxuPXQoZSksbz10LmRhdGEoZSxcImRhdGVwaWNrZXJcIik7bi5oYXNDbGFzcyh0aGlzLm1hcmtlckNsYXNzTmFtZSkmJihpPWUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcImlucHV0XCI9PT1pPyhlLmRpc2FibGVkPSExLG8udHJpZ2dlci5maWx0ZXIoXCJidXR0b25cIikuZWFjaChmdW5jdGlvbigpe3RoaXMuZGlzYWJsZWQ9ITF9KS5lbmQoKS5maWx0ZXIoXCJpbWdcIikuY3NzKHtvcGFjaXR5OlwiMS4wXCIsY3Vyc29yOlwiXCJ9KSk6KFwiZGl2XCI9PT1pfHxcInNwYW5cIj09PWkpJiYocz1uLmNoaWxkcmVuKFwiLlwiK3RoaXMuX2lubGluZUNsYXNzKSxzLmNoaWxkcmVuKCkucmVtb3ZlQ2xhc3MoXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiKSxzLmZpbmQoXCJzZWxlY3QudWktZGF0ZXBpY2tlci1tb250aCwgc2VsZWN0LnVpLWRhdGVwaWNrZXIteWVhclwiKS5wcm9wKFwiZGlzYWJsZWRcIiwhMSkpLHRoaXMuX2Rpc2FibGVkSW5wdXRzPXQubWFwKHRoaXMuX2Rpc2FibGVkSW5wdXRzLGZ1bmN0aW9uKHQpe3JldHVybiB0PT09ZT9udWxsOnR9KSl9LF9kaXNhYmxlRGF0ZXBpY2tlcjpmdW5jdGlvbihlKXt2YXIgaSxzLG49dChlKSxvPXQuZGF0YShlLFwiZGF0ZXBpY2tlclwiKTtuLmhhc0NsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKSYmKGk9ZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLFwiaW5wdXRcIj09PWk/KGUuZGlzYWJsZWQ9ITAsby50cmlnZ2VyLmZpbHRlcihcImJ1dHRvblwiKS5lYWNoKGZ1bmN0aW9uKCl7dGhpcy5kaXNhYmxlZD0hMH0pLmVuZCgpLmZpbHRlcihcImltZ1wiKS5jc3Moe29wYWNpdHk6XCIwLjVcIixjdXJzb3I6XCJkZWZhdWx0XCJ9KSk6KFwiZGl2XCI9PT1pfHxcInNwYW5cIj09PWkpJiYocz1uLmNoaWxkcmVuKFwiLlwiK3RoaXMuX2lubGluZUNsYXNzKSxzLmNoaWxkcmVuKCkuYWRkQ2xhc3MoXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiKSxzLmZpbmQoXCJzZWxlY3QudWktZGF0ZXBpY2tlci1tb250aCwgc2VsZWN0LnVpLWRhdGVwaWNrZXIteWVhclwiKS5wcm9wKFwiZGlzYWJsZWRcIiwhMCkpLHRoaXMuX2Rpc2FibGVkSW5wdXRzPXQubWFwKHRoaXMuX2Rpc2FibGVkSW5wdXRzLGZ1bmN0aW9uKHQpe3JldHVybiB0PT09ZT9udWxsOnR9KSx0aGlzLl9kaXNhYmxlZElucHV0c1t0aGlzLl9kaXNhYmxlZElucHV0cy5sZW5ndGhdPWUpfSxfaXNEaXNhYmxlZERhdGVwaWNrZXI6ZnVuY3Rpb24odCl7aWYoIXQpcmV0dXJuITE7Zm9yKHZhciBlPTA7dGhpcy5fZGlzYWJsZWRJbnB1dHMubGVuZ3RoPmU7ZSsrKWlmKHRoaXMuX2Rpc2FibGVkSW5wdXRzW2VdPT09dClyZXR1cm4hMDtyZXR1cm4hMX0sX2dldEluc3Q6ZnVuY3Rpb24oZSl7dHJ5e3JldHVybiB0LmRhdGEoZSxcImRhdGVwaWNrZXJcIil9Y2F0Y2goaSl7dGhyb3dcIk1pc3NpbmcgaW5zdGFuY2UgZGF0YSBmb3IgdGhpcyBkYXRlcGlja2VyXCJ9fSxfb3B0aW9uRGF0ZXBpY2tlcjpmdW5jdGlvbihlLGkscyl7dmFyIG4sYSxyLGwsaD10aGlzLl9nZXRJbnN0KGUpO3JldHVybiAyPT09YXJndW1lbnRzLmxlbmd0aCYmXCJzdHJpbmdcIj09dHlwZW9mIGk/XCJkZWZhdWx0c1wiPT09aT90LmV4dGVuZCh7fSx0LmRhdGVwaWNrZXIuX2RlZmF1bHRzKTpoP1wiYWxsXCI9PT1pP3QuZXh0ZW5kKHt9LGguc2V0dGluZ3MpOnRoaXMuX2dldChoLGkpOm51bGw6KG49aXx8e30sXCJzdHJpbmdcIj09dHlwZW9mIGkmJihuPXt9LG5baV09cyksaCYmKHRoaXMuX2N1ckluc3Q9PT1oJiZ0aGlzLl9oaWRlRGF0ZXBpY2tlcigpLGE9dGhpcy5fZ2V0RGF0ZURhdGVwaWNrZXIoZSwhMCkscj10aGlzLl9nZXRNaW5NYXhEYXRlKGgsXCJtaW5cIiksbD10aGlzLl9nZXRNaW5NYXhEYXRlKGgsXCJtYXhcIiksbyhoLnNldHRpbmdzLG4pLG51bGwhPT1yJiZ2b2lkIDAhPT1uLmRhdGVGb3JtYXQmJnZvaWQgMD09PW4ubWluRGF0ZSYmKGguc2V0dGluZ3MubWluRGF0ZT10aGlzLl9mb3JtYXREYXRlKGgscikpLG51bGwhPT1sJiZ2b2lkIDAhPT1uLmRhdGVGb3JtYXQmJnZvaWQgMD09PW4ubWF4RGF0ZSYmKGguc2V0dGluZ3MubWF4RGF0ZT10aGlzLl9mb3JtYXREYXRlKGgsbCkpLFwiZGlzYWJsZWRcImluIG4mJihuLmRpc2FibGVkP3RoaXMuX2Rpc2FibGVEYXRlcGlja2VyKGUpOnRoaXMuX2VuYWJsZURhdGVwaWNrZXIoZSkpLHRoaXMuX2F0dGFjaG1lbnRzKHQoZSksaCksdGhpcy5fYXV0b1NpemUoaCksdGhpcy5fc2V0RGF0ZShoLGEpLHRoaXMuX3VwZGF0ZUFsdGVybmF0ZShoKSx0aGlzLl91cGRhdGVEYXRlcGlja2VyKGgpKSx2b2lkIDApfSxfY2hhbmdlRGF0ZXBpY2tlcjpmdW5jdGlvbih0LGUsaSl7dGhpcy5fb3B0aW9uRGF0ZXBpY2tlcih0LGUsaSl9LF9yZWZyZXNoRGF0ZXBpY2tlcjpmdW5jdGlvbih0KXt2YXIgZT10aGlzLl9nZXRJbnN0KHQpO2UmJnRoaXMuX3VwZGF0ZURhdGVwaWNrZXIoZSl9LF9zZXREYXRlRGF0ZXBpY2tlcjpmdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2dldEluc3QodCk7aSYmKHRoaXMuX3NldERhdGUoaSxlKSx0aGlzLl91cGRhdGVEYXRlcGlja2VyKGkpLHRoaXMuX3VwZGF0ZUFsdGVybmF0ZShpKSl9LF9nZXREYXRlRGF0ZXBpY2tlcjpmdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2dldEluc3QodCk7cmV0dXJuIGkmJiFpLmlubGluZSYmdGhpcy5fc2V0RGF0ZUZyb21GaWVsZChpLGUpLGk/dGhpcy5fZ2V0RGF0ZShpKTpudWxsfSxfZG9LZXlEb3duOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbixvPXQuZGF0ZXBpY2tlci5fZ2V0SW5zdChlLnRhcmdldCksYT0hMCxyPW8uZHBEaXYuaXMoXCIudWktZGF0ZXBpY2tlci1ydGxcIik7aWYoby5fa2V5RXZlbnQ9ITAsdC5kYXRlcGlja2VyLl9kYXRlcGlja2VyU2hvd2luZylzd2l0Y2goZS5rZXlDb2RlKXtjYXNlIDk6dC5kYXRlcGlja2VyLl9oaWRlRGF0ZXBpY2tlcigpLGE9ITE7YnJlYWs7Y2FzZSAxMzpyZXR1cm4gbj10KFwidGQuXCIrdC5kYXRlcGlja2VyLl9kYXlPdmVyQ2xhc3MrXCI6bm90KC5cIit0LmRhdGVwaWNrZXIuX2N1cnJlbnRDbGFzcytcIilcIixvLmRwRGl2KSxuWzBdJiZ0LmRhdGVwaWNrZXIuX3NlbGVjdERheShlLnRhcmdldCxvLnNlbGVjdGVkTW9udGgsby5zZWxlY3RlZFllYXIsblswXSksaT10LmRhdGVwaWNrZXIuX2dldChvLFwib25TZWxlY3RcIiksaT8ocz10LmRhdGVwaWNrZXIuX2Zvcm1hdERhdGUobyksaS5hcHBseShvLmlucHV0P28uaW5wdXRbMF06bnVsbCxbcyxvXSkpOnQuZGF0ZXBpY2tlci5faGlkZURhdGVwaWNrZXIoKSwhMTtjYXNlIDI3OnQuZGF0ZXBpY2tlci5faGlkZURhdGVwaWNrZXIoKTticmVhaztjYXNlIDMzOnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCxlLmN0cmxLZXk/LXQuZGF0ZXBpY2tlci5fZ2V0KG8sXCJzdGVwQmlnTW9udGhzXCIpOi10LmRhdGVwaWNrZXIuX2dldChvLFwic3RlcE1vbnRoc1wiKSxcIk1cIik7YnJlYWs7Y2FzZSAzNDp0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUoZS50YXJnZXQsZS5jdHJsS2V5Pyt0LmRhdGVwaWNrZXIuX2dldChvLFwic3RlcEJpZ01vbnRoc1wiKTordC5kYXRlcGlja2VyLl9nZXQobyxcInN0ZXBNb250aHNcIiksXCJNXCIpO2JyZWFrO2Nhc2UgMzU6KGUuY3RybEtleXx8ZS5tZXRhS2V5KSYmdC5kYXRlcGlja2VyLl9jbGVhckRhdGUoZS50YXJnZXQpLGE9ZS5jdHJsS2V5fHxlLm1ldGFLZXk7YnJlYWs7Y2FzZSAzNjooZS5jdHJsS2V5fHxlLm1ldGFLZXkpJiZ0LmRhdGVwaWNrZXIuX2dvdG9Ub2RheShlLnRhcmdldCksYT1lLmN0cmxLZXl8fGUubWV0YUtleTticmVhaztjYXNlIDM3OihlLmN0cmxLZXl8fGUubWV0YUtleSkmJnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCxyPzE6LTEsXCJEXCIpLGE9ZS5jdHJsS2V5fHxlLm1ldGFLZXksZS5vcmlnaW5hbEV2ZW50LmFsdEtleSYmdC5kYXRlcGlja2VyLl9hZGp1c3REYXRlKGUudGFyZ2V0LGUuY3RybEtleT8tdC5kYXRlcGlja2VyLl9nZXQobyxcInN0ZXBCaWdNb250aHNcIik6LXQuZGF0ZXBpY2tlci5fZ2V0KG8sXCJzdGVwTW9udGhzXCIpLFwiTVwiKTticmVhaztjYXNlIDM4OihlLmN0cmxLZXl8fGUubWV0YUtleSkmJnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCwtNyxcIkRcIiksYT1lLmN0cmxLZXl8fGUubWV0YUtleTticmVhaztjYXNlIDM5OihlLmN0cmxLZXl8fGUubWV0YUtleSkmJnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCxyPy0xOjEsXCJEXCIpLGE9ZS5jdHJsS2V5fHxlLm1ldGFLZXksZS5vcmlnaW5hbEV2ZW50LmFsdEtleSYmdC5kYXRlcGlja2VyLl9hZGp1c3REYXRlKGUudGFyZ2V0LGUuY3RybEtleT8rdC5kYXRlcGlja2VyLl9nZXQobyxcInN0ZXBCaWdNb250aHNcIik6K3QuZGF0ZXBpY2tlci5fZ2V0KG8sXCJzdGVwTW9udGhzXCIpLFwiTVwiKTticmVhaztjYXNlIDQwOihlLmN0cmxLZXl8fGUubWV0YUtleSkmJnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCw3LFwiRFwiKSxhPWUuY3RybEtleXx8ZS5tZXRhS2V5O2JyZWFrO2RlZmF1bHQ6YT0hMX1lbHNlIDM2PT09ZS5rZXlDb2RlJiZlLmN0cmxLZXk/dC5kYXRlcGlja2VyLl9zaG93RGF0ZXBpY2tlcih0aGlzKTphPSExO2EmJihlLnByZXZlbnREZWZhdWx0KCksZS5zdG9wUHJvcGFnYXRpb24oKSl9LF9kb0tleVByZXNzOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbj10LmRhdGVwaWNrZXIuX2dldEluc3QoZS50YXJnZXQpO3JldHVybiB0LmRhdGVwaWNrZXIuX2dldChuLFwiY29uc3RyYWluSW5wdXRcIik/KGk9dC5kYXRlcGlja2VyLl9wb3NzaWJsZUNoYXJzKHQuZGF0ZXBpY2tlci5fZ2V0KG4sXCJkYXRlRm9ybWF0XCIpKSxzPVN0cmluZy5mcm9tQ2hhckNvZGUobnVsbD09ZS5jaGFyQ29kZT9lLmtleUNvZGU6ZS5jaGFyQ29kZSksZS5jdHJsS2V5fHxlLm1ldGFLZXl8fFwiIFwiPnN8fCFpfHxpLmluZGV4T2Yocyk+LTEpOnZvaWQgMH0sX2RvS2V5VXA6ZnVuY3Rpb24oZSl7dmFyIGkscz10LmRhdGVwaWNrZXIuX2dldEluc3QoZS50YXJnZXQpO2lmKHMuaW5wdXQudmFsKCkhPT1zLmxhc3RWYWwpdHJ5e2k9dC5kYXRlcGlja2VyLnBhcnNlRGF0ZSh0LmRhdGVwaWNrZXIuX2dldChzLFwiZGF0ZUZvcm1hdFwiKSxzLmlucHV0P3MuaW5wdXQudmFsKCk6bnVsbCx0LmRhdGVwaWNrZXIuX2dldEZvcm1hdENvbmZpZyhzKSksaSYmKHQuZGF0ZXBpY2tlci5fc2V0RGF0ZUZyb21GaWVsZChzKSx0LmRhdGVwaWNrZXIuX3VwZGF0ZUFsdGVybmF0ZShzKSx0LmRhdGVwaWNrZXIuX3VwZGF0ZURhdGVwaWNrZXIocykpfWNhdGNoKG4pe31yZXR1cm4hMH0sX3Nob3dEYXRlcGlja2VyOmZ1bmN0aW9uKGkpe2lmKGk9aS50YXJnZXR8fGksXCJpbnB1dFwiIT09aS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpJiYoaT10KFwiaW5wdXRcIixpLnBhcmVudE5vZGUpWzBdKSwhdC5kYXRlcGlja2VyLl9pc0Rpc2FibGVkRGF0ZXBpY2tlcihpKSYmdC5kYXRlcGlja2VyLl9sYXN0SW5wdXQhPT1pKXt2YXIgcyxuLGEscixsLGgsYztzPXQuZGF0ZXBpY2tlci5fZ2V0SW5zdChpKSx0LmRhdGVwaWNrZXIuX2N1ckluc3QmJnQuZGF0ZXBpY2tlci5fY3VySW5zdCE9PXMmJih0LmRhdGVwaWNrZXIuX2N1ckluc3QuZHBEaXYuc3RvcCghMCwhMCkscyYmdC5kYXRlcGlja2VyLl9kYXRlcGlja2VyU2hvd2luZyYmdC5kYXRlcGlja2VyLl9oaWRlRGF0ZXBpY2tlcih0LmRhdGVwaWNrZXIuX2N1ckluc3QuaW5wdXRbMF0pKSxuPXQuZGF0ZXBpY2tlci5fZ2V0KHMsXCJiZWZvcmVTaG93XCIpLGE9bj9uLmFwcGx5KGksW2ksc10pOnt9LGEhPT0hMSYmKG8ocy5zZXR0aW5ncyxhKSxzLmxhc3RWYWw9bnVsbCx0LmRhdGVwaWNrZXIuX2xhc3RJbnB1dD1pLHQuZGF0ZXBpY2tlci5fc2V0RGF0ZUZyb21GaWVsZChzKSx0LmRhdGVwaWNrZXIuX2luRGlhbG9nJiYoaS52YWx1ZT1cIlwiKSx0LmRhdGVwaWNrZXIuX3Bvc3x8KHQuZGF0ZXBpY2tlci5fcG9zPXQuZGF0ZXBpY2tlci5fZmluZFBvcyhpKSx0LmRhdGVwaWNrZXIuX3Bvc1sxXSs9aS5vZmZzZXRIZWlnaHQpLHI9ITEsdChpKS5wYXJlbnRzKCkuZWFjaChmdW5jdGlvbigpe3JldHVybiByfD1cImZpeGVkXCI9PT10KHRoaXMpLmNzcyhcInBvc2l0aW9uXCIpLCFyfSksbD17bGVmdDp0LmRhdGVwaWNrZXIuX3Bvc1swXSx0b3A6dC5kYXRlcGlja2VyLl9wb3NbMV19LHQuZGF0ZXBpY2tlci5fcG9zPW51bGwscy5kcERpdi5lbXB0eSgpLHMuZHBEaXYuY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsZGlzcGxheTpcImJsb2NrXCIsdG9wOlwiLTEwMDBweFwifSksdC5kYXRlcGlja2VyLl91cGRhdGVEYXRlcGlja2VyKHMpLGw9dC5kYXRlcGlja2VyLl9jaGVja09mZnNldChzLGwscikscy5kcERpdi5jc3Moe3Bvc2l0aW9uOnQuZGF0ZXBpY2tlci5faW5EaWFsb2cmJnQuYmxvY2tVST9cInN0YXRpY1wiOnI/XCJmaXhlZFwiOlwiYWJzb2x1dGVcIixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6bC5sZWZ0K1wicHhcIix0b3A6bC50b3ArXCJweFwifSkscy5pbmxpbmV8fChoPXQuZGF0ZXBpY2tlci5fZ2V0KHMsXCJzaG93QW5pbVwiKSxjPXQuZGF0ZXBpY2tlci5fZ2V0KHMsXCJkdXJhdGlvblwiKSxzLmRwRGl2LmNzcyhcInotaW5kZXhcIixlKHQoaSkpKzEpLHQuZGF0ZXBpY2tlci5fZGF0ZXBpY2tlclNob3dpbmc9ITAsdC5lZmZlY3RzJiZ0LmVmZmVjdHMuZWZmZWN0W2hdP3MuZHBEaXYuc2hvdyhoLHQuZGF0ZXBpY2tlci5fZ2V0KHMsXCJzaG93T3B0aW9uc1wiKSxjKTpzLmRwRGl2W2h8fFwic2hvd1wiXShoP2M6bnVsbCksdC5kYXRlcGlja2VyLl9zaG91bGRGb2N1c0lucHV0KHMpJiZzLmlucHV0LnRyaWdnZXIoXCJmb2N1c1wiKSx0LmRhdGVwaWNrZXIuX2N1ckluc3Q9cykpfX0sX3VwZGF0ZURhdGVwaWNrZXI6ZnVuY3Rpb24oZSl7dGhpcy5tYXhSb3dzPTQsbD1lLGUuZHBEaXYuZW1wdHkoKS5hcHBlbmQodGhpcy5fZ2VuZXJhdGVIVE1MKGUpKSx0aGlzLl9hdHRhY2hIYW5kbGVycyhlKTt2YXIgaSxzPXRoaXMuX2dldE51bWJlck9mTW9udGhzKGUpLG89c1sxXSxhPTE3LHI9ZS5kcERpdi5maW5kKFwiLlwiK3RoaXMuX2RheU92ZXJDbGFzcytcIiBhXCIpO3IubGVuZ3RoPjAmJm4uYXBwbHkoci5nZXQoMCkpLGUuZHBEaXYucmVtb3ZlQ2xhc3MoXCJ1aS1kYXRlcGlja2VyLW11bHRpLTIgdWktZGF0ZXBpY2tlci1tdWx0aS0zIHVpLWRhdGVwaWNrZXItbXVsdGktNFwiKS53aWR0aChcIlwiKSxvPjEmJmUuZHBEaXYuYWRkQ2xhc3MoXCJ1aS1kYXRlcGlja2VyLW11bHRpLVwiK28pLmNzcyhcIndpZHRoXCIsYSpvK1wiZW1cIiksZS5kcERpdlsoMSE9PXNbMF18fDEhPT1zWzFdP1wiYWRkXCI6XCJyZW1vdmVcIikrXCJDbGFzc1wiXShcInVpLWRhdGVwaWNrZXItbXVsdGlcIiksZS5kcERpdlsodGhpcy5fZ2V0KGUsXCJpc1JUTFwiKT9cImFkZFwiOlwicmVtb3ZlXCIpK1wiQ2xhc3NcIl0oXCJ1aS1kYXRlcGlja2VyLXJ0bFwiKSxlPT09dC5kYXRlcGlja2VyLl9jdXJJbnN0JiZ0LmRhdGVwaWNrZXIuX2RhdGVwaWNrZXJTaG93aW5nJiZ0LmRhdGVwaWNrZXIuX3Nob3VsZEZvY3VzSW5wdXQoZSkmJmUuaW5wdXQudHJpZ2dlcihcImZvY3VzXCIpLGUueWVhcnNodG1sJiYoaT1lLnllYXJzaHRtbCxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aT09PWUueWVhcnNodG1sJiZlLnllYXJzaHRtbCYmZS5kcERpdi5maW5kKFwic2VsZWN0LnVpLWRhdGVwaWNrZXIteWVhcjpmaXJzdFwiKS5yZXBsYWNlV2l0aChlLnllYXJzaHRtbCksaT1lLnllYXJzaHRtbD1udWxsfSwwKSl9LF9zaG91bGRGb2N1c0lucHV0OmZ1bmN0aW9uKHQpe3JldHVybiB0LmlucHV0JiZ0LmlucHV0LmlzKFwiOnZpc2libGVcIikmJiF0LmlucHV0LmlzKFwiOmRpc2FibGVkXCIpJiYhdC5pbnB1dC5pcyhcIjpmb2N1c1wiKX0sX2NoZWNrT2Zmc2V0OmZ1bmN0aW9uKGUsaSxzKXt2YXIgbj1lLmRwRGl2Lm91dGVyV2lkdGgoKSxvPWUuZHBEaXYub3V0ZXJIZWlnaHQoKSxhPWUuaW5wdXQ/ZS5pbnB1dC5vdXRlcldpZHRoKCk6MCxyPWUuaW5wdXQ/ZS5pbnB1dC5vdXRlckhlaWdodCgpOjAsbD1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgrKHM/MDp0KGRvY3VtZW50KS5zY3JvbGxMZWZ0KCkpLGg9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCsocz8wOnQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpKTtyZXR1cm4gaS5sZWZ0LT10aGlzLl9nZXQoZSxcImlzUlRMXCIpP24tYTowLGkubGVmdC09cyYmaS5sZWZ0PT09ZS5pbnB1dC5vZmZzZXQoKS5sZWZ0P3QoZG9jdW1lbnQpLnNjcm9sbExlZnQoKTowLGkudG9wLT1zJiZpLnRvcD09PWUuaW5wdXQub2Zmc2V0KCkudG9wK3I/dChkb2N1bWVudCkuc2Nyb2xsVG9wKCk6MCxpLmxlZnQtPU1hdGgubWluKGkubGVmdCxpLmxlZnQrbj5sJiZsPm4/TWF0aC5hYnMoaS5sZWZ0K24tbCk6MCksaS50b3AtPU1hdGgubWluKGkudG9wLGkudG9wK28+aCYmaD5vP01hdGguYWJzKG8rcik6MCksaX0sX2ZpbmRQb3M6ZnVuY3Rpb24oZSl7Zm9yKHZhciBpLHM9dGhpcy5fZ2V0SW5zdChlKSxuPXRoaXMuX2dldChzLFwiaXNSVExcIik7ZSYmKFwiaGlkZGVuXCI9PT1lLnR5cGV8fDEhPT1lLm5vZGVUeXBlfHx0LmV4cHIuZmlsdGVycy5oaWRkZW4oZSkpOyllPWVbbj9cInByZXZpb3VzU2libGluZ1wiOlwibmV4dFNpYmxpbmdcIl07cmV0dXJuIGk9dChlKS5vZmZzZXQoKSxbaS5sZWZ0LGkudG9wXX0sX2hpZGVEYXRlcGlja2VyOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbixvLGE9dGhpcy5fY3VySW5zdDshYXx8ZSYmYSE9PXQuZGF0YShlLFwiZGF0ZXBpY2tlclwiKXx8dGhpcy5fZGF0ZXBpY2tlclNob3dpbmcmJihpPXRoaXMuX2dldChhLFwic2hvd0FuaW1cIikscz10aGlzLl9nZXQoYSxcImR1cmF0aW9uXCIpLG49ZnVuY3Rpb24oKXt0LmRhdGVwaWNrZXIuX3RpZHlEaWFsb2coYSl9LHQuZWZmZWN0cyYmKHQuZWZmZWN0cy5lZmZlY3RbaV18fHQuZWZmZWN0c1tpXSk/YS5kcERpdi5oaWRlKGksdC5kYXRlcGlja2VyLl9nZXQoYSxcInNob3dPcHRpb25zXCIpLHMsbik6YS5kcERpdltcInNsaWRlRG93blwiPT09aT9cInNsaWRlVXBcIjpcImZhZGVJblwiPT09aT9cImZhZGVPdXRcIjpcImhpZGVcIl0oaT9zOm51bGwsbiksaXx8bigpLHRoaXMuX2RhdGVwaWNrZXJTaG93aW5nPSExLG89dGhpcy5fZ2V0KGEsXCJvbkNsb3NlXCIpLG8mJm8uYXBwbHkoYS5pbnB1dD9hLmlucHV0WzBdOm51bGwsW2EuaW5wdXQ/YS5pbnB1dC52YWwoKTpcIlwiLGFdKSx0aGlzLl9sYXN0SW5wdXQ9bnVsbCx0aGlzLl9pbkRpYWxvZyYmKHRoaXMuX2RpYWxvZ0lucHV0LmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLGxlZnQ6XCIwXCIsdG9wOlwiLTEwMHB4XCJ9KSx0LmJsb2NrVUkmJih0LnVuYmxvY2tVSSgpLHQoXCJib2R5XCIpLmFwcGVuZCh0aGlzLmRwRGl2KSkpLHRoaXMuX2luRGlhbG9nPSExKX0sX3RpZHlEaWFsb2c6ZnVuY3Rpb24odCl7dC5kcERpdi5yZW1vdmVDbGFzcyh0aGlzLl9kaWFsb2dDbGFzcykub2ZmKFwiLnVpLWRhdGVwaWNrZXItY2FsZW5kYXJcIil9LF9jaGVja0V4dGVybmFsQ2xpY2s6ZnVuY3Rpb24oZSl7aWYodC5kYXRlcGlja2VyLl9jdXJJbnN0KXt2YXIgaT10KGUudGFyZ2V0KSxzPXQuZGF0ZXBpY2tlci5fZ2V0SW5zdChpWzBdKTsoaVswXS5pZCE9PXQuZGF0ZXBpY2tlci5fbWFpbkRpdklkJiYwPT09aS5wYXJlbnRzKFwiI1wiK3QuZGF0ZXBpY2tlci5fbWFpbkRpdklkKS5sZW5ndGgmJiFpLmhhc0NsYXNzKHQuZGF0ZXBpY2tlci5tYXJrZXJDbGFzc05hbWUpJiYhaS5jbG9zZXN0KFwiLlwiK3QuZGF0ZXBpY2tlci5fdHJpZ2dlckNsYXNzKS5sZW5ndGgmJnQuZGF0ZXBpY2tlci5fZGF0ZXBpY2tlclNob3dpbmcmJighdC5kYXRlcGlja2VyLl9pbkRpYWxvZ3x8IXQuYmxvY2tVSSl8fGkuaGFzQ2xhc3ModC5kYXRlcGlja2VyLm1hcmtlckNsYXNzTmFtZSkmJnQuZGF0ZXBpY2tlci5fY3VySW5zdCE9PXMpJiZ0LmRhdGVwaWNrZXIuX2hpZGVEYXRlcGlja2VyKCl9fSxfYWRqdXN0RGF0ZTpmdW5jdGlvbihlLGkscyl7dmFyIG49dChlKSxvPXRoaXMuX2dldEluc3QoblswXSk7dGhpcy5faXNEaXNhYmxlZERhdGVwaWNrZXIoblswXSl8fCh0aGlzLl9hZGp1c3RJbnN0RGF0ZShvLGkrKFwiTVwiPT09cz90aGlzLl9nZXQobyxcInNob3dDdXJyZW50QXRQb3NcIik6MCkscyksdGhpcy5fdXBkYXRlRGF0ZXBpY2tlcihvKSl9LF9nb3RvVG9kYXk6ZnVuY3Rpb24oZSl7dmFyIGkscz10KGUpLG49dGhpcy5fZ2V0SW5zdChzWzBdKTt0aGlzLl9nZXQobixcImdvdG9DdXJyZW50XCIpJiZuLmN1cnJlbnREYXk/KG4uc2VsZWN0ZWREYXk9bi5jdXJyZW50RGF5LG4uZHJhd01vbnRoPW4uc2VsZWN0ZWRNb250aD1uLmN1cnJlbnRNb250aCxuLmRyYXdZZWFyPW4uc2VsZWN0ZWRZZWFyPW4uY3VycmVudFllYXIpOihpPW5ldyBEYXRlLG4uc2VsZWN0ZWREYXk9aS5nZXREYXRlKCksbi5kcmF3TW9udGg9bi5zZWxlY3RlZE1vbnRoPWkuZ2V0TW9udGgoKSxuLmRyYXdZZWFyPW4uc2VsZWN0ZWRZZWFyPWkuZ2V0RnVsbFllYXIoKSksdGhpcy5fbm90aWZ5Q2hhbmdlKG4pLHRoaXMuX2FkanVzdERhdGUocyl9LF9zZWxlY3RNb250aFllYXI6ZnVuY3Rpb24oZSxpLHMpe3ZhciBuPXQoZSksbz10aGlzLl9nZXRJbnN0KG5bMF0pO29bXCJzZWxlY3RlZFwiKyhcIk1cIj09PXM/XCJNb250aFwiOlwiWWVhclwiKV09b1tcImRyYXdcIisoXCJNXCI9PT1zP1wiTW9udGhcIjpcIlllYXJcIildPXBhcnNlSW50KGkub3B0aW9uc1tpLnNlbGVjdGVkSW5kZXhdLnZhbHVlLDEwKSx0aGlzLl9ub3RpZnlDaGFuZ2UobyksdGhpcy5fYWRqdXN0RGF0ZShuKX0sX3NlbGVjdERheTpmdW5jdGlvbihlLGkscyxuKXt2YXIgbyxhPXQoZSk7dChuKS5oYXNDbGFzcyh0aGlzLl91bnNlbGVjdGFibGVDbGFzcyl8fHRoaXMuX2lzRGlzYWJsZWREYXRlcGlja2VyKGFbMF0pfHwobz10aGlzLl9nZXRJbnN0KGFbMF0pLG8uc2VsZWN0ZWREYXk9by5jdXJyZW50RGF5PXQoXCJhXCIsbikuaHRtbCgpLG8uc2VsZWN0ZWRNb250aD1vLmN1cnJlbnRNb250aD1pLG8uc2VsZWN0ZWRZZWFyPW8uY3VycmVudFllYXI9cyx0aGlzLl9zZWxlY3REYXRlKGUsdGhpcy5fZm9ybWF0RGF0ZShvLG8uY3VycmVudERheSxvLmN1cnJlbnRNb250aCxvLmN1cnJlbnRZZWFyKSkpfSxfY2xlYXJEYXRlOmZ1bmN0aW9uKGUpe3ZhciBpPXQoZSk7dGhpcy5fc2VsZWN0RGF0ZShpLFwiXCIpfSxfc2VsZWN0RGF0ZTpmdW5jdGlvbihlLGkpe3ZhciBzLG49dChlKSxvPXRoaXMuX2dldEluc3QoblswXSk7aT1udWxsIT1pP2k6dGhpcy5fZm9ybWF0RGF0ZShvKSxvLmlucHV0JiZvLmlucHV0LnZhbChpKSx0aGlzLl91cGRhdGVBbHRlcm5hdGUobykscz10aGlzLl9nZXQobyxcIm9uU2VsZWN0XCIpLHM/cy5hcHBseShvLmlucHV0P28uaW5wdXRbMF06bnVsbCxbaSxvXSk6by5pbnB1dCYmby5pbnB1dC50cmlnZ2VyKFwiY2hhbmdlXCIpLG8uaW5saW5lP3RoaXMuX3VwZGF0ZURhdGVwaWNrZXIobyk6KHRoaXMuX2hpZGVEYXRlcGlja2VyKCksdGhpcy5fbGFzdElucHV0PW8uaW5wdXRbMF0sXCJvYmplY3RcIiE9dHlwZW9mIG8uaW5wdXRbMF0mJm8uaW5wdXQudHJpZ2dlcihcImZvY3VzXCIpLHRoaXMuX2xhc3RJbnB1dD1udWxsKX0sX3VwZGF0ZUFsdGVybmF0ZTpmdW5jdGlvbihlKXt2YXIgaSxzLG4sbz10aGlzLl9nZXQoZSxcImFsdEZpZWxkXCIpO28mJihpPXRoaXMuX2dldChlLFwiYWx0Rm9ybWF0XCIpfHx0aGlzLl9nZXQoZSxcImRhdGVGb3JtYXRcIikscz10aGlzLl9nZXREYXRlKGUpLG49dGhpcy5mb3JtYXREYXRlKGkscyx0aGlzLl9nZXRGb3JtYXRDb25maWcoZSkpLHQobykudmFsKG4pKX0sbm9XZWVrZW5kczpmdW5jdGlvbih0KXt2YXIgZT10LmdldERheSgpO3JldHVybltlPjAmJjY+ZSxcIlwiXX0saXNvODYwMVdlZWs6ZnVuY3Rpb24odCl7dmFyIGUsaT1uZXcgRGF0ZSh0LmdldFRpbWUoKSk7cmV0dXJuIGkuc2V0RGF0ZShpLmdldERhdGUoKSs0LShpLmdldERheSgpfHw3KSksZT1pLmdldFRpbWUoKSxpLnNldE1vbnRoKDApLGkuc2V0RGF0ZSgxKSxNYXRoLmZsb29yKE1hdGgucm91bmQoKGUtaSkvODY0ZTUpLzcpKzF9LHBhcnNlRGF0ZTpmdW5jdGlvbihlLGkscyl7aWYobnVsbD09ZXx8bnVsbD09aSl0aHJvd1wiSW52YWxpZCBhcmd1bWVudHNcIjtpZihpPVwib2JqZWN0XCI9PXR5cGVvZiBpP1wiXCIraTppK1wiXCIsXCJcIj09PWkpcmV0dXJuIG51bGw7dmFyIG4sbyxhLHIsbD0wLGg9KHM/cy5zaG9ydFllYXJDdXRvZmY6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLnNob3J0WWVhckN1dG9mZixjPVwic3RyaW5nXCIhPXR5cGVvZiBoP2g6KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpJTEwMCtwYXJzZUludChoLDEwKSx1PShzP3MuZGF5TmFtZXNTaG9ydDpudWxsKXx8dGhpcy5fZGVmYXVsdHMuZGF5TmFtZXNTaG9ydCxkPShzP3MuZGF5TmFtZXM6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLmRheU5hbWVzLHA9KHM/cy5tb250aE5hbWVzU2hvcnQ6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLm1vbnRoTmFtZXNTaG9ydCxmPShzP3MubW9udGhOYW1lczpudWxsKXx8dGhpcy5fZGVmYXVsdHMubW9udGhOYW1lcyxnPS0xLG09LTEsXz0tMSx2PS0xLGI9ITEseT1mdW5jdGlvbih0KXt2YXIgaT1lLmxlbmd0aD5uKzEmJmUuY2hhckF0KG4rMSk9PT10O3JldHVybiBpJiZuKyssaX0sdz1mdW5jdGlvbih0KXt2YXIgZT15KHQpLHM9XCJAXCI9PT10PzE0OlwiIVwiPT09dD8yMDpcInlcIj09PXQmJmU/NDpcIm9cIj09PXQ/MzoyLG49XCJ5XCI9PT10P3M6MSxvPVJlZ0V4cChcIl5cXFxcZHtcIituK1wiLFwiK3MrXCJ9XCIpLGE9aS5zdWJzdHJpbmcobCkubWF0Y2gobyk7aWYoIWEpdGhyb3dcIk1pc3NpbmcgbnVtYmVyIGF0IHBvc2l0aW9uIFwiK2w7cmV0dXJuIGwrPWFbMF0ubGVuZ3RoLHBhcnNlSW50KGFbMF0sMTApfSxrPWZ1bmN0aW9uKGUscyxuKXt2YXIgbz0tMSxhPXQubWFwKHkoZSk/bjpzLGZ1bmN0aW9uKHQsZSl7cmV0dXJuW1tlLHRdXX0pLnNvcnQoZnVuY3Rpb24odCxlKXtyZXR1cm4tKHRbMV0ubGVuZ3RoLWVbMV0ubGVuZ3RoKX0pO2lmKHQuZWFjaChhLGZ1bmN0aW9uKHQsZSl7dmFyIHM9ZVsxXTtyZXR1cm4gaS5zdWJzdHIobCxzLmxlbmd0aCkudG9Mb3dlckNhc2UoKT09PXMudG9Mb3dlckNhc2UoKT8obz1lWzBdLGwrPXMubGVuZ3RoLCExKTp2b2lkIDB9KSwtMSE9PW8pcmV0dXJuIG8rMTt0aHJvd1wiVW5rbm93biBuYW1lIGF0IHBvc2l0aW9uIFwiK2x9LHg9ZnVuY3Rpb24oKXtpZihpLmNoYXJBdChsKSE9PWUuY2hhckF0KG4pKXRocm93XCJVbmV4cGVjdGVkIGxpdGVyYWwgYXQgcG9zaXRpb24gXCIrbDtsKyt9O2ZvcihuPTA7ZS5sZW5ndGg+bjtuKyspaWYoYilcIidcIiE9PWUuY2hhckF0KG4pfHx5KFwiJ1wiKT94KCk6Yj0hMTtlbHNlIHN3aXRjaChlLmNoYXJBdChuKSl7Y2FzZVwiZFwiOl89dyhcImRcIik7YnJlYWs7Y2FzZVwiRFwiOmsoXCJEXCIsdSxkKTticmVhaztjYXNlXCJvXCI6dj13KFwib1wiKTticmVhaztjYXNlXCJtXCI6bT13KFwibVwiKTticmVhaztjYXNlXCJNXCI6bT1rKFwiTVwiLHAsZik7YnJlYWs7Y2FzZVwieVwiOmc9dyhcInlcIik7YnJlYWs7Y2FzZVwiQFwiOnI9bmV3IERhdGUodyhcIkBcIikpLGc9ci5nZXRGdWxsWWVhcigpLG09ci5nZXRNb250aCgpKzEsXz1yLmdldERhdGUoKTticmVhaztjYXNlXCIhXCI6cj1uZXcgRGF0ZSgodyhcIiFcIiktdGhpcy5fdGlja3NUbzE5NzApLzFlNCksZz1yLmdldEZ1bGxZZWFyKCksbT1yLmdldE1vbnRoKCkrMSxfPXIuZ2V0RGF0ZSgpO2JyZWFrO2Nhc2VcIidcIjp5KFwiJ1wiKT94KCk6Yj0hMDticmVhaztkZWZhdWx0OngoKX1pZihpLmxlbmd0aD5sJiYoYT1pLnN1YnN0cihsKSwhL15cXHMrLy50ZXN0KGEpKSl0aHJvd1wiRXh0cmEvdW5wYXJzZWQgY2hhcmFjdGVycyBmb3VuZCBpbiBkYXRlOiBcIithO2lmKC0xPT09Zz9nPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKToxMDA+ZyYmKGcrPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKS0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCklMTAwKyhjPj1nPzA6LTEwMCkpLHY+LTEpZm9yKG09MSxfPXY7Oyl7aWYobz10aGlzLl9nZXREYXlzSW5Nb250aChnLG0tMSksbz49XylicmVhazttKyssXy09b31pZihyPXRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKGcsbS0xLF8pKSxyLmdldEZ1bGxZZWFyKCkhPT1nfHxyLmdldE1vbnRoKCkrMSE9PW18fHIuZ2V0RGF0ZSgpIT09Xyl0aHJvd1wiSW52YWxpZCBkYXRlXCI7cmV0dXJuIHJ9LEFUT006XCJ5eS1tbS1kZFwiLENPT0tJRTpcIkQsIGRkIE0geXlcIixJU09fODYwMTpcInl5LW1tLWRkXCIsUkZDXzgyMjpcIkQsIGQgTSB5XCIsUkZDXzg1MDpcIkRELCBkZC1NLXlcIixSRkNfMTAzNjpcIkQsIGQgTSB5XCIsUkZDXzExMjM6XCJELCBkIE0geXlcIixSRkNfMjgyMjpcIkQsIGQgTSB5eVwiLFJTUzpcIkQsIGQgTSB5XCIsVElDS1M6XCIhXCIsVElNRVNUQU1QOlwiQFwiLFczQzpcInl5LW1tLWRkXCIsX3RpY2tzVG8xOTcwOjFlNyo2MCo2MCoyNCooNzE4Njg1K01hdGguZmxvb3IoNDkyLjUpLU1hdGguZmxvb3IoMTkuNykrTWF0aC5mbG9vcig0LjkyNSkpLGZvcm1hdERhdGU6ZnVuY3Rpb24odCxlLGkpe2lmKCFlKXJldHVyblwiXCI7dmFyIHMsbj0oaT9pLmRheU5hbWVzU2hvcnQ6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLmRheU5hbWVzU2hvcnQsbz0oaT9pLmRheU5hbWVzOm51bGwpfHx0aGlzLl9kZWZhdWx0cy5kYXlOYW1lcyxhPShpP2kubW9udGhOYW1lc1Nob3J0Om51bGwpfHx0aGlzLl9kZWZhdWx0cy5tb250aE5hbWVzU2hvcnQscj0oaT9pLm1vbnRoTmFtZXM6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLm1vbnRoTmFtZXMsbD1mdW5jdGlvbihlKXt2YXIgaT10Lmxlbmd0aD5zKzEmJnQuY2hhckF0KHMrMSk9PT1lO3JldHVybiBpJiZzKyssaX0saD1mdW5jdGlvbih0LGUsaSl7dmFyIHM9XCJcIitlO2lmKGwodCkpZm9yKDtpPnMubGVuZ3RoOylzPVwiMFwiK3M7cmV0dXJuIHN9LGM9ZnVuY3Rpb24odCxlLGkscyl7cmV0dXJuIGwodCk/c1tlXTppW2VdfSx1PVwiXCIsZD0hMTtpZihlKWZvcihzPTA7dC5sZW5ndGg+cztzKyspaWYoZClcIidcIiE9PXQuY2hhckF0KHMpfHxsKFwiJ1wiKT91Kz10LmNoYXJBdChzKTpkPSExO2Vsc2Ugc3dpdGNoKHQuY2hhckF0KHMpKXtjYXNlXCJkXCI6dSs9aChcImRcIixlLmdldERhdGUoKSwyKTticmVhaztjYXNlXCJEXCI6dSs9YyhcIkRcIixlLmdldERheSgpLG4sbyk7YnJlYWs7Y2FzZVwib1wiOnUrPWgoXCJvXCIsTWF0aC5yb3VuZCgobmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLGUuZ2V0TW9udGgoKSxlLmdldERhdGUoKSkuZ2V0VGltZSgpLW5ldyBEYXRlKGUuZ2V0RnVsbFllYXIoKSwwLDApLmdldFRpbWUoKSkvODY0ZTUpLDMpO2JyZWFrO2Nhc2VcIm1cIjp1Kz1oKFwibVwiLGUuZ2V0TW9udGgoKSsxLDIpO2JyZWFrO2Nhc2VcIk1cIjp1Kz1jKFwiTVwiLGUuZ2V0TW9udGgoKSxhLHIpO2JyZWFrO2Nhc2VcInlcIjp1Kz1sKFwieVwiKT9lLmdldEZ1bGxZZWFyKCk6KDEwPmUuZ2V0RnVsbFllYXIoKSUxMDA/XCIwXCI6XCJcIikrZS5nZXRGdWxsWWVhcigpJTEwMDticmVhaztjYXNlXCJAXCI6dSs9ZS5nZXRUaW1lKCk7YnJlYWs7Y2FzZVwiIVwiOnUrPTFlNCplLmdldFRpbWUoKSt0aGlzLl90aWNrc1RvMTk3MDticmVhaztjYXNlXCInXCI6bChcIidcIik/dSs9XCInXCI6ZD0hMDticmVhaztkZWZhdWx0OnUrPXQuY2hhckF0KHMpfXJldHVybiB1fSxfcG9zc2libGVDaGFyczpmdW5jdGlvbih0KXt2YXIgZSxpPVwiXCIscz0hMSxuPWZ1bmN0aW9uKGkpe3ZhciBzPXQubGVuZ3RoPmUrMSYmdC5jaGFyQXQoZSsxKT09PWk7cmV0dXJuIHMmJmUrKyxzfTtmb3IoZT0wO3QubGVuZ3RoPmU7ZSsrKWlmKHMpXCInXCIhPT10LmNoYXJBdChlKXx8bihcIidcIik/aSs9dC5jaGFyQXQoZSk6cz0hMTtlbHNlIHN3aXRjaCh0LmNoYXJBdChlKSl7Y2FzZVwiZFwiOmNhc2VcIm1cIjpjYXNlXCJ5XCI6Y2FzZVwiQFwiOmkrPVwiMDEyMzQ1Njc4OVwiO2JyZWFrO2Nhc2VcIkRcIjpjYXNlXCJNXCI6cmV0dXJuIG51bGw7Y2FzZVwiJ1wiOm4oXCInXCIpP2krPVwiJ1wiOnM9ITA7YnJlYWs7ZGVmYXVsdDppKz10LmNoYXJBdChlKX1yZXR1cm4gaX0sX2dldDpmdW5jdGlvbih0LGUpe3JldHVybiB2b2lkIDAhPT10LnNldHRpbmdzW2VdP3Quc2V0dGluZ3NbZV06dGhpcy5fZGVmYXVsdHNbZV19LF9zZXREYXRlRnJvbUZpZWxkOmZ1bmN0aW9uKHQsZSl7aWYodC5pbnB1dC52YWwoKSE9PXQubGFzdFZhbCl7dmFyIGk9dGhpcy5fZ2V0KHQsXCJkYXRlRm9ybWF0XCIpLHM9dC5sYXN0VmFsPXQuaW5wdXQ/dC5pbnB1dC52YWwoKTpudWxsLG49dGhpcy5fZ2V0RGVmYXVsdERhdGUodCksbz1uLGE9dGhpcy5fZ2V0Rm9ybWF0Q29uZmlnKHQpO3RyeXtvPXRoaXMucGFyc2VEYXRlKGkscyxhKXx8bn1jYXRjaChyKXtzPWU/XCJcIjpzfXQuc2VsZWN0ZWREYXk9by5nZXREYXRlKCksdC5kcmF3TW9udGg9dC5zZWxlY3RlZE1vbnRoPW8uZ2V0TW9udGgoKSx0LmRyYXdZZWFyPXQuc2VsZWN0ZWRZZWFyPW8uZ2V0RnVsbFllYXIoKSx0LmN1cnJlbnREYXk9cz9vLmdldERhdGUoKTowLHQuY3VycmVudE1vbnRoPXM/by5nZXRNb250aCgpOjAsdC5jdXJyZW50WWVhcj1zP28uZ2V0RnVsbFllYXIoKTowLHRoaXMuX2FkanVzdEluc3REYXRlKHQpfX0sX2dldERlZmF1bHREYXRlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9yZXN0cmljdE1pbk1heCh0LHRoaXMuX2RldGVybWluZURhdGUodCx0aGlzLl9nZXQodCxcImRlZmF1bHREYXRlXCIpLG5ldyBEYXRlKSl9LF9kZXRlcm1pbmVEYXRlOmZ1bmN0aW9uKGUsaSxzKXt2YXIgbj1mdW5jdGlvbih0KXt2YXIgZT1uZXcgRGF0ZTtyZXR1cm4gZS5zZXREYXRlKGUuZ2V0RGF0ZSgpK3QpLGV9LG89ZnVuY3Rpb24oaSl7dHJ5e3JldHVybiB0LmRhdGVwaWNrZXIucGFyc2VEYXRlKHQuZGF0ZXBpY2tlci5fZ2V0KGUsXCJkYXRlRm9ybWF0XCIpLGksdC5kYXRlcGlja2VyLl9nZXRGb3JtYXRDb25maWcoZSkpfWNhdGNoKHMpe31mb3IodmFyIG49KGkudG9Mb3dlckNhc2UoKS5tYXRjaCgvXmMvKT90LmRhdGVwaWNrZXIuX2dldERhdGUoZSk6bnVsbCl8fG5ldyBEYXRlLG89bi5nZXRGdWxsWWVhcigpLGE9bi5nZXRNb250aCgpLHI9bi5nZXREYXRlKCksbD0vKFsrXFwtXT9bMC05XSspXFxzKihkfER8d3xXfG18TXx5fFkpPy9nLGg9bC5leGVjKGkpO2g7KXtzd2l0Y2goaFsyXXx8XCJkXCIpe2Nhc2VcImRcIjpjYXNlXCJEXCI6cis9cGFyc2VJbnQoaFsxXSwxMCk7YnJlYWs7Y2FzZVwid1wiOmNhc2VcIldcIjpyKz03KnBhcnNlSW50KGhbMV0sMTApO2JyZWFrO2Nhc2VcIm1cIjpjYXNlXCJNXCI6YSs9cGFyc2VJbnQoaFsxXSwxMCkscj1NYXRoLm1pbihyLHQuZGF0ZXBpY2tlci5fZ2V0RGF5c0luTW9udGgobyxhKSk7YnJlYWs7Y2FzZVwieVwiOmNhc2VcIllcIjpvKz1wYXJzZUludChoWzFdLDEwKSxyPU1hdGgubWluKHIsdC5kYXRlcGlja2VyLl9nZXREYXlzSW5Nb250aChvLGEpKX1oPWwuZXhlYyhpKX1yZXR1cm4gbmV3IERhdGUobyxhLHIpfSxhPW51bGw9PWl8fFwiXCI9PT1pP3M6XCJzdHJpbmdcIj09dHlwZW9mIGk/byhpKTpcIm51bWJlclwiPT10eXBlb2YgaT9pc05hTihpKT9zOm4oaSk6bmV3IERhdGUoaS5nZXRUaW1lKCkpO3JldHVybiBhPWEmJlwiSW52YWxpZCBEYXRlXCI9PVwiXCIrYT9zOmEsYSYmKGEuc2V0SG91cnMoMCksYS5zZXRNaW51dGVzKDApLGEuc2V0U2Vjb25kcygwKSxhLnNldE1pbGxpc2Vjb25kcygwKSksdGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QoYSl9LF9kYXlsaWdodFNhdmluZ0FkanVzdDpmdW5jdGlvbih0KXtyZXR1cm4gdD8odC5zZXRIb3Vycyh0LmdldEhvdXJzKCk+MTI/dC5nZXRIb3VycygpKzI6MCksdCk6bnVsbH0sX3NldERhdGU6ZnVuY3Rpb24odCxlLGkpe3ZhciBzPSFlLG49dC5zZWxlY3RlZE1vbnRoLG89dC5zZWxlY3RlZFllYXIsYT10aGlzLl9yZXN0cmljdE1pbk1heCh0LHRoaXMuX2RldGVybWluZURhdGUodCxlLG5ldyBEYXRlKSk7dC5zZWxlY3RlZERheT10LmN1cnJlbnREYXk9YS5nZXREYXRlKCksdC5kcmF3TW9udGg9dC5zZWxlY3RlZE1vbnRoPXQuY3VycmVudE1vbnRoPWEuZ2V0TW9udGgoKSx0LmRyYXdZZWFyPXQuc2VsZWN0ZWRZZWFyPXQuY3VycmVudFllYXI9YS5nZXRGdWxsWWVhcigpLG49PT10LnNlbGVjdGVkTW9udGgmJm89PT10LnNlbGVjdGVkWWVhcnx8aXx8dGhpcy5fbm90aWZ5Q2hhbmdlKHQpLHRoaXMuX2FkanVzdEluc3REYXRlKHQpLHQuaW5wdXQmJnQuaW5wdXQudmFsKHM/XCJcIjp0aGlzLl9mb3JtYXREYXRlKHQpKX0sX2dldERhdGU6ZnVuY3Rpb24odCl7dmFyIGU9IXQuY3VycmVudFllYXJ8fHQuaW5wdXQmJlwiXCI9PT10LmlucHV0LnZhbCgpP251bGw6dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodC5jdXJyZW50WWVhcix0LmN1cnJlbnRNb250aCx0LmN1cnJlbnREYXkpKTtyZXR1cm4gZX0sX2F0dGFjaEhhbmRsZXJzOmZ1bmN0aW9uKGUpe3ZhciBpPXRoaXMuX2dldChlLFwic3RlcE1vbnRoc1wiKSxzPVwiI1wiK2UuaWQucmVwbGFjZSgvXFxcXFxcXFwvZyxcIlxcXFxcIik7ZS5kcERpdi5maW5kKFwiW2RhdGEtaGFuZGxlcl1cIikubWFwKGZ1bmN0aW9uKCl7dmFyIGU9e3ByZXY6ZnVuY3Rpb24oKXt0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUocywtaSxcIk1cIil9LG5leHQ6ZnVuY3Rpb24oKXt0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUocywraSxcIk1cIil9LGhpZGU6ZnVuY3Rpb24oKXt0LmRhdGVwaWNrZXIuX2hpZGVEYXRlcGlja2VyKCl9LHRvZGF5OmZ1bmN0aW9uKCl7dC5kYXRlcGlja2VyLl9nb3RvVG9kYXkocyl9LHNlbGVjdERheTpmdW5jdGlvbigpe3JldHVybiB0LmRhdGVwaWNrZXIuX3NlbGVjdERheShzLCt0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtbW9udGhcIiksK3RoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS15ZWFyXCIpLHRoaXMpLCExfSxzZWxlY3RNb250aDpmdW5jdGlvbigpe3JldHVybiB0LmRhdGVwaWNrZXIuX3NlbGVjdE1vbnRoWWVhcihzLHRoaXMsXCJNXCIpLCExfSxzZWxlY3RZZWFyOmZ1bmN0aW9uKCl7cmV0dXJuIHQuZGF0ZXBpY2tlci5fc2VsZWN0TW9udGhZZWFyKHMsdGhpcyxcIllcIiksITF9fTt0KHRoaXMpLm9uKHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1ldmVudFwiKSxlW3RoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1oYW5kbGVyXCIpXSl9KX0sX2dlbmVyYXRlSFRNTDpmdW5jdGlvbih0KXt2YXIgZSxpLHMsbixvLGEscixsLGgsYyx1LGQscCxmLGcsbSxfLHYsYix5LHcsayx4LEMsRCxULEksTSxQLFMsTixILEEseixPLEUsVyxGLEwsUj1uZXcgRGF0ZSxZPXRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKFIuZ2V0RnVsbFllYXIoKSxSLmdldE1vbnRoKCksUi5nZXREYXRlKCkpKSxCPXRoaXMuX2dldCh0LFwiaXNSVExcIiksaj10aGlzLl9nZXQodCxcInNob3dCdXR0b25QYW5lbFwiKSxxPXRoaXMuX2dldCh0LFwiaGlkZUlmTm9QcmV2TmV4dFwiKSxLPXRoaXMuX2dldCh0LFwibmF2aWdhdGlvbkFzRGF0ZUZvcm1hdFwiKSxVPXRoaXMuX2dldE51bWJlck9mTW9udGhzKHQpLFY9dGhpcy5fZ2V0KHQsXCJzaG93Q3VycmVudEF0UG9zXCIpLFg9dGhpcy5fZ2V0KHQsXCJzdGVwTW9udGhzXCIpLCQ9MSE9PVVbMF18fDEhPT1VWzFdLEc9dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QodC5jdXJyZW50RGF5P25ldyBEYXRlKHQuY3VycmVudFllYXIsdC5jdXJyZW50TW9udGgsdC5jdXJyZW50RGF5KTpuZXcgRGF0ZSg5OTk5LDksOSkpLEo9dGhpcy5fZ2V0TWluTWF4RGF0ZSh0LFwibWluXCIpLFE9dGhpcy5fZ2V0TWluTWF4RGF0ZSh0LFwibWF4XCIpLFo9dC5kcmF3TW9udGgtVix0ZT10LmRyYXdZZWFyO2lmKDA+WiYmKForPTEyLHRlLS0pLFEpZm9yKGU9dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUoUS5nZXRGdWxsWWVhcigpLFEuZ2V0TW9udGgoKS1VWzBdKlVbMV0rMSxRLmdldERhdGUoKSkpLGU9SiYmSj5lP0o6ZTt0aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZSh0ZSxaLDEpKT5lOylaLS0sMD5aJiYoWj0xMSx0ZS0tKTtmb3IodC5kcmF3TW9udGg9Wix0LmRyYXdZZWFyPXRlLGk9dGhpcy5fZ2V0KHQsXCJwcmV2VGV4dFwiKSxpPUs/dGhpcy5mb3JtYXREYXRlKGksdGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodGUsWi1YLDEpKSx0aGlzLl9nZXRGb3JtYXRDb25maWcodCkpOmkscz10aGlzLl9jYW5BZGp1c3RNb250aCh0LC0xLHRlLFopP1wiPGEgY2xhc3M9J3VpLWRhdGVwaWNrZXItcHJldiB1aS1jb3JuZXItYWxsJyBkYXRhLWhhbmRsZXI9J3ByZXYnIGRhdGEtZXZlbnQ9J2NsaWNrJyB0aXRsZT0nXCIraStcIic+PHNwYW4gY2xhc3M9J3VpLWljb24gdWktaWNvbi1jaXJjbGUtdHJpYW5nbGUtXCIrKEI/XCJlXCI6XCJ3XCIpK1wiJz5cIitpK1wiPC9zcGFuPjwvYT5cIjpxP1wiXCI6XCI8YSBjbGFzcz0ndWktZGF0ZXBpY2tlci1wcmV2IHVpLWNvcm5lci1hbGwgdWktc3RhdGUtZGlzYWJsZWQnIHRpdGxlPSdcIitpK1wiJz48c3BhbiBjbGFzcz0ndWktaWNvbiB1aS1pY29uLWNpcmNsZS10cmlhbmdsZS1cIisoQj9cImVcIjpcIndcIikrXCInPlwiK2krXCI8L3NwYW4+PC9hPlwiLG49dGhpcy5fZ2V0KHQsXCJuZXh0VGV4dFwiKSxuPUs/dGhpcy5mb3JtYXREYXRlKG4sdGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodGUsWitYLDEpKSx0aGlzLl9nZXRGb3JtYXRDb25maWcodCkpOm4sbz10aGlzLl9jYW5BZGp1c3RNb250aCh0LDEsdGUsWik/XCI8YSBjbGFzcz0ndWktZGF0ZXBpY2tlci1uZXh0IHVpLWNvcm5lci1hbGwnIGRhdGEtaGFuZGxlcj0nbmV4dCcgZGF0YS1ldmVudD0nY2xpY2snIHRpdGxlPSdcIituK1wiJz48c3BhbiBjbGFzcz0ndWktaWNvbiB1aS1pY29uLWNpcmNsZS10cmlhbmdsZS1cIisoQj9cIndcIjpcImVcIikrXCInPlwiK24rXCI8L3NwYW4+PC9hPlwiOnE/XCJcIjpcIjxhIGNsYXNzPSd1aS1kYXRlcGlja2VyLW5leHQgdWktY29ybmVyLWFsbCB1aS1zdGF0ZS1kaXNhYmxlZCcgdGl0bGU9J1wiK24rXCInPjxzcGFuIGNsYXNzPSd1aS1pY29uIHVpLWljb24tY2lyY2xlLXRyaWFuZ2xlLVwiKyhCP1wid1wiOlwiZVwiKStcIic+XCIrbitcIjwvc3Bhbj48L2E+XCIsYT10aGlzLl9nZXQodCxcImN1cnJlbnRUZXh0XCIpLHI9dGhpcy5fZ2V0KHQsXCJnb3RvQ3VycmVudFwiKSYmdC5jdXJyZW50RGF5P0c6WSxhPUs/dGhpcy5mb3JtYXREYXRlKGEscix0aGlzLl9nZXRGb3JtYXRDb25maWcodCkpOmEsbD10LmlubGluZT9cIlwiOlwiPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzPSd1aS1kYXRlcGlja2VyLWNsb3NlIHVpLXN0YXRlLWRlZmF1bHQgdWktcHJpb3JpdHktcHJpbWFyeSB1aS1jb3JuZXItYWxsJyBkYXRhLWhhbmRsZXI9J2hpZGUnIGRhdGEtZXZlbnQ9J2NsaWNrJz5cIit0aGlzLl9nZXQodCxcImNsb3NlVGV4dFwiKStcIjwvYnV0dG9uPlwiLGg9aj9cIjxkaXYgY2xhc3M9J3VpLWRhdGVwaWNrZXItYnV0dG9ucGFuZSB1aS13aWRnZXQtY29udGVudCc+XCIrKEI/bDpcIlwiKSsodGhpcy5faXNJblJhbmdlKHQscik/XCI8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9J3VpLWRhdGVwaWNrZXItY3VycmVudCB1aS1zdGF0ZS1kZWZhdWx0IHVpLXByaW9yaXR5LXNlY29uZGFyeSB1aS1jb3JuZXItYWxsJyBkYXRhLWhhbmRsZXI9J3RvZGF5JyBkYXRhLWV2ZW50PSdjbGljayc+XCIrYStcIjwvYnV0dG9uPlwiOlwiXCIpKyhCP1wiXCI6bCkrXCI8L2Rpdj5cIjpcIlwiLGM9cGFyc2VJbnQodGhpcy5fZ2V0KHQsXCJmaXJzdERheVwiKSwxMCksYz1pc05hTihjKT8wOmMsdT10aGlzLl9nZXQodCxcInNob3dXZWVrXCIpLGQ9dGhpcy5fZ2V0KHQsXCJkYXlOYW1lc1wiKSxwPXRoaXMuX2dldCh0LFwiZGF5TmFtZXNNaW5cIiksZj10aGlzLl9nZXQodCxcIm1vbnRoTmFtZXNcIiksZz10aGlzLl9nZXQodCxcIm1vbnRoTmFtZXNTaG9ydFwiKSxtPXRoaXMuX2dldCh0LFwiYmVmb3JlU2hvd0RheVwiKSxfPXRoaXMuX2dldCh0LFwic2hvd090aGVyTW9udGhzXCIpLHY9dGhpcy5fZ2V0KHQsXCJzZWxlY3RPdGhlck1vbnRoc1wiKSxiPXRoaXMuX2dldERlZmF1bHREYXRlKHQpLHk9XCJcIixrPTA7VVswXT5rO2srKyl7Zm9yKHg9XCJcIix0aGlzLm1heFJvd3M9NCxDPTA7VVsxXT5DO0MrKyl7aWYoRD10aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZSh0ZSxaLHQuc2VsZWN0ZWREYXkpKSxUPVwiIHVpLWNvcm5lci1hbGxcIixJPVwiXCIsJCl7aWYoSSs9XCI8ZGl2IGNsYXNzPSd1aS1kYXRlcGlja2VyLWdyb3VwXCIsVVsxXT4xKXN3aXRjaChDKXtjYXNlIDA6SSs9XCIgdWktZGF0ZXBpY2tlci1ncm91cC1maXJzdFwiLFQ9XCIgdWktY29ybmVyLVwiKyhCP1wicmlnaHRcIjpcImxlZnRcIik7YnJlYWs7Y2FzZSBVWzFdLTE6SSs9XCIgdWktZGF0ZXBpY2tlci1ncm91cC1sYXN0XCIsVD1cIiB1aS1jb3JuZXItXCIrKEI/XCJsZWZ0XCI6XCJyaWdodFwiKTticmVhaztkZWZhdWx0OkkrPVwiIHVpLWRhdGVwaWNrZXItZ3JvdXAtbWlkZGxlXCIsVD1cIlwifUkrPVwiJz5cIn1mb3IoSSs9XCI8ZGl2IGNsYXNzPSd1aS1kYXRlcGlja2VyLWhlYWRlciB1aS13aWRnZXQtaGVhZGVyIHVpLWhlbHBlci1jbGVhcmZpeFwiK1QrXCInPlwiKygvYWxsfGxlZnQvLnRlc3QoVCkmJjA9PT1rP0I/bzpzOlwiXCIpKygvYWxsfHJpZ2h0Ly50ZXN0KFQpJiYwPT09az9CP3M6bzpcIlwiKSt0aGlzLl9nZW5lcmF0ZU1vbnRoWWVhckhlYWRlcih0LFosdGUsSixRLGs+MHx8Qz4wLGYsZykrXCI8L2Rpdj48dGFibGUgY2xhc3M9J3VpLWRhdGVwaWNrZXItY2FsZW5kYXInPjx0aGVhZD5cIitcIjx0cj5cIixNPXU/XCI8dGggY2xhc3M9J3VpLWRhdGVwaWNrZXItd2Vlay1jb2wnPlwiK3RoaXMuX2dldCh0LFwid2Vla0hlYWRlclwiKStcIjwvdGg+XCI6XCJcIix3PTA7Nz53O3crKylQPSh3K2MpJTcsTSs9XCI8dGggc2NvcGU9J2NvbCdcIisoKHcrYys2KSU3Pj01P1wiIGNsYXNzPSd1aS1kYXRlcGlja2VyLXdlZWstZW5kJ1wiOlwiXCIpK1wiPlwiK1wiPHNwYW4gdGl0bGU9J1wiK2RbUF0rXCInPlwiK3BbUF0rXCI8L3NwYW4+PC90aD5cIjtmb3IoSSs9TStcIjwvdHI+PC90aGVhZD48dGJvZHk+XCIsUz10aGlzLl9nZXREYXlzSW5Nb250aCh0ZSxaKSx0ZT09PXQuc2VsZWN0ZWRZZWFyJiZaPT09dC5zZWxlY3RlZE1vbnRoJiYodC5zZWxlY3RlZERheT1NYXRoLm1pbih0LnNlbGVjdGVkRGF5LFMpKSxOPSh0aGlzLl9nZXRGaXJzdERheU9mTW9udGgodGUsWiktYys3KSU3LEg9TWF0aC5jZWlsKChOK1MpLzcpLEE9JD90aGlzLm1heFJvd3M+SD90aGlzLm1heFJvd3M6SDpILHRoaXMubWF4Um93cz1BLHo9dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodGUsWiwxLU4pKSxPPTA7QT5PO08rKyl7Zm9yKEkrPVwiPHRyPlwiLEU9dT9cIjx0ZCBjbGFzcz0ndWktZGF0ZXBpY2tlci13ZWVrLWNvbCc+XCIrdGhpcy5fZ2V0KHQsXCJjYWxjdWxhdGVXZWVrXCIpKHopK1wiPC90ZD5cIjpcIlwiLHc9MDs3Pnc7dysrKVc9bT9tLmFwcGx5KHQuaW5wdXQ/dC5pbnB1dFswXTpudWxsLFt6XSk6WyEwLFwiXCJdLEY9ei5nZXRNb250aCgpIT09WixMPUYmJiF2fHwhV1swXXx8SiYmSj56fHxRJiZ6PlEsRSs9XCI8dGQgY2xhc3M9J1wiKygodytjKzYpJTc+PTU/XCIgdWktZGF0ZXBpY2tlci13ZWVrLWVuZFwiOlwiXCIpKyhGP1wiIHVpLWRhdGVwaWNrZXItb3RoZXItbW9udGhcIjpcIlwiKSsoei5nZXRUaW1lKCk9PT1ELmdldFRpbWUoKSYmWj09PXQuc2VsZWN0ZWRNb250aCYmdC5fa2V5RXZlbnR8fGIuZ2V0VGltZSgpPT09ei5nZXRUaW1lKCkmJmIuZ2V0VGltZSgpPT09RC5nZXRUaW1lKCk/XCIgXCIrdGhpcy5fZGF5T3ZlckNsYXNzOlwiXCIpKyhMP1wiIFwiK3RoaXMuX3Vuc2VsZWN0YWJsZUNsYXNzK1wiIHVpLXN0YXRlLWRpc2FibGVkXCI6XCJcIikrKEYmJiFfP1wiXCI6XCIgXCIrV1sxXSsoei5nZXRUaW1lKCk9PT1HLmdldFRpbWUoKT9cIiBcIit0aGlzLl9jdXJyZW50Q2xhc3M6XCJcIikrKHouZ2V0VGltZSgpPT09WS5nZXRUaW1lKCk/XCIgdWktZGF0ZXBpY2tlci10b2RheVwiOlwiXCIpKStcIidcIisoRiYmIV98fCFXWzJdP1wiXCI6XCIgdGl0bGU9J1wiK1dbMl0ucmVwbGFjZSgvJy9nLFwiJiMzOTtcIikrXCInXCIpKyhMP1wiXCI6XCIgZGF0YS1oYW5kbGVyPSdzZWxlY3REYXknIGRhdGEtZXZlbnQ9J2NsaWNrJyBkYXRhLW1vbnRoPSdcIit6LmdldE1vbnRoKCkrXCInIGRhdGEteWVhcj0nXCIrei5nZXRGdWxsWWVhcigpK1wiJ1wiKStcIj5cIisoRiYmIV8/XCImI3hhMDtcIjpMP1wiPHNwYW4gY2xhc3M9J3VpLXN0YXRlLWRlZmF1bHQnPlwiK3ouZ2V0RGF0ZSgpK1wiPC9zcGFuPlwiOlwiPGEgY2xhc3M9J3VpLXN0YXRlLWRlZmF1bHRcIisoei5nZXRUaW1lKCk9PT1ZLmdldFRpbWUoKT9cIiB1aS1zdGF0ZS1oaWdobGlnaHRcIjpcIlwiKSsoei5nZXRUaW1lKCk9PT1HLmdldFRpbWUoKT9cIiB1aS1zdGF0ZS1hY3RpdmVcIjpcIlwiKSsoRj9cIiB1aS1wcmlvcml0eS1zZWNvbmRhcnlcIjpcIlwiKStcIicgaHJlZj0nIyc+XCIrei5nZXREYXRlKCkrXCI8L2E+XCIpK1wiPC90ZD5cIix6LnNldERhdGUoei5nZXREYXRlKCkrMSksej10aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdCh6KTtcbkkrPUUrXCI8L3RyPlwifVorKyxaPjExJiYoWj0wLHRlKyspLEkrPVwiPC90Ym9keT48L3RhYmxlPlwiKygkP1wiPC9kaXY+XCIrKFVbMF0+MCYmQz09PVVbMV0tMT9cIjxkaXYgY2xhc3M9J3VpLWRhdGVwaWNrZXItcm93LWJyZWFrJz48L2Rpdj5cIjpcIlwiKTpcIlwiKSx4Kz1JfXkrPXh9cmV0dXJuIHkrPWgsdC5fa2V5RXZlbnQ9ITEseX0sX2dlbmVyYXRlTW9udGhZZWFySGVhZGVyOmZ1bmN0aW9uKHQsZSxpLHMsbixvLGEscil7dmFyIGwsaCxjLHUsZCxwLGYsZyxtPXRoaXMuX2dldCh0LFwiY2hhbmdlTW9udGhcIiksXz10aGlzLl9nZXQodCxcImNoYW5nZVllYXJcIiksdj10aGlzLl9nZXQodCxcInNob3dNb250aEFmdGVyWWVhclwiKSxiPVwiPGRpdiBjbGFzcz0ndWktZGF0ZXBpY2tlci10aXRsZSc+XCIseT1cIlwiO2lmKG98fCFtKXkrPVwiPHNwYW4gY2xhc3M9J3VpLWRhdGVwaWNrZXItbW9udGgnPlwiK2FbZV0rXCI8L3NwYW4+XCI7ZWxzZXtmb3IobD1zJiZzLmdldEZ1bGxZZWFyKCk9PT1pLGg9biYmbi5nZXRGdWxsWWVhcigpPT09aSx5Kz1cIjxzZWxlY3QgY2xhc3M9J3VpLWRhdGVwaWNrZXItbW9udGgnIGRhdGEtaGFuZGxlcj0nc2VsZWN0TW9udGgnIGRhdGEtZXZlbnQ9J2NoYW5nZSc+XCIsYz0wOzEyPmM7YysrKSghbHx8Yz49cy5nZXRNb250aCgpKSYmKCFofHxuLmdldE1vbnRoKCk+PWMpJiYoeSs9XCI8b3B0aW9uIHZhbHVlPSdcIitjK1wiJ1wiKyhjPT09ZT9cIiBzZWxlY3RlZD0nc2VsZWN0ZWQnXCI6XCJcIikrXCI+XCIrcltjXStcIjwvb3B0aW9uPlwiKTt5Kz1cIjwvc2VsZWN0PlwifWlmKHZ8fChiKz15KyghbyYmbSYmXz9cIlwiOlwiJiN4YTA7XCIpKSwhdC55ZWFyc2h0bWwpaWYodC55ZWFyc2h0bWw9XCJcIixvfHwhXyliKz1cIjxzcGFuIGNsYXNzPSd1aS1kYXRlcGlja2VyLXllYXInPlwiK2krXCI8L3NwYW4+XCI7ZWxzZXtmb3IodT10aGlzLl9nZXQodCxcInllYXJSYW5nZVwiKS5zcGxpdChcIjpcIiksZD0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCkscD1mdW5jdGlvbih0KXt2YXIgZT10Lm1hdGNoKC9jWytcXC1dLiovKT9pK3BhcnNlSW50KHQuc3Vic3RyaW5nKDEpLDEwKTp0Lm1hdGNoKC9bK1xcLV0uKi8pP2QrcGFyc2VJbnQodCwxMCk6cGFyc2VJbnQodCwxMCk7cmV0dXJuIGlzTmFOKGUpP2Q6ZX0sZj1wKHVbMF0pLGc9TWF0aC5tYXgoZixwKHVbMV18fFwiXCIpKSxmPXM/TWF0aC5tYXgoZixzLmdldEZ1bGxZZWFyKCkpOmYsZz1uP01hdGgubWluKGcsbi5nZXRGdWxsWWVhcigpKTpnLHQueWVhcnNodG1sKz1cIjxzZWxlY3QgY2xhc3M9J3VpLWRhdGVwaWNrZXIteWVhcicgZGF0YS1oYW5kbGVyPSdzZWxlY3RZZWFyJyBkYXRhLWV2ZW50PSdjaGFuZ2UnPlwiO2c+PWY7ZisrKXQueWVhcnNodG1sKz1cIjxvcHRpb24gdmFsdWU9J1wiK2YrXCInXCIrKGY9PT1pP1wiIHNlbGVjdGVkPSdzZWxlY3RlZCdcIjpcIlwiKStcIj5cIitmK1wiPC9vcHRpb24+XCI7dC55ZWFyc2h0bWwrPVwiPC9zZWxlY3Q+XCIsYis9dC55ZWFyc2h0bWwsdC55ZWFyc2h0bWw9bnVsbH1yZXR1cm4gYis9dGhpcy5fZ2V0KHQsXCJ5ZWFyU3VmZml4XCIpLHYmJihiKz0oIW8mJm0mJl8/XCJcIjpcIiYjeGEwO1wiKSt5KSxiKz1cIjwvZGl2PlwifSxfYWRqdXN0SW5zdERhdGU6ZnVuY3Rpb24odCxlLGkpe3ZhciBzPXQuc2VsZWN0ZWRZZWFyKyhcIllcIj09PWk/ZTowKSxuPXQuc2VsZWN0ZWRNb250aCsoXCJNXCI9PT1pP2U6MCksbz1NYXRoLm1pbih0LnNlbGVjdGVkRGF5LHRoaXMuX2dldERheXNJbk1vbnRoKHMsbikpKyhcIkRcIj09PWk/ZTowKSxhPXRoaXMuX3Jlc3RyaWN0TWluTWF4KHQsdGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUocyxuLG8pKSk7dC5zZWxlY3RlZERheT1hLmdldERhdGUoKSx0LmRyYXdNb250aD10LnNlbGVjdGVkTW9udGg9YS5nZXRNb250aCgpLHQuZHJhd1llYXI9dC5zZWxlY3RlZFllYXI9YS5nZXRGdWxsWWVhcigpLChcIk1cIj09PWl8fFwiWVwiPT09aSkmJnRoaXMuX25vdGlmeUNoYW5nZSh0KX0sX3Jlc3RyaWN0TWluTWF4OmZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZ2V0TWluTWF4RGF0ZSh0LFwibWluXCIpLHM9dGhpcy5fZ2V0TWluTWF4RGF0ZSh0LFwibWF4XCIpLG49aSYmaT5lP2k6ZTtyZXR1cm4gcyYmbj5zP3M6bn0sX25vdGlmeUNoYW5nZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLl9nZXQodCxcIm9uQ2hhbmdlTW9udGhZZWFyXCIpO2UmJmUuYXBwbHkodC5pbnB1dD90LmlucHV0WzBdOm51bGwsW3Quc2VsZWN0ZWRZZWFyLHQuc2VsZWN0ZWRNb250aCsxLHRdKX0sX2dldE51bWJlck9mTW9udGhzOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX2dldCh0LFwibnVtYmVyT2ZNb250aHNcIik7cmV0dXJuIG51bGw9PWU/WzEsMV06XCJudW1iZXJcIj09dHlwZW9mIGU/WzEsZV06ZX0sX2dldE1pbk1heERhdGU6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5fZGV0ZXJtaW5lRGF0ZSh0LHRoaXMuX2dldCh0LGUrXCJEYXRlXCIpLG51bGwpfSxfZ2V0RGF5c0luTW9udGg6ZnVuY3Rpb24odCxlKXtyZXR1cm4gMzItdGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodCxlLDMyKSkuZ2V0RGF0ZSgpfSxfZ2V0Rmlyc3REYXlPZk1vbnRoOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIG5ldyBEYXRlKHQsZSwxKS5nZXREYXkoKX0sX2NhbkFkanVzdE1vbnRoOmZ1bmN0aW9uKHQsZSxpLHMpe3ZhciBuPXRoaXMuX2dldE51bWJlck9mTW9udGhzKHQpLG89dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUoaSxzKygwPmU/ZTpuWzBdKm5bMV0pLDEpKTtyZXR1cm4gMD5lJiZvLnNldERhdGUodGhpcy5fZ2V0RGF5c0luTW9udGgoby5nZXRGdWxsWWVhcigpLG8uZ2V0TW9udGgoKSkpLHRoaXMuX2lzSW5SYW5nZSh0LG8pfSxfaXNJblJhbmdlOmZ1bmN0aW9uKHQsZSl7dmFyIGkscyxuPXRoaXMuX2dldE1pbk1heERhdGUodCxcIm1pblwiKSxvPXRoaXMuX2dldE1pbk1heERhdGUodCxcIm1heFwiKSxhPW51bGwscj1udWxsLGw9dGhpcy5fZ2V0KHQsXCJ5ZWFyUmFuZ2VcIik7cmV0dXJuIGwmJihpPWwuc3BsaXQoXCI6XCIpLHM9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLGE9cGFyc2VJbnQoaVswXSwxMCkscj1wYXJzZUludChpWzFdLDEwKSxpWzBdLm1hdGNoKC9bK1xcLV0uKi8pJiYoYSs9cyksaVsxXS5tYXRjaCgvWytcXC1dLiovKSYmKHIrPXMpKSwoIW58fGUuZ2V0VGltZSgpPj1uLmdldFRpbWUoKSkmJighb3x8ZS5nZXRUaW1lKCk8PW8uZ2V0VGltZSgpKSYmKCFhfHxlLmdldEZ1bGxZZWFyKCk+PWEpJiYoIXJ8fHI+PWUuZ2V0RnVsbFllYXIoKSl9LF9nZXRGb3JtYXRDb25maWc6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fZ2V0KHQsXCJzaG9ydFllYXJDdXRvZmZcIik7cmV0dXJuIGU9XCJzdHJpbmdcIiE9dHlwZW9mIGU/ZToobmV3IERhdGUpLmdldEZ1bGxZZWFyKCklMTAwK3BhcnNlSW50KGUsMTApLHtzaG9ydFllYXJDdXRvZmY6ZSxkYXlOYW1lc1Nob3J0OnRoaXMuX2dldCh0LFwiZGF5TmFtZXNTaG9ydFwiKSxkYXlOYW1lczp0aGlzLl9nZXQodCxcImRheU5hbWVzXCIpLG1vbnRoTmFtZXNTaG9ydDp0aGlzLl9nZXQodCxcIm1vbnRoTmFtZXNTaG9ydFwiKSxtb250aE5hbWVzOnRoaXMuX2dldCh0LFwibW9udGhOYW1lc1wiKX19LF9mb3JtYXREYXRlOmZ1bmN0aW9uKHQsZSxpLHMpe2V8fCh0LmN1cnJlbnREYXk9dC5zZWxlY3RlZERheSx0LmN1cnJlbnRNb250aD10LnNlbGVjdGVkTW9udGgsdC5jdXJyZW50WWVhcj10LnNlbGVjdGVkWWVhcik7dmFyIG49ZT9cIm9iamVjdFwiPT10eXBlb2YgZT9lOnRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKHMsaSxlKSk6dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodC5jdXJyZW50WWVhcix0LmN1cnJlbnRNb250aCx0LmN1cnJlbnREYXkpKTtyZXR1cm4gdGhpcy5mb3JtYXREYXRlKHRoaXMuX2dldCh0LFwiZGF0ZUZvcm1hdFwiKSxuLHRoaXMuX2dldEZvcm1hdENvbmZpZyh0KSl9fSksdC5mbi5kYXRlcGlja2VyPWZ1bmN0aW9uKGUpe2lmKCF0aGlzLmxlbmd0aClyZXR1cm4gdGhpczt0LmRhdGVwaWNrZXIuaW5pdGlhbGl6ZWR8fCh0KGRvY3VtZW50KS5vbihcIm1vdXNlZG93blwiLHQuZGF0ZXBpY2tlci5fY2hlY2tFeHRlcm5hbENsaWNrKSx0LmRhdGVwaWNrZXIuaW5pdGlhbGl6ZWQ9ITApLDA9PT10KFwiI1wiK3QuZGF0ZXBpY2tlci5fbWFpbkRpdklkKS5sZW5ndGgmJnQoXCJib2R5XCIpLmFwcGVuZCh0LmRhdGVwaWNrZXIuZHBEaXYpO3ZhciBpPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKTtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgZXx8XCJpc0Rpc2FibGVkXCIhPT1lJiZcImdldERhdGVcIiE9PWUmJlwid2lkZ2V0XCIhPT1lP1wib3B0aW9uXCI9PT1lJiYyPT09YXJndW1lbnRzLmxlbmd0aCYmXCJzdHJpbmdcIj09dHlwZW9mIGFyZ3VtZW50c1sxXT90LmRhdGVwaWNrZXJbXCJfXCIrZStcIkRhdGVwaWNrZXJcIl0uYXBwbHkodC5kYXRlcGlja2VyLFt0aGlzWzBdXS5jb25jYXQoaSkpOnRoaXMuZWFjaChmdW5jdGlvbigpe1wic3RyaW5nXCI9PXR5cGVvZiBlP3QuZGF0ZXBpY2tlcltcIl9cIitlK1wiRGF0ZXBpY2tlclwiXS5hcHBseSh0LmRhdGVwaWNrZXIsW3RoaXNdLmNvbmNhdChpKSk6dC5kYXRlcGlja2VyLl9hdHRhY2hEYXRlcGlja2VyKHRoaXMsZSl9KTp0LmRhdGVwaWNrZXJbXCJfXCIrZStcIkRhdGVwaWNrZXJcIl0uYXBwbHkodC5kYXRlcGlja2VyLFt0aGlzWzBdXS5jb25jYXQoaSkpfSx0LmRhdGVwaWNrZXI9bmV3IGksdC5kYXRlcGlja2VyLmluaXRpYWxpemVkPSExLHQuZGF0ZXBpY2tlci51dWlkPShuZXcgRGF0ZSkuZ2V0VGltZSgpLHQuZGF0ZXBpY2tlci52ZXJzaW9uPVwiMS4xMi4xXCIsdC5kYXRlcGlja2VyLHQudWkuaWU9ISEvbXNpZSBbXFx3Ll0rLy5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSk7dmFyIGg9ITE7dChkb2N1bWVudCkub24oXCJtb3VzZXVwXCIsZnVuY3Rpb24oKXtoPSExfSksdC53aWRnZXQoXCJ1aS5tb3VzZVwiLHt2ZXJzaW9uOlwiMS4xMi4xXCIsb3B0aW9uczp7Y2FuY2VsOlwiaW5wdXQsIHRleHRhcmVhLCBidXR0b24sIHNlbGVjdCwgb3B0aW9uXCIsZGlzdGFuY2U6MSxkZWxheTowfSxfbW91c2VJbml0OmZ1bmN0aW9uKCl7dmFyIGU9dGhpczt0aGlzLmVsZW1lbnQub24oXCJtb3VzZWRvd24uXCIrdGhpcy53aWRnZXROYW1lLGZ1bmN0aW9uKHQpe3JldHVybiBlLl9tb3VzZURvd24odCl9KS5vbihcImNsaWNrLlwiK3RoaXMud2lkZ2V0TmFtZSxmdW5jdGlvbihpKXtyZXR1cm4hMD09PXQuZGF0YShpLnRhcmdldCxlLndpZGdldE5hbWUrXCIucHJldmVudENsaWNrRXZlbnRcIik/KHQucmVtb3ZlRGF0YShpLnRhcmdldCxlLndpZGdldE5hbWUrXCIucHJldmVudENsaWNrRXZlbnRcIiksaS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSwhMSk6dm9pZCAwfSksdGhpcy5zdGFydGVkPSExfSxfbW91c2VEZXN0cm95OmZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50Lm9mZihcIi5cIit0aGlzLndpZGdldE5hbWUpLHRoaXMuX21vdXNlTW92ZURlbGVnYXRlJiZ0aGlzLmRvY3VtZW50Lm9mZihcIm1vdXNlbW92ZS5cIit0aGlzLndpZGdldE5hbWUsdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUpLm9mZihcIm1vdXNldXAuXCIrdGhpcy53aWRnZXROYW1lLHRoaXMuX21vdXNlVXBEZWxlZ2F0ZSl9LF9tb3VzZURvd246ZnVuY3Rpb24oZSl7aWYoIWgpe3RoaXMuX21vdXNlTW92ZWQ9ITEsdGhpcy5fbW91c2VTdGFydGVkJiZ0aGlzLl9tb3VzZVVwKGUpLHRoaXMuX21vdXNlRG93bkV2ZW50PWU7dmFyIGk9dGhpcyxzPTE9PT1lLndoaWNoLG49XCJzdHJpbmdcIj09dHlwZW9mIHRoaXMub3B0aW9ucy5jYW5jZWwmJmUudGFyZ2V0Lm5vZGVOYW1lP3QoZS50YXJnZXQpLmNsb3Nlc3QodGhpcy5vcHRpb25zLmNhbmNlbCkubGVuZ3RoOiExO3JldHVybiBzJiYhbiYmdGhpcy5fbW91c2VDYXB0dXJlKGUpPyh0aGlzLm1vdXNlRGVsYXlNZXQ9IXRoaXMub3B0aW9ucy5kZWxheSx0aGlzLm1vdXNlRGVsYXlNZXR8fCh0aGlzLl9tb3VzZURlbGF5VGltZXI9c2V0VGltZW91dChmdW5jdGlvbigpe2kubW91c2VEZWxheU1ldD0hMH0sdGhpcy5vcHRpb25zLmRlbGF5KSksdGhpcy5fbW91c2VEaXN0YW5jZU1ldChlKSYmdGhpcy5fbW91c2VEZWxheU1ldChlKSYmKHRoaXMuX21vdXNlU3RhcnRlZD10aGlzLl9tb3VzZVN0YXJ0KGUpIT09ITEsIXRoaXMuX21vdXNlU3RhcnRlZCk/KGUucHJldmVudERlZmF1bHQoKSwhMCk6KCEwPT09dC5kYXRhKGUudGFyZ2V0LHRoaXMud2lkZ2V0TmFtZStcIi5wcmV2ZW50Q2xpY2tFdmVudFwiKSYmdC5yZW1vdmVEYXRhKGUudGFyZ2V0LHRoaXMud2lkZ2V0TmFtZStcIi5wcmV2ZW50Q2xpY2tFdmVudFwiKSx0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZT1mdW5jdGlvbih0KXtyZXR1cm4gaS5fbW91c2VNb3ZlKHQpfSx0aGlzLl9tb3VzZVVwRGVsZWdhdGU9ZnVuY3Rpb24odCl7cmV0dXJuIGkuX21vdXNlVXAodCl9LHRoaXMuZG9jdW1lbnQub24oXCJtb3VzZW1vdmUuXCIrdGhpcy53aWRnZXROYW1lLHRoaXMuX21vdXNlTW92ZURlbGVnYXRlKS5vbihcIm1vdXNldXAuXCIrdGhpcy53aWRnZXROYW1lLHRoaXMuX21vdXNlVXBEZWxlZ2F0ZSksZS5wcmV2ZW50RGVmYXVsdCgpLGg9ITAsITApKTohMH19LF9tb3VzZU1vdmU6ZnVuY3Rpb24oZSl7aWYodGhpcy5fbW91c2VNb3ZlZCl7aWYodC51aS5pZSYmKCFkb2N1bWVudC5kb2N1bWVudE1vZGV8fDk+ZG9jdW1lbnQuZG9jdW1lbnRNb2RlKSYmIWUuYnV0dG9uKXJldHVybiB0aGlzLl9tb3VzZVVwKGUpO2lmKCFlLndoaWNoKWlmKGUub3JpZ2luYWxFdmVudC5hbHRLZXl8fGUub3JpZ2luYWxFdmVudC5jdHJsS2V5fHxlLm9yaWdpbmFsRXZlbnQubWV0YUtleXx8ZS5vcmlnaW5hbEV2ZW50LnNoaWZ0S2V5KXRoaXMuaWdub3JlTWlzc2luZ1doaWNoPSEwO2Vsc2UgaWYoIXRoaXMuaWdub3JlTWlzc2luZ1doaWNoKXJldHVybiB0aGlzLl9tb3VzZVVwKGUpfXJldHVybihlLndoaWNofHxlLmJ1dHRvbikmJih0aGlzLl9tb3VzZU1vdmVkPSEwKSx0aGlzLl9tb3VzZVN0YXJ0ZWQ/KHRoaXMuX21vdXNlRHJhZyhlKSxlLnByZXZlbnREZWZhdWx0KCkpOih0aGlzLl9tb3VzZURpc3RhbmNlTWV0KGUpJiZ0aGlzLl9tb3VzZURlbGF5TWV0KGUpJiYodGhpcy5fbW91c2VTdGFydGVkPXRoaXMuX21vdXNlU3RhcnQodGhpcy5fbW91c2VEb3duRXZlbnQsZSkhPT0hMSx0aGlzLl9tb3VzZVN0YXJ0ZWQ/dGhpcy5fbW91c2VEcmFnKGUpOnRoaXMuX21vdXNlVXAoZSkpLCF0aGlzLl9tb3VzZVN0YXJ0ZWQpfSxfbW91c2VVcDpmdW5jdGlvbihlKXt0aGlzLmRvY3VtZW50Lm9mZihcIm1vdXNlbW92ZS5cIit0aGlzLndpZGdldE5hbWUsdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUpLm9mZihcIm1vdXNldXAuXCIrdGhpcy53aWRnZXROYW1lLHRoaXMuX21vdXNlVXBEZWxlZ2F0ZSksdGhpcy5fbW91c2VTdGFydGVkJiYodGhpcy5fbW91c2VTdGFydGVkPSExLGUudGFyZ2V0PT09dGhpcy5fbW91c2VEb3duRXZlbnQudGFyZ2V0JiZ0LmRhdGEoZS50YXJnZXQsdGhpcy53aWRnZXROYW1lK1wiLnByZXZlbnRDbGlja0V2ZW50XCIsITApLHRoaXMuX21vdXNlU3RvcChlKSksdGhpcy5fbW91c2VEZWxheVRpbWVyJiYoY2xlYXJUaW1lb3V0KHRoaXMuX21vdXNlRGVsYXlUaW1lciksZGVsZXRlIHRoaXMuX21vdXNlRGVsYXlUaW1lciksdGhpcy5pZ25vcmVNaXNzaW5nV2hpY2g9ITEsaD0hMSxlLnByZXZlbnREZWZhdWx0KCl9LF9tb3VzZURpc3RhbmNlTWV0OmZ1bmN0aW9uKHQpe3JldHVybiBNYXRoLm1heChNYXRoLmFicyh0aGlzLl9tb3VzZURvd25FdmVudC5wYWdlWC10LnBhZ2VYKSxNYXRoLmFicyh0aGlzLl9tb3VzZURvd25FdmVudC5wYWdlWS10LnBhZ2VZKSk+PXRoaXMub3B0aW9ucy5kaXN0YW5jZX0sX21vdXNlRGVsYXlNZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5tb3VzZURlbGF5TWV0fSxfbW91c2VTdGFydDpmdW5jdGlvbigpe30sX21vdXNlRHJhZzpmdW5jdGlvbigpe30sX21vdXNlU3RvcDpmdW5jdGlvbigpe30sX21vdXNlQ2FwdHVyZTpmdW5jdGlvbigpe3JldHVybiEwfX0pLHQud2lkZ2V0KFwidWkuc2VsZWN0bWVudVwiLFt0LnVpLmZvcm1SZXNldE1peGluLHt2ZXJzaW9uOlwiMS4xMi4xXCIsZGVmYXVsdEVsZW1lbnQ6XCI8c2VsZWN0PlwiLG9wdGlvbnM6e2FwcGVuZFRvOm51bGwsY2xhc3Nlczp7XCJ1aS1zZWxlY3RtZW51LWJ1dHRvbi1vcGVuXCI6XCJ1aS1jb3JuZXItdG9wXCIsXCJ1aS1zZWxlY3RtZW51LWJ1dHRvbi1jbG9zZWRcIjpcInVpLWNvcm5lci1hbGxcIn0sZGlzYWJsZWQ6bnVsbCxpY29uczp7YnV0dG9uOlwidWktaWNvbi10cmlhbmdsZS0xLXNcIn0scG9zaXRpb246e215OlwibGVmdCB0b3BcIixhdDpcImxlZnQgYm90dG9tXCIsY29sbGlzaW9uOlwibm9uZVwifSx3aWR0aDohMSxjaGFuZ2U6bnVsbCxjbG9zZTpudWxsLGZvY3VzOm51bGwsb3BlbjpudWxsLHNlbGVjdDpudWxsfSxfY3JlYXRlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5lbGVtZW50LnVuaXF1ZUlkKCkuYXR0cihcImlkXCIpO3RoaXMuaWRzPXtlbGVtZW50OmUsYnV0dG9uOmUrXCItYnV0dG9uXCIsbWVudTplK1wiLW1lbnVcIn0sdGhpcy5fZHJhd0J1dHRvbigpLHRoaXMuX2RyYXdNZW51KCksdGhpcy5fYmluZEZvcm1SZXNldEhhbmRsZXIoKSx0aGlzLl9yZW5kZXJlZD0hMSx0aGlzLm1lbnVJdGVtcz10KCl9LF9kcmF3QnV0dG9uOmZ1bmN0aW9uKCl7dmFyIGUsaT10aGlzLHM9dGhpcy5fcGFyc2VPcHRpb24odGhpcy5lbGVtZW50LmZpbmQoXCJvcHRpb246c2VsZWN0ZWRcIiksdGhpcy5lbGVtZW50WzBdLnNlbGVjdGVkSW5kZXgpO3RoaXMubGFiZWxzPXRoaXMuZWxlbWVudC5sYWJlbHMoKS5hdHRyKFwiZm9yXCIsdGhpcy5pZHMuYnV0dG9uKSx0aGlzLl9vbih0aGlzLmxhYmVscyx7Y2xpY2s6ZnVuY3Rpb24odCl7dGhpcy5idXR0b24uZm9jdXMoKSx0LnByZXZlbnREZWZhdWx0KCl9fSksdGhpcy5lbGVtZW50LmhpZGUoKSx0aGlzLmJ1dHRvbj10KFwiPHNwYW4+XCIse3RhYmluZGV4OnRoaXMub3B0aW9ucy5kaXNhYmxlZD8tMTowLGlkOnRoaXMuaWRzLmJ1dHRvbixyb2xlOlwiY29tYm9ib3hcIixcImFyaWEtZXhwYW5kZWRcIjpcImZhbHNlXCIsXCJhcmlhLWF1dG9jb21wbGV0ZVwiOlwibGlzdFwiLFwiYXJpYS1vd25zXCI6dGhpcy5pZHMubWVudSxcImFyaWEtaGFzcG9wdXBcIjpcInRydWVcIix0aXRsZTp0aGlzLmVsZW1lbnQuYXR0cihcInRpdGxlXCIpfSkuaW5zZXJ0QWZ0ZXIodGhpcy5lbGVtZW50KSx0aGlzLl9hZGRDbGFzcyh0aGlzLmJ1dHRvbixcInVpLXNlbGVjdG1lbnUtYnV0dG9uIHVpLXNlbGVjdG1lbnUtYnV0dG9uLWNsb3NlZFwiLFwidWktYnV0dG9uIHVpLXdpZGdldFwiKSxlPXQoXCI8c3Bhbj5cIikuYXBwZW5kVG8odGhpcy5idXR0b24pLHRoaXMuX2FkZENsYXNzKGUsXCJ1aS1zZWxlY3RtZW51LWljb25cIixcInVpLWljb24gXCIrdGhpcy5vcHRpb25zLmljb25zLmJ1dHRvbiksdGhpcy5idXR0b25JdGVtPXRoaXMuX3JlbmRlckJ1dHRvbkl0ZW0ocykuYXBwZW5kVG8odGhpcy5idXR0b24pLHRoaXMub3B0aW9ucy53aWR0aCE9PSExJiZ0aGlzLl9yZXNpemVCdXR0b24oKSx0aGlzLl9vbih0aGlzLmJ1dHRvbix0aGlzLl9idXR0b25FdmVudHMpLHRoaXMuYnV0dG9uLm9uZShcImZvY3VzaW5cIixmdW5jdGlvbigpe2kuX3JlbmRlcmVkfHxpLl9yZWZyZXNoTWVudSgpfSl9LF9kcmF3TWVudTpmdW5jdGlvbigpe3ZhciBlPXRoaXM7dGhpcy5tZW51PXQoXCI8dWw+XCIse1wiYXJpYS1oaWRkZW5cIjpcInRydWVcIixcImFyaWEtbGFiZWxsZWRieVwiOnRoaXMuaWRzLmJ1dHRvbixpZDp0aGlzLmlkcy5tZW51fSksdGhpcy5tZW51V3JhcD10KFwiPGRpdj5cIikuYXBwZW5kKHRoaXMubWVudSksdGhpcy5fYWRkQ2xhc3ModGhpcy5tZW51V3JhcCxcInVpLXNlbGVjdG1lbnUtbWVudVwiLFwidWktZnJvbnRcIiksdGhpcy5tZW51V3JhcC5hcHBlbmRUbyh0aGlzLl9hcHBlbmRUbygpKSx0aGlzLm1lbnVJbnN0YW5jZT10aGlzLm1lbnUubWVudSh7Y2xhc3Nlczp7XCJ1aS1tZW51XCI6XCJ1aS1jb3JuZXItYm90dG9tXCJ9LHJvbGU6XCJsaXN0Ym94XCIsc2VsZWN0OmZ1bmN0aW9uKHQsaSl7dC5wcmV2ZW50RGVmYXVsdCgpLGUuX3NldFNlbGVjdGlvbigpLGUuX3NlbGVjdChpLml0ZW0uZGF0YShcInVpLXNlbGVjdG1lbnUtaXRlbVwiKSx0KX0sZm9jdXM6ZnVuY3Rpb24odCxpKXt2YXIgcz1pLml0ZW0uZGF0YShcInVpLXNlbGVjdG1lbnUtaXRlbVwiKTtudWxsIT1lLmZvY3VzSW5kZXgmJnMuaW5kZXghPT1lLmZvY3VzSW5kZXgmJihlLl90cmlnZ2VyKFwiZm9jdXNcIix0LHtpdGVtOnN9KSxlLmlzT3Blbnx8ZS5fc2VsZWN0KHMsdCkpLGUuZm9jdXNJbmRleD1zLmluZGV4LGUuYnV0dG9uLmF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIixlLm1lbnVJdGVtcy5lcShzLmluZGV4KS5hdHRyKFwiaWRcIikpfX0pLm1lbnUoXCJpbnN0YW5jZVwiKSx0aGlzLm1lbnVJbnN0YW5jZS5fb2ZmKHRoaXMubWVudSxcIm1vdXNlbGVhdmVcIiksdGhpcy5tZW51SW5zdGFuY2UuX2Nsb3NlT25Eb2N1bWVudENsaWNrPWZ1bmN0aW9uKCl7cmV0dXJuITF9LHRoaXMubWVudUluc3RhbmNlLl9pc0RpdmlkZXI9ZnVuY3Rpb24oKXtyZXR1cm4hMX19LHJlZnJlc2g6ZnVuY3Rpb24oKXt0aGlzLl9yZWZyZXNoTWVudSgpLHRoaXMuYnV0dG9uSXRlbS5yZXBsYWNlV2l0aCh0aGlzLmJ1dHRvbkl0ZW09dGhpcy5fcmVuZGVyQnV0dG9uSXRlbSh0aGlzLl9nZXRTZWxlY3RlZEl0ZW0oKS5kYXRhKFwidWktc2VsZWN0bWVudS1pdGVtXCIpfHx7fSkpLG51bGw9PT10aGlzLm9wdGlvbnMud2lkdGgmJnRoaXMuX3Jlc2l6ZUJ1dHRvbigpfSxfcmVmcmVzaE1lbnU6ZnVuY3Rpb24oKXt2YXIgdCxlPXRoaXMuZWxlbWVudC5maW5kKFwib3B0aW9uXCIpO3RoaXMubWVudS5lbXB0eSgpLHRoaXMuX3BhcnNlT3B0aW9ucyhlKSx0aGlzLl9yZW5kZXJNZW51KHRoaXMubWVudSx0aGlzLml0ZW1zKSx0aGlzLm1lbnVJbnN0YW5jZS5yZWZyZXNoKCksdGhpcy5tZW51SXRlbXM9dGhpcy5tZW51LmZpbmQoXCJsaVwiKS5ub3QoXCIudWktc2VsZWN0bWVudS1vcHRncm91cFwiKS5maW5kKFwiLnVpLW1lbnUtaXRlbS13cmFwcGVyXCIpLHRoaXMuX3JlbmRlcmVkPSEwLGUubGVuZ3RoJiYodD10aGlzLl9nZXRTZWxlY3RlZEl0ZW0oKSx0aGlzLm1lbnVJbnN0YW5jZS5mb2N1cyhudWxsLHQpLHRoaXMuX3NldEFyaWEodC5kYXRhKFwidWktc2VsZWN0bWVudS1pdGVtXCIpKSx0aGlzLl9zZXRPcHRpb24oXCJkaXNhYmxlZFwiLHRoaXMuZWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIikpKX0sb3BlbjpmdW5jdGlvbih0KXt0aGlzLm9wdGlvbnMuZGlzYWJsZWR8fCh0aGlzLl9yZW5kZXJlZD8odGhpcy5fcmVtb3ZlQ2xhc3ModGhpcy5tZW51LmZpbmQoXCIudWktc3RhdGUtYWN0aXZlXCIpLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksdGhpcy5tZW51SW5zdGFuY2UuZm9jdXMobnVsbCx0aGlzLl9nZXRTZWxlY3RlZEl0ZW0oKSkpOnRoaXMuX3JlZnJlc2hNZW51KCksdGhpcy5tZW51SXRlbXMubGVuZ3RoJiYodGhpcy5pc09wZW49ITAsdGhpcy5fdG9nZ2xlQXR0cigpLHRoaXMuX3Jlc2l6ZU1lbnUoKSx0aGlzLl9wb3NpdGlvbigpLHRoaXMuX29uKHRoaXMuZG9jdW1lbnQsdGhpcy5fZG9jdW1lbnRDbGljayksdGhpcy5fdHJpZ2dlcihcIm9wZW5cIix0KSkpfSxfcG9zaXRpb246ZnVuY3Rpb24oKXt0aGlzLm1lbnVXcmFwLnBvc2l0aW9uKHQuZXh0ZW5kKHtvZjp0aGlzLmJ1dHRvbn0sdGhpcy5vcHRpb25zLnBvc2l0aW9uKSl9LGNsb3NlOmZ1bmN0aW9uKHQpe3RoaXMuaXNPcGVuJiYodGhpcy5pc09wZW49ITEsdGhpcy5fdG9nZ2xlQXR0cigpLHRoaXMucmFuZ2U9bnVsbCx0aGlzLl9vZmYodGhpcy5kb2N1bWVudCksdGhpcy5fdHJpZ2dlcihcImNsb3NlXCIsdCkpfSx3aWRnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5idXR0b259LG1lbnVXaWRnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5tZW51fSxfcmVuZGVyQnV0dG9uSXRlbTpmdW5jdGlvbihlKXt2YXIgaT10KFwiPHNwYW4+XCIpO3JldHVybiB0aGlzLl9zZXRUZXh0KGksZS5sYWJlbCksdGhpcy5fYWRkQ2xhc3MoaSxcInVpLXNlbGVjdG1lbnUtdGV4dFwiKSxpfSxfcmVuZGVyTWVudTpmdW5jdGlvbihlLGkpe3ZhciBzPXRoaXMsbj1cIlwiO3QuZWFjaChpLGZ1bmN0aW9uKGksbyl7dmFyIGE7by5vcHRncm91cCE9PW4mJihhPXQoXCI8bGk+XCIse3RleHQ6by5vcHRncm91cH0pLHMuX2FkZENsYXNzKGEsXCJ1aS1zZWxlY3RtZW51LW9wdGdyb3VwXCIsXCJ1aS1tZW51LWRpdmlkZXJcIisoby5lbGVtZW50LnBhcmVudChcIm9wdGdyb3VwXCIpLnByb3AoXCJkaXNhYmxlZFwiKT9cIiB1aS1zdGF0ZS1kaXNhYmxlZFwiOlwiXCIpKSxhLmFwcGVuZFRvKGUpLG49by5vcHRncm91cCkscy5fcmVuZGVySXRlbURhdGEoZSxvKX0pfSxfcmVuZGVySXRlbURhdGE6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5fcmVuZGVySXRlbSh0LGUpLmRhdGEoXCJ1aS1zZWxlY3RtZW51LWl0ZW1cIixlKX0sX3JlbmRlckl0ZW06ZnVuY3Rpb24oZSxpKXt2YXIgcz10KFwiPGxpPlwiKSxuPXQoXCI8ZGl2PlwiLHt0aXRsZTppLmVsZW1lbnQuYXR0cihcInRpdGxlXCIpfSk7cmV0dXJuIGkuZGlzYWJsZWQmJnRoaXMuX2FkZENsYXNzKHMsbnVsbCxcInVpLXN0YXRlLWRpc2FibGVkXCIpLHRoaXMuX3NldFRleHQobixpLmxhYmVsKSxzLmFwcGVuZChuKS5hcHBlbmRUbyhlKX0sX3NldFRleHQ6ZnVuY3Rpb24odCxlKXtlP3QudGV4dChlKTp0Lmh0bWwoXCImIzE2MDtcIil9LF9tb3ZlOmZ1bmN0aW9uKHQsZSl7dmFyIGkscyxuPVwiLnVpLW1lbnUtaXRlbVwiO3RoaXMuaXNPcGVuP2k9dGhpcy5tZW51SXRlbXMuZXEodGhpcy5mb2N1c0luZGV4KS5wYXJlbnQoXCJsaVwiKTooaT10aGlzLm1lbnVJdGVtcy5lcSh0aGlzLmVsZW1lbnRbMF0uc2VsZWN0ZWRJbmRleCkucGFyZW50KFwibGlcIiksbis9XCI6bm90KC51aS1zdGF0ZS1kaXNhYmxlZClcIikscz1cImZpcnN0XCI9PT10fHxcImxhc3RcIj09PXQ/aVtcImZpcnN0XCI9PT10P1wicHJldkFsbFwiOlwibmV4dEFsbFwiXShuKS5lcSgtMSk6aVt0K1wiQWxsXCJdKG4pLmVxKDApLHMubGVuZ3RoJiZ0aGlzLm1lbnVJbnN0YW5jZS5mb2N1cyhlLHMpfSxfZ2V0U2VsZWN0ZWRJdGVtOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubWVudUl0ZW1zLmVxKHRoaXMuZWxlbWVudFswXS5zZWxlY3RlZEluZGV4KS5wYXJlbnQoXCJsaVwiKX0sX3RvZ2dsZTpmdW5jdGlvbih0KXt0aGlzW3RoaXMuaXNPcGVuP1wiY2xvc2VcIjpcIm9wZW5cIl0odCl9LF9zZXRTZWxlY3Rpb246ZnVuY3Rpb24oKXt2YXIgdDt0aGlzLnJhbmdlJiYod2luZG93LmdldFNlbGVjdGlvbj8odD13aW5kb3cuZ2V0U2VsZWN0aW9uKCksdC5yZW1vdmVBbGxSYW5nZXMoKSx0LmFkZFJhbmdlKHRoaXMucmFuZ2UpKTp0aGlzLnJhbmdlLnNlbGVjdCgpLHRoaXMuYnV0dG9uLmZvY3VzKCkpfSxfZG9jdW1lbnRDbGljazp7bW91c2Vkb3duOmZ1bmN0aW9uKGUpe3RoaXMuaXNPcGVuJiYodChlLnRhcmdldCkuY2xvc2VzdChcIi51aS1zZWxlY3RtZW51LW1lbnUsICNcIit0LnVpLmVzY2FwZVNlbGVjdG9yKHRoaXMuaWRzLmJ1dHRvbikpLmxlbmd0aHx8dGhpcy5jbG9zZShlKSl9fSxfYnV0dG9uRXZlbnRzOnttb3VzZWRvd246ZnVuY3Rpb24oKXt2YXIgdDt3aW5kb3cuZ2V0U2VsZWN0aW9uPyh0PXdpbmRvdy5nZXRTZWxlY3Rpb24oKSx0LnJhbmdlQ291bnQmJih0aGlzLnJhbmdlPXQuZ2V0UmFuZ2VBdCgwKSkpOnRoaXMucmFuZ2U9ZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCl9LGNsaWNrOmZ1bmN0aW9uKHQpe3RoaXMuX3NldFNlbGVjdGlvbigpLHRoaXMuX3RvZ2dsZSh0KX0sa2V5ZG93bjpmdW5jdGlvbihlKXt2YXIgaT0hMDtzd2l0Y2goZS5rZXlDb2RlKXtjYXNlIHQudWkua2V5Q29kZS5UQUI6Y2FzZSB0LnVpLmtleUNvZGUuRVNDQVBFOnRoaXMuY2xvc2UoZSksaT0hMTticmVhaztjYXNlIHQudWkua2V5Q29kZS5FTlRFUjp0aGlzLmlzT3BlbiYmdGhpcy5fc2VsZWN0Rm9jdXNlZEl0ZW0oZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuVVA6ZS5hbHRLZXk/dGhpcy5fdG9nZ2xlKGUpOnRoaXMuX21vdmUoXCJwcmV2XCIsZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRE9XTjplLmFsdEtleT90aGlzLl90b2dnbGUoZSk6dGhpcy5fbW92ZShcIm5leHRcIixlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5TUEFDRTp0aGlzLmlzT3Blbj90aGlzLl9zZWxlY3RGb2N1c2VkSXRlbShlKTp0aGlzLl90b2dnbGUoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuTEVGVDp0aGlzLl9tb3ZlKFwicHJldlwiLGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlJJR0hUOnRoaXMuX21vdmUoXCJuZXh0XCIsZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuSE9NRTpjYXNlIHQudWkua2V5Q29kZS5QQUdFX1VQOnRoaXMuX21vdmUoXCJmaXJzdFwiLGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkVORDpjYXNlIHQudWkua2V5Q29kZS5QQUdFX0RPV046dGhpcy5fbW92ZShcImxhc3RcIixlKTticmVhaztkZWZhdWx0OnRoaXMubWVudS50cmlnZ2VyKGUpLGk9ITF9aSYmZS5wcmV2ZW50RGVmYXVsdCgpfX0sX3NlbGVjdEZvY3VzZWRJdGVtOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMubWVudUl0ZW1zLmVxKHRoaXMuZm9jdXNJbmRleCkucGFyZW50KFwibGlcIik7ZS5oYXNDbGFzcyhcInVpLXN0YXRlLWRpc2FibGVkXCIpfHx0aGlzLl9zZWxlY3QoZS5kYXRhKFwidWktc2VsZWN0bWVudS1pdGVtXCIpLHQpfSxfc2VsZWN0OmZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5lbGVtZW50WzBdLnNlbGVjdGVkSW5kZXg7dGhpcy5lbGVtZW50WzBdLnNlbGVjdGVkSW5kZXg9dC5pbmRleCx0aGlzLmJ1dHRvbkl0ZW0ucmVwbGFjZVdpdGgodGhpcy5idXR0b25JdGVtPXRoaXMuX3JlbmRlckJ1dHRvbkl0ZW0odCkpLHRoaXMuX3NldEFyaWEodCksdGhpcy5fdHJpZ2dlcihcInNlbGVjdFwiLGUse2l0ZW06dH0pLHQuaW5kZXghPT1pJiZ0aGlzLl90cmlnZ2VyKFwiY2hhbmdlXCIsZSx7aXRlbTp0fSksdGhpcy5jbG9zZShlKX0sX3NldEFyaWE6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5tZW51SXRlbXMuZXEodC5pbmRleCkuYXR0cihcImlkXCIpO3RoaXMuYnV0dG9uLmF0dHIoe1wiYXJpYS1sYWJlbGxlZGJ5XCI6ZSxcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiOmV9KSx0aGlzLm1lbnUuYXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiLGUpfSxfc2V0T3B0aW9uOmZ1bmN0aW9uKHQsZSl7aWYoXCJpY29uc1wiPT09dCl7dmFyIGk9dGhpcy5idXR0b24uZmluZChcInNwYW4udWktaWNvblwiKTt0aGlzLl9yZW1vdmVDbGFzcyhpLG51bGwsdGhpcy5vcHRpb25zLmljb25zLmJ1dHRvbikuX2FkZENsYXNzKGksbnVsbCxlLmJ1dHRvbil9dGhpcy5fc3VwZXIodCxlKSxcImFwcGVuZFRvXCI9PT10JiZ0aGlzLm1lbnVXcmFwLmFwcGVuZFRvKHRoaXMuX2FwcGVuZFRvKCkpLFwid2lkdGhcIj09PXQmJnRoaXMuX3Jlc2l6ZUJ1dHRvbigpfSxfc2V0T3B0aW9uRGlzYWJsZWQ6ZnVuY3Rpb24odCl7dGhpcy5fc3VwZXIodCksdGhpcy5tZW51SW5zdGFuY2Uub3B0aW9uKFwiZGlzYWJsZWRcIix0KSx0aGlzLmJ1dHRvbi5hdHRyKFwiYXJpYS1kaXNhYmxlZFwiLHQpLHRoaXMuX3RvZ2dsZUNsYXNzKHRoaXMuYnV0dG9uLG51bGwsXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiLHQpLHRoaXMuZWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIix0KSx0Pyh0aGlzLmJ1dHRvbi5hdHRyKFwidGFiaW5kZXhcIiwtMSksdGhpcy5jbG9zZSgpKTp0aGlzLmJ1dHRvbi5hdHRyKFwidGFiaW5kZXhcIiwwKX0sX2FwcGVuZFRvOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5vcHRpb25zLmFwcGVuZFRvO3JldHVybiBlJiYoZT1lLmpxdWVyeXx8ZS5ub2RlVHlwZT90KGUpOnRoaXMuZG9jdW1lbnQuZmluZChlKS5lcSgwKSksZSYmZVswXXx8KGU9dGhpcy5lbGVtZW50LmNsb3Nlc3QoXCIudWktZnJvbnQsIGRpYWxvZ1wiKSksZS5sZW5ndGh8fChlPXRoaXMuZG9jdW1lbnRbMF0uYm9keSksZX0sX3RvZ2dsZUF0dHI6ZnVuY3Rpb24oKXt0aGlzLmJ1dHRvbi5hdHRyKFwiYXJpYS1leHBhbmRlZFwiLHRoaXMuaXNPcGVuKSx0aGlzLl9yZW1vdmVDbGFzcyh0aGlzLmJ1dHRvbixcInVpLXNlbGVjdG1lbnUtYnV0dG9uLVwiKyh0aGlzLmlzT3Blbj9cImNsb3NlZFwiOlwib3BlblwiKSkuX2FkZENsYXNzKHRoaXMuYnV0dG9uLFwidWktc2VsZWN0bWVudS1idXR0b24tXCIrKHRoaXMuaXNPcGVuP1wib3BlblwiOlwiY2xvc2VkXCIpKS5fdG9nZ2xlQ2xhc3ModGhpcy5tZW51V3JhcCxcInVpLXNlbGVjdG1lbnUtb3BlblwiLG51bGwsdGhpcy5pc09wZW4pLHRoaXMubWVudS5hdHRyKFwiYXJpYS1oaWRkZW5cIiwhdGhpcy5pc09wZW4pfSxfcmVzaXplQnV0dG9uOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLndpZHRoO3JldHVybiB0PT09ITE/KHRoaXMuYnV0dG9uLmNzcyhcIndpZHRoXCIsXCJcIiksdm9pZCAwKToobnVsbD09PXQmJih0PXRoaXMuZWxlbWVudC5zaG93KCkub3V0ZXJXaWR0aCgpLHRoaXMuZWxlbWVudC5oaWRlKCkpLHRoaXMuYnV0dG9uLm91dGVyV2lkdGgodCksdm9pZCAwKX0sX3Jlc2l6ZU1lbnU6ZnVuY3Rpb24oKXt0aGlzLm1lbnUub3V0ZXJXaWR0aChNYXRoLm1heCh0aGlzLmJ1dHRvbi5vdXRlcldpZHRoKCksdGhpcy5tZW51LndpZHRoKFwiXCIpLm91dGVyV2lkdGgoKSsxKSl9LF9nZXRDcmVhdGVPcHRpb25zOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fc3VwZXIoKTtyZXR1cm4gdC5kaXNhYmxlZD10aGlzLmVsZW1lbnQucHJvcChcImRpc2FibGVkXCIpLHR9LF9wYXJzZU9wdGlvbnM6ZnVuY3Rpb24oZSl7dmFyIGk9dGhpcyxzPVtdO2UuZWFjaChmdW5jdGlvbihlLG4pe3MucHVzaChpLl9wYXJzZU9wdGlvbih0KG4pLGUpKX0pLHRoaXMuaXRlbXM9c30sX3BhcnNlT3B0aW9uOmZ1bmN0aW9uKHQsZSl7dmFyIGk9dC5wYXJlbnQoXCJvcHRncm91cFwiKTtyZXR1cm57ZWxlbWVudDp0LGluZGV4OmUsdmFsdWU6dC52YWwoKSxsYWJlbDp0LnRleHQoKSxvcHRncm91cDppLmF0dHIoXCJsYWJlbFwiKXx8XCJcIixkaXNhYmxlZDppLnByb3AoXCJkaXNhYmxlZFwiKXx8dC5wcm9wKFwiZGlzYWJsZWRcIil9fSxfZGVzdHJveTpmdW5jdGlvbigpe3RoaXMuX3VuYmluZEZvcm1SZXNldEhhbmRsZXIoKSx0aGlzLm1lbnVXcmFwLnJlbW92ZSgpLHRoaXMuYnV0dG9uLnJlbW92ZSgpLHRoaXMuZWxlbWVudC5zaG93KCksdGhpcy5lbGVtZW50LnJlbW92ZVVuaXF1ZUlkKCksdGhpcy5sYWJlbHMuYXR0cihcImZvclwiLHRoaXMuaWRzLmVsZW1lbnQpfX1dKSx0LndpZGdldChcInVpLnNsaWRlclwiLHQudWkubW91c2Use3ZlcnNpb246XCIxLjEyLjFcIix3aWRnZXRFdmVudFByZWZpeDpcInNsaWRlXCIsb3B0aW9uczp7YW5pbWF0ZTohMSxjbGFzc2VzOntcInVpLXNsaWRlclwiOlwidWktY29ybmVyLWFsbFwiLFwidWktc2xpZGVyLWhhbmRsZVwiOlwidWktY29ybmVyLWFsbFwiLFwidWktc2xpZGVyLXJhbmdlXCI6XCJ1aS1jb3JuZXItYWxsIHVpLXdpZGdldC1oZWFkZXJcIn0sZGlzdGFuY2U6MCxtYXg6MTAwLG1pbjowLG9yaWVudGF0aW9uOlwiaG9yaXpvbnRhbFwiLHJhbmdlOiExLHN0ZXA6MSx2YWx1ZTowLHZhbHVlczpudWxsLGNoYW5nZTpudWxsLHNsaWRlOm51bGwsc3RhcnQ6bnVsbCxzdG9wOm51bGx9LG51bVBhZ2VzOjUsX2NyZWF0ZTpmdW5jdGlvbigpe3RoaXMuX2tleVNsaWRpbmc9ITEsdGhpcy5fbW91c2VTbGlkaW5nPSExLHRoaXMuX2FuaW1hdGVPZmY9ITAsdGhpcy5faGFuZGxlSW5kZXg9bnVsbCx0aGlzLl9kZXRlY3RPcmllbnRhdGlvbigpLHRoaXMuX21vdXNlSW5pdCgpLHRoaXMuX2NhbGN1bGF0ZU5ld01heCgpLHRoaXMuX2FkZENsYXNzKFwidWktc2xpZGVyIHVpLXNsaWRlci1cIit0aGlzLm9yaWVudGF0aW9uLFwidWktd2lkZ2V0IHVpLXdpZGdldC1jb250ZW50XCIpLHRoaXMuX3JlZnJlc2goKSx0aGlzLl9hbmltYXRlT2ZmPSExfSxfcmVmcmVzaDpmdW5jdGlvbigpe3RoaXMuX2NyZWF0ZVJhbmdlKCksdGhpcy5fY3JlYXRlSGFuZGxlcygpLHRoaXMuX3NldHVwRXZlbnRzKCksdGhpcy5fcmVmcmVzaFZhbHVlKCl9LF9jcmVhdGVIYW5kbGVzOmZ1bmN0aW9uKCl7dmFyIGUsaSxzPXRoaXMub3B0aW9ucyxuPXRoaXMuZWxlbWVudC5maW5kKFwiLnVpLXNsaWRlci1oYW5kbGVcIiksbz1cIjxzcGFuIHRhYmluZGV4PScwJz48L3NwYW4+XCIsYT1bXTtmb3IoaT1zLnZhbHVlcyYmcy52YWx1ZXMubGVuZ3RofHwxLG4ubGVuZ3RoPmkmJihuLnNsaWNlKGkpLnJlbW92ZSgpLG49bi5zbGljZSgwLGkpKSxlPW4ubGVuZ3RoO2k+ZTtlKyspYS5wdXNoKG8pO3RoaXMuaGFuZGxlcz1uLmFkZCh0KGEuam9pbihcIlwiKSkuYXBwZW5kVG8odGhpcy5lbGVtZW50KSksdGhpcy5fYWRkQ2xhc3ModGhpcy5oYW5kbGVzLFwidWktc2xpZGVyLWhhbmRsZVwiLFwidWktc3RhdGUtZGVmYXVsdFwiKSx0aGlzLmhhbmRsZT10aGlzLmhhbmRsZXMuZXEoMCksdGhpcy5oYW5kbGVzLmVhY2goZnVuY3Rpb24oZSl7dCh0aGlzKS5kYXRhKFwidWktc2xpZGVyLWhhbmRsZS1pbmRleFwiLGUpLmF0dHIoXCJ0YWJJbmRleFwiLDApfSl9LF9jcmVhdGVSYW5nZTpmdW5jdGlvbigpe3ZhciBlPXRoaXMub3B0aW9ucztlLnJhbmdlPyhlLnJhbmdlPT09ITAmJihlLnZhbHVlcz9lLnZhbHVlcy5sZW5ndGgmJjIhPT1lLnZhbHVlcy5sZW5ndGg/ZS52YWx1ZXM9W2UudmFsdWVzWzBdLGUudmFsdWVzWzBdXTp0LmlzQXJyYXkoZS52YWx1ZXMpJiYoZS52YWx1ZXM9ZS52YWx1ZXMuc2xpY2UoMCkpOmUudmFsdWVzPVt0aGlzLl92YWx1ZU1pbigpLHRoaXMuX3ZhbHVlTWluKCldKSx0aGlzLnJhbmdlJiZ0aGlzLnJhbmdlLmxlbmd0aD8odGhpcy5fcmVtb3ZlQ2xhc3ModGhpcy5yYW5nZSxcInVpLXNsaWRlci1yYW5nZS1taW4gdWktc2xpZGVyLXJhbmdlLW1heFwiKSx0aGlzLnJhbmdlLmNzcyh7bGVmdDpcIlwiLGJvdHRvbTpcIlwifSkpOih0aGlzLnJhbmdlPXQoXCI8ZGl2PlwiKS5hcHBlbmRUbyh0aGlzLmVsZW1lbnQpLHRoaXMuX2FkZENsYXNzKHRoaXMucmFuZ2UsXCJ1aS1zbGlkZXItcmFuZ2VcIikpLChcIm1pblwiPT09ZS5yYW5nZXx8XCJtYXhcIj09PWUucmFuZ2UpJiZ0aGlzLl9hZGRDbGFzcyh0aGlzLnJhbmdlLFwidWktc2xpZGVyLXJhbmdlLVwiK2UucmFuZ2UpKToodGhpcy5yYW5nZSYmdGhpcy5yYW5nZS5yZW1vdmUoKSx0aGlzLnJhbmdlPW51bGwpfSxfc2V0dXBFdmVudHM6ZnVuY3Rpb24oKXt0aGlzLl9vZmYodGhpcy5oYW5kbGVzKSx0aGlzLl9vbih0aGlzLmhhbmRsZXMsdGhpcy5faGFuZGxlRXZlbnRzKSx0aGlzLl9ob3ZlcmFibGUodGhpcy5oYW5kbGVzKSx0aGlzLl9mb2N1c2FibGUodGhpcy5oYW5kbGVzKX0sX2Rlc3Ryb3k6ZnVuY3Rpb24oKXt0aGlzLmhhbmRsZXMucmVtb3ZlKCksdGhpcy5yYW5nZSYmdGhpcy5yYW5nZS5yZW1vdmUoKSx0aGlzLl9tb3VzZURlc3Ryb3koKX0sX21vdXNlQ2FwdHVyZTpmdW5jdGlvbihlKXt2YXIgaSxzLG4sbyxhLHIsbCxoLGM9dGhpcyx1PXRoaXMub3B0aW9ucztyZXR1cm4gdS5kaXNhYmxlZD8hMToodGhpcy5lbGVtZW50U2l6ZT17d2lkdGg6dGhpcy5lbGVtZW50Lm91dGVyV2lkdGgoKSxoZWlnaHQ6dGhpcy5lbGVtZW50Lm91dGVySGVpZ2h0KCl9LHRoaXMuZWxlbWVudE9mZnNldD10aGlzLmVsZW1lbnQub2Zmc2V0KCksaT17eDplLnBhZ2VYLHk6ZS5wYWdlWX0scz10aGlzLl9ub3JtVmFsdWVGcm9tTW91c2UoaSksbj10aGlzLl92YWx1ZU1heCgpLXRoaXMuX3ZhbHVlTWluKCkrMSx0aGlzLmhhbmRsZXMuZWFjaChmdW5jdGlvbihlKXt2YXIgaT1NYXRoLmFicyhzLWMudmFsdWVzKGUpKTsobj5pfHxuPT09aSYmKGU9PT1jLl9sYXN0Q2hhbmdlZFZhbHVlfHxjLnZhbHVlcyhlKT09PXUubWluKSkmJihuPWksbz10KHRoaXMpLGE9ZSl9KSxyPXRoaXMuX3N0YXJ0KGUsYSkscj09PSExPyExOih0aGlzLl9tb3VzZVNsaWRpbmc9ITAsdGhpcy5faGFuZGxlSW5kZXg9YSx0aGlzLl9hZGRDbGFzcyhvLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksby50cmlnZ2VyKFwiZm9jdXNcIiksbD1vLm9mZnNldCgpLGg9IXQoZS50YXJnZXQpLnBhcmVudHMoKS5hZGRCYWNrKCkuaXMoXCIudWktc2xpZGVyLWhhbmRsZVwiKSx0aGlzLl9jbGlja09mZnNldD1oP3tsZWZ0OjAsdG9wOjB9OntsZWZ0OmUucGFnZVgtbC5sZWZ0LW8ud2lkdGgoKS8yLHRvcDplLnBhZ2VZLWwudG9wLW8uaGVpZ2h0KCkvMi0ocGFyc2VJbnQoby5jc3MoXCJib3JkZXJUb3BXaWR0aFwiKSwxMCl8fDApLShwYXJzZUludChvLmNzcyhcImJvcmRlckJvdHRvbVdpZHRoXCIpLDEwKXx8MCkrKHBhcnNlSW50KG8uY3NzKFwibWFyZ2luVG9wXCIpLDEwKXx8MCl9LHRoaXMuaGFuZGxlcy5oYXNDbGFzcyhcInVpLXN0YXRlLWhvdmVyXCIpfHx0aGlzLl9zbGlkZShlLGEscyksdGhpcy5fYW5pbWF0ZU9mZj0hMCwhMCkpfSxfbW91c2VTdGFydDpmdW5jdGlvbigpe3JldHVybiEwfSxfbW91c2VEcmFnOmZ1bmN0aW9uKHQpe3ZhciBlPXt4OnQucGFnZVgseTp0LnBhZ2VZfSxpPXRoaXMuX25vcm1WYWx1ZUZyb21Nb3VzZShlKTtyZXR1cm4gdGhpcy5fc2xpZGUodCx0aGlzLl9oYW5kbGVJbmRleCxpKSwhMX0sX21vdXNlU3RvcDpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fcmVtb3ZlQ2xhc3ModGhpcy5oYW5kbGVzLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksdGhpcy5fbW91c2VTbGlkaW5nPSExLHRoaXMuX3N0b3AodCx0aGlzLl9oYW5kbGVJbmRleCksdGhpcy5fY2hhbmdlKHQsdGhpcy5faGFuZGxlSW5kZXgpLHRoaXMuX2hhbmRsZUluZGV4PW51bGwsdGhpcy5fY2xpY2tPZmZzZXQ9bnVsbCx0aGlzLl9hbmltYXRlT2ZmPSExLCExfSxfZGV0ZWN0T3JpZW50YXRpb246ZnVuY3Rpb24oKXt0aGlzLm9yaWVudGF0aW9uPVwidmVydGljYWxcIj09PXRoaXMub3B0aW9ucy5vcmllbnRhdGlvbj9cInZlcnRpY2FsXCI6XCJob3Jpem9udGFsXCJ9LF9ub3JtVmFsdWVGcm9tTW91c2U6ZnVuY3Rpb24odCl7dmFyIGUsaSxzLG4sbztyZXR1cm5cImhvcml6b250YWxcIj09PXRoaXMub3JpZW50YXRpb24/KGU9dGhpcy5lbGVtZW50U2l6ZS53aWR0aCxpPXQueC10aGlzLmVsZW1lbnRPZmZzZXQubGVmdC0odGhpcy5fY2xpY2tPZmZzZXQ/dGhpcy5fY2xpY2tPZmZzZXQubGVmdDowKSk6KGU9dGhpcy5lbGVtZW50U2l6ZS5oZWlnaHQsaT10LnktdGhpcy5lbGVtZW50T2Zmc2V0LnRvcC0odGhpcy5fY2xpY2tPZmZzZXQ/dGhpcy5fY2xpY2tPZmZzZXQudG9wOjApKSxzPWkvZSxzPjEmJihzPTEpLDA+cyYmKHM9MCksXCJ2ZXJ0aWNhbFwiPT09dGhpcy5vcmllbnRhdGlvbiYmKHM9MS1zKSxuPXRoaXMuX3ZhbHVlTWF4KCktdGhpcy5fdmFsdWVNaW4oKSxvPXRoaXMuX3ZhbHVlTWluKCkrcypuLHRoaXMuX3RyaW1BbGlnblZhbHVlKG8pfSxfdWlIYXNoOmZ1bmN0aW9uKHQsZSxpKXt2YXIgcz17aGFuZGxlOnRoaXMuaGFuZGxlc1t0XSxoYW5kbGVJbmRleDp0LHZhbHVlOnZvaWQgMCE9PWU/ZTp0aGlzLnZhbHVlKCl9O3JldHVybiB0aGlzLl9oYXNNdWx0aXBsZVZhbHVlcygpJiYocy52YWx1ZT12b2lkIDAhPT1lP2U6dGhpcy52YWx1ZXModCkscy52YWx1ZXM9aXx8dGhpcy52YWx1ZXMoKSksc30sX2hhc011bHRpcGxlVmFsdWVzOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMub3B0aW9ucy52YWx1ZXMmJnRoaXMub3B0aW9ucy52YWx1ZXMubGVuZ3RofSxfc3RhcnQ6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5fdHJpZ2dlcihcInN0YXJ0XCIsdCx0aGlzLl91aUhhc2goZSkpfSxfc2xpZGU6ZnVuY3Rpb24odCxlLGkpe3ZhciBzLG4sbz10aGlzLnZhbHVlKCksYT10aGlzLnZhbHVlcygpO3RoaXMuX2hhc011bHRpcGxlVmFsdWVzKCkmJihuPXRoaXMudmFsdWVzKGU/MDoxKSxvPXRoaXMudmFsdWVzKGUpLDI9PT10aGlzLm9wdGlvbnMudmFsdWVzLmxlbmd0aCYmdGhpcy5vcHRpb25zLnJhbmdlPT09ITAmJihpPTA9PT1lP01hdGgubWluKG4saSk6TWF0aC5tYXgobixpKSksYVtlXT1pKSxpIT09byYmKHM9dGhpcy5fdHJpZ2dlcihcInNsaWRlXCIsdCx0aGlzLl91aUhhc2goZSxpLGEpKSxzIT09ITEmJih0aGlzLl9oYXNNdWx0aXBsZVZhbHVlcygpP3RoaXMudmFsdWVzKGUsaSk6dGhpcy52YWx1ZShpKSkpfSxfc3RvcDpmdW5jdGlvbih0LGUpe3RoaXMuX3RyaWdnZXIoXCJzdG9wXCIsdCx0aGlzLl91aUhhc2goZSkpfSxfY2hhbmdlOmZ1bmN0aW9uKHQsZSl7dGhpcy5fa2V5U2xpZGluZ3x8dGhpcy5fbW91c2VTbGlkaW5nfHwodGhpcy5fbGFzdENoYW5nZWRWYWx1ZT1lLHRoaXMuX3RyaWdnZXIoXCJjaGFuZ2VcIix0LHRoaXMuX3VpSGFzaChlKSkpfSx2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gYXJndW1lbnRzLmxlbmd0aD8odGhpcy5vcHRpb25zLnZhbHVlPXRoaXMuX3RyaW1BbGlnblZhbHVlKHQpLHRoaXMuX3JlZnJlc2hWYWx1ZSgpLHRoaXMuX2NoYW5nZShudWxsLDApLHZvaWQgMCk6dGhpcy5fdmFsdWUoKX0sdmFsdWVzOmZ1bmN0aW9uKGUsaSl7dmFyIHMsbixvO2lmKGFyZ3VtZW50cy5sZW5ndGg+MSlyZXR1cm4gdGhpcy5vcHRpb25zLnZhbHVlc1tlXT10aGlzLl90cmltQWxpZ25WYWx1ZShpKSx0aGlzLl9yZWZyZXNoVmFsdWUoKSx0aGlzLl9jaGFuZ2UobnVsbCxlKSx2b2lkIDA7aWYoIWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHRoaXMuX3ZhbHVlcygpO2lmKCF0LmlzQXJyYXkoYXJndW1lbnRzWzBdKSlyZXR1cm4gdGhpcy5faGFzTXVsdGlwbGVWYWx1ZXMoKT90aGlzLl92YWx1ZXMoZSk6dGhpcy52YWx1ZSgpO2ZvcihzPXRoaXMub3B0aW9ucy52YWx1ZXMsbj1hcmd1bWVudHNbMF0sbz0wO3MubGVuZ3RoPm87bys9MSlzW29dPXRoaXMuX3RyaW1BbGlnblZhbHVlKG5bb10pLHRoaXMuX2NoYW5nZShudWxsLG8pO3RoaXMuX3JlZnJlc2hWYWx1ZSgpfSxfc2V0T3B0aW9uOmZ1bmN0aW9uKGUsaSl7dmFyIHMsbj0wO3N3aXRjaChcInJhbmdlXCI9PT1lJiZ0aGlzLm9wdGlvbnMucmFuZ2U9PT0hMCYmKFwibWluXCI9PT1pPyh0aGlzLm9wdGlvbnMudmFsdWU9dGhpcy5fdmFsdWVzKDApLHRoaXMub3B0aW9ucy52YWx1ZXM9bnVsbCk6XCJtYXhcIj09PWkmJih0aGlzLm9wdGlvbnMudmFsdWU9dGhpcy5fdmFsdWVzKHRoaXMub3B0aW9ucy52YWx1ZXMubGVuZ3RoLTEpLHRoaXMub3B0aW9ucy52YWx1ZXM9bnVsbCkpLHQuaXNBcnJheSh0aGlzLm9wdGlvbnMudmFsdWVzKSYmKG49dGhpcy5vcHRpb25zLnZhbHVlcy5sZW5ndGgpLHRoaXMuX3N1cGVyKGUsaSksZSl7Y2FzZVwib3JpZW50YXRpb25cIjp0aGlzLl9kZXRlY3RPcmllbnRhdGlvbigpLHRoaXMuX3JlbW92ZUNsYXNzKFwidWktc2xpZGVyLWhvcml6b250YWwgdWktc2xpZGVyLXZlcnRpY2FsXCIpLl9hZGRDbGFzcyhcInVpLXNsaWRlci1cIit0aGlzLm9yaWVudGF0aW9uKSx0aGlzLl9yZWZyZXNoVmFsdWUoKSx0aGlzLm9wdGlvbnMucmFuZ2UmJnRoaXMuX3JlZnJlc2hSYW5nZShpKSx0aGlzLmhhbmRsZXMuY3NzKFwiaG9yaXpvbnRhbFwiPT09aT9cImJvdHRvbVwiOlwibGVmdFwiLFwiXCIpO2JyZWFrO2Nhc2VcInZhbHVlXCI6dGhpcy5fYW5pbWF0ZU9mZj0hMCx0aGlzLl9yZWZyZXNoVmFsdWUoKSx0aGlzLl9jaGFuZ2UobnVsbCwwKSx0aGlzLl9hbmltYXRlT2ZmPSExO2JyZWFrO2Nhc2VcInZhbHVlc1wiOmZvcih0aGlzLl9hbmltYXRlT2ZmPSEwLHRoaXMuX3JlZnJlc2hWYWx1ZSgpLHM9bi0xO3M+PTA7cy0tKXRoaXMuX2NoYW5nZShudWxsLHMpO3RoaXMuX2FuaW1hdGVPZmY9ITE7YnJlYWs7Y2FzZVwic3RlcFwiOmNhc2VcIm1pblwiOmNhc2VcIm1heFwiOnRoaXMuX2FuaW1hdGVPZmY9ITAsdGhpcy5fY2FsY3VsYXRlTmV3TWF4KCksdGhpcy5fcmVmcmVzaFZhbHVlKCksdGhpcy5fYW5pbWF0ZU9mZj0hMTticmVhaztjYXNlXCJyYW5nZVwiOnRoaXMuX2FuaW1hdGVPZmY9ITAsdGhpcy5fcmVmcmVzaCgpLHRoaXMuX2FuaW1hdGVPZmY9ITF9fSxfc2V0T3B0aW9uRGlzYWJsZWQ6ZnVuY3Rpb24odCl7dGhpcy5fc3VwZXIodCksdGhpcy5fdG9nZ2xlQ2xhc3MobnVsbCxcInVpLXN0YXRlLWRpc2FibGVkXCIsISF0KX0sX3ZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLnZhbHVlO3JldHVybiB0PXRoaXMuX3RyaW1BbGlnblZhbHVlKHQpfSxfdmFsdWVzOmZ1bmN0aW9uKHQpe3ZhciBlLGkscztpZihhcmd1bWVudHMubGVuZ3RoKXJldHVybiBlPXRoaXMub3B0aW9ucy52YWx1ZXNbdF0sZT10aGlzLl90cmltQWxpZ25WYWx1ZShlKTtpZih0aGlzLl9oYXNNdWx0aXBsZVZhbHVlcygpKXtmb3IoaT10aGlzLm9wdGlvbnMudmFsdWVzLnNsaWNlKCkscz0wO2kubGVuZ3RoPnM7cys9MSlpW3NdPXRoaXMuX3RyaW1BbGlnblZhbHVlKGlbc10pO3JldHVybiBpfXJldHVybltdfSxfdHJpbUFsaWduVmFsdWU6ZnVuY3Rpb24odCl7aWYodGhpcy5fdmFsdWVNaW4oKT49dClyZXR1cm4gdGhpcy5fdmFsdWVNaW4oKTtpZih0Pj10aGlzLl92YWx1ZU1heCgpKXJldHVybiB0aGlzLl92YWx1ZU1heCgpO3ZhciBlPXRoaXMub3B0aW9ucy5zdGVwPjA/dGhpcy5vcHRpb25zLnN0ZXA6MSxpPSh0LXRoaXMuX3ZhbHVlTWluKCkpJWUscz10LWk7cmV0dXJuIDIqTWF0aC5hYnMoaSk+PWUmJihzKz1pPjA/ZTotZSkscGFyc2VGbG9hdChzLnRvRml4ZWQoNSkpfSxfY2FsY3VsYXRlTmV3TWF4OmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLm1heCxlPXRoaXMuX3ZhbHVlTWluKCksaT10aGlzLm9wdGlvbnMuc3RlcCxzPU1hdGgucm91bmQoKHQtZSkvaSkqaTt0PXMrZSx0PnRoaXMub3B0aW9ucy5tYXgmJih0LT1pKSx0aGlzLm1heD1wYXJzZUZsb2F0KHQudG9GaXhlZCh0aGlzLl9wcmVjaXNpb24oKSkpfSxfcHJlY2lzaW9uOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fcHJlY2lzaW9uT2YodGhpcy5vcHRpb25zLnN0ZXApO3JldHVybiBudWxsIT09dGhpcy5vcHRpb25zLm1pbiYmKHQ9TWF0aC5tYXgodCx0aGlzLl9wcmVjaXNpb25PZih0aGlzLm9wdGlvbnMubWluKSkpLHR9LF9wcmVjaXNpb25PZjpmdW5jdGlvbih0KXt2YXIgZT1cIlwiK3QsaT1lLmluZGV4T2YoXCIuXCIpO3JldHVybi0xPT09aT8wOmUubGVuZ3RoLWktMX0sX3ZhbHVlTWluOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMub3B0aW9ucy5taW59LF92YWx1ZU1heDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1heH0sX3JlZnJlc2hSYW5nZTpmdW5jdGlvbih0KXtcInZlcnRpY2FsXCI9PT10JiZ0aGlzLnJhbmdlLmNzcyh7d2lkdGg6XCJcIixsZWZ0OlwiXCJ9KSxcImhvcml6b250YWxcIj09PXQmJnRoaXMucmFuZ2UuY3NzKHtoZWlnaHQ6XCJcIixib3R0b206XCJcIn0pfSxfcmVmcmVzaFZhbHVlOmZ1bmN0aW9uKCl7dmFyIGUsaSxzLG4sbyxhPXRoaXMub3B0aW9ucy5yYW5nZSxyPXRoaXMub3B0aW9ucyxsPXRoaXMsaD10aGlzLl9hbmltYXRlT2ZmPyExOnIuYW5pbWF0ZSxjPXt9O3RoaXMuX2hhc011bHRpcGxlVmFsdWVzKCk/dGhpcy5oYW5kbGVzLmVhY2goZnVuY3Rpb24ocyl7aT0xMDAqKChsLnZhbHVlcyhzKS1sLl92YWx1ZU1pbigpKS8obC5fdmFsdWVNYXgoKS1sLl92YWx1ZU1pbigpKSksY1tcImhvcml6b250YWxcIj09PWwub3JpZW50YXRpb24/XCJsZWZ0XCI6XCJib3R0b21cIl09aStcIiVcIix0KHRoaXMpLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKGMsci5hbmltYXRlKSxsLm9wdGlvbnMucmFuZ2U9PT0hMCYmKFwiaG9yaXpvbnRhbFwiPT09bC5vcmllbnRhdGlvbj8oMD09PXMmJmwucmFuZ2Uuc3RvcCgxLDEpW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe2xlZnQ6aStcIiVcIn0sci5hbmltYXRlKSwxPT09cyYmbC5yYW5nZVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHt3aWR0aDppLWUrXCIlXCJ9LHtxdWV1ZTohMSxkdXJhdGlvbjpyLmFuaW1hdGV9KSk6KDA9PT1zJiZsLnJhbmdlLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHtib3R0b206aStcIiVcIn0sci5hbmltYXRlKSwxPT09cyYmbC5yYW5nZVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHtoZWlnaHQ6aS1lK1wiJVwifSx7cXVldWU6ITEsZHVyYXRpb246ci5hbmltYXRlfSkpKSxlPWl9KToocz10aGlzLnZhbHVlKCksbj10aGlzLl92YWx1ZU1pbigpLG89dGhpcy5fdmFsdWVNYXgoKSxpPW8hPT1uPzEwMCooKHMtbikvKG8tbikpOjAsY1tcImhvcml6b250YWxcIj09PXRoaXMub3JpZW50YXRpb24/XCJsZWZ0XCI6XCJib3R0b21cIl09aStcIiVcIix0aGlzLmhhbmRsZS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXShjLHIuYW5pbWF0ZSksXCJtaW5cIj09PWEmJlwiaG9yaXpvbnRhbFwiPT09dGhpcy5vcmllbnRhdGlvbiYmdGhpcy5yYW5nZS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7d2lkdGg6aStcIiVcIn0sci5hbmltYXRlKSxcIm1heFwiPT09YSYmXCJob3Jpem9udGFsXCI9PT10aGlzLm9yaWVudGF0aW9uJiZ0aGlzLnJhbmdlLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHt3aWR0aDoxMDAtaStcIiVcIn0sci5hbmltYXRlKSxcIm1pblwiPT09YSYmXCJ2ZXJ0aWNhbFwiPT09dGhpcy5vcmllbnRhdGlvbiYmdGhpcy5yYW5nZS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7aGVpZ2h0OmkrXCIlXCJ9LHIuYW5pbWF0ZSksXCJtYXhcIj09PWEmJlwidmVydGljYWxcIj09PXRoaXMub3JpZW50YXRpb24mJnRoaXMucmFuZ2Uuc3RvcCgxLDEpW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe2hlaWdodDoxMDAtaStcIiVcIn0sci5hbmltYXRlKSl9LF9oYW5kbGVFdmVudHM6e2tleWRvd246ZnVuY3Rpb24oZSl7dmFyIGkscyxuLG8sYT10KGUudGFyZ2V0KS5kYXRhKFwidWktc2xpZGVyLWhhbmRsZS1pbmRleFwiKTtzd2l0Y2goZS5rZXlDb2RlKXtjYXNlIHQudWkua2V5Q29kZS5IT01FOmNhc2UgdC51aS5rZXlDb2RlLkVORDpjYXNlIHQudWkua2V5Q29kZS5QQUdFX1VQOmNhc2UgdC51aS5rZXlDb2RlLlBBR0VfRE9XTjpjYXNlIHQudWkua2V5Q29kZS5VUDpjYXNlIHQudWkua2V5Q29kZS5SSUdIVDpjYXNlIHQudWkua2V5Q29kZS5ET1dOOmNhc2UgdC51aS5rZXlDb2RlLkxFRlQ6aWYoZS5wcmV2ZW50RGVmYXVsdCgpLCF0aGlzLl9rZXlTbGlkaW5nJiYodGhpcy5fa2V5U2xpZGluZz0hMCx0aGlzLl9hZGRDbGFzcyh0KGUudGFyZ2V0KSxudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpLGk9dGhpcy5fc3RhcnQoZSxhKSxpPT09ITEpKXJldHVybn1zd2l0Y2gobz10aGlzLm9wdGlvbnMuc3RlcCxzPW49dGhpcy5faGFzTXVsdGlwbGVWYWx1ZXMoKT90aGlzLnZhbHVlcyhhKTp0aGlzLnZhbHVlKCksZS5rZXlDb2RlKXtjYXNlIHQudWkua2V5Q29kZS5IT01FOm49dGhpcy5fdmFsdWVNaW4oKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5FTkQ6bj10aGlzLl92YWx1ZU1heCgpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlBBR0VfVVA6bj10aGlzLl90cmltQWxpZ25WYWx1ZShzKyh0aGlzLl92YWx1ZU1heCgpLXRoaXMuX3ZhbHVlTWluKCkpL3RoaXMubnVtUGFnZXMpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlBBR0VfRE9XTjpuPXRoaXMuX3RyaW1BbGlnblZhbHVlKHMtKHRoaXMuX3ZhbHVlTWF4KCktdGhpcy5fdmFsdWVNaW4oKSkvdGhpcy5udW1QYWdlcyk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuVVA6Y2FzZSB0LnVpLmtleUNvZGUuUklHSFQ6aWYocz09PXRoaXMuX3ZhbHVlTWF4KCkpcmV0dXJuO249dGhpcy5fdHJpbUFsaWduVmFsdWUocytvKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5ET1dOOmNhc2UgdC51aS5rZXlDb2RlLkxFRlQ6aWYocz09PXRoaXMuX3ZhbHVlTWluKCkpcmV0dXJuO249dGhpcy5fdHJpbUFsaWduVmFsdWUocy1vKX10aGlzLl9zbGlkZShlLGEsbil9LGtleXVwOmZ1bmN0aW9uKGUpe3ZhciBpPXQoZS50YXJnZXQpLmRhdGEoXCJ1aS1zbGlkZXItaGFuZGxlLWluZGV4XCIpO3RoaXMuX2tleVNsaWRpbmcmJih0aGlzLl9rZXlTbGlkaW5nPSExLHRoaXMuX3N0b3AoZSxpKSx0aGlzLl9jaGFuZ2UoZSxpKSx0aGlzLl9yZW1vdmVDbGFzcyh0KGUudGFyZ2V0KSxudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpKX19fSl9KTsiLCJ2YXIgc2RUb29sdGlwID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciB0b29sdGlwVGltZU91dCA9IG51bGw7XG4gICAgdmFyIGRpc3BsYXlUaW1lT3ZlciA9IDA7XG4gICAgdmFyIGRpc3BsYXlUaW1lQ2xpY2sgPSAzMDAwO1xuICAgIHZhciBoaWRlVGltZSA9IDEwMDtcbiAgICB2YXIgYXJyb3cgPSAxMDtcbiAgICB2YXIgYXJyb3dXaWR0aCA9IDg7XG4gICAgdmFyIHRvb2x0aXA7XG4gICAgdmFyIHNpemUgPSAnc21hbGwnO1xuICAgIHZhciBoaWRlQ2xhc3MgPSAnaGlkZGVuJztcbiAgICB2YXIgdG9vbHRpcEVsZW1lbnRzO1xuICAgIHZhciBjdXJyZW50RWxlbWVudDtcblxuICAgIGZ1bmN0aW9uIHRvb2x0aXBJbml0KCkge1xuICAgICAgICB0b29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ3RpcHNvX2J1YmJsZScpLmFkZENsYXNzKHNpemUpLmFkZENsYXNzKGhpZGVDbGFzcylcbiAgICAgICAgICAgIC5odG1sKCc8ZGl2IGNsYXNzPVwidGlwc29fYXJyb3dcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGl0c29fdGl0bGVcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGlwc29fY29udGVudFwiPjwvZGl2PicpO1xuICAgICAgICAkKHRvb2x0aXApLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgY2hlY2tNb3VzZVBvcyhlKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQodG9vbHRpcCkub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjaGVja01vdXNlUG9zKGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0b29sdGlwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja01vdXNlUG9zKGUpIHtcbiAgICAgICAgaWYgKGUuY2xpZW50WCA+ICQoY3VycmVudEVsZW1lbnQpLm9mZnNldCgpLmxlZnQgJiYgZS5jbGllbnRYIDwgJChjdXJyZW50RWxlbWVudCkub2Zmc2V0KCkubGVmdCArICQoY3VycmVudEVsZW1lbnQpLm91dGVyV2lkdGgoKVxuICAgICAgICAgICAgJiYgZS5jbGllbnRZID4gJChjdXJyZW50RWxlbWVudCkub2Zmc2V0KCkudG9wICYmIGUuY2xpZW50WSA8ICQoY3VycmVudEVsZW1lbnQpLm9mZnNldCgpLnRvcCArICQoY3VycmVudEVsZW1lbnQpLm91dGVySGVpZ2h0KCkpIHtcbiAgICAgICAgICAgIHRvb2x0aXBTaG93KGN1cnJlbnRFbGVtZW50LCBkaXNwbGF5VGltZU92ZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9vbHRpcFNob3coZWxlbSwgZGlzcGxheVRpbWUpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRvb2x0aXBUaW1lT3V0KTtcblxuICAgICAgICB2YXIgdGl0bGUgPSAkKGVsZW0pLmRhdGEoJ29yaWdpbmFsLXRpdGxlJyk7XG4gICAgICAgIHZhciBodG1sID0gJCgnIycrJChlbGVtKS5kYXRhKCdvcmlnaW5hbC1odG1sJykpLmh0bWwoKTtcbiAgICAgICAgaWYgKGh0bWwpIHtcbiAgICAgICAgICAgIHRpdGxlID0gaHRtbDtcbiAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ3RpcHNvX2J1YmJsZV9odG1sJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKCd0aXBzb19idWJibGVfaHRtbCcpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwb3NpdGlvbiA9ICQoZWxlbSkuZGF0YSgncGxhY2VtZW50JykgfHwgJ2JvdHRvbSc7XG4gICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyIGJvdHRvbV9yaWdodF9jb3JuZXIgdG9wX2xlZnRfY29ybmVyIGJvdHRvbV9sZWZ0X2Nvcm5lclwiKTtcblxuICAgICAgICAkKHRvb2x0aXApLmZpbmQoJy50aXRzb190aXRsZScpLmh0bWwodGl0bGUpO1xuICAgICAgICBzZXRQb3NpdG9uKGVsZW0sIHBvc2l0aW9uKTtcbiAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcyhoaWRlQ2xhc3MpO1xuICAgICAgICBjdXJyZW50RWxlbWVudCA9IGVsZW07XG5cbiAgICAgICAgaWYgKGRpc3BsYXlUaW1lID4gMCkge1xuICAgICAgICAgICAgdG9vbHRpcFRpbWVPdXQgPSBzZXRUaW1lb3V0KHRvb2x0aXBIaWRlLCBkaXNwbGF5VGltZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdG9vbHRpcEhpZGUoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0b29sdGlwVGltZU91dCk7XG4gICAgICAgIHRvb2x0aXBUaW1lT3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcyhoaWRlQ2xhc3MpO1xuICAgICAgICB9LCBoaWRlVGltZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0UG9zaXRvbihlbGVtLCBwb3NpdGlvbil7XG4gICAgICAgIHZhciAkZSA9ICQoZWxlbSk7XG4gICAgICAgIHZhciAkd2luID0gJCh3aW5kb3cpO1xuICAgICAgICB2YXIgY3VzdG9tVG9wID0gJChlbGVtKS5kYXRhKCd0b3AnKTsvL9C30LDQtNCw0L3QsCDQv9C+0LfQuNGG0LjRjyDQstC90YPRgtGA0Lgg0Y3Qu9C10LzQtdC90YLQsFxuICAgICAgICB2YXIgY3VzdG9tTGVmdCA9ICQoZWxlbSkuZGF0YSgnbGVmdCcpOy8v0LfQsNC00LDQvdCwINC/0L7Qt9C40YbQuNGPINCy0L3Rg9GC0YDQuCDRjdC70LXQvNC10L3RgtCwXG4gICAgICAgIHZhciBub3JldmVydCA9ICQoZWxlbSkuZGF0YSgnbm9yZXZlcnQnKTsvL9C90LUg0L/QtdGA0LXQstC+0YDQsNGH0LjQstCw0YLRjFxuICAgICAgICBzd2l0Y2gocG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgcG9zX2xlZnQgPSAkZS5vZmZzZXQoKS5sZWZ0ICsgKGN1c3RvbUxlZnQgPyBjdXN0b21MZWZ0IDogJGUub3V0ZXJXaWR0aCgpIC8gMikgLSAkKHRvb2x0aXApLm91dGVyV2lkdGgoKSAvIDI7XG4gICAgICAgICAgICAgICAgcG9zX3RvcCA9ICRlLm9mZnNldCgpLnRvcCAtICQodG9vbHRpcCkub3V0ZXJIZWlnaHQoKSArIChjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAwKSAtIGFycm93O1xuICAgICAgICAgICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpcHNvX2Fycm93JykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogLWFycm93V2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoKHBvc190b3AgPCAkd2luLnNjcm9sbFRvcCgpKSAmJiAhbm9yZXZlcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zX3RvcCA9ICRlLm9mZnNldCgpLnRvcCArKGN1c3RvbVRvcCA/IGN1c3RvbVRvcCA6ICRlLm91dGVySGVpZ2h0KCkpICsgYXJyb3c7XG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCdib3R0b20nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCd0b3AnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgIHBvc19sZWZ0ID0gJGUub2Zmc2V0KCkubGVmdCArIChjdXN0b21MZWZ0ID8gY3VzdG9tTGVmdCA6ICRlLm91dGVyV2lkdGgoKSAvIDIpIC0gJCh0b29sdGlwKS5vdXRlcldpZHRoKCkgLyAyO1xuICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgKyAoY3VzdG9tVG9wID8gY3VzdG9tVG9wIDogJGUub3V0ZXJIZWlnaHQoKSkgKyBhcnJvdztcbiAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmZpbmQoJy50aXBzb19hcnJvdycpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQ6IC1hcnJvd1dpZHRoLFxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKChwb3NfdG9wICsgJCh0b29sdGlwKS5oZWlnaHQoKSA+ICR3aW4uc2Nyb2xsVG9wKCkgKyAkd2luLm91dGVySGVpZ2h0KCkpICYmICFub3JldmVydCkge1xuICAgICAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wIC0gJCh0b29sdGlwKS5oZWlnaHQoKSArIChjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAwKSAtIGFycm93O1xuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKCd0b3AgYm90dG9tIGxlZnQgcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndG9wJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKCd0b3AgYm90dG9tIGxlZnQgcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygnYm90dG9tJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgICQodG9vbHRpcCkuY3NzKHtcbiAgICAgICAgICAgIGxlZnQ6ICBwb3NfbGVmdCxcbiAgICAgICAgICAgIHRvcDogcG9zX3RvcFxuICAgICAgICB9KTtcbiAgICB9XG5cblxuXG5cbiAgICBmdW5jdGlvbiBzZXRFdmVudHMoKSB7XG5cbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzID0gJCgnW2RhdGEtdG9nZ2xlPXRvb2x0aXBdJyk7XG5cbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5kYXRhKCdjbGlja2FibGUnKSkge1xuICAgICAgICAgICAgICAgIGlmICgkKHRvb2x0aXApLmhhc0NsYXNzKGhpZGVDbGFzcykpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcFNob3codGhpcywgZGlzcGxheVRpbWVDbGljayk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcEhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IDEwMjQpIHtcbiAgICAgICAgICAgICAgICB0b29sdGlwU2hvdyh0aGlzLCBkaXNwbGF5VGltZU92ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IDEwMjQpIHtcbiAgICAgICAgICAgICAgICB0b29sdGlwU2hvdyh0aGlzLCBkaXNwbGF5VGltZU92ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24gKCl7XG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPj0gMTAyNCkge1xuICAgICAgICAgICAgICAgIHRvb2x0aXBIaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgICAgdG9vbHRpcEluaXQoKTtcbiAgICAvLyAgICAgc2V0RXZlbnRzKCk7XG4gICAgLy8gfSk7XG4gICAgLy9cbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0OiB0b29sdGlwSW5pdCxcbiAgICAgICAgc2V0RXZlbnRzOiBzZXRFdmVudHNcbiAgICB9XG59KSgpO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBzZFRvb2x0aXAuaW5pdCgpO1xuICAgIHNkVG9vbHRpcC5zZXRFdmVudHMoKTtcbn0pO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuICB2YXIgJG5vdHlmaV9idG4gPSAkKCcuaGVhZGVyLWxvZ29fbm90eScpO1xuICBpZiAoJG5vdHlmaV9idG4ubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvL3ZhciBocmVmID0gJy8nK2xhbmcuaHJlZl9wcmVmaXgrJ2FjY291bnQvbm90aWZpY2F0aW9uJztcbiAgdmFyIGhyZWYgPSAgJCgnI2FjY291bnRfbm90aWZpY2F0aW9uc19saW5rJykuYXR0cignaHJlZicpO1xuXG4gICQuZ2V0KGhyZWYsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYgKCFkYXRhLm5vdGlmaWNhdGlvbnMgfHwgZGF0YS5ub3RpZmljYXRpb25zLmxlbmd0aCA9PSAwKSByZXR1cm47XG5cbiAgICB2YXIgb3V0ID0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktYm94PjxkaXYgY2xhc3M9aGVhZGVyLW5vdHktYm94LWlubmVyPjx1bCBjbGFzcz1cImhlYWRlci1ub3R5LWxpc3RcIj4nO1xuICAgICRub3R5ZmlfYnRuLmZpbmQoJ2EnKS5yZW1vdmVBdHRyKCdocmVmJyk7XG4gICAgdmFyIGhhc19uZXcgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgZWwgPSBkYXRhLm5vdGlmaWNhdGlvbnNbaV07XG4gICAgICB2YXIgaXNfbmV3ID0gKGVsLmlzX3ZpZXdlZCA9PSAwICYmIGVsLnR5cGVfaWQgPT0gMik7XG4gICAgICBvdXQgKz0gJzxsaSBjbGFzcz1cImhlYWRlci1ub3R5LWl0ZW0nICsgKGlzX25ldyA/ICcgaGVhZGVyLW5vdHktaXRlbV9uZXcnIDogJycpICsgJ1wiPic7XG4gICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktZGF0YT4nICsgZWwuZGF0YSArICc8L2Rpdj4nO1xuICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LXRleHQ+JyArIGVsLnRleHQgKyAnPC9kaXY+JztcbiAgICAgIG91dCArPSAnPC9saT4nO1xuICAgICAgaGFzX25ldyA9IGhhc19uZXcgfHwgaXNfbmV3O1xuICAgIH1cblxuICAgIG91dCArPSAnPC91bD4nO1xuICAgIG91dCArPSAnPGEgY2xhc3M9XCJidG4gaGVhZGVyLW5vdHktYm94LWJ0blwiIGhyZWY9XCInK2hyZWYrJ1wiPicgKyBkYXRhLmJ0biArICc8L2E+JztcbiAgICBvdXQgKz0gJzwvZGl2PjwvZGl2Pic7XG4gICAgJCgnLmhlYWRlcicpLmFwcGVuZChvdXQpO1xuXG4gICAgaWYgKGhhc19uZXcpIHtcbiAgICAgICRub3R5ZmlfYnRuLmFkZENsYXNzKCd0b29sdGlwJykuYWRkQ2xhc3MoJ2hhcy1ub3R5Jyk7XG4gICAgfVxuXG4gICAgJG5vdHlmaV9idG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciBocmVmID0gICQoJyNhY2NvdW50X25vdGlmaWNhdGlvbnNfbGluaycpLmF0dHIoJ2hyZWYnKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmICgkKCcuaGVhZGVyLW5vdHktYm94JykuaGFzQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJykpIHtcbiAgICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xuICAgICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5hZGRDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcbiAgICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XG5cbiAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2hhcy1ub3R5JykpIHtcbiAgICAgICAgICAkLnBvc3QoaHJlZiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJCgnLmhlYWRlci1sb2dvX25vdHknKS5yZW1vdmVDbGFzcygndG9vbHRpcCcpLnJlbW92ZUNsYXNzKCdoYXMtbm90eScpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xuICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XG4gICAgfSk7XG5cbiAgICAkKCcuaGVhZGVyLW5vdHktbGlzdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSlcbiAgfSwgJ2pzb24nKTtcblxufSkoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaWYgKHR5cGVvZiBtaWhhaWxkZXYgPT0gXCJ1bmRlZmluZWRcIiB8fCAhbWloYWlsZGV2KSB7XG4gICAgdmFyIG1paGFpbGRldiA9IHt9O1xuICAgIG1paGFpbGRldi5lbEZpbmRlciA9IHtcbiAgICAgICAgb3Blbk1hbmFnZXI6IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IFwibWVudWJhcj1ubyx0b29sYmFyPW5vLGxvY2F0aW9uPW5vLGRpcmVjdG9yaWVzPW5vLHN0YXR1cz1ubyxmdWxsc2NyZWVuPW5vXCI7XG4gICAgICAgICAgICBpZihvcHRpb25zLndpZHRoID09ICdhdXRvJyl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy53aWR0aCA9ICQod2luZG93KS53aWR0aCgpLzEuNTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYob3B0aW9ucy5oZWlnaHQgPT0gJ2F1dG8nKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKS8xLjU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcyArIFwiLHdpZHRoPVwiICsgb3B0aW9ucy53aWR0aDtcbiAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcyArIFwiLGhlaWdodD1cIiArIG9wdGlvbnMuaGVpZ2h0O1xuXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHBhcmFtcyk7XG4gICAgICAgICAgICB2YXIgd2luID0gd2luZG93Lm9wZW4ob3B0aW9ucy51cmwsICdFbEZpbmRlck1hbmFnZXInICsgb3B0aW9ucy5pZCwgcGFyYW1zKTtcbiAgICAgICAgICAgIHdpbi5mb2N1cygpXG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uczoge30sXG4gICAgICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihpZCwgZnVuYyl7XG4gICAgICAgICAgICB0aGlzLmZ1bmN0aW9uc1tpZF0gPSBmdW5jO1xuICAgICAgICB9LFxuICAgICAgICBjYWxsRnVuY3Rpb246IGZ1bmN0aW9uKGlkLCBmaWxlKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZ1bmN0aW9uc1tpZF0oZmlsZSwgaWQpO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvblJldHVyblRvSW5wdXQ6IGZ1bmN0aW9uKGZpbGUsIGlkKXtcbiAgICAgICAgICAgIGpRdWVyeSgnIycgKyBpZCkudmFsKGZpbGUudXJsKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcblxufVxuXG5cblxudmFyIG1lZ2FzbGlkZXIgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgc2xpZGVyX2RhdGEgPSBmYWxzZTtcbiAgdmFyIGNvbnRhaW5lcl9pZCA9IFwic2VjdGlvbiNtZWdhX3NsaWRlclwiO1xuICB2YXIgcGFyYWxsYXhfZ3JvdXAgPSBmYWxzZTtcbiAgdmFyIHBhcmFsbGF4X3RpbWVyID0gZmFsc2U7XG4gIHZhciBwYXJhbGxheF9jb3VudGVyID0gMDtcbiAgdmFyIHBhcmFsbGF4X2QgPSAxO1xuICB2YXIgbW9iaWxlX21vZGUgPSAtMTtcbiAgdmFyIG1heF90aW1lX2xvYWRfcGljID0gMzAwO1xuICB2YXIgbW9iaWxlX3NpemUgPSA3MDA7XG4gIHZhciByZW5kZXJfc2xpZGVfbm9tID0gMDtcbiAgdmFyIHRvdF9pbWdfd2FpdDtcbiAgdmFyIHNsaWRlcztcbiAgdmFyIHNsaWRlX3NlbGVjdF9ib3g7XG4gIHZhciBlZGl0b3I7XG4gIHZhciB0aW1lb3V0SWQ7XG4gIHZhciBzY3JvbGxfcGVyaW9kID0gNjAwMDtcblxuICB2YXIgcG9zQXJyID0gW1xuICAgICdzbGlkZXJfX3RleHQtbHQnLCAnc2xpZGVyX190ZXh0LWN0JywgJ3NsaWRlcl9fdGV4dC1ydCcsXG4gICAgJ3NsaWRlcl9fdGV4dC1sYycsICdzbGlkZXJfX3RleHQtY2MnLCAnc2xpZGVyX190ZXh0LXJjJyxcbiAgICAnc2xpZGVyX190ZXh0LWxiJywgJ3NsaWRlcl9fdGV4dC1jYicsICdzbGlkZXJfX3RleHQtcmInLFxuICBdO1xuICB2YXIgcG9zX2xpc3QgPSBbXG4gICAgJ9Cb0LXQstC+INCy0LXRgNGFJywgJ9GG0LXQvdGC0YAg0LLQtdGA0YUnLCAn0L/RgNCw0LLQviDQstC10YDRhScsXG4gICAgJ9Cb0LXQstC+INGG0LXQvdGC0YAnLCAn0YbQtdC90YLRgCcsICfQv9GA0LDQstC+INGG0LXQvdGC0YAnLFxuICAgICfQm9C10LLQviDQvdC40LcnLCAn0YbQtdC90YLRgCDQvdC40LcnLCAn0L/RgNCw0LLQviDQvdC40LcnLFxuICBdO1xuICB2YXIgc2hvd19kZWxheSA9IFtcbiAgICAnc2hvd19ub19kZWxheScsXG4gICAgJ3Nob3dfZGVsYXlfMDUnLFxuICAgICdzaG93X2RlbGF5XzEwJyxcbiAgICAnc2hvd19kZWxheV8xNScsXG4gICAgJ3Nob3dfZGVsYXlfMjAnLFxuICAgICdzaG93X2RlbGF5XzI1JyxcbiAgICAnc2hvd19kZWxheV8zMCdcbiAgXTtcbiAgdmFyIGhpZGVfZGVsYXkgPSBbXG4gICAgJ2hpZGVfbm9fZGVsYXknLFxuICAgICdoaWRlX2RlbGF5XzA1JyxcbiAgICAnaGlkZV9kZWxheV8xMCcsXG4gICAgJ2hpZGVfZGVsYXlfMTUnLFxuICAgICdoaWRlX2RlbGF5XzIwJ1xuICBdO1xuICB2YXIgeWVzX25vX2FyciA9IFtcbiAgICAnbm8nLFxuICAgICd5ZXMnXG4gIF07XG4gIHZhciB5ZXNfbm9fdmFsID0gW1xuICAgICcnLFxuICAgICdmaXhlZF9fZnVsbC1oZWlnaHQnXG4gIF07XG4gIHZhciBidG5fc3R5bGUgPSBbXG4gICAgJ25vbmUnLFxuICAgICdib3JkbycsXG4gICAgJ2JsYWNrJyxcbiAgICAnYmx1ZScsXG4gICAgJ2RhcmstYmx1ZScsXG4gICAgJ3JlZCcsXG4gICAgJ29yYW5nZScsXG4gICAgJ2dyZWVuJyxcbiAgICAnbGlnaHQtZ3JlZW4nLFxuICAgICdkYXJrLWdyZWVuJyxcbiAgICAncGluaycsXG4gICAgJ3llbGxvdydcbiAgXTtcbiAgdmFyIHNob3dfYW5pbWF0aW9ucyA9IFtcbiAgICBcIm5vdF9hbmltYXRlXCIsXG4gICAgXCJib3VuY2VJblwiLFxuICAgIFwiYm91bmNlSW5Eb3duXCIsXG4gICAgXCJib3VuY2VJbkxlZnRcIixcbiAgICBcImJvdW5jZUluUmlnaHRcIixcbiAgICBcImJvdW5jZUluVXBcIixcbiAgICBcImZhZGVJblwiLFxuICAgIFwiZmFkZUluRG93blwiLFxuICAgIFwiZmFkZUluTGVmdFwiLFxuICAgIFwiZmFkZUluUmlnaHRcIixcbiAgICBcImZhZGVJblVwXCIsXG4gICAgXCJmbGlwSW5YXCIsXG4gICAgXCJmbGlwSW5ZXCIsXG4gICAgXCJsaWdodFNwZWVkSW5cIixcbiAgICBcInJvdGF0ZUluXCIsXG4gICAgXCJyb3RhdGVJbkRvd25MZWZ0XCIsXG4gICAgXCJyb3RhdGVJblVwTGVmdFwiLFxuICAgIFwicm90YXRlSW5VcFJpZ2h0XCIsXG4gICAgXCJqYWNrSW5UaGVCb3hcIixcbiAgICBcInJvbGxJblwiLFxuICAgIFwiem9vbUluXCJcbiAgXTtcblxuICB2YXIgaGlkZV9hbmltYXRpb25zID0gW1xuICAgIFwibm90X2FuaW1hdGVcIixcbiAgICBcImJvdW5jZU91dFwiLFxuICAgIFwiYm91bmNlT3V0RG93blwiLFxuICAgIFwiYm91bmNlT3V0TGVmdFwiLFxuICAgIFwiYm91bmNlT3V0UmlnaHRcIixcbiAgICBcImJvdW5jZU91dFVwXCIsXG4gICAgXCJmYWRlT3V0XCIsXG4gICAgXCJmYWRlT3V0RG93blwiLFxuICAgIFwiZmFkZU91dExlZnRcIixcbiAgICBcImZhZGVPdXRSaWdodFwiLFxuICAgIFwiZmFkZU91dFVwXCIsXG4gICAgXCJmbGlwT3V0WFwiLFxuICAgIFwibGlwT3V0WVwiLFxuICAgIFwibGlnaHRTcGVlZE91dFwiLFxuICAgIFwicm90YXRlT3V0XCIsXG4gICAgXCJyb3RhdGVPdXREb3duTGVmdFwiLFxuICAgIFwicm90YXRlT3V0RG93blJpZ2h0XCIsXG4gICAgXCJyb3RhdGVPdXRVcExlZnRcIixcbiAgICBcInJvdGF0ZU91dFVwUmlnaHRcIixcbiAgICBcImhpbmdlXCIsXG4gICAgXCJyb2xsT3V0XCJcbiAgXTtcbiAgdmFyIHN0VGFibGU7XG4gIHZhciBwYXJhbGF4VGFibGU7XG5cbiAgZnVuY3Rpb24gaW5pdEltYWdlU2VydmVyU2VsZWN0KGVscykge1xuICAgIGlmIChlbHMubGVuZ3RoID09IDApcmV0dXJuO1xuICAgIGVscy53cmFwKCc8ZGl2IGNsYXNzPVwic2VsZWN0X2ltZ1wiPicpO1xuICAgIGVscyA9IGVscy5wYXJlbnQoKTtcbiAgICBlbHMuYXBwZW5kKCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImZpbGVfYnV0dG9uXCI+PGkgY2xhc3M9XCJtY2UtaWNvIG1jZS1pLWJyb3dzZVwiPjwvaT48L2J1dHRvbj4nKTtcbiAgICAvKmVscy5maW5kKCdidXR0b24nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcbiAgICAgJCgnI3JveHlDdXN0b21QYW5lbDInKS5hZGRDbGFzcygnb3BlbicpXG4gICAgIH0pOyovXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbCA9IGVscy5lcShpKS5maW5kKCdpbnB1dCcpO1xuICAgICAgaWYgKCFlbC5hdHRyKCdpZCcpKSB7XG4gICAgICAgIGVsLmF0dHIoJ2lkJywgJ2ZpbGVfJyArIGkgKyAnXycgKyBEYXRlLm5vdygpKVxuICAgICAgfVxuICAgICAgdmFyIHRfaWQgPSBlbC5hdHRyKCdpZCcpO1xuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLnJlZ2lzdGVyKHRfaWQsIGZ1bmN0aW9uIChmaWxlLCBpZCkge1xuICAgICAgICAvLyQodGhpcykudmFsKGZpbGUudXJsKS50cmlnZ2VyKCdjaGFuZ2UnLCBbZmlsZSwgaWRdKTtcbiAgICAgICAgJCgnIycgKyBpZCkudmFsKGZpbGUudXJsKS5jaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gICAgO1xuXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5maWxlX2J1dHRvbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcykucHJldigpO1xuICAgICAgdmFyIGlkID0gJHRoaXMuYXR0cignaWQnKTtcbiAgICAgIG1paGFpbGRldi5lbEZpbmRlci5vcGVuTWFuYWdlcih7XG4gICAgICAgIFwidXJsXCI6IFwiL21hbmFnZXIvZWxmaW5kZXI/ZmlsdGVyPWltYWdlJmNhbGxiYWNrPVwiICsgaWQgKyBcIiZsYW5nPXJ1XCIsXG4gICAgICAgIFwid2lkdGhcIjogXCJhdXRvXCIsXG4gICAgICAgIFwiaGVpZ2h0XCI6IFwiYXV0b1wiLFxuICAgICAgICBcImlkXCI6IGlkXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbklucHV0KGRhdGEpIHtcbiAgICB2YXIgaW5wdXQgPSAnPGlucHV0IGNsYXNzPVwiJyArIChkYXRhLmlucHV0Q2xhc3MgfHwgJycpICsgJ1wiIHZhbHVlPVwiJyArIChkYXRhLnZhbHVlIHx8ICcnKSArICdcIj4nO1xuICAgIGlmIChkYXRhLmxhYmVsKSB7XG4gICAgICBpbnB1dCA9ICc8bGFiZWw+PHNwYW4+JyArIGRhdGEubGFiZWwgKyAnPC9zcGFuPicgKyBpbnB1dCArICc8L2xhYmVsPic7XG4gICAgfVxuICAgIGlmIChkYXRhLnBhcmVudCkge1xuICAgICAgaW5wdXQgPSAnPCcgKyBkYXRhLnBhcmVudCArICc+JyArIGlucHV0ICsgJzwvJyArIGRhdGEucGFyZW50ICsgJz4nO1xuICAgIH1cbiAgICBpbnB1dCA9ICQoaW5wdXQpO1xuXG4gICAgaWYgKGRhdGEub25DaGFuZ2UpIHtcbiAgICAgIHZhciBvbkNoYW5nZTtcbiAgICAgIGlmIChkYXRhLmJpbmQpIHtcbiAgICAgICAgZGF0YS5iaW5kLmlucHV0ID0gaW5wdXQuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgb25DaGFuZ2UgPSBkYXRhLm9uQ2hhbmdlLmJpbmQoZGF0YS5iaW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGlucHV0LmZpbmQoJ2lucHV0JykpO1xuICAgICAgfVxuICAgICAgaW5wdXQuZmluZCgnaW5wdXQnKS5vbignY2hhbmdlJywgb25DaGFuZ2UpXG4gICAgfVxuICAgIHJldHVybiBpbnB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlblNlbGVjdChkYXRhKSB7XG4gICAgdmFyIGlucHV0ID0gJCgnPHNlbGVjdC8+Jyk7XG5cbiAgICB2YXIgZWwgPSBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXTtcbiAgICBpZiAoZGF0YS5pbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgIGVsID0gZWxbZGF0YS5pbmRleF07XG4gICAgfVxuXG4gICAgaWYgKGVsW2RhdGEucGFyYW1dKSB7XG4gICAgICBkYXRhLnZhbHVlID0gZWxbZGF0YS5wYXJhbV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGEudmFsdWUgPSAwO1xuICAgIH1cblxuICAgIGlmIChkYXRhLnN0YXJ0X29wdGlvbikge1xuICAgICAgaW5wdXQuYXBwZW5kKGRhdGEuc3RhcnRfb3B0aW9uKVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5saXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsO1xuICAgICAgdmFyIHR4dCA9IGRhdGEubGlzdFtpXTtcbiAgICAgIGlmIChkYXRhLnZhbF90eXBlID09IDApIHtcbiAgICAgICAgdmFsID0gZGF0YS5saXN0W2ldO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbF90eXBlID09IDEpIHtcbiAgICAgICAgdmFsID0gaTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWxfdHlwZSA9PSAyKSB7XG4gICAgICAgIC8vdmFsPWRhdGEudmFsX2xpc3RbaV07XG4gICAgICAgIHZhbCA9IGk7XG4gICAgICAgIHR4dCA9IGRhdGEudmFsX2xpc3RbaV07XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWwgPSAodmFsID09IGRhdGEudmFsdWUgPyAnc2VsZWN0ZWQnIDogJycpO1xuICAgICAgaWYgKHNlbCA9PSAnc2VsZWN0ZWQnKSB7XG4gICAgICAgIGlucHV0LmF0dHIoJ3RfdmFsJywgZGF0YS5saXN0W2ldKTtcbiAgICAgIH1cbiAgICAgIHZhciBvcHRpb24gPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyB2YWwgKyAnXCIgJyArIHNlbCArICc+JyArIHR4dCArICc8L29wdGlvbj4nO1xuICAgICAgaWYgKGRhdGEudmFsX3R5cGUgPT0gMikge1xuICAgICAgICBvcHRpb24gPSAkKG9wdGlvbikuYXR0cignY29kZScsIGRhdGEubGlzdFtpXSk7XG4gICAgICB9XG4gICAgICBpbnB1dC5hcHBlbmQob3B0aW9uKVxuICAgIH1cblxuICAgIGlucHV0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhID0gdGhpcztcbiAgICAgIHZhciB2YWwgPSBkYXRhLmVsLnZhbCgpO1xuICAgICAgdmFyIHNsX29wID0gZGF0YS5lbC5maW5kKCdvcHRpb25bdmFsdWU9JyArIHZhbCArICddJyk7XG4gICAgICB2YXIgY2xzID0gc2xfb3AudGV4dCgpO1xuICAgICAgdmFyIGNoID0gc2xfb3AuYXR0cignY29kZScpO1xuICAgICAgaWYgKCFjaCljaCA9IGNscztcbiAgICAgIGlmIChkYXRhLmluZGV4ICE9PSBmYWxzZSkge1xuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLmluZGV4XVtkYXRhLnBhcmFtXSA9IHZhbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdW2RhdGEucGFyYW1dID0gdmFsO1xuICAgICAgfVxuXG4gICAgICBkYXRhLm9iai5yZW1vdmVDbGFzcyhkYXRhLnByZWZpeCArIGRhdGEuZWwuYXR0cigndF92YWwnKSk7XG4gICAgICBkYXRhLm9iai5hZGRDbGFzcyhkYXRhLnByZWZpeCArIGNoKTtcbiAgICAgIGRhdGEuZWwuYXR0cigndF92YWwnLCBjaCk7XG5cbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgZWw6IGlucHV0LFxuICAgICAgb2JqOiBkYXRhLm9iaixcbiAgICAgIGdyOiBkYXRhLmdyLFxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTogZGF0YS5wYXJhbSxcbiAgICAgIHByZWZpeDogZGF0YS5wcmVmaXggfHwgJydcbiAgICB9KSk7XG5cbiAgICBpZiAoZGF0YS5wYXJlbnQpIHtcbiAgICAgIHZhciBwYXJlbnQgPSAkKCc8JyArIGRhdGEucGFyZW50ICsgJy8+Jyk7XG4gICAgICBwYXJlbnQuYXBwZW5kKGlucHV0KTtcbiAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBpbnB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKGRhdGEpIHtcbiAgICB2YXIgYW5pbV9zZWwgPSBbXTtcbiAgICB2YXIgb3V0O1xuXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5TaG93IGFuaW1hdGlvbjwvc3Bhbj4nKTtcbiAgICB9XG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogc2hvd19hbmltYXRpb25zLFxuICAgICAgdmFsX3R5cGU6IDAsXG4gICAgICBvYmo6IGRhdGEub2JqLFxuICAgICAgZ3I6IGRhdGEuZ3IsXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOiAnc2hvd19hbmltYXRpb24nLFxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcbiAgICB9KSk7XG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5TaG93IGRlbGF5PC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBzaG93X2RlbGF5LFxuICAgICAgdmFsX3R5cGU6IDEsXG4gICAgICBvYmo6IGRhdGEub2JqLFxuICAgICAgZ3I6IGRhdGEuZ3IsXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOiAnc2hvd19kZWxheScsXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxuICAgIH0pKTtcblxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPGJyLz4nKTtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPkhpZGUgYW5pbWF0aW9uPC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBoaWRlX2FuaW1hdGlvbnMsXG4gICAgICB2YWxfdHlwZTogMCxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ICdoaWRlX2FuaW1hdGlvbicsXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxuICAgIH0pKTtcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPkhpZGUgZGVsYXk8L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IGhpZGVfZGVsYXksXG4gICAgICB2YWxfdHlwZTogMSxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ICdoaWRlX2RlbGF5JyxcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XG4gICAgfSkpO1xuXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XG4gICAgICBvdXQgPSAkKCc8ZGl2IGNsYXNzPVwiYW5pbV9zZWxcIi8+Jyk7XG4gICAgICBvdXQuYXBwZW5kKGFuaW1fc2VsKTtcbiAgICB9XG4gICAgaWYgKGRhdGEudHlwZSA9PSAxKSB7XG4gICAgICBvdXQgPSBhbmltX3NlbDtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdF9lZGl0b3IoKSB7XG4gICAgJCgnI3cxJykucmVtb3ZlKCk7XG4gICAgJCgnI3cxX2J1dHRvbicpLnJlbW92ZSgpO1xuICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9IHNsaWRlcl9kYXRhWzBdLm1vYmlsZS5zcGxpdCgnPycpWzBdO1xuXG4gICAgdmFyIGVsID0gJCgnI21lZ2Ffc2xpZGVyX2NvbnRyb2xlJyk7XG4gICAgdmFyIGJ0bnNfYm94ID0gJCgnPGRpdiBjbGFzcz1cImJ0bl9ib3hcIi8+Jyk7XG5cbiAgICBlbC5hcHBlbmQoJzxoMj7Qo9C/0YDQsNCy0LvQtdC90LjQtTwvaDI+Jyk7XG4gICAgZWwuYXBwZW5kKCQoJzx0ZXh0YXJlYS8+Jywge1xuICAgICAgdGV4dDogSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pLFxuICAgICAgaWQ6ICdzbGlkZV9kYXRhJyxcbiAgICAgIG5hbWU6IGVkaXRvclxuICAgIH0pKTtcblxuICAgIHZhciBidG4gPSAkKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQkNC60YLQuNCy0LjRgNC+0LLQsNGC0Ywg0YHQu9Cw0LnQtFwiKTtcbiAgICBidG5zX2JveC5hcHBlbmQoYnRuKTtcbiAgICBidG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdoaWRlX3NsaWRlJyk7XG4gICAgfSk7XG5cbiAgICB2YXIgYnRuID0gJCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JTQtdCw0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xuICAgIGJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcbiAgICB9KTtcbiAgICBlbC5hcHBlbmQoYnRuc19ib3gpO1xuXG4gICAgZWwuYXBwZW5kKCc8aDI+0J7QsdGJ0LjQtSDQv9Cw0YDQsNC80LXRgtGA0Ys8L2gyPicpO1xuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0ubW9iaWxlLFxuICAgICAgbGFiZWw6IFwi0KHQu9Cw0LnQtCDQtNC70Y8g0YLQtdC70LXRhNC+0L3QsFwiLFxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSAkKHRoaXMpLnZhbCgpXG4gICAgICAgICQoJy5tb2JfYmcnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnKScpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5mb24sXG4gICAgICBsYWJlbDogXCLQntGB0L3QvtC90L7QuSDRhNC+0L1cIixcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uZm9uID0gJCh0aGlzKS52YWwoKVxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgc2xpZGVyX2RhdGFbMF0uZm9uICsgJyknKVxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdmFyIGJ0bl9jaCA9ICQoJzxkaXYgY2xhc3M9XCJidG5zXCIvPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoJzxoMz7QmtC90L7Qv9C60LAg0L/QtdGA0LXRhdC+0LTQsCjQtNC70Y8g0J/QmiDQstC10YDRgdC40LgpPC9oMz4nKTtcbiAgICBidG5fY2guYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCxcbiAgICAgIGxhYmVsOiBcItCi0LXQutGB0YJcIixcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0ID0gJCh0aGlzKS52YWwoKTtcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS50ZXh0KHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0KTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfSxcbiAgICB9KSk7XG5cbiAgICB2YXIgYnV0X3NsID0gJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKTtcbiAgICBidG5fY2guYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5idXR0b24uaHJlZixcbiAgICAgIGxhYmVsOiBcItCh0YHRi9C70LrQsFwiLFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uYnV0dG9uLmhyZWYgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApLmF0dHIoJ2hyZWYnLHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfSxcbiAgICB9KSk7XG5cbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xuICAgIHZhciB3cmFwX2xhYiA9ICQoJzxsYWJlbC8+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZCh3cmFwX2xhYik7XG4gICAgd3JhcF9sYWIuYXBwZW5kKCc8c3Bhbj7QntGE0L7RgNC80LvQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XG4gICAgd3JhcF9sYWIuYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBidG5fc3R5bGUsXG4gICAgICB2YWxfdHlwZTogMCxcbiAgICAgIG9iajogYnV0X3NsLFxuICAgICAgZ3I6ICdidXR0b24nLFxuICAgICAgaW5kZXg6IGZhbHNlLFxuICAgICAgcGFyYW06ICdjb2xvcidcbiAgICB9KSk7XG5cbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xuICAgIHdyYXBfbGFiID0gJCgnPGxhYmVsLz4nKTtcbiAgICBidG5fY2guYXBwZW5kKHdyYXBfbGFiKTtcbiAgICB3cmFwX2xhYi5hcHBlbmQoJzxzcGFuPtCf0L7Qu9C+0LbQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XG4gICAgd3JhcF9sYWIuYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBwb3NBcnIsXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXG4gICAgICB2YWxfdHlwZTogMixcbiAgICAgIG9iajogYnV0X3NsLnBhcmVudCgpLnBhcmVudCgpLFxuICAgICAgZ3I6ICdidXR0b24nLFxuICAgICAgaW5kZXg6IGZhbHNlLFxuICAgICAgcGFyYW06ICdwb3MnXG4gICAgfSkpO1xuXG4gICAgYnRuX2NoLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XG4gICAgICB0eXBlOiAwLFxuICAgICAgb2JqOiBidXRfc2wucGFyZW50KCksXG4gICAgICBncjogJ2J1dHRvbicsXG4gICAgICBpbmRleDogZmFsc2VcbiAgICB9KSk7XG4gICAgZWwuYXBwZW5kKGJ0bl9jaCk7XG5cbiAgICB2YXIgbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwiZml4ZWRfbGF5ZXJcIi8+Jyk7XG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0KHRgtCw0YLQuNGH0LXRgdC60LjQtSDRgdC70L7QuDwvaDI+Jyk7XG4gICAgdmFyIHRoID0gXCI8dGg+4oSWPC90aD5cIiArXG4gICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIiArXG4gICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCh0LvQvtC5INC90LAg0LLRgdGOINCy0YvRgdC+0YLRgzwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiICtcbiAgICAgIFwiPHRoPtCX0LDQtNC10YDQttC60LAg0L/QvtGP0LLQu9C10L3QuNGPPC90aD5cIiArXG4gICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiICtcbiAgICAgIFwiPHRoPtCU0LXQudGB0YLQstC40LU8L3RoPlwiO1xuICAgIHN0VGFibGUgPSAkKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nICsgdGggKyAnPC90cj48L3RhYmxlPicpO1xuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICB2YXIgZGF0YSA9IHNsaWRlcl9kYXRhWzBdLmZpeGVkO1xuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFkZFRyU3RhdGljKGRhdGFbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXllci5hcHBlbmQoc3RUYWJsZSk7XG4gICAgdmFyIGFkZEJ0biA9ICQoJzxidXR0b24vPicsIHtcbiAgICAgIHRleHQ6IFwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXG4gICAgfSk7XG4gICAgYWRkQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBkYXRhID0gYWRkVHJTdGF0aWMoZmFsc2UpO1xuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxuICAgIH0pKTtcbiAgICBsYXllci5hcHBlbmQoYWRkQnRuKTtcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xuXG4gICAgdmFyIGxheWVyID0gJCgnPGRpdiBjbGFzcz1cInBhcmFsYXhfbGF5ZXJcIi8+Jyk7XG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0J/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuDwvaDI+Jyk7XG4gICAgdmFyIHRoID0gXCI8dGg+4oSWPC90aD5cIiArXG4gICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIiArXG4gICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCj0LTQsNC70LXQvdC90L7RgdGC0YwgKNGG0LXQu9C+0LUg0L/QvtC70L7QttC40YLQtdC70YzQvdC+0LUg0YfQuNGB0LvQvik8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCU0LXQudGB0YLQstC40LU8L3RoPlwiO1xuXG4gICAgcGFyYWxheFRhYmxlID0gJCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+JyArIHRoICsgJzwvdHI+PC90YWJsZT4nKTtcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVswXS5wYXJhbGF4O1xuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFkZFRyUGFyYWxheChkYXRhW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGF5ZXIuYXBwZW5kKHBhcmFsYXhUYWJsZSk7XG4gICAgdmFyIGFkZEJ0biA9ICQoJzxidXR0b24vPicsIHtcbiAgICAgIHRleHQ6IFwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXG4gICAgfSk7XG4gICAgYWRkQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBkYXRhID0gYWRkVHJQYXJhbGF4KGZhbHNlKTtcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcbiAgICB9KSk7XG5cbiAgICBsYXllci5hcHBlbmQoYWRkQnRuKTtcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xuXG4gICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGVsLmZpbmQoJy5maWxlU2VsZWN0JykpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkVHJTdGF0aWMoZGF0YSkge1xuICAgIHZhciBpID0gc3RUYWJsZS5maW5kKCd0cicpLmxlbmd0aCAtIDE7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICBkYXRhID0ge1xuICAgICAgICBcImltZ1wiOiBcIlwiLFxuICAgICAgICBcImZ1bGxfaGVpZ2h0XCI6IDAsXG4gICAgICAgIFwicG9zXCI6IDAsXG4gICAgICAgIFwic2hvd19kZWxheVwiOiAxLFxuICAgICAgICBcInNob3dfYW5pbWF0aW9uXCI6IFwibGlnaHRTcGVlZEluXCIsXG4gICAgICAgIFwiaGlkZV9kZWxheVwiOiAxLFxuICAgICAgICBcImhpZGVfYW5pbWF0aW9uXCI6IFwiYm91bmNlT3V0XCJcbiAgICAgIH07XG4gICAgICBzbGlkZXJfZGF0YVswXS5maXhlZC5wdXNoKGRhdGEpO1xuICAgICAgdmFyIGZpeCA9ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAnKTtcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCwgdHJ1ZSk7XG4gICAgfVxuICAgIDtcblxuICAgIHZhciB0ciA9ICQoJzx0ci8+Jyk7XG4gICAgdHIuYXBwZW5kKCc8dGQgY2xhc3M9XCJ0ZF9jb3VudGVyXCIvPicpO1xuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogZGF0YS5pbWcsXG4gICAgICBsYWJlbDogZmFsc2UsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcbiAgICAgIGJpbmQ6IHtcbiAgICAgICAgZ3I6ICdmaXhlZCcsXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwYXJhbTogJ2ltZycsXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxuICAgICAgfSxcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbnB1dC52YWwoKSArICcpJyk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkW2RhdGEuaW5kZXhdLmltZyA9IGRhdGEuaW5wdXQudmFsKCk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBwb3NBcnIsXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXG4gICAgICB2YWxfdHlwZTogMixcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXG4gICAgICBncjogJ2ZpeGVkJyxcbiAgICAgIGluZGV4OiBpLFxuICAgICAgcGFyYW06ICdwb3MnLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHllc19ub192YWwsXG4gICAgICB2YWxfbGlzdDogeWVzX25vX2FycixcbiAgICAgIHZhbF90eXBlOiAyLFxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKSxcbiAgICAgIGdyOiAnZml4ZWQnLFxuICAgICAgaW5kZXg6IGksXG4gICAgICBwYXJhbTogJ2Z1bGxfaGVpZ2h0JyxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcbiAgICAgIHR5cGU6IDEsXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcbiAgICAgIGdyOiAnZml4ZWQnLFxuICAgICAgaW5kZXg6IGksXG4gICAgICBwYXJlbnQ6ICd0ZCdcbiAgICB9KSk7XG4gICAgdmFyIGRlbEJ0biA9ICQoJzxidXR0b24vPicsIHtcbiAgICAgIHRleHQ6IFwi0KPQtNCw0LvQuNGC0YxcIlxuICAgIH0pO1xuICAgIGRlbEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzLmVsKTtcbiAgICAgIGkgPSAkdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCkgLSAxO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHQu9C+0Lkg0L3QsCDRgdC70LDQudC00LXRgNC1XG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5maXhlZC5zcGxpY2UoaSwgMSk7IC8v0YPQtNCw0LvRj9C10Lwg0LjQtyDQutC+0L3RhNC40LPQsCDRgdC70LDQudC00LBcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBlbDogZGVsQnRuLFxuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXG4gICAgfSkpO1xuICAgIHZhciBkZWxCdG5UZCA9ICQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcbiAgICBzdFRhYmxlLmFwcGVuZCh0cilcblxuICAgIHJldHVybiB7XG4gICAgICBlZGl0b3I6IHRyLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFRyUGFyYWxheChkYXRhKSB7XG4gICAgdmFyIGkgPSBwYXJhbGF4VGFibGUuZmluZCgndHInKS5sZW5ndGggLSAxO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgZGF0YSA9IHtcbiAgICAgICAgXCJpbWdcIjogXCJcIixcbiAgICAgICAgXCJ6XCI6IDFcbiAgICAgIH07XG4gICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4LnB1c2goZGF0YSk7XG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwJyk7XG4gICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YSwgcGFyYWxheF9ncik7XG4gICAgfVxuICAgIDtcbiAgICB2YXIgdHIgPSAkKCc8dHIvPicpO1xuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IGRhdGEuaW1nLFxuICAgICAgbGFiZWw6IGZhbHNlLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXG4gICAgICBiaW5kOiB7XG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwYXJhbTogJ2ltZycsXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLmZpbmQoJ3NwYW4nKSxcbiAgICAgIH0sXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgICAgIGRhdGEub2JqLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW5wdXQudmFsKCkgKyAnKScpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLmltZyA9IGRhdGEuaW5wdXQudmFsKCk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBwb3NBcnIsXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXG4gICAgICB2YWxfdHlwZTogMixcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLmZpbmQoJ3NwYW4nKSxcbiAgICAgIGdyOiAncGFyYWxheCcsXG4gICAgICBpbmRleDogaSxcbiAgICAgIHBhcmFtOiAncG9zJyxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICAgIHN0YXJ0X29wdGlvbjogJzxvcHRpb24gdmFsdWU9XCJcIiBjb2RlPVwiXCI+0L3QsCDQstC10YHRjCDRjdC60YDQsNC9PC9vcHRpb24+J1xuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IGRhdGEueixcbiAgICAgIGxhYmVsOiBmYWxzZSxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICAgIGJpbmQ6IHtcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcbiAgICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSksXG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgICAgICBkYXRhLm9iai5hdHRyKCd6JywgZGF0YS5pbnB1dC52YWwoKSk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0ueiA9IGRhdGEuaW5wdXQudmFsKCk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICB2YXIgZGVsQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xuICAgICAgdGV4dDogXCLQo9C00LDQu9C40YLRjFwiXG4gICAgfSk7XG4gICAgZGVsQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMuZWwpO1xuICAgICAgaSA9ICR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKSAtIDE7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcbiAgICAgICR0aGlzLmNsb3Nlc3QoJ3RyJykucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHRgtGA0L7QutGDINCyINGC0LDQsdC70LjRhtC1XG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLnBhcmFsYXguc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgZWw6IGRlbEJ0bixcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxuICAgIH0pKTtcbiAgICB2YXIgZGVsQnRuVGQgPSAkKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xuICAgIHRyLmFwcGVuZChkZWxCdG5UZCk7XG4gICAgcGFyYWxheFRhYmxlLmFwcGVuZCh0cilcblxuICAgIHJldHVybiB7XG4gICAgICBlZGl0b3I6IHRyLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZF9hbmltYXRpb24oZWwsIGRhdGEpIHtcbiAgICB2YXIgb3V0ID0gJCgnPGRpdi8+Jywge1xuICAgICAgJ2NsYXNzJzogJ2FuaW1hdGlvbl9sYXllcidcbiAgICB9KTtcblxuICAgIGlmICh0eXBlb2YoZGF0YS5zaG93X2RlbGF5KSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgb3V0LmFkZENsYXNzKHNob3dfZGVsYXlbZGF0YS5zaG93X2RlbGF5XSk7XG4gICAgICBpZiAoZGF0YS5zaG93X2FuaW1hdGlvbikge1xuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycgKyBkYXRhLnNob3dfYW5pbWF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mKGRhdGEuaGlkZV9kZWxheSkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG91dC5hZGRDbGFzcyhoaWRlX2RlbGF5W2RhdGEuaGlkZV9kZWxheV0pO1xuICAgICAgaWYgKGRhdGEuaGlkZV9hbmltYXRpb24pIHtcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nICsgZGF0YS5oaWRlX2FuaW1hdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZWwuYXBwZW5kKG91dCk7XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVfc2xpZGUoZGF0YSkge1xuICAgIHZhciBzbGlkZSA9ICQoJzxkaXYgY2xhc3M9XCJzbGlkZVwiLz4nKTtcblxuICAgIHZhciBtb2JfYmcgPSAkKCc8YSBjbGFzcz1cIm1vYl9iZ1wiIGhyZWY9XCInICsgZGF0YS5idXR0b24uaHJlZiArICdcIi8+Jyk7XG4gICAgbW9iX2JnLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEubW9iaWxlICsgJyknKVxuXG4gICAgc2xpZGUuYXBwZW5kKG1vYl9iZyk7XG4gICAgaWYgKG1vYmlsZV9tb2RlKSB7XG4gICAgICByZXR1cm4gc2xpZGU7XG4gICAgfVxuXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDRhNC+0L0g0YLQviDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICBpZiAoZGF0YS5mb24pIHtcbiAgICAgIHNsaWRlLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuZm9uICsgJyknKVxuICAgIH1cblxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICBpZiAoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fZ3JvdXBcIi8+Jyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGFyYWxheC5sZW5ndGg7IGkrKykge1xuICAgICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YS5wYXJhbGF4W2ldLCBwYXJhbGF4X2dyKVxuICAgICAgfVxuICAgICAgc2xpZGUuYXBwZW5kKHBhcmFsYXhfZ3IpXG4gICAgfVxuXG4gICAgdmFyIGZpeCA9ICQoJzxkaXYgY2xhc3M9XCJmaXhlZF9ncm91cFwiLz4nKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuZml4ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEuZml4ZWRbaV0sIGZpeClcbiAgICB9XG5cbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5idXR0b24ucG9zXSk7XG4gICAgdmFyIGJ1dCA9ICQoXCI8YSBjbGFzcz0nc2xpZGVyX19ocmVmJy8+XCIpO1xuICAgIGJ1dC5hdHRyKCdocmVmJywgZGF0YS5idXR0b24uaHJlZik7XG4gICAgYnV0LnRleHQoZGF0YS5idXR0b24udGV4dCk7XG4gICAgYnV0LmFkZENsYXNzKGRhdGEuYnV0dG9uLmNvbG9yKTtcbiAgICBkb3BfYmxrID0gYWRkX2FuaW1hdGlvbihkb3BfYmxrLCBkYXRhLmJ1dHRvbik7XG4gICAgZG9wX2Jsay5maW5kKCdkaXYnKS5hcHBlbmQoYnV0KTtcbiAgICBmaXguYXBwZW5kKGRvcF9ibGspO1xuXG4gICAgc2xpZGUuYXBwZW5kKGZpeCk7XG4gICAgcmV0dXJuIHNsaWRlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkUGFyYWxheExheWVyKGRhdGEsIHBhcmFsYXhfZ3IpIHtcbiAgICB2YXIgcGFyYWxsYXhfbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2xheWVyXCJcXD4nKTtcbiAgICBwYXJhbGxheF9sYXllci5hdHRyKCd6JywgZGF0YS56IHx8IGkgKiAxMCk7XG4gICAgdmFyIGRvcF9ibGsgPSAkKFwiPHNwYW4gY2xhc3M9J3NsaWRlcl9fdGV4dCcvPlwiKTtcbiAgICBpZiAoZGF0YS5wb3MpIHtcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XG4gICAgfVxuICAgIGRvcF9ibGsuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xuICAgIHBhcmFsbGF4X2xheWVyLmFwcGVuZChkb3BfYmxrKTtcbiAgICBwYXJhbGF4X2dyLmFwcGVuZChwYXJhbGxheF9sYXllcik7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTdGF0aWNMYXllcihkYXRhLCBmaXgsIGJlZm9yX2J1dHRvbikge1xuICAgIHZhciBkb3BfYmxrID0gJChcIjxkaXYgY2xhc3M9J2ZpeGVkX19sYXllcicvPlwiKTtcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLnBvc10pO1xuICAgIGlmIChkYXRhLmZ1bGxfaGVpZ2h0KSB7XG4gICAgICBkb3BfYmxrLmFkZENsYXNzKCdmaXhlZF9fZnVsbC1oZWlnaHQnKTtcbiAgICB9XG4gICAgZG9wX2JsayA9IGFkZF9hbmltYXRpb24oZG9wX2JsaywgZGF0YSk7XG4gICAgZG9wX2Jsay5maW5kKCcuYW5pbWF0aW9uX2xheWVyJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xuXG4gICAgaWYgKGJlZm9yX2J1dHRvbikge1xuICAgICAgZml4LmZpbmQoJy5zbGlkZXJfX2hyZWYnKS5jbG9zZXN0KCcuZml4ZWRfX2xheWVyJykuYmVmb3JlKGRvcF9ibGspXG4gICAgfSBlbHNlIHtcbiAgICAgIGZpeC5hcHBlbmQoZG9wX2JsaylcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xuICAgIGlmICgkKCcjbWVnYV9zbGlkZXInKS5oYXNDbGFzcygnc3RvcF9zbGlkZScpKXJldHVybjtcblxuICAgIHZhciBzbGlkZV9wb2ludHMgPSAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVfc2VsZWN0JylcbiAgICB2YXIgc2xpZGVfY250ID0gc2xpZGVfcG9pbnRzLmxlbmd0aDtcbiAgICB2YXIgYWN0aXZlID0gJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5pbmRleCgpICsgMTtcbiAgICBpZiAoYWN0aXZlID49IHNsaWRlX2NudClhY3RpdmUgPSAwO1xuICAgIHNsaWRlX3BvaW50cy5lcShhY3RpdmUpLmNsaWNrKCk7XG5cbiAgICB0aW1lb3V0SWQ9c2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGltZ190b19sb2FkKHNyYykge1xuICAgIHZhciBpbWcgPSAkKCc8aW1nLz4nKTtcbiAgICBpbWcub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0b3RfaW1nX3dhaXQtLTtcblxuICAgICAgaWYgKHRvdF9pbWdfd2FpdCA9PSAwKSB7XG5cbiAgICAgICAgc2xpZGVzLmFwcGVuZChnZW5lcmF0ZV9zbGlkZShzbGlkZXJfZGF0YVtyZW5kZXJfc2xpZGVfbm9tXSkpO1xuICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEocmVuZGVyX3NsaWRlX25vbSkucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cbiAgICAgICAgaWYgKHJlbmRlcl9zbGlkZV9ub20gPT0gMCkge1xuICAgICAgICAgIHNsaWRlcy5maW5kKCcuc2xpZGUnKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93JylcbiAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuXG4gICAgICAgICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgICAgICAgIGlmKHRpbWVvdXRJZCljbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgIHRpbWVvdXRJZD1zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuZmlyc3Rfc2hvdycpLnJlbW92ZUNsYXNzKCdmaXJzdF9zaG93Jyk7XG4gICAgICAgICAgICB9LmJpbmQoc2xpZGVzKSwgc2Nyb2xsX3BlcmlvZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1vYmlsZV9tb2RlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XG4gICAgICAgICAgICBwYXJhbGxheF9jb3VudGVyID0gMDtcbiAgICAgICAgICAgIHBhcmFsbGF4X3RpbWVyID0gc2V0SW50ZXJ2YWwocmVuZGVyLCAxMDApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChlZGl0b3IpIHtcbiAgICAgICAgICAgIGluaXRfZWRpdG9yKClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYodGltZW91dElkKWNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcblxuICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3gnKS5vbignY2xpY2snLCAnLnNsaWRlX3NlbGVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdzbGlkZXItYWN0aXZlJykpcmV0dXJuO1xuXG4gICAgICAgICAgICAgIHZhciBpbmRleCA9ICR0aGlzLmluZGV4KCk7XG4gICAgICAgICAgICAgICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcblxuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlJykuZXEoaW5kZXgpLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG5cbiAgICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuaG92ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBpZih0aW1lb3V0SWQpY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmFkZENsYXNzKCdzdG9wX3NsaWRlJyk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLnJlbW92ZUNsYXNzKCdzdG9wX3NsaWRlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZW5kZXJfc2xpZGVfbm9tKys7XG4gICAgICAgIGlmIChyZW5kZXJfc2xpZGVfbm9tIDwgc2xpZGVyX2RhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgbG9hZF9zbGlkZV9pbWcoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkub24oJ2Vycm9yJywgZnVuY3Rpb24gKCkge1xuICAgICAgdG90X2ltZ193YWl0LS07XG4gICAgfSk7XG4gICAgaW1nLnByb3AoJ3NyYycsIHNyYyk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2FkX3NsaWRlX2ltZygpIHtcbiAgICB2YXIgZGF0YSA9IHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dO1xuICAgIHRvdF9pbWdfd2FpdCA9IDE7XG5cbiAgICBpZiAobW9iaWxlX21vZGUgPT09IGZhbHNlKSB7XG4gICAgICB0b3RfaW1nX3dhaXQrKztcbiAgICAgIGltZ190b19sb2FkKGRhdGEuZm9uKTtcbiAgICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICAgIGlmIChkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEucGFyYWxheC5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5wYXJhbGF4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5wYXJhbGF4W2ldLmltZylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGRhdGEuZml4ZWQgJiYgZGF0YS5maXhlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRvdF9pbWdfd2FpdCArPSBkYXRhLmZpeGVkLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmZpeGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5maXhlZFtpXS5pbWcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbWdfdG9fbG9hZChkYXRhLm1vYmlsZSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydF9pbml0X3NsaWRlKGRhdGEpIHtcbiAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHZhciBpbWcgPSAkKCc8aW1nLz4nKTtcbiAgICBpbWcuYXR0cigndGltZScsIG4pO1xuXG4gICAgZnVuY3Rpb24gb25faW1nX2xvYWQoKSB7XG4gICAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgaW1nID0gJCh0aGlzKTtcbiAgICAgIG4gPSBuIC0gcGFyc2VJbnQoaW1nLmF0dHIoJ3RpbWUnKSk7XG4gICAgICBpZiAobiA+IG1heF90aW1lX2xvYWRfcGljKSB7XG4gICAgICAgIG1vYmlsZV9tb2RlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBtYXhfc2l6ZSA9IChzY3JlZW4uaGVpZ2h0ID4gc2NyZWVuLndpZHRoID8gc2NyZWVuLmhlaWdodCA6IHNjcmVlbi53aWR0aCk7XG4gICAgICAgIGlmIChtYXhfc2l6ZSA8IG1vYmlsZV9zaXplKSB7XG4gICAgICAgICAgbW9iaWxlX21vZGUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vYmlsZV9tb2RlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtb2JpbGVfbW9kZSA9PSB0cnVlKSB7XG4gICAgICAgICQoY29udGFpbmVyX2lkKS5hZGRDbGFzcygnbW9iaWxlX21vZGUnKVxuICAgICAgfVxuICAgICAgcmVuZGVyX3NsaWRlX25vbSA9IDA7XG4gICAgICBsb2FkX3NsaWRlX2ltZygpO1xuICAgICAgJCgnLnNrLWZvbGRpbmctY3ViZScpLnJlbW92ZSgpO1xuICAgIH07XG5cbiAgICBpbWcub24oJ2xvYWQnLCBvbl9pbWdfbG9hZCgpKTtcbiAgICBpZiAoc2xpZGVyX2RhdGEubGVuZ3RoID4gMCkge1xuICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gc2xpZGVyX2RhdGFbMF0ubW9iaWxlICsgJz9yPScgKyBNYXRoLnJhbmRvbSgpO1xuICAgICAgaW1nLnByb3AoJ3NyYycsIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9uX2ltZ19sb2FkKCkuYmluZChpbWcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoZGF0YSwgZWRpdG9yX2luaXQpIHtcbiAgICBzbGlkZXJfZGF0YSA9IGRhdGE7XG4gICAgZWRpdG9yID0gZWRpdG9yX2luaXQ7XG4gICAgLy/QvdCw0YXQvtC00LjQvCDQutC+0L3RgtC10LnQvdC10YAg0Lgg0L7Rh9C40YnQsNC10Lwg0LXQs9C+XG4gICAgdmFyIGNvbnRhaW5lciA9ICQoY29udGFpbmVyX2lkKTtcbiAgICBjb250YWluZXIuaHRtbCgnJyk7XG5cbiAgICAvL9GB0L7Qt9C20LDQtdC8INCx0LDQt9C+0LLRi9C1INC60L7QvdGC0LXQudC90LXRgNGLINC00LvRjyDRgdCw0LzQuNGFINGB0LvQsNC50LTQvtCyINC4INC00LvRjyDQv9C10YDQtdC60LvRjtGH0LDRgtC10LvQtdC5XG4gICAgc2xpZGVzID0gJCgnPGRpdi8+Jywge1xuICAgICAgJ2NsYXNzJzogJ3NsaWRlcydcbiAgICB9KTtcbiAgICB2YXIgc2xpZGVfY29udHJvbCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICdjbGFzcyc6ICdzbGlkZV9jb250cm9sJ1xuICAgIH0pO1xuICAgIHNsaWRlX3NlbGVjdF9ib3ggPSAkKCc8dWwvPicsIHtcbiAgICAgICdjbGFzcyc6ICdzbGlkZV9zZWxlY3RfYm94J1xuICAgIH0pO1xuXG4gICAgLy/QtNC+0LHQsNCy0LvRj9C10Lwg0LjQvdC00LjQutCw0YLQvtGAINC30LDQs9GA0YPQt9C60LhcbiAgICB2YXIgbCA9ICc8ZGl2IGNsYXNzPVwic2stZm9sZGluZy1jdWJlXCI+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUxIHNrLWN1YmVcIj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTIgc2stY3ViZVwiPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlNCBzay1jdWJlXCI+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUzIHNrLWN1YmVcIj48L2Rpdj4nICtcbiAgICAgICc8L2Rpdj4nO1xuICAgIGNvbnRhaW5lci5odG1sKGwpO1xuXG5cbiAgICBzdGFydF9pbml0X3NsaWRlKGRhdGFbMF0pO1xuXG4gICAgLy/Qs9C10L3QtdGA0LjRgNGD0LXQvCDQutC90L7Qv9C60Lgg0Lgg0YHQu9Cw0LnQtNGLXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvL3NsaWRlcy5hcHBlbmQoZ2VuZXJhdGVfc2xpZGUoZGF0YVtpXSkpO1xuICAgICAgc2xpZGVfc2VsZWN0X2JveC5hcHBlbmQoJzxsaSBjbGFzcz1cInNsaWRlX3NlbGVjdCBkaXNhYmxlZFwiLz4nKVxuICAgIH1cblxuICAgIC8qc2xpZGVzLmZpbmQoJy5zbGlkZScpLmVxKDApXG4gICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpXG4gICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpO1xuICAgICBzbGlkZV9jb250cm9sLmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTsqL1xuXG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZXMpO1xuICAgIHNsaWRlX2NvbnRyb2wuYXBwZW5kKHNsaWRlX3NlbGVjdF9ib3gpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVfY29udHJvbCk7XG5cblxuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGlmICghcGFyYWxsYXhfZ3JvdXApcmV0dXJuIGZhbHNlO1xuICAgIHZhciBwYXJhbGxheF9rID0gKHBhcmFsbGF4X2NvdW50ZXIgLSAxMCkgLyAyO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbGxheF9ncm91cC5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGVsID0gcGFyYWxsYXhfZ3JvdXAuZXEoaSk7XG4gICAgICB2YXIgaiA9IGVsLmF0dHIoJ3onKTtcbiAgICAgIHZhciB0ciA9ICdyb3RhdGUzZCgwLjEsMC44LDAsJyArIChwYXJhbGxheF9rKSArICdkZWcpIHNjYWxlKCcgKyAoMSArIGogKiAwLjUpICsgJykgdHJhbnNsYXRlWigtJyArICgxMCArIGogKiAyMCkgKyAncHgpJztcbiAgICAgIGVsLmNzcygndHJhbnNmb3JtJywgdHIpXG4gICAgfVxuICAgIHBhcmFsbGF4X2NvdW50ZXIgKz0gcGFyYWxsYXhfZCAqIDAuMTtcbiAgICBpZiAocGFyYWxsYXhfY291bnRlciA+PSAyMClwYXJhbGxheF9kID0gLXBhcmFsbGF4X2Q7XG4gICAgaWYgKHBhcmFsbGF4X2NvdW50ZXIgPD0gMClwYXJhbGxheF9kID0gLXBhcmFsbGF4X2Q7XG4gIH1cblxuICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoJCgnLmZpbGVTZWxlY3QnKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG59KCkpO1xuIiwidmFyIGhlYWRlckFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgdmFyIHNoYWRvd2VkRG93biA9IGZhbHNlO1xuXG4gICQoJy5tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcbiAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAkKCcuZHJvcC1tZW51JykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgaWYgKCQoJy5oZWFkZXInKS5oYXNDbGFzcygnaGVhZGVyX29wZW4tbWVudScpKSB7XG4gICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdub19zY3JvbGwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoJy5zZWFyY2gtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgICQoJy5hY2NvdW50LW1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgJCgnI2F1dG9jb21wbGV0ZScpLmZhZGVPdXQoKTtcbiAgICBpZiAoJCgnLmhlYWRlcicpLmhhc0NsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKSkge1xuICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG4gICAgfVxuICB9KTtcblxuICAkKCcjaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS50YXJnZXQuaWQgPT0gJ2hlYWRlcicpIHtcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCh0aGlzKS5jbG9zZXN0KCdmb3JtJykuc3VibWl0KCk7XG4gIH0pO1xuXG4gICQoJy5oZWFkZXItc2Vjb25kbGluZV9jbG9zZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcbiAgfSk7XG5cbiAgJCgnLmhlYWRlci11cGxpbmUnKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoIXNjcm9sbGVkRG93bilyZXR1cm47XG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgMTAyNCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcbiAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKCdsb2FkIHJlc2l6ZSBzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNoYWRvd0hlaWdodCA9IDUwO1xuICAgIHZhciBoaWRlSGVpZ2h0ID0gMjAwO1xuICAgIHZhciBoZWFkZXJTZWNvbmRMaW5lID0gJCgnLmhlYWRlci1zZWNvbmRsaW5lJyk7XG4gICAgdmFyIGhvdmVycyA9IGhlYWRlclNlY29uZExpbmUuZmluZCgnOmhvdmVyJyk7XG4gICAgdmFyIGhlYWRlciA9ICQoJy5oZWFkZXInKTtcblxuICAgIGlmICghaG92ZXJzLmxlbmd0aCkge1xuICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsYWJsZScpO1xuICAgICAgaGVhZGVyLnJlbW92ZUNsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgICAvL2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3BcbiAgICAgIHZhciBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gICAgICBpZiAoc2Nyb2xsVG9wID4gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gZmFsc2UpIHtcbiAgICAgICAgc2hhZG93ZWREb3duID0gdHJ1ZTtcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2hhZG93ZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmIChzY3JvbGxUb3AgPD0gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICBzaGFkb3dlZERvd24gPSBmYWxzZTtcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2hhZG93ZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmIChzY3JvbGxUb3AgPiBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gZmFsc2UpIHtcbiAgICAgICAgc2Nyb2xsZWREb3duID0gdHJ1ZTtcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsLWRvd24nKTtcbiAgICAgIH1cbiAgICAgIGlmIChzY3JvbGxUb3AgPD0gaGlkZUhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IHRydWUpIHtcbiAgICAgICAgc2Nyb2xsZWREb3duID0gZmFsc2U7XG4gICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcbiAgICAgIGhlYWRlci5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xuICAgIH1cbiAgfSk7XG5cbiAgJCgnLm1lbnVfYW5nbGUtZG93biwgLmRyb3AtbWVudV9ncm91cF9fdXAtaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgbWVudU9wZW4gPSAkKHRoaXMpLmNsb3Nlc3QoJy5oZWFkZXJfb3Blbi1tZW51LCAuY2F0YWxvZy1jYXRlZ29yaWVzJyk7XG4gICAgaWYgKCFtZW51T3Blbi5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIHBhcmVudCA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudV9ncm91cF9fdXAsIC5tZW51LWdyb3VwJyk7XG4gICAgdmFyIHBhcmVudE1lbnUgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnUnKTtcbiAgICBpZiAocGFyZW50TWVudSkge1xuICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgfVxuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgJChwYXJlbnQpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gICAgICBpZiAocGFyZW50Lmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgJChwYXJlbnQpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgIGlmIChwYXJlbnRNZW51KSB7XG4gICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmFkZENsYXNzKCdjbG9zZScpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgIGlmIChwYXJlbnRNZW51KSB7XG4gICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICB2YXIgYWNjb3VudE1lbnVUaW1lT3V0ID0gbnVsbDtcbiAgdmFyIGFjY291bnRNZW51T3BlblRpbWUgPSAwO1xuICB2YXIgYWNjb3VudE1lbnUgPSAkKCcuYWNjb3VudC1tZW51Jyk7XG5cbiAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPiAxMDI0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcbiAgICB2YXIgdGhhdCA9ICQodGhpcyk7XG5cbiAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XG5cbiAgICBpZiAoYWNjb3VudE1lbnUuaGFzQ2xhc3MoJ2hpZGRlbicpKSB7XG4gICAgICBtZW51QWNjb3VudFVwKHRoYXQpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoYXQucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgIGFjY291bnRNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgLy/Qv9C+0LrQsNC3INC80LXQvdGOINCw0LrQutCw0YPQvdGCXG4gIGZ1bmN0aW9uIG1lbnVBY2NvdW50VXAodG9nZ2xlQnV0dG9uKSB7XG4gICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xuICAgIHRvZ2dsZUJ1dHRvbi5hZGRDbGFzcygnb3BlbicpO1xuICAgIGFjY291bnRNZW51LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gMTAyNCkge1xuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgIH1cblxuICAgIGFjY291bnRNZW51T3BlblRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIGFjY291bnRNZW51VGltZU91dCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IDEwMjQpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xuICAgICAgfVxuICAgICAgaWYgKChuZXcgRGF0ZSgpIC0gYWNjb3VudE1lbnVPcGVuVGltZSkgPiAxMDAwICogNykge1xuICAgICAgICBhY2NvdW50TWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgIHRvZ2dsZUJ1dHRvbi5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XG4gICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcbiAgICAgIH1cblxuICAgIH0sIDEwMDApO1xuICB9XG5cbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllcy1hY2NvdW50X21lbnUtaGVhZGVyJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uICgpIHtcbiAgICBhY2NvdW50TWVudU9wZW5UaW1lID0gbmV3IERhdGUoKTtcbiAgfSk7XG4gICQoJy5hY2NvdW50LW1lbnUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGlmICgkKGUudGFyZ2V0KS5oYXNDbGFzcygnYWNjb3VudC1tZW51JykpIHtcbiAgICAgICQoZS50YXJnZXQpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICB9XG4gIH0pO1xufSgpO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIHBhcnNlTnVtKHN0cikge1xuICAgIHJldHVybiBwYXJzZUZsb2F0KFxuICAgICAgU3RyaW5nKHN0cilcbiAgICAgICAgLnJlcGxhY2UoJywnLCAnLicpXG4gICAgICAgIC5tYXRjaCgvLT9cXGQrKD86XFwuXFxkKyk/L2csICcnKSB8fCAwXG4gICAgICAsIDEwXG4gICAgKTtcbiAgfVxuXG4gICQoJy5zaG9ydC1jYWxjLWNhc2hiYWNrJykuZmluZCgnc2VsZWN0LGlucHV0Jykub24oJ2NoYW5nZSBrZXl1cCBjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLmNsb3Nlc3QoJy5zaG9ydC1jYWxjLWNhc2hiYWNrJyk7XG4gICAgdmFyIGN1cnMgPSBwYXJzZU51bSgkdGhpcy5maW5kKCdzZWxlY3QnKS52YWwoKSk7XG4gICAgdmFyIHZhbCA9ICR0aGlzLmZpbmQoJ2lucHV0JykudmFsKCk7XG4gICAgaWYgKHBhcnNlTnVtKHZhbCkgIT0gdmFsKSB7XG4gICAgICB2YWwgPSAkdGhpcy5maW5kKCdpbnB1dCcpLnZhbChwYXJzZU51bSh2YWwpKTtcbiAgICB9XG4gICAgdmFsID0gcGFyc2VOdW0odmFsKTtcblxuICAgIHZhciBrb2VmID0gJHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrJykudHJpbSgpO1xuICAgIHZhciBwcm9tbyA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1wcm9tbycpLnRyaW0oKTtcbiAgICB2YXIgY3VycmVuY3kgPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2stY3VycmVuY3knKS50cmltKCk7XG4gICAgdmFyIHJlc3VsdCA9IDA7XG4gICAgdmFyIG91dCA9IDA7XG5cbiAgICBpZiAoa29lZiA9PSBwcm9tbykge1xuICAgICAgcHJvbW8gPSAwO1xuICAgIH1cblxuICAgIGlmIChrb2VmLmluZGV4T2YoJyUnKSA+IDApIHtcbiAgICAgIHJlc3VsdCA9IHBhcnNlTnVtKGtvZWYpICogdmFsICogY3VycyAvIDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycyA9IHBhcnNlTnVtKCR0aGlzLmZpbmQoJ1tjb2RlPScgKyBjdXJyZW5jeSArICddJykudmFsKCkpO1xuICAgICAgcmVzdWx0ID0gcGFyc2VOdW0oa29lZikgKiBjdXJzXG4gICAgfVxuXG4gICAgaWYgKHBhcnNlTnVtKHByb21vKSA+IDApIHtcbiAgICAgIGlmIChwcm9tby5pbmRleE9mKCclJykgPiAwKSB7XG4gICAgICAgIHByb21vID0gcGFyc2VOdW0ocHJvbW8pICogdmFsICogY3VycyAvIDEwMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb21vID0gcGFyc2VOdW0ocHJvbW8pICogY3Vyc1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvbW8gPiAwKSB7XG4gICAgICAgIG91dCA9IFwiPHNwYW4gY2xhc3M9b2xkX3ByaWNlPlwiICsgcmVzdWx0LnRvRml4ZWQoMikgKyBcIjwvc3Bhbj4gXCIgKyBwcm9tby50b0ZpeGVkKDIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0ID0gcmVzdWx0LnRvRml4ZWQoMik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IHJlc3VsdC50b0ZpeGVkKDIpO1xuICAgIH1cblxuXG4gICAgJHRoaXMuZmluZCgnLmNhbGMtcmVzdWx0X3ZhbHVlJykuaHRtbChvdXQpXG4gIH0pLmNsaWNrKClcbn0pO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVscyA9ICQoJy5hdXRvX2hpZGVfY29udHJvbCcpO1xuICBpZiAoZWxzLmxlbmd0aCA9PSAwKXJldHVybjtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBcIi5zY3JvbGxfYm94LXNob3dfbW9yZVwiLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGJ1dHRvblllczogZmFsc2UsXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibm90aWZ5X3doaXRlIG5vdGlmeV9ub3RfYmlnXCJcbiAgICB9O1xuXG4gICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgIHZhciBjb250ZW50ID0gJHRoaXMuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbScpLmNsb25lKCk7XG4gICAgY29udGVudCA9IGNvbnRlbnRbMF07XG4gICAgY29udGVudC5jbGFzc05hbWUgKz0gJyBzY3JvbGxfYm94LWl0ZW0tbW9kYWwnO1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuY2xhc3NOYW1lID0gJ2NvbW1lbnRzJztcbiAgICBkaXYuYXBwZW5kKGNvbnRlbnQpO1xuICAgICQoZGl2KS5maW5kKCcuc2Nyb2xsX2JveC1zaG93X21vcmUnKS5yZW1vdmUoKTtcbiAgICAkKGRpdikuZmluZCgnLm1heF90ZXh0X2hpZGUnKVxuICAgICAgLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLXgyJylcbiAgICAgIC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZScpO1xuICAgIGRhdGEucXVlc3Rpb24gPSBkaXYub3V0ZXJIVE1MO1xuXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuICB9KTtcblxuICBmdW5jdGlvbiBoYXNTY3JvbGwoZWwpIHtcbiAgICBpZiAoIWVsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBlbC5zY3JvbGxIZWlnaHQgPiBlbC5jbGllbnRIZWlnaHQ7XG4gIH1cblxuICBmdW5jdGlvbiByZWJ1aWxkKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZWwgPSBlbHMuZXEoaSk7XG4gICAgICB2YXIgaXNfaGlkZSA9IGZhbHNlO1xuICAgICAgaWYgKGVsLmhlaWdodCgpIDwgMTApIHtcbiAgICAgICAgaXNfaGlkZSA9IHRydWU7XG4gICAgICAgIGVsLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0taGlkZScpLnNob3coMCk7XG4gICAgICB9XG5cbiAgICAgIHZhciB0ZXh0ID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtdGV4dCcpO1xuICAgICAgdmFyIGFuc3dlciA9IGVsLmZpbmQoJy5zY3JvbGxfYm94LWFuc3dlcicpO1xuICAgICAgdmFyIHNob3dfbW9yZSA9IGVsLmZpbmQoJy5zY3JvbGxfYm94LXNob3dfbW9yZScpO1xuXG4gICAgICB2YXIgc2hvd19idG4gPSBmYWxzZTtcbiAgICAgIGlmIChoYXNTY3JvbGwodGV4dFswXSkpIHtcbiAgICAgICAgc2hvd19idG4gPSB0cnVlO1xuICAgICAgICB0ZXh0LnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYW5zd2VyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy/QtdGB0YLRjCDQvtGC0LLQtdGCINCw0LTQvNC40L3QsFxuICAgICAgICBpZiAoaGFzU2Nyb2xsKGFuc3dlclswXSkpIHtcbiAgICAgICAgICBzaG93X2J0biA9IHRydWU7XG4gICAgICAgICAgYW5zd2VyLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbnN3ZXIuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzaG93X2J0bikge1xuICAgICAgICBzaG93X21vcmUuc2hvdygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2hvd19tb3JlLmhpZGUoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzX2hpZGUpIHtcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuaGlkZSgwKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAkKHdpbmRvdykucmVzaXplKHJlYnVpbGQpO1xuICByZWJ1aWxkKCk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcuc2hvd19hbGwnLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgY2xzID0gJCh0aGlzKS5kYXRhKCdjbnRybC1jbGFzcycpO1xuICAgICQoJy5oaWRlX2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcbiAgICAkKHRoaXMpLmhpZGUoKTtcbiAgICAkKCcuJyArIGNscykuc2hvdygpO1xuICB9KTtcblxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5oaWRlX2FsbCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBjbHMgPSAkKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XG4gICAgJCgnLnNob3dfYWxsW2RhdGEtY250cmwtY2xhc3NdJykuc2hvdygpO1xuICAgICQodGhpcykuaGlkZSgpO1xuICAgICQoJy4nICsgY2xzKS5oaWRlKCk7XG4gIH0pO1xufSkoKTtcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVjbE9mTnVtKG51bWJlciwgdGl0bGVzKSB7XG4gICAgY2FzZXMgPSBbMiwgMCwgMSwgMSwgMSwgMl07XG4gICAgcmV0dXJuIHRpdGxlc1sobnVtYmVyICUgMTAwID4gNCAmJiBudW1iZXIgJSAxMDAgPCAyMCkgPyAyIDogY2FzZXNbKG51bWJlciAlIDEwIDwgNSkgPyBudW1iZXIgJSAxMCA6IDVdXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpcnN0WmVybyh2KSB7XG4gICAgdiA9IE1hdGguZmxvb3Iodik7XG4gICAgaWYgKHYgPCAxMClcbiAgICAgIHJldHVybiAnMCcgKyB2O1xuICAgIGVsc2VcbiAgICAgIHJldHVybiB2O1xuICB9XG5cbiAgdmFyIGNsb2NrcyA9ICQoJy5jbG9jaycpO1xuICBpZiAoY2xvY2tzLmxlbmd0aCA+IDApIHtcbiAgICBmdW5jdGlvbiB1cGRhdGVDbG9jaygpIHtcbiAgICAgIHZhciBjbG9ja3MgPSAkKHRoaXMpO1xuICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IGNsb2Nrcy5lcShpKTtcbiAgICAgICAgdmFyIGVuZCA9IG5ldyBEYXRlKGMuZGF0YSgnZW5kJykucmVwbGFjZSgvLS9nLCBcIi9cIikpO1xuICAgICAgICB2YXIgZCA9IChlbmQuZ2V0VGltZSgpIC0gbm93LmdldFRpbWUoKSkgLyAxMDAwO1xuXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0L/RgNC+0YjQtdC7XG4gICAgICAgIGlmIChkIDw9IDApIHtcbiAgICAgICAgICBjLnRleHQobGcoXCJwcm9tb2NvZGVfZXhwaXJlc1wiKSk7XG4gICAgICAgICAgYy5hZGRDbGFzcygnY2xvY2stZXhwaXJlZCcpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/QtdGB0LvQuCDRgdGA0L7QuiDQsdC+0LvQtdC1IDMwINC00L3QtdC5XG4gICAgICAgIGlmIChkID4gMzAgKiA2MCAqIDYwICogMjQpIHtcbiAgICAgICAgICBjLmh0bWwobGcoIFwicHJvbW9jb2RlX2xlZnRfMzBfZGF5c1wiKSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcyA9IGQgJSA2MDtcbiAgICAgICAgZCA9IChkIC0gcykgLyA2MDtcbiAgICAgICAgdmFyIG0gPSBkICUgNjA7XG4gICAgICAgIGQgPSAoZCAtIG0pIC8gNjA7XG4gICAgICAgIHZhciBoID0gZCAlIDI0O1xuICAgICAgICBkID0gKGQgLSBoKSAvIDI0O1xuXG4gICAgICAgIHZhciBzdHIgPSBmaXJzdFplcm8oaCkgKyBcIjpcIiArIGZpcnN0WmVybyhtKSArIFwiOlwiICsgZmlyc3RaZXJvKHMpO1xuICAgICAgICBpZiAoZCA+IDApIHtcbiAgICAgICAgICBzdHIgPSBkICsgXCIgXCIgKyBkZWNsT2ZOdW0oZCwgW2xnKFwiZGF5X2Nhc2VfMFwiKSwgbGcoXCJkYXlfY2FzZV8xXCIpLCBsZyhcImRheV9jYXNlXzJcIildKSArIFwiICBcIiArIHN0cjtcbiAgICAgICAgfVxuICAgICAgICBjLmh0bWwoXCLQntGB0YLQsNC70L7RgdGMOiA8c3Bhbj5cIiArIHN0ciArIFwiPC9zcGFuPlwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRJbnRlcnZhbCh1cGRhdGVDbG9jay5iaW5kKGNsb2NrcyksIDEwMDApO1xuICAgIHVwZGF0ZUNsb2NrLmJpbmQoY2xvY2tzKSgpO1xuICB9XG59KTtcbiIsInZhciBjYXRhbG9nVHlwZVN3aXRjaGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY2F0YWxvZyA9ICQoJy5jYXRhbG9nX2xpc3QnKTtcbiAgaWYgKGNhdGFsb2cubGVuZ3RoID09IDApcmV0dXJuO1xuXG4gICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5maW5kKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24nKS5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xuICAgICQodGhpcykuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcbiAgICBpZiAoY2F0YWxvZykge1xuICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2NhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbGlzdCcpKSB7XG4gICAgICAgIGNhdGFsb2cucmVtb3ZlQ2xhc3MoJ25hcnJvdycpO1xuICAgICAgICBzZXRDb29raWUoJ2NvdXBvbnNfdmlldycsICcnKVxuICAgICAgfVxuICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2NhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbmFycm93JykpIHtcbiAgICAgICAgY2F0YWxvZy5hZGRDbGFzcygnbmFycm93Jyk7XG4gICAgICAgIHNldENvb2tpZSgnY291cG9uc192aWV3JywgJ25hcnJvdycpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGdldENvb2tpZSgnY291cG9uc192aWV3JykgPT0gJ25hcnJvdycgJiYgIWNhdGFsb2cuaGFzQ2xhc3MoJ25hcnJvd19vZmYnKSkge1xuICAgIGNhdGFsb2cuYWRkQ2xhc3MoJ25hcnJvdycpO1xuICAgICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLW5hcnJvdycpLmFkZENsYXNzKCdjaGVja2VkJyk7XG4gICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbGlzdCcpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XG4gIH1cbn0oKTtcbiIsIiQoZnVuY3Rpb24gKCkge1xuICAkKCcuc2Qtc2VsZWN0LXNlbGVjdGVkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA8IDc2OCkge1xuICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgLy92YXIgcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAgICAgLy92YXIgZHJvcEJsb2NrID0gJChwYXJlbnQpLmZpbmQoJy5zZC1zZWxlY3QtZHJvcCcpO1xuXG4gICAgICAgIC8vIGlmIChkcm9wQmxvY2suaXMoJzpoaWRkZW4nKSkge1xuICAgICAgICAvLyAgICAgZHJvcEJsb2NrLnNsaWRlRG93bigpO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgJCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICBpZiAoIXBhcmVudC5oYXNDbGFzcygnbGlua2VkJykpIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICAkKCcuc2Qtc2VsZWN0LWRyb3AnKS5maW5kKCdhJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvLyAgICAgICAgICAgICB2YXIgc2VsZWN0UmVzdWx0ID0gJCh0aGlzKS5odG1sKCk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICAgICAgICAgICQocGFyZW50KS5maW5kKCdpbnB1dCcpLnZhbChzZWxlY3RSZXN1bHQpO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgICAgICAkKHBhcmVudCkuZmluZCgnLnNkLXNlbGVjdC1zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5odG1sKHNlbGVjdFJlc3VsdCk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICAgICAgICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XG4gICAgICAgIC8vICAgICAgICAgfSk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgLy8gICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XG4gICAgICAgIC8vIH1cbiAgICB9XG4gICAgLy9yZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG59KTtcbiIsInNlYXJjaCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG9wZW5BdXRvY29tcGxldGU7XG5cbiAgJCgnLnNlYXJjaC1mb3JtLWlucHV0Jykub24oJ2lucHV0JywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgIGlmICgkdGhpcy5kYXRhKCdwb3B1cCcpICE9IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHF1ZXJ5ID0gJHRoaXMudmFsKCk7XG4gICAgdmFyIGRhdGEgPSAkdGhpcy5jbG9zZXN0KCdmb3JtJykuc2VyaWFsaXplKCk7XG4gICAgdmFyIGF1dG9jb21wbGV0ZSA9ICR0aGlzLmNsb3Nlc3QoJy5zdG9yZXNfc2VhcmNoJykuZmluZCgnLmF1dG9jb21wbGV0ZS13cmFwJyk7Ly8gJCgnI2F1dG9jb21wbGV0ZScpLFxuICAgIHZhciBhdXRvY29tcGxldGVMaXN0ID0gJChhdXRvY29tcGxldGUpLmZpbmQoJ3VsJyk7XG4gICAgb3BlbkF1dG9jb21wbGV0ZSA9IGF1dG9jb21wbGV0ZTtcbiAgICBpZiAocXVlcnkubGVuZ3RoID4gMSkge1xuICAgICAgdXJsID0gJHRoaXMuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicpIHx8ICcvc2VhcmNoJztcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICB0eXBlOiAnZ2V0JyxcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGRhdGEuc3VnZ2VzdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIGlmKGxhbmdbXCJocmVmX3ByZWZpeFwiXS5sZW5ndGg+MCAmJiBpdGVtLmRhdGEucm91dGUuaW5kZXhPZihsYW5nW1wiaHJlZl9wcmVmaXhcIl0pPT0tMSl7XG4gICAgICAgICAgICAgICAgICBpdGVtLmRhdGEucm91dGU9Jy8nK2xhbmdbXCJocmVmX3ByZWZpeFwiXStpdGVtLmRhdGEucm91dGU7XG4gICAgICAgICAgICAgICAgICBpdGVtLmRhdGEucm91dGU9aXRlbS5kYXRhLnJvdXRlLnJlcGxhY2UoJy8vJywnLycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9ICc8YSBjbGFzcz1cImF1dG9jb21wbGV0ZV9saW5rXCIgaHJlZj1cIicgKyBpdGVtLmRhdGEucm91dGUgKyAnXCInICsgJz4nICsgaXRlbS52YWx1ZSArIGl0ZW0uY2FzaGJhY2sgKyAnPC9hPic7XG4gICAgICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgICAgICBsaS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmFwcGVuZChsaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XG4gICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuaHRtbCgnJyk7XG4gICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSkub24oJ2ZvY3Vzb3V0JywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoISQoZS5yZWxhdGVkVGFyZ2V0KS5oYXNDbGFzcygnYXV0b2NvbXBsZXRlX2xpbmsnKSkge1xuICAgICAgLy8kKCcjYXV0b2NvbXBsZXRlJykuaGlkZSgpO1xuICAgICAgJChvcGVuQXV0b2NvbXBsZXRlKS5kZWxheSgxMDApLnNsaWRlVXAoMTAwKVxuICAgIH1cbiAgfSk7XG5cbiAgJCgnYm9keScpLm9uKCdzdWJtaXQnLCAnLnN0b3Jlcy1zZWFyY2hfZm9ybScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIHZhbCA9ICQodGhpcykuZmluZCgnLnNlYXJjaC1mb3JtLWlucHV0JykudmFsKCk7XG4gICAgaWYgKHZhbC5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9KTtcblxuICAkKCcuZm9ybS1wb3B1cC1zZWxlY3QgbGknKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXG4gICAgdmFyIGhpZGRlbiA9ICQodGhpcykuZGF0YSgnaWQyJyk7XG4gICAgJCgnIycraGlkZGVuKS5hdHRyKCd2YWx1ZScsICQodGhpcykuZGF0YSgndmFsdWUyJykpO1xuICAgIHZhciB0ZXh0ID0gJCh0aGlzKS5kYXRhKCdpZDEnKTtcbiAgICAkKCcjJyt0ZXh0KS5odG1sKCQodGhpcykuZGF0YSgndmFsdWUxJykpO1xuICAgIHZhciBzZWFyY2h0ZXh0ID0gJCh0aGlzKS5kYXRhKCdpZDMnKTtcbiAgICAkKCcjJytzZWFyY2h0ZXh0KS5hdHRyKCdwbGFjZWhvbGRlcicsICQodGhpcykuZGF0YSgndmFsdWUzJykpO1xuICAgIHZhciBsaW1pdCA9ICQodGhpcykuZGF0YSgnaWQ0Jyk7XG4gICAgJCgnIycrbGltaXQpLmF0dHIoJ3ZhbHVlJywgJCh0aGlzKS5kYXRhKCd2YWx1ZTQnKSk7XG4gICAgJCgnIycrc2VhcmNodGV4dCkuZGF0YSgncG9wdXAnLCAkKHRoaXMpLmRhdGEoJ3BvcHVwJykpO1xuXG4gICAgdmFyIGFjdGlvbiA9ICQodGhpcykuZGF0YSgnYWN0aW9uJyk7XG5cbiAgICAkKHRoaXMpLmNsb3Nlc3QoJ2Zvcm0nKS5hdHRyKCdhY3Rpb24nLCBhY3Rpb24pO1xuXG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuaGVhZGVyLXNlYXJjaF9mb3JtLWdyb3VwJykuZmluZCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dC1tb2R1bGUtbGFiZWwnKS5hZGRDbGFzcygnY2xvc2UnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gIH0pO1xuXG4gICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0taW5wdXQtbW9kdWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5oZWFkZXItc2VhcmNoX2Zvcm0taW5wdXQtbW9kdWxlLWxhYmVsJykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICB9KTtcblxuICAkKCcuaGVhZGVyLXNlYXJjaF9mb3JtLWlucHV0LW1vZHVsZS1sYWJlbCcpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpe1xuICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICB9KTtcblxufSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAkKCcuY291cG9ucy1saXN0X2l0ZW0tY29udGVudC1nb3RvLXByb21vY29kZS1saW5rJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgdGhhdCA9ICQodGhpcyk7XG4gICAgdmFyIGV4cGlyZWQgPSB0aGF0LmNsb3Nlc3QoJy5jb3Vwb25zLWxpc3RfaXRlbScpLmZpbmQoJy5jbG9jay1leHBpcmVkJyk7XG4gICAgdmFyIHVzZXJJZCA9ICQodGhhdCkuZGF0YSgndXNlcicpO1xuICAgIHZhciBpbmFjdGl2ZSA9ICQodGhhdCkuZGF0YSgnaW5hY3RpdmUnKTtcbiAgICB2YXIgZGF0YV9tZXNzYWdlID0gJCh0aGF0KS5kYXRhKCdtZXNzYWdlJyk7XG5cbiAgICBpZiAoaW5hY3RpdmUpIHtcbiAgICAgIHZhciB0aXRsZSA9IGRhdGFfbWVzc2FnZSA/IGRhdGFfbWVzc2FnZSA6IGxnKFwicHJvbW9jb2RlX2lzX2luYWN0aXZlXCIpO1xuICAgICAgdmFyIG1lc3NhZ2UgPSBsZyhcInByb21vY29kZV92aWV3X2FsbFwiLHtcInVybFwiOlwiL1wiK2xhbmdbXCJocmVmX3ByZWZpeFwiXStcImNvdXBvbnNcIn0pO1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcbiAgICAgICAgJ3RpdGxlJzogdGl0bGUsXG4gICAgICAgICdxdWVzdGlvbic6IG1lc3NhZ2UsXG4gICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxuICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcbiAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChleHBpcmVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciB0aXRsZSA9IGxnKFwicHJvbW9jb2RlX2lzX2V4cGlyZXNcIik7XG4gICAgICB2YXIgbWVzc2FnZSA9IGxnKFwicHJvbW9jb2RlX3ZpZXdfYWxsXCIse1widXJsXCI6XCIvXCIrbGFuZ1tcImhyZWZfcHJlZml4XCJdK1wiY291cG9uc1wifSk7XG4gICAgICBub3RpZmljYXRpb24uYWxlcnQoe1xuICAgICAgICAndGl0bGUnOiB0aXRsZSxcbiAgICAgICAgJ3F1ZXN0aW9uJzogbWVzc2FnZSxcbiAgICAgICAgJ2J1dHRvblllcyc6ICdPaycsXG4gICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxuICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKCF1c2VySWQpIHtcbiAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAnYnV0dG9uWWVzJzogZmFsc2UsXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiBcIm5vdGlmeV9ib3gtYWxlcnRcIixcbiAgICAgICAgJ3RpdGxlJzogbGcoXCJ1c2VfcHJvbW9jb2RlXCIpLFxuICAgICAgICAncXVlc3Rpb24nOiAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtY291cG9uLW5vcmVnaXN0ZXJcIj4nICtcbiAgICAgICAgJzxpbWcgc3JjPVwiL2ltYWdlcy90ZW1wbGF0ZXMvc3dhLnBuZ1wiIGFsdD1cIlwiPicgK1xuICAgICAgICAnPHA+PGI+JytsZyhcInByb21vY29kZV91c2Vfd2l0aG91dF9jYXNoYmFja19vcl9yZWdpc3RlclwiKSsnPC9iPjwvcD4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtYnV0dG9uc1wiPicgK1xuICAgICAgICAnPGEgaHJlZj1cIicgKyB0aGF0LmF0dHIoJ2hyZWYnKSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImJ0biBub3RpZmljYXRpb24tY2xvc2VcIj4nK2xnKFwidXNlX3Byb21vY29kZVwiKSsnPC9hPicgK1xuICAgICAgICAnPGEgaHJlZj1cIiMnK2xhbmcuaHJlZl9wcmVmaXgrJy9yZWdpc3RyYXRpb25cIiBjbGFzcz1cImJ0biBidG4tdHJhbnNmb3JtIG1vZGFsc19vcGVuXCI+JytsZyhcInJlZ2lzdGVyXCIpKyc8L2E+JyArXG4gICAgICAgICc8L2Rpdj4nXG4gICAgICB9O1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSk7XG5cbiAgJCgnI3Nob3BfaGVhZGVyLWdvdG8tY2hlY2tib3gnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICBpZiAoISQodGhpcykuaXMoJzpjaGVja2VkJykpIHtcbiAgICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XG4gICAgICAgICAgICAgJ3RpdGxlJzogbGcoXCJhdHRlbnRpb25zXCIpLFxuICAgICAgICAgICAgICdxdWVzdGlvbic6IGxnKFwicHJvbW9jb2RlX3JlY29tbWVuZGF0aW9uc1wiKSxcbiAgICAgICAgICAgICAnYnV0dG9uWWVzJzogbGcoXCJjbG9zZVwiKSxcbiAgICAgICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcbiAgICAgICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXG4gICAgICAgICB9KTtcbiAgICAgfVxuICB9KTtcblxuICAkKCcuY2F0YWxvZ19wcm9kdWN0X2xpbmsnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgdmFyIHRoYXQgPSAkKHRoaXMpO1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcbiAgICAgICAgJ2J1dHRvblllcyc6IGZhbHNlLFxuICAgICAgICAgICAgJ25vdHlmeV9jbGFzcyc6IFwibm90aWZ5X2JveC1hbGVydFwiLFxuICAgICAgICAgICAgJ3RpdGxlJzogbGcoXCJwcm9kdWN0X3VzZVwiKSxcbiAgICAgICAgICAgICdxdWVzdGlvbic6ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveC1jb3Vwb24tbm9yZWdpc3RlclwiPicgK1xuICAgICAgICAnPGltZyBzcmM9XCIvaW1hZ2VzL3RlbXBsYXRlcy9zd2EucG5nXCIgYWx0PVwiXCI+JyArXG4gICAgICAgICc8cD48Yj4nK2xnKFwicHJvZHVjdF91c2Vfd2l0aG91dF9jYXNoYmFja19vcl9yZWdpc3RlclwiKSsnPC9iPjwvcD4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtYnV0dG9uc1wiPicgK1xuICAgICAgICAnPGEgaHJlZj1cIicgKyB0aGF0LmF0dHIoJ2hyZWYnKSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImJ0biBub3RpZmljYXRpb24tY2xvc2VcIj4nK2xnKFwicHJvZHVjdF91c2VcIikrJzwvYT4nICtcbiAgICAgICAgJzxhIGhyZWY9XCIjJytsYW5nW1wiaHJlZl9wcmVmaXhcIl0rJy9yZWdpc3RyYXRpb25cIiBjbGFzcz1cImJ0biBidG4tdHJhbnNmb3JtIG1vZGFsc19vcGVuXCI+JytsZyhcInJlZ2lzdGVyXCIpKyc8L2E+JyArXG4gICAgICAgICc8L2Rpdj4nfVxuICAgICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxufSgpKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICQoJy5hY2NvdW50LXdpdGhkcmF3LW1ldGhvZHNfaXRlbS1vcHRpb24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgb3B0aW9uID0gJCh0aGlzKS5kYXRhKCdvcHRpb24tcHJvY2VzcycpLFxuICAgICAgcGxhY2Vob2xkZXIgPSAnJztcbiAgICBzd2l0Y2ggKG9wdGlvbikge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfY2FzaF9udW1iZXJcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDI6XG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19yX251bWJlclwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMzpcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X3Bob25lX251bWJlclwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgNDpcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X2NhcnRfbnVtYmVyXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA1OlxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfZW1haWxcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDY6XG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19waG9uZV9udW1iZXJcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDc6XG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19za3JpbGxcIik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgJCh0aGlzKS5wYXJlbnQoKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgJChcIiN1c2Vyc3dpdGhkcmF3LWJpbGxcIikucHJldihcIi5wbGFjZWhvbGRlclwiKS5odG1sKHBsYWNlaG9sZGVyKTtcbiAgICAkKCcjdXNlcnN3aXRoZHJhdy1wcm9jZXNzX2lkJykudmFsKG9wdGlvbik7XG4gIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gIGFqYXhGb3JtKCQoJy5hamF4X2Zvcm0nKSk7XG5cbiAgJCgnLmZvcm0tdGVzdC1saW5rJykub24oJ3N1Ym1pdCcsZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBmb3JtID0gJCgnLmZvcm0tdGVzdC1saW5rJyk7XG4gICAgaWYoZm9ybS5oYXNDbGFzcygnbG9hZGluZycpKXJldHVybjtcbiAgICBmb3JtLmZpbmQoJy5oZWxwLWJsb2NrJykuaHRtbChcIlwiKTtcblxuICAgIHZhciB1cmwgPSBmb3JtLmZpbmQoJ1tuYW1lPXVybF0nKS52YWwoKTtcbiAgICBmb3JtLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcblxuICAgIGlmKHVybC5sZW5ndGg8Myl7XG4gICAgICBmb3JtLmZpbmQoJy5oZWxwLWJsb2NrJykuaHRtbChsZygncmVxdWlyZWQnKSk7XG4gICAgICBmb3JtLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgIHJldHVybjtcbiAgICB9ZWxzZXtcblxuICAgIH1cblxuICAgIGZvcm0uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICBmb3JtLmZpbmQoJ2lucHV0JykuYXR0cignZGlzYWJsZWQnLHRydWUpO1xuICAgICQucG9zdChmb3JtLmF0dHIoJ2FjdGlvbicpLHt1cmw6dXJsfSxmdW5jdGlvbihkKXtcbiAgICAgIGZvcm0uZmluZCgnaW5wdXQnKS5hdHRyKCdkaXNhYmxlZCcsZmFsc2UpO1xuICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgZm9ybS5maW5kKCcuaGVscC1ibG9jaycpLmh0bWwoZCk7XG4gICAgfSk7XG4gIH0pXG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnLmRvYnJvLWZ1bmRzX2l0ZW0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAkKCcjZG9icm8tc2VuZC1mb3JtLWNoYXJpdHktcHJvY2VzcycpLnZhbCgkKHRoaXMpLmRhdGEoJ2lkJykpO1xuICB9KTtcblxufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgJCgnYm9keScpLmFkZENsYXNzKCdub19zY3JvbGwnKTtcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0JykuYWRkQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdC1vcGVuJyk7XG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLmFkZENsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUtb3BlbicpO1xuICB9KTtcbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdC1jbG9zZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQnKS5yZW1vdmVDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LW9wZW4nKTtcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZS1vcGVuJyk7XG4gIH0pO1xufSkoKTtcbiIsIi8vd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbmZ1bmN0aW9uIHNoYXJlNDIoKXtcbiAgZT1kb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzaGFyZTQyaW5pdCcpO1xuICBmb3IgKHZhciBrID0gMDsgayA8IGUubGVuZ3RoOyBrKyspIHtcbiAgICB2YXIgdSA9IFwiXCI7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNvY2lhbHMnKSAhPSAtMSlcbiAgICAgIHZhciBzb2NpYWxzID0gSlNPTi5wYXJzZSgnWycrZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29jaWFscycpKyddJyk7XG4gICAgdmFyIGljb25fdHlwZT1lW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXR5cGUnKSAhPSAtMT9lW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXR5cGUnKTonJztcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXJsJykgIT0gLTEpXG4gICAgICB1ID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXJsJyk7XG4gICAgdmFyIHByb21vID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvbW8nKTtcbiAgICBpZihwcm9tbyAmJiBwcm9tby5sZW5ndGg+MCkge1xuICAgICAgdmFyIGtleSA9ICdwcm9tbz0nLFxuICAgICAgICBwcm9tb1N0YXJ0ID0gdS5pbmRleE9mKGtleSksXG4gICAgICAgIHByb21vRW5kID0gdS5pbmRleE9mKCcmJywgcHJvbW9TdGFydCksXG4gICAgICAgIHByb21vTGVuZ3RoID0gcHJvbW9FbmQgPiBwcm9tb1N0YXJ0ID8gcHJvbW9FbmQgLSBwcm9tb1N0YXJ0IC0ga2V5Lmxlbmd0aCA6IHUubGVuZ3RoIC0gcHJvbW9TdGFydCAtIGtleS5sZW5ndGg7XG4gICAgICBpZihwcm9tb1N0YXJ0ID4gMCkge1xuICAgICAgICBwcm9tbyA9IHUuc3Vic3RyKHByb21vU3RhcnQgKyBrZXkubGVuZ3RoLCBwcm9tb0xlbmd0aCk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBwcm9tb3VybCA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXByb21vdXJsJyk7XG4gICAgdmFyIHNlbGZfcHJvbW8gPSAocHJvbW8gJiYgcHJvbW8ubGVuZ3RoID4gMCk/IFwic2V0VGltZW91dChmdW5jdGlvbigpe3NlbmRfcHJvbW8oJ1wiK3Byb21vK1wiJyxcIitwcm9tb3VybCtcIik7fSwyMDAwKTtcIiA6IFwiXCI7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tc2l6ZScpICE9IC0xKVxuICAgICAgdmFyIGljb25fc2l6ZSA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tc2l6ZScpO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpICE9IC0xKVxuICAgICAgdmFyIHQgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pbWFnZScpICE9IC0xKVxuICAgICAgdmFyIGkgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pbWFnZScpO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1kZXNjcmlwdGlvbicpICE9IC0xKVxuICAgICAgdmFyIGQgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1kZXNjcmlwdGlvbicpO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wYXRoJykgIT0gLTEpXG4gICAgICB2YXIgZiA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXBhdGgnKTtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbnMtZmlsZScpICE9IC0xKVxuICAgICAgdmFyIGZuID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbnMtZmlsZScpO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zY3JpcHQtYWZ0ZXInKSkge1xuICAgICAgc2VsZl9wcm9tbyArPSBcInNldFRpbWVvdXQoZnVuY3Rpb24oKXtcIitlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zY3JpcHQtYWZ0ZXInKStcIn0sMzAwMCk7XCI7XG4gICAgfVxuXG4gICAgaWYgKCFmKSB7XG4gICAgICBmdW5jdGlvbiBwYXRoKG5hbWUpIHtcbiAgICAgICAgdmFyIHNjID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpXG4gICAgICAgICAgLCBzciA9IG5ldyBSZWdFeHAoJ14oLiovfCkoJyArIG5hbWUgKyAnKShbIz9dfCQpJyk7XG4gICAgICAgIGZvciAodmFyIHAgPSAwLCBzY0wgPSBzYy5sZW5ndGg7IHAgPCBzY0w7IHArKykge1xuICAgICAgICAgIHZhciBtID0gU3RyaW5nKHNjW3BdLnNyYykubWF0Y2goc3IpO1xuICAgICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgICBpZiAobVsxXS5tYXRjaCgvXigoaHR0cHM/fGZpbGUpXFw6XFwvezIsfXxcXHc6W1xcL1xcXFxdKS8pKVxuICAgICAgICAgICAgICByZXR1cm4gbVsxXTtcbiAgICAgICAgICAgIGlmIChtWzFdLmluZGV4T2YoXCIvXCIpID09IDApXG4gICAgICAgICAgICAgIHJldHVybiBtWzFdO1xuICAgICAgICAgICAgYiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdiYXNlJyk7XG4gICAgICAgICAgICBpZiAoYlswXSAmJiBiWzBdLmhyZWYpXG4gICAgICAgICAgICAgIHJldHVybiBiWzBdLmhyZWYgKyBtWzFdO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUubWF0Y2goLyguKltcXC9cXFxcXSkvKVswXSArIG1bMV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZiA9IHBhdGgoJ3NoYXJlNDIuanMnKTtcbiAgICB9XG4gICAgaWYgKCF1KVxuICAgICAgdSA9IGxvY2F0aW9uLmhyZWY7XG4gICAgaWYgKCF0KVxuICAgICAgdCA9IGRvY3VtZW50LnRpdGxlO1xuICAgIGlmICghZm4pXG4gICAgICBmbiA9ICdpY29ucy5wbmcnO1xuICAgIGZ1bmN0aW9uIGRlc2MoKSB7XG4gICAgICB2YXIgbWV0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtZXRhJyk7XG4gICAgICBmb3IgKHZhciBtID0gMDsgbSA8IG1ldGEubGVuZ3RoOyBtKyspIHtcbiAgICAgICAgaWYgKG1ldGFbbV0ubmFtZS50b0xvd2VyQ2FzZSgpID09ICdkZXNjcmlwdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gbWV0YVttXS5jb250ZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGlmICghZClcbiAgICAgIGQgPSBkZXNjKCk7XG4gICAgdSA9IGVuY29kZVVSSUNvbXBvbmVudCh1KTtcbiAgICB0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHQpO1xuICAgIHQgPSB0LnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XG4gICAgaSA9IGVuY29kZVVSSUNvbXBvbmVudChpKTtcbiAgICB2YXIgZF9vcmlnPWQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcbiAgICBkID0gZW5jb2RlVVJJQ29tcG9uZW50KGQpO1xuICAgIGQgPSBkLnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XG4gICAgdmFyIGZiUXVlcnkgPSAndT0nICsgdTtcbiAgICBpZiAoaSAhPSAnbnVsbCcgJiYgaSAhPSAnJylcbiAgICAgIGZiUXVlcnkgPSAncz0xMDAmcFt1cmxdPScgKyB1ICsgJyZwW3RpdGxlXT0nICsgdCArICcmcFtzdW1tYXJ5XT0nICsgZCArICcmcFtpbWFnZXNdWzBdPScgKyBpO1xuICAgIHZhciB2a0ltYWdlID0gJyc7XG4gICAgaWYgKGkgIT0gJ251bGwnICYmIGkgIT0gJycpXG4gICAgICB2a0ltYWdlID0gJyZpbWFnZT0nICsgaTtcbiAgICB2YXIgcyA9IG5ldyBBcnJheShcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwiZmJcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT0nICsgdSArJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgRmFjZWJvb2tcIicsXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInZrXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy92ay5jb20vc2hhcmUucGhwP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyB2a0ltYWdlICsgJyZkZXNjcmlwdGlvbj0nICsgZCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCSINCa0L7QvdGC0LDQutGC0LVcIicsXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cIm9ka2xcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL2Nvbm5lY3Qub2sucnUvb2ZmZXI/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICcmZGVzY3JpcHRpb249JysgZCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIg0J7QtNC90L7QutC70LDRgdGB0L3QuNC60LhcIicsXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInR3aVwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9JyArIHQgKyAnJnVybD0nICsgdSArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIgVHdpdHRlclwiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwiZ3BsdXNcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3BsdXMuZ29vZ2xlLmNvbS9zaGFyZT91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgR29vZ2xlK1wiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwibWFpbFwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vY29ubmVjdC5tYWlsLnJ1L3NoYXJlP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnJmRlc2NyaXB0aW9uPScgKyBkICsgJyZpbWFnZXVybD0nICsgaSArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyINCc0L7QtdC8INCc0LjRgNC1QE1haWwuUnVcIicsXG4gICAgICAnXCIvL3d3dy5saXZlam91cm5hbC5jb20vdXBkYXRlLmJtbD9ldmVudD0nICsgdSArICcmc3ViamVjdD0nICsgdCArICdcIiB0aXRsZT1cItCe0L/Rg9Cx0LvQuNC60L7QstCw0YLRjCDQsiBMaXZlSm91cm5hbFwiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwicGluXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9waW50ZXJlc3QuY29tL3Bpbi9jcmVhdGUvYnV0dG9uLz91cmw9JyArIHUgKyAnJm1lZGlhPScgKyBpICsgJyZkZXNjcmlwdGlvbj0nICsgdCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NjAwLCBoZWlnaHQ9MzAwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIgUGludGVyZXN0XCInLFxuICAgICAgJ1wiXCIgb25jbGljaz1cInJldHVybiBmYXYodGhpcyk7XCIgdGl0bGU9XCLQodC+0YXRgNCw0L3QuNGC0Ywg0LIg0LjQt9Cx0YDQsNC90L3QvtC1INCx0YDQsNGD0LfQtdGA0LBcIicsXG4gICAgICAnXCIjXCIgb25jbGljaz1cInByaW50KCk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQoNCw0YHQv9C10YfQsNGC0LDRgtGMXCInLFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJ0ZWxlZ3JhbVwiIG9uY2xpY2s9XCJ3aW5kb3cub3BlbihcXCcvL3RlbGVncmFtLm1lL3NoYXJlL3VybD91cmw9JyArIHUgKycmdGV4dD0nICsgdCArICdcXCcsIFxcJ3RlbGVncmFtXFwnLCBcXCd3aWR0aD01NTAsaGVpZ2h0PTQ0MCxsZWZ0PTEwMCx0b3A9MTAwXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIFRlbGVncmFtXCInLFxuICAgICAgJ1widmliZXI6Ly9mb3J3YXJkP3RleHQ9JysgdSArJyAtICcgKyB0ICsgJ1wiIGRhdGEtY291bnQ9XCJ2aWJlclwiIHJlbD1cIm5vZm9sbG93IG5vb3BlbmVyXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBWaWJlclwiJyxcbiAgICAgICdcIndoYXRzYXBwOi8vc2VuZD90ZXh0PScrIHUgKycgLSAnICsgdCArICdcIiBkYXRhLWNvdW50PVwid2hhdHNhcHBcIiByZWw9XCJub2ZvbGxvdyBub29wZW5lclwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgV2hhdHNBcHBcIidcblxuICAgICk7XG5cbiAgICB2YXIgbCA9ICcnO1xuXG4gICAgaWYoc29jaWFscy5sZW5ndGg+MSl7XG4gICAgICBmb3IgKHEgPSAwOyBxIDwgc29jaWFscy5sZW5ndGg7IHErKyl7XG4gICAgICAgIGo9c29jaWFsc1txXTtcbiAgICAgICAgbCArPSAnPGEgcmVsPVwibm9mb2xsb3dcIiBocmVmPScgKyBzW2pdICsgJyB0YXJnZXQ9XCJfYmxhbmtcIiAnK2dldEljb24oc1tqXSxqLGljb25fdHlwZSxmLGZuLGljb25fc2l6ZSkrJz48L2E+JztcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGZvciAoaiA9IDA7IGogPCBzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGwgKz0gJzxhIHJlbD1cIm5vZm9sbG93XCIgaHJlZj0nICsgc1tqXSArICcgdGFyZ2V0PVwiX2JsYW5rXCIgJytnZXRJY29uKHNbal0saixpY29uX3R5cGUsZixmbixpY29uX3NpemUpKyc+PC9hPic7XG4gICAgICB9XG4gICAgfVxuICAgIGVba10uaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPVwic2hhcmU0Ml93cmFwXCI+JyArIGwgKyAnPC9zcGFuPic7XG4gIH1cbiAgXG4vL30sIGZhbHNlKTtcbn1cblxuc2hhcmU0MigpO1xuXG5mdW5jdGlvbiBnZXRJY29uKHMsaix0LGYsZm4sc2l6ZSkge1xuICBpZighc2l6ZSl7XG4gICAgc2l6ZT0zMjtcbiAgfVxuICBpZih0PT0nY3NzJyl7XG4gICAgaj1zLmluZGV4T2YoJ2RhdGEtY291bnQ9XCInKSsxMjtcbiAgICB2YXIgbD1zLmluZGV4T2YoJ1wiJyxqKS1qO1xuICAgIHZhciBsMj1zLmluZGV4T2YoJy4nLGopLWo7XG4gICAgbD1sPmwyICYmIGwyPjAgP2wyOmw7XG4gICAgLy92YXIgaWNvbj0nY2xhc3M9XCJzb2MtaWNvbiBpY29uLScrcy5zdWJzdHIoaixsKSsnXCInO1xuICAgIHZhciBpY29uPSdjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2QtJytzLnN1YnN0cihqLGwpKydcIic7XG4gIH1lbHNlIGlmKHQ9PSdzdmcnKXtcbiAgICB2YXIgc3ZnPVtcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDExMS45NCwxNzcuMDgpXCIgZD1cIk0wIDAgMCA3MC4zIDIzLjYgNzAuMyAyNy4xIDk3LjcgMCA5Ny43IDAgMTE1LjJDMCAxMjMuMiAyLjIgMTI4LjYgMTMuNiAxMjguNkwyOC4xIDEyOC42IDI4LjEgMTUzLjFDMjUuNiAxNTMuNCAxNyAxNTQuMiA2LjkgMTU0LjItMTQgMTU0LjItMjguMyAxNDEuNC0yOC4zIDExNy45TC0yOC4zIDk3LjctNTIgOTcuNy01MiA3MC4zLTI4LjMgNzAuMy0yOC4zIDAgMCAwWlwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsOTguMjc0LDE0NS41MilcIiBkPVwiTTAgMCA5LjYgMEM5LjYgMCAxMi41IDAuMyAxNCAxLjkgMTUuNCAzLjQgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMSAxOSAyMS4xIDIxIDI3IDIyLjggMzQuNiA4LjUgNDIuNyAzIDQ4LjctMS4yIDUzLjMtMC4zIDUzLjMtMC4zTDc0LjggMEM3NC44IDAgODYuMSAwLjcgODAuNyA5LjUgODAuMyAxMC4zIDc3LjYgMTYuMSA2NC44IDI4IDUxLjMgNDAuNSA1My4xIDM4LjUgNjkuMyA2MC4xIDc5LjIgNzMuMyA4My4yIDgxLjQgODEuOSA4NC44IDgwLjggODguMSA3My41IDg3LjIgNzMuNSA4Ny4yTDQ5LjMgODcuMUM0OS4zIDg3LjEgNDcuNSA4Ny4zIDQ2LjIgODYuNSA0NC45IDg1LjcgNDQgODMuOSA0NCA4My45IDQ0IDgzLjkgNDAuMiA3My43IDM1LjEgNjUuMSAyNC4zIDQ2LjggMjAgNDUuOCAxOC4zIDQ2LjkgMTQuMiA0OS42IDE1LjIgNTcuNiAxNS4yIDYzLjIgMTUuMiA4MSAxNy45IDg4LjQgOS45IDkwLjMgNy4zIDkwLjkgNS40IDkxLjMtMS40IDkxLjQtMTAgOTEuNS0xNy4zIDkxLjQtMjEuNCA4OS4zLTI0LjIgODgtMjYuMyA4NS0yNSA4NC44LTIzLjQgODQuNi0xOS44IDgzLjgtMTcuOSA4MS4yLTE1LjQgNzcuOS0xNS41IDcwLjMtMTUuNSA3MC4zLTE1LjUgNzAuMy0xNC4xIDQ5LjQtMTguOCA0Ni44LTIyLjEgNDUtMjYuNSA0OC43LTM2LjEgNjUuMy00MS4xIDczLjgtNDQuOCA4My4yLTQ0LjggODMuMi00NC44IDgzLjItNDUuNSA4NC45LTQ2LjggODUuOS00OC4zIDg3LTUwLjUgODcuNC01MC41IDg3LjRMLTczLjUgODcuMkMtNzMuNSA4Ny4yLTc2LjkgODcuMS03OC4yIDg1LjYtNzkuMyA4NC4zLTc4LjMgODEuNS03OC4zIDgxLjUtNzguMyA4MS41LTYwLjMgMzkuNC0zOS45IDE4LjItMjEuMi0xLjMgMCAwIDAgMFwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDEwNi44OCwxODMuNjEpXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKC02Ljg4MDUsLTEwMClcIiBzdHlsZT1cInN0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIj48cGF0aCBkPVwiTSAwLDAgQyA4LjE0NiwwIDE0Ljc2OSwtNi42MjUgMTQuNzY5LC0xNC43NyAxNC43NjksLTIyLjkwNyA4LjE0NiwtMjkuNTMzIDAsLTI5LjUzMyAtOC4xMzYsLTI5LjUzMyAtMTQuNzY5LC0yMi45MDcgLTE0Ljc2OSwtMTQuNzcgLTE0Ljc2OSwtNi42MjUgLTguMTM2LDAgMCwwIE0gMCwtNTAuNDI5IEMgMTkuNjc2LC01MC40MjkgMzUuNjcsLTM0LjQzNSAzNS42NywtMTQuNzcgMzUuNjcsNC45MDMgMTkuNjc2LDIwLjkwMyAwLDIwLjkwMyAtMTkuNjcxLDIwLjkwMyAtMzUuNjY5LDQuOTAzIC0zNS42NjksLTE0Ljc3IC0zNS42NjksLTM0LjQzNSAtMTkuNjcxLC01MC40MjkgMCwtNTAuNDI5XCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsNy41NTE2LC01NC41NzcpXCIgc3R5bGU9XCJzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCI+PHBhdGggZD1cIk0gMCwwIEMgNy4yNjIsMS42NTUgMTQuMjY0LDQuNTI2IDIwLjcxNCw4LjU3OCAyNS41OTUsMTEuNjU0IDI3LjA2NiwxOC4xMDggMjMuOTksMjIuOTg5IDIwLjkxNywyNy44ODEgMTQuNDY5LDI5LjM1MiA5LjU3OSwyNi4yNzUgLTUuMDMyLDE3LjA4NiAtMjMuODQzLDE3LjA5MiAtMzguNDQ2LDI2LjI3NSAtNDMuMzM2LDI5LjM1MiAtNDkuNzg0LDI3Ljg4MSAtNTIuODUyLDIyLjk4OSAtNTUuOTI4LDE4LjEwNCAtNTQuNDYxLDExLjY1NCAtNDkuNTgsOC41NzggLTQzLjEzMiw0LjUzMSAtMzYuMTI4LDEuNjU1IC0yOC44NjcsMCBMIC00OC44MDksLTE5Ljk0MSBDIC01Mi44ODYsLTI0LjAyMiAtNTIuODg2LC0zMC42MzkgLTQ4LjgwNSwtMzQuNzIgLTQ2Ljc2MiwtMzYuNzU4IC00NC4wOSwtMzcuNzc5IC00MS40MTgsLTM3Ljc3OSAtMzguNzQyLC0zNy43NzkgLTM2LjA2NSwtMzYuNzU4IC0zNC4wMjMsLTM0LjcyIEwgLTE0LjQzNiwtMTUuMTIzIDUuMTY5LC0zNC43MiBDIDkuMjQ2LC0zOC44MDEgMTUuODYyLC0zOC44MDEgMTkuOTQzLC0zNC43MiAyNC4wMjgsLTMwLjYzOSAyNC4wMjgsLTI0LjAxOSAxOS45NDMsLTE5Ljk0MSBMIDAsMCBaXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48L2c+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDE2OS43Niw1Ni43MjcpXCIgZD1cIk0wIDBDLTUuMS0yLjMtMTAuNi0zLjgtMTYuNC00LjUtMTAuNS0xLTYgNC42LTMuOSAxMS4zLTkuNCA4LTE1LjUgNS43LTIyIDQuNC0yNy4zIDkuOS0zNC43IDEzLjQtNDIuOSAxMy40LTU4LjcgMTMuNC03MS42IDAuNi03MS42LTE1LjItNzEuNi0xNy40LTcxLjMtMTkuNi03MC44LTIxLjctOTQuNi0yMC41LTExNS43LTkuMS0xMjkuOCA4LjItMTMyLjMgNC0xMzMuNy0xLTEzMy43LTYuMi0xMzMuNy0xNi4xLTEyOC42LTI0LjktMTIwLjktMzAtMTI1LjYtMjkuOS0xMzAuMS0yOC42LTEzMy45LTI2LjUtMTMzLjktMjYuNi0xMzMuOS0yNi43LTEzMy45LTI2LjgtMTMzLjktNDAuNy0xMjQtNTIuMy0xMTEtNTQuOS0xMTMuNC01NS41LTExNS45LTU1LjktMTE4LjUtNTUuOS0xMjAuMy01NS45LTEyMi4xLTU1LjctMTIzLjktNTUuNC0xMjAuMi02Ni43LTEwOS43LTc1LTk3LjEtNzUuMy0xMDYuOS04Mi45LTExOS4zLTg3LjUtMTMyLjctODcuNS0xMzUtODcuNS0xMzcuMy04Ny40LTEzOS41LTg3LjEtMTI2LjgtOTUuMi0xMTEuOC0xMDAtOTUuNi0xMDAtNDMtMTAwLTE0LjItNTYuMy0xNC4yLTE4LjUtMTQuMi0xNy4zLTE0LjItMTYtMTQuMy0xNC44LTguNy0xMC44LTMuOC01LjcgMCAwXCIvPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgxIDAgMCAtMSA3Mi4zODEgOTAuMTcyKVwiPjxwYXRoIGQ9XCJNODcuMiAwIDg3LjIgMTcuMSA3NSAxNy4xIDc1IDAgNTcuOSAwIDU3LjktMTIuMiA3NS0xMi4yIDc1LTI5LjMgODcuMi0yOS4zIDg3LjItMTIuMiAxMDQuMy0xMi4yIDEwNC4zIDAgODcuMiAwWlwiLz48cGF0aCBkPVwiTTAgMCAwLTE5LjYgMjYuMi0xOS42QzI1LjQtMjMuNyAyMy44LTI3LjUgMjAuOC0zMC42IDEwLjMtNDIuMS05LjMtNDItMjAuNS0zMC40LTMxLjctMTguOS0zMS42LTAuMy0yMC4yIDExLjEtOS40IDIxLjkgOCAyMi40IDE4LjYgMTIuMUwxOC41IDEyLjEgMzIuOCAyNi40QzEzLjcgNDMuOC0xNS44IDQzLjUtMzQuNSAyNS4xLTUzLjggNi4xLTU0LTI1LTM0LjktNDQuMy0xNS45LTYzLjUgMTcuMS02My43IDM0LjktNDQuNiA0NS42LTMzIDQ4LjctMTYuNCA0Ni4yIDBMMCAwWlwiLz48L2c+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDk3LjY3Niw2Mi40MTEpXCIgZD1cIk0wIDBDMTAuMiAwIDE5LjktNC41IDI2LjktMTEuNkwyNi45LTExLjZDMjYuOS04LjIgMjkuMi01LjcgMzIuNC01LjdMMzMuMi01LjdDMzguMi01LjcgMzkuMi0xMC40IDM5LjItMTEuOUwzOS4yLTY0LjhDMzguOS02OC4yIDQyLjgtNzAgNDUtNjcuOCA1My41LTU5LjEgNjMuNi0yMi45IDM5LjctMiAxNy40IDE3LjYtMTIuNSAxNC4zLTI4LjUgMy40LTQ1LjQtOC4zLTU2LjItMzQuMS00NS43LTU4LjQtMzQuMi04NC45LTEuNC05Mi44IDE4LjEtODQuOSAyOC04MC45IDMyLjUtOTQuMyAyMi4zLTk4LjYgNi44LTEwNS4yLTM2LjQtMTA0LjUtNTYuNS02OS42LTcwLjEtNDYuMS02OS40LTQuNi0zMy4zIDE2LjktNS43IDMzLjMgMzAuNyAyOC44IDUyLjcgNS44IDc1LjYtMTguMiA3NC4zLTYzIDUxLjktODAuNSA0MS44LTg4LjQgMjYuNy04MC43IDI2LjgtNjkuMkwyNi43LTY1LjRDMTkuNi03Mi40IDEwLjItNzYuNSAwLTc2LjUtMjAuMi03Ni41LTM4LTU4LjctMzgtMzguNC0zOC0xOC0yMC4yIDAgMCAwTTI1LjUtMzdDMjQuNy0yMi4yIDEzLjctMTMuMyAwLjQtMTMuM0wtMC4xLTEzLjNDLTE1LjQtMTMuMy0yMy45LTI1LjMtMjMuOS0zOS0yMy45LTU0LjMtMTMuNi02NC0wLjEtNjQgMTQuOS02NCAyNC44LTUzIDI1LjUtNDBMMjUuNS0zN1pcIi8+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwibWF0cml4KDAuNDI2MjMgMCAwIDAuNDI2MjMgMzQuOTk5IDM1KVwiPjxwYXRoIGQ9XCJNMTYwLjcgMTkuNWMtMTguOSAwLTM3LjMgMy43LTU0LjcgMTAuOUw3Ni40IDAuN2MtMC44LTAuOC0yLjEtMS0zLjEtMC40QzQ0LjQgMTguMiAxOS44IDQyLjkgMS45IDcxLjdjLTAuNiAxLTAuNSAyLjMgMC40IDMuMWwyOC40IDI4LjRjLTguNSAxOC42LTEyLjggMzguNS0xMi44IDU5LjEgMCA3OC43IDY0IDE0Mi44IDE0Mi44IDE0Mi44IDc4LjcgMCAxNDIuOC02NCAxNDIuOC0xNDIuOEMzMDMuNCA4My41IDIzOS40IDE5LjUgMTYwLjcgMTkuNXpNMjE3LjIgMTQ4LjdsOS45IDQyLjEgOS41IDQ0LjQgLTQ0LjMtOS41IC00Mi4xLTkuOUwzNi43IDEwMi4xYzE0LjMtMjkuMyAzOC4zLTUyLjYgNjguMS02NS44TDIxNy4yIDE0OC43elwiLz48cGF0aCBkPVwiTTIyMS44IDE4Ny40bC03LjUtMzNjLTI1LjkgMTEuOS00Ni40IDMyLjQtNTguMyA1OC4zbDMzIDcuNUMxOTYgMjA2LjIgMjA3LjcgMTk0LjQgMjIxLjggMTg3LjR6XCIvPjwvZz48L3N2Zz4nLFxuICAgICAgJycsLy9waW5cbiAgICAgICcnLC8vZmF2XG4gICAgICAnJywvL3ByaW50XG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw3MS4yNjQsMTA2LjkzKVwiIGQ9XCJNMCAwIDY4LjYgNDMuMUM3MiA0NS4zIDczLjEgNDIuOCA3MS42IDQxLjFMMTQuNi0xMC4yIDExLjctMzUuOCAwIDBaTTg3LjEgNjIuOS0zMy40IDE3LjJDLTQwIDE1LjMtMzkuOCA4LjgtMzQuOSA3LjNMLTQuNy0yLjIgNi44LTM3LjZDOC4yLTQxLjUgOS40LTQyLjkgMTEuOC00MyAxNC4zLTQzIDE1LjMtNDIuMSAxNy45LTM5LjggMjAuOS0zNi45IDI1LjYtMzIuMyAzMy0yNS4yTDY0LjQtNDguNEM3MC4yLTUxLjYgNzQuMy00OS45IDc1LjgtNDNMOTUuNSA1NC40Qzk3LjYgNjIuOSA5Mi42IDY1LjQgODcuMSA2Mi45XCIvPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMzUuMzMsMTE5Ljg1KVwiIGQ9XCJNMCAwQy0yLjQtNS40LTYuNS05LTEyLjItMTAuNi0xNC4zLTExLjItMTYuMy0xMC43LTE4LjItOS45LTQ0LjQgMS4yLTYzLjMgMTkuNi03NCA0Ni4yLTc0LjggNDguMS03NS4zIDUwLjEtNzUuMiA1MS45LTc1LjIgNTguNy02OS4yIDY1LTYyLjYgNjUuNC02MC44IDY1LjUtNTkuMiA2NC45LTU3LjkgNjMuNy01My4zIDU5LjMtNDkuNiA1NC4zLTQ2LjkgNDguNi00NS40IDQ1LjUtNDYgNDMuMy00OC43IDQxLjEtNDkuMSA0MC43LTQ5LjUgNDAuNC01MCA0MC4xLTUzLjUgMzcuNS01NC4zIDM0LjktNTIuNiAzMC44LTQ5LjggMjQuMi00NS40IDE5LTM5LjMgMTUuMS0zNyAxMy42LTM0LjcgMTIuMi0zMiAxMS41LTI5LjYgMTAuOC0yNy43IDExLjUtMjYuMSAxMy40LTI1LjkgMTMuNi0yNS44IDEzLjktMjUuNiAxNC4xLTIyLjMgMTguOC0xOC42IDE5LjYtMTMuNyAxNi41LTkuNiAxMy45LTUuNiAxMS0xLjggNy44IDAuNyA1LjYgMS4zIDMgMCAwTS0xOC4yIDM2LjdDLTE4LjMgMzUuOS0xOC4zIDM1LjQtMTguNCAzNC45LTE4LjYgMzQtMTkuMiAzMy40LTIwLjIgMzMuNC0yMS4zIDMzLjQtMjEuOSAzNC0yMi4yIDM0LjktMjIuMyAzNS41LTIyLjQgMzYuMi0yMi41IDM2LjktMjMuMiA0MC4zLTI1LjIgNDIuNi0yOC42IDQzLjYtMjkuMSA0My43LTI5LjUgNDMuNy0yOS45IDQzLjgtMzEgNDQuMS0zMi40IDQ0LjItMzIuNCA0NS44LTMyLjUgNDcuMS0zMS41IDQ3LjktMjkuNiA0OC0yOC40IDQ4LjEtMjYuNSA0Ny41LTI1LjQgNDYuOS0yMC45IDQ0LjctMTguNyA0MS42LTE4LjIgMzYuN00tMjUuNSA1MS4yQy0yOCA1Mi4xLTMwLjUgNTIuOC0zMy4yIDUzLjItMzQuNSA1My40LTM1LjQgNTQuMS0zNS4xIDU1LjYtMzQuOSA1Ny0zNCA1Ny41LTMyLjYgNTcuNC0yNCA1Ni42LTE3LjMgNTMuNC0xMi42IDQ2LTEwLjUgNDIuNS05LjIgMzcuNS05LjQgMzMuOC05LjUgMzEuMi05LjkgMzAuNS0xMS40IDMwLjUtMTMuNiAzMC42LTEzLjMgMzIuNC0xMy41IDMzLjctMTMuNyAzNS43LTE0LjIgMzcuNy0xNC43IDM5LjctMTYuMyA0NS40LTE5LjkgNDkuMy0yNS41IDUxLjJNLTM4IDY0LjRDLTM3LjkgNjUuOS0zNyA2Ni41LTM1LjUgNjYuNC0yMy4yIDY1LjgtMTMuOSA2Mi4yLTYuNyA1Mi41LTIuNSA0Ni45LTAuMiAzOS4yIDAgMzIuMiAwIDMxLjEgMCAzMCAwIDI5LTAuMSAyNy44LTAuNiAyNi45LTEuOSAyNi45LTMuMiAyNi45LTMuOSAyNy42LTQgMjktNC4zIDM0LjItNS4zIDM5LjMtNy4zIDQ0LjEtMTEuMiA1My41LTE4LjYgNTguNi0yOC4xIDYxLjEtMzAuNyA2MS43LTMzLjIgNjIuMi0zNS44IDYyLjUtMzcgNjIuNS0zOCA2Mi44LTM4IDY0LjRNMTEuNSA3NC4xQzYuNiA3OC4zIDAuOSA4MC44LTUuMyA4Mi40LTIwLjggODYuNS0zNi41IDg3LjUtNTIuNCA4NS4zLTYwLjUgODQuMi02OC4zIDgyLjEtNzUuNCA3OC4xLTgzLjggNzMuNC04OS42IDY2LjYtOTIuMiA1Ny4xLTk0IDUwLjQtOTQuOSA0My42LTk1LjIgMzYuNi05NS43IDI2LjQtOTUuNCAxNi4zLTkyLjggNi4zLTg5LjgtNS4zLTgzLjItMTMuOC03MS45LTE4LjMtNzAuNy0xOC44LTY5LjUtMTkuNS02OC4zLTIwLTY3LjItMjAuNC02Ni44LTIxLjItNjYuOC0yMi40LTY2LjktMzAuNC02Ni44LTM4LjQtNjYuOC00Ni43LTYzLjktNDMuOS02MS44LTQxLjgtNjAuMy00MC4xLTU1LjktMzUuMS01MS43LTMwLjktNDcuMS0yNi4xLTQ0LjctMjMuNy00NS43LTIzLjgtNDIuMS0yMy44LTM3LjgtMjMuOS0zMS0yNC4xLTI2LjgtMjMuOC0xOC42LTIzLjEtMTAuNi0yMi4xLTIuNy0xOS43IDcuMi0xNi43IDE1LjItMTEuNCAxOS4yLTEuMyAyMC4zIDEuMyAyMS40IDQgMjIgNi44IDI1LjkgMjIuOSAyNS40IDM4LjkgMjIuMiA1NSAyMC42IDYyLjQgMTcuNSA2OSAxMS41IDc0LjFcIi8+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDEzMC44NCwxMTIuNylcIiBkPVwiTTAgMEMtMS42IDAuOS05LjQgNS4xLTEwLjggNS43LTEyLjMgNi4zLTEzLjQgNi42LTE0LjUgNS0xNS42IDMuNC0xOC45LTAuMS0xOS45LTEuMS0yMC44LTIuMi0yMS44LTIuMy0yMy40LTEuNC0yNS0wLjUtMzAuMSAxLjQtMzYuMSA3LjEtNDAuNyAxMS41LTQzLjcgMTctNDQuNiAxOC42LTQ1LjUgMjAuMy00NC42IDIxLjEtNDMuOCAyMS45LTQzIDIyLjYtNDIuMSAyMy43LTQxLjMgMjQuNi00MC40IDI1LjUtNDAuMSAyNi4yLTM5LjUgMjcuMi0zOSAyOC4zLTM5LjIgMjkuMy0zOS42IDMwLjEtMzkuOSAzMC45LTQyLjkgMzktNDQuMSA0Mi4zLTQ1LjMgNDUuNS00Ni43IDQ1LTQ3LjYgNDUuMS00OC42IDQ1LjEtNDkuNiA0NS4zLTUwLjcgNDUuMy01MS44IDQ1LjQtNTMuNiA0NS01NS4xIDQzLjUtNTYuNiA0MS45LTYxIDM4LjItNjEuMyAzMC4yLTYxLjYgMjIuMy01Ni4xIDE0LjQtNTUuMyAxMy4zLTU0LjUgMTIuMi00NC44LTUuMS0yOC42LTEyLjEtMTIuNC0xOS4yLTEyLjQtMTcuMS05LjQtMTYuOS02LjQtMTYuOCAwLjMtMTMuNCAxLjgtOS42IDMuMy01LjkgMy40LTIuNyAzLTIgMi42LTEuMyAxLjYtMC45IDAgME0tMjkuNy0zOC4zQy00MC40LTM4LjMtNTAuMy0zNS4xLTU4LjYtMjkuNkwtNzguOS0zNi4xLTcyLjMtMTYuNUMtNzguNi03LjgtODIuMyAyLjgtODIuMyAxNC40LTgyLjMgNDMuNC01OC43IDY3LjEtMjkuNyA2Ny4xLTAuNiA2Ny4xIDIzIDQzLjQgMjMgMTQuNCAyMy0xNC43LTAuNi0zOC4zLTI5LjctMzguM00tMjkuNyA3Ny42Qy02NC42IDc3LjYtOTIuOSA0OS4zLTkyLjkgMTQuNC05Mi45IDIuNC04OS42LTguOC04My45LTE4LjNMLTk1LjMtNTIuMi02MC4yLTQxQy01MS4yLTQ2LTQwLjgtNDguOS0yOS43LTQ4LjkgNS4zLTQ4LjkgMzMuNi0yMC42IDMzLjYgMTQuNCAzMy42IDQ5LjMgNS4zIDc3LjYtMjkuNyA3Ny42XCIvPjwvc3ZnPicsXG4gICAgXTtcbiAgICB2YXIgaWNvbj1zdmdbal07XG4gICAgdmFyIGNzcz0nIHN0eWxlPVwid2lkdGg6JytzaXplKydweDtoZWlnaHQ6JytzaXplKydweFwiICc7XG4gICAgaWNvbj0nPHN2ZyBjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2Qtc3ZnXCInK2NzcytpY29uLnN1YnN0cmluZyg0KTtcbiAgICBpY29uPSc+JytpY29uLnN1YnN0cmluZygwLCBpY29uLmxlbmd0aCAtIDEpO1xuICB9ZWxzZXtcbiAgICBpY29uPSdzdHlsZT1cImRpc3BsYXk6aW5saW5lLWJsb2NrO3ZlcnRpY2FsLWFsaWduOmJvdHRvbTt3aWR0aDonK3NpemUrJ3B4O2hlaWdodDonK3NpemUrJ3B4O21hcmdpbjowIDZweCA2cHggMDtwYWRkaW5nOjA7b3V0bGluZTpub25lO2JhY2tncm91bmQ6dXJsKCcgKyBmICsgZm4gKyAnKSAtJyArIHNpemUgKiBqICsgJ3B4IDAgbm8tcmVwZWF0OyBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1wiJ1xuICB9XG4gIHJldHVybiBpY29uO1xufVxuXG5mdW5jdGlvbiBmYXYoYSkge1xuICB2YXIgdGl0bGUgPSBkb2N1bWVudC50aXRsZTtcbiAgdmFyIHVybCA9IGRvY3VtZW50LmxvY2F0aW9uO1xuICB0cnkge1xuICAgIHdpbmRvdy5leHRlcm5hbC5BZGRGYXZvcml0ZSh1cmwsIHRpdGxlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRyeSB7XG4gICAgICB3aW5kb3cuc2lkZWJhci5hZGRQYW5lbCh0aXRsZSwgdXJsLCAnJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKHR5cGVvZiAob3BlcmEpID09ICdvYmplY3QnIHx8IHdpbmRvdy5zaWRlYmFyKSB7XG4gICAgICAgIGEucmVsID0gJ3NpZGViYXInO1xuICAgICAgICBhLnRpdGxlID0gdGl0bGU7XG4gICAgICAgIGEudXJsID0gdXJsO1xuICAgICAgICBhLmhyZWYgPSB1cmw7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoJ9Cd0LDQttC80LjRgtC1IEN0cmwtRCwg0YfRgtC+0LHRiyDQtNC+0LHQsNCy0LjRgtGMINGB0YLRgNCw0L3QuNGG0YMg0LIg0LfQsNC60LvQsNC00LrQuCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHNlbmRfcHJvbW8ocHJvbW8sIHByb21vdXJsKXtcbiAgJC5hamF4KHtcbiAgICBtZXRob2Q6IFwicG9zdFwiLFxuICAgIHVybDogcHJvbW91cmwsXG4gICAgLy91cmw6IFwiL2FjY291bnQvcHJvbW9cIixcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIGRhdGE6IHtwcm9tbzogcHJvbW99LFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGlmIChkYXRhLnRpdGxlICE9IG51bGwgJiYgZGF0YS5tZXNzYWdlICE9IG51bGwpIHtcbiAgICAgICAgb25fcHJvbW89JCgnLm9uX3Byb21vJyk7XG4gICAgICAgIGlmKG9uX3Byb21vLmxlbmd0aD09MCB8fCAhb25fcHJvbW8uaXMoJzp2aXNpYmxlJykpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEudGl0bGUsXG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkYXRhLm1lc3NhZ2VcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIG9uX3Byb21vLnNob3coKTtcbiAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG4iLCIkKCcuc2Nyb2xsX2JveC10ZXh0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblxuICAgJCh0aGlzKS5jbG9zZXN0KCcuc2Nyb2xsX2JveCcpLmZpbmQoJy5zY3JvbGxfYm94LWl0ZW0nKS5yZW1vdmVDbGFzcygnc2Nyb2xsX2JveC1pdGVtLWxvdycpO1xuXG59KTsiLCJ2YXIgcGxhY2Vob2xkZXIgPSAoZnVuY3Rpb24oKXtcbiAgZnVuY3Rpb24gb25CbHVyKCl7XG4gICAgdmFyIGlucHV0VmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuICAgIGlmICggaW5wdXRWYWx1ZSA9PSBcIlwiICkge1xuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdmb2N1c2VkJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25Gb2N1cygpe1xuICAgICQodGhpcykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnZm9jdXNlZCcpO1xuICB9XG5cblxuICBmdW5jdGlvbiBydW4ocGFyKSB7XG4gICAgdmFyIGVscztcbiAgICBpZighcGFyKVxuICAgICAgZWxzPSQoJy5mb3JtLWdyb3VwIFtwbGFjZWhvbGRlcl0nKTtcbiAgICBlbHNlXG4gICAgICBlbHM9JChwYXIpLmZpbmQoJy5mb3JtLWdyb3VwIFtwbGFjZWhvbGRlcl0nKTtcblxuICAgIGVscy5mb2N1cyhvbkZvY3VzKTtcbiAgICBlbHMuYmx1cihvbkJsdXIpO1xuXG4gICAgZm9yKHZhciBpID0gMDsgaTxlbHMubGVuZ3RoO2krKyl7XG4gICAgICB2YXIgZWw9ZWxzLmVxKGkpO1xuICAgICAgdmFyIHRleHQgPSBlbC5hdHRyKCdwbGFjZWhvbGRlcicpO1xuICAgICAgZWwuYXR0cigncGxhY2Vob2xkZXInLCcnKTtcbiAgICAgIGlmKHRleHQubGVuZ3RoPDIpY29udGludWU7XG4gICAgICAvL2lmKGVsLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykubGVuZ3RoPT0wKXJldHVybjtcblxuICAgICAgdmFyIGlucHV0VmFsdWUgPSBlbC52YWwoKTtcbiAgICAgIHZhciBlbF9pZCA9IGVsLmF0dHIoJ2lkJyk7XG4gICAgICBpZighZWxfaWQpe1xuICAgICAgICBlbF9pZD0nZWxfZm9ybXNfJytNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkqMTAwMDApO1xuICAgICAgICBlbC5hdHRyKCdpZCcsZWxfaWQpXG4gICAgICB9XG5cbiAgICAgIGlmKHRleHQuaW5kZXhPZignfCcpPjApe1xuICAgICAgICB0ZXh0PXRleHQuc3BsaXQoJ3wnKTtcbiAgICAgICAgdGV4dD10ZXh0WzBdK1wiPHNwYW4+XCIrdGV4dFsxXStcIjwvc3Bhbj5cIlxuICAgICAgfVxuXG4gICAgICB2YXIgZGl2ID0gJCgnPGxhYmVsLz4nLHtcbiAgICAgICAgJ2NsYXNzJzoncGxhY2Vob2xkZXInLFxuICAgICAgICAnaHRtbCc6IHRleHQsXG4gICAgICAgICdmb3InOmVsX2lkXG4gICAgICB9KTtcbiAgICAgIGVsLmJlZm9yZShkaXYpO1xuXG4gICAgICBvbkZvY3VzLmJpbmQoZWwpKClcbiAgICAgIG9uQmx1ci5iaW5kKGVsKSgpXG4gICAgfVxuICB9XG5cbiAgcnVuKCk7XG4gIHJldHVybiBydW47XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAvL9Cx0LvQvtC60Lgg0L/QvtC00LvQtdC20LDRidC40LUg0LfQsNCz0YDRg9C30LrQtSDQldGB0LvQuCDRgtCw0LrQuNC1INC10YHRgtGMICwg0YLQviDRgdGA0LDQt9GDINC30LDQv9GA0L7RgVxuICAgIHZhciByZXF1ZXN0cyA9IGZhbHNlO1xuXG4gICAgaWYgKHR5cGVvZiBhamF4X3JlcXVlc3RzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXF1ZXN0cyA9IEpTT04ucGFyc2UoYWpheF9yZXF1ZXN0cyk7XG4gICAgICAgIGZvciAodmFyIGk9MCA7IGkgPCByZXF1ZXN0cy5sZW5ndGg7IGkrKykgIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSByZXF1ZXN0c1tpXS51cmwgPyByZXF1ZXN0c1tpXS51cmwgOiBsb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgZ2V0RGF0YSh1cmwsIHJlcXVlc3RzW2ldLmJsb2NrcywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2hhcmU0MigpOy8vdCDQvtGC0L7QsdGA0LDQt9C40LvQuNGB0Ywg0LrQvdC+0L/QutC4INCf0L7QtNC10LvQuNGC0YzRgdGPXG4gICAgICAgICAgICAgICAgc2RUb29sdGlwLnNldEV2ZW50cygpOy8v0YDQsNCx0L7RgtCw0LvQuCDRgtGD0LvRgtC40L/Ri1xuICAgICAgICAgICAgICAgIGJhbm5lci5yZWZyZXNoKCk7Ly/QvtCx0L3QvtCy0LjRgtGMINCx0LDQvdC90LXRgCDQvtGCINCz0YPQs9C7XG4gICAgICAgICAgICAgICAgaW1hZ2VzVGVzdCgpOy8v0L/RgNC+0LLQtdGA0LrQsCDQutCw0YDRgtC40L3QvtC6XG4gICAgICAgICAgICAgICAgc2RfYWNjb3JkZW9uKCk7Ly/RgNCw0LHQvtGC0LDQuyDQsNC60LrQvtGA0LTQtdC+0L1cbiAgICAgICAgICAgICAgICBwcm9kdWN0X2ZpbHRlcigpOy8v0L/QvtC70LfRg9C90L7QuiDRhtC10L3Ri1xuICAgICAgICAgICAgfSwgbnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8v0L/RgNC4INC60LvQuNC60LUg0L3QsCDQutC90L7Qv9C60LhcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5hamF4X2xvYWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICB2YXIgdXJsID0gJCh0aGF0KS5hdHRyKCdocmVmJyk7XG4gICAgICAgIHZhciB0b3AgPSBNYXRoLm1heChkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCk7XG4gICAgICAgIHZhciBzdG9yZXNTb3J0ID0gJCgnLmNhdGFsb2ctc3RvcmVzX3NvcnQnKTsvL9Cx0LvQvtC6INGB0L7RgNGC0LjRgNC+0LLQutC4INGN0LvQtdC80LXQvdGC0L7QslxuICAgICAgICB2YXIgdGFibGUgPSAkKCd0YWJsZS50YWJsZScpOy8v0YLQsNCx0LvQuNGG0LAg0LIgYWNjb3VudFxuICAgICAgICAvL3Njcm9sbCDRgtGD0LTQsCDQuNC70Lgg0YLRg9C00LBcbiAgICAgICAgdmFyIHNjcm9sbFRvcCA9IHN0b3Jlc1NvcnQubGVuZ3RoID8gJChzdG9yZXNTb3J0WzBdKS5vZmZzZXQoKS50b3AgLSAkKCcjaGVhZGVyPionKS5lcSgwKS5oZWlnaHQoKSAtIDUwIDogMDtcbiAgICAgICAgaWYgKHNjcm9sbFRvcCA9PT0wICYmIHRhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgc2Nyb2xsVG9wID0gJCh0YWJsZVswXSkub2Zmc2V0KCkudG9wIC0gJCgnI2hlYWRlcj4qJykuZXEoMCkuaGVpZ2h0KCkgLSA1MDtcbiAgICAgICAgfVxuXG4gICAgICAgICQodGhhdCkuYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgdmFyIGJsb2NrcyA9IFsnY29udGVudC13cmFwJ107Ly/QsdC70L7QuiDQv9C+INGD0LzQvtC70YfQsNC90LjRjtGOXG4gICAgICAgIGlmIChyZXF1ZXN0cykge1xuICAgICAgICAgICAgLy/QtdGB0LvQuCDQt9Cw0LTQsNC90Ysg0LfQsNC/0YDQvtGB0YssINGC0L4g0LfQsNC80LXQvdCwINCx0LvQvtC60L7QsiDQuNC3INGBINC/0LXRgNCy0L7Qs9C+INC30LDQv9GA0L7RgdCwXG4gICAgICAgICAgICBibG9ja3MgPSByZXF1ZXN0c1swXS5ibG9ja3M7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGdldERhdGEodXJsLCBibG9ja3MsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzaGFyZTQyKCk7Ly/QvtGC0L7QsdGA0LDQt9C40LvQuNGB0Ywg0LrQvdC+0L/QutC4INCf0L7QtNC10LvQuNGC0YzRgdGPXG4gICAgICAgICAgICBzZFRvb2x0aXAuc2V0RXZlbnRzKCk7Ly/RgNCw0LHQvtGC0LDQu9C4INGC0YPQu9GC0LjQv9GLXG4gICAgICAgICAgICBiYW5uZXIucmVmcmVzaCgpOy8v0L7QsdC90L7QstC40YLRjCDQsdCw0L3QvdC10YAg0L7RgiDQs9GD0LPQu1xuICAgICAgICAgICAgaW1hZ2VzVGVzdCgpOy8v0L/RgNC+0LLQtdGA0LrQsCDQutCw0YDRgtC40L3QvtC6XG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoXCJvYmplY3Qgb3Igc3RyaW5nXCIsIFwiVGl0bGVcIiwgdXJsKTtcbiAgICAgICAgICAgICQodGhhdCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgICAgIGlmICh0b3AgPiBzY3JvbGxUb3ApIHtcbiAgICAgICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiBzY3JvbGxUb3B9LCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2RfYWNjb3JkZW9uKCk7XG4gICAgICAgIH0sZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhhdCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe3R5cGU6J2VycicsICd0aXRsZSc6bGcoJ2Vycm9yJyksICdtZXNzYWdlJzpsZygnZXJyb3JfcXVlcnlpbmdfZGF0YScpfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZ2V0RGF0YSh1cmwsIGJsb2Nrcywgc3VjY2VzcywgZmFpbCkgeyAvL3VybCwgYmxvY2tzLCBzdWNjZXNDb2xsYmFjaywgZmFpbENhbGxiYWNrXG4gICAgICAgIHVybCArPSB1cmwuaW5kZXhPZignPycpID4gLSAxID8gJyZnPWFqYXhfbG9hZCcgOiAnP2c9YWpheF9sb2FkJztcbiAgICAgICAgJC5nZXQodXJsLCB7fSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmZpbmQoJyMnICsgYmxvY2tzW2ldKS5odG1sKCQoZGF0YSkuZmluZCgnIycgKyBibG9ja3NbaV0pLmh0bWwoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoZmFpbCkge1xuICAgICAgICAgICAgICAgIGZhaWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG59KSgpO1xuIiwiYmFubmVyID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIHJlZnJlc2goKXtcbiAgICAgICAgZm9yKGk9MDtpPCQoJy5hZHNieWdvb2dsZScpLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgKGFkc2J5Z29vZ2xlID0gd2luZG93LmFkc2J5Z29vZ2xlIHx8IFtdKS5wdXNoKHt9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge3JlZnJlc2g6IHJlZnJlc2h9XG59KSgpOyIsInZhciBjb3VudHJ5X3NlbGVjdCA9IGZ1bmN0aW9uKCl7XG5cbiAgICAkKCcuaGVhZGVyLWNvdW50cmllc19kaWFsb2ctY2xvc2UnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgZGlhbG9nQ2xvc2UodGhpcyk7XG4gICAgfSk7XG5cbiAgICAkKCcuaGVhZGVyLWNvdW50cmllc19kaWFsb2ctZGlhbG9nLWJ1dHRvbi1hcHBseScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGF0ZSA9IG5ldyhEYXRlKTtcbiAgICAgICAgZGF0ZSA9IE1hdGgucm91bmQoZGF0ZS5nZXRUaW1lKCkvMTAwMCk7XG4gICAgICAgIHNldENvb2tpZUFqYXgoJ19zZF9jb3VudHJ5X2RpYWxvZ19jbG9zZScsIGRhdGUsIDcpO1xuICAgICAgICBkaWFsb2dDbG9zZSh0aGlzKTtcbiAgICB9KTtcblxuICAgICQoJy5oZWFkZXItY291bnRyaWVzX2RpYWxvZy1kaWFsb2ctYnV0dG9uLWNob29zZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQutC70LDRgdGBLCDQuNC80LjRgtC40YDQvtCy0LDRgtGMIGhvdmVyXG4gICAgICAgICQoJyNoZWFkZXItdXBsaW5lLXJlZ2lvbi1zZWxlY3QtYnV0dG9uJykuYWRkQ2xhc3MoXCJvcGVuXCIpO1xuICAgICAgICBkaWFsb2dDbG9zZSh0aGlzKTtcbiAgICB9KTtcblxuICAgICQoJy5oZWFkZXItdXBsaW5lX2xhbmctbGlzdCcpLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgIH0pO1xuXG4gICAgdmFyIGRpYWxvZ0Nsb3NlID0gZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAkKCcuaGVhZGVyLXVwbGluZV9sYW5nLWxpc3QnKS5yZW1vdmVDbGFzcygnaW5hY3RpdmUnKTtcbiAgICAgICAgJChlbGVtKS5jbG9zZXN0KCcuaGVhZGVyLWNvdW50cmllc19kaWFsb2cnKS5mYWRlT3V0KCk7XG4gICAgfTtcbn0oKTsiLCIoZnVuY3Rpb24gKCkge1xuXG5cbiAgICAvLyBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgdmFyIHRpbWUgPSAobmV3IERhdGUpLmdldFRpbWUoKS8xMDAwO1xuICAgIC8vICAgICB2YXIgdXNlcnMgPSAxMDAgKiBNYXRoLnNpbih0aW1lKSArIDIgKiBNYXRoLnNpbih0aW1lLzEwKzMpKiB0aW1lO1xuICAgIC8vICAgICBjb25zb2xlLmxvZyh1c2Vycyk7XG4gICAgLy8gfSwgMTUwMCk7XG5cblxuXG59KSgpOyIsImZ1bmN0aW9uIHByb2R1Y3RfZmlsdGVyKCkge1xuXG4gICAgdmFyIHNsaWRlciA9ICQoXCIjZmlsdGVyLXNsaWRlci1wcmljZVwiKTtcbiAgICB2YXIgdGV4dFN0YXJ0ID0gJCgnI3NsaWRlci1wcmljZS1zdGFydCcpO1xuICAgIHZhciB0ZXh0RmluaXNoID0gJCgnI3NsaWRlci1wcmljZS1lbmQnKTtcblxuICAgIHZhciBzdGFydFJhbmdlID0gcGFyc2VJbnQoJCh0ZXh0U3RhcnQpLmRhdGEoJ3JhbmdlJyksIDEwKSxcbiAgICAgICAgZmluaXNoUmFuZ2UgPSBwYXJzZUludCgkKHRleHRGaW5pc2gpLmRhdGEoJ3JhbmdlJyksIDEwKSxcbiAgICAgICAgc3RhcnRVc2VyID0gcGFyc2VJbnQoJCh0ZXh0U3RhcnQpLmRhdGEoJ3VzZXInKSwgMTApLFxuICAgICAgICBmaW5pc2hVc2VyID0gcGFyc2VJbnQoJCh0ZXh0RmluaXNoKS5kYXRhKCd1c2VyJyksIDEwKTtcbiAgICAvL2NvbnNvbGUubG9nKHN0YXJ0UmFuZ2UsIGZpbmlzaFJhbmdlLCBzdGFydFVzZXIsIGZpbmlzaFVzZXIpO1xuICAgIHNsaWRlci5zbGlkZXIoe1xuICAgICAgICByYW5nZTogdHJ1ZSxcbiAgICAgICAgbWluOiBzdGFydFJhbmdlLFxuICAgICAgICBtYXg6IGZpbmlzaFJhbmdlLFxuICAgICAgICB2YWx1ZXM6IFtzdGFydFVzZXIsXG4gICAgICAgICAgICBmaW5pc2hVc2VyXSxcbiAgICAgICAgc2xpZGU6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHVpLnZhbHVlc1sgMCBdICsgXCIgLSBcIiArIHVpLnZhbHVlc1sgMSBdKTtcbiAgICAgICAgICAgICQodGV4dFN0YXJ0KS52YWwodWkudmFsdWVzWzBdKTtcbiAgICAgICAgICAgICQodGV4dEZpbmlzaCkudmFsKHVpLnZhbHVlc1sxXSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgZnVuY3Rpb24gcHJpY2VTdGFydENoYW5nZShlKSB7XG4gICAgICAgIHZhciB0aGF0ID0gJCh0aGlzKSxcbiAgICAgICAgICAgIHN0clZhbHVlID0gdGhhdC52YWwoKSxcbiAgICAgICAgICAgIGludFZhbHVlID0gcGFyc2VJbnQoc3RyVmFsdWUpIHx8IDAsLy/QtdGB0LvQuCDQvdC10L/RgNCw0LLQuNC70YzQvdC+LCDRgtC+IDBcbiAgICAgICAgICAgIHN0YXJ0UmFuZ2UgPSBwYXJzZUludCh0aGF0LmRhdGEoJ3JhbmdlJykpLFxuICAgICAgICAgICAgZmluaXNoUmFuZ2UgPSBwYXJzZUludCh0ZXh0RmluaXNoLnZhbCgpKTtcblxuICAgICAgICBpZiAoaW50VmFsdWUgPCBzdGFydFJhbmdlKSB7IC8v0LXRgdC70Lgg0LzQtdC90YzRiNC1INC00LjQsNC/0LDQt9C+0L3QsCwg0YLQviDQv9C+INC90LjQttC90LXQvNGDINC/0YDQtdC00LXQu9GDXG4gICAgICAgICAgICBpbnRWYWx1ZSA9IHN0YXJ0UmFuZ2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGludFZhbHVlID4gZmluaXNoUmFuZ2UpIHsgLy/QtdGB0LvQuCDQstGL0YjQtSDQtNC40LDQv9Cw0LfQvtC90LAsINGC0L4gINCy0LXRgNGF0L3QuNC80YMg0L/RgNC10LTQtdC70YNcbiAgICAgICAgICAgIGludFZhbHVlID0gZmluaXNoUmFuZ2U7XG4gICAgICAgIH1cbiAgICAgICAgc2xpZGVyLnNsaWRlcigndmFsdWVzJywgMCwgaW50VmFsdWUpOyAvL9C90L7QstC+0LUg0LfQvdCw0YfQtdC90LjQtSDRgdC70LDQudC00LXRgNCwXG4gICAgICAgIHRoYXQudmFsKGludFZhbHVlKTsgIC8v0L/QvtCy0YLRgNC+0Y/QtdC8INC10LPQviDQtNC70Y8g0YHQsNC80L7Qs9C+INC/0L7Qu9GPXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpY2VGaW5pc2hDaGFuZ2UoZSkge1xuICAgICAgICB2YXIgdGhhdCA9ICQodGhpcyksXG4gICAgICAgICAgICBzdGFydFJhbmdlID0gcGFyc2VJbnQodGV4dFN0YXJ0LnZhbCgpKSxcbiAgICAgICAgICAgIHN0clZhbHVlID0gdGhhdC52YWwoKSxcbiAgICAgICAgICAgIGZpbmlzaFJhbmdlID0gcGFyc2VJbnQodGhhdC5kYXRhKCdyYW5nZScpKSxcbiAgICAgICAgICAgIGludFZhbHVlID0gcGFyc2VJbnQoc3RyVmFsdWUpIHx8IGZpbmlzaFJhbmdlOy8v0LXRgdC70Lgg0L3QtdC/0YDQsNCy0LjQu9GM0L3Qviwg0YLQviDQvNCw0LrRgdC40LzRg9C8XG5cbiAgICAgICAgaWYgKGludFZhbHVlIDwgc3RhcnRSYW5nZSkgeyAvL9C10YHQu9C4INC80LXQvdGM0YjQtSDQtNC40LDQv9Cw0LfQvtC90LAsINGC0L4g0L/QviDQvdC40LbQvdC10LzRgyDQv9GA0LXQtNC10LvRg1xuICAgICAgICAgICAgaW50VmFsdWUgPSBzdGFydFJhbmdlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnRWYWx1ZSA+IGZpbmlzaFJhbmdlKSB7IC8v0LXRgdC70Lgg0LLRi9GI0LUg0LTQuNCw0L/QsNC30L7QvdCwLCDRgtC+ICDQstC10YDRhdC90LjQvNGDINC/0YDQtdC00LXQu9GDXG4gICAgICAgICAgICBpbnRWYWx1ZSA9IGZpbmlzaFJhbmdlO1xuICAgICAgICB9XG4gICAgICAgIHNsaWRlci5zbGlkZXIoJ3ZhbHVlcycsIDEsIGludFZhbHVlKTsgLy/QvdC+0LLQvtC1INC30L3QsNGH0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsFxuICAgICAgICB0aGF0LnZhbChpbnRWYWx1ZSk7ICAvL9C/0L7QstGC0YDQvtGP0LXQvCDQtdCz0L4g0LTQu9GPINGB0LDQvNC+0LPQviDQv9C+0LvRj1xuXG4gICAgfVxuXG4gICAgdGV4dFN0YXJ0Lm9uKCdjaGFuZ2UnLCBwcmljZVN0YXJ0Q2hhbmdlKTsvL9C/0YDQuCDQuNC30LzQtdC90LXQvdC40LjQuCDQv9C+0LvQtdC5INCy0LLQvtC00LAg0YbQtdC90YtcbiAgICB0ZXh0RmluaXNoLm9uKCdjaGFuZ2UnLCBwcmljZUZpbmlzaENoYW5nZSk7Ly/Qv9GA0Lgg0LjQt9C80LXQvdC10L3QuNC40Lgg0L/QvtC70LXQuSDQstCy0L7QtNCwINGG0LXQvdGLXG5cbiAgICAkKCdpbnB1dC5jYXRhbG9nX3Byb2R1Y3RfZmlsdGVyLWNoZWNrYm94X2l0ZW0tY2hlY2tib3gnKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKCQodGhpcykucHJvcCgnY2hlY2tlZCcpKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKCdjaGVja2VkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxufVxucHJvZHVjdF9maWx0ZXIoKTsiLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbnRlaW5lcjtcbiAgdmFyIG1vdXNlT3ZlciA9IDA7XG4gIHZhciB0aW1lckNsZWFyQWxsID0gbnVsbDtcbiAgdmFyIGFuaW1hdGlvbkVuZCA9ICd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJztcbiAgdmFyIHRpbWUgPSAxMDAwMDtcblxuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9IGZhbHNlO1xuICB2YXIgaXNfaW5pdCA9IGZhbHNlO1xuICB2YXIgY29uZmlybV9vcHQgPSB7XG4gICAgLy8gdGl0bGU6IGxnKCdkZWxldGluZycpLFxuICAgIC8vIHF1ZXN0aW9uOiBsZygnYXJlX3lvdV9zdXJlX3RvX2RlbGV0ZScpLFxuICAgIC8vIGJ1dHRvblllczogbGcoJ3llcycpLFxuICAgIC8vIGJ1dHRvbk5vOiBsZygnbm8nKSxcbiAgICBjYWxsYmFja1llczogZmFsc2UsXG4gICAgY2FsbGJhY2tObzogZmFsc2UsXG4gICAgb2JqOiBmYWxzZSxcbiAgICBidXR0b25UYWc6ICdkaXYnLFxuICAgIGJ1dHRvblllc0RvcDogJycsXG4gICAgYnV0dG9uTm9Eb3A6ICcnXG4gIH07XG4gIHZhciBhbGVydF9vcHQgPSB7XG4gICAgdGl0bGU6IFwiXCIsXG4gICAgcXVlc3Rpb246ICdtZXNzYWdlJyxcbiAgICAvLyBidXR0b25ZZXM6IGxnKCd5ZXMnKSxcbiAgICBjYWxsYmFja1llczogZmFsc2UsXG4gICAgYnV0dG9uVGFnOiAnZGl2JyxcbiAgICBvYmo6IGZhbHNlXG4gIH07XG5cbiAgZnVuY3Rpb24gdGVzdElwaG9uZSgpIHtcbiAgICBpZiAoIS8oaVBob25lfGlQYWR8aVBvZCkuKihPUyAxMSkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHJldHVybjtcbiAgICBub3RpZmljYXRpb25fYm94LmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcbiAgICBub3RpZmljYXRpb25fYm94LmNzcygndG9wJywgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBpc19pbml0ID0gdHJ1ZTtcbiAgICBub3RpZmljYXRpb25fYm94ID0gJCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcbiAgICBpZiAobm90aWZpY2F0aW9uX2JveC5sZW5ndGggPiAwKXJldHVybjtcblxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XG4gICAgbm90aWZpY2F0aW9uX2JveCA9ICQoJy5ub3RpZmljYXRpb25fYm94Jyk7XG5cbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2NvbnRyb2wnLCBjbG9zZU1vZGFsKTtcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2Nsb3NlJywgY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCBjbG9zZU1vZGFsRm9uKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XG4gICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xuICAgICQoJy5ub3RpZmljYXRpb25fYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoJycpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbEZvbihlKSB7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBpZiAodGFyZ2V0LmNsYXNzTmFtZSA9PSBcIm5vdGlmaWNhdGlvbl9ib3hcIikge1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBfc2V0VXBMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubm90aWZpY2F0aW9uX2Nsb3NlJywgX2Nsb3NlUG9wdXApO1xuICAgICQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkVudGVyKTtcbiAgICAkKCdib2R5Jykub24oJ21vdXNlbGVhdmUnLCAnLm5vdGlmaWNhdGlvbl9jb250YWluZXInLCBfb25MZWF2ZSk7XG4gIH07XG5cbiAgdmFyIF9vbkVudGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwgIT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2xlYXJBbGwpO1xuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICB2YXIgb3B0aW9uID0gJCh0aGlzKS5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmIChvcHRpb24udGltZXIpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KG9wdGlvbi50aW1lcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgbW91c2VPdmVyID0gMTtcbiAgfTtcblxuICB2YXIgX29uTGVhdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgICR0aGlzID0gJCh0aGlzKTtcbiAgICAgIHZhciBvcHRpb24gPSAkdGhpcy5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmIChvcHRpb24udGltZSA+IDApIHtcbiAgICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKG9wdGlvbi5jbG9zZSksIG9wdGlvbi50aW1lIC0gMTUwMCArIDEwMCAqIGkpO1xuICAgICAgICAkdGhpcy5kYXRhKCdvcHRpb24nLCBvcHRpb24pXG4gICAgICB9XG4gICAgfSk7XG4gICAgbW91c2VPdmVyID0gMDtcbiAgfTtcblxuICB2YXIgX2Nsb3NlUG9wdXAgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCk7XG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbiAoKSB7XG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgIH0pO1xuICAgICR0aGlzLmFkZENsYXNzKCdub3RpZmljYXRpb25faGlkZScpXG4gIH07XG5cbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSkge1xuICAgIGlmICghZGF0YSlkYXRhID0ge307XG4gICAgYWxlcnRfb3B0ID0gb2JqZWN0cyhhbGVydF9vcHQsIHtcbiAgICAgICAgYnV0dG9uWWVzOiBsZygneWVzJylcbiAgICB9KTtcbiAgICBkYXRhID0gb2JqZWN0cyhhbGVydF9vcHQsIGRhdGEpO1xuXG4gICAgaWYgKCFpc19pbml0KWluaXQoKTtcbiAgICB0ZXN0SXBob25lKCk7XG5cbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XG5cbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCArPSAnPGRpdj4nK2RhdGEudGl0bGUrJzwvZGl2Pic7XG4gICAgYm94X2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8JyArIGRhdGEuYnV0dG9uVGFnICsgJyBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCIgJyArIGRhdGEuYnV0dG9uWWVzRG9wICsgJz4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC8nICsgZGF0YS5idXR0b25UYWcgKyAnPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJyArIGRhdGEuYnV0dG9uTm9Eb3AgKyAnPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgfSwgMTAwKVxuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKSB7XG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcbiAgICBjb25maXJtX29wdCA9IG9iamVjdHMoY29uZmlybV9vcHQsIHtcbiAgICAgICAgdGl0bGU6IGxnKCdkZWxldGluZycpLFxuICAgICAgICBxdWVzdGlvbjogbGcoJ2FyZV95b3Vfc3VyZV90b19kZWxldGUnKSxcbiAgICAgICAgYnV0dG9uWWVzOiBsZygneWVzJyksXG4gICAgICAgIGJ1dHRvbk5vOiBsZygnbm8nKVxuICAgIH0pO1xuICAgIGRhdGEgPSBvYmplY3RzKGNvbmZpcm1fb3B0LCBkYXRhKTtcbiAgICBpZiAodHlwZW9mKGRhdGEuY2FsbGJhY2tZZXMpID09ICdzdHJpbmcnKSB7XG4gICAgICB2YXIgY29kZSA9ICdkYXRhLmNhbGxiYWNrWWVzID0gZnVuY3Rpb24oKXsnK2RhdGEuY2FsbGJhY2tZZXMrJ30nO1xuICAgICAgZXZhbChjb2RlKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzX2luaXQpaW5pdCgpO1xuICAgIHRlc3RJcGhvbmUoKTtcbiAgICAvL2JveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XG5cbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XG5cbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xuXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xuICAgIGJveF9odG1sICs9IGRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG5cbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG4gICAgaWYgKGRhdGEuY2FsbGJhY2tZZXMgIT0gZmFsc2UpIHtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5feWVzJykub24oJ2NsaWNrJywgZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuICAgIGlmIChkYXRhLmNhbGxiYWNrTm8gIT0gZmFsc2UpIHtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrTm8uYmluZChkYXRhLm9iaikpO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sIDEwMClcblxuICB9XG5cbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xuICAgIHZhciBvcHRpb24gPSB7dGltZTogKGRhdGEudGltZSB8fCBkYXRhLnRpbWUgPT09IDApID8gZGF0YS50aW1lIDogdGltZX07XG4gICAgaWYgKCFjb250ZWluZXIpIHtcbiAgICAgIGNvbnRlaW5lciA9ICQoJzx1bC8+Jywge1xuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcbiAgICAgIH0pO1xuXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XG4gICAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgICB9XG5cbiAgICB2YXIgbGkgPSAkKCc8bGkvPicsIHtcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2l0ZW0nXG4gICAgfSk7XG5cbiAgICBpZiAoZGF0YS50eXBlKSB7XG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XG4gICAgfVxuXG4gICAgdmFyIGNsb3NlID0gJCgnPHNwYW4vPicsIHtcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2Nsb3NlJ1xuICAgIH0pO1xuICAgIG9wdGlvbi5jbG9zZSA9IGNsb3NlO1xuICAgIGxpLmFwcGVuZChjbG9zZSk7XG5cbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicsIHtcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcbiAgICB9KTtcblxuICAgIGlmIChkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHRpdGxlID0gJCgnPGg1Lz4nLCB7XG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXG4gICAgICB9KTtcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XG4gICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSk7XG4gICAgfVxuXG4gICAgdmFyIHRleHQgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGV4dFwiXG4gICAgfSk7XG4gICAgdGV4dC5odG1sKGRhdGEubWVzc2FnZSk7XG5cbiAgICBpZiAoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXG4gICAgICB9KTtcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XG4gICAgICB2YXIgd3JhcCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwid3JhcFwiXG4gICAgICB9KTtcblxuICAgICAgd3JhcC5hcHBlbmQoaW1nKTtcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xuICAgICAgY29udGVudC5hcHBlbmQod3JhcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRleHQpO1xuICAgIH1cbiAgICBsaS5hcHBlbmQoY29udGVudCk7XG5cbiAgICAvL1xuICAgIC8vIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xuICAgIC8vICAgdmFyIHRpdGxlID0gJCgnPHAvPicsIHtcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcbiAgICAvLyAgIH0pO1xuICAgIC8vICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcbiAgICAvLyAgIGxpLmFwcGVuZCh0aXRsZSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcbiAgICAvLyAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxuICAgIC8vICAgfSk7XG4gICAgLy8gICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcbiAgICAvLyAgIGxpLmFwcGVuZChpbWcpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XG4gICAgLy8gICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcbiAgICAvLyB9KTtcbiAgICAvLyBjb250ZW50Lmh0bWwoZGF0YS5tZXNzYWdlKTtcbiAgICAvL1xuICAgIC8vIGxpLmFwcGVuZChjb250ZW50KTtcbiAgICAvL1xuICAgIGNvbnRlaW5lci5hcHBlbmQobGkpO1xuXG4gICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xuICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKGNsb3NlKSwgb3B0aW9uLnRpbWUpO1xuICAgIH1cbiAgICBsaS5kYXRhKCdvcHRpb24nLCBvcHRpb24pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFsZXJ0OiBhbGVydCxcbiAgICBjb25maXJtOiBjb25maXJtLFxuICAgIG5vdGlmaTogbm90aWZpXG4gIH07XG5cbn0pKCk7XG5cblxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGEgPSBlbC5kYXRhKCk7XG5cbiAgZGF0YS5xdWVzdGlvbiA9IGVsLmh0bWwoKTtcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xufSk7XG5cbiQoJ1tyZWY9Y29uZmlybV0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGEgPSBlbC5kYXRhKCk7XG4gIGRhdGEucXVlc3Rpb24gPSBlbC5odG1sKCk7XG4gIG5vdGlmaWNhdGlvbi5jb25maXJtKGRhdGEpO1xufSk7XG5cblxuJCgnLmRpc2FibGVkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkdGhpcyA9ICQodGhpcyk7XG4gIGRhdGEgPSAkdGhpcy5kYXRhKCk7XG4gIGlmIChkYXRhWydidXR0b25feWVzJ10pIHtcbiAgICBkYXRhWydidXR0b25ZZXMnXSA9IGRhdGFbJ2J1dHRvbl95ZXMnXTtcbiAgfVxuICBpZiAoZGF0YVsnYnV0dG9uX3llcyddID09PSBmYWxzZSkge1xuICAgIGRhdGFbJ2J1dHRvblllcyddID0gZmFsc2U7XG4gIH1cblxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tb2RhbHNfb3BlbicsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG5cbiAgICAvL9C/0YDQuCDQvtGC0LrRgNGL0YLQuNC4INGE0L7RgNC80Ysg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuCDQt9Cw0LrRgNGL0YLRjCwg0LXRgdC70Lgg0L7RgtGA0YvRgtC+IC0g0L/QvtC/0LDQvyDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjyDQutGD0L/QvtC90LAg0LHQtdC3INGA0LXQs9C40YHRgtGA0LDRhtC40LhcbiAgICB2YXIgcG9wdXAgPSAkKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikuZGF0YSgncG9wdXAnKTtcbiAgICBpZiAocG9wdXApIHtcbiAgICAgIHBvcHVwLmNsb3NlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvcHVwID0gJCgnZGl2LnBvcHVwX2NvbnQsIGRpdi5wb3B1cF9iYWNrJyk7XG4gICAgICBpZiAocG9wdXApIHtcbiAgICAgICAgcG9wdXAuaGlkZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBocmVmID0gdGhpcy5ocmVmLnNwbGl0KCcjJyk7XG4gICAgaHJlZiA9IGhyZWZbaHJlZi5sZW5ndGggLSAxXTtcbiAgICB2YXIgbm90eUNsYXNzID0gJCh0aGlzKS5kYXRhKCdub3R5Y2xhc3MnKTtcbiAgICB2YXIgY2xhc3NfbmFtZT0oaHJlZi5pbmRleE9mKCd2aWRlbycpID09PSAwID8gJ21vZGFscy1mdWxsX3NjcmVlbicgOiAnbm90aWZ5X3doaXRlJykgKyAnICcgKyBub3R5Q2xhc3M7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxuICAgICAgbm90eWZ5X2NsYXNzOiBcImxvYWRpbmcgXCIgKyBjbGFzc19uYW1lLFxuICAgICAgcXVlc3Rpb246ICcnXG4gICAgfTtcbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG5cbiAgICAkLmdldCgnLycgKyBocmVmLCBmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICB2YXIgZGF0YV9tc2cgPSB7XG4gICAgICAgIGJ1dHRvblllczogZmFsc2UsXG4gICAgICAgIG5vdHlmeV9jbGFzczogY2xhc3NfbmFtZSxcbiAgICAgICAgcXVlc3Rpb246IGRhdGEuaHRtbCxcbiAgICAgIH07XG5cbiAgICAgIGlmIChkYXRhLnRpdGxlKSB7XG4gICAgICAgIGRhdGFfbXNnWyd0aXRsZSddPWRhdGEudGl0bGU7XG4gICAgICB9XG5cbiAgICAgIC8qaWYoZGF0YS5idXR0b25ZZXMpe1xuICAgICAgICBkYXRhX21zZ1snYnV0dG9uWWVzJ109ZGF0YS5idXR0b25ZZXM7XG4gICAgICB9Ki9cbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhX21zZyk7XG4gICAgICBhamF4Rm9ybSgkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKSk7XG4gICAgfSwgJ2pzb24nKTtcblxuICAgIC8vY29uc29sZS5sb2codGhpcyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tb2RhbHNfcG9wdXAnLCBmdW5jdGlvbiAoZSkge1xuICAgIC8v0L/RgNC4INC60LvQuNC60LUg0LLRgdC/0LvRi9Cy0LDRiNC60LAg0YEg0YLQtdC60YHRgtC+0LxcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciB0aXRsZSA9ICQodGhhdCkuZGF0YSgnb3JpZ2luYWwtaCcpO1xuICAgIGlmKCF0aXRsZSl0aXRsZT1cIlwiO1xuICAgIHZhciBodG1sID0gJCgnIycgKyAkKHRoYXQpLmRhdGEoJ29yaWdpbmFsLWh0bWwnKSkuaHRtbCgpO1xuICAgIHZhciBjb250ZW50ID0gaHRtbCA/IGh0bWwgOiAkKHRoYXQpLmRhdGEoJ29yaWdpbmFsLXRpdGxlJyk7XG4gICAgdmFyIG5vdHlDbGFzcyA9ICQodGhhdCkuZGF0YSgnbm90eWNsYXNzJyk7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxuICAgICAgbm90eWZ5X2NsYXNzOiBcIm5vdGlmeV93aGl0ZSBcIiArIG5vdHlDbGFzcyxcbiAgICAgIHF1ZXN0aW9uOiBjb250ZW50LFxuICAgICAgdGl0bGU6IHRpdGxlXG4gICAgfTtcbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pXG59KCkpO1xuIiwiJCgnLmZvb3Rlci1tZW51LXRpdGxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgJHRoaXMgPSAkKHRoaXMpO1xuICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKSkge1xuICAgICR0aGlzLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJylcbiAgfSBlbHNlIHtcbiAgICAkKCcuZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XG4gICAgJHRoaXMuYWRkQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKTtcbiAgfVxuXG59KTtcbiIsIiQoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBzdGFyTm9taW5hdGlvbihpbmRleCkge1xuICAgIHZhciBzdGFycyA9ICQoXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIpO1xuICAgIHN0YXJzLmFkZENsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcbiAgICAgIHN0YXJzLmVxKGkpLnJlbW92ZUNsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcbiAgICB9XG4gIH1cblxuICAkKGRvY3VtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcbiAgfSkub24oXCJtb3VzZWxlYXZlXCIsIFwiLnJhdGluZy13cmFwcGVyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoKSk7XG4gIH0pLm9uKFwiY2xpY2tcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XG5cbiAgICAkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgkKHRoaXMpLmluZGV4KCkgKyAxKTtcbiAgfSk7XG59KTtcbiIsIi8v0LjQt9Cx0YDQsNC90L3QvtC1XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcuZmF2b3JpdGUtbGluaycsIGZ1bmN0aW9uKGUpIHtcbiAgLy8kKFwiLmZhdm9yaXRlLWxpbmtcIikub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgc2VsZiA9ICQodGhpcyk7XG4gICAgdmFyIHR5cGUgPSBzZWxmLmRhdGEoXCJzdGF0ZVwiKSxcbiAgICAgIGFmZmlsaWF0ZV9pZCA9IHNlbGYuZGF0YShcImFmZmlsaWF0ZS1pZFwiKSxcbiAgICAgIHByb2R1Y3RfaWQgPSBzZWxmLmRhdGEoXCJwcm9kdWN0LWlkXCIpO1xuXG4gICAgaWYgKCFhZmZpbGlhdGVfaWQpIHtcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICB0aXRsZTogbGcoXCJyZWdpc3RyYXRpb25faXNfcmVxdWlyZWRcIiksXG4gICAgICAgIG1lc3NhZ2U6IGxnKFwiYWRkX3RvX2Zhdm9yaXRlX21heV9vbmx5X3JlZ2lzdGVyZWRfdXNlclwiKSxcbiAgICAgICAgdHlwZTogJ2VycidcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgfVxuXG4gICAgaWYgKHNlbGYuaGFzQ2xhc3MoJ2Rpc2FibGVkJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBzZWxmLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXG4gICAgLyppZih0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgc2VsZi5maW5kKFwiLml0ZW1faWNvblwiKS5yZW1vdmVDbGFzcyhcIm11dGVkXCIpO1xuICAgICB9Ki9cbiAgICB2YXIgaHJlZiA9ICAkKCcjYWNjb3VudF9mYXZvcml0ZXNfbGluaycpLmF0dHIoJ2hyZWYnKTtcblxuICAgICQucG9zdChocmVmLCB7XG4gICAgICBcInR5cGVcIjogdHlwZSxcbiAgICAgIFwiYWZmaWxpYXRlX2lkXCI6IGFmZmlsaWF0ZV9pZCxcbiAgICAgIFwicHJvZHVjdF9pZFwiOiBwcm9kdWN0X2lkXG4gICAgfSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICBpZiAoZGF0YS5lcnJvcikge1xuICAgICAgICBzZWxmLmZpbmQoJ3N2ZycpLnJlbW92ZUNsYXNzKFwic3BpblwiKTtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTogZGF0YS5lcnJvciwgdHlwZTogJ2VycicsICd0aXRsZSc6IChkYXRhLnRpdGxlID8gZGF0YS50aXRsZSA6IGZhbHNlKX0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICBtZXNzYWdlOiBkYXRhLm1zZyxcbiAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAndGl0bGUnOiAoZGF0YS50aXRsZSA/IGRhdGEudGl0bGUgOiBmYWxzZSlcbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLmRhdGEoXCJzdGF0ZVwiLCBkYXRhW1wiZGF0YS1zdGF0ZVwiXSk7XG4gICAgICBzZWxmLmRhdGEoXCJvcmlnaW5hbC10aXRsZVwiLCBkYXRhW1wiZGF0YS1vcmlnaW5hbC10aXRsZVwiXSk7XG4gICAgICBzZWxmLmZpbmQoJy50aXRsZScpLmh0bWwoZGF0YVtcImRhdGEtb3JpZ2luYWwtdGl0bGVcIl0pO1xuXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gaW5fZmF2X29mZlwiKS5hZGRDbGFzcyhcImluX2Zhdl9vblwiKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRlbGV0ZVwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gaW5fZmF2X29uXCIpLmFkZENsYXNzKFwiaW5fZmF2X29mZlwiKTtcbiAgICAgIH1cblxuICAgIH0sICdqc29uJykuZmFpbChmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgIG1lc3NhZ2U6IGxnKFwidGhlcmVfaXNfdGVjaG5pY2FsX3dvcmtzX25vd1wiKSxcbiAgICAgICAgdHlwZTogJ2VycidcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gaW5fZmF2X29mZlwiKS5hZGRDbGFzcyhcImluX2Zhdl9vblwiKTtcbiAgICAgICAgc2VsZi5kYXRhKCdvcmlnaW5hbC10aXRsZScsIGxnKFwiZmF2b3JpdGVzX3Nob3BfcmVtb3ZlXCIrKHByb2R1Y3RfaWQgPyAnX3Byb2R1Y3QnIDogJycpKSk7XG4gICAgICAgIHNlbGYuZmluZCgnLnRpdGxlJykuaHRtbChsZyhcImZhdm9yaXRlc19zaG9wX3JlbW92ZVwiKyhwcm9kdWN0X2lkID8gJ19wcm9kdWN0JyA6ICcnKSkpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiZGVsZXRlXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb25cIikuYWRkQ2xhc3MoXCJpbl9mYXZfb2ZmXCIpO1xuICAgICAgICBzZWxmLmRhdGEoJ29yaWdpbmFsLXRpdGxlJywgbGcoXCJmYXZvcml0ZXNfc2hvcF9hZGRcIisocHJvZHVjdF9pZCA/ICdfcHJvZHVjdCcgOiAnJykpKTtcbiAgICAgICAgc2VsZi5maW5kKCcudGl0bGUnKS5odG1sKGxnKFwiZmF2b3JpdGVzX3Nob3BfYWRkXCIrKHByb2R1Y3RfaWQgPyAnX3Byb2R1Y3QnIDogJycpKSk7XG4gICAgICB9XG5cbiAgICB9KVxuICB9KTtcbn0pO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAkKCcuc2Nyb2xsX3RvJykuY2xpY2soZnVuY3Rpb24gKGUpIHsgLy8g0LvQvtCy0LjQvCDQutC70LjQuiDQv9C+INGB0YHRi9C70LrQtSDRgSDQutC70LDRgdGB0L7QvCBnb190b1xuICAgIHZhciBzY3JvbGxfZWwgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTsgLy8g0LLQvtC30YzQvNC10Lwg0YHQvtC00LXRgNC20LjQvNC+0LUg0LDRgtGA0LjQsdGD0YLQsCBocmVmLCDQtNC+0LvQttC10L0g0LHRi9GC0Ywg0YHQtdC70LXQutGC0L7RgNC+0LwsINGCLtC1LiDQvdCw0L/RgNC40LzQtdGAINC90LDRh9C40L3QsNGC0YzRgdGPINGBICMg0LjQu9C4IC5cbiAgICBzY3JvbGxfZWwgPSAkKHNjcm9sbF9lbCk7XG4gICAgaWYgKHNjcm9sbF9lbC5sZW5ndGggIT0gMCkgeyAvLyDQv9GA0L7QstC10YDQuNC8INGB0YPRidC10YHRgtCy0L7QstCw0L3QuNC1INGN0LvQtdC80LXQvdGC0LAg0YfRgtC+0LHRiyDQuNC30LHQtdC20LDRgtGMINC+0YjQuNCx0LrQuFxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogc2Nyb2xsX2VsLm9mZnNldCgpLnRvcCAtICQoJyNoZWFkZXI+KicpLmVxKDApLmhlaWdodCgpIC0gNTB9LCA1MDApOyAvLyDQsNC90LjQvNC40YDRg9C10Lwg0YHQutGA0L7QvtC70LjQvdCzINC6INGN0LvQtdC80LXQvdGC0YMgc2Nyb2xsX2VsXG4gICAgICBpZiAoc2Nyb2xsX2VsLmhhc0NsYXNzKCdhY2NvcmRpb24nKSAmJiAhc2Nyb2xsX2VsLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgc2Nyb2xsX2VsLmZpbmQoJy5hY2NvcmRpb24tY29udHJvbCcpLmNsaWNrKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTsgLy8g0LLRi9C60LvRjtGH0LDQtdC8INGB0YLQsNC90LTQsNGA0YLQvdC+0LUg0LTQtdC50YHRgtCy0LjQtVxuICB9KTtcbn0pO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAkKFwiYm9keVwiKS5vbignY2xpY2snLCAnLnNldF9jbGlwYm9hcmQnLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgIGNvcHlUb0NsaXBib2FyZCgkdGhpcy5kYXRhKCdjbGlwYm9hcmQnKSwgJHRoaXMuZGF0YSgnY2xpcGJvYXJkLW5vdGlmeScpKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gY29weVRvQ2xpcGJvYXJkKGNvZGUsIG1zZykge1xuICAgIHZhciAkdGVtcCA9ICQoXCI8aW5wdXQ+XCIpO1xuICAgICQoXCJib2R5XCIpLmFwcGVuZCgkdGVtcCk7XG4gICAgJHRlbXAudmFsKGNvZGUpLnNlbGVjdCgpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiY29weVwiKTtcbiAgICAkdGVtcC5yZW1vdmUoKTtcblxuICAgIGlmICghbXNnKSB7XG4gICAgICBtc2cgPSBsZyhcImRhdGFfY29waWVkX3RvX2NsaXBib2FyZFwiKTtcbiAgICB9XG4gICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7J3R5cGUnOiAnaW5mbycsICdtZXNzYWdlJzogbXNnLCAndGl0bGUnOiBsZygnc3VjY2VzcycpfSlcbiAgfVxuXG4gICQoXCJib2R5XCIpLm9uKCdjbGljaycsIFwiaW5wdXQubGlua1wiLCBmdW5jdGlvbiAoKSB7XHQvLyDQv9C+0LvRg9GH0LXQvdC40LUg0YTQvtC60YPRgdCwINGC0LXQutGB0YLQvtCy0YvQvCDQv9C+0LvQtdC8LdGB0YHRi9C70LrQvtC5XG4gICAgJCh0aGlzKS5zZWxlY3QoKTtcbiAgfSk7XG59KTtcbiIsIi8v0YHQutCw0YfQuNCy0LDQvdC40LUg0LrQsNGA0YLQuNC90L7QulxuKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCkge1xuICAgIHZhciBkYXRhID0gdGhpcztcbiAgICB2YXIgaW1nID0gZGF0YS5pbWc7XG4gICAgaW1nLndyYXAoJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPjwvZGl2PicpO1xuICAgIHZhciB3cmFwID0gaW1nLnBhcmVudCgpO1xuICAgICQoJy5kb3dubG9hZF90ZXN0JykuYXBwZW5kKGRhdGEuZWwpO1xuICAgIHNpemUgPSBkYXRhLmVsLndpZHRoKCkgKyBcInhcIiArIGRhdGEuZWwuaGVpZ2h0KCk7XG5cbiAgICB3PWRhdGEuZWwud2lkdGgoKSowLjg7XG4gICAgaW1nXG4gICAgICAuaGVpZ2h0KCdhdXRvJylcbiAgICAgIC8vLndpZHRoKHcpXG4gICAgICAuY3NzKCdtYXgtd2lkdGgnLCc5OSUnKTtcblxuXG4gICAgZGF0YS5lbC5yZW1vdmUoKTtcbiAgICB3cmFwLmFwcGVuZCgnPHNwYW4+JyArIHNpemUgKyAnPC9zcGFuPiA8YSBocmVmPVwiJyArIGRhdGEuc3JjICsgJ1wiIGRvd25sb2FkPicrbGcoXCJkb3dubG9hZFwiKSsnPC9hPicpO1xuICB9XG5cbiAgdmFyIGltZ3MgPSAkKCcuZG93bmxvYWRzX2ltZyBpbWcnKTtcbiAgaWYoaW1ncy5sZW5ndGg9PTApcmV0dXJuO1xuXG4gICQoJ2JvZHknKS5hcHBlbmQoJzxkaXYgY2xhc3M9ZG93bmxvYWRfdGVzdD48L2Rpdj4nKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGltZyA9IGltZ3MuZXEoaSk7XG4gICAgdmFyIHNyYyA9IGltZy5hdHRyKCdzcmMnKTtcbiAgICBpbWFnZSA9ICQoJzxpbWcvPicsIHtcbiAgICAgIHNyYzogc3JjXG4gICAgfSk7XG4gICAgZGF0YSA9IHtcbiAgICAgIHNyYzogc3JjLFxuICAgICAgaW1nOiBpbWcsXG4gICAgICBlbDogaW1hZ2VcbiAgICB9O1xuICAgIGltYWdlLm9uKCdsb2FkJywgaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXG4gIH1cbn0pKCk7XG5cbi8v0YfRgtC+INCxINC40YTRgNC10LnQvNGLINC4INC60LDRgNGC0LjQvdC60Lgg0L3QtSDQstGL0LvQsNC30LjQu9C4XG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAvKm1fdyA9ICQoJy50ZXh0LWNvbnRlbnQnKS53aWR0aCgpXG4gICBpZiAobV93IDwgNTApbV93ID0gc2NyZWVuLndpZHRoIC0gNDAqL1xuICB2YXIgbXc9c2NyZWVuLndpZHRoLTQwO1xuXG4gIGZ1bmN0aW9uIG9wdGltYXNlKGVsKXtcbiAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50KCk7XG4gICAgaWYocGFyZW50Lmxlbmd0aD09MCB8fCBwYXJlbnRbMF0udGFnTmFtZT09XCJBXCIpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZihlbC5oYXNDbGFzcygnbm9fb3B0b21pemUnKSlyZXR1cm47XG5cbiAgICBtX3cgPSBwYXJlbnQud2lkdGgoKS0zMDtcbiAgICB2YXIgdz1lbC53aWR0aCgpO1xuXG4gICAgLy/QsdC10Lcg0Y3RgtC+0LPQviDQv9C70Y7RidC40YIg0LHQsNC90LXRgNGLINCyINCw0LrQsNGA0LTQuNC+0L3QtVxuICAgIGlmKHc8MyB8fCBtX3c8Myl7XG4gICAgICBlbFxuICAgICAgICAuaGVpZ2h0KCdhdXRvJylcbiAgICAgICAgLmNzcygnbWF4LXdpZHRoJywnOTklJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZWwud2lkdGgoJ2F1dG8nKTtcbiAgICBpZihlbFswXS50YWdOYW1lPT1cIklNR1wiICYmIHc+ZWwud2lkdGgoKSl3PWVsLndpZHRoKCk7XG5cbiAgICBpZiAobXc+NTAgJiYgbV93ID4gbXcpbV93ID0gbXc7XG4gICAgaWYgKHc+bV93KSB7XG4gICAgICBpZihlbFswXS50YWdOYW1lPT1cIklGUkFNRVwiKXtcbiAgICAgICAgayA9IHcgLyBtX3c7XG4gICAgICAgIGVsLmhlaWdodChlbC5oZWlnaHQoKSAvIGspO1xuICAgICAgfVxuICAgICAgZWwud2lkdGgobV93KVxuICAgIH1lbHNle1xuICAgICAgZWwud2lkdGgodyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgdmFyIGVsPSQodGhpcyk7XG4gICAgb3B0aW1hc2UoZWwpO1xuICB9XG5cbiAgdmFyIHAgPSAkKCcuY29udGVudC13cmFwIGltZywuY29udGVudC13cmFwIGlmcmFtZScpO1xuICAkKCcuY29udGVudC13cmFwIGltZzpub3QoLm5vX29wdG9taXplKScpLmhlaWdodCgnYXV0bycpO1xuICAvLyQoJy5jb250YWluZXIgaW1nJykud2lkdGgoJ2F1dG8nKTtcbiAgZm9yIChpID0gMDsgaSA8IHAubGVuZ3RoOyBpKyspIHtcbiAgICBlbCA9IHAuZXEoaSk7XG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIikge1xuICAgICAgb3B0aW1hc2UoZWwpO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHNyYz1lbC5hdHRyKCdzcmMnKTtcbiAgICAgIGltYWdlID0gJCgnPGltZy8+Jywge1xuICAgICAgICBzcmM6IHNyY1xuICAgICAgfSk7XG4gICAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGVsKSk7XG4gICAgfVxuICB9XG59KTtcblxuXG4vL9Cf0YDQvtCy0LXRgNC60LAg0LHQuNGC0Ysg0LrQsNGA0YLQuNC90L7Qui5cbi8vICEhISEhIVxuLy8g0J3Rg9C20L3QviDQv9GA0L7QstC10YDQuNGC0YwuINCS0YvQt9GL0LLQsNC70L4g0LPQu9GO0LrQuCDQv9GA0Lgg0LDQstGC0L7RgNC30LDRhtC40Lgg0YfQtdGA0LXQtyDQpNCRINC90LAg0YHQsNGE0LDRgNC4XG4vLyAhISEhISFcbmZ1bmN0aW9uIGltYWdlc1Rlc3QoKSB7XG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xuICAgIHZhciBkYXRhPXRoaXM7XG4gICAgaWYoZGF0YS50YWdOYW1lKXtcbiAgICAgIGRhdGE9JChkYXRhKS5kYXRhKCdkYXRhJyk7XG4gICAgfVxuICAgIHZhciBpbWc9ZGF0YS5pbWc7XG4gICAgLy92YXIgdG49aW1nWzBdLnRhZ05hbWU7XG4gICAgLy9pZiAodG4hPSdJTUcnfHx0biE9J0RJVid8fHRuIT0nU1BBTicpcmV0dXJuO1xuICAgIGlmKGRhdGEudHlwZT09MCkge1xuICAgICAgaW1nLmF0dHIoJ3NyYycsIGRhdGEuc3JjKTtcbiAgICAgIGltZy5yZW1vdmVDbGFzcyhkYXRhLmxvYWRpbmdDbGFzcyk7XG4gICAgfWVsc2V7XG4gICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XG4gICAgICBpbWcucmVtb3ZlQ2xhc3MoJ25vX2F2YScpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRlc3RJbWcoaW1ncywgbm9faW1nLCBsb2FkaW5nQ2xhc3Mpe1xuICAgIGlmKCFpbWdzIHx8IGltZ3MubGVuZ3RoPT0wKXJldHVybjtcbiAgICBsb2FkaW5nQ2xhc3MgPSBsb2FkaW5nQ2xhc3MgfHwgZmFsc2U7XG4gICAgaWYoIW5vX2ltZylub19pbWc9Jy9pbWFnZXMvdGVtcGxhdGUtbG9nby5qcGcnO1xuXG4gICAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcbiAgICAgIHZhciBpbWc9aW1ncy5lcShpKTtcbiAgICAgIGlmKGltZy5oYXNDbGFzcygnbm9fYXZhJykpe1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGRhdGE9e1xuICAgICAgICBpbWc6aW1nXG4gICAgICB9O1xuICAgICAgdmFyIHNyYztcbiAgICAgIGlmKGltZ1swXS50YWdOYW1lPT1cIklNR1wiKXtcbiAgICAgICAgZGF0YS50eXBlPTA7XG4gICAgICAgIHNyYz1pbWcuYXR0cignc3JjJyk7XG4gICAgICAgIGltZy5hdHRyKCdzcmMnLG5vX2ltZyk7XG4gICAgICAgIGRhdGEubG9hZGluZ0NsYXNzID0gbG9hZGluZ0NsYXNzID8gbG9hZGluZ0NsYXNzIDogJyc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgZGF0YS50eXBlPTE7XG4gICAgICAgIHNyYz1pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyk7XG4gICAgICAgIGlmKCFzcmMpY29udGludWU7XG4gICAgICAgIHNyYz1zcmMucmVwbGFjZSgndXJsKFwiJywnJyk7XG4gICAgICAgIHNyYz1zcmMucmVwbGFjZSgnXCIpJywnJyk7XG4gICAgICAgIC8v0LIg0YHRhNGE0LDRgNC4INCyINC80LDQuiDQvtGBINCx0LXQtyDQutC+0LLRi9GH0LXQui4g0LLQtdC30LTQtSDRgSDQutCw0LLRi9GH0LrQsNC80LhcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCd1cmwoJywnJyk7XG4gICAgICAgIHNyYz1zcmMucmVwbGFjZSgnKScsJycpO1xuICAgICAgICBpbWcuYWRkQ2xhc3MoJ25vX2F2YScpO1xuICAgICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrbm9faW1nKycpJyk7XG4gICAgICB9XG4gICAgICBkYXRhLnNyYz1zcmM7XG4gICAgICB2YXIgaW1hZ2U9JCgnPGltZy8+Jyx7XG4gICAgICAgIHNyYzpzcmNcbiAgICAgIH0pLm9uKCdsb2FkJywgaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpO1xuICAgICAgaW1hZ2UuZGF0YSgnZGF0YScsZGF0YSk7XG4gICAgICBpZiAobG9hZGluZ0NsYXNzKSB7XG4gICAgICAgIGltZy5hZGRDbGFzcyhsb2FkaW5nQ2xhc3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8v0YLQtdGB0YIg0LvQvtCz0L4g0LzQsNCz0LDQt9C40L3QsFxuICB2YXIgaW1ncz0kKCdzZWN0aW9uOm5vdCgubmF2aWdhdGlvbiknKTtcbiAgaW1ncz1pbWdzLmZpbmQoJy5sb2dvIGltZycpO1xuICB0ZXN0SW1nKGltZ3MsJy9pbWFnZXMvdGVtcGxhdGUtbG9nby5qcGcnKTtcblxuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvLC5zY3JvbGxfYm94LWF2YXRhcicpO1xuICB0ZXN0SW1nKGltZ3MsJy9pbWFnZXMvbm9fYXZhX3NxdWFyZS5wbmcnKTtcblxuICAvL9GC0LXRgdGCINC60LDRgNGC0LjQvdC+0Log0L/RgNC+0LTRg9C60YLQvtCyXG4gIGltZ3MgPSAkKCcuY2F0YWxvZ19wcm9kdWN0c19pdGVtX2ltYWdlLXdyYXAgaW1nJyk7XG4gIHRlc3RJbWcoaW1ncywgJy9pbWFnZXMvJytsYW5nLmtleSsnLW5vLWltYWdlLnBuZycpO1xuXG59XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBpbWFnZXNUZXN0KCk7XG59KTtcblxuIiwiLy/QtdGB0LvQuCDQvtGC0LrRgNGL0YLQviDQutCw0Log0LTQvtGH0LXRgNC90LXQtVxuKGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF3aW5kb3cub3BlbmVyKXJldHVybjtcbiAgdHJ5IHtcbiAgICBocmVmID0gd2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmO1xuICAgIGlmIChcbiAgICAgIGhyZWYuaW5kZXhPZignL2FjY291bnQvb2ZmbGluZScpID4gMFxuICAgICkge1xuICAgICAgd2luZG93LnByaW50KClcbiAgICB9XG5cbiAgICBpZiAoZG9jdW1lbnQucmVmZXJyZXIuaW5kZXhPZignc2VjcmV0ZGlzY291bnRlcicpIDwgMClyZXR1cm47XG5cbiAgICBpZiAoXG4gICAgICBocmVmLmluZGV4T2YoJ3NvY2lhbHMnKSA+IDAgfHxcbiAgICAgIGhyZWYuaW5kZXhPZignbG9naW4nKSA+IDAgfHxcbiAgICAgIGhyZWYuaW5kZXhPZignYWRtaW4nKSA+IDAgfHxcbiAgICAgIGhyZWYuaW5kZXhPZignYWNjb3VudCcpID4gMFxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChocmVmLmluZGV4T2YoJ3N0b3JlJykgPiAwIHx8IGhyZWYuaW5kZXhPZignY291cG9uJykgPiAwIHx8IGhyZWYuaW5kZXhPZignc2V0dGluZ3MnKSA+IDApIHtcbiAgICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZiA9IGxvY2F0aW9uLmhyZWY7XG4gICAgfVxuICAgIHdpbmRvdy5jbG9zZSgpO1xuICB9IGNhdGNoIChlcnIpIHtcblxuICB9XG59KSgpO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAkKCdpbnB1dFt0eXBlPWZpbGVdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChldnQpIHtcbiAgICB2YXIgZmlsZSA9IGV2dC50YXJnZXQuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxuICAgIHZhciBmID0gZmlsZVswXTtcbiAgICAvLyBPbmx5IHByb2Nlc3MgaW1hZ2UgZmlsZXMuXG4gICAgaWYgKCFmLnR5cGUubWF0Y2goJ2ltYWdlLionKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgIGRhdGEgPSB7XG4gICAgICAnZWwnOiB0aGlzLFxuICAgICAgJ2YnOiBmXG4gICAgfTtcbiAgICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaW1nID0gJCgnW2Zvcj1cIicgKyBkYXRhLmVsLm5hbWUgKyAnXCJdJyk7XG4gICAgICAgIGlmIChpbWcubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGltZy5hdHRyKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoZGF0YSk7XG4gICAgLy8gUmVhZCBpbiB0aGUgaW1hZ2UgZmlsZSBhcyBhIGRhdGEgVVJMLlxuICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGYpO1xuICB9KTtcblxuICAkKCcuZHVibGljYXRlX3ZhbHVlJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgIHZhciBzZWwgPSAkKCR0aGlzLmRhdGEoJ3NlbGVjdG9yJykpO1xuICAgIHNlbC52YWwodGhpcy52YWx1ZSk7XG4gIH0pXG59KTtcbiIsIlxuZnVuY3Rpb24gZ2V0Q29va2llKG4pIHtcbiAgcmV0dXJuIHVuZXNjYXBlKChSZWdFeHAobiArICc9KFteO10rKScpLmV4ZWMoZG9jdW1lbnQuY29va2llKSB8fCBbMSwgJyddKVsxXSk7XG59XG5cbmZ1bmN0aW9uIHNldENvb2tpZShuYW1lLCB2YWx1ZSwgZGF5cykge1xuICB2YXIgZXhwaXJlcyA9ICcnO1xuICBpZiAoZGF5cykge1xuICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZTtcbiAgICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSArIGRheXMpO1xuICAgICAgZXhwaXJlcyA9ICc7IGV4cGlyZXM9JyArIGRhdGUudG9VVENTdHJpbmcoKTtcbiAgfVxuICBkb2N1bWVudC5jb29raWUgPSBuYW1lICsgXCI9XCIgKyBlc2NhcGUgKCB2YWx1ZSApICsgZXhwaXJlcztcbn1cblxuZnVuY3Rpb24gZXJhc2VDb29raWUobmFtZSl7XG4gIHZhciBjb29raWVfc3RyaW5nID0gbmFtZSArIFwiPTBcIiArXCI7IGV4cGlyZXM9V2VkLCAwMSBPY3QgMjAxNyAwMDowMDowMCBHTVRcIjtcbiAgZG9jdW1lbnQuY29va2llID0gY29va2llX3N0cmluZztcbn1cblxuZG9jdW1lbnQuY29va2llLnNwbGl0KFwiO1wiKS5mb3JFYWNoKGZ1bmN0aW9uKGMpIHsgZG9jdW1lbnQuY29va2llID0gYy5yZXBsYWNlKC9eICsvLCBcIlwiKS5yZXBsYWNlKC89LiovLCBcIj07ZXhwaXJlcz1cIiArIG5ldyBEYXRlKCkudG9VVENTdHJpbmcoKSArIFwiO3BhdGg9L1wiKTsgfSk7XG5cblxuZnVuY3Rpb24gc2V0Q29va2llQWpheChuYW1lLCB2YWx1ZSwgZGF5cykge1xuICAgICQucG9zdChsYW5nLmhyZWZfcHJlZml4KycvY29va2llJywge25hbWU6bmFtZSwgdmFsdWU6dmFsdWUsIGRheXM6ZGF5c30sIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICBpZiAoZGF0YS5lcnJvciAhPT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCAnanNvbicpO1xufSIsIihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgdGFibGVzID0gJCgndGFibGUuYWRhcHRpdmUnKTtcblxuICBpZiAodGFibGVzLmxlbmd0aCA9PSAwKXJldHVybjtcblxuICBmb3IgKHZhciBpID0gMDsgdGFibGVzLmxlbmd0aCA+IGk7IGkrKykge1xuICAgIHZhciB0YWJsZSA9IHRhYmxlcy5lcShpKTtcbiAgICB2YXIgdGggPSB0YWJsZS5maW5kKCd0aGVhZCcpO1xuICAgIGlmICh0aC5sZW5ndGggPT0gMCkge1xuICAgICAgdGggPSB0YWJsZS5maW5kKCd0cicpLmVxKDApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aCA9IHRoLmZpbmQoJ3RyJykuZXEoMCk7XG4gICAgfVxuICAgIHRoID0gdGguYWRkQ2xhc3MoJ3RhYmxlLWhlYWRlcicpLmZpbmQoJ3RkLHRoJyk7XG5cbiAgICB2YXIgdHIgPSB0YWJsZS5maW5kKCd0cicpLm5vdCgnLnRhYmxlLWhlYWRlcicpO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aC5sZW5ndGg7IGorKykge1xuICAgICAgdmFyIGsgPSBqICsgMTtcbiAgICAgIHZhciB0ZCA9IHRyLmZpbmQoJ3RkOm50aC1jaGlsZCgnICsgayArICcpJyk7XG4gICAgICB0ZC5hdHRyKCdsYWJlbCcsIHRoLmVxKGopLnRleHQoKSk7XG4gICAgfVxuICB9XG5cbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuIiwiO1xuJChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gb25SZW1vdmUoKXtcbiAgICAkdGhpcz0kKHRoaXMpO1xuICAgIHBvc3Q9e1xuICAgICAgaWQ6JHRoaXMuYXR0cigndWlkJyksXG4gICAgICB0eXBlOiR0aGlzLmF0dHIoJ21vZGUnKVxuICAgIH07XG4gICAgJC5wb3N0KCR0aGlzLmF0dHIoJ3VybCcpLHBvc3QsZnVuY3Rpb24oZGF0YSl7XG4gICAgICBpZihkYXRhICYmIGRhdGE9PSdlcnInKXtcbiAgICAgICAgbXNnPSR0aGlzLmRhdGEoJ3JlbW92ZS1lcnJvcicpO1xuICAgICAgICBpZighbXNnKXtcbiAgICAgICAgICBtc2c9J9Cd0LXQstC+0LfQvNC+0LbQvdC+INGD0LTQsNC70LjRgtGMINGN0LvQtdC80LXQvdGCJztcbiAgICAgICAgfVxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOm1zZyx0eXBlOidlcnInfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbW9kZT0kdGhpcy5hdHRyKCdtb2RlJyk7XG4gICAgICBpZighbW9kZSl7XG4gICAgICAgIG1vZGU9J3JtJztcbiAgICAgIH1cblxuICAgICAgaWYobW9kZT09J3JtJykge1xuICAgICAgICBybSA9ICR0aGlzLmNsb3Nlc3QoJy50b19yZW1vdmUnKTtcbiAgICAgICAgcm1fY2xhc3MgPSBybS5hdHRyKCdybV9jbGFzcycpO1xuICAgICAgICBpZiAocm1fY2xhc3MpIHtcbiAgICAgICAgICAkKHJtX2NsYXNzKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJtLnJlbW92ZSgpO1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQo9GB0L/QtdGI0L3QvtC1INGD0LTQsNC70LXQvdC40LUuJyx0eXBlOidpbmZvJ30pXG4gICAgICB9XG4gICAgICBpZihtb2RlPT0ncmVsb2FkJyl7XG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICBsb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XG4gICAgICB9XG4gICAgfSkuZmFpbChmdW5jdGlvbigpe1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J7RiNC40LHQutCwINGD0LTQsNC70L3QuNGPJyx0eXBlOidlcnInfSk7XG4gICAgfSlcbiAgfVxuXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuYWpheF9yZW1vdmUnLGZ1bmN0aW9uKCl7XG4gICAgbm90aWZpY2F0aW9uLmNvbmZpcm0oe1xuICAgICAgY2FsbGJhY2tZZXM6b25SZW1vdmUsXG4gICAgICBvYmo6JCh0aGlzKSxcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfYm94LWFsZXJ0XCJcbiAgICB9KVxuICB9KTtcblxufSk7XG5cbiIsImlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAob1RoaXMpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vINCx0LvQuNC20LDQudGI0LjQuSDQsNC90LDQu9C+0LMg0LLQvdGD0YLRgNC10L3QvdC10Lkg0YTRg9C90LrRhtC40LhcbiAgICAgIC8vIElzQ2FsbGFibGUg0LIgRUNNQVNjcmlwdCA1XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgIH1cblxuICAgIHZhciBhQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICBmVG9CaW5kID0gdGhpcyxcbiAgICAgIGZOT1AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB9LFxuICAgICAgZkJvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUCAmJiBvVGhpc1xuICAgICAgICAgICAgPyB0aGlzXG4gICAgICAgICAgICA6IG9UaGlzLFxuICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICB9O1xuXG4gICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcblxuICAgIHJldHVybiBmQm91bmQ7XG4gIH07XG59XG5cbmlmICghU3RyaW5nLnByb3RvdHlwZS50cmltKSB7XG4gIChmdW5jdGlvbigpIHtcbiAgICAvLyDQktGL0YDQtdC30LDQtdC8IEJPTSDQuCDQvdC10YDQsNC30YDRi9Cy0L3Ri9C5INC/0YDQvtCx0LXQu1xuICAgIFN0cmluZy5wcm90b3R5cGUudHJpbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZSgvXltcXHNcXHVGRUZGXFx4QTBdK3xbXFxzXFx1RkVGRlxceEEwXSskL2csICcnKTtcbiAgICB9O1xuICB9KSgpO1xufSIsIihmdW5jdGlvbiAoKSB7XG4gICQoJy5oaWRkZW4tbGluaycpLnJlcGxhY2VXaXRoKGZ1bmN0aW9uICgpIHtcbiAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgcmV0dXJuICc8YSBocmVmPVwiJyArICR0aGlzLmRhdGEoJ2xpbmsnKSArICdcIiByZWw9XCInKyAkdGhpcy5kYXRhKCdyZWwnKSArJ1wiIGNsYXNzPVwiJyArICR0aGlzLmF0dHIoJ2NsYXNzJykgKyAnXCI+JyArICR0aGlzLnRleHQoKSArICc8L2E+JztcbiAgfSlcbn0pKCk7XG4iLCJ2YXIgc3RvcmVfcG9pbnRzID0gKGZ1bmN0aW9uKCl7XG5cblxuICAgIGZ1bmN0aW9uIGNoYW5nZUNvdW50cnkoKXtcbiAgICAgICAgdmFyIHRoYXQgPSAkKCcjc3RvcmVfcG9pbnRfY291bnRyeScpO1xuICAgICAgICBpZiAodGhhdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3RPcHRpb25zID0gJCh0aGF0KS5maW5kKCdvcHRpb24nKTtcbiAgICAgICAgICAgIHZhciBkYXRhID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgdGhhdCkuZGF0YSgnY2l0aWVzJyksXG4gICAgICAgICAgICAgICAgcG9pbnRzID0gJCgnI3N0b3JlLXBvaW50cycpLFxuICAgICAgICAgICAgICAgIGNvdW50cnkgPSAkKCdvcHRpb246c2VsZWN0ZWQnLCB0aGF0KS5hdHRyKCd2YWx1ZScpO1xuICAgICAgICAgICAgaWYgKHNlbGVjdE9wdGlvbnMubGVuZ3RoID4gMSAmJiBkYXRhKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RvcmVfcG9pbnRfY2l0eScpO1xuICAgICAgICAgICAgICAgICAgICAvL3ZhciBvcHRpb25zID0gJzxvcHRpb24gdmFsdWU9XCJcIj7QktGL0LHQtdGA0LjRgtC1INCz0L7RgNC+0LQ8L29wdGlvbj4nO1xuICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgaXRlbSArICdcIj4nICsgaXRlbSArICc8L29wdGlvbj4nO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0LmlubmVySFRNTCA9IG9wdGlvbnM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8kKHBvaW50cykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAgICAgLy8gZ29vZ2xlTWFwLnNob3dNYXAoKTtcbiAgICAgICAgICAgIC8vIGdvb2dsZU1hcC5zaG93TWFya2VyKGNvdW50cnksICcnKTtcbiAgICAgICAgICAgIGNoYW5nZUNpdHkoKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hhbmdlQ2l0eSgpe1xuICAgICAgICBpZiAodHlwZW9mIGdvb2dsZU1hcCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRoYXQgPSAkKCcjc3RvcmVfcG9pbnRfY2l0eScpO1xuICAgICAgICBpZiAodGhhdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBjaXR5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgdGhhdCkuYXR0cigndmFsdWUnKSxcbiAgICAgICAgICAgICAgICBjb3VudHJ5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgJCgnI3N0b3JlX3BvaW50X2NvdW50cnknKSkuYXR0cigndmFsdWUnKSxcbiAgICAgICAgICAgICAgICBwb2ludHMgPSAkKCcjc3RvcmUtcG9pbnRzJyk7XG4gICAgICAgICAgICBpZiAoY291bnRyeSAmJiBjaXR5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gcG9pbnRzLmZpbmQoJy5zdG9yZS1wb2ludHNfX3BvaW50c19yb3cnKSxcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5zaG93TWFya2VyKGNvdW50cnksIGNpdHkpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkLmVhY2goaXRlbXMsIGZ1bmN0aW9uIChpbmRleCwgZGl2KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgkKGRpdikuZGF0YSgnY2l0eScpID09IGNpdHkgJiYgJChkaXYpLmRhdGEoJ2NvdW50cnknKSA9PSBjb3VudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKGRpdikucmVtb3ZlQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzX3Jvdy1oaWRkZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChkaXYpLmFkZENsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50c19yb3ctaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAkKHBvaW50cykucmVtb3ZlQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzLWhpZGRlbicpO1xuICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXAuc2hvd01hcCgpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJChwb2ludHMpLmFkZENsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50cy1oaWRkZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwLmhpZGVNYXAoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQocG9pbnRzKS5hZGRDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHMtaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgZ29vZ2xlTWFwLmhpZGVNYXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8v0LTQu9GPINGC0L7Rh9C10Log0L/RgNC+0LTQsNC2LCDRgdC+0LHRi9GC0LjRjyDQvdCwINCy0YvQsdC+0YAg0YHQtdC70LXQutGC0L7QslxuICAgIHZhciBib2R5ID0gJCgnYm9keScpO1xuXG4gICAgJChib2R5KS5vbignY2hhbmdlJywgJyNzdG9yZV9wb2ludF9jb3VudHJ5JywgZnVuY3Rpb24oZSkge1xuICAgICAgICBjaGFuZ2VDb3VudHJ5KCk7XG4gICAgfSk7XG5cblxuICAgICQoYm9keSkub24oJ2NoYW5nZScsICcjc3RvcmVfcG9pbnRfY2l0eScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY2hhbmdlQ2l0eSgpO1xuXG4gICAgfSk7XG5cbiAgICBjaGFuZ2VDb3VudHJ5KCk7XG5cblxufSkoKTtcblxuXG5cblxuIiwidmFyIGhhc2hUYWdzID0gKGZ1bmN0aW9uKCl7XG5cbiAgICBmdW5jdGlvbiBsb2NhdGlvbkhhc2goKSB7XG4gICAgICAgIHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG5cbiAgICAgICAgaWYgKGhhc2ggIT0gXCJcIikge1xuICAgICAgICAgICAgdmFyIGhhc2hCb2R5ID0gaGFzaC5zcGxpdChcIj9cIik7XG4gICAgICAgICAgICBpZiAoaGFzaEJvZHlbMV0pIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBsb2NhdGlvbi5vcmlnaW4gKyBsb2NhdGlvbi5wYXRobmFtZSArICc/JyArIGhhc2hCb2R5WzFdICsgaGFzaEJvZHlbMF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBsaW5rcyA9ICQoJ2FbaHJlZj1cIicgKyBoYXNoQm9keVswXSArICdcIl0ubW9kYWxzX29wZW4nKTtcbiAgICAgICAgICAgICAgICBpZiAobGlua3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICQobGlua3NbMF0pLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGxvY2F0aW9uSGFzaCgpO1xuICAgIH0pO1xuXG4gICAgbG9jYXRpb25IYXNoKClcblxufSkoKTsiLCJ2YXIgcGx1Z2lucyA9IChmdW5jdGlvbigpe1xuICAgIHZhciBpY29uQ2xvc2UgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwiQ2FwYV8xXCIgeD1cIjBweFwiIHk9XCIwcHhcIiB3aWR0aD1cIjEycHhcIiBoZWlnaHQ9XCIxMnB4XCIgdmlld0JveD1cIjAgMCAzNTcgMzU3XCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM1NyAzNTc7XCIgeG1sOnNwYWNlPVwicHJlc2VydmVcIj48Zz4nK1xuICAgICAgICAnPGcgaWQ9XCJjbG9zZVwiPjxwb2x5Z29uIHBvaW50cz1cIjM1NywzNS43IDMyMS4zLDAgMTc4LjUsMTQyLjggMzUuNywwIDAsMzUuNyAxNDIuOCwxNzguNSAwLDMyMS4zIDM1LjcsMzU3IDE3OC41LDIxNC4yIDMyMS4zLDM1NyAzNTcsMzIxLjMgICAgIDIxNC4yLDE3OC41ICAgXCIgZmlsbD1cIiNGRkZGRkZcIi8+JytcbiAgICAgICAgJzwvc3ZnPic7XG4gICAgdmFyIHRlbXBsYXRlPSc8ZGl2IGNsYXNzPVwicGFnZS13cmFwIGluc3RhbGwtcGx1Z2luX2lubmVyXCI+JytcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImluc3RhbGwtcGx1Z2luX3RleHRcIj57e3RleHR9fTwvZGl2PicrXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJpbnN0YWxsLXBsdWdpbl9idXR0b25zXCI+JytcbiAgICAgICAgICAgICAgICAgICAgJzxhIGNsYXNzPVwiYnRuIGJ0bi1taW5pIGJ0bi1yb3VuZCBpbnN0YWxsLXBsdWdpbl9idXR0b25cIiAgaHJlZj1cInt7aHJlZn19XCIgdGFyZ2V0PVwiX2JsYW5rXCI+e3t0aXRsZX19PC9hPicrXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaW5zdGFsbC1wbHVnaW5fYnV0dG9uLWNsb3NlXCI+JytpY29uQ2xvc2UrJzwvZGl2PicrXG4gICAgICAgICAgICAgICAgJzwvZGl2PicrXG4gICAgICAgICAgICAnPC9kaXY+JztcbiAgICB2YXIgcGx1Z2luSW5zdGFsbERpdkNsYXNzID0gJ2luc3RhbGwtcGx1Z2luLWluZGV4JztcbiAgICB2YXIgcGx1Z2luSW5zdGFsbERpdkFjY291bnRDbGFzcyA9ICdpbnN0YWxsLXBsdWdpbi1hY2NvdW50JztcbiAgICB2YXIgY29va2llUGFuZWxIaWRkZW4gPSAnc2QtaW5zdGFsbC1wbHVnaW4taGlkZGVuJztcbiAgICB2YXIgY29va2llQWNjb3VudERpdkhpZGRlbiA9ICdzZC1pbnN0YWxsLXBsdWdpbi1hY2NvdW50LWhpZGRlbic7XG4gICAgdmFyIGlzT3BlcmEgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJyBPUFIvJykgPj0gMDtcbiAgICB2YXIgaXNZYW5kZXggPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJyBZYUJyb3dzZXIvJykgPj0gMDtcbiAgICB2YXIgZXh0ZW5zaW9ucyA9IHtcbiAgICAgICAgJ2Nocm9tZSc6IHtcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2RfY2hyb21lX2FwcCcsXG4gICAgICAgICAgICAndXNlZCc6ICEhd2luZG93LmNocm9tZSAmJiB3aW5kb3cuY2hyb21lLndlYnN0b3JlICE9PSBudWxsICYmICFpc09wZXJhICYmICFpc1lhbmRleCxcbiAgICAgICAgICAgIC8vJ3RleHQnOiBsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcbiAgICAgICAgICAgICdocmVmJzogJ2h0dHBzOi8vY2hyb21lLmdvb2dsZS5jb20vd2Vic3RvcmUvZGV0YWlsL3NlY3JldGRpc2NvdW50ZXJydS0lRTIlODAlOTMtJUQwJUJBJUQxJThEJUQxJTg4JUQwJUIxL21jb2xoaGVtZmFjcG9hZ2hqaWRobGllY3BpYW5wbmpuJyxcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay1jaHJvbWUnXG4gICAgICAgIH0sXG4gICAgICAgICdmaXJlZm94Jzoge1xuICAgICAgICAgICAgJ2Rpdl9pZCc6ICdzZF9maXJlZm94X2FwcCcsXG4gICAgICAgICAgICAndXNlZCc6ICB0eXBlb2YgSW5zdGFsbFRyaWdnZXIgIT09ICd1bmRlZmluZWQnLFxuICAgICAgICAgICAgLy8ndGV4dCc6bGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIiksXG4gICAgICAgICAgICAvLydocmVmJzogJ2h0dHBzOi8vYWRkb25zLm1vemlsbGEub3JnL3J1L2ZpcmVmb3gvYWRkb24vc2VjcmV0ZGlzY291bnRlci0lRDAlQkElRDElOEQlRDElODglRDAlQjElRDElOEQlRDAlQkEtJUQxJTgxJUQwJUI1JUQxJTgwJUQwJUIyJUQwJUI4JUQxJTgxLycsXG4gICAgICAgICAgICAnaHJlZic6ICdodHRwczovL2FkZG9ucy5tb3ppbGxhLm9yZy9ydS9maXJlZm94L2FkZG9uL3NlY3JldGRpc2NvdW50ZXItY2FzaGJhY2snLFxuICAgICAgICAgICAgJ2luc3RhbGxfYnV0dG9uX2NsYXNzJzogJ3BsdWdpbi1icm93c2Vycy1saW5rLWZpcmVmb3gnXG4gICAgICAgIH0sXG4gICAgICAgICdvcGVyYSc6IHtcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2Rfb3BlcmFfYXBwJyxcbiAgICAgICAgICAgICd1c2VkJzogaXNPcGVyYSxcbiAgICAgICAgICAgIC8vJ3RleHQnOmxnKFwiaW5zdGFsbF9wbHVnaW5fYW5kX2l0X3dpbGxfbm90aWNlX2Fib3V0X2Nhc2hiYWNrXCIpLFxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMub3BlcmEuY29tL3J1L2V4dGVuc2lvbnMvP3JlZj1wYWdlJyxcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay1vcGVyYSdcbiAgICAgICAgfSxcbiAgICAgICAgJ3lhbmRleCc6IHtcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2RfeWFuZGV4X2FwcCcsXG4gICAgICAgICAgICAndXNlZCc6IGlzWWFuZGV4LFxuICAgICAgICAgICAgLy8ndGV4dCc6bGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIiksXG4gICAgICAgICAgICAnaHJlZic6ICdodHRwczovL2FkZG9ucy5vcGVyYS5jb20vcnUvZXh0ZW5zaW9ucy8/cmVmPXBhZ2UnLFxuICAgICAgICAgICAgJ2luc3RhbGxfYnV0dG9uX2NsYXNzJzogJ3BsdWdpbi1icm93c2Vycy1saW5rLXlhbmRleCdcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIGZ1bmN0aW9uIHNldFBhbmVsKGhyZWYpIHtcbiAgICAgICAgdmFyIHBsdWdpbkluc3RhbGxQYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwbHVnaW4taW5zdGFsbC1wYW5lbCcpOy8v0LLRi9Cy0L7QtNC40YLRjCDQu9C4INC/0LDQvdC10LvRjFxuICAgICAgICBpZiAocGx1Z2luSW5zdGFsbFBhbmVsICYmIGdldENvb2tpZShjb29raWVQYW5lbEhpZGRlbikgIT09ICcxJyApIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZSgne3t0ZXh0fX0nLCBsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSk7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7aHJlZn19JywgaHJlZik7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7dGl0bGV9fScsIGxnKFwiaW5zdGFsbF9wbHVnaW5cIikpO1xuICAgICAgICAgICAgdmFyIHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgICAgICAgICBzZWN0aW9uLmNsYXNzTmFtZSA9ICdpbnN0YWxsLXBsdWdpbic7XG4gICAgICAgICAgICBzZWN0aW9uLmlubmVySFRNTCA9IHRlbXBsYXRlO1xuXG4gICAgICAgICAgICB2YXIgc2Vjb25kbGluZSA9IGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcignLmhlYWRlci1zZWNvbmRsaW5lJyk7XG4gICAgICAgICAgICBpZiAoc2Vjb25kbGluZSkge1xuICAgICAgICAgICAgICAgIHNlY29uZGxpbmUuYXBwZW5kQ2hpbGQoc2VjdGlvbik7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmluc3RhbGwtcGx1Z2luX2J1dHRvbi1jbG9zZScpLm9uY2xpY2sgPSBjbG9zZUNsaWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0QnV0dG9uSW5zdGFsbFZpc2libGUoYnV0dG9uQ2xhc3MpIHtcbiAgICAgICAgJCgnLicgKyBwbHVnaW5JbnN0YWxsRGl2Q2xhc3MpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgJCgnLicgKyBidXR0b25DbGFzcykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICBpZiAoZ2V0Q29va2llKGNvb2tpZUFjY291bnREaXZIaWRkZW4pICE9PSAnMScpIHtcbiAgICAgICAgICAgICQoJy4nICsgcGx1Z2luSW5zdGFsbERpdkFjY291bnRDbGFzcykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xvc2VDbGljaygpe1xuICAgICAgICAkKCcuaW5zdGFsbC1wbHVnaW4nKS5hZGRDbGFzcygnaW5zdGFsbC1wbHVnaW5faGlkZGVuJyk7XG4gICAgICAgIHNldENvb2tpZShjb29raWVQYW5lbEhpZGRlbiwgJzEnLCAxMCk7XG4gICAgfVxuXG4gICAgJCgnLmluc3RhbGwtcGx1Z2luLWFjY291bnQtbGF0ZXInKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2V0Q29va2llKGNvb2tpZUFjY291bnREaXZIaWRkZW4sICcxJywgMTApO1xuICAgICAgICAkKCcuaW5zdGFsbC1wbHVnaW4tYWNjb3VudCcpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9KTtcblxuXG4gICAgd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGV4dGVuc2lvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9uc1trZXldLnVzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFwcElkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignIycrZXh0ZW5zaW9uc1trZXldLmRpdl9pZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYXBwSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v0L/QsNC90LXQu9GMINGBINC60L3QvtC/0LrQvtC5XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRQYW5lbChleHRlbnNpb25zW2tleV0uaHJlZik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL9C90LAg0LPQu9Cw0LLQvdC+0LkgINC4INCyIC9hY2NvdW50INCx0LvQvtC60Lgg0YEg0LjQutC+0L3QutCw0LzQuCDQuCDQutC90L7Qv9C60LDQvNC4XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRCdXR0b25JbnN0YWxsVmlzaWJsZShleHRlbnNpb25zW2tleV0uaW5zdGFsbF9idXR0b25fY2xhc3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCAzMDAwKTtcbiAgICB9O1xuXG59KSgpOyIsIi8qKlxuICogQGF1dGhvciB6aGl4aW4gd2VuIDx3ZW56aGl4aW4yMDEwQGdtYWlsLmNvbT5cbiAqIEB2ZXJzaW9uIDEuMi4xXG4gKlxuICogaHR0cDovL3dlbnpoaXhpbi5uZXQuY24vcC9tdWx0aXBsZS1zZWxlY3QvXG4gKi9cblxuKGZ1bmN0aW9uICgkKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBpdCBvbmx5IGRvZXMgJyVzJywgYW5kIHJldHVybiAnJyB3aGVuIGFyZ3VtZW50cyBhcmUgdW5kZWZpbmVkXG4gICAgdmFyIHNwcmludGYgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgICAgZmxhZyA9IHRydWUsXG4gICAgICAgICAgICBpID0gMTtcblxuICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFyZyA9IGFyZ3NbaSsrXTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZmxhZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhcmc7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmxhZyA/IHN0ciA6ICcnO1xuICAgIH07XG5cbiAgICB2YXIgcmVtb3ZlRGlhY3JpdGljcyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgdmFyIGRlZmF1bHREaWFjcml0aWNzUmVtb3ZhbE1hcCA9IFtcbiAgICAgICAgICAgIHsnYmFzZSc6J0EnLCAnbGV0dGVycyc6L1tcXHUwMDQxXFx1MjRCNlxcdUZGMjFcXHUwMEMwXFx1MDBDMVxcdTAwQzJcXHUxRUE2XFx1MUVBNFxcdTFFQUFcXHUxRUE4XFx1MDBDM1xcdTAxMDBcXHUwMTAyXFx1MUVCMFxcdTFFQUVcXHUxRUI0XFx1MUVCMlxcdTAyMjZcXHUwMUUwXFx1MDBDNFxcdTAxREVcXHUxRUEyXFx1MDBDNVxcdTAxRkFcXHUwMUNEXFx1MDIwMFxcdTAyMDJcXHUxRUEwXFx1MUVBQ1xcdTFFQjZcXHUxRTAwXFx1MDEwNFxcdTAyM0FcXHUyQzZGXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0FBJywnbGV0dGVycyc6L1tcXHVBNzMyXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0FFJywnbGV0dGVycyc6L1tcXHUwMEM2XFx1MDFGQ1xcdTAxRTJdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonQU8nLCdsZXR0ZXJzJzovW1xcdUE3MzRdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonQVUnLCdsZXR0ZXJzJzovW1xcdUE3MzZdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonQVYnLCdsZXR0ZXJzJzovW1xcdUE3MzhcXHVBNzNBXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0FZJywnbGV0dGVycyc6L1tcXHVBNzNDXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0InLCAnbGV0dGVycyc6L1tcXHUwMDQyXFx1MjRCN1xcdUZGMjJcXHUxRTAyXFx1MUUwNFxcdTFFMDZcXHUwMjQzXFx1MDE4MlxcdTAxODFdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonQycsICdsZXR0ZXJzJzovW1xcdTAwNDNcXHUyNEI4XFx1RkYyM1xcdTAxMDZcXHUwMTA4XFx1MDEwQVxcdTAxMENcXHUwMEM3XFx1MUUwOFxcdTAxODdcXHUwMjNCXFx1QTczRV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidEJywgJ2xldHRlcnMnOi9bXFx1MDA0NFxcdTI0QjlcXHVGRjI0XFx1MUUwQVxcdTAxMEVcXHUxRTBDXFx1MUUxMFxcdTFFMTJcXHUxRTBFXFx1MDExMFxcdTAxOEJcXHUwMThBXFx1MDE4OVxcdUE3NzldL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonRFonLCdsZXR0ZXJzJzovW1xcdTAxRjFcXHUwMUM0XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0R6JywnbGV0dGVycyc6L1tcXHUwMUYyXFx1MDFDNV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidFJywgJ2xldHRlcnMnOi9bXFx1MDA0NVxcdTI0QkFcXHVGRjI1XFx1MDBDOFxcdTAwQzlcXHUwMENBXFx1MUVDMFxcdTFFQkVcXHUxRUM0XFx1MUVDMlxcdTFFQkNcXHUwMTEyXFx1MUUxNFxcdTFFMTZcXHUwMTE0XFx1MDExNlxcdTAwQ0JcXHUxRUJBXFx1MDExQVxcdTAyMDRcXHUwMjA2XFx1MUVCOFxcdTFFQzZcXHUwMjI4XFx1MUUxQ1xcdTAxMThcXHUxRTE4XFx1MUUxQVxcdTAxOTBcXHUwMThFXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0YnLCAnbGV0dGVycyc6L1tcXHUwMDQ2XFx1MjRCQlxcdUZGMjZcXHUxRTFFXFx1MDE5MVxcdUE3N0JdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonRycsICdsZXR0ZXJzJzovW1xcdTAwNDdcXHUyNEJDXFx1RkYyN1xcdTAxRjRcXHUwMTFDXFx1MUUyMFxcdTAxMUVcXHUwMTIwXFx1MDFFNlxcdTAxMjJcXHUwMUU0XFx1MDE5M1xcdUE3QTBcXHVBNzdEXFx1QTc3RV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidIJywgJ2xldHRlcnMnOi9bXFx1MDA0OFxcdTI0QkRcXHVGRjI4XFx1MDEyNFxcdTFFMjJcXHUxRTI2XFx1MDIxRVxcdTFFMjRcXHUxRTI4XFx1MUUyQVxcdTAxMjZcXHUyQzY3XFx1MkM3NVxcdUE3OERdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonSScsICdsZXR0ZXJzJzovW1xcdTAwNDlcXHUyNEJFXFx1RkYyOVxcdTAwQ0NcXHUwMENEXFx1MDBDRVxcdTAxMjhcXHUwMTJBXFx1MDEyQ1xcdTAxMzBcXHUwMENGXFx1MUUyRVxcdTFFQzhcXHUwMUNGXFx1MDIwOFxcdTAyMEFcXHUxRUNBXFx1MDEyRVxcdTFFMkNcXHUwMTk3XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0onLCAnbGV0dGVycyc6L1tcXHUwMDRBXFx1MjRCRlxcdUZGMkFcXHUwMTM0XFx1MDI0OF0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidLJywgJ2xldHRlcnMnOi9bXFx1MDA0QlxcdTI0QzBcXHVGRjJCXFx1MUUzMFxcdTAxRThcXHUxRTMyXFx1MDEzNlxcdTFFMzRcXHUwMTk4XFx1MkM2OVxcdUE3NDBcXHVBNzQyXFx1QTc0NFxcdUE3QTJdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonTCcsICdsZXR0ZXJzJzovW1xcdTAwNENcXHUyNEMxXFx1RkYyQ1xcdTAxM0ZcXHUwMTM5XFx1MDEzRFxcdTFFMzZcXHUxRTM4XFx1MDEzQlxcdTFFM0NcXHUxRTNBXFx1MDE0MVxcdTAyM0RcXHUyQzYyXFx1MkM2MFxcdUE3NDhcXHVBNzQ2XFx1QTc4MF0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidMSicsJ2xldHRlcnMnOi9bXFx1MDFDN10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidMaicsJ2xldHRlcnMnOi9bXFx1MDFDOF0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidNJywgJ2xldHRlcnMnOi9bXFx1MDA0RFxcdTI0QzJcXHVGRjJEXFx1MUUzRVxcdTFFNDBcXHUxRTQyXFx1MkM2RVxcdTAxOUNdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonTicsICdsZXR0ZXJzJzovW1xcdTAwNEVcXHUyNEMzXFx1RkYyRVxcdTAxRjhcXHUwMTQzXFx1MDBEMVxcdTFFNDRcXHUwMTQ3XFx1MUU0NlxcdTAxNDVcXHUxRTRBXFx1MUU0OFxcdTAyMjBcXHUwMTlEXFx1QTc5MFxcdUE3QTRdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonTkonLCdsZXR0ZXJzJzovW1xcdTAxQ0FdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonTmonLCdsZXR0ZXJzJzovW1xcdTAxQ0JdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonTycsICdsZXR0ZXJzJzovW1xcdTAwNEZcXHUyNEM0XFx1RkYyRlxcdTAwRDJcXHUwMEQzXFx1MDBENFxcdTFFRDJcXHUxRUQwXFx1MUVENlxcdTFFRDRcXHUwMEQ1XFx1MUU0Q1xcdTAyMkNcXHUxRTRFXFx1MDE0Q1xcdTFFNTBcXHUxRTUyXFx1MDE0RVxcdTAyMkVcXHUwMjMwXFx1MDBENlxcdTAyMkFcXHUxRUNFXFx1MDE1MFxcdTAxRDFcXHUwMjBDXFx1MDIwRVxcdTAxQTBcXHUxRURDXFx1MUVEQVxcdTFFRTBcXHUxRURFXFx1MUVFMlxcdTFFQ0NcXHUxRUQ4XFx1MDFFQVxcdTAxRUNcXHUwMEQ4XFx1MDFGRVxcdTAxODZcXHUwMTlGXFx1QTc0QVxcdUE3NENdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonT0knLCdsZXR0ZXJzJzovW1xcdTAxQTJdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonT08nLCdsZXR0ZXJzJzovW1xcdUE3NEVdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonT1UnLCdsZXR0ZXJzJzovW1xcdTAyMjJdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonUCcsICdsZXR0ZXJzJzovW1xcdTAwNTBcXHUyNEM1XFx1RkYzMFxcdTFFNTRcXHUxRTU2XFx1MDFBNFxcdTJDNjNcXHVBNzUwXFx1QTc1MlxcdUE3NTRdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonUScsICdsZXR0ZXJzJzovW1xcdTAwNTFcXHUyNEM2XFx1RkYzMVxcdUE3NTZcXHVBNzU4XFx1MDI0QV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidSJywgJ2xldHRlcnMnOi9bXFx1MDA1MlxcdTI0QzdcXHVGRjMyXFx1MDE1NFxcdTFFNThcXHUwMTU4XFx1MDIxMFxcdTAyMTJcXHUxRTVBXFx1MUU1Q1xcdTAxNTZcXHUxRTVFXFx1MDI0Q1xcdTJDNjRcXHVBNzVBXFx1QTdBNlxcdUE3ODJdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonUycsICdsZXR0ZXJzJzovW1xcdTAwNTNcXHUyNEM4XFx1RkYzM1xcdTFFOUVcXHUwMTVBXFx1MUU2NFxcdTAxNUNcXHUxRTYwXFx1MDE2MFxcdTFFNjZcXHUxRTYyXFx1MUU2OFxcdTAyMThcXHUwMTVFXFx1MkM3RVxcdUE3QThcXHVBNzg0XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1QnLCAnbGV0dGVycyc6L1tcXHUwMDU0XFx1MjRDOVxcdUZGMzRcXHUxRTZBXFx1MDE2NFxcdTFFNkNcXHUwMjFBXFx1MDE2MlxcdTFFNzBcXHUxRTZFXFx1MDE2NlxcdTAxQUNcXHUwMUFFXFx1MDIzRVxcdUE3ODZdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonVFonLCdsZXR0ZXJzJzovW1xcdUE3MjhdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonVScsICdsZXR0ZXJzJzovW1xcdTAwNTVcXHUyNENBXFx1RkYzNVxcdTAwRDlcXHUwMERBXFx1MDBEQlxcdTAxNjhcXHUxRTc4XFx1MDE2QVxcdTFFN0FcXHUwMTZDXFx1MDBEQ1xcdTAxREJcXHUwMUQ3XFx1MDFENVxcdTAxRDlcXHUxRUU2XFx1MDE2RVxcdTAxNzBcXHUwMUQzXFx1MDIxNFxcdTAyMTZcXHUwMUFGXFx1MUVFQVxcdTFFRThcXHUxRUVFXFx1MUVFQ1xcdTFFRjBcXHUxRUU0XFx1MUU3MlxcdTAxNzJcXHUxRTc2XFx1MUU3NFxcdTAyNDRdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonVicsICdsZXR0ZXJzJzovW1xcdTAwNTZcXHUyNENCXFx1RkYzNlxcdTFFN0NcXHUxRTdFXFx1MDFCMlxcdUE3NUVcXHUwMjQ1XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1ZZJywnbGV0dGVycyc6L1tcXHVBNzYwXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1cnLCAnbGV0dGVycyc6L1tcXHUwMDU3XFx1MjRDQ1xcdUZGMzdcXHUxRTgwXFx1MUU4MlxcdTAxNzRcXHUxRTg2XFx1MUU4NFxcdTFFODhcXHUyQzcyXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1gnLCAnbGV0dGVycyc6L1tcXHUwMDU4XFx1MjRDRFxcdUZGMzhcXHUxRThBXFx1MUU4Q10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidZJywgJ2xldHRlcnMnOi9bXFx1MDA1OVxcdTI0Q0VcXHVGRjM5XFx1MUVGMlxcdTAwRERcXHUwMTc2XFx1MUVGOFxcdTAyMzJcXHUxRThFXFx1MDE3OFxcdTFFRjZcXHUxRUY0XFx1MDFCM1xcdTAyNEVcXHUxRUZFXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1onLCAnbGV0dGVycyc6L1tcXHUwMDVBXFx1MjRDRlxcdUZGM0FcXHUwMTc5XFx1MUU5MFxcdTAxN0JcXHUwMTdEXFx1MUU5MlxcdTFFOTRcXHUwMUI1XFx1MDIyNFxcdTJDN0ZcXHUyQzZCXFx1QTc2Ml0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidhJywgJ2xldHRlcnMnOi9bXFx1MDA2MVxcdTI0RDBcXHVGRjQxXFx1MUU5QVxcdTAwRTBcXHUwMEUxXFx1MDBFMlxcdTFFQTdcXHUxRUE1XFx1MUVBQlxcdTFFQTlcXHUwMEUzXFx1MDEwMVxcdTAxMDNcXHUxRUIxXFx1MUVBRlxcdTFFQjVcXHUxRUIzXFx1MDIyN1xcdTAxRTFcXHUwMEU0XFx1MDFERlxcdTFFQTNcXHUwMEU1XFx1MDFGQlxcdTAxQ0VcXHUwMjAxXFx1MDIwM1xcdTFFQTFcXHUxRUFEXFx1MUVCN1xcdTFFMDFcXHUwMTA1XFx1MkM2NVxcdTAyNTBdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYWEnLCdsZXR0ZXJzJzovW1xcdUE3MzNdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYWUnLCdsZXR0ZXJzJzovW1xcdTAwRTZcXHUwMUZEXFx1MDFFM10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidhbycsJ2xldHRlcnMnOi9bXFx1QTczNV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidhdScsJ2xldHRlcnMnOi9bXFx1QTczN10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidhdicsJ2xldHRlcnMnOi9bXFx1QTczOVxcdUE3M0JdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYXknLCdsZXR0ZXJzJzovW1xcdUE3M0RdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYicsICdsZXR0ZXJzJzovW1xcdTAwNjJcXHUyNEQxXFx1RkY0MlxcdTFFMDNcXHUxRTA1XFx1MUUwN1xcdTAxODBcXHUwMTgzXFx1MDI1M10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidjJywgJ2xldHRlcnMnOi9bXFx1MDA2M1xcdTI0RDJcXHVGRjQzXFx1MDEwN1xcdTAxMDlcXHUwMTBCXFx1MDEwRFxcdTAwRTdcXHUxRTA5XFx1MDE4OFxcdTAyM0NcXHVBNzNGXFx1MjE4NF0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidkJywgJ2xldHRlcnMnOi9bXFx1MDA2NFxcdTI0RDNcXHVGRjQ0XFx1MUUwQlxcdTAxMEZcXHUxRTBEXFx1MUUxMVxcdTFFMTNcXHUxRTBGXFx1MDExMVxcdTAxOENcXHUwMjU2XFx1MDI1N1xcdUE3N0FdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonZHonLCdsZXR0ZXJzJzovW1xcdTAxRjNcXHUwMUM2XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2UnLCAnbGV0dGVycyc6L1tcXHUwMDY1XFx1MjRENFxcdUZGNDVcXHUwMEU4XFx1MDBFOVxcdTAwRUFcXHUxRUMxXFx1MUVCRlxcdTFFQzVcXHUxRUMzXFx1MUVCRFxcdTAxMTNcXHUxRTE1XFx1MUUxN1xcdTAxMTVcXHUwMTE3XFx1MDBFQlxcdTFFQkJcXHUwMTFCXFx1MDIwNVxcdTAyMDdcXHUxRUI5XFx1MUVDN1xcdTAyMjlcXHUxRTFEXFx1MDExOVxcdTFFMTlcXHUxRTFCXFx1MDI0N1xcdTAyNUJcXHUwMUREXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2YnLCAnbGV0dGVycyc6L1tcXHUwMDY2XFx1MjRENVxcdUZGNDZcXHUxRTFGXFx1MDE5MlxcdUE3N0NdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonZycsICdsZXR0ZXJzJzovW1xcdTAwNjdcXHUyNEQ2XFx1RkY0N1xcdTAxRjVcXHUwMTFEXFx1MUUyMVxcdTAxMUZcXHUwMTIxXFx1MDFFN1xcdTAxMjNcXHUwMUU1XFx1MDI2MFxcdUE3QTFcXHUxRDc5XFx1QTc3Rl0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidoJywgJ2xldHRlcnMnOi9bXFx1MDA2OFxcdTI0RDdcXHVGRjQ4XFx1MDEyNVxcdTFFMjNcXHUxRTI3XFx1MDIxRlxcdTFFMjVcXHUxRTI5XFx1MUUyQlxcdTFFOTZcXHUwMTI3XFx1MkM2OFxcdTJDNzZcXHUwMjY1XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2h2JywnbGV0dGVycyc6L1tcXHUwMTk1XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2knLCAnbGV0dGVycyc6L1tcXHUwMDY5XFx1MjREOFxcdUZGNDlcXHUwMEVDXFx1MDBFRFxcdTAwRUVcXHUwMTI5XFx1MDEyQlxcdTAxMkRcXHUwMEVGXFx1MUUyRlxcdTFFQzlcXHUwMUQwXFx1MDIwOVxcdTAyMEJcXHUxRUNCXFx1MDEyRlxcdTFFMkRcXHUwMjY4XFx1MDEzMV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidqJywgJ2xldHRlcnMnOi9bXFx1MDA2QVxcdTI0RDlcXHVGRjRBXFx1MDEzNVxcdTAxRjBcXHUwMjQ5XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2snLCAnbGV0dGVycyc6L1tcXHUwMDZCXFx1MjREQVxcdUZGNEJcXHUxRTMxXFx1MDFFOVxcdTFFMzNcXHUwMTM3XFx1MUUzNVxcdTAxOTlcXHUyQzZBXFx1QTc0MVxcdUE3NDNcXHVBNzQ1XFx1QTdBM10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidsJywgJ2xldHRlcnMnOi9bXFx1MDA2Q1xcdTI0REJcXHVGRjRDXFx1MDE0MFxcdTAxM0FcXHUwMTNFXFx1MUUzN1xcdTFFMzlcXHUwMTNDXFx1MUUzRFxcdTFFM0JcXHUwMTdGXFx1MDE0MlxcdTAxOUFcXHUwMjZCXFx1MkM2MVxcdUE3NDlcXHVBNzgxXFx1QTc0N10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidsaicsJ2xldHRlcnMnOi9bXFx1MDFDOV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidtJywgJ2xldHRlcnMnOi9bXFx1MDA2RFxcdTI0RENcXHVGRjREXFx1MUUzRlxcdTFFNDFcXHUxRTQzXFx1MDI3MVxcdTAyNkZdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonbicsICdsZXR0ZXJzJzovW1xcdTAwNkVcXHUyNEREXFx1RkY0RVxcdTAxRjlcXHUwMTQ0XFx1MDBGMVxcdTFFNDVcXHUwMTQ4XFx1MUU0N1xcdTAxNDZcXHUxRTRCXFx1MUU0OVxcdTAxOUVcXHUwMjcyXFx1MDE0OVxcdUE3OTFcXHVBN0E1XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J25qJywnbGV0dGVycyc6L1tcXHUwMUNDXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J28nLCAnbGV0dGVycyc6L1tcXHUwMDZGXFx1MjRERVxcdUZGNEZcXHUwMEYyXFx1MDBGM1xcdTAwRjRcXHUxRUQzXFx1MUVEMVxcdTFFRDdcXHUxRUQ1XFx1MDBGNVxcdTFFNERcXHUwMjJEXFx1MUU0RlxcdTAxNERcXHUxRTUxXFx1MUU1M1xcdTAxNEZcXHUwMjJGXFx1MDIzMVxcdTAwRjZcXHUwMjJCXFx1MUVDRlxcdTAxNTFcXHUwMUQyXFx1MDIwRFxcdTAyMEZcXHUwMUExXFx1MUVERFxcdTFFREJcXHUxRUUxXFx1MUVERlxcdTFFRTNcXHUxRUNEXFx1MUVEOVxcdTAxRUJcXHUwMUVEXFx1MDBGOFxcdTAxRkZcXHUwMjU0XFx1QTc0QlxcdUE3NERcXHUwMjc1XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J29pJywnbGV0dGVycyc6L1tcXHUwMUEzXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J291JywnbGV0dGVycyc6L1tcXHUwMjIzXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J29vJywnbGV0dGVycyc6L1tcXHVBNzRGXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3AnLCdsZXR0ZXJzJzovW1xcdTAwNzBcXHUyNERGXFx1RkY1MFxcdTFFNTVcXHUxRTU3XFx1MDFBNVxcdTFEN0RcXHVBNzUxXFx1QTc1M1xcdUE3NTVdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzoncScsJ2xldHRlcnMnOi9bXFx1MDA3MVxcdTI0RTBcXHVGRjUxXFx1MDI0QlxcdUE3NTdcXHVBNzU5XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3InLCdsZXR0ZXJzJzovW1xcdTAwNzJcXHUyNEUxXFx1RkY1MlxcdTAxNTVcXHUxRTU5XFx1MDE1OVxcdTAyMTFcXHUwMjEzXFx1MUU1QlxcdTFFNURcXHUwMTU3XFx1MUU1RlxcdTAyNERcXHUwMjdEXFx1QTc1QlxcdUE3QTdcXHVBNzgzXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3MnLCdsZXR0ZXJzJzovW1xcdTAwNzNcXHUyNEUyXFx1RkY1M1xcdTAwREZcXHUwMTVCXFx1MUU2NVxcdTAxNURcXHUxRTYxXFx1MDE2MVxcdTFFNjdcXHUxRTYzXFx1MUU2OVxcdTAyMTlcXHUwMTVGXFx1MDIzRlxcdUE3QTlcXHVBNzg1XFx1MUU5Ql0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOid0JywnbGV0dGVycyc6L1tcXHUwMDc0XFx1MjRFM1xcdUZGNTRcXHUxRTZCXFx1MUU5N1xcdTAxNjVcXHUxRTZEXFx1MDIxQlxcdTAxNjNcXHUxRTcxXFx1MUU2RlxcdTAxNjdcXHUwMUFEXFx1MDI4OFxcdTJDNjZcXHVBNzg3XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3R6JywnbGV0dGVycyc6L1tcXHVBNzI5XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3UnLCdsZXR0ZXJzJzovW1xcdTAwNzVcXHUyNEU0XFx1RkY1NVxcdTAwRjlcXHUwMEZBXFx1MDBGQlxcdTAxNjlcXHUxRTc5XFx1MDE2QlxcdTFFN0JcXHUwMTZEXFx1MDBGQ1xcdTAxRENcXHUwMUQ4XFx1MDFENlxcdTAxREFcXHUxRUU3XFx1MDE2RlxcdTAxNzFcXHUwMUQ0XFx1MDIxNVxcdTAyMTdcXHUwMUIwXFx1MUVFQlxcdTFFRTlcXHUxRUVGXFx1MUVFRFxcdTFFRjFcXHUxRUU1XFx1MUU3M1xcdTAxNzNcXHUxRTc3XFx1MUU3NVxcdTAyODldL2d9LFxuICAgICAgICAgICAgeydiYXNlJzondicsJ2xldHRlcnMnOi9bXFx1MDA3NlxcdTI0RTVcXHVGRjU2XFx1MUU3RFxcdTFFN0ZcXHUwMjhCXFx1QTc1RlxcdTAyOENdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzondnknLCdsZXR0ZXJzJzovW1xcdUE3NjFdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzondycsJ2xldHRlcnMnOi9bXFx1MDA3N1xcdTI0RTZcXHVGRjU3XFx1MUU4MVxcdTFFODNcXHUwMTc1XFx1MUU4N1xcdTFFODVcXHUxRTk4XFx1MUU4OVxcdTJDNzNdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzoneCcsJ2xldHRlcnMnOi9bXFx1MDA3OFxcdTI0RTdcXHVGRjU4XFx1MUU4QlxcdTFFOERdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzoneScsJ2xldHRlcnMnOi9bXFx1MDA3OVxcdTI0RThcXHVGRjU5XFx1MUVGM1xcdTAwRkRcXHUwMTc3XFx1MUVGOVxcdTAyMzNcXHUxRThGXFx1MDBGRlxcdTFFRjdcXHUxRTk5XFx1MUVGNVxcdTAxQjRcXHUwMjRGXFx1MUVGRl0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOid6JywnbGV0dGVycyc6L1tcXHUwMDdBXFx1MjRFOVxcdUZGNUFcXHUwMTdBXFx1MUU5MVxcdTAxN0NcXHUwMTdFXFx1MUU5M1xcdTFFOTVcXHUwMUI2XFx1MDIyNVxcdTAyNDBcXHUyQzZDXFx1QTc2M10vZ31cbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRlZmF1bHREaWFjcml0aWNzUmVtb3ZhbE1hcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoZGVmYXVsdERpYWNyaXRpY3NSZW1vdmFsTWFwW2ldLmxldHRlcnMsIGRlZmF1bHREaWFjcml0aWNzUmVtb3ZhbE1hcFtpXS5iYXNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdHI7XG5cbiAgIH07XG5cbiAgICBmdW5jdGlvbiBNdWx0aXBsZVNlbGVjdCgkZWwsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgbmFtZSA9ICRlbC5hdHRyKCduYW1lJykgfHwgb3B0aW9ucy5uYW1lIHx8ICcnO1xuXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgLy8gaGlkZSBzZWxlY3QgZWxlbWVudFxuICAgICAgICB0aGlzLiRlbCA9ICRlbC5oaWRlKCk7XG5cbiAgICAgICAgLy8gbGFiZWwgZWxlbWVudFxuICAgICAgICB0aGlzLiRsYWJlbCA9IHRoaXMuJGVsLmNsb3Nlc3QoJ2xhYmVsJyk7XG4gICAgICAgIGlmICh0aGlzLiRsYWJlbC5sZW5ndGggPT09IDAgJiYgdGhpcy4kZWwuYXR0cignaWQnKSkge1xuICAgICAgICAgICAgdGhpcy4kbGFiZWwgPSAkKHNwcmludGYoJ2xhYmVsW2Zvcj1cIiVzXCJdJywgdGhpcy4kZWwuYXR0cignaWQnKS5yZXBsYWNlKC86L2csICdcXFxcOicpKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZXN0b3JlIGNsYXNzIGFuZCB0aXRsZSBmcm9tIHNlbGVjdCBlbGVtZW50XG4gICAgICAgIHRoaXMuJHBhcmVudCA9ICQoc3ByaW50ZihcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibXMtcGFyZW50ICVzXCIgJXMvPicsXG4gICAgICAgICAgICAkZWwuYXR0cignY2xhc3MnKSB8fCAnJyxcbiAgICAgICAgICAgIHNwcmludGYoJ3RpdGxlPVwiJXNcIicsICRlbC5hdHRyKCd0aXRsZScpKSkpO1xuXG4gICAgICAgIC8vIGFkZCBwbGFjZWhvbGRlciB0byBjaG9pY2UgYnV0dG9uXG4gICAgICAgIHRoaXMuJGNob2ljZSA9ICQoc3ByaW50ZihbXG4gICAgICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwibXMtY2hvaWNlXCI+JyxcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJwbGFjZWhvbGRlclwiPiVzPC9zcGFuPicsXG4gICAgICAgICAgICAgICAgJzxkaXY+PC9kaXY+JyxcbiAgICAgICAgICAgICAgICAnPC9idXR0b24+J1xuICAgICAgICAgICAgXS5qb2luKCcnKSxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlcikpO1xuXG4gICAgICAgIC8vIGRlZmF1bHQgcG9zaXRpb24gaXMgYm90dG9tXG4gICAgICAgIHRoaXMuJGRyb3AgPSAkKHNwcmludGYoJzxkaXYgY2xhc3M9XCJtcy1kcm9wICVzXCIlcz48L2Rpdj4nLFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9uLFxuICAgICAgICAgICAgc3ByaW50ZignIHN0eWxlPVwid2lkdGg6ICVzXCInLCB0aGlzLm9wdGlvbnMuZHJvcFdpZHRoKSkpO1xuXG4gICAgICAgIHRoaXMuJGVsLmFmdGVyKHRoaXMuJHBhcmVudCk7XG4gICAgICAgIHRoaXMuJHBhcmVudC5hcHBlbmQodGhpcy4kY2hvaWNlKTtcbiAgICAgICAgdGhpcy4kcGFyZW50LmFwcGVuZCh0aGlzLiRkcm9wKTtcblxuICAgICAgICBpZiAodGhpcy4kZWwucHJvcCgnZGlzYWJsZWQnKSkge1xuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJHBhcmVudC5jc3MoJ3dpZHRoJyxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy53aWR0aCB8fFxuICAgICAgICAgICAgdGhpcy4kZWwuY3NzKCd3aWR0aCcpIHx8XG4gICAgICAgICAgICB0aGlzLiRlbC5vdXRlcldpZHRoKCkgKyAyMCk7XG5cbiAgICAgICAgdGhpcy5zZWxlY3RBbGxOYW1lID0gJ2RhdGEtbmFtZT1cInNlbGVjdEFsbCcgKyBuYW1lICsgJ1wiJztcbiAgICAgICAgdGhpcy5zZWxlY3RHcm91cE5hbWUgPSAnZGF0YS1uYW1lPVwic2VsZWN0R3JvdXAnICsgbmFtZSArICdcIic7XG4gICAgICAgIHRoaXMuc2VsZWN0SXRlbU5hbWUgPSAnZGF0YS1uYW1lPVwic2VsZWN0SXRlbScgKyBuYW1lICsgJ1wiJztcblxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5rZWVwT3Blbikge1xuICAgICAgICAgICAgJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJChlLnRhcmdldClbMF0gPT09IHRoYXQuJGNob2ljZVswXSB8fFxuICAgICAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCcubXMtY2hvaWNlJylbMF0gPT09IHRoYXQuJGNob2ljZVswXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgoJChlLnRhcmdldClbMF0gPT09IHRoYXQuJGRyb3BbMF0gfHxcbiAgICAgICAgICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50cygnLm1zLWRyb3AnKVswXSAhPT0gdGhhdC4kZHJvcFswXSAmJiBlLnRhcmdldCAhPT0gJGVsWzBdKSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMuaXNPcGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIE11bHRpcGxlU2VsZWN0LnByb3RvdHlwZSA9IHtcbiAgICAgICAgY29uc3RydWN0b3I6IE11bHRpcGxlU2VsZWN0LFxuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAkdWwgPSAkKCc8dWw+PC91bD4nKTtcblxuICAgICAgICAgICAgdGhpcy4kZHJvcC5odG1sKCcnKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5maWx0ZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkcm9wLmFwcGVuZChbXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibXMtc2VhcmNoXCI+JyxcbiAgICAgICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwidGV4dFwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiIGF1dG9jb3JyZWN0PVwib2ZmXCIgYXV0b2NhcGl0aWxpemU9XCJvZmZcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIj4nLFxuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+J10uam9pbignJylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNlbGVjdEFsbCAmJiAhdGhpcy5vcHRpb25zLnNpbmdsZSkge1xuICAgICAgICAgICAgICAgICR1bC5hcHBlbmQoW1xuICAgICAgICAgICAgICAgICAgICAnPGxpIGNsYXNzPVwibXMtc2VsZWN0LWFsbFwiPicsXG4gICAgICAgICAgICAgICAgICAgICc8bGFiZWw+JyxcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGlucHV0IHR5cGU9XCJjaGVja2JveFwiICVzIC8+ICcsIHRoaXMuc2VsZWN0QWxsTmFtZSksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zZWxlY3RBbGxEZWxpbWl0ZXJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zZWxlY3RBbGxUZXh0LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0QWxsRGVsaW1pdGVyWzFdLFxuICAgICAgICAgICAgICAgICAgICAnPC9sYWJlbD4nLFxuICAgICAgICAgICAgICAgICAgICAnPC9saT4nXG4gICAgICAgICAgICAgICAgXS5qb2luKCcnKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQuZWFjaCh0aGlzLiRlbC5jaGlsZHJlbigpLCBmdW5jdGlvbiAoaSwgZWxtKSB7XG4gICAgICAgICAgICAgICAgJHVsLmFwcGVuZCh0aGF0Lm9wdGlvblRvSHRtbChpLCBlbG0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJHVsLmFwcGVuZChzcHJpbnRmKCc8bGkgY2xhc3M9XCJtcy1uby1yZXN1bHRzXCI+JXM8L2xpPicsIHRoaXMub3B0aW9ucy5ub01hdGNoZXNGb3VuZCkpO1xuICAgICAgICAgICAgdGhpcy4kZHJvcC5hcHBlbmQoJHVsKTtcblxuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKCd1bCcpLmNzcygnbWF4LWhlaWdodCcsIHRoaXMub3B0aW9ucy5tYXhIZWlnaHQgKyAncHgnKTtcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuZmluZCgnLm11bHRpcGxlJykuY3NzKCd3aWR0aCcsIHRoaXMub3B0aW9ucy5tdWx0aXBsZVdpZHRoICsgJ3B4Jyk7XG5cbiAgICAgICAgICAgIHRoaXMuJHNlYXJjaElucHV0ID0gdGhpcy4kZHJvcC5maW5kKCcubXMtc2VhcmNoIGlucHV0Jyk7XG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwgPSB0aGlzLiRkcm9wLmZpbmQoJ2lucHV0WycgKyB0aGlzLnNlbGVjdEFsbE5hbWUgKyAnXScpO1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzID0gdGhpcy4kZHJvcC5maW5kKCdpbnB1dFsnICsgdGhpcy5zZWxlY3RHcm91cE5hbWUgKyAnXScpO1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMgPSB0aGlzLiRkcm9wLmZpbmQoJ2lucHV0WycgKyB0aGlzLnNlbGVjdEl0ZW1OYW1lICsgJ106ZW5hYmxlZCcpO1xuICAgICAgICAgICAgdGhpcy4kZGlzYWJsZUl0ZW1zID0gdGhpcy4kZHJvcC5maW5kKCdpbnB1dFsnICsgdGhpcy5zZWxlY3RJdGVtTmFtZSArICddOmRpc2FibGVkJyk7XG4gICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMgPSB0aGlzLiRkcm9wLmZpbmQoJy5tcy1uby1yZXN1bHRzJyk7XG5cbiAgICAgICAgICAgIHRoaXMuZXZlbnRzKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdEFsbCh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHRydWUpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzT3Blbikge1xuICAgICAgICAgICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9wdGlvblRvSHRtbDogZnVuY3Rpb24gKGksIGVsbSwgZ3JvdXAsIGdyb3VwRGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAkZWxtID0gJChlbG0pLFxuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSAkZWxtLmF0dHIoJ2NsYXNzJykgfHwgJycsXG4gICAgICAgICAgICAgICAgdGl0bGUgPSBzcHJpbnRmKCd0aXRsZT1cIiVzXCInLCAkZWxtLmF0dHIoJ3RpdGxlJykpLFxuICAgICAgICAgICAgICAgIG11bHRpcGxlID0gdGhpcy5vcHRpb25zLm11bHRpcGxlID8gJ211bHRpcGxlJyA6ICcnLFxuICAgICAgICAgICAgICAgIGRpc2FibGVkLFxuICAgICAgICAgICAgICAgIHR5cGUgPSB0aGlzLm9wdGlvbnMuc2luZ2xlID8gJ3JhZGlvJyA6ICdjaGVja2JveCc7XG5cbiAgICAgICAgICAgIGlmICgkZWxtLmlzKCdvcHRpb24nKSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9ICRlbG0udmFsKCksXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0aGF0Lm9wdGlvbnMudGV4dFRlbXBsYXRlKCRlbG0pLFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZCA9ICRlbG0ucHJvcCgnc2VsZWN0ZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUgPSBzcHJpbnRmKCdzdHlsZT1cIiVzXCInLCB0aGlzLm9wdGlvbnMuc3R5bGVyKHZhbHVlKSksXG4gICAgICAgICAgICAgICAgICAgICRlbDtcblxuICAgICAgICAgICAgICAgIGRpc2FibGVkID0gZ3JvdXBEaXNhYmxlZCB8fCAkZWxtLnByb3AoJ2Rpc2FibGVkJyk7XG5cbiAgICAgICAgICAgICAgICAkZWwgPSAkKFtcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGxpIGNsYXNzPVwiJXMgJXNcIiAlcyAlcz4nLCBtdWx0aXBsZSwgY2xhc3NlcywgdGl0bGUsIHN0eWxlKSxcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGxhYmVsIGNsYXNzPVwiJXNcIj4nLCBkaXNhYmxlZCA/ICdkaXNhYmxlZCcgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxpbnB1dCB0eXBlPVwiJXNcIiAlcyVzJXMlcz4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSwgdGhpcy5zZWxlY3RJdGVtTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkID8gJyBjaGVja2VkPVwiY2hlY2tlZFwiJyA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQgPyAnIGRpc2FibGVkPVwiZGlzYWJsZWRcIicgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwcmludGYoJyBkYXRhLWdyb3VwPVwiJXNcIicsIGdyb3VwKSksXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxzcGFuPiVzPC9zcGFuPicsIHRleHQpLFxuICAgICAgICAgICAgICAgICAgICAnPC9sYWJlbD4nLFxuICAgICAgICAgICAgICAgICAgICAnPC9saT4nXG4gICAgICAgICAgICAgICAgXS5qb2luKCcnKSk7XG4gICAgICAgICAgICAgICAgJGVsLmZpbmQoJ2lucHV0JykudmFsKHZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGVsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCRlbG0uaXMoJ29wdGdyb3VwJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSB0aGF0Lm9wdGlvbnMubGFiZWxUZW1wbGF0ZSgkZWxtKSxcbiAgICAgICAgICAgICAgICAgICAgJGdyb3VwID0gJCgnPGRpdi8+Jyk7XG5cbiAgICAgICAgICAgICAgICBncm91cCA9ICdncm91cF8nICsgaTtcbiAgICAgICAgICAgICAgICBkaXNhYmxlZCA9ICRlbG0ucHJvcCgnZGlzYWJsZWQnKTtcblxuICAgICAgICAgICAgICAgICRncm91cC5hcHBlbmQoW1xuICAgICAgICAgICAgICAgICAgICAnPGxpIGNsYXNzPVwiZ3JvdXBcIj4nLFxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8bGFiZWwgY2xhc3M9XCJvcHRncm91cCAlc1wiIGRhdGEtZ3JvdXA9XCIlc1wiPicsIGRpc2FibGVkID8gJ2Rpc2FibGVkJyA6ICcnLCBncm91cCksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5oaWRlT3B0Z3JvdXBDaGVja2JveGVzIHx8IHRoaXMub3B0aW9ucy5zaW5nbGUgPyAnJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgJXMgJXM+JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0R3JvdXBOYW1lLCBkaXNhYmxlZCA/ICdkaXNhYmxlZD1cImRpc2FibGVkXCInIDogJycpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgJzwvbGFiZWw+JyxcbiAgICAgICAgICAgICAgICAgICAgJzwvbGk+J1xuICAgICAgICAgICAgICAgIF0uam9pbignJykpO1xuXG4gICAgICAgICAgICAgICAgJC5lYWNoKCRlbG0uY2hpbGRyZW4oKSwgZnVuY3Rpb24gKGksIGVsbSkge1xuICAgICAgICAgICAgICAgICAgICAkZ3JvdXAuYXBwZW5kKHRoYXQub3B0aW9uVG9IdG1sKGksIGVsbSwgZ3JvdXAsIGRpc2FibGVkKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRncm91cC5odG1sKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdG9nZ2xlT3BlbiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdFt0aGF0Lm9wdGlvbnMuaXNPcGVuID8gJ2Nsb3NlJyA6ICdvcGVuJ10oKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAodGhpcy4kbGFiZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRsYWJlbC5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICdsYWJlbCcgfHwgZS50YXJnZXQgIT09IHRoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0b2dnbGVPcGVuKGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5maWx0ZXIgfHwgIXRoYXQub3B0aW9ucy5pc09wZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpOyAvLyBDYXVzZXMgbG9zdCBmb2N1cyBvdGhlcndpc2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLm9mZignY2xpY2snKS5vbignY2xpY2snLCB0b2dnbGVPcGVuKVxuICAgICAgICAgICAgICAgIC5vZmYoJ2ZvY3VzJykub24oJ2ZvY3VzJywgdGhpcy5vcHRpb25zLm9uRm9jdXMpXG4gICAgICAgICAgICAgICAgLm9mZignYmx1cicpLm9uKCdibHVyJywgdGhpcy5vcHRpb25zLm9uQmx1cik7XG5cbiAgICAgICAgICAgIHRoaXMuJHBhcmVudC5vZmYoJ2tleWRvd24nKS5vbigna2V5ZG93bicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjc6IC8vIGVzYyBrZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuJGNob2ljZS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHNlYXJjaElucHV0Lm9mZigna2V5ZG93bicpLm9uKCdrZXlkb3duJyxmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIC8vIEVuc3VyZSBzaGlmdC10YWIgY2F1c2VzIGxvc3QgZm9jdXMgZnJvbSBmaWx0ZXIgYXMgd2l0aCBjbGlja2luZyBhd2F5XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gOSAmJiBlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5vZmYoJ2tleXVwJykub24oJ2tleXVwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBlbnRlciBvciBzcGFjZVxuICAgICAgICAgICAgICAgIC8vIEF2b2lkIHNlbGVjdGluZy9kZXNlbGVjdGluZyBpZiBubyBjaG9pY2VzIG1hZGVcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLmZpbHRlckFjY2VwdE9uRW50ZXIgJiYgKGUud2hpY2ggPT09IDEzIHx8IGUud2hpY2ggPT0gMzIpICYmIHRoYXQuJHNlYXJjaElucHV0LnZhbCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEFsbC5jbGljaygpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGF0LmZpbHRlcigpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBjaGVja2VkID0gJCh0aGlzKS5wcm9wKCdjaGVja2VkJyksXG4gICAgICAgICAgICAgICAgICAgICRpdGVtcyA9IHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcignOnZpc2libGUnKTtcblxuICAgICAgICAgICAgICAgIGlmICgkaXRlbXMubGVuZ3RoID09PSB0aGF0LiRzZWxlY3RJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdFtjaGVja2VkID8gJ2NoZWNrQWxsJyA6ICd1bmNoZWNrQWxsJ10oKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyB3aGVuIHRoZSBmaWx0ZXIgb3B0aW9uIGlzIHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhhdC4kc2VsZWN0R3JvdXBzLnByb3AoJ2NoZWNrZWQnLCBjaGVja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLnByb3AoJ2NoZWNrZWQnLCBjaGVja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zW2NoZWNrZWQgPyAnb25DaGVja0FsbCcgOiAnb25VbmNoZWNrQWxsJ10oKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICQodGhpcykucGFyZW50KCkuYXR0cignZGF0YS1ncm91cCcpLFxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMgPSB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoJzp2aXNpYmxlJyksXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9ICRpdGVtcy5maWx0ZXIoc3ByaW50ZignW2RhdGEtZ3JvdXA9XCIlc1wiXScsIGdyb3VwKSksXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQgPSAkY2hpbGRyZW4ubGVuZ3RoICE9PSAkY2hpbGRyZW4uZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgICRjaGlsZHJlbi5wcm9wKCdjaGVja2VkJywgY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGVTZWxlY3RBbGwoKTtcbiAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoYXQub3B0aW9ucy5vbk9wdGdyb3VwQ2xpY2soe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCksXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6IGNoZWNrZWQsXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiAkY2hpbGRyZW4uZ2V0KCksXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlOiB0aGF0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLm9mZignY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGVTZWxlY3RBbGwoKTtcbiAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlT3B0R3JvdXBTZWxlY3QoKTtcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25DbGljayh7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAkKHRoaXMpLnBhcmVudCgpLnRleHQoKSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICQodGhpcykudmFsKCksXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6ICQodGhpcykucHJvcCgnY2hlY2tlZCcpLFxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZTogdGhhdFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5zaW5nbGUgJiYgdGhhdC5vcHRpb25zLmlzT3BlbiAmJiAhdGhhdC5vcHRpb25zLmtlZXBPcGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnNpbmdsZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2xpY2tlZFZhbCA9ICQodGhpcykudmFsKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKHRoaXMpLnZhbCgpICE9PSBjbGlja2VkVmFsO1xuICAgICAgICAgICAgICAgICAgICB9KS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvcGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kY2hvaWNlLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmlzT3BlbiA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuZmluZCgnPmRpdicpLmFkZENsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICB0aGlzLiRkcm9wW3RoaXMuYW5pbWF0ZU1ldGhvZCgnc2hvdycpXSgpO1xuXG4gICAgICAgICAgICAvLyBmaXggZmlsdGVyIGJ1Zzogbm8gcmVzdWx0cyBzaG93XG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuc2hvdygpO1xuICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLmhpZGUoKTtcblxuICAgICAgICAgICAgLy8gRml4ICM3NzogJ0FsbCBzZWxlY3RlZCcgd2hlbiBubyBvcHRpb25zXG4gICAgICAgICAgICBpZiAoIXRoaXMuJGVsLmNoaWxkcmVuKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuc2hvdygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLiRkcm9wLm9mZnNldCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGRyb3AuYXBwZW5kVG8oJCh0aGlzLm9wdGlvbnMuY29udGFpbmVyKSk7XG4gICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5vZmZzZXQoe1xuICAgICAgICAgICAgICAgICAgICB0b3A6IG9mZnNldC50b3AsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IG9mZnNldC5sZWZ0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VhcmNoSW5wdXQudmFsKCcnKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWFyY2hJbnB1dC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25PcGVuKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5maW5kKCc+ZGl2JykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgIHRoaXMuJGRyb3BbdGhpcy5hbmltYXRlTWV0aG9kKCdoaWRlJyldKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgIHRoaXMuJHBhcmVudC5hcHBlbmQodGhpcy4kZHJvcCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICAndG9wJzogJ2F1dG8nLFxuICAgICAgICAgICAgICAgICAgICAnbGVmdCc6ICdhdXRvJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2xvc2UoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhbmltYXRlTWV0aG9kOiBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgICAgICAgICB2YXIgbWV0aG9kcyA9IHtcbiAgICAgICAgICAgICAgICBzaG93OiB7XG4gICAgICAgICAgICAgICAgICAgIGZhZGU6ICdmYWRlSW4nLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZTogJ3NsaWRlRG93bidcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGhpZGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZmFkZTogJ2ZhZGVPdXQnLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZTogJ3NsaWRlVXAnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZHNbbWV0aG9kXVt0aGlzLm9wdGlvbnMuYW5pbWF0ZV0gfHwgbWV0aG9kO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKGlzSW5pdCkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdHMgPSB0aGlzLm9wdGlvbnMuZGlzcGxheVZhbHVlcyA/IHRoaXMuZ2V0U2VsZWN0cygpIDogdGhpcy5nZXRTZWxlY3RzKCd0ZXh0JyksXG4gICAgICAgICAgICAgICAgJHNwYW4gPSB0aGlzLiRjaG9pY2UuZmluZCgnPnNwYW4nKSxcbiAgICAgICAgICAgICAgICBzbCA9IHNlbGVjdHMubGVuZ3RoO1xuXG4gICAgICAgICAgICBpZiAoc2wgPT09IDApIHtcbiAgICAgICAgICAgICAgICAkc3Bhbi5hZGRDbGFzcygncGxhY2Vob2xkZXInKS5odG1sKHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlcik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5hbGxTZWxlY3RlZCAmJiBzbCA9PT0gdGhpcy4kc2VsZWN0SXRlbXMubGVuZ3RoICsgdGhpcy4kZGlzYWJsZUl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLmh0bWwodGhpcy5vcHRpb25zLmFsbFNlbGVjdGVkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmVsbGlwc2lzICYmIHNsID4gdGhpcy5vcHRpb25zLm1pbmltdW1Db3VudFNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgJHNwYW4ucmVtb3ZlQ2xhc3MoJ3BsYWNlaG9sZGVyJykudGV4dChzZWxlY3RzLnNsaWNlKDAsIHRoaXMub3B0aW9ucy5taW5pbXVtQ291bnRTZWxlY3RlZClcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4odGhpcy5vcHRpb25zLmRlbGltaXRlcikgKyAnLi4uJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5jb3VudFNlbGVjdGVkICYmIHNsID4gdGhpcy5vcHRpb25zLm1pbmltdW1Db3VudFNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgJHNwYW4ucmVtb3ZlQ2xhc3MoJ3BsYWNlaG9sZGVyJykuaHRtbCh0aGlzLm9wdGlvbnMuY291bnRTZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgnIycsIHNlbGVjdHMubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgnJScsIHRoaXMuJHNlbGVjdEl0ZW1zLmxlbmd0aCArIHRoaXMuJGRpc2FibGVJdGVtcy5sZW5ndGgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHNwYW4ucmVtb3ZlQ2xhc3MoJ3BsYWNlaG9sZGVyJykudGV4dChzZWxlY3RzLmpvaW4odGhpcy5vcHRpb25zLmRlbGltaXRlcikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFkZFRpdGxlKSB7XG4gICAgICAgICAgICAgICAgJHNwYW4ucHJvcCgndGl0bGUnLCB0aGlzLmdldFNlbGVjdHMoJ3RleHQnKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHNldCBzZWxlY3RzIHRvIHNlbGVjdFxuICAgICAgICAgICAgdGhpcy4kZWwudmFsKHRoaXMuZ2V0U2VsZWN0cygpKS50cmlnZ2VyKCdjaGFuZ2UnKTtcblxuICAgICAgICAgICAgLy8gYWRkIHNlbGVjdGVkIGNsYXNzIHRvIHNlbGVjdGVkIGxpXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoJ2lucHV0OmNoZWNrZWQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJ2xpJykuZmlyc3QoKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyB0cmlnZ2VyIDxzZWxlY3Q+IGNoYW5nZSBldmVudFxuICAgICAgICAgICAgaWYgKCFpc0luaXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVTZWxlY3RBbGw6IGZ1bmN0aW9uIChpc0luaXQpIHtcbiAgICAgICAgICAgIHZhciAkaXRlbXMgPSB0aGlzLiRzZWxlY3RJdGVtcztcblxuICAgICAgICAgICAgaWYgKCFpc0luaXQpIHtcbiAgICAgICAgICAgICAgICAkaXRlbXMgPSAkaXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnLCAkaXRlbXMubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmxlbmd0aCA9PT0gJGl0ZW1zLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGgpO1xuICAgICAgICAgICAgaWYgKCFpc0luaXQgJiYgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNoZWNrQWxsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlT3B0R3JvdXBTZWxlY3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciAkaXRlbXMgPSB0aGlzLiRzZWxlY3RJdGVtcy5maWx0ZXIoJzp2aXNpYmxlJyk7XG4gICAgICAgICAgICAkLmVhY2godGhpcy4kc2VsZWN0R3JvdXBzLCBmdW5jdGlvbiAoaSwgdmFsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gJCh2YWwpLnBhcmVudCgpLmF0dHIoJ2RhdGEtZ3JvdXAnKSxcbiAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuID0gJGl0ZW1zLmZpbHRlcihzcHJpbnRmKCdbZGF0YS1ncm91cD1cIiVzXCJdJywgZ3JvdXApKTtcbiAgICAgICAgICAgICAgICAkKHZhbCkucHJvcCgnY2hlY2tlZCcsICRjaGlsZHJlbi5sZW5ndGggJiZcbiAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuLmxlbmd0aCA9PT0gJGNoaWxkcmVuLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy92YWx1ZSBvciB0ZXh0LCBkZWZhdWx0OiAndmFsdWUnXG4gICAgICAgIGdldFNlbGVjdHM6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdGV4dHMgPSBbXSxcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuZmluZChzcHJpbnRmKCdpbnB1dFslc106Y2hlY2tlZCcsIHRoaXMuc2VsZWN0SXRlbU5hbWUpKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0ZXh0cy5wdXNoKCQodGhpcykucGFyZW50cygnbGknKS5maXJzdCgpLnRleHQoKSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzLnB1c2goJCh0aGlzKS52YWwoKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICd0ZXh0JyAmJiB0aGlzLiRzZWxlY3RHcm91cHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGV4dHMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gJC50cmltKCQodGhpcykucGFyZW50KCkudGV4dCgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwID0gJCh0aGlzKS5wYXJlbnQoKS5kYXRhKCdncm91cCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuID0gdGhhdC4kZHJvcC5maW5kKHNwcmludGYoJ1slc11bZGF0YS1ncm91cD1cIiVzXCJdJywgdGhhdC5zZWxlY3RJdGVtTmFtZSwgZ3JvdXApKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICRzZWxlY3RlZCA9ICRjaGlsZHJlbi5maWx0ZXIoJzpjaGVja2VkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkc2VsZWN0ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2goJ1snKTtcbiAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKHRleHQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoJGNoaWxkcmVuLmxlbmd0aCA+ICRzZWxlY3RlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2VsZWN0ZWQuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKCQodGhpcykucGFyZW50KCkudGV4dCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKCc6ICcgKyBsaXN0LmpvaW4oJywgJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaCgnXScpO1xuICAgICAgICAgICAgICAgICAgICB0ZXh0cy5wdXNoKGh0bWwuam9pbignJykpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHR5cGUgPT09ICd0ZXh0JyA/IHRleHRzIDogdmFsdWVzO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFNlbGVjdHM6IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLiRkaXNhYmxlSXRlbXMucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICQuZWFjaCh2YWx1ZXMsIGZ1bmN0aW9uIChpLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcihzcHJpbnRmKCdbdmFsdWU9XCIlc1wiXScsIHZhbHVlKSkucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoYXQuJGRpc2FibGVJdGVtcy5maWx0ZXIoc3ByaW50ZignW3ZhbHVlPVwiJXNcIl0nLCB2YWx1ZSkpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnLCB0aGlzLiRzZWxlY3RJdGVtcy5sZW5ndGggPT09XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCArIHRoaXMuJGRpc2FibGVJdGVtcy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcblxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuJHNlbGVjdEdyb3VwcywgZnVuY3Rpb24gKGksIHZhbCkge1xuICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICQodmFsKS5wYXJlbnQoKS5hdHRyKCdkYXRhLWdyb3VwJyksXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9IHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcignW2RhdGEtZ3JvdXA9XCInICsgZ3JvdXAgKyAnXCJdJyk7XG4gICAgICAgICAgICAgICAgJCh2YWwpLnByb3AoJ2NoZWNrZWQnLCAkY2hpbGRyZW4ubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbi5sZW5ndGggPT09ICRjaGlsZHJlbi5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjaGVja0FsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2hlY2tBbGwoKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1bmNoZWNrQWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25VbmNoZWNrQWxsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9jdXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5mb2N1cygpO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uRm9jdXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBibHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuYmx1cigpO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uQmx1cigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlZnJlc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgICB9LFxuXHRcdFxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLiRwYXJlbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLiRlbC5kYXRhKCdtdWx0aXBsZVNlbGVjdCcsIG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpbHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHRleHQgPSAkLnRyaW0odGhpcy4kc2VhcmNoSW5wdXQudmFsKCkpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMucGFyZW50KCkuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcy5wYXJlbnQoKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLnBhcmVudCgpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuaGlkZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkKHRoaXMpLnBhcmVudCgpO1xuICAgICAgICAgICAgICAgICAgICAkcGFyZW50W3JlbW92ZURpYWNyaXRpY3MoJHBhcmVudC50ZXh0KCkudG9Mb3dlckNhc2UoKSkuaW5kZXhPZihyZW1vdmVEaWFjcml0aWNzKHRleHQpKSA8IDAgPyAnaGlkZScgOiAnc2hvdyddKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzYWJsZUl0ZW1zLnBhcmVudCgpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciAkcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gJHBhcmVudC5hdHRyKCdkYXRhLWdyb3VwJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMgPSB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoJzp2aXNpYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgICRwYXJlbnRbJGl0ZW1zLmZpbHRlcihzcHJpbnRmKCdbZGF0YS1ncm91cD1cIiVzXCJdJywgZ3JvdXApKS5sZW5ndGggPyAnc2hvdycgOiAnaGlkZSddKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIG5vIG1hdGNoZXMgZm91bmRcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kc2VsZWN0SXRlbXMucGFyZW50KCkuZmlsdGVyKCc6dmlzaWJsZScpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJG5vUmVzdWx0cy5zaG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy51cGRhdGVPcHRHcm91cFNlbGVjdCgpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTZWxlY3RBbGwoKTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkZpbHRlcih0ZXh0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAkLmZuLm11bHRpcGxlU2VsZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3B0aW9uID0gYXJndW1lbnRzWzBdLFxuICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50cyxcblxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBhbGxvd2VkTWV0aG9kcyA9IFtcbiAgICAgICAgICAgICAgICAnZ2V0U2VsZWN0cycsICdzZXRTZWxlY3RzJyxcbiAgICAgICAgICAgICAgICAnZW5hYmxlJywgJ2Rpc2FibGUnLFxuICAgICAgICAgICAgICAgICdvcGVuJywgJ2Nsb3NlJyxcbiAgICAgICAgICAgICAgICAnY2hlY2tBbGwnLCAndW5jaGVja0FsbCcsXG4gICAgICAgICAgICAgICAgJ2ZvY3VzJywgJ2JsdXInLFxuICAgICAgICAgICAgICAgICdyZWZyZXNoJywgJ2Rlc3Ryb3knXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSAkdGhpcy5kYXRhKCdtdWx0aXBsZVNlbGVjdCcpLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgJC5mbi5tdWx0aXBsZVNlbGVjdC5kZWZhdWx0cyxcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09PSAnb2JqZWN0JyAmJiBvcHRpb24pO1xuXG4gICAgICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gbmV3IE11bHRpcGxlU2VsZWN0KCR0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKCdtdWx0aXBsZVNlbGVjdCcsIGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZiAoJC5pbkFycmF5KG9wdGlvbiwgYWxsb3dlZE1ldGhvZHMpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnVW5rbm93biBtZXRob2Q6ICcgKyBvcHRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhbHVlID0gZGF0YVtvcHRpb25dKGFyZ3NbMV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYXRhLmluaXQoKTtcbiAgICAgICAgICAgICAgICBpZiAoYXJnc1sxXSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGRhdGFbYXJnc1sxXV0uYXBwbHkoZGF0YSwgW10uc2xpY2UuY2FsbChhcmdzLCAyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJyA/IHZhbHVlIDogdGhpcztcbiAgICB9O1xuXG4gICAgJC5mbi5tdWx0aXBsZVNlbGVjdC5kZWZhdWx0cyA9IHtcbiAgICAgICAgbmFtZTogJycsXG4gICAgICAgIGlzT3BlbjogZmFsc2UsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnJyxcbiAgICAgICAgc2VsZWN0QWxsOiB0cnVlLFxuICAgICAgICBzZWxlY3RBbGxEZWxpbWl0ZXI6IFsnWycsICddJ10sXG4gICAgICAgIG1pbmltdW1Db3VudFNlbGVjdGVkOiAzLFxuICAgICAgICBlbGxpcHNpczogZmFsc2UsXG4gICAgICAgIG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgbXVsdGlwbGVXaWR0aDogODAsXG4gICAgICAgIHNpbmdsZTogZmFsc2UsXG4gICAgICAgIGZpbHRlcjogZmFsc2UsXG4gICAgICAgIHdpZHRoOiB1bmRlZmluZWQsXG4gICAgICAgIGRyb3BXaWR0aDogdW5kZWZpbmVkLFxuICAgICAgICBtYXhIZWlnaHQ6IDI1MCxcbiAgICAgICAgY29udGFpbmVyOiBudWxsLFxuICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbScsXG4gICAgICAgIGtlZXBPcGVuOiBmYWxzZSxcbiAgICAgICAgYW5pbWF0ZTogJ25vbmUnLCAvLyAnbm9uZScsICdmYWRlJywgJ3NsaWRlJ1xuICAgICAgICBkaXNwbGF5VmFsdWVzOiBmYWxzZSxcbiAgICAgICAgZGVsaW1pdGVyOiAnLCAnLFxuICAgICAgICBhZGRUaXRsZTogZmFsc2UsXG4gICAgICAgIGZpbHRlckFjY2VwdE9uRW50ZXI6IGZhbHNlLFxuICAgICAgICBoaWRlT3B0Z3JvdXBDaGVja2JveGVzOiBmYWxzZSxcblxuICAgICAgICBzZWxlY3RBbGxUZXh0OiAnU2VsZWN0IGFsbCcsXG4gICAgICAgIGFsbFNlbGVjdGVkOiAnQWxsIHNlbGVjdGVkJyxcbiAgICAgICAgY291bnRTZWxlY3RlZDogJyMgb2YgJSBzZWxlY3RlZCcsXG4gICAgICAgIG5vTWF0Y2hlc0ZvdW5kOiAnTm8gbWF0Y2hlcyBmb3VuZCcsXG5cbiAgICAgICAgc3R5bGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIHRleHRUZW1wbGF0ZTogZnVuY3Rpb24gKCRlbG0pIHtcbiAgICAgICAgICAgIHJldHVybiAkZWxtLmh0bWwoKTtcbiAgICAgICAgfSxcbiAgICAgICAgbGFiZWxUZW1wbGF0ZTogZnVuY3Rpb24gKCRlbG0pIHtcbiAgICAgICAgICAgIHJldHVybiAkZWxtLmF0dHIoJ2xhYmVsJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25PcGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIG9uQ2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgb25DaGVja0FsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBvblVuY2hlY2tBbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgb25PcHRncm91cENsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgb25GaWx0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgJCgnc2VsZWN0W211bHRpcGxlXScpLm11bHRpcGxlU2VsZWN0KCk7XG59KShqUXVlcnkpO1xuIl19
