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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxhbmd1YWdlLmpzIiwibGFuZy5qcyIsImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsImpxdWVyeS11aS5taW4uanMiLCJ0b29sdGlwLmpzIiwiYWNjb3VudF9ub3RpZmljYXRpb24uanMiLCJzbGlkZXIuanMiLCJoZWFkZXJfbWVudV9hbmRfc2VhcmNoLmpzIiwiY2FsYy1jYXNoYmFjay5qcyIsImF1dG9faGlkZV9jb250cm9sLmpzIiwiaGlkZV9zaG93X2FsbC5qcyIsImNsb2NrLmpzIiwibGlzdF90eXBlX3N3aXRjaGVyLmpzIiwic2VsZWN0LmpzIiwic2VhcmNoLmpzIiwiZ290by5qcyIsImFjY291bnQtd2l0aGRyYXcuanMiLCJhamF4LmpzIiwiZG9icm8uanMiLCJsZWZ0LW1lbnUtdG9nZ2xlLmpzIiwic2hhcmU0Mi5qcyIsInVzZXJfcmV2aWV3cy5qcyIsInBsYWNlaG9sZGVyLmpzIiwiYWpheC1sb2FkLmpzIiwiYmFubmVyLmpzIiwiY291bnRyeV9zZWxlY3QuanMiLCJwcm9kdWN0X2ZpbHRlci5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsIm1vZGFscy5qcyIsImZvb3Rlcl9tZW51LmpzIiwicmF0aW5nLmpzIiwiZmF2b3JpdGVzLmpzIiwic2Nyb2xsX3RvLmpzIiwiY29weV90b19jbGlwYm9hcmQuanMiLCJpbWcuanMiLCJwYXJlbnRzX29wZW5fd2luZG93cy5qcyIsImZvcm1zLmpzIiwiY29va2llLmpzIiwidGFibGUuanMiLCJhamF4X3JlbW92ZS5qcyIsImZpeGVzLmpzIiwibGlua3MuanMiLCJzdG9yZV9wb2ludHMuanMiLCJoYXNodGFncy5qcyIsInBsdWdpbnMuanMiLCJtdWx0aXBsZS1zZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JnQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgbGcgPSAoZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGxhbmc9e307XHJcbiAgdXJsPScvbGFuZ3VhZ2UvJytkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZysnLmpzb24nO1xyXG4gICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgLy9jb25zb2xlLmxvZyhkYXRhKTtcclxuICAgIGZvcih2YXIgaW5kZXggaW4gZGF0YSkge1xyXG4gICAgICBkYXRhW2luZGV4XT1jbGVhclZhcihkYXRhW2luZGV4XSk7XHJcbiAgICB9XHJcbiAgICBsYW5nPWRhdGE7XHJcbiAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJsYW5ndWFnZV9sb2FkZWRcIik7XHJcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgIC8vY29uc29sZS5sb2coZGF0YSwgZXZlbnQpO1xyXG4gIH0sJ2pzb24nKTtcclxuXHJcbiAgZnVuY3Rpb24gY2xlYXJWYXIodHh0KXtcclxuICAgIHR4dD10eHQucmVwbGFjZSgvXFxzKy9nLFwiIFwiKTsvL9GD0LTQsNC70LXQvdC40LUg0LfQsNC00LLQvtC10L3QuNC1INC/0YDQvtCx0LXQu9C+0LJcclxuXHJcbiAgICAvL9Cn0LjRgdGC0LjQvCDQv9C+0LTRgdGC0LDQstC70Y/QtdC80YvQtSDQv9C10YDQtdC80LXQvdC90YvQtVxyXG4gICAgc3RyPXR4dC5tYXRjaCgvXFx7KC4qPylcXH0vZyk7XHJcbiAgICBpZiAoIHN0ciAhPSBudWxsKSB7XHJcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIHN0cl90PXN0cltpXS5yZXBsYWNlKC8gL2csXCJcIik7XHJcbiAgICAgICAgdHh0PXR4dC5yZXBsYWNlKHN0cltpXSxzdHJfdCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0eHQ7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZnVuY3Rpb24odHBsLCBkYXRhKXtcclxuICAgIGlmKHR5cGVvZihsYW5nW3RwbF0pPT1cInVuZGVmaW5lZFwiKXtcclxuICAgICAgY29uc29sZS5sb2coXCJsYW5nIG5vdCBmb3VuZDogXCIrdHBsKTtcclxuICAgICAgcmV0dXJuIHRwbDtcclxuICAgIH1cclxuICAgIHRwbD1sYW5nW3RwbF07XHJcbiAgICBpZih0eXBlb2YoZGF0YSk9PVwib2JqZWN0XCIpe1xyXG4gICAgICBmb3IodmFyIGluZGV4IGluIGRhdGEpIHtcclxuICAgICAgICB0cGw9dHBsLnNwbGl0KFwie1wiK2luZGV4K1wifVwiKS5qb2luKGRhdGFbaW5kZXhdKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRwbDtcclxuICB9XHJcbn0pKCk7IiwidmFyIGxhbmcgPSAoZnVuY3Rpb24oKXtcclxuICAgIHZhciBjb2RlID0gJyc7XHJcbiAgICB2YXIga2V5ID0gJyc7XHJcbiAgICB2YXIgaHJlZl9wcmVmaXggPSAnJztcclxuXHJcbiAgICB2YXIgbGFuZ2xpc3QgPSAkKFwiI3NkX2xhbmdfbGlzdFwiKS5kYXRhKCdqc29uJyk7XHJcbiAgICB2YXIgbG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XHJcblxyXG4gICAgaWYgKGxhbmdsaXN0KSB7XHJcbiAgICAgICAgdmFyIGxhbmdLZXkgPSAobG9jYXRpb24ubGVuZ3RoID09PSAzIHx8IGxvY2F0aW9uLnN1YnN0cigzLDEpID09PSAnLycpID8gbG9jYXRpb24uc3Vic3RyKDEsMikgOiAnJztcclxuICAgICAgICBpZiAobGFuZ0tleSAmJiBsYW5nbGlzdFtsYW5nS2V5XSkge1xyXG4gICAgICAgICAgICBjb2RlID0gbGFuZ2xpc3RbbGFuZ0tleV07XHJcbiAgICAgICAgICAgIGtleSA9IGxhbmdLZXk7XHJcbiAgICAgICAgICAgIGhyZWZfcHJlZml4ID0ga2V5ID09PSAncnUnID8gJycgOiBrZXkrJy8nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGtleSA9ICdydSc7XHJcbiAgICAgICAgICAgIGNvZGUgPSBsYW5nbGlzdFtrZXldID8gbGFuZ2xpc3Rba2V5XSA6ICcnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICBocmVmX3ByZWZpeDogaHJlZl9wcmVmaXhcclxuICAgIH1cclxufSkoKTtcclxuIiwib2JqZWN0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgdmFyIGMgPSBiLFxyXG4gICAga2V5O1xyXG4gIGZvciAoa2V5IGluIGEpIHtcclxuICAgIGlmIChhLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBjO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gbG9naW5fcmVkaXJlY3QobmV3X2hyZWYpIHtcclxuICBocmVmID0gbG9jYXRpb24uaHJlZjtcclxuICBpZiAoaHJlZi5pbmRleE9mKCdzdG9yZScpID4gMCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpID4gMCB8fCBocmVmLmluZGV4T2YoJ3VybCgnKSA+IDApIHtcclxuICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsb2NhdGlvbi5ocmVmID0gbmV3X2hyZWY7XHJcbiAgfVxyXG59XHJcbiIsIihmdW5jdGlvbiAodywgZCwgJCkge1xyXG4gIHZhciBzbGlkZV9pbnRlcnZhbD00MDAwO1xyXG4gIHZhciBzY3JvbGxzX2Jsb2NrID0gJCgnLnNjcm9sbF9ib3gnKTtcclxuXHJcbiAgaWYgKHNjcm9sbHNfYmxvY2subGVuZ3RoID09IDApIHJldHVybjtcclxuICAvLyQoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKS53cmFwQWxsKHNjcm9sbHNfYmxvY2spO1xyXG4gICQoc2Nyb2xsc19ibG9jaykud3JhcCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpO1xyXG5cclxuICBpbml0X3Njcm9sbCgpO1xyXG4gIGNhbGNfc2Nyb2xsKCk7XHJcblxyXG4gICQod2luZG93ICkub24oXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgY2FsY19zY3JvbGwoKTtcclxuICB9KTtcclxuICB2YXIgdDEsIHQyO1xyXG5cclxuICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uICgpIHtcclxuICAgIGNsZWFyVGltZW91dCh0MSk7XHJcbiAgICBjbGVhclRpbWVvdXQodDIpO1xyXG4gICAgdDEgPSBzZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLCAzMDApO1xyXG4gICAgdDIgPSBzZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLCA4MDApO1xyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBpbml0X3Njcm9sbCgpIHtcclxuICAgIHZhciBjb250cm9sID0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xcIj48L2Rpdj4nO1xyXG4gICAgY29udHJvbCA9ICQoY29udHJvbCk7XHJcbiAgICBjb250cm9sLmluc2VydEFmdGVyKHNjcm9sbHNfYmxvY2spO1xyXG4gICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTtcclxuXHJcbiAgICBzY3JvbGxzX2Jsb2NrLnByZXBlbmQoJzxkaXYgY2xhc3M9c2Nyb2xsX2JveC1tb3Zlcj48L2Rpdj4nKTtcclxuXHJcbiAgICBjb250cm9sLm9uKCdjbGljaycsICcuc2Nyb2xsX2JveC1jb250cm9sX3BvaW50JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICB2YXIgY29udHJvbCA9ICR0aGlzLnBhcmVudCgpO1xyXG4gICAgICB2YXIgaSA9ICR0aGlzLmluZGV4KCk7XHJcbiAgICAgIGlmICgkdGhpcy5oYXNDbGFzcygnYWN0aXZlJykpcmV0dXJuO1xyXG4gICAgICBjb250cm9sLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICR0aGlzLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgIHZhciBkeCA9IGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnKTtcclxuICAgICAgdmFyIGVsID0gY29udHJvbC5wcmV2KCk7XHJcbiAgICAgIGVsLmZpbmQoJy5zY3JvbGxfYm94LW1vdmVyJykuY3NzKCdtYXJnaW4tbGVmdCcsIC1keCAqIGkpO1xyXG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGkpO1xyXG5cclxuICAgICAgc3RvcFNjcm9sLmJpbmQoZWwpKCk7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIgaiA9IDA7IGogPCBzY3JvbGxzX2Jsb2NrLmxlbmd0aDsgaisrKSB7XHJcbiAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGopO1xyXG4gICAgZWwucGFyZW50KCkuaG92ZXIoc3RvcFNjcm9sLmJpbmQoZWwpLCBzdGFydFNjcm9sLmJpbmQoZWwpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN0YXJ0U2Nyb2woKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpKXJldHVybjtcclxuXHJcbiAgICB2YXIgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLmJpbmQoJHRoaXMpLCBzbGlkZV9pbnRlcnZhbCk7XHJcbiAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLCB0aW1lb3V0SWQpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzdG9wU2Nyb2woKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHRpbWVvdXRJZCA9ICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpO1xyXG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJywgZmFsc2UpO1xyXG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpIHx8ICF0aW1lb3V0SWQpcmV0dXJuO1xyXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIGZhbHNlKTtcclxuICAgIGlmICghJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XHJcblxyXG4gICAgdmFyIGNvbnRyb2xzID0gJHRoaXMubmV4dCgpLmZpbmQoJz4qJyk7XHJcbiAgICB2YXIgYWN0aXZlID0gJHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJyk7XHJcbiAgICB2YXIgcG9pbnRfY250ID0gY29udHJvbHMubGVuZ3RoO1xyXG4gICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcclxuICAgIGFjdGl2ZSsrO1xyXG4gICAgaWYgKGFjdGl2ZSA+PSBwb2ludF9jbnQpYWN0aXZlID0gMDtcclxuICAgICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XHJcblxyXG4gICAgY29udHJvbHMuZXEoYWN0aXZlKS5jbGljaygpO1xyXG4gICAgc3RhcnRTY3JvbC5iaW5kKCR0aGlzKSgpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2FsY19zY3JvbGwoKSB7XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGkpO1xyXG4gICAgICB2YXIgY29udHJvbCA9IGVsLm5leHQoKTtcclxuICAgICAgdmFyIHdpZHRoX21heCA9IGVsLmRhdGEoJ3Njcm9sbC13aWR0aC1tYXgnKTtcclxuICAgICAgdyA9IGVsLndpZHRoKCk7XHJcblxyXG4gICAgICAvL9C00LXQu9Cw0LXQvCDQutC+0L3RgtGA0L7Qu9GMINC+0LPRgNCw0L3QuNGH0LXQvdC40Y8g0YjQuNGA0LjQvdGLLiDQldGB0LvQuCDQv9GA0LXQstGL0YjQtdC90L4g0YLQviDQvtGC0LrQu9GO0YfQsNC10Lwg0YHQutGA0L7QuyDQuCDQv9C10YDQtdGF0L7QtNC40Lwg0Log0YHQu9C10LTRg9GO0YnQtdC80YMg0Y3Qu9C10LzQtdC90YLRg1xyXG4gICAgICBpZiAod2lkdGhfbWF4ICYmIHcgPiB3aWR0aF9tYXgpIHtcclxuICAgICAgICBjb250cm9sLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XHJcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIG5vX2NsYXNzID0gZWwuZGF0YSgnc2Nyb2xsLWVsZW1ldC1pZ25vcmUtY2xhc3MnKTtcclxuICAgICAgdmFyIGNoaWxkcmVuID0gZWwuZmluZCgnPionKS5ub3QoJy5zY3JvbGxfYm94LW1vdmVyJyk7XHJcbiAgICAgIGlmIChub19jbGFzcykge1xyXG4gICAgICAgIGNoaWxkcmVuID0gY2hpbGRyZW4ubm90KCcuJyArIG5vX2NsYXNzKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvL9CV0YHQu9C4INC90LXRgiDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcclxuICAgICAgaWYgKGNoaWxkcmVuID09IDApIHtcclxuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBmX2VsID0gY2hpbGRyZW4uZXEoMSk7XHJcbiAgICAgIHZhciBjaGlsZHJlbl93ID0gZl9lbC5vdXRlcldpZHRoKCk7IC8v0LLRgdC10LPQviDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcclxuICAgICAgY2hpbGRyZW5fdyArPSBwYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tbGVmdCcpKTtcclxuICAgICAgY2hpbGRyZW5fdyArPSBwYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tcmlnaHQnKSk7XHJcblxyXG4gICAgICB2YXIgc2NyZWFuX2NvdW50ID0gTWF0aC5mbG9vcih3IC8gY2hpbGRyZW5fdyk7XHJcblxyXG4gICAgICAvL9CV0YHQu9C4INCy0YHQtSDQstC70LDQt9C40YIg0L3QsCDRjdC60YDQsNC9XHJcbiAgICAgIGlmIChjaGlsZHJlbiA8PSBzY3JlYW5fY291bnQpIHtcclxuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8v0KPQttC1INGC0L7Rh9C90L4g0LfQvdCw0LXQvCDRh9GC0L4g0YHQutGA0L7QuyDQvdGD0LbQtdC9XHJcbiAgICAgIGVsLmFkZENsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XHJcblxyXG4gICAgICB2YXIgcG9pbnRfY250ID0gY2hpbGRyZW4ubGVuZ3RoIC0gc2NyZWFuX2NvdW50ICsgMTtcclxuICAgICAgLy/QtdGB0LvQuCDQvdC1INC90LDQtNC+INC+0LHQvdC+0LLQu9GP0YLRjCDQutC+0L3RgtGA0L7QuyDRgtC+INCy0YvRhdC+0LTQuNC8LCDQvdC1INC30LDQsdGL0LLQsNGPINC+0LHQvdC+0LLQuNGC0Ywg0YjQuNGA0LjQvdGDINC00L7Rh9C10YDQvdC40YVcclxuICAgICAgaWYgKGNvbnRyb2wuZmluZCgnPionKS5sZW5ndGggPT0gcG9pbnRfY250KSB7XHJcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhY3RpdmUgPSBlbC5kYXRhKCdzbGlkZS1hY3RpdmUnKTtcclxuICAgICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcclxuICAgICAgaWYgKGFjdGl2ZSA+PSBwb2ludF9jbnQpYWN0aXZlID0gcG9pbnRfY250IC0gMTtcclxuICAgICAgdmFyIG91dCA9ICcnO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvaW50X2NudDsgaisrKSB7XHJcbiAgICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sX3BvaW50JyArIChqID09IGFjdGl2ZSA/ICcgYWN0aXZlJyA6ICcnKSArICdcIj48L2Rpdj4nO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnRyb2wuaHRtbChvdXQpO1xyXG5cclxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xyXG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWNvdW50JywgcG9pbnRfY250KTtcclxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xyXG5cclxuICAgICAgaWYgKCFlbC5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKSkge1xyXG4gICAgICAgIHN0YXJ0U2Nyb2wuYmluZChlbCkoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSh3aW5kb3csIGRvY3VtZW50LCBqUXVlcnkpKTtcclxuIiwidmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xyXG5cclxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcclxuXHJcblxyXG4gIGlmICgkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tdGl0bGUnKS5oYXNDbGFzcygnYWNjb3JkaW9uLXRpdGxlLWRpc2FibGVkJykpcmV0dXJuO1xyXG5cclxuICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAvKmlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKXtcclxuICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgfSovXHJcbiAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlVXAoMzAwKTtcclxuICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxyXG4gIH0gZWxzZSB7XHJcbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJykpIHtcclxuICAgICAgJG90aGVyID0gJCgnLmFjY29yZGlvbi1vbmx5X29uZScpO1xyXG4gICAgICAkb3RoZXIuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcclxuICAgICAgICAuc2xpZGVVcCgzMDApXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcclxuICAgICAgJG90aGVyLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnbGFzdC1vcGVuJyk7XHJcblxyXG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmFkZENsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcclxuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnbGFzdC1vcGVuJyk7XHJcbiAgICB9XHJcbiAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlRG93bigzMDApO1xyXG4gICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn0pO1xyXG5hY2NvcmRpb25Db250cm9sLnNob3coKTtcclxuXHJcblxyXG4kKCcuYWNjb3JkaW9uLXdyYXAub3Blbl9maXJzdCAuYWNjb3JkaW9uOmZpcnN0LWNoaWxkJykuYWRkQ2xhc3MoJ29wZW4nKTtcclxuJCgnLmFjY29yZGlvbi13cmFwIC5hY2NvcmRpb24uYWNjb3JkaW9uLXNsaW06Zmlyc3QtY2hpbGQnKS5hZGRDbGFzcygnb3BlbicpO1xyXG4kKCcuYWNjb3JkaW9uLXNsaW0nKS5hZGRDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJyk7XHJcblxyXG4vL9C00LvRjyDRgdC40LzQvtCyINC+0YLQutGA0YvQstCw0LXQvCDQtdGB0LvQuCDQtdGB0YLRjCDQv9C+0LzQtdGC0LrQsCBvcGVuINGC0L4g0L/RgNC40YHQstCw0LjQstCw0LXQvCDQstGB0LUg0L7RgdGC0LDQu9GM0L3Ri9C1INC60LvQsNGB0YtcclxuYWNjb3JkaW9uU2xpbSA9ICQoJy5hY2NvcmRpb24uYWNjb3JkaW9uLW9ubHlfb25lJyk7XHJcbmlmIChhY2NvcmRpb25TbGltLmxlbmd0aCA+IDApIHtcclxuICBhY2NvcmRpb25TbGltLnBhcmVudCgpLmZpbmQoJy5hY2NvcmRpb24ub3BlbicpXHJcbiAgICAuYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpXHJcbiAgICAuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcclxuICAgIC5zaG93KDMwMClcclxuICAgIC5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XHJcbn1cclxuXHJcbiQoJ2JvZHknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLmFjY29yZGlvbl9mdWxsc2NyZWFuX2Nsb3NlLm9wZW4gLmFjY29yZGlvbi1jb250cm9sOmZpcnN0LWNoaWxkJykuY2xpY2soKVxyXG59KTtcclxuXHJcbiQoJy5hY2NvcmRpb24tY29udGVudCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgIT0gJ0EnKSB7XHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb24nKS5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wuYWNjb3JkaW9uLXRpdGxlJykuY2xpY2soKTtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn0pO1xyXG5cclxuJCgnLmFjY29yZGlvbi1jb250ZW50IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2FuZ2xlLXVwJykpcmV0dXJuO1xyXG4gIGUuc3RvcFByb3BhZ2F0aW9uKClcclxufSk7XHJcblxyXG4oZnVuY3Rpb24oKXtcclxuICB2YXIgZWxzID0gJCgnLmFjY29yZGlvbl9tb3JlJyk7XHJcblxyXG4gIGZ1bmN0aW9uIGFkZEJ1dHRvbihlbCwgY2xhc3NOYW1lLCB0aXRsZSkge1xyXG4gICAgICB2YXIgYnV0dG9ucyA9ICQoZWwpLmZpbmQoJy4nK2NsYXNzTmFtZSk7XHJcbiAgICAgIGlmIChidXR0b25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgdmFyIGJ1dHRvbiA9ICQoJzxkaXY+JykuYWRkQ2xhc3MoY2xhc3NOYW1lKS5hZGRDbGFzcygnYWNjb3JkaW9uX21vcmVfYnV0dG9uJyk7XHJcbiAgICAgICAgICB2YXIgYSA9ICQoJzxhPicpLmF0dHIoJ2hyZWYnLCBcIlwiKS5hZGRDbGFzcygnYmx1ZScpLmh0bWwodGl0bGUpO1xyXG4gICAgICAgICAgJChidXR0b24pLmFwcGVuZChhKTtcclxuICAgICAgICAgICQoZWwpLmFwcGVuZChidXR0b24pO1xyXG4gICAgICB9XHJcbiAgfVxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFjY29yZGlvbl9tb3JlX2J1dHRvbl9tb3JlJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuYWNjb3JkaW9uX21vcmUnKS5hZGRDbGFzcygnb3BlbicpO1xyXG4gIH0pO1xyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFjY29yZGlvbl9tb3JlX2J1dHRvbl9sZXNzJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuYWNjb3JkaW9uX21vcmUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gIH0pO1xyXG5cclxuXHJcblxyXG4gIGZ1bmN0aW9uIHJlYnVpbGQoKXtcclxuICAgICQoZWxzKS5lYWNoKGZ1bmN0aW9uKGtleSwgaXRlbSl7XHJcbiAgICAgICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgdmFyIGNvbnRlbnQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5hY2NvcmRpb25fbW9yZV9jb250ZW50Jyk7XHJcbiAgICAgIGlmIChjb250ZW50LnNjcm9sbEhlaWdodCA+IGNvbnRlbnQuY2xpZW50SGVpZ2h0KSB7XHJcbiAgICAgICAgYWRkQnV0dG9uKGl0ZW0sICdhY2NvcmRpb25fbW9yZV9idXR0b25fbW9yZScsICfQn9C+0LTRgNC+0LHQvdC10LUnKTtcclxuICAgICAgICBhZGRCdXR0b24oaXRlbSwgJ2FjY29yZGlvbl9tb3JlX2J1dHRvbl9sZXNzJywgJ9Ch0LrRgNGL0YLRjCcpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQoaXRlbSkuZmluZCgnLmFjY29yZGlvbl9tb3JlX2J1dHRvbicpLnJlbW92ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfVxyXG5cclxuICAkKHdpbmRvdykucmVzaXplKHJlYnVpbGQpO1xyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdsYW5ndWFnZV9sb2FkZWQnLCBmdW5jdGlvbigpe1xyXG4gICAgcmVidWlsZCgpO1xyXG4gIH0sIGZhbHNlKTtcclxuXHJcbn0pKCk7XHJcblxyXG5cclxuIiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XHJcbiAgdmFyIGZpbGVBcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IgPyB0cnVlIDogZmFsc2U7XHJcbiAgdmFyIGRlZmF1bHRzID0ge1xyXG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJ1xyXG4gIH07XHJcbiAgdmFyIGxhc3RfcG9zdCA9IGZhbHNlO1xyXG5cclxuICBmdW5jdGlvbiBvblBvc3QocG9zdCkge1xyXG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XHJcbiAgICAvL2NvbnNvbGUubG9nKHBvc3QsIHRoaXMpO1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcclxuICAgIHZhciB3cmFwX2h0bWwgPSBkYXRhLndyYXBfaHRtbDtcclxuXHJcbiAgICBpZiAocG9zdC5yZW5kZXIpIHtcclxuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3MgPSBcIm5vdGlmeV93aGl0ZVwiO1xyXG4gICAgICBub3RpZmljYXRpb24uYWxlcnQocG9zdCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgaWYgKHBvc3QuaHRtbCkge1xyXG4gICAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xyXG4gICAgICAgIGFqYXhGb3JtKHdyYXApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICghcG9zdC5lcnJvcikge1xyXG4gICAgICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICAgICAgd3JhcC5odG1sKHdyYXBfaHRtbCk7XHJcbiAgICAgICAgICBmb3JtLmZpbmQoJ2lucHV0W3R5cGU9dGV4dF0sdGV4dGFyZWEnKS52YWwoJycpO1xyXG4gICAgICAgICAgYWpheEZvcm0od3JhcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBwb3N0LmVycm9yID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgIGZvciAodmFyIGluZGV4IGluIHBvc3QuZXJyb3IpIHtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICd0eXBlJzogJ2VycicsXHJcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IGxnKCdlcnJvcicpLFxyXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0LmVycm9yW2luZGV4XVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb3N0LmVycm9yLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgICAndHlwZSc6ICdlcnInLFxyXG4gICAgICAgICAgJ3RpdGxlJzogcG9zdC50aXRsZSA/IHBvc3QudGl0bGUgOiBsZygnZXJyb3InKSxcclxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocG9zdC5lcnJvciB8fCBwb3N0Lm1lc3NhZ2UpIHtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcclxuICAgICAgICAgICd0aXRsZSc6IHBvc3QudGl0bGUgPyBwb3N0LnRpdGxlIDogKHBvc3QuZXJyb3IgPT09IGZhbHNlID8gbGcoJ3N1Y2Nlc3MnKSA6IGxnKCdlcnJvcicpKSxcclxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5tZXNzYWdlID8gcG9zdC5tZXNzYWdlIDogcG9zdC5lcnJvclxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvL1xyXG4gICAgLy8gbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAvLyAgICAgJ3R5cGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICdzdWNjZXNzJyA6ICdlcnInLFxyXG4gICAgLy8gICAgICd0aXRsZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ9Cj0YHQv9C10YjQvdC+JyA6ICfQntGI0LjQsdC60LAnLFxyXG4gICAgLy8gICAgICdtZXNzYWdlJzogQXJyYXkuaXNBcnJheShwb3N0LmVycm9yKSA/IHBvc3QuZXJyb3JbMF0gOiAocG9zdC5tZXNzYWdlID8gcG9zdC5tZXNzYWdlIDogcG9zdC5lcnJvcilcclxuICAgIC8vIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25GYWlsKCkge1xyXG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xyXG4gICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgd3JhcC5odG1sKFxyXG4gICAgICAgICc8aDM+JytsZygnc29ycnlfbm90X2V4cGVjdGVkX2Vycm9yJykrJzxoMz4nICtcclxuICAgICAgICBsZygnaXRfaGFwcGVuc19zb21ldGltZXMnKVxyXG4gICAgKTtcclxuICAgIGFqYXhGb3JtKHdyYXApO1xyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uU3VibWl0KGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIC8vZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgIC8vZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICB2YXIgY3VycmVudFRpbWVNaWxsaXMgPSArbmV3IERhdGUoKTtcclxuICAgIGlmIChjdXJyZW50VGltZU1pbGxpcyAtIGxhc3RfcG9zdCA8IDEwMDAgKiAyKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBsYXN0X3Bvc3QgPSBjdXJyZW50VGltZU1pbGxpcztcclxuICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xyXG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XHJcbiAgICBkYXRhLndyYXBfaHRtbD13cmFwLmh0bWwoKTtcclxuICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcclxuXHJcbiAgICAvL2luaXQod3JhcCk7XHJcblxyXG4gICAgdmFyIHJlcXVpcmVkID0gZm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCwgdGV4dGFyZWEucmVxdWlyZWQsIGlucHV0W2lkPVwic3VwcG9ydC1yZWNhcHRjaGFcIl0nKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVxdWlyZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGhlbHBCbG9jayA9IHJlcXVpcmVkLmVxKGkpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuZmluZCgnLmhlbHAtYmxvY2snKTtcclxuICAgICAgdmFyIGhlbHBNZXNzYWdlID0gaGVscEJsb2NrICYmIGhlbHBCbG9jay5kYXRhKCdtZXNzYWdlJykgPyBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpIDogbGcoJ3JlcXVpcmVkJyk7XHJcblxyXG4gICAgICBpZiAocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICQoaGVscEJsb2NrKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcclxuICAgICAgICBoZWxwQmxvY2suaHRtbChoZWxwTWVzc2FnZSk7XHJcbiAgICAgICAgaGVscEJsb2NrLmFkZENsYXNzKCdoZWxwLWJsb2NrLWVycm9yJyk7XHJcbiAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGhlbHBCbG9jay5odG1sKCcnKTtcclxuICAgICAgICAkKGhlbHBCbG9jaykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgaGVscEJsb2NrLnJlbW92ZUNsYXNzKCdoZWxwLWJsb2NrLWVycm9yJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICghaXNWYWxpZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGZvcm0ueWlpQWN0aXZlRm9ybSkge1xyXG4gICAgICBmb3JtLm9mZignYWZ0ZXJWYWxpZGF0ZScpO1xyXG4gICAgICBmb3JtLm9uKCdhZnRlclZhbGlkYXRlJywgeWlpVmFsaWRhdGlvbi5iaW5kKGRhdGEpKTtcclxuXHJcbiAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnLCB0cnVlKTtcclxuICAgICAgdmFyIGQgPSBmb3JtLmRhdGEoJ3lpaUFjdGl2ZUZvcm0nKTtcclxuICAgICAgaWYgKGQpIHtcclxuICAgICAgICBkLnZhbGlkYXRlZCA9IHRydWU7XHJcbiAgICAgICAgZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJywgZCk7XHJcbiAgICAgICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScpO1xyXG4gICAgICAgIGlzVmFsaWQgPSBkLnZhbGlkYXRlZDtcclxuICAgICAgfVxyXG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpc1ZhbGlkID0gaXNWYWxpZCAmJiAoZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aCA9PSAwKTtcclxuXHJcbiAgICBpZiAoIWlzVmFsaWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgIHNlbmRGb3JtKGRhdGEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24geWlpVmFsaWRhdGlvbihlKSB7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuXHJcbiAgICBpZihmb3JtLmZpbmQoZGF0YS5wYXJhbS5lcnJvcl9jbGFzcykubGVuZ3RoID09IDApe1xyXG4gICAgICBzZW5kRm9ybSh0aGlzKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2VuZEZvcm0oZGF0YSl7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuXHJcbiAgICBpZiAoIWZvcm0uc2VyaWFsaXplT2JqZWN0KWFkZFNSTygpO1xyXG5cclxuICAgIHZhciBwb3N0RGF0YSA9IGZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XHJcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICBmb3JtLmh0bWwoJycpO1xyXG4gICAgZGF0YS53cmFwLmh0bWwoJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48cD4nK2xnKCdzZW5kaW5nX2RhdGEnKSsnPC9wPjwvZGl2PicpO1xyXG5cclxuICAgIGRhdGEudXJsICs9IChkYXRhLnVybC5pbmRleE9mKCc/JykgPiAwID8gJyYnIDogJz8nKSArICdyYz0nICsgTWF0aC5yYW5kb20oKTtcclxuICAgIC8vY29uc29sZS5sb2coZGF0YS51cmwpO1xyXG5cclxuICAgIC8qaWYoIXBvc3REYXRhLnJldHVyblVybCl7XHJcbiAgICAgIHBvc3REYXRhLnJldHVyblVybD1sb2NhdGlvbi5ocmVmO1xyXG4gICAgfSovXHJcblxyXG4gICAgaWYodHlwZW9mIGxhbmcgIT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhLnVybC5pbmRleE9mKGxhbmdbXCJocmVmX3ByZWZpeFwiXSk9PS0xKXtcclxuICAgICAgZGF0YS51cmw9XCIvXCIrbGFuZ1tcImhyZWZfcHJlZml4XCJdK2RhdGEudXJsO1xyXG4gICAgICBkYXRhLnVybD1kYXRhLnVybC5yZXBsYWNlKCcvLycsJy8nKS5yZXBsYWNlKCcvLycsJy8nKTtcclxuICAgIH1cclxuXHJcbiAgICAkLnBvc3QoXHJcbiAgICAgIGRhdGEudXJsLFxyXG4gICAgICBwb3N0RGF0YSxcclxuICAgICAgb25Qb3N0LmJpbmQoZGF0YSksXHJcbiAgICAgICdqc29uJ1xyXG4gICAgKS5mYWlsKG9uRmFpbC5iaW5kKGRhdGEpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQod3JhcCkge1xyXG4gICAgZm9ybSA9IHdyYXAuZmluZCgnZm9ybScpO1xyXG4gICAgZGF0YSA9IHtcclxuICAgICAgZm9ybTogZm9ybSxcclxuICAgICAgcGFyYW06IGRlZmF1bHRzLFxyXG4gICAgICB3cmFwOiB3cmFwXHJcbiAgICB9O1xyXG4gICAgZGF0YS51cmwgPSBmb3JtLmF0dHIoJ2FjdGlvbicpIHx8IGxvY2F0aW9uLmhyZWY7XHJcbiAgICBkYXRhLm1ldGhvZCA9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xyXG4gICAgZm9ybS51bmJpbmQoJ3N1Ym1pdCcpO1xyXG4gICAgLy9mb3JtLm9mZignc3VibWl0Jyk7XHJcbiAgICBmb3JtLm9uKCdzdWJtaXQnLCBvblN1Ym1pdC5iaW5kKGRhdGEpKTtcclxuICB9XHJcblxyXG4gIGVscy5maW5kKCdbcmVxdWlyZWRdJylcclxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxyXG4gICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJyk7XHJcblxyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgaW5pdChlbHMuZXEoaSkpO1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiBwbGFjZWhvbGRlciA9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHBsYWNlaG9sZGVyKCk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gYWRkU1JPKCkge1xyXG4gICQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG8gPSB7fTtcclxuICAgIHZhciBhID0gdGhpcy5zZXJpYWxpemVBcnJheSgpO1xyXG4gICAgJC5lYWNoKGEsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xyXG4gICAgICAgIGlmICghb1t0aGlzLm5hbWVdLnB1c2gpIHtcclxuICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvW3RoaXMubmFtZV0ucHVzaCh0aGlzLnZhbHVlIHx8ICcnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBvO1xyXG4gIH07XHJcbn07XHJcbmFkZFNSTygpOyIsIi8qISBqUXVlcnkgVUkgLSB2MS4xMi4xIC0gMjAxOC0xMi0yMFxuKiBodHRwOi8vanF1ZXJ5dWkuY29tXG4qIEluY2x1ZGVzOiB3aWRnZXQuanMsIHBvc2l0aW9uLmpzLCBmb3JtLXJlc2V0LW1peGluLmpzLCBrZXljb2RlLmpzLCBsYWJlbHMuanMsIHVuaXF1ZS1pZC5qcywgd2lkZ2V0cy9hdXRvY29tcGxldGUuanMsIHdpZGdldHMvZGF0ZXBpY2tlci5qcywgd2lkZ2V0cy9tZW51LmpzLCB3aWRnZXRzL21vdXNlLmpzLCB3aWRnZXRzL3NlbGVjdG1lbnUuanMsIHdpZGdldHMvc2xpZGVyLmpzXG4qIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzOyBMaWNlbnNlZCBNSVQgKi9cblxuKGZ1bmN0aW9uKHQpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLHQpOnQoalF1ZXJ5KX0pKGZ1bmN0aW9uKHQpe2Z1bmN0aW9uIGUodCl7Zm9yKHZhciBlLGk7dC5sZW5ndGgmJnRbMF0hPT1kb2N1bWVudDspe2lmKGU9dC5jc3MoXCJwb3NpdGlvblwiKSwoXCJhYnNvbHV0ZVwiPT09ZXx8XCJyZWxhdGl2ZVwiPT09ZXx8XCJmaXhlZFwiPT09ZSkmJihpPXBhcnNlSW50KHQuY3NzKFwiekluZGV4XCIpLDEwKSwhaXNOYU4oaSkmJjAhPT1pKSlyZXR1cm4gaTt0PXQucGFyZW50KCl9cmV0dXJuIDB9ZnVuY3Rpb24gaSgpe3RoaXMuX2N1ckluc3Q9bnVsbCx0aGlzLl9rZXlFdmVudD0hMSx0aGlzLl9kaXNhYmxlZElucHV0cz1bXSx0aGlzLl9kYXRlcGlja2VyU2hvd2luZz0hMSx0aGlzLl9pbkRpYWxvZz0hMSx0aGlzLl9tYWluRGl2SWQ9XCJ1aS1kYXRlcGlja2VyLWRpdlwiLHRoaXMuX2lubGluZUNsYXNzPVwidWktZGF0ZXBpY2tlci1pbmxpbmVcIix0aGlzLl9hcHBlbmRDbGFzcz1cInVpLWRhdGVwaWNrZXItYXBwZW5kXCIsdGhpcy5fdHJpZ2dlckNsYXNzPVwidWktZGF0ZXBpY2tlci10cmlnZ2VyXCIsdGhpcy5fZGlhbG9nQ2xhc3M9XCJ1aS1kYXRlcGlja2VyLWRpYWxvZ1wiLHRoaXMuX2Rpc2FibGVDbGFzcz1cInVpLWRhdGVwaWNrZXItZGlzYWJsZWRcIix0aGlzLl91bnNlbGVjdGFibGVDbGFzcz1cInVpLWRhdGVwaWNrZXItdW5zZWxlY3RhYmxlXCIsdGhpcy5fY3VycmVudENsYXNzPVwidWktZGF0ZXBpY2tlci1jdXJyZW50LWRheVwiLHRoaXMuX2RheU92ZXJDbGFzcz1cInVpLWRhdGVwaWNrZXItZGF5cy1jZWxsLW92ZXJcIix0aGlzLnJlZ2lvbmFsPVtdLHRoaXMucmVnaW9uYWxbXCJcIl09e2Nsb3NlVGV4dDpcIkRvbmVcIixwcmV2VGV4dDpcIlByZXZcIixuZXh0VGV4dDpcIk5leHRcIixjdXJyZW50VGV4dDpcIlRvZGF5XCIsbW9udGhOYW1lczpbXCJKYW51YXJ5XCIsXCJGZWJydWFyeVwiLFwiTWFyY2hcIixcIkFwcmlsXCIsXCJNYXlcIixcIkp1bmVcIixcIkp1bHlcIixcIkF1Z3VzdFwiLFwiU2VwdGVtYmVyXCIsXCJPY3RvYmVyXCIsXCJOb3ZlbWJlclwiLFwiRGVjZW1iZXJcIl0sbW9udGhOYW1lc1Nob3J0OltcIkphblwiLFwiRmViXCIsXCJNYXJcIixcIkFwclwiLFwiTWF5XCIsXCJKdW5cIixcIkp1bFwiLFwiQXVnXCIsXCJTZXBcIixcIk9jdFwiLFwiTm92XCIsXCJEZWNcIl0sZGF5TmFtZXM6W1wiU3VuZGF5XCIsXCJNb25kYXlcIixcIlR1ZXNkYXlcIixcIldlZG5lc2RheVwiLFwiVGh1cnNkYXlcIixcIkZyaWRheVwiLFwiU2F0dXJkYXlcIl0sZGF5TmFtZXNTaG9ydDpbXCJTdW5cIixcIk1vblwiLFwiVHVlXCIsXCJXZWRcIixcIlRodVwiLFwiRnJpXCIsXCJTYXRcIl0sZGF5TmFtZXNNaW46W1wiU3VcIixcIk1vXCIsXCJUdVwiLFwiV2VcIixcIlRoXCIsXCJGclwiLFwiU2FcIl0sd2Vla0hlYWRlcjpcIldrXCIsZGF0ZUZvcm1hdDpcIm1tL2RkL3l5XCIsZmlyc3REYXk6MCxpc1JUTDohMSxzaG93TW9udGhBZnRlclllYXI6ITEseWVhclN1ZmZpeDpcIlwifSx0aGlzLl9kZWZhdWx0cz17c2hvd09uOlwiZm9jdXNcIixzaG93QW5pbTpcImZhZGVJblwiLHNob3dPcHRpb25zOnt9LGRlZmF1bHREYXRlOm51bGwsYXBwZW5kVGV4dDpcIlwiLGJ1dHRvblRleHQ6XCIuLi5cIixidXR0b25JbWFnZTpcIlwiLGJ1dHRvbkltYWdlT25seTohMSxoaWRlSWZOb1ByZXZOZXh0OiExLG5hdmlnYXRpb25Bc0RhdGVGb3JtYXQ6ITEsZ290b0N1cnJlbnQ6ITEsY2hhbmdlTW9udGg6ITEsY2hhbmdlWWVhcjohMSx5ZWFyUmFuZ2U6XCJjLTEwOmMrMTBcIixzaG93T3RoZXJNb250aHM6ITEsc2VsZWN0T3RoZXJNb250aHM6ITEsc2hvd1dlZWs6ITEsY2FsY3VsYXRlV2Vlazp0aGlzLmlzbzg2MDFXZWVrLHNob3J0WWVhckN1dG9mZjpcIisxMFwiLG1pbkRhdGU6bnVsbCxtYXhEYXRlOm51bGwsZHVyYXRpb246XCJmYXN0XCIsYmVmb3JlU2hvd0RheTpudWxsLGJlZm9yZVNob3c6bnVsbCxvblNlbGVjdDpudWxsLG9uQ2hhbmdlTW9udGhZZWFyOm51bGwsb25DbG9zZTpudWxsLG51bWJlck9mTW9udGhzOjEsc2hvd0N1cnJlbnRBdFBvczowLHN0ZXBNb250aHM6MSxzdGVwQmlnTW9udGhzOjEyLGFsdEZpZWxkOlwiXCIsYWx0Rm9ybWF0OlwiXCIsY29uc3RyYWluSW5wdXQ6ITAsc2hvd0J1dHRvblBhbmVsOiExLGF1dG9TaXplOiExLGRpc2FibGVkOiExfSx0LmV4dGVuZCh0aGlzLl9kZWZhdWx0cyx0aGlzLnJlZ2lvbmFsW1wiXCJdKSx0aGlzLnJlZ2lvbmFsLmVuPXQuZXh0ZW5kKCEwLHt9LHRoaXMucmVnaW9uYWxbXCJcIl0pLHRoaXMucmVnaW9uYWxbXCJlbi1VU1wiXT10LmV4dGVuZCghMCx7fSx0aGlzLnJlZ2lvbmFsLmVuKSx0aGlzLmRwRGl2PXModChcIjxkaXYgaWQ9J1wiK3RoaXMuX21haW5EaXZJZCtcIicgY2xhc3M9J3VpLWRhdGVwaWNrZXIgdWktd2lkZ2V0IHVpLXdpZGdldC1jb250ZW50IHVpLWhlbHBlci1jbGVhcmZpeCB1aS1jb3JuZXItYWxsJz48L2Rpdj5cIikpfWZ1bmN0aW9uIHMoZSl7dmFyIGk9XCJidXR0b24sIC51aS1kYXRlcGlja2VyLXByZXYsIC51aS1kYXRlcGlja2VyLW5leHQsIC51aS1kYXRlcGlja2VyLWNhbGVuZGFyIHRkIGFcIjtyZXR1cm4gZS5vbihcIm1vdXNlb3V0XCIsaSxmdW5jdGlvbigpe3QodGhpcykucmVtb3ZlQ2xhc3MoXCJ1aS1zdGF0ZS1ob3ZlclwiKSwtMSE9PXRoaXMuY2xhc3NOYW1lLmluZGV4T2YoXCJ1aS1kYXRlcGlja2VyLXByZXZcIikmJnQodGhpcykucmVtb3ZlQ2xhc3MoXCJ1aS1kYXRlcGlja2VyLXByZXYtaG92ZXJcIiksLTEhPT10aGlzLmNsYXNzTmFtZS5pbmRleE9mKFwidWktZGF0ZXBpY2tlci1uZXh0XCIpJiZ0KHRoaXMpLnJlbW92ZUNsYXNzKFwidWktZGF0ZXBpY2tlci1uZXh0LWhvdmVyXCIpfSkub24oXCJtb3VzZW92ZXJcIixpLG4pfWZ1bmN0aW9uIG4oKXt0LmRhdGVwaWNrZXIuX2lzRGlzYWJsZWREYXRlcGlja2VyKGwuaW5saW5lP2wuZHBEaXYucGFyZW50KClbMF06bC5pbnB1dFswXSl8fCh0KHRoaXMpLnBhcmVudHMoXCIudWktZGF0ZXBpY2tlci1jYWxlbmRhclwiKS5maW5kKFwiYVwiKS5yZW1vdmVDbGFzcyhcInVpLXN0YXRlLWhvdmVyXCIpLHQodGhpcykuYWRkQ2xhc3MoXCJ1aS1zdGF0ZS1ob3ZlclwiKSwtMSE9PXRoaXMuY2xhc3NOYW1lLmluZGV4T2YoXCJ1aS1kYXRlcGlja2VyLXByZXZcIikmJnQodGhpcykuYWRkQ2xhc3MoXCJ1aS1kYXRlcGlja2VyLXByZXYtaG92ZXJcIiksLTEhPT10aGlzLmNsYXNzTmFtZS5pbmRleE9mKFwidWktZGF0ZXBpY2tlci1uZXh0XCIpJiZ0KHRoaXMpLmFkZENsYXNzKFwidWktZGF0ZXBpY2tlci1uZXh0LWhvdmVyXCIpKX1mdW5jdGlvbiBvKGUsaSl7dC5leHRlbmQoZSxpKTtmb3IodmFyIHMgaW4gaSludWxsPT1pW3NdJiYoZVtzXT1pW3NdKTtyZXR1cm4gZX10LnVpPXQudWl8fHt9LHQudWkudmVyc2lvbj1cIjEuMTIuMVwiO3ZhciBhPTAscj1BcnJheS5wcm90b3R5cGUuc2xpY2U7dC5jbGVhbkRhdGE9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKGkpe3ZhciBzLG4sbztmb3Iobz0wO251bGwhPShuPWlbb10pO28rKyl0cnl7cz10Ll9kYXRhKG4sXCJldmVudHNcIikscyYmcy5yZW1vdmUmJnQobikudHJpZ2dlckhhbmRsZXIoXCJyZW1vdmVcIil9Y2F0Y2goYSl7fWUoaSl9fSh0LmNsZWFuRGF0YSksdC53aWRnZXQ9ZnVuY3Rpb24oZSxpLHMpe3ZhciBuLG8sYSxyPXt9LGw9ZS5zcGxpdChcIi5cIilbMF07ZT1lLnNwbGl0KFwiLlwiKVsxXTt2YXIgaD1sK1wiLVwiK2U7cmV0dXJuIHN8fChzPWksaT10LldpZGdldCksdC5pc0FycmF5KHMpJiYocz10LmV4dGVuZC5hcHBseShudWxsLFt7fV0uY29uY2F0KHMpKSksdC5leHByW1wiOlwiXVtoLnRvTG93ZXJDYXNlKCldPWZ1bmN0aW9uKGUpe3JldHVybiEhdC5kYXRhKGUsaCl9LHRbbF09dFtsXXx8e30sbj10W2xdW2VdLG89dFtsXVtlXT1mdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLl9jcmVhdGVXaWRnZXQ/KGFyZ3VtZW50cy5sZW5ndGgmJnRoaXMuX2NyZWF0ZVdpZGdldCh0LGUpLHZvaWQgMCk6bmV3IG8odCxlKX0sdC5leHRlbmQobyxuLHt2ZXJzaW9uOnMudmVyc2lvbixfcHJvdG86dC5leHRlbmQoe30scyksX2NoaWxkQ29uc3RydWN0b3JzOltdfSksYT1uZXcgaSxhLm9wdGlvbnM9dC53aWRnZXQuZXh0ZW5kKHt9LGEub3B0aW9ucyksdC5lYWNoKHMsZnVuY3Rpb24oZSxzKXtyZXR1cm4gdC5pc0Z1bmN0aW9uKHMpPyhyW2VdPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpe3JldHVybiBpLnByb3RvdHlwZVtlXS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9ZnVuY3Rpb24gbih0KXtyZXR1cm4gaS5wcm90b3R5cGVbZV0uYXBwbHkodGhpcyx0KX1yZXR1cm4gZnVuY3Rpb24oKXt2YXIgZSxpPXRoaXMuX3N1cGVyLG89dGhpcy5fc3VwZXJBcHBseTtyZXR1cm4gdGhpcy5fc3VwZXI9dCx0aGlzLl9zdXBlckFwcGx5PW4sZT1zLmFwcGx5KHRoaXMsYXJndW1lbnRzKSx0aGlzLl9zdXBlcj1pLHRoaXMuX3N1cGVyQXBwbHk9byxlfX0oKSx2b2lkIDApOihyW2VdPXMsdm9pZCAwKX0pLG8ucHJvdG90eXBlPXQud2lkZ2V0LmV4dGVuZChhLHt3aWRnZXRFdmVudFByZWZpeDpuP2Eud2lkZ2V0RXZlbnRQcmVmaXh8fGU6ZX0scix7Y29uc3RydWN0b3I6byxuYW1lc3BhY2U6bCx3aWRnZXROYW1lOmUsd2lkZ2V0RnVsbE5hbWU6aH0pLG4/KHQuZWFjaChuLl9jaGlsZENvbnN0cnVjdG9ycyxmdW5jdGlvbihlLGkpe3ZhciBzPWkucHJvdG90eXBlO3Qud2lkZ2V0KHMubmFtZXNwYWNlK1wiLlwiK3Mud2lkZ2V0TmFtZSxvLGkuX3Byb3RvKX0pLGRlbGV0ZSBuLl9jaGlsZENvbnN0cnVjdG9ycyk6aS5fY2hpbGRDb25zdHJ1Y3RvcnMucHVzaChvKSx0LndpZGdldC5icmlkZ2UoZSxvKSxvfSx0LndpZGdldC5leHRlbmQ9ZnVuY3Rpb24oZSl7Zm9yKHZhciBpLHMsbj1yLmNhbGwoYXJndW1lbnRzLDEpLG89MCxhPW4ubGVuZ3RoO2E+bztvKyspZm9yKGkgaW4gbltvXSlzPW5bb11baV0sbltvXS5oYXNPd25Qcm9wZXJ0eShpKSYmdm9pZCAwIT09cyYmKGVbaV09dC5pc1BsYWluT2JqZWN0KHMpP3QuaXNQbGFpbk9iamVjdChlW2ldKT90LndpZGdldC5leHRlbmQoe30sZVtpXSxzKTp0LndpZGdldC5leHRlbmQoe30scyk6cyk7cmV0dXJuIGV9LHQud2lkZ2V0LmJyaWRnZT1mdW5jdGlvbihlLGkpe3ZhciBzPWkucHJvdG90eXBlLndpZGdldEZ1bGxOYW1lfHxlO3QuZm5bZV09ZnVuY3Rpb24obil7dmFyIG89XCJzdHJpbmdcIj09dHlwZW9mIG4sYT1yLmNhbGwoYXJndW1lbnRzLDEpLGw9dGhpcztyZXR1cm4gbz90aGlzLmxlbmd0aHx8XCJpbnN0YW5jZVwiIT09bj90aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgaSxvPXQuZGF0YSh0aGlzLHMpO3JldHVyblwiaW5zdGFuY2VcIj09PW4/KGw9bywhMSk6bz90LmlzRnVuY3Rpb24ob1tuXSkmJlwiX1wiIT09bi5jaGFyQXQoMCk/KGk9b1tuXS5hcHBseShvLGEpLGkhPT1vJiZ2b2lkIDAhPT1pPyhsPWkmJmkuanF1ZXJ5P2wucHVzaFN0YWNrKGkuZ2V0KCkpOmksITEpOnZvaWQgMCk6dC5lcnJvcihcIm5vIHN1Y2ggbWV0aG9kICdcIituK1wiJyBmb3IgXCIrZStcIiB3aWRnZXQgaW5zdGFuY2VcIik6dC5lcnJvcihcImNhbm5vdCBjYWxsIG1ldGhvZHMgb24gXCIrZStcIiBwcmlvciB0byBpbml0aWFsaXphdGlvbjsgXCIrXCJhdHRlbXB0ZWQgdG8gY2FsbCBtZXRob2QgJ1wiK24rXCInXCIpfSk6bD12b2lkIDA6KGEubGVuZ3RoJiYobj10LndpZGdldC5leHRlbmQuYXBwbHkobnVsbCxbbl0uY29uY2F0KGEpKSksdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9dC5kYXRhKHRoaXMscyk7ZT8oZS5vcHRpb24obnx8e30pLGUuX2luaXQmJmUuX2luaXQoKSk6dC5kYXRhKHRoaXMscyxuZXcgaShuLHRoaXMpKX0pKSxsfX0sdC5XaWRnZXQ9ZnVuY3Rpb24oKXt9LHQuV2lkZ2V0Ll9jaGlsZENvbnN0cnVjdG9ycz1bXSx0LldpZGdldC5wcm90b3R5cGU9e3dpZGdldE5hbWU6XCJ3aWRnZXRcIix3aWRnZXRFdmVudFByZWZpeDpcIlwiLGRlZmF1bHRFbGVtZW50OlwiPGRpdj5cIixvcHRpb25zOntjbGFzc2VzOnt9LGRpc2FibGVkOiExLGNyZWF0ZTpudWxsfSxfY3JlYXRlV2lkZ2V0OmZ1bmN0aW9uKGUsaSl7aT10KGl8fHRoaXMuZGVmYXVsdEVsZW1lbnR8fHRoaXMpWzBdLHRoaXMuZWxlbWVudD10KGkpLHRoaXMudXVpZD1hKyssdGhpcy5ldmVudE5hbWVzcGFjZT1cIi5cIit0aGlzLndpZGdldE5hbWUrdGhpcy51dWlkLHRoaXMuYmluZGluZ3M9dCgpLHRoaXMuaG92ZXJhYmxlPXQoKSx0aGlzLmZvY3VzYWJsZT10KCksdGhpcy5jbGFzc2VzRWxlbWVudExvb2t1cD17fSxpIT09dGhpcyYmKHQuZGF0YShpLHRoaXMud2lkZ2V0RnVsbE5hbWUsdGhpcyksdGhpcy5fb24oITAsdGhpcy5lbGVtZW50LHtyZW1vdmU6ZnVuY3Rpb24odCl7dC50YXJnZXQ9PT1pJiZ0aGlzLmRlc3Ryb3koKX19KSx0aGlzLmRvY3VtZW50PXQoaS5zdHlsZT9pLm93bmVyRG9jdW1lbnQ6aS5kb2N1bWVudHx8aSksdGhpcy53aW5kb3c9dCh0aGlzLmRvY3VtZW50WzBdLmRlZmF1bHRWaWV3fHx0aGlzLmRvY3VtZW50WzBdLnBhcmVudFdpbmRvdykpLHRoaXMub3B0aW9ucz10LndpZGdldC5leHRlbmQoe30sdGhpcy5vcHRpb25zLHRoaXMuX2dldENyZWF0ZU9wdGlvbnMoKSxlKSx0aGlzLl9jcmVhdGUoKSx0aGlzLm9wdGlvbnMuZGlzYWJsZWQmJnRoaXMuX3NldE9wdGlvbkRpc2FibGVkKHRoaXMub3B0aW9ucy5kaXNhYmxlZCksdGhpcy5fdHJpZ2dlcihcImNyZWF0ZVwiLG51bGwsdGhpcy5fZ2V0Q3JlYXRlRXZlbnREYXRhKCkpLHRoaXMuX2luaXQoKX0sX2dldENyZWF0ZU9wdGlvbnM6ZnVuY3Rpb24oKXtyZXR1cm57fX0sX2dldENyZWF0ZUV2ZW50RGF0YTp0Lm5vb3AsX2NyZWF0ZTp0Lm5vb3AsX2luaXQ6dC5ub29wLGRlc3Ryb3k6ZnVuY3Rpb24oKXt2YXIgZT10aGlzO3RoaXMuX2Rlc3Ryb3koKSx0LmVhY2godGhpcy5jbGFzc2VzRWxlbWVudExvb2t1cCxmdW5jdGlvbih0LGkpe2UuX3JlbW92ZUNsYXNzKGksdCl9KSx0aGlzLmVsZW1lbnQub2ZmKHRoaXMuZXZlbnROYW1lc3BhY2UpLnJlbW92ZURhdGEodGhpcy53aWRnZXRGdWxsTmFtZSksdGhpcy53aWRnZXQoKS5vZmYodGhpcy5ldmVudE5hbWVzcGFjZSkucmVtb3ZlQXR0cihcImFyaWEtZGlzYWJsZWRcIiksdGhpcy5iaW5kaW5ncy5vZmYodGhpcy5ldmVudE5hbWVzcGFjZSl9LF9kZXN0cm95OnQubm9vcCx3aWRnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lbGVtZW50fSxvcHRpb246ZnVuY3Rpb24oZSxpKXt2YXIgcyxuLG8sYT1lO2lmKDA9PT1hcmd1bWVudHMubGVuZ3RoKXJldHVybiB0LndpZGdldC5leHRlbmQoe30sdGhpcy5vcHRpb25zKTtpZihcInN0cmluZ1wiPT10eXBlb2YgZSlpZihhPXt9LHM9ZS5zcGxpdChcIi5cIiksZT1zLnNoaWZ0KCkscy5sZW5ndGgpe2ZvcihuPWFbZV09dC53aWRnZXQuZXh0ZW5kKHt9LHRoaXMub3B0aW9uc1tlXSksbz0wO3MubGVuZ3RoLTE+bztvKyspbltzW29dXT1uW3Nbb11dfHx7fSxuPW5bc1tvXV07aWYoZT1zLnBvcCgpLDE9PT1hcmd1bWVudHMubGVuZ3RoKXJldHVybiB2b2lkIDA9PT1uW2VdP251bGw6bltlXTtuW2VdPWl9ZWxzZXtpZigxPT09YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdm9pZCAwPT09dGhpcy5vcHRpb25zW2VdP251bGw6dGhpcy5vcHRpb25zW2VdO2FbZV09aX1yZXR1cm4gdGhpcy5fc2V0T3B0aW9ucyhhKSx0aGlzfSxfc2V0T3B0aW9uczpmdW5jdGlvbih0KXt2YXIgZTtmb3IoZSBpbiB0KXRoaXMuX3NldE9wdGlvbihlLHRbZV0pO3JldHVybiB0aGlzfSxfc2V0T3B0aW9uOmZ1bmN0aW9uKHQsZSl7cmV0dXJuXCJjbGFzc2VzXCI9PT10JiZ0aGlzLl9zZXRPcHRpb25DbGFzc2VzKGUpLHRoaXMub3B0aW9uc1t0XT1lLFwiZGlzYWJsZWRcIj09PXQmJnRoaXMuX3NldE9wdGlvbkRpc2FibGVkKGUpLHRoaXN9LF9zZXRPcHRpb25DbGFzc2VzOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbjtmb3IoaSBpbiBlKW49dGhpcy5jbGFzc2VzRWxlbWVudExvb2t1cFtpXSxlW2ldIT09dGhpcy5vcHRpb25zLmNsYXNzZXNbaV0mJm4mJm4ubGVuZ3RoJiYocz10KG4uZ2V0KCkpLHRoaXMuX3JlbW92ZUNsYXNzKG4saSkscy5hZGRDbGFzcyh0aGlzLl9jbGFzc2VzKHtlbGVtZW50OnMsa2V5czppLGNsYXNzZXM6ZSxhZGQ6ITB9KSkpfSxfc2V0T3B0aW9uRGlzYWJsZWQ6ZnVuY3Rpb24odCl7dGhpcy5fdG9nZ2xlQ2xhc3ModGhpcy53aWRnZXQoKSx0aGlzLndpZGdldEZ1bGxOYW1lK1wiLWRpc2FibGVkXCIsbnVsbCwhIXQpLHQmJih0aGlzLl9yZW1vdmVDbGFzcyh0aGlzLmhvdmVyYWJsZSxudWxsLFwidWktc3RhdGUtaG92ZXJcIiksdGhpcy5fcmVtb3ZlQ2xhc3ModGhpcy5mb2N1c2FibGUsbnVsbCxcInVpLXN0YXRlLWZvY3VzXCIpKX0sZW5hYmxlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3NldE9wdGlvbnMoe2Rpc2FibGVkOiExfSl9LGRpc2FibGU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc2V0T3B0aW9ucyh7ZGlzYWJsZWQ6ITB9KX0sX2NsYXNzZXM6ZnVuY3Rpb24oZSl7ZnVuY3Rpb24gaShpLG8pe3ZhciBhLHI7Zm9yKHI9MDtpLmxlbmd0aD5yO3IrKylhPW4uY2xhc3Nlc0VsZW1lbnRMb29rdXBbaVtyXV18fHQoKSxhPWUuYWRkP3QodC51bmlxdWUoYS5nZXQoKS5jb25jYXQoZS5lbGVtZW50LmdldCgpKSkpOnQoYS5ub3QoZS5lbGVtZW50KS5nZXQoKSksbi5jbGFzc2VzRWxlbWVudExvb2t1cFtpW3JdXT1hLHMucHVzaChpW3JdKSxvJiZlLmNsYXNzZXNbaVtyXV0mJnMucHVzaChlLmNsYXNzZXNbaVtyXV0pfXZhciBzPVtdLG49dGhpcztyZXR1cm4gZT10LmV4dGVuZCh7ZWxlbWVudDp0aGlzLmVsZW1lbnQsY2xhc3Nlczp0aGlzLm9wdGlvbnMuY2xhc3Nlc3x8e319LGUpLHRoaXMuX29uKGUuZWxlbWVudCx7cmVtb3ZlOlwiX3VudHJhY2tDbGFzc2VzRWxlbWVudFwifSksZS5rZXlzJiZpKGUua2V5cy5tYXRjaCgvXFxTKy9nKXx8W10sITApLGUuZXh0cmEmJmkoZS5leHRyYS5tYXRjaCgvXFxTKy9nKXx8W10pLHMuam9pbihcIiBcIil9LF91bnRyYWNrQ2xhc3Nlc0VsZW1lbnQ6ZnVuY3Rpb24oZSl7dmFyIGk9dGhpczt0LmVhY2goaS5jbGFzc2VzRWxlbWVudExvb2t1cCxmdW5jdGlvbihzLG4pey0xIT09dC5pbkFycmF5KGUudGFyZ2V0LG4pJiYoaS5jbGFzc2VzRWxlbWVudExvb2t1cFtzXT10KG4ubm90KGUudGFyZ2V0KS5nZXQoKSkpfSl9LF9yZW1vdmVDbGFzczpmdW5jdGlvbih0LGUsaSl7cmV0dXJuIHRoaXMuX3RvZ2dsZUNsYXNzKHQsZSxpLCExKX0sX2FkZENsYXNzOmZ1bmN0aW9uKHQsZSxpKXtyZXR1cm4gdGhpcy5fdG9nZ2xlQ2xhc3ModCxlLGksITApfSxfdG9nZ2xlQ2xhc3M6ZnVuY3Rpb24odCxlLGkscyl7cz1cImJvb2xlYW5cIj09dHlwZW9mIHM/czppO3ZhciBuPVwic3RyaW5nXCI9PXR5cGVvZiB0fHxudWxsPT09dCxvPXtleHRyYTpuP2U6aSxrZXlzOm4/dDplLGVsZW1lbnQ6bj90aGlzLmVsZW1lbnQ6dCxhZGQ6c307cmV0dXJuIG8uZWxlbWVudC50b2dnbGVDbGFzcyh0aGlzLl9jbGFzc2VzKG8pLHMpLHRoaXN9LF9vbjpmdW5jdGlvbihlLGkscyl7dmFyIG4sbz10aGlzO1wiYm9vbGVhblwiIT10eXBlb2YgZSYmKHM9aSxpPWUsZT0hMSkscz8oaT1uPXQoaSksdGhpcy5iaW5kaW5ncz10aGlzLmJpbmRpbmdzLmFkZChpKSk6KHM9aSxpPXRoaXMuZWxlbWVudCxuPXRoaXMud2lkZ2V0KCkpLHQuZWFjaChzLGZ1bmN0aW9uKHMsYSl7ZnVuY3Rpb24gcigpe3JldHVybiBlfHxvLm9wdGlvbnMuZGlzYWJsZWQhPT0hMCYmIXQodGhpcykuaGFzQ2xhc3MoXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiKT8oXCJzdHJpbmdcIj09dHlwZW9mIGE/b1thXTphKS5hcHBseShvLGFyZ3VtZW50cyk6dm9pZCAwfVwic3RyaW5nXCIhPXR5cGVvZiBhJiYoci5ndWlkPWEuZ3VpZD1hLmd1aWR8fHIuZ3VpZHx8dC5ndWlkKyspO3ZhciBsPXMubWF0Y2goL14oW1xcdzotXSopXFxzKiguKikkLyksaD1sWzFdK28uZXZlbnROYW1lc3BhY2UsYz1sWzJdO2M/bi5vbihoLGMscik6aS5vbihoLHIpfSl9LF9vZmY6ZnVuY3Rpb24oZSxpKXtpPShpfHxcIlwiKS5zcGxpdChcIiBcIikuam9pbih0aGlzLmV2ZW50TmFtZXNwYWNlK1wiIFwiKSt0aGlzLmV2ZW50TmFtZXNwYWNlLGUub2ZmKGkpLm9mZihpKSx0aGlzLmJpbmRpbmdzPXQodGhpcy5iaW5kaW5ncy5ub3QoZSkuZ2V0KCkpLHRoaXMuZm9jdXNhYmxlPXQodGhpcy5mb2N1c2FibGUubm90KGUpLmdldCgpKSx0aGlzLmhvdmVyYWJsZT10KHRoaXMuaG92ZXJhYmxlLm5vdChlKS5nZXQoKSl9LF9kZWxheTpmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkoKXtyZXR1cm4oXCJzdHJpbmdcIj09dHlwZW9mIHQ/c1t0XTp0KS5hcHBseShzLGFyZ3VtZW50cyl9dmFyIHM9dGhpcztyZXR1cm4gc2V0VGltZW91dChpLGV8fDApfSxfaG92ZXJhYmxlOmZ1bmN0aW9uKGUpe3RoaXMuaG92ZXJhYmxlPXRoaXMuaG92ZXJhYmxlLmFkZChlKSx0aGlzLl9vbihlLHttb3VzZWVudGVyOmZ1bmN0aW9uKGUpe3RoaXMuX2FkZENsYXNzKHQoZS5jdXJyZW50VGFyZ2V0KSxudWxsLFwidWktc3RhdGUtaG92ZXJcIil9LG1vdXNlbGVhdmU6ZnVuY3Rpb24oZSl7dGhpcy5fcmVtb3ZlQ2xhc3ModChlLmN1cnJlbnRUYXJnZXQpLG51bGwsXCJ1aS1zdGF0ZS1ob3ZlclwiKX19KX0sX2ZvY3VzYWJsZTpmdW5jdGlvbihlKXt0aGlzLmZvY3VzYWJsZT10aGlzLmZvY3VzYWJsZS5hZGQoZSksdGhpcy5fb24oZSx7Zm9jdXNpbjpmdW5jdGlvbihlKXt0aGlzLl9hZGRDbGFzcyh0KGUuY3VycmVudFRhcmdldCksbnVsbCxcInVpLXN0YXRlLWZvY3VzXCIpfSxmb2N1c291dDpmdW5jdGlvbihlKXt0aGlzLl9yZW1vdmVDbGFzcyh0KGUuY3VycmVudFRhcmdldCksbnVsbCxcInVpLXN0YXRlLWZvY3VzXCIpfX0pfSxfdHJpZ2dlcjpmdW5jdGlvbihlLGkscyl7dmFyIG4sbyxhPXRoaXMub3B0aW9uc1tlXTtpZihzPXN8fHt9LGk9dC5FdmVudChpKSxpLnR5cGU9KGU9PT10aGlzLndpZGdldEV2ZW50UHJlZml4P2U6dGhpcy53aWRnZXRFdmVudFByZWZpeCtlKS50b0xvd2VyQ2FzZSgpLGkudGFyZ2V0PXRoaXMuZWxlbWVudFswXSxvPWkub3JpZ2luYWxFdmVudClmb3IobiBpbiBvKW4gaW4gaXx8KGlbbl09b1tuXSk7cmV0dXJuIHRoaXMuZWxlbWVudC50cmlnZ2VyKGkscyksISh0LmlzRnVuY3Rpb24oYSkmJmEuYXBwbHkodGhpcy5lbGVtZW50WzBdLFtpXS5jb25jYXQocykpPT09ITF8fGkuaXNEZWZhdWx0UHJldmVudGVkKCkpfX0sdC5lYWNoKHtzaG93OlwiZmFkZUluXCIsaGlkZTpcImZhZGVPdXRcIn0sZnVuY3Rpb24oZSxpKXt0LldpZGdldC5wcm90b3R5cGVbXCJfXCIrZV09ZnVuY3Rpb24ocyxuLG8pe1wic3RyaW5nXCI9PXR5cGVvZiBuJiYobj17ZWZmZWN0Om59KTt2YXIgYSxyPW4/bj09PSEwfHxcIm51bWJlclwiPT10eXBlb2Ygbj9pOm4uZWZmZWN0fHxpOmU7bj1ufHx7fSxcIm51bWJlclwiPT10eXBlb2YgbiYmKG49e2R1cmF0aW9uOm59KSxhPSF0LmlzRW1wdHlPYmplY3Qobiksbi5jb21wbGV0ZT1vLG4uZGVsYXkmJnMuZGVsYXkobi5kZWxheSksYSYmdC5lZmZlY3RzJiZ0LmVmZmVjdHMuZWZmZWN0W3JdP3NbZV0obik6ciE9PWUmJnNbcl0/c1tyXShuLmR1cmF0aW9uLG4uZWFzaW5nLG8pOnMucXVldWUoZnVuY3Rpb24oaSl7dCh0aGlzKVtlXSgpLG8mJm8uY2FsbChzWzBdKSxpKCl9KX19KSx0LndpZGdldCxmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxlLGkpe3JldHVybltwYXJzZUZsb2F0KHRbMF0pKih1LnRlc3QodFswXSk/ZS8xMDA6MSkscGFyc2VGbG9hdCh0WzFdKSoodS50ZXN0KHRbMV0pP2kvMTAwOjEpXX1mdW5jdGlvbiBpKGUsaSl7cmV0dXJuIHBhcnNlSW50KHQuY3NzKGUsaSksMTApfHwwfWZ1bmN0aW9uIHMoZSl7dmFyIGk9ZVswXTtyZXR1cm4gOT09PWkubm9kZVR5cGU/e3dpZHRoOmUud2lkdGgoKSxoZWlnaHQ6ZS5oZWlnaHQoKSxvZmZzZXQ6e3RvcDowLGxlZnQ6MH19OnQuaXNXaW5kb3coaSk/e3dpZHRoOmUud2lkdGgoKSxoZWlnaHQ6ZS5oZWlnaHQoKSxvZmZzZXQ6e3RvcDplLnNjcm9sbFRvcCgpLGxlZnQ6ZS5zY3JvbGxMZWZ0KCl9fTppLnByZXZlbnREZWZhdWx0P3t3aWR0aDowLGhlaWdodDowLG9mZnNldDp7dG9wOmkucGFnZVksbGVmdDppLnBhZ2VYfX06e3dpZHRoOmUub3V0ZXJXaWR0aCgpLGhlaWdodDplLm91dGVySGVpZ2h0KCksb2Zmc2V0OmUub2Zmc2V0KCl9fXZhciBuLG89TWF0aC5tYXgsYT1NYXRoLmFicyxyPS9sZWZ0fGNlbnRlcnxyaWdodC8sbD0vdG9wfGNlbnRlcnxib3R0b20vLGg9L1tcXCtcXC1dXFxkKyhcXC5bXFxkXSspPyU/LyxjPS9eXFx3Ky8sdT0vJSQvLGQ9dC5mbi5wb3NpdGlvbjt0LnBvc2l0aW9uPXtzY3JvbGxiYXJXaWR0aDpmdW5jdGlvbigpe2lmKHZvaWQgMCE9PW4pcmV0dXJuIG47dmFyIGUsaSxzPXQoXCI8ZGl2IHN0eWxlPSdkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjUwcHg7aGVpZ2h0OjUwcHg7b3ZlcmZsb3c6aGlkZGVuOyc+PGRpdiBzdHlsZT0naGVpZ2h0OjEwMHB4O3dpZHRoOmF1dG87Jz48L2Rpdj48L2Rpdj5cIiksbz1zLmNoaWxkcmVuKClbMF07cmV0dXJuIHQoXCJib2R5XCIpLmFwcGVuZChzKSxlPW8ub2Zmc2V0V2lkdGgscy5jc3MoXCJvdmVyZmxvd1wiLFwic2Nyb2xsXCIpLGk9by5vZmZzZXRXaWR0aCxlPT09aSYmKGk9c1swXS5jbGllbnRXaWR0aCkscy5yZW1vdmUoKSxuPWUtaX0sZ2V0U2Nyb2xsSW5mbzpmdW5jdGlvbihlKXt2YXIgaT1lLmlzV2luZG93fHxlLmlzRG9jdW1lbnQ/XCJcIjplLmVsZW1lbnQuY3NzKFwib3ZlcmZsb3cteFwiKSxzPWUuaXNXaW5kb3d8fGUuaXNEb2N1bWVudD9cIlwiOmUuZWxlbWVudC5jc3MoXCJvdmVyZmxvdy15XCIpLG49XCJzY3JvbGxcIj09PWl8fFwiYXV0b1wiPT09aSYmZS53aWR0aDxlLmVsZW1lbnRbMF0uc2Nyb2xsV2lkdGgsbz1cInNjcm9sbFwiPT09c3x8XCJhdXRvXCI9PT1zJiZlLmhlaWdodDxlLmVsZW1lbnRbMF0uc2Nyb2xsSGVpZ2h0O3JldHVybnt3aWR0aDpvP3QucG9zaXRpb24uc2Nyb2xsYmFyV2lkdGgoKTowLGhlaWdodDpuP3QucG9zaXRpb24uc2Nyb2xsYmFyV2lkdGgoKTowfX0sZ2V0V2l0aGluSW5mbzpmdW5jdGlvbihlKXt2YXIgaT10KGV8fHdpbmRvdykscz10LmlzV2luZG93KGlbMF0pLG49ISFpWzBdJiY5PT09aVswXS5ub2RlVHlwZSxvPSFzJiYhbjtyZXR1cm57ZWxlbWVudDppLGlzV2luZG93OnMsaXNEb2N1bWVudDpuLG9mZnNldDpvP3QoZSkub2Zmc2V0KCk6e2xlZnQ6MCx0b3A6MH0sc2Nyb2xsTGVmdDppLnNjcm9sbExlZnQoKSxzY3JvbGxUb3A6aS5zY3JvbGxUb3AoKSx3aWR0aDppLm91dGVyV2lkdGgoKSxoZWlnaHQ6aS5vdXRlckhlaWdodCgpfX19LHQuZm4ucG9zaXRpb249ZnVuY3Rpb24obil7aWYoIW58fCFuLm9mKXJldHVybiBkLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtuPXQuZXh0ZW5kKHt9LG4pO3ZhciB1LHAsZixnLG0sXyx2PXQobi5vZiksYj10LnBvc2l0aW9uLmdldFdpdGhpbkluZm8obi53aXRoaW4pLHk9dC5wb3NpdGlvbi5nZXRTY3JvbGxJbmZvKGIpLHc9KG4uY29sbGlzaW9ufHxcImZsaXBcIikuc3BsaXQoXCIgXCIpLGs9e307cmV0dXJuIF89cyh2KSx2WzBdLnByZXZlbnREZWZhdWx0JiYobi5hdD1cImxlZnQgdG9wXCIpLHA9Xy53aWR0aCxmPV8uaGVpZ2h0LGc9Xy5vZmZzZXQsbT10LmV4dGVuZCh7fSxnKSx0LmVhY2goW1wibXlcIixcImF0XCJdLGZ1bmN0aW9uKCl7dmFyIHQsZSxpPShuW3RoaXNdfHxcIlwiKS5zcGxpdChcIiBcIik7MT09PWkubGVuZ3RoJiYoaT1yLnRlc3QoaVswXSk/aS5jb25jYXQoW1wiY2VudGVyXCJdKTpsLnRlc3QoaVswXSk/W1wiY2VudGVyXCJdLmNvbmNhdChpKTpbXCJjZW50ZXJcIixcImNlbnRlclwiXSksaVswXT1yLnRlc3QoaVswXSk/aVswXTpcImNlbnRlclwiLGlbMV09bC50ZXN0KGlbMV0pP2lbMV06XCJjZW50ZXJcIix0PWguZXhlYyhpWzBdKSxlPWguZXhlYyhpWzFdKSxrW3RoaXNdPVt0P3RbMF06MCxlP2VbMF06MF0sblt0aGlzXT1bYy5leGVjKGlbMF0pWzBdLGMuZXhlYyhpWzFdKVswXV19KSwxPT09dy5sZW5ndGgmJih3WzFdPXdbMF0pLFwicmlnaHRcIj09PW4uYXRbMF0/bS5sZWZ0Kz1wOlwiY2VudGVyXCI9PT1uLmF0WzBdJiYobS5sZWZ0Kz1wLzIpLFwiYm90dG9tXCI9PT1uLmF0WzFdP20udG9wKz1mOlwiY2VudGVyXCI9PT1uLmF0WzFdJiYobS50b3ArPWYvMiksdT1lKGsuYXQscCxmKSxtLmxlZnQrPXVbMF0sbS50b3ArPXVbMV0sdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHMscixsPXQodGhpcyksaD1sLm91dGVyV2lkdGgoKSxjPWwub3V0ZXJIZWlnaHQoKSxkPWkodGhpcyxcIm1hcmdpbkxlZnRcIiksXz1pKHRoaXMsXCJtYXJnaW5Ub3BcIikseD1oK2QraSh0aGlzLFwibWFyZ2luUmlnaHRcIikreS53aWR0aCxDPWMrXytpKHRoaXMsXCJtYXJnaW5Cb3R0b21cIikreS5oZWlnaHQsRD10LmV4dGVuZCh7fSxtKSxUPWUoay5teSxsLm91dGVyV2lkdGgoKSxsLm91dGVySGVpZ2h0KCkpO1wicmlnaHRcIj09PW4ubXlbMF0/RC5sZWZ0LT1oOlwiY2VudGVyXCI9PT1uLm15WzBdJiYoRC5sZWZ0LT1oLzIpLFwiYm90dG9tXCI9PT1uLm15WzFdP0QudG9wLT1jOlwiY2VudGVyXCI9PT1uLm15WzFdJiYoRC50b3AtPWMvMiksRC5sZWZ0Kz1UWzBdLEQudG9wKz1UWzFdLHM9e21hcmdpbkxlZnQ6ZCxtYXJnaW5Ub3A6X30sdC5lYWNoKFtcImxlZnRcIixcInRvcFwiXSxmdW5jdGlvbihlLGkpe3QudWkucG9zaXRpb25bd1tlXV0mJnQudWkucG9zaXRpb25bd1tlXV1baV0oRCx7dGFyZ2V0V2lkdGg6cCx0YXJnZXRIZWlnaHQ6ZixlbGVtV2lkdGg6aCxlbGVtSGVpZ2h0OmMsY29sbGlzaW9uUG9zaXRpb246cyxjb2xsaXNpb25XaWR0aDp4LGNvbGxpc2lvbkhlaWdodDpDLG9mZnNldDpbdVswXStUWzBdLHVbMV0rVFsxXV0sbXk6bi5teSxhdDpuLmF0LHdpdGhpbjpiLGVsZW06bH0pfSksbi51c2luZyYmKHI9ZnVuY3Rpb24odCl7dmFyIGU9Zy5sZWZ0LUQubGVmdCxpPWUrcC1oLHM9Zy50b3AtRC50b3Ascj1zK2YtYyx1PXt0YXJnZXQ6e2VsZW1lbnQ6dixsZWZ0OmcubGVmdCx0b3A6Zy50b3Asd2lkdGg6cCxoZWlnaHQ6Zn0sZWxlbWVudDp7ZWxlbWVudDpsLGxlZnQ6RC5sZWZ0LHRvcDpELnRvcCx3aWR0aDpoLGhlaWdodDpjfSxob3Jpem9udGFsOjA+aT9cImxlZnRcIjplPjA/XCJyaWdodFwiOlwiY2VudGVyXCIsdmVydGljYWw6MD5yP1widG9wXCI6cz4wP1wiYm90dG9tXCI6XCJtaWRkbGVcIn07aD5wJiZwPmEoZStpKSYmKHUuaG9yaXpvbnRhbD1cImNlbnRlclwiKSxjPmYmJmY+YShzK3IpJiYodS52ZXJ0aWNhbD1cIm1pZGRsZVwiKSx1LmltcG9ydGFudD1vKGEoZSksYShpKSk+byhhKHMpLGEocikpP1wiaG9yaXpvbnRhbFwiOlwidmVydGljYWxcIixuLnVzaW5nLmNhbGwodGhpcyx0LHUpfSksbC5vZmZzZXQodC5leHRlbmQoRCx7dXNpbmc6cn0pKX0pfSx0LnVpLnBvc2l0aW9uPXtmaXQ6e2xlZnQ6ZnVuY3Rpb24odCxlKXt2YXIgaSxzPWUud2l0aGluLG49cy5pc1dpbmRvdz9zLnNjcm9sbExlZnQ6cy5vZmZzZXQubGVmdCxhPXMud2lkdGgscj10LmxlZnQtZS5jb2xsaXNpb25Qb3NpdGlvbi5tYXJnaW5MZWZ0LGw9bi1yLGg9citlLmNvbGxpc2lvbldpZHRoLWEtbjtlLmNvbGxpc2lvbldpZHRoPmE/bD4wJiYwPj1oPyhpPXQubGVmdCtsK2UuY29sbGlzaW9uV2lkdGgtYS1uLHQubGVmdCs9bC1pKTp0LmxlZnQ9aD4wJiYwPj1sP246bD5oP24rYS1lLmNvbGxpc2lvbldpZHRoOm46bD4wP3QubGVmdCs9bDpoPjA/dC5sZWZ0LT1oOnQubGVmdD1vKHQubGVmdC1yLHQubGVmdCl9LHRvcDpmdW5jdGlvbih0LGUpe3ZhciBpLHM9ZS53aXRoaW4sbj1zLmlzV2luZG93P3Muc2Nyb2xsVG9wOnMub2Zmc2V0LnRvcCxhPWUud2l0aGluLmhlaWdodCxyPXQudG9wLWUuY29sbGlzaW9uUG9zaXRpb24ubWFyZ2luVG9wLGw9bi1yLGg9citlLmNvbGxpc2lvbkhlaWdodC1hLW47ZS5jb2xsaXNpb25IZWlnaHQ+YT9sPjAmJjA+PWg/KGk9dC50b3ArbCtlLmNvbGxpc2lvbkhlaWdodC1hLW4sdC50b3ArPWwtaSk6dC50b3A9aD4wJiYwPj1sP246bD5oP24rYS1lLmNvbGxpc2lvbkhlaWdodDpuOmw+MD90LnRvcCs9bDpoPjA/dC50b3AtPWg6dC50b3A9byh0LnRvcC1yLHQudG9wKX19LGZsaXA6e2xlZnQ6ZnVuY3Rpb24odCxlKXt2YXIgaSxzLG49ZS53aXRoaW4sbz1uLm9mZnNldC5sZWZ0K24uc2Nyb2xsTGVmdCxyPW4ud2lkdGgsbD1uLmlzV2luZG93P24uc2Nyb2xsTGVmdDpuLm9mZnNldC5sZWZ0LGg9dC5sZWZ0LWUuY29sbGlzaW9uUG9zaXRpb24ubWFyZ2luTGVmdCxjPWgtbCx1PWgrZS5jb2xsaXNpb25XaWR0aC1yLWwsZD1cImxlZnRcIj09PWUubXlbMF0/LWUuZWxlbVdpZHRoOlwicmlnaHRcIj09PWUubXlbMF0/ZS5lbGVtV2lkdGg6MCxwPVwibGVmdFwiPT09ZS5hdFswXT9lLnRhcmdldFdpZHRoOlwicmlnaHRcIj09PWUuYXRbMF0/LWUudGFyZ2V0V2lkdGg6MCxmPS0yKmUub2Zmc2V0WzBdOzA+Yz8oaT10LmxlZnQrZCtwK2YrZS5jb2xsaXNpb25XaWR0aC1yLW8sKDA+aXx8YShjKT5pKSYmKHQubGVmdCs9ZCtwK2YpKTp1PjAmJihzPXQubGVmdC1lLmNvbGxpc2lvblBvc2l0aW9uLm1hcmdpbkxlZnQrZCtwK2YtbCwocz4wfHx1PmEocykpJiYodC5sZWZ0Kz1kK3ArZikpfSx0b3A6ZnVuY3Rpb24odCxlKXt2YXIgaSxzLG49ZS53aXRoaW4sbz1uLm9mZnNldC50b3Arbi5zY3JvbGxUb3Ascj1uLmhlaWdodCxsPW4uaXNXaW5kb3c/bi5zY3JvbGxUb3A6bi5vZmZzZXQudG9wLGg9dC50b3AtZS5jb2xsaXNpb25Qb3NpdGlvbi5tYXJnaW5Ub3AsYz1oLWwsdT1oK2UuY29sbGlzaW9uSGVpZ2h0LXItbCxkPVwidG9wXCI9PT1lLm15WzFdLHA9ZD8tZS5lbGVtSGVpZ2h0OlwiYm90dG9tXCI9PT1lLm15WzFdP2UuZWxlbUhlaWdodDowLGY9XCJ0b3BcIj09PWUuYXRbMV0/ZS50YXJnZXRIZWlnaHQ6XCJib3R0b21cIj09PWUuYXRbMV0/LWUudGFyZ2V0SGVpZ2h0OjAsZz0tMiplLm9mZnNldFsxXTswPmM/KHM9dC50b3ArcCtmK2crZS5jb2xsaXNpb25IZWlnaHQtci1vLCgwPnN8fGEoYyk+cykmJih0LnRvcCs9cCtmK2cpKTp1PjAmJihpPXQudG9wLWUuY29sbGlzaW9uUG9zaXRpb24ubWFyZ2luVG9wK3ArZitnLWwsKGk+MHx8dT5hKGkpKSYmKHQudG9wKz1wK2YrZykpfX0sZmxpcGZpdDp7bGVmdDpmdW5jdGlvbigpe3QudWkucG9zaXRpb24uZmxpcC5sZWZ0LmFwcGx5KHRoaXMsYXJndW1lbnRzKSx0LnVpLnBvc2l0aW9uLmZpdC5sZWZ0LmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sdG9wOmZ1bmN0aW9uKCl7dC51aS5wb3NpdGlvbi5mbGlwLnRvcC5hcHBseSh0aGlzLGFyZ3VtZW50cyksdC51aS5wb3NpdGlvbi5maXQudG9wLmFwcGx5KHRoaXMsYXJndW1lbnRzKX19fX0oKSx0LnVpLnBvc2l0aW9uLHQuZm4uZm9ybT1mdW5jdGlvbigpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0aGlzWzBdLmZvcm0/dGhpcy5jbG9zZXN0KFwiZm9ybVwiKTp0KHRoaXNbMF0uZm9ybSl9LHQudWkuZm9ybVJlc2V0TWl4aW49e19mb3JtUmVzZXRIYW5kbGVyOmZ1bmN0aW9uKCl7dmFyIGU9dCh0aGlzKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dmFyIGk9ZS5kYXRhKFwidWktZm9ybS1yZXNldC1pbnN0YW5jZXNcIik7dC5lYWNoKGksZnVuY3Rpb24oKXt0aGlzLnJlZnJlc2goKX0pfSl9LF9iaW5kRm9ybVJlc2V0SGFuZGxlcjpmdW5jdGlvbigpe2lmKHRoaXMuZm9ybT10aGlzLmVsZW1lbnQuZm9ybSgpLHRoaXMuZm9ybS5sZW5ndGgpe3ZhciB0PXRoaXMuZm9ybS5kYXRhKFwidWktZm9ybS1yZXNldC1pbnN0YW5jZXNcIil8fFtdO3QubGVuZ3RofHx0aGlzLmZvcm0ub24oXCJyZXNldC51aS1mb3JtLXJlc2V0XCIsdGhpcy5fZm9ybVJlc2V0SGFuZGxlciksdC5wdXNoKHRoaXMpLHRoaXMuZm9ybS5kYXRhKFwidWktZm9ybS1yZXNldC1pbnN0YW5jZXNcIix0KX19LF91bmJpbmRGb3JtUmVzZXRIYW5kbGVyOmZ1bmN0aW9uKCl7aWYodGhpcy5mb3JtLmxlbmd0aCl7dmFyIGU9dGhpcy5mb3JtLmRhdGEoXCJ1aS1mb3JtLXJlc2V0LWluc3RhbmNlc1wiKTtlLnNwbGljZSh0LmluQXJyYXkodGhpcyxlKSwxKSxlLmxlbmd0aD90aGlzLmZvcm0uZGF0YShcInVpLWZvcm0tcmVzZXQtaW5zdGFuY2VzXCIsZSk6dGhpcy5mb3JtLnJlbW92ZURhdGEoXCJ1aS1mb3JtLXJlc2V0LWluc3RhbmNlc1wiKS5vZmYoXCJyZXNldC51aS1mb3JtLXJlc2V0XCIpfX19LHQudWkua2V5Q29kZT17QkFDS1NQQUNFOjgsQ09NTUE6MTg4LERFTEVURTo0NixET1dOOjQwLEVORDozNSxFTlRFUjoxMyxFU0NBUEU6MjcsSE9NRTozNixMRUZUOjM3LFBBR0VfRE9XTjozNCxQQUdFX1VQOjMzLFBFUklPRDoxOTAsUklHSFQ6MzksU1BBQ0U6MzIsVEFCOjksVVA6Mzh9LHQudWkuZXNjYXBlU2VsZWN0b3I9ZnVuY3Rpb24oKXt2YXIgdD0vKFshXCIjJCUmJygpKissLi86Ozw9Pj9AW1xcXV5ge3x9fl0pL2c7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiBlLnJlcGxhY2UodCxcIlxcXFwkMVwiKX19KCksdC5mbi5sYWJlbHM9ZnVuY3Rpb24oKXt2YXIgZSxpLHMsbixvO3JldHVybiB0aGlzWzBdLmxhYmVscyYmdGhpc1swXS5sYWJlbHMubGVuZ3RoP3RoaXMucHVzaFN0YWNrKHRoaXNbMF0ubGFiZWxzKToobj10aGlzLmVxKDApLnBhcmVudHMoXCJsYWJlbFwiKSxzPXRoaXMuYXR0cihcImlkXCIpLHMmJihlPXRoaXMuZXEoMCkucGFyZW50cygpLmxhc3QoKSxvPWUuYWRkKGUubGVuZ3RoP2Uuc2libGluZ3MoKTp0aGlzLnNpYmxpbmdzKCkpLGk9XCJsYWJlbFtmb3I9J1wiK3QudWkuZXNjYXBlU2VsZWN0b3IocykrXCInXVwiLG49bi5hZGQoby5maW5kKGkpLmFkZEJhY2soaSkpKSx0aGlzLnB1c2hTdGFjayhuKSl9LHQuZm4uZXh0ZW5kKHt1bmlxdWVJZDpmdW5jdGlvbigpe3ZhciB0PTA7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3RoaXMuaWR8fCh0aGlzLmlkPVwidWktaWQtXCIrICsrdCl9KX19KCkscmVtb3ZlVW5pcXVlSWQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7L151aS1pZC1cXGQrJC8udGVzdCh0aGlzLmlkKSYmdCh0aGlzKS5yZW1vdmVBdHRyKFwiaWRcIil9KX19KSx0LnVpLnNhZmVBY3RpdmVFbGVtZW50PWZ1bmN0aW9uKHQpe3ZhciBlO3RyeXtlPXQuYWN0aXZlRWxlbWVudH1jYXRjaChpKXtlPXQuYm9keX1yZXR1cm4gZXx8KGU9dC5ib2R5KSxlLm5vZGVOYW1lfHwoZT10LmJvZHkpLGV9LHQud2lkZ2V0KFwidWkubWVudVwiLHt2ZXJzaW9uOlwiMS4xMi4xXCIsZGVmYXVsdEVsZW1lbnQ6XCI8dWw+XCIsZGVsYXk6MzAwLG9wdGlvbnM6e2ljb25zOntzdWJtZW51OlwidWktaWNvbi1jYXJldC0xLWVcIn0saXRlbXM6XCI+ICpcIixtZW51czpcInVsXCIscG9zaXRpb246e215OlwibGVmdCB0b3BcIixhdDpcInJpZ2h0IHRvcFwifSxyb2xlOlwibWVudVwiLGJsdXI6bnVsbCxmb2N1czpudWxsLHNlbGVjdDpudWxsfSxfY3JlYXRlOmZ1bmN0aW9uKCl7dGhpcy5hY3RpdmVNZW51PXRoaXMuZWxlbWVudCx0aGlzLm1vdXNlSGFuZGxlZD0hMSx0aGlzLmVsZW1lbnQudW5pcXVlSWQoKS5hdHRyKHtyb2xlOnRoaXMub3B0aW9ucy5yb2xlLHRhYkluZGV4OjB9KSx0aGlzLl9hZGRDbGFzcyhcInVpLW1lbnVcIixcInVpLXdpZGdldCB1aS13aWRnZXQtY29udGVudFwiKSx0aGlzLl9vbih7XCJtb3VzZWRvd24gLnVpLW1lbnUtaXRlbVwiOmZ1bmN0aW9uKHQpe3QucHJldmVudERlZmF1bHQoKX0sXCJjbGljayAudWktbWVudS1pdGVtXCI6ZnVuY3Rpb24oZSl7dmFyIGk9dChlLnRhcmdldCkscz10KHQudWkuc2FmZUFjdGl2ZUVsZW1lbnQodGhpcy5kb2N1bWVudFswXSkpOyF0aGlzLm1vdXNlSGFuZGxlZCYmaS5ub3QoXCIudWktc3RhdGUtZGlzYWJsZWRcIikubGVuZ3RoJiYodGhpcy5zZWxlY3QoZSksZS5pc1Byb3BhZ2F0aW9uU3RvcHBlZCgpfHwodGhpcy5tb3VzZUhhbmRsZWQ9ITApLGkuaGFzKFwiLnVpLW1lbnVcIikubGVuZ3RoP3RoaXMuZXhwYW5kKGUpOiF0aGlzLmVsZW1lbnQuaXMoXCI6Zm9jdXNcIikmJnMuY2xvc2VzdChcIi51aS1tZW51XCIpLmxlbmd0aCYmKHRoaXMuZWxlbWVudC50cmlnZ2VyKFwiZm9jdXNcIixbITBdKSx0aGlzLmFjdGl2ZSYmMT09PXRoaXMuYWN0aXZlLnBhcmVudHMoXCIudWktbWVudVwiKS5sZW5ndGgmJmNsZWFyVGltZW91dCh0aGlzLnRpbWVyKSkpfSxcIm1vdXNlZW50ZXIgLnVpLW1lbnUtaXRlbVwiOmZ1bmN0aW9uKGUpe2lmKCF0aGlzLnByZXZpb3VzRmlsdGVyKXt2YXIgaT10KGUudGFyZ2V0KS5jbG9zZXN0KFwiLnVpLW1lbnUtaXRlbVwiKSxzPXQoZS5jdXJyZW50VGFyZ2V0KTtpWzBdPT09c1swXSYmKHRoaXMuX3JlbW92ZUNsYXNzKHMuc2libGluZ3MoKS5jaGlsZHJlbihcIi51aS1zdGF0ZS1hY3RpdmVcIiksbnVsbCxcInVpLXN0YXRlLWFjdGl2ZVwiKSx0aGlzLmZvY3VzKGUscykpfX0sbW91c2VsZWF2ZTpcImNvbGxhcHNlQWxsXCIsXCJtb3VzZWxlYXZlIC51aS1tZW51XCI6XCJjb2xsYXBzZUFsbFwiLGZvY3VzOmZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5hY3RpdmV8fHRoaXMuZWxlbWVudC5maW5kKHRoaXMub3B0aW9ucy5pdGVtcykuZXEoMCk7ZXx8dGhpcy5mb2N1cyh0LGkpfSxibHVyOmZ1bmN0aW9uKGUpe3RoaXMuX2RlbGF5KGZ1bmN0aW9uKCl7dmFyIGk9IXQuY29udGFpbnModGhpcy5lbGVtZW50WzBdLHQudWkuc2FmZUFjdGl2ZUVsZW1lbnQodGhpcy5kb2N1bWVudFswXSkpO2kmJnRoaXMuY29sbGFwc2VBbGwoZSl9KX0sa2V5ZG93bjpcIl9rZXlkb3duXCJ9KSx0aGlzLnJlZnJlc2goKSx0aGlzLl9vbih0aGlzLmRvY3VtZW50LHtjbGljazpmdW5jdGlvbih0KXt0aGlzLl9jbG9zZU9uRG9jdW1lbnRDbGljayh0KSYmdGhpcy5jb2xsYXBzZUFsbCh0KSx0aGlzLm1vdXNlSGFuZGxlZD0hMX19KX0sX2Rlc3Ryb3k6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLmVsZW1lbnQuZmluZChcIi51aS1tZW51LWl0ZW1cIikucmVtb3ZlQXR0cihcInJvbGUgYXJpYS1kaXNhYmxlZFwiKSxpPWUuY2hpbGRyZW4oXCIudWktbWVudS1pdGVtLXdyYXBwZXJcIikucmVtb3ZlVW5pcXVlSWQoKS5yZW1vdmVBdHRyKFwidGFiSW5kZXggcm9sZSBhcmlhLWhhc3BvcHVwXCIpO3RoaXMuZWxlbWVudC5yZW1vdmVBdHRyKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIpLmZpbmQoXCIudWktbWVudVwiKS5hZGRCYWNrKCkucmVtb3ZlQXR0cihcInJvbGUgYXJpYS1sYWJlbGxlZGJ5IGFyaWEtZXhwYW5kZWQgYXJpYS1oaWRkZW4gYXJpYS1kaXNhYmxlZCB0YWJJbmRleFwiKS5yZW1vdmVVbmlxdWVJZCgpLnNob3coKSxpLmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbigpe3ZhciBlPXQodGhpcyk7ZS5kYXRhKFwidWktbWVudS1zdWJtZW51LWNhcmV0XCIpJiZlLnJlbW92ZSgpfSl9LF9rZXlkb3duOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbixvLGE9ITA7c3dpdGNoKGUua2V5Q29kZSl7Y2FzZSB0LnVpLmtleUNvZGUuUEFHRV9VUDp0aGlzLnByZXZpb3VzUGFnZShlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5QQUdFX0RPV046dGhpcy5uZXh0UGFnZShlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5IT01FOnRoaXMuX21vdmUoXCJmaXJzdFwiLFwiZmlyc3RcIixlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5FTkQ6dGhpcy5fbW92ZShcImxhc3RcIixcImxhc3RcIixlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5VUDp0aGlzLnByZXZpb3VzKGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkRPV046dGhpcy5uZXh0KGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkxFRlQ6dGhpcy5jb2xsYXBzZShlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5SSUdIVDp0aGlzLmFjdGl2ZSYmIXRoaXMuYWN0aXZlLmlzKFwiLnVpLXN0YXRlLWRpc2FibGVkXCIpJiZ0aGlzLmV4cGFuZChlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5FTlRFUjpjYXNlIHQudWkua2V5Q29kZS5TUEFDRTp0aGlzLl9hY3RpdmF0ZShlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5FU0NBUEU6dGhpcy5jb2xsYXBzZShlKTticmVhaztkZWZhdWx0OmE9ITEscz10aGlzLnByZXZpb3VzRmlsdGVyfHxcIlwiLG89ITEsbj1lLmtleUNvZGU+PTk2JiYxMDU+PWUua2V5Q29kZT9cIlwiKyhlLmtleUNvZGUtOTYpOlN0cmluZy5mcm9tQ2hhckNvZGUoZS5rZXlDb2RlKSxjbGVhclRpbWVvdXQodGhpcy5maWx0ZXJUaW1lciksbj09PXM/bz0hMDpuPXMrbixpPXRoaXMuX2ZpbHRlck1lbnVJdGVtcyhuKSxpPW8mJi0xIT09aS5pbmRleCh0aGlzLmFjdGl2ZS5uZXh0KCkpP3RoaXMuYWN0aXZlLm5leHRBbGwoXCIudWktbWVudS1pdGVtXCIpOmksaS5sZW5ndGh8fChuPVN0cmluZy5mcm9tQ2hhckNvZGUoZS5rZXlDb2RlKSxpPXRoaXMuX2ZpbHRlck1lbnVJdGVtcyhuKSksaS5sZW5ndGg/KHRoaXMuZm9jdXMoZSxpKSx0aGlzLnByZXZpb3VzRmlsdGVyPW4sdGhpcy5maWx0ZXJUaW1lcj10aGlzLl9kZWxheShmdW5jdGlvbigpe2RlbGV0ZSB0aGlzLnByZXZpb3VzRmlsdGVyfSwxZTMpKTpkZWxldGUgdGhpcy5wcmV2aW91c0ZpbHRlcn1hJiZlLnByZXZlbnREZWZhdWx0KCl9LF9hY3RpdmF0ZTpmdW5jdGlvbih0KXt0aGlzLmFjdGl2ZSYmIXRoaXMuYWN0aXZlLmlzKFwiLnVpLXN0YXRlLWRpc2FibGVkXCIpJiYodGhpcy5hY3RpdmUuY2hpbGRyZW4oXCJbYXJpYS1oYXNwb3B1cD0ndHJ1ZSddXCIpLmxlbmd0aD90aGlzLmV4cGFuZCh0KTp0aGlzLnNlbGVjdCh0KSl9LHJlZnJlc2g6ZnVuY3Rpb24oKXt2YXIgZSxpLHMsbixvLGE9dGhpcyxyPXRoaXMub3B0aW9ucy5pY29ucy5zdWJtZW51LGw9dGhpcy5lbGVtZW50LmZpbmQodGhpcy5vcHRpb25zLm1lbnVzKTt0aGlzLl90b2dnbGVDbGFzcyhcInVpLW1lbnUtaWNvbnNcIixudWxsLCEhdGhpcy5lbGVtZW50LmZpbmQoXCIudWktaWNvblwiKS5sZW5ndGgpLHM9bC5maWx0ZXIoXCI6bm90KC51aS1tZW51KVwiKS5oaWRlKCkuYXR0cih7cm9sZTp0aGlzLm9wdGlvbnMucm9sZSxcImFyaWEtaGlkZGVuXCI6XCJ0cnVlXCIsXCJhcmlhLWV4cGFuZGVkXCI6XCJmYWxzZVwifSkuZWFjaChmdW5jdGlvbigpe3ZhciBlPXQodGhpcyksaT1lLnByZXYoKSxzPXQoXCI8c3Bhbj5cIikuZGF0YShcInVpLW1lbnUtc3VibWVudS1jYXJldFwiLCEwKTthLl9hZGRDbGFzcyhzLFwidWktbWVudS1pY29uXCIsXCJ1aS1pY29uIFwiK3IpLGkuYXR0cihcImFyaWEtaGFzcG9wdXBcIixcInRydWVcIikucHJlcGVuZChzKSxlLmF0dHIoXCJhcmlhLWxhYmVsbGVkYnlcIixpLmF0dHIoXCJpZFwiKSl9KSx0aGlzLl9hZGRDbGFzcyhzLFwidWktbWVudVwiLFwidWktd2lkZ2V0IHVpLXdpZGdldC1jb250ZW50IHVpLWZyb250XCIpLGU9bC5hZGQodGhpcy5lbGVtZW50KSxpPWUuZmluZCh0aGlzLm9wdGlvbnMuaXRlbXMpLGkubm90KFwiLnVpLW1lbnUtaXRlbVwiKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9dCh0aGlzKTthLl9pc0RpdmlkZXIoZSkmJmEuX2FkZENsYXNzKGUsXCJ1aS1tZW51LWRpdmlkZXJcIixcInVpLXdpZGdldC1jb250ZW50XCIpfSksbj1pLm5vdChcIi51aS1tZW51LWl0ZW0sIC51aS1tZW51LWRpdmlkZXJcIiksbz1uLmNoaWxkcmVuKCkubm90KFwiLnVpLW1lbnVcIikudW5pcXVlSWQoKS5hdHRyKHt0YWJJbmRleDotMSxyb2xlOnRoaXMuX2l0ZW1Sb2xlKCl9KSx0aGlzLl9hZGRDbGFzcyhuLFwidWktbWVudS1pdGVtXCIpLl9hZGRDbGFzcyhvLFwidWktbWVudS1pdGVtLXdyYXBwZXJcIiksaS5maWx0ZXIoXCIudWktc3RhdGUtZGlzYWJsZWRcIikuYXR0cihcImFyaWEtZGlzYWJsZWRcIixcInRydWVcIiksdGhpcy5hY3RpdmUmJiF0LmNvbnRhaW5zKHRoaXMuZWxlbWVudFswXSx0aGlzLmFjdGl2ZVswXSkmJnRoaXMuYmx1cigpfSxfaXRlbVJvbGU6ZnVuY3Rpb24oKXtyZXR1cm57bWVudTpcIm1lbnVpdGVtXCIsbGlzdGJveDpcIm9wdGlvblwifVt0aGlzLm9wdGlvbnMucm9sZV19LF9zZXRPcHRpb246ZnVuY3Rpb24odCxlKXtpZihcImljb25zXCI9PT10KXt2YXIgaT10aGlzLmVsZW1lbnQuZmluZChcIi51aS1tZW51LWljb25cIik7dGhpcy5fcmVtb3ZlQ2xhc3MoaSxudWxsLHRoaXMub3B0aW9ucy5pY29ucy5zdWJtZW51KS5fYWRkQ2xhc3MoaSxudWxsLGUuc3VibWVudSl9dGhpcy5fc3VwZXIodCxlKX0sX3NldE9wdGlvbkRpc2FibGVkOmZ1bmN0aW9uKHQpe3RoaXMuX3N1cGVyKHQpLHRoaXMuZWxlbWVudC5hdHRyKFwiYXJpYS1kaXNhYmxlZFwiLHQrXCJcIiksdGhpcy5fdG9nZ2xlQ2xhc3MobnVsbCxcInVpLXN0YXRlLWRpc2FibGVkXCIsISF0KX0sZm9jdXM6ZnVuY3Rpb24odCxlKXt2YXIgaSxzLG47dGhpcy5ibHVyKHQsdCYmXCJmb2N1c1wiPT09dC50eXBlKSx0aGlzLl9zY3JvbGxJbnRvVmlldyhlKSx0aGlzLmFjdGl2ZT1lLmZpcnN0KCkscz10aGlzLmFjdGl2ZS5jaGlsZHJlbihcIi51aS1tZW51LWl0ZW0td3JhcHBlclwiKSx0aGlzLl9hZGRDbGFzcyhzLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksdGhpcy5vcHRpb25zLnJvbGUmJnRoaXMuZWxlbWVudC5hdHRyKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIscy5hdHRyKFwiaWRcIikpLG49dGhpcy5hY3RpdmUucGFyZW50KCkuY2xvc2VzdChcIi51aS1tZW51LWl0ZW1cIikuY2hpbGRyZW4oXCIudWktbWVudS1pdGVtLXdyYXBwZXJcIiksdGhpcy5fYWRkQ2xhc3MobixudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpLHQmJlwia2V5ZG93blwiPT09dC50eXBlP3RoaXMuX2Nsb3NlKCk6dGhpcy50aW1lcj10aGlzLl9kZWxheShmdW5jdGlvbigpe3RoaXMuX2Nsb3NlKCl9LHRoaXMuZGVsYXkpLGk9ZS5jaGlsZHJlbihcIi51aS1tZW51XCIpLGkubGVuZ3RoJiZ0JiYvXm1vdXNlLy50ZXN0KHQudHlwZSkmJnRoaXMuX3N0YXJ0T3BlbmluZyhpKSx0aGlzLmFjdGl2ZU1lbnU9ZS5wYXJlbnQoKSx0aGlzLl90cmlnZ2VyKFwiZm9jdXNcIix0LHtpdGVtOmV9KX0sX3Njcm9sbEludG9WaWV3OmZ1bmN0aW9uKGUpe3ZhciBpLHMsbixvLGEscjt0aGlzLl9oYXNTY3JvbGwoKSYmKGk9cGFyc2VGbG9hdCh0LmNzcyh0aGlzLmFjdGl2ZU1lbnVbMF0sXCJib3JkZXJUb3BXaWR0aFwiKSl8fDAscz1wYXJzZUZsb2F0KHQuY3NzKHRoaXMuYWN0aXZlTWVudVswXSxcInBhZGRpbmdUb3BcIikpfHwwLG49ZS5vZmZzZXQoKS50b3AtdGhpcy5hY3RpdmVNZW51Lm9mZnNldCgpLnRvcC1pLXMsbz10aGlzLmFjdGl2ZU1lbnUuc2Nyb2xsVG9wKCksYT10aGlzLmFjdGl2ZU1lbnUuaGVpZ2h0KCkscj1lLm91dGVySGVpZ2h0KCksMD5uP3RoaXMuYWN0aXZlTWVudS5zY3JvbGxUb3AobytuKTpuK3I+YSYmdGhpcy5hY3RpdmVNZW51LnNjcm9sbFRvcChvK24tYStyKSl9LGJsdXI6ZnVuY3Rpb24odCxlKXtlfHxjbGVhclRpbWVvdXQodGhpcy50aW1lciksdGhpcy5hY3RpdmUmJih0aGlzLl9yZW1vdmVDbGFzcyh0aGlzLmFjdGl2ZS5jaGlsZHJlbihcIi51aS1tZW51LWl0ZW0td3JhcHBlclwiKSxudWxsLFwidWktc3RhdGUtYWN0aXZlXCIpLHRoaXMuX3RyaWdnZXIoXCJibHVyXCIsdCx7aXRlbTp0aGlzLmFjdGl2ZX0pLHRoaXMuYWN0aXZlPW51bGwpfSxfc3RhcnRPcGVuaW5nOmZ1bmN0aW9uKHQpe2NsZWFyVGltZW91dCh0aGlzLnRpbWVyKSxcInRydWVcIj09PXQuYXR0cihcImFyaWEtaGlkZGVuXCIpJiYodGhpcy50aW1lcj10aGlzLl9kZWxheShmdW5jdGlvbigpe3RoaXMuX2Nsb3NlKCksdGhpcy5fb3Blbih0KX0sdGhpcy5kZWxheSkpfSxfb3BlbjpmdW5jdGlvbihlKXt2YXIgaT10LmV4dGVuZCh7b2Y6dGhpcy5hY3RpdmV9LHRoaXMub3B0aW9ucy5wb3NpdGlvbik7Y2xlYXJUaW1lb3V0KHRoaXMudGltZXIpLHRoaXMuZWxlbWVudC5maW5kKFwiLnVpLW1lbnVcIikubm90KGUucGFyZW50cyhcIi51aS1tZW51XCIpKS5oaWRlKCkuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpLGUuc2hvdygpLnJlbW92ZUF0dHIoXCJhcmlhLWhpZGRlblwiKS5hdHRyKFwiYXJpYS1leHBhbmRlZFwiLFwidHJ1ZVwiKS5wb3NpdGlvbihpKX0sY29sbGFwc2VBbGw6ZnVuY3Rpb24oZSxpKXtjbGVhclRpbWVvdXQodGhpcy50aW1lciksdGhpcy50aW1lcj10aGlzLl9kZWxheShmdW5jdGlvbigpe3ZhciBzPWk/dGhpcy5lbGVtZW50OnQoZSYmZS50YXJnZXQpLmNsb3Nlc3QodGhpcy5lbGVtZW50LmZpbmQoXCIudWktbWVudVwiKSk7cy5sZW5ndGh8fChzPXRoaXMuZWxlbWVudCksdGhpcy5fY2xvc2UocyksdGhpcy5ibHVyKGUpLHRoaXMuX3JlbW92ZUNsYXNzKHMuZmluZChcIi51aS1zdGF0ZS1hY3RpdmVcIiksbnVsbCxcInVpLXN0YXRlLWFjdGl2ZVwiKSx0aGlzLmFjdGl2ZU1lbnU9c30sdGhpcy5kZWxheSl9LF9jbG9zZTpmdW5jdGlvbih0KXt0fHwodD10aGlzLmFjdGl2ZT90aGlzLmFjdGl2ZS5wYXJlbnQoKTp0aGlzLmVsZW1lbnQpLHQuZmluZChcIi51aS1tZW51XCIpLmhpZGUoKS5hdHRyKFwiYXJpYS1oaWRkZW5cIixcInRydWVcIikuYXR0cihcImFyaWEtZXhwYW5kZWRcIixcImZhbHNlXCIpfSxfY2xvc2VPbkRvY3VtZW50Q2xpY2s6ZnVuY3Rpb24oZSl7cmV0dXJuIXQoZS50YXJnZXQpLmNsb3Nlc3QoXCIudWktbWVudVwiKS5sZW5ndGh9LF9pc0RpdmlkZXI6ZnVuY3Rpb24odCl7cmV0dXJuIS9bXlxcLVxcdTIwMTRcXHUyMDEzXFxzXS8udGVzdCh0LnRleHQoKSl9LGNvbGxhcHNlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuYWN0aXZlJiZ0aGlzLmFjdGl2ZS5wYXJlbnQoKS5jbG9zZXN0KFwiLnVpLW1lbnUtaXRlbVwiLHRoaXMuZWxlbWVudCk7ZSYmZS5sZW5ndGgmJih0aGlzLl9jbG9zZSgpLHRoaXMuZm9jdXModCxlKSl9LGV4cGFuZDpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmFjdGl2ZSYmdGhpcy5hY3RpdmUuY2hpbGRyZW4oXCIudWktbWVudSBcIikuZmluZCh0aGlzLm9wdGlvbnMuaXRlbXMpLmZpcnN0KCk7ZSYmZS5sZW5ndGgmJih0aGlzLl9vcGVuKGUucGFyZW50KCkpLHRoaXMuX2RlbGF5KGZ1bmN0aW9uKCl7dGhpcy5mb2N1cyh0LGUpfSkpfSxuZXh0OmZ1bmN0aW9uKHQpe3RoaXMuX21vdmUoXCJuZXh0XCIsXCJmaXJzdFwiLHQpfSxwcmV2aW91czpmdW5jdGlvbih0KXt0aGlzLl9tb3ZlKFwicHJldlwiLFwibGFzdFwiLHQpfSxpc0ZpcnN0SXRlbTpmdW5jdGlvbigpe3JldHVybiB0aGlzLmFjdGl2ZSYmIXRoaXMuYWN0aXZlLnByZXZBbGwoXCIudWktbWVudS1pdGVtXCIpLmxlbmd0aH0saXNMYXN0SXRlbTpmdW5jdGlvbigpe3JldHVybiB0aGlzLmFjdGl2ZSYmIXRoaXMuYWN0aXZlLm5leHRBbGwoXCIudWktbWVudS1pdGVtXCIpLmxlbmd0aH0sX21vdmU6ZnVuY3Rpb24odCxlLGkpe3ZhciBzO3RoaXMuYWN0aXZlJiYocz1cImZpcnN0XCI9PT10fHxcImxhc3RcIj09PXQ/dGhpcy5hY3RpdmVbXCJmaXJzdFwiPT09dD9cInByZXZBbGxcIjpcIm5leHRBbGxcIl0oXCIudWktbWVudS1pdGVtXCIpLmVxKC0xKTp0aGlzLmFjdGl2ZVt0K1wiQWxsXCJdKFwiLnVpLW1lbnUtaXRlbVwiKS5lcSgwKSkscyYmcy5sZW5ndGgmJnRoaXMuYWN0aXZlfHwocz10aGlzLmFjdGl2ZU1lbnUuZmluZCh0aGlzLm9wdGlvbnMuaXRlbXMpW2VdKCkpLHRoaXMuZm9jdXMoaSxzKX0sbmV4dFBhZ2U6ZnVuY3Rpb24oZSl7dmFyIGkscyxuO3JldHVybiB0aGlzLmFjdGl2ZT8odGhpcy5pc0xhc3RJdGVtKCl8fCh0aGlzLl9oYXNTY3JvbGwoKT8ocz10aGlzLmFjdGl2ZS5vZmZzZXQoKS50b3Asbj10aGlzLmVsZW1lbnQuaGVpZ2h0KCksdGhpcy5hY3RpdmUubmV4dEFsbChcIi51aS1tZW51LWl0ZW1cIikuZWFjaChmdW5jdGlvbigpe3JldHVybiBpPXQodGhpcyksMD5pLm9mZnNldCgpLnRvcC1zLW59KSx0aGlzLmZvY3VzKGUsaSkpOnRoaXMuZm9jdXMoZSx0aGlzLmFjdGl2ZU1lbnUuZmluZCh0aGlzLm9wdGlvbnMuaXRlbXMpW3RoaXMuYWN0aXZlP1wibGFzdFwiOlwiZmlyc3RcIl0oKSkpLHZvaWQgMCk6KHRoaXMubmV4dChlKSx2b2lkIDApfSxwcmV2aW91c1BhZ2U6ZnVuY3Rpb24oZSl7dmFyIGkscyxuO3JldHVybiB0aGlzLmFjdGl2ZT8odGhpcy5pc0ZpcnN0SXRlbSgpfHwodGhpcy5faGFzU2Nyb2xsKCk/KHM9dGhpcy5hY3RpdmUub2Zmc2V0KCkudG9wLG49dGhpcy5lbGVtZW50LmhlaWdodCgpLHRoaXMuYWN0aXZlLnByZXZBbGwoXCIudWktbWVudS1pdGVtXCIpLmVhY2goZnVuY3Rpb24oKXtyZXR1cm4gaT10KHRoaXMpLGkub2Zmc2V0KCkudG9wLXMrbj4wfSksdGhpcy5mb2N1cyhlLGkpKTp0aGlzLmZvY3VzKGUsdGhpcy5hY3RpdmVNZW51LmZpbmQodGhpcy5vcHRpb25zLml0ZW1zKS5maXJzdCgpKSksdm9pZCAwKToodGhpcy5uZXh0KGUpLHZvaWQgMCl9LF9oYXNTY3JvbGw6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lbGVtZW50Lm91dGVySGVpZ2h0KCk8dGhpcy5lbGVtZW50LnByb3AoXCJzY3JvbGxIZWlnaHRcIil9LHNlbGVjdDpmdW5jdGlvbihlKXt0aGlzLmFjdGl2ZT10aGlzLmFjdGl2ZXx8dChlLnRhcmdldCkuY2xvc2VzdChcIi51aS1tZW51LWl0ZW1cIik7dmFyIGk9e2l0ZW06dGhpcy5hY3RpdmV9O3RoaXMuYWN0aXZlLmhhcyhcIi51aS1tZW51XCIpLmxlbmd0aHx8dGhpcy5jb2xsYXBzZUFsbChlLCEwKSx0aGlzLl90cmlnZ2VyKFwic2VsZWN0XCIsZSxpKX0sX2ZpbHRlck1lbnVJdGVtczpmdW5jdGlvbihlKXt2YXIgaT1lLnJlcGxhY2UoL1tcXC1cXFtcXF17fSgpKis/LixcXFxcXFxeJHwjXFxzXS9nLFwiXFxcXCQmXCIpLHM9UmVnRXhwKFwiXlwiK2ksXCJpXCIpO3JldHVybiB0aGlzLmFjdGl2ZU1lbnUuZmluZCh0aGlzLm9wdGlvbnMuaXRlbXMpLmZpbHRlcihcIi51aS1tZW51LWl0ZW1cIikuZmlsdGVyKGZ1bmN0aW9uKCl7cmV0dXJuIHMudGVzdCh0LnRyaW0odCh0aGlzKS5jaGlsZHJlbihcIi51aS1tZW51LWl0ZW0td3JhcHBlclwiKS50ZXh0KCkpKX0pfX0pLHQud2lkZ2V0KFwidWkuYXV0b2NvbXBsZXRlXCIse3ZlcnNpb246XCIxLjEyLjFcIixkZWZhdWx0RWxlbWVudDpcIjxpbnB1dD5cIixvcHRpb25zOnthcHBlbmRUbzpudWxsLGF1dG9Gb2N1czohMSxkZWxheTozMDAsbWluTGVuZ3RoOjEscG9zaXRpb246e215OlwibGVmdCB0b3BcIixhdDpcImxlZnQgYm90dG9tXCIsY29sbGlzaW9uOlwibm9uZVwifSxzb3VyY2U6bnVsbCxjaGFuZ2U6bnVsbCxjbG9zZTpudWxsLGZvY3VzOm51bGwsb3BlbjpudWxsLHJlc3BvbnNlOm51bGwsc2VhcmNoOm51bGwsc2VsZWN0Om51bGx9LHJlcXVlc3RJbmRleDowLHBlbmRpbmc6MCxfY3JlYXRlOmZ1bmN0aW9uKCl7dmFyIGUsaSxzLG49dGhpcy5lbGVtZW50WzBdLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCksbz1cInRleHRhcmVhXCI9PT1uLGE9XCJpbnB1dFwiPT09bjt0aGlzLmlzTXVsdGlMaW5lPW98fCFhJiZ0aGlzLl9pc0NvbnRlbnRFZGl0YWJsZSh0aGlzLmVsZW1lbnQpLHRoaXMudmFsdWVNZXRob2Q9dGhpcy5lbGVtZW50W298fGE/XCJ2YWxcIjpcInRleHRcIl0sdGhpcy5pc05ld01lbnU9ITAsdGhpcy5fYWRkQ2xhc3MoXCJ1aS1hdXRvY29tcGxldGUtaW5wdXRcIiksdGhpcy5lbGVtZW50LmF0dHIoXCJhdXRvY29tcGxldGVcIixcIm9mZlwiKSx0aGlzLl9vbih0aGlzLmVsZW1lbnQse2tleWRvd246ZnVuY3Rpb24obil7aWYodGhpcy5lbGVtZW50LnByb3AoXCJyZWFkT25seVwiKSlyZXR1cm4gZT0hMCxzPSEwLGk9ITAsdm9pZCAwO2U9ITEscz0hMSxpPSExO3ZhciBvPXQudWkua2V5Q29kZTtzd2l0Y2gobi5rZXlDb2RlKXtjYXNlIG8uUEFHRV9VUDplPSEwLHRoaXMuX21vdmUoXCJwcmV2aW91c1BhZ2VcIixuKTticmVhaztjYXNlIG8uUEFHRV9ET1dOOmU9ITAsdGhpcy5fbW92ZShcIm5leHRQYWdlXCIsbik7YnJlYWs7Y2FzZSBvLlVQOmU9ITAsdGhpcy5fa2V5RXZlbnQoXCJwcmV2aW91c1wiLG4pO2JyZWFrO2Nhc2Ugby5ET1dOOmU9ITAsdGhpcy5fa2V5RXZlbnQoXCJuZXh0XCIsbik7YnJlYWs7Y2FzZSBvLkVOVEVSOnRoaXMubWVudS5hY3RpdmUmJihlPSEwLG4ucHJldmVudERlZmF1bHQoKSx0aGlzLm1lbnUuc2VsZWN0KG4pKTticmVhaztjYXNlIG8uVEFCOnRoaXMubWVudS5hY3RpdmUmJnRoaXMubWVudS5zZWxlY3Qobik7YnJlYWs7Y2FzZSBvLkVTQ0FQRTp0aGlzLm1lbnUuZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpJiYodGhpcy5pc011bHRpTGluZXx8dGhpcy5fdmFsdWUodGhpcy50ZXJtKSx0aGlzLmNsb3NlKG4pLG4ucHJldmVudERlZmF1bHQoKSk7YnJlYWs7ZGVmYXVsdDppPSEwLHRoaXMuX3NlYXJjaFRpbWVvdXQobil9fSxrZXlwcmVzczpmdW5jdGlvbihzKXtpZihlKXJldHVybiBlPSExLCghdGhpcy5pc011bHRpTGluZXx8dGhpcy5tZW51LmVsZW1lbnQuaXMoXCI6dmlzaWJsZVwiKSkmJnMucHJldmVudERlZmF1bHQoKSx2b2lkIDA7aWYoIWkpe3ZhciBuPXQudWkua2V5Q29kZTtzd2l0Y2gocy5rZXlDb2RlKXtjYXNlIG4uUEFHRV9VUDp0aGlzLl9tb3ZlKFwicHJldmlvdXNQYWdlXCIscyk7YnJlYWs7Y2FzZSBuLlBBR0VfRE9XTjp0aGlzLl9tb3ZlKFwibmV4dFBhZ2VcIixzKTticmVhaztjYXNlIG4uVVA6dGhpcy5fa2V5RXZlbnQoXCJwcmV2aW91c1wiLHMpO2JyZWFrO2Nhc2Ugbi5ET1dOOnRoaXMuX2tleUV2ZW50KFwibmV4dFwiLHMpfX19LGlucHV0OmZ1bmN0aW9uKHQpe3JldHVybiBzPyhzPSExLHQucHJldmVudERlZmF1bHQoKSx2b2lkIDApOih0aGlzLl9zZWFyY2hUaW1lb3V0KHQpLHZvaWQgMCl9LGZvY3VzOmZ1bmN0aW9uKCl7dGhpcy5zZWxlY3RlZEl0ZW09bnVsbCx0aGlzLnByZXZpb3VzPXRoaXMuX3ZhbHVlKCl9LGJsdXI6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuY2FuY2VsQmx1cj8oZGVsZXRlIHRoaXMuY2FuY2VsQmx1cix2b2lkIDApOihjbGVhclRpbWVvdXQodGhpcy5zZWFyY2hpbmcpLHRoaXMuY2xvc2UodCksdGhpcy5fY2hhbmdlKHQpLHZvaWQgMCl9fSksdGhpcy5faW5pdFNvdXJjZSgpLHRoaXMubWVudT10KFwiPHVsPlwiKS5hcHBlbmRUbyh0aGlzLl9hcHBlbmRUbygpKS5tZW51KHtyb2xlOm51bGx9KS5oaWRlKCkubWVudShcImluc3RhbmNlXCIpLHRoaXMuX2FkZENsYXNzKHRoaXMubWVudS5lbGVtZW50LFwidWktYXV0b2NvbXBsZXRlXCIsXCJ1aS1mcm9udFwiKSx0aGlzLl9vbih0aGlzLm1lbnUuZWxlbWVudCx7bW91c2Vkb3duOmZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKSx0aGlzLmNhbmNlbEJsdXI9ITAsdGhpcy5fZGVsYXkoZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5jYW5jZWxCbHVyLHRoaXMuZWxlbWVudFswXSE9PXQudWkuc2FmZUFjdGl2ZUVsZW1lbnQodGhpcy5kb2N1bWVudFswXSkmJnRoaXMuZWxlbWVudC50cmlnZ2VyKFwiZm9jdXNcIil9KX0sbWVudWZvY3VzOmZ1bmN0aW9uKGUsaSl7dmFyIHMsbjtyZXR1cm4gdGhpcy5pc05ld01lbnUmJih0aGlzLmlzTmV3TWVudT0hMSxlLm9yaWdpbmFsRXZlbnQmJi9ebW91c2UvLnRlc3QoZS5vcmlnaW5hbEV2ZW50LnR5cGUpKT8odGhpcy5tZW51LmJsdXIoKSx0aGlzLmRvY3VtZW50Lm9uZShcIm1vdXNlbW92ZVwiLGZ1bmN0aW9uKCl7dChlLnRhcmdldCkudHJpZ2dlcihlLm9yaWdpbmFsRXZlbnQpfSksdm9pZCAwKToobj1pLml0ZW0uZGF0YShcInVpLWF1dG9jb21wbGV0ZS1pdGVtXCIpLCExIT09dGhpcy5fdHJpZ2dlcihcImZvY3VzXCIsZSx7aXRlbTpufSkmJmUub3JpZ2luYWxFdmVudCYmL15rZXkvLnRlc3QoZS5vcmlnaW5hbEV2ZW50LnR5cGUpJiZ0aGlzLl92YWx1ZShuLnZhbHVlKSxzPWkuaXRlbS5hdHRyKFwiYXJpYS1sYWJlbFwiKXx8bi52YWx1ZSxzJiZ0LnRyaW0ocykubGVuZ3RoJiYodGhpcy5saXZlUmVnaW9uLmNoaWxkcmVuKCkuaGlkZSgpLHQoXCI8ZGl2PlwiKS50ZXh0KHMpLmFwcGVuZFRvKHRoaXMubGl2ZVJlZ2lvbikpLHZvaWQgMCl9LG1lbnVzZWxlY3Q6ZnVuY3Rpb24oZSxpKXt2YXIgcz1pLml0ZW0uZGF0YShcInVpLWF1dG9jb21wbGV0ZS1pdGVtXCIpLG49dGhpcy5wcmV2aW91czt0aGlzLmVsZW1lbnRbMF0hPT10LnVpLnNhZmVBY3RpdmVFbGVtZW50KHRoaXMuZG9jdW1lbnRbMF0pJiYodGhpcy5lbGVtZW50LnRyaWdnZXIoXCJmb2N1c1wiKSx0aGlzLnByZXZpb3VzPW4sdGhpcy5fZGVsYXkoZnVuY3Rpb24oKXt0aGlzLnByZXZpb3VzPW4sdGhpcy5zZWxlY3RlZEl0ZW09c30pKSwhMSE9PXRoaXMuX3RyaWdnZXIoXCJzZWxlY3RcIixlLHtpdGVtOnN9KSYmdGhpcy5fdmFsdWUocy52YWx1ZSksdGhpcy50ZXJtPXRoaXMuX3ZhbHVlKCksdGhpcy5jbG9zZShlKSx0aGlzLnNlbGVjdGVkSXRlbT1zfX0pLHRoaXMubGl2ZVJlZ2lvbj10KFwiPGRpdj5cIix7cm9sZTpcInN0YXR1c1wiLFwiYXJpYS1saXZlXCI6XCJhc3NlcnRpdmVcIixcImFyaWEtcmVsZXZhbnRcIjpcImFkZGl0aW9uc1wifSkuYXBwZW5kVG8odGhpcy5kb2N1bWVudFswXS5ib2R5KSx0aGlzLl9hZGRDbGFzcyh0aGlzLmxpdmVSZWdpb24sbnVsbCxcInVpLWhlbHBlci1oaWRkZW4tYWNjZXNzaWJsZVwiKSx0aGlzLl9vbih0aGlzLndpbmRvdyx7YmVmb3JldW5sb2FkOmZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50LnJlbW92ZUF0dHIoXCJhdXRvY29tcGxldGVcIil9fSl9LF9kZXN0cm95OmZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KHRoaXMuc2VhcmNoaW5nKSx0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cihcImF1dG9jb21wbGV0ZVwiKSx0aGlzLm1lbnUuZWxlbWVudC5yZW1vdmUoKSx0aGlzLmxpdmVSZWdpb24ucmVtb3ZlKCl9LF9zZXRPcHRpb246ZnVuY3Rpb24odCxlKXt0aGlzLl9zdXBlcih0LGUpLFwic291cmNlXCI9PT10JiZ0aGlzLl9pbml0U291cmNlKCksXCJhcHBlbmRUb1wiPT09dCYmdGhpcy5tZW51LmVsZW1lbnQuYXBwZW5kVG8odGhpcy5fYXBwZW5kVG8oKSksXCJkaXNhYmxlZFwiPT09dCYmZSYmdGhpcy54aHImJnRoaXMueGhyLmFib3J0KCl9LF9pc0V2ZW50VGFyZ2V0SW5XaWRnZXQ6ZnVuY3Rpb24oZSl7dmFyIGk9dGhpcy5tZW51LmVsZW1lbnRbMF07cmV0dXJuIGUudGFyZ2V0PT09dGhpcy5lbGVtZW50WzBdfHxlLnRhcmdldD09PWl8fHQuY29udGFpbnMoaSxlLnRhcmdldCl9LF9jbG9zZU9uQ2xpY2tPdXRzaWRlOmZ1bmN0aW9uKHQpe3RoaXMuX2lzRXZlbnRUYXJnZXRJbldpZGdldCh0KXx8dGhpcy5jbG9zZSgpXG59LF9hcHBlbmRUbzpmdW5jdGlvbigpe3ZhciBlPXRoaXMub3B0aW9ucy5hcHBlbmRUbztyZXR1cm4gZSYmKGU9ZS5qcXVlcnl8fGUubm9kZVR5cGU/dChlKTp0aGlzLmRvY3VtZW50LmZpbmQoZSkuZXEoMCkpLGUmJmVbMF18fChlPXRoaXMuZWxlbWVudC5jbG9zZXN0KFwiLnVpLWZyb250LCBkaWFsb2dcIikpLGUubGVuZ3RofHwoZT10aGlzLmRvY3VtZW50WzBdLmJvZHkpLGV9LF9pbml0U291cmNlOmZ1bmN0aW9uKCl7dmFyIGUsaSxzPXRoaXM7dC5pc0FycmF5KHRoaXMub3B0aW9ucy5zb3VyY2UpPyhlPXRoaXMub3B0aW9ucy5zb3VyY2UsdGhpcy5zb3VyY2U9ZnVuY3Rpb24oaSxzKXtzKHQudWkuYXV0b2NvbXBsZXRlLmZpbHRlcihlLGkudGVybSkpfSk6XCJzdHJpbmdcIj09dHlwZW9mIHRoaXMub3B0aW9ucy5zb3VyY2U/KGk9dGhpcy5vcHRpb25zLnNvdXJjZSx0aGlzLnNvdXJjZT1mdW5jdGlvbihlLG4pe3MueGhyJiZzLnhoci5hYm9ydCgpLHMueGhyPXQuYWpheCh7dXJsOmksZGF0YTplLGRhdGFUeXBlOlwianNvblwiLHN1Y2Nlc3M6ZnVuY3Rpb24odCl7bih0KX0sZXJyb3I6ZnVuY3Rpb24oKXtuKFtdKX19KX0pOnRoaXMuc291cmNlPXRoaXMub3B0aW9ucy5zb3VyY2V9LF9zZWFyY2hUaW1lb3V0OmZ1bmN0aW9uKHQpe2NsZWFyVGltZW91dCh0aGlzLnNlYXJjaGluZyksdGhpcy5zZWFyY2hpbmc9dGhpcy5fZGVsYXkoZnVuY3Rpb24oKXt2YXIgZT10aGlzLnRlcm09PT10aGlzLl92YWx1ZSgpLGk9dGhpcy5tZW51LmVsZW1lbnQuaXMoXCI6dmlzaWJsZVwiKSxzPXQuYWx0S2V5fHx0LmN0cmxLZXl8fHQubWV0YUtleXx8dC5zaGlmdEtleTsoIWV8fGUmJiFpJiYhcykmJih0aGlzLnNlbGVjdGVkSXRlbT1udWxsLHRoaXMuc2VhcmNoKG51bGwsdCkpfSx0aGlzLm9wdGlvbnMuZGVsYXkpfSxzZWFyY2g6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdD1udWxsIT10P3Q6dGhpcy5fdmFsdWUoKSx0aGlzLnRlcm09dGhpcy5fdmFsdWUoKSx0Lmxlbmd0aDx0aGlzLm9wdGlvbnMubWluTGVuZ3RoP3RoaXMuY2xvc2UoZSk6dGhpcy5fdHJpZ2dlcihcInNlYXJjaFwiLGUpIT09ITE/dGhpcy5fc2VhcmNoKHQpOnZvaWQgMH0sX3NlYXJjaDpmdW5jdGlvbih0KXt0aGlzLnBlbmRpbmcrKyx0aGlzLl9hZGRDbGFzcyhcInVpLWF1dG9jb21wbGV0ZS1sb2FkaW5nXCIpLHRoaXMuY2FuY2VsU2VhcmNoPSExLHRoaXMuc291cmNlKHt0ZXJtOnR9LHRoaXMuX3Jlc3BvbnNlKCkpfSxfcmVzcG9uc2U6ZnVuY3Rpb24oKXt2YXIgZT0rK3RoaXMucmVxdWVzdEluZGV4O3JldHVybiB0LnByb3h5KGZ1bmN0aW9uKHQpe2U9PT10aGlzLnJlcXVlc3RJbmRleCYmdGhpcy5fX3Jlc3BvbnNlKHQpLHRoaXMucGVuZGluZy0tLHRoaXMucGVuZGluZ3x8dGhpcy5fcmVtb3ZlQ2xhc3MoXCJ1aS1hdXRvY29tcGxldGUtbG9hZGluZ1wiKX0sdGhpcyl9LF9fcmVzcG9uc2U6ZnVuY3Rpb24odCl7dCYmKHQ9dGhpcy5fbm9ybWFsaXplKHQpKSx0aGlzLl90cmlnZ2VyKFwicmVzcG9uc2VcIixudWxsLHtjb250ZW50OnR9KSwhdGhpcy5vcHRpb25zLmRpc2FibGVkJiZ0JiZ0Lmxlbmd0aCYmIXRoaXMuY2FuY2VsU2VhcmNoPyh0aGlzLl9zdWdnZXN0KHQpLHRoaXMuX3RyaWdnZXIoXCJvcGVuXCIpKTp0aGlzLl9jbG9zZSgpfSxjbG9zZTpmdW5jdGlvbih0KXt0aGlzLmNhbmNlbFNlYXJjaD0hMCx0aGlzLl9jbG9zZSh0KX0sX2Nsb3NlOmZ1bmN0aW9uKHQpe3RoaXMuX29mZih0aGlzLmRvY3VtZW50LFwibW91c2Vkb3duXCIpLHRoaXMubWVudS5lbGVtZW50LmlzKFwiOnZpc2libGVcIikmJih0aGlzLm1lbnUuZWxlbWVudC5oaWRlKCksdGhpcy5tZW51LmJsdXIoKSx0aGlzLmlzTmV3TWVudT0hMCx0aGlzLl90cmlnZ2VyKFwiY2xvc2VcIix0KSl9LF9jaGFuZ2U6ZnVuY3Rpb24odCl7dGhpcy5wcmV2aW91cyE9PXRoaXMuX3ZhbHVlKCkmJnRoaXMuX3RyaWdnZXIoXCJjaGFuZ2VcIix0LHtpdGVtOnRoaXMuc2VsZWN0ZWRJdGVtfSl9LF9ub3JtYWxpemU6ZnVuY3Rpb24oZSl7cmV0dXJuIGUubGVuZ3RoJiZlWzBdLmxhYmVsJiZlWzBdLnZhbHVlP2U6dC5tYXAoZSxmdW5jdGlvbihlKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgZT97bGFiZWw6ZSx2YWx1ZTplfTp0LmV4dGVuZCh7fSxlLHtsYWJlbDplLmxhYmVsfHxlLnZhbHVlLHZhbHVlOmUudmFsdWV8fGUubGFiZWx9KX0pfSxfc3VnZ2VzdDpmdW5jdGlvbihlKXt2YXIgaT10aGlzLm1lbnUuZWxlbWVudC5lbXB0eSgpO3RoaXMuX3JlbmRlck1lbnUoaSxlKSx0aGlzLmlzTmV3TWVudT0hMCx0aGlzLm1lbnUucmVmcmVzaCgpLGkuc2hvdygpLHRoaXMuX3Jlc2l6ZU1lbnUoKSxpLnBvc2l0aW9uKHQuZXh0ZW5kKHtvZjp0aGlzLmVsZW1lbnR9LHRoaXMub3B0aW9ucy5wb3NpdGlvbikpLHRoaXMub3B0aW9ucy5hdXRvRm9jdXMmJnRoaXMubWVudS5uZXh0KCksdGhpcy5fb24odGhpcy5kb2N1bWVudCx7bW91c2Vkb3duOlwiX2Nsb3NlT25DbGlja091dHNpZGVcIn0pfSxfcmVzaXplTWVudTpmdW5jdGlvbigpe3ZhciB0PXRoaXMubWVudS5lbGVtZW50O3Qub3V0ZXJXaWR0aChNYXRoLm1heCh0LndpZHRoKFwiXCIpLm91dGVyV2lkdGgoKSsxLHRoaXMuZWxlbWVudC5vdXRlcldpZHRoKCkpKX0sX3JlbmRlck1lbnU6ZnVuY3Rpb24oZSxpKXt2YXIgcz10aGlzO3QuZWFjaChpLGZ1bmN0aW9uKHQsaSl7cy5fcmVuZGVySXRlbURhdGEoZSxpKX0pfSxfcmVuZGVySXRlbURhdGE6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5fcmVuZGVySXRlbSh0LGUpLmRhdGEoXCJ1aS1hdXRvY29tcGxldGUtaXRlbVwiLGUpfSxfcmVuZGVySXRlbTpmdW5jdGlvbihlLGkpe3JldHVybiB0KFwiPGxpPlwiKS5hcHBlbmQodChcIjxkaXY+XCIpLnRleHQoaS5sYWJlbCkpLmFwcGVuZFRvKGUpfSxfbW92ZTpmdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLm1lbnUuZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpP3RoaXMubWVudS5pc0ZpcnN0SXRlbSgpJiYvXnByZXZpb3VzLy50ZXN0KHQpfHx0aGlzLm1lbnUuaXNMYXN0SXRlbSgpJiYvXm5leHQvLnRlc3QodCk/KHRoaXMuaXNNdWx0aUxpbmV8fHRoaXMuX3ZhbHVlKHRoaXMudGVybSksdGhpcy5tZW51LmJsdXIoKSx2b2lkIDApOih0aGlzLm1lbnVbdF0oZSksdm9pZCAwKToodGhpcy5zZWFyY2gobnVsbCxlKSx2b2lkIDApfSx3aWRnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5tZW51LmVsZW1lbnR9LF92YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlTWV0aG9kLmFwcGx5KHRoaXMuZWxlbWVudCxhcmd1bWVudHMpfSxfa2V5RXZlbnQ6ZnVuY3Rpb24odCxlKXsoIXRoaXMuaXNNdWx0aUxpbmV8fHRoaXMubWVudS5lbGVtZW50LmlzKFwiOnZpc2libGVcIikpJiYodGhpcy5fbW92ZSh0LGUpLGUucHJldmVudERlZmF1bHQoKSl9LF9pc0NvbnRlbnRFZGl0YWJsZTpmdW5jdGlvbih0KXtpZighdC5sZW5ndGgpcmV0dXJuITE7dmFyIGU9dC5wcm9wKFwiY29udGVudEVkaXRhYmxlXCIpO3JldHVyblwiaW5oZXJpdFwiPT09ZT90aGlzLl9pc0NvbnRlbnRFZGl0YWJsZSh0LnBhcmVudCgpKTpcInRydWVcIj09PWV9fSksdC5leHRlbmQodC51aS5hdXRvY29tcGxldGUse2VzY2FwZVJlZ2V4OmZ1bmN0aW9uKHQpe3JldHVybiB0LnJlcGxhY2UoL1tcXC1cXFtcXF17fSgpKis/LixcXFxcXFxeJHwjXFxzXS9nLFwiXFxcXCQmXCIpfSxmaWx0ZXI6ZnVuY3Rpb24oZSxpKXt2YXIgcz1SZWdFeHAodC51aS5hdXRvY29tcGxldGUuZXNjYXBlUmVnZXgoaSksXCJpXCIpO3JldHVybiB0LmdyZXAoZSxmdW5jdGlvbih0KXtyZXR1cm4gcy50ZXN0KHQubGFiZWx8fHQudmFsdWV8fHQpfSl9fSksdC53aWRnZXQoXCJ1aS5hdXRvY29tcGxldGVcIix0LnVpLmF1dG9jb21wbGV0ZSx7b3B0aW9uczp7bWVzc2FnZXM6e25vUmVzdWx0czpcIk5vIHNlYXJjaCByZXN1bHRzLlwiLHJlc3VsdHM6ZnVuY3Rpb24odCl7cmV0dXJuIHQrKHQ+MT9cIiByZXN1bHRzIGFyZVwiOlwiIHJlc3VsdCBpc1wiKStcIiBhdmFpbGFibGUsIHVzZSB1cCBhbmQgZG93biBhcnJvdyBrZXlzIHRvIG5hdmlnYXRlLlwifX19LF9fcmVzcG9uc2U6ZnVuY3Rpb24oZSl7dmFyIGk7dGhpcy5fc3VwZXJBcHBseShhcmd1bWVudHMpLHRoaXMub3B0aW9ucy5kaXNhYmxlZHx8dGhpcy5jYW5jZWxTZWFyY2h8fChpPWUmJmUubGVuZ3RoP3RoaXMub3B0aW9ucy5tZXNzYWdlcy5yZXN1bHRzKGUubGVuZ3RoKTp0aGlzLm9wdGlvbnMubWVzc2FnZXMubm9SZXN1bHRzLHRoaXMubGl2ZVJlZ2lvbi5jaGlsZHJlbigpLmhpZGUoKSx0KFwiPGRpdj5cIikudGV4dChpKS5hcHBlbmRUbyh0aGlzLmxpdmVSZWdpb24pKX19KSx0LnVpLmF1dG9jb21wbGV0ZSx0LmV4dGVuZCh0LnVpLHtkYXRlcGlja2VyOnt2ZXJzaW9uOlwiMS4xMi4xXCJ9fSk7dmFyIGw7dC5leHRlbmQoaS5wcm90b3R5cGUse21hcmtlckNsYXNzTmFtZTpcImhhc0RhdGVwaWNrZXJcIixtYXhSb3dzOjQsX3dpZGdldERhdGVwaWNrZXI6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kcERpdn0sc2V0RGVmYXVsdHM6ZnVuY3Rpb24odCl7cmV0dXJuIG8odGhpcy5fZGVmYXVsdHMsdHx8e30pLHRoaXN9LF9hdHRhY2hEYXRlcGlja2VyOmZ1bmN0aW9uKGUsaSl7dmFyIHMsbixvO3M9ZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLG49XCJkaXZcIj09PXN8fFwic3BhblwiPT09cyxlLmlkfHwodGhpcy51dWlkKz0xLGUuaWQ9XCJkcFwiK3RoaXMudXVpZCksbz10aGlzLl9uZXdJbnN0KHQoZSksbiksby5zZXR0aW5ncz10LmV4dGVuZCh7fSxpfHx7fSksXCJpbnB1dFwiPT09cz90aGlzLl9jb25uZWN0RGF0ZXBpY2tlcihlLG8pOm4mJnRoaXMuX2lubGluZURhdGVwaWNrZXIoZSxvKX0sX25ld0luc3Q6ZnVuY3Rpb24oZSxpKXt2YXIgbj1lWzBdLmlkLnJlcGxhY2UoLyhbXkEtWmEtejAtOV9cXC1dKS9nLFwiXFxcXFxcXFwkMVwiKTtyZXR1cm57aWQ6bixpbnB1dDplLHNlbGVjdGVkRGF5OjAsc2VsZWN0ZWRNb250aDowLHNlbGVjdGVkWWVhcjowLGRyYXdNb250aDowLGRyYXdZZWFyOjAsaW5saW5lOmksZHBEaXY6aT9zKHQoXCI8ZGl2IGNsYXNzPSdcIit0aGlzLl9pbmxpbmVDbGFzcytcIiB1aS1kYXRlcGlja2VyIHVpLXdpZGdldCB1aS13aWRnZXQtY29udGVudCB1aS1oZWxwZXItY2xlYXJmaXggdWktY29ybmVyLWFsbCc+PC9kaXY+XCIpKTp0aGlzLmRwRGl2fX0sX2Nvbm5lY3REYXRlcGlja2VyOmZ1bmN0aW9uKGUsaSl7dmFyIHM9dChlKTtpLmFwcGVuZD10KFtdKSxpLnRyaWdnZXI9dChbXSkscy5oYXNDbGFzcyh0aGlzLm1hcmtlckNsYXNzTmFtZSl8fCh0aGlzLl9hdHRhY2htZW50cyhzLGkpLHMuYWRkQ2xhc3ModGhpcy5tYXJrZXJDbGFzc05hbWUpLm9uKFwia2V5ZG93blwiLHRoaXMuX2RvS2V5RG93bikub24oXCJrZXlwcmVzc1wiLHRoaXMuX2RvS2V5UHJlc3MpLm9uKFwia2V5dXBcIix0aGlzLl9kb0tleVVwKSx0aGlzLl9hdXRvU2l6ZShpKSx0LmRhdGEoZSxcImRhdGVwaWNrZXJcIixpKSxpLnNldHRpbmdzLmRpc2FibGVkJiZ0aGlzLl9kaXNhYmxlRGF0ZXBpY2tlcihlKSl9LF9hdHRhY2htZW50czpmdW5jdGlvbihlLGkpe3ZhciBzLG4sbyxhPXRoaXMuX2dldChpLFwiYXBwZW5kVGV4dFwiKSxyPXRoaXMuX2dldChpLFwiaXNSVExcIik7aS5hcHBlbmQmJmkuYXBwZW5kLnJlbW92ZSgpLGEmJihpLmFwcGVuZD10KFwiPHNwYW4gY2xhc3M9J1wiK3RoaXMuX2FwcGVuZENsYXNzK1wiJz5cIithK1wiPC9zcGFuPlwiKSxlW3I/XCJiZWZvcmVcIjpcImFmdGVyXCJdKGkuYXBwZW5kKSksZS5vZmYoXCJmb2N1c1wiLHRoaXMuX3Nob3dEYXRlcGlja2VyKSxpLnRyaWdnZXImJmkudHJpZ2dlci5yZW1vdmUoKSxzPXRoaXMuX2dldChpLFwic2hvd09uXCIpLChcImZvY3VzXCI9PT1zfHxcImJvdGhcIj09PXMpJiZlLm9uKFwiZm9jdXNcIix0aGlzLl9zaG93RGF0ZXBpY2tlciksKFwiYnV0dG9uXCI9PT1zfHxcImJvdGhcIj09PXMpJiYobj10aGlzLl9nZXQoaSxcImJ1dHRvblRleHRcIiksbz10aGlzLl9nZXQoaSxcImJ1dHRvbkltYWdlXCIpLGkudHJpZ2dlcj10KHRoaXMuX2dldChpLFwiYnV0dG9uSW1hZ2VPbmx5XCIpP3QoXCI8aW1nLz5cIikuYWRkQ2xhc3ModGhpcy5fdHJpZ2dlckNsYXNzKS5hdHRyKHtzcmM6byxhbHQ6bix0aXRsZTpufSk6dChcIjxidXR0b24gdHlwZT0nYnV0dG9uJz48L2J1dHRvbj5cIikuYWRkQ2xhc3ModGhpcy5fdHJpZ2dlckNsYXNzKS5odG1sKG8/dChcIjxpbWcvPlwiKS5hdHRyKHtzcmM6byxhbHQ6bix0aXRsZTpufSk6bikpLGVbcj9cImJlZm9yZVwiOlwiYWZ0ZXJcIl0oaS50cmlnZ2VyKSxpLnRyaWdnZXIub24oXCJjbGlja1wiLGZ1bmN0aW9uKCl7cmV0dXJuIHQuZGF0ZXBpY2tlci5fZGF0ZXBpY2tlclNob3dpbmcmJnQuZGF0ZXBpY2tlci5fbGFzdElucHV0PT09ZVswXT90LmRhdGVwaWNrZXIuX2hpZGVEYXRlcGlja2VyKCk6dC5kYXRlcGlja2VyLl9kYXRlcGlja2VyU2hvd2luZyYmdC5kYXRlcGlja2VyLl9sYXN0SW5wdXQhPT1lWzBdPyh0LmRhdGVwaWNrZXIuX2hpZGVEYXRlcGlja2VyKCksdC5kYXRlcGlja2VyLl9zaG93RGF0ZXBpY2tlcihlWzBdKSk6dC5kYXRlcGlja2VyLl9zaG93RGF0ZXBpY2tlcihlWzBdKSwhMX0pKX0sX2F1dG9TaXplOmZ1bmN0aW9uKHQpe2lmKHRoaXMuX2dldCh0LFwiYXV0b1NpemVcIikmJiF0LmlubGluZSl7dmFyIGUsaSxzLG4sbz1uZXcgRGF0ZSgyMDA5LDExLDIwKSxhPXRoaXMuX2dldCh0LFwiZGF0ZUZvcm1hdFwiKTthLm1hdGNoKC9bRE1dLykmJihlPWZ1bmN0aW9uKHQpe2ZvcihpPTAscz0wLG49MDt0Lmxlbmd0aD5uO24rKyl0W25dLmxlbmd0aD5pJiYoaT10W25dLmxlbmd0aCxzPW4pO3JldHVybiBzfSxvLnNldE1vbnRoKGUodGhpcy5fZ2V0KHQsYS5tYXRjaCgvTU0vKT9cIm1vbnRoTmFtZXNcIjpcIm1vbnRoTmFtZXNTaG9ydFwiKSkpLG8uc2V0RGF0ZShlKHRoaXMuX2dldCh0LGEubWF0Y2goL0RELyk/XCJkYXlOYW1lc1wiOlwiZGF5TmFtZXNTaG9ydFwiKSkrMjAtby5nZXREYXkoKSkpLHQuaW5wdXQuYXR0cihcInNpemVcIix0aGlzLl9mb3JtYXREYXRlKHQsbykubGVuZ3RoKX19LF9pbmxpbmVEYXRlcGlja2VyOmZ1bmN0aW9uKGUsaSl7dmFyIHM9dChlKTtzLmhhc0NsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKXx8KHMuYWRkQ2xhc3ModGhpcy5tYXJrZXJDbGFzc05hbWUpLmFwcGVuZChpLmRwRGl2KSx0LmRhdGEoZSxcImRhdGVwaWNrZXJcIixpKSx0aGlzLl9zZXREYXRlKGksdGhpcy5fZ2V0RGVmYXVsdERhdGUoaSksITApLHRoaXMuX3VwZGF0ZURhdGVwaWNrZXIoaSksdGhpcy5fdXBkYXRlQWx0ZXJuYXRlKGkpLGkuc2V0dGluZ3MuZGlzYWJsZWQmJnRoaXMuX2Rpc2FibGVEYXRlcGlja2VyKGUpLGkuZHBEaXYuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIikpfSxfZGlhbG9nRGF0ZXBpY2tlcjpmdW5jdGlvbihlLGkscyxuLGEpe3ZhciByLGwsaCxjLHUsZD10aGlzLl9kaWFsb2dJbnN0O3JldHVybiBkfHwodGhpcy51dWlkKz0xLHI9XCJkcFwiK3RoaXMudXVpZCx0aGlzLl9kaWFsb2dJbnB1dD10KFwiPGlucHV0IHR5cGU9J3RleHQnIGlkPSdcIityK1wiJyBzdHlsZT0ncG9zaXRpb246IGFic29sdXRlOyB0b3A6IC0xMDBweDsgd2lkdGg6IDBweDsnLz5cIiksdGhpcy5fZGlhbG9nSW5wdXQub24oXCJrZXlkb3duXCIsdGhpcy5fZG9LZXlEb3duKSx0KFwiYm9keVwiKS5hcHBlbmQodGhpcy5fZGlhbG9nSW5wdXQpLGQ9dGhpcy5fZGlhbG9nSW5zdD10aGlzLl9uZXdJbnN0KHRoaXMuX2RpYWxvZ0lucHV0LCExKSxkLnNldHRpbmdzPXt9LHQuZGF0YSh0aGlzLl9kaWFsb2dJbnB1dFswXSxcImRhdGVwaWNrZXJcIixkKSksbyhkLnNldHRpbmdzLG58fHt9KSxpPWkmJmkuY29uc3RydWN0b3I9PT1EYXRlP3RoaXMuX2Zvcm1hdERhdGUoZCxpKTppLHRoaXMuX2RpYWxvZ0lucHV0LnZhbChpKSx0aGlzLl9wb3M9YT9hLmxlbmd0aD9hOlthLnBhZ2VYLGEucGFnZVldOm51bGwsdGhpcy5fcG9zfHwobD1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsaD1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LGM9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnR8fGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCx1PWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3B8fGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wLHRoaXMuX3Bvcz1bbC8yLTEwMCtjLGgvMi0xNTArdV0pLHRoaXMuX2RpYWxvZ0lucHV0LmNzcyhcImxlZnRcIix0aGlzLl9wb3NbMF0rMjArXCJweFwiKS5jc3MoXCJ0b3BcIix0aGlzLl9wb3NbMV0rXCJweFwiKSxkLnNldHRpbmdzLm9uU2VsZWN0PXMsdGhpcy5faW5EaWFsb2c9ITAsdGhpcy5kcERpdi5hZGRDbGFzcyh0aGlzLl9kaWFsb2dDbGFzcyksdGhpcy5fc2hvd0RhdGVwaWNrZXIodGhpcy5fZGlhbG9nSW5wdXRbMF0pLHQuYmxvY2tVSSYmdC5ibG9ja1VJKHRoaXMuZHBEaXYpLHQuZGF0YSh0aGlzLl9kaWFsb2dJbnB1dFswXSxcImRhdGVwaWNrZXJcIixkKSx0aGlzfSxfZGVzdHJveURhdGVwaWNrZXI6ZnVuY3Rpb24oZSl7dmFyIGkscz10KGUpLG49dC5kYXRhKGUsXCJkYXRlcGlja2VyXCIpO3MuaGFzQ2xhc3ModGhpcy5tYXJrZXJDbGFzc05hbWUpJiYoaT1lLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCksdC5yZW1vdmVEYXRhKGUsXCJkYXRlcGlja2VyXCIpLFwiaW5wdXRcIj09PWk/KG4uYXBwZW5kLnJlbW92ZSgpLG4udHJpZ2dlci5yZW1vdmUoKSxzLnJlbW92ZUNsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKS5vZmYoXCJmb2N1c1wiLHRoaXMuX3Nob3dEYXRlcGlja2VyKS5vZmYoXCJrZXlkb3duXCIsdGhpcy5fZG9LZXlEb3duKS5vZmYoXCJrZXlwcmVzc1wiLHRoaXMuX2RvS2V5UHJlc3MpLm9mZihcImtleXVwXCIsdGhpcy5fZG9LZXlVcCkpOihcImRpdlwiPT09aXx8XCJzcGFuXCI9PT1pKSYmcy5yZW1vdmVDbGFzcyh0aGlzLm1hcmtlckNsYXNzTmFtZSkuZW1wdHkoKSxsPT09biYmKGw9bnVsbCkpfSxfZW5hYmxlRGF0ZXBpY2tlcjpmdW5jdGlvbihlKXt2YXIgaSxzLG49dChlKSxvPXQuZGF0YShlLFwiZGF0ZXBpY2tlclwiKTtuLmhhc0NsYXNzKHRoaXMubWFya2VyQ2xhc3NOYW1lKSYmKGk9ZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLFwiaW5wdXRcIj09PWk/KGUuZGlzYWJsZWQ9ITEsby50cmlnZ2VyLmZpbHRlcihcImJ1dHRvblwiKS5lYWNoKGZ1bmN0aW9uKCl7dGhpcy5kaXNhYmxlZD0hMX0pLmVuZCgpLmZpbHRlcihcImltZ1wiKS5jc3Moe29wYWNpdHk6XCIxLjBcIixjdXJzb3I6XCJcIn0pKTooXCJkaXZcIj09PWl8fFwic3BhblwiPT09aSkmJihzPW4uY2hpbGRyZW4oXCIuXCIrdGhpcy5faW5saW5lQ2xhc3MpLHMuY2hpbGRyZW4oKS5yZW1vdmVDbGFzcyhcInVpLXN0YXRlLWRpc2FibGVkXCIpLHMuZmluZChcInNlbGVjdC51aS1kYXRlcGlja2VyLW1vbnRoLCBzZWxlY3QudWktZGF0ZXBpY2tlci15ZWFyXCIpLnByb3AoXCJkaXNhYmxlZFwiLCExKSksdGhpcy5fZGlzYWJsZWRJbnB1dHM9dC5tYXAodGhpcy5fZGlzYWJsZWRJbnB1dHMsZnVuY3Rpb24odCl7cmV0dXJuIHQ9PT1lP251bGw6dH0pKX0sX2Rpc2FibGVEYXRlcGlja2VyOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbj10KGUpLG89dC5kYXRhKGUsXCJkYXRlcGlja2VyXCIpO24uaGFzQ2xhc3ModGhpcy5tYXJrZXJDbGFzc05hbWUpJiYoaT1lLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCksXCJpbnB1dFwiPT09aT8oZS5kaXNhYmxlZD0hMCxvLnRyaWdnZXIuZmlsdGVyKFwiYnV0dG9uXCIpLmVhY2goZnVuY3Rpb24oKXt0aGlzLmRpc2FibGVkPSEwfSkuZW5kKCkuZmlsdGVyKFwiaW1nXCIpLmNzcyh7b3BhY2l0eTpcIjAuNVwiLGN1cnNvcjpcImRlZmF1bHRcIn0pKTooXCJkaXZcIj09PWl8fFwic3BhblwiPT09aSkmJihzPW4uY2hpbGRyZW4oXCIuXCIrdGhpcy5faW5saW5lQ2xhc3MpLHMuY2hpbGRyZW4oKS5hZGRDbGFzcyhcInVpLXN0YXRlLWRpc2FibGVkXCIpLHMuZmluZChcInNlbGVjdC51aS1kYXRlcGlja2VyLW1vbnRoLCBzZWxlY3QudWktZGF0ZXBpY2tlci15ZWFyXCIpLnByb3AoXCJkaXNhYmxlZFwiLCEwKSksdGhpcy5fZGlzYWJsZWRJbnB1dHM9dC5tYXAodGhpcy5fZGlzYWJsZWRJbnB1dHMsZnVuY3Rpb24odCl7cmV0dXJuIHQ9PT1lP251bGw6dH0pLHRoaXMuX2Rpc2FibGVkSW5wdXRzW3RoaXMuX2Rpc2FibGVkSW5wdXRzLmxlbmd0aF09ZSl9LF9pc0Rpc2FibGVkRGF0ZXBpY2tlcjpmdW5jdGlvbih0KXtpZighdClyZXR1cm4hMTtmb3IodmFyIGU9MDt0aGlzLl9kaXNhYmxlZElucHV0cy5sZW5ndGg+ZTtlKyspaWYodGhpcy5fZGlzYWJsZWRJbnB1dHNbZV09PT10KXJldHVybiEwO3JldHVybiExfSxfZ2V0SW5zdDpmdW5jdGlvbihlKXt0cnl7cmV0dXJuIHQuZGF0YShlLFwiZGF0ZXBpY2tlclwiKX1jYXRjaChpKXt0aHJvd1wiTWlzc2luZyBpbnN0YW5jZSBkYXRhIGZvciB0aGlzIGRhdGVwaWNrZXJcIn19LF9vcHRpb25EYXRlcGlja2VyOmZ1bmN0aW9uKGUsaSxzKXt2YXIgbixhLHIsbCxoPXRoaXMuX2dldEluc3QoZSk7cmV0dXJuIDI9PT1hcmd1bWVudHMubGVuZ3RoJiZcInN0cmluZ1wiPT10eXBlb2YgaT9cImRlZmF1bHRzXCI9PT1pP3QuZXh0ZW5kKHt9LHQuZGF0ZXBpY2tlci5fZGVmYXVsdHMpOmg/XCJhbGxcIj09PWk/dC5leHRlbmQoe30saC5zZXR0aW5ncyk6dGhpcy5fZ2V0KGgsaSk6bnVsbDoobj1pfHx7fSxcInN0cmluZ1wiPT10eXBlb2YgaSYmKG49e30sbltpXT1zKSxoJiYodGhpcy5fY3VySW5zdD09PWgmJnRoaXMuX2hpZGVEYXRlcGlja2VyKCksYT10aGlzLl9nZXREYXRlRGF0ZXBpY2tlcihlLCEwKSxyPXRoaXMuX2dldE1pbk1heERhdGUoaCxcIm1pblwiKSxsPXRoaXMuX2dldE1pbk1heERhdGUoaCxcIm1heFwiKSxvKGguc2V0dGluZ3MsbiksbnVsbCE9PXImJnZvaWQgMCE9PW4uZGF0ZUZvcm1hdCYmdm9pZCAwPT09bi5taW5EYXRlJiYoaC5zZXR0aW5ncy5taW5EYXRlPXRoaXMuX2Zvcm1hdERhdGUoaCxyKSksbnVsbCE9PWwmJnZvaWQgMCE9PW4uZGF0ZUZvcm1hdCYmdm9pZCAwPT09bi5tYXhEYXRlJiYoaC5zZXR0aW5ncy5tYXhEYXRlPXRoaXMuX2Zvcm1hdERhdGUoaCxsKSksXCJkaXNhYmxlZFwiaW4gbiYmKG4uZGlzYWJsZWQ/dGhpcy5fZGlzYWJsZURhdGVwaWNrZXIoZSk6dGhpcy5fZW5hYmxlRGF0ZXBpY2tlcihlKSksdGhpcy5fYXR0YWNobWVudHModChlKSxoKSx0aGlzLl9hdXRvU2l6ZShoKSx0aGlzLl9zZXREYXRlKGgsYSksdGhpcy5fdXBkYXRlQWx0ZXJuYXRlKGgpLHRoaXMuX3VwZGF0ZURhdGVwaWNrZXIoaCkpLHZvaWQgMCl9LF9jaGFuZ2VEYXRlcGlja2VyOmZ1bmN0aW9uKHQsZSxpKXt0aGlzLl9vcHRpb25EYXRlcGlja2VyKHQsZSxpKX0sX3JlZnJlc2hEYXRlcGlja2VyOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX2dldEluc3QodCk7ZSYmdGhpcy5fdXBkYXRlRGF0ZXBpY2tlcihlKX0sX3NldERhdGVEYXRlcGlja2VyOmZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZ2V0SW5zdCh0KTtpJiYodGhpcy5fc2V0RGF0ZShpLGUpLHRoaXMuX3VwZGF0ZURhdGVwaWNrZXIoaSksdGhpcy5fdXBkYXRlQWx0ZXJuYXRlKGkpKX0sX2dldERhdGVEYXRlcGlja2VyOmZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZ2V0SW5zdCh0KTtyZXR1cm4gaSYmIWkuaW5saW5lJiZ0aGlzLl9zZXREYXRlRnJvbUZpZWxkKGksZSksaT90aGlzLl9nZXREYXRlKGkpOm51bGx9LF9kb0tleURvd246ZnVuY3Rpb24oZSl7dmFyIGkscyxuLG89dC5kYXRlcGlja2VyLl9nZXRJbnN0KGUudGFyZ2V0KSxhPSEwLHI9by5kcERpdi5pcyhcIi51aS1kYXRlcGlja2VyLXJ0bFwiKTtpZihvLl9rZXlFdmVudD0hMCx0LmRhdGVwaWNrZXIuX2RhdGVwaWNrZXJTaG93aW5nKXN3aXRjaChlLmtleUNvZGUpe2Nhc2UgOTp0LmRhdGVwaWNrZXIuX2hpZGVEYXRlcGlja2VyKCksYT0hMTticmVhaztjYXNlIDEzOnJldHVybiBuPXQoXCJ0ZC5cIit0LmRhdGVwaWNrZXIuX2RheU92ZXJDbGFzcytcIjpub3QoLlwiK3QuZGF0ZXBpY2tlci5fY3VycmVudENsYXNzK1wiKVwiLG8uZHBEaXYpLG5bMF0mJnQuZGF0ZXBpY2tlci5fc2VsZWN0RGF5KGUudGFyZ2V0LG8uc2VsZWN0ZWRNb250aCxvLnNlbGVjdGVkWWVhcixuWzBdKSxpPXQuZGF0ZXBpY2tlci5fZ2V0KG8sXCJvblNlbGVjdFwiKSxpPyhzPXQuZGF0ZXBpY2tlci5fZm9ybWF0RGF0ZShvKSxpLmFwcGx5KG8uaW5wdXQ/by5pbnB1dFswXTpudWxsLFtzLG9dKSk6dC5kYXRlcGlja2VyLl9oaWRlRGF0ZXBpY2tlcigpLCExO2Nhc2UgMjc6dC5kYXRlcGlja2VyLl9oaWRlRGF0ZXBpY2tlcigpO2JyZWFrO2Nhc2UgMzM6dC5kYXRlcGlja2VyLl9hZGp1c3REYXRlKGUudGFyZ2V0LGUuY3RybEtleT8tdC5kYXRlcGlja2VyLl9nZXQobyxcInN0ZXBCaWdNb250aHNcIik6LXQuZGF0ZXBpY2tlci5fZ2V0KG8sXCJzdGVwTW9udGhzXCIpLFwiTVwiKTticmVhaztjYXNlIDM0OnQuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShlLnRhcmdldCxlLmN0cmxLZXk/K3QuZGF0ZXBpY2tlci5fZ2V0KG8sXCJzdGVwQmlnTW9udGhzXCIpOit0LmRhdGVwaWNrZXIuX2dldChvLFwic3RlcE1vbnRoc1wiKSxcIk1cIik7YnJlYWs7Y2FzZSAzNTooZS5jdHJsS2V5fHxlLm1ldGFLZXkpJiZ0LmRhdGVwaWNrZXIuX2NsZWFyRGF0ZShlLnRhcmdldCksYT1lLmN0cmxLZXl8fGUubWV0YUtleTticmVhaztjYXNlIDM2OihlLmN0cmxLZXl8fGUubWV0YUtleSkmJnQuZGF0ZXBpY2tlci5fZ290b1RvZGF5KGUudGFyZ2V0KSxhPWUuY3RybEtleXx8ZS5tZXRhS2V5O2JyZWFrO2Nhc2UgMzc6KGUuY3RybEtleXx8ZS5tZXRhS2V5KSYmdC5kYXRlcGlja2VyLl9hZGp1c3REYXRlKGUudGFyZ2V0LHI/MTotMSxcIkRcIiksYT1lLmN0cmxLZXl8fGUubWV0YUtleSxlLm9yaWdpbmFsRXZlbnQuYWx0S2V5JiZ0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUoZS50YXJnZXQsZS5jdHJsS2V5Py10LmRhdGVwaWNrZXIuX2dldChvLFwic3RlcEJpZ01vbnRoc1wiKTotdC5kYXRlcGlja2VyLl9nZXQobyxcInN0ZXBNb250aHNcIiksXCJNXCIpO2JyZWFrO2Nhc2UgMzg6KGUuY3RybEtleXx8ZS5tZXRhS2V5KSYmdC5kYXRlcGlja2VyLl9hZGp1c3REYXRlKGUudGFyZ2V0LC03LFwiRFwiKSxhPWUuY3RybEtleXx8ZS5tZXRhS2V5O2JyZWFrO2Nhc2UgMzk6KGUuY3RybEtleXx8ZS5tZXRhS2V5KSYmdC5kYXRlcGlja2VyLl9hZGp1c3REYXRlKGUudGFyZ2V0LHI/LTE6MSxcIkRcIiksYT1lLmN0cmxLZXl8fGUubWV0YUtleSxlLm9yaWdpbmFsRXZlbnQuYWx0S2V5JiZ0LmRhdGVwaWNrZXIuX2FkanVzdERhdGUoZS50YXJnZXQsZS5jdHJsS2V5Pyt0LmRhdGVwaWNrZXIuX2dldChvLFwic3RlcEJpZ01vbnRoc1wiKTordC5kYXRlcGlja2VyLl9nZXQobyxcInN0ZXBNb250aHNcIiksXCJNXCIpO2JyZWFrO2Nhc2UgNDA6KGUuY3RybEtleXx8ZS5tZXRhS2V5KSYmdC5kYXRlcGlja2VyLl9hZGp1c3REYXRlKGUudGFyZ2V0LDcsXCJEXCIpLGE9ZS5jdHJsS2V5fHxlLm1ldGFLZXk7YnJlYWs7ZGVmYXVsdDphPSExfWVsc2UgMzY9PT1lLmtleUNvZGUmJmUuY3RybEtleT90LmRhdGVwaWNrZXIuX3Nob3dEYXRlcGlja2VyKHRoaXMpOmE9ITE7YSYmKGUucHJldmVudERlZmF1bHQoKSxlLnN0b3BQcm9wYWdhdGlvbigpKX0sX2RvS2V5UHJlc3M6ZnVuY3Rpb24oZSl7dmFyIGkscyxuPXQuZGF0ZXBpY2tlci5fZ2V0SW5zdChlLnRhcmdldCk7cmV0dXJuIHQuZGF0ZXBpY2tlci5fZ2V0KG4sXCJjb25zdHJhaW5JbnB1dFwiKT8oaT10LmRhdGVwaWNrZXIuX3Bvc3NpYmxlQ2hhcnModC5kYXRlcGlja2VyLl9nZXQobixcImRhdGVGb3JtYXRcIikpLHM9U3RyaW5nLmZyb21DaGFyQ29kZShudWxsPT1lLmNoYXJDb2RlP2Uua2V5Q29kZTplLmNoYXJDb2RlKSxlLmN0cmxLZXl8fGUubWV0YUtleXx8XCIgXCI+c3x8IWl8fGkuaW5kZXhPZihzKT4tMSk6dm9pZCAwfSxfZG9LZXlVcDpmdW5jdGlvbihlKXt2YXIgaSxzPXQuZGF0ZXBpY2tlci5fZ2V0SW5zdChlLnRhcmdldCk7aWYocy5pbnB1dC52YWwoKSE9PXMubGFzdFZhbCl0cnl7aT10LmRhdGVwaWNrZXIucGFyc2VEYXRlKHQuZGF0ZXBpY2tlci5fZ2V0KHMsXCJkYXRlRm9ybWF0XCIpLHMuaW5wdXQ/cy5pbnB1dC52YWwoKTpudWxsLHQuZGF0ZXBpY2tlci5fZ2V0Rm9ybWF0Q29uZmlnKHMpKSxpJiYodC5kYXRlcGlja2VyLl9zZXREYXRlRnJvbUZpZWxkKHMpLHQuZGF0ZXBpY2tlci5fdXBkYXRlQWx0ZXJuYXRlKHMpLHQuZGF0ZXBpY2tlci5fdXBkYXRlRGF0ZXBpY2tlcihzKSl9Y2F0Y2gobil7fXJldHVybiEwfSxfc2hvd0RhdGVwaWNrZXI6ZnVuY3Rpb24oaSl7aWYoaT1pLnRhcmdldHx8aSxcImlucHV0XCIhPT1pLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkmJihpPXQoXCJpbnB1dFwiLGkucGFyZW50Tm9kZSlbMF0pLCF0LmRhdGVwaWNrZXIuX2lzRGlzYWJsZWREYXRlcGlja2VyKGkpJiZ0LmRhdGVwaWNrZXIuX2xhc3RJbnB1dCE9PWkpe3ZhciBzLG4sYSxyLGwsaCxjO3M9dC5kYXRlcGlja2VyLl9nZXRJbnN0KGkpLHQuZGF0ZXBpY2tlci5fY3VySW5zdCYmdC5kYXRlcGlja2VyLl9jdXJJbnN0IT09cyYmKHQuZGF0ZXBpY2tlci5fY3VySW5zdC5kcERpdi5zdG9wKCEwLCEwKSxzJiZ0LmRhdGVwaWNrZXIuX2RhdGVwaWNrZXJTaG93aW5nJiZ0LmRhdGVwaWNrZXIuX2hpZGVEYXRlcGlja2VyKHQuZGF0ZXBpY2tlci5fY3VySW5zdC5pbnB1dFswXSkpLG49dC5kYXRlcGlja2VyLl9nZXQocyxcImJlZm9yZVNob3dcIiksYT1uP24uYXBwbHkoaSxbaSxzXSk6e30sYSE9PSExJiYobyhzLnNldHRpbmdzLGEpLHMubGFzdFZhbD1udWxsLHQuZGF0ZXBpY2tlci5fbGFzdElucHV0PWksdC5kYXRlcGlja2VyLl9zZXREYXRlRnJvbUZpZWxkKHMpLHQuZGF0ZXBpY2tlci5faW5EaWFsb2cmJihpLnZhbHVlPVwiXCIpLHQuZGF0ZXBpY2tlci5fcG9zfHwodC5kYXRlcGlja2VyLl9wb3M9dC5kYXRlcGlja2VyLl9maW5kUG9zKGkpLHQuZGF0ZXBpY2tlci5fcG9zWzFdKz1pLm9mZnNldEhlaWdodCkscj0hMSx0KGkpLnBhcmVudHMoKS5lYWNoKGZ1bmN0aW9uKCl7cmV0dXJuIHJ8PVwiZml4ZWRcIj09PXQodGhpcykuY3NzKFwicG9zaXRpb25cIiksIXJ9KSxsPXtsZWZ0OnQuZGF0ZXBpY2tlci5fcG9zWzBdLHRvcDp0LmRhdGVwaWNrZXIuX3Bvc1sxXX0sdC5kYXRlcGlja2VyLl9wb3M9bnVsbCxzLmRwRGl2LmVtcHR5KCkscy5kcERpdi5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIixkaXNwbGF5OlwiYmxvY2tcIix0b3A6XCItMTAwMHB4XCJ9KSx0LmRhdGVwaWNrZXIuX3VwZGF0ZURhdGVwaWNrZXIocyksbD10LmRhdGVwaWNrZXIuX2NoZWNrT2Zmc2V0KHMsbCxyKSxzLmRwRGl2LmNzcyh7cG9zaXRpb246dC5kYXRlcGlja2VyLl9pbkRpYWxvZyYmdC5ibG9ja1VJP1wic3RhdGljXCI6cj9cImZpeGVkXCI6XCJhYnNvbHV0ZVwiLGRpc3BsYXk6XCJub25lXCIsbGVmdDpsLmxlZnQrXCJweFwiLHRvcDpsLnRvcCtcInB4XCJ9KSxzLmlubGluZXx8KGg9dC5kYXRlcGlja2VyLl9nZXQocyxcInNob3dBbmltXCIpLGM9dC5kYXRlcGlja2VyLl9nZXQocyxcImR1cmF0aW9uXCIpLHMuZHBEaXYuY3NzKFwiei1pbmRleFwiLGUodChpKSkrMSksdC5kYXRlcGlja2VyLl9kYXRlcGlja2VyU2hvd2luZz0hMCx0LmVmZmVjdHMmJnQuZWZmZWN0cy5lZmZlY3RbaF0/cy5kcERpdi5zaG93KGgsdC5kYXRlcGlja2VyLl9nZXQocyxcInNob3dPcHRpb25zXCIpLGMpOnMuZHBEaXZbaHx8XCJzaG93XCJdKGg/YzpudWxsKSx0LmRhdGVwaWNrZXIuX3Nob3VsZEZvY3VzSW5wdXQocykmJnMuaW5wdXQudHJpZ2dlcihcImZvY3VzXCIpLHQuZGF0ZXBpY2tlci5fY3VySW5zdD1zKSl9fSxfdXBkYXRlRGF0ZXBpY2tlcjpmdW5jdGlvbihlKXt0aGlzLm1heFJvd3M9NCxsPWUsZS5kcERpdi5lbXB0eSgpLmFwcGVuZCh0aGlzLl9nZW5lcmF0ZUhUTUwoZSkpLHRoaXMuX2F0dGFjaEhhbmRsZXJzKGUpO3ZhciBpLHM9dGhpcy5fZ2V0TnVtYmVyT2ZNb250aHMoZSksbz1zWzFdLGE9MTcscj1lLmRwRGl2LmZpbmQoXCIuXCIrdGhpcy5fZGF5T3ZlckNsYXNzK1wiIGFcIik7ci5sZW5ndGg+MCYmbi5hcHBseShyLmdldCgwKSksZS5kcERpdi5yZW1vdmVDbGFzcyhcInVpLWRhdGVwaWNrZXItbXVsdGktMiB1aS1kYXRlcGlja2VyLW11bHRpLTMgdWktZGF0ZXBpY2tlci1tdWx0aS00XCIpLndpZHRoKFwiXCIpLG8+MSYmZS5kcERpdi5hZGRDbGFzcyhcInVpLWRhdGVwaWNrZXItbXVsdGktXCIrbykuY3NzKFwid2lkdGhcIixhKm8rXCJlbVwiKSxlLmRwRGl2WygxIT09c1swXXx8MSE9PXNbMV0/XCJhZGRcIjpcInJlbW92ZVwiKStcIkNsYXNzXCJdKFwidWktZGF0ZXBpY2tlci1tdWx0aVwiKSxlLmRwRGl2Wyh0aGlzLl9nZXQoZSxcImlzUlRMXCIpP1wiYWRkXCI6XCJyZW1vdmVcIikrXCJDbGFzc1wiXShcInVpLWRhdGVwaWNrZXItcnRsXCIpLGU9PT10LmRhdGVwaWNrZXIuX2N1ckluc3QmJnQuZGF0ZXBpY2tlci5fZGF0ZXBpY2tlclNob3dpbmcmJnQuZGF0ZXBpY2tlci5fc2hvdWxkRm9jdXNJbnB1dChlKSYmZS5pbnB1dC50cmlnZ2VyKFwiZm9jdXNcIiksZS55ZWFyc2h0bWwmJihpPWUueWVhcnNodG1sLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtpPT09ZS55ZWFyc2h0bWwmJmUueWVhcnNodG1sJiZlLmRwRGl2LmZpbmQoXCJzZWxlY3QudWktZGF0ZXBpY2tlci15ZWFyOmZpcnN0XCIpLnJlcGxhY2VXaXRoKGUueWVhcnNodG1sKSxpPWUueWVhcnNodG1sPW51bGx9LDApKX0sX3Nob3VsZEZvY3VzSW5wdXQ6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW5wdXQmJnQuaW5wdXQuaXMoXCI6dmlzaWJsZVwiKSYmIXQuaW5wdXQuaXMoXCI6ZGlzYWJsZWRcIikmJiF0LmlucHV0LmlzKFwiOmZvY3VzXCIpfSxfY2hlY2tPZmZzZXQ6ZnVuY3Rpb24oZSxpLHMpe3ZhciBuPWUuZHBEaXYub3V0ZXJXaWR0aCgpLG89ZS5kcERpdi5vdXRlckhlaWdodCgpLGE9ZS5pbnB1dD9lLmlucHV0Lm91dGVyV2lkdGgoKTowLHI9ZS5pbnB1dD9lLmlucHV0Lm91dGVySGVpZ2h0KCk6MCxsPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCsocz8wOnQoZG9jdW1lbnQpLnNjcm9sbExlZnQoKSksaD1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KyhzPzA6dChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO3JldHVybiBpLmxlZnQtPXRoaXMuX2dldChlLFwiaXNSVExcIik/bi1hOjAsaS5sZWZ0LT1zJiZpLmxlZnQ9PT1lLmlucHV0Lm9mZnNldCgpLmxlZnQ/dChkb2N1bWVudCkuc2Nyb2xsTGVmdCgpOjAsaS50b3AtPXMmJmkudG9wPT09ZS5pbnB1dC5vZmZzZXQoKS50b3Arcj90KGRvY3VtZW50KS5zY3JvbGxUb3AoKTowLGkubGVmdC09TWF0aC5taW4oaS5sZWZ0LGkubGVmdCtuPmwmJmw+bj9NYXRoLmFicyhpLmxlZnQrbi1sKTowKSxpLnRvcC09TWF0aC5taW4oaS50b3AsaS50b3Arbz5oJiZoPm8/TWF0aC5hYnMobytyKTowKSxpfSxfZmluZFBvczpmdW5jdGlvbihlKXtmb3IodmFyIGkscz10aGlzLl9nZXRJbnN0KGUpLG49dGhpcy5fZ2V0KHMsXCJpc1JUTFwiKTtlJiYoXCJoaWRkZW5cIj09PWUudHlwZXx8MSE9PWUubm9kZVR5cGV8fHQuZXhwci5maWx0ZXJzLmhpZGRlbihlKSk7KWU9ZVtuP1wicHJldmlvdXNTaWJsaW5nXCI6XCJuZXh0U2libGluZ1wiXTtyZXR1cm4gaT10KGUpLm9mZnNldCgpLFtpLmxlZnQsaS50b3BdfSxfaGlkZURhdGVwaWNrZXI6ZnVuY3Rpb24oZSl7dmFyIGkscyxuLG8sYT10aGlzLl9jdXJJbnN0OyFhfHxlJiZhIT09dC5kYXRhKGUsXCJkYXRlcGlja2VyXCIpfHx0aGlzLl9kYXRlcGlja2VyU2hvd2luZyYmKGk9dGhpcy5fZ2V0KGEsXCJzaG93QW5pbVwiKSxzPXRoaXMuX2dldChhLFwiZHVyYXRpb25cIiksbj1mdW5jdGlvbigpe3QuZGF0ZXBpY2tlci5fdGlkeURpYWxvZyhhKX0sdC5lZmZlY3RzJiYodC5lZmZlY3RzLmVmZmVjdFtpXXx8dC5lZmZlY3RzW2ldKT9hLmRwRGl2LmhpZGUoaSx0LmRhdGVwaWNrZXIuX2dldChhLFwic2hvd09wdGlvbnNcIikscyxuKTphLmRwRGl2W1wic2xpZGVEb3duXCI9PT1pP1wic2xpZGVVcFwiOlwiZmFkZUluXCI9PT1pP1wiZmFkZU91dFwiOlwiaGlkZVwiXShpP3M6bnVsbCxuKSxpfHxuKCksdGhpcy5fZGF0ZXBpY2tlclNob3dpbmc9ITEsbz10aGlzLl9nZXQoYSxcIm9uQ2xvc2VcIiksbyYmby5hcHBseShhLmlucHV0P2EuaW5wdXRbMF06bnVsbCxbYS5pbnB1dD9hLmlucHV0LnZhbCgpOlwiXCIsYV0pLHRoaXMuX2xhc3RJbnB1dD1udWxsLHRoaXMuX2luRGlhbG9nJiYodGhpcy5fZGlhbG9nSW5wdXQuY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsbGVmdDpcIjBcIix0b3A6XCItMTAwcHhcIn0pLHQuYmxvY2tVSSYmKHQudW5ibG9ja1VJKCksdChcImJvZHlcIikuYXBwZW5kKHRoaXMuZHBEaXYpKSksdGhpcy5faW5EaWFsb2c9ITEpfSxfdGlkeURpYWxvZzpmdW5jdGlvbih0KXt0LmRwRGl2LnJlbW92ZUNsYXNzKHRoaXMuX2RpYWxvZ0NsYXNzKS5vZmYoXCIudWktZGF0ZXBpY2tlci1jYWxlbmRhclwiKX0sX2NoZWNrRXh0ZXJuYWxDbGljazpmdW5jdGlvbihlKXtpZih0LmRhdGVwaWNrZXIuX2N1ckluc3Qpe3ZhciBpPXQoZS50YXJnZXQpLHM9dC5kYXRlcGlja2VyLl9nZXRJbnN0KGlbMF0pOyhpWzBdLmlkIT09dC5kYXRlcGlja2VyLl9tYWluRGl2SWQmJjA9PT1pLnBhcmVudHMoXCIjXCIrdC5kYXRlcGlja2VyLl9tYWluRGl2SWQpLmxlbmd0aCYmIWkuaGFzQ2xhc3ModC5kYXRlcGlja2VyLm1hcmtlckNsYXNzTmFtZSkmJiFpLmNsb3Nlc3QoXCIuXCIrdC5kYXRlcGlja2VyLl90cmlnZ2VyQ2xhc3MpLmxlbmd0aCYmdC5kYXRlcGlja2VyLl9kYXRlcGlja2VyU2hvd2luZyYmKCF0LmRhdGVwaWNrZXIuX2luRGlhbG9nfHwhdC5ibG9ja1VJKXx8aS5oYXNDbGFzcyh0LmRhdGVwaWNrZXIubWFya2VyQ2xhc3NOYW1lKSYmdC5kYXRlcGlja2VyLl9jdXJJbnN0IT09cykmJnQuZGF0ZXBpY2tlci5faGlkZURhdGVwaWNrZXIoKX19LF9hZGp1c3REYXRlOmZ1bmN0aW9uKGUsaSxzKXt2YXIgbj10KGUpLG89dGhpcy5fZ2V0SW5zdChuWzBdKTt0aGlzLl9pc0Rpc2FibGVkRGF0ZXBpY2tlcihuWzBdKXx8KHRoaXMuX2FkanVzdEluc3REYXRlKG8saSsoXCJNXCI9PT1zP3RoaXMuX2dldChvLFwic2hvd0N1cnJlbnRBdFBvc1wiKTowKSxzKSx0aGlzLl91cGRhdGVEYXRlcGlja2VyKG8pKX0sX2dvdG9Ub2RheTpmdW5jdGlvbihlKXt2YXIgaSxzPXQoZSksbj10aGlzLl9nZXRJbnN0KHNbMF0pO3RoaXMuX2dldChuLFwiZ290b0N1cnJlbnRcIikmJm4uY3VycmVudERheT8obi5zZWxlY3RlZERheT1uLmN1cnJlbnREYXksbi5kcmF3TW9udGg9bi5zZWxlY3RlZE1vbnRoPW4uY3VycmVudE1vbnRoLG4uZHJhd1llYXI9bi5zZWxlY3RlZFllYXI9bi5jdXJyZW50WWVhcik6KGk9bmV3IERhdGUsbi5zZWxlY3RlZERheT1pLmdldERhdGUoKSxuLmRyYXdNb250aD1uLnNlbGVjdGVkTW9udGg9aS5nZXRNb250aCgpLG4uZHJhd1llYXI9bi5zZWxlY3RlZFllYXI9aS5nZXRGdWxsWWVhcigpKSx0aGlzLl9ub3RpZnlDaGFuZ2UobiksdGhpcy5fYWRqdXN0RGF0ZShzKX0sX3NlbGVjdE1vbnRoWWVhcjpmdW5jdGlvbihlLGkscyl7dmFyIG49dChlKSxvPXRoaXMuX2dldEluc3QoblswXSk7b1tcInNlbGVjdGVkXCIrKFwiTVwiPT09cz9cIk1vbnRoXCI6XCJZZWFyXCIpXT1vW1wiZHJhd1wiKyhcIk1cIj09PXM/XCJNb250aFwiOlwiWWVhclwiKV09cGFyc2VJbnQoaS5vcHRpb25zW2kuc2VsZWN0ZWRJbmRleF0udmFsdWUsMTApLHRoaXMuX25vdGlmeUNoYW5nZShvKSx0aGlzLl9hZGp1c3REYXRlKG4pfSxfc2VsZWN0RGF5OmZ1bmN0aW9uKGUsaSxzLG4pe3ZhciBvLGE9dChlKTt0KG4pLmhhc0NsYXNzKHRoaXMuX3Vuc2VsZWN0YWJsZUNsYXNzKXx8dGhpcy5faXNEaXNhYmxlZERhdGVwaWNrZXIoYVswXSl8fChvPXRoaXMuX2dldEluc3QoYVswXSksby5zZWxlY3RlZERheT1vLmN1cnJlbnREYXk9dChcImFcIixuKS5odG1sKCksby5zZWxlY3RlZE1vbnRoPW8uY3VycmVudE1vbnRoPWksby5zZWxlY3RlZFllYXI9by5jdXJyZW50WWVhcj1zLHRoaXMuX3NlbGVjdERhdGUoZSx0aGlzLl9mb3JtYXREYXRlKG8sby5jdXJyZW50RGF5LG8uY3VycmVudE1vbnRoLG8uY3VycmVudFllYXIpKSl9LF9jbGVhckRhdGU6ZnVuY3Rpb24oZSl7dmFyIGk9dChlKTt0aGlzLl9zZWxlY3REYXRlKGksXCJcIil9LF9zZWxlY3REYXRlOmZ1bmN0aW9uKGUsaSl7dmFyIHMsbj10KGUpLG89dGhpcy5fZ2V0SW5zdChuWzBdKTtpPW51bGwhPWk/aTp0aGlzLl9mb3JtYXREYXRlKG8pLG8uaW5wdXQmJm8uaW5wdXQudmFsKGkpLHRoaXMuX3VwZGF0ZUFsdGVybmF0ZShvKSxzPXRoaXMuX2dldChvLFwib25TZWxlY3RcIikscz9zLmFwcGx5KG8uaW5wdXQ/by5pbnB1dFswXTpudWxsLFtpLG9dKTpvLmlucHV0JiZvLmlucHV0LnRyaWdnZXIoXCJjaGFuZ2VcIiksby5pbmxpbmU/dGhpcy5fdXBkYXRlRGF0ZXBpY2tlcihvKToodGhpcy5faGlkZURhdGVwaWNrZXIoKSx0aGlzLl9sYXN0SW5wdXQ9by5pbnB1dFswXSxcIm9iamVjdFwiIT10eXBlb2Ygby5pbnB1dFswXSYmby5pbnB1dC50cmlnZ2VyKFwiZm9jdXNcIiksdGhpcy5fbGFzdElucHV0PW51bGwpfSxfdXBkYXRlQWx0ZXJuYXRlOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbixvPXRoaXMuX2dldChlLFwiYWx0RmllbGRcIik7byYmKGk9dGhpcy5fZ2V0KGUsXCJhbHRGb3JtYXRcIil8fHRoaXMuX2dldChlLFwiZGF0ZUZvcm1hdFwiKSxzPXRoaXMuX2dldERhdGUoZSksbj10aGlzLmZvcm1hdERhdGUoaSxzLHRoaXMuX2dldEZvcm1hdENvbmZpZyhlKSksdChvKS52YWwobikpfSxub1dlZWtlbmRzOmZ1bmN0aW9uKHQpe3ZhciBlPXQuZ2V0RGF5KCk7cmV0dXJuW2U+MCYmNj5lLFwiXCJdfSxpc284NjAxV2VlazpmdW5jdGlvbih0KXt2YXIgZSxpPW5ldyBEYXRlKHQuZ2V0VGltZSgpKTtyZXR1cm4gaS5zZXREYXRlKGkuZ2V0RGF0ZSgpKzQtKGkuZ2V0RGF5KCl8fDcpKSxlPWkuZ2V0VGltZSgpLGkuc2V0TW9udGgoMCksaS5zZXREYXRlKDEpLE1hdGguZmxvb3IoTWF0aC5yb3VuZCgoZS1pKS84NjRlNSkvNykrMX0scGFyc2VEYXRlOmZ1bmN0aW9uKGUsaSxzKXtpZihudWxsPT1lfHxudWxsPT1pKXRocm93XCJJbnZhbGlkIGFyZ3VtZW50c1wiO2lmKGk9XCJvYmplY3RcIj09dHlwZW9mIGk/XCJcIitpOmkrXCJcIixcIlwiPT09aSlyZXR1cm4gbnVsbDt2YXIgbixvLGEscixsPTAsaD0ocz9zLnNob3J0WWVhckN1dG9mZjpudWxsKXx8dGhpcy5fZGVmYXVsdHMuc2hvcnRZZWFyQ3V0b2ZmLGM9XCJzdHJpbmdcIiE9dHlwZW9mIGg/aDoobmV3IERhdGUpLmdldEZ1bGxZZWFyKCklMTAwK3BhcnNlSW50KGgsMTApLHU9KHM/cy5kYXlOYW1lc1Nob3J0Om51bGwpfHx0aGlzLl9kZWZhdWx0cy5kYXlOYW1lc1Nob3J0LGQ9KHM/cy5kYXlOYW1lczpudWxsKXx8dGhpcy5fZGVmYXVsdHMuZGF5TmFtZXMscD0ocz9zLm1vbnRoTmFtZXNTaG9ydDpudWxsKXx8dGhpcy5fZGVmYXVsdHMubW9udGhOYW1lc1Nob3J0LGY9KHM/cy5tb250aE5hbWVzOm51bGwpfHx0aGlzLl9kZWZhdWx0cy5tb250aE5hbWVzLGc9LTEsbT0tMSxfPS0xLHY9LTEsYj0hMSx5PWZ1bmN0aW9uKHQpe3ZhciBpPWUubGVuZ3RoPm4rMSYmZS5jaGFyQXQobisxKT09PXQ7cmV0dXJuIGkmJm4rKyxpfSx3PWZ1bmN0aW9uKHQpe3ZhciBlPXkodCkscz1cIkBcIj09PXQ/MTQ6XCIhXCI9PT10PzIwOlwieVwiPT09dCYmZT80Olwib1wiPT09dD8zOjIsbj1cInlcIj09PXQ/czoxLG89UmVnRXhwKFwiXlxcXFxke1wiK24rXCIsXCIrcytcIn1cIiksYT1pLnN1YnN0cmluZyhsKS5tYXRjaChvKTtpZighYSl0aHJvd1wiTWlzc2luZyBudW1iZXIgYXQgcG9zaXRpb24gXCIrbDtyZXR1cm4gbCs9YVswXS5sZW5ndGgscGFyc2VJbnQoYVswXSwxMCl9LGs9ZnVuY3Rpb24oZSxzLG4pe3ZhciBvPS0xLGE9dC5tYXAoeShlKT9uOnMsZnVuY3Rpb24odCxlKXtyZXR1cm5bW2UsdF1dfSkuc29ydChmdW5jdGlvbih0LGUpe3JldHVybi0odFsxXS5sZW5ndGgtZVsxXS5sZW5ndGgpfSk7aWYodC5lYWNoKGEsZnVuY3Rpb24odCxlKXt2YXIgcz1lWzFdO3JldHVybiBpLnN1YnN0cihsLHMubGVuZ3RoKS50b0xvd2VyQ2FzZSgpPT09cy50b0xvd2VyQ2FzZSgpPyhvPWVbMF0sbCs9cy5sZW5ndGgsITEpOnZvaWQgMH0pLC0xIT09bylyZXR1cm4gbysxO3Rocm93XCJVbmtub3duIG5hbWUgYXQgcG9zaXRpb24gXCIrbH0seD1mdW5jdGlvbigpe2lmKGkuY2hhckF0KGwpIT09ZS5jaGFyQXQobikpdGhyb3dcIlVuZXhwZWN0ZWQgbGl0ZXJhbCBhdCBwb3NpdGlvbiBcIitsO2wrK307Zm9yKG49MDtlLmxlbmd0aD5uO24rKylpZihiKVwiJ1wiIT09ZS5jaGFyQXQobil8fHkoXCInXCIpP3goKTpiPSExO2Vsc2Ugc3dpdGNoKGUuY2hhckF0KG4pKXtjYXNlXCJkXCI6Xz13KFwiZFwiKTticmVhaztjYXNlXCJEXCI6ayhcIkRcIix1LGQpO2JyZWFrO2Nhc2VcIm9cIjp2PXcoXCJvXCIpO2JyZWFrO2Nhc2VcIm1cIjptPXcoXCJtXCIpO2JyZWFrO2Nhc2VcIk1cIjptPWsoXCJNXCIscCxmKTticmVhaztjYXNlXCJ5XCI6Zz13KFwieVwiKTticmVhaztjYXNlXCJAXCI6cj1uZXcgRGF0ZSh3KFwiQFwiKSksZz1yLmdldEZ1bGxZZWFyKCksbT1yLmdldE1vbnRoKCkrMSxfPXIuZ2V0RGF0ZSgpO2JyZWFrO2Nhc2VcIiFcIjpyPW5ldyBEYXRlKCh3KFwiIVwiKS10aGlzLl90aWNrc1RvMTk3MCkvMWU0KSxnPXIuZ2V0RnVsbFllYXIoKSxtPXIuZ2V0TW9udGgoKSsxLF89ci5nZXREYXRlKCk7YnJlYWs7Y2FzZVwiJ1wiOnkoXCInXCIpP3goKTpiPSEwO2JyZWFrO2RlZmF1bHQ6eCgpfWlmKGkubGVuZ3RoPmwmJihhPWkuc3Vic3RyKGwpLCEvXlxccysvLnRlc3QoYSkpKXRocm93XCJFeHRyYS91bnBhcnNlZCBjaGFyYWN0ZXJzIGZvdW5kIGluIGRhdGU6IFwiK2E7aWYoLTE9PT1nP2c9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpOjEwMD5nJiYoZys9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSUxMDArKGM+PWc/MDotMTAwKSksdj4tMSlmb3IobT0xLF89djs7KXtpZihvPXRoaXMuX2dldERheXNJbk1vbnRoKGcsbS0xKSxvPj1fKWJyZWFrO20rKyxfLT1vfWlmKHI9dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUoZyxtLTEsXykpLHIuZ2V0RnVsbFllYXIoKSE9PWd8fHIuZ2V0TW9udGgoKSsxIT09bXx8ci5nZXREYXRlKCkhPT1fKXRocm93XCJJbnZhbGlkIGRhdGVcIjtyZXR1cm4gcn0sQVRPTTpcInl5LW1tLWRkXCIsQ09PS0lFOlwiRCwgZGQgTSB5eVwiLElTT184NjAxOlwieXktbW0tZGRcIixSRkNfODIyOlwiRCwgZCBNIHlcIixSRkNfODUwOlwiREQsIGRkLU0teVwiLFJGQ18xMDM2OlwiRCwgZCBNIHlcIixSRkNfMTEyMzpcIkQsIGQgTSB5eVwiLFJGQ18yODIyOlwiRCwgZCBNIHl5XCIsUlNTOlwiRCwgZCBNIHlcIixUSUNLUzpcIiFcIixUSU1FU1RBTVA6XCJAXCIsVzNDOlwieXktbW0tZGRcIixfdGlja3NUbzE5NzA6MWU3KjYwKjYwKjI0Kig3MTg2ODUrTWF0aC5mbG9vcig0OTIuNSktTWF0aC5mbG9vcigxOS43KStNYXRoLmZsb29yKDQuOTI1KSksZm9ybWF0RGF0ZTpmdW5jdGlvbih0LGUsaSl7aWYoIWUpcmV0dXJuXCJcIjt2YXIgcyxuPShpP2kuZGF5TmFtZXNTaG9ydDpudWxsKXx8dGhpcy5fZGVmYXVsdHMuZGF5TmFtZXNTaG9ydCxvPShpP2kuZGF5TmFtZXM6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLmRheU5hbWVzLGE9KGk/aS5tb250aE5hbWVzU2hvcnQ6bnVsbCl8fHRoaXMuX2RlZmF1bHRzLm1vbnRoTmFtZXNTaG9ydCxyPShpP2kubW9udGhOYW1lczpudWxsKXx8dGhpcy5fZGVmYXVsdHMubW9udGhOYW1lcyxsPWZ1bmN0aW9uKGUpe3ZhciBpPXQubGVuZ3RoPnMrMSYmdC5jaGFyQXQocysxKT09PWU7cmV0dXJuIGkmJnMrKyxpfSxoPWZ1bmN0aW9uKHQsZSxpKXt2YXIgcz1cIlwiK2U7aWYobCh0KSlmb3IoO2k+cy5sZW5ndGg7KXM9XCIwXCIrcztyZXR1cm4gc30sYz1mdW5jdGlvbih0LGUsaSxzKXtyZXR1cm4gbCh0KT9zW2VdOmlbZV19LHU9XCJcIixkPSExO2lmKGUpZm9yKHM9MDt0Lmxlbmd0aD5zO3MrKylpZihkKVwiJ1wiIT09dC5jaGFyQXQocyl8fGwoXCInXCIpP3UrPXQuY2hhckF0KHMpOmQ9ITE7ZWxzZSBzd2l0Y2godC5jaGFyQXQocykpe2Nhc2VcImRcIjp1Kz1oKFwiZFwiLGUuZ2V0RGF0ZSgpLDIpO2JyZWFrO2Nhc2VcIkRcIjp1Kz1jKFwiRFwiLGUuZ2V0RGF5KCksbixvKTticmVhaztjYXNlXCJvXCI6dSs9aChcIm9cIixNYXRoLnJvdW5kKChuZXcgRGF0ZShlLmdldEZ1bGxZZWFyKCksZS5nZXRNb250aCgpLGUuZ2V0RGF0ZSgpKS5nZXRUaW1lKCktbmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLDAsMCkuZ2V0VGltZSgpKS84NjRlNSksMyk7YnJlYWs7Y2FzZVwibVwiOnUrPWgoXCJtXCIsZS5nZXRNb250aCgpKzEsMik7YnJlYWs7Y2FzZVwiTVwiOnUrPWMoXCJNXCIsZS5nZXRNb250aCgpLGEscik7YnJlYWs7Y2FzZVwieVwiOnUrPWwoXCJ5XCIpP2UuZ2V0RnVsbFllYXIoKTooMTA+ZS5nZXRGdWxsWWVhcigpJTEwMD9cIjBcIjpcIlwiKStlLmdldEZ1bGxZZWFyKCklMTAwO2JyZWFrO2Nhc2VcIkBcIjp1Kz1lLmdldFRpbWUoKTticmVhaztjYXNlXCIhXCI6dSs9MWU0KmUuZ2V0VGltZSgpK3RoaXMuX3RpY2tzVG8xOTcwO2JyZWFrO2Nhc2VcIidcIjpsKFwiJ1wiKT91Kz1cIidcIjpkPSEwO2JyZWFrO2RlZmF1bHQ6dSs9dC5jaGFyQXQocyl9cmV0dXJuIHV9LF9wb3NzaWJsZUNoYXJzOmZ1bmN0aW9uKHQpe3ZhciBlLGk9XCJcIixzPSExLG49ZnVuY3Rpb24oaSl7dmFyIHM9dC5sZW5ndGg+ZSsxJiZ0LmNoYXJBdChlKzEpPT09aTtyZXR1cm4gcyYmZSsrLHN9O2ZvcihlPTA7dC5sZW5ndGg+ZTtlKyspaWYocylcIidcIiE9PXQuY2hhckF0KGUpfHxuKFwiJ1wiKT9pKz10LmNoYXJBdChlKTpzPSExO2Vsc2Ugc3dpdGNoKHQuY2hhckF0KGUpKXtjYXNlXCJkXCI6Y2FzZVwibVwiOmNhc2VcInlcIjpjYXNlXCJAXCI6aSs9XCIwMTIzNDU2Nzg5XCI7YnJlYWs7Y2FzZVwiRFwiOmNhc2VcIk1cIjpyZXR1cm4gbnVsbDtjYXNlXCInXCI6bihcIidcIik/aSs9XCInXCI6cz0hMDticmVhaztkZWZhdWx0OmkrPXQuY2hhckF0KGUpfXJldHVybiBpfSxfZ2V0OmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHZvaWQgMCE9PXQuc2V0dGluZ3NbZV0/dC5zZXR0aW5nc1tlXTp0aGlzLl9kZWZhdWx0c1tlXX0sX3NldERhdGVGcm9tRmllbGQ6ZnVuY3Rpb24odCxlKXtpZih0LmlucHV0LnZhbCgpIT09dC5sYXN0VmFsKXt2YXIgaT10aGlzLl9nZXQodCxcImRhdGVGb3JtYXRcIikscz10Lmxhc3RWYWw9dC5pbnB1dD90LmlucHV0LnZhbCgpOm51bGwsbj10aGlzLl9nZXREZWZhdWx0RGF0ZSh0KSxvPW4sYT10aGlzLl9nZXRGb3JtYXRDb25maWcodCk7dHJ5e289dGhpcy5wYXJzZURhdGUoaSxzLGEpfHxufWNhdGNoKHIpe3M9ZT9cIlwiOnN9dC5zZWxlY3RlZERheT1vLmdldERhdGUoKSx0LmRyYXdNb250aD10LnNlbGVjdGVkTW9udGg9by5nZXRNb250aCgpLHQuZHJhd1llYXI9dC5zZWxlY3RlZFllYXI9by5nZXRGdWxsWWVhcigpLHQuY3VycmVudERheT1zP28uZ2V0RGF0ZSgpOjAsdC5jdXJyZW50TW9udGg9cz9vLmdldE1vbnRoKCk6MCx0LmN1cnJlbnRZZWFyPXM/by5nZXRGdWxsWWVhcigpOjAsdGhpcy5fYWRqdXN0SW5zdERhdGUodCl9fSxfZ2V0RGVmYXVsdERhdGU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX3Jlc3RyaWN0TWluTWF4KHQsdGhpcy5fZGV0ZXJtaW5lRGF0ZSh0LHRoaXMuX2dldCh0LFwiZGVmYXVsdERhdGVcIiksbmV3IERhdGUpKX0sX2RldGVybWluZURhdGU6ZnVuY3Rpb24oZSxpLHMpe3ZhciBuPWZ1bmN0aW9uKHQpe3ZhciBlPW5ldyBEYXRlO3JldHVybiBlLnNldERhdGUoZS5nZXREYXRlKCkrdCksZX0sbz1mdW5jdGlvbihpKXt0cnl7cmV0dXJuIHQuZGF0ZXBpY2tlci5wYXJzZURhdGUodC5kYXRlcGlja2VyLl9nZXQoZSxcImRhdGVGb3JtYXRcIiksaSx0LmRhdGVwaWNrZXIuX2dldEZvcm1hdENvbmZpZyhlKSl9Y2F0Y2gocyl7fWZvcih2YXIgbj0oaS50b0xvd2VyQ2FzZSgpLm1hdGNoKC9eYy8pP3QuZGF0ZXBpY2tlci5fZ2V0RGF0ZShlKTpudWxsKXx8bmV3IERhdGUsbz1uLmdldEZ1bGxZZWFyKCksYT1uLmdldE1vbnRoKCkscj1uLmdldERhdGUoKSxsPS8oWytcXC1dP1swLTldKylcXHMqKGR8RHx3fFd8bXxNfHl8WSk/L2csaD1sLmV4ZWMoaSk7aDspe3N3aXRjaChoWzJdfHxcImRcIil7Y2FzZVwiZFwiOmNhc2VcIkRcIjpyKz1wYXJzZUludChoWzFdLDEwKTticmVhaztjYXNlXCJ3XCI6Y2FzZVwiV1wiOnIrPTcqcGFyc2VJbnQoaFsxXSwxMCk7YnJlYWs7Y2FzZVwibVwiOmNhc2VcIk1cIjphKz1wYXJzZUludChoWzFdLDEwKSxyPU1hdGgubWluKHIsdC5kYXRlcGlja2VyLl9nZXREYXlzSW5Nb250aChvLGEpKTticmVhaztjYXNlXCJ5XCI6Y2FzZVwiWVwiOm8rPXBhcnNlSW50KGhbMV0sMTApLHI9TWF0aC5taW4ocix0LmRhdGVwaWNrZXIuX2dldERheXNJbk1vbnRoKG8sYSkpfWg9bC5leGVjKGkpfXJldHVybiBuZXcgRGF0ZShvLGEscil9LGE9bnVsbD09aXx8XCJcIj09PWk/czpcInN0cmluZ1wiPT10eXBlb2YgaT9vKGkpOlwibnVtYmVyXCI9PXR5cGVvZiBpP2lzTmFOKGkpP3M6bihpKTpuZXcgRGF0ZShpLmdldFRpbWUoKSk7cmV0dXJuIGE9YSYmXCJJbnZhbGlkIERhdGVcIj09XCJcIithP3M6YSxhJiYoYS5zZXRIb3VycygwKSxhLnNldE1pbnV0ZXMoMCksYS5zZXRTZWNvbmRzKDApLGEuc2V0TWlsbGlzZWNvbmRzKDApKSx0aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChhKX0sX2RheWxpZ2h0U2F2aW5nQWRqdXN0OmZ1bmN0aW9uKHQpe3JldHVybiB0Pyh0LnNldEhvdXJzKHQuZ2V0SG91cnMoKT4xMj90LmdldEhvdXJzKCkrMjowKSx0KTpudWxsfSxfc2V0RGF0ZTpmdW5jdGlvbih0LGUsaSl7dmFyIHM9IWUsbj10LnNlbGVjdGVkTW9udGgsbz10LnNlbGVjdGVkWWVhcixhPXRoaXMuX3Jlc3RyaWN0TWluTWF4KHQsdGhpcy5fZGV0ZXJtaW5lRGF0ZSh0LGUsbmV3IERhdGUpKTt0LnNlbGVjdGVkRGF5PXQuY3VycmVudERheT1hLmdldERhdGUoKSx0LmRyYXdNb250aD10LnNlbGVjdGVkTW9udGg9dC5jdXJyZW50TW9udGg9YS5nZXRNb250aCgpLHQuZHJhd1llYXI9dC5zZWxlY3RlZFllYXI9dC5jdXJyZW50WWVhcj1hLmdldEZ1bGxZZWFyKCksbj09PXQuc2VsZWN0ZWRNb250aCYmbz09PXQuc2VsZWN0ZWRZZWFyfHxpfHx0aGlzLl9ub3RpZnlDaGFuZ2UodCksdGhpcy5fYWRqdXN0SW5zdERhdGUodCksdC5pbnB1dCYmdC5pbnB1dC52YWwocz9cIlwiOnRoaXMuX2Zvcm1hdERhdGUodCkpfSxfZ2V0RGF0ZTpmdW5jdGlvbih0KXt2YXIgZT0hdC5jdXJyZW50WWVhcnx8dC5pbnB1dCYmXCJcIj09PXQuaW5wdXQudmFsKCk/bnVsbDp0aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZSh0LmN1cnJlbnRZZWFyLHQuY3VycmVudE1vbnRoLHQuY3VycmVudERheSkpO3JldHVybiBlfSxfYXR0YWNoSGFuZGxlcnM6ZnVuY3Rpb24oZSl7dmFyIGk9dGhpcy5fZ2V0KGUsXCJzdGVwTW9udGhzXCIpLHM9XCIjXCIrZS5pZC5yZXBsYWNlKC9cXFxcXFxcXC9nLFwiXFxcXFwiKTtlLmRwRGl2LmZpbmQoXCJbZGF0YS1oYW5kbGVyXVwiKS5tYXAoZnVuY3Rpb24oKXt2YXIgZT17cHJldjpmdW5jdGlvbigpe3QuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShzLC1pLFwiTVwiKX0sbmV4dDpmdW5jdGlvbigpe3QuZGF0ZXBpY2tlci5fYWRqdXN0RGF0ZShzLCtpLFwiTVwiKX0saGlkZTpmdW5jdGlvbigpe3QuZGF0ZXBpY2tlci5faGlkZURhdGVwaWNrZXIoKX0sdG9kYXk6ZnVuY3Rpb24oKXt0LmRhdGVwaWNrZXIuX2dvdG9Ub2RheShzKX0sc2VsZWN0RGF5OmZ1bmN0aW9uKCl7cmV0dXJuIHQuZGF0ZXBpY2tlci5fc2VsZWN0RGF5KHMsK3RoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1tb250aFwiKSwrdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXllYXJcIiksdGhpcyksITF9LHNlbGVjdE1vbnRoOmZ1bmN0aW9uKCl7cmV0dXJuIHQuZGF0ZXBpY2tlci5fc2VsZWN0TW9udGhZZWFyKHMsdGhpcyxcIk1cIiksITF9LHNlbGVjdFllYXI6ZnVuY3Rpb24oKXtyZXR1cm4gdC5kYXRlcGlja2VyLl9zZWxlY3RNb250aFllYXIocyx0aGlzLFwiWVwiKSwhMX19O3QodGhpcykub24odGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWV2ZW50XCIpLGVbdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWhhbmRsZXJcIildKX0pfSxfZ2VuZXJhdGVIVE1MOmZ1bmN0aW9uKHQpe3ZhciBlLGkscyxuLG8sYSxyLGwsaCxjLHUsZCxwLGYsZyxtLF8sdixiLHksdyxrLHgsQyxELFQsSSxNLFAsUyxOLEgsQSx6LE8sRSxXLEYsTCxSPW5ldyBEYXRlLFk9dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUoUi5nZXRGdWxsWWVhcigpLFIuZ2V0TW9udGgoKSxSLmdldERhdGUoKSkpLEI9dGhpcy5fZ2V0KHQsXCJpc1JUTFwiKSxqPXRoaXMuX2dldCh0LFwic2hvd0J1dHRvblBhbmVsXCIpLHE9dGhpcy5fZ2V0KHQsXCJoaWRlSWZOb1ByZXZOZXh0XCIpLEs9dGhpcy5fZ2V0KHQsXCJuYXZpZ2F0aW9uQXNEYXRlRm9ybWF0XCIpLFU9dGhpcy5fZ2V0TnVtYmVyT2ZNb250aHModCksVj10aGlzLl9nZXQodCxcInNob3dDdXJyZW50QXRQb3NcIiksWD10aGlzLl9nZXQodCxcInN0ZXBNb250aHNcIiksJD0xIT09VVswXXx8MSE9PVVbMV0sRz10aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdCh0LmN1cnJlbnREYXk/bmV3IERhdGUodC5jdXJyZW50WWVhcix0LmN1cnJlbnRNb250aCx0LmN1cnJlbnREYXkpOm5ldyBEYXRlKDk5OTksOSw5KSksSj10aGlzLl9nZXRNaW5NYXhEYXRlKHQsXCJtaW5cIiksUT10aGlzLl9nZXRNaW5NYXhEYXRlKHQsXCJtYXhcIiksWj10LmRyYXdNb250aC1WLHRlPXQuZHJhd1llYXI7aWYoMD5aJiYoWis9MTIsdGUtLSksUSlmb3IoZT10aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZShRLmdldEZ1bGxZZWFyKCksUS5nZXRNb250aCgpLVVbMF0qVVsxXSsxLFEuZ2V0RGF0ZSgpKSksZT1KJiZKPmU/SjplO3RoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKHRlLFosMSkpPmU7KVotLSwwPlomJihaPTExLHRlLS0pO2Zvcih0LmRyYXdNb250aD1aLHQuZHJhd1llYXI9dGUsaT10aGlzLl9nZXQodCxcInByZXZUZXh0XCIpLGk9Sz90aGlzLmZvcm1hdERhdGUoaSx0aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZSh0ZSxaLVgsMSkpLHRoaXMuX2dldEZvcm1hdENvbmZpZyh0KSk6aSxzPXRoaXMuX2NhbkFkanVzdE1vbnRoKHQsLTEsdGUsWik/XCI8YSBjbGFzcz0ndWktZGF0ZXBpY2tlci1wcmV2IHVpLWNvcm5lci1hbGwnIGRhdGEtaGFuZGxlcj0ncHJldicgZGF0YS1ldmVudD0nY2xpY2snIHRpdGxlPSdcIitpK1wiJz48c3BhbiBjbGFzcz0ndWktaWNvbiB1aS1pY29uLWNpcmNsZS10cmlhbmdsZS1cIisoQj9cImVcIjpcIndcIikrXCInPlwiK2krXCI8L3NwYW4+PC9hPlwiOnE/XCJcIjpcIjxhIGNsYXNzPSd1aS1kYXRlcGlja2VyLXByZXYgdWktY29ybmVyLWFsbCB1aS1zdGF0ZS1kaXNhYmxlZCcgdGl0bGU9J1wiK2krXCInPjxzcGFuIGNsYXNzPSd1aS1pY29uIHVpLWljb24tY2lyY2xlLXRyaWFuZ2xlLVwiKyhCP1wiZVwiOlwid1wiKStcIic+XCIraStcIjwvc3Bhbj48L2E+XCIsbj10aGlzLl9nZXQodCxcIm5leHRUZXh0XCIpLG49Sz90aGlzLmZvcm1hdERhdGUobix0aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZSh0ZSxaK1gsMSkpLHRoaXMuX2dldEZvcm1hdENvbmZpZyh0KSk6bixvPXRoaXMuX2NhbkFkanVzdE1vbnRoKHQsMSx0ZSxaKT9cIjxhIGNsYXNzPSd1aS1kYXRlcGlja2VyLW5leHQgdWktY29ybmVyLWFsbCcgZGF0YS1oYW5kbGVyPSduZXh0JyBkYXRhLWV2ZW50PSdjbGljaycgdGl0bGU9J1wiK24rXCInPjxzcGFuIGNsYXNzPSd1aS1pY29uIHVpLWljb24tY2lyY2xlLXRyaWFuZ2xlLVwiKyhCP1wid1wiOlwiZVwiKStcIic+XCIrbitcIjwvc3Bhbj48L2E+XCI6cT9cIlwiOlwiPGEgY2xhc3M9J3VpLWRhdGVwaWNrZXItbmV4dCB1aS1jb3JuZXItYWxsIHVpLXN0YXRlLWRpc2FibGVkJyB0aXRsZT0nXCIrbitcIic+PHNwYW4gY2xhc3M9J3VpLWljb24gdWktaWNvbi1jaXJjbGUtdHJpYW5nbGUtXCIrKEI/XCJ3XCI6XCJlXCIpK1wiJz5cIituK1wiPC9zcGFuPjwvYT5cIixhPXRoaXMuX2dldCh0LFwiY3VycmVudFRleHRcIikscj10aGlzLl9nZXQodCxcImdvdG9DdXJyZW50XCIpJiZ0LmN1cnJlbnREYXk/RzpZLGE9Sz90aGlzLmZvcm1hdERhdGUoYSxyLHRoaXMuX2dldEZvcm1hdENvbmZpZyh0KSk6YSxsPXQuaW5saW5lP1wiXCI6XCI8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9J3VpLWRhdGVwaWNrZXItY2xvc2UgdWktc3RhdGUtZGVmYXVsdCB1aS1wcmlvcml0eS1wcmltYXJ5IHVpLWNvcm5lci1hbGwnIGRhdGEtaGFuZGxlcj0naGlkZScgZGF0YS1ldmVudD0nY2xpY2snPlwiK3RoaXMuX2dldCh0LFwiY2xvc2VUZXh0XCIpK1wiPC9idXR0b24+XCIsaD1qP1wiPGRpdiBjbGFzcz0ndWktZGF0ZXBpY2tlci1idXR0b25wYW5lIHVpLXdpZGdldC1jb250ZW50Jz5cIisoQj9sOlwiXCIpKyh0aGlzLl9pc0luUmFuZ2UodCxyKT9cIjxidXR0b24gdHlwZT0nYnV0dG9uJyBjbGFzcz0ndWktZGF0ZXBpY2tlci1jdXJyZW50IHVpLXN0YXRlLWRlZmF1bHQgdWktcHJpb3JpdHktc2Vjb25kYXJ5IHVpLWNvcm5lci1hbGwnIGRhdGEtaGFuZGxlcj0ndG9kYXknIGRhdGEtZXZlbnQ9J2NsaWNrJz5cIithK1wiPC9idXR0b24+XCI6XCJcIikrKEI/XCJcIjpsKStcIjwvZGl2PlwiOlwiXCIsYz1wYXJzZUludCh0aGlzLl9nZXQodCxcImZpcnN0RGF5XCIpLDEwKSxjPWlzTmFOKGMpPzA6Yyx1PXRoaXMuX2dldCh0LFwic2hvd1dlZWtcIiksZD10aGlzLl9nZXQodCxcImRheU5hbWVzXCIpLHA9dGhpcy5fZ2V0KHQsXCJkYXlOYW1lc01pblwiKSxmPXRoaXMuX2dldCh0LFwibW9udGhOYW1lc1wiKSxnPXRoaXMuX2dldCh0LFwibW9udGhOYW1lc1Nob3J0XCIpLG09dGhpcy5fZ2V0KHQsXCJiZWZvcmVTaG93RGF5XCIpLF89dGhpcy5fZ2V0KHQsXCJzaG93T3RoZXJNb250aHNcIiksdj10aGlzLl9nZXQodCxcInNlbGVjdE90aGVyTW9udGhzXCIpLGI9dGhpcy5fZ2V0RGVmYXVsdERhdGUodCkseT1cIlwiLGs9MDtVWzBdPms7aysrKXtmb3IoeD1cIlwiLHRoaXMubWF4Um93cz00LEM9MDtVWzFdPkM7QysrKXtpZihEPXRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKHRlLFosdC5zZWxlY3RlZERheSkpLFQ9XCIgdWktY29ybmVyLWFsbFwiLEk9XCJcIiwkKXtpZihJKz1cIjxkaXYgY2xhc3M9J3VpLWRhdGVwaWNrZXItZ3JvdXBcIixVWzFdPjEpc3dpdGNoKEMpe2Nhc2UgMDpJKz1cIiB1aS1kYXRlcGlja2VyLWdyb3VwLWZpcnN0XCIsVD1cIiB1aS1jb3JuZXItXCIrKEI/XCJyaWdodFwiOlwibGVmdFwiKTticmVhaztjYXNlIFVbMV0tMTpJKz1cIiB1aS1kYXRlcGlja2VyLWdyb3VwLWxhc3RcIixUPVwiIHVpLWNvcm5lci1cIisoQj9cImxlZnRcIjpcInJpZ2h0XCIpO2JyZWFrO2RlZmF1bHQ6SSs9XCIgdWktZGF0ZXBpY2tlci1ncm91cC1taWRkbGVcIixUPVwiXCJ9SSs9XCInPlwifWZvcihJKz1cIjxkaXYgY2xhc3M9J3VpLWRhdGVwaWNrZXItaGVhZGVyIHVpLXdpZGdldC1oZWFkZXIgdWktaGVscGVyLWNsZWFyZml4XCIrVCtcIic+XCIrKC9hbGx8bGVmdC8udGVzdChUKSYmMD09PWs/Qj9vOnM6XCJcIikrKC9hbGx8cmlnaHQvLnRlc3QoVCkmJjA9PT1rP0I/czpvOlwiXCIpK3RoaXMuX2dlbmVyYXRlTW9udGhZZWFySGVhZGVyKHQsWix0ZSxKLFEsaz4wfHxDPjAsZixnKStcIjwvZGl2Pjx0YWJsZSBjbGFzcz0ndWktZGF0ZXBpY2tlci1jYWxlbmRhcic+PHRoZWFkPlwiK1wiPHRyPlwiLE09dT9cIjx0aCBjbGFzcz0ndWktZGF0ZXBpY2tlci13ZWVrLWNvbCc+XCIrdGhpcy5fZ2V0KHQsXCJ3ZWVrSGVhZGVyXCIpK1wiPC90aD5cIjpcIlwiLHc9MDs3Pnc7dysrKVA9KHcrYyklNyxNKz1cIjx0aCBzY29wZT0nY29sJ1wiKygodytjKzYpJTc+PTU/XCIgY2xhc3M9J3VpLWRhdGVwaWNrZXItd2Vlay1lbmQnXCI6XCJcIikrXCI+XCIrXCI8c3BhbiB0aXRsZT0nXCIrZFtQXStcIic+XCIrcFtQXStcIjwvc3Bhbj48L3RoPlwiO2ZvcihJKz1NK1wiPC90cj48L3RoZWFkPjx0Ym9keT5cIixTPXRoaXMuX2dldERheXNJbk1vbnRoKHRlLFopLHRlPT09dC5zZWxlY3RlZFllYXImJlo9PT10LnNlbGVjdGVkTW9udGgmJih0LnNlbGVjdGVkRGF5PU1hdGgubWluKHQuc2VsZWN0ZWREYXksUykpLE49KHRoaXMuX2dldEZpcnN0RGF5T2ZNb250aCh0ZSxaKS1jKzcpJTcsSD1NYXRoLmNlaWwoKE4rUykvNyksQT0kP3RoaXMubWF4Um93cz5IP3RoaXMubWF4Um93czpIOkgsdGhpcy5tYXhSb3dzPUEsej10aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZSh0ZSxaLDEtTikpLE89MDtBPk87TysrKXtmb3IoSSs9XCI8dHI+XCIsRT11P1wiPHRkIGNsYXNzPSd1aS1kYXRlcGlja2VyLXdlZWstY29sJz5cIit0aGlzLl9nZXQodCxcImNhbGN1bGF0ZVdlZWtcIikoeikrXCI8L3RkPlwiOlwiXCIsdz0wOzc+dzt3KyspVz1tP20uYXBwbHkodC5pbnB1dD90LmlucHV0WzBdOm51bGwsW3pdKTpbITAsXCJcIl0sRj16LmdldE1vbnRoKCkhPT1aLEw9RiYmIXZ8fCFXWzBdfHxKJiZKPnp8fFEmJno+USxFKz1cIjx0ZCBjbGFzcz0nXCIrKCh3K2MrNiklNz49NT9cIiB1aS1kYXRlcGlja2VyLXdlZWstZW5kXCI6XCJcIikrKEY/XCIgdWktZGF0ZXBpY2tlci1vdGhlci1tb250aFwiOlwiXCIpKyh6LmdldFRpbWUoKT09PUQuZ2V0VGltZSgpJiZaPT09dC5zZWxlY3RlZE1vbnRoJiZ0Ll9rZXlFdmVudHx8Yi5nZXRUaW1lKCk9PT16LmdldFRpbWUoKSYmYi5nZXRUaW1lKCk9PT1ELmdldFRpbWUoKT9cIiBcIit0aGlzLl9kYXlPdmVyQ2xhc3M6XCJcIikrKEw/XCIgXCIrdGhpcy5fdW5zZWxlY3RhYmxlQ2xhc3MrXCIgdWktc3RhdGUtZGlzYWJsZWRcIjpcIlwiKSsoRiYmIV8/XCJcIjpcIiBcIitXWzFdKyh6LmdldFRpbWUoKT09PUcuZ2V0VGltZSgpP1wiIFwiK3RoaXMuX2N1cnJlbnRDbGFzczpcIlwiKSsoei5nZXRUaW1lKCk9PT1ZLmdldFRpbWUoKT9cIiB1aS1kYXRlcGlja2VyLXRvZGF5XCI6XCJcIikpK1wiJ1wiKyhGJiYhX3x8IVdbMl0/XCJcIjpcIiB0aXRsZT0nXCIrV1syXS5yZXBsYWNlKC8nL2csXCImIzM5O1wiKStcIidcIikrKEw/XCJcIjpcIiBkYXRhLWhhbmRsZXI9J3NlbGVjdERheScgZGF0YS1ldmVudD0nY2xpY2snIGRhdGEtbW9udGg9J1wiK3ouZ2V0TW9udGgoKStcIicgZGF0YS15ZWFyPSdcIit6LmdldEZ1bGxZZWFyKCkrXCInXCIpK1wiPlwiKyhGJiYhXz9cIiYjeGEwO1wiOkw/XCI8c3BhbiBjbGFzcz0ndWktc3RhdGUtZGVmYXVsdCc+XCIrei5nZXREYXRlKCkrXCI8L3NwYW4+XCI6XCI8YSBjbGFzcz0ndWktc3RhdGUtZGVmYXVsdFwiKyh6LmdldFRpbWUoKT09PVkuZ2V0VGltZSgpP1wiIHVpLXN0YXRlLWhpZ2hsaWdodFwiOlwiXCIpKyh6LmdldFRpbWUoKT09PUcuZ2V0VGltZSgpP1wiIHVpLXN0YXRlLWFjdGl2ZVwiOlwiXCIpKyhGP1wiIHVpLXByaW9yaXR5LXNlY29uZGFyeVwiOlwiXCIpK1wiJyBocmVmPScjJz5cIit6LmdldERhdGUoKStcIjwvYT5cIikrXCI8L3RkPlwiLHouc2V0RGF0ZSh6LmdldERhdGUoKSsxKSx6PXRoaXMuX2RheWxpZ2h0U2F2aW5nQWRqdXN0KHopO1xuSSs9RStcIjwvdHI+XCJ9WisrLFo+MTEmJihaPTAsdGUrKyksSSs9XCI8L3Rib2R5PjwvdGFibGU+XCIrKCQ/XCI8L2Rpdj5cIisoVVswXT4wJiZDPT09VVsxXS0xP1wiPGRpdiBjbGFzcz0ndWktZGF0ZXBpY2tlci1yb3ctYnJlYWsnPjwvZGl2PlwiOlwiXCIpOlwiXCIpLHgrPUl9eSs9eH1yZXR1cm4geSs9aCx0Ll9rZXlFdmVudD0hMSx5fSxfZ2VuZXJhdGVNb250aFllYXJIZWFkZXI6ZnVuY3Rpb24odCxlLGkscyxuLG8sYSxyKXt2YXIgbCxoLGMsdSxkLHAsZixnLG09dGhpcy5fZ2V0KHQsXCJjaGFuZ2VNb250aFwiKSxfPXRoaXMuX2dldCh0LFwiY2hhbmdlWWVhclwiKSx2PXRoaXMuX2dldCh0LFwic2hvd01vbnRoQWZ0ZXJZZWFyXCIpLGI9XCI8ZGl2IGNsYXNzPSd1aS1kYXRlcGlja2VyLXRpdGxlJz5cIix5PVwiXCI7aWYob3x8IW0peSs9XCI8c3BhbiBjbGFzcz0ndWktZGF0ZXBpY2tlci1tb250aCc+XCIrYVtlXStcIjwvc3Bhbj5cIjtlbHNle2ZvcihsPXMmJnMuZ2V0RnVsbFllYXIoKT09PWksaD1uJiZuLmdldEZ1bGxZZWFyKCk9PT1pLHkrPVwiPHNlbGVjdCBjbGFzcz0ndWktZGF0ZXBpY2tlci1tb250aCcgZGF0YS1oYW5kbGVyPSdzZWxlY3RNb250aCcgZGF0YS1ldmVudD0nY2hhbmdlJz5cIixjPTA7MTI+YztjKyspKCFsfHxjPj1zLmdldE1vbnRoKCkpJiYoIWh8fG4uZ2V0TW9udGgoKT49YykmJih5Kz1cIjxvcHRpb24gdmFsdWU9J1wiK2MrXCInXCIrKGM9PT1lP1wiIHNlbGVjdGVkPSdzZWxlY3RlZCdcIjpcIlwiKStcIj5cIityW2NdK1wiPC9vcHRpb24+XCIpO3krPVwiPC9zZWxlY3Q+XCJ9aWYodnx8KGIrPXkrKCFvJiZtJiZfP1wiXCI6XCImI3hhMDtcIikpLCF0LnllYXJzaHRtbClpZih0LnllYXJzaHRtbD1cIlwiLG98fCFfKWIrPVwiPHNwYW4gY2xhc3M9J3VpLWRhdGVwaWNrZXIteWVhcic+XCIraStcIjwvc3Bhbj5cIjtlbHNle2Zvcih1PXRoaXMuX2dldCh0LFwieWVhclJhbmdlXCIpLnNwbGl0KFwiOlwiKSxkPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxwPWZ1bmN0aW9uKHQpe3ZhciBlPXQubWF0Y2goL2NbK1xcLV0uKi8pP2krcGFyc2VJbnQodC5zdWJzdHJpbmcoMSksMTApOnQubWF0Y2goL1srXFwtXS4qLyk/ZCtwYXJzZUludCh0LDEwKTpwYXJzZUludCh0LDEwKTtyZXR1cm4gaXNOYU4oZSk/ZDplfSxmPXAodVswXSksZz1NYXRoLm1heChmLHAodVsxXXx8XCJcIikpLGY9cz9NYXRoLm1heChmLHMuZ2V0RnVsbFllYXIoKSk6ZixnPW4/TWF0aC5taW4oZyxuLmdldEZ1bGxZZWFyKCkpOmcsdC55ZWFyc2h0bWwrPVwiPHNlbGVjdCBjbGFzcz0ndWktZGF0ZXBpY2tlci15ZWFyJyBkYXRhLWhhbmRsZXI9J3NlbGVjdFllYXInIGRhdGEtZXZlbnQ9J2NoYW5nZSc+XCI7Zz49ZjtmKyspdC55ZWFyc2h0bWwrPVwiPG9wdGlvbiB2YWx1ZT0nXCIrZitcIidcIisoZj09PWk/XCIgc2VsZWN0ZWQ9J3NlbGVjdGVkJ1wiOlwiXCIpK1wiPlwiK2YrXCI8L29wdGlvbj5cIjt0LnllYXJzaHRtbCs9XCI8L3NlbGVjdD5cIixiKz10LnllYXJzaHRtbCx0LnllYXJzaHRtbD1udWxsfXJldHVybiBiKz10aGlzLl9nZXQodCxcInllYXJTdWZmaXhcIiksdiYmKGIrPSghbyYmbSYmXz9cIlwiOlwiJiN4YTA7XCIpK3kpLGIrPVwiPC9kaXY+XCJ9LF9hZGp1c3RJbnN0RGF0ZTpmdW5jdGlvbih0LGUsaSl7dmFyIHM9dC5zZWxlY3RlZFllYXIrKFwiWVwiPT09aT9lOjApLG49dC5zZWxlY3RlZE1vbnRoKyhcIk1cIj09PWk/ZTowKSxvPU1hdGgubWluKHQuc2VsZWN0ZWREYXksdGhpcy5fZ2V0RGF5c0luTW9udGgocyxuKSkrKFwiRFwiPT09aT9lOjApLGE9dGhpcy5fcmVzdHJpY3RNaW5NYXgodCx0aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZShzLG4sbykpKTt0LnNlbGVjdGVkRGF5PWEuZ2V0RGF0ZSgpLHQuZHJhd01vbnRoPXQuc2VsZWN0ZWRNb250aD1hLmdldE1vbnRoKCksdC5kcmF3WWVhcj10LnNlbGVjdGVkWWVhcj1hLmdldEZ1bGxZZWFyKCksKFwiTVwiPT09aXx8XCJZXCI9PT1pKSYmdGhpcy5fbm90aWZ5Q2hhbmdlKHQpfSxfcmVzdHJpY3RNaW5NYXg6ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9nZXRNaW5NYXhEYXRlKHQsXCJtaW5cIikscz10aGlzLl9nZXRNaW5NYXhEYXRlKHQsXCJtYXhcIiksbj1pJiZpPmU/aTplO3JldHVybiBzJiZuPnM/czpufSxfbm90aWZ5Q2hhbmdlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX2dldCh0LFwib25DaGFuZ2VNb250aFllYXJcIik7ZSYmZS5hcHBseSh0LmlucHV0P3QuaW5wdXRbMF06bnVsbCxbdC5zZWxlY3RlZFllYXIsdC5zZWxlY3RlZE1vbnRoKzEsdF0pfSxfZ2V0TnVtYmVyT2ZNb250aHM6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fZ2V0KHQsXCJudW1iZXJPZk1vbnRoc1wiKTtyZXR1cm4gbnVsbD09ZT9bMSwxXTpcIm51bWJlclwiPT10eXBlb2YgZT9bMSxlXTplfSxfZ2V0TWluTWF4RGF0ZTpmdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLl9kZXRlcm1pbmVEYXRlKHQsdGhpcy5fZ2V0KHQsZStcIkRhdGVcIiksbnVsbCl9LF9nZXREYXlzSW5Nb250aDpmdW5jdGlvbih0LGUpe3JldHVybiAzMi10aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZSh0LGUsMzIpKS5nZXREYXRlKCl9LF9nZXRGaXJzdERheU9mTW9udGg6ZnVuY3Rpb24odCxlKXtyZXR1cm4gbmV3IERhdGUodCxlLDEpLmdldERheSgpfSxfY2FuQWRqdXN0TW9udGg6ZnVuY3Rpb24odCxlLGkscyl7dmFyIG49dGhpcy5fZ2V0TnVtYmVyT2ZNb250aHModCksbz10aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZShpLHMrKDA+ZT9lOm5bMF0qblsxXSksMSkpO3JldHVybiAwPmUmJm8uc2V0RGF0ZSh0aGlzLl9nZXREYXlzSW5Nb250aChvLmdldEZ1bGxZZWFyKCksby5nZXRNb250aCgpKSksdGhpcy5faXNJblJhbmdlKHQsbyl9LF9pc0luUmFuZ2U6ZnVuY3Rpb24odCxlKXt2YXIgaSxzLG49dGhpcy5fZ2V0TWluTWF4RGF0ZSh0LFwibWluXCIpLG89dGhpcy5fZ2V0TWluTWF4RGF0ZSh0LFwibWF4XCIpLGE9bnVsbCxyPW51bGwsbD10aGlzLl9nZXQodCxcInllYXJSYW5nZVwiKTtyZXR1cm4gbCYmKGk9bC5zcGxpdChcIjpcIikscz0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCksYT1wYXJzZUludChpWzBdLDEwKSxyPXBhcnNlSW50KGlbMV0sMTApLGlbMF0ubWF0Y2goL1srXFwtXS4qLykmJihhKz1zKSxpWzFdLm1hdGNoKC9bK1xcLV0uKi8pJiYocis9cykpLCghbnx8ZS5nZXRUaW1lKCk+PW4uZ2V0VGltZSgpKSYmKCFvfHxlLmdldFRpbWUoKTw9by5nZXRUaW1lKCkpJiYoIWF8fGUuZ2V0RnVsbFllYXIoKT49YSkmJighcnx8cj49ZS5nZXRGdWxsWWVhcigpKX0sX2dldEZvcm1hdENvbmZpZzpmdW5jdGlvbih0KXt2YXIgZT10aGlzLl9nZXQodCxcInNob3J0WWVhckN1dG9mZlwiKTtyZXR1cm4gZT1cInN0cmluZ1wiIT10eXBlb2YgZT9lOihuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSUxMDArcGFyc2VJbnQoZSwxMCkse3Nob3J0WWVhckN1dG9mZjplLGRheU5hbWVzU2hvcnQ6dGhpcy5fZ2V0KHQsXCJkYXlOYW1lc1Nob3J0XCIpLGRheU5hbWVzOnRoaXMuX2dldCh0LFwiZGF5TmFtZXNcIiksbW9udGhOYW1lc1Nob3J0OnRoaXMuX2dldCh0LFwibW9udGhOYW1lc1Nob3J0XCIpLG1vbnRoTmFtZXM6dGhpcy5fZ2V0KHQsXCJtb250aE5hbWVzXCIpfX0sX2Zvcm1hdERhdGU6ZnVuY3Rpb24odCxlLGkscyl7ZXx8KHQuY3VycmVudERheT10LnNlbGVjdGVkRGF5LHQuY3VycmVudE1vbnRoPXQuc2VsZWN0ZWRNb250aCx0LmN1cnJlbnRZZWFyPXQuc2VsZWN0ZWRZZWFyKTt2YXIgbj1lP1wib2JqZWN0XCI9PXR5cGVvZiBlP2U6dGhpcy5fZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUocyxpLGUpKTp0aGlzLl9kYXlsaWdodFNhdmluZ0FkanVzdChuZXcgRGF0ZSh0LmN1cnJlbnRZZWFyLHQuY3VycmVudE1vbnRoLHQuY3VycmVudERheSkpO3JldHVybiB0aGlzLmZvcm1hdERhdGUodGhpcy5fZ2V0KHQsXCJkYXRlRm9ybWF0XCIpLG4sdGhpcy5fZ2V0Rm9ybWF0Q29uZmlnKHQpKX19KSx0LmZuLmRhdGVwaWNrZXI9ZnVuY3Rpb24oZSl7aWYoIXRoaXMubGVuZ3RoKXJldHVybiB0aGlzO3QuZGF0ZXBpY2tlci5pbml0aWFsaXplZHx8KHQoZG9jdW1lbnQpLm9uKFwibW91c2Vkb3duXCIsdC5kYXRlcGlja2VyLl9jaGVja0V4dGVybmFsQ2xpY2spLHQuZGF0ZXBpY2tlci5pbml0aWFsaXplZD0hMCksMD09PXQoXCIjXCIrdC5kYXRlcGlja2VyLl9tYWluRGl2SWQpLmxlbmd0aCYmdChcImJvZHlcIikuYXBwZW5kKHQuZGF0ZXBpY2tlci5kcERpdik7dmFyIGk9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDEpO3JldHVyblwic3RyaW5nXCIhPXR5cGVvZiBlfHxcImlzRGlzYWJsZWRcIiE9PWUmJlwiZ2V0RGF0ZVwiIT09ZSYmXCJ3aWRnZXRcIiE9PWU/XCJvcHRpb25cIj09PWUmJjI9PT1hcmd1bWVudHMubGVuZ3RoJiZcInN0cmluZ1wiPT10eXBlb2YgYXJndW1lbnRzWzFdP3QuZGF0ZXBpY2tlcltcIl9cIitlK1wiRGF0ZXBpY2tlclwiXS5hcHBseSh0LmRhdGVwaWNrZXIsW3RoaXNbMF1dLmNvbmNhdChpKSk6dGhpcy5lYWNoKGZ1bmN0aW9uKCl7XCJzdHJpbmdcIj09dHlwZW9mIGU/dC5kYXRlcGlja2VyW1wiX1wiK2UrXCJEYXRlcGlja2VyXCJdLmFwcGx5KHQuZGF0ZXBpY2tlcixbdGhpc10uY29uY2F0KGkpKTp0LmRhdGVwaWNrZXIuX2F0dGFjaERhdGVwaWNrZXIodGhpcyxlKX0pOnQuZGF0ZXBpY2tlcltcIl9cIitlK1wiRGF0ZXBpY2tlclwiXS5hcHBseSh0LmRhdGVwaWNrZXIsW3RoaXNbMF1dLmNvbmNhdChpKSl9LHQuZGF0ZXBpY2tlcj1uZXcgaSx0LmRhdGVwaWNrZXIuaW5pdGlhbGl6ZWQ9ITEsdC5kYXRlcGlja2VyLnV1aWQ9KG5ldyBEYXRlKS5nZXRUaW1lKCksdC5kYXRlcGlja2VyLnZlcnNpb249XCIxLjEyLjFcIix0LmRhdGVwaWNrZXIsdC51aS5pZT0hIS9tc2llIFtcXHcuXSsvLmV4ZWMobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKTt2YXIgaD0hMTt0KGRvY3VtZW50KS5vbihcIm1vdXNldXBcIixmdW5jdGlvbigpe2g9ITF9KSx0LndpZGdldChcInVpLm1vdXNlXCIse3ZlcnNpb246XCIxLjEyLjFcIixvcHRpb25zOntjYW5jZWw6XCJpbnB1dCwgdGV4dGFyZWEsIGJ1dHRvbiwgc2VsZWN0LCBvcHRpb25cIixkaXN0YW5jZToxLGRlbGF5OjB9LF9tb3VzZUluaXQ6ZnVuY3Rpb24oKXt2YXIgZT10aGlzO3RoaXMuZWxlbWVudC5vbihcIm1vdXNlZG93bi5cIit0aGlzLndpZGdldE5hbWUsZnVuY3Rpb24odCl7cmV0dXJuIGUuX21vdXNlRG93bih0KX0pLm9uKFwiY2xpY2suXCIrdGhpcy53aWRnZXROYW1lLGZ1bmN0aW9uKGkpe3JldHVybiEwPT09dC5kYXRhKGkudGFyZ2V0LGUud2lkZ2V0TmFtZStcIi5wcmV2ZW50Q2xpY2tFdmVudFwiKT8odC5yZW1vdmVEYXRhKGkudGFyZ2V0LGUud2lkZ2V0TmFtZStcIi5wcmV2ZW50Q2xpY2tFdmVudFwiKSxpLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpLCExKTp2b2lkIDB9KSx0aGlzLnN0YXJ0ZWQ9ITF9LF9tb3VzZURlc3Ryb3k6ZnVuY3Rpb24oKXt0aGlzLmVsZW1lbnQub2ZmKFwiLlwiK3RoaXMud2lkZ2V0TmFtZSksdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUmJnRoaXMuZG9jdW1lbnQub2ZmKFwibW91c2Vtb3ZlLlwiK3RoaXMud2lkZ2V0TmFtZSx0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZSkub2ZmKFwibW91c2V1cC5cIit0aGlzLndpZGdldE5hbWUsdGhpcy5fbW91c2VVcERlbGVnYXRlKX0sX21vdXNlRG93bjpmdW5jdGlvbihlKXtpZighaCl7dGhpcy5fbW91c2VNb3ZlZD0hMSx0aGlzLl9tb3VzZVN0YXJ0ZWQmJnRoaXMuX21vdXNlVXAoZSksdGhpcy5fbW91c2VEb3duRXZlbnQ9ZTt2YXIgaT10aGlzLHM9MT09PWUud2hpY2gsbj1cInN0cmluZ1wiPT10eXBlb2YgdGhpcy5vcHRpb25zLmNhbmNlbCYmZS50YXJnZXQubm9kZU5hbWU/dChlLnRhcmdldCkuY2xvc2VzdCh0aGlzLm9wdGlvbnMuY2FuY2VsKS5sZW5ndGg6ITE7cmV0dXJuIHMmJiFuJiZ0aGlzLl9tb3VzZUNhcHR1cmUoZSk/KHRoaXMubW91c2VEZWxheU1ldD0hdGhpcy5vcHRpb25zLmRlbGF5LHRoaXMubW91c2VEZWxheU1ldHx8KHRoaXMuX21vdXNlRGVsYXlUaW1lcj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aS5tb3VzZURlbGF5TWV0PSEwfSx0aGlzLm9wdGlvbnMuZGVsYXkpKSx0aGlzLl9tb3VzZURpc3RhbmNlTWV0KGUpJiZ0aGlzLl9tb3VzZURlbGF5TWV0KGUpJiYodGhpcy5fbW91c2VTdGFydGVkPXRoaXMuX21vdXNlU3RhcnQoZSkhPT0hMSwhdGhpcy5fbW91c2VTdGFydGVkKT8oZS5wcmV2ZW50RGVmYXVsdCgpLCEwKTooITA9PT10LmRhdGEoZS50YXJnZXQsdGhpcy53aWRnZXROYW1lK1wiLnByZXZlbnRDbGlja0V2ZW50XCIpJiZ0LnJlbW92ZURhdGEoZS50YXJnZXQsdGhpcy53aWRnZXROYW1lK1wiLnByZXZlbnRDbGlja0V2ZW50XCIpLHRoaXMuX21vdXNlTW92ZURlbGVnYXRlPWZ1bmN0aW9uKHQpe3JldHVybiBpLl9tb3VzZU1vdmUodCl9LHRoaXMuX21vdXNlVXBEZWxlZ2F0ZT1mdW5jdGlvbih0KXtyZXR1cm4gaS5fbW91c2VVcCh0KX0sdGhpcy5kb2N1bWVudC5vbihcIm1vdXNlbW92ZS5cIit0aGlzLndpZGdldE5hbWUsdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUpLm9uKFwibW91c2V1cC5cIit0aGlzLndpZGdldE5hbWUsdGhpcy5fbW91c2VVcERlbGVnYXRlKSxlLnByZXZlbnREZWZhdWx0KCksaD0hMCwhMCkpOiEwfX0sX21vdXNlTW92ZTpmdW5jdGlvbihlKXtpZih0aGlzLl9tb3VzZU1vdmVkKXtpZih0LnVpLmllJiYoIWRvY3VtZW50LmRvY3VtZW50TW9kZXx8OT5kb2N1bWVudC5kb2N1bWVudE1vZGUpJiYhZS5idXR0b24pcmV0dXJuIHRoaXMuX21vdXNlVXAoZSk7aWYoIWUud2hpY2gpaWYoZS5vcmlnaW5hbEV2ZW50LmFsdEtleXx8ZS5vcmlnaW5hbEV2ZW50LmN0cmxLZXl8fGUub3JpZ2luYWxFdmVudC5tZXRhS2V5fHxlLm9yaWdpbmFsRXZlbnQuc2hpZnRLZXkpdGhpcy5pZ25vcmVNaXNzaW5nV2hpY2g9ITA7ZWxzZSBpZighdGhpcy5pZ25vcmVNaXNzaW5nV2hpY2gpcmV0dXJuIHRoaXMuX21vdXNlVXAoZSl9cmV0dXJuKGUud2hpY2h8fGUuYnV0dG9uKSYmKHRoaXMuX21vdXNlTW92ZWQ9ITApLHRoaXMuX21vdXNlU3RhcnRlZD8odGhpcy5fbW91c2VEcmFnKGUpLGUucHJldmVudERlZmF1bHQoKSk6KHRoaXMuX21vdXNlRGlzdGFuY2VNZXQoZSkmJnRoaXMuX21vdXNlRGVsYXlNZXQoZSkmJih0aGlzLl9tb3VzZVN0YXJ0ZWQ9dGhpcy5fbW91c2VTdGFydCh0aGlzLl9tb3VzZURvd25FdmVudCxlKSE9PSExLHRoaXMuX21vdXNlU3RhcnRlZD90aGlzLl9tb3VzZURyYWcoZSk6dGhpcy5fbW91c2VVcChlKSksIXRoaXMuX21vdXNlU3RhcnRlZCl9LF9tb3VzZVVwOmZ1bmN0aW9uKGUpe3RoaXMuZG9jdW1lbnQub2ZmKFwibW91c2Vtb3ZlLlwiK3RoaXMud2lkZ2V0TmFtZSx0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZSkub2ZmKFwibW91c2V1cC5cIit0aGlzLndpZGdldE5hbWUsdGhpcy5fbW91c2VVcERlbGVnYXRlKSx0aGlzLl9tb3VzZVN0YXJ0ZWQmJih0aGlzLl9tb3VzZVN0YXJ0ZWQ9ITEsZS50YXJnZXQ9PT10aGlzLl9tb3VzZURvd25FdmVudC50YXJnZXQmJnQuZGF0YShlLnRhcmdldCx0aGlzLndpZGdldE5hbWUrXCIucHJldmVudENsaWNrRXZlbnRcIiwhMCksdGhpcy5fbW91c2VTdG9wKGUpKSx0aGlzLl9tb3VzZURlbGF5VGltZXImJihjbGVhclRpbWVvdXQodGhpcy5fbW91c2VEZWxheVRpbWVyKSxkZWxldGUgdGhpcy5fbW91c2VEZWxheVRpbWVyKSx0aGlzLmlnbm9yZU1pc3NpbmdXaGljaD0hMSxoPSExLGUucHJldmVudERlZmF1bHQoKX0sX21vdXNlRGlzdGFuY2VNZXQ6ZnVuY3Rpb24odCl7cmV0dXJuIE1hdGgubWF4KE1hdGguYWJzKHRoaXMuX21vdXNlRG93bkV2ZW50LnBhZ2VYLXQucGFnZVgpLE1hdGguYWJzKHRoaXMuX21vdXNlRG93bkV2ZW50LnBhZ2VZLXQucGFnZVkpKT49dGhpcy5vcHRpb25zLmRpc3RhbmNlfSxfbW91c2VEZWxheU1ldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1vdXNlRGVsYXlNZXR9LF9tb3VzZVN0YXJ0OmZ1bmN0aW9uKCl7fSxfbW91c2VEcmFnOmZ1bmN0aW9uKCl7fSxfbW91c2VTdG9wOmZ1bmN0aW9uKCl7fSxfbW91c2VDYXB0dXJlOmZ1bmN0aW9uKCl7cmV0dXJuITB9fSksdC53aWRnZXQoXCJ1aS5zZWxlY3RtZW51XCIsW3QudWkuZm9ybVJlc2V0TWl4aW4se3ZlcnNpb246XCIxLjEyLjFcIixkZWZhdWx0RWxlbWVudDpcIjxzZWxlY3Q+XCIsb3B0aW9uczp7YXBwZW5kVG86bnVsbCxjbGFzc2VzOntcInVpLXNlbGVjdG1lbnUtYnV0dG9uLW9wZW5cIjpcInVpLWNvcm5lci10b3BcIixcInVpLXNlbGVjdG1lbnUtYnV0dG9uLWNsb3NlZFwiOlwidWktY29ybmVyLWFsbFwifSxkaXNhYmxlZDpudWxsLGljb25zOntidXR0b246XCJ1aS1pY29uLXRyaWFuZ2xlLTEtc1wifSxwb3NpdGlvbjp7bXk6XCJsZWZ0IHRvcFwiLGF0OlwibGVmdCBib3R0b21cIixjb2xsaXNpb246XCJub25lXCJ9LHdpZHRoOiExLGNoYW5nZTpudWxsLGNsb3NlOm51bGwsZm9jdXM6bnVsbCxvcGVuOm51bGwsc2VsZWN0Om51bGx9LF9jcmVhdGU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLmVsZW1lbnQudW5pcXVlSWQoKS5hdHRyKFwiaWRcIik7dGhpcy5pZHM9e2VsZW1lbnQ6ZSxidXR0b246ZStcIi1idXR0b25cIixtZW51OmUrXCItbWVudVwifSx0aGlzLl9kcmF3QnV0dG9uKCksdGhpcy5fZHJhd01lbnUoKSx0aGlzLl9iaW5kRm9ybVJlc2V0SGFuZGxlcigpLHRoaXMuX3JlbmRlcmVkPSExLHRoaXMubWVudUl0ZW1zPXQoKX0sX2RyYXdCdXR0b246ZnVuY3Rpb24oKXt2YXIgZSxpPXRoaXMscz10aGlzLl9wYXJzZU9wdGlvbih0aGlzLmVsZW1lbnQuZmluZChcIm9wdGlvbjpzZWxlY3RlZFwiKSx0aGlzLmVsZW1lbnRbMF0uc2VsZWN0ZWRJbmRleCk7dGhpcy5sYWJlbHM9dGhpcy5lbGVtZW50LmxhYmVscygpLmF0dHIoXCJmb3JcIix0aGlzLmlkcy5idXR0b24pLHRoaXMuX29uKHRoaXMubGFiZWxzLHtjbGljazpmdW5jdGlvbih0KXt0aGlzLmJ1dHRvbi5mb2N1cygpLHQucHJldmVudERlZmF1bHQoKX19KSx0aGlzLmVsZW1lbnQuaGlkZSgpLHRoaXMuYnV0dG9uPXQoXCI8c3Bhbj5cIix7dGFiaW5kZXg6dGhpcy5vcHRpb25zLmRpc2FibGVkPy0xOjAsaWQ6dGhpcy5pZHMuYnV0dG9uLHJvbGU6XCJjb21ib2JveFwiLFwiYXJpYS1leHBhbmRlZFwiOlwiZmFsc2VcIixcImFyaWEtYXV0b2NvbXBsZXRlXCI6XCJsaXN0XCIsXCJhcmlhLW93bnNcIjp0aGlzLmlkcy5tZW51LFwiYXJpYS1oYXNwb3B1cFwiOlwidHJ1ZVwiLHRpdGxlOnRoaXMuZWxlbWVudC5hdHRyKFwidGl0bGVcIil9KS5pbnNlcnRBZnRlcih0aGlzLmVsZW1lbnQpLHRoaXMuX2FkZENsYXNzKHRoaXMuYnV0dG9uLFwidWktc2VsZWN0bWVudS1idXR0b24gdWktc2VsZWN0bWVudS1idXR0b24tY2xvc2VkXCIsXCJ1aS1idXR0b24gdWktd2lkZ2V0XCIpLGU9dChcIjxzcGFuPlwiKS5hcHBlbmRUbyh0aGlzLmJ1dHRvbiksdGhpcy5fYWRkQ2xhc3MoZSxcInVpLXNlbGVjdG1lbnUtaWNvblwiLFwidWktaWNvbiBcIit0aGlzLm9wdGlvbnMuaWNvbnMuYnV0dG9uKSx0aGlzLmJ1dHRvbkl0ZW09dGhpcy5fcmVuZGVyQnV0dG9uSXRlbShzKS5hcHBlbmRUbyh0aGlzLmJ1dHRvbiksdGhpcy5vcHRpb25zLndpZHRoIT09ITEmJnRoaXMuX3Jlc2l6ZUJ1dHRvbigpLHRoaXMuX29uKHRoaXMuYnV0dG9uLHRoaXMuX2J1dHRvbkV2ZW50cyksdGhpcy5idXR0b24ub25lKFwiZm9jdXNpblwiLGZ1bmN0aW9uKCl7aS5fcmVuZGVyZWR8fGkuX3JlZnJlc2hNZW51KCl9KX0sX2RyYXdNZW51OmZ1bmN0aW9uKCl7dmFyIGU9dGhpczt0aGlzLm1lbnU9dChcIjx1bD5cIix7XCJhcmlhLWhpZGRlblwiOlwidHJ1ZVwiLFwiYXJpYS1sYWJlbGxlZGJ5XCI6dGhpcy5pZHMuYnV0dG9uLGlkOnRoaXMuaWRzLm1lbnV9KSx0aGlzLm1lbnVXcmFwPXQoXCI8ZGl2PlwiKS5hcHBlbmQodGhpcy5tZW51KSx0aGlzLl9hZGRDbGFzcyh0aGlzLm1lbnVXcmFwLFwidWktc2VsZWN0bWVudS1tZW51XCIsXCJ1aS1mcm9udFwiKSx0aGlzLm1lbnVXcmFwLmFwcGVuZFRvKHRoaXMuX2FwcGVuZFRvKCkpLHRoaXMubWVudUluc3RhbmNlPXRoaXMubWVudS5tZW51KHtjbGFzc2VzOntcInVpLW1lbnVcIjpcInVpLWNvcm5lci1ib3R0b21cIn0scm9sZTpcImxpc3Rib3hcIixzZWxlY3Q6ZnVuY3Rpb24odCxpKXt0LnByZXZlbnREZWZhdWx0KCksZS5fc2V0U2VsZWN0aW9uKCksZS5fc2VsZWN0KGkuaXRlbS5kYXRhKFwidWktc2VsZWN0bWVudS1pdGVtXCIpLHQpfSxmb2N1czpmdW5jdGlvbih0LGkpe3ZhciBzPWkuaXRlbS5kYXRhKFwidWktc2VsZWN0bWVudS1pdGVtXCIpO251bGwhPWUuZm9jdXNJbmRleCYmcy5pbmRleCE9PWUuZm9jdXNJbmRleCYmKGUuX3RyaWdnZXIoXCJmb2N1c1wiLHQse2l0ZW06c30pLGUuaXNPcGVufHxlLl9zZWxlY3Qocyx0KSksZS5mb2N1c0luZGV4PXMuaW5kZXgsZS5idXR0b24uYXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiLGUubWVudUl0ZW1zLmVxKHMuaW5kZXgpLmF0dHIoXCJpZFwiKSl9fSkubWVudShcImluc3RhbmNlXCIpLHRoaXMubWVudUluc3RhbmNlLl9vZmYodGhpcy5tZW51LFwibW91c2VsZWF2ZVwiKSx0aGlzLm1lbnVJbnN0YW5jZS5fY2xvc2VPbkRvY3VtZW50Q2xpY2s9ZnVuY3Rpb24oKXtyZXR1cm4hMX0sdGhpcy5tZW51SW5zdGFuY2UuX2lzRGl2aWRlcj1mdW5jdGlvbigpe3JldHVybiExfX0scmVmcmVzaDpmdW5jdGlvbigpe3RoaXMuX3JlZnJlc2hNZW51KCksdGhpcy5idXR0b25JdGVtLnJlcGxhY2VXaXRoKHRoaXMuYnV0dG9uSXRlbT10aGlzLl9yZW5kZXJCdXR0b25JdGVtKHRoaXMuX2dldFNlbGVjdGVkSXRlbSgpLmRhdGEoXCJ1aS1zZWxlY3RtZW51LWl0ZW1cIil8fHt9KSksbnVsbD09PXRoaXMub3B0aW9ucy53aWR0aCYmdGhpcy5fcmVzaXplQnV0dG9uKCl9LF9yZWZyZXNoTWVudTpmdW5jdGlvbigpe3ZhciB0LGU9dGhpcy5lbGVtZW50LmZpbmQoXCJvcHRpb25cIik7dGhpcy5tZW51LmVtcHR5KCksdGhpcy5fcGFyc2VPcHRpb25zKGUpLHRoaXMuX3JlbmRlck1lbnUodGhpcy5tZW51LHRoaXMuaXRlbXMpLHRoaXMubWVudUluc3RhbmNlLnJlZnJlc2goKSx0aGlzLm1lbnVJdGVtcz10aGlzLm1lbnUuZmluZChcImxpXCIpLm5vdChcIi51aS1zZWxlY3RtZW51LW9wdGdyb3VwXCIpLmZpbmQoXCIudWktbWVudS1pdGVtLXdyYXBwZXJcIiksdGhpcy5fcmVuZGVyZWQ9ITAsZS5sZW5ndGgmJih0PXRoaXMuX2dldFNlbGVjdGVkSXRlbSgpLHRoaXMubWVudUluc3RhbmNlLmZvY3VzKG51bGwsdCksdGhpcy5fc2V0QXJpYSh0LmRhdGEoXCJ1aS1zZWxlY3RtZW51LWl0ZW1cIikpLHRoaXMuX3NldE9wdGlvbihcImRpc2FibGVkXCIsdGhpcy5lbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiKSkpfSxvcGVuOmZ1bmN0aW9uKHQpe3RoaXMub3B0aW9ucy5kaXNhYmxlZHx8KHRoaXMuX3JlbmRlcmVkPyh0aGlzLl9yZW1vdmVDbGFzcyh0aGlzLm1lbnUuZmluZChcIi51aS1zdGF0ZS1hY3RpdmVcIiksbnVsbCxcInVpLXN0YXRlLWFjdGl2ZVwiKSx0aGlzLm1lbnVJbnN0YW5jZS5mb2N1cyhudWxsLHRoaXMuX2dldFNlbGVjdGVkSXRlbSgpKSk6dGhpcy5fcmVmcmVzaE1lbnUoKSx0aGlzLm1lbnVJdGVtcy5sZW5ndGgmJih0aGlzLmlzT3Blbj0hMCx0aGlzLl90b2dnbGVBdHRyKCksdGhpcy5fcmVzaXplTWVudSgpLHRoaXMuX3Bvc2l0aW9uKCksdGhpcy5fb24odGhpcy5kb2N1bWVudCx0aGlzLl9kb2N1bWVudENsaWNrKSx0aGlzLl90cmlnZ2VyKFwib3BlblwiLHQpKSl9LF9wb3NpdGlvbjpmdW5jdGlvbigpe3RoaXMubWVudVdyYXAucG9zaXRpb24odC5leHRlbmQoe29mOnRoaXMuYnV0dG9ufSx0aGlzLm9wdGlvbnMucG9zaXRpb24pKX0sY2xvc2U6ZnVuY3Rpb24odCl7dGhpcy5pc09wZW4mJih0aGlzLmlzT3Blbj0hMSx0aGlzLl90b2dnbGVBdHRyKCksdGhpcy5yYW5nZT1udWxsLHRoaXMuX29mZih0aGlzLmRvY3VtZW50KSx0aGlzLl90cmlnZ2VyKFwiY2xvc2VcIix0KSl9LHdpZGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmJ1dHRvbn0sbWVudVdpZGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1lbnV9LF9yZW5kZXJCdXR0b25JdGVtOmZ1bmN0aW9uKGUpe3ZhciBpPXQoXCI8c3Bhbj5cIik7cmV0dXJuIHRoaXMuX3NldFRleHQoaSxlLmxhYmVsKSx0aGlzLl9hZGRDbGFzcyhpLFwidWktc2VsZWN0bWVudS10ZXh0XCIpLGl9LF9yZW5kZXJNZW51OmZ1bmN0aW9uKGUsaSl7dmFyIHM9dGhpcyxuPVwiXCI7dC5lYWNoKGksZnVuY3Rpb24oaSxvKXt2YXIgYTtvLm9wdGdyb3VwIT09biYmKGE9dChcIjxsaT5cIix7dGV4dDpvLm9wdGdyb3VwfSkscy5fYWRkQ2xhc3MoYSxcInVpLXNlbGVjdG1lbnUtb3B0Z3JvdXBcIixcInVpLW1lbnUtZGl2aWRlclwiKyhvLmVsZW1lbnQucGFyZW50KFwib3B0Z3JvdXBcIikucHJvcChcImRpc2FibGVkXCIpP1wiIHVpLXN0YXRlLWRpc2FibGVkXCI6XCJcIikpLGEuYXBwZW5kVG8oZSksbj1vLm9wdGdyb3VwKSxzLl9yZW5kZXJJdGVtRGF0YShlLG8pfSl9LF9yZW5kZXJJdGVtRGF0YTpmdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLl9yZW5kZXJJdGVtKHQsZSkuZGF0YShcInVpLXNlbGVjdG1lbnUtaXRlbVwiLGUpfSxfcmVuZGVySXRlbTpmdW5jdGlvbihlLGkpe3ZhciBzPXQoXCI8bGk+XCIpLG49dChcIjxkaXY+XCIse3RpdGxlOmkuZWxlbWVudC5hdHRyKFwidGl0bGVcIil9KTtyZXR1cm4gaS5kaXNhYmxlZCYmdGhpcy5fYWRkQ2xhc3MocyxudWxsLFwidWktc3RhdGUtZGlzYWJsZWRcIiksdGhpcy5fc2V0VGV4dChuLGkubGFiZWwpLHMuYXBwZW5kKG4pLmFwcGVuZFRvKGUpfSxfc2V0VGV4dDpmdW5jdGlvbih0LGUpe2U/dC50ZXh0KGUpOnQuaHRtbChcIiYjMTYwO1wiKX0sX21vdmU6ZnVuY3Rpb24odCxlKXt2YXIgaSxzLG49XCIudWktbWVudS1pdGVtXCI7dGhpcy5pc09wZW4/aT10aGlzLm1lbnVJdGVtcy5lcSh0aGlzLmZvY3VzSW5kZXgpLnBhcmVudChcImxpXCIpOihpPXRoaXMubWVudUl0ZW1zLmVxKHRoaXMuZWxlbWVudFswXS5zZWxlY3RlZEluZGV4KS5wYXJlbnQoXCJsaVwiKSxuKz1cIjpub3QoLnVpLXN0YXRlLWRpc2FibGVkKVwiKSxzPVwiZmlyc3RcIj09PXR8fFwibGFzdFwiPT09dD9pW1wiZmlyc3RcIj09PXQ/XCJwcmV2QWxsXCI6XCJuZXh0QWxsXCJdKG4pLmVxKC0xKTppW3QrXCJBbGxcIl0obikuZXEoMCkscy5sZW5ndGgmJnRoaXMubWVudUluc3RhbmNlLmZvY3VzKGUscyl9LF9nZXRTZWxlY3RlZEl0ZW06ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5tZW51SXRlbXMuZXEodGhpcy5lbGVtZW50WzBdLnNlbGVjdGVkSW5kZXgpLnBhcmVudChcImxpXCIpfSxfdG9nZ2xlOmZ1bmN0aW9uKHQpe3RoaXNbdGhpcy5pc09wZW4/XCJjbG9zZVwiOlwib3BlblwiXSh0KX0sX3NldFNlbGVjdGlvbjpmdW5jdGlvbigpe3ZhciB0O3RoaXMucmFuZ2UmJih3aW5kb3cuZ2V0U2VsZWN0aW9uPyh0PXdpbmRvdy5nZXRTZWxlY3Rpb24oKSx0LnJlbW92ZUFsbFJhbmdlcygpLHQuYWRkUmFuZ2UodGhpcy5yYW5nZSkpOnRoaXMucmFuZ2Uuc2VsZWN0KCksdGhpcy5idXR0b24uZm9jdXMoKSl9LF9kb2N1bWVudENsaWNrOnttb3VzZWRvd246ZnVuY3Rpb24oZSl7dGhpcy5pc09wZW4mJih0KGUudGFyZ2V0KS5jbG9zZXN0KFwiLnVpLXNlbGVjdG1lbnUtbWVudSwgI1wiK3QudWkuZXNjYXBlU2VsZWN0b3IodGhpcy5pZHMuYnV0dG9uKSkubGVuZ3RofHx0aGlzLmNsb3NlKGUpKX19LF9idXR0b25FdmVudHM6e21vdXNlZG93bjpmdW5jdGlvbigpe3ZhciB0O3dpbmRvdy5nZXRTZWxlY3Rpb24/KHQ9d2luZG93LmdldFNlbGVjdGlvbigpLHQucmFuZ2VDb3VudCYmKHRoaXMucmFuZ2U9dC5nZXRSYW5nZUF0KDApKSk6dGhpcy5yYW5nZT1kb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKX0sY2xpY2s6ZnVuY3Rpb24odCl7dGhpcy5fc2V0U2VsZWN0aW9uKCksdGhpcy5fdG9nZ2xlKHQpfSxrZXlkb3duOmZ1bmN0aW9uKGUpe3ZhciBpPSEwO3N3aXRjaChlLmtleUNvZGUpe2Nhc2UgdC51aS5rZXlDb2RlLlRBQjpjYXNlIHQudWkua2V5Q29kZS5FU0NBUEU6dGhpcy5jbG9zZShlKSxpPSExO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkVOVEVSOnRoaXMuaXNPcGVuJiZ0aGlzLl9zZWxlY3RGb2N1c2VkSXRlbShlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5VUDplLmFsdEtleT90aGlzLl90b2dnbGUoZSk6dGhpcy5fbW92ZShcInByZXZcIixlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5ET1dOOmUuYWx0S2V5P3RoaXMuX3RvZ2dsZShlKTp0aGlzLl9tb3ZlKFwibmV4dFwiLGUpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLlNQQUNFOnRoaXMuaXNPcGVuP3RoaXMuX3NlbGVjdEZvY3VzZWRJdGVtKGUpOnRoaXMuX3RvZ2dsZShlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5MRUZUOnRoaXMuX21vdmUoXCJwcmV2XCIsZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuUklHSFQ6dGhpcy5fbW92ZShcIm5leHRcIixlKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5IT01FOmNhc2UgdC51aS5rZXlDb2RlLlBBR0VfVVA6dGhpcy5fbW92ZShcImZpcnN0XCIsZSk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuRU5EOmNhc2UgdC51aS5rZXlDb2RlLlBBR0VfRE9XTjp0aGlzLl9tb3ZlKFwibGFzdFwiLGUpO2JyZWFrO2RlZmF1bHQ6dGhpcy5tZW51LnRyaWdnZXIoZSksaT0hMX1pJiZlLnByZXZlbnREZWZhdWx0KCl9fSxfc2VsZWN0Rm9jdXNlZEl0ZW06ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5tZW51SXRlbXMuZXEodGhpcy5mb2N1c0luZGV4KS5wYXJlbnQoXCJsaVwiKTtlLmhhc0NsYXNzKFwidWktc3RhdGUtZGlzYWJsZWRcIil8fHRoaXMuX3NlbGVjdChlLmRhdGEoXCJ1aS1zZWxlY3RtZW51LWl0ZW1cIiksdCl9LF9zZWxlY3Q6ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLmVsZW1lbnRbMF0uc2VsZWN0ZWRJbmRleDt0aGlzLmVsZW1lbnRbMF0uc2VsZWN0ZWRJbmRleD10LmluZGV4LHRoaXMuYnV0dG9uSXRlbS5yZXBsYWNlV2l0aCh0aGlzLmJ1dHRvbkl0ZW09dGhpcy5fcmVuZGVyQnV0dG9uSXRlbSh0KSksdGhpcy5fc2V0QXJpYSh0KSx0aGlzLl90cmlnZ2VyKFwic2VsZWN0XCIsZSx7aXRlbTp0fSksdC5pbmRleCE9PWkmJnRoaXMuX3RyaWdnZXIoXCJjaGFuZ2VcIixlLHtpdGVtOnR9KSx0aGlzLmNsb3NlKGUpfSxfc2V0QXJpYTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLm1lbnVJdGVtcy5lcSh0LmluZGV4KS5hdHRyKFwiaWRcIik7dGhpcy5idXR0b24uYXR0cih7XCJhcmlhLWxhYmVsbGVkYnlcIjplLFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCI6ZX0pLHRoaXMubWVudS5hdHRyKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIsZSl9LF9zZXRPcHRpb246ZnVuY3Rpb24odCxlKXtpZihcImljb25zXCI9PT10KXt2YXIgaT10aGlzLmJ1dHRvbi5maW5kKFwic3Bhbi51aS1pY29uXCIpO3RoaXMuX3JlbW92ZUNsYXNzKGksbnVsbCx0aGlzLm9wdGlvbnMuaWNvbnMuYnV0dG9uKS5fYWRkQ2xhc3MoaSxudWxsLGUuYnV0dG9uKX10aGlzLl9zdXBlcih0LGUpLFwiYXBwZW5kVG9cIj09PXQmJnRoaXMubWVudVdyYXAuYXBwZW5kVG8odGhpcy5fYXBwZW5kVG8oKSksXCJ3aWR0aFwiPT09dCYmdGhpcy5fcmVzaXplQnV0dG9uKCl9LF9zZXRPcHRpb25EaXNhYmxlZDpmdW5jdGlvbih0KXt0aGlzLl9zdXBlcih0KSx0aGlzLm1lbnVJbnN0YW5jZS5vcHRpb24oXCJkaXNhYmxlZFwiLHQpLHRoaXMuYnV0dG9uLmF0dHIoXCJhcmlhLWRpc2FibGVkXCIsdCksdGhpcy5fdG9nZ2xlQ2xhc3ModGhpcy5idXR0b24sbnVsbCxcInVpLXN0YXRlLWRpc2FibGVkXCIsdCksdGhpcy5lbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiLHQpLHQ/KHRoaXMuYnV0dG9uLmF0dHIoXCJ0YWJpbmRleFwiLC0xKSx0aGlzLmNsb3NlKCkpOnRoaXMuYnV0dG9uLmF0dHIoXCJ0YWJpbmRleFwiLDApfSxfYXBwZW5kVG86ZnVuY3Rpb24oKXt2YXIgZT10aGlzLm9wdGlvbnMuYXBwZW5kVG87cmV0dXJuIGUmJihlPWUuanF1ZXJ5fHxlLm5vZGVUeXBlP3QoZSk6dGhpcy5kb2N1bWVudC5maW5kKGUpLmVxKDApKSxlJiZlWzBdfHwoZT10aGlzLmVsZW1lbnQuY2xvc2VzdChcIi51aS1mcm9udCwgZGlhbG9nXCIpKSxlLmxlbmd0aHx8KGU9dGhpcy5kb2N1bWVudFswXS5ib2R5KSxlfSxfdG9nZ2xlQXR0cjpmdW5jdGlvbigpe3RoaXMuYnV0dG9uLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIsdGhpcy5pc09wZW4pLHRoaXMuX3JlbW92ZUNsYXNzKHRoaXMuYnV0dG9uLFwidWktc2VsZWN0bWVudS1idXR0b24tXCIrKHRoaXMuaXNPcGVuP1wiY2xvc2VkXCI6XCJvcGVuXCIpKS5fYWRkQ2xhc3ModGhpcy5idXR0b24sXCJ1aS1zZWxlY3RtZW51LWJ1dHRvbi1cIisodGhpcy5pc09wZW4/XCJvcGVuXCI6XCJjbG9zZWRcIikpLl90b2dnbGVDbGFzcyh0aGlzLm1lbnVXcmFwLFwidWktc2VsZWN0bWVudS1vcGVuXCIsbnVsbCx0aGlzLmlzT3BlbiksdGhpcy5tZW51LmF0dHIoXCJhcmlhLWhpZGRlblwiLCF0aGlzLmlzT3Blbil9LF9yZXNpemVCdXR0b246ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMud2lkdGg7cmV0dXJuIHQ9PT0hMT8odGhpcy5idXR0b24uY3NzKFwid2lkdGhcIixcIlwiKSx2b2lkIDApOihudWxsPT09dCYmKHQ9dGhpcy5lbGVtZW50LnNob3coKS5vdXRlcldpZHRoKCksdGhpcy5lbGVtZW50LmhpZGUoKSksdGhpcy5idXR0b24ub3V0ZXJXaWR0aCh0KSx2b2lkIDApfSxfcmVzaXplTWVudTpmdW5jdGlvbigpe3RoaXMubWVudS5vdXRlcldpZHRoKE1hdGgubWF4KHRoaXMuYnV0dG9uLm91dGVyV2lkdGgoKSx0aGlzLm1lbnUud2lkdGgoXCJcIikub3V0ZXJXaWR0aCgpKzEpKX0sX2dldENyZWF0ZU9wdGlvbnM6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLl9zdXBlcigpO3JldHVybiB0LmRpc2FibGVkPXRoaXMuZWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIiksdH0sX3BhcnNlT3B0aW9uczpmdW5jdGlvbihlKXt2YXIgaT10aGlzLHM9W107ZS5lYWNoKGZ1bmN0aW9uKGUsbil7cy5wdXNoKGkuX3BhcnNlT3B0aW9uKHQobiksZSkpfSksdGhpcy5pdGVtcz1zfSxfcGFyc2VPcHRpb246ZnVuY3Rpb24odCxlKXt2YXIgaT10LnBhcmVudChcIm9wdGdyb3VwXCIpO3JldHVybntlbGVtZW50OnQsaW5kZXg6ZSx2YWx1ZTp0LnZhbCgpLGxhYmVsOnQudGV4dCgpLG9wdGdyb3VwOmkuYXR0cihcImxhYmVsXCIpfHxcIlwiLGRpc2FibGVkOmkucHJvcChcImRpc2FibGVkXCIpfHx0LnByb3AoXCJkaXNhYmxlZFwiKX19LF9kZXN0cm95OmZ1bmN0aW9uKCl7dGhpcy5fdW5iaW5kRm9ybVJlc2V0SGFuZGxlcigpLHRoaXMubWVudVdyYXAucmVtb3ZlKCksdGhpcy5idXR0b24ucmVtb3ZlKCksdGhpcy5lbGVtZW50LnNob3coKSx0aGlzLmVsZW1lbnQucmVtb3ZlVW5pcXVlSWQoKSx0aGlzLmxhYmVscy5hdHRyKFwiZm9yXCIsdGhpcy5pZHMuZWxlbWVudCl9fV0pLHQud2lkZ2V0KFwidWkuc2xpZGVyXCIsdC51aS5tb3VzZSx7dmVyc2lvbjpcIjEuMTIuMVwiLHdpZGdldEV2ZW50UHJlZml4Olwic2xpZGVcIixvcHRpb25zOnthbmltYXRlOiExLGNsYXNzZXM6e1widWktc2xpZGVyXCI6XCJ1aS1jb3JuZXItYWxsXCIsXCJ1aS1zbGlkZXItaGFuZGxlXCI6XCJ1aS1jb3JuZXItYWxsXCIsXCJ1aS1zbGlkZXItcmFuZ2VcIjpcInVpLWNvcm5lci1hbGwgdWktd2lkZ2V0LWhlYWRlclwifSxkaXN0YW5jZTowLG1heDoxMDAsbWluOjAsb3JpZW50YXRpb246XCJob3Jpem9udGFsXCIscmFuZ2U6ITEsc3RlcDoxLHZhbHVlOjAsdmFsdWVzOm51bGwsY2hhbmdlOm51bGwsc2xpZGU6bnVsbCxzdGFydDpudWxsLHN0b3A6bnVsbH0sbnVtUGFnZXM6NSxfY3JlYXRlOmZ1bmN0aW9uKCl7dGhpcy5fa2V5U2xpZGluZz0hMSx0aGlzLl9tb3VzZVNsaWRpbmc9ITEsdGhpcy5fYW5pbWF0ZU9mZj0hMCx0aGlzLl9oYW5kbGVJbmRleD1udWxsLHRoaXMuX2RldGVjdE9yaWVudGF0aW9uKCksdGhpcy5fbW91c2VJbml0KCksdGhpcy5fY2FsY3VsYXRlTmV3TWF4KCksdGhpcy5fYWRkQ2xhc3MoXCJ1aS1zbGlkZXIgdWktc2xpZGVyLVwiK3RoaXMub3JpZW50YXRpb24sXCJ1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnRcIiksdGhpcy5fcmVmcmVzaCgpLHRoaXMuX2FuaW1hdGVPZmY9ITF9LF9yZWZyZXNoOmZ1bmN0aW9uKCl7dGhpcy5fY3JlYXRlUmFuZ2UoKSx0aGlzLl9jcmVhdGVIYW5kbGVzKCksdGhpcy5fc2V0dXBFdmVudHMoKSx0aGlzLl9yZWZyZXNoVmFsdWUoKX0sX2NyZWF0ZUhhbmRsZXM6ZnVuY3Rpb24oKXt2YXIgZSxpLHM9dGhpcy5vcHRpb25zLG49dGhpcy5lbGVtZW50LmZpbmQoXCIudWktc2xpZGVyLWhhbmRsZVwiKSxvPVwiPHNwYW4gdGFiaW5kZXg9JzAnPjwvc3Bhbj5cIixhPVtdO2ZvcihpPXMudmFsdWVzJiZzLnZhbHVlcy5sZW5ndGh8fDEsbi5sZW5ndGg+aSYmKG4uc2xpY2UoaSkucmVtb3ZlKCksbj1uLnNsaWNlKDAsaSkpLGU9bi5sZW5ndGg7aT5lO2UrKylhLnB1c2gobyk7dGhpcy5oYW5kbGVzPW4uYWRkKHQoYS5qb2luKFwiXCIpKS5hcHBlbmRUbyh0aGlzLmVsZW1lbnQpKSx0aGlzLl9hZGRDbGFzcyh0aGlzLmhhbmRsZXMsXCJ1aS1zbGlkZXItaGFuZGxlXCIsXCJ1aS1zdGF0ZS1kZWZhdWx0XCIpLHRoaXMuaGFuZGxlPXRoaXMuaGFuZGxlcy5lcSgwKSx0aGlzLmhhbmRsZXMuZWFjaChmdW5jdGlvbihlKXt0KHRoaXMpLmRhdGEoXCJ1aS1zbGlkZXItaGFuZGxlLWluZGV4XCIsZSkuYXR0cihcInRhYkluZGV4XCIsMCl9KX0sX2NyZWF0ZVJhbmdlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5vcHRpb25zO2UucmFuZ2U/KGUucmFuZ2U9PT0hMCYmKGUudmFsdWVzP2UudmFsdWVzLmxlbmd0aCYmMiE9PWUudmFsdWVzLmxlbmd0aD9lLnZhbHVlcz1bZS52YWx1ZXNbMF0sZS52YWx1ZXNbMF1dOnQuaXNBcnJheShlLnZhbHVlcykmJihlLnZhbHVlcz1lLnZhbHVlcy5zbGljZSgwKSk6ZS52YWx1ZXM9W3RoaXMuX3ZhbHVlTWluKCksdGhpcy5fdmFsdWVNaW4oKV0pLHRoaXMucmFuZ2UmJnRoaXMucmFuZ2UubGVuZ3RoPyh0aGlzLl9yZW1vdmVDbGFzcyh0aGlzLnJhbmdlLFwidWktc2xpZGVyLXJhbmdlLW1pbiB1aS1zbGlkZXItcmFuZ2UtbWF4XCIpLHRoaXMucmFuZ2UuY3NzKHtsZWZ0OlwiXCIsYm90dG9tOlwiXCJ9KSk6KHRoaXMucmFuZ2U9dChcIjxkaXY+XCIpLmFwcGVuZFRvKHRoaXMuZWxlbWVudCksdGhpcy5fYWRkQ2xhc3ModGhpcy5yYW5nZSxcInVpLXNsaWRlci1yYW5nZVwiKSksKFwibWluXCI9PT1lLnJhbmdlfHxcIm1heFwiPT09ZS5yYW5nZSkmJnRoaXMuX2FkZENsYXNzKHRoaXMucmFuZ2UsXCJ1aS1zbGlkZXItcmFuZ2UtXCIrZS5yYW5nZSkpOih0aGlzLnJhbmdlJiZ0aGlzLnJhbmdlLnJlbW92ZSgpLHRoaXMucmFuZ2U9bnVsbCl9LF9zZXR1cEV2ZW50czpmdW5jdGlvbigpe3RoaXMuX29mZih0aGlzLmhhbmRsZXMpLHRoaXMuX29uKHRoaXMuaGFuZGxlcyx0aGlzLl9oYW5kbGVFdmVudHMpLHRoaXMuX2hvdmVyYWJsZSh0aGlzLmhhbmRsZXMpLHRoaXMuX2ZvY3VzYWJsZSh0aGlzLmhhbmRsZXMpfSxfZGVzdHJveTpmdW5jdGlvbigpe3RoaXMuaGFuZGxlcy5yZW1vdmUoKSx0aGlzLnJhbmdlJiZ0aGlzLnJhbmdlLnJlbW92ZSgpLHRoaXMuX21vdXNlRGVzdHJveSgpfSxfbW91c2VDYXB0dXJlOmZ1bmN0aW9uKGUpe3ZhciBpLHMsbixvLGEscixsLGgsYz10aGlzLHU9dGhpcy5vcHRpb25zO3JldHVybiB1LmRpc2FibGVkPyExOih0aGlzLmVsZW1lbnRTaXplPXt3aWR0aDp0aGlzLmVsZW1lbnQub3V0ZXJXaWR0aCgpLGhlaWdodDp0aGlzLmVsZW1lbnQub3V0ZXJIZWlnaHQoKX0sdGhpcy5lbGVtZW50T2Zmc2V0PXRoaXMuZWxlbWVudC5vZmZzZXQoKSxpPXt4OmUucGFnZVgseTplLnBhZ2VZfSxzPXRoaXMuX25vcm1WYWx1ZUZyb21Nb3VzZShpKSxuPXRoaXMuX3ZhbHVlTWF4KCktdGhpcy5fdmFsdWVNaW4oKSsxLHRoaXMuaGFuZGxlcy5lYWNoKGZ1bmN0aW9uKGUpe3ZhciBpPU1hdGguYWJzKHMtYy52YWx1ZXMoZSkpOyhuPml8fG49PT1pJiYoZT09PWMuX2xhc3RDaGFuZ2VkVmFsdWV8fGMudmFsdWVzKGUpPT09dS5taW4pKSYmKG49aSxvPXQodGhpcyksYT1lKX0pLHI9dGhpcy5fc3RhcnQoZSxhKSxyPT09ITE/ITE6KHRoaXMuX21vdXNlU2xpZGluZz0hMCx0aGlzLl9oYW5kbGVJbmRleD1hLHRoaXMuX2FkZENsYXNzKG8sbnVsbCxcInVpLXN0YXRlLWFjdGl2ZVwiKSxvLnRyaWdnZXIoXCJmb2N1c1wiKSxsPW8ub2Zmc2V0KCksaD0hdChlLnRhcmdldCkucGFyZW50cygpLmFkZEJhY2soKS5pcyhcIi51aS1zbGlkZXItaGFuZGxlXCIpLHRoaXMuX2NsaWNrT2Zmc2V0PWg/e2xlZnQ6MCx0b3A6MH06e2xlZnQ6ZS5wYWdlWC1sLmxlZnQtby53aWR0aCgpLzIsdG9wOmUucGFnZVktbC50b3Atby5oZWlnaHQoKS8yLShwYXJzZUludChvLmNzcyhcImJvcmRlclRvcFdpZHRoXCIpLDEwKXx8MCktKHBhcnNlSW50KG8uY3NzKFwiYm9yZGVyQm90dG9tV2lkdGhcIiksMTApfHwwKSsocGFyc2VJbnQoby5jc3MoXCJtYXJnaW5Ub3BcIiksMTApfHwwKX0sdGhpcy5oYW5kbGVzLmhhc0NsYXNzKFwidWktc3RhdGUtaG92ZXJcIil8fHRoaXMuX3NsaWRlKGUsYSxzKSx0aGlzLl9hbmltYXRlT2ZmPSEwLCEwKSl9LF9tb3VzZVN0YXJ0OmZ1bmN0aW9uKCl7cmV0dXJuITB9LF9tb3VzZURyYWc6ZnVuY3Rpb24odCl7dmFyIGU9e3g6dC5wYWdlWCx5OnQucGFnZVl9LGk9dGhpcy5fbm9ybVZhbHVlRnJvbU1vdXNlKGUpO3JldHVybiB0aGlzLl9zbGlkZSh0LHRoaXMuX2hhbmRsZUluZGV4LGkpLCExfSxfbW91c2VTdG9wOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9yZW1vdmVDbGFzcyh0aGlzLmhhbmRsZXMsbnVsbCxcInVpLXN0YXRlLWFjdGl2ZVwiKSx0aGlzLl9tb3VzZVNsaWRpbmc9ITEsdGhpcy5fc3RvcCh0LHRoaXMuX2hhbmRsZUluZGV4KSx0aGlzLl9jaGFuZ2UodCx0aGlzLl9oYW5kbGVJbmRleCksdGhpcy5faGFuZGxlSW5kZXg9bnVsbCx0aGlzLl9jbGlja09mZnNldD1udWxsLHRoaXMuX2FuaW1hdGVPZmY9ITEsITF9LF9kZXRlY3RPcmllbnRhdGlvbjpmdW5jdGlvbigpe3RoaXMub3JpZW50YXRpb249XCJ2ZXJ0aWNhbFwiPT09dGhpcy5vcHRpb25zLm9yaWVudGF0aW9uP1widmVydGljYWxcIjpcImhvcml6b250YWxcIn0sX25vcm1WYWx1ZUZyb21Nb3VzZTpmdW5jdGlvbih0KXt2YXIgZSxpLHMsbixvO3JldHVyblwiaG9yaXpvbnRhbFwiPT09dGhpcy5vcmllbnRhdGlvbj8oZT10aGlzLmVsZW1lbnRTaXplLndpZHRoLGk9dC54LXRoaXMuZWxlbWVudE9mZnNldC5sZWZ0LSh0aGlzLl9jbGlja09mZnNldD90aGlzLl9jbGlja09mZnNldC5sZWZ0OjApKTooZT10aGlzLmVsZW1lbnRTaXplLmhlaWdodCxpPXQueS10aGlzLmVsZW1lbnRPZmZzZXQudG9wLSh0aGlzLl9jbGlja09mZnNldD90aGlzLl9jbGlja09mZnNldC50b3A6MCkpLHM9aS9lLHM+MSYmKHM9MSksMD5zJiYocz0wKSxcInZlcnRpY2FsXCI9PT10aGlzLm9yaWVudGF0aW9uJiYocz0xLXMpLG49dGhpcy5fdmFsdWVNYXgoKS10aGlzLl92YWx1ZU1pbigpLG89dGhpcy5fdmFsdWVNaW4oKStzKm4sdGhpcy5fdHJpbUFsaWduVmFsdWUobyl9LF91aUhhc2g6ZnVuY3Rpb24odCxlLGkpe3ZhciBzPXtoYW5kbGU6dGhpcy5oYW5kbGVzW3RdLGhhbmRsZUluZGV4OnQsdmFsdWU6dm9pZCAwIT09ZT9lOnRoaXMudmFsdWUoKX07cmV0dXJuIHRoaXMuX2hhc011bHRpcGxlVmFsdWVzKCkmJihzLnZhbHVlPXZvaWQgMCE9PWU/ZTp0aGlzLnZhbHVlcyh0KSxzLnZhbHVlcz1pfHx0aGlzLnZhbHVlcygpKSxzfSxfaGFzTXVsdGlwbGVWYWx1ZXM6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5vcHRpb25zLnZhbHVlcyYmdGhpcy5vcHRpb25zLnZhbHVlcy5sZW5ndGh9LF9zdGFydDpmdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLl90cmlnZ2VyKFwic3RhcnRcIix0LHRoaXMuX3VpSGFzaChlKSl9LF9zbGlkZTpmdW5jdGlvbih0LGUsaSl7dmFyIHMsbixvPXRoaXMudmFsdWUoKSxhPXRoaXMudmFsdWVzKCk7dGhpcy5faGFzTXVsdGlwbGVWYWx1ZXMoKSYmKG49dGhpcy52YWx1ZXMoZT8wOjEpLG89dGhpcy52YWx1ZXMoZSksMj09PXRoaXMub3B0aW9ucy52YWx1ZXMubGVuZ3RoJiZ0aGlzLm9wdGlvbnMucmFuZ2U9PT0hMCYmKGk9MD09PWU/TWF0aC5taW4obixpKTpNYXRoLm1heChuLGkpKSxhW2VdPWkpLGkhPT1vJiYocz10aGlzLl90cmlnZ2VyKFwic2xpZGVcIix0LHRoaXMuX3VpSGFzaChlLGksYSkpLHMhPT0hMSYmKHRoaXMuX2hhc011bHRpcGxlVmFsdWVzKCk/dGhpcy52YWx1ZXMoZSxpKTp0aGlzLnZhbHVlKGkpKSl9LF9zdG9wOmZ1bmN0aW9uKHQsZSl7dGhpcy5fdHJpZ2dlcihcInN0b3BcIix0LHRoaXMuX3VpSGFzaChlKSl9LF9jaGFuZ2U6ZnVuY3Rpb24odCxlKXt0aGlzLl9rZXlTbGlkaW5nfHx0aGlzLl9tb3VzZVNsaWRpbmd8fCh0aGlzLl9sYXN0Q2hhbmdlZFZhbHVlPWUsdGhpcy5fdHJpZ2dlcihcImNoYW5nZVwiLHQsdGhpcy5fdWlIYXNoKGUpKSl9LHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiBhcmd1bWVudHMubGVuZ3RoPyh0aGlzLm9wdGlvbnMudmFsdWU9dGhpcy5fdHJpbUFsaWduVmFsdWUodCksdGhpcy5fcmVmcmVzaFZhbHVlKCksdGhpcy5fY2hhbmdlKG51bGwsMCksdm9pZCAwKTp0aGlzLl92YWx1ZSgpfSx2YWx1ZXM6ZnVuY3Rpb24oZSxpKXt2YXIgcyxuLG87aWYoYXJndW1lbnRzLmxlbmd0aD4xKXJldHVybiB0aGlzLm9wdGlvbnMudmFsdWVzW2VdPXRoaXMuX3RyaW1BbGlnblZhbHVlKGkpLHRoaXMuX3JlZnJlc2hWYWx1ZSgpLHRoaXMuX2NoYW5nZShudWxsLGUpLHZvaWQgMDtpZighYXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdGhpcy5fdmFsdWVzKCk7aWYoIXQuaXNBcnJheShhcmd1bWVudHNbMF0pKXJldHVybiB0aGlzLl9oYXNNdWx0aXBsZVZhbHVlcygpP3RoaXMuX3ZhbHVlcyhlKTp0aGlzLnZhbHVlKCk7Zm9yKHM9dGhpcy5vcHRpb25zLnZhbHVlcyxuPWFyZ3VtZW50c1swXSxvPTA7cy5sZW5ndGg+bztvKz0xKXNbb109dGhpcy5fdHJpbUFsaWduVmFsdWUobltvXSksdGhpcy5fY2hhbmdlKG51bGwsbyk7dGhpcy5fcmVmcmVzaFZhbHVlKCl9LF9zZXRPcHRpb246ZnVuY3Rpb24oZSxpKXt2YXIgcyxuPTA7c3dpdGNoKFwicmFuZ2VcIj09PWUmJnRoaXMub3B0aW9ucy5yYW5nZT09PSEwJiYoXCJtaW5cIj09PWk/KHRoaXMub3B0aW9ucy52YWx1ZT10aGlzLl92YWx1ZXMoMCksdGhpcy5vcHRpb25zLnZhbHVlcz1udWxsKTpcIm1heFwiPT09aSYmKHRoaXMub3B0aW9ucy52YWx1ZT10aGlzLl92YWx1ZXModGhpcy5vcHRpb25zLnZhbHVlcy5sZW5ndGgtMSksdGhpcy5vcHRpb25zLnZhbHVlcz1udWxsKSksdC5pc0FycmF5KHRoaXMub3B0aW9ucy52YWx1ZXMpJiYobj10aGlzLm9wdGlvbnMudmFsdWVzLmxlbmd0aCksdGhpcy5fc3VwZXIoZSxpKSxlKXtjYXNlXCJvcmllbnRhdGlvblwiOnRoaXMuX2RldGVjdE9yaWVudGF0aW9uKCksdGhpcy5fcmVtb3ZlQ2xhc3MoXCJ1aS1zbGlkZXItaG9yaXpvbnRhbCB1aS1zbGlkZXItdmVydGljYWxcIikuX2FkZENsYXNzKFwidWktc2xpZGVyLVwiK3RoaXMub3JpZW50YXRpb24pLHRoaXMuX3JlZnJlc2hWYWx1ZSgpLHRoaXMub3B0aW9ucy5yYW5nZSYmdGhpcy5fcmVmcmVzaFJhbmdlKGkpLHRoaXMuaGFuZGxlcy5jc3MoXCJob3Jpem9udGFsXCI9PT1pP1wiYm90dG9tXCI6XCJsZWZ0XCIsXCJcIik7YnJlYWs7Y2FzZVwidmFsdWVcIjp0aGlzLl9hbmltYXRlT2ZmPSEwLHRoaXMuX3JlZnJlc2hWYWx1ZSgpLHRoaXMuX2NoYW5nZShudWxsLDApLHRoaXMuX2FuaW1hdGVPZmY9ITE7YnJlYWs7Y2FzZVwidmFsdWVzXCI6Zm9yKHRoaXMuX2FuaW1hdGVPZmY9ITAsdGhpcy5fcmVmcmVzaFZhbHVlKCkscz1uLTE7cz49MDtzLS0pdGhpcy5fY2hhbmdlKG51bGwscyk7dGhpcy5fYW5pbWF0ZU9mZj0hMTticmVhaztjYXNlXCJzdGVwXCI6Y2FzZVwibWluXCI6Y2FzZVwibWF4XCI6dGhpcy5fYW5pbWF0ZU9mZj0hMCx0aGlzLl9jYWxjdWxhdGVOZXdNYXgoKSx0aGlzLl9yZWZyZXNoVmFsdWUoKSx0aGlzLl9hbmltYXRlT2ZmPSExO2JyZWFrO2Nhc2VcInJhbmdlXCI6dGhpcy5fYW5pbWF0ZU9mZj0hMCx0aGlzLl9yZWZyZXNoKCksdGhpcy5fYW5pbWF0ZU9mZj0hMX19LF9zZXRPcHRpb25EaXNhYmxlZDpmdW5jdGlvbih0KXt0aGlzLl9zdXBlcih0KSx0aGlzLl90b2dnbGVDbGFzcyhudWxsLFwidWktc3RhdGUtZGlzYWJsZWRcIiwhIXQpfSxfdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMudmFsdWU7cmV0dXJuIHQ9dGhpcy5fdHJpbUFsaWduVmFsdWUodCl9LF92YWx1ZXM6ZnVuY3Rpb24odCl7dmFyIGUsaSxzO2lmKGFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIGU9dGhpcy5vcHRpb25zLnZhbHVlc1t0XSxlPXRoaXMuX3RyaW1BbGlnblZhbHVlKGUpO2lmKHRoaXMuX2hhc011bHRpcGxlVmFsdWVzKCkpe2ZvcihpPXRoaXMub3B0aW9ucy52YWx1ZXMuc2xpY2UoKSxzPTA7aS5sZW5ndGg+cztzKz0xKWlbc109dGhpcy5fdHJpbUFsaWduVmFsdWUoaVtzXSk7cmV0dXJuIGl9cmV0dXJuW119LF90cmltQWxpZ25WYWx1ZTpmdW5jdGlvbih0KXtpZih0aGlzLl92YWx1ZU1pbigpPj10KXJldHVybiB0aGlzLl92YWx1ZU1pbigpO2lmKHQ+PXRoaXMuX3ZhbHVlTWF4KCkpcmV0dXJuIHRoaXMuX3ZhbHVlTWF4KCk7dmFyIGU9dGhpcy5vcHRpb25zLnN0ZXA+MD90aGlzLm9wdGlvbnMuc3RlcDoxLGk9KHQtdGhpcy5fdmFsdWVNaW4oKSklZSxzPXQtaTtyZXR1cm4gMipNYXRoLmFicyhpKT49ZSYmKHMrPWk+MD9lOi1lKSxwYXJzZUZsb2F0KHMudG9GaXhlZCg1KSl9LF9jYWxjdWxhdGVOZXdNYXg6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMubWF4LGU9dGhpcy5fdmFsdWVNaW4oKSxpPXRoaXMub3B0aW9ucy5zdGVwLHM9TWF0aC5yb3VuZCgodC1lKS9pKSppO3Q9cytlLHQ+dGhpcy5vcHRpb25zLm1heCYmKHQtPWkpLHRoaXMubWF4PXBhcnNlRmxvYXQodC50b0ZpeGVkKHRoaXMuX3ByZWNpc2lvbigpKSl9LF9wcmVjaXNpb246ZnVuY3Rpb24oKXt2YXIgdD10aGlzLl9wcmVjaXNpb25PZih0aGlzLm9wdGlvbnMuc3RlcCk7cmV0dXJuIG51bGwhPT10aGlzLm9wdGlvbnMubWluJiYodD1NYXRoLm1heCh0LHRoaXMuX3ByZWNpc2lvbk9mKHRoaXMub3B0aW9ucy5taW4pKSksdH0sX3ByZWNpc2lvbk9mOmZ1bmN0aW9uKHQpe3ZhciBlPVwiXCIrdCxpPWUuaW5kZXhPZihcIi5cIik7cmV0dXJuLTE9PT1pPzA6ZS5sZW5ndGgtaS0xfSxfdmFsdWVNaW46ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5vcHRpb25zLm1pbn0sX3ZhbHVlTWF4OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubWF4fSxfcmVmcmVzaFJhbmdlOmZ1bmN0aW9uKHQpe1widmVydGljYWxcIj09PXQmJnRoaXMucmFuZ2UuY3NzKHt3aWR0aDpcIlwiLGxlZnQ6XCJcIn0pLFwiaG9yaXpvbnRhbFwiPT09dCYmdGhpcy5yYW5nZS5jc3Moe2hlaWdodDpcIlwiLGJvdHRvbTpcIlwifSl9LF9yZWZyZXNoVmFsdWU6ZnVuY3Rpb24oKXt2YXIgZSxpLHMsbixvLGE9dGhpcy5vcHRpb25zLnJhbmdlLHI9dGhpcy5vcHRpb25zLGw9dGhpcyxoPXRoaXMuX2FuaW1hdGVPZmY/ITE6ci5hbmltYXRlLGM9e307dGhpcy5faGFzTXVsdGlwbGVWYWx1ZXMoKT90aGlzLmhhbmRsZXMuZWFjaChmdW5jdGlvbihzKXtpPTEwMCooKGwudmFsdWVzKHMpLWwuX3ZhbHVlTWluKCkpLyhsLl92YWx1ZU1heCgpLWwuX3ZhbHVlTWluKCkpKSxjW1wiaG9yaXpvbnRhbFwiPT09bC5vcmllbnRhdGlvbj9cImxlZnRcIjpcImJvdHRvbVwiXT1pK1wiJVwiLHQodGhpcykuc3RvcCgxLDEpW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oYyxyLmFuaW1hdGUpLGwub3B0aW9ucy5yYW5nZT09PSEwJiYoXCJob3Jpem9udGFsXCI9PT1sLm9yaWVudGF0aW9uPygwPT09cyYmbC5yYW5nZS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7bGVmdDppK1wiJVwifSxyLmFuaW1hdGUpLDE9PT1zJiZsLnJhbmdlW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe3dpZHRoOmktZStcIiVcIn0se3F1ZXVlOiExLGR1cmF0aW9uOnIuYW5pbWF0ZX0pKTooMD09PXMmJmwucmFuZ2Uuc3RvcCgxLDEpW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe2JvdHRvbTppK1wiJVwifSxyLmFuaW1hdGUpLDE9PT1zJiZsLnJhbmdlW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe2hlaWdodDppLWUrXCIlXCJ9LHtxdWV1ZTohMSxkdXJhdGlvbjpyLmFuaW1hdGV9KSkpLGU9aX0pOihzPXRoaXMudmFsdWUoKSxuPXRoaXMuX3ZhbHVlTWluKCksbz10aGlzLl92YWx1ZU1heCgpLGk9byE9PW4/MTAwKigocy1uKS8oby1uKSk6MCxjW1wiaG9yaXpvbnRhbFwiPT09dGhpcy5vcmllbnRhdGlvbj9cImxlZnRcIjpcImJvdHRvbVwiXT1pK1wiJVwiLHRoaXMuaGFuZGxlLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKGMsci5hbmltYXRlKSxcIm1pblwiPT09YSYmXCJob3Jpem9udGFsXCI9PT10aGlzLm9yaWVudGF0aW9uJiZ0aGlzLnJhbmdlLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHt3aWR0aDppK1wiJVwifSxyLmFuaW1hdGUpLFwibWF4XCI9PT1hJiZcImhvcml6b250YWxcIj09PXRoaXMub3JpZW50YXRpb24mJnRoaXMucmFuZ2Uuc3RvcCgxLDEpW2g/XCJhbmltYXRlXCI6XCJjc3NcIl0oe3dpZHRoOjEwMC1pK1wiJVwifSxyLmFuaW1hdGUpLFwibWluXCI9PT1hJiZcInZlcnRpY2FsXCI9PT10aGlzLm9yaWVudGF0aW9uJiZ0aGlzLnJhbmdlLnN0b3AoMSwxKVtoP1wiYW5pbWF0ZVwiOlwiY3NzXCJdKHtoZWlnaHQ6aStcIiVcIn0sci5hbmltYXRlKSxcIm1heFwiPT09YSYmXCJ2ZXJ0aWNhbFwiPT09dGhpcy5vcmllbnRhdGlvbiYmdGhpcy5yYW5nZS5zdG9wKDEsMSlbaD9cImFuaW1hdGVcIjpcImNzc1wiXSh7aGVpZ2h0OjEwMC1pK1wiJVwifSxyLmFuaW1hdGUpKX0sX2hhbmRsZUV2ZW50czp7a2V5ZG93bjpmdW5jdGlvbihlKXt2YXIgaSxzLG4sbyxhPXQoZS50YXJnZXQpLmRhdGEoXCJ1aS1zbGlkZXItaGFuZGxlLWluZGV4XCIpO3N3aXRjaChlLmtleUNvZGUpe2Nhc2UgdC51aS5rZXlDb2RlLkhPTUU6Y2FzZSB0LnVpLmtleUNvZGUuRU5EOmNhc2UgdC51aS5rZXlDb2RlLlBBR0VfVVA6Y2FzZSB0LnVpLmtleUNvZGUuUEFHRV9ET1dOOmNhc2UgdC51aS5rZXlDb2RlLlVQOmNhc2UgdC51aS5rZXlDb2RlLlJJR0hUOmNhc2UgdC51aS5rZXlDb2RlLkRPV046Y2FzZSB0LnVpLmtleUNvZGUuTEVGVDppZihlLnByZXZlbnREZWZhdWx0KCksIXRoaXMuX2tleVNsaWRpbmcmJih0aGlzLl9rZXlTbGlkaW5nPSEwLHRoaXMuX2FkZENsYXNzKHQoZS50YXJnZXQpLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIiksaT10aGlzLl9zdGFydChlLGEpLGk9PT0hMSkpcmV0dXJufXN3aXRjaChvPXRoaXMub3B0aW9ucy5zdGVwLHM9bj10aGlzLl9oYXNNdWx0aXBsZVZhbHVlcygpP3RoaXMudmFsdWVzKGEpOnRoaXMudmFsdWUoKSxlLmtleUNvZGUpe2Nhc2UgdC51aS5rZXlDb2RlLkhPTUU6bj10aGlzLl92YWx1ZU1pbigpO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkVORDpuPXRoaXMuX3ZhbHVlTWF4KCk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuUEFHRV9VUDpuPXRoaXMuX3RyaW1BbGlnblZhbHVlKHMrKHRoaXMuX3ZhbHVlTWF4KCktdGhpcy5fdmFsdWVNaW4oKSkvdGhpcy5udW1QYWdlcyk7YnJlYWs7Y2FzZSB0LnVpLmtleUNvZGUuUEFHRV9ET1dOOm49dGhpcy5fdHJpbUFsaWduVmFsdWUocy0odGhpcy5fdmFsdWVNYXgoKS10aGlzLl92YWx1ZU1pbigpKS90aGlzLm51bVBhZ2VzKTticmVhaztjYXNlIHQudWkua2V5Q29kZS5VUDpjYXNlIHQudWkua2V5Q29kZS5SSUdIVDppZihzPT09dGhpcy5fdmFsdWVNYXgoKSlyZXR1cm47bj10aGlzLl90cmltQWxpZ25WYWx1ZShzK28pO2JyZWFrO2Nhc2UgdC51aS5rZXlDb2RlLkRPV046Y2FzZSB0LnVpLmtleUNvZGUuTEVGVDppZihzPT09dGhpcy5fdmFsdWVNaW4oKSlyZXR1cm47bj10aGlzLl90cmltQWxpZ25WYWx1ZShzLW8pfXRoaXMuX3NsaWRlKGUsYSxuKX0sa2V5dXA6ZnVuY3Rpb24oZSl7dmFyIGk9dChlLnRhcmdldCkuZGF0YShcInVpLXNsaWRlci1oYW5kbGUtaW5kZXhcIik7dGhpcy5fa2V5U2xpZGluZyYmKHRoaXMuX2tleVNsaWRpbmc9ITEsdGhpcy5fc3RvcChlLGkpLHRoaXMuX2NoYW5nZShlLGkpLHRoaXMuX3JlbW92ZUNsYXNzKHQoZS50YXJnZXQpLG51bGwsXCJ1aS1zdGF0ZS1hY3RpdmVcIikpfX19KX0pOyIsInZhciBzZFRvb2x0aXAgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIHZhciB0b29sdGlwVGltZU91dCA9IG51bGw7XHJcbiAgICB2YXIgZGlzcGxheVRpbWVPdmVyID0gMDtcclxuICAgIHZhciBkaXNwbGF5VGltZUNsaWNrID0gMzAwMDtcclxuICAgIHZhciBoaWRlVGltZSA9IDEwMDtcclxuICAgIHZhciBhcnJvdyA9IDEwO1xyXG4gICAgdmFyIGFycm93V2lkdGggPSA4O1xyXG4gICAgdmFyIHRvb2x0aXA7XHJcbiAgICB2YXIgc2l6ZSA9ICdzbWFsbCc7XHJcbiAgICB2YXIgaGlkZUNsYXNzID0gJ2hpZGRlbic7XHJcbiAgICB2YXIgdG9vbHRpcEVsZW1lbnRzO1xyXG4gICAgdmFyIGN1cnJlbnRFbGVtZW50O1xyXG5cclxuICAgIGZ1bmN0aW9uIHRvb2x0aXBJbml0KCkge1xyXG4gICAgICAgIHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCd0aXBzb19idWJibGUnKS5hZGRDbGFzcyhzaXplKS5hZGRDbGFzcyhoaWRlQ2xhc3MpXHJcbiAgICAgICAgICAgIC5odG1sKCc8ZGl2IGNsYXNzPVwidGlwc29fYXJyb3dcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGl0c29fdGl0bGVcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGlwc29fY29udGVudFwiPjwvZGl2PicpO1xyXG4gICAgICAgICQodG9vbHRpcCkub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGNoZWNrTW91c2VQb3MoZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh0b29sdGlwKS5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgY2hlY2tNb3VzZVBvcyhlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRvb2x0aXApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoZWNrTW91c2VQb3MoZSkge1xyXG4gICAgICAgIGlmIChlLmNsaWVudFggPiAkKGN1cnJlbnRFbGVtZW50KS5vZmZzZXQoKS5sZWZ0ICYmIGUuY2xpZW50WCA8ICQoY3VycmVudEVsZW1lbnQpLm9mZnNldCgpLmxlZnQgKyAkKGN1cnJlbnRFbGVtZW50KS5vdXRlcldpZHRoKClcclxuICAgICAgICAgICAgJiYgZS5jbGllbnRZID4gJChjdXJyZW50RWxlbWVudCkub2Zmc2V0KCkudG9wICYmIGUuY2xpZW50WSA8ICQoY3VycmVudEVsZW1lbnQpLm9mZnNldCgpLnRvcCArICQoY3VycmVudEVsZW1lbnQpLm91dGVySGVpZ2h0KCkpIHtcclxuICAgICAgICAgICAgdG9vbHRpcFNob3coY3VycmVudEVsZW1lbnQsIGRpc3BsYXlUaW1lT3Zlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRvb2x0aXBTaG93KGVsZW0sIGRpc3BsYXlUaW1lKSB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRvb2x0aXBUaW1lT3V0KTtcclxuXHJcbiAgICAgICAgdmFyIHRpdGxlID0gJChlbGVtKS5kYXRhKCdvcmlnaW5hbC10aXRsZScpO1xyXG4gICAgICAgIHZhciBodG1sID0gJCgnIycrJChlbGVtKS5kYXRhKCdvcmlnaW5hbC1odG1sJykpLmh0bWwoKTtcclxuICAgICAgICBpZiAoaHRtbCkge1xyXG4gICAgICAgICAgICB0aXRsZSA9IGh0bWw7XHJcbiAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ3RpcHNvX2J1YmJsZV9odG1sJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndGlwc29fYnViYmxlX2h0bWwnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gJChlbGVtKS5kYXRhKCdwbGFjZW1lbnQnKSB8fCAnYm90dG9tJztcclxuICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lciBib3R0b21fcmlnaHRfY29ybmVyIHRvcF9sZWZ0X2Nvcm5lciBib3R0b21fbGVmdF9jb3JuZXJcIik7XHJcblxyXG4gICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpdHNvX3RpdGxlJykuaHRtbCh0aXRsZSk7XHJcbiAgICAgICAgc2V0UG9zaXRvbihlbGVtLCBwb3NpdGlvbik7XHJcbiAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcyhoaWRlQ2xhc3MpO1xyXG4gICAgICAgIGN1cnJlbnRFbGVtZW50ID0gZWxlbTtcclxuXHJcbiAgICAgICAgaWYgKGRpc3BsYXlUaW1lID4gMCkge1xyXG4gICAgICAgICAgICB0b29sdGlwVGltZU91dCA9IHNldFRpbWVvdXQodG9vbHRpcEhpZGUsIGRpc3BsYXlUaW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0b29sdGlwSGlkZSgpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodG9vbHRpcFRpbWVPdXQpO1xyXG4gICAgICAgIHRvb2x0aXBUaW1lT3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKGhpZGVDbGFzcyk7XHJcbiAgICAgICAgfSwgaGlkZVRpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldFBvc2l0b24oZWxlbSwgcG9zaXRpb24pe1xyXG4gICAgICAgIHZhciAkZSA9ICQoZWxlbSk7XHJcbiAgICAgICAgdmFyICR3aW4gPSAkKHdpbmRvdyk7XHJcbiAgICAgICAgdmFyIGN1c3RvbVRvcCA9ICQoZWxlbSkuZGF0YSgndG9wJyk7Ly/Qt9Cw0LTQsNC90LAg0L/QvtC30LjRhtC40Y8g0LLQvdGD0YLRgNC4INGN0LvQtdC80LXQvdGC0LBcclxuICAgICAgICB2YXIgY3VzdG9tTGVmdCA9ICQoZWxlbSkuZGF0YSgnbGVmdCcpOy8v0LfQsNC00LDQvdCwINC/0L7Qt9C40YbQuNGPINCy0L3Rg9GC0YDQuCDRjdC70LXQvNC10L3RgtCwXHJcbiAgICAgICAgdmFyIG5vcmV2ZXJ0ID0gJChlbGVtKS5kYXRhKCdub3JldmVydCcpOy8v0L3QtSDQv9C10YDQtdCy0L7RgNCw0YfQuNCy0LDRgtGMXHJcbiAgICAgICAgc3dpdGNoKHBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICBwb3NfbGVmdCA9ICRlLm9mZnNldCgpLmxlZnQgKyAoY3VzdG9tTGVmdCA/IGN1c3RvbUxlZnQgOiAkZS5vdXRlcldpZHRoKCkgLyAyKSAtICQodG9vbHRpcCkub3V0ZXJXaWR0aCgpIC8gMjtcclxuICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgLSAkKHRvb2x0aXApLm91dGVySGVpZ2h0KCkgKyAoY3VzdG9tVG9wID8gY3VzdG9tVG9wIDogMCkgLSBhcnJvdztcclxuICAgICAgICAgICAgICAgICQodG9vbHRpcCkuZmluZCgnLnRpcHNvX2Fycm93JykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5MZWZ0OiAtYXJyb3dXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICgocG9zX3RvcCA8ICR3aW4uc2Nyb2xsVG9wKCkpICYmICFub3JldmVydCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgKyhjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAkZS5vdXRlckhlaWdodCgpKSArIGFycm93O1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkucmVtb3ZlQ2xhc3MoJ3RvcCBib3R0b20gbGVmdCByaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQodG9vbHRpcCkuYWRkQ2xhc3MoJ2JvdHRvbScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndG9wJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICAgICAgICAgIHBvc19sZWZ0ID0gJGUub2Zmc2V0KCkubGVmdCArIChjdXN0b21MZWZ0ID8gY3VzdG9tTGVmdCA6ICRlLm91dGVyV2lkdGgoKSAvIDIpIC0gJCh0b29sdGlwKS5vdXRlcldpZHRoKCkgLyAyO1xyXG4gICAgICAgICAgICAgICAgcG9zX3RvcCA9ICRlLm9mZnNldCgpLnRvcCArIChjdXN0b21Ub3AgPyBjdXN0b21Ub3AgOiAkZS5vdXRlckhlaWdodCgpKSArIGFycm93O1xyXG4gICAgICAgICAgICAgICAgJCh0b29sdGlwKS5maW5kKCcudGlwc29fYXJyb3cnKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQ6IC1hcnJvd1dpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJydcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKChwb3NfdG9wICsgJCh0b29sdGlwKS5oZWlnaHQoKSA+ICR3aW4uc2Nyb2xsVG9wKCkgKyAkd2luLm91dGVySGVpZ2h0KCkpICYmICFub3JldmVydCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc190b3AgPSAkZS5vZmZzZXQoKS50b3AgLSAkKHRvb2x0aXApLmhlaWdodCgpICsgKGN1c3RvbVRvcCA/IGN1c3RvbVRvcCA6IDApIC0gYXJyb3c7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5yZW1vdmVDbGFzcygndG9wIGJvdHRvbSBsZWZ0IHJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0b29sdGlwKS5hZGRDbGFzcygndG9wJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLnJlbW92ZUNsYXNzKCd0b3AgYm90dG9tIGxlZnQgcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHRvb2x0aXApLmFkZENsYXNzKCdib3R0b20nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKHRvb2x0aXApLmNzcyh7XHJcbiAgICAgICAgICAgIGxlZnQ6ICBwb3NfbGVmdCxcclxuICAgICAgICAgICAgdG9wOiBwb3NfdG9wXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gc2V0RXZlbnRzKCkge1xyXG5cclxuICAgICAgICB0b29sdGlwRWxlbWVudHMgPSAkKCdbZGF0YS10b2dnbGU9dG9vbHRpcF0nKTtcclxuXHJcbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmRhdGEoJ2NsaWNrYWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCh0b29sdGlwKS5oYXNDbGFzcyhoaWRlQ2xhc3MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcFNob3codGhpcywgZGlzcGxheVRpbWVDbGljayk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBIaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRvb2x0aXBFbGVtZW50cy5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IDEwMjQpIHtcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBTaG93KHRoaXMsIGRpc3BsYXlUaW1lT3Zlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0b29sdGlwRWxlbWVudHMub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMDI0KSB7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwU2hvdyh0aGlzLCBkaXNwbGF5VGltZU92ZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdG9vbHRpcEVsZW1lbnRzLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24gKCl7XHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMDI0KSB7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwSGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gICAgIHRvb2x0aXBJbml0KCk7XHJcbiAgICAvLyAgICAgc2V0RXZlbnRzKCk7XHJcbiAgICAvLyB9KTtcclxuICAgIC8vXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGluaXQ6IHRvb2x0aXBJbml0LFxyXG4gICAgICAgIHNldEV2ZW50czogc2V0RXZlbnRzXHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIHNkVG9vbHRpcC5pbml0KCk7XHJcbiAgICBzZFRvb2x0aXAuc2V0RXZlbnRzKCk7XHJcbn0pO1xyXG5cclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgJG5vdHlmaV9idG4gPSAkKCcuaGVhZGVyLWxvZ29fbm90eScpO1xyXG4gIGlmICgkbm90eWZpX2J0bi5sZW5ndGggPT0gMCkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdmFyIGhyZWYgPSAnLycrbGFuZy5ocmVmX3ByZWZpeCsnYWNjb3VudC9ub3RpZmljYXRpb24nO1xyXG5cclxuICAkLmdldChocmVmLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhLm5vdGlmaWNhdGlvbnMgfHwgZGF0YS5ub3RpZmljYXRpb25zLmxlbmd0aCA9PSAwKSByZXR1cm47XHJcblxyXG4gICAgdmFyIG91dCA9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWJveD48ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWJveC1pbm5lcj48dWwgY2xhc3M9XCJoZWFkZXItbm90eS1saXN0XCI+JztcclxuICAgICRub3R5ZmlfYnRuLmZpbmQoJ2EnKS5yZW1vdmVBdHRyKCdocmVmJyk7XHJcbiAgICB2YXIgaGFzX25ldyA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm5vdGlmaWNhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgZWwgPSBkYXRhLm5vdGlmaWNhdGlvbnNbaV07XHJcbiAgICAgIHZhciBpc19uZXcgPSAoZWwuaXNfdmlld2VkID09IDAgJiYgZWwudHlwZV9pZCA9PSAyKTtcclxuICAgICAgb3V0ICs9ICc8bGkgY2xhc3M9XCJoZWFkZXItbm90eS1pdGVtJyArIChpc19uZXcgPyAnIGhlYWRlci1ub3R5LWl0ZW1fbmV3JyA6ICcnKSArICdcIj4nO1xyXG4gICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktZGF0YT4nICsgZWwuZGF0YSArICc8L2Rpdj4nO1xyXG4gICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktdGV4dD4nICsgZWwudGV4dCArICc8L2Rpdj4nO1xyXG4gICAgICBvdXQgKz0gJzwvbGk+JztcclxuICAgICAgaGFzX25ldyA9IGhhc19uZXcgfHwgaXNfbmV3O1xyXG4gICAgfVxyXG5cclxuICAgIG91dCArPSAnPC91bD4nO1xyXG4gICAgb3V0ICs9ICc8YSBjbGFzcz1cImJ0biBoZWFkZXItbm90eS1ib3gtYnRuXCIgaHJlZj1cIicraHJlZisnXCI+JyArIGRhdGEuYnRuICsgJzwvYT4nO1xyXG4gICAgb3V0ICs9ICc8L2Rpdj48L2Rpdj4nO1xyXG4gICAgJCgnLmhlYWRlcicpLmFwcGVuZChvdXQpO1xyXG5cclxuICAgIGlmIChoYXNfbmV3KSB7XHJcbiAgICAgICRub3R5ZmlfYnRuLmFkZENsYXNzKCd0b29sdGlwJykuYWRkQ2xhc3MoJ2hhcy1ub3R5Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgJG5vdHlmaV9idG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBpZiAoJCgnLmhlYWRlci1ub3R5LWJveCcpLmhhc0NsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpKSB7XHJcbiAgICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xyXG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5hZGRDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuXHJcbiAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2hhcy1ub3R5JykpIHtcclxuICAgICAgICAgICQucG9zdCgnL2FjY291bnQvbm90aWZpY2F0aW9uJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuaGVhZGVyLWxvZ29fbm90eScpLnJlbW92ZUNsYXNzKCd0b29sdGlwJykucmVtb3ZlQ2xhc3MoJ2hhcy1ub3R5Jyk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLW5vdHktYm94Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xyXG4gICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5oZWFkZXItbm90eS1saXN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KVxyXG4gIH0sICdqc29uJyk7XHJcblxyXG59KSgpO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pZiAodHlwZW9mIG1paGFpbGRldiA9PSBcInVuZGVmaW5lZFwiIHx8ICFtaWhhaWxkZXYpIHtcclxuICAgIHZhciBtaWhhaWxkZXYgPSB7fTtcclxuICAgIG1paGFpbGRldi5lbEZpbmRlciA9IHtcclxuICAgICAgICBvcGVuTWFuYWdlcjogZnVuY3Rpb24ob3B0aW9ucyl7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSBcIm1lbnViYXI9bm8sdG9vbGJhcj1ubyxsb2NhdGlvbj1ubyxkaXJlY3Rvcmllcz1ubyxzdGF0dXM9bm8sZnVsbHNjcmVlbj1ub1wiO1xyXG4gICAgICAgICAgICBpZihvcHRpb25zLndpZHRoID09ICdhdXRvJyl7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLndpZHRoID0gJCh3aW5kb3cpLndpZHRoKCkvMS41O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihvcHRpb25zLmhlaWdodCA9PSAnYXV0bycpe1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5oZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCkvMS41O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMgKyBcIix3aWR0aD1cIiArIG9wdGlvbnMud2lkdGg7XHJcbiAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcyArIFwiLGhlaWdodD1cIiArIG9wdGlvbnMuaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhwYXJhbXMpO1xyXG4gICAgICAgICAgICB2YXIgd2luID0gd2luZG93Lm9wZW4ob3B0aW9ucy51cmwsICdFbEZpbmRlck1hbmFnZXInICsgb3B0aW9ucy5pZCwgcGFyYW1zKTtcclxuICAgICAgICAgICAgd2luLmZvY3VzKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uczoge30sXHJcbiAgICAgICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGlkLCBmdW5jKXtcclxuICAgICAgICAgICAgdGhpcy5mdW5jdGlvbnNbaWRdID0gZnVuYztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNhbGxGdW5jdGlvbjogZnVuY3Rpb24oaWQsIGZpbGUpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mdW5jdGlvbnNbaWRdKGZpbGUsIGlkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uUmV0dXJuVG9JbnB1dDogZnVuY3Rpb24oZmlsZSwgaWQpe1xyXG4gICAgICAgICAgICBqUXVlcnkoJyMnICsgaWQpLnZhbChmaWxlLnVybCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG59XHJcblxyXG5cclxuXHJcbnZhciBtZWdhc2xpZGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgc2xpZGVyX2RhdGEgPSBmYWxzZTtcclxuICB2YXIgY29udGFpbmVyX2lkID0gXCJzZWN0aW9uI21lZ2Ffc2xpZGVyXCI7XHJcbiAgdmFyIHBhcmFsbGF4X2dyb3VwID0gZmFsc2U7XHJcbiAgdmFyIHBhcmFsbGF4X3RpbWVyID0gZmFsc2U7XHJcbiAgdmFyIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xyXG4gIHZhciBwYXJhbGxheF9kID0gMTtcclxuICB2YXIgbW9iaWxlX21vZGUgPSAtMTtcclxuICB2YXIgbWF4X3RpbWVfbG9hZF9waWMgPSAzMDA7XHJcbiAgdmFyIG1vYmlsZV9zaXplID0gNzAwO1xyXG4gIHZhciByZW5kZXJfc2xpZGVfbm9tID0gMDtcclxuICB2YXIgdG90X2ltZ193YWl0O1xyXG4gIHZhciBzbGlkZXM7XHJcbiAgdmFyIHNsaWRlX3NlbGVjdF9ib3g7XHJcbiAgdmFyIGVkaXRvcjtcclxuICB2YXIgdGltZW91dElkO1xyXG4gIHZhciBzY3JvbGxfcGVyaW9kID0gNjAwMDtcclxuXHJcbiAgdmFyIHBvc0FyciA9IFtcclxuICAgICdzbGlkZXJfX3RleHQtbHQnLCAnc2xpZGVyX190ZXh0LWN0JywgJ3NsaWRlcl9fdGV4dC1ydCcsXHJcbiAgICAnc2xpZGVyX190ZXh0LWxjJywgJ3NsaWRlcl9fdGV4dC1jYycsICdzbGlkZXJfX3RleHQtcmMnLFxyXG4gICAgJ3NsaWRlcl9fdGV4dC1sYicsICdzbGlkZXJfX3RleHQtY2InLCAnc2xpZGVyX190ZXh0LXJiJyxcclxuICBdO1xyXG4gIHZhciBwb3NfbGlzdCA9IFtcclxuICAgICfQm9C10LLQviDQstC10YDRhScsICfRhtC10L3RgtGAINCy0LXRgNGFJywgJ9C/0YDQsNCy0L4g0LLQtdGA0YUnLFxyXG4gICAgJ9Cb0LXQstC+INGG0LXQvdGC0YAnLCAn0YbQtdC90YLRgCcsICfQv9GA0LDQstC+INGG0LXQvdGC0YAnLFxyXG4gICAgJ9Cb0LXQstC+INC90LjQtycsICfRhtC10L3RgtGAINC90LjQtycsICfQv9GA0LDQstC+INC90LjQtycsXHJcbiAgXTtcclxuICB2YXIgc2hvd19kZWxheSA9IFtcclxuICAgICdzaG93X25vX2RlbGF5JyxcclxuICAgICdzaG93X2RlbGF5XzA1JyxcclxuICAgICdzaG93X2RlbGF5XzEwJyxcclxuICAgICdzaG93X2RlbGF5XzE1JyxcclxuICAgICdzaG93X2RlbGF5XzIwJyxcclxuICAgICdzaG93X2RlbGF5XzI1JyxcclxuICAgICdzaG93X2RlbGF5XzMwJ1xyXG4gIF07XHJcbiAgdmFyIGhpZGVfZGVsYXkgPSBbXHJcbiAgICAnaGlkZV9ub19kZWxheScsXHJcbiAgICAnaGlkZV9kZWxheV8wNScsXHJcbiAgICAnaGlkZV9kZWxheV8xMCcsXHJcbiAgICAnaGlkZV9kZWxheV8xNScsXHJcbiAgICAnaGlkZV9kZWxheV8yMCdcclxuICBdO1xyXG4gIHZhciB5ZXNfbm9fYXJyID0gW1xyXG4gICAgJ25vJyxcclxuICAgICd5ZXMnXHJcbiAgXTtcclxuICB2YXIgeWVzX25vX3ZhbCA9IFtcclxuICAgICcnLFxyXG4gICAgJ2ZpeGVkX19mdWxsLWhlaWdodCdcclxuICBdO1xyXG4gIHZhciBidG5fc3R5bGUgPSBbXHJcbiAgICAnbm9uZScsXHJcbiAgICAnYm9yZG8nLFxyXG4gICAgJ2JsYWNrJyxcclxuICAgICdibHVlJyxcclxuICAgICdkYXJrLWJsdWUnLFxyXG4gICAgJ3JlZCcsXHJcbiAgICAnb3JhbmdlJyxcclxuICAgICdncmVlbicsXHJcbiAgICAnbGlnaHQtZ3JlZW4nLFxyXG4gICAgJ2RhcmstZ3JlZW4nLFxyXG4gICAgJ3BpbmsnLFxyXG4gICAgJ3llbGxvdydcclxuICBdO1xyXG4gIHZhciBzaG93X2FuaW1hdGlvbnMgPSBbXHJcbiAgICBcIm5vdF9hbmltYXRlXCIsXHJcbiAgICBcImJvdW5jZUluXCIsXHJcbiAgICBcImJvdW5jZUluRG93blwiLFxyXG4gICAgXCJib3VuY2VJbkxlZnRcIixcclxuICAgIFwiYm91bmNlSW5SaWdodFwiLFxyXG4gICAgXCJib3VuY2VJblVwXCIsXHJcbiAgICBcImZhZGVJblwiLFxyXG4gICAgXCJmYWRlSW5Eb3duXCIsXHJcbiAgICBcImZhZGVJbkxlZnRcIixcclxuICAgIFwiZmFkZUluUmlnaHRcIixcclxuICAgIFwiZmFkZUluVXBcIixcclxuICAgIFwiZmxpcEluWFwiLFxyXG4gICAgXCJmbGlwSW5ZXCIsXHJcbiAgICBcImxpZ2h0U3BlZWRJblwiLFxyXG4gICAgXCJyb3RhdGVJblwiLFxyXG4gICAgXCJyb3RhdGVJbkRvd25MZWZ0XCIsXHJcbiAgICBcInJvdGF0ZUluVXBMZWZ0XCIsXHJcbiAgICBcInJvdGF0ZUluVXBSaWdodFwiLFxyXG4gICAgXCJqYWNrSW5UaGVCb3hcIixcclxuICAgIFwicm9sbEluXCIsXHJcbiAgICBcInpvb21JblwiXHJcbiAgXTtcclxuXHJcbiAgdmFyIGhpZGVfYW5pbWF0aW9ucyA9IFtcclxuICAgIFwibm90X2FuaW1hdGVcIixcclxuICAgIFwiYm91bmNlT3V0XCIsXHJcbiAgICBcImJvdW5jZU91dERvd25cIixcclxuICAgIFwiYm91bmNlT3V0TGVmdFwiLFxyXG4gICAgXCJib3VuY2VPdXRSaWdodFwiLFxyXG4gICAgXCJib3VuY2VPdXRVcFwiLFxyXG4gICAgXCJmYWRlT3V0XCIsXHJcbiAgICBcImZhZGVPdXREb3duXCIsXHJcbiAgICBcImZhZGVPdXRMZWZ0XCIsXHJcbiAgICBcImZhZGVPdXRSaWdodFwiLFxyXG4gICAgXCJmYWRlT3V0VXBcIixcclxuICAgIFwiZmxpcE91dFhcIixcclxuICAgIFwibGlwT3V0WVwiLFxyXG4gICAgXCJsaWdodFNwZWVkT3V0XCIsXHJcbiAgICBcInJvdGF0ZU91dFwiLFxyXG4gICAgXCJyb3RhdGVPdXREb3duTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVPdXREb3duUmlnaHRcIixcclxuICAgIFwicm90YXRlT3V0VXBMZWZ0XCIsXHJcbiAgICBcInJvdGF0ZU91dFVwUmlnaHRcIixcclxuICAgIFwiaGluZ2VcIixcclxuICAgIFwicm9sbE91dFwiXHJcbiAgXTtcclxuICB2YXIgc3RUYWJsZTtcclxuICB2YXIgcGFyYWxheFRhYmxlO1xyXG5cclxuICBmdW5jdGlvbiBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWxzKSB7XHJcbiAgICBpZiAoZWxzLmxlbmd0aCA9PSAwKXJldHVybjtcclxuICAgIGVscy53cmFwKCc8ZGl2IGNsYXNzPVwic2VsZWN0X2ltZ1wiPicpO1xyXG4gICAgZWxzID0gZWxzLnBhcmVudCgpO1xyXG4gICAgZWxzLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmaWxlX2J1dHRvblwiPjxpIGNsYXNzPVwibWNlLWljbyBtY2UtaS1icm93c2VcIj48L2k+PC9idXR0b24+Jyk7XHJcbiAgICAvKmVscy5maW5kKCdidXR0b24nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcclxuICAgICAkKCcjcm94eUN1c3RvbVBhbmVsMicpLmFkZENsYXNzKCdvcGVuJylcclxuICAgICB9KTsqL1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gZWxzLmVxKGkpLmZpbmQoJ2lucHV0Jyk7XHJcbiAgICAgIGlmICghZWwuYXR0cignaWQnKSkge1xyXG4gICAgICAgIGVsLmF0dHIoJ2lkJywgJ2ZpbGVfJyArIGkgKyAnXycgKyBEYXRlLm5vdygpKVxyXG4gICAgICB9XHJcbiAgICAgIHZhciB0X2lkID0gZWwuYXR0cignaWQnKTtcclxuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLnJlZ2lzdGVyKHRfaWQsIGZ1bmN0aW9uIChmaWxlLCBpZCkge1xyXG4gICAgICAgIC8vJCh0aGlzKS52YWwoZmlsZS51cmwpLnRyaWdnZXIoJ2NoYW5nZScsIFtmaWxlLCBpZF0pO1xyXG4gICAgICAgICQoJyMnICsgaWQpLnZhbChmaWxlLnVybCkuY2hhbmdlKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZmlsZV9idXR0b24nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcykucHJldigpO1xyXG4gICAgICB2YXIgaWQgPSAkdGhpcy5hdHRyKCdpZCcpO1xyXG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIub3Blbk1hbmFnZXIoe1xyXG4gICAgICAgIFwidXJsXCI6IFwiL21hbmFnZXIvZWxmaW5kZXI/ZmlsdGVyPWltYWdlJmNhbGxiYWNrPVwiICsgaWQgKyBcIiZsYW5nPXJ1XCIsXHJcbiAgICAgICAgXCJ3aWR0aFwiOiBcImF1dG9cIixcclxuICAgICAgICBcImhlaWdodFwiOiBcImF1dG9cIixcclxuICAgICAgICBcImlkXCI6IGlkXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5JbnB1dChkYXRhKSB7XHJcbiAgICB2YXIgaW5wdXQgPSAnPGlucHV0IGNsYXNzPVwiJyArIChkYXRhLmlucHV0Q2xhc3MgfHwgJycpICsgJ1wiIHZhbHVlPVwiJyArIChkYXRhLnZhbHVlIHx8ICcnKSArICdcIj4nO1xyXG4gICAgaWYgKGRhdGEubGFiZWwpIHtcclxuICAgICAgaW5wdXQgPSAnPGxhYmVsPjxzcGFuPicgKyBkYXRhLmxhYmVsICsgJzwvc3Bhbj4nICsgaW5wdXQgKyAnPC9sYWJlbD4nO1xyXG4gICAgfVxyXG4gICAgaWYgKGRhdGEucGFyZW50KSB7XHJcbiAgICAgIGlucHV0ID0gJzwnICsgZGF0YS5wYXJlbnQgKyAnPicgKyBpbnB1dCArICc8LycgKyBkYXRhLnBhcmVudCArICc+JztcclxuICAgIH1cclxuICAgIGlucHV0ID0gJChpbnB1dCk7XHJcblxyXG4gICAgaWYgKGRhdGEub25DaGFuZ2UpIHtcclxuICAgICAgdmFyIG9uQ2hhbmdlO1xyXG4gICAgICBpZiAoZGF0YS5iaW5kKSB7XHJcbiAgICAgICAgZGF0YS5iaW5kLmlucHV0ID0gaW5wdXQuZmluZCgnaW5wdXQnKTtcclxuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChkYXRhLmJpbmQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGlucHV0LmZpbmQoJ2lucHV0JykpO1xyXG4gICAgICB9XHJcbiAgICAgIGlucHV0LmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIG9uQ2hhbmdlKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlucHV0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuU2VsZWN0KGRhdGEpIHtcclxuICAgIHZhciBpbnB1dCA9ICQoJzxzZWxlY3QvPicpO1xyXG5cclxuICAgIHZhciBlbCA9IHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdO1xyXG4gICAgaWYgKGRhdGEuaW5kZXggIT09IGZhbHNlKSB7XHJcbiAgICAgIGVsID0gZWxbZGF0YS5pbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVsW2RhdGEucGFyYW1dKSB7XHJcbiAgICAgIGRhdGEudmFsdWUgPSBlbFtkYXRhLnBhcmFtXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRhdGEudmFsdWUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkYXRhLnN0YXJ0X29wdGlvbikge1xyXG4gICAgICBpbnB1dC5hcHBlbmQoZGF0YS5zdGFydF9vcHRpb24pXHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHZhbDtcclxuICAgICAgdmFyIHR4dCA9IGRhdGEubGlzdFtpXTtcclxuICAgICAgaWYgKGRhdGEudmFsX3R5cGUgPT0gMCkge1xyXG4gICAgICAgIHZhbCA9IGRhdGEubGlzdFtpXTtcclxuICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbF90eXBlID09IDEpIHtcclxuICAgICAgICB2YWwgPSBpO1xyXG4gICAgICB9IGVsc2UgaWYgKGRhdGEudmFsX3R5cGUgPT0gMikge1xyXG4gICAgICAgIC8vdmFsPWRhdGEudmFsX2xpc3RbaV07XHJcbiAgICAgICAgdmFsID0gaTtcclxuICAgICAgICB0eHQgPSBkYXRhLnZhbF9saXN0W2ldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2VsID0gKHZhbCA9PSBkYXRhLnZhbHVlID8gJ3NlbGVjdGVkJyA6ICcnKTtcclxuICAgICAgaWYgKHNlbCA9PSAnc2VsZWN0ZWQnKSB7XHJcbiAgICAgICAgaW5wdXQuYXR0cigndF92YWwnLCBkYXRhLmxpc3RbaV0pO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBvcHRpb24gPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyB2YWwgKyAnXCIgJyArIHNlbCArICc+JyArIHR4dCArICc8L29wdGlvbj4nO1xyXG4gICAgICBpZiAoZGF0YS52YWxfdHlwZSA9PSAyKSB7XHJcbiAgICAgICAgb3B0aW9uID0gJChvcHRpb24pLmF0dHIoJ2NvZGUnLCBkYXRhLmxpc3RbaV0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlucHV0LmFwcGVuZChvcHRpb24pXHJcbiAgICB9XHJcblxyXG4gICAgaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgZGF0YSA9IHRoaXM7XHJcbiAgICAgIHZhciB2YWwgPSBkYXRhLmVsLnZhbCgpO1xyXG4gICAgICB2YXIgc2xfb3AgPSBkYXRhLmVsLmZpbmQoJ29wdGlvblt2YWx1ZT0nICsgdmFsICsgJ10nKTtcclxuICAgICAgdmFyIGNscyA9IHNsX29wLnRleHQoKTtcclxuICAgICAgdmFyIGNoID0gc2xfb3AuYXR0cignY29kZScpO1xyXG4gICAgICBpZiAoIWNoKWNoID0gY2xzO1xyXG4gICAgICBpZiAoZGF0YS5pbmRleCAhPT0gZmFsc2UpIHtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLmluZGV4XVtkYXRhLnBhcmFtXSA9IHZhbDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLnBhcmFtXSA9IHZhbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgZGF0YS5vYmoucmVtb3ZlQ2xhc3MoZGF0YS5wcmVmaXggKyBkYXRhLmVsLmF0dHIoJ3RfdmFsJykpO1xyXG4gICAgICBkYXRhLm9iai5hZGRDbGFzcyhkYXRhLnByZWZpeCArIGNoKTtcclxuICAgICAgZGF0YS5lbC5hdHRyKCd0X3ZhbCcsIGNoKTtcclxuXHJcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOiBpbnB1dCxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogZGF0YS5wYXJhbSxcclxuICAgICAgcHJlZml4OiBkYXRhLnByZWZpeCB8fCAnJ1xyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmIChkYXRhLnBhcmVudCkge1xyXG4gICAgICB2YXIgcGFyZW50ID0gJCgnPCcgKyBkYXRhLnBhcmVudCArICcvPicpO1xyXG4gICAgICBwYXJlbnQuYXBwZW5kKGlucHV0KTtcclxuICAgICAgcmV0dXJuIHBhcmVudDtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKGRhdGEpIHtcclxuICAgIHZhciBhbmltX3NlbCA9IFtdO1xyXG4gICAgdmFyIG91dDtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+U2hvdyBhbmltYXRpb248L3NwYW4+Jyk7XHJcbiAgICB9XHJcbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHNob3dfYW5pbWF0aW9ucyxcclxuICAgICAgdmFsX3R5cGU6IDAsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ICdzaG93X2FuaW1hdGlvbicsXHJcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcclxuICAgIH0pKTtcclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5TaG93IGRlbGF5PC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBzaG93X2RlbGF5LFxyXG4gICAgICB2YWxfdHlwZTogMSxcclxuICAgICAgb2JqOiBkYXRhLm9iaixcclxuICAgICAgZ3I6IGRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTogJ3Nob3dfZGVsYXknLFxyXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XHJcbiAgICB9KSk7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxici8+Jyk7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPkhpZGUgYW5pbWF0aW9uPC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OiBoaWRlX2FuaW1hdGlvbnMsXHJcbiAgICAgIHZhbF90eXBlOiAwLFxyXG4gICAgICBvYmo6IGRhdGEub2JqLFxyXG4gICAgICBncjogZGF0YS5ncixcclxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXHJcbiAgICAgIHBhcmFtOiAnaGlkZV9hbmltYXRpb24nLFxyXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XHJcbiAgICB9KSk7XHJcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+SGlkZSBkZWxheTwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogaGlkZV9kZWxheSxcclxuICAgICAgdmFsX3R5cGU6IDEsXHJcbiAgICAgIG9iajogZGF0YS5vYmosXHJcbiAgICAgIGdyOiBkYXRhLmdyLFxyXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ICdoaWRlX2RlbGF5JyxcclxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcclxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xyXG4gICAgICBvdXQgPSAkKCc8ZGl2IGNsYXNzPVwiYW5pbV9zZWxcIi8+Jyk7XHJcbiAgICAgIG91dC5hcHBlbmQoYW5pbV9zZWwpO1xyXG4gICAgfVxyXG4gICAgaWYgKGRhdGEudHlwZSA9PSAxKSB7XHJcbiAgICAgIG91dCA9IGFuaW1fc2VsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvdXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0X2VkaXRvcigpIHtcclxuICAgICQoJyN3MScpLnJlbW92ZSgpO1xyXG4gICAgJCgnI3cxX2J1dHRvbicpLnJlbW92ZSgpO1xyXG4gICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gc2xpZGVyX2RhdGFbMF0ubW9iaWxlLnNwbGl0KCc/JylbMF07XHJcblxyXG4gICAgdmFyIGVsID0gJCgnI21lZ2Ffc2xpZGVyX2NvbnRyb2xlJyk7XHJcbiAgICB2YXIgYnRuc19ib3ggPSAkKCc8ZGl2IGNsYXNzPVwiYnRuX2JveFwiLz4nKTtcclxuXHJcbiAgICBlbC5hcHBlbmQoJzxoMj7Qo9C/0YDQsNCy0LvQtdC90LjQtTwvaDI+Jyk7XHJcbiAgICBlbC5hcHBlbmQoJCgnPHRleHRhcmVhLz4nLCB7XHJcbiAgICAgIHRleHQ6IEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSxcclxuICAgICAgaWQ6ICdzbGlkZV9kYXRhJyxcclxuICAgICAgbmFtZTogZWRpdG9yXHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGJ0biA9ICQoJzxidXR0b24gY2xhc3M9XCJcIi8+JykudGV4dChcItCQ0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xyXG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XHJcbiAgICBidG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdoaWRlX3NsaWRlJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgYnRuID0gJCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JTQtdCw0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xyXG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XHJcbiAgICBidG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmFkZENsYXNzKCdoaWRlX3NsaWRlJyk7XHJcbiAgICB9KTtcclxuICAgIGVsLmFwcGVuZChidG5zX2JveCk7XHJcblxyXG4gICAgZWwuYXBwZW5kKCc8aDI+0J7QsdGJ0LjQtSDQv9Cw0YDQsNC80LXRgtGA0Ys8L2gyPicpO1xyXG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLm1vYmlsZSxcclxuICAgICAgbGFiZWw6IFwi0KHQu9Cw0LnQtCDQtNC70Y8g0YLQtdC70LXRhNC+0L3QsFwiLFxyXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9ICQodGhpcykudmFsKClcclxuICAgICAgICAkKCcubW9iX2JnJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgc2xpZGVyX2RhdGFbMF0ubW9iaWxlICsgJyknKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0uZm9uLFxyXG4gICAgICBsYWJlbDogXCLQntGB0L3QvtC90L7QuSDRhNC+0L1cIixcclxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5mb24gPSAkKHRoaXMpLnZhbCgpXHJcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIHNsaWRlcl9kYXRhWzBdLmZvbiArICcpJylcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgYnRuX2NoID0gJCgnPGRpdiBjbGFzcz1cImJ0bnNcIi8+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKCc8aDM+0JrQvdC+0L/QutCwINC/0LXRgNC10YXQvtC00LAo0LTQu9GPINCf0Jog0LLQtdGA0YHQuNC4KTwvaDM+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0LFxyXG4gICAgICBsYWJlbDogXCLQotC10LrRgdGCXCIsXHJcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS50ZXh0KHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0KTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH0sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGJ1dF9zbCA9ICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCk7XHJcbiAgICBidG5fY2guYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmLFxyXG4gICAgICBsYWJlbDogXCLQodGB0YvQu9C60LBcIixcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApLmF0dHIoJ2hyZWYnLHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH0sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgYnRuX2NoLmFwcGVuZCgnPGJyLz4nKTtcclxuICAgIHZhciB3cmFwX2xhYiA9ICQoJzxsYWJlbC8+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKHdyYXBfbGFiKTtcclxuICAgIHdyYXBfbGFiLmFwcGVuZCgnPHNwYW4+0J7RhNC+0YDQvNC70LXQvdC40LUg0LrQvdC+0L/QutC4PC9zcGFuPicpO1xyXG4gICAgd3JhcF9sYWIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IGJ0bl9zdHlsZSxcclxuICAgICAgdmFsX3R5cGU6IDAsXHJcbiAgICAgIG9iajogYnV0X3NsLFxyXG4gICAgICBncjogJ2J1dHRvbicsXHJcbiAgICAgIGluZGV4OiBmYWxzZSxcclxuICAgICAgcGFyYW06ICdjb2xvcidcclxuICAgIH0pKTtcclxuXHJcbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xyXG4gICAgd3JhcF9sYWIgPSAkKCc8bGFiZWwvPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZCh3cmFwX2xhYik7XHJcbiAgICB3cmFwX2xhYi5hcHBlbmQoJzxzcGFuPtCf0L7Qu9C+0LbQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XHJcbiAgICB3cmFwX2xhYi5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogcG9zQXJyLFxyXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXHJcbiAgICAgIHZhbF90eXBlOiAyLFxyXG4gICAgICBvYmo6IGJ1dF9zbC5wYXJlbnQoKS5wYXJlbnQoKSxcclxuICAgICAgZ3I6ICdidXR0b24nLFxyXG4gICAgICBpbmRleDogZmFsc2UsXHJcbiAgICAgIHBhcmFtOiAncG9zJ1xyXG4gICAgfSkpO1xyXG5cclxuICAgIGJ0bl9jaC5hcHBlbmQoZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoe1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICBvYmo6IGJ1dF9zbC5wYXJlbnQoKSxcclxuICAgICAgZ3I6ICdidXR0b24nLFxyXG4gICAgICBpbmRleDogZmFsc2VcclxuICAgIH0pKTtcclxuICAgIGVsLmFwcGVuZChidG5fY2gpO1xyXG5cclxuICAgIHZhciBsYXllciA9ICQoJzxkaXYgY2xhc3M9XCJmaXhlZF9sYXllclwiLz4nKTtcclxuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCh0YLQsNGC0LjRh9C10YHQutC40LUg0YHQu9C+0Lg8L2gyPicpO1xyXG4gICAgdmFyIHRoID0gXCI8dGg+4oSWPC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIiArXHJcbiAgICAgIFwiPHRoPtCh0LvQvtC5INC90LAg0LLRgdGOINCy0YvRgdC+0YLRgzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC/0L7Rj9Cy0LvQtdC90LjRjzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7Ql9Cw0LTQtdGA0LbQutCwINC/0L7Rj9Cy0LvQtdC90LjRjzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7Ql9Cw0LTQtdGA0LbQutCwINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QlNC10LnRgdGC0LLQuNC1PC90aD5cIjtcclxuICAgIHN0VGFibGUgPSAkKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nICsgdGggKyAnPC90cj48L3RhYmxlPicpO1xyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVswXS5maXhlZDtcclxuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhZGRUclN0YXRpYyhkYXRhW2ldKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGF5ZXIuYXBwZW5kKHN0VGFibGUpO1xyXG4gICAgdmFyIGFkZEJ0biA9ICQoJzxidXR0b24vPicsIHtcclxuICAgICAgdGV4dDogXCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcclxuICAgIH0pO1xyXG4gICAgYWRkQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZGF0YSA9IGFkZFRyU3RhdGljKGZhbHNlKTtcclxuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XHJcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xyXG5cclxuICAgIHZhciBsYXllciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGF4X2xheWVyXCIvPicpO1xyXG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0J/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuDwvaDI+Jyk7XHJcbiAgICB2YXIgdGggPSBcIjx0aD7ihJY8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0JrQsNGA0YLQuNC90LrQsDwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiICtcclxuICAgICAgXCI8dGg+0KPQtNCw0LvQtdC90L3QvtGB0YLRjCAo0YbQtdC70L7QtSDQv9C+0LvQvtC20LjRgtC10LvRjNC90L7QtSDRh9C40YHQu9C+KTwvdGg+XCIgK1xyXG4gICAgICBcIjx0aD7QlNC10LnRgdGC0LLQuNC1PC90aD5cIjtcclxuXHJcbiAgICBwYXJhbGF4VGFibGUgPSAkKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nICsgdGggKyAnPC90cj48L3RhYmxlPicpO1xyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVswXS5wYXJhbGF4O1xyXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFkZFRyUGFyYWxheChkYXRhW2ldKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGF5ZXIuYXBwZW5kKHBhcmFsYXhUYWJsZSk7XHJcbiAgICB2YXIgYWRkQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xyXG4gICAgICB0ZXh0OiBcItCU0L7QsdCw0LLQuNGC0Ywg0YHQu9C+0LlcIlxyXG4gICAgfSk7XHJcbiAgICBhZGRCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBkYXRhID0gYWRkVHJQYXJhbGF4KGZhbHNlKTtcclxuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG5cclxuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xyXG4gICAgZWwuYXBwZW5kKGxheWVyKTtcclxuXHJcbiAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWwuZmluZCgnLmZpbGVTZWxlY3QnKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRUclN0YXRpYyhkYXRhKSB7XHJcbiAgICB2YXIgaSA9IHN0VGFibGUuZmluZCgndHInKS5sZW5ndGggLSAxO1xyXG4gICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgXCJpbWdcIjogXCJcIixcclxuICAgICAgICBcImZ1bGxfaGVpZ2h0XCI6IDAsXHJcbiAgICAgICAgXCJwb3NcIjogMCxcclxuICAgICAgICBcInNob3dfZGVsYXlcIjogMSxcclxuICAgICAgICBcInNob3dfYW5pbWF0aW9uXCI6IFwibGlnaHRTcGVlZEluXCIsXHJcbiAgICAgICAgXCJoaWRlX2RlbGF5XCI6IDEsXHJcbiAgICAgICAgXCJoaWRlX2FuaW1hdGlvblwiOiBcImJvdW5jZU91dFwiXHJcbiAgICAgIH07XHJcbiAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkLnB1c2goZGF0YSk7XHJcbiAgICAgIHZhciBmaXggPSAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwJyk7XHJcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICA7XHJcblxyXG4gICAgdmFyIHRyID0gJCgnPHRyLz4nKTtcclxuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcclxuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBkYXRhLmltZyxcclxuICAgICAgbGFiZWw6IGZhbHNlLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBiaW5kOiB7XHJcbiAgICAgICAgZ3I6ICdmaXhlZCcsXHJcbiAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgcGFyYW06ICdpbWcnLFxyXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxyXG4gICAgICB9LFxyXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgICAgIGRhdGEub2JqLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW5wdXQudmFsKCkgKyAnKScpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkW2RhdGEuaW5kZXhdLmltZyA9IGRhdGEuaW5wdXQudmFsKCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogcG9zQXJyLFxyXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXHJcbiAgICAgIHZhbF90eXBlOiAyLFxyXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLFxyXG4gICAgICBncjogJ2ZpeGVkJyxcclxuICAgICAgaW5kZXg6IGksXHJcbiAgICAgIHBhcmFtOiAncG9zJyxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6IHllc19ub192YWwsXHJcbiAgICAgIHZhbF9saXN0OiB5ZXNfbm9fYXJyLFxyXG4gICAgICB2YWxfdHlwZTogMixcclxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKSxcclxuICAgICAgZ3I6ICdmaXhlZCcsXHJcbiAgICAgIGluZGV4OiBpLFxyXG4gICAgICBwYXJhbTogJ2Z1bGxfaGVpZ2h0JyxcclxuICAgICAgcGFyZW50OiAndGQnLFxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcclxuICAgICAgdHlwZTogMSxcclxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5maW5kKCcuYW5pbWF0aW9uX2xheWVyJyksXHJcbiAgICAgIGdyOiAnZml4ZWQnLFxyXG4gICAgICBpbmRleDogaSxcclxuICAgICAgcGFyZW50OiAndGQnXHJcbiAgICB9KSk7XHJcbiAgICB2YXIgZGVsQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xyXG4gICAgICB0ZXh0OiBcItCj0LTQsNC70LjRgtGMXCJcclxuICAgIH0pO1xyXG4gICAgZGVsQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzLmVsKTtcclxuICAgICAgaSA9ICR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKSAtIDE7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxyXG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxyXG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLmZpeGVkLnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOiBkZWxCdG4sXHJcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0blRkID0gJCgnPHRkLz4nKS5hcHBlbmQoZGVsQnRuKTtcclxuICAgIHRyLmFwcGVuZChkZWxCdG5UZCk7XHJcbiAgICBzdFRhYmxlLmFwcGVuZCh0cilcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlZGl0b3I6IHRyLFxyXG4gICAgICBkYXRhOiBkYXRhXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRUclBhcmFsYXgoZGF0YSkge1xyXG4gICAgdmFyIGkgPSBwYXJhbGF4VGFibGUuZmluZCgndHInKS5sZW5ndGggLSAxO1xyXG4gICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgXCJpbWdcIjogXCJcIixcclxuICAgICAgICBcInpcIjogMVxyXG4gICAgICB9O1xyXG4gICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4LnB1c2goZGF0YSk7XHJcbiAgICAgIHZhciBwYXJhbGF4X2dyID0gJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAnKTtcclxuICAgICAgYWRkUGFyYWxheExheWVyKGRhdGEsIHBhcmFsYXhfZ3IpO1xyXG4gICAgfVxyXG4gICAgO1xyXG4gICAgdmFyIHRyID0gJCgnPHRyLz4nKTtcclxuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcclxuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOiBkYXRhLmltZyxcclxuICAgICAgbGFiZWw6IGZhbHNlLFxyXG4gICAgICBwYXJlbnQ6ICd0ZCcsXHJcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBiaW5kOiB7XHJcbiAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgcGFyYW06ICdpbWcnLFxyXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLmZpbmQoJ3NwYW4nKSxcclxuICAgICAgfSxcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmlucHV0LnZhbCgpICsgJyknKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLmltZyA9IGRhdGEuaW5wdXQudmFsKCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDogcG9zQXJyLFxyXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXHJcbiAgICAgIHZhbF90eXBlOiAyLFxyXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXHJcbiAgICAgIGdyOiAncGFyYWxheCcsXHJcbiAgICAgIGluZGV4OiBpLFxyXG4gICAgICBwYXJhbTogJ3BvcycsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgICAgc3RhcnRfb3B0aW9uOiAnPG9wdGlvbiB2YWx1ZT1cIlwiIGNvZGU9XCJcIj7QvdCwINCy0LXRgdGMINGN0LrRgNCw0L08L29wdGlvbj4nXHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTogZGF0YS56LFxyXG4gICAgICBsYWJlbDogZmFsc2UsXHJcbiAgICAgIHBhcmVudDogJ3RkJyxcclxuICAgICAgYmluZDoge1xyXG4gICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcclxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKSxcclxuICAgICAgfSxcclxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgICAgICBkYXRhLm9iai5hdHRyKCd6JywgZGF0YS5pbnB1dC52YWwoKSk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS56ID0gZGF0YS5pbnB1dC52YWwoKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgZGVsQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xyXG4gICAgICB0ZXh0OiBcItCj0LTQsNC70LjRgtGMXCJcclxuICAgIH0pO1xyXG4gICAgZGVsQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzLmVsKTtcclxuICAgICAgaSA9ICR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKSAtIDE7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxyXG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxyXG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLnBhcmFsYXguc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXHJcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgfS5iaW5kKHtcclxuICAgICAgZWw6IGRlbEJ0bixcclxuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXHJcbiAgICB9KSk7XHJcbiAgICB2YXIgZGVsQnRuVGQgPSAkKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xyXG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcclxuICAgIHBhcmFsYXhUYWJsZS5hcHBlbmQodHIpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZWRpdG9yOiB0cixcclxuICAgICAgZGF0YTogZGF0YVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkX2FuaW1hdGlvbihlbCwgZGF0YSkge1xyXG4gICAgdmFyIG91dCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgJ2NsYXNzJzogJ2FuaW1hdGlvbl9sYXllcidcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICh0eXBlb2YoZGF0YS5zaG93X2RlbGF5KSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICBvdXQuYWRkQ2xhc3Moc2hvd19kZWxheVtkYXRhLnNob3dfZGVsYXldKTtcclxuICAgICAgaWYgKGRhdGEuc2hvd19hbmltYXRpb24pIHtcclxuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycgKyBkYXRhLnNob3dfYW5pbWF0aW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YoZGF0YS5oaWRlX2RlbGF5KSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICBvdXQuYWRkQ2xhc3MoaGlkZV9kZWxheVtkYXRhLmhpZGVfZGVsYXldKTtcclxuICAgICAgaWYgKGRhdGEuaGlkZV9hbmltYXRpb24pIHtcclxuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycgKyBkYXRhLmhpZGVfYW5pbWF0aW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGVsLmFwcGVuZChvdXQpO1xyXG4gICAgcmV0dXJuIGVsO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVfc2xpZGUoZGF0YSkge1xyXG4gICAgdmFyIHNsaWRlID0gJCgnPGRpdiBjbGFzcz1cInNsaWRlXCIvPicpO1xyXG5cclxuICAgIHZhciBtb2JfYmcgPSAkKCc8YSBjbGFzcz1cIm1vYl9iZ1wiIGhyZWY9XCInICsgZGF0YS5idXR0b24uaHJlZiArICdcIi8+Jyk7XHJcbiAgICBtb2JfYmcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5tb2JpbGUgKyAnKScpXHJcblxyXG4gICAgc2xpZGUuYXBwZW5kKG1vYl9iZyk7XHJcbiAgICBpZiAobW9iaWxlX21vZGUpIHtcclxuICAgICAgcmV0dXJuIHNsaWRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0YTQvtC9INGC0L4g0LfQsNC/0L7Qu9C90Y/QtdC8XHJcbiAgICBpZiAoZGF0YS5mb24pIHtcclxuICAgICAgc2xpZGUuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5mb24gKyAnKScpXHJcbiAgICB9XHJcblxyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgaWYgKGRhdGEucGFyYWxheCAmJiBkYXRhLnBhcmFsYXgubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fZ3JvdXBcIi8+Jyk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5wYXJhbGF4Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYWRkUGFyYWxheExheWVyKGRhdGEucGFyYWxheFtpXSwgcGFyYWxheF9ncilcclxuICAgICAgfVxyXG4gICAgICBzbGlkZS5hcHBlbmQocGFyYWxheF9ncilcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZml4ID0gJCgnPGRpdiBjbGFzcz1cImZpeGVkX2dyb3VwXCIvPicpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmZpeGVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEuZml4ZWRbaV0sIGZpeClcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XHJcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLmJ1dHRvbi5wb3NdKTtcclxuICAgIHZhciBidXQgPSAkKFwiPGEgY2xhc3M9J3NsaWRlcl9faHJlZicvPlwiKTtcclxuICAgIGJ1dC5hdHRyKCdocmVmJywgZGF0YS5idXR0b24uaHJlZik7XHJcbiAgICBidXQudGV4dChkYXRhLmJ1dHRvbi50ZXh0KTtcclxuICAgIGJ1dC5hZGRDbGFzcyhkYXRhLmJ1dHRvbi5jb2xvcik7XHJcbiAgICBkb3BfYmxrID0gYWRkX2FuaW1hdGlvbihkb3BfYmxrLCBkYXRhLmJ1dHRvbik7XHJcbiAgICBkb3BfYmxrLmZpbmQoJ2RpdicpLmFwcGVuZChidXQpO1xyXG4gICAgZml4LmFwcGVuZChkb3BfYmxrKTtcclxuXHJcbiAgICBzbGlkZS5hcHBlbmQoZml4KTtcclxuICAgIHJldHVybiBzbGlkZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKSB7XHJcbiAgICB2YXIgcGFyYWxsYXhfbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2xheWVyXCJcXD4nKTtcclxuICAgIHBhcmFsbGF4X2xheWVyLmF0dHIoJ3onLCBkYXRhLnogfHwgaSAqIDEwKTtcclxuICAgIHZhciBkb3BfYmxrID0gJChcIjxzcGFuIGNsYXNzPSdzbGlkZXJfX3RleHQnLz5cIik7XHJcbiAgICBpZiAoZGF0YS5wb3MpIHtcclxuICAgICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcclxuICAgIH1cclxuICAgIGRvcF9ibGsuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xyXG4gICAgcGFyYWxsYXhfbGF5ZXIuYXBwZW5kKGRvcF9ibGspO1xyXG4gICAgcGFyYWxheF9nci5hcHBlbmQocGFyYWxsYXhfbGF5ZXIpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkU3RhdGljTGF5ZXIoZGF0YSwgZml4LCBiZWZvcl9idXR0b24pIHtcclxuICAgIHZhciBkb3BfYmxrID0gJChcIjxkaXYgY2xhc3M9J2ZpeGVkX19sYXllcicvPlwiKTtcclxuICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XHJcbiAgICBpZiAoZGF0YS5mdWxsX2hlaWdodCkge1xyXG4gICAgICBkb3BfYmxrLmFkZENsYXNzKCdmaXhlZF9fZnVsbC1oZWlnaHQnKTtcclxuICAgIH1cclxuICAgIGRvcF9ibGsgPSBhZGRfYW5pbWF0aW9uKGRvcF9ibGssIGRhdGEpO1xyXG4gICAgZG9wX2Jsay5maW5kKCcuYW5pbWF0aW9uX2xheWVyJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xyXG5cclxuICAgIGlmIChiZWZvcl9idXR0b24pIHtcclxuICAgICAgZml4LmZpbmQoJy5zbGlkZXJfX2hyZWYnKS5jbG9zZXN0KCcuZml4ZWRfX2xheWVyJykuYmVmb3JlKGRvcF9ibGspXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmaXguYXBwZW5kKGRvcF9ibGspXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xyXG4gICAgaWYgKCQoJyNtZWdhX3NsaWRlcicpLmhhc0NsYXNzKCdzdG9wX3NsaWRlJykpcmV0dXJuO1xyXG5cclxuICAgIHZhciBzbGlkZV9wb2ludHMgPSAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVfc2VsZWN0JylcclxuICAgIHZhciBzbGlkZV9jbnQgPSBzbGlkZV9wb2ludHMubGVuZ3RoO1xyXG4gICAgdmFyIGFjdGl2ZSA9ICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykuaW5kZXgoKSArIDE7XHJcbiAgICBpZiAoYWN0aXZlID49IHNsaWRlX2NudClhY3RpdmUgPSAwO1xyXG4gICAgc2xpZGVfcG9pbnRzLmVxKGFjdGl2ZSkuY2xpY2soKTtcclxuXHJcbiAgICB0aW1lb3V0SWQ9c2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGltZ190b19sb2FkKHNyYykge1xyXG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xyXG4gICAgaW1nLm9uKCdsb2FkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB0b3RfaW1nX3dhaXQtLTtcclxuXHJcbiAgICAgIGlmICh0b3RfaW1nX3dhaXQgPT0gMCkge1xyXG5cclxuICAgICAgICBzbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dKSk7XHJcbiAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKHJlbmRlcl9zbGlkZV9ub20pLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgICAgICBpZiAocmVuZGVyX3NsaWRlX25vbSA9PSAwKSB7XHJcbiAgICAgICAgICBzbGlkZXMuZmluZCgnLnNsaWRlJylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93JylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICBpZiAoIWVkaXRvcikge1xyXG4gICAgICAgICAgICBpZih0aW1lb3V0SWQpY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgIHRpbWVvdXRJZD1zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5maXJzdF9zaG93JykucmVtb3ZlQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcclxuICAgICAgICAgICAgfS5iaW5kKHNsaWRlcyksIHNjcm9sbF9wZXJpb2QpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChtb2JpbGVfbW9kZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XHJcbiAgICAgICAgICAgIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICBwYXJhbGxheF90aW1lciA9IHNldEludGVydmFsKHJlbmRlciwgMTAwKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoZWRpdG9yKSB7XHJcbiAgICAgICAgICAgIGluaXRfZWRpdG9yKClcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKHRpbWVvdXRJZCljbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcclxuXHJcbiAgICAgICAgICAgICQoJy5zbGlkZV9zZWxlY3RfYm94Jykub24oJ2NsaWNrJywgJy5zbGlkZV9zZWxlY3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKSlyZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgIHZhciBpbmRleCA9ICR0aGlzLmluZGV4KCk7XHJcbiAgICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICR0aGlzLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGUuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgJChjb250YWluZXJfaWQgKyAnIC5zbGlkZScpLmVxKGluZGV4KS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5ob3ZlcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgaWYodGltZW91dElkKWNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xyXG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmFkZENsYXNzKCdzdG9wX3NsaWRlJyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xyXG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLnJlbW92ZUNsYXNzKCdzdG9wX3NsaWRlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVyX3NsaWRlX25vbSsrO1xyXG4gICAgICAgIGlmIChyZW5kZXJfc2xpZGVfbm9tIDwgc2xpZGVyX2RhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgICBsb2FkX3NsaWRlX2ltZygpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KS5vbignZXJyb3InLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xyXG4gICAgfSk7XHJcbiAgICBpbWcucHJvcCgnc3JjJywgc3JjKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGxvYWRfc2xpZGVfaW1nKCkge1xyXG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVtyZW5kZXJfc2xpZGVfbm9tXTtcclxuICAgIHRvdF9pbWdfd2FpdCA9IDE7XHJcblxyXG4gICAgaWYgKG1vYmlsZV9tb2RlID09PSBmYWxzZSkge1xyXG4gICAgICB0b3RfaW1nX3dhaXQrKztcclxuICAgICAgaW1nX3RvX2xvYWQoZGF0YS5mb24pO1xyXG4gICAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XHJcbiAgICAgIGlmIChkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0b3RfaW1nX3dhaXQgKz0gZGF0YS5wYXJhbGF4Lmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGFyYWxheC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5wYXJhbGF4W2ldLmltZylcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRhdGEuZml4ZWQgJiYgZGF0YS5maXhlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEuZml4ZWQubGVuZ3RoO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5maXhlZFtpXS5pbWcpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW1nX3RvX2xvYWQoZGF0YS5tb2JpbGUpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3RhcnRfaW5pdF9zbGlkZShkYXRhKSB7XHJcbiAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xyXG4gICAgaW1nLmF0dHIoJ3RpbWUnLCBuKTtcclxuXHJcbiAgICBmdW5jdGlvbiBvbl9pbWdfbG9hZCgpIHtcclxuICAgICAgdmFyIG4gPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgaW1nID0gJCh0aGlzKTtcclxuICAgICAgbiA9IG4gLSBwYXJzZUludChpbWcuYXR0cigndGltZScpKTtcclxuICAgICAgaWYgKG4gPiBtYXhfdGltZV9sb2FkX3BpYykge1xyXG4gICAgICAgIG1vYmlsZV9tb2RlID0gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgbWF4X3NpemUgPSAoc2NyZWVuLmhlaWdodCA+IHNjcmVlbi53aWR0aCA/IHNjcmVlbi5oZWlnaHQgOiBzY3JlZW4ud2lkdGgpO1xyXG4gICAgICAgIGlmIChtYXhfc2l6ZSA8IG1vYmlsZV9zaXplKSB7XHJcbiAgICAgICAgICBtb2JpbGVfbW9kZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vYmlsZV9tb2RlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChtb2JpbGVfbW9kZSA9PSB0cnVlKSB7XHJcbiAgICAgICAgJChjb250YWluZXJfaWQpLmFkZENsYXNzKCdtb2JpbGVfbW9kZScpXHJcbiAgICAgIH1cclxuICAgICAgcmVuZGVyX3NsaWRlX25vbSA9IDA7XHJcbiAgICAgIGxvYWRfc2xpZGVfaW1nKCk7XHJcbiAgICAgICQoJy5zay1mb2xkaW5nLWN1YmUnKS5yZW1vdmUoKTtcclxuICAgIH07XHJcblxyXG4gICAgaW1nLm9uKCdsb2FkJywgb25faW1nX2xvYWQoKSk7XHJcbiAgICBpZiAoc2xpZGVyX2RhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnP3I9JyArIE1hdGgucmFuZG9tKCk7XHJcbiAgICAgIGltZy5wcm9wKCdzcmMnLCBzbGlkZXJfZGF0YVswXS5tb2JpbGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb25faW1nX2xvYWQoKS5iaW5kKGltZyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0KGRhdGEsIGVkaXRvcl9pbml0KSB7XHJcbiAgICBzbGlkZXJfZGF0YSA9IGRhdGE7XHJcbiAgICBlZGl0b3IgPSBlZGl0b3JfaW5pdDtcclxuICAgIC8v0L3QsNGF0L7QtNC40Lwg0LrQvtC90YLQtdC50L3QtdGAINC4INC+0YfQuNGJ0LDQtdC8INC10LPQvlxyXG4gICAgdmFyIGNvbnRhaW5lciA9ICQoY29udGFpbmVyX2lkKTtcclxuICAgIGNvbnRhaW5lci5odG1sKCcnKTtcclxuXHJcbiAgICAvL9GB0L7Qt9C20LDQtdC8INCx0LDQt9C+0LLRi9C1INC60L7QvdGC0LXQudC90LXRgNGLINC00LvRjyDRgdCw0LzQuNGFINGB0LvQsNC50LTQvtCyINC4INC00LvRjyDQv9C10YDQtdC60LvRjtGH0LDRgtC10LvQtdC5XHJcbiAgICBzbGlkZXMgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICdjbGFzcyc6ICdzbGlkZXMnXHJcbiAgICB9KTtcclxuICAgIHZhciBzbGlkZV9jb250cm9sID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAnY2xhc3MnOiAnc2xpZGVfY29udHJvbCdcclxuICAgIH0pO1xyXG4gICAgc2xpZGVfc2VsZWN0X2JveCA9ICQoJzx1bC8+Jywge1xyXG4gICAgICAnY2xhc3MnOiAnc2xpZGVfc2VsZWN0X2JveCdcclxuICAgIH0pO1xyXG5cclxuICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INC40L3QtNC40LrQsNGC0L7RgCDQt9Cw0LPRgNGD0LfQutC4XHJcbiAgICB2YXIgbCA9ICc8ZGl2IGNsYXNzPVwic2stZm9sZGluZy1jdWJlXCI+JyArXHJcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTEgc2stY3ViZVwiPjwvZGl2PicgK1xyXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUyIHNrLWN1YmVcIj48L2Rpdj4nICtcclxuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlNCBzay1jdWJlXCI+PC9kaXY+JyArXHJcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTMgc2stY3ViZVwiPjwvZGl2PicgK1xyXG4gICAgICAnPC9kaXY+JztcclxuICAgIGNvbnRhaW5lci5odG1sKGwpO1xyXG5cclxuXHJcbiAgICBzdGFydF9pbml0X3NsaWRlKGRhdGFbMF0pO1xyXG5cclxuICAgIC8v0LPQtdC90LXRgNC40YDRg9C10Lwg0LrQvdC+0L/QutC4INC4INGB0LvQsNC50LTRi1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIC8vc2xpZGVzLmFwcGVuZChnZW5lcmF0ZV9zbGlkZShkYXRhW2ldKSk7XHJcbiAgICAgIHNsaWRlX3NlbGVjdF9ib3guYXBwZW5kKCc8bGkgY2xhc3M9XCJzbGlkZV9zZWxlY3QgZGlzYWJsZWRcIi8+JylcclxuICAgIH1cclxuXHJcbiAgICAvKnNsaWRlcy5maW5kKCcuc2xpZGUnKS5lcSgwKVxyXG4gICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpXHJcbiAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93Jyk7XHJcbiAgICAgc2xpZGVfY29udHJvbC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7Ki9cclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlcyk7XHJcbiAgICBzbGlkZV9jb250cm9sLmFwcGVuZChzbGlkZV9zZWxlY3RfYm94KTtcclxuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVfY29udHJvbCk7XHJcblxyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICAgIGlmICghcGFyYWxsYXhfZ3JvdXApcmV0dXJuIGZhbHNlO1xyXG4gICAgdmFyIHBhcmFsbGF4X2sgPSAocGFyYWxsYXhfY291bnRlciAtIDEwKSAvIDI7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbGxheF9ncm91cC5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgZWwgPSBwYXJhbGxheF9ncm91cC5lcShpKTtcclxuICAgICAgdmFyIGogPSBlbC5hdHRyKCd6Jyk7XHJcbiAgICAgIHZhciB0ciA9ICdyb3RhdGUzZCgwLjEsMC44LDAsJyArIChwYXJhbGxheF9rKSArICdkZWcpIHNjYWxlKCcgKyAoMSArIGogKiAwLjUpICsgJykgdHJhbnNsYXRlWigtJyArICgxMCArIGogKiAyMCkgKyAncHgpJztcclxuICAgICAgZWwuY3NzKCd0cmFuc2Zvcm0nLCB0cilcclxuICAgIH1cclxuICAgIHBhcmFsbGF4X2NvdW50ZXIgKz0gcGFyYWxsYXhfZCAqIDAuMTtcclxuICAgIGlmIChwYXJhbGxheF9jb3VudGVyID49IDIwKXBhcmFsbGF4X2QgPSAtcGFyYWxsYXhfZDtcclxuICAgIGlmIChwYXJhbGxheF9jb3VudGVyIDw9IDApcGFyYWxsYXhfZCA9IC1wYXJhbGxheF9kO1xyXG4gIH1cclxuXHJcbiAgaW5pdEltYWdlU2VydmVyU2VsZWN0KCQoJy5maWxlU2VsZWN0JykpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgaW5pdDogaW5pdFxyXG4gIH07XHJcbn0oKSk7XHJcbiIsInZhciBoZWFkZXJBY3Rpb25zID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxuICB2YXIgc2hhZG93ZWREb3duID0gZmFsc2U7XHJcblxyXG4gICQoJy5tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgJCgnLmhlYWRlcicpLnRvZ2dsZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAkKCcuZHJvcC1tZW51JykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICBpZiAoJCgnLmhlYWRlcicpLmhhc0NsYXNzKCdoZWFkZXJfb3Blbi1tZW51JykpIHtcclxuICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcclxuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdub19zY3JvbGwnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5zZWFyY2gtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcclxuICAgICQoJy5hY2NvdW50LW1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgJCgnI2F1dG9jb21wbGV0ZScpLmZhZGVPdXQoKTtcclxuICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpKSB7XHJcbiAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcjaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmIChlLnRhcmdldC5pZCA9PSAnaGVhZGVyJykge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcuaGVhZGVyLXNlYXJjaF9mb3JtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJ2Zvcm0nKS5zdWJtaXQoKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmhlYWRlci1zZWNvbmRsaW5lX2Nsb3NlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItdXBsaW5lJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoIXNjcm9sbGVkRG93bilyZXR1cm47XHJcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCAxMDI0KSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgICQoJy5oZWFkZXItc2Vjb25kbGluZScpLnJlbW92ZUNsYXNzKCdzY3JvbGwtZG93bicpO1xyXG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcclxuICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG4gIH0pO1xyXG5cclxuICAkKHdpbmRvdykub24oJ2xvYWQgcmVzaXplIHNjcm9sbCcsIGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBzaGFkb3dIZWlnaHQgPSA1MDtcclxuICAgIHZhciBoaWRlSGVpZ2h0ID0gMjAwO1xyXG4gICAgdmFyIGhlYWRlclNlY29uZExpbmUgPSAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKTtcclxuICAgIHZhciBob3ZlcnMgPSBoZWFkZXJTZWNvbmRMaW5lLmZpbmQoJzpob3ZlcicpO1xyXG4gICAgdmFyIGhlYWRlciA9ICQoJy5oZWFkZXInKTtcclxuXHJcbiAgICBpZiAoIWhvdmVycy5sZW5ndGgpIHtcclxuICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgICBoZWFkZXIucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgICAgLy9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXHJcbiAgICAgIHZhciBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XHJcbiAgICAgIGlmIChzY3JvbGxUb3AgPiBzaGFkb3dIZWlnaHQgJiYgc2hhZG93ZWREb3duID09PSBmYWxzZSkge1xyXG4gICAgICAgIHNoYWRvd2VkRG93biA9IHRydWU7XHJcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2hhZG93ZWQnKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoc2Nyb2xsVG9wIDw9IHNoYWRvd0hlaWdodCAmJiBzaGFkb3dlZERvd24gPT09IHRydWUpIHtcclxuICAgICAgICBzaGFkb3dlZERvd24gPSBmYWxzZTtcclxuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzaGFkb3dlZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzY3JvbGxUb3AgPiBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gZmFsc2UpIHtcclxuICAgICAgICBzY3JvbGxlZERvd24gPSB0cnVlO1xyXG4gICAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNjcm9sbFRvcCA8PSBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgICAgaGVhZGVyLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5tZW51X2FuZ2xlLWRvd24sIC5kcm9wLW1lbnVfZ3JvdXBfX3VwLWhlYWRlcicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgbWVudU9wZW4gPSAkKHRoaXMpLmNsb3Nlc3QoJy5oZWFkZXJfb3Blbi1tZW51LCAuY2F0YWxvZy1jYXRlZ29yaWVzJyk7XHJcbiAgICBpZiAoIW1lbnVPcGVuLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBwYXJlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnVfZ3JvdXBfX3VwLCAubWVudS1ncm91cCcpO1xyXG4gICAgdmFyIHBhcmVudE1lbnUgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnUnKTtcclxuICAgIGlmIChwYXJlbnRNZW51KSB7XHJcbiAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgfVxyXG4gICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgJChwYXJlbnQpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgIGlmIChwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAgICQocGFyZW50KS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuY2hpbGRyZW4oJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmFkZENsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuY2hpbGRyZW4oJ2xpJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuXHJcbiAgdmFyIGFjY291bnRNZW51VGltZU91dCA9IG51bGw7XHJcbiAgdmFyIGFjY291bnRNZW51T3BlblRpbWUgPSAwO1xyXG4gIHZhciBhY2NvdW50TWVudSA9ICQoJy5hY2NvdW50LW1lbnUnKTtcclxuXHJcbiAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gMTAyNCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcclxuICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcclxuXHJcbiAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XHJcblxyXG4gICAgaWYgKGFjY291bnRNZW51Lmhhc0NsYXNzKCdoaWRkZW4nKSkge1xyXG4gICAgICBtZW51QWNjb3VudFVwKHRoYXQpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoYXQucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgYWNjb3VudE1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvL9C/0L7QutCw0Lcg0LzQtdC90Y4g0LDQutC60LDRg9C90YJcclxuICBmdW5jdGlvbiBtZW51QWNjb3VudFVwKHRvZ2dsZUJ1dHRvbikge1xyXG4gICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xyXG4gICAgdG9nZ2xlQnV0dG9uLmFkZENsYXNzKCdvcGVuJyk7XHJcbiAgICBhY2NvdW50TWVudS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gMTAyNCkge1xyXG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgYWNjb3VudE1lbnVPcGVuVGltZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBhY2NvdW50TWVudVRpbWVPdXQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gMTAyNCkge1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoKG5ldyBEYXRlKCkgLSBhY2NvdW50TWVudU9wZW5UaW1lKSA+IDEwMDAgKiA3KSB7XHJcbiAgICAgICAgYWNjb3VudE1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIHRvZ2dsZUJ1dHRvbi5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcclxuICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LCAxMDAwKTtcclxuICB9XHJcblxyXG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXMtYWNjb3VudF9tZW51LWhlYWRlcicpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBhY2NvdW50TWVudU9wZW5UaW1lID0gbmV3IERhdGUoKTtcclxuICB9KTtcclxuICAkKCcuYWNjb3VudC1tZW51JykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICgkKGUudGFyZ2V0KS5oYXNDbGFzcygnYWNjb3VudC1tZW51JykpIHtcclxuICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0oKTtcclxuIiwiJChmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gcGFyc2VOdW0oc3RyKSB7XHJcbiAgICByZXR1cm4gcGFyc2VGbG9hdChcclxuICAgICAgU3RyaW5nKHN0cilcclxuICAgICAgICAucmVwbGFjZSgnLCcsICcuJylcclxuICAgICAgICAubWF0Y2goLy0/XFxkKyg/OlxcLlxcZCspPy9nLCAnJykgfHwgMFxyXG4gICAgICAsIDEwXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgJCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKS5maW5kKCdzZWxlY3QsaW5wdXQnKS5vbignY2hhbmdlIGtleXVwIGNsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKS5jbG9zZXN0KCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpO1xyXG4gICAgdmFyIGN1cnMgPSBwYXJzZU51bSgkdGhpcy5maW5kKCdzZWxlY3QnKS52YWwoKSk7XHJcbiAgICB2YXIgdmFsID0gJHRoaXMuZmluZCgnaW5wdXQnKS52YWwoKTtcclxuICAgIGlmIChwYXJzZU51bSh2YWwpICE9IHZhbCkge1xyXG4gICAgICB2YWwgPSAkdGhpcy5maW5kKCdpbnB1dCcpLnZhbChwYXJzZU51bSh2YWwpKTtcclxuICAgIH1cclxuICAgIHZhbCA9IHBhcnNlTnVtKHZhbCk7XHJcblxyXG4gICAgdmFyIGtvZWYgPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2snKS50cmltKCk7XHJcbiAgICB2YXIgcHJvbW8gPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2stcHJvbW8nKS50cmltKCk7XHJcbiAgICB2YXIgY3VycmVuY3kgPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2stY3VycmVuY3knKS50cmltKCk7XHJcbiAgICB2YXIgcmVzdWx0ID0gMDtcclxuICAgIHZhciBvdXQgPSAwO1xyXG5cclxuICAgIGlmIChrb2VmID09IHByb21vKSB7XHJcbiAgICAgIHByb21vID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoa29lZi5pbmRleE9mKCclJykgPiAwKSB7XHJcbiAgICAgIHJlc3VsdCA9IHBhcnNlTnVtKGtvZWYpICogdmFsICogY3VycyAvIDEwMDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGN1cnMgPSBwYXJzZU51bSgkdGhpcy5maW5kKCdbY29kZT0nICsgY3VycmVuY3kgKyAnXScpLnZhbCgpKTtcclxuICAgICAgcmVzdWx0ID0gcGFyc2VOdW0oa29lZikgKiBjdXJzXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHBhcnNlTnVtKHByb21vKSA+IDApIHtcclxuICAgICAgaWYgKHByb21vLmluZGV4T2YoJyUnKSA+IDApIHtcclxuICAgICAgICBwcm9tbyA9IHBhcnNlTnVtKHByb21vKSAqIHZhbCAqIGN1cnMgLyAxMDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcHJvbW8gPSBwYXJzZU51bShwcm9tbykgKiBjdXJzXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChwcm9tbyA+IDApIHtcclxuICAgICAgICBvdXQgPSBcIjxzcGFuIGNsYXNzPW9sZF9wcmljZT5cIiArIHJlc3VsdC50b0ZpeGVkKDIpICsgXCI8L3NwYW4+IFwiICsgcHJvbW8udG9GaXhlZCgyKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvdXQgPSByZXN1bHQudG9GaXhlZCgyKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3V0ID0gcmVzdWx0LnRvRml4ZWQoMik7XHJcbiAgICB9XHJcblxyXG5cclxuICAgICR0aGlzLmZpbmQoJy5jYWxjLXJlc3VsdF92YWx1ZScpLmh0bWwob3V0KVxyXG4gIH0pLmNsaWNrKClcclxufSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIGVscyA9ICQoJy5hdXRvX2hpZGVfY29udHJvbCcpO1xyXG4gIGlmIChlbHMubGVuZ3RoID09IDApcmV0dXJuO1xyXG5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBcIi5zY3JvbGxfYm94LXNob3dfbW9yZVwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgIGJ1dHRvblllczogZmFsc2UsXHJcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfd2hpdGUgbm90aWZ5X25vdF9iaWdcIlxyXG4gICAgfTtcclxuXHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICB2YXIgY29udGVudCA9ICR0aGlzLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0nKS5jbG9uZSgpO1xyXG4gICAgY29udGVudCA9IGNvbnRlbnRbMF07XHJcbiAgICBjb250ZW50LmNsYXNzTmFtZSArPSAnIHNjcm9sbF9ib3gtaXRlbS1tb2RhbCc7XHJcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBkaXYuY2xhc3NOYW1lID0gJ2NvbW1lbnRzJztcclxuICAgIGRpdi5hcHBlbmQoY29udGVudCk7XHJcbiAgICAkKGRpdikuZmluZCgnLnNjcm9sbF9ib3gtc2hvd19tb3JlJykucmVtb3ZlKCk7XHJcbiAgICAkKGRpdikuZmluZCgnLm1heF90ZXh0X2hpZGUnKVxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUteDInKVxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUnKTtcclxuICAgIGRhdGEucXVlc3Rpb24gPSBkaXYub3V0ZXJIVE1MO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gaGFzU2Nyb2xsKGVsKSB7XHJcbiAgICBpZiAoIWVsKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBlbC5zY3JvbGxIZWlnaHQgPiBlbC5jbGllbnRIZWlnaHQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZWJ1aWxkKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGVsID0gZWxzLmVxKGkpO1xyXG4gICAgICB2YXIgaXNfaGlkZSA9IGZhbHNlO1xyXG4gICAgICBpZiAoZWwuaGVpZ2h0KCkgPCAxMCkge1xyXG4gICAgICAgIGlzX2hpZGUgPSB0cnVlO1xyXG4gICAgICAgIGVsLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0taGlkZScpLnNob3coMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciB0ZXh0ID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtdGV4dCcpO1xyXG4gICAgICB2YXIgYW5zd2VyID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtYW5zd2VyJyk7XHJcbiAgICAgIHZhciBzaG93X21vcmUgPSBlbC5maW5kKCcuc2Nyb2xsX2JveC1zaG93X21vcmUnKTtcclxuXHJcbiAgICAgIHZhciBzaG93X2J0biA9IGZhbHNlO1xyXG4gICAgICBpZiAoaGFzU2Nyb2xsKHRleHRbMF0pKSB7XHJcbiAgICAgICAgc2hvd19idG4gPSB0cnVlO1xyXG4gICAgICAgIHRleHQucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRleHQuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYW5zd2VyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAvL9C10YHRgtGMINC+0YLQstC10YIg0LDQtNC80LjQvdCwXHJcbiAgICAgICAgaWYgKGhhc1Njcm9sbChhbnN3ZXJbMF0pKSB7XHJcbiAgICAgICAgICBzaG93X2J0biA9IHRydWU7XHJcbiAgICAgICAgICBhbnN3ZXIucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBhbnN3ZXIuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNob3dfYnRuKSB7XHJcbiAgICAgICAgc2hvd19tb3JlLnNob3coKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzaG93X21vcmUuaGlkZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaXNfaGlkZSkge1xyXG4gICAgICAgIGVsLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0taGlkZScpLmhpZGUoMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gICQod2luZG93KS5yZXNpemUocmVidWlsZCk7XHJcbiAgcmVidWlsZCgpO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnNob3dfYWxsJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBjbHMgPSAkKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XHJcbiAgICAkKCcuaGlkZV9hbGxbZGF0YS1jbnRybC1jbGFzc10nKS5zaG93KCk7XHJcbiAgICAkKHRoaXMpLmhpZGUoKTtcclxuICAgICQoJy4nICsgY2xzKS5zaG93KCk7XHJcbiAgfSk7XHJcblxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmhpZGVfYWxsJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBjbHMgPSAkKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XHJcbiAgICAkKCcuc2hvd19hbGxbZGF0YS1jbnRybC1jbGFzc10nKS5zaG93KCk7XHJcbiAgICAkKHRoaXMpLmhpZGUoKTtcclxuICAgICQoJy4nICsgY2xzKS5oaWRlKCk7XHJcbiAgfSk7XHJcbn0pKCk7XHJcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBkZWNsT2ZOdW0obnVtYmVyLCB0aXRsZXMpIHtcclxuICAgIGNhc2VzID0gWzIsIDAsIDEsIDEsIDEsIDJdO1xyXG4gICAgcmV0dXJuIHRpdGxlc1sobnVtYmVyICUgMTAwID4gNCAmJiBudW1iZXIgJSAxMDAgPCAyMCkgPyAyIDogY2FzZXNbKG51bWJlciAlIDEwIDwgNSkgPyBudW1iZXIgJSAxMCA6IDVdXTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpcnN0WmVybyh2KSB7XHJcbiAgICB2ID0gTWF0aC5mbG9vcih2KTtcclxuICAgIGlmICh2IDwgMTApXHJcbiAgICAgIHJldHVybiAnMCcgKyB2O1xyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gdjtcclxuICB9XHJcblxyXG4gIHZhciBjbG9ja3MgPSAkKCcuY2xvY2snKTtcclxuICBpZiAoY2xvY2tzLmxlbmd0aCA+IDApIHtcclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUNsb2NrKCkge1xyXG4gICAgICB2YXIgY2xvY2tzID0gJCh0aGlzKTtcclxuICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xvY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGMgPSBjbG9ja3MuZXEoaSk7XHJcbiAgICAgICAgdmFyIGVuZCA9IG5ldyBEYXRlKGMuZGF0YSgnZW5kJykucmVwbGFjZSgvLS9nLCBcIi9cIikpO1xyXG4gICAgICAgIHZhciBkID0gKGVuZC5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XHJcblxyXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0L/RgNC+0YjQtdC7XHJcbiAgICAgICAgaWYgKGQgPD0gMCkge1xyXG4gICAgICAgICAgYy50ZXh0KGxnKFwicHJvbW9jb2RlX2V4cGlyZXNcIikpO1xyXG4gICAgICAgICAgYy5hZGRDbGFzcygnY2xvY2stZXhwaXJlZCcpO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL9C10YHQu9C4INGB0YDQvtC6INCx0L7Qu9C10LUgMzAg0LTQvdC10LlcclxuICAgICAgICBpZiAoZCA+IDMwICogNjAgKiA2MCAqIDI0KSB7XHJcbiAgICAgICAgICBjLmh0bWwobGcoIFwicHJvbW9jb2RlX2xlZnRfMzBfZGF5c1wiKSk7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzID0gZCAlIDYwO1xyXG4gICAgICAgIGQgPSAoZCAtIHMpIC8gNjA7XHJcbiAgICAgICAgdmFyIG0gPSBkICUgNjA7XHJcbiAgICAgICAgZCA9IChkIC0gbSkgLyA2MDtcclxuICAgICAgICB2YXIgaCA9IGQgJSAyNDtcclxuICAgICAgICBkID0gKGQgLSBoKSAvIDI0O1xyXG5cclxuICAgICAgICB2YXIgc3RyID0gZmlyc3RaZXJvKGgpICsgXCI6XCIgKyBmaXJzdFplcm8obSkgKyBcIjpcIiArIGZpcnN0WmVybyhzKTtcclxuICAgICAgICBpZiAoZCA+IDApIHtcclxuICAgICAgICAgIHN0ciA9IGQgKyBcIiBcIiArIGRlY2xPZk51bShkLCBbbGcoXCJkYXlfY2FzZV8wXCIpLCBsZyhcImRheV9jYXNlXzFcIiksIGxnKFwiZGF5X2Nhc2VfMlwiKV0pICsgXCIgIFwiICsgc3RyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjLmh0bWwoXCLQntGB0YLQsNC70L7RgdGMOiA8c3Bhbj5cIiArIHN0ciArIFwiPC9zcGFuPlwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldEludGVydmFsKHVwZGF0ZUNsb2NrLmJpbmQoY2xvY2tzKSwgMTAwMCk7XHJcbiAgICB1cGRhdGVDbG9jay5iaW5kKGNsb2NrcykoKTtcclxuICB9XHJcbn0pO1xyXG4iLCJ2YXIgY2F0YWxvZ1R5cGVTd2l0Y2hlciA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgY2F0YWxvZyA9ICQoJy5jYXRhbG9nX2xpc3QnKTtcclxuICBpZiAoY2F0YWxvZy5sZW5ndGggPT0gMClyZXR1cm47XHJcblxyXG4gICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKHRoaXMpLnBhcmVudCgpLnNpYmxpbmdzKCkuZmluZCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICAgICQodGhpcykuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICAgIGlmIChjYXRhbG9nKSB7XHJcbiAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdjYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLWxpc3QnKSkge1xyXG4gICAgICAgIGNhdGFsb2cucmVtb3ZlQ2xhc3MoJ25hcnJvdycpO1xyXG4gICAgICAgIHNldENvb2tpZSgnY291cG9uc192aWV3JywgJycpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2NhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbmFycm93JykpIHtcclxuICAgICAgICBjYXRhbG9nLmFkZENsYXNzKCduYXJyb3cnKTtcclxuICAgICAgICBzZXRDb29raWUoJ2NvdXBvbnNfdmlldycsICduYXJyb3cnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBpZiAoZ2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnKSA9PSAnbmFycm93JyAmJiAhY2F0YWxvZy5oYXNDbGFzcygnbmFycm93X29mZicpKSB7XHJcbiAgICBjYXRhbG9nLmFkZENsYXNzKCduYXJyb3cnKTtcclxuICAgICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLW5hcnJvdycpLmFkZENsYXNzKCdjaGVja2VkJyk7XHJcbiAgICAkKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykucmVtb3ZlQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICB9XHJcbn0oKTtcclxuIiwiJChmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLnNkLXNlbGVjdC1zZWxlY3RlZCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA8IDc2OCkge1xyXG4gICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIC8vdmFyIHBhcmVudCA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAgICAgLy92YXIgZHJvcEJsb2NrID0gJChwYXJlbnQpLmZpbmQoJy5zZC1zZWxlY3QtZHJvcCcpO1xyXG5cclxuICAgICAgICAvLyBpZiAoZHJvcEJsb2NrLmlzKCc6aGlkZGVuJykpIHtcclxuICAgICAgICAvLyAgICAgZHJvcEJsb2NrLnNsaWRlRG93bigpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgIGlmICghcGFyZW50Lmhhc0NsYXNzKCdsaW5rZWQnKSkge1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgICAgICAkKCcuc2Qtc2VsZWN0LWRyb3AnKS5maW5kKCdhJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAvLyAgICAgICAgICAgICB2YXIgc2VsZWN0UmVzdWx0ID0gJCh0aGlzKS5odG1sKCk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgICAgICAgICAgICAkKHBhcmVudCkuZmluZCgnaW5wdXQnKS52YWwoc2VsZWN0UmVzdWx0KTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICQocGFyZW50KS5maW5kKCcuc2Qtc2VsZWN0LXNlbGVjdGVkJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLmh0bWwoc2VsZWN0UmVzdWx0KTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XHJcbiAgICAgICAgLy8gICAgICAgICB9KTtcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gfSBlbHNlIHtcclxuICAgICAgICAvLyAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgLy8gICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG4gICAgLy9yZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcblxyXG59KTtcclxuIiwic2VhcmNoID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBvcGVuQXV0b2NvbXBsZXRlO1xyXG5cclxuICAkKCcuc2VhcmNoLWZvcm0taW5wdXQnKS5vbignaW5wdXQnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHF1ZXJ5ID0gJHRoaXMudmFsKCk7XHJcbiAgICB2YXIgZGF0YSA9ICR0aGlzLmNsb3Nlc3QoJ2Zvcm0nKS5zZXJpYWxpemUoKTtcclxuICAgIHZhciBhdXRvY29tcGxldGUgPSAkdGhpcy5jbG9zZXN0KCcuc3RvcmVzX3NlYXJjaCcpLmZpbmQoJy5hdXRvY29tcGxldGUtd3JhcCcpOy8vICQoJyNhdXRvY29tcGxldGUnKSxcclxuICAgIHZhciBhdXRvY29tcGxldGVMaXN0ID0gJChhdXRvY29tcGxldGUpLmZpbmQoJ3VsJyk7XHJcbiAgICBvcGVuQXV0b2NvbXBsZXRlID0gYXV0b2NvbXBsZXRlO1xyXG4gICAgaWYgKHF1ZXJ5Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgdXJsID0gJHRoaXMuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicpIHx8ICcvc2VhcmNoJztcclxuICAgICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICB0eXBlOiAnZ2V0JyxcclxuICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgIGlmIChkYXRhLnN1Z2dlc3Rpb25zKSB7XHJcbiAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3VnZ2VzdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWYobGFuZ1tcImhyZWZfcHJlZml4XCJdLmxlbmd0aD4wICYmIGl0ZW0uZGF0YS5yb3V0ZS5pbmRleE9mKGxhbmdbXCJocmVmX3ByZWZpeFwiXSk9PS0xKXtcclxuICAgICAgICAgICAgICAgICAgaXRlbS5kYXRhLnJvdXRlPScvJytsYW5nW1wiaHJlZl9wcmVmaXhcIl0raXRlbS5kYXRhLnJvdXRlO1xyXG4gICAgICAgICAgICAgICAgICBpdGVtLmRhdGEucm91dGU9aXRlbS5kYXRhLnJvdXRlLnJlcGxhY2UoJy8vJywnLycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSAnPGEgY2xhc3M9XCJhdXRvY29tcGxldGVfbGlua1wiIGhyZWY9XCInICsgaXRlbS5kYXRhLnJvdXRlICsgJ1wiJyArICc+JyArIGl0ZW0udmFsdWUgKyBpdGVtLmNhc2hiYWNrICsgJzwvYT4nO1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgICAgICAgICAgICAgIGxpLmlubmVySFRNTCA9IGh0bWw7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmFwcGVuZChsaSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVJbigpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZSkuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgJChhdXRvY29tcGxldGVMaXN0KS5odG1sKCcnKTtcclxuICAgICAgICAkKGF1dG9jb21wbGV0ZSkuZmFkZU91dCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSkub24oJ2ZvY3Vzb3V0JywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICghJChlLnJlbGF0ZWRUYXJnZXQpLmhhc0NsYXNzKCdhdXRvY29tcGxldGVfbGluaycpKSB7XHJcbiAgICAgIC8vJCgnI2F1dG9jb21wbGV0ZScpLmhpZGUoKTtcclxuICAgICAgJChvcGVuQXV0b2NvbXBsZXRlKS5kZWxheSgxMDApLnNsaWRlVXAoMTAwKVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCdib2R5Jykub24oJ3N1Ym1pdCcsICcuc3RvcmVzLXNlYXJjaF9mb3JtJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciB2YWwgPSAkKHRoaXMpLmZpbmQoJy5zZWFyY2gtZm9ybS1pbnB1dCcpLnZhbCgpO1xyXG4gICAgaWYgKHZhbC5sZW5ndGggPCAyKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJCgnLmZvcm0tcG9wdXAtc2VsZWN0IGxpJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuXHJcbiAgICB2YXIgaGlkZGVuID0gJCh0aGlzKS5kYXRhKCdpZDInKTtcclxuICAgICQoJyMnK2hpZGRlbikuYXR0cigndmFsdWUnLCAkKHRoaXMpLmRhdGEoJ3ZhbHVlMicpKTtcclxuICAgIHZhciB0ZXh0ID0gJCh0aGlzKS5kYXRhKCdpZDEnKTtcclxuICAgICQoJyMnK3RleHQpLmh0bWwoJCh0aGlzKS5kYXRhKCd2YWx1ZTEnKSk7XHJcbiAgICB2YXIgc2VhcmNodGV4dCA9ICQodGhpcykuZGF0YSgnaWQzJyk7XHJcbiAgICAkKCcjJytzZWFyY2h0ZXh0KS5hdHRyKCdwbGFjZWhvbGRlcicsICQodGhpcykuZGF0YSgndmFsdWUzJykpO1xyXG4gICAgdmFyIGxpbWl0ID0gJCh0aGlzKS5kYXRhKCdpZDQnKTtcclxuICAgICQoJyMnK2xpbWl0KS5hdHRyKCd2YWx1ZScsICQodGhpcykuZGF0YSgndmFsdWU0JykpO1xyXG5cclxuICAgIHZhciBhY3Rpb24gPSAkKHRoaXMpLmRhdGEoJ2FjdGlvbicpO1xyXG5cclxuICAgICQodGhpcykuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicsIGFjdGlvbik7XHJcblxyXG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuaGVhZGVyLXNlYXJjaF9mb3JtLWdyb3VwJykuZmluZCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dC1tb2R1bGUtbGFiZWwnKS5hZGRDbGFzcygnY2xvc2UnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0taW5wdXQtbW9kdWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICQodGhpcykuY2xvc2VzdCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dC1tb2R1bGUtbGFiZWwnKS50b2dnbGVDbGFzcygnYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgfSk7XHJcblxyXG4gICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0taW5wdXQtbW9kdWxlLWxhYmVsJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICB9KTtcclxuXHJcbn0oKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgJCgnLmNvdXBvbnMtbGlzdF9pdGVtLWNvbnRlbnQtZ290by1wcm9tb2NvZGUtbGluaycpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgdGhhdCA9ICQodGhpcyk7XHJcbiAgICB2YXIgZXhwaXJlZCA9IHRoYXQuY2xvc2VzdCgnLmNvdXBvbnMtbGlzdF9pdGVtJykuZmluZCgnLmNsb2NrLWV4cGlyZWQnKTtcclxuICAgIHZhciB1c2VySWQgPSAkKHRoYXQpLmRhdGEoJ3VzZXInKTtcclxuICAgIHZhciBpbmFjdGl2ZSA9ICQodGhhdCkuZGF0YSgnaW5hY3RpdmUnKTtcclxuICAgIHZhciBkYXRhX21lc3NhZ2UgPSAkKHRoYXQpLmRhdGEoJ21lc3NhZ2UnKTtcclxuXHJcbiAgICBpZiAoaW5hY3RpdmUpIHtcclxuICAgICAgdmFyIHRpdGxlID0gZGF0YV9tZXNzYWdlID8gZGF0YV9tZXNzYWdlIDogbGcoXCJwcm9tb2NvZGVfaXNfaW5hY3RpdmVcIik7XHJcbiAgICAgIHZhciBtZXNzYWdlID0gbGcoXCJwcm9tb2NvZGVfdmlld19hbGxcIix7XCJ1cmxcIjpcIi9cIitsYW5nW1wiaHJlZl9wcmVmaXhcIl0rXCJjb3Vwb25zXCJ9KTtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcclxuICAgICAgICAndGl0bGUnOiB0aXRsZSxcclxuICAgICAgICAncXVlc3Rpb24nOiBtZXNzYWdlLFxyXG4gICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxyXG4gICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxyXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiAnbm90aWZ5X2JveC1hbGVydCdcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSBpZiAoZXhwaXJlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciB0aXRsZSA9IGxnKFwicHJvbW9jb2RlX2lzX2V4cGlyZXNcIik7XHJcbiAgICAgIHZhciBtZXNzYWdlID0gbGcoXCJwcm9tb2NvZGVfdmlld19hbGxcIix7XCJ1cmxcIjpcIi9cIitsYW5nW1wiaHJlZl9wcmVmaXhcIl0rXCJjb3Vwb25zXCJ9KTtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcclxuICAgICAgICAndGl0bGUnOiB0aXRsZSxcclxuICAgICAgICAncXVlc3Rpb24nOiBtZXNzYWdlLFxyXG4gICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxyXG4gICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxyXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiAnbm90aWZ5X2JveC1hbGVydCdcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSBpZiAoIXVzZXJJZCkge1xyXG4gICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAnYnV0dG9uWWVzJzogZmFsc2UsXHJcbiAgICAgICAgJ25vdHlmeV9jbGFzcyc6IFwibm90aWZ5X2JveC1hbGVydFwiLFxyXG4gICAgICAgICd0aXRsZSc6IGxnKFwidXNlX3Byb21vY29kZVwiKSxcclxuICAgICAgICAncXVlc3Rpb24nOiAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtY291cG9uLW5vcmVnaXN0ZXJcIj4nICtcclxuICAgICAgICAnPGltZyBzcmM9XCIvaW1hZ2VzL3RlbXBsYXRlcy9zd2EucG5nXCIgYWx0PVwiXCI+JyArXHJcbiAgICAgICAgJzxwPjxiPicrbGcoXCJwcm9tb2NvZGVfdXNlX3dpdGhvdXRfY2FzaGJhY2tfb3JfcmVnaXN0ZXJcIikrJzwvYj48L3A+JyArXHJcbiAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveC1idXR0b25zXCI+JyArXHJcbiAgICAgICAgJzxhIGhyZWY9XCInICsgdGhhdC5hdHRyKCdocmVmJykgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJidG4gbm90aWZpY2F0aW9uLWNsb3NlXCI+JytsZyhcInVzZV9wcm9tb2NvZGVcIikrJzwvYT4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIiMnK2xhbmdbXCJocmVmX3ByZWZpeFwiXSsncmVnaXN0cmF0aW9uXCIgY2xhc3M9XCJidG4gYnRuLXRyYW5zZm9ybSBtb2RhbHNfb3BlblwiPicrbGcoXCJyZWdpc3RlclwiKSsnPC9hPicgK1xyXG4gICAgICAgICc8L2Rpdj4nXHJcbiAgICAgIH07XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkKCcjc2hvcF9oZWFkZXItZ290by1jaGVja2JveCcpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcbiAgICAgaWYgKCEkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpKSB7XHJcbiAgICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XHJcbiAgICAgICAgICAgICAndGl0bGUnOiBsZyhcImF0dGVudGlvbnNcIiksXHJcbiAgICAgICAgICAgICAncXVlc3Rpb24nOiBsZyhcInByb21vY29kZV9yZWNvbW1lbmRhdGlvbnNcIiksXHJcbiAgICAgICAgICAgICAnYnV0dG9uWWVzJzogbGcoXCJjbG9zZVwiKSxcclxuICAgICAgICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xyXG4gICAgICAgICB9KTtcclxuICAgICB9XHJcbiAgfSk7XHJcblxyXG4gICQoJy5jYXRhbG9nX3Byb2R1Y3RfbGluaycpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcclxuICAgICAgICAnYnV0dG9uWWVzJzogZmFsc2UsXHJcbiAgICAgICAgICAgICdub3R5ZnlfY2xhc3MnOiBcIm5vdGlmeV9ib3gtYWxlcnRcIixcclxuICAgICAgICAgICAgJ3RpdGxlJzogbGcoXCJwcm9kdWN0X3VzZVwiKSxcclxuICAgICAgICAgICAgJ3F1ZXN0aW9uJzogJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWNvdXBvbi1ub3JlZ2lzdGVyXCI+JyArXHJcbiAgICAgICAgJzxpbWcgc3JjPVwiL2ltYWdlcy90ZW1wbGF0ZXMvc3dhLnBuZ1wiIGFsdD1cIlwiPicgK1xyXG4gICAgICAgICc8cD48Yj4nK2xnKFwicHJvZHVjdF91c2Vfd2l0aG91dF9jYXNoYmFja19vcl9yZWdpc3RlclwiKSsnPC9iPjwvcD4nICtcclxuICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWJ1dHRvbnNcIj4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIicgKyB0aGF0LmF0dHIoJ2hyZWYnKSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImJ0biBub3RpZmljYXRpb24tY2xvc2VcIj4nK2xnKFwicHJvZHVjdF91c2VcIikrJzwvYT4nICtcclxuICAgICAgICAnPGEgaHJlZj1cIiNyZWdpc3RyYXRpb25cIiBjbGFzcz1cImJ0biBidG4tdHJhbnNmb3JtIG1vZGFsc19vcGVuXCI+JytsZyhcInJlZ2lzdGVyXCIpKyc8L2E+JyArXHJcbiAgICAgICAgJzwvZGl2Pid9XHJcbiAgICAgICAgKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuYWNjb3VudC13aXRoZHJhdy1tZXRob2RzX2l0ZW0tb3B0aW9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBvcHRpb24gPSAkKHRoaXMpLmRhdGEoJ29wdGlvbi1wcm9jZXNzJyksXHJcbiAgICAgIHBsYWNlaG9sZGVyID0gJyc7XHJcbiAgICBzd2l0Y2ggKG9wdGlvbikge1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X2Nhc2hfbnVtYmVyXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19yX251bWJlclwiKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfcGhvbmVfbnVtYmVyXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSA0OlxyXG4gICAgICAgIHBsYWNlaG9sZGVyID0gbGcoXCJ3aXRoZHJhd19jYXJ0X251bWJlclwiKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgNTpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfZW1haWxcIik7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDY6XHJcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBsZyhcIndpdGhkcmF3X3Bob25lX251bWJlclwiKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgNzpcclxuICAgICAgICBwbGFjZWhvbGRlciA9IGxnKFwid2l0aGRyYXdfc2tyaWxsXCIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICQoXCIjdXNlcnN3aXRoZHJhdy1iaWxsXCIpLnByZXYoXCIucGxhY2Vob2xkZXJcIikuaHRtbChwbGFjZWhvbGRlcik7XHJcbiAgICAkKCcjdXNlcnN3aXRoZHJhdy1wcm9jZXNzX2lkJykudmFsKG9wdGlvbik7XHJcbiAgfSk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgYWpheEZvcm0oJCgnLmFqYXhfZm9ybScpKTtcclxuXHJcbiAgJCgnLmZvcm0tdGVzdC1saW5rJykub24oJ3N1Ym1pdCcsZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgZm9ybSA9ICQoJy5mb3JtLXRlc3QtbGluaycpO1xyXG4gICAgaWYoZm9ybS5oYXNDbGFzcygnbG9hZGluZycpKXJldHVybjtcclxuICAgIGZvcm0uZmluZCgnLmhlbHAtYmxvY2snKS5odG1sKFwiXCIpO1xyXG5cclxuICAgIHZhciB1cmwgPSBmb3JtLmZpbmQoJ1tuYW1lPXVybF0nKS52YWwoKTtcclxuICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xyXG5cclxuICAgIGlmKHVybC5sZW5ndGg8Myl7XHJcbiAgICAgIGZvcm0uZmluZCgnLmhlbHAtYmxvY2snKS5odG1sKGxnKCdyZXF1aXJlZCcpKTtcclxuICAgICAgZm9ybS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1lbHNle1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICBmb3JtLmZpbmQoJ2lucHV0JykuYXR0cignZGlzYWJsZWQnLHRydWUpO1xyXG4gICAgJC5wb3N0KGZvcm0uYXR0cignYWN0aW9uJykse3VybDp1cmx9LGZ1bmN0aW9uKGQpe1xyXG4gICAgICBmb3JtLmZpbmQoJ2lucHV0JykuYXR0cignZGlzYWJsZWQnLGZhbHNlKTtcclxuICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICBmb3JtLmZpbmQoJy5oZWxwLWJsb2NrJykuaHRtbChkKTtcclxuICAgIH0pO1xyXG4gIH0pXHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLmRvYnJvLWZ1bmRzX2l0ZW0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICQoJyNkb2Jyby1zZW5kLWZvcm0tY2hhcml0eS1wcm9jZXNzJykudmFsKCQodGhpcykuZGF0YSgnaWQnKSk7XHJcbiAgfSk7XHJcblxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdCcpLmFkZENsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtb3BlbicpO1xyXG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLmFkZENsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUtb3BlbicpO1xyXG4gIH0pO1xyXG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtY2xvc2UnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xyXG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdCcpLnJlbW92ZUNsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtb3BlbicpO1xyXG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUtb3BlbicpO1xyXG4gIH0pO1xyXG59KSgpO1xyXG4iLCIvL3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKSB7XHJcbmZ1bmN0aW9uIHNoYXJlNDIoKXtcclxuICBlPWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXJlNDJpbml0Jyk7XHJcbiAgZm9yICh2YXIgayA9IDA7IGsgPCBlLmxlbmd0aDsgaysrKSB7XHJcbiAgICB2YXIgdSA9IFwiXCI7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29jaWFscycpICE9IC0xKVxyXG4gICAgICB2YXIgc29jaWFscyA9IEpTT04ucGFyc2UoJ1snK2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNvY2lhbHMnKSsnXScpO1xyXG4gICAgdmFyIGljb25fdHlwZT1lW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXR5cGUnKSAhPSAtMT9lW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXR5cGUnKTonJztcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKSAhPSAtMSlcclxuICAgICAgdSA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXVybCcpO1xyXG4gICAgdmFyIHByb21vID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvbW8nKTtcclxuICAgIGlmKHByb21vICYmIHByb21vLmxlbmd0aD4wKSB7XHJcbiAgICAgIHZhciBrZXkgPSAncHJvbW89JyxcclxuICAgICAgICBwcm9tb1N0YXJ0ID0gdS5pbmRleE9mKGtleSksXHJcbiAgICAgICAgcHJvbW9FbmQgPSB1LmluZGV4T2YoJyYnLCBwcm9tb1N0YXJ0KSxcclxuICAgICAgICBwcm9tb0xlbmd0aCA9IHByb21vRW5kID4gcHJvbW9TdGFydCA/IHByb21vRW5kIC0gcHJvbW9TdGFydCAtIGtleS5sZW5ndGggOiB1Lmxlbmd0aCAtIHByb21vU3RhcnQgLSBrZXkubGVuZ3RoO1xyXG4gICAgICBpZihwcm9tb1N0YXJ0ID4gMCkge1xyXG4gICAgICAgIHByb21vID0gdS5zdWJzdHIocHJvbW9TdGFydCArIGtleS5sZW5ndGgsIHByb21vTGVuZ3RoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdmFyIHNlbGZfcHJvbW8gPSAocHJvbW8gJiYgcHJvbW8ubGVuZ3RoID4gMCk/IFwic2V0VGltZW91dChmdW5jdGlvbigpe3NlbmRfcHJvbW8oJ1wiK3Byb21vK1wiJyk7fSwyMDAwKTtcIiA6IFwiXCI7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi1zaXplJykgIT0gLTEpXHJcbiAgICAgIHZhciBpY29uX3NpemUgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXNpemUnKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpICE9IC0xKVxyXG4gICAgICB2YXIgdCA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJyk7XHJcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1hZ2UnKSAhPSAtMSlcclxuICAgICAgdmFyIGkgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pbWFnZScpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWRlc2NyaXB0aW9uJykgIT0gLTEpXHJcbiAgICAgIHZhciBkID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzY3JpcHRpb24nKTtcclxuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wYXRoJykgIT0gLTEpXHJcbiAgICAgIHZhciBmID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF0aCcpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb25zLWZpbGUnKSAhPSAtMSlcclxuICAgICAgdmFyIGZuID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbnMtZmlsZScpO1xyXG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNjcmlwdC1hZnRlcicpKSB7XHJcbiAgICAgIHNlbGZfcHJvbW8gKz0gXCJzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XCIrZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2NyaXB0LWFmdGVyJykrXCJ9LDMwMDApO1wiO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZikge1xyXG4gICAgICBmdW5jdGlvbiBwYXRoKG5hbWUpIHtcclxuICAgICAgICB2YXIgc2MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylcclxuICAgICAgICAgICwgc3IgPSBuZXcgUmVnRXhwKCdeKC4qL3wpKCcgKyBuYW1lICsgJykoWyM/XXwkKScpO1xyXG4gICAgICAgIGZvciAodmFyIHAgPSAwLCBzY0wgPSBzYy5sZW5ndGg7IHAgPCBzY0w7IHArKykge1xyXG4gICAgICAgICAgdmFyIG0gPSBTdHJpbmcoc2NbcF0uc3JjKS5tYXRjaChzcik7XHJcbiAgICAgICAgICBpZiAobSkge1xyXG4gICAgICAgICAgICBpZiAobVsxXS5tYXRjaCgvXigoaHR0cHM/fGZpbGUpXFw6XFwvezIsfXxcXHc6W1xcL1xcXFxdKS8pKVxyXG4gICAgICAgICAgICAgIHJldHVybiBtWzFdO1xyXG4gICAgICAgICAgICBpZiAobVsxXS5pbmRleE9mKFwiL1wiKSA9PSAwKVxyXG4gICAgICAgICAgICAgIHJldHVybiBtWzFdO1xyXG4gICAgICAgICAgICBiID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2Jhc2UnKTtcclxuICAgICAgICAgICAgaWYgKGJbMF0gJiYgYlswXS5ocmVmKVxyXG4gICAgICAgICAgICAgIHJldHVybiBiWzBdLmhyZWYgKyBtWzFdO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC8oLipbXFwvXFxcXF0pLylbMF0gKyBtWzFdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBmID0gcGF0aCgnc2hhcmU0Mi5qcycpO1xyXG4gICAgfVxyXG4gICAgaWYgKCF1KVxyXG4gICAgICB1ID0gbG9jYXRpb24uaHJlZjtcclxuICAgIGlmICghdClcclxuICAgICAgdCA9IGRvY3VtZW50LnRpdGxlO1xyXG4gICAgaWYgKCFmbilcclxuICAgICAgZm4gPSAnaWNvbnMucG5nJztcclxuICAgIGZ1bmN0aW9uIGRlc2MoKSB7XHJcbiAgICAgIHZhciBtZXRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ldGEnKTtcclxuICAgICAgZm9yICh2YXIgbSA9IDA7IG0gPCBtZXRhLmxlbmd0aDsgbSsrKSB7XHJcbiAgICAgICAgaWYgKG1ldGFbbV0ubmFtZS50b0xvd2VyQ2FzZSgpID09ICdkZXNjcmlwdGlvbicpIHtcclxuICAgICAgICAgIHJldHVybiBtZXRhW21dLmNvbnRlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuICAgIGlmICghZClcclxuICAgICAgZCA9IGRlc2MoKTtcclxuICAgIHUgPSBlbmNvZGVVUklDb21wb25lbnQodSk7XHJcbiAgICB0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHQpO1xyXG4gICAgdCA9IHQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcclxuICAgIGkgPSBlbmNvZGVVUklDb21wb25lbnQoaSk7XHJcbiAgICB2YXIgZF9vcmlnPWQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcclxuICAgIGQgPSBlbmNvZGVVUklDb21wb25lbnQoZCk7XHJcbiAgICBkID0gZC5yZXBsYWNlKC9cXCcvZywgJyUyNycpO1xyXG4gICAgdmFyIGZiUXVlcnkgPSAndT0nICsgdTtcclxuICAgIGlmIChpICE9ICdudWxsJyAmJiBpICE9ICcnKVxyXG4gICAgICBmYlF1ZXJ5ID0gJ3M9MTAwJnBbdXJsXT0nICsgdSArICcmcFt0aXRsZV09JyArIHQgKyAnJnBbc3VtbWFyeV09JyArIGQgKyAnJnBbaW1hZ2VzXVswXT0nICsgaTtcclxuICAgIHZhciB2a0ltYWdlID0gJyc7XHJcbiAgICBpZiAoaSAhPSAnbnVsbCcgJiYgaSAhPSAnJylcclxuICAgICAgdmtJbWFnZSA9ICcmaW1hZ2U9JyArIGk7XHJcbiAgICB2YXIgcyA9IG5ldyBBcnJheShcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJmYlwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PScgKyB1ICsnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBGYWNlYm9va1wiJyxcclxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJ2a1wiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vdmsuY29tL3NoYXJlLnBocD91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgdmtJbWFnZSArICcmZGVzY3JpcHRpb249JyArIGQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQkiDQmtC+0L3RgtCw0LrRgtC1XCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cIm9ka2xcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL2Nvbm5lY3Qub2sucnUvb2ZmZXI/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICcmZGVzY3JpcHRpb249JysgZCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIg0J7QtNC90L7QutC70LDRgdGB0L3QuNC60LhcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidHdpXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD0nICsgdCArICcmdXJsPScgKyB1ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiBUd2l0dGVyXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cImdwbHVzXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9wbHVzLmdvb2dsZS5jb20vc2hhcmU/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIEdvb2dsZStcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwibWFpbFwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vY29ubmVjdC5tYWlsLnJ1L3NoYXJlP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnJmRlc2NyaXB0aW9uPScgKyBkICsgJyZpbWFnZXVybD0nICsgaSArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyINCc0L7QtdC8INCc0LjRgNC1QE1haWwuUnVcIicsXHJcbiAgICAgICdcIi8vd3d3LmxpdmVqb3VybmFsLmNvbS91cGRhdGUuYm1sP2V2ZW50PScgKyB1ICsgJyZzdWJqZWN0PScgKyB0ICsgJ1wiIHRpdGxlPVwi0J7Qv9GD0LHQu9C40LrQvtCy0LDRgtGMINCyIExpdmVKb3VybmFsXCInLFxyXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInBpblwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vcGludGVyZXN0LmNvbS9waW4vY3JlYXRlL2J1dHRvbi8/dXJsPScgKyB1ICsgJyZtZWRpYT0nICsgaSArICcmZGVzY3JpcHRpb249JyArIHQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTYwMCwgaGVpZ2h0PTMwMCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQlNC+0LHQsNCy0LjRgtGMINCyIFBpbnRlcmVzdFwiJyxcclxuICAgICAgJ1wiXCIgb25jbGljaz1cInJldHVybiBmYXYodGhpcyk7XCIgdGl0bGU9XCLQodC+0YXRgNCw0L3QuNGC0Ywg0LIg0LjQt9Cx0YDQsNC90L3QvtC1INCx0YDQsNGD0LfQtdGA0LBcIicsXHJcbiAgICAgICdcIiNcIiBvbmNsaWNrPVwicHJpbnQoKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCg0LDRgdC/0LXRh9Cw0YLQsNGC0YxcIicsXHJcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidGVsZWdyYW1cIiBvbmNsaWNrPVwid2luZG93Lm9wZW4oXFwnLy90ZWxlZ3JhbS5tZS9zaGFyZS91cmw/dXJsPScgKyB1ICsnJnRleHQ9JyArIHQgKyAnXFwnLCBcXCd0ZWxlZ3JhbVxcJywgXFwnd2lkdGg9NTUwLGhlaWdodD00NDAsbGVmdD0xMDAsdG9wPTEwMFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBUZWxlZ3JhbVwiJyxcclxuICAgICAgJ1widmliZXI6Ly9mb3J3YXJkP3RleHQ9JysgdSArJyAtICcgKyB0ICsgJ1wiIGRhdGEtY291bnQ9XCJ2aWJlclwiIHJlbD1cIm5vZm9sbG93IG5vb3BlbmVyXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBWaWJlclwiJyxcclxuICAgICAgJ1wid2hhdHNhcHA6Ly9zZW5kP3RleHQ9JysgdSArJyAtICcgKyB0ICsgJ1wiIGRhdGEtY291bnQ9XCJ3aGF0c2FwcFwiIHJlbD1cIm5vZm9sbG93IG5vb3BlbmVyXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBXaGF0c0FwcFwiJ1xyXG5cclxuICAgICk7XHJcblxyXG4gICAgdmFyIGwgPSAnJztcclxuXHJcbiAgICBpZihzb2NpYWxzLmxlbmd0aD4xKXtcclxuICAgICAgZm9yIChxID0gMDsgcSA8IHNvY2lhbHMubGVuZ3RoOyBxKyspe1xyXG4gICAgICAgIGo9c29jaWFsc1txXTtcclxuICAgICAgICBsICs9ICc8YSByZWw9XCJub2ZvbGxvd1wiIGhyZWY9JyArIHNbal0gKyAnIHRhcmdldD1cIl9ibGFua1wiICcrZ2V0SWNvbihzW2pdLGosaWNvbl90eXBlLGYsZm4saWNvbl9zaXplKSsnPjwvYT4nO1xyXG4gICAgICB9XHJcbiAgICB9ZWxzZXtcclxuICAgICAgZm9yIChqID0gMDsgaiA8IHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBsICs9ICc8YSByZWw9XCJub2ZvbGxvd1wiIGhyZWY9JyArIHNbal0gKyAnIHRhcmdldD1cIl9ibGFua1wiICcrZ2V0SWNvbihzW2pdLGosaWNvbl90eXBlLGYsZm4saWNvbl9zaXplKSsnPjwvYT4nO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlW2tdLmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cInNoYXJlNDJfd3JhcFwiPicgKyBsICsgJzwvc3Bhbj4nO1xyXG4gIH1cclxuICBcclxuLy99LCBmYWxzZSk7XHJcbn1cclxuXHJcbnNoYXJlNDIoKTtcclxuXHJcbmZ1bmN0aW9uIGdldEljb24ocyxqLHQsZixmbixzaXplKSB7XHJcbiAgaWYoIXNpemUpe1xyXG4gICAgc2l6ZT0zMjtcclxuICB9XHJcbiAgaWYodD09J2Nzcycpe1xyXG4gICAgaj1zLmluZGV4T2YoJ2RhdGEtY291bnQ9XCInKSsxMjtcclxuICAgIHZhciBsPXMuaW5kZXhPZignXCInLGopLWo7XHJcbiAgICB2YXIgbDI9cy5pbmRleE9mKCcuJyxqKS1qO1xyXG4gICAgbD1sPmwyICYmIGwyPjAgP2wyOmw7XHJcbiAgICAvL3ZhciBpY29uPSdjbGFzcz1cInNvYy1pY29uIGljb24tJytzLnN1YnN0cihqLGwpKydcIic7XHJcbiAgICB2YXIgaWNvbj0nY2xhc3M9XCJzb2MtaWNvbi1zZCBpY29uLXNkLScrcy5zdWJzdHIoaixsKSsnXCInO1xyXG4gIH1lbHNlIGlmKHQ9PSdzdmcnKXtcclxuICAgIHZhciBzdmc9W1xyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMTEuOTQsMTc3LjA4KVwiIGQ9XCJNMCAwIDAgNzAuMyAyMy42IDcwLjMgMjcuMSA5Ny43IDAgOTcuNyAwIDExNS4yQzAgMTIzLjIgMi4yIDEyOC42IDEzLjYgMTI4LjZMMjguMSAxMjguNiAyOC4xIDE1My4xQzI1LjYgMTUzLjQgMTcgMTU0LjIgNi45IDE1NC4yLTE0IDE1NC4yLTI4LjMgMTQxLjQtMjguMyAxMTcuOUwtMjguMyA5Ny43LTUyIDk3LjctNTIgNzAuMy0yOC4zIDcwLjMtMjguMyAwIDAgMFpcIi8+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsOTguMjc0LDE0NS41MilcIiBkPVwiTTAgMCA5LjYgMEM5LjYgMCAxMi41IDAuMyAxNCAxLjkgMTUuNCAzLjQgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMSAxOSAyMS4xIDIxIDI3IDIyLjggMzQuNiA4LjUgNDIuNyAzIDQ4LjctMS4yIDUzLjMtMC4zIDUzLjMtMC4zTDc0LjggMEM3NC44IDAgODYuMSAwLjcgODAuNyA5LjUgODAuMyAxMC4zIDc3LjYgMTYuMSA2NC44IDI4IDUxLjMgNDAuNSA1My4xIDM4LjUgNjkuMyA2MC4xIDc5LjIgNzMuMyA4My4yIDgxLjQgODEuOSA4NC44IDgwLjggODguMSA3My41IDg3LjIgNzMuNSA4Ny4yTDQ5LjMgODcuMUM0OS4zIDg3LjEgNDcuNSA4Ny4zIDQ2LjIgODYuNSA0NC45IDg1LjcgNDQgODMuOSA0NCA4My45IDQ0IDgzLjkgNDAuMiA3My43IDM1LjEgNjUuMSAyNC4zIDQ2LjggMjAgNDUuOCAxOC4zIDQ2LjkgMTQuMiA0OS42IDE1LjIgNTcuNiAxNS4yIDYzLjIgMTUuMiA4MSAxNy45IDg4LjQgOS45IDkwLjMgNy4zIDkwLjkgNS40IDkxLjMtMS40IDkxLjQtMTAgOTEuNS0xNy4zIDkxLjQtMjEuNCA4OS4zLTI0LjIgODgtMjYuMyA4NS0yNSA4NC44LTIzLjQgODQuNi0xOS44IDgzLjgtMTcuOSA4MS4yLTE1LjQgNzcuOS0xNS41IDcwLjMtMTUuNSA3MC4zLTE1LjUgNzAuMy0xNC4xIDQ5LjQtMTguOCA0Ni44LTIyLjEgNDUtMjYuNSA0OC43LTM2LjEgNjUuMy00MS4xIDczLjgtNDQuOCA4My4yLTQ0LjggODMuMi00NC44IDgzLjItNDUuNSA4NC45LTQ2LjggODUuOS00OC4zIDg3LTUwLjUgODcuNC01MC41IDg3LjRMLTczLjUgODcuMkMtNzMuNSA4Ny4yLTc2LjkgODcuMS03OC4yIDg1LjYtNzkuMyA4NC4zLTc4LjMgODEuNS03OC4zIDgxLjUtNzguMyA4MS41LTYwLjMgMzkuNC0zOS45IDE4LjItMjEuMi0xLjMgMCAwIDAgMFwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48ZyB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoMTA2Ljg4LDE4My42MSlcIj48ZyB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoLTYuODgwNSwtMTAwKVwiIHN0eWxlPVwic3Ryb2tlOm5vbmU7c3Ryb2tlLW9wYWNpdHk6MVwiPjxwYXRoIGQ9XCJNIDAsMCBDIDguMTQ2LDAgMTQuNzY5LC02LjYyNSAxNC43NjksLTE0Ljc3IDE0Ljc2OSwtMjIuOTA3IDguMTQ2LC0yOS41MzMgMCwtMjkuNTMzIC04LjEzNiwtMjkuNTMzIC0xNC43NjksLTIyLjkwNyAtMTQuNzY5LC0xNC43NyAtMTQuNzY5LC02LjYyNSAtOC4xMzYsMCAwLDAgTSAwLC01MC40MjkgQyAxOS42NzYsLTUwLjQyOSAzNS42NywtMzQuNDM1IDM1LjY3LC0xNC43NyAzNS42Nyw0LjkwMyAxOS42NzYsMjAuOTAzIDAsMjAuOTAzIC0xOS42NzEsMjAuOTAzIC0zNS42NjksNC45MDMgLTM1LjY2OSwtMTQuNzcgLTM1LjY2OSwtMzQuNDM1IC0xOS42NzEsLTUwLjQyOSAwLC01MC40MjlcIiBzdHlsZT1cImZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIi8+PC9nPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw3LjU1MTYsLTU0LjU3NylcIiBzdHlsZT1cInN0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIj48cGF0aCBkPVwiTSAwLDAgQyA3LjI2MiwxLjY1NSAxNC4yNjQsNC41MjYgMjAuNzE0LDguNTc4IDI1LjU5NSwxMS42NTQgMjcuMDY2LDE4LjEwOCAyMy45OSwyMi45ODkgMjAuOTE3LDI3Ljg4MSAxNC40NjksMjkuMzUyIDkuNTc5LDI2LjI3NSAtNS4wMzIsMTcuMDg2IC0yMy44NDMsMTcuMDkyIC0zOC40NDYsMjYuMjc1IC00My4zMzYsMjkuMzUyIC00OS43ODQsMjcuODgxIC01Mi44NTIsMjIuOTg5IC01NS45MjgsMTguMTA0IC01NC40NjEsMTEuNjU0IC00OS41OCw4LjU3OCAtNDMuMTMyLDQuNTMxIC0zNi4xMjgsMS42NTUgLTI4Ljg2NywwIEwgLTQ4LjgwOSwtMTkuOTQxIEMgLTUyLjg4NiwtMjQuMDIyIC01Mi44ODYsLTMwLjYzOSAtNDguODA1LC0zNC43MiAtNDYuNzYyLC0zNi43NTggLTQ0LjA5LC0zNy43NzkgLTQxLjQxOCwtMzcuNzc5IC0zOC43NDIsLTM3Ljc3OSAtMzYuMDY1LC0zNi43NTggLTM0LjAyMywtMzQuNzIgTCAtMTQuNDM2LC0xNS4xMjMgNS4xNjksLTM0LjcyIEMgOS4yNDYsLTM4LjgwMSAxNS44NjIsLTM4LjgwMSAxOS45NDMsLTM0LjcyIDI0LjAyOCwtMzAuNjM5IDI0LjAyOCwtMjQuMDE5IDE5Ljk0MywtMTkuOTQxIEwgMCwwIFpcIiBzdHlsZT1cImZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIi8+PC9nPjwvZz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxNjkuNzYsNTYuNzI3KVwiIGQ9XCJNMCAwQy01LjEtMi4zLTEwLjYtMy44LTE2LjQtNC41LTEwLjUtMS02IDQuNi0zLjkgMTEuMy05LjQgOC0xNS41IDUuNy0yMiA0LjQtMjcuMyA5LjktMzQuNyAxMy40LTQyLjkgMTMuNC01OC43IDEzLjQtNzEuNiAwLjYtNzEuNi0xNS4yLTcxLjYtMTcuNC03MS4zLTE5LjYtNzAuOC0yMS43LTk0LjYtMjAuNS0xMTUuNy05LjEtMTI5LjggOC4yLTEzMi4zIDQtMTMzLjctMS0xMzMuNy02LjItMTMzLjctMTYuMS0xMjguNi0yNC45LTEyMC45LTMwLTEyNS42LTI5LjktMTMwLjEtMjguNi0xMzMuOS0yNi41LTEzMy45LTI2LjYtMTMzLjktMjYuNy0xMzMuOS0yNi44LTEzMy45LTQwLjctMTI0LTUyLjMtMTExLTU0LjktMTEzLjQtNTUuNS0xMTUuOS01NS45LTExOC41LTU1LjktMTIwLjMtNTUuOS0xMjIuMS01NS43LTEyMy45LTU1LjQtMTIwLjItNjYuNy0xMDkuNy03NS05Ny4xLTc1LjMtMTA2LjktODIuOS0xMTkuMy04Ny41LTEzMi43LTg3LjUtMTM1LTg3LjUtMTM3LjMtODcuNC0xMzkuNS04Ny4xLTEyNi44LTk1LjItMTExLjgtMTAwLTk1LjYtMTAwLTQzLTEwMC0xNC4yLTU2LjMtMTQuMi0xOC41LTE0LjItMTcuMy0xNC4yLTE2LTE0LjMtMTQuOC04LjctMTAuOC0zLjgtNS43IDAgMFwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgxIDAgMCAtMSA3Mi4zODEgOTAuMTcyKVwiPjxwYXRoIGQ9XCJNODcuMiAwIDg3LjIgMTcuMSA3NSAxNy4xIDc1IDAgNTcuOSAwIDU3LjktMTIuMiA3NS0xMi4yIDc1LTI5LjMgODcuMi0yOS4zIDg3LjItMTIuMiAxMDQuMy0xMi4yIDEwNC4zIDAgODcuMiAwWlwiLz48cGF0aCBkPVwiTTAgMCAwLTE5LjYgMjYuMi0xOS42QzI1LjQtMjMuNyAyMy44LTI3LjUgMjAuOC0zMC42IDEwLjMtNDIuMS05LjMtNDItMjAuNS0zMC40LTMxLjctMTguOS0zMS42LTAuMy0yMC4yIDExLjEtOS40IDIxLjkgOCAyMi40IDE4LjYgMTIuMUwxOC41IDEyLjEgMzIuOCAyNi40QzEzLjcgNDMuOC0xNS44IDQzLjUtMzQuNSAyNS4xLTUzLjggNi4xLTU0LTI1LTM0LjktNDQuMy0xNS45LTYzLjUgMTcuMS02My43IDM0LjktNDQuNiA0NS42LTMzIDQ4LjctMTYuNCA0Ni4yIDBMMCAwWlwiLz48L2c+PC9zdmc+JyxcclxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsOTcuNjc2LDYyLjQxMSlcIiBkPVwiTTAgMEMxMC4yIDAgMTkuOS00LjUgMjYuOS0xMS42TDI2LjktMTEuNkMyNi45LTguMiAyOS4yLTUuNyAzMi40LTUuN0wzMy4yLTUuN0MzOC4yLTUuNyAzOS4yLTEwLjQgMzkuMi0xMS45TDM5LjItNjQuOEMzOC45LTY4LjIgNDIuOC03MCA0NS02Ny44IDUzLjUtNTkuMSA2My42LTIyLjkgMzkuNy0yIDE3LjQgMTcuNi0xMi41IDE0LjMtMjguNSAzLjQtNDUuNC04LjMtNTYuMi0zNC4xLTQ1LjctNTguNC0zNC4yLTg0LjktMS40LTkyLjggMTguMS04NC45IDI4LTgwLjkgMzIuNS05NC4zIDIyLjMtOTguNiA2LjgtMTA1LjItMzYuNC0xMDQuNS01Ni41LTY5LjYtNzAuMS00Ni4xLTY5LjQtNC42LTMzLjMgMTYuOS01LjcgMzMuMyAzMC43IDI4LjggNTIuNyA1LjggNzUuNi0xOC4yIDc0LjMtNjMgNTEuOS04MC41IDQxLjgtODguNCAyNi43LTgwLjcgMjYuOC02OS4yTDI2LjctNjUuNEMxOS42LTcyLjQgMTAuMi03Ni41IDAtNzYuNS0yMC4yLTc2LjUtMzgtNTguNy0zOC0zOC40LTM4LTE4LTIwLjIgMCAwIDBNMjUuNS0zN0MyNC43LTIyLjIgMTMuNy0xMy4zIDAuNC0xMy4zTC0wLjEtMTMuM0MtMTUuNC0xMy4zLTIzLjktMjUuMy0yMy45LTM5LTIzLjktNTQuMy0xMy42LTY0LTAuMS02NCAxNC45LTY0IDI0LjgtNTMgMjUuNS00MEwyNS41LTM3WlwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgwLjQyNjIzIDAgMCAwLjQyNjIzIDM0Ljk5OSAzNSlcIj48cGF0aCBkPVwiTTE2MC43IDE5LjVjLTE4LjkgMC0zNy4zIDMuNy01NC43IDEwLjlMNzYuNCAwLjdjLTAuOC0wLjgtMi4xLTEtMy4xLTAuNEM0NC40IDE4LjIgMTkuOCA0Mi45IDEuOSA3MS43Yy0wLjYgMS0wLjUgMi4zIDAuNCAzLjFsMjguNCAyOC40Yy04LjUgMTguNi0xMi44IDM4LjUtMTIuOCA1OS4xIDAgNzguNyA2NCAxNDIuOCAxNDIuOCAxNDIuOCA3OC43IDAgMTQyLjgtNjQgMTQyLjgtMTQyLjhDMzAzLjQgODMuNSAyMzkuNCAxOS41IDE2MC43IDE5LjV6TTIxNy4yIDE0OC43bDkuOSA0Mi4xIDkuNSA0NC40IC00NC4zLTkuNSAtNDIuMS05LjlMMzYuNyAxMDIuMWMxNC4zLTI5LjMgMzguMy01Mi42IDY4LjEtNjUuOEwyMTcuMiAxNDguN3pcIi8+PHBhdGggZD1cIk0yMjEuOCAxODcuNGwtNy41LTMzYy0yNS45IDExLjktNDYuNCAzMi40LTU4LjMgNTguM2wzMyA3LjVDMTk2IDIwNi4yIDIwNy43IDE5NC40IDIyMS44IDE4Ny40elwiLz48L2c+PC9zdmc+JyxcclxuICAgICAgJycsLy9waW5cclxuICAgICAgJycsLy9mYXZcclxuICAgICAgJycsLy9wcmludFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw3MS4yNjQsMTA2LjkzKVwiIGQ9XCJNMCAwIDY4LjYgNDMuMUM3MiA0NS4zIDczLjEgNDIuOCA3MS42IDQxLjFMMTQuNi0xMC4yIDExLjctMzUuOCAwIDBaTTg3LjEgNjIuOS0zMy40IDE3LjJDLTQwIDE1LjMtMzkuOCA4LjgtMzQuOSA3LjNMLTQuNy0yLjIgNi44LTM3LjZDOC4yLTQxLjUgOS40LTQyLjkgMTEuOC00MyAxNC4zLTQzIDE1LjMtNDIuMSAxNy45LTM5LjggMjAuOS0zNi45IDI1LjYtMzIuMyAzMy0yNS4yTDY0LjQtNDguNEM3MC4yLTUxLjYgNzQuMy00OS45IDc1LjgtNDNMOTUuNSA1NC40Qzk3LjYgNjIuOSA5Mi42IDY1LjQgODcuMSA2Mi45XCIvPjwvc3ZnPicsXHJcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDEzNS4zMywxMTkuODUpXCIgZD1cIk0wIDBDLTIuNC01LjQtNi41LTktMTIuMi0xMC42LTE0LjMtMTEuMi0xNi4zLTEwLjctMTguMi05LjktNDQuNCAxLjItNjMuMyAxOS42LTc0IDQ2LjItNzQuOCA0OC4xLTc1LjMgNTAuMS03NS4yIDUxLjktNzUuMiA1OC43LTY5LjIgNjUtNjIuNiA2NS40LTYwLjggNjUuNS01OS4yIDY0LjktNTcuOSA2My43LTUzLjMgNTkuMy00OS42IDU0LjMtNDYuOSA0OC42LTQ1LjQgNDUuNS00NiA0My4zLTQ4LjcgNDEuMS00OS4xIDQwLjctNDkuNSA0MC40LTUwIDQwLjEtNTMuNSAzNy41LTU0LjMgMzQuOS01Mi42IDMwLjgtNDkuOCAyNC4yLTQ1LjQgMTktMzkuMyAxNS4xLTM3IDEzLjYtMzQuNyAxMi4yLTMyIDExLjUtMjkuNiAxMC44LTI3LjcgMTEuNS0yNi4xIDEzLjQtMjUuOSAxMy42LTI1LjggMTMuOS0yNS42IDE0LjEtMjIuMyAxOC44LTE4LjYgMTkuNi0xMy43IDE2LjUtOS42IDEzLjktNS42IDExLTEuOCA3LjggMC43IDUuNiAxLjMgMyAwIDBNLTE4LjIgMzYuN0MtMTguMyAzNS45LTE4LjMgMzUuNC0xOC40IDM0LjktMTguNiAzNC0xOS4yIDMzLjQtMjAuMiAzMy40LTIxLjMgMzMuNC0yMS45IDM0LTIyLjIgMzQuOS0yMi4zIDM1LjUtMjIuNCAzNi4yLTIyLjUgMzYuOS0yMy4yIDQwLjMtMjUuMiA0Mi42LTI4LjYgNDMuNi0yOS4xIDQzLjctMjkuNSA0My43LTI5LjkgNDMuOC0zMSA0NC4xLTMyLjQgNDQuMi0zMi40IDQ1LjgtMzIuNSA0Ny4xLTMxLjUgNDcuOS0yOS42IDQ4LTI4LjQgNDguMS0yNi41IDQ3LjUtMjUuNCA0Ni45LTIwLjkgNDQuNy0xOC43IDQxLjYtMTguMiAzNi43TS0yNS41IDUxLjJDLTI4IDUyLjEtMzAuNSA1Mi44LTMzLjIgNTMuMi0zNC41IDUzLjQtMzUuNCA1NC4xLTM1LjEgNTUuNi0zNC45IDU3LTM0IDU3LjUtMzIuNiA1Ny40LTI0IDU2LjYtMTcuMyA1My40LTEyLjYgNDYtMTAuNSA0Mi41LTkuMiAzNy41LTkuNCAzMy44LTkuNSAzMS4yLTkuOSAzMC41LTExLjQgMzAuNS0xMy42IDMwLjYtMTMuMyAzMi40LTEzLjUgMzMuNy0xMy43IDM1LjctMTQuMiAzNy43LTE0LjcgMzkuNy0xNi4zIDQ1LjQtMTkuOSA0OS4zLTI1LjUgNTEuMk0tMzggNjQuNEMtMzcuOSA2NS45LTM3IDY2LjUtMzUuNSA2Ni40LTIzLjIgNjUuOC0xMy45IDYyLjItNi43IDUyLjUtMi41IDQ2LjktMC4yIDM5LjIgMCAzMi4yIDAgMzEuMSAwIDMwIDAgMjktMC4xIDI3LjgtMC42IDI2LjktMS45IDI2LjktMy4yIDI2LjktMy45IDI3LjYtNCAyOS00LjMgMzQuMi01LjMgMzkuMy03LjMgNDQuMS0xMS4yIDUzLjUtMTguNiA1OC42LTI4LjEgNjEuMS0zMC43IDYxLjctMzMuMiA2Mi4yLTM1LjggNjIuNS0zNyA2Mi41LTM4IDYyLjgtMzggNjQuNE0xMS41IDc0LjFDNi42IDc4LjMgMC45IDgwLjgtNS4zIDgyLjQtMjAuOCA4Ni41LTM2LjUgODcuNS01Mi40IDg1LjMtNjAuNSA4NC4yLTY4LjMgODIuMS03NS40IDc4LjEtODMuOCA3My40LTg5LjYgNjYuNi05Mi4yIDU3LjEtOTQgNTAuNC05NC45IDQzLjYtOTUuMiAzNi42LTk1LjcgMjYuNC05NS40IDE2LjMtOTIuOCA2LjMtODkuOC01LjMtODMuMi0xMy44LTcxLjktMTguMy03MC43LTE4LjgtNjkuNS0xOS41LTY4LjMtMjAtNjcuMi0yMC40LTY2LjgtMjEuMi02Ni44LTIyLjQtNjYuOS0zMC40LTY2LjgtMzguNC02Ni44LTQ2LjctNjMuOS00My45LTYxLjgtNDEuOC02MC4zLTQwLjEtNTUuOS0zNS4xLTUxLjctMzAuOS00Ny4xLTI2LjEtNDQuNy0yMy43LTQ1LjctMjMuOC00Mi4xLTIzLjgtMzcuOC0yMy45LTMxLTI0LjEtMjYuOC0yMy44LTE4LjYtMjMuMS0xMC42LTIyLjEtMi43LTE5LjcgNy4yLTE2LjcgMTUuMi0xMS40IDE5LjItMS4zIDIwLjMgMS4zIDIxLjQgNCAyMiA2LjggMjUuOSAyMi45IDI1LjQgMzguOSAyMi4yIDU1IDIwLjYgNjIuNCAxNy41IDY5IDExLjUgNzQuMVwiLz48L3N2Zz4nLFxyXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMzAuODQsMTEyLjcpXCIgZD1cIk0wIDBDLTEuNiAwLjktOS40IDUuMS0xMC44IDUuNy0xMi4zIDYuMy0xMy40IDYuNi0xNC41IDUtMTUuNiAzLjQtMTguOS0wLjEtMTkuOS0xLjEtMjAuOC0yLjItMjEuOC0yLjMtMjMuNC0xLjQtMjUtMC41LTMwLjEgMS40LTM2LjEgNy4xLTQwLjcgMTEuNS00My43IDE3LTQ0LjYgMTguNi00NS41IDIwLjMtNDQuNiAyMS4xLTQzLjggMjEuOS00MyAyMi42LTQyLjEgMjMuNy00MS4zIDI0LjYtNDAuNCAyNS41LTQwLjEgMjYuMi0zOS41IDI3LjItMzkgMjguMy0zOS4yIDI5LjMtMzkuNiAzMC4xLTM5LjkgMzAuOS00Mi45IDM5LTQ0LjEgNDIuMy00NS4zIDQ1LjUtNDYuNyA0NS00Ny42IDQ1LjEtNDguNiA0NS4xLTQ5LjYgNDUuMy01MC43IDQ1LjMtNTEuOCA0NS40LTUzLjYgNDUtNTUuMSA0My41LTU2LjYgNDEuOS02MSAzOC4yLTYxLjMgMzAuMi02MS42IDIyLjMtNTYuMSAxNC40LTU1LjMgMTMuMy01NC41IDEyLjItNDQuOC01LjEtMjguNi0xMi4xLTEyLjQtMTkuMi0xMi40LTE3LjEtOS40LTE2LjktNi40LTE2LjggMC4zLTEzLjQgMS44LTkuNiAzLjMtNS45IDMuNC0yLjcgMy0yIDIuNi0xLjMgMS42LTAuOSAwIDBNLTI5LjctMzguM0MtNDAuNC0zOC4zLTUwLjMtMzUuMS01OC42LTI5LjZMLTc4LjktMzYuMS03Mi4zLTE2LjVDLTc4LjYtNy44LTgyLjMgMi44LTgyLjMgMTQuNC04Mi4zIDQzLjQtNTguNyA2Ny4xLTI5LjcgNjcuMS0wLjYgNjcuMSAyMyA0My40IDIzIDE0LjQgMjMtMTQuNy0wLjYtMzguMy0yOS43LTM4LjNNLTI5LjcgNzcuNkMtNjQuNiA3Ny42LTkyLjkgNDkuMy05Mi45IDE0LjQtOTIuOSAyLjQtODkuNi04LjgtODMuOS0xOC4zTC05NS4zLTUyLjItNjAuMi00MUMtNTEuMi00Ni00MC44LTQ4LjktMjkuNy00OC45IDUuMy00OC45IDMzLjYtMjAuNiAzMy42IDE0LjQgMzMuNiA0OS4zIDUuMyA3Ny42LTI5LjcgNzcuNlwiLz48L3N2Zz4nLFxyXG4gICAgXTtcclxuICAgIHZhciBpY29uPXN2Z1tqXTtcclxuICAgIHZhciBjc3M9JyBzdHlsZT1cIndpZHRoOicrc2l6ZSsncHg7aGVpZ2h0Oicrc2l6ZSsncHhcIiAnO1xyXG4gICAgaWNvbj0nPHN2ZyBjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2Qtc3ZnXCInK2NzcytpY29uLnN1YnN0cmluZyg0KTtcclxuICAgIGljb249Jz4nK2ljb24uc3Vic3RyaW5nKDAsIGljb24ubGVuZ3RoIC0gMSk7XHJcbiAgfWVsc2V7XHJcbiAgICBpY29uPSdzdHlsZT1cImRpc3BsYXk6aW5saW5lLWJsb2NrO3ZlcnRpY2FsLWFsaWduOmJvdHRvbTt3aWR0aDonK3NpemUrJ3B4O2hlaWdodDonK3NpemUrJ3B4O21hcmdpbjowIDZweCA2cHggMDtwYWRkaW5nOjA7b3V0bGluZTpub25lO2JhY2tncm91bmQ6dXJsKCcgKyBmICsgZm4gKyAnKSAtJyArIHNpemUgKiBqICsgJ3B4IDAgbm8tcmVwZWF0OyBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1wiJ1xyXG4gIH1cclxuICByZXR1cm4gaWNvbjtcclxufVxyXG5cclxuZnVuY3Rpb24gZmF2KGEpIHtcclxuICB2YXIgdGl0bGUgPSBkb2N1bWVudC50aXRsZTtcclxuICB2YXIgdXJsID0gZG9jdW1lbnQubG9jYXRpb247XHJcbiAgdHJ5IHtcclxuICAgIHdpbmRvdy5leHRlcm5hbC5BZGRGYXZvcml0ZSh1cmwsIHRpdGxlKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICB3aW5kb3cuc2lkZWJhci5hZGRQYW5lbCh0aXRsZSwgdXJsLCAnJyk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgKG9wZXJhKSA9PSAnb2JqZWN0JyB8fCB3aW5kb3cuc2lkZWJhcikge1xyXG4gICAgICAgIGEucmVsID0gJ3NpZGViYXInO1xyXG4gICAgICAgIGEudGl0bGUgPSB0aXRsZTtcclxuICAgICAgICBhLnVybCA9IHVybDtcclxuICAgICAgICBhLmhyZWYgPSB1cmw7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYWxlcnQoJ9Cd0LDQttC80LjRgtC1IEN0cmwtRCwg0YfRgtC+0LHRiyDQtNC+0LHQsNCy0LjRgtGMINGB0YLRgNCw0L3QuNGG0YMg0LIg0LfQsNC60LvQsNC00LrQuCcpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VuZF9wcm9tbyhwcm9tbyl7XHJcbiAgJC5hamF4KHtcclxuICAgIG1ldGhvZDogXCJwb3N0XCIsXHJcbiAgICB1cmw6IFwiL2FjY291bnQvcHJvbW9cIixcclxuICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICBkYXRhOiB7cHJvbW86IHByb21vfSxcclxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgaWYgKGRhdGEudGl0bGUgIT0gbnVsbCAmJiBkYXRhLm1lc3NhZ2UgIT0gbnVsbCkge1xyXG4gICAgICAgIG9uX3Byb21vPSQoJy5vbl9wcm9tbycpO1xyXG4gICAgICAgIGlmKG9uX3Byb21vLmxlbmd0aD09MCB8fCAhb25fcHJvbW8uaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgb25fcHJvbW8uc2hvdygpO1xyXG4gICAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuIiwiJCgnLnNjcm9sbF9ib3gtdGV4dCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcblxyXG4gICAkKHRoaXMpLmNsb3Nlc3QoJy5zY3JvbGxfYm94JykuZmluZCgnLnNjcm9sbF9ib3gtaXRlbScpLnJlbW92ZUNsYXNzKCdzY3JvbGxfYm94LWl0ZW0tbG93Jyk7XHJcblxyXG59KTsiLCJ2YXIgcGxhY2Vob2xkZXIgPSAoZnVuY3Rpb24oKXtcclxuICBmdW5jdGlvbiBvbkJsdXIoKXtcclxuICAgIHZhciBpbnB1dFZhbHVlID0gJCh0aGlzKS52YWwoKTtcclxuICAgIGlmICggaW5wdXRWYWx1ZSA9PSBcIlwiICkge1xyXG4gICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykucmVtb3ZlQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uRm9jdXMoKXtcclxuICAgICQodGhpcykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnZm9jdXNlZCcpO1xyXG4gIH1cclxuXHJcblxyXG4gIGZ1bmN0aW9uIHJ1bihwYXIpIHtcclxuICAgIHZhciBlbHM7XHJcbiAgICBpZighcGFyKVxyXG4gICAgICBlbHM9JCgnLmZvcm0tZ3JvdXAgW3BsYWNlaG9sZGVyXScpO1xyXG4gICAgZWxzZVxyXG4gICAgICBlbHM9JChwYXIpLmZpbmQoJy5mb3JtLWdyb3VwIFtwbGFjZWhvbGRlcl0nKTtcclxuXHJcbiAgICBlbHMuZm9jdXMob25Gb2N1cyk7XHJcbiAgICBlbHMuYmx1cihvbkJsdXIpO1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGk8ZWxzLmxlbmd0aDtpKyspe1xyXG4gICAgICB2YXIgZWw9ZWxzLmVxKGkpO1xyXG4gICAgICB2YXIgdGV4dCA9IGVsLmF0dHIoJ3BsYWNlaG9sZGVyJyk7XHJcbiAgICAgIGVsLmF0dHIoJ3BsYWNlaG9sZGVyJywnJyk7XHJcbiAgICAgIGlmKHRleHQubGVuZ3RoPDIpY29udGludWU7XHJcbiAgICAgIC8vaWYoZWwuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5sZW5ndGg9PTApcmV0dXJuO1xyXG5cclxuICAgICAgdmFyIGlucHV0VmFsdWUgPSBlbC52YWwoKTtcclxuICAgICAgdmFyIGVsX2lkID0gZWwuYXR0cignaWQnKTtcclxuICAgICAgaWYoIWVsX2lkKXtcclxuICAgICAgICBlbF9pZD0nZWxfZm9ybXNfJytNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkqMTAwMDApO1xyXG4gICAgICAgIGVsLmF0dHIoJ2lkJyxlbF9pZClcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYodGV4dC5pbmRleE9mKCd8Jyk+MCl7XHJcbiAgICAgICAgdGV4dD10ZXh0LnNwbGl0KCd8Jyk7XHJcbiAgICAgICAgdGV4dD10ZXh0WzBdK1wiPHNwYW4+XCIrdGV4dFsxXStcIjwvc3Bhbj5cIlxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZGl2ID0gJCgnPGxhYmVsLz4nLHtcclxuICAgICAgICAnY2xhc3MnOidwbGFjZWhvbGRlcicsXHJcbiAgICAgICAgJ2h0bWwnOiB0ZXh0LFxyXG4gICAgICAgICdmb3InOmVsX2lkXHJcbiAgICAgIH0pO1xyXG4gICAgICBlbC5iZWZvcmUoZGl2KTtcclxuXHJcbiAgICAgIG9uRm9jdXMuYmluZChlbCkoKVxyXG4gICAgICBvbkJsdXIuYmluZChlbCkoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcnVuKCk7XHJcbiAgcmV0dXJuIHJ1bjtcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFqYXhfbG9hZCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHZhciB1cmwgPSAkKHRoYXQpLmF0dHIoJ2hyZWYnKTtcclxuICAgICAgICB2YXIgdG9wID0gTWF0aC5tYXgoZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApO1xyXG4gICAgICAgIHZhciBzdG9yZXNTb3J0ID0gJCgnLmNhdGFsb2ctc3RvcmVzX3NvcnQnKTsvL9Cx0LvQvtC6INGB0L7RgNGC0LjRgNC+0LLQutC4INGN0LvQtdC80LXQvdGC0L7QslxyXG4gICAgICAgIHZhciB0YWJsZSA9ICQoJ3RhYmxlLnRhYmxlJyk7Ly/RgtCw0LHQu9C40YbQsCDQsiBhY2NvdW50XHJcbiAgICAgICAgLy9zY3JvbGwg0YLRg9C00LAg0LjQu9C4INGC0YPQtNCwXHJcbiAgICAgICAgdmFyIHNjcm9sbFRvcCA9IHN0b3Jlc1NvcnQubGVuZ3RoID8gJChzdG9yZXNTb3J0WzBdKS5vZmZzZXQoKS50b3AgLSAkKCcjaGVhZGVyPionKS5lcSgwKS5oZWlnaHQoKSAtIDUwIDogMDtcclxuICAgICAgICBpZiAoc2Nyb2xsVG9wID09PTAgJiYgdGFibGUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQodGFibGVbMF0pLm9mZnNldCgpLnRvcCAtICQoJyNoZWFkZXI+KicpLmVxKDApLmhlaWdodCgpIC0gNTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKHRoYXQpLmFkZENsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgJC5nZXQodXJsLCB7J2cnOidhamF4X2xvYWQnfSwgZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gJChkYXRhKS5maW5kKCcjY29udGVudC13cmFwJykuaHRtbCgpO1xyXG4gICAgICAgICAgICAkKCdib2R5JykuZmluZCgnI2NvbnRlbnQtd3JhcCcpLmh0bWwoY29udGVudCk7XHJcbiAgICAgICAgICAgIHNoYXJlNDIoKTsvL3Qg0L7RgtC+0LHRgNCw0LfQuNC70LjRgdGMINC60L3QvtC/0LrQuCDQn9C+0LTQtdC70LjRgtGM0YHRj1xyXG4gICAgICAgICAgICBzZFRvb2x0aXAuc2V0RXZlbnRzKCk7Ly/RgNCw0LHQvtGC0LDQu9C4INGC0YPQu9GC0LjQv9GLXHJcbiAgICAgICAgICAgIGJhbm5lci5yZWZyZXNoKCk7Ly/QvtCx0L3QvtCy0LjRgtGMINCx0LDQvdC90LXRgCDQvtGCINCz0YPQs9C7XHJcbiAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShcIm9iamVjdCBvciBzdHJpbmdcIiwgXCJUaXRsZVwiLCB1cmwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRvcCA+IHNjcm9sbFRvcCkge1xyXG4gICAgICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogc2Nyb2xsVG9wfSwgNTAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKHRoYXQpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe3R5cGU6J2VycicsICd0aXRsZSc6bGcoJ2Vycm9yJyksICdtZXNzYWdlJzpsZygnZXJyb3JfcXVlcnlpbmdfZGF0YScpfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcblxyXG59KSgpO1xyXG4iLCJiYW5uZXIgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICBmdW5jdGlvbiByZWZyZXNoKCl7XHJcbiAgICAgICAgZm9yKGk9MDtpPCQoJy5hZHNieWdvb2dsZScpLmxlbmd0aDtpKyspIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIChhZHNieWdvb2dsZSA9IHdpbmRvdy5hZHNieWdvb2dsZSB8fCBbXSkucHVzaCh7fSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge3JlZnJlc2g6IHJlZnJlc2h9XHJcbn0pKCk7IiwidmFyIGNvdW50cnlfc2VsZWN0ID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICAkKCcuaGVhZGVyLWNvdW50cmllc19kaWFsb2ctY2xvc2UnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBkaWFsb2dDbG9zZSh0aGlzKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5oZWFkZXItY291bnRyaWVzX2RpYWxvZy1kaWFsb2ctYnV0dG9uLWFwcGx5JykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcoRGF0ZSk7XHJcbiAgICAgICAgZGF0ZSA9IE1hdGgucm91bmQoZGF0ZS5nZXRUaW1lKCkvMTAwMCk7XHJcbiAgICAgICAgc2V0Q29va2llQWpheCgnX3NkX2NvdW50cnlfZGlhbG9nX2Nsb3NlJywgZGF0ZSwgNyk7XHJcbiAgICAgICAgZGlhbG9nQ2xvc2UodGhpcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLWNvdW50cmllc19kaWFsb2ctZGlhbG9nLWJ1dHRvbi1jaG9vc2UnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQutC70LDRgdGBLCDQuNC80LjRgtC40YDQvtCy0LDRgtGMIGhvdmVyXHJcbiAgICAgICAgJCgnI2hlYWRlci11cGxpbmUtcmVnaW9uLXNlbGVjdC1idXR0b24nKS5hZGRDbGFzcyhcIm9wZW5cIik7XHJcbiAgICAgICAgZGlhbG9nQ2xvc2UodGhpcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLXVwbGluZV9sYW5nLWxpc3QnKS5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGRpYWxvZ0Nsb3NlID0gZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICQoJy5oZWFkZXItdXBsaW5lX2xhbmctbGlzdCcpLnJlbW92ZUNsYXNzKCdpbmFjdGl2ZScpO1xyXG4gICAgICAgICQoZWxlbSkuY2xvc2VzdCgnLmhlYWRlci1jb3VudHJpZXNfZGlhbG9nJykuZmFkZU91dCgpO1xyXG4gICAgfTtcclxufSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgdmFyIHNsaWRlciA9ICQoXCIjZmlsdGVyLXNsaWRlci1wcmljZVwiKTtcclxuICAgIHZhciB0ZXh0U3RhcnQgPSAkKCcjc2xpZGVyLXByaWNlLXN0YXJ0Jyk7XHJcbiAgICB2YXIgdGV4dEZpbmlzaCA9ICQoJyNzbGlkZXItcHJpY2UtZW5kJyk7XHJcblxyXG4gICAgdmFyIHN0YXJ0UmFuZ2UgPSBwYXJzZUludCgkKHRleHRTdGFydCkuZGF0YSgncmFuZ2UnKSwgMTApLFxyXG4gICAgICAgIGZpbmlzaFJhbmdlID0gcGFyc2VJbnQoJCh0ZXh0RmluaXNoKS5kYXRhKCdyYW5nZScpLCAxMCksXHJcbiAgICAgICAgc3RhcnRVc2VyID0gcGFyc2VJbnQoJCh0ZXh0U3RhcnQpLmRhdGEoJ3VzZXInKSwgMTApLFxyXG4gICAgICAgIGZpbmlzaFVzZXIgPSBwYXJzZUludCgkKHRleHRGaW5pc2gpLmRhdGEoJ3VzZXInKSwgMTApO1xyXG4gICAgLy9jb25zb2xlLmxvZyhzdGFydFJhbmdlLCBmaW5pc2hSYW5nZSwgc3RhcnRVc2VyLCBmaW5pc2hVc2VyKTtcclxuICAgIHNsaWRlci5zbGlkZXIoe1xyXG4gICAgICAgIHJhbmdlOiB0cnVlLFxyXG4gICAgICAgIG1pbjogc3RhcnRSYW5nZSxcclxuICAgICAgICBtYXg6IGZpbmlzaFJhbmdlLFxyXG4gICAgICAgIHZhbHVlczogW3N0YXJ0VXNlcixcclxuICAgICAgICAgICAgZmluaXNoVXNlcl0sXHJcbiAgICAgICAgc2xpZGU6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codWkudmFsdWVzWyAwIF0gKyBcIiAtIFwiICsgdWkudmFsdWVzWyAxIF0pO1xyXG4gICAgICAgICAgICAkKHRleHRTdGFydCkudmFsKHVpLnZhbHVlc1swXSk7XHJcbiAgICAgICAgICAgICQodGV4dEZpbmlzaCkudmFsKHVpLnZhbHVlc1sxXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHByaWNlU3RhcnRDaGFuZ2UoZSkge1xyXG4gICAgICAgIHZhciB0aGF0ID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgc3RyVmFsdWUgPSB0aGF0LnZhbCgpLFxyXG4gICAgICAgICAgICBpbnRWYWx1ZSA9IHBhcnNlSW50KHN0clZhbHVlKSB8fCAwLC8v0LXRgdC70Lgg0L3QtdC/0YDQsNCy0LjQu9GM0L3Qviwg0YLQviAwXHJcbiAgICAgICAgICAgIHN0YXJ0UmFuZ2UgPSBwYXJzZUludCh0aGF0LmRhdGEoJ3JhbmdlJykpLFxyXG4gICAgICAgICAgICBmaW5pc2hSYW5nZSA9IHBhcnNlSW50KHRleHRGaW5pc2gudmFsKCkpO1xyXG5cclxuICAgICAgICBpZiAoaW50VmFsdWUgPCBzdGFydFJhbmdlKSB7IC8v0LXRgdC70Lgg0LzQtdC90YzRiNC1INC00LjQsNC/0LDQt9C+0L3QsCwg0YLQviDQv9C+INC90LjQttC90LXQvNGDINC/0YDQtdC00LXQu9GDXHJcbiAgICAgICAgICAgIGludFZhbHVlID0gc3RhcnRSYW5nZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGludFZhbHVlID4gZmluaXNoUmFuZ2UpIHsgLy/QtdGB0LvQuCDQstGL0YjQtSDQtNC40LDQv9Cw0LfQvtC90LAsINGC0L4gINCy0LXRgNGF0L3QuNC80YMg0L/RgNC10LTQtdC70YNcclxuICAgICAgICAgICAgaW50VmFsdWUgPSBmaW5pc2hSYW5nZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2xpZGVyLnNsaWRlcigndmFsdWVzJywgMCwgaW50VmFsdWUpOyAvL9C90L7QstC+0LUg0LfQvdCw0YfQtdC90LjQtSDRgdC70LDQudC00LXRgNCwXHJcbiAgICAgICAgdGhhdC52YWwoaW50VmFsdWUpOyAgLy/Qv9C+0LLRgtGA0L7Rj9C10Lwg0LXQs9C+INC00LvRjyDRgdCw0LzQvtCz0L4g0L/QvtC70Y9cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwcmljZUZpbmlzaENoYW5nZShlKSB7XHJcbiAgICAgICAgdmFyIHRoYXQgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICBzdGFydFJhbmdlID0gcGFyc2VJbnQodGV4dFN0YXJ0LnZhbCgpKSxcclxuICAgICAgICAgICAgc3RyVmFsdWUgPSB0aGF0LnZhbCgpLFxyXG4gICAgICAgICAgICBmaW5pc2hSYW5nZSA9IHBhcnNlSW50KHRoYXQuZGF0YSgncmFuZ2UnKSksXHJcbiAgICAgICAgICAgIGludFZhbHVlID0gcGFyc2VJbnQoc3RyVmFsdWUpIHx8IGZpbmlzaFJhbmdlOy8v0LXRgdC70Lgg0L3QtdC/0YDQsNCy0LjQu9GM0L3Qviwg0YLQviDQvNCw0LrRgdC40LzRg9C8XHJcblxyXG4gICAgICAgIGlmIChpbnRWYWx1ZSA8IHN0YXJ0UmFuZ2UpIHsgLy/QtdGB0LvQuCDQvNC10L3RjNGI0LUg0LTQuNCw0L/QsNC30L7QvdCwLCDRgtC+INC/0L4g0L3QuNC20L3QtdC80YMg0L/RgNC10LTQtdC70YNcclxuICAgICAgICAgICAgaW50VmFsdWUgPSBzdGFydFJhbmdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW50VmFsdWUgPiBmaW5pc2hSYW5nZSkgeyAvL9C10YHQu9C4INCy0YvRiNC1INC00LjQsNC/0LDQt9C+0L3QsCwg0YLQviAg0LLQtdGA0YXQvdC40LzRgyDQv9GA0LXQtNC10LvRg1xyXG4gICAgICAgICAgICBpbnRWYWx1ZSA9IGZpbmlzaFJhbmdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzbGlkZXIuc2xpZGVyKCd2YWx1ZXMnLCAxLCBpbnRWYWx1ZSk7IC8v0L3QvtCy0L7QtSDQt9C90LDRh9C10L3QuNC1INGB0LvQsNC50LTQtdGA0LBcclxuICAgICAgICB0aGF0LnZhbChpbnRWYWx1ZSk7ICAvL9C/0L7QstGC0YDQvtGP0LXQvCDQtdCz0L4g0LTQu9GPINGB0LDQvNC+0LPQviDQv9C+0LvRj1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXh0U3RhcnQub24oJ2NoYW5nZScsIHByaWNlU3RhcnRDaGFuZ2UpOy8v0L/RgNC4INC40LfQvNC10L3QtdC90LjQuNC4INC/0L7Qu9C10Lkg0LLQstC+0LTQsCDRhtC10L3Ri1xyXG4gICAgdGV4dEZpbmlzaC5vbignY2hhbmdlJywgcHJpY2VGaW5pc2hDaGFuZ2UpOy8v0L/RgNC4INC40LfQvNC10L3QtdC90LjQuNC4INC/0L7Qu9C10Lkg0LLQstC+0LTQsCDRhtC10L3Ri1xyXG5cclxufSkoKTsiLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgY29udGVpbmVyO1xyXG4gIHZhciBtb3VzZU92ZXIgPSAwO1xyXG4gIHZhciB0aW1lckNsZWFyQWxsID0gbnVsbDtcclxuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xyXG4gIHZhciB0aW1lID0gMTAwMDA7XHJcblxyXG4gIHZhciBub3RpZmljYXRpb25fYm94ID0gZmFsc2U7XHJcbiAgdmFyIGlzX2luaXQgPSBmYWxzZTtcclxuICB2YXIgY29uZmlybV9vcHQgPSB7XHJcbiAgICAvLyB0aXRsZTogbGcoJ2RlbGV0aW5nJyksXHJcbiAgICAvLyBxdWVzdGlvbjogbGcoJ2FyZV95b3Vfc3VyZV90b19kZWxldGUnKSxcclxuICAgIC8vIGJ1dHRvblllczogbGcoJ3llcycpLFxyXG4gICAgLy8gYnV0dG9uTm86IGxnKCdubycpLFxyXG4gICAgY2FsbGJhY2tZZXM6IGZhbHNlLFxyXG4gICAgY2FsbGJhY2tObzogZmFsc2UsXHJcbiAgICBvYmo6IGZhbHNlLFxyXG4gICAgYnV0dG9uVGFnOiAnZGl2JyxcclxuICAgIGJ1dHRvblllc0RvcDogJycsXHJcbiAgICBidXR0b25Ob0RvcDogJydcclxuICB9O1xyXG4gIHZhciBhbGVydF9vcHQgPSB7XHJcbiAgICB0aXRsZTogXCJcIixcclxuICAgIHF1ZXN0aW9uOiAnbWVzc2FnZScsXHJcbiAgICAvLyBidXR0b25ZZXM6IGxnKCd5ZXMnKSxcclxuICAgIGNhbGxiYWNrWWVzOiBmYWxzZSxcclxuICAgIGJ1dHRvblRhZzogJ2RpdicsXHJcbiAgICBvYmo6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gdGVzdElwaG9uZSgpIHtcclxuICAgIGlmICghLyhpUGhvbmV8aVBhZHxpUG9kKS4qKE9TIDExKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgcmV0dXJuO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XHJcbiAgICBub3RpZmljYXRpb25fYm94LmNzcygndG9wJywgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgIGlzX2luaXQgPSB0cnVlO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveCA9ICQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcbiAgICBpZiAobm90aWZpY2F0aW9uX2JveC5sZW5ndGggPiAwKXJldHVybjtcclxuXHJcbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveCA9ICQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcblxyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCAnLm5vdGlmeV9jb250cm9sJywgY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2Nsb3NlJywgY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsIGNsb3NlTW9kYWxGb24pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpIHtcclxuICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICQoJy5ub3RpZmljYXRpb25fYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoJycpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xvc2VNb2RhbEZvbihlKSB7XHJcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgaWYgKHRhcmdldC5jbGFzc05hbWUgPT0gXCJub3RpZmljYXRpb25fYm94XCIpIHtcclxuICAgICAgY2xvc2VNb2RhbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm5vdGlmaWNhdGlvbl9jbG9zZScsIF9jbG9zZVBvcHVwKTtcclxuICAgICQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkVudGVyKTtcclxuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcclxuICB9O1xyXG5cclxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGlmIChldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwgIT0gbnVsbCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGltZXJDbGVhckFsbCk7XHJcbiAgICAgIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcclxuICAgICAgdmFyIG9wdGlvbiA9ICQodGhpcykuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmIChvcHRpb24udGltZXIpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAxO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgdmFyIG9wdGlvbiA9ICR0aGlzLmRhdGEoJ29wdGlvbicpO1xyXG4gICAgICBpZiAob3B0aW9uLnRpbWUgPiAwKSB7XHJcbiAgICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKG9wdGlvbi5jbG9zZSksIG9wdGlvbi50aW1lIC0gMTUwMCArIDEwMCAqIGkpO1xyXG4gICAgICAgICR0aGlzLmRhdGEoJ29wdGlvbicsIG9wdGlvbilcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAwO1xyXG4gIH07XHJcblxyXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgaWYgKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKTtcclxuICAgICR0aGlzLm9uKGFuaW1hdGlvbkVuZCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xyXG4gICAgfSk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2hpZGUnKVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGFsZXJ0KGRhdGEpIHtcclxuICAgIGlmICghZGF0YSlkYXRhID0ge307XHJcbiAgICBhbGVydF9vcHQgPSBvYmplY3RzKGFsZXJ0X29wdCwge1xyXG4gICAgICAgIGJ1dHRvblllczogbGcoJ3llcycpXHJcbiAgICB9KTtcclxuICAgIGRhdGEgPSBvYmplY3RzKGFsZXJ0X29wdCwgZGF0YSk7XHJcblxyXG4gICAgaWYgKCFpc19pbml0KWluaXQoKTtcclxuICAgIHRlc3RJcGhvbmUoKTtcclxuXHJcbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xyXG4gICAgaWYgKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcyArPSBkYXRhLm5vdHlmeV9jbGFzcztcclxuXHJcbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gJzxkaXY+JytkYXRhLnRpdGxlKyc8L2Rpdj4nO1xyXG4gICAgYm94X2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcclxuICAgIGJveF9odG1sICs9IGRhdGEucXVlc3Rpb247XHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICBpZiAoZGF0YS5idXR0b25ZZXMgfHwgZGF0YS5idXR0b25Obykge1xyXG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8JyArIGRhdGEuYnV0dG9uVGFnICsgJyBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCIgJyArIGRhdGEuYnV0dG9uWWVzRG9wICsgJz4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC8nICsgZGF0YS5idXR0b25UYWcgKyAnPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8JyArIGRhdGEuYnV0dG9uVGFnICsgJyBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIiAnICsgZGF0YS5idXR0b25Ob0RvcCArICc+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC8nICsgZGF0YS5idXR0b25UYWcgKyAnPic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcclxuXHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sIDEwMClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbmZpcm0oZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcclxuICAgIGNvbmZpcm1fb3B0ID0gb2JqZWN0cyhjb25maXJtX29wdCwge1xyXG4gICAgICAgIHRpdGxlOiBsZygnZGVsZXRpbmcnKSxcclxuICAgICAgICBxdWVzdGlvbjogbGcoJ2FyZV95b3Vfc3VyZV90b19kZWxldGUnKSxcclxuICAgICAgICBidXR0b25ZZXM6IGxnKCd5ZXMnKSxcclxuICAgICAgICBidXR0b25ObzogbGcoJ25vJylcclxuICAgIH0pO1xyXG4gICAgZGF0YSA9IG9iamVjdHMoY29uZmlybV9vcHQsIGRhdGEpO1xyXG4gICAgaWYgKHR5cGVvZihkYXRhLmNhbGxiYWNrWWVzKSA9PSAnc3RyaW5nJykge1xyXG4gICAgICB2YXIgY29kZSA9ICdkYXRhLmNhbGxiYWNrWWVzID0gZnVuY3Rpb24oKXsnK2RhdGEuY2FsbGJhY2tZZXMrJ30nO1xyXG4gICAgICBldmFsKGNvZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNfaW5pdClpbml0KCk7XHJcbiAgICB0ZXN0SXBob25lKCk7XHJcbiAgICAvL2JveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XHJcblxyXG4gICAgbm90eWZ5X2NsYXNzID0gJ25vdGlmeV9ib3ggJztcclxuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XHJcblxyXG4gICAgYm94X2h0bWwgPSAnPGRpdiBjbGFzcz1cIicgKyBub3R5ZnlfY2xhc3MgKyAnXCI+JztcclxuXHJcbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCArPSBkYXRhLnRpdGxlO1xyXG4gICAgYm94X2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcclxuICAgIGJveF9odG1sICs9IGRhdGEucXVlc3Rpb247XHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICBpZiAoZGF0YS5idXR0b25ZZXMgfHwgZGF0YS5idXR0b25Obykge1xyXG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xyXG5cclxuICAgIGlmIChkYXRhLmNhbGxiYWNrWWVzICE9IGZhbHNlKSB7XHJcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5feWVzJykub24oJ2NsaWNrJywgZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoZGF0YS5jYWxsYmFja05vICE9IGZhbHNlKSB7XHJcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrTm8uYmluZChkYXRhLm9iaikpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LCAxMDApXHJcblxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcclxuICAgIGlmICghZGF0YSlkYXRhID0ge307XHJcbiAgICB2YXIgb3B0aW9uID0ge3RpbWU6IChkYXRhLnRpbWUgfHwgZGF0YS50aW1lID09PSAwKSA/IGRhdGEudGltZSA6IHRpbWV9O1xyXG4gICAgaWYgKCFjb250ZWluZXIpIHtcclxuICAgICAgY29udGVpbmVyID0gJCgnPHVsLz4nLCB7XHJcbiAgICAgICAgJ2NsYXNzJzogJ25vdGlmaWNhdGlvbl9jb250YWluZXInXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgJCgnYm9keScpLmFwcGVuZChjb250ZWluZXIpO1xyXG4gICAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbGkgPSAkKCc8bGkvPicsIHtcclxuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25faXRlbSdcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChkYXRhLnR5cGUpIHtcclxuICAgICAgbGkuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9pdGVtLScgKyBkYXRhLnR5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjbG9zZSA9ICQoJzxzcGFuLz4nLCB7XHJcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2Nsb3NlJ1xyXG4gICAgfSk7XHJcbiAgICBvcHRpb24uY2xvc2UgPSBjbG9zZTtcclxuICAgIGxpLmFwcGVuZChjbG9zZSk7XHJcblxyXG4gICAgdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgdGl0bGUgPSAkKCc8aDUvPicsIHtcclxuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxyXG4gICAgICB9KTtcclxuICAgICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcclxuICAgICAgY29udGVudC5hcHBlbmQodGl0bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0ZXh0ID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGV4dFwiXHJcbiAgICB9KTtcclxuICAgIHRleHQuaHRtbChkYXRhLm1lc3NhZ2UpO1xyXG5cclxuICAgIGlmIChkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXHJcbiAgICAgIH0pO1xyXG4gICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xyXG4gICAgICB2YXIgd3JhcCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgICBjbGFzczogXCJ3cmFwXCJcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB3cmFwLmFwcGVuZChpbWcpO1xyXG4gICAgICB3cmFwLmFwcGVuZCh0ZXh0KTtcclxuICAgICAgY29udGVudC5hcHBlbmQod3JhcCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh0ZXh0KTtcclxuICAgIH1cclxuICAgIGxpLmFwcGVuZChjb250ZW50KTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XHJcbiAgICAvLyAgIHZhciB0aXRsZSA9ICQoJzxwLz4nLCB7XHJcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcclxuICAgIC8vICAgfSk7XHJcbiAgICAvLyAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XHJcbiAgICAvLyAgIGxpLmFwcGVuZCh0aXRsZSk7XHJcbiAgICAvLyB9XHJcbiAgICAvL1xyXG4gICAgLy8gaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcclxuICAgIC8vICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcclxuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcclxuICAgIC8vICAgfSk7XHJcbiAgICAvLyAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xyXG4gICAgLy8gICBsaS5hcHBlbmQoaW1nKTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xyXG4gICAgLy8gICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcclxuICAgIC8vIH0pO1xyXG4gICAgLy8gY29udGVudC5odG1sKGRhdGEubWVzc2FnZSk7XHJcbiAgICAvL1xyXG4gICAgLy8gbGkuYXBwZW5kKGNvbnRlbnQpO1xyXG4gICAgLy9cclxuICAgIGNvbnRlaW5lci5hcHBlbmQobGkpO1xyXG5cclxuICAgIGlmIChvcHRpb24udGltZSA+IDApIHtcclxuICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKGNsb3NlKSwgb3B0aW9uLnRpbWUpO1xyXG4gICAgfVxyXG4gICAgbGkuZGF0YSgnb3B0aW9uJywgb3B0aW9uKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGFsZXJ0OiBhbGVydCxcclxuICAgIGNvbmZpcm06IGNvbmZpcm0sXHJcbiAgICBub3RpZmk6IG5vdGlmaVxyXG4gIH07XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gIGVsID0gJCgkdGhpcy5hdHRyKCdocmVmJykpO1xyXG4gIGRhdGEgPSBlbC5kYXRhKCk7XHJcblxyXG4gIGRhdGEucXVlc3Rpb24gPSBlbC5odG1sKCk7XHJcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG59KTtcclxuXHJcbiQoJ1tyZWY9Y29uZmlybV0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XHJcbiAgZGF0YSA9IGVsLmRhdGEoKTtcclxuICBkYXRhLnF1ZXN0aW9uID0gZWwuaHRtbCgpO1xyXG4gIG5vdGlmaWNhdGlvbi5jb25maXJtKGRhdGEpO1xyXG59KTtcclxuXHJcblxyXG4kKCcuZGlzYWJsZWQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgZGF0YSA9ICR0aGlzLmRhdGEoKTtcclxuICBpZiAoZGF0YVsnYnV0dG9uX3llcyddKSB7XHJcbiAgICBkYXRhWydidXR0b25ZZXMnXSA9IGRhdGFbJ2J1dHRvbl95ZXMnXTtcclxuICB9XHJcbiAgaWYgKGRhdGFbJ2J1dHRvbl95ZXMnXSA9PT0gZmFsc2UpIHtcclxuICAgIGRhdGFbJ2J1dHRvblllcyddID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcbn0pOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcubW9kYWxzX29wZW4nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG5cclxuICAgIC8v0L/RgNC4INC+0YLQutGA0YvRgtC40Lgg0YTQvtGA0LzRiyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4INC30LDQutGA0YvRgtGMLCDQtdGB0LvQuCDQvtGC0YDRi9GC0L4gLSDQv9C+0L/QsNC/INC40YHQv9C+0LvRjNC30L7QstCw0L3QuNGPINC60YPQv9C+0L3QsCDQsdC10Lcg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuFxyXG4gICAgdmFyIHBvcHVwID0gJChcImFbaHJlZj0nI3Nob3dwcm9tb2NvZGUtbm9yZWdpc3RlciddXCIpLmRhdGEoJ3BvcHVwJyk7XHJcbiAgICBpZiAocG9wdXApIHtcclxuICAgICAgcG9wdXAuY2xvc2UoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHBvcHVwID0gJCgnZGl2LnBvcHVwX2NvbnQsIGRpdi5wb3B1cF9iYWNrJyk7XHJcbiAgICAgIGlmIChwb3B1cCkge1xyXG4gICAgICAgIHBvcHVwLmhpZGUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBocmVmID0gdGhpcy5ocmVmLnNwbGl0KCcjJyk7XHJcbiAgICBocmVmID0gaHJlZltocmVmLmxlbmd0aCAtIDFdO1xyXG4gICAgdmFyIG5vdHlDbGFzcyA9ICQodGhpcykuZGF0YSgnbm90eWNsYXNzJyk7XHJcbiAgICB2YXIgY2xhc3NfbmFtZT0oaHJlZi5pbmRleE9mKCd2aWRlbycpID09PSAwID8gJ21vZGFscy1mdWxsX3NjcmVlbicgOiAnbm90aWZ5X3doaXRlJykgKyAnICcgKyBub3R5Q2xhc3M7XHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgYnV0dG9uWWVzOiBmYWxzZSxcclxuICAgICAgbm90eWZ5X2NsYXNzOiBcImxvYWRpbmcgXCIgKyBjbGFzc19uYW1lLFxyXG4gICAgICBxdWVzdGlvbjogJydcclxuICAgIH07XHJcbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcblxyXG4gICAgJC5nZXQoJy8nICsgaHJlZiwgZnVuY3Rpb24gKGRhdGEpIHtcclxuXHJcbiAgICAgIHZhciBkYXRhX21zZyA9IHtcclxuICAgICAgICBidXR0b25ZZXM6IGZhbHNlLFxyXG4gICAgICAgIG5vdHlmeV9jbGFzczogY2xhc3NfbmFtZSxcclxuICAgICAgICBxdWVzdGlvbjogZGF0YS5odG1sLFxyXG4gICAgICB9O1xyXG5cclxuICAgICAgaWYgKGRhdGEudGl0bGUpIHtcclxuICAgICAgICBkYXRhX21zZ1sndGl0bGUnXT1kYXRhLnRpdGxlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKmlmKGRhdGEuYnV0dG9uWWVzKXtcclxuICAgICAgICBkYXRhX21zZ1snYnV0dG9uWWVzJ109ZGF0YS5idXR0b25ZZXM7XHJcbiAgICAgIH0qL1xyXG4gICAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YV9tc2cpO1xyXG4gICAgICBhamF4Rm9ybSgkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKSk7XHJcbiAgICB9LCAnanNvbicpO1xyXG5cclxuICAgIC8vY29uc29sZS5sb2codGhpcyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcblxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm1vZGFsc19wb3B1cCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAvL9C/0YDQuCDQutC70LjQutC1INCy0YHQv9C70YvQstCw0YjQutCwINGBINGC0LXQutGB0YLQvtC8XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgdGl0bGUgPSAkKHRoYXQpLmRhdGEoJ29yaWdpbmFsLWgnKTtcclxuICAgIGlmKCF0aXRsZSl0aXRsZT1cIlwiO1xyXG4gICAgdmFyIGh0bWwgPSAkKCcjJyArICQodGhhdCkuZGF0YSgnb3JpZ2luYWwtaHRtbCcpKS5odG1sKCk7XHJcbiAgICB2YXIgY29udGVudCA9IGh0bWwgPyBodG1sIDogJCh0aGF0KS5kYXRhKCdvcmlnaW5hbC10aXRsZScpO1xyXG4gICAgdmFyIG5vdHlDbGFzcyA9ICQodGhhdCkuZGF0YSgnbm90eWNsYXNzJyk7XHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgYnV0dG9uWWVzOiBmYWxzZSxcclxuICAgICAgbm90eWZ5X2NsYXNzOiBcIm5vdGlmeV93aGl0ZSBcIiArIG5vdHlDbGFzcyxcclxuICAgICAgcXVlc3Rpb246IGNvbnRlbnQsXHJcbiAgICAgIHRpdGxlOiB0aXRsZVxyXG4gICAgfTtcclxuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSlcclxufSgpKTtcclxuIiwiJCgnLmZvb3Rlci1tZW51LXRpdGxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgaWYgKCR0aGlzLmhhc0NsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJykpIHtcclxuICAgICR0aGlzLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJylcclxuICB9IGVsc2Uge1xyXG4gICAgJCgnLmZvb3Rlci1tZW51LXRpdGxlX29wZW4nKS5yZW1vdmVDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpO1xyXG4gICAgJHRoaXMuYWRkQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKTtcclxuICB9XHJcblxyXG59KTtcclxuIiwiJChmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gc3Rhck5vbWluYXRpb24oaW5kZXgpIHtcclxuICAgIHZhciBzdGFycyA9ICQoXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIpO1xyXG4gICAgc3RhcnMuYWRkQ2xhc3MoXCJyYXRpbmctc3Rhci1vcGVuXCIpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XHJcbiAgICAgIHN0YXJzLmVxKGkpLnJlbW92ZUNsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKFwibW91c2VvdmVyXCIsIFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcbiAgfSkub24oXCJtb3VzZWxlYXZlXCIsIFwiLnJhdGluZy13cmFwcGVyXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgpKTtcclxuICB9KS5vbihcImNsaWNrXCIsIFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcblxyXG4gICAgJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcbiAgfSk7XHJcbn0pO1xyXG4iLCIvL9C40LfQsdGA0LDQvdC90L7QtVxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgJChcIi5mYXZvcml0ZS1saW5rXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHR5cGUgPSBzZWxmLmRhdGEoXCJzdGF0ZVwiKSxcclxuICAgICAgYWZmaWxpYXRlX2lkID0gc2VsZi5kYXRhKFwiYWZmaWxpYXRlLWlkXCIpLFxyXG4gICAgICBwcm9kdWN0X2lkID0gc2VsZi5kYXRhKFwicHJvZHVjdC1pZFwiKTtcclxuXHJcbiAgICBpZiAoIWFmZmlsaWF0ZV9pZCkge1xyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICB0aXRsZTogbGcoXCJyZWdpc3RyYXRpb25faXNfcmVxdWlyZWRcIiksXHJcbiAgICAgICAgbWVzc2FnZTogbGcoXCJhZGRfdG9fZmF2b3JpdGVfbWF5X29ubHlfcmVnaXN0ZXJlZF91c2VyXCIpLFxyXG4gICAgICAgIHR5cGU6ICdlcnInXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZWxmLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgc2VsZi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuXHJcbiAgICAvKmlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgIHNlbGYuZmluZChcIi5pdGVtX2ljb25cIikucmVtb3ZlQ2xhc3MoXCJtdXRlZFwiKTtcclxuICAgICB9Ki9cclxuXHJcbiAgICAkLnBvc3QoXCIvYWNjb3VudC9mYXZvcml0ZXNcIiwge1xyXG4gICAgICBcInR5cGVcIjogdHlwZSxcclxuICAgICAgXCJhZmZpbGlhdGVfaWRcIjogYWZmaWxpYXRlX2lkLFxyXG4gICAgICBcInByb2R1Y3RfaWRcIjogcHJvZHVjdF9pZFxyXG4gICAgfSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgaWYgKGRhdGEuZXJyb3IpIHtcclxuICAgICAgICBzZWxmLmZpbmQoJ3N2ZycpLnJlbW92ZUNsYXNzKFwic3BpblwiKTtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOiBkYXRhLmVycm9yLCB0eXBlOiAnZXJyJywgJ3RpdGxlJzogKGRhdGEudGl0bGUgPyBkYXRhLnRpdGxlIDogZmFsc2UpfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICBtZXNzYWdlOiBkYXRhLm1zZyxcclxuICAgICAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICAgICAgJ3RpdGxlJzogKGRhdGEudGl0bGUgPyBkYXRhLnRpdGxlIDogZmFsc2UpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgc2VsZi5kYXRhKFwic3RhdGVcIiwgZGF0YVtcImRhdGEtc3RhdGVcIl0pO1xyXG4gICAgICBzZWxmLmRhdGEoXCJvcmlnaW5hbC10aXRsZVwiLCBkYXRhW1wiZGF0YS1vcmlnaW5hbC10aXRsZVwiXSk7XHJcbiAgICAgIHNlbGYuZmluZCgnLnRpdGxlJykuaHRtbChkYXRhW1wiZGF0YS1vcmlnaW5hbC10aXRsZVwiXSk7XHJcblxyXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb2ZmXCIpLmFkZENsYXNzKFwiaW5fZmF2X29uXCIpO1xyXG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJkZWxldGVcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gaW5fZmF2X29uXCIpLmFkZENsYXNzKFwiaW5fZmF2X29mZlwiKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sICdqc29uJykuZmFpbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgIG1lc3NhZ2U6IGxnKFwidGhlcmVfaXNfdGVjaG5pY2FsX3dvcmtzX25vd1wiKSxcclxuICAgICAgICB0eXBlOiAnZXJyJ1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmICh0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluIGluX2Zhdl9vZmZcIikuYWRkQ2xhc3MoXCJpbl9mYXZfb25cIik7XHJcbiAgICAgICAgc2VsZi5kYXRhKCdvcmlnaW5hbC10aXRsZScsIGxnKFwiZmF2b3JpdGVzX3Nob3BfcmVtb3ZlXCIrKHByb2R1Y3RfaWQgPyAnX3Byb2R1Y3QnIDogJycpKSk7XHJcbiAgICAgICAgc2VsZi5maW5kKCcudGl0bGUnKS5odG1sKGxnKFwiZmF2b3JpdGVzX3Nob3BfcmVtb3ZlXCIrKHByb2R1Y3RfaWQgPyAnX3Byb2R1Y3QnIDogJycpKSk7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRlbGV0ZVwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBpbl9mYXZfb25cIikuYWRkQ2xhc3MoXCJpbl9mYXZfb2ZmXCIpO1xyXG4gICAgICAgIHNlbGYuZGF0YSgnb3JpZ2luYWwtdGl0bGUnLCBsZyhcImZhdm9yaXRlc19zaG9wX2FkZFwiKyhwcm9kdWN0X2lkID8gJ19wcm9kdWN0JyA6ICcnKSkpO1xyXG4gICAgICAgIHNlbGYuZmluZCgnLnRpdGxlJykuaHRtbChsZyhcImZhdm9yaXRlc19zaG9wX2FkZFwiKyhwcm9kdWN0X2lkID8gJ19wcm9kdWN0JyA6ICcnKSkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSlcclxuICB9KTtcclxufSk7XHJcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAkKCcuc2Nyb2xsX3RvJykuY2xpY2soZnVuY3Rpb24gKGUpIHsgLy8g0LvQvtCy0LjQvCDQutC70LjQuiDQv9C+INGB0YHRi9C70LrQtSDRgSDQutC70LDRgdGB0L7QvCBnb190b1xyXG4gICAgdmFyIHNjcm9sbF9lbCA9ICQodGhpcykuYXR0cignaHJlZicpOyAvLyDQstC+0LfRjNC80LXQvCDRgdC+0LTQtdGA0LbQuNC80L7QtSDQsNGC0YDQuNCx0YPRgtCwIGhyZWYsINC00L7Qu9C20LXQvSDQsdGL0YLRjCDRgdC10LvQtdC60YLQvtGA0L7QvCwg0YIu0LUuINC90LDQv9GA0LjQvNC10YAg0L3QsNGH0LjQvdCw0YLRjNGB0Y8g0YEgIyDQuNC70LggLlxyXG4gICAgc2Nyb2xsX2VsID0gJChzY3JvbGxfZWwpO1xyXG4gICAgaWYgKHNjcm9sbF9lbC5sZW5ndGggIT0gMCkgeyAvLyDQv9GA0L7QstC10YDQuNC8INGB0YPRidC10YHRgtCy0L7QstCw0L3QuNC1INGN0LvQtdC80LXQvdGC0LAg0YfRgtC+0LHRiyDQuNC30LHQtdC20LDRgtGMINC+0YjQuNCx0LrQuFxyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IHNjcm9sbF9lbC5vZmZzZXQoKS50b3AgLSAkKCcjaGVhZGVyPionKS5lcSgwKS5oZWlnaHQoKSAtIDUwfSwgNTAwKTsgLy8g0LDQvdC40LzQuNGA0YPQtdC8INGB0LrRgNC+0L7Qu9C40L3QsyDQuiDRjdC70LXQvNC10L3RgtGDIHNjcm9sbF9lbFxyXG4gICAgICBpZiAoc2Nyb2xsX2VsLmhhc0NsYXNzKCdhY2NvcmRpb24nKSAmJiAhc2Nyb2xsX2VsLmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgICAgICBzY3JvbGxfZWwuZmluZCgnLmFjY29yZGlvbi1jb250cm9sJykuY2xpY2soKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlOyAvLyDQstGL0LrQu9GO0YfQsNC10Lwg0YHRgtCw0L3QtNCw0YDRgtC90L7QtSDQtNC10LnRgdGC0LLQuNC1XHJcbiAgfSk7XHJcbn0pO1xyXG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgJChcImJvZHlcIikub24oJ2NsaWNrJywgJy5zZXRfY2xpcGJvYXJkJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICBjb3B5VG9DbGlwYm9hcmQoJHRoaXMuZGF0YSgnY2xpcGJvYXJkJyksICR0aGlzLmRhdGEoJ2NsaXBib2FyZC1ub3RpZnknKSk7XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGNvcHlUb0NsaXBib2FyZChjb2RlLCBtc2cpIHtcclxuICAgIHZhciAkdGVtcCA9ICQoXCI8aW5wdXQ+XCIpO1xyXG4gICAgJChcImJvZHlcIikuYXBwZW5kKCR0ZW1wKTtcclxuICAgICR0ZW1wLnZhbChjb2RlKS5zZWxlY3QoKTtcclxuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiY29weVwiKTtcclxuICAgICR0ZW1wLnJlbW92ZSgpO1xyXG5cclxuICAgIGlmICghbXNnKSB7XHJcbiAgICAgIG1zZyA9IGxnKFwiZGF0YV9jb3BpZWRfdG9fY2xpcGJvYXJkXCIpO1xyXG4gICAgfVxyXG4gICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7J3R5cGUnOiAnaW5mbycsICdtZXNzYWdlJzogbXNnLCAndGl0bGUnOiBsZygnc3VjY2VzcycpfSlcclxuICB9XHJcblxyXG4gICQoXCJib2R5XCIpLm9uKCdjbGljaycsIFwiaW5wdXQubGlua1wiLCBmdW5jdGlvbiAoKSB7XHQvLyDQv9C+0LvRg9GH0LXQvdC40LUg0YTQvtC60YPRgdCwINGC0LXQutGB0YLQvtCy0YvQvCDQv9C+0LvQtdC8LdGB0YHRi9C70LrQvtC5XHJcbiAgICAkKHRoaXMpLnNlbGVjdCgpO1xyXG4gIH0pO1xyXG59KTtcclxuIiwiLy/RgdC60LDRh9C40LLQsNC90LjQtSDQutCw0YDRgtC40L3QvtC6XHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCkge1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGltZyA9IGRhdGEuaW1nO1xyXG4gICAgaW1nLndyYXAoJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPjwvZGl2PicpO1xyXG4gICAgdmFyIHdyYXAgPSBpbWcucGFyZW50KCk7XHJcbiAgICAkKCcuZG93bmxvYWRfdGVzdCcpLmFwcGVuZChkYXRhLmVsKTtcclxuICAgIHNpemUgPSBkYXRhLmVsLndpZHRoKCkgKyBcInhcIiArIGRhdGEuZWwuaGVpZ2h0KCk7XHJcblxyXG4gICAgdz1kYXRhLmVsLndpZHRoKCkqMC44O1xyXG4gICAgaW1nXHJcbiAgICAgIC5oZWlnaHQoJ2F1dG8nKVxyXG4gICAgICAvLy53aWR0aCh3KVxyXG4gICAgICAuY3NzKCdtYXgtd2lkdGgnLCc5OSUnKTtcclxuXHJcblxyXG4gICAgZGF0YS5lbC5yZW1vdmUoKTtcclxuICAgIHdyYXAuYXBwZW5kKCc8c3Bhbj4nICsgc2l6ZSArICc8L3NwYW4+IDxhIGhyZWY9XCInICsgZGF0YS5zcmMgKyAnXCIgZG93bmxvYWQ+JytsZyhcImRvd25sb2FkXCIpKyc8L2E+Jyk7XHJcbiAgfVxyXG5cclxuICB2YXIgaW1ncyA9ICQoJy5kb3dubG9hZHNfaW1nIGltZycpO1xyXG4gIGlmKGltZ3MubGVuZ3RoPT0wKXJldHVybjtcclxuXHJcbiAgJCgnYm9keScpLmFwcGVuZCgnPGRpdiBjbGFzcz1kb3dubG9hZF90ZXN0PjwvZGl2PicpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGltZyA9IGltZ3MuZXEoaSk7XHJcbiAgICB2YXIgc3JjID0gaW1nLmF0dHIoJ3NyYycpO1xyXG4gICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XHJcbiAgICAgIHNyYzogc3JjXHJcbiAgICB9KTtcclxuICAgIGRhdGEgPSB7XHJcbiAgICAgIHNyYzogc3JjLFxyXG4gICAgICBpbWc6IGltZyxcclxuICAgICAgZWw6IGltYWdlXHJcbiAgICB9O1xyXG4gICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcclxuICB9XHJcbn0pKCk7XHJcblxyXG4vL9GH0YLQviDQsSDQuNGE0YDQtdC50LzRiyDQuCDQutCw0YDRgtC40L3QutC4INC90LUg0LLRi9C70LDQt9C40LvQuFxyXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gIC8qbV93ID0gJCgnLnRleHQtY29udGVudCcpLndpZHRoKClcclxuICAgaWYgKG1fdyA8IDUwKW1fdyA9IHNjcmVlbi53aWR0aCAtIDQwKi9cclxuICB2YXIgbXc9c2NyZWVuLndpZHRoLTQwO1xyXG5cclxuICBmdW5jdGlvbiBvcHRpbWFzZShlbCl7XHJcbiAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50KCk7XHJcbiAgICBpZihwYXJlbnQubGVuZ3RoPT0wIHx8IHBhcmVudFswXS50YWdOYW1lPT1cIkFcIil7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmKGVsLmhhc0NsYXNzKCdub19vcHRvbWl6ZScpKXJldHVybjtcclxuXHJcbiAgICBtX3cgPSBwYXJlbnQud2lkdGgoKS0zMDtcclxuICAgIHZhciB3PWVsLndpZHRoKCk7XHJcblxyXG4gICAgLy/QsdC10Lcg0Y3RgtC+0LPQviDQv9C70Y7RidC40YIg0LHQsNC90LXRgNGLINCyINCw0LrQsNGA0LTQuNC+0L3QtVxyXG4gICAgaWYodzwzIHx8IG1fdzwzKXtcclxuICAgICAgZWxcclxuICAgICAgICAuaGVpZ2h0KCdhdXRvJylcclxuICAgICAgICAuY3NzKCdtYXgtd2lkdGgnLCc5OSUnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGVsLndpZHRoKCdhdXRvJyk7XHJcbiAgICBpZihlbFswXS50YWdOYW1lPT1cIklNR1wiICYmIHc+ZWwud2lkdGgoKSl3PWVsLndpZHRoKCk7XHJcblxyXG4gICAgaWYgKG13PjUwICYmIG1fdyA+IG13KW1fdyA9IG13O1xyXG4gICAgaWYgKHc+bV93KSB7XHJcbiAgICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpe1xyXG4gICAgICAgIGsgPSB3IC8gbV93O1xyXG4gICAgICAgIGVsLmhlaWdodChlbC5oZWlnaHQoKSAvIGspO1xyXG4gICAgICB9XHJcbiAgICAgIGVsLndpZHRoKG1fdylcclxuICAgIH1lbHNle1xyXG4gICAgICBlbC53aWR0aCh3KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xyXG4gICAgdmFyIGVsPSQodGhpcyk7XHJcbiAgICBvcHRpbWFzZShlbCk7XHJcbiAgfVxyXG5cclxuICB2YXIgcCA9ICQoJy5jb250ZW50LXdyYXAgaW1nLC5jb250ZW50LXdyYXAgaWZyYW1lJyk7XHJcbiAgJCgnLmNvbnRlbnQtd3JhcCBpbWc6bm90KC5ub19vcHRvbWl6ZSknKS5oZWlnaHQoJ2F1dG8nKTtcclxuICAvLyQoJy5jb250YWluZXIgaW1nJykud2lkdGgoJ2F1dG8nKTtcclxuICBmb3IgKGkgPSAwOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgZWwgPSBwLmVxKGkpO1xyXG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIikge1xyXG4gICAgICBvcHRpbWFzZShlbCk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgdmFyIHNyYz1lbC5hdHRyKCdzcmMnKTtcclxuICAgICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XHJcbiAgICAgICAgc3JjOiBzcmNcclxuICAgICAgfSk7XHJcbiAgICAgIGltYWdlLm9uKCdsb2FkJywgaW1nX2xvYWRfZmluaXNoLmJpbmQoZWwpKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuXHJcbi8v0J/RgNC+0LLQtdGA0LrQsCDQsdC40YLRiyDQutCw0YDRgtC40L3QvtC6LlxyXG4vLyAhISEhISFcclxuLy8g0J3Rg9C20L3QviDQv9GA0L7QstC10YDQuNGC0YwuINCS0YvQt9GL0LLQsNC70L4g0LPQu9GO0LrQuCDQv9GA0Lgg0LDQstGC0L7RgNC30LDRhtC40Lgg0YfQtdGA0LXQtyDQpNCRINC90LAg0YHQsNGE0LDRgNC4XHJcbi8vICEhISEhIVxyXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xyXG4gICAgdmFyIGRhdGE9dGhpcztcclxuICAgIGlmKGRhdGEudGFnTmFtZSl7XHJcbiAgICAgIGRhdGE9JChkYXRhKS5kYXRhKCdkYXRhJyk7XHJcbiAgICB9XHJcbiAgICB2YXIgaW1nPWRhdGEuaW1nO1xyXG4gICAgLy92YXIgdG49aW1nWzBdLnRhZ05hbWU7XHJcbiAgICAvL2lmICh0biE9J0lNRyd8fHRuIT0nRElWJ3x8dG4hPSdTUEFOJylyZXR1cm47XHJcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcclxuICAgICAgaW1nLmF0dHIoJ3NyYycsIGRhdGEuc3JjKTtcclxuICAgIH1lbHNle1xyXG4gICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XHJcbiAgICAgIGltZy5yZW1vdmVDbGFzcygnbm9fYXZhJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB0ZXN0SW1nKGltZ3Msbm9faW1nKXtcclxuICAgIGlmKCFpbWdzIHx8IGltZ3MubGVuZ3RoPT0wKXJldHVybjtcclxuXHJcbiAgICBpZighbm9faW1nKW5vX2ltZz0nL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZyc7XHJcblxyXG4gICAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcclxuICAgICAgdmFyIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgICBpZihpbWcuaGFzQ2xhc3MoJ25vX2F2YScpKXtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGRhdGE9e1xyXG4gICAgICAgIGltZzppbWdcclxuICAgICAgfTtcclxuICAgICAgdmFyIHNyYztcclxuICAgICAgaWYoaW1nWzBdLnRhZ05hbWU9PVwiSU1HXCIpe1xyXG4gICAgICAgIGRhdGEudHlwZT0wO1xyXG4gICAgICAgIHNyYz1pbWcuYXR0cignc3JjJyk7XHJcbiAgICAgICAgaW1nLmF0dHIoJ3NyYycsbm9faW1nKTtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgZGF0YS50eXBlPTE7XHJcbiAgICAgICAgc3JjPWltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKTtcclxuICAgICAgICBpZighc3JjKWNvbnRpbnVlO1xyXG4gICAgICAgIHNyYz1zcmMucmVwbGFjZSgndXJsKFwiJywnJyk7XHJcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCdcIiknLCcnKTtcclxuICAgICAgICAvL9CyINGB0YTRhNCw0YDQuCDQsiDQvNCw0Log0L7RgSDQsdC10Lcg0LrQvtCy0YvRh9C10LouINCy0LXQt9C00LUg0YEg0LrQsNCy0YvRh9C60LDQvNC4XHJcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCd1cmwoJywnJyk7XHJcbiAgICAgICAgc3JjPXNyYy5yZXBsYWNlKCcpJywnJyk7XHJcbiAgICAgICAgaW1nLmFkZENsYXNzKCdub19hdmEnKTtcclxuICAgICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrbm9faW1nKycpJyk7XHJcbiAgICAgIH1cclxuICAgICAgZGF0YS5zcmM9c3JjO1xyXG4gICAgICB2YXIgaW1hZ2U9JCgnPGltZy8+Jyx7XHJcbiAgICAgICAgc3JjOnNyY1xyXG4gICAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpO1xyXG4gICAgICBpbWFnZS5kYXRhKCdkYXRhJyxkYXRhKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8v0YLQtdGB0YIg0LvQvtCz0L4g0LzQsNCz0LDQt9C40L3QsFxyXG4gIHZhciBpbWdzPSQoJ3NlY3Rpb246bm90KC5uYXZpZ2F0aW9uKScpO1xyXG4gIGltZ3M9aW1ncy5maW5kKCcubG9nbyBpbWcnKTtcclxuICB0ZXN0SW1nKGltZ3MsJy9pbWFnZXMvdGVtcGxhdGUtbG9nby5qcGcnKTtcclxuXHJcbiAgLy/RgtC10YHRgiDQsNCy0LDRgtCw0YDQvtC6INCyINC60L7QvNC10L3RgtCw0YDQuNGP0YVcclxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvLC5zY3JvbGxfYm94LWF2YXRhcicpO1xyXG4gIHRlc3RJbWcoaW1ncywnL2ltYWdlcy9ub19hdmFfc3F1YXJlLnBuZycpO1xyXG59KTtcclxuIiwiLy/QtdGB0LvQuCDQvtGC0LrRgNGL0YLQviDQutCw0Log0LTQvtGH0LXRgNC90LXQtVxyXG4oZnVuY3Rpb24gKCkge1xyXG4gIGlmICghd2luZG93Lm9wZW5lcilyZXR1cm47XHJcbiAgdHJ5IHtcclxuICAgIGhyZWYgPSB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY7XHJcbiAgICBpZiAoXHJcbiAgICAgIGhyZWYuaW5kZXhPZignYWNjb3VudC9vZmZsaW5lJykgPiAwXHJcbiAgICApIHtcclxuICAgICAgd2luZG93LnByaW50KClcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZG9jdW1lbnQucmVmZXJyZXIuaW5kZXhPZignc2VjcmV0ZGlzY291bnRlcicpIDwgMClyZXR1cm47XHJcblxyXG4gICAgaWYgKFxyXG4gICAgICBocmVmLmluZGV4T2YoJ3NvY2lhbHMnKSA+IDAgfHxcclxuICAgICAgaHJlZi5pbmRleE9mKCdsb2dpbicpID4gMCB8fFxyXG4gICAgICBocmVmLmluZGV4T2YoJ2FkbWluJykgPiAwIHx8XHJcbiAgICAgIGhyZWYuaW5kZXhPZignYWNjb3VudCcpID4gMFxyXG4gICAgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaHJlZi5pbmRleE9mKCdzdG9yZScpID4gMCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpID4gMCB8fCBocmVmLmluZGV4T2YoJ3NldHRpbmdzJykgPiAwKSB7XHJcbiAgICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xyXG4gICAgfVxyXG4gICAgd2luZG93LmNsb3NlKCk7XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcblxyXG4gIH1cclxufSkoKTtcclxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgdmFyIGZpbGUgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcclxuICAgIHZhciBmID0gZmlsZVswXTtcclxuICAgIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cclxuICAgIGlmICghZi50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgZGF0YSA9IHtcclxuICAgICAgJ2VsJzogdGhpcyxcclxuICAgICAgJ2YnOiBmXHJcbiAgICB9O1xyXG4gICAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpbWcgPSAkKCdbZm9yPVwiJyArIGRhdGEuZWwubmFtZSArICdcIl0nKTtcclxuICAgICAgICBpZiAoaW1nLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGltZy5hdHRyKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfSkoZGF0YSk7XHJcbiAgICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXHJcbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmR1YmxpY2F0ZV92YWx1ZScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHNlbCA9ICQoJHRoaXMuZGF0YSgnc2VsZWN0b3InKSk7XHJcbiAgICBzZWwudmFsKHRoaXMudmFsdWUpO1xyXG4gIH0pXHJcbn0pO1xyXG4iLCJcclxuZnVuY3Rpb24gZ2V0Q29va2llKG4pIHtcclxuICByZXR1cm4gdW5lc2NhcGUoKFJlZ0V4cChuICsgJz0oW147XSspJykuZXhlYyhkb2N1bWVudC5jb29raWUpIHx8IFsxLCAnJ10pWzFdKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsIHZhbHVlLCBkYXlzKSB7XHJcbiAgdmFyIGV4cGlyZXMgPSAnJztcclxuICBpZiAoZGF5cykge1xyXG4gICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlO1xyXG4gICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBkYXlzKTtcclxuICAgICAgZXhwaXJlcyA9ICc7IGV4cGlyZXM9JyArIGRhdGUudG9VVENTdHJpbmcoKTtcclxuICB9XHJcbiAgZG9jdW1lbnQuY29va2llID0gbmFtZSArIFwiPVwiICsgZXNjYXBlICggdmFsdWUgKSArIGV4cGlyZXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVyYXNlQ29va2llKG5hbWUpe1xyXG4gIHZhciBjb29raWVfc3RyaW5nID0gbmFtZSArIFwiPTBcIiArXCI7IGV4cGlyZXM9V2VkLCAwMSBPY3QgMjAxNyAwMDowMDowMCBHTVRcIjtcclxuICBkb2N1bWVudC5jb29raWUgPSBjb29raWVfc3RyaW5nO1xyXG59XHJcblxyXG5kb2N1bWVudC5jb29raWUuc3BsaXQoXCI7XCIpLmZvckVhY2goZnVuY3Rpb24oYykgeyBkb2N1bWVudC5jb29raWUgPSBjLnJlcGxhY2UoL14gKy8sIFwiXCIpLnJlcGxhY2UoLz0uKi8sIFwiPTtleHBpcmVzPVwiICsgbmV3IERhdGUoKS50b1VUQ1N0cmluZygpICsgXCI7cGF0aD0vXCIpOyB9KTtcclxuXHJcblxyXG5mdW5jdGlvbiBzZXRDb29raWVBamF4KG5hbWUsIHZhbHVlLCBkYXlzKSB7XHJcbiAgICAkLnBvc3QoJy9jb29raWUnLCB7bmFtZTpuYW1lLCB2YWx1ZTp2YWx1ZSwgZGF5czpkYXlzfSwgZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgaWYgKGRhdGEuZXJyb3IgIT09IDApIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgJ2pzb24nKTtcclxufSIsIihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICB2YXIgdGFibGVzID0gJCgndGFibGUuYWRhcHRpdmUnKTtcclxuXHJcbiAgaWYgKHRhYmxlcy5sZW5ndGggPT0gMClyZXR1cm47XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyB0YWJsZXMubGVuZ3RoID4gaTsgaSsrKSB7XHJcbiAgICB2YXIgdGFibGUgPSB0YWJsZXMuZXEoaSk7XHJcbiAgICB2YXIgdGggPSB0YWJsZS5maW5kKCd0aGVhZCcpO1xyXG4gICAgaWYgKHRoLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIHRoID0gdGFibGUuZmluZCgndHInKS5lcSgwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoID0gdGguZmluZCgndHInKS5lcSgwKTtcclxuICAgIH1cclxuICAgIHRoID0gdGguYWRkQ2xhc3MoJ3RhYmxlLWhlYWRlcicpLmZpbmQoJ3RkLHRoJyk7XHJcblxyXG4gICAgdmFyIHRyID0gdGFibGUuZmluZCgndHInKS5ub3QoJy50YWJsZS1oZWFkZXInKTtcclxuXHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgIHZhciBrID0gaiArIDE7XHJcbiAgICAgIHZhciB0ZCA9IHRyLmZpbmQoJ3RkOm50aC1jaGlsZCgnICsgayArICcpJyk7XHJcbiAgICAgIHRkLmF0dHIoJ2xhYmVsJywgdGguZXEoaikudGV4dCgpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG59KSh3aW5kb3csIGRvY3VtZW50KTtcclxuIiwiO1xyXG4kKGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIG9uUmVtb3ZlKCl7XHJcbiAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgcG9zdD17XHJcbiAgICAgIGlkOiR0aGlzLmF0dHIoJ3VpZCcpLFxyXG4gICAgICB0eXBlOiR0aGlzLmF0dHIoJ21vZGUnKVxyXG4gICAgfTtcclxuICAgICQucG9zdCgkdGhpcy5hdHRyKCd1cmwnKSxwb3N0LGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICBpZihkYXRhICYmIGRhdGE9PSdlcnInKXtcclxuICAgICAgICBtc2c9JHRoaXMuZGF0YSgncmVtb3ZlLWVycm9yJyk7XHJcbiAgICAgICAgaWYoIW1zZyl7XHJcbiAgICAgICAgICBtc2c9J9Cd0LXQstC+0LfQvNC+0LbQvdC+INGD0LTQsNC70LjRgtGMINGN0LvQtdC80LXQvdGCJztcclxuICAgICAgICB9XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTptc2csdHlwZTonZXJyJ30pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbW9kZT0kdGhpcy5hdHRyKCdtb2RlJyk7XHJcbiAgICAgIGlmKCFtb2RlKXtcclxuICAgICAgICBtb2RlPSdybSc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKG1vZGU9PSdybScpIHtcclxuICAgICAgICBybSA9ICR0aGlzLmNsb3Nlc3QoJy50b19yZW1vdmUnKTtcclxuICAgICAgICBybV9jbGFzcyA9IHJtLmF0dHIoJ3JtX2NsYXNzJyk7XHJcbiAgICAgICAgaWYgKHJtX2NsYXNzKSB7XHJcbiAgICAgICAgICAkKHJtX2NsYXNzKS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJtLnJlbW92ZSgpO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cj0YHQv9C10YjQvdC+0LUg0YPQtNCw0LvQtdC90LjQtS4nLHR5cGU6J2luZm8nfSlcclxuICAgICAgfVxyXG4gICAgICBpZihtb2RlPT0ncmVsb2FkJyl7XHJcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgbG9jYXRpb24uaHJlZj1sb2NhdGlvbi5ocmVmO1xyXG4gICAgICB9XHJcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKCl7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Ce0YjQuNCx0LrQsCDRg9C00LDQu9C90LjRjycsdHlwZTonZXJyJ30pO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuYWpheF9yZW1vdmUnLGZ1bmN0aW9uKCl7XHJcbiAgICBub3RpZmljYXRpb24uY29uZmlybSh7XHJcbiAgICAgIGNhbGxiYWNrWWVzOm9uUmVtb3ZlLFxyXG4gICAgICBvYmo6JCh0aGlzKSxcclxuICAgICAgbm90eWZ5X2NsYXNzOiBcIm5vdGlmeV9ib3gtYWxlcnRcIlxyXG4gICAgfSlcclxuICB9KTtcclxuXHJcbn0pO1xyXG5cclxuIiwiaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xyXG4gIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKG9UaGlzKSB7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgLy8g0LHQu9C40LbQsNC50YjQuNC5INCw0L3QsNC70L7QsyDQstC90YPRgtGA0LXQvdC90LXQuSDRhNGD0L3QutGG0LjQuFxyXG4gICAgICAvLyBJc0NhbGxhYmxlINCyIEVDTUFTY3JpcHQgNVxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBhQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXHJcbiAgICAgIGZUb0JpbmQgPSB0aGlzLFxyXG4gICAgICBmTk9QID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB9LFxyXG4gICAgICBmQm91bmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1AgJiYgb1RoaXNcclxuICAgICAgICAgICAgPyB0aGlzXHJcbiAgICAgICAgICAgIDogb1RoaXMsXHJcbiAgICAgICAgICBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xyXG4gICAgICB9O1xyXG5cclxuICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XHJcbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcclxuXHJcbiAgICByZXR1cm4gZkJvdW5kO1xyXG4gIH07XHJcbn1cclxuXHJcbmlmICghU3RyaW5nLnByb3RvdHlwZS50cmltKSB7XHJcbiAgKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8g0JLRi9GA0LXQt9Cw0LXQvCBCT00g0Lgg0L3QtdGA0LDQt9GA0YvQstC90YvQuSDQv9GA0L7QsdC10LtcclxuICAgIFN0cmluZy5wcm90b3R5cGUudHJpbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9eW1xcc1xcdUZFRkZcXHhBMF0rfFtcXHNcXHVGRUZGXFx4QTBdKyQvZywgJycpO1xyXG4gICAgfTtcclxuICB9KSgpO1xyXG59IiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCcuaGlkZGVuLWxpbmsnKS5yZXBsYWNlV2l0aChmdW5jdGlvbiAoKSB7XHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICByZXR1cm4gJzxhIGhyZWY9XCInICsgJHRoaXMuZGF0YSgnbGluaycpICsgJ1wiIHJlbD1cIicrICR0aGlzLmRhdGEoJ3JlbCcpICsnXCIgY2xhc3M9XCInICsgJHRoaXMuYXR0cignY2xhc3MnKSArICdcIj4nICsgJHRoaXMudGV4dCgpICsgJzwvYT4nO1xyXG4gIH0pXHJcbn0pKCk7XHJcbiIsInZhciBzdG9yZV9wb2ludHMgPSAoZnVuY3Rpb24oKXtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gY2hhbmdlQ291bnRyeSgpe1xyXG4gICAgICAgIHZhciB0aGF0ID0gJCgnI3N0b3JlX3BvaW50X2NvdW50cnknKTtcclxuICAgICAgICBpZiAodGhhdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdE9wdGlvbnMgPSAkKHRoYXQpLmZpbmQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmRhdGEoJ2NpdGllcycpLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRzID0gJCgnI3N0b3JlLXBvaW50cycpLFxyXG4gICAgICAgICAgICAgICAgY291bnRyeSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmF0dHIoJ3ZhbHVlJyk7XHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RPcHRpb25zLmxlbmd0aCA+IDEgJiYgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0b3JlX3BvaW50X2NpdHknKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3ZhciBvcHRpb25zID0gJzxvcHRpb24gdmFsdWU9XCJcIj7QktGL0LHQtdGA0LjRgtC1INCz0L7RgNC+0LQ8L29wdGlvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb25zID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgaXRlbSArICdcIj4nICsgaXRlbSArICc8L29wdGlvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdC5pbm5lckhUTUwgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vJChwb2ludHMpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgLy8gZ29vZ2xlTWFwLnNob3dNYXAoKTtcclxuICAgICAgICAgICAgLy8gZ29vZ2xlTWFwLnNob3dNYXJrZXIoY291bnRyeSwgJycpO1xyXG4gICAgICAgICAgICBjaGFuZ2VDaXR5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjaGFuZ2VDaXR5KCl7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBnb29nbGVNYXAgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHRoYXQgPSAkKCcjc3RvcmVfcG9pbnRfY2l0eScpO1xyXG4gICAgICAgIGlmICh0aGF0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgY2l0eSA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHRoYXQpLmF0dHIoJ3ZhbHVlJyksXHJcbiAgICAgICAgICAgICAgICBjb3VudHJ5ID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgJCgnI3N0b3JlX3BvaW50X2NvdW50cnknKSkuYXR0cigndmFsdWUnKSxcclxuICAgICAgICAgICAgICAgIHBvaW50cyA9ICQoJyNzdG9yZS1wb2ludHMnKTtcclxuICAgICAgICAgICAgaWYgKGNvdW50cnkgJiYgY2l0eSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gcG9pbnRzLmZpbmQoJy5zdG9yZS1wb2ludHNfX3BvaW50c19yb3cnKSxcclxuICAgICAgICAgICAgICAgICAgICB2aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZU1hcC5zaG93TWFya2VyKGNvdW50cnksIGNpdHkpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQuZWFjaChpdGVtcywgZnVuY3Rpb24gKGluZGV4LCBkaXYpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJChkaXYpLmRhdGEoJ2NpdHknKSA9PSBjaXR5ICYmICQoZGl2KS5kYXRhKCdjb3VudHJ5JykgPT0gY291bnRyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGRpdikucmVtb3ZlQ2xhc3MoJ3N0b3JlLXBvaW50c19fcG9pbnRzX3Jvdy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChkaXYpLmFkZENsYXNzKCdzdG9yZS1wb2ludHNfX3BvaW50c19yb3ctaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQocG9pbnRzKS5yZW1vdmVDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHMtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwLnNob3dNYXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQocG9pbnRzKS5hZGRDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHMtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlTWFwLmhpZGVNYXAoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQocG9pbnRzKS5hZGRDbGFzcygnc3RvcmUtcG9pbnRzX19wb2ludHMtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICBnb29nbGVNYXAuaGlkZU1hcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8v0LTQu9GPINGC0L7Rh9C10Log0L/RgNC+0LTQsNC2LCDRgdC+0LHRi9GC0LjRjyDQvdCwINCy0YvQsdC+0YAg0YHQtdC70LXQutGC0L7QslxyXG4gICAgdmFyIGJvZHkgPSAkKCdib2R5Jyk7XHJcblxyXG4gICAgJChib2R5KS5vbignY2hhbmdlJywgJyNzdG9yZV9wb2ludF9jb3VudHJ5JywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGNoYW5nZUNvdW50cnkoKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICAkKGJvZHkpLm9uKCdjaGFuZ2UnLCAnI3N0b3JlX3BvaW50X2NpdHknLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgY2hhbmdlQ2l0eSgpO1xyXG5cclxuICAgIH0pO1xyXG5cclxuICAgIGNoYW5nZUNvdW50cnkoKTtcclxuXHJcblxyXG59KSgpO1xyXG5cclxuXHJcblxyXG5cclxuIiwidmFyIGhhc2hUYWdzID0gKGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgZnVuY3Rpb24gbG9jYXRpb25IYXNoKCkge1xyXG4gICAgICAgIHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XHJcblxyXG4gICAgICAgIGlmIChoYXNoICE9IFwiXCIpIHtcclxuICAgICAgICAgICAgdmFyIGhhc2hCb2R5ID0gaGFzaC5zcGxpdChcIj9cIik7XHJcbiAgICAgICAgICAgIGlmIChoYXNoQm9keVsxXSkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gbG9jYXRpb24ub3JpZ2luICsgbG9jYXRpb24ucGF0aG5hbWUgKyAnPycgKyBoYXNoQm9keVsxXSArIGhhc2hCb2R5WzBdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpbmtzID0gJCgnYVtocmVmPVwiJyArIGhhc2hCb2R5WzBdICsgJ1wiXS5tb2RhbHNfb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxpbmtzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQobGlua3NbMF0pLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbG9jYXRpb25IYXNoKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBsb2NhdGlvbkhhc2goKVxyXG5cclxufSkoKTsiLCJ2YXIgcGx1Z2lucyA9IChmdW5jdGlvbigpe1xyXG4gICAgdmFyIGljb25DbG9zZSA9ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJDYXBhXzFcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHdpZHRoPVwiMTJweFwiIGhlaWdodD1cIjEycHhcIiB2aWV3Qm94PVwiMCAwIDM1NyAzNTdcIiBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzU3IDM1NztcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPjxnPicrXHJcbiAgICAgICAgJzxnIGlkPVwiY2xvc2VcIj48cG9seWdvbiBwb2ludHM9XCIzNTcsMzUuNyAzMjEuMywwIDE3OC41LDE0Mi44IDM1LjcsMCAwLDM1LjcgMTQyLjgsMTc4LjUgMCwzMjEuMyAzNS43LDM1NyAxNzguNSwyMTQuMiAzMjEuMywzNTcgMzU3LDMyMS4zICAgICAyMTQuMiwxNzguNSAgIFwiIGZpbGw9XCIjRkZGRkZGXCIvPicrXHJcbiAgICAgICAgJzwvc3ZnPic7XHJcbiAgICB2YXIgdGVtcGxhdGU9JzxkaXYgY2xhc3M9XCJwYWdlLXdyYXAgaW5zdGFsbC1wbHVnaW5faW5uZXJcIj4nK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJpbnN0YWxsLXBsdWdpbl90ZXh0XCI+e3t0ZXh0fX08L2Rpdj4nK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJpbnN0YWxsLXBsdWdpbl9idXR0b25zXCI+JytcclxuICAgICAgICAgICAgICAgICAgICAnPGEgY2xhc3M9XCJidG4gYnRuLW1pbmkgYnRuLXJvdW5kIGluc3RhbGwtcGx1Z2luX2J1dHRvblwiICBocmVmPVwie3tocmVmfX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj57e3RpdGxlfX08L2E+JytcclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImluc3RhbGwtcGx1Z2luX2J1dHRvbi1jbG9zZVwiPicraWNvbkNsb3NlKyc8L2Rpdj4nK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicrXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgdmFyIHBsdWdpbkluc3RhbGxEaXZDbGFzcyA9ICdpbnN0YWxsLXBsdWdpbi1pbmRleCc7XHJcbiAgICB2YXIgcGx1Z2luSW5zdGFsbERpdkFjY291bnRDbGFzcyA9ICdpbnN0YWxsLXBsdWdpbi1hY2NvdW50JztcclxuICAgIHZhciBjb29raWVQYW5lbEhpZGRlbiA9ICdzZC1pbnN0YWxsLXBsdWdpbi1oaWRkZW4nO1xyXG4gICAgdmFyIGNvb2tpZUFjY291bnREaXZIaWRkZW4gPSAnc2QtaW5zdGFsbC1wbHVnaW4tYWNjb3VudC1oaWRkZW4nO1xyXG4gICAgdmFyIGlzT3BlcmEgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJyBPUFIvJykgPj0gMDtcclxuICAgIHZhciBpc1lhbmRleCA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignIFlhQnJvd3Nlci8nKSA+PSAwO1xyXG4gICAgdmFyIGV4dGVuc2lvbnMgPSB7XHJcbiAgICAgICAgJ2Nocm9tZSc6IHtcclxuICAgICAgICAgICAgJ2Rpdl9pZCc6ICdzZF9jaHJvbWVfYXBwJyxcclxuICAgICAgICAgICAgJ3VzZWQnOiAhIXdpbmRvdy5jaHJvbWUgJiYgd2luZG93LmNocm9tZS53ZWJzdG9yZSAhPT0gbnVsbCAmJiAhaXNPcGVyYSAmJiAhaXNZYW5kZXgsXHJcbiAgICAgICAgICAgIC8vJ3RleHQnOiBsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcclxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9jaHJvbWUuZ29vZ2xlLmNvbS93ZWJzdG9yZS9kZXRhaWwvc2VjcmV0ZGlzY291bnRlcnJ1LSVFMiU4MCU5My0lRDAlQkElRDElOEQlRDElODglRDAlQjEvbWNvbGhoZW1mYWNwb2FnaGppZGhsaWVjcGlhbnBuam4nLFxyXG4gICAgICAgICAgICAnaW5zdGFsbF9idXR0b25fY2xhc3MnOiAncGx1Z2luLWJyb3dzZXJzLWxpbmstY2hyb21lJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2ZpcmVmb3gnOiB7XHJcbiAgICAgICAgICAgICdkaXZfaWQnOiAnc2RfZmlyZWZveF9hcHAnLFxyXG4gICAgICAgICAgICAndXNlZCc6ICB0eXBlb2YgSW5zdGFsbFRyaWdnZXIgIT09ICd1bmRlZmluZWQnLFxyXG4gICAgICAgICAgICAvLyd0ZXh0JzpsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcclxuICAgICAgICAgICAgLy8naHJlZic6ICdodHRwczovL2FkZG9ucy5tb3ppbGxhLm9yZy9ydS9maXJlZm94L2FkZG9uL3NlY3JldGRpc2NvdW50ZXItJUQwJUJBJUQxJThEJUQxJTg4JUQwJUIxJUQxJThEJUQwJUJBLSVEMSU4MSVEMCVCNSVEMSU4MCVEMCVCMiVEMCVCOCVEMSU4MS8nLFxyXG4gICAgICAgICAgICAnaHJlZic6ICdodHRwczovL2FkZG9ucy5tb3ppbGxhLm9yZy9ydS9maXJlZm94L2FkZG9uL3NlY3JldGRpc2NvdW50ZXItY2FzaGJhY2snLFxyXG4gICAgICAgICAgICAnaW5zdGFsbF9idXR0b25fY2xhc3MnOiAncGx1Z2luLWJyb3dzZXJzLWxpbmstZmlyZWZveCdcclxuICAgICAgICB9LFxyXG4gICAgICAgICdvcGVyYSc6IHtcclxuICAgICAgICAgICAgJ2Rpdl9pZCc6ICdzZF9vcGVyYV9hcHAnLFxyXG4gICAgICAgICAgICAndXNlZCc6IGlzT3BlcmEsXHJcbiAgICAgICAgICAgIC8vJ3RleHQnOmxnKFwiaW5zdGFsbF9wbHVnaW5fYW5kX2l0X3dpbGxfbm90aWNlX2Fib3V0X2Nhc2hiYWNrXCIpLFxyXG4gICAgICAgICAgICAnaHJlZic6ICdodHRwczovL2FkZG9ucy5vcGVyYS5jb20vcnUvZXh0ZW5zaW9ucy8/cmVmPXBhZ2UnLFxyXG4gICAgICAgICAgICAnaW5zdGFsbF9idXR0b25fY2xhc3MnOiAncGx1Z2luLWJyb3dzZXJzLWxpbmstb3BlcmEnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAneWFuZGV4Jzoge1xyXG4gICAgICAgICAgICAnZGl2X2lkJzogJ3NkX3lhbmRleF9hcHAnLFxyXG4gICAgICAgICAgICAndXNlZCc6IGlzWWFuZGV4LFxyXG4gICAgICAgICAgICAvLyd0ZXh0JzpsZyhcImluc3RhbGxfcGx1Z2luX2FuZF9pdF93aWxsX25vdGljZV9hYm91dF9jYXNoYmFja1wiKSxcclxuICAgICAgICAgICAgJ2hyZWYnOiAnaHR0cHM6Ly9hZGRvbnMub3BlcmEuY29tL3J1L2V4dGVuc2lvbnMvP3JlZj1wYWdlJyxcclxuICAgICAgICAgICAgJ2luc3RhbGxfYnV0dG9uX2NsYXNzJzogJ3BsdWdpbi1icm93c2Vycy1saW5rLXlhbmRleCdcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRQYW5lbChocmVmKSB7XHJcbiAgICAgICAgdmFyIHBsdWdpbkluc3RhbGxQYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwbHVnaW4taW5zdGFsbC1wYW5lbCcpOy8v0LLRi9Cy0L7QtNC40YLRjCDQu9C4INC/0LDQvdC10LvRjFxyXG4gICAgICAgIGlmIChwbHVnaW5JbnN0YWxsUGFuZWwgJiYgZ2V0Q29va2llKGNvb2tpZVBhbmVsSGlkZGVuKSAhPT0gJzEnICkge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7dGV4dH19JywgbGcoXCJpbnN0YWxsX3BsdWdpbl9hbmRfaXRfd2lsbF9ub3RpY2VfYWJvdXRfY2FzaGJhY2tcIikpO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7aHJlZn19JywgaHJlZik7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZSgne3t0aXRsZX19JywgbGcoXCJpbnN0YWxsX3BsdWdpblwiKSk7XHJcbiAgICAgICAgICAgIHZhciBzZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xyXG4gICAgICAgICAgICBzZWN0aW9uLmNsYXNzTmFtZSA9ICdpbnN0YWxsLXBsdWdpbic7XHJcbiAgICAgICAgICAgIHNlY3Rpb24uaW5uZXJIVE1MID0gdGVtcGxhdGU7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2Vjb25kbGluZSA9IGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcignLmhlYWRlci1zZWNvbmRsaW5lJyk7XHJcbiAgICAgICAgICAgIGlmIChzZWNvbmRsaW5lKSB7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmRsaW5lLmFwcGVuZENoaWxkKHNlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmluc3RhbGwtcGx1Z2luX2J1dHRvbi1jbG9zZScpLm9uY2xpY2sgPSBjbG9zZUNsaWNrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEJ1dHRvbkluc3RhbGxWaXNpYmxlKGJ1dHRvbkNsYXNzKSB7XHJcbiAgICAgICAgJCgnLicgKyBwbHVnaW5JbnN0YWxsRGl2Q2xhc3MpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAkKCcuJyArIGJ1dHRvbkNsYXNzKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgaWYgKGdldENvb2tpZShjb29raWVBY2NvdW50RGl2SGlkZGVuKSAhPT0gJzEnKSB7XHJcbiAgICAgICAgICAgICQoJy4nICsgcGx1Z2luSW5zdGFsbERpdkFjY291bnRDbGFzcykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjbG9zZUNsaWNrKCl7XHJcbiAgICAgICAgJCgnLmluc3RhbGwtcGx1Z2luJykuYWRkQ2xhc3MoJ2luc3RhbGwtcGx1Z2luX2hpZGRlbicpO1xyXG4gICAgICAgIHNldENvb2tpZShjb29raWVQYW5lbEhpZGRlbiwgJzEnLCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgJCgnLmluc3RhbGwtcGx1Z2luLWFjY291bnQtbGF0ZXInKS5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNldENvb2tpZShjb29raWVBY2NvdW50RGl2SGlkZGVuLCAnMScsIDEwKTtcclxuICAgICAgICAkKCcuaW5zdGFsbC1wbHVnaW4tYWNjb3VudCcpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGV4dGVuc2lvbnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChleHRlbnNpb25zW2tleV0udXNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhcHBJZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyMnK2V4dGVuc2lvbnNba2V5XS5kaXZfaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghYXBwSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy/Qv9Cw0L3QtdC70Ywg0YEg0LrQvdC+0L/QutC+0LlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0UGFuZWwoZXh0ZW5zaW9uc1trZXldLmhyZWYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL9C90LAg0LPQu9Cw0LLQvdC+0LkgINC4INCyIC9hY2NvdW50INCx0LvQvtC60Lgg0YEg0LjQutC+0L3QutCw0LzQuCDQuCDQutC90L7Qv9C60LDQvNC4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEJ1dHRvbkluc3RhbGxWaXNpYmxlKGV4dGVuc2lvbnNba2V5XS5pbnN0YWxsX2J1dHRvbl9jbGFzcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMzAwMCk7XHJcbiAgICB9O1xyXG5cclxufSkoKTsiLCIvKipcclxuICogQGF1dGhvciB6aGl4aW4gd2VuIDx3ZW56aGl4aW4yMDEwQGdtYWlsLmNvbT5cclxuICogQHZlcnNpb24gMS4yLjFcclxuICpcclxuICogaHR0cDovL3dlbnpoaXhpbi5uZXQuY24vcC9tdWx0aXBsZS1zZWxlY3QvXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uICgkKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8vIGl0IG9ubHkgZG9lcyAnJXMnLCBhbmQgcmV0dXJuICcnIHdoZW4gYXJndW1lbnRzIGFyZSB1bmRlZmluZWRcclxuICAgIHZhciBzcHJpbnRmID0gZnVuY3Rpb24gKHN0cikge1xyXG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxyXG4gICAgICAgICAgICBmbGFnID0gdHJ1ZSxcclxuICAgICAgICAgICAgaSA9IDE7XHJcblxyXG4gICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBhcmcgPSBhcmdzW2krK107XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGZsYWcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYXJnO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmbGFnID8gc3RyIDogJyc7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciByZW1vdmVEaWFjcml0aWNzID0gZnVuY3Rpb24gKHN0cikge1xyXG4gICAgICAgIHZhciBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXAgPSBbXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0EnLCAnbGV0dGVycyc6L1tcXHUwMDQxXFx1MjRCNlxcdUZGMjFcXHUwMEMwXFx1MDBDMVxcdTAwQzJcXHUxRUE2XFx1MUVBNFxcdTFFQUFcXHUxRUE4XFx1MDBDM1xcdTAxMDBcXHUwMTAyXFx1MUVCMFxcdTFFQUVcXHUxRUI0XFx1MUVCMlxcdTAyMjZcXHUwMUUwXFx1MDBDNFxcdTAxREVcXHUxRUEyXFx1MDBDNVxcdTAxRkFcXHUwMUNEXFx1MDIwMFxcdTAyMDJcXHUxRUEwXFx1MUVBQ1xcdTFFQjZcXHUxRTAwXFx1MDEwNFxcdTAyM0FcXHUyQzZGXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQUEnLCdsZXR0ZXJzJzovW1xcdUE3MzJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidBRScsJ2xldHRlcnMnOi9bXFx1MDBDNlxcdTAxRkNcXHUwMUUyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQU8nLCdsZXR0ZXJzJzovW1xcdUE3MzRdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidBVScsJ2xldHRlcnMnOi9bXFx1QTczNl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0FWJywnbGV0dGVycyc6L1tcXHVBNzM4XFx1QTczQV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0FZJywnbGV0dGVycyc6L1tcXHVBNzNDXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonQicsICdsZXR0ZXJzJzovW1xcdTAwNDJcXHUyNEI3XFx1RkYyMlxcdTFFMDJcXHUxRTA0XFx1MUUwNlxcdTAyNDNcXHUwMTgyXFx1MDE4MV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0MnLCAnbGV0dGVycyc6L1tcXHUwMDQzXFx1MjRCOFxcdUZGMjNcXHUwMTA2XFx1MDEwOFxcdTAxMEFcXHUwMTBDXFx1MDBDN1xcdTFFMDhcXHUwMTg3XFx1MDIzQlxcdUE3M0VdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidEJywgJ2xldHRlcnMnOi9bXFx1MDA0NFxcdTI0QjlcXHVGRjI0XFx1MUUwQVxcdTAxMEVcXHUxRTBDXFx1MUUxMFxcdTFFMTJcXHUxRTBFXFx1MDExMFxcdTAxOEJcXHUwMThBXFx1MDE4OVxcdUE3NzldL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidEWicsJ2xldHRlcnMnOi9bXFx1MDFGMVxcdTAxQzRdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidEeicsJ2xldHRlcnMnOi9bXFx1MDFGMlxcdTAxQzVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidFJywgJ2xldHRlcnMnOi9bXFx1MDA0NVxcdTI0QkFcXHVGRjI1XFx1MDBDOFxcdTAwQzlcXHUwMENBXFx1MUVDMFxcdTFFQkVcXHUxRUM0XFx1MUVDMlxcdTFFQkNcXHUwMTEyXFx1MUUxNFxcdTFFMTZcXHUwMTE0XFx1MDExNlxcdTAwQ0JcXHUxRUJBXFx1MDExQVxcdTAyMDRcXHUwMjA2XFx1MUVCOFxcdTFFQzZcXHUwMjI4XFx1MUUxQ1xcdTAxMThcXHUxRTE4XFx1MUUxQVxcdTAxOTBcXHUwMThFXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonRicsICdsZXR0ZXJzJzovW1xcdTAwNDZcXHUyNEJCXFx1RkYyNlxcdTFFMUVcXHUwMTkxXFx1QTc3Ql0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J0cnLCAnbGV0dGVycyc6L1tcXHUwMDQ3XFx1MjRCQ1xcdUZGMjdcXHUwMUY0XFx1MDExQ1xcdTFFMjBcXHUwMTFFXFx1MDEyMFxcdTAxRTZcXHUwMTIyXFx1MDFFNFxcdTAxOTNcXHVBN0EwXFx1QTc3RFxcdUE3N0VdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidIJywgJ2xldHRlcnMnOi9bXFx1MDA0OFxcdTI0QkRcXHVGRjI4XFx1MDEyNFxcdTFFMjJcXHUxRTI2XFx1MDIxRVxcdTFFMjRcXHUxRTI4XFx1MUUyQVxcdTAxMjZcXHUyQzY3XFx1MkM3NVxcdUE3OERdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidJJywgJ2xldHRlcnMnOi9bXFx1MDA0OVxcdTI0QkVcXHVGRjI5XFx1MDBDQ1xcdTAwQ0RcXHUwMENFXFx1MDEyOFxcdTAxMkFcXHUwMTJDXFx1MDEzMFxcdTAwQ0ZcXHUxRTJFXFx1MUVDOFxcdTAxQ0ZcXHUwMjA4XFx1MDIwQVxcdTFFQ0FcXHUwMTJFXFx1MUUyQ1xcdTAxOTddL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidKJywgJ2xldHRlcnMnOi9bXFx1MDA0QVxcdTI0QkZcXHVGRjJBXFx1MDEzNFxcdTAyNDhdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidLJywgJ2xldHRlcnMnOi9bXFx1MDA0QlxcdTI0QzBcXHVGRjJCXFx1MUUzMFxcdTAxRThcXHUxRTMyXFx1MDEzNlxcdTFFMzRcXHUwMTk4XFx1MkM2OVxcdUE3NDBcXHVBNzQyXFx1QTc0NFxcdUE3QTJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidMJywgJ2xldHRlcnMnOi9bXFx1MDA0Q1xcdTI0QzFcXHVGRjJDXFx1MDEzRlxcdTAxMzlcXHUwMTNEXFx1MUUzNlxcdTFFMzhcXHUwMTNCXFx1MUUzQ1xcdTFFM0FcXHUwMTQxXFx1MDIzRFxcdTJDNjJcXHUyQzYwXFx1QTc0OFxcdUE3NDZcXHVBNzgwXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTEonLCdsZXR0ZXJzJzovW1xcdTAxQzddL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidMaicsJ2xldHRlcnMnOi9bXFx1MDFDOF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J00nLCAnbGV0dGVycyc6L1tcXHUwMDREXFx1MjRDMlxcdUZGMkRcXHUxRTNFXFx1MUU0MFxcdTFFNDJcXHUyQzZFXFx1MDE5Q10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J04nLCAnbGV0dGVycyc6L1tcXHUwMDRFXFx1MjRDM1xcdUZGMkVcXHUwMUY4XFx1MDE0M1xcdTAwRDFcXHUxRTQ0XFx1MDE0N1xcdTFFNDZcXHUwMTQ1XFx1MUU0QVxcdTFFNDhcXHUwMjIwXFx1MDE5RFxcdUE3OTBcXHVBN0E0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonTkonLCdsZXR0ZXJzJzovW1xcdTAxQ0FdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidOaicsJ2xldHRlcnMnOi9bXFx1MDFDQl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J08nLCAnbGV0dGVycyc6L1tcXHUwMDRGXFx1MjRDNFxcdUZGMkZcXHUwMEQyXFx1MDBEM1xcdTAwRDRcXHUxRUQyXFx1MUVEMFxcdTFFRDZcXHUxRUQ0XFx1MDBENVxcdTFFNENcXHUwMjJDXFx1MUU0RVxcdTAxNENcXHUxRTUwXFx1MUU1MlxcdTAxNEVcXHUwMjJFXFx1MDIzMFxcdTAwRDZcXHUwMjJBXFx1MUVDRVxcdTAxNTBcXHUwMUQxXFx1MDIwQ1xcdTAyMEVcXHUwMUEwXFx1MUVEQ1xcdTFFREFcXHUxRUUwXFx1MUVERVxcdTFFRTJcXHUxRUNDXFx1MUVEOFxcdTAxRUFcXHUwMUVDXFx1MDBEOFxcdTAxRkVcXHUwMTg2XFx1MDE5RlxcdUE3NEFcXHVBNzRDXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonT0knLCdsZXR0ZXJzJzovW1xcdTAxQTJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidPTycsJ2xldHRlcnMnOi9bXFx1QTc0RV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J09VJywnbGV0dGVycyc6L1tcXHUwMjIyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonUCcsICdsZXR0ZXJzJzovW1xcdTAwNTBcXHUyNEM1XFx1RkYzMFxcdTFFNTRcXHUxRTU2XFx1MDFBNFxcdTJDNjNcXHVBNzUwXFx1QTc1MlxcdUE3NTRdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidRJywgJ2xldHRlcnMnOi9bXFx1MDA1MVxcdTI0QzZcXHVGRjMxXFx1QTc1NlxcdUE3NThcXHUwMjRBXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonUicsICdsZXR0ZXJzJzovW1xcdTAwNTJcXHUyNEM3XFx1RkYzMlxcdTAxNTRcXHUxRTU4XFx1MDE1OFxcdTAyMTBcXHUwMjEyXFx1MUU1QVxcdTFFNUNcXHUwMTU2XFx1MUU1RVxcdTAyNENcXHUyQzY0XFx1QTc1QVxcdUE3QTZcXHVBNzgyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonUycsICdsZXR0ZXJzJzovW1xcdTAwNTNcXHUyNEM4XFx1RkYzM1xcdTFFOUVcXHUwMTVBXFx1MUU2NFxcdTAxNUNcXHUxRTYwXFx1MDE2MFxcdTFFNjZcXHUxRTYyXFx1MUU2OFxcdTAyMThcXHUwMTVFXFx1MkM3RVxcdUE3QThcXHVBNzg0XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonVCcsICdsZXR0ZXJzJzovW1xcdTAwNTRcXHUyNEM5XFx1RkYzNFxcdTFFNkFcXHUwMTY0XFx1MUU2Q1xcdTAyMUFcXHUwMTYyXFx1MUU3MFxcdTFFNkVcXHUwMTY2XFx1MDFBQ1xcdTAxQUVcXHUwMjNFXFx1QTc4Nl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1RaJywnbGV0dGVycyc6L1tcXHVBNzI4XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonVScsICdsZXR0ZXJzJzovW1xcdTAwNTVcXHUyNENBXFx1RkYzNVxcdTAwRDlcXHUwMERBXFx1MDBEQlxcdTAxNjhcXHUxRTc4XFx1MDE2QVxcdTFFN0FcXHUwMTZDXFx1MDBEQ1xcdTAxREJcXHUwMUQ3XFx1MDFENVxcdTAxRDlcXHUxRUU2XFx1MDE2RVxcdTAxNzBcXHUwMUQzXFx1MDIxNFxcdTAyMTZcXHUwMUFGXFx1MUVFQVxcdTFFRThcXHUxRUVFXFx1MUVFQ1xcdTFFRjBcXHUxRUU0XFx1MUU3MlxcdTAxNzJcXHUxRTc2XFx1MUU3NFxcdTAyNDRdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidWJywgJ2xldHRlcnMnOi9bXFx1MDA1NlxcdTI0Q0JcXHVGRjM2XFx1MUU3Q1xcdTFFN0VcXHUwMUIyXFx1QTc1RVxcdTAyNDVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidWWScsJ2xldHRlcnMnOi9bXFx1QTc2MF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1cnLCAnbGV0dGVycyc6L1tcXHUwMDU3XFx1MjRDQ1xcdUZGMzdcXHUxRTgwXFx1MUU4MlxcdTAxNzRcXHUxRTg2XFx1MUU4NFxcdTFFODhcXHUyQzcyXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonWCcsICdsZXR0ZXJzJzovW1xcdTAwNThcXHUyNENEXFx1RkYzOFxcdTFFOEFcXHUxRThDXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonWScsICdsZXR0ZXJzJzovW1xcdTAwNTlcXHUyNENFXFx1RkYzOVxcdTFFRjJcXHUwMEREXFx1MDE3NlxcdTFFRjhcXHUwMjMyXFx1MUU4RVxcdTAxNzhcXHUxRUY2XFx1MUVGNFxcdTAxQjNcXHUwMjRFXFx1MUVGRV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J1onLCAnbGV0dGVycyc6L1tcXHUwMDVBXFx1MjRDRlxcdUZGM0FcXHUwMTc5XFx1MUU5MFxcdTAxN0JcXHUwMTdEXFx1MUU5MlxcdTFFOTRcXHUwMUI1XFx1MDIyNFxcdTJDN0ZcXHUyQzZCXFx1QTc2Ml0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2EnLCAnbGV0dGVycyc6L1tcXHUwMDYxXFx1MjREMFxcdUZGNDFcXHUxRTlBXFx1MDBFMFxcdTAwRTFcXHUwMEUyXFx1MUVBN1xcdTFFQTVcXHUxRUFCXFx1MUVBOVxcdTAwRTNcXHUwMTAxXFx1MDEwM1xcdTFFQjFcXHUxRUFGXFx1MUVCNVxcdTFFQjNcXHUwMjI3XFx1MDFFMVxcdTAwRTRcXHUwMURGXFx1MUVBM1xcdTAwRTVcXHUwMUZCXFx1MDFDRVxcdTAyMDFcXHUwMjAzXFx1MUVBMVxcdTFFQURcXHUxRUI3XFx1MUUwMVxcdTAxMDVcXHUyQzY1XFx1MDI1MF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2FhJywnbGV0dGVycyc6L1tcXHVBNzMzXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYWUnLCdsZXR0ZXJzJzovW1xcdTAwRTZcXHUwMUZEXFx1MDFFM10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2FvJywnbGV0dGVycyc6L1tcXHVBNzM1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonYXUnLCdsZXR0ZXJzJzovW1xcdUE3MzddL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidhdicsJ2xldHRlcnMnOi9bXFx1QTczOVxcdUE3M0JdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidheScsJ2xldHRlcnMnOi9bXFx1QTczRF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2InLCAnbGV0dGVycyc6L1tcXHUwMDYyXFx1MjREMVxcdUZGNDJcXHUxRTAzXFx1MUUwNVxcdTFFMDdcXHUwMTgwXFx1MDE4M1xcdTAyNTNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidjJywgJ2xldHRlcnMnOi9bXFx1MDA2M1xcdTI0RDJcXHVGRjQzXFx1MDEwN1xcdTAxMDlcXHUwMTBCXFx1MDEwRFxcdTAwRTdcXHUxRTA5XFx1MDE4OFxcdTAyM0NcXHVBNzNGXFx1MjE4NF0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2QnLCAnbGV0dGVycyc6L1tcXHUwMDY0XFx1MjREM1xcdUZGNDRcXHUxRTBCXFx1MDEwRlxcdTFFMERcXHUxRTExXFx1MUUxM1xcdTFFMEZcXHUwMTExXFx1MDE4Q1xcdTAyNTZcXHUwMjU3XFx1QTc3QV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2R6JywnbGV0dGVycyc6L1tcXHUwMUYzXFx1MDFDNl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2UnLCAnbGV0dGVycyc6L1tcXHUwMDY1XFx1MjRENFxcdUZGNDVcXHUwMEU4XFx1MDBFOVxcdTAwRUFcXHUxRUMxXFx1MUVCRlxcdTFFQzVcXHUxRUMzXFx1MUVCRFxcdTAxMTNcXHUxRTE1XFx1MUUxN1xcdTAxMTVcXHUwMTE3XFx1MDBFQlxcdTFFQkJcXHUwMTFCXFx1MDIwNVxcdTAyMDdcXHUxRUI5XFx1MUVDN1xcdTAyMjlcXHUxRTFEXFx1MDExOVxcdTFFMTlcXHUxRTFCXFx1MDI0N1xcdTAyNUJcXHUwMUREXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonZicsICdsZXR0ZXJzJzovW1xcdTAwNjZcXHUyNEQ1XFx1RkY0NlxcdTFFMUZcXHUwMTkyXFx1QTc3Q10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J2cnLCAnbGV0dGVycyc6L1tcXHUwMDY3XFx1MjRENlxcdUZGNDdcXHUwMUY1XFx1MDExRFxcdTFFMjFcXHUwMTFGXFx1MDEyMVxcdTAxRTdcXHUwMTIzXFx1MDFFNVxcdTAyNjBcXHVBN0ExXFx1MUQ3OVxcdUE3N0ZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidoJywgJ2xldHRlcnMnOi9bXFx1MDA2OFxcdTI0RDdcXHVGRjQ4XFx1MDEyNVxcdTFFMjNcXHUxRTI3XFx1MDIxRlxcdTFFMjVcXHUxRTI5XFx1MUUyQlxcdTFFOTZcXHUwMTI3XFx1MkM2OFxcdTJDNzZcXHUwMjY1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonaHYnLCdsZXR0ZXJzJzovW1xcdTAxOTVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidpJywgJ2xldHRlcnMnOi9bXFx1MDA2OVxcdTI0RDhcXHVGRjQ5XFx1MDBFQ1xcdTAwRURcXHUwMEVFXFx1MDEyOVxcdTAxMkJcXHUwMTJEXFx1MDBFRlxcdTFFMkZcXHUxRUM5XFx1MDFEMFxcdTAyMDlcXHUwMjBCXFx1MUVDQlxcdTAxMkZcXHUxRTJEXFx1MDI2OFxcdTAxMzFdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidqJywgJ2xldHRlcnMnOi9bXFx1MDA2QVxcdTI0RDlcXHVGRjRBXFx1MDEzNVxcdTAxRjBcXHUwMjQ5XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonaycsICdsZXR0ZXJzJzovW1xcdTAwNkJcXHUyNERBXFx1RkY0QlxcdTFFMzFcXHUwMUU5XFx1MUUzM1xcdTAxMzdcXHUxRTM1XFx1MDE5OVxcdTJDNkFcXHVBNzQxXFx1QTc0M1xcdUE3NDVcXHVBN0EzXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonbCcsICdsZXR0ZXJzJzovW1xcdTAwNkNcXHUyNERCXFx1RkY0Q1xcdTAxNDBcXHUwMTNBXFx1MDEzRVxcdTFFMzdcXHUxRTM5XFx1MDEzQ1xcdTFFM0RcXHUxRTNCXFx1MDE3RlxcdTAxNDJcXHUwMTlBXFx1MDI2QlxcdTJDNjFcXHVBNzQ5XFx1QTc4MVxcdUE3NDddL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidsaicsJ2xldHRlcnMnOi9bXFx1MDFDOV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J20nLCAnbGV0dGVycyc6L1tcXHUwMDZEXFx1MjREQ1xcdUZGNERcXHUxRTNGXFx1MUU0MVxcdTFFNDNcXHUwMjcxXFx1MDI2Rl0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J24nLCAnbGV0dGVycyc6L1tcXHUwMDZFXFx1MjRERFxcdUZGNEVcXHUwMUY5XFx1MDE0NFxcdTAwRjFcXHUxRTQ1XFx1MDE0OFxcdTFFNDdcXHUwMTQ2XFx1MUU0QlxcdTFFNDlcXHUwMTlFXFx1MDI3MlxcdTAxNDlcXHVBNzkxXFx1QTdBNV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J25qJywnbGV0dGVycyc6L1tcXHUwMUNDXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonbycsICdsZXR0ZXJzJzovW1xcdTAwNkZcXHUyNERFXFx1RkY0RlxcdTAwRjJcXHUwMEYzXFx1MDBGNFxcdTFFRDNcXHUxRUQxXFx1MUVEN1xcdTFFRDVcXHUwMEY1XFx1MUU0RFxcdTAyMkRcXHUxRTRGXFx1MDE0RFxcdTFFNTFcXHUxRTUzXFx1MDE0RlxcdTAyMkZcXHUwMjMxXFx1MDBGNlxcdTAyMkJcXHUxRUNGXFx1MDE1MVxcdTAxRDJcXHUwMjBEXFx1MDIwRlxcdTAxQTFcXHUxRUREXFx1MUVEQlxcdTFFRTFcXHUxRURGXFx1MUVFM1xcdTFFQ0RcXHUxRUQ5XFx1MDFFQlxcdTAxRURcXHUwMEY4XFx1MDFGRlxcdTAyNTRcXHVBNzRCXFx1QTc0RFxcdTAyNzVdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidvaScsJ2xldHRlcnMnOi9bXFx1MDFBM10vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J291JywnbGV0dGVycyc6L1tcXHUwMjIzXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzonb28nLCdsZXR0ZXJzJzovW1xcdUE3NEZdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidwJywnbGV0dGVycyc6L1tcXHUwMDcwXFx1MjRERlxcdUZGNTBcXHUxRTU1XFx1MUU1N1xcdTAxQTVcXHUxRDdEXFx1QTc1MVxcdUE3NTNcXHVBNzU1XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoncScsJ2xldHRlcnMnOi9bXFx1MDA3MVxcdTI0RTBcXHVGRjUxXFx1MDI0QlxcdUE3NTdcXHVBNzU5XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoncicsJ2xldHRlcnMnOi9bXFx1MDA3MlxcdTI0RTFcXHVGRjUyXFx1MDE1NVxcdTFFNTlcXHUwMTU5XFx1MDIxMVxcdTAyMTNcXHUxRTVCXFx1MUU1RFxcdTAxNTdcXHUxRTVGXFx1MDI0RFxcdTAyN0RcXHVBNzVCXFx1QTdBN1xcdUE3ODNdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOidzJywnbGV0dGVycyc6L1tcXHUwMDczXFx1MjRFMlxcdUZGNTNcXHUwMERGXFx1MDE1QlxcdTFFNjVcXHUwMTVEXFx1MUU2MVxcdTAxNjFcXHUxRTY3XFx1MUU2M1xcdTFFNjlcXHUwMjE5XFx1MDE1RlxcdTAyM0ZcXHVBN0E5XFx1QTc4NVxcdTFFOUJdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid0JywnbGV0dGVycyc6L1tcXHUwMDc0XFx1MjRFM1xcdUZGNTRcXHUxRTZCXFx1MUU5N1xcdTAxNjVcXHUxRTZEXFx1MDIxQlxcdTAxNjNcXHUxRTcxXFx1MUU2RlxcdTAxNjdcXHUwMUFEXFx1MDI4OFxcdTJDNjZcXHVBNzg3XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzondHonLCdsZXR0ZXJzJzovW1xcdUE3MjldL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid1JywnbGV0dGVycyc6L1tcXHUwMDc1XFx1MjRFNFxcdUZGNTVcXHUwMEY5XFx1MDBGQVxcdTAwRkJcXHUwMTY5XFx1MUU3OVxcdTAxNkJcXHUxRTdCXFx1MDE2RFxcdTAwRkNcXHUwMURDXFx1MDFEOFxcdTAxRDZcXHUwMURBXFx1MUVFN1xcdTAxNkZcXHUwMTcxXFx1MDFENFxcdTAyMTVcXHUwMjE3XFx1MDFCMFxcdTFFRUJcXHUxRUU5XFx1MUVFRlxcdTFFRURcXHUxRUYxXFx1MUVFNVxcdTFFNzNcXHUwMTczXFx1MUU3N1xcdTFFNzVcXHUwMjg5XS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzondicsJ2xldHRlcnMnOi9bXFx1MDA3NlxcdTI0RTVcXHVGRjU2XFx1MUU3RFxcdTFFN0ZcXHUwMjhCXFx1QTc1RlxcdTAyOENdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid2eScsJ2xldHRlcnMnOi9bXFx1QTc2MV0vZ30sXHJcbiAgICAgICAgICAgIHsnYmFzZSc6J3cnLCdsZXR0ZXJzJzovW1xcdTAwNzdcXHUyNEU2XFx1RkY1N1xcdTFFODFcXHUxRTgzXFx1MDE3NVxcdTFFODdcXHUxRTg1XFx1MUU5OFxcdTFFODlcXHUyQzczXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoneCcsJ2xldHRlcnMnOi9bXFx1MDA3OFxcdTI0RTdcXHVGRjU4XFx1MUU4QlxcdTFFOERdL2d9LFxyXG4gICAgICAgICAgICB7J2Jhc2UnOid5JywnbGV0dGVycyc6L1tcXHUwMDc5XFx1MjRFOFxcdUZGNTlcXHUxRUYzXFx1MDBGRFxcdTAxNzdcXHUxRUY5XFx1MDIzM1xcdTFFOEZcXHUwMEZGXFx1MUVGN1xcdTFFOTlcXHUxRUY1XFx1MDFCNFxcdTAyNEZcXHUxRUZGXS9nfSxcclxuICAgICAgICAgICAgeydiYXNlJzoneicsJ2xldHRlcnMnOi9bXFx1MDA3QVxcdTI0RTlcXHVGRjVBXFx1MDE3QVxcdTFFOTFcXHUwMTdDXFx1MDE3RVxcdTFFOTNcXHUxRTk1XFx1MDFCNlxcdTAyMjVcXHUwMjQwXFx1MkM2Q1xcdUE3NjNdL2d9XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoZGVmYXVsdERpYWNyaXRpY3NSZW1vdmFsTWFwW2ldLmxldHRlcnMsIGRlZmF1bHREaWFjcml0aWNzUmVtb3ZhbE1hcFtpXS5iYXNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcblxyXG4gICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIE11bHRpcGxlU2VsZWN0KCRlbCwgb3B0aW9ucykge1xyXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgbmFtZSA9ICRlbC5hdHRyKCduYW1lJykgfHwgb3B0aW9ucy5uYW1lIHx8ICcnO1xyXG5cclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG5cclxuICAgICAgICAvLyBoaWRlIHNlbGVjdCBlbGVtZW50XHJcbiAgICAgICAgdGhpcy4kZWwgPSAkZWwuaGlkZSgpO1xyXG5cclxuICAgICAgICAvLyBsYWJlbCBlbGVtZW50XHJcbiAgICAgICAgdGhpcy4kbGFiZWwgPSB0aGlzLiRlbC5jbG9zZXN0KCdsYWJlbCcpO1xyXG4gICAgICAgIGlmICh0aGlzLiRsYWJlbC5sZW5ndGggPT09IDAgJiYgdGhpcy4kZWwuYXR0cignaWQnKSkge1xyXG4gICAgICAgICAgICB0aGlzLiRsYWJlbCA9ICQoc3ByaW50ZignbGFiZWxbZm9yPVwiJXNcIl0nLCB0aGlzLiRlbC5hdHRyKCdpZCcpLnJlcGxhY2UoLzovZywgJ1xcXFw6JykpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlc3RvcmUgY2xhc3MgYW5kIHRpdGxlIGZyb20gc2VsZWN0IGVsZW1lbnRcclxuICAgICAgICB0aGlzLiRwYXJlbnQgPSAkKHNwcmludGYoXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibXMtcGFyZW50ICVzXCIgJXMvPicsXHJcbiAgICAgICAgICAgICRlbC5hdHRyKCdjbGFzcycpIHx8ICcnLFxyXG4gICAgICAgICAgICBzcHJpbnRmKCd0aXRsZT1cIiVzXCInLCAkZWwuYXR0cigndGl0bGUnKSkpKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIHBsYWNlaG9sZGVyIHRvIGNob2ljZSBidXR0b25cclxuICAgICAgICB0aGlzLiRjaG9pY2UgPSAkKHNwcmludGYoW1xyXG4gICAgICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwibXMtY2hvaWNlXCI+JyxcclxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInBsYWNlaG9sZGVyXCI+JXM8L3NwYW4+JyxcclxuICAgICAgICAgICAgICAgICc8ZGl2PjwvZGl2PicsXHJcbiAgICAgICAgICAgICAgICAnPC9idXR0b24+J1xyXG4gICAgICAgICAgICBdLmpvaW4oJycpLFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIpKTtcclxuXHJcbiAgICAgICAgLy8gZGVmYXVsdCBwb3NpdGlvbiBpcyBib3R0b21cclxuICAgICAgICB0aGlzLiRkcm9wID0gJChzcHJpbnRmKCc8ZGl2IGNsYXNzPVwibXMtZHJvcCAlc1wiJXM+PC9kaXY+JyxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICBzcHJpbnRmKCcgc3R5bGU9XCJ3aWR0aDogJXNcIicsIHRoaXMub3B0aW9ucy5kcm9wV2lkdGgpKSk7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmFmdGVyKHRoaXMuJHBhcmVudCk7XHJcbiAgICAgICAgdGhpcy4kcGFyZW50LmFwcGVuZCh0aGlzLiRjaG9pY2UpO1xyXG4gICAgICAgIHRoaXMuJHBhcmVudC5hcHBlbmQodGhpcy4kZHJvcCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLiRlbC5wcm9wKCdkaXNhYmxlZCcpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy4kcGFyZW50LmNzcygnd2lkdGgnLFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMud2lkdGggfHxcclxuICAgICAgICAgICAgdGhpcy4kZWwuY3NzKCd3aWR0aCcpIHx8XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm91dGVyV2lkdGgoKSArIDIwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZWxlY3RBbGxOYW1lID0gJ2RhdGEtbmFtZT1cInNlbGVjdEFsbCcgKyBuYW1lICsgJ1wiJztcclxuICAgICAgICB0aGlzLnNlbGVjdEdyb3VwTmFtZSA9ICdkYXRhLW5hbWU9XCJzZWxlY3RHcm91cCcgKyBuYW1lICsgJ1wiJztcclxuICAgICAgICB0aGlzLnNlbGVjdEl0ZW1OYW1lID0gJ2RhdGEtbmFtZT1cInNlbGVjdEl0ZW0nICsgbmFtZSArICdcIic7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmtlZXBPcGVuKSB7XHJcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJChlLnRhcmdldClbMF0gPT09IHRoYXQuJGNob2ljZVswXSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJy5tcy1jaG9pY2UnKVswXSA9PT0gdGhhdC4kY2hvaWNlWzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCgkKGUudGFyZ2V0KVswXSA9PT0gdGhhdC4kZHJvcFswXSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJy5tcy1kcm9wJylbMF0gIT09IHRoYXQuJGRyb3BbMF0gJiYgZS50YXJnZXQgIT09ICRlbFswXSkgJiZcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgTXVsdGlwbGVTZWxlY3QucHJvdG90eXBlID0ge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yOiBNdWx0aXBsZVNlbGVjdCxcclxuXHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAkdWwgPSAkKCc8dWw+PC91bD4nKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuaHRtbCgnJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5hcHBlbmQoW1xyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibXMtc2VhcmNoXCI+JyxcclxuICAgICAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgYXV0b2NvbXBsZXRlPVwib2ZmXCIgYXV0b2NvcnJlY3Q9XCJvZmZcIiBhdXRvY2FwaXRpbGl6ZT1cIm9mZlwiIHNwZWxsY2hlY2s9XCJmYWxzZVwiPicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PiddLmpvaW4oJycpXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNlbGVjdEFsbCAmJiAhdGhpcy5vcHRpb25zLnNpbmdsZSkge1xyXG4gICAgICAgICAgICAgICAgJHVsLmFwcGVuZChbXHJcbiAgICAgICAgICAgICAgICAgICAgJzxsaSBjbGFzcz1cIm1zLXNlbGVjdC1hbGxcIj4nLFxyXG4gICAgICAgICAgICAgICAgICAgICc8bGFiZWw+JyxcclxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgJXMgLz4gJywgdGhpcy5zZWxlY3RBbGxOYW1lKSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0QWxsRGVsaW1pdGVyWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zZWxlY3RBbGxUZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zZWxlY3RBbGxEZWxpbWl0ZXJbMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvbGFiZWw+JyxcclxuICAgICAgICAgICAgICAgICAgICAnPC9saT4nXHJcbiAgICAgICAgICAgICAgICBdLmpvaW4oJycpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJC5lYWNoKHRoaXMuJGVsLmNoaWxkcmVuKCksIGZ1bmN0aW9uIChpLCBlbG0pIHtcclxuICAgICAgICAgICAgICAgICR1bC5hcHBlbmQodGhhdC5vcHRpb25Ub0h0bWwoaSwgZWxtKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkdWwuYXBwZW5kKHNwcmludGYoJzxsaSBjbGFzcz1cIm1zLW5vLXJlc3VsdHNcIj4lczwvbGk+JywgdGhpcy5vcHRpb25zLm5vTWF0Y2hlc0ZvdW5kKSk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuYXBwZW5kKCR1bCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoJ3VsJykuY3NzKCdtYXgtaGVpZ2h0JywgdGhpcy5vcHRpb25zLm1heEhlaWdodCArICdweCcpO1xyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoJy5tdWx0aXBsZScpLmNzcygnd2lkdGgnLCB0aGlzLm9wdGlvbnMubXVsdGlwbGVXaWR0aCArICdweCcpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kc2VhcmNoSW5wdXQgPSB0aGlzLiRkcm9wLmZpbmQoJy5tcy1zZWFyY2ggaW5wdXQnKTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsID0gdGhpcy4kZHJvcC5maW5kKCdpbnB1dFsnICsgdGhpcy5zZWxlY3RBbGxOYW1lICsgJ10nKTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzID0gdGhpcy4kZHJvcC5maW5kKCdpbnB1dFsnICsgdGhpcy5zZWxlY3RHcm91cE5hbWUgKyAnXScpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcyA9IHRoaXMuJGRyb3AuZmluZCgnaW5wdXRbJyArIHRoaXMuc2VsZWN0SXRlbU5hbWUgKyAnXTplbmFibGVkJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcyA9IHRoaXMuJGRyb3AuZmluZCgnaW5wdXRbJyArIHRoaXMuc2VsZWN0SXRlbU5hbWUgKyAnXTpkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMgPSB0aGlzLiRkcm9wLmZpbmQoJy5tcy1uby1yZXN1bHRzJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmV2ZW50cygpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdEFsbCh0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUodHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvcHRpb25Ub0h0bWw6IGZ1bmN0aW9uIChpLCBlbG0sIGdyb3VwLCBncm91cERpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgICRlbG0gPSAkKGVsbSksXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gJGVsbS5hdHRyKCdjbGFzcycpIHx8ICcnLFxyXG4gICAgICAgICAgICAgICAgdGl0bGUgPSBzcHJpbnRmKCd0aXRsZT1cIiVzXCInLCAkZWxtLmF0dHIoJ3RpdGxlJykpLFxyXG4gICAgICAgICAgICAgICAgbXVsdGlwbGUgPSB0aGlzLm9wdGlvbnMubXVsdGlwbGUgPyAnbXVsdGlwbGUnIDogJycsXHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZCxcclxuICAgICAgICAgICAgICAgIHR5cGUgPSB0aGlzLm9wdGlvbnMuc2luZ2xlID8gJ3JhZGlvJyA6ICdjaGVja2JveCc7XHJcblxyXG4gICAgICAgICAgICBpZiAoJGVsbS5pcygnb3B0aW9uJykpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9ICRlbG0udmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRoYXQub3B0aW9ucy50ZXh0VGVtcGxhdGUoJGVsbSksXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSAkZWxtLnByb3AoJ3NlbGVjdGVkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUgPSBzcHJpbnRmKCdzdHlsZT1cIiVzXCInLCB0aGlzLm9wdGlvbnMuc3R5bGVyKHZhbHVlKSksXHJcbiAgICAgICAgICAgICAgICAgICAgJGVsO1xyXG5cclxuICAgICAgICAgICAgICAgIGRpc2FibGVkID0gZ3JvdXBEaXNhYmxlZCB8fCAkZWxtLnByb3AoJ2Rpc2FibGVkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgJGVsID0gJChbXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGxpIGNsYXNzPVwiJXMgJXNcIiAlcyAlcz4nLCBtdWx0aXBsZSwgY2xhc3NlcywgdGl0bGUsIHN0eWxlKSxcclxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8bGFiZWwgY2xhc3M9XCIlc1wiPicsIGRpc2FibGVkID8gJ2Rpc2FibGVkJyA6ICcnKSxcclxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8aW5wdXQgdHlwZT1cIiVzXCIgJXMlcyVzJXM+JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSwgdGhpcy5zZWxlY3RJdGVtTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQgPyAnIGNoZWNrZWQ9XCJjaGVja2VkXCInIDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkID8gJyBkaXNhYmxlZD1cImRpc2FibGVkXCInIDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwcmludGYoJyBkYXRhLWdyb3VwPVwiJXNcIicsIGdyb3VwKSksXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPHNwYW4+JXM8L3NwYW4+JywgdGV4dCksXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvbGFiZWw+JyxcclxuICAgICAgICAgICAgICAgICAgICAnPC9saT4nXHJcbiAgICAgICAgICAgICAgICBdLmpvaW4oJycpKTtcclxuICAgICAgICAgICAgICAgICRlbC5maW5kKCdpbnB1dCcpLnZhbCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkZWxtLmlzKCdvcHRncm91cCcpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSB0aGF0Lm9wdGlvbnMubGFiZWxUZW1wbGF0ZSgkZWxtKSxcclxuICAgICAgICAgICAgICAgICAgICAkZ3JvdXAgPSAkKCc8ZGl2Lz4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBncm91cCA9ICdncm91cF8nICsgaTtcclxuICAgICAgICAgICAgICAgIGRpc2FibGVkID0gJGVsbS5wcm9wKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICRncm91cC5hcHBlbmQoW1xyXG4gICAgICAgICAgICAgICAgICAgICc8bGkgY2xhc3M9XCJncm91cFwiPicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGxhYmVsIGNsYXNzPVwib3B0Z3JvdXAgJXNcIiBkYXRhLWdyb3VwPVwiJXNcIj4nLCBkaXNhYmxlZCA/ICdkaXNhYmxlZCcgOiAnJywgZ3JvdXApLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5oaWRlT3B0Z3JvdXBDaGVja2JveGVzIHx8IHRoaXMub3B0aW9ucy5zaW5nbGUgPyAnJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAlcyAlcz4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdEdyb3VwTmFtZSwgZGlzYWJsZWQgPyAnZGlzYWJsZWQ9XCJkaXNhYmxlZFwiJyA6ICcnKSxcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbCxcclxuICAgICAgICAgICAgICAgICAgICAnPC9sYWJlbD4nLFxyXG4gICAgICAgICAgICAgICAgICAgICc8L2xpPidcclxuICAgICAgICAgICAgICAgIF0uam9pbignJykpO1xyXG5cclxuICAgICAgICAgICAgICAgICQuZWFjaCgkZWxtLmNoaWxkcmVuKCksIGZ1bmN0aW9uIChpLCBlbG0pIHtcclxuICAgICAgICAgICAgICAgICAgICAkZ3JvdXAuYXBwZW5kKHRoYXQub3B0aW9uVG9IdG1sKGksIGVsbSwgZ3JvdXAsIGRpc2FibGVkKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkZ3JvdXAuaHRtbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHRvZ2dsZU9wZW4gPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0W3RoYXQub3B0aW9ucy5pc09wZW4gPyAnY2xvc2UnIDogJ29wZW4nXSgpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLiRsYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kbGFiZWwub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICdsYWJlbCcgfHwgZS50YXJnZXQgIT09IHRoaXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0b2dnbGVPcGVuKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhhdC5vcHRpb25zLmZpbHRlciB8fCAhdGhhdC5vcHRpb25zLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7IC8vIENhdXNlcyBsb3N0IGZvY3VzIG90aGVyd2lzZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgdG9nZ2xlT3BlbilcclxuICAgICAgICAgICAgICAgIC5vZmYoJ2ZvY3VzJykub24oJ2ZvY3VzJywgdGhpcy5vcHRpb25zLm9uRm9jdXMpXHJcbiAgICAgICAgICAgICAgICAub2ZmKCdibHVyJykub24oJ2JsdXInLCB0aGlzLm9wdGlvbnMub25CbHVyKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHBhcmVudC5vZmYoJ2tleWRvd24nKS5vbigna2V5ZG93bicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDI3OiAvLyBlc2Mga2V5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC4kY2hvaWNlLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHNlYXJjaElucHV0Lm9mZigna2V5ZG93bicpLm9uKCdrZXlkb3duJyxmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIHNoaWZ0LXRhYiBjYXVzZXMgbG9zdCBmb2N1cyBmcm9tIGZpbHRlciBhcyB3aXRoIGNsaWNraW5nIGF3YXlcclxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDkgJiYgZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkub2ZmKCdrZXl1cCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBlbnRlciBvciBzcGFjZVxyXG4gICAgICAgICAgICAgICAgLy8gQXZvaWQgc2VsZWN0aW5nL2Rlc2VsZWN0aW5nIGlmIG5vIGNob2ljZXMgbWFkZVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5maWx0ZXJBY2NlcHRPbkVudGVyICYmIChlLndoaWNoID09PSAxMyB8fCBlLndoaWNoID09IDMyKSAmJiB0aGF0LiRzZWFyY2hJbnB1dC52YWwoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEFsbC5jbGljaygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhhdC5maWx0ZXIoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjaGVja2VkID0gJCh0aGlzKS5wcm9wKCdjaGVja2VkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zID0gdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICgkaXRlbXMubGVuZ3RoID09PSB0aGF0LiRzZWxlY3RJdGVtcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0W2NoZWNrZWQgPyAnY2hlY2tBbGwnIDogJ3VuY2hlY2tBbGwnXSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gd2hlbiB0aGUgZmlsdGVyIG9wdGlvbiBpcyB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC4kc2VsZWN0R3JvdXBzLnByb3AoJ2NoZWNrZWQnLCBjaGVja2VkKTtcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMucHJvcCgnY2hlY2tlZCcsIGNoZWNrZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQub3B0aW9uc1tjaGVja2VkID8gJ29uQ2hlY2tBbGwnIDogJ29uVW5jaGVja0FsbCddKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gJCh0aGlzKS5wYXJlbnQoKS5hdHRyKCdkYXRhLWdyb3VwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zID0gdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9ICRpdGVtcy5maWx0ZXIoc3ByaW50ZignW2RhdGEtZ3JvdXA9XCIlc1wiXScsIGdyb3VwKSksXHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZCA9ICRjaGlsZHJlbi5sZW5ndGggIT09ICRjaGlsZHJlbi5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgICRjaGlsZHJlbi5wcm9wKCdjaGVja2VkJywgY2hlY2tlZCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZVNlbGVjdEFsbCgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQub3B0aW9ucy5vbk9wdGdyb3VwQ2xpY2soe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAkKHRoaXMpLnBhcmVudCgpLnRleHQoKSxcclxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiBjaGVja2VkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiAkY2hpbGRyZW4uZ2V0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2U6IHRoYXRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlU2VsZWN0QWxsKCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGVPcHRHcm91cFNlbGVjdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uQ2xpY2soe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAkKHRoaXMpLnBhcmVudCgpLnRleHQoKSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJCh0aGlzKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiAkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSxcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZTogdGhhdFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5zaW5nbGUgJiYgdGhhdC5vcHRpb25zLmlzT3BlbiAmJiAhdGhhdC5vcHRpb25zLmtlZXBPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuc2luZ2xlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsaWNrZWRWYWwgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQodGhpcykudmFsKCkgIT09IGNsaWNrZWRWYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9wZW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuJGNob2ljZS5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc09wZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuZmluZCgnPmRpdicpLmFkZENsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3BbdGhpcy5hbmltYXRlTWV0aG9kKCdzaG93JyldKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBmaXggZmlsdGVyIGJ1Zzogbm8gcmVzdWx0cyBzaG93XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuJG5vUmVzdWx0cy5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBGaXggIzc3OiAnQWxsIHNlbGVjdGVkJyB3aGVuIG5vIG9wdGlvbnNcclxuICAgICAgICAgICAgaWYgKCF0aGlzLiRlbC5jaGlsZHJlbigpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJG5vUmVzdWx0cy5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy4kZHJvcC5vZmZzZXQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRyb3AuYXBwZW5kVG8oJCh0aGlzLm9wdGlvbnMuY29udGFpbmVyKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkcm9wLm9mZnNldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBvZmZzZXQudG9wLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IG9mZnNldC5sZWZ0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5maWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlYXJjaElucHV0LnZhbCgnJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWFyY2hJbnB1dC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maWx0ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25PcGVuKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuZmluZCgnPmRpdicpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3BbdGhpcy5hbmltYXRlTWV0aG9kKCdoaWRlJyldKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRwYXJlbnQuYXBwZW5kKHRoaXMuJGRyb3ApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICd0b3AnOiAnYXV0bycsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2xlZnQnOiAnYXV0bydcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYW5pbWF0ZU1ldGhvZDogZnVuY3Rpb24gKG1ldGhvZCkge1xyXG4gICAgICAgICAgICB2YXIgbWV0aG9kcyA9IHtcclxuICAgICAgICAgICAgICAgIHNob3c6IHtcclxuICAgICAgICAgICAgICAgICAgICBmYWRlOiAnZmFkZUluJyxcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZTogJ3NsaWRlRG93bidcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBoaWRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFkZTogJ2ZhZGVPdXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlOiAnc2xpZGVVcCdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzW21ldGhvZF1bdGhpcy5vcHRpb25zLmFuaW1hdGVdIHx8IG1ldGhvZDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChpc0luaXQpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdHMgPSB0aGlzLm9wdGlvbnMuZGlzcGxheVZhbHVlcyA/IHRoaXMuZ2V0U2VsZWN0cygpIDogdGhpcy5nZXRTZWxlY3RzKCd0ZXh0JyksXHJcbiAgICAgICAgICAgICAgICAkc3BhbiA9IHRoaXMuJGNob2ljZS5maW5kKCc+c3BhbicpLFxyXG4gICAgICAgICAgICAgICAgc2wgPSBzZWxlY3RzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGlmIChzbCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgJHNwYW4uYWRkQ2xhc3MoJ3BsYWNlaG9sZGVyJykuaHRtbCh0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5hbGxTZWxlY3RlZCAmJiBzbCA9PT0gdGhpcy4kc2VsZWN0SXRlbXMubGVuZ3RoICsgdGhpcy4kZGlzYWJsZUl0ZW1zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgJHNwYW4ucmVtb3ZlQ2xhc3MoJ3BsYWNlaG9sZGVyJykuaHRtbCh0aGlzLm9wdGlvbnMuYWxsU2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5lbGxpcHNpcyAmJiBzbCA+IHRoaXMub3B0aW9ucy5taW5pbXVtQ291bnRTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgJHNwYW4ucmVtb3ZlQ2xhc3MoJ3BsYWNlaG9sZGVyJykudGV4dChzZWxlY3RzLnNsaWNlKDAsIHRoaXMub3B0aW9ucy5taW5pbXVtQ291bnRTZWxlY3RlZClcclxuICAgICAgICAgICAgICAgICAgICAuam9pbih0aGlzLm9wdGlvbnMuZGVsaW1pdGVyKSArICcuLi4nKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuY291bnRTZWxlY3RlZCAmJiBzbCA+IHRoaXMub3B0aW9ucy5taW5pbXVtQ291bnRTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgJHNwYW4ucmVtb3ZlQ2xhc3MoJ3BsYWNlaG9sZGVyJykuaHRtbCh0aGlzLm9wdGlvbnMuY291bnRTZWxlY3RlZFxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCcjJywgc2VsZWN0cy5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJyUnLCB0aGlzLiRzZWxlY3RJdGVtcy5sZW5ndGggKyB0aGlzLiRkaXNhYmxlSXRlbXMubGVuZ3RoKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkc3Bhbi5yZW1vdmVDbGFzcygncGxhY2Vob2xkZXInKS50ZXh0KHNlbGVjdHMuam9pbih0aGlzLm9wdGlvbnMuZGVsaW1pdGVyKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWRkVGl0bGUpIHtcclxuICAgICAgICAgICAgICAgICRzcGFuLnByb3AoJ3RpdGxlJywgdGhpcy5nZXRTZWxlY3RzKCd0ZXh0JykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBzZXQgc2VsZWN0cyB0byBzZWxlY3RcclxuICAgICAgICAgICAgdGhpcy4kZWwudmFsKHRoaXMuZ2V0U2VsZWN0cygpKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBzZWxlY3RlZCBjbGFzcyB0byBzZWxlY3RlZCBsaVxyXG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuZmluZCgnaW5wdXQ6Y2hlY2tlZCcpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCdsaScpLmZpcnN0KCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gdHJpZ2dlciA8c2VsZWN0PiBjaGFuZ2UgZXZlbnRcclxuICAgICAgICAgICAgaWYgKCFpc0luaXQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGVsLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdXBkYXRlU2VsZWN0QWxsOiBmdW5jdGlvbiAoaXNJbml0KSB7XHJcbiAgICAgICAgICAgIHZhciAkaXRlbXMgPSB0aGlzLiRzZWxlY3RJdGVtcztcclxuXHJcbiAgICAgICAgICAgIGlmICghaXNJbml0KSB7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMgPSAkaXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgJGl0ZW1zLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmxlbmd0aCA9PT0gJGl0ZW1zLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICBpZiAoIWlzSW5pdCAmJiB0aGlzLiRzZWxlY3RBbGwucHJvcCgnY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMub25DaGVja0FsbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdXBkYXRlT3B0R3JvdXBTZWxlY3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICRpdGVtcyA9IHRoaXMuJHNlbGVjdEl0ZW1zLmZpbHRlcignOnZpc2libGUnKTtcclxuICAgICAgICAgICAgJC5lYWNoKHRoaXMuJHNlbGVjdEdyb3VwcywgZnVuY3Rpb24gKGksIHZhbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gJCh2YWwpLnBhcmVudCgpLmF0dHIoJ2RhdGEtZ3JvdXAnKSxcclxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4gPSAkaXRlbXMuZmlsdGVyKHNwcmludGYoJ1tkYXRhLWdyb3VwPVwiJXNcIl0nLCBncm91cCkpO1xyXG4gICAgICAgICAgICAgICAgJCh2YWwpLnByb3AoJ2NoZWNrZWQnLCAkY2hpbGRyZW4ubGVuZ3RoICYmXHJcbiAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuLmxlbmd0aCA9PT0gJGNoaWxkcmVuLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvL3ZhbHVlIG9yIHRleHQsIGRlZmF1bHQ6ICd2YWx1ZSdcclxuICAgICAgICBnZXRTZWxlY3RzOiBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB0ZXh0cyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuZmluZChzcHJpbnRmKCdpbnB1dFslc106Y2hlY2tlZCcsIHRoaXMuc2VsZWN0SXRlbU5hbWUpKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRleHRzLnB1c2goJCh0aGlzKS5wYXJlbnRzKCdsaScpLmZpcnN0KCkudGV4dCgpKTtcclxuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKCQodGhpcykudmFsKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAndGV4dCcgJiYgdGhpcy4kc2VsZWN0R3JvdXBzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gJC50cmltKCQodGhpcykucGFyZW50KCkudGV4dCgpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXAgPSAkKHRoaXMpLnBhcmVudCgpLmRhdGEoJ2dyb3VwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9IHRoYXQuJGRyb3AuZmluZChzcHJpbnRmKCdbJXNdW2RhdGEtZ3JvdXA9XCIlc1wiXScsIHRoYXQuc2VsZWN0SXRlbU5hbWUsIGdyb3VwKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzZWxlY3RlZCA9ICRjaGlsZHJlbi5maWx0ZXIoJzpjaGVja2VkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghJHNlbGVjdGVkLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2goJ1snKTtcclxuICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2godGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRjaGlsZHJlbi5sZW5ndGggPiAkc2VsZWN0ZWQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzZWxlY3RlZC5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaCgkKHRoaXMpLnBhcmVudCgpLnRleHQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2goJzogJyArIGxpc3Quam9pbignLCAnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaCgnXScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHRzLnB1c2goaHRtbC5qb2luKCcnKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHlwZSA9PT0gJ3RleHQnID8gdGV4dHMgOiB2YWx1ZXM7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2V0U2VsZWN0czogZnVuY3Rpb24gKHZhbHVlcykge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcy5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAkLmVhY2godmFsdWVzLCBmdW5jdGlvbiAoaSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcihzcHJpbnRmKCdbdmFsdWU9XCIlc1wiXScsIHZhbHVlKSkucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC4kZGlzYWJsZUl0ZW1zLmZpbHRlcihzcHJpbnRmKCdbdmFsdWU9XCIlc1wiXScsIHZhbHVlKSkucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnLCB0aGlzLiRzZWxlY3RJdGVtcy5sZW5ndGggPT09XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoICsgdGhpcy4kZGlzYWJsZUl0ZW1zLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuJHNlbGVjdEdyb3VwcywgZnVuY3Rpb24gKGksIHZhbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gJCh2YWwpLnBhcmVudCgpLmF0dHIoJ2RhdGEtZ3JvdXAnKSxcclxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4gPSB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoJ1tkYXRhLWdyb3VwPVwiJyArIGdyb3VwICsgJ1wiXScpO1xyXG4gICAgICAgICAgICAgICAgJCh2YWwpLnByb3AoJ2NoZWNrZWQnLCAkY2hpbGRyZW4ubGVuZ3RoICYmXHJcbiAgICAgICAgICAgICAgICAgICAgJGNoaWxkcmVuLmxlbmd0aCA9PT0gJGNoaWxkcmVuLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjaGVja0FsbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNoZWNrQWxsKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdW5jaGVja0FsbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vblVuY2hlY2tBbGwoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBmb2N1czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuZm9jdXMoKTtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uRm9jdXMoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBibHVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5ibHVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkJsdXIoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICByZWZyZXNoOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIH0sXHJcblx0XHRcclxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy4kcGFyZW50LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5kYXRhKCdtdWx0aXBsZVNlbGVjdCcsIG51bGwpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGZpbHRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB0ZXh0ID0gJC50cmltKHRoaXMuJHNlYXJjaElucHV0LnZhbCgpKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRleHQubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMucGFyZW50KCkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzYWJsZUl0ZW1zLnBhcmVudCgpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5wYXJlbnQoKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRwYXJlbnRbcmVtb3ZlRGlhY3JpdGljcygkcGFyZW50LnRleHQoKS50b0xvd2VyQ2FzZSgpKS5pbmRleE9mKHJlbW92ZURpYWNyaXRpY3ModGV4dCkpIDwgMCA/ICdoaWRlJyA6ICdzaG93J10oKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzYWJsZUl0ZW1zLnBhcmVudCgpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gJHBhcmVudC5hdHRyKCdkYXRhLWdyb3VwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcyA9IHRoYXQuJHNlbGVjdEl0ZW1zLmZpbHRlcignOnZpc2libGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAkcGFyZW50WyRpdGVtcy5maWx0ZXIoc3ByaW50ZignW2RhdGEtZ3JvdXA9XCIlc1wiXScsIGdyb3VwKSkubGVuZ3RoID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9DaGVjayBpZiBubyBtYXRjaGVzIGZvdW5kXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kc2VsZWN0SXRlbXMucGFyZW50KCkuZmlsdGVyKCc6dmlzaWJsZScpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlT3B0R3JvdXBTZWxlY3QoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTZWxlY3RBbGwoKTtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uRmlsdGVyKHRleHQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgJC5mbi5tdWx0aXBsZVNlbGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3B0aW9uID0gYXJndW1lbnRzWzBdLFxyXG4gICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzLFxyXG5cclxuICAgICAgICAgICAgdmFsdWUsXHJcbiAgICAgICAgICAgIGFsbG93ZWRNZXRob2RzID0gW1xyXG4gICAgICAgICAgICAgICAgJ2dldFNlbGVjdHMnLCAnc2V0U2VsZWN0cycsXHJcbiAgICAgICAgICAgICAgICAnZW5hYmxlJywgJ2Rpc2FibGUnLFxyXG4gICAgICAgICAgICAgICAgJ29wZW4nLCAnY2xvc2UnLFxyXG4gICAgICAgICAgICAgICAgJ2NoZWNrQWxsJywgJ3VuY2hlY2tBbGwnLFxyXG4gICAgICAgICAgICAgICAgJ2ZvY3VzJywgJ2JsdXInLFxyXG4gICAgICAgICAgICAgICAgJ3JlZnJlc2gnLCAnZGVzdHJveSdcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSAkdGhpcy5kYXRhKCdtdWx0aXBsZVNlbGVjdCcpLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCAkLmZuLm11bHRpcGxlU2VsZWN0LmRlZmF1bHRzLFxyXG4gICAgICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PT0gJ29iamVjdCcgJiYgb3B0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IG5ldyBNdWx0aXBsZVNlbGVjdCgkdGhpcywgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKCdtdWx0aXBsZVNlbGVjdCcsIGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkLmluQXJyYXkob3B0aW9uLCBhbGxvd2VkTWV0aG9kcykgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ1Vua25vd24gbWV0aG9kOiAnICsgb3B0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhW29wdGlvbl0oYXJnc1sxXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLmluaXQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChhcmdzWzFdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhW2FyZ3NbMV1dLmFwcGx5KGRhdGEsIFtdLnNsaWNlLmNhbGwoYXJncywgMikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnID8gdmFsdWUgOiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAkLmZuLm11bHRpcGxlU2VsZWN0LmRlZmF1bHRzID0ge1xyXG4gICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgIGlzT3BlbjogZmFsc2UsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICcnLFxyXG4gICAgICAgIHNlbGVjdEFsbDogdHJ1ZSxcclxuICAgICAgICBzZWxlY3RBbGxEZWxpbWl0ZXI6IFsnWycsICddJ10sXHJcbiAgICAgICAgbWluaW11bUNvdW50U2VsZWN0ZWQ6IDMsXHJcbiAgICAgICAgZWxsaXBzaXM6IGZhbHNlLFxyXG4gICAgICAgIG11bHRpcGxlOiBmYWxzZSxcclxuICAgICAgICBtdWx0aXBsZVdpZHRoOiA4MCxcclxuICAgICAgICBzaW5nbGU6IGZhbHNlLFxyXG4gICAgICAgIGZpbHRlcjogZmFsc2UsXHJcbiAgICAgICAgd2lkdGg6IHVuZGVmaW5lZCxcclxuICAgICAgICBkcm9wV2lkdGg6IHVuZGVmaW5lZCxcclxuICAgICAgICBtYXhIZWlnaHQ6IDI1MCxcclxuICAgICAgICBjb250YWluZXI6IG51bGwsXHJcbiAgICAgICAgcG9zaXRpb246ICdib3R0b20nLFxyXG4gICAgICAgIGtlZXBPcGVuOiBmYWxzZSxcclxuICAgICAgICBhbmltYXRlOiAnbm9uZScsIC8vICdub25lJywgJ2ZhZGUnLCAnc2xpZGUnXHJcbiAgICAgICAgZGlzcGxheVZhbHVlczogZmFsc2UsXHJcbiAgICAgICAgZGVsaW1pdGVyOiAnLCAnLFxyXG4gICAgICAgIGFkZFRpdGxlOiBmYWxzZSxcclxuICAgICAgICBmaWx0ZXJBY2NlcHRPbkVudGVyOiBmYWxzZSxcclxuICAgICAgICBoaWRlT3B0Z3JvdXBDaGVja2JveGVzOiBmYWxzZSxcclxuXHJcbiAgICAgICAgc2VsZWN0QWxsVGV4dDogJ1NlbGVjdCBhbGwnLFxyXG4gICAgICAgIGFsbFNlbGVjdGVkOiAnQWxsIHNlbGVjdGVkJyxcclxuICAgICAgICBjb3VudFNlbGVjdGVkOiAnIyBvZiAlIHNlbGVjdGVkJyxcclxuICAgICAgICBub01hdGNoZXNGb3VuZDogJ05vIG1hdGNoZXMgZm91bmQnLFxyXG5cclxuICAgICAgICBzdHlsZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGV4dFRlbXBsYXRlOiBmdW5jdGlvbiAoJGVsbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGVsbS5odG1sKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsYWJlbFRlbXBsYXRlOiBmdW5jdGlvbiAoJGVsbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGVsbS5hdHRyKCdsYWJlbCcpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uT3BlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uQ2hlY2tBbGw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25VbmNoZWNrQWxsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uT3B0Z3JvdXBDbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRmlsdGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAkKCdzZWxlY3RbbXVsdGlwbGVdJykubXVsdGlwbGVTZWxlY3QoKTtcclxufSkoalF1ZXJ5KTtcclxuIl19
