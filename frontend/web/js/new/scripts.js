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
  if (href.indexOf('store') > 0 || href.indexOf('coupon') > 0) {
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
!function(t){"function"==typeof define&&define.amd?define(["jquery"],t):"object"==typeof exports?module.exports=t(require("jquery")):t(jQuery)}(function(t){function o(o,e){this.element=o,this.$element=t(this.element),this.doc=t(document),this.win=t(window),this.settings=t.extend({},n,e),"object"==typeof this.$element.data("tipso")&&t.extend(this.settings,this.$element.data("tipso"));for(var r=Object.keys(this.$element.data()),s={},d=0;d<r.length;d++){var l=r[d].replace(i,"");if(""!==l){l=l.charAt(0).toLowerCase()+l.slice(1),s[l]=this.$element.data(r[d]);for(var p in this.settings)p.toLowerCase()==l&&(this.settings[p]=s[l])}}this._defaults=n,this._name=i,this._title=this.$element.attr("title"),this.mode="hide",this.ieFade=!a,this.settings.preferedPosition=this.settings.position,this.init()}function e(o){var e=o.clone();e.css("visibility","hidden"),t("body").append(e);var r=e.outerHeight(),s=e.outerWidth();return e.remove(),{width:s,height:r}}function r(t){t.removeClass("top_right_corner bottom_right_corner top_left_corner bottom_left_corner"),t.find(".tipso_title").removeClass("top_right_corner bottom_right_corner top_left_corner bottom_left_corner")}function s(o){var i,n,a,d=o.tooltip(),l=o.$element,p=o,f=t(window),g=10,c=p.settings.background,h=p.titleContent();switch(void 0!==h&&""!==h&&(c=p.settings.titleBackground),l.parent().outerWidth()>f.outerWidth()&&(f=l.parent()),p.settings.position){case"top-right":n=l.offset().left+l.outerWidth(),i=l.offset().top-e(d).height-g,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i<f.scrollTop()?(i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({"border-bottom-color":c,"border-top-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("bottom_right_corner"),d.find(".tipso_title").addClass("bottom_right_corner"),d.find(".tipso_arrow").css({"border-left-color":c}),d.removeClass("top-right top bottom left right"),d.addClass("bottom")):(d.find(".tipso_arrow").css({"border-top-color":p.settings.background,"border-bottom-color":"transparent ","border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("top_right_corner"),d.find(".tipso_arrow").css({"border-left-color":p.settings.background}),d.removeClass("top bottom left right"),d.addClass("top"));break;case"top-left":n=l.offset().left-e(d).width,i=l.offset().top-e(d).height-g,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i<f.scrollTop()?(i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({"border-bottom-color":c,"border-top-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("bottom_left_corner"),d.find(".tipso_title").addClass("bottom_left_corner"),d.find(".tipso_arrow").css({"border-right-color":c}),d.removeClass("top-right top bottom left right"),d.addClass("bottom")):(d.find(".tipso_arrow").css({"border-top-color":p.settings.background,"border-bottom-color":"transparent ","border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("top_left_corner"),d.find(".tipso_arrow").css({"border-right-color":p.settings.background}),d.removeClass("top bottom left right"),d.addClass("top"));break;case"bottom-right":n=l.offset().left+l.outerWidth(),i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i+e(d).height>f.scrollTop()+f.outerHeight()?(i=l.offset().top-e(d).height-g,d.find(".tipso_arrow").css({"border-bottom-color":"transparent","border-top-color":p.settings.background,"border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("top_right_corner"),d.find(".tipso_title").addClass("top_left_corner"),d.find(".tipso_arrow").css({"border-left-color":p.settings.background}),d.removeClass("top-right top bottom left right"),d.addClass("top")):(d.find(".tipso_arrow").css({"border-top-color":"transparent","border-bottom-color":c,"border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("bottom_right_corner"),d.find(".tipso_title").addClass("bottom_right_corner"),d.find(".tipso_arrow").css({"border-left-color":c}),d.removeClass("top bottom left right"),d.addClass("bottom"));break;case"bottom-left":n=l.offset().left-e(d).width,i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i+e(d).height>f.scrollTop()+f.outerHeight()?(i=l.offset().top-e(d).height-g,d.find(".tipso_arrow").css({"border-bottom-color":"transparent","border-top-color":p.settings.background,"border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("top_left_corner"),d.find(".tipso_title").addClass("top_left_corner"),d.find(".tipso_arrow").css({"border-right-color":p.settings.background}),d.removeClass("top-right top bottom left right"),d.addClass("top")):(d.find(".tipso_arrow").css({"border-top-color":"transparent","border-bottom-color":c,"border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("bottom_left_corner"),d.find(".tipso_title").addClass("bottom_left_corner"),d.find(".tipso_arrow").css({"border-right-color":c}),d.removeClass("top bottom left right"),d.addClass("bottom"));break;case"top":n=l.offset().left+l.outerWidth()/2-e(d).width/2,i=l.offset().top-e(d).height-g,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i<f.scrollTop()?(i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({"border-bottom-color":c,"border-top-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass("bottom")):(d.find(".tipso_arrow").css({"border-top-color":p.settings.background,"border-bottom-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass("top"));break;case"bottom":n=l.offset().left+l.outerWidth()/2-e(d).width/2,i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i+e(d).height>f.scrollTop()+f.outerHeight()?(i=l.offset().top-e(d).height-g,d.find(".tipso_arrow").css({"border-top-color":p.settings.background,"border-bottom-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass("top")):(d.find(".tipso_arrow").css({"border-bottom-color":c,"border-top-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass(p.settings.position));break;case"left":n=l.offset().left-e(d).width-g,i=l.offset().top+l.outerHeight()/2-e(d).height/2,d.find(".tipso_arrow").css({marginTop:-p.settings.arrowWidth,marginLeft:""}),n<f.scrollLeft()?(n=l.offset().left+l.outerWidth()+g,d.find(".tipso_arrow").css({"border-right-color":p.settings.background,"border-left-color":"transparent","border-top-color":"transparent","border-bottom-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass("right")):(d.find(".tipso_arrow").css({"border-left-color":p.settings.background,"border-right-color":"transparent","border-top-color":"transparent","border-bottom-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass(p.settings.position));break;case"right":n=l.offset().left+l.outerWidth()+g,i=l.offset().top+l.outerHeight()/2-e(d).height/2,d.find(".tipso_arrow").css({marginTop:-p.settings.arrowWidth,marginLeft:""}),n+g+p.settings.width>f.scrollLeft()+f.outerWidth()?(n=l.offset().left-e(d).width-g,d.find(".tipso_arrow").css({"border-left-color":p.settings.background,"border-right-color":"transparent","border-top-color":"transparent","border-bottom-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass("left")):(d.find(".tipso_arrow").css({"border-right-color":p.settings.background,"border-left-color":"transparent","border-top-color":"transparent","border-bottom-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass(p.settings.position))}if("top-right"===p.settings.position&&d.find(".tipso_arrow").css({"margin-left":-p.settings.width/2}),"top-left"===p.settings.position){var m=d.find(".tipso_arrow").eq(0);m.css({"margin-left":p.settings.width/2-2*p.settings.arrowWidth})}if("bottom-right"===p.settings.position){var m=d.find(".tipso_arrow").eq(0);m.css({"margin-left":-p.settings.width/2,"margin-top":""})}if("bottom-left"===p.settings.position){var m=d.find(".tipso_arrow").eq(0);m.css({"margin-left":p.settings.width/2-2*p.settings.arrowWidth,"margin-top":""})}n<f.scrollLeft()&&("bottom"===p.settings.position||"top"===p.settings.position)&&(d.find(".tipso_arrow").css({marginLeft:n-p.settings.arrowWidth}),n=0),n+p.settings.width>f.outerWidth()&&("bottom"===p.settings.position||"top"===p.settings.position)&&(a=f.outerWidth()-(n+p.settings.width),d.find(".tipso_arrow").css({marginLeft:-a-p.settings.arrowWidth,marginTop:""}),n+=a),n<f.scrollLeft()&&("left"===p.settings.position||"right"===p.settings.position||"top-right"===p.settings.position||"top-left"===p.settings.position||"bottom-right"===p.settings.position||"bottom-left"===p.settings.position)&&(n=l.offset().left+l.outerWidth()/2-e(d).width/2,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i=l.offset().top-e(d).height-g,i<f.scrollTop()?(i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({"border-bottom-color":c,"border-top-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),d.removeClass("top bottom left right"),r(d),d.addClass("bottom")):(d.find(".tipso_arrow").css({"border-top-color":p.settings.background,"border-bottom-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),d.removeClass("top bottom left right"),r(d),d.addClass("top")),n+p.settings.width>f.outerWidth()&&(a=f.outerWidth()-(n+p.settings.width),d.find(".tipso_arrow").css({marginLeft:-a-p.settings.arrowWidth,marginTop:""}),n+=a),n<f.scrollLeft()&&(d.find(".tipso_arrow").css({marginLeft:n-p.settings.arrowWidth}),n=0)),n+p.settings.width>f.outerWidth()&&("left"===p.settings.position||"right"===p.settings.position||"top-right"===p.settings.position||"top-left"===p.settings.position||"bottom-right"===p.settings.position||"bottom-right"===p.settings.position)&&(n=l.offset().left+l.outerWidth()/2-e(d).width/2,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i=l.offset().top-e(d).height-g,i<f.scrollTop()?(i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({"border-bottom-color":c,"border-top-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.removeClass("top bottom left right"),d.addClass("bottom")):(d.find(".tipso_arrow").css({"border-top-color":p.settings.background,"border-bottom-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.removeClass("top bottom left right"),d.addClass("top")),n+p.settings.width>f.outerWidth()&&(a=f.outerWidth()-(n+p.settings.width),d.find(".tipso_arrow").css({marginLeft:-a-p.settings.arrowWidth,marginTop:""}),n+=a),n<f.scrollLeft()&&(d.find(".tipso_arrow").css({marginLeft:n-p.settings.arrowWidth}),n=0)),d.css({left:n+p.settings.offsetX,top:i+p.settings.offsetY}),i<f.scrollTop()&&("right"===p.settings.position||"left"===p.settings.position)&&(l.tipso("update","position","bottom"),s(p)),i+e(d).height>f.scrollTop()+f.outerHeight()&&("right"===p.settings.position||"left"===p.settings.position)&&(l.tipso("update","position","top"),s(p))}var i="tipso",n={speed:400,background:"#55b555",titleBackground:"#333333",color:"#ffffff",titleColor:"#ffffff",titleContent:"",showArrow:!0,position:"top",width:200,maxWidth:"",delay:200,hideDelay:0,animationIn:"",animationOut:"",offsetX:0,offsetY:0,arrowWidth:8,tooltipHover:!1,content:null,ajaxContentUrl:null,ajaxContentBuffer:0,contentElementId:null,useTitle:!1,templateEngineFunc:null,onBeforeShow:null,onShow:null,onHide:null};t.extend(o.prototype,{init:function(){{var t=this,o=this.$element;this.doc}if(o.addClass("tipso_style").removeAttr("title"),t.settings.tooltipHover){var e=null,r=null;o.on("mouseover."+i,function(){clearTimeout(e),clearTimeout(r),r=setTimeout(function(){t.show()},150)}),o.on("mouseout."+i,function(){clearTimeout(e),clearTimeout(r),e=setTimeout(function(){t.hide()},200),t.tooltip().on("mouseover."+i,function(){t.mode="tooltipHover"}).on("mouseout."+i,function(){t.mode="show",clearTimeout(e),e=setTimeout(function(){t.hide()},200)})})}else o.on("mouseover."+i,function(){t.show()}),o.on("mouseout."+i,function(){t.hide()});t.settings.ajaxContentUrl&&(t.ajaxContent=null)},tooltip:function(){return this.tipso_bubble||(this.tipso_bubble=t('<div class="tipso_bubble"><div class="tipso_title"></div><div class="tipso_content"></div><div class="tipso_arrow"></div></div>')),this.tipso_bubble},show:function(){var o=this.tooltip(),e=this,r=this.win;e.settings.showArrow===!1?o.find(".tipso_arrow").hide():o.find(".tipso_arrow").show(),"hide"===e.mode&&(t.isFunction(e.settings.onBeforeShow)&&e.settings.onBeforeShow(e.$element,e.element,e),e.settings.size&&o.addClass(e.settings.size),e.settings.width?o.css({background:e.settings.background,color:e.settings.color,width:e.settings.width}).hide():e.settings.maxWidth?o.css({background:e.settings.background,color:e.settings.color,maxWidth:e.settings.maxWidth}).hide():o.css({background:e.settings.background,color:e.settings.color,width:200}).hide(),o.find(".tipso_title").css({background:e.settings.titleBackground,color:e.settings.titleColor}),o.find(".tipso_content").html(e.content()),o.find(".tipso_title").html(e.titleContent()),s(e),r.on("resize."+i,function(){e.settings.position=e.settings.preferedPosition,s(e)}),window.clearTimeout(e.timeout),e.timeout=null,e.timeout=window.setTimeout(function(){e.ieFade||""===e.settings.animationIn||""===e.settings.animationOut?o.appendTo("body").stop(!0,!0).fadeIn(e.settings.speed,function(){e.mode="show",t.isFunction(e.settings.onShow)&&e.settings.onShow(e.$element,e.element,e)}):o.remove().appendTo("body").stop(!0,!0).removeClass("animated "+e.settings.animationOut).addClass("noAnimation").removeClass("noAnimation").addClass("animated "+e.settings.animationIn).fadeIn(e.settings.speed,function(){t(this).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){t(this).removeClass("animated "+e.settings.animationIn)}),e.mode="show",t.isFunction(e.settings.onShow)&&e.settings.onShow(e.$element,e.element,e),r.off("resize."+i,null,"tipsoResizeHandler")})},e.settings.delay))},hide:function(o){var e=this,r=this.win,s=this.tooltip(),n=e.settings.hideDelay;o&&(n=0,e.mode="show"),window.clearTimeout(e.timeout),e.timeout=null,e.timeout=window.setTimeout(function(){"tooltipHover"!==e.mode&&(e.ieFade||""===e.settings.animationIn||""===e.settings.animationOut?s.stop(!0,!0).fadeOut(e.settings.speed,function(){t(this).remove(),t.isFunction(e.settings.onHide)&&"show"===e.mode&&e.settings.onHide(e.$element,e.element,e),e.mode="hide",r.off("resize."+i,null,"tipsoResizeHandler")}):s.stop(!0,!0).removeClass("animated "+e.settings.animationIn).addClass("noAnimation").removeClass("noAnimation").addClass("animated "+e.settings.animationOut).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){t(this).removeClass("animated "+e.settings.animationOut).remove(),t.isFunction(e.settings.onHide)&&"show"===e.mode&&e.settings.onHide(e.$element,e.element,e),e.mode="hide",r.off("resize."+i,null,"tipsoResizeHandler")}))},n)},close:function(){this.hide(!0)},destroy:function(){{var t=this.$element,o=this.win;this.doc}t.off("."+i),o.off("resize."+i,null,"tipsoResizeHandler"),t.removeData(i),t.removeClass("tipso_style").attr("title",this._title)},titleContent:function(){var t,o=this.$element,e=this;return t=e.settings.titleContent?e.settings.titleContent:o.data("tipso-title")},content:function(){var o,e=this.$element,r=this,s=this._title;return r.settings.ajaxContentUrl?r._ajaxContent?o=r._ajaxContent:(r._ajaxContent=o=t.ajax({type:"GET",url:r.settings.ajaxContentUrl,async:!1}).responseText,r.settings.ajaxContentBuffer>0?setTimeout(function(){r._ajaxContent=null},r.settings.ajaxContentBuffer):r._ajaxContent=null):r.settings.contentElementId?o=t("#"+r.settings.contentElementId).text():r.settings.content?o=r.settings.content:r.settings.useTitle===!0?o=s:"string"==typeof e.data("tipso")&&(o=e.data("tipso")),null!==r.settings.templateEngineFunc&&(o=r.settings.templateEngineFunc(o)),o},update:function(t,o){var e=this;return o?void(e.settings[t]=o):e.settings[t]}});var a=function(){var t=document.createElement("p").style,o=["ms","O","Moz","Webkit"];if(""===t.transition)return!0;for(;o.length;)if(o.pop()+"Transition"in t)return!0;return!1}();t[i]=t.fn[i]=function(e){var r=arguments;if(void 0===e||"object"==typeof e)return this instanceof t||t.extend(n,e),this.each(function(){t.data(this,"plugin_"+i)||t.data(this,"plugin_"+i,new o(this,e))});if("string"==typeof e&&"_"!==e[0]&&"init"!==e){var s;return this.each(function(){var n=t.data(this,"plugin_"+i);n||(n=t.data(this,"plugin_"+i,new o(this,e))),n instanceof o&&"function"==typeof n[e]&&(s=n[e].apply(n,Array.prototype.slice.call(r,1))),"destroy"===e&&t.data(this,"plugin_"+i,null)}),void 0!==s?s:this}}});
var myTooltip = function () {

  var tooltipClickTime;
  var tooltipTimeOut = null;

  $('[data-toggle=tooltip]').tipso({
    background: '#fff',
    color: '#434a54',
    size: 'small',
    delay: 10,
    speed: 10,
    width: 200,
    //maxWidth: 258,
    showArrow: true,
    onBeforeShow: function (ele, tipso) {
      this.content = ele.data('original-title');
      this.position = ele.data('placement') ? ele.data('placement') : 'top';
    }
  });

  $('[data-toggle=tooltip]').on('click', function (e) {
    tooltipClickTime = new Date();
    //убираем таймаут
    clearInterval(tooltipTimeOut);
    //закрывавем все тултипы
    $('[data-toggle=tooltip]').tipso('hide');
    //данный показывем
    $(this).tipso('show');
    //новый интервал
    tooltipTimeOut = setInterval(function () {
      if (new Date() - tooltipClickTime > 1000 * 5) {
        clearInterval(tooltipTimeOut);
        //закрываем все тултипы
        $('[data-toggle=tooltip]').tipso('hide');
      }
    }, 1000);
  });

}();

(function () {
  var $notyfi_btn = $('.header-logo_noty');
  if ($notyfi_btn.length == 0) {
    return;
  }

  $.get('/account/notification', function (data) {
    if (!data.notifications || data.notifications.length == 0) return;

    var out = '<div class=header-noty-box><ul class="header-noty-list">';
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
    out += '<a class="btn" href="/account/notification">' + data.btn + '</a>';
    out += '</div>';
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
// Нужно проверить
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

  //тест лого магазина
  var imgs=$('section:not(.navigation)')
  imgs=imgs.find('.logo img');
  if(imgs)
  for (var i=0;i<imgs.length;i++){
    var img=imgs.eq(i);
    var src=img.attr('src');
    img.attr('src','/images/template-logo.jpg');
    var data={
      src:src,
      img:img,
      type:0 // для img[src]
    };

    var image=$('<img/>',{
      src:src
    }).on('load',img_load_finish.bind(data));
    image.data('data',data);
  }

  imgs=null;
  //тест аватарок в коментариях
  imgs=$('.comment-photo,.scroll_box-avatar');
  if(imgs)
  for (var i=0;i<imgs.length;i++){
    var img=imgs.eq(i);
    if(img.hasClass('no_ava')){
      continue;
    }

    var src=img.css('background-image');
    if(!src)continue;
    src=src.replace('url("','');
    src=src.replace('")','');
    img.addClass('no_ava');
    img.css('background-image','url(/images/no_ava_square.png)');
    var data={
      src:src,
      img:img,
      type:1 // для фоновых картинок
    };
    var im=document.createElement('img');
    im.src=src;
    var im=$(im);
    im.on('load',img_load_finish.bind(data));
  }
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
    $this = $(this)
    console.log($this);
    return '<a href="' + $(this).data('link') + '" class="' + $this[0].className + '">' + $(this).text() + '</a>';
  })
})();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsInRpcHNvLm1pbi5qcyIsInRvb2x0aXAuanMiLCJhY2NvdW50X25vdGlmaWNhdGlvbi5qcyIsInNsaWRlci5qcyIsImhlYWRlcl9tZW51X2FuZF9zZWFyY2guanMiLCJjYWxjLWNhc2hiYWNrLmpzIiwiYXV0b19oaWRlX2NvbnRyb2wuanMiLCJoaWRlX3Nob3dfYWxsLmpzIiwiY2xvY2suanMiLCJsaXN0X3R5cGVfc3dpdGNoZXIuanMiLCJzZWxlY3QuanMiLCJzZWFyY2guanMiLCJnb3RvLmpzIiwiYWNjb3VudC13aXRoZHJhdy5qcyIsImFqYXguanMiLCJkb2Jyby5qcyIsImxlZnQtbWVudS10b2dnbGUuanMiLCJzaGFyZTQyLmpzIiwibm90aWZpY2F0aW9uLmpzIiwibW9kYWxzLmpzIiwiZm9vdGVyX21lbnUuanMiLCJyYXRpbmcuanMiLCJmYXZvcml0ZXMuanMiLCJzY3JvbGxfdG8uanMiLCJjb3B5X3RvX2NsaXBib2FyZC5qcyIsImltZy5qcyIsInBhcmVudHNfb3Blbl93aW5kb3dzLmpzIiwiZm9ybXMuanMiLCJjb29raWUuanMiLCJ0YWJsZS5qcyIsImFqYXhfcmVtb3ZlLmpzIiwiZml4ZXMuanMiLCJsaW5rcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BNQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuOEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsib2JqZWN0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIHZhciBjID0gYixcbiAgICBrZXk7XG4gIGZvciAoa2V5IGluIGEpIHtcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGM7XG59O1xuXG5mdW5jdGlvbiBsb2dpbl9yZWRpcmVjdChuZXdfaHJlZikge1xuICBocmVmID0gbG9jYXRpb24uaHJlZjtcbiAgaWYgKGhyZWYuaW5kZXhPZignc3RvcmUnKSA+IDAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKSA+IDApIHtcbiAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgfSBlbHNlIHtcbiAgICBsb2NhdGlvbi5ocmVmID0gbmV3X2hyZWY7XG4gIH1cbn1cbiIsIihmdW5jdGlvbiAodywgZCwgJCkge1xuICB2YXIgc2Nyb2xsc19ibG9jayA9ICQoJy5zY3JvbGxfYm94Jyk7XG5cbiAgaWYgKHNjcm9sbHNfYmxvY2subGVuZ3RoID09IDApIHJldHVybjtcbiAgLy8kKCc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC13cmFwXCI+PC9kaXY+Jykud3JhcEFsbChzY3JvbGxzX2Jsb2NrKTtcbiAgJChzY3JvbGxzX2Jsb2NrKS53cmFwKCc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC13cmFwXCI+PC9kaXY+Jyk7XG5cbiAgaW5pdF9zY3JvbGwoKTtcbiAgY2FsY19zY3JvbGwoKTtcblxuICB2YXIgdDEsIHQyO1xuXG4gICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0MSk7XG4gICAgY2xlYXJUaW1lb3V0KHQyKTtcbiAgICB0MSA9IHNldFRpbWVvdXQoY2FsY19zY3JvbGwsIDMwMCk7XG4gICAgdDIgPSBzZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLCA4MDApO1xuICB9KTtcblxuICBmdW5jdGlvbiBpbml0X3Njcm9sbCgpIHtcbiAgICB2YXIgY29udHJvbCA9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sXCI+PC9kaXY+JztcbiAgICBjb250cm9sID0gJChjb250cm9sKTtcbiAgICBjb250cm9sLmluc2VydEFmdGVyKHNjcm9sbHNfYmxvY2spO1xuICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7XG5cbiAgICBzY3JvbGxzX2Jsb2NrLnByZXBlbmQoJzxkaXYgY2xhc3M9c2Nyb2xsX2JveC1tb3Zlcj48L2Rpdj4nKTtcblxuICAgIGNvbnRyb2wub24oJ2NsaWNrJywgJy5zY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgdmFyIGNvbnRyb2wgPSAkdGhpcy5wYXJlbnQoKTtcbiAgICAgIHZhciBpID0gJHRoaXMuaW5kZXgoKTtcbiAgICAgIGlmICgkdGhpcy5oYXNDbGFzcygnYWN0aXZlJykpcmV0dXJuO1xuICAgICAgY29udHJvbC5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgJHRoaXMuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgICB2YXIgZHggPSBjb250cm9sLmRhdGEoJ3NsaWRlLWR4Jyk7XG4gICAgICB2YXIgZWwgPSBjb250cm9sLnByZXYoKTtcbiAgICAgIGVsLmZpbmQoJy5zY3JvbGxfYm94LW1vdmVyJykuY3NzKCdtYXJnaW4tbGVmdCcsIC1keCAqIGkpO1xuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBpKTtcblxuICAgICAgc3RvcFNjcm9sLmJpbmQoZWwpKCk7XG4gICAgfSlcbiAgfVxuXG4gIGZvciAodmFyIGogPSAwOyBqIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGorKykge1xuICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaik7XG4gICAgZWwucGFyZW50KCkuaG92ZXIoc3RvcFNjcm9sLmJpbmQoZWwpLCBzdGFydFNjcm9sLmJpbmQoZWwpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0U2Nyb2woKSB7XG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICBpZiAoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xuXG4gICAgdmFyIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZS5iaW5kKCR0aGlzKSwgMjAwMCk7XG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJywgdGltZW91dElkKVxuICB9XG5cbiAgZnVuY3Rpb24gc3RvcFNjcm9sKCkge1xuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgdmFyIHRpbWVvdXRJZCA9ICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpO1xuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIGZhbHNlKTtcbiAgICBpZiAoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikgfHwgIXRpbWVvdXRJZClyZXR1cm47XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJywgZmFsc2UpO1xuICAgIGlmICghJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XG5cbiAgICB2YXIgY29udHJvbHMgPSAkdGhpcy5uZXh0KCkuZmluZCgnPionKTtcbiAgICB2YXIgYWN0aXZlID0gJHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJyk7XG4gICAgdmFyIHBvaW50X2NudCA9IGNvbnRyb2xzLmxlbmd0aDtcbiAgICBpZiAoIWFjdGl2ZSlhY3RpdmUgPSAwO1xuICAgIGFjdGl2ZSsrO1xuICAgIGlmIChhY3RpdmUgPj0gcG9pbnRfY250KWFjdGl2ZSA9IDA7XG4gICAgJHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJywgYWN0aXZlKTtcblxuICAgIGNvbnRyb2xzLmVxKGFjdGl2ZSkuY2xpY2soKTtcbiAgICBzdGFydFNjcm9sLmJpbmQoJHRoaXMpKCk7XG4gIH1cblxuICBmdW5jdGlvbiBjYWxjX3Njcm9sbCgpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGVsID0gc2Nyb2xsc19ibG9jay5lcShpKTtcbiAgICAgIHZhciBjb250cm9sID0gZWwubmV4dCgpO1xuICAgICAgdmFyIHdpZHRoX21heCA9IGVsLmRhdGEoJ3Njcm9sbC13aWR0aC1tYXgnKTtcbiAgICAgIHcgPSBlbC53aWR0aCgpO1xuXG4gICAgICAvL9C00LXQu9Cw0LXQvCDQutC+0L3RgtGA0L7Qu9GMINC+0LPRgNCw0L3QuNGH0LXQvdC40Y8g0YjQuNGA0LjQvdGLLiDQldGB0LvQuCDQv9GA0LXQstGL0YjQtdC90L4g0YLQviDQvtGC0LrQu9GO0YfQsNC10Lwg0YHQutGA0L7QuyDQuCDQv9C10YDQtdGF0L7QtNC40Lwg0Log0YHQu9C10LTRg9GO0YnQtdC80YMg0Y3Qu9C10LzQtdC90YLRg1xuICAgICAgaWYgKHdpZHRoX21heCAmJiB3ID4gd2lkdGhfbWF4KSB7XG4gICAgICAgIGNvbnRyb2wucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBub19jbGFzcyA9IGVsLmRhdGEoJ3Njcm9sbC1lbGVtZXQtaWdub3JlLWNsYXNzJyk7XG4gICAgICB2YXIgY2hpbGRyZW4gPSBlbC5maW5kKCc+KicpLm5vdCgnLnNjcm9sbF9ib3gtbW92ZXInKTtcbiAgICAgIGlmIChub19jbGFzcykge1xuICAgICAgICBjaGlsZHJlbiA9IGNoaWxkcmVuLm5vdCgnLicgKyBub19jbGFzcylcbiAgICAgIH1cblxuICAgICAgLy/QldGB0LvQuCDQvdC10YIg0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXG4gICAgICBpZiAoY2hpbGRyZW4gPT0gMCkge1xuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGZfZWwgPSBjaGlsZHJlbi5lcSgxKTtcbiAgICAgIHZhciBjaGlsZHJlbl93ID0gZl9lbC5vdXRlcldpZHRoKCk7IC8v0LLRgdC10LPQviDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcbiAgICAgIGNoaWxkcmVuX3cgKz0gcGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLWxlZnQnKSk7XG4gICAgICBjaGlsZHJlbl93ICs9IHBhcnNlRmxvYXQoZl9lbC5jc3MoJ21hcmdpbi1yaWdodCcpKTtcblxuICAgICAgdmFyIHNjcmVhbl9jb3VudCA9IE1hdGguZmxvb3IodyAvIGNoaWxkcmVuX3cpO1xuXG4gICAgICAvL9CV0YHQu9C4INCy0YHQtSDQstC70LDQt9C40YIg0L3QsCDRjdC60YDQsNC9XG4gICAgICBpZiAoY2hpbGRyZW4gPD0gc2NyZWFuX2NvdW50KSB7XG4gICAgICAgIGVsLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvL9Cj0LbQtSDRgtC+0YfQvdC+INC30L3QsNC10Lwg0YfRgtC+INGB0LrRgNC+0Lsg0L3Rg9C20LXQvVxuICAgICAgZWwuYWRkQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcblxuICAgICAgdmFyIHBvaW50X2NudCA9IGNoaWxkcmVuLmxlbmd0aCAtIHNjcmVhbl9jb3VudCArIDE7XG4gICAgICAvL9C10YHQu9C4INC90LUg0L3QsNC00L4g0L7QsdC90L7QstC70Y/RgtGMINC60L7QvdGC0YDQvtC7INGC0L4g0LLRi9GF0L7QtNC40LwsINC90LUg0LfQsNCx0YvQstCw0Y8g0L7QsdC90L7QstC40YLRjCDRiNC40YDQuNC90YMg0LTQvtGH0LXRgNC90LjRhVxuICAgICAgaWYgKGNvbnRyb2wuZmluZCgnPionKS5sZW5ndGggPT0gcG9pbnRfY250KSB7XG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGFjdGl2ZSA9IGVsLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xuICAgICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcbiAgICAgIGlmIChhY3RpdmUgPj0gcG9pbnRfY250KWFjdGl2ZSA9IHBvaW50X2NudCAtIDE7XG4gICAgICB2YXIgb3V0ID0gJyc7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvaW50X2NudDsgaisrKSB7XG4gICAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcgKyAoaiA9PSBhY3RpdmUgPyAnIGFjdGl2ZScgOiAnJykgKyAnXCI+PC9kaXY+JztcbiAgICAgIH1cbiAgICAgIGNvbnRyb2wuaHRtbChvdXQpO1xuXG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWNvdW50JywgcG9pbnRfY250KTtcbiAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcblxuICAgICAgaWYgKCFlbC5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKSkge1xuICAgICAgICBzdGFydFNjcm9sLmJpbmQoZWwpKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSkpO1xuIiwidmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xuXG5hY2NvcmRpb25Db250cm9sLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJHRoaXMgPSAkKHRoaXMpO1xuICAkYWNjb3JkaW9uID0gJHRoaXMuY2xvc2VzdCgnLmFjY29yZGlvbicpO1xuXG5cbiAgaWYgKCRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi10aXRsZScpLmhhc0NsYXNzKCdhY2NvcmRpb24tdGl0bGUtZGlzYWJsZWQnKSlyZXR1cm47XG5cbiAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgIC8qaWYoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJykpe1xuICAgICByZXR1cm4gZmFsc2U7XG4gICAgIH0qL1xuICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2xpZGVVcCgzMDApO1xuICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxuICB9IGVsc2Uge1xuICAgIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdhY2NvcmRpb24tb25seV9vbmUnKSkge1xuICAgICAgJG90aGVyID0gJCgnLmFjY29yZGlvbi1vbmx5X29uZScpO1xuICAgICAgJG90aGVyLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXG4gICAgICAgIC5zbGlkZVVwKDMwMClcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcbiAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgJG90aGVyLnJlbW92ZUNsYXNzKCdsYXN0LW9wZW4nKTtcblxuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG4gICAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdsYXN0LW9wZW4nKTtcbiAgICB9XG4gICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zbGlkZURvd24oMzAwKTtcbiAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdvcGVuJyk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSk7XG5hY2NvcmRpb25Db250cm9sLnNob3coKTtcblxuXG4kKCcuYWNjb3JkaW9uLXdyYXAub3Blbl9maXJzdCAuYWNjb3JkaW9uOmZpcnN0LWNoaWxkJykuYWRkQ2xhc3MoJ29wZW4nKTtcbiQoJy5hY2NvcmRpb24td3JhcCAuYWNjb3JkaW9uLmFjY29yZGlvbi1zbGltOmZpcnN0LWNoaWxkJykuYWRkQ2xhc3MoJ29wZW4nKTtcbiQoJy5hY2NvcmRpb24tc2xpbScpLmFkZENsYXNzKCdhY2NvcmRpb24tb25seV9vbmUnKTtcblxuLy/QtNC70Y8g0YHQuNC80L7QsiDQvtGC0LrRgNGL0LLQsNC10Lwg0LXRgdC70Lgg0LXRgdGC0Ywg0L/QvtC80LXRgtC60LAgb3BlbiDRgtC+INC/0YDQuNGB0LLQsNC40LLQsNC10Lwg0LLRgdC1INC+0YHRgtCw0LvRjNC90YvQtSDQutC70LDRgdGLXG5hY2NvcmRpb25TbGltID0gJCgnLmFjY29yZGlvbi5hY2NvcmRpb24tb25seV9vbmUnKTtcbmlmIChhY2NvcmRpb25TbGltLmxlbmd0aCA+IDApIHtcbiAgYWNjb3JkaW9uU2xpbS5wYXJlbnQoKS5maW5kKCcuYWNjb3JkaW9uLm9wZW4nKVxuICAgIC5hZGRDbGFzcygnbGFzdC1vcGVuJylcbiAgICAuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcbiAgICAuc2hvdygzMDApXG4gICAgLmFkZENsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcbn1cblxuJCgnYm9keScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgJCgnLmFjY29yZGlvbl9mdWxsc2NyZWFuX2Nsb3NlLm9wZW4gLmFjY29yZGlvbi1jb250cm9sOmZpcnN0LWNoaWxkJykuY2xpY2soKVxufSk7XG5cbiQoJy5hY2NvcmRpb24tY29udGVudCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gIGlmIChlLnRhcmdldC50YWdOYW1lICE9ICdBJykge1xuICAgICQodGhpcykuY2xvc2VzdCgnLmFjY29yZGlvbicpLmZpbmQoJy5hY2NvcmRpb24tY29udHJvbC5hY2NvcmRpb24tdGl0bGUnKS5jbGljaygpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn0pO1xuXG4kKCcuYWNjb3JkaW9uLWNvbnRlbnQgYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgaWYgKCR0aGlzLmhhc0NsYXNzKCdhbmdsZS11cCcpKXJldHVybjtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKVxufSk7XG5cbiIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xuICB2YXIgZmlsZUFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiA/IHRydWUgOiBmYWxzZTtcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcidcbiAgfTtcbiAgdmFyIGxhc3RfcG9zdCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIG9uUG9zdChwb3N0KSB7XG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XG4gICAgLy9jb25zb2xlLmxvZyhwb3N0LCB0aGlzKTtcbiAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XG4gICAgdmFyIHdyYXBfaHRtbCA9IGRhdGEud3JhcF9odG1sO1xuXG4gICAgaWYgKHBvc3QucmVuZGVyKSB7XG4gICAgICBwb3N0Lm5vdHlmeV9jbGFzcyA9IFwibm90aWZ5X3doaXRlXCI7XG4gICAgICBub3RpZmljYXRpb24uYWxlcnQocG9zdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIGlmIChwb3N0Lmh0bWwpIHtcbiAgICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XG4gICAgICAgIGFqYXhGb3JtKHdyYXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFwb3N0LmVycm9yKSB7XG4gICAgICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgIHdyYXAuaHRtbCh3cmFwX2h0bWwpO1xuICAgICAgICAgIGZvcm0uZmluZCgnaW5wdXRbdHlwZT10ZXh0XSx0ZXh0YXJlYScpLnZhbCgnJylcbiAgICAgICAgICBhamF4Rm9ybSh3cmFwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcG9zdC5lcnJvciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgZm9yICh2YXIgaW5kZXggaW4gcG9zdC5lcnJvcikge1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgICAndHlwZSc6ICdlcnInLFxuICAgICAgICAgICd0aXRsZSc6ICfQntGI0LjQsdC60LAnLFxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpbmRleF1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvc3QuZXJyb3IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcbiAgICAgICAgICAndGl0bGUnOiAn0J7RiNC40LHQutCwJyxcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QuZXJyb3JbaV1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwb3N0LmVycm9yIHx8IHBvc3QubWVzc2FnZSkge1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgICAndHlwZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ3N1Y2Nlc3MnIDogJ2VycicsXG4gICAgICAgICAgJ3RpdGxlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAn0KPRgdC/0LXRiNC90L4nIDogJ9Ce0YjQuNCx0LrQsCcsXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0Lm1lc3NhZ2UgPyBwb3N0Lm1lc3NhZ2UgOiBwb3N0LmVycm9yXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICAvL1xuICAgIC8vIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgIC8vICAgICAndHlwZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ3N1Y2Nlc3MnIDogJ2VycicsXG4gICAgLy8gICAgICd0aXRsZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ9Cj0YHQv9C10YjQvdC+JyA6ICfQntGI0LjQsdC60LAnLFxuICAgIC8vICAgICAnbWVzc2FnZSc6IEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikgPyBwb3N0LmVycm9yWzBdIDogKHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3IpXG4gICAgLy8gfSk7XG4gIH1cblxuICBmdW5jdGlvbiBvbkZhaWwoKSB7XG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICB3cmFwLmh0bWwoJzxoMz7Qo9C/0YEuLi4g0JLQvtC30L3QuNC60LvQsCDQvdC10L/RgNC10LTQstC40LTQtdC90L3QsNGPINC+0YjQuNCx0LrQsDxoMz4nICtcbiAgICAgICc8cD7Qp9Cw0YHRgtC+INGN0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDQsiDRgdC70YPRh9Cw0LUsINC10YHQu9C4INCy0Ysg0L3QtdGB0LrQvtC70YzQutC+INGA0LDQtyDQv9C+0LTRgNGP0LQg0L3QtdCy0LXRgNC90L4g0LLQstC10LvQuCDRgdCy0L7QuCDRg9GH0LXRgtC90YvQtSDQtNCw0L3QvdGL0LUuINCd0L4g0LLQvtC30LzQvtC20L3RiyDQuCDQtNGA0YPQs9C40LUg0L/RgNC40YfQuNC90YsuINCSINC70Y7QsdC+0Lwg0YHQu9GD0YfQsNC1INC90LUg0YDQsNGB0YHRgtGA0LDQuNCy0LDQudGC0LXRgdGMINC4INC/0YDQvtGB0YLQviDQvtCx0YDQsNGC0LjRgtC10YHRjCDQuiDQvdCw0YjQtdC80YMg0L7Qv9C10YDQsNGC0L7RgNGDINGB0LvRg9C20LHRiyDQv9C+0LTQtNC10YDQttC60LguPC9wPjxicj4nICtcbiAgICAgICc8cD7QodC/0LDRgdC40LHQvi48L3A+Jyk7XG4gICAgYWpheEZvcm0od3JhcCk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU3VibWl0KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy9lLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIC8vZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIHZhciBjdXJyZW50VGltZU1pbGxpcyA9ICtuZXcgRGF0ZSgpO1xuICAgIGlmIChjdXJyZW50VGltZU1pbGxpcyAtIGxhc3RfcG9zdCA8IDEwMDAgKiAyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGFzdF9wb3N0ID0gY3VycmVudFRpbWVNaWxsaXM7XG4gICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xuICAgIGRhdGEud3JhcF9odG1sPXdyYXAuaHRtbCgpO1xuICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcblxuICAgIC8vaW5pdCh3cmFwKTtcblxuICAgIGlmIChmb3JtLnlpaUFjdGl2ZUZvcm0pIHtcbiAgICAgIHZhciBkID0gZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJyk7XG4gICAgICBpZiAoZCkge1xuICAgICAgICBkLnZhbGlkYXRlZCA9IHRydWU7XG4gICAgICAgIGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScsIGQpO1xuICAgICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJyk7XG4gICAgICAgIGlzVmFsaWQgPSBkLnZhbGlkYXRlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpc1ZhbGlkID0gaXNWYWxpZCAmJiAoZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aCA9PSAwKTtcblxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdmFyIHJlcXVpcmVkID0gZm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCcpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHJlcXVpcmVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBoZWxwQmxvY2sgPSByZXF1aXJlZC5lcShpKS5hdHRyKCd0eXBlJykgPT0gJ2hpZGRlbicgPyByZXF1aXJlZC5lcShpKS5uZXh0KCcuaGVscC1ibG9jaycpIDpcbiAgICAgICAgICByZXF1aXJlZC5lcShpKS5jbG9zZXN0KCcuZm9ybS1pbnB1dC1ncm91cCcpLm5leHQoJy5oZWxwLWJsb2NrJyk7XG4gICAgICAgIHZhciBoZWxwTWVzc2FnZSA9IGhlbHBCbG9jayAmJiBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpID8gaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA6ICfQndC10L7QsdGF0L7QtNC40LzQviDQt9Cw0L/QvtC70L3QuNGC0YwnO1xuXG4gICAgICAgIGlmIChyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgaGVscEJsb2NrLmh0bWwoaGVscE1lc3NhZ2UpO1xuICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoZWxwQmxvY2suaHRtbCgnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcblxuICAgIHZhciBwb3N0RGF0YSA9IGZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xuICAgIGZvcm0uaHRtbCgnJyk7XG4gICAgd3JhcC5odG1sKCc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHA+0J7RgtC/0YDQsNCy0LrQsCDQtNCw0L3QvdGL0YU8L3A+PC9kaXY+Jyk7XG5cbiAgICBkYXRhLnVybCArPSAoZGF0YS51cmwuaW5kZXhPZignPycpID4gMCA/ICcmJyA6ICc/JykgKyAncmM9JyArIE1hdGgucmFuZG9tKCk7XG4gICAgLy9jb25zb2xlLmxvZyhkYXRhLnVybCk7XG5cbiAgICAkLnBvc3QoXG4gICAgICBkYXRhLnVybCxcbiAgICAgIHBvc3REYXRhLFxuICAgICAgb25Qb3N0LmJpbmQoZGF0YSksXG4gICAgICAnanNvbidcbiAgICApLmZhaWwob25GYWlsLmJpbmQoZGF0YSkpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCh3cmFwKSB7XG4gICAgZm9ybSA9IHdyYXAuZmluZCgnZm9ybScpO1xuICAgIGRhdGEgPSB7XG4gICAgICBmb3JtOiBmb3JtLFxuICAgICAgcGFyYW06IGRlZmF1bHRzLFxuICAgICAgd3JhcDogd3JhcFxuICAgIH07XG4gICAgZGF0YS51cmwgPSBmb3JtLmF0dHIoJ2FjdGlvbicpIHx8IGxvY2F0aW9uLmhyZWY7XG4gICAgZGF0YS5tZXRob2QgPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcbiAgICBmb3JtLnVuYmluZCgnc3VibWl0Jyk7XG4gICAgLy9mb3JtLm9mZignc3VibWl0Jyk7XG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XG4gIH1cblxuICBlbHMuZmluZCgnW3JlcXVpcmVkXScpXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXG4gICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJyk7XG5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xuICAgIGluaXQoZWxzLmVxKGkpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRTUk8oKSB7XG4gICQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvID0ge307XG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgJC5lYWNoKGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xuICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xuICAgICAgICB9XG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbztcbiAgfTtcbn07XG5hZGRTUk8oKTsiLCIhZnVuY3Rpb24odCl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJqcXVlcnlcIl0sdCk6XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9dChyZXF1aXJlKFwianF1ZXJ5XCIpKTp0KGpRdWVyeSl9KGZ1bmN0aW9uKHQpe2Z1bmN0aW9uIG8obyxlKXt0aGlzLmVsZW1lbnQ9byx0aGlzLiRlbGVtZW50PXQodGhpcy5lbGVtZW50KSx0aGlzLmRvYz10KGRvY3VtZW50KSx0aGlzLndpbj10KHdpbmRvdyksdGhpcy5zZXR0aW5ncz10LmV4dGVuZCh7fSxuLGUpLFwib2JqZWN0XCI9PXR5cGVvZiB0aGlzLiRlbGVtZW50LmRhdGEoXCJ0aXBzb1wiKSYmdC5leHRlbmQodGhpcy5zZXR0aW5ncyx0aGlzLiRlbGVtZW50LmRhdGEoXCJ0aXBzb1wiKSk7Zm9yKHZhciByPU9iamVjdC5rZXlzKHRoaXMuJGVsZW1lbnQuZGF0YSgpKSxzPXt9LGQ9MDtkPHIubGVuZ3RoO2QrKyl7dmFyIGw9cltkXS5yZXBsYWNlKGksXCJcIik7aWYoXCJcIiE9PWwpe2w9bC5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKStsLnNsaWNlKDEpLHNbbF09dGhpcy4kZWxlbWVudC5kYXRhKHJbZF0pO2Zvcih2YXIgcCBpbiB0aGlzLnNldHRpbmdzKXAudG9Mb3dlckNhc2UoKT09bCYmKHRoaXMuc2V0dGluZ3NbcF09c1tsXSl9fXRoaXMuX2RlZmF1bHRzPW4sdGhpcy5fbmFtZT1pLHRoaXMuX3RpdGxlPXRoaXMuJGVsZW1lbnQuYXR0cihcInRpdGxlXCIpLHRoaXMubW9kZT1cImhpZGVcIix0aGlzLmllRmFkZT0hYSx0aGlzLnNldHRpbmdzLnByZWZlcmVkUG9zaXRpb249dGhpcy5zZXR0aW5ncy5wb3NpdGlvbix0aGlzLmluaXQoKX1mdW5jdGlvbiBlKG8pe3ZhciBlPW8uY2xvbmUoKTtlLmNzcyhcInZpc2liaWxpdHlcIixcImhpZGRlblwiKSx0KFwiYm9keVwiKS5hcHBlbmQoZSk7dmFyIHI9ZS5vdXRlckhlaWdodCgpLHM9ZS5vdXRlcldpZHRoKCk7cmV0dXJuIGUucmVtb3ZlKCkse3dpZHRoOnMsaGVpZ2h0OnJ9fWZ1bmN0aW9uIHIodCl7dC5yZW1vdmVDbGFzcyhcInRvcF9yaWdodF9jb3JuZXIgYm90dG9tX3JpZ2h0X2Nvcm5lciB0b3BfbGVmdF9jb3JuZXIgYm90dG9tX2xlZnRfY29ybmVyXCIpLHQuZmluZChcIi50aXBzb190aXRsZVwiKS5yZW1vdmVDbGFzcyhcInRvcF9yaWdodF9jb3JuZXIgYm90dG9tX3JpZ2h0X2Nvcm5lciB0b3BfbGVmdF9jb3JuZXIgYm90dG9tX2xlZnRfY29ybmVyXCIpfWZ1bmN0aW9uIHMobyl7dmFyIGksbixhLGQ9by50b29sdGlwKCksbD1vLiRlbGVtZW50LHA9byxmPXQod2luZG93KSxnPTEwLGM9cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLGg9cC50aXRsZUNvbnRlbnQoKTtzd2l0Y2godm9pZCAwIT09aCYmXCJcIiE9PWgmJihjPXAuc2V0dGluZ3MudGl0bGVCYWNrZ3JvdW5kKSxsLnBhcmVudCgpLm91dGVyV2lkdGgoKT5mLm91dGVyV2lkdGgoKSYmKGY9bC5wYXJlbnQoKSkscC5zZXR0aW5ncy5wb3NpdGlvbil7Y2FzZVwidG9wLXJpZ2h0XCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCksaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwiYm90dG9tX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJib3R0b21fcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpjfSksZC5yZW1vdmVDbGFzcyhcInRvcC1yaWdodCB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50IFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmR9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpO2JyZWFrO2Nhc2VcInRvcC1sZWZ0XCI6bj1sLm9mZnNldCgpLmxlZnQtZShkKS53aWR0aCxpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21fbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwiYm90dG9tX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6Y30pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AtcmlnaHQgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudCBcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwidG9wX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kfSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTticmVhaztjYXNlXCJib3R0b20tcmlnaHRcIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKSxpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGkrZShkKS5oZWlnaHQ+Zi5zY3JvbGxUb3AoKStmLm91dGVySGVpZ2h0KCk/KGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcInRvcF9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kfSksZC5yZW1vdmVDbGFzcyhcInRvcC1yaWdodCB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21fcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcImJvdHRvbV9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOmN9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpO2JyZWFrO2Nhc2VcImJvdHRvbS1sZWZ0XCI6bj1sLm9mZnNldCgpLmxlZnQtZShkKS53aWR0aCxpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGkrZShkKS5oZWlnaHQ+Zi5zY3JvbGxUb3AoKStmLm91dGVySGVpZ2h0KCk/KGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BfbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwidG9wX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kfSksZC5yZW1vdmVDbGFzcyhcInRvcC1yaWdodCB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21fbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwiYm90dG9tX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6Y30pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk7YnJlYWs7Y2FzZVwidG9wXCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkvMi1lKGQpLndpZHRoLzIsaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTticmVhaztjYXNlXCJib3R0b21cIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKS8yLWUoZCkud2lkdGgvMixpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGkrZShkKS5oZWlnaHQ+Zi5zY3JvbGxUb3AoKStmLm91dGVySGVpZ2h0KCk/KGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKHAuc2V0dGluZ3MucG9zaXRpb24pKTticmVhaztjYXNlXCJsZWZ0XCI6bj1sLm9mZnNldCgpLmxlZnQtZShkKS53aWR0aC1nLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpLzItZShkKS5oZWlnaHQvMixkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5Ub3A6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5MZWZ0OlwiXCJ9KSxuPGYuc2Nyb2xsTGVmdCgpPyhuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInJpZ2h0XCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKHAuc2V0dGluZ3MucG9zaXRpb24pKTticmVhaztjYXNlXCJyaWdodFwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpK2csaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkvMi1lKGQpLmhlaWdodC8yLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpblRvcDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpbkxlZnQ6XCJcIn0pLG4rZytwLnNldHRpbmdzLndpZHRoPmYuc2Nyb2xsTGVmdCgpK2Yub3V0ZXJXaWR0aCgpPyhuPWwub2Zmc2V0KCkubGVmdC1lKGQpLndpZHRoLWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwibGVmdFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhwLnNldHRpbmdzLnBvc2l0aW9uKSl9aWYoXCJ0b3AtcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24mJmQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wibWFyZ2luLWxlZnRcIjotcC5zZXR0aW5ncy53aWR0aC8yfSksXCJ0b3AtbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbil7dmFyIG09ZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmVxKDApO20uY3NzKHtcIm1hcmdpbi1sZWZ0XCI6cC5zZXR0aW5ncy53aWR0aC8yLTIqcC5zZXR0aW5ncy5hcnJvd1dpZHRofSl9aWYoXCJib3R0b20tcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pe3ZhciBtPWQuZmluZChcIi50aXBzb19hcnJvd1wiKS5lcSgwKTttLmNzcyh7XCJtYXJnaW4tbGVmdFwiOi1wLnNldHRpbmdzLndpZHRoLzIsXCJtYXJnaW4tdG9wXCI6XCJcIn0pfWlmKFwiYm90dG9tLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pe3ZhciBtPWQuZmluZChcIi50aXBzb19hcnJvd1wiKS5lcSgwKTttLmNzcyh7XCJtYXJnaW4tbGVmdFwiOnAuc2V0dGluZ3Mud2lkdGgvMi0yKnAuc2V0dGluZ3MuYXJyb3dXaWR0aCxcIm1hcmdpbi10b3BcIjpcIlwifSl9bjxmLnNjcm9sbExlZnQoKSYmKFwiYm90dG9tXCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Om4tcC5zZXR0aW5ncy5hcnJvd1dpZHRofSksbj0wKSxuK3Auc2V0dGluZ3Mud2lkdGg+Zi5vdXRlcldpZHRoKCkmJihcImJvdHRvbVwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3BcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYoYT1mLm91dGVyV2lkdGgoKS0obitwLnNldHRpbmdzLndpZHRoKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1hLXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLG4rPWEpLG48Zi5zY3JvbGxMZWZ0KCkmJihcImxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwicmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcC1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImJvdHRvbS1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJib3R0b20tbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKS8yLWUoZCkud2lkdGgvMixkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIikscihkKSxkLmFkZENsYXNzKFwidG9wXCIpKSxuK3Auc2V0dGluZ3Mud2lkdGg+Zi5vdXRlcldpZHRoKCkmJihhPWYub3V0ZXJXaWR0aCgpLShuK3Auc2V0dGluZ3Mud2lkdGgpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LWEtcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksbis9YSksbjxmLnNjcm9sbExlZnQoKSYmKGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6bi1wLnNldHRpbmdzLmFycm93V2lkdGh9KSxuPTApKSxuK3Auc2V0dGluZ3Mud2lkdGg+Zi5vdXRlcldpZHRoKCkmJihcImxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwicmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcC1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImJvdHRvbS1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJib3R0b20tcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYobj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkvMi1lKGQpLndpZHRoLzIsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSksbitwLnNldHRpbmdzLndpZHRoPmYub3V0ZXJXaWR0aCgpJiYoYT1mLm91dGVyV2lkdGgoKS0obitwLnNldHRpbmdzLndpZHRoKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1hLXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLG4rPWEpLG48Zi5zY3JvbGxMZWZ0KCkmJihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Om4tcC5zZXR0aW5ncy5hcnJvd1dpZHRofSksbj0wKSksZC5jc3Moe2xlZnQ6bitwLnNldHRpbmdzLm9mZnNldFgsdG9wOmkrcC5zZXR0aW5ncy5vZmZzZXRZfSksaTxmLnNjcm9sbFRvcCgpJiYoXCJyaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJsZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKGwudGlwc28oXCJ1cGRhdGVcIixcInBvc2l0aW9uXCIsXCJib3R0b21cIikscyhwKSksaStlKGQpLmhlaWdodD5mLnNjcm9sbFRvcCgpK2Yub3V0ZXJIZWlnaHQoKSYmKFwicmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwibGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihsLnRpcHNvKFwidXBkYXRlXCIsXCJwb3NpdGlvblwiLFwidG9wXCIpLHMocCkpfXZhciBpPVwidGlwc29cIixuPXtzcGVlZDo0MDAsYmFja2dyb3VuZDpcIiM1NWI1NTVcIix0aXRsZUJhY2tncm91bmQ6XCIjMzMzMzMzXCIsY29sb3I6XCIjZmZmZmZmXCIsdGl0bGVDb2xvcjpcIiNmZmZmZmZcIix0aXRsZUNvbnRlbnQ6XCJcIixzaG93QXJyb3c6ITAscG9zaXRpb246XCJ0b3BcIix3aWR0aDoyMDAsbWF4V2lkdGg6XCJcIixkZWxheToyMDAsaGlkZURlbGF5OjAsYW5pbWF0aW9uSW46XCJcIixhbmltYXRpb25PdXQ6XCJcIixvZmZzZXRYOjAsb2Zmc2V0WTowLGFycm93V2lkdGg6OCx0b29sdGlwSG92ZXI6ITEsY29udGVudDpudWxsLGFqYXhDb250ZW50VXJsOm51bGwsYWpheENvbnRlbnRCdWZmZXI6MCxjb250ZW50RWxlbWVudElkOm51bGwsdXNlVGl0bGU6ITEsdGVtcGxhdGVFbmdpbmVGdW5jOm51bGwsb25CZWZvcmVTaG93Om51bGwsb25TaG93Om51bGwsb25IaWRlOm51bGx9O3QuZXh0ZW5kKG8ucHJvdG90eXBlLHtpbml0OmZ1bmN0aW9uKCl7e3ZhciB0PXRoaXMsbz10aGlzLiRlbGVtZW50O3RoaXMuZG9jfWlmKG8uYWRkQ2xhc3MoXCJ0aXBzb19zdHlsZVwiKS5yZW1vdmVBdHRyKFwidGl0bGVcIiksdC5zZXR0aW5ncy50b29sdGlwSG92ZXIpe3ZhciBlPW51bGwscj1udWxsO28ub24oXCJtb3VzZW92ZXIuXCIraSxmdW5jdGlvbigpe2NsZWFyVGltZW91dChlKSxjbGVhclRpbWVvdXQocikscj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC5zaG93KCl9LDE1MCl9KSxvLm9uKFwibW91c2VvdXQuXCIraSxmdW5jdGlvbigpe2NsZWFyVGltZW91dChlKSxjbGVhclRpbWVvdXQociksZT1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC5oaWRlKCl9LDIwMCksdC50b29sdGlwKCkub24oXCJtb3VzZW92ZXIuXCIraSxmdW5jdGlvbigpe3QubW9kZT1cInRvb2x0aXBIb3ZlclwifSkub24oXCJtb3VzZW91dC5cIitpLGZ1bmN0aW9uKCl7dC5tb2RlPVwic2hvd1wiLGNsZWFyVGltZW91dChlKSxlPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0LmhpZGUoKX0sMjAwKX0pfSl9ZWxzZSBvLm9uKFwibW91c2VvdmVyLlwiK2ksZnVuY3Rpb24oKXt0LnNob3coKX0pLG8ub24oXCJtb3VzZW91dC5cIitpLGZ1bmN0aW9uKCl7dC5oaWRlKCl9KTt0LnNldHRpbmdzLmFqYXhDb250ZW50VXJsJiYodC5hamF4Q29udGVudD1udWxsKX0sdG9vbHRpcDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnRpcHNvX2J1YmJsZXx8KHRoaXMudGlwc29fYnViYmxlPXQoJzxkaXYgY2xhc3M9XCJ0aXBzb19idWJibGVcIj48ZGl2IGNsYXNzPVwidGlwc29fdGl0bGVcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGlwc29fY29udGVudFwiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXBzb19hcnJvd1wiPjwvZGl2PjwvZGl2PicpKSx0aGlzLnRpcHNvX2J1YmJsZX0sc2hvdzpmdW5jdGlvbigpe3ZhciBvPXRoaXMudG9vbHRpcCgpLGU9dGhpcyxyPXRoaXMud2luO2Uuc2V0dGluZ3Muc2hvd0Fycm93PT09ITE/by5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmhpZGUoKTpvLmZpbmQoXCIudGlwc29fYXJyb3dcIikuc2hvdygpLFwiaGlkZVwiPT09ZS5tb2RlJiYodC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25CZWZvcmVTaG93KSYmZS5zZXR0aW5ncy5vbkJlZm9yZVNob3coZS4kZWxlbWVudCxlLmVsZW1lbnQsZSksZS5zZXR0aW5ncy5zaXplJiZvLmFkZENsYXNzKGUuc2V0dGluZ3Muc2l6ZSksZS5zZXR0aW5ncy53aWR0aD9vLmNzcyh7YmFja2dyb3VuZDplLnNldHRpbmdzLmJhY2tncm91bmQsY29sb3I6ZS5zZXR0aW5ncy5jb2xvcix3aWR0aDplLnNldHRpbmdzLndpZHRofSkuaGlkZSgpOmUuc2V0dGluZ3MubWF4V2lkdGg/by5jc3Moe2JhY2tncm91bmQ6ZS5zZXR0aW5ncy5iYWNrZ3JvdW5kLGNvbG9yOmUuc2V0dGluZ3MuY29sb3IsbWF4V2lkdGg6ZS5zZXR0aW5ncy5tYXhXaWR0aH0pLmhpZGUoKTpvLmNzcyh7YmFja2dyb3VuZDplLnNldHRpbmdzLmJhY2tncm91bmQsY29sb3I6ZS5zZXR0aW5ncy5jb2xvcix3aWR0aDoyMDB9KS5oaWRlKCksby5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmNzcyh7YmFja2dyb3VuZDplLnNldHRpbmdzLnRpdGxlQmFja2dyb3VuZCxjb2xvcjplLnNldHRpbmdzLnRpdGxlQ29sb3J9KSxvLmZpbmQoXCIudGlwc29fY29udGVudFwiKS5odG1sKGUuY29udGVudCgpKSxvLmZpbmQoXCIudGlwc29fdGl0bGVcIikuaHRtbChlLnRpdGxlQ29udGVudCgpKSxzKGUpLHIub24oXCJyZXNpemUuXCIraSxmdW5jdGlvbigpe2Uuc2V0dGluZ3MucG9zaXRpb249ZS5zZXR0aW5ncy5wcmVmZXJlZFBvc2l0aW9uLHMoZSl9KSx3aW5kb3cuY2xlYXJUaW1lb3V0KGUudGltZW91dCksZS50aW1lb3V0PW51bGwsZS50aW1lb3V0PXdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5pZUZhZGV8fFwiXCI9PT1lLnNldHRpbmdzLmFuaW1hdGlvbklufHxcIlwiPT09ZS5zZXR0aW5ncy5hbmltYXRpb25PdXQ/by5hcHBlbmRUbyhcImJvZHlcIikuc3RvcCghMCwhMCkuZmFkZUluKGUuc2V0dGluZ3Muc3BlZWQsZnVuY3Rpb24oKXtlLm1vZGU9XCJzaG93XCIsdC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25TaG93KSYmZS5zZXR0aW5ncy5vblNob3coZS4kZWxlbWVudCxlLmVsZW1lbnQsZSl9KTpvLnJlbW92ZSgpLmFwcGVuZFRvKFwiYm9keVwiKS5zdG9wKCEwLCEwKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uT3V0KS5hZGRDbGFzcyhcIm5vQW5pbWF0aW9uXCIpLnJlbW92ZUNsYXNzKFwibm9BbmltYXRpb25cIikuYWRkQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbkluKS5mYWRlSW4oZS5zZXR0aW5ncy5zcGVlZCxmdW5jdGlvbigpe3QodGhpcykub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7dCh0aGlzKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uSW4pfSksZS5tb2RlPVwic2hvd1wiLHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uU2hvdykmJmUuc2V0dGluZ3Mub25TaG93KGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpLHIub2ZmKFwicmVzaXplLlwiK2ksbnVsbCxcInRpcHNvUmVzaXplSGFuZGxlclwiKX0pfSxlLnNldHRpbmdzLmRlbGF5KSl9LGhpZGU6ZnVuY3Rpb24obyl7dmFyIGU9dGhpcyxyPXRoaXMud2luLHM9dGhpcy50b29sdGlwKCksbj1lLnNldHRpbmdzLmhpZGVEZWxheTtvJiYobj0wLGUubW9kZT1cInNob3dcIiksd2luZG93LmNsZWFyVGltZW91dChlLnRpbWVvdXQpLGUudGltZW91dD1udWxsLGUudGltZW91dD13aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1widG9vbHRpcEhvdmVyXCIhPT1lLm1vZGUmJihlLmllRmFkZXx8XCJcIj09PWUuc2V0dGluZ3MuYW5pbWF0aW9uSW58fFwiXCI9PT1lLnNldHRpbmdzLmFuaW1hdGlvbk91dD9zLnN0b3AoITAsITApLmZhZGVPdXQoZS5zZXR0aW5ncy5zcGVlZCxmdW5jdGlvbigpe3QodGhpcykucmVtb3ZlKCksdC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25IaWRlKSYmXCJzaG93XCI9PT1lLm1vZGUmJmUuc2V0dGluZ3Mub25IaWRlKGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpLGUubW9kZT1cImhpZGVcIixyLm9mZihcInJlc2l6ZS5cIitpLG51bGwsXCJ0aXBzb1Jlc2l6ZUhhbmRsZXJcIil9KTpzLnN0b3AoITAsITApLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25JbikuYWRkQ2xhc3MoXCJub0FuaW1hdGlvblwiKS5yZW1vdmVDbGFzcyhcIm5vQW5pbWF0aW9uXCIpLmFkZENsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25PdXQpLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe3QodGhpcykucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbk91dCkucmVtb3ZlKCksdC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25IaWRlKSYmXCJzaG93XCI9PT1lLm1vZGUmJmUuc2V0dGluZ3Mub25IaWRlKGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpLGUubW9kZT1cImhpZGVcIixyLm9mZihcInJlc2l6ZS5cIitpLG51bGwsXCJ0aXBzb1Jlc2l6ZUhhbmRsZXJcIil9KSl9LG4pfSxjbG9zZTpmdW5jdGlvbigpe3RoaXMuaGlkZSghMCl9LGRlc3Ryb3k6ZnVuY3Rpb24oKXt7dmFyIHQ9dGhpcy4kZWxlbWVudCxvPXRoaXMud2luO3RoaXMuZG9jfXQub2ZmKFwiLlwiK2kpLG8ub2ZmKFwicmVzaXplLlwiK2ksbnVsbCxcInRpcHNvUmVzaXplSGFuZGxlclwiKSx0LnJlbW92ZURhdGEoaSksdC5yZW1vdmVDbGFzcyhcInRpcHNvX3N0eWxlXCIpLmF0dHIoXCJ0aXRsZVwiLHRoaXMuX3RpdGxlKX0sdGl0bGVDb250ZW50OmZ1bmN0aW9uKCl7dmFyIHQsbz10aGlzLiRlbGVtZW50LGU9dGhpcztyZXR1cm4gdD1lLnNldHRpbmdzLnRpdGxlQ29udGVudD9lLnNldHRpbmdzLnRpdGxlQ29udGVudDpvLmRhdGEoXCJ0aXBzby10aXRsZVwiKX0sY29udGVudDpmdW5jdGlvbigpe3ZhciBvLGU9dGhpcy4kZWxlbWVudCxyPXRoaXMscz10aGlzLl90aXRsZTtyZXR1cm4gci5zZXR0aW5ncy5hamF4Q29udGVudFVybD9yLl9hamF4Q29udGVudD9vPXIuX2FqYXhDb250ZW50OihyLl9hamF4Q29udGVudD1vPXQuYWpheCh7dHlwZTpcIkdFVFwiLHVybDpyLnNldHRpbmdzLmFqYXhDb250ZW50VXJsLGFzeW5jOiExfSkucmVzcG9uc2VUZXh0LHIuc2V0dGluZ3MuYWpheENvbnRlbnRCdWZmZXI+MD9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ci5fYWpheENvbnRlbnQ9bnVsbH0sci5zZXR0aW5ncy5hamF4Q29udGVudEJ1ZmZlcik6ci5fYWpheENvbnRlbnQ9bnVsbCk6ci5zZXR0aW5ncy5jb250ZW50RWxlbWVudElkP289dChcIiNcIityLnNldHRpbmdzLmNvbnRlbnRFbGVtZW50SWQpLnRleHQoKTpyLnNldHRpbmdzLmNvbnRlbnQ/bz1yLnNldHRpbmdzLmNvbnRlbnQ6ci5zZXR0aW5ncy51c2VUaXRsZT09PSEwP289czpcInN0cmluZ1wiPT10eXBlb2YgZS5kYXRhKFwidGlwc29cIikmJihvPWUuZGF0YShcInRpcHNvXCIpKSxudWxsIT09ci5zZXR0aW5ncy50ZW1wbGF0ZUVuZ2luZUZ1bmMmJihvPXIuc2V0dGluZ3MudGVtcGxhdGVFbmdpbmVGdW5jKG8pKSxvfSx1cGRhdGU6ZnVuY3Rpb24odCxvKXt2YXIgZT10aGlzO3JldHVybiBvP3ZvaWQoZS5zZXR0aW5nc1t0XT1vKTplLnNldHRpbmdzW3RdfX0pO3ZhciBhPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIikuc3R5bGUsbz1bXCJtc1wiLFwiT1wiLFwiTW96XCIsXCJXZWJraXRcIl07aWYoXCJcIj09PXQudHJhbnNpdGlvbilyZXR1cm4hMDtmb3IoO28ubGVuZ3RoOylpZihvLnBvcCgpK1wiVHJhbnNpdGlvblwiaW4gdClyZXR1cm4hMDtyZXR1cm4hMX0oKTt0W2ldPXQuZm5baV09ZnVuY3Rpb24oZSl7dmFyIHI9YXJndW1lbnRzO2lmKHZvaWQgMD09PWV8fFwib2JqZWN0XCI9PXR5cGVvZiBlKXJldHVybiB0aGlzIGluc3RhbmNlb2YgdHx8dC5leHRlbmQobixlKSx0aGlzLmVhY2goZnVuY3Rpb24oKXt0LmRhdGEodGhpcyxcInBsdWdpbl9cIitpKXx8dC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSxuZXcgbyh0aGlzLGUpKX0pO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBlJiZcIl9cIiE9PWVbMF0mJlwiaW5pdFwiIT09ZSl7dmFyIHM7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBuPXQuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2kpO258fChuPXQuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2ksbmV3IG8odGhpcyxlKSkpLG4gaW5zdGFuY2VvZiBvJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBuW2VdJiYocz1uW2VdLmFwcGx5KG4sQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwociwxKSkpLFwiZGVzdHJveVwiPT09ZSYmdC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSxudWxsKX0pLHZvaWQgMCE9PXM/czp0aGlzfX19KTsiLCJ2YXIgbXlUb29sdGlwID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciB0b29sdGlwQ2xpY2tUaW1lO1xuICB2YXIgdG9vbHRpcFRpbWVPdXQgPSBudWxsO1xuXG4gICQoJ1tkYXRhLXRvZ2dsZT10b29sdGlwXScpLnRpcHNvKHtcbiAgICBiYWNrZ3JvdW5kOiAnI2ZmZicsXG4gICAgY29sb3I6ICcjNDM0YTU0JyxcbiAgICBzaXplOiAnc21hbGwnLFxuICAgIGRlbGF5OiAxMCxcbiAgICBzcGVlZDogMTAsXG4gICAgd2lkdGg6IDIwMCxcbiAgICAvL21heFdpZHRoOiAyNTgsXG4gICAgc2hvd0Fycm93OiB0cnVlLFxuICAgIG9uQmVmb3JlU2hvdzogZnVuY3Rpb24gKGVsZSwgdGlwc28pIHtcbiAgICAgIHRoaXMuY29udGVudCA9IGVsZS5kYXRhKCdvcmlnaW5hbC10aXRsZScpO1xuICAgICAgdGhpcy5wb3NpdGlvbiA9IGVsZS5kYXRhKCdwbGFjZW1lbnQnKSA/IGVsZS5kYXRhKCdwbGFjZW1lbnQnKSA6ICd0b3AnO1xuICAgIH1cbiAgfSk7XG5cbiAgJCgnW2RhdGEtdG9nZ2xlPXRvb2x0aXBdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICB0b29sdGlwQ2xpY2tUaW1lID0gbmV3IERhdGUoKTtcbiAgICAvL9GD0LHQuNGA0LDQtdC8INGC0LDQudC80LDRg9GCXG4gICAgY2xlYXJJbnRlcnZhbCh0b29sdGlwVGltZU91dCk7XG4gICAgLy/Qt9Cw0LrRgNGL0LLQsNCy0LXQvCDQstGB0LUg0YLRg9C70YLQuNC/0YtcbiAgICAkKCdbZGF0YS10b2dnbGU9dG9vbHRpcF0nKS50aXBzbygnaGlkZScpO1xuICAgIC8v0LTQsNC90L3Ri9C5INC/0L7QutCw0LfRi9Cy0LXQvFxuICAgICQodGhpcykudGlwc28oJ3Nob3cnKTtcbiAgICAvL9C90L7QstGL0Lkg0LjQvdGC0LXRgNCy0LDQu1xuICAgIHRvb2x0aXBUaW1lT3V0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG5ldyBEYXRlKCkgLSB0b29sdGlwQ2xpY2tUaW1lID4gMTAwMCAqIDUpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0b29sdGlwVGltZU91dCk7XG4gICAgICAgIC8v0LfQsNC60YDRi9Cy0LDQtdC8INCy0YHQtSDRgtGD0LvRgtC40L/Ri1xuICAgICAgICAkKCdbZGF0YS10b2dnbGU9dG9vbHRpcF0nKS50aXBzbygnaGlkZScpO1xuICAgICAgfVxuICAgIH0sIDEwMDApO1xuICB9KTtcblxufSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgdmFyICRub3R5ZmlfYnRuID0gJCgnLmhlYWRlci1sb2dvX25vdHknKTtcbiAgaWYgKCRub3R5ZmlfYnRuLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgJC5nZXQoJy9hY2NvdW50L25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYgKCFkYXRhLm5vdGlmaWNhdGlvbnMgfHwgZGF0YS5ub3RpZmljYXRpb25zLmxlbmd0aCA9PSAwKSByZXR1cm47XG5cbiAgICB2YXIgb3V0ID0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktYm94Pjx1bCBjbGFzcz1cImhlYWRlci1ub3R5LWxpc3RcIj4nO1xuICAgICRub3R5ZmlfYnRuLmZpbmQoJ2EnKS5yZW1vdmVBdHRyKCdocmVmJyk7XG4gICAgdmFyIGhhc19uZXcgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgZWwgPSBkYXRhLm5vdGlmaWNhdGlvbnNbaV07XG4gICAgICB2YXIgaXNfbmV3ID0gKGVsLmlzX3ZpZXdlZCA9PSAwICYmIGVsLnR5cGVfaWQgPT0gMik7XG4gICAgICBvdXQgKz0gJzxsaSBjbGFzcz1cImhlYWRlci1ub3R5LWl0ZW0nICsgKGlzX25ldyA/ICcgaGVhZGVyLW5vdHktaXRlbV9uZXcnIDogJycpICsgJ1wiPic7XG4gICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktZGF0YT4nICsgZWwuZGF0YSArICc8L2Rpdj4nO1xuICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LXRleHQ+JyArIGVsLnRleHQgKyAnPC9kaXY+JztcbiAgICAgIG91dCArPSAnPC9saT4nO1xuICAgICAgaGFzX25ldyA9IGhhc19uZXcgfHwgaXNfbmV3O1xuICAgIH1cblxuICAgIG91dCArPSAnPC91bD4nO1xuICAgIG91dCArPSAnPGEgY2xhc3M9XCJidG5cIiBocmVmPVwiL2FjY291bnQvbm90aWZpY2F0aW9uXCI+JyArIGRhdGEuYnRuICsgJzwvYT4nO1xuICAgIG91dCArPSAnPC9kaXY+JztcbiAgICAkKCcuaGVhZGVyJykuYXBwZW5kKG91dCk7XG5cbiAgICBpZiAoaGFzX25ldykge1xuICAgICAgJG5vdHlmaV9idG4uYWRkQ2xhc3MoJ3Rvb2x0aXAnKS5hZGRDbGFzcygnaGFzLW5vdHknKTtcbiAgICB9XG5cbiAgICAkbm90eWZpX2J0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKCQoJy5oZWFkZXItbm90eS1ib3gnKS5oYXNDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKSkge1xuICAgICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLmFkZENsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xuICAgICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcblxuICAgICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnaGFzLW5vdHknKSkge1xuICAgICAgICAgICQucG9zdCgnL2FjY291bnQvbm90aWZpY2F0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJCgnLmhlYWRlci1sb2dvX25vdHknKS5yZW1vdmVDbGFzcygndG9vbHRpcCcpLnJlbW92ZUNsYXNzKCdoYXMtbm90eScpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xuICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XG4gICAgfSk7XG5cbiAgICAkKCcuaGVhZGVyLW5vdHktbGlzdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSlcbiAgfSwgJ2pzb24nKTtcblxufSkoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1lZ2FzbGlkZXIgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgc2xpZGVyX2RhdGEgPSBmYWxzZTtcbiAgdmFyIGNvbnRhaW5lcl9pZCA9IFwic2VjdGlvbiNtZWdhX3NsaWRlclwiO1xuICB2YXIgcGFyYWxsYXhfZ3JvdXAgPSBmYWxzZTtcbiAgdmFyIHBhcmFsbGF4X3RpbWVyID0gZmFsc2U7XG4gIHZhciBwYXJhbGxheF9jb3VudGVyID0gMDtcbiAgdmFyIHBhcmFsbGF4X2QgPSAxO1xuICB2YXIgbW9iaWxlX21vZGUgPSAtMTtcbiAgdmFyIG1heF90aW1lX2xvYWRfcGljID0gMzAwO1xuICB2YXIgbW9iaWxlX3NpemUgPSA3MDA7XG4gIHZhciByZW5kZXJfc2xpZGVfbm9tID0gMDtcbiAgdmFyIHRvdF9pbWdfd2FpdDtcbiAgdmFyIHNsaWRlcztcbiAgdmFyIHNsaWRlX3NlbGVjdF9ib3g7XG4gIHZhciBlZGl0b3I7XG4gIHZhciB0aW1lb3V0SWQ7XG4gIHZhciBzY3JvbGxfcGVyaW9kID0gNTAwMDtcblxuICB2YXIgcG9zQXJyID0gW1xuICAgICdzbGlkZXJfX3RleHQtbHQnLCAnc2xpZGVyX190ZXh0LWN0JywgJ3NsaWRlcl9fdGV4dC1ydCcsXG4gICAgJ3NsaWRlcl9fdGV4dC1sYycsICdzbGlkZXJfX3RleHQtY2MnLCAnc2xpZGVyX190ZXh0LXJjJyxcbiAgICAnc2xpZGVyX190ZXh0LWxiJywgJ3NsaWRlcl9fdGV4dC1jYicsICdzbGlkZXJfX3RleHQtcmInLFxuICBdO1xuICB2YXIgcG9zX2xpc3QgPSBbXG4gICAgJ9Cb0LXQstC+INCy0LXRgNGFJywgJ9GG0LXQvdGC0YAg0LLQtdGA0YUnLCAn0L/RgNCw0LLQviDQstC10YDRhScsXG4gICAgJ9Cb0LXQstC+INGG0LXQvdGC0YAnLCAn0YbQtdC90YLRgCcsICfQv9GA0LDQstC+INGG0LXQvdGC0YAnLFxuICAgICfQm9C10LLQviDQvdC40LcnLCAn0YbQtdC90YLRgCDQvdC40LcnLCAn0L/RgNCw0LLQviDQvdC40LcnLFxuICBdO1xuICB2YXIgc2hvd19kZWxheSA9IFtcbiAgICAnc2hvd19ub19kZWxheScsXG4gICAgJ3Nob3dfZGVsYXlfMDUnLFxuICAgICdzaG93X2RlbGF5XzEwJyxcbiAgICAnc2hvd19kZWxheV8xNScsXG4gICAgJ3Nob3dfZGVsYXlfMjAnLFxuICAgICdzaG93X2RlbGF5XzI1JyxcbiAgICAnc2hvd19kZWxheV8zMCdcbiAgXTtcbiAgdmFyIGhpZGVfZGVsYXkgPSBbXG4gICAgJ2hpZGVfbm9fZGVsYXknLFxuICAgICdoaWRlX2RlbGF5XzA1JyxcbiAgICAnaGlkZV9kZWxheV8xMCcsXG4gICAgJ2hpZGVfZGVsYXlfMTUnLFxuICAgICdoaWRlX2RlbGF5XzIwJ1xuICBdO1xuICB2YXIgeWVzX25vX2FyciA9IFtcbiAgICAnbm8nLFxuICAgICd5ZXMnXG4gIF07XG4gIHZhciB5ZXNfbm9fdmFsID0gW1xuICAgICcnLFxuICAgICdmaXhlZF9fZnVsbC1oZWlnaHQnXG4gIF07XG4gIHZhciBidG5fc3R5bGUgPSBbXG4gICAgJ25vbmUnLFxuICAgICdib3JkbycsXG4gIF07XG4gIHZhciBzaG93X2FuaW1hdGlvbnMgPSBbXG4gICAgXCJub3RfYW5pbWF0ZVwiLFxuICAgIFwiYm91bmNlSW5cIixcbiAgICBcImJvdW5jZUluRG93blwiLFxuICAgIFwiYm91bmNlSW5MZWZ0XCIsXG4gICAgXCJib3VuY2VJblJpZ2h0XCIsXG4gICAgXCJib3VuY2VJblVwXCIsXG4gICAgXCJmYWRlSW5cIixcbiAgICBcImZhZGVJbkRvd25cIixcbiAgICBcImZhZGVJbkxlZnRcIixcbiAgICBcImZhZGVJblJpZ2h0XCIsXG4gICAgXCJmYWRlSW5VcFwiLFxuICAgIFwiZmxpcEluWFwiLFxuICAgIFwiZmxpcEluWVwiLFxuICAgIFwibGlnaHRTcGVlZEluXCIsXG4gICAgXCJyb3RhdGVJblwiLFxuICAgIFwicm90YXRlSW5Eb3duTGVmdFwiLFxuICAgIFwicm90YXRlSW5VcExlZnRcIixcbiAgICBcInJvdGF0ZUluVXBSaWdodFwiLFxuICAgIFwiamFja0luVGhlQm94XCIsXG4gICAgXCJyb2xsSW5cIixcbiAgICBcInpvb21JblwiXG4gIF07XG5cbiAgdmFyIGhpZGVfYW5pbWF0aW9ucyA9IFtcbiAgICBcIm5vdF9hbmltYXRlXCIsXG4gICAgXCJib3VuY2VPdXRcIixcbiAgICBcImJvdW5jZU91dERvd25cIixcbiAgICBcImJvdW5jZU91dExlZnRcIixcbiAgICBcImJvdW5jZU91dFJpZ2h0XCIsXG4gICAgXCJib3VuY2VPdXRVcFwiLFxuICAgIFwiZmFkZU91dFwiLFxuICAgIFwiZmFkZU91dERvd25cIixcbiAgICBcImZhZGVPdXRMZWZ0XCIsXG4gICAgXCJmYWRlT3V0UmlnaHRcIixcbiAgICBcImZhZGVPdXRVcFwiLFxuICAgIFwiZmxpcE91dFhcIixcbiAgICBcImxpcE91dFlcIixcbiAgICBcImxpZ2h0U3BlZWRPdXRcIixcbiAgICBcInJvdGF0ZU91dFwiLFxuICAgIFwicm90YXRlT3V0RG93bkxlZnRcIixcbiAgICBcInJvdGF0ZU91dERvd25SaWdodFwiLFxuICAgIFwicm90YXRlT3V0VXBMZWZ0XCIsXG4gICAgXCJyb3RhdGVPdXRVcFJpZ2h0XCIsXG4gICAgXCJoaW5nZVwiLFxuICAgIFwicm9sbE91dFwiXG4gIF07XG4gIHZhciBzdFRhYmxlO1xuICB2YXIgcGFyYWxheFRhYmxlO1xuXG4gIGZ1bmN0aW9uIGluaXRJbWFnZVNlcnZlclNlbGVjdChlbHMpIHtcbiAgICBpZiAoZWxzLmxlbmd0aCA9PSAwKXJldHVybjtcbiAgICBlbHMud3JhcCgnPGRpdiBjbGFzcz1cInNlbGVjdF9pbWdcIj4nKTtcbiAgICBlbHMgPSBlbHMucGFyZW50KCk7XG4gICAgZWxzLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmaWxlX2J1dHRvblwiPjxpIGNsYXNzPVwibWNlLWljbyBtY2UtaS1icm93c2VcIj48L2k+PC9idXR0b24+Jyk7XG4gICAgLyplbHMuZmluZCgnYnV0dG9uJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoKSB7XG4gICAgICQoJyNyb3h5Q3VzdG9tUGFuZWwyJykuYWRkQ2xhc3MoJ29wZW4nKVxuICAgICB9KTsqL1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZWwgPSBlbHMuZXEoaSkuZmluZCgnaW5wdXQnKTtcbiAgICAgIGlmICghZWwuYXR0cignaWQnKSkge1xuICAgICAgICBlbC5hdHRyKCdpZCcsICdmaWxlXycgKyBpICsgJ18nICsgRGF0ZS5ub3coKSlcbiAgICAgIH1cbiAgICAgIHZhciB0X2lkID0gZWwuYXR0cignaWQnKTtcbiAgICAgIG1paGFpbGRldi5lbEZpbmRlci5yZWdpc3Rlcih0X2lkLCBmdW5jdGlvbiAoZmlsZSwgaWQpIHtcbiAgICAgICAgLy8kKHRoaXMpLnZhbChmaWxlLnVybCkudHJpZ2dlcignY2hhbmdlJywgW2ZpbGUsIGlkXSk7XG4gICAgICAgICQoJyMnICsgaWQpLnZhbChmaWxlLnVybCkuY2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuICAgIDtcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZmlsZV9idXR0b24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnByZXYoKTtcbiAgICAgIHZhciBpZCA9ICR0aGlzLmF0dHIoJ2lkJyk7XG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIub3Blbk1hbmFnZXIoe1xuICAgICAgICBcInVybFwiOiBcIi9tYW5hZ2VyL2VsZmluZGVyP2ZpbHRlcj1pbWFnZSZjYWxsYmFjaz1cIiArIGlkICsgXCImbGFuZz1ydVwiLFxuICAgICAgICBcIndpZHRoXCI6IFwiYXV0b1wiLFxuICAgICAgICBcImhlaWdodFwiOiBcImF1dG9cIixcbiAgICAgICAgXCJpZFwiOiBpZFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5JbnB1dChkYXRhKSB7XG4gICAgdmFyIGlucHV0ID0gJzxpbnB1dCBjbGFzcz1cIicgKyAoZGF0YS5pbnB1dENsYXNzIHx8ICcnKSArICdcIiB2YWx1ZT1cIicgKyAoZGF0YS52YWx1ZSB8fCAnJykgKyAnXCI+JztcbiAgICBpZiAoZGF0YS5sYWJlbCkge1xuICAgICAgaW5wdXQgPSAnPGxhYmVsPjxzcGFuPicgKyBkYXRhLmxhYmVsICsgJzwvc3Bhbj4nICsgaW5wdXQgKyAnPC9sYWJlbD4nO1xuICAgIH1cbiAgICBpZiAoZGF0YS5wYXJlbnQpIHtcbiAgICAgIGlucHV0ID0gJzwnICsgZGF0YS5wYXJlbnQgKyAnPicgKyBpbnB1dCArICc8LycgKyBkYXRhLnBhcmVudCArICc+JztcbiAgICB9XG4gICAgaW5wdXQgPSAkKGlucHV0KTtcblxuICAgIGlmIChkYXRhLm9uQ2hhbmdlKSB7XG4gICAgICB2YXIgb25DaGFuZ2U7XG4gICAgICBpZiAoZGF0YS5iaW5kKSB7XG4gICAgICAgIGRhdGEuYmluZC5pbnB1dCA9IGlucHV0LmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGRhdGEuYmluZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChpbnB1dC5maW5kKCdpbnB1dCcpKTtcbiAgICAgIH1cbiAgICAgIGlucHV0LmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIG9uQ2hhbmdlKVxuICAgIH1cbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5TZWxlY3QoZGF0YSkge1xuICAgIHZhciBpbnB1dCA9ICQoJzxzZWxlY3QvPicpO1xuXG4gICAgdmFyIGVsID0gc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl07XG4gICAgaWYgKGRhdGEuaW5kZXggIT09IGZhbHNlKSB7XG4gICAgICBlbCA9IGVsW2RhdGEuaW5kZXhdO1xuICAgIH1cblxuICAgIGlmIChlbFtkYXRhLnBhcmFtXSkge1xuICAgICAgZGF0YS52YWx1ZSA9IGVsW2RhdGEucGFyYW1dO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYXRhLnZhbHVlID0gMDtcbiAgICB9XG5cbiAgICBpZiAoZGF0YS5zdGFydF9vcHRpb24pIHtcbiAgICAgIGlucHV0LmFwcGVuZChkYXRhLnN0YXJ0X29wdGlvbilcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbDtcbiAgICAgIHZhciB0eHQgPSBkYXRhLmxpc3RbaV07XG4gICAgICBpZiAoZGF0YS52YWxfdHlwZSA9PSAwKSB7XG4gICAgICAgIHZhbCA9IGRhdGEubGlzdFtpXTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWxfdHlwZSA9PSAxKSB7XG4gICAgICAgIHZhbCA9IGk7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEudmFsX3R5cGUgPT0gMikge1xuICAgICAgICAvL3ZhbD1kYXRhLnZhbF9saXN0W2ldO1xuICAgICAgICB2YWwgPSBpO1xuICAgICAgICB0eHQgPSBkYXRhLnZhbF9saXN0W2ldO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2VsID0gKHZhbCA9PSBkYXRhLnZhbHVlID8gJ3NlbGVjdGVkJyA6ICcnKTtcbiAgICAgIGlmIChzZWwgPT0gJ3NlbGVjdGVkJykge1xuICAgICAgICBpbnB1dC5hdHRyKCd0X3ZhbCcsIGRhdGEubGlzdFtpXSk7XG4gICAgICB9XG4gICAgICB2YXIgb3B0aW9uID0gJzxvcHRpb24gdmFsdWU9XCInICsgdmFsICsgJ1wiICcgKyBzZWwgKyAnPicgKyB0eHQgKyAnPC9vcHRpb24+JztcbiAgICAgIGlmIChkYXRhLnZhbF90eXBlID09IDIpIHtcbiAgICAgICAgb3B0aW9uID0gJChvcHRpb24pLmF0dHIoJ2NvZGUnLCBkYXRhLmxpc3RbaV0pO1xuICAgICAgfVxuICAgICAgaW5wdXQuYXBwZW5kKG9wdGlvbilcbiAgICB9XG5cbiAgICBpbnB1dC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YSA9IHRoaXM7XG4gICAgICB2YXIgdmFsID0gZGF0YS5lbC52YWwoKTtcbiAgICAgIHZhciBzbF9vcCA9IGRhdGEuZWwuZmluZCgnb3B0aW9uW3ZhbHVlPScgKyB2YWwgKyAnXScpO1xuICAgICAgdmFyIGNscyA9IHNsX29wLnRleHQoKTtcbiAgICAgIHZhciBjaCA9IHNsX29wLmF0dHIoJ2NvZGUnKTtcbiAgICAgIGlmICghY2gpY2ggPSBjbHM7XG4gICAgICBpZiAoZGF0YS5pbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5pbmRleF1bZGF0YS5wYXJhbV0gPSB2YWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLnBhcmFtXSA9IHZhbDtcbiAgICAgIH1cblxuICAgICAgZGF0YS5vYmoucmVtb3ZlQ2xhc3MoZGF0YS5wcmVmaXggKyBkYXRhLmVsLmF0dHIoJ3RfdmFsJykpO1xuICAgICAgZGF0YS5vYmouYWRkQ2xhc3MoZGF0YS5wcmVmaXggKyBjaCk7XG4gICAgICBkYXRhLmVsLmF0dHIoJ3RfdmFsJywgY2gpO1xuXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIGVsOiBpbnB1dCxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06IGRhdGEucGFyYW0sXG4gICAgICBwcmVmaXg6IGRhdGEucHJlZml4IHx8ICcnXG4gICAgfSkpO1xuXG4gICAgaWYgKGRhdGEucGFyZW50KSB7XG4gICAgICB2YXIgcGFyZW50ID0gJCgnPCcgKyBkYXRhLnBhcmVudCArICcvPicpO1xuICAgICAgcGFyZW50LmFwcGVuZChpbnB1dCk7XG4gICAgICByZXR1cm4gcGFyZW50O1xuICAgIH1cbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTZWxBbmltYXRpb25Db250cm9sbChkYXRhKSB7XG4gICAgdmFyIGFuaW1fc2VsID0gW107XG4gICAgdmFyIG91dDtcblxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHNob3dfYW5pbWF0aW9ucyxcbiAgICAgIHZhbF90eXBlOiAwLFxuICAgICAgb2JqOiBkYXRhLm9iaixcbiAgICAgIGdyOiBkYXRhLmdyLFxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTogJ3Nob3dfYW5pbWF0aW9uJyxcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XG4gICAgfSkpO1xuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+0JfQsNC00LXRgNC20LrQsCDQv9C+0Y/QstC70LXQvdC40Y88L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHNob3dfZGVsYXksXG4gICAgICB2YWxfdHlwZTogMSxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ICdzaG93X2RlbGF5JyxcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XG4gICAgfSkpO1xuXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8YnIvPicpO1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+0JDQvdC40LzQsNGG0LjRjyDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IGhpZGVfYW5pbWF0aW9ucyxcbiAgICAgIHZhbF90eXBlOiAwLFxuICAgICAgb2JqOiBkYXRhLm9iaixcbiAgICAgIGdyOiBkYXRhLmdyLFxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTogJ2hpZGVfYW5pbWF0aW9uJyxcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XG4gICAgfSkpO1xuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+0JfQsNC00LXRgNC20LrQsCDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IGhpZGVfZGVsYXksXG4gICAgICB2YWxfdHlwZTogMSxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ICdoaWRlX2RlbGF5JyxcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XG4gICAgfSkpO1xuXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XG4gICAgICBvdXQgPSAkKCc8ZGl2IGNsYXNzPVwiYW5pbV9zZWxcIi8+Jyk7XG4gICAgICBvdXQuYXBwZW5kKGFuaW1fc2VsKTtcbiAgICB9XG4gICAgaWYgKGRhdGEudHlwZSA9PSAxKSB7XG4gICAgICBvdXQgPSBhbmltX3NlbDtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdF9lZGl0b3IoKSB7XG4gICAgJCgnI3cxJykucmVtb3ZlKCk7XG4gICAgJCgnI3cxX2J1dHRvbicpLnJlbW92ZSgpO1xuICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9IHNsaWRlcl9kYXRhWzBdLm1vYmlsZS5zcGxpdCgnPycpWzBdO1xuXG4gICAgdmFyIGVsID0gJCgnI21lZ2Ffc2xpZGVyX2NvbnRyb2xlJyk7XG4gICAgdmFyIGJ0bnNfYm94ID0gJCgnPGRpdiBjbGFzcz1cImJ0bl9ib3hcIi8+Jyk7XG5cbiAgICBlbC5hcHBlbmQoJzxoMj7Qo9C/0YDQsNCy0LvQtdC90LjQtTwvaDI+Jyk7XG4gICAgZWwuYXBwZW5kKCQoJzx0ZXh0YXJlYS8+Jywge1xuICAgICAgdGV4dDogSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pLFxuICAgICAgaWQ6ICdzbGlkZV9kYXRhJyxcbiAgICAgIG5hbWU6IGVkaXRvclxuICAgIH0pKTtcblxuICAgIHZhciBidG4gPSAkKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQkNC60YLQuNCy0LjRgNC+0LLQsNGC0Ywg0YHQu9Cw0LnQtFwiKTtcbiAgICBidG5zX2JveC5hcHBlbmQoYnRuKTtcbiAgICBidG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdoaWRlX3NsaWRlJyk7XG4gICAgfSk7XG5cbiAgICB2YXIgYnRuID0gJCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JTQtdCw0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xuICAgIGJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcbiAgICB9KTtcbiAgICBlbC5hcHBlbmQoYnRuc19ib3gpO1xuXG4gICAgZWwuYXBwZW5kKCc8aDI+0J7QsdGJ0LjQtSDQv9Cw0YDQsNC80LXRgtGA0Ys8L2gyPicpO1xuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0ubW9iaWxlLFxuICAgICAgbGFiZWw6IFwi0KHQu9Cw0LnQtCDQtNC70Y8g0YLQtdC70LXRhNC+0L3QsFwiLFxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSAkKHRoaXMpLnZhbCgpXG4gICAgICAgICQoJy5tb2JfYmcnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnKScpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5mb24sXG4gICAgICBsYWJlbDogXCLQntGB0L3QvtC90L7QuSDRhNC+0L1cIixcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uZm9uID0gJCh0aGlzKS52YWwoKVxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgc2xpZGVyX2RhdGFbMF0uZm9uICsgJyknKVxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdmFyIGJ0bl9jaCA9ICQoJzxkaXYgY2xhc3M9XCJidG5zXCIvPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoJzxoMz7QmtC90L7Qv9C60LAg0L/QtdGA0LXRhdC+0LTQsCjQtNC70Y8g0J/QmiDQstC10YDRgdC40LgpPC9oMz4nKTtcbiAgICBidG5fY2guYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCxcbiAgICAgIGxhYmVsOiBcItCi0LXQutGB0YJcIixcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0ID0gJCh0aGlzKS52YWwoKTtcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS50ZXh0KHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0KTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfSxcbiAgICB9KSk7XG5cbiAgICB2YXIgYnV0X3NsID0gJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKTtcblxuICAgIGJ0bl9jaC5hcHBlbmQoJzxici8+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZCgnPHNwYW4+0J7RhNC+0YDQvNC70LXQvdC40LUg0LrQvdC+0L/QutC4PC9zcGFuPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IGJ0bl9zdHlsZSxcbiAgICAgIHZhbF90eXBlOiAwLFxuICAgICAgb2JqOiBidXRfc2wsXG4gICAgICBncjogJ2J1dHRvbicsXG4gICAgICBpbmRleDogZmFsc2UsXG4gICAgICBwYXJhbTogJ2NvbG9yJ1xuICAgIH0pKTtcblxuICAgIGJ0bl9jaC5hcHBlbmQoJzxici8+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZCgnPHNwYW4+0J/QvtC70L7QttC10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcbiAgICBidG5fY2guYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBwb3NBcnIsXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXG4gICAgICB2YWxfdHlwZTogMixcbiAgICAgIG9iajogYnV0X3NsLnBhcmVudCgpLnBhcmVudCgpLFxuICAgICAgZ3I6ICdidXR0b24nLFxuICAgICAgaW5kZXg6IGZhbHNlLFxuICAgICAgcGFyYW06ICdwb3MnXG4gICAgfSkpO1xuXG4gICAgYnRuX2NoLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XG4gICAgICB0eXBlOiAwLFxuICAgICAgb2JqOiBidXRfc2wucGFyZW50KCksXG4gICAgICBncjogJ2J1dHRvbicsXG4gICAgICBpbmRleDogZmFsc2VcbiAgICB9KSk7XG4gICAgZWwuYXBwZW5kKGJ0bl9jaCk7XG5cbiAgICB2YXIgbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwiZml4ZWRfbGF5ZXJcIi8+Jyk7XG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0KHRgtCw0YLQuNGH0LXRgdC60LjQtSDRgdC70L7QuDwvaDI+Jyk7XG4gICAgdmFyIHRoID0gXCI8dGg+4oSWPC90aD5cIiArXG4gICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIiArXG4gICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCh0LvQvtC5INC90LAg0LLRgdGOINCy0YvRgdC+0YLRgzwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiICtcbiAgICAgIFwiPHRoPtCX0LDQtNC10YDQttC60LAg0L/QvtGP0LLQu9C10L3QuNGPPC90aD5cIiArXG4gICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiICtcbiAgICAgIFwiPHRoPtCU0LXQudGB0YLQstC40LU8L3RoPlwiO1xuICAgIHN0VGFibGUgPSAkKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nICsgdGggKyAnPC90cj48L3RhYmxlPicpO1xuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICB2YXIgZGF0YSA9IHNsaWRlcl9kYXRhWzBdLmZpeGVkO1xuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFkZFRyU3RhdGljKGRhdGFbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXllci5hcHBlbmQoc3RUYWJsZSk7XG4gICAgdmFyIGFkZEJ0biA9ICQoJzxidXR0b24vPicsIHtcbiAgICAgIHRleHQ6IFwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXG4gICAgfSk7XG4gICAgYWRkQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBkYXRhID0gYWRkVHJTdGF0aWMoZmFsc2UpO1xuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxuICAgIH0pKTtcbiAgICBsYXllci5hcHBlbmQoYWRkQnRuKTtcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xuXG4gICAgdmFyIGxheWVyID0gJCgnPGRpdiBjbGFzcz1cInBhcmFsYXhfbGF5ZXJcIi8+Jyk7XG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0J/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuDwvaDI+Jyk7XG4gICAgdmFyIHRoID0gXCI8dGg+4oSWPC90aD5cIiArXG4gICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIiArXG4gICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCj0LTQsNC70LXQvdC90L7RgdGC0YwgKNGG0LXQu9C+0LUg0L/QvtC70L7QttC40YLQtdC70YzQvdC+0LUg0YfQuNGB0LvQvik8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCU0LXQudGB0YLQstC40LU8L3RoPlwiO1xuXG4gICAgcGFyYWxheFRhYmxlID0gJCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+JyArIHRoICsgJzwvdHI+PC90YWJsZT4nKTtcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVswXS5wYXJhbGF4O1xuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFkZFRyUGFyYWxheChkYXRhW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGF5ZXIuYXBwZW5kKHBhcmFsYXhUYWJsZSk7XG4gICAgdmFyIGFkZEJ0biA9ICQoJzxidXR0b24vPicsIHtcbiAgICAgIHRleHQ6IFwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXG4gICAgfSk7XG4gICAgYWRkQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBkYXRhID0gYWRkVHJQYXJhbGF4KGZhbHNlKTtcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcbiAgICB9KSk7XG5cbiAgICBsYXllci5hcHBlbmQoYWRkQnRuKTtcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xuXG4gICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGVsLmZpbmQoJy5maWxlU2VsZWN0JykpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkVHJTdGF0aWMoZGF0YSkge1xuICAgIHZhciBpID0gc3RUYWJsZS5maW5kKCd0cicpLmxlbmd0aCAtIDE7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICBkYXRhID0ge1xuICAgICAgICBcImltZ1wiOiBcIlwiLFxuICAgICAgICBcImZ1bGxfaGVpZ2h0XCI6IDAsXG4gICAgICAgIFwicG9zXCI6IDAsXG4gICAgICAgIFwic2hvd19kZWxheVwiOiAxLFxuICAgICAgICBcInNob3dfYW5pbWF0aW9uXCI6IFwibGlnaHRTcGVlZEluXCIsXG4gICAgICAgIFwiaGlkZV9kZWxheVwiOiAxLFxuICAgICAgICBcImhpZGVfYW5pbWF0aW9uXCI6IFwiYm91bmNlT3V0XCJcbiAgICAgIH07XG4gICAgICBzbGlkZXJfZGF0YVswXS5maXhlZC5wdXNoKGRhdGEpO1xuICAgICAgdmFyIGZpeCA9ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAnKTtcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCwgdHJ1ZSk7XG4gICAgfVxuICAgIDtcblxuICAgIHZhciB0ciA9ICQoJzx0ci8+Jyk7XG4gICAgdHIuYXBwZW5kKCc8dGQgY2xhc3M9XCJ0ZF9jb3VudGVyXCIvPicpO1xuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogZGF0YS5pbWcsXG4gICAgICBsYWJlbDogZmFsc2UsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcbiAgICAgIGJpbmQ6IHtcbiAgICAgICAgZ3I6ICdmaXhlZCcsXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwYXJhbTogJ2ltZycsXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxuICAgICAgfSxcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbnB1dC52YWwoKSArICcpJyk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkW2RhdGEuaW5kZXhdLmltZyA9IGRhdGEuaW5wdXQudmFsKCk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBwb3NBcnIsXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXG4gICAgICB2YWxfdHlwZTogMixcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXG4gICAgICBncjogJ2ZpeGVkJyxcbiAgICAgIGluZGV4OiBpLFxuICAgICAgcGFyYW06ICdwb3MnLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHllc19ub192YWwsXG4gICAgICB2YWxfbGlzdDogeWVzX25vX2FycixcbiAgICAgIHZhbF90eXBlOiAyLFxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKSxcbiAgICAgIGdyOiAnZml4ZWQnLFxuICAgICAgaW5kZXg6IGksXG4gICAgICBwYXJhbTogJ2Z1bGxfaGVpZ2h0JyxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcbiAgICAgIHR5cGU6IDEsXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcbiAgICAgIGdyOiAnZml4ZWQnLFxuICAgICAgaW5kZXg6IGksXG4gICAgICBwYXJlbnQ6ICd0ZCdcbiAgICB9KSk7XG4gICAgdmFyIGRlbEJ0biA9ICQoJzxidXR0b24vPicsIHtcbiAgICAgIHRleHQ6IFwi0KPQtNCw0LvQuNGC0YxcIlxuICAgIH0pO1xuICAgIGRlbEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzLmVsKTtcbiAgICAgIGkgPSAkdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCkgLSAxO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHQu9C+0Lkg0L3QsCDRgdC70LDQudC00LXRgNC1XG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5maXhlZC5zcGxpY2UoaSwgMSk7IC8v0YPQtNCw0LvRj9C10Lwg0LjQtyDQutC+0L3RhNC40LPQsCDRgdC70LDQudC00LBcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBlbDogZGVsQnRuLFxuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXG4gICAgfSkpO1xuICAgIHZhciBkZWxCdG5UZCA9ICQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcbiAgICBzdFRhYmxlLmFwcGVuZCh0cilcblxuICAgIHJldHVybiB7XG4gICAgICBlZGl0b3I6IHRyLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFRyUGFyYWxheChkYXRhKSB7XG4gICAgdmFyIGkgPSBwYXJhbGF4VGFibGUuZmluZCgndHInKS5sZW5ndGggLSAxO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgZGF0YSA9IHtcbiAgICAgICAgXCJpbWdcIjogXCJcIixcbiAgICAgICAgXCJ6XCI6IDFcbiAgICAgIH07XG4gICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4LnB1c2goZGF0YSk7XG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwJyk7XG4gICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YSwgcGFyYWxheF9ncik7XG4gICAgfVxuICAgIDtcbiAgICB2YXIgdHIgPSAkKCc8dHIvPicpO1xuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IGRhdGEuaW1nLFxuICAgICAgbGFiZWw6IGZhbHNlLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXG4gICAgICBiaW5kOiB7XG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwYXJhbTogJ2ltZycsXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLmZpbmQoJ3NwYW4nKSxcbiAgICAgIH0sXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgICAgIGRhdGEub2JqLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW5wdXQudmFsKCkgKyAnKScpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLmltZyA9IGRhdGEuaW5wdXQudmFsKCk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBwb3NBcnIsXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXG4gICAgICB2YWxfdHlwZTogMixcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLmZpbmQoJ3NwYW4nKSxcbiAgICAgIGdyOiAncGFyYWxheCcsXG4gICAgICBpbmRleDogaSxcbiAgICAgIHBhcmFtOiAncG9zJyxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICAgIHN0YXJ0X29wdGlvbjogJzxvcHRpb24gdmFsdWU9XCJcIiBjb2RlPVwiXCI+0L3QsCDQstC10YHRjCDRjdC60YDQsNC9PC9vcHRpb24+J1xuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IGRhdGEueixcbiAgICAgIGxhYmVsOiBmYWxzZSxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICAgIGJpbmQ6IHtcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcbiAgICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSksXG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgICAgICBkYXRhLm9iai5hdHRyKCd6JywgZGF0YS5pbnB1dC52YWwoKSk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0ueiA9IGRhdGEuaW5wdXQudmFsKCk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICB2YXIgZGVsQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xuICAgICAgdGV4dDogXCLQo9C00LDQu9C40YLRjFwiXG4gICAgfSk7XG4gICAgZGVsQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMuZWwpO1xuICAgICAgaSA9ICR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKSAtIDE7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcbiAgICAgICR0aGlzLmNsb3Nlc3QoJ3RyJykucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHRgtGA0L7QutGDINCyINGC0LDQsdC70LjRhtC1XG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLnBhcmFsYXguc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgZWw6IGRlbEJ0bixcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxuICAgIH0pKTtcbiAgICB2YXIgZGVsQnRuVGQgPSAkKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xuICAgIHRyLmFwcGVuZChkZWxCdG5UZCk7XG4gICAgcGFyYWxheFRhYmxlLmFwcGVuZCh0cilcblxuICAgIHJldHVybiB7XG4gICAgICBlZGl0b3I6IHRyLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZF9hbmltYXRpb24oZWwsIGRhdGEpIHtcbiAgICB2YXIgb3V0ID0gJCgnPGRpdi8+Jywge1xuICAgICAgJ2NsYXNzJzogJ2FuaW1hdGlvbl9sYXllcidcbiAgICB9KTtcblxuICAgIGlmICh0eXBlb2YoZGF0YS5zaG93X2RlbGF5KSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgb3V0LmFkZENsYXNzKHNob3dfZGVsYXlbZGF0YS5zaG93X2RlbGF5XSk7XG4gICAgICBpZiAoZGF0YS5zaG93X2FuaW1hdGlvbikge1xuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycgKyBkYXRhLnNob3dfYW5pbWF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mKGRhdGEuaGlkZV9kZWxheSkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG91dC5hZGRDbGFzcyhoaWRlX2RlbGF5W2RhdGEuaGlkZV9kZWxheV0pO1xuICAgICAgaWYgKGRhdGEuaGlkZV9hbmltYXRpb24pIHtcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nICsgZGF0YS5oaWRlX2FuaW1hdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZWwuYXBwZW5kKG91dCk7XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVfc2xpZGUoZGF0YSkge1xuICAgIHZhciBzbGlkZSA9ICQoJzxkaXYgY2xhc3M9XCJzbGlkZVwiLz4nKTtcblxuICAgIHZhciBtb2JfYmcgPSAkKCc8YSBjbGFzcz1cIm1vYl9iZ1wiIGhyZWY9XCInICsgZGF0YS5idXR0b24uaHJlZiArICdcIi8+Jyk7XG4gICAgbW9iX2JnLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEubW9iaWxlICsgJyknKVxuXG4gICAgc2xpZGUuYXBwZW5kKG1vYl9iZyk7XG4gICAgaWYgKG1vYmlsZV9tb2RlKSB7XG4gICAgICByZXR1cm4gc2xpZGU7XG4gICAgfVxuXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDRhNC+0L0g0YLQviDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICBpZiAoZGF0YS5mb24pIHtcbiAgICAgIHNsaWRlLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuZm9uICsgJyknKVxuICAgIH1cblxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICBpZiAoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fZ3JvdXBcIi8+Jyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGFyYWxheC5sZW5ndGg7IGkrKykge1xuICAgICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YS5wYXJhbGF4W2ldLCBwYXJhbGF4X2dyKVxuICAgICAgfVxuICAgICAgc2xpZGUuYXBwZW5kKHBhcmFsYXhfZ3IpXG4gICAgfVxuXG4gICAgdmFyIGZpeCA9ICQoJzxkaXYgY2xhc3M9XCJmaXhlZF9ncm91cFwiLz4nKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuZml4ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEuZml4ZWRbaV0sIGZpeClcbiAgICB9XG5cbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5idXR0b24ucG9zXSk7XG4gICAgdmFyIGJ1dCA9ICQoXCI8YSBjbGFzcz0nc2xpZGVyX19ocmVmJy8+XCIpO1xuICAgIGJ1dC5hdHRyKCdocmVmJywgZGF0YS5idXR0b24uaHJlZik7XG4gICAgYnV0LnRleHQoZGF0YS5idXR0b24udGV4dCk7XG4gICAgYnV0LmFkZENsYXNzKGRhdGEuYnV0dG9uLmNvbG9yKTtcbiAgICBkb3BfYmxrID0gYWRkX2FuaW1hdGlvbihkb3BfYmxrLCBkYXRhLmJ1dHRvbik7XG4gICAgZG9wX2Jsay5maW5kKCdkaXYnKS5hcHBlbmQoYnV0KTtcbiAgICBmaXguYXBwZW5kKGRvcF9ibGspO1xuXG4gICAgc2xpZGUuYXBwZW5kKGZpeCk7XG4gICAgcmV0dXJuIHNsaWRlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkUGFyYWxheExheWVyKGRhdGEsIHBhcmFsYXhfZ3IpIHtcbiAgICB2YXIgcGFyYWxsYXhfbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2xheWVyXCJcXD4nKTtcbiAgICBwYXJhbGxheF9sYXllci5hdHRyKCd6JywgZGF0YS56IHx8IGkgKiAxMCk7XG4gICAgdmFyIGRvcF9ibGsgPSAkKFwiPHNwYW4gY2xhc3M9J3NsaWRlcl9fdGV4dCcvPlwiKTtcbiAgICBpZiAoZGF0YS5wb3MpIHtcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XG4gICAgfVxuICAgIGRvcF9ibGsuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xuICAgIHBhcmFsbGF4X2xheWVyLmFwcGVuZChkb3BfYmxrKTtcbiAgICBwYXJhbGF4X2dyLmFwcGVuZChwYXJhbGxheF9sYXllcik7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTdGF0aWNMYXllcihkYXRhLCBmaXgsIGJlZm9yX2J1dHRvbikge1xuICAgIHZhciBkb3BfYmxrID0gJChcIjxkaXYgY2xhc3M9J2ZpeGVkX19sYXllcicvPlwiKTtcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLnBvc10pO1xuICAgIGlmIChkYXRhLmZ1bGxfaGVpZ2h0KSB7XG4gICAgICBkb3BfYmxrLmFkZENsYXNzKCdmaXhlZF9fZnVsbC1oZWlnaHQnKTtcbiAgICB9XG4gICAgZG9wX2JsayA9IGFkZF9hbmltYXRpb24oZG9wX2JsaywgZGF0YSk7XG4gICAgZG9wX2Jsay5maW5kKCcuYW5pbWF0aW9uX2xheWVyJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xuXG4gICAgaWYgKGJlZm9yX2J1dHRvbikge1xuICAgICAgZml4LmZpbmQoJy5zbGlkZXJfX2hyZWYnKS5jbG9zZXN0KCcuZml4ZWRfX2xheWVyJykuYmVmb3JlKGRvcF9ibGspXG4gICAgfSBlbHNlIHtcbiAgICAgIGZpeC5hcHBlbmQoZG9wX2JsaylcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xuICAgIGlmICgkKCcjbWVnYV9zbGlkZXInKS5oYXNDbGFzcygnc3RvcF9zbGlkZScpKXJldHVybjtcblxuICAgIHZhciBzbGlkZV9wb2ludHMgPSAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVfc2VsZWN0JylcbiAgICB2YXIgc2xpZGVfY250ID0gc2xpZGVfcG9pbnRzLmxlbmd0aDtcbiAgICB2YXIgYWN0aXZlID0gJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5pbmRleCgpICsgMTtcbiAgICBpZiAoYWN0aXZlID49IHNsaWRlX2NudClhY3RpdmUgPSAwO1xuICAgIHNsaWRlX3BvaW50cy5lcShhY3RpdmUpLmNsaWNrKCk7XG5cbiAgICBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW1nX3RvX2xvYWQoc3JjKSB7XG4gICAgdmFyIGltZyA9ICQoJzxpbWcvPicpO1xuICAgIGltZy5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xuXG4gICAgICBpZiAodG90X2ltZ193YWl0ID09IDApIHtcblxuICAgICAgICBzbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dKSk7XG4gICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcShyZW5kZXJfc2xpZGVfbm9tKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblxuICAgICAgICBpZiAocmVuZGVyX3NsaWRlX25vbSA9PSAwKSB7XG4gICAgICAgICAgc2xpZGVzLmZpbmQoJy5zbGlkZScpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2ZpcnN0X3Nob3cnKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG5cbiAgICAgICAgICBpZiAoIWVkaXRvcikge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICQodGhpcykuZmluZCgnLmZpcnN0X3Nob3cnKS5yZW1vdmVDbGFzcygnZmlyc3Rfc2hvdycpO1xuICAgICAgICAgICAgfS5iaW5kKHNsaWRlcyksIDUwMDApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtb2JpbGVfbW9kZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHBhcmFsbGF4X2dyb3VwID0gJChjb250YWluZXJfaWQgKyAnIC5zbGlkZXItYWN0aXZlIC5wYXJhbGxheF9fZ3JvdXA+KicpO1xuICAgICAgICAgICAgcGFyYWxsYXhfY291bnRlciA9IDA7XG4gICAgICAgICAgICBwYXJhbGxheF90aW1lciA9IHNldEludGVydmFsKHJlbmRlciwgMTAwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZWRpdG9yKSB7XG4gICAgICAgICAgICBpbml0X2VkaXRvcigpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XG5cbiAgICAgICAgICAgICQoJy5zbGlkZV9zZWxlY3RfYm94Jykub24oJ2NsaWNrJywgJy5zbGlkZV9zZWxlY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgIGlmICgkdGhpcy5oYXNDbGFzcygnc2xpZGVyLWFjdGl2ZScpKXJldHVybjtcblxuICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkdGhpcy5pbmRleCgpO1xuICAgICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgICAgICR0aGlzLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG5cbiAgICAgICAgICAgICAgJChjb250YWluZXJfaWQgKyAnIC5zbGlkZS5zbGlkZXItYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgJChjb250YWluZXJfaWQgKyAnIC5zbGlkZScpLmVxKGluZGV4KS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuXG4gICAgICAgICAgICAgIHBhcmFsbGF4X2dyb3VwID0gJChjb250YWluZXJfaWQgKyAnIC5zbGlkZXItYWN0aXZlIC5wYXJhbGxheF9fZ3JvdXA+KicpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmhvdmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmFkZENsYXNzKCdzdG9wX3NsaWRlJyk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLnJlbW92ZUNsYXNzKCdzdG9wX3NsaWRlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZW5kZXJfc2xpZGVfbm9tKys7XG4gICAgICAgIGlmIChyZW5kZXJfc2xpZGVfbm9tIDwgc2xpZGVyX2RhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgbG9hZF9zbGlkZV9pbWcoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkub24oJ2Vycm9yJywgZnVuY3Rpb24gKCkge1xuICAgICAgdG90X2ltZ193YWl0LS07XG4gICAgfSk7XG4gICAgaW1nLnByb3AoJ3NyYycsIHNyYyk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2FkX3NsaWRlX2ltZygpIHtcbiAgICB2YXIgZGF0YSA9IHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dO1xuICAgIHRvdF9pbWdfd2FpdCA9IDE7XG5cbiAgICBpZiAobW9iaWxlX21vZGUgPT09IGZhbHNlKSB7XG4gICAgICB0b3RfaW1nX3dhaXQrKztcbiAgICAgIGltZ190b19sb2FkKGRhdGEuZm9uKTtcbiAgICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICAgIGlmIChkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEucGFyYWxheC5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5wYXJhbGF4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5wYXJhbGF4W2ldLmltZylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGRhdGEuZml4ZWQgJiYgZGF0YS5maXhlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRvdF9pbWdfd2FpdCArPSBkYXRhLmZpeGVkLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmZpeGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5maXhlZFtpXS5pbWcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbWdfdG9fbG9hZChkYXRhLm1vYmlsZSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydF9pbml0X3NsaWRlKGRhdGEpIHtcbiAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHZhciBpbWcgPSAkKCc8aW1nLz4nKTtcbiAgICBpbWcuYXR0cigndGltZScsIG4pO1xuXG4gICAgZnVuY3Rpb24gb25faW1nX2xvYWQoKSB7XG4gICAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgaW1nID0gJCh0aGlzKTtcbiAgICAgIG4gPSBuIC0gcGFyc2VJbnQoaW1nLmF0dHIoJ3RpbWUnKSk7XG4gICAgICBpZiAobiA+IG1heF90aW1lX2xvYWRfcGljKSB7XG4gICAgICAgIG1vYmlsZV9tb2RlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBtYXhfc2l6ZSA9IChzY3JlZW4uaGVpZ2h0ID4gc2NyZWVuLndpZHRoID8gc2NyZWVuLmhlaWdodCA6IHNjcmVlbi53aWR0aCk7XG4gICAgICAgIGlmIChtYXhfc2l6ZSA8IG1vYmlsZV9zaXplKSB7XG4gICAgICAgICAgbW9iaWxlX21vZGUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vYmlsZV9tb2RlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtb2JpbGVfbW9kZSA9PSB0cnVlKSB7XG4gICAgICAgICQoY29udGFpbmVyX2lkKS5hZGRDbGFzcygnbW9iaWxlX21vZGUnKVxuICAgICAgfVxuICAgICAgcmVuZGVyX3NsaWRlX25vbSA9IDA7XG4gICAgICBsb2FkX3NsaWRlX2ltZygpO1xuICAgIH07XG5cbiAgICBpbWcub24oJ2xvYWQnLCBvbl9pbWdfbG9hZCgpKTtcbiAgICBpZiAoc2xpZGVyX2RhdGEubGVuZ3RoID4gMCkge1xuICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gc2xpZGVyX2RhdGFbMF0ubW9iaWxlICsgJz9yPScgKyBNYXRoLnJhbmRvbSgpO1xuICAgICAgaW1nLnByb3AoJ3NyYycsIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9uX2ltZ19sb2FkKCkuYmluZChpbWcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoZGF0YSwgZWRpdG9yX2luaXQpIHtcbiAgICBzbGlkZXJfZGF0YSA9IGRhdGE7XG4gICAgZWRpdG9yID0gZWRpdG9yX2luaXQ7XG4gICAgLy/QvdCw0YXQvtC00LjQvCDQutC+0L3RgtC10LnQvdC10YAg0Lgg0L7Rh9C40YnQsNC10Lwg0LXQs9C+XG4gICAgdmFyIGNvbnRhaW5lciA9ICQoY29udGFpbmVyX2lkKTtcbiAgICBjb250YWluZXIuaHRtbCgnJyk7XG5cbiAgICAvL9GB0L7Qt9C20LDQtdC8INCx0LDQt9C+0LLRi9C1INC60L7QvdGC0LXQudC90LXRgNGLINC00LvRjyDRgdCw0LzQuNGFINGB0LvQsNC50LTQvtCyINC4INC00LvRjyDQv9C10YDQtdC60LvRjtGH0LDRgtC10LvQtdC5XG4gICAgc2xpZGVzID0gJCgnPGRpdi8+Jywge1xuICAgICAgJ2NsYXNzJzogJ3NsaWRlcydcbiAgICB9KTtcbiAgICB2YXIgc2xpZGVfY29udHJvbCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICdjbGFzcyc6ICdzbGlkZV9jb250cm9sJ1xuICAgIH0pO1xuICAgIHNsaWRlX3NlbGVjdF9ib3ggPSAkKCc8dWwvPicsIHtcbiAgICAgICdjbGFzcyc6ICdzbGlkZV9zZWxlY3RfYm94J1xuICAgIH0pO1xuXG4gICAgLy/QtNC+0LHQsNCy0LvRj9C10Lwg0LjQvdC00LjQutCw0YLQvtGAINC30LDQs9GA0YPQt9C60LhcbiAgICB2YXIgbCA9ICc8ZGl2IGNsYXNzPVwic2stZm9sZGluZy1jdWJlXCI+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUxIHNrLWN1YmVcIj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTIgc2stY3ViZVwiPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlNCBzay1jdWJlXCI+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUzIHNrLWN1YmVcIj48L2Rpdj4nICtcbiAgICAgICc8L2Rpdj4nO1xuICAgIGNvbnRhaW5lci5odG1sKGwpO1xuXG5cbiAgICBzdGFydF9pbml0X3NsaWRlKGRhdGFbMF0pO1xuXG4gICAgLy/Qs9C10L3QtdGA0LjRgNGD0LXQvCDQutC90L7Qv9C60Lgg0Lgg0YHQu9Cw0LnQtNGLXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvL3NsaWRlcy5hcHBlbmQoZ2VuZXJhdGVfc2xpZGUoZGF0YVtpXSkpO1xuICAgICAgc2xpZGVfc2VsZWN0X2JveC5hcHBlbmQoJzxsaSBjbGFzcz1cInNsaWRlX3NlbGVjdCBkaXNhYmxlZFwiLz4nKVxuICAgIH1cblxuICAgIC8qc2xpZGVzLmZpbmQoJy5zbGlkZScpLmVxKDApXG4gICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpXG4gICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpO1xuICAgICBzbGlkZV9jb250cm9sLmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTsqL1xuXG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZXMpO1xuICAgIHNsaWRlX2NvbnRyb2wuYXBwZW5kKHNsaWRlX3NlbGVjdF9ib3gpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVfY29udHJvbCk7XG5cblxuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGlmICghcGFyYWxsYXhfZ3JvdXApcmV0dXJuIGZhbHNlO1xuICAgIHZhciBwYXJhbGxheF9rID0gKHBhcmFsbGF4X2NvdW50ZXIgLSAxMCkgLyAyO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbGxheF9ncm91cC5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGVsID0gcGFyYWxsYXhfZ3JvdXAuZXEoaSk7XG4gICAgICB2YXIgaiA9IGVsLmF0dHIoJ3onKTtcbiAgICAgIHZhciB0ciA9ICdyb3RhdGUzZCgwLjEsMC44LDAsJyArIChwYXJhbGxheF9rKSArICdkZWcpIHNjYWxlKCcgKyAoMSArIGogKiAwLjUpICsgJykgdHJhbnNsYXRlWigtJyArICgxMCArIGogKiAyMCkgKyAncHgpJztcbiAgICAgIGVsLmNzcygndHJhbnNmb3JtJywgdHIpXG4gICAgfVxuICAgIHBhcmFsbGF4X2NvdW50ZXIgKz0gcGFyYWxsYXhfZCAqIDAuMTtcbiAgICBpZiAocGFyYWxsYXhfY291bnRlciA+PSAyMClwYXJhbGxheF9kID0gLXBhcmFsbGF4X2Q7XG4gICAgaWYgKHBhcmFsbGF4X2NvdW50ZXIgPD0gMClwYXJhbGxheF9kID0gLXBhcmFsbGF4X2Q7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcbn0oKSk7XG4iLCJ2YXIgaGVhZGVyQWN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuICB2YXIgc2hhZG93ZWREb3duID0gZmFsc2U7XG5cbiAgJCgnLm1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgICQoJy5kcm9wLW1lbnUnKS5yZW1vdmVDbGFzcygnb3BlbicpLnJlbW92ZUNsYXNzKCdjbG9zZScpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICBpZiAoJCgnLmhlYWRlcicpLmhhc0NsYXNzKCdoZWFkZXJfb3Blbi1tZW51JykpIHtcbiAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJCgnLnNlYXJjaC10b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgJCgnLmhlYWRlcicpLnRvZ2dsZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcbiAgICAkKCcjYXV0b2NvbXBsZXRlJykuZmFkZU91dCgpO1xuICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpKSB7XG4gICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoJyNoZWFkZXInKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlLnRhcmdldC5pZCA9PSAnaGVhZGVyJykge1xuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgIH1cbiAgfSk7XG5cbiAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJ2Zvcm0nKS5zdWJtaXQoKTtcbiAgfSk7XG5cbiAgJCgnLmhlYWRlci1zZWNvbmRsaW5lX2Nsb3NlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICB9KTtcblxuICAkKCcuaGVhZGVyLXVwbGluZScpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmICghc2Nyb2xsZWREb3duKXJldHVybjtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCAxMDI0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oJ2xvYWQgcmVzaXplIHNjcm9sbCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2hhZG93SGVpZ2h0ID0gNTA7XG4gICAgdmFyIGhpZGVIZWlnaHQgPSAyMDA7XG4gICAgdmFyIGhlYWRlclNlY29uZExpbmUgPSAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKTtcbiAgICB2YXIgaG92ZXJzID0gaGVhZGVyU2Vjb25kTGluZS5maW5kKCc6aG92ZXInKTtcbiAgICB2YXIgaGVhZGVyID0gJCgnLmhlYWRlcicpO1xuXG4gICAgaWYgKCFob3ZlcnMubGVuZ3RoKSB7XG4gICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgICBoZWFkZXIucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcbiAgICAgIC8vZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuICAgICAgdmFyIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgIGlmIChzY3JvbGxUb3AgPiBzaGFkb3dIZWlnaHQgJiYgc2hhZG93ZWREb3duID09PSBmYWxzZSkge1xuICAgICAgICBzaGFkb3dlZERvd24gPSB0cnVlO1xuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzaGFkb3dlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKHNjcm9sbFRvcCA8PSBzaGFkb3dIZWlnaHQgJiYgc2hhZG93ZWREb3duID09PSB0cnVlKSB7XG4gICAgICAgIHNoYWRvd2VkRG93biA9IGZhbHNlO1xuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzaGFkb3dlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKHNjcm9sbFRvcCA+IGhpZGVIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSBmYWxzZSkge1xuICAgICAgICBzY3JvbGxlZERvd24gPSB0cnVlO1xuICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzY3JvbGwtZG93bicpO1xuICAgICAgfVxuICAgICAgaWYgKHNjcm9sbFRvcCA8PSBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xuICAgICAgaGVhZGVyLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgfVxuICB9KTtcblxuICAkKCcubWVudV9hbmdsZS1kb3duLCAuZHJvcC1tZW51X2dyb3VwX191cC1oZWFkZXInKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIHZhciBtZW51T3BlbiA9ICQodGhpcykuY2xvc2VzdCgnLmhlYWRlcl9vcGVuLW1lbnUsIC5jYXRhbG9nLWNhdGVnb3JpZXMnKTtcbiAgICBpZiAoIW1lbnVPcGVuLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgcGFyZW50ID0gJCh0aGlzKS5jbG9zZXN0KCcuZHJvcC1tZW51X2dyb3VwX191cCwgLm1lbnUtZ3JvdXAnKTtcbiAgICB2YXIgcGFyZW50TWVudSA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudScpO1xuICAgIGlmIChwYXJlbnRNZW51KSB7XG4gICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICB9XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAkKHBhcmVudCkudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgICAgIGlmIChwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgICAkKHBhcmVudCkucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLmFkZENsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gIHZhciBhY2NvdW50TWVudVRpbWVPdXQgPSBudWxsO1xuICB2YXIgYWNjb3VudE1lbnVPcGVuVGltZSA9IDA7XG4gIHZhciBhY2NvdW50TWVudSA9ICQoJy5hY2NvdW50LW1lbnUnKTtcblxuICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IDEwMjQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xuICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcblxuICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcblxuICAgIGlmIChhY2NvdW50TWVudS5oYXNDbGFzcygnaGlkZGVuJykpIHtcbiAgICAgIG1lbnVBY2NvdW50VXAodGhhdCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhhdC5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgYWNjb3VudE1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgIH1cblxuICB9KTtcblxuICAvL9C/0L7QutCw0Lcg0LzQtdC90Y4g0LDQutC60LDRg9C90YJcbiAgZnVuY3Rpb24gbWVudUFjY291bnRVcCh0b2dnbGVCdXR0b24pIHtcbiAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XG4gICAgdG9nZ2xlQnV0dG9uLmFkZENsYXNzKCdvcGVuJyk7XG4gICAgYWNjb3VudE1lbnUucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSAxMDI0KSB7XG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XG4gICAgfVxuXG4gICAgYWNjb3VudE1lbnVPcGVuVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgYWNjb3VudE1lbnVUaW1lT3V0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gMTAyNCkge1xuICAgICAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XG4gICAgICB9XG4gICAgICBpZiAoKG5ldyBEYXRlKCkgLSBhY2NvdW50TWVudU9wZW5UaW1lKSA+IDEwMDAgKiA3KSB7XG4gICAgICAgIGFjY291bnRNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgdG9nZ2xlQnV0dG9uLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcbiAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgICAgfVxuXG4gICAgfSwgMTAwMCk7XG4gIH1cblxuICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzLWFjY291bnRfbWVudS1oZWFkZXInKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKCkge1xuICAgIGFjY291bnRNZW51T3BlblRpbWUgPSBuZXcgRGF0ZSgpO1xuICB9KTtcbiAgJCgnLmFjY291bnQtbWVudScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCdhY2NvdW50LW1lbnUnKSkge1xuICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgIH1cbiAgfSk7XG59KCk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gcGFyc2VOdW0oc3RyKSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoXG4gICAgICBTdHJpbmcoc3RyKVxuICAgICAgICAucmVwbGFjZSgnLCcsICcuJylcbiAgICAgICAgLm1hdGNoKC8tP1xcZCsoPzpcXC5cXGQrKT8vZywgJycpIHx8IDBcbiAgICAgICwgMTBcbiAgICApO1xuICB9XG5cbiAgJCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKS5maW5kKCdzZWxlY3QsaW5wdXQnKS5vbignY2hhbmdlIGtleXVwIGNsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGhpcyA9ICQodGhpcykuY2xvc2VzdCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKTtcbiAgICB2YXIgY3VycyA9IHBhcnNlTnVtKCR0aGlzLmZpbmQoJ3NlbGVjdCcpLnZhbCgpKTtcbiAgICB2YXIgdmFsID0gJHRoaXMuZmluZCgnaW5wdXQnKS52YWwoKTtcbiAgICBpZiAocGFyc2VOdW0odmFsKSAhPSB2YWwpIHtcbiAgICAgIHZhbCA9ICR0aGlzLmZpbmQoJ2lucHV0JykudmFsKHBhcnNlTnVtKHZhbCkpO1xuICAgIH1cbiAgICB2YWwgPSBwYXJzZU51bSh2YWwpO1xuXG4gICAgdmFyIGtvZWYgPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2snKS50cmltKCk7XG4gICAgdmFyIHByb21vID0gJHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLXByb21vJykudHJpbSgpO1xuICAgIHZhciBjdXJyZW5jeSA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1jdXJyZW5jeScpLnRyaW0oKTtcbiAgICB2YXIgcmVzdWx0ID0gMDtcbiAgICB2YXIgb3V0ID0gMDtcblxuICAgIGlmIChrb2VmID09IHByb21vKSB7XG4gICAgICBwcm9tbyA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGtvZWYuaW5kZXhPZignJScpID4gMCkge1xuICAgICAgcmVzdWx0ID0gcGFyc2VOdW0oa29lZikgKiB2YWwgKiBjdXJzIC8gMTAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJzID0gcGFyc2VOdW0oJHRoaXMuZmluZCgnW2NvZGU9JyArIGN1cnJlbmN5ICsgJ10nKS52YWwoKSk7XG4gICAgICByZXN1bHQgPSBwYXJzZU51bShrb2VmKSAqIGN1cnNcbiAgICB9XG5cbiAgICBpZiAocGFyc2VOdW0ocHJvbW8pID4gMCkge1xuICAgICAgaWYgKHByb21vLmluZGV4T2YoJyUnKSA+IDApIHtcbiAgICAgICAgcHJvbW8gPSBwYXJzZU51bShwcm9tbykgKiB2YWwgKiBjdXJzIC8gMTAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbW8gPSBwYXJzZU51bShwcm9tbykgKiBjdXJzXG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9tbyA+IDApIHtcbiAgICAgICAgb3V0ID0gXCI8c3BhbiBjbGFzcz1vbGRfcHJpY2U+XCIgKyByZXN1bHQudG9GaXhlZCgyKSArIFwiPC9zcGFuPiBcIiArIHByb21vLnRvRml4ZWQoMik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXQgPSByZXN1bHQudG9GaXhlZCgyKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gcmVzdWx0LnRvRml4ZWQoMik7XG4gICAgfVxuXG5cbiAgICAkdGhpcy5maW5kKCcuY2FsYy1yZXN1bHRfdmFsdWUnKS5odG1sKG91dClcbiAgfSkuY2xpY2soKVxufSk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICB2YXIgZWxzID0gJCgnLmF1dG9faGlkZV9jb250cm9sJyk7XG4gIGlmIChlbHMubGVuZ3RoID09IDApcmV0dXJuO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiLnNjcm9sbF9ib3gtc2hvd19tb3JlXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgYnV0dG9uWWVzOiBmYWxzZSxcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfd2hpdGUgbm90aWZ5X25vdF9iaWdcIlxuICAgIH07XG5cbiAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgdmFyIGNvbnRlbnQgPSAkdGhpcy5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtJykuY2xvbmUoKTtcbiAgICBjb250ZW50ID0gY29udGVudFswXTtcbiAgICBjb250ZW50LmNsYXNzTmFtZSArPSAnIHNjcm9sbF9ib3gtaXRlbS1tb2RhbCc7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5jbGFzc05hbWUgPSAnY29tbWVudHMnO1xuICAgIGRpdi5hcHBlbmQoY29udGVudCk7XG4gICAgJChkaXYpLmZpbmQoJy5zY3JvbGxfYm94LXNob3dfbW9yZScpLnJlbW92ZSgpO1xuICAgICQoZGl2KS5maW5kKCcubWF4X3RleHRfaGlkZScpXG4gICAgICAucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUteDInKVxuICAgICAgLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlJyk7XG4gICAgZGF0YS5xdWVzdGlvbiA9IGRpdi5vdXRlckhUTUw7XG5cbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhc1Njcm9sbChlbCkge1xuICAgIHJldHVybiBlbC5zY3JvbGxIZWlnaHQgPiBlbC5jbGllbnRIZWlnaHQ7XG4gIH1cblxuICBmdW5jdGlvbiByZWJ1aWxkKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZWwgPSBlbHMuZXEoaSk7XG4gICAgICB2YXIgaXNfaGlkZSA9IGZhbHNlO1xuICAgICAgaWYgKGVsLmhlaWdodCgpIDwgMTApIHtcbiAgICAgICAgaXNfaGlkZSA9IHRydWU7XG4gICAgICAgIGVsLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0taGlkZScpLnNob3coMCk7XG4gICAgICB9XG5cbiAgICAgIHZhciB0ZXh0ID0gZWwuZmluZCgnLnNjcm9sbF9ib3gtdGV4dCcpO1xuICAgICAgdmFyIGFuc3dlciA9IGVsLmZpbmQoJy5zY3JvbGxfYm94LWFuc3dlcicpO1xuICAgICAgdmFyIHNob3dfbW9yZSA9IGVsLmZpbmQoJy5zY3JvbGxfYm94LXNob3dfbW9yZScpO1xuXG4gICAgICB2YXIgc2hvd19idG4gPSBmYWxzZTtcbiAgICAgIGlmIChoYXNTY3JvbGwodGV4dFswXSkpIHtcbiAgICAgICAgc2hvd19idG4gPSB0cnVlO1xuICAgICAgICB0ZXh0LnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYW5zd2VyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy/QtdGB0YLRjCDQvtGC0LLQtdGCINCw0LTQvNC40L3QsFxuICAgICAgICBpZiAoaGFzU2Nyb2xsKGFuc3dlclswXSkpIHtcbiAgICAgICAgICBzaG93X2J0biA9IHRydWU7XG4gICAgICAgICAgYW5zd2VyLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbnN3ZXIuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzaG93X2J0bikge1xuICAgICAgICBzaG93X21vcmUuc2hvdygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2hvd19tb3JlLmhpZGUoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzX2hpZGUpIHtcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuaGlkZSgwKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAkKHdpbmRvdykucmVzaXplKHJlYnVpbGQpO1xuICByZWJ1aWxkKCk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcuc2hvd19hbGwnLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgY2xzID0gJCh0aGlzKS5kYXRhKCdjbnRybC1jbGFzcycpO1xuICAgICQoJy5oaWRlX2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcbiAgICAkKHRoaXMpLmhpZGUoKTtcbiAgICAkKCcuJyArIGNscykuc2hvdygpO1xuICB9KTtcblxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5oaWRlX2FsbCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBjbHMgPSAkKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XG4gICAgJCgnLnNob3dfYWxsW2RhdGEtY250cmwtY2xhc3NdJykuc2hvdygpO1xuICAgICQodGhpcykuaGlkZSgpO1xuICAgICQoJy4nICsgY2xzKS5oaWRlKCk7XG4gIH0pO1xufSkoKTtcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVjbE9mTnVtKG51bWJlciwgdGl0bGVzKSB7XG4gICAgY2FzZXMgPSBbMiwgMCwgMSwgMSwgMSwgMl07XG4gICAgcmV0dXJuIHRpdGxlc1sobnVtYmVyICUgMTAwID4gNCAmJiBudW1iZXIgJSAxMDAgPCAyMCkgPyAyIDogY2FzZXNbKG51bWJlciAlIDEwIDwgNSkgPyBudW1iZXIgJSAxMCA6IDVdXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpcnN0WmVybyh2KSB7XG4gICAgdiA9IE1hdGguZmxvb3Iodik7XG4gICAgaWYgKHYgPCAxMClcbiAgICAgIHJldHVybiAnMCcgKyB2O1xuICAgIGVsc2VcbiAgICAgIHJldHVybiB2O1xuICB9XG5cbiAgdmFyIGNsb2NrcyA9ICQoJy5jbG9jaycpO1xuICBpZiAoY2xvY2tzLmxlbmd0aCA+IDApIHtcbiAgICBmdW5jdGlvbiB1cGRhdGVDbG9jaygpIHtcbiAgICAgIHZhciBjbG9ja3MgPSAkKHRoaXMpO1xuICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IGNsb2Nrcy5lcShpKTtcbiAgICAgICAgdmFyIGVuZCA9IG5ldyBEYXRlKGMuZGF0YSgnZW5kJykucmVwbGFjZSgvLS9nLCBcIi9cIikpO1xuICAgICAgICB2YXIgZCA9IChlbmQuZ2V0VGltZSgpIC0gbm93LmdldFRpbWUoKSkgLyAxMDAwO1xuXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0L/RgNC+0YjQtdC7XG4gICAgICAgIGlmIChkIDw9IDApIHtcbiAgICAgICAgICBjLnRleHQoJ9Cf0YDQvtC80L7QutC+0LQg0LjRgdGC0LXQuicpO1xuICAgICAgICAgIGMuYWRkQ2xhc3MoJ2Nsb2NrLWV4cGlyZWQnKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0LHQvtC70LXQtSAzMCDQtNC90LXQuVxuICAgICAgICBpZiAoZCA+IDMwICogNjAgKiA2MCAqIDI0KSB7XG4gICAgICAgICAgYy5odG1sKCfQntGB0YLQsNC70L7RgdGMOiA8c3Bhbj7QsdC+0LvQtdC1IDMwINC00L3QtdC5PC9zcGFuPicpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHMgPSBkICUgNjA7XG4gICAgICAgIGQgPSAoZCAtIHMpIC8gNjA7XG4gICAgICAgIHZhciBtID0gZCAlIDYwO1xuICAgICAgICBkID0gKGQgLSBtKSAvIDYwO1xuICAgICAgICB2YXIgaCA9IGQgJSAyNDtcbiAgICAgICAgZCA9IChkIC0gaCkgLyAyNDtcblxuICAgICAgICB2YXIgc3RyID0gZmlyc3RaZXJvKGgpICsgXCI6XCIgKyBmaXJzdFplcm8obSkgKyBcIjpcIiArIGZpcnN0WmVybyhzKTtcbiAgICAgICAgaWYgKGQgPiAwKSB7XG4gICAgICAgICAgc3RyID0gZCArIFwiIFwiICsgZGVjbE9mTnVtKGQsIFsn0LTQtdC90YwnLCAn0LTQvdGPJywgJ9C00L3QtdC5J10pICsgXCIgIFwiICsgc3RyO1xuICAgICAgICB9XG4gICAgICAgIGMuaHRtbChcItCe0YHRgtCw0LvQvtGB0Yw6IDxzcGFuPlwiICsgc3RyICsgXCI8L3NwYW4+XCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNldEludGVydmFsKHVwZGF0ZUNsb2NrLmJpbmQoY2xvY2tzKSwgMTAwMCk7XG4gICAgdXBkYXRlQ2xvY2suYmluZChjbG9ja3MpKCk7XG4gIH1cbn0pO1xuIiwidmFyIGNhdGFsb2dUeXBlU3dpdGNoZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjYXRhbG9nID0gJCgnLmNhdGFsb2dfbGlzdCcpO1xuICBpZiAoY2F0YWxvZy5sZW5ndGggPT0gMClyZXR1cm47XG5cbiAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLmZpbmQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbicpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XG4gICAgJCh0aGlzKS5hZGRDbGFzcygnY2hlY2tlZCcpO1xuICAgIGlmIChjYXRhbG9nKSB7XG4gICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykpIHtcbiAgICAgICAgY2F0YWxvZy5yZW1vdmVDbGFzcygnbmFycm93Jyk7XG4gICAgICAgIHNldENvb2tpZSgnY291cG9uc192aWV3JywgJycpXG4gICAgICB9XG4gICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1uYXJyb3cnKSkge1xuICAgICAgICBjYXRhbG9nLmFkZENsYXNzKCduYXJyb3cnKTtcbiAgICAgICAgc2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnLCAnbmFycm93Jyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAoZ2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnKSA9PSAnbmFycm93JyAmJiAhY2F0YWxvZy5oYXNDbGFzcygnbmFycm93X29mZicpKSB7XG4gICAgY2F0YWxvZy5hZGRDbGFzcygnbmFycm93Jyk7XG4gICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbmFycm93JykuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcbiAgICAkKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykucmVtb3ZlQ2xhc3MoJ2NoZWNrZWQnKTtcbiAgfVxufSgpO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gICQoJy5zZC1zZWxlY3Qtc2VsZWN0ZWQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBhcmVudCA9ICQodGhpcykucGFyZW50KCk7XG4gICAgdmFyIGRyb3BCbG9jayA9ICQocGFyZW50KS5maW5kKCcuc2Qtc2VsZWN0LWRyb3AnKTtcblxuICAgIGlmIChkcm9wQmxvY2suaXMoJzpoaWRkZW4nKSkge1xuICAgICAgZHJvcEJsb2NrLnNsaWRlRG93bigpO1xuXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuICAgICAgaWYgKCFwYXJlbnQuaGFzQ2xhc3MoJ2xpbmtlZCcpKSB7XG5cbiAgICAgICAgJCgnLnNkLXNlbGVjdC1kcm9wJykuZmluZCgnYScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdmFyIHNlbGVjdFJlc3VsdCA9ICQodGhpcykuaHRtbCgpO1xuXG4gICAgICAgICAgJChwYXJlbnQpLmZpbmQoJ2lucHV0JykudmFsKHNlbGVjdFJlc3VsdCk7XG5cbiAgICAgICAgICAkKHBhcmVudCkuZmluZCgnLnNkLXNlbGVjdC1zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5odG1sKHNlbGVjdFJlc3VsdCk7XG5cbiAgICAgICAgICBkcm9wQmxvY2suc2xpZGVVcCgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbn0pO1xuIiwic2VhcmNoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3BlbkF1dG9jb21wbGV0ZTtcblxuICAkKCcuc2VhcmNoLWZvcm0taW5wdXQnKS5vbignaW5wdXQnLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgdmFyIHF1ZXJ5ID0gJHRoaXMudmFsKCk7XG4gICAgdmFyIGRhdGEgPSAkdGhpcy5jbG9zZXN0KCdmb3JtJykuc2VyaWFsaXplKCk7XG4gICAgdmFyIGF1dG9jb21wbGV0ZSA9ICR0aGlzLmNsb3Nlc3QoJy5zdG9yZXNfc2VhcmNoJykuZmluZCgnLmF1dG9jb21wbGV0ZS13cmFwJyk7Ly8gJCgnI2F1dG9jb21wbGV0ZScpLFxuICAgIHZhciBhdXRvY29tcGxldGVMaXN0ID0gJChhdXRvY29tcGxldGUpLmZpbmQoJ3VsJyk7XG4gICAgb3BlbkF1dG9jb21wbGV0ZSA9IGF1dG9jb21wbGV0ZTtcbiAgICBpZiAocXVlcnkubGVuZ3RoID4gMSkge1xuICAgICAgdXJsID0gJHRoaXMuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicpIHx8ICcvc2VhcmNoJztcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICB0eXBlOiAnZ2V0JyxcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGRhdGEuc3VnZ2VzdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBodG1sID0gJzxhIGNsYXNzPVwiYXV0b2NvbXBsZXRlX2xpbmtcIiBocmVmPVwiJyArIGl0ZW0uZGF0YS5yb3V0ZSArICdcIicgKyAnPicgKyBpdGVtLnZhbHVlICsgaXRlbS5jYXNoYmFjayArICc8L2E+JztcbiAgICAgICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICAgICAgICAgIGxpLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuYXBwZW5kKGxpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVJbigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgJChhdXRvY29tcGxldGVMaXN0KS5odG1sKCcnKTtcbiAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KS5vbignZm9jdXNvdXQnLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmICghJChlLnJlbGF0ZWRUYXJnZXQpLmhhc0NsYXNzKCdhdXRvY29tcGxldGVfbGluaycpKSB7XG4gICAgICAvLyQoJyNhdXRvY29tcGxldGUnKS5oaWRlKCk7XG4gICAgICAkKG9wZW5BdXRvY29tcGxldGUpLmRlbGF5KDEwMCkuc2xpZGVVcCgxMDApXG4gICAgfVxuICB9KTtcblxuICAkKCdib2R5Jykub24oJ3N1Ym1pdCcsICcuc3RvcmVzLXNlYXJjaF9mb3JtJywgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgdmFsID0gJCh0aGlzKS5maW5kKCcuc2VhcmNoLWZvcm0taW5wdXQnKS52YWwoKTtcbiAgICBpZiAodmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pXG59KCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICQoJy5jb3Vwb25zLWxpc3RfaXRlbS1jb250ZW50LWdvdG8tcHJvbW9jb2RlLWxpbmsnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcbiAgICB2YXIgZXhwaXJlZCA9IHRoYXQuY2xvc2VzdCgnLmNvdXBvbnMtbGlzdF9pdGVtJykuZmluZCgnLmNsb2NrLWV4cGlyZWQnKTtcbiAgICB2YXIgdXNlcklkID0gJCh0aGF0KS5kYXRhKCd1c2VyJyk7XG4gICAgdmFyIGluYWN0aXZlID0gJCh0aGF0KS5kYXRhKCdpbmFjdGl2ZScpO1xuICAgIHZhciBkYXRhX21lc3NhZ2UgPSAkKHRoYXQpLmRhdGEoJ21lc3NhZ2UnKTtcblxuICAgIGlmIChpbmFjdGl2ZSkge1xuICAgICAgdmFyIHRpdGxlID0gZGF0YV9tZXNzYWdlID8gZGF0YV9tZXNzYWdlIDogJ9CaINGB0L7QttCw0LvQtdC90LjRjiwg0L/RgNC+0LzQvtC60L7QtCDQvdC10LDQutGC0LjQstC10L0nO1xuICAgICAgdmFyIG1lc3NhZ2UgPSAn0JLRgdC1INC00LXQudGB0YLQstGD0Y7RidC40LUg0L/RgNC+0LzQvtC60L7QtNGLINCy0Ysg0LzQvtC20LXRgtC1IDxhIGhyZWY9XCIvY291cG9uc1wiPtC/0L7RgdC80L7RgtGA0LXRgtGMINC30LTQtdGB0Yw8L2E+JztcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XG4gICAgICAgICd0aXRsZSc6IHRpdGxlLFxuICAgICAgICAncXVlc3Rpb24nOiBtZXNzYWdlLFxuICAgICAgICAnYnV0dG9uWWVzJzogJ09rJyxcbiAgICAgICAgJ2J1dHRvbk5vJzogZmFsc2UsXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiAnbm90aWZ5X2JveC1hbGVydCdcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoZXhwaXJlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgdGl0bGUgPSAn0Jog0YHQvtC20LDQu9C10L3QuNGOLCDRgdGA0L7QuiDQtNC10LnRgdGC0LLQuNGPINC00LDQvdC90L7Qs9C+INC/0YDQvtC80L7QutC+0LTQsCDQuNGB0YLQtdC6JztcbiAgICAgIHZhciBtZXNzYWdlID0gJ9CS0YHQtSDQtNC10LnRgdGC0LLRg9GO0YnQuNC1INC/0YDQvtC80L7QutC+0LTRiyDQstGLINC80L7QttC10YLQtSA8YSBocmVmPVwiL2NvdXBvbnNcIj7Qv9C+0YHQvNC+0YLRgNC10YLRjCDQt9C00LXRgdGMPC9hPic7XG4gICAgICBub3RpZmljYXRpb24uYWxlcnQoe1xuICAgICAgICAndGl0bGUnOiB0aXRsZSxcbiAgICAgICAgJ3F1ZXN0aW9uJzogbWVzc2FnZSxcbiAgICAgICAgJ2J1dHRvblllcyc6ICdPaycsXG4gICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxuICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKCF1c2VySWQpIHtcbiAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAnYnV0dG9uWWVzJzogZmFsc2UsXG4gICAgICAgICdub3R5ZnlfY2xhc3MnOiBcIm5vdGlmeV9ib3gtYWxlcnRcIixcbiAgICAgICAgJ3RpdGxlJzogJ9CY0YHQv9C+0LvRjNC30L7QstCw0YLRjCDQv9GA0L7QvNC+0LrQvtC0JyxcbiAgICAgICAgJ3F1ZXN0aW9uJzogJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWNvdXBvbi1ub3JlZ2lzdGVyXCI+JyArXG4gICAgICAgICc8aW1nIHNyYz1cIi9pbWFnZXMvdGVtcGxhdGVzL3N3YS5wbmdcIiBhbHQ9XCJcIj4nICtcbiAgICAgICAgJzxwPjxiPtCV0YHQu9C4INCy0Ysg0YXQvtGC0LjRgtC1INC/0L7Qu9GD0YfQsNGC0Ywg0LXRidC1INC4INCa0K3QqNCR0K3QmiAo0LLQvtC30LLRgNCw0YIg0LTQtdC90LXQsyksINCy0LDQvCDQvdC10L7QsdGF0L7QtNC40LzQviDQt9Cw0YDQtdCz0LjRgdGC0YDQuNGA0L7QstCw0YLRjNGB0Y8uINCd0L4g0LzQvtC20LXRgtC1INC4INC/0YDQvtGB0YLQviDQstC+0YHQv9C+0LvRjNC30L7QstCw0YLRjNGB0Y8g0L/RgNC+0LzQvtC60L7QtNC+0LwsINCx0LXQtyDQutGN0YjQsdGN0LrQsC48L2I+PC9wPicgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveC1idXR0b25zXCI+JyArXG4gICAgICAgICc8YSBocmVmPVwiJyArIHRoYXQuYXR0cignaHJlZicpICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiIGNsYXNzPVwiYnRuXCI+0JjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMINC/0YDQvtC80L7QutC+0LQ8L2E+JyArXG4gICAgICAgICc8YSBocmVmPVwiI3JlZ2lzdHJhdGlvblwiIGNsYXNzPVwiYnRuIGJ0bi10cmFuc2Zvcm0gbW9kYWxzX29wZW5cIj7Ql9Cw0YDQtdCz0LjRgdGC0YDQuNGA0L7QstCw0YLRjNGB0Y88L2E+JyArXG4gICAgICAgICc8L2Rpdj4nXG4gICAgICB9O1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSk7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAkKCcuYWNjb3VudC13aXRoZHJhdy1tZXRob2RzX2l0ZW0tb3B0aW9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIG9wdGlvbiA9ICQodGhpcykuZGF0YSgnb3B0aW9uLXByb2Nlc3MnKSxcbiAgICAgIHBsYWNlaG9sZGVyID0gJyc7XG4gICAgc3dpdGNoIChvcHRpb24pIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YHRh9GR0YLQsFwiO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAyOlxuICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCBSLdC60L7RiNC10LvRjNC60LBcIjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMzpcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YLQtdC70LXRhNC+0L3QsFwiO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA0OlxuICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDQutCw0YDRgtGLXCI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDU6XG4gICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSBlbWFpbCDQsNC00YDQtdGBXCI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDY6XG4gICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINGC0LXQu9C10YTQvtC90LBcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAkKFwiI3VzZXJzd2l0aGRyYXctYmlsbFwiKS5hdHRyKFwicGxhY2Vob2xkZXJcIiwgcGxhY2Vob2xkZXIpO1xuICAgICQoJyN1c2Vyc3dpdGhkcmF3LXByb2Nlc3NfaWQnKS52YWwob3B0aW9uKTtcbiAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgYWpheEZvcm0oJCgnLmFqYXhfZm9ybScpKTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAkKCcuZG9icm8tZnVuZHNfaXRlbS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICQoJyNkb2Jyby1zZW5kLWZvcm0tY2hhcml0eS1wcm9jZXNzJykudmFsKCQodGhpcykuZGF0YSgnaWQnKSk7XG4gIH0pO1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQnKS5hZGRDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LW9wZW4nKTtcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykuYWRkQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZS1vcGVuJyk7XG4gIH0pO1xuICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LWNsb3NlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdCcpLnJlbW92ZUNsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtb3BlbicpO1xuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5yZW1vdmVDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlLW9wZW4nKTtcbiAgfSk7XG59KSgpO1xuIiwiLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xuc2hhcmU0MiA9IGZ1bmN0aW9uICgpe1xuICBlPWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXJlNDJpbml0Jyk7XG4gIGZvciAodmFyIGsgPSAwOyBrIDwgZS5sZW5ndGg7IGsrKykge1xuICAgIHZhciB1ID0gXCJcIjtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29jaWFscycpICE9IC0xKVxuICAgICAgdmFyIHNvY2lhbHMgPSBKU09OLnBhcnNlKCdbJytlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zb2NpYWxzJykrJ10nKTtcbiAgICB2YXIgaWNvbl90eXBlPWVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tdHlwZScpICE9IC0xP2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tdHlwZScpOicnO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKSAhPSAtMSlcbiAgICAgIHUgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKTtcbiAgICB2YXIgcHJvbW8gPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9tbycpO1xuICAgIGlmKHByb21vID09IC0xKSB7XG4gICAgICB2YXIga2V5ID0gJ3Byb21vPScsXG4gICAgICAgIHByb21vU3RhcnQgPSB1LmluZGV4T2Yoa2V5KSxcbiAgICAgICAgcHJvbW9FbmQgPSB1LmluZGV4T2YoJyYnLCBwcm9tb1N0YXJ0KSxcbiAgICAgICAgcHJvbW9MZW5ndGggPSBwcm9tb0VuZCA+IHByb21vU3RhcnQgPyBwcm9tb0VuZCAtIHByb21vU3RhcnQgLSBrZXkubGVuZ3RoIDogdS5sZW5ndGggLSBwcm9tb1N0YXJ0IC0ga2V5Lmxlbmd0aDtcbiAgICAgIGlmKHByb21vU3RhcnQgPiAwKSB7XG4gICAgICAgIHByb21vID0gdS5zdWJzdHIocHJvbW9TdGFydCArIGtleS5sZW5ndGgsIHByb21vTGVuZ3RoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIHNlbGZfcHJvbW8gPSBwcm9tbyAhPS0xID8gXCJzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2VuZF9wcm9tbygnXCIrcHJvbW8rXCInKX0sMjAwMCk7XCIgOiBcIlwiO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXNpemUnKSAhPSAtMSlcbiAgICAgIHZhciBpY29uX3NpemUgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXNpemUnKTtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnKSAhPSAtMSlcbiAgICAgIHZhciB0ID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnKTtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1hZ2UnKSAhPSAtMSlcbiAgICAgIHZhciBpID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1hZ2UnKTtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzY3JpcHRpb24nKSAhPSAtMSlcbiAgICAgIHZhciBkID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzY3JpcHRpb24nKTtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF0aCcpICE9IC0xKVxuICAgICAgdmFyIGYgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wYXRoJyk7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb25zLWZpbGUnKSAhPSAtMSlcbiAgICAgIHZhciBmbiA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb25zLWZpbGUnKTtcbiAgICBpZiAoIWYpIHtcbiAgICAgIGZ1bmN0aW9uIHBhdGgobmFtZSkge1xuICAgICAgICB2YXIgc2MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylcbiAgICAgICAgICAsIHNyID0gbmV3IFJlZ0V4cCgnXiguKi98KSgnICsgbmFtZSArICcpKFsjP118JCknKTtcbiAgICAgICAgZm9yICh2YXIgcCA9IDAsIHNjTCA9IHNjLmxlbmd0aDsgcCA8IHNjTDsgcCsrKSB7XG4gICAgICAgICAgdmFyIG0gPSBTdHJpbmcoc2NbcF0uc3JjKS5tYXRjaChzcik7XG4gICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgIGlmIChtWzFdLm1hdGNoKC9eKChodHRwcz98ZmlsZSlcXDpcXC97Mix9fFxcdzpbXFwvXFxcXF0pLykpXG4gICAgICAgICAgICAgIHJldHVybiBtWzFdO1xuICAgICAgICAgICAgaWYgKG1bMV0uaW5kZXhPZihcIi9cIikgPT0gMClcbiAgICAgICAgICAgICAgcmV0dXJuIG1bMV07XG4gICAgICAgICAgICBiID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2Jhc2UnKTtcbiAgICAgICAgICAgIGlmIChiWzBdICYmIGJbMF0uaHJlZilcbiAgICAgICAgICAgICAgcmV0dXJuIGJbMF0uaHJlZiArIG1bMV07XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvKC4qW1xcL1xcXFxdKS8pWzBdICsgbVsxXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBmID0gcGF0aCgnc2hhcmU0Mi5qcycpO1xuICAgIH1cbiAgICBpZiAoIXUpXG4gICAgICB1ID0gbG9jYXRpb24uaHJlZjtcbiAgICBpZiAoIXQpXG4gICAgICB0ID0gZG9jdW1lbnQudGl0bGU7XG4gICAgaWYgKCFmbilcbiAgICAgIGZuID0gJ2ljb25zLnBuZyc7XG4gICAgZnVuY3Rpb24gZGVzYygpIHtcbiAgICAgIHZhciBtZXRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ldGEnKTtcbiAgICAgIGZvciAodmFyIG0gPSAwOyBtIDwgbWV0YS5sZW5ndGg7IG0rKykge1xuICAgICAgICBpZiAobWV0YVttXS5uYW1lLnRvTG93ZXJDYXNlKCkgPT0gJ2Rlc2NyaXB0aW9uJykge1xuICAgICAgICAgIHJldHVybiBtZXRhW21dLmNvbnRlbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgaWYgKCFkKVxuICAgICAgZCA9IGRlc2MoKTtcbiAgICB1ID0gZW5jb2RlVVJJQ29tcG9uZW50KHUpO1xuICAgIHQgPSBlbmNvZGVVUklDb21wb25lbnQodCk7XG4gICAgdCA9IHQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcbiAgICBpID0gZW5jb2RlVVJJQ29tcG9uZW50KGkpO1xuICAgIHZhciBkX29yaWc9ZC5yZXBsYWNlKC9cXCcvZywgJyUyNycpO1xuICAgIGQgPSBlbmNvZGVVUklDb21wb25lbnQoZCk7XG4gICAgZCA9IGQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcbiAgICB2YXIgZmJRdWVyeSA9ICd1PScgKyB1O1xuICAgIGlmIChpICE9ICdudWxsJyAmJiBpICE9ICcnKVxuICAgICAgZmJRdWVyeSA9ICdzPTEwMCZwW3VybF09JyArIHUgKyAnJnBbdGl0bGVdPScgKyB0ICsgJyZwW3N1bW1hcnldPScgKyBkICsgJyZwW2ltYWdlc11bMF09JyArIGk7XG4gICAgdmFyIHZrSW1hZ2UgPSAnJztcbiAgICBpZiAoaSAhPSAnbnVsbCcgJiYgaSAhPSAnJylcbiAgICAgIHZrSW1hZ2UgPSAnJmltYWdlPScgKyBpO1xuICAgIHZhciBzID0gbmV3IEFycmF5KFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJmYlwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PScgKyB1ICsnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBGYWNlYm9va1wiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidmtcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3ZrLmNvbS9zaGFyZS5waHA/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArIHZrSW1hZ2UgKyAnJmRlc2NyaXB0aW9uPScgKyBkICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0JIg0JrQvtC90YLQsNC60YLQtVwiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwib2RrbFwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vY29ubmVjdC5vay5ydS9vZmZlcj91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgJyZkZXNjcmlwdGlvbj0nKyBkICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiDQntC00L3QvtC60LvQsNGB0YHQvdC40LrQuFwiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidHdpXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD0nICsgdCArICcmdXJsPScgKyB1ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiBUd2l0dGVyXCInLFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJncGx1c1wiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vcGx1cy5nb29nbGUuY29tL3NoYXJlP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBHb29nbGUrXCInLFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJtYWlsXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9jb25uZWN0Lm1haWwucnUvc2hhcmU/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICcmZGVzY3JpcHRpb249JyArIGQgKyAnJmltYWdldXJsPScgKyBpICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIg0JzQvtC10Lwg0JzQuNGA0LVATWFpbC5SdVwiJyxcbiAgICAgICdcIi8vd3d3LmxpdmVqb3VybmFsLmNvbS91cGRhdGUuYm1sP2V2ZW50PScgKyB1ICsgJyZzdWJqZWN0PScgKyB0ICsgJ1wiIHRpdGxlPVwi0J7Qv9GD0LHQu9C40LrQvtCy0LDRgtGMINCyIExpdmVKb3VybmFsXCInLFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJwaW5cIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3BpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD0nICsgdSArICcmbWVkaWE9JyArIGkgKyAnJmRlc2NyaXB0aW9uPScgKyB0ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD02MDAsIGhlaWdodD0zMDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiBQaW50ZXJlc3RcIicsXG4gICAgICAnXCJcIiBvbmNsaWNrPVwicmV0dXJuIGZhdih0aGlzKTtcIiB0aXRsZT1cItCh0L7RhdGA0LDQvdC40YLRjCDQsiDQuNC30LHRgNCw0L3QvdC+0LUg0LHRgNCw0YPQt9C10YDQsFwiJyxcbiAgICAgICdcIiNcIiBvbmNsaWNrPVwicHJpbnQoKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCg0LDRgdC/0LXRh9Cw0YLQsNGC0YxcIicsXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInRlbGVncmFtXCIgb25jbGljaz1cIndpbmRvdy5vcGVuKFxcJy8vdGVsZWdyYW0ubWUvc2hhcmUvdXJsP3VybD0nICsgdSArJyZ0ZXh0PScgKyB0ICsgJ1xcJywgXFwndGVsZWdyYW1cXCcsIFxcJ3dpZHRoPTU1MCxoZWlnaHQ9NDQwLGxlZnQ9MTAwLHRvcD0xMDBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgVGVsZWdyYW1cIicsXG4gICAgICAnXCJ2aWJlcjovL2ZvcndhcmQ/dGV4dD0nKyB1ICsnIC0gJyArIHQgKyAnXCIgZGF0YS1jb3VudD1cInZpYmVyXCIgcmVsPVwibm9mb2xsb3cgbm9vcGVuZXJcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIFZpYmVyXCInLFxuICAgICAgJ1wid2hhdHNhcHA6Ly9zZW5kP3RleHQ9JysgdSArJyAtICcgKyB0ICsgJ1wiIGRhdGEtY291bnQ9XCJ3aGF0c2FwcFwiIHJlbD1cIm5vZm9sbG93IG5vb3BlbmVyXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBXaGF0c0FwcFwiJ1xuXG4gICAgKTtcblxuICAgIHZhciBsID0gJyc7XG5cbiAgICBpZihzb2NpYWxzLmxlbmd0aD4xKXtcbiAgICAgIGZvciAocSA9IDA7IHEgPCBzb2NpYWxzLmxlbmd0aDsgcSsrKXtcbiAgICAgICAgaj1zb2NpYWxzW3FdO1xuICAgICAgICBsICs9ICc8YSByZWw9XCJub2ZvbGxvd1wiIGhyZWY9JyArIHNbal0gKyAnIHRhcmdldD1cIl9ibGFua1wiICcrZ2V0SWNvbihzW2pdLGosaWNvbl90eXBlLGYsZm4saWNvbl9zaXplKSsnPjwvYT4nO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgZm9yIChqID0gMDsgaiA8IHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgbCArPSAnPGEgcmVsPVwibm9mb2xsb3dcIiBocmVmPScgKyBzW2pdICsgJyB0YXJnZXQ9XCJfYmxhbmtcIiAnK2dldEljb24oc1tqXSxqLGljb25fdHlwZSxmLGZuLGljb25fc2l6ZSkrJz48L2E+JztcbiAgICAgIH1cbiAgICB9XG4gICAgZVtrXS5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJzaGFyZTQyX3dyYXBcIj4nICsgbCArICc8L3NwYW4+JztcbiAgfVxuICBcbi8vfSwgZmFsc2UpO1xufSgpO1xuXG5mdW5jdGlvbiBnZXRJY29uKHMsaix0LGYsZm4sc2l6ZSkge1xuICBpZighc2l6ZSl7XG4gICAgc2l6ZT0zMjtcbiAgfVxuICBpZih0PT0nY3NzJyl7XG4gICAgaj1zLmluZGV4T2YoJ2RhdGEtY291bnQ9XCInKSsxMjtcbiAgICB2YXIgbD1zLmluZGV4T2YoJ1wiJyxqKS1qO1xuICAgIHZhciBsMj1zLmluZGV4T2YoJy4nLGopLWo7XG4gICAgbD1sPmwyICYmIGwyPjAgP2wyOmw7XG4gICAgLy92YXIgaWNvbj0nY2xhc3M9XCJzb2MtaWNvbiBpY29uLScrcy5zdWJzdHIoaixsKSsnXCInO1xuICAgIHZhciBpY29uPSdjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2QtJytzLnN1YnN0cihqLGwpKydcIic7XG4gIH1lbHNlIGlmKHQ9PSdzdmcnKXtcbiAgICB2YXIgc3ZnPVtcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDExMS45NCwxNzcuMDgpXCIgZD1cIk0wIDAgMCA3MC4zIDIzLjYgNzAuMyAyNy4xIDk3LjcgMCA5Ny43IDAgMTE1LjJDMCAxMjMuMiAyLjIgMTI4LjYgMTMuNiAxMjguNkwyOC4xIDEyOC42IDI4LjEgMTUzLjFDMjUuNiAxNTMuNCAxNyAxNTQuMiA2LjkgMTU0LjItMTQgMTU0LjItMjguMyAxNDEuNC0yOC4zIDExNy45TC0yOC4zIDk3LjctNTIgOTcuNy01MiA3MC4zLTI4LjMgNzAuMy0yOC4zIDAgMCAwWlwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsOTguMjc0LDE0NS41MilcIiBkPVwiTTAgMCA5LjYgMEM5LjYgMCAxMi41IDAuMyAxNCAxLjkgMTUuNCAzLjQgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMSAxOSAyMS4xIDIxIDI3IDIyLjggMzQuNiA4LjUgNDIuNyAzIDQ4LjctMS4yIDUzLjMtMC4zIDUzLjMtMC4zTDc0LjggMEM3NC44IDAgODYuMSAwLjcgODAuNyA5LjUgODAuMyAxMC4zIDc3LjYgMTYuMSA2NC44IDI4IDUxLjMgNDAuNSA1My4xIDM4LjUgNjkuMyA2MC4xIDc5LjIgNzMuMyA4My4yIDgxLjQgODEuOSA4NC44IDgwLjggODguMSA3My41IDg3LjIgNzMuNSA4Ny4yTDQ5LjMgODcuMUM0OS4zIDg3LjEgNDcuNSA4Ny4zIDQ2LjIgODYuNSA0NC45IDg1LjcgNDQgODMuOSA0NCA4My45IDQ0IDgzLjkgNDAuMiA3My43IDM1LjEgNjUuMSAyNC4zIDQ2LjggMjAgNDUuOCAxOC4zIDQ2LjkgMTQuMiA0OS42IDE1LjIgNTcuNiAxNS4yIDYzLjIgMTUuMiA4MSAxNy45IDg4LjQgOS45IDkwLjMgNy4zIDkwLjkgNS40IDkxLjMtMS40IDkxLjQtMTAgOTEuNS0xNy4zIDkxLjQtMjEuNCA4OS4zLTI0LjIgODgtMjYuMyA4NS0yNSA4NC44LTIzLjQgODQuNi0xOS44IDgzLjgtMTcuOSA4MS4yLTE1LjQgNzcuOS0xNS41IDcwLjMtMTUuNSA3MC4zLTE1LjUgNzAuMy0xNC4xIDQ5LjQtMTguOCA0Ni44LTIyLjEgNDUtMjYuNSA0OC43LTM2LjEgNjUuMy00MS4xIDczLjgtNDQuOCA4My4yLTQ0LjggODMuMi00NC44IDgzLjItNDUuNSA4NC45LTQ2LjggODUuOS00OC4zIDg3LTUwLjUgODcuNC01MC41IDg3LjRMLTczLjUgODcuMkMtNzMuNSA4Ny4yLTc2LjkgODcuMS03OC4yIDg1LjYtNzkuMyA4NC4zLTc4LjMgODEuNS03OC4zIDgxLjUtNzguMyA4MS41LTYwLjMgMzkuNC0zOS45IDE4LjItMjEuMi0xLjMgMCAwIDAgMFwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDEwNi44OCwxODMuNjEpXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKC02Ljg4MDUsLTEwMClcIiBzdHlsZT1cInN0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIj48cGF0aCBkPVwiTSAwLDAgQyA4LjE0NiwwIDE0Ljc2OSwtNi42MjUgMTQuNzY5LC0xNC43NyAxNC43NjksLTIyLjkwNyA4LjE0NiwtMjkuNTMzIDAsLTI5LjUzMyAtOC4xMzYsLTI5LjUzMyAtMTQuNzY5LC0yMi45MDcgLTE0Ljc2OSwtMTQuNzcgLTE0Ljc2OSwtNi42MjUgLTguMTM2LDAgMCwwIE0gMCwtNTAuNDI5IEMgMTkuNjc2LC01MC40MjkgMzUuNjcsLTM0LjQzNSAzNS42NywtMTQuNzcgMzUuNjcsNC45MDMgMTkuNjc2LDIwLjkwMyAwLDIwLjkwMyAtMTkuNjcxLDIwLjkwMyAtMzUuNjY5LDQuOTAzIC0zNS42NjksLTE0Ljc3IC0zNS42NjksLTM0LjQzNSAtMTkuNjcxLC01MC40MjkgMCwtNTAuNDI5XCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsNy41NTE2LC01NC41NzcpXCIgc3R5bGU9XCJzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCI+PHBhdGggZD1cIk0gMCwwIEMgNy4yNjIsMS42NTUgMTQuMjY0LDQuNTI2IDIwLjcxNCw4LjU3OCAyNS41OTUsMTEuNjU0IDI3LjA2NiwxOC4xMDggMjMuOTksMjIuOTg5IDIwLjkxNywyNy44ODEgMTQuNDY5LDI5LjM1MiA5LjU3OSwyNi4yNzUgLTUuMDMyLDE3LjA4NiAtMjMuODQzLDE3LjA5MiAtMzguNDQ2LDI2LjI3NSAtNDMuMzM2LDI5LjM1MiAtNDkuNzg0LDI3Ljg4MSAtNTIuODUyLDIyLjk4OSAtNTUuOTI4LDE4LjEwNCAtNTQuNDYxLDExLjY1NCAtNDkuNTgsOC41NzggLTQzLjEzMiw0LjUzMSAtMzYuMTI4LDEuNjU1IC0yOC44NjcsMCBMIC00OC44MDksLTE5Ljk0MSBDIC01Mi44ODYsLTI0LjAyMiAtNTIuODg2LC0zMC42MzkgLTQ4LjgwNSwtMzQuNzIgLTQ2Ljc2MiwtMzYuNzU4IC00NC4wOSwtMzcuNzc5IC00MS40MTgsLTM3Ljc3OSAtMzguNzQyLC0zNy43NzkgLTM2LjA2NSwtMzYuNzU4IC0zNC4wMjMsLTM0LjcyIEwgLTE0LjQzNiwtMTUuMTIzIDUuMTY5LC0zNC43MiBDIDkuMjQ2LC0zOC44MDEgMTUuODYyLC0zOC44MDEgMTkuOTQzLC0zNC43MiAyNC4wMjgsLTMwLjYzOSAyNC4wMjgsLTI0LjAxOSAxOS45NDMsLTE5Ljk0MSBMIDAsMCBaXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48L2c+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDE2OS43Niw1Ni43MjcpXCIgZD1cIk0wIDBDLTUuMS0yLjMtMTAuNi0zLjgtMTYuNC00LjUtMTAuNS0xLTYgNC42LTMuOSAxMS4zLTkuNCA4LTE1LjUgNS43LTIyIDQuNC0yNy4zIDkuOS0zNC43IDEzLjQtNDIuOSAxMy40LTU4LjcgMTMuNC03MS42IDAuNi03MS42LTE1LjItNzEuNi0xNy40LTcxLjMtMTkuNi03MC44LTIxLjctOTQuNi0yMC41LTExNS43LTkuMS0xMjkuOCA4LjItMTMyLjMgNC0xMzMuNy0xLTEzMy43LTYuMi0xMzMuNy0xNi4xLTEyOC42LTI0LjktMTIwLjktMzAtMTI1LjYtMjkuOS0xMzAuMS0yOC42LTEzMy45LTI2LjUtMTMzLjktMjYuNi0xMzMuOS0yNi43LTEzMy45LTI2LjgtMTMzLjktNDAuNy0xMjQtNTIuMy0xMTEtNTQuOS0xMTMuNC01NS41LTExNS45LTU1LjktMTE4LjUtNTUuOS0xMjAuMy01NS45LTEyMi4xLTU1LjctMTIzLjktNTUuNC0xMjAuMi02Ni43LTEwOS43LTc1LTk3LjEtNzUuMy0xMDYuOS04Mi45LTExOS4zLTg3LjUtMTMyLjctODcuNS0xMzUtODcuNS0xMzcuMy04Ny40LTEzOS41LTg3LjEtMTI2LjgtOTUuMi0xMTEuOC0xMDAtOTUuNi0xMDAtNDMtMTAwLTE0LjItNTYuMy0xNC4yLTE4LjUtMTQuMi0xNy4zLTE0LjItMTYtMTQuMy0xNC44LTguNy0xMC44LTMuOC01LjcgMCAwXCIvPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgxIDAgMCAtMSA3Mi4zODEgOTAuMTcyKVwiPjxwYXRoIGQ9XCJNODcuMiAwIDg3LjIgMTcuMSA3NSAxNy4xIDc1IDAgNTcuOSAwIDU3LjktMTIuMiA3NS0xMi4yIDc1LTI5LjMgODcuMi0yOS4zIDg3LjItMTIuMiAxMDQuMy0xMi4yIDEwNC4zIDAgODcuMiAwWlwiLz48cGF0aCBkPVwiTTAgMCAwLTE5LjYgMjYuMi0xOS42QzI1LjQtMjMuNyAyMy44LTI3LjUgMjAuOC0zMC42IDEwLjMtNDIuMS05LjMtNDItMjAuNS0zMC40LTMxLjctMTguOS0zMS42LTAuMy0yMC4yIDExLjEtOS40IDIxLjkgOCAyMi40IDE4LjYgMTIuMUwxOC41IDEyLjEgMzIuOCAyNi40QzEzLjcgNDMuOC0xNS44IDQzLjUtMzQuNSAyNS4xLTUzLjggNi4xLTU0LTI1LTM0LjktNDQuMy0xNS45LTYzLjUgMTcuMS02My43IDM0LjktNDQuNiA0NS42LTMzIDQ4LjctMTYuNCA0Ni4yIDBMMCAwWlwiLz48L2c+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDk3LjY3Niw2Mi40MTEpXCIgZD1cIk0wIDBDMTAuMiAwIDE5LjktNC41IDI2LjktMTEuNkwyNi45LTExLjZDMjYuOS04LjIgMjkuMi01LjcgMzIuNC01LjdMMzMuMi01LjdDMzguMi01LjcgMzkuMi0xMC40IDM5LjItMTEuOUwzOS4yLTY0LjhDMzguOS02OC4yIDQyLjgtNzAgNDUtNjcuOCA1My41LTU5LjEgNjMuNi0yMi45IDM5LjctMiAxNy40IDE3LjYtMTIuNSAxNC4zLTI4LjUgMy40LTQ1LjQtOC4zLTU2LjItMzQuMS00NS43LTU4LjQtMzQuMi04NC45LTEuNC05Mi44IDE4LjEtODQuOSAyOC04MC45IDMyLjUtOTQuMyAyMi4zLTk4LjYgNi44LTEwNS4yLTM2LjQtMTA0LjUtNTYuNS02OS42LTcwLjEtNDYuMS02OS40LTQuNi0zMy4zIDE2LjktNS43IDMzLjMgMzAuNyAyOC44IDUyLjcgNS44IDc1LjYtMTguMiA3NC4zLTYzIDUxLjktODAuNSA0MS44LTg4LjQgMjYuNy04MC43IDI2LjgtNjkuMkwyNi43LTY1LjRDMTkuNi03Mi40IDEwLjItNzYuNSAwLTc2LjUtMjAuMi03Ni41LTM4LTU4LjctMzgtMzguNC0zOC0xOC0yMC4yIDAgMCAwTTI1LjUtMzdDMjQuNy0yMi4yIDEzLjctMTMuMyAwLjQtMTMuM0wtMC4xLTEzLjNDLTE1LjQtMTMuMy0yMy45LTI1LjMtMjMuOS0zOS0yMy45LTU0LjMtMTMuNi02NC0wLjEtNjQgMTQuOS02NCAyNC44LTUzIDI1LjUtNDBMMjUuNS0zN1pcIi8+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwibWF0cml4KDAuNDI2MjMgMCAwIDAuNDI2MjMgMzQuOTk5IDM1KVwiPjxwYXRoIGQ9XCJNMTYwLjcgMTkuNWMtMTguOSAwLTM3LjMgMy43LTU0LjcgMTAuOUw3Ni40IDAuN2MtMC44LTAuOC0yLjEtMS0zLjEtMC40QzQ0LjQgMTguMiAxOS44IDQyLjkgMS45IDcxLjdjLTAuNiAxLTAuNSAyLjMgMC40IDMuMWwyOC40IDI4LjRjLTguNSAxOC42LTEyLjggMzguNS0xMi44IDU5LjEgMCA3OC43IDY0IDE0Mi44IDE0Mi44IDE0Mi44IDc4LjcgMCAxNDIuOC02NCAxNDIuOC0xNDIuOEMzMDMuNCA4My41IDIzOS40IDE5LjUgMTYwLjcgMTkuNXpNMjE3LjIgMTQ4LjdsOS45IDQyLjEgOS41IDQ0LjQgLTQ0LjMtOS41IC00Mi4xLTkuOUwzNi43IDEwMi4xYzE0LjMtMjkuMyAzOC4zLTUyLjYgNjguMS02NS44TDIxNy4yIDE0OC43elwiLz48cGF0aCBkPVwiTTIyMS44IDE4Ny40bC03LjUtMzNjLTI1LjkgMTEuOS00Ni40IDMyLjQtNTguMyA1OC4zbDMzIDcuNUMxOTYgMjA2LjIgMjA3LjcgMTk0LjQgMjIxLjggMTg3LjR6XCIvPjwvZz48L3N2Zz4nLFxuICAgICAgJycsLy9waW5cbiAgICAgICcnLC8vZmF2XG4gICAgICAnJywvL3ByaW50XG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw3MS4yNjQsMTA2LjkzKVwiIGQ9XCJNMCAwIDY4LjYgNDMuMUM3MiA0NS4zIDczLjEgNDIuOCA3MS42IDQxLjFMMTQuNi0xMC4yIDExLjctMzUuOCAwIDBaTTg3LjEgNjIuOS0zMy40IDE3LjJDLTQwIDE1LjMtMzkuOCA4LjgtMzQuOSA3LjNMLTQuNy0yLjIgNi44LTM3LjZDOC4yLTQxLjUgOS40LTQyLjkgMTEuOC00MyAxNC4zLTQzIDE1LjMtNDIuMSAxNy45LTM5LjggMjAuOS0zNi45IDI1LjYtMzIuMyAzMy0yNS4yTDY0LjQtNDguNEM3MC4yLTUxLjYgNzQuMy00OS45IDc1LjgtNDNMOTUuNSA1NC40Qzk3LjYgNjIuOSA5Mi42IDY1LjQgODcuMSA2Mi45XCIvPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMzUuMzMsMTE5Ljg1KVwiIGQ9XCJNMCAwQy0yLjQtNS40LTYuNS05LTEyLjItMTAuNi0xNC4zLTExLjItMTYuMy0xMC43LTE4LjItOS45LTQ0LjQgMS4yLTYzLjMgMTkuNi03NCA0Ni4yLTc0LjggNDguMS03NS4zIDUwLjEtNzUuMiA1MS45LTc1LjIgNTguNy02OS4yIDY1LTYyLjYgNjUuNC02MC44IDY1LjUtNTkuMiA2NC45LTU3LjkgNjMuNy01My4zIDU5LjMtNDkuNiA1NC4zLTQ2LjkgNDguNi00NS40IDQ1LjUtNDYgNDMuMy00OC43IDQxLjEtNDkuMSA0MC43LTQ5LjUgNDAuNC01MCA0MC4xLTUzLjUgMzcuNS01NC4zIDM0LjktNTIuNiAzMC44LTQ5LjggMjQuMi00NS40IDE5LTM5LjMgMTUuMS0zNyAxMy42LTM0LjcgMTIuMi0zMiAxMS41LTI5LjYgMTAuOC0yNy43IDExLjUtMjYuMSAxMy40LTI1LjkgMTMuNi0yNS44IDEzLjktMjUuNiAxNC4xLTIyLjMgMTguOC0xOC42IDE5LjYtMTMuNyAxNi41LTkuNiAxMy45LTUuNiAxMS0xLjggNy44IDAuNyA1LjYgMS4zIDMgMCAwTS0xOC4yIDM2LjdDLTE4LjMgMzUuOS0xOC4zIDM1LjQtMTguNCAzNC45LTE4LjYgMzQtMTkuMiAzMy40LTIwLjIgMzMuNC0yMS4zIDMzLjQtMjEuOSAzNC0yMi4yIDM0LjktMjIuMyAzNS41LTIyLjQgMzYuMi0yMi41IDM2LjktMjMuMiA0MC4zLTI1LjIgNDIuNi0yOC42IDQzLjYtMjkuMSA0My43LTI5LjUgNDMuNy0yOS45IDQzLjgtMzEgNDQuMS0zMi40IDQ0LjItMzIuNCA0NS44LTMyLjUgNDcuMS0zMS41IDQ3LjktMjkuNiA0OC0yOC40IDQ4LjEtMjYuNSA0Ny41LTI1LjQgNDYuOS0yMC45IDQ0LjctMTguNyA0MS42LTE4LjIgMzYuN00tMjUuNSA1MS4yQy0yOCA1Mi4xLTMwLjUgNTIuOC0zMy4yIDUzLjItMzQuNSA1My40LTM1LjQgNTQuMS0zNS4xIDU1LjYtMzQuOSA1Ny0zNCA1Ny41LTMyLjYgNTcuNC0yNCA1Ni42LTE3LjMgNTMuNC0xMi42IDQ2LTEwLjUgNDIuNS05LjIgMzcuNS05LjQgMzMuOC05LjUgMzEuMi05LjkgMzAuNS0xMS40IDMwLjUtMTMuNiAzMC42LTEzLjMgMzIuNC0xMy41IDMzLjctMTMuNyAzNS43LTE0LjIgMzcuNy0xNC43IDM5LjctMTYuMyA0NS40LTE5LjkgNDkuMy0yNS41IDUxLjJNLTM4IDY0LjRDLTM3LjkgNjUuOS0zNyA2Ni41LTM1LjUgNjYuNC0yMy4yIDY1LjgtMTMuOSA2Mi4yLTYuNyA1Mi41LTIuNSA0Ni45LTAuMiAzOS4yIDAgMzIuMiAwIDMxLjEgMCAzMCAwIDI5LTAuMSAyNy44LTAuNiAyNi45LTEuOSAyNi45LTMuMiAyNi45LTMuOSAyNy42LTQgMjktNC4zIDM0LjItNS4zIDM5LjMtNy4zIDQ0LjEtMTEuMiA1My41LTE4LjYgNTguNi0yOC4xIDYxLjEtMzAuNyA2MS43LTMzLjIgNjIuMi0zNS44IDYyLjUtMzcgNjIuNS0zOCA2Mi44LTM4IDY0LjRNMTEuNSA3NC4xQzYuNiA3OC4zIDAuOSA4MC44LTUuMyA4Mi40LTIwLjggODYuNS0zNi41IDg3LjUtNTIuNCA4NS4zLTYwLjUgODQuMi02OC4zIDgyLjEtNzUuNCA3OC4xLTgzLjggNzMuNC04OS42IDY2LjYtOTIuMiA1Ny4xLTk0IDUwLjQtOTQuOSA0My42LTk1LjIgMzYuNi05NS43IDI2LjQtOTUuNCAxNi4zLTkyLjggNi4zLTg5LjgtNS4zLTgzLjItMTMuOC03MS45LTE4LjMtNzAuNy0xOC44LTY5LjUtMTkuNS02OC4zLTIwLTY3LjItMjAuNC02Ni44LTIxLjItNjYuOC0yMi40LTY2LjktMzAuNC02Ni44LTM4LjQtNjYuOC00Ni43LTYzLjktNDMuOS02MS44LTQxLjgtNjAuMy00MC4xLTU1LjktMzUuMS01MS43LTMwLjktNDcuMS0yNi4xLTQ0LjctMjMuNy00NS43LTIzLjgtNDIuMS0yMy44LTM3LjgtMjMuOS0zMS0yNC4xLTI2LjgtMjMuOC0xOC42LTIzLjEtMTAuNi0yMi4xLTIuNy0xOS43IDcuMi0xNi43IDE1LjItMTEuNCAxOS4yLTEuMyAyMC4zIDEuMyAyMS40IDQgMjIgNi44IDI1LjkgMjIuOSAyNS40IDM4LjkgMjIuMiA1NSAyMC42IDYyLjQgMTcuNSA2OSAxMS41IDc0LjFcIi8+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDEzMC44NCwxMTIuNylcIiBkPVwiTTAgMEMtMS42IDAuOS05LjQgNS4xLTEwLjggNS43LTEyLjMgNi4zLTEzLjQgNi42LTE0LjUgNS0xNS42IDMuNC0xOC45LTAuMS0xOS45LTEuMS0yMC44LTIuMi0yMS44LTIuMy0yMy40LTEuNC0yNS0wLjUtMzAuMSAxLjQtMzYuMSA3LjEtNDAuNyAxMS41LTQzLjcgMTctNDQuNiAxOC42LTQ1LjUgMjAuMy00NC42IDIxLjEtNDMuOCAyMS45LTQzIDIyLjYtNDIuMSAyMy43LTQxLjMgMjQuNi00MC40IDI1LjUtNDAuMSAyNi4yLTM5LjUgMjcuMi0zOSAyOC4zLTM5LjIgMjkuMy0zOS42IDMwLjEtMzkuOSAzMC45LTQyLjkgMzktNDQuMSA0Mi4zLTQ1LjMgNDUuNS00Ni43IDQ1LTQ3LjYgNDUuMS00OC42IDQ1LjEtNDkuNiA0NS4zLTUwLjcgNDUuMy01MS44IDQ1LjQtNTMuNiA0NS01NS4xIDQzLjUtNTYuNiA0MS45LTYxIDM4LjItNjEuMyAzMC4yLTYxLjYgMjIuMy01Ni4xIDE0LjQtNTUuMyAxMy4zLTU0LjUgMTIuMi00NC44LTUuMS0yOC42LTEyLjEtMTIuNC0xOS4yLTEyLjQtMTcuMS05LjQtMTYuOS02LjQtMTYuOCAwLjMtMTMuNCAxLjgtOS42IDMuMy01LjkgMy40LTIuNyAzLTIgMi42LTEuMyAxLjYtMC45IDAgME0tMjkuNy0zOC4zQy00MC40LTM4LjMtNTAuMy0zNS4xLTU4LjYtMjkuNkwtNzguOS0zNi4xLTcyLjMtMTYuNUMtNzguNi03LjgtODIuMyAyLjgtODIuMyAxNC40LTgyLjMgNDMuNC01OC43IDY3LjEtMjkuNyA2Ny4xLTAuNiA2Ny4xIDIzIDQzLjQgMjMgMTQuNCAyMy0xNC43LTAuNi0zOC4zLTI5LjctMzguM00tMjkuNyA3Ny42Qy02NC42IDc3LjYtOTIuOSA0OS4zLTkyLjkgMTQuNC05Mi45IDIuNC04OS42LTguOC04My45LTE4LjNMLTk1LjMtNTIuMi02MC4yLTQxQy01MS4yLTQ2LTQwLjgtNDguOS0yOS43LTQ4LjkgNS4zLTQ4LjkgMzMuNi0yMC42IDMzLjYgMTQuNCAzMy42IDQ5LjMgNS4zIDc3LjYtMjkuNyA3Ny42XCIvPjwvc3ZnPicsXG4gICAgXTtcbiAgICB2YXIgaWNvbj1zdmdbal07XG4gICAgdmFyIGNzcz0nIHN0eWxlPVwid2lkdGg6JytzaXplKydweDtoZWlnaHQ6JytzaXplKydweFwiICc7XG4gICAgaWNvbj0nPHN2ZyBjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2Qtc3ZnXCInK2NzcytpY29uLnN1YnN0cmluZyg0KTtcbiAgICBpY29uPSc+JytpY29uLnN1YnN0cmluZygwLCBpY29uLmxlbmd0aCAtIDEpO1xuICB9ZWxzZXtcbiAgICBpY29uPSdzdHlsZT1cImRpc3BsYXk6aW5saW5lLWJsb2NrO3ZlcnRpY2FsLWFsaWduOmJvdHRvbTt3aWR0aDonK3NpemUrJ3B4O2hlaWdodDonK3NpemUrJ3B4O21hcmdpbjowIDZweCA2cHggMDtwYWRkaW5nOjA7b3V0bGluZTpub25lO2JhY2tncm91bmQ6dXJsKCcgKyBmICsgZm4gKyAnKSAtJyArIHNpemUgKiBqICsgJ3B4IDAgbm8tcmVwZWF0OyBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1wiJ1xuICB9XG4gIHJldHVybiBpY29uO1xufVxuXG5mdW5jdGlvbiBmYXYoYSkge1xuICB2YXIgdGl0bGUgPSBkb2N1bWVudC50aXRsZTtcbiAgdmFyIHVybCA9IGRvY3VtZW50LmxvY2F0aW9uO1xuICB0cnkge1xuICAgIHdpbmRvdy5leHRlcm5hbC5BZGRGYXZvcml0ZSh1cmwsIHRpdGxlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRyeSB7XG4gICAgICB3aW5kb3cuc2lkZWJhci5hZGRQYW5lbCh0aXRsZSwgdXJsLCAnJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKHR5cGVvZiAob3BlcmEpID09ICdvYmplY3QnIHx8IHdpbmRvdy5zaWRlYmFyKSB7XG4gICAgICAgIGEucmVsID0gJ3NpZGViYXInO1xuICAgICAgICBhLnRpdGxlID0gdGl0bGU7XG4gICAgICAgIGEudXJsID0gdXJsO1xuICAgICAgICBhLmhyZWYgPSB1cmw7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoJ9Cd0LDQttC80LjRgtC1IEN0cmwtRCwg0YfRgtC+0LHRiyDQtNC+0LHQsNCy0LjRgtGMINGB0YLRgNCw0L3QuNGG0YMg0LIg0LfQsNC60LvQsNC00LrQuCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHNlbmRfcHJvbW8ocHJvbW8pe1xuICAkLmFqYXgoe1xuICAgIG1ldGhvZDogXCJwb3N0XCIsXG4gICAgdXJsOiBcImFjY291bnQvcHJvbW9cIixcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIGRhdGE6IHtwcm9tbzogcHJvbW99LFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGlmIChkYXRhLnRpdGxlICE9IG51bGwgJiYgZGF0YS5tZXNzYWdlICE9IG51bGwpIHtcbiAgICAgICAgb25fcHJvbW89JCgnLm9uX3Byb21vJyk7XG4gICAgICAgIGlmKG9uX3Byb21vLmxlbmd0aD09MCB8fCAhb25fcHJvbW8uaXMoJzp2aXNpYmxlJykpIHtcbiAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxuICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBvbl9wcm9tby5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuIiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBjb250ZWluZXI7XG4gIHZhciBtb3VzZU92ZXIgPSAwO1xuICB2YXIgdGltZXJDbGVhckFsbCA9IG51bGw7XG4gIHZhciBhbmltYXRpb25FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCc7XG4gIHZhciB0aW1lID0gMTAwMDA7XG5cbiAgdmFyIG5vdGlmaWNhdGlvbl9ib3ggPSBmYWxzZTtcbiAgdmFyIGlzX2luaXQgPSBmYWxzZTtcbiAgdmFyIGNvbmZpcm1fb3B0ID0ge1xuICAgIHRpdGxlOiBcItCj0LTQsNC70LXQvdC40LVcIixcbiAgICBxdWVzdGlvbjogXCLQktGLINC00LXQudGB0YLQstC40YLQtdC70YzQvdC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjD9cIixcbiAgICBidXR0b25ZZXM6IFwi0JTQsFwiLFxuICAgIGJ1dHRvbk5vOiBcItCd0LXRglwiLFxuICAgIGNhbGxiYWNrWWVzOiBmYWxzZSxcbiAgICBjYWxsYmFja05vOiBmYWxzZSxcbiAgICBvYmo6IGZhbHNlLFxuICAgIGJ1dHRvblRhZzogJ2RpdicsXG4gICAgYnV0dG9uWWVzRG9wOiAnJyxcbiAgICBidXR0b25Ob0RvcDogJycsXG4gIH07XG4gIHZhciBhbGVydF9vcHQgPSB7XG4gICAgdGl0bGU6IFwiXCIsXG4gICAgcXVlc3Rpb246IFwi0KHQvtC+0LHRidC10L3QuNC1XCIsXG4gICAgYnV0dG9uWWVzOiBcItCU0LBcIixcbiAgICBjYWxsYmFja1llczogZmFsc2UsXG4gICAgYnV0dG9uVGFnOiAnZGl2JyxcbiAgICBvYmo6IGZhbHNlLFxuICB9O1xuXG4gIGZ1bmN0aW9uIHRlc3RJcGhvbmUoKSB7XG4gICAgaWYgKCEvKGlQaG9uZXxpUGFkfGlQb2QpLiooT1MgMTEpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSByZXR1cm5cbiAgICBub3RpZmljYXRpb25fYm94LmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcbiAgICBub3RpZmljYXRpb25fYm94LmNzcygndG9wJywgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBpc19pbml0ID0gdHJ1ZTtcbiAgICBub3RpZmljYXRpb25fYm94ID0gJCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcbiAgICBpZiAobm90aWZpY2F0aW9uX2JveC5sZW5ndGggPiAwKXJldHVybjtcblxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XG4gICAgbm90aWZpY2F0aW9uX2JveCA9ICQoJy5ub3RpZmljYXRpb25fYm94Jyk7XG5cbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2NvbnRyb2wnLCBjbG9zZU1vZGFsKTtcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2Nsb3NlJywgY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCBjbG9zZU1vZGFsRm9uKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XG4gICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xuICAgICQoJy5ub3RpZmljYXRpb25fYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoJycpXG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgIGlmICh0YXJnZXQuY2xhc3NOYW1lID09IFwibm90aWZpY2F0aW9uX2JveFwiKSB7XG4gICAgICBjbG9zZU1vZGFsKCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5ub3RpZmljYXRpb25fY2xvc2UnLCBfY2xvc2VQb3B1cCk7XG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcbiAgfTtcblxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodGltZXJDbGVhckFsbCAhPSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJDbGVhckFsbCk7XG4gICAgICB0aW1lckNsZWFyQWxsID0gbnVsbDtcbiAgICB9XG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgIHZhciBvcHRpb24gPSAkKHRoaXMpLmRhdGEoJ29wdGlvbicpO1xuICAgICAgaWYgKG9wdGlvbi50aW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAxO1xuICB9O1xuXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgdmFyIG9wdGlvbiA9ICR0aGlzLmRhdGEoJ29wdGlvbicpO1xuICAgICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xuICAgICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQob3B0aW9uLmNsb3NlKSwgb3B0aW9uLnRpbWUgLSAxNTAwICsgMTAwICogaSk7XG4gICAgICAgICR0aGlzLmRhdGEoJ29wdGlvbicsIG9wdGlvbilcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAwO1xuICB9O1xuXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAkdGhpcy5vbihhbmltYXRpb25FbmQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgfSk7XG4gICAgJHRoaXMuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9oaWRlJylcbiAgfTtcblxuICBmdW5jdGlvbiBhbGVydChkYXRhKSB7XG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcbiAgICBkYXRhID0gb2JqZWN0cyhhbGVydF9vcHQsIGRhdGEpO1xuXG4gICAgaWYgKCFpc19pbml0KWluaXQoKTtcbiAgICB0ZXN0SXBob25lKCk7XG5cbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XG5cbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCArPSBkYXRhLnRpdGxlO1xuICAgIGJveF9odG1sICs9ICc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XG4gICAgYm94X2h0bWwgKz0gZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcblxuICAgIGlmIChkYXRhLmJ1dHRvblllcyB8fCBkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiICcgKyBkYXRhLmJ1dHRvblllc0RvcCArICc+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnICsgZGF0YS5idXR0b25UYWcgKyAnIGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiICcgKyBkYXRhLmJ1dHRvbk5vRG9wICsgJz4nICsgZGF0YS5idXR0b25ObyArICc8LycgKyBkYXRhLmJ1dHRvblRhZyArICc+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cbiAgICA7XG5cbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LCAxMDApXG4gIH1cblxuICBmdW5jdGlvbiBjb25maXJtKGRhdGEpIHtcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xuICAgIGRhdGEgPSBvYmplY3RzKGNvbmZpcm1fb3B0LCBkYXRhKTtcblxuICAgIGlmICghaXNfaW5pdClpbml0KCk7XG4gICAgdGVzdElwaG9uZSgpO1xuICAgIC8vYm94X2h0bWw9JzxkaXYgY2xhc3M9XCJub3RpZnlfYm94XCI+JztcblxuICAgIG5vdHlmeV9jbGFzcyA9ICdub3RpZnlfYm94ICc7XG4gICAgaWYgKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcyArPSBkYXRhLm5vdHlmeV9jbGFzcztcblxuICAgIGJveF9odG1sID0gJzxkaXYgY2xhc3M9XCInICsgbm90eWZ5X2NsYXNzICsgJ1wiPic7XG5cbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwgKz0gZGF0YS50aXRsZTtcbiAgICBib3hfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcblxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xuICAgIGJveF9odG1sICs9IGRhdGEucXVlc3Rpb247XG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBpZiAoZGF0YS5idXR0b25ZZXMgfHwgZGF0YS5idXR0b25Obykge1xuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cblxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XG5cbiAgICBpZiAoZGF0YS5jYWxsYmFja1llcyAhPSBmYWxzZSkge1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrWWVzLmJpbmQoZGF0YS5vYmopKTtcbiAgICB9XG4gICAgaWYgKGRhdGEuY2FsbGJhY2tObyAhPSBmYWxzZSkge1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsIGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgfSwgMTAwKVxuXG4gIH1cblxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xuICAgIGlmICghZGF0YSlkYXRhID0ge307XG4gICAgdmFyIG9wdGlvbiA9IHt0aW1lOiAoZGF0YS50aW1lIHx8IGRhdGEudGltZSA9PT0gMCkgPyBkYXRhLnRpbWUgOiB0aW1lfTtcbiAgICBpZiAoIWNvbnRlaW5lcikge1xuICAgICAgY29udGVpbmVyID0gJCgnPHVsLz4nLCB7XG4gICAgICAgICdjbGFzcyc6ICdub3RpZmljYXRpb25fY29udGFpbmVyJ1xuICAgICAgfSk7XG5cbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoY29udGVpbmVyKTtcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xuICAgIH1cblxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25faXRlbSdcbiAgICB9KTtcblxuICAgIGlmIChkYXRhLnR5cGUpIHtcbiAgICAgIGxpLmFkZENsYXNzKCdub3RpZmljYXRpb25faXRlbS0nICsgZGF0YS50eXBlKTtcbiAgICB9XG5cbiAgICB2YXIgY2xvc2UgPSAkKCc8c3Bhbi8+Jywge1xuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25fY2xvc2UnXG4gICAgfSk7XG4gICAgb3B0aW9uLmNsb3NlID0gY2xvc2U7XG4gICAgbGkuYXBwZW5kKGNsb3NlKTtcblxuICAgIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jywge1xuICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxuICAgIH0pO1xuXG4gICAgaWYgKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgdGl0bGUgPSAkKCc8aDUvPicsIHtcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcbiAgICAgIH0pO1xuICAgICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlKTtcbiAgICB9XG5cbiAgICB2YXIgdGV4dCA9ICQoJzxkaXYvPicsIHtcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90ZXh0XCJcbiAgICB9KTtcbiAgICB0ZXh0Lmh0bWwoZGF0YS5tZXNzYWdlKTtcblxuICAgIGlmIChkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcbiAgICAgIH0pO1xuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcbiAgICAgIHZhciB3cmFwID0gJCgnPGRpdi8+Jywge1xuICAgICAgICBjbGFzczogXCJ3cmFwXCJcbiAgICAgIH0pO1xuXG4gICAgICB3cmFwLmFwcGVuZChpbWcpO1xuICAgICAgd3JhcC5hcHBlbmQodGV4dCk7XG4gICAgICBjb250ZW50LmFwcGVuZCh3cmFwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudC5hcHBlbmQodGV4dCk7XG4gICAgfVxuICAgIGxpLmFwcGVuZChjb250ZW50KTtcblxuICAgIC8vXG4gICAgLy8gaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XG4gICAgLy8gICB2YXIgdGl0bGUgPSAkKCc8cC8+Jywge1xuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxuICAgIC8vICAgfSk7XG4gICAgLy8gICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xuICAgIC8vICAgbGkuYXBwZW5kKHRpdGxlKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xuICAgIC8vICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXG4gICAgLy8gICB9KTtcbiAgICAvLyAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xuICAgIC8vICAgbGkuYXBwZW5kKGltZyk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcbiAgICAvLyAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxuICAgIC8vIH0pO1xuICAgIC8vIGNvbnRlbnQuaHRtbChkYXRhLm1lc3NhZ2UpO1xuICAgIC8vXG4gICAgLy8gbGkuYXBwZW5kKGNvbnRlbnQpO1xuICAgIC8vXG4gICAgY29udGVpbmVyLmFwcGVuZChsaSk7XG5cbiAgICBpZiAob3B0aW9uLnRpbWUgPiAwKSB7XG4gICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQoY2xvc2UpLCBvcHRpb24udGltZSk7XG4gICAgfVxuICAgIGxpLmRhdGEoJ29wdGlvbicsIG9wdGlvbilcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYWxlcnQ6IGFsZXJ0LFxuICAgIGNvbmZpcm06IGNvbmZpcm0sXG4gICAgbm90aWZpOiBub3RpZmksXG4gIH07XG5cbn0pKCk7XG5cblxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGEgPSBlbC5kYXRhKCk7XG5cbiAgZGF0YS5xdWVzdGlvbiA9IGVsLmh0bWwoKTtcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xufSk7XG5cblxuJCgnLmRpc2FibGVkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkdGhpcyA9ICQodGhpcyk7XG4gIGRhdGEgPSAkdGhpcy5kYXRhKCk7XG4gIGlmIChkYXRhWydidXR0b25feWVzJ10pZGF0YVsnYnV0dG9uWWVzJ10gPSBkYXRhWydidXR0b25feWVzJ11cblxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tb2RhbHNfb3BlbicsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG5cbiAgICAvL9C/0YDQuCDQvtGC0LrRgNGL0YLQuNC4INGE0L7RgNC80Ysg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuCDQt9Cw0LrRgNGL0YLRjCwg0LXRgdC70Lgg0L7RgtGA0YvRgtC+IC0g0L/QvtC/0LDQvyDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjyDQutGD0L/QvtC90LAg0LHQtdC3INGA0LXQs9C40YHRgtGA0LDRhtC40LhcbiAgICB2YXIgcG9wdXAgPSAkKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikuZGF0YSgncG9wdXAnKTtcbiAgICBpZiAocG9wdXApIHtcbiAgICAgIHBvcHVwLmNsb3NlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvcHVwID0gJCgnZGl2LnBvcHVwX2NvbnQsIGRpdi5wb3B1cF9iYWNrJyk7XG4gICAgICBpZiAocG9wdXApIHtcbiAgICAgICAgcG9wdXAuaGlkZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBocmVmID0gdGhpcy5ocmVmLnNwbGl0KCcjJyk7XG4gICAgaHJlZiA9IGhyZWZbaHJlZi5sZW5ndGggLSAxXTtcbiAgICB2YXIgbm90eUNsYXNzID0gJCh0aGlzKS5kYXRhKCdub3R5Y2xhc3MnKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGJ1dHRvblllczogZmFsc2UsXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibG9hZGluZyBcIiArIChocmVmLmluZGV4T2YoJ3ZpZGVvJykgPT09IDAgPyAnbW9kYWxzLWZ1bGxfc2NyZWVuJyA6ICdub3RpZnlfd2hpdGUnKSArICcgJyArIG5vdHlDbGFzcyxcbiAgICAgIHF1ZXN0aW9uOiAnJ1xuICAgIH07XG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuXG4gICAgJC5nZXQoJy8nICsgaHJlZiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcbiAgICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcbiAgICB9LCAnanNvbicpO1xuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pXG59KCkpO1xuIiwiJCgnLmZvb3Rlci1tZW51LXRpdGxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgJHRoaXMgPSAkKHRoaXMpO1xuICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKSkge1xuICAgICR0aGlzLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJylcbiAgfSBlbHNlIHtcbiAgICAkKCcuZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XG4gICAgJHRoaXMuYWRkQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKTtcbiAgfVxuXG59KTtcbiIsIiQoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBzdGFyTm9taW5hdGlvbihpbmRleCkge1xuICAgIHZhciBzdGFycyA9ICQoXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIpO1xuICAgIHN0YXJzLmFkZENsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcbiAgICAgIHN0YXJzLmVxKGkpLnJlbW92ZUNsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcbiAgICB9XG4gIH1cblxuICAkKGRvY3VtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcbiAgfSkub24oXCJtb3VzZWxlYXZlXCIsIFwiLnJhdGluZy13cmFwcGVyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoKSk7XG4gIH0pLm9uKFwiY2xpY2tcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XG5cbiAgICAkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgkKHRoaXMpLmluZGV4KCkgKyAxKTtcbiAgfSk7XG59KTtcbiIsIi8v0LjQt9Cx0YDQsNC90L3QvtC1XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICQoXCIuZmF2b3JpdGUtbGlua1wiKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBzZWxmID0gJCh0aGlzKTtcbiAgICB2YXIgdHlwZSA9IHNlbGYuYXR0cihcImRhdGEtc3RhdGVcIiksXG4gICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmF0dHIoXCJkYXRhLWFmZmlsaWF0ZS1pZFwiKTtcblxuICAgIGlmICghYWZmaWxpYXRlX2lkKSB7XG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgdGl0bGU6IFwi0J3QtdC+0LHRhdC+0LTQuNC80L4g0LDQstGC0L7RgNC40LfQvtCy0LDRgtGM0YHRj1wiLFxuICAgICAgICBtZXNzYWdlOiAn0JTQvtCx0LDQstC40YLRjCDQsiDQuNC30LHRgNCw0L3QvdC+0LUg0LzQvtC20LXRgiDRgtC+0LvRjNC60L4g0LDQstGC0L7RgNC40LfQvtCy0LDQvdC90YvQuSDQv9C+0LvRjNC30L7QstCw0YLQtdC70YwuPC9icj4nICtcbiAgICAgICAgJzxhIGhyZWY9XCIjbG9naW5cIiBjbGFzcz1cIm1vZGFsc19vcGVuXCI+0JLRhdC+0LQ8L2E+ICAvIDxhIGhyZWY9XCIjcmVnaXN0cmF0aW9uXCIgY2xhc3M9XCJtb2RhbHNfb3BlblwiPtCg0LXQs9C40YHRgtGA0LDRhtC40Y88L2E+JyxcbiAgICAgICAgdHlwZTogJ2VycidcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgfVxuXG4gICAgaWYgKHNlbGYuaGFzQ2xhc3MoJ2Rpc2FibGVkJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBzZWxmLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXG4gICAgLyppZih0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgc2VsZi5maW5kKFwiLml0ZW1faWNvblwiKS5yZW1vdmVDbGFzcyhcIm11dGVkXCIpO1xuICAgICB9Ki9cblxuICAgICQucG9zdChcIi9hY2NvdW50L2Zhdm9yaXRlc1wiLCB7XG4gICAgICBcInR5cGVcIjogdHlwZSxcbiAgICAgIFwiYWZmaWxpYXRlX2lkXCI6IGFmZmlsaWF0ZV9pZFxuICAgIH0sIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgaWYgKGRhdGEuZXJyb3IpIHtcbiAgICAgICAgc2VsZi5maW5kKCdzdmcnKS5yZW1vdmVDbGFzcyhcInNwaW5cIik7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6IGRhdGEuZXJyb3IsIHR5cGU6ICdlcnInLCAndGl0bGUnOiAoZGF0YS50aXRsZSA/IGRhdGEudGl0bGUgOiBmYWxzZSl9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgbWVzc2FnZTogZGF0YS5tc2csXG4gICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgJ3RpdGxlJzogKGRhdGEudGl0bGUgPyBkYXRhLnRpdGxlIDogZmFsc2UpXG4gICAgICB9KTtcblxuICAgICAgaWYgKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgICBzZWxmLmZpbmQoXCIuaXRlbV9pY29uXCIpLmFkZENsYXNzKFwic3ZnLW5vLWZpbGxcIik7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuYXR0cih7XG4gICAgICAgIFwiZGF0YS1zdGF0ZVwiOiBkYXRhW1wiZGF0YS1zdGF0ZVwiXSxcbiAgICAgICAgXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCI6IGRhdGFbJ2RhdGEtb3JpZ2luYWwtdGl0bGUnXVxuICAgICAgfSk7XG5cbiAgICAgIGlmICh0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBzdmctbm8tZmlsbFwiKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRlbGV0ZVwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW5cIikuYWRkQ2xhc3MoXCJzdmctbm8tZmlsbFwiKTtcbiAgICAgIH1cblxuICAgIH0sICdqc29uJykuZmFpbChmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgIG1lc3NhZ2U6IFwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgK1xuICAgICAgICBcIiDQv9GA0L7QuNC30LLQtdC00ZHQvdC90L7QtSDQtNC10LnRgdGC0LLQuNC1INC90LXQstC+0LfQvNC+0LbQvdC+LiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1LlwiICtcbiAgICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIiwgdHlwZTogJ2VycidcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5hZGRDbGFzcyhcInN2Zy1uby1maWxsXCIpO1xuICAgICAgfVxuICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpblwiKTtcbiAgICB9KVxuICB9KTtcbn0pO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAkKCcuc2Nyb2xsX3RvJykuY2xpY2soZnVuY3Rpb24gKGUpIHsgLy8g0LvQvtCy0LjQvCDQutC70LjQuiDQv9C+INGB0YHRi9C70LrQtSDRgSDQutC70LDRgdGB0L7QvCBnb190b1xuICAgIHZhciBzY3JvbGxfZWwgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTsgLy8g0LLQvtC30YzQvNC10Lwg0YHQvtC00LXRgNC20LjQvNC+0LUg0LDRgtGA0LjQsdGD0YLQsCBocmVmLCDQtNC+0LvQttC10L0g0LHRi9GC0Ywg0YHQtdC70LXQutGC0L7RgNC+0LwsINGCLtC1LiDQvdCw0L/RgNC40LzQtdGAINC90LDRh9C40L3QsNGC0YzRgdGPINGBICMg0LjQu9C4IC5cbiAgICBzY3JvbGxfZWwgPSAkKHNjcm9sbF9lbCk7XG4gICAgaWYgKHNjcm9sbF9lbC5sZW5ndGggIT0gMCkgeyAvLyDQv9GA0L7QstC10YDQuNC8INGB0YPRidC10YHRgtCy0L7QstCw0L3QuNC1INGN0LvQtdC80LXQvdGC0LAg0YfRgtC+0LHRiyDQuNC30LHQtdC20LDRgtGMINC+0YjQuNCx0LrQuFxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogc2Nyb2xsX2VsLm9mZnNldCgpLnRvcCAtICQoJyNoZWFkZXI+KicpLmVxKDApLmhlaWdodCgpIC0gNTB9LCA1MDApOyAvLyDQsNC90LjQvNC40YDRg9C10Lwg0YHQutGA0L7QvtC70LjQvdCzINC6INGN0LvQtdC80LXQvdGC0YMgc2Nyb2xsX2VsXG4gICAgICBpZiAoc2Nyb2xsX2VsLmhhc0NsYXNzKCdhY2NvcmRpb24nKSAmJiAhc2Nyb2xsX2VsLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgc2Nyb2xsX2VsLmZpbmQoJy5hY2NvcmRpb24tY29udHJvbCcpLmNsaWNrKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTsgLy8g0LLRi9C60LvRjtGH0LDQtdC8INGB0YLQsNC90LTQsNGA0YLQvdC+0LUg0LTQtdC50YHRgtCy0LjQtVxuICB9KTtcbn0pO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAkKFwiYm9keVwiKS5vbignY2xpY2snLCAnLnNldF9jbGlwYm9hcmQnLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgIGNvcHlUb0NsaXBib2FyZCgkdGhpcy5kYXRhKCdjbGlwYm9hcmQnKSwgJHRoaXMuZGF0YSgnY2xpcGJvYXJkLW5vdGlmeScpKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gY29weVRvQ2xpcGJvYXJkKGNvZGUsIG1zZykge1xuICAgIHZhciAkdGVtcCA9ICQoXCI8aW5wdXQ+XCIpO1xuICAgICQoXCJib2R5XCIpLmFwcGVuZCgkdGVtcCk7XG4gICAgJHRlbXAudmFsKGNvZGUpLnNlbGVjdCgpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiY29weVwiKTtcbiAgICAkdGVtcC5yZW1vdmUoKTtcblxuICAgIGlmICghbXNnKSB7XG4gICAgICBtc2cgPSBcItCU0LDQvdC90YvQtSDRg9GB0L/QtdGI0L3QviDRgdC60L7Qv9C40YDQvtCy0LDQvdGLINCyINCx0YPRhNC10YAg0L7QsdC80LXQvdCwXCI7XG4gICAgfVxuICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoeyd0eXBlJzogJ2luZm8nLCAnbWVzc2FnZSc6IG1zZywgJ3RpdGxlJzogJ9Cj0YHQv9C10YjQvdC+J30pXG4gIH1cblxuICAkKFwiYm9keVwiKS5vbignY2xpY2snLCBcImlucHV0LmxpbmtcIiwgZnVuY3Rpb24gKCkge1x0Ly8g0L/QvtC70YPRh9C10L3QuNC1INGE0L7QutGD0YHQsCDRgtC10LrRgdGC0L7QstGL0Lwg0L/QvtC70LXQvC3RgdGB0YvQu9C60L7QuVxuICAgICQodGhpcykuc2VsZWN0KCk7XG4gIH0pO1xufSk7XG4iLCIvL9GB0LrQsNGH0LjQstCw0L3QuNC1INC60LDRgNGC0LjQvdC+0LpcbihmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgdmFyIGltZyA9IGRhdGEuaW1nO1xuICAgIGltZy53cmFwKCc8ZGl2IGNsYXNzPVwiZG93bmxvYWRcIj48L2Rpdj4nKTtcbiAgICB2YXIgd3JhcCA9IGltZy5wYXJlbnQoKTtcbiAgICAkKCcuZG93bmxvYWRfdGVzdCcpLmFwcGVuZChkYXRhLmVsKTtcbiAgICBzaXplID0gZGF0YS5lbC53aWR0aCgpICsgXCJ4XCIgKyBkYXRhLmVsLmhlaWdodCgpO1xuXG4gICAgdz1kYXRhLmVsLndpZHRoKCkqMC44O1xuICAgIGltZ1xuICAgICAgLmhlaWdodCgnYXV0bycpXG4gICAgICAvLy53aWR0aCh3KVxuICAgICAgLmNzcygnbWF4LXdpZHRoJywnOTklJyk7XG5cblxuICAgIGRhdGEuZWwucmVtb3ZlKCk7XG4gICAgd3JhcC5hcHBlbmQoJzxzcGFuPicgKyBzaXplICsgJzwvc3Bhbj4gPGEgaHJlZj1cIicgKyBkYXRhLnNyYyArICdcIiBkb3dubG9hZD7QodC60LDRh9Cw0YLRjDwvYT4nKTtcbiAgfVxuXG4gIHZhciBpbWdzID0gJCgnLmRvd25sb2Fkc19pbWcgaW1nJyk7XG4gIGlmKGltZ3MubGVuZ3RoPT0wKXJldHVybjtcblxuICAkKCdib2R5JykuYXBwZW5kKCc8ZGl2IGNsYXNzPWRvd25sb2FkX3Rlc3Q+PC9kaXY+Jyk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpbWcgPSBpbWdzLmVxKGkpO1xuICAgIHZhciBzcmMgPSBpbWcuYXR0cignc3JjJyk7XG4gICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XG4gICAgICBzcmM6IHNyY1xuICAgIH0pO1xuICAgIGRhdGEgPSB7XG4gICAgICBzcmM6IHNyYyxcbiAgICAgIGltZzogaW1nLFxuICAgICAgZWw6IGltYWdlXG4gICAgfTtcbiAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxuICB9XG59KSgpO1xuXG4vL9GH0YLQviDQsSDQuNGE0YDQtdC50LzRiyDQuCDQutCw0YDRgtC40L3QutC4INC90LUg0LLRi9C70LDQt9C40LvQuFxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgLyptX3cgPSAkKCcudGV4dC1jb250ZW50Jykud2lkdGgoKVxuICAgaWYgKG1fdyA8IDUwKW1fdyA9IHNjcmVlbi53aWR0aCAtIDQwKi9cbiAgdmFyIG13PXNjcmVlbi53aWR0aC00MDtcblxuICBmdW5jdGlvbiBvcHRpbWFzZShlbCl7XG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudCgpO1xuICAgIGlmKHBhcmVudC5sZW5ndGg9PTAgfHwgcGFyZW50WzBdLnRhZ05hbWU9PVwiQVwiKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYoZWwuaGFzQ2xhc3MoJ25vX29wdG9taXplJykpcmV0dXJuO1xuXG4gICAgbV93ID0gcGFyZW50LndpZHRoKCktMzA7XG4gICAgdmFyIHc9ZWwud2lkdGgoKTtcblxuICAgIC8v0LHQtdC3INGN0YLQvtCz0L4g0L/Qu9GO0YnQuNGCINCx0LDQvdC10YDRiyDQsiDQsNC60LDRgNC00LjQvtC90LVcbiAgICBpZih3PDMgfHwgbV93PDMpe1xuICAgICAgZWxcbiAgICAgICAgLmhlaWdodCgnYXV0bycpXG4gICAgICAgIC5jc3MoJ21heC13aWR0aCcsJzk5JScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGVsLndpZHRoKCdhdXRvJyk7XG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJTUdcIiAmJiB3PmVsLndpZHRoKCkpdz1lbC53aWR0aCgpO1xuXG4gICAgaWYgKG13PjUwICYmIG1fdyA+IG13KW1fdyA9IG13O1xuICAgIGlmICh3Pm1fdykge1xuICAgICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIil7XG4gICAgICAgIGsgPSB3IC8gbV93O1xuICAgICAgICBlbC5oZWlnaHQoZWwuaGVpZ2h0KCkgLyBrKTtcbiAgICAgIH1cbiAgICAgIGVsLndpZHRoKG1fdylcbiAgICB9ZWxzZXtcbiAgICAgIGVsLndpZHRoKHcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xuICAgIHZhciBlbD0kKHRoaXMpO1xuICAgIG9wdGltYXNlKGVsKTtcbiAgfVxuXG4gIHZhciBwID0gJCgnLmNvbnRlbnQtd3JhcCBpbWcsLmNvbnRlbnQtd3JhcCBpZnJhbWUnKTtcbiAgJCgnLmNvbnRlbnQtd3JhcCBpbWc6bm90KC5ub19vcHRvbWl6ZSknKS5oZWlnaHQoJ2F1dG8nKTtcbiAgLy8kKCcuY29udGFpbmVyIGltZycpLndpZHRoKCdhdXRvJyk7XG4gIGZvciAoaSA9IDA7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgZWwgPSBwLmVxKGkpO1xuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpIHtcbiAgICAgIG9wdGltYXNlKGVsKTtcbiAgICB9ZWxzZXtcbiAgICAgIHZhciBzcmM9ZWwuYXR0cignc3JjJyk7XG4gICAgICBpbWFnZSA9ICQoJzxpbWcvPicsIHtcbiAgICAgICAgc3JjOiBzcmNcbiAgICAgIH0pO1xuICAgICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChlbCkpO1xuICAgIH1cbiAgfVxufSk7XG5cblxuLy/Qn9GA0L7QstC10YDQutCwINCx0LjRgtGLINC60LDRgNGC0LjQvdC+0LouXG5cbi8vICEhISEhIVxuLy8g0J3Rg9C20L3QviDQv9GA0L7QstC10YDQuNGC0Yxcbi8vICEhISEhIVxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBpZihkYXRhLnRhZ05hbWUpe1xuICAgICAgZGF0YT0kKGRhdGEpLmRhdGEoJ2RhdGEnKTtcbiAgICB9XG4gICAgdmFyIGltZz1kYXRhLmltZztcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcbiAgICAgIGltZy5hdHRyKCdzcmMnLCBkYXRhLnNyYyk7XG4gICAgfWVsc2V7XG4gICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XG4gICAgICBpbWcucmVtb3ZlQ2xhc3MoJ25vX2F2YScpO1xuICAgIH1cbiAgfVxuXG4gIC8v0YLQtdGB0YIg0LvQvtCz0L4g0LzQsNCz0LDQt9C40L3QsFxuICB2YXIgaW1ncz0kKCdzZWN0aW9uOm5vdCgubmF2aWdhdGlvbiknKVxuICBpbWdzPWltZ3MuZmluZCgnLmxvZ28gaW1nJyk7XG4gIGlmKGltZ3MpXG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XG4gICAgdmFyIGltZz1pbWdzLmVxKGkpO1xuICAgIHZhciBzcmM9aW1nLmF0dHIoJ3NyYycpO1xuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XG4gICAgdmFyIGRhdGE9e1xuICAgICAgc3JjOnNyYyxcbiAgICAgIGltZzppbWcsXG4gICAgICB0eXBlOjAgLy8g0LTQu9GPIGltZ1tzcmNdXG4gICAgfTtcblxuICAgIHZhciBpbWFnZT0kKCc8aW1nLz4nLHtcbiAgICAgIHNyYzpzcmNcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpO1xuICAgIGltYWdlLmRhdGEoJ2RhdGEnLGRhdGEpO1xuICB9XG5cbiAgaW1ncz1udWxsO1xuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvLC5zY3JvbGxfYm94LWF2YXRhcicpO1xuICBpZihpbWdzKVxuICBmb3IgKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspe1xuICAgIHZhciBpbWc9aW1ncy5lcShpKTtcbiAgICBpZihpbWcuaGFzQ2xhc3MoJ25vX2F2YScpKXtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHZhciBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xuICAgIGlmKCFzcmMpY29udGludWU7XG4gICAgc3JjPXNyYy5yZXBsYWNlKCd1cmwoXCInLCcnKTtcbiAgICBzcmM9c3JjLnJlcGxhY2UoJ1wiKScsJycpO1xuICAgIGltZy5hZGRDbGFzcygnbm9fYXZhJyk7XG4gICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgvaW1hZ2VzL25vX2F2YV9zcXVhcmUucG5nKScpO1xuICAgIHZhciBkYXRhPXtcbiAgICAgIHNyYzpzcmMsXG4gICAgICBpbWc6aW1nLFxuICAgICAgdHlwZToxIC8vINC00LvRjyDRhNC+0L3QvtCy0YvRhSDQutCw0YDRgtC40L3QvtC6XG4gICAgfTtcbiAgICB2YXIgaW09ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgaW0uc3JjPXNyYztcbiAgICB2YXIgaW09JChpbSk7XG4gICAgaW0ub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKTtcbiAgfVxufSk7XG4iLCIvL9C10YHQu9C4INC+0YLQutGA0YvRgtC+INC60LDQuiDQtNC+0YfQtdGA0L3QtdC1XG4oZnVuY3Rpb24gKCkge1xuICBpZiAoIXdpbmRvdy5vcGVuZXIpcmV0dXJuO1xuXG4gIGhyZWYgPSB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY7XG4gIGlmIChcbiAgICBocmVmLmluZGV4T2YoJ2FjY291bnQvb2ZmbGluZScpID4gMFxuICApIHtcbiAgICB3aW5kb3cucHJpbnQoKVxuICB9XG5cbiAgaWYgKGRvY3VtZW50LnJlZmVycmVyLmluZGV4T2YoJ3NlY3JldGRpc2NvdW50ZXInKSA8IDApcmV0dXJuO1xuXG4gIGlmIChcbiAgICBocmVmLmluZGV4T2YoJ3NvY2lhbHMnKSA+IDAgfHxcbiAgICBocmVmLmluZGV4T2YoJ2xvZ2luJykgPiAwIHx8XG4gICAgaHJlZi5pbmRleE9mKCdhZG1pbicpID4gMCB8fFxuICAgIGhyZWYuaW5kZXhPZignYWNjb3VudCcpID4gMFxuICApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoaHJlZi5pbmRleE9mKCdzdG9yZScpID4gMCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpID4gMCB8fCBocmVmLmluZGV4T2YoJ3NldHRpbmdzJykgPiAwKSB7XG4gICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xuICB9XG4gIHdpbmRvdy5jbG9zZSgpO1xufSkoKTtcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgJCgnaW5wdXRbdHlwZT1maWxlXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgdmFyIGZpbGUgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcbiAgICB2YXIgZiA9IGZpbGVbMF07XG4gICAgLy8gT25seSBwcm9jZXNzIGltYWdlIGZpbGVzLlxuICAgIGlmICghZi50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgICBkYXRhID0ge1xuICAgICAgJ2VsJzogdGhpcyxcbiAgICAgICdmJzogZlxuICAgIH07XG4gICAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGltZyA9ICQoJ1tmb3I9XCInICsgZGF0YS5lbC5uYW1lICsgJ1wiXScpO1xuICAgICAgICBpZiAoaW1nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBpbWcuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKGRhdGEpO1xuICAgIC8vIFJlYWQgaW4gdGhlIGltYWdlIGZpbGUgYXMgYSBkYXRhIFVSTC5cbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmKTtcbiAgfSk7XG5cbiAgJCgnLmR1YmxpY2F0ZV92YWx1ZScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICB2YXIgc2VsID0gJCgkdGhpcy5kYXRhKCdzZWxlY3RvcicpKTtcbiAgICBzZWwudmFsKHRoaXMudmFsdWUpO1xuICB9KVxufSk7XG4iLCJcbmZ1bmN0aW9uIGdldENvb2tpZShuKSB7XG4gIHJldHVybiB1bmVzY2FwZSgoUmVnRXhwKG4gKyAnPShbXjtdKyknKS5leGVjKGRvY3VtZW50LmNvb2tpZSkgfHwgWzEsICcnXSlbMV0pO1xufVxuXG5mdW5jdGlvbiBzZXRDb29raWUobmFtZSwgdmFsdWUpIHtcbiAgdmFyIGNvb2tpZV9zdHJpbmcgPSBuYW1lICsgXCI9XCIgKyBlc2NhcGUgKCB2YWx1ZSApO1xuICBkb2N1bWVudC5jb29raWUgPSBjb29raWVfc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBlcmFzZUNvb2tpZShuYW1lKXtcbiAgdmFyIGNvb2tpZV9zdHJpbmcgPSBuYW1lICsgXCI9MFwiICtcIjsgZXhwaXJlcz1XZWQsIDAxIE9jdCAyMDE3IDAwOjAwOjAwIEdNVFwiO1xuICBkb2N1bWVudC5jb29raWUgPSBjb29raWVfc3RyaW5nO1xufVxuIiwiKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50KSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciB0YWJsZXMgPSAkKCd0YWJsZS5hZGFwdGl2ZScpO1xuXG4gIGlmICh0YWJsZXMubGVuZ3RoID09IDApcmV0dXJuO1xuXG4gIGZvciAodmFyIGkgPSAwOyB0YWJsZXMubGVuZ3RoID4gaTsgaSsrKSB7XG4gICAgdmFyIHRhYmxlID0gdGFibGVzLmVxKGkpO1xuICAgIHZhciB0aCA9IHRhYmxlLmZpbmQoJ3RoZWFkJyk7XG4gICAgaWYgKHRoLmxlbmd0aCA9PSAwKSB7XG4gICAgICB0aCA9IHRhYmxlLmZpbmQoJ3RyJykuZXEoMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoID0gdGguZmluZCgndHInKS5lcSgwKTtcbiAgICB9XG4gICAgdGggPSB0aC5hZGRDbGFzcygndGFibGUtaGVhZGVyJykuZmluZCgndGQsdGgnKTtcblxuICAgIHZhciB0ciA9IHRhYmxlLmZpbmQoJ3RyJykubm90KCcudGFibGUtaGVhZGVyJyk7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoLmxlbmd0aDsgaisrKSB7XG4gICAgICB2YXIgayA9IGogKyAxO1xuICAgICAgdmFyIHRkID0gdHIuZmluZCgndGQ6bnRoLWNoaWxkKCcgKyBrICsgJyknKTtcbiAgICAgIHRkLmF0dHIoJ2xhYmVsJywgdGguZXEoaikudGV4dCgpKTtcbiAgICB9XG4gIH1cblxufSkod2luZG93LCBkb2N1bWVudCk7XG4iLCI7XG4kKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBvblJlbW92ZSgpe1xuICAgICR0aGlzPSQodGhpcyk7XG4gICAgcG9zdD17XG4gICAgICBpZDokdGhpcy5hdHRyKCd1aWQnKSxcbiAgICAgIHR5cGU6JHRoaXMuYXR0cignbW9kZScpXG4gICAgfTtcbiAgICAkLnBvc3QoJHRoaXMuYXR0cigndXJsJykscG9zdCxmdW5jdGlvbihkYXRhKXtcbiAgICAgIGlmKGRhdGEgJiYgZGF0YT09J2Vycicpe1xuICAgICAgICBtc2c9JHRoaXMuZGF0YSgncmVtb3ZlLWVycm9yJyk7XG4gICAgICAgIGlmKCFtc2cpe1xuICAgICAgICAgIG1zZz0n0J3QtdCy0L7Qt9C80L7QttC90L4g0YPQtNCw0LvQuNGC0Ywg0Y3Qu9C10LzQtdC90YInO1xuICAgICAgICB9XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6bXNnLHR5cGU6J2Vycid9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBtb2RlPSR0aGlzLmF0dHIoJ21vZGUnKTtcbiAgICAgIGlmKCFtb2RlKXtcbiAgICAgICAgbW9kZT0ncm0nO1xuICAgICAgfVxuXG4gICAgICBpZihtb2RlPT0ncm0nKSB7XG4gICAgICAgIHJtID0gJHRoaXMuY2xvc2VzdCgnLnRvX3JlbW92ZScpO1xuICAgICAgICBybV9jbGFzcyA9IHJtLmF0dHIoJ3JtX2NsYXNzJyk7XG4gICAgICAgIGlmIChybV9jbGFzcykge1xuICAgICAgICAgICQocm1fY2xhc3MpLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcm0ucmVtb3ZlKCk7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cj0YHQv9C10YjQvdC+0LUg0YPQtNCw0LvQtdC90LjQtS4nLHR5cGU6J2luZm8nfSlcbiAgICAgIH1cbiAgICAgIGlmKG1vZGU9PSdyZWxvYWQnKXtcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgIGxvY2F0aW9uLmhyZWY9bG9jYXRpb24uaHJlZjtcbiAgICAgIH1cbiAgICB9KS5mYWlsKGZ1bmN0aW9uKCl7XG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQntGI0LjQsdC60LAg0YPQtNCw0LvQvdC40Y8nLHR5cGU6J2Vycid9KTtcbiAgICB9KVxuICB9XG5cbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5hamF4X3JlbW92ZScsZnVuY3Rpb24oKXtcbiAgICBub3RpZmljYXRpb24uY29uZmlybSh7XG4gICAgICBjYWxsYmFja1llczpvblJlbW92ZSxcbiAgICAgIG9iajokKHRoaXMpLFxuICAgICAgbm90eWZ5X2NsYXNzOiBcIm5vdGlmeV9ib3gtYWxlcnRcIlxuICAgIH0pXG4gIH0pO1xuXG59KTtcblxuIiwiaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uIChvVGhpcykge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8g0LHQu9C40LbQsNC50YjQuNC5INCw0L3QsNC70L7QsyDQstC90YPRgtGA0LXQvdC90LXQuSDRhNGD0L3QutGG0LjQuFxuICAgICAgLy8gSXNDYWxsYWJsZSDQsiBFQ01BU2NyaXB0IDVcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgfVxuXG4gICAgdmFyIGFBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgIGZUb0JpbmQgPSB0aGlzLFxuICAgICAgZk5PUCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIH0sXG4gICAgICBmQm91bmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBmVG9CaW5kLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBmTk9QICYmIG9UaGlzXG4gICAgICAgICAgICA/IHRoaXNcbiAgICAgICAgICAgIDogb1RoaXMsXG4gICAgICAgICAgYUFyZ3MuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIH07XG5cbiAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgIGZCb3VuZC5wcm90b3R5cGUgPSBuZXcgZk5PUCgpO1xuXG4gICAgcmV0dXJuIGZCb3VuZDtcbiAgfTtcbn1cbiIsIihmdW5jdGlvbiAoKSB7XG4gICQoJy5oaWRkZW4tbGluaycpLnJlcGxhY2VXaXRoKGZ1bmN0aW9uICgpIHtcbiAgICAkdGhpcyA9ICQodGhpcylcbiAgICBjb25zb2xlLmxvZygkdGhpcyk7XG4gICAgcmV0dXJuICc8YSBocmVmPVwiJyArICQodGhpcykuZGF0YSgnbGluaycpICsgJ1wiIGNsYXNzPVwiJyArICR0aGlzWzBdLmNsYXNzTmFtZSArICdcIj4nICsgJCh0aGlzKS50ZXh0KCkgKyAnPC9hPic7XG4gIH0pXG59KSgpO1xuIl19
