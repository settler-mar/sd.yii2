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

    var langlist = $("#sd_lang_list").data('json');
    var url_prefix = $("#sd_lang_list").data('url-prefix');
    var location = window.location.pathname;

    if (langlist) {
        var langKey = (location.length === 3 || location.substr(3,1) === '/') ? location.substr(1,2) : '';
        if (langKey && langlist[langKey]) {
            code = langlist[langKey];
            key = langKey;
        } else {
            key = 'ru';
            code = langlist[key] ? langlist[key] : '';
        }
    }
    return {
        code: code,
        key: key,
        href_prefix: url_prefix ? '/'+url_prefix : ''
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxhbmd1YWdlLmpzIiwibGFuZy5qcyIsImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsImpxdWVyeS11aS5taW4uanMiLCJ0b29sdGlwLmpzIiwiYWNjb3VudF9ub3RpZmljYXRpb24uanMiLCJzbGlkZXIuanMiLCJoZWFkZXJfbWVudV9hbmRfc2VhcmNoLmpzIiwiY2FsYy1jYXNoYmFjay5qcyIsImF1dG9faGlkZV9jb250cm9sLmpzIiwiaGlkZV9zaG93X2FsbC5qcyIsImNsb2NrLmpzIiwibGlzdF90eXBlX3N3aXRjaGVyLmpzIiwic2VsZWN0LmpzIiwic2VhcmNoLmpzIiwiZ290by5qcyIsImFjY291bnQtd2l0aGRyYXcuanMiLCJhamF4LmpzIiwiZG9icm8uanMiLCJsZWZ0LW1lbnUtdG9nZ2xlLmpzIiwic2hhcmU0Mi5qcyIsInVzZXJfcmV2aWV3cy5qcyIsInBsYWNlaG9sZGVyLmpzIiwiYWpheC1sb2FkLmpzIiwiYmFubmVyLmpzIiwiY291bnRyeV9zZWxlY3QuanMiLCJwcm9kdWN0X2ZpbHRlci5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsIm1vZGFscy5qcyIsImZvb3Rlcl9tZW51LmpzIiwicmF0aW5nLmpzIiwiZmF2b3JpdGVzLmpzIiwic2Nyb2xsX3RvLmpzIiwiY29weV90b19jbGlwYm9hcmQuanMiLCJpbWcuanMiLCJwYXJlbnRzX29wZW5fd2luZG93cy5qcyIsImZvcm1zLmpzIiwiY29va2llLmpzIiwidGFibGUuanMiLCJhamF4X3JlbW92ZS5qcyIsImZpeGVzLmpzIiwibGlua3MuanMiLCJzdG9yZV9wb2ludHMuanMiLCJoYXNodGFncy5qcyIsInBsdWdpbnMuanMiLCJtdWx0aXBsZS1zZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcmdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgbGcgPSAoZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGxhbmc9e307XHJcbiAgdXJsPScvbGFuZ3VhZ2UvJytkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZysnLmpzb24nO1xyXG4gICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgLy9jb25zb2xlLmxvZyhkYXRhKTtcclxuICAgIGZvcih2YXIgaW5kZXggaW4gZGF0YSkge1xyXG4gICAgICBkYXRhW2luZGV4XT1jbGVhclZhcihkYXRhW2luZGV4XSk7XHJcbiAgICB9XHJcbiAgICBsYW5nPWRhdGE7XHJcbiAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJsYW5ndWFnZV9sb2FkZWRcIik7XHJcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgIC8vY29uc29sZS5sb2coZGF0YSwgZXZlbnQpO1xyXG4gIH0sJ2pzb24nKTtcclxuXHJcbiAgZnVuY3Rpb24gY2xlYXJWYXIodHh0KXtcclxuICAgIHR4dD10eHQucmVwbGFjZSgvXFxzKy9nLFwiIFwiKTsvL9GD0LTQsNC70LXQvdC40LUg0LfQsNC00LLQvtC10L3QuNC1INC/0YDQvtCx0LXQu9C+0LJcclxuXHJcbiAgICAvL9Cn0LjRgdGC0LjQvCDQv9C+0LTRgdGC0LDQstC70Y/QtdC80YvQtSDQv9C10YDQtdC80LXQvdC90YvQtVxyXG4gICAgc3RyPXR4dC5tYXRjaCgvXFx7KC4qPylcXH0vZyk7XHJcbiAgICBpZiAoIHN0ciAhPSBudWxsKSB7XHJcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIHN0cl90PXN0cltpXS5yZXBsYWNlKC8gL2csXCJcIik7XHJcbiAgICAgICAgdHh0PXR4dC5yZXBsYWNlKHN0cltpXSxzdHJfdCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0eHQ7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZnVuY3Rpb24odHBsLCBkYXRhKXtcclxuICAgIGlmKHR5cGVvZihsYW5nW3RwbF0pPT1cInVuZGVmaW5lZFwiKXtcclxuICAgICAgY29uc29sZS5sb2coXCJsYW5nIG5vdCBmb3VuZDogXCIrdHBsKTtcclxuICAgICAgcmV0dXJuIHRwbDtcclxuICAgIH1cclxuICAgIHRwbD1sYW5nW3RwbF07XHJcbiAgICBpZih0eXBlb2YoZGF0YSk9PVwib2JqZWN0XCIpe1xyXG4gICAgICBmb3IodmFyIGluZGV4IGluIGRhdGEpIHtcclxuICAgICAgICB0cGw9dHBsLnNwbGl0KFwie1wiK2luZGV4K1wifVwiKS5qb2luKGRhdGFbaW5kZXhdKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRwbDtcclxuICB9XHJcbn0pKCk7IiwidmFyIGxhbmcgPSAoZnVuY3Rpb24oKXtcclxuICAgIHZhciBjb2RlID0gJyc7XHJcbiAgICB2YXIga2V5ID0gJyc7XHJcblxyXG4gICAgdmFyIGxhbmdsaXN0ID0gJChcIiNzZF9sYW5nX2xpc3RcIikuZGF0YSgnanNvbicpO1xyXG4gICAgdmFyIHVybF9wcmVmaXggPSAkKFwiI3NkX2xhbmdfbGlzdFwiKS5kYXRhKCd1cmwtcHJlZml4Jyk7XHJcbiAgICB2YXIgbG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XHJcblxyXG4gICAgaWYgKGxhbmdsaXN0KSB7XHJcbiAgICAgICAgdmFyIGxhbmdLZXkgPSAobG9jYXRpb24ubGVuZ3RoID09PSAzIHx8IGxvY2F0aW9uLnN1YnN0cigzLDEpID09PSAnLycpID8gbG9jYXRpb24uc3Vic3RyKDEsMikgOiAnJztcclxuICAgICAgICBpZiAobGFuZ0tleSAmJiBsYW5nbGlzdFtsYW5nS2V5XSkge1xyXG4gICAgICAgICAgICBjb2RlID0gbGFuZ2xpc3RbbGFuZ0tleV07XHJcbiAgICAgICAgICAgIGtleSA9IGxhbmdLZXk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAga2V5ID0gJ3J1JztcclxuICAgICAgICAgICAgY29kZSA9IGxhbmdsaXN0W2tleV0gPyBsYW5nbGlzdFtrZXldIDogJyc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgIGtleToga2V5LFxyXG4gICAgICAgIGhyZWZfcHJlZml4OiB1cmxfcHJlZml4ID8gJy8nK3VybF9wcmVmaXggOiAnJ1xyXG4gICAgfVxyXG59KSgpO1xyXG4iLCJvYmplY3RzID0gZnVuY3Rpb24gKGEsIGIpIHtcclxuICB2YXIgYyA9IGIsXHJcbiAgICBrZXk7XHJcbiAgZm9yIChrZXkgaW4gYSkge1xyXG4gICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGM7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBsb2dpbl9yZWRpcmVjdChuZXdfaHJlZikge1xyXG4gIGhyZWYgPSBsb2NhdGlvbi5ocmVmO1xyXG4gIGlmIChocmVmLmluZGV4T2YoJ3N0b3JlJykgPiAwIHx8IGhyZWYuaW5kZXhPZignY291cG9uJykgPiAwIHx8IGhyZWYuaW5kZXhPZigndXJsKCcpID4gMCkge1xyXG4gICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGxvY2F0aW9uLmhyZWYgPSBuZXdfaHJlZjtcclxuICB9XHJcbn1cclxuIiwiKGZ1bmN0aW9uICh3LCBkLCAkKSB7XHJcbiAgdmFyIHNsaWRlX2ludGVydmFsPTQwMDA7XHJcbiAgdmFyIHNjcm9sbHNfYmxvY2sgPSAkKCcuc2Nyb2xsX2JveCcpO1xyXG5cclxuICBpZiAoc2Nyb2xsc19ibG9jay5sZW5ndGggPT0gMCkgcmV0dXJuO1xyXG4gIC8vJCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpLndyYXBBbGwoc2Nyb2xsc19ibG9jayk7XHJcbiAgJChzY3JvbGxzX2Jsb2NrKS53cmFwKCc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC13cmFwXCI+PC9kaXY+Jyk7XHJcblxyXG4gIGluaXRfc2Nyb2xsKCk7XHJcbiAgY2FsY19zY3JvbGwoKTtcclxuXHJcbiAgJCh3aW5kb3cgKS5vbihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICBjYWxjX3Njcm9sbCgpO1xyXG4gIH0pO1xyXG4gIHZhciB0MSwgdDI7XHJcblxyXG4gICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24gKCkge1xyXG4gICAgY2xlYXJUaW1lb3V0KHQxKTtcclxuICAgIGNsZWFyVGltZW91dCh0Mik7XHJcbiAgICB0MSA9IHNldFRpbWVvdXQoY2FsY19zY3JvbGwsIDMwMCk7XHJcbiAgICB0MiA9IHNldFRpbWVvdXQoY2FsY19zY3JvbGwsIDgwMCk7XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRfc2Nyb2xsKCkge1xyXG4gICAgdmFyIGNvbnRyb2wgPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbFwiPjwvZGl2Pic7XHJcbiAgICBjb250cm9sID0gJChjb250cm9sKTtcclxuICAgIGNvbnRyb2wuaW5zZXJ0QWZ0ZXIoc2Nyb2xsc19ibG9jayk7XHJcbiAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApO1xyXG5cclxuICAgIHNjcm9sbHNfYmxvY2sucHJlcGVuZCgnPGRpdiBjbGFzcz1zY3JvbGxfYm94LW1vdmVyPjwvZGl2PicpO1xyXG5cclxuICAgIGNvbnRyb2wub24oJ2NsaWNrJywgJy5zY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgIHZhciBjb250cm9sID0gJHRoaXMucGFyZW50KCk7XHJcbiAgICAgIHZhciBpID0gJHRoaXMuaW5kZXgoKTtcclxuICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdhY3RpdmUnKSlyZXR1cm47XHJcbiAgICAgIGNvbnRyb2wuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgJHRoaXMuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgdmFyIGR4ID0gY29udHJvbC5kYXRhKCdzbGlkZS1keCcpO1xyXG4gICAgICB2YXIgZWwgPSBjb250cm9sLnByZXYoKTtcclxuICAgICAgZWwuZmluZCgnLnNjcm9sbF9ib3gtbW92ZXInKS5jc3MoJ21hcmdpbi1sZWZ0JywgLWR4ICogaSk7XHJcbiAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgaSk7XHJcblxyXG4gICAgICBzdG9wU2Nyb2wuYmluZChlbCkoKTtcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBmb3IgKHZhciBqID0gMDsgaiA8IHNjcm9sbHNfYmxvY2subGVuZ3RoOyBqKyspIHtcclxuICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaik7XHJcbiAgICBlbC5wYXJlbnQoKS5ob3ZlcihzdG9wU2Nyb2wuYmluZChlbCksIHN0YXJ0U2Nyb2wuYmluZChlbCkpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3RhcnRTY3JvbCgpIHtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICBpZiAoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xyXG5cclxuICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUuYmluZCgkdGhpcyksIHNsaWRlX2ludGVydmFsKTtcclxuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIHRpbWVvdXRJZClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN0b3BTY3JvbCgpIHtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICB2YXIgdGltZW91dElkID0gJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJyk7XHJcbiAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLCBmYWxzZSk7XHJcbiAgICBpZiAoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikgfHwgIXRpbWVvdXRJZClyZXR1cm47XHJcbiAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG5leHRfc2xpZGUoKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJywgZmFsc2UpO1xyXG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpKXJldHVybjtcclxuXHJcbiAgICB2YXIgY29udHJvbHMgPSAkdGhpcy5uZXh0KCkuZmluZCgnPionKTtcclxuICAgIHZhciBhY3RpdmUgPSAkdGhpcy5kYXRhKCdzbGlkZS1hY3RpdmUnKTtcclxuICAgIHZhciBwb2ludF9jbnQgPSBjb250cm9scy5sZW5ndGg7XHJcbiAgICBpZiAoIWFjdGl2ZSlhY3RpdmUgPSAwO1xyXG4gICAgYWN0aXZlKys7XHJcbiAgICBpZiAoYWN0aXZlID49IHBvaW50X2NudClhY3RpdmUgPSAwO1xyXG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJywgYWN0aXZlKTtcclxuXHJcbiAgICBjb250cm9scy5lcShhY3RpdmUpLmNsaWNrKCk7XHJcbiAgICBzdGFydFNjcm9sLmJpbmQoJHRoaXMpKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjYWxjX3Njcm9sbCgpIHtcclxuICAgIGZvciAoaSA9IDA7IGkgPCBzY3JvbGxzX2Jsb2NrLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaSk7XHJcbiAgICAgIHZhciBjb250cm9sID0gZWwubmV4dCgpO1xyXG4gICAgICB2YXIgd2lkdGhfbWF4ID0gZWwuZGF0YSgnc2Nyb2xsLXdpZHRoLW1heCcpO1xyXG4gICAgICB3ID0gZWwud2lkdGgoKTtcclxuXHJcbiAgICAgIC8v0LTQtdC70LDQtdC8INC60L7QvdGC0YDQvtC70Ywg0L7Qs9GA0LDQvdC40YfQtdC90LjRjyDRiNC40YDQuNC90YsuINCV0YHQu9C4INC/0YDQtdCy0YvRiNC10L3QviDRgtC+INC+0YLQutC70Y7Rh9Cw0LXQvCDRgdC60YDQvtC7INC4INC/0LXRgNC10YXQvtC00LjQvCDQuiDRgdC70LXQtNGD0Y7RidC10LzRgyDRjdC70LXQvNC10L3RgtGDXHJcbiAgICAgIGlmICh3aWR0aF9tYXggJiYgdyA+IHdpZHRoX21heCkge1xyXG4gICAgICAgIGNvbnRyb2wucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcclxuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgbm9fY2xhc3MgPSBlbC5kYXRhKCdzY3JvbGwtZWxlbWV0LWlnbm9yZS1jbGFzcycpO1xyXG4gICAgICB2YXIgY2hpbGRyZW4gPSBlbC5maW5kKCc+KicpLm5vdCgnLnNjcm9sbF9ib3gtbW92ZXInKTtcclxuICAgICAgaWYgKG5vX2NsYXNzKSB7XHJcbiAgICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5ub3QoJy4nICsgbm9fY2xhc3MpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8v0JXRgdC70Lgg0L3QtdGCINC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxyXG4gICAgICBpZiAoY2hpbGRyZW4gPT0gMCkge1xyXG4gICAgICAgIGVsLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XHJcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGZfZWwgPSBjaGlsZHJlbi5lcSgxKTtcclxuICAgICAgdmFyIGNoaWxkcmVuX3cgPSBmX2VsLm91dGVyV2lkdGgoKTsgLy/QstGB0LXQs9C+INC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxyXG4gICAgICBjaGlsZHJlbl93ICs9IHBhcnNlRmxvYXQoZl9lbC5jc3MoJ21hcmdpbi1sZWZ0JykpO1xyXG4gICAgICBjaGlsZHJlbl93ICs9IHBhcnNlRmxvYXQoZl9lbC5jc3MoJ21hcmdpbi1yaWdodCcpKTtcclxuXHJcbiAgICAgIHZhciBzY3JlYW5fY291bnQgPSBNYXRoLmZsb29yKHcgLyBjaGlsZHJlbl93KTtcclxuXHJcbiAgICAgIC8v0JXRgdC70Lgg0LLRgdC1INCy0LvQsNC30LjRgiDQvdCwINGN0LrRgNCw0L1cclxuICAgICAgaWYgKGNoaWxkcmVuIDw9IHNjcmVhbl9jb3VudCkge1xyXG4gICAgICAgIGVsLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XHJcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy/Qo9C20LUg0YLQvtGH0L3QviDQt9C90LDQtdC8INGH0YLQviDRgdC60YDQvtC7INC90YPQttC10L1cclxuICAgICAgZWwuYWRkQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcclxuXHJcbiAgICAgIHZhciBwb2ludF9jbnQgPSBjaGlsZHJlbi5sZW5ndGggLSBzY3JlYW5fY291bnQgKyAxO1xyXG4gICAgICAvL9C10YHQu9C4INC90LUg0L3QsNC00L4g0L7QsdC90L7QstC70Y/RgtGMINC60L7QvdGC0YDQvtC7INGC0L4g0LLRi9GF0L7QtNC40LwsINC90LUg0LfQsNCx0YvQstCw0Y8g0L7QsdC90L7QstC40YLRjCDRiNC40YDQuNC90YMg0LTQvtGH0LXRgNC90LjRhVxyXG4gICAgICBpZiAoY29udHJvbC5maW5kKCc+KicpLmxlbmd0aCA9PSBwb2ludF9jbnQpIHtcclxuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWR4JywgY2hpbGRyZW5fdyk7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFjdGl2ZSA9IGVsLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xyXG4gICAgICBpZiAoIWFjdGl2ZSlhY3RpdmUgPSAwO1xyXG4gICAgICBpZiAoYWN0aXZlID49IHBvaW50X2NudClhY3RpdmUgPSBwb2ludF9jbnQgLSAxO1xyXG4gICAgICB2YXIgb3V0ID0gJyc7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcG9pbnRfY250OyBqKyspIHtcclxuICAgICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnICsgKGogPT0gYWN0aXZlID8gJyBhY3RpdmUnIDogJycpICsgJ1wiPjwvZGl2Pic7XHJcbiAgICAgIH1cclxuICAgICAgY29udHJvbC5odG1sKG91dCk7XHJcblxyXG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XHJcbiAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtY291bnQnLCBwb2ludF9jbnQpO1xyXG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWR4JywgY2hpbGRyZW5fdyk7XHJcblxyXG4gICAgICBpZiAoIWVsLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpKSB7XHJcbiAgICAgICAgc3RhcnRTY3JvbC5iaW5kKGVsKSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSkpO1xyXG4iLCJ2YXIgYWNjb3JkaW9uQ29udHJvbCA9ICQoJy5hY2NvcmRpb24gLmFjY29yZGlvbi1jb250cm9sJyk7XHJcblxyXG5hY2NvcmRpb25Db250cm9sLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICAkYWNjb3JkaW9uID0gJHRoaXMuY2xvc2VzdCgnLmFjY29yZGlvbicpO1xyXG5cclxuXHJcbiAgaWYgKCRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi10aXRsZScpLmhhc0NsYXNzKCdhY2NvcmRpb24tdGl0bGUtZGlzYWJsZWQnKSlyZXR1cm47XHJcblxyXG4gIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgIC8qaWYoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJykpe1xyXG4gICAgIHJldHVybiBmYWxzZTtcclxuICAgICB9Ki9cclxuICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2xpZGVVcCgzMDApO1xyXG4gICAgJGFjY29yZGlvbi5yZW1vdmVDbGFzcygnb3BlbicpXHJcbiAgfSBlbHNlIHtcclxuICAgIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdhY2NvcmRpb24tb25seV9vbmUnKSkge1xyXG4gICAgICAkb3RoZXIgPSAkKCcuYWNjb3JkaW9uLW9ubHlfb25lJyk7XHJcbiAgICAgICRvdGhlci5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKVxyXG4gICAgICAgIC5zbGlkZVVwKDMwMClcclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xyXG4gICAgICAkb3RoZXIucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgJG90aGVyLnJlbW92ZUNsYXNzKCdsYXN0LW9wZW4nKTtcclxuXHJcbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xyXG4gICAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdsYXN0LW9wZW4nKTtcclxuICAgIH1cclxuICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2xpZGVEb3duKDMwMCk7XHJcbiAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdvcGVuJyk7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufSk7XHJcbmFjY29yZGlvbkNvbnRyb2wuc2hvdygpO1xyXG5cclxuXHJcbiQoJy5hY2NvcmRpb24td3JhcC5vcGVuX2ZpcnN0IC5hY2NvcmRpb246Zmlyc3QtY2hpbGQnKS5hZGRDbGFzcygnb3BlbicpO1xyXG4kKCcuYWNjb3JkaW9uLXdyYXAgLmFjY29yZGlvbi5hY2NvcmRpb24tc2xpbTpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XHJcbiQoJy5hY2NvcmRpb24tc2xpbScpLmFkZENsYXNzKCdhY2NvcmRpb24tb25seV9vbmUnKTtcclxuXHJcbi8v0LTQu9GPINGB0LjQvNC+0LIg0L7RgtC60YDRi9Cy0LDQtdC8INC10YHQu9C4INC10YHRgtGMINC/0L7QvNC10YLQutCwIG9wZW4g0YLQviDQv9GA0LjRgdCy0LDQuNCy0LDQtdC8INCy0YHQtSDQvtGB0YLQsNC70YzQvdGL0LUg0LrQu9Cw0YHRi1xyXG5hY2NvcmRpb25TbGltID0gJCgnLmFjY29yZGlvbi5hY2NvcmRpb24tb25seV9vbmUnKTtcclxuaWYgKGFjY29yZGlvblNsaW0ubGVuZ3RoID4gMCkge1xyXG4gIGFjY29yZGlvblNsaW0ucGFyZW50KCkuZmluZCgnLmFjY29yZGlvbi5vcGVuJylcclxuICAgIC5hZGRDbGFzcygnbGFzdC1vcGVuJylcclxuICAgIC5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKVxyXG4gICAgLnNob3coMzAwKVxyXG4gICAgLmFkZENsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcclxufVxyXG5cclxuJCgnYm9keScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAkKCcuYWNjb3JkaW9uX2Z1bGxzY3JlYW5fY2xvc2Uub3BlbiAuYWNjb3JkaW9uLWNvbnRyb2w6Zmlyc3QtY2hpbGQnKS5jbGljaygpXHJcbn0pO1xyXG5cclxuJCgnLmFjY29yZGlvbi1jb250ZW50Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICBpZiAoZS50YXJnZXQudGFnTmFtZSAhPSAnQScpIHtcclxuICAgICQodGhpcykuY2xvc2VzdCgnLmFjY29yZGlvbicpLmZpbmQoJy5hY2NvcmRpb24tY29udHJvbC5hY2NvcmRpb24tdGl0bGUnKS5jbGljaygpO1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxufSk7XHJcblxyXG4kKCcuYWNjb3JkaW9uLWNvbnRlbnQgYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gIGlmICgkdGhpcy5oYXNDbGFzcygnYW5nbGUtdXAnKSlyZXR1cm47XHJcbiAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG59KTtcclxuXHJcbihmdW5jdGlvbigpe1xyXG4gIHZhciBlbHMgPSAkKCcuYWNjb3JkaW9uX21vcmUnKTtcclxuXHJcbiAgZnVuY3Rpb24gYWRkQnV0dG9uKGVsLCBjbGFzc05hbWUsIHRpdGxlKSB7XHJcbiAgICAgIHZhciBidXR0b25zID0gJChlbCkuZmluZCgnLicrY2xhc3NOYW1lKTtcclxuICAgICAgaWYgKGJ1dHRvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICB2YXIgYnV0dG9uID0gJCgnPGRpdj4nKS5hZGRDbGFzcyhjbGFzc05hbWUpLmFkZENsYXNzKCdhY2NvcmRpb25fbW9yZV9idXR0b24nKTtcclxuICAgICAgICAgIHZhciBhID0gJCgnPGE+JykuYXR0cignaHJlZicsIFwiXCIpLmFkZENsYXNzKCdibHVlJykuaHRtbCh0aXRsZSk7XHJcbiAgICAgICAgICAkKGJ1dHRvbikuYXBwZW5kKGEpO1xyXG4gICAgICAgICAgJChlbCkuYXBwZW5kKGJ1dHRvbik7XHJcbiAgICAgIH1cclxuICB9XHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcuYWNjb3JkaW9uX21vcmVfYnV0dG9uX21vcmUnLCBmdW5jdGlvbihlKXtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb25fbW9yZScpLmFkZENsYXNzKCdvcGVuJyk7XHJcbiAgfSk7XHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcuYWNjb3JkaW9uX21vcmVfYnV0dG9uX2xlc3MnLCBmdW5jdGlvbihlKXtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb25fbW9yZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgfSk7XHJcblxyXG5cclxuXHJcbiAgZnVuY3Rpb24gcmVidWlsZCgpe1xyXG4gICAgJChlbHMpLmVhY2goZnVuY3Rpb24oa2V5LCBpdGVtKXtcclxuICAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICB2YXIgY29udGVudCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmFjY29yZGlvbl9tb3JlX2NvbnRlbnQnKTtcclxuICAgICAgaWYgKGNvbnRlbnQuc2Nyb2xsSGVpZ2h0ID4gY29udGVudC5jbGllbnRIZWlnaHQpIHtcclxuICAgICAgICBhZGRCdXR0b24oaXRlbSwgJ2FjY29yZGlvbl9tb3JlX2J1dHRvbl9tb3JlJywgJ9Cf0L7QtNGA0L7QsdC90LXQtScpO1xyXG4gICAgICAgIGFkZEJ1dHRvbihpdGVtLCAnYWNjb3JkaW9uX21vcmVfYnV0dG9uX2xlc3MnLCAn0KHQutGA0YvRgtGMJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJChpdGVtKS5maW5kKCcuYWNjb3JkaW9uX21vcmVfYnV0dG9uJykucmVtb3ZlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICB9XHJcblxyXG4gICQod2luZG93KS5yZXNpemUocmVidWlsZCk7XHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xhbmd1YWdlX2xvYWRlZCcsIGZ1bmN0aW9uKCl7XHJcbiAgICByZWJ1aWxkKCk7XHJcbiAgfSwgZmFsc2UpO1xyXG5cclxufSkoKTtcclxuXHJcblxyXG4iLCJmdW5jdGlvbiBhamF4Rm9ybShlbHMpIHtcclxuICB2YXIgZmlsZUFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiA/IHRydWUgOiBmYWxzZTtcclxuICB2YXIgZGVmYXVsdHMgPSB7XHJcbiAgICBlcnJvcl9jbGFzczogJy5oYXMtZXJyb3InXHJcbiAgfTtcclxuICB2YXIgbGFzdF9wb3N0ID0gZmFsc2U7XHJcblxyXG4gIGZ1bmN0aW9uIG9uUG9zdChwb3N0KSB7XHJcbiAgICBsYXN0X3Bvc3QgPSArbmV3IERhdGUoKTtcclxuICAgIC8vY29uc29sZS5sb2cocG9zdCwgdGhpcyk7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xyXG4gICAgdmFyIHdyYXBfaHRtbCA9IGRhdGEud3JhcF9odG1sO1xyXG5cclxuICAgIGlmIChwb3N0LnJlbmRlcikge1xyXG4gICAgICBwb3N0Lm5vdHlmeV9jbGFzcyA9IFwibm90aWZ5X3doaXRlXCI7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICBpZiAocG9zdC5odG1sKSB7XHJcbiAgICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XHJcbiAgICAgICAgYWpheEZvcm0od3JhcCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKCFwb3N0LmVycm9yKSB7XHJcbiAgICAgICAgICBmb3JtLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgICB3cmFwLmh0bWwod3JhcF9odG1sKTtcclxuICAgICAgICAgIGZvcm0uZmluZCgnaW5wdXRbdHlwZT10ZXh0XSx0ZXh0YXJlYScpLnZhbCgnJyk7XHJcbiAgICAgICAgICBhamF4Rm9ybSh3cmFwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHBvc3QuZXJyb3IgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgZm9yICh2YXIgaW5kZXggaW4gcG9zdC5lcnJvcikge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcclxuICAgICAgICAgICd0aXRsZSc6IHBvc3QudGl0bGUgPyBwb3N0LnRpdGxlIDogbGcoJ2Vycm9yJyksXHJcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QuZXJyb3JbaW5kZXhdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwb3N0LmVycm9yKSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvc3QuZXJyb3IubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICd0eXBlJzogJ2VycicsXHJcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IGxnKCdlcnJvcicpLFxyXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0LmVycm9yW2ldXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChwb3N0LmVycm9yIHx8IHBvc3QubWVzc2FnZSkge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgJ3R5cGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICdzdWNjZXNzJyA6ICdlcnInLFxyXG4gICAgICAgICAgJ3RpdGxlJzogcG9zdC50aXRsZSA/IHBvc3QudGl0bGUgOiAocG9zdC5lcnJvciA9PT0gZmFsc2UgPyBsZygnc3VjY2VzcycpIDogbGcoJ2Vycm9yJykpLFxyXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0Lm1lc3NhZ2UgPyBwb3N0Lm1lc3NhZ2UgOiBwb3N0LmVycm9yXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgIC8vICAgICAndHlwZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ3N1Y2Nlc3MnIDogJ2VycicsXHJcbiAgICAvLyAgICAgJ3RpdGxlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAn0KPRgdC/0LXRiNC90L4nIDogJ9Ce0YjQuNCx0LrQsCcsXHJcbiAgICAvLyAgICAgJ21lc3NhZ2UnOiBBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpID8gcG9zdC5lcnJvclswXSA6IChwb3N0Lm1lc3NhZ2UgPyBwb3N0Lm1lc3NhZ2UgOiBwb3N0LmVycm9yKVxyXG4gICAgLy8gfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvbkZhaWwoKSB7XHJcbiAgICBsYXN0X3Bvc3QgPSArbmV3IERhdGUoKTtcclxuICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xyXG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XHJcbiAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICB3cmFwLmh0bWwoXHJcbiAgICAgICAgJzxoMz4nK2xnKCdzb3JyeV9ub3RfZXhwZWN0ZWRfZXJyb3InKSsnPGgzPicgK1xyXG4gICAgICAgIGxnKCdpdF9oYXBwZW5zX3NvbWV0aW1lcycpXHJcbiAgICApO1xyXG4gICAgYWpheEZvcm0od3JhcCk7XHJcblxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25TdWJtaXQoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgLy9lLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgLy9lLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgIHZhciBjdXJyZW50VGltZU1pbGxpcyA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgaWYgKGN1cnJlbnRUaW1lTWlsbGlzIC0gbGFzdF9wb3N0IDwgMTAwMCAqIDIpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGxhc3RfcG9zdCA9IGN1cnJlbnRUaW1lTWlsbGlzO1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcclxuICAgIGRhdGEud3JhcF9odG1sPXdyYXAuaHRtbCgpO1xyXG4gICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xyXG5cclxuICAgIC8vaW5pdCh3cmFwKTtcclxuXHJcbiAgICB2YXIgcmVxdWlyZWQgPSBmb3JtLmZpbmQoJ2lucHV0LnJlcXVpcmVkLCB0ZXh0YXJlYS5yZXF1aXJlZCwgaW5wdXRbaWQ9XCJzdXBwb3J0LXJlY2FwdGNoYVwiXScpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXF1aXJlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgaGVscEJsb2NrID0gcmVxdWlyZWQuZXEoaSkuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5maW5kKCcuaGVscC1ibG9jaycpO1xyXG4gICAgICB2YXIgaGVscE1lc3NhZ2UgPSBoZWxwQmxvY2sgJiYgaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA/IGhlbHBCbG9jay5kYXRhKCdtZXNzYWdlJykgOiBsZygncmVxdWlyZWQnKTtcclxuXHJcbiAgICAgIGlmIChyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgJChoZWxwQmxvY2spLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgIGhlbHBCbG9jay5odG1sKGhlbHBNZXNzYWdlKTtcclxuICAgICAgICBoZWxwQmxvY2suYWRkQ2xhc3MoJ2hlbHAtYmxvY2stZXJyb3InKTtcclxuICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaGVscEJsb2NrLmh0bWwoJycpO1xyXG4gICAgICAgICQoaGVscEJsb2NrKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcclxuICAgICAgICBoZWxwQmxvY2sucmVtb3ZlQ2xhc3MoJ2hlbHAtYmxvY2stZXJyb3InKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZm9ybS55aWlBY3RpdmVGb3JtKSB7XHJcbiAgICAgIGZvcm0ub2ZmKCdhZnRlclZhbGlkYXRlJyk7XHJcbiAgICAgIGZvcm0ub24oJ2FmdGVyVmFsaWRhdGUnLCB5aWlWYWxpZGF0aW9uLmJpbmQoZGF0YSkpO1xyXG5cclxuICAgICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScsIHRydWUpO1xyXG4gICAgICB2YXIgZCA9IGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScpO1xyXG4gICAgICBpZiAoZCkge1xyXG4gICAgICAgIGQudmFsaWRhdGVkID0gdHJ1ZTtcclxuICAgICAgICBmb3JtLmRhdGEoJ3lpaUFjdGl2ZUZvcm0nLCBkKTtcclxuICAgICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJyk7XHJcbiAgICAgICAgaXNWYWxpZCA9IGQudmFsaWRhdGVkO1xyXG4gICAgICB9XHJcbiAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGlzVmFsaWQgPSBpc1ZhbGlkICYmIChmb3JtLmZpbmQoZGF0YS5wYXJhbS5lcnJvcl9jbGFzcykubGVuZ3RoID09IDApO1xyXG5cclxuICAgIGlmICghaXNWYWxpZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgc2VuZEZvcm0oZGF0YSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB5aWlWYWxpZGF0aW9uKGUpIHtcclxuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xyXG5cclxuICAgIGlmKGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGggPT0gMCl7XHJcbiAgICAgIHNlbmRGb3JtKHRoaXMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZW5kRm9ybShkYXRhKXtcclxuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xyXG5cclxuICAgIGlmICghZm9ybS5zZXJpYWxpemVPYmplY3QpYWRkU1JPKCk7XHJcblxyXG4gICAgdmFyIHBvc3REYXRhID0gZm9ybS5zZXJpYWxpemVPYmplY3QoKTtcclxuICAgIGZvcm0uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIGZvcm0uaHRtbCgnJyk7XHJcbiAgICBkYXRhLndyYXAuaHRtbCgnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxwPicrbGcoJ3NlbmRpbmdfZGF0YScpKyc8L3A+PC9kaXY+Jyk7XHJcblxyXG4gICAgZGF0YS51cmwgKz0gKGRhdGEudXJsLmluZGV4T2YoJz8nKSA+IDAgPyAnJicgOiAnPycpICsgJ3JjPScgKyBNYXRoLnJhbmRvbSgpO1xyXG4gICAgLy9jb25zb2xlLmxvZyhkYXRhLnVybCk7XHJcblxyXG4gICAgLyppZighcG9zdERhdGEucmV0dXJuVXJsKXtcclxuICAgICAgcG9zdERhdGEucmV0dXJuVXJsPWxvY2F0aW9uLmhyZWY7XHJcbiAgICB9Ki9cclxuXHJcbiAgICBpZih0eXBlb2YgbGFuZyAhPSBcInVuZGVmaW5lZFwiICYmIGRhdGEudXJsLmluZGV4T2YobGFuZ1tcImhyZWZfcHJlZml4XCJdKT09LTEpe1xyXG4gICAgICBkYXRhLnVybD1cIi9cIitsYW5nW1wiaHJlZl9wcmVmaXhcIl0rZGF0YS51cmw7XHJcbiAgICAgIGRhdGEudXJsPWRhdGEudXJsLnJlcGxhY2UoJy8vJywnLycpLnJlcGxhY2UoJy8vJywnLycpO1xyXG4gICAgfVxyXG5cclxuICAgICQucG9zdChcclxuICAgICAgZGF0YS51cmwsXHJcbiAgICAgIHBvc3REYXRhLFxyXG4gICAgICBvblBvc3QuYmluZChkYXRhKSxcclxuICAgICAgJ2pzb24nXHJcbiAgICApLmZhaWwob25GYWlsLmJpbmQoZGF0YSkpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdCh3cmFwKSB7XHJcbiAgICBmb3JtID0gd3JhcC5maW5kKCdmb3JtJyk7XHJcbiAgICBkYXRhID0ge1xyXG4gICAgICBmb3JtOiBmb3JtLFxyXG4gICAgICBwYXJhbTogZGVmYXVsdHMsXHJcbiAgICAgIHdyYXA6IHdyYXBcclxuICAgIH07XHJcbiAgICBkYXRhLnVybCA9IGZvcm0uYXR0cignYWN0aW9uJykgfHwgbG9jYXRpb24uaHJlZjtcclxuICAgIGRhdGEubWV0aG9kID0gZm9ybS5hdHRyKCdtZXRob2QnKSB8fCAncG9zdCc7XHJcbiAgICBmb3JtLnVuYmluZCgnc3VibWl0Jyk7XHJcbiAgICAvL2Zvcm0ub2ZmKCdzdWJtaXQnKTtcclxuICAgIGZvcm0ub24oJ3N1Ym1pdCcsIG9uU3VibWl0LmJpbmQoZGF0YSkpO1xyXG4gIH1cclxuXHJcbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxyXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXHJcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcclxuXHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpbml0KGVscy5lcShpKSk7XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIHBsYWNlaG9sZGVyID09ICdmdW5jdGlvbicpIHtcclxuICAgICAgcGxhY2Vob2xkZXIoKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRTUk8oKSB7XHJcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbyA9IHt9O1xyXG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XHJcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAob1t0aGlzLm5hbWVdKSB7XHJcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xyXG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9bdGhpcy5uYW1lXSA9IHRoaXMudmFsdWUgfHwgJyc7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG87XHJcbiAgfTtcclxufTtcclxuYWRkU1JPKCk7IiwiLyohIGpRdWVyeSBVSSAtIHYxLjEyLjEgLSAyMDE4LTEyLTIwXG4qIGh0dHA6Ly9qcXVlcnl1aS5jb21cbiogSW5jbHVkZXM6IHdpZGdldC5qcywgcG9zaXRpb24uanMsIGZvcm0tcmVzZXQtbWl4aW4uanMsIGtleWNvZGUuanMsIGxhYmVscy5qcywgdW5pcXVlLWlkLmpzLCB3aWRnZXRzL2F1dG9jb21wbGV0ZS5qcywgd2lkZ2V0cy9kYXRlcGlja2VyLmpzLCB3aWRnZXRzL21lbnUuanMsIHdpZGdldHMvbW91c2UuanMsIHdpZGdldHMvc2VsZWN0bWVudS5qcywgd2lkZ2V0cy9zbGlkZXIuanNcbiogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnM7IExpY2Vuc2VkIE1JVCAqL1xuXG4oZnVuY3Rpb24odCl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJqcXVlcnlcIl0sdCk6dChqUXVlcnkpfSkoZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSh0KXtmb3IodmFyIGUsaTt0Lmxlbmd0aCYmdFswXSE9PWRvY3VtZW50Oyl7aWYoZT10LmNzcyhcInBvc2l0aW9uXCIpLChcImFic29sdXRlXCI9PT1lfHxcInJlbGF0aXZlXCI9PT1lfHxcImZpeGVkXCI9PT1lKSYmKGk9cGFyc2VJbnQodC5jc3MoXCJ6SW5kZXhcIiksMTApLCFpc05hTihpKSYmMCE9PWkpKXJldHVybiBpO3Q9dC5wYXJlbnQoKX1yZXR1cm4gMH1mdW5jdGlvbiBpKCl7dGhpcy5fY3VySW5zdD1udWxsLHRoaXMuX2tleUV2ZW50PSExLHRoaXMuX2Rpc2FibGVkSW5wdXRzPVtdLHRoaXMuX2RhdGVwaWNrZXJTaG93aW5nPSExLHRoaXMuX2luRGlhbG9nPSExLHRoaXMuX21haW5EaXZJZD1cInVpLWRhdGVwaWNrZXItZGl2XCIsdGhpcy5faW5saW5lQ2xhc3M9XCJ1aS1kYXRlcGlja2VyLWlubGluZVwiLHRoaXMuX2FwcGVuZENsYXNzPVwidWktZGF0ZXBpY2tlci1hcHBlbmRcIix0aGlzLl90cmlnZ2VyQ2xhc3M9XCJ1aS1kYXRlcGlja2VyLXRyaWdnZXJcIix0aGlzLl9kaWFsb2dDbGFzcz1cInVpLWRhdGVwaWNrZXItZGlhbG9nXCIsdGhpcy5fZGlzYWJsZUNsYXNzPVwidWktZGF0ZXBpY2tlci1kaXNhYmxlZFwiLHRoaXMuX3Vuc2VsZWN0YWJsZUNsYXNzPVwidWktZGF0ZXBpY2tlci11bnNlbGVjdGFibGVcIix0aGlzLl9jdXJyZW50Q2xhc3M9XCJ1aS1kYXRlcGlja2VyLWN1cnJlbnQtZGF5XCIsdGhpcy5fZGF5T3ZlckNsYXNzPVwidWktZGF0ZXBpY2tlci1kYXlzLWNlbGwtb3ZlclwiLHRoaXMucmVnaW9uYWw9W10sdGhpcy5yZWdpb25hbFtcIlwiXT17Y2xvc2VUZXh0OlwiRG9uZVwiLHByZXZUZXh0OlwiUHJldlwiLG5leHRUZXh0OlwiTmV4dFwiLGN1cnJlbnRUZXh0OlwiVG9kYXlcIixtb250aE5hbWVzOltcIkphbnVhcnlcIixcIkZlYnJ1YXJ5XCIsXCJNYXJjaFwiLFwiQXByaWxcIixcIk1heVwiLFwiSnVuZVwiLFwiSnVseVwiLFwiQXVndXN0XCIsXCJTZXB0ZW1iZXJcIixcIk9jdG9iZXJcIixcIk5vdmVtYmVyXCIsXCJEZWNlbWJlclwiXSxtb250aE5hbWVzU2hvcnQ6W1wiSmFuXCIsXCJGZWJcIixcIk1hclwiLFwiQXByXCIsXCJNYXlcIixcIkp1blwiLFwiSnVsXCIsXCJBdWdcIixcIlNlcFwiLFwiT2N0XCIsXCJOb3ZcIixcIkRlY1wiXSxkYXlOYW1lczpbXCJTdW5kYXlcIixcIk1vbmRheVwiLFwiVHVlc2RheVwiLFwiV2VkbmVzZGF5XCIsXCJUaHVyc2RheVwiLFwiRnJpZGF5XCIsXCJTYXR1cmRheVwiXSxkYXlOYW1lc1Nob3J0OltcIlN1blwiLFwiTW9uXCIsXCJUdWVcIixcIldlZFwiLFwiVGh1XCIsXCJGcmlcIixcIlNhdFwiXSxkYXlOYW1lc01pbjpbXCJTdVwiLFwiTW9cIixcIlR1XCIsXCJXZVwiLFwiVGhcIixcIkZyXCIsXCJTYVwiXSx3ZWVrSGVhZGVyOlwiV2tcIixkYXRlRm9ybWF0OlwibW0vZGQveXlcIixmaXJzdERheTowLGlzUlRMOiExLHNob3dNb250aEFmdGVyWWVhcjohMSx5ZWFyU3VmZml4OlwiXCJ9LHRoaXMuX2RlZmF1bHRzPXtzaG93T246XCJmb2N1c1wiLHNob3dBbmltOlwiZmFkZUluXCIsc2hvd09wdGlvbnM6e30sZGVmYXVsdERhdGU6bnVsbCxhcHBlbmRUZXh0OlwiXCIsYnV0dG9uVGV4dDpcIi4uLlwiLGJ1dHRvbkltYWdlOlwiXCIsYnV0dG9uSW1hZ2VPbmx5OiExLGhpZGVJZk5vUHJldk5leHQ6ITEsbmF2aWdhdGlvbkFzRGF0ZUZvcm1hdDohMSxnb3RvQ3VycmVudDohMSxjaGFuZ2VNb250aDohMSxjaGFuZ2VZZWFyOiExLHllYXJSYW5nZTpcImMtMTA6YysxMFwiLHNob3dPdGhlck1vbnRoczohMSxzZWxlY3RPdGhlck1vbnRoczohMSxzaG93V2VlazohMSxjYWxjdWxhdGVXZWVrOnRoaXMuaXNvODYwMVdlZWssc2hvcnRZZWFyQ3V0b2ZmOlwiKzEwXCIsbWluRGF0ZTpudWxsLG1heERhdGU6bnVsbCxkdXJhdGlvbjpcImZhc3RcIixiZWZvcmVTaG93RGF5Om51bGwsYmVmb3JlU2hvdzpudWxsLG9uU2VsZWN0Om51bGwsb25DaGFuZ2VNb250aFllYXI6bnVsbCxvbkNsb3NlOm51bGwsbnVtYmVyT2ZNb250aHM6MSxzaG93Q3VycmVudEF0UG9zOjAsc3RlcE1vbnRoczoxLHN0ZXBCaWdNb250aHM6MTIsYWx0RmllbGQ6XCJcIixhbHRGb3JtYXQ6XCJcIixjb25zdHJhaW5JbnB1dDohMCxzaG93QnV0dG9uUGFuZWw6ITEsYXV0b1NpemU6ITEsZGlzYWJsZWQ6ITF9LHQuZXh0ZW5kKHRoaXMuX2RlZmF1bHRzLHRoaXMucmVnaW9uYWxbXCJcIl0pLHRoaXMucmVnaW9uYWwuZW49dC5leHRlbmQoITAse30sdGhpcy5yZWdpb25hbFtcIlwiXSksdGhpcy5yZWdpb25hbFtcImVuLVVTXCJdPXQuZXh0ZW5kKCEwLHt9LHRoaXMucmVnaW9uYWwuZW4pLHRoaXMuZHBEaXY9cyh0KFwiPGRpdiBpZD0nXCIrdGhpcy5fbWFpbkRpdklkK1wiJyBjbGFzcz0ndWktZGF0ZXBpY2tlciB1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnQgdWktaGVscGVyLWNsZWFyZml4IHVpLWNvcm5lci1hbGwnPjwvZGl2PlwiKSl9ZnVuY3Rpb24gcyhlKXt2YXIgaT1cImJ1dHRvbiwgLnVpLWRhdGVwaWNrZXItcHJldiwgLnVpLWRhdGVwaWNrZXItbmV4dCwgLnVpLWRhdGVwaWNrZXItY2FsZW5kYXIgdGQgYVwiO3JldHVybiBlLm9uKFwibW91c2VvdXRcIixpLGZ1bmN0aW9uKCl7dCh0aGlzKS5yZW1vdmVDbGFzcyhcInVpLXN0YXRlLWhvdmVyXCIpLC0xIT09dGhpcy5jbGFzc05hbWUuaW5kZXhPZihcInVpLWRhdGVwaWNrZXItcHJldlwiKSYmdCh0aGlzKS5yZW1vdmVDbGFzcyhcInVpLWRhdGVwaWNrZXItcHJldi1ob3ZlclwiKSwtMSE9PXRoaXMuY2xhc3NOYW1lLmluZGV4T2YoXCJ1aS1kYXRlcGlja2VyLW5leHRcIikmJnQodGhpcykucmVtb3ZlQ2xhc3MoXCJ1aS1kYXRlcGlja2VyLW5leHQtaG92ZXJcIil9KS5vbihcIm1vdXNlb3ZlclwiLGksbil9ZnVuY3Rpb24gbigpe3QuZGF0ZXBpY2tlci5faXNEaXNhYmxlZERhdGVwaWNrZXIobC5pbmxpbmU/bC5kcERpdi5wYXJlbnQoKVswXTpsLmlucHV0WzBdKXx8KHQodGhpcykucGFyZW50cyhcIi51aS1kYXRlcGlja2VyLWNhbGVuZGFyXCIpLmZpbmQoXCJhXCIpLnJlbW92ZUNsYXNzKFwidWktc3RhdGUtaG92ZXJcIiksdCh0aGlzKS5hZGRDbGFzcyhcInVpLXN0YXRlLWhvdmVyXCIpLC0xIT09dGhpcy5jbGFzc05hbWUuaW5kZXhPZihcInVpLWRhdGVwaWNrZXItcHJldlwiKSYmdCh0aGlzKS5hZGRDbGFzcyhcInVpLWRhdGVwaWNrZXItcHJldi1ob3ZlclwiKSwtMSE9PXRoaXMuY2xhc3NOYW1lLmluZGV4T2YoXCJ1aS1kYXRlcGlja2VyLW5leHRcIikmJnQodGhpcykuYWRkQ2xhc3MoXCJ1aS1kYXRlcGlja2VyLW5leHQtaG92ZXJcIikpfWZ1bmN0aW9uIG8oZSxpKXt0LmV4dGVuZChlLGkpO2Zvcih2YXIgcyBpbiBpKW51bGw9PWlbc10mJihlW3NdPWlbc10pO3JldHVybiBlfXQudWk9dC51aXx8e30sdC51aS52ZXJzaW9uPVwiMS4xMi4xXCI7dmFyIGE9MCxyPUFycmF5LnByb3RvdHlwZS5zbGljZTt0LmNsZWFuRGF0YT1mdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24oaSl7dmFyIHMsbixvO2ZvcihvPTA7bnVsbCE9KG49aVtvXSk7bysrKXRyeXtzPXQuX2RhdGEobixcImV2ZW50c1wiKSxzJiZzLnJlbW92ZSYmdChuKS50cmlnZ2VySGFuZGxlcihcInJlbW92ZVwiKX1jYXRjaChhKXt9ZShpKX19KHQuY2xlYW5EYXRhKSx0LndpZGdldD1mdW5jdGlvbihlLGkscyl7dmFyIG4sbyxhLHI9e30sbD1lLnNwbGl0KFwiLlwiKVswXTtlPWUuc3BsaXQoXCIuXCIpWzFdO3ZhciBoPWwrXCItXCIrZTtyZXR1cm4gc3x8KHM9aSxpPXQuV2lkZ2V0KSx0LmlzQXJyYXkocykmJihzPXQuZXh0ZW5kLmFwcGx5KG51bGwsW3t9XS5jb25jYXQocykpKSx0LmV4cHJbXCI6XCJdW2gudG9Mb3dlckNhc2UoKV09ZnVuY3Rpb24oZSl7cmV0dXJuISF0LmRhdGEoZSxoKX0sdFtsXT10W2xdfHx7fSxuPXRbbF1bZV0sbz10W2xdW2VdPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuX2NyZWF0ZVdpZGdldD8oYXJndW1lbnRzLmxlbmd0aCYmdGhpcy5fY3JlYXRlV2lkZ2V0KHQsZSksdm9pZCAwKTpuZXcgbyh0LGUpfSx0LmV4dGVuZChvLG4se3ZlcnNpb246cy52ZXJzaW9uLF9wcm90bzp0LmV4dGVuZCh7fSxzKSxfY2hpbGRDb25zdHJ1Y3RvcnM6W119KSxhPW5ldyBpLGEub3B0aW9ucz10LndpZGdldC5leHRlbmQoe30sYS5vcHRpb25zKSx0LmVhY2gocyxmdW5jdGlvbihlLHMpe3JldHVybiB0LmlzRnVuY3Rpb24ocyk/KHJbZV09ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7cmV0dXJuIGkucHJvdG90eXBlW2VdLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1mdW5jdGlvbiBuKHQpe3JldHVybiBpLnByb3RvdHlwZVtlXS5hcHBseSh0aGlzLHQpfXJldHVybiBmdW5jdGlvbigpe3ZhciBlLGk9dGhpcy5fc3VwZXIsbz10aGlzLl9zdXBlckFwcGx5O3JldHVybiB0aGlzLl9zdXBlcj10LHRoaXMuX3N1cGVyQXBwbHk9bixlPXMuYXBwbHkodGhpcyxhcmd1bWVudHMpLHRoaXMuX3N1cGVyPWksdGhpcy5fc3VwZXJBcHBseT1vLGV9fSgpLHZvaWQgMCk6KHJbZV09cyx2b2lkIDApfSksby5wcm90b3R5cGU9dC53aWRnZXQuZXh0ZW5kKGEse3dpZGdldEV2ZW50UHJlZml4Om4/YS53aWRnZXRFdmVudFByZWZpeHx8ZTplfSxyLHtjb25zdHJ1Y3RvcjpvLG5hbWVzcGFjZTpsLHdpZGdldE5hbWU6ZSx3aWRnZXRGdWxsTmFtZTpofSksbj8odC5lYWNoKG4uX2NoaWxkQ29uc3RydWN0b3JzLGZ1bmN0aW9uKGUsaSl7dmFyIHM9aS5wcm90b3R5cGU7dC53aWRnZXQocy5uYW1lc3BhY2UrXCIuXCIrcy53aWRnZXROYW1lLG8saS5fcHJvdG8pfSksZGVsZXRlIG4uX2NoaWxkQ29uc3RydWN0b3JzKTppLl9jaGlsZENvbnN0cnVjdG9ycy5wdXNoKG8pLHQud2lkZ2V0LmJyaWRnZShlLG8pLG99LHQud2lkZ2V0LmV4dGVuZD1mdW5jdGlvbihlKXtmb3IodmFyIGkscyxuPXIuY2FsbChhcmd1bWVudHMsMSksbz0wLGE9bi5sZW5ndGg7YT5vO28rKylmb3IoaSBpbiBuW29dKXM9bltvXVtpXSxuW29dLmhhc093blByb3BlcnR5KGkpJiZ2b2lkIDAhPT1zJiYoZVtpXT10LmlzUGxhaW5PYmplY3Qocyk/dC5pc1BsYWluT2JqZWN0KGVbaV0pP3Qud2lkZ2V0LmV4dGVuZCh7fSxlW2ldLHMpOnQud2lkZ2V0LmV4dGVuZCh7fSxzKTpzKTtyZXR1cm4gZX0sdC53aWRnZXQuYnJpZGdlPWZ1bmN0aW9uKGUsaSl7dmFyIHM9aS5wcm90b3R5cGUud2lkZ2V0RnVsbE5hbWV8fGU7dC5mbltlXT1mdW5jdGlvbihuKXt2YXIgbz1cInN0cmluZ1wiPT10eXBlb2YgbixhPXIuY2FsbChhcmd1bWVudHMsMSksbD10aGlzO3JldHVybiBvP3RoaXMubGVuZ3RofHxcImluc3RhbmNlXCIhPT1uP3RoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBpLG89dC5kYXRhKHRoaXMscyk7cmV0dXJuXCJpbnN0YW5jZVwiPT09bj8obD1vLCExKTpvP3QuaXNGdW5jdGlvbihvW25dKSYmXCJfXCIhPT1uLmNoYXJBdCgwKT8oaT1vW25dLmFwcGx5KG8sYSksaSE9PW8mJnZvaWQgMCE9PWk/KGw9aSYmaS5qcXVlcnk/bC5wdXNoU3RhY2soaS5nZXQoKSk6aSwhMSk6dm9pZCAwKTp0LmVycm9yKFwibm8gc3VjaCBtZXRob2QgJ1wiK24rXCInIGZvciBcIitlK1wiIHdpZGdldCBpbnN0YW5jZVwiKTp0LmVycm9yKFwiY2Fubm90IGNhbGwgbWV0aG9kcyBvbiBcIitlK1wiIHByaW9yIHRvIGluaXRpYWxpemF0aW9uOyBcIitcImF0dGVtcHRlZCB0byBjYWxsIG1ldGhvZCAnXCIrbitcIidcIil9KTpsPXZvaWQgMDooYS5sZW5ndGgmJihuPXQud2lkZ2V0LmV4dGVuZC5hcHBseShudWxsLFtuXS5jb25jYXQoYSkpKSx0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgZT10LmRhdGEodGhpcyxzKTtlPyhlLm9wdGlvbihufHx7fSksZS5faW5pdCYmZS5faW5pdCgpKTp0LmRhdGEodGhpcyxzLG5ldyBpKG4sdGhpcykpfSkpLGx9fSx0LldpZGdldD1mdW5jdGlvbigpe30sdC5XaWRnZXQuX2NoaWxkQ29uc3RydWN0b3JzPVtdLHQuV2lkZ2V0LnByb3RvdHlwZT17d2lkZ2V0TmFtZTpcIndpZGdldFwiLHdpZGdldEV2ZW50UHJlZml4OlwiXCIsZGVmYXVsdEVsZW1lbnQ6XCI8ZGl2PlwiLG9wdGlvbnM6e2NsYXNzZXM6e30sZGlzYWJsZWQ6ITEsY3JlYXRlOm51bGx9LF9jcmVhdGVXaWRnZXQ6ZnVuY3Rpb24oZSxpKXtpPXQoaXx8dGhpcy5kZWZhdWx0RWxlbWVudHx8dGhpcylbMF0sdGhpcy5lbGVtZW50PXQoaSksdGhpcy51dWlkPWErKyx0aGlzLmV2ZW50TmFtZXNwYWNlPVwiLlwiK3RoaXMud2lkZ2V0TmFtZSt0aGlzLnV1aWQsdGhpcy5iaW5kaW5ncz10KCksdGhpcy5ob3ZlcmFibGU9dCgpLHRoaXMuZm9jdXNhYmxlPXQoKSx0aGlzLmNsYXNzZXNFbGVtZW50TG9va3VwPXt9LGkhPT10aGlzJiYodC5kYXRhKGksdGhpcy53aWRnZXRGdWxsTmFtZSx0aGlzKSx0aGlzLl9vbighMCx0aGlzLmVsZW1lbnQse3JlbW92ZTpmdW5jdGlvbih0KXt0LnRhcmdldD09PWkmJnRoaXMuZGVzdHJveSgpfX0pLHRoaXMuZG9jdW1lbnQ9dChpLnN0eWxlP2kub3duZXJEb2N1bWVudDppLmRvY3VtZW50fHxpKSx0aGlzLndpbmRvdz10KHRoaXMuZG9jdW1lbnRbMF0uZGVmYXVsdFZpZXd8fHRoaXMuZG9jdW1lbnRbMF0ucGFyZW50V2luZG93KSksdGhpcy5vcHRpb25zPXQud2lkZ2V0LmV4dGVuZCh7fSx0aGlzLm9wdGlvbnMsdGhpcy5fZ2V0Q3JlYXRlT3B0aW9ucygpLGUpLHRoaXMuX2NyZWF0ZSgpLHRoaXMub3B0aW9ucy5kaXNhYmxlZCYmdGhpcy5fc2V0T3B0aW9uRGlzYWJsZWQodGhpcy5vcHRpb25zLmRpc2FibGVkKSx0aGlzLl90cmlnZ2VyKFwiY3JlYXRlXCIsbnVsbCx0aGlzLl9nZXRDcmVhdGVFdmVudERhdGEoKSksdGhpcy5faW5pdCgpfSxfZ2V0Q3JlYXRlT3B0aW9uczpmdW5jdGlvbigpe3JldHVybnt9fSxfZ2V0Q3JlYXRlRXZlbnREYXRhOnQubm9vcCxfY3JlYXRlOnQubm9vcCxfaW5pdDp0Lm5vb3AsZGVzdHJveTpmdW5jdGlvbigpe3ZhciBlPXRoaXM7dGhpcy5fZGVzdHJveSgpLHQuZWFjaCh0aGlzLmNsYXNzZXNFbGVtZW50TG9va3VwLGZ1bmN0aW9uKHQsaSl7ZS5fcmVtb3ZlQ2xhc3MoaSx0KX0pLHRoaXMuZWxlbWVudC5vZmYodGhpcy5ldmVudE5hbWVzcGFjZSkucmVtb3ZlRGF0YSh0aGlzLndpZGdldEZ1bGxOYW1lKSx0aGlzLndpZGdldCgpLm9mZih0aGlzLmV2ZW50TmFtZXNwYWNlKS5yZW1vdmVBdHRyKFwiYXJpYS1kaXNhYmxlZFwiKSx0aGlzLmJpbmRpbmdzLm9mZih0aGlzLmV2ZW50TmFtZXNwYWNlKX0sX2Rlc3Ryb3k6dC5ub29wLHdpZGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmVsZW1lbnR9LG9wdGlvbjpmdW5jdGlvbihlLGkpe3ZhciBzLG4sbyxhPWU7aWYoMD09PWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHQud2lkZ2V0LmV4dGVuZCh7fSx0aGlzLm9wdGlvbnMpO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBlKWlmKGE9e30scz1lLnNwbGl0KFwiLlwiKSxlPXMuc2hpZnQoKSxzLmxlbmd0aCl7Zm9yKG49YVtlXT10LndpZGdldC5leHRlbmQoe30sdGhpcy5vcHRpb25zW2VdKSxvPTA7cy5sZW5ndGgtMT5vO28rKyluW3Nbb11dPW5bc1tvXV18fHt9LG49bltzW29dXTtpZihlPXMucG9wKCksMT09PWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHZvaWQgMD09PW5bZV0/bnVsbDpuW2VdO25bZV09aX1lbHNle2lmKDE9PT1hcmd1bWVudHMubGVuZ3RoKXJldHVybiB2b2lkIDA9PT10aGlzLm9wdGlvbnNbZV0/bnVsbDp0aGlzLm9wdGlvbnNbZV07YVtlXT1pfXJldHVybiB0aGlzLl9zZXRPcHRpb25zKGEpLHRoaXN9LF9zZXRPcHRpb25zOmZ1bmN0aW9uKHQpe3ZhciBlO2ZvcihlIGluIHQpdGhpcy5fc2V0T3B0aW9uKGUsdFtlXSk7cmV0dXJuIHRoaXN9LF9zZXRPcHRpb246ZnVuY3Rpb24odCxlKXtyZXR1cm5cImNsYXNzZXNcIj09PXQmJnRoaXMuX3NldE9wdGlvbkNsYXNzZXMoZSksdGhpcy5vcHRpb25zW3RdPWUsXCJkaXNhYmxlZFwiPT09dCYmdGhpcy5fc2V0T3B0aW9uRGlzYWJsZWQoZSksdGhpc30sX3NldE9wdGlvbkNsYXNzZXM6ZnVuY3Rpb24oZSl7dmFyIGkscyxuO2ZvcihpIGluIGUpbj10aGlzLmNsYXNzZXNFbGVtZW50TG9va3VwW2ldLGVbaV0hPT10aGlzLm9wdGlvbnMuY2xhc3Nlc1tpXSYmbiYmbi5sZW5ndGgmJihzPXQobi5nZXQoKSksdGhpcy5fcmVtb3ZlQ2xhc3MobixpKSxzLmFkZENsYXNzKHRoaXMuX2NsYXNzZXMoe2VsZW1lbnQ6cyxrZXlzOmksY2xhc3NlczplLGFkZDohMH0pKSl9LF9zZXRPcHRpb25EaXNhYmxlZDpmdW5jdGlvbih0KXt0aGlzLl90b2dnbGVDbGFzcyh0aGlzLndpZGdldCgpLHRoaXMud2lkZ2V0RnVsbE5hbWUrXCItZGlzYWJsZWRcIixudWxsLCEhdCksdCYmKHRoaXMuX3JlbW92ZUNsYXNzKHRoaXMuaG92ZXJhYmxlLG51bGwsXCJ1aS1zdGF0ZS1ob3ZlclwiKSx0aGlzLl9yZW1vdmVDbGFzcyh0aGlzLmZvY3VzYWJsZSxudWxsLFwidWktc3RhdGUtZm9jdXNcIikpfSxlbmFibGU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc2V0T3B0aW9ucyh7ZGlzYWJsZWQ6ITF9KX0sZGlzYWJsZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zZXRPcHRpb25zKHtkaXNhYmxlZDohMH0pfSxfY2xhc3NlczpmdW5jdGlvbihlKXtmdW5jdGlvbiBpKGksbyl7dmFyIGEscjtmb3Iocj0wO2kubGVuZ3RoPnI7cisrKWE9bi5jbGFzc2VzRWxlbWVudExvb2t1cFtpW3JdXXx8dCgpLGE9ZS5hZGQ/dCh0LnVuaXF1ZShhLmdldCgpLmNvbmNhdChlLmVsZW1lbnQuZ2V0KCkpKSk6dChhLm5vdChlLmVsZW1lbnQpLmdldCgpKSxuLmNsYXNzZXNFbGVtZW50TG9va3VwW2lbcl1dPWEscy5wdXNoKGlbcl0pLG8mJmUuY2xhc3Nlc1tpW3JdXSYmcy5wdXNoKGUuY2xhc3Nlc1tpW3JdXSl9dmFyIHM9W10sbj10aGlzO3JldHVybiBlPXQuZXh0ZW5kKHtlbGVtZW50OnRoaXMuZWxlbWVudCxjbGFzc2VzOnRoaXMub3B0aW9ucy5jbGFzc2VzfHx7fX0sZSksdGhpcy5fb24oZS5lbGVtZW50LHtyZW1vdmU6XCJfdW50cmFja0NsYXNzZXNFbGVtZW50XCJ9KSxlLmtleXMmJmkoZS5rZXlzLm1hdGNoKC9cXFMrL2cpfHxbXSwhMCksZS5leHRyYSYmaShlLmV4dHJhLm1hdGNoKC9cXFMrL2cpfHxbXSkscy5qb2luKFwiIFwiKX0sX3VudHJhY2tDbGFzc2VzRWxlbWVudDpmdW5jdGlvbihlKXt2YXIgaT10aGlzO3QuZWFjaChpLmNsYXNzZXNFbGVtZW50TG9va3VwLGZ1bmN0aW9uKHMsbil7LTEhPT10LmluQXJyYXkoZS50YXJnZXQsbikmJihpLmNsYXNzZXNFbGVtZW50TG9va3VwW3NdPXQobi5ub3QoZS50YXJnZXQpLmdldCgpKSl9KX0sX3JlbW92ZUNsYXNzOmZ1bmN0aW9uKHQsZSxpKXtyZXR1cm4gdGhpcy5fdG9nZ2xlQ2xhc3ModCxlLGksITEpfSxfYWRkQ2xhc3M6ZnVuY3Rpb24odCxlLGkpe3JldHVybiB0aGlzLl90b2dnbGVDbGFzcyh0LGUsaSwhMCl9LF90b2dnbGVDbGFzczpmdW5jdGlvbih0LGUsaSxzKXtzPVwiYm9vbGVhblwiPT10eXBlb2Ygcz9zOmk7dmFyIG49XCJzdHJpbmdcIj09dHlwZW9mIHR8fG51bGw9PT10LG89e2V4dHJhOm4/ZTppLGtleXM6bj90OmUsZWxlbWVudDpuP3RoaXMuZWxlbWVudDp0LGFkZDpzfTtyZXR1cm4gby5lbGVtZW50LnRvZ2dsZUNsYXNzKHRoaXMuX2NsYXNzZXMobykscyksdGhpc30sX29uOmZ1bmN0aW9uKGUsaSxzKXt2YXIgbixvPXRoaXM7XCJib29sZWFuXCIhPXR5cGVvZiBlJiYocz1pLGk9ZSxlPSExKSxzPyhpPW49dChpKSx0aGlzLmJpbmRpbmdzPXRoaXMuYmluZGluZ3MuYWRkKGkpKToocz1pLGk9dGhpcy5lbGVtZW50LG49dGhpcy53aWRnZXQoKSksdC5lYWNoKHMsZnVuY3Rpb24ocyxhKXtmdW5jdGlvbiByKCl7cmV0dXJuIGV8fG8ub3B0aW9ucy5kaXNhYmxlZCE9PSEwJiYhdCh0aGlzKS5oYXNDbGFzcyhcInVpLXN0YXRlLWRpc2FibGVkXCIpPyhcInN0cmluZ1wiPT10eXBlb2YgYT9vW2FdOmEpLmFwcGx5KG8sYXJndW1lbnRzKTp2b2lkIDB9XCJzdHJpbmdcIiE9dHlwZW9mIGEmJihyLmd1aWQ9YS5ndWlkPWEuZ3VpZHx8ci5ndWlkfHx0Lmd1aWQrKyk7dmFyIGw9cy5tYXRjaCgvXihbXFx3Oi1dKilcXHMqKC4qKSQvKSxoPWxbMV0rby5ldmVudE5hbWVzcGFjZSxjPWxbMl07Yz9uLm9uKGgsYyxyKTppLm9uKGgscil9KX0sX29mZjpmdW5jdGlvbihlLGkpe2k9KGl8fFwiXCIpLnNwbGl0KFwiIFwiKS5qb2luKHRoaXMuZXZlbnROYW1lc3BhY2UrXCIgXCIpK3RoaXMuZXZlbnROYW1lc3BhY2UsZS5vZmYoaSkub2ZmKGkpLHRoaXMuYmluZGluZ3M9dCh0aGlzLmJpbmRpbmdzLm5vdChlKS5nZXQoKSksdGhpcy5mb2N1c2FibGU9dCh0aGlzLmZvY3VzYWJsZS5ub3QoZSkuZ2V0KCkpLHRoaXMuaG92ZXJhYmxlPXQodGhpcy5ob3ZlcmFibGUubm90KGUpLmdldCgpKX0sX2RlbGF5OmZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSgpe3JldHVybihcInN0cmluZ1wiPT10eXBlb2YgdD9zW3RdOnQpLmFwcGx5KHMsYXJndW1lbnRzKX12YXIgcz10aGlzO3JldHVybiBzZXRUaW1lb3V0KGksZXx8MCl9LF9ob3ZlcmFibGU6ZnVuY3Rpb24oZSl7dGhpcy5ob3ZlcmFibGU9dGhpcy5ob3ZlcmFibGUuYWRkKGUpLHRoaXMuX29uKGUse21vdXNlZW50ZXI6ZnVuY3Rpb24oZSl7dGhpcy5fYWRkQ2xhc3ModChlLmN1cnJlbnRUYXJnZXQpLG51bGwsXCJ1aS1zdGF0ZS1ob3ZlclwiKX0sbW91c2VsZWF2ZTpmdW5jdGlvbihlKXt0aGlzLl9yZW1vdmVDbGFzcyh0KGUuY3VycmVudFRhcmdldCksbnVsbCxcInVpLXN0YXRlLWhvdmVyXCIpfX0pfSxfZm9jdXNhYmxlOmZ1bmN0aW9uKGUpe3RoaXMuZm9jdXNhYmxlPXRoaXMuZm9jdXNhYmxlLmFkZChlKSx0aGlzLl9vbihlLHtmb2N1c2luOmZ1bmN0aW9uKGUpe3RoaXMuX2FkZENsYXNzKHQoZS5jdXJyZW50VGFyZ2V0KSxudWxsLFwidWktc3RhdGUtZm9jdXNcIil9LGZvY3Vzb3V0OmZ1bmN0aW9uKGUpe3RoaXMuX3JlbW92ZUNsYXNzKHQoZS5jdXJyZW50VGFyZ2V0KSxudWxsLFwidWktc3RhdGUtZm9jdXNcIil9fSl9LF90cmlnZ2VyOmZ1bmN0aW9uKGUsaSxzKXt2YXIgbixvLGE9dGhpcy5vcHRpb25zW2VdO2lmKHM9c3x8e30saT10LkV2ZW50KGkpLGkudHlwZT0oZT09PXRoaXMud2lkZ2V0RXZlbnRQcmVmaXg/ZTp0aGlzLndpZGdldEV2ZW50UHJlZml4K2UpLnRvTG93ZXJDYXNlKCksaS50YXJnZXQ9dGhpcy5lbGVtZW50WzBdLG89aS5vcmlnaW5hbEV2ZW50KWZvcihuIGluIG8pbiBpbiBpfHwoaVtuXT1vW25dKTtyZXR1cm4gdGhpcy5lbGVtZW50LnRyaWdnZXIoaSxzKSwhKHQuaXNGdW5jdGlvbihhKSYmYS5hcHBseSh0aGlzLmVsZW1lbnRbMF0sW2ldLmNvbmNhdChzKSk9PT0hMXx8aS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSl9fSx0LmVhY2goe3Nob3c6XCJmYWRlSW5cIixoaWRlOlwiZmFkZU91dFwifSxmdW5jdGlvbihlLGkpe3QuV2lkZ2V0LnByb3RvdHlwZVtcIl9cIitlXT1mdW5jdGlvbihzLG4sbyl7XCJzdHJpbmdcIj09dHlwZW9mIG4mJihuPXtlZmZlY3Q6bn0pO3ZhciBhLHI9bj9uPT09ITB8fFwibnVtYmVyXCI9PXR5cGVvZiBuP2k6bi5lZmZlY3R8fGk6ZTtuPW58fHt9LFwibnVtYmVyXCI9PXR5cGVvZiBuJiYobj17ZHVyYXRpb246bn0pLGE9IXQuaXNFbXB0eU9iamVjdChuKSxuLmNvbXBsZXRlPW8sbi5kZWxheSYmcy5kZWxheShuLmRlbGF5KSxhJiZ0LmVmZmVjdHMmJnQuZWZmZWN0cy5lZmZlY3Rbcl0/c1tlXShuKTpyIT09ZSYmc1tyXT9zW3JdKG4uZHVyYXRpb24sbi5lYXNpbmcsbyk6cy5xdWV1ZShmdW5jdGlvbihpKXt0KHRoaXMpW2VdKCksbyYmby5jYWxsKHNbMF0pLGkoKX0pfX0pLHQud2lkZ2V0LGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LGUsaSl7cmV0dXJuW3BhcnNlRmxvYXQodFswXSkqKHUudGVzdCh0WzBdKT9lLzEwMDoxKSxwYXJzZUZsb2F0KHRbMV0pKih1LnRlc3QodFsxXSk/aS8xMDA6MSldfWZ1bmN0aW9uIGkoZSxpKXtyZXR1cm4gcGFyc2VJbnQodC5jc3MoZSxpKSwxMCl8fDB9ZnVuY3Rpb24gcyhlKXt2YXIgaT1lWzBdO3JldHVybiA5PT09aS5ub2RlVHlwZT97d2lkdGg6ZS53aWR0aCgpLGhlaWdodDplLmhlaWdodCgpLG9mZnNldDp7dG9wOjAsbGVmdDowfX06dC5pc1dpbmRvdyhpKT97d2lkdGg6ZS53aWR0aCgpLGhlaWdodDplLmhlaWdodCgpLG9mZnNldDp7dG9wOmUuc2Nyb2xsVG9wKCksbGVmdDplLnNjcm9sbExlZnQoKX19OmkucHJldmVudERlZmF1bHQ/e3dpZHRoOjAsaGVpZ2h0OjAsb2Zmc2V0Ont0b3A6aS5wYWdlWSxsZWZ0OmkucGFnZVh9fTp7d2lkdGg6ZS5vdXRlcldpZHRoKCksaGVpZ2h0OmUub3V0ZXJIZWlnaHQoKSxvZmZzZXQ6ZS5vZmZzZXQoKX19dmFyIG4sbz1NYXRoLm1heCxhPU1hdGguYWJzLHI9L2xlZnR8Y2VudGVyfHJpZ2h0LyxsPS90b3B8Y2VudGVyfGJvdHRvbS8saD0vW1xcK1xcLV1cXGQrKFxcLltcXGRdKyk/JT8vLGM9L15cXHcrLyx1PS8lJC8sZD10LmZuLnBvc2l0aW9uO3QucG9zaXRpb249e3Njcm9sbGJhcldpZHRoOmZ1bmN0aW9uKCl7aWYodm9pZCAwIT09bilyZXR1cm4gbjt2YXIgZSxpLHM9dChcIjxkaXYgc3R5bGU9J2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6NTBweDtoZWlnaHQ6NTBweDtvdmVyZmxvdzpoaWRkZW47Jz48ZGl2IHN0eWxlPSdoZWlnaHQ6MTAwcHg7d2lkdGg6YXV0bzsnPjwvZGl2PjwvZGl2PlwiKSxvPXMuY2hpbGRyZW4oKVswXTtyZXR1cm4gdChcImJvZHlcIikuYXBwZW5kKHMpLGU9by5vZmZzZXRXaWR0aCxzLmNzcyhcIm92ZXJmbG93XCIsXCJzY3JvbGxcIiksaT1vLm9mZnNldFdpZHRoLGU9PT1pJiYoaT1zWzBdLmNsaWVudFdpZHRoKSxzLnJlbW92ZSgpLG49ZS1pfSxnZXRTY3JvbGxJbmZvOmZ1bmN0aW9uKGUpe3ZhciBpPWUuaXNXaW5kb3d8fGUuaXNEb2N1bWVudD9cIlwiOmUuZWxlbWVudC5jc3MoXCJvdmVyZmxvdy14XCIpLHM9ZS5pc1dpbmRvd3x8ZS5pc0RvY3VtZW50P1wiXCI6ZS5lbGVtZW50LmNzcyhcIm92ZXJmbG93LXlcIiksbj1cInNjcm9sbFwiPT09aXx8XCJhdXRvXCI9PT1pJiZlLndpZHRoPGUuZWxlbWVudFswXS5zY3JvbGxXaWR0aCxvPVwic2Nyb2xsXCI9PT1zfHxcImF1dG9cIj09PXMmJmUuaGVpZ2h0PGUuZWxlbWVudFswXS5zY3JvbGxIZWlnaHQ7cmV0dXJue3dpZHRoOm8/dC5wb3NpdGlvbi5zY3JvbGxiYXJXaWR0aCgpOjAsaGVpZ2h0Om4/dC5wb3NpdGlvbi5zY3JvbGxiYXJXaWR0aCgpOjB9fSxnZXRXaXRoaW5JbmZvOmZ1bmN0aW9uKGUpe3ZhciBpPXQoZXx8d2luZG93KSxzPXQuaXNXaW5kb3coaVswXSksbj0hIWlbMF0mJjk9PT1pWzBdLm5vZGVUeXBlLG89IXMmJiFuO3JldHVybntlbGVtZW50OmksaXNXaW5kb3c6cyxpc0RvY3VtZW50Om4sb2Zmc2V0Om8/dChlKS5vZmZzZXQoKTp7bGVmdDowLHRvcDowfSxzY3JvbGxMZWZ0Omkuc2Nyb2xsTGVmdCgpLHNjcm9sbFRvcDppLnNjcm9sbFRvcCgpLHdpZHRoOmkub3V0ZXJXaWR0aCgpLGhlaWdodDppLm91dGVySGVpZ2h0KCl9fX0sdC5mbi5wb3NpdGlvbj1mdW5jdGlvbihuKXtpZighbnx8IW4ub2YpcmV0dXJuIGQuYXBwbHkodGhpcyxhcmd1bWVudHMpO249dC5leHRlbmQoe30sbik7dmFyIHUscCxmLGcsbSxfLHY9dChuLm9mKSxiPXQucG9zaXRpb24uZ2V0V2l0aGluSW5mbyhuLndpdGhpbikseT10LnBvc2l0aW9uLmdldFNjcm9sbEluZm8oYiksdz0obi5jb2xsaXNpb258fFwiZmxpcFwiKS5zcGxpdChcIiBcIiksaz17fTtyZXR1cm4gXz1zKHYpLHZbMF0ucHJldmVudERlZmF1bHQmJihuLmF0PVwibGVmdCB0b3BcIikscD1fLndpZHRoLGY9Xy5oZWlnaHQsZz1fLm9mZnNldCxtPXQuZXh0ZW5kKHt9LGcpLHQuZWFjaChbXCJteVwiLFwiYXRcIl0sZnVuY3Rpb24oKXt2YXIgdCxlLGk9KG5bdGhpc118fFwiXCIpLnNwbGl0KFwiIFwiKTsxPT09aS5sZW5ndGgmJihpPXIudGVzdChpWzBdKT9pLmNvbmNhdChbXCJjZW50ZXJcIl0pOmwudGVzdChpWzBdKT9bXCJjZW50ZXJcIl0uY29uY2F0KGkpOltcImNlbnRlclwiLFwiY2VudGVyXCJdKSxpWzBdPXIudGVzdChpWzBdKT9pWzBdOlwiY2VudGVyXCIsaVsxXT1sLnRlc3QoaVsxXSk/aVsxXTpcImNlbnRlclwiLHQ9aC5leGVjKGlbMF0pLGU9aC5leGVjKGlbMV0pLGtbdGhpc109W3Q/dFswXTowLGU/ZVswXTowXSxuW3RoaXNdPVtjLmV4ZWMoaVswXSlbMF0sYy5leGVjKGlbMV0pWzBdXX0pLDE9PT13Lmxlbmd0aCYmKHdbMV09d1swXSksXCJyaWdodFwiPT09bi5hdFswXT9tLmxlZnQrPXA6XCJjZW50ZXJcIj09PW4uYXRbMF0mJihtLmxlZnQrPXAvMiksXCJib3R0b21cIj09PW4uYXRbMV0/bS50b3ArPWY6XCJjZW50ZXJcIj09PW4uYXRbMV0mJihtLnRvcCs9Zi8yKSx1PWUoay5hdCxwLGYpLG0ubGVmdCs9dVswXSxtLnRvcCs9dVsxXSx0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcyxyLGw9dCh0aGlzKSxoPWwub3V0ZXJXaWR0aCgpLGM9bC5vdXRlckhlaWdodCgpLGQ9aSh0aGlzLFwibWFyZ2luTGVmdFwiKSxfPWkodGhpcyxcIm1hcmdpblRvcFwiKSx4PWgrZCtpKHRoaXMsXCJtYXJnaW5SaWdodFwiKSt5LndpZHRoLEM9YytfK2kodGhpcyxcIm1hcmdpbkJvdHRvbVwiKSt5LmhlaWdodCxEPXQuZXh0ZW5kKHt9LG0pLFQ9ZShrLm15LGwub3V0ZXJXaWR0aCgpLGwub3V0ZXJIZWlnaHQoKSk7XCJyaWdodFwiPT09bi5teVswXT9ELmxlZnQtPWg6XCJjZW50ZXJcIj09PW4ubXlbMF0mJihELmxlZnQtPWgvMiksXCJib3R0b21cIj09PW4ubXlbMV0/RC50b3AtPWM6XCJjZW50ZXJcIj09PW4ubXlbMV0mJihELnRvcC09Yy8yKSxELmxlZnQrPVRbMF0sRC50b3ArPVRbMV0scz17bWFyZ2luTGVmdDpkLG1hcmdpblRvcDpffSx0LmVhY2goW1wibGVmdFwiLFwidG9wXCJdLGZ1bmN0aW9uKGUsaSl7dC51aS5wb3NpdGlvblt3W2VdXSYmdC51aS5wb3NpdGlvblt3W2VdXVtpXShELHt0YXJnZXRXaWR0aDpwLHRhcmdldEhlaWdodDpmLGVsZW1XaWR0aDpoLGVsZW1IZWlnaHQ6Yyxjb2xsaXNpb25Qb3NpdGlvbjpzLGNvbGxpc2lvbldpZHRoOngsY29sbGlzaW9uSGVpZ2h0OkMsb2Zmc2V0Olt1WzBdK1RbMF0sdVsxXStUWzFdXSxteTpuLm15LGF0Om4uYXQsd2l0aGluOmIsZWxlbTpsfSl9KSxuLnVzaW5nJiYocj1mdW5jdGlvbih0KXt2YXIgZT1nLmxlZnQtRC5sZWZ0LGk9ZStwLWgscz1nLnRvcC1ELnRvcCxyPXMrZi1jLHU9e3RhcmdldDp7ZWxlbWVudDp2LGxlZnQ6Zy5sZWZ0LHRvcDpnLnRvcCx3aWR0aDpwLGhlaWdodDpmfSxlbGVtZW50OntlbGVtZW50OmwsbGVmdDpELmxlZnQsdG9wOkQudG9wLHdpZHRoOmgsaGVpZ2h0OmN9LGhvcml6b250YWw6MD5pP1wibGVmdFwiOmU+MD9cInJpZ2h0XCI6XCJjZW50ZXJcIix2ZXJ0aWNhbDowPnI/XCJ0b3BcIjpzPjA/XCJib3R0b21cIjpcIm1pZGRsZVwifTtoPnAmJnA+YShlK2kpJiYodS5ob3Jpem9udGFsPVwiY2VudGVyXCIpLGM+ZiYmZj5hKHMrcikmJih1LnZlcnRpY2FsPVwibWlkZGxlXCIpLHUuaW1wb3J0YW50PW8oYShlKSxhKGkpKT5vKGEocyksYShyKSk/XCJob3Jpem9udGFsXCI6XCJ2ZXJ0aWNhbFwiLG4udXNpbmcuY2FsbCh0aGlzLHQsdSl9KSxsLm9mZnNldCh0LmV4dGVuZChELHt1c2luZzpyfSkpfSl9LHQudWkucG9zaXRpb249e2ZpdDp7bGVmdDpmdW5jdGlvbih0LGUpe3ZhciBpLHM9ZS53aXRoaW4sbj1zLmlzV2luZG93P3Muc2Nyb2xsTGVmdDpzLm9mZnNldC5sZWZ0LGE9cy53aWR0aCxyPXQubGVmdC1lLmNvbGxpc2lvblBvc2l0aW9uLm1hcmdpbkxlZnQsbD1uLXIsaD1yK2UuY29sbGlzaW9uV2lkdGgtYS1uO2UuY29sbGlzaW9uV2lkdGg+YT9sPjAmJjA+PWg/KGk9dC5sZWZ0K2wrZS5jb2xsaXNpb25XaWR0aC1hLW4sdC5sZWZ0Kz1sLWkpOnQubGVmdD1oPjAmJjA+PWw/bjpsPmg/bithLWUuY29sbGlzaW9uV2lkdGg6bjpsPjA/dC5sZWZ0Kz1sOmg+MD90LmxlZnQtPWg6dC5sZWZ0PW8odC5sZWZ0LXIsdC5sZWZ0KX0sdG9wOmZ1bmN0aW9uKHQsZSl7dmFyIGkscz1lLndpdGhpbixuPXMuaXNXaW5kb3c/cy5zY3JvbGxUb3A6cy5vZmZzZXQudG9wLGE9ZS53aXRoaW4uaGVpZ2h0LHI9dC50b3AtZS5jb2xsaXNpb25Qb3NpdGlvbi5tYXJnaW5Ub3AsbD1uLXIsaD1yK2UuY29sbGlzaW9uSGVpZ2h0LWEtbjtlLmNvbGxpc2lvbkhlaWdodD5hP2w+MCYmMD49aD8oaT10LnRvcCtsK2UuY29sbGlzaW9uSGVpZ2h0LWEtbix0LnRvcCs9bC1pKTp0LnRvcD1oPjAmJjA+PWw/bjpsPmg/bithLWUuY29sbGlzaW9uSGVpZ2h0Om46bD4wP3QudG9wKz1sOmg+MD90LnRvcC09aDp0LnRvcD1vKHQudG9wLXIsdC50b3ApfX0sZmxpcDp7bGVmdDpmdW5jdGlvbih0LGUpe3ZhciBpLHMsbj1lLndpdGhpbixvPW4ub2Zmc2V0LmxlZnQrbi5zY3JvbGxMZWZ0LHI9bi53aWR0aCxsPW4uaXNXaW5kb3c/bi5zY3JvbGxMZWZ0Om4ub2Zmc2V0LmxlZnQsaD10LmxlZnQtZS5jb2xsaXNpb25Qb3NpdGlvbi5tYXJnaW5MZWZ0LGM9aC1sLHU9aCtlLmNvbGxpc2lvbldpZHRoLXItbCxkPVwibGVmdFwiPT09ZS5teVswXT8tZS5lbGVtV2lkdGg6XCJyaWdodFwiPT09ZS5teVswXT9lLmVsZW1XaWR0aDowLHA9XCJsZWZ0XCI9PT1lLmF0WzBdP2UudGFyZ2V0V2lkdGg6XCJyaWdodFwiPT09ZS5hdFswXT8tZS50YXJnZXRXaWR0aDowLGY9LTIqZS5vZmZzZXRbMF07MD5jPyhpPXQubGVmdCtkK3ArZitlLmNvbGxpc2lvbldpZHRoLXItbywoMD5pfHxhKGMpPmkpJiYodC5sZWZ0Kz1kK3ArZikpOnU+MCYmKHM9dC5sZWZ0LWUuY29sbGlzaW9uUG9zaXRpb24ubWFyZ2luTGVmdCtkK3ArZi1sLChzPjB8fHU+YShzKSkmJih0LmxlZnQrPWQrcCtmKSl9LHRvcDpmdW5jdGlvbih0LGUpe3ZhciBpLHMsbj1lLndpdGhpbixvPW4ub2Zmc2V0LnRvcCtuLnNjcm9sbFRvcCxyPW4uaGVpZ2h0LGw9bi5pc1dpbmRvdz9uLnNjcm9sbFRvcDpuLm9mZnNldC50b3AsaD10LnRvcC1lLmNvbGxpc2lvblBvc2l0aW9uLm1hcmdpblRvcCxjPWgtbCx1PWgrZS5jb2xsaXNpb25IZWlnaHQtci1sLGQ9XCJ0b3BcIj09PWUubXlbMV0scD1kPy1lLmVsZW1IZWlnaHQ6XCJib3R0b21cIj09PWUubXlbMV0/ZS5lbGVtSGVpZ2h0OjAsZj1cInRvcFwiPT09ZS5hdFsxXT9lLnRhcmdldEhlaWdodDpcImJvdHRvbVwiPT09ZS5hdFsxXT8tZS50YXJnZXRIZWlnaHQ6MCxnPS0yKmUub2Zmc2V0WzFdOzA+Yz8ocz10LnRvcCtwK2YrZytlLmNvbGxpc2lvbkhlaWdodC1yLW8sKDA+c3x8YShjKT5zKSYmKHQudG9wKz1wK2YrZykpOnU+MCYmKGk9dC50b3AtZS5jb2xsaXNpb25Qb3NpdGlvbi5tYXJnaW5Ub3ArcCtmK2ctbCwoaT4wfHx1PmEoaSkpJiYodC50b3ArPXArZitnKSl9fSxmbGlwZml0OntsZWZ0OmZ1bmN0aW9uKCl7dC51aS5wb3NpdGlvbi5mbGlwLmxlZnQuYXBwbHkodGhpcyxhcmd1bWVudHMpLHQudWkucG9zaXRpb24uZml0LmxlZnQuYXBwbHkodGhpcyxhcmd1bWVudHMpfSx0b3A6ZnVuY3Rpb24oKXt0LnVpLnBvc2l0aW9uLmZsaXAudG9wLmFwcGx5KHRoaXMsYXJndW1lbnRzKSx0LnVpLnBvc2l0aW9uLmZpdC50b3AuYXBwbHkodGhpcyxhcmd1bWVudHMpfX19fSgpLHQudWkucG9zaXRpb24sdC5mbi5mb3JtPWZ1bmN0aW9uKCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHRoaXNbMF0uZm9ybT90aGlzLmNsb3Nlc3QoXCJmb3JtXCIpOnQodGhpc1swXS5mb3JtKX0sdC51aS5mb3JtUmVzZXRNaXhpbj17X2Zvcm1SZXNldEhhbmRsZXI6ZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpO3NldFRpbWVvdXQoZnVuY3Rpb24oKXt2YXIgaT1lLmRhdGEoXCJ1aS1mb3JtLXJlc2V0LWluc3RhbmNlc1wiKTt0LmVhY2goaSxmdW5jdGlvbigpe3RoaXMucmVmcmVzaCgpfSl9KX0sX2JpbmRGb3JtUmVzZXRIYW5kbGVyOmZ1bmN0aW9uKCl7aWYodGhpcy5mb3JtPXRoaXMuZWxlbWVudC5mb3JtKCksdGhpcy5mb3JtLmxlbmd0aCl7dmFyIHQ9dGhpcy5mb3JtLmRhdGEoXCJ1aS1mb3JtLXJlc2V0LWluc3RhbmNlc1wiKXx8W107dC5sZW5ndGh8fHRoaXMuZm9ybS5vbihcInJlc2V0LnVpLWZvcm0tcmVzZXRcIix0aGlzLl9mb3JtUmVzZXRIYW5kbGVyKSx0LnB1c2godGhpcyksdGhpcy5mb3JtLmRhdGEoXCJ1aS1mb3JtLXJlc2V0LWluc3RhbmNlc1wiLHQpfX0sX3VuYmluZEZvcm1SZXNldEhhbmRsZXI6ZnVuY3Rpb24oKXtpZih0aGlzLmZvcm0ubGVuZ3RoKXt2YXIgZT10aGlzLmZvcm0uZGF0YShcInVpLWZvcm0tcmVzZXQtaW5zdGFuY2VzXCIpO2Uuc3BsaWNlKHQuaW5BcnJheSh0aGlzLGUpLDEpLGUubGVuZ3RoP3RoaXMuZm9ybS5kYXRhKFwidWktZm9ybS1yZXNldC1pbnN0YW5jZXNcIixlKTp0aGlzLmZvcm0ucmVtb3ZlRGF0YShcInVpLWZvcm0tcmVzZXQtaW5zdGFuY2VzXCIpLm9mZihcInJlc2V0LnVpLWZvcm0tcmVzZXRcIil9fX0sdC51aS5rZXlDb2RlPXtCQUNLU1BBQ0U6OCxDT01NQToxODgsREVMRVRFOjQ2LERPV046NDAsRU5EOjM1LEVOVEVSOjEzLEVTQ0FQRToyNyxIT01FOjM2LExFRlQ6MzcsUEFHRV9ET1dOOjM0LFBBR0VfVVA6MzMsUEVSSU9EOjE5MCxSSUdIVDozOSxTUEFDRTozMixUQUI6OSxVUDozOH0sdC51aS5lc2NhcGVTZWxlY3Rvcj1mdW5jdGlvbigpe3ZhciB0PS8oWyFcIiMkJSYnKCkqKywuLzo7PD0+P0BbXFxdXmB7fH1+XSkvZztyZXR1cm4gZnVuY3Rpb24oZSl7cmV0dXJuIGUucmVwbGFjZSh0LFwiXFxcXCQxXCIpfX0oKSx0LmZuLmxhYmVscz1mdW5jdGlvbigpe3ZhciBlLGkscyxuLG87cmV0dXJuIHRoaXNbMF0ubGFiZWxzJiZ0aGlzWzBdLmxhYmVscy5sZW5ndGg/dGhpcy5wdXNoU3RhY2sodGhpc1swXS5sYWJlbHMpOihuPXRoaXMuZXEoMCkucGFyZW50cyhcImxhYmVsXCIpLHM9dGhpcy5hdHRyKFwiaWRcIikscyYmKGU9dGhpcy5lcSgwKS5wYXJlbnRzKCkubGFzdCgpLG89ZS5hZGQoZS5sZW5ndGg/ZS5zaWJsaW5ncygpOnRoaXMuc2libGluZ3MoKSksaT1cImxhYmVsW2Zvcj0nXCIrdC51aS5lc2NhcGVTZWxlY3RvcihzKStcIiddXCIsbj1uLmFkZChvLmZpbmQoaSkuYWRkQmFjayhpKSkpLHRoaXMucHVzaFN0YWNrKG4pKX0sdC5mbi5leHRlbmQoe3VuaXF1ZUlkOmZ1bmN0aW9uKCl7dmFyIHQ9MDtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dGhpcy5pZHx8KHRoaXMuaWQ9XCJ1aS1pZC1cIisgKyt0KX0pfX0oKSxyZW1vdmVVbmlxdWVJZDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXsvXnVpLWlkLVxcZCskLy50ZXN0KHRoaXMuaWQpJiZ0KHRoaXMpLnJlbW92ZUF0dHIoXCJpZFwiKX0pfX0pLHQudWkuc2FmZUFjdGl2ZUVsZW1lbnQ9ZnVuY3Rpb24odCl7dmFyIGU7dHJ5e2U9dC5hY3RpdmVFbGVtZW50fWNhdGNoKGkpe2U9dC5ib2R5fXJldHVybiBlfHwoZT10LmJvZHkpLGUubm9kZU5hbWV8fChlPXQuYm9keSksZX0sdC53aWRnZXQoXCJ1aS5tZW51XCIse3ZlcnNpb246XCIxLjEyLjFcIixkZWZhdWx0RWxlbWVudDpcIjx1bD5cIixkZWxheTozMDAsb3B0aW9uczp7aWNvbnM6e3N1Ym1lbnU6XCJ1aS1pY29uLWNhcmV0LTEtZVwifSxpdGVtczpcIj4gKlwiLG1lbnVzOlwidWxcIixwb3NpdGlvbjp7bXk6XCJsZWZ0IHRvcFwiLGF0OlwicmlnaHQgdG9wXCJ9LHJvbGU6XCJtZW51XCIsYmx1cjpudWxsLGZvY3VzOm51bGwsc2VsZWN0Om51bGx9LF9jcmVhdGU6ZnVuY3Rpb24oKXt0aGlzLmFjdGl2ZU1lbnU9dGhpcy5lbGVtZW50LHRoaXMubW91c2VIYW5kbGVkPSExLHRoaXMuZWxlbWVudC51bmlxdWVJZCgpLmF0dHIoe3JvbGU6dGhpcy5vcHRpb25zLnJvbGUsdGFiSW5kZXg6MH0pLHRoaXMuX2FkZENsYXNzKFwidWktbWVudVwiLFwidWktd2lkZ2V0IHVpLXdpZGdldC1jb250ZW50XCIpLHRoaXMuX29uKHtcIm1vdXNlZG93biAudWktbWVudS1pdGVtXCI6ZnVuY3Rpb24odCl7dC5wcmV2ZW50RGVmYXVsdCgpfSxcImNsaWNrIC51aS1tZW51LWl0ZW1cIjpmdW5jdGlvbihlKXt2YXIgaT10KGUudGFyZ2V0KSxzPXQodC51aS5zYWZlQWN0aXZlRWxlbWVudCh0aGlzLmRvY3VtZW50WzBdKSk7IXRoaXMubW91c2VIYW5kbGVkJiZpLm5vdChcIi51aS1zdGF0ZS1kaXNhYmxlZFwiKS5sZW5ndGgmJih0aGlzLnNlbGVjdChlKSxlLmlzUHJvcGFnYXRpb25TdG9wcGVkKCl8fCh0aGlzLm1vdXNlSGFuZGxlZD0hMCksaS5oYXMoXCIudWktbWVudVwiKS5sZW5ndGg/dGhpcy5leHBhbmQoZSk6IXRoaXMuZWxlbWVudC5pcyhcIjpmb2N1c1wiKSYmcy5jbG9zZXN0KFwiLnVpLW1lbnVcIikubGVuZ3RoJiYodGhpcy5lbGVtZW50LnRyaWdnZXIoXCJmb2N1c1wiLFshMF0pLHRoaXMuYWN0aXZlJiYxPT09dGhpcy5hY3RpdmUucGFyZW50cyhcIi51aS1tZW51XCIpLmxlbmd0aCYmY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpKSl9LFwibW91c2VlbnRlciAudWktbWVudS1pdGVtXCI6ZnVuY3Rpb24oZSl7aWYoIXRoaXMucHJldmlvdXNGaWx0ZXIpe3ZhciBpPXQoZS50YXJnZXQpLmNsb3Nlc3QoXCIudWktbWVudS1pdGVtXCIpLHM9dChlLmN1cnJlbnRUYXJnZXQpO2lbMF09PT1zWzBdJiYodGhpcy5fcmVtb3ZlQ2xhc3Mocy5zaWJsaW5ncygpLmNoaWxkcmVuKFwiLnVpLXN0YXRlLWFjdGl2ZVwiKSxudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpLHRoaXMuZm9jdXMoZSxzKSl9fSxtb3VzZWxlYXZlOlwiY29sbGFwc2VBbGxcIixcIm1vdXNlbGVhdmUgLnVpLW1lbnVcIjpcImNvbGxhcHNlQWxsXCIsZm9jdXM6ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLmFjdGl2ZXx8dGhpcy5lbGVtZW50LmZpbmQodGhpcy5vcHRpb25zLml0ZW1zKS5lcSgwKTtlfHx0aGlzLmZvY3VzKHQsaSl9LGJsdXI6ZnVuY3Rpb24oZSl7dGhpcy5fZGVsYXkoZnVuY3Rpb24oKXt2YXIgaT0hdC5jb250YWlucyh0aGlzLmVsZW1lbnRbMF0sdC51aS5zYWZlQWN0aXZlRWxlbWVudCh0aGlzLmRvY3VtZW50WzBdKSk7aSYmdGhpcy5jb2xsYXBzZUFsbChlKX0pfSxrZXlkb3duOlwiX2tleWRvd25cIn0pLHRoaXMucmVmcmVzaCgpLHRoaXMuX29uKHRoaXMuZG9jdW1lbnQse2NsaWNrOmZ1bmN0aW9uKHQpe3RoaXMuX2Nsb3NlT25Eb2N1bWVudENsaWNrKHQpJiZ0aGlzLmNvbGxhcHNlQWxsKHQpLHRoaXMubW91c2VIYW5kbGVkPSExfX0pfSxfZGVzdHJveTpmdW5jdGlvbigpe3ZhciBlPXRoaXMuZWxlbWVudC5maW5kKFwiLnVpLW1lbnUtaXRlbVwiKS5yZW1vdmVBdHRyKFwicm9sZSBhcmlhLWRpc2FibGVkXCIpLGk9ZS5jaGlsZHJlbihcIi51aS1tZW51LWl0ZW0td3JhcHBlclwiKS5yZW1vdmVVbmlxdWVJZCgpLnJlbW92ZUF0dHIoXCJ0YWJJbmRleCByb2xlIGFyaWEtaGFzcG9wdXBcIik7dGhpcy5lbGVtZW50LnJlbW92ZUF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIikuZmluZChcIi51aS1tZW51XCIpLmFkZEJhY2soKS5yZW1vdmVBdHRyKFwicm9sZSBhcmlhLWxhYmVsbGVkYnkgYXJpYS1leHBhbmRlZCBhcmlhLWhpZGRlbiBhcmlhLWRpc2FibGVkIHRhYkluZGV4XCIpLnJlbW92ZVVuaXF1ZUlkKCkuc2hvdygpLGkuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9dCh0aGlzKTtlLmRhdGEoXCJ1aS1tZW51LXN1Ym1lbnUtY2FyZXRcIikmJmUucmVtb3ZlKCl9KX0sX2tleWRvd246ZnVuY3Rpb24oZSl7dmFyIGkscyxuLG8sYT0hMDtzd2l0Y2goZS5rZXlDb2RlKXtjYXNlIHQudWkua2V5Q29kZS5QQUdFX1VQOnRoaXMucHJldmlvdXNQYWdlKGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlBBR0VfRE9XTjp0aGlzLm5leHRQYWdlKGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkhPTUU6dGhpcy5fbW92ZShcImZpcnN0XCIsXCJmaXJzdFwiLGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkVORDp0aGlzLl9tb3ZlKFwibGFzdFwiLFwibGFzdFwiLGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlVQOnRoaXMucHJldmlvdXMoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRE9XTjp0aGlzLm5leHQoZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuTEVGVDp0aGlzLmNvbGxhcHNlKGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlJJR0hUOnRoaXMuYWN0aXZlJiYhdGhpcy5hY3RpdmUuaXMoXCIudWktc3RhdGUtZGlzYWJsZWRcIikmJnRoaXMuZXhwYW5kKGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkVOVEVSOmNhc2UgdC51aS5rZXlDb2RlLlNQQUNFOnRoaXMuX2FjdGl2YXRlKGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkVTQ0FQRTp0aGlzLmNvbGxhcHNlKGUpO2JyZWFrO2RlZmF1bHQ6YT0hMSxzPXRoaXMucHJldmlvdXNGaWx0ZXJ8fFwiXCIsbz0hMSxuPWUua2V5Q29kZT49OTYmJjEwNT49ZS5rZXlDb2RlP1wiXCIrKGUua2V5Q29kZS05Nik6U3RyaW5nLmZyb21DaGFyQ29kZShlLmtleUNvZGUpLGNsZWFyVGltZW91dCh0aGlzLmZpbHRlclRpbWVyKSxuPT09cz9vPSEwOm49cytuLGk9dGhpcy5fZmlsdGVyTWVudUl0ZW1zKG4pLGk9byYmLTEhPT1pLmluZGV4KHRoaXMuYWN0aXZlLm5leHQoKSk/dGhpcy5hY3RpdmUubmV4dEFsbChcIi51aS1tZW51LWl0ZW1cIik6aSxpLmxlbmd0aHx8KG49U3RyaW5nLmZyb21DaGFyQ29kZShlLmtleUNvZGUpLGk9dGhpcy5fZmlsdGVyTWVudUl0ZW1zKG4pKSxpLmxlbmd0aD8odGhpcy5mb2N1cyhlLGkpLHRoaXMucHJldmlvdXNGaWx0ZXI9bix0aGlzLmZpbHRlclRpbWVyPXRoaXMuX2RlbGF5KGZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMucHJldmlvdXNGaWx0ZXJ9LDFlMykpOmRlbGV0ZSB0aGlzLnByZXZpb3VzRmlsdGVyfWEmJmUucHJldmVudERlZmF1bHQoKX0sX2FjdGl2YXRlOmZ1bmN0aW9uKHQpe3RoaXMuYWN0aXZlJiYhdGhpcy5hY3RpdmUuaXMoXCIudWktc3RhdGUtZGlzYWJsZWRcIikmJih0aGlzLmFjdGl2ZS5jaGlsZHJlbihcIlthcmlhLWhhc3BvcHVwPSd0cnVlJ11cIikubGVuZ3RoP3RoaXMuZXhwYW5kKHQpOnRoaXMuc2VsZWN0KHQpKX0scmVmcmVzaDpmdW5jdGlvbigpe3ZhciBlLGkscyxuLG8sYT10aGlzLHI9dGhpcy5vcHRpb25zLmljb25zLnN1Ym1lbnUsbD10aGlzLmVsZW1lbnQuZmluZCh0aGlzLm9wdGlvbnMubWVudXMpO3RoaXMuX3RvZ2dsZUNsYXNzKFwidWktbWVudS1pY29uc1wiLG51bGwsISF0aGlzLmVsZW1lbnQuZmluZChcIi51aS1pY29uXCIpLmxlbmd0aCkscz1sLmZpbHRlcihcIjpub3QoLnVpLW1lbnUpXCIpLmhpZGUoKS5hdHRyKHtyb2xlOnRoaXMub3B0aW9ucy5yb2xlLFwiYXJpYS1oaWRkZW5cIjpcInRydWVcIixcImFyaWEtZXhwYW5kZWRcIjpcImZhbHNlXCJ9KS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9dCh0aGlzKSxpPWUucHJldigpLHM9dChcIjxzcGFuPlwiKS5kYXRhKFwidWktbWVudS1zdWJtZW51LWNhcmV0XCIsITApO2EuX2FkZENsYXNzKHMsXCJ1aS1tZW51LWljb25cIixcInVpLWljb24gXCIrciksaS5hdHRyKFwiYXJpYS1oYXNwb3B1cFwiLFwidHJ1ZVwiKS5wcmVwZW5kKHMpLGUuYXR0cihcImFyaWEtbGFiZWxsZWRieVwiLGkuYXR0cihcImlkXCIpKX0pLHRoaXMuX2FkZENsYXNzKHMsXCJ1aS1tZW51XCIsXCJ1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnQgdWktZnJvbnRcIiksZT1sLmFkZCh0aGlzLmVsZW1lbnQpLGk9ZS5maW5kKHRoaXMub3B0aW9ucy5pdGVtcyksaS5ub3QoXCIudWktbWVudS1pdGVtXCIpLmVhY2goZnVuY3Rpb24oKXt2YXIgZT10KHRoaXMpO2EuX2lzRGl2aWRlcihlKSYmYS5fYWRkQ2xhc3MoZSxcInVpLW1lbnUtZGl2aWRlclwiLFwidWktd2lkZ2V0LWNvbnRlbnRcIil9KSxuPWkubm90KFwiLnVpLW1lbnUtaXRlbSwgLnVpLW1lbnUtZGl2aWRlclwiKSxvPW4uY2hpbGRyZW4oKS5ub3QoXCIudWktbWVudVwiKS51bmlxdWVJZCgpLmF0dHIoe3RhYkluZGV4Oi0xLHJvbGU6dGhpcy5faXRlbVJvbGUoKX0pLHRoaXMuX2FkZENsYXNzKG4sXCJ1aS1tZW51LWl0ZW1cIikuX2FkZENsYXNzKG8sXCJ1aS1tZW51LWl0ZW0td3JhcHBlclwiKSxpLmZpbHRlcihcIi51aS1zdGF0ZS1kaXNhYmxlZFwiKS5hdHRyKFwiYXJpYS1kaXNhYmxlZFwiLFwidHJ1ZVwiKSx0aGlzLmFjdGl2ZSYmIXQuY29udGFpbnModGhpcy5lbGVtZW50WzBdLHRoaXMuYWN0aXZlWzBdKSYmdGhpcy5ibHVyKCl9LF9pdGVtUm9sZTpmdW5jdGlvbigpe3JldHVybnttZW51OlwibWVudWl0ZW1cIixsaXN0Ym94Olwib3B0aW9uXCJ9W3RoaXMub3B0aW9ucy5yb2xlXX0sX3NldE9wdGlvbjpmdW5jdGlvbih0LGUpe2lmKFwiaWNvbnNcIj09PXQpe3ZhciBpPXRoaXMuZWxlbWVudC5maW5kKFwiLnVpLW1lbnUtaWNvblwiKTt0aGlzLl9yZW1vdmVDbGFzcyhpLG51bGwsdGhpcy5vcHRpb25zLmljb25zLnN1Ym1lbnUpLl9hZGRDbGFzcyhpLG51bGwsZS5zdWJtZW51KX10aGlzLl9zdXBlcih0LGUpfSxfc2V0T3B0aW9uRGlzYWJsZWQ6ZnVuY3Rpb24odCl7dGhpcy5fc3VwZXIodCksdGhpcy5lbGVtZW50LmF0dHIoXCJhcmlhLWRpc2FibGVkXCIsdCtcIlwiKSx0aGlzLl90b2dnbGVDbGFzcyhudWxsLFwidWktc3RhdGUtZGlzYWJsZWRcIiwhIXQpfSxmb2N1czpmdW5jdGlvbih0LGUpe3ZhciBpLHMsbjt0aGlzLmJsdXIodCx0JiZcImZvY3VzXCI9PT10LnR5cGUpLHRoaXMuX3Njcm9sbEludG9WaWV3KGUpLHRoaXMuYWN0aXZlPWUuZmlyc3QoKSxzPXRoaXMuYWN0aXZlLmNoaWxkcmVuKFwiLnVpLW1lbnUtaXRlbS13cmFwcGVyXCIpLHRoaXMuX2FkZENsYXNzKHMsbnVsbCxcInVpLXN0YXRlLWFjdGl2ZVwiKSx0aGlzLm9wdGlvbnMucm9sZSYmdGhpcy5lbGVtZW50LmF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIixzLmF0dHIoXCJpZFwiKSksbj10aGlzLmFjdGl2ZS5wYXJlbnQoKS5jbG9zZXN0KFwiLnVpLW1lbnUtaXRlbVwiKS5jaGlsZHJlbihcIi51aS1tZW51LWl0ZW0td3JhcHBlclwiKSx0aGlzLl9hZGRDbGFzcyhuLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksdCYmXCJrZXlkb3duXCI9PT10LnR5cGU/dGhpcy5fY2xvc2UoKTp0aGlzLnRpbWVyPXRoaXMuX2RlbGF5KGZ1bmN0aW9uKCl7dGhpcy5fY2xvc2UoKX0sdGhpcy5kZWxheSksaT1lLmNoaWxkcmVuKFwiLnVpLW1lbnVcIiksaS5sZW5ndGgmJnQmJi9ebW91c2UvLnRlc3QodC50eXBlKSYmdGhpcy5fc3RhcnRPcGVuaW5nKGkpLHRoaXMuYWN0aXZlTWVudT1lLnBhcmVudCgpLHRoaXMuX3RyaWdnZXIoXCJmb2N1c1wiLHQse2l0ZW06ZX0pfSxfc2Nyb2xsSW50b1ZpZXc6ZnVuY3Rpb24oZSl7dmFyIGkscyxuLG8sYSxyO3RoaXMuX2hhc1Njcm9sbCgpJiYoaT1wYXJzZUZsb2F0KHQuY3NzKHRoaXMuYWN0aXZlTWVudVswXSxcImJvcmRlclRvcFdpZHRoXCIpKXx8MCxzPXBhcnNlRmxvYXQodC5jc3ModGhpcy5hY3RpdmVNZW51WzBdLFwicGFkZGluZ1RvcFwiKSl8fDAsbj1lLm9mZnNldCgpLnRvcC10aGlzLmFjdGl2ZU1lbnUub2Zmc2V0KCkudG9wLWktcyxvPXRoaXMuYWN0aXZlTWVudS5zY3JvbGxUb3AoKSxhPXRoaXMuYWN0aXZlTWVudS5oZWlnaHQoKSxyPWUub3V0ZXJIZWlnaHQoKSwwPm4/dGhpcy5hY3RpdmVNZW51LnNjcm9sbFRvcChvK24pOm4rcj5hJiZ0aGlzLmFjdGl2ZU1lbnUuc2Nyb2xsVG9wKG8rbi1hK3IpKX0sYmx1cjpmdW5jdGlvbih0LGUpe2V8fGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKSx0aGlzLmFjdGl2ZSYmKHRoaXMuX3JlbW92ZUNsYXNzKHRoaXMuYWN0aXZlLmNoaWxkcmVuKFwiLnVpLW1lbnUtaXRlbS13cmFwcGVyXCIpLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksdGhpcy5fdHJpZ2dlcihcImJsdXJcIix0LHtpdGVtOnRoaXMuYWN0aXZlfSksdGhpcy5hY3RpdmU9bnVsbCl9LF9zdGFydE9wZW5pbmc6ZnVuY3Rpb24odCl7Y2xlYXJUaW1lb3V0KHRoaXMudGltZXIpLFwidHJ1ZVwiPT09dC5hdHRyKFwiYXJpYS1oaWRkZW5cIikmJih0aGlzLnRpbWVyPXRoaXMuX2RlbGF5KGZ1bmN0aW9uKCl7dGhpcy5fY2xvc2UoKSx0aGlzLl9vcGVuKHQpfSx0aGlzLmRlbGF5KSl9LF9vcGVuOmZ1bmN0aW9uKGUpe3ZhciBpPXQuZXh0ZW5kKHtvZjp0aGlzLmFjdGl2ZX0sdGhpcy5vcHRpb25zLnBvc2l0aW9uKTtjbGVhclRpbWVvdXQodGhpcy50aW1lciksdGhpcy5lbGVtZW50LmZpbmQoXCIudWktbWVudVwiKS5ub3QoZS5wYXJlbnRzKFwiLnVpLW1lbnVcIikpLmhpZGUoKS5hdHRyKFwiYXJpYS1oaWRkZW5cIixcInRydWVcIiksZS5zaG93KCkucmVtb3ZlQXR0cihcImFyaWEtaGlkZGVuXCIpLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIsXCJ0cnVlXCIpLnBvc2l0aW9uKGkpfSxjb2xsYXBzZUFsbDpmdW5jdGlvbihlLGkpe2NsZWFyVGltZW91dCh0aGlzLnRpbWVyKSx0aGlzLnRpbWVyPXRoaXMuX2RlbGF5KGZ1bmN0aW9uKCl7dmFyIHM9aT90aGlzLmVsZW1lbnQ6dChlJiZlLnRhcmdldCkuY2xvc2VzdCh0aGlzLmVsZW1lbnQuZmluZChcIi51aS1tZW51XCIpKTtzLmxlbmd0aHx8KHM9dGhpcy5lbGVtZW50KSx0aGlzLl9jbG9zZShzKSx0aGlzLmJsdXIoZSksdGhpcy5fcmVtb3ZlQ2xhc3Mocy5maW5kKFwiLnVpLXN0YXRlLWFjdGl2ZVwiKSxudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpLHRoaXMuYWN0aXZlTWVudT1zfSx0aGlzLmRlbGF5KX0sX2Nsb3NlOmZ1bmN0aW9uKHQpe3R8fCh0PXRoaXMuYWN0aXZlP3RoaXMuYWN0aXZlLnBhcmVudCgpOnRoaXMuZWxlbWVudCksdC5maW5kKFwiLnVpLW1lbnVcIikuaGlkZSgpLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKS5hdHRyKFwiYXJpYS1leHBhbmRlZFwiLFwiZmFsc2VcIil9LF9jbG9zZU9uRG9jdW1lbnRDbGljazpmdW5jdGlvbihlKXtyZXR1cm4hdChlLnRhcmdldCkuY2xvc2VzdChcIi51aS1tZW51XCIpLmxlbmd0aH0sX2lzRGl2aWRlcjpmdW5jdGlvbih0KXtyZXR1cm4hL1teXFwtXFx1MjAxNFxcdTIwMTNcXHNdLy50ZXN0KHQudGV4dCgpKX0sY29sbGFwc2U6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5hY3RpdmUmJnRoaXMuYWN0aXZlLnBhcmVudCgpLmNsb3Nlc3QoXCIudWktbWVudS1pdGVtXCIsdGhpcy5lbGVtZW50KTtlJiZlLmxlbmd0aCYmKHRoaXMuX2Nsb3NlKCksdGhpcy5mb2N1cyh0LGUpKX0sZXhwYW5kOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuYWN0aXZlJiZ0aGlzLmFjdGl2ZS5jaGlsZHJlbihcIi51aS1tZW51IFwiKS5maW5kKHRoaXMub3B0aW9ucy5pdGVtcykuZmlyc3QoKTtlJiZlLmxlbmd0aCYmKHRoaXMuX29wZW4oZS5wYXJlbnQoKSksdGhpcy5fZGVsYXkoZnVuY3Rpb24oKXt0aGlzLmZvY3VzKHQsZSl9KSl9LG5leHQ6ZnVuY3Rpb24odCl7dGhpcy5fbW92ZShcIm5leHRcIixcImZpcnN0XCIsdCl9LHByZXZpb3VzOmZ1bmN0aW9uKHQpe3RoaXMuX21vdmUoXCJwcmV2XCIsXCJsYXN0XCIsdCl9LGlzRmlyc3RJdGVtOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYWN0aXZlJiYhdGhpcy5hY3RpdmUucHJldkFsbChcIi51aS1tZW51LWl0ZW1cIikubGVuZ3RofSxpc0xhc3RJdGVtOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYWN0aXZlJiYhdGhpcy5hY3RpdmUubmV4dEFsbChcIi51aS1tZW51LWl0ZW1cIikubGVuZ3RofSxfbW92ZTpmdW5jdGlvbih0LGUsaSl7dmFyIHM7dGhpcy5hY3RpdmUmJihzPVwiZmlyc3RcIj09PXR8fFwibGFzdFwiPT09dD90aGlzLmFjdGl2ZVtcImZpcnN0XCI9PT10P1wicHJldkFsbFwiOlwibmV4dEFsbFwiXShcIi51aS1tZW51LWl0ZW1cIikuZXEoLTEpOnRoaXMuYWN0aXZlW3QrXCJBbGxcIl0oXCIudWktbWVudS1pdGVtXCIpLmVxKDApKSxzJiZzLmxlbmd0aCYmdGhpcy5hY3RpdmV8fChzPXRoaXMuYWN0aXZlTWVudS5maW5kKHRoaXMub3B0aW9ucy5pdGVtcylbZV0oKSksdGhpcy5mb2N1cyhpLHMpfSxuZXh0UGFnZTpmdW5jdGlvbihlKXt2YXIgaSxzLG47cmV0dXJuIHRoaXMuYWN0aXZlPyh0aGlzLmlzTGFzdEl0ZW0oKXx8KHRoaXMuX2hhc1Njcm9sbCgpPyhzPXRoaXMuYWN0aXZlLm9mZnNldCgpLnRvcCxuPXRoaXMuZWxlbWVudC5oZWlnaHQoKSx0aGlzLmFjdGl2ZS5uZXh0QWxsKFwiLnVpLW1lbnUtaXRlbVwiKS5lYWNoKGZ1bmN0aW9uKCl7cmV0dXJuIGk9dCh0aGlzKSwwPmkub2Zmc2V0KCkudG9wLXMtbn0pLHRoaXMuZm9jdXMoZSxpKSk6dGhpcy5mb2N1cyhlLHRoaXMuYWN0aXZlTWVudS5maW5kKHRoaXMub3B0aW9ucy5pdGVtcylbdGhpcy5hY3RpdmU/XCJsYXN0XCI6XCJmaXJzdFwiXSgpKSksdm9pZCAwKToodGhpcy5uZXh0KGUpLHZvaWQgMCl9LHByZXZpb3VzUGFnZTpmdW5jdGlvbihlKXt2YXIgaSxzLG47cmV0dXJuIHRoaXMuYWN0aXZlPyh0aGlzLmlzRmlyc3RJdGVtKCl8fCh0aGlzLl9oYXNTY3JvbGwoKT8ocz10aGlzLmFjdGl2ZS5vZmZzZXQoKS50b3Asbj10aGlzLmVsZW1lbnQuaGVpZ2h0KCksdGhpcy5hY3RpdmUucHJldkFsbChcIi51aS1tZW51LWl0ZW1cIikuZWFjaChmdW5jdGlvbigpe3JldHVybiBpPXQodGhpcyksaS5vZmZzZXQoKS50b3AtcytuPjB9KSx0aGlzLmZvY3VzKGUsaSkpOnRoaXMuZm9jdXMoZSx0aGlzLmFjdGl2ZU1lbnUuZmluZCh0aGlzLm9wdGlvbnMuaXRlbXMpLmZpcnN0KCkpKSx2b2lkIDApOih0aGlzLm5leHQoZSksdm9pZCAwKX0sX2hhc1Njcm9sbDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmVsZW1lbnQub3V0ZXJIZWlnaHQoKTx0aGlzLmVsZW1lbnQucHJvcChcInNjcm9sbEhlaWdodFwiKX0sc2VsZWN0OmZ1bmN0aW9uKGUpe3RoaXMuYWN0aXZlPXRoaXMuYWN0aXZlfHx0KGUudGFyZ2V0KS5jbG9zZXN0KFwiLnVpLW1lbnUtaXRlbVwiKTt2YXIgaT17aXRlbTp0aGlzLmFjdGl2ZX07dGhpcy5hY3RpdmUuaGFzKFwiLnVpLW1lbnVcIikubGVuZ3RofHx0aGlzLmNvbGxhcHNlQWxsKGUsITApLHRoaXMuX3RyaWdnZXIoXCJzZWxlY3RcIixlLGkpfSxfZmlsdGVyTWVudUl0ZW1zOmZ1bmN0aW9uKGUpe3ZhciBpPWUucmVwbGFjZSgvW1xcLVxcW1xcXXt9KCkqKz8uLFxcXFxcXF4kfCNcXHNdL2csXCJcXFxcJCZcIikscz1SZWdFeHAoXCJeXCIraSxcImlcIik7cmV0dXJuIHRoaXMuYWN0aXZlTWVudS5maW5kKHRoaXMub3B0aW9ucy5pdGVtcykuZmlsdGVyKFwiLnVpLW1lbnUtaXRlbVwiKS5maWx0ZXIoZnVuY3Rpb24oKXtyZXR1cm4gcy50ZXN0KHQudHJpbSh0KHRoaXMpLmNoaWxkcmVuKFwiLnVpLW1lbnUtaXRlbS13cmFwcGVyXCIpLnRleHQoKSkpfSl9fSksdC53aWRnZXQoXCJ1aS5hdXRvY29tcGxldGVcIix7dmVyc2lvbjpcIjEuMTIuMVwiLGRlZmF1bHRFbGVtZW50OlwiPGlucHV0PlwiLG9wdGlvbnM6e2FwcGVuZFRvOm51bGwsYXV0b0ZvY3VzOiExLGRlbGF5OjMwMCxtaW5MZW5ndGg6MSxwb3NpdGlvbjp7bXk6XCJsZWZ0IHRvcFwiLGF0OlwibGVmdCBib3R0b21cIixjb2xsaXNpb246XCJub25lXCJ9LHNvdXJjZTpudWxsLGNoYW5nZTpudWxsLGNsb3NlOm51bGwsZm9jdXM6bnVsbCxvcGVuOm51bGwscmVzcG9uc2U6bnVsbCxzZWFyY2g6bnVsbCxzZWxlY3Q6bnVsbH0scmVxdWVzdEluZGV4OjAscGVuZGluZzowLF9jcmVhdGU6ZnVuY3Rpb24oKXt2YXIgZSxpLHMsbj10aGlzLmVsZW1lbnRbMF0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxvPVwidGV4dGFyZWFcIj09PW4sYT1cImlucHV0XCI9PT1uO3RoaXMuaXNNdWx0aUxpbmU9b3x8IWEmJnRoaXMuX2lzQ29udGVudEVkaXRhYmxlKHRoaXMuZWxlbWVudCksdGhpcy52YWx1ZU1ldGhvZD10aGlzLmVsZW1lbnRbb3x8YT9cInZhbFwiOlwidGV4dFwiXSx0aGlzLmlzTmV3TWVudT0hMCx0aGlzLl9hZGRDbGFzcyhcInVpLWF1dG9jb21wbGV0ZS1pbnB1dFwiKSx0aGlzLmVsZW1lbnQuYXR0cihcImF1dG9jb21wbGV0ZVwiLFwib2ZmXCIpLHRoaXMuX29uKHRoaXMuZWxlbWVudCx7a2V5ZG93bjpmdW5jdGlvbihuKXtpZih0aGlzLmVsZW1lbnQucHJvcChcInJlYWRPbmx5XCIpKXJldHVybiBlPSEwLHM9ITAsaT0hMCx2b2lkIDA7ZT0hMSxzPSExLGk9ITE7dmFyIG89dC51aS5rZXlDb2RlO3N3aXRjaChuLmtleUNvZGUpe2Nhc2Ugby5QQUdFX1VQOmU9ITAsdGhpcy5fbW92ZShcInByZXZpb3VzUGFnZVwiLG4pO2JyZWFrO2Nhc2Ugby5QQUdFX0RPV046ZT0hMCx0aGlzLl9tb3ZlKFwibmV4dFBhZ2VcIixuKTticmVhaztjYXNlIG8uVVA6ZT0hMCx0aGlzLl9rZXlFdmVudChcInByZXZpb3VzXCIsbik7YnJlYWs7Y2FzZSBvLkRPV046ZT0hMCx0aGlzLl9rZXlFdmVudChcIm5leHRcIixuKTticmVhaztjYXNlIG8uRU5URVI6dGhpcy5tZW51LmFjdGl2ZSYmKGU9ITAsbi5wcmV2ZW50RGVmYXVsdCgpLHRoaXMubWVudS5zZWxlY3QobikpO2JyZWFrO2Nhc2Ugby5UQUI6dGhpcy5tZW51LmFjdGl2ZSYmdGhpcy5tZW51LnNlbGVjdChuKTticmVhaztjYXNlIG8uRVNDQVBFOnRoaXMubWVudS5lbGVtZW50LmlzKFwiOnZpc2libGVcIikmJih0aGlzLmlzTXVsdGlMaW5lfHx0aGlzLl92YWx1ZSh0aGlzLnRlcm0pLHRoaXMuY2xvc2Uobiksbi5wcmV2ZW50RGVmYXVsdCgpKTticmVhaztkZWZhdWx0Omk9ITAsdGhpcy5fc2VhcmNoVGltZW91dChuKX19LGtleXByZXNzOmZ1bmN0aW9uKHMpe2lmKGUpcmV0dXJuIGU9ITEsKCF0aGlzLmlzTXVsdGlMaW5lfHx0aGlzLm1lbnUuZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpKSYmcy5wcmV2ZW50RGVmYXVsdCgpLHZvaWQgMDtpZighaSl7dmFyIG49dC51aS5rZXlDb2RlO3N3aXRjaChzLmtleUNvZGUpe2Nhc2Ugbi5QQUdFX1VQOnRoaXMuX21vdmUoXCJwcmV2aW91c1BhZ2VcIixzKTticmVhaztjYXNlIG4uUEFHRV9ET1dOOnRoaXMuX21vdmUoXCJuZXh0UGFnZVwiLHMpO2JyZWFrO2Nhc2Ugbi5VUDp0aGlzLl9rZXlFdmVudChcInByZXZpb3VzXCIscyk7YnJlYWs7Y2FzZSBuLkRPV046dGhpcy5fa2V5RXZlbnQoXCJuZXh0XCIscyl9fX0saW5wdXQ6ZnVuY3Rpb24odCl7cmV0dXJuIHM/KHM9ITEsdC5wcmV2ZW50RGVmYXVsdCgpLHZvaWQgMCk6KHRoaXMuX3NlYXJjaFRpbWVvdXQodCksdm9pZCAwKX0sZm9jdXM6ZnVuY3Rpb24oKXt0aGlzLnNlbGVjdGVkSXRlbT1udWxsLHRoaXMucHJldmlvdXM9dGhpcy5fdmFsdWUoKX0sYmx1cjpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5jYW5jZWxCbHVyPyhkZWxldGUgdGhpcy5jYW5jZWxCbHVyLHZvaWQgMCk6KGNsZWFyVGltZW91dCh0aGlzLnNlYXJjaGluZyksdGhpcy5jbG9zZSh0KSx0aGlzLl9jaGFuZ2UodCksdm9pZCAwKX19KSx0aGlzLl9pbml0U291cmNlKCksdGhpcy5tZW51PXQoXCI8dWw+XCIpLmFwcGVuZFRvKHRoaXMuX2FwcGVuZFRvKCkpLm1lbnUoe3JvbGU6bnVsbH0pLmhpZGUoKS5tZW51KFwiaW5zdGFuY2VcIiksdGhpcy5fYWRkQ2xhc3ModGhpcy5tZW51LmVsZW1lbnQsXCJ1aS1hdXRvY29tcGxldGVcIixcInVpLWZyb250XCIpLHRoaXMuX29uKHRoaXMubWVudS5lbGVtZW50LHttb3VzZWRvd246ZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpLHRoaXMuY2FuY2VsQmx1cj0hMCx0aGlzLl9kZWxheShmdW5jdGlvbigpe2RlbGV0ZSB0aGlzLmNhbmNlbEJsdXIsdGhpcy5lbGVtZW50WzBdIT09dC51aS5zYWZlQWN0aXZlRWxlbWVudCh0aGlzLmRvY3VtZW50WzBdKSYmdGhpcy5lbGVtZW50LnRyaWdnZXIoXCJmb2N1c1wiKX0pfSxtZW51Zm9jdXM6ZnVuY3Rpb24oZSxpKXt2YXIgcyxuO3JldHVybiB0aGlzLmlzTmV3TWVudSYmKHRoaXMuaXNOZXdNZW51PSExLGUub3JpZ2luYWxFdmVudCYmL15tb3VzZS8udGVzdChlLm9yaWdpbmFsRXZlbnQudHlwZSkpPyh0aGlzLm1lbnUuYmx1cigpLHRoaXMuZG9jdW1lbnQub25lKFwibW91c2Vtb3ZlXCIsZnVuY3Rpb24oKXt0KGUudGFyZ2V0KS50cmlnZ2VyKGUub3JpZ2luYWxFdmVudCl9KSx2b2lkIDApOihuPWkuaXRlbS5kYXRhKFwidWktYXV0b2NvbXBsZXRlLWl0ZW1cIiksITEhPT10aGlzLl90cmlnZ2VyKFwiZm9jdXNcIixlLHtpdGVtOm59KSYmZS5vcmlnaW5hbEV2ZW50JiYvXmtleS8udGVzdChlLm9yaWdpbmFsRXZlbnQudHlwZSkmJnRoaXMuX3ZhbHVlKG4udmFsdWUpLHM9aS5pdGVtLmF0dHIoXCJhcmlhLWxhYmVsXCIpfHxuLnZhbHVlLHMmJnQudHJpbShzKS5sZW5ndGgmJih0aGlzLmxpdmVSZWdpb24uY2hpbGRyZW4oKS5oaWRlKCksdChcIjxkaXY+XCIpLnRleHQocykuYXBwZW5kVG8odGhpcy5saXZlUmVnaW9uKSksdm9pZCAwKX0sbWVudXNlbGVjdDpmdW5jdGlvbihlLGkpe3ZhciBzPWkuaXRlbS5kYXRhKFwidWktYXV0b2NvbXBsZXRlLWl0ZW1cIiksbj10aGlzLnByZXZpb3VzO3RoaXMuZWxlbWVudFswXSE9PXQudWkuc2FmZUFjdGl2ZUVsZW1lbnQodGhpcy5kb2N1bWVudFswXSkmJih0aGlzLmVsZW1lbnQudHJpZ2dlcihcImZvY3VzXCIpLHRoaXMucHJldmlvdXM9bix0aGlzLl9kZWxheShmdW5jdGlvbigpe3RoaXMucHJldmlvdXM9bix0aGlzLnNlbGVjdGVkSXRlbT1zfSkpLCExIT09dGhpcy5fdHJpZ2dlcihcInNlbGVjdFwiLGUse2l0ZW06c30pJiZ0aGlzLl92YWx1ZShzLnZhbHVlKSx0aGlzLnRlcm09dGhpcy5fdmFsdWUoKSx0aGlzLmNsb3NlKGUpLHRoaXMuc2VsZWN0ZWRJdGVtPXN9fSksdGhpcy5saXZlUmVnaW9uPXQoXCI8ZGl2PlwiLHtyb2xlOlwic3RhdHVzXCIsXCJhcmlhLWxpdmVcIjpcImFzc2VydGl2ZVwiLFwiYXJpYS1yZWxldmFudFwiOlwiYWRkaXRpb25zXCJ9KS5hcHBlbmRUbyh0aGlzLmRvY3VtZW50WzBdLmJvZHkpLHRoaXMuX2FkZENsYXNzKHRoaXMubGl2ZVJlZ2lvbixudWxsLFwidWktaGVscGVyLWhpZGRlbi1hY2Nlc3NpYmxlXCIpLHRoaXMuX29uKHRoaXMud2luZG93LHtiZWZvcmV1bmxvYWQ6ZnVuY3Rpb24oKXt0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cihcImF1dG9jb21wbGV0ZVwiKX19KX0sX2Rlc3Ryb3k6ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQodGhpcy5zZWFyY2hpbmcpLHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyKFwiYXV0b2NvbXBsZXRlXCIpLHRoaXMubWVudS5lbGVtZW50LnJlbW92ZSgpLHRoaXMubGl2ZVJlZ2lvbi5yZW1vdmUoKX0sX3NldE9wdGlvbjpmdW5jdGlvbih0LGUpe3RoaXMuX3N1cGVyKHQsZSksXCJzb3VyY2VcIj09PXQmJnRoaXMuX2luaXRTb3VyY2UoKSxcImFwcGVuZFRvXCI9PT10JiZ0aGlzLm1lbnUuZWxlbWVudC5hcHBlbmRUbyh0aGlzLl9hcHBlbmRUbygpKSxcImRpc2FibGVkXCI9PT10JiZlJiZ0aGlzLnhociYmdGhpcy54aHIuYWJvcnQoKX0sX2lzRXZlbnRUYXJnZXRJbldpZGdldDpmdW5jdGlvbihlKXt2YXIgaT10aGlzLm1lbnUuZWxlbWVudFswXTtyZXR1cm4gZS50YXJnZXQ9PT10aGlzLmVsZW1lbnRbMF18fGUudGFyZ2V0PT09aXx8dC5jb250YWlucyhpLGUudGFyZ2V0KX0sX2Nsb3NlT25DbGlja091dHNpZGU6ZnVuY3Rpb24odCl7dGhpcy5faXNFdmVudFRhcmdldEluV2lkZ2V0KHQpfHx0aGlzLmNsb3NlKClcbn0sX2FwcGVuZFRvOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5vcHRpb25zLmFwcGVuZFRvO3JldHVybiBlJiYoZT1lLmpxdWVyeXx8ZS5ub2RlVHlwZT90KGUpOnRoaXMuZG9jdW1lbnQuZmluZChlKS5lcSgwKSksZSYmZVswXXx8KGU9dGhpcy5lbGVtZW50LmNsb3Nlc3QoXCIudWktZnJvbnQsIGRpYWxvZ1wiKSksZS5sZW5ndGh8fChlPXRoaXMuZG9jdW1lbnRbMF0uYm9keSksZX0sX2luaXRTb3VyY2U6ZnVuY3Rpb24oKXt2YXIgZSxpLHM9dGhpczt0LmlzQXJyYXkodGhpcy5vcHRpb25zLnNvdXJjZSk/KGU9dGhpcy5vcHRpb25zLnNvdXJjZSx0aGlzLnNvdXJjZT1mdW5jdGlvbihpLHMpe3ModC51aS5hdXRvY29tcGxldGUuZmlsdGVyKGUsaS50ZXJtKSl9KTpcInN0cmluZ1wiPT10eXBlb2YgdGhpcy5vcHRpb25zLnNvdXJjZT8oaT10aGlzLm9wdGlvbnMuc291cmNlLHRoaXMuc291cmNlPWZ1bmN0aW9uKGUsbil7cy54aHImJnMueGhyLmFib3J0KCkscy54aHI9dC5hamF4KHt1cmw6aSxkYXRhOmUsZGF0YVR5cGU6XCJqc29uXCIsc3VjY2VzczpmdW5jdGlvbih0KXtuKHQpfSxlcnJvcjpmdW5jdGlvbigpe24oW10pfX0pfSk6dGhpcy5zb3VyY2U9dGhpcy5vcHRpb25zLnNvdXJjZX0sX3NlYXJjaFRpbWVvdXQ6ZnVuY3Rpb24odCl7Y2xlYXJUaW1lb3V0KHRoaXMuc2VhcmNoaW5nKSx0aGlzLnNlYXJjaGluZz10aGlzLl9kZWxheShmdW5jdGlvbigpe3ZhciBlPXRoaXMudGVybT09PXRoaXMuX3ZhbHVlKCksaT10aGlzLm1lbnUuZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpLHM9dC5hbHRLZXl8fHQuY3RybEtleXx8dC5tZXRhS2V5fHx0LnNoaWZ0S2V5OyghZXx8ZSYmIWkmJiFzKSYmKHRoaXMuc2VsZWN0ZWRJdGVtPW51bGwsdGhpcy5zZWFyY2gobnVsbCx0KSl9LHRoaXMub3B0aW9ucy5kZWxheSl9LHNlYXJjaDpmdW5jdGlvbih0LGUpe3JldHVybiB0PW51bGwhPXQ/dDp0aGlzLl92YWx1ZSgpLHRoaXMudGVybT10aGlzLl92YWx1ZSgpLHQubGVuZ3RoPHRoaXMub3B0aW9ucy5taW5MZW5ndGg/dGhpcy5jbG9zZShlKTp0aGlzLl90cmlnZ2VyKFwic2VhcmNoXCIsZSkhPT0hMT90aGlzLl9zZWFyY2godCk6dm9pZCAwfSxfc2VhcmNoOmZ1bmN0aW9uKHQpe3RoaXMucGVuZGluZysrLHRoaXMuX2FkZENsYXNzKFwidWktYXV0b2NvbXBsZXRlLWxvYWRpbmdcIiksdGhpcy5jYW5jZWxTZWFyY2g9ITEsdGhpcy5zb3VyY2Uoe3Rlcm06dH0sdGhpcy5fcmVzcG9uc2UoKSl9LF9yZXNwb25zZTpmdW5jdGlvbigpe3ZhciBlPSsrdGhpcy5yZXF1ZXN0SW5kZXg7cmV0dXJuIHQucHJveHkoZnVuY3Rpb24odCl7ZT09PXRoaXMucmVxdWVzdEluZGV4JiZ0aGlzLl9fcmVzcG9uc2UodCksdGhpcy5wZW5kaW5nLS0sdGhpcy5wZW5kaW5nfHx0aGlzLl9yZW1vdmVDbGFzcyhcInVpLWF1dG9jb21wbGV0ZS1sb2FkaW5nXCIpfSx0aGlzKX0sX19yZXNwb25zZTpmdW5jdGlvbih0KXt0JiYodD10aGlzLl9ub3JtYWxpemUodCkpLHRoaXMuX3RyaWdnZXIoXCJyZXNwb25zZVwiLG51bGwse2NvbnRlbnQ6dH0pLCF0aGlzLm9wdGlvbnMuZGlzYWJsZWQmJnQmJnQubGVuZ3RoJiYhdGhpcy5jYW5jZWxTZWFyY2g/KHRoaXMuX3N1Z2dlc3QodCksdGhpcy5fdHJpZ2dlcihcIm9wZW5cIikpOnRoaXMuX2Nsb3NlKCl9LGNsb3NlOmZ1bmN0aW9uKHQpe3RoaXMuY2FuY2VsU2VhcmNoPSEwLHRoaXMuX2Nsb3NlKHQpfSxfY2xvc2U6ZnVuY3Rpb24odCl7dGhpcy5fb2ZmKHRoaXMuZG9jdW1lbnQsXCJtb3VzZWRvd25cIiksdGhpcy5tZW51LmVsZW1lbnQuaXMoXCI6dmlzaWJsZVwiKSYmKHRoaXMubWVudS5lbGVtZW50LmhpZGUoKSx0aGlzLm1lbnUuYmx1cigpLHRoaXMuaXNOZXdNZW51PSEwLHRoaXMuX3RyaWdnZXIoXCJjbG9zZVwiLHQpKX0sX2NoYW5nZTpmdW5jdGlvbih0KXt0aGlzLnByZXZpb3VzIT09dGhpcy5fdmFsdWUoKSYmdGhpcy5fdHJpZ2dlcihcImNoYW5nZVwiLHQse2l0ZW06dGhpcy5zZWxlY3RlZEl0ZW19KX0sX25vcm1hbGl6ZTpmdW5jdGlvbihlKXtyZXR1cm4gZS5sZW5ndGgmJmVbMF0ubGFiZWwmJmVbMF0udmFsdWU/ZTp0Lm1hcChlLGZ1bmN0aW9uKGUpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBlP3tsYWJlbDplLHZhbHVlOmV9OnQuZXh0ZW5kKHt9LGUse2xhYmVsOmUubGFiZWx8fGUudmFsdWUsdmFsdWU6ZS52YWx1ZXx8ZS5sYWJlbH0pfSl9LF9zdWdnZXN0OmZ1bmN0aW9uKGUpe3ZhciBpPXRoaXMubWVudS5lbGVtZW50LmVtcHR5KCk7dGhpcy5fcmVuZGVyTWVudShpLGUpLHRoaXMuaXNOZXdNZW51PSEwLHRoaXMubWVudS5yZWZyZXNoKCksaS5zaG93KCksdGhpcy5fcmVzaXplTWVudSgpLGkucG9zaXRpb24odC5leHRlbmQoe29mOnRoaXMuZWxlbWVudH0sdGhpcy5vcHRpb25zLnBvc2l0aW9uKSksdGhpcy5vcHRpb25zLmF1dG9Gb2N1cyYmdGhpcy5tZW51Lm5leHQoKSx0aGlzLl9vbih0aGlzLmRvY3VtZW50LHttb3VzZWRvd246XCJfY2xvc2VPbkNsaWNrT3V0c2lkZVwifSl9LF9yZXNpemVNZW51OmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5tZW51LmVsZW1lbnQ7dC5vdXRlcldpZHRoKE1hdGgubWF4KHQud2lkdGgoXCJcIikub3V0ZXJXaWR0aCgpKzEsdGhpcy5lbGVtZW50Lm91dGVyV2lkdGgoKSkpfSxfcmVuZGVyTWVudTpmdW5jdGlvbihlLGkpe3ZhciBzPXRoaXM7dC5lYWNoKGksZnVuY3Rpb24odCxpKXtzLl9yZW5kZXJJdGVtRGF0YShlLGkpfSl9LF9yZW5kZXJJdGVtRGF0YTpmdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLl9yZW5kZXJJdGVtKHQsZSkuZGF0YShcInVpLWF1dG9jb21wbGV0ZS1pdGVtXCIsZSl9LF9yZW5kZXJJdGVtOmZ1bmN0aW9uKGUsaSl7cmV0dXJuIHQoXCI8bGk+XCIpLmFwcGVuZCh0KFwiPGRpdj5cIikudGV4dChpLmxhYmVsKSkuYXBwZW5kVG8oZSl9LF9tb3ZlOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMubWVudS5lbGVtZW50LmlzKFwiOnZpc2libGVcIik/dGhpcy5tZW51LmlzRmlyc3RJdGVtKCkmJi9ecHJldmlvdXMvLnRlc3QodCl8fHRoaXMubWVudS5pc0xhc3RJdGVtKCkmJi9ebmV4dC8udGVzdCh0KT8odGhpcy5pc011bHRpTGluZXx8dGhpcy5fdmFsdWUodGhpcy50ZXJtKSx0aGlzLm1lbnUuYmx1cigpLHZvaWQgMCk6KHRoaXMubWVudVt0XShlKSx2b2lkIDApOih0aGlzLnNlYXJjaChudWxsLGUpLHZvaWQgMCl9LHdpZGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1lbnUuZWxlbWVudH0sX3ZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudmFsdWVNZXRob2QuYXBwbHkodGhpcy5lbGVtZW50LGFyZ3VtZW50cyl9LF9rZXlFdmVudDpmdW5jdGlvbih0LGUpeyghdGhpcy5pc011bHRpTGluZXx8dGhpcy5tZW51LmVsZW1lbnQuaXMoXCI6dmlzaWJsZVwiKSkmJih0aGlzLl9tb3ZlKHQsZSksZS5wcmV2ZW50RGVmYXVsdCgpKX0sX2lzQ29udGVudEVkaXRhYmxlOmZ1bmN0aW9uKHQpe2lmKCF0Lmxlbmd0aClyZXR1cm4hMTt2YXIgZT10LnByb3AoXCJjb250ZW50RWRpdGFibGVcIik7cmV0dXJuXCJpbmhlcml0XCI9PT1lP3RoaXMuX2lzQ29udGVudEVkaXRhYmxlKHQucGFyZW50KCkpOlwidHJ1ZVwiPT09ZX19KSx0LmV4dGVuZCh0LnVpLmF1dG9jb21wbGV0ZSx7ZXNjYXBlUmVnZXg6ZnVuY3Rpb24odCl7cmV0dXJuIHQucmVwbGFjZSgvW1xcLVxcW1xcXXt9KCkqKz8uLFxcXFxcXF4kfCNcXHNdL2csXCJcXFxcJCZcIil9LGZpbHRlcjpmdW5jdGlvbihlLGkpe3ZhciBzPVJlZ0V4cCh0LnVpLmF1dG9jb21wbGV0ZS5lc2NhcGVSZWdleChpKSxcImlcIik7cmV0dXJuIHQuZ3JlcChlLGZ1bmN0aW9uKHQpe3JldHVybiBzLnRlc3QodC5sYWJlbHx8dC52YWx1ZXx8dCl9KX19KSx0LndpZGdldChcInVpLmF1dG9jb21wbGV0ZVwiLHQudWkuYXV0b2NvbXBsZXRlLHtvcHRpb25zOnttZXNzYWdlczp7bm9SZXN1bHRzOlwiTm8gc2VhcmNoIHJlc3VsdHMuXCIscmVzdWx0czpmdW5jdGlvbih0KXtyZXR1cm4gdCsodD4xP1wiIHJlc3VsdHMgYXJlXCI6XCIgcmVzdWx0IGlzXCIpK1wiIGF2YWlsYWJsZSwgdXNlIHVwIGFuZCBkb3duIGFycm93IGtleXMgdG8gbmF2aWdhdGUuXCJ9fX0sX19yZXNwb25zZTpmdW5jdGlvbihlKXt2YXIgaTt0aGlzLl9zdXBlckFwcGx5KGFyZ3VtZW50cyksdGhpcy5vcHRpb25zLmRpc2FibGVkfHx0aGlzLmNhbmNlbFNlYXJjaHx8KGk9ZSYmZS5sZW5ndGg/dGhpcy5vcHRpb25zLm1lc3NhZ2VzLnJlc3VsdHMoZS5sZW5ndGgpOnRoaXMub3B0aW9ucy5tZXNzYWdlcy5ub1Jlc3VsdHMsdGhpcy5saXZlUmVnaW9uLmNoaWxkcmVuKCkuaGlkZSgpLHQoXCI8ZGl2PlwiKS50ZXh0KGkpLmFwcGVuZFRvKHRoaXMubGl2ZVJlZ2lvbikpfX0pLHQudWkuYXV0b2NvbXBsZXRlLHQuZXh0ZW5kKHQudWkse2RhdGVwaWNrZXI6e3ZlcnNpb246XCIxLjEyLjFcIn19KTt2YXIgbDt0LmV4dGVuZChpLnByb3RvdHlwZSx7bWFya2VyQ2xhc3NOYW1lOlwiaGFzRGF0ZXBpY2tlclwiLG1heFJvd3M6NCxfd2lkZ2V0RGF0ZXBpY2tlcjpmdW5jdGlvbigpe3JldHVybiB0aGlzLmRwRGl2fSxzZXREZWZhdWx0czpmdW5jdGlvbih0KXtyZXR1cm4gbyh0aGlzLl9kZWZhdWx0cyx0fHx7fSksdGhpc30sX2F0dGFjaERhdGVwaWNrZXI6ZnVuY3Rpb24oZSxpKXt2YXIgcyxuLG87cz1lLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCksbj1cImRpdlwiPT09c3x8XCJzcGFuXCI9PT1zLGUuaWR8fCh0aGlzLnV1aWQrPTEsZS5pZD1cImRwXCIrdGhpcy51dWlkKSxvPXRoaXMuX25ld0luc3QodChlKSxuKSxvLnNldHRpbmdzPXQuZXh0ZW5kKHt9LGl8fHt9KSxcImlucHV0XCI9PT1zP3RoaXMuX2Nvbm5lY3REYXRlcGlja2VyKGUsbyk6biYmdGhpcy5faW5saW5lRGF0ZXBpY2tlcihlLG8pfSxfbmV3SW5zdDpmdW5jdGlvbihlLGkpe3ZhciBuPWVbMF0uaWQucmVwbGFjZSgvKFteQS1aYS16MC05X1xcLV0pL2csXCJcXFxcXFxcXCQxXCIpO3JldHVybntpZDpuLGlucHV0OmUsc2VsZWN0ZWREYXk6MCxzZWxlY3RlZE1vbnRoOjAsc2VsZWN0ZWRZZWFyOjAsZHJhd01vbnRoOjAsZHJhd1llYXI6MCxpbmxpbmU6aSxkcERpdjppP3ModChcIjxkaXYgY2xhc3M9J1wiK3RoaXMuX2lubGluZUNsYXNzK1wiIHVpLWRhdGVwaWNrZXIgdWktd2lkZ2V0IHVpLXdpZGdldC1jb250ZW50IHVpLWhlbHBlci1jbGVhcmZpeCB1aS1jb3JuZXItYWxsJz48L2Rpdj5cIikpOnRoaXMuZHBEaXZ9fSxfY29ubmVjdERhdGVwaWNrZXI6ZnVuY3Rpb24oZSxpKXt2YXIgcz10KGUpO2kuYXBwZW5kPXQoW10pLGkudHJpZ2dlcj10KFtdKSxzLmhhc0NsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKXx8KHRoaXMuX2F0dGFjaG1lbnRzKHMsaSkscy5hZGRDbGFzcyh0aGlzLm1hcmtlckNsYXNzTmFtZSkub24oXCJrZXlkb3duXCIsdGhpcy5fZG9LZXlEb3duKS5vbihcImtleXByZXNzXCIsdGhpcy5fZG9LZXlQcmVzcykub24oXCJrZXl1cFwiLHRoaXMuX2RvS2V5VXApLHRoaXMuX2F1dG9TaXplKGkpLHQuZGF0YShlLFwiZGF0ZXBpY2tlclwiLGkpLGkuc2V0dGluZ3MuZGlzYWJsZWQmJnRoaXMuX2Rpc2FibGVEYXRlcGlja2VyKGUpKX0sX2F0dGFjaG1lbnRzOmZ1bmN0aW9uKGUsaSl7dmFyIHMsbixvLGE9dGhpcy5fZ2V0KGksXCJhcHBlbmRUZXh0XCIpLHI9dGhpcy5fZ2V0KGksXCJpc1JUTFwiKTtpLmFwcGVuZCYmaS5hcHBlbmQucmVtb3ZlKCksYSYmKGkuYXBwZW5kPXQoXCI8c3BhbiBjbGFzcz0nXCIrdGhpcy5fYXBwZW5kQ2xhc3MrXCInPlwiK2ErXCI8L3NwYW4+XCIpLGVbcj9cImJlZm9yZVwiOlwiYWZ0ZXJcIl0oaS5hcHBlbmQpKSxlLm9mZihcImZvY3VzXCIsdGhpcy5fc2hvd0RhdGVwaWNrZXIpLGkudHJpZ2dlciYmaS50cmlnZ2VyLnJlbW92ZSgpLHM9dGhpcy5fZ2V0KGksXCJzaG93T25cIiksKFwiZm9jdXNcIj09PXN8fFwiYm90aFwiPT09cykmJmUub24oXCJmb2N1c1wiLHRoaXMuX3Nob3dEYXRlcGlja2VyKSwoXCJidXR0b25cIj09PXN8fFwiYm90aFwiPT09cykmJihuPXRoaXMuX2dldChpLFwiYnV0dG9uVGV4dFwiKSxvPXRoaXMuX2dldChpLFwiYnV0dG9uSW1hZ2VcIiksaS50cmlnZ2VyPXQodGhpcy5fZ2V0KGksXCJidXR0b25JbWFnZU9ubHlcIik/dChcIjxpbWcvPlwiKS5hZGRDbGFzcyh0aGlzLl90cmlnZ2VyQ2xhc3MpLmF0dHIoe3NyYzpvLGFsdDpuLHRpdGxlOm59KTp0KFwiPGJ1dHRvbiB0eXBlPSdidXR0b24nPjwvYnV0dG9uPlwiKS5hZGRDbGFzcyh0aGlzLl90cmlnZ2VyQ2xhc3MpLmh0bWwobz90KFwiPGltZy8+XCIpLmF0dHIoe3NyYzpvLGFsdDpuLHRpdGxlOm59KTpuKSksZVtyP1wiYmVmb3JlXCI6XCJhZnRlclwiXShpLnRyaWdnZXIpLGkudHJpZ2dlci5vbihcImNsaWNrXCIsZnVuY3Rpb24oKXtyZXR1cm4gdC5kYXRlcGlja2VyLl9kYXRlcGlja2VyU2hvd2luZyYmdC5kYXRlcGlja2VyLl9sYXN0SW5wdXQ9PT1lWzBdP3QuZGF0ZXBpY2tlci5faGlkZURhdGVwaWNrZXIoKTp0LmRhdGVwaWNrZXIuX2RhdGVwaWNrZXJTaG93aW5nJiZ0LmRhdGVwaWNrZXIuX2xhc3RJbnB1dCE9PWVbMF0/KHQuZGF0ZXBpY2tlci5faGlkZURhdGVwaWNrZXIoKSx0LmRhdGVwaWNrZXIuX3Nob3dEYXRlcGlja2VyKGVbMF0pKTp0LmRhdGVwaWNrZXIuX3Nob3dEYXRlcGlja2VyKGVbMF0pLCExfSkpfSxfYXV0b1NpemU6ZnVuY3Rpb24odCl7aWYodGhpcy5fZ2V0KHQsXCJhdXRvU2l6ZVwiKSYmIXQuaW5saW5lKXt2YXIgZSxpLHMsbixvPW5ldyBEYXRlKDIwMDksMTEsMjApLGE9dGhpcy5fZ2V0KHQsXCJkYXRlRm9ybWF0XCIpO2EubWF0Y2goL1tETV0vKSYmKGU9ZnVuY3Rpb24odCl7Zm9yKGk9MCxzPTAsbj0wO3QubGVuZ3RoPm47bisrKXRbbl0ubGVuZ3RoPmkmJihpPXRbbl0ubGVuZ3RoLHM9bik7cmV0dXJuIHN9LG8uc2V0TW9udGgoZSh0aGlzLl9nZXQodCxhLm1hdGNoKC9NTS8pP1wibW9udGhOYW1lc1wiOlwibW9udGhOYW1lc1Nob3J0XCIpKSksby5zZXREYXRlKGUodGhpcy5fZ2V0KHQsYS5tYXRjaCgvREQvKT9cImRheU5hbWVzXCI6XCJkYXlOYW1lc1Nob3J0XCIpKSsyMC1vLmdldERheSgpKSksdC5pbnB1dC5hdHRyKFwic2l6ZVwiLHRoaXMuX2Zvcm1hdERhdGUodCxvKS5sZW5ndGgpfX0sX2lubGluZURhdGVwaWNrZXI6ZnVuY3Rpb24oZSxpKXt2YXIgcz10KGUpO3MuaGFzQ2xhc3ModGhpcy5tYXJrZXJDbGFzc05hbWUpfHwocy5hZGRDbGFzcyh0aGlzLm1hcmtlckNsYXNzTmFtZSkuYXBwZW5kKGkuZHBEaXYpLHQuZGF0YShlLFwiZGF0ZXBpY2tlclwiLGkpLHRoaXMuX3NldERhdGUoaSx0aGlzLl9nZXREZWZhdWx0RGF0ZShpKSwhMCksdGhpcy5fdXBkYXRlRGF0ZXBpY2tlcihpKSx0aGlzLl91cGRhdGVBbHRlcm5hdGUoaSksaS5zZXR0aW5ncy5kaXNhYmxlZCYmdGhpcy5fZGlzYWJsZURhdGVwaWNrZXIoZSksaS5kcERpdi5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKSl9LF9kaWFsb2dEYXRlcGlja2VyOmZ1bmN0aW9uKGUsaSxzLG4sYSl7dmFyIHIsbCxoLGMsdSxkPXRoaXMuX2RpYWxvZ0luc3Q7cmV0dXJuIGR8fCh0aGlzLnV1aWQrPTEscj1cImRwXCIrdGhpcy51dWlkLHRoaXMuX2RpYWxvZ0lucHV0PXQoXCI8aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J1wiK3IrXCInIHN0eWxlPSdwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogLTEwMHB4OyB3aWR0aDogMHB4OycvPlwiKSx0aGlzLl9kaWFsb2dJbnB1dC5vbihcImtleWRvd25cIix0aGlzLl9kb0tleURvd24pLHQoXCJib2R5XCIpLmFwcGVuZCh0aGlzLl9kaWFsb2dJbnB1dCksZD10aGlzLl9kaWFsb2dJbnN0PXRoaXMuX25ld0luc3QodGhpcy5fZGlhbG9nSW5wdXQsITEpLGQuc2V0dGluZ3M9e30sdC5kYXRhKHRoaXMuX2RpYWxvZ0lucHV0WzBdLFwiZGF0ZXBpY2tlclwiLGQpKSxvKGQuc2V0dGluZ3Msbnx8e30pLGk9aSYmaS5jb25zdHJ1Y3Rvcj09PURhdGU/dGhpcy5fZm9ybWF0RGF0ZShkLGkpOmksdGhpcy5fZGlhbG9nSW5wdXQudmFsKGkpLHRoaXMuX3Bvcz1hP2EubGVuZ3RoP2E6W2EucGFnZVgsYS5wYWdlWV06bnVsbCx0aGlzLl9wb3N8fChsPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCxoPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsYz1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdHx8ZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0LHU9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcHx8ZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AsdGhpcy5fcG9zPVtsLzItMTAwK2MsaC8yLTE1MCt1XSksdGhpcy5fZGlhbG9nSW5wdXQuY3NzKFwibGVmdFwiLHRoaXMuX3Bvc1swXSsyMCtcInB4XCIpLmNzcyhcInRvcFwiLHRoaXMuX3Bvc1sxXStcInB4XCIpLGQuc2V0dGluZ3Mub25TZWxlY3Q9cyx0aGlzLl9pbkRpYWxvZz0hMCx0aGlzLmRwRGl2LmFkZENsYXNzKHRoaXMuX2RpYWxvZ0NsYXNzKSx0aGlzLl9zaG93RGF0ZXBpY2tlcih0aGlzLl9kaWFsb2dJbnB1dFswXSksdC5ibG9ja1VJJiZ0LmJsb2NrVUkodGhpcy5kcERpdiksdC5kYXRhKHRoaXMuX2RpYWxvZ0lucHV0WzBdLFwiZGF0ZXBpY2tlclwiLGQpLHRoaXN9LF9kZXN0cm95RGF0ZXBpY2tlcjpmdW5jdGlvbihlKXt2YXIgaSxzPXQoZSksbj10LmRhdGEoZSxcImRhdGVwaWNrZXJcIik7cy5oYXNDbGFzcyh0aGlzLm1hcmtlckNsYXNzTmFtZSkmJihpPWUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSx0LnJlbW92ZURhdGEoZSxcImRhdGVwaWNrZXJcIiksXCJpbnB1dFwiPT09aT8obi5hcHBlbmQucmVtb3ZlKCksbi50cmlnZ2VyLnJlbW92ZSgpLHMucmVtb3ZlQ2xhc3ModGhpcy5tYXJrZXJDbGFzc05hbWUpLm9mZihcImZvY3VzXCIsdGhpcy5fc2hvd0RhdGVwaWNrZXIpLm9mZihcImtleWRvd25cIix0aGlzLl9kb0tleURvd24pLm9mZihcImtleXByZXNzXCIsdGhpcy5fZG9LZXlQcmVzcykub2ZmKFwia2V5dXBcIix0aGlzLl9kb0tleVVwKSk6KFwiZGl2XCI9PT1pfHxcInNwYW5cIj09PWkpJiZzLnJlbW92ZUNsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKS5lbXB0eSgpLGw9PT1uJiYobD1udWxsKSl9LF9lbmFibGVEYXRlcGlja2VyOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbj10KGUpLG89dC5kYXRhKGUsXCJkYXRlcGlja2VyXCIpO24uaGFzQ2xhc3ModGhpcy5tYXJrZXJDbGFzc05hbWUpJiYoaT1lLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCksXCJpbnB1dFwiPT09aT8oZS5kaXNhYmxlZD0hMSxvLnRyaWdnZXIuZmlsdGVyKFwiYnV0dG9uXCIpLmVhY2goZnVuY3Rpb24oKXt0aGlzLmRpc2FibGVkPSExfSkuZW5kKCkuZmlsdGVyKFwiaW1nXCIpLmNzcyh7b3BhY2l0eTpcIjEuMFwiLGN1cnNvcjpcIlwifSkpOihcImRpdlwiPT09aXx8XCJzcGFuXCI9PT1pKSYmKHM9bi5jaGlsZHJlbihcIi5cIit0aGlzLl9pbmxpbmVDbGFzcykscy5jaGlsZHJlbigpLnJlbW92ZUNsYXNzKFwidWktc3RhdGUtZGlzYWJsZWRcIikscy5maW5kKFwic2VsZWN0LnVpLWRhdGVwaWNrZXItbW9udGgsIHNlbGVjdC51aS1kYXRlcGlja2VyLXllYXJcIikucHJvcChcImRpc2FibGVkXCIsITEpKSx0aGlzLl9kaXNhYmxlZElucHV0cz10Lm1hcCh0aGlzLl9kaXNhYmxlZElucHV0cyxmdW5jdGlvbih0KXtyZXR1cm4gdD09PWU/bnVsbDp0fSkpfSxfZGlzYWJsZURhdGVwaWNrZXI6ZnVuY3Rpb24oZSl7dmFyIGkscyxuPXQoZSksbz10LmRhdGEoZSxcImRhdGVwaWNrZXJcIik7bi5oYXNDbGFzcyh0aGlzLm1hcmtlckNsYXNzTmFtZSkmJihpPWUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcImlucHV0XCI9PT1pPyhlLmRpc2FibGVkPSEwLG8udHJpZ2dlci5maWx0ZXIoXCJidXR0b25cIikuZWFjaChmdW5jdGlvbigpe3RoaXMuZGlzYWJsZWQ9ITB9KS5lbmQoKS5maWx0ZXIoXCJpbWdcIikuY3NzKHtvcGFjaXR5OlwiMC41XCIsY3Vyc29yOlwiZGVmYXVsdFwifSkpOihcImRpdlwiPT09aXx8XCJzcGFuXCI9PT1pKSYmKHM9bi5jaGlsZHJlbihcIi5cIit0aGlzLl9pbmxpbmVDbGFzcykscy5jaGlsZHJlbigpLmFkZENsYXNzKFwidWktc3RhdGUtZGlzYWJsZWRcIikscy5maW5kKFwic2VsZWN0LnVpLWRhdGVwaWNrZXItbW9udGgsIHNlbGVjdC51aS1kYXRlcGlja2VyLXllYXJcIikucHJvcChcImRpc2FibGVkXCIsITApKSx0aGlzLl9kaXNhYmxlZElucHV0cz10Lm1hcCh0aGlzLl9kaXNhYmxlZElucHV0cyxmdW5jdGlvbih0KXtyZXR1cm4gdD09PWU/bnVsbDp0fSksdGhpcy5fZGlzYWJsZWRJbnB1dHNbdGhpcy5fZGlzYWJsZWRJbnB1dHMubGVuZ3RoXT1lKX0sX2lzRGlzYWJsZWREYXRlcGlja2VyOmZ1bmN0aW9uKHQpe2lmKCF0KXJldHVybiExO2Zvcih2YXIgZT0wO3RoaXMuX2Rpc2FibGVkSW5wdXRzLmxlbmd0aD5lO2UrKylpZih0aGlzLl9kaXNhYmxlZElucHV0c1tlXT09PXQpcmV0dXJuITA7cmV0dXJuITF9LF9nZXRJbnN0OmZ1bmN0aW9uKGUpe3RyeXtyZXR1cm4gdC5kYXRhKGUsXCJkYXRlcGlja2VyXCIpfWNhdGNoKGkpe3Rocm93XCJNaXNzaW5nIGluc3RhbmNlIGRhdGEgZm9yIHRoaXMgZGF0ZXBpY2tlclwifX0sX29wdGlvbkRhdGVwaWNrZXI6ZnVuY3Rpb24oZSxpLHMpe3ZhciBuLGEscixsLGg9dGhpcy5fZ2V0SW5zdChlKTtyZXR1cm4gMj09PWFyZ3VtZW50cy5sZW5ndGgmJlwic3RyaW5nXCI9PXR5cGVvZiBpP1wiZGVmYXVsdHNcIj09PWk/dC5leHRlbmQoe30sdC5kYXRlcGlja2VyLl9kZWZhdWx0cyk6aD9cImFsbFwiPT09aT90LmV4dGVuZCh7fSxoLnNldHRpbmdzKTp0aGlzLl9nZXQoaCxpKTpudWxsOihuPWl8fHt9LFwic3RyaW5nXCI9PXR5cGVvZiBpJiYobj17fSxuW2ldPXMpLGgmJih0aGlzLl9jdXJJbnN0PT09aCYmdGhpcy5faGlkZURhdGVwaWNrZXIoKSxhPXRoaXMuX2dldERhdGVEYXRlcGlja2VyKGUsITApLHI9dGhpcy5fZ2V0TWluTWF4RGF0ZShoLFwibWluXCIpLGw9dGhpcy5fZ2V0TWluTWF4RGF0ZShoLFwibWF4XCIpLG8oaC5zZXR0aW5ncyxuKSxudWxsIT09ciYmdm9pZCAwIT09bi5kYXRlRm9ybWF0JiZ2b2lkIDA9PT1uLm1pbkRhdGUmJihoLnNldHRpbmdzLm1pbkRhdGU9dGhpcy5fZm9ybWF0RGF0ZShoLHIpKSxudWxsIT09bCYmdm9pZCAwIT09bi5kYXRlRm9ybWF0JiZ2b2lkIDA9PT1uLm1heERhdGUmJihoLnNldHRpbmdzLm1heERhdGU9dGhpcy5fZm9ybWF0RGF0ZShoLGwpKSxcImRpc2FibGVkXCJpbiBuJiYobi5kaXNhYmxlZD90aGlzLl9kaXNhYmxlRGF0ZXBpY2tlcihlKTp0aGlzLl9lbmFibGVEYXRlcGlja2VyKGUpKSx0aGlzLl9hdHRhY2htZW50cyh0KGUpLGgpLHRoaXMuX2F1dG9TaXplKGgpLHRoaXMuX3NldERhdGUoaCxhKSx0aGlzLl91cGRhdGVBbHRlcm5hdGUoaCksdGhpcy5fdXBkYXRlRGF0ZXBpY2tlcihoKSksdm9pZCAwKX0sX2NoYW5nZURhdGVwaWNrZXI6ZnVuY3Rpb24odCxlLGkpe3RoaXMuX29wdGlvbkRhdGVwaWNrZXIodCxlLGkpfSxfcmVmcmVzaERhdGVwaWNrZXI6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fZ2V0SW5zdCh0KTtlJiZ0aGlzLl91cGRhdGVEYXRlcGlja2VyKGUpfSxfc2V0RGF0ZURhdGVwaWNrZXI6ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9nZXRJbnN0KHQpO2kmJih0aGlzLl9zZXREYXRlKGksZSksdGhpcy5fdXBkYXRlRGF0ZXBpY2tlcihpKSx0aGlzLl91cGRhdGVBbHRlcm5hdGUoaSkpfSxfZ2V0RGF0ZURhdGVwaWNrZXI6ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9nZXRJbnN0KHQpO3JldHVybiBpJiYhaS5pbmxpbmUmJnRoaXMuX3NldERhdGVGcm9tRmllbGQoaSxlKSxpP3RoaXMuX2dldERhdGUoaSk6bnVsbH0sX2RvS2V5RG93bjpmdW5jdGlvbihlKXt2YXIgaSxzLG4sbz10LmRhdGVwaWNrZXIuX2dldEluc3QoZS50YXJnZXQpLGE9ITAscj1vLmRwRGl2LmlzKFwiLnVpLWRhdGVwaWNrZXItcnRsXCIpO2lmKG8uX2tleUV2ZW50PSEwLHQuZGF0ZXBpY2tlci5fZGF0ZXBpY2tlclNob3dpbmcpc3dpdGNoKGUua2V5Q29kZSl7Y2FzZSA5OnQuZGF0ZXBpY2tlci5faGlkZURhdGVwaWNrZXIoKSxhPSExO2JyZWFrO2Nhc2UgMTM6cmV0dXJuIG49dChcInRkLlwiK3QuZGF0ZXBpY2tlci5fZGF5T3ZlckNsYXNzK1wiOm5vdCguXCIrdC5kYXRlcGlja2VyLl9jdXJyZW50Q2xhc3MrXCIpXCIsby5kcERpdiksblswXSYmdC5kYXRlcGlja2VyLl9zZWxlY3REYXkoZS50YXJnZXQsby5zZWxlY3RlZE1vbnRoLG8uc2VsZWN0ZWRZZWFyLG5bMF0pLGk9dC5kYXRlcGlja2VyLl9nZXQobyxcIm9uU2VsZWN0XCIpLGk/KHM9dC5kYXRlcGlja2VyLl9mb3JtYXREYXRlKG8pLGkuYXBwbHkoby5pbnB1dD9vLmlucHV0WzBdOm51bGwsW3Msb10pKTp0LmRhdGVwaWNrZXIuX2hpZGVEYXRlcGlja2VyKCksITE7Y2FzZSAyNzp0LmRhdGVwaWNrZXIuX2hpZGVEYXRlcGlja2VyKCk7YnJlYWs7Y2FzZSAzMzp0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUoZS50YXJnZXQsZS5jdHJsS2V5Py10LmRhdGVwaWNrZXIuX2dldChvLFwic3RlcEJpZ01vbnRoc1wiKTotdC5kYXRlcGlja2VyLl9nZXQobyxcInN0ZXBNb250aHNcIiksXCJNXCIpO2JyZWFrO2Nhc2UgMzQ6dC5kYXRlcGlja2VyLl9hZGp1c3REYXRlKGUudGFyZ2V0LGUuY3RybEtleT8rdC5kYXRlcGlja2VyLl9nZXQobyxcInN0ZXBCaWdNb250aHNcIik6K3QuZGF0ZXBpY2tlci5fZ2V0KG8sXCJzdGVwTW9udGhzXCIpLFwiTVwiKTticmVhaztjYXNlIDM1OihlLmN0cmxLZXl8fGUubWV0YUtleSkmJnQuZGF0ZXBpY2tlci5fY2xlYXJEYXRlKGUudGFyZ2V0KSxhPWUuY3RybEtleXx8ZS5tZXRhS2V5O2JyZWFrO2Nhc2UgMzY6KGUuY3RybEtleXx8ZS5tZXRhS2V5KSYmdC5kYXRlcGlja2VyLl9nb3RvVG9kYXkoZS50YXJnZXQpLGE9ZS5jdHJsS2V5fHxlLm1ldGFLZXk7YnJlYWs7Y2FzZSAzNzooZS5jdHJsS2V5fHxlLm1ldGFLZXkpJiZ0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUoZS50YXJnZXQscj8xOi0xLFwiRFwiKSxhPWUuY3RybEtleXx8ZS5tZXRhS2V5LGUub3JpZ2luYWxFdmVudC5hbHRLZXkmJnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCxlLmN0cmxLZXk/LXQuZGF0ZXBpY2tlci5fZ2V0KG8sXCJzdGVwQmlnTW9udGhzXCIpOi10LmRhdGVwaWNrZXIuX2dldChvLFwic3RlcE1vbnRoc1wiKSxcIk1cIik7YnJlYWs7Y2FzZSAzODooZS5jdHJsS2V5fHxlLm1ldGFLZXkpJiZ0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUoZS50YXJnZXQsLTcsXCJEXCIpLGE9ZS5jdHJsS2V5fHxlLm1ldGFLZXk7YnJlYWs7Y2FzZSAzOTooZS5jdHJsS2V5fHxlLm1ldGFLZXkpJiZ0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUoZS50YXJnZXQscj8tMToxLFwiRFwiKSxhPWUuY3RybEtleXx8ZS5tZXRhS2V5LGUub3JpZ2luYWxFdmVudC5hbHRLZXkmJnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCxlLmN0cmxLZXk/K3QuZGF0ZXBpY2tlci5fZ2V0KG8sXCJzdGVwQmlnTW9udGhzXCIpOit0LmRhdGVwaWNrZXIuX2dldChvLFwic3RlcE1vbnRoc1wiKSxcIk1cIik7YnJlYWs7Y2FzZSA0MDooZS5jdHJsS2V5fHxlLm1ldGFLZXkpJiZ0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUoZS50YXJnZXQsNyxcIkRcIiksYT1lLmN0cmxLZXl8fGUubWV0YUtleTticmVhaztkZWZhdWx0OmE9ITF9ZWxzZSAzNj09PWUua2V5Q29kZSYmZS5jdHJsS2V5P3QuZGF0ZXBpY2tlci5fc2hvd0RhdGVwaWNrZXIodGhpcyk6YT0hMTthJiYoZS5wcmV2ZW50RGVmYXVsdCgpLGUuc3RvcFByb3BhZ2F0aW9uKCkpfSxfZG9LZXlQcmVzczpmdW5jdGlvbihlKXt2YXIgaSxzLG49dC5kYXRlcGlja2VyLl9nZXRJbnN0KGUudGFyZ2V0KTtyZXR1cm4gdC5kYXRlcGlja2VyLl9nZXQobixcImNvbnN0cmFpbklucHV0XCIpPyhpPXQuZGF0ZXBpY2tlci5fcG9zc2libGVDaGFycyh0LmRhdGVwaWNrZXIuX2dldChuLFwiZGF0ZUZvcm1hdFwiKSkscz1TdHJpbmcuZnJvbUNoYXJDb2RlKG51bGw9PWUuY2hhckNvZGU/ZS5rZXlDb2RlOmUuY2hhckNvZGUpLGUuY3RybEtleXx8ZS5tZXRhS2V5fHxcIiBcIj5zfHwhaXx8aS5pbmRleE9mKHMpPi0xKTp2b2lkIDB9LF9kb0tleVVwOmZ1bmN0aW9uKGUpe3ZhciBpLHM9dC5kYXRlcGlja2VyLl9nZXRJbnN0KGUudGFyZ2V0KTtpZihzLmlucHV0LnZhbCgpIT09cy5sYXN0VmFsKXRyeXtpPXQuZGF0ZXBpY2tlci5wYXJzZURhdGUodC5kYXRlcGlja2VyLl9nZXQocyxcImRhdGVGb3JtYXRcIikscy5pbnB1dD9zLmlucHV0LnZhbCgpOm51bGwsdC5kYXRlcGlja2VyLl9nZXRGb3JtYXRDb25maWcocykpLGkmJih0LmRhdGVwaWNrZXIuX3NldERhdGVGcm9tRmllbGQocyksdC5kYXRlcGlja2VyLl91cGRhdGVBbHRlcm5hdGUocyksdC5kYXRlcGlja2VyLl91cGRhdGVEYXRlcGlja2VyKHMpKX1jYXRjaChuKXt9cmV0dXJuITB9LF9zaG93RGF0ZXBpY2tlcjpmdW5jdGlvbihpKXtpZihpPWkudGFyZ2V0fHxpLFwiaW5wdXRcIiE9PWkubm9kZU5hbWUudG9Mb3dlckNhc2UoKSYmKGk9dChcImlucHV0XCIsaS5wYXJlbnROb2RlKVswXSksIXQuZGF0ZXBpY2tlci5faXNEaXNhYmxlZERhdGVwaWNrZXIoaSkmJnQuZGF0ZXBpY2tlci5fbGFzdElucHV0IT09aSl7dmFyIHMsbixhLHIsbCxoLGM7cz10LmRhdGVwaWNrZXIuX2dldEluc3QoaSksdC5kYXRlcGlja2VyLl9jdXJJbnN0JiZ0LmRhdGVwaWNrZXIuX2N1ckluc3QhPT1zJiYodC5kYXRlcGlja2VyLl9jdXJJbnN0LmRwRGl2LnN0b3AoITAsITApLHMmJnQuZGF0ZXBpY2tlci5fZGF0ZXBpY2tlclNob3dpbmcmJnQuZGF0ZXBpY2tlci5faGlkZURhdGVwaWNrZXIodC5kYXRlcGlja2VyLl9jdXJJbnN0LmlucHV0WzBdKSksbj10LmRhdGVwaWNrZXIuX2dldChzLFwiYmVmb3JlU2hvd1wiKSxhPW4/bi5hcHBseShpLFtpLHNdKTp7fSxhIT09ITEmJihvKHMuc2V0dGluZ3MsYSkscy5sYXN0VmFsPW51bGwsdC5kYXRlcGlja2VyLl9sYXN0SW5wdXQ9aSx0LmRhdGVwaWNrZXIuX3NldERhdGVGcm9tRmllbGQocyksdC5kYXRlcGlja2VyLl9pbkRpYWxvZyYmKGkudmFsdWU9XCJcIiksdC5kYXRlcGlja2VyLl9wb3N8fCh0LmRhdGVwaWNrZXIuX3Bvcz10LmRhdGVwaWNrZXIuX2ZpbmRQb3MoaSksdC5kYXRlcGlja2VyLl9wb3NbMV0rPWkub2Zmc2V0SGVpZ2h0KSxyPSExLHQoaSkucGFyZW50cygpLmVhY2goZnVuY3Rpb24oKXtyZXR1cm4gcnw9XCJmaXhlZFwiPT09dCh0aGlzKS5jc3MoXCJwb3NpdGlvblwiKSwhcn0pLGw9e2xlZnQ6dC5kYXRlcGlja2VyLl9wb3NbMF0sdG9wOnQuZGF0ZXBpY2tlci5fcG9zWzFdfSx0LmRhdGVwaWNrZXIuX3Bvcz1udWxsLHMuZHBEaXYuZW1wdHkoKSxzLmRwRGl2LmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLGRpc3BsYXk6XCJibG9ja1wiLHRvcDpcIi0xMDAwcHhcIn0pLHQuZGF0ZXBpY2tlci5fdXBkYXRlRGF0ZXBpY2tlcihzKSxsPXQuZGF0ZXBpY2tlci5fY2hlY2tPZmZzZXQocyxsLHIpLHMuZHBEaXYuY3NzKHtwb3NpdGlvbjp0LmRhdGVwaWNrZXIuX2luRGlhbG9nJiZ0LmJsb2NrVUk/XCJzdGF0aWNcIjpyP1wiZml4ZWRcIjpcImFic29sdXRlXCIsZGlzcGxheTpcIm5vbmVcIixsZWZ0OmwubGVmdCtcInB4XCIsdG9wOmwudG9wK1wicHhcIn0pLHMuaW5saW5lfHwoaD10LmRhdGVwaWNrZXIuX2dldChzLFwic2hvd0FuaW1cIiksYz10LmRhdGVwaWNrZXIuX2dldChzLFwiZHVyYXRpb25cIikscy5kcERpdi5jc3MoXCJ6LWluZGV4XCIsZSh0KGkpKSsxKSx0LmRhdGVwaWNrZXIuX2RhdGVwaWNrZXJTaG93aW5nPSEwLHQuZWZmZWN0cyYmdC5lZmZlY3RzLmVmZmVjdFtoXT9zLmRwRGl2LnNob3coaCx0LmRhdGVwaWNrZXIuX2dldChzLFwic2hvd09wdGlvbnNcIiksYyk6cy5kcERpdltofHxcInNob3dcIl0oaD9jOm51bGwpLHQuZGF0ZXBpY2tlci5fc2hvdWxkRm9jdXNJbnB1dChzKSYmcy5pbnB1dC50cmlnZ2VyKFwiZm9jdXNcIiksdC5kYXRlcGlja2VyLl9jdXJJbnN0PXMpKX19LF91cGRhdGVEYXRlcGlja2VyOmZ1bmN0aW9uKGUpe3RoaXMubWF4Um93cz00LGw9ZSxlLmRwRGl2LmVtcHR5KCkuYXBwZW5kKHRoaXMuX2dlbmVyYXRlSFRNTChlKSksdGhpcy5fYXR0YWNoSGFuZGxlcnMoZSk7dmFyIGkscz10aGlzLl9nZXROdW1iZXJPZk1vbnRocyhlKSxvPXNbMV0sYT0xNyxyPWUuZHBEaXYuZmluZChcIi5cIit0aGlzLl9kYXlPdmVyQ2xhc3MrXCIgYVwiKTtyLmxlbmd0aD4wJiZuLmFwcGx5KHIuZ2V0KDApKSxlLmRwRGl2LnJlbW92ZUNsYXNzKFwidWktZGF0ZXBpY2tlci1tdWx0aS0yIHVpLWRhdGVwaWNrZXItbXVsdGktMyB1aS1kYXRlcGlja2VyLW11bHRpLTRcIikud2lkdGgoXCJcIiksbz4xJiZlLmRwRGl2LmFkZENsYXNzKFwidWktZGF0ZXBpY2tlci1tdWx0aS1cIitvKS5jc3MoXCJ3aWR0aFwiLGEqbytcImVtXCIpLGUuZHBEaXZbKDEhPT1zWzBdfHwxIT09c1sxXT9cImFkZFwiOlwicmVtb3ZlXCIpK1wiQ2xhc3NcIl0oXCJ1aS1kYXRlcGlja2VyLW11bHRpXCIpLGUuZHBEaXZbKHRoaXMuX2dldChlLFwiaXNSVExcIik/XCJhZGRcIjpcInJlbW92ZVwiKStcIkNsYXNzXCJdKFwidWktZGF0ZXBpY2tlci1ydGxcIiksZT09PXQuZGF0ZXBpY2tlci5fY3VySW5zdCYmdC5kYXRlcGlja2VyLl9kYXRlcGlja2VyU2hvd2luZyYmdC5kYXRlcGlja2VyLl9zaG91bGRGb2N1c0lucHV0KGUpJiZlLmlucHV0LnRyaWdnZXIoXCJmb2N1c1wiKSxlLnllYXJzaHRtbCYmKGk9ZS55ZWFyc2h0bWwsc2V0VGltZW91dChmdW5jdGlvbigpe2k9PT1lLnllYXJzaHRtbCYmZS55ZWFyc2h0bWwmJmUuZHBEaXYuZmluZChcInNlbGVjdC51aS1kYXRlcGlja2VyLXllYXI6Zmlyc3RcIikucmVwbGFjZVdpdGgoZS55ZWFyc2h0bWwpLGk9ZS55ZWFyc2h0bWw9bnVsbH0sMCkpfSxfc2hvdWxkRm9jdXNJbnB1dDpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnB1dCYmdC5pbnB1dC5pcyhcIjp2aXNpYmxlXCIpJiYhdC5pbnB1dC5pcyhcIjpkaXNhYmxlZFwiKSYmIXQuaW5wdXQuaXMoXCI6Zm9jdXNcIil9LF9jaGVja09mZnNldDpmdW5jdGlvbihlLGkscyl7dmFyIG49ZS5kcERpdi5vdXRlcldpZHRoKCksbz1lLmRwRGl2Lm91dGVySGVpZ2h0KCksYT1lLmlucHV0P2UuaW5wdXQub3V0ZXJXaWR0aCgpOjAscj1lLmlucHV0P2UuaW5wdXQub3V0ZXJIZWlnaHQoKTowLGw9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKyhzPzA6dChkb2N1bWVudCkuc2Nyb2xsTGVmdCgpKSxoPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQrKHM/MDp0KGRvY3VtZW50KS5zY3JvbGxUb3AoKSk7cmV0dXJuIGkubGVmdC09dGhpcy5fZ2V0KGUsXCJpc1JUTFwiKT9uLWE6MCxpLmxlZnQtPXMmJmkubGVmdD09PWUuaW5wdXQub2Zmc2V0KCkubGVmdD90KGRvY3VtZW50KS5zY3JvbGxMZWZ0KCk6MCxpLnRvcC09cyYmaS50b3A9PT1lLmlucHV0Lm9mZnNldCgpLnRvcCtyP3QoZG9jdW1lbnQpLnNjcm9sbFRvcCgpOjAsaS5sZWZ0LT1NYXRoLm1pbihpLmxlZnQsaS5sZWZ0K24+bCYmbD5uP01hdGguYWJzKGkubGVmdCtuLWwpOjApLGkudG9wLT1NYXRoLm1pbihpLnRvcCxpLnRvcCtvPmgmJmg+bz9NYXRoLmFicyhvK3IpOjApLGl9LF9maW5kUG9zOmZ1bmN0aW9uKGUpe2Zvcih2YXIgaSxzPXRoaXMuX2dldEluc3QoZSksbj10aGlzLl9nZXQocyxcImlzUlRMXCIpO2UmJihcImhpZGRlblwiPT09ZS50eXBlfHwxIT09ZS5ub2RlVHlwZXx8dC5leHByLmZpbHRlcnMuaGlkZGVuKGUpKTspZT1lW24/XCJwcmV2aW91c1NpYmxpbmdcIjpcIm5leHRTaWJsaW5nXCJdO3JldHVybiBpPXQoZSkub2Zmc2V0KCksW2kubGVmdCxpLnRvcF19LF9oaWRlRGF0ZXBpY2tlcjpmdW5jdGlvbihlKXt2YXIgaSxzLG4sbyxhPXRoaXMuX2N1ckluc3Q7IWF8fGUmJmEhPT10LmRhdGEoZSxcImRhdGVwaWNrZXJcIil8fHRoaXMuX2RhdGVwaWNrZXJTaG93aW5nJiYoaT10aGlzLl9nZXQoYSxcInNob3dBbmltXCIpLHM9dGhpcy5fZ2V0KGEsXCJkdXJhdGlvblwiKSxuPWZ1bmN0aW9uKCl7dC5kYXRlcGlja2VyLl90aWR5RGlhbG9nKGEpfSx0LmVmZmVjdHMmJih0LmVmZmVjdHMuZWZmZWN0W2ldfHx0LmVmZmVjdHNbaV0pP2EuZHBEaXYuaGlkZShpLHQuZGF0ZXBpY2tlci5fZ2V0KGEsXCJzaG93T3B0aW9uc1wiKSxzLG4pOmEuZHBEaXZbXCJzbGlkZURvd25cIj09PWk/XCJzbGlkZVVwXCI6XCJmYWRlSW5cIj09PWk/XCJmYWRlT3V0XCI6XCJoaWRlXCJdKGk/czpudWxsLG4pLGl8fG4oKSx0aGlzLl9kYXRlcGlja2VyU2hvd2luZz0hMSxvPXRoaXMuX2dldChhLFwib25DbG9zZVwiKSxvJiZvLmFwcGx5KGEuaW5wdXQ/YS5pbnB1dFswXTpudWxsLFthLmlucHV0P2EuaW5wdXQudmFsKCk6XCJcIixhXSksdGhpcy5fbGFzdElucHV0PW51bGwsdGhpcy5faW5EaWFsb2cmJih0aGlzLl9kaWFsb2dJbnB1dC5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIixsZWZ0OlwiMFwiLHRvcDpcIi0xMDBweFwifSksdC5ibG9ja1VJJiYodC51bmJsb2NrVUkoKSx0KFwiYm9keVwiKS5hcHBlbmQodGhpcy5kcERpdikpKSx0aGlzLl9pbkRpYWxvZz0hMSl9LF90aWR5RGlhbG9nOmZ1bmN0aW9uKHQpe3QuZHBEaXYucmVtb3ZlQ2xhc3ModGhpcy5fZGlhbG9nQ2xhc3MpLm9mZihcIi51aS1kYXRlcGlja2VyLWNhbGVuZGFyXCIpfSxfY2hlY2tFeHRlcm5hbENsaWNrOmZ1bmN0aW9uKGUpe2lmKHQuZGF0ZXBpY2tlci5fY3VySW5zdCl7dmFyIGk9dChlLnRhcmdldCkscz10LmRhdGVwaWNrZXIuX2dldEluc3QoaVswXSk7KGlbMF0uaWQhPT10LmRhdGVwaWNrZXIuX21haW5EaXZJZCYmMD09PWkucGFyZW50cyhcIiNcIit0LmRhdGVwaWNrZXIuX21haW5EaXZJZCkubGVuZ3RoJiYhaS5oYXNDbGFzcyh0LmRhdGVwaWNrZXIubWFya2VyQ2xhc3NOYW1lKSYmIWkuY2xvc2VzdChcIi5cIit0LmRhdGVwaWNrZXIuX3RyaWdnZXJDbGFzcykubGVuZ3RoJiZ0LmRhdGVwaWNrZXIuX2RhdGVwaWNrZXJTaG93aW5nJiYoIXQuZGF0ZXBpY2tlci5faW5EaWFsb2d8fCF0LmJsb2NrVUkpfHxpLmhhc0NsYXNzKHQuZGF0ZXBpY2tlci5tYXJrZXJDbGFzc05hbWUpJiZ0LmRhdGVwaWNrZXIuX2N1ckluc3QhPT1zKSYmdC5kYXRlcGlja2VyLl9oaWRlRGF0ZXBpY2tlcigpfX0sX2FkanVzdERhdGU6ZnVuY3Rpb24oZSxpLHMpe3ZhciBuPXQoZSksbz10aGlzLl9nZXRJbnN0KG5bMF0pO3RoaXMuX2lzRGlzYWJsZWREYXRlcGlja2VyKG5bMF0pfHwodGhpcy5fYWRqdXN0SW5zdERhdGUobyxpKyhcIk1cIj09PXM/dGhpcy5fZ2V0KG8sXCJzaG93Q3VycmVudEF0UG9zXCIpOjApLHMpLHRoaXMuX3VwZGF0ZURhdGVwaWNrZXIobykpfSxfZ290b1RvZGF5OmZ1bmN0aW9uKGUpe3ZhciBpLHM9dChlKSxuPXRoaXMuX2dldEluc3Qoc1swXSk7dGhpcy5fZ2V0KG4sXCJnb3RvQ3VycmVudFwiKSYmbi5jdXJyZW50RGF5PyhuLnNlbGVjdGVkRGF5PW4uY3VycmVudERheSxuLmRyYXdNb250aD1uLnNlbGVjdGVkTW9udGg9bi5jdXJyZW50TW9udGgsbi5kcmF3WWVhcj1uLnNlbGVjdGVkWWVhcj1uLmN1cnJlbnRZZWFyKTooaT1uZXcgRGF0ZSxuLnNlbGVjdGVkRGF5PWkuZ2V0RGF0ZSgpLG4uZHJhd01vbnRoPW4uc2VsZWN0ZWRNb250aD1pLmdldE1vbnRoKCksbi5kcmF3WWVhcj1uLnNlbGVjdGVkWWVhcj1pLmdldEZ1bGxZZWFyKCkpLHRoaXMuX25vdGlmeUNoYW5nZShuKSx0aGlzLl9hZGp1c3REYXRlKHMpfSxfc2VsZWN0TW9udGhZZWFyOmZ1bmN0aW9uKGUsaSxzKXt2YXIgbj10KGUpLG89dGhpcy5fZ2V0SW5zdChuWzBdKTtvW1wic2VsZWN0ZWRcIisoXCJNXCI9PT1zP1wiTW9udGhcIjpcIlllYXJcIildPW9bXCJkcmF3XCIrKFwiTVwiPT09cz9cIk1vbnRoXCI6XCJZZWFyXCIpXT1wYXJzZUludChpLm9wdGlvbnNbaS5zZWxlY3RlZEluZGV4XS52YWx1ZSwxMCksdGhpcy5fbm90aWZ5Q2hhbmdlKG8pLHRoaXMuX2FkanVzdERhdGUobil9LF9zZWxlY3REYXk6ZnVuY3Rpb24oZSxpLHMsbil7dmFyIG8sYT10KGUpO3QobikuaGFzQ2xhc3ModGhpcy5fdW5zZWxlY3RhYmxlQ2xhc3MpfHx0aGlzLl9pc0Rpc2FibGVkRGF0ZXBpY2tlcihhWzBdKXx8KG89dGhpcy5fZ2V0SW5zdChhWzBdKSxvLnNlbGVjdGVkRGF5PW8uY3VycmVudERheT10KFwiYVwiLG4pLmh0bWwoKSxvLnNlbGVjdGVkTW9udGg9by5jdXJyZW50TW9udGg9aSxvLnNlbGVjdGVkWWVhcj1vLmN1cnJlbnRZZWFyPXMsdGhpcy5fc2VsZWN0RGF0ZShlLHRoaXMuX2Zvcm1hdERhdGUobyxvLmN1cnJlbnREYXksby5jdXJyZW50TW9udGgsby5jdXJyZW50WWVhcikpKX0sX2NsZWFyRGF0ZTpmdW5jdGlvbihlKXt2YXIgaT10KGUpO3RoaXMuX3NlbGVjdERhdGUoaSxcIlwiKX0sX3NlbGVjdERhdGU6ZnVuY3Rpb24oZSxpKXt2YXIgcyxuPXQoZSksbz10aGlzLl9nZXRJbnN0KG5bMF0pO2k9bnVsbCE9aT9pOnRoaXMuX2Zvcm1hdERhdGUobyksby5pbnB1dCYmby5pbnB1dC52YWwoaSksdGhpcy5fdXBkYXRlQWx0ZXJuYXRlKG8pLHM9dGhpcy5fZ2V0KG8sXCJvblNlbGVjdFwiKSxzP3MuYXBwbHkoby5pbnB1dD9vLmlucHV0WzBdOm51bGwsW2ksb10pOm8uaW5wdXQmJm8uaW5wdXQudHJpZ2dlcihcImNoYW5nZVwiKSxvLmlubGluZT90aGlzLl91cGRhdGVEYXRlcGlja2VyKG8pOih0aGlzLl9oaWRlRGF0ZXBpY2tlcigpLHRoaXMuX2xhc3RJbnB1dD1vLmlucHV0WzBdLFwib2JqZWN0XCIhPXR5cGVvZiBvLmlucHV0WzBdJiZvLmlucHV0LnRyaWdnZXIoXCJmb2N1c1wiKSx0aGlzLl9sYXN0SW5wdXQ9bnVsbCl9LF91cGRhdGVBbHRlcm5hdGU6ZnVuY3Rpb24oZSl7dmFyIGkscyxuLG89dGhpcy5fZ2V0KGUsXCJhbHRGaWVsZFwiKTtvJiYoaT10aGlzLl9nZXQoZSxcImFsdEZvcm1hdFwiKXx8dGhpcy5fZ2V0KGUsXCJkYXRlRm9ybWF0XCIpLHM9dGhpcy5fZ2V0RGF0ZShlKSxuPXRoaXMuZm9ybWF0RGF0ZShpLHMsdGhpcy5fZ2V0Rm9ybWF0Q29uZmlnKGUpKSx0KG8pLnZhbChuKSl9LG5vV2Vla2VuZHM6ZnVuY3Rpb24odCl7dmFyIGU9dC5nZXREYXkoKTtyZXR1cm5bZT4wJiY2PmUsXCJcIl19LGlzbzg2MDFXZWVrOmZ1bmN0aW9uKHQpe3ZhciBlLGk9bmV3IERhdGUodC5nZXRUaW1lKCkpO3JldHVybiBpLnNldERhdGUoaS5nZXREYXRlKCkrNC0oaS5nZXREYXkoKXx8NykpLGU9aS5nZXRUaW1lKCksaS5zZXRNb250aCgwKSxpLnNldERhdGUoMSksTWF0aC5mbG9vcihNYXRoLnJvdW5kKChlLWkpLzg2NGU1KS83KSsxfSxwYXJzZURhdGU6ZnVuY3Rpb24oZSxpLHMpe2lmKG51bGw9PWV8fG51bGw9PWkpdGhyb3dcIkludmFsaWQgYXJndW1lbnRzXCI7aWYoaT1cIm9iamVjdFwiPT10eXBlb2YgaT9cIlwiK2k6aStcIlwiLFwiXCI9PT1pKXJldHVybiBudWxsO3ZhciBuLG8sYSxyLGw9MCxoPShzP3Muc2hvcnRZZWFyQ3V0b2ZmOm51bGwpfHx0aGlzLl9kZWZhdWx0cy5zaG9ydFllYXJDdXRvZmYsYz1cInN0cmluZ1wiIT10eXBlb2YgaD9oOihuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSUxMDArcGFyc2VJbnQoaCwxMCksdT0ocz9zLmRheU5hbWVzU2hvcnQ6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLmRheU5hbWVzU2hvcnQsZD0ocz9zLmRheU5hbWVzOm51bGwpfHx0aGlzLl9kZWZhdWx0cy5kYXlOYW1lcyxwPShzP3MubW9udGhOYW1lc1Nob3J0Om51bGwpfHx0aGlzLl9kZWZhdWx0cy5tb250aE5hbWVzU2hvcnQsZj0ocz9zLm1vbnRoTmFtZXM6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLm1vbnRoTmFtZXMsZz0tMSxtPS0xLF89LTEsdj0tMSxiPSExLHk9ZnVuY3Rpb24odCl7dmFyIGk9ZS5sZW5ndGg+bisxJiZlLmNoYXJBdChuKzEpPT09dDtyZXR1cm4gaSYmbisrLGl9LHc9ZnVuY3Rpb24odCl7dmFyIGU9eSh0KSxzPVwiQFwiPT09dD8xNDpcIiFcIj09PXQ/MjA6XCJ5XCI9PT10JiZlPzQ6XCJvXCI9PT10PzM6MixuPVwieVwiPT09dD9zOjEsbz1SZWdFeHAoXCJeXFxcXGR7XCIrbitcIixcIitzK1wifVwiKSxhPWkuc3Vic3RyaW5nKGwpLm1hdGNoKG8pO2lmKCFhKXRocm93XCJNaXNzaW5nIG51bWJlciBhdCBwb3NpdGlvbiBcIitsO3JldHVybiBsKz1hWzBdLmxlbmd0aCxwYXJzZUludChhWzBdLDEwKX0saz1mdW5jdGlvbihlLHMsbil7dmFyIG89LTEsYT10Lm1hcCh5KGUpP246cyxmdW5jdGlvbih0LGUpe3JldHVybltbZSx0XV19KS5zb3J0KGZ1bmN0aW9uKHQsZSl7cmV0dXJuLSh0WzFdLmxlbmd0aC1lWzFdLmxlbmd0aCl9KTtpZih0LmVhY2goYSxmdW5jdGlvbih0LGUpe3ZhciBzPWVbMV07cmV0dXJuIGkuc3Vic3RyKGwscy5sZW5ndGgpLnRvTG93ZXJDYXNlKCk9PT1zLnRvTG93ZXJDYXNlKCk/KG89ZVswXSxsKz1zLmxlbmd0aCwhMSk6dm9pZCAwfSksLTEhPT1vKXJldHVybiBvKzE7dGhyb3dcIlVua25vd24gbmFtZSBhdCBwb3NpdGlvbiBcIitsfSx4PWZ1bmN0aW9uKCl7aWYoaS5jaGFyQXQobCkhPT1lLmNoYXJBdChuKSl0aHJvd1wiVW5leHBlY3RlZCBsaXRlcmFsIGF0IHBvc2l0aW9uIFwiK2w7bCsrfTtmb3Iobj0wO2UubGVuZ3RoPm47bisrKWlmKGIpXCInXCIhPT1lLmNoYXJBdChuKXx8eShcIidcIik/eCgpOmI9ITE7ZWxzZSBzd2l0Y2goZS5jaGFyQXQobikpe2Nhc2VcImRcIjpfPXcoXCJkXCIpO2JyZWFrO2Nhc2VcIkRcIjprKFwiRFwiLHUsZCk7YnJlYWs7Y2FzZVwib1wiOnY9dyhcIm9cIik7YnJlYWs7Y2FzZVwibVwiOm09dyhcIm1cIik7YnJlYWs7Y2FzZVwiTVwiOm09ayhcIk1cIixwLGYpO2JyZWFrO2Nhc2VcInlcIjpnPXcoXCJ5XCIpO2JyZWFrO2Nhc2VcIkBcIjpyPW5ldyBEYXRlKHcoXCJAXCIpKSxnPXIuZ2V0RnVsbFllYXIoKSxtPXIuZ2V0TW9udGgoKSsxLF89ci5nZXREYXRlKCk7YnJlYWs7Y2FzZVwiIVwiOnI9bmV3IERhdGUoKHcoXCIhXCIpLXRoaXMuX3RpY2tzVG8xOTcwKS8xZTQpLGc9ci5nZXRGdWxsWWVhcigpLG09ci5nZXRNb250aCgpKzEsXz1yLmdldERhdGUoKTticmVhaztjYXNlXCInXCI6eShcIidcIik/eCgpOmI9ITA7YnJlYWs7ZGVmYXVsdDp4KCl9aWYoaS5sZW5ndGg+bCYmKGE9aS5zdWJzdHIobCksIS9eXFxzKy8udGVzdChhKSkpdGhyb3dcIkV4dHJhL3VucGFyc2VkIGNoYXJhY3RlcnMgZm91bmQgaW4gZGF0ZTogXCIrYTtpZigtMT09PWc/Zz0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCk6MTAwPmcmJihnKz0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCktKG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpJTEwMCsoYz49Zz8wOi0xMDApKSx2Pi0xKWZvcihtPTEsXz12Ozspe2lmKG89dGhpcy5fZ2V0RGF5c0luTW9udGgoZyxtLTEpLG8+PV8pYnJlYWs7bSsrLF8tPW99aWYocj10aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZShnLG0tMSxfKSksci5nZXRGdWxsWWVhcigpIT09Z3x8ci5nZXRNb250aCgpKzEhPT1tfHxyLmdldERhdGUoKSE9PV8pdGhyb3dcIkludmFsaWQgZGF0ZVwiO3JldHVybiByfSxBVE9NOlwieXktbW0tZGRcIixDT09LSUU6XCJELCBkZCBNIHl5XCIsSVNPXzg2MDE6XCJ5eS1tbS1kZFwiLFJGQ184MjI6XCJELCBkIE0geVwiLFJGQ184NTA6XCJERCwgZGQtTS15XCIsUkZDXzEwMzY6XCJELCBkIE0geVwiLFJGQ18xMTIzOlwiRCwgZCBNIHl5XCIsUkZDXzI4MjI6XCJELCBkIE0geXlcIixSU1M6XCJELCBkIE0geVwiLFRJQ0tTOlwiIVwiLFRJTUVTVEFNUDpcIkBcIixXM0M6XCJ5eS1tbS1kZFwiLF90aWNrc1RvMTk3MDoxZTcqNjAqNjAqMjQqKDcxODY4NStNYXRoLmZsb29yKDQ5Mi41KS1NYXRoLmZsb29yKDE5LjcpK01hdGguZmxvb3IoNC45MjUpKSxmb3JtYXREYXRlOmZ1bmN0aW9uKHQsZSxpKXtpZighZSlyZXR1cm5cIlwiO3ZhciBzLG49KGk/aS5kYXlOYW1lc1Nob3J0Om51bGwpfHx0aGlzLl9kZWZhdWx0cy5kYXlOYW1lc1Nob3J0LG89KGk/aS5kYXlOYW1lczpudWxsKXx8dGhpcy5fZGVmYXVsdHMuZGF5TmFtZXMsYT0oaT9pLm1vbnRoTmFtZXNTaG9ydDpudWxsKXx8dGhpcy5fZGVmYXVsdHMubW9udGhOYW1lc1Nob3J0LHI9KGk/aS5tb250aE5hbWVzOm51bGwpfHx0aGlzLl9kZWZhdWx0cy5tb250aE5hbWVzLGw9ZnVuY3Rpb24oZSl7dmFyIGk9dC5sZW5ndGg+cysxJiZ0LmNoYXJBdChzKzEpPT09ZTtyZXR1cm4gaSYmcysrLGl9LGg9ZnVuY3Rpb24odCxlLGkpe3ZhciBzPVwiXCIrZTtpZihsKHQpKWZvcig7aT5zLmxlbmd0aDspcz1cIjBcIitzO3JldHVybiBzfSxjPWZ1bmN0aW9uKHQsZSxpLHMpe3JldHVybiBsKHQpP3NbZV06aVtlXX0sdT1cIlwiLGQ9ITE7aWYoZSlmb3Iocz0wO3QubGVuZ3RoPnM7cysrKWlmKGQpXCInXCIhPT10LmNoYXJBdChzKXx8bChcIidcIik/dSs9dC5jaGFyQXQocyk6ZD0hMTtlbHNlIHN3aXRjaCh0LmNoYXJBdChzKSl7Y2FzZVwiZFwiOnUrPWgoXCJkXCIsZS5nZXREYXRlKCksMik7YnJlYWs7Y2FzZVwiRFwiOnUrPWMoXCJEXCIsZS5nZXREYXkoKSxuLG8pO2JyZWFrO2Nhc2VcIm9cIjp1Kz1oKFwib1wiLE1hdGgucm91bmQoKG5ldyBEYXRlKGUuZ2V0RnVsbFllYXIoKSxlLmdldE1vbnRoKCksZS5nZXREYXRlKCkpLmdldFRpbWUoKS1uZXcgRGF0ZShlLmdldEZ1bGxZZWFyKCksMCwwKS5nZXRUaW1lKCkpLzg2NGU1KSwzKTticmVhaztjYXNlXCJtXCI6dSs9aChcIm1cIixlLmdldE1vbnRoKCkrMSwyKTticmVhaztjYXNlXCJNXCI6dSs9YyhcIk1cIixlLmdldE1vbnRoKCksYSxyKTticmVhaztjYXNlXCJ5XCI6dSs9bChcInlcIik/ZS5nZXRGdWxsWWVhcigpOigxMD5lLmdldEZ1bGxZZWFyKCklMTAwP1wiMFwiOlwiXCIpK2UuZ2V0RnVsbFllYXIoKSUxMDA7YnJlYWs7Y2FzZVwiQFwiOnUrPWUuZ2V0VGltZSgpO2JyZWFrO2Nhc2VcIiFcIjp1Kz0xZTQqZS5nZXRUaW1lKCkrdGhpcy5fdGlja3NUbzE5NzA7YnJlYWs7Y2FzZVwiJ1wiOmwoXCInXCIpP3UrPVwiJ1wiOmQ9ITA7YnJlYWs7ZGVmYXVsdDp1Kz10LmNoYXJBdChzKX1yZXR1cm4gdX0sX3Bvc3NpYmxlQ2hhcnM6ZnVuY3Rpb24odCl7dmFyIGUsaT1cIlwiLHM9ITEsbj1mdW5jdGlvbihpKXt2YXIgcz10Lmxlbmd0aD5lKzEmJnQuY2hhckF0KGUrMSk9PT1pO3JldHVybiBzJiZlKyssc307Zm9yKGU9MDt0Lmxlbmd0aD5lO2UrKylpZihzKVwiJ1wiIT09dC5jaGFyQXQoZSl8fG4oXCInXCIpP2krPXQuY2hhckF0KGUpOnM9ITE7ZWxzZSBzd2l0Y2godC5jaGFyQXQoZSkpe2Nhc2VcImRcIjpjYXNlXCJtXCI6Y2FzZVwieVwiOmNhc2VcIkBcIjppKz1cIjAxMjM0NTY3ODlcIjticmVhaztjYXNlXCJEXCI6Y2FzZVwiTVwiOnJldHVybiBudWxsO2Nhc2VcIidcIjpuKFwiJ1wiKT9pKz1cIidcIjpzPSEwO2JyZWFrO2RlZmF1bHQ6aSs9dC5jaGFyQXQoZSl9cmV0dXJuIGl9LF9nZXQ6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdm9pZCAwIT09dC5zZXR0aW5nc1tlXT90LnNldHRpbmdzW2VdOnRoaXMuX2RlZmF1bHRzW2VdfSxfc2V0RGF0ZUZyb21GaWVsZDpmdW5jdGlvbih0LGUpe2lmKHQuaW5wdXQudmFsKCkhPT10Lmxhc3RWYWwpe3ZhciBpPXRoaXMuX2dldCh0LFwiZGF0ZUZvcm1hdFwiKSxzPXQubGFzdFZhbD10LmlucHV0P3QuaW5wdXQudmFsKCk6bnVsbCxuPXRoaXMuX2dldERlZmF1bHREYXRlKHQpLG89bixhPXRoaXMuX2dldEZvcm1hdENvbmZpZyh0KTt0cnl7bz10aGlzLnBhcnNlRGF0ZShpLHMsYSl8fG59Y2F0Y2gocil7cz1lP1wiXCI6c310LnNlbGVjdGVkRGF5PW8uZ2V0RGF0ZSgpLHQuZHJhd01vbnRoPXQuc2VsZWN0ZWRNb250aD1vLmdldE1vbnRoKCksdC5kcmF3WWVhcj10LnNlbGVjdGVkWWVhcj1vLmdldEZ1bGxZZWFyKCksdC5jdXJyZW50RGF5PXM/by5nZXREYXRlKCk6MCx0LmN1cnJlbnRNb250aD1zP28uZ2V0TW9udGgoKTowLHQuY3VycmVudFllYXI9cz9vLmdldEZ1bGxZZWFyKCk6MCx0aGlzLl9hZGp1c3RJbnN0RGF0ZSh0KX19LF9nZXREZWZhdWx0RGF0ZTpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fcmVzdHJpY3RNaW5NYXgodCx0aGlzLl9kZXRlcm1pbmVEYXRlKHQsdGhpcy5fZ2V0KHQsXCJkZWZhdWx0RGF0ZVwiKSxuZXcgRGF0ZSkpfSxfZGV0ZXJtaW5lRGF0ZTpmdW5jdGlvbihlLGkscyl7dmFyIG49ZnVuY3Rpb24odCl7dmFyIGU9bmV3IERhdGU7cmV0dXJuIGUuc2V0RGF0ZShlLmdldERhdGUoKSt0KSxlfSxvPWZ1bmN0aW9uKGkpe3RyeXtyZXR1cm4gdC5kYXRlcGlja2VyLnBhcnNlRGF0ZSh0LmRhdGVwaWNrZXIuX2dldChlLFwiZGF0ZUZvcm1hdFwiKSxpLHQuZGF0ZXBpY2tlci5fZ2V0Rm9ybWF0Q29uZmlnKGUpKX1jYXRjaChzKXt9Zm9yKHZhciBuPShpLnRvTG93ZXJDYXNlKCkubWF0Y2goL15jLyk/dC5kYXRlcGlja2VyLl9nZXREYXRlKGUpOm51bGwpfHxuZXcgRGF0ZSxvPW4uZ2V0RnVsbFllYXIoKSxhPW4uZ2V0TW9udGgoKSxyPW4uZ2V0RGF0ZSgpLGw9LyhbK1xcLV0/WzAtOV0rKVxccyooZHxEfHd8V3xtfE18eXxZKT8vZyxoPWwuZXhlYyhpKTtoOyl7c3dpdGNoKGhbMl18fFwiZFwiKXtjYXNlXCJkXCI6Y2FzZVwiRFwiOnIrPXBhcnNlSW50KGhbMV0sMTApO2JyZWFrO2Nhc2VcIndcIjpjYXNlXCJXXCI6cis9NypwYXJzZUludChoWzFdLDEwKTticmVhaztjYXNlXCJtXCI6Y2FzZVwiTVwiOmErPXBhcnNlSW50KGhbMV0sMTApLHI9TWF0aC5taW4ocix0LmRhdGVwaWNrZXIuX2dldERheXNJbk1vbnRoKG8sYSkpO2JyZWFrO2Nhc2VcInlcIjpjYXNlXCJZXCI6bys9cGFyc2VJbnQoaFsxXSwxMCkscj1NYXRoLm1pbihyLHQuZGF0ZXBpY2tlci5fZ2V0RGF5c0luTW9udGgobyxhKSl9aD1sLmV4ZWMoaSl9cmV0dXJuIG5ldyBEYXRlKG8sYSxyKX0sYT1udWxsPT1pfHxcIlwiPT09aT9zOlwic3RyaW5nXCI9PXR5cGVvZiBpP28oaSk6XCJudW1iZXJcIj09dHlwZW9mIGk/aXNOYU4oaSk/czpuKGkpOm5ldyBEYXRlKGkuZ2V0VGltZSgpKTtyZXR1cm4gYT1hJiZcIkludmFsaWQgRGF0ZVwiPT1cIlwiK2E/czphLGEmJihhLnNldEhvdXJzKDApLGEuc2V0TWludXRlcygwKSxhLnNldFNlY29uZHMoMCksYS5zZXRNaWxsaXNlY29uZHMoMCkpLHRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KGEpfSxfZGF5bGlnaHRTYXZpbmdBZGp1c3Q6ZnVuY3Rpb24odCl7cmV0dXJuIHQ/KHQuc2V0SG91cnModC5nZXRIb3VycygpPjEyP3QuZ2V0SG91cnMoKSsyOjApLHQpOm51bGx9LF9zZXREYXRlOmZ1bmN0aW9uKHQsZSxpKXt2YXIgcz0hZSxuPXQuc2VsZWN0ZWRNb250aCxvPXQuc2VsZWN0ZWRZZWFyLGE9dGhpcy5fcmVzdHJpY3RNaW5NYXgodCx0aGlzLl9kZXRlcm1pbmVEYXRlKHQsZSxuZXcgRGF0ZSkpO3Quc2VsZWN0ZWREYXk9dC5jdXJyZW50RGF5PWEuZ2V0RGF0ZSgpLHQuZHJhd01vbnRoPXQuc2VsZWN0ZWRNb250aD10LmN1cnJlbnRNb250aD1hLmdldE1vbnRoKCksdC5kcmF3WWVhcj10LnNlbGVjdGVkWWVhcj10LmN1cnJlbnRZZWFyPWEuZ2V0RnVsbFllYXIoKSxuPT09dC5zZWxlY3RlZE1vbnRoJiZvPT09dC5zZWxlY3RlZFllYXJ8fGl8fHRoaXMuX25vdGlmeUNoYW5nZSh0KSx0aGlzLl9hZGp1c3RJbnN0RGF0ZSh0KSx0LmlucHV0JiZ0LmlucHV0LnZhbChzP1wiXCI6dGhpcy5fZm9ybWF0RGF0ZSh0KSl9LF9nZXREYXRlOmZ1bmN0aW9uKHQpe3ZhciBlPSF0LmN1cnJlbnRZZWFyfHx0LmlucHV0JiZcIlwiPT09dC5pbnB1dC52YWwoKT9udWxsOnRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKHQuY3VycmVudFllYXIsdC5jdXJyZW50TW9udGgsdC5jdXJyZW50RGF5KSk7cmV0dXJuIGV9LF9hdHRhY2hIYW5kbGVyczpmdW5jdGlvbihlKXt2YXIgaT10aGlzLl9nZXQoZSxcInN0ZXBNb250aHNcIikscz1cIiNcIitlLmlkLnJlcGxhY2UoL1xcXFxcXFxcL2csXCJcXFxcXCIpO2UuZHBEaXYuZmluZChcIltkYXRhLWhhbmRsZXJdXCIpLm1hcChmdW5jdGlvbigpe3ZhciBlPXtwcmV2OmZ1bmN0aW9uKCl7dC5kYXRlcGlja2VyLl9hZGp1c3REYXRlKHMsLWksXCJNXCIpfSxuZXh0OmZ1bmN0aW9uKCl7dC5kYXRlcGlja2VyLl9hZGp1c3REYXRlKHMsK2ksXCJNXCIpfSxoaWRlOmZ1bmN0aW9uKCl7dC5kYXRlcGlja2VyLl9oaWRlRGF0ZXBpY2tlcigpfSx0b2RheTpmdW5jdGlvbigpe3QuZGF0ZXBpY2tlci5fZ290b1RvZGF5KHMpfSxzZWxlY3REYXk6ZnVuY3Rpb24oKXtyZXR1cm4gdC5kYXRlcGlja2VyLl9zZWxlY3REYXkocywrdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLW1vbnRoXCIpLCt0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEteWVhclwiKSx0aGlzKSwhMX0sc2VsZWN0TW9udGg6ZnVuY3Rpb24oKXtyZXR1cm4gdC5kYXRlcGlja2VyLl9zZWxlY3RNb250aFllYXIocyx0aGlzLFwiTVwiKSwhMX0sc2VsZWN0WWVhcjpmdW5jdGlvbigpe3JldHVybiB0LmRhdGVwaWNrZXIuX3NlbGVjdE1vbnRoWWVhcihzLHRoaXMsXCJZXCIpLCExfX07dCh0aGlzKS5vbih0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtZXZlbnRcIiksZVt0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtaGFuZGxlclwiKV0pfSl9LF9nZW5lcmF0ZUhUTUw6ZnVuY3Rpb24odCl7dmFyIGUsaSxzLG4sbyxhLHIsbCxoLGMsdSxkLHAsZixnLG0sXyx2LGIseSx3LGsseCxDLEQsVCxJLE0sUCxTLE4sSCxBLHosTyxFLFcsRixMLFI9bmV3IERhdGUsWT10aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZShSLmdldEZ1bGxZZWFyKCksUi5nZXRNb250aCgpLFIuZ2V0RGF0ZSgpKSksQj10aGlzLl9nZXQodCxcImlzUlRMXCIpLGo9dGhpcy5fZ2V0KHQsXCJzaG93QnV0dG9uUGFuZWxcIikscT10aGlzLl9nZXQodCxcImhpZGVJZk5vUHJldk5leHRcIiksSz10aGlzLl9nZXQodCxcIm5hdmlnYXRpb25Bc0RhdGVGb3JtYXRcIiksVT10aGlzLl9nZXROdW1iZXJPZk1vbnRocyh0KSxWPXRoaXMuX2dldCh0LFwic2hvd0N1cnJlbnRBdFBvc1wiKSxYPXRoaXMuX2dldCh0LFwic3RlcE1vbnRoc1wiKSwkPTEhPT1VWzBdfHwxIT09VVsxXSxHPXRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KHQuY3VycmVudERheT9uZXcgRGF0ZSh0LmN1cnJlbnRZZWFyLHQuY3VycmVudE1vbnRoLHQuY3VycmVudERheSk6bmV3IERhdGUoOTk5OSw5LDkpKSxKPXRoaXMuX2dldE1pbk1heERhdGUodCxcIm1pblwiKSxRPXRoaXMuX2dldE1pbk1heERhdGUodCxcIm1heFwiKSxaPXQuZHJhd01vbnRoLVYsdGU9dC5kcmF3WWVhcjtpZigwPlomJihaKz0xMix0ZS0tKSxRKWZvcihlPXRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKFEuZ2V0RnVsbFllYXIoKSxRLmdldE1vbnRoKCktVVswXSpVWzFdKzEsUS5nZXREYXRlKCkpKSxlPUomJko+ZT9KOmU7dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodGUsWiwxKSk+ZTspWi0tLDA+WiYmKFo9MTEsdGUtLSk7Zm9yKHQuZHJhd01vbnRoPVosdC5kcmF3WWVhcj10ZSxpPXRoaXMuX2dldCh0LFwicHJldlRleHRcIiksaT1LP3RoaXMuZm9ybWF0RGF0ZShpLHRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKHRlLFotWCwxKSksdGhpcy5fZ2V0Rm9ybWF0Q29uZmlnKHQpKTppLHM9dGhpcy5fY2FuQWRqdXN0TW9udGgodCwtMSx0ZSxaKT9cIjxhIGNsYXNzPSd1aS1kYXRlcGlja2VyLXByZXYgdWktY29ybmVyLWFsbCcgZGF0YS1oYW5kbGVyPSdwcmV2JyBkYXRhLWV2ZW50PSdjbGljaycgdGl0bGU9J1wiK2krXCInPjxzcGFuIGNsYXNzPSd1aS1pY29uIHVpLWljb24tY2lyY2xlLXRyaWFuZ2xlLVwiKyhCP1wiZVwiOlwid1wiKStcIic+XCIraStcIjwvc3Bhbj48L2E+XCI6cT9cIlwiOlwiPGEgY2xhc3M9J3VpLWRhdGVwaWNrZXItcHJldiB1aS1jb3JuZXItYWxsIHVpLXN0YXRlLWRpc2FibGVkJyB0aXRsZT0nXCIraStcIic+PHNwYW4gY2xhc3M9J3VpLWljb24gdWktaWNvbi1jaXJjbGUtdHJpYW5nbGUtXCIrKEI/XCJlXCI6XCJ3XCIpK1wiJz5cIitpK1wiPC9zcGFuPjwvYT5cIixuPXRoaXMuX2dldCh0LFwibmV4dFRleHRcIiksbj1LP3RoaXMuZm9ybWF0RGF0ZShuLHRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKHRlLForWCwxKSksdGhpcy5fZ2V0Rm9ybWF0Q29uZmlnKHQpKTpuLG89dGhpcy5fY2FuQWRqdXN0TW9udGgodCwxLHRlLFopP1wiPGEgY2xhc3M9J3VpLWRhdGVwaWNrZXItbmV4dCB1aS1jb3JuZXItYWxsJyBkYXRhLWhhbmRsZXI9J25leHQnIGRhdGEtZXZlbnQ9J2NsaWNrJyB0aXRsZT0nXCIrbitcIic+PHNwYW4gY2xhc3M9J3VpLWljb24gdWktaWNvbi1jaXJjbGUtdHJpYW5nbGUtXCIrKEI/XCJ3XCI6XCJlXCIpK1wiJz5cIituK1wiPC9zcGFuPjwvYT5cIjpxP1wiXCI6XCI8YSBjbGFzcz0ndWktZGF0ZXBpY2tlci1uZXh0IHVpLWNvcm5lci1hbGwgdWktc3RhdGUtZGlzYWJsZWQnIHRpdGxlPSdcIituK1wiJz48c3BhbiBjbGFzcz0ndWktaWNvbiB1aS1pY29uLWNpcmNsZS10cmlhbmdsZS1cIisoQj9cIndcIjpcImVcIikrXCInPlwiK24rXCI8L3NwYW4+PC9hPlwiLGE9dGhpcy5fZ2V0KHQsXCJjdXJyZW50VGV4dFwiKSxyPXRoaXMuX2dldCh0LFwiZ290b0N1cnJlbnRcIikmJnQuY3VycmVudERheT9HOlksYT1LP3RoaXMuZm9ybWF0RGF0ZShhLHIsdGhpcy5fZ2V0Rm9ybWF0Q29uZmlnKHQpKTphLGw9dC5pbmxpbmU/XCJcIjpcIjxidXR0b24gdHlwZT0nYnV0dG9uJyBjbGFzcz0ndWktZGF0ZXBpY2tlci1jbG9zZSB1aS1zdGF0ZS1kZWZhdWx0IHVpLXByaW9yaXR5LXByaW1hcnkgdWktY29ybmVyLWFsbCcgZGF0YS1oYW5kbGVyPSdoaWRlJyBkYXRhLWV2ZW50PSdjbGljayc+XCIrdGhpcy5fZ2V0KHQsXCJjbG9zZVRleHRcIikrXCI8L2J1dHRvbj5cIixoPWo/XCI8ZGl2IGNsYXNzPSd1aS1kYXRlcGlja2VyLWJ1dHRvbnBhbmUgdWktd2lkZ2V0LWNvbnRlbnQnPlwiKyhCP2w6XCJcIikrKHRoaXMuX2lzSW5SYW5nZSh0LHIpP1wiPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzPSd1aS1kYXRlcGlja2VyLWN1cnJlbnQgdWktc3RhdGUtZGVmYXVsdCB1aS1wcmlvcml0eS1zZWNvbmRhcnkgdWktY29ybmVyLWFsbCcgZGF0YS1oYW5kbGVyPSd0b2RheScgZGF0YS1ldmVudD0nY2xpY2snPlwiK2ErXCI8L2J1dHRvbj5cIjpcIlwiKSsoQj9cIlwiOmwpK1wiPC9kaXY+XCI6XCJcIixjPXBhcnNlSW50KHRoaXMuX2dldCh0LFwiZmlyc3REYXlcIiksMTApLGM9aXNOYU4oYyk/MDpjLHU9dGhpcy5fZ2V0KHQsXCJzaG93V2Vla1wiKSxkPXRoaXMuX2dldCh0LFwiZGF5TmFtZXNcIikscD10aGlzLl9nZXQodCxcImRheU5hbWVzTWluXCIpLGY9dGhpcy5fZ2V0KHQsXCJtb250aE5hbWVzXCIpLGc9dGhpcy5fZ2V0KHQsXCJtb250aE5hbWVzU2hvcnRcIiksbT10aGlzLl9nZXQodCxcImJlZm9yZVNob3dEYXlcIiksXz10aGlzLl9nZXQodCxcInNob3dPdGhlck1vbnRoc1wiKSx2PXRoaXMuX2dldCh0LFwic2VsZWN0T3RoZXJNb250aHNcIiksYj10aGlzLl9nZXREZWZhdWx0RGF0ZSh0KSx5PVwiXCIsaz0wO1VbMF0+aztrKyspe2Zvcih4PVwiXCIsdGhpcy5tYXhSb3dzPTQsQz0wO1VbMV0+QztDKyspe2lmKEQ9dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUodGUsWix0LnNlbGVjdGVkRGF5KSksVD1cIiB1aS1jb3JuZXItYWxsXCIsST1cIlwiLCQpe2lmKEkrPVwiPGRpdiBjbGFzcz0ndWktZGF0ZXBpY2tlci1ncm91cFwiLFVbMV0+MSlzd2l0Y2goQyl7Y2FzZSAwOkkrPVwiIHVpLWRhdGVwaWNrZXItZ3JvdXAtZmlyc3RcIixUPVwiIHVpLWNvcm5lci1cIisoQj9cInJpZ2h0XCI6XCJsZWZ0XCIpO2JyZWFrO2Nhc2UgVVsxXS0xOkkrPVwiIHVpLWRhdGVwaWNrZXItZ3JvdXAtbGFzdFwiLFQ9XCIgdWktY29ybmVyLVwiKyhCP1wibGVmdFwiOlwicmlnaHRcIik7YnJlYWs7ZGVmYXVsdDpJKz1cIiB1aS1kYXRlcGlja2VyLWdyb3VwLW1pZGRsZVwiLFQ9XCJcIn1JKz1cIic+XCJ9Zm9yKEkrPVwiPGRpdiBjbGFzcz0ndWktZGF0ZXBpY2tlci1oZWFkZXIgdWktd2lkZ2V0LWhlYWRlciB1aS1oZWxwZXItY2xlYXJmaXhcIitUK1wiJz5cIisoL2FsbHxsZWZ0Ly50ZXN0KFQpJiYwPT09az9CP286czpcIlwiKSsoL2FsbHxyaWdodC8udGVzdChUKSYmMD09PWs/Qj9zOm86XCJcIikrdGhpcy5fZ2VuZXJhdGVNb250aFllYXJIZWFkZXIodCxaLHRlLEosUSxrPjB8fEM+MCxmLGcpK1wiPC9kaXY+PHRhYmxlIGNsYXNzPSd1aS1kYXRlcGlja2VyLWNhbGVuZGFyJz48dGhlYWQ+XCIrXCI8dHI+XCIsTT11P1wiPHRoIGNsYXNzPSd1aS1kYXRlcGlja2VyLXdlZWstY29sJz5cIit0aGlzLl9nZXQodCxcIndlZWtIZWFkZXJcIikrXCI8L3RoPlwiOlwiXCIsdz0wOzc+dzt3KyspUD0odytjKSU3LE0rPVwiPHRoIHNjb3BlPSdjb2wnXCIrKCh3K2MrNiklNz49NT9cIiBjbGFzcz0ndWktZGF0ZXBpY2tlci13ZWVrLWVuZCdcIjpcIlwiKStcIj5cIitcIjxzcGFuIHRpdGxlPSdcIitkW1BdK1wiJz5cIitwW1BdK1wiPC9zcGFuPjwvdGg+XCI7Zm9yKEkrPU0rXCI8L3RyPjwvdGhlYWQ+PHRib2R5PlwiLFM9dGhpcy5fZ2V0RGF5c0luTW9udGgodGUsWiksdGU9PT10LnNlbGVjdGVkWWVhciYmWj09PXQuc2VsZWN0ZWRNb250aCYmKHQuc2VsZWN0ZWREYXk9TWF0aC5taW4odC5zZWxlY3RlZERheSxTKSksTj0odGhpcy5fZ2V0Rmlyc3REYXlPZk1vbnRoKHRlLFopLWMrNyklNyxIPU1hdGguY2VpbCgoTitTKS83KSxBPSQ/dGhpcy5tYXhSb3dzPkg/dGhpcy5tYXhSb3dzOkg6SCx0aGlzLm1heFJvd3M9QSx6PXRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKHRlLFosMS1OKSksTz0wO0E+TztPKyspe2ZvcihJKz1cIjx0cj5cIixFPXU/XCI8dGQgY2xhc3M9J3VpLWRhdGVwaWNrZXItd2Vlay1jb2wnPlwiK3RoaXMuX2dldCh0LFwiY2FsY3VsYXRlV2Vla1wiKSh6KStcIjwvdGQ+XCI6XCJcIix3PTA7Nz53O3crKylXPW0/bS5hcHBseSh0LmlucHV0P3QuaW5wdXRbMF06bnVsbCxbel0pOlshMCxcIlwiXSxGPXouZ2V0TW9udGgoKSE9PVosTD1GJiYhdnx8IVdbMF18fEomJko+enx8USYmej5RLEUrPVwiPHRkIGNsYXNzPSdcIisoKHcrYys2KSU3Pj01P1wiIHVpLWRhdGVwaWNrZXItd2Vlay1lbmRcIjpcIlwiKSsoRj9cIiB1aS1kYXRlcGlja2VyLW90aGVyLW1vbnRoXCI6XCJcIikrKHouZ2V0VGltZSgpPT09RC5nZXRUaW1lKCkmJlo9PT10LnNlbGVjdGVkTW9udGgmJnQuX2tleUV2ZW50fHxiLmdldFRpbWUoKT09PXouZ2V0VGltZSgpJiZiLmdldFRpbWUoKT09PUQuZ2V0VGltZSgpP1wiIFwiK3RoaXMuX2RheU92ZXJDbGFzczpcIlwiKSsoTD9cIiBcIit0aGlzLl91bnNlbGVjdGFibGVDbGFzcytcIiB1aS1zdGF0ZS1kaXNhYmxlZFwiOlwiXCIpKyhGJiYhXz9cIlwiOlwiIFwiK1dbMV0rKHouZ2V0VGltZSgpPT09Ry5nZXRUaW1lKCk/XCIgXCIrdGhpcy5fY3VycmVudENsYXNzOlwiXCIpKyh6LmdldFRpbWUoKT09PVkuZ2V0VGltZSgpP1wiIHVpLWRhdGVwaWNrZXItdG9kYXlcIjpcIlwiKSkrXCInXCIrKEYmJiFffHwhV1syXT9cIlwiOlwiIHRpdGxlPSdcIitXWzJdLnJlcGxhY2UoLycvZyxcIiYjMzk7XCIpK1wiJ1wiKSsoTD9cIlwiOlwiIGRhdGEtaGFuZGxlcj0nc2VsZWN0RGF5JyBkYXRhLWV2ZW50PSdjbGljaycgZGF0YS1tb250aD0nXCIrei5nZXRNb250aCgpK1wiJyBkYXRhLXllYXI9J1wiK3ouZ2V0RnVsbFllYXIoKStcIidcIikrXCI+XCIrKEYmJiFfP1wiJiN4YTA7XCI6TD9cIjxzcGFuIGNsYXNzPSd1aS1zdGF0ZS1kZWZhdWx0Jz5cIit6LmdldERhdGUoKStcIjwvc3Bhbj5cIjpcIjxhIGNsYXNzPSd1aS1zdGF0ZS1kZWZhdWx0XCIrKHouZ2V0VGltZSgpPT09WS5nZXRUaW1lKCk/XCIgdWktc3RhdGUtaGlnaGxpZ2h0XCI6XCJcIikrKHouZ2V0VGltZSgpPT09Ry5nZXRUaW1lKCk/XCIgdWktc3RhdGUtYWN0aXZlXCI6XCJcIikrKEY/XCIgdWktcHJpb3JpdHktc2Vjb25kYXJ5XCI6XCJcIikrXCInIGhyZWY9JyMnPlwiK3ouZ2V0RGF0ZSgpK1wiPC9hPlwiKStcIjwvdGQ+XCIsei5zZXREYXRlKHouZ2V0RGF0ZSgpKzEpLHo9dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3Qoeik7XG5JKz1FK1wiPC90cj5cIn1aKyssWj4xMSYmKFo9MCx0ZSsrKSxJKz1cIjwvdGJvZHk+PC90YWJsZT5cIisoJD9cIjwvZGl2PlwiKyhVWzBdPjAmJkM9PT1VWzFdLTE/XCI8ZGl2IGNsYXNzPSd1aS1kYXRlcGlja2VyLXJvdy1icmVhayc+PC9kaXY+XCI6XCJcIik6XCJcIikseCs9SX15Kz14fXJldHVybiB5Kz1oLHQuX2tleUV2ZW50PSExLHl9LF9nZW5lcmF0ZU1vbnRoWWVhckhlYWRlcjpmdW5jdGlvbih0LGUsaSxzLG4sbyxhLHIpe3ZhciBsLGgsYyx1LGQscCxmLGcsbT10aGlzLl9nZXQodCxcImNoYW5nZU1vbnRoXCIpLF89dGhpcy5fZ2V0KHQsXCJjaGFuZ2VZZWFyXCIpLHY9dGhpcy5fZ2V0KHQsXCJzaG93TW9udGhBZnRlclllYXJcIiksYj1cIjxkaXYgY2xhc3M9J3VpLWRhdGVwaWNrZXItdGl0bGUnPlwiLHk9XCJcIjtpZihvfHwhbSl5Kz1cIjxzcGFuIGNsYXNzPSd1aS1kYXRlcGlja2VyLW1vbnRoJz5cIithW2VdK1wiPC9zcGFuPlwiO2Vsc2V7Zm9yKGw9cyYmcy5nZXRGdWxsWWVhcigpPT09aSxoPW4mJm4uZ2V0RnVsbFllYXIoKT09PWkseSs9XCI8c2VsZWN0IGNsYXNzPSd1aS1kYXRlcGlja2VyLW1vbnRoJyBkYXRhLWhhbmRsZXI9J3NlbGVjdE1vbnRoJyBkYXRhLWV2ZW50PSdjaGFuZ2UnPlwiLGM9MDsxMj5jO2MrKykoIWx8fGM+PXMuZ2V0TW9udGgoKSkmJighaHx8bi5nZXRNb250aCgpPj1jKSYmKHkrPVwiPG9wdGlvbiB2YWx1ZT0nXCIrYytcIidcIisoYz09PWU/XCIgc2VsZWN0ZWQ9J3NlbGVjdGVkJ1wiOlwiXCIpK1wiPlwiK3JbY10rXCI8L29wdGlvbj5cIik7eSs9XCI8L3NlbGVjdD5cIn1pZih2fHwoYis9eSsoIW8mJm0mJl8/XCJcIjpcIiYjeGEwO1wiKSksIXQueWVhcnNodG1sKWlmKHQueWVhcnNodG1sPVwiXCIsb3x8IV8pYis9XCI8c3BhbiBjbGFzcz0ndWktZGF0ZXBpY2tlci15ZWFyJz5cIitpK1wiPC9zcGFuPlwiO2Vsc2V7Zm9yKHU9dGhpcy5fZ2V0KHQsXCJ5ZWFyUmFuZ2VcIikuc3BsaXQoXCI6XCIpLGQ9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLHA9ZnVuY3Rpb24odCl7dmFyIGU9dC5tYXRjaCgvY1srXFwtXS4qLyk/aStwYXJzZUludCh0LnN1YnN0cmluZygxKSwxMCk6dC5tYXRjaCgvWytcXC1dLiovKT9kK3BhcnNlSW50KHQsMTApOnBhcnNlSW50KHQsMTApO3JldHVybiBpc05hTihlKT9kOmV9LGY9cCh1WzBdKSxnPU1hdGgubWF4KGYscCh1WzFdfHxcIlwiKSksZj1zP01hdGgubWF4KGYscy5nZXRGdWxsWWVhcigpKTpmLGc9bj9NYXRoLm1pbihnLG4uZ2V0RnVsbFllYXIoKSk6Zyx0LnllYXJzaHRtbCs9XCI8c2VsZWN0IGNsYXNzPSd1aS1kYXRlcGlja2VyLXllYXInIGRhdGEtaGFuZGxlcj0nc2VsZWN0WWVhcicgZGF0YS1ldmVudD0nY2hhbmdlJz5cIjtnPj1mO2YrKyl0LnllYXJzaHRtbCs9XCI8b3B0aW9uIHZhbHVlPSdcIitmK1wiJ1wiKyhmPT09aT9cIiBzZWxlY3RlZD0nc2VsZWN0ZWQnXCI6XCJcIikrXCI+XCIrZitcIjwvb3B0aW9uPlwiO3QueWVhcnNodG1sKz1cIjwvc2VsZWN0PlwiLGIrPXQueWVhcnNodG1sLHQueWVhcnNodG1sPW51bGx9cmV0dXJuIGIrPXRoaXMuX2dldCh0LFwieWVhclN1ZmZpeFwiKSx2JiYoYis9KCFvJiZtJiZfP1wiXCI6XCImI3hhMDtcIikreSksYis9XCI8L2Rpdj5cIn0sX2FkanVzdEluc3REYXRlOmZ1bmN0aW9uKHQsZSxpKXt2YXIgcz10LnNlbGVjdGVkWWVhcisoXCJZXCI9PT1pP2U6MCksbj10LnNlbGVjdGVkTW9udGgrKFwiTVwiPT09aT9lOjApLG89TWF0aC5taW4odC5zZWxlY3RlZERheSx0aGlzLl9nZXREYXlzSW5Nb250aChzLG4pKSsoXCJEXCI9PT1pP2U6MCksYT10aGlzLl9yZXN0cmljdE1pbk1heCh0LHRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKHMsbixvKSkpO3Quc2VsZWN0ZWREYXk9YS5nZXREYXRlKCksdC5kcmF3TW9udGg9dC5zZWxlY3RlZE1vbnRoPWEuZ2V0TW9udGgoKSx0LmRyYXdZZWFyPXQuc2VsZWN0ZWRZZWFyPWEuZ2V0RnVsbFllYXIoKSwoXCJNXCI9PT1pfHxcIllcIj09PWkpJiZ0aGlzLl9ub3RpZnlDaGFuZ2UodCl9LF9yZXN0cmljdE1pbk1heDpmdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2dldE1pbk1heERhdGUodCxcIm1pblwiKSxzPXRoaXMuX2dldE1pbk1heERhdGUodCxcIm1heFwiKSxuPWkmJmk+ZT9pOmU7cmV0dXJuIHMmJm4+cz9zOm59LF9ub3RpZnlDaGFuZ2U6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fZ2V0KHQsXCJvbkNoYW5nZU1vbnRoWWVhclwiKTtlJiZlLmFwcGx5KHQuaW5wdXQ/dC5pbnB1dFswXTpudWxsLFt0LnNlbGVjdGVkWWVhcix0LnNlbGVjdGVkTW9udGgrMSx0XSl9LF9nZXROdW1iZXJPZk1vbnRoczpmdW5jdGlvbih0KXt2YXIgZT10aGlzLl9nZXQodCxcIm51bWJlck9mTW9udGhzXCIpO3JldHVybiBudWxsPT1lP1sxLDFdOlwibnVtYmVyXCI9PXR5cGVvZiBlP1sxLGVdOmV9LF9nZXRNaW5NYXhEYXRlOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuX2RldGVybWluZURhdGUodCx0aGlzLl9nZXQodCxlK1wiRGF0ZVwiKSxudWxsKX0sX2dldERheXNJbk1vbnRoOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIDMyLXRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKHQsZSwzMikpLmdldERhdGUoKX0sX2dldEZpcnN0RGF5T2ZNb250aDpmdW5jdGlvbih0LGUpe3JldHVybiBuZXcgRGF0ZSh0LGUsMSkuZ2V0RGF5KCl9LF9jYW5BZGp1c3RNb250aDpmdW5jdGlvbih0LGUsaSxzKXt2YXIgbj10aGlzLl9nZXROdW1iZXJPZk1vbnRocyh0KSxvPXRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKGkscysoMD5lP2U6blswXSpuWzFdKSwxKSk7cmV0dXJuIDA+ZSYmby5zZXREYXRlKHRoaXMuX2dldERheXNJbk1vbnRoKG8uZ2V0RnVsbFllYXIoKSxvLmdldE1vbnRoKCkpKSx0aGlzLl9pc0luUmFuZ2UodCxvKX0sX2lzSW5SYW5nZTpmdW5jdGlvbih0LGUpe3ZhciBpLHMsbj10aGlzLl9nZXRNaW5NYXhEYXRlKHQsXCJtaW5cIiksbz10aGlzLl9nZXRNaW5NYXhEYXRlKHQsXCJtYXhcIiksYT1udWxsLHI9bnVsbCxsPXRoaXMuX2dldCh0LFwieWVhclJhbmdlXCIpO3JldHVybiBsJiYoaT1sLnNwbGl0KFwiOlwiKSxzPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxhPXBhcnNlSW50KGlbMF0sMTApLHI9cGFyc2VJbnQoaVsxXSwxMCksaVswXS5tYXRjaCgvWytcXC1dLiovKSYmKGErPXMpLGlbMV0ubWF0Y2goL1srXFwtXS4qLykmJihyKz1zKSksKCFufHxlLmdldFRpbWUoKT49bi5nZXRUaW1lKCkpJiYoIW98fGUuZ2V0VGltZSgpPD1vLmdldFRpbWUoKSkmJighYXx8ZS5nZXRGdWxsWWVhcigpPj1hKSYmKCFyfHxyPj1lLmdldEZ1bGxZZWFyKCkpfSxfZ2V0Rm9ybWF0Q29uZmlnOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX2dldCh0LFwic2hvcnRZZWFyQ3V0b2ZmXCIpO3JldHVybiBlPVwic3RyaW5nXCIhPXR5cGVvZiBlP2U6KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpJTEwMCtwYXJzZUludChlLDEwKSx7c2hvcnRZZWFyQ3V0b2ZmOmUsZGF5TmFtZXNTaG9ydDp0aGlzLl9nZXQodCxcImRheU5hbWVzU2hvcnRcIiksZGF5TmFtZXM6dGhpcy5fZ2V0KHQsXCJkYXlOYW1lc1wiKSxtb250aE5hbWVzU2hvcnQ6dGhpcy5fZ2V0KHQsXCJtb250aE5hbWVzU2hvcnRcIiksbW9udGhOYW1lczp0aGlzLl9nZXQodCxcIm1vbnRoTmFtZXNcIil9fSxfZm9ybWF0RGF0ZTpmdW5jdGlvbih0LGUsaSxzKXtlfHwodC5jdXJyZW50RGF5PXQuc2VsZWN0ZWREYXksdC5jdXJyZW50TW9udGg9dC5zZWxlY3RlZE1vbnRoLHQuY3VycmVudFllYXI9dC5zZWxlY3RlZFllYXIpO3ZhciBuPWU/XCJvYmplY3RcIj09dHlwZW9mIGU/ZTp0aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZShzLGksZSkpOnRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKHQuY3VycmVudFllYXIsdC5jdXJyZW50TW9udGgsdC5jdXJyZW50RGF5KSk7cmV0dXJuIHRoaXMuZm9ybWF0RGF0ZSh0aGlzLl9nZXQodCxcImRhdGVGb3JtYXRcIiksbix0aGlzLl9nZXRGb3JtYXRDb25maWcodCkpfX0pLHQuZm4uZGF0ZXBpY2tlcj1mdW5jdGlvbihlKXtpZighdGhpcy5sZW5ndGgpcmV0dXJuIHRoaXM7dC5kYXRlcGlja2VyLmluaXRpYWxpemVkfHwodChkb2N1bWVudCkub24oXCJtb3VzZWRvd25cIix0LmRhdGVwaWNrZXIuX2NoZWNrRXh0ZXJuYWxDbGljayksdC5kYXRlcGlja2VyLmluaXRpYWxpemVkPSEwKSwwPT09dChcIiNcIit0LmRhdGVwaWNrZXIuX21haW5EaXZJZCkubGVuZ3RoJiZ0KFwiYm9keVwiKS5hcHBlbmQodC5kYXRlcGlja2VyLmRwRGl2KTt2YXIgaT1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSk7cmV0dXJuXCJzdHJpbmdcIiE9dHlwZW9mIGV8fFwiaXNEaXNhYmxlZFwiIT09ZSYmXCJnZXREYXRlXCIhPT1lJiZcIndpZGdldFwiIT09ZT9cIm9wdGlvblwiPT09ZSYmMj09PWFyZ3VtZW50cy5sZW5ndGgmJlwic3RyaW5nXCI9PXR5cGVvZiBhcmd1bWVudHNbMV0/dC5kYXRlcGlja2VyW1wiX1wiK2UrXCJEYXRlcGlja2VyXCJdLmFwcGx5KHQuZGF0ZXBpY2tlcixbdGhpc1swXV0uY29uY2F0KGkpKTp0aGlzLmVhY2goZnVuY3Rpb24oKXtcInN0cmluZ1wiPT10eXBlb2YgZT90LmRhdGVwaWNrZXJbXCJfXCIrZStcIkRhdGVwaWNrZXJcIl0uYXBwbHkodC5kYXRlcGlja2VyLFt0aGlzXS5jb25jYXQoaSkpOnQuZGF0ZXBpY2tlci5fYXR0YWNoRGF0ZXBpY2tlcih0aGlzLGUpfSk6dC5kYXRlcGlja2VyW1wiX1wiK2UrXCJEYXRlcGlja2VyXCJdLmFwcGx5KHQuZGF0ZXBpY2tlcixbdGhpc1swXV0uY29uY2F0KGkpKX0sdC5kYXRlcGlja2VyPW5ldyBpLHQuZGF0ZXBpY2tlci5pbml0aWFsaXplZD0hMSx0LmRhdGVwaWNrZXIudXVpZD0obmV3IERhdGUpLmdldFRpbWUoKSx0LmRhdGVwaWNrZXIudmVyc2lvbj1cIjEuMTIuMVwiLHQuZGF0ZXBpY2tlcix0LnVpLmllPSEhL21zaWUgW1xcdy5dKy8uZXhlYyhuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkpO3ZhciBoPSExO3QoZG9jdW1lbnQpLm9uKFwibW91c2V1cFwiLGZ1bmN0aW9uKCl7aD0hMX0pLHQud2lkZ2V0KFwidWkubW91c2VcIix7dmVyc2lvbjpcIjEuMTIuMVwiLG9wdGlvbnM6e2NhbmNlbDpcImlucHV0LCB0ZXh0YXJlYSwgYnV0dG9uLCBzZWxlY3QsIG9wdGlvblwiLGRpc3RhbmNlOjEsZGVsYXk6MH0sX21vdXNlSW5pdDpmdW5jdGlvbigpe3ZhciBlPXRoaXM7dGhpcy5lbGVtZW50Lm9uKFwibW91c2Vkb3duLlwiK3RoaXMud2lkZ2V0TmFtZSxmdW5jdGlvbih0KXtyZXR1cm4gZS5fbW91c2VEb3duKHQpfSkub24oXCJjbGljay5cIit0aGlzLndpZGdldE5hbWUsZnVuY3Rpb24oaSl7cmV0dXJuITA9PT10LmRhdGEoaS50YXJnZXQsZS53aWRnZXROYW1lK1wiLnByZXZlbnRDbGlja0V2ZW50XCIpPyh0LnJlbW92ZURhdGEoaS50YXJnZXQsZS53aWRnZXROYW1lK1wiLnByZXZlbnRDbGlja0V2ZW50XCIpLGkuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCksITEpOnZvaWQgMH0pLHRoaXMuc3RhcnRlZD0hMX0sX21vdXNlRGVzdHJveTpmdW5jdGlvbigpe3RoaXMuZWxlbWVudC5vZmYoXCIuXCIrdGhpcy53aWRnZXROYW1lKSx0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZSYmdGhpcy5kb2N1bWVudC5vZmYoXCJtb3VzZW1vdmUuXCIrdGhpcy53aWRnZXROYW1lLHRoaXMuX21vdXNlTW92ZURlbGVnYXRlKS5vZmYoXCJtb3VzZXVwLlwiK3RoaXMud2lkZ2V0TmFtZSx0aGlzLl9tb3VzZVVwRGVsZWdhdGUpfSxfbW91c2VEb3duOmZ1bmN0aW9uKGUpe2lmKCFoKXt0aGlzLl9tb3VzZU1vdmVkPSExLHRoaXMuX21vdXNlU3RhcnRlZCYmdGhpcy5fbW91c2VVcChlKSx0aGlzLl9tb3VzZURvd25FdmVudD1lO3ZhciBpPXRoaXMscz0xPT09ZS53aGljaCxuPVwic3RyaW5nXCI9PXR5cGVvZiB0aGlzLm9wdGlvbnMuY2FuY2VsJiZlLnRhcmdldC5ub2RlTmFtZT90KGUudGFyZ2V0KS5jbG9zZXN0KHRoaXMub3B0aW9ucy5jYW5jZWwpLmxlbmd0aDohMTtyZXR1cm4gcyYmIW4mJnRoaXMuX21vdXNlQ2FwdHVyZShlKT8odGhpcy5tb3VzZURlbGF5TWV0PSF0aGlzLm9wdGlvbnMuZGVsYXksdGhpcy5tb3VzZURlbGF5TWV0fHwodGhpcy5fbW91c2VEZWxheVRpbWVyPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtpLm1vdXNlRGVsYXlNZXQ9ITB9LHRoaXMub3B0aW9ucy5kZWxheSkpLHRoaXMuX21vdXNlRGlzdGFuY2VNZXQoZSkmJnRoaXMuX21vdXNlRGVsYXlNZXQoZSkmJih0aGlzLl9tb3VzZVN0YXJ0ZWQ9dGhpcy5fbW91c2VTdGFydChlKSE9PSExLCF0aGlzLl9tb3VzZVN0YXJ0ZWQpPyhlLnByZXZlbnREZWZhdWx0KCksITApOighMD09PXQuZGF0YShlLnRhcmdldCx0aGlzLndpZGdldE5hbWUrXCIucHJldmVudENsaWNrRXZlbnRcIikmJnQucmVtb3ZlRGF0YShlLnRhcmdldCx0aGlzLndpZGdldE5hbWUrXCIucHJldmVudENsaWNrRXZlbnRcIiksdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGU9ZnVuY3Rpb24odCl7cmV0dXJuIGkuX21vdXNlTW92ZSh0KX0sdGhpcy5fbW91c2VVcERlbGVnYXRlPWZ1bmN0aW9uKHQpe3JldHVybiBpLl9tb3VzZVVwKHQpfSx0aGlzLmRvY3VtZW50Lm9uKFwibW91c2Vtb3ZlLlwiK3RoaXMud2lkZ2V0TmFtZSx0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZSkub24oXCJtb3VzZXVwLlwiK3RoaXMud2lkZ2V0TmFtZSx0aGlzLl9tb3VzZVVwRGVsZWdhdGUpLGUucHJldmVudERlZmF1bHQoKSxoPSEwLCEwKSk6ITB9fSxfbW91c2VNb3ZlOmZ1bmN0aW9uKGUpe2lmKHRoaXMuX21vdXNlTW92ZWQpe2lmKHQudWkuaWUmJighZG9jdW1lbnQuZG9jdW1lbnRNb2RlfHw5PmRvY3VtZW50LmRvY3VtZW50TW9kZSkmJiFlLmJ1dHRvbilyZXR1cm4gdGhpcy5fbW91c2VVcChlKTtpZighZS53aGljaClpZihlLm9yaWdpbmFsRXZlbnQuYWx0S2V5fHxlLm9yaWdpbmFsRXZlbnQuY3RybEtleXx8ZS5vcmlnaW5hbEV2ZW50Lm1ldGFLZXl8fGUub3JpZ2luYWxFdmVudC5zaGlmdEtleSl0aGlzLmlnbm9yZU1pc3NpbmdXaGljaD0hMDtlbHNlIGlmKCF0aGlzLmlnbm9yZU1pc3NpbmdXaGljaClyZXR1cm4gdGhpcy5fbW91c2VVcChlKX1yZXR1cm4oZS53aGljaHx8ZS5idXR0b24pJiYodGhpcy5fbW91c2VNb3ZlZD0hMCksdGhpcy5fbW91c2VTdGFydGVkPyh0aGlzLl9tb3VzZURyYWcoZSksZS5wcmV2ZW50RGVmYXVsdCgpKToodGhpcy5fbW91c2VEaXN0YW5jZU1ldChlKSYmdGhpcy5fbW91c2VEZWxheU1ldChlKSYmKHRoaXMuX21vdXNlU3RhcnRlZD10aGlzLl9tb3VzZVN0YXJ0KHRoaXMuX21vdXNlRG93bkV2ZW50LGUpIT09ITEsdGhpcy5fbW91c2VTdGFydGVkP3RoaXMuX21vdXNlRHJhZyhlKTp0aGlzLl9tb3VzZVVwKGUpKSwhdGhpcy5fbW91c2VTdGFydGVkKX0sX21vdXNlVXA6ZnVuY3Rpb24oZSl7dGhpcy5kb2N1bWVudC5vZmYoXCJtb3VzZW1vdmUuXCIrdGhpcy53aWRnZXROYW1lLHRoaXMuX21vdXNlTW92ZURlbGVnYXRlKS5vZmYoXCJtb3VzZXVwLlwiK3RoaXMud2lkZ2V0TmFtZSx0aGlzLl9tb3VzZVVwRGVsZWdhdGUpLHRoaXMuX21vdXNlU3RhcnRlZCYmKHRoaXMuX21vdXNlU3RhcnRlZD0hMSxlLnRhcmdldD09PXRoaXMuX21vdXNlRG93bkV2ZW50LnRhcmdldCYmdC5kYXRhKGUudGFyZ2V0LHRoaXMud2lkZ2V0TmFtZStcIi5wcmV2ZW50Q2xpY2tFdmVudFwiLCEwKSx0aGlzLl9tb3VzZVN0b3AoZSkpLHRoaXMuX21vdXNlRGVsYXlUaW1lciYmKGNsZWFyVGltZW91dCh0aGlzLl9tb3VzZURlbGF5VGltZXIpLGRlbGV0ZSB0aGlzLl9tb3VzZURlbGF5VGltZXIpLHRoaXMuaWdub3JlTWlzc2luZ1doaWNoPSExLGg9ITEsZS5wcmV2ZW50RGVmYXVsdCgpfSxfbW91c2VEaXN0YW5jZU1ldDpmdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5tYXgoTWF0aC5hYnModGhpcy5fbW91c2VEb3duRXZlbnQucGFnZVgtdC5wYWdlWCksTWF0aC5hYnModGhpcy5fbW91c2VEb3duRXZlbnQucGFnZVktdC5wYWdlWSkpPj10aGlzLm9wdGlvbnMuZGlzdGFuY2V9LF9tb3VzZURlbGF5TWV0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubW91c2VEZWxheU1ldH0sX21vdXNlU3RhcnQ6ZnVuY3Rpb24oKXt9LF9tb3VzZURyYWc6ZnVuY3Rpb24oKXt9LF9tb3VzZVN0b3A6ZnVuY3Rpb24oKXt9LF9tb3VzZUNhcHR1cmU6ZnVuY3Rpb24oKXtyZXR1cm4hMH19KSx0LndpZGdldChcInVpLnNlbGVjdG1lbnVcIixbdC51aS5mb3JtUmVzZXRNaXhpbix7dmVyc2lvbjpcIjEuMTIuMVwiLGRlZmF1bHRFbGVtZW50OlwiPHNlbGVjdD5cIixvcHRpb25zOnthcHBlbmRUbzpudWxsLGNsYXNzZXM6e1widWktc2VsZWN0bWVudS1idXR0b24tb3BlblwiOlwidWktY29ybmVyLXRvcFwiLFwidWktc2VsZWN0bWVudS1idXR0b24tY2xvc2VkXCI6XCJ1aS1jb3JuZXItYWxsXCJ9LGRpc2FibGVkOm51bGwsaWNvbnM6e2J1dHRvbjpcInVpLWljb24tdHJpYW5nbGUtMS1zXCJ9LHBvc2l0aW9uOntteTpcImxlZnQgdG9wXCIsYXQ6XCJsZWZ0IGJvdHRvbVwiLGNvbGxpc2lvbjpcIm5vbmVcIn0sd2lkdGg6ITEsY2hhbmdlOm51bGwsY2xvc2U6bnVsbCxmb2N1czpudWxsLG9wZW46bnVsbCxzZWxlY3Q6bnVsbH0sX2NyZWF0ZTpmdW5jdGlvbigpe3ZhciBlPXRoaXMuZWxlbWVudC51bmlxdWVJZCgpLmF0dHIoXCJpZFwiKTt0aGlzLmlkcz17ZWxlbWVudDplLGJ1dHRvbjplK1wiLWJ1dHRvblwiLG1lbnU6ZStcIi1tZW51XCJ9LHRoaXMuX2RyYXdCdXR0b24oKSx0aGlzLl9kcmF3TWVudSgpLHRoaXMuX2JpbmRGb3JtUmVzZXRIYW5kbGVyKCksdGhpcy5fcmVuZGVyZWQ9ITEsdGhpcy5tZW51SXRlbXM9dCgpfSxfZHJhd0J1dHRvbjpmdW5jdGlvbigpe3ZhciBlLGk9dGhpcyxzPXRoaXMuX3BhcnNlT3B0aW9uKHRoaXMuZWxlbWVudC5maW5kKFwib3B0aW9uOnNlbGVjdGVkXCIpLHRoaXMuZWxlbWVudFswXS5zZWxlY3RlZEluZGV4KTt0aGlzLmxhYmVscz10aGlzLmVsZW1lbnQubGFiZWxzKCkuYXR0cihcImZvclwiLHRoaXMuaWRzLmJ1dHRvbiksdGhpcy5fb24odGhpcy5sYWJlbHMse2NsaWNrOmZ1bmN0aW9uKHQpe3RoaXMuYnV0dG9uLmZvY3VzKCksdC5wcmV2ZW50RGVmYXVsdCgpfX0pLHRoaXMuZWxlbWVudC5oaWRlKCksdGhpcy5idXR0b249dChcIjxzcGFuPlwiLHt0YWJpbmRleDp0aGlzLm9wdGlvbnMuZGlzYWJsZWQ/LTE6MCxpZDp0aGlzLmlkcy5idXR0b24scm9sZTpcImNvbWJvYm94XCIsXCJhcmlhLWV4cGFuZGVkXCI6XCJmYWxzZVwiLFwiYXJpYS1hdXRvY29tcGxldGVcIjpcImxpc3RcIixcImFyaWEtb3duc1wiOnRoaXMuaWRzLm1lbnUsXCJhcmlhLWhhc3BvcHVwXCI6XCJ0cnVlXCIsdGl0bGU6dGhpcy5lbGVtZW50LmF0dHIoXCJ0aXRsZVwiKX0pLmluc2VydEFmdGVyKHRoaXMuZWxlbWVudCksdGhpcy5fYWRkQ2xhc3ModGhpcy5idXR0b24sXCJ1aS1zZWxlY3RtZW51LWJ1dHRvbiB1aS1zZWxlY3RtZW51LWJ1dHRvbi1jbG9zZWRcIixcInVpLWJ1dHRvbiB1aS13aWRnZXRcIiksZT10KFwiPHNwYW4+XCIpLmFwcGVuZFRvKHRoaXMuYnV0dG9uKSx0aGlzLl9hZGRDbGFzcyhlLFwidWktc2VsZWN0bWVudS1pY29uXCIsXCJ1aS1pY29uIFwiK3RoaXMub3B0aW9ucy5pY29ucy5idXR0b24pLHRoaXMuYnV0dG9uSXRlbT10aGlzLl9yZW5kZXJCdXR0b25JdGVtKHMpLmFwcGVuZFRvKHRoaXMuYnV0dG9uKSx0aGlzLm9wdGlvbnMud2lkdGghPT0hMSYmdGhpcy5fcmVzaXplQnV0dG9uKCksdGhpcy5fb24odGhpcy5idXR0b24sdGhpcy5fYnV0dG9uRXZlbnRzKSx0aGlzLmJ1dHRvbi5vbmUoXCJmb2N1c2luXCIsZnVuY3Rpb24oKXtpLl9yZW5kZXJlZHx8aS5fcmVmcmVzaE1lbnUoKX0pfSxfZHJhd01lbnU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzO3RoaXMubWVudT10KFwiPHVsPlwiLHtcImFyaWEtaGlkZGVuXCI6XCJ0cnVlXCIsXCJhcmlhLWxhYmVsbGVkYnlcIjp0aGlzLmlkcy5idXR0b24saWQ6dGhpcy5pZHMubWVudX0pLHRoaXMubWVudVdyYXA9dChcIjxkaXY+XCIpLmFwcGVuZCh0aGlzLm1lbnUpLHRoaXMuX2FkZENsYXNzKHRoaXMubWVudVdyYXAsXCJ1aS1zZWxlY3RtZW51LW1lbnVcIixcInVpLWZyb250XCIpLHRoaXMubWVudVdyYXAuYXBwZW5kVG8odGhpcy5fYXBwZW5kVG8oKSksdGhpcy5tZW51SW5zdGFuY2U9dGhpcy5tZW51Lm1lbnUoe2NsYXNzZXM6e1widWktbWVudVwiOlwidWktY29ybmVyLWJvdHRvbVwifSxyb2xlOlwibGlzdGJveFwiLHNlbGVjdDpmdW5jdGlvbih0LGkpe3QucHJldmVudERlZmF1bHQoKSxlLl9zZXRTZWxlY3Rpb24oKSxlLl9zZWxlY3QoaS5pdGVtLmRhdGEoXCJ1aS1zZWxlY3RtZW51LWl0ZW1cIiksdCl9LGZvY3VzOmZ1bmN0aW9uKHQsaSl7dmFyIHM9aS5pdGVtLmRhdGEoXCJ1aS1zZWxlY3RtZW51LWl0ZW1cIik7bnVsbCE9ZS5mb2N1c0luZGV4JiZzLmluZGV4IT09ZS5mb2N1c0luZGV4JiYoZS5fdHJpZ2dlcihcImZvY3VzXCIsdCx7aXRlbTpzfSksZS5pc09wZW58fGUuX3NlbGVjdChzLHQpKSxlLmZvY3VzSW5kZXg9cy5pbmRleCxlLmJ1dHRvbi5hdHRyKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIsZS5tZW51SXRlbXMuZXEocy5pbmRleCkuYXR0cihcImlkXCIpKX19KS5tZW51KFwiaW5zdGFuY2VcIiksdGhpcy5tZW51SW5zdGFuY2UuX29mZih0aGlzLm1lbnUsXCJtb3VzZWxlYXZlXCIpLHRoaXMubWVudUluc3RhbmNlLl9jbG9zZU9uRG9jdW1lbnRDbGljaz1mdW5jdGlvbigpe3JldHVybiExfSx0aGlzLm1lbnVJbnN0YW5jZS5faXNEaXZpZGVyPWZ1bmN0aW9uKCl7cmV0dXJuITF9fSxyZWZyZXNoOmZ1bmN0aW9uKCl7dGhpcy5fcmVmcmVzaE1lbnUoKSx0aGlzLmJ1dHRvbkl0ZW0ucmVwbGFjZVdpdGgodGhpcy5idXR0b25JdGVtPXRoaXMuX3JlbmRlckJ1dHRvbkl0ZW0odGhpcy5fZ2V0U2VsZWN0ZWRJdGVtKCkuZGF0YShcInVpLXNlbGVjdG1lbnUtaXRlbVwiKXx8e30pKSxudWxsPT09dGhpcy5vcHRpb25zLndpZHRoJiZ0aGlzLl9yZXNpemVCdXR0b24oKX0sX3JlZnJlc2hNZW51OmZ1bmN0aW9uKCl7dmFyIHQsZT10aGlzLmVsZW1lbnQuZmluZChcIm9wdGlvblwiKTt0aGlzLm1lbnUuZW1wdHkoKSx0aGlzLl9wYXJzZU9wdGlvbnMoZSksdGhpcy5fcmVuZGVyTWVudSh0aGlzLm1lbnUsdGhpcy5pdGVtcyksdGhpcy5tZW51SW5zdGFuY2UucmVmcmVzaCgpLHRoaXMubWVudUl0ZW1zPXRoaXMubWVudS5maW5kKFwibGlcIikubm90KFwiLnVpLXNlbGVjdG1lbnUtb3B0Z3JvdXBcIikuZmluZChcIi51aS1tZW51LWl0ZW0td3JhcHBlclwiKSx0aGlzLl9yZW5kZXJlZD0hMCxlLmxlbmd0aCYmKHQ9dGhpcy5fZ2V0U2VsZWN0ZWRJdGVtKCksdGhpcy5tZW51SW5zdGFuY2UuZm9jdXMobnVsbCx0KSx0aGlzLl9zZXRBcmlhKHQuZGF0YShcInVpLXNlbGVjdG1lbnUtaXRlbVwiKSksdGhpcy5fc2V0T3B0aW9uKFwiZGlzYWJsZWRcIix0aGlzLmVsZW1lbnQucHJvcChcImRpc2FibGVkXCIpKSl9LG9wZW46ZnVuY3Rpb24odCl7dGhpcy5vcHRpb25zLmRpc2FibGVkfHwodGhpcy5fcmVuZGVyZWQ/KHRoaXMuX3JlbW92ZUNsYXNzKHRoaXMubWVudS5maW5kKFwiLnVpLXN0YXRlLWFjdGl2ZVwiKSxudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpLHRoaXMubWVudUluc3RhbmNlLmZvY3VzKG51bGwsdGhpcy5fZ2V0U2VsZWN0ZWRJdGVtKCkpKTp0aGlzLl9yZWZyZXNoTWVudSgpLHRoaXMubWVudUl0ZW1zLmxlbmd0aCYmKHRoaXMuaXNPcGVuPSEwLHRoaXMuX3RvZ2dsZUF0dHIoKSx0aGlzLl9yZXNpemVNZW51KCksdGhpcy5fcG9zaXRpb24oKSx0aGlzLl9vbih0aGlzLmRvY3VtZW50LHRoaXMuX2RvY3VtZW50Q2xpY2spLHRoaXMuX3RyaWdnZXIoXCJvcGVuXCIsdCkpKX0sX3Bvc2l0aW9uOmZ1bmN0aW9uKCl7dGhpcy5tZW51V3JhcC5wb3NpdGlvbih0LmV4dGVuZCh7b2Y6dGhpcy5idXR0b259LHRoaXMub3B0aW9ucy5wb3NpdGlvbikpfSxjbG9zZTpmdW5jdGlvbih0KXt0aGlzLmlzT3BlbiYmKHRoaXMuaXNPcGVuPSExLHRoaXMuX3RvZ2dsZUF0dHIoKSx0aGlzLnJhbmdlPW51bGwsdGhpcy5fb2ZmKHRoaXMuZG9jdW1lbnQpLHRoaXMuX3RyaWdnZXIoXCJjbG9zZVwiLHQpKX0sd2lkZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYnV0dG9ufSxtZW51V2lkZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubWVudX0sX3JlbmRlckJ1dHRvbkl0ZW06ZnVuY3Rpb24oZSl7dmFyIGk9dChcIjxzcGFuPlwiKTtyZXR1cm4gdGhpcy5fc2V0VGV4dChpLGUubGFiZWwpLHRoaXMuX2FkZENsYXNzKGksXCJ1aS1zZWxlY3RtZW51LXRleHRcIiksaX0sX3JlbmRlck1lbnU6ZnVuY3Rpb24oZSxpKXt2YXIgcz10aGlzLG49XCJcIjt0LmVhY2goaSxmdW5jdGlvbihpLG8pe3ZhciBhO28ub3B0Z3JvdXAhPT1uJiYoYT10KFwiPGxpPlwiLHt0ZXh0Om8ub3B0Z3JvdXB9KSxzLl9hZGRDbGFzcyhhLFwidWktc2VsZWN0bWVudS1vcHRncm91cFwiLFwidWktbWVudS1kaXZpZGVyXCIrKG8uZWxlbWVudC5wYXJlbnQoXCJvcHRncm91cFwiKS5wcm9wKFwiZGlzYWJsZWRcIik/XCIgdWktc3RhdGUtZGlzYWJsZWRcIjpcIlwiKSksYS5hcHBlbmRUbyhlKSxuPW8ub3B0Z3JvdXApLHMuX3JlbmRlckl0ZW1EYXRhKGUsbyl9KX0sX3JlbmRlckl0ZW1EYXRhOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuX3JlbmRlckl0ZW0odCxlKS5kYXRhKFwidWktc2VsZWN0bWVudS1pdGVtXCIsZSl9LF9yZW5kZXJJdGVtOmZ1bmN0aW9uKGUsaSl7dmFyIHM9dChcIjxsaT5cIiksbj10KFwiPGRpdj5cIix7dGl0bGU6aS5lbGVtZW50LmF0dHIoXCJ0aXRsZVwiKX0pO3JldHVybiBpLmRpc2FibGVkJiZ0aGlzLl9hZGRDbGFzcyhzLG51bGwsXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiKSx0aGlzLl9zZXRUZXh0KG4saS5sYWJlbCkscy5hcHBlbmQobikuYXBwZW5kVG8oZSl9LF9zZXRUZXh0OmZ1bmN0aW9uKHQsZSl7ZT90LnRleHQoZSk6dC5odG1sKFwiJiMxNjA7XCIpfSxfbW92ZTpmdW5jdGlvbih0LGUpe3ZhciBpLHMsbj1cIi51aS1tZW51LWl0ZW1cIjt0aGlzLmlzT3Blbj9pPXRoaXMubWVudUl0ZW1zLmVxKHRoaXMuZm9jdXNJbmRleCkucGFyZW50KFwibGlcIik6KGk9dGhpcy5tZW51SXRlbXMuZXEodGhpcy5lbGVtZW50WzBdLnNlbGVjdGVkSW5kZXgpLnBhcmVudChcImxpXCIpLG4rPVwiOm5vdCgudWktc3RhdGUtZGlzYWJsZWQpXCIpLHM9XCJmaXJzdFwiPT09dHx8XCJsYXN0XCI9PT10P2lbXCJmaXJzdFwiPT09dD9cInByZXZBbGxcIjpcIm5leHRBbGxcIl0obikuZXEoLTEpOmlbdCtcIkFsbFwiXShuKS5lcSgwKSxzLmxlbmd0aCYmdGhpcy5tZW51SW5zdGFuY2UuZm9jdXMoZSxzKX0sX2dldFNlbGVjdGVkSXRlbTpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1lbnVJdGVtcy5lcSh0aGlzLmVsZW1lbnRbMF0uc2VsZWN0ZWRJbmRleCkucGFyZW50KFwibGlcIil9LF90b2dnbGU6ZnVuY3Rpb24odCl7dGhpc1t0aGlzLmlzT3Blbj9cImNsb3NlXCI6XCJvcGVuXCJdKHQpfSxfc2V0U2VsZWN0aW9uOmZ1bmN0aW9uKCl7dmFyIHQ7dGhpcy5yYW5nZSYmKHdpbmRvdy5nZXRTZWxlY3Rpb24/KHQ9d2luZG93LmdldFNlbGVjdGlvbigpLHQucmVtb3ZlQWxsUmFuZ2VzKCksdC5hZGRSYW5nZSh0aGlzLnJhbmdlKSk6dGhpcy5yYW5nZS5zZWxlY3QoKSx0aGlzLmJ1dHRvbi5mb2N1cygpKX0sX2RvY3VtZW50Q2xpY2s6e21vdXNlZG93bjpmdW5jdGlvbihlKXt0aGlzLmlzT3BlbiYmKHQoZS50YXJnZXQpLmNsb3Nlc3QoXCIudWktc2VsZWN0bWVudS1tZW51LCAjXCIrdC51aS5lc2NhcGVTZWxlY3Rvcih0aGlzLmlkcy5idXR0b24pKS5sZW5ndGh8fHRoaXMuY2xvc2UoZSkpfX0sX2J1dHRvbkV2ZW50czp7bW91c2Vkb3duOmZ1bmN0aW9uKCl7dmFyIHQ7d2luZG93LmdldFNlbGVjdGlvbj8odD13aW5kb3cuZ2V0U2VsZWN0aW9uKCksdC5yYW5nZUNvdW50JiYodGhpcy5yYW5nZT10LmdldFJhbmdlQXQoMCkpKTp0aGlzLnJhbmdlPWRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpfSxjbGljazpmdW5jdGlvbih0KXt0aGlzLl9zZXRTZWxlY3Rpb24oKSx0aGlzLl90b2dnbGUodCl9LGtleWRvd246ZnVuY3Rpb24oZSl7dmFyIGk9ITA7c3dpdGNoKGUua2V5Q29kZSl7Y2FzZSB0LnVpLmtleUNvZGUuVEFCOmNhc2UgdC51aS5rZXlDb2RlLkVTQ0FQRTp0aGlzLmNsb3NlKGUpLGk9ITE7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRU5URVI6dGhpcy5pc09wZW4mJnRoaXMuX3NlbGVjdEZvY3VzZWRJdGVtKGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlVQOmUuYWx0S2V5P3RoaXMuX3RvZ2dsZShlKTp0aGlzLl9tb3ZlKFwicHJldlwiLGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkRPV046ZS5hbHRLZXk/dGhpcy5fdG9nZ2xlKGUpOnRoaXMuX21vdmUoXCJuZXh0XCIsZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuU1BBQ0U6dGhpcy5pc09wZW4/dGhpcy5fc2VsZWN0Rm9jdXNlZEl0ZW0oZSk6dGhpcy5fdG9nZ2xlKGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkxFRlQ6dGhpcy5fbW92ZShcInByZXZcIixlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5SSUdIVDp0aGlzLl9tb3ZlKFwibmV4dFwiLGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkhPTUU6Y2FzZSB0LnVpLmtleUNvZGUuUEFHRV9VUDp0aGlzLl9tb3ZlKFwiZmlyc3RcIixlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5FTkQ6Y2FzZSB0LnVpLmtleUNvZGUuUEFHRV9ET1dOOnRoaXMuX21vdmUoXCJsYXN0XCIsZSk7YnJlYWs7ZGVmYXVsdDp0aGlzLm1lbnUudHJpZ2dlcihlKSxpPSExfWkmJmUucHJldmVudERlZmF1bHQoKX19LF9zZWxlY3RGb2N1c2VkSXRlbTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLm1lbnVJdGVtcy5lcSh0aGlzLmZvY3VzSW5kZXgpLnBhcmVudChcImxpXCIpO2UuaGFzQ2xhc3MoXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiKXx8dGhpcy5fc2VsZWN0KGUuZGF0YShcInVpLXNlbGVjdG1lbnUtaXRlbVwiKSx0KX0sX3NlbGVjdDpmdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuZWxlbWVudFswXS5zZWxlY3RlZEluZGV4O3RoaXMuZWxlbWVudFswXS5zZWxlY3RlZEluZGV4PXQuaW5kZXgsdGhpcy5idXR0b25JdGVtLnJlcGxhY2VXaXRoKHRoaXMuYnV0dG9uSXRlbT10aGlzLl9yZW5kZXJCdXR0b25JdGVtKHQpKSx0aGlzLl9zZXRBcmlhKHQpLHRoaXMuX3RyaWdnZXIoXCJzZWxlY3RcIixlLHtpdGVtOnR9KSx0LmluZGV4IT09aSYmdGhpcy5fdHJpZ2dlcihcImNoYW5nZVwiLGUse2l0ZW06dH0pLHRoaXMuY2xvc2UoZSl9LF9zZXRBcmlhOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMubWVudUl0ZW1zLmVxKHQuaW5kZXgpLmF0dHIoXCJpZFwiKTt0aGlzLmJ1dHRvbi5hdHRyKHtcImFyaWEtbGFiZWxsZWRieVwiOmUsXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIjplfSksdGhpcy5tZW51LmF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIixlKX0sX3NldE9wdGlvbjpmdW5jdGlvbih0LGUpe2lmKFwiaWNvbnNcIj09PXQpe3ZhciBpPXRoaXMuYnV0dG9uLmZpbmQoXCJzcGFuLnVpLWljb25cIik7dGhpcy5fcmVtb3ZlQ2xhc3MoaSxudWxsLHRoaXMub3B0aW9ucy5pY29ucy5idXR0b24pLl9hZGRDbGFzcyhpLG51bGwsZS5idXR0b24pfXRoaXMuX3N1cGVyKHQsZSksXCJhcHBlbmRUb1wiPT09dCYmdGhpcy5tZW51V3JhcC5hcHBlbmRUbyh0aGlzLl9hcHBlbmRUbygpKSxcIndpZHRoXCI9PT10JiZ0aGlzLl9yZXNpemVCdXR0b24oKX0sX3NldE9wdGlvbkRpc2FibGVkOmZ1bmN0aW9uKHQpe3RoaXMuX3N1cGVyKHQpLHRoaXMubWVudUluc3RhbmNlLm9wdGlvbihcImRpc2FibGVkXCIsdCksdGhpcy5idXR0b24uYXR0cihcImFyaWEtZGlzYWJsZWRcIix0KSx0aGlzLl90b2dnbGVDbGFzcyh0aGlzLmJ1dHRvbixudWxsLFwidWktc3RhdGUtZGlzYWJsZWRcIix0KSx0aGlzLmVsZW1lbnQucHJvcChcImRpc2FibGVkXCIsdCksdD8odGhpcy5idXR0b24uYXR0cihcInRhYmluZGV4XCIsLTEpLHRoaXMuY2xvc2UoKSk6dGhpcy5idXR0b24uYXR0cihcInRhYmluZGV4XCIsMCl9LF9hcHBlbmRUbzpmdW5jdGlvbigpe3ZhciBlPXRoaXMub3B0aW9ucy5hcHBlbmRUbztyZXR1cm4gZSYmKGU9ZS5qcXVlcnl8fGUubm9kZVR5cGU/dChlKTp0aGlzLmRvY3VtZW50LmZpbmQoZSkuZXEoMCkpLGUmJmVbMF18fChlPXRoaXMuZWxlbWVudC5jbG9zZXN0KFwiLnVpLWZyb250LCBkaWFsb2dcIikpLGUubGVuZ3RofHwoZT10aGlzLmRvY3VtZW50WzBdLmJvZHkpLGV9LF90b2dnbGVBdHRyOmZ1bmN0aW9uKCl7dGhpcy5idXR0b24uYXR0cihcImFyaWEtZXhwYW5kZWRcIix0aGlzLmlzT3BlbiksdGhpcy5fcmVtb3ZlQ2xhc3ModGhpcy5idXR0b24sXCJ1aS1zZWxlY3RtZW51LWJ1dHRvbi1cIisodGhpcy5pc09wZW4/XCJjbG9zZWRcIjpcIm9wZW5cIikpLl9hZGRDbGFzcyh0aGlzLmJ1dHRvbixcInVpLXNlbGVjdG1lbnUtYnV0dG9uLVwiKyh0aGlzLmlzT3Blbj9cIm9wZW5cIjpcImNsb3NlZFwiKSkuX3RvZ2dsZUNsYXNzKHRoaXMubWVudVdyYXAsXCJ1aS1zZWxlY3RtZW51LW9wZW5cIixudWxsLHRoaXMuaXNPcGVuKSx0aGlzLm1lbnUuYXR0cihcImFyaWEtaGlkZGVuXCIsIXRoaXMuaXNPcGVuKX0sX3Jlc2l6ZUJ1dHRvbjpmdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy53aWR0aDtyZXR1cm4gdD09PSExPyh0aGlzLmJ1dHRvbi5jc3MoXCJ3aWR0aFwiLFwiXCIpLHZvaWQgMCk6KG51bGw9PT10JiYodD10aGlzLmVsZW1lbnQuc2hvdygpLm91dGVyV2lkdGgoKSx0aGlzLmVsZW1lbnQuaGlkZSgpKSx0aGlzLmJ1dHRvbi5vdXRlcldpZHRoKHQpLHZvaWQgMCl9LF9yZXNpemVNZW51OmZ1bmN0aW9uKCl7dGhpcy5tZW51Lm91dGVyV2lkdGgoTWF0aC5tYXgodGhpcy5idXR0b24ub3V0ZXJXaWR0aCgpLHRoaXMubWVudS53aWR0aChcIlwiKS5vdXRlcldpZHRoKCkrMSkpfSxfZ2V0Q3JlYXRlT3B0aW9uczpmdW5jdGlvbigpe3ZhciB0PXRoaXMuX3N1cGVyKCk7cmV0dXJuIHQuZGlzYWJsZWQ9dGhpcy5lbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiKSx0fSxfcGFyc2VPcHRpb25zOmZ1bmN0aW9uKGUpe3ZhciBpPXRoaXMscz1bXTtlLmVhY2goZnVuY3Rpb24oZSxuKXtzLnB1c2goaS5fcGFyc2VPcHRpb24odChuKSxlKSl9KSx0aGlzLml0ZW1zPXN9LF9wYXJzZU9wdGlvbjpmdW5jdGlvbih0LGUpe3ZhciBpPXQucGFyZW50KFwib3B0Z3JvdXBcIik7cmV0dXJue2VsZW1lbnQ6dCxpbmRleDplLHZhbHVlOnQudmFsKCksbGFiZWw6dC50ZXh0KCksb3B0Z3JvdXA6aS5hdHRyKFwibGFiZWxcIil8fFwiXCIsZGlzYWJsZWQ6aS5wcm9wKFwiZGlzYWJsZWRcIil8fHQucHJvcChcImRpc2FibGVkXCIpfX0sX2Rlc3Ryb3k6ZnVuY3Rpb24oKXt0aGlzLl91bmJpbmRGb3JtUmVzZXRIYW5kbGVyKCksdGhpcy5tZW51V3JhcC5yZW1vdmUoKSx0aGlzLmJ1dHRvbi5yZW1vdmUoKSx0aGlzLmVsZW1lbnQuc2hvdygpLHRoaXMuZWxlbWVudC5yZW1vdmVVbmlxdWVJZCgpLHRoaXMubGFiZWxzLmF0dHIoXCJmb3JcIix0aGlzLmlkcy5lbGVtZW50KX19XSksdC53aWRnZXQoXCJ1aS5zbGlkZXJcIix0LnVpLm1vdXNlLHt2ZXJzaW9uOlwiMS4xMi4xXCIsd2lkZ2V0RXZlbnRQcmVmaXg6XCJzbGlkZVwiLG9wdGlvbnM6e2FuaW1hdGU6ITEsY2xhc3Nlczp7XCJ1aS1zbGlkZXJcIjpcInVpLWNvcm5lci1hbGxcIixcInVpLXNsaWRlci1oYW5kbGVcIjpcInVpLWNvcm5lci1hbGxcIixcInVpLXNsaWRlci1yYW5nZVwiOlwidWktY29ybmVyLWFsbCB1aS13aWRnZXQtaGVhZGVyXCJ9LGRpc3RhbmNlOjAsbWF4OjEwMCxtaW46MCxvcmllbnRhdGlvbjpcImhvcml6b250YWxcIixyYW5nZTohMSxzdGVwOjEsdmFsdWU6MCx2YWx1ZXM6bnVsbCxjaGFuZ2U6bnVsbCxzbGlkZTpudWxsLHN0YXJ0Om51bGwsc3RvcDpudWxsfSxudW1QYWdlczo1LF9jcmVhdGU6ZnVuY3Rpb24oKXt0aGlzLl9rZXlTbGlkaW5nPSExLHRoaXMuX21vdXNlU2xpZGluZz0hMSx0aGlzLl9hbmltYXRlT2ZmPSEwLHRoaXMuX2hhbmRsZUluZGV4PW51bGwsdGhpcy5fZGV0ZWN0T3JpZW50YXRpb24oKSx0aGlzLl9tb3VzZUluaXQoKSx0aGlzLl9jYWxjdWxhdGVOZXdNYXgoKSx0aGlzLl9hZGRDbGFzcyhcInVpLXNsaWRlciB1aS1zbGlkZXItXCIrdGhpcy5vcmllbnRhdGlvbixcInVpLXdpZGdldCB1aS13aWRnZXQtY29udGVudFwiKSx0aGlzLl9yZWZyZXNoKCksdGhpcy5fYW5pbWF0ZU9mZj0hMX0sX3JlZnJlc2g6ZnVuY3Rpb24oKXt0aGlzLl9jcmVhdGVSYW5nZSgpLHRoaXMuX2NyZWF0ZUhhbmRsZXMoKSx0aGlzLl9zZXR1cEV2ZW50cygpLHRoaXMuX3JlZnJlc2hWYWx1ZSgpfSxfY3JlYXRlSGFuZGxlczpmdW5jdGlvbigpe3ZhciBlLGkscz10aGlzLm9wdGlvbnMsbj10aGlzLmVsZW1lbnQuZmluZChcIi51aS1zbGlkZXItaGFuZGxlXCIpLG89XCI8c3BhbiB0YWJpbmRleD0nMCc+PC9zcGFuPlwiLGE9W107Zm9yKGk9cy52YWx1ZXMmJnMudmFsdWVzLmxlbmd0aHx8MSxuLmxlbmd0aD5pJiYobi5zbGljZShpKS5yZW1vdmUoKSxuPW4uc2xpY2UoMCxpKSksZT1uLmxlbmd0aDtpPmU7ZSsrKWEucHVzaChvKTt0aGlzLmhhbmRsZXM9bi5hZGQodChhLmpvaW4oXCJcIikpLmFwcGVuZFRvKHRoaXMuZWxlbWVudCkpLHRoaXMuX2FkZENsYXNzKHRoaXMuaGFuZGxlcyxcInVpLXNsaWRlci1oYW5kbGVcIixcInVpLXN0YXRlLWRlZmF1bHRcIiksdGhpcy5oYW5kbGU9dGhpcy5oYW5kbGVzLmVxKDApLHRoaXMuaGFuZGxlcy5lYWNoKGZ1bmN0aW9uKGUpe3QodGhpcykuZGF0YShcInVpLXNsaWRlci1oYW5kbGUtaW5kZXhcIixlKS5hdHRyKFwidGFiSW5kZXhcIiwwKX0pfSxfY3JlYXRlUmFuZ2U6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLm9wdGlvbnM7ZS5yYW5nZT8oZS5yYW5nZT09PSEwJiYoZS52YWx1ZXM/ZS52YWx1ZXMubGVuZ3RoJiYyIT09ZS52YWx1ZXMubGVuZ3RoP2UudmFsdWVzPVtlLnZhbHVlc1swXSxlLnZhbHVlc1swXV06dC5pc0FycmF5KGUudmFsdWVzKSYmKGUudmFsdWVzPWUudmFsdWVzLnNsaWNlKDApKTplLnZhbHVlcz1bdGhpcy5fdmFsdWVNaW4oKSx0aGlzLl92YWx1ZU1pbigpXSksdGhpcy5yYW5nZSYmdGhpcy5yYW5nZS5sZW5ndGg/KHRoaXMuX3JlbW92ZUNsYXNzKHRoaXMucmFuZ2UsXCJ1aS1zbGlkZXItcmFuZ2UtbWluIHVpLXNsaWRlci1yYW5nZS1tYXhcIiksdGhpcy5yYW5nZS5jc3Moe2xlZnQ6XCJcIixib3R0b206XCJcIn0pKToodGhpcy5yYW5nZT10KFwiPGRpdj5cIikuYXBwZW5kVG8odGhpcy5lbGVtZW50KSx0aGlzLl9hZGRDbGFzcyh0aGlzLnJhbmdlLFwidWktc2xpZGVyLXJhbmdlXCIpKSwoXCJtaW5cIj09PWUucmFuZ2V8fFwibWF4XCI9PT1lLnJhbmdlKSYmdGhpcy5fYWRkQ2xhc3ModGhpcy5yYW5nZSxcInVpLXNsaWRlci1yYW5nZS1cIitlLnJhbmdlKSk6KHRoaXMucmFuZ2UmJnRoaXMucmFuZ2UucmVtb3ZlKCksdGhpcy5yYW5nZT1udWxsKX0sX3NldHVwRXZlbnRzOmZ1bmN0aW9uKCl7dGhpcy5fb2ZmKHRoaXMuaGFuZGxlcyksdGhpcy5fb24odGhpcy5oYW5kbGVzLHRoaXMuX2hhbmRsZUV2ZW50cyksdGhpcy5faG92ZXJhYmxlKHRoaXMuaGFuZGxlcyksdGhpcy5fZm9jdXNhYmxlKHRoaXMuaGFuZGxlcyl9LF9kZXN0cm95OmZ1bmN0aW9uKCl7dGhpcy5oYW5kbGVzLnJlbW92ZSgpLHRoaXMucmFuZ2UmJnRoaXMucmFuZ2UucmVtb3ZlKCksdGhpcy5fbW91c2VEZXN0cm95KCl9LF9tb3VzZUNhcHR1cmU6ZnVuY3Rpb24oZSl7dmFyIGkscyxuLG8sYSxyLGwsaCxjPXRoaXMsdT10aGlzLm9wdGlvbnM7cmV0dXJuIHUuZGlzYWJsZWQ/ITE6KHRoaXMuZWxlbWVudFNpemU9e3dpZHRoOnRoaXMuZWxlbWVudC5vdXRlcldpZHRoKCksaGVpZ2h0OnRoaXMuZWxlbWVudC5vdXRlckhlaWdodCgpfSx0aGlzLmVsZW1lbnRPZmZzZXQ9dGhpcy5lbGVtZW50Lm9mZnNldCgpLGk9e3g6ZS5wYWdlWCx5OmUucGFnZVl9LHM9dGhpcy5fbm9ybVZhbHVlRnJvbU1vdXNlKGkpLG49dGhpcy5fdmFsdWVNYXgoKS10aGlzLl92YWx1ZU1pbigpKzEsdGhpcy5oYW5kbGVzLmVhY2goZnVuY3Rpb24oZSl7dmFyIGk9TWF0aC5hYnMocy1jLnZhbHVlcyhlKSk7KG4+aXx8bj09PWkmJihlPT09Yy5fbGFzdENoYW5nZWRWYWx1ZXx8Yy52YWx1ZXMoZSk9PT11Lm1pbikpJiYobj1pLG89dCh0aGlzKSxhPWUpfSkscj10aGlzLl9zdGFydChlLGEpLHI9PT0hMT8hMToodGhpcy5fbW91c2VTbGlkaW5nPSEwLHRoaXMuX2hhbmRsZUluZGV4PWEsdGhpcy5fYWRkQ2xhc3MobyxudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpLG8udHJpZ2dlcihcImZvY3VzXCIpLGw9by5vZmZzZXQoKSxoPSF0KGUudGFyZ2V0KS5wYXJlbnRzKCkuYWRkQmFjaygpLmlzKFwiLnVpLXNsaWRlci1oYW5kbGVcIiksdGhpcy5fY2xpY2tPZmZzZXQ9aD97bGVmdDowLHRvcDowfTp7bGVmdDplLnBhZ2VYLWwubGVmdC1vLndpZHRoKCkvMix0b3A6ZS5wYWdlWS1sLnRvcC1vLmhlaWdodCgpLzItKHBhcnNlSW50KG8uY3NzKFwiYm9yZGVyVG9wV2lkdGhcIiksMTApfHwwKS0ocGFyc2VJbnQoby5jc3MoXCJib3JkZXJCb3R0b21XaWR0aFwiKSwxMCl8fDApKyhwYXJzZUludChvLmNzcyhcIm1hcmdpblRvcFwiKSwxMCl8fDApfSx0aGlzLmhhbmRsZXMuaGFzQ2xhc3MoXCJ1aS1zdGF0ZS1ob3ZlclwiKXx8dGhpcy5fc2xpZGUoZSxhLHMpLHRoaXMuX2FuaW1hdGVPZmY9ITAsITApKX0sX21vdXNlU3RhcnQ6ZnVuY3Rpb24oKXtyZXR1cm4hMH0sX21vdXNlRHJhZzpmdW5jdGlvbih0KXt2YXIgZT17eDp0LnBhZ2VYLHk6dC5wYWdlWX0saT10aGlzLl9ub3JtVmFsdWVGcm9tTW91c2UoZSk7cmV0dXJuIHRoaXMuX3NsaWRlKHQsdGhpcy5faGFuZGxlSW5kZXgsaSksITF9LF9tb3VzZVN0b3A6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX3JlbW92ZUNsYXNzKHRoaXMuaGFuZGxlcyxudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpLHRoaXMuX21vdXNlU2xpZGluZz0hMSx0aGlzLl9zdG9wKHQsdGhpcy5faGFuZGxlSW5kZXgpLHRoaXMuX2NoYW5nZSh0LHRoaXMuX2hhbmRsZUluZGV4KSx0aGlzLl9oYW5kbGVJbmRleD1udWxsLHRoaXMuX2NsaWNrT2Zmc2V0PW51bGwsdGhpcy5fYW5pbWF0ZU9mZj0hMSwhMX0sX2RldGVjdE9yaWVudGF0aW9uOmZ1bmN0aW9uKCl7dGhpcy5vcmllbnRhdGlvbj1cInZlcnRpY2FsXCI9PT10aGlzLm9wdGlvbnMub3JpZW50YXRpb24/XCJ2ZXJ0aWNhbFwiOlwiaG9yaXpvbnRhbFwifSxfbm9ybVZhbHVlRnJvbU1vdXNlOmZ1bmN0aW9uKHQpe3ZhciBlLGkscyxuLG87cmV0dXJuXCJob3Jpem9udGFsXCI9PT10aGlzLm9yaWVudGF0aW9uPyhlPXRoaXMuZWxlbWVudFNpemUud2lkdGgsaT10LngtdGhpcy5lbGVtZW50T2Zmc2V0LmxlZnQtKHRoaXMuX2NsaWNrT2Zmc2V0P3RoaXMuX2NsaWNrT2Zmc2V0LmxlZnQ6MCkpOihlPXRoaXMuZWxlbWVudFNpemUuaGVpZ2h0LGk9dC55LXRoaXMuZWxlbWVudE9mZnNldC50b3AtKHRoaXMuX2NsaWNrT2Zmc2V0P3RoaXMuX2NsaWNrT2Zmc2V0LnRvcDowKSkscz1pL2Uscz4xJiYocz0xKSwwPnMmJihzPTApLFwidmVydGljYWxcIj09PXRoaXMub3JpZW50YXRpb24mJihzPTEtcyksbj10aGlzLl92YWx1ZU1heCgpLXRoaXMuX3ZhbHVlTWluKCksbz10aGlzLl92YWx1ZU1pbigpK3Mqbix0aGlzLl90cmltQWxpZ25WYWx1ZShvKX0sX3VpSGFzaDpmdW5jdGlvbih0LGUsaSl7dmFyIHM9e2hhbmRsZTp0aGlzLmhhbmRsZXNbdF0saGFuZGxlSW5kZXg6dCx2YWx1ZTp2b2lkIDAhPT1lP2U6dGhpcy52YWx1ZSgpfTtyZXR1cm4gdGhpcy5faGFzTXVsdGlwbGVWYWx1ZXMoKSYmKHMudmFsdWU9dm9pZCAwIT09ZT9lOnRoaXMudmFsdWVzKHQpLHMudmFsdWVzPWl8fHRoaXMudmFsdWVzKCkpLHN9LF9oYXNNdWx0aXBsZVZhbHVlczpmdW5jdGlvbigpe3JldHVybiB0aGlzLm9wdGlvbnMudmFsdWVzJiZ0aGlzLm9wdGlvbnMudmFsdWVzLmxlbmd0aH0sX3N0YXJ0OmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuX3RyaWdnZXIoXCJzdGFydFwiLHQsdGhpcy5fdWlIYXNoKGUpKX0sX3NsaWRlOmZ1bmN0aW9uKHQsZSxpKXt2YXIgcyxuLG89dGhpcy52YWx1ZSgpLGE9dGhpcy52YWx1ZXMoKTt0aGlzLl9oYXNNdWx0aXBsZVZhbHVlcygpJiYobj10aGlzLnZhbHVlcyhlPzA6MSksbz10aGlzLnZhbHVlcyhlKSwyPT09dGhpcy5vcHRpb25zLnZhbHVlcy5sZW5ndGgmJnRoaXMub3B0aW9ucy5yYW5nZT09PSEwJiYoaT0wPT09ZT9NYXRoLm1pbihuLGkpOk1hdGgubWF4KG4saSkpLGFbZV09aSksaSE9PW8mJihzPXRoaXMuX3RyaWdnZXIoXCJzbGlkZVwiLHQsdGhpcy5fdWlIYXNoKGUsaSxhKSkscyE9PSExJiYodGhpcy5faGFzTXVsdGlwbGVWYWx1ZXMoKT90aGlzLnZhbHVlcyhlLGkpOnRoaXMudmFsdWUoaSkpKX0sX3N0b3A6ZnVuY3Rpb24odCxlKXt0aGlzLl90cmlnZ2VyKFwic3RvcFwiLHQsdGhpcy5fdWlIYXNoKGUpKX0sX2NoYW5nZTpmdW5jdGlvbih0LGUpe3RoaXMuX2tleVNsaWRpbmd8fHRoaXMuX21vdXNlU2xpZGluZ3x8KHRoaXMuX2xhc3RDaGFuZ2VkVmFsdWU9ZSx0aGlzLl90cmlnZ2VyKFwiY2hhbmdlXCIsdCx0aGlzLl91aUhhc2goZSkpKX0sdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIGFyZ3VtZW50cy5sZW5ndGg/KHRoaXMub3B0aW9ucy52YWx1ZT10aGlzLl90cmltQWxpZ25WYWx1ZSh0KSx0aGlzLl9yZWZyZXNoVmFsdWUoKSx0aGlzLl9jaGFuZ2UobnVsbCwwKSx2b2lkIDApOnRoaXMuX3ZhbHVlKCl9LHZhbHVlczpmdW5jdGlvbihlLGkpe3ZhciBzLG4sbztpZihhcmd1bWVudHMubGVuZ3RoPjEpcmV0dXJuIHRoaXMub3B0aW9ucy52YWx1ZXNbZV09dGhpcy5fdHJpbUFsaWduVmFsdWUoaSksdGhpcy5fcmVmcmVzaFZhbHVlKCksdGhpcy5fY2hhbmdlKG51bGwsZSksdm9pZCAwO2lmKCFhcmd1bWVudHMubGVuZ3RoKXJldHVybiB0aGlzLl92YWx1ZXMoKTtpZighdC5pc0FycmF5KGFyZ3VtZW50c1swXSkpcmV0dXJuIHRoaXMuX2hhc011bHRpcGxlVmFsdWVzKCk/dGhpcy5fdmFsdWVzKGUpOnRoaXMudmFsdWUoKTtmb3Iocz10aGlzLm9wdGlvbnMudmFsdWVzLG49YXJndW1lbnRzWzBdLG89MDtzLmxlbmd0aD5vO28rPTEpc1tvXT10aGlzLl90cmltQWxpZ25WYWx1ZShuW29dKSx0aGlzLl9jaGFuZ2UobnVsbCxvKTt0aGlzLl9yZWZyZXNoVmFsdWUoKX0sX3NldE9wdGlvbjpmdW5jdGlvbihlLGkpe3ZhciBzLG49MDtzd2l0Y2goXCJyYW5nZVwiPT09ZSYmdGhpcy5vcHRpb25zLnJhbmdlPT09ITAmJihcIm1pblwiPT09aT8odGhpcy5vcHRpb25zLnZhbHVlPXRoaXMuX3ZhbHVlcygwKSx0aGlzLm9wdGlvbnMudmFsdWVzPW51bGwpOlwibWF4XCI9PT1pJiYodGhpcy5vcHRpb25zLnZhbHVlPXRoaXMuX3ZhbHVlcyh0aGlzLm9wdGlvbnMudmFsdWVzLmxlbmd0aC0xKSx0aGlzLm9wdGlvbnMudmFsdWVzPW51bGwpKSx0LmlzQXJyYXkodGhpcy5vcHRpb25zLnZhbHVlcykmJihuPXRoaXMub3B0aW9ucy52YWx1ZXMubGVuZ3RoKSx0aGlzLl9zdXBlcihlLGkpLGUpe2Nhc2VcIm9yaWVudGF0aW9uXCI6dGhpcy5fZGV0ZWN0T3JpZW50YXRpb24oKSx0aGlzLl9yZW1vdmVDbGFzcyhcInVpLXNsaWRlci1ob3Jpem9udGFsIHVpLXNsaWRlci12ZXJ0aWNhbFwiKS5fYWRkQ2xhc3MoXCJ1aS1zbGlkZXItXCIrdGhpcy5vcmllbnRhdGlvbiksdGhpcy5fcmVmcmVzaFZhbHVlKCksdGhpcy5vcHRpb25zLnJhbmdlJiZ0aGlzLl9yZWZyZXNoUmFuZ2UoaSksdGhpcy5oYW5kbGVzLmNzcyhcImhvcml6b250YWxcIj09PWk/XCJib3R0b21cIjpcImxlZnRcIixcIlwiKTticmVhaztjYXNlXCJ2YWx1ZVwiOnRoaXMuX2FuaW1hdGVPZmY9ITAsdGhpcy5fcmVmcmVzaFZhbHVlKCksdGhpcy5fY2hhbmdlKG51bGwsMCksdGhpcy5fYW5pbWF0ZU9mZj0hMTticmVhaztjYXNlXCJ2YWx1ZXNcIjpmb3IodGhpcy5fYW5pbWF0ZU9mZj0hMCx0aGlzLl9yZWZyZXNoVmFsdWUoKSxzPW4tMTtzPj0wO3MtLSl0aGlzLl9jaGFuZ2UobnVsbCxzKTt0aGlzLl9hbmltYXRlT2ZmPSExO2JyZWFrO2Nhc2VcInN0ZXBcIjpjYXNlXCJtaW5cIjpjYXNlXCJtYXhcIjp0aGlzLl9hbmltYXRlT2ZmPSEwLHRoaXMuX2NhbGN1bGF0ZU5ld01heCgpLHRoaXMuX3JlZnJlc2hWYWx1ZSgpLHRoaXMuX2FuaW1hdGVPZmY9ITE7YnJlYWs7Y2FzZVwicmFuZ2VcIjp0aGlzLl9hbmltYXRlT2ZmPSEwLHRoaXMuX3JlZnJlc2goKSx0aGlzLl9hbmltYXRlT2ZmPSExfX0sX3NldE9wdGlvbkRpc2FibGVkOmZ1bmN0aW9uKHQpe3RoaXMuX3N1cGVyKHQpLHRoaXMuX3RvZ2dsZUNsYXNzKG51bGwsXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiLCEhdCl9LF92YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy52YWx1ZTtyZXR1cm4gdD10aGlzLl90cmltQWxpZ25WYWx1ZSh0KX0sX3ZhbHVlczpmdW5jdGlvbih0KXt2YXIgZSxpLHM7aWYoYXJndW1lbnRzLmxlbmd0aClyZXR1cm4gZT10aGlzLm9wdGlvbnMudmFsdWVzW3RdLGU9dGhpcy5fdHJpbUFsaWduVmFsdWUoZSk7aWYodGhpcy5faGFzTXVsdGlwbGVWYWx1ZXMoKSl7Zm9yKGk9dGhpcy5vcHRpb25zLnZhbHVlcy5zbGljZSgpLHM9MDtpLmxlbmd0aD5zO3MrPTEpaVtzXT10aGlzLl90cmltQWxpZ25WYWx1ZShpW3NdKTtyZXR1cm4gaX1yZXR1cm5bXX0sX3RyaW1BbGlnblZhbHVlOmZ1bmN0aW9uKHQpe2lmKHRoaXMuX3ZhbHVlTWluKCk+PXQpcmV0dXJuIHRoaXMuX3ZhbHVlTWluKCk7aWYodD49dGhpcy5fdmFsdWVNYXgoKSlyZXR1cm4gdGhpcy5fdmFsdWVNYXgoKTt2YXIgZT10aGlzLm9wdGlvbnMuc3RlcD4wP3RoaXMub3B0aW9ucy5zdGVwOjEsaT0odC10aGlzLl92YWx1ZU1pbigpKSVlLHM9dC1pO3JldHVybiAyKk1hdGguYWJzKGkpPj1lJiYocys9aT4wP2U6LWUpLHBhcnNlRmxvYXQocy50b0ZpeGVkKDUpKX0sX2NhbGN1bGF0ZU5ld01heDpmdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy5tYXgsZT10aGlzLl92YWx1ZU1pbigpLGk9dGhpcy5vcHRpb25zLnN0ZXAscz1NYXRoLnJvdW5kKCh0LWUpL2kpKmk7dD1zK2UsdD50aGlzLm9wdGlvbnMubWF4JiYodC09aSksdGhpcy5tYXg9cGFyc2VGbG9hdCh0LnRvRml4ZWQodGhpcy5fcHJlY2lzaW9uKCkpKX0sX3ByZWNpc2lvbjpmdW5jdGlvbigpe3ZhciB0PXRoaXMuX3ByZWNpc2lvbk9mKHRoaXMub3B0aW9ucy5zdGVwKTtyZXR1cm4gbnVsbCE9PXRoaXMub3B0aW9ucy5taW4mJih0PU1hdGgubWF4KHQsdGhpcy5fcHJlY2lzaW9uT2YodGhpcy5vcHRpb25zLm1pbikpKSx0fSxfcHJlY2lzaW9uT2Y6ZnVuY3Rpb24odCl7dmFyIGU9XCJcIit0LGk9ZS5pbmRleE9mKFwiLlwiKTtyZXR1cm4tMT09PWk/MDplLmxlbmd0aC1pLTF9LF92YWx1ZU1pbjpmdW5jdGlvbigpe3JldHVybiB0aGlzLm9wdGlvbnMubWlufSxfdmFsdWVNYXg6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5tYXh9LF9yZWZyZXNoUmFuZ2U6ZnVuY3Rpb24odCl7XCJ2ZXJ0aWNhbFwiPT09dCYmdGhpcy5yYW5nZS5jc3Moe3dpZHRoOlwiXCIsbGVmdDpcIlwifSksXCJob3Jpem9udGFsXCI9PT10JiZ0aGlzLnJhbmdlLmNzcyh7aGVpZ2h0OlwiXCIsYm90dG9tOlwiXCJ9KX0sX3JlZnJlc2hWYWx1ZTpmdW5jdGlvbigpe3ZhciBlLGkscyxuLG8sYT10aGlzLm9wdGlvbnMucmFuZ2Uscj10aGlzLm9wdGlvbnMsbD10aGlzLGg9dGhpcy5fYW5pbWF0ZU9mZj8hMTpyLmFuaW1hdGUsYz17fTt0aGlzLl9oYXNNdWx0aXBsZVZhbHVlcygpP3RoaXMuaGFuZGxlcy5lYWNoKGZ1bmN0aW9uKHMpe2k9MTAwKigobC52YWx1ZXMocyktbC5fdmFsdWVNaW4oKSkvKGwuX3ZhbHVlTWF4KCktbC5fdmFsdWVNaW4oKSkpLGNbXCJob3Jpem9udGFsXCI9PT1sLm9yaWVudGF0aW9uP1wibGVmdFwiOlwiYm90dG9tXCJdPWkrXCIlXCIsdCh0aGlzKS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXShjLHIuYW5pbWF0ZSksbC5vcHRpb25zLnJhbmdlPT09ITAmJihcImhvcml6b250YWxcIj09PWwub3JpZW50YXRpb24/KDA9PT1zJiZsLnJhbmdlLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHtsZWZ0OmkrXCIlXCJ9LHIuYW5pbWF0ZSksMT09PXMmJmwucmFuZ2VbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7d2lkdGg6aS1lK1wiJVwifSx7cXVldWU6ITEsZHVyYXRpb246ci5hbmltYXRlfSkpOigwPT09cyYmbC5yYW5nZS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7Ym90dG9tOmkrXCIlXCJ9LHIuYW5pbWF0ZSksMT09PXMmJmwucmFuZ2VbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7aGVpZ2h0OmktZStcIiVcIn0se3F1ZXVlOiExLGR1cmF0aW9uOnIuYW5pbWF0ZX0pKSksZT1pfSk6KHM9dGhpcy52YWx1ZSgpLG49dGhpcy5fdmFsdWVNaW4oKSxvPXRoaXMuX3ZhbHVlTWF4KCksaT1vIT09bj8xMDAqKChzLW4pLyhvLW4pKTowLGNbXCJob3Jpem9udGFsXCI9PT10aGlzLm9yaWVudGF0aW9uP1wibGVmdFwiOlwiYm90dG9tXCJdPWkrXCIlXCIsdGhpcy5oYW5kbGUuc3RvcCgxLDEpW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oYyxyLmFuaW1hdGUpLFwibWluXCI9PT1hJiZcImhvcml6b250YWxcIj09PXRoaXMub3JpZW50YXRpb24mJnRoaXMucmFuZ2Uuc3RvcCgxLDEpW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe3dpZHRoOmkrXCIlXCJ9LHIuYW5pbWF0ZSksXCJtYXhcIj09PWEmJlwiaG9yaXpvbnRhbFwiPT09dGhpcy5vcmllbnRhdGlvbiYmdGhpcy5yYW5nZS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7d2lkdGg6MTAwLWkrXCIlXCJ9LHIuYW5pbWF0ZSksXCJtaW5cIj09PWEmJlwidmVydGljYWxcIj09PXRoaXMub3JpZW50YXRpb24mJnRoaXMucmFuZ2Uuc3RvcCgxLDEpW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe2hlaWdodDppK1wiJVwifSxyLmFuaW1hdGUpLFwibWF4XCI9PT1hJiZcInZlcnRpY2FsXCI9PT10aGlzLm9yaWVudGF0aW9uJiZ0aGlzLnJhbmdlLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHtoZWlnaHQ6MTAwLWkrXCIlXCJ9LHIuYW5pbWF0ZSkpfSxfaGFuZGxlRXZlbnRzOntrZXlkb3duOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbixvLGE9dChlLnRhcmdldCkuZGF0YShcInVpLXNsaWRlci1oYW5kbGUtaW5kZXhcIik7c3dpdGNoKGUua2V5Q29kZSl7Y2FzZSB0LnVpLmtleUNvZGUuSE9NRTpjYXNlIHQudWkua2V5Q29kZS5FTkQ6Y2FzZSB0LnVpLmtleUNvZGUuUEFHRV9VUDpjYXNlIHQudWkua2V5Q29kZS5QQUdFX0RPV046Y2FzZSB0LnVpLmtleUNvZGUuVVA6Y2FzZSB0LnVpLmtleUNvZGUuUklHSFQ6Y2FzZSB0LnVpLmtleUNvZGUuRE9XTjpjYXNlIHQudWkua2V5Q29kZS5MRUZUOmlmKGUucHJldmVudERlZmF1bHQoKSwhdGhpcy5fa2V5U2xpZGluZyYmKHRoaXMuX2tleVNsaWRpbmc9ITAsdGhpcy5fYWRkQ2xhc3ModChlLnRhcmdldCksbnVsbCxcInVpLXN0YXRlLWFjdGl2ZVwiKSxpPXRoaXMuX3N0YXJ0KGUsYSksaT09PSExKSlyZXR1cm59c3dpdGNoKG89dGhpcy5vcHRpb25zLnN0ZXAscz1uPXRoaXMuX2hhc011bHRpcGxlVmFsdWVzKCk/dGhpcy52YWx1ZXMoYSk6dGhpcy52YWx1ZSgpLGUua2V5Q29kZSl7Y2FzZSB0LnVpLmtleUNvZGUuSE9NRTpuPXRoaXMuX3ZhbHVlTWluKCk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRU5EOm49dGhpcy5fdmFsdWVNYXgoKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5QQUdFX1VQOm49dGhpcy5fdHJpbUFsaWduVmFsdWUocysodGhpcy5fdmFsdWVNYXgoKS10aGlzLl92YWx1ZU1pbigpKS90aGlzLm51bVBhZ2VzKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5QQUdFX0RPV046bj10aGlzLl90cmltQWxpZ25WYWx1ZShzLSh0aGlzLl92YWx1ZU1heCgpLXRoaXMuX3ZhbHVlTWluKCkpL3RoaXMubnVtUGFnZXMpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlVQOmNhc2UgdC51aS5rZXlDb2RlLlJJR0hUOmlmKHM9PT10aGlzLl92YWx1ZU1heCgpKXJldHVybjtuPXRoaXMuX3RyaW1BbGlnblZhbHVlKHMrbyk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRE9XTjpjYXNlIHQudWkua2V5Q29kZS5MRUZUOmlmKHM9PT10aGlzLl92YWx1ZU1pbigpKXJldHVybjtuPXRoaXMuX3RyaW1BbGlnblZhbHVlKHMtbyl9dGhpcy5fc2xpZGUoZSxhLG4pfSxrZXl1cDpmdW5jdGlvbihlKXt2YXIgaT10KGUudGFyZ2V0KS5kYXRhKFwidWktc2xpZGVyLWhhbmRsZS1pbmRleFwiKTt0aGlzLl9rZXlTbGlkaW5nJiYodGhpcy5fa2V5U2xpZGluZz0hMSx0aGlzLl9zdG9wKGUsaSksdGhpcy5fY2hhbmdlKGUsaSksdGhpcy5fcmVtb3ZlQ2xhc3ModChlLnRhcmdldCksbnVsbCxcInVpLXN0YXRlLWFjdGl2ZVwiKSl9fX0pfSk7IiwidmFyIHNkVG9vbHRpcCA9IChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgdmFyIHRvb2x0aXBUaW1lT3V0ID0gbnVsbDtcclxuICAgIHZhciBkaXNwbGF5VGltZU92ZXIgPSAwO1xyXG4gICAgdmFyIGRpc3BsYXlUaW1lQ2xpY2sgPSAzMDAwO1xyXG4gICAgdmFyIGhpZGVUaW1lID0gMTAwO1xyXG4gICAgdmFyIGFycm93ID0gMTA7XHJcbiAgICB2YXIgYXJyb3dXaWR0aCA9IDg7XHJcbiAgICB2YXIgdG9vbHRpcDtcclxuICAgIHZhciBzaXplID0gJ3NtYWxsJztcclxuICAgIHZhciBoaWRlQ2xhc3MgPSAnaGlkZGVuJztcclxuICAgIHZhciB0b29sdGlwRWxlbWVudHM7XHJcbiAgICB2YXIgY3VycmVudEVsZW1lbnQ7XHJcblxyXG4gICAgZnVuY3Rpb24gdG9vbHRpcEluaXQoKSB7XHJcbiAgICAgICAgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ3RpcHNvX2J1YmJsZScpLmFkZENsYXNzKHNpemUpLmFkZENsYXNzKGhpZGVDbGFzcylcclxuICAgICAgICAgICAgLmh0bWwoJzxkaXYgY2xhc3M9XCJ0aXBzb19hcnJvd1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXRzb190aXRsZVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXBzb19jb250ZW50XCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgJCh0b29sdGlwKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgY2hlY2tNb3VzZVBvcyhlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHRvb2x0aXApLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBjaGVja01vdXNlUG9zKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJ2JvZHknKS5hcHBlbmQodG9vbHRpcCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2hlY2tNb3VzZVBvcyhlKSB7XHJcbiAgICAgICAgaWYgKGUuY2xpZW50WCA+ICQoY3VycmVudEVsZW1lbnQpLm9mZnNldCgpLmxlZnQgJiYgZS5jbGllbnRYIDwgJChjdXJyZW50RWxlbWVudCkub2Zmc2V0KCkubGVmdCArICQoY3VycmVudEVsZW1lbnQpLm91dGVyV2lkdGgoKVxyXG4gICAgICAgICAgICAmJiBlLmNsaWVudFkgPiAkKGN1cnJlbnRFbGVtZW50KS5vZmZzZXQoKS50b3AgJiYgZS5jbGllbnRZIDwgJChjdXJyZW50RWxlbWVudCkub2Zmc2V0KCkudG9wICsgJChjdXJyZW50RWxlbWVudCkub3V0ZXJIZWlnaHQoKSkge1xyXG4gICAgICAgICAgICB0b29sdGlwU2hvdyhjdXJyZW50RWxlbWVudCwgZGlzcGxheVRpbWVPdmVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdG9vbHRpcFNob3coZWxlbSwgZGlzcGxheVRpbWUpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodG9vbHRpcFRpbWVPdXQpO1xyXG5cclxuICAgICAgICB2YXIgdGl0bGUgPSAkKGVsZW0pLmRhdGEoJ29yaWdpbmFsLXRpdGxlJyk7XHJcbiAgICAgICAgdmFyIGh0bWwgPSAkKCcjJyskKGVsZW0pLmRhdGEoJ29yaWdpbmFsLWh0bWwnKSkuaHRtbCgpO1xyXG4gICAgICAgIGlmIChodG1sKSB7XHJcbiAgICAgICAgICAgIHRpdGxlID0gaHRtbDtcclxuICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndGlwc29fYnViYmxlX2h0bWwnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKCd0aXBzb19idWJibGVfaHRtbCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcG9zaXRpb24gPSAkKGVsZW0pLmRhdGEoJ3BsYWNlbWVudCcpIHx8ICdib3R0b20nO1xyXG4gICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyIGJvdHRvbV9yaWdodF9jb3JuZXIgdG9wX2xlZnRfY29ybmVyIGJvdHRvbV9sZWZ0X2Nvcm5lclwiKTtcclxuXHJcbiAgICAgICAgJCh0b29sdGlwKS5maW5kKCcudGl0c29fdGl0bGUnKS5odG1sKHRpdGxlKTtcclxuICAgICAgICBzZXRQb3NpdG9uKGVsZW0sIHBvc2l0aW9uKTtcclxuICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKGhpZGVDbGFzcyk7XHJcbiAgICAgICAgY3VycmVudEVsZW1lbnQgPSBlbGVtO1xyXG5cclxuICAgICAgICBpZiAoZGlzcGxheVRpbWUgPiAwKSB7XHJcbiAgICAgICAgICAgIHRvb2x0aXBUaW1lT3V0ID0gc2V0VGltZW91dCh0b29sdGlwSGlkZSwgZGlzcGxheVRpbWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHRvb2x0aXBIaWRlKCkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0b29sdGlwVGltZU91dCk7XHJcbiAgICAgICAgdG9vbHRpcFRpbWVPdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoaGlkZUNsYXNzKTtcclxuICAgICAgICB9LCBoaWRlVGltZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0UG9zaXRvbihlbGVtLCBwb3NpdGlvbil7XHJcbiAgICAgICAgdmFyICRlID0gJChlbGVtKTtcclxuICAgICAgICB2YXIgJHdpbiA9ICQod2luZG93KTtcclxuICAgICAgICB2YXIgY3VzdG9tVG9wID0gJChlbGVtKS5kYXRhKCd0b3AnKTsvL9C30LDQtNCw0L3QsCDQv9C+0LfQuNGG0LjRjyDQstC90YPRgtGA0Lgg0Y3Qu9C10LzQtdC90YLQsFxyXG4gICAgICAgIHZhciBjdXN0b21MZWZ0ID0gJChlbGVtKS5kYXRhKCdsZWZ0Jyk7Ly/Qt9Cw0LTQsNC90LAg0L/QvtC30LjRhtC40Y8g0LLQvdGD0YLRgNC4INGN0LvQtdC80LXQvdGC0LBcclxuICAgICAgICB2YXIgbm9yZXZlcnQgPSAkKGVsZW0pLmRhdGEoJ25vcmV2ZXJ0Jyk7Ly/QvdC1INC/0LXRgNC10LLQvtGA0LDRh9C40LLQsNGC0YxcclxuICAgICAgICBzd2l0Y2gocG9zaXRpb24pIHtcclxuICAgICAgICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgICAgICAgICAgIHBvc19sZWZ0ID0gJGUub2Zmc2V0KCkubGVmdCArIChjdXN0b21MZWZ0ID8gY3VzdG9tTGVmdCA6ICRlLm91dGVyV2lkdGgoKSAvIDIpIC0gJCh0b29sdGlwKS5vdXRlcldpZHRoKCkgLyAyO1xyXG4gICAgICAgICAgICAgICAgcG9zX3RvcCA9ICRlLm9mZnNldCgpLnRvcCAtICQodG9vbHRpcCkub3V0ZXJIZWlnaHQoKSArIChjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAwKSAtIGFycm93O1xyXG4gICAgICAgICAgICAgICAgJCh0b29sdGlwKS5maW5kKCcudGlwc29fYXJyb3cnKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQ6IC1hcnJvd1dpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJydcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKChwb3NfdG9wIDwgJHdpbi5zY3JvbGxUb3AoKSkgJiYgIW5vcmV2ZXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zX3RvcCA9ICRlLm9mZnNldCgpLnRvcCArKGN1c3RvbVRvcCA/IGN1c3RvbVRvcCA6ICRlLm91dGVySGVpZ2h0KCkpICsgYXJyb3c7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygnYm90dG9tJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKCd0b3AgYm90dG9tIGxlZnQgcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCd0b3AnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICAgICAgcG9zX2xlZnQgPSAkZS5vZmZzZXQoKS5sZWZ0ICsgKGN1c3RvbUxlZnQgPyBjdXN0b21MZWZ0IDogJGUub3V0ZXJXaWR0aCgpIC8gMikgLSAkKHRvb2x0aXApLm91dGVyV2lkdGgoKSAvIDI7XHJcbiAgICAgICAgICAgICAgICBwb3NfdG9wID0gJGUub2Zmc2V0KCkudG9wICsgKGN1c3RvbVRvcCA/IGN1c3RvbVRvcCA6ICRlLm91dGVySGVpZ2h0KCkpICsgYXJyb3c7XHJcbiAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmZpbmQoJy50aXBzb19hcnJvdycpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogLWFycm93V2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHBvc190b3AgKyAkKHRvb2x0aXApLmhlaWdodCgpID4gJHdpbi5zY3JvbGxUb3AoKSArICR3aW4ub3V0ZXJIZWlnaHQoKSkgJiYgIW5vcmV2ZXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zX3RvcCA9ICRlLm9mZnNldCgpLnRvcCAtICQodG9vbHRpcCkuaGVpZ2h0KCkgKyAoY3VzdG9tVG9wID8gY3VzdG9tVG9wIDogMCkgLSBhcnJvdztcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKCd0b3AgYm90dG9tIGxlZnQgcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCd0b3AnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ2JvdHRvbScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQodG9vbHRpcCkuY3NzKHtcclxuICAgICAgICAgICAgbGVmdDogIHBvc19sZWZ0LFxyXG4gICAgICAgICAgICB0b3A6IHBvc190b3BcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRFdmVudHMoKSB7XHJcblxyXG4gICAgICAgIHRvb2x0aXBFbGVtZW50cyA9ICQoJ1tkYXRhLXRvZ2dsZT10b29sdGlwXScpO1xyXG5cclxuICAgICAgICB0b29sdGlwRWxlbWVudHMub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKCQodGhpcykuZGF0YSgnY2xpY2thYmxlJykpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkKHRvb2x0aXApLmhhc0NsYXNzKGhpZGVDbGFzcykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwU2hvdyh0aGlzLCBkaXNwbGF5VGltZUNsaWNrKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcEhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPj0gMTAyNCkge1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcFNob3codGhpcywgZGlzcGxheVRpbWVPdmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRvb2x0aXBFbGVtZW50cy5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IDEwMjQpIHtcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBTaG93KHRoaXMsIGRpc3BsYXlUaW1lT3Zlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0b29sdGlwRWxlbWVudHMub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoKXtcclxuICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IDEwMjQpIHtcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBIaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyAgICAgdG9vbHRpcEluaXQoKTtcclxuICAgIC8vICAgICBzZXRFdmVudHMoKTtcclxuICAgIC8vIH0pO1xyXG4gICAgLy9cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaW5pdDogdG9vbHRpcEluaXQsXHJcbiAgICAgICAgc2V0RXZlbnRzOiBzZXRFdmVudHNcclxuICAgIH1cclxufSkoKTtcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgc2RUb29sdGlwLmluaXQoKTtcclxuICAgIHNkVG9vbHRpcC5zZXRFdmVudHMoKTtcclxufSk7XHJcblxyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gIHZhciAkbm90eWZpX2J0biA9ICQoJy5oZWFkZXItbG9nb19ub3R5Jyk7XHJcbiAgaWYgKCRub3R5ZmlfYnRuLmxlbmd0aCA9PSAwKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvL3ZhciBocmVmID0gJy8nK2xhbmcuaHJlZl9wcmVmaXgrJ2FjY291bnQvbm90aWZpY2F0aW9uJztcclxuICB2YXIgaHJlZiA9ICAkKCcjYWNjb3VudF9ub3RpZmljYXRpb25zX2xpbmsnKS5hdHRyKCdocmVmJyk7XHJcblxyXG4gICQuZ2V0KGhyZWYsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEubm90aWZpY2F0aW9ucyB8fCBkYXRhLm5vdGlmaWNhdGlvbnMubGVuZ3RoID09IDApIHJldHVybjtcclxuXHJcbiAgICB2YXIgb3V0ID0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktYm94PjxkaXYgY2xhc3M9aGVhZGVyLW5vdHktYm94LWlubmVyPjx1bCBjbGFzcz1cImhlYWRlci1ub3R5LWxpc3RcIj4nO1xyXG4gICAgJG5vdHlmaV9idG4uZmluZCgnYScpLnJlbW92ZUF0dHIoJ2hyZWYnKTtcclxuICAgIHZhciBoYXNfbmV3ID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBlbCA9IGRhdGEubm90aWZpY2F0aW9uc1tpXTtcclxuICAgICAgdmFyIGlzX25ldyA9IChlbC5pc192aWV3ZWQgPT0gMCAmJiBlbC50eXBlX2lkID09IDIpO1xyXG4gICAgICBvdXQgKz0gJzxsaSBjbGFzcz1cImhlYWRlci1ub3R5LWl0ZW0nICsgKGlzX25ldyA/ICcgaGVhZGVyLW5vdHktaXRlbV9uZXcnIDogJycpICsgJ1wiPic7XHJcbiAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1oZWFkZXItbm90eS1kYXRhPicgKyBlbC5kYXRhICsgJzwvZGl2Pic7XHJcbiAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1oZWFkZXItbm90eS10ZXh0PicgKyBlbC50ZXh0ICsgJzwvZGl2Pic7XHJcbiAgICAgIG91dCArPSAnPC9saT4nO1xyXG4gICAgICBoYXNfbmV3ID0gaGFzX25ldyB8fCBpc19uZXc7XHJcbiAgICB9XHJcblxyXG4gICAgb3V0ICs9ICc8L3VsPic7XHJcbiAgICBvdXQgKz0gJzxhIGNsYXNzPVwiYnRuIGhlYWRlci1ub3R5LWJveC1idG5cIiBocmVmPVwiJytocmVmKydcIj4nICsgZGF0YS5idG4gKyAnPC9hPic7XHJcbiAgICBvdXQgKz0gJzwvZGl2PjwvZGl2Pic7XHJcbiAgICAkKCcuaGVhZGVyJykuYXBwZW5kKG91dCk7XHJcblxyXG4gICAgaWYgKGhhc19uZXcpIHtcclxuICAgICAgJG5vdHlmaV9idG4uYWRkQ2xhc3MoJ3Rvb2x0aXAnKS5hZGRDbGFzcygnaGFzLW5vdHknKTtcclxuICAgIH1cclxuXHJcbiAgICAkbm90eWZpX2J0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICB2YXIgaHJlZiA9ICAkKCcjYWNjb3VudF9ub3RpZmljYXRpb25zX2xpbmsnKS5hdHRyKCdocmVmJyk7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgaWYgKCQoJy5oZWFkZXItbm90eS1ib3gnKS5oYXNDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKSkge1xyXG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5yZW1vdmVDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykuYWRkQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XHJcbiAgICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XHJcblxyXG4gICAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdoYXMtbm90eScpKSB7XHJcbiAgICAgICAgICAkLnBvc3QoaHJlZiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuaGVhZGVyLWxvZ29fbm90eScpLnJlbW92ZUNsYXNzKCd0b29sdGlwJykucmVtb3ZlQ2xhc3MoJ2hhcy1ub3R5Jyk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLW5vdHktYm94Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xyXG4gICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5oZWFkZXItbm90eS1saXN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KVxyXG4gIH0sICdqc29uJyk7XHJcblxyXG59KSgpO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pZiAodHlwZW9mIG1paGFpbGRldiA9PSBcInVuZGVmaW5lZFwiIHx8ICFtaWhhaWxkZXYpIHtcclxuICAgIHZhciBtaWhhaWxkZXYgPSB7fTtcclxuICAgIG1paGFpbGRldi5lbEZpbmRlciA9IHtcclxuICAgICAgICBvcGVuTWFuYWdlcjogZnVuY3Rpb24ob3B0aW9ucyl7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSBcIm1lbnViYXI9bm8sdG9vbGJhcj1ubyxsb2NhdGlvbj1ubyxkaXJlY3Rvcmllcz1ubyxzdGF0dXM9bm8sZnVsbHNjcmVlbj1ub1wiO1xyXG4gICAgICAgICAgICBpZihvcHRpb25zLndpZHRoID09ICdhdXRvJyl7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLndpZHRoID0gJCh3aW5kb3cpLndpZHRoKCkvMS41O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihvcHRpb25zLmhlaWdodCA9PSAnYXV0bycpe1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5oZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCkvMS41O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMgKyBcIix3aWR0aD1cIiArIG9wdGlvbnMud2lkdGg7XHJcbiAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcyArIFwiLGhlaWdodD1cIiArIG9wdGlvbnMuaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhwYXJhbXMpO1xyXG4gICAgICAgICAgICB2YXIgd2luID0gd2luZG93Lm9wZW4ob3B0aW9ucy51cmwsICdFbEZpbmRlck1hbmFnZXInICsgb3B0aW9ucy5pZCwgcGFyYW1zKTtcclxuICAgICAgICAgICAgd2luLmZvY3VzKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uczoge30sXHJcbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGlkLCBmdW5jKXtcclxuICAgICAgICAgICAgdGhpcy5mdW5jdGlvbnNbaWRdID0gZnVuYztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNhbGxGdW5jdGlvbjogZnVuY3Rpb24oaWQsIGZpbGUpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mdW5jdGlvbnNbaWRdKGZpbGUsIGlkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uUmV0dXJuVG9JbnB1dDogZnVuY3Rpb24oZmlsZSwgaWQpe1xyXG4gICAgICAgICAgICBqUXVlcnkoJyMnICsgaWQpLnZhbChmaWxlLnVybCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG59XHJcblxyXG5cclxuXHJcbnZhciBtZWdhc2xpZGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgc2xpZGVyX2RhdGEgPSBmYWxzZTtcclxuICB2YXIgY29udGFpbmVyX2lkID0gXCJzZWN0aW9uI21lZ2Ffc2xpZGVyXCI7XHJcbiAgdmFyIHBhcmFsbGF4X2dyb3VwID0gZmFsc2U7XHJcbiAgdmFyIHBhcmFsbGF4X3RpbWVyID0gZmFsc2U7XHJcbiAgdmFyIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xyXG4gIHZhciBwYXJhbGxheF9kID0gMTtcclxuICB2YXIgbW9iaWxlX21vZGUgPSAtMTtcclxuICB2YXIgbWF4X3RpbWVfbG9hZF9waWMgPSAzMDA7XHJcbiAgdmFyIG1vYmlsZV9zaXplID0gNzAwO1xyXG4gIHZhciByZW5kZXJfc2xpZGVfbm9tID0gMDtcclxuICB2YXIgdG90X2ltZ193YWl0O1xyXG4gIHZhciBzbGlkZXM7XHJcbiAgdmFyIHNsaWRlX3NlbGVjdF9ib3g7XHJcbiAgdmFyIGVkaXRvcjtcclxuICB2YXIgdGltZW91dElkO1xyXG4gIHZhciBzY3JvbGxfcGVyaW9kID0gNjAwMDtcclxuXHJcbiAgdmFyIHBvc0FyciA9IFtcclxuICAgICdzbGlkZXJfX3RleHQtbHQnLCAnc2xpZGVyX190ZXh0LWN0JywgJ3NsaWRlcl9fdGV4dC1ydCcsXHJcbiAgICAnc2xpZGVyX190ZXh0LWxjJywgJ3NsaWRlcl9fdGV4dC1jYycsICdzbGlkZXJfX3RleHQtcmMnLFxyXG4gICAgJ3NsaWRlcl9fdGV4dC1sYicsICdzbGlkZXJfX3RleHQtY2InLCAnc2xpZGVyX190ZXh0LXJiJyxcclxuICBdO1xyXG4gIHZhciBwb3NfbGlzdCA9IFtcclxuICAgICfQm9C10LLQviDQstC10YDRhScsICfRhtC10L3RgtGAINCy0LXRgNGFJywgJ9C/0YDQsNCy0L4g0LLQtdGA0YUnLFxyXG4gICAgJ9Cb0LXQstC+INGG0LXQvdGC0YAnLCAn0YbQtdC90YLRgCcsICfQv9GA0LDQstC+INGG0LXQvdGC0YAnLFxyXG4gICAgJ9Cb0LXQstC+INC90LjQtycsICfRhtC10L3RgtGAINC90LjQtycsICfQv9GA0LDQstC+INC90LjQtycsXHJcbiAgXTtcclxuICB2YXIgc2hvd19kZWxheSA9IFtcclxuICAgICdzaG93X25vX2RlbGF5JyxcclxuICAgICdzaG93X2RlbGF5XzA1JyxcclxuICAgICdzaG93X2RlbGF5XzEwJyxcclxuICAgICdzaG93X2RlbGF5XzE1JyxcclxuICAgICdzaG93X2RlbGF5XzIwJyxcclxuICAgICdzaG93X2RlbGF5XzI1JyxcclxuICAgICdzaG93X2RlbGF5XzMwJ1xyXG4gIF07XHJcbiAgdmFyIGhpZGVfZGVsYXkgPSBbXHJcbiAgICAnaGlkZV9ub19kZWxheScsXHJcbiAgICAnaGlkZV9kZWxheV8wNScsXHJcbiAgICAnaGlkZV9kZWxheV8xMCcsXHJcbiAgICAnaGlkZV9kZWxheV8xNScsXHJcbiAgICAnaGlkZV9kZWxheV8yMCdcclxuICBdO1xyXG4gIHZhciB5ZXNfbm9fYXJyID0gW1xyXG4gICAgJ25vJyxcclxuICAgICd5ZXMnXHJcbiAgXTtcclxuICB2YXIgeWVzX25vX3ZhbCA9IFtcclxuICAgICcnLFxyXG4gICAgJ2ZpeGVkX19mdWxsLWhlaWdodCdcclxuICBdO1xyXG4gIHZhciBidG5fc3R5bGUgPSBbXHJcbiAgICAnbm9uZScsXHJcbiAgICAnYm9yZG8nLFxyXG4gICAgJ2JsYWNrJyxcclxuICAgICdibHVlJyxcclxuICAgICdkYXJrLWJsdWUnLFxyXG4gICAgJ3JlZCcsXHJcbiAgICAnb3JhbmdlJyxcclxuICAgICdncmVlbicsXHJcbiAgICAnbGlnaHQtZ3JlZW4nLFxyXG4gICAgJ2RhcmstZ3JlZW4nLFxyXG4gICAgJ3BpbmsnLFxyXG4gICAgJ3llbGxvdydcclxuICBdO1xyXG4gIHZhciBzaG93X2FuaW1hdGlvbnMgPSBbXHJcbiAgICBcIm5vdF9hbmltYXRlXCIsXHJcbiAgICBcImJvdW5jZUluXCIsXHJcbiAgICBcImJvdW5jZUluRG93blwiLFxyXG4gICAgXCJib3VuY2VJbkxlZnRcIixcclxuICAgIFwiYm91bmNlSW5SaWdodFwiLFxyXG4gICAgXCJib3VuY2VJblVwXCIsXHJcbiAgICBcImZhZGVJblwiLFxyXG4gICAgXCJmYWRlSW5Eb3duXCIsXHJcbiAgICBcImZhZGVJbkxlZnRcIixcclxuICAgIFwiZmFkZUluUmlnaHRcIixcclxuICAgIFwiZmFkZUluVXBcIixcclxuICAgIFwiZmxpcEluWFwiLFxyXG4gICAgXCJmbGlwSW5ZXCIsXHJcbiAgICBcImxpZ2h0U3BlZWRJblwiLFxyXG4gICAgXCJyb3RhdGVJblwiLFxyXG4gICAgXCJyb3RhdGVJbkRvd25MZWZ0XCIsXHJcbiAgICBcInJvdGF0ZUluVXBMZWZ0XCIsXHJcbiAgICBcInJvdGF0ZUluVXBSaWdodFwiLFxyXG4gICAgXCJqYWNrSW5UaGVCb3hcIixcclxuICAgIFwicm9sbEluXCIsXHJcbiAgICBcInpvb21JblwiXHJcbiAgXTtcclxuXHJcbiAgdmFyIGhpZGVfYW5pbWF0aW9ucyA9IFtcclxuICAgIFwibm90X2FuaW1hdGVcIixcclxuICAgIFwiYm91bmNlT3V0XCIsXHJcbiAgICBcImJvdW5jZU91dERvd25cIixcclxuICAgIFwiYm91bmNlT3V0TGVmdFwiLFxyXG4gICAgXCJib3VuY2VPdXRSaWdodFwiLFxyXG4gICAgXCJib3VuY2VPdXRVcFwiLFxyXG4gICAgXCJmYWRlT3V0XCIsXHJcbiAgICBcImZhZGVPdXREb3duXCIsXHJcbiAgICBcImZhZGVPdXRMZWZ0XCIsXHJcbiAgICBcImZhZGVPdXRSaWdodFwiLFxyXG4gICAgXCJmYWRlT3V0VXBcIixcclxuICAgIFwiZmxpcE91dFhcIixcclxuICAgIFwibGlwT3V0WVwiLFxyXG4gICAgXCJsaWdodFNwZWVkT3V0XCIsXHJcbiAgICBcInJvdGF0ZU91dFwiLFxyXG4gICAgXCJyb3RhdGVPdXREb3duTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVPdXREb3duUmlnaHRcIixcclxuICAgIFwicm90YXRlT3V0VXBMZWZ0XCIsXHJcbiAgICBcInJvdGF0ZU91dFVwUmlnaHRcIixcclxuICAgIFwiaGluZ2VcIixcclxuICAgIFwicm9sbE91dFwiXHJcbiAgXTtcclxuICB2YXIgc3RUYWJsZTtcclxuICB2YXIgcGFyYWxheFRhYmxlO1xyXG5cclxuICBmdW5jdGlvbiBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWxzKSB7XHJcbiAgICBpZiAoZWxzLmxlbmd0aCA9PSAwKXJldHVybjtcclxuICAgIGVscy53cmFwKCc8ZGl2IGNsYXNzPVwic2VsZWN0X2ltZ1wiPicpO1xyXG4gICAgZWxzID0gZWxzLnBhcmVudCgpO1xyXG4gICAgZWxzLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmaWxlX2J1dHRvblwiPjxpIGNsYXNzPVwibWNlLWljbyBtY2UtaS1icm93c2VcIj48L2k+PC9idXR0b24+Jyk7XHJcbiAgICAvKmVscy5maW5kKCdidXR0b24nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcclxuICAgICAkKCcjcm94eUN1c3RvbVBhbmVsMicpLmFkZENsYXNzKCdvcGVuJylcclxuICAgICB9KTsqL1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gZWxzLmVxKGkpLmZpbmQoJ2lucHV0Jyk7XHJcbiAgICAgIGlmICghZWwuYXR0cignaWQnKSkge1xyXG4gICAgICAgIGVsLmF0dHIoJ2lkJywgJ2ZpbGVfJyArIGkgKyAnXycgKyBEYXRlLm5vdygpKVxyXG4gICAgICB9XHJcbiAgICAgIHZhciB0X2lkID0gZWwuYXR0cignaWQnKTtcclxuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLnJlZ2lzdGVyKHRfaWQsIGZ1bmN0aW9uIChmaWxlLCBpZCkge1xyXG4gICAgICAgIC8vJCh0aGlzKS52YWwoZmlsZS51cmwpLnRyaWdnZXIoJ2NoYW5nZScsIFtmaWxlLCBpZF0pO1xyXG4gICAgICAgICQoJyMnICsgaWQpLnZhbChmaWxlLnVybCkuY2hhbmdlKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZmlsZV9idXR0b24nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcykucHJldigpO1xyXG4gICAgICB2YXIgaWQgPSAkdGhpcy5hdHRyKCdpZCcpO1xyXG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIub3Blbk1hbmFnZXIoe1xyXG4gICAgICAgIFwidXJsXCI6IFwiL21hbmFnZXIvZWxmaW5kZXI/ZmlsdGVyPWltYWdlJmNhbGxiYWNrPVwiICsgaWQgKyBcIiZsYW5nPXJ1XCIsXHJcbiAgICAgICAgXCJ3aWR0aFwiOiBcImF1dG9cIixcclxuICAgICAgICBcImhlaWdodFwiOiBcImF1dG9cIixcclxuICAgICAgICBcImlkXCI6IGlkXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5JbnB1dChkYXRhKSB7XHJcbiAgICB2YXIgaW5wdXQgPSAnPGlucHV0IGNsYXNzPVwiJyArIChkYXRhLmlucHV0Q2xhc3MgfHwgJycpICsgJ1wiIHZhbHVlPVwiJyArIChkYXRhLnZhbHVlIHx8ICcnKSArICdcIj4nO1xyXG4gICAgaWYgKGRhdGEubGFiZWwpIHtcclxuICAgICAgaW5wdXQgPSAnPGxhYmVsPjxzcGFuPicgKyBkYXRhLmxhYmVsICsgJzwvc3Bhbj4nICsgaW5wdXQgKyAnPC9sYWJlbD4nO1xyXG4gICAgfVxyXG4gICAgaWYgKGRhdGEucGFyZW50KSB7XHJcbiAgICAgIGlucHV0ID0gJzwnICsgZGF0YS5wYXJlbnQgKyAnPicgKyBpbnB1dCArICc8LycgKyBkYXRhLnBhcmVudCArICc+JztcclxuICAgIH1cclxuICAgIGlucHV0ID0gJChpbnB1dCk7XHJcblxyXG4gICAgaWYgKGRhdGEub25DaGFuZ2UpIHtcclxuICAgICAgdmFyIG9uQ2hhbmdlO1xyXG4gICAgICBpZiAoZGF0YS5iaW5kKSB7XHJcbiAgICAgICAgZGF0YS5iaW5kLmlucHV0ID0gaW5wdXQuZmluZCgnaW5wdXQnKTtcclxuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChkYXRhLmJpbmQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGlucHV0LmZpbmQoJ2lucHV0JykpO1xyXG4gICAgICB9XHJcbiAgICAgIGlucHV0LmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIG9uQ2hhbmdlKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlucHV0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuU2VsZWN0KGRhdGEpIHtcclxuICAgIHZhciBpbnB1dCA9ICQoJzxzZWxlY3QvPicpO1xyXG5cclxuICAgIHZhciBlbCA9IHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdO1xyXG4gICAgaWYgKGRhdGEuaW5kZXggIT09IGZhbHNlKSB7XHJcbiAgICAgIGVsID0gZWxbZGF0YS5pbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVsW2RhdGEucGFyYW1dKSB7XHJcbiAgICAgIGRhdGEudmFsdWUgPSBlbFtkYXRhLnBhcmFtXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRhdGEudmFsdWUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkYXRhLnN0YXJ0X29wdGlvbikge1xyXG4gICAgICBpbnB1dC5hcHBlbmQoZGF0YS5zdGFydF9vcHRpb24pXHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHZhbDtcclxuICAgICAgdmFyIHR4dCA9IGRhdGEubGlzdFtpXTtcclxuICAgICAgaWYgKGRhdGEudmFsX3R5cGUgPT0gMCkge1xyXG4gICAgICAgIHZhbCA9IGRhdGEubGlzdFtpXTtcclxuICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbF90eXBlID09IDEpIHtcclxuICAgICAgICB2YWwgPSBpO1xyXG4gICAgICB9IGVsc2UgaWYgKGRhdGEudmFsX3R5cGUgPT0gMikge1xyXG4gICAgICAgIC8vdmFsPWRhdGEudmFsX2xpc3RbaV07XHJcbiAgICAgICAgdmFsID0gaTtcclxuICAgICAgICB0eHQgPSBkYXRhLnZhbF9saXN0W2ldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2VsID0gKHZhbCA9PSBkYXRhLnZhbHVlID8gJ3NlbGVjdGVkJyA6ICcnKTtcclxuICAgICAgaWYgKHNlbCA9PSAnc2VsZWN0ZWQnKSB7XHJcbiAgICAgICAgaW5wdXQuYXR0cigndF92YWwnLCBkYXRhLmxpc3RbaV0pO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBvcHRpb24gPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyB2YWwgKyAnXCIgJyArIHNlbCArICc+JyArIHR4dCArICc8L29wdGlvbj4nO1xyXG4gICAgICBpZiAoZGF0YS52YWxfdHlwZSA9PSAyKSB7XHJcbiAgICAgICAgb3B0aW9uID0gJChvcHRpb24pLmF0dHIoJ2NvZGUnLCBkYXRhLmxpc3RbaV0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlucHV0LmFwcGVuZChvcHRpb24pXHJcbiAgICB9XHJcblxyXG4gICAgaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgZGF0YSA9IHRoaXM7XHJcbiAgICAgIHZhciB2YWwgPSBkYXRhLmVsLnZhbCgpO1xyXG4gICAgICB2YXIgc2xfb3AgPSBkYXRhLmVsLmZpbmQoJ29wdGlvblt2YWx1ZT0nICsgdmFsICsgJ10nKTtcclxuICAgICAgdmFyIGNscyA9IHNsX29wLnRleHQoKTtcclxuICAgICAgdmFyIGNoID0gc2xfb3AuYXR0cignY29kZScpO1xyXG4gICAgICBpZiAoIWNoKWNoID0gY2xzO1xyXG4gICAgICBpZiAoZGF0YS5pbmRleCAhPT0gZmFsc2UpIHtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLmluZGV4XVtkYXRhLnBhcmFtXSA9IHZhbDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLnBhcmFtXSA9IHZhbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgZGF0YS5vYmoucmVtb3ZlQ2xhc3MoZGF0YS5wcmVmaXggKyBkYXRhLmVsLmF0dHIoJ3RfdmFsJykpO1xyXG4gICAgICBkYXRhLm9iai5hZGRDbGFzcyhkYXRhLnByZWZpeCArIGNoKTtcclxuICAgICAgZGF0YS5lbC5hdHRyKCd0X3ZhbCcsIGNoKTtcclxuXHJcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOiBpbnB1dCxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogZGF0YS5wYXJhbSxcclxuICAgICAgcHJlZml4OiBkYXRhLnByZWZpeCB8fCAnJ1xyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmIChkYXRhLnBhcmVudCkge1xyXG4gICAgICB2YXIgcGFyZW50ID0gJCgnPCcgKyBkYXRhLnBhcmVudCArICcvPicpO1xyXG4gICAgICBwYXJlbnQuYXBwZW5kKGlucHV0KTtcclxuICAgICAgcmV0dXJuIHBhcmVudDtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKGRhdGEpIHtcclxuICAgIHZhciBhbmltX3NlbCA9IFtdO1xyXG4gICAgdmFyIG91dDtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+U2hvdyBhbmltYXRpb248L3NwYW4+Jyk7XHJcbiAgICB9XHJcbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHNob3dfYW5pbWF0aW9ucyxcclxuICAgICAgdmFsX3R5cGU6IDAsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ICdzaG93X2FuaW1hdGlvbicsXHJcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcclxuICAgIH0pKTtcclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5TaG93IGRlbGF5PC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBzaG93X2RlbGF5LFxyXG4gICAgICB2YWxfdHlwZTogMSxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogJ3Nob3dfZGVsYXknLFxyXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XHJcbiAgICB9KSk7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxici8+Jyk7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPkhpZGUgYW5pbWF0aW9uPC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBoaWRlX2FuaW1hdGlvbnMsXHJcbiAgICAgIHZhbF90eXBlOiAwLFxyXG4gICAgICBvYmo6IGRhdGEub2JqLFxyXG4gICAgICBncjogZGF0YS5ncixcclxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXHJcbiAgICAgIHBhcmFtOiAnaGlkZV9hbmltYXRpb24nLFxyXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XHJcbiAgICB9KSk7XHJcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+SGlkZSBkZWxheTwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogaGlkZV9kZWxheSxcclxuICAgICAgdmFsX3R5cGU6IDEsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ICdoaWRlX2RlbGF5JyxcclxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcclxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xyXG4gICAgICBvdXQgPSAkKCc8ZGl2IGNsYXNzPVwiYW5pbV9zZWxcIi8+Jyk7XHJcbiAgICAgIG91dC5hcHBlbmQoYW5pbV9zZWwpO1xyXG4gICAgfVxyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAxKSB7XHJcbiAgICAgIG91dCA9IGFuaW1fc2VsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvdXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0X2VkaXRvcigpIHtcclxuICAgICQoJyN3MScpLnJlbW92ZSgpO1xyXG4gICAgJCgnI3cxX2J1dHRvbicpLnJlbW92ZSgpO1xyXG4gICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gc2xpZGVyX2RhdGFbMF0ubW9iaWxlLnNwbGl0KCc/JylbMF07XHJcblxyXG4gICAgdmFyIGVsID0gJCgnI21lZ2Ffc2xpZGVyX2NvbnRyb2xlJyk7XHJcbiAgICB2YXIgYnRuc19ib3ggPSAkKCc8ZGl2IGNsYXNzPVwiYnRuX2JveFwiLz4nKTtcclxuXHJcbiAgICBlbC5hcHBlbmQoJzxoMj7Qo9C/0YDQsNCy0LvQtdC90LjQtTwvaDI+Jyk7XHJcbiAgICBlbC5hcHBlbmQoJCgnPHRleHRhcmVhLz4nLCB7XHJcbiAgICAgIHRleHQ6IEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSxcclxuICAgICAgaWQ6ICdzbGlkZV9kYXRhJyxcclxuICAgICAgbmFtZTogZWRpdG9yXHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGJ0biA9ICQoJzxidXR0b24gY2xhc3M9XCJcIi8+JykudGV4dChcItCQ0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xyXG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XHJcbiAgICBidG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdoaWRlX3NsaWRlJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgYnRuID0gJCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JTQtdCw0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xyXG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XHJcbiAgICBidG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmFkZENsYXNzKCdoaWRlX3NsaWRlJyk7XHJcbiAgICB9KTtcclxuICAgIGVsLmFwcGVuZChidG5zX2JveCk7XHJcblxyXG4gICAgZWwuYXBwZW5kKCc8aDI+0J7QsdGJ0LjQtSDQv9Cw0YDQsNC80LXRgtGA0Ys8L2gyPicpO1xyXG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLm1vYmlsZSxcclxuICAgICAgbGFiZWw6IFwi0KHQu9Cw0LnQtCDQtNC70Y8g0YLQtdC70LXRhNC+0L3QsFwiLFxyXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9ICQodGhpcykudmFsKClcclxuICAgICAgICAkKCcubW9iX2JnJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgc2xpZGVyX2RhdGFbMF0ubW9iaWxlICsgJyknKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0uZm9uLFxyXG4gICAgICBsYWJlbDogXCLQntGB0L3QvtC90L7QuSDRhNC+0L1cIixcclxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5mb24gPSAkKHRoaXMpLnZhbCgpXHJcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIHNsaWRlcl9kYXRhWzBdLmZvbiArICcpJylcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgYnRuX2NoID0gJCgnPGRpdiBjbGFzcz1cImJ0bnNcIi8+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKCc8aDM+0JrQvdC+0L/QutCwINC/0LXRgNC10YXQvtC00LAo0LTQu9GPINCf0Jog0LLQtdGA0YHQuNC4KTwvaDM+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0LFxyXG4gICAgICBsYWJlbDogXCLQotC10LrRgdGCXCIsXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS50ZXh0KHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0KTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH0sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGJ1dF9zbCA9ICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCk7XHJcbiAgICBidG5fY2guYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmLFxyXG4gICAgICBsYWJlbDogXCLQodGB0YvQu9C60LBcIixcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApLmF0dHIoJ2hyZWYnLHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH0sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgYnRuX2NoLmFwcGVuZCgnPGJyLz4nKTtcclxuICAgIHZhciB3cmFwX2xhYiA9ICQoJzxsYWJlbC8+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKHdyYXBfbGFiKTtcclxuICAgIHdyYXBfbGFiLmFwcGVuZCgnPHNwYW4+0J7RhNC+0YDQvNC70LXQvdC40LUg0LrQvdC+0L/QutC4PC9zcGFuPicpO1xyXG4gICAgd3JhcF9sYWIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IGJ0bl9zdHlsZSxcclxuICAgICAgdmFsX3R5cGU6IDAsXHJcbiAgICAgIG9iajogYnV0X3NsLFxyXG4gICAgICBncjogJ2J1dHRvbicsXHJcbiAgICAgIGluZGV4OiBmYWxzZSxcclxuICAgICAgcGFyYW06ICdjb2xvcidcclxuICAgIH0pKTtcclxuXHJcbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xyXG4gICAgd3JhcF9sYWIgPSAkKCc8bGFiZWwvPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZCh3cmFwX2xhYik7XHJcbiAgICB3cmFwX2xhYi5hcHBlbmQoJzxzcGFuPtCf0L7Qu9C+0LbQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XHJcbiAgICB3cmFwX2xhYi5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogcG9zQXJyLFxyXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXHJcbiAgICAgIHZhbF90eXBlOiAyLFxyXG4gICAgICBvYmo6IGJ1dF9zbC5wYXJlbnQoKS5wYXJlbnQoKSxcclxuICAgICAgZ3I6ICdidXR0b24nLFxyXG4gICAgICBpbmRleDogZmFsc2UsXHJcbiAgICAgIHBhcmFtOiAncG9zJ1xyXG4gICAgfSkpO1xyXG5cclxuICAgIGJ0bl9jaC5hcHBlbmQoZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoe1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICBvYmo6IGJ1dF9zbC5wYXJlbnQoKSxcclxuICAgICAgZ3I6ICdidXR0b24nLFxyXG4gICAgICBpbmRleDogZmFsc2VcclxuICAgIH0pKTtcclxuICAgIGVsLmFwcGVuZChidG5fY2gpO1xyXG5cclxuICAgIHZhciBsYXllciA9ICQoJzxkaXYgY2xhc3M9XCJmaXhlZF9sYXllclwiLz4nKTtcclxuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCh0YLQsNGC0LjRh9C10YHQutC40LUg0YHQu9C+0Lg8L2gyPicpO1xyXG4gICAgdmFyIHRoID0gXCI8dGg+4oSWPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCh0LvQvtC5INC90LAg0LLRgdGOINCy0YvRgdC+0YLRgzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC/0L7Rj9Cy0LvQtdC90LjRjzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7Ql9Cw0LTQtdGA0LbQutCwINC/0L7Rj9Cy0LvQtdC90LjRjzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7Ql9Cw0LTQtdGA0LbQutCwINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QlNC10LnRgdGC0LLQuNC1PC90aD5cIjtcclxuICAgIHN0VGFibGUgPSAkKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nICsgdGggKyAnPC90cj48L3RhYmxlPicpO1xyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVswXS5maXhlZDtcclxuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhZGRUclN0YXRpYyhkYXRhW2ldKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGF5ZXIuYXBwZW5kKHN0VGFibGUpO1xyXG4gICAgdmFyIGFkZEJ0biA9ICQoJzxidXR0b24vPicsIHtcclxuICAgICAgdGV4dDogXCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcclxuICAgIH0pO1xyXG4gICAgYWRkQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZGF0YSA9IGFkZFRyU3RhdGljKGZhbHNlKTtcclxuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XHJcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xyXG5cclxuICAgIHZhciBsYXllciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGF4X2xheWVyXCIvPicpO1xyXG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0J/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuDwvaDI+Jyk7XHJcbiAgICB2YXIgdGggPSBcIjx0aD7ihJY8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JrQsNGA0YLQuNC90LrQsDwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0KPQtNCw0LvQtdC90L3QvtGB0YLRjCAo0YbQtdC70L7QtSDQv9C+0LvQvtC20LjRgtC10LvRjNC90L7QtSDRh9C40YHQu9C+KTwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QlNC10LnRgdGC0LLQuNC1PC90aD5cIjtcclxuXHJcbiAgICBwYXJhbGF4VGFibGUgPSAkKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nICsgdGggKyAnPC90cj48L3RhYmxlPicpO1xyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVswXS5wYXJhbGF4O1xyXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFkZFRyUGFyYWxheChkYXRhW2ldKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGF5ZXIuYXBwZW5kKHBhcmFsYXhUYWJsZSk7XHJcbiAgICB2YXIgYWRkQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xyXG4gICAgICB0ZXh0OiBcItCU0L7QsdCw0LLQuNGC0Ywg0YHQu9C+0LlcIlxyXG4gICAgfSk7XHJcbiAgICBhZGRCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBkYXRhID0gYWRkVHJQYXJhbGF4KGZhbHNlKTtcclxuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG5cclxuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xyXG4gICAgZWwuYXBwZW5kKGxheWVyKTtcclxuXHJcbiAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWwuZmluZCgnLmZpbGVTZWxlY3QnKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRUclN0YXRpYyhkYXRhKSB7XHJcbiAgICB2YXIgaSA9IHN0VGFibGUuZmluZCgndHInKS5sZW5ndGggLSAxO1xyXG4gICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgXCJpbWdcIjogXCJcIixcclxuICAgICAgICBcImZ1bGxfaGVpZ2h0XCI6IDAsXHJcbiAgICAgICAgXCJwb3NcIjogMCxcclxuICAgICAgICBcInNob3dfZGVsYXlcIjogMSxcclxuICAgICAgICBcInNob3dfYW5pbWF0aW9uXCI6IFwibGlnaHRTcGVlZEluXCIsXHJcbiAgICAgICAgXCJoaWRlX2RlbGF5XCI6IDEsXHJcbiAgICAgICAgXCJoaWRlX2FuaW1hdGlvblwiOiBcImJvdW5jZU91dFwiXHJcbiAgICAgIH07XHJcbiAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkLnB1c2goZGF0YSk7XHJcbiAgICAgIHZhciBmaXggPSAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwJyk7XHJcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICA7XHJcblxyXG4gICAgdmFyIHRyID0gJCgnPHRyLz4nKTtcclxuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcclxuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBkYXRhLmltZyxcclxuICAgICAgbGFiZWw6IGZhbHNlLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBiaW5kOiB7XHJcbiAgICAgICAgZ3I6ICdmaXhlZCcsXHJcbiAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgcGFyYW06ICdpbWcnLFxyXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxyXG4gICAgICB9LFxyXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgICAgIGRhdGEub2JqLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW5wdXQudmFsKCkgKyAnKScpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkW2RhdGEuaW5kZXhdLmltZyA9IGRhdGEuaW5wdXQudmFsKCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogcG9zQXJyLFxyXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXHJcbiAgICAgIHZhbF90eXBlOiAyLFxyXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLFxyXG4gICAgICBncjogJ2ZpeGVkJyxcclxuICAgICAgaW5kZXg6IGksXHJcbiAgICAgIHBhcmFtOiAncG9zJyxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHllc19ub192YWwsXHJcbiAgICAgIHZhbF9saXN0OiB5ZXNfbm9fYXJyLFxyXG4gICAgICB2YWxfdHlwZTogMixcclxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKSxcclxuICAgICAgZ3I6ICdmaXhlZCcsXHJcbiAgICAgIGluZGV4OiBpLFxyXG4gICAgICBwYXJhbTogJ2Z1bGxfaGVpZ2h0JyxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcclxuICAgICAgdHlwZTogMSxcclxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5maW5kKCcuYW5pbWF0aW9uX2xheWVyJyksXHJcbiAgICAgIGdyOiAnZml4ZWQnLFxyXG4gICAgICBpbmRleDogaSxcclxuICAgICAgcGFyZW50OiAndGQnXHJcbiAgICB9KSk7XHJcbiAgICB2YXIgZGVsQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xyXG4gICAgICB0ZXh0OiBcItCj0LTQsNC70LjRgtGMXCJcclxuICAgIH0pO1xyXG4gICAgZGVsQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzLmVsKTtcclxuICAgICAgaSA9ICR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKSAtIDE7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxyXG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxyXG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLmZpeGVkLnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOiBkZWxCdG4sXHJcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0blRkID0gJCgnPHRkLz4nKS5hcHBlbmQoZGVsQnRuKTtcclxuICAgIHRyLmFwcGVuZChkZWxCdG5UZCk7XHJcbiAgICBzdFRhYmxlLmFwcGVuZCh0cilcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlZGl0b3I6IHRyLFxyXG4gICAgICBkYXRhOiBkYXRhXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRUclBhcmFsYXgoZGF0YSkge1xyXG4gICAgdmFyIGkgPSBwYXJhbGF4VGFibGUuZmluZCgndHInKS5sZW5ndGggLSAxO1xyXG4gICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgXCJpbWdcIjogXCJcIixcclxuICAgICAgICBcInpcIjogMVxyXG4gICAgICB9O1xyXG4gICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4LnB1c2goZGF0YSk7XHJcbiAgICAgIHZhciBwYXJhbGF4X2dyID0gJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAnKTtcclxuICAgICAgYWRkUGFyYWxheExheWVyKGRhdGEsIHBhcmFsYXhfZ3IpO1xyXG4gICAgfVxyXG4gICAgO1xyXG4gICAgdmFyIHRyID0gJCgnPHRyLz4nKTtcclxuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcclxuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBkYXRhLmltZyxcclxuICAgICAgbGFiZWw6IGZhbHNlLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBiaW5kOiB7XHJcbiAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgcGFyYW06ICdpbWcnLFxyXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLmZpbmQoJ3NwYW4nKSxcclxuICAgICAgfSxcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmlucHV0LnZhbCgpICsgJyknKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLmltZyA9IGRhdGEuaW5wdXQudmFsKCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogcG9zQXJyLFxyXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXHJcbiAgICAgIHZhbF90eXBlOiAyLFxyXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXHJcbiAgICAgIGdyOiAncGFyYWxheCcsXHJcbiAgICAgIGluZGV4OiBpLFxyXG4gICAgICBwYXJhbTogJ3BvcycsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgICAgc3RhcnRfb3B0aW9uOiAnPG9wdGlvbiB2YWx1ZT1cIlwiIGNvZGU9XCJcIj7QvdCwINCy0LXRgdGMINGN0LrRgNCw0L08L29wdGlvbj4nXHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogZGF0YS56LFxyXG4gICAgICBsYWJlbDogZmFsc2UsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgICAgYmluZDoge1xyXG4gICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcclxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKSxcclxuICAgICAgfSxcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgICAgICBkYXRhLm9iai5hdHRyKCd6JywgZGF0YS5pbnB1dC52YWwoKSk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS56ID0gZGF0YS5pbnB1dC52YWwoKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgZGVsQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xyXG4gICAgICB0ZXh0OiBcItCj0LTQsNC70LjRgtGMXCJcclxuICAgIH0pO1xyXG4gICAgZGVsQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzLmVsKTtcclxuICAgICAgaSA9ICR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKSAtIDE7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxyXG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxyXG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLnBhcmFsYXguc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXHJcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgfS5iaW5kKHtcclxuICAgICAgZWw6IGRlbEJ0bixcclxuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXHJcbiAgICB9KSk7XHJcbiAgICB2YXIgZGVsQnRuVGQgPSAkKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xyXG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcclxuICAgIHBhcmFsYXhUYWJsZS5hcHBlbmQodHIpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZWRpdG9yOiB0cixcclxuICAgICAgZGF0YTogZGF0YVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkX2FuaW1hdGlvbihlbCwgZGF0YSkge1xyXG4gICAgdmFyIG91dCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgJ2NsYXNzJzogJ2FuaW1hdGlvbl9sYXllcidcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICh0eXBlb2YoZGF0YS5zaG93X2RlbGF5KSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICBvdXQuYWRkQ2xhc3Moc2hvd19kZWxheVtkYXRhLnNob3dfZGVsYXldKTtcclxuICAgICAgaWYgKGRhdGEuc2hvd19hbmltYXRpb24pIHtcclxuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycgKyBkYXRhLnNob3dfYW5pbWF0aW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YoZGF0YS5oaWRlX2RlbGF5KSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICBvdXQuYWRkQ2xhc3MoaGlkZV9kZWxheVtkYXRhLmhpZGVfZGVsYXldKTtcclxuICAgICAgaWYgKGRhdGEuaGlkZV9hbmltYXRpb24pIHtcclxuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycgKyBkYXRhLmhpZGVfYW5pbWF0aW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGVsLmFwcGVuZChvdXQpO1xyXG4gICAgcmV0dXJuIGVsO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVfc2xpZGUoZGF0YSkge1xyXG4gICAgdmFyIHNsaWRlID0gJCgnPGRpdiBjbGFzcz1cInNsaWRlXCIvPicpO1xyXG5cclxuICAgIHZhciBtb2JfYmcgPSAkKCc8YSBjbGFzcz1cIm1vYl9iZ1wiIGhyZWY9XCInICsgZGF0YS5idXR0b24uaHJlZiArICdcIi8+Jyk7XHJcbiAgICBtb2JfYmcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5tb2JpbGUgKyAnKScpXHJcblxyXG4gICAgc2xpZGUuYXBwZW5kKG1vYl9iZyk7XHJcbiAgICBpZiAobW9iaWxlX21vZGUpIHtcclxuICAgICAgcmV0dXJuIHNsaWRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0YTQvtC9INGC0L4g0LfQsNC/0L7Qu9C90Y/QtdC8XHJcbiAgICBpZiAoZGF0YS5mb24pIHtcclxuICAgICAgc2xpZGUuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5mb24gKyAnKScpXHJcbiAgICB9XHJcblxyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgaWYgKGRhdGEucGFyYWxheCAmJiBkYXRhLnBhcmFsYXgubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fZ3JvdXBcIi8+Jyk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5wYXJhbGF4Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYWRkUGFyYWxheExheWVyKGRhdGEucGFyYWxheFtpXSwgcGFyYWxheF9ncilcclxuICAgICAgfVxyXG4gICAgICBzbGlkZS5hcHBlbmQocGFyYWxheF9ncilcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZml4ID0gJCgnPGRpdiBjbGFzcz1cImZpeGVkX2dyb3VwXCIvPicpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmZpeGVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEuZml4ZWRbaV0sIGZpeClcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XHJcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLmJ1dHRvbi5wb3NdKTtcclxuICAgIHZhciBidXQgPSAkKFwiPGEgY2xhc3M9J3NsaWRlcl9faHJlZicvPlwiKTtcclxuICAgIGJ1dC5hdHRyKCdocmVmJywgZGF0YS5idXR0b24uaHJlZik7XHJcbiAgICBidXQudGV4dChkYXRhLmJ1dHRvbi50ZXh0KTtcclxuICAgIGJ1dC5hZGRDbGFzcyhkYXRhLmJ1dHRvbi5jb2xvcik7XHJcbiAgICBkb3BfYmxrID0gYWRkX2FuaW1hdGlvbihkb3BfYmxrLCBkYXRhLmJ1dHRvbik7XHJcbiAgICBkb3BfYmxrLmZpbmQoJ2RpdicpLmFwcGVuZChidXQpO1xyXG4gICAgZml4LmFwcGVuZChkb3BfYmxrKTtcclxuXHJcbiAgICBzbGlkZS5hcHBlbmQoZml4KTtcclxuICAgIHJldHVybiBzbGlkZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKSB7XHJcbiAgICB2YXIgcGFyYWxsYXhfbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2xheWVyXCJcXD4nKTtcclxuICAgIHBhcmFsbGF4X2xheWVyLmF0dHIoJ3onLCBkYXRhLnogfHwgaSAqIDEwKTtcclxuICAgIHZhciBkb3BfYmxrID0gJChcIjxzcGFuIGNsYXNzPSdzbGlkZXJfX3RleHQnLz5cIik7XHJcbiAgICBpZiAoZGF0YS5wb3MpIHtcclxuICAgICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcclxuICAgIH1cclxuICAgIGRvcF9ibGsuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xyXG4gICAgcGFyYWxsYXhfbGF5ZXIuYXBwZW5kKGRvcF9ibGspO1xyXG4gICAgcGFyYWxheF9nci5hcHBlbmQocGFyYWxsYXhfbGF5ZXIpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkU3RhdGljTGF5ZXIoZGF0YSwgZml4LCBiZWZvcl9idXR0b24pIHtcclxuICAgIHZhciBkb3BfYmxrID0gJChcIjxkaXYgY2xhc3M9J2ZpeGVkX19sYXllcicvPlwiKTtcclxuICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XHJcbiAgICBpZiAoZGF0YS5mdWxsX2hlaWdodCkge1xyXG4gICAgICBkb3BfYmxrLmFkZENsYXNzKCdmaXhlZF9fZnVsbC1oZWlnaHQnKTtcclxuICAgIH1cclxuICAgIGRvcF9ibGsgPSBhZGRfYW5pbWF0aW9uKGRvcF9ibGssIGRhdGEpO1xyXG4gICAgZG9wX2Jsay5maW5kKCcuYW5pbWF0aW9uX2xheWVyJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xyXG5cclxuICAgIGlmIChiZWZvcl9idXR0b24pIHtcclxuICAgICAgZml4LmZpbmQoJy5zbGlkZXJfX2hyZWYnKS5jbG9zZXN0KCcuZml4ZWRfX2xheWVyJykuYmVmb3JlKGRvcF9ibGspXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmaXguYXBwZW5kKGRvcF9ibGspXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xyXG4gICAgaWYgKCQoJyNtZWdhX3NsaWRlcicpLmhhc0NsYXNzKCdzdG9wX3NsaWRlJykpcmV0dXJuO1xyXG5cclxuICAgIHZhciBzbGlkZV9wb2ludHMgPSAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVfc2VsZWN0JylcclxuICAgIHZhciBzbGlkZV9jbnQgPSBzbGlkZV9wb2ludHMubGVuZ3RoO1xyXG4gICAgdmFyIGFjdGl2ZSA9ICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykuaW5kZXgoKSArIDE7XHJcbiAgICBpZiAoYWN0aXZlID49IHNsaWRlX2NudClhY3RpdmUgPSAwO1xyXG4gICAgc2xpZGVfcG9pbnRzLmVxKGFjdGl2ZSkuY2xpY2soKTtcclxuXHJcbiAgICB0aW1lb3V0SWQ9c2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGltZ190b19sb2FkKHNyYykge1xyXG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xyXG4gICAgaW1nLm9uKCdsb2FkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB0b3RfaW1nX3dhaXQtLTtcclxuXHJcbiAgICAgIGlmICh0b3RfaW1nX3dhaXQgPT0gMCkge1xyXG5cclxuICAgICAgICBzbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dKSk7XHJcbiAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKHJlbmRlcl9zbGlkZV9ub20pLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgICAgICBpZiAocmVuZGVyX3NsaWRlX25vbSA9PSAwKSB7XHJcbiAgICAgICAgICBzbGlkZXMuZmluZCgnLnNsaWRlJylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93JylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICBpZiAoIWVkaXRvcikge1xyXG4gICAgICAgICAgICBpZih0aW1lb3V0SWQpY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgIHRpbWVvdXRJZD1zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5maXJzdF9zaG93JykucmVtb3ZlQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcclxuICAgICAgICAgICAgfS5iaW5kKHNsaWRlcyksIHNjcm9sbF9wZXJpb2QpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChtb2JpbGVfbW9kZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XHJcbiAgICAgICAgICAgIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICBwYXJhbGxheF90aW1lciA9IHNldEludGVydmFsKHJlbmRlciwgMTAwKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoZWRpdG9yKSB7XHJcbiAgICAgICAgICAgIGluaXRfZWRpdG9yKClcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKHRpbWVvdXRJZCljbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcclxuXHJcbiAgICAgICAgICAgICQoJy5zbGlkZV9zZWxlY3RfYm94Jykub24oJ2NsaWNrJywgJy5zbGlkZV9zZWxlY3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKSlyZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgIHZhciBpbmRleCA9ICR0aGlzLmluZGV4KCk7XHJcbiAgICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICR0aGlzLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGUuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgJChjb250YWluZXJfaWQgKyAnIC5zbGlkZScpLmVxKGluZGV4KS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5ob3ZlcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgaWYodGltZW91dElkKWNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xyXG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmFkZENsYXNzKCdzdG9wX3NsaWRlJyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xyXG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLnJlbW92ZUNsYXNzKCdzdG9wX3NsaWRlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVyX3NsaWRlX25vbSsrO1xyXG4gICAgICAgIGlmIChyZW5kZXJfc2xpZGVfbm9tIDwgc2xpZGVyX2RhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgICBsb2FkX3NsaWRlX2ltZygpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KS5vbignZXJyb3InLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xyXG4gICAgfSk7XHJcbiAgICBpbWcucHJvcCgnc3JjJywgc3JjKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGxvYWRfc2xpZGVfaW1nKCkge1xyXG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVtyZW5kZXJfc2xpZGVfbm9tXTtcclxuICAgIHRvdF9pbWdfd2FpdCA9IDE7XHJcblxyXG4gICAgaWYgKG1vYmlsZV9tb2RlID09PSBmYWxzZSkge1xyXG4gICAgICB0b3RfaW1nX3dhaXQrKztcclxuICAgICAgaW1nX3RvX2xvYWQoZGF0YS5mb24pO1xyXG4gICAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XHJcbiAgICAgIGlmIChkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0b3RfaW1nX3dhaXQgKz0gZGF0YS5wYXJhbGF4Lmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGFyYWxheC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5wYXJhbGF4W2ldLmltZylcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRhdGEuZml4ZWQgJiYgZGF0YS5maXhlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEuZml4ZWQubGVuZ3RoO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5maXhlZFtpXS5pbWcpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW1nX3RvX2xvYWQoZGF0YS5tb2JpbGUpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3RhcnRfaW5pdF9zbGlkZShkYXRhKSB7XHJcbiAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xyXG4gICAgaW1nLmF0dHIoJ3RpbWUnLCBuKTtcclxuXHJcbiAgICBmdW5jdGlvbiBvbl9pbWdfbG9hZCgpIHtcclxuICAgICAgdmFyIG4gPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgaW1nID0gJCh0aGlzKTtcclxuICAgICAgbiA9IG4gLSBwYXJzZUludChpbWcuYXR0cigndGltZScpKTtcclxuICAgICAgaWYgKG4gPiBtYXhfdGltZV9sb2FkX3BpYykge1xyXG4gICAgICAgIG1vYmlsZV9tb2RlID0gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgbWF4X3NpemUgPSAoc2NyZWVuLmhlaWdodCA+IHNjcmVlbi53aWR0aCA/IHNjcmVlbi5oZWlnaHQgOiBzY3JlZW4ud2lkdGgpO1xyXG4gICAgICAgIGlmIChtYXhfc2l6ZSA8IG1vYmlsZV9zaXplKSB7XHJcbiAgICAgICAgICBtb2JpbGVfbW9kZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vYmlsZV9tb2RlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChtb2JpbGVfbW9kZSA9PSB0cnVlKSB7XHJcbiAgICAgICAgJChjb250YWluZXJfaWQpLmFkZENsYXNzKCdtb2JpbGVfbW9kZScpXHJcbiAgICAgIH1cclxuICAgICAgcmVuZGVyX3NsaWRlX25vbSA9IDA7XHJcbiAgICAgIGxvYWRfc2xpZGVfaW1nKCk7XHJcbiAgICAgICQoJy5zay1mb2xkaW5nLWN1YmUnKS5yZW1vdmUoKTtcclxuICAgIH07XHJcblxyXG4gICAgaW1nLm9uKCdsb2FkJywgb25faW1nX2xvYWQoKSk7XHJcbiAgICBpZiAoc2xpZGVyX2RhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnP3I9JyArIE1hdGgucmFuZG9tKCk7XHJcbiAgICAgIGltZy5wcm9wKCdzcmMnLCBzbGlkZXJfZGF0YVswXS5tb2JpbGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb25faW1nX2xvYWQoKS5iaW5kKGltZyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0KGRhdGEsIGVkaXRvcl9pbml0KSB7XHJcbiAgICBzbGlkZXJfZGF0YSA9IGRhdGE7XHJcbiAgICBlZGl0b3IgPSBlZGl0b3JfaW5pdDtcclxuICAgIC8v0L3QsNGF0L7QtNC40Lwg0LrQvtC90YLQtdC50L3QtdGAINC4INC+0YfQuNGJ0LDQtdC8INC10LPQvlxyXG4gICAgdmFyIGNvbnRhaW5lciA9ICQoY29udGFpbmVyX2lkKTtcclxuICAgIGNvbnRhaW5lci5odG1sKCcnKTtcclxuXHJcbiAgICAvL9GB0L7Qt9C20LDQtdC8INCx0LDQt9C+0LLRi9C1INC60L7QvdGC0LXQudC90LXRgNGLINC00LvRjyDRgdCw0LzQuNGFINGB0LvQsNC50LTQvtCyINC4INC00LvRjyDQv9C10YDQtdC60LvRjtGH0LDRgtC10LvQtdC5XHJcbiAgICBzbGlkZXMgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICdjbGFzcyc6ICdzbGlkZXMnXHJcbiAgICB9KTtcclxuICAgIHZhciBzbGlkZV9jb250cm9sID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAnY2xhc3MnOiAnc2xpZGVfY29udHJvbCdcclxuICAgIH0pO1xyXG4gICAgc2xpZGVfc2VsZWN0X2JveCA9ICQoJzx1bC8+Jywge1xyXG4gICAgICAnY2xhc3MnOiAnc2xpZGVfc2VsZWN0X2JveCdcclxuICAgIH0pO1xyXG5cclxuICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INC40L3QtNC40LrQsNGC0L7RgCDQt9Cw0LPRgNGD0LfQutC4XHJcbiAgICB2YXIgbCA9ICc8ZGl2IGNsYXNzPVwic2stZm9sZGluZy1jdWJlXCI+JyArXHJcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTEgc2stY3ViZVwiPjwvZGl2PicgK1xyXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUyIHNrLWN1YmVcIj48L2Rpdj4nICtcclxuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlNCBzay1jdWJlXCI+PC9kaXY+JyArXHJcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTMgc2stY3ViZVwiPjwvZGl2PicgK1xyXG4gICAgICAnPC9kaXY+JztcclxuICAgIGNvbnRhaW5lci5odG1sKGwpO1xyXG5cclxuXHJcbiAgICBzdGFydF9pbml0X3NsaWRlKGRhdGFbMF0pO1xyXG5cclxuICAgIC8v0LPQtdC90LXRgNC40YDRg9C10Lwg0LrQvdC+0L/QutC4INC4INGB0LvQsNC50LTRi1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIC8vc2xpZGVzLmFwcGVuZChnZW5lcmF0ZV9zbGlkZShkYXRhW2ldKSk7XHJcbiAgICAgIHNsaWRlX3NlbGVjdF9ib3guYXBwZW5kKCc8bGkgY2xhc3M9XCJzbGlkZV9zZWxlY3QgZGlzYWJsZWRcIi8+JylcclxuICAgIH1cclxuXHJcbiAgICAvKnNsaWRlcy5maW5kKCcuc2xpZGUnKS5lcSgwKVxyXG4gICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpXHJcbiAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93Jyk7XHJcbiAgICAgc2xpZGVfY29udHJvbC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7Ki9cclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlcyk7XHJcbiAgICBzbGlkZV9jb250cm9sLmFwcGVuZChzbGlkZV9zZWxlY3RfYm94KTtcclxuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVfY29udHJvbCk7XHJcblxyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICAgIGlmICghcGFyYWxsYXhfZ3JvdXApcmV0dXJuIGZhbHNlO1xyXG4gICAgdmFyIHBhcmFsbGF4X2sgPSAocGFyYWxsYXhfY291bnRlciAtIDEwKSAvIDI7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbGxheF9ncm91cC5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgZWwgPSBwYXJhbGxheF9ncm91cC5lcShpKTtcclxuICAgICAgdmFyIGogPSBlbC5hdHRyKCd6Jyk7XHJcbiAgICAgIHZhciB0ciA9ICdyb3RhdGUzZCgwLjEsMC44LDAsJyArIChwYXJhbGxheF9rKSArICdkZWcpIHNjYWxlKCcgKyAoMSArIGogKiAwLjUpICsgJykgdHJhbnNsYXRlWigtJyArICgxMCArIGogKiAyMCkgKyAncHgpJztcclxuICAgICAgZWwuY3NzKCd0cmFuc2Zvcm0nLCB0cilcclxuICAgIH1cclxuICAgIHBhcmFsbGF4X2NvdW50ZXIgKz0gcGFyYWxsYXhfZCAqIDAuMTtcclxuICAgIGlmIChwYXJhbGxheF9jb3VudGVyID49IDIwKXBhcmFsbGF4X2QgPSAtcGFyYWxsYXhfZDtcclxuICAgIGlmIChwYXJhbGxheF9jb3VudGVyIDw9IDApcGFyYWxsYXhfZCA9IC1wYXJhbGxheF9kO1xyXG4gIH1cclxuXHJcbiAgaW5pdEltYWdlU2VydmVyU2VsZWN0KCQoJy5maWxlU2VsZWN0JykpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgaW5pdDogaW5pdFxyXG4gIH07XHJcbn0oKSk7XHJcbiIsInZhciBoZWFkZXJBY3Rpb25zID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxuICB2YXIgc2hhZG93ZWREb3duID0gZmFsc2U7XHJcblxyXG4gICQoJy5tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgJCgnLmhlYWRlcicpLnRvZ2dsZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAkKCcuZHJvcC1tZW51JykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICBpZiAoJCgnLmhlYWRlcicpLmhhc0NsYXNzKCdoZWFkZXJfb3Blbi1tZW51JykpIHtcclxuICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcclxuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdub19zY3JvbGwnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5zZWFyY2gtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgJCgnI2F1dG9jb21wbGV0ZScpLmZhZGVPdXQoKTtcclxuICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpKSB7XHJcbiAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcjaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmIChlLnRhcmdldC5pZCA9PSAnaGVhZGVyJykge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcuaGVhZGVyLXNlYXJjaF9mb3JtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJ2Zvcm0nKS5zdWJtaXQoKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmhlYWRlci1zZWNvbmRsaW5lX2Nsb3NlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItdXBsaW5lJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoIXNjcm9sbGVkRG93bilyZXR1cm47XHJcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCAxMDI0KSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgICQoJy5oZWFkZXItc2Vjb25kbGluZScpLnJlbW92ZUNsYXNzKCdzY3JvbGwtZG93bicpO1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcclxuICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG4gIH0pO1xyXG5cclxuICAkKHdpbmRvdykub24oJ2xvYWQgcmVzaXplIHNjcm9sbCcsIGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBzaGFkb3dIZWlnaHQgPSA1MDtcclxuICAgIHZhciBoaWRlSGVpZ2h0ID0gMjAwO1xyXG4gICAgdmFyIGhlYWRlclNlY29uZExpbmUgPSAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKTtcclxuICAgIHZhciBob3ZlcnMgPSBoZWFkZXJTZWNvbmRMaW5lLmZpbmQoJzpob3ZlcicpO1xyXG4gICAgdmFyIGhlYWRlciA9ICQoJy5oZWFkZXInKTtcclxuXHJcbiAgICBpZiAoIWhvdmVycy5sZW5ndGgpIHtcclxuICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgICBoZWFkZXIucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgICAgLy9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXHJcbiAgICAgIHZhciBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XHJcbiAgICAgIGlmIChzY3JvbGxUb3AgPiBzaGFkb3dIZWlnaHQgJiYgc2hhZG93ZWREb3duID09PSBmYWxzZSkge1xyXG4gICAgICAgIHNoYWRvd2VkRG93biA9IHRydWU7XHJcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2hhZG93ZWQnKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoc2Nyb2xsVG9wIDw9IHNoYWRvd0hlaWdodCAmJiBzaGFkb3dlZERvd24gPT09IHRydWUpIHtcclxuICAgICAgICBzaGFkb3dlZERvd24gPSBmYWxzZTtcclxuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzaGFkb3dlZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzY3JvbGxUb3AgPiBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gZmFsc2UpIHtcclxuICAgICAgICBzY3JvbGxlZERvd24gPSB0cnVlO1xyXG4gICAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNjcm9sbFRvcCA8PSBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgICAgaGVhZGVyLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5tZW51X2FuZ2xlLWRvd24sIC5kcm9wLW1lbnVfZ3JvdXBfX3VwLWhlYWRlcicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgbWVudU9wZW4gPSAkKHRoaXMpLmNsb3Nlc3QoJy5oZWFkZXJfb3Blbi1tZW51LCAuY2F0YWxvZy1jYXRlZ29yaWVzJyk7XHJcbiAgICBpZiAoIW1lbnVPcGVuLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBwYXJlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnVfZ3JvdXBfX3VwLCAubWVudS1ncm91cCcpO1xyXG4gICAgdmFyIHBhcmVudE1lbnUgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnUnKTtcclxuICAgIGlmIChwYXJlbnRNZW51KSB7XHJcbiAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgfVxyXG4gICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgJChwYXJlbnQpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgIGlmIChwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAgICQocGFyZW50KS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuY2hpbGRyZW4oJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmFkZENsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuY2hpbGRyZW4oJ2xpJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuXHJcbiAgdmFyIGFjY291bnRNZW51VGltZU91dCA9IG51bGw7XHJcbiAgdmFyIGFjY291bnRNZW51T3BlblRpbWUgPSAwO1xyXG4gIHZhciBhY2NvdW50TWVudSA9ICQoJy5hY2NvdW50LW1lbnUnKTtcclxuXHJcbiAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gMTAyNCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcclxuICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcclxuXHJcbiAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XHJcblxyXG4gICAgaWYgKGFjY291bnRNZW51Lmhhc0NsYXNzKCdoaWRkZW4nKSkge1xyXG4gICAgICBtZW51QWNjb3VudFVwKHRoYXQpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoYXQucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgYWNjb3VudE1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvL9C/0L7QutCw0Lcg0LzQtdC90Y4g0LDQutC60LDRg9C90YJcclxuICBmdW5jdGlvbiBtZW51QWNjb3VudFVwKHRvZ2dsZUJ1dHRvbikge1xyXG4gICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xyXG4gICAgdG9nZ2xlQnV0dG9uLmFkZENsYXNzKCdvcGVuJyk7XHJcbiAgICBhY2NvdW50TWVudS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gMTAyNCkge1xyXG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgYWNjb3VudE1lbnVPcGVuVGltZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBhY2NvdW50TWVudVRpbWVPdXQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gMTAyNCkge1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoKG5ldyBEYXRlKCkgLSBhY2NvdW50TWVudU9wZW5UaW1lKSA+IDEwMDAgKiA3KSB7XHJcbiAgICAgICAgYWNjb3VudE1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIHRvZ2dsZUJ1dHRvbi5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcclxuICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LCAxMDAwKTtcclxuICB9XHJcblxyXG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXMtYWNjb3VudF9tZW51LWhlYWRlcicpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBhY2NvdW50TWVudU9wZW5UaW1lID0gbmV3IERhdGUoKTtcclxuICB9KTtcclxuICAkKCcuYWNjb3VudC1tZW51JykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICgkKGUudGFyZ2V0KS5oYXNDbGFzcygnYWNjb3VudC1tZW51JykpIHtcclxuICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0oKTtcclxuIiwiJChmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gcGFyc2VOdW0oc3RyKSB7XHJcbiAgICByZXR1cm4gcGFyc2VGbG9hdChcclxuICAgICAgU3RyaW5nKHN0cilcclxuICAgICAgICAucmVwbGFjZSgnLCcsICcuJylcclxuICAgICAgICAubWF0Y2goLy0/XFxkKyg/OlxcLlxcZCspPy9nLCAnJykgfHwgMFxyXG4gICAgICAsIDEwXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgJCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKS5maW5kKCdzZWxlY3QsaW5wdXQnKS5vbignY2hhbmdlIGtleXVwIGNsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKS5jbG9zZXN0KCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpO1xyXG4gICAgdmFyIGN1cnMgPSBwYXJzZU51bSgkdGhpcy5maW5kKCdzZWxlY3QnKS52YWwoKSk7XHJcbiAgICB2YXIgdmFsID0gJHRoaXMuZmluZCgnaW5wdXQnKS52YWwoKTtcclxuICAgIGlmIChwYXJzZU51bSh2YWwpICE9IHZhbCkge1xyXG4gICAgICB2YWwgPSAkdGhpcy5maW5kKCdpbnB1dCcpLnZhbChwYXJzZU51bSh2YWwpKTtcclxuICAgIH1cclxuICAgIHZhbCA9IHBhcnNlTnVtKHZhbCk7XHJcblxyXG4gICAgdmFyIGtvZWYgPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2snKS50cmltKCk7XHJcbiAgICB2YXIgcHJvbW8gPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2stcHJvbW8nKS50cmltKCk7XHJcbiAgICB2YXIgY3VycmVuY3kgPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2stY3VycmVuY3knKS50cmltKCk7XHJcbiAgICB2YXIgcmVzdWx0ID0gMDtcclxuICAgIHZhciBvdXQgPSAwO1xyXG5cclxuICAgIGlmIChrb2VmID09IHByb21vKSB7XHJcbiAgICAgIHByb21vID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoa29lZi5pbmRleE9mKCclJykgPiAwKSB7XHJcbiAgICAgIHJlc3VsdCA9IHBhcnNlTnVtKGtvZWYpICogdmFsICogY3VycyAvIDEwMDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGN1cnMgPSBwYXJzZU51bSgkdGhpcy5maW5kKCdbY29kZT0nICsgY3VycmVuY3kgKyAnXScpLnZhbCgpKTtcclxuICAgICAgcmVzdWx0ID0gcGFyc2VOdW0oa29lZikgKiBjdXJzXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHBhcnNlTnVtKHByb21vKSA+IDApIHtcclxuICAgICAgaWYgKHByb21vLmluZGV4T2YoJyUnKSA+IDApIHtcclxuICAgICAgICBwcm9tbyA9IHBhcnNlTnVtKHByb21vKSAqIHZhbCAqIGN1cnMgLyAxMDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcHJvbW8gPSBwYXJzZU51bShwcm9tbykgKiBjdXJzXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChwcm9tbyA+IDApIHtcclxuICAgICAgICBvdXQgPSBcIjxzcGFuIGNsYXNzPW9sZF9wcmljZT5cIiArIHJlc3VsdC50b0ZpeGVkKDIpICsgXCI8L3NwYW4+IFwiICsgcHJvbW8udG9GaXhlZCgyKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvdXQgPSByZXN1bHQudG9GaXhlZCgyKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3V0ID0gcmVzdWx0LnRvRml4ZWQoMik7XHJcbiAgICB9XHJcblxyXG5cclxuICAgICR0aGlzLmZpbmQoJy5jYWxjLXJlc3VsdF92YWx1ZScpLmh0bWwob3V0KVxyXG4gIH0pLmNsaWNrKClcclxufSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIGVscyA9ICQoJy5hdXRvX2hpZGVfY29udHJvbCcpO1xyXG4gIGlmIChlbHMubGVuZ3RoID09IDApcmV0dXJuO1xyXG5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBcIi5zY3JvbGxfYm94LXNob3dfbW9yZVwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgIGJ1dHRvblllczogZmFsc2UsXHJcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfd2hpdGUgbm90aWZ5X25vdF9iaWdcIlxyXG4gICAgfTtcclxuXHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICB2YXIgY29udGVudCA9ICR0aGlzLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0nKS5jbG9uZSgpO1xyXG4gICAgY29udGVudCA9IGNvbnRlbnRbMF07XHJcbiAgICBjb250ZW50LmNsYXNzTmFtZSArPSAnIHNjcm9sbF9ib3gtaXRlbS1tb2RhbCc7XHJcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBkaXYuY2xhc3NOYW1lID0gJ2NvbW1lbnRzJztcclxuICAgIGRpdi5hcHBlbmQoY29udGVudCk7XHJcbiAgICAkKGRpdikuZmluZCgnLnNjcm9sbF9ib3gtc2hvd19tb3JlJykucmVtb3ZlKCk7XHJcbiAgICAkKGRpdikuZmluZCgnLm1heF90ZXh0X2hpZGUnKVxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUteDInKVxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUnKTtcclxuICAgIGRhdGEucXVlc3Rpb24gPSBkaXYub3V0ZXJIVE1MO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gaGFzU2Nyb2xsKGVsKSB7XHJcbiAgICBpZiAoIWVsKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBlbC5zY3JvbGxIZWlnaHQgPiBlbC5jbGllbnRIZWlnaHQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZWJ1aWxkKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gZWxzLmVxKGkpO1xyXG4gICAgICB2YXIgaXNfaGlkZSA9IGZhbHNlO1xyXG4gICAgICBpZiAoZWwuaGVpZ2h0KCkgPCAxMCkge1xyXG4gICAgICAgIGlzX2hpZGUgPSB0cnVlO1xyXG4gICAgICAgIGVsLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0taGlkZScpLnNob3coMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciB0ZXh0ID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtdGV4dCcpO1xyXG4gICAgICB2YXIgYW5zd2VyID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtYW5zd2VyJyk7XHJcbiAgICAgIHZhciBzaG93X21vcmUgPSBlbC5maW5kKCcuc2Nyb2xsX2JveC1zaG93X21vcmUnKTtcclxuXHJcbiAgICAgIHZhciBzaG93X2J0biA9IGZhbHNlO1xyXG4gICAgICBpZiAoaGFzU2Nyb2xsKHRleHRbMF0pKSB7XHJcbiAgICAgICAgc2hvd19idG4gPSB0cnVlO1xyXG4gICAgICAgIHRleHQucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRleHQuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYW5zd2VyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAvL9C10YHRgtGMINC+0YLQstC10YIg0LDQtNC80LjQvdCwXHJcbiAgICAgICAgaWYgKGhhc1Njcm9sbChhbnN3ZXJbMF0pKSB7XHJcbiAgICAgICAgICBzaG93X2J0biA9IHRydWU7XHJcbiAgICAgICAgICBhbnN3ZXIucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBhbnN3ZXIuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNob3dfYnRuKSB7XHJcbiAgICAgICAgc2hvd19tb3JlLnNob3coKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzaG93X21vcmUuaGlkZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaXNfaGlkZSkge1xyXG4gICAgICAgIGVsLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0taGlkZScpLmhpZGUoMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gICQod2luZG93KS5yZXNpemUocmVidWlsZCk7XHJcbiAgcmVidWlsZCgpO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnNob3dfYWxsJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBjbHMgPSAkKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XHJcbiAgICAkKCcuaGlkZV9hbGxbZGF0YS1jbnRybC1jbGFzc10nKS5zaG93KCk7XHJcbiAgICAkKHRoaXMpLmhpZGUoKTtcclxuICAgICQoJy4nICsgY2xzKS5zaG93KCk7XHJcbiAgfSk7XHJcblxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmhpZGVfYWxsJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBjbHMgPSAkKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XHJcbiAgICAkKCcuc2hvd19hbGxbZGF0YS1jbnRybC1jbGFzc10nKS5zaG93KCk7XHJcbiAgICAkKHRoaXMpLmhpZGUoKTtcclxuICAgICQoJy4nICsgY2xzKS5oaWRlKCk7XHJcbiAgfSk7XHJcbn0pKCk7XHJcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBkZWNsT2ZOdW0obnVtYmVyLCB0aXRsZXMpIHtcclxuICAgIGNhc2VzID0gWzIsIDAsIDEsIDEsIDEsIDJdO1xyXG4gICAgcmV0dXJuIHRpdGxlc1sobnVtYmVyICUgMTAwID4gNCAmJiBudW1iZXIgJSAxMDAgPCAyMCkgPyAyIDogY2FzZXNbKG51bWJlciAlIDEwIDwgNSkgPyBudW1iZXIgJSAxMCA6IDVdXTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpcnN0WmVybyh2KSB7XHJcbiAgICB2ID0gTWF0aC5mbG9vcih2KTtcclxuICAgIGlmICh2IDwgMTApXHJcbiAgICAgIHJldHVybiAnMCcgKyB2O1xyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gdjtcclxuICB9XHJcblxyXG4gIHZhciBjbG9ja3MgPSAkKCcuY2xvY2snKTtcclxuICBpZiAoY2xvY2tzLmxlbmd0aCA+IDApIHtcclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUNsb2NrKCkge1xyXG4gICAgICB2YXIgY2xvY2tzID0gJCh0aGlzKTtcclxuICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xvY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGMgPSBjbG9ja3MuZXEoaSk7XHJcbiAgICAgICAgdmFyIGVuZCA9IG5ldyBEYXRlKGMuZGF0YSgnZW5kJykucmVwbGFjZSgvLS9nLCBcIi9cIikpO1xyXG4gICAgICAgIHZhciBkID0gKGVuZC5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XHJcblxyXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0L/RgNC+0YjQtdC7XHJcbiAgICAgICAgaWYgKGQgPD0gMCkge1xyXG4gICAgICAgICAgYy50ZXh0KGxnKFwicHJvbW9jb2RlX2V4cGlyZXNcIikpO1xyXG4gICAgICAgICAgYy5hZGRDbGFzcygnY2xvY2stZXhwaXJlZCcpO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL9C10YHQu9C4INGB0YDQvtC6INCx0L7Qu9C10LUgMzAg0LTQvdC10LlcclxuICAgICAgICBpZiAoZCA+IDMwICogNjAgKiA2MCAqIDI0KSB7XHJcbiAgICAgICAgICBjLmh0bWwobGcoIFwicHJvbW9jb2RlX2xlZnRfMzBfZGF5c1wiKSk7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzID0gZCAlIDYwO1xyXG4gICAgICAgIGQgPSAoZCAtIHMpIC8gNjA7XHJcbiAgICAgICAgdmFyIG0gPSBkICUgNjA7XHJcbiAgICAgICAgZCA9IChkIC0gbSkgLyA2MDtcclxuICAgICAgICB2YXIgaCA9IGQgJSAyNDtcclxuICAgICAgICBkID0gKGQgLSBoKSAvIDI0O1xyXG5cclxuICAgICAgICB2YXIgc3RyID0gZmlyc3RaZXJvKGgpICsgXCI6XCIgKyBmaXJzdFplcm8obSkgKyBcIjpcIiArIGZpcnN0WmVybyhzKTtcclxuICAgICAgICBpZiAoZCA+IDApIHtcclxuICAgICAgICAgIHN0ciA9IGQgKyBcIiBcIiArIGRlY2xPZk51bShkLCBbbGcoXCJkYXlfY2FzZV8wXCIpLCBsZyhcImRheV9jYXNlXzFcIiksIGxnKFwiZGF5X2Nhc2VfMlwiKV0pICsgXCIgIFwiICsgc3RyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjLmh0bWwoXCLQntGB0YLQsNC70L7RgdGMOiA8c3Bhbj5cIiArIHN0ciArIFwiPC9zcGFuPlwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldEludGVydmFsKHVwZGF0ZUNsb2NrLmJpbmQoY2xvY2tzKSwgMTAwMCk7XHJcbiAgICB1cGRhdGVDbG9jay5iaW5kKGNsb2NrcykoKTtcclxuICB9XHJcbn0pO1xyXG4iLCJ2YXIgY2F0YWxvZ1R5cGVTd2l0Y2hlciA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgY2F0YWxvZyA9ICQoJy5jYXRhbG9nX2xpc3QnKTtcclxuICBpZiAoY2F0YWxvZy5sZW5ndGggPT0gMClyZXR1cm47XHJcblxyXG4gICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKHRoaXMpLnBhcmVudCgpLnNpYmxpbmdzKCkuZmluZCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICAgICQodGhpcykuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICAgIGlmIChjYXRhbG9nKSB7XHJcbiAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdjYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLWxpc3QnKSkge1xyXG4gICAgICAgIGNhdGFsb2cucmVtb3ZlQ2xhc3MoJ25hcnJvdycpO1xyXG4gICAgICAgIHNldENvb2tpZSgnY291cG9uc192aWV3JywgJycpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2NhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbmFycm93JykpIHtcclxuICAgICAgICBjYXRhbG9nLmFkZENsYXNzKCduYXJyb3cnKTtcclxuICAgICAgICBzZXRDb29raWUoJ2NvdXBvbnNfdmlldycsICduYXJyb3cnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBpZiAoZ2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnKSA9PSAnbmFycm93JyAmJiAhY2F0YWxvZy5oYXNDbGFzcygnbmFycm93X29mZicpKSB7XHJcbiAgICBjYXRhbG9nLmFkZENsYXNzKCduYXJyb3cnKTtcclxuICAgICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLW5hcnJvdycpLmFkZENsYXNzKCdjaGVja2VkJyk7XHJcbiAgICAkKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykucmVtb3ZlQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICB9XHJcbn0oKTtcclxuIiwiJChmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLnNkLXNlbGVjdC1zZWxlY3RlZCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA8IDc2OCkge1xyXG4gICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIC8vdmFyIHBhcmVudCA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAgICAgLy92YXIgZHJvcEJsb2NrID0gJChwYXJlbnQpLmZpbmQoJy5zZC1zZWxlY3QtZHJvcCcpO1xyXG5cclxuICAgICAgICAvLyBpZiAoZHJvcEJsb2NrLmlzKCc6aGlkZGVuJykpIHtcclxuICAgICAgICAvLyAgICAgZHJvcEJsb2NrLnNsaWRlRG93bigpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgIGlmICghcGFyZW50Lmhhc0NsYXNzKCdsaW5rZWQnKSkge1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgICAgICAkKCcuc2Qtc2VsZWN0LWRyb3AnKS5maW5kKCdhJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAvLyAgICAgICAgICAgICB2YXIgc2VsZWN0UmVzdWx0ID0gJCh0aGlzKS5odG1sKCk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgICAgICAgICAgICAkKHBhcmVudCkuZmluZCgnaW5wdXQnKS52YWwoc2VsZWN0UmVzdWx0KTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICQocGFyZW50KS5maW5kKCcuc2Qtc2VsZWN0LXNlbGVjdGVkJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLmh0bWwoc2VsZWN0UmVzdWx0KTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XHJcbiAgICAgICAgLy8gICAgICAgICB9KTtcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gfSBlbHNlIHtcclxuICAgICAgICAvLyAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgLy8gICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG4gICAgLy9yZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcblxyXG59KTtcclxuIiwic2VhcmNoID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBvcGVuQXV0b2NvbXBsZXRlO1xyXG5cclxuICAkKCcuc2VhcmNoLWZvcm0taW5wdXQnKS5vbignaW5wdXQnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHF1ZXJ5ID0gJHRoaXMudmFsKCk7XHJcbiAgICB2YXIgZGF0YSA9ICR0aGlzLmNsb3Nlc3QoJ2Zvcm0nKS5zZXJpYWxpemUoKTtcclxuICAgIHZhciBhdXRvY29tcGxldGUgPSAkdGhpcy5jbG9zZXN0KCcuc3RvcmVzX3NlYXJjaCcpLmZpbmQoJy5hdXRvY29tcGxldGUtd3JhcCcpOy8vICQoJyNhdXRvY29tcGxldGUnKSxcclxuICAgIHZhciBhdXRvY29tcGxldGVMaXN0ID0gJChhdXRvY29tcGxldGUpLmZpbmQoJ3VsJyk7XHJcbiAgICBvcGVuQXV0b2NvbXBsZXRlID0gYXV0b2NvbXBsZXRlO1xyXG4gICAgaWYgKHF1ZXJ5Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgdXJsID0gJHRoaXMuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicpIHx8ICcvc2VhcmNoJztcclxuICAgICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICB0eXBlOiAnZ2V0JyxcclxuICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgIGlmIChkYXRhLnN1Z2dlc3Rpb25zKSB7XHJcbiAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3VnZ2VzdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWYobGFuZ1tcImhyZWZfcHJlZml4XCJdLmxlbmd0aD4wICYmIGl0ZW0uZGF0YS5yb3V0ZS5pbmRleE9mKGxhbmdbXCJocmVmX3ByZWZpeFwiXSk9PS0xKXtcclxuICAgICAgICAgICAgICAgICAgaXRlbS5kYXRhLnJvdXRlPScvJytsYW5nW1wiaHJlZl9wcmVmaXhcIl0raXRlbS5kYXRhLnJvdXRlO1xyXG4gICAgICAgICAgICAgICAgICBpdGVtLmRhdGEucm91dGU9aXRlbS5kYXRhLnJvdXRlLnJlcGxhY2UoJy8vJywnLycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSAnPGEgY2xhc3M9XCJhdXRvY29tcGxldGVfbGlua1wiIGhyZWY9XCInICsgaXRlbS5kYXRhLnJvdXRlICsgJ1wiJyArICc+JyArIGl0ZW0udmFsdWUgKyBpdGVtLmNhc2hiYWNrICsgJzwvYT4nO1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgICAgICAgICAgICAgIGxpLmlubmVySFRNTCA9IGh0bWw7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmFwcGVuZChsaSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVJbigpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZSkuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgJChhdXRvY29tcGxldGVMaXN0KS5odG1sKCcnKTtcclxuICAgICAgICAkKGF1dG9jb21wbGV0ZSkuZmFkZU91dCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSkub24oJ2ZvY3Vzb3V0JywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICghJChlLnJlbGF0ZWRUYXJnZXQpLmhhc0NsYXNzKCdhdXRvY29tcGxldGVfbGluaycpKSB7XHJcbiAgICAgIC8vJCgnI2F1dG9jb21wbGV0ZScpLmhpZGUoKTtcclxuICAgICAgJChvcGVuQXV0b2NvbXBsZXRlKS5kZWxheSgxMDApLnNsaWRlVXAoMTAwKVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCdib2R5Jykub24oJ3N1Ym1pdCcsICcuc3RvcmVzLXNlYXJjaF9mb3JtJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciB2YWwgPSAkKHRoaXMpLmZpbmQoJy5zZWFyY2gtZm9ybS1pbnB1dCcpLnZhbCgpO1xyXG4gICAgaWYgKHZhbC5sZW5ndGggPCAyKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnLmZvcm0tcG9wdXAtc2VsZWN0IGxpJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuXHJcbiAgICB2YXIgaGlkZGVuID0gJCh0aGlzKS5kYXRhKCdpZDInKTtcclxuICAgICQoJyMnK2hpZGRlbikuYXR0cigndmFsdWUnLCAkKHRoaXMpLmRhdGEoJ3ZhbHVlMicpKTtcclxuICAgIHZhciB0ZXh0ID0gJCh0aGlzKS5kYXRhKCdpZDEnKTtcclxuICAgICQoJyMnK3RleHQpLmh0bWwoJCh0aGlzKS5kYXRhKCd2YWx1ZTEnKSk7XHJcbiAgICB2YXIgc2VhcmNodGV4dCA9ICQodGhpcykuZGF0YSgnaWQzJyk7XHJcbiAgICAkKCcjJytzZWFyY2h0ZXh0KS5hdHRyKCdwbGFjZWhvbGRlcicsICQodGhpcykuZGF0YSgndmFsdWUzJykpO1xyXG4gICAgdmFyIGxpbWl0ID0gJCh0aGlzKS5kYXRhKCdpZDQnKTtcclxuICAgICQoJyMnK2xpbWl0KS5hdHRyKCd2YWx1ZScsICQodGhpcykuZGF0YSgndmFsdWU0JykpO1xyXG5cclxuICAgIHZhciBhY3Rpb24gPSAkKHRoaXMpLmRhdGEoJ2FjdGlvbicpO1xyXG5cclxuICAgICQodGhpcykuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicsIGFjdGlvbik7XHJcblxyXG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuaGVhZGVyLXNlYXJjaF9mb3JtLWdyb3VwJykuZmluZCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dC1tb2R1bGUtbGFiZWwnKS5hZGRDbGFzcygnY2xvc2UnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0taW5wdXQtbW9kdWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICQodGhpcykuY2xvc2VzdCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dC1tb2R1bGUtbGFiZWwnKS50b2dnbGVDbGFzcygnYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0taW5wdXQtbW9kdWxlLWxhYmVsJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICB9KTtcclxuXHJcbn0oKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgJCgnLmNvdXBvbnMtbGlzdF9pdGVtLWNvbnRlbnQtZ290by1wcm9tb2NvZGUtbGluaycpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgdGhhdCA9ICQodGhpcyk7XHJcbiAgICB2YXIgZXhwaXJlZCA9IHRoYXQuY2xvc2VzdCgnLmNvdXBvbnMtbGlzdF9pdGVtJykuZmluZCgnLmNsb2NrLWV4cGlyZWQnKTtcclxuICAgIHZhciB1c2VySWQgPSAkKHRoYXQpLmRhdGEoJ3VzZXInKTtcclxuICAgIHZhciBpbmFjdGl2ZSA9ICQodGhhdCkuZGF0YSgnaW5hY3RpdmUnKTtcclxuICAgIHZhciBkYXRhX21lc3NhZ2UgPSAkKHRoYXQpLmRhdGEoJ21lc3NhZ2UnKTtcclxuXHJcbiAgICBpZiAoaW5hY3RpdmUpIHtcclxuICAgICAgdmFyIHRpdGxlID0gZGF0YV9tZXNzYWdlID8gZGF0YV9tZXNzYWdlIDogbGcoXCJwcm9tb2NvZGVfaXNfaW5hY3RpdmVcIik7XHJcbiAgICAgIHZhciBtZXNzYWdlID0gbGcoXCJwcm9tb2NvZGVfdmlld19hbGxcIix7XCJ1cmxcIjpcIi9cIitsYW5nW1wiaHJlZl9wcmVmaXhcIl0rXCJjb3Vwb25zXCJ9KTtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcclxuICAgICAgICAndGl0bGUnOiB0aXRsZSxcclxuICAgICAgICAncXVlc3Rpb24nOiBtZXNzYWdlLFxyXG4gICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxyXG4gICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxyXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiAnbm90aWZ5X2JveC1hbGVydCdcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSBpZiAoZXhwaXJlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciB0aXRsZSA9IGxnKFwicHJvbW9jb2RlX2lzX2V4cGlyZXNcIik7XHJcbiAgICAgIHZhciBtZXNzYWdlID0gbGcoXCJwcm9tb2NvZGVfdmlld19hbGxcIix7XCJ1cmxcIjpcIi9cIitsYW5nW1wiaHJlZl9wcmVmaXhcIl0rXCJjb3Vwb25zXCJ9KTtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcclxuICAgICAgICAndGl0bGUnOiB0aXRsZSxcclxuICAgICAgICAncXVlc3Rpb24nOiBtZXNzYWdlLFxyXG4gICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxyXG4gICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxyXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiAnbm90aWZ5X2JveC1hbGVydCdcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSBpZiAoIXVzZXJJZCkge1xyXG4gICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAnYnV0dG9uWWVzJzogZmFsc2UsXHJcbiAgICAgICAgJ25vdHlmeV9jbGFzcyc6IFwibm90aWZ5X2JveC1hbGVydFwiLFxyXG4gICAgICAgICd0aXRsZSc6IGxnKFwidXNlX3Byb21vY29kZVwiKSxcclxuICAgICAgICAncXVlc3Rpb24nOiAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtY291cG9uLW5vcmVnaXN0ZXJcIj4nICtcclxuICAgICAgICAnPGltZyBzcmM9XCIvaW1hZ2VzL3RlbXBsYXRlcy9zd2EucG5nXCIgYWx0PVwiXCI+JyArXHJcbiAgICAgICAgJzxwPjxiPicrbGcoXCJwcm9tb2NvZGVfdXNlX3dpdGhvdXRfY2FzaGJhY2tfb3JfcmVnaXN0ZXJcIikrJzwvYj48L3A+JyArXHJcbiAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveC1idXR0b25zXCI+JyArXHJcbiAgICAgICAgJzxhIGhyZWY9XCInICsgdGhhdC5hdHRyKCdocmVmJykgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJidG4gbm90aWZpY2F0aW9uLWNsb3NlXCI+JytsZyhcInVzZV9wcm9tb2NvZGVcIikrJzwvYT4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIiMnK2xhbmdbXCJocmVmX3ByZWZpeFwiXSsncmVnaXN0cmF0aW9uXCIgY2xhc3M9XCJidG4gYnRuLXRyYW5zZm9ybSBtb2RhbHNfb3BlblwiPicrbGcoXCJyZWdpc3RlclwiKSsnPC9hPicgK1xyXG4gICAgICAgICc8L2Rpdj4nXHJcbiAgICAgIH07XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcjc2hvcF9oZWFkZXItZ290by1jaGVja2JveCcpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcbiAgICAgaWYgKCEkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpKSB7XHJcbiAgICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XHJcbiAgICAgICAgICAgICAndGl0bGUnOiBsZyhcImF0dGVudGlvbnNcIiksXHJcbiAgICAgICAgICAgICAncXVlc3Rpb24nOiBsZyhcInByb21vY29kZV9yZWNvbW1lbmRhdGlvbnNcIiksXHJcbiAgICAgICAgICAgICAnYnV0dG9uWWVzJzogbGcoXCJjbG9zZVwiKSxcclxuICAgICAgICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xyXG4gICAgICAgICB9KTtcclxuICAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5jYXRhbG9nX3Byb2R1Y3RfbGluaycpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcclxuICAgICAgICAnYnV0dG9uWWVzJzogZmFsc2UsXHJcbiAgICAgICAgICAgICdub3R5ZnlfY2xhc3MnOiBcIm5vdGlmeV9ib3gtYWxlcnRcIixcclxuICAgICAgICAgICAgJ3RpdGxlJzogbGcoXCJwcm9kdWN0X3VzZVwiKSxcclxuICAgICAgICAgICAgJ3F1ZXN0aW9uJzogJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWNvdXBvbi1ub3JlZ2lzdGVyXCI+JyArXHJcbiAgICAgICAgJzxpbWcgc3JjPVwiL2ltYWdlcy90ZW1wbGF0ZXMvc3dhLnBuZ1wiIGFsdD1cIlwiPicgK1xyXG4gICAgICAgICc8cD48Yj4nK2xnKFwicHJvZHVjdF91c2Vfd2l0aG91dF9jYXNoYmFja19vcl9yZWdpc3RlclwiKSsnPC9iPjwvcD4nICtcclxuICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWJ1dHRvbnNcIj4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIicgKyB0aGF0LmF0dHIoJ2hyZWYnKSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImJ0biBub3RpZmljYXRpb24tY2xvc2VcIj4nK2xnKFwicHJvZHVjdF91c2VcIikrJzwvYT4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIiNyZWdpc3RyYXRpb25cIiBjbGFzcz1cImJ0biBidG4tdHJhbnNmb3JtIG1vZGFsc19vcGVuXCI+JytsZyhcInJlZ2lzdGVyXCIpKyc8L2E+JyArXHJcbiAgICAgICAgJzwvZGl2Pid9XHJcbiAgICAgICAgKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuYWNjb3VudC13aXRoZHJhdy1tZXRob2RzX2l0ZW0tb3B0aW9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBvcHRpb24gPSAkKHRoaXMpLmRhdGEoJ29wdGlvbi1wcm9jZXNzJyksXHJcbiAgICAgIHBsYWNlaG9sZGVyID0gJyc7XHJcbiAgICBzd2l0Y2ggKG9wdGlvbikge1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X2Nhc2hfbnVtYmVyXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19yX251bWJlclwiKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfcGhvbmVfbnVtYmVyXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSA0OlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19jYXJ0X251bWJlclwiKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgNTpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfZW1haWxcIik7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDY6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X3Bob25lX251bWJlclwiKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgNzpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfc2tyaWxsXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICQoXCIjdXNlcnN3aXRoZHJhdy1iaWxsXCIpLnByZXYoXCIucGxhY2Vob2xkZXJcIikuaHRtbChwbGFjZWhvbGRlcik7XHJcbiAgICAkKCcjdXNlcnN3aXRoZHJhdy1wcm9jZXNzX2lkJykudmFsKG9wdGlvbik7XHJcbiAgfSk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgYWpheEZvcm0oJCgnLmFqYXhfZm9ybScpKTtcclxuXHJcbiAgJCgnLmZvcm0tdGVzdC1saW5rJykub24oJ3N1Ym1pdCcsZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgZm9ybSA9ICQoJy5mb3JtLXRlc3QtbGluaycpO1xyXG4gICAgaWYoZm9ybS5oYXNDbGFzcygnbG9hZGluZycpKXJldHVybjtcclxuICAgIGZvcm0uZmluZCgnLmhlbHAtYmxvY2snKS5odG1sKFwiXCIpO1xyXG5cclxuICAgIHZhciB1cmwgPSBmb3JtLmZpbmQoJ1tuYW1lPXVybF0nKS52YWwoKTtcclxuICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xyXG5cclxuICAgIGlmKHVybC5sZW5ndGg8Myl7XHJcbiAgICAgIGZvcm0uZmluZCgnLmhlbHAtYmxvY2snKS5odG1sKGxnKCdyZXF1aXJlZCcpKTtcclxuICAgICAgZm9ybS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1lbHNle1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICBmb3JtLmZpbmQoJ2lucHV0JykuYXR0cignZGlzYWJsZWQnLHRydWUpO1xyXG4gICAgJC5wb3N0KGZvcm0uYXR0cignYWN0aW9uJykse3VybDp1cmx9LGZ1bmN0aW9uKGQpe1xyXG4gICAgICBmb3JtLmZpbmQoJ2lucHV0JykuYXR0cignZGlzYWJsZWQnLGZhbHNlKTtcclxuICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICBmb3JtLmZpbmQoJy5oZWxwLWJsb2NrJykuaHRtbChkKTtcclxuICAgIH0pO1xyXG4gIH0pXHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLmRvYnJvLWZ1bmRzX2l0ZW0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICQoJyNkb2Jyby1zZW5kLWZvcm0tY2hhcml0eS1wcm9jZXNzJykudmFsKCQodGhpcykuZGF0YSgnaWQnKSk7XHJcbiAgfSk7XHJcblxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdCcpLmFkZENsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtb3BlbicpO1xyXG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLmFkZENsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUtb3BlbicpO1xyXG4gIH0pO1xyXG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtY2xvc2UnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdCcpLnJlbW92ZUNsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtb3BlbicpO1xyXG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUtb3BlbicpO1xyXG4gIH0pO1xyXG59KSgpO1xyXG4iLCIvL3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKSB7XHJcbmZ1bmN0aW9uIHNoYXJlNDIoKXtcclxuICBlPWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXJlNDJpbml0Jyk7XHJcbiAgZm9yICh2YXIgayA9IDA7IGsgPCBlLmxlbmd0aDsgaysrKSB7XHJcbiAgICB2YXIgdSA9IFwiXCI7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29jaWFscycpICE9IC0xKVxyXG4gICAgICB2YXIgc29jaWFscyA9IEpTT04ucGFyc2UoJ1snK2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNvY2lhbHMnKSsnXScpO1xyXG4gICAgdmFyIGljb25fdHlwZT1lW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXR5cGUnKSAhPSAtMT9lW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXR5cGUnKTonJztcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKSAhPSAtMSlcclxuICAgICAgdSA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXVybCcpO1xyXG4gICAgdmFyIHByb21vID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvbW8nKTtcclxuICAgIGlmKHByb21vICYmIHByb21vLmxlbmd0aD4wKSB7XHJcbiAgICAgIHZhciBrZXkgPSAncHJvbW89JyxcclxuICAgICAgICBwcm9tb1N0YXJ0ID0gdS5pbmRleE9mKGtleSksXHJcbiAgICAgICAgcHJvbW9FbmQgPSB1LmluZGV4T2YoJyYnLCBwcm9tb1N0YXJ0KSxcclxuICAgICAgICBwcm9tb0xlbmd0aCA9IHByb21vRW5kID4gcHJvbW9TdGFydCA/IHByb21vRW5kIC0gcHJvbW9TdGFydCAtIGtleS5sZW5ndGggOiB1Lmxlbmd0aCAtIHByb21vU3RhcnQgLSBrZXkubGVuZ3RoO1xyXG4gICAgICBpZihwcm9tb1N0YXJ0ID4gMCkge1xyXG4gICAgICAgIHByb21vID0gdS5zdWJzdHIocHJvbW9TdGFydCArIGtleS5sZW5ndGgsIHByb21vTGVuZ3RoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdmFyIHByb21vdXJsID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvbW91cmwnKTtcclxuICAgIHZhciBzZWxmX3Byb21vID0gKHByb21vICYmIHByb21vLmxlbmd0aCA+IDApPyBcInNldFRpbWVvdXQoZnVuY3Rpb24oKXtzZW5kX3Byb21vKCdcIitwcm9tbytcIicsXCIrcHJvbW91cmwrXCIpO30sMjAwMCk7XCIgOiBcIlwiO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tc2l6ZScpICE9IC0xKVxyXG4gICAgICB2YXIgaWNvbl9zaXplID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi1zaXplJyk7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnKSAhPSAtMSlcclxuICAgICAgdmFyIHQgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWltYWdlJykgIT0gLTEpXHJcbiAgICAgIHZhciBpID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1hZ2UnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1kZXNjcmlwdGlvbicpICE9IC0xKVxyXG4gICAgICB2YXIgZCA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWRlc2NyaXB0aW9uJyk7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF0aCcpICE9IC0xKVxyXG4gICAgICB2YXIgZiA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXBhdGgnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29ucy1maWxlJykgIT0gLTEpXHJcbiAgICAgIHZhciBmbiA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb25zLWZpbGUnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zY3JpcHQtYWZ0ZXInKSkge1xyXG4gICAgICBzZWxmX3Byb21vICs9IFwic2V0VGltZW91dChmdW5jdGlvbigpe1wiK2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNjcmlwdC1hZnRlcicpK1wifSwzMDAwKTtcIjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWYpIHtcclxuICAgICAgZnVuY3Rpb24gcGF0aChuYW1lKSB7XHJcbiAgICAgICAgdmFyIHNjID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpXHJcbiAgICAgICAgICAsIHNyID0gbmV3IFJlZ0V4cCgnXiguKi98KSgnICsgbmFtZSArICcpKFsjP118JCknKTtcclxuICAgICAgICBmb3IgKHZhciBwID0gMCwgc2NMID0gc2MubGVuZ3RoOyBwIDwgc2NMOyBwKyspIHtcclxuICAgICAgICAgIHZhciBtID0gU3RyaW5nKHNjW3BdLnNyYykubWF0Y2goc3IpO1xyXG4gICAgICAgICAgaWYgKG0pIHtcclxuICAgICAgICAgICAgaWYgKG1bMV0ubWF0Y2goL14oKGh0dHBzP3xmaWxlKVxcOlxcL3syLH18XFx3OltcXC9cXFxcXSkvKSlcclxuICAgICAgICAgICAgICByZXR1cm4gbVsxXTtcclxuICAgICAgICAgICAgaWYgKG1bMV0uaW5kZXhPZihcIi9cIikgPT0gMClcclxuICAgICAgICAgICAgICByZXR1cm4gbVsxXTtcclxuICAgICAgICAgICAgYiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdiYXNlJyk7XHJcbiAgICAgICAgICAgIGlmIChiWzBdICYmIGJbMF0uaHJlZilcclxuICAgICAgICAgICAgICByZXR1cm4gYlswXS5ocmVmICsgbVsxXTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvKC4qW1xcL1xcXFxdKS8pWzBdICsgbVsxXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgZiA9IHBhdGgoJ3NoYXJlNDIuanMnKTtcclxuICAgIH1cclxuICAgIGlmICghdSlcclxuICAgICAgdSA9IGxvY2F0aW9uLmhyZWY7XHJcbiAgICBpZiAoIXQpXHJcbiAgICAgIHQgPSBkb2N1bWVudC50aXRsZTtcclxuICAgIGlmICghZm4pXHJcbiAgICAgIGZuID0gJ2ljb25zLnBuZyc7XHJcbiAgICBmdW5jdGlvbiBkZXNjKCkge1xyXG4gICAgICB2YXIgbWV0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtZXRhJyk7XHJcbiAgICAgIGZvciAodmFyIG0gPSAwOyBtIDwgbWV0YS5sZW5ndGg7IG0rKykge1xyXG4gICAgICAgIGlmIChtZXRhW21dLm5hbWUudG9Mb3dlckNhc2UoKSA9PSAnZGVzY3JpcHRpb24nKSB7XHJcbiAgICAgICAgICByZXR1cm4gbWV0YVttXS5jb250ZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gJyc7XHJcbiAgICB9XHJcbiAgICBpZiAoIWQpXHJcbiAgICAgIGQgPSBkZXNjKCk7XHJcbiAgICB1ID0gZW5jb2RlVVJJQ29tcG9uZW50KHUpO1xyXG4gICAgdCA9IGVuY29kZVVSSUNvbXBvbmVudCh0KTtcclxuICAgIHQgPSB0LnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XHJcbiAgICBpID0gZW5jb2RlVVJJQ29tcG9uZW50KGkpO1xyXG4gICAgdmFyIGRfb3JpZz1kLnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XHJcbiAgICBkID0gZW5jb2RlVVJJQ29tcG9uZW50KGQpO1xyXG4gICAgZCA9IGQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcclxuICAgIHZhciBmYlF1ZXJ5ID0gJ3U9JyArIHU7XHJcbiAgICBpZiAoaSAhPSAnbnVsbCcgJiYgaSAhPSAnJylcclxuICAgICAgZmJRdWVyeSA9ICdzPTEwMCZwW3VybF09JyArIHUgKyAnJnBbdGl0bGVdPScgKyB0ICsgJyZwW3N1bW1hcnldPScgKyBkICsgJyZwW2ltYWdlc11bMF09JyArIGk7XHJcbiAgICB2YXIgdmtJbWFnZSA9ICcnO1xyXG4gICAgaWYgKGkgIT0gJ251bGwnICYmIGkgIT0gJycpXHJcbiAgICAgIHZrSW1hZ2UgPSAnJmltYWdlPScgKyBpO1xyXG4gICAgdmFyIHMgPSBuZXcgQXJyYXkoXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwiZmJcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT0nICsgdSArJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgRmFjZWJvb2tcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidmtcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3ZrLmNvbS9zaGFyZS5waHA/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArIHZrSW1hZ2UgKyAnJmRlc2NyaXB0aW9uPScgKyBkICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0JIg0JrQvtC90YLQsNC60YLQtVwiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJvZGtsXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9jb25uZWN0Lm9rLnJ1L29mZmVyP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnJmRlc2NyaXB0aW9uPScrIGQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQlNC+0LHQsNCy0LjRgtGMINCyINCe0LTQvdC+0LrQu9Cw0YHRgdC90LjQutC4XCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInR3aVwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9JyArIHQgKyAnJnVybD0nICsgdSArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIgVHdpdHRlclwiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJncGx1c1wiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vcGx1cy5nb29nbGUuY29tL3NoYXJlP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBHb29nbGUrXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cIm1haWxcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL2Nvbm5lY3QubWFpbC5ydS9zaGFyZT91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgJyZkZXNjcmlwdGlvbj0nICsgZCArICcmaW1hZ2V1cmw9JyArIGkgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiDQnNC+0LXQvCDQnNC40YDQtUBNYWlsLlJ1XCInLFxyXG4gICAgICAnXCIvL3d3dy5saXZlam91cm5hbC5jb20vdXBkYXRlLmJtbD9ldmVudD0nICsgdSArICcmc3ViamVjdD0nICsgdCArICdcIiB0aXRsZT1cItCe0L/Rg9Cx0LvQuNC60L7QstCw0YLRjCDQsiBMaXZlSm91cm5hbFwiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJwaW5cIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3BpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD0nICsgdSArICcmbWVkaWE9JyArIGkgKyAnJmRlc2NyaXB0aW9uPScgKyB0ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD02MDAsIGhlaWdodD0zMDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiBQaW50ZXJlc3RcIicsXHJcbiAgICAgICdcIlwiIG9uY2xpY2s9XCJyZXR1cm4gZmF2KHRoaXMpO1wiIHRpdGxlPVwi0KHQvtGF0YDQsNC90LjRgtGMINCyINC40LfQsdGA0LDQvdC90L7QtSDQsdGA0LDRg9C30LXRgNCwXCInLFxyXG4gICAgICAnXCIjXCIgb25jbGljaz1cInByaW50KCk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQoNCw0YHQv9C10YfQsNGC0LDRgtGMXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInRlbGVncmFtXCIgb25jbGljaz1cIndpbmRvdy5vcGVuKFxcJy8vdGVsZWdyYW0ubWUvc2hhcmUvdXJsP3VybD0nICsgdSArJyZ0ZXh0PScgKyB0ICsgJ1xcJywgXFwndGVsZWdyYW1cXCcsIFxcJ3dpZHRoPTU1MCxoZWlnaHQ9NDQwLGxlZnQ9MTAwLHRvcD0xMDBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgVGVsZWdyYW1cIicsXHJcbiAgICAgICdcInZpYmVyOi8vZm9yd2FyZD90ZXh0PScrIHUgKycgLSAnICsgdCArICdcIiBkYXRhLWNvdW50PVwidmliZXJcIiByZWw9XCJub2ZvbGxvdyBub29wZW5lclwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgVmliZXJcIicsXHJcbiAgICAgICdcIndoYXRzYXBwOi8vc2VuZD90ZXh0PScrIHUgKycgLSAnICsgdCArICdcIiBkYXRhLWNvdW50PVwid2hhdHNhcHBcIiByZWw9XCJub2ZvbGxvdyBub29wZW5lclwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgV2hhdHNBcHBcIidcclxuXHJcbiAgICApO1xyXG5cclxuICAgIHZhciBsID0gJyc7XHJcblxyXG4gICAgaWYoc29jaWFscy5sZW5ndGg+MSl7XHJcbiAgICAgIGZvciAocSA9IDA7IHEgPCBzb2NpYWxzLmxlbmd0aDsgcSsrKXtcclxuICAgICAgICBqPXNvY2lhbHNbcV07XHJcbiAgICAgICAgbCArPSAnPGEgcmVsPVwibm9mb2xsb3dcIiBocmVmPScgKyBzW2pdICsgJyB0YXJnZXQ9XCJfYmxhbmtcIiAnK2dldEljb24oc1tqXSxqLGljb25fdHlwZSxmLGZuLGljb25fc2l6ZSkrJz48L2E+JztcclxuICAgICAgfVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGZvciAoaiA9IDA7IGogPCBzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgbCArPSAnPGEgcmVsPVwibm9mb2xsb3dcIiBocmVmPScgKyBzW2pdICsgJyB0YXJnZXQ9XCJfYmxhbmtcIiAnK2dldEljb24oc1tqXSxqLGljb25fdHlwZSxmLGZuLGljb25fc2l6ZSkrJz48L2E+JztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZVtrXS5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJzaGFyZTQyX3dyYXBcIj4nICsgbCArICc8L3NwYW4+JztcclxuICB9XHJcbiAgXHJcbi8vfSwgZmFsc2UpO1xyXG59XHJcblxyXG5zaGFyZTQyKCk7XHJcblxyXG5mdW5jdGlvbiBnZXRJY29uKHMsaix0LGYsZm4sc2l6ZSkge1xyXG4gIGlmKCFzaXplKXtcclxuICAgIHNpemU9MzI7XHJcbiAgfVxyXG4gIGlmKHQ9PSdjc3MnKXtcclxuICAgIGo9cy5pbmRleE9mKCdkYXRhLWNvdW50PVwiJykrMTI7XHJcbiAgICB2YXIgbD1zLmluZGV4T2YoJ1wiJyxqKS1qO1xyXG4gICAgdmFyIGwyPXMuaW5kZXhPZignLicsaiktajtcclxuICAgIGw9bD5sMiAmJiBsMj4wID9sMjpsO1xyXG4gICAgLy92YXIgaWNvbj0nY2xhc3M9XCJzb2MtaWNvbiBpY29uLScrcy5zdWJzdHIoaixsKSsnXCInO1xyXG4gICAgdmFyIGljb249J2NsYXNzPVwic29jLWljb24tc2QgaWNvbi1zZC0nK3Muc3Vic3RyKGosbCkrJ1wiJztcclxuICB9ZWxzZSBpZih0PT0nc3ZnJyl7XHJcbiAgICB2YXIgc3ZnPVtcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsMTExLjk0LDE3Ny4wOClcIiBkPVwiTTAgMCAwIDcwLjMgMjMuNiA3MC4zIDI3LjEgOTcuNyAwIDk3LjcgMCAxMTUuMkMwIDEyMy4yIDIuMiAxMjguNiAxMy42IDEyOC42TDI4LjEgMTI4LjYgMjguMSAxNTMuMUMyNS42IDE1My40IDE3IDE1NC4yIDYuOSAxNTQuMi0xNCAxNTQuMi0yOC4zIDE0MS40LTI4LjMgMTE3LjlMLTI4LjMgOTcuNy01MiA5Ny43LTUyIDcwLjMtMjguMyA3MC4zLTI4LjMgMCAwIDBaXCIvPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDk4LjI3NCwxNDUuNTIpXCIgZD1cIk0wIDAgOS42IDBDOS42IDAgMTIuNSAwLjMgMTQgMS45IDE1LjQgMy40IDE1LjMgNi4xIDE1LjMgNi4xIDE1LjMgNi4xIDE1LjEgMTkgMjEuMSAyMSAyNyAyMi44IDM0LjYgOC41IDQyLjcgMyA0OC43LTEuMiA1My4zLTAuMyA1My4zLTAuM0w3NC44IDBDNzQuOCAwIDg2LjEgMC43IDgwLjcgOS41IDgwLjMgMTAuMyA3Ny42IDE2LjEgNjQuOCAyOCA1MS4zIDQwLjUgNTMuMSAzOC41IDY5LjMgNjAuMSA3OS4yIDczLjMgODMuMiA4MS40IDgxLjkgODQuOCA4MC44IDg4LjEgNzMuNSA4Ny4yIDczLjUgODcuMkw0OS4zIDg3LjFDNDkuMyA4Ny4xIDQ3LjUgODcuMyA0Ni4yIDg2LjUgNDQuOSA4NS43IDQ0IDgzLjkgNDQgODMuOSA0NCA4My45IDQwLjIgNzMuNyAzNS4xIDY1LjEgMjQuMyA0Ni44IDIwIDQ1LjggMTguMyA0Ni45IDE0LjIgNDkuNiAxNS4yIDU3LjYgMTUuMiA2My4yIDE1LjIgODEgMTcuOSA4OC40IDkuOSA5MC4zIDcuMyA5MC45IDUuNCA5MS4zLTEuNCA5MS40LTEwIDkxLjUtMTcuMyA5MS40LTIxLjQgODkuMy0yNC4yIDg4LTI2LjMgODUtMjUgODQuOC0yMy40IDg0LjYtMTkuOCA4My44LTE3LjkgODEuMi0xNS40IDc3LjktMTUuNSA3MC4zLTE1LjUgNzAuMy0xNS41IDcwLjMtMTQuMSA0OS40LTE4LjggNDYuOC0yMi4xIDQ1LTI2LjUgNDguNy0zNi4xIDY1LjMtNDEuMSA3My44LTQ0LjggODMuMi00NC44IDgzLjItNDQuOCA4My4yLTQ1LjUgODQuOS00Ni44IDg1LjktNDguMyA4Ny01MC41IDg3LjQtNTAuNSA4Ny40TC03My41IDg3LjJDLTczLjUgODcuMi03Ni45IDg3LjEtNzguMiA4NS42LTc5LjMgODQuMy03OC4zIDgxLjUtNzguMyA4MS41LTc4LjMgODEuNS02MC4zIDM5LjQtMzkuOSAxOC4yLTIxLjItMS4zIDAgMCAwIDBcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDEwNi44OCwxODMuNjEpXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKC02Ljg4MDUsLTEwMClcIiBzdHlsZT1cInN0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIj48cGF0aCBkPVwiTSAwLDAgQyA4LjE0NiwwIDE0Ljc2OSwtNi42MjUgMTQuNzY5LC0xNC43NyAxNC43NjksLTIyLjkwNyA4LjE0NiwtMjkuNTMzIDAsLTI5LjUzMyAtOC4xMzYsLTI5LjUzMyAtMTQuNzY5LC0yMi45MDcgLTE0Ljc2OSwtMTQuNzcgLTE0Ljc2OSwtNi42MjUgLTguMTM2LDAgMCwwIE0gMCwtNTAuNDI5IEMgMTkuNjc2LC01MC40MjkgMzUuNjcsLTM0LjQzNSAzNS42NywtMTQuNzcgMzUuNjcsNC45MDMgMTkuNjc2LDIwLjkwMyAwLDIwLjkwMyAtMTkuNjcxLDIwLjkwMyAtMzUuNjY5LDQuOTAzIC0zNS42NjksLTE0Ljc3IC0zNS42NjksLTM0LjQzNSAtMTkuNjcxLC01MC40MjkgMCwtNTAuNDI5XCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsNy41NTE2LC01NC41NzcpXCIgc3R5bGU9XCJzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCI+PHBhdGggZD1cIk0gMCwwIEMgNy4yNjIsMS42NTUgMTQuMjY0LDQuNTI2IDIwLjcxNCw4LjU3OCAyNS41OTUsMTEuNjU0IDI3LjA2NiwxOC4xMDggMjMuOTksMjIuOTg5IDIwLjkxNywyNy44ODEgMTQuNDY5LDI5LjM1MiA5LjU3OSwyNi4yNzUgLTUuMDMyLDE3LjA4NiAtMjMuODQzLDE3LjA5MiAtMzguNDQ2LDI2LjI3NSAtNDMuMzM2LDI5LjM1MiAtNDkuNzg0LDI3Ljg4MSAtNTIuODUyLDIyLjk4OSAtNTUuOTI4LDE4LjEwNCAtNTQuNDYxLDExLjY1NCAtNDkuNTgsOC41NzggLTQzLjEzMiw0LjUzMSAtMzYuMTI4LDEuNjU1IC0yOC44NjcsMCBMIC00OC44MDksLTE5Ljk0MSBDIC01Mi44ODYsLTI0LjAyMiAtNTIuODg2LC0zMC42MzkgLTQ4LjgwNSwtMzQuNzIgLTQ2Ljc2MiwtMzYuNzU4IC00NC4wOSwtMzcuNzc5IC00MS40MTgsLTM3Ljc3OSAtMzguNzQyLC0zNy43NzkgLTM2LjA2NSwtMzYuNzU4IC0zNC4wMjMsLTM0LjcyIEwgLTE0LjQzNiwtMTUuMTIzIDUuMTY5LC0zNC43MiBDIDkuMjQ2LC0zOC44MDEgMTUuODYyLC0zOC44MDEgMTkuOTQzLC0zNC43MiAyNC4wMjgsLTMwLjYzOSAyNC4wMjgsLTI0LjAxOSAxOS45NDMsLTE5Ljk0MSBMIDAsMCBaXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48L2c+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsMTY5Ljc2LDU2LjcyNylcIiBkPVwiTTAgMEMtNS4xLTIuMy0xMC42LTMuOC0xNi40LTQuNS0xMC41LTEtNiA0LjYtMy45IDExLjMtOS40IDgtMTUuNSA1LjctMjIgNC40LTI3LjMgOS45LTM0LjcgMTMuNC00Mi45IDEzLjQtNTguNyAxMy40LTcxLjYgMC42LTcxLjYtMTUuMi03MS42LTE3LjQtNzEuMy0xOS42LTcwLjgtMjEuNy05NC42LTIwLjUtMTE1LjctOS4xLTEyOS44IDguMi0xMzIuMyA0LTEzMy43LTEtMTMzLjctNi4yLTEzMy43LTE2LjEtMTI4LjYtMjQuOS0xMjAuOS0zMC0xMjUuNi0yOS45LTEzMC4xLTI4LjYtMTMzLjktMjYuNS0xMzMuOS0yNi42LTEzMy45LTI2LjctMTMzLjktMjYuOC0xMzMuOS00MC43LTEyNC01Mi4zLTExMS01NC45LTExMy40LTU1LjUtMTE1LjktNTUuOS0xMTguNS01NS45LTEyMC4zLTU1LjktMTIyLjEtNTUuNy0xMjMuOS01NS40LTEyMC4yLTY2LjctMTA5LjctNzUtOTcuMS03NS4zLTEwNi45LTgyLjktMTE5LjMtODcuNS0xMzIuNy04Ny41LTEzNS04Ny41LTEzNy4zLTg3LjQtMTM5LjUtODcuMS0xMjYuOC05NS4yLTExMS44LTEwMC05NS42LTEwMC00My0xMDAtMTQuMi01Ni4zLTE0LjItMTguNS0xNC4yLTE3LjMtMTQuMi0xNi0xNC4zLTE0LjgtOC43LTEwLjgtMy44LTUuNyAwIDBcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMSAwIDAgLTEgNzIuMzgxIDkwLjE3MilcIj48cGF0aCBkPVwiTTg3LjIgMCA4Ny4yIDE3LjEgNzUgMTcuMSA3NSAwIDU3LjkgMCA1Ny45LTEyLjIgNzUtMTIuMiA3NS0yOS4zIDg3LjItMjkuMyA4Ny4yLTEyLjIgMTA0LjMtMTIuMiAxMDQuMyAwIDg3LjIgMFpcIi8+PHBhdGggZD1cIk0wIDAgMC0xOS42IDI2LjItMTkuNkMyNS40LTIzLjcgMjMuOC0yNy41IDIwLjgtMzAuNiAxMC4zLTQyLjEtOS4zLTQyLTIwLjUtMzAuNC0zMS43LTE4LjktMzEuNi0wLjMtMjAuMiAxMS4xLTkuNCAyMS45IDggMjIuNCAxOC42IDEyLjFMMTguNSAxMi4xIDMyLjggMjYuNEMxMy43IDQzLjgtMTUuOCA0My41LTM0LjUgMjUuMS01My44IDYuMS01NC0yNS0zNC45LTQ0LjMtMTUuOS02My41IDE3LjEtNjMuNyAzNC45LTQ0LjYgNDUuNi0zMyA0OC43LTE2LjQgNDYuMiAwTDAgMFpcIi8+PC9nPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDk3LjY3Niw2Mi40MTEpXCIgZD1cIk0wIDBDMTAuMiAwIDE5LjktNC41IDI2LjktMTEuNkwyNi45LTExLjZDMjYuOS04LjIgMjkuMi01LjcgMzIuNC01LjdMMzMuMi01LjdDMzguMi01LjcgMzkuMi0xMC40IDM5LjItMTEuOUwzOS4yLTY0LjhDMzguOS02OC4yIDQyLjgtNzAgNDUtNjcuOCA1My41LTU5LjEgNjMuNi0yMi45IDM5LjctMiAxNy40IDE3LjYtMTIuNSAxNC4zLTI4LjUgMy40LTQ1LjQtOC4zLTU2LjItMzQuMS00NS43LTU4LjQtMzQuMi04NC45LTEuNC05Mi44IDE4LjEtODQuOSAyOC04MC45IDMyLjUtOTQuMyAyMi4zLTk4LjYgNi44LTEwNS4yLTM2LjQtMTA0LjUtNTYuNS02OS42LTcwLjEtNDYuMS02OS40LTQuNi0zMy4zIDE2LjktNS43IDMzLjMgMzAuNyAyOC44IDUyLjcgNS44IDc1LjYtMTguMiA3NC4zLTYzIDUxLjktODAuNSA0MS44LTg4LjQgMjYuNy04MC43IDI2LjgtNjkuMkwyNi43LTY1LjRDMTkuNi03Mi40IDEwLjItNzYuNSAwLTc2LjUtMjAuMi03Ni41LTM4LTU4LjctMzgtMzguNC0zOC0xOC0yMC4yIDAgMCAwTTI1LjUtMzdDMjQuNy0yMi4yIDEzLjctMTMuMyAwLjQtMTMuM0wtMC4xLTEzLjNDLTE1LjQtMTMuMy0yMy45LTI1LjMtMjMuOS0zOS0yMy45LTU0LjMtMTMuNi02NC0wLjEtNjQgMTQuOS02NCAyNC44LTUzIDI1LjUtNDBMMjUuNS0zN1pcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMC40MjYyMyAwIDAgMC40MjYyMyAzNC45OTkgMzUpXCI+PHBhdGggZD1cIk0xNjAuNyAxOS41Yy0xOC45IDAtMzcuMyAzLjctNTQuNyAxMC45TDc2LjQgMC43Yy0wLjgtMC44LTIuMS0xLTMuMS0wLjRDNDQuNCAxOC4yIDE5LjggNDIuOSAxLjkgNzEuN2MtMC42IDEtMC41IDIuMyAwLjQgMy4xbDI4LjQgMjguNGMtOC41IDE4LjYtMTIuOCAzOC41LTEyLjggNTkuMSAwIDc4LjcgNjQgMTQyLjggMTQyLjggMTQyLjggNzguNyAwIDE0Mi44LTY0IDE0Mi44LTE0Mi44QzMwMy40IDgzLjUgMjM5LjQgMTkuNSAxNjAuNyAxOS41ek0yMTcuMiAxNDguN2w5LjkgNDIuMSA5LjUgNDQuNCAtNDQuMy05LjUgLTQyLjEtOS45TDM2LjcgMTAyLjFjMTQuMy0yOS4zIDM4LjMtNTIuNiA2OC4xLTY1LjhMMjE3LjIgMTQ4Ljd6XCIvPjxwYXRoIGQ9XCJNMjIxLjggMTg3LjRsLTcuNS0zM2MtMjUuOSAxMS45LTQ2LjQgMzIuNC01OC4zIDU4LjNsMzMgNy41QzE5NiAyMDYuMiAyMDcuNyAxOTQuNCAyMjEuOCAxODcuNHpcIi8+PC9nPjwvc3ZnPicsXHJcbiAgICAgICcnLC8vcGluXHJcbiAgICAgICcnLC8vZmF2XHJcbiAgICAgICcnLC8vcHJpbnRcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsNzEuMjY0LDEwNi45MylcIiBkPVwiTTAgMCA2OC42IDQzLjFDNzIgNDUuMyA3My4xIDQyLjggNzEuNiA0MS4xTDE0LjYtMTAuMiAxMS43LTM1LjggMCAwWk04Ny4xIDYyLjktMzMuNCAxNy4yQy00MCAxNS4zLTM5LjggOC44LTM0LjkgNy4zTC00LjctMi4yIDYuOC0zNy42QzguMi00MS41IDkuNC00Mi45IDExLjgtNDMgMTQuMy00MyAxNS4zLTQyLjEgMTcuOS0zOS44IDIwLjktMzYuOSAyNS42LTMyLjMgMzMtMjUuMkw2NC40LTQ4LjRDNzAuMi01MS42IDc0LjMtNDkuOSA3NS44LTQzTDk1LjUgNTQuNEM5Ny42IDYyLjkgOTIuNiA2NS40IDg3LjEgNjIuOVwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMzUuMzMsMTE5Ljg1KVwiIGQ9XCJNMCAwQy0yLjQtNS40LTYuNS05LTEyLjItMTAuNi0xNC4zLTExLjItMTYuMy0xMC43LTE4LjItOS45LTQ0LjQgMS4yLTYzLjMgMTkuNi03NCA0Ni4yLTc0LjggNDguMS03NS4zIDUwLjEtNzUuMiA1MS45LTc1LjIgNTguNy02OS4yIDY1LTYyLjYgNjUuNC02MC44IDY1LjUtNTkuMiA2NC45LTU3LjkgNjMuNy01My4zIDU5LjMtNDkuNiA1NC4zLTQ2LjkgNDguNi00NS40IDQ1LjUtNDYgNDMuMy00OC43IDQxLjEtNDkuMSA0MC43LTQ5LjUgNDAuNC01MCA0MC4xLTUzLjUgMzcuNS01NC4zIDM0LjktNTIuNiAzMC44LTQ5LjggMjQuMi00NS40IDE5LTM5LjMgMTUuMS0zNyAxMy42LTM0LjcgMTIuMi0zMiAxMS41LTI5LjYgMTAuOC0yNy43IDExLjUtMjYuMSAxMy40LTI1LjkgMTMuNi0yNS44IDEzLjktMjUuNiAxNC4xLTIyLjMgMTguOC0xOC42IDE5LjYtMTMuNyAxNi41LTkuNiAxMy45LTUuNiAxMS0xLjggNy44IDAuNyA1LjYgMS4zIDMgMCAwTS0xOC4yIDM2LjdDLTE4LjMgMzUuOS0xOC4zIDM1LjQtMTguNCAzNC45LTE4LjYgMzQtMTkuMiAzMy40LTIwLjIgMzMuNC0yMS4zIDMzLjQtMjEuOSAzNC0yMi4yIDM0LjktMjIuMyAzNS41LTIyLjQgMzYuMi0yMi41IDM2LjktMjMuMiA0MC4zLTI1LjIgNDIuNi0yOC42IDQzLjYtMjkuMSA0My43LTI5LjUgNDMuNy0yOS45IDQzLjgtMzEgNDQuMS0zMi40IDQ0LjItMzIuNCA0NS44LTMyLjUgNDcuMS0zMS41IDQ3LjktMjkuNiA0OC0yOC40IDQ4LjEtMjYuNSA0Ny41LTI1LjQgNDYuOS0yMC45IDQ0LjctMTguNyA0MS42LTE4LjIgMzYuN00tMjUuNSA1MS4yQy0yOCA1Mi4xLTMwLjUgNTIuOC0zMy4yIDUzLjItMzQuNSA1My40LTM1LjQgNTQuMS0zNS4xIDU1LjYtMzQuOSA1Ny0zNCA1Ny41LTMyLjYgNTcuNC0yNCA1Ni42LTE3LjMgNTMuNC0xMi42IDQ2LTEwLjUgNDIuNS05LjIgMzcuNS05LjQgMzMuOC05LjUgMzEuMi05LjkgMzAuNS0xMS40IDMwLjUtMTMuNiAzMC42LTEzLjMgMzIuNC0xMy41IDMzLjctMTMuNyAzNS43LTE0LjIgMzcuNy0xNC43IDM5LjctMTYuMyA0NS40LTE5LjkgNDkuMy0yNS41IDUxLjJNLTM4IDY0LjRDLTM3LjkgNjUuOS0zNyA2Ni41LTM1LjUgNjYuNC0yMy4yIDY1LjgtMTMuOSA2Mi4yLTYuNyA1Mi41LTIuNSA0Ni45LTAuMiAzOS4yIDAgMzIuMiAwIDMxLjEgMCAzMCAwIDI5LTAuMSAyNy44LTAuNiAyNi45LTEuOSAyNi45LTMuMiAyNi45LTMuOSAyNy42LTQgMjktNC4zIDM0LjItNS4zIDM5LjMtNy4zIDQ0LjEtMTEuMiA1My41LTE4LjYgNTguNi0yOC4xIDYxLjEtMzAuNyA2MS43LTMzLjIgNjIuMi0zNS44IDYyLjUtMzcgNjIuNS0zOCA2Mi44LTM4IDY0LjRNMTEuNSA3NC4xQzYuNiA3OC4zIDAuOSA4MC44LTUuMyA4Mi40LTIwLjggODYuNS0zNi41IDg3LjUtNTIuNCA4NS4zLTYwLjUgODQuMi02OC4zIDgyLjEtNzUuNCA3OC4xLTgzLjggNzMuNC04OS42IDY2LjYtOTIuMiA1Ny4xLTk0IDUwLjQtOTQuOSA0My42LTk1LjIgMzYuNi05NS43IDI2LjQtOTUuNCAxNi4zLTkyLjggNi4zLTg5LjgtNS4zLTgzLjItMTMuOC03MS45LTE4LjMtNzAuNy0xOC44LTY5LjUtMTkuNS02OC4zLTIwLTY3LjItMjAuNC02Ni44LTIxLjItNjYuOC0yMi40LTY2LjktMzAuNC02Ni44LTM4LjQtNjYuOC00Ni43LTYzLjktNDMuOS02MS44LTQxLjgtNjAuMy00MC4xLTU1LjktMzUuMS01MS43LTMwLjktNDcuMS0yNi4xLTQ0LjctMjMuNy00NS43LTIzLjgtNDIuMS0yMy44LTM3LjgtMjMuOS0zMS0yNC4xLTI2LjgtMjMuOC0xOC42LTIzLjEtMTAuNi0yMi4xLTIuNy0xOS43IDcuMi0xNi43IDE1LjItMTEuNCAxOS4yLTEuMyAyMC4zIDEuMyAyMS40IDQgMjIgNi44IDI1LjkgMjIuOSAyNS40IDM4LjkgMjIuMiA1NSAyMC42IDYyLjQgMTcuNSA2OSAxMS41IDc0LjFcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsMTMwLjg0LDExMi43KVwiIGQ9XCJNMCAwQy0xLjYgMC45LTkuNCA1LjEtMTAuOCA1LjctMTIuMyA2LjMtMTMuNCA2LjYtMTQuNSA1LTE1LjYgMy40LTE4LjktMC4xLTE5LjktMS4xLTIwLjgtMi4yLTIxLjgtMi4zLTIzLjQtMS40LTI1LTAuNS0zMC4xIDEuNC0zNi4xIDcuMS00MC43IDExLjUtNDMuNyAxNy00NC42IDE4LjYtNDUuNSAyMC4zLTQ0LjYgMjEuMS00My44IDIxLjktNDMgMjIuNi00Mi4xIDIzLjctNDEuMyAyNC42LTQwLjQgMjUuNS00MC4xIDI2LjItMzkuNSAyNy4yLTM5IDI4LjMtMzkuMiAyOS4zLTM5LjYgMzAuMS0zOS45IDMwLjktNDIuOSAzOS00NC4xIDQyLjMtNDUuMyA0NS41LTQ2LjcgNDUtNDcuNiA0NS4xLTQ4LjYgNDUuMS00OS42IDQ1LjMtNTAuNyA0NS4zLTUxLjggNDUuNC01My42IDQ1LTU1LjEgNDMuNS01Ni42IDQxLjktNjEgMzguMi02MS4zIDMwLjItNjEuNiAyMi4zLTU2LjEgMTQuNC01NS4zIDEzLjMtNTQuNSAxMi4yLTQ0LjgtNS4xLTI4LjYtMTIuMS0xMi40LTE5LjItMTIuNC0xNy4xLTkuNC0xNi45LTYuNC0xNi44IDAuMy0xMy40IDEuOC05LjYgMy4zLTUuOSAzLjQtMi43IDMtMiAyLjYtMS4zIDEuNi0wLjkgMCAwTS0yOS43LTM4LjNDLTQwLjQtMzguMy01MC4zLTM1LjEtNTguNi0yOS42TC03OC45LTM2LjEtNzIuMy0xNi41Qy03OC42LTcuOC04Mi4zIDIuOC04Mi4zIDE0LjQtODIuMyA0My40LTU4LjcgNjcuMS0yOS43IDY3LjEtMC42IDY3LjEgMjMgNDMuNCAyMyAxNC40IDIzLTE0LjctMC42LTM4LjMtMjkuNy0zOC4zTS0yOS43IDc3LjZDLTY0LjYgNzcuNi05Mi45IDQ5LjMtOTIuOSAxNC40LTkyLjkgMi40LTg5LjYtOC44LTgzLjktMTguM0wtOTUuMy01Mi4yLTYwLjItNDFDLTUxLjItNDYtNDAuOC00OC45LTI5LjctNDguOSA1LjMtNDguOSAzMy42LTIwLjYgMzMuNiAxNC40IDMzLjYgNDkuMyA1LjMgNzcuNi0yOS43IDc3LjZcIi8+PC9zdmc+JyxcclxuICAgIF07XHJcbiAgICB2YXIgaWNvbj1zdmdbal07XHJcbiAgICB2YXIgY3NzPScgc3R5bGU9XCJ3aWR0aDonK3NpemUrJ3B4O2hlaWdodDonK3NpemUrJ3B4XCIgJztcclxuICAgIGljb249JzxzdmcgY2xhc3M9XCJzb2MtaWNvbi1zZCBpY29uLXNkLXN2Z1wiJytjc3MraWNvbi5zdWJzdHJpbmcoNCk7XHJcbiAgICBpY29uPSc+JytpY29uLnN1YnN0cmluZygwLCBpY29uLmxlbmd0aCAtIDEpO1xyXG4gIH1lbHNle1xyXG4gICAgaWNvbj0nc3R5bGU9XCJkaXNwbGF5OmlubGluZS1ibG9jazt2ZXJ0aWNhbC1hbGlnbjpib3R0b207d2lkdGg6JytzaXplKydweDtoZWlnaHQ6JytzaXplKydweDttYXJnaW46MCA2cHggNnB4IDA7cGFkZGluZzowO291dGxpbmU6bm9uZTtiYWNrZ3JvdW5kOnVybCgnICsgZiArIGZuICsgJykgLScgKyBzaXplICogaiArICdweCAwIG5vLXJlcGVhdDsgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcIidcclxuICB9XHJcbiAgcmV0dXJuIGljb247XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZhdihhKSB7XHJcbiAgdmFyIHRpdGxlID0gZG9jdW1lbnQudGl0bGU7XHJcbiAgdmFyIHVybCA9IGRvY3VtZW50LmxvY2F0aW9uO1xyXG4gIHRyeSB7XHJcbiAgICB3aW5kb3cuZXh0ZXJuYWwuQWRkRmF2b3JpdGUodXJsLCB0aXRsZSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgd2luZG93LnNpZGViYXIuYWRkUGFuZWwodGl0bGUsIHVybCwgJycpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBpZiAodHlwZW9mIChvcGVyYSkgPT0gJ29iamVjdCcgfHwgd2luZG93LnNpZGViYXIpIHtcclxuICAgICAgICBhLnJlbCA9ICdzaWRlYmFyJztcclxuICAgICAgICBhLnRpdGxlID0gdGl0bGU7XHJcbiAgICAgICAgYS51cmwgPSB1cmw7XHJcbiAgICAgICAgYS5ocmVmID0gdXJsO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGFsZXJ0KCfQndCw0LbQvNC40YLQtSBDdHJsLUQsINGH0YLQvtCx0Ysg0LTQvtCx0LDQstC40YLRjCDRgdGC0YDQsNC90LjRhtGDINCyINC30LDQutC70LDQtNC60LgnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbmRfcHJvbW8ocHJvbW8sIHByb21vdXJsKXtcclxuICAkLmFqYXgoe1xyXG4gICAgbWV0aG9kOiBcInBvc3RcIixcclxuICAgIHVybDogcHJvbW91cmwsXHJcbiAgICAvL3VybDogXCIvYWNjb3VudC9wcm9tb1wiLFxyXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgIGRhdGE6IHtwcm9tbzogcHJvbW99LFxyXG4gICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICBpZiAoZGF0YS50aXRsZSAhPSBudWxsICYmIGRhdGEubWVzc2FnZSAhPSBudWxsKSB7XHJcbiAgICAgICAgb25fcHJvbW89JCgnLm9uX3Byb21vJyk7XHJcbiAgICAgICAgaWYob25fcHJvbW8ubGVuZ3RoPT0wIHx8ICFvbl9wcm9tby5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkYXRhLm1lc3NhZ2VcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBvbl9wcm9tby5zaG93KCk7XHJcbiAgICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxufVxyXG4iLCIkKCcuc2Nyb2xsX2JveC10ZXh0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuXHJcbiAgICQodGhpcykuY2xvc2VzdCgnLnNjcm9sbF9ib3gnKS5maW5kKCcuc2Nyb2xsX2JveC1pdGVtJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbF9ib3gtaXRlbS1sb3cnKTtcclxuXHJcbn0pOyIsInZhciBwbGFjZWhvbGRlciA9IChmdW5jdGlvbigpe1xyXG4gIGZ1bmN0aW9uIG9uQmx1cigpe1xyXG4gICAgdmFyIGlucHV0VmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgaWYgKCBpbnB1dFZhbHVlID09IFwiXCIgKSB7XHJcbiAgICAgICQodGhpcykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnZm9jdXNlZCcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25Gb2N1cygpe1xyXG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdmb2N1c2VkJyk7XHJcbiAgfVxyXG5cclxuXHJcbiAgZnVuY3Rpb24gcnVuKHBhcikge1xyXG4gICAgdmFyIGVscztcclxuICAgIGlmKCFwYXIpXHJcbiAgICAgIGVscz0kKCcuZm9ybS1ncm91cCBbcGxhY2Vob2xkZXJdJyk7XHJcbiAgICBlbHNlXHJcbiAgICAgIGVscz0kKHBhcikuZmluZCgnLmZvcm0tZ3JvdXAgW3BsYWNlaG9sZGVyXScpO1xyXG5cclxuICAgIGVscy5mb2N1cyhvbkZvY3VzKTtcclxuICAgIGVscy5ibHVyKG9uQmx1cik7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaTxlbHMubGVuZ3RoO2krKyl7XHJcbiAgICAgIHZhciBlbD1lbHMuZXEoaSk7XHJcbiAgICAgIHZhciB0ZXh0ID0gZWwuYXR0cigncGxhY2Vob2xkZXInKTtcclxuICAgICAgZWwuYXR0cigncGxhY2Vob2xkZXInLCcnKTtcclxuICAgICAgaWYodGV4dC5sZW5ndGg8Miljb250aW51ZTtcclxuICAgICAgLy9pZihlbC5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmxlbmd0aD09MClyZXR1cm47XHJcblxyXG4gICAgICB2YXIgaW5wdXRWYWx1ZSA9IGVsLnZhbCgpO1xyXG4gICAgICB2YXIgZWxfaWQgPSBlbC5hdHRyKCdpZCcpO1xyXG4gICAgICBpZighZWxfaWQpe1xyXG4gICAgICAgIGVsX2lkPSdlbF9mb3Jtc18nK01hdGgucm91bmQoTWF0aC5yYW5kb20oKSoxMDAwMCk7XHJcbiAgICAgICAgZWwuYXR0cignaWQnLGVsX2lkKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZih0ZXh0LmluZGV4T2YoJ3wnKT4wKXtcclxuICAgICAgICB0ZXh0PXRleHQuc3BsaXQoJ3wnKTtcclxuICAgICAgICB0ZXh0PXRleHRbMF0rXCI8c3Bhbj5cIit0ZXh0WzFdK1wiPC9zcGFuPlwiXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBkaXYgPSAkKCc8bGFiZWwvPicse1xyXG4gICAgICAgICdjbGFzcyc6J3BsYWNlaG9sZGVyJyxcclxuICAgICAgICAnaHRtbCc6IHRleHQsXHJcbiAgICAgICAgJ2Zvcic6ZWxfaWRcclxuICAgICAgfSk7XHJcbiAgICAgIGVsLmJlZm9yZShkaXYpO1xyXG5cclxuICAgICAgb25Gb2N1cy5iaW5kKGVsKSgpXHJcbiAgICAgIG9uQmx1ci5iaW5kKGVsKSgpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBydW4oKTtcclxuICByZXR1cm4gcnVuO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcuYWpheF9sb2FkJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHVybCA9ICQodGhhdCkuYXR0cignaHJlZicpO1xyXG4gICAgICAgIHZhciB0b3AgPSBNYXRoLm1heChkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCk7XHJcbiAgICAgICAgdmFyIHN0b3Jlc1NvcnQgPSAkKCcuY2F0YWxvZy1zdG9yZXNfc29ydCcpOy8v0LHQu9C+0Log0YHQvtGA0YLQuNGA0L7QstC60Lgg0Y3Qu9C10LzQtdC90YLQvtCyXHJcbiAgICAgICAgdmFyIHRhYmxlID0gJCgndGFibGUudGFibGUnKTsvL9GC0LDQsdC70LjRhtCwINCyIGFjY291bnRcclxuICAgICAgICAvL3Njcm9sbCDRgtGD0LTQsCDQuNC70Lgg0YLRg9C00LBcclxuICAgICAgICB2YXIgc2Nyb2xsVG9wID0gc3RvcmVzU29ydC5sZW5ndGggPyAkKHN0b3Jlc1NvcnRbMF0pLm9mZnNldCgpLnRvcCAtICQoJyNoZWFkZXI+KicpLmVxKDApLmhlaWdodCgpIC0gNTAgOiAwO1xyXG4gICAgICAgIGlmIChzY3JvbGxUb3AgPT09MCAmJiB0YWJsZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2Nyb2xsVG9wID0gJCh0YWJsZVswXSkub2Zmc2V0KCkudG9wIC0gJCgnI2hlYWRlcj4qJykuZXEoMCkuaGVpZ2h0KCkgLSA1MDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQodGhhdCkuYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgICAkLmdldCh1cmwsIHsnZyc6J2FqYXhfbG9hZCd9LCBmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSAkKGRhdGEpLmZpbmQoJyNjb250ZW50LXdyYXAnKS5odG1sKCk7XHJcbiAgICAgICAgICAgICQoJ2JvZHknKS5maW5kKCcjY29udGVudC13cmFwJykuaHRtbChjb250ZW50KTtcclxuICAgICAgICAgICAgc2hhcmU0MigpOy8vdCDQvtGC0L7QsdGA0LDQt9C40LvQuNGB0Ywg0LrQvdC+0L/QutC4INCf0L7QtNC10LvQuNGC0YzRgdGPXHJcbiAgICAgICAgICAgIHNkVG9vbHRpcC5zZXRFdmVudHMoKTsvL9GA0LDQsdC+0YLQsNC70Lgg0YLRg9C70YLQuNC/0YtcclxuICAgICAgICAgICAgYmFubmVyLnJlZnJlc2goKTsvL9C+0LHQvdC+0LLQuNGC0Ywg0LHQsNC90L3QtdGAINC+0YIg0LPRg9Cz0LtcclxuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKFwib2JqZWN0IG9yIHN0cmluZ1wiLCBcIlRpdGxlXCIsIHVybCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodG9wID4gc2Nyb2xsVG9wKSB7XHJcbiAgICAgICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiBzY3JvbGxUb3B9LCA1MDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQodGhhdCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7dHlwZTonZXJyJywgJ3RpdGxlJzpsZygnZXJyb3InKSwgJ21lc3NhZ2UnOmxnKCdlcnJvcl9xdWVyeWluZ19kYXRhJyl9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuXHJcbn0pKCk7XHJcbiIsImJhbm5lciA9IChmdW5jdGlvbigpIHtcclxuICAgIGZ1bmN0aW9uIHJlZnJlc2goKXtcclxuICAgICAgICBmb3IoaT0wO2k8JCgnLmFkc2J5Z29vZ2xlJykubGVuZ3RoO2krKykge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgKGFkc2J5Z29vZ2xlID0gd2luZG93LmFkc2J5Z29vZ2xlIHx8IFtdKS5wdXNoKHt9KTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB7cmVmcmVzaDogcmVmcmVzaH1cclxufSkoKTsiLCJ2YXIgY291bnRyeV9zZWxlY3QgPSBmdW5jdGlvbigpe1xyXG5cclxuICAgICQoJy5oZWFkZXItY291bnRyaWVzX2RpYWxvZy1jbG9zZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGRpYWxvZ0Nsb3NlKHRoaXMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLmhlYWRlci1jb3VudHJpZXNfZGlhbG9nLWRpYWxvZy1idXR0b24tYXBwbHknKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZGF0ZSA9IG5ldyhEYXRlKTtcclxuICAgICAgICBkYXRlID0gTWF0aC5yb3VuZChkYXRlLmdldFRpbWUoKS8xMDAwKTtcclxuICAgICAgICBzZXRDb29raWVBamF4KCdfc2RfY291bnRyeV9kaWFsb2dfY2xvc2UnLCBkYXRlLCA3KTtcclxuICAgICAgICBkaWFsb2dDbG9zZSh0aGlzKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5oZWFkZXItY291bnRyaWVzX2RpYWxvZy1kaWFsb2ctYnV0dG9uLWNob29zZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INC60LvQsNGB0YEsINC40LzQuNGC0LjRgNC+0LLQsNGC0YwgaG92ZXJcclxuICAgICAgICAkKCcjaGVhZGVyLXVwbGluZS1yZWdpb24tc2VsZWN0LWJ1dHRvbicpLmFkZENsYXNzKFwib3BlblwiKTtcclxuICAgICAgICBkaWFsb2dDbG9zZSh0aGlzKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5oZWFkZXItdXBsaW5lX2xhbmctbGlzdCcpLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgZGlhbG9nQ2xvc2UgPSBmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgJCgnLmhlYWRlci11cGxpbmVfbGFuZy1saXN0JykucmVtb3ZlQ2xhc3MoJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgJChlbGVtKS5jbG9zZXN0KCcuaGVhZGVyLWNvdW50cmllc19kaWFsb2cnKS5mYWRlT3V0KCk7XHJcbiAgICB9O1xyXG59KCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB2YXIgc2xpZGVyID0gJChcIiNmaWx0ZXItc2xpZGVyLXByaWNlXCIpO1xyXG4gICAgdmFyIHRleHRTdGFydCA9ICQoJyNzbGlkZXItcHJpY2Utc3RhcnQnKTtcclxuICAgIHZhciB0ZXh0RmluaXNoID0gJCgnI3NsaWRlci1wcmljZS1lbmQnKTtcclxuXHJcbiAgICB2YXIgc3RhcnRSYW5nZSA9IHBhcnNlSW50KCQodGV4dFN0YXJ0KS5kYXRhKCdyYW5nZScpLCAxMCksXHJcbiAgICAgICAgZmluaXNoUmFuZ2UgPSBwYXJzZUludCgkKHRleHRGaW5pc2gpLmRhdGEoJ3JhbmdlJyksIDEwKSxcclxuICAgICAgICBzdGFydFVzZXIgPSBwYXJzZUludCgkKHRleHRTdGFydCkuZGF0YSgndXNlcicpLCAxMCksXHJcbiAgICAgICAgZmluaXNoVXNlciA9IHBhcnNlSW50KCQodGV4dEZpbmlzaCkuZGF0YSgndXNlcicpLCAxMCk7XHJcbiAgICAvL2NvbnNvbGUubG9nKHN0YXJ0UmFuZ2UsIGZpbmlzaFJhbmdlLCBzdGFydFVzZXIsIGZpbmlzaFVzZXIpO1xyXG4gICAgc2xpZGVyLnNsaWRlcih7XHJcbiAgICAgICAgcmFuZ2U6IHRydWUsXHJcbiAgICAgICAgbWluOiBzdGFydFJhbmdlLFxyXG4gICAgICAgIG1heDogZmluaXNoUmFuZ2UsXHJcbiAgICAgICAgdmFsdWVzOiBbc3RhcnRVc2VyLFxyXG4gICAgICAgICAgICBmaW5pc2hVc2VyXSxcclxuICAgICAgICBzbGlkZTogZnVuY3Rpb24gKGV2ZW50LCB1aSkge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh1aS52YWx1ZXNbIDAgXSArIFwiIC0gXCIgKyB1aS52YWx1ZXNbIDEgXSk7XHJcbiAgICAgICAgICAgICQodGV4dFN0YXJ0KS52YWwodWkudmFsdWVzWzBdKTtcclxuICAgICAgICAgICAgJCh0ZXh0RmluaXNoKS52YWwodWkudmFsdWVzWzFdKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gcHJpY2VTdGFydENoYW5nZShlKSB7XHJcbiAgICAgICAgdmFyIHRoYXQgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICBzdHJWYWx1ZSA9IHRoYXQudmFsKCksXHJcbiAgICAgICAgICAgIGludFZhbHVlID0gcGFyc2VJbnQoc3RyVmFsdWUpIHx8IDAsLy/QtdGB0LvQuCDQvdC10L/RgNCw0LLQuNC70YzQvdC+LCDRgtC+IDBcclxuICAgICAgICAgICAgc3RhcnRSYW5nZSA9IHBhcnNlSW50KHRoYXQuZGF0YSgncmFuZ2UnKSksXHJcbiAgICAgICAgICAgIGZpbmlzaFJhbmdlID0gcGFyc2VJbnQodGV4dEZpbmlzaC52YWwoKSk7XHJcblxyXG4gICAgICAgIGlmIChpbnRWYWx1ZSA8IHN0YXJ0UmFuZ2UpIHsgLy/QtdGB0LvQuCDQvNC10L3RjNGI0LUg0LTQuNCw0L/QsNC30L7QvdCwLCDRgtC+INC/0L4g0L3QuNC20L3QtdC80YMg0L/RgNC10LTQtdC70YNcclxuICAgICAgICAgICAgaW50VmFsdWUgPSBzdGFydFJhbmdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW50VmFsdWUgPiBmaW5pc2hSYW5nZSkgeyAvL9C10YHQu9C4INCy0YvRiNC1INC00LjQsNC/0LDQt9C+0L3QsCwg0YLQviAg0LLQtdGA0YXQvdC40LzRgyDQv9GA0LXQtNC10LvRg1xyXG4gICAgICAgICAgICBpbnRWYWx1ZSA9IGZpbmlzaFJhbmdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzbGlkZXIuc2xpZGVyKCd2YWx1ZXMnLCAwLCBpbnRWYWx1ZSk7IC8v0L3QvtCy0L7QtSDQt9C90LDRh9C10L3QuNC1INGB0LvQsNC50LTQtdGA0LBcclxuICAgICAgICB0aGF0LnZhbChpbnRWYWx1ZSk7ICAvL9C/0L7QstGC0YDQvtGP0LXQvCDQtdCz0L4g0LTQu9GPINGB0LDQvNC+0LPQviDQv9C+0LvRj1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHByaWNlRmluaXNoQ2hhbmdlKGUpIHtcclxuICAgICAgICB2YXIgdGhhdCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgIHN0YXJ0UmFuZ2UgPSBwYXJzZUludCh0ZXh0U3RhcnQudmFsKCkpLFxyXG4gICAgICAgICAgICBzdHJWYWx1ZSA9IHRoYXQudmFsKCksXHJcbiAgICAgICAgICAgIGZpbmlzaFJhbmdlID0gcGFyc2VJbnQodGhhdC5kYXRhKCdyYW5nZScpKSxcclxuICAgICAgICAgICAgaW50VmFsdWUgPSBwYXJzZUludChzdHJWYWx1ZSkgfHwgZmluaXNoUmFuZ2U7Ly/QtdGB0LvQuCDQvdC10L/RgNCw0LLQuNC70YzQvdC+LCDRgtC+INC80LDQutGB0LjQvNGD0LxcclxuXHJcbiAgICAgICAgaWYgKGludFZhbHVlIDwgc3RhcnRSYW5nZSkgeyAvL9C10YHQu9C4INC80LXQvdGM0YjQtSDQtNC40LDQv9Cw0LfQvtC90LAsINGC0L4g0L/QviDQvdC40LbQvdC10LzRgyDQv9GA0LXQtNC10LvRg1xyXG4gICAgICAgICAgICBpbnRWYWx1ZSA9IHN0YXJ0UmFuZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnRWYWx1ZSA+IGZpbmlzaFJhbmdlKSB7IC8v0LXRgdC70Lgg0LLRi9GI0LUg0LTQuNCw0L/QsNC30L7QvdCwLCDRgtC+ICDQstC10YDRhdC90LjQvNGDINC/0YDQtdC00LXQu9GDXHJcbiAgICAgICAgICAgIGludFZhbHVlID0gZmluaXNoUmFuZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNsaWRlci5zbGlkZXIoJ3ZhbHVlcycsIDEsIGludFZhbHVlKTsgLy/QvdC+0LLQvtC1INC30L3QsNGH0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsFxyXG4gICAgICAgIHRoYXQudmFsKGludFZhbHVlKTsgIC8v0L/QvtCy0YLRgNC+0Y/QtdC8INC10LPQviDQtNC70Y8g0YHQsNC80L7Qs9C+INC/0L7Qu9GPXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRleHRTdGFydC5vbignY2hhbmdlJywgcHJpY2VTdGFydENoYW5nZSk7Ly/Qv9GA0Lgg0LjQt9C80LXQvdC10L3QuNC40Lgg0L/QvtC70LXQuSDQstCy0L7QtNCwINGG0LXQvdGLXHJcbiAgICB0ZXh0RmluaXNoLm9uKCdjaGFuZ2UnLCBwcmljZUZpbmlzaENoYW5nZSk7Ly/Qv9GA0Lgg0LjQt9C80LXQvdC10L3QuNC40Lgg0L/QvtC70LXQuSDQstCy0L7QtNCwINGG0LXQvdGLXHJcblxyXG59KSgpOyIsInZhciBub3RpZmljYXRpb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gIHZhciBjb250ZWluZXI7XHJcbiAgdmFyIG1vdXNlT3ZlciA9IDA7XHJcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xyXG4gIHZhciBhbmltYXRpb25FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCc7XHJcbiAgdmFyIHRpbWUgPSAxMDAwMDtcclxuXHJcbiAgdmFyIG5vdGlmaWNhdGlvbl9ib3ggPSBmYWxzZTtcclxuICB2YXIgaXNfaW5pdCA9IGZhbHNlO1xyXG4gIHZhciBjb25maXJtX29wdCA9IHtcclxuICAgIC8vIHRpdGxlOiBsZygnZGVsZXRpbmcnKSxcclxuICAgIC8vIHF1ZXN0aW9uOiBsZygnYXJlX3lvdV9zdXJlX3RvX2RlbGV0ZScpLFxyXG4gICAgLy8gYnV0dG9uWWVzOiBsZygneWVzJyksXHJcbiAgICAvLyBidXR0b25ObzogbGcoJ25vJyksXHJcbiAgICBjYWxsYmFja1llczogZmFsc2UsXHJcbiAgICBjYWxsYmFja05vOiBmYWxzZSxcclxuICAgIG9iajogZmFsc2UsXHJcbiAgICBidXR0b25UYWc6ICdkaXYnLFxyXG4gICAgYnV0dG9uWWVzRG9wOiAnJyxcclxuICAgIGJ1dHRvbk5vRG9wOiAnJ1xyXG4gIH07XHJcbiAgdmFyIGFsZXJ0X29wdCA9IHtcclxuICAgIHRpdGxlOiBcIlwiLFxyXG4gICAgcXVlc3Rpb246ICdtZXNzYWdlJyxcclxuICAgIC8vIGJ1dHRvblllczogbGcoJ3llcycpLFxyXG4gICAgY2FsbGJhY2tZZXM6IGZhbHNlLFxyXG4gICAgYnV0dG9uVGFnOiAnZGl2JyxcclxuICAgIG9iajogZmFsc2VcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiB0ZXN0SXBob25lKCkge1xyXG4gICAgaWYgKCEvKGlQaG9uZXxpUGFkfGlQb2QpLiooT1MgMTEpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSByZXR1cm47XHJcbiAgICBub3RpZmljYXRpb25fYm94LmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guY3NzKCd0b3AnLCAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgaXNfaW5pdCA9IHRydWU7XHJcbiAgICBub3RpZmljYXRpb25fYm94ID0gJCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcclxuICAgIGlmIChub3RpZmljYXRpb25fYm94Lmxlbmd0aCA+IDApcmV0dXJuO1xyXG5cclxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XHJcbiAgICBub3RpZmljYXRpb25fYm94ID0gJCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcclxuXHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2NvbnRyb2wnLCBjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgJy5ub3RpZnlfY2xvc2UnLCBjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgY2xvc2VNb2RhbEZvbik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCkge1xyXG4gICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgJCgnLm5vdGlmaWNhdGlvbl9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbCgnJyk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpIHtcclxuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcbiAgICBpZiAodGFyZ2V0LmNsYXNzTmFtZSA9PSBcIm5vdGlmaWNhdGlvbl9ib3hcIikge1xyXG4gICAgICBjbG9zZU1vZGFsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB2YXIgX3NldFVwTGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubm90aWZpY2F0aW9uX2Nsb3NlJywgX2Nsb3NlUG9wdXApO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uTGVhdmUpO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25FbnRlciA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgaWYgKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAodGltZXJDbGVhckFsbCAhPSBudWxsKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lckNsZWFyQWxsKTtcclxuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICB2YXIgb3B0aW9uID0gJCh0aGlzKS5kYXRhKCdvcHRpb24nKTtcclxuICAgICAgaWYgKG9wdGlvbi50aW1lcikge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChvcHRpb24udGltZXIpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDE7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9vbkxlYXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcclxuICAgICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICB2YXIgb3B0aW9uID0gJHRoaXMuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmIChvcHRpb24udGltZSA+IDApIHtcclxuICAgICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQob3B0aW9uLmNsb3NlKSwgb3B0aW9uLnRpbWUgLSAxNTAwICsgMTAwICogaSk7XHJcbiAgICAgICAgJHRoaXMuZGF0YSgnb3B0aW9uJywgb3B0aW9uKVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDA7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9jbG9zZVBvcHVwID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICB9KTtcclxuICAgICR0aGlzLmFkZENsYXNzKCdub3RpZmljYXRpb25faGlkZScpXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcclxuICAgIGFsZXJ0X29wdCA9IG9iamVjdHMoYWxlcnRfb3B0LCB7XHJcbiAgICAgICAgYnV0dG9uWWVzOiBsZygneWVzJylcclxuICAgIH0pO1xyXG4gICAgZGF0YSA9IG9iamVjdHMoYWxlcnRfb3B0LCBkYXRhKTtcclxuXHJcbiAgICBpZiAoIWlzX2luaXQpaW5pdCgpO1xyXG4gICAgdGVzdElwaG9uZSgpO1xyXG5cclxuICAgIG5vdHlmeV9jbGFzcyA9ICdub3RpZnlfYm94ICc7XHJcbiAgICBpZiAoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzICs9IGRhdGEubm90eWZ5X2NsYXNzO1xyXG5cclxuICAgIGJveF9odG1sID0gJzxkaXYgY2xhc3M9XCInICsgbm90eWZ5X2NsYXNzICsgJ1wiPic7XHJcbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCArPSAnPGRpdj4nK2RhdGEudGl0bGUrJzwvZGl2Pic7XHJcbiAgICBib3hfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGlmIChkYXRhLmJ1dHRvblllcyB8fCBkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzwnICsgZGF0YS5idXR0b25UYWcgKyAnIGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIiAnICsgZGF0YS5idXR0b25ZZXNEb3AgKyAnPicgKyBkYXRhLmJ1dHRvblllcyArICc8LycgKyBkYXRhLmJ1dHRvblRhZyArICc+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnICsgZGF0YS5idXR0b25UYWcgKyAnIGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiICcgKyBkYXRhLmJ1dHRvbk5vRG9wICsgJz4nICsgZGF0YS5idXR0b25ObyArICc8LycgKyBkYXRhLmJ1dHRvblRhZyArICc+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xyXG5cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgfSwgMTAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xyXG4gICAgY29uZmlybV9vcHQgPSBvYmplY3RzKGNvbmZpcm1fb3B0LCB7XHJcbiAgICAgICAgdGl0bGU6IGxnKCdkZWxldGluZycpLFxyXG4gICAgICAgIHF1ZXN0aW9uOiBsZygnYXJlX3lvdV9zdXJlX3RvX2RlbGV0ZScpLFxyXG4gICAgICAgIGJ1dHRvblllczogbGcoJ3llcycpLFxyXG4gICAgICAgIGJ1dHRvbk5vOiBsZygnbm8nKVxyXG4gICAgfSk7XHJcbiAgICBkYXRhID0gb2JqZWN0cyhjb25maXJtX29wdCwgZGF0YSk7XHJcbiAgICBpZiAodHlwZW9mKGRhdGEuY2FsbGJhY2tZZXMpID09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHZhciBjb2RlID0gJ2RhdGEuY2FsbGJhY2tZZXMgPSBmdW5jdGlvbigpeycrZGF0YS5jYWxsYmFja1llcysnfSc7XHJcbiAgICAgIGV2YWwoY29kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc19pbml0KWluaXQoKTtcclxuICAgIHRlc3RJcGhvbmUoKTtcclxuICAgIC8vYm94X2h0bWw9JzxkaXYgY2xhc3M9XCJub3RpZnlfYm94XCI+JztcclxuXHJcbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xyXG4gICAgaWYgKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcyArPSBkYXRhLm5vdHlmeV9jbGFzcztcclxuXHJcbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xyXG5cclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sICs9IGRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgIGlmIChkYXRhLmJ1dHRvblllcyB8fCBkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xyXG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG4gICAgaWYgKGRhdGEuY2FsbGJhY2tZZXMgIT0gZmFsc2UpIHtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrWWVzLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuICAgIGlmIChkYXRhLmNhbGxiYWNrTm8gIT0gZmFsc2UpIHtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsIGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sIDEwMClcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcclxuICAgIHZhciBvcHRpb24gPSB7dGltZTogKGRhdGEudGltZSB8fCBkYXRhLnRpbWUgPT09IDApID8gZGF0YS50aW1lIDogdGltZX07XHJcbiAgICBpZiAoIWNvbnRlaW5lcikge1xyXG4gICAgICBjb250ZWluZXIgPSAkKCc8dWwvPicsIHtcclxuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XHJcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xyXG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9pdGVtJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSkge1xyXG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNsb3NlID0gJCgnPHNwYW4vPicsIHtcclxuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25fY2xvc2UnXHJcbiAgICB9KTtcclxuICAgIG9wdGlvbi5jbG9zZSA9IGNsb3NlO1xyXG4gICAgbGkuYXBwZW5kKGNsb3NlKTtcclxuXHJcbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciB0aXRsZSA9ICQoJzxoNS8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRleHQgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90ZXh0XCJcclxuICAgIH0pO1xyXG4gICAgdGV4dC5odG1sKGRhdGEubWVzc2FnZSk7XHJcblxyXG4gICAgaWYgKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcclxuICAgICAgfSk7XHJcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XHJcbiAgICAgIHZhciB3cmFwID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIndyYXBcIlxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHdyYXAuYXBwZW5kKGltZyk7XHJcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh3cmFwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRleHQpO1xyXG4gICAgfVxyXG4gICAgbGkuYXBwZW5kKGNvbnRlbnQpO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcclxuICAgIC8vICAgdmFyIHRpdGxlID0gJCgnPHAvPicsIHtcclxuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxyXG4gICAgLy8gICB9KTtcclxuICAgIC8vICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcclxuICAgIC8vICAgbGkuYXBwZW5kKHRpdGxlKTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xyXG4gICAgLy8gICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xyXG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxyXG4gICAgLy8gICB9KTtcclxuICAgIC8vICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XHJcbiAgICAvLyAgIGxpLmFwcGVuZChpbWcpO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuICAgIC8vIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XHJcbiAgICAvLyAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxyXG4gICAgLy8gfSk7XHJcbiAgICAvLyBjb250ZW50Lmh0bWwoZGF0YS5tZXNzYWdlKTtcclxuICAgIC8vXHJcbiAgICAvLyBsaS5hcHBlbmQoY29udGVudCk7XHJcbiAgICAvL1xyXG4gICAgY29udGVpbmVyLmFwcGVuZChsaSk7XHJcblxyXG4gICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xyXG4gICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQoY2xvc2UpLCBvcHRpb24udGltZSk7XHJcbiAgICB9XHJcbiAgICBsaS5kYXRhKCdvcHRpb24nLCBvcHRpb24pXHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYWxlcnQ6IGFsZXJ0LFxyXG4gICAgY29uZmlybTogY29uZmlybSxcclxuICAgIG5vdGlmaTogbm90aWZpXHJcbiAgfTtcclxuXHJcbn0pKCk7XHJcblxyXG5cclxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XHJcbiAgZGF0YSA9IGVsLmRhdGEoKTtcclxuXHJcbiAgZGF0YS5xdWVzdGlvbiA9IGVsLmh0bWwoKTtcclxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcbn0pO1xyXG5cclxuJCgnW3JlZj1jb25maXJtXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBlbCA9ICQoJHRoaXMuYXR0cignaHJlZicpKTtcclxuICBkYXRhID0gZWwuZGF0YSgpO1xyXG4gIGRhdGEucXVlc3Rpb24gPSBlbC5odG1sKCk7XHJcbiAgbm90aWZpY2F0aW9uLmNvbmZpcm0oZGF0YSk7XHJcbn0pO1xyXG5cclxuXHJcbiQoJy5kaXNhYmxlZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBkYXRhID0gJHRoaXMuZGF0YSgpO1xyXG4gIGlmIChkYXRhWydidXR0b25feWVzJ10pIHtcclxuICAgIGRhdGFbJ2J1dHRvblllcyddID0gZGF0YVsnYnV0dG9uX3llcyddO1xyXG4gIH1cclxuICBpZiAoZGF0YVsnYnV0dG9uX3llcyddID09PSBmYWxzZSkge1xyXG4gICAgZGF0YVsnYnV0dG9uWWVzJ10gPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tb2RhbHNfb3BlbicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcblxyXG4gICAgLy/Qv9GA0Lgg0L7RgtC60YDRi9GC0LjQuCDRhNC+0YDQvNGLINGA0LXQs9C40YHRgtGA0LDRhtC40Lgg0LfQsNC60YDRi9GC0YwsINC10YHQu9C4INC+0YLRgNGL0YLQviAtINC/0L7Qv9Cw0L8g0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40Y8g0LrRg9C/0L7QvdCwINCx0LXQtyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4XHJcbiAgICB2YXIgcG9wdXAgPSAkKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikuZGF0YSgncG9wdXAnKTtcclxuICAgIGlmIChwb3B1cCkge1xyXG4gICAgICBwb3B1cC5jbG9zZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcG9wdXAgPSAkKCdkaXYucG9wdXBfY29udCwgZGl2LnBvcHVwX2JhY2snKTtcclxuICAgICAgaWYgKHBvcHVwKSB7XHJcbiAgICAgICAgcG9wdXAuaGlkZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhyZWYgPSB0aGlzLmhyZWYuc3BsaXQoJyMnKTtcclxuICAgIGhyZWYgPSBocmVmW2hyZWYubGVuZ3RoIC0gMV07XHJcbiAgICB2YXIgbm90eUNsYXNzID0gJCh0aGlzKS5kYXRhKCdub3R5Y2xhc3MnKTtcclxuICAgIHZhciBjbGFzc19uYW1lPShocmVmLmluZGV4T2YoJ3ZpZGVvJykgPT09IDAgPyAnbW9kYWxzLWZ1bGxfc2NyZWVuJyA6ICdub3RpZnlfd2hpdGUnKSArICcgJyArIG5vdHlDbGFzcztcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxyXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibG9hZGluZyBcIiArIGNsYXNzX25hbWUsXHJcbiAgICAgIHF1ZXN0aW9uOiAnJ1xyXG4gICAgfTtcclxuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuXHJcbiAgICAkLmdldCgnLycgKyBocmVmLCBmdW5jdGlvbiAoZGF0YSkge1xyXG5cclxuICAgICAgdmFyIGRhdGFfbXNnID0ge1xyXG4gICAgICAgIGJ1dHRvblllczogZmFsc2UsXHJcbiAgICAgICAgbm90eWZ5X2NsYXNzOiBjbGFzc19uYW1lLFxyXG4gICAgICAgIHF1ZXN0aW9uOiBkYXRhLmh0bWwsXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpZiAoZGF0YS50aXRsZSkge1xyXG4gICAgICAgIGRhdGFfbXNnWyd0aXRsZSddPWRhdGEudGl0bGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qaWYoZGF0YS5idXR0b25ZZXMpe1xyXG4gICAgICAgIGRhdGFfbXNnWydidXR0b25ZZXMnXT1kYXRhLmJ1dHRvblllcztcclxuICAgICAgfSovXHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhX21zZyk7XHJcbiAgICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcclxuICAgIH0sICdqc29uJyk7XHJcblxyXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuXHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcubW9kYWxzX3BvcHVwJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIC8v0L/RgNC4INC60LvQuNC60LUg0LLRgdC/0LvRi9Cy0LDRiNC60LAg0YEg0YLQtdC60YHRgtC+0LxcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciB0aXRsZSA9ICQodGhhdCkuZGF0YSgnb3JpZ2luYWwtaCcpO1xyXG4gICAgaWYoIXRpdGxlKXRpdGxlPVwiXCI7XHJcbiAgICB2YXIgaHRtbCA9ICQoJyMnICsgJCh0aGF0KS5kYXRhKCdvcmlnaW5hbC1odG1sJykpLmh0bWwoKTtcclxuICAgIHZhciBjb250ZW50ID0gaHRtbCA/IGh0bWwgOiAkKHRoYXQpLmRhdGEoJ29yaWdpbmFsLXRpdGxlJyk7XHJcbiAgICB2YXIgbm90eUNsYXNzID0gJCh0aGF0KS5kYXRhKCdub3R5Y2xhc3MnKTtcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxyXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibm90aWZ5X3doaXRlIFwiICsgbm90eUNsYXNzLFxyXG4gICAgICBxdWVzdGlvbjogY29udGVudCxcclxuICAgICAgdGl0bGU6IHRpdGxlXHJcbiAgICB9O1xyXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KVxyXG59KCkpO1xyXG4iLCIkKCcuZm9vdGVyLW1lbnUtdGl0bGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKSkge1xyXG4gICAgJHRoaXMucmVtb3ZlQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKVxyXG4gIH0gZWxzZSB7XHJcbiAgICAkKCcuZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpO1xyXG4gIH1cclxuXHJcbn0pO1xyXG4iLCIkKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBzdGFyTm9taW5hdGlvbihpbmRleCkge1xyXG4gICAgdmFyIHN0YXJzID0gJChcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIik7XHJcbiAgICBzdGFycy5hZGRDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcclxuICAgICAgc3RhcnMuZXEoaSkucmVtb3ZlQ2xhc3MoXCJyYXRpbmctc3Rhci1vcGVuXCIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJChkb2N1bWVudCkub24oXCJtb3VzZW92ZXJcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuICB9KS5vbihcIm1vdXNlbGVhdmVcIiwgXCIucmF0aW5nLXdyYXBwZXJcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIHN0YXJOb21pbmF0aW9uKCQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCkpO1xyXG4gIH0pLm9uKFwiY2xpY2tcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuXHJcbiAgICAkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuICB9KTtcclxufSk7XHJcbiIsIi8v0LjQt9Cx0YDQsNC90L3QvtC1XHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAkKFwiLmZhdm9yaXRlLWxpbmtcIikub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICB2YXIgc2VsZiA9ICQodGhpcyk7XHJcbiAgICB2YXIgdHlwZSA9IHNlbGYuZGF0YShcInN0YXRlXCIpLFxyXG4gICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmRhdGEoXCJhZmZpbGlhdGUtaWRcIiksXHJcbiAgICAgIHByb2R1Y3RfaWQgPSBzZWxmLmRhdGEoXCJwcm9kdWN0LWlkXCIpO1xyXG5cclxuICAgIGlmICghYWZmaWxpYXRlX2lkKSB7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgIHRpdGxlOiBsZyhcInJlZ2lzdHJhdGlvbl9pc19yZXF1aXJlZFwiKSxcclxuICAgICAgICBtZXNzYWdlOiBsZyhcImFkZF90b19mYXZvcml0ZV9tYXlfb25seV9yZWdpc3RlcmVkX3VzZXJcIiksXHJcbiAgICAgICAgdHlwZTogJ2VycidcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlbGYuaGFzQ2xhc3MoJ2Rpc2FibGVkJykpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBzZWxmLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgIC8qaWYodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgc2VsZi5maW5kKFwiLml0ZW1faWNvblwiKS5yZW1vdmVDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgIH0qL1xyXG4gICAgdmFyIGhyZWYgPSAgJCgnI2FjY291bnRfZmF2b3JpdGVzX2xpbmsnKS5hdHRyKCdocmVmJyk7XHJcblxyXG4gICAgJC5wb3N0KGhyZWYsIHtcclxuICAgICAgXCJ0eXBlXCI6IHR5cGUsXHJcbiAgICAgIFwiYWZmaWxpYXRlX2lkXCI6IGFmZmlsaWF0ZV9pZCxcclxuICAgICAgXCJwcm9kdWN0X2lkXCI6IHByb2R1Y3RfaWRcclxuICAgIH0sIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgIGlmIChkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKCdzdmcnKS5yZW1vdmVDbGFzcyhcInNwaW5cIik7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTogZGF0YS5lcnJvciwgdHlwZTogJ2VycicsICd0aXRsZSc6IChkYXRhLnRpdGxlID8gZGF0YS50aXRsZSA6IGZhbHNlKX0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgbWVzc2FnZTogZGF0YS5tc2csXHJcbiAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICd0aXRsZSc6IChkYXRhLnRpdGxlID8gZGF0YS50aXRsZSA6IGZhbHNlKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHNlbGYuZGF0YShcInN0YXRlXCIsIGRhdGFbXCJkYXRhLXN0YXRlXCJdKTtcclxuICAgICAgc2VsZi5kYXRhKFwib3JpZ2luYWwtdGl0bGVcIiwgZGF0YVtcImRhdGEtb3JpZ2luYWwtdGl0bGVcIl0pO1xyXG4gICAgICBzZWxmLmZpbmQoJy50aXRsZScpLmh0bWwoZGF0YVtcImRhdGEtb3JpZ2luYWwtdGl0bGVcIl0pO1xyXG5cclxuICAgICAgaWYgKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gaW5fZmF2X29mZlwiKS5hZGRDbGFzcyhcImluX2Zhdl9vblwiKTtcclxuICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiZGVsZXRlXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluIGluX2Zhdl9vblwiKS5hZGRDbGFzcyhcImluX2Zhdl9vZmZcIik7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LCAnanNvbicpLmZhaWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICBtZXNzYWdlOiBsZyhcInRoZXJlX2lzX3RlY2huaWNhbF93b3Jrc19ub3dcIiksXHJcbiAgICAgICAgdHlwZTogJ2VycidcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb2ZmXCIpLmFkZENsYXNzKFwiaW5fZmF2X29uXCIpO1xyXG4gICAgICAgIHNlbGYuZGF0YSgnb3JpZ2luYWwtdGl0bGUnLCBsZyhcImZhdm9yaXRlc19zaG9wX3JlbW92ZVwiKyhwcm9kdWN0X2lkID8gJ19wcm9kdWN0JyA6ICcnKSkpO1xyXG4gICAgICAgIHNlbGYuZmluZCgnLnRpdGxlJykuaHRtbChsZyhcImZhdm9yaXRlc19zaG9wX3JlbW92ZVwiKyhwcm9kdWN0X2lkID8gJ19wcm9kdWN0JyA6ICcnKSkpO1xyXG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJkZWxldGVcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gaW5fZmF2X29uXCIpLmFkZENsYXNzKFwiaW5fZmF2X29mZlwiKTtcclxuICAgICAgICBzZWxmLmRhdGEoJ29yaWdpbmFsLXRpdGxlJywgbGcoXCJmYXZvcml0ZXNfc2hvcF9hZGRcIisocHJvZHVjdF9pZCA/ICdfcHJvZHVjdCcgOiAnJykpKTtcclxuICAgICAgICBzZWxmLmZpbmQoJy50aXRsZScpLmh0bWwobGcoXCJmYXZvcml0ZXNfc2hvcF9hZGRcIisocHJvZHVjdF9pZCA/ICdfcHJvZHVjdCcgOiAnJykpKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0pXHJcbiAgfSk7XHJcbn0pO1xyXG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLnNjcm9sbF90bycpLmNsaWNrKGZ1bmN0aW9uIChlKSB7IC8vINC70L7QstC40Lwg0LrQu9C40Log0L/QviDRgdGB0YvQu9C60LUg0YEg0LrQu9Cw0YHRgdC+0LwgZ29fdG9cclxuICAgIHZhciBzY3JvbGxfZWwgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTsgLy8g0LLQvtC30YzQvNC10Lwg0YHQvtC00LXRgNC20LjQvNC+0LUg0LDRgtGA0LjQsdGD0YLQsCBocmVmLCDQtNC+0LvQttC10L0g0LHRi9GC0Ywg0YHQtdC70LXQutGC0L7RgNC+0LwsINGCLtC1LiDQvdCw0L/RgNC40LzQtdGAINC90LDRh9C40L3QsNGC0YzRgdGPINGBICMg0LjQu9C4IC5cclxuICAgIHNjcm9sbF9lbCA9ICQoc2Nyb2xsX2VsKTtcclxuICAgIGlmIChzY3JvbGxfZWwubGVuZ3RoICE9IDApIHsgLy8g0L/RgNC+0LLQtdGA0LjQvCDRgdGD0YnQtdGB0YLQstC+0LLQsNC90LjQtSDRjdC70LXQvNC10L3RgtCwINGH0YLQvtCx0Ysg0LjQt9Cx0LXQttCw0YLRjCDQvtGI0LjQsdC60LhcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiBzY3JvbGxfZWwub2Zmc2V0KCkudG9wIC0gJCgnI2hlYWRlcj4qJykuZXEoMCkuaGVpZ2h0KCkgLSA1MH0sIDUwMCk7IC8vINCw0L3QuNC80LjRgNGD0LXQvCDRgdC60YDQvtC+0LvQuNC90LMg0Log0Y3Qu9C10LzQtdC90YLRgyBzY3JvbGxfZWxcclxuICAgICAgaWYgKHNjcm9sbF9lbC5oYXNDbGFzcygnYWNjb3JkaW9uJykgJiYgIXNjcm9sbF9lbC5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAgICAgc2Nyb2xsX2VsLmZpbmQoJy5hY2NvcmRpb24tY29udHJvbCcpLmNsaWNrKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTsgLy8g0LLRi9C60LvRjtGH0LDQtdC8INGB0YLQsNC90LTQsNGA0YLQvdC+0LUg0LTQtdC50YHRgtCy0LjQtVxyXG4gIH0pO1xyXG59KTtcclxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICQoXCJib2R5XCIpLm9uKCdjbGljaycsICcuc2V0X2NsaXBib2FyZCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgY29weVRvQ2xpcGJvYXJkKCR0aGlzLmRhdGEoJ2NsaXBib2FyZCcpLCAkdGhpcy5kYXRhKCdjbGlwYm9hcmQtbm90aWZ5JykpO1xyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBjb3B5VG9DbGlwYm9hcmQoY29kZSwgbXNnKSB7XHJcbiAgICB2YXIgJHRlbXAgPSAkKFwiPGlucHV0PlwiKTtcclxuICAgICQoXCJib2R5XCIpLmFwcGVuZCgkdGVtcCk7XHJcbiAgICAkdGVtcC52YWwoY29kZSkuc2VsZWN0KCk7XHJcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIik7XHJcbiAgICAkdGVtcC5yZW1vdmUoKTtcclxuXHJcbiAgICBpZiAoIW1zZykge1xyXG4gICAgICBtc2cgPSBsZyhcImRhdGFfY29waWVkX3RvX2NsaXBib2FyZFwiKTtcclxuICAgIH1cclxuICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoeyd0eXBlJzogJ2luZm8nLCAnbWVzc2FnZSc6IG1zZywgJ3RpdGxlJzogbGcoJ3N1Y2Nlc3MnKX0pXHJcbiAgfVxyXG5cclxuICAkKFwiYm9keVwiKS5vbignY2xpY2snLCBcImlucHV0LmxpbmtcIiwgZnVuY3Rpb24gKCkge1x0Ly8g0L/QvtC70YPRh9C10L3QuNC1INGE0L7QutGD0YHQsCDRgtC10LrRgdGC0L7QstGL0Lwg0L/QvtC70LXQvC3RgdGB0YvQu9C60L7QuVxyXG4gICAgJCh0aGlzKS5zZWxlY3QoKTtcclxuICB9KTtcclxufSk7XHJcbiIsIi8v0YHQutCw0YfQuNCy0LDQvdC40LUg0LrQsNGA0YLQuNC90L7QulxyXG4oZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpIHtcclxuICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgIHZhciBpbWcgPSBkYXRhLmltZztcclxuICAgIGltZy53cmFwKCc8ZGl2IGNsYXNzPVwiZG93bmxvYWRcIj48L2Rpdj4nKTtcclxuICAgIHZhciB3cmFwID0gaW1nLnBhcmVudCgpO1xyXG4gICAgJCgnLmRvd25sb2FkX3Rlc3QnKS5hcHBlbmQoZGF0YS5lbCk7XHJcbiAgICBzaXplID0gZGF0YS5lbC53aWR0aCgpICsgXCJ4XCIgKyBkYXRhLmVsLmhlaWdodCgpO1xyXG5cclxuICAgIHc9ZGF0YS5lbC53aWR0aCgpKjAuODtcclxuICAgIGltZ1xyXG4gICAgICAuaGVpZ2h0KCdhdXRvJylcclxuICAgICAgLy8ud2lkdGgodylcclxuICAgICAgLmNzcygnbWF4LXdpZHRoJywnOTklJyk7XHJcblxyXG5cclxuICAgIGRhdGEuZWwucmVtb3ZlKCk7XHJcbiAgICB3cmFwLmFwcGVuZCgnPHNwYW4+JyArIHNpemUgKyAnPC9zcGFuPiA8YSBocmVmPVwiJyArIGRhdGEuc3JjICsgJ1wiIGRvd25sb2FkPicrbGcoXCJkb3dubG9hZFwiKSsnPC9hPicpO1xyXG4gIH1cclxuXHJcbiAgdmFyIGltZ3MgPSAkKCcuZG93bmxvYWRzX2ltZyBpbWcnKTtcclxuICBpZihpbWdzLmxlbmd0aD09MClyZXR1cm47XHJcblxyXG4gICQoJ2JvZHknKS5hcHBlbmQoJzxkaXYgY2xhc3M9ZG93bmxvYWRfdGVzdD48L2Rpdj4nKTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGltZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBpbWcgPSBpbWdzLmVxKGkpO1xyXG4gICAgdmFyIHNyYyA9IGltZy5hdHRyKCdzcmMnKTtcclxuICAgIGltYWdlID0gJCgnPGltZy8+Jywge1xyXG4gICAgICBzcmM6IHNyY1xyXG4gICAgfSk7XHJcbiAgICBkYXRhID0ge1xyXG4gICAgICBzcmM6IHNyYyxcclxuICAgICAgaW1nOiBpbWcsXHJcbiAgICAgIGVsOiBpbWFnZVxyXG4gICAgfTtcclxuICAgIGltYWdlLm9uKCdsb2FkJywgaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXHJcbiAgfVxyXG59KSgpO1xyXG5cclxuLy/Rh9GC0L4g0LEg0LjRhNGA0LXQudC80Ysg0Lgg0LrQsNGA0YLQuNC90LrQuCDQvdC1INCy0YvQu9Cw0LfQuNC70LhcclxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAvKm1fdyA9ICQoJy50ZXh0LWNvbnRlbnQnKS53aWR0aCgpXHJcbiAgIGlmIChtX3cgPCA1MCltX3cgPSBzY3JlZW4ud2lkdGggLSA0MCovXHJcbiAgdmFyIG13PXNjcmVlbi53aWR0aC00MDtcclxuXHJcbiAgZnVuY3Rpb24gb3B0aW1hc2UoZWwpe1xyXG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudCgpO1xyXG4gICAgaWYocGFyZW50Lmxlbmd0aD09MCB8fCBwYXJlbnRbMF0udGFnTmFtZT09XCJBXCIpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZihlbC5oYXNDbGFzcygnbm9fb3B0b21pemUnKSlyZXR1cm47XHJcblxyXG4gICAgbV93ID0gcGFyZW50LndpZHRoKCktMzA7XHJcbiAgICB2YXIgdz1lbC53aWR0aCgpO1xyXG5cclxuICAgIC8v0LHQtdC3INGN0YLQvtCz0L4g0L/Qu9GO0YnQuNGCINCx0LDQvdC10YDRiyDQsiDQsNC60LDRgNC00LjQvtC90LVcclxuICAgIGlmKHc8MyB8fCBtX3c8Myl7XHJcbiAgICAgIGVsXHJcbiAgICAgICAgLmhlaWdodCgnYXV0bycpXHJcbiAgICAgICAgLmNzcygnbWF4LXdpZHRoJywnOTklJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBlbC53aWR0aCgnYXV0bycpO1xyXG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJTUdcIiAmJiB3PmVsLndpZHRoKCkpdz1lbC53aWR0aCgpO1xyXG5cclxuICAgIGlmIChtdz41MCAmJiBtX3cgPiBtdyltX3cgPSBtdztcclxuICAgIGlmICh3Pm1fdykge1xyXG4gICAgICBpZihlbFswXS50YWdOYW1lPT1cIklGUkFNRVwiKXtcclxuICAgICAgICBrID0gdyAvIG1fdztcclxuICAgICAgICBlbC5oZWlnaHQoZWwuaGVpZ2h0KCkgLyBrKTtcclxuICAgICAgfVxyXG4gICAgICBlbC53aWR0aChtX3cpXHJcbiAgICB9ZWxzZXtcclxuICAgICAgZWwud2lkdGgodyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcclxuICAgIHZhciBlbD0kKHRoaXMpO1xyXG4gICAgb3B0aW1hc2UoZWwpO1xyXG4gIH1cclxuXHJcbiAgdmFyIHAgPSAkKCcuY29udGVudC13cmFwIGltZywuY29udGVudC13cmFwIGlmcmFtZScpO1xyXG4gICQoJy5jb250ZW50LXdyYXAgaW1nOm5vdCgubm9fb3B0b21pemUpJykuaGVpZ2h0KCdhdXRvJyk7XHJcbiAgLy8kKCcuY29udGFpbmVyIGltZycpLndpZHRoKCdhdXRvJyk7XHJcbiAgZm9yIChpID0gMDsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgIGVsID0gcC5lcShpKTtcclxuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpIHtcclxuICAgICAgb3B0aW1hc2UoZWwpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHZhciBzcmM9ZWwuYXR0cignc3JjJyk7XHJcbiAgICAgIGltYWdlID0gJCgnPGltZy8+Jywge1xyXG4gICAgICAgIHNyYzogc3JjXHJcbiAgICAgIH0pO1xyXG4gICAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGVsKSk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcblxyXG4vL9Cf0YDQvtCy0LXRgNC60LAg0LHQuNGC0Ysg0LrQsNGA0YLQuNC90L7Qui5cclxuLy8gISEhISEhXHJcbi8vINCd0YPQttC90L4g0L/RgNC+0LLQtdGA0LjRgtGMLiDQktGL0LfRi9Cy0LDQu9C+INCz0LvRjtC60Lgg0L/RgNC4INCw0LLRgtC+0YDQt9Cw0YbQuNC4INGH0LXRgNC10Lcg0KTQkSDQvdCwINGB0LDRhNCw0YDQuFxyXG4vLyAhISEhISFcclxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcclxuICAgIHZhciBkYXRhPXRoaXM7XHJcbiAgICBpZihkYXRhLnRhZ05hbWUpe1xyXG4gICAgICBkYXRhPSQoZGF0YSkuZGF0YSgnZGF0YScpO1xyXG4gICAgfVxyXG4gICAgdmFyIGltZz1kYXRhLmltZztcclxuICAgIC8vdmFyIHRuPWltZ1swXS50YWdOYW1lO1xyXG4gICAgLy9pZiAodG4hPSdJTUcnfHx0biE9J0RJVid8fHRuIT0nU1BBTicpcmV0dXJuO1xyXG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XHJcbiAgICAgIGltZy5hdHRyKCdzcmMnLCBkYXRhLnNyYyk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJytkYXRhLnNyYysnKScpO1xyXG4gICAgICBpbWcucmVtb3ZlQ2xhc3MoJ25vX2F2YScpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdGVzdEltZyhpbWdzLCBub19pbWcpe1xyXG4gICAgaWYoIWltZ3MgfHwgaW1ncy5sZW5ndGg9PTApcmV0dXJuO1xyXG5cclxuICAgIGlmKCFub19pbWcpbm9faW1nPScvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJztcclxuXHJcbiAgICBmb3IgKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspe1xyXG4gICAgICB2YXIgaW1nPWltZ3MuZXEoaSk7XHJcbiAgICAgIGlmKGltZy5oYXNDbGFzcygnbm9fYXZhJykpe1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZGF0YT17XHJcbiAgICAgICAgaW1nOmltZ1xyXG4gICAgICB9O1xyXG4gICAgICB2YXIgc3JjO1xyXG4gICAgICBpZihpbWdbMF0udGFnTmFtZT09XCJJTUdcIil7XHJcbiAgICAgICAgZGF0YS50eXBlPTA7XHJcbiAgICAgICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcclxuICAgICAgICBpbWcuYXR0cignc3JjJyxub19pbWcpO1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICBkYXRhLnR5cGU9MTtcclxuICAgICAgICBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xyXG4gICAgICAgIGlmKCFzcmMpY29udGludWU7XHJcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCd1cmwoXCInLCcnKTtcclxuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ1wiKScsJycpO1xyXG4gICAgICAgIC8v0LIg0YHRhNGE0LDRgNC4INCyINC80LDQuiDQvtGBINCx0LXQtyDQutC+0LLRi9GH0LXQui4g0LLQtdC30LTQtSDRgSDQutCw0LLRi9GH0LrQsNC80LhcclxuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybCgnLCcnKTtcclxuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJyknLCcnKTtcclxuICAgICAgICBpbWcuYWRkQ2xhc3MoJ25vX2F2YScpO1xyXG4gICAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytub19pbWcrJyknKTtcclxuICAgICAgfVxyXG4gICAgICBkYXRhLnNyYz1zcmM7XHJcbiAgICAgIHZhciBpbWFnZT0kKCc8aW1nLz4nLHtcclxuICAgICAgICBzcmM6c3JjXHJcbiAgICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSk7XHJcbiAgICAgIGltYWdlLmRhdGEoJ2RhdGEnLGRhdGEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy/RgtC10YHRgiDQu9C+0LPQviDQvNCw0LPQsNC30LjQvdCwXHJcbiAgdmFyIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJyk7XHJcbiAgaW1ncz1pbWdzLmZpbmQoJy5sb2dvIGltZycpO1xyXG4gIHRlc3RJbWcoaW1ncywnL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZycpO1xyXG5cclxuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxyXG4gIGltZ3M9JCgnLmNvbW1lbnQtcGhvdG8sLnNjcm9sbF9ib3gtYXZhdGFyJyk7XHJcbiAgdGVzdEltZyhpbWdzLCcvaW1hZ2VzL25vX2F2YV9zcXVhcmUucG5nJyk7XHJcblxyXG4gIC8v0YLQtdGB0YIg0LrQsNGA0YLQuNC90L7QuiDQv9GA0L7QtNGD0LrRgtC+0LJcclxuICBpbWdzID0gJCgnLmNhdGFsb2dfcHJvZHVjdHNfaXRlbV9pbWFnZS13cmFwIGltZycpO1xyXG4gIHRlc3RJbWcoaW1ncyk7XHJcblxyXG59KTtcclxuIiwiLy/QtdGB0LvQuCDQvtGC0LrRgNGL0YLQviDQutCw0Log0LTQvtGH0LXRgNC90LXQtVxyXG4oZnVuY3Rpb24gKCkge1xyXG4gIGlmICghd2luZG93Lm9wZW5lcilyZXR1cm47XHJcbiAgdHJ5IHtcclxuICAgIGhyZWYgPSB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY7XHJcbiAgICBpZiAoXHJcbiAgICAgIGhyZWYuaW5kZXhPZignL2FjY291bnQvb2ZmbGluZScpID4gMFxyXG4gICAgKSB7XHJcbiAgICAgIHdpbmRvdy5wcmludCgpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRvY3VtZW50LnJlZmVycmVyLmluZGV4T2YoJ3NlY3JldGRpc2NvdW50ZXInKSA8IDApcmV0dXJuO1xyXG5cclxuICAgIGlmIChcclxuICAgICAgaHJlZi5pbmRleE9mKCdzb2NpYWxzJykgPiAwIHx8XHJcbiAgICAgIGhyZWYuaW5kZXhPZignbG9naW4nKSA+IDAgfHxcclxuICAgICAgaHJlZi5pbmRleE9mKCdhZG1pbicpID4gMCB8fFxyXG4gICAgICBocmVmLmluZGV4T2YoJ2FjY291bnQnKSA+IDBcclxuICAgICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGhyZWYuaW5kZXhPZignc3RvcmUnKSA+IDAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKSA+IDAgfHwgaHJlZi5pbmRleE9mKCdzZXR0aW5ncycpID4gMCkge1xyXG4gICAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmID0gbG9jYXRpb24uaHJlZjtcclxuICAgIH1cclxuICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG5cclxuICB9XHJcbn0pKCk7XHJcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAkKCdpbnB1dFt0eXBlPWZpbGVdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChldnQpIHtcclxuICAgIHZhciBmaWxlID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XHJcbiAgICB2YXIgZiA9IGZpbGVbMF07XHJcbiAgICAvLyBPbmx5IHByb2Nlc3MgaW1hZ2UgZmlsZXMuXHJcbiAgICBpZiAoIWYudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICAgIGRhdGEgPSB7XHJcbiAgICAgICdlbCc6IHRoaXMsXHJcbiAgICAgICdmJzogZlxyXG4gICAgfTtcclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaW1nID0gJCgnW2Zvcj1cIicgKyBkYXRhLmVsLm5hbWUgKyAnXCJdJyk7XHJcbiAgICAgICAgaWYgKGltZy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBpbWcuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH0pKGRhdGEpO1xyXG4gICAgLy8gUmVhZCBpbiB0aGUgaW1hZ2UgZmlsZSBhcyBhIGRhdGEgVVJMLlxyXG4gICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZik7XHJcbiAgfSk7XHJcblxyXG4gICQoJy5kdWJsaWNhdGVfdmFsdWUnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgIHZhciBzZWwgPSAkKCR0aGlzLmRhdGEoJ3NlbGVjdG9yJykpO1xyXG4gICAgc2VsLnZhbCh0aGlzLnZhbHVlKTtcclxuICB9KVxyXG59KTtcclxuIiwiXHJcbmZ1bmN0aW9uIGdldENvb2tpZShuKSB7XHJcbiAgcmV0dXJuIHVuZXNjYXBlKChSZWdFeHAobiArICc9KFteO10rKScpLmV4ZWMoZG9jdW1lbnQuY29va2llKSB8fCBbMSwgJyddKVsxXSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldENvb2tpZShuYW1lLCB2YWx1ZSwgZGF5cykge1xyXG4gIHZhciBleHBpcmVzID0gJyc7XHJcbiAgaWYgKGRheXMpIHtcclxuICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZTtcclxuICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgZGF5cyk7XHJcbiAgICAgIGV4cGlyZXMgPSAnOyBleHBpcmVzPScgKyBkYXRlLnRvVVRDU3RyaW5nKCk7XHJcbiAgfVxyXG4gIGRvY3VtZW50LmNvb2tpZSA9IG5hbWUgKyBcIj1cIiArIGVzY2FwZSAoIHZhbHVlICkgKyBleHBpcmVzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBlcmFzZUNvb2tpZShuYW1lKXtcclxuICB2YXIgY29va2llX3N0cmluZyA9IG5hbWUgKyBcIj0wXCIgK1wiOyBleHBpcmVzPVdlZCwgMDEgT2N0IDIwMTcgMDA6MDA6MDAgR01UXCI7XHJcbiAgZG9jdW1lbnQuY29va2llID0gY29va2llX3N0cmluZztcclxufVxyXG5cclxuZG9jdW1lbnQuY29va2llLnNwbGl0KFwiO1wiKS5mb3JFYWNoKGZ1bmN0aW9uKGMpIHsgZG9jdW1lbnQuY29va2llID0gYy5yZXBsYWNlKC9eICsvLCBcIlwiKS5yZXBsYWNlKC89LiovLCBcIj07ZXhwaXJlcz1cIiArIG5ldyBEYXRlKCkudG9VVENTdHJpbmcoKSArIFwiO3BhdGg9L1wiKTsgfSk7XHJcblxyXG5cclxuZnVuY3Rpb24gc2V0Q29va2llQWpheChuYW1lLCB2YWx1ZSwgZGF5cykge1xyXG4gICAgJC5wb3N0KGxhbmcuaHJlZl9wcmVmaXgrJy9jb29raWUnLCB7bmFtZTpuYW1lLCB2YWx1ZTp2YWx1ZSwgZGF5czpkYXlzfSwgZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgaWYgKGRhdGEuZXJyb3IgIT09IDApIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgJ2pzb24nKTtcclxufSIsIihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICB2YXIgdGFibGVzID0gJCgndGFibGUuYWRhcHRpdmUnKTtcclxuXHJcbiAgaWYgKHRhYmxlcy5sZW5ndGggPT0gMClyZXR1cm47XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyB0YWJsZXMubGVuZ3RoID4gaTsgaSsrKSB7XHJcbiAgICB2YXIgdGFibGUgPSB0YWJsZXMuZXEoaSk7XHJcbiAgICB2YXIgdGggPSB0YWJsZS5maW5kKCd0aGVhZCcpO1xyXG4gICAgaWYgKHRoLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIHRoID0gdGFibGUuZmluZCgndHInKS5lcSgwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoID0gdGguZmluZCgndHInKS5lcSgwKTtcclxuICAgIH1cclxuICAgIHRoID0gdGguYWRkQ2xhc3MoJ3RhYmxlLWhlYWRlcicpLmZpbmQoJ3RkLHRoJyk7XHJcblxyXG4gICAgdmFyIHRyID0gdGFibGUuZmluZCgndHInKS5ub3QoJy50YWJsZS1oZWFkZXInKTtcclxuXHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgIHZhciBrID0gaiArIDE7XHJcbiAgICAgIHZhciB0ZCA9IHRyLmZpbmQoJ3RkOm50aC1jaGlsZCgnICsgayArICcpJyk7XHJcbiAgICAgIHRkLmF0dHIoJ2xhYmVsJywgdGguZXEoaikudGV4dCgpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG59KSh3aW5kb3csIGRvY3VtZW50KTtcclxuIiwiO1xyXG4kKGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIG9uUmVtb3ZlKCl7XHJcbiAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgcG9zdD17XHJcbiAgICAgIGlkOiR0aGlzLmF0dHIoJ3VpZCcpLFxyXG4gICAgICB0eXBlOiR0aGlzLmF0dHIoJ21vZGUnKVxyXG4gICAgfTtcclxuICAgICQucG9zdCgkdGhpcy5hdHRyKCd1cmwnKSxwb3N0LGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICBpZihkYXRhICYmIGRhdGE9PSdlcnInKXtcclxuICAgICAgICBtc2c9JHRoaXMuZGF0YSgncmVtb3ZlLWVycm9yJyk7XHJcbiAgICAgICAgaWYoIW1zZyl7XHJcbiAgICAgICAgICBtc2c9J9Cd0LXQstC+0LfQvNC+0LbQvdC+INGD0LTQsNC70LjRgtGMINGN0LvQtdC80LXQvdGCJztcclxuICAgICAgICB9XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTptc2csdHlwZTonZXJyJ30pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbW9kZT0kdGhpcy5hdHRyKCdtb2RlJyk7XHJcbiAgICAgIGlmKCFtb2RlKXtcclxuICAgICAgICBtb2RlPSdybSc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKG1vZGU9PSdybScpIHtcclxuICAgICAgICBybSA9ICR0aGlzLmNsb3Nlc3QoJy50b19yZW1vdmUnKTtcclxuICAgICAgICBybV9jbGFzcyA9IHJtLmF0dHIoJ3JtX2NsYXNzJyk7XHJcbiAgICAgICAgaWYgKHJtX2NsYXNzKSB7XHJcbiAgICAgICAgICAkKHJtX2NsYXNzKS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJtLnJlbW92ZSgpO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cj0YHQv9C10YjQvdC+0LUg0YPQtNCw0LvQtdC90LjQtS4nLHR5cGU6J2luZm8nfSlcclxuICAgICAgfVxyXG4gICAgICBpZihtb2RlPT0ncmVsb2FkJyl7XHJcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgbG9jYXRpb24uaHJlZj1sb2NhdGlvbi5ocmVmO1xyXG4gICAgICB9XHJcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKCl7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Ce0YjQuNCx0LrQsCDRg9C00LDQu9C90LjRjycsdHlwZTonZXJyJ30pO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuYWpheF9yZW1vdmUnLGZ1bmN0aW9uKCl7XHJcbiAgICBub3RpZmljYXRpb24uY29uZmlybSh7XHJcbiAgICAgIGNhbGxiYWNrWWVzOm9uUmVtb3ZlLFxyXG4gICAgICBvYmo6JCh0aGlzKSxcclxuICAgICAgbm90eWZ5X2NsYXNzOiBcIm5vdGlmeV9ib3gtYWxlcnRcIlxyXG4gICAgfSlcclxuICB9KTtcclxuXHJcbn0pO1xyXG5cclxuIiwiaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xyXG4gIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKG9UaGlzKSB7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgLy8g0LHQu9C40LbQsNC50YjQuNC5INCw0L3QsNC70L7QsyDQstC90YPRgtGA0LXQvdC90LXQuSDRhNGD0L3QutGG0LjQuFxyXG4gICAgICAvLyBJc0NhbGxhYmxlINCyIEVDTUFTY3JpcHQgNVxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBhQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXHJcbiAgICAgIGZUb0JpbmQgPSB0aGlzLFxyXG4gICAgICBmTk9QID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB9LFxyXG4gICAgICBmQm91bmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1AgJiYgb1RoaXNcclxuICAgICAgICAgICAgPyB0aGlzXHJcbiAgICAgICAgICAgIDogb1RoaXMsXHJcbiAgICAgICAgICBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xyXG4gICAgICB9O1xyXG5cclxuICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XHJcbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcclxuXHJcbiAgICByZXR1cm4gZkJvdW5kO1xyXG4gIH07XHJcbn1cclxuXHJcbmlmICghU3RyaW5nLnByb3RvdHlwZS50cmltKSB7XHJcbiAgKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8g0JLRi9GA0LXQt9Cw0LXQvCBCT00g0Lgg0L3QtdGA0LDQt9GA0YvQstC90YvQuSDQv9GA0L7QsdC10LtcclxuICAgIFN0cmluZy5wcm90b3R5cGUudHJpbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9eW1xcc1xcdUZFRkZcXHhBMF0rfFtcXHNcXHVGRUZGXFx4QTBdKyQvZywgJycpO1xyXG4gICAgfTtcclxuICB9KSgpO1xyXG59IiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuaGlkZGVuLWxpbmsnKS5yZXBsYWNlV2l0aChmdW5jdGlvbiAoKSB7XHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICByZXR1cm4gJzxhIGhyZWY9XCInICsgJHRoaXMuZGF0YSgnbGluaycpICsgJ1wiIHJlbD1cIicrICR0aGlzLmRhdGEoJ3JlbCcpICsnXCIgY2xhc3M9XCInICsgJHRoaXMuYXR0cignY2xhc3MnKSArICdcIj4nICsgJHRoaXMudGV4dCgpICsgJzwvYT4nO1xyXG4gIH0pXHJcbn0pKCk7XHJcbiIsInZhciBzdG9yZV9wb2ludHMgPSAoZnVuY3Rpb24oKXtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gY2hhbmdlQ291bnRyeSgpe1xyXG4gICAgICAgIHZhciB0aGF0ID0gJCgnI3N0b3JlX3BvaW50X2NvdW50cnknKTtcclxuICAgICAgICBpZiAodGhhdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdE9wdGlvbnMgPSAkKHRoYXQpLmZpbmQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmRhdGEoJ2NpdGllcycpLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRzID0gJCgnI3N0b3JlLXBvaW50cycpLFxyXG4gICAgICAgICAgICAgICAgY291bnRyeSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmF0dHIoJ3ZhbHVlJyk7XHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RPcHRpb25zLmxlbmd0aCA+IDEgJiYgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0b3JlX3BvaW50X2NpdHknKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3ZhciBvcHRpb25zID0gJzxvcHRpb24gdmFsdWU9XCJcIj7QktGL0LHQtdGA0LjRgtC1INCz0L7RgNC+0LQ8L29wdGlvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb25zID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgaXRlbSArICdcIj4nICsgaXRlbSArICc8L29wdGlvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdC5pbm5lckhUTUwgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vJChwb2ludHMpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgLy8gZ29vZ2xlTWFwLnNob3dNYXAoKTtcclxuICAgICAgICAgICAgLy8gZ29vZ2xlTWFwLnNob3dNYXJrZXIoY291bnRyeSwgJycpO1xyXG4gICAgICAgICAgICBjaGFuZ2VDaXR5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjaGFuZ2VDaXR5KCl7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBnb29nbGVNYXAgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHRoYXQgPSAkKCcjc3RvcmVfcG9pbnRfY2l0eScpO1xyXG4gICAgICAgIGlmICh0aGF0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgY2l0eSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmF0dHIoJ3ZhbHVlJyksXHJcbiAgICAgICAgICAgICAgICBjb3VudHJ5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgJCgnI3N0b3JlX3BvaW50X2NvdW50cnknKSkuYXR0cigndmFsdWUnKSxcclxuICAgICAgICAgICAgICAgIHBvaW50cyA9ICQoJyNzdG9yZS1wb2ludHMnKTtcclxuICAgICAgICAgICAgaWYgKGNvdW50cnkgJiYgY2l0eSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gcG9pbnRzLmZpbmQoJy5zdG9yZS1wb2ludHNfX3BvaW50c19yb3cnKSxcclxuICAgICAgICAgICAgICAgICAgICB2aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5zaG93TWFya2VyKGNvdW50cnksIGNpdHkpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQuZWFjaChpdGVtcywgZnVuY3Rpb24gKGluZGV4LCBkaXYpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJChkaXYpLmRhdGEoJ2NpdHknKSA9PSBjaXR5ICYmICQoZGl2KS5kYXRhKCdjb3VudHJ5JykgPT0gY291bnRyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGRpdikucmVtb3ZlQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzX3Jvdy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChkaXYpLmFkZENsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50c19yb3ctaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQocG9pbnRzKS5yZW1vdmVDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHMtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwLnNob3dNYXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQocG9pbnRzKS5hZGRDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHMtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwLmhpZGVNYXAoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQocG9pbnRzKS5hZGRDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHMtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICBnb29nbGVNYXAuaGlkZU1hcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8v0LTQu9GPINGC0L7Rh9C10Log0L/RgNC+0LTQsNC2LCDRgdC+0LHRi9GC0LjRjyDQvdCwINCy0YvQsdC+0YAg0YHQtdC70LXQutGC0L7QslxyXG4gICAgdmFyIGJvZHkgPSAkKCdib2R5Jyk7XHJcblxyXG4gICAgJChib2R5KS5vbignY2hhbmdlJywgJyNzdG9yZV9wb2ludF9jb3VudHJ5JywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGNoYW5nZUNvdW50cnkoKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICAkKGJvZHkpLm9uKCdjaGFuZ2UnLCAnI3N0b3JlX3BvaW50X2NpdHknLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgY2hhbmdlQ2l0eSgpO1xyXG5cclxuICAgIH0pO1xyXG5cclxuICAgIGNoYW5nZUNvdW50cnkoKTtcclxuXHJcblxyXG59KSgpO1xyXG5cclxuXHJcblxyXG5cclxuIiwidmFyIGhhc2hUYWdzID0gKGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgZnVuY3Rpb24gbG9jYXRpb25IYXNoKCkge1xyXG4gICAgICAgIHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XHJcblxyXG4gICAgICAgIGlmIChoYXNoICE9IFwiXCIpIHtcclxuICAgICAgICAgICAgdmFyIGhhc2hCb2R5ID0gaGFzaC5zcGxpdChcIj9cIik7XHJcbiAgICAgICAgICAgIGlmIChoYXNoQm9keVsxXSkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gbG9jYXRpb24ub3JpZ2luICsgbG9jYXRpb24ucGF0aG5hbWUgKyAnPycgKyBoYXNoQm9keVsxXSArIGhhc2hCb2R5WzBdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpbmtzID0gJCgnYVtocmVmPVwiJyArIGhhc2hCb2R5WzBdICsgJ1wiXS5tb2RhbHNfb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxpbmtzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQobGlua3NbMF0pLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbG9jYXRpb25IYXNoKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBsb2NhdGlvbkhhc2goKVxyXG5cclxufSkoKTsiLCJ2YXIgcGx1Z2lucyA9IChmdW5jdGlvbigpe1xyXG4gICAgdmFyIGljb25DbG9zZSA9ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJDYXBhXzFcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHdpZHRoPVwiMTJweFwiIGhlaWdodD1cIjEycHhcIiB2aWV3Qm94PVwiMCAwIDM1NyAzNTdcIiBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzU3IDM1NztcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPjxnPicrXHJcbiAgICAgICAgJzxnIGlkPVwiY2xvc2VcIj48cG9seWdvbiBwb2ludHM9XCIzNTcsMzUuNyAzMjEuMywwIDE3OC41LDE0Mi44IDM1LjcsMCAwLDM1LjcgMTQyLjgsMTc4LjUgMCwzMjEuMyAzNS43LDM1NyAxNzguNSwyMTQuMiAzMjEuMywzNTcgMzU3LDMyMS4zICAgICAyMTQuMiwxNzguNSAgIFwiIGZpbGw9XCIjRkZGRkZGXCIvPicrXHJcbiAgICAgICAgJzwvc3ZnPic7XHJcbiAgICB2YXIgdGVtcGxhdGU9JzxkaXYgY2xhc3M9XCJwYWdlLXdyYXAgaW5zdGFsbC1wbHVnaW5faW5uZXJcIj4nK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJpbnN0YWxsLXBsdWdpbl90ZXh0XCI+e3t0ZXh0fX08L2Rpdj4nK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJpbnN0YWxsLXBsdWdpbl9idXR0b25zXCI+JytcclxuICAgICAgICAgICAgICAgICAgICAnPGEgY2xhc3M9XCJidG4gYnRuLW1pbmkgYnRuLXJvdW5kIGluc3RhbGwtcGx1Z2luX2J1dHRvblwiICBocmVmPVwie3tocmVmfX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj57e3RpdGxlfX08L2E+JytcclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImluc3RhbGwtcGx1Z2luX2J1dHRvbi1jbG9zZVwiPicraWNvbkNsb3NlKyc8L2Rpdj4nK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicrXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgdmFyIHBsdWdpbkluc3RhbGxEaXZDbGFzcyA9ICdpbnN0YWxsLXBsdWdpbi1pbmRleCc7XHJcbiAgICB2YXIgcGx1Z2luSW5zdGFsbERpdkFjY291bnRDbGFzcyA9ICdpbnN0YWxsLXBsdWdpbi1hY2NvdW50JztcclxuICAgIHZhciBjb29raWVQYW5lbEhpZGRlbiA9ICdzZC1pbnN0YWxsLXBsdWdpbi1oaWRkZW4nO1xyXG4gICAgdmFyIGNvb2tpZUFjY291bnREaXZIaWRkZW4gPSAnc2QtaW5zdGFsbC1wbHVnaW4tYWNjb3VudC1oaWRkZW4nO1xyXG4gICAgdmFyIGlzT3BlcmEgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJyBPUFIvJykgPj0gMDtcclxuICAgIHZhciBpc1lhbmRleCA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignIFlhQnJvd3Nlci8nKSA+PSAwO1xyXG4gICAgdmFyIGV4dGVuc2lvbnMgPSB7XHJcbiAgICAgICAgJ2Nocm9tZSc6IHtcclxuICAgICAgICAgICAgJ2Rpdl9pZCc6ICdzZF9jaHJvbWVfYXBwJyxcclxuICAgICAgICAgICAgJ3VzZWQnOiAhIXdpbmRvdy5jaHJvbWUgJiYgd2luZG93LmNocm9tZS53ZWJzdG9yZSAhPT0gbnVsbCAmJiAhaXNPcGVyYSAmJiAhaXNZYW5kZXgsXHJcbiAgICAgICAgICAgIC8vJ3RleHQnOiBsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcclxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9jaHJvbWUuZ29vZ2xlLmNvbS93ZWJzdG9yZS9kZXRhaWwvc2VjcmV0ZGlzY291bnRlcnJ1LSVFMiU4MCU5My0lRDAlQkElRDElOEQlRDElODglRDAlQjEvbWNvbGhoZW1mYWNwb2FnaGppZGhsaWVjcGlhbnBuam4nLFxyXG4gICAgICAgICAgICAnaW5zdGFsbF9idXR0b25fY2xhc3MnOiAncGx1Z2luLWJyb3dzZXJzLWxpbmstY2hyb21lJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2ZpcmVmb3gnOiB7XHJcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2RfZmlyZWZveF9hcHAnLFxyXG4gICAgICAgICAgICAndXNlZCc6ICB0eXBlb2YgSW5zdGFsbFRyaWdnZXIgIT09ICd1bmRlZmluZWQnLFxyXG4gICAgICAgICAgICAvLyd0ZXh0JzpsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcclxuICAgICAgICAgICAgLy8naHJlZic6ICdodHRwczovL2FkZG9ucy5tb3ppbGxhLm9yZy9ydS9maXJlZm94L2FkZG9uL3NlY3JldGRpc2NvdW50ZXItJUQwJUJBJUQxJThEJUQxJTg4JUQwJUIxJUQxJThEJUQwJUJBLSVEMSU4MSVEMCVCNSVEMSU4MCVEMCVCMiVEMCVCOCVEMSU4MS8nLFxyXG4gICAgICAgICAgICAnaHJlZic6ICdodHRwczovL2FkZG9ucy5tb3ppbGxhLm9yZy9ydS9maXJlZm94L2FkZG9uL3NlY3JldGRpc2NvdW50ZXItY2FzaGJhY2snLFxyXG4gICAgICAgICAgICAnaW5zdGFsbF9idXR0b25fY2xhc3MnOiAncGx1Z2luLWJyb3dzZXJzLWxpbmstZmlyZWZveCdcclxuICAgICAgICB9LFxyXG4gICAgICAgICdvcGVyYSc6IHtcclxuICAgICAgICAgICAgJ2Rpdl9pZCc6ICdzZF9vcGVyYV9hcHAnLFxyXG4gICAgICAgICAgICAndXNlZCc6IGlzT3BlcmEsXHJcbiAgICAgICAgICAgIC8vJ3RleHQnOmxnKFwiaW5zdGFsbF9wbHVnaW5fYW5kX2l0X3dpbGxfbm90aWNlX2Fib3V0X2Nhc2hiYWNrXCIpLFxyXG4gICAgICAgICAgICAnaHJlZic6ICdodHRwczovL2FkZG9ucy5vcGVyYS5jb20vcnUvZXh0ZW5zaW9ucy8/cmVmPXBhZ2UnLFxyXG4gICAgICAgICAgICAnaW5zdGFsbF9idXR0b25fY2xhc3MnOiAncGx1Z2luLWJyb3dzZXJzLWxpbmstb3BlcmEnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAneWFuZGV4Jzoge1xyXG4gICAgICAgICAgICAnZGl2X2lkJzogJ3NkX3lhbmRleF9hcHAnLFxyXG4gICAgICAgICAgICAndXNlZCc6IGlzWWFuZGV4LFxyXG4gICAgICAgICAgICAvLyd0ZXh0JzpsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcclxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMub3BlcmEuY29tL3J1L2V4dGVuc2lvbnMvP3JlZj1wYWdlJyxcclxuICAgICAgICAgICAgJ2luc3RhbGxfYnV0dG9uX2NsYXNzJzogJ3BsdWdpbi1icm93c2Vycy1saW5rLXlhbmRleCdcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRQYW5lbChocmVmKSB7XHJcbiAgICAgICAgdmFyIHBsdWdpbkluc3RhbGxQYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwbHVnaW4taW5zdGFsbC1wYW5lbCcpOy8v0LLRi9Cy0L7QtNC40YLRjCDQu9C4INC/0LDQvdC10LvRjFxyXG4gICAgICAgIGlmIChwbHVnaW5JbnN0YWxsUGFuZWwgJiYgZ2V0Q29va2llKGNvb2tpZVBhbmVsSGlkZGVuKSAhPT0gJzEnICkge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7dGV4dH19JywgbGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIikpO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7aHJlZn19JywgaHJlZik7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZSgne3t0aXRsZX19JywgbGcoXCJpbnN0YWxsX3BsdWdpblwiKSk7XHJcbiAgICAgICAgICAgIHZhciBzZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xyXG4gICAgICAgICAgICBzZWN0aW9uLmNsYXNzTmFtZSA9ICdpbnN0YWxsLXBsdWdpbic7XHJcbiAgICAgICAgICAgIHNlY3Rpb24uaW5uZXJIVE1MID0gdGVtcGxhdGU7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2Vjb25kbGluZSA9IGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcignLmhlYWRlci1zZWNvbmRsaW5lJyk7XHJcbiAgICAgICAgICAgIGlmIChzZWNvbmRsaW5lKSB7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmRsaW5lLmFwcGVuZENoaWxkKHNlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmluc3RhbGwtcGx1Z2luX2J1dHRvbi1jbG9zZScpLm9uY2xpY2sgPSBjbG9zZUNsaWNrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEJ1dHRvbkluc3RhbGxWaXNpYmxlKGJ1dHRvbkNsYXNzKSB7XHJcbiAgICAgICAgJCgnLicgKyBwbHVnaW5JbnN0YWxsRGl2Q2xhc3MpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAkKCcuJyArIGJ1dHRvbkNsYXNzKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgaWYgKGdldENvb2tpZShjb29raWVBY2NvdW50RGl2SGlkZGVuKSAhPT0gJzEnKSB7XHJcbiAgICAgICAgICAgICQoJy4nICsgcGx1Z2luSW5zdGFsbERpdkFjY291bnRDbGFzcykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjbG9zZUNsaWNrKCl7XHJcbiAgICAgICAgJCgnLmluc3RhbGwtcGx1Z2luJykuYWRkQ2xhc3MoJ2luc3RhbGwtcGx1Z2luX2hpZGRlbicpO1xyXG4gICAgICAgIHNldENvb2tpZShjb29raWVQYW5lbEhpZGRlbiwgJzEnLCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgJCgnLmluc3RhbGwtcGx1Z2luLWFjY291bnQtbGF0ZXInKS5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNldENvb2tpZShjb29raWVBY2NvdW50RGl2SGlkZGVuLCAnMScsIDEwKTtcclxuICAgICAgICAkKCcuaW5zdGFsbC1wbHVnaW4tYWNjb3VudCcpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGV4dGVuc2lvbnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChleHRlbnNpb25zW2tleV0udXNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhcHBJZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyMnK2V4dGVuc2lvbnNba2V5XS5kaXZfaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghYXBwSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy/Qv9Cw0L3QtdC70Ywg0YEg0LrQvdC+0L/QutC+0LlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0UGFuZWwoZXh0ZW5zaW9uc1trZXldLmhyZWYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL9C90LAg0LPQu9Cw0LLQvdC+0LkgINC4INCyIC9hY2NvdW50INCx0LvQvtC60Lgg0YEg0LjQutC+0L3QutCw0LzQuCDQuCDQutC90L7Qv9C60LDQvNC4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEJ1dHRvbkluc3RhbGxWaXNpYmxlKGV4dGVuc2lvbnNba2V5XS5pbnN0YWxsX2J1dHRvbl9jbGFzcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMzAwMCk7XHJcbiAgICB9O1xyXG5cclxufSkoKTsiLCIvKipcclxuICogQGF1dGhvciB6aGl4aW4gd2VuIDx3ZW56aGl4aW4yMDEwQGdtYWlsLmNvbT5cclxuICogQHZlcnNpb24gMS4yLjFcclxuICpcclxuICogaHR0cDovL3dlbnpoaXhpbi5uZXQuY24vcC9tdWx0aXBsZS1zZWxlY3QvXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uICgkKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8vIGl0IG9ubHkgZG9lcyAnJXMnLCBhbmQgcmV0dXJuICcnIHdoZW4gYXJndW1lbnRzIGFyZSB1bmRlZmluZWRcclxuICAgIHZhciBzcHJpbnRmID0gZnVuY3Rpb24gKHN0cikge1xyXG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxyXG4gICAgICAgICAgICBmbGFnID0gdHJ1ZSxcclxuICAgICAgICAgICAgaSA9IDE7XHJcblxyXG4gICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBhcmcgPSBhcmdzW2krK107XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGZsYWcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYXJnO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmbGFnID8gc3RyIDogJyc7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciByZW1vdmVEaWFjcml0aWNzID0gZnVuY3Rpb24gKHN0cikge1xyXG4gICAgICAgIHZhciBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXAgPSBbXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0EnLCAnbGV0dGVycyc6L1tcXHUwMDQxXFx1MjRCNlxcdUZGMjFcXHUwMEMwXFx1MDBDMVxcdTAwQzJcXHUxRUE2XFx1MUVBNFxcdTFFQUFcXHUxRUE4XFx1MDBDM1xcdTAxMDBcXHUwMTAyXFx1MUVCMFxcdTFFQUVcXHUxRUI0XFx1MUVCMlxcdTAyMjZcXHUwMUUwXFx1MDBDNFxcdTAxREVcXHUxRUEyXFx1MDBDNVxcdTAxRkFcXHUwMUNEXFx1MDIwMFxcdTAyMDJcXHUxRUEwXFx1MUVBQ1xcdTFFQjZcXHUxRTAwXFx1MDEwNFxcdTAyM0FcXHUyQzZGXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQUEnLCdsZXR0ZXJzJzovW1xcdUE3MzJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidBRScsJ2xldHRlcnMnOi9bXFx1MDBDNlxcdTAxRkNcXHUwMUUyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQU8nLCdsZXR0ZXJzJzovW1xcdUE3MzRdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidBVScsJ2xldHRlcnMnOi9bXFx1QTczNl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0FWJywnbGV0dGVycyc6L1tcXHVBNzM4XFx1QTczQV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0FZJywnbGV0dGVycyc6L1tcXHVBNzNDXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQicsICdsZXR0ZXJzJzovW1xcdTAwNDJcXHUyNEI3XFx1RkYyMlxcdTFFMDJcXHUxRTA0XFx1MUUwNlxcdTAyNDNcXHUwMTgyXFx1MDE4MV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0MnLCAnbGV0dGVycyc6L1tcXHUwMDQzXFx1MjRCOFxcdUZGMjNcXHUwMTA2XFx1MDEwOFxcdTAxMEFcXHUwMTBDXFx1MDBDN1xcdTFFMDhcXHUwMTg3XFx1MDIzQlxcdUE3M0VdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidEJywgJ2xldHRlcnMnOi9bXFx1MDA0NFxcdTI0QjlcXHVGRjI0XFx1MUUwQVxcdTAxMEVcXHUxRTBDXFx1MUUxMFxcdTFFMTJcXHUxRTBFXFx1MDExMFxcdTAxOEJcXHUwMThBXFx1MDE4OVxcdUE3NzldL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidEWicsJ2xldHRlcnMnOi9bXFx1MDFGMVxcdTAxQzRdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidEeicsJ2xldHRlcnMnOi9bXFx1MDFGMlxcdTAxQzVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidFJywgJ2xldHRlcnMnOi9bXFx1MDA0NVxcdTI0QkFcXHVGRjI1XFx1MDBDOFxcdTAwQzlcXHUwMENBXFx1MUVDMFxcdTFFQkVcXHUxRUM0XFx1MUVDMlxcdTFFQkNcXHUwMTEyXFx1MUUxNFxcdTFFMTZcXHUwMTE0XFx1MDExNlxcdTAwQ0JcXHUxRUJBXFx1MDExQVxcdTAyMDRcXHUwMjA2XFx1MUVCOFxcdTFFQzZcXHUwMjI4XFx1MUUxQ1xcdTAxMThcXHUxRTE4XFx1MUUxQVxcdTAxOTBcXHUwMThFXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonRicsICdsZXR0ZXJzJzovW1xcdTAwNDZcXHUyNEJCXFx1RkYyNlxcdTFFMUVcXHUwMTkxXFx1QTc3Ql0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0cnLCAnbGV0dGVycyc6L1tcXHUwMDQ3XFx1MjRCQ1xcdUZGMjdcXHUwMUY0XFx1MDExQ1xcdTFFMjBcXHUwMTFFXFx1MDEyMFxcdTAxRTZcXHUwMTIyXFx1MDFFNFxcdTAxOTNcXHVBN0EwXFx1QTc3RFxcdUE3N0VdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidIJywgJ2xldHRlcnMnOi9bXFx1MDA0OFxcdTI0QkRcXHVGRjI4XFx1MDEyNFxcdTFFMjJcXHUxRTI2XFx1MDIxRVxcdTFFMjRcXHUxRTI4XFx1MUUyQVxcdTAxMjZcXHUyQzY3XFx1MkM3NVxcdUE3OERdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidJJywgJ2xldHRlcnMnOi9bXFx1MDA0OVxcdTI0QkVcXHVGRjI5XFx1MDBDQ1xcdTAwQ0RcXHUwMENFXFx1MDEyOFxcdTAxMkFcXHUwMTJDXFx1MDEzMFxcdTAwQ0ZcXHUxRTJFXFx1MUVDOFxcdTAxQ0ZcXHUwMjA4XFx1MDIwQVxcdTFFQ0FcXHUwMTJFXFx1MUUyQ1xcdTAxOTddL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidKJywgJ2xldHRlcnMnOi9bXFx1MDA0QVxcdTI0QkZcXHVGRjJBXFx1MDEzNFxcdTAyNDhdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidLJywgJ2xldHRlcnMnOi9bXFx1MDA0QlxcdTI0QzBcXHVGRjJCXFx1MUUzMFxcdTAxRThcXHUxRTMyXFx1MDEzNlxcdTFFMzRcXHUwMTk4XFx1MkM2OVxcdUE3NDBcXHVBNzQyXFx1QTc0NFxcdUE3QTJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidMJywgJ2xldHRlcnMnOi9bXFx1MDA0Q1xcdTI0QzFcXHVGRjJDXFx1MDEzRlxcdTAxMzlcXHUwMTNEXFx1MUUzNlxcdTFFMzhcXHUwMTNCXFx1MUUzQ1xcdTFFM0FcXHUwMTQxXFx1MDIzRFxcdTJDNjJcXHUyQzYwXFx1QTc0OFxcdUE3NDZcXHVBNzgwXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTEonLCdsZXR0ZXJzJzovW1xcdTAxQzddL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidMaicsJ2xldHRlcnMnOi9bXFx1MDFDOF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J00nLCAnbGV0dGVycyc6L1tcXHUwMDREXFx1MjRDMlxcdUZGMkRcXHUxRTNFXFx1MUU0MFxcdTFFNDJcXHUyQzZFXFx1MDE5Q10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J04nLCAnbGV0dGVycyc6L1tcXHUwMDRFXFx1MjRDM1xcdUZGMkVcXHUwMUY4XFx1MDE0M1xcdTAwRDFcXHUxRTQ0XFx1MDE0N1xcdTFFNDZcXHUwMTQ1XFx1MUU0QVxcdTFFNDhcXHUwMjIwXFx1MDE5RFxcdUE3OTBcXHVBN0E0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTkonLCdsZXR0ZXJzJzovW1xcdTAxQ0FdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidOaicsJ2xldHRlcnMnOi9bXFx1MDFDQl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J08nLCAnbGV0dGVycyc6L1tcXHUwMDRGXFx1MjRDNFxcdUZGMkZcXHUwMEQyXFx1MDBEM1xcdTAwRDRcXHUxRUQyXFx1MUVEMFxcdTFFRDZcXHUxRUQ0XFx1MDBENVxcdTFFNENcXHUwMjJDXFx1MUU0RVxcdTAxNENcXHUxRTUwXFx1MUU1MlxcdTAxNEVcXHUwMjJFXFx1MDIzMFxcdTAwRDZcXHUwMjJBXFx1MUVDRVxcdTAxNTBcXHUwMUQxXFx1MDIwQ1xcdTAyMEVcXHUwMUEwXFx1MUVEQ1xcdTFFREFcXHUxRUUwXFx1MUVERVxcdTFFRTJcXHUxRUNDXFx1MUVEOFxcdTAxRUFcXHUwMUVDXFx1MDBEOFxcdTAxRkVcXHUwMTg2XFx1MDE5RlxcdUE3NEFcXHVBNzRDXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonT0knLCdsZXR0ZXJzJzovW1xcdTAxQTJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidPTycsJ2xldHRlcnMnOi9bXFx1QTc0RV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J09VJywnbGV0dGVycyc6L1tcXHUwMjIyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonUCcsICdsZXR0ZXJzJzovW1xcdTAwNTBcXHUyNEM1XFx1RkYzMFxcdTFFNTRcXHUxRTU2XFx1MDFBNFxcdTJDNjNcXHVBNzUwXFx1QTc1MlxcdUE3NTRdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidRJywgJ2xldHRlcnMnOi9bXFx1MDA1MVxcdTI0QzZcXHVGRjMxXFx1QTc1NlxcdUE3NThcXHUwMjRBXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonUicsICdsZXR0ZXJzJzovW1xcdTAwNTJcXHUyNEM3XFx1RkYzMlxcdTAxNTRcXHUxRTU4XFx1MDE1OFxcdTAyMTBcXHUwMjEyXFx1MUU1QVxcdTFFNUNcXHUwMTU2XFx1MUU1RVxcdTAyNENcXHUyQzY0XFx1QTc1QVxcdUE3QTZcXHVBNzgyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonUycsICdsZXR0ZXJzJzovW1xcdTAwNTNcXHUyNEM4XFx1RkYzM1xcdTFFOUVcXHUwMTVBXFx1MUU2NFxcdTAxNUNcXHUxRTYwXFx1MDE2MFxcdTFFNjZcXHUxRTYyXFx1MUU2OFxcdTAyMThcXHUwMTVFXFx1MkM3RVxcdUE3QThcXHVBNzg0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonVCcsICdsZXR0ZXJzJzovW1xcdTAwNTRcXHUyNEM5XFx1RkYzNFxcdTFFNkFcXHUwMTY0XFx1MUU2Q1xcdTAyMUFcXHUwMTYyXFx1MUU3MFxcdTFFNkVcXHUwMTY2XFx1MDFBQ1xcdTAxQUVcXHUwMjNFXFx1QTc4Nl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1RaJywnbGV0dGVycyc6L1tcXHVBNzI4XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonVScsICdsZXR0ZXJzJzovW1xcdTAwNTVcXHUyNENBXFx1RkYzNVxcdTAwRDlcXHUwMERBXFx1MDBEQlxcdTAxNjhcXHUxRTc4XFx1MDE2QVxcdTFFN0FcXHUwMTZDXFx1MDBEQ1xcdTAxREJcXHUwMUQ3XFx1MDFENVxcdTAxRDlcXHUxRUU2XFx1MDE2RVxcdTAxNzBcXHUwMUQzXFx1MDIxNFxcdTAyMTZcXHUwMUFGXFx1MUVFQVxcdTFFRThcXHUxRUVFXFx1MUVFQ1xcdTFFRjBcXHUxRUU0XFx1MUU3MlxcdTAxNzJcXHUxRTc2XFx1MUU3NFxcdTAyNDRdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidWJywgJ2xldHRlcnMnOi9bXFx1MDA1NlxcdTI0Q0JcXHVGRjM2XFx1MUU3Q1xcdTFFN0VcXHUwMUIyXFx1QTc1RVxcdTAyNDVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidWWScsJ2xldHRlcnMnOi9bXFx1QTc2MF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1cnLCAnbGV0dGVycyc6L1tcXHUwMDU3XFx1MjRDQ1xcdUZGMzdcXHUxRTgwXFx1MUU4MlxcdTAxNzRcXHUxRTg2XFx1MUU4NFxcdTFFODhcXHUyQzcyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonWCcsICdsZXR0ZXJzJzovW1xcdTAwNThcXHUyNENEXFx1RkYzOFxcdTFFOEFcXHUxRThDXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonWScsICdsZXR0ZXJzJzovW1xcdTAwNTlcXHUyNENFXFx1RkYzOVxcdTFFRjJcXHUwMEREXFx1MDE3NlxcdTFFRjhcXHUwMjMyXFx1MUU4RVxcdTAxNzhcXHUxRUY2XFx1MUVGNFxcdTAxQjNcXHUwMjRFXFx1MUVGRV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1onLCAnbGV0dGVycyc6L1tcXHUwMDVBXFx1MjRDRlxcdUZGM0FcXHUwMTc5XFx1MUU5MFxcdTAxN0JcXHUwMTdEXFx1MUU5MlxcdTFFOTRcXHUwMUI1XFx1MDIyNFxcdTJDN0ZcXHUyQzZCXFx1QTc2Ml0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2EnLCAnbGV0dGVycyc6L1tcXHUwMDYxXFx1MjREMFxcdUZGNDFcXHUxRTlBXFx1MDBFMFxcdTAwRTFcXHUwMEUyXFx1MUVBN1xcdTFFQTVcXHUxRUFCXFx1MUVBOVxcdTAwRTNcXHUwMTAxXFx1MDEwM1xcdTFFQjFcXHUxRUFGXFx1MUVCNVxcdTFFQjNcXHUwMjI3XFx1MDFFMVxcdTAwRTRcXHUwMURGXFx1MUVBM1xcdTAwRTVcXHUwMUZCXFx1MDFDRVxcdTAyMDFcXHUwMjAzXFx1MUVBMVxcdTFFQURcXHUxRUI3XFx1MUUwMVxcdTAxMDVcXHUyQzY1XFx1MDI1MF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2FhJywnbGV0dGVycyc6L1tcXHVBNzMzXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYWUnLCdsZXR0ZXJzJzovW1xcdTAwRTZcXHUwMUZEXFx1MDFFM10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2FvJywnbGV0dGVycyc6L1tcXHVBNzM1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYXUnLCdsZXR0ZXJzJzovW1xcdUE3MzddL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidhdicsJ2xldHRlcnMnOi9bXFx1QTczOVxcdUE3M0JdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidheScsJ2xldHRlcnMnOi9bXFx1QTczRF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2InLCAnbGV0dGVycyc6L1tcXHUwMDYyXFx1MjREMVxcdUZGNDJcXHUxRTAzXFx1MUUwNVxcdTFFMDdcXHUwMTgwXFx1MDE4M1xcdTAyNTNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidjJywgJ2xldHRlcnMnOi9bXFx1MDA2M1xcdTI0RDJcXHVGRjQzXFx1MDEwN1xcdTAxMDlcXHUwMTBCXFx1MDEwRFxcdTAwRTdcXHUxRTA5XFx1MDE4OFxcdTAyM0NcXHVBNzNGXFx1MjE4NF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2QnLCAnbGV0dGVycyc6L1tcXHUwMDY0XFx1MjREM1xcdUZGNDRcXHUxRTBCXFx1MDEwRlxcdTFFMERcXHUxRTExXFx1MUUxM1xcdTFFMEZcXHUwMTExXFx1MDE4Q1xcdTAyNTZcXHUwMjU3XFx1QTc3QV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2R6JywnbGV0dGVycyc6L1tcXHUwMUYzXFx1MDFDNl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2UnLCAnbGV0dGVycyc6L1tcXHUwMDY1XFx1MjRENFxcdUZGNDVcXHUwMEU4XFx1MDBFOVxcdTAwRUFcXHUxRUMxXFx1MUVCRlxcdTFFQzVcXHUxRUMzXFx1MUVCRFxcdTAxMTNcXHUxRTE1XFx1MUUxN1xcdTAxMTVcXHUwMTE3XFx1MDBFQlxcdTFFQkJcXHUwMTFCXFx1MDIwNVxcdTAyMDdcXHUxRUI5XFx1MUVDN1xcdTAyMjlcXHUxRTFEXFx1MDExOVxcdTFFMTlcXHUxRTFCXFx1MDI0N1xcdTAyNUJcXHUwMUREXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonZicsICdsZXR0ZXJzJzovW1xcdTAwNjZcXHUyNEQ1XFx1RkY0NlxcdTFFMUZcXHUwMTkyXFx1QTc3Q10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2cnLCAnbGV0dGVycyc6L1tcXHUwMDY3XFx1MjRENlxcdUZGNDdcXHUwMUY1XFx1MDExRFxcdTFFMjFcXHUwMTFGXFx1MDEyMVxcdTAxRTdcXHUwMTIzXFx1MDFFNVxcdTAyNjBcXHVBN0ExXFx1MUQ3OVxcdUE3N0ZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidoJywgJ2xldHRlcnMnOi9bXFx1MDA2OFxcdTI0RDdcXHVGRjQ4XFx1MDEyNVxcdTFFMjNcXHUxRTI3XFx1MDIxRlxcdTFFMjVcXHUxRTI5XFx1MUUyQlxcdTFFOTZcXHUwMTI3XFx1MkM2OFxcdTJDNzZcXHUwMjY1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonaHYnLCdsZXR0ZXJzJzovW1xcdTAxOTVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidpJywgJ2xldHRlcnMnOi9bXFx1MDA2OVxcdTI0RDhcXHVGRjQ5XFx1MDBFQ1xcdTAwRURcXHUwMEVFXFx1MDEyOVxcdTAxMkJcXHUwMTJEXFx1MDBFRlxcdTFFMkZcXHUxRUM5XFx1MDFEMFxcdTAyMDlcXHUwMjBCXFx1MUVDQlxcdTAxMkZcXHUxRTJEXFx1MDI2OFxcdTAxMzFdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidqJywgJ2xldHRlcnMnOi9bXFx1MDA2QVxcdTI0RDlcXHVGRjRBXFx1MDEzNVxcdTAxRjBcXHUwMjQ5XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonaycsICdsZXR0ZXJzJzovW1xcdTAwNkJcXHUyNERBXFx1RkY0QlxcdTFFMzFcXHUwMUU5XFx1MUUzM1xcdTAxMzdcXHUxRTM1XFx1MDE5OVxcdTJDNkFcXHVBNzQxXFx1QTc0M1xcdUE3NDVcXHVBN0EzXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonbCcsICdsZXR0ZXJzJzovW1xcdTAwNkNcXHUyNERCXFx1RkY0Q1xcdTAxNDBcXHUwMTNBXFx1MDEzRVxcdTFFMzdcXHUxRTM5XFx1MDEzQ1xcdTFFM0RcXHUxRTNCXFx1MDE3RlxcdTAxNDJcXHUwMTlBXFx1MDI2QlxcdTJDNjFcXHVBNzQ5XFx1QTc4MVxcdUE3NDddL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidsaicsJ2xldHRlcnMnOi9bXFx1MDFDOV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J20nLCAnbGV0dGVycyc6L1tcXHUwMDZEXFx1MjREQ1xcdUZGNERcXHUxRTNGXFx1MUU0MVxcdTFFNDNcXHUwMjcxXFx1MDI2Rl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J24nLCAnbGV0dGVycyc6L1tcXHUwMDZFXFx1MjRERFxcdUZGNEVcXHUwMUY5XFx1MDE0NFxcdTAwRjFcXHUxRTQ1XFx1MDE0OFxcdTFFNDdcXHUwMTQ2XFx1MUU0QlxcdTFFNDlcXHUwMTlFXFx1MDI3MlxcdTAxNDlcXHVBNzkxXFx1QTdBNV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J25qJywnbGV0dGVycyc6L1tcXHUwMUNDXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonbycsICdsZXR0ZXJzJzovW1xcdTAwNkZcXHUyNERFXFx1RkY0RlxcdTAwRjJcXHUwMEYzXFx1MDBGNFxcdTFFRDNcXHUxRUQxXFx1MUVEN1xcdTFFRDVcXHUwMEY1XFx1MUU0RFxcdTAyMkRcXHUxRTRGXFx1MDE0RFxcdTFFNTFcXHUxRTUzXFx1MDE0RlxcdTAyMkZcXHUwMjMxXFx1MDBGNlxcdTAyMkJcXHUxRUNGXFx1MDE1MVxcdTAxRDJcXHUwMjBEXFx1MDIwRlxcdTAxQTFcXHUxRUREXFx1MUVEQlxcdTFFRTFcXHUxRURGXFx1MUVFM1xcdTFFQ0RcXHUxRUQ5XFx1MDFFQlxcdTAxRURcXHUwMEY4XFx1MDFGRlxcdTAyNTRcXHVBNzRCXFx1QTc0RFxcdTAyNzVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidvaScsJ2xldHRlcnMnOi9bXFx1MDFBM10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J291JywnbGV0dGVycyc6L1tcXHUwMjIzXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonb28nLCdsZXR0ZXJzJzovW1xcdUE3NEZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidwJywnbGV0dGVycyc6L1tcXHUwMDcwXFx1MjRERlxcdUZGNTBcXHUxRTU1XFx1MUU1N1xcdTAxQTVcXHUxRDdEXFx1QTc1MVxcdUE3NTNcXHVBNzU1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoncScsJ2xldHRlcnMnOi9bXFx1MDA3MVxcdTI0RTBcXHVGRjUxXFx1MDI0QlxcdUE3NTdcXHVBNzU5XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoncicsJ2xldHRlcnMnOi9bXFx1MDA3MlxcdTI0RTFcXHVGRjUyXFx1MDE1NVxcdTFFNTlcXHUwMTU5XFx1MDIxMVxcdTAyMTNcXHUxRTVCXFx1MUU1RFxcdTAxNTdcXHUxRTVGXFx1MDI0RFxcdTAyN0RcXHVBNzVCXFx1QTdBN1xcdUE3ODNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidzJywnbGV0dGVycyc6L1tcXHUwMDczXFx1MjRFMlxcdUZGNTNcXHUwMERGXFx1MDE1QlxcdTFFNjVcXHUwMTVEXFx1MUU2MVxcdTAxNjFcXHUxRTY3XFx1MUU2M1xcdTFFNjlcXHUwMjE5XFx1MDE1RlxcdTAyM0ZcXHVBN0E5XFx1QTc4NVxcdTFFOUJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid0JywnbGV0dGVycyc6L1tcXHUwMDc0XFx1MjRFM1xcdUZGNTRcXHUxRTZCXFx1MUU5N1xcdTAxNjVcXHUxRTZEXFx1MDIxQlxcdTAxNjNcXHUxRTcxXFx1MUU2RlxcdTAxNjdcXHUwMUFEXFx1MDI4OFxcdTJDNjZcXHVBNzg3XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzondHonLCdsZXR0ZXJzJzovW1xcdUE3MjldL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid1JywnbGV0dGVycyc6L1tcXHUwMDc1XFx1MjRFNFxcdUZGNTVcXHUwMEY5XFx1MDBGQVxcdTAwRkJcXHUwMTY5XFx1MUU3OVxcdTAxNkJcXHUxRTdCXFx1MDE2RFxcdTAwRkNcXHUwMURDXFx1MDFEOFxcdTAxRDZcXHUwMURBXFx1MUVFN1xcdTAxNkZcXHUwMTcxXFx1MDFENFxcdTAyMTVcXHUwMjE3XFx1MDFCMFxcdTFFRUJcXHUxRUU5XFx1MUVFRlxcdTFFRURcXHUxRUYxXFx1MUVFNVxcdTFFNzNcXHUwMTczXFx1MUU3N1xcdTFFNzVcXHUwMjg5XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzondicsJ2xldHRlcnMnOi9bXFx1MDA3NlxcdTI0RTVcXHVGRjU2XFx1MUU3RFxcdTFFN0ZcXHUwMjhCXFx1QTc1RlxcdTAyOENdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid2eScsJ2xldHRlcnMnOi9bXFx1QTc2MV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3cnLCdsZXR0ZXJzJzovW1xcdTAwNzdcXHUyNEU2XFx1RkY1N1xcdTFFODFcXHUxRTgzXFx1MDE3NVxcdTFFODdcXHUxRTg1XFx1MUU5OFxcdTFFODlcXHUyQzczXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoneCcsJ2xldHRlcnMnOi9bXFx1MDA3OFxcdTI0RTdcXHVGRjU4XFx1MUU4QlxcdTFFOERdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid5JywnbGV0dGVycyc6L1tcXHUwMDc5XFx1MjRFOFxcdUZGNTlcXHUxRUYzXFx1MDBGRFxcdTAxNzdcXHUxRUY5XFx1MDIzM1xcdTFFOEZcXHUwMEZGXFx1MUVGN1xcdTFFOTlcXHUxRUY1XFx1MDFCNFxcdTAyNEZcXHUxRUZGXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoneicsJ2xldHRlcnMnOi9bXFx1MDA3QVxcdTI0RTlcXHVGRjVBXFx1MDE3QVxcdTFFOTFcXHUwMTdDXFx1MDE3RVxcdTFFOTNcXHUxRTk1XFx1MDFCNlxcdTAyMjVcXHUwMjQwXFx1MkM2Q1xcdUE3NjNdL2d9XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoZGVmYXVsdERpYWNyaXRpY3NSZW1vdmFsTWFwW2ldLmxldHRlcnMsIGRlZmF1bHREaWFjcml0aWNzUmVtb3ZhbE1hcFtpXS5iYXNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcblxyXG4gICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIE11bHRpcGxlU2VsZWN0KCRlbCwgb3B0aW9ucykge1xyXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgbmFtZSA9ICRlbC5hdHRyKCduYW1lJykgfHwgb3B0aW9ucy5uYW1lIHx8ICcnO1xyXG5cclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG5cclxuICAgICAgICAvLyBoaWRlIHNlbGVjdCBlbGVtZW50XHJcbiAgICAgICAgdGhpcy4kZWwgPSAkZWwuaGlkZSgpO1xyXG5cclxuICAgICAgICAvLyBsYWJlbCBlbGVtZW50XHJcbiAgICAgICAgdGhpcy4kbGFiZWwgPSB0aGlzLiRlbC5jbG9zZXN0KCdsYWJlbCcpO1xyXG4gICAgICAgIGlmICh0aGlzLiRsYWJlbC5sZW5ndGggPT09IDAgJiYgdGhpcy4kZWwuYXR0cignaWQnKSkge1xyXG4gICAgICAgICAgICB0aGlzLiRsYWJlbCA9ICQoc3ByaW50ZignbGFiZWxbZm9yPVwiJXNcIl0nLCB0aGlzLiRlbC5hdHRyKCdpZCcpLnJlcGxhY2UoLzovZywgJ1xcXFw6JykpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlc3RvcmUgY2xhc3MgYW5kIHRpdGxlIGZyb20gc2VsZWN0IGVsZW1lbnRcclxuICAgICAgICB0aGlzLiRwYXJlbnQgPSAkKHNwcmludGYoXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibXMtcGFyZW50ICVzXCIgJXMvPicsXHJcbiAgICAgICAgICAgICRlbC5hdHRyKCdjbGFzcycpIHx8ICcnLFxyXG4gICAgICAgICAgICBzcHJpbnRmKCd0aXRsZT1cIiVzXCInLCAkZWwuYXR0cigndGl0bGUnKSkpKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIHBsYWNlaG9sZGVyIHRvIGNob2ljZSBidXR0b25cclxuICAgICAgICB0aGlzLiRjaG9pY2UgPSAkKHNwcmludGYoW1xyXG4gICAgICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwibXMtY2hvaWNlXCI+JyxcclxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInBsYWNlaG9sZGVyXCI+JXM8L3NwYW4+JyxcclxuICAgICAgICAgICAgICAgICc8ZGl2PjwvZGl2PicsXHJcbiAgICAgICAgICAgICAgICAnPC9idXR0b24+J1xyXG4gICAgICAgICAgICBdLmpvaW4oJycpLFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIpKTtcclxuXHJcbiAgICAgICAgLy8gZGVmYXVsdCBwb3NpdGlvbiBpcyBib3R0b21cclxuICAgICAgICB0aGlzLiRkcm9wID0gJChzcHJpbnRmKCc8ZGl2IGNsYXNzPVwibXMtZHJvcCAlc1wiJXM+PC9kaXY+JyxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICBzcHJpbnRmKCcgc3R5bGU9XCJ3aWR0aDogJXNcIicsIHRoaXMub3B0aW9ucy5kcm9wV2lkdGgpKSk7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmFmdGVyKHRoaXMuJHBhcmVudCk7XHJcbiAgICAgICAgdGhpcy4kcGFyZW50LmFwcGVuZCh0aGlzLiRjaG9pY2UpO1xyXG4gICAgICAgIHRoaXMuJHBhcmVudC5hcHBlbmQodGhpcy4kZHJvcCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLiRlbC5wcm9wKCdkaXNhYmxlZCcpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy4kcGFyZW50LmNzcygnd2lkdGgnLFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMud2lkdGggfHxcclxuICAgICAgICAgICAgdGhpcy4kZWwuY3NzKCd3aWR0aCcpIHx8XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm91dGVyV2lkdGgoKSArIDIwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZWxlY3RBbGxOYW1lID0gJ2RhdGEtbmFtZT1cInNlbGVjdEFsbCcgKyBuYW1lICsgJ1wiJztcclxuICAgICAgICB0aGlzLnNlbGVjdEdyb3VwTmFtZSA9ICdkYXRhLW5hbWU9XCJzZWxlY3RHcm91cCcgKyBuYW1lICsgJ1wiJztcclxuICAgICAgICB0aGlzLnNlbGVjdEl0ZW1OYW1lID0gJ2RhdGEtbmFtZT1cInNlbGVjdEl0ZW0nICsgbmFtZSArICdcIic7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmtlZXBPcGVuKSB7XHJcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJChlLnRhcmdldClbMF0gPT09IHRoYXQuJGNob2ljZVswXSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJy5tcy1jaG9pY2UnKVswXSA9PT0gdGhhdC4kY2hvaWNlWzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCgkKGUudGFyZ2V0KVswXSA9PT0gdGhhdC4kZHJvcFswXSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJy5tcy1kcm9wJylbMF0gIT09IHRoYXQuJGRyb3BbMF0gJiYgZS50YXJnZXQgIT09ICRlbFswXSkgJiZcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgTXVsdGlwbGVTZWxlY3QucHJvdG90eXBlID0ge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yOiBNdWx0aXBsZVNlbGVjdCxcclxuXHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAkdWwgPSAkKCc8dWw+PC91bD4nKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuaHRtbCgnJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5hcHBlbmQoW1xyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibXMtc2VhcmNoXCI+JyxcclxuICAgICAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgYXV0b2NvbXBsZXRlPVwib2ZmXCIgYXV0b2NvcnJlY3Q9XCJvZmZcIiBhdXRvY2FwaXRpbGl6ZT1cIm9mZlwiIHNwZWxsY2hlY2s9XCJmYWxzZVwiPicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PiddLmpvaW4oJycpXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNlbGVjdEFsbCAmJiAhdGhpcy5vcHRpb25zLnNpbmdsZSkge1xyXG4gICAgICAgICAgICAgICAgJHVsLmFwcGVuZChbXHJcbiAgICAgICAgICAgICAgICAgICAgJzxsaSBjbGFzcz1cIm1zLXNlbGVjdC1hbGxcIj4nLFxyXG4gICAgICAgICAgICAgICAgICAgICc8bGFiZWw+JyxcclxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgJXMgLz4gJywgdGhpcy5zZWxlY3RBbGxOYW1lKSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0QWxsRGVsaW1pdGVyWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zZWxlY3RBbGxUZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zZWxlY3RBbGxEZWxpbWl0ZXJbMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvbGFiZWw+JyxcclxuICAgICAgICAgICAgICAgICAgICAnPC9saT4nXHJcbiAgICAgICAgICAgICAgICBdLmpvaW4oJycpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJC5lYWNoKHRoaXMuJGVsLmNoaWxkcmVuKCksIGZ1bmN0aW9uIChpLCBlbG0pIHtcclxuICAgICAgICAgICAgICAgICR1bC5hcHBlbmQodGhhdC5vcHRpb25Ub0h0bWwoaSwgZWxtKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkdWwuYXBwZW5kKHNwcmludGYoJzxsaSBjbGFzcz1cIm1zLW5vLXJlc3VsdHNcIj4lczwvbGk+JywgdGhpcy5vcHRpb25zLm5vTWF0Y2hlc0ZvdW5kKSk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuYXBwZW5kKCR1bCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoJ3VsJykuY3NzKCdtYXgtaGVpZ2h0JywgdGhpcy5vcHRpb25zLm1heEhlaWdodCArICdweCcpO1xyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoJy5tdWx0aXBsZScpLmNzcygnd2lkdGgnLCB0aGlzLm9wdGlvbnMubXVsdGlwbGVXaWR0aCArICdweCcpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kc2VhcmNoSW5wdXQgPSB0aGlzLiRkcm9wLmZpbmQoJy5tcy1zZWFyY2ggaW5wdXQnKTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsID0gdGhpcy4kZHJvcC5maW5kKCdpbnB1dFsnICsgdGhpcy5zZWxlY3RBbGxOYW1lICsgJ10nKTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzID0gdGhpcy4kZHJvcC5maW5kKCdpbnB1dFsnICsgdGhpcy5zZWxlY3RHcm91cE5hbWUgKyAnXScpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcyA9IHRoaXMuJGRyb3AuZmluZCgnaW5wdXRbJyArIHRoaXMuc2VsZWN0SXRlbU5hbWUgKyAnXTplbmFibGVkJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcyA9IHRoaXMuJGRyb3AuZmluZCgnaW5wdXRbJyArIHRoaXMuc2VsZWN0SXRlbU5hbWUgKyAnXTpkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMgPSB0aGlzLiRkcm9wLmZpbmQoJy5tcy1uby1yZXN1bHRzJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmV2ZW50cygpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdEFsbCh0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUodHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvcHRpb25Ub0h0bWw6IGZ1bmN0aW9uIChpLCBlbG0sIGdyb3VwLCBncm91cERpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgICRlbG0gPSAkKGVsbSksXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gJGVsbS5hdHRyKCdjbGFzcycpIHx8ICcnLFxyXG4gICAgICAgICAgICAgICAgdGl0bGUgPSBzcHJpbnRmKCd0aXRsZT1cIiVzXCInLCAkZWxtLmF0dHIoJ3RpdGxlJykpLFxyXG4gICAgICAgICAgICAgICAgbXVsdGlwbGUgPSB0aGlzLm9wdGlvbnMubXVsdGlwbGUgPyAnbXVsdGlwbGUnIDogJycsXHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZCxcclxuICAgICAgICAgICAgICAgIHR5cGUgPSB0aGlzLm9wdGlvbnMuc2luZ2xlID8gJ3JhZGlvJyA6ICdjaGVja2JveCc7XHJcblxyXG4gICAgICAgICAgICBpZiAoJGVsbS5pcygnb3B0aW9uJykpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9ICRlbG0udmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRoYXQub3B0aW9ucy50ZXh0VGVtcGxhdGUoJGVsbSksXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSAkZWxtLnByb3AoJ3NlbGVjdGVkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUgPSBzcHJpbnRmKCdzdHlsZT1cIiVzXCInLCB0aGlzLm9wdGlvbnMuc3R5bGVyKHZhbHVlKSksXHJcbiAgICAgICAgICAgICAgICAgICAgJGVsO1xyXG5cclxuICAgICAgICAgICAgICAgIGRpc2FibGVkID0gZ3JvdXBEaXNhYmxlZCB8fCAkZWxtLnByb3AoJ2Rpc2FibGVkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgJGVsID0gJChbXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGxpIGNsYXNzPVwiJXMgJXNcIiAlcyAlcz4nLCBtdWx0aXBsZSwgY2xhc3NlcywgdGl0bGUsIHN0eWxlKSxcclxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8bGFiZWwgY2xhc3M9XCIlc1wiPicsIGRpc2FibGVkID8gJ2Rpc2FibGVkJyA6ICcnKSxcclxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8aW5wdXQgdHlwZT1cIiVzXCIgJXMlcyVzJXM+JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSwgdGhpcy5zZWxlY3RJdGVtTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQgPyAnIGNoZWNrZWQ9XCJjaGVja2VkXCInIDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkID8gJyBkaXNhYmxlZD1cImRpc2FibGVkXCInIDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwcmludGYoJyBkYXRhLWdyb3VwPVwiJXNcIicsIGdyb3VwKSksXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPHNwYW4+JXM8L3NwYW4+JywgdGV4dCksXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvbGFiZWw+JyxcclxuICAgICAgICAgICAgICAgICAgICAnPC9saT4nXHJcbiAgICAgICAgICAgICAgICBdLmpvaW4oJycpKTtcclxuICAgICAgICAgICAgICAgICRlbC5maW5kKCdpbnB1dCcpLnZhbCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkZWxtLmlzKCdvcHRncm91cCcpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSB0aGF0Lm9wdGlvbnMubGFiZWxUZW1wbGF0ZSgkZWxtKSxcclxuICAgICAgICAgICAgICAgICAgICAkZ3JvdXAgPSAkKCc8ZGl2Lz4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBncm91cCA9ICdncm91cF8nICsgaTtcclxuICAgICAgICAgICAgICAgIGRpc2FibGVkID0gJGVsbS5wcm9wKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICRncm91cC5hcHBlbmQoW1xyXG4gICAgICAgICAgICAgICAgICAgICc8bGkgY2xhc3M9XCJncm91cFwiPicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGxhYmVsIGNsYXNzPVwib3B0Z3JvdXAgJXNcIiBkYXRhLWdyb3VwPVwiJXNcIj4nLCBkaXNhYmxlZCA/ICdkaXNhYmxlZCcgOiAnJywgZ3JvdXApLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5oaWRlT3B0Z3JvdXBDaGVja2JveGVzIHx8IHRoaXMub3B0aW9ucy5zaW5nbGUgPyAnJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAlcyAlcz4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdEdyb3VwTmFtZSwgZGlzYWJsZWQgPyAnZGlzYWJsZWQ9XCJkaXNhYmxlZFwiJyA6ICcnKSxcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbCxcclxuICAgICAgICAgICAgICAgICAgICAnPC9sYWJlbD4nLFxyXG4gICAgICAgICAgICAgICAgICAgICc8L2xpPidcclxuICAgICAgICAgICAgICAgIF0uam9pbignJykpO1xyXG5cclxuICAgICAgICAgICAgICAgICQuZWFjaCgkZWxtLmNoaWxkcmVuKCksIGZ1bmN0aW9uIChpLCBlbG0pIHtcclxuICAgICAgICAgICAgICAgICAgICAkZ3JvdXAuYXBwZW5kKHRoYXQub3B0aW9uVG9IdG1sKGksIGVsbSwgZ3JvdXAsIGRpc2FibGVkKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkZ3JvdXAuaHRtbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHRvZ2dsZU9wZW4gPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0W3RoYXQub3B0aW9ucy5pc09wZW4gPyAnY2xvc2UnIDogJ29wZW4nXSgpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLiRsYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kbGFiZWwub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICdsYWJlbCcgfHwgZS50YXJnZXQgIT09IHRoaXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0b2dnbGVPcGVuKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhhdC5vcHRpb25zLmZpbHRlciB8fCAhdGhhdC5vcHRpb25zLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7IC8vIENhdXNlcyBsb3N0IGZvY3VzIG90aGVyd2lzZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgdG9nZ2xlT3BlbilcclxuICAgICAgICAgICAgICAgIC5vZmYoJ2ZvY3VzJykub24oJ2ZvY3VzJywgdGhpcy5vcHRpb25zLm9uRm9jdXMpXHJcbiAgICAgICAgICAgICAgICAub2ZmKCdibHVyJykub24oJ2JsdXInLCB0aGlzLm9wdGlvbnMub25CbHVyKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHBhcmVudC5vZmYoJ2tleWRvd24nKS5vbigna2V5ZG93bicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDI3OiAvLyBlc2Mga2V5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC4kY2hvaWNlLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHNlYXJjaElucHV0Lm9mZigna2V5ZG93bicpLm9uKCdrZXlkb3duJyxmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIHNoaWZ0LXRhYiBjYXVzZXMgbG9zdCBmb2N1cyBmcm9tIGZpbHRlciBhcyB3aXRoIGNsaWNraW5nIGF3YXlcclxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDkgJiYgZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkub2ZmKCdrZXl1cCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBlbnRlciBvciBzcGFjZVxyXG4gICAgICAgICAgICAgICAgLy8gQXZvaWQgc2VsZWN0aW5nL2Rlc2VsZWN0aW5nIGlmIG5vIGNob2ljZXMgbWFkZVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5maWx0ZXJBY2NlcHRPbkVudGVyICYmIChlLndoaWNoID09PSAxMyB8fCBlLndoaWNoID09IDMyKSAmJiB0aGF0LiRzZWFyY2hJbnB1dC52YWwoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEFsbC5jbGljaygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhhdC5maWx0ZXIoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjaGVja2VkID0gJCh0aGlzKS5wcm9wKCdjaGVja2VkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zID0gdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICgkaXRlbXMubGVuZ3RoID09PSB0aGF0LiRzZWxlY3RJdGVtcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0W2NoZWNrZWQgPyAnY2hlY2tBbGwnIDogJ3VuY2hlY2tBbGwnXSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gd2hlbiB0aGUgZmlsdGVyIG9wdGlvbiBpcyB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC4kc2VsZWN0R3JvdXBzLnByb3AoJ2NoZWNrZWQnLCBjaGVja2VkKTtcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMucHJvcCgnY2hlY2tlZCcsIGNoZWNrZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQub3B0aW9uc1tjaGVja2VkID8gJ29uQ2hlY2tBbGwnIDogJ29uVW5jaGVja0FsbCddKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gJCh0aGlzKS5wYXJlbnQoKS5hdHRyKCdkYXRhLWdyb3VwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zID0gdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9ICRpdGVtcy5maWx0ZXIoc3ByaW50ZignW2RhdGEtZ3JvdXA9XCIlc1wiXScsIGdyb3VwKSksXHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZCA9ICRjaGlsZHJlbi5sZW5ndGggIT09ICRjaGlsZHJlbi5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgICRjaGlsZHJlbi5wcm9wKCdjaGVja2VkJywgY2hlY2tlZCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZVNlbGVjdEFsbCgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQub3B0aW9ucy5vbk9wdGdyb3VwQ2xpY2soe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAkKHRoaXMpLnBhcmVudCgpLnRleHQoKSxcclxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiBjaGVja2VkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiAkY2hpbGRyZW4uZ2V0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2U6IHRoYXRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlU2VsZWN0QWxsKCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGVPcHRHcm91cFNlbGVjdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uQ2xpY2soe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAkKHRoaXMpLnBhcmVudCgpLnRleHQoKSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJCh0aGlzKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiAkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSxcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZTogdGhhdFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5zaW5nbGUgJiYgdGhhdC5vcHRpb25zLmlzT3BlbiAmJiAhdGhhdC5vcHRpb25zLmtlZXBPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuc2luZ2xlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsaWNrZWRWYWwgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQodGhpcykudmFsKCkgIT09IGNsaWNrZWRWYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9wZW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuJGNob2ljZS5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc09wZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuZmluZCgnPmRpdicpLmFkZENsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3BbdGhpcy5hbmltYXRlTWV0aG9kKCdzaG93JyldKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBmaXggZmlsdGVyIGJ1Zzogbm8gcmVzdWx0cyBzaG93XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuJG5vUmVzdWx0cy5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBGaXggIzc3OiAnQWxsIHNlbGVjdGVkJyB3aGVuIG5vIG9wdGlvbnNcclxuICAgICAgICAgICAgaWYgKCF0aGlzLiRlbC5jaGlsZHJlbigpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJG5vUmVzdWx0cy5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy4kZHJvcC5vZmZzZXQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRyb3AuYXBwZW5kVG8oJCh0aGlzLm9wdGlvbnMuY29udGFpbmVyKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkcm9wLm9mZnNldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBvZmZzZXQudG9wLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IG9mZnNldC5sZWZ0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5maWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlYXJjaElucHV0LnZhbCgnJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWFyY2hJbnB1dC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maWx0ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25PcGVuKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuZmluZCgnPmRpdicpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3BbdGhpcy5hbmltYXRlTWV0aG9kKCdoaWRlJyldKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRwYXJlbnQuYXBwZW5kKHRoaXMuJGRyb3ApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICd0b3AnOiAnYXV0bycsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2xlZnQnOiAnYXV0bydcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYW5pbWF0ZU1ldGhvZDogZnVuY3Rpb24gKG1ldGhvZCkge1xyXG4gICAgICAgICAgICB2YXIgbWV0aG9kcyA9IHtcclxuICAgICAgICAgICAgICAgIHNob3c6IHtcclxuICAgICAgICAgICAgICAgICAgICBmYWRlOiAnZmFkZUluJyxcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZTogJ3NsaWRlRG93bidcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBoaWRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFkZTogJ2ZhZGVPdXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlOiAnc2xpZGVVcCdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzW21ldGhvZF1bdGhpcy5vcHRpb25zLmFuaW1hdGVdIHx8IG1ldGhvZDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChpc0luaXQpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdHMgPSB0aGlzLm9wdGlvbnMuZGlzcGxheVZhbHVlcyA/IHRoaXMuZ2V0U2VsZWN0cygpIDogdGhpcy5nZXRTZWxlY3RzKCd0ZXh0JyksXHJcbiAgICAgICAgICAgICAgICAkc3BhbiA9IHRoaXMuJGNob2ljZS5maW5kKCc+c3BhbicpLFxyXG4gICAgICAgICAgICAgICAgc2wgPSBzZWxlY3RzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGlmIChzbCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgJHNwYW4uYWRkQ2xhc3MoJ3BsYWNlaG9sZGVyJykuaHRtbCh0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5hbGxTZWxlY3RlZCAmJiBzbCA9PT0gdGhpcy4kc2VsZWN0SXRlbXMubGVuZ3RoICsgdGhpcy4kZGlzYWJsZUl0ZW1zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgJHNwYW4ucmVtb3ZlQ2xhc3MoJ3BsYWNlaG9sZGVyJykuaHRtbCh0aGlzLm9wdGlvbnMuYWxsU2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5lbGxpcHNpcyAmJiBzbCA+IHRoaXMub3B0aW9ucy5taW5pbXVtQ291bnRTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgJHNwYW4ucmVtb3ZlQ2xhc3MoJ3BsYWNlaG9sZGVyJykudGV4dChzZWxlY3RzLnNsaWNlKDAsIHRoaXMub3B0aW9ucy5taW5pbXVtQ291bnRTZWxlY3RlZClcclxuICAgICAgICAgICAgICAgICAgICAuam9pbih0aGlzLm9wdGlvbnMuZGVsaW1pdGVyKSArICcuLi4nKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuY291bnRTZWxlY3RlZCAmJiBzbCA+IHRoaXMub3B0aW9ucy5taW5pbXVtQ291bnRTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgJHNwYW4ucmVtb3ZlQ2xhc3MoJ3BsYWNlaG9sZGVyJykuaHRtbCh0aGlzLm9wdGlvbnMuY291bnRTZWxlY3RlZFxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCcjJywgc2VsZWN0cy5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJyUnLCB0aGlzLiRzZWxlY3RJdGVtcy5sZW5ndGggKyB0aGlzLiRkaXNhYmxlSXRlbXMubGVuZ3RoKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkc3Bhbi5yZW1vdmVDbGFzcygncGxhY2Vob2xkZXInKS50ZXh0KHNlbGVjdHMuam9pbih0aGlzLm9wdGlvbnMuZGVsaW1pdGVyKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWRkVGl0bGUpIHtcclxuICAgICAgICAgICAgICAgICRzcGFuLnByb3AoJ3RpdGxlJywgdGhpcy5nZXRTZWxlY3RzKCd0ZXh0JykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBzZXQgc2VsZWN0cyB0byBzZWxlY3RcclxuICAgICAgICAgICAgdGhpcy4kZWwudmFsKHRoaXMuZ2V0U2VsZWN0cygpKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBzZWxlY3RlZCBjbGFzcyB0byBzZWxlY3RlZCBsaVxyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuZmluZCgnaW5wdXQ6Y2hlY2tlZCcpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCdsaScpLmZpcnN0KCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gdHJpZ2dlciA8c2VsZWN0PiBjaGFuZ2UgZXZlbnRcclxuICAgICAgICAgICAgaWYgKCFpc0luaXQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGVsLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdXBkYXRlU2VsZWN0QWxsOiBmdW5jdGlvbiAoaXNJbml0KSB7XHJcbiAgICAgICAgICAgIHZhciAkaXRlbXMgPSB0aGlzLiRzZWxlY3RJdGVtcztcclxuXHJcbiAgICAgICAgICAgIGlmICghaXNJbml0KSB7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMgPSAkaXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgJGl0ZW1zLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmxlbmd0aCA9PT0gJGl0ZW1zLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICBpZiAoIWlzSW5pdCAmJiB0aGlzLiRzZWxlY3RBbGwucHJvcCgnY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMub25DaGVja0FsbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdXBkYXRlT3B0R3JvdXBTZWxlY3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICRpdGVtcyA9IHRoaXMuJHNlbGVjdEl0ZW1zLmZpbHRlcignOnZpc2libGUnKTtcclxuICAgICAgICAgICAgJC5lYWNoKHRoaXMuJHNlbGVjdEdyb3VwcywgZnVuY3Rpb24gKGksIHZhbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gJCh2YWwpLnBhcmVudCgpLmF0dHIoJ2RhdGEtZ3JvdXAnKSxcclxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4gPSAkaXRlbXMuZmlsdGVyKHNwcmludGYoJ1tkYXRhLWdyb3VwPVwiJXNcIl0nLCBncm91cCkpO1xyXG4gICAgICAgICAgICAgICAgJCh2YWwpLnByb3AoJ2NoZWNrZWQnLCAkY2hpbGRyZW4ubGVuZ3RoICYmXHJcbiAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuLmxlbmd0aCA9PT0gJGNoaWxkcmVuLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvL3ZhbHVlIG9yIHRleHQsIGRlZmF1bHQ6ICd2YWx1ZSdcclxuICAgICAgICBnZXRTZWxlY3RzOiBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB0ZXh0cyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuZmluZChzcHJpbnRmKCdpbnB1dFslc106Y2hlY2tlZCcsIHRoaXMuc2VsZWN0SXRlbU5hbWUpKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRleHRzLnB1c2goJCh0aGlzKS5wYXJlbnRzKCdsaScpLmZpcnN0KCkudGV4dCgpKTtcclxuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKCQodGhpcykudmFsKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAndGV4dCcgJiYgdGhpcy4kc2VsZWN0R3JvdXBzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gJC50cmltKCQodGhpcykucGFyZW50KCkudGV4dCgpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXAgPSAkKHRoaXMpLnBhcmVudCgpLmRhdGEoJ2dyb3VwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9IHRoYXQuJGRyb3AuZmluZChzcHJpbnRmKCdbJXNdW2RhdGEtZ3JvdXA9XCIlc1wiXScsIHRoYXQuc2VsZWN0SXRlbU5hbWUsIGdyb3VwKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzZWxlY3RlZCA9ICRjaGlsZHJlbi5maWx0ZXIoJzpjaGVja2VkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghJHNlbGVjdGVkLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2goJ1snKTtcclxuICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2godGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRjaGlsZHJlbi5sZW5ndGggPiAkc2VsZWN0ZWQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzZWxlY3RlZC5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaCgkKHRoaXMpLnBhcmVudCgpLnRleHQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2goJzogJyArIGxpc3Quam9pbignLCAnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaCgnXScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHRzLnB1c2goaHRtbC5qb2luKCcnKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHlwZSA9PT0gJ3RleHQnID8gdGV4dHMgOiB2YWx1ZXM7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2V0U2VsZWN0czogZnVuY3Rpb24gKHZhbHVlcykge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcy5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAkLmVhY2godmFsdWVzLCBmdW5jdGlvbiAoaSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcihzcHJpbnRmKCdbdmFsdWU9XCIlc1wiXScsIHZhbHVlKSkucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC4kZGlzYWJsZUl0ZW1zLmZpbHRlcihzcHJpbnRmKCdbdmFsdWU9XCIlc1wiXScsIHZhbHVlKSkucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnLCB0aGlzLiRzZWxlY3RJdGVtcy5sZW5ndGggPT09XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoICsgdGhpcy4kZGlzYWJsZUl0ZW1zLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuJHNlbGVjdEdyb3VwcywgZnVuY3Rpb24gKGksIHZhbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gJCh2YWwpLnBhcmVudCgpLmF0dHIoJ2RhdGEtZ3JvdXAnKSxcclxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4gPSB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoJ1tkYXRhLWdyb3VwPVwiJyArIGdyb3VwICsgJ1wiXScpO1xyXG4gICAgICAgICAgICAgICAgJCh2YWwpLnByb3AoJ2NoZWNrZWQnLCAkY2hpbGRyZW4ubGVuZ3RoICYmXHJcbiAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuLmxlbmd0aCA9PT0gJGNoaWxkcmVuLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjaGVja0FsbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNoZWNrQWxsKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdW5jaGVja0FsbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vblVuY2hlY2tBbGwoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBmb2N1czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuZm9jdXMoKTtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uRm9jdXMoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBibHVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5ibHVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkJsdXIoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICByZWZyZXNoOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIH0sXHJcblx0XHRcclxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy4kcGFyZW50LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5kYXRhKCdtdWx0aXBsZVNlbGVjdCcsIG51bGwpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGZpbHRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB0ZXh0ID0gJC50cmltKHRoaXMuJHNlYXJjaElucHV0LnZhbCgpKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRleHQubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMucGFyZW50KCkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzYWJsZUl0ZW1zLnBhcmVudCgpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5wYXJlbnQoKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRwYXJlbnRbcmVtb3ZlRGlhY3JpdGljcygkcGFyZW50LnRleHQoKS50b0xvd2VyQ2FzZSgpKS5pbmRleE9mKHJlbW92ZURpYWNyaXRpY3ModGV4dCkpIDwgMCA/ICdoaWRlJyA6ICdzaG93J10oKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzYWJsZUl0ZW1zLnBhcmVudCgpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gJHBhcmVudC5hdHRyKCdkYXRhLWdyb3VwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcyA9IHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcignOnZpc2libGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAkcGFyZW50WyRpdGVtcy5maWx0ZXIoc3ByaW50ZignW2RhdGEtZ3JvdXA9XCIlc1wiXScsIGdyb3VwKSkubGVuZ3RoID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9DaGVjayBpZiBubyBtYXRjaGVzIGZvdW5kXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kc2VsZWN0SXRlbXMucGFyZW50KCkuZmlsdGVyKCc6dmlzaWJsZScpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlT3B0R3JvdXBTZWxlY3QoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTZWxlY3RBbGwoKTtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uRmlsdGVyKHRleHQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgJC5mbi5tdWx0aXBsZVNlbGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3B0aW9uID0gYXJndW1lbnRzWzBdLFxyXG4gICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzLFxyXG5cclxuICAgICAgICAgICAgdmFsdWUsXHJcbiAgICAgICAgICAgIGFsbG93ZWRNZXRob2RzID0gW1xyXG4gICAgICAgICAgICAgICAgJ2dldFNlbGVjdHMnLCAnc2V0U2VsZWN0cycsXHJcbiAgICAgICAgICAgICAgICAnZW5hYmxlJywgJ2Rpc2FibGUnLFxyXG4gICAgICAgICAgICAgICAgJ29wZW4nLCAnY2xvc2UnLFxyXG4gICAgICAgICAgICAgICAgJ2NoZWNrQWxsJywgJ3VuY2hlY2tBbGwnLFxyXG4gICAgICAgICAgICAgICAgJ2ZvY3VzJywgJ2JsdXInLFxyXG4gICAgICAgICAgICAgICAgJ3JlZnJlc2gnLCAnZGVzdHJveSdcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSAkdGhpcy5kYXRhKCdtdWx0aXBsZVNlbGVjdCcpLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCAkLmZuLm11bHRpcGxlU2VsZWN0LmRlZmF1bHRzLFxyXG4gICAgICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PT0gJ29iamVjdCcgJiYgb3B0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IG5ldyBNdWx0aXBsZVNlbGVjdCgkdGhpcywgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKCdtdWx0aXBsZVNlbGVjdCcsIGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkLmluQXJyYXkob3B0aW9uLCBhbGxvd2VkTWV0aG9kcykgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ1Vua25vd24gbWV0aG9kOiAnICsgb3B0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhW29wdGlvbl0oYXJnc1sxXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLmluaXQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChhcmdzWzFdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhW2FyZ3NbMV1dLmFwcGx5KGRhdGEsIFtdLnNsaWNlLmNhbGwoYXJncywgMikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnID8gdmFsdWUgOiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAkLmZuLm11bHRpcGxlU2VsZWN0LmRlZmF1bHRzID0ge1xyXG4gICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgIGlzT3BlbjogZmFsc2UsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICcnLFxyXG4gICAgICAgIHNlbGVjdEFsbDogdHJ1ZSxcclxuICAgICAgICBzZWxlY3RBbGxEZWxpbWl0ZXI6IFsnWycsICddJ10sXHJcbiAgICAgICAgbWluaW11bUNvdW50U2VsZWN0ZWQ6IDMsXHJcbiAgICAgICAgZWxsaXBzaXM6IGZhbHNlLFxyXG4gICAgICAgIG11bHRpcGxlOiBmYWxzZSxcclxuICAgICAgICBtdWx0aXBsZVdpZHRoOiA4MCxcclxuICAgICAgICBzaW5nbGU6IGZhbHNlLFxyXG4gICAgICAgIGZpbHRlcjogZmFsc2UsXHJcbiAgICAgICAgd2lkdGg6IHVuZGVmaW5lZCxcclxuICAgICAgICBkcm9wV2lkdGg6IHVuZGVmaW5lZCxcclxuICAgICAgICBtYXhIZWlnaHQ6IDI1MCxcclxuICAgICAgICBjb250YWluZXI6IG51bGwsXHJcbiAgICAgICAgcG9zaXRpb246ICdib3R0b20nLFxyXG4gICAgICAgIGtlZXBPcGVuOiBmYWxzZSxcclxuICAgICAgICBhbmltYXRlOiAnbm9uZScsIC8vICdub25lJywgJ2ZhZGUnLCAnc2xpZGUnXHJcbiAgICAgICAgZGlzcGxheVZhbHVlczogZmFsc2UsXHJcbiAgICAgICAgZGVsaW1pdGVyOiAnLCAnLFxyXG4gICAgICAgIGFkZFRpdGxlOiBmYWxzZSxcclxuICAgICAgICBmaWx0ZXJBY2NlcHRPbkVudGVyOiBmYWxzZSxcclxuICAgICAgICBoaWRlT3B0Z3JvdXBDaGVja2JveGVzOiBmYWxzZSxcclxuXHJcbiAgICAgICAgc2VsZWN0QWxsVGV4dDogJ1NlbGVjdCBhbGwnLFxyXG4gICAgICAgIGFsbFNlbGVjdGVkOiAnQWxsIHNlbGVjdGVkJyxcclxuICAgICAgICBjb3VudFNlbGVjdGVkOiAnIyBvZiAlIHNlbGVjdGVkJyxcclxuICAgICAgICBub01hdGNoZXNGb3VuZDogJ05vIG1hdGNoZXMgZm91bmQnLFxyXG5cclxuICAgICAgICBzdHlsZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGV4dFRlbXBsYXRlOiBmdW5jdGlvbiAoJGVsbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGVsbS5odG1sKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsYWJlbFRlbXBsYXRlOiBmdW5jdGlvbiAoJGVsbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGVsbS5hdHRyKCdsYWJlbCcpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uT3BlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uQ2hlY2tBbGw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25VbmNoZWNrQWxsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uT3B0Z3JvdXBDbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRmlsdGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAkKCdzZWxlY3RbbXVsdGlwbGVdJykubXVsdGlwbGVTZWxlY3QoKTtcclxufSkoalF1ZXJ5KTtcclxuIl19
