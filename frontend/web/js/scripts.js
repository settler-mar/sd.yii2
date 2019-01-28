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

//фильтр производителей - фильтрация элементов
$('#catalog_product_filter-input').keyup(function(){

  var val = $(this).val().length > 2 ? $(this).val().toUpperCase() : false;
  var openCount = 0;
  var list = $(this).closest('.catalog_product_filter-items-item-checkbox');
  if (!val) {
      $(list).removeClass('accordion_hide');
  }
  $('.catalog_product_filter-checkbox_item').each(function(index, item) {
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
(function () {

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxhbmd1YWdlLmpzIiwibGFuZy5qcyIsImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsImpxdWVyeS11aS5taW4uanMiLCJ0b29sdGlwLmpzIiwiYWNjb3VudF9ub3RpZmljYXRpb24uanMiLCJzbGlkZXIuanMiLCJoZWFkZXJfbWVudV9hbmRfc2VhcmNoLmpzIiwiY2FsYy1jYXNoYmFjay5qcyIsImF1dG9faGlkZV9jb250cm9sLmpzIiwiaGlkZV9zaG93X2FsbC5qcyIsImNsb2NrLmpzIiwibGlzdF90eXBlX3N3aXRjaGVyLmpzIiwic2VsZWN0LmpzIiwic2VhcmNoLmpzIiwiZ290by5qcyIsImFjY291bnQtd2l0aGRyYXcuanMiLCJhamF4LmpzIiwiZG9icm8uanMiLCJsZWZ0LW1lbnUtdG9nZ2xlLmpzIiwic2hhcmU0Mi5qcyIsInVzZXJfcmV2aWV3cy5qcyIsInBsYWNlaG9sZGVyLmpzIiwiYWpheC1sb2FkLmpzIiwiYmFubmVyLmpzIiwiY291bnRyeV9zZWxlY3QuanMiLCJ1c2Vyc19vbmxpbmUuanMiLCJwcm9kdWN0X2ZpbHRlci5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsIm1vZGFscy5qcyIsImZvb3Rlcl9tZW51LmpzIiwicmF0aW5nLmpzIiwiZmF2b3JpdGVzLmpzIiwic2Nyb2xsX3RvLmpzIiwiY29weV90b19jbGlwYm9hcmQuanMiLCJpbWcuanMiLCJwYXJlbnRzX29wZW5fd2luZG93cy5qcyIsImZvcm1zLmpzIiwiY29va2llLmpzIiwidGFibGUuanMiLCJhamF4X3JlbW92ZS5qcyIsImZpeGVzLmpzIiwibGlua3MuanMiLCJzdG9yZV9wb2ludHMuanMiLCJoYXNodGFncy5qcyIsInBsdWdpbnMuanMiLCJtdWx0aXBsZS1zZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JnQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbk5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgbGcgPSAoZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGxhbmc9e307XHJcbiAgdXJsPScvbGFuZ3VhZ2UvJytkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZysnLmpzb24nO1xyXG4gICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgLy9jb25zb2xlLmxvZyhkYXRhKTtcclxuICAgIGZvcih2YXIgaW5kZXggaW4gZGF0YSkge1xyXG4gICAgICBkYXRhW2luZGV4XT1jbGVhclZhcihkYXRhW2luZGV4XSk7XHJcbiAgICB9XHJcbiAgICBsYW5nPWRhdGE7XHJcbiAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJsYW5ndWFnZV9sb2FkZWRcIik7XHJcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgIC8vY29uc29sZS5sb2coZGF0YSwgZXZlbnQpO1xyXG4gIH0sJ2pzb24nKTtcclxuXHJcbiAgZnVuY3Rpb24gY2xlYXJWYXIodHh0KXtcclxuICAgIHR4dD10eHQucmVwbGFjZSgvXFxzKy9nLFwiIFwiKTsvL9GD0LTQsNC70LXQvdC40LUg0LfQsNC00LLQvtC10L3QuNC1INC/0YDQvtCx0LXQu9C+0LJcclxuXHJcbiAgICAvL9Cn0LjRgdGC0LjQvCDQv9C+0LTRgdGC0LDQstC70Y/QtdC80YvQtSDQv9C10YDQtdC80LXQvdC90YvQtVxyXG4gICAgc3RyPXR4dC5tYXRjaCgvXFx7KC4qPylcXH0vZyk7XHJcbiAgICBpZiAoIHN0ciAhPSBudWxsKSB7XHJcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIHN0cl90PXN0cltpXS5yZXBsYWNlKC8gL2csXCJcIik7XHJcbiAgICAgICAgdHh0PXR4dC5yZXBsYWNlKHN0cltpXSxzdHJfdCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0eHQ7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZnVuY3Rpb24odHBsLCBkYXRhKXtcclxuICAgIGlmKHR5cGVvZihsYW5nW3RwbF0pPT1cInVuZGVmaW5lZFwiKXtcclxuICAgICAgY29uc29sZS5sb2coXCJsYW5nIG5vdCBmb3VuZDogXCIrdHBsKTtcclxuICAgICAgcmV0dXJuIHRwbDtcclxuICAgIH1cclxuICAgIHRwbD1sYW5nW3RwbF07XHJcbiAgICBpZih0eXBlb2YoZGF0YSk9PVwib2JqZWN0XCIpe1xyXG4gICAgICBmb3IodmFyIGluZGV4IGluIGRhdGEpIHtcclxuICAgICAgICB0cGw9dHBsLnNwbGl0KFwie1wiK2luZGV4K1wifVwiKS5qb2luKGRhdGFbaW5kZXhdKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRwbDtcclxuICB9XHJcbn0pKCk7IiwidmFyIGxhbmcgPSAoZnVuY3Rpb24oKXtcclxuICAgIHZhciBjb2RlID0gJ3J1LVJVJztcclxuICAgIHZhciBrZXkgPSAncnUnO1xyXG4gICAgdmFyIHVybF9wcmVmaXggPSdydSc7XHJcblxyXG4gICAgdmFyIGVsZW0gPSAkKFwiI3NkX2xhbmdfbGlzdFwiKTtcclxuICAgIGlmIChlbGVtKSB7XHJcbiAgICAgICAgY29kZSA9ICQoZWxlbSkuZGF0YSgnY29kZScpID8gJChlbGVtKS5kYXRhKCdjb2RlJykgOiBjb2RlO1xyXG4gICAgICAgIGtleSA9ICQoZWxlbSkuZGF0YSgna2V5JykgPyAkKGVsZW0pLmRhdGEoJ2tleScpIDoga2V5O1xyXG4gICAgICAgIHVybF9wcmVmaXggPSAkKGVsZW0pLmRhdGEoJ3VybC1wcmVmaXgnKSA/ICQoZWxlbSkuZGF0YSgndXJsLXByZWZpeCcpIDogdXJsX3ByZWZpeDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgaHJlZl9wcmVmaXg6IHVybF9wcmVmaXhcclxuICAgIH1cclxufSkoKTtcclxuIiwib2JqZWN0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgdmFyIGMgPSBiLFxyXG4gICAga2V5O1xyXG4gIGZvciAoa2V5IGluIGEpIHtcclxuICAgIGlmIChhLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBjO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gbG9naW5fcmVkaXJlY3QobmV3X2hyZWYpIHtcclxuICBocmVmID0gbG9jYXRpb24uaHJlZjtcclxuICBpZiAoaHJlZi5pbmRleE9mKCdzdG9yZScpID4gMCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpID4gMCB8fCBocmVmLmluZGV4T2YoJ3VybCgnKSA+IDApIHtcclxuICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsb2NhdGlvbi5ocmVmID0gbmV3X2hyZWY7XHJcbiAgfVxyXG59XHJcbiIsIihmdW5jdGlvbiAodywgZCwgJCkge1xyXG4gIHZhciBzbGlkZV9pbnRlcnZhbD00MDAwO1xyXG4gIHZhciBzY3JvbGxzX2Jsb2NrID0gJCgnLnNjcm9sbF9ib3gnKTtcclxuXHJcbiAgaWYgKHNjcm9sbHNfYmxvY2subGVuZ3RoID09IDApIHJldHVybjtcclxuICAvLyQoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKS53cmFwQWxsKHNjcm9sbHNfYmxvY2spO1xyXG4gICQoc2Nyb2xsc19ibG9jaykud3JhcCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpO1xyXG5cclxuICBpbml0X3Njcm9sbCgpO1xyXG4gIGNhbGNfc2Nyb2xsKCk7XHJcblxyXG4gICQod2luZG93ICkub24oXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgY2FsY19zY3JvbGwoKTtcclxuICB9KTtcclxuICB2YXIgdDEsIHQyO1xyXG5cclxuICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uICgpIHtcclxuICAgIGNsZWFyVGltZW91dCh0MSk7XHJcbiAgICBjbGVhclRpbWVvdXQodDIpO1xyXG4gICAgdDEgPSBzZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLCAzMDApO1xyXG4gICAgdDIgPSBzZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLCA4MDApO1xyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBpbml0X3Njcm9sbCgpIHtcclxuICAgIHZhciBjb250cm9sID0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xcIj48L2Rpdj4nO1xyXG4gICAgY29udHJvbCA9ICQoY29udHJvbCk7XHJcbiAgICBjb250cm9sLmluc2VydEFmdGVyKHNjcm9sbHNfYmxvY2spO1xyXG4gICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTtcclxuXHJcbiAgICBzY3JvbGxzX2Jsb2NrLnByZXBlbmQoJzxkaXYgY2xhc3M9c2Nyb2xsX2JveC1tb3Zlcj48L2Rpdj4nKTtcclxuXHJcbiAgICBjb250cm9sLm9uKCdjbGljaycsICcuc2Nyb2xsX2JveC1jb250cm9sX3BvaW50JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICB2YXIgY29udHJvbCA9ICR0aGlzLnBhcmVudCgpO1xyXG4gICAgICB2YXIgaSA9ICR0aGlzLmluZGV4KCk7XHJcbiAgICAgIGlmICgkdGhpcy5oYXNDbGFzcygnYWN0aXZlJykpcmV0dXJuO1xyXG4gICAgICBjb250cm9sLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICR0aGlzLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgIHZhciBkeCA9IGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnKTtcclxuICAgICAgdmFyIGVsID0gY29udHJvbC5wcmV2KCk7XHJcbiAgICAgIGVsLmZpbmQoJy5zY3JvbGxfYm94LW1vdmVyJykuY3NzKCdtYXJnaW4tbGVmdCcsIC1keCAqIGkpO1xyXG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGkpO1xyXG5cclxuICAgICAgc3RvcFNjcm9sLmJpbmQoZWwpKCk7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIgaiA9IDA7IGogPCBzY3JvbGxzX2Jsb2NrLmxlbmd0aDsgaisrKSB7XHJcbiAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGopO1xyXG4gICAgZWwucGFyZW50KCkuaG92ZXIoc3RvcFNjcm9sLmJpbmQoZWwpLCBzdGFydFNjcm9sLmJpbmQoZWwpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN0YXJ0U2Nyb2woKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpKXJldHVybjtcclxuXHJcbiAgICB2YXIgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLmJpbmQoJHRoaXMpLCBzbGlkZV9pbnRlcnZhbCk7XHJcbiAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLCB0aW1lb3V0SWQpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzdG9wU2Nyb2woKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHRpbWVvdXRJZCA9ICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpO1xyXG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJywgZmFsc2UpO1xyXG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpIHx8ICF0aW1lb3V0SWQpcmV0dXJuO1xyXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIGZhbHNlKTtcclxuICAgIGlmICghJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XHJcblxyXG4gICAgdmFyIGNvbnRyb2xzID0gJHRoaXMubmV4dCgpLmZpbmQoJz4qJyk7XHJcbiAgICB2YXIgYWN0aXZlID0gJHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJyk7XHJcbiAgICB2YXIgcG9pbnRfY250ID0gY29udHJvbHMubGVuZ3RoO1xyXG4gICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcclxuICAgIGFjdGl2ZSsrO1xyXG4gICAgaWYgKGFjdGl2ZSA+PSBwb2ludF9jbnQpYWN0aXZlID0gMDtcclxuICAgICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XHJcblxyXG4gICAgY29udHJvbHMuZXEoYWN0aXZlKS5jbGljaygpO1xyXG4gICAgc3RhcnRTY3JvbC5iaW5kKCR0aGlzKSgpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2FsY19zY3JvbGwoKSB7XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGkpO1xyXG4gICAgICB2YXIgY29udHJvbCA9IGVsLm5leHQoKTtcclxuICAgICAgdmFyIHdpZHRoX21heCA9IGVsLmRhdGEoJ3Njcm9sbC13aWR0aC1tYXgnKTtcclxuICAgICAgdyA9IGVsLndpZHRoKCk7XHJcblxyXG4gICAgICAvL9C00LXQu9Cw0LXQvCDQutC+0L3RgtGA0L7Qu9GMINC+0LPRgNCw0L3QuNGH0LXQvdC40Y8g0YjQuNGA0LjQvdGLLiDQldGB0LvQuCDQv9GA0LXQstGL0YjQtdC90L4g0YLQviDQvtGC0LrQu9GO0YfQsNC10Lwg0YHQutGA0L7QuyDQuCDQv9C10YDQtdGF0L7QtNC40Lwg0Log0YHQu9C10LTRg9GO0YnQtdC80YMg0Y3Qu9C10LzQtdC90YLRg1xyXG4gICAgICBpZiAod2lkdGhfbWF4ICYmIHcgPiB3aWR0aF9tYXgpIHtcclxuICAgICAgICBjb250cm9sLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XHJcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIG5vX2NsYXNzID0gZWwuZGF0YSgnc2Nyb2xsLWVsZW1ldC1pZ25vcmUtY2xhc3MnKTtcclxuICAgICAgdmFyIGNoaWxkcmVuID0gZWwuZmluZCgnPionKS5ub3QoJy5zY3JvbGxfYm94LW1vdmVyJyk7XHJcbiAgICAgIGlmIChub19jbGFzcykge1xyXG4gICAgICAgIGNoaWxkcmVuID0gY2hpbGRyZW4ubm90KCcuJyArIG5vX2NsYXNzKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvL9CV0YHQu9C4INC90LXRgiDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcclxuICAgICAgaWYgKGNoaWxkcmVuID09IDApIHtcclxuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBmX2VsID0gY2hpbGRyZW4uZXEoMSk7XHJcbiAgICAgIHZhciBjaGlsZHJlbl93ID0gZl9lbC5vdXRlcldpZHRoKCk7IC8v0LLRgdC10LPQviDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcclxuICAgICAgY2hpbGRyZW5fdyArPSBwYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tbGVmdCcpKTtcclxuICAgICAgY2hpbGRyZW5fdyArPSBwYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tcmlnaHQnKSk7XHJcblxyXG4gICAgICB2YXIgc2NyZWFuX2NvdW50ID0gTWF0aC5mbG9vcih3IC8gY2hpbGRyZW5fdyk7XHJcblxyXG4gICAgICAvL9CV0YHQu9C4INCy0YHQtSDQstC70LDQt9C40YIg0L3QsCDRjdC60YDQsNC9XHJcbiAgICAgIGlmIChjaGlsZHJlbiA8PSBzY3JlYW5fY291bnQpIHtcclxuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8v0KPQttC1INGC0L7Rh9C90L4g0LfQvdCw0LXQvCDRh9GC0L4g0YHQutGA0L7QuyDQvdGD0LbQtdC9XHJcbiAgICAgIGVsLmFkZENsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XHJcblxyXG4gICAgICB2YXIgcG9pbnRfY250ID0gY2hpbGRyZW4ubGVuZ3RoIC0gc2NyZWFuX2NvdW50ICsgMTtcclxuICAgICAgLy/QtdGB0LvQuCDQvdC1INC90LDQtNC+INC+0LHQvdC+0LLQu9GP0YLRjCDQutC+0L3RgtGA0L7QuyDRgtC+INCy0YvRhdC+0LTQuNC8LCDQvdC1INC30LDQsdGL0LLQsNGPINC+0LHQvdC+0LLQuNGC0Ywg0YjQuNGA0LjQvdGDINC00L7Rh9C10YDQvdC40YVcclxuICAgICAgaWYgKGNvbnRyb2wuZmluZCgnPionKS5sZW5ndGggPT0gcG9pbnRfY250KSB7XHJcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhY3RpdmUgPSBlbC5kYXRhKCdzbGlkZS1hY3RpdmUnKTtcclxuICAgICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcclxuICAgICAgaWYgKGFjdGl2ZSA+PSBwb2ludF9jbnQpYWN0aXZlID0gcG9pbnRfY250IC0gMTtcclxuICAgICAgdmFyIG91dCA9ICcnO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvaW50X2NudDsgaisrKSB7XHJcbiAgICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sX3BvaW50JyArIChqID09IGFjdGl2ZSA/ICcgYWN0aXZlJyA6ICcnKSArICdcIj48L2Rpdj4nO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnRyb2wuaHRtbChvdXQpO1xyXG5cclxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xyXG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWNvdW50JywgcG9pbnRfY250KTtcclxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xyXG5cclxuICAgICAgaWYgKCFlbC5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKSkge1xyXG4gICAgICAgIHN0YXJ0U2Nyb2wuYmluZChlbCkoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSh3aW5kb3csIGRvY3VtZW50LCBqUXVlcnkpKTtcclxuIiwidmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xyXG5cclxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcclxuXHJcblxyXG4gIGlmICgkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tdGl0bGUnKS5oYXNDbGFzcygnYWNjb3JkaW9uLXRpdGxlLWRpc2FibGVkJykpcmV0dXJuO1xyXG5cclxuICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAvKmlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKXtcclxuICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgfSovXHJcbiAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlVXAoMzAwKTtcclxuICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxyXG4gIH0gZWxzZSB7XHJcbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJykpIHtcclxuICAgICAgJG90aGVyID0gJCgnLmFjY29yZGlvbi1vbmx5X29uZScpO1xyXG4gICAgICAkb3RoZXIuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcclxuICAgICAgICAuc2xpZGVVcCgzMDApXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcclxuICAgICAgJG90aGVyLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnbGFzdC1vcGVuJyk7XHJcblxyXG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmFkZENsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcclxuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnbGFzdC1vcGVuJyk7XHJcbiAgICB9XHJcbiAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlRG93bigzMDApO1xyXG4gICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn0pO1xyXG5hY2NvcmRpb25Db250cm9sLnNob3coKTtcclxuXHJcblxyXG4kKCcuYWNjb3JkaW9uLXdyYXAub3Blbl9maXJzdCAuYWNjb3JkaW9uOmZpcnN0LWNoaWxkJykuYWRkQ2xhc3MoJ29wZW4nKTtcclxuJCgnLmFjY29yZGlvbi13cmFwIC5hY2NvcmRpb24uYWNjb3JkaW9uLXNsaW06Zmlyc3QtY2hpbGQnKS5hZGRDbGFzcygnb3BlbicpO1xyXG4kKCcuYWNjb3JkaW9uLXNsaW0nKS5hZGRDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJyk7XHJcblxyXG4vL9C00LvRjyDRgdC40LzQvtCyINC+0YLQutGA0YvQstCw0LXQvCDQtdGB0LvQuCDQtdGB0YLRjCDQv9C+0LzQtdGC0LrQsCBvcGVuINGC0L4g0L/RgNC40YHQstCw0LjQstCw0LXQvCDQstGB0LUg0L7RgdGC0LDQu9GM0L3Ri9C1INC60LvQsNGB0YtcclxuYWNjb3JkaW9uU2xpbSA9ICQoJy5hY2NvcmRpb24uYWNjb3JkaW9uLW9ubHlfb25lJyk7XHJcbmlmIChhY2NvcmRpb25TbGltLmxlbmd0aCA+IDApIHtcclxuICBhY2NvcmRpb25TbGltLnBhcmVudCgpLmZpbmQoJy5hY2NvcmRpb24ub3BlbicpXHJcbiAgICAuYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpXHJcbiAgICAuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcclxuICAgIC5zaG93KDMwMClcclxuICAgIC5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XHJcbn1cclxuXHJcbiQoJ2JvZHknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLmFjY29yZGlvbl9mdWxsc2NyZWFuX2Nsb3NlLm9wZW4gLmFjY29yZGlvbi1jb250cm9sOmZpcnN0LWNoaWxkJykuY2xpY2soKVxyXG59KTtcclxuXHJcbiQoJy5hY2NvcmRpb24tY29udGVudCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgIT0gJ0EnKSB7XHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb24nKS5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wuYWNjb3JkaW9uLXRpdGxlJykuY2xpY2soKTtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn0pO1xyXG5cclxuJCgnLmFjY29yZGlvbi1jb250ZW50IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2FuZ2xlLXVwJykpcmV0dXJuO1xyXG4gIGUuc3RvcFByb3BhZ2F0aW9uKClcclxufSk7XHJcblxyXG4oZnVuY3Rpb24oKXtcclxuICB2YXIgZWxzID0gJCgnLmFjY29yZGlvbl9tb3JlJyk7XHJcblxyXG4gIGZ1bmN0aW9uIGFkZEJ1dHRvbihlbCwgY2xhc3NOYW1lLCB0aXRsZSkge1xyXG4gICAgICB2YXIgYnV0dG9ucyA9ICQoZWwpLmZpbmQoJy4nK2NsYXNzTmFtZSk7XHJcbiAgICAgIGlmIChidXR0b25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgdmFyIGJ1dHRvbiA9ICQoJzxkaXY+JykuYWRkQ2xhc3MoY2xhc3NOYW1lKS5hZGRDbGFzcygnYWNjb3JkaW9uX21vcmVfYnV0dG9uJyk7XHJcbiAgICAgICAgICB2YXIgYSA9ICQoJzxhPicpLmF0dHIoJ2hyZWYnLCBcIlwiKS5hZGRDbGFzcygnYmx1ZScpLmh0bWwodGl0bGUpO1xyXG4gICAgICAgICAgJChidXR0b24pLmFwcGVuZChhKTtcclxuICAgICAgICAgICQoZWwpLmFwcGVuZChidXR0b24pO1xyXG4gICAgICB9XHJcbiAgfVxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFjY29yZGlvbl9tb3JlX2J1dHRvbl9tb3JlJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuYWNjb3JkaW9uX21vcmUnKS5hZGRDbGFzcygnb3BlbicpO1xyXG4gIH0pO1xyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFjY29yZGlvbl9tb3JlX2J1dHRvbl9sZXNzJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuYWNjb3JkaW9uX21vcmUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gIH0pO1xyXG5cclxuXHJcblxyXG4gIGZ1bmN0aW9uIHJlYnVpbGQoKXtcclxuICAgICQoZWxzKS5lYWNoKGZ1bmN0aW9uKGtleSwgaXRlbSl7XHJcbiAgICAgICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgdmFyIGNvbnRlbnQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5hY2NvcmRpb25fbW9yZV9jb250ZW50Jyk7XHJcbiAgICAgIGlmIChjb250ZW50LnNjcm9sbEhlaWdodCA+IGNvbnRlbnQuY2xpZW50SGVpZ2h0KSB7XHJcbiAgICAgICAgYWRkQnV0dG9uKGl0ZW0sICdhY2NvcmRpb25fbW9yZV9idXR0b25fbW9yZScsICfQn9C+0LTRgNC+0LHQvdC10LUnKTtcclxuICAgICAgICBhZGRCdXR0b24oaXRlbSwgJ2FjY29yZGlvbl9tb3JlX2J1dHRvbl9sZXNzJywgJ9Ch0LrRgNGL0YLRjCcpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQoaXRlbSkuZmluZCgnLmFjY29yZGlvbl9tb3JlX2J1dHRvbicpLnJlbW92ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfVxyXG5cclxuICAkKHdpbmRvdykucmVzaXplKHJlYnVpbGQpO1xyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdsYW5ndWFnZV9sb2FkZWQnLCBmdW5jdGlvbigpe1xyXG4gICAgcmVidWlsZCgpO1xyXG4gIH0sIGZhbHNlKTtcclxuXHJcbn0pKCk7XHJcblxyXG4vL9GE0LjQu9GM0YLRgCDQv9GA0L7QuNC30LLQvtC00LjRgtC10LvQtdC5IC0g0YTQuNC70YzRgtGA0LDRhtC40Y8g0Y3Qu9C10LzQtdC90YLQvtCyXHJcbiQoJyNjYXRhbG9nX3Byb2R1Y3RfZmlsdGVyLWlucHV0Jykua2V5dXAoZnVuY3Rpb24oKXtcclxuXHJcbiAgdmFyIHZhbCA9ICQodGhpcykudmFsKCkubGVuZ3RoID4gMiA/ICQodGhpcykudmFsKCkudG9VcHBlckNhc2UoKSA6IGZhbHNlO1xyXG4gIHZhciBvcGVuQ291bnQgPSAwO1xyXG4gIHZhciBsaXN0ID0gJCh0aGlzKS5jbG9zZXN0KCcuY2F0YWxvZ19wcm9kdWN0X2ZpbHRlci1pdGVtcy1pdGVtLWNoZWNrYm94Jyk7XHJcbiAgaWYgKCF2YWwpIHtcclxuICAgICAgJChsaXN0KS5yZW1vdmVDbGFzcygnYWNjb3JkaW9uX2hpZGUnKTtcclxuICB9XHJcbiAgJCgnLmNhdGFsb2dfcHJvZHVjdF9maWx0ZXItY2hlY2tib3hfaXRlbScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcclxuICAgICAgdmFyIG5hbWUgPSAkKGl0ZW0pLmZpbmQoJ2xhYmVsJykudGV4dCgpO1xyXG4gICAgICBpZiAoIXZhbCkge1xyXG4gICAgICAgICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygwLCB2YWwubGVuZ3RoKS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYgKG5hbWUgPT0gdmFsKSB7XHJcbiAgICAgICAgICAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnaGlkZScpO1xyXG4gICAgICAgICAgICAgIG9wZW5Db3VudCsrO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAkKGl0ZW0pLmFkZENsYXNzKCdoaWRlJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH1cclxuICB9KTtcclxuICBpZiAodmFsICYmIG9wZW5Db3VudCA8PSAxMCkge1xyXG4gICAgICAkKGxpc3QpLmFkZENsYXNzKCdhY2NvcmRpb25faGlkZScpO1xyXG4gIH1cclxuXHJcbn0pO1xyXG5cclxuXHJcbiIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xyXG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xyXG4gIHZhciBkZWZhdWx0cyA9IHtcclxuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcidcclxuICB9O1xyXG4gIHZhciBsYXN0X3Bvc3QgPSBmYWxzZTtcclxuXHJcbiAgZnVuY3Rpb24gb25Qb3N0KHBvc3QpIHtcclxuICAgIGxhc3RfcG9zdCA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgLy9jb25zb2xlLmxvZyhwb3N0LCB0aGlzKTtcclxuICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xyXG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XHJcbiAgICB2YXIgd3JhcF9odG1sID0gZGF0YS53cmFwX2h0bWw7XHJcblxyXG4gICAgaWYgKHBvc3QucmVuZGVyKSB7XHJcbiAgICAgIHBvc3Qubm90eWZ5X2NsYXNzID0gXCJub3RpZnlfd2hpdGVcIjtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHBvc3QpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICBmb3JtLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgIGlmIChwb3N0Lmh0bWwpIHtcclxuICAgICAgICB3cmFwLmh0bWwocG9zdC5odG1sKTtcclxuICAgICAgICBhamF4Rm9ybSh3cmFwKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoIXBvc3QuZXJyb3IpIHtcclxuICAgICAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgICAgIHdyYXAuaHRtbCh3cmFwX2h0bWwpO1xyXG4gICAgICAgICAgZm9ybS5maW5kKCdpbnB1dFt0eXBlPXRleHRdLHRleHRhcmVhJykudmFsKCcnKTtcclxuICAgICAgICAgIGFqYXhGb3JtKHdyYXApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgcG9zdC5lcnJvciA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICBmb3IgKHZhciBpbmRleCBpbiBwb3N0LmVycm9yKSB7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgICAndHlwZSc6ICdlcnInLFxyXG4gICAgICAgICAgJ3RpdGxlJzogcG9zdC50aXRsZSA/IHBvc3QudGl0bGUgOiBsZygnZXJyb3InKSxcclxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpbmRleF1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zdC5lcnJvci5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcclxuICAgICAgICAgICd0aXRsZSc6IHBvc3QudGl0bGUgPyBwb3N0LnRpdGxlIDogbGcoJ2Vycm9yJyksXHJcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QuZXJyb3JbaV1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHBvc3QuZXJyb3IgfHwgcG9zdC5tZXNzYWdlKSB7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgICAndHlwZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ3N1Y2Nlc3MnIDogJ2VycicsXHJcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IChwb3N0LmVycm9yID09PSBmYWxzZSA/IGxnKCdzdWNjZXNzJykgOiBsZygnZXJyb3InKSksXHJcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3JcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy9cclxuICAgIC8vIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgLy8gICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcclxuICAgIC8vICAgICAndGl0bGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICfQo9GB0L/QtdGI0L3QvicgOiAn0J7RiNC40LHQutCwJyxcclxuICAgIC8vICAgICAnbWVzc2FnZSc6IEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikgPyBwb3N0LmVycm9yWzBdIDogKHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3IpXHJcbiAgICAvLyB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uRmFpbCgpIHtcclxuICAgIGxhc3RfcG9zdCA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcclxuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIHdyYXAuaHRtbChcclxuICAgICAgICAnPGgzPicrbGcoJ3NvcnJ5X25vdF9leHBlY3RlZF9lcnJvcicpKyc8aDM+JyArXHJcbiAgICAgICAgbGcoJ2l0X2hhcHBlbnNfc29tZXRpbWVzJylcclxuICAgICk7XHJcbiAgICBhamF4Rm9ybSh3cmFwKTtcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvblN1Ym1pdChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAvL2Uuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAvL2Uuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgdmFyIGN1cnJlbnRUaW1lTWlsbGlzID0gK25ldyBEYXRlKCk7XHJcbiAgICBpZiAoY3VycmVudFRpbWVNaWxsaXMgLSBsYXN0X3Bvc3QgPCAxMDAwICogMikge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgbGFzdF9wb3N0ID0gY3VycmVudFRpbWVNaWxsaXM7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xyXG4gICAgZGF0YS53cmFwX2h0bWw9d3JhcC5odG1sKCk7XHJcbiAgICB2YXIgaXNWYWxpZCA9IHRydWU7XHJcblxyXG4gICAgLy9pbml0KHdyYXApO1xyXG5cclxuICAgIHZhciByZXF1aXJlZCA9IGZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQsIHRleHRhcmVhLnJlcXVpcmVkLCBpbnB1dFtpZD1cInN1cHBvcnQtcmVjYXB0Y2hhXCJdJyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlcXVpcmVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBoZWxwQmxvY2sgPSByZXF1aXJlZC5lcShpKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmZpbmQoJy5oZWxwLWJsb2NrJyk7XHJcbiAgICAgIHZhciBoZWxwTWVzc2FnZSA9IGhlbHBCbG9jayAmJiBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpID8gaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA6IGxnKCdyZXF1aXJlZCcpO1xyXG5cclxuICAgICAgaWYgKHJlcXVpcmVkLmVxKGkpLnZhbCgpLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAkKGhlbHBCbG9jaykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgaGVscEJsb2NrLmh0bWwoaGVscE1lc3NhZ2UpO1xyXG4gICAgICAgIGhlbHBCbG9jay5hZGRDbGFzcygnaGVscC1ibG9jay1lcnJvcicpO1xyXG4gICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBoZWxwQmxvY2suaHRtbCgnJyk7XHJcbiAgICAgICAgJChoZWxwQmxvY2spLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgIGhlbHBCbG9jay5yZW1vdmVDbGFzcygnaGVscC1ibG9jay1lcnJvcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIWlzVmFsaWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmb3JtLnlpaUFjdGl2ZUZvcm0pIHtcclxuICAgICAgZm9ybS5vZmYoJ2FmdGVyVmFsaWRhdGUnKTtcclxuICAgICAgZm9ybS5vbignYWZ0ZXJWYWxpZGF0ZScsIHlpaVZhbGlkYXRpb24uYmluZChkYXRhKSk7XHJcblxyXG4gICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJywgdHJ1ZSk7XHJcbiAgICAgIHZhciBkID0gZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJyk7XHJcbiAgICAgIGlmIChkKSB7XHJcbiAgICAgICAgZC52YWxpZGF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScsIGQpO1xyXG4gICAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcclxuICAgICAgICBpc1ZhbGlkID0gZC52YWxpZGF0ZWQ7XHJcbiAgICAgIH1cclxuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgaXNWYWxpZCA9IGlzVmFsaWQgJiYgKGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGggPT0gMCk7XHJcblxyXG4gICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICBzZW5kRm9ybShkYXRhKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHlpaVZhbGlkYXRpb24oZSkge1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcblxyXG4gICAgaWYoZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aCA9PSAwKXtcclxuICAgICAgc2VuZEZvcm0odGhpcyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNlbmRGb3JtKGRhdGEpe1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcblxyXG4gICAgaWYgKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcclxuXHJcbiAgICB2YXIgcG9zdERhdGEgPSBmb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xyXG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xyXG4gICAgZm9ybS5odG1sKCcnKTtcclxuICAgIGRhdGEud3JhcC5odG1sKCc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHA+JytsZygnc2VuZGluZ19kYXRhJykrJzwvcD48L2Rpdj4nKTtcclxuXHJcbiAgICBkYXRhLnVybCArPSAoZGF0YS51cmwuaW5kZXhPZignPycpID4gMCA/ICcmJyA6ICc/JykgKyAncmM9JyArIE1hdGgucmFuZG9tKCk7XHJcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEudXJsKTtcclxuXHJcbiAgICAvKmlmKCFwb3N0RGF0YS5yZXR1cm5Vcmwpe1xyXG4gICAgICBwb3N0RGF0YS5yZXR1cm5Vcmw9bG9jYXRpb24uaHJlZjtcclxuICAgIH0qL1xyXG5cclxuICAgIGlmKHR5cGVvZiBsYW5nICE9IFwidW5kZWZpbmVkXCIgJiYgZGF0YS51cmwuaW5kZXhPZihsYW5nW1wiaHJlZl9wcmVmaXhcIl0pPT0tMSl7XHJcbiAgICAgIGRhdGEudXJsPVwiL1wiK2xhbmdbXCJocmVmX3ByZWZpeFwiXStkYXRhLnVybDtcclxuICAgICAgZGF0YS51cmw9ZGF0YS51cmwucmVwbGFjZSgnLy8nLCcvJykucmVwbGFjZSgnLy8nLCcvJyk7XHJcbiAgICB9XHJcblxyXG4gICAgJC5wb3N0KFxyXG4gICAgICBkYXRhLnVybCxcclxuICAgICAgcG9zdERhdGEsXHJcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxyXG4gICAgICAnanNvbidcclxuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0KHdyYXApIHtcclxuICAgIGZvcm0gPSB3cmFwLmZpbmQoJ2Zvcm0nKTtcclxuICAgIGRhdGEgPSB7XHJcbiAgICAgIGZvcm06IGZvcm0sXHJcbiAgICAgIHBhcmFtOiBkZWZhdWx0cyxcclxuICAgICAgd3JhcDogd3JhcFxyXG4gICAgfTtcclxuICAgIGRhdGEudXJsID0gZm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xyXG4gICAgZGF0YS5tZXRob2QgPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcclxuICAgIGZvcm0udW5iaW5kKCdzdWJtaXQnKTtcclxuICAgIC8vZm9ybS5vZmYoJ3N1Ym1pdCcpO1xyXG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XHJcbiAgfVxyXG5cclxuICBlbHMuZmluZCgnW3JlcXVpcmVkXScpXHJcbiAgICAuYWRkQ2xhc3MoJ3JlcXVpcmVkJylcclxuICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpO1xyXG5cclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgIGluaXQoZWxzLmVxKGkpKTtcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2YgcGxhY2Vob2xkZXIgPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBwbGFjZWhvbGRlcigpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFNSTygpIHtcclxuICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvID0ge307XHJcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcclxuICAgICQuZWFjaChhLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcclxuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XHJcbiAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbztcclxuICB9O1xyXG59O1xyXG5hZGRTUk8oKTsiLCIvKiEgalF1ZXJ5IFVJIC0gdjEuMTIuMSAtIDIwMTgtMTItMjBcbiogaHR0cDovL2pxdWVyeXVpLmNvbVxuKiBJbmNsdWRlczogd2lkZ2V0LmpzLCBwb3NpdGlvbi5qcywgZm9ybS1yZXNldC1taXhpbi5qcywga2V5Y29kZS5qcywgbGFiZWxzLmpzLCB1bmlxdWUtaWQuanMsIHdpZGdldHMvYXV0b2NvbXBsZXRlLmpzLCB3aWRnZXRzL2RhdGVwaWNrZXIuanMsIHdpZGdldHMvbWVudS5qcywgd2lkZ2V0cy9tb3VzZS5qcywgd2lkZ2V0cy9zZWxlY3RtZW51LmpzLCB3aWRnZXRzL3NsaWRlci5qc1xuKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9yczsgTGljZW5zZWQgTUlUICovXG5cbihmdW5jdGlvbih0KXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImpxdWVyeVwiXSx0KTp0KGpRdWVyeSl9KShmdW5jdGlvbih0KXtmdW5jdGlvbiBlKHQpe2Zvcih2YXIgZSxpO3QubGVuZ3RoJiZ0WzBdIT09ZG9jdW1lbnQ7KXtpZihlPXQuY3NzKFwicG9zaXRpb25cIiksKFwiYWJzb2x1dGVcIj09PWV8fFwicmVsYXRpdmVcIj09PWV8fFwiZml4ZWRcIj09PWUpJiYoaT1wYXJzZUludCh0LmNzcyhcInpJbmRleFwiKSwxMCksIWlzTmFOKGkpJiYwIT09aSkpcmV0dXJuIGk7dD10LnBhcmVudCgpfXJldHVybiAwfWZ1bmN0aW9uIGkoKXt0aGlzLl9jdXJJbnN0PW51bGwsdGhpcy5fa2V5RXZlbnQ9ITEsdGhpcy5fZGlzYWJsZWRJbnB1dHM9W10sdGhpcy5fZGF0ZXBpY2tlclNob3dpbmc9ITEsdGhpcy5faW5EaWFsb2c9ITEsdGhpcy5fbWFpbkRpdklkPVwidWktZGF0ZXBpY2tlci1kaXZcIix0aGlzLl9pbmxpbmVDbGFzcz1cInVpLWRhdGVwaWNrZXItaW5saW5lXCIsdGhpcy5fYXBwZW5kQ2xhc3M9XCJ1aS1kYXRlcGlja2VyLWFwcGVuZFwiLHRoaXMuX3RyaWdnZXJDbGFzcz1cInVpLWRhdGVwaWNrZXItdHJpZ2dlclwiLHRoaXMuX2RpYWxvZ0NsYXNzPVwidWktZGF0ZXBpY2tlci1kaWFsb2dcIix0aGlzLl9kaXNhYmxlQ2xhc3M9XCJ1aS1kYXRlcGlja2VyLWRpc2FibGVkXCIsdGhpcy5fdW5zZWxlY3RhYmxlQ2xhc3M9XCJ1aS1kYXRlcGlja2VyLXVuc2VsZWN0YWJsZVwiLHRoaXMuX2N1cnJlbnRDbGFzcz1cInVpLWRhdGVwaWNrZXItY3VycmVudC1kYXlcIix0aGlzLl9kYXlPdmVyQ2xhc3M9XCJ1aS1kYXRlcGlja2VyLWRheXMtY2VsbC1vdmVyXCIsdGhpcy5yZWdpb25hbD1bXSx0aGlzLnJlZ2lvbmFsW1wiXCJdPXtjbG9zZVRleHQ6XCJEb25lXCIscHJldlRleHQ6XCJQcmV2XCIsbmV4dFRleHQ6XCJOZXh0XCIsY3VycmVudFRleHQ6XCJUb2RheVwiLG1vbnRoTmFtZXM6W1wiSmFudWFyeVwiLFwiRmVicnVhcnlcIixcIk1hcmNoXCIsXCJBcHJpbFwiLFwiTWF5XCIsXCJKdW5lXCIsXCJKdWx5XCIsXCJBdWd1c3RcIixcIlNlcHRlbWJlclwiLFwiT2N0b2JlclwiLFwiTm92ZW1iZXJcIixcIkRlY2VtYmVyXCJdLG1vbnRoTmFtZXNTaG9ydDpbXCJKYW5cIixcIkZlYlwiLFwiTWFyXCIsXCJBcHJcIixcIk1heVwiLFwiSnVuXCIsXCJKdWxcIixcIkF1Z1wiLFwiU2VwXCIsXCJPY3RcIixcIk5vdlwiLFwiRGVjXCJdLGRheU5hbWVzOltcIlN1bmRheVwiLFwiTW9uZGF5XCIsXCJUdWVzZGF5XCIsXCJXZWRuZXNkYXlcIixcIlRodXJzZGF5XCIsXCJGcmlkYXlcIixcIlNhdHVyZGF5XCJdLGRheU5hbWVzU2hvcnQ6W1wiU3VuXCIsXCJNb25cIixcIlR1ZVwiLFwiV2VkXCIsXCJUaHVcIixcIkZyaVwiLFwiU2F0XCJdLGRheU5hbWVzTWluOltcIlN1XCIsXCJNb1wiLFwiVHVcIixcIldlXCIsXCJUaFwiLFwiRnJcIixcIlNhXCJdLHdlZWtIZWFkZXI6XCJXa1wiLGRhdGVGb3JtYXQ6XCJtbS9kZC95eVwiLGZpcnN0RGF5OjAsaXNSVEw6ITEsc2hvd01vbnRoQWZ0ZXJZZWFyOiExLHllYXJTdWZmaXg6XCJcIn0sdGhpcy5fZGVmYXVsdHM9e3Nob3dPbjpcImZvY3VzXCIsc2hvd0FuaW06XCJmYWRlSW5cIixzaG93T3B0aW9uczp7fSxkZWZhdWx0RGF0ZTpudWxsLGFwcGVuZFRleHQ6XCJcIixidXR0b25UZXh0OlwiLi4uXCIsYnV0dG9uSW1hZ2U6XCJcIixidXR0b25JbWFnZU9ubHk6ITEsaGlkZUlmTm9QcmV2TmV4dDohMSxuYXZpZ2F0aW9uQXNEYXRlRm9ybWF0OiExLGdvdG9DdXJyZW50OiExLGNoYW5nZU1vbnRoOiExLGNoYW5nZVllYXI6ITEseWVhclJhbmdlOlwiYy0xMDpjKzEwXCIsc2hvd090aGVyTW9udGhzOiExLHNlbGVjdE90aGVyTW9udGhzOiExLHNob3dXZWVrOiExLGNhbGN1bGF0ZVdlZWs6dGhpcy5pc284NjAxV2VlayxzaG9ydFllYXJDdXRvZmY6XCIrMTBcIixtaW5EYXRlOm51bGwsbWF4RGF0ZTpudWxsLGR1cmF0aW9uOlwiZmFzdFwiLGJlZm9yZVNob3dEYXk6bnVsbCxiZWZvcmVTaG93Om51bGwsb25TZWxlY3Q6bnVsbCxvbkNoYW5nZU1vbnRoWWVhcjpudWxsLG9uQ2xvc2U6bnVsbCxudW1iZXJPZk1vbnRoczoxLHNob3dDdXJyZW50QXRQb3M6MCxzdGVwTW9udGhzOjEsc3RlcEJpZ01vbnRoczoxMixhbHRGaWVsZDpcIlwiLGFsdEZvcm1hdDpcIlwiLGNvbnN0cmFpbklucHV0OiEwLHNob3dCdXR0b25QYW5lbDohMSxhdXRvU2l6ZTohMSxkaXNhYmxlZDohMX0sdC5leHRlbmQodGhpcy5fZGVmYXVsdHMsdGhpcy5yZWdpb25hbFtcIlwiXSksdGhpcy5yZWdpb25hbC5lbj10LmV4dGVuZCghMCx7fSx0aGlzLnJlZ2lvbmFsW1wiXCJdKSx0aGlzLnJlZ2lvbmFsW1wiZW4tVVNcIl09dC5leHRlbmQoITAse30sdGhpcy5yZWdpb25hbC5lbiksdGhpcy5kcERpdj1zKHQoXCI8ZGl2IGlkPSdcIit0aGlzLl9tYWluRGl2SWQrXCInIGNsYXNzPSd1aS1kYXRlcGlja2VyIHVpLXdpZGdldCB1aS13aWRnZXQtY29udGVudCB1aS1oZWxwZXItY2xlYXJmaXggdWktY29ybmVyLWFsbCc+PC9kaXY+XCIpKX1mdW5jdGlvbiBzKGUpe3ZhciBpPVwiYnV0dG9uLCAudWktZGF0ZXBpY2tlci1wcmV2LCAudWktZGF0ZXBpY2tlci1uZXh0LCAudWktZGF0ZXBpY2tlci1jYWxlbmRhciB0ZCBhXCI7cmV0dXJuIGUub24oXCJtb3VzZW91dFwiLGksZnVuY3Rpb24oKXt0KHRoaXMpLnJlbW92ZUNsYXNzKFwidWktc3RhdGUtaG92ZXJcIiksLTEhPT10aGlzLmNsYXNzTmFtZS5pbmRleE9mKFwidWktZGF0ZXBpY2tlci1wcmV2XCIpJiZ0KHRoaXMpLnJlbW92ZUNsYXNzKFwidWktZGF0ZXBpY2tlci1wcmV2LWhvdmVyXCIpLC0xIT09dGhpcy5jbGFzc05hbWUuaW5kZXhPZihcInVpLWRhdGVwaWNrZXItbmV4dFwiKSYmdCh0aGlzKS5yZW1vdmVDbGFzcyhcInVpLWRhdGVwaWNrZXItbmV4dC1ob3ZlclwiKX0pLm9uKFwibW91c2VvdmVyXCIsaSxuKX1mdW5jdGlvbiBuKCl7dC5kYXRlcGlja2VyLl9pc0Rpc2FibGVkRGF0ZXBpY2tlcihsLmlubGluZT9sLmRwRGl2LnBhcmVudCgpWzBdOmwuaW5wdXRbMF0pfHwodCh0aGlzKS5wYXJlbnRzKFwiLnVpLWRhdGVwaWNrZXItY2FsZW5kYXJcIikuZmluZChcImFcIikucmVtb3ZlQ2xhc3MoXCJ1aS1zdGF0ZS1ob3ZlclwiKSx0KHRoaXMpLmFkZENsYXNzKFwidWktc3RhdGUtaG92ZXJcIiksLTEhPT10aGlzLmNsYXNzTmFtZS5pbmRleE9mKFwidWktZGF0ZXBpY2tlci1wcmV2XCIpJiZ0KHRoaXMpLmFkZENsYXNzKFwidWktZGF0ZXBpY2tlci1wcmV2LWhvdmVyXCIpLC0xIT09dGhpcy5jbGFzc05hbWUuaW5kZXhPZihcInVpLWRhdGVwaWNrZXItbmV4dFwiKSYmdCh0aGlzKS5hZGRDbGFzcyhcInVpLWRhdGVwaWNrZXItbmV4dC1ob3ZlclwiKSl9ZnVuY3Rpb24gbyhlLGkpe3QuZXh0ZW5kKGUsaSk7Zm9yKHZhciBzIGluIGkpbnVsbD09aVtzXSYmKGVbc109aVtzXSk7cmV0dXJuIGV9dC51aT10LnVpfHx7fSx0LnVpLnZlcnNpb249XCIxLjEyLjFcIjt2YXIgYT0wLHI9QXJyYXkucHJvdG90eXBlLnNsaWNlO3QuY2xlYW5EYXRhPWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbihpKXt2YXIgcyxuLG87Zm9yKG89MDtudWxsIT0obj1pW29dKTtvKyspdHJ5e3M9dC5fZGF0YShuLFwiZXZlbnRzXCIpLHMmJnMucmVtb3ZlJiZ0KG4pLnRyaWdnZXJIYW5kbGVyKFwicmVtb3ZlXCIpfWNhdGNoKGEpe31lKGkpfX0odC5jbGVhbkRhdGEpLHQud2lkZ2V0PWZ1bmN0aW9uKGUsaSxzKXt2YXIgbixvLGEscj17fSxsPWUuc3BsaXQoXCIuXCIpWzBdO2U9ZS5zcGxpdChcIi5cIilbMV07dmFyIGg9bCtcIi1cIitlO3JldHVybiBzfHwocz1pLGk9dC5XaWRnZXQpLHQuaXNBcnJheShzKSYmKHM9dC5leHRlbmQuYXBwbHkobnVsbCxbe31dLmNvbmNhdChzKSkpLHQuZXhwcltcIjpcIl1baC50b0xvd2VyQ2FzZSgpXT1mdW5jdGlvbihlKXtyZXR1cm4hIXQuZGF0YShlLGgpfSx0W2xdPXRbbF18fHt9LG49dFtsXVtlXSxvPXRbbF1bZV09ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5fY3JlYXRlV2lkZ2V0Pyhhcmd1bWVudHMubGVuZ3RoJiZ0aGlzLl9jcmVhdGVXaWRnZXQodCxlKSx2b2lkIDApOm5ldyBvKHQsZSl9LHQuZXh0ZW5kKG8sbix7dmVyc2lvbjpzLnZlcnNpb24sX3Byb3RvOnQuZXh0ZW5kKHt9LHMpLF9jaGlsZENvbnN0cnVjdG9yczpbXX0pLGE9bmV3IGksYS5vcHRpb25zPXQud2lkZ2V0LmV4dGVuZCh7fSxhLm9wdGlvbnMpLHQuZWFjaChzLGZ1bmN0aW9uKGUscyl7cmV0dXJuIHQuaXNGdW5jdGlvbihzKT8ocltlXT1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXtyZXR1cm4gaS5wcm90b3R5cGVbZV0uYXBwbHkodGhpcyxhcmd1bWVudHMpfWZ1bmN0aW9uIG4odCl7cmV0dXJuIGkucHJvdG90eXBlW2VdLmFwcGx5KHRoaXMsdCl9cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGUsaT10aGlzLl9zdXBlcixvPXRoaXMuX3N1cGVyQXBwbHk7cmV0dXJuIHRoaXMuX3N1cGVyPXQsdGhpcy5fc3VwZXJBcHBseT1uLGU9cy5hcHBseSh0aGlzLGFyZ3VtZW50cyksdGhpcy5fc3VwZXI9aSx0aGlzLl9zdXBlckFwcGx5PW8sZX19KCksdm9pZCAwKToocltlXT1zLHZvaWQgMCl9KSxvLnByb3RvdHlwZT10LndpZGdldC5leHRlbmQoYSx7d2lkZ2V0RXZlbnRQcmVmaXg6bj9hLndpZGdldEV2ZW50UHJlZml4fHxlOmV9LHIse2NvbnN0cnVjdG9yOm8sbmFtZXNwYWNlOmwsd2lkZ2V0TmFtZTplLHdpZGdldEZ1bGxOYW1lOmh9KSxuPyh0LmVhY2gobi5fY2hpbGRDb25zdHJ1Y3RvcnMsZnVuY3Rpb24oZSxpKXt2YXIgcz1pLnByb3RvdHlwZTt0LndpZGdldChzLm5hbWVzcGFjZStcIi5cIitzLndpZGdldE5hbWUsbyxpLl9wcm90byl9KSxkZWxldGUgbi5fY2hpbGRDb25zdHJ1Y3RvcnMpOmkuX2NoaWxkQ29uc3RydWN0b3JzLnB1c2gobyksdC53aWRnZXQuYnJpZGdlKGUsbyksb30sdC53aWRnZXQuZXh0ZW5kPWZ1bmN0aW9uKGUpe2Zvcih2YXIgaSxzLG49ci5jYWxsKGFyZ3VtZW50cywxKSxvPTAsYT1uLmxlbmd0aDthPm87bysrKWZvcihpIGluIG5bb10pcz1uW29dW2ldLG5bb10uaGFzT3duUHJvcGVydHkoaSkmJnZvaWQgMCE9PXMmJihlW2ldPXQuaXNQbGFpbk9iamVjdChzKT90LmlzUGxhaW5PYmplY3QoZVtpXSk/dC53aWRnZXQuZXh0ZW5kKHt9LGVbaV0scyk6dC53aWRnZXQuZXh0ZW5kKHt9LHMpOnMpO3JldHVybiBlfSx0LndpZGdldC5icmlkZ2U9ZnVuY3Rpb24oZSxpKXt2YXIgcz1pLnByb3RvdHlwZS53aWRnZXRGdWxsTmFtZXx8ZTt0LmZuW2VdPWZ1bmN0aW9uKG4pe3ZhciBvPVwic3RyaW5nXCI9PXR5cGVvZiBuLGE9ci5jYWxsKGFyZ3VtZW50cywxKSxsPXRoaXM7cmV0dXJuIG8/dGhpcy5sZW5ndGh8fFwiaW5zdGFuY2VcIiE9PW4/dGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGksbz10LmRhdGEodGhpcyxzKTtyZXR1cm5cImluc3RhbmNlXCI9PT1uPyhsPW8sITEpOm8/dC5pc0Z1bmN0aW9uKG9bbl0pJiZcIl9cIiE9PW4uY2hhckF0KDApPyhpPW9bbl0uYXBwbHkobyxhKSxpIT09byYmdm9pZCAwIT09aT8obD1pJiZpLmpxdWVyeT9sLnB1c2hTdGFjayhpLmdldCgpKTppLCExKTp2b2lkIDApOnQuZXJyb3IoXCJubyBzdWNoIG1ldGhvZCAnXCIrbitcIicgZm9yIFwiK2UrXCIgd2lkZ2V0IGluc3RhbmNlXCIpOnQuZXJyb3IoXCJjYW5ub3QgY2FsbCBtZXRob2RzIG9uIFwiK2UrXCIgcHJpb3IgdG8gaW5pdGlhbGl6YXRpb247IFwiK1wiYXR0ZW1wdGVkIHRvIGNhbGwgbWV0aG9kICdcIituK1wiJ1wiKX0pOmw9dm9pZCAwOihhLmxlbmd0aCYmKG49dC53aWRnZXQuZXh0ZW5kLmFwcGx5KG51bGwsW25dLmNvbmNhdChhKSkpLHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBlPXQuZGF0YSh0aGlzLHMpO2U/KGUub3B0aW9uKG58fHt9KSxlLl9pbml0JiZlLl9pbml0KCkpOnQuZGF0YSh0aGlzLHMsbmV3IGkobix0aGlzKSl9KSksbH19LHQuV2lkZ2V0PWZ1bmN0aW9uKCl7fSx0LldpZGdldC5fY2hpbGRDb25zdHJ1Y3RvcnM9W10sdC5XaWRnZXQucHJvdG90eXBlPXt3aWRnZXROYW1lOlwid2lkZ2V0XCIsd2lkZ2V0RXZlbnRQcmVmaXg6XCJcIixkZWZhdWx0RWxlbWVudDpcIjxkaXY+XCIsb3B0aW9uczp7Y2xhc3Nlczp7fSxkaXNhYmxlZDohMSxjcmVhdGU6bnVsbH0sX2NyZWF0ZVdpZGdldDpmdW5jdGlvbihlLGkpe2k9dChpfHx0aGlzLmRlZmF1bHRFbGVtZW50fHx0aGlzKVswXSx0aGlzLmVsZW1lbnQ9dChpKSx0aGlzLnV1aWQ9YSsrLHRoaXMuZXZlbnROYW1lc3BhY2U9XCIuXCIrdGhpcy53aWRnZXROYW1lK3RoaXMudXVpZCx0aGlzLmJpbmRpbmdzPXQoKSx0aGlzLmhvdmVyYWJsZT10KCksdGhpcy5mb2N1c2FibGU9dCgpLHRoaXMuY2xhc3Nlc0VsZW1lbnRMb29rdXA9e30saSE9PXRoaXMmJih0LmRhdGEoaSx0aGlzLndpZGdldEZ1bGxOYW1lLHRoaXMpLHRoaXMuX29uKCEwLHRoaXMuZWxlbWVudCx7cmVtb3ZlOmZ1bmN0aW9uKHQpe3QudGFyZ2V0PT09aSYmdGhpcy5kZXN0cm95KCl9fSksdGhpcy5kb2N1bWVudD10KGkuc3R5bGU/aS5vd25lckRvY3VtZW50OmkuZG9jdW1lbnR8fGkpLHRoaXMud2luZG93PXQodGhpcy5kb2N1bWVudFswXS5kZWZhdWx0Vmlld3x8dGhpcy5kb2N1bWVudFswXS5wYXJlbnRXaW5kb3cpKSx0aGlzLm9wdGlvbnM9dC53aWRnZXQuZXh0ZW5kKHt9LHRoaXMub3B0aW9ucyx0aGlzLl9nZXRDcmVhdGVPcHRpb25zKCksZSksdGhpcy5fY3JlYXRlKCksdGhpcy5vcHRpb25zLmRpc2FibGVkJiZ0aGlzLl9zZXRPcHRpb25EaXNhYmxlZCh0aGlzLm9wdGlvbnMuZGlzYWJsZWQpLHRoaXMuX3RyaWdnZXIoXCJjcmVhdGVcIixudWxsLHRoaXMuX2dldENyZWF0ZUV2ZW50RGF0YSgpKSx0aGlzLl9pbml0KCl9LF9nZXRDcmVhdGVPcHRpb25zOmZ1bmN0aW9uKCl7cmV0dXJue319LF9nZXRDcmVhdGVFdmVudERhdGE6dC5ub29wLF9jcmVhdGU6dC5ub29wLF9pbml0OnQubm9vcCxkZXN0cm95OmZ1bmN0aW9uKCl7dmFyIGU9dGhpczt0aGlzLl9kZXN0cm95KCksdC5lYWNoKHRoaXMuY2xhc3Nlc0VsZW1lbnRMb29rdXAsZnVuY3Rpb24odCxpKXtlLl9yZW1vdmVDbGFzcyhpLHQpfSksdGhpcy5lbGVtZW50Lm9mZih0aGlzLmV2ZW50TmFtZXNwYWNlKS5yZW1vdmVEYXRhKHRoaXMud2lkZ2V0RnVsbE5hbWUpLHRoaXMud2lkZ2V0KCkub2ZmKHRoaXMuZXZlbnROYW1lc3BhY2UpLnJlbW92ZUF0dHIoXCJhcmlhLWRpc2FibGVkXCIpLHRoaXMuYmluZGluZ3Mub2ZmKHRoaXMuZXZlbnROYW1lc3BhY2UpfSxfZGVzdHJveTp0Lm5vb3Asd2lkZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZWxlbWVudH0sb3B0aW9uOmZ1bmN0aW9uKGUsaSl7dmFyIHMsbixvLGE9ZTtpZigwPT09YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdC53aWRnZXQuZXh0ZW5kKHt9LHRoaXMub3B0aW9ucyk7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGUpaWYoYT17fSxzPWUuc3BsaXQoXCIuXCIpLGU9cy5zaGlmdCgpLHMubGVuZ3RoKXtmb3Iobj1hW2VdPXQud2lkZ2V0LmV4dGVuZCh7fSx0aGlzLm9wdGlvbnNbZV0pLG89MDtzLmxlbmd0aC0xPm87bysrKW5bc1tvXV09bltzW29dXXx8e30sbj1uW3Nbb11dO2lmKGU9cy5wb3AoKSwxPT09YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdm9pZCAwPT09bltlXT9udWxsOm5bZV07bltlXT1pfWVsc2V7aWYoMT09PWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHZvaWQgMD09PXRoaXMub3B0aW9uc1tlXT9udWxsOnRoaXMub3B0aW9uc1tlXTthW2VdPWl9cmV0dXJuIHRoaXMuX3NldE9wdGlvbnMoYSksdGhpc30sX3NldE9wdGlvbnM6ZnVuY3Rpb24odCl7dmFyIGU7Zm9yKGUgaW4gdCl0aGlzLl9zZXRPcHRpb24oZSx0W2VdKTtyZXR1cm4gdGhpc30sX3NldE9wdGlvbjpmdW5jdGlvbih0LGUpe3JldHVyblwiY2xhc3Nlc1wiPT09dCYmdGhpcy5fc2V0T3B0aW9uQ2xhc3NlcyhlKSx0aGlzLm9wdGlvbnNbdF09ZSxcImRpc2FibGVkXCI9PT10JiZ0aGlzLl9zZXRPcHRpb25EaXNhYmxlZChlKSx0aGlzfSxfc2V0T3B0aW9uQ2xhc3NlczpmdW5jdGlvbihlKXt2YXIgaSxzLG47Zm9yKGkgaW4gZSluPXRoaXMuY2xhc3Nlc0VsZW1lbnRMb29rdXBbaV0sZVtpXSE9PXRoaXMub3B0aW9ucy5jbGFzc2VzW2ldJiZuJiZuLmxlbmd0aCYmKHM9dChuLmdldCgpKSx0aGlzLl9yZW1vdmVDbGFzcyhuLGkpLHMuYWRkQ2xhc3ModGhpcy5fY2xhc3Nlcyh7ZWxlbWVudDpzLGtleXM6aSxjbGFzc2VzOmUsYWRkOiEwfSkpKX0sX3NldE9wdGlvbkRpc2FibGVkOmZ1bmN0aW9uKHQpe3RoaXMuX3RvZ2dsZUNsYXNzKHRoaXMud2lkZ2V0KCksdGhpcy53aWRnZXRGdWxsTmFtZStcIi1kaXNhYmxlZFwiLG51bGwsISF0KSx0JiYodGhpcy5fcmVtb3ZlQ2xhc3ModGhpcy5ob3ZlcmFibGUsbnVsbCxcInVpLXN0YXRlLWhvdmVyXCIpLHRoaXMuX3JlbW92ZUNsYXNzKHRoaXMuZm9jdXNhYmxlLG51bGwsXCJ1aS1zdGF0ZS1mb2N1c1wiKSl9LGVuYWJsZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zZXRPcHRpb25zKHtkaXNhYmxlZDohMX0pfSxkaXNhYmxlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3NldE9wdGlvbnMoe2Rpc2FibGVkOiEwfSl9LF9jbGFzc2VzOmZ1bmN0aW9uKGUpe2Z1bmN0aW9uIGkoaSxvKXt2YXIgYSxyO2ZvcihyPTA7aS5sZW5ndGg+cjtyKyspYT1uLmNsYXNzZXNFbGVtZW50TG9va3VwW2lbcl1dfHx0KCksYT1lLmFkZD90KHQudW5pcXVlKGEuZ2V0KCkuY29uY2F0KGUuZWxlbWVudC5nZXQoKSkpKTp0KGEubm90KGUuZWxlbWVudCkuZ2V0KCkpLG4uY2xhc3Nlc0VsZW1lbnRMb29rdXBbaVtyXV09YSxzLnB1c2goaVtyXSksbyYmZS5jbGFzc2VzW2lbcl1dJiZzLnB1c2goZS5jbGFzc2VzW2lbcl1dKX12YXIgcz1bXSxuPXRoaXM7cmV0dXJuIGU9dC5leHRlbmQoe2VsZW1lbnQ6dGhpcy5lbGVtZW50LGNsYXNzZXM6dGhpcy5vcHRpb25zLmNsYXNzZXN8fHt9fSxlKSx0aGlzLl9vbihlLmVsZW1lbnQse3JlbW92ZTpcIl91bnRyYWNrQ2xhc3Nlc0VsZW1lbnRcIn0pLGUua2V5cyYmaShlLmtleXMubWF0Y2goL1xcUysvZyl8fFtdLCEwKSxlLmV4dHJhJiZpKGUuZXh0cmEubWF0Y2goL1xcUysvZyl8fFtdKSxzLmpvaW4oXCIgXCIpfSxfdW50cmFja0NsYXNzZXNFbGVtZW50OmZ1bmN0aW9uKGUpe3ZhciBpPXRoaXM7dC5lYWNoKGkuY2xhc3Nlc0VsZW1lbnRMb29rdXAsZnVuY3Rpb24ocyxuKXstMSE9PXQuaW5BcnJheShlLnRhcmdldCxuKSYmKGkuY2xhc3Nlc0VsZW1lbnRMb29rdXBbc109dChuLm5vdChlLnRhcmdldCkuZ2V0KCkpKX0pfSxfcmVtb3ZlQ2xhc3M6ZnVuY3Rpb24odCxlLGkpe3JldHVybiB0aGlzLl90b2dnbGVDbGFzcyh0LGUsaSwhMSl9LF9hZGRDbGFzczpmdW5jdGlvbih0LGUsaSl7cmV0dXJuIHRoaXMuX3RvZ2dsZUNsYXNzKHQsZSxpLCEwKX0sX3RvZ2dsZUNsYXNzOmZ1bmN0aW9uKHQsZSxpLHMpe3M9XCJib29sZWFuXCI9PXR5cGVvZiBzP3M6aTt2YXIgbj1cInN0cmluZ1wiPT10eXBlb2YgdHx8bnVsbD09PXQsbz17ZXh0cmE6bj9lOmksa2V5czpuP3Q6ZSxlbGVtZW50Om4/dGhpcy5lbGVtZW50OnQsYWRkOnN9O3JldHVybiBvLmVsZW1lbnQudG9nZ2xlQ2xhc3ModGhpcy5fY2xhc3NlcyhvKSxzKSx0aGlzfSxfb246ZnVuY3Rpb24oZSxpLHMpe3ZhciBuLG89dGhpcztcImJvb2xlYW5cIiE9dHlwZW9mIGUmJihzPWksaT1lLGU9ITEpLHM/KGk9bj10KGkpLHRoaXMuYmluZGluZ3M9dGhpcy5iaW5kaW5ncy5hZGQoaSkpOihzPWksaT10aGlzLmVsZW1lbnQsbj10aGlzLndpZGdldCgpKSx0LmVhY2gocyxmdW5jdGlvbihzLGEpe2Z1bmN0aW9uIHIoKXtyZXR1cm4gZXx8by5vcHRpb25zLmRpc2FibGVkIT09ITAmJiF0KHRoaXMpLmhhc0NsYXNzKFwidWktc3RhdGUtZGlzYWJsZWRcIik/KFwic3RyaW5nXCI9PXR5cGVvZiBhP29bYV06YSkuYXBwbHkobyxhcmd1bWVudHMpOnZvaWQgMH1cInN0cmluZ1wiIT10eXBlb2YgYSYmKHIuZ3VpZD1hLmd1aWQ9YS5ndWlkfHxyLmd1aWR8fHQuZ3VpZCsrKTt2YXIgbD1zLm1hdGNoKC9eKFtcXHc6LV0qKVxccyooLiopJC8pLGg9bFsxXStvLmV2ZW50TmFtZXNwYWNlLGM9bFsyXTtjP24ub24oaCxjLHIpOmkub24oaCxyKX0pfSxfb2ZmOmZ1bmN0aW9uKGUsaSl7aT0oaXx8XCJcIikuc3BsaXQoXCIgXCIpLmpvaW4odGhpcy5ldmVudE5hbWVzcGFjZStcIiBcIikrdGhpcy5ldmVudE5hbWVzcGFjZSxlLm9mZihpKS5vZmYoaSksdGhpcy5iaW5kaW5ncz10KHRoaXMuYmluZGluZ3Mubm90KGUpLmdldCgpKSx0aGlzLmZvY3VzYWJsZT10KHRoaXMuZm9jdXNhYmxlLm5vdChlKS5nZXQoKSksdGhpcy5ob3ZlcmFibGU9dCh0aGlzLmhvdmVyYWJsZS5ub3QoZSkuZ2V0KCkpfSxfZGVsYXk6ZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKCl7cmV0dXJuKFwic3RyaW5nXCI9PXR5cGVvZiB0P3NbdF06dCkuYXBwbHkocyxhcmd1bWVudHMpfXZhciBzPXRoaXM7cmV0dXJuIHNldFRpbWVvdXQoaSxlfHwwKX0sX2hvdmVyYWJsZTpmdW5jdGlvbihlKXt0aGlzLmhvdmVyYWJsZT10aGlzLmhvdmVyYWJsZS5hZGQoZSksdGhpcy5fb24oZSx7bW91c2VlbnRlcjpmdW5jdGlvbihlKXt0aGlzLl9hZGRDbGFzcyh0KGUuY3VycmVudFRhcmdldCksbnVsbCxcInVpLXN0YXRlLWhvdmVyXCIpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKGUpe3RoaXMuX3JlbW92ZUNsYXNzKHQoZS5jdXJyZW50VGFyZ2V0KSxudWxsLFwidWktc3RhdGUtaG92ZXJcIil9fSl9LF9mb2N1c2FibGU6ZnVuY3Rpb24oZSl7dGhpcy5mb2N1c2FibGU9dGhpcy5mb2N1c2FibGUuYWRkKGUpLHRoaXMuX29uKGUse2ZvY3VzaW46ZnVuY3Rpb24oZSl7dGhpcy5fYWRkQ2xhc3ModChlLmN1cnJlbnRUYXJnZXQpLG51bGwsXCJ1aS1zdGF0ZS1mb2N1c1wiKX0sZm9jdXNvdXQ6ZnVuY3Rpb24oZSl7dGhpcy5fcmVtb3ZlQ2xhc3ModChlLmN1cnJlbnRUYXJnZXQpLG51bGwsXCJ1aS1zdGF0ZS1mb2N1c1wiKX19KX0sX3RyaWdnZXI6ZnVuY3Rpb24oZSxpLHMpe3ZhciBuLG8sYT10aGlzLm9wdGlvbnNbZV07aWYocz1zfHx7fSxpPXQuRXZlbnQoaSksaS50eXBlPShlPT09dGhpcy53aWRnZXRFdmVudFByZWZpeD9lOnRoaXMud2lkZ2V0RXZlbnRQcmVmaXgrZSkudG9Mb3dlckNhc2UoKSxpLnRhcmdldD10aGlzLmVsZW1lbnRbMF0sbz1pLm9yaWdpbmFsRXZlbnQpZm9yKG4gaW4gbyluIGluIGl8fChpW25dPW9bbl0pO3JldHVybiB0aGlzLmVsZW1lbnQudHJpZ2dlcihpLHMpLCEodC5pc0Z1bmN0aW9uKGEpJiZhLmFwcGx5KHRoaXMuZWxlbWVudFswXSxbaV0uY29uY2F0KHMpKT09PSExfHxpLmlzRGVmYXVsdFByZXZlbnRlZCgpKX19LHQuZWFjaCh7c2hvdzpcImZhZGVJblwiLGhpZGU6XCJmYWRlT3V0XCJ9LGZ1bmN0aW9uKGUsaSl7dC5XaWRnZXQucHJvdG90eXBlW1wiX1wiK2VdPWZ1bmN0aW9uKHMsbixvKXtcInN0cmluZ1wiPT10eXBlb2YgbiYmKG49e2VmZmVjdDpufSk7dmFyIGEscj1uP249PT0hMHx8XCJudW1iZXJcIj09dHlwZW9mIG4/aTpuLmVmZmVjdHx8aTplO249bnx8e30sXCJudW1iZXJcIj09dHlwZW9mIG4mJihuPXtkdXJhdGlvbjpufSksYT0hdC5pc0VtcHR5T2JqZWN0KG4pLG4uY29tcGxldGU9byxuLmRlbGF5JiZzLmRlbGF5KG4uZGVsYXkpLGEmJnQuZWZmZWN0cyYmdC5lZmZlY3RzLmVmZmVjdFtyXT9zW2VdKG4pOnIhPT1lJiZzW3JdP3Nbcl0obi5kdXJhdGlvbixuLmVhc2luZyxvKTpzLnF1ZXVlKGZ1bmN0aW9uKGkpe3QodGhpcylbZV0oKSxvJiZvLmNhbGwoc1swXSksaSgpfSl9fSksdC53aWRnZXQsZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsZSxpKXtyZXR1cm5bcGFyc2VGbG9hdCh0WzBdKSoodS50ZXN0KHRbMF0pP2UvMTAwOjEpLHBhcnNlRmxvYXQodFsxXSkqKHUudGVzdCh0WzFdKT9pLzEwMDoxKV19ZnVuY3Rpb24gaShlLGkpe3JldHVybiBwYXJzZUludCh0LmNzcyhlLGkpLDEwKXx8MH1mdW5jdGlvbiBzKGUpe3ZhciBpPWVbMF07cmV0dXJuIDk9PT1pLm5vZGVUeXBlP3t3aWR0aDplLndpZHRoKCksaGVpZ2h0OmUuaGVpZ2h0KCksb2Zmc2V0Ont0b3A6MCxsZWZ0OjB9fTp0LmlzV2luZG93KGkpP3t3aWR0aDplLndpZHRoKCksaGVpZ2h0OmUuaGVpZ2h0KCksb2Zmc2V0Ont0b3A6ZS5zY3JvbGxUb3AoKSxsZWZ0OmUuc2Nyb2xsTGVmdCgpfX06aS5wcmV2ZW50RGVmYXVsdD97d2lkdGg6MCxoZWlnaHQ6MCxvZmZzZXQ6e3RvcDppLnBhZ2VZLGxlZnQ6aS5wYWdlWH19Ont3aWR0aDplLm91dGVyV2lkdGgoKSxoZWlnaHQ6ZS5vdXRlckhlaWdodCgpLG9mZnNldDplLm9mZnNldCgpfX12YXIgbixvPU1hdGgubWF4LGE9TWF0aC5hYnMscj0vbGVmdHxjZW50ZXJ8cmlnaHQvLGw9L3RvcHxjZW50ZXJ8Ym90dG9tLyxoPS9bXFwrXFwtXVxcZCsoXFwuW1xcZF0rKT8lPy8sYz0vXlxcdysvLHU9LyUkLyxkPXQuZm4ucG9zaXRpb247dC5wb3NpdGlvbj17c2Nyb2xsYmFyV2lkdGg6ZnVuY3Rpb24oKXtpZih2b2lkIDAhPT1uKXJldHVybiBuO3ZhciBlLGkscz10KFwiPGRpdiBzdHlsZT0nZGlzcGxheTpibG9jaztwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDo1MHB4O2hlaWdodDo1MHB4O292ZXJmbG93OmhpZGRlbjsnPjxkaXYgc3R5bGU9J2hlaWdodDoxMDBweDt3aWR0aDphdXRvOyc+PC9kaXY+PC9kaXY+XCIpLG89cy5jaGlsZHJlbigpWzBdO3JldHVybiB0KFwiYm9keVwiKS5hcHBlbmQocyksZT1vLm9mZnNldFdpZHRoLHMuY3NzKFwib3ZlcmZsb3dcIixcInNjcm9sbFwiKSxpPW8ub2Zmc2V0V2lkdGgsZT09PWkmJihpPXNbMF0uY2xpZW50V2lkdGgpLHMucmVtb3ZlKCksbj1lLWl9LGdldFNjcm9sbEluZm86ZnVuY3Rpb24oZSl7dmFyIGk9ZS5pc1dpbmRvd3x8ZS5pc0RvY3VtZW50P1wiXCI6ZS5lbGVtZW50LmNzcyhcIm92ZXJmbG93LXhcIikscz1lLmlzV2luZG93fHxlLmlzRG9jdW1lbnQ/XCJcIjplLmVsZW1lbnQuY3NzKFwib3ZlcmZsb3cteVwiKSxuPVwic2Nyb2xsXCI9PT1pfHxcImF1dG9cIj09PWkmJmUud2lkdGg8ZS5lbGVtZW50WzBdLnNjcm9sbFdpZHRoLG89XCJzY3JvbGxcIj09PXN8fFwiYXV0b1wiPT09cyYmZS5oZWlnaHQ8ZS5lbGVtZW50WzBdLnNjcm9sbEhlaWdodDtyZXR1cm57d2lkdGg6bz90LnBvc2l0aW9uLnNjcm9sbGJhcldpZHRoKCk6MCxoZWlnaHQ6bj90LnBvc2l0aW9uLnNjcm9sbGJhcldpZHRoKCk6MH19LGdldFdpdGhpbkluZm86ZnVuY3Rpb24oZSl7dmFyIGk9dChlfHx3aW5kb3cpLHM9dC5pc1dpbmRvdyhpWzBdKSxuPSEhaVswXSYmOT09PWlbMF0ubm9kZVR5cGUsbz0hcyYmIW47cmV0dXJue2VsZW1lbnQ6aSxpc1dpbmRvdzpzLGlzRG9jdW1lbnQ6bixvZmZzZXQ6bz90KGUpLm9mZnNldCgpOntsZWZ0OjAsdG9wOjB9LHNjcm9sbExlZnQ6aS5zY3JvbGxMZWZ0KCksc2Nyb2xsVG9wOmkuc2Nyb2xsVG9wKCksd2lkdGg6aS5vdXRlcldpZHRoKCksaGVpZ2h0Omkub3V0ZXJIZWlnaHQoKX19fSx0LmZuLnBvc2l0aW9uPWZ1bmN0aW9uKG4pe2lmKCFufHwhbi5vZilyZXR1cm4gZC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7bj10LmV4dGVuZCh7fSxuKTt2YXIgdSxwLGYsZyxtLF8sdj10KG4ub2YpLGI9dC5wb3NpdGlvbi5nZXRXaXRoaW5JbmZvKG4ud2l0aGluKSx5PXQucG9zaXRpb24uZ2V0U2Nyb2xsSW5mbyhiKSx3PShuLmNvbGxpc2lvbnx8XCJmbGlwXCIpLnNwbGl0KFwiIFwiKSxrPXt9O3JldHVybiBfPXModiksdlswXS5wcmV2ZW50RGVmYXVsdCYmKG4uYXQ9XCJsZWZ0IHRvcFwiKSxwPV8ud2lkdGgsZj1fLmhlaWdodCxnPV8ub2Zmc2V0LG09dC5leHRlbmQoe30sZyksdC5lYWNoKFtcIm15XCIsXCJhdFwiXSxmdW5jdGlvbigpe3ZhciB0LGUsaT0oblt0aGlzXXx8XCJcIikuc3BsaXQoXCIgXCIpOzE9PT1pLmxlbmd0aCYmKGk9ci50ZXN0KGlbMF0pP2kuY29uY2F0KFtcImNlbnRlclwiXSk6bC50ZXN0KGlbMF0pP1tcImNlbnRlclwiXS5jb25jYXQoaSk6W1wiY2VudGVyXCIsXCJjZW50ZXJcIl0pLGlbMF09ci50ZXN0KGlbMF0pP2lbMF06XCJjZW50ZXJcIixpWzFdPWwudGVzdChpWzFdKT9pWzFdOlwiY2VudGVyXCIsdD1oLmV4ZWMoaVswXSksZT1oLmV4ZWMoaVsxXSksa1t0aGlzXT1bdD90WzBdOjAsZT9lWzBdOjBdLG5bdGhpc109W2MuZXhlYyhpWzBdKVswXSxjLmV4ZWMoaVsxXSlbMF1dfSksMT09PXcubGVuZ3RoJiYod1sxXT13WzBdKSxcInJpZ2h0XCI9PT1uLmF0WzBdP20ubGVmdCs9cDpcImNlbnRlclwiPT09bi5hdFswXSYmKG0ubGVmdCs9cC8yKSxcImJvdHRvbVwiPT09bi5hdFsxXT9tLnRvcCs9ZjpcImNlbnRlclwiPT09bi5hdFsxXSYmKG0udG9wKz1mLzIpLHU9ZShrLmF0LHAsZiksbS5sZWZ0Kz11WzBdLG0udG9wKz11WzFdLHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBzLHIsbD10KHRoaXMpLGg9bC5vdXRlcldpZHRoKCksYz1sLm91dGVySGVpZ2h0KCksZD1pKHRoaXMsXCJtYXJnaW5MZWZ0XCIpLF89aSh0aGlzLFwibWFyZ2luVG9wXCIpLHg9aCtkK2kodGhpcyxcIm1hcmdpblJpZ2h0XCIpK3kud2lkdGgsQz1jK18raSh0aGlzLFwibWFyZ2luQm90dG9tXCIpK3kuaGVpZ2h0LEQ9dC5leHRlbmQoe30sbSksVD1lKGsubXksbC5vdXRlcldpZHRoKCksbC5vdXRlckhlaWdodCgpKTtcInJpZ2h0XCI9PT1uLm15WzBdP0QubGVmdC09aDpcImNlbnRlclwiPT09bi5teVswXSYmKEQubGVmdC09aC8yKSxcImJvdHRvbVwiPT09bi5teVsxXT9ELnRvcC09YzpcImNlbnRlclwiPT09bi5teVsxXSYmKEQudG9wLT1jLzIpLEQubGVmdCs9VFswXSxELnRvcCs9VFsxXSxzPXttYXJnaW5MZWZ0OmQsbWFyZ2luVG9wOl99LHQuZWFjaChbXCJsZWZ0XCIsXCJ0b3BcIl0sZnVuY3Rpb24oZSxpKXt0LnVpLnBvc2l0aW9uW3dbZV1dJiZ0LnVpLnBvc2l0aW9uW3dbZV1dW2ldKEQse3RhcmdldFdpZHRoOnAsdGFyZ2V0SGVpZ2h0OmYsZWxlbVdpZHRoOmgsZWxlbUhlaWdodDpjLGNvbGxpc2lvblBvc2l0aW9uOnMsY29sbGlzaW9uV2lkdGg6eCxjb2xsaXNpb25IZWlnaHQ6QyxvZmZzZXQ6W3VbMF0rVFswXSx1WzFdK1RbMV1dLG15Om4ubXksYXQ6bi5hdCx3aXRoaW46YixlbGVtOmx9KX0pLG4udXNpbmcmJihyPWZ1bmN0aW9uKHQpe3ZhciBlPWcubGVmdC1ELmxlZnQsaT1lK3AtaCxzPWcudG9wLUQudG9wLHI9cytmLWMsdT17dGFyZ2V0OntlbGVtZW50OnYsbGVmdDpnLmxlZnQsdG9wOmcudG9wLHdpZHRoOnAsaGVpZ2h0OmZ9LGVsZW1lbnQ6e2VsZW1lbnQ6bCxsZWZ0OkQubGVmdCx0b3A6RC50b3Asd2lkdGg6aCxoZWlnaHQ6Y30saG9yaXpvbnRhbDowPmk/XCJsZWZ0XCI6ZT4wP1wicmlnaHRcIjpcImNlbnRlclwiLHZlcnRpY2FsOjA+cj9cInRvcFwiOnM+MD9cImJvdHRvbVwiOlwibWlkZGxlXCJ9O2g+cCYmcD5hKGUraSkmJih1Lmhvcml6b250YWw9XCJjZW50ZXJcIiksYz5mJiZmPmEocytyKSYmKHUudmVydGljYWw9XCJtaWRkbGVcIiksdS5pbXBvcnRhbnQ9byhhKGUpLGEoaSkpPm8oYShzKSxhKHIpKT9cImhvcml6b250YWxcIjpcInZlcnRpY2FsXCIsbi51c2luZy5jYWxsKHRoaXMsdCx1KX0pLGwub2Zmc2V0KHQuZXh0ZW5kKEQse3VzaW5nOnJ9KSl9KX0sdC51aS5wb3NpdGlvbj17Zml0OntsZWZ0OmZ1bmN0aW9uKHQsZSl7dmFyIGkscz1lLndpdGhpbixuPXMuaXNXaW5kb3c/cy5zY3JvbGxMZWZ0OnMub2Zmc2V0LmxlZnQsYT1zLndpZHRoLHI9dC5sZWZ0LWUuY29sbGlzaW9uUG9zaXRpb24ubWFyZ2luTGVmdCxsPW4tcixoPXIrZS5jb2xsaXNpb25XaWR0aC1hLW47ZS5jb2xsaXNpb25XaWR0aD5hP2w+MCYmMD49aD8oaT10LmxlZnQrbCtlLmNvbGxpc2lvbldpZHRoLWEtbix0LmxlZnQrPWwtaSk6dC5sZWZ0PWg+MCYmMD49bD9uOmw+aD9uK2EtZS5jb2xsaXNpb25XaWR0aDpuOmw+MD90LmxlZnQrPWw6aD4wP3QubGVmdC09aDp0LmxlZnQ9byh0LmxlZnQtcix0LmxlZnQpfSx0b3A6ZnVuY3Rpb24odCxlKXt2YXIgaSxzPWUud2l0aGluLG49cy5pc1dpbmRvdz9zLnNjcm9sbFRvcDpzLm9mZnNldC50b3AsYT1lLndpdGhpbi5oZWlnaHQscj10LnRvcC1lLmNvbGxpc2lvblBvc2l0aW9uLm1hcmdpblRvcCxsPW4tcixoPXIrZS5jb2xsaXNpb25IZWlnaHQtYS1uO2UuY29sbGlzaW9uSGVpZ2h0PmE/bD4wJiYwPj1oPyhpPXQudG9wK2wrZS5jb2xsaXNpb25IZWlnaHQtYS1uLHQudG9wKz1sLWkpOnQudG9wPWg+MCYmMD49bD9uOmw+aD9uK2EtZS5jb2xsaXNpb25IZWlnaHQ6bjpsPjA/dC50b3ArPWw6aD4wP3QudG9wLT1oOnQudG9wPW8odC50b3Atcix0LnRvcCl9fSxmbGlwOntsZWZ0OmZ1bmN0aW9uKHQsZSl7dmFyIGkscyxuPWUud2l0aGluLG89bi5vZmZzZXQubGVmdCtuLnNjcm9sbExlZnQscj1uLndpZHRoLGw9bi5pc1dpbmRvdz9uLnNjcm9sbExlZnQ6bi5vZmZzZXQubGVmdCxoPXQubGVmdC1lLmNvbGxpc2lvblBvc2l0aW9uLm1hcmdpbkxlZnQsYz1oLWwsdT1oK2UuY29sbGlzaW9uV2lkdGgtci1sLGQ9XCJsZWZ0XCI9PT1lLm15WzBdPy1lLmVsZW1XaWR0aDpcInJpZ2h0XCI9PT1lLm15WzBdP2UuZWxlbVdpZHRoOjAscD1cImxlZnRcIj09PWUuYXRbMF0/ZS50YXJnZXRXaWR0aDpcInJpZ2h0XCI9PT1lLmF0WzBdPy1lLnRhcmdldFdpZHRoOjAsZj0tMiplLm9mZnNldFswXTswPmM/KGk9dC5sZWZ0K2QrcCtmK2UuY29sbGlzaW9uV2lkdGgtci1vLCgwPml8fGEoYyk+aSkmJih0LmxlZnQrPWQrcCtmKSk6dT4wJiYocz10LmxlZnQtZS5jb2xsaXNpb25Qb3NpdGlvbi5tYXJnaW5MZWZ0K2QrcCtmLWwsKHM+MHx8dT5hKHMpKSYmKHQubGVmdCs9ZCtwK2YpKX0sdG9wOmZ1bmN0aW9uKHQsZSl7dmFyIGkscyxuPWUud2l0aGluLG89bi5vZmZzZXQudG9wK24uc2Nyb2xsVG9wLHI9bi5oZWlnaHQsbD1uLmlzV2luZG93P24uc2Nyb2xsVG9wOm4ub2Zmc2V0LnRvcCxoPXQudG9wLWUuY29sbGlzaW9uUG9zaXRpb24ubWFyZ2luVG9wLGM9aC1sLHU9aCtlLmNvbGxpc2lvbkhlaWdodC1yLWwsZD1cInRvcFwiPT09ZS5teVsxXSxwPWQ/LWUuZWxlbUhlaWdodDpcImJvdHRvbVwiPT09ZS5teVsxXT9lLmVsZW1IZWlnaHQ6MCxmPVwidG9wXCI9PT1lLmF0WzFdP2UudGFyZ2V0SGVpZ2h0OlwiYm90dG9tXCI9PT1lLmF0WzFdPy1lLnRhcmdldEhlaWdodDowLGc9LTIqZS5vZmZzZXRbMV07MD5jPyhzPXQudG9wK3ArZitnK2UuY29sbGlzaW9uSGVpZ2h0LXItbywoMD5zfHxhKGMpPnMpJiYodC50b3ArPXArZitnKSk6dT4wJiYoaT10LnRvcC1lLmNvbGxpc2lvblBvc2l0aW9uLm1hcmdpblRvcCtwK2YrZy1sLChpPjB8fHU+YShpKSkmJih0LnRvcCs9cCtmK2cpKX19LGZsaXBmaXQ6e2xlZnQ6ZnVuY3Rpb24oKXt0LnVpLnBvc2l0aW9uLmZsaXAubGVmdC5hcHBseSh0aGlzLGFyZ3VtZW50cyksdC51aS5wb3NpdGlvbi5maXQubGVmdC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9LHRvcDpmdW5jdGlvbigpe3QudWkucG9zaXRpb24uZmxpcC50b3AuYXBwbHkodGhpcyxhcmd1bWVudHMpLHQudWkucG9zaXRpb24uZml0LnRvcC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fX19KCksdC51aS5wb3NpdGlvbix0LmZuLmZvcm09ZnVuY3Rpb24oKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdGhpc1swXS5mb3JtP3RoaXMuY2xvc2VzdChcImZvcm1cIik6dCh0aGlzWzBdLmZvcm0pfSx0LnVpLmZvcm1SZXNldE1peGluPXtfZm9ybVJlc2V0SGFuZGxlcjpmdW5jdGlvbigpe3ZhciBlPXQodGhpcyk7c2V0VGltZW91dChmdW5jdGlvbigpe3ZhciBpPWUuZGF0YShcInVpLWZvcm0tcmVzZXQtaW5zdGFuY2VzXCIpO3QuZWFjaChpLGZ1bmN0aW9uKCl7dGhpcy5yZWZyZXNoKCl9KX0pfSxfYmluZEZvcm1SZXNldEhhbmRsZXI6ZnVuY3Rpb24oKXtpZih0aGlzLmZvcm09dGhpcy5lbGVtZW50LmZvcm0oKSx0aGlzLmZvcm0ubGVuZ3RoKXt2YXIgdD10aGlzLmZvcm0uZGF0YShcInVpLWZvcm0tcmVzZXQtaW5zdGFuY2VzXCIpfHxbXTt0Lmxlbmd0aHx8dGhpcy5mb3JtLm9uKFwicmVzZXQudWktZm9ybS1yZXNldFwiLHRoaXMuX2Zvcm1SZXNldEhhbmRsZXIpLHQucHVzaCh0aGlzKSx0aGlzLmZvcm0uZGF0YShcInVpLWZvcm0tcmVzZXQtaW5zdGFuY2VzXCIsdCl9fSxfdW5iaW5kRm9ybVJlc2V0SGFuZGxlcjpmdW5jdGlvbigpe2lmKHRoaXMuZm9ybS5sZW5ndGgpe3ZhciBlPXRoaXMuZm9ybS5kYXRhKFwidWktZm9ybS1yZXNldC1pbnN0YW5jZXNcIik7ZS5zcGxpY2UodC5pbkFycmF5KHRoaXMsZSksMSksZS5sZW5ndGg/dGhpcy5mb3JtLmRhdGEoXCJ1aS1mb3JtLXJlc2V0LWluc3RhbmNlc1wiLGUpOnRoaXMuZm9ybS5yZW1vdmVEYXRhKFwidWktZm9ybS1yZXNldC1pbnN0YW5jZXNcIikub2ZmKFwicmVzZXQudWktZm9ybS1yZXNldFwiKX19fSx0LnVpLmtleUNvZGU9e0JBQ0tTUEFDRTo4LENPTU1BOjE4OCxERUxFVEU6NDYsRE9XTjo0MCxFTkQ6MzUsRU5URVI6MTMsRVNDQVBFOjI3LEhPTUU6MzYsTEVGVDozNyxQQUdFX0RPV046MzQsUEFHRV9VUDozMyxQRVJJT0Q6MTkwLFJJR0hUOjM5LFNQQUNFOjMyLFRBQjo5LFVQOjM4fSx0LnVpLmVzY2FwZVNlbGVjdG9yPWZ1bmN0aW9uKCl7dmFyIHQ9LyhbIVwiIyQlJicoKSorLC4vOjs8PT4/QFtcXF1eYHt8fX5dKS9nO3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gZS5yZXBsYWNlKHQsXCJcXFxcJDFcIil9fSgpLHQuZm4ubGFiZWxzPWZ1bmN0aW9uKCl7dmFyIGUsaSxzLG4sbztyZXR1cm4gdGhpc1swXS5sYWJlbHMmJnRoaXNbMF0ubGFiZWxzLmxlbmd0aD90aGlzLnB1c2hTdGFjayh0aGlzWzBdLmxhYmVscyk6KG49dGhpcy5lcSgwKS5wYXJlbnRzKFwibGFiZWxcIikscz10aGlzLmF0dHIoXCJpZFwiKSxzJiYoZT10aGlzLmVxKDApLnBhcmVudHMoKS5sYXN0KCksbz1lLmFkZChlLmxlbmd0aD9lLnNpYmxpbmdzKCk6dGhpcy5zaWJsaW5ncygpKSxpPVwibGFiZWxbZm9yPSdcIit0LnVpLmVzY2FwZVNlbGVjdG9yKHMpK1wiJ11cIixuPW4uYWRkKG8uZmluZChpKS5hZGRCYWNrKGkpKSksdGhpcy5wdXNoU3RhY2sobikpfSx0LmZuLmV4dGVuZCh7dW5pcXVlSWQ6ZnVuY3Rpb24oKXt2YXIgdD0wO3JldHVybiBmdW5jdGlvbigpe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt0aGlzLmlkfHwodGhpcy5pZD1cInVpLWlkLVwiKyArK3QpfSl9fSgpLHJlbW92ZVVuaXF1ZUlkOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpey9edWktaWQtXFxkKyQvLnRlc3QodGhpcy5pZCkmJnQodGhpcykucmVtb3ZlQXR0cihcImlkXCIpfSl9fSksdC51aS5zYWZlQWN0aXZlRWxlbWVudD1mdW5jdGlvbih0KXt2YXIgZTt0cnl7ZT10LmFjdGl2ZUVsZW1lbnR9Y2F0Y2goaSl7ZT10LmJvZHl9cmV0dXJuIGV8fChlPXQuYm9keSksZS5ub2RlTmFtZXx8KGU9dC5ib2R5KSxlfSx0LndpZGdldChcInVpLm1lbnVcIix7dmVyc2lvbjpcIjEuMTIuMVwiLGRlZmF1bHRFbGVtZW50OlwiPHVsPlwiLGRlbGF5OjMwMCxvcHRpb25zOntpY29uczp7c3VibWVudTpcInVpLWljb24tY2FyZXQtMS1lXCJ9LGl0ZW1zOlwiPiAqXCIsbWVudXM6XCJ1bFwiLHBvc2l0aW9uOntteTpcImxlZnQgdG9wXCIsYXQ6XCJyaWdodCB0b3BcIn0scm9sZTpcIm1lbnVcIixibHVyOm51bGwsZm9jdXM6bnVsbCxzZWxlY3Q6bnVsbH0sX2NyZWF0ZTpmdW5jdGlvbigpe3RoaXMuYWN0aXZlTWVudT10aGlzLmVsZW1lbnQsdGhpcy5tb3VzZUhhbmRsZWQ9ITEsdGhpcy5lbGVtZW50LnVuaXF1ZUlkKCkuYXR0cih7cm9sZTp0aGlzLm9wdGlvbnMucm9sZSx0YWJJbmRleDowfSksdGhpcy5fYWRkQ2xhc3MoXCJ1aS1tZW51XCIsXCJ1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnRcIiksdGhpcy5fb24oe1wibW91c2Vkb3duIC51aS1tZW51LWl0ZW1cIjpmdW5jdGlvbih0KXt0LnByZXZlbnREZWZhdWx0KCl9LFwiY2xpY2sgLnVpLW1lbnUtaXRlbVwiOmZ1bmN0aW9uKGUpe3ZhciBpPXQoZS50YXJnZXQpLHM9dCh0LnVpLnNhZmVBY3RpdmVFbGVtZW50KHRoaXMuZG9jdW1lbnRbMF0pKTshdGhpcy5tb3VzZUhhbmRsZWQmJmkubm90KFwiLnVpLXN0YXRlLWRpc2FibGVkXCIpLmxlbmd0aCYmKHRoaXMuc2VsZWN0KGUpLGUuaXNQcm9wYWdhdGlvblN0b3BwZWQoKXx8KHRoaXMubW91c2VIYW5kbGVkPSEwKSxpLmhhcyhcIi51aS1tZW51XCIpLmxlbmd0aD90aGlzLmV4cGFuZChlKTohdGhpcy5lbGVtZW50LmlzKFwiOmZvY3VzXCIpJiZzLmNsb3Nlc3QoXCIudWktbWVudVwiKS5sZW5ndGgmJih0aGlzLmVsZW1lbnQudHJpZ2dlcihcImZvY3VzXCIsWyEwXSksdGhpcy5hY3RpdmUmJjE9PT10aGlzLmFjdGl2ZS5wYXJlbnRzKFwiLnVpLW1lbnVcIikubGVuZ3RoJiZjbGVhclRpbWVvdXQodGhpcy50aW1lcikpKX0sXCJtb3VzZWVudGVyIC51aS1tZW51LWl0ZW1cIjpmdW5jdGlvbihlKXtpZighdGhpcy5wcmV2aW91c0ZpbHRlcil7dmFyIGk9dChlLnRhcmdldCkuY2xvc2VzdChcIi51aS1tZW51LWl0ZW1cIikscz10KGUuY3VycmVudFRhcmdldCk7aVswXT09PXNbMF0mJih0aGlzLl9yZW1vdmVDbGFzcyhzLnNpYmxpbmdzKCkuY2hpbGRyZW4oXCIudWktc3RhdGUtYWN0aXZlXCIpLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksdGhpcy5mb2N1cyhlLHMpKX19LG1vdXNlbGVhdmU6XCJjb2xsYXBzZUFsbFwiLFwibW91c2VsZWF2ZSAudWktbWVudVwiOlwiY29sbGFwc2VBbGxcIixmb2N1czpmdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuYWN0aXZlfHx0aGlzLmVsZW1lbnQuZmluZCh0aGlzLm9wdGlvbnMuaXRlbXMpLmVxKDApO2V8fHRoaXMuZm9jdXModCxpKX0sYmx1cjpmdW5jdGlvbihlKXt0aGlzLl9kZWxheShmdW5jdGlvbigpe3ZhciBpPSF0LmNvbnRhaW5zKHRoaXMuZWxlbWVudFswXSx0LnVpLnNhZmVBY3RpdmVFbGVtZW50KHRoaXMuZG9jdW1lbnRbMF0pKTtpJiZ0aGlzLmNvbGxhcHNlQWxsKGUpfSl9LGtleWRvd246XCJfa2V5ZG93blwifSksdGhpcy5yZWZyZXNoKCksdGhpcy5fb24odGhpcy5kb2N1bWVudCx7Y2xpY2s6ZnVuY3Rpb24odCl7dGhpcy5fY2xvc2VPbkRvY3VtZW50Q2xpY2sodCkmJnRoaXMuY29sbGFwc2VBbGwodCksdGhpcy5tb3VzZUhhbmRsZWQ9ITF9fSl9LF9kZXN0cm95OmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5lbGVtZW50LmZpbmQoXCIudWktbWVudS1pdGVtXCIpLnJlbW92ZUF0dHIoXCJyb2xlIGFyaWEtZGlzYWJsZWRcIiksaT1lLmNoaWxkcmVuKFwiLnVpLW1lbnUtaXRlbS13cmFwcGVyXCIpLnJlbW92ZVVuaXF1ZUlkKCkucmVtb3ZlQXR0cihcInRhYkluZGV4IHJvbGUgYXJpYS1oYXNwb3B1cFwiKTt0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiKS5maW5kKFwiLnVpLW1lbnVcIikuYWRkQmFjaygpLnJlbW92ZUF0dHIoXCJyb2xlIGFyaWEtbGFiZWxsZWRieSBhcmlhLWV4cGFuZGVkIGFyaWEtaGlkZGVuIGFyaWEtZGlzYWJsZWQgdGFiSW5kZXhcIikucmVtb3ZlVW5pcXVlSWQoKS5zaG93KCksaS5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpO2UuZGF0YShcInVpLW1lbnUtc3VibWVudS1jYXJldFwiKSYmZS5yZW1vdmUoKX0pfSxfa2V5ZG93bjpmdW5jdGlvbihlKXt2YXIgaSxzLG4sbyxhPSEwO3N3aXRjaChlLmtleUNvZGUpe2Nhc2UgdC51aS5rZXlDb2RlLlBBR0VfVVA6dGhpcy5wcmV2aW91c1BhZ2UoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuUEFHRV9ET1dOOnRoaXMubmV4dFBhZ2UoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuSE9NRTp0aGlzLl9tb3ZlKFwiZmlyc3RcIixcImZpcnN0XCIsZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRU5EOnRoaXMuX21vdmUoXCJsYXN0XCIsXCJsYXN0XCIsZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuVVA6dGhpcy5wcmV2aW91cyhlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5ET1dOOnRoaXMubmV4dChlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5MRUZUOnRoaXMuY29sbGFwc2UoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuUklHSFQ6dGhpcy5hY3RpdmUmJiF0aGlzLmFjdGl2ZS5pcyhcIi51aS1zdGF0ZS1kaXNhYmxlZFwiKSYmdGhpcy5leHBhbmQoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRU5URVI6Y2FzZSB0LnVpLmtleUNvZGUuU1BBQ0U6dGhpcy5fYWN0aXZhdGUoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRVNDQVBFOnRoaXMuY29sbGFwc2UoZSk7YnJlYWs7ZGVmYXVsdDphPSExLHM9dGhpcy5wcmV2aW91c0ZpbHRlcnx8XCJcIixvPSExLG49ZS5rZXlDb2RlPj05NiYmMTA1Pj1lLmtleUNvZGU/XCJcIisoZS5rZXlDb2RlLTk2KTpTdHJpbmcuZnJvbUNoYXJDb2RlKGUua2V5Q29kZSksY2xlYXJUaW1lb3V0KHRoaXMuZmlsdGVyVGltZXIpLG49PT1zP289ITA6bj1zK24saT10aGlzLl9maWx0ZXJNZW51SXRlbXMobiksaT1vJiYtMSE9PWkuaW5kZXgodGhpcy5hY3RpdmUubmV4dCgpKT90aGlzLmFjdGl2ZS5uZXh0QWxsKFwiLnVpLW1lbnUtaXRlbVwiKTppLGkubGVuZ3RofHwobj1TdHJpbmcuZnJvbUNoYXJDb2RlKGUua2V5Q29kZSksaT10aGlzLl9maWx0ZXJNZW51SXRlbXMobikpLGkubGVuZ3RoPyh0aGlzLmZvY3VzKGUsaSksdGhpcy5wcmV2aW91c0ZpbHRlcj1uLHRoaXMuZmlsdGVyVGltZXI9dGhpcy5fZGVsYXkoZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5wcmV2aW91c0ZpbHRlcn0sMWUzKSk6ZGVsZXRlIHRoaXMucHJldmlvdXNGaWx0ZXJ9YSYmZS5wcmV2ZW50RGVmYXVsdCgpfSxfYWN0aXZhdGU6ZnVuY3Rpb24odCl7dGhpcy5hY3RpdmUmJiF0aGlzLmFjdGl2ZS5pcyhcIi51aS1zdGF0ZS1kaXNhYmxlZFwiKSYmKHRoaXMuYWN0aXZlLmNoaWxkcmVuKFwiW2FyaWEtaGFzcG9wdXA9J3RydWUnXVwiKS5sZW5ndGg/dGhpcy5leHBhbmQodCk6dGhpcy5zZWxlY3QodCkpfSxyZWZyZXNoOmZ1bmN0aW9uKCl7dmFyIGUsaSxzLG4sbyxhPXRoaXMscj10aGlzLm9wdGlvbnMuaWNvbnMuc3VibWVudSxsPXRoaXMuZWxlbWVudC5maW5kKHRoaXMub3B0aW9ucy5tZW51cyk7dGhpcy5fdG9nZ2xlQ2xhc3MoXCJ1aS1tZW51LWljb25zXCIsbnVsbCwhIXRoaXMuZWxlbWVudC5maW5kKFwiLnVpLWljb25cIikubGVuZ3RoKSxzPWwuZmlsdGVyKFwiOm5vdCgudWktbWVudSlcIikuaGlkZSgpLmF0dHIoe3JvbGU6dGhpcy5vcHRpb25zLnJvbGUsXCJhcmlhLWhpZGRlblwiOlwidHJ1ZVwiLFwiYXJpYS1leHBhbmRlZFwiOlwiZmFsc2VcIn0pLmVhY2goZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpLGk9ZS5wcmV2KCkscz10KFwiPHNwYW4+XCIpLmRhdGEoXCJ1aS1tZW51LXN1Ym1lbnUtY2FyZXRcIiwhMCk7YS5fYWRkQ2xhc3MocyxcInVpLW1lbnUtaWNvblwiLFwidWktaWNvbiBcIityKSxpLmF0dHIoXCJhcmlhLWhhc3BvcHVwXCIsXCJ0cnVlXCIpLnByZXBlbmQocyksZS5hdHRyKFwiYXJpYS1sYWJlbGxlZGJ5XCIsaS5hdHRyKFwiaWRcIikpfSksdGhpcy5fYWRkQ2xhc3MocyxcInVpLW1lbnVcIixcInVpLXdpZGdldCB1aS13aWRnZXQtY29udGVudCB1aS1mcm9udFwiKSxlPWwuYWRkKHRoaXMuZWxlbWVudCksaT1lLmZpbmQodGhpcy5vcHRpb25zLml0ZW1zKSxpLm5vdChcIi51aS1tZW51LWl0ZW1cIikuZWFjaChmdW5jdGlvbigpe3ZhciBlPXQodGhpcyk7YS5faXNEaXZpZGVyKGUpJiZhLl9hZGRDbGFzcyhlLFwidWktbWVudS1kaXZpZGVyXCIsXCJ1aS13aWRnZXQtY29udGVudFwiKX0pLG49aS5ub3QoXCIudWktbWVudS1pdGVtLCAudWktbWVudS1kaXZpZGVyXCIpLG89bi5jaGlsZHJlbigpLm5vdChcIi51aS1tZW51XCIpLnVuaXF1ZUlkKCkuYXR0cih7dGFiSW5kZXg6LTEscm9sZTp0aGlzLl9pdGVtUm9sZSgpfSksdGhpcy5fYWRkQ2xhc3MobixcInVpLW1lbnUtaXRlbVwiKS5fYWRkQ2xhc3MobyxcInVpLW1lbnUtaXRlbS13cmFwcGVyXCIpLGkuZmlsdGVyKFwiLnVpLXN0YXRlLWRpc2FibGVkXCIpLmF0dHIoXCJhcmlhLWRpc2FibGVkXCIsXCJ0cnVlXCIpLHRoaXMuYWN0aXZlJiYhdC5jb250YWlucyh0aGlzLmVsZW1lbnRbMF0sdGhpcy5hY3RpdmVbMF0pJiZ0aGlzLmJsdXIoKX0sX2l0ZW1Sb2xlOmZ1bmN0aW9uKCl7cmV0dXJue21lbnU6XCJtZW51aXRlbVwiLGxpc3Rib3g6XCJvcHRpb25cIn1bdGhpcy5vcHRpb25zLnJvbGVdfSxfc2V0T3B0aW9uOmZ1bmN0aW9uKHQsZSl7aWYoXCJpY29uc1wiPT09dCl7dmFyIGk9dGhpcy5lbGVtZW50LmZpbmQoXCIudWktbWVudS1pY29uXCIpO3RoaXMuX3JlbW92ZUNsYXNzKGksbnVsbCx0aGlzLm9wdGlvbnMuaWNvbnMuc3VibWVudSkuX2FkZENsYXNzKGksbnVsbCxlLnN1Ym1lbnUpfXRoaXMuX3N1cGVyKHQsZSl9LF9zZXRPcHRpb25EaXNhYmxlZDpmdW5jdGlvbih0KXt0aGlzLl9zdXBlcih0KSx0aGlzLmVsZW1lbnQuYXR0cihcImFyaWEtZGlzYWJsZWRcIix0K1wiXCIpLHRoaXMuX3RvZ2dsZUNsYXNzKG51bGwsXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiLCEhdCl9LGZvY3VzOmZ1bmN0aW9uKHQsZSl7dmFyIGkscyxuO3RoaXMuYmx1cih0LHQmJlwiZm9jdXNcIj09PXQudHlwZSksdGhpcy5fc2Nyb2xsSW50b1ZpZXcoZSksdGhpcy5hY3RpdmU9ZS5maXJzdCgpLHM9dGhpcy5hY3RpdmUuY2hpbGRyZW4oXCIudWktbWVudS1pdGVtLXdyYXBwZXJcIiksdGhpcy5fYWRkQ2xhc3MocyxudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpLHRoaXMub3B0aW9ucy5yb2xlJiZ0aGlzLmVsZW1lbnQuYXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiLHMuYXR0cihcImlkXCIpKSxuPXRoaXMuYWN0aXZlLnBhcmVudCgpLmNsb3Nlc3QoXCIudWktbWVudS1pdGVtXCIpLmNoaWxkcmVuKFwiLnVpLW1lbnUtaXRlbS13cmFwcGVyXCIpLHRoaXMuX2FkZENsYXNzKG4sbnVsbCxcInVpLXN0YXRlLWFjdGl2ZVwiKSx0JiZcImtleWRvd25cIj09PXQudHlwZT90aGlzLl9jbG9zZSgpOnRoaXMudGltZXI9dGhpcy5fZGVsYXkoZnVuY3Rpb24oKXt0aGlzLl9jbG9zZSgpfSx0aGlzLmRlbGF5KSxpPWUuY2hpbGRyZW4oXCIudWktbWVudVwiKSxpLmxlbmd0aCYmdCYmL15tb3VzZS8udGVzdCh0LnR5cGUpJiZ0aGlzLl9zdGFydE9wZW5pbmcoaSksdGhpcy5hY3RpdmVNZW51PWUucGFyZW50KCksdGhpcy5fdHJpZ2dlcihcImZvY3VzXCIsdCx7aXRlbTplfSl9LF9zY3JvbGxJbnRvVmlldzpmdW5jdGlvbihlKXt2YXIgaSxzLG4sbyxhLHI7dGhpcy5faGFzU2Nyb2xsKCkmJihpPXBhcnNlRmxvYXQodC5jc3ModGhpcy5hY3RpdmVNZW51WzBdLFwiYm9yZGVyVG9wV2lkdGhcIikpfHwwLHM9cGFyc2VGbG9hdCh0LmNzcyh0aGlzLmFjdGl2ZU1lbnVbMF0sXCJwYWRkaW5nVG9wXCIpKXx8MCxuPWUub2Zmc2V0KCkudG9wLXRoaXMuYWN0aXZlTWVudS5vZmZzZXQoKS50b3AtaS1zLG89dGhpcy5hY3RpdmVNZW51LnNjcm9sbFRvcCgpLGE9dGhpcy5hY3RpdmVNZW51LmhlaWdodCgpLHI9ZS5vdXRlckhlaWdodCgpLDA+bj90aGlzLmFjdGl2ZU1lbnUuc2Nyb2xsVG9wKG8rbik6bityPmEmJnRoaXMuYWN0aXZlTWVudS5zY3JvbGxUb3AobytuLWErcikpfSxibHVyOmZ1bmN0aW9uKHQsZSl7ZXx8Y2xlYXJUaW1lb3V0KHRoaXMudGltZXIpLHRoaXMuYWN0aXZlJiYodGhpcy5fcmVtb3ZlQ2xhc3ModGhpcy5hY3RpdmUuY2hpbGRyZW4oXCIudWktbWVudS1pdGVtLXdyYXBwZXJcIiksbnVsbCxcInVpLXN0YXRlLWFjdGl2ZVwiKSx0aGlzLl90cmlnZ2VyKFwiYmx1clwiLHQse2l0ZW06dGhpcy5hY3RpdmV9KSx0aGlzLmFjdGl2ZT1udWxsKX0sX3N0YXJ0T3BlbmluZzpmdW5jdGlvbih0KXtjbGVhclRpbWVvdXQodGhpcy50aW1lciksXCJ0cnVlXCI9PT10LmF0dHIoXCJhcmlhLWhpZGRlblwiKSYmKHRoaXMudGltZXI9dGhpcy5fZGVsYXkoZnVuY3Rpb24oKXt0aGlzLl9jbG9zZSgpLHRoaXMuX29wZW4odCl9LHRoaXMuZGVsYXkpKX0sX29wZW46ZnVuY3Rpb24oZSl7dmFyIGk9dC5leHRlbmQoe29mOnRoaXMuYWN0aXZlfSx0aGlzLm9wdGlvbnMucG9zaXRpb24pO2NsZWFyVGltZW91dCh0aGlzLnRpbWVyKSx0aGlzLmVsZW1lbnQuZmluZChcIi51aS1tZW51XCIpLm5vdChlLnBhcmVudHMoXCIudWktbWVudVwiKSkuaGlkZSgpLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKSxlLnNob3coKS5yZW1vdmVBdHRyKFwiYXJpYS1oaWRkZW5cIikuYXR0cihcImFyaWEtZXhwYW5kZWRcIixcInRydWVcIikucG9zaXRpb24oaSl9LGNvbGxhcHNlQWxsOmZ1bmN0aW9uKGUsaSl7Y2xlYXJUaW1lb3V0KHRoaXMudGltZXIpLHRoaXMudGltZXI9dGhpcy5fZGVsYXkoZnVuY3Rpb24oKXt2YXIgcz1pP3RoaXMuZWxlbWVudDp0KGUmJmUudGFyZ2V0KS5jbG9zZXN0KHRoaXMuZWxlbWVudC5maW5kKFwiLnVpLW1lbnVcIikpO3MubGVuZ3RofHwocz10aGlzLmVsZW1lbnQpLHRoaXMuX2Nsb3NlKHMpLHRoaXMuYmx1cihlKSx0aGlzLl9yZW1vdmVDbGFzcyhzLmZpbmQoXCIudWktc3RhdGUtYWN0aXZlXCIpLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksdGhpcy5hY3RpdmVNZW51PXN9LHRoaXMuZGVsYXkpfSxfY2xvc2U6ZnVuY3Rpb24odCl7dHx8KHQ9dGhpcy5hY3RpdmU/dGhpcy5hY3RpdmUucGFyZW50KCk6dGhpcy5lbGVtZW50KSx0LmZpbmQoXCIudWktbWVudVwiKS5oaWRlKCkuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIsXCJmYWxzZVwiKX0sX2Nsb3NlT25Eb2N1bWVudENsaWNrOmZ1bmN0aW9uKGUpe3JldHVybiF0KGUudGFyZ2V0KS5jbG9zZXN0KFwiLnVpLW1lbnVcIikubGVuZ3RofSxfaXNEaXZpZGVyOmZ1bmN0aW9uKHQpe3JldHVybiEvW15cXC1cXHUyMDE0XFx1MjAxM1xcc10vLnRlc3QodC50ZXh0KCkpfSxjb2xsYXBzZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmFjdGl2ZSYmdGhpcy5hY3RpdmUucGFyZW50KCkuY2xvc2VzdChcIi51aS1tZW51LWl0ZW1cIix0aGlzLmVsZW1lbnQpO2UmJmUubGVuZ3RoJiYodGhpcy5fY2xvc2UoKSx0aGlzLmZvY3VzKHQsZSkpfSxleHBhbmQ6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5hY3RpdmUmJnRoaXMuYWN0aXZlLmNoaWxkcmVuKFwiLnVpLW1lbnUgXCIpLmZpbmQodGhpcy5vcHRpb25zLml0ZW1zKS5maXJzdCgpO2UmJmUubGVuZ3RoJiYodGhpcy5fb3BlbihlLnBhcmVudCgpKSx0aGlzLl9kZWxheShmdW5jdGlvbigpe3RoaXMuZm9jdXModCxlKX0pKX0sbmV4dDpmdW5jdGlvbih0KXt0aGlzLl9tb3ZlKFwibmV4dFwiLFwiZmlyc3RcIix0KX0scHJldmlvdXM6ZnVuY3Rpb24odCl7dGhpcy5fbW92ZShcInByZXZcIixcImxhc3RcIix0KX0saXNGaXJzdEl0ZW06ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5hY3RpdmUmJiF0aGlzLmFjdGl2ZS5wcmV2QWxsKFwiLnVpLW1lbnUtaXRlbVwiKS5sZW5ndGh9LGlzTGFzdEl0ZW06ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5hY3RpdmUmJiF0aGlzLmFjdGl2ZS5uZXh0QWxsKFwiLnVpLW1lbnUtaXRlbVwiKS5sZW5ndGh9LF9tb3ZlOmZ1bmN0aW9uKHQsZSxpKXt2YXIgczt0aGlzLmFjdGl2ZSYmKHM9XCJmaXJzdFwiPT09dHx8XCJsYXN0XCI9PT10P3RoaXMuYWN0aXZlW1wiZmlyc3RcIj09PXQ/XCJwcmV2QWxsXCI6XCJuZXh0QWxsXCJdKFwiLnVpLW1lbnUtaXRlbVwiKS5lcSgtMSk6dGhpcy5hY3RpdmVbdCtcIkFsbFwiXShcIi51aS1tZW51LWl0ZW1cIikuZXEoMCkpLHMmJnMubGVuZ3RoJiZ0aGlzLmFjdGl2ZXx8KHM9dGhpcy5hY3RpdmVNZW51LmZpbmQodGhpcy5vcHRpb25zLml0ZW1zKVtlXSgpKSx0aGlzLmZvY3VzKGkscyl9LG5leHRQYWdlOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbjtyZXR1cm4gdGhpcy5hY3RpdmU/KHRoaXMuaXNMYXN0SXRlbSgpfHwodGhpcy5faGFzU2Nyb2xsKCk/KHM9dGhpcy5hY3RpdmUub2Zmc2V0KCkudG9wLG49dGhpcy5lbGVtZW50LmhlaWdodCgpLHRoaXMuYWN0aXZlLm5leHRBbGwoXCIudWktbWVudS1pdGVtXCIpLmVhY2goZnVuY3Rpb24oKXtyZXR1cm4gaT10KHRoaXMpLDA+aS5vZmZzZXQoKS50b3Atcy1ufSksdGhpcy5mb2N1cyhlLGkpKTp0aGlzLmZvY3VzKGUsdGhpcy5hY3RpdmVNZW51LmZpbmQodGhpcy5vcHRpb25zLml0ZW1zKVt0aGlzLmFjdGl2ZT9cImxhc3RcIjpcImZpcnN0XCJdKCkpKSx2b2lkIDApOih0aGlzLm5leHQoZSksdm9pZCAwKX0scHJldmlvdXNQYWdlOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbjtyZXR1cm4gdGhpcy5hY3RpdmU/KHRoaXMuaXNGaXJzdEl0ZW0oKXx8KHRoaXMuX2hhc1Njcm9sbCgpPyhzPXRoaXMuYWN0aXZlLm9mZnNldCgpLnRvcCxuPXRoaXMuZWxlbWVudC5oZWlnaHQoKSx0aGlzLmFjdGl2ZS5wcmV2QWxsKFwiLnVpLW1lbnUtaXRlbVwiKS5lYWNoKGZ1bmN0aW9uKCl7cmV0dXJuIGk9dCh0aGlzKSxpLm9mZnNldCgpLnRvcC1zK24+MH0pLHRoaXMuZm9jdXMoZSxpKSk6dGhpcy5mb2N1cyhlLHRoaXMuYWN0aXZlTWVudS5maW5kKHRoaXMub3B0aW9ucy5pdGVtcykuZmlyc3QoKSkpLHZvaWQgMCk6KHRoaXMubmV4dChlKSx2b2lkIDApfSxfaGFzU2Nyb2xsOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZWxlbWVudC5vdXRlckhlaWdodCgpPHRoaXMuZWxlbWVudC5wcm9wKFwic2Nyb2xsSGVpZ2h0XCIpfSxzZWxlY3Q6ZnVuY3Rpb24oZSl7dGhpcy5hY3RpdmU9dGhpcy5hY3RpdmV8fHQoZS50YXJnZXQpLmNsb3Nlc3QoXCIudWktbWVudS1pdGVtXCIpO3ZhciBpPXtpdGVtOnRoaXMuYWN0aXZlfTt0aGlzLmFjdGl2ZS5oYXMoXCIudWktbWVudVwiKS5sZW5ndGh8fHRoaXMuY29sbGFwc2VBbGwoZSwhMCksdGhpcy5fdHJpZ2dlcihcInNlbGVjdFwiLGUsaSl9LF9maWx0ZXJNZW51SXRlbXM6ZnVuY3Rpb24oZSl7dmFyIGk9ZS5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSorPy4sXFxcXFxcXiR8I1xcc10vZyxcIlxcXFwkJlwiKSxzPVJlZ0V4cChcIl5cIitpLFwiaVwiKTtyZXR1cm4gdGhpcy5hY3RpdmVNZW51LmZpbmQodGhpcy5vcHRpb25zLml0ZW1zKS5maWx0ZXIoXCIudWktbWVudS1pdGVtXCIpLmZpbHRlcihmdW5jdGlvbigpe3JldHVybiBzLnRlc3QodC50cmltKHQodGhpcykuY2hpbGRyZW4oXCIudWktbWVudS1pdGVtLXdyYXBwZXJcIikudGV4dCgpKSl9KX19KSx0LndpZGdldChcInVpLmF1dG9jb21wbGV0ZVwiLHt2ZXJzaW9uOlwiMS4xMi4xXCIsZGVmYXVsdEVsZW1lbnQ6XCI8aW5wdXQ+XCIsb3B0aW9uczp7YXBwZW5kVG86bnVsbCxhdXRvRm9jdXM6ITEsZGVsYXk6MzAwLG1pbkxlbmd0aDoxLHBvc2l0aW9uOntteTpcImxlZnQgdG9wXCIsYXQ6XCJsZWZ0IGJvdHRvbVwiLGNvbGxpc2lvbjpcIm5vbmVcIn0sc291cmNlOm51bGwsY2hhbmdlOm51bGwsY2xvc2U6bnVsbCxmb2N1czpudWxsLG9wZW46bnVsbCxyZXNwb25zZTpudWxsLHNlYXJjaDpudWxsLHNlbGVjdDpudWxsfSxyZXF1ZXN0SW5kZXg6MCxwZW5kaW5nOjAsX2NyZWF0ZTpmdW5jdGlvbigpe3ZhciBlLGkscyxuPXRoaXMuZWxlbWVudFswXS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLG89XCJ0ZXh0YXJlYVwiPT09bixhPVwiaW5wdXRcIj09PW47dGhpcy5pc011bHRpTGluZT1vfHwhYSYmdGhpcy5faXNDb250ZW50RWRpdGFibGUodGhpcy5lbGVtZW50KSx0aGlzLnZhbHVlTWV0aG9kPXRoaXMuZWxlbWVudFtvfHxhP1widmFsXCI6XCJ0ZXh0XCJdLHRoaXMuaXNOZXdNZW51PSEwLHRoaXMuX2FkZENsYXNzKFwidWktYXV0b2NvbXBsZXRlLWlucHV0XCIpLHRoaXMuZWxlbWVudC5hdHRyKFwiYXV0b2NvbXBsZXRlXCIsXCJvZmZcIiksdGhpcy5fb24odGhpcy5lbGVtZW50LHtrZXlkb3duOmZ1bmN0aW9uKG4pe2lmKHRoaXMuZWxlbWVudC5wcm9wKFwicmVhZE9ubHlcIikpcmV0dXJuIGU9ITAscz0hMCxpPSEwLHZvaWQgMDtlPSExLHM9ITEsaT0hMTt2YXIgbz10LnVpLmtleUNvZGU7c3dpdGNoKG4ua2V5Q29kZSl7Y2FzZSBvLlBBR0VfVVA6ZT0hMCx0aGlzLl9tb3ZlKFwicHJldmlvdXNQYWdlXCIsbik7YnJlYWs7Y2FzZSBvLlBBR0VfRE9XTjplPSEwLHRoaXMuX21vdmUoXCJuZXh0UGFnZVwiLG4pO2JyZWFrO2Nhc2Ugby5VUDplPSEwLHRoaXMuX2tleUV2ZW50KFwicHJldmlvdXNcIixuKTticmVhaztjYXNlIG8uRE9XTjplPSEwLHRoaXMuX2tleUV2ZW50KFwibmV4dFwiLG4pO2JyZWFrO2Nhc2Ugby5FTlRFUjp0aGlzLm1lbnUuYWN0aXZlJiYoZT0hMCxuLnByZXZlbnREZWZhdWx0KCksdGhpcy5tZW51LnNlbGVjdChuKSk7YnJlYWs7Y2FzZSBvLlRBQjp0aGlzLm1lbnUuYWN0aXZlJiZ0aGlzLm1lbnUuc2VsZWN0KG4pO2JyZWFrO2Nhc2Ugby5FU0NBUEU6dGhpcy5tZW51LmVsZW1lbnQuaXMoXCI6dmlzaWJsZVwiKSYmKHRoaXMuaXNNdWx0aUxpbmV8fHRoaXMuX3ZhbHVlKHRoaXMudGVybSksdGhpcy5jbG9zZShuKSxuLnByZXZlbnREZWZhdWx0KCkpO2JyZWFrO2RlZmF1bHQ6aT0hMCx0aGlzLl9zZWFyY2hUaW1lb3V0KG4pfX0sa2V5cHJlc3M6ZnVuY3Rpb24ocyl7aWYoZSlyZXR1cm4gZT0hMSwoIXRoaXMuaXNNdWx0aUxpbmV8fHRoaXMubWVudS5lbGVtZW50LmlzKFwiOnZpc2libGVcIikpJiZzLnByZXZlbnREZWZhdWx0KCksdm9pZCAwO2lmKCFpKXt2YXIgbj10LnVpLmtleUNvZGU7c3dpdGNoKHMua2V5Q29kZSl7Y2FzZSBuLlBBR0VfVVA6dGhpcy5fbW92ZShcInByZXZpb3VzUGFnZVwiLHMpO2JyZWFrO2Nhc2Ugbi5QQUdFX0RPV046dGhpcy5fbW92ZShcIm5leHRQYWdlXCIscyk7YnJlYWs7Y2FzZSBuLlVQOnRoaXMuX2tleUV2ZW50KFwicHJldmlvdXNcIixzKTticmVhaztjYXNlIG4uRE9XTjp0aGlzLl9rZXlFdmVudChcIm5leHRcIixzKX19fSxpbnB1dDpmdW5jdGlvbih0KXtyZXR1cm4gcz8ocz0hMSx0LnByZXZlbnREZWZhdWx0KCksdm9pZCAwKToodGhpcy5fc2VhcmNoVGltZW91dCh0KSx2b2lkIDApfSxmb2N1czpmdW5jdGlvbigpe3RoaXMuc2VsZWN0ZWRJdGVtPW51bGwsdGhpcy5wcmV2aW91cz10aGlzLl92YWx1ZSgpfSxibHVyOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmNhbmNlbEJsdXI/KGRlbGV0ZSB0aGlzLmNhbmNlbEJsdXIsdm9pZCAwKTooY2xlYXJUaW1lb3V0KHRoaXMuc2VhcmNoaW5nKSx0aGlzLmNsb3NlKHQpLHRoaXMuX2NoYW5nZSh0KSx2b2lkIDApfX0pLHRoaXMuX2luaXRTb3VyY2UoKSx0aGlzLm1lbnU9dChcIjx1bD5cIikuYXBwZW5kVG8odGhpcy5fYXBwZW5kVG8oKSkubWVudSh7cm9sZTpudWxsfSkuaGlkZSgpLm1lbnUoXCJpbnN0YW5jZVwiKSx0aGlzLl9hZGRDbGFzcyh0aGlzLm1lbnUuZWxlbWVudCxcInVpLWF1dG9jb21wbGV0ZVwiLFwidWktZnJvbnRcIiksdGhpcy5fb24odGhpcy5tZW51LmVsZW1lbnQse21vdXNlZG93bjpmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCksdGhpcy5jYW5jZWxCbHVyPSEwLHRoaXMuX2RlbGF5KGZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMuY2FuY2VsQmx1cix0aGlzLmVsZW1lbnRbMF0hPT10LnVpLnNhZmVBY3RpdmVFbGVtZW50KHRoaXMuZG9jdW1lbnRbMF0pJiZ0aGlzLmVsZW1lbnQudHJpZ2dlcihcImZvY3VzXCIpfSl9LG1lbnVmb2N1czpmdW5jdGlvbihlLGkpe3ZhciBzLG47cmV0dXJuIHRoaXMuaXNOZXdNZW51JiYodGhpcy5pc05ld01lbnU9ITEsZS5vcmlnaW5hbEV2ZW50JiYvXm1vdXNlLy50ZXN0KGUub3JpZ2luYWxFdmVudC50eXBlKSk/KHRoaXMubWVudS5ibHVyKCksdGhpcy5kb2N1bWVudC5vbmUoXCJtb3VzZW1vdmVcIixmdW5jdGlvbigpe3QoZS50YXJnZXQpLnRyaWdnZXIoZS5vcmlnaW5hbEV2ZW50KX0pLHZvaWQgMCk6KG49aS5pdGVtLmRhdGEoXCJ1aS1hdXRvY29tcGxldGUtaXRlbVwiKSwhMSE9PXRoaXMuX3RyaWdnZXIoXCJmb2N1c1wiLGUse2l0ZW06bn0pJiZlLm9yaWdpbmFsRXZlbnQmJi9ea2V5Ly50ZXN0KGUub3JpZ2luYWxFdmVudC50eXBlKSYmdGhpcy5fdmFsdWUobi52YWx1ZSkscz1pLml0ZW0uYXR0cihcImFyaWEtbGFiZWxcIil8fG4udmFsdWUscyYmdC50cmltKHMpLmxlbmd0aCYmKHRoaXMubGl2ZVJlZ2lvbi5jaGlsZHJlbigpLmhpZGUoKSx0KFwiPGRpdj5cIikudGV4dChzKS5hcHBlbmRUbyh0aGlzLmxpdmVSZWdpb24pKSx2b2lkIDApfSxtZW51c2VsZWN0OmZ1bmN0aW9uKGUsaSl7dmFyIHM9aS5pdGVtLmRhdGEoXCJ1aS1hdXRvY29tcGxldGUtaXRlbVwiKSxuPXRoaXMucHJldmlvdXM7dGhpcy5lbGVtZW50WzBdIT09dC51aS5zYWZlQWN0aXZlRWxlbWVudCh0aGlzLmRvY3VtZW50WzBdKSYmKHRoaXMuZWxlbWVudC50cmlnZ2VyKFwiZm9jdXNcIiksdGhpcy5wcmV2aW91cz1uLHRoaXMuX2RlbGF5KGZ1bmN0aW9uKCl7dGhpcy5wcmV2aW91cz1uLHRoaXMuc2VsZWN0ZWRJdGVtPXN9KSksITEhPT10aGlzLl90cmlnZ2VyKFwic2VsZWN0XCIsZSx7aXRlbTpzfSkmJnRoaXMuX3ZhbHVlKHMudmFsdWUpLHRoaXMudGVybT10aGlzLl92YWx1ZSgpLHRoaXMuY2xvc2UoZSksdGhpcy5zZWxlY3RlZEl0ZW09c319KSx0aGlzLmxpdmVSZWdpb249dChcIjxkaXY+XCIse3JvbGU6XCJzdGF0dXNcIixcImFyaWEtbGl2ZVwiOlwiYXNzZXJ0aXZlXCIsXCJhcmlhLXJlbGV2YW50XCI6XCJhZGRpdGlvbnNcIn0pLmFwcGVuZFRvKHRoaXMuZG9jdW1lbnRbMF0uYm9keSksdGhpcy5fYWRkQ2xhc3ModGhpcy5saXZlUmVnaW9uLG51bGwsXCJ1aS1oZWxwZXItaGlkZGVuLWFjY2Vzc2libGVcIiksdGhpcy5fb24odGhpcy53aW5kb3cse2JlZm9yZXVubG9hZDpmdW5jdGlvbigpe3RoaXMuZWxlbWVudC5yZW1vdmVBdHRyKFwiYXV0b2NvbXBsZXRlXCIpfX0pfSxfZGVzdHJveTpmdW5jdGlvbigpe2NsZWFyVGltZW91dCh0aGlzLnNlYXJjaGluZyksdGhpcy5lbGVtZW50LnJlbW92ZUF0dHIoXCJhdXRvY29tcGxldGVcIiksdGhpcy5tZW51LmVsZW1lbnQucmVtb3ZlKCksdGhpcy5saXZlUmVnaW9uLnJlbW92ZSgpfSxfc2V0T3B0aW9uOmZ1bmN0aW9uKHQsZSl7dGhpcy5fc3VwZXIodCxlKSxcInNvdXJjZVwiPT09dCYmdGhpcy5faW5pdFNvdXJjZSgpLFwiYXBwZW5kVG9cIj09PXQmJnRoaXMubWVudS5lbGVtZW50LmFwcGVuZFRvKHRoaXMuX2FwcGVuZFRvKCkpLFwiZGlzYWJsZWRcIj09PXQmJmUmJnRoaXMueGhyJiZ0aGlzLnhoci5hYm9ydCgpfSxfaXNFdmVudFRhcmdldEluV2lkZ2V0OmZ1bmN0aW9uKGUpe3ZhciBpPXRoaXMubWVudS5lbGVtZW50WzBdO3JldHVybiBlLnRhcmdldD09PXRoaXMuZWxlbWVudFswXXx8ZS50YXJnZXQ9PT1pfHx0LmNvbnRhaW5zKGksZS50YXJnZXQpfSxfY2xvc2VPbkNsaWNrT3V0c2lkZTpmdW5jdGlvbih0KXt0aGlzLl9pc0V2ZW50VGFyZ2V0SW5XaWRnZXQodCl8fHRoaXMuY2xvc2UoKVxufSxfYXBwZW5kVG86ZnVuY3Rpb24oKXt2YXIgZT10aGlzLm9wdGlvbnMuYXBwZW5kVG87cmV0dXJuIGUmJihlPWUuanF1ZXJ5fHxlLm5vZGVUeXBlP3QoZSk6dGhpcy5kb2N1bWVudC5maW5kKGUpLmVxKDApKSxlJiZlWzBdfHwoZT10aGlzLmVsZW1lbnQuY2xvc2VzdChcIi51aS1mcm9udCwgZGlhbG9nXCIpKSxlLmxlbmd0aHx8KGU9dGhpcy5kb2N1bWVudFswXS5ib2R5KSxlfSxfaW5pdFNvdXJjZTpmdW5jdGlvbigpe3ZhciBlLGkscz10aGlzO3QuaXNBcnJheSh0aGlzLm9wdGlvbnMuc291cmNlKT8oZT10aGlzLm9wdGlvbnMuc291cmNlLHRoaXMuc291cmNlPWZ1bmN0aW9uKGkscyl7cyh0LnVpLmF1dG9jb21wbGV0ZS5maWx0ZXIoZSxpLnRlcm0pKX0pOlwic3RyaW5nXCI9PXR5cGVvZiB0aGlzLm9wdGlvbnMuc291cmNlPyhpPXRoaXMub3B0aW9ucy5zb3VyY2UsdGhpcy5zb3VyY2U9ZnVuY3Rpb24oZSxuKXtzLnhociYmcy54aHIuYWJvcnQoKSxzLnhocj10LmFqYXgoe3VybDppLGRhdGE6ZSxkYXRhVHlwZTpcImpzb25cIixzdWNjZXNzOmZ1bmN0aW9uKHQpe24odCl9LGVycm9yOmZ1bmN0aW9uKCl7bihbXSl9fSl9KTp0aGlzLnNvdXJjZT10aGlzLm9wdGlvbnMuc291cmNlfSxfc2VhcmNoVGltZW91dDpmdW5jdGlvbih0KXtjbGVhclRpbWVvdXQodGhpcy5zZWFyY2hpbmcpLHRoaXMuc2VhcmNoaW5nPXRoaXMuX2RlbGF5KGZ1bmN0aW9uKCl7dmFyIGU9dGhpcy50ZXJtPT09dGhpcy5fdmFsdWUoKSxpPXRoaXMubWVudS5lbGVtZW50LmlzKFwiOnZpc2libGVcIikscz10LmFsdEtleXx8dC5jdHJsS2V5fHx0Lm1ldGFLZXl8fHQuc2hpZnRLZXk7KCFlfHxlJiYhaSYmIXMpJiYodGhpcy5zZWxlY3RlZEl0ZW09bnVsbCx0aGlzLnNlYXJjaChudWxsLHQpKX0sdGhpcy5vcHRpb25zLmRlbGF5KX0sc2VhcmNoOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQ9bnVsbCE9dD90OnRoaXMuX3ZhbHVlKCksdGhpcy50ZXJtPXRoaXMuX3ZhbHVlKCksdC5sZW5ndGg8dGhpcy5vcHRpb25zLm1pbkxlbmd0aD90aGlzLmNsb3NlKGUpOnRoaXMuX3RyaWdnZXIoXCJzZWFyY2hcIixlKSE9PSExP3RoaXMuX3NlYXJjaCh0KTp2b2lkIDB9LF9zZWFyY2g6ZnVuY3Rpb24odCl7dGhpcy5wZW5kaW5nKyssdGhpcy5fYWRkQ2xhc3MoXCJ1aS1hdXRvY29tcGxldGUtbG9hZGluZ1wiKSx0aGlzLmNhbmNlbFNlYXJjaD0hMSx0aGlzLnNvdXJjZSh7dGVybTp0fSx0aGlzLl9yZXNwb25zZSgpKX0sX3Jlc3BvbnNlOmZ1bmN0aW9uKCl7dmFyIGU9Kyt0aGlzLnJlcXVlc3RJbmRleDtyZXR1cm4gdC5wcm94eShmdW5jdGlvbih0KXtlPT09dGhpcy5yZXF1ZXN0SW5kZXgmJnRoaXMuX19yZXNwb25zZSh0KSx0aGlzLnBlbmRpbmctLSx0aGlzLnBlbmRpbmd8fHRoaXMuX3JlbW92ZUNsYXNzKFwidWktYXV0b2NvbXBsZXRlLWxvYWRpbmdcIil9LHRoaXMpfSxfX3Jlc3BvbnNlOmZ1bmN0aW9uKHQpe3QmJih0PXRoaXMuX25vcm1hbGl6ZSh0KSksdGhpcy5fdHJpZ2dlcihcInJlc3BvbnNlXCIsbnVsbCx7Y29udGVudDp0fSksIXRoaXMub3B0aW9ucy5kaXNhYmxlZCYmdCYmdC5sZW5ndGgmJiF0aGlzLmNhbmNlbFNlYXJjaD8odGhpcy5fc3VnZ2VzdCh0KSx0aGlzLl90cmlnZ2VyKFwib3BlblwiKSk6dGhpcy5fY2xvc2UoKX0sY2xvc2U6ZnVuY3Rpb24odCl7dGhpcy5jYW5jZWxTZWFyY2g9ITAsdGhpcy5fY2xvc2UodCl9LF9jbG9zZTpmdW5jdGlvbih0KXt0aGlzLl9vZmYodGhpcy5kb2N1bWVudCxcIm1vdXNlZG93blwiKSx0aGlzLm1lbnUuZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpJiYodGhpcy5tZW51LmVsZW1lbnQuaGlkZSgpLHRoaXMubWVudS5ibHVyKCksdGhpcy5pc05ld01lbnU9ITAsdGhpcy5fdHJpZ2dlcihcImNsb3NlXCIsdCkpfSxfY2hhbmdlOmZ1bmN0aW9uKHQpe3RoaXMucHJldmlvdXMhPT10aGlzLl92YWx1ZSgpJiZ0aGlzLl90cmlnZ2VyKFwiY2hhbmdlXCIsdCx7aXRlbTp0aGlzLnNlbGVjdGVkSXRlbX0pfSxfbm9ybWFsaXplOmZ1bmN0aW9uKGUpe3JldHVybiBlLmxlbmd0aCYmZVswXS5sYWJlbCYmZVswXS52YWx1ZT9lOnQubWFwKGUsZnVuY3Rpb24oZSl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGU/e2xhYmVsOmUsdmFsdWU6ZX06dC5leHRlbmQoe30sZSx7bGFiZWw6ZS5sYWJlbHx8ZS52YWx1ZSx2YWx1ZTplLnZhbHVlfHxlLmxhYmVsfSl9KX0sX3N1Z2dlc3Q6ZnVuY3Rpb24oZSl7dmFyIGk9dGhpcy5tZW51LmVsZW1lbnQuZW1wdHkoKTt0aGlzLl9yZW5kZXJNZW51KGksZSksdGhpcy5pc05ld01lbnU9ITAsdGhpcy5tZW51LnJlZnJlc2goKSxpLnNob3coKSx0aGlzLl9yZXNpemVNZW51KCksaS5wb3NpdGlvbih0LmV4dGVuZCh7b2Y6dGhpcy5lbGVtZW50fSx0aGlzLm9wdGlvbnMucG9zaXRpb24pKSx0aGlzLm9wdGlvbnMuYXV0b0ZvY3VzJiZ0aGlzLm1lbnUubmV4dCgpLHRoaXMuX29uKHRoaXMuZG9jdW1lbnQse21vdXNlZG93bjpcIl9jbG9zZU9uQ2xpY2tPdXRzaWRlXCJ9KX0sX3Jlc2l6ZU1lbnU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm1lbnUuZWxlbWVudDt0Lm91dGVyV2lkdGgoTWF0aC5tYXgodC53aWR0aChcIlwiKS5vdXRlcldpZHRoKCkrMSx0aGlzLmVsZW1lbnQub3V0ZXJXaWR0aCgpKSl9LF9yZW5kZXJNZW51OmZ1bmN0aW9uKGUsaSl7dmFyIHM9dGhpczt0LmVhY2goaSxmdW5jdGlvbih0LGkpe3MuX3JlbmRlckl0ZW1EYXRhKGUsaSl9KX0sX3JlbmRlckl0ZW1EYXRhOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuX3JlbmRlckl0ZW0odCxlKS5kYXRhKFwidWktYXV0b2NvbXBsZXRlLWl0ZW1cIixlKX0sX3JlbmRlckl0ZW06ZnVuY3Rpb24oZSxpKXtyZXR1cm4gdChcIjxsaT5cIikuYXBwZW5kKHQoXCI8ZGl2PlwiKS50ZXh0KGkubGFiZWwpKS5hcHBlbmRUbyhlKX0sX21vdmU6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5tZW51LmVsZW1lbnQuaXMoXCI6dmlzaWJsZVwiKT90aGlzLm1lbnUuaXNGaXJzdEl0ZW0oKSYmL15wcmV2aW91cy8udGVzdCh0KXx8dGhpcy5tZW51LmlzTGFzdEl0ZW0oKSYmL15uZXh0Ly50ZXN0KHQpPyh0aGlzLmlzTXVsdGlMaW5lfHx0aGlzLl92YWx1ZSh0aGlzLnRlcm0pLHRoaXMubWVudS5ibHVyKCksdm9pZCAwKToodGhpcy5tZW51W3RdKGUpLHZvaWQgMCk6KHRoaXMuc2VhcmNoKG51bGwsZSksdm9pZCAwKX0sd2lkZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubWVudS5lbGVtZW50fSxfdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52YWx1ZU1ldGhvZC5hcHBseSh0aGlzLmVsZW1lbnQsYXJndW1lbnRzKX0sX2tleUV2ZW50OmZ1bmN0aW9uKHQsZSl7KCF0aGlzLmlzTXVsdGlMaW5lfHx0aGlzLm1lbnUuZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpKSYmKHRoaXMuX21vdmUodCxlKSxlLnByZXZlbnREZWZhdWx0KCkpfSxfaXNDb250ZW50RWRpdGFibGU6ZnVuY3Rpb24odCl7aWYoIXQubGVuZ3RoKXJldHVybiExO3ZhciBlPXQucHJvcChcImNvbnRlbnRFZGl0YWJsZVwiKTtyZXR1cm5cImluaGVyaXRcIj09PWU/dGhpcy5faXNDb250ZW50RWRpdGFibGUodC5wYXJlbnQoKSk6XCJ0cnVlXCI9PT1lfX0pLHQuZXh0ZW5kKHQudWkuYXV0b2NvbXBsZXRlLHtlc2NhcGVSZWdleDpmdW5jdGlvbih0KXtyZXR1cm4gdC5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSorPy4sXFxcXFxcXiR8I1xcc10vZyxcIlxcXFwkJlwiKX0sZmlsdGVyOmZ1bmN0aW9uKGUsaSl7dmFyIHM9UmVnRXhwKHQudWkuYXV0b2NvbXBsZXRlLmVzY2FwZVJlZ2V4KGkpLFwiaVwiKTtyZXR1cm4gdC5ncmVwKGUsZnVuY3Rpb24odCl7cmV0dXJuIHMudGVzdCh0LmxhYmVsfHx0LnZhbHVlfHx0KX0pfX0pLHQud2lkZ2V0KFwidWkuYXV0b2NvbXBsZXRlXCIsdC51aS5hdXRvY29tcGxldGUse29wdGlvbnM6e21lc3NhZ2VzOntub1Jlc3VsdHM6XCJObyBzZWFyY2ggcmVzdWx0cy5cIixyZXN1bHRzOmZ1bmN0aW9uKHQpe3JldHVybiB0Kyh0PjE/XCIgcmVzdWx0cyBhcmVcIjpcIiByZXN1bHQgaXNcIikrXCIgYXZhaWxhYmxlLCB1c2UgdXAgYW5kIGRvd24gYXJyb3cga2V5cyB0byBuYXZpZ2F0ZS5cIn19fSxfX3Jlc3BvbnNlOmZ1bmN0aW9uKGUpe3ZhciBpO3RoaXMuX3N1cGVyQXBwbHkoYXJndW1lbnRzKSx0aGlzLm9wdGlvbnMuZGlzYWJsZWR8fHRoaXMuY2FuY2VsU2VhcmNofHwoaT1lJiZlLmxlbmd0aD90aGlzLm9wdGlvbnMubWVzc2FnZXMucmVzdWx0cyhlLmxlbmd0aCk6dGhpcy5vcHRpb25zLm1lc3NhZ2VzLm5vUmVzdWx0cyx0aGlzLmxpdmVSZWdpb24uY2hpbGRyZW4oKS5oaWRlKCksdChcIjxkaXY+XCIpLnRleHQoaSkuYXBwZW5kVG8odGhpcy5saXZlUmVnaW9uKSl9fSksdC51aS5hdXRvY29tcGxldGUsdC5leHRlbmQodC51aSx7ZGF0ZXBpY2tlcjp7dmVyc2lvbjpcIjEuMTIuMVwifX0pO3ZhciBsO3QuZXh0ZW5kKGkucHJvdG90eXBlLHttYXJrZXJDbGFzc05hbWU6XCJoYXNEYXRlcGlja2VyXCIsbWF4Um93czo0LF93aWRnZXREYXRlcGlja2VyOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZHBEaXZ9LHNldERlZmF1bHRzOmZ1bmN0aW9uKHQpe3JldHVybiBvKHRoaXMuX2RlZmF1bHRzLHR8fHt9KSx0aGlzfSxfYXR0YWNoRGF0ZXBpY2tlcjpmdW5jdGlvbihlLGkpe3ZhciBzLG4sbztzPWUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxuPVwiZGl2XCI9PT1zfHxcInNwYW5cIj09PXMsZS5pZHx8KHRoaXMudXVpZCs9MSxlLmlkPVwiZHBcIit0aGlzLnV1aWQpLG89dGhpcy5fbmV3SW5zdCh0KGUpLG4pLG8uc2V0dGluZ3M9dC5leHRlbmQoe30saXx8e30pLFwiaW5wdXRcIj09PXM/dGhpcy5fY29ubmVjdERhdGVwaWNrZXIoZSxvKTpuJiZ0aGlzLl9pbmxpbmVEYXRlcGlja2VyKGUsbyl9LF9uZXdJbnN0OmZ1bmN0aW9uKGUsaSl7dmFyIG49ZVswXS5pZC5yZXBsYWNlKC8oW15BLVphLXowLTlfXFwtXSkvZyxcIlxcXFxcXFxcJDFcIik7cmV0dXJue2lkOm4saW5wdXQ6ZSxzZWxlY3RlZERheTowLHNlbGVjdGVkTW9udGg6MCxzZWxlY3RlZFllYXI6MCxkcmF3TW9udGg6MCxkcmF3WWVhcjowLGlubGluZTppLGRwRGl2Omk/cyh0KFwiPGRpdiBjbGFzcz0nXCIrdGhpcy5faW5saW5lQ2xhc3MrXCIgdWktZGF0ZXBpY2tlciB1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnQgdWktaGVscGVyLWNsZWFyZml4IHVpLWNvcm5lci1hbGwnPjwvZGl2PlwiKSk6dGhpcy5kcERpdn19LF9jb25uZWN0RGF0ZXBpY2tlcjpmdW5jdGlvbihlLGkpe3ZhciBzPXQoZSk7aS5hcHBlbmQ9dChbXSksaS50cmlnZ2VyPXQoW10pLHMuaGFzQ2xhc3ModGhpcy5tYXJrZXJDbGFzc05hbWUpfHwodGhpcy5fYXR0YWNobWVudHMocyxpKSxzLmFkZENsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKS5vbihcImtleWRvd25cIix0aGlzLl9kb0tleURvd24pLm9uKFwia2V5cHJlc3NcIix0aGlzLl9kb0tleVByZXNzKS5vbihcImtleXVwXCIsdGhpcy5fZG9LZXlVcCksdGhpcy5fYXV0b1NpemUoaSksdC5kYXRhKGUsXCJkYXRlcGlja2VyXCIsaSksaS5zZXR0aW5ncy5kaXNhYmxlZCYmdGhpcy5fZGlzYWJsZURhdGVwaWNrZXIoZSkpfSxfYXR0YWNobWVudHM6ZnVuY3Rpb24oZSxpKXt2YXIgcyxuLG8sYT10aGlzLl9nZXQoaSxcImFwcGVuZFRleHRcIikscj10aGlzLl9nZXQoaSxcImlzUlRMXCIpO2kuYXBwZW5kJiZpLmFwcGVuZC5yZW1vdmUoKSxhJiYoaS5hcHBlbmQ9dChcIjxzcGFuIGNsYXNzPSdcIit0aGlzLl9hcHBlbmRDbGFzcytcIic+XCIrYStcIjwvc3Bhbj5cIiksZVtyP1wiYmVmb3JlXCI6XCJhZnRlclwiXShpLmFwcGVuZCkpLGUub2ZmKFwiZm9jdXNcIix0aGlzLl9zaG93RGF0ZXBpY2tlciksaS50cmlnZ2VyJiZpLnRyaWdnZXIucmVtb3ZlKCkscz10aGlzLl9nZXQoaSxcInNob3dPblwiKSwoXCJmb2N1c1wiPT09c3x8XCJib3RoXCI9PT1zKSYmZS5vbihcImZvY3VzXCIsdGhpcy5fc2hvd0RhdGVwaWNrZXIpLChcImJ1dHRvblwiPT09c3x8XCJib3RoXCI9PT1zKSYmKG49dGhpcy5fZ2V0KGksXCJidXR0b25UZXh0XCIpLG89dGhpcy5fZ2V0KGksXCJidXR0b25JbWFnZVwiKSxpLnRyaWdnZXI9dCh0aGlzLl9nZXQoaSxcImJ1dHRvbkltYWdlT25seVwiKT90KFwiPGltZy8+XCIpLmFkZENsYXNzKHRoaXMuX3RyaWdnZXJDbGFzcykuYXR0cih7c3JjOm8sYWx0Om4sdGl0bGU6bn0pOnQoXCI8YnV0dG9uIHR5cGU9J2J1dHRvbic+PC9idXR0b24+XCIpLmFkZENsYXNzKHRoaXMuX3RyaWdnZXJDbGFzcykuaHRtbChvP3QoXCI8aW1nLz5cIikuYXR0cih7c3JjOm8sYWx0Om4sdGl0bGU6bn0pOm4pKSxlW3I/XCJiZWZvcmVcIjpcImFmdGVyXCJdKGkudHJpZ2dlciksaS50cmlnZ2VyLm9uKFwiY2xpY2tcIixmdW5jdGlvbigpe3JldHVybiB0LmRhdGVwaWNrZXIuX2RhdGVwaWNrZXJTaG93aW5nJiZ0LmRhdGVwaWNrZXIuX2xhc3RJbnB1dD09PWVbMF0/dC5kYXRlcGlja2VyLl9oaWRlRGF0ZXBpY2tlcigpOnQuZGF0ZXBpY2tlci5fZGF0ZXBpY2tlclNob3dpbmcmJnQuZGF0ZXBpY2tlci5fbGFzdElucHV0IT09ZVswXT8odC5kYXRlcGlja2VyLl9oaWRlRGF0ZXBpY2tlcigpLHQuZGF0ZXBpY2tlci5fc2hvd0RhdGVwaWNrZXIoZVswXSkpOnQuZGF0ZXBpY2tlci5fc2hvd0RhdGVwaWNrZXIoZVswXSksITF9KSl9LF9hdXRvU2l6ZTpmdW5jdGlvbih0KXtpZih0aGlzLl9nZXQodCxcImF1dG9TaXplXCIpJiYhdC5pbmxpbmUpe3ZhciBlLGkscyxuLG89bmV3IERhdGUoMjAwOSwxMSwyMCksYT10aGlzLl9nZXQodCxcImRhdGVGb3JtYXRcIik7YS5tYXRjaCgvW0RNXS8pJiYoZT1mdW5jdGlvbih0KXtmb3IoaT0wLHM9MCxuPTA7dC5sZW5ndGg+bjtuKyspdFtuXS5sZW5ndGg+aSYmKGk9dFtuXS5sZW5ndGgscz1uKTtyZXR1cm4gc30sby5zZXRNb250aChlKHRoaXMuX2dldCh0LGEubWF0Y2goL01NLyk/XCJtb250aE5hbWVzXCI6XCJtb250aE5hbWVzU2hvcnRcIikpKSxvLnNldERhdGUoZSh0aGlzLl9nZXQodCxhLm1hdGNoKC9ERC8pP1wiZGF5TmFtZXNcIjpcImRheU5hbWVzU2hvcnRcIikpKzIwLW8uZ2V0RGF5KCkpKSx0LmlucHV0LmF0dHIoXCJzaXplXCIsdGhpcy5fZm9ybWF0RGF0ZSh0LG8pLmxlbmd0aCl9fSxfaW5saW5lRGF0ZXBpY2tlcjpmdW5jdGlvbihlLGkpe3ZhciBzPXQoZSk7cy5oYXNDbGFzcyh0aGlzLm1hcmtlckNsYXNzTmFtZSl8fChzLmFkZENsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKS5hcHBlbmQoaS5kcERpdiksdC5kYXRhKGUsXCJkYXRlcGlja2VyXCIsaSksdGhpcy5fc2V0RGF0ZShpLHRoaXMuX2dldERlZmF1bHREYXRlKGkpLCEwKSx0aGlzLl91cGRhdGVEYXRlcGlja2VyKGkpLHRoaXMuX3VwZGF0ZUFsdGVybmF0ZShpKSxpLnNldHRpbmdzLmRpc2FibGVkJiZ0aGlzLl9kaXNhYmxlRGF0ZXBpY2tlcihlKSxpLmRwRGl2LmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpKX0sX2RpYWxvZ0RhdGVwaWNrZXI6ZnVuY3Rpb24oZSxpLHMsbixhKXt2YXIgcixsLGgsYyx1LGQ9dGhpcy5fZGlhbG9nSW5zdDtyZXR1cm4gZHx8KHRoaXMudXVpZCs9MSxyPVwiZHBcIit0aGlzLnV1aWQsdGhpcy5fZGlhbG9nSW5wdXQ9dChcIjxpbnB1dCB0eXBlPSd0ZXh0JyBpZD0nXCIrcitcIicgc3R5bGU9J3Bvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAtMTAwcHg7IHdpZHRoOiAwcHg7Jy8+XCIpLHRoaXMuX2RpYWxvZ0lucHV0Lm9uKFwia2V5ZG93blwiLHRoaXMuX2RvS2V5RG93biksdChcImJvZHlcIikuYXBwZW5kKHRoaXMuX2RpYWxvZ0lucHV0KSxkPXRoaXMuX2RpYWxvZ0luc3Q9dGhpcy5fbmV3SW5zdCh0aGlzLl9kaWFsb2dJbnB1dCwhMSksZC5zZXR0aW5ncz17fSx0LmRhdGEodGhpcy5fZGlhbG9nSW5wdXRbMF0sXCJkYXRlcGlja2VyXCIsZCkpLG8oZC5zZXR0aW5ncyxufHx7fSksaT1pJiZpLmNvbnN0cnVjdG9yPT09RGF0ZT90aGlzLl9mb3JtYXREYXRlKGQsaSk6aSx0aGlzLl9kaWFsb2dJbnB1dC52YWwoaSksdGhpcy5fcG9zPWE/YS5sZW5ndGg/YTpbYS5wYWdlWCxhLnBhZ2VZXTpudWxsLHRoaXMuX3Bvc3x8KGw9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLGg9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCxjPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0fHxkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQsdT1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wfHxkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCx0aGlzLl9wb3M9W2wvMi0xMDArYyxoLzItMTUwK3VdKSx0aGlzLl9kaWFsb2dJbnB1dC5jc3MoXCJsZWZ0XCIsdGhpcy5fcG9zWzBdKzIwK1wicHhcIikuY3NzKFwidG9wXCIsdGhpcy5fcG9zWzFdK1wicHhcIiksZC5zZXR0aW5ncy5vblNlbGVjdD1zLHRoaXMuX2luRGlhbG9nPSEwLHRoaXMuZHBEaXYuYWRkQ2xhc3ModGhpcy5fZGlhbG9nQ2xhc3MpLHRoaXMuX3Nob3dEYXRlcGlja2VyKHRoaXMuX2RpYWxvZ0lucHV0WzBdKSx0LmJsb2NrVUkmJnQuYmxvY2tVSSh0aGlzLmRwRGl2KSx0LmRhdGEodGhpcy5fZGlhbG9nSW5wdXRbMF0sXCJkYXRlcGlja2VyXCIsZCksdGhpc30sX2Rlc3Ryb3lEYXRlcGlja2VyOmZ1bmN0aW9uKGUpe3ZhciBpLHM9dChlKSxuPXQuZGF0YShlLFwiZGF0ZXBpY2tlclwiKTtzLmhhc0NsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKSYmKGk9ZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLHQucmVtb3ZlRGF0YShlLFwiZGF0ZXBpY2tlclwiKSxcImlucHV0XCI9PT1pPyhuLmFwcGVuZC5yZW1vdmUoKSxuLnRyaWdnZXIucmVtb3ZlKCkscy5yZW1vdmVDbGFzcyh0aGlzLm1hcmtlckNsYXNzTmFtZSkub2ZmKFwiZm9jdXNcIix0aGlzLl9zaG93RGF0ZXBpY2tlcikub2ZmKFwia2V5ZG93blwiLHRoaXMuX2RvS2V5RG93bikub2ZmKFwia2V5cHJlc3NcIix0aGlzLl9kb0tleVByZXNzKS5vZmYoXCJrZXl1cFwiLHRoaXMuX2RvS2V5VXApKTooXCJkaXZcIj09PWl8fFwic3BhblwiPT09aSkmJnMucmVtb3ZlQ2xhc3ModGhpcy5tYXJrZXJDbGFzc05hbWUpLmVtcHR5KCksbD09PW4mJihsPW51bGwpKX0sX2VuYWJsZURhdGVwaWNrZXI6ZnVuY3Rpb24oZSl7dmFyIGkscyxuPXQoZSksbz10LmRhdGEoZSxcImRhdGVwaWNrZXJcIik7bi5oYXNDbGFzcyh0aGlzLm1hcmtlckNsYXNzTmFtZSkmJihpPWUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcImlucHV0XCI9PT1pPyhlLmRpc2FibGVkPSExLG8udHJpZ2dlci5maWx0ZXIoXCJidXR0b25cIikuZWFjaChmdW5jdGlvbigpe3RoaXMuZGlzYWJsZWQ9ITF9KS5lbmQoKS5maWx0ZXIoXCJpbWdcIikuY3NzKHtvcGFjaXR5OlwiMS4wXCIsY3Vyc29yOlwiXCJ9KSk6KFwiZGl2XCI9PT1pfHxcInNwYW5cIj09PWkpJiYocz1uLmNoaWxkcmVuKFwiLlwiK3RoaXMuX2lubGluZUNsYXNzKSxzLmNoaWxkcmVuKCkucmVtb3ZlQ2xhc3MoXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiKSxzLmZpbmQoXCJzZWxlY3QudWktZGF0ZXBpY2tlci1tb250aCwgc2VsZWN0LnVpLWRhdGVwaWNrZXIteWVhclwiKS5wcm9wKFwiZGlzYWJsZWRcIiwhMSkpLHRoaXMuX2Rpc2FibGVkSW5wdXRzPXQubWFwKHRoaXMuX2Rpc2FibGVkSW5wdXRzLGZ1bmN0aW9uKHQpe3JldHVybiB0PT09ZT9udWxsOnR9KSl9LF9kaXNhYmxlRGF0ZXBpY2tlcjpmdW5jdGlvbihlKXt2YXIgaSxzLG49dChlKSxvPXQuZGF0YShlLFwiZGF0ZXBpY2tlclwiKTtuLmhhc0NsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKSYmKGk9ZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLFwiaW5wdXRcIj09PWk/KGUuZGlzYWJsZWQ9ITAsby50cmlnZ2VyLmZpbHRlcihcImJ1dHRvblwiKS5lYWNoKGZ1bmN0aW9uKCl7dGhpcy5kaXNhYmxlZD0hMH0pLmVuZCgpLmZpbHRlcihcImltZ1wiKS5jc3Moe29wYWNpdHk6XCIwLjVcIixjdXJzb3I6XCJkZWZhdWx0XCJ9KSk6KFwiZGl2XCI9PT1pfHxcInNwYW5cIj09PWkpJiYocz1uLmNoaWxkcmVuKFwiLlwiK3RoaXMuX2lubGluZUNsYXNzKSxzLmNoaWxkcmVuKCkuYWRkQ2xhc3MoXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiKSxzLmZpbmQoXCJzZWxlY3QudWktZGF0ZXBpY2tlci1tb250aCwgc2VsZWN0LnVpLWRhdGVwaWNrZXIteWVhclwiKS5wcm9wKFwiZGlzYWJsZWRcIiwhMCkpLHRoaXMuX2Rpc2FibGVkSW5wdXRzPXQubWFwKHRoaXMuX2Rpc2FibGVkSW5wdXRzLGZ1bmN0aW9uKHQpe3JldHVybiB0PT09ZT9udWxsOnR9KSx0aGlzLl9kaXNhYmxlZElucHV0c1t0aGlzLl9kaXNhYmxlZElucHV0cy5sZW5ndGhdPWUpfSxfaXNEaXNhYmxlZERhdGVwaWNrZXI6ZnVuY3Rpb24odCl7aWYoIXQpcmV0dXJuITE7Zm9yKHZhciBlPTA7dGhpcy5fZGlzYWJsZWRJbnB1dHMubGVuZ3RoPmU7ZSsrKWlmKHRoaXMuX2Rpc2FibGVkSW5wdXRzW2VdPT09dClyZXR1cm4hMDtyZXR1cm4hMX0sX2dldEluc3Q6ZnVuY3Rpb24oZSl7dHJ5e3JldHVybiB0LmRhdGEoZSxcImRhdGVwaWNrZXJcIil9Y2F0Y2goaSl7dGhyb3dcIk1pc3NpbmcgaW5zdGFuY2UgZGF0YSBmb3IgdGhpcyBkYXRlcGlja2VyXCJ9fSxfb3B0aW9uRGF0ZXBpY2tlcjpmdW5jdGlvbihlLGkscyl7dmFyIG4sYSxyLGwsaD10aGlzLl9nZXRJbnN0KGUpO3JldHVybiAyPT09YXJndW1lbnRzLmxlbmd0aCYmXCJzdHJpbmdcIj09dHlwZW9mIGk/XCJkZWZhdWx0c1wiPT09aT90LmV4dGVuZCh7fSx0LmRhdGVwaWNrZXIuX2RlZmF1bHRzKTpoP1wiYWxsXCI9PT1pP3QuZXh0ZW5kKHt9LGguc2V0dGluZ3MpOnRoaXMuX2dldChoLGkpOm51bGw6KG49aXx8e30sXCJzdHJpbmdcIj09dHlwZW9mIGkmJihuPXt9LG5baV09cyksaCYmKHRoaXMuX2N1ckluc3Q9PT1oJiZ0aGlzLl9oaWRlRGF0ZXBpY2tlcigpLGE9dGhpcy5fZ2V0RGF0ZURhdGVwaWNrZXIoZSwhMCkscj10aGlzLl9nZXRNaW5NYXhEYXRlKGgsXCJtaW5cIiksbD10aGlzLl9nZXRNaW5NYXhEYXRlKGgsXCJtYXhcIiksbyhoLnNldHRpbmdzLG4pLG51bGwhPT1yJiZ2b2lkIDAhPT1uLmRhdGVGb3JtYXQmJnZvaWQgMD09PW4ubWluRGF0ZSYmKGguc2V0dGluZ3MubWluRGF0ZT10aGlzLl9mb3JtYXREYXRlKGgscikpLG51bGwhPT1sJiZ2b2lkIDAhPT1uLmRhdGVGb3JtYXQmJnZvaWQgMD09PW4ubWF4RGF0ZSYmKGguc2V0dGluZ3MubWF4RGF0ZT10aGlzLl9mb3JtYXREYXRlKGgsbCkpLFwiZGlzYWJsZWRcImluIG4mJihuLmRpc2FibGVkP3RoaXMuX2Rpc2FibGVEYXRlcGlja2VyKGUpOnRoaXMuX2VuYWJsZURhdGVwaWNrZXIoZSkpLHRoaXMuX2F0dGFjaG1lbnRzKHQoZSksaCksdGhpcy5fYXV0b1NpemUoaCksdGhpcy5fc2V0RGF0ZShoLGEpLHRoaXMuX3VwZGF0ZUFsdGVybmF0ZShoKSx0aGlzLl91cGRhdGVEYXRlcGlja2VyKGgpKSx2b2lkIDApfSxfY2hhbmdlRGF0ZXBpY2tlcjpmdW5jdGlvbih0LGUsaSl7dGhpcy5fb3B0aW9uRGF0ZXBpY2tlcih0LGUsaSl9LF9yZWZyZXNoRGF0ZXBpY2tlcjpmdW5jdGlvbih0KXt2YXIgZT10aGlzLl9nZXRJbnN0KHQpO2UmJnRoaXMuX3VwZGF0ZURhdGVwaWNrZXIoZSl9LF9zZXREYXRlRGF0ZXBpY2tlcjpmdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2dldEluc3QodCk7aSYmKHRoaXMuX3NldERhdGUoaSxlKSx0aGlzLl91cGRhdGVEYXRlcGlja2VyKGkpLHRoaXMuX3VwZGF0ZUFsdGVybmF0ZShpKSl9LF9nZXREYXRlRGF0ZXBpY2tlcjpmdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2dldEluc3QodCk7cmV0dXJuIGkmJiFpLmlubGluZSYmdGhpcy5fc2V0RGF0ZUZyb21GaWVsZChpLGUpLGk/dGhpcy5fZ2V0RGF0ZShpKTpudWxsfSxfZG9LZXlEb3duOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbixvPXQuZGF0ZXBpY2tlci5fZ2V0SW5zdChlLnRhcmdldCksYT0hMCxyPW8uZHBEaXYuaXMoXCIudWktZGF0ZXBpY2tlci1ydGxcIik7aWYoby5fa2V5RXZlbnQ9ITAsdC5kYXRlcGlja2VyLl9kYXRlcGlja2VyU2hvd2luZylzd2l0Y2goZS5rZXlDb2RlKXtjYXNlIDk6dC5kYXRlcGlja2VyLl9oaWRlRGF0ZXBpY2tlcigpLGE9ITE7YnJlYWs7Y2FzZSAxMzpyZXR1cm4gbj10KFwidGQuXCIrdC5kYXRlcGlja2VyLl9kYXlPdmVyQ2xhc3MrXCI6bm90KC5cIit0LmRhdGVwaWNrZXIuX2N1cnJlbnRDbGFzcytcIilcIixvLmRwRGl2KSxuWzBdJiZ0LmRhdGVwaWNrZXIuX3NlbGVjdERheShlLnRhcmdldCxvLnNlbGVjdGVkTW9udGgsby5zZWxlY3RlZFllYXIsblswXSksaT10LmRhdGVwaWNrZXIuX2dldChvLFwib25TZWxlY3RcIiksaT8ocz10LmRhdGVwaWNrZXIuX2Zvcm1hdERhdGUobyksaS5hcHBseShvLmlucHV0P28uaW5wdXRbMF06bnVsbCxbcyxvXSkpOnQuZGF0ZXBpY2tlci5faGlkZURhdGVwaWNrZXIoKSwhMTtjYXNlIDI3OnQuZGF0ZXBpY2tlci5faGlkZURhdGVwaWNrZXIoKTticmVhaztjYXNlIDMzOnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCxlLmN0cmxLZXk/LXQuZGF0ZXBpY2tlci5fZ2V0KG8sXCJzdGVwQmlnTW9udGhzXCIpOi10LmRhdGVwaWNrZXIuX2dldChvLFwic3RlcE1vbnRoc1wiKSxcIk1cIik7YnJlYWs7Y2FzZSAzNDp0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUoZS50YXJnZXQsZS5jdHJsS2V5Pyt0LmRhdGVwaWNrZXIuX2dldChvLFwic3RlcEJpZ01vbnRoc1wiKTordC5kYXRlcGlja2VyLl9nZXQobyxcInN0ZXBNb250aHNcIiksXCJNXCIpO2JyZWFrO2Nhc2UgMzU6KGUuY3RybEtleXx8ZS5tZXRhS2V5KSYmdC5kYXRlcGlja2VyLl9jbGVhckRhdGUoZS50YXJnZXQpLGE9ZS5jdHJsS2V5fHxlLm1ldGFLZXk7YnJlYWs7Y2FzZSAzNjooZS5jdHJsS2V5fHxlLm1ldGFLZXkpJiZ0LmRhdGVwaWNrZXIuX2dvdG9Ub2RheShlLnRhcmdldCksYT1lLmN0cmxLZXl8fGUubWV0YUtleTticmVhaztjYXNlIDM3OihlLmN0cmxLZXl8fGUubWV0YUtleSkmJnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCxyPzE6LTEsXCJEXCIpLGE9ZS5jdHJsS2V5fHxlLm1ldGFLZXksZS5vcmlnaW5hbEV2ZW50LmFsdEtleSYmdC5kYXRlcGlja2VyLl9hZGp1c3REYXRlKGUudGFyZ2V0LGUuY3RybEtleT8tdC5kYXRlcGlja2VyLl9nZXQobyxcInN0ZXBCaWdNb250aHNcIik6LXQuZGF0ZXBpY2tlci5fZ2V0KG8sXCJzdGVwTW9udGhzXCIpLFwiTVwiKTticmVhaztjYXNlIDM4OihlLmN0cmxLZXl8fGUubWV0YUtleSkmJnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCwtNyxcIkRcIiksYT1lLmN0cmxLZXl8fGUubWV0YUtleTticmVhaztjYXNlIDM5OihlLmN0cmxLZXl8fGUubWV0YUtleSkmJnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCxyPy0xOjEsXCJEXCIpLGE9ZS5jdHJsS2V5fHxlLm1ldGFLZXksZS5vcmlnaW5hbEV2ZW50LmFsdEtleSYmdC5kYXRlcGlja2VyLl9hZGp1c3REYXRlKGUudGFyZ2V0LGUuY3RybEtleT8rdC5kYXRlcGlja2VyLl9nZXQobyxcInN0ZXBCaWdNb250aHNcIik6K3QuZGF0ZXBpY2tlci5fZ2V0KG8sXCJzdGVwTW9udGhzXCIpLFwiTVwiKTticmVhaztjYXNlIDQwOihlLmN0cmxLZXl8fGUubWV0YUtleSkmJnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCw3LFwiRFwiKSxhPWUuY3RybEtleXx8ZS5tZXRhS2V5O2JyZWFrO2RlZmF1bHQ6YT0hMX1lbHNlIDM2PT09ZS5rZXlDb2RlJiZlLmN0cmxLZXk/dC5kYXRlcGlja2VyLl9zaG93RGF0ZXBpY2tlcih0aGlzKTphPSExO2EmJihlLnByZXZlbnREZWZhdWx0KCksZS5zdG9wUHJvcGFnYXRpb24oKSl9LF9kb0tleVByZXNzOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbj10LmRhdGVwaWNrZXIuX2dldEluc3QoZS50YXJnZXQpO3JldHVybiB0LmRhdGVwaWNrZXIuX2dldChuLFwiY29uc3RyYWluSW5wdXRcIik/KGk9dC5kYXRlcGlja2VyLl9wb3NzaWJsZUNoYXJzKHQuZGF0ZXBpY2tlci5fZ2V0KG4sXCJkYXRlRm9ybWF0XCIpKSxzPVN0cmluZy5mcm9tQ2hhckNvZGUobnVsbD09ZS5jaGFyQ29kZT9lLmtleUNvZGU6ZS5jaGFyQ29kZSksZS5jdHJsS2V5fHxlLm1ldGFLZXl8fFwiIFwiPnN8fCFpfHxpLmluZGV4T2Yocyk+LTEpOnZvaWQgMH0sX2RvS2V5VXA6ZnVuY3Rpb24oZSl7dmFyIGkscz10LmRhdGVwaWNrZXIuX2dldEluc3QoZS50YXJnZXQpO2lmKHMuaW5wdXQudmFsKCkhPT1zLmxhc3RWYWwpdHJ5e2k9dC5kYXRlcGlja2VyLnBhcnNlRGF0ZSh0LmRhdGVwaWNrZXIuX2dldChzLFwiZGF0ZUZvcm1hdFwiKSxzLmlucHV0P3MuaW5wdXQudmFsKCk6bnVsbCx0LmRhdGVwaWNrZXIuX2dldEZvcm1hdENvbmZpZyhzKSksaSYmKHQuZGF0ZXBpY2tlci5fc2V0RGF0ZUZyb21GaWVsZChzKSx0LmRhdGVwaWNrZXIuX3VwZGF0ZUFsdGVybmF0ZShzKSx0LmRhdGVwaWNrZXIuX3VwZGF0ZURhdGVwaWNrZXIocykpfWNhdGNoKG4pe31yZXR1cm4hMH0sX3Nob3dEYXRlcGlja2VyOmZ1bmN0aW9uKGkpe2lmKGk9aS50YXJnZXR8fGksXCJpbnB1dFwiIT09aS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpJiYoaT10KFwiaW5wdXRcIixpLnBhcmVudE5vZGUpWzBdKSwhdC5kYXRlcGlja2VyLl9pc0Rpc2FibGVkRGF0ZXBpY2tlcihpKSYmdC5kYXRlcGlja2VyLl9sYXN0SW5wdXQhPT1pKXt2YXIgcyxuLGEscixsLGgsYztzPXQuZGF0ZXBpY2tlci5fZ2V0SW5zdChpKSx0LmRhdGVwaWNrZXIuX2N1ckluc3QmJnQuZGF0ZXBpY2tlci5fY3VySW5zdCE9PXMmJih0LmRhdGVwaWNrZXIuX2N1ckluc3QuZHBEaXYuc3RvcCghMCwhMCkscyYmdC5kYXRlcGlja2VyLl9kYXRlcGlja2VyU2hvd2luZyYmdC5kYXRlcGlja2VyLl9oaWRlRGF0ZXBpY2tlcih0LmRhdGVwaWNrZXIuX2N1ckluc3QuaW5wdXRbMF0pKSxuPXQuZGF0ZXBpY2tlci5fZ2V0KHMsXCJiZWZvcmVTaG93XCIpLGE9bj9uLmFwcGx5KGksW2ksc10pOnt9LGEhPT0hMSYmKG8ocy5zZXR0aW5ncyxhKSxzLmxhc3RWYWw9bnVsbCx0LmRhdGVwaWNrZXIuX2xhc3RJbnB1dD1pLHQuZGF0ZXBpY2tlci5fc2V0RGF0ZUZyb21GaWVsZChzKSx0LmRhdGVwaWNrZXIuX2luRGlhbG9nJiYoaS52YWx1ZT1cIlwiKSx0LmRhdGVwaWNrZXIuX3Bvc3x8KHQuZGF0ZXBpY2tlci5fcG9zPXQuZGF0ZXBpY2tlci5fZmluZFBvcyhpKSx0LmRhdGVwaWNrZXIuX3Bvc1sxXSs9aS5vZmZzZXRIZWlnaHQpLHI9ITEsdChpKS5wYXJlbnRzKCkuZWFjaChmdW5jdGlvbigpe3JldHVybiByfD1cImZpeGVkXCI9PT10KHRoaXMpLmNzcyhcInBvc2l0aW9uXCIpLCFyfSksbD17bGVmdDp0LmRhdGVwaWNrZXIuX3Bvc1swXSx0b3A6dC5kYXRlcGlja2VyLl9wb3NbMV19LHQuZGF0ZXBpY2tlci5fcG9zPW51bGwscy5kcERpdi5lbXB0eSgpLHMuZHBEaXYuY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsZGlzcGxheTpcImJsb2NrXCIsdG9wOlwiLTEwMDBweFwifSksdC5kYXRlcGlja2VyLl91cGRhdGVEYXRlcGlja2VyKHMpLGw9dC5kYXRlcGlja2VyLl9jaGVja09mZnNldChzLGwscikscy5kcERpdi5jc3Moe3Bvc2l0aW9uOnQuZGF0ZXBpY2tlci5faW5EaWFsb2cmJnQuYmxvY2tVST9cInN0YXRpY1wiOnI/XCJmaXhlZFwiOlwiYWJzb2x1dGVcIixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6bC5sZWZ0K1wicHhcIix0b3A6bC50b3ArXCJweFwifSkscy5pbmxpbmV8fChoPXQuZGF0ZXBpY2tlci5fZ2V0KHMsXCJzaG93QW5pbVwiKSxjPXQuZGF0ZXBpY2tlci5fZ2V0KHMsXCJkdXJhdGlvblwiKSxzLmRwRGl2LmNzcyhcInotaW5kZXhcIixlKHQoaSkpKzEpLHQuZGF0ZXBpY2tlci5fZGF0ZXBpY2tlclNob3dpbmc9ITAsdC5lZmZlY3RzJiZ0LmVmZmVjdHMuZWZmZWN0W2hdP3MuZHBEaXYuc2hvdyhoLHQuZGF0ZXBpY2tlci5fZ2V0KHMsXCJzaG93T3B0aW9uc1wiKSxjKTpzLmRwRGl2W2h8fFwic2hvd1wiXShoP2M6bnVsbCksdC5kYXRlcGlja2VyLl9zaG91bGRGb2N1c0lucHV0KHMpJiZzLmlucHV0LnRyaWdnZXIoXCJmb2N1c1wiKSx0LmRhdGVwaWNrZXIuX2N1ckluc3Q9cykpfX0sX3VwZGF0ZURhdGVwaWNrZXI6ZnVuY3Rpb24oZSl7dGhpcy5tYXhSb3dzPTQsbD1lLGUuZHBEaXYuZW1wdHkoKS5hcHBlbmQodGhpcy5fZ2VuZXJhdGVIVE1MKGUpKSx0aGlzLl9hdHRhY2hIYW5kbGVycyhlKTt2YXIgaSxzPXRoaXMuX2dldE51bWJlck9mTW9udGhzKGUpLG89c1sxXSxhPTE3LHI9ZS5kcERpdi5maW5kKFwiLlwiK3RoaXMuX2RheU92ZXJDbGFzcytcIiBhXCIpO3IubGVuZ3RoPjAmJm4uYXBwbHkoci5nZXQoMCkpLGUuZHBEaXYucmVtb3ZlQ2xhc3MoXCJ1aS1kYXRlcGlja2VyLW11bHRpLTIgdWktZGF0ZXBpY2tlci1tdWx0aS0zIHVpLWRhdGVwaWNrZXItbXVsdGktNFwiKS53aWR0aChcIlwiKSxvPjEmJmUuZHBEaXYuYWRkQ2xhc3MoXCJ1aS1kYXRlcGlja2VyLW11bHRpLVwiK28pLmNzcyhcIndpZHRoXCIsYSpvK1wiZW1cIiksZS5kcERpdlsoMSE9PXNbMF18fDEhPT1zWzFdP1wiYWRkXCI6XCJyZW1vdmVcIikrXCJDbGFzc1wiXShcInVpLWRhdGVwaWNrZXItbXVsdGlcIiksZS5kcERpdlsodGhpcy5fZ2V0KGUsXCJpc1JUTFwiKT9cImFkZFwiOlwicmVtb3ZlXCIpK1wiQ2xhc3NcIl0oXCJ1aS1kYXRlcGlja2VyLXJ0bFwiKSxlPT09dC5kYXRlcGlja2VyLl9jdXJJbnN0JiZ0LmRhdGVwaWNrZXIuX2RhdGVwaWNrZXJTaG93aW5nJiZ0LmRhdGVwaWNrZXIuX3Nob3VsZEZvY3VzSW5wdXQoZSkmJmUuaW5wdXQudHJpZ2dlcihcImZvY3VzXCIpLGUueWVhcnNodG1sJiYoaT1lLnllYXJzaHRtbCxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aT09PWUueWVhcnNodG1sJiZlLnllYXJzaHRtbCYmZS5kcERpdi5maW5kKFwic2VsZWN0LnVpLWRhdGVwaWNrZXIteWVhcjpmaXJzdFwiKS5yZXBsYWNlV2l0aChlLnllYXJzaHRtbCksaT1lLnllYXJzaHRtbD1udWxsfSwwKSl9LF9zaG91bGRGb2N1c0lucHV0OmZ1bmN0aW9uKHQpe3JldHVybiB0LmlucHV0JiZ0LmlucHV0LmlzKFwiOnZpc2libGVcIikmJiF0LmlucHV0LmlzKFwiOmRpc2FibGVkXCIpJiYhdC5pbnB1dC5pcyhcIjpmb2N1c1wiKX0sX2NoZWNrT2Zmc2V0OmZ1bmN0aW9uKGUsaSxzKXt2YXIgbj1lLmRwRGl2Lm91dGVyV2lkdGgoKSxvPWUuZHBEaXYub3V0ZXJIZWlnaHQoKSxhPWUuaW5wdXQ/ZS5pbnB1dC5vdXRlcldpZHRoKCk6MCxyPWUuaW5wdXQ/ZS5pbnB1dC5vdXRlckhlaWdodCgpOjAsbD1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgrKHM/MDp0KGRvY3VtZW50KS5zY3JvbGxMZWZ0KCkpLGg9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCsocz8wOnQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpKTtyZXR1cm4gaS5sZWZ0LT10aGlzLl9nZXQoZSxcImlzUlRMXCIpP24tYTowLGkubGVmdC09cyYmaS5sZWZ0PT09ZS5pbnB1dC5vZmZzZXQoKS5sZWZ0P3QoZG9jdW1lbnQpLnNjcm9sbExlZnQoKTowLGkudG9wLT1zJiZpLnRvcD09PWUuaW5wdXQub2Zmc2V0KCkudG9wK3I/dChkb2N1bWVudCkuc2Nyb2xsVG9wKCk6MCxpLmxlZnQtPU1hdGgubWluKGkubGVmdCxpLmxlZnQrbj5sJiZsPm4/TWF0aC5hYnMoaS5sZWZ0K24tbCk6MCksaS50b3AtPU1hdGgubWluKGkudG9wLGkudG9wK28+aCYmaD5vP01hdGguYWJzKG8rcik6MCksaX0sX2ZpbmRQb3M6ZnVuY3Rpb24oZSl7Zm9yKHZhciBpLHM9dGhpcy5fZ2V0SW5zdChlKSxuPXRoaXMuX2dldChzLFwiaXNSVExcIik7ZSYmKFwiaGlkZGVuXCI9PT1lLnR5cGV8fDEhPT1lLm5vZGVUeXBlfHx0LmV4cHIuZmlsdGVycy5oaWRkZW4oZSkpOyllPWVbbj9cInByZXZpb3VzU2libGluZ1wiOlwibmV4dFNpYmxpbmdcIl07cmV0dXJuIGk9dChlKS5vZmZzZXQoKSxbaS5sZWZ0LGkudG9wXX0sX2hpZGVEYXRlcGlja2VyOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbixvLGE9dGhpcy5fY3VySW5zdDshYXx8ZSYmYSE9PXQuZGF0YShlLFwiZGF0ZXBpY2tlclwiKXx8dGhpcy5fZGF0ZXBpY2tlclNob3dpbmcmJihpPXRoaXMuX2dldChhLFwic2hvd0FuaW1cIikscz10aGlzLl9nZXQoYSxcImR1cmF0aW9uXCIpLG49ZnVuY3Rpb24oKXt0LmRhdGVwaWNrZXIuX3RpZHlEaWFsb2coYSl9LHQuZWZmZWN0cyYmKHQuZWZmZWN0cy5lZmZlY3RbaV18fHQuZWZmZWN0c1tpXSk/YS5kcERpdi5oaWRlKGksdC5kYXRlcGlja2VyLl9nZXQoYSxcInNob3dPcHRpb25zXCIpLHMsbik6YS5kcERpdltcInNsaWRlRG93blwiPT09aT9cInNsaWRlVXBcIjpcImZhZGVJblwiPT09aT9cImZhZGVPdXRcIjpcImhpZGVcIl0oaT9zOm51bGwsbiksaXx8bigpLHRoaXMuX2RhdGVwaWNrZXJTaG93aW5nPSExLG89dGhpcy5fZ2V0KGEsXCJvbkNsb3NlXCIpLG8mJm8uYXBwbHkoYS5pbnB1dD9hLmlucHV0WzBdOm51bGwsW2EuaW5wdXQ/YS5pbnB1dC52YWwoKTpcIlwiLGFdKSx0aGlzLl9sYXN0SW5wdXQ9bnVsbCx0aGlzLl9pbkRpYWxvZyYmKHRoaXMuX2RpYWxvZ0lucHV0LmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLGxlZnQ6XCIwXCIsdG9wOlwiLTEwMHB4XCJ9KSx0LmJsb2NrVUkmJih0LnVuYmxvY2tVSSgpLHQoXCJib2R5XCIpLmFwcGVuZCh0aGlzLmRwRGl2KSkpLHRoaXMuX2luRGlhbG9nPSExKX0sX3RpZHlEaWFsb2c6ZnVuY3Rpb24odCl7dC5kcERpdi5yZW1vdmVDbGFzcyh0aGlzLl9kaWFsb2dDbGFzcykub2ZmKFwiLnVpLWRhdGVwaWNrZXItY2FsZW5kYXJcIil9LF9jaGVja0V4dGVybmFsQ2xpY2s6ZnVuY3Rpb24oZSl7aWYodC5kYXRlcGlja2VyLl9jdXJJbnN0KXt2YXIgaT10KGUudGFyZ2V0KSxzPXQuZGF0ZXBpY2tlci5fZ2V0SW5zdChpWzBdKTsoaVswXS5pZCE9PXQuZGF0ZXBpY2tlci5fbWFpbkRpdklkJiYwPT09aS5wYXJlbnRzKFwiI1wiK3QuZGF0ZXBpY2tlci5fbWFpbkRpdklkKS5sZW5ndGgmJiFpLmhhc0NsYXNzKHQuZGF0ZXBpY2tlci5tYXJrZXJDbGFzc05hbWUpJiYhaS5jbG9zZXN0KFwiLlwiK3QuZGF0ZXBpY2tlci5fdHJpZ2dlckNsYXNzKS5sZW5ndGgmJnQuZGF0ZXBpY2tlci5fZGF0ZXBpY2tlclNob3dpbmcmJighdC5kYXRlcGlja2VyLl9pbkRpYWxvZ3x8IXQuYmxvY2tVSSl8fGkuaGFzQ2xhc3ModC5kYXRlcGlja2VyLm1hcmtlckNsYXNzTmFtZSkmJnQuZGF0ZXBpY2tlci5fY3VySW5zdCE9PXMpJiZ0LmRhdGVwaWNrZXIuX2hpZGVEYXRlcGlja2VyKCl9fSxfYWRqdXN0RGF0ZTpmdW5jdGlvbihlLGkscyl7dmFyIG49dChlKSxvPXRoaXMuX2dldEluc3QoblswXSk7dGhpcy5faXNEaXNhYmxlZERhdGVwaWNrZXIoblswXSl8fCh0aGlzLl9hZGp1c3RJbnN0RGF0ZShvLGkrKFwiTVwiPT09cz90aGlzLl9nZXQobyxcInNob3dDdXJyZW50QXRQb3NcIik6MCkscyksdGhpcy5fdXBkYXRlRGF0ZXBpY2tlcihvKSl9LF9nb3RvVG9kYXk6ZnVuY3Rpb24oZSl7dmFyIGkscz10KGUpLG49dGhpcy5fZ2V0SW5zdChzWzBdKTt0aGlzLl9nZXQobixcImdvdG9DdXJyZW50XCIpJiZuLmN1cnJlbnREYXk/KG4uc2VsZWN0ZWREYXk9bi5jdXJyZW50RGF5LG4uZHJhd01vbnRoPW4uc2VsZWN0ZWRNb250aD1uLmN1cnJlbnRNb250aCxuLmRyYXdZZWFyPW4uc2VsZWN0ZWRZZWFyPW4uY3VycmVudFllYXIpOihpPW5ldyBEYXRlLG4uc2VsZWN0ZWREYXk9aS5nZXREYXRlKCksbi5kcmF3TW9udGg9bi5zZWxlY3RlZE1vbnRoPWkuZ2V0TW9udGgoKSxuLmRyYXdZZWFyPW4uc2VsZWN0ZWRZZWFyPWkuZ2V0RnVsbFllYXIoKSksdGhpcy5fbm90aWZ5Q2hhbmdlKG4pLHRoaXMuX2FkanVzdERhdGUocyl9LF9zZWxlY3RNb250aFllYXI6ZnVuY3Rpb24oZSxpLHMpe3ZhciBuPXQoZSksbz10aGlzLl9nZXRJbnN0KG5bMF0pO29bXCJzZWxlY3RlZFwiKyhcIk1cIj09PXM/XCJNb250aFwiOlwiWWVhclwiKV09b1tcImRyYXdcIisoXCJNXCI9PT1zP1wiTW9udGhcIjpcIlllYXJcIildPXBhcnNlSW50KGkub3B0aW9uc1tpLnNlbGVjdGVkSW5kZXhdLnZhbHVlLDEwKSx0aGlzLl9ub3RpZnlDaGFuZ2UobyksdGhpcy5fYWRqdXN0RGF0ZShuKX0sX3NlbGVjdERheTpmdW5jdGlvbihlLGkscyxuKXt2YXIgbyxhPXQoZSk7dChuKS5oYXNDbGFzcyh0aGlzLl91bnNlbGVjdGFibGVDbGFzcyl8fHRoaXMuX2lzRGlzYWJsZWREYXRlcGlja2VyKGFbMF0pfHwobz10aGlzLl9nZXRJbnN0KGFbMF0pLG8uc2VsZWN0ZWREYXk9by5jdXJyZW50RGF5PXQoXCJhXCIsbikuaHRtbCgpLG8uc2VsZWN0ZWRNb250aD1vLmN1cnJlbnRNb250aD1pLG8uc2VsZWN0ZWRZZWFyPW8uY3VycmVudFllYXI9cyx0aGlzLl9zZWxlY3REYXRlKGUsdGhpcy5fZm9ybWF0RGF0ZShvLG8uY3VycmVudERheSxvLmN1cnJlbnRNb250aCxvLmN1cnJlbnRZZWFyKSkpfSxfY2xlYXJEYXRlOmZ1bmN0aW9uKGUpe3ZhciBpPXQoZSk7dGhpcy5fc2VsZWN0RGF0ZShpLFwiXCIpfSxfc2VsZWN0RGF0ZTpmdW5jdGlvbihlLGkpe3ZhciBzLG49dChlKSxvPXRoaXMuX2dldEluc3QoblswXSk7aT1udWxsIT1pP2k6dGhpcy5fZm9ybWF0RGF0ZShvKSxvLmlucHV0JiZvLmlucHV0LnZhbChpKSx0aGlzLl91cGRhdGVBbHRlcm5hdGUobykscz10aGlzLl9nZXQobyxcIm9uU2VsZWN0XCIpLHM/cy5hcHBseShvLmlucHV0P28uaW5wdXRbMF06bnVsbCxbaSxvXSk6by5pbnB1dCYmby5pbnB1dC50cmlnZ2VyKFwiY2hhbmdlXCIpLG8uaW5saW5lP3RoaXMuX3VwZGF0ZURhdGVwaWNrZXIobyk6KHRoaXMuX2hpZGVEYXRlcGlja2VyKCksdGhpcy5fbGFzdElucHV0PW8uaW5wdXRbMF0sXCJvYmplY3RcIiE9dHlwZW9mIG8uaW5wdXRbMF0mJm8uaW5wdXQudHJpZ2dlcihcImZvY3VzXCIpLHRoaXMuX2xhc3RJbnB1dD1udWxsKX0sX3VwZGF0ZUFsdGVybmF0ZTpmdW5jdGlvbihlKXt2YXIgaSxzLG4sbz10aGlzLl9nZXQoZSxcImFsdEZpZWxkXCIpO28mJihpPXRoaXMuX2dldChlLFwiYWx0Rm9ybWF0XCIpfHx0aGlzLl9nZXQoZSxcImRhdGVGb3JtYXRcIikscz10aGlzLl9nZXREYXRlKGUpLG49dGhpcy5mb3JtYXREYXRlKGkscyx0aGlzLl9nZXRGb3JtYXRDb25maWcoZSkpLHQobykudmFsKG4pKX0sbm9XZWVrZW5kczpmdW5jdGlvbih0KXt2YXIgZT10LmdldERheSgpO3JldHVybltlPjAmJjY+ZSxcIlwiXX0saXNvODYwMVdlZWs6ZnVuY3Rpb24odCl7dmFyIGUsaT1uZXcgRGF0ZSh0LmdldFRpbWUoKSk7cmV0dXJuIGkuc2V0RGF0ZShpLmdldERhdGUoKSs0LShpLmdldERheSgpfHw3KSksZT1pLmdldFRpbWUoKSxpLnNldE1vbnRoKDApLGkuc2V0RGF0ZSgxKSxNYXRoLmZsb29yKE1hdGgucm91bmQoKGUtaSkvODY0ZTUpLzcpKzF9LHBhcnNlRGF0ZTpmdW5jdGlvbihlLGkscyl7aWYobnVsbD09ZXx8bnVsbD09aSl0aHJvd1wiSW52YWxpZCBhcmd1bWVudHNcIjtpZihpPVwib2JqZWN0XCI9PXR5cGVvZiBpP1wiXCIraTppK1wiXCIsXCJcIj09PWkpcmV0dXJuIG51bGw7dmFyIG4sbyxhLHIsbD0wLGg9KHM/cy5zaG9ydFllYXJDdXRvZmY6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLnNob3J0WWVhckN1dG9mZixjPVwic3RyaW5nXCIhPXR5cGVvZiBoP2g6KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpJTEwMCtwYXJzZUludChoLDEwKSx1PShzP3MuZGF5TmFtZXNTaG9ydDpudWxsKXx8dGhpcy5fZGVmYXVsdHMuZGF5TmFtZXNTaG9ydCxkPShzP3MuZGF5TmFtZXM6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLmRheU5hbWVzLHA9KHM/cy5tb250aE5hbWVzU2hvcnQ6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLm1vbnRoTmFtZXNTaG9ydCxmPShzP3MubW9udGhOYW1lczpudWxsKXx8dGhpcy5fZGVmYXVsdHMubW9udGhOYW1lcyxnPS0xLG09LTEsXz0tMSx2PS0xLGI9ITEseT1mdW5jdGlvbih0KXt2YXIgaT1lLmxlbmd0aD5uKzEmJmUuY2hhckF0KG4rMSk9PT10O3JldHVybiBpJiZuKyssaX0sdz1mdW5jdGlvbih0KXt2YXIgZT15KHQpLHM9XCJAXCI9PT10PzE0OlwiIVwiPT09dD8yMDpcInlcIj09PXQmJmU/NDpcIm9cIj09PXQ/MzoyLG49XCJ5XCI9PT10P3M6MSxvPVJlZ0V4cChcIl5cXFxcZHtcIituK1wiLFwiK3MrXCJ9XCIpLGE9aS5zdWJzdHJpbmcobCkubWF0Y2gobyk7aWYoIWEpdGhyb3dcIk1pc3NpbmcgbnVtYmVyIGF0IHBvc2l0aW9uIFwiK2w7cmV0dXJuIGwrPWFbMF0ubGVuZ3RoLHBhcnNlSW50KGFbMF0sMTApfSxrPWZ1bmN0aW9uKGUscyxuKXt2YXIgbz0tMSxhPXQubWFwKHkoZSk/bjpzLGZ1bmN0aW9uKHQsZSl7cmV0dXJuW1tlLHRdXX0pLnNvcnQoZnVuY3Rpb24odCxlKXtyZXR1cm4tKHRbMV0ubGVuZ3RoLWVbMV0ubGVuZ3RoKX0pO2lmKHQuZWFjaChhLGZ1bmN0aW9uKHQsZSl7dmFyIHM9ZVsxXTtyZXR1cm4gaS5zdWJzdHIobCxzLmxlbmd0aCkudG9Mb3dlckNhc2UoKT09PXMudG9Mb3dlckNhc2UoKT8obz1lWzBdLGwrPXMubGVuZ3RoLCExKTp2b2lkIDB9KSwtMSE9PW8pcmV0dXJuIG8rMTt0aHJvd1wiVW5rbm93biBuYW1lIGF0IHBvc2l0aW9uIFwiK2x9LHg9ZnVuY3Rpb24oKXtpZihpLmNoYXJBdChsKSE9PWUuY2hhckF0KG4pKXRocm93XCJVbmV4cGVjdGVkIGxpdGVyYWwgYXQgcG9zaXRpb24gXCIrbDtsKyt9O2ZvcihuPTA7ZS5sZW5ndGg+bjtuKyspaWYoYilcIidcIiE9PWUuY2hhckF0KG4pfHx5KFwiJ1wiKT94KCk6Yj0hMTtlbHNlIHN3aXRjaChlLmNoYXJBdChuKSl7Y2FzZVwiZFwiOl89dyhcImRcIik7YnJlYWs7Y2FzZVwiRFwiOmsoXCJEXCIsdSxkKTticmVhaztjYXNlXCJvXCI6dj13KFwib1wiKTticmVhaztjYXNlXCJtXCI6bT13KFwibVwiKTticmVhaztjYXNlXCJNXCI6bT1rKFwiTVwiLHAsZik7YnJlYWs7Y2FzZVwieVwiOmc9dyhcInlcIik7YnJlYWs7Y2FzZVwiQFwiOnI9bmV3IERhdGUodyhcIkBcIikpLGc9ci5nZXRGdWxsWWVhcigpLG09ci5nZXRNb250aCgpKzEsXz1yLmdldERhdGUoKTticmVhaztjYXNlXCIhXCI6cj1uZXcgRGF0ZSgodyhcIiFcIiktdGhpcy5fdGlja3NUbzE5NzApLzFlNCksZz1yLmdldEZ1bGxZZWFyKCksbT1yLmdldE1vbnRoKCkrMSxfPXIuZ2V0RGF0ZSgpO2JyZWFrO2Nhc2VcIidcIjp5KFwiJ1wiKT94KCk6Yj0hMDticmVhaztkZWZhdWx0OngoKX1pZihpLmxlbmd0aD5sJiYoYT1pLnN1YnN0cihsKSwhL15cXHMrLy50ZXN0KGEpKSl0aHJvd1wiRXh0cmEvdW5wYXJzZWQgY2hhcmFjdGVycyBmb3VuZCBpbiBkYXRlOiBcIithO2lmKC0xPT09Zz9nPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKToxMDA+ZyYmKGcrPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKS0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCklMTAwKyhjPj1nPzA6LTEwMCkpLHY+LTEpZm9yKG09MSxfPXY7Oyl7aWYobz10aGlzLl9nZXREYXlzSW5Nb250aChnLG0tMSksbz49XylicmVhazttKyssXy09b31pZihyPXRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKGcsbS0xLF8pKSxyLmdldEZ1bGxZZWFyKCkhPT1nfHxyLmdldE1vbnRoKCkrMSE9PW18fHIuZ2V0RGF0ZSgpIT09Xyl0aHJvd1wiSW52YWxpZCBkYXRlXCI7cmV0dXJuIHJ9LEFUT006XCJ5eS1tbS1kZFwiLENPT0tJRTpcIkQsIGRkIE0geXlcIixJU09fODYwMTpcInl5LW1tLWRkXCIsUkZDXzgyMjpcIkQsIGQgTSB5XCIsUkZDXzg1MDpcIkRELCBkZC1NLXlcIixSRkNfMTAzNjpcIkQsIGQgTSB5XCIsUkZDXzExMjM6XCJELCBkIE0geXlcIixSRkNfMjgyMjpcIkQsIGQgTSB5eVwiLFJTUzpcIkQsIGQgTSB5XCIsVElDS1M6XCIhXCIsVElNRVNUQU1QOlwiQFwiLFczQzpcInl5LW1tLWRkXCIsX3RpY2tzVG8xOTcwOjFlNyo2MCo2MCoyNCooNzE4Njg1K01hdGguZmxvb3IoNDkyLjUpLU1hdGguZmxvb3IoMTkuNykrTWF0aC5mbG9vcig0LjkyNSkpLGZvcm1hdERhdGU6ZnVuY3Rpb24odCxlLGkpe2lmKCFlKXJldHVyblwiXCI7dmFyIHMsbj0oaT9pLmRheU5hbWVzU2hvcnQ6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLmRheU5hbWVzU2hvcnQsbz0oaT9pLmRheU5hbWVzOm51bGwpfHx0aGlzLl9kZWZhdWx0cy5kYXlOYW1lcyxhPShpP2kubW9udGhOYW1lc1Nob3J0Om51bGwpfHx0aGlzLl9kZWZhdWx0cy5tb250aE5hbWVzU2hvcnQscj0oaT9pLm1vbnRoTmFtZXM6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLm1vbnRoTmFtZXMsbD1mdW5jdGlvbihlKXt2YXIgaT10Lmxlbmd0aD5zKzEmJnQuY2hhckF0KHMrMSk9PT1lO3JldHVybiBpJiZzKyssaX0saD1mdW5jdGlvbih0LGUsaSl7dmFyIHM9XCJcIitlO2lmKGwodCkpZm9yKDtpPnMubGVuZ3RoOylzPVwiMFwiK3M7cmV0dXJuIHN9LGM9ZnVuY3Rpb24odCxlLGkscyl7cmV0dXJuIGwodCk/c1tlXTppW2VdfSx1PVwiXCIsZD0hMTtpZihlKWZvcihzPTA7dC5sZW5ndGg+cztzKyspaWYoZClcIidcIiE9PXQuY2hhckF0KHMpfHxsKFwiJ1wiKT91Kz10LmNoYXJBdChzKTpkPSExO2Vsc2Ugc3dpdGNoKHQuY2hhckF0KHMpKXtjYXNlXCJkXCI6dSs9aChcImRcIixlLmdldERhdGUoKSwyKTticmVhaztjYXNlXCJEXCI6dSs9YyhcIkRcIixlLmdldERheSgpLG4sbyk7YnJlYWs7Y2FzZVwib1wiOnUrPWgoXCJvXCIsTWF0aC5yb3VuZCgobmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLGUuZ2V0TW9udGgoKSxlLmdldERhdGUoKSkuZ2V0VGltZSgpLW5ldyBEYXRlKGUuZ2V0RnVsbFllYXIoKSwwLDApLmdldFRpbWUoKSkvODY0ZTUpLDMpO2JyZWFrO2Nhc2VcIm1cIjp1Kz1oKFwibVwiLGUuZ2V0TW9udGgoKSsxLDIpO2JyZWFrO2Nhc2VcIk1cIjp1Kz1jKFwiTVwiLGUuZ2V0TW9udGgoKSxhLHIpO2JyZWFrO2Nhc2VcInlcIjp1Kz1sKFwieVwiKT9lLmdldEZ1bGxZZWFyKCk6KDEwPmUuZ2V0RnVsbFllYXIoKSUxMDA/XCIwXCI6XCJcIikrZS5nZXRGdWxsWWVhcigpJTEwMDticmVhaztjYXNlXCJAXCI6dSs9ZS5nZXRUaW1lKCk7YnJlYWs7Y2FzZVwiIVwiOnUrPTFlNCplLmdldFRpbWUoKSt0aGlzLl90aWNrc1RvMTk3MDticmVhaztjYXNlXCInXCI6bChcIidcIik/dSs9XCInXCI6ZD0hMDticmVhaztkZWZhdWx0OnUrPXQuY2hhckF0KHMpfXJldHVybiB1fSxfcG9zc2libGVDaGFyczpmdW5jdGlvbih0KXt2YXIgZSxpPVwiXCIscz0hMSxuPWZ1bmN0aW9uKGkpe3ZhciBzPXQubGVuZ3RoPmUrMSYmdC5jaGFyQXQoZSsxKT09PWk7cmV0dXJuIHMmJmUrKyxzfTtmb3IoZT0wO3QubGVuZ3RoPmU7ZSsrKWlmKHMpXCInXCIhPT10LmNoYXJBdChlKXx8bihcIidcIik/aSs9dC5jaGFyQXQoZSk6cz0hMTtlbHNlIHN3aXRjaCh0LmNoYXJBdChlKSl7Y2FzZVwiZFwiOmNhc2VcIm1cIjpjYXNlXCJ5XCI6Y2FzZVwiQFwiOmkrPVwiMDEyMzQ1Njc4OVwiO2JyZWFrO2Nhc2VcIkRcIjpjYXNlXCJNXCI6cmV0dXJuIG51bGw7Y2FzZVwiJ1wiOm4oXCInXCIpP2krPVwiJ1wiOnM9ITA7YnJlYWs7ZGVmYXVsdDppKz10LmNoYXJBdChlKX1yZXR1cm4gaX0sX2dldDpmdW5jdGlvbih0LGUpe3JldHVybiB2b2lkIDAhPT10LnNldHRpbmdzW2VdP3Quc2V0dGluZ3NbZV06dGhpcy5fZGVmYXVsdHNbZV19LF9zZXREYXRlRnJvbUZpZWxkOmZ1bmN0aW9uKHQsZSl7aWYodC5pbnB1dC52YWwoKSE9PXQubGFzdFZhbCl7dmFyIGk9dGhpcy5fZ2V0KHQsXCJkYXRlRm9ybWF0XCIpLHM9dC5sYXN0VmFsPXQuaW5wdXQ/dC5pbnB1dC52YWwoKTpudWxsLG49dGhpcy5fZ2V0RGVmYXVsdERhdGUodCksbz1uLGE9dGhpcy5fZ2V0Rm9ybWF0Q29uZmlnKHQpO3RyeXtvPXRoaXMucGFyc2VEYXRlKGkscyxhKXx8bn1jYXRjaChyKXtzPWU/XCJcIjpzfXQuc2VsZWN0ZWREYXk9by5nZXREYXRlKCksdC5kcmF3TW9udGg9dC5zZWxlY3RlZE1vbnRoPW8uZ2V0TW9udGgoKSx0LmRyYXdZZWFyPXQuc2VsZWN0ZWRZZWFyPW8uZ2V0RnVsbFllYXIoKSx0LmN1cnJlbnREYXk9cz9vLmdldERhdGUoKTowLHQuY3VycmVudE1vbnRoPXM/by5nZXRNb250aCgpOjAsdC5jdXJyZW50WWVhcj1zP28uZ2V0RnVsbFllYXIoKTowLHRoaXMuX2FkanVzdEluc3REYXRlKHQpfX0sX2dldERlZmF1bHREYXRlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9yZXN0cmljdE1pbk1heCh0LHRoaXMuX2RldGVybWluZURhdGUodCx0aGlzLl9nZXQodCxcImRlZmF1bHREYXRlXCIpLG5ldyBEYXRlKSl9LF9kZXRlcm1pbmVEYXRlOmZ1bmN0aW9uKGUsaSxzKXt2YXIgbj1mdW5jdGlvbih0KXt2YXIgZT1uZXcgRGF0ZTtyZXR1cm4gZS5zZXREYXRlKGUuZ2V0RGF0ZSgpK3QpLGV9LG89ZnVuY3Rpb24oaSl7dHJ5e3JldHVybiB0LmRhdGVwaWNrZXIucGFyc2VEYXRlKHQuZGF0ZXBpY2tlci5fZ2V0KGUsXCJkYXRlRm9ybWF0XCIpLGksdC5kYXRlcGlja2VyLl9nZXRGb3JtYXRDb25maWcoZSkpfWNhdGNoKHMpe31mb3IodmFyIG49KGkudG9Mb3dlckNhc2UoKS5tYXRjaCgvXmMvKT90LmRhdGVwaWNrZXIuX2dldERhdGUoZSk6bnVsbCl8fG5ldyBEYXRlLG89bi5nZXRGdWxsWWVhcigpLGE9bi5nZXRNb250aCgpLHI9bi5nZXREYXRlKCksbD0vKFsrXFwtXT9bMC05XSspXFxzKihkfER8d3xXfG18TXx5fFkpPy9nLGg9bC5leGVjKGkpO2g7KXtzd2l0Y2goaFsyXXx8XCJkXCIpe2Nhc2VcImRcIjpjYXNlXCJEXCI6cis9cGFyc2VJbnQoaFsxXSwxMCk7YnJlYWs7Y2FzZVwid1wiOmNhc2VcIldcIjpyKz03KnBhcnNlSW50KGhbMV0sMTApO2JyZWFrO2Nhc2VcIm1cIjpjYXNlXCJNXCI6YSs9cGFyc2VJbnQoaFsxXSwxMCkscj1NYXRoLm1pbihyLHQuZGF0ZXBpY2tlci5fZ2V0RGF5c0luTW9udGgobyxhKSk7YnJlYWs7Y2FzZVwieVwiOmNhc2VcIllcIjpvKz1wYXJzZUludChoWzFdLDEwKSxyPU1hdGgubWluKHIsdC5kYXRlcGlja2VyLl9nZXREYXlzSW5Nb250aChvLGEpKX1oPWwuZXhlYyhpKX1yZXR1cm4gbmV3IERhdGUobyxhLHIpfSxhPW51bGw9PWl8fFwiXCI9PT1pP3M6XCJzdHJpbmdcIj09dHlwZW9mIGk/byhpKTpcIm51bWJlclwiPT10eXBlb2YgaT9pc05hTihpKT9zOm4oaSk6bmV3IERhdGUoaS5nZXRUaW1lKCkpO3JldHVybiBhPWEmJlwiSW52YWxpZCBEYXRlXCI9PVwiXCIrYT9zOmEsYSYmKGEuc2V0SG91cnMoMCksYS5zZXRNaW51dGVzKDApLGEuc2V0U2Vjb25kcygwKSxhLnNldE1pbGxpc2Vjb25kcygwKSksdGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QoYSl9LF9kYXlsaWdodFNhdmluZ0FkanVzdDpmdW5jdGlvbih0KXtyZXR1cm4gdD8odC5zZXRIb3Vycyh0LmdldEhvdXJzKCk+MTI/dC5nZXRIb3VycygpKzI6MCksdCk6bnVsbH0sX3NldERhdGU6ZnVuY3Rpb24odCxlLGkpe3ZhciBzPSFlLG49dC5zZWxlY3RlZE1vbnRoLG89dC5zZWxlY3RlZFllYXIsYT10aGlzLl9yZXN0cmljdE1pbk1heCh0LHRoaXMuX2RldGVybWluZURhdGUodCxlLG5ldyBEYXRlKSk7dC5zZWxlY3RlZERheT10LmN1cnJlbnREYXk9YS5nZXREYXRlKCksdC5kcmF3TW9udGg9dC5zZWxlY3RlZE1vbnRoPXQuY3VycmVudE1vbnRoPWEuZ2V0TW9udGgoKSx0LmRyYXdZZWFyPXQuc2VsZWN0ZWRZZWFyPXQuY3VycmVudFllYXI9YS5nZXRGdWxsWWVhcigpLG49PT10LnNlbGVjdGVkTW9udGgmJm89PT10LnNlbGVjdGVkWWVhcnx8aXx8dGhpcy5fbm90aWZ5Q2hhbmdlKHQpLHRoaXMuX2FkanVzdEluc3REYXRlKHQpLHQuaW5wdXQmJnQuaW5wdXQudmFsKHM/XCJcIjp0aGlzLl9mb3JtYXREYXRlKHQpKX0sX2dldERhdGU6ZnVuY3Rpb24odCl7dmFyIGU9IXQuY3VycmVudFllYXJ8fHQuaW5wdXQmJlwiXCI9PT10LmlucHV0LnZhbCgpP251bGw6dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodC5jdXJyZW50WWVhcix0LmN1cnJlbnRNb250aCx0LmN1cnJlbnREYXkpKTtyZXR1cm4gZX0sX2F0dGFjaEhhbmRsZXJzOmZ1bmN0aW9uKGUpe3ZhciBpPXRoaXMuX2dldChlLFwic3RlcE1vbnRoc1wiKSxzPVwiI1wiK2UuaWQucmVwbGFjZSgvXFxcXFxcXFwvZyxcIlxcXFxcIik7ZS5kcERpdi5maW5kKFwiW2RhdGEtaGFuZGxlcl1cIikubWFwKGZ1bmN0aW9uKCl7dmFyIGU9e3ByZXY6ZnVuY3Rpb24oKXt0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUocywtaSxcIk1cIil9LG5leHQ6ZnVuY3Rpb24oKXt0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUocywraSxcIk1cIil9LGhpZGU6ZnVuY3Rpb24oKXt0LmRhdGVwaWNrZXIuX2hpZGVEYXRlcGlja2VyKCl9LHRvZGF5OmZ1bmN0aW9uKCl7dC5kYXRlcGlja2VyLl9nb3RvVG9kYXkocyl9LHNlbGVjdERheTpmdW5jdGlvbigpe3JldHVybiB0LmRhdGVwaWNrZXIuX3NlbGVjdERheShzLCt0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtbW9udGhcIiksK3RoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS15ZWFyXCIpLHRoaXMpLCExfSxzZWxlY3RNb250aDpmdW5jdGlvbigpe3JldHVybiB0LmRhdGVwaWNrZXIuX3NlbGVjdE1vbnRoWWVhcihzLHRoaXMsXCJNXCIpLCExfSxzZWxlY3RZZWFyOmZ1bmN0aW9uKCl7cmV0dXJuIHQuZGF0ZXBpY2tlci5fc2VsZWN0TW9udGhZZWFyKHMsdGhpcyxcIllcIiksITF9fTt0KHRoaXMpLm9uKHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1ldmVudFwiKSxlW3RoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1oYW5kbGVyXCIpXSl9KX0sX2dlbmVyYXRlSFRNTDpmdW5jdGlvbih0KXt2YXIgZSxpLHMsbixvLGEscixsLGgsYyx1LGQscCxmLGcsbSxfLHYsYix5LHcsayx4LEMsRCxULEksTSxQLFMsTixILEEseixPLEUsVyxGLEwsUj1uZXcgRGF0ZSxZPXRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKFIuZ2V0RnVsbFllYXIoKSxSLmdldE1vbnRoKCksUi5nZXREYXRlKCkpKSxCPXRoaXMuX2dldCh0LFwiaXNSVExcIiksaj10aGlzLl9nZXQodCxcInNob3dCdXR0b25QYW5lbFwiKSxxPXRoaXMuX2dldCh0LFwiaGlkZUlmTm9QcmV2TmV4dFwiKSxLPXRoaXMuX2dldCh0LFwibmF2aWdhdGlvbkFzRGF0ZUZvcm1hdFwiKSxVPXRoaXMuX2dldE51bWJlck9mTW9udGhzKHQpLFY9dGhpcy5fZ2V0KHQsXCJzaG93Q3VycmVudEF0UG9zXCIpLFg9dGhpcy5fZ2V0KHQsXCJzdGVwTW9udGhzXCIpLCQ9MSE9PVVbMF18fDEhPT1VWzFdLEc9dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QodC5jdXJyZW50RGF5P25ldyBEYXRlKHQuY3VycmVudFllYXIsdC5jdXJyZW50TW9udGgsdC5jdXJyZW50RGF5KTpuZXcgRGF0ZSg5OTk5LDksOSkpLEo9dGhpcy5fZ2V0TWluTWF4RGF0ZSh0LFwibWluXCIpLFE9dGhpcy5fZ2V0TWluTWF4RGF0ZSh0LFwibWF4XCIpLFo9dC5kcmF3TW9udGgtVix0ZT10LmRyYXdZZWFyO2lmKDA+WiYmKForPTEyLHRlLS0pLFEpZm9yKGU9dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUoUS5nZXRGdWxsWWVhcigpLFEuZ2V0TW9udGgoKS1VWzBdKlVbMV0rMSxRLmdldERhdGUoKSkpLGU9SiYmSj5lP0o6ZTt0aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZSh0ZSxaLDEpKT5lOylaLS0sMD5aJiYoWj0xMSx0ZS0tKTtmb3IodC5kcmF3TW9udGg9Wix0LmRyYXdZZWFyPXRlLGk9dGhpcy5fZ2V0KHQsXCJwcmV2VGV4dFwiKSxpPUs/dGhpcy5mb3JtYXREYXRlKGksdGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodGUsWi1YLDEpKSx0aGlzLl9nZXRGb3JtYXRDb25maWcodCkpOmkscz10aGlzLl9jYW5BZGp1c3RNb250aCh0LC0xLHRlLFopP1wiPGEgY2xhc3M9J3VpLWRhdGVwaWNrZXItcHJldiB1aS1jb3JuZXItYWxsJyBkYXRhLWhhbmRsZXI9J3ByZXYnIGRhdGEtZXZlbnQ9J2NsaWNrJyB0aXRsZT0nXCIraStcIic+PHNwYW4gY2xhc3M9J3VpLWljb24gdWktaWNvbi1jaXJjbGUtdHJpYW5nbGUtXCIrKEI/XCJlXCI6XCJ3XCIpK1wiJz5cIitpK1wiPC9zcGFuPjwvYT5cIjpxP1wiXCI6XCI8YSBjbGFzcz0ndWktZGF0ZXBpY2tlci1wcmV2IHVpLWNvcm5lci1hbGwgdWktc3RhdGUtZGlzYWJsZWQnIHRpdGxlPSdcIitpK1wiJz48c3BhbiBjbGFzcz0ndWktaWNvbiB1aS1pY29uLWNpcmNsZS10cmlhbmdsZS1cIisoQj9cImVcIjpcIndcIikrXCInPlwiK2krXCI8L3NwYW4+PC9hPlwiLG49dGhpcy5fZ2V0KHQsXCJuZXh0VGV4dFwiKSxuPUs/dGhpcy5mb3JtYXREYXRlKG4sdGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodGUsWitYLDEpKSx0aGlzLl9nZXRGb3JtYXRDb25maWcodCkpOm4sbz10aGlzLl9jYW5BZGp1c3RNb250aCh0LDEsdGUsWik/XCI8YSBjbGFzcz0ndWktZGF0ZXBpY2tlci1uZXh0IHVpLWNvcm5lci1hbGwnIGRhdGEtaGFuZGxlcj0nbmV4dCcgZGF0YS1ldmVudD0nY2xpY2snIHRpdGxlPSdcIituK1wiJz48c3BhbiBjbGFzcz0ndWktaWNvbiB1aS1pY29uLWNpcmNsZS10cmlhbmdsZS1cIisoQj9cIndcIjpcImVcIikrXCInPlwiK24rXCI8L3NwYW4+PC9hPlwiOnE/XCJcIjpcIjxhIGNsYXNzPSd1aS1kYXRlcGlja2VyLW5leHQgdWktY29ybmVyLWFsbCB1aS1zdGF0ZS1kaXNhYmxlZCcgdGl0bGU9J1wiK24rXCInPjxzcGFuIGNsYXNzPSd1aS1pY29uIHVpLWljb24tY2lyY2xlLXRyaWFuZ2xlLVwiKyhCP1wid1wiOlwiZVwiKStcIic+XCIrbitcIjwvc3Bhbj48L2E+XCIsYT10aGlzLl9nZXQodCxcImN1cnJlbnRUZXh0XCIpLHI9dGhpcy5fZ2V0KHQsXCJnb3RvQ3VycmVudFwiKSYmdC5jdXJyZW50RGF5P0c6WSxhPUs/dGhpcy5mb3JtYXREYXRlKGEscix0aGlzLl9nZXRGb3JtYXRDb25maWcodCkpOmEsbD10LmlubGluZT9cIlwiOlwiPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzPSd1aS1kYXRlcGlja2VyLWNsb3NlIHVpLXN0YXRlLWRlZmF1bHQgdWktcHJpb3JpdHktcHJpbWFyeSB1aS1jb3JuZXItYWxsJyBkYXRhLWhhbmRsZXI9J2hpZGUnIGRhdGEtZXZlbnQ9J2NsaWNrJz5cIit0aGlzLl9nZXQodCxcImNsb3NlVGV4dFwiKStcIjwvYnV0dG9uPlwiLGg9aj9cIjxkaXYgY2xhc3M9J3VpLWRhdGVwaWNrZXItYnV0dG9ucGFuZSB1aS13aWRnZXQtY29udGVudCc+XCIrKEI/bDpcIlwiKSsodGhpcy5faXNJblJhbmdlKHQscik/XCI8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9J3VpLWRhdGVwaWNrZXItY3VycmVudCB1aS1zdGF0ZS1kZWZhdWx0IHVpLXByaW9yaXR5LXNlY29uZGFyeSB1aS1jb3JuZXItYWxsJyBkYXRhLWhhbmRsZXI9J3RvZGF5JyBkYXRhLWV2ZW50PSdjbGljayc+XCIrYStcIjwvYnV0dG9uPlwiOlwiXCIpKyhCP1wiXCI6bCkrXCI8L2Rpdj5cIjpcIlwiLGM9cGFyc2VJbnQodGhpcy5fZ2V0KHQsXCJmaXJzdERheVwiKSwxMCksYz1pc05hTihjKT8wOmMsdT10aGlzLl9nZXQodCxcInNob3dXZWVrXCIpLGQ9dGhpcy5fZ2V0KHQsXCJkYXlOYW1lc1wiKSxwPXRoaXMuX2dldCh0LFwiZGF5TmFtZXNNaW5cIiksZj10aGlzLl9nZXQodCxcIm1vbnRoTmFtZXNcIiksZz10aGlzLl9nZXQodCxcIm1vbnRoTmFtZXNTaG9ydFwiKSxtPXRoaXMuX2dldCh0LFwiYmVmb3JlU2hvd0RheVwiKSxfPXRoaXMuX2dldCh0LFwic2hvd090aGVyTW9udGhzXCIpLHY9dGhpcy5fZ2V0KHQsXCJzZWxlY3RPdGhlck1vbnRoc1wiKSxiPXRoaXMuX2dldERlZmF1bHREYXRlKHQpLHk9XCJcIixrPTA7VVswXT5rO2srKyl7Zm9yKHg9XCJcIix0aGlzLm1heFJvd3M9NCxDPTA7VVsxXT5DO0MrKyl7aWYoRD10aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZSh0ZSxaLHQuc2VsZWN0ZWREYXkpKSxUPVwiIHVpLWNvcm5lci1hbGxcIixJPVwiXCIsJCl7aWYoSSs9XCI8ZGl2IGNsYXNzPSd1aS1kYXRlcGlja2VyLWdyb3VwXCIsVVsxXT4xKXN3aXRjaChDKXtjYXNlIDA6SSs9XCIgdWktZGF0ZXBpY2tlci1ncm91cC1maXJzdFwiLFQ9XCIgdWktY29ybmVyLVwiKyhCP1wicmlnaHRcIjpcImxlZnRcIik7YnJlYWs7Y2FzZSBVWzFdLTE6SSs9XCIgdWktZGF0ZXBpY2tlci1ncm91cC1sYXN0XCIsVD1cIiB1aS1jb3JuZXItXCIrKEI/XCJsZWZ0XCI6XCJyaWdodFwiKTticmVhaztkZWZhdWx0OkkrPVwiIHVpLWRhdGVwaWNrZXItZ3JvdXAtbWlkZGxlXCIsVD1cIlwifUkrPVwiJz5cIn1mb3IoSSs9XCI8ZGl2IGNsYXNzPSd1aS1kYXRlcGlja2VyLWhlYWRlciB1aS13aWRnZXQtaGVhZGVyIHVpLWhlbHBlci1jbGVhcmZpeFwiK1QrXCInPlwiKygvYWxsfGxlZnQvLnRlc3QoVCkmJjA9PT1rP0I/bzpzOlwiXCIpKygvYWxsfHJpZ2h0Ly50ZXN0KFQpJiYwPT09az9CP3M6bzpcIlwiKSt0aGlzLl9nZW5lcmF0ZU1vbnRoWWVhckhlYWRlcih0LFosdGUsSixRLGs+MHx8Qz4wLGYsZykrXCI8L2Rpdj48dGFibGUgY2xhc3M9J3VpLWRhdGVwaWNrZXItY2FsZW5kYXInPjx0aGVhZD5cIitcIjx0cj5cIixNPXU/XCI8dGggY2xhc3M9J3VpLWRhdGVwaWNrZXItd2Vlay1jb2wnPlwiK3RoaXMuX2dldCh0LFwid2Vla0hlYWRlclwiKStcIjwvdGg+XCI6XCJcIix3PTA7Nz53O3crKylQPSh3K2MpJTcsTSs9XCI8dGggc2NvcGU9J2NvbCdcIisoKHcrYys2KSU3Pj01P1wiIGNsYXNzPSd1aS1kYXRlcGlja2VyLXdlZWstZW5kJ1wiOlwiXCIpK1wiPlwiK1wiPHNwYW4gdGl0bGU9J1wiK2RbUF0rXCInPlwiK3BbUF0rXCI8L3NwYW4+PC90aD5cIjtmb3IoSSs9TStcIjwvdHI+PC90aGVhZD48dGJvZHk+XCIsUz10aGlzLl9nZXREYXlzSW5Nb250aCh0ZSxaKSx0ZT09PXQuc2VsZWN0ZWRZZWFyJiZaPT09dC5zZWxlY3RlZE1vbnRoJiYodC5zZWxlY3RlZERheT1NYXRoLm1pbih0LnNlbGVjdGVkRGF5LFMpKSxOPSh0aGlzLl9nZXRGaXJzdERheU9mTW9udGgodGUsWiktYys3KSU3LEg9TWF0aC5jZWlsKChOK1MpLzcpLEE9JD90aGlzLm1heFJvd3M+SD90aGlzLm1heFJvd3M6SDpILHRoaXMubWF4Um93cz1BLHo9dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodGUsWiwxLU4pKSxPPTA7QT5PO08rKyl7Zm9yKEkrPVwiPHRyPlwiLEU9dT9cIjx0ZCBjbGFzcz0ndWktZGF0ZXBpY2tlci13ZWVrLWNvbCc+XCIrdGhpcy5fZ2V0KHQsXCJjYWxjdWxhdGVXZWVrXCIpKHopK1wiPC90ZD5cIjpcIlwiLHc9MDs3Pnc7dysrKVc9bT9tLmFwcGx5KHQuaW5wdXQ/dC5pbnB1dFswXTpudWxsLFt6XSk6WyEwLFwiXCJdLEY9ei5nZXRNb250aCgpIT09WixMPUYmJiF2fHwhV1swXXx8SiYmSj56fHxRJiZ6PlEsRSs9XCI8dGQgY2xhc3M9J1wiKygodytjKzYpJTc+PTU/XCIgdWktZGF0ZXBpY2tlci13ZWVrLWVuZFwiOlwiXCIpKyhGP1wiIHVpLWRhdGVwaWNrZXItb3RoZXItbW9udGhcIjpcIlwiKSsoei5nZXRUaW1lKCk9PT1ELmdldFRpbWUoKSYmWj09PXQuc2VsZWN0ZWRNb250aCYmdC5fa2V5RXZlbnR8fGIuZ2V0VGltZSgpPT09ei5nZXRUaW1lKCkmJmIuZ2V0VGltZSgpPT09RC5nZXRUaW1lKCk/XCIgXCIrdGhpcy5fZGF5T3ZlckNsYXNzOlwiXCIpKyhMP1wiIFwiK3RoaXMuX3Vuc2VsZWN0YWJsZUNsYXNzK1wiIHVpLXN0YXRlLWRpc2FibGVkXCI6XCJcIikrKEYmJiFfP1wiXCI6XCIgXCIrV1sxXSsoei5nZXRUaW1lKCk9PT1HLmdldFRpbWUoKT9cIiBcIit0aGlzLl9jdXJyZW50Q2xhc3M6XCJcIikrKHouZ2V0VGltZSgpPT09WS5nZXRUaW1lKCk/XCIgdWktZGF0ZXBpY2tlci10b2RheVwiOlwiXCIpKStcIidcIisoRiYmIV98fCFXWzJdP1wiXCI6XCIgdGl0bGU9J1wiK1dbMl0ucmVwbGFjZSgvJy9nLFwiJiMzOTtcIikrXCInXCIpKyhMP1wiXCI6XCIgZGF0YS1oYW5kbGVyPSdzZWxlY3REYXknIGRhdGEtZXZlbnQ9J2NsaWNrJyBkYXRhLW1vbnRoPSdcIit6LmdldE1vbnRoKCkrXCInIGRhdGEteWVhcj0nXCIrei5nZXRGdWxsWWVhcigpK1wiJ1wiKStcIj5cIisoRiYmIV8/XCImI3hhMDtcIjpMP1wiPHNwYW4gY2xhc3M9J3VpLXN0YXRlLWRlZmF1bHQnPlwiK3ouZ2V0RGF0ZSgpK1wiPC9zcGFuPlwiOlwiPGEgY2xhc3M9J3VpLXN0YXRlLWRlZmF1bHRcIisoei5nZXRUaW1lKCk9PT1ZLmdldFRpbWUoKT9cIiB1aS1zdGF0ZS1oaWdobGlnaHRcIjpcIlwiKSsoei5nZXRUaW1lKCk9PT1HLmdldFRpbWUoKT9cIiB1aS1zdGF0ZS1hY3RpdmVcIjpcIlwiKSsoRj9cIiB1aS1wcmlvcml0eS1zZWNvbmRhcnlcIjpcIlwiKStcIicgaHJlZj0nIyc+XCIrei5nZXREYXRlKCkrXCI8L2E+XCIpK1wiPC90ZD5cIix6LnNldERhdGUoei5nZXREYXRlKCkrMSksej10aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdCh6KTtcbkkrPUUrXCI8L3RyPlwifVorKyxaPjExJiYoWj0wLHRlKyspLEkrPVwiPC90Ym9keT48L3RhYmxlPlwiKygkP1wiPC9kaXY+XCIrKFVbMF0+MCYmQz09PVVbMV0tMT9cIjxkaXYgY2xhc3M9J3VpLWRhdGVwaWNrZXItcm93LWJyZWFrJz48L2Rpdj5cIjpcIlwiKTpcIlwiKSx4Kz1JfXkrPXh9cmV0dXJuIHkrPWgsdC5fa2V5RXZlbnQ9ITEseX0sX2dlbmVyYXRlTW9udGhZZWFySGVhZGVyOmZ1bmN0aW9uKHQsZSxpLHMsbixvLGEscil7dmFyIGwsaCxjLHUsZCxwLGYsZyxtPXRoaXMuX2dldCh0LFwiY2hhbmdlTW9udGhcIiksXz10aGlzLl9nZXQodCxcImNoYW5nZVllYXJcIiksdj10aGlzLl9nZXQodCxcInNob3dNb250aEFmdGVyWWVhclwiKSxiPVwiPGRpdiBjbGFzcz0ndWktZGF0ZXBpY2tlci10aXRsZSc+XCIseT1cIlwiO2lmKG98fCFtKXkrPVwiPHNwYW4gY2xhc3M9J3VpLWRhdGVwaWNrZXItbW9udGgnPlwiK2FbZV0rXCI8L3NwYW4+XCI7ZWxzZXtmb3IobD1zJiZzLmdldEZ1bGxZZWFyKCk9PT1pLGg9biYmbi5nZXRGdWxsWWVhcigpPT09aSx5Kz1cIjxzZWxlY3QgY2xhc3M9J3VpLWRhdGVwaWNrZXItbW9udGgnIGRhdGEtaGFuZGxlcj0nc2VsZWN0TW9udGgnIGRhdGEtZXZlbnQ9J2NoYW5nZSc+XCIsYz0wOzEyPmM7YysrKSghbHx8Yz49cy5nZXRNb250aCgpKSYmKCFofHxuLmdldE1vbnRoKCk+PWMpJiYoeSs9XCI8b3B0aW9uIHZhbHVlPSdcIitjK1wiJ1wiKyhjPT09ZT9cIiBzZWxlY3RlZD0nc2VsZWN0ZWQnXCI6XCJcIikrXCI+XCIrcltjXStcIjwvb3B0aW9uPlwiKTt5Kz1cIjwvc2VsZWN0PlwifWlmKHZ8fChiKz15KyghbyYmbSYmXz9cIlwiOlwiJiN4YTA7XCIpKSwhdC55ZWFyc2h0bWwpaWYodC55ZWFyc2h0bWw9XCJcIixvfHwhXyliKz1cIjxzcGFuIGNsYXNzPSd1aS1kYXRlcGlja2VyLXllYXInPlwiK2krXCI8L3NwYW4+XCI7ZWxzZXtmb3IodT10aGlzLl9nZXQodCxcInllYXJSYW5nZVwiKS5zcGxpdChcIjpcIiksZD0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCkscD1mdW5jdGlvbih0KXt2YXIgZT10Lm1hdGNoKC9jWytcXC1dLiovKT9pK3BhcnNlSW50KHQuc3Vic3RyaW5nKDEpLDEwKTp0Lm1hdGNoKC9bK1xcLV0uKi8pP2QrcGFyc2VJbnQodCwxMCk6cGFyc2VJbnQodCwxMCk7cmV0dXJuIGlzTmFOKGUpP2Q6ZX0sZj1wKHVbMF0pLGc9TWF0aC5tYXgoZixwKHVbMV18fFwiXCIpKSxmPXM/TWF0aC5tYXgoZixzLmdldEZ1bGxZZWFyKCkpOmYsZz1uP01hdGgubWluKGcsbi5nZXRGdWxsWWVhcigpKTpnLHQueWVhcnNodG1sKz1cIjxzZWxlY3QgY2xhc3M9J3VpLWRhdGVwaWNrZXIteWVhcicgZGF0YS1oYW5kbGVyPSdzZWxlY3RZZWFyJyBkYXRhLWV2ZW50PSdjaGFuZ2UnPlwiO2c+PWY7ZisrKXQueWVhcnNodG1sKz1cIjxvcHRpb24gdmFsdWU9J1wiK2YrXCInXCIrKGY9PT1pP1wiIHNlbGVjdGVkPSdzZWxlY3RlZCdcIjpcIlwiKStcIj5cIitmK1wiPC9vcHRpb24+XCI7dC55ZWFyc2h0bWwrPVwiPC9zZWxlY3Q+XCIsYis9dC55ZWFyc2h0bWwsdC55ZWFyc2h0bWw9bnVsbH1yZXR1cm4gYis9dGhpcy5fZ2V0KHQsXCJ5ZWFyU3VmZml4XCIpLHYmJihiKz0oIW8mJm0mJl8/XCJcIjpcIiYjeGEwO1wiKSt5KSxiKz1cIjwvZGl2PlwifSxfYWRqdXN0SW5zdERhdGU6ZnVuY3Rpb24odCxlLGkpe3ZhciBzPXQuc2VsZWN0ZWRZZWFyKyhcIllcIj09PWk/ZTowKSxuPXQuc2VsZWN0ZWRNb250aCsoXCJNXCI9PT1pP2U6MCksbz1NYXRoLm1pbih0LnNlbGVjdGVkRGF5LHRoaXMuX2dldERheXNJbk1vbnRoKHMsbikpKyhcIkRcIj09PWk/ZTowKSxhPXRoaXMuX3Jlc3RyaWN0TWluTWF4KHQsdGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUocyxuLG8pKSk7dC5zZWxlY3RlZERheT1hLmdldERhdGUoKSx0LmRyYXdNb250aD10LnNlbGVjdGVkTW9udGg9YS5nZXRNb250aCgpLHQuZHJhd1llYXI9dC5zZWxlY3RlZFllYXI9YS5nZXRGdWxsWWVhcigpLChcIk1cIj09PWl8fFwiWVwiPT09aSkmJnRoaXMuX25vdGlmeUNoYW5nZSh0KX0sX3Jlc3RyaWN0TWluTWF4OmZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZ2V0TWluTWF4RGF0ZSh0LFwibWluXCIpLHM9dGhpcy5fZ2V0TWluTWF4RGF0ZSh0LFwibWF4XCIpLG49aSYmaT5lP2k6ZTtyZXR1cm4gcyYmbj5zP3M6bn0sX25vdGlmeUNoYW5nZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLl9nZXQodCxcIm9uQ2hhbmdlTW9udGhZZWFyXCIpO2UmJmUuYXBwbHkodC5pbnB1dD90LmlucHV0WzBdOm51bGwsW3Quc2VsZWN0ZWRZZWFyLHQuc2VsZWN0ZWRNb250aCsxLHRdKX0sX2dldE51bWJlck9mTW9udGhzOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX2dldCh0LFwibnVtYmVyT2ZNb250aHNcIik7cmV0dXJuIG51bGw9PWU/WzEsMV06XCJudW1iZXJcIj09dHlwZW9mIGU/WzEsZV06ZX0sX2dldE1pbk1heERhdGU6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5fZGV0ZXJtaW5lRGF0ZSh0LHRoaXMuX2dldCh0LGUrXCJEYXRlXCIpLG51bGwpfSxfZ2V0RGF5c0luTW9udGg6ZnVuY3Rpb24odCxlKXtyZXR1cm4gMzItdGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodCxlLDMyKSkuZ2V0RGF0ZSgpfSxfZ2V0Rmlyc3REYXlPZk1vbnRoOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIG5ldyBEYXRlKHQsZSwxKS5nZXREYXkoKX0sX2NhbkFkanVzdE1vbnRoOmZ1bmN0aW9uKHQsZSxpLHMpe3ZhciBuPXRoaXMuX2dldE51bWJlck9mTW9udGhzKHQpLG89dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUoaSxzKygwPmU/ZTpuWzBdKm5bMV0pLDEpKTtyZXR1cm4gMD5lJiZvLnNldERhdGUodGhpcy5fZ2V0RGF5c0luTW9udGgoby5nZXRGdWxsWWVhcigpLG8uZ2V0TW9udGgoKSkpLHRoaXMuX2lzSW5SYW5nZSh0LG8pfSxfaXNJblJhbmdlOmZ1bmN0aW9uKHQsZSl7dmFyIGkscyxuPXRoaXMuX2dldE1pbk1heERhdGUodCxcIm1pblwiKSxvPXRoaXMuX2dldE1pbk1heERhdGUodCxcIm1heFwiKSxhPW51bGwscj1udWxsLGw9dGhpcy5fZ2V0KHQsXCJ5ZWFyUmFuZ2VcIik7cmV0dXJuIGwmJihpPWwuc3BsaXQoXCI6XCIpLHM9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLGE9cGFyc2VJbnQoaVswXSwxMCkscj1wYXJzZUludChpWzFdLDEwKSxpWzBdLm1hdGNoKC9bK1xcLV0uKi8pJiYoYSs9cyksaVsxXS5tYXRjaCgvWytcXC1dLiovKSYmKHIrPXMpKSwoIW58fGUuZ2V0VGltZSgpPj1uLmdldFRpbWUoKSkmJighb3x8ZS5nZXRUaW1lKCk8PW8uZ2V0VGltZSgpKSYmKCFhfHxlLmdldEZ1bGxZZWFyKCk+PWEpJiYoIXJ8fHI+PWUuZ2V0RnVsbFllYXIoKSl9LF9nZXRGb3JtYXRDb25maWc6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fZ2V0KHQsXCJzaG9ydFllYXJDdXRvZmZcIik7cmV0dXJuIGU9XCJzdHJpbmdcIiE9dHlwZW9mIGU/ZToobmV3IERhdGUpLmdldEZ1bGxZZWFyKCklMTAwK3BhcnNlSW50KGUsMTApLHtzaG9ydFllYXJDdXRvZmY6ZSxkYXlOYW1lc1Nob3J0OnRoaXMuX2dldCh0LFwiZGF5TmFtZXNTaG9ydFwiKSxkYXlOYW1lczp0aGlzLl9nZXQodCxcImRheU5hbWVzXCIpLG1vbnRoTmFtZXNTaG9ydDp0aGlzLl9nZXQodCxcIm1vbnRoTmFtZXNTaG9ydFwiKSxtb250aE5hbWVzOnRoaXMuX2dldCh0LFwibW9udGhOYW1lc1wiKX19LF9mb3JtYXREYXRlOmZ1bmN0aW9uKHQsZSxpLHMpe2V8fCh0LmN1cnJlbnREYXk9dC5zZWxlY3RlZERheSx0LmN1cnJlbnRNb250aD10LnNlbGVjdGVkTW9udGgsdC5jdXJyZW50WWVhcj10LnNlbGVjdGVkWWVhcik7dmFyIG49ZT9cIm9iamVjdFwiPT10eXBlb2YgZT9lOnRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKHMsaSxlKSk6dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodC5jdXJyZW50WWVhcix0LmN1cnJlbnRNb250aCx0LmN1cnJlbnREYXkpKTtyZXR1cm4gdGhpcy5mb3JtYXREYXRlKHRoaXMuX2dldCh0LFwiZGF0ZUZvcm1hdFwiKSxuLHRoaXMuX2dldEZvcm1hdENvbmZpZyh0KSl9fSksdC5mbi5kYXRlcGlja2VyPWZ1bmN0aW9uKGUpe2lmKCF0aGlzLmxlbmd0aClyZXR1cm4gdGhpczt0LmRhdGVwaWNrZXIuaW5pdGlhbGl6ZWR8fCh0KGRvY3VtZW50KS5vbihcIm1vdXNlZG93blwiLHQuZGF0ZXBpY2tlci5fY2hlY2tFeHRlcm5hbENsaWNrKSx0LmRhdGVwaWNrZXIuaW5pdGlhbGl6ZWQ9ITApLDA9PT10KFwiI1wiK3QuZGF0ZXBpY2tlci5fbWFpbkRpdklkKS5sZW5ndGgmJnQoXCJib2R5XCIpLmFwcGVuZCh0LmRhdGVwaWNrZXIuZHBEaXYpO3ZhciBpPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKTtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgZXx8XCJpc0Rpc2FibGVkXCIhPT1lJiZcImdldERhdGVcIiE9PWUmJlwid2lkZ2V0XCIhPT1lP1wib3B0aW9uXCI9PT1lJiYyPT09YXJndW1lbnRzLmxlbmd0aCYmXCJzdHJpbmdcIj09dHlwZW9mIGFyZ3VtZW50c1sxXT90LmRhdGVwaWNrZXJbXCJfXCIrZStcIkRhdGVwaWNrZXJcIl0uYXBwbHkodC5kYXRlcGlja2VyLFt0aGlzWzBdXS5jb25jYXQoaSkpOnRoaXMuZWFjaChmdW5jdGlvbigpe1wic3RyaW5nXCI9PXR5cGVvZiBlP3QuZGF0ZXBpY2tlcltcIl9cIitlK1wiRGF0ZXBpY2tlclwiXS5hcHBseSh0LmRhdGVwaWNrZXIsW3RoaXNdLmNvbmNhdChpKSk6dC5kYXRlcGlja2VyLl9hdHRhY2hEYXRlcGlja2VyKHRoaXMsZSl9KTp0LmRhdGVwaWNrZXJbXCJfXCIrZStcIkRhdGVwaWNrZXJcIl0uYXBwbHkodC5kYXRlcGlja2VyLFt0aGlzWzBdXS5jb25jYXQoaSkpfSx0LmRhdGVwaWNrZXI9bmV3IGksdC5kYXRlcGlja2VyLmluaXRpYWxpemVkPSExLHQuZGF0ZXBpY2tlci51dWlkPShuZXcgRGF0ZSkuZ2V0VGltZSgpLHQuZGF0ZXBpY2tlci52ZXJzaW9uPVwiMS4xMi4xXCIsdC5kYXRlcGlja2VyLHQudWkuaWU9ISEvbXNpZSBbXFx3Ll0rLy5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSk7dmFyIGg9ITE7dChkb2N1bWVudCkub24oXCJtb3VzZXVwXCIsZnVuY3Rpb24oKXtoPSExfSksdC53aWRnZXQoXCJ1aS5tb3VzZVwiLHt2ZXJzaW9uOlwiMS4xMi4xXCIsb3B0aW9uczp7Y2FuY2VsOlwiaW5wdXQsIHRleHRhcmVhLCBidXR0b24sIHNlbGVjdCwgb3B0aW9uXCIsZGlzdGFuY2U6MSxkZWxheTowfSxfbW91c2VJbml0OmZ1bmN0aW9uKCl7dmFyIGU9dGhpczt0aGlzLmVsZW1lbnQub24oXCJtb3VzZWRvd24uXCIrdGhpcy53aWRnZXROYW1lLGZ1bmN0aW9uKHQpe3JldHVybiBlLl9tb3VzZURvd24odCl9KS5vbihcImNsaWNrLlwiK3RoaXMud2lkZ2V0TmFtZSxmdW5jdGlvbihpKXtyZXR1cm4hMD09PXQuZGF0YShpLnRhcmdldCxlLndpZGdldE5hbWUrXCIucHJldmVudENsaWNrRXZlbnRcIik/KHQucmVtb3ZlRGF0YShpLnRhcmdldCxlLndpZGdldE5hbWUrXCIucHJldmVudENsaWNrRXZlbnRcIiksaS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSwhMSk6dm9pZCAwfSksdGhpcy5zdGFydGVkPSExfSxfbW91c2VEZXN0cm95OmZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50Lm9mZihcIi5cIit0aGlzLndpZGdldE5hbWUpLHRoaXMuX21vdXNlTW92ZURlbGVnYXRlJiZ0aGlzLmRvY3VtZW50Lm9mZihcIm1vdXNlbW92ZS5cIit0aGlzLndpZGdldE5hbWUsdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUpLm9mZihcIm1vdXNldXAuXCIrdGhpcy53aWRnZXROYW1lLHRoaXMuX21vdXNlVXBEZWxlZ2F0ZSl9LF9tb3VzZURvd246ZnVuY3Rpb24oZSl7aWYoIWgpe3RoaXMuX21vdXNlTW92ZWQ9ITEsdGhpcy5fbW91c2VTdGFydGVkJiZ0aGlzLl9tb3VzZVVwKGUpLHRoaXMuX21vdXNlRG93bkV2ZW50PWU7dmFyIGk9dGhpcyxzPTE9PT1lLndoaWNoLG49XCJzdHJpbmdcIj09dHlwZW9mIHRoaXMub3B0aW9ucy5jYW5jZWwmJmUudGFyZ2V0Lm5vZGVOYW1lP3QoZS50YXJnZXQpLmNsb3Nlc3QodGhpcy5vcHRpb25zLmNhbmNlbCkubGVuZ3RoOiExO3JldHVybiBzJiYhbiYmdGhpcy5fbW91c2VDYXB0dXJlKGUpPyh0aGlzLm1vdXNlRGVsYXlNZXQ9IXRoaXMub3B0aW9ucy5kZWxheSx0aGlzLm1vdXNlRGVsYXlNZXR8fCh0aGlzLl9tb3VzZURlbGF5VGltZXI9c2V0VGltZW91dChmdW5jdGlvbigpe2kubW91c2VEZWxheU1ldD0hMH0sdGhpcy5vcHRpb25zLmRlbGF5KSksdGhpcy5fbW91c2VEaXN0YW5jZU1ldChlKSYmdGhpcy5fbW91c2VEZWxheU1ldChlKSYmKHRoaXMuX21vdXNlU3RhcnRlZD10aGlzLl9tb3VzZVN0YXJ0KGUpIT09ITEsIXRoaXMuX21vdXNlU3RhcnRlZCk/KGUucHJldmVudERlZmF1bHQoKSwhMCk6KCEwPT09dC5kYXRhKGUudGFyZ2V0LHRoaXMud2lkZ2V0TmFtZStcIi5wcmV2ZW50Q2xpY2tFdmVudFwiKSYmdC5yZW1vdmVEYXRhKGUudGFyZ2V0LHRoaXMud2lkZ2V0TmFtZStcIi5wcmV2ZW50Q2xpY2tFdmVudFwiKSx0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZT1mdW5jdGlvbih0KXtyZXR1cm4gaS5fbW91c2VNb3ZlKHQpfSx0aGlzLl9tb3VzZVVwRGVsZWdhdGU9ZnVuY3Rpb24odCl7cmV0dXJuIGkuX21vdXNlVXAodCl9LHRoaXMuZG9jdW1lbnQub24oXCJtb3VzZW1vdmUuXCIrdGhpcy53aWRnZXROYW1lLHRoaXMuX21vdXNlTW92ZURlbGVnYXRlKS5vbihcIm1vdXNldXAuXCIrdGhpcy53aWRnZXROYW1lLHRoaXMuX21vdXNlVXBEZWxlZ2F0ZSksZS5wcmV2ZW50RGVmYXVsdCgpLGg9ITAsITApKTohMH19LF9tb3VzZU1vdmU6ZnVuY3Rpb24oZSl7aWYodGhpcy5fbW91c2VNb3ZlZCl7aWYodC51aS5pZSYmKCFkb2N1bWVudC5kb2N1bWVudE1vZGV8fDk+ZG9jdW1lbnQuZG9jdW1lbnRNb2RlKSYmIWUuYnV0dG9uKXJldHVybiB0aGlzLl9tb3VzZVVwKGUpO2lmKCFlLndoaWNoKWlmKGUub3JpZ2luYWxFdmVudC5hbHRLZXl8fGUub3JpZ2luYWxFdmVudC5jdHJsS2V5fHxlLm9yaWdpbmFsRXZlbnQubWV0YUtleXx8ZS5vcmlnaW5hbEV2ZW50LnNoaWZ0S2V5KXRoaXMuaWdub3JlTWlzc2luZ1doaWNoPSEwO2Vsc2UgaWYoIXRoaXMuaWdub3JlTWlzc2luZ1doaWNoKXJldHVybiB0aGlzLl9tb3VzZVVwKGUpfXJldHVybihlLndoaWNofHxlLmJ1dHRvbikmJih0aGlzLl9tb3VzZU1vdmVkPSEwKSx0aGlzLl9tb3VzZVN0YXJ0ZWQ/KHRoaXMuX21vdXNlRHJhZyhlKSxlLnByZXZlbnREZWZhdWx0KCkpOih0aGlzLl9tb3VzZURpc3RhbmNlTWV0KGUpJiZ0aGlzLl9tb3VzZURlbGF5TWV0KGUpJiYodGhpcy5fbW91c2VTdGFydGVkPXRoaXMuX21vdXNlU3RhcnQodGhpcy5fbW91c2VEb3duRXZlbnQsZSkhPT0hMSx0aGlzLl9tb3VzZVN0YXJ0ZWQ/dGhpcy5fbW91c2VEcmFnKGUpOnRoaXMuX21vdXNlVXAoZSkpLCF0aGlzLl9tb3VzZVN0YXJ0ZWQpfSxfbW91c2VVcDpmdW5jdGlvbihlKXt0aGlzLmRvY3VtZW50Lm9mZihcIm1vdXNlbW92ZS5cIit0aGlzLndpZGdldE5hbWUsdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUpLm9mZihcIm1vdXNldXAuXCIrdGhpcy53aWRnZXROYW1lLHRoaXMuX21vdXNlVXBEZWxlZ2F0ZSksdGhpcy5fbW91c2VTdGFydGVkJiYodGhpcy5fbW91c2VTdGFydGVkPSExLGUudGFyZ2V0PT09dGhpcy5fbW91c2VEb3duRXZlbnQudGFyZ2V0JiZ0LmRhdGEoZS50YXJnZXQsdGhpcy53aWRnZXROYW1lK1wiLnByZXZlbnRDbGlja0V2ZW50XCIsITApLHRoaXMuX21vdXNlU3RvcChlKSksdGhpcy5fbW91c2VEZWxheVRpbWVyJiYoY2xlYXJUaW1lb3V0KHRoaXMuX21vdXNlRGVsYXlUaW1lciksZGVsZXRlIHRoaXMuX21vdXNlRGVsYXlUaW1lciksdGhpcy5pZ25vcmVNaXNzaW5nV2hpY2g9ITEsaD0hMSxlLnByZXZlbnREZWZhdWx0KCl9LF9tb3VzZURpc3RhbmNlTWV0OmZ1bmN0aW9uKHQpe3JldHVybiBNYXRoLm1heChNYXRoLmFicyh0aGlzLl9tb3VzZURvd25FdmVudC5wYWdlWC10LnBhZ2VYKSxNYXRoLmFicyh0aGlzLl9tb3VzZURvd25FdmVudC5wYWdlWS10LnBhZ2VZKSk+PXRoaXMub3B0aW9ucy5kaXN0YW5jZX0sX21vdXNlRGVsYXlNZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5tb3VzZURlbGF5TWV0fSxfbW91c2VTdGFydDpmdW5jdGlvbigpe30sX21vdXNlRHJhZzpmdW5jdGlvbigpe30sX21vdXNlU3RvcDpmdW5jdGlvbigpe30sX21vdXNlQ2FwdHVyZTpmdW5jdGlvbigpe3JldHVybiEwfX0pLHQud2lkZ2V0KFwidWkuc2VsZWN0bWVudVwiLFt0LnVpLmZvcm1SZXNldE1peGluLHt2ZXJzaW9uOlwiMS4xMi4xXCIsZGVmYXVsdEVsZW1lbnQ6XCI8c2VsZWN0PlwiLG9wdGlvbnM6e2FwcGVuZFRvOm51bGwsY2xhc3Nlczp7XCJ1aS1zZWxlY3RtZW51LWJ1dHRvbi1vcGVuXCI6XCJ1aS1jb3JuZXItdG9wXCIsXCJ1aS1zZWxlY3RtZW51LWJ1dHRvbi1jbG9zZWRcIjpcInVpLWNvcm5lci1hbGxcIn0sZGlzYWJsZWQ6bnVsbCxpY29uczp7YnV0dG9uOlwidWktaWNvbi10cmlhbmdsZS0xLXNcIn0scG9zaXRpb246e215OlwibGVmdCB0b3BcIixhdDpcImxlZnQgYm90dG9tXCIsY29sbGlzaW9uOlwibm9uZVwifSx3aWR0aDohMSxjaGFuZ2U6bnVsbCxjbG9zZTpudWxsLGZvY3VzOm51bGwsb3BlbjpudWxsLHNlbGVjdDpudWxsfSxfY3JlYXRlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5lbGVtZW50LnVuaXF1ZUlkKCkuYXR0cihcImlkXCIpO3RoaXMuaWRzPXtlbGVtZW50OmUsYnV0dG9uOmUrXCItYnV0dG9uXCIsbWVudTplK1wiLW1lbnVcIn0sdGhpcy5fZHJhd0J1dHRvbigpLHRoaXMuX2RyYXdNZW51KCksdGhpcy5fYmluZEZvcm1SZXNldEhhbmRsZXIoKSx0aGlzLl9yZW5kZXJlZD0hMSx0aGlzLm1lbnVJdGVtcz10KCl9LF9kcmF3QnV0dG9uOmZ1bmN0aW9uKCl7dmFyIGUsaT10aGlzLHM9dGhpcy5fcGFyc2VPcHRpb24odGhpcy5lbGVtZW50LmZpbmQoXCJvcHRpb246c2VsZWN0ZWRcIiksdGhpcy5lbGVtZW50WzBdLnNlbGVjdGVkSW5kZXgpO3RoaXMubGFiZWxzPXRoaXMuZWxlbWVudC5sYWJlbHMoKS5hdHRyKFwiZm9yXCIsdGhpcy5pZHMuYnV0dG9uKSx0aGlzLl9vbih0aGlzLmxhYmVscyx7Y2xpY2s6ZnVuY3Rpb24odCl7dGhpcy5idXR0b24uZm9jdXMoKSx0LnByZXZlbnREZWZhdWx0KCl9fSksdGhpcy5lbGVtZW50LmhpZGUoKSx0aGlzLmJ1dHRvbj10KFwiPHNwYW4+XCIse3RhYmluZGV4OnRoaXMub3B0aW9ucy5kaXNhYmxlZD8tMTowLGlkOnRoaXMuaWRzLmJ1dHRvbixyb2xlOlwiY29tYm9ib3hcIixcImFyaWEtZXhwYW5kZWRcIjpcImZhbHNlXCIsXCJhcmlhLWF1dG9jb21wbGV0ZVwiOlwibGlzdFwiLFwiYXJpYS1vd25zXCI6dGhpcy5pZHMubWVudSxcImFyaWEtaGFzcG9wdXBcIjpcInRydWVcIix0aXRsZTp0aGlzLmVsZW1lbnQuYXR0cihcInRpdGxlXCIpfSkuaW5zZXJ0QWZ0ZXIodGhpcy5lbGVtZW50KSx0aGlzLl9hZGRDbGFzcyh0aGlzLmJ1dHRvbixcInVpLXNlbGVjdG1lbnUtYnV0dG9uIHVpLXNlbGVjdG1lbnUtYnV0dG9uLWNsb3NlZFwiLFwidWktYnV0dG9uIHVpLXdpZGdldFwiKSxlPXQoXCI8c3Bhbj5cIikuYXBwZW5kVG8odGhpcy5idXR0b24pLHRoaXMuX2FkZENsYXNzKGUsXCJ1aS1zZWxlY3RtZW51LWljb25cIixcInVpLWljb24gXCIrdGhpcy5vcHRpb25zLmljb25zLmJ1dHRvbiksdGhpcy5idXR0b25JdGVtPXRoaXMuX3JlbmRlckJ1dHRvbkl0ZW0ocykuYXBwZW5kVG8odGhpcy5idXR0b24pLHRoaXMub3B0aW9ucy53aWR0aCE9PSExJiZ0aGlzLl9yZXNpemVCdXR0b24oKSx0aGlzLl9vbih0aGlzLmJ1dHRvbix0aGlzLl9idXR0b25FdmVudHMpLHRoaXMuYnV0dG9uLm9uZShcImZvY3VzaW5cIixmdW5jdGlvbigpe2kuX3JlbmRlcmVkfHxpLl9yZWZyZXNoTWVudSgpfSl9LF9kcmF3TWVudTpmdW5jdGlvbigpe3ZhciBlPXRoaXM7dGhpcy5tZW51PXQoXCI8dWw+XCIse1wiYXJpYS1oaWRkZW5cIjpcInRydWVcIixcImFyaWEtbGFiZWxsZWRieVwiOnRoaXMuaWRzLmJ1dHRvbixpZDp0aGlzLmlkcy5tZW51fSksdGhpcy5tZW51V3JhcD10KFwiPGRpdj5cIikuYXBwZW5kKHRoaXMubWVudSksdGhpcy5fYWRkQ2xhc3ModGhpcy5tZW51V3JhcCxcInVpLXNlbGVjdG1lbnUtbWVudVwiLFwidWktZnJvbnRcIiksdGhpcy5tZW51V3JhcC5hcHBlbmRUbyh0aGlzLl9hcHBlbmRUbygpKSx0aGlzLm1lbnVJbnN0YW5jZT10aGlzLm1lbnUubWVudSh7Y2xhc3Nlczp7XCJ1aS1tZW51XCI6XCJ1aS1jb3JuZXItYm90dG9tXCJ9LHJvbGU6XCJsaXN0Ym94XCIsc2VsZWN0OmZ1bmN0aW9uKHQsaSl7dC5wcmV2ZW50RGVmYXVsdCgpLGUuX3NldFNlbGVjdGlvbigpLGUuX3NlbGVjdChpLml0ZW0uZGF0YShcInVpLXNlbGVjdG1lbnUtaXRlbVwiKSx0KX0sZm9jdXM6ZnVuY3Rpb24odCxpKXt2YXIgcz1pLml0ZW0uZGF0YShcInVpLXNlbGVjdG1lbnUtaXRlbVwiKTtudWxsIT1lLmZvY3VzSW5kZXgmJnMuaW5kZXghPT1lLmZvY3VzSW5kZXgmJihlLl90cmlnZ2VyKFwiZm9jdXNcIix0LHtpdGVtOnN9KSxlLmlzT3Blbnx8ZS5fc2VsZWN0KHMsdCkpLGUuZm9jdXNJbmRleD1zLmluZGV4LGUuYnV0dG9uLmF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIixlLm1lbnVJdGVtcy5lcShzLmluZGV4KS5hdHRyKFwiaWRcIikpfX0pLm1lbnUoXCJpbnN0YW5jZVwiKSx0aGlzLm1lbnVJbnN0YW5jZS5fb2ZmKHRoaXMubWVudSxcIm1vdXNlbGVhdmVcIiksdGhpcy5tZW51SW5zdGFuY2UuX2Nsb3NlT25Eb2N1bWVudENsaWNrPWZ1bmN0aW9uKCl7cmV0dXJuITF9LHRoaXMubWVudUluc3RhbmNlLl9pc0RpdmlkZXI9ZnVuY3Rpb24oKXtyZXR1cm4hMX19LHJlZnJlc2g6ZnVuY3Rpb24oKXt0aGlzLl9yZWZyZXNoTWVudSgpLHRoaXMuYnV0dG9uSXRlbS5yZXBsYWNlV2l0aCh0aGlzLmJ1dHRvbkl0ZW09dGhpcy5fcmVuZGVyQnV0dG9uSXRlbSh0aGlzLl9nZXRTZWxlY3RlZEl0ZW0oKS5kYXRhKFwidWktc2VsZWN0bWVudS1pdGVtXCIpfHx7fSkpLG51bGw9PT10aGlzLm9wdGlvbnMud2lkdGgmJnRoaXMuX3Jlc2l6ZUJ1dHRvbigpfSxfcmVmcmVzaE1lbnU6ZnVuY3Rpb24oKXt2YXIgdCxlPXRoaXMuZWxlbWVudC5maW5kKFwib3B0aW9uXCIpO3RoaXMubWVudS5lbXB0eSgpLHRoaXMuX3BhcnNlT3B0aW9ucyhlKSx0aGlzLl9yZW5kZXJNZW51KHRoaXMubWVudSx0aGlzLml0ZW1zKSx0aGlzLm1lbnVJbnN0YW5jZS5yZWZyZXNoKCksdGhpcy5tZW51SXRlbXM9dGhpcy5tZW51LmZpbmQoXCJsaVwiKS5ub3QoXCIudWktc2VsZWN0bWVudS1vcHRncm91cFwiKS5maW5kKFwiLnVpLW1lbnUtaXRlbS13cmFwcGVyXCIpLHRoaXMuX3JlbmRlcmVkPSEwLGUubGVuZ3RoJiYodD10aGlzLl9nZXRTZWxlY3RlZEl0ZW0oKSx0aGlzLm1lbnVJbnN0YW5jZS5mb2N1cyhudWxsLHQpLHRoaXMuX3NldEFyaWEodC5kYXRhKFwidWktc2VsZWN0bWVudS1pdGVtXCIpKSx0aGlzLl9zZXRPcHRpb24oXCJkaXNhYmxlZFwiLHRoaXMuZWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIikpKX0sb3BlbjpmdW5jdGlvbih0KXt0aGlzLm9wdGlvbnMuZGlzYWJsZWR8fCh0aGlzLl9yZW5kZXJlZD8odGhpcy5fcmVtb3ZlQ2xhc3ModGhpcy5tZW51LmZpbmQoXCIudWktc3RhdGUtYWN0aXZlXCIpLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksdGhpcy5tZW51SW5zdGFuY2UuZm9jdXMobnVsbCx0aGlzLl9nZXRTZWxlY3RlZEl0ZW0oKSkpOnRoaXMuX3JlZnJlc2hNZW51KCksdGhpcy5tZW51SXRlbXMubGVuZ3RoJiYodGhpcy5pc09wZW49ITAsdGhpcy5fdG9nZ2xlQXR0cigpLHRoaXMuX3Jlc2l6ZU1lbnUoKSx0aGlzLl9wb3NpdGlvbigpLHRoaXMuX29uKHRoaXMuZG9jdW1lbnQsdGhpcy5fZG9jdW1lbnRDbGljayksdGhpcy5fdHJpZ2dlcihcIm9wZW5cIix0KSkpfSxfcG9zaXRpb246ZnVuY3Rpb24oKXt0aGlzLm1lbnVXcmFwLnBvc2l0aW9uKHQuZXh0ZW5kKHtvZjp0aGlzLmJ1dHRvbn0sdGhpcy5vcHRpb25zLnBvc2l0aW9uKSl9LGNsb3NlOmZ1bmN0aW9uKHQpe3RoaXMuaXNPcGVuJiYodGhpcy5pc09wZW49ITEsdGhpcy5fdG9nZ2xlQXR0cigpLHRoaXMucmFuZ2U9bnVsbCx0aGlzLl9vZmYodGhpcy5kb2N1bWVudCksdGhpcy5fdHJpZ2dlcihcImNsb3NlXCIsdCkpfSx3aWRnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5idXR0b259LG1lbnVXaWRnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5tZW51fSxfcmVuZGVyQnV0dG9uSXRlbTpmdW5jdGlvbihlKXt2YXIgaT10KFwiPHNwYW4+XCIpO3JldHVybiB0aGlzLl9zZXRUZXh0KGksZS5sYWJlbCksdGhpcy5fYWRkQ2xhc3MoaSxcInVpLXNlbGVjdG1lbnUtdGV4dFwiKSxpfSxfcmVuZGVyTWVudTpmdW5jdGlvbihlLGkpe3ZhciBzPXRoaXMsbj1cIlwiO3QuZWFjaChpLGZ1bmN0aW9uKGksbyl7dmFyIGE7by5vcHRncm91cCE9PW4mJihhPXQoXCI8bGk+XCIse3RleHQ6by5vcHRncm91cH0pLHMuX2FkZENsYXNzKGEsXCJ1aS1zZWxlY3RtZW51LW9wdGdyb3VwXCIsXCJ1aS1tZW51LWRpdmlkZXJcIisoby5lbGVtZW50LnBhcmVudChcIm9wdGdyb3VwXCIpLnByb3AoXCJkaXNhYmxlZFwiKT9cIiB1aS1zdGF0ZS1kaXNhYmxlZFwiOlwiXCIpKSxhLmFwcGVuZFRvKGUpLG49by5vcHRncm91cCkscy5fcmVuZGVySXRlbURhdGEoZSxvKX0pfSxfcmVuZGVySXRlbURhdGE6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5fcmVuZGVySXRlbSh0LGUpLmRhdGEoXCJ1aS1zZWxlY3RtZW51LWl0ZW1cIixlKX0sX3JlbmRlckl0ZW06ZnVuY3Rpb24oZSxpKXt2YXIgcz10KFwiPGxpPlwiKSxuPXQoXCI8ZGl2PlwiLHt0aXRsZTppLmVsZW1lbnQuYXR0cihcInRpdGxlXCIpfSk7cmV0dXJuIGkuZGlzYWJsZWQmJnRoaXMuX2FkZENsYXNzKHMsbnVsbCxcInVpLXN0YXRlLWRpc2FibGVkXCIpLHRoaXMuX3NldFRleHQobixpLmxhYmVsKSxzLmFwcGVuZChuKS5hcHBlbmRUbyhlKX0sX3NldFRleHQ6ZnVuY3Rpb24odCxlKXtlP3QudGV4dChlKTp0Lmh0bWwoXCImIzE2MDtcIil9LF9tb3ZlOmZ1bmN0aW9uKHQsZSl7dmFyIGkscyxuPVwiLnVpLW1lbnUtaXRlbVwiO3RoaXMuaXNPcGVuP2k9dGhpcy5tZW51SXRlbXMuZXEodGhpcy5mb2N1c0luZGV4KS5wYXJlbnQoXCJsaVwiKTooaT10aGlzLm1lbnVJdGVtcy5lcSh0aGlzLmVsZW1lbnRbMF0uc2VsZWN0ZWRJbmRleCkucGFyZW50KFwibGlcIiksbis9XCI6bm90KC51aS1zdGF0ZS1kaXNhYmxlZClcIikscz1cImZpcnN0XCI9PT10fHxcImxhc3RcIj09PXQ/aVtcImZpcnN0XCI9PT10P1wicHJldkFsbFwiOlwibmV4dEFsbFwiXShuKS5lcSgtMSk6aVt0K1wiQWxsXCJdKG4pLmVxKDApLHMubGVuZ3RoJiZ0aGlzLm1lbnVJbnN0YW5jZS5mb2N1cyhlLHMpfSxfZ2V0U2VsZWN0ZWRJdGVtOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubWVudUl0ZW1zLmVxKHRoaXMuZWxlbWVudFswXS5zZWxlY3RlZEluZGV4KS5wYXJlbnQoXCJsaVwiKX0sX3RvZ2dsZTpmdW5jdGlvbih0KXt0aGlzW3RoaXMuaXNPcGVuP1wiY2xvc2VcIjpcIm9wZW5cIl0odCl9LF9zZXRTZWxlY3Rpb246ZnVuY3Rpb24oKXt2YXIgdDt0aGlzLnJhbmdlJiYod2luZG93LmdldFNlbGVjdGlvbj8odD13aW5kb3cuZ2V0U2VsZWN0aW9uKCksdC5yZW1vdmVBbGxSYW5nZXMoKSx0LmFkZFJhbmdlKHRoaXMucmFuZ2UpKTp0aGlzLnJhbmdlLnNlbGVjdCgpLHRoaXMuYnV0dG9uLmZvY3VzKCkpfSxfZG9jdW1lbnRDbGljazp7bW91c2Vkb3duOmZ1bmN0aW9uKGUpe3RoaXMuaXNPcGVuJiYodChlLnRhcmdldCkuY2xvc2VzdChcIi51aS1zZWxlY3RtZW51LW1lbnUsICNcIit0LnVpLmVzY2FwZVNlbGVjdG9yKHRoaXMuaWRzLmJ1dHRvbikpLmxlbmd0aHx8dGhpcy5jbG9zZShlKSl9fSxfYnV0dG9uRXZlbnRzOnttb3VzZWRvd246ZnVuY3Rpb24oKXt2YXIgdDt3aW5kb3cuZ2V0U2VsZWN0aW9uPyh0PXdpbmRvdy5nZXRTZWxlY3Rpb24oKSx0LnJhbmdlQ291bnQmJih0aGlzLnJhbmdlPXQuZ2V0UmFuZ2VBdCgwKSkpOnRoaXMucmFuZ2U9ZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCl9LGNsaWNrOmZ1bmN0aW9uKHQpe3RoaXMuX3NldFNlbGVjdGlvbigpLHRoaXMuX3RvZ2dsZSh0KX0sa2V5ZG93bjpmdW5jdGlvbihlKXt2YXIgaT0hMDtzd2l0Y2goZS5rZXlDb2RlKXtjYXNlIHQudWkua2V5Q29kZS5UQUI6Y2FzZSB0LnVpLmtleUNvZGUuRVNDQVBFOnRoaXMuY2xvc2UoZSksaT0hMTticmVhaztjYXNlIHQudWkua2V5Q29kZS5FTlRFUjp0aGlzLmlzT3BlbiYmdGhpcy5fc2VsZWN0Rm9jdXNlZEl0ZW0oZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuVVA6ZS5hbHRLZXk/dGhpcy5fdG9nZ2xlKGUpOnRoaXMuX21vdmUoXCJwcmV2XCIsZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRE9XTjplLmFsdEtleT90aGlzLl90b2dnbGUoZSk6dGhpcy5fbW92ZShcIm5leHRcIixlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5TUEFDRTp0aGlzLmlzT3Blbj90aGlzLl9zZWxlY3RGb2N1c2VkSXRlbShlKTp0aGlzLl90b2dnbGUoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuTEVGVDp0aGlzLl9tb3ZlKFwicHJldlwiLGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlJJR0hUOnRoaXMuX21vdmUoXCJuZXh0XCIsZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuSE9NRTpjYXNlIHQudWkua2V5Q29kZS5QQUdFX1VQOnRoaXMuX21vdmUoXCJmaXJzdFwiLGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkVORDpjYXNlIHQudWkua2V5Q29kZS5QQUdFX0RPV046dGhpcy5fbW92ZShcImxhc3RcIixlKTticmVhaztkZWZhdWx0OnRoaXMubWVudS50cmlnZ2VyKGUpLGk9ITF9aSYmZS5wcmV2ZW50RGVmYXVsdCgpfX0sX3NlbGVjdEZvY3VzZWRJdGVtOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMubWVudUl0ZW1zLmVxKHRoaXMuZm9jdXNJbmRleCkucGFyZW50KFwibGlcIik7ZS5oYXNDbGFzcyhcInVpLXN0YXRlLWRpc2FibGVkXCIpfHx0aGlzLl9zZWxlY3QoZS5kYXRhKFwidWktc2VsZWN0bWVudS1pdGVtXCIpLHQpfSxfc2VsZWN0OmZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5lbGVtZW50WzBdLnNlbGVjdGVkSW5kZXg7dGhpcy5lbGVtZW50WzBdLnNlbGVjdGVkSW5kZXg9dC5pbmRleCx0aGlzLmJ1dHRvbkl0ZW0ucmVwbGFjZVdpdGgodGhpcy5idXR0b25JdGVtPXRoaXMuX3JlbmRlckJ1dHRvbkl0ZW0odCkpLHRoaXMuX3NldEFyaWEodCksdGhpcy5fdHJpZ2dlcihcInNlbGVjdFwiLGUse2l0ZW06dH0pLHQuaW5kZXghPT1pJiZ0aGlzLl90cmlnZ2VyKFwiY2hhbmdlXCIsZSx7aXRlbTp0fSksdGhpcy5jbG9zZShlKX0sX3NldEFyaWE6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5tZW51SXRlbXMuZXEodC5pbmRleCkuYXR0cihcImlkXCIpO3RoaXMuYnV0dG9uLmF0dHIoe1wiYXJpYS1sYWJlbGxlZGJ5XCI6ZSxcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiOmV9KSx0aGlzLm1lbnUuYXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiLGUpfSxfc2V0T3B0aW9uOmZ1bmN0aW9uKHQsZSl7aWYoXCJpY29uc1wiPT09dCl7dmFyIGk9dGhpcy5idXR0b24uZmluZChcInNwYW4udWktaWNvblwiKTt0aGlzLl9yZW1vdmVDbGFzcyhpLG51bGwsdGhpcy5vcHRpb25zLmljb25zLmJ1dHRvbikuX2FkZENsYXNzKGksbnVsbCxlLmJ1dHRvbil9dGhpcy5fc3VwZXIodCxlKSxcImFwcGVuZFRvXCI9PT10JiZ0aGlzLm1lbnVXcmFwLmFwcGVuZFRvKHRoaXMuX2FwcGVuZFRvKCkpLFwid2lkdGhcIj09PXQmJnRoaXMuX3Jlc2l6ZUJ1dHRvbigpfSxfc2V0T3B0aW9uRGlzYWJsZWQ6ZnVuY3Rpb24odCl7dGhpcy5fc3VwZXIodCksdGhpcy5tZW51SW5zdGFuY2Uub3B0aW9uKFwiZGlzYWJsZWRcIix0KSx0aGlzLmJ1dHRvbi5hdHRyKFwiYXJpYS1kaXNhYmxlZFwiLHQpLHRoaXMuX3RvZ2dsZUNsYXNzKHRoaXMuYnV0dG9uLG51bGwsXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiLHQpLHRoaXMuZWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIix0KSx0Pyh0aGlzLmJ1dHRvbi5hdHRyKFwidGFiaW5kZXhcIiwtMSksdGhpcy5jbG9zZSgpKTp0aGlzLmJ1dHRvbi5hdHRyKFwidGFiaW5kZXhcIiwwKX0sX2FwcGVuZFRvOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5vcHRpb25zLmFwcGVuZFRvO3JldHVybiBlJiYoZT1lLmpxdWVyeXx8ZS5ub2RlVHlwZT90KGUpOnRoaXMuZG9jdW1lbnQuZmluZChlKS5lcSgwKSksZSYmZVswXXx8KGU9dGhpcy5lbGVtZW50LmNsb3Nlc3QoXCIudWktZnJvbnQsIGRpYWxvZ1wiKSksZS5sZW5ndGh8fChlPXRoaXMuZG9jdW1lbnRbMF0uYm9keSksZX0sX3RvZ2dsZUF0dHI6ZnVuY3Rpb24oKXt0aGlzLmJ1dHRvbi5hdHRyKFwiYXJpYS1leHBhbmRlZFwiLHRoaXMuaXNPcGVuKSx0aGlzLl9yZW1vdmVDbGFzcyh0aGlzLmJ1dHRvbixcInVpLXNlbGVjdG1lbnUtYnV0dG9uLVwiKyh0aGlzLmlzT3Blbj9cImNsb3NlZFwiOlwib3BlblwiKSkuX2FkZENsYXNzKHRoaXMuYnV0dG9uLFwidWktc2VsZWN0bWVudS1idXR0b24tXCIrKHRoaXMuaXNPcGVuP1wib3BlblwiOlwiY2xvc2VkXCIpKS5fdG9nZ2xlQ2xhc3ModGhpcy5tZW51V3JhcCxcInVpLXNlbGVjdG1lbnUtb3BlblwiLG51bGwsdGhpcy5pc09wZW4pLHRoaXMubWVudS5hdHRyKFwiYXJpYS1oaWRkZW5cIiwhdGhpcy5pc09wZW4pfSxfcmVzaXplQnV0dG9uOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLndpZHRoO3JldHVybiB0PT09ITE/KHRoaXMuYnV0dG9uLmNzcyhcIndpZHRoXCIsXCJcIiksdm9pZCAwKToobnVsbD09PXQmJih0PXRoaXMuZWxlbWVudC5zaG93KCkub3V0ZXJXaWR0aCgpLHRoaXMuZWxlbWVudC5oaWRlKCkpLHRoaXMuYnV0dG9uLm91dGVyV2lkdGgodCksdm9pZCAwKX0sX3Jlc2l6ZU1lbnU6ZnVuY3Rpb24oKXt0aGlzLm1lbnUub3V0ZXJXaWR0aChNYXRoLm1heCh0aGlzLmJ1dHRvbi5vdXRlcldpZHRoKCksdGhpcy5tZW51LndpZHRoKFwiXCIpLm91dGVyV2lkdGgoKSsxKSl9LF9nZXRDcmVhdGVPcHRpb25zOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fc3VwZXIoKTtyZXR1cm4gdC5kaXNhYmxlZD10aGlzLmVsZW1lbnQucHJvcChcImRpc2FibGVkXCIpLHR9LF9wYXJzZU9wdGlvbnM6ZnVuY3Rpb24oZSl7dmFyIGk9dGhpcyxzPVtdO2UuZWFjaChmdW5jdGlvbihlLG4pe3MucHVzaChpLl9wYXJzZU9wdGlvbih0KG4pLGUpKX0pLHRoaXMuaXRlbXM9c30sX3BhcnNlT3B0aW9uOmZ1bmN0aW9uKHQsZSl7dmFyIGk9dC5wYXJlbnQoXCJvcHRncm91cFwiKTtyZXR1cm57ZWxlbWVudDp0LGluZGV4OmUsdmFsdWU6dC52YWwoKSxsYWJlbDp0LnRleHQoKSxvcHRncm91cDppLmF0dHIoXCJsYWJlbFwiKXx8XCJcIixkaXNhYmxlZDppLnByb3AoXCJkaXNhYmxlZFwiKXx8dC5wcm9wKFwiZGlzYWJsZWRcIil9fSxfZGVzdHJveTpmdW5jdGlvbigpe3RoaXMuX3VuYmluZEZvcm1SZXNldEhhbmRsZXIoKSx0aGlzLm1lbnVXcmFwLnJlbW92ZSgpLHRoaXMuYnV0dG9uLnJlbW92ZSgpLHRoaXMuZWxlbWVudC5zaG93KCksdGhpcy5lbGVtZW50LnJlbW92ZVVuaXF1ZUlkKCksdGhpcy5sYWJlbHMuYXR0cihcImZvclwiLHRoaXMuaWRzLmVsZW1lbnQpfX1dKSx0LndpZGdldChcInVpLnNsaWRlclwiLHQudWkubW91c2Use3ZlcnNpb246XCIxLjEyLjFcIix3aWRnZXRFdmVudFByZWZpeDpcInNsaWRlXCIsb3B0aW9uczp7YW5pbWF0ZTohMSxjbGFzc2VzOntcInVpLXNsaWRlclwiOlwidWktY29ybmVyLWFsbFwiLFwidWktc2xpZGVyLWhhbmRsZVwiOlwidWktY29ybmVyLWFsbFwiLFwidWktc2xpZGVyLXJhbmdlXCI6XCJ1aS1jb3JuZXItYWxsIHVpLXdpZGdldC1oZWFkZXJcIn0sZGlzdGFuY2U6MCxtYXg6MTAwLG1pbjowLG9yaWVudGF0aW9uOlwiaG9yaXpvbnRhbFwiLHJhbmdlOiExLHN0ZXA6MSx2YWx1ZTowLHZhbHVlczpudWxsLGNoYW5nZTpudWxsLHNsaWRlOm51bGwsc3RhcnQ6bnVsbCxzdG9wOm51bGx9LG51bVBhZ2VzOjUsX2NyZWF0ZTpmdW5jdGlvbigpe3RoaXMuX2tleVNsaWRpbmc9ITEsdGhpcy5fbW91c2VTbGlkaW5nPSExLHRoaXMuX2FuaW1hdGVPZmY9ITAsdGhpcy5faGFuZGxlSW5kZXg9bnVsbCx0aGlzLl9kZXRlY3RPcmllbnRhdGlvbigpLHRoaXMuX21vdXNlSW5pdCgpLHRoaXMuX2NhbGN1bGF0ZU5ld01heCgpLHRoaXMuX2FkZENsYXNzKFwidWktc2xpZGVyIHVpLXNsaWRlci1cIit0aGlzLm9yaWVudGF0aW9uLFwidWktd2lkZ2V0IHVpLXdpZGdldC1jb250ZW50XCIpLHRoaXMuX3JlZnJlc2goKSx0aGlzLl9hbmltYXRlT2ZmPSExfSxfcmVmcmVzaDpmdW5jdGlvbigpe3RoaXMuX2NyZWF0ZVJhbmdlKCksdGhpcy5fY3JlYXRlSGFuZGxlcygpLHRoaXMuX3NldHVwRXZlbnRzKCksdGhpcy5fcmVmcmVzaFZhbHVlKCl9LF9jcmVhdGVIYW5kbGVzOmZ1bmN0aW9uKCl7dmFyIGUsaSxzPXRoaXMub3B0aW9ucyxuPXRoaXMuZWxlbWVudC5maW5kKFwiLnVpLXNsaWRlci1oYW5kbGVcIiksbz1cIjxzcGFuIHRhYmluZGV4PScwJz48L3NwYW4+XCIsYT1bXTtmb3IoaT1zLnZhbHVlcyYmcy52YWx1ZXMubGVuZ3RofHwxLG4ubGVuZ3RoPmkmJihuLnNsaWNlKGkpLnJlbW92ZSgpLG49bi5zbGljZSgwLGkpKSxlPW4ubGVuZ3RoO2k+ZTtlKyspYS5wdXNoKG8pO3RoaXMuaGFuZGxlcz1uLmFkZCh0KGEuam9pbihcIlwiKSkuYXBwZW5kVG8odGhpcy5lbGVtZW50KSksdGhpcy5fYWRkQ2xhc3ModGhpcy5oYW5kbGVzLFwidWktc2xpZGVyLWhhbmRsZVwiLFwidWktc3RhdGUtZGVmYXVsdFwiKSx0aGlzLmhhbmRsZT10aGlzLmhhbmRsZXMuZXEoMCksdGhpcy5oYW5kbGVzLmVhY2goZnVuY3Rpb24oZSl7dCh0aGlzKS5kYXRhKFwidWktc2xpZGVyLWhhbmRsZS1pbmRleFwiLGUpLmF0dHIoXCJ0YWJJbmRleFwiLDApfSl9LF9jcmVhdGVSYW5nZTpmdW5jdGlvbigpe3ZhciBlPXRoaXMub3B0aW9ucztlLnJhbmdlPyhlLnJhbmdlPT09ITAmJihlLnZhbHVlcz9lLnZhbHVlcy5sZW5ndGgmJjIhPT1lLnZhbHVlcy5sZW5ndGg/ZS52YWx1ZXM9W2UudmFsdWVzWzBdLGUudmFsdWVzWzBdXTp0LmlzQXJyYXkoZS52YWx1ZXMpJiYoZS52YWx1ZXM9ZS52YWx1ZXMuc2xpY2UoMCkpOmUudmFsdWVzPVt0aGlzLl92YWx1ZU1pbigpLHRoaXMuX3ZhbHVlTWluKCldKSx0aGlzLnJhbmdlJiZ0aGlzLnJhbmdlLmxlbmd0aD8odGhpcy5fcmVtb3ZlQ2xhc3ModGhpcy5yYW5nZSxcInVpLXNsaWRlci1yYW5nZS1taW4gdWktc2xpZGVyLXJhbmdlLW1heFwiKSx0aGlzLnJhbmdlLmNzcyh7bGVmdDpcIlwiLGJvdHRvbTpcIlwifSkpOih0aGlzLnJhbmdlPXQoXCI8ZGl2PlwiKS5hcHBlbmRUbyh0aGlzLmVsZW1lbnQpLHRoaXMuX2FkZENsYXNzKHRoaXMucmFuZ2UsXCJ1aS1zbGlkZXItcmFuZ2VcIikpLChcIm1pblwiPT09ZS5yYW5nZXx8XCJtYXhcIj09PWUucmFuZ2UpJiZ0aGlzLl9hZGRDbGFzcyh0aGlzLnJhbmdlLFwidWktc2xpZGVyLXJhbmdlLVwiK2UucmFuZ2UpKToodGhpcy5yYW5nZSYmdGhpcy5yYW5nZS5yZW1vdmUoKSx0aGlzLnJhbmdlPW51bGwpfSxfc2V0dXBFdmVudHM6ZnVuY3Rpb24oKXt0aGlzLl9vZmYodGhpcy5oYW5kbGVzKSx0aGlzLl9vbih0aGlzLmhhbmRsZXMsdGhpcy5faGFuZGxlRXZlbnRzKSx0aGlzLl9ob3ZlcmFibGUodGhpcy5oYW5kbGVzKSx0aGlzLl9mb2N1c2FibGUodGhpcy5oYW5kbGVzKX0sX2Rlc3Ryb3k6ZnVuY3Rpb24oKXt0aGlzLmhhbmRsZXMucmVtb3ZlKCksdGhpcy5yYW5nZSYmdGhpcy5yYW5nZS5yZW1vdmUoKSx0aGlzLl9tb3VzZURlc3Ryb3koKX0sX21vdXNlQ2FwdHVyZTpmdW5jdGlvbihlKXt2YXIgaSxzLG4sbyxhLHIsbCxoLGM9dGhpcyx1PXRoaXMub3B0aW9ucztyZXR1cm4gdS5kaXNhYmxlZD8hMToodGhpcy5lbGVtZW50U2l6ZT17d2lkdGg6dGhpcy5lbGVtZW50Lm91dGVyV2lkdGgoKSxoZWlnaHQ6dGhpcy5lbGVtZW50Lm91dGVySGVpZ2h0KCl9LHRoaXMuZWxlbWVudE9mZnNldD10aGlzLmVsZW1lbnQub2Zmc2V0KCksaT17eDplLnBhZ2VYLHk6ZS5wYWdlWX0scz10aGlzLl9ub3JtVmFsdWVGcm9tTW91c2UoaSksbj10aGlzLl92YWx1ZU1heCgpLXRoaXMuX3ZhbHVlTWluKCkrMSx0aGlzLmhhbmRsZXMuZWFjaChmdW5jdGlvbihlKXt2YXIgaT1NYXRoLmFicyhzLWMudmFsdWVzKGUpKTsobj5pfHxuPT09aSYmKGU9PT1jLl9sYXN0Q2hhbmdlZFZhbHVlfHxjLnZhbHVlcyhlKT09PXUubWluKSkmJihuPWksbz10KHRoaXMpLGE9ZSl9KSxyPXRoaXMuX3N0YXJ0KGUsYSkscj09PSExPyExOih0aGlzLl9tb3VzZVNsaWRpbmc9ITAsdGhpcy5faGFuZGxlSW5kZXg9YSx0aGlzLl9hZGRDbGFzcyhvLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksby50cmlnZ2VyKFwiZm9jdXNcIiksbD1vLm9mZnNldCgpLGg9IXQoZS50YXJnZXQpLnBhcmVudHMoKS5hZGRCYWNrKCkuaXMoXCIudWktc2xpZGVyLWhhbmRsZVwiKSx0aGlzLl9jbGlja09mZnNldD1oP3tsZWZ0OjAsdG9wOjB9OntsZWZ0OmUucGFnZVgtbC5sZWZ0LW8ud2lkdGgoKS8yLHRvcDplLnBhZ2VZLWwudG9wLW8uaGVpZ2h0KCkvMi0ocGFyc2VJbnQoby5jc3MoXCJib3JkZXJUb3BXaWR0aFwiKSwxMCl8fDApLShwYXJzZUludChvLmNzcyhcImJvcmRlckJvdHRvbVdpZHRoXCIpLDEwKXx8MCkrKHBhcnNlSW50KG8uY3NzKFwibWFyZ2luVG9wXCIpLDEwKXx8MCl9LHRoaXMuaGFuZGxlcy5oYXNDbGFzcyhcInVpLXN0YXRlLWhvdmVyXCIpfHx0aGlzLl9zbGlkZShlLGEscyksdGhpcy5fYW5pbWF0ZU9mZj0hMCwhMCkpfSxfbW91c2VTdGFydDpmdW5jdGlvbigpe3JldHVybiEwfSxfbW91c2VEcmFnOmZ1bmN0aW9uKHQpe3ZhciBlPXt4OnQucGFnZVgseTp0LnBhZ2VZfSxpPXRoaXMuX25vcm1WYWx1ZUZyb21Nb3VzZShlKTtyZXR1cm4gdGhpcy5fc2xpZGUodCx0aGlzLl9oYW5kbGVJbmRleCxpKSwhMX0sX21vdXNlU3RvcDpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fcmVtb3ZlQ2xhc3ModGhpcy5oYW5kbGVzLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksdGhpcy5fbW91c2VTbGlkaW5nPSExLHRoaXMuX3N0b3AodCx0aGlzLl9oYW5kbGVJbmRleCksdGhpcy5fY2hhbmdlKHQsdGhpcy5faGFuZGxlSW5kZXgpLHRoaXMuX2hhbmRsZUluZGV4PW51bGwsdGhpcy5fY2xpY2tPZmZzZXQ9bnVsbCx0aGlzLl9hbmltYXRlT2ZmPSExLCExfSxfZGV0ZWN0T3JpZW50YXRpb246ZnVuY3Rpb24oKXt0aGlzLm9yaWVudGF0aW9uPVwidmVydGljYWxcIj09PXRoaXMub3B0aW9ucy5vcmllbnRhdGlvbj9cInZlcnRpY2FsXCI6XCJob3Jpem9udGFsXCJ9LF9ub3JtVmFsdWVGcm9tTW91c2U6ZnVuY3Rpb24odCl7dmFyIGUsaSxzLG4sbztyZXR1cm5cImhvcml6b250YWxcIj09PXRoaXMub3JpZW50YXRpb24/KGU9dGhpcy5lbGVtZW50U2l6ZS53aWR0aCxpPXQueC10aGlzLmVsZW1lbnRPZmZzZXQubGVmdC0odGhpcy5fY2xpY2tPZmZzZXQ/dGhpcy5fY2xpY2tPZmZzZXQubGVmdDowKSk6KGU9dGhpcy5lbGVtZW50U2l6ZS5oZWlnaHQsaT10LnktdGhpcy5lbGVtZW50T2Zmc2V0LnRvcC0odGhpcy5fY2xpY2tPZmZzZXQ/dGhpcy5fY2xpY2tPZmZzZXQudG9wOjApKSxzPWkvZSxzPjEmJihzPTEpLDA+cyYmKHM9MCksXCJ2ZXJ0aWNhbFwiPT09dGhpcy5vcmllbnRhdGlvbiYmKHM9MS1zKSxuPXRoaXMuX3ZhbHVlTWF4KCktdGhpcy5fdmFsdWVNaW4oKSxvPXRoaXMuX3ZhbHVlTWluKCkrcypuLHRoaXMuX3RyaW1BbGlnblZhbHVlKG8pfSxfdWlIYXNoOmZ1bmN0aW9uKHQsZSxpKXt2YXIgcz17aGFuZGxlOnRoaXMuaGFuZGxlc1t0XSxoYW5kbGVJbmRleDp0LHZhbHVlOnZvaWQgMCE9PWU/ZTp0aGlzLnZhbHVlKCl9O3JldHVybiB0aGlzLl9oYXNNdWx0aXBsZVZhbHVlcygpJiYocy52YWx1ZT12b2lkIDAhPT1lP2U6dGhpcy52YWx1ZXModCkscy52YWx1ZXM9aXx8dGhpcy52YWx1ZXMoKSksc30sX2hhc011bHRpcGxlVmFsdWVzOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMub3B0aW9ucy52YWx1ZXMmJnRoaXMub3B0aW9ucy52YWx1ZXMubGVuZ3RofSxfc3RhcnQ6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5fdHJpZ2dlcihcInN0YXJ0XCIsdCx0aGlzLl91aUhhc2goZSkpfSxfc2xpZGU6ZnVuY3Rpb24odCxlLGkpe3ZhciBzLG4sbz10aGlzLnZhbHVlKCksYT10aGlzLnZhbHVlcygpO3RoaXMuX2hhc011bHRpcGxlVmFsdWVzKCkmJihuPXRoaXMudmFsdWVzKGU/MDoxKSxvPXRoaXMudmFsdWVzKGUpLDI9PT10aGlzLm9wdGlvbnMudmFsdWVzLmxlbmd0aCYmdGhpcy5vcHRpb25zLnJhbmdlPT09ITAmJihpPTA9PT1lP01hdGgubWluKG4saSk6TWF0aC5tYXgobixpKSksYVtlXT1pKSxpIT09byYmKHM9dGhpcy5fdHJpZ2dlcihcInNsaWRlXCIsdCx0aGlzLl91aUhhc2goZSxpLGEpKSxzIT09ITEmJih0aGlzLl9oYXNNdWx0aXBsZVZhbHVlcygpP3RoaXMudmFsdWVzKGUsaSk6dGhpcy52YWx1ZShpKSkpfSxfc3RvcDpmdW5jdGlvbih0LGUpe3RoaXMuX3RyaWdnZXIoXCJzdG9wXCIsdCx0aGlzLl91aUhhc2goZSkpfSxfY2hhbmdlOmZ1bmN0aW9uKHQsZSl7dGhpcy5fa2V5U2xpZGluZ3x8dGhpcy5fbW91c2VTbGlkaW5nfHwodGhpcy5fbGFzdENoYW5nZWRWYWx1ZT1lLHRoaXMuX3RyaWdnZXIoXCJjaGFuZ2VcIix0LHRoaXMuX3VpSGFzaChlKSkpfSx2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gYXJndW1lbnRzLmxlbmd0aD8odGhpcy5vcHRpb25zLnZhbHVlPXRoaXMuX3RyaW1BbGlnblZhbHVlKHQpLHRoaXMuX3JlZnJlc2hWYWx1ZSgpLHRoaXMuX2NoYW5nZShudWxsLDApLHZvaWQgMCk6dGhpcy5fdmFsdWUoKX0sdmFsdWVzOmZ1bmN0aW9uKGUsaSl7dmFyIHMsbixvO2lmKGFyZ3VtZW50cy5sZW5ndGg+MSlyZXR1cm4gdGhpcy5vcHRpb25zLnZhbHVlc1tlXT10aGlzLl90cmltQWxpZ25WYWx1ZShpKSx0aGlzLl9yZWZyZXNoVmFsdWUoKSx0aGlzLl9jaGFuZ2UobnVsbCxlKSx2b2lkIDA7aWYoIWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHRoaXMuX3ZhbHVlcygpO2lmKCF0LmlzQXJyYXkoYXJndW1lbnRzWzBdKSlyZXR1cm4gdGhpcy5faGFzTXVsdGlwbGVWYWx1ZXMoKT90aGlzLl92YWx1ZXMoZSk6dGhpcy52YWx1ZSgpO2ZvcihzPXRoaXMub3B0aW9ucy52YWx1ZXMsbj1hcmd1bWVudHNbMF0sbz0wO3MubGVuZ3RoPm87bys9MSlzW29dPXRoaXMuX3RyaW1BbGlnblZhbHVlKG5bb10pLHRoaXMuX2NoYW5nZShudWxsLG8pO3RoaXMuX3JlZnJlc2hWYWx1ZSgpfSxfc2V0T3B0aW9uOmZ1bmN0aW9uKGUsaSl7dmFyIHMsbj0wO3N3aXRjaChcInJhbmdlXCI9PT1lJiZ0aGlzLm9wdGlvbnMucmFuZ2U9PT0hMCYmKFwibWluXCI9PT1pPyh0aGlzLm9wdGlvbnMudmFsdWU9dGhpcy5fdmFsdWVzKDApLHRoaXMub3B0aW9ucy52YWx1ZXM9bnVsbCk6XCJtYXhcIj09PWkmJih0aGlzLm9wdGlvbnMudmFsdWU9dGhpcy5fdmFsdWVzKHRoaXMub3B0aW9ucy52YWx1ZXMubGVuZ3RoLTEpLHRoaXMub3B0aW9ucy52YWx1ZXM9bnVsbCkpLHQuaXNBcnJheSh0aGlzLm9wdGlvbnMudmFsdWVzKSYmKG49dGhpcy5vcHRpb25zLnZhbHVlcy5sZW5ndGgpLHRoaXMuX3N1cGVyKGUsaSksZSl7Y2FzZVwib3JpZW50YXRpb25cIjp0aGlzLl9kZXRlY3RPcmllbnRhdGlvbigpLHRoaXMuX3JlbW92ZUNsYXNzKFwidWktc2xpZGVyLWhvcml6b250YWwgdWktc2xpZGVyLXZlcnRpY2FsXCIpLl9hZGRDbGFzcyhcInVpLXNsaWRlci1cIit0aGlzLm9yaWVudGF0aW9uKSx0aGlzLl9yZWZyZXNoVmFsdWUoKSx0aGlzLm9wdGlvbnMucmFuZ2UmJnRoaXMuX3JlZnJlc2hSYW5nZShpKSx0aGlzLmhhbmRsZXMuY3NzKFwiaG9yaXpvbnRhbFwiPT09aT9cImJvdHRvbVwiOlwibGVmdFwiLFwiXCIpO2JyZWFrO2Nhc2VcInZhbHVlXCI6dGhpcy5fYW5pbWF0ZU9mZj0hMCx0aGlzLl9yZWZyZXNoVmFsdWUoKSx0aGlzLl9jaGFuZ2UobnVsbCwwKSx0aGlzLl9hbmltYXRlT2ZmPSExO2JyZWFrO2Nhc2VcInZhbHVlc1wiOmZvcih0aGlzLl9hbmltYXRlT2ZmPSEwLHRoaXMuX3JlZnJlc2hWYWx1ZSgpLHM9bi0xO3M+PTA7cy0tKXRoaXMuX2NoYW5nZShudWxsLHMpO3RoaXMuX2FuaW1hdGVPZmY9ITE7YnJlYWs7Y2FzZVwic3RlcFwiOmNhc2VcIm1pblwiOmNhc2VcIm1heFwiOnRoaXMuX2FuaW1hdGVPZmY9ITAsdGhpcy5fY2FsY3VsYXRlTmV3TWF4KCksdGhpcy5fcmVmcmVzaFZhbHVlKCksdGhpcy5fYW5pbWF0ZU9mZj0hMTticmVhaztjYXNlXCJyYW5nZVwiOnRoaXMuX2FuaW1hdGVPZmY9ITAsdGhpcy5fcmVmcmVzaCgpLHRoaXMuX2FuaW1hdGVPZmY9ITF9fSxfc2V0T3B0aW9uRGlzYWJsZWQ6ZnVuY3Rpb24odCl7dGhpcy5fc3VwZXIodCksdGhpcy5fdG9nZ2xlQ2xhc3MobnVsbCxcInVpLXN0YXRlLWRpc2FibGVkXCIsISF0KX0sX3ZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLnZhbHVlO3JldHVybiB0PXRoaXMuX3RyaW1BbGlnblZhbHVlKHQpfSxfdmFsdWVzOmZ1bmN0aW9uKHQpe3ZhciBlLGkscztpZihhcmd1bWVudHMubGVuZ3RoKXJldHVybiBlPXRoaXMub3B0aW9ucy52YWx1ZXNbdF0sZT10aGlzLl90cmltQWxpZ25WYWx1ZShlKTtpZih0aGlzLl9oYXNNdWx0aXBsZVZhbHVlcygpKXtmb3IoaT10aGlzLm9wdGlvbnMudmFsdWVzLnNsaWNlKCkscz0wO2kubGVuZ3RoPnM7cys9MSlpW3NdPXRoaXMuX3RyaW1BbGlnblZhbHVlKGlbc10pO3JldHVybiBpfXJldHVybltdfSxfdHJpbUFsaWduVmFsdWU6ZnVuY3Rpb24odCl7aWYodGhpcy5fdmFsdWVNaW4oKT49dClyZXR1cm4gdGhpcy5fdmFsdWVNaW4oKTtpZih0Pj10aGlzLl92YWx1ZU1heCgpKXJldHVybiB0aGlzLl92YWx1ZU1heCgpO3ZhciBlPXRoaXMub3B0aW9ucy5zdGVwPjA/dGhpcy5vcHRpb25zLnN0ZXA6MSxpPSh0LXRoaXMuX3ZhbHVlTWluKCkpJWUscz10LWk7cmV0dXJuIDIqTWF0aC5hYnMoaSk+PWUmJihzKz1pPjA/ZTotZSkscGFyc2VGbG9hdChzLnRvRml4ZWQoNSkpfSxfY2FsY3VsYXRlTmV3TWF4OmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLm1heCxlPXRoaXMuX3ZhbHVlTWluKCksaT10aGlzLm9wdGlvbnMuc3RlcCxzPU1hdGgucm91bmQoKHQtZSkvaSkqaTt0PXMrZSx0PnRoaXMub3B0aW9ucy5tYXgmJih0LT1pKSx0aGlzLm1heD1wYXJzZUZsb2F0KHQudG9GaXhlZCh0aGlzLl9wcmVjaXNpb24oKSkpfSxfcHJlY2lzaW9uOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fcHJlY2lzaW9uT2YodGhpcy5vcHRpb25zLnN0ZXApO3JldHVybiBudWxsIT09dGhpcy5vcHRpb25zLm1pbiYmKHQ9TWF0aC5tYXgodCx0aGlzLl9wcmVjaXNpb25PZih0aGlzLm9wdGlvbnMubWluKSkpLHR9LF9wcmVjaXNpb25PZjpmdW5jdGlvbih0KXt2YXIgZT1cIlwiK3QsaT1lLmluZGV4T2YoXCIuXCIpO3JldHVybi0xPT09aT8wOmUubGVuZ3RoLWktMX0sX3ZhbHVlTWluOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMub3B0aW9ucy5taW59LF92YWx1ZU1heDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1heH0sX3JlZnJlc2hSYW5nZTpmdW5jdGlvbih0KXtcInZlcnRpY2FsXCI9PT10JiZ0aGlzLnJhbmdlLmNzcyh7d2lkdGg6XCJcIixsZWZ0OlwiXCJ9KSxcImhvcml6b250YWxcIj09PXQmJnRoaXMucmFuZ2UuY3NzKHtoZWlnaHQ6XCJcIixib3R0b206XCJcIn0pfSxfcmVmcmVzaFZhbHVlOmZ1bmN0aW9uKCl7dmFyIGUsaSxzLG4sbyxhPXRoaXMub3B0aW9ucy5yYW5nZSxyPXRoaXMub3B0aW9ucyxsPXRoaXMsaD10aGlzLl9hbmltYXRlT2ZmPyExOnIuYW5pbWF0ZSxjPXt9O3RoaXMuX2hhc011bHRpcGxlVmFsdWVzKCk/dGhpcy5oYW5kbGVzLmVhY2goZnVuY3Rpb24ocyl7aT0xMDAqKChsLnZhbHVlcyhzKS1sLl92YWx1ZU1pbigpKS8obC5fdmFsdWVNYXgoKS1sLl92YWx1ZU1pbigpKSksY1tcImhvcml6b250YWxcIj09PWwub3JpZW50YXRpb24/XCJsZWZ0XCI6XCJib3R0b21cIl09aStcIiVcIix0KHRoaXMpLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKGMsci5hbmltYXRlKSxsLm9wdGlvbnMucmFuZ2U9PT0hMCYmKFwiaG9yaXpvbnRhbFwiPT09bC5vcmllbnRhdGlvbj8oMD09PXMmJmwucmFuZ2Uuc3RvcCgxLDEpW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe2xlZnQ6aStcIiVcIn0sci5hbmltYXRlKSwxPT09cyYmbC5yYW5nZVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHt3aWR0aDppLWUrXCIlXCJ9LHtxdWV1ZTohMSxkdXJhdGlvbjpyLmFuaW1hdGV9KSk6KDA9PT1zJiZsLnJhbmdlLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHtib3R0b206aStcIiVcIn0sci5hbmltYXRlKSwxPT09cyYmbC5yYW5nZVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHtoZWlnaHQ6aS1lK1wiJVwifSx7cXVldWU6ITEsZHVyYXRpb246ci5hbmltYXRlfSkpKSxlPWl9KToocz10aGlzLnZhbHVlKCksbj10aGlzLl92YWx1ZU1pbigpLG89dGhpcy5fdmFsdWVNYXgoKSxpPW8hPT1uPzEwMCooKHMtbikvKG8tbikpOjAsY1tcImhvcml6b250YWxcIj09PXRoaXMub3JpZW50YXRpb24/XCJsZWZ0XCI6XCJib3R0b21cIl09aStcIiVcIix0aGlzLmhhbmRsZS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXShjLHIuYW5pbWF0ZSksXCJtaW5cIj09PWEmJlwiaG9yaXpvbnRhbFwiPT09dGhpcy5vcmllbnRhdGlvbiYmdGhpcy5yYW5nZS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7d2lkdGg6aStcIiVcIn0sci5hbmltYXRlKSxcIm1heFwiPT09YSYmXCJob3Jpem9udGFsXCI9PT10aGlzLm9yaWVudGF0aW9uJiZ0aGlzLnJhbmdlLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHt3aWR0aDoxMDAtaStcIiVcIn0sci5hbmltYXRlKSxcIm1pblwiPT09YSYmXCJ2ZXJ0aWNhbFwiPT09dGhpcy5vcmllbnRhdGlvbiYmdGhpcy5yYW5nZS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7aGVpZ2h0OmkrXCIlXCJ9LHIuYW5pbWF0ZSksXCJtYXhcIj09PWEmJlwidmVydGljYWxcIj09PXRoaXMub3JpZW50YXRpb24mJnRoaXMucmFuZ2Uuc3RvcCgxLDEpW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe2hlaWdodDoxMDAtaStcIiVcIn0sci5hbmltYXRlKSl9LF9oYW5kbGVFdmVudHM6e2tleWRvd246ZnVuY3Rpb24oZSl7dmFyIGkscyxuLG8sYT10KGUudGFyZ2V0KS5kYXRhKFwidWktc2xpZGVyLWhhbmRsZS1pbmRleFwiKTtzd2l0Y2goZS5rZXlDb2RlKXtjYXNlIHQudWkua2V5Q29kZS5IT01FOmNhc2UgdC51aS5rZXlDb2RlLkVORDpjYXNlIHQudWkua2V5Q29kZS5QQUdFX1VQOmNhc2UgdC51aS5rZXlDb2RlLlBBR0VfRE9XTjpjYXNlIHQudWkua2V5Q29kZS5VUDpjYXNlIHQudWkua2V5Q29kZS5SSUdIVDpjYXNlIHQudWkua2V5Q29kZS5ET1dOOmNhc2UgdC51aS5rZXlDb2RlLkxFRlQ6aWYoZS5wcmV2ZW50RGVmYXVsdCgpLCF0aGlzLl9rZXlTbGlkaW5nJiYodGhpcy5fa2V5U2xpZGluZz0hMCx0aGlzLl9hZGRDbGFzcyh0KGUudGFyZ2V0KSxudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpLGk9dGhpcy5fc3RhcnQoZSxhKSxpPT09ITEpKXJldHVybn1zd2l0Y2gobz10aGlzLm9wdGlvbnMuc3RlcCxzPW49dGhpcy5faGFzTXVsdGlwbGVWYWx1ZXMoKT90aGlzLnZhbHVlcyhhKTp0aGlzLnZhbHVlKCksZS5rZXlDb2RlKXtjYXNlIHQudWkua2V5Q29kZS5IT01FOm49dGhpcy5fdmFsdWVNaW4oKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5FTkQ6bj10aGlzLl92YWx1ZU1heCgpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlBBR0VfVVA6bj10aGlzLl90cmltQWxpZ25WYWx1ZShzKyh0aGlzLl92YWx1ZU1heCgpLXRoaXMuX3ZhbHVlTWluKCkpL3RoaXMubnVtUGFnZXMpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlBBR0VfRE9XTjpuPXRoaXMuX3RyaW1BbGlnblZhbHVlKHMtKHRoaXMuX3ZhbHVlTWF4KCktdGhpcy5fdmFsdWVNaW4oKSkvdGhpcy5udW1QYWdlcyk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuVVA6Y2FzZSB0LnVpLmtleUNvZGUuUklHSFQ6aWYocz09PXRoaXMuX3ZhbHVlTWF4KCkpcmV0dXJuO249dGhpcy5fdHJpbUFsaWduVmFsdWUocytvKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5ET1dOOmNhc2UgdC51aS5rZXlDb2RlLkxFRlQ6aWYocz09PXRoaXMuX3ZhbHVlTWluKCkpcmV0dXJuO249dGhpcy5fdHJpbUFsaWduVmFsdWUocy1vKX10aGlzLl9zbGlkZShlLGEsbil9LGtleXVwOmZ1bmN0aW9uKGUpe3ZhciBpPXQoZS50YXJnZXQpLmRhdGEoXCJ1aS1zbGlkZXItaGFuZGxlLWluZGV4XCIpO3RoaXMuX2tleVNsaWRpbmcmJih0aGlzLl9rZXlTbGlkaW5nPSExLHRoaXMuX3N0b3AoZSxpKSx0aGlzLl9jaGFuZ2UoZSxpKSx0aGlzLl9yZW1vdmVDbGFzcyh0KGUudGFyZ2V0KSxudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpKX19fSl9KTsiLCJ2YXIgc2RUb29sdGlwID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB2YXIgdG9vbHRpcFRpbWVPdXQgPSBudWxsO1xyXG4gICAgdmFyIGRpc3BsYXlUaW1lT3ZlciA9IDA7XHJcbiAgICB2YXIgZGlzcGxheVRpbWVDbGljayA9IDMwMDA7XHJcbiAgICB2YXIgaGlkZVRpbWUgPSAxMDA7XHJcbiAgICB2YXIgYXJyb3cgPSAxMDtcclxuICAgIHZhciBhcnJvd1dpZHRoID0gODtcclxuICAgIHZhciB0b29sdGlwO1xyXG4gICAgdmFyIHNpemUgPSAnc21hbGwnO1xyXG4gICAgdmFyIGhpZGVDbGFzcyA9ICdoaWRkZW4nO1xyXG4gICAgdmFyIHRvb2x0aXBFbGVtZW50cztcclxuICAgIHZhciBjdXJyZW50RWxlbWVudDtcclxuXHJcbiAgICBmdW5jdGlvbiB0b29sdGlwSW5pdCgpIHtcclxuICAgICAgICB0b29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndGlwc29fYnViYmxlJykuYWRkQ2xhc3Moc2l6ZSkuYWRkQ2xhc3MoaGlkZUNsYXNzKVxyXG4gICAgICAgICAgICAuaHRtbCgnPGRpdiBjbGFzcz1cInRpcHNvX2Fycm93XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRpdHNvX3RpdGxlXCI+PC9kaXY+PGRpdiBjbGFzcz1cInRpcHNvX2NvbnRlbnRcIj48L2Rpdj4nKTtcclxuICAgICAgICAkKHRvb2x0aXApLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBjaGVja01vdXNlUG9zKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodG9vbHRpcCkub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGNoZWNrTW91c2VQb3MoZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0b29sdGlwKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjaGVja01vdXNlUG9zKGUpIHtcclxuICAgICAgICBpZiAoZS5jbGllbnRYID4gJChjdXJyZW50RWxlbWVudCkub2Zmc2V0KCkubGVmdCAmJiBlLmNsaWVudFggPCAkKGN1cnJlbnRFbGVtZW50KS5vZmZzZXQoKS5sZWZ0ICsgJChjdXJyZW50RWxlbWVudCkub3V0ZXJXaWR0aCgpXHJcbiAgICAgICAgICAgICYmIGUuY2xpZW50WSA+ICQoY3VycmVudEVsZW1lbnQpLm9mZnNldCgpLnRvcCAmJiBlLmNsaWVudFkgPCAkKGN1cnJlbnRFbGVtZW50KS5vZmZzZXQoKS50b3AgKyAkKGN1cnJlbnRFbGVtZW50KS5vdXRlckhlaWdodCgpKSB7XHJcbiAgICAgICAgICAgIHRvb2x0aXBTaG93KGN1cnJlbnRFbGVtZW50LCBkaXNwbGF5VGltZU92ZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0b29sdGlwU2hvdyhlbGVtLCBkaXNwbGF5VGltZSkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0b29sdGlwVGltZU91dCk7XHJcblxyXG4gICAgICAgIHZhciB0aXRsZSA9ICQoZWxlbSkuZGF0YSgnb3JpZ2luYWwtdGl0bGUnKTtcclxuICAgICAgICB2YXIgaHRtbCA9ICQoJyMnKyQoZWxlbSkuZGF0YSgnb3JpZ2luYWwtaHRtbCcpKS5odG1sKCk7XHJcbiAgICAgICAgaWYgKGh0bWwpIHtcclxuICAgICAgICAgICAgdGl0bGUgPSBodG1sO1xyXG4gICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCd0aXBzb19idWJibGVfaHRtbCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RpcHNvX2J1YmJsZV9odG1sJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9ICQoZWxlbSkuZGF0YSgncGxhY2VtZW50JykgfHwgJ2JvdHRvbSc7XHJcbiAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcyhcInRvcF9yaWdodF9jb3JuZXIgYm90dG9tX3JpZ2h0X2Nvcm5lciB0b3BfbGVmdF9jb3JuZXIgYm90dG9tX2xlZnRfY29ybmVyXCIpO1xyXG5cclxuICAgICAgICAkKHRvb2x0aXApLmZpbmQoJy50aXRzb190aXRsZScpLmh0bWwodGl0bGUpO1xyXG4gICAgICAgIHNldFBvc2l0b24oZWxlbSwgcG9zaXRpb24pO1xyXG4gICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoaGlkZUNsYXNzKTtcclxuICAgICAgICBjdXJyZW50RWxlbWVudCA9IGVsZW07XHJcblxyXG4gICAgICAgIGlmIChkaXNwbGF5VGltZSA+IDApIHtcclxuICAgICAgICAgICAgdG9vbHRpcFRpbWVPdXQgPSBzZXRUaW1lb3V0KHRvb2x0aXBIaWRlLCBkaXNwbGF5VGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gdG9vbHRpcEhpZGUoKSB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRvb2x0aXBUaW1lT3V0KTtcclxuICAgICAgICB0b29sdGlwVGltZU91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcyhoaWRlQ2xhc3MpO1xyXG4gICAgICAgIH0sIGhpZGVUaW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRQb3NpdG9uKGVsZW0sIHBvc2l0aW9uKXtcclxuICAgICAgICB2YXIgJGUgPSAkKGVsZW0pO1xyXG4gICAgICAgIHZhciAkd2luID0gJCh3aW5kb3cpO1xyXG4gICAgICAgIHZhciBjdXN0b21Ub3AgPSAkKGVsZW0pLmRhdGEoJ3RvcCcpOy8v0LfQsNC00LDQvdCwINC/0L7Qt9C40YbQuNGPINCy0L3Rg9GC0YDQuCDRjdC70LXQvNC10L3RgtCwXHJcbiAgICAgICAgdmFyIGN1c3RvbUxlZnQgPSAkKGVsZW0pLmRhdGEoJ2xlZnQnKTsvL9C30LDQtNCw0L3QsCDQv9C+0LfQuNGG0LjRjyDQstC90YPRgtGA0Lgg0Y3Qu9C10LzQtdC90YLQsFxyXG4gICAgICAgIHZhciBub3JldmVydCA9ICQoZWxlbSkuZGF0YSgnbm9yZXZlcnQnKTsvL9C90LUg0L/QtdGA0LXQstC+0YDQsNGH0LjQstCw0YLRjFxyXG4gICAgICAgIHN3aXRjaChwb3NpdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgICAgICAgICAgcG9zX2xlZnQgPSAkZS5vZmZzZXQoKS5sZWZ0ICsgKGN1c3RvbUxlZnQgPyBjdXN0b21MZWZ0IDogJGUub3V0ZXJXaWR0aCgpIC8gMikgLSAkKHRvb2x0aXApLm91dGVyV2lkdGgoKSAvIDI7XHJcbiAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wIC0gJCh0b29sdGlwKS5vdXRlckhlaWdodCgpICsgKGN1c3RvbVRvcCA/IGN1c3RvbVRvcCA6IDApIC0gYXJyb3c7XHJcbiAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmZpbmQoJy50aXBzb19hcnJvdycpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogLWFycm93V2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHBvc190b3AgPCAkd2luLnNjcm9sbFRvcCgpKSAmJiAhbm9yZXZlcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wICsoY3VzdG9tVG9wID8gY3VzdG9tVG9wIDogJGUub3V0ZXJIZWlnaHQoKSkgKyBhcnJvdztcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKCd0b3AgYm90dG9tIGxlZnQgcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCdib3R0b20nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ3RvcCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICBwb3NfbGVmdCA9ICRlLm9mZnNldCgpLmxlZnQgKyAoY3VzdG9tTGVmdCA/IGN1c3RvbUxlZnQgOiAkZS5vdXRlcldpZHRoKCkgLyAyKSAtICQodG9vbHRpcCkub3V0ZXJXaWR0aCgpIC8gMjtcclxuICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgKyAoY3VzdG9tVG9wID8gY3VzdG9tVG9wIDogJGUub3V0ZXJIZWlnaHQoKSkgKyBhcnJvdztcclxuICAgICAgICAgICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpcHNvX2Fycm93JykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5MZWZ0OiAtYXJyb3dXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICgocG9zX3RvcCArICQodG9vbHRpcCkuaGVpZ2h0KCkgPiAkd2luLnNjcm9sbFRvcCgpICsgJHdpbi5vdXRlckhlaWdodCgpKSAmJiAhbm9yZXZlcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wIC0gJCh0b29sdGlwKS5oZWlnaHQoKSArIChjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAwKSAtIGFycm93O1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ3RvcCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygnYm90dG9tJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgJCh0b29sdGlwKS5jc3Moe1xyXG4gICAgICAgICAgICBsZWZ0OiAgcG9zX2xlZnQsXHJcbiAgICAgICAgICAgIHRvcDogcG9zX3RvcFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEV2ZW50cygpIHtcclxuXHJcbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzID0gJCgnW2RhdGEtdG9nZ2xlPXRvb2x0aXBdJyk7XHJcblxyXG4gICAgICAgIHRvb2x0aXBFbGVtZW50cy5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5kYXRhKCdjbGlja2FibGUnKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQodG9vbHRpcCkuaGFzQ2xhc3MoaGlkZUNsYXNzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBTaG93KHRoaXMsIGRpc3BsYXlUaW1lQ2xpY2spO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwSGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0b29sdGlwRWxlbWVudHMub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMDI0KSB7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwU2hvdyh0aGlzLCBkaXNwbGF5VGltZU92ZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPj0gMTAyNCkge1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcFNob3codGhpcywgZGlzcGxheVRpbWVPdmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRvb2x0aXBFbGVtZW50cy5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpe1xyXG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPj0gMTAyNCkge1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcEhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgIC8vICAgICB0b29sdGlwSW5pdCgpO1xyXG4gICAgLy8gICAgIHNldEV2ZW50cygpO1xyXG4gICAgLy8gfSk7XHJcbiAgICAvL1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpbml0OiB0b29sdGlwSW5pdCxcclxuICAgICAgICBzZXRFdmVudHM6IHNldEV2ZW50c1xyXG4gICAgfVxyXG59KSgpO1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICBzZFRvb2x0aXAuaW5pdCgpO1xyXG4gICAgc2RUb29sdGlwLnNldEV2ZW50cygpO1xyXG59KTtcclxuXHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgdmFyICRub3R5ZmlfYnRuID0gJCgnLmhlYWRlci1sb2dvX25vdHknKTtcclxuICBpZiAoJG5vdHlmaV9idG4ubGVuZ3RoID09IDApIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vdmFyIGhyZWYgPSAnLycrbGFuZy5ocmVmX3ByZWZpeCsnYWNjb3VudC9ub3RpZmljYXRpb24nO1xyXG4gIHZhciBocmVmID0gICQoJyNhY2NvdW50X25vdGlmaWNhdGlvbnNfbGluaycpLmF0dHIoJ2hyZWYnKTtcclxuXHJcbiAgJC5nZXQoaHJlZiwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgIGlmICghZGF0YS5ub3RpZmljYXRpb25zIHx8IGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGggPT0gMCkgcmV0dXJuO1xyXG5cclxuICAgIHZhciBvdXQgPSAnPGRpdiBjbGFzcz1oZWFkZXItbm90eS1ib3g+PGRpdiBjbGFzcz1oZWFkZXItbm90eS1ib3gtaW5uZXI+PHVsIGNsYXNzPVwiaGVhZGVyLW5vdHktbGlzdFwiPic7XHJcbiAgICAkbm90eWZpX2J0bi5maW5kKCdhJykucmVtb3ZlQXR0cignaHJlZicpO1xyXG4gICAgdmFyIGhhc19uZXcgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5ub3RpZmljYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGVsID0gZGF0YS5ub3RpZmljYXRpb25zW2ldO1xyXG4gICAgICB2YXIgaXNfbmV3ID0gKGVsLmlzX3ZpZXdlZCA9PSAwICYmIGVsLnR5cGVfaWQgPT0gMik7XHJcbiAgICAgIG91dCArPSAnPGxpIGNsYXNzPVwiaGVhZGVyLW5vdHktaXRlbScgKyAoaXNfbmV3ID8gJyBoZWFkZXItbm90eS1pdGVtX25ldycgOiAnJykgKyAnXCI+JztcclxuICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWRhdGE+JyArIGVsLmRhdGEgKyAnPC9kaXY+JztcclxuICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LXRleHQ+JyArIGVsLnRleHQgKyAnPC9kaXY+JztcclxuICAgICAgb3V0ICs9ICc8L2xpPic7XHJcbiAgICAgIGhhc19uZXcgPSBoYXNfbmV3IHx8IGlzX25ldztcclxuICAgIH1cclxuXHJcbiAgICBvdXQgKz0gJzwvdWw+JztcclxuICAgIG91dCArPSAnPGEgY2xhc3M9XCJidG4gaGVhZGVyLW5vdHktYm94LWJ0blwiIGhyZWY9XCInK2hyZWYrJ1wiPicgKyBkYXRhLmJ0biArICc8L2E+JztcclxuICAgIG91dCArPSAnPC9kaXY+PC9kaXY+JztcclxuICAgICQoJy5oZWFkZXInKS5hcHBlbmQob3V0KTtcclxuXHJcbiAgICBpZiAoaGFzX25ldykge1xyXG4gICAgICAkbm90eWZpX2J0bi5hZGRDbGFzcygndG9vbHRpcCcpLmFkZENsYXNzKCdoYXMtbm90eScpO1xyXG4gICAgfVxyXG5cclxuICAgICRub3R5ZmlfYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHZhciBocmVmID0gICQoJyNhY2NvdW50X25vdGlmaWNhdGlvbnNfbGluaycpLmF0dHIoJ2hyZWYnKTtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBpZiAoJCgnLmhlYWRlci1ub3R5LWJveCcpLmhhc0NsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpKSB7XHJcbiAgICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xyXG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5hZGRDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuXHJcbiAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2hhcy1ub3R5JykpIHtcclxuICAgICAgICAgICQucG9zdChocmVmLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5oZWFkZXItbG9nb19ub3R5JykucmVtb3ZlQ2xhc3MoJ3Rvb2x0aXAnKS5yZW1vdmVDbGFzcygnaGFzLW5vdHknKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XHJcbiAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLmhlYWRlci1ub3R5LWxpc3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pXHJcbiAgfSwgJ2pzb24nKTtcclxuXHJcbn0pKCk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmlmICh0eXBlb2YgbWloYWlsZGV2ID09IFwidW5kZWZpbmVkXCIgfHwgIW1paGFpbGRldikge1xyXG4gICAgdmFyIG1paGFpbGRldiA9IHt9O1xyXG4gICAgbWloYWlsZGV2LmVsRmluZGVyID0ge1xyXG4gICAgICAgIG9wZW5NYW5hZ2VyOiBmdW5jdGlvbihvcHRpb25zKXtcclxuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IFwibWVudWJhcj1ubyx0b29sYmFyPW5vLGxvY2F0aW9uPW5vLGRpcmVjdG9yaWVzPW5vLHN0YXR1cz1ubyxmdWxsc2NyZWVuPW5vXCI7XHJcbiAgICAgICAgICAgIGlmKG9wdGlvbnMud2lkdGggPT0gJ2F1dG8nKXtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMud2lkdGggPSAkKHdpbmRvdykud2lkdGgoKS8xLjU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKG9wdGlvbnMuaGVpZ2h0ID09ICdhdXRvJyl7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKS8xLjU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcyArIFwiLHdpZHRoPVwiICsgb3B0aW9ucy53aWR0aDtcclxuICAgICAgICAgICAgcGFyYW1zID0gcGFyYW1zICsgXCIsaGVpZ2h0PVwiICsgb3B0aW9ucy5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHBhcmFtcyk7XHJcbiAgICAgICAgICAgIHZhciB3aW4gPSB3aW5kb3cub3BlbihvcHRpb25zLnVybCwgJ0VsRmluZGVyTWFuYWdlcicgKyBvcHRpb25zLmlkLCBwYXJhbXMpO1xyXG4gICAgICAgICAgICB3aW4uZm9jdXMoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb25zOiB7fSxcclxuICAgICAgICByZWdpc3RlcjogZnVuY3Rpb24oaWQsIGZ1bmMpe1xyXG4gICAgICAgICAgICB0aGlzLmZ1bmN0aW9uc1tpZF0gPSBmdW5jO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2FsbEZ1bmN0aW9uOiBmdW5jdGlvbihpZCwgZmlsZSl7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZ1bmN0aW9uc1tpZF0oZmlsZSwgaWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb25SZXR1cm5Ub0lucHV0OiBmdW5jdGlvbihmaWxlLCBpZCl7XHJcbiAgICAgICAgICAgIGpRdWVyeSgnIycgKyBpZCkudmFsKGZpbGUudXJsKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbn1cclxuXHJcblxyXG5cclxudmFyIG1lZ2FzbGlkZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gIHZhciBzbGlkZXJfZGF0YSA9IGZhbHNlO1xyXG4gIHZhciBjb250YWluZXJfaWQgPSBcInNlY3Rpb24jbWVnYV9zbGlkZXJcIjtcclxuICB2YXIgcGFyYWxsYXhfZ3JvdXAgPSBmYWxzZTtcclxuICB2YXIgcGFyYWxsYXhfdGltZXIgPSBmYWxzZTtcclxuICB2YXIgcGFyYWxsYXhfY291bnRlciA9IDA7XHJcbiAgdmFyIHBhcmFsbGF4X2QgPSAxO1xyXG4gIHZhciBtb2JpbGVfbW9kZSA9IC0xO1xyXG4gIHZhciBtYXhfdGltZV9sb2FkX3BpYyA9IDMwMDtcclxuICB2YXIgbW9iaWxlX3NpemUgPSA3MDA7XHJcbiAgdmFyIHJlbmRlcl9zbGlkZV9ub20gPSAwO1xyXG4gIHZhciB0b3RfaW1nX3dhaXQ7XHJcbiAgdmFyIHNsaWRlcztcclxuICB2YXIgc2xpZGVfc2VsZWN0X2JveDtcclxuICB2YXIgZWRpdG9yO1xyXG4gIHZhciB0aW1lb3V0SWQ7XHJcbiAgdmFyIHNjcm9sbF9wZXJpb2QgPSA2MDAwO1xyXG5cclxuICB2YXIgcG9zQXJyID0gW1xyXG4gICAgJ3NsaWRlcl9fdGV4dC1sdCcsICdzbGlkZXJfX3RleHQtY3QnLCAnc2xpZGVyX190ZXh0LXJ0JyxcclxuICAgICdzbGlkZXJfX3RleHQtbGMnLCAnc2xpZGVyX190ZXh0LWNjJywgJ3NsaWRlcl9fdGV4dC1yYycsXHJcbiAgICAnc2xpZGVyX190ZXh0LWxiJywgJ3NsaWRlcl9fdGV4dC1jYicsICdzbGlkZXJfX3RleHQtcmInLFxyXG4gIF07XHJcbiAgdmFyIHBvc19saXN0ID0gW1xyXG4gICAgJ9Cb0LXQstC+INCy0LXRgNGFJywgJ9GG0LXQvdGC0YAg0LLQtdGA0YUnLCAn0L/RgNCw0LLQviDQstC10YDRhScsXHJcbiAgICAn0JvQtdCy0L4g0YbQtdC90YLRgCcsICfRhtC10L3RgtGAJywgJ9C/0YDQsNCy0L4g0YbQtdC90YLRgCcsXHJcbiAgICAn0JvQtdCy0L4g0L3QuNC3JywgJ9GG0LXQvdGC0YAg0L3QuNC3JywgJ9C/0YDQsNCy0L4g0L3QuNC3JyxcclxuICBdO1xyXG4gIHZhciBzaG93X2RlbGF5ID0gW1xyXG4gICAgJ3Nob3dfbm9fZGVsYXknLFxyXG4gICAgJ3Nob3dfZGVsYXlfMDUnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMTAnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMTUnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMjAnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMjUnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMzAnXHJcbiAgXTtcclxuICB2YXIgaGlkZV9kZWxheSA9IFtcclxuICAgICdoaWRlX25vX2RlbGF5JyxcclxuICAgICdoaWRlX2RlbGF5XzA1JyxcclxuICAgICdoaWRlX2RlbGF5XzEwJyxcclxuICAgICdoaWRlX2RlbGF5XzE1JyxcclxuICAgICdoaWRlX2RlbGF5XzIwJ1xyXG4gIF07XHJcbiAgdmFyIHllc19ub19hcnIgPSBbXHJcbiAgICAnbm8nLFxyXG4gICAgJ3llcydcclxuICBdO1xyXG4gIHZhciB5ZXNfbm9fdmFsID0gW1xyXG4gICAgJycsXHJcbiAgICAnZml4ZWRfX2Z1bGwtaGVpZ2h0J1xyXG4gIF07XHJcbiAgdmFyIGJ0bl9zdHlsZSA9IFtcclxuICAgICdub25lJyxcclxuICAgICdib3JkbycsXHJcbiAgICAnYmxhY2snLFxyXG4gICAgJ2JsdWUnLFxyXG4gICAgJ2RhcmstYmx1ZScsXHJcbiAgICAncmVkJyxcclxuICAgICdvcmFuZ2UnLFxyXG4gICAgJ2dyZWVuJyxcclxuICAgICdsaWdodC1ncmVlbicsXHJcbiAgICAnZGFyay1ncmVlbicsXHJcbiAgICAncGluaycsXHJcbiAgICAneWVsbG93J1xyXG4gIF07XHJcbiAgdmFyIHNob3dfYW5pbWF0aW9ucyA9IFtcclxuICAgIFwibm90X2FuaW1hdGVcIixcclxuICAgIFwiYm91bmNlSW5cIixcclxuICAgIFwiYm91bmNlSW5Eb3duXCIsXHJcbiAgICBcImJvdW5jZUluTGVmdFwiLFxyXG4gICAgXCJib3VuY2VJblJpZ2h0XCIsXHJcbiAgICBcImJvdW5jZUluVXBcIixcclxuICAgIFwiZmFkZUluXCIsXHJcbiAgICBcImZhZGVJbkRvd25cIixcclxuICAgIFwiZmFkZUluTGVmdFwiLFxyXG4gICAgXCJmYWRlSW5SaWdodFwiLFxyXG4gICAgXCJmYWRlSW5VcFwiLFxyXG4gICAgXCJmbGlwSW5YXCIsXHJcbiAgICBcImZsaXBJbllcIixcclxuICAgIFwibGlnaHRTcGVlZEluXCIsXHJcbiAgICBcInJvdGF0ZUluXCIsXHJcbiAgICBcInJvdGF0ZUluRG93bkxlZnRcIixcclxuICAgIFwicm90YXRlSW5VcExlZnRcIixcclxuICAgIFwicm90YXRlSW5VcFJpZ2h0XCIsXHJcbiAgICBcImphY2tJblRoZUJveFwiLFxyXG4gICAgXCJyb2xsSW5cIixcclxuICAgIFwiem9vbUluXCJcclxuICBdO1xyXG5cclxuICB2YXIgaGlkZV9hbmltYXRpb25zID0gW1xyXG4gICAgXCJub3RfYW5pbWF0ZVwiLFxyXG4gICAgXCJib3VuY2VPdXRcIixcclxuICAgIFwiYm91bmNlT3V0RG93blwiLFxyXG4gICAgXCJib3VuY2VPdXRMZWZ0XCIsXHJcbiAgICBcImJvdW5jZU91dFJpZ2h0XCIsXHJcbiAgICBcImJvdW5jZU91dFVwXCIsXHJcbiAgICBcImZhZGVPdXRcIixcclxuICAgIFwiZmFkZU91dERvd25cIixcclxuICAgIFwiZmFkZU91dExlZnRcIixcclxuICAgIFwiZmFkZU91dFJpZ2h0XCIsXHJcbiAgICBcImZhZGVPdXRVcFwiLFxyXG4gICAgXCJmbGlwT3V0WFwiLFxyXG4gICAgXCJsaXBPdXRZXCIsXHJcbiAgICBcImxpZ2h0U3BlZWRPdXRcIixcclxuICAgIFwicm90YXRlT3V0XCIsXHJcbiAgICBcInJvdGF0ZU91dERvd25MZWZ0XCIsXHJcbiAgICBcInJvdGF0ZU91dERvd25SaWdodFwiLFxyXG4gICAgXCJyb3RhdGVPdXRVcExlZnRcIixcclxuICAgIFwicm90YXRlT3V0VXBSaWdodFwiLFxyXG4gICAgXCJoaW5nZVwiLFxyXG4gICAgXCJyb2xsT3V0XCJcclxuICBdO1xyXG4gIHZhciBzdFRhYmxlO1xyXG4gIHZhciBwYXJhbGF4VGFibGU7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRJbWFnZVNlcnZlclNlbGVjdChlbHMpIHtcclxuICAgIGlmIChlbHMubGVuZ3RoID09IDApcmV0dXJuO1xyXG4gICAgZWxzLndyYXAoJzxkaXYgY2xhc3M9XCJzZWxlY3RfaW1nXCI+Jyk7XHJcbiAgICBlbHMgPSBlbHMucGFyZW50KCk7XHJcbiAgICBlbHMuYXBwZW5kKCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImZpbGVfYnV0dG9uXCI+PGkgY2xhc3M9XCJtY2UtaWNvIG1jZS1pLWJyb3dzZVwiPjwvaT48L2J1dHRvbj4nKTtcclxuICAgIC8qZWxzLmZpbmQoJ2J1dHRvbicpLm9uKCdjbGljaycsZnVuY3Rpb24gKCkge1xyXG4gICAgICQoJyNyb3h5Q3VzdG9tUGFuZWwyJykuYWRkQ2xhc3MoJ29wZW4nKVxyXG4gICAgIH0pOyovXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgZWwgPSBlbHMuZXEoaSkuZmluZCgnaW5wdXQnKTtcclxuICAgICAgaWYgKCFlbC5hdHRyKCdpZCcpKSB7XHJcbiAgICAgICAgZWwuYXR0cignaWQnLCAnZmlsZV8nICsgaSArICdfJyArIERhdGUubm93KCkpXHJcbiAgICAgIH1cclxuICAgICAgdmFyIHRfaWQgPSBlbC5hdHRyKCdpZCcpO1xyXG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIucmVnaXN0ZXIodF9pZCwgZnVuY3Rpb24gKGZpbGUsIGlkKSB7XHJcbiAgICAgICAgLy8kKHRoaXMpLnZhbChmaWxlLnVybCkudHJpZ2dlcignY2hhbmdlJywgW2ZpbGUsIGlkXSk7XHJcbiAgICAgICAgJCgnIycgKyBpZCkudmFsKGZpbGUudXJsKS5jaGFuZ2UoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICA7XHJcblxyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5maWxlX2J1dHRvbicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKS5wcmV2KCk7XHJcbiAgICAgIHZhciBpZCA9ICR0aGlzLmF0dHIoJ2lkJyk7XHJcbiAgICAgIG1paGFpbGRldi5lbEZpbmRlci5vcGVuTWFuYWdlcih7XHJcbiAgICAgICAgXCJ1cmxcIjogXCIvbWFuYWdlci9lbGZpbmRlcj9maWx0ZXI9aW1hZ2UmY2FsbGJhY2s9XCIgKyBpZCArIFwiJmxhbmc9cnVcIixcclxuICAgICAgICBcIndpZHRoXCI6IFwiYXV0b1wiLFxyXG4gICAgICAgIFwiaGVpZ2h0XCI6IFwiYXV0b1wiLFxyXG4gICAgICAgIFwiaWRcIjogaWRcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbklucHV0KGRhdGEpIHtcclxuICAgIHZhciBpbnB1dCA9ICc8aW5wdXQgY2xhc3M9XCInICsgKGRhdGEuaW5wdXRDbGFzcyB8fCAnJykgKyAnXCIgdmFsdWU9XCInICsgKGRhdGEudmFsdWUgfHwgJycpICsgJ1wiPic7XHJcbiAgICBpZiAoZGF0YS5sYWJlbCkge1xyXG4gICAgICBpbnB1dCA9ICc8bGFiZWw+PHNwYW4+JyArIGRhdGEubGFiZWwgKyAnPC9zcGFuPicgKyBpbnB1dCArICc8L2xhYmVsPic7XHJcbiAgICB9XHJcbiAgICBpZiAoZGF0YS5wYXJlbnQpIHtcclxuICAgICAgaW5wdXQgPSAnPCcgKyBkYXRhLnBhcmVudCArICc+JyArIGlucHV0ICsgJzwvJyArIGRhdGEucGFyZW50ICsgJz4nO1xyXG4gICAgfVxyXG4gICAgaW5wdXQgPSAkKGlucHV0KTtcclxuXHJcbiAgICBpZiAoZGF0YS5vbkNoYW5nZSkge1xyXG4gICAgICB2YXIgb25DaGFuZ2U7XHJcbiAgICAgIGlmIChkYXRhLmJpbmQpIHtcclxuICAgICAgICBkYXRhLmJpbmQuaW5wdXQgPSBpbnB1dC5maW5kKCdpbnB1dCcpO1xyXG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGRhdGEuYmluZCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb25DaGFuZ2UgPSBkYXRhLm9uQ2hhbmdlLmJpbmQoaW5wdXQuZmluZCgnaW5wdXQnKSk7XHJcbiAgICAgIH1cclxuICAgICAgaW5wdXQuZmluZCgnaW5wdXQnKS5vbignY2hhbmdlJywgb25DaGFuZ2UpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5TZWxlY3QoZGF0YSkge1xyXG4gICAgdmFyIGlucHV0ID0gJCgnPHNlbGVjdC8+Jyk7XHJcblxyXG4gICAgdmFyIGVsID0gc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl07XHJcbiAgICBpZiAoZGF0YS5pbmRleCAhPT0gZmFsc2UpIHtcclxuICAgICAgZWwgPSBlbFtkYXRhLmluZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZWxbZGF0YS5wYXJhbV0pIHtcclxuICAgICAgZGF0YS52YWx1ZSA9IGVsW2RhdGEucGFyYW1dO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGF0YS52YWx1ZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRhdGEuc3RhcnRfb3B0aW9uKSB7XHJcbiAgICAgIGlucHV0LmFwcGVuZChkYXRhLnN0YXJ0X29wdGlvbilcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgdmFsO1xyXG4gICAgICB2YXIgdHh0ID0gZGF0YS5saXN0W2ldO1xyXG4gICAgICBpZiAoZGF0YS52YWxfdHlwZSA9PSAwKSB7XHJcbiAgICAgICAgdmFsID0gZGF0YS5saXN0W2ldO1xyXG4gICAgICB9IGVsc2UgaWYgKGRhdGEudmFsX3R5cGUgPT0gMSkge1xyXG4gICAgICAgIHZhbCA9IGk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWxfdHlwZSA9PSAyKSB7XHJcbiAgICAgICAgLy92YWw9ZGF0YS52YWxfbGlzdFtpXTtcclxuICAgICAgICB2YWwgPSBpO1xyXG4gICAgICAgIHR4dCA9IGRhdGEudmFsX2xpc3RbaV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBzZWwgPSAodmFsID09IGRhdGEudmFsdWUgPyAnc2VsZWN0ZWQnIDogJycpO1xyXG4gICAgICBpZiAoc2VsID09ICdzZWxlY3RlZCcpIHtcclxuICAgICAgICBpbnB1dC5hdHRyKCd0X3ZhbCcsIGRhdGEubGlzdFtpXSk7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIG9wdGlvbiA9ICc8b3B0aW9uIHZhbHVlPVwiJyArIHZhbCArICdcIiAnICsgc2VsICsgJz4nICsgdHh0ICsgJzwvb3B0aW9uPic7XHJcbiAgICAgIGlmIChkYXRhLnZhbF90eXBlID09IDIpIHtcclxuICAgICAgICBvcHRpb24gPSAkKG9wdGlvbikuYXR0cignY29kZScsIGRhdGEubGlzdFtpXSk7XHJcbiAgICAgIH1cclxuICAgICAgaW5wdXQuYXBwZW5kKG9wdGlvbilcclxuICAgIH1cclxuXHJcbiAgICBpbnB1dC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICBkYXRhID0gdGhpcztcclxuICAgICAgdmFyIHZhbCA9IGRhdGEuZWwudmFsKCk7XHJcbiAgICAgIHZhciBzbF9vcCA9IGRhdGEuZWwuZmluZCgnb3B0aW9uW3ZhbHVlPScgKyB2YWwgKyAnXScpO1xyXG4gICAgICB2YXIgY2xzID0gc2xfb3AudGV4dCgpO1xyXG4gICAgICB2YXIgY2ggPSBzbF9vcC5hdHRyKCdjb2RlJyk7XHJcbiAgICAgIGlmICghY2gpY2ggPSBjbHM7XHJcbiAgICAgIGlmIChkYXRhLmluZGV4ICE9PSBmYWxzZSkge1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdW2RhdGEuaW5kZXhdW2RhdGEucGFyYW1dID0gdmFsO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdW2RhdGEucGFyYW1dID0gdmFsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkYXRhLm9iai5yZW1vdmVDbGFzcyhkYXRhLnByZWZpeCArIGRhdGEuZWwuYXR0cigndF92YWwnKSk7XHJcbiAgICAgIGRhdGEub2JqLmFkZENsYXNzKGRhdGEucHJlZml4ICsgY2gpO1xyXG4gICAgICBkYXRhLmVsLmF0dHIoJ3RfdmFsJywgY2gpO1xyXG5cclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgfS5iaW5kKHtcclxuICAgICAgZWw6IGlucHV0LFxyXG4gICAgICBvYmo6IGRhdGEub2JqLFxyXG4gICAgICBncjogZGF0YS5ncixcclxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXHJcbiAgICAgIHBhcmFtOiBkYXRhLnBhcmFtLFxyXG4gICAgICBwcmVmaXg6IGRhdGEucHJlZml4IHx8ICcnXHJcbiAgICB9KSk7XHJcblxyXG4gICAgaWYgKGRhdGEucGFyZW50KSB7XHJcbiAgICAgIHZhciBwYXJlbnQgPSAkKCc8JyArIGRhdGEucGFyZW50ICsgJy8+Jyk7XHJcbiAgICAgIHBhcmVudC5hcHBlbmQoaW5wdXQpO1xyXG4gICAgICByZXR1cm4gcGFyZW50O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlucHV0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoZGF0YSkge1xyXG4gICAgdmFyIGFuaW1fc2VsID0gW107XHJcbiAgICB2YXIgb3V0O1xyXG5cclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5TaG93IGFuaW1hdGlvbjwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogc2hvd19hbmltYXRpb25zLFxyXG4gICAgICB2YWxfdHlwZTogMCxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogJ3Nob3dfYW5pbWF0aW9uJyxcclxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcclxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPlNob3cgZGVsYXk8L3NwYW4+Jyk7XHJcbiAgICB9XHJcbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHNob3dfZGVsYXksXHJcbiAgICAgIHZhbF90eXBlOiAxLFxyXG4gICAgICBvYmo6IGRhdGEub2JqLFxyXG4gICAgICBncjogZGF0YS5ncixcclxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXHJcbiAgICAgIHBhcmFtOiAnc2hvd19kZWxheScsXHJcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcclxuICAgIH0pKTtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPGJyLz4nKTtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+SGlkZSBhbmltYXRpb248L3NwYW4+Jyk7XHJcbiAgICB9XHJcbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IGhpZGVfYW5pbWF0aW9ucyxcclxuICAgICAgdmFsX3R5cGU6IDAsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ICdoaWRlX2FuaW1hdGlvbicsXHJcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcclxuICAgIH0pKTtcclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5IaWRlIGRlbGF5PC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBoaWRlX2RlbGF5LFxyXG4gICAgICB2YWxfdHlwZTogMSxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogJ2hpZGVfZGVsYXknLFxyXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XHJcbiAgICB9KSk7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XHJcbiAgICAgIG91dCA9ICQoJzxkaXYgY2xhc3M9XCJhbmltX3NlbFwiLz4nKTtcclxuICAgICAgb3V0LmFwcGVuZChhbmltX3NlbCk7XHJcbiAgICB9XHJcbiAgICBpZiAoZGF0YS50eXBlID09IDEpIHtcclxuICAgICAgb3V0ID0gYW5pbV9zZWw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG91dDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRfZWRpdG9yKCkge1xyXG4gICAgJCgnI3cxJykucmVtb3ZlKCk7XHJcbiAgICAkKCcjdzFfYnV0dG9uJykucmVtb3ZlKCk7XHJcbiAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUuc3BsaXQoJz8nKVswXTtcclxuXHJcbiAgICB2YXIgZWwgPSAkKCcjbWVnYV9zbGlkZXJfY29udHJvbGUnKTtcclxuICAgIHZhciBidG5zX2JveCA9ICQoJzxkaXYgY2xhc3M9XCJidG5fYm94XCIvPicpO1xyXG5cclxuICAgIGVsLmFwcGVuZCgnPGgyPtCj0L/RgNCw0LLQu9C10L3QuNC1PC9oMj4nKTtcclxuICAgIGVsLmFwcGVuZCgkKCc8dGV4dGFyZWEvPicsIHtcclxuICAgICAgdGV4dDogSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pLFxyXG4gICAgICBpZDogJ3NsaWRlX2RhdGEnLFxyXG4gICAgICBuYW1lOiBlZGl0b3JcclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgYnRuID0gJCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XHJcbiAgICBidG5zX2JveC5hcHBlbmQoYnRuKTtcclxuICAgIGJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkucmVtb3ZlQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBidG4gPSAkKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQlNC10LDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XHJcbiAgICBidG5zX2JveC5hcHBlbmQoYnRuKTtcclxuICAgIGJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcclxuICAgIH0pO1xyXG4gICAgZWwuYXBwZW5kKGJ0bnNfYm94KTtcclxuXHJcbiAgICBlbC5hcHBlbmQoJzxoMj7QntCx0YnQuNC1INC/0LDRgNCw0LzQtdGC0YDRizwvaDI+Jyk7XHJcbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0ubW9iaWxlLFxyXG4gICAgICBsYWJlbDogXCLQodC70LDQudC0INC00LvRjyDRgtC10LvQtdGE0L7QvdCwXCIsXHJcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gJCh0aGlzKS52YWwoKVxyXG4gICAgICAgICQoJy5tb2JfYmcnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnKScpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG5cclxuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5mb24sXHJcbiAgICAgIGxhYmVsOiBcItCe0YHQvdC+0L3QvtC5INGE0L7QvVwiLFxyXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZvbiA9ICQodGhpcykudmFsKClcclxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgc2xpZGVyX2RhdGFbMF0uZm9uICsgJyknKVxyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG5cclxuICAgIHZhciBidG5fY2ggPSAkKCc8ZGl2IGNsYXNzPVwiYnRuc1wiLz4nKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQoJzxoMz7QmtC90L7Qv9C60LAg0L/QtdGA0LXRhdC+0LTQsCjQtNC70Y8g0J/QmiDQstC10YDRgdC40LgpPC9oMz4nKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQsXHJcbiAgICAgIGxhYmVsOiBcItCi0LXQutGB0YJcIixcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0ID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApLnRleHQoc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfSxcclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgYnV0X3NsID0gJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0uYnV0dG9uLmhyZWYsXHJcbiAgICAgIGxhYmVsOiBcItCh0YHRi9C70LrQsFwiLFxyXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uYnV0dG9uLmhyZWYgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCkuYXR0cignaHJlZicsc2xpZGVyX2RhdGFbMF0uYnV0dG9uLmhyZWYpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfSxcclxuICAgIH0pKTtcclxuXHJcbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xyXG4gICAgdmFyIHdyYXBfbGFiID0gJCgnPGxhYmVsLz4nKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQod3JhcF9sYWIpO1xyXG4gICAgd3JhcF9sYWIuYXBwZW5kKCc8c3Bhbj7QntGE0L7RgNC80LvQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XHJcbiAgICB3cmFwX2xhYi5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogYnRuX3N0eWxlLFxyXG4gICAgICB2YWxfdHlwZTogMCxcclxuICAgICAgb2JqOiBidXRfc2wsXHJcbiAgICAgIGdyOiAnYnV0dG9uJyxcclxuICAgICAgaW5kZXg6IGZhbHNlLFxyXG4gICAgICBwYXJhbTogJ2NvbG9yJ1xyXG4gICAgfSkpO1xyXG5cclxuICAgIGJ0bl9jaC5hcHBlbmQoJzxici8+Jyk7XHJcbiAgICB3cmFwX2xhYiA9ICQoJzxsYWJlbC8+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKHdyYXBfbGFiKTtcclxuICAgIHdyYXBfbGFiLmFwcGVuZCgnPHNwYW4+0J/QvtC70L7QttC10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcclxuICAgIHdyYXBfbGFiLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBwb3NBcnIsXHJcbiAgICAgIHZhbF9saXN0OiBwb3NfbGlzdCxcclxuICAgICAgdmFsX3R5cGU6IDIsXHJcbiAgICAgIG9iajogYnV0X3NsLnBhcmVudCgpLnBhcmVudCgpLFxyXG4gICAgICBncjogJ2J1dHRvbicsXHJcbiAgICAgIGluZGV4OiBmYWxzZSxcclxuICAgICAgcGFyYW06ICdwb3MnXHJcbiAgICB9KSk7XHJcblxyXG4gICAgYnRuX2NoLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIG9iajogYnV0X3NsLnBhcmVudCgpLFxyXG4gICAgICBncjogJ2J1dHRvbicsXHJcbiAgICAgIGluZGV4OiBmYWxzZVxyXG4gICAgfSkpO1xyXG4gICAgZWwuYXBwZW5kKGJ0bl9jaCk7XHJcblxyXG4gICAgdmFyIGxheWVyID0gJCgnPGRpdiBjbGFzcz1cImZpeGVkX2xheWVyXCIvPicpO1xyXG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0KHRgtCw0YLQuNGH0LXRgdC60LjQtSDRgdC70L7QuDwvaDI+Jyk7XHJcbiAgICB2YXIgdGggPSBcIjx0aD7ihJY8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JrQsNGA0YLQuNC90LrQsDwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0KHQu9C+0Lkg0L3QsCDQstGB0Y4g0LLRi9GB0L7RgtGDPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCQ0L3QuNC80LDRhtC40Y8g0L/QvtGP0LLQu9C10L3QuNGPPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCX0LDQtNC10YDQttC60LAg0L/QvtGP0LLQu9C10L3QuNGPPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCQ0L3QuNC80LDRhtC40Y8g0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCX0LDQtNC10YDQttC60LAg0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCU0LXQudGB0YLQstC40LU8L3RoPlwiO1xyXG4gICAgc3RUYWJsZSA9ICQoJzx0YWJsZSBib3JkZXI9XCIxXCI+PHRyPicgKyB0aCArICc8L3RyPjwvdGFibGU+Jyk7XHJcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XHJcbiAgICB2YXIgZGF0YSA9IHNsaWRlcl9kYXRhWzBdLmZpeGVkO1xyXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFkZFRyU3RhdGljKGRhdGFbaV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBsYXllci5hcHBlbmQoc3RUYWJsZSk7XHJcbiAgICB2YXIgYWRkQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xyXG4gICAgICB0ZXh0OiBcItCU0L7QsdCw0LLQuNGC0Ywg0YHQu9C+0LlcIlxyXG4gICAgfSk7XHJcbiAgICBhZGRCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBkYXRhID0gYWRkVHJTdGF0aWMoZmFsc2UpO1xyXG4gICAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZGF0YS5lZGl0b3IuZmluZCgnLmZpbGVTZWxlY3QnKSk7XHJcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgfS5iaW5kKHtcclxuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXHJcbiAgICB9KSk7XHJcbiAgICBsYXllci5hcHBlbmQoYWRkQnRuKTtcclxuICAgIGVsLmFwcGVuZChsYXllcik7XHJcblxyXG4gICAgdmFyIGxheWVyID0gJCgnPGRpdiBjbGFzcz1cInBhcmFsYXhfbGF5ZXJcIi8+Jyk7XHJcbiAgICBsYXllci5hcHBlbmQoJzxoMj7Qn9Cw0YDQsNC70LDQutGBINGB0LvQvtC4PC9oMj4nKTtcclxuICAgIHZhciB0aCA9IFwiPHRoPuKEljwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7Qo9C00LDQu9C10L3QvdC+0YHRgtGMICjRhtC10LvQvtC1INC/0L7Qu9C+0LbQuNGC0LXQu9GM0L3QvtC1INGH0LjRgdC70L4pPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCU0LXQudGB0YLQstC40LU8L3RoPlwiO1xyXG5cclxuICAgIHBhcmFsYXhUYWJsZSA9ICQoJzx0YWJsZSBib3JkZXI9XCIxXCI+PHRyPicgKyB0aCArICc8L3RyPjwvdGFibGU+Jyk7XHJcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XHJcbiAgICB2YXIgZGF0YSA9IHNsaWRlcl9kYXRhWzBdLnBhcmFsYXg7XHJcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYWRkVHJQYXJhbGF4KGRhdGFbaV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBsYXllci5hcHBlbmQocGFyYWxheFRhYmxlKTtcclxuICAgIHZhciBhZGRCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XHJcbiAgICAgIHRleHQ6IFwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXHJcbiAgICB9KTtcclxuICAgIGFkZEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGRhdGEgPSBhZGRUclBhcmFsYXgoZmFsc2UpO1xyXG4gICAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZGF0YS5lZGl0b3IuZmluZCgnLmZpbGVTZWxlY3QnKSk7XHJcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgfS5iaW5kKHtcclxuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXHJcbiAgICB9KSk7XHJcblxyXG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XHJcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xyXG5cclxuICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChlbC5maW5kKCcuZmlsZVNlbGVjdCcpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFRyU3RhdGljKGRhdGEpIHtcclxuICAgIHZhciBpID0gc3RUYWJsZS5maW5kKCd0cicpLmxlbmd0aCAtIDE7XHJcbiAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgZGF0YSA9IHtcclxuICAgICAgICBcImltZ1wiOiBcIlwiLFxyXG4gICAgICAgIFwiZnVsbF9oZWlnaHRcIjogMCxcclxuICAgICAgICBcInBvc1wiOiAwLFxyXG4gICAgICAgIFwic2hvd19kZWxheVwiOiAxLFxyXG4gICAgICAgIFwic2hvd19hbmltYXRpb25cIjogXCJsaWdodFNwZWVkSW5cIixcclxuICAgICAgICBcImhpZGVfZGVsYXlcIjogMSxcclxuICAgICAgICBcImhpZGVfYW5pbWF0aW9uXCI6IFwiYm91bmNlT3V0XCJcclxuICAgICAgfTtcclxuICAgICAgc2xpZGVyX2RhdGFbMF0uZml4ZWQucHVzaChkYXRhKTtcclxuICAgICAgdmFyIGZpeCA9ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAnKTtcclxuICAgICAgYWRkU3RhdGljTGF5ZXIoZGF0YSwgZml4LCB0cnVlKTtcclxuICAgIH1cclxuICAgIDtcclxuXHJcbiAgICB2YXIgdHIgPSAkKCc8dHIvPicpO1xyXG4gICAgdHIuYXBwZW5kKCc8dGQgY2xhc3M9XCJ0ZF9jb3VudGVyXCIvPicpO1xyXG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IGRhdGEuaW1nLFxyXG4gICAgICBsYWJlbDogZmFsc2UsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXHJcbiAgICAgIGJpbmQ6IHtcclxuICAgICAgICBncjogJ2ZpeGVkJyxcclxuICAgICAgICBpbmRleDogaSxcclxuICAgICAgICBwYXJhbTogJ2ltZycsXHJcbiAgICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5maW5kKCcuYW5pbWF0aW9uX2xheWVyJyksXHJcbiAgICAgIH0sXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbnB1dC52YWwoKSArICcpJyk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uZml4ZWRbZGF0YS5pbmRleF0uaW1nID0gZGF0YS5pbnB1dC52YWwoKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBwb3NBcnIsXHJcbiAgICAgIHZhbF9saXN0OiBwb3NfbGlzdCxcclxuICAgICAgdmFsX3R5cGU6IDIsXHJcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXHJcbiAgICAgIGdyOiAnZml4ZWQnLFxyXG4gICAgICBpbmRleDogaSxcclxuICAgICAgcGFyYW06ICdwb3MnLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogeWVzX25vX3ZhbCxcclxuICAgICAgdmFsX2xpc3Q6IHllc19ub19hcnIsXHJcbiAgICAgIHZhbF90eXBlOiAyLFxyXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLFxyXG4gICAgICBncjogJ2ZpeGVkJyxcclxuICAgICAgaW5kZXg6IGksXHJcbiAgICAgIHBhcmFtOiAnZnVsbF9oZWlnaHQnLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoe1xyXG4gICAgICB0eXBlOiAxLFxyXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcclxuICAgICAgZ3I6ICdmaXhlZCcsXHJcbiAgICAgIGluZGV4OiBpLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCdcclxuICAgIH0pKTtcclxuICAgIHZhciBkZWxCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XHJcbiAgICAgIHRleHQ6IFwi0KPQtNCw0LvQuNGC0YxcIlxyXG4gICAgfSk7XHJcbiAgICBkZWxCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMuZWwpO1xyXG4gICAgICBpID0gJHRoaXMuY2xvc2VzdCgndHInKS5pbmRleCgpIC0gMTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHQu9C+0Lkg0L3QsCDRgdC70LDQudC00LXRgNC1XHJcbiAgICAgICR0aGlzLmNsb3Nlc3QoJ3RyJykucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHRgtGA0L7QutGDINCyINGC0LDQsdC70LjRhtC1XHJcbiAgICAgIHRoaXMuc2xpZGVyX2RhdGFbMF0uZml4ZWQuc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXHJcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgfS5iaW5kKHtcclxuICAgICAgZWw6IGRlbEJ0bixcclxuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXHJcbiAgICB9KSk7XHJcbiAgICB2YXIgZGVsQnRuVGQgPSAkKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xyXG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcclxuICAgIHN0VGFibGUuYXBwZW5kKHRyKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVkaXRvcjogdHIsXHJcbiAgICAgIGRhdGE6IGRhdGFcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFRyUGFyYWxheChkYXRhKSB7XHJcbiAgICB2YXIgaSA9IHBhcmFsYXhUYWJsZS5maW5kKCd0cicpLmxlbmd0aCAtIDE7XHJcbiAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgZGF0YSA9IHtcclxuICAgICAgICBcImltZ1wiOiBcIlwiLFxyXG4gICAgICAgIFwielwiOiAxXHJcbiAgICAgIH07XHJcbiAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXgucHVzaChkYXRhKTtcclxuICAgICAgdmFyIHBhcmFsYXhfZ3IgPSAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCcpO1xyXG4gICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YSwgcGFyYWxheF9ncik7XHJcbiAgICB9XHJcbiAgICA7XHJcbiAgICB2YXIgdHIgPSAkKCc8dHIvPicpO1xyXG4gICAgdHIuYXBwZW5kKCc8dGQgY2xhc3M9XCJ0ZF9jb3VudGVyXCIvPicpO1xyXG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IGRhdGEuaW1nLFxyXG4gICAgICBsYWJlbDogZmFsc2UsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXHJcbiAgICAgIGJpbmQ6IHtcclxuICAgICAgICBpbmRleDogaSxcclxuICAgICAgICBwYXJhbTogJ2ltZycsXHJcbiAgICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxyXG4gICAgICB9LFxyXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgICAgIGRhdGEub2JqLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW5wdXQudmFsKCkgKyAnKScpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0uaW1nID0gZGF0YS5pbnB1dC52YWwoKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBwb3NBcnIsXHJcbiAgICAgIHZhbF9saXN0OiBwb3NfbGlzdCxcclxuICAgICAgdmFsX3R5cGU6IDIsXHJcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLmZpbmQoJ3NwYW4nKSxcclxuICAgICAgZ3I6ICdwYXJhbGF4JyxcclxuICAgICAgaW5kZXg6IGksXHJcbiAgICAgIHBhcmFtOiAncG9zJyxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgICBzdGFydF9vcHRpb246ICc8b3B0aW9uIHZhbHVlPVwiXCIgY29kZT1cIlwiPtC90LAg0LLQtdGB0Ywg0Y3QutGA0LDQvTwvb3B0aW9uPidcclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBkYXRhLnosXHJcbiAgICAgIGxhYmVsOiBmYWxzZSxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgICBiaW5kOiB7XHJcbiAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgcGFyYW06ICdpbWcnLFxyXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLFxyXG4gICAgICB9LFxyXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgICAgIGRhdGEub2JqLmF0dHIoJ3onLCBkYXRhLmlucHV0LnZhbCgpKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLnogPSBkYXRhLmlucHV0LnZhbCgpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG5cclxuICAgIHZhciBkZWxCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XHJcbiAgICAgIHRleHQ6IFwi0KPQtNCw0LvQuNGC0YxcIlxyXG4gICAgfSk7XHJcbiAgICBkZWxCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMuZWwpO1xyXG4gICAgICBpID0gJHRoaXMuY2xvc2VzdCgndHInKS5pbmRleCgpIC0gMTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHQu9C+0Lkg0L3QsCDRgdC70LDQudC00LXRgNC1XHJcbiAgICAgICR0aGlzLmNsb3Nlc3QoJ3RyJykucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHRgtGA0L7QutGDINCyINGC0LDQsdC70LjRhtC1XHJcbiAgICAgIHRoaXMuc2xpZGVyX2RhdGFbMF0ucGFyYWxheC5zcGxpY2UoaSwgMSk7IC8v0YPQtNCw0LvRj9C10Lwg0LjQtyDQutC+0L3RhNC40LPQsCDRgdC70LDQudC00LBcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBlbDogZGVsQnRuLFxyXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuICAgIHZhciBkZWxCdG5UZCA9ICQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XHJcbiAgICB0ci5hcHBlbmQoZGVsQnRuVGQpO1xyXG4gICAgcGFyYWxheFRhYmxlLmFwcGVuZCh0cilcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlZGl0b3I6IHRyLFxyXG4gICAgICBkYXRhOiBkYXRhXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRfYW5pbWF0aW9uKGVsLCBkYXRhKSB7XHJcbiAgICB2YXIgb3V0ID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAnY2xhc3MnOiAnYW5pbWF0aW9uX2xheWVyJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKHR5cGVvZihkYXRhLnNob3dfZGVsYXkpICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIG91dC5hZGRDbGFzcyhzaG93X2RlbGF5W2RhdGEuc2hvd19kZWxheV0pO1xyXG4gICAgICBpZiAoZGF0YS5zaG93X2FuaW1hdGlvbikge1xyXG4gICAgICAgIG91dC5hZGRDbGFzcygnc2xpZGVfJyArIGRhdGEuc2hvd19hbmltYXRpb24pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZihkYXRhLmhpZGVfZGVsYXkpICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIG91dC5hZGRDbGFzcyhoaWRlX2RlbGF5W2RhdGEuaGlkZV9kZWxheV0pO1xyXG4gICAgICBpZiAoZGF0YS5oaWRlX2FuaW1hdGlvbikge1xyXG4gICAgICAgIG91dC5hZGRDbGFzcygnc2xpZGVfJyArIGRhdGEuaGlkZV9hbmltYXRpb24pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZWwuYXBwZW5kKG91dCk7XHJcbiAgICByZXR1cm4gZWw7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5lcmF0ZV9zbGlkZShkYXRhKSB7XHJcbiAgICB2YXIgc2xpZGUgPSAkKCc8ZGl2IGNsYXNzPVwic2xpZGVcIi8+Jyk7XHJcblxyXG4gICAgdmFyIG1vYl9iZyA9ICQoJzxhIGNsYXNzPVwibW9iX2JnXCIgaHJlZj1cIicgKyBkYXRhLmJ1dHRvbi5ocmVmICsgJ1wiLz4nKTtcclxuICAgIG1vYl9iZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLm1vYmlsZSArICcpJylcclxuXHJcbiAgICBzbGlkZS5hcHBlbmQobW9iX2JnKTtcclxuICAgIGlmIChtb2JpbGVfbW9kZSkge1xyXG4gICAgICByZXR1cm4gc2xpZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDRhNC+0L0g0YLQviDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIGlmIChkYXRhLmZvbikge1xyXG4gICAgICBzbGlkZS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmZvbiArICcpJylcclxuICAgIH1cclxuXHJcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XHJcbiAgICBpZiAoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciBwYXJhbGF4X2dyID0gJCgnPGRpdiBjbGFzcz1cInBhcmFsbGF4X19ncm91cFwiLz4nKTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnBhcmFsYXgubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YS5wYXJhbGF4W2ldLCBwYXJhbGF4X2dyKVxyXG4gICAgICB9XHJcbiAgICAgIHNsaWRlLmFwcGVuZChwYXJhbGF4X2dyKVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBmaXggPSAkKCc8ZGl2IGNsYXNzPVwiZml4ZWRfZ3JvdXBcIi8+Jyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuZml4ZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgYWRkU3RhdGljTGF5ZXIoZGF0YS5maXhlZFtpXSwgZml4KVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBkb3BfYmxrID0gJChcIjxkaXYgY2xhc3M9J2ZpeGVkX19sYXllcicvPlwiKTtcclxuICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEuYnV0dG9uLnBvc10pO1xyXG4gICAgdmFyIGJ1dCA9ICQoXCI8YSBjbGFzcz0nc2xpZGVyX19ocmVmJy8+XCIpO1xyXG4gICAgYnV0LmF0dHIoJ2hyZWYnLCBkYXRhLmJ1dHRvbi5ocmVmKTtcclxuICAgIGJ1dC50ZXh0KGRhdGEuYnV0dG9uLnRleHQpO1xyXG4gICAgYnV0LmFkZENsYXNzKGRhdGEuYnV0dG9uLmNvbG9yKTtcclxuICAgIGRvcF9ibGsgPSBhZGRfYW5pbWF0aW9uKGRvcF9ibGssIGRhdGEuYnV0dG9uKTtcclxuICAgIGRvcF9ibGsuZmluZCgnZGl2JykuYXBwZW5kKGJ1dCk7XHJcbiAgICBmaXguYXBwZW5kKGRvcF9ibGspO1xyXG5cclxuICAgIHNsaWRlLmFwcGVuZChmaXgpO1xyXG4gICAgcmV0dXJuIHNsaWRlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkUGFyYWxheExheWVyKGRhdGEsIHBhcmFsYXhfZ3IpIHtcclxuICAgIHZhciBwYXJhbGxheF9sYXllciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fbGF5ZXJcIlxcPicpO1xyXG4gICAgcGFyYWxsYXhfbGF5ZXIuYXR0cigneicsIGRhdGEueiB8fCBpICogMTApO1xyXG4gICAgdmFyIGRvcF9ibGsgPSAkKFwiPHNwYW4gY2xhc3M9J3NsaWRlcl9fdGV4dCcvPlwiKTtcclxuICAgIGlmIChkYXRhLnBvcykge1xyXG4gICAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLnBvc10pO1xyXG4gICAgfVxyXG4gICAgZG9wX2Jsay5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XHJcbiAgICBwYXJhbGxheF9sYXllci5hcHBlbmQoZG9wX2Jsayk7XHJcbiAgICBwYXJhbGF4X2dyLmFwcGVuZChwYXJhbGxheF9sYXllcik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRTdGF0aWNMYXllcihkYXRhLCBmaXgsIGJlZm9yX2J1dHRvbikge1xyXG4gICAgdmFyIGRvcF9ibGsgPSAkKFwiPGRpdiBjbGFzcz0nZml4ZWRfX2xheWVyJy8+XCIpO1xyXG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcclxuICAgIGlmIChkYXRhLmZ1bGxfaGVpZ2h0KSB7XHJcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MoJ2ZpeGVkX19mdWxsLWhlaWdodCcpO1xyXG4gICAgfVxyXG4gICAgZG9wX2JsayA9IGFkZF9hbmltYXRpb24oZG9wX2JsaywgZGF0YSk7XHJcbiAgICBkb3BfYmxrLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XHJcblxyXG4gICAgaWYgKGJlZm9yX2J1dHRvbikge1xyXG4gICAgICBmaXguZmluZCgnLnNsaWRlcl9faHJlZicpLmNsb3Nlc3QoJy5maXhlZF9fbGF5ZXInKS5iZWZvcmUoZG9wX2JsaylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZpeC5hcHBlbmQoZG9wX2JsaylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG5leHRfc2xpZGUoKSB7XHJcbiAgICBpZiAoJCgnI21lZ2Ffc2xpZGVyJykuaGFzQ2xhc3MoJ3N0b3Bfc2xpZGUnKSlyZXR1cm47XHJcblxyXG4gICAgdmFyIHNsaWRlX3BvaW50cyA9ICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZV9zZWxlY3QnKVxyXG4gICAgdmFyIHNsaWRlX2NudCA9IHNsaWRlX3BvaW50cy5sZW5ndGg7XHJcbiAgICB2YXIgYWN0aXZlID0gJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5pbmRleCgpICsgMTtcclxuICAgIGlmIChhY3RpdmUgPj0gc2xpZGVfY250KWFjdGl2ZSA9IDA7XHJcbiAgICBzbGlkZV9wb2ludHMuZXEoYWN0aXZlKS5jbGljaygpO1xyXG5cclxuICAgIHRpbWVvdXRJZD1zZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW1nX3RvX2xvYWQoc3JjKSB7XHJcbiAgICB2YXIgaW1nID0gJCgnPGltZy8+Jyk7XHJcbiAgICBpbWcub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xyXG5cclxuICAgICAgaWYgKHRvdF9pbWdfd2FpdCA9PSAwKSB7XHJcblxyXG4gICAgICAgIHNsaWRlcy5hcHBlbmQoZ2VuZXJhdGVfc2xpZGUoc2xpZGVyX2RhdGFbcmVuZGVyX3NsaWRlX25vbV0pKTtcclxuICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEocmVuZGVyX3NsaWRlX25vbSkucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcblxyXG4gICAgICAgIGlmIChyZW5kZXJfc2xpZGVfbm9tID09IDApIHtcclxuICAgICAgICAgIHNsaWRlcy5maW5kKCcuc2xpZGUnKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2ZpcnN0X3Nob3cnKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgIGlmICghZWRpdG9yKSB7XHJcbiAgICAgICAgICAgIGlmKHRpbWVvdXRJZCljbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICAgICAgdGltZW91dElkPXNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICQodGhpcykuZmluZCgnLmZpcnN0X3Nob3cnKS5yZW1vdmVDbGFzcygnZmlyc3Rfc2hvdycpO1xyXG4gICAgICAgICAgICB9LmJpbmQoc2xpZGVzKSwgc2Nyb2xsX3BlcmlvZCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKG1vYmlsZV9tb2RlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcclxuICAgICAgICAgICAgcGFyYWxsYXhfY291bnRlciA9IDA7XHJcbiAgICAgICAgICAgIHBhcmFsbGF4X3RpbWVyID0gc2V0SW50ZXJ2YWwocmVuZGVyLCAxMDApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChlZGl0b3IpIHtcclxuICAgICAgICAgICAgaW5pdF9lZGl0b3IoKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYodGltZW91dElkKWNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xyXG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xyXG5cclxuICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3gnKS5vbignY2xpY2snLCAnLnNsaWRlX3NlbGVjdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICAgIGlmICgkdGhpcy5oYXNDbGFzcygnc2xpZGVyLWFjdGl2ZScpKXJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgdmFyIGluZGV4ID0gJHRoaXMuaW5kZXgoKTtcclxuICAgICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgJChjb250YWluZXJfaWQgKyAnIC5zbGlkZS5zbGlkZXItYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlJykuZXEoaW5kZXgpLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgIHBhcmFsbGF4X2dyb3VwID0gJChjb250YWluZXJfaWQgKyAnIC5zbGlkZXItYWN0aXZlIC5wYXJhbGxheF9fZ3JvdXA+KicpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmhvdmVyKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICBpZih0aW1lb3V0SWQpY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuYWRkQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XHJcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykucmVtb3ZlQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZW5kZXJfc2xpZGVfbm9tKys7XHJcbiAgICAgICAgaWYgKHJlbmRlcl9zbGlkZV9ub20gPCBzbGlkZXJfZGF0YS5sZW5ndGgpIHtcclxuICAgICAgICAgIGxvYWRfc2xpZGVfaW1nKClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pLm9uKCdlcnJvcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgdG90X2ltZ193YWl0LS07XHJcbiAgICB9KTtcclxuICAgIGltZy5wcm9wKCdzcmMnLCBzcmMpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbG9hZF9zbGlkZV9pbWcoKSB7XHJcbiAgICB2YXIgZGF0YSA9IHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dO1xyXG4gICAgdG90X2ltZ193YWl0ID0gMTtcclxuXHJcbiAgICBpZiAobW9iaWxlX21vZGUgPT09IGZhbHNlKSB7XHJcbiAgICAgIHRvdF9pbWdfd2FpdCsrO1xyXG4gICAgICBpbWdfdG9fbG9hZChkYXRhLmZvbik7XHJcbiAgICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgICAgaWYgKGRhdGEucGFyYWxheCAmJiBkYXRhLnBhcmFsYXgubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRvdF9pbWdfd2FpdCArPSBkYXRhLnBhcmFsYXgubGVuZ3RoO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5wYXJhbGF4Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpbWdfdG9fbG9hZChkYXRhLnBhcmFsYXhbaV0uaW1nKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoZGF0YS5maXhlZCAmJiBkYXRhLmZpeGVkLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0b3RfaW1nX3dhaXQgKz0gZGF0YS5maXhlZC5sZW5ndGg7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmZpeGVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpbWdfdG9fbG9hZChkYXRhLmZpeGVkW2ldLmltZylcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpbWdfdG9fbG9hZChkYXRhLm1vYmlsZSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzdGFydF9pbml0X3NsaWRlKGRhdGEpIHtcclxuICAgIHZhciBuID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICB2YXIgaW1nID0gJCgnPGltZy8+Jyk7XHJcbiAgICBpbWcuYXR0cigndGltZScsIG4pO1xyXG5cclxuICAgIGZ1bmN0aW9uIG9uX2ltZ19sb2FkKCkge1xyXG4gICAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICBpbWcgPSAkKHRoaXMpO1xyXG4gICAgICBuID0gbiAtIHBhcnNlSW50KGltZy5hdHRyKCd0aW1lJykpO1xyXG4gICAgICBpZiAobiA+IG1heF90aW1lX2xvYWRfcGljKSB7XHJcbiAgICAgICAgbW9iaWxlX21vZGUgPSB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBtYXhfc2l6ZSA9IChzY3JlZW4uaGVpZ2h0ID4gc2NyZWVuLndpZHRoID8gc2NyZWVuLmhlaWdodCA6IHNjcmVlbi53aWR0aCk7XHJcbiAgICAgICAgaWYgKG1heF9zaXplIDwgbW9iaWxlX3NpemUpIHtcclxuICAgICAgICAgIG1vYmlsZV9tb2RlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbW9iaWxlX21vZGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG1vYmlsZV9tb2RlID09IHRydWUpIHtcclxuICAgICAgICAkKGNvbnRhaW5lcl9pZCkuYWRkQ2xhc3MoJ21vYmlsZV9tb2RlJylcclxuICAgICAgfVxyXG4gICAgICByZW5kZXJfc2xpZGVfbm9tID0gMDtcclxuICAgICAgbG9hZF9zbGlkZV9pbWcoKTtcclxuICAgICAgJCgnLnNrLWZvbGRpbmctY3ViZScpLnJlbW92ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBpbWcub24oJ2xvYWQnLCBvbl9pbWdfbG9hZCgpKTtcclxuICAgIGlmIChzbGlkZXJfZGF0YS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9IHNsaWRlcl9kYXRhWzBdLm1vYmlsZSArICc/cj0nICsgTWF0aC5yYW5kb20oKTtcclxuICAgICAgaW1nLnByb3AoJ3NyYycsIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvbl9pbWdfbG9hZCgpLmJpbmQoaW1nKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoZGF0YSwgZWRpdG9yX2luaXQpIHtcclxuICAgIHNsaWRlcl9kYXRhID0gZGF0YTtcclxuICAgIGVkaXRvciA9IGVkaXRvcl9pbml0O1xyXG4gICAgLy/QvdCw0YXQvtC00LjQvCDQutC+0L3RgtC10LnQvdC10YAg0Lgg0L7Rh9C40YnQsNC10Lwg0LXQs9C+XHJcbiAgICB2YXIgY29udGFpbmVyID0gJChjb250YWluZXJfaWQpO1xyXG4gICAgY29udGFpbmVyLmh0bWwoJycpO1xyXG5cclxuICAgIC8v0YHQvtC30LbQsNC10Lwg0LHQsNC30L7QstGL0LUg0LrQvtC90YLQtdC50L3QtdGA0Ysg0LTQu9GPINGB0LDQvNC40YUg0YHQu9Cw0LnQtNC+0LIg0Lgg0LTQu9GPINC/0LXRgNC10LrQu9GO0YfQsNGC0LXQu9C10LlcclxuICAgIHNsaWRlcyA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgJ2NsYXNzJzogJ3NsaWRlcydcclxuICAgIH0pO1xyXG4gICAgdmFyIHNsaWRlX2NvbnRyb2wgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICdjbGFzcyc6ICdzbGlkZV9jb250cm9sJ1xyXG4gICAgfSk7XHJcbiAgICBzbGlkZV9zZWxlY3RfYm94ID0gJCgnPHVsLz4nLCB7XHJcbiAgICAgICdjbGFzcyc6ICdzbGlkZV9zZWxlY3RfYm94J1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy/QtNC+0LHQsNCy0LvRj9C10Lwg0LjQvdC00LjQutCw0YLQvtGAINC30LDQs9GA0YPQt9C60LhcclxuICAgIHZhciBsID0gJzxkaXYgY2xhc3M9XCJzay1mb2xkaW5nLWN1YmVcIj4nICtcclxuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMSBzay1jdWJlXCI+PC9kaXY+JyArXHJcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTIgc2stY3ViZVwiPjwvZGl2PicgK1xyXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmU0IHNrLWN1YmVcIj48L2Rpdj4nICtcclxuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMyBzay1jdWJlXCI+PC9kaXY+JyArXHJcbiAgICAgICc8L2Rpdj4nO1xyXG4gICAgY29udGFpbmVyLmh0bWwobCk7XHJcblxyXG5cclxuICAgIHN0YXJ0X2luaXRfc2xpZGUoZGF0YVswXSk7XHJcblxyXG4gICAgLy/Qs9C10L3QtdGA0LjRgNGD0LXQvCDQutC90L7Qv9C60Lgg0Lgg0YHQu9Cw0LnQtNGLXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgLy9zbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKGRhdGFbaV0pKTtcclxuICAgICAgc2xpZGVfc2VsZWN0X2JveC5hcHBlbmQoJzxsaSBjbGFzcz1cInNsaWRlX3NlbGVjdCBkaXNhYmxlZFwiLz4nKVxyXG4gICAgfVxyXG5cclxuICAgIC8qc2xpZGVzLmZpbmQoJy5zbGlkZScpLmVxKDApXHJcbiAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJylcclxuICAgICAuYWRkQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcclxuICAgICBzbGlkZV9jb250cm9sLmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTsqL1xyXG5cclxuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVzKTtcclxuICAgIHNsaWRlX2NvbnRyb2wuYXBwZW5kKHNsaWRlX3NlbGVjdF9ib3gpO1xyXG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZV9jb250cm9sKTtcclxuXHJcblxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgaWYgKCFwYXJhbGxheF9ncm91cClyZXR1cm4gZmFsc2U7XHJcbiAgICB2YXIgcGFyYWxsYXhfayA9IChwYXJhbGxheF9jb3VudGVyIC0gMTApIC8gMjtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFsbGF4X2dyb3VwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBlbCA9IHBhcmFsbGF4X2dyb3VwLmVxKGkpO1xyXG4gICAgICB2YXIgaiA9IGVsLmF0dHIoJ3onKTtcclxuICAgICAgdmFyIHRyID0gJ3JvdGF0ZTNkKDAuMSwwLjgsMCwnICsgKHBhcmFsbGF4X2spICsgJ2RlZykgc2NhbGUoJyArICgxICsgaiAqIDAuNSkgKyAnKSB0cmFuc2xhdGVaKC0nICsgKDEwICsgaiAqIDIwKSArICdweCknO1xyXG4gICAgICBlbC5jc3MoJ3RyYW5zZm9ybScsIHRyKVxyXG4gICAgfVxyXG4gICAgcGFyYWxsYXhfY291bnRlciArPSBwYXJhbGxheF9kICogMC4xO1xyXG4gICAgaWYgKHBhcmFsbGF4X2NvdW50ZXIgPj0gMjApcGFyYWxsYXhfZCA9IC1wYXJhbGxheF9kO1xyXG4gICAgaWYgKHBhcmFsbGF4X2NvdW50ZXIgPD0gMClwYXJhbGxheF9kID0gLXBhcmFsbGF4X2Q7XHJcbiAgfVxyXG5cclxuICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoJCgnLmZpbGVTZWxlY3QnKSk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBpbml0OiBpbml0XHJcbiAgfTtcclxufSgpKTtcclxuIiwidmFyIGhlYWRlckFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG4gIHZhciBzaGFkb3dlZERvd24gPSBmYWxzZTtcclxuXHJcbiAgJCgnLm1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgICQoJy5kcm9wLW1lbnUnKS5yZW1vdmVDbGFzcygnb3BlbicpLnJlbW92ZUNsYXNzKCdjbG9zZScpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKSkge1xyXG4gICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnLnNlYXJjaC10b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xyXG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XHJcbiAgICAkKCcjYXV0b2NvbXBsZXRlJykuZmFkZU91dCgpO1xyXG4gICAgaWYgKCQoJy5oZWFkZXInKS5oYXNDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJykpIHtcclxuICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJyNoZWFkZXInKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKGUudGFyZ2V0LmlkID09ICdoZWFkZXInKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XHJcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQodGhpcykuY2xvc2VzdCgnZm9ybScpLnN1Ym1pdCgpO1xyXG4gIH0pO1xyXG5cclxuICAkKCcuaGVhZGVyLXNlY29uZGxpbmVfY2xvc2UnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmhlYWRlci11cGxpbmUnKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICghc2Nyb2xsZWREb3duKXJldHVybjtcclxuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDEwMjQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgc2Nyb2xsZWREb3duID0gZmFsc2U7XHJcbiAgfSk7XHJcblxyXG4gICQod2luZG93KS5vbignbG9hZCByZXNpemUgc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHNoYWRvd0hlaWdodCA9IDUwO1xyXG4gICAgdmFyIGhpZGVIZWlnaHQgPSAyMDA7XHJcbiAgICB2YXIgaGVhZGVyU2Vjb25kTGluZSA9ICQoJy5oZWFkZXItc2Vjb25kbGluZScpO1xyXG4gICAgdmFyIGhvdmVycyA9IGhlYWRlclNlY29uZExpbmUuZmluZCgnOmhvdmVyJyk7XHJcbiAgICB2YXIgaGVhZGVyID0gJCgnLmhlYWRlcicpO1xyXG5cclxuICAgIGlmICghaG92ZXJzLmxlbmd0aCkge1xyXG4gICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzY3JvbGxhYmxlJyk7XHJcbiAgICAgIGhlYWRlci5yZW1vdmVDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgICAvL2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3BcclxuICAgICAgdmFyIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuICAgICAgaWYgKHNjcm9sbFRvcCA+IHNoYWRvd0hlaWdodCAmJiBzaGFkb3dlZERvd24gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgc2hhZG93ZWREb3duID0gdHJ1ZTtcclxuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzaGFkb3dlZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzY3JvbGxUb3AgPD0gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHNoYWRvd2VkRG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3NoYWRvd2VkJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNjcm9sbFRvcCA+IGhpZGVIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSBmYWxzZSkge1xyXG4gICAgICAgIHNjcm9sbGVkRG93biA9IHRydWU7XHJcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoc2Nyb2xsVG9wIDw9IGhpZGVIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSB0cnVlKSB7XHJcbiAgICAgICAgc2Nyb2xsZWREb3duID0gZmFsc2U7XHJcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgICBoZWFkZXIuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnLm1lbnVfYW5nbGUtZG93biwgLmRyb3AtbWVudV9ncm91cF9fdXAtaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBtZW51T3BlbiA9ICQodGhpcykuY2xvc2VzdCgnLmhlYWRlcl9vcGVuLW1lbnUsIC5jYXRhbG9nLWNhdGVnb3JpZXMnKTtcclxuICAgIGlmICghbWVudU9wZW4ubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIHBhcmVudCA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudV9ncm91cF9fdXAsIC5tZW51LWdyb3VwJyk7XHJcbiAgICB2YXIgcGFyZW50TWVudSA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudScpO1xyXG4gICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICB9XHJcbiAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAkKHBhcmVudCkudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgaWYgKHBhcmVudC5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAgICAgJChwYXJlbnQpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICBpZiAocGFyZW50TWVudSkge1xyXG4gICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICBpZiAocGFyZW50TWVudSkge1xyXG4gICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG5cclxuICB2YXIgYWNjb3VudE1lbnVUaW1lT3V0ID0gbnVsbDtcclxuICB2YXIgYWNjb3VudE1lbnVPcGVuVGltZSA9IDA7XHJcbiAgdmFyIGFjY291bnRNZW51ID0gJCgnLmFjY291bnQtbWVudScpO1xyXG5cclxuICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPiAxMDI0KSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgdmFyIHRoYXQgPSAkKHRoaXMpO1xyXG5cclxuICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcclxuXHJcbiAgICBpZiAoYWNjb3VudE1lbnUuaGFzQ2xhc3MoJ2hpZGRlbicpKSB7XHJcbiAgICAgIG1lbnVBY2NvdW50VXAodGhhdCk7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhhdC5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICBhY2NvdW50TWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8v0L/QvtC60LDQtyDQvNC10L3RjiDQsNC60LrQsNGD0L3RglxyXG4gIGZ1bmN0aW9uIG1lbnVBY2NvdW50VXAodG9nZ2xlQnV0dG9uKSB7XHJcbiAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XHJcbiAgICB0b2dnbGVCdXR0b24uYWRkQ2xhc3MoJ29wZW4nKTtcclxuICAgIGFjY291bnRNZW51LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSAxMDI0KSB7XHJcbiAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgIH1cclxuXHJcbiAgICBhY2NvdW50TWVudU9wZW5UaW1lID0gbmV3IERhdGUoKTtcclxuICAgIGFjY291bnRNZW51VGltZU91dCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSAxMDI0KSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICgobmV3IERhdGUoKSAtIGFjY291bnRNZW51T3BlblRpbWUpID4gMTAwMCAqIDcpIHtcclxuICAgICAgICBhY2NvdW50TWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgdG9nZ2xlQnV0dG9uLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xyXG4gICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sIDEwMDApO1xyXG4gIH1cclxuXHJcbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllcy1hY2NvdW50X21lbnUtaGVhZGVyJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgIGFjY291bnRNZW51T3BlblRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gIH0pO1xyXG4gICQoJy5hY2NvdW50LW1lbnUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCdhY2NvdW50LW1lbnUnKSkge1xyXG4gICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgIH1cclxuICB9KTtcclxufSgpO1xyXG4iLCIkKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBwYXJzZU51bShzdHIpIHtcclxuICAgIHJldHVybiBwYXJzZUZsb2F0KFxyXG4gICAgICBTdHJpbmcoc3RyKVxyXG4gICAgICAgIC5yZXBsYWNlKCcsJywgJy4nKVxyXG4gICAgICAgIC5tYXRjaCgvLT9cXGQrKD86XFwuXFxkKyk/L2csICcnKSB8fCAwXHJcbiAgICAgICwgMTBcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAkKCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpLmZpbmQoJ3NlbGVjdCxpbnB1dCcpLm9uKCdjaGFuZ2Uga2V5dXAgY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLmNsb3Nlc3QoJy5zaG9ydC1jYWxjLWNhc2hiYWNrJyk7XHJcbiAgICB2YXIgY3VycyA9IHBhcnNlTnVtKCR0aGlzLmZpbmQoJ3NlbGVjdCcpLnZhbCgpKTtcclxuICAgIHZhciB2YWwgPSAkdGhpcy5maW5kKCdpbnB1dCcpLnZhbCgpO1xyXG4gICAgaWYgKHBhcnNlTnVtKHZhbCkgIT0gdmFsKSB7XHJcbiAgICAgIHZhbCA9ICR0aGlzLmZpbmQoJ2lucHV0JykudmFsKHBhcnNlTnVtKHZhbCkpO1xyXG4gICAgfVxyXG4gICAgdmFsID0gcGFyc2VOdW0odmFsKTtcclxuXHJcbiAgICB2YXIga29lZiA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjaycpLnRyaW0oKTtcclxuICAgIHZhciBwcm9tbyA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1wcm9tbycpLnRyaW0oKTtcclxuICAgIHZhciBjdXJyZW5jeSA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1jdXJyZW5jeScpLnRyaW0oKTtcclxuICAgIHZhciByZXN1bHQgPSAwO1xyXG4gICAgdmFyIG91dCA9IDA7XHJcblxyXG4gICAgaWYgKGtvZWYgPT0gcHJvbW8pIHtcclxuICAgICAgcHJvbW8gPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChrb2VmLmluZGV4T2YoJyUnKSA+IDApIHtcclxuICAgICAgcmVzdWx0ID0gcGFyc2VOdW0oa29lZikgKiB2YWwgKiBjdXJzIC8gMTAwO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY3VycyA9IHBhcnNlTnVtKCR0aGlzLmZpbmQoJ1tjb2RlPScgKyBjdXJyZW5jeSArICddJykudmFsKCkpO1xyXG4gICAgICByZXN1bHQgPSBwYXJzZU51bShrb2VmKSAqIGN1cnNcclxuICAgIH1cclxuXHJcbiAgICBpZiAocGFyc2VOdW0ocHJvbW8pID4gMCkge1xyXG4gICAgICBpZiAocHJvbW8uaW5kZXhPZignJScpID4gMCkge1xyXG4gICAgICAgIHByb21vID0gcGFyc2VOdW0ocHJvbW8pICogdmFsICogY3VycyAvIDEwMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwcm9tbyA9IHBhcnNlTnVtKHByb21vKSAqIGN1cnNcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHByb21vID4gMCkge1xyXG4gICAgICAgIG91dCA9IFwiPHNwYW4gY2xhc3M9b2xkX3ByaWNlPlwiICsgcmVzdWx0LnRvRml4ZWQoMikgKyBcIjwvc3Bhbj4gXCIgKyBwcm9tby50b0ZpeGVkKDIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG91dCA9IHJlc3VsdC50b0ZpeGVkKDIpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvdXQgPSByZXN1bHQudG9GaXhlZCgyKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgJHRoaXMuZmluZCgnLmNhbGMtcmVzdWx0X3ZhbHVlJykuaHRtbChvdXQpXHJcbiAgfSkuY2xpY2soKVxyXG59KTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgZWxzID0gJCgnLmF1dG9faGlkZV9jb250cm9sJyk7XHJcbiAgaWYgKGVscy5sZW5ndGggPT0gMClyZXR1cm47XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiLnNjcm9sbF9ib3gtc2hvd19tb3JlXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgYnV0dG9uWWVzOiBmYWxzZSxcclxuICAgICAgbm90eWZ5X2NsYXNzOiBcIm5vdGlmeV93aGl0ZSBub3RpZnlfbm90X2JpZ1wiXHJcbiAgICB9O1xyXG5cclxuICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgIHZhciBjb250ZW50ID0gJHRoaXMuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbScpLmNsb25lKCk7XHJcbiAgICBjb250ZW50ID0gY29udGVudFswXTtcclxuICAgIGNvbnRlbnQuY2xhc3NOYW1lICs9ICcgc2Nyb2xsX2JveC1pdGVtLW1vZGFsJztcclxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGRpdi5jbGFzc05hbWUgPSAnY29tbWVudHMnO1xyXG4gICAgZGl2LmFwcGVuZChjb250ZW50KTtcclxuICAgICQoZGl2KS5maW5kKCcuc2Nyb2xsX2JveC1zaG93X21vcmUnKS5yZW1vdmUoKTtcclxuICAgICQoZGl2KS5maW5kKCcubWF4X3RleHRfaGlkZScpXHJcbiAgICAgIC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS14MicpXHJcbiAgICAgIC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZScpO1xyXG4gICAgZGF0YS5xdWVzdGlvbiA9IGRpdi5vdXRlckhUTUw7XHJcblxyXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBoYXNTY3JvbGwoZWwpIHtcclxuICAgIGlmICghZWwpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVsLnNjcm9sbEhlaWdodCA+IGVsLmNsaWVudEhlaWdodDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlYnVpbGQoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgZWwgPSBlbHMuZXEoaSk7XHJcbiAgICAgIHZhciBpc19oaWRlID0gZmFsc2U7XHJcbiAgICAgIGlmIChlbC5oZWlnaHQoKSA8IDEwKSB7XHJcbiAgICAgICAgaXNfaGlkZSA9IHRydWU7XHJcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuc2hvdygwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHRleHQgPSBlbC5maW5kKCcuc2Nyb2xsX2JveC10ZXh0Jyk7XHJcbiAgICAgIHZhciBhbnN3ZXIgPSBlbC5maW5kKCcuc2Nyb2xsX2JveC1hbnN3ZXInKTtcclxuICAgICAgdmFyIHNob3dfbW9yZSA9IGVsLmZpbmQoJy5zY3JvbGxfYm94LXNob3dfbW9yZScpO1xyXG5cclxuICAgICAgdmFyIHNob3dfYnRuID0gZmFsc2U7XHJcbiAgICAgIGlmIChoYXNTY3JvbGwodGV4dFswXSkpIHtcclxuICAgICAgICBzaG93X2J0biA9IHRydWU7XHJcbiAgICAgICAgdGV4dC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGV4dC5hZGRDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhbnN3ZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIC8v0LXRgdGC0Ywg0L7RgtCy0LXRgiDQsNC00LzQuNC90LBcclxuICAgICAgICBpZiAoaGFzU2Nyb2xsKGFuc3dlclswXSkpIHtcclxuICAgICAgICAgIHNob3dfYnRuID0gdHJ1ZTtcclxuICAgICAgICAgIGFuc3dlci5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGFuc3dlci5hZGRDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2hvd19idG4pIHtcclxuICAgICAgICBzaG93X21vcmUuc2hvdygpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNob3dfbW9yZS5oaWRlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpc19oaWRlKSB7XHJcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuaGlkZSgwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJCh3aW5kb3cpLnJlc2l6ZShyZWJ1aWxkKTtcclxuICByZWJ1aWxkKCk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcuc2hvd19hbGwnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGNscyA9ICQodGhpcykuZGF0YSgnY250cmwtY2xhc3MnKTtcclxuICAgICQoJy5oaWRlX2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcclxuICAgICQodGhpcykuaGlkZSgpO1xyXG4gICAgJCgnLicgKyBjbHMpLnNob3coKTtcclxuICB9KTtcclxuXHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcuaGlkZV9hbGwnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGNscyA9ICQodGhpcykuZGF0YSgnY250cmwtY2xhc3MnKTtcclxuICAgICQoJy5zaG93X2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcclxuICAgICQodGhpcykuaGlkZSgpO1xyXG4gICAgJCgnLicgKyBjbHMpLmhpZGUoKTtcclxuICB9KTtcclxufSkoKTtcclxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIGRlY2xPZk51bShudW1iZXIsIHRpdGxlcykge1xyXG4gICAgY2FzZXMgPSBbMiwgMCwgMSwgMSwgMSwgMl07XHJcbiAgICByZXR1cm4gdGl0bGVzWyhudW1iZXIgJSAxMDAgPiA0ICYmIG51bWJlciAlIDEwMCA8IDIwKSA/IDIgOiBjYXNlc1sobnVtYmVyICUgMTAgPCA1KSA/IG51bWJlciAlIDEwIDogNV1dO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmlyc3RaZXJvKHYpIHtcclxuICAgIHYgPSBNYXRoLmZsb29yKHYpO1xyXG4gICAgaWYgKHYgPCAxMClcclxuICAgICAgcmV0dXJuICcwJyArIHY7XHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiB2O1xyXG4gIH1cclxuXHJcbiAgdmFyIGNsb2NrcyA9ICQoJy5jbG9jaycpO1xyXG4gIGlmIChjbG9ja3MubGVuZ3RoID4gMCkge1xyXG4gICAgZnVuY3Rpb24gdXBkYXRlQ2xvY2soKSB7XHJcbiAgICAgIHZhciBjbG9ja3MgPSAkKHRoaXMpO1xyXG4gICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbG9ja3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgYyA9IGNsb2Nrcy5lcShpKTtcclxuICAgICAgICB2YXIgZW5kID0gbmV3IERhdGUoYy5kYXRhKCdlbmQnKS5yZXBsYWNlKC8tL2csIFwiL1wiKSk7XHJcbiAgICAgICAgdmFyIGQgPSAoZW5kLmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCkpIC8gMTAwMDtcclxuXHJcbiAgICAgICAgLy/QtdGB0LvQuCDRgdGA0L7QuiDQv9GA0L7RiNC10LtcclxuICAgICAgICBpZiAoZCA8PSAwKSB7XHJcbiAgICAgICAgICBjLnRleHQobGcoXCJwcm9tb2NvZGVfZXhwaXJlc1wiKSk7XHJcbiAgICAgICAgICBjLmFkZENsYXNzKCdjbG9jay1leHBpcmVkJyk7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0LHQvtC70LXQtSAzMCDQtNC90LXQuVxyXG4gICAgICAgIGlmIChkID4gMzAgKiA2MCAqIDYwICogMjQpIHtcclxuICAgICAgICAgIGMuaHRtbChsZyggXCJwcm9tb2NvZGVfbGVmdF8zMF9kYXlzXCIpKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHMgPSBkICUgNjA7XHJcbiAgICAgICAgZCA9IChkIC0gcykgLyA2MDtcclxuICAgICAgICB2YXIgbSA9IGQgJSA2MDtcclxuICAgICAgICBkID0gKGQgLSBtKSAvIDYwO1xyXG4gICAgICAgIHZhciBoID0gZCAlIDI0O1xyXG4gICAgICAgIGQgPSAoZCAtIGgpIC8gMjQ7XHJcblxyXG4gICAgICAgIHZhciBzdHIgPSBmaXJzdFplcm8oaCkgKyBcIjpcIiArIGZpcnN0WmVybyhtKSArIFwiOlwiICsgZmlyc3RaZXJvKHMpO1xyXG4gICAgICAgIGlmIChkID4gMCkge1xyXG4gICAgICAgICAgc3RyID0gZCArIFwiIFwiICsgZGVjbE9mTnVtKGQsIFtsZyhcImRheV9jYXNlXzBcIiksIGxnKFwiZGF5X2Nhc2VfMVwiKSwgbGcoXCJkYXlfY2FzZV8yXCIpXSkgKyBcIiAgXCIgKyBzdHI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGMuaHRtbChcItCe0YHRgtCw0LvQvtGB0Yw6IDxzcGFuPlwiICsgc3RyICsgXCI8L3NwYW4+XCIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SW50ZXJ2YWwodXBkYXRlQ2xvY2suYmluZChjbG9ja3MpLCAxMDAwKTtcclxuICAgIHVwZGF0ZUNsb2NrLmJpbmQoY2xvY2tzKSgpO1xyXG4gIH1cclxufSk7XHJcbiIsInZhciBjYXRhbG9nVHlwZVN3aXRjaGVyID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBjYXRhbG9nID0gJCgnLmNhdGFsb2dfbGlzdCcpO1xyXG4gIGlmIChjYXRhbG9nLmxlbmd0aCA9PSAwKXJldHVybjtcclxuXHJcbiAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5maW5kKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24nKS5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xyXG4gICAgJCh0aGlzKS5hZGRDbGFzcygnY2hlY2tlZCcpO1xyXG4gICAgaWYgKGNhdGFsb2cpIHtcclxuICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2NhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbGlzdCcpKSB7XHJcbiAgICAgICAgY2F0YWxvZy5yZW1vdmVDbGFzcygnbmFycm93Jyk7XHJcbiAgICAgICAgc2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnLCAnJylcclxuICAgICAgfVxyXG4gICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1uYXJyb3cnKSkge1xyXG4gICAgICAgIGNhdGFsb2cuYWRkQ2xhc3MoJ25hcnJvdycpO1xyXG4gICAgICAgIHNldENvb2tpZSgnY291cG9uc192aWV3JywgJ25hcnJvdycpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGlmIChnZXRDb29raWUoJ2NvdXBvbnNfdmlldycpID09ICduYXJyb3cnICYmICFjYXRhbG9nLmhhc0NsYXNzKCduYXJyb3dfb2ZmJykpIHtcclxuICAgIGNhdGFsb2cuYWRkQ2xhc3MoJ25hcnJvdycpO1xyXG4gICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbmFycm93JykuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICAgICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLWxpc3QnKS5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xyXG4gIH1cclxufSgpO1xyXG4iLCIkKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuc2Qtc2VsZWN0LXNlbGVjdGVkJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKCQod2luZG93KS53aWR0aCgpIDwgNzY4KSB7XHJcbiAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgLy92YXIgcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcclxuICAgICAgICAvL3ZhciBkcm9wQmxvY2sgPSAkKHBhcmVudCkuZmluZCgnLnNkLXNlbGVjdC1kcm9wJyk7XHJcblxyXG4gICAgICAgIC8vIGlmIChkcm9wQmxvY2suaXMoJzpoaWRkZW4nKSkge1xyXG4gICAgICAgIC8vICAgICBkcm9wQmxvY2suc2xpZGVEb3duKCk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgICAgJCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgICAgaWYgKCFwYXJlbnQuaGFzQ2xhc3MoJ2xpbmtlZCcpKSB7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgICAgICAgICQoJy5zZC1zZWxlY3QtZHJvcCcpLmZpbmQoJ2EnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIHZhciBzZWxlY3RSZXN1bHQgPSAkKHRoaXMpLmh0bWwoKTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICQocGFyZW50KS5maW5kKCdpbnB1dCcpLnZhbChzZWxlY3RSZXN1bHQpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgJChwYXJlbnQpLmZpbmQoJy5zZC1zZWxlY3Qtc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcygnYWN0aXZlJykuaHRtbChzZWxlY3RSZXN1bHQpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgZHJvcEJsb2NrLnNsaWRlVXAoKTtcclxuICAgICAgICAvLyAgICAgICAgIH0pO1xyXG4gICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgIC8vICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAvLyAgICAgZHJvcEJsb2NrLnNsaWRlVXAoKTtcclxuICAgICAgICAvLyB9XHJcbiAgICB9XHJcbiAgICAvL3JldHVybiBmYWxzZTtcclxuICB9KTtcclxuXHJcbn0pO1xyXG4iLCJzZWFyY2ggPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIG9wZW5BdXRvY29tcGxldGU7XHJcblxyXG4gICQoJy5zZWFyY2gtZm9ybS1pbnB1dCcpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICB2YXIgcXVlcnkgPSAkdGhpcy52YWwoKTtcclxuICAgIHZhciBkYXRhID0gJHRoaXMuY2xvc2VzdCgnZm9ybScpLnNlcmlhbGl6ZSgpO1xyXG4gICAgdmFyIGF1dG9jb21wbGV0ZSA9ICR0aGlzLmNsb3Nlc3QoJy5zdG9yZXNfc2VhcmNoJykuZmluZCgnLmF1dG9jb21wbGV0ZS13cmFwJyk7Ly8gJCgnI2F1dG9jb21wbGV0ZScpLFxyXG4gICAgdmFyIGF1dG9jb21wbGV0ZUxpc3QgPSAkKGF1dG9jb21wbGV0ZSkuZmluZCgndWwnKTtcclxuICAgIG9wZW5BdXRvY29tcGxldGUgPSBhdXRvY29tcGxldGU7XHJcbiAgICBpZiAocXVlcnkubGVuZ3RoID4gMSkge1xyXG4gICAgICB1cmwgPSAkdGhpcy5jbG9zZXN0KCdmb3JtJykuYXR0cignYWN0aW9uJykgfHwgJy9zZWFyY2gnO1xyXG4gICAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMpIHtcclxuICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuaHRtbCgnJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpZihsYW5nW1wiaHJlZl9wcmVmaXhcIl0ubGVuZ3RoPjAgJiYgaXRlbS5kYXRhLnJvdXRlLmluZGV4T2YobGFuZ1tcImhyZWZfcHJlZml4XCJdKT09LTEpe1xyXG4gICAgICAgICAgICAgICAgICBpdGVtLmRhdGEucm91dGU9Jy8nK2xhbmdbXCJocmVmX3ByZWZpeFwiXStpdGVtLmRhdGEucm91dGU7XHJcbiAgICAgICAgICAgICAgICAgIGl0ZW0uZGF0YS5yb3V0ZT1pdGVtLmRhdGEucm91dGUucmVwbGFjZSgnLy8nLCcvJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9ICc8YSBjbGFzcz1cImF1dG9jb21wbGV0ZV9saW5rXCIgaHJlZj1cIicgKyBpdGVtLmRhdGEucm91dGUgKyAnXCInICsgJz4nICsgaXRlbS52YWx1ZSArIGl0ZW0uY2FzaGJhY2sgKyAnPC9hPic7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgICAgICAgICAgICAgbGkuaW5uZXJIVE1MID0gaHRtbDtcclxuICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuYXBwZW5kKGxpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZSkuZmFkZUluKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xyXG4gICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KS5vbignZm9jdXNvdXQnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKCEkKGUucmVsYXRlZFRhcmdldCkuaGFzQ2xhc3MoJ2F1dG9jb21wbGV0ZV9saW5rJykpIHtcclxuICAgICAgLy8kKCcjYXV0b2NvbXBsZXRlJykuaGlkZSgpO1xyXG4gICAgICAkKG9wZW5BdXRvY29tcGxldGUpLmRlbGF5KDEwMCkuc2xpZGVVcCgxMDApXHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJ2JvZHknKS5vbignc3VibWl0JywgJy5zdG9yZXMtc2VhcmNoX2Zvcm0nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyIHZhbCA9ICQodGhpcykuZmluZCgnLnNlYXJjaC1mb3JtLWlucHV0JykudmFsKCk7XHJcbiAgICBpZiAodmFsLmxlbmd0aCA8IDIpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcuZm9ybS1wb3B1cC1zZWxlY3QgbGknKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG5cclxuICAgIHZhciBoaWRkZW4gPSAkKHRoaXMpLmRhdGEoJ2lkMicpO1xyXG4gICAgJCgnIycraGlkZGVuKS5hdHRyKCd2YWx1ZScsICQodGhpcykuZGF0YSgndmFsdWUyJykpO1xyXG4gICAgdmFyIHRleHQgPSAkKHRoaXMpLmRhdGEoJ2lkMScpO1xyXG4gICAgJCgnIycrdGV4dCkuaHRtbCgkKHRoaXMpLmRhdGEoJ3ZhbHVlMScpKTtcclxuICAgIHZhciBzZWFyY2h0ZXh0ID0gJCh0aGlzKS5kYXRhKCdpZDMnKTtcclxuICAgICQoJyMnK3NlYXJjaHRleHQpLmF0dHIoJ3BsYWNlaG9sZGVyJywgJCh0aGlzKS5kYXRhKCd2YWx1ZTMnKSk7XHJcbiAgICB2YXIgbGltaXQgPSAkKHRoaXMpLmRhdGEoJ2lkNCcpO1xyXG4gICAgJCgnIycrbGltaXQpLmF0dHIoJ3ZhbHVlJywgJCh0aGlzKS5kYXRhKCd2YWx1ZTQnKSk7XHJcblxyXG4gICAgdmFyIGFjdGlvbiA9ICQodGhpcykuZGF0YSgnYWN0aW9uJyk7XHJcblxyXG4gICAgJCh0aGlzKS5jbG9zZXN0KCdmb3JtJykuYXR0cignYWN0aW9uJywgYWN0aW9uKTtcclxuXHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5oZWFkZXItc2VhcmNoX2Zvcm0tZ3JvdXAnKS5maW5kKCcuaGVhZGVyLXNlYXJjaF9mb3JtLWlucHV0LW1vZHVsZS1sYWJlbCcpLmFkZENsYXNzKCdjbG9zZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dC1tb2R1bGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuaGVhZGVyLXNlYXJjaF9mb3JtLWlucHV0LW1vZHVsZS1sYWJlbCcpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dC1tb2R1bGUtbGFiZWwnKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gIH0pO1xyXG5cclxufSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAkKCcuY291cG9ucy1saXN0X2l0ZW0tY29udGVudC1nb3RvLXByb21vY29kZS1saW5rJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcclxuICAgIHZhciBleHBpcmVkID0gdGhhdC5jbG9zZXN0KCcuY291cG9ucy1saXN0X2l0ZW0nKS5maW5kKCcuY2xvY2stZXhwaXJlZCcpO1xyXG4gICAgdmFyIHVzZXJJZCA9ICQodGhhdCkuZGF0YSgndXNlcicpO1xyXG4gICAgdmFyIGluYWN0aXZlID0gJCh0aGF0KS5kYXRhKCdpbmFjdGl2ZScpO1xyXG4gICAgdmFyIGRhdGFfbWVzc2FnZSA9ICQodGhhdCkuZGF0YSgnbWVzc2FnZScpO1xyXG5cclxuICAgIGlmIChpbmFjdGl2ZSkge1xyXG4gICAgICB2YXIgdGl0bGUgPSBkYXRhX21lc3NhZ2UgPyBkYXRhX21lc3NhZ2UgOiBsZyhcInByb21vY29kZV9pc19pbmFjdGl2ZVwiKTtcclxuICAgICAgdmFyIG1lc3NhZ2UgPSBsZyhcInByb21vY29kZV92aWV3X2FsbFwiLHtcInVybFwiOlwiL1wiK2xhbmdbXCJocmVmX3ByZWZpeFwiXStcImNvdXBvbnNcIn0pO1xyXG4gICAgICBub3RpZmljYXRpb24uYWxlcnQoe1xyXG4gICAgICAgICd0aXRsZSc6IHRpdGxlLFxyXG4gICAgICAgICdxdWVzdGlvbic6IG1lc3NhZ2UsXHJcbiAgICAgICAgJ2J1dHRvblllcyc6ICdPaycsXHJcbiAgICAgICAgJ2J1dHRvbk5vJzogZmFsc2UsXHJcbiAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmIChleHBpcmVkLmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIHRpdGxlID0gbGcoXCJwcm9tb2NvZGVfaXNfZXhwaXJlc1wiKTtcclxuICAgICAgdmFyIG1lc3NhZ2UgPSBsZyhcInByb21vY29kZV92aWV3X2FsbFwiLHtcInVybFwiOlwiL1wiK2xhbmdbXCJocmVmX3ByZWZpeFwiXStcImNvdXBvbnNcIn0pO1xyXG4gICAgICBub3RpZmljYXRpb24uYWxlcnQoe1xyXG4gICAgICAgICd0aXRsZSc6IHRpdGxlLFxyXG4gICAgICAgICdxdWVzdGlvbic6IG1lc3NhZ2UsXHJcbiAgICAgICAgJ2J1dHRvblllcyc6ICdPaycsXHJcbiAgICAgICAgJ2J1dHRvbk5vJzogZmFsc2UsXHJcbiAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmICghdXNlcklkKSB7XHJcbiAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICdidXR0b25ZZXMnOiBmYWxzZSxcclxuICAgICAgICAnbm90eWZ5X2NsYXNzJzogXCJub3RpZnlfYm94LWFsZXJ0XCIsXHJcbiAgICAgICAgJ3RpdGxlJzogbGcoXCJ1c2VfcHJvbW9jb2RlXCIpLFxyXG4gICAgICAgICdxdWVzdGlvbic6ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveC1jb3Vwb24tbm9yZWdpc3RlclwiPicgK1xyXG4gICAgICAgICc8aW1nIHNyYz1cIi9pbWFnZXMvdGVtcGxhdGVzL3N3YS5wbmdcIiBhbHQ9XCJcIj4nICtcclxuICAgICAgICAnPHA+PGI+JytsZyhcInByb21vY29kZV91c2Vfd2l0aG91dF9jYXNoYmFja19vcl9yZWdpc3RlclwiKSsnPC9iPjwvcD4nICtcclxuICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWJ1dHRvbnNcIj4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIicgKyB0aGF0LmF0dHIoJ2hyZWYnKSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImJ0biBub3RpZmljYXRpb24tY2xvc2VcIj4nK2xnKFwidXNlX3Byb21vY29kZVwiKSsnPC9hPicgK1xyXG4gICAgICAgICc8YSBocmVmPVwiIycrbGFuZ1tcImhyZWZfcHJlZml4XCJdKydyZWdpc3RyYXRpb25cIiBjbGFzcz1cImJ0biBidG4tdHJhbnNmb3JtIG1vZGFsc19vcGVuXCI+JytsZyhcInJlZ2lzdGVyXCIpKyc8L2E+JyArXHJcbiAgICAgICAgJzwvZGl2PidcclxuICAgICAgfTtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJyNzaG9wX2hlYWRlci1nb3RvLWNoZWNrYm94JykuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICBpZiAoISQodGhpcykuaXMoJzpjaGVja2VkJykpIHtcclxuICAgICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcclxuICAgICAgICAgICAgICd0aXRsZSc6IGxnKFwiYXR0ZW50aW9uc1wiKSxcclxuICAgICAgICAgICAgICdxdWVzdGlvbic6IGxnKFwicHJvbW9jb2RlX3JlY29tbWVuZGF0aW9uc1wiKSxcclxuICAgICAgICAgICAgICdidXR0b25ZZXMnOiBsZyhcImNsb3NlXCIpLFxyXG4gICAgICAgICAgICAgJ2J1dHRvbk5vJzogZmFsc2UsXHJcbiAgICAgICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXHJcbiAgICAgICAgIH0pO1xyXG4gICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnLmNhdGFsb2dfcHJvZHVjdF9saW5rJykuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICAgdmFyIHRoYXQgPSAkKHRoaXMpO1xyXG4gICAgICBub3RpZmljYXRpb24uYWxlcnQoe1xyXG4gICAgICAgICdidXR0b25ZZXMnOiBmYWxzZSxcclxuICAgICAgICAgICAgJ25vdHlmeV9jbGFzcyc6IFwibm90aWZ5X2JveC1hbGVydFwiLFxyXG4gICAgICAgICAgICAndGl0bGUnOiBsZyhcInByb2R1Y3RfdXNlXCIpLFxyXG4gICAgICAgICAgICAncXVlc3Rpb24nOiAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtY291cG9uLW5vcmVnaXN0ZXJcIj4nICtcclxuICAgICAgICAnPGltZyBzcmM9XCIvaW1hZ2VzL3RlbXBsYXRlcy9zd2EucG5nXCIgYWx0PVwiXCI+JyArXHJcbiAgICAgICAgJzxwPjxiPicrbGcoXCJwcm9kdWN0X3VzZV93aXRob3V0X2Nhc2hiYWNrX29yX3JlZ2lzdGVyXCIpKyc8L2I+PC9wPicgK1xyXG4gICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtYnV0dG9uc1wiPicgK1xyXG4gICAgICAgICc8YSBocmVmPVwiJyArIHRoYXQuYXR0cignaHJlZicpICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiIGNsYXNzPVwiYnRuIG5vdGlmaWNhdGlvbi1jbG9zZVwiPicrbGcoXCJwcm9kdWN0X3VzZVwiKSsnPC9hPicgK1xyXG4gICAgICAgICc8YSBocmVmPVwiI3JlZ2lzdHJhdGlvblwiIGNsYXNzPVwiYnRuIGJ0bi10cmFuc2Zvcm0gbW9kYWxzX29wZW5cIj4nK2xnKFwicmVnaXN0ZXJcIikrJzwvYT4nICtcclxuICAgICAgICAnPC9kaXY+J31cclxuICAgICAgICApO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5hY2NvdW50LXdpdGhkcmF3LW1ldGhvZHNfaXRlbS1vcHRpb24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIG9wdGlvbiA9ICQodGhpcykuZGF0YSgnb3B0aW9uLXByb2Nlc3MnKSxcclxuICAgICAgcGxhY2Vob2xkZXIgPSAnJztcclxuICAgIHN3aXRjaCAob3B0aW9uKSB7XHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfY2FzaF9udW1iZXJcIik7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X3JfbnVtYmVyXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAzOlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19waG9uZV9udW1iZXJcIik7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDQ6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X2NhcnRfbnVtYmVyXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSA1OlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19lbWFpbFwiKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgNjpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfcGhvbmVfbnVtYmVyXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSA3OlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19za3JpbGxcIik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICQodGhpcykucGFyZW50KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgJChcIiN1c2Vyc3dpdGhkcmF3LWJpbGxcIikucHJldihcIi5wbGFjZWhvbGRlclwiKS5odG1sKHBsYWNlaG9sZGVyKTtcclxuICAgICQoJyN1c2Vyc3dpdGhkcmF3LXByb2Nlc3NfaWQnKS52YWwob3B0aW9uKTtcclxuICB9KTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICBhamF4Rm9ybSgkKCcuYWpheF9mb3JtJykpO1xyXG5cclxuICAkKCcuZm9ybS10ZXN0LWxpbmsnKS5vbignc3VibWl0JyxmdW5jdGlvbihlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBmb3JtID0gJCgnLmZvcm0tdGVzdC1saW5rJyk7XHJcbiAgICBpZihmb3JtLmhhc0NsYXNzKCdsb2FkaW5nJykpcmV0dXJuO1xyXG4gICAgZm9ybS5maW5kKCcuaGVscC1ibG9jaycpLmh0bWwoXCJcIik7XHJcblxyXG4gICAgdmFyIHVybCA9IGZvcm0uZmluZCgnW25hbWU9dXJsXScpLnZhbCgpO1xyXG4gICAgZm9ybS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XHJcblxyXG4gICAgaWYodXJsLmxlbmd0aDwzKXtcclxuICAgICAgZm9ybS5maW5kKCcuaGVscC1ibG9jaycpLmh0bWwobGcoJ3JlcXVpcmVkJykpO1xyXG4gICAgICBmb3JtLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfWVsc2V7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZvcm0uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIGZvcm0uZmluZCgnaW5wdXQnKS5hdHRyKCdkaXNhYmxlZCcsdHJ1ZSk7XHJcbiAgICAkLnBvc3QoZm9ybS5hdHRyKCdhY3Rpb24nKSx7dXJsOnVybH0sZnVuY3Rpb24oZCl7XHJcbiAgICAgIGZvcm0uZmluZCgnaW5wdXQnKS5hdHRyKCdkaXNhYmxlZCcsZmFsc2UpO1xyXG4gICAgICBmb3JtLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgIGZvcm0uZmluZCgnLmhlbHAtYmxvY2snKS5odG1sKGQpO1xyXG4gICAgfSk7XHJcbiAgfSlcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuZG9icm8tZnVuZHNfaXRlbS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgJCgnI2RvYnJvLXNlbmQtZm9ybS1jaGFyaXR5LXByb2Nlc3MnKS52YWwoJCh0aGlzKS5kYXRhKCdpZCcpKTtcclxuICB9KTtcclxuXHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ2JvZHknKS5hZGRDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0JykuYWRkQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdC1vcGVuJyk7XHJcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykuYWRkQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZS1vcGVuJyk7XHJcbiAgfSk7XHJcbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdC1jbG9zZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0JykucmVtb3ZlQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdC1vcGVuJyk7XHJcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZS1vcGVuJyk7XHJcbiAgfSk7XHJcbn0pKCk7XHJcbiIsIi8vd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcclxuZnVuY3Rpb24gc2hhcmU0Migpe1xyXG4gIGU9ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2hhcmU0MmluaXQnKTtcclxuICBmb3IgKHZhciBrID0gMDsgayA8IGUubGVuZ3RoOyBrKyspIHtcclxuICAgIHZhciB1ID0gXCJcIjtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zb2NpYWxzJykgIT0gLTEpXHJcbiAgICAgIHZhciBzb2NpYWxzID0gSlNPTi5wYXJzZSgnWycrZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29jaWFscycpKyddJyk7XHJcbiAgICB2YXIgaWNvbl90eXBlPWVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tdHlwZScpICE9IC0xP2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tdHlwZScpOicnO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXVybCcpICE9IC0xKVxyXG4gICAgICB1ID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXJsJyk7XHJcbiAgICB2YXIgcHJvbW8gPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9tbycpO1xyXG4gICAgaWYocHJvbW8gJiYgcHJvbW8ubGVuZ3RoPjApIHtcclxuICAgICAgdmFyIGtleSA9ICdwcm9tbz0nLFxyXG4gICAgICAgIHByb21vU3RhcnQgPSB1LmluZGV4T2Yoa2V5KSxcclxuICAgICAgICBwcm9tb0VuZCA9IHUuaW5kZXhPZignJicsIHByb21vU3RhcnQpLFxyXG4gICAgICAgIHByb21vTGVuZ3RoID0gcHJvbW9FbmQgPiBwcm9tb1N0YXJ0ID8gcHJvbW9FbmQgLSBwcm9tb1N0YXJ0IC0ga2V5Lmxlbmd0aCA6IHUubGVuZ3RoIC0gcHJvbW9TdGFydCAtIGtleS5sZW5ndGg7XHJcbiAgICAgIGlmKHByb21vU3RhcnQgPiAwKSB7XHJcbiAgICAgICAgcHJvbW8gPSB1LnN1YnN0cihwcm9tb1N0YXJ0ICsga2V5Lmxlbmd0aCwgcHJvbW9MZW5ndGgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgcHJvbW91cmwgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9tb3VybCcpO1xyXG4gICAgdmFyIHNlbGZfcHJvbW8gPSAocHJvbW8gJiYgcHJvbW8ubGVuZ3RoID4gMCk/IFwic2V0VGltZW91dChmdW5jdGlvbigpe3NlbmRfcHJvbW8oJ1wiK3Byb21vK1wiJyxcIitwcm9tb3VybCtcIik7fSwyMDAwKTtcIiA6IFwiXCI7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi1zaXplJykgIT0gLTEpXHJcbiAgICAgIHZhciBpY29uX3NpemUgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXNpemUnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpICE9IC0xKVxyXG4gICAgICB2YXIgdCA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJyk7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1hZ2UnKSAhPSAtMSlcclxuICAgICAgdmFyIGkgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pbWFnZScpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWRlc2NyaXB0aW9uJykgIT0gLTEpXHJcbiAgICAgIHZhciBkID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzY3JpcHRpb24nKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wYXRoJykgIT0gLTEpXHJcbiAgICAgIHZhciBmID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF0aCcpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb25zLWZpbGUnKSAhPSAtMSlcclxuICAgICAgdmFyIGZuID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbnMtZmlsZScpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNjcmlwdC1hZnRlcicpKSB7XHJcbiAgICAgIHNlbGZfcHJvbW8gKz0gXCJzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XCIrZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2NyaXB0LWFmdGVyJykrXCJ9LDMwMDApO1wiO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZikge1xyXG4gICAgICBmdW5jdGlvbiBwYXRoKG5hbWUpIHtcclxuICAgICAgICB2YXIgc2MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylcclxuICAgICAgICAgICwgc3IgPSBuZXcgUmVnRXhwKCdeKC4qL3wpKCcgKyBuYW1lICsgJykoWyM/XXwkKScpO1xyXG4gICAgICAgIGZvciAodmFyIHAgPSAwLCBzY0wgPSBzYy5sZW5ndGg7IHAgPCBzY0w7IHArKykge1xyXG4gICAgICAgICAgdmFyIG0gPSBTdHJpbmcoc2NbcF0uc3JjKS5tYXRjaChzcik7XHJcbiAgICAgICAgICBpZiAobSkge1xyXG4gICAgICAgICAgICBpZiAobVsxXS5tYXRjaCgvXigoaHR0cHM/fGZpbGUpXFw6XFwvezIsfXxcXHc6W1xcL1xcXFxdKS8pKVxyXG4gICAgICAgICAgICAgIHJldHVybiBtWzFdO1xyXG4gICAgICAgICAgICBpZiAobVsxXS5pbmRleE9mKFwiL1wiKSA9PSAwKVxyXG4gICAgICAgICAgICAgIHJldHVybiBtWzFdO1xyXG4gICAgICAgICAgICBiID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2Jhc2UnKTtcclxuICAgICAgICAgICAgaWYgKGJbMF0gJiYgYlswXS5ocmVmKVxyXG4gICAgICAgICAgICAgIHJldHVybiBiWzBdLmhyZWYgKyBtWzFdO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC8oLipbXFwvXFxcXF0pLylbMF0gKyBtWzFdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBmID0gcGF0aCgnc2hhcmU0Mi5qcycpO1xyXG4gICAgfVxyXG4gICAgaWYgKCF1KVxyXG4gICAgICB1ID0gbG9jYXRpb24uaHJlZjtcclxuICAgIGlmICghdClcclxuICAgICAgdCA9IGRvY3VtZW50LnRpdGxlO1xyXG4gICAgaWYgKCFmbilcclxuICAgICAgZm4gPSAnaWNvbnMucG5nJztcclxuICAgIGZ1bmN0aW9uIGRlc2MoKSB7XHJcbiAgICAgIHZhciBtZXRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ldGEnKTtcclxuICAgICAgZm9yICh2YXIgbSA9IDA7IG0gPCBtZXRhLmxlbmd0aDsgbSsrKSB7XHJcbiAgICAgICAgaWYgKG1ldGFbbV0ubmFtZS50b0xvd2VyQ2FzZSgpID09ICdkZXNjcmlwdGlvbicpIHtcclxuICAgICAgICAgIHJldHVybiBtZXRhW21dLmNvbnRlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuICAgIGlmICghZClcclxuICAgICAgZCA9IGRlc2MoKTtcclxuICAgIHUgPSBlbmNvZGVVUklDb21wb25lbnQodSk7XHJcbiAgICB0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHQpO1xyXG4gICAgdCA9IHQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcclxuICAgIGkgPSBlbmNvZGVVUklDb21wb25lbnQoaSk7XHJcbiAgICB2YXIgZF9vcmlnPWQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcclxuICAgIGQgPSBlbmNvZGVVUklDb21wb25lbnQoZCk7XHJcbiAgICBkID0gZC5yZXBsYWNlKC9cXCcvZywgJyUyNycpO1xyXG4gICAgdmFyIGZiUXVlcnkgPSAndT0nICsgdTtcclxuICAgIGlmIChpICE9ICdudWxsJyAmJiBpICE9ICcnKVxyXG4gICAgICBmYlF1ZXJ5ID0gJ3M9MTAwJnBbdXJsXT0nICsgdSArICcmcFt0aXRsZV09JyArIHQgKyAnJnBbc3VtbWFyeV09JyArIGQgKyAnJnBbaW1hZ2VzXVswXT0nICsgaTtcclxuICAgIHZhciB2a0ltYWdlID0gJyc7XHJcbiAgICBpZiAoaSAhPSAnbnVsbCcgJiYgaSAhPSAnJylcclxuICAgICAgdmtJbWFnZSA9ICcmaW1hZ2U9JyArIGk7XHJcbiAgICB2YXIgcyA9IG5ldyBBcnJheShcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJmYlwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PScgKyB1ICsnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBGYWNlYm9va1wiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJ2a1wiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vdmsuY29tL3NoYXJlLnBocD91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgdmtJbWFnZSArICcmZGVzY3JpcHRpb249JyArIGQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQkiDQmtC+0L3RgtCw0LrRgtC1XCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cIm9ka2xcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL2Nvbm5lY3Qub2sucnUvb2ZmZXI/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICcmZGVzY3JpcHRpb249JysgZCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIg0J7QtNC90L7QutC70LDRgdGB0L3QuNC60LhcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidHdpXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD0nICsgdCArICcmdXJsPScgKyB1ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiBUd2l0dGVyXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cImdwbHVzXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9wbHVzLmdvb2dsZS5jb20vc2hhcmU/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIEdvb2dsZStcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwibWFpbFwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vY29ubmVjdC5tYWlsLnJ1L3NoYXJlP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnJmRlc2NyaXB0aW9uPScgKyBkICsgJyZpbWFnZXVybD0nICsgaSArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyINCc0L7QtdC8INCc0LjRgNC1QE1haWwuUnVcIicsXHJcbiAgICAgICdcIi8vd3d3LmxpdmVqb3VybmFsLmNvbS91cGRhdGUuYm1sP2V2ZW50PScgKyB1ICsgJyZzdWJqZWN0PScgKyB0ICsgJ1wiIHRpdGxlPVwi0J7Qv9GD0LHQu9C40LrQvtCy0LDRgtGMINCyIExpdmVKb3VybmFsXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInBpblwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vcGludGVyZXN0LmNvbS9waW4vY3JlYXRlL2J1dHRvbi8/dXJsPScgKyB1ICsgJyZtZWRpYT0nICsgaSArICcmZGVzY3JpcHRpb249JyArIHQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTYwMCwgaGVpZ2h0PTMwMCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQlNC+0LHQsNCy0LjRgtGMINCyIFBpbnRlcmVzdFwiJyxcclxuICAgICAgJ1wiXCIgb25jbGljaz1cInJldHVybiBmYXYodGhpcyk7XCIgdGl0bGU9XCLQodC+0YXRgNCw0L3QuNGC0Ywg0LIg0LjQt9Cx0YDQsNC90L3QvtC1INCx0YDQsNGD0LfQtdGA0LBcIicsXHJcbiAgICAgICdcIiNcIiBvbmNsaWNrPVwicHJpbnQoKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCg0LDRgdC/0LXRh9Cw0YLQsNGC0YxcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidGVsZWdyYW1cIiBvbmNsaWNrPVwid2luZG93Lm9wZW4oXFwnLy90ZWxlZ3JhbS5tZS9zaGFyZS91cmw/dXJsPScgKyB1ICsnJnRleHQ9JyArIHQgKyAnXFwnLCBcXCd0ZWxlZ3JhbVxcJywgXFwnd2lkdGg9NTUwLGhlaWdodD00NDAsbGVmdD0xMDAsdG9wPTEwMFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBUZWxlZ3JhbVwiJyxcclxuICAgICAgJ1widmliZXI6Ly9mb3J3YXJkP3RleHQ9JysgdSArJyAtICcgKyB0ICsgJ1wiIGRhdGEtY291bnQ9XCJ2aWJlclwiIHJlbD1cIm5vZm9sbG93IG5vb3BlbmVyXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBWaWJlclwiJyxcclxuICAgICAgJ1wid2hhdHNhcHA6Ly9zZW5kP3RleHQ9JysgdSArJyAtICcgKyB0ICsgJ1wiIGRhdGEtY291bnQ9XCJ3aGF0c2FwcFwiIHJlbD1cIm5vZm9sbG93IG5vb3BlbmVyXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBXaGF0c0FwcFwiJ1xyXG5cclxuICAgICk7XHJcblxyXG4gICAgdmFyIGwgPSAnJztcclxuXHJcbiAgICBpZihzb2NpYWxzLmxlbmd0aD4xKXtcclxuICAgICAgZm9yIChxID0gMDsgcSA8IHNvY2lhbHMubGVuZ3RoOyBxKyspe1xyXG4gICAgICAgIGo9c29jaWFsc1txXTtcclxuICAgICAgICBsICs9ICc8YSByZWw9XCJub2ZvbGxvd1wiIGhyZWY9JyArIHNbal0gKyAnIHRhcmdldD1cIl9ibGFua1wiICcrZ2V0SWNvbihzW2pdLGosaWNvbl90eXBlLGYsZm4saWNvbl9zaXplKSsnPjwvYT4nO1xyXG4gICAgICB9XHJcbiAgICB9ZWxzZXtcclxuICAgICAgZm9yIChqID0gMDsgaiA8IHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBsICs9ICc8YSByZWw9XCJub2ZvbGxvd1wiIGhyZWY9JyArIHNbal0gKyAnIHRhcmdldD1cIl9ibGFua1wiICcrZ2V0SWNvbihzW2pdLGosaWNvbl90eXBlLGYsZm4saWNvbl9zaXplKSsnPjwvYT4nO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlW2tdLmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cInNoYXJlNDJfd3JhcFwiPicgKyBsICsgJzwvc3Bhbj4nO1xyXG4gIH1cclxuICBcclxuLy99LCBmYWxzZSk7XHJcbn1cclxuXHJcbnNoYXJlNDIoKTtcclxuXHJcbmZ1bmN0aW9uIGdldEljb24ocyxqLHQsZixmbixzaXplKSB7XHJcbiAgaWYoIXNpemUpe1xyXG4gICAgc2l6ZT0zMjtcclxuICB9XHJcbiAgaWYodD09J2Nzcycpe1xyXG4gICAgaj1zLmluZGV4T2YoJ2RhdGEtY291bnQ9XCInKSsxMjtcclxuICAgIHZhciBsPXMuaW5kZXhPZignXCInLGopLWo7XHJcbiAgICB2YXIgbDI9cy5pbmRleE9mKCcuJyxqKS1qO1xyXG4gICAgbD1sPmwyICYmIGwyPjAgP2wyOmw7XHJcbiAgICAvL3ZhciBpY29uPSdjbGFzcz1cInNvYy1pY29uIGljb24tJytzLnN1YnN0cihqLGwpKydcIic7XHJcbiAgICB2YXIgaWNvbj0nY2xhc3M9XCJzb2MtaWNvbi1zZCBpY29uLXNkLScrcy5zdWJzdHIoaixsKSsnXCInO1xyXG4gIH1lbHNlIGlmKHQ9PSdzdmcnKXtcclxuICAgIHZhciBzdmc9W1xyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMTEuOTQsMTc3LjA4KVwiIGQ9XCJNMCAwIDAgNzAuMyAyMy42IDcwLjMgMjcuMSA5Ny43IDAgOTcuNyAwIDExNS4yQzAgMTIzLjIgMi4yIDEyOC42IDEzLjYgMTI4LjZMMjguMSAxMjguNiAyOC4xIDE1My4xQzI1LjYgMTUzLjQgMTcgMTU0LjIgNi45IDE1NC4yLTE0IDE1NC4yLTI4LjMgMTQxLjQtMjguMyAxMTcuOUwtMjguMyA5Ny43LTUyIDk3LjctNTIgNzAuMy0yOC4zIDcwLjMtMjguMyAwIDAgMFpcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsOTguMjc0LDE0NS41MilcIiBkPVwiTTAgMCA5LjYgMEM5LjYgMCAxMi41IDAuMyAxNCAxLjkgMTUuNCAzLjQgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMSAxOSAyMS4xIDIxIDI3IDIyLjggMzQuNiA4LjUgNDIuNyAzIDQ4LjctMS4yIDUzLjMtMC4zIDUzLjMtMC4zTDc0LjggMEM3NC44IDAgODYuMSAwLjcgODAuNyA5LjUgODAuMyAxMC4zIDc3LjYgMTYuMSA2NC44IDI4IDUxLjMgNDAuNSA1My4xIDM4LjUgNjkuMyA2MC4xIDc5LjIgNzMuMyA4My4yIDgxLjQgODEuOSA4NC44IDgwLjggODguMSA3My41IDg3LjIgNzMuNSA4Ny4yTDQ5LjMgODcuMUM0OS4zIDg3LjEgNDcuNSA4Ny4zIDQ2LjIgODYuNSA0NC45IDg1LjcgNDQgODMuOSA0NCA4My45IDQ0IDgzLjkgNDAuMiA3My43IDM1LjEgNjUuMSAyNC4zIDQ2LjggMjAgNDUuOCAxOC4zIDQ2LjkgMTQuMiA0OS42IDE1LjIgNTcuNiAxNS4yIDYzLjIgMTUuMiA4MSAxNy45IDg4LjQgOS45IDkwLjMgNy4zIDkwLjkgNS40IDkxLjMtMS40IDkxLjQtMTAgOTEuNS0xNy4zIDkxLjQtMjEuNCA4OS4zLTI0LjIgODgtMjYuMyA4NS0yNSA4NC44LTIzLjQgODQuNi0xOS44IDgzLjgtMTcuOSA4MS4yLTE1LjQgNzcuOS0xNS41IDcwLjMtMTUuNSA3MC4zLTE1LjUgNzAuMy0xNC4xIDQ5LjQtMTguOCA0Ni44LTIyLjEgNDUtMjYuNSA0OC43LTM2LjEgNjUuMy00MS4xIDczLjgtNDQuOCA4My4yLTQ0LjggODMuMi00NC44IDgzLjItNDUuNSA4NC45LTQ2LjggODUuOS00OC4zIDg3LTUwLjUgODcuNC01MC41IDg3LjRMLTczLjUgODcuMkMtNzMuNSA4Ny4yLTc2LjkgODcuMS03OC4yIDg1LjYtNzkuMyA4NC4zLTc4LjMgODEuNS03OC4zIDgxLjUtNzguMyA4MS41LTYwLjMgMzkuNC0zOS45IDE4LjItMjEuMi0xLjMgMCAwIDAgMFwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48ZyB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoMTA2Ljg4LDE4My42MSlcIj48ZyB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoLTYuODgwNSwtMTAwKVwiIHN0eWxlPVwic3Ryb2tlOm5vbmU7c3Ryb2tlLW9wYWNpdHk6MVwiPjxwYXRoIGQ9XCJNIDAsMCBDIDguMTQ2LDAgMTQuNzY5LC02LjYyNSAxNC43NjksLTE0Ljc3IDE0Ljc2OSwtMjIuOTA3IDguMTQ2LC0yOS41MzMgMCwtMjkuNTMzIC04LjEzNiwtMjkuNTMzIC0xNC43NjksLTIyLjkwNyAtMTQuNzY5LC0xNC43NyAtMTQuNzY5LC02LjYyNSAtOC4xMzYsMCAwLDAgTSAwLC01MC40MjkgQyAxOS42NzYsLTUwLjQyOSAzNS42NywtMzQuNDM1IDM1LjY3LC0xNC43NyAzNS42Nyw0LjkwMyAxOS42NzYsMjAuOTAzIDAsMjAuOTAzIC0xOS42NzEsMjAuOTAzIC0zNS42NjksNC45MDMgLTM1LjY2OSwtMTQuNzcgLTM1LjY2OSwtMzQuNDM1IC0xOS42NzEsLTUwLjQyOSAwLC01MC40MjlcIiBzdHlsZT1cImZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIi8+PC9nPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw3LjU1MTYsLTU0LjU3NylcIiBzdHlsZT1cInN0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIj48cGF0aCBkPVwiTSAwLDAgQyA3LjI2MiwxLjY1NSAxNC4yNjQsNC41MjYgMjAuNzE0LDguNTc4IDI1LjU5NSwxMS42NTQgMjcuMDY2LDE4LjEwOCAyMy45OSwyMi45ODkgMjAuOTE3LDI3Ljg4MSAxNC40NjksMjkuMzUyIDkuNTc5LDI2LjI3NSAtNS4wMzIsMTcuMDg2IC0yMy44NDMsMTcuMDkyIC0zOC40NDYsMjYuMjc1IC00My4zMzYsMjkuMzUyIC00OS43ODQsMjcuODgxIC01Mi44NTIsMjIuOTg5IC01NS45MjgsMTguMTA0IC01NC40NjEsMTEuNjU0IC00OS41OCw4LjU3OCAtNDMuMTMyLDQuNTMxIC0zNi4xMjgsMS42NTUgLTI4Ljg2NywwIEwgLTQ4LjgwOSwtMTkuOTQxIEMgLTUyLjg4NiwtMjQuMDIyIC01Mi44ODYsLTMwLjYzOSAtNDguODA1LC0zNC43MiAtNDYuNzYyLC0zNi43NTggLTQ0LjA5LC0zNy43NzkgLTQxLjQxOCwtMzcuNzc5IC0zOC43NDIsLTM3Ljc3OSAtMzYuMDY1LC0zNi43NTggLTM0LjAyMywtMzQuNzIgTCAtMTQuNDM2LC0xNS4xMjMgNS4xNjksLTM0LjcyIEMgOS4yNDYsLTM4LjgwMSAxNS44NjIsLTM4LjgwMSAxOS45NDMsLTM0LjcyIDI0LjAyOCwtMzAuNjM5IDI0LjAyOCwtMjQuMDE5IDE5Ljk0MywtMTkuOTQxIEwgMCwwIFpcIiBzdHlsZT1cImZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIi8+PC9nPjwvZz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxNjkuNzYsNTYuNzI3KVwiIGQ9XCJNMCAwQy01LjEtMi4zLTEwLjYtMy44LTE2LjQtNC41LTEwLjUtMS02IDQuNi0zLjkgMTEuMy05LjQgOC0xNS41IDUuNy0yMiA0LjQtMjcuMyA5LjktMzQuNyAxMy40LTQyLjkgMTMuNC01OC43IDEzLjQtNzEuNiAwLjYtNzEuNi0xNS4yLTcxLjYtMTcuNC03MS4zLTE5LjYtNzAuOC0yMS43LTk0LjYtMjAuNS0xMTUuNy05LjEtMTI5LjggOC4yLTEzMi4zIDQtMTMzLjctMS0xMzMuNy02LjItMTMzLjctMTYuMS0xMjguNi0yNC45LTEyMC45LTMwLTEyNS42LTI5LjktMTMwLjEtMjguNi0xMzMuOS0yNi41LTEzMy45LTI2LjYtMTMzLjktMjYuNy0xMzMuOS0yNi44LTEzMy45LTQwLjctMTI0LTUyLjMtMTExLTU0LjktMTEzLjQtNTUuNS0xMTUuOS01NS45LTExOC41LTU1LjktMTIwLjMtNTUuOS0xMjIuMS01NS43LTEyMy45LTU1LjQtMTIwLjItNjYuNy0xMDkuNy03NS05Ny4xLTc1LjMtMTA2LjktODIuOS0xMTkuMy04Ny41LTEzMi43LTg3LjUtMTM1LTg3LjUtMTM3LjMtODcuNC0xMzkuNS04Ny4xLTEyNi44LTk1LjItMTExLjgtMTAwLTk1LjYtMTAwLTQzLTEwMC0xNC4yLTU2LjMtMTQuMi0xOC41LTE0LjItMTcuMy0xNC4yLTE2LTE0LjMtMTQuOC04LjctMTAuOC0zLjgtNS43IDAgMFwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgxIDAgMCAtMSA3Mi4zODEgOTAuMTcyKVwiPjxwYXRoIGQ9XCJNODcuMiAwIDg3LjIgMTcuMSA3NSAxNy4xIDc1IDAgNTcuOSAwIDU3LjktMTIuMiA3NS0xMi4yIDc1LTI5LjMgODcuMi0yOS4zIDg3LjItMTIuMiAxMDQuMy0xMi4yIDEwNC4zIDAgODcuMiAwWlwiLz48cGF0aCBkPVwiTTAgMCAwLTE5LjYgMjYuMi0xOS42QzI1LjQtMjMuNyAyMy44LTI3LjUgMjAuOC0zMC42IDEwLjMtNDIuMS05LjMtNDItMjAuNS0zMC40LTMxLjctMTguOS0zMS42LTAuMy0yMC4yIDExLjEtOS40IDIxLjkgOCAyMi40IDE4LjYgMTIuMUwxOC41IDEyLjEgMzIuOCAyNi40QzEzLjcgNDMuOC0xNS44IDQzLjUtMzQuNSAyNS4xLTUzLjggNi4xLTU0LTI1LTM0LjktNDQuMy0xNS45LTYzLjUgMTcuMS02My43IDM0LjktNDQuNiA0NS42LTMzIDQ4LjctMTYuNCA0Ni4yIDBMMCAwWlwiLz48L2c+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsOTcuNjc2LDYyLjQxMSlcIiBkPVwiTTAgMEMxMC4yIDAgMTkuOS00LjUgMjYuOS0xMS42TDI2LjktMTEuNkMyNi45LTguMiAyOS4yLTUuNyAzMi40LTUuN0wzMy4yLTUuN0MzOC4yLTUuNyAzOS4yLTEwLjQgMzkuMi0xMS45TDM5LjItNjQuOEMzOC45LTY4LjIgNDIuOC03MCA0NS02Ny44IDUzLjUtNTkuMSA2My42LTIyLjkgMzkuNy0yIDE3LjQgMTcuNi0xMi41IDE0LjMtMjguNSAzLjQtNDUuNC04LjMtNTYuMi0zNC4xLTQ1LjctNTguNC0zNC4yLTg0LjktMS40LTkyLjggMTguMS04NC45IDI4LTgwLjkgMzIuNS05NC4zIDIyLjMtOTguNiA2LjgtMTA1LjItMzYuNC0xMDQuNS01Ni41LTY5LjYtNzAuMS00Ni4xLTY5LjQtNC42LTMzLjMgMTYuOS01LjcgMzMuMyAzMC43IDI4LjggNTIuNyA1LjggNzUuNi0xOC4yIDc0LjMtNjMgNTEuOS04MC41IDQxLjgtODguNCAyNi43LTgwLjcgMjYuOC02OS4yTDI2LjctNjUuNEMxOS42LTcyLjQgMTAuMi03Ni41IDAtNzYuNS0yMC4yLTc2LjUtMzgtNTguNy0zOC0zOC40LTM4LTE4LTIwLjIgMCAwIDBNMjUuNS0zN0MyNC43LTIyLjIgMTMuNy0xMy4zIDAuNC0xMy4zTC0wLjEtMTMuM0MtMTUuNC0xMy4zLTIzLjktMjUuMy0yMy45LTM5LTIzLjktNTQuMy0xMy42LTY0LTAuMS02NCAxNC45LTY0IDI0LjgtNTMgMjUuNS00MEwyNS41LTM3WlwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgwLjQyNjIzIDAgMCAwLjQyNjIzIDM0Ljk5OSAzNSlcIj48cGF0aCBkPVwiTTE2MC43IDE5LjVjLTE4LjkgMC0zNy4zIDMuNy01NC43IDEwLjlMNzYuNCAwLjdjLTAuOC0wLjgtMi4xLTEtMy4xLTAuNEM0NC40IDE4LjIgMTkuOCA0Mi45IDEuOSA3MS43Yy0wLjYgMS0wLjUgMi4zIDAuNCAzLjFsMjguNCAyOC40Yy04LjUgMTguNi0xMi44IDM4LjUtMTIuOCA1OS4xIDAgNzguNyA2NCAxNDIuOCAxNDIuOCAxNDIuOCA3OC43IDAgMTQyLjgtNjQgMTQyLjgtMTQyLjhDMzAzLjQgODMuNSAyMzkuNCAxOS41IDE2MC43IDE5LjV6TTIxNy4yIDE0OC43bDkuOSA0Mi4xIDkuNSA0NC40IC00NC4zLTkuNSAtNDIuMS05LjlMMzYuNyAxMDIuMWMxNC4zLTI5LjMgMzguMy01Mi42IDY4LjEtNjUuOEwyMTcuMiAxNDguN3pcIi8+PHBhdGggZD1cIk0yMjEuOCAxODcuNGwtNy41LTMzYy0yNS45IDExLjktNDYuNCAzMi40LTU4LjMgNTguM2wzMyA3LjVDMTk2IDIwNi4yIDIwNy43IDE5NC40IDIyMS44IDE4Ny40elwiLz48L2c+PC9zdmc+JyxcclxuICAgICAgJycsLy9waW5cclxuICAgICAgJycsLy9mYXZcclxuICAgICAgJycsLy9wcmludFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw3MS4yNjQsMTA2LjkzKVwiIGQ9XCJNMCAwIDY4LjYgNDMuMUM3MiA0NS4zIDczLjEgNDIuOCA3MS42IDQxLjFMMTQuNi0xMC4yIDExLjctMzUuOCAwIDBaTTg3LjEgNjIuOS0zMy40IDE3LjJDLTQwIDE1LjMtMzkuOCA4LjgtMzQuOSA3LjNMLTQuNy0yLjIgNi44LTM3LjZDOC4yLTQxLjUgOS40LTQyLjkgMTEuOC00MyAxNC4zLTQzIDE1LjMtNDIuMSAxNy45LTM5LjggMjAuOS0zNi45IDI1LjYtMzIuMyAzMy0yNS4yTDY0LjQtNDguNEM3MC4yLTUxLjYgNzQuMy00OS45IDc1LjgtNDNMOTUuNSA1NC40Qzk3LjYgNjIuOSA5Mi42IDY1LjQgODcuMSA2Mi45XCIvPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDEzNS4zMywxMTkuODUpXCIgZD1cIk0wIDBDLTIuNC01LjQtNi41LTktMTIuMi0xMC42LTE0LjMtMTEuMi0xNi4zLTEwLjctMTguMi05LjktNDQuNCAxLjItNjMuMyAxOS42LTc0IDQ2LjItNzQuOCA0OC4xLTc1LjMgNTAuMS03NS4yIDUxLjktNzUuMiA1OC43LTY5LjIgNjUtNjIuNiA2NS40LTYwLjggNjUuNS01OS4yIDY0LjktNTcuOSA2My43LTUzLjMgNTkuMy00OS42IDU0LjMtNDYuOSA0OC42LTQ1LjQgNDUuNS00NiA0My4zLTQ4LjcgNDEuMS00OS4xIDQwLjctNDkuNSA0MC40LTUwIDQwLjEtNTMuNSAzNy41LTU0LjMgMzQuOS01Mi42IDMwLjgtNDkuOCAyNC4yLTQ1LjQgMTktMzkuMyAxNS4xLTM3IDEzLjYtMzQuNyAxMi4yLTMyIDExLjUtMjkuNiAxMC44LTI3LjcgMTEuNS0yNi4xIDEzLjQtMjUuOSAxMy42LTI1LjggMTMuOS0yNS42IDE0LjEtMjIuMyAxOC44LTE4LjYgMTkuNi0xMy43IDE2LjUtOS42IDEzLjktNS42IDExLTEuOCA3LjggMC43IDUuNiAxLjMgMyAwIDBNLTE4LjIgMzYuN0MtMTguMyAzNS45LTE4LjMgMzUuNC0xOC40IDM0LjktMTguNiAzNC0xOS4yIDMzLjQtMjAuMiAzMy40LTIxLjMgMzMuNC0yMS45IDM0LTIyLjIgMzQuOS0yMi4zIDM1LjUtMjIuNCAzNi4yLTIyLjUgMzYuOS0yMy4yIDQwLjMtMjUuMiA0Mi42LTI4LjYgNDMuNi0yOS4xIDQzLjctMjkuNSA0My43LTI5LjkgNDMuOC0zMSA0NC4xLTMyLjQgNDQuMi0zMi40IDQ1LjgtMzIuNSA0Ny4xLTMxLjUgNDcuOS0yOS42IDQ4LTI4LjQgNDguMS0yNi41IDQ3LjUtMjUuNCA0Ni45LTIwLjkgNDQuNy0xOC43IDQxLjYtMTguMiAzNi43TS0yNS41IDUxLjJDLTI4IDUyLjEtMzAuNSA1Mi44LTMzLjIgNTMuMi0zNC41IDUzLjQtMzUuNCA1NC4xLTM1LjEgNTUuNi0zNC45IDU3LTM0IDU3LjUtMzIuNiA1Ny40LTI0IDU2LjYtMTcuMyA1My40LTEyLjYgNDYtMTAuNSA0Mi41LTkuMiAzNy41LTkuNCAzMy44LTkuNSAzMS4yLTkuOSAzMC41LTExLjQgMzAuNS0xMy42IDMwLjYtMTMuMyAzMi40LTEzLjUgMzMuNy0xMy43IDM1LjctMTQuMiAzNy43LTE0LjcgMzkuNy0xNi4zIDQ1LjQtMTkuOSA0OS4zLTI1LjUgNTEuMk0tMzggNjQuNEMtMzcuOSA2NS45LTM3IDY2LjUtMzUuNSA2Ni40LTIzLjIgNjUuOC0xMy45IDYyLjItNi43IDUyLjUtMi41IDQ2LjktMC4yIDM5LjIgMCAzMi4yIDAgMzEuMSAwIDMwIDAgMjktMC4xIDI3LjgtMC42IDI2LjktMS45IDI2LjktMy4yIDI2LjktMy45IDI3LjYtNCAyOS00LjMgMzQuMi01LjMgMzkuMy03LjMgNDQuMS0xMS4yIDUzLjUtMTguNiA1OC42LTI4LjEgNjEuMS0zMC43IDYxLjctMzMuMiA2Mi4yLTM1LjggNjIuNS0zNyA2Mi41LTM4IDYyLjgtMzggNjQuNE0xMS41IDc0LjFDNi42IDc4LjMgMC45IDgwLjgtNS4zIDgyLjQtMjAuOCA4Ni41LTM2LjUgODcuNS01Mi40IDg1LjMtNjAuNSA4NC4yLTY4LjMgODIuMS03NS40IDc4LjEtODMuOCA3My40LTg5LjYgNjYuNi05Mi4yIDU3LjEtOTQgNTAuNC05NC45IDQzLjYtOTUuMiAzNi42LTk1LjcgMjYuNC05NS40IDE2LjMtOTIuOCA2LjMtODkuOC01LjMtODMuMi0xMy44LTcxLjktMTguMy03MC43LTE4LjgtNjkuNS0xOS41LTY4LjMtMjAtNjcuMi0yMC40LTY2LjgtMjEuMi02Ni44LTIyLjQtNjYuOS0zMC40LTY2LjgtMzguNC02Ni44LTQ2LjctNjMuOS00My45LTYxLjgtNDEuOC02MC4zLTQwLjEtNTUuOS0zNS4xLTUxLjctMzAuOS00Ny4xLTI2LjEtNDQuNy0yMy43LTQ1LjctMjMuOC00Mi4xLTIzLjgtMzcuOC0yMy45LTMxLTI0LjEtMjYuOC0yMy44LTE4LjYtMjMuMS0xMC42LTIyLjEtMi43LTE5LjcgNy4yLTE2LjcgMTUuMi0xMS40IDE5LjItMS4zIDIwLjMgMS4zIDIxLjQgNCAyMiA2LjggMjUuOSAyMi45IDI1LjQgMzguOSAyMi4yIDU1IDIwLjYgNjIuNCAxNy41IDY5IDExLjUgNzQuMVwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMzAuODQsMTEyLjcpXCIgZD1cIk0wIDBDLTEuNiAwLjktOS40IDUuMS0xMC44IDUuNy0xMi4zIDYuMy0xMy40IDYuNi0xNC41IDUtMTUuNiAzLjQtMTguOS0wLjEtMTkuOS0xLjEtMjAuOC0yLjItMjEuOC0yLjMtMjMuNC0xLjQtMjUtMC41LTMwLjEgMS40LTM2LjEgNy4xLTQwLjcgMTEuNS00My43IDE3LTQ0LjYgMTguNi00NS41IDIwLjMtNDQuNiAyMS4xLTQzLjggMjEuOS00MyAyMi42LTQyLjEgMjMuNy00MS4zIDI0LjYtNDAuNCAyNS41LTQwLjEgMjYuMi0zOS41IDI3LjItMzkgMjguMy0zOS4yIDI5LjMtMzkuNiAzMC4xLTM5LjkgMzAuOS00Mi45IDM5LTQ0LjEgNDIuMy00NS4zIDQ1LjUtNDYuNyA0NS00Ny42IDQ1LjEtNDguNiA0NS4xLTQ5LjYgNDUuMy01MC43IDQ1LjMtNTEuOCA0NS40LTUzLjYgNDUtNTUuMSA0My41LTU2LjYgNDEuOS02MSAzOC4yLTYxLjMgMzAuMi02MS42IDIyLjMtNTYuMSAxNC40LTU1LjMgMTMuMy01NC41IDEyLjItNDQuOC01LjEtMjguNi0xMi4xLTEyLjQtMTkuMi0xMi40LTE3LjEtOS40LTE2LjktNi40LTE2LjggMC4zLTEzLjQgMS44LTkuNiAzLjMtNS45IDMuNC0yLjcgMy0yIDIuNi0xLjMgMS42LTAuOSAwIDBNLTI5LjctMzguM0MtNDAuNC0zOC4zLTUwLjMtMzUuMS01OC42LTI5LjZMLTc4LjktMzYuMS03Mi4zLTE2LjVDLTc4LjYtNy44LTgyLjMgMi44LTgyLjMgMTQuNC04Mi4zIDQzLjQtNTguNyA2Ny4xLTI5LjcgNjcuMS0wLjYgNjcuMSAyMyA0My40IDIzIDE0LjQgMjMtMTQuNy0wLjYtMzguMy0yOS43LTM4LjNNLTI5LjcgNzcuNkMtNjQuNiA3Ny42LTkyLjkgNDkuMy05Mi45IDE0LjQtOTIuOSAyLjQtODkuNi04LjgtODMuOS0xOC4zTC05NS4zLTUyLjItNjAuMi00MUMtNTEuMi00Ni00MC44LTQ4LjktMjkuNy00OC45IDUuMy00OC45IDMzLjYtMjAuNiAzMy42IDE0LjQgMzMuNiA0OS4zIDUuMyA3Ny42LTI5LjcgNzcuNlwiLz48L3N2Zz4nLFxyXG4gICAgXTtcclxuICAgIHZhciBpY29uPXN2Z1tqXTtcclxuICAgIHZhciBjc3M9JyBzdHlsZT1cIndpZHRoOicrc2l6ZSsncHg7aGVpZ2h0Oicrc2l6ZSsncHhcIiAnO1xyXG4gICAgaWNvbj0nPHN2ZyBjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2Qtc3ZnXCInK2NzcytpY29uLnN1YnN0cmluZyg0KTtcclxuICAgIGljb249Jz4nK2ljb24uc3Vic3RyaW5nKDAsIGljb24ubGVuZ3RoIC0gMSk7XHJcbiAgfWVsc2V7XHJcbiAgICBpY29uPSdzdHlsZT1cImRpc3BsYXk6aW5saW5lLWJsb2NrO3ZlcnRpY2FsLWFsaWduOmJvdHRvbTt3aWR0aDonK3NpemUrJ3B4O2hlaWdodDonK3NpemUrJ3B4O21hcmdpbjowIDZweCA2cHggMDtwYWRkaW5nOjA7b3V0bGluZTpub25lO2JhY2tncm91bmQ6dXJsKCcgKyBmICsgZm4gKyAnKSAtJyArIHNpemUgKiBqICsgJ3B4IDAgbm8tcmVwZWF0OyBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1wiJ1xyXG4gIH1cclxuICByZXR1cm4gaWNvbjtcclxufVxyXG5cclxuZnVuY3Rpb24gZmF2KGEpIHtcclxuICB2YXIgdGl0bGUgPSBkb2N1bWVudC50aXRsZTtcclxuICB2YXIgdXJsID0gZG9jdW1lbnQubG9jYXRpb247XHJcbiAgdHJ5IHtcclxuICAgIHdpbmRvdy5leHRlcm5hbC5BZGRGYXZvcml0ZSh1cmwsIHRpdGxlKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICB3aW5kb3cuc2lkZWJhci5hZGRQYW5lbCh0aXRsZSwgdXJsLCAnJyk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgKG9wZXJhKSA9PSAnb2JqZWN0JyB8fCB3aW5kb3cuc2lkZWJhcikge1xyXG4gICAgICAgIGEucmVsID0gJ3NpZGViYXInO1xyXG4gICAgICAgIGEudGl0bGUgPSB0aXRsZTtcclxuICAgICAgICBhLnVybCA9IHVybDtcclxuICAgICAgICBhLmhyZWYgPSB1cmw7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYWxlcnQoJ9Cd0LDQttC80LjRgtC1IEN0cmwtRCwg0YfRgtC+0LHRiyDQtNC+0LHQsNCy0LjRgtGMINGB0YLRgNCw0L3QuNGG0YMg0LIg0LfQsNC60LvQsNC00LrQuCcpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VuZF9wcm9tbyhwcm9tbywgcHJvbW91cmwpe1xyXG4gICQuYWpheCh7XHJcbiAgICBtZXRob2Q6IFwicG9zdFwiLFxyXG4gICAgdXJsOiBwcm9tb3VybCxcclxuICAgIC8vdXJsOiBcIi9hY2NvdW50L3Byb21vXCIsXHJcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgZGF0YToge3Byb21vOiBwcm9tb30sXHJcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgIGlmIChkYXRhLnRpdGxlICE9IG51bGwgJiYgZGF0YS5tZXNzYWdlICE9IG51bGwpIHtcclxuICAgICAgICBvbl9wcm9tbz0kKCcub25fcHJvbW8nKTtcclxuICAgICAgICBpZihvbl9wcm9tby5sZW5ndGg9PTAgfHwgIW9uX3Byb21vLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRhdGEubWVzc2FnZVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIG9uX3Byb21vLnNob3coKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcbiIsIiQoJy5zY3JvbGxfYm94LXRleHQnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG5cclxuICAgJCh0aGlzKS5jbG9zZXN0KCcuc2Nyb2xsX2JveCcpLmZpbmQoJy5zY3JvbGxfYm94LWl0ZW0nKS5yZW1vdmVDbGFzcygnc2Nyb2xsX2JveC1pdGVtLWxvdycpO1xyXG5cclxufSk7IiwidmFyIHBsYWNlaG9sZGVyID0gKGZ1bmN0aW9uKCl7XHJcbiAgZnVuY3Rpb24gb25CbHVyKCl7XHJcbiAgICB2YXIgaW5wdXRWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcbiAgICBpZiAoIGlucHV0VmFsdWUgPT0gXCJcIiApIHtcclxuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdmb2N1c2VkJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvbkZvY3VzKCl7XHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiBydW4ocGFyKSB7XHJcbiAgICB2YXIgZWxzO1xyXG4gICAgaWYoIXBhcilcclxuICAgICAgZWxzPSQoJy5mb3JtLWdyb3VwIFtwbGFjZWhvbGRlcl0nKTtcclxuICAgIGVsc2VcclxuICAgICAgZWxzPSQocGFyKS5maW5kKCcuZm9ybS1ncm91cCBbcGxhY2Vob2xkZXJdJyk7XHJcblxyXG4gICAgZWxzLmZvY3VzKG9uRm9jdXMpO1xyXG4gICAgZWxzLmJsdXIob25CbHVyKTtcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpPGVscy5sZW5ndGg7aSsrKXtcclxuICAgICAgdmFyIGVsPWVscy5lcShpKTtcclxuICAgICAgdmFyIHRleHQgPSBlbC5hdHRyKCdwbGFjZWhvbGRlcicpO1xyXG4gICAgICBlbC5hdHRyKCdwbGFjZWhvbGRlcicsJycpO1xyXG4gICAgICBpZih0ZXh0Lmxlbmd0aDwyKWNvbnRpbnVlO1xyXG4gICAgICAvL2lmKGVsLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykubGVuZ3RoPT0wKXJldHVybjtcclxuXHJcbiAgICAgIHZhciBpbnB1dFZhbHVlID0gZWwudmFsKCk7XHJcbiAgICAgIHZhciBlbF9pZCA9IGVsLmF0dHIoJ2lkJyk7XHJcbiAgICAgIGlmKCFlbF9pZCl7XHJcbiAgICAgICAgZWxfaWQ9J2VsX2Zvcm1zXycrTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKjEwMDAwKTtcclxuICAgICAgICBlbC5hdHRyKCdpZCcsZWxfaWQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKHRleHQuaW5kZXhPZignfCcpPjApe1xyXG4gICAgICAgIHRleHQ9dGV4dC5zcGxpdCgnfCcpO1xyXG4gICAgICAgIHRleHQ9dGV4dFswXStcIjxzcGFuPlwiK3RleHRbMV0rXCI8L3NwYW4+XCJcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGRpdiA9ICQoJzxsYWJlbC8+Jyx7XHJcbiAgICAgICAgJ2NsYXNzJzoncGxhY2Vob2xkZXInLFxyXG4gICAgICAgICdodG1sJzogdGV4dCxcclxuICAgICAgICAnZm9yJzplbF9pZFxyXG4gICAgICB9KTtcclxuICAgICAgZWwuYmVmb3JlKGRpdik7XHJcblxyXG4gICAgICBvbkZvY3VzLmJpbmQoZWwpKClcclxuICAgICAgb25CbHVyLmJpbmQoZWwpKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJ1bigpO1xyXG4gIHJldHVybiBydW47XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5hamF4X2xvYWQnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICB2YXIgdXJsID0gJCh0aGF0KS5hdHRyKCdocmVmJyk7XHJcbiAgICAgICAgdmFyIHRvcCA9IE1hdGgubWF4KGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wLCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wKTtcclxuICAgICAgICB2YXIgc3RvcmVzU29ydCA9ICQoJy5jYXRhbG9nLXN0b3Jlc19zb3J0Jyk7Ly/QsdC70L7QuiDRgdC+0YDRgtC40YDQvtCy0LrQuCDRjdC70LXQvNC10L3RgtC+0LJcclxuICAgICAgICB2YXIgdGFibGUgPSAkKCd0YWJsZS50YWJsZScpOy8v0YLQsNCx0LvQuNGG0LAg0LIgYWNjb3VudFxyXG4gICAgICAgIC8vc2Nyb2xsINGC0YPQtNCwINC40LvQuCDRgtGD0LTQsFxyXG4gICAgICAgIHZhciBzY3JvbGxUb3AgPSBzdG9yZXNTb3J0Lmxlbmd0aCA/ICQoc3RvcmVzU29ydFswXSkub2Zmc2V0KCkudG9wIC0gJCgnI2hlYWRlcj4qJykuZXEoMCkuaGVpZ2h0KCkgLSA1MCA6IDA7XHJcbiAgICAgICAgaWYgKHNjcm9sbFRvcCA9PT0wICYmIHRhYmxlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzY3JvbGxUb3AgPSAkKHRhYmxlWzBdKS5vZmZzZXQoKS50b3AgLSAkKCcjaGVhZGVyPionKS5lcSgwKS5oZWlnaHQoKSAtIDUwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJCh0aGF0KS5hZGRDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICAgICQuZ2V0KHVybCwgeydnJzonYWpheF9sb2FkJ30sIGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICB2YXIgY29udGVudCA9ICQoZGF0YSkuZmluZCgnI2NvbnRlbnQtd3JhcCcpLmh0bWwoKTtcclxuICAgICAgICAgICAgJCgnYm9keScpLmZpbmQoJyNjb250ZW50LXdyYXAnKS5odG1sKGNvbnRlbnQpO1xyXG4gICAgICAgICAgICBzaGFyZTQyKCk7Ly90INC+0YLQvtCx0YDQsNC30LjQu9C40YHRjCDQutC90L7Qv9C60Lgg0J/QvtC00LXQu9C40YLRjNGB0Y9cclxuICAgICAgICAgICAgc2RUb29sdGlwLnNldEV2ZW50cygpOy8v0YDQsNCx0L7RgtCw0LvQuCDRgtGD0LvRgtC40L/Ri1xyXG4gICAgICAgICAgICBiYW5uZXIucmVmcmVzaCgpOy8v0L7QsdC90L7QstC40YLRjCDQsdCw0L3QvdC10YAg0L7RgiDQs9GD0LPQu1xyXG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoXCJvYmplY3Qgb3Igc3RyaW5nXCIsIFwiVGl0bGVcIiwgdXJsKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0b3AgPiBzY3JvbGxUb3ApIHtcclxuICAgICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IHNjcm9sbFRvcH0sIDUwMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSkuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCh0aGF0KS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHt0eXBlOidlcnInLCAndGl0bGUnOmxnKCdlcnJvcicpLCAnbWVzc2FnZSc6bGcoJ2Vycm9yX3F1ZXJ5aW5nX2RhdGEnKX0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG5cclxufSkoKTtcclxuIiwiYmFubmVyID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgZnVuY3Rpb24gcmVmcmVzaCgpe1xyXG4gICAgICAgIGZvcihpPTA7aTwkKCcuYWRzYnlnb29nbGUnKS5sZW5ndGg7aSsrKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAoYWRzYnlnb29nbGUgPSB3aW5kb3cuYWRzYnlnb29nbGUgfHwgW10pLnB1c2goe30pO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtyZWZyZXNoOiByZWZyZXNofVxyXG59KSgpOyIsInZhciBjb3VudHJ5X3NlbGVjdCA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgJCgnLmhlYWRlci1jb3VudHJpZXNfZGlhbG9nLWNsb3NlJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZGlhbG9nQ2xvc2UodGhpcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLWNvdW50cmllc19kaWFsb2ctZGlhbG9nLWJ1dHRvbi1hcHBseScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBkYXRlID0gbmV3KERhdGUpO1xyXG4gICAgICAgIGRhdGUgPSBNYXRoLnJvdW5kKGRhdGUuZ2V0VGltZSgpLzEwMDApO1xyXG4gICAgICAgIHNldENvb2tpZUFqYXgoJ19zZF9jb3VudHJ5X2RpYWxvZ19jbG9zZScsIGRhdGUsIDcpO1xyXG4gICAgICAgIGRpYWxvZ0Nsb3NlKHRoaXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLmhlYWRlci1jb3VudHJpZXNfZGlhbG9nLWRpYWxvZy1idXR0b24tY2hvb3NlJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy/QtNC+0LHQsNCy0LvRj9C10Lwg0LrQu9Cw0YHRgSwg0LjQvNC40YLQuNGA0L7QstCw0YLRjCBob3ZlclxyXG4gICAgICAgICQoJyNoZWFkZXItdXBsaW5lLXJlZ2lvbi1zZWxlY3QtYnV0dG9uJykuYWRkQ2xhc3MoXCJvcGVuXCIpO1xyXG4gICAgICAgIGRpYWxvZ0Nsb3NlKHRoaXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLmhlYWRlci11cGxpbmVfbGFuZy1saXN0Jykub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBkaWFsb2dDbG9zZSA9IGZ1bmN0aW9uKGVsZW0pIHtcclxuICAgICAgICAkKCcuaGVhZGVyLXVwbGluZV9sYW5nLWxpc3QnKS5yZW1vdmVDbGFzcygnaW5hY3RpdmUnKTtcclxuICAgICAgICAkKGVsZW0pLmNsb3Nlc3QoJy5oZWFkZXItY291bnRyaWVzX2RpYWxvZycpLmZhZGVPdXQoKTtcclxuICAgIH07XHJcbn0oKTsiLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuXHJcbiAgICAvLyBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICB2YXIgdGltZSA9IChuZXcgRGF0ZSkuZ2V0VGltZSgpLzEwMDA7XHJcbiAgICAvLyAgICAgdmFyIHVzZXJzID0gMTAwICogTWF0aC5zaW4odGltZSkgKyAyICogTWF0aC5zaW4odGltZS8xMCszKSogdGltZTtcclxuICAgIC8vICAgICBjb25zb2xlLmxvZyh1c2Vycyk7XHJcbiAgICAvLyB9LCAxNTAwKTtcclxuXHJcblxyXG5cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIHZhciBzbGlkZXIgPSAkKFwiI2ZpbHRlci1zbGlkZXItcHJpY2VcIik7XHJcbiAgICB2YXIgdGV4dFN0YXJ0ID0gJCgnI3NsaWRlci1wcmljZS1zdGFydCcpO1xyXG4gICAgdmFyIHRleHRGaW5pc2ggPSAkKCcjc2xpZGVyLXByaWNlLWVuZCcpO1xyXG5cclxuICAgIHZhciBzdGFydFJhbmdlID0gcGFyc2VJbnQoJCh0ZXh0U3RhcnQpLmRhdGEoJ3JhbmdlJyksIDEwKSxcclxuICAgICAgICBmaW5pc2hSYW5nZSA9IHBhcnNlSW50KCQodGV4dEZpbmlzaCkuZGF0YSgncmFuZ2UnKSwgMTApLFxyXG4gICAgICAgIHN0YXJ0VXNlciA9IHBhcnNlSW50KCQodGV4dFN0YXJ0KS5kYXRhKCd1c2VyJyksIDEwKSxcclxuICAgICAgICBmaW5pc2hVc2VyID0gcGFyc2VJbnQoJCh0ZXh0RmluaXNoKS5kYXRhKCd1c2VyJyksIDEwKTtcclxuICAgIC8vY29uc29sZS5sb2coc3RhcnRSYW5nZSwgZmluaXNoUmFuZ2UsIHN0YXJ0VXNlciwgZmluaXNoVXNlcik7XHJcbiAgICBzbGlkZXIuc2xpZGVyKHtcclxuICAgICAgICByYW5nZTogdHJ1ZSxcclxuICAgICAgICBtaW46IHN0YXJ0UmFuZ2UsXHJcbiAgICAgICAgbWF4OiBmaW5pc2hSYW5nZSxcclxuICAgICAgICB2YWx1ZXM6IFtzdGFydFVzZXIsXHJcbiAgICAgICAgICAgIGZpbmlzaFVzZXJdLFxyXG4gICAgICAgIHNsaWRlOiBmdW5jdGlvbiAoZXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHVpLnZhbHVlc1sgMCBdICsgXCIgLSBcIiArIHVpLnZhbHVlc1sgMSBdKTtcclxuICAgICAgICAgICAgJCh0ZXh0U3RhcnQpLnZhbCh1aS52YWx1ZXNbMF0pO1xyXG4gICAgICAgICAgICAkKHRleHRGaW5pc2gpLnZhbCh1aS52YWx1ZXNbMV0pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBwcmljZVN0YXJ0Q2hhbmdlKGUpIHtcclxuICAgICAgICB2YXIgdGhhdCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgIHN0clZhbHVlID0gdGhhdC52YWwoKSxcclxuICAgICAgICAgICAgaW50VmFsdWUgPSBwYXJzZUludChzdHJWYWx1ZSkgfHwgMCwvL9C10YHQu9C4INC90LXQv9GA0LDQstC40LvRjNC90L4sINGC0L4gMFxyXG4gICAgICAgICAgICBzdGFydFJhbmdlID0gcGFyc2VJbnQodGhhdC5kYXRhKCdyYW5nZScpKSxcclxuICAgICAgICAgICAgZmluaXNoUmFuZ2UgPSBwYXJzZUludCh0ZXh0RmluaXNoLnZhbCgpKTtcclxuXHJcbiAgICAgICAgaWYgKGludFZhbHVlIDwgc3RhcnRSYW5nZSkgeyAvL9C10YHQu9C4INC80LXQvdGM0YjQtSDQtNC40LDQv9Cw0LfQvtC90LAsINGC0L4g0L/QviDQvdC40LbQvdC10LzRgyDQv9GA0LXQtNC10LvRg1xyXG4gICAgICAgICAgICBpbnRWYWx1ZSA9IHN0YXJ0UmFuZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnRWYWx1ZSA+IGZpbmlzaFJhbmdlKSB7IC8v0LXRgdC70Lgg0LLRi9GI0LUg0LTQuNCw0L/QsNC30L7QvdCwLCDRgtC+ICDQstC10YDRhdC90LjQvNGDINC/0YDQtdC00LXQu9GDXHJcbiAgICAgICAgICAgIGludFZhbHVlID0gZmluaXNoUmFuZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNsaWRlci5zbGlkZXIoJ3ZhbHVlcycsIDAsIGludFZhbHVlKTsgLy/QvdC+0LLQvtC1INC30L3QsNGH0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsFxyXG4gICAgICAgIHRoYXQudmFsKGludFZhbHVlKTsgIC8v0L/QvtCy0YLRgNC+0Y/QtdC8INC10LPQviDQtNC70Y8g0YHQsNC80L7Qs9C+INC/0L7Qu9GPXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcHJpY2VGaW5pc2hDaGFuZ2UoZSkge1xyXG4gICAgICAgIHZhciB0aGF0ID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgc3RhcnRSYW5nZSA9IHBhcnNlSW50KHRleHRTdGFydC52YWwoKSksXHJcbiAgICAgICAgICAgIHN0clZhbHVlID0gdGhhdC52YWwoKSxcclxuICAgICAgICAgICAgZmluaXNoUmFuZ2UgPSBwYXJzZUludCh0aGF0LmRhdGEoJ3JhbmdlJykpLFxyXG4gICAgICAgICAgICBpbnRWYWx1ZSA9IHBhcnNlSW50KHN0clZhbHVlKSB8fCBmaW5pc2hSYW5nZTsvL9C10YHQu9C4INC90LXQv9GA0LDQstC40LvRjNC90L4sINGC0L4g0LzQsNC60YHQuNC80YPQvFxyXG5cclxuICAgICAgICBpZiAoaW50VmFsdWUgPCBzdGFydFJhbmdlKSB7IC8v0LXRgdC70Lgg0LzQtdC90YzRiNC1INC00LjQsNC/0LDQt9C+0L3QsCwg0YLQviDQv9C+INC90LjQttC90LXQvNGDINC/0YDQtdC00LXQu9GDXHJcbiAgICAgICAgICAgIGludFZhbHVlID0gc3RhcnRSYW5nZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGludFZhbHVlID4gZmluaXNoUmFuZ2UpIHsgLy/QtdGB0LvQuCDQstGL0YjQtSDQtNC40LDQv9Cw0LfQvtC90LAsINGC0L4gINCy0LXRgNGF0L3QuNC80YMg0L/RgNC10LTQtdC70YNcclxuICAgICAgICAgICAgaW50VmFsdWUgPSBmaW5pc2hSYW5nZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2xpZGVyLnNsaWRlcigndmFsdWVzJywgMSwgaW50VmFsdWUpOyAvL9C90L7QstC+0LUg0LfQvdCw0YfQtdC90LjQtSDRgdC70LDQudC00LXRgNCwXHJcbiAgICAgICAgdGhhdC52YWwoaW50VmFsdWUpOyAgLy/Qv9C+0LLRgtGA0L7Rj9C10Lwg0LXQs9C+INC00LvRjyDRgdCw0LzQvtCz0L4g0L/QvtC70Y9cclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGV4dFN0YXJ0Lm9uKCdjaGFuZ2UnLCBwcmljZVN0YXJ0Q2hhbmdlKTsvL9C/0YDQuCDQuNC30LzQtdC90LXQvdC40LjQuCDQv9C+0LvQtdC5INCy0LLQvtC00LAg0YbQtdC90YtcclxuICAgIHRleHRGaW5pc2gub24oJ2NoYW5nZScsIHByaWNlRmluaXNoQ2hhbmdlKTsvL9C/0YDQuCDQuNC30LzQtdC90LXQvdC40LjQuCDQv9C+0LvQtdC5INCy0LLQvtC00LAg0YbQtdC90YtcclxuXHJcbiAgICAkKCdpbnB1dC5jYXRhbG9nX3Byb2R1Y3RfZmlsdGVyLWNoZWNrYm94X2l0ZW0tY2hlY2tib3gnKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICBpZiAoJCh0aGlzKS5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5hZGRDbGFzcygnY2hlY2tlZCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQodGhpcykucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKCk7IiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIGNvbnRlaW5lcjtcclxuICB2YXIgbW91c2VPdmVyID0gMDtcclxuICB2YXIgdGltZXJDbGVhckFsbCA9IG51bGw7XHJcbiAgdmFyIGFuaW1hdGlvbkVuZCA9ICd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJztcclxuICB2YXIgdGltZSA9IDEwMDAwO1xyXG5cclxuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9IGZhbHNlO1xyXG4gIHZhciBpc19pbml0ID0gZmFsc2U7XHJcbiAgdmFyIGNvbmZpcm1fb3B0ID0ge1xyXG4gICAgLy8gdGl0bGU6IGxnKCdkZWxldGluZycpLFxyXG4gICAgLy8gcXVlc3Rpb246IGxnKCdhcmVfeW91X3N1cmVfdG9fZGVsZXRlJyksXHJcbiAgICAvLyBidXR0b25ZZXM6IGxnKCd5ZXMnKSxcclxuICAgIC8vIGJ1dHRvbk5vOiBsZygnbm8nKSxcclxuICAgIGNhbGxiYWNrWWVzOiBmYWxzZSxcclxuICAgIGNhbGxiYWNrTm86IGZhbHNlLFxyXG4gICAgb2JqOiBmYWxzZSxcclxuICAgIGJ1dHRvblRhZzogJ2RpdicsXHJcbiAgICBidXR0b25ZZXNEb3A6ICcnLFxyXG4gICAgYnV0dG9uTm9Eb3A6ICcnXHJcbiAgfTtcclxuICB2YXIgYWxlcnRfb3B0ID0ge1xyXG4gICAgdGl0bGU6IFwiXCIsXHJcbiAgICBxdWVzdGlvbjogJ21lc3NhZ2UnLFxyXG4gICAgLy8gYnV0dG9uWWVzOiBsZygneWVzJyksXHJcbiAgICBjYWxsYmFja1llczogZmFsc2UsXHJcbiAgICBidXR0b25UYWc6ICdkaXYnLFxyXG4gICAgb2JqOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHRlc3RJcGhvbmUoKSB7XHJcbiAgICBpZiAoIS8oaVBob25lfGlQYWR8aVBvZCkuKihPUyAxMSkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHJldHVybjtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guY3NzKCdwb3NpdGlvbicsICdhYnNvbHV0ZScpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5jc3MoJ3RvcCcsICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICBpc19pbml0ID0gdHJ1ZTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3ggPSAkKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG4gICAgaWYgKG5vdGlmaWNhdGlvbl9ib3gubGVuZ3RoID4gMClyZXR1cm47XHJcblxyXG4gICAgJCgnYm9keScpLmFwcGVuZChcIjxkaXYgY2xhc3M9J25vdGlmaWNhdGlvbl9ib3gnPjwvZGl2PlwiKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3ggPSAkKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgJy5ub3RpZnlfY29udHJvbCcsIGNsb3NlTW9kYWwpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCAnLm5vdGlmeV9jbG9zZScsIGNsb3NlTW9kYWwpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCBjbG9zZU1vZGFsRm9uKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XHJcbiAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICAkKCcubm90aWZpY2F0aW9uX2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKCcnKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWxGb24oZSkge1xyXG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgIGlmICh0YXJnZXQuY2xhc3NOYW1lID09IFwibm90aWZpY2F0aW9uX2JveFwiKSB7XHJcbiAgICAgIGNsb3NlTW9kYWwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHZhciBfc2V0VXBMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5ub3RpZmljYXRpb25fY2xvc2UnLCBfY2xvc2VQb3B1cCk7XHJcbiAgICAkKCdib2R5Jykub24oJ21vdXNlZW50ZXInLCAnLm5vdGlmaWNhdGlvbl9jb250YWluZXInLCBfb25FbnRlcik7XHJcbiAgICAkKCdib2R5Jykub24oJ21vdXNlbGVhdmUnLCAnLm5vdGlmaWNhdGlvbl9jb250YWluZXInLCBfb25MZWF2ZSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9vbkVudGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGlmICh0aW1lckNsZWFyQWxsICE9IG51bGwpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2xlYXJBbGwpO1xyXG4gICAgICB0aW1lckNsZWFyQWxsID0gbnVsbDtcclxuICAgIH1cclxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgIHZhciBvcHRpb24gPSAkKHRoaXMpLmRhdGEoJ29wdGlvbicpO1xyXG4gICAgICBpZiAob3B0aW9uLnRpbWVyKSB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KG9wdGlvbi50aW1lcik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgbW91c2VPdmVyID0gMTtcclxuICB9O1xyXG5cclxuICB2YXIgX29uTGVhdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgIHZhciBvcHRpb24gPSAkdGhpcy5kYXRhKCdvcHRpb24nKTtcclxuICAgICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xyXG4gICAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChvcHRpb24uY2xvc2UpLCBvcHRpb24udGltZSAtIDE1MDAgKyAxMDAgKiBpKTtcclxuICAgICAgICAkdGhpcy5kYXRhKCdvcHRpb24nLCBvcHRpb24pXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgbW91c2VPdmVyID0gMDtcclxuICB9O1xyXG5cclxuICB2YXIgX2Nsb3NlUG9wdXAgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGlmIChldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAkdGhpcy5vbihhbmltYXRpb25FbmQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcclxuICAgIH0pO1xyXG4gICAgJHRoaXMuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9oaWRlJylcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBhbGVydChkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xyXG4gICAgYWxlcnRfb3B0ID0gb2JqZWN0cyhhbGVydF9vcHQsIHtcclxuICAgICAgICBidXR0b25ZZXM6IGxnKCd5ZXMnKVxyXG4gICAgfSk7XHJcbiAgICBkYXRhID0gb2JqZWN0cyhhbGVydF9vcHQsIGRhdGEpO1xyXG5cclxuICAgIGlmICghaXNfaW5pdClpbml0KCk7XHJcbiAgICB0ZXN0SXBob25lKCk7XHJcblxyXG4gICAgbm90eWZ5X2NsYXNzID0gJ25vdGlmeV9ib3ggJztcclxuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XHJcblxyXG4gICAgYm94X2h0bWwgPSAnPGRpdiBjbGFzcz1cIicgKyBub3R5ZnlfY2xhc3MgKyAnXCI+JztcclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sICs9ICc8ZGl2PicrZGF0YS50aXRsZSsnPC9kaXY+JztcclxuICAgIGJveF9odG1sICs9ICc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiICcgKyBkYXRhLmJ1dHRvblllc0RvcCArICc+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJyArIGRhdGEuYnV0dG9uTm9Eb3AgKyAnPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xyXG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LCAxMDApXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb25maXJtKGRhdGEpIHtcclxuICAgIGlmICghZGF0YSlkYXRhID0ge307XHJcbiAgICBjb25maXJtX29wdCA9IG9iamVjdHMoY29uZmlybV9vcHQsIHtcclxuICAgICAgICB0aXRsZTogbGcoJ2RlbGV0aW5nJyksXHJcbiAgICAgICAgcXVlc3Rpb246IGxnKCdhcmVfeW91X3N1cmVfdG9fZGVsZXRlJyksXHJcbiAgICAgICAgYnV0dG9uWWVzOiBsZygneWVzJyksXHJcbiAgICAgICAgYnV0dG9uTm86IGxnKCdubycpXHJcbiAgICB9KTtcclxuICAgIGRhdGEgPSBvYmplY3RzKGNvbmZpcm1fb3B0LCBkYXRhKTtcclxuICAgIGlmICh0eXBlb2YoZGF0YS5jYWxsYmFja1llcykgPT0gJ3N0cmluZycpIHtcclxuICAgICAgdmFyIGNvZGUgPSAnZGF0YS5jYWxsYmFja1llcyA9IGZ1bmN0aW9uKCl7JytkYXRhLmNhbGxiYWNrWWVzKyd9JztcclxuICAgICAgZXZhbChjb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzX2luaXQpaW5pdCgpO1xyXG4gICAgdGVzdElwaG9uZSgpO1xyXG4gICAgLy9ib3hfaHRtbD0nPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3hcIj4nO1xyXG5cclxuICAgIG5vdHlmeV9jbGFzcyA9ICdub3RpZnlfYm94ICc7XHJcbiAgICBpZiAoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzICs9IGRhdGEubm90eWZ5X2NsYXNzO1xyXG5cclxuICAgIGJveF9odG1sID0gJzxkaXYgY2xhc3M9XCInICsgbm90eWZ5X2NsYXNzICsgJ1wiPic7XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gZGF0YS50aXRsZTtcclxuICAgIGJveF9odG1sICs9ICc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcclxuXHJcbiAgICBpZiAoZGF0YS5jYWxsYmFja1llcyAhPSBmYWxzZSkge1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsIGRhdGEuY2FsbGJhY2tZZXMuYmluZChkYXRhLm9iaikpO1xyXG4gICAgfVxyXG4gICAgaWYgKGRhdGEuY2FsbGJhY2tObyAhPSBmYWxzZSkge1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX25vJykub24oJ2NsaWNrJywgZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgfSwgMTAwKVxyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG5vdGlmaShkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xyXG4gICAgdmFyIG9wdGlvbiA9IHt0aW1lOiAoZGF0YS50aW1lIHx8IGRhdGEudGltZSA9PT0gMCkgPyBkYXRhLnRpbWUgOiB0aW1lfTtcclxuICAgIGlmICghY29udGVpbmVyKSB7XHJcbiAgICAgIGNvbnRlaW5lciA9ICQoJzx1bC8+Jywge1xyXG4gICAgICAgICdjbGFzcyc6ICdub3RpZmljYXRpb25fY29udGFpbmVyJ1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoY29udGVpbmVyKTtcclxuICAgICAgX3NldFVwTGlzdGVuZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGxpID0gJCgnPGxpLz4nLCB7XHJcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2l0ZW0nXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlKSB7XHJcbiAgICAgIGxpLmFkZENsYXNzKCdub3RpZmljYXRpb25faXRlbS0nICsgZGF0YS50eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2xvc2UgPSAkKCc8c3Bhbi8+Jywge1xyXG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9jbG9zZSdcclxuICAgIH0pO1xyXG4gICAgb3B0aW9uLmNsb3NlID0gY2xvc2U7XHJcbiAgICBsaS5hcHBlbmQoY2xvc2UpO1xyXG5cclxuICAgIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICBjbGFzczogXCJub3RpZmljYXRpb25fY29udGVudFwiXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIHRpdGxlID0gJCgnPGg1Lz4nLCB7XHJcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcclxuICAgICAgfSk7XHJcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGV4dCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RleHRcIlxyXG4gICAgfSk7XHJcbiAgICB0ZXh0Lmh0bWwoZGF0YS5tZXNzYWdlKTtcclxuXHJcbiAgICBpZiAoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxyXG4gICAgICB9KTtcclxuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcclxuICAgICAgdmFyIHdyYXAgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICAgY2xhc3M6IFwid3JhcFwiXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgd3JhcC5hcHBlbmQoaW1nKTtcclxuICAgICAgd3JhcC5hcHBlbmQodGV4dCk7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHdyYXApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29udGVudC5hcHBlbmQodGV4dCk7XHJcbiAgICB9XHJcbiAgICBsaS5hcHBlbmQoY29udGVudCk7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xyXG4gICAgLy8gICB2YXIgdGl0bGUgPSAkKCc8cC8+Jywge1xyXG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXHJcbiAgICAvLyAgIH0pO1xyXG4gICAgLy8gICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xyXG4gICAgLy8gICBsaS5hcHBlbmQodGl0bGUpO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuICAgIC8vIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XHJcbiAgICAvLyAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXHJcbiAgICAvLyAgIH0pO1xyXG4gICAgLy8gICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcclxuICAgIC8vICAgbGkuYXBwZW5kKGltZyk7XHJcbiAgICAvLyB9XHJcbiAgICAvL1xyXG4gICAgLy8gdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcclxuICAgIC8vICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXHJcbiAgICAvLyB9KTtcclxuICAgIC8vIGNvbnRlbnQuaHRtbChkYXRhLm1lc3NhZ2UpO1xyXG4gICAgLy9cclxuICAgIC8vIGxpLmFwcGVuZChjb250ZW50KTtcclxuICAgIC8vXHJcbiAgICBjb250ZWluZXIuYXBwZW5kKGxpKTtcclxuXHJcbiAgICBpZiAob3B0aW9uLnRpbWUgPiAwKSB7XHJcbiAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChjbG9zZSksIG9wdGlvbi50aW1lKTtcclxuICAgIH1cclxuICAgIGxpLmRhdGEoJ29wdGlvbicsIG9wdGlvbilcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBhbGVydDogYWxlcnQsXHJcbiAgICBjb25maXJtOiBjb25maXJtLFxyXG4gICAgbm90aWZpOiBub3RpZmlcclxuICB9O1xyXG5cclxufSkoKTtcclxuXHJcblxyXG4kKCdbcmVmPXBvcHVwXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBlbCA9ICQoJHRoaXMuYXR0cignaHJlZicpKTtcclxuICBkYXRhID0gZWwuZGF0YSgpO1xyXG5cclxuICBkYXRhLnF1ZXN0aW9uID0gZWwuaHRtbCgpO1xyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7XHJcblxyXG4kKCdbcmVmPWNvbmZpcm1dJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gIGVsID0gJCgkdGhpcy5hdHRyKCdocmVmJykpO1xyXG4gIGRhdGEgPSBlbC5kYXRhKCk7XHJcbiAgZGF0YS5xdWVzdGlvbiA9IGVsLmh0bWwoKTtcclxuICBub3RpZmljYXRpb24uY29uZmlybShkYXRhKTtcclxufSk7XHJcblxyXG5cclxuJCgnLmRpc2FibGVkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gIGRhdGEgPSAkdGhpcy5kYXRhKCk7XHJcbiAgaWYgKGRhdGFbJ2J1dHRvbl95ZXMnXSkge1xyXG4gICAgZGF0YVsnYnV0dG9uWWVzJ10gPSBkYXRhWydidXR0b25feWVzJ107XHJcbiAgfVxyXG4gIGlmIChkYXRhWydidXR0b25feWVzJ10gPT09IGZhbHNlKSB7XHJcbiAgICBkYXRhWydidXR0b25ZZXMnXSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG59KTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm1vZGFsc19vcGVuJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuXHJcbiAgICAvL9C/0YDQuCDQvtGC0LrRgNGL0YLQuNC4INGE0L7RgNC80Ysg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuCDQt9Cw0LrRgNGL0YLRjCwg0LXRgdC70Lgg0L7RgtGA0YvRgtC+IC0g0L/QvtC/0LDQvyDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjyDQutGD0L/QvtC90LAg0LHQtdC3INGA0LXQs9C40YHRgtGA0LDRhtC40LhcclxuICAgIHZhciBwb3B1cCA9ICQoXCJhW2hyZWY9JyNzaG93cHJvbW9jb2RlLW5vcmVnaXN0ZXInXVwiKS5kYXRhKCdwb3B1cCcpO1xyXG4gICAgaWYgKHBvcHVwKSB7XHJcbiAgICAgIHBvcHVwLmNsb3NlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwb3B1cCA9ICQoJ2Rpdi5wb3B1cF9jb250LCBkaXYucG9wdXBfYmFjaycpO1xyXG4gICAgICBpZiAocG9wdXApIHtcclxuICAgICAgICBwb3B1cC5oaWRlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgaHJlZiA9IHRoaXMuaHJlZi5zcGxpdCgnIycpO1xyXG4gICAgaHJlZiA9IGhyZWZbaHJlZi5sZW5ndGggLSAxXTtcclxuICAgIHZhciBub3R5Q2xhc3MgPSAkKHRoaXMpLmRhdGEoJ25vdHljbGFzcycpO1xyXG4gICAgdmFyIGNsYXNzX25hbWU9KGhyZWYuaW5kZXhPZigndmlkZW8nKSA9PT0gMCA/ICdtb2RhbHMtZnVsbF9zY3JlZW4nIDogJ25vdGlmeV93aGl0ZScpICsgJyAnICsgbm90eUNsYXNzO1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgIGJ1dHRvblllczogZmFsc2UsXHJcbiAgICAgIG5vdHlmeV9jbGFzczogXCJsb2FkaW5nIFwiICsgY2xhc3NfbmFtZSxcclxuICAgICAgcXVlc3Rpb246ICcnXHJcbiAgICB9O1xyXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG5cclxuICAgICQuZ2V0KCcvJyArIGhyZWYsIGZ1bmN0aW9uIChkYXRhKSB7XHJcblxyXG4gICAgICB2YXIgZGF0YV9tc2cgPSB7XHJcbiAgICAgICAgYnV0dG9uWWVzOiBmYWxzZSxcclxuICAgICAgICBub3R5ZnlfY2xhc3M6IGNsYXNzX25hbWUsXHJcbiAgICAgICAgcXVlc3Rpb246IGRhdGEuaHRtbCxcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlmIChkYXRhLnRpdGxlKSB7XHJcbiAgICAgICAgZGF0YV9tc2dbJ3RpdGxlJ109ZGF0YS50aXRsZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyppZihkYXRhLmJ1dHRvblllcyl7XHJcbiAgICAgICAgZGF0YV9tc2dbJ2J1dHRvblllcyddPWRhdGEuYnV0dG9uWWVzO1xyXG4gICAgICB9Ki9cclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGFfbXNnKTtcclxuICAgICAgYWpheEZvcm0oJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykpO1xyXG4gICAgfSwgJ2pzb24nKTtcclxuXHJcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG5cclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tb2RhbHNfcG9wdXAnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgLy/Qv9GA0Lgg0LrQu9C40LrQtSDQstGB0L/Qu9GL0LLQsNGI0LrQsCDRgSDRgtC10LrRgdGC0L7QvFxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIHRpdGxlID0gJCh0aGF0KS5kYXRhKCdvcmlnaW5hbC1oJyk7XHJcbiAgICBpZighdGl0bGUpdGl0bGU9XCJcIjtcclxuICAgIHZhciBodG1sID0gJCgnIycgKyAkKHRoYXQpLmRhdGEoJ29yaWdpbmFsLWh0bWwnKSkuaHRtbCgpO1xyXG4gICAgdmFyIGNvbnRlbnQgPSBodG1sID8gaHRtbCA6ICQodGhhdCkuZGF0YSgnb3JpZ2luYWwtdGl0bGUnKTtcclxuICAgIHZhciBub3R5Q2xhc3MgPSAkKHRoYXQpLmRhdGEoJ25vdHljbGFzcycpO1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgIGJ1dHRvblllczogZmFsc2UsXHJcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfd2hpdGUgXCIgKyBub3R5Q2xhc3MsXHJcbiAgICAgIHF1ZXN0aW9uOiBjb250ZW50LFxyXG4gICAgICB0aXRsZTogdGl0bGVcclxuICAgIH07XHJcbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pXHJcbn0oKSk7XHJcbiIsIiQoJy5mb290ZXItbWVudS10aXRsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gIGlmICgkdGhpcy5oYXNDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpKSB7XHJcbiAgICAkdGhpcy5yZW1vdmVDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpXHJcbiAgfSBlbHNlIHtcclxuICAgICQoJy5mb290ZXItbWVudS10aXRsZV9vcGVuJykucmVtb3ZlQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKTtcclxuICAgICR0aGlzLmFkZENsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XHJcbiAgfVxyXG5cclxufSk7XHJcbiIsIiQoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIHN0YXJOb21pbmF0aW9uKGluZGV4KSB7XHJcbiAgICB2YXIgc3RhcnMgPSAkKFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiKTtcclxuICAgIHN0YXJzLmFkZENsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5kZXg7IGkrKykge1xyXG4gICAgICBzdGFycy5lcShpKS5yZW1vdmVDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkKGRvY3VtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIHN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xyXG4gIH0pLm9uKFwibW91c2VsZWF2ZVwiLCBcIi5yYXRpbmctd3JhcHBlclwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoKSk7XHJcbiAgfSkub24oXCJjbGlja1wiLCBcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIHN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xyXG5cclxuICAgICQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCQodGhpcykuaW5kZXgoKSArIDEpO1xyXG4gIH0pO1xyXG59KTtcclxuIiwiLy/QuNC30LHRgNCw0L3QvdC+0LVcclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICQoXCIuZmF2b3JpdGUtbGlua1wiKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIHZhciBzZWxmID0gJCh0aGlzKTtcclxuICAgIHZhciB0eXBlID0gc2VsZi5kYXRhKFwic3RhdGVcIiksXHJcbiAgICAgIGFmZmlsaWF0ZV9pZCA9IHNlbGYuZGF0YShcImFmZmlsaWF0ZS1pZFwiKSxcclxuICAgICAgcHJvZHVjdF9pZCA9IHNlbGYuZGF0YShcInByb2R1Y3QtaWRcIik7XHJcblxyXG4gICAgaWYgKCFhZmZpbGlhdGVfaWQpIHtcclxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgdGl0bGU6IGxnKFwicmVnaXN0cmF0aW9uX2lzX3JlcXVpcmVkXCIpLFxyXG4gICAgICAgIG1lc3NhZ2U6IGxnKFwiYWRkX3RvX2Zhdm9yaXRlX21heV9vbmx5X3JlZ2lzdGVyZWRfdXNlclwiKSxcclxuICAgICAgICB0eXBlOiAnZXJyJ1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2VsZi5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHNlbGYuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcblxyXG4gICAgLyppZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICBzZWxmLmZpbmQoXCIuaXRlbV9pY29uXCIpLnJlbW92ZUNsYXNzKFwibXV0ZWRcIik7XHJcbiAgICAgfSovXHJcbiAgICB2YXIgaHJlZiA9ICAkKCcjYWNjb3VudF9mYXZvcml0ZXNfbGluaycpLmF0dHIoJ2hyZWYnKTtcclxuXHJcbiAgICAkLnBvc3QoaHJlZiwge1xyXG4gICAgICBcInR5cGVcIjogdHlwZSxcclxuICAgICAgXCJhZmZpbGlhdGVfaWRcIjogYWZmaWxpYXRlX2lkLFxyXG4gICAgICBcInByb2R1Y3RfaWRcIjogcHJvZHVjdF9pZFxyXG4gICAgfSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgaWYgKGRhdGEuZXJyb3IpIHtcclxuICAgICAgICBzZWxmLmZpbmQoJ3N2ZycpLnJlbW92ZUNsYXNzKFwic3BpblwiKTtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOiBkYXRhLmVycm9yLCB0eXBlOiAnZXJyJywgJ3RpdGxlJzogKGRhdGEudGl0bGUgPyBkYXRhLnRpdGxlIDogZmFsc2UpfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICBtZXNzYWdlOiBkYXRhLm1zZyxcclxuICAgICAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICAgICAgJ3RpdGxlJzogKGRhdGEudGl0bGUgPyBkYXRhLnRpdGxlIDogZmFsc2UpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgc2VsZi5kYXRhKFwic3RhdGVcIiwgZGF0YVtcImRhdGEtc3RhdGVcIl0pO1xyXG4gICAgICBzZWxmLmRhdGEoXCJvcmlnaW5hbC10aXRsZVwiLCBkYXRhW1wiZGF0YS1vcmlnaW5hbC10aXRsZVwiXSk7XHJcbiAgICAgIHNlbGYuZmluZCgnLnRpdGxlJykuaHRtbChkYXRhW1wiZGF0YS1vcmlnaW5hbC10aXRsZVwiXSk7XHJcblxyXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb2ZmXCIpLmFkZENsYXNzKFwiaW5fZmF2X29uXCIpO1xyXG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJkZWxldGVcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gaW5fZmF2X29uXCIpLmFkZENsYXNzKFwiaW5fZmF2X29mZlwiKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sICdqc29uJykuZmFpbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgIG1lc3NhZ2U6IGxnKFwidGhlcmVfaXNfdGVjaG5pY2FsX3dvcmtzX25vd1wiKSxcclxuICAgICAgICB0eXBlOiAnZXJyJ1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmICh0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluIGluX2Zhdl9vZmZcIikuYWRkQ2xhc3MoXCJpbl9mYXZfb25cIik7XHJcbiAgICAgICAgc2VsZi5kYXRhKCdvcmlnaW5hbC10aXRsZScsIGxnKFwiZmF2b3JpdGVzX3Nob3BfcmVtb3ZlXCIrKHByb2R1Y3RfaWQgPyAnX3Byb2R1Y3QnIDogJycpKSk7XHJcbiAgICAgICAgc2VsZi5maW5kKCcudGl0bGUnKS5odG1sKGxnKFwiZmF2b3JpdGVzX3Nob3BfcmVtb3ZlXCIrKHByb2R1Y3RfaWQgPyAnX3Byb2R1Y3QnIDogJycpKSk7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRlbGV0ZVwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb25cIikuYWRkQ2xhc3MoXCJpbl9mYXZfb2ZmXCIpO1xyXG4gICAgICAgIHNlbGYuZGF0YSgnb3JpZ2luYWwtdGl0bGUnLCBsZyhcImZhdm9yaXRlc19zaG9wX2FkZFwiKyhwcm9kdWN0X2lkID8gJ19wcm9kdWN0JyA6ICcnKSkpO1xyXG4gICAgICAgIHNlbGYuZmluZCgnLnRpdGxlJykuaHRtbChsZyhcImZhdm9yaXRlc19zaG9wX2FkZFwiKyhwcm9kdWN0X2lkID8gJ19wcm9kdWN0JyA6ICcnKSkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSlcclxuICB9KTtcclxufSk7XHJcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAkKCcuc2Nyb2xsX3RvJykuY2xpY2soZnVuY3Rpb24gKGUpIHsgLy8g0LvQvtCy0LjQvCDQutC70LjQuiDQv9C+INGB0YHRi9C70LrQtSDRgSDQutC70LDRgdGB0L7QvCBnb190b1xyXG4gICAgdmFyIHNjcm9sbF9lbCA9ICQodGhpcykuYXR0cignaHJlZicpOyAvLyDQstC+0LfRjNC80LXQvCDRgdC+0LTQtdGA0LbQuNC80L7QtSDQsNGC0YDQuNCx0YPRgtCwIGhyZWYsINC00L7Qu9C20LXQvSDQsdGL0YLRjCDRgdC10LvQtdC60YLQvtGA0L7QvCwg0YIu0LUuINC90LDQv9GA0LjQvNC10YAg0L3QsNGH0LjQvdCw0YLRjNGB0Y8g0YEgIyDQuNC70LggLlxyXG4gICAgc2Nyb2xsX2VsID0gJChzY3JvbGxfZWwpO1xyXG4gICAgaWYgKHNjcm9sbF9lbC5sZW5ndGggIT0gMCkgeyAvLyDQv9GA0L7QstC10YDQuNC8INGB0YPRidC10YHRgtCy0L7QstCw0L3QuNC1INGN0LvQtdC80LXQvdGC0LAg0YfRgtC+0LHRiyDQuNC30LHQtdC20LDRgtGMINC+0YjQuNCx0LrQuFxyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IHNjcm9sbF9lbC5vZmZzZXQoKS50b3AgLSAkKCcjaGVhZGVyPionKS5lcSgwKS5oZWlnaHQoKSAtIDUwfSwgNTAwKTsgLy8g0LDQvdC40LzQuNGA0YPQtdC8INGB0LrRgNC+0L7Qu9C40L3QsyDQuiDRjdC70LXQvNC10L3RgtGDIHNjcm9sbF9lbFxyXG4gICAgICBpZiAoc2Nyb2xsX2VsLmhhc0NsYXNzKCdhY2NvcmRpb24nKSAmJiAhc2Nyb2xsX2VsLmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgICAgICBzY3JvbGxfZWwuZmluZCgnLmFjY29yZGlvbi1jb250cm9sJykuY2xpY2soKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlOyAvLyDQstGL0LrQu9GO0YfQsNC10Lwg0YHRgtCw0L3QtNCw0YDRgtC90L7QtSDQtNC10LnRgdGC0LLQuNC1XHJcbiAgfSk7XHJcbn0pO1xyXG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgJChcImJvZHlcIikub24oJ2NsaWNrJywgJy5zZXRfY2xpcGJvYXJkJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICBjb3B5VG9DbGlwYm9hcmQoJHRoaXMuZGF0YSgnY2xpcGJvYXJkJyksICR0aGlzLmRhdGEoJ2NsaXBib2FyZC1ub3RpZnknKSk7XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGNvcHlUb0NsaXBib2FyZChjb2RlLCBtc2cpIHtcclxuICAgIHZhciAkdGVtcCA9ICQoXCI8aW5wdXQ+XCIpO1xyXG4gICAgJChcImJvZHlcIikuYXBwZW5kKCR0ZW1wKTtcclxuICAgICR0ZW1wLnZhbChjb2RlKS5zZWxlY3QoKTtcclxuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiY29weVwiKTtcclxuICAgICR0ZW1wLnJlbW92ZSgpO1xyXG5cclxuICAgIGlmICghbXNnKSB7XHJcbiAgICAgIG1zZyA9IGxnKFwiZGF0YV9jb3BpZWRfdG9fY2xpcGJvYXJkXCIpO1xyXG4gICAgfVxyXG4gICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7J3R5cGUnOiAnaW5mbycsICdtZXNzYWdlJzogbXNnLCAndGl0bGUnOiBsZygnc3VjY2VzcycpfSlcclxuICB9XHJcblxyXG4gICQoXCJib2R5XCIpLm9uKCdjbGljaycsIFwiaW5wdXQubGlua1wiLCBmdW5jdGlvbiAoKSB7XHQvLyDQv9C+0LvRg9GH0LXQvdC40LUg0YTQvtC60YPRgdCwINGC0LXQutGB0YLQvtCy0YvQvCDQv9C+0LvQtdC8LdGB0YHRi9C70LrQvtC5XHJcbiAgICAkKHRoaXMpLnNlbGVjdCgpO1xyXG4gIH0pO1xyXG59KTtcclxuIiwiLy/RgdC60LDRh9C40LLQsNC90LjQtSDQutCw0YDRgtC40L3QvtC6XHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCkge1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGltZyA9IGRhdGEuaW1nO1xyXG4gICAgaW1nLndyYXAoJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPjwvZGl2PicpO1xyXG4gICAgdmFyIHdyYXAgPSBpbWcucGFyZW50KCk7XHJcbiAgICAkKCcuZG93bmxvYWRfdGVzdCcpLmFwcGVuZChkYXRhLmVsKTtcclxuICAgIHNpemUgPSBkYXRhLmVsLndpZHRoKCkgKyBcInhcIiArIGRhdGEuZWwuaGVpZ2h0KCk7XHJcblxyXG4gICAgdz1kYXRhLmVsLndpZHRoKCkqMC44O1xyXG4gICAgaW1nXHJcbiAgICAgIC5oZWlnaHQoJ2F1dG8nKVxyXG4gICAgICAvLy53aWR0aCh3KVxyXG4gICAgICAuY3NzKCdtYXgtd2lkdGgnLCc5OSUnKTtcclxuXHJcblxyXG4gICAgZGF0YS5lbC5yZW1vdmUoKTtcclxuICAgIHdyYXAuYXBwZW5kKCc8c3Bhbj4nICsgc2l6ZSArICc8L3NwYW4+IDxhIGhyZWY9XCInICsgZGF0YS5zcmMgKyAnXCIgZG93bmxvYWQ+JytsZyhcImRvd25sb2FkXCIpKyc8L2E+Jyk7XHJcbiAgfVxyXG5cclxuICB2YXIgaW1ncyA9ICQoJy5kb3dubG9hZHNfaW1nIGltZycpO1xyXG4gIGlmKGltZ3MubGVuZ3RoPT0wKXJldHVybjtcclxuXHJcbiAgJCgnYm9keScpLmFwcGVuZCgnPGRpdiBjbGFzcz1kb3dubG9hZF90ZXN0PjwvZGl2PicpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGltZyA9IGltZ3MuZXEoaSk7XHJcbiAgICB2YXIgc3JjID0gaW1nLmF0dHIoJ3NyYycpO1xyXG4gICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XHJcbiAgICAgIHNyYzogc3JjXHJcbiAgICB9KTtcclxuICAgIGRhdGEgPSB7XHJcbiAgICAgIHNyYzogc3JjLFxyXG4gICAgICBpbWc6IGltZyxcclxuICAgICAgZWw6IGltYWdlXHJcbiAgICB9O1xyXG4gICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcclxuICB9XHJcbn0pKCk7XHJcblxyXG4vL9GH0YLQviDQsSDQuNGE0YDQtdC50LzRiyDQuCDQutCw0YDRgtC40L3QutC4INC90LUg0LLRi9C70LDQt9C40LvQuFxyXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gIC8qbV93ID0gJCgnLnRleHQtY29udGVudCcpLndpZHRoKClcclxuICAgaWYgKG1fdyA8IDUwKW1fdyA9IHNjcmVlbi53aWR0aCAtIDQwKi9cclxuICB2YXIgbXc9c2NyZWVuLndpZHRoLTQwO1xyXG5cclxuICBmdW5jdGlvbiBvcHRpbWFzZShlbCl7XHJcbiAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50KCk7XHJcbiAgICBpZihwYXJlbnQubGVuZ3RoPT0wIHx8IHBhcmVudFswXS50YWdOYW1lPT1cIkFcIil7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmKGVsLmhhc0NsYXNzKCdub19vcHRvbWl6ZScpKXJldHVybjtcclxuXHJcbiAgICBtX3cgPSBwYXJlbnQud2lkdGgoKS0zMDtcclxuICAgIHZhciB3PWVsLndpZHRoKCk7XHJcblxyXG4gICAgLy/QsdC10Lcg0Y3RgtC+0LPQviDQv9C70Y7RidC40YIg0LHQsNC90LXRgNGLINCyINCw0LrQsNGA0LTQuNC+0L3QtVxyXG4gICAgaWYodzwzIHx8IG1fdzwzKXtcclxuICAgICAgZWxcclxuICAgICAgICAuaGVpZ2h0KCdhdXRvJylcclxuICAgICAgICAuY3NzKCdtYXgtd2lkdGgnLCc5OSUnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGVsLndpZHRoKCdhdXRvJyk7XHJcbiAgICBpZihlbFswXS50YWdOYW1lPT1cIklNR1wiICYmIHc+ZWwud2lkdGgoKSl3PWVsLndpZHRoKCk7XHJcblxyXG4gICAgaWYgKG13PjUwICYmIG1fdyA+IG13KW1fdyA9IG13O1xyXG4gICAgaWYgKHc+bV93KSB7XHJcbiAgICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpe1xyXG4gICAgICAgIGsgPSB3IC8gbV93O1xyXG4gICAgICAgIGVsLmhlaWdodChlbC5oZWlnaHQoKSAvIGspO1xyXG4gICAgICB9XHJcbiAgICAgIGVsLndpZHRoKG1fdylcclxuICAgIH1lbHNle1xyXG4gICAgICBlbC53aWR0aCh3KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xyXG4gICAgdmFyIGVsPSQodGhpcyk7XHJcbiAgICBvcHRpbWFzZShlbCk7XHJcbiAgfVxyXG5cclxuICB2YXIgcCA9ICQoJy5jb250ZW50LXdyYXAgaW1nLC5jb250ZW50LXdyYXAgaWZyYW1lJyk7XHJcbiAgJCgnLmNvbnRlbnQtd3JhcCBpbWc6bm90KC5ub19vcHRvbWl6ZSknKS5oZWlnaHQoJ2F1dG8nKTtcclxuICAvLyQoJy5jb250YWluZXIgaW1nJykud2lkdGgoJ2F1dG8nKTtcclxuICBmb3IgKGkgPSAwOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgZWwgPSBwLmVxKGkpO1xyXG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIikge1xyXG4gICAgICBvcHRpbWFzZShlbCk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgdmFyIHNyYz1lbC5hdHRyKCdzcmMnKTtcclxuICAgICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XHJcbiAgICAgICAgc3JjOiBzcmNcclxuICAgICAgfSk7XHJcbiAgICAgIGltYWdlLm9uKCdsb2FkJywgaW1nX2xvYWRfZmluaXNoLmJpbmQoZWwpKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuXHJcbi8v0J/RgNC+0LLQtdGA0LrQsCDQsdC40YLRiyDQutCw0YDRgtC40L3QvtC6LlxyXG4vLyAhISEhISFcclxuLy8g0J3Rg9C20L3QviDQv9GA0L7QstC10YDQuNGC0YwuINCS0YvQt9GL0LLQsNC70L4g0LPQu9GO0LrQuCDQv9GA0Lgg0LDQstGC0L7RgNC30LDRhtC40Lgg0YfQtdGA0LXQtyDQpNCRINC90LAg0YHQsNGE0LDRgNC4XHJcbi8vICEhISEhIVxyXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xyXG4gICAgdmFyIGRhdGE9dGhpcztcclxuICAgIGlmKGRhdGEudGFnTmFtZSl7XHJcbiAgICAgIGRhdGE9JChkYXRhKS5kYXRhKCdkYXRhJyk7XHJcbiAgICB9XHJcbiAgICB2YXIgaW1nPWRhdGEuaW1nO1xyXG4gICAgLy92YXIgdG49aW1nWzBdLnRhZ05hbWU7XHJcbiAgICAvL2lmICh0biE9J0lNRyd8fHRuIT0nRElWJ3x8dG4hPSdTUEFOJylyZXR1cm47XHJcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcclxuICAgICAgaW1nLmF0dHIoJ3NyYycsIGRhdGEuc3JjKTtcclxuICAgICAgaW1nLnJlbW92ZUNsYXNzKGRhdGEubG9hZGluZ0NsYXNzKTtcclxuICAgIH1lbHNle1xyXG4gICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XHJcbiAgICAgIGltZy5yZW1vdmVDbGFzcygnbm9fYXZhJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB0ZXN0SW1nKGltZ3MsIG5vX2ltZywgbG9hZGluZ0NsYXNzKXtcclxuICAgIGlmKCFpbWdzIHx8IGltZ3MubGVuZ3RoPT0wKXJldHVybjtcclxuICAgIGxvYWRpbmdDbGFzcyA9IGxvYWRpbmdDbGFzcyB8fCBmYWxzZTtcclxuICAgIGlmKCFub19pbWcpbm9faW1nPScvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJztcclxuXHJcbiAgICBmb3IgKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspe1xyXG4gICAgICB2YXIgaW1nPWltZ3MuZXEoaSk7XHJcbiAgICAgIGlmKGltZy5oYXNDbGFzcygnbm9fYXZhJykpe1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZGF0YT17XHJcbiAgICAgICAgaW1nOmltZ1xyXG4gICAgICB9O1xyXG4gICAgICB2YXIgc3JjO1xyXG4gICAgICBpZihpbWdbMF0udGFnTmFtZT09XCJJTUdcIil7XHJcbiAgICAgICAgZGF0YS50eXBlPTA7XHJcbiAgICAgICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcclxuICAgICAgICBpbWcuYXR0cignc3JjJyxub19pbWcpO1xyXG4gICAgICAgIGRhdGEubG9hZGluZ0NsYXNzID0gbG9hZGluZ0NsYXNzID8gbG9hZGluZ0NsYXNzIDogJyc7XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIGRhdGEudHlwZT0xO1xyXG4gICAgICAgIHNyYz1pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyk7XHJcbiAgICAgICAgaWYoIXNyYyljb250aW51ZTtcclxuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybChcIicsJycpO1xyXG4gICAgICAgIHNyYz1zcmMucmVwbGFjZSgnXCIpJywnJyk7XHJcbiAgICAgICAgLy/QsiDRgdGE0YTQsNGA0Lgg0LIg0LzQsNC6INC+0YEg0LHQtdC3INC60L7QstGL0YfQtdC6LiDQstC10LfQtNC1INGBINC60LDQstGL0YfQutCw0LzQuFxyXG4gICAgICAgIHNyYz1zcmMucmVwbGFjZSgndXJsKCcsJycpO1xyXG4gICAgICAgIHNyYz1zcmMucmVwbGFjZSgnKScsJycpO1xyXG4gICAgICAgIGltZy5hZGRDbGFzcygnbm9fYXZhJyk7XHJcbiAgICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK25vX2ltZysnKScpO1xyXG4gICAgICB9XHJcbiAgICAgIGRhdGEuc3JjPXNyYztcclxuICAgICAgdmFyIGltYWdlPSQoJzxpbWcvPicse1xyXG4gICAgICAgIHNyYzpzcmNcclxuICAgICAgfSkub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSk7XHJcbiAgICAgIGltYWdlLmRhdGEoJ2RhdGEnLGRhdGEpO1xyXG4gICAgICBpZiAobG9hZGluZ0NsYXNzKSB7XHJcbiAgICAgICAgaW1nLmFkZENsYXNzKGxvYWRpbmdDbGFzcyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8v0YLQtdGB0YIg0LvQvtCz0L4g0LzQsNCz0LDQt9C40L3QsFxyXG4gIHZhciBpbWdzPSQoJ3NlY3Rpb246bm90KC5uYXZpZ2F0aW9uKScpO1xyXG4gIGltZ3M9aW1ncy5maW5kKCcubG9nbyBpbWcnKTtcclxuICB0ZXN0SW1nKGltZ3MsJy9pbWFnZXMvdGVtcGxhdGUtbG9nby5qcGcnKTtcclxuXHJcbiAgLy/RgtC10YHRgiDQsNCy0LDRgtCw0YDQvtC6INCyINC60L7QvNC10L3RgtCw0YDQuNGP0YVcclxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvLC5zY3JvbGxfYm94LWF2YXRhcicpO1xyXG4gIHRlc3RJbWcoaW1ncywnL2ltYWdlcy9ub19hdmFfc3F1YXJlLnBuZycpO1xyXG5cclxuICAvL9GC0LXRgdGCINC60LDRgNGC0LjQvdC+0Log0L/RgNC+0LTRg9C60YLQvtCyXHJcbiAgaW1ncyA9ICQoJy5jYXRhbG9nX3Byb2R1Y3RzX2l0ZW1faW1hZ2Utd3JhcCBpbWcnKTtcclxuICB0ZXN0SW1nKGltZ3MsICcvaW1hZ2VzLycrbGFuZy5rZXkrJy1uby1pbWFnZS5wbmcnKTtcclxuXHJcbn0pO1xyXG4iLCIvL9C10YHQu9C4INC+0YLQutGA0YvRgtC+INC60LDQuiDQtNC+0YfQtdGA0L3QtdC1XHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgaWYgKCF3aW5kb3cub3BlbmVyKXJldHVybjtcclxuICB0cnkge1xyXG4gICAgaHJlZiA9IHdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZjtcclxuICAgIGlmIChcclxuICAgICAgaHJlZi5pbmRleE9mKCcvYWNjb3VudC9vZmZsaW5lJykgPiAwXHJcbiAgICApIHtcclxuICAgICAgd2luZG93LnByaW50KClcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZG9jdW1lbnQucmVmZXJyZXIuaW5kZXhPZignc2VjcmV0ZGlzY291bnRlcicpIDwgMClyZXR1cm47XHJcblxyXG4gICAgaWYgKFxyXG4gICAgICBocmVmLmluZGV4T2YoJ3NvY2lhbHMnKSA+IDAgfHxcclxuICAgICAgaHJlZi5pbmRleE9mKCdsb2dpbicpID4gMCB8fFxyXG4gICAgICBocmVmLmluZGV4T2YoJ2FkbWluJykgPiAwIHx8XHJcbiAgICAgIGhyZWYuaW5kZXhPZignYWNjb3VudCcpID4gMFxyXG4gICAgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaHJlZi5pbmRleE9mKCdzdG9yZScpID4gMCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpID4gMCB8fCBocmVmLmluZGV4T2YoJ3NldHRpbmdzJykgPiAwKSB7XHJcbiAgICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xyXG4gICAgfVxyXG4gICAgd2luZG93LmNsb3NlKCk7XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcblxyXG4gIH1cclxufSkoKTtcclxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgdmFyIGZpbGUgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcclxuICAgIHZhciBmID0gZmlsZVswXTtcclxuICAgIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cclxuICAgIGlmICghZi50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgZGF0YSA9IHtcclxuICAgICAgJ2VsJzogdGhpcyxcclxuICAgICAgJ2YnOiBmXHJcbiAgICB9O1xyXG4gICAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpbWcgPSAkKCdbZm9yPVwiJyArIGRhdGEuZWwubmFtZSArICdcIl0nKTtcclxuICAgICAgICBpZiAoaW1nLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGltZy5hdHRyKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfSkoZGF0YSk7XHJcbiAgICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXHJcbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmR1YmxpY2F0ZV92YWx1ZScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHNlbCA9ICQoJHRoaXMuZGF0YSgnc2VsZWN0b3InKSk7XHJcbiAgICBzZWwudmFsKHRoaXMudmFsdWUpO1xyXG4gIH0pXHJcbn0pO1xyXG4iLCJcclxuZnVuY3Rpb24gZ2V0Q29va2llKG4pIHtcclxuICByZXR1cm4gdW5lc2NhcGUoKFJlZ0V4cChuICsgJz0oW147XSspJykuZXhlYyhkb2N1bWVudC5jb29raWUpIHx8IFsxLCAnJ10pWzFdKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsIHZhbHVlLCBkYXlzKSB7XHJcbiAgdmFyIGV4cGlyZXMgPSAnJztcclxuICBpZiAoZGF5cykge1xyXG4gICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlO1xyXG4gICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBkYXlzKTtcclxuICAgICAgZXhwaXJlcyA9ICc7IGV4cGlyZXM9JyArIGRhdGUudG9VVENTdHJpbmcoKTtcclxuICB9XHJcbiAgZG9jdW1lbnQuY29va2llID0gbmFtZSArIFwiPVwiICsgZXNjYXBlICggdmFsdWUgKSArIGV4cGlyZXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVyYXNlQ29va2llKG5hbWUpe1xyXG4gIHZhciBjb29raWVfc3RyaW5nID0gbmFtZSArIFwiPTBcIiArXCI7IGV4cGlyZXM9V2VkLCAwMSBPY3QgMjAxNyAwMDowMDowMCBHTVRcIjtcclxuICBkb2N1bWVudC5jb29raWUgPSBjb29raWVfc3RyaW5nO1xyXG59XHJcblxyXG5kb2N1bWVudC5jb29raWUuc3BsaXQoXCI7XCIpLmZvckVhY2goZnVuY3Rpb24oYykgeyBkb2N1bWVudC5jb29raWUgPSBjLnJlcGxhY2UoL14gKy8sIFwiXCIpLnJlcGxhY2UoLz0uKi8sIFwiPTtleHBpcmVzPVwiICsgbmV3IERhdGUoKS50b1VUQ1N0cmluZygpICsgXCI7cGF0aD0vXCIpOyB9KTtcclxuXHJcblxyXG5mdW5jdGlvbiBzZXRDb29raWVBamF4KG5hbWUsIHZhbHVlLCBkYXlzKSB7XHJcbiAgICAkLnBvc3QobGFuZy5ocmVmX3ByZWZpeCsnL2Nvb2tpZScsIHtuYW1lOm5hbWUsIHZhbHVlOnZhbHVlLCBkYXlzOmRheXN9LCBmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICBpZiAoZGF0YS5lcnJvciAhPT0gMCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9LCAnanNvbicpO1xyXG59IiwiKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50KSB7XHJcbiAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gIHZhciB0YWJsZXMgPSAkKCd0YWJsZS5hZGFwdGl2ZScpO1xyXG5cclxuICBpZiAodGFibGVzLmxlbmd0aCA9PSAwKXJldHVybjtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IHRhYmxlcy5sZW5ndGggPiBpOyBpKyspIHtcclxuICAgIHZhciB0YWJsZSA9IHRhYmxlcy5lcShpKTtcclxuICAgIHZhciB0aCA9IHRhYmxlLmZpbmQoJ3RoZWFkJyk7XHJcbiAgICBpZiAodGgubGVuZ3RoID09IDApIHtcclxuICAgICAgdGggPSB0YWJsZS5maW5kKCd0cicpLmVxKDApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGggPSB0aC5maW5kKCd0cicpLmVxKDApO1xyXG4gICAgfVxyXG4gICAgdGggPSB0aC5hZGRDbGFzcygndGFibGUtaGVhZGVyJykuZmluZCgndGQsdGgnKTtcclxuXHJcbiAgICB2YXIgdHIgPSB0YWJsZS5maW5kKCd0cicpLm5vdCgnLnRhYmxlLWhlYWRlcicpO1xyXG5cclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGgubGVuZ3RoOyBqKyspIHtcclxuICAgICAgdmFyIGsgPSBqICsgMTtcclxuICAgICAgdmFyIHRkID0gdHIuZmluZCgndGQ6bnRoLWNoaWxkKCcgKyBrICsgJyknKTtcclxuICAgICAgdGQuYXR0cignbGFiZWwnLCB0aC5lcShqKS50ZXh0KCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xyXG4iLCI7XHJcbiQoZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gb25SZW1vdmUoKXtcclxuICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICBwb3N0PXtcclxuICAgICAgaWQ6JHRoaXMuYXR0cigndWlkJyksXHJcbiAgICAgIHR5cGU6JHRoaXMuYXR0cignbW9kZScpXHJcbiAgICB9O1xyXG4gICAgJC5wb3N0KCR0aGlzLmF0dHIoJ3VybCcpLHBvc3QsZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgIGlmKGRhdGEgJiYgZGF0YT09J2Vycicpe1xyXG4gICAgICAgIG1zZz0kdGhpcy5kYXRhKCdyZW1vdmUtZXJyb3InKTtcclxuICAgICAgICBpZighbXNnKXtcclxuICAgICAgICAgIG1zZz0n0J3QtdCy0L7Qt9C80L7QttC90L4g0YPQtNCw0LvQuNGC0Ywg0Y3Qu9C10LzQtdC90YInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOm1zZyx0eXBlOidlcnInfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtb2RlPSR0aGlzLmF0dHIoJ21vZGUnKTtcclxuICAgICAgaWYoIW1vZGUpe1xyXG4gICAgICAgIG1vZGU9J3JtJztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYobW9kZT09J3JtJykge1xyXG4gICAgICAgIHJtID0gJHRoaXMuY2xvc2VzdCgnLnRvX3JlbW92ZScpO1xyXG4gICAgICAgIHJtX2NsYXNzID0gcm0uYXR0cigncm1fY2xhc3MnKTtcclxuICAgICAgICBpZiAocm1fY2xhc3MpIHtcclxuICAgICAgICAgICQocm1fY2xhc3MpLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcm0ucmVtb3ZlKCk7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0KPRgdC/0LXRiNC90L7QtSDRg9C00LDQu9C10L3QuNC1LicsdHlwZTonaW5mbyd9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmKG1vZGU9PSdyZWxvYWQnKXtcclxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICBsb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XHJcbiAgICAgIH1cclxuICAgIH0pLmZhaWwoZnVuY3Rpb24oKXtcclxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J7RiNC40LHQutCwINGD0LTQsNC70L3QuNGPJyx0eXBlOidlcnInfSk7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5hamF4X3JlbW92ZScsZnVuY3Rpb24oKXtcclxuICAgIG5vdGlmaWNhdGlvbi5jb25maXJtKHtcclxuICAgICAgY2FsbGJhY2tZZXM6b25SZW1vdmUsXHJcbiAgICAgIG9iajokKHRoaXMpLFxyXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibm90aWZ5X2JveC1hbGVydFwiXHJcbiAgICB9KVxyXG4gIH0pO1xyXG5cclxufSk7XHJcblxyXG4iLCJpZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XHJcbiAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAob1RoaXMpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAvLyDQsdC70LjQttCw0LnRiNC40Lkg0LDQvdCw0LvQvtCzINCy0L3Rg9GC0YDQtdC90L3QtdC5INGE0YPQvdC60YbQuNC4XHJcbiAgICAgIC8vIElzQ2FsbGFibGUg0LIgRUNNQVNjcmlwdCA1XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcclxuICAgICAgZlRvQmluZCA9IHRoaXMsXHJcbiAgICAgIGZOT1AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIH0sXHJcbiAgICAgIGZCb3VuZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUCAmJiBvVGhpc1xyXG4gICAgICAgICAgICA/IHRoaXNcclxuICAgICAgICAgICAgOiBvVGhpcyxcclxuICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcclxuICAgIGZCb3VuZC5wcm90b3R5cGUgPSBuZXcgZk5PUCgpO1xyXG5cclxuICAgIHJldHVybiBmQm91bmQ7XHJcbiAgfTtcclxufVxyXG5cclxuaWYgKCFTdHJpbmcucHJvdG90eXBlLnRyaW0pIHtcclxuICAoZnVuY3Rpb24oKSB7XHJcbiAgICAvLyDQktGL0YDQtdC30LDQtdC8IEJPTSDQuCDQvdC10YDQsNC30YDRi9Cy0L3Ri9C5INC/0YDQvtCx0LXQu1xyXG4gICAgU3RyaW5nLnByb3RvdHlwZS50cmltID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL15bXFxzXFx1RkVGRlxceEEwXSt8W1xcc1xcdUZFRkZcXHhBMF0rJC9nLCAnJyk7XHJcbiAgICB9O1xyXG4gIH0pKCk7XHJcbn0iLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5oaWRkZW4tbGluaycpLnJlcGxhY2VXaXRoKGZ1bmN0aW9uICgpIHtcclxuICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgIHJldHVybiAnPGEgaHJlZj1cIicgKyAkdGhpcy5kYXRhKCdsaW5rJykgKyAnXCIgcmVsPVwiJysgJHRoaXMuZGF0YSgncmVsJykgKydcIiBjbGFzcz1cIicgKyAkdGhpcy5hdHRyKCdjbGFzcycpICsgJ1wiPicgKyAkdGhpcy50ZXh0KCkgKyAnPC9hPic7XHJcbiAgfSlcclxufSkoKTtcclxuIiwidmFyIHN0b3JlX3BvaW50cyA9IChmdW5jdGlvbigpe1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBjaGFuZ2VDb3VudHJ5KCl7XHJcbiAgICAgICAgdmFyIHRoYXQgPSAkKCcjc3RvcmVfcG9pbnRfY291bnRyeScpO1xyXG4gICAgICAgIGlmICh0aGF0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZWN0T3B0aW9ucyA9ICQodGhhdCkuZmluZCgnb3B0aW9uJyk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgdGhhdCkuZGF0YSgnY2l0aWVzJyksXHJcbiAgICAgICAgICAgICAgICBwb2ludHMgPSAkKCcjc3RvcmUtcG9pbnRzJyksXHJcbiAgICAgICAgICAgICAgICBjb3VudHJ5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgdGhhdCkuYXR0cigndmFsdWUnKTtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdE9wdGlvbnMubGVuZ3RoID4gMSAmJiBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RvcmVfcG9pbnRfY2l0eScpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdmFyIG9wdGlvbnMgPSAnPG9wdGlvbiB2YWx1ZT1cIlwiPtCS0YvQsdC10YDQuNGC0LUg0LPQvtGA0L7QtDwvb3B0aW9uPic7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyArPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyBpdGVtICsgJ1wiPicgKyBpdGVtICsgJzwvb3B0aW9uPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0LmlubmVySFRNTCA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8kKHBvaW50cykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICAvLyBnb29nbGVNYXAuc2hvd01hcCgpO1xyXG4gICAgICAgICAgICAvLyBnb29nbGVNYXAuc2hvd01hcmtlcihjb3VudHJ5LCAnJyk7XHJcbiAgICAgICAgICAgIGNoYW5nZUNpdHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoYW5nZUNpdHkoKXtcclxuICAgICAgICBpZiAodHlwZW9mIGdvb2dsZU1hcCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgdGhhdCA9ICQoJyNzdG9yZV9wb2ludF9jaXR5Jyk7XHJcbiAgICAgICAgaWYgKHRoYXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZhciBjaXR5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgdGhhdCkuYXR0cigndmFsdWUnKSxcclxuICAgICAgICAgICAgICAgIGNvdW50cnkgPSAkKCdvcHRpb246c2VsZWN0ZWQnLCAkKCcjc3RvcmVfcG9pbnRfY291bnRyeScpKS5hdHRyKCd2YWx1ZScpLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRzID0gJCgnI3N0b3JlLXBvaW50cycpO1xyXG4gICAgICAgICAgICBpZiAoY291bnRyeSAmJiBjaXR5KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBwb2ludHMuZmluZCgnLnN0b3JlLXBvaW50c19fcG9pbnRzX3JvdycpLFxyXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwLnNob3dNYXJrZXIoY291bnRyeSwgY2l0eSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJC5lYWNoKGl0ZW1zLCBmdW5jdGlvbiAoaW5kZXgsIGRpdikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkKGRpdikuZGF0YSgnY2l0eScpID09IGNpdHkgJiYgJChkaXYpLmRhdGEoJ2NvdW50cnknKSA9PSBjb3VudHJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZGl2KS5yZW1vdmVDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHNfcm93LWhpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGRpdikuYWRkQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzX3Jvdy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICh2aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChwb2ludHMpLnJlbW92ZUNsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50cy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXAuc2hvd01hcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChwb2ludHMpLmFkZENsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50cy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGVNYXAuaGlkZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChwb2ludHMpLmFkZENsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50cy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5oaWRlTWFwKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy/QtNC70Y8g0YLQvtGH0LXQuiDQv9GA0L7QtNCw0LYsINGB0L7QsdGL0YLQuNGPINC90LAg0LLRi9Cx0L7RgCDRgdC10LvQtdC60YLQvtCyXHJcbiAgICB2YXIgYm9keSA9ICQoJ2JvZHknKTtcclxuXHJcbiAgICAkKGJvZHkpLm9uKCdjaGFuZ2UnLCAnI3N0b3JlX3BvaW50X2NvdW50cnknLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgY2hhbmdlQ291bnRyeSgpO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgICQoYm9keSkub24oJ2NoYW5nZScsICcjc3RvcmVfcG9pbnRfY2l0eScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBjaGFuZ2VDaXR5KCk7XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgY2hhbmdlQ291bnRyeSgpO1xyXG5cclxuXHJcbn0pKCk7XHJcblxyXG5cclxuXHJcblxyXG4iLCJ2YXIgaGFzaFRhZ3MgPSAoZnVuY3Rpb24oKXtcclxuXHJcbiAgICBmdW5jdGlvbiBsb2NhdGlvbkhhc2goKSB7XHJcbiAgICAgICAgdmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcclxuXHJcbiAgICAgICAgaWYgKGhhc2ggIT0gXCJcIikge1xyXG4gICAgICAgICAgICB2YXIgaGFzaEJvZHkgPSBoYXNoLnNwbGl0KFwiP1wiKTtcclxuICAgICAgICAgICAgaWYgKGhhc2hCb2R5WzFdKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBsb2NhdGlvbi5vcmlnaW4gKyBsb2NhdGlvbi5wYXRobmFtZSArICc/JyArIGhhc2hCb2R5WzFdICsgaGFzaEJvZHlbMF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlua3MgPSAkKCdhW2hyZWY9XCInICsgaGFzaEJvZHlbMF0gKyAnXCJdLm1vZGFsc19vcGVuJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAobGlua3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChsaW5rc1swXSkuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICBsb2NhdGlvbkhhc2goKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGxvY2F0aW9uSGFzaCgpXHJcblxyXG59KSgpOyIsInZhciBwbHVnaW5zID0gKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgaWNvbkNsb3NlID0gJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHg9XCIwcHhcIiB5PVwiMHB4XCIgd2lkdGg9XCIxMnB4XCIgaGVpZ2h0PVwiMTJweFwiIHZpZXdCb3g9XCIwIDAgMzU3IDM1N1wiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzNTcgMzU3O1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+PGc+JytcclxuICAgICAgICAnPGcgaWQ9XCJjbG9zZVwiPjxwb2x5Z29uIHBvaW50cz1cIjM1NywzNS43IDMyMS4zLDAgMTc4LjUsMTQyLjggMzUuNywwIDAsMzUuNyAxNDIuOCwxNzguNSAwLDMyMS4zIDM1LjcsMzU3IDE3OC41LDIxNC4yIDMyMS4zLDM1NyAzNTcsMzIxLjMgICAgIDIxNC4yLDE3OC41ICAgXCIgZmlsbD1cIiNGRkZGRkZcIi8+JytcclxuICAgICAgICAnPC9zdmc+JztcclxuICAgIHZhciB0ZW1wbGF0ZT0nPGRpdiBjbGFzcz1cInBhZ2Utd3JhcCBpbnN0YWxsLXBsdWdpbl9pbm5lclwiPicrXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImluc3RhbGwtcGx1Z2luX3RleHRcIj57e3RleHR9fTwvZGl2PicrXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImluc3RhbGwtcGx1Z2luX2J1dHRvbnNcIj4nK1xyXG4gICAgICAgICAgICAgICAgICAgICc8YSBjbGFzcz1cImJ0biBidG4tbWluaSBidG4tcm91bmQgaW5zdGFsbC1wbHVnaW5fYnV0dG9uXCIgIGhyZWY9XCJ7e2hyZWZ9fVwiIHRhcmdldD1cIl9ibGFua1wiPnt7dGl0bGV9fTwvYT4nK1xyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiaW5zdGFsbC1wbHVnaW5fYnV0dG9uLWNsb3NlXCI+JytpY29uQ2xvc2UrJzwvZGl2PicrXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JytcclxuICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICB2YXIgcGx1Z2luSW5zdGFsbERpdkNsYXNzID0gJ2luc3RhbGwtcGx1Z2luLWluZGV4JztcclxuICAgIHZhciBwbHVnaW5JbnN0YWxsRGl2QWNjb3VudENsYXNzID0gJ2luc3RhbGwtcGx1Z2luLWFjY291bnQnO1xyXG4gICAgdmFyIGNvb2tpZVBhbmVsSGlkZGVuID0gJ3NkLWluc3RhbGwtcGx1Z2luLWhpZGRlbic7XHJcbiAgICB2YXIgY29va2llQWNjb3VudERpdkhpZGRlbiA9ICdzZC1pbnN0YWxsLXBsdWdpbi1hY2NvdW50LWhpZGRlbic7XHJcbiAgICB2YXIgaXNPcGVyYSA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignIE9QUi8nKSA+PSAwO1xyXG4gICAgdmFyIGlzWWFuZGV4ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCcgWWFCcm93c2VyLycpID49IDA7XHJcbiAgICB2YXIgZXh0ZW5zaW9ucyA9IHtcclxuICAgICAgICAnY2hyb21lJzoge1xyXG4gICAgICAgICAgICAnZGl2X2lkJzogJ3NkX2Nocm9tZV9hcHAnLFxyXG4gICAgICAgICAgICAndXNlZCc6ICEhd2luZG93LmNocm9tZSAmJiB3aW5kb3cuY2hyb21lLndlYnN0b3JlICE9PSBudWxsICYmICFpc09wZXJhICYmICFpc1lhbmRleCxcclxuICAgICAgICAgICAgLy8ndGV4dCc6IGxnKFwiaW5zdGFsbF9wbHVnaW5fYW5kX2l0X3dpbGxfbm90aWNlX2Fib3V0X2Nhc2hiYWNrXCIpLFxyXG4gICAgICAgICAgICAnaHJlZic6ICdodHRwczovL2Nocm9tZS5nb29nbGUuY29tL3dlYnN0b3JlL2RldGFpbC9zZWNyZXRkaXNjb3VudGVycnUtJUUyJTgwJTkzLSVEMCVCQSVEMSU4RCVEMSU4OCVEMCVCMS9tY29saGhlbWZhY3BvYWdoamlkaGxpZWNwaWFucG5qbicsXHJcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay1jaHJvbWUnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnZmlyZWZveCc6IHtcclxuICAgICAgICAgICAgJ2Rpdl9pZCc6ICdzZF9maXJlZm94X2FwcCcsXHJcbiAgICAgICAgICAgICd1c2VkJzogIHR5cGVvZiBJbnN0YWxsVHJpZ2dlciAhPT0gJ3VuZGVmaW5lZCcsXHJcbiAgICAgICAgICAgIC8vJ3RleHQnOmxnKFwiaW5zdGFsbF9wbHVnaW5fYW5kX2l0X3dpbGxfbm90aWNlX2Fib3V0X2Nhc2hiYWNrXCIpLFxyXG4gICAgICAgICAgICAvLydocmVmJzogJ2h0dHBzOi8vYWRkb25zLm1vemlsbGEub3JnL3J1L2ZpcmVmb3gvYWRkb24vc2VjcmV0ZGlzY291bnRlci0lRDAlQkElRDElOEQlRDElODglRDAlQjElRDElOEQlRDAlQkEtJUQxJTgxJUQwJUI1JUQxJTgwJUQwJUIyJUQwJUI4JUQxJTgxLycsXHJcbiAgICAgICAgICAgICdocmVmJzogJ2h0dHBzOi8vYWRkb25zLm1vemlsbGEub3JnL3J1L2ZpcmVmb3gvYWRkb24vc2VjcmV0ZGlzY291bnRlci1jYXNoYmFjaycsXHJcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay1maXJlZm94J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ29wZXJhJzoge1xyXG4gICAgICAgICAgICAnZGl2X2lkJzogJ3NkX29wZXJhX2FwcCcsXHJcbiAgICAgICAgICAgICd1c2VkJzogaXNPcGVyYSxcclxuICAgICAgICAgICAgLy8ndGV4dCc6bGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIiksXHJcbiAgICAgICAgICAgICdocmVmJzogJ2h0dHBzOi8vYWRkb25zLm9wZXJhLmNvbS9ydS9leHRlbnNpb25zLz9yZWY9cGFnZScsXHJcbiAgICAgICAgICAgICdpbnN0YWxsX2J1dHRvbl9jbGFzcyc6ICdwbHVnaW4tYnJvd3NlcnMtbGluay1vcGVyYSdcclxuICAgICAgICB9LFxyXG4gICAgICAgICd5YW5kZXgnOiB7XHJcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2RfeWFuZGV4X2FwcCcsXHJcbiAgICAgICAgICAgICd1c2VkJzogaXNZYW5kZXgsXHJcbiAgICAgICAgICAgIC8vJ3RleHQnOmxnKFwiaW5zdGFsbF9wbHVnaW5fYW5kX2l0X3dpbGxfbm90aWNlX2Fib3V0X2Nhc2hiYWNrXCIpLFxyXG4gICAgICAgICAgICAnaHJlZic6ICdodHRwczovL2FkZG9ucy5vcGVyYS5jb20vcnUvZXh0ZW5zaW9ucy8/cmVmPXBhZ2UnLFxyXG4gICAgICAgICAgICAnaW5zdGFsbF9idXR0b25fY2xhc3MnOiAncGx1Z2luLWJyb3dzZXJzLWxpbmsteWFuZGV4J1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHNldFBhbmVsKGhyZWYpIHtcclxuICAgICAgICB2YXIgcGx1Z2luSW5zdGFsbFBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BsdWdpbi1pbnN0YWxsLXBhbmVsJyk7Ly/QstGL0LLQvtC00LjRgtGMINC70Lgg0L/QsNC90LXQu9GMXHJcbiAgICAgICAgaWYgKHBsdWdpbkluc3RhbGxQYW5lbCAmJiBnZXRDb29raWUoY29va2llUGFuZWxIaWRkZW4pICE9PSAnMScgKSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZSgne3t0ZXh0fX0nLCBsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSk7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZSgne3tocmVmfX0nLCBocmVmKTtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7e3RpdGxlfX0nLCBsZyhcImluc3RhbGxfcGx1Z2luXCIpKTtcclxuICAgICAgICAgICAgdmFyIHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XHJcbiAgICAgICAgICAgIHNlY3Rpb24uY2xhc3NOYW1lID0gJ2luc3RhbGwtcGx1Z2luJztcclxuICAgICAgICAgICAgc2VjdGlvbi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzZWNvbmRsaW5lID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcuaGVhZGVyLXNlY29uZGxpbmUnKTtcclxuICAgICAgICAgICAgaWYgKHNlY29uZGxpbmUpIHtcclxuICAgICAgICAgICAgICAgIHNlY29uZGxpbmUuYXBwZW5kQ2hpbGQoc2VjdGlvbik7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaW5zdGFsbC1wbHVnaW5fYnV0dG9uLWNsb3NlJykub25jbGljayA9IGNsb3NlQ2xpY2s7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0QnV0dG9uSW5zdGFsbFZpc2libGUoYnV0dG9uQ2xhc3MpIHtcclxuICAgICAgICAkKCcuJyArIHBsdWdpbkluc3RhbGxEaXZDbGFzcykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICQoJy4nICsgYnV0dG9uQ2xhc3MpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICBpZiAoZ2V0Q29va2llKGNvb2tpZUFjY291bnREaXZIaWRkZW4pICE9PSAnMScpIHtcclxuICAgICAgICAgICAgJCgnLicgKyBwbHVnaW5JbnN0YWxsRGl2QWNjb3VudENsYXNzKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsb3NlQ2xpY2soKXtcclxuICAgICAgICAkKCcuaW5zdGFsbC1wbHVnaW4nKS5hZGRDbGFzcygnaW5zdGFsbC1wbHVnaW5faGlkZGVuJyk7XHJcbiAgICAgICAgc2V0Q29va2llKGNvb2tpZVBhbmVsSGlkZGVuLCAnMScsIDEwKTtcclxuICAgIH1cclxuXHJcbiAgICAkKCcuaW5zdGFsbC1wbHVnaW4tYWNjb3VudC1sYXRlcicpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2V0Q29va2llKGNvb2tpZUFjY291bnREaXZIaWRkZW4sICcxJywgMTApO1xyXG4gICAgICAgICQoJy5pbnN0YWxsLXBsdWdpbi1hY2NvdW50JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gZXh0ZW5zaW9ucykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnNba2V5XS51c2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFwcElkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignIycrZXh0ZW5zaW9uc1trZXldLmRpdl9pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhcHBJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL9C/0LDQvdC10LvRjCDRgSDQutC90L7Qv9C60L7QuVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRQYW5lbChleHRlbnNpb25zW2tleV0uaHJlZik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v0L3QsCDQs9C70LDQstC90L7QuSAg0Lgg0LIgL2FjY291bnQg0LHQu9C+0LrQuCDRgSDQuNC60L7QvdC60LDQvNC4INC4INC60L3QvtC/0LrQsNC80LhcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0QnV0dG9uSW5zdGFsbFZpc2libGUoZXh0ZW5zaW9uc1trZXldLmluc3RhbGxfYnV0dG9uX2NsYXNzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAzMDAwKTtcclxuICAgIH07XHJcblxyXG59KSgpOyIsIi8qKlxyXG4gKiBAYXV0aG9yIHpoaXhpbiB3ZW4gPHdlbnpoaXhpbjIwMTBAZ21haWwuY29tPlxyXG4gKiBAdmVyc2lvbiAxLjIuMVxyXG4gKlxyXG4gKiBodHRwOi8vd2VuemhpeGluLm5ldC5jbi9wL211bHRpcGxlLXNlbGVjdC9cclxuICovXHJcblxyXG4oZnVuY3Rpb24gKCQpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgLy8gaXQgb25seSBkb2VzICclcycsIGFuZCByZXR1cm4gJycgd2hlbiBhcmd1bWVudHMgYXJlIHVuZGVmaW5lZFxyXG4gICAgdmFyIHNwcmludGYgPSBmdW5jdGlvbiAoc3RyKSB7XHJcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXHJcbiAgICAgICAgICAgIGZsYWcgPSB0cnVlLFxyXG4gICAgICAgICAgICBpID0gMTtcclxuXHJcbiAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoLyVzL2csIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGFyZyA9IGFyZ3NbaSsrXTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgZmxhZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhcmc7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZsYWcgPyBzdHIgOiAnJztcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHJlbW92ZURpYWNyaXRpY3MgPSBmdW5jdGlvbiAoc3RyKSB7XHJcbiAgICAgICAgdmFyIGRlZmF1bHREaWFjcml0aWNzUmVtb3ZhbE1hcCA9IFtcclxuICAgICAgICAgICAgeydiYXNlJzonQScsICdsZXR0ZXJzJzovW1xcdTAwNDFcXHUyNEI2XFx1RkYyMVxcdTAwQzBcXHUwMEMxXFx1MDBDMlxcdTFFQTZcXHUxRUE0XFx1MUVBQVxcdTFFQThcXHUwMEMzXFx1MDEwMFxcdTAxMDJcXHUxRUIwXFx1MUVBRVxcdTFFQjRcXHUxRUIyXFx1MDIyNlxcdTAxRTBcXHUwMEM0XFx1MDFERVxcdTFFQTJcXHUwMEM1XFx1MDFGQVxcdTAxQ0RcXHUwMjAwXFx1MDIwMlxcdTFFQTBcXHUxRUFDXFx1MUVCNlxcdTFFMDBcXHUwMTA0XFx1MDIzQVxcdTJDNkZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidBQScsJ2xldHRlcnMnOi9bXFx1QTczMl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0FFJywnbGV0dGVycyc6L1tcXHUwMEM2XFx1MDFGQ1xcdTAxRTJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidBTycsJ2xldHRlcnMnOi9bXFx1QTczNF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0FVJywnbGV0dGVycyc6L1tcXHVBNzM2XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQVYnLCdsZXR0ZXJzJzovW1xcdUE3MzhcXHVBNzNBXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQVknLCdsZXR0ZXJzJzovW1xcdUE3M0NdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidCJywgJ2xldHRlcnMnOi9bXFx1MDA0MlxcdTI0QjdcXHVGRjIyXFx1MUUwMlxcdTFFMDRcXHUxRTA2XFx1MDI0M1xcdTAxODJcXHUwMTgxXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQycsICdsZXR0ZXJzJzovW1xcdTAwNDNcXHUyNEI4XFx1RkYyM1xcdTAxMDZcXHUwMTA4XFx1MDEwQVxcdTAxMENcXHUwMEM3XFx1MUUwOFxcdTAxODdcXHUwMjNCXFx1QTczRV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0QnLCAnbGV0dGVycyc6L1tcXHUwMDQ0XFx1MjRCOVxcdUZGMjRcXHUxRTBBXFx1MDEwRVxcdTFFMENcXHUxRTEwXFx1MUUxMlxcdTFFMEVcXHUwMTEwXFx1MDE4QlxcdTAxOEFcXHUwMTg5XFx1QTc3OV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0RaJywnbGV0dGVycyc6L1tcXHUwMUYxXFx1MDFDNF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0R6JywnbGV0dGVycyc6L1tcXHUwMUYyXFx1MDFDNV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0UnLCAnbGV0dGVycyc6L1tcXHUwMDQ1XFx1MjRCQVxcdUZGMjVcXHUwMEM4XFx1MDBDOVxcdTAwQ0FcXHUxRUMwXFx1MUVCRVxcdTFFQzRcXHUxRUMyXFx1MUVCQ1xcdTAxMTJcXHUxRTE0XFx1MUUxNlxcdTAxMTRcXHUwMTE2XFx1MDBDQlxcdTFFQkFcXHUwMTFBXFx1MDIwNFxcdTAyMDZcXHUxRUI4XFx1MUVDNlxcdTAyMjhcXHUxRTFDXFx1MDExOFxcdTFFMThcXHUxRTFBXFx1MDE5MFxcdTAxOEVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidGJywgJ2xldHRlcnMnOi9bXFx1MDA0NlxcdTI0QkJcXHVGRjI2XFx1MUUxRVxcdTAxOTFcXHVBNzdCXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonRycsICdsZXR0ZXJzJzovW1xcdTAwNDdcXHUyNEJDXFx1RkYyN1xcdTAxRjRcXHUwMTFDXFx1MUUyMFxcdTAxMUVcXHUwMTIwXFx1MDFFNlxcdTAxMjJcXHUwMUU0XFx1MDE5M1xcdUE3QTBcXHVBNzdEXFx1QTc3RV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0gnLCAnbGV0dGVycyc6L1tcXHUwMDQ4XFx1MjRCRFxcdUZGMjhcXHUwMTI0XFx1MUUyMlxcdTFFMjZcXHUwMjFFXFx1MUUyNFxcdTFFMjhcXHUxRTJBXFx1MDEyNlxcdTJDNjdcXHUyQzc1XFx1QTc4RF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0knLCAnbGV0dGVycyc6L1tcXHUwMDQ5XFx1MjRCRVxcdUZGMjlcXHUwMENDXFx1MDBDRFxcdTAwQ0VcXHUwMTI4XFx1MDEyQVxcdTAxMkNcXHUwMTMwXFx1MDBDRlxcdTFFMkVcXHUxRUM4XFx1MDFDRlxcdTAyMDhcXHUwMjBBXFx1MUVDQVxcdTAxMkVcXHUxRTJDXFx1MDE5N10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0onLCAnbGV0dGVycyc6L1tcXHUwMDRBXFx1MjRCRlxcdUZGMkFcXHUwMTM0XFx1MDI0OF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0snLCAnbGV0dGVycyc6L1tcXHUwMDRCXFx1MjRDMFxcdUZGMkJcXHUxRTMwXFx1MDFFOFxcdTFFMzJcXHUwMTM2XFx1MUUzNFxcdTAxOThcXHUyQzY5XFx1QTc0MFxcdUE3NDJcXHVBNzQ0XFx1QTdBMl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0wnLCAnbGV0dGVycyc6L1tcXHUwMDRDXFx1MjRDMVxcdUZGMkNcXHUwMTNGXFx1MDEzOVxcdTAxM0RcXHUxRTM2XFx1MUUzOFxcdTAxM0JcXHUxRTNDXFx1MUUzQVxcdTAxNDFcXHUwMjNEXFx1MkM2MlxcdTJDNjBcXHVBNzQ4XFx1QTc0NlxcdUE3ODBdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidMSicsJ2xldHRlcnMnOi9bXFx1MDFDN10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0xqJywnbGV0dGVycyc6L1tcXHUwMUM4XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTScsICdsZXR0ZXJzJzovW1xcdTAwNERcXHUyNEMyXFx1RkYyRFxcdTFFM0VcXHUxRTQwXFx1MUU0MlxcdTJDNkVcXHUwMTlDXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTicsICdsZXR0ZXJzJzovW1xcdTAwNEVcXHUyNEMzXFx1RkYyRVxcdTAxRjhcXHUwMTQzXFx1MDBEMVxcdTFFNDRcXHUwMTQ3XFx1MUU0NlxcdTAxNDVcXHUxRTRBXFx1MUU0OFxcdTAyMjBcXHUwMTlEXFx1QTc5MFxcdUE3QTRdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidOSicsJ2xldHRlcnMnOi9bXFx1MDFDQV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J05qJywnbGV0dGVycyc6L1tcXHUwMUNCXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTycsICdsZXR0ZXJzJzovW1xcdTAwNEZcXHUyNEM0XFx1RkYyRlxcdTAwRDJcXHUwMEQzXFx1MDBENFxcdTFFRDJcXHUxRUQwXFx1MUVENlxcdTFFRDRcXHUwMEQ1XFx1MUU0Q1xcdTAyMkNcXHUxRTRFXFx1MDE0Q1xcdTFFNTBcXHUxRTUyXFx1MDE0RVxcdTAyMkVcXHUwMjMwXFx1MDBENlxcdTAyMkFcXHUxRUNFXFx1MDE1MFxcdTAxRDFcXHUwMjBDXFx1MDIwRVxcdTAxQTBcXHUxRURDXFx1MUVEQVxcdTFFRTBcXHUxRURFXFx1MUVFMlxcdTFFQ0NcXHUxRUQ4XFx1MDFFQVxcdTAxRUNcXHUwMEQ4XFx1MDFGRVxcdTAxODZcXHUwMTlGXFx1QTc0QVxcdUE3NENdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidPSScsJ2xldHRlcnMnOi9bXFx1MDFBMl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J09PJywnbGV0dGVycyc6L1tcXHVBNzRFXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonT1UnLCdsZXR0ZXJzJzovW1xcdTAyMjJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidQJywgJ2xldHRlcnMnOi9bXFx1MDA1MFxcdTI0QzVcXHVGRjMwXFx1MUU1NFxcdTFFNTZcXHUwMUE0XFx1MkM2M1xcdUE3NTBcXHVBNzUyXFx1QTc1NF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1EnLCAnbGV0dGVycyc6L1tcXHUwMDUxXFx1MjRDNlxcdUZGMzFcXHVBNzU2XFx1QTc1OFxcdTAyNEFdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidSJywgJ2xldHRlcnMnOi9bXFx1MDA1MlxcdTI0QzdcXHVGRjMyXFx1MDE1NFxcdTFFNThcXHUwMTU4XFx1MDIxMFxcdTAyMTJcXHUxRTVBXFx1MUU1Q1xcdTAxNTZcXHUxRTVFXFx1MDI0Q1xcdTJDNjRcXHVBNzVBXFx1QTdBNlxcdUE3ODJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidTJywgJ2xldHRlcnMnOi9bXFx1MDA1M1xcdTI0QzhcXHVGRjMzXFx1MUU5RVxcdTAxNUFcXHUxRTY0XFx1MDE1Q1xcdTFFNjBcXHUwMTYwXFx1MUU2NlxcdTFFNjJcXHUxRTY4XFx1MDIxOFxcdTAxNUVcXHUyQzdFXFx1QTdBOFxcdUE3ODRdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidUJywgJ2xldHRlcnMnOi9bXFx1MDA1NFxcdTI0QzlcXHVGRjM0XFx1MUU2QVxcdTAxNjRcXHUxRTZDXFx1MDIxQVxcdTAxNjJcXHUxRTcwXFx1MUU2RVxcdTAxNjZcXHUwMUFDXFx1MDFBRVxcdTAyM0VcXHVBNzg2XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonVFonLCdsZXR0ZXJzJzovW1xcdUE3MjhdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidVJywgJ2xldHRlcnMnOi9bXFx1MDA1NVxcdTI0Q0FcXHVGRjM1XFx1MDBEOVxcdTAwREFcXHUwMERCXFx1MDE2OFxcdTFFNzhcXHUwMTZBXFx1MUU3QVxcdTAxNkNcXHUwMERDXFx1MDFEQlxcdTAxRDdcXHUwMUQ1XFx1MDFEOVxcdTFFRTZcXHUwMTZFXFx1MDE3MFxcdTAxRDNcXHUwMjE0XFx1MDIxNlxcdTAxQUZcXHUxRUVBXFx1MUVFOFxcdTFFRUVcXHUxRUVDXFx1MUVGMFxcdTFFRTRcXHUxRTcyXFx1MDE3MlxcdTFFNzZcXHUxRTc0XFx1MDI0NF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1YnLCAnbGV0dGVycyc6L1tcXHUwMDU2XFx1MjRDQlxcdUZGMzZcXHUxRTdDXFx1MUU3RVxcdTAxQjJcXHVBNzVFXFx1MDI0NV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1ZZJywnbGV0dGVycyc6L1tcXHVBNzYwXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonVycsICdsZXR0ZXJzJzovW1xcdTAwNTdcXHUyNENDXFx1RkYzN1xcdTFFODBcXHUxRTgyXFx1MDE3NFxcdTFFODZcXHUxRTg0XFx1MUU4OFxcdTJDNzJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidYJywgJ2xldHRlcnMnOi9bXFx1MDA1OFxcdTI0Q0RcXHVGRjM4XFx1MUU4QVxcdTFFOENdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidZJywgJ2xldHRlcnMnOi9bXFx1MDA1OVxcdTI0Q0VcXHVGRjM5XFx1MUVGMlxcdTAwRERcXHUwMTc2XFx1MUVGOFxcdTAyMzJcXHUxRThFXFx1MDE3OFxcdTFFRjZcXHUxRUY0XFx1MDFCM1xcdTAyNEVcXHUxRUZFXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonWicsICdsZXR0ZXJzJzovW1xcdTAwNUFcXHUyNENGXFx1RkYzQVxcdTAxNzlcXHUxRTkwXFx1MDE3QlxcdTAxN0RcXHUxRTkyXFx1MUU5NFxcdTAxQjVcXHUwMjI0XFx1MkM3RlxcdTJDNkJcXHVBNzYyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYScsICdsZXR0ZXJzJzovW1xcdTAwNjFcXHUyNEQwXFx1RkY0MVxcdTFFOUFcXHUwMEUwXFx1MDBFMVxcdTAwRTJcXHUxRUE3XFx1MUVBNVxcdTFFQUJcXHUxRUE5XFx1MDBFM1xcdTAxMDFcXHUwMTAzXFx1MUVCMVxcdTFFQUZcXHUxRUI1XFx1MUVCM1xcdTAyMjdcXHUwMUUxXFx1MDBFNFxcdTAxREZcXHUxRUEzXFx1MDBFNVxcdTAxRkJcXHUwMUNFXFx1MDIwMVxcdTAyMDNcXHUxRUExXFx1MUVBRFxcdTFFQjdcXHUxRTAxXFx1MDEwNVxcdTJDNjVcXHUwMjUwXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYWEnLCdsZXR0ZXJzJzovW1xcdUE3MzNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidhZScsJ2xldHRlcnMnOi9bXFx1MDBFNlxcdTAxRkRcXHUwMUUzXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYW8nLCdsZXR0ZXJzJzovW1xcdUE3MzVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidhdScsJ2xldHRlcnMnOi9bXFx1QTczN10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2F2JywnbGV0dGVycyc6L1tcXHVBNzM5XFx1QTczQl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2F5JywnbGV0dGVycyc6L1tcXHVBNzNEXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYicsICdsZXR0ZXJzJzovW1xcdTAwNjJcXHUyNEQxXFx1RkY0MlxcdTFFMDNcXHUxRTA1XFx1MUUwN1xcdTAxODBcXHUwMTgzXFx1MDI1M10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2MnLCAnbGV0dGVycyc6L1tcXHUwMDYzXFx1MjREMlxcdUZGNDNcXHUwMTA3XFx1MDEwOVxcdTAxMEJcXHUwMTBEXFx1MDBFN1xcdTFFMDlcXHUwMTg4XFx1MDIzQ1xcdUE3M0ZcXHUyMTg0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonZCcsICdsZXR0ZXJzJzovW1xcdTAwNjRcXHUyNEQzXFx1RkY0NFxcdTFFMEJcXHUwMTBGXFx1MUUwRFxcdTFFMTFcXHUxRTEzXFx1MUUwRlxcdTAxMTFcXHUwMThDXFx1MDI1NlxcdTAyNTdcXHVBNzdBXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonZHonLCdsZXR0ZXJzJzovW1xcdTAxRjNcXHUwMUM2XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonZScsICdsZXR0ZXJzJzovW1xcdTAwNjVcXHUyNEQ0XFx1RkY0NVxcdTAwRThcXHUwMEU5XFx1MDBFQVxcdTFFQzFcXHUxRUJGXFx1MUVDNVxcdTFFQzNcXHUxRUJEXFx1MDExM1xcdTFFMTVcXHUxRTE3XFx1MDExNVxcdTAxMTdcXHUwMEVCXFx1MUVCQlxcdTAxMUJcXHUwMjA1XFx1MDIwN1xcdTFFQjlcXHUxRUM3XFx1MDIyOVxcdTFFMURcXHUwMTE5XFx1MUUxOVxcdTFFMUJcXHUwMjQ3XFx1MDI1QlxcdTAxRERdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidmJywgJ2xldHRlcnMnOi9bXFx1MDA2NlxcdTI0RDVcXHVGRjQ2XFx1MUUxRlxcdTAxOTJcXHVBNzdDXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonZycsICdsZXR0ZXJzJzovW1xcdTAwNjdcXHUyNEQ2XFx1RkY0N1xcdTAxRjVcXHUwMTFEXFx1MUUyMVxcdTAxMUZcXHUwMTIxXFx1MDFFN1xcdTAxMjNcXHUwMUU1XFx1MDI2MFxcdUE3QTFcXHUxRDc5XFx1QTc3Rl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2gnLCAnbGV0dGVycyc6L1tcXHUwMDY4XFx1MjREN1xcdUZGNDhcXHUwMTI1XFx1MUUyM1xcdTFFMjdcXHUwMjFGXFx1MUUyNVxcdTFFMjlcXHUxRTJCXFx1MUU5NlxcdTAxMjdcXHUyQzY4XFx1MkM3NlxcdTAyNjVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidodicsJ2xldHRlcnMnOi9bXFx1MDE5NV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2knLCAnbGV0dGVycyc6L1tcXHUwMDY5XFx1MjREOFxcdUZGNDlcXHUwMEVDXFx1MDBFRFxcdTAwRUVcXHUwMTI5XFx1MDEyQlxcdTAxMkRcXHUwMEVGXFx1MUUyRlxcdTFFQzlcXHUwMUQwXFx1MDIwOVxcdTAyMEJcXHUxRUNCXFx1MDEyRlxcdTFFMkRcXHUwMjY4XFx1MDEzMV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2onLCAnbGV0dGVycyc6L1tcXHUwMDZBXFx1MjREOVxcdUZGNEFcXHUwMTM1XFx1MDFGMFxcdTAyNDldL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidrJywgJ2xldHRlcnMnOi9bXFx1MDA2QlxcdTI0REFcXHVGRjRCXFx1MUUzMVxcdTAxRTlcXHUxRTMzXFx1MDEzN1xcdTFFMzVcXHUwMTk5XFx1MkM2QVxcdUE3NDFcXHVBNzQzXFx1QTc0NVxcdUE3QTNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidsJywgJ2xldHRlcnMnOi9bXFx1MDA2Q1xcdTI0REJcXHVGRjRDXFx1MDE0MFxcdTAxM0FcXHUwMTNFXFx1MUUzN1xcdTFFMzlcXHUwMTNDXFx1MUUzRFxcdTFFM0JcXHUwMTdGXFx1MDE0MlxcdTAxOUFcXHUwMjZCXFx1MkM2MVxcdUE3NDlcXHVBNzgxXFx1QTc0N10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2xqJywnbGV0dGVycyc6L1tcXHUwMUM5XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonbScsICdsZXR0ZXJzJzovW1xcdTAwNkRcXHUyNERDXFx1RkY0RFxcdTFFM0ZcXHUxRTQxXFx1MUU0M1xcdTAyNzFcXHUwMjZGXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonbicsICdsZXR0ZXJzJzovW1xcdTAwNkVcXHUyNEREXFx1RkY0RVxcdTAxRjlcXHUwMTQ0XFx1MDBGMVxcdTFFNDVcXHUwMTQ4XFx1MUU0N1xcdTAxNDZcXHUxRTRCXFx1MUU0OVxcdTAxOUVcXHUwMjcyXFx1MDE0OVxcdUE3OTFcXHVBN0E1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonbmonLCdsZXR0ZXJzJzovW1xcdTAxQ0NdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidvJywgJ2xldHRlcnMnOi9bXFx1MDA2RlxcdTI0REVcXHVGRjRGXFx1MDBGMlxcdTAwRjNcXHUwMEY0XFx1MUVEM1xcdTFFRDFcXHUxRUQ3XFx1MUVENVxcdTAwRjVcXHUxRTREXFx1MDIyRFxcdTFFNEZcXHUwMTREXFx1MUU1MVxcdTFFNTNcXHUwMTRGXFx1MDIyRlxcdTAyMzFcXHUwMEY2XFx1MDIyQlxcdTFFQ0ZcXHUwMTUxXFx1MDFEMlxcdTAyMERcXHUwMjBGXFx1MDFBMVxcdTFFRERcXHUxRURCXFx1MUVFMVxcdTFFREZcXHUxRUUzXFx1MUVDRFxcdTFFRDlcXHUwMUVCXFx1MDFFRFxcdTAwRjhcXHUwMUZGXFx1MDI1NFxcdUE3NEJcXHVBNzREXFx1MDI3NV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J29pJywnbGV0dGVycyc6L1tcXHUwMUEzXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonb3UnLCdsZXR0ZXJzJzovW1xcdTAyMjNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidvbycsJ2xldHRlcnMnOi9bXFx1QTc0Rl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3AnLCdsZXR0ZXJzJzovW1xcdTAwNzBcXHUyNERGXFx1RkY1MFxcdTFFNTVcXHUxRTU3XFx1MDFBNVxcdTFEN0RcXHVBNzUxXFx1QTc1M1xcdUE3NTVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidxJywnbGV0dGVycyc6L1tcXHUwMDcxXFx1MjRFMFxcdUZGNTFcXHUwMjRCXFx1QTc1N1xcdUE3NTldL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidyJywnbGV0dGVycyc6L1tcXHUwMDcyXFx1MjRFMVxcdUZGNTJcXHUwMTU1XFx1MUU1OVxcdTAxNTlcXHUwMjExXFx1MDIxM1xcdTFFNUJcXHUxRTVEXFx1MDE1N1xcdTFFNUZcXHUwMjREXFx1MDI3RFxcdUE3NUJcXHVBN0E3XFx1QTc4M10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3MnLCdsZXR0ZXJzJzovW1xcdTAwNzNcXHUyNEUyXFx1RkY1M1xcdTAwREZcXHUwMTVCXFx1MUU2NVxcdTAxNURcXHUxRTYxXFx1MDE2MVxcdTFFNjdcXHUxRTYzXFx1MUU2OVxcdTAyMTlcXHUwMTVGXFx1MDIzRlxcdUE3QTlcXHVBNzg1XFx1MUU5Ql0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3QnLCdsZXR0ZXJzJzovW1xcdTAwNzRcXHUyNEUzXFx1RkY1NFxcdTFFNkJcXHUxRTk3XFx1MDE2NVxcdTFFNkRcXHUwMjFCXFx1MDE2M1xcdTFFNzFcXHUxRTZGXFx1MDE2N1xcdTAxQURcXHUwMjg4XFx1MkM2NlxcdUE3ODddL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid0eicsJ2xldHRlcnMnOi9bXFx1QTcyOV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3UnLCdsZXR0ZXJzJzovW1xcdTAwNzVcXHUyNEU0XFx1RkY1NVxcdTAwRjlcXHUwMEZBXFx1MDBGQlxcdTAxNjlcXHUxRTc5XFx1MDE2QlxcdTFFN0JcXHUwMTZEXFx1MDBGQ1xcdTAxRENcXHUwMUQ4XFx1MDFENlxcdTAxREFcXHUxRUU3XFx1MDE2RlxcdTAxNzFcXHUwMUQ0XFx1MDIxNVxcdTAyMTdcXHUwMUIwXFx1MUVFQlxcdTFFRTlcXHUxRUVGXFx1MUVFRFxcdTFFRjFcXHUxRUU1XFx1MUU3M1xcdTAxNzNcXHUxRTc3XFx1MUU3NVxcdTAyODldL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid2JywnbGV0dGVycyc6L1tcXHUwMDc2XFx1MjRFNVxcdUZGNTZcXHUxRTdEXFx1MUU3RlxcdTAyOEJcXHVBNzVGXFx1MDI4Q10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3Z5JywnbGV0dGVycyc6L1tcXHVBNzYxXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzondycsJ2xldHRlcnMnOi9bXFx1MDA3N1xcdTI0RTZcXHVGRjU3XFx1MUU4MVxcdTFFODNcXHUwMTc1XFx1MUU4N1xcdTFFODVcXHUxRTk4XFx1MUU4OVxcdTJDNzNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid4JywnbGV0dGVycyc6L1tcXHUwMDc4XFx1MjRFN1xcdUZGNThcXHUxRThCXFx1MUU4RF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3knLCdsZXR0ZXJzJzovW1xcdTAwNzlcXHUyNEU4XFx1RkY1OVxcdTFFRjNcXHUwMEZEXFx1MDE3N1xcdTFFRjlcXHUwMjMzXFx1MUU4RlxcdTAwRkZcXHUxRUY3XFx1MUU5OVxcdTFFRjVcXHUwMUI0XFx1MDI0RlxcdTFFRkZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid6JywnbGV0dGVycyc6L1tcXHUwMDdBXFx1MjRFOVxcdUZGNUFcXHUwMTdBXFx1MUU5MVxcdTAxN0NcXHUwMTdFXFx1MUU5M1xcdTFFOTVcXHUwMUI2XFx1MDIyNVxcdTAyNDBcXHUyQzZDXFx1QTc2M10vZ31cclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRlZmF1bHREaWFjcml0aWNzUmVtb3ZhbE1hcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXBbaV0ubGV0dGVycywgZGVmYXVsdERpYWNyaXRpY3NSZW1vdmFsTWFwW2ldLmJhc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuXHJcbiAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gTXVsdGlwbGVTZWxlY3QoJGVsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICBuYW1lID0gJGVsLmF0dHIoJ25hbWUnKSB8fCBvcHRpb25zLm5hbWUgfHwgJyc7XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcblxyXG4gICAgICAgIC8vIGhpZGUgc2VsZWN0IGVsZW1lbnRcclxuICAgICAgICB0aGlzLiRlbCA9ICRlbC5oaWRlKCk7XHJcblxyXG4gICAgICAgIC8vIGxhYmVsIGVsZW1lbnRcclxuICAgICAgICB0aGlzLiRsYWJlbCA9IHRoaXMuJGVsLmNsb3Nlc3QoJ2xhYmVsJyk7XHJcbiAgICAgICAgaWYgKHRoaXMuJGxhYmVsLmxlbmd0aCA9PT0gMCAmJiB0aGlzLiRlbC5hdHRyKCdpZCcpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGxhYmVsID0gJChzcHJpbnRmKCdsYWJlbFtmb3I9XCIlc1wiXScsIHRoaXMuJGVsLmF0dHIoJ2lkJykucmVwbGFjZSgvOi9nLCAnXFxcXDonKSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmVzdG9yZSBjbGFzcyBhbmQgdGl0bGUgZnJvbSBzZWxlY3QgZWxlbWVudFxyXG4gICAgICAgIHRoaXMuJHBhcmVudCA9ICQoc3ByaW50ZihcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJtcy1wYXJlbnQgJXNcIiAlcy8+JyxcclxuICAgICAgICAgICAgJGVsLmF0dHIoJ2NsYXNzJykgfHwgJycsXHJcbiAgICAgICAgICAgIHNwcmludGYoJ3RpdGxlPVwiJXNcIicsICRlbC5hdHRyKCd0aXRsZScpKSkpO1xyXG5cclxuICAgICAgICAvLyBhZGQgcGxhY2Vob2xkZXIgdG8gY2hvaWNlIGJ1dHRvblxyXG4gICAgICAgIHRoaXMuJGNob2ljZSA9ICQoc3ByaW50ZihbXHJcbiAgICAgICAgICAgICAgICAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtcy1jaG9pY2VcIj4nLFxyXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwicGxhY2Vob2xkZXJcIj4lczwvc3Bhbj4nLFxyXG4gICAgICAgICAgICAgICAgJzxkaXY+PC9kaXY+JyxcclxuICAgICAgICAgICAgICAgICc8L2J1dHRvbj4nXHJcbiAgICAgICAgICAgIF0uam9pbignJyksXHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlcikpO1xyXG5cclxuICAgICAgICAvLyBkZWZhdWx0IHBvc2l0aW9uIGlzIGJvdHRvbVxyXG4gICAgICAgIHRoaXMuJGRyb3AgPSAkKHNwcmludGYoJzxkaXYgY2xhc3M9XCJtcy1kcm9wICVzXCIlcz48L2Rpdj4nLFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucG9zaXRpb24sXHJcbiAgICAgICAgICAgIHNwcmludGYoJyBzdHlsZT1cIndpZHRoOiAlc1wiJywgdGhpcy5vcHRpb25zLmRyb3BXaWR0aCkpKTtcclxuXHJcbiAgICAgICAgdGhpcy4kZWwuYWZ0ZXIodGhpcy4kcGFyZW50KTtcclxuICAgICAgICB0aGlzLiRwYXJlbnQuYXBwZW5kKHRoaXMuJGNob2ljZSk7XHJcbiAgICAgICAgdGhpcy4kcGFyZW50LmFwcGVuZCh0aGlzLiRkcm9wKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuJGVsLnByb3AoJ2Rpc2FibGVkJykpIHtcclxuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLiRwYXJlbnQuY3NzKCd3aWR0aCcsXHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy53aWR0aCB8fFxyXG4gICAgICAgICAgICB0aGlzLiRlbC5jc3MoJ3dpZHRoJykgfHxcclxuICAgICAgICAgICAgdGhpcy4kZWwub3V0ZXJXaWR0aCgpICsgMjApO1xyXG5cclxuICAgICAgICB0aGlzLnNlbGVjdEFsbE5hbWUgPSAnZGF0YS1uYW1lPVwic2VsZWN0QWxsJyArIG5hbWUgKyAnXCInO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0R3JvdXBOYW1lID0gJ2RhdGEtbmFtZT1cInNlbGVjdEdyb3VwJyArIG5hbWUgKyAnXCInO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0SXRlbU5hbWUgPSAnZGF0YS1uYW1lPVwic2VsZWN0SXRlbScgKyBuYW1lICsgJ1wiJztcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMua2VlcE9wZW4pIHtcclxuICAgICAgICAgICAgJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkKGUudGFyZ2V0KVswXSA9PT0gdGhhdC4kY2hvaWNlWzBdIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50cygnLm1zLWNob2ljZScpWzBdID09PSB0aGF0LiRjaG9pY2VbMF0pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoKCQoZS50YXJnZXQpWzBdID09PSB0aGF0LiRkcm9wWzBdIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50cygnLm1zLWRyb3AnKVswXSAhPT0gdGhhdC4kZHJvcFswXSAmJiBlLnRhcmdldCAhPT0gJGVsWzBdKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQub3B0aW9ucy5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBNdWx0aXBsZVNlbGVjdC5wcm90b3R5cGUgPSB7XHJcbiAgICAgICAgY29uc3RydWN0b3I6IE11bHRpcGxlU2VsZWN0LFxyXG5cclxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgICR1bCA9ICQoJzx1bD48L3VsPicpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kZHJvcC5odG1sKCcnKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkcm9wLmFwcGVuZChbXHJcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJtcy1zZWFyY2hcIj4nLFxyXG4gICAgICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBhdXRvY29ycmVjdD1cIm9mZlwiIGF1dG9jYXBpdGlsaXplPVwib2ZmXCIgc3BlbGxjaGVjaz1cImZhbHNlXCI+JyxcclxuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+J10uam9pbignJylcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2VsZWN0QWxsICYmICF0aGlzLm9wdGlvbnMuc2luZ2xlKSB7XHJcbiAgICAgICAgICAgICAgICAkdWwuYXBwZW5kKFtcclxuICAgICAgICAgICAgICAgICAgICAnPGxpIGNsYXNzPVwibXMtc2VsZWN0LWFsbFwiPicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzxsYWJlbD4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAlcyAvPiAnLCB0aGlzLnNlbGVjdEFsbE5hbWUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zZWxlY3RBbGxEZWxpbWl0ZXJbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNlbGVjdEFsbFRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNlbGVjdEFsbERlbGltaXRlclsxXSxcclxuICAgICAgICAgICAgICAgICAgICAnPC9sYWJlbD4nLFxyXG4gICAgICAgICAgICAgICAgICAgICc8L2xpPidcclxuICAgICAgICAgICAgICAgIF0uam9pbignJykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkLmVhY2godGhpcy4kZWwuY2hpbGRyZW4oKSwgZnVuY3Rpb24gKGksIGVsbSkge1xyXG4gICAgICAgICAgICAgICAgJHVsLmFwcGVuZCh0aGF0Lm9wdGlvblRvSHRtbChpLCBlbG0pKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICR1bC5hcHBlbmQoc3ByaW50ZignPGxpIGNsYXNzPVwibXMtbm8tcmVzdWx0c1wiPiVzPC9saT4nLCB0aGlzLm9wdGlvbnMubm9NYXRjaGVzRm91bmQpKTtcclxuICAgICAgICAgICAgdGhpcy4kZHJvcC5hcHBlbmQoJHVsKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuZmluZCgndWwnKS5jc3MoJ21heC1oZWlnaHQnLCB0aGlzLm9wdGlvbnMubWF4SGVpZ2h0ICsgJ3B4Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuZmluZCgnLm11bHRpcGxlJykuY3NzKCd3aWR0aCcsIHRoaXMub3B0aW9ucy5tdWx0aXBsZVdpZHRoICsgJ3B4Jyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRzZWFyY2hJbnB1dCA9IHRoaXMuJGRyb3AuZmluZCgnLm1zLXNlYXJjaCBpbnB1dCcpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwgPSB0aGlzLiRkcm9wLmZpbmQoJ2lucHV0WycgKyB0aGlzLnNlbGVjdEFsbE5hbWUgKyAnXScpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMgPSB0aGlzLiRkcm9wLmZpbmQoJ2lucHV0WycgKyB0aGlzLnNlbGVjdEdyb3VwTmFtZSArICddJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zID0gdGhpcy4kZHJvcC5maW5kKCdpbnB1dFsnICsgdGhpcy5zZWxlY3RJdGVtTmFtZSArICddOmVuYWJsZWQnKTtcclxuICAgICAgICAgICAgdGhpcy4kZGlzYWJsZUl0ZW1zID0gdGhpcy4kZHJvcC5maW5kKCdpbnB1dFsnICsgdGhpcy5zZWxlY3RJdGVtTmFtZSArICddOmRpc2FibGVkJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJG5vUmVzdWx0cyA9IHRoaXMuJGRyb3AuZmluZCgnLm1zLW5vLXJlc3VsdHMnKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0QWxsKHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9wdGlvblRvSHRtbDogZnVuY3Rpb24gKGksIGVsbSwgZ3JvdXAsIGdyb3VwRGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgJGVsbSA9ICQoZWxtKSxcclxuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSAkZWxtLmF0dHIoJ2NsYXNzJykgfHwgJycsXHJcbiAgICAgICAgICAgICAgICB0aXRsZSA9IHNwcmludGYoJ3RpdGxlPVwiJXNcIicsICRlbG0uYXR0cigndGl0bGUnKSksXHJcbiAgICAgICAgICAgICAgICBtdWx0aXBsZSA9IHRoaXMub3B0aW9ucy5tdWx0aXBsZSA/ICdtdWx0aXBsZScgOiAnJyxcclxuICAgICAgICAgICAgICAgIGRpc2FibGVkLFxyXG4gICAgICAgICAgICAgICAgdHlwZSA9IHRoaXMub3B0aW9ucy5zaW5nbGUgPyAncmFkaW8nIDogJ2NoZWNrYm94JztcclxuXHJcbiAgICAgICAgICAgIGlmICgkZWxtLmlzKCdvcHRpb24nKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gJGVsbS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdGhhdC5vcHRpb25zLnRleHRUZW1wbGF0ZSgkZWxtKSxcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZCA9ICRlbG0ucHJvcCgnc2VsZWN0ZWQnKSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZSA9IHNwcmludGYoJ3N0eWxlPVwiJXNcIicsIHRoaXMub3B0aW9ucy5zdHlsZXIodmFsdWUpKSxcclxuICAgICAgICAgICAgICAgICAgICAkZWw7XHJcblxyXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQgPSBncm91cERpc2FibGVkIHx8ICRlbG0ucHJvcCgnZGlzYWJsZWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkZWwgPSAkKFtcclxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8bGkgY2xhc3M9XCIlcyAlc1wiICVzICVzPicsIG11bHRpcGxlLCBjbGFzc2VzLCB0aXRsZSwgc3R5bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxsYWJlbCBjbGFzcz1cIiVzXCI+JywgZGlzYWJsZWQgPyAnZGlzYWJsZWQnIDogJycpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxpbnB1dCB0eXBlPVwiJXNcIiAlcyVzJXMlcz4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlLCB0aGlzLnNlbGVjdEl0ZW1OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZCA/ICcgY2hlY2tlZD1cImNoZWNrZWRcIicgOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQgPyAnIGRpc2FibGVkPVwiZGlzYWJsZWRcIicgOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignIGRhdGEtZ3JvdXA9XCIlc1wiJywgZ3JvdXApKSxcclxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8c3Bhbj4lczwvc3Bhbj4nLCB0ZXh0KSxcclxuICAgICAgICAgICAgICAgICAgICAnPC9sYWJlbD4nLFxyXG4gICAgICAgICAgICAgICAgICAgICc8L2xpPidcclxuICAgICAgICAgICAgICAgIF0uam9pbignJykpO1xyXG4gICAgICAgICAgICAgICAgJGVsLmZpbmQoJ2lucHV0JykudmFsKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCRlbG0uaXMoJ29wdGdyb3VwJykpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IHRoYXQub3B0aW9ucy5sYWJlbFRlbXBsYXRlKCRlbG0pLFxyXG4gICAgICAgICAgICAgICAgICAgICRncm91cCA9ICQoJzxkaXYvPicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGdyb3VwID0gJ2dyb3VwXycgKyBpO1xyXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQgPSAkZWxtLnByb3AoJ2Rpc2FibGVkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgJGdyb3VwLmFwcGVuZChbXHJcbiAgICAgICAgICAgICAgICAgICAgJzxsaSBjbGFzcz1cImdyb3VwXCI+JyxcclxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8bGFiZWwgY2xhc3M9XCJvcHRncm91cCAlc1wiIGRhdGEtZ3JvdXA9XCIlc1wiPicsIGRpc2FibGVkID8gJ2Rpc2FibGVkJyA6ICcnLCBncm91cCksXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmhpZGVPcHRncm91cENoZWNrYm94ZXMgfHwgdGhpcy5vcHRpb25zLnNpbmdsZSA/ICcnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGlucHV0IHR5cGU9XCJjaGVja2JveFwiICVzICVzPicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0R3JvdXBOYW1lLCBkaXNhYmxlZCA/ICdkaXNhYmxlZD1cImRpc2FibGVkXCInIDogJycpLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsLFxyXG4gICAgICAgICAgICAgICAgICAgICc8L2xhYmVsPicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvbGk+J1xyXG4gICAgICAgICAgICAgICAgXS5qb2luKCcnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJC5lYWNoKCRlbG0uY2hpbGRyZW4oKSwgZnVuY3Rpb24gKGksIGVsbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRncm91cC5hcHBlbmQodGhhdC5vcHRpb25Ub0h0bWwoaSwgZWxtLCBncm91cCwgZGlzYWJsZWQpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRncm91cC5odG1sKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBldmVudHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgdG9nZ2xlT3BlbiA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXRbdGhhdC5vcHRpb25zLmlzT3BlbiA/ICdjbG9zZScgOiAnb3BlbiddKCk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuJGxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRsYWJlbC5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2xhYmVsJyB8fCBlLnRhcmdldCAhPT0gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZU9wZW4oZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMuZmlsdGVyIHx8ICF0aGF0Lm9wdGlvbnMuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTsgLy8gQ2F1c2VzIGxvc3QgZm9jdXMgb3RoZXJ3aXNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLm9mZignY2xpY2snKS5vbignY2xpY2snLCB0b2dnbGVPcGVuKVxyXG4gICAgICAgICAgICAgICAgLm9mZignZm9jdXMnKS5vbignZm9jdXMnLCB0aGlzLm9wdGlvbnMub25Gb2N1cylcclxuICAgICAgICAgICAgICAgIC5vZmYoJ2JsdXInKS5vbignYmx1cicsIHRoaXMub3B0aW9ucy5vbkJsdXIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kcGFyZW50Lm9mZigna2V5ZG93bicpLm9uKCdrZXlkb3duJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjc6IC8vIGVzYyBrZXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LiRjaG9pY2UuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kc2VhcmNoSW5wdXQub2ZmKCdrZXlkb3duJykub24oJ2tleWRvd24nLGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgc2hpZnQtdGFiIGNhdXNlcyBsb3N0IGZvY3VzIGZyb20gZmlsdGVyIGFzIHdpdGggY2xpY2tpbmcgYXdheVxyXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gOSAmJiBlLnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS5vZmYoJ2tleXVwJykub24oJ2tleXVwJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIGVudGVyIG9yIHNwYWNlXHJcbiAgICAgICAgICAgICAgICAvLyBBdm9pZCBzZWxlY3RpbmcvZGVzZWxlY3RpbmcgaWYgbm8gY2hvaWNlcyBtYWRlXHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLmZpbHRlckFjY2VwdE9uRW50ZXIgJiYgKGUud2hpY2ggPT09IDEzIHx8IGUud2hpY2ggPT0gMzIpICYmIHRoYXQuJHNlYXJjaElucHV0LnZhbCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC4kc2VsZWN0QWxsLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGF0LmZpbHRlcigpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNoZWNrZWQgPSAkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSxcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMgPSB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoJzp2aXNpYmxlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCRpdGVtcy5sZW5ndGggPT09IHRoYXQuJHNlbGVjdEl0ZW1zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXRbY2hlY2tlZCA/ICdjaGVja0FsbCcgOiAndW5jaGVja0FsbCddKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyB3aGVuIHRoZSBmaWx0ZXIgb3B0aW9uIGlzIHRydWVcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RHcm91cHMucHJvcCgnY2hlY2tlZCcsIGNoZWNrZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtcy5wcm9wKCdjaGVja2VkJywgY2hlY2tlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zW2NoZWNrZWQgPyAnb25DaGVja0FsbCcgOiAnb25VbmNoZWNrQWxsJ10oKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLm9mZignY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSAkKHRoaXMpLnBhcmVudCgpLmF0dHIoJ2RhdGEtZ3JvdXAnKSxcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMgPSB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoJzp2aXNpYmxlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuID0gJGl0ZW1zLmZpbHRlcihzcHJpbnRmKCdbZGF0YS1ncm91cD1cIiVzXCJdJywgZ3JvdXApKSxcclxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkID0gJGNoaWxkcmVuLmxlbmd0aCAhPT0gJGNoaWxkcmVuLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgJGNoaWxkcmVuLnByb3AoJ2NoZWNrZWQnLCBjaGVja2VkKTtcclxuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlU2VsZWN0QWxsKCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uT3B0Z3JvdXBDbGljayh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICQodGhpcykucGFyZW50KCkudGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6IGNoZWNrZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46ICRjaGlsZHJlbi5nZXQoKSxcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZTogdGhhdFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGVTZWxlY3RBbGwoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZU9wdEdyb3VwU2VsZWN0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25DbGljayh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICQodGhpcykucGFyZW50KCkudGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAkKHRoaXMpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6ICQodGhpcykucHJvcCgnY2hlY2tlZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlOiB0aGF0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnNpbmdsZSAmJiB0aGF0Lm9wdGlvbnMuaXNPcGVuICYmICF0aGF0Lm9wdGlvbnMua2VlcE9wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5zaW5nbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2xpY2tlZFZhbCA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJCh0aGlzKS52YWwoKSAhPT0gY2xpY2tlZFZhbDtcclxuICAgICAgICAgICAgICAgICAgICB9KS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb3BlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy4kY2hvaWNlLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmlzT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5maW5kKCc+ZGl2JykuYWRkQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgICAgICAgdGhpcy4kZHJvcFt0aGlzLmFuaW1hdGVNZXRob2QoJ3Nob3cnKV0oKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGZpeCBmaWx0ZXIgYnVnOiBubyByZXN1bHRzIHNob3dcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEZpeCAjNzc6ICdBbGwgc2VsZWN0ZWQnIHdoZW4gbm8gb3B0aW9uc1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuJGVsLmNoaWxkcmVuKCkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250YWluZXIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLiRkcm9wLm9mZnNldCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5hcHBlbmRUbygkKHRoaXMub3B0aW9ucy5jb250YWluZXIpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRyb3Aub2Zmc2V0KHtcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IG9mZnNldC50b3AsXHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VhcmNoSW5wdXQudmFsKCcnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlYXJjaElucHV0LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbk9wZW4oKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjbG9zZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5maW5kKCc+ZGl2JykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgICAgICAgdGhpcy4kZHJvcFt0aGlzLmFuaW1hdGVNZXRob2QoJ2hpZGUnKV0oKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250YWluZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHBhcmVudC5hcHBlbmQodGhpcy4kZHJvcCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkcm9wLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgJ3RvcCc6ICdhdXRvJyxcclxuICAgICAgICAgICAgICAgICAgICAnbGVmdCc6ICdhdXRvJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2xvc2UoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBhbmltYXRlTWV0aG9kOiBmdW5jdGlvbiAobWV0aG9kKSB7XHJcbiAgICAgICAgICAgIHZhciBtZXRob2RzID0ge1xyXG4gICAgICAgICAgICAgICAgc2hvdzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGZhZGU6ICdmYWRlSW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlOiAnc2xpZGVEb3duJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGhpZGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBmYWRlOiAnZmFkZU91dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGU6ICdzbGlkZVVwJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZHNbbWV0aG9kXVt0aGlzLm9wdGlvbnMuYW5pbWF0ZV0gfHwgbWV0aG9kO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKGlzSW5pdCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZWN0cyA9IHRoaXMub3B0aW9ucy5kaXNwbGF5VmFsdWVzID8gdGhpcy5nZXRTZWxlY3RzKCkgOiB0aGlzLmdldFNlbGVjdHMoJ3RleHQnKSxcclxuICAgICAgICAgICAgICAgICRzcGFuID0gdGhpcy4kY2hvaWNlLmZpbmQoJz5zcGFuJyksXHJcbiAgICAgICAgICAgICAgICBzbCA9IHNlbGVjdHMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNsID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAkc3Bhbi5hZGRDbGFzcygncGxhY2Vob2xkZXInKS5odG1sKHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmFsbFNlbGVjdGVkICYmIHNsID09PSB0aGlzLiRzZWxlY3RJdGVtcy5sZW5ndGggKyB0aGlzLiRkaXNhYmxlSXRlbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAkc3Bhbi5yZW1vdmVDbGFzcygncGxhY2Vob2xkZXInKS5odG1sKHRoaXMub3B0aW9ucy5hbGxTZWxlY3RlZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmVsbGlwc2lzICYmIHNsID4gdGhpcy5vcHRpb25zLm1pbmltdW1Db3VudFNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAkc3Bhbi5yZW1vdmVDbGFzcygncGxhY2Vob2xkZXInKS50ZXh0KHNlbGVjdHMuc2xpY2UoMCwgdGhpcy5vcHRpb25zLm1pbmltdW1Db3VudFNlbGVjdGVkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIpICsgJy4uLicpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5jb3VudFNlbGVjdGVkICYmIHNsID4gdGhpcy5vcHRpb25zLm1pbmltdW1Db3VudFNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAkc3Bhbi5yZW1vdmVDbGFzcygncGxhY2Vob2xkZXInKS5odG1sKHRoaXMub3B0aW9ucy5jb3VudFNlbGVjdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJyMnLCBzZWxlY3RzLmxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgnJScsIHRoaXMuJHNlbGVjdEl0ZW1zLmxlbmd0aCArIHRoaXMuJGRpc2FibGVJdGVtcy5sZW5ndGgpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLnRleHQoc2VsZWN0cy5qb2luKHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hZGRUaXRsZSkge1xyXG4gICAgICAgICAgICAgICAgJHNwYW4ucHJvcCgndGl0bGUnLCB0aGlzLmdldFNlbGVjdHMoJ3RleHQnKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHNldCBzZWxlY3RzIHRvIHNlbGVjdFxyXG4gICAgICAgICAgICB0aGlzLiRlbC52YWwodGhpcy5nZXRTZWxlY3RzKCkpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG5cclxuICAgICAgICAgICAgLy8gYWRkIHNlbGVjdGVkIGNsYXNzIHRvIHNlbGVjdGVkIGxpXHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKCdpbnB1dDpjaGVja2VkJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJ2xpJykuZmlyc3QoKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyB0cmlnZ2VyIDxzZWxlY3Q+IGNoYW5nZSBldmVudFxyXG4gICAgICAgICAgICBpZiAoIWlzSW5pdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZWwudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB1cGRhdGVTZWxlY3RBbGw6IGZ1bmN0aW9uIChpc0luaXQpIHtcclxuICAgICAgICAgICAgdmFyICRpdGVtcyA9IHRoaXMuJHNlbGVjdEl0ZW1zO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFpc0luaXQpIHtcclxuICAgICAgICAgICAgICAgICRpdGVtcyA9ICRpdGVtcy5maWx0ZXIoJzp2aXNpYmxlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnLCAkaXRlbXMubGVuZ3RoICYmXHJcbiAgICAgICAgICAgICAgICAkaXRlbXMubGVuZ3RoID09PSAkaXRlbXMuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGlmICghaXNJbml0ICYmIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNoZWNrQWxsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB1cGRhdGVPcHRHcm91cFNlbGVjdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJGl0ZW1zID0gdGhpcy4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpO1xyXG4gICAgICAgICAgICAkLmVhY2godGhpcy4kc2VsZWN0R3JvdXBzLCBmdW5jdGlvbiAoaSwgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSAkKHZhbCkucGFyZW50KCkuYXR0cignZGF0YS1ncm91cCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9ICRpdGVtcy5maWx0ZXIoc3ByaW50ZignW2RhdGEtZ3JvdXA9XCIlc1wiXScsIGdyb3VwKSk7XHJcbiAgICAgICAgICAgICAgICAkKHZhbCkucHJvcCgnY2hlY2tlZCcsICRjaGlsZHJlbi5sZW5ndGggJiZcclxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4ubGVuZ3RoID09PSAkY2hpbGRyZW4uZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vdmFsdWUgb3IgdGV4dCwgZGVmYXVsdDogJ3ZhbHVlJ1xyXG4gICAgICAgIGdldFNlbGVjdHM6IGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHRleHRzID0gW10sXHJcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKHNwcmludGYoJ2lucHV0WyVzXTpjaGVja2VkJywgdGhpcy5zZWxlY3RJdGVtTmFtZSkpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dHMucHVzaCgkKHRoaXMpLnBhcmVudHMoJ2xpJykuZmlyc3QoKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICAgICAgdmFsdWVzLnB1c2goJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICd0ZXh0JyAmJiB0aGlzLiRzZWxlY3RHcm91cHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0cyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgPSAkLnRyaW0oJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cCA9ICQodGhpcykucGFyZW50KCkuZGF0YSgnZ3JvdXAnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuID0gdGhhdC4kZHJvcC5maW5kKHNwcmludGYoJ1slc11bZGF0YS1ncm91cD1cIiVzXCJdJywgdGhhdC5zZWxlY3RJdGVtTmFtZSwgZ3JvdXApKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGVjdGVkID0gJGNoaWxkcmVuLmZpbHRlcignOmNoZWNrZWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkc2VsZWN0ZWQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaCgnWycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaCh0ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJGNoaWxkcmVuLmxlbmd0aCA+ICRzZWxlY3RlZC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGVjdGVkLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKCQodGhpcykucGFyZW50KCkudGV4dCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaCgnOiAnICsgbGlzdC5qb2luKCcsICcpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKCddJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dHMucHVzaChodG1sLmpvaW4oJycpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlID09PSAndGV4dCcgPyB0ZXh0cyA6IHZhbHVlcztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZXRTZWxlY3RzOiBmdW5jdGlvbiAodmFsdWVzKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy4kZGlzYWJsZUl0ZW1zLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICQuZWFjaCh2YWx1ZXMsIGZ1bmN0aW9uIChpLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKHNwcmludGYoJ1t2YWx1ZT1cIiVzXCJdJywgdmFsdWUpKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LiRkaXNhYmxlSXRlbXMuZmlsdGVyKHNwcmludGYoJ1t2YWx1ZT1cIiVzXCJdJywgdmFsdWUpKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucHJvcCgnY2hlY2tlZCcsIHRoaXMuJHNlbGVjdEl0ZW1zLmxlbmd0aCA9PT1cclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGggKyB0aGlzLiRkaXNhYmxlSXRlbXMuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAkLmVhY2godGhhdC4kc2VsZWN0R3JvdXBzLCBmdW5jdGlvbiAoaSwgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSAkKHZhbCkucGFyZW50KCkuYXR0cignZGF0YS1ncm91cCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9IHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcignW2RhdGEtZ3JvdXA9XCInICsgZ3JvdXAgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgICAgICAkKHZhbCkucHJvcCgnY2hlY2tlZCcsICRjaGlsZHJlbi5sZW5ndGggJiZcclxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4ubGVuZ3RoID09PSAkY2hpbGRyZW4uZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNoZWNrQWxsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2hlY2tBbGwoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB1bmNoZWNrQWxsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uVW5jaGVja0FsbCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGZvY3VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5mb2N1cygpO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25Gb2N1cygpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGJsdXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmJsdXIoKTtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uQmx1cigpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHJlZnJlc2g6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgfSxcclxuXHRcdFxyXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLiRwYXJlbnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmRhdGEoJ211bHRpcGxlU2VsZWN0JywgbnVsbCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZmlsdGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHRleHQgPSAkLnRyaW0odGhpcy4kc2VhcmNoSW5wdXQudmFsKCkpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGV4dC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5wYXJlbnQoKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNhYmxlSXRlbXMucGFyZW50KCkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLnBhcmVudCgpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJG5vUmVzdWx0cy5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBhcmVudFtyZW1vdmVEaWFjcml0aWNzKCRwYXJlbnQudGV4dCgpLnRvTG93ZXJDYXNlKCkpLmluZGV4T2YocmVtb3ZlRGlhY3JpdGljcyh0ZXh0KSkgPCAwID8gJ2hpZGUnIDogJ3Nob3cnXSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNhYmxlSXRlbXMucGFyZW50KCkuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSAkcGFyZW50LmF0dHIoJ2RhdGEtZ3JvdXAnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW1zID0gdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICRwYXJlbnRbJGl0ZW1zLmZpbHRlcihzcHJpbnRmKCdbZGF0YS1ncm91cD1cIiVzXCJdJywgZ3JvdXApKS5sZW5ndGggPyAnc2hvdycgOiAnaGlkZSddKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIG5vIG1hdGNoZXMgZm91bmRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRzZWxlY3RJdGVtcy5wYXJlbnQoKS5maWx0ZXIoJzp2aXNpYmxlJykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJG5vUmVzdWx0cy5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy51cGRhdGVPcHRHcm91cFNlbGVjdCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdEFsbCgpO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25GaWx0ZXIodGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkLmZuLm11bHRpcGxlU2VsZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvcHRpb24gPSBhcmd1bWVudHNbMF0sXHJcbiAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHMsXHJcblxyXG4gICAgICAgICAgICB2YWx1ZSxcclxuICAgICAgICAgICAgYWxsb3dlZE1ldGhvZHMgPSBbXHJcbiAgICAgICAgICAgICAgICAnZ2V0U2VsZWN0cycsICdzZXRTZWxlY3RzJyxcclxuICAgICAgICAgICAgICAgICdlbmFibGUnLCAnZGlzYWJsZScsXHJcbiAgICAgICAgICAgICAgICAnb3BlbicsICdjbG9zZScsXHJcbiAgICAgICAgICAgICAgICAnY2hlY2tBbGwnLCAndW5jaGVja0FsbCcsXHJcbiAgICAgICAgICAgICAgICAnZm9jdXMnLCAnYmx1cicsXHJcbiAgICAgICAgICAgICAgICAncmVmcmVzaCcsICdkZXN0cm95J1xyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9ICR0aGlzLmRhdGEoJ211bHRpcGxlU2VsZWN0JyksXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gJC5leHRlbmQoe30sICQuZm4ubXVsdGlwbGVTZWxlY3QuZGVmYXVsdHMsXHJcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09PSAnb2JqZWN0JyAmJiBvcHRpb24pO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gbmV3IE11bHRpcGxlU2VsZWN0KCR0aGlzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoJ211bHRpcGxlU2VsZWN0JywgZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQuaW5BcnJheShvcHRpb24sIGFsbG93ZWRNZXRob2RzKSA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnVW5rbm93biBtZXRob2Q6ICcgKyBvcHRpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGRhdGFbb3B0aW9uXShhcmdzWzFdKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRhdGEuaW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFyZ3NbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGRhdGFbYXJnc1sxXV0uYXBwbHkoZGF0YSwgW10uc2xpY2UuY2FsbChhcmdzLCAyKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgPyB2YWx1ZSA6IHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgICQuZm4ubXVsdGlwbGVTZWxlY3QuZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgbmFtZTogJycsXHJcbiAgICAgICAgaXNPcGVuOiBmYWxzZSxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJycsXHJcbiAgICAgICAgc2VsZWN0QWxsOiB0cnVlLFxyXG4gICAgICAgIHNlbGVjdEFsbERlbGltaXRlcjogWydbJywgJ10nXSxcclxuICAgICAgICBtaW5pbXVtQ291bnRTZWxlY3RlZDogMyxcclxuICAgICAgICBlbGxpcHNpczogZmFsc2UsXHJcbiAgICAgICAgbXVsdGlwbGU6IGZhbHNlLFxyXG4gICAgICAgIG11bHRpcGxlV2lkdGg6IDgwLFxyXG4gICAgICAgIHNpbmdsZTogZmFsc2UsXHJcbiAgICAgICAgZmlsdGVyOiBmYWxzZSxcclxuICAgICAgICB3aWR0aDogdW5kZWZpbmVkLFxyXG4gICAgICAgIGRyb3BXaWR0aDogdW5kZWZpbmVkLFxyXG4gICAgICAgIG1heEhlaWdodDogMjUwLFxyXG4gICAgICAgIGNvbnRhaW5lcjogbnVsbCxcclxuICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbScsXHJcbiAgICAgICAga2VlcE9wZW46IGZhbHNlLFxyXG4gICAgICAgIGFuaW1hdGU6ICdub25lJywgLy8gJ25vbmUnLCAnZmFkZScsICdzbGlkZSdcclxuICAgICAgICBkaXNwbGF5VmFsdWVzOiBmYWxzZSxcclxuICAgICAgICBkZWxpbWl0ZXI6ICcsICcsXHJcbiAgICAgICAgYWRkVGl0bGU6IGZhbHNlLFxyXG4gICAgICAgIGZpbHRlckFjY2VwdE9uRW50ZXI6IGZhbHNlLFxyXG4gICAgICAgIGhpZGVPcHRncm91cENoZWNrYm94ZXM6IGZhbHNlLFxyXG5cclxuICAgICAgICBzZWxlY3RBbGxUZXh0OiAnU2VsZWN0IGFsbCcsXHJcbiAgICAgICAgYWxsU2VsZWN0ZWQ6ICdBbGwgc2VsZWN0ZWQnLFxyXG4gICAgICAgIGNvdW50U2VsZWN0ZWQ6ICcjIG9mICUgc2VsZWN0ZWQnLFxyXG4gICAgICAgIG5vTWF0Y2hlc0ZvdW5kOiAnTm8gbWF0Y2hlcyBmb3VuZCcsXHJcblxyXG4gICAgICAgIHN0eWxlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0ZXh0VGVtcGxhdGU6IGZ1bmN0aW9uICgkZWxtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkZWxtLmh0bWwoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxhYmVsVGVtcGxhdGU6IGZ1bmN0aW9uICgkZWxtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkZWxtLmF0dHIoJ2xhYmVsJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25PcGVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uQ2xvc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25DaGVja0FsbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvblVuY2hlY2tBbGw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25PcHRncm91cENsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25GaWx0ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICQoJ3NlbGVjdFttdWx0aXBsZV0nKS5tdWx0aXBsZVNlbGVjdCgpO1xyXG59KShqUXVlcnkpO1xyXG4iXX0=
