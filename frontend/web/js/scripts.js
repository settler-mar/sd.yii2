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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsInRpcHNvLm1pbi5qcyIsInRvb2x0aXAuanMiLCJhY2NvdW50X25vdGlmaWNhdGlvbi5qcyIsInNsaWRlci5qcyIsImhlYWRlcl9tZW51X2FuZF9zZWFyY2guanMiLCJjYWxjLWNhc2hiYWNrLmpzIiwiYXV0b19oaWRlX2NvbnRyb2wuanMiLCJoaWRlX3Nob3dfYWxsLmpzIiwiY2xvY2suanMiLCJsaXN0X3R5cGVfc3dpdGNoZXIuanMiLCJzZWxlY3QuanMiLCJzZWFyY2guanMiLCJnb3RvLmpzIiwiYWNjb3VudC13aXRoZHJhdy5qcyIsImFqYXguanMiLCJkb2Jyby5qcyIsImxlZnQtbWVudS10b2dnbGUuanMiLCJzaGFyZTQyLmpzIiwibm90aWZpY2F0aW9uLmpzIiwibW9kYWxzLmpzIiwiZm9vdGVyX21lbnUuanMiLCJyYXRpbmcuanMiLCJmYXZvcml0ZXMuanMiLCJzY3JvbGxfdG8uanMiLCJjb3B5X3RvX2NsaXBib2FyZC5qcyIsImltZy5qcyIsInBhcmVudHNfb3Blbl93aW5kb3dzLmpzIiwiZm9ybXMuanMiLCJjb29raWUuanMiLCJ0YWJsZS5qcyIsImFqYXhfcmVtb3ZlLmpzIiwiZml4ZXMuanMiLCJsaW5rcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BNQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuOEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm9iamVjdHMgPSBmdW5jdGlvbiAoYSwgYikge1xuICB2YXIgYyA9IGIsXG4gICAga2V5O1xuICBmb3IgKGtleSBpbiBhKSB7XG4gICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiBjO1xufTtcblxuZnVuY3Rpb24gbG9naW5fcmVkaXJlY3QobmV3X2hyZWYpIHtcbiAgaHJlZiA9IGxvY2F0aW9uLmhyZWY7XG4gIGlmIChocmVmLmluZGV4T2YoJ3N0b3JlJykgPiAwIHx8IGhyZWYuaW5kZXhPZignY291cG9uJykgPiAwKSB7XG4gICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gIH0gZWxzZSB7XG4gICAgbG9jYXRpb24uaHJlZiA9IG5ld19ocmVmO1xuICB9XG59XG4iLCIoZnVuY3Rpb24gKHcsIGQsICQpIHtcbiAgdmFyIHNjcm9sbHNfYmxvY2sgPSAkKCcuc2Nyb2xsX2JveCcpO1xuXG4gIGlmIChzY3JvbGxzX2Jsb2NrLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gIC8vJCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpLndyYXBBbGwoc2Nyb2xsc19ibG9jayk7XG4gICQoc2Nyb2xsc19ibG9jaykud3JhcCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpO1xuXG4gIGluaXRfc2Nyb2xsKCk7XG4gIGNhbGNfc2Nyb2xsKCk7XG5cbiAgdmFyIHQxLCB0MjtcblxuICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodDEpO1xuICAgIGNsZWFyVGltZW91dCh0Mik7XG4gICAgdDEgPSBzZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLCAzMDApO1xuICAgIHQyID0gc2V0VGltZW91dChjYWxjX3Njcm9sbCwgODAwKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gaW5pdF9zY3JvbGwoKSB7XG4gICAgdmFyIGNvbnRyb2wgPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbFwiPjwvZGl2Pic7XG4gICAgY29udHJvbCA9ICQoY29udHJvbCk7XG4gICAgY29udHJvbC5pbnNlcnRBZnRlcihzY3JvbGxzX2Jsb2NrKTtcbiAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApO1xuXG4gICAgc2Nyb2xsc19ibG9jay5wcmVwZW5kKCc8ZGl2IGNsYXNzPXNjcm9sbF9ib3gtbW92ZXI+PC9kaXY+Jyk7XG5cbiAgICBjb250cm9sLm9uKCdjbGljaycsICcuc2Nyb2xsX2JveC1jb250cm9sX3BvaW50JywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgIHZhciBjb250cm9sID0gJHRoaXMucGFyZW50KCk7XG4gICAgICB2YXIgaSA9ICR0aGlzLmluZGV4KCk7XG4gICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ2FjdGl2ZScpKXJldHVybjtcbiAgICAgIGNvbnRyb2wuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICR0aGlzLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuICAgICAgdmFyIGR4ID0gY29udHJvbC5kYXRhKCdzbGlkZS1keCcpO1xuICAgICAgdmFyIGVsID0gY29udHJvbC5wcmV2KCk7XG4gICAgICBlbC5maW5kKCcuc2Nyb2xsX2JveC1tb3ZlcicpLmNzcygnbWFyZ2luLWxlZnQnLCAtZHggKiBpKTtcbiAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgaSk7XG5cbiAgICAgIHN0b3BTY3JvbC5iaW5kKGVsKSgpO1xuICAgIH0pXG4gIH1cblxuICBmb3IgKHZhciBqID0gMDsgaiA8IHNjcm9sbHNfYmxvY2subGVuZ3RoOyBqKyspIHtcbiAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGopO1xuICAgIGVsLnBhcmVudCgpLmhvdmVyKHN0b3BTY3JvbC5iaW5kKGVsKSwgc3RhcnRTY3JvbC5iaW5kKGVsKSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydFNjcm9sKCkge1xuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpKXJldHVybjtcblxuICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUuYmluZCgkdGhpcyksIDIwMDApO1xuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIHRpbWVvdXRJZClcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3BTY3JvbCgpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgIHZhciB0aW1lb3V0SWQgPSAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKTtcbiAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLCBmYWxzZSk7XG4gICAgaWYgKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpIHx8ICF0aW1lb3V0SWQpcmV0dXJuO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsIGZhbHNlKTtcbiAgICBpZiAoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xuXG4gICAgdmFyIGNvbnRyb2xzID0gJHRoaXMubmV4dCgpLmZpbmQoJz4qJyk7XG4gICAgdmFyIGFjdGl2ZSA9ICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xuICAgIHZhciBwb2ludF9jbnQgPSBjb250cm9scy5sZW5ndGg7XG4gICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcbiAgICBhY3RpdmUrKztcbiAgICBpZiAoYWN0aXZlID49IHBvaW50X2NudClhY3RpdmUgPSAwO1xuICAgICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XG5cbiAgICBjb250cm9scy5lcShhY3RpdmUpLmNsaWNrKCk7XG4gICAgc3RhcnRTY3JvbC5iaW5kKCR0aGlzKSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FsY19zY3JvbGwoKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IHNjcm9sbHNfYmxvY2subGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaSk7XG4gICAgICB2YXIgY29udHJvbCA9IGVsLm5leHQoKTtcbiAgICAgIHZhciB3aWR0aF9tYXggPSBlbC5kYXRhKCdzY3JvbGwtd2lkdGgtbWF4Jyk7XG4gICAgICB3ID0gZWwud2lkdGgoKTtcblxuICAgICAgLy/QtNC10LvQsNC10Lwg0LrQvtC90YLRgNC+0LvRjCDQvtCz0YDQsNC90LjRh9C10L3QuNGPINGI0LjRgNC40L3Riy4g0JXRgdC70Lgg0L/RgNC10LLRi9GI0LXQvdC+INGC0L4g0L7RgtC60LvRjtGH0LDQtdC8INGB0LrRgNC+0Lsg0Lgg0L/QtdGA0LXRhdC+0LTQuNC8INC6INGB0LvQtdC00YPRjtGJ0LXQvNGDINGN0LvQtdC80LXQvdGC0YNcbiAgICAgIGlmICh3aWR0aF9tYXggJiYgdyA+IHdpZHRoX21heCkge1xuICAgICAgICBjb250cm9sLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgbm9fY2xhc3MgPSBlbC5kYXRhKCdzY3JvbGwtZWxlbWV0LWlnbm9yZS1jbGFzcycpO1xuICAgICAgdmFyIGNoaWxkcmVuID0gZWwuZmluZCgnPionKS5ub3QoJy5zY3JvbGxfYm94LW1vdmVyJyk7XG4gICAgICBpZiAobm9fY2xhc3MpIHtcbiAgICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5ub3QoJy4nICsgbm9fY2xhc3MpXG4gICAgICB9XG5cbiAgICAgIC8v0JXRgdC70Lgg0L3QtdGCINC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxuICAgICAgaWYgKGNoaWxkcmVuID09IDApIHtcbiAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBmX2VsID0gY2hpbGRyZW4uZXEoMSk7XG4gICAgICB2YXIgY2hpbGRyZW5fdyA9IGZfZWwub3V0ZXJXaWR0aCgpOyAvL9Cy0YHQtdCz0L4g0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXG4gICAgICBjaGlsZHJlbl93ICs9IHBhcnNlRmxvYXQoZl9lbC5jc3MoJ21hcmdpbi1sZWZ0JykpO1xuICAgICAgY2hpbGRyZW5fdyArPSBwYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tcmlnaHQnKSk7XG5cbiAgICAgIHZhciBzY3JlYW5fY291bnQgPSBNYXRoLmZsb29yKHcgLyBjaGlsZHJlbl93KTtcblxuICAgICAgLy/QldGB0LvQuCDQstGB0LUg0LLQu9Cw0LfQuNGCINC90LAg0Y3QutGA0LDQvVxuICAgICAgaWYgKGNoaWxkcmVuIDw9IHNjcmVhbl9jb3VudCkge1xuICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy/Qo9C20LUg0YLQvtGH0L3QviDQt9C90LDQtdC8INGH0YLQviDRgdC60YDQvtC7INC90YPQttC10L1cbiAgICAgIGVsLmFkZENsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG5cbiAgICAgIHZhciBwb2ludF9jbnQgPSBjaGlsZHJlbi5sZW5ndGggLSBzY3JlYW5fY291bnQgKyAxO1xuICAgICAgLy/QtdGB0LvQuCDQvdC1INC90LDQtNC+INC+0LHQvdC+0LLQu9GP0YLRjCDQutC+0L3RgtGA0L7QuyDRgtC+INCy0YvRhdC+0LTQuNC8LCDQvdC1INC30LDQsdGL0LLQsNGPINC+0LHQvdC+0LLQuNGC0Ywg0YjQuNGA0LjQvdGDINC00L7Rh9C10YDQvdC40YVcbiAgICAgIGlmIChjb250cm9sLmZpbmQoJz4qJykubGVuZ3RoID09IHBvaW50X2NudCkge1xuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWR4JywgY2hpbGRyZW5fdyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBhY3RpdmUgPSBlbC5kYXRhKCdzbGlkZS1hY3RpdmUnKTtcbiAgICAgIGlmICghYWN0aXZlKWFjdGl2ZSA9IDA7XG4gICAgICBpZiAoYWN0aXZlID49IHBvaW50X2NudClhY3RpdmUgPSBwb2ludF9jbnQgLSAxO1xuICAgICAgdmFyIG91dCA9ICcnO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwb2ludF9jbnQ7IGorKykge1xuICAgICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnICsgKGogPT0gYWN0aXZlID8gJyBhY3RpdmUnIDogJycpICsgJ1wiPjwvZGl2Pic7XG4gICAgICB9XG4gICAgICBjb250cm9sLmh0bWwob3V0KTtcblxuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xuICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1jb3VudCcsIHBvaW50X2NudCk7XG4gICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWR4JywgY2hpbGRyZW5fdyk7XG5cbiAgICAgIGlmICghZWwuZGF0YSgnc2xpZGUtdGltZW91dElkJykpIHtcbiAgICAgICAgc3RhcnRTY3JvbC5iaW5kKGVsKSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSh3aW5kb3csIGRvY3VtZW50LCBqUXVlcnkpKTtcbiIsInZhciBhY2NvcmRpb25Db250cm9sID0gJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKTtcblxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcblxuXG4gIGlmICgkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tdGl0bGUnKS5oYXNDbGFzcygnYWNjb3JkaW9uLXRpdGxlLWRpc2FibGVkJykpcmV0dXJuO1xuXG4gIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAvKmlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKXtcbiAgICAgcmV0dXJuIGZhbHNlO1xuICAgICB9Ki9cbiAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlVXAoMzAwKTtcbiAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcbiAgfSBlbHNlIHtcbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJykpIHtcbiAgICAgICRvdGhlciA9ICQoJy5hY2NvcmRpb24tb25seV9vbmUnKTtcbiAgICAgICRvdGhlci5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKVxuICAgICAgICAuc2xpZGVVcCgzMDApXG4gICAgICAgIC5yZW1vdmVDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG4gICAgICAkb3RoZXIucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnbGFzdC1vcGVuJyk7XG5cbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnbGFzdC1vcGVuJyk7XG4gICAgfVxuICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2xpZGVEb3duKDMwMCk7XG4gICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn0pO1xuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XG5cblxuJCgnLmFjY29yZGlvbi13cmFwLm9wZW5fZmlyc3QgLmFjY29yZGlvbjpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XG4kKCcuYWNjb3JkaW9uLXdyYXAgLmFjY29yZGlvbi5hY2NvcmRpb24tc2xpbTpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XG4kKCcuYWNjb3JkaW9uLXNsaW0nKS5hZGRDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJyk7XG5cbi8v0LTQu9GPINGB0LjQvNC+0LIg0L7RgtC60YDRi9Cy0LDQtdC8INC10YHQu9C4INC10YHRgtGMINC/0L7QvNC10YLQutCwIG9wZW4g0YLQviDQv9GA0LjRgdCy0LDQuNCy0LDQtdC8INCy0YHQtSDQvtGB0YLQsNC70YzQvdGL0LUg0LrQu9Cw0YHRi1xuYWNjb3JkaW9uU2xpbSA9ICQoJy5hY2NvcmRpb24uYWNjb3JkaW9uLW9ubHlfb25lJyk7XG5pZiAoYWNjb3JkaW9uU2xpbS5sZW5ndGggPiAwKSB7XG4gIGFjY29yZGlvblNsaW0ucGFyZW50KCkuZmluZCgnLmFjY29yZGlvbi5vcGVuJylcbiAgICAuYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpXG4gICAgLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXG4gICAgLnNob3coMzAwKVxuICAgIC5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG59XG5cbiQoJ2JvZHknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICQoJy5hY2NvcmRpb25fZnVsbHNjcmVhbl9jbG9zZS5vcGVuIC5hY2NvcmRpb24tY29udHJvbDpmaXJzdC1jaGlsZCcpLmNsaWNrKClcbn0pO1xuXG4kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBpZiAoZS50YXJnZXQudGFnTmFtZSAhPSAnQScpIHtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb24nKS5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wuYWNjb3JkaW9uLXRpdGxlJykuY2xpY2soKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59KTtcblxuJCgnLmFjY29yZGlvbi1jb250ZW50IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAkdGhpcyA9ICQodGhpcyk7XG4gIGlmICgkdGhpcy5oYXNDbGFzcygnYW5nbGUtdXAnKSlyZXR1cm47XG4gIGUuc3RvcFByb3BhZ2F0aW9uKClcbn0pO1xuXG4iLCJmdW5jdGlvbiBhamF4Rm9ybShlbHMpIHtcbiAgdmFyIGZpbGVBcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IgPyB0cnVlIDogZmFsc2U7XG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBlcnJvcl9jbGFzczogJy5oYXMtZXJyb3InXG4gIH07XG4gIHZhciBsYXN0X3Bvc3QgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBvblBvc3QocG9zdCkge1xuICAgIGxhc3RfcG9zdCA9ICtuZXcgRGF0ZSgpO1xuICAgIC8vY29uc29sZS5sb2cocG9zdCwgdGhpcyk7XG4gICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xuICAgIHZhciB3cmFwX2h0bWwgPSBkYXRhLndyYXBfaHRtbDtcblxuICAgIGlmIChwb3N0LnJlbmRlcikge1xuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3MgPSBcIm5vdGlmeV93aGl0ZVwiO1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHBvc3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICBmb3JtLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICBpZiAocG9zdC5odG1sKSB7XG4gICAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xuICAgICAgICBhamF4Rm9ybSh3cmFwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghcG9zdC5lcnJvcikge1xuICAgICAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgICB3cmFwLmh0bWwod3JhcF9odG1sKTtcbiAgICAgICAgICBmb3JtLmZpbmQoJ2lucHV0W3R5cGU9dGV4dF0sdGV4dGFyZWEnKS52YWwoJycpXG4gICAgICAgICAgYWpheEZvcm0od3JhcCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBvc3QuZXJyb3IgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGZvciAodmFyIGluZGV4IGluIHBvc3QuZXJyb3IpIHtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcbiAgICAgICAgICAndGl0bGUnOiAn0J7RiNC40LHQutCwJyxcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QuZXJyb3JbaW5kZXhdXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwb3N0LmVycm9yKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb3N0LmVycm9yLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICAgICd0eXBlJzogJ2VycicsXG4gICAgICAgICAgJ3RpdGxlJzogJ9Ce0YjQuNCx0LrQsCcsXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0LmVycm9yW2ldXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocG9zdC5lcnJvciB8fCBwb3N0Lm1lc3NhZ2UpIHtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgJ3R5cGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICdzdWNjZXNzJyA6ICdlcnInLFxuICAgICAgICAgICd0aXRsZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ9Cj0YHQv9C10YjQvdC+JyA6ICfQntGI0LjQsdC60LAnLFxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5tZXNzYWdlID8gcG9zdC5tZXNzYWdlIDogcG9zdC5lcnJvclxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy9cbiAgICAvLyBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAvLyAgICAgJ3R5cGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICdzdWNjZXNzJyA6ICdlcnInLFxuICAgIC8vICAgICAndGl0bGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICfQo9GB0L/QtdGI0L3QvicgOiAn0J7RiNC40LHQutCwJyxcbiAgICAvLyAgICAgJ21lc3NhZ2UnOiBBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpID8gcG9zdC5lcnJvclswXSA6IChwb3N0Lm1lc3NhZ2UgPyBwb3N0Lm1lc3NhZ2UgOiBwb3N0LmVycm9yKVxuICAgIC8vIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gb25GYWlsKCkge1xuICAgIGxhc3RfcG9zdCA9ICtuZXcgRGF0ZSgpO1xuICAgIHZhciBkYXRhID0gdGhpcztcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcbiAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgd3JhcC5odG1sKCc8aDM+0KPQv9GBLi4uINCS0L7Qt9C90LjQutC70LAg0L3QtdC/0YDQtdC00LLQuNC00LXQvdC90LDRjyDQvtGI0LjQsdC60LA8aDM+JyArXG4gICAgICAnPHA+0KfQsNGB0YLQviDRjdGC0L4g0L/RgNC+0LjRgdGF0L7QtNC40YIg0LIg0YHQu9GD0YfQsNC1LCDQtdGB0LvQuCDQstGLINC90LXRgdC60L7Qu9GM0LrQviDRgNCw0Lcg0L/QvtC00YDRj9C0INC90LXQstC10YDQvdC+INCy0LLQtdC70Lgg0YHQstC+0Lgg0YPRh9C10YLQvdGL0LUg0LTQsNC90L3Ri9C1LiDQndC+INCy0L7Qt9C80L7QttC90Ysg0Lgg0LTRgNGD0LPQuNC1INC/0YDQuNGH0LjQvdGLLiDQkiDQu9GO0LHQvtC8INGB0LvRg9GH0LDQtSDQvdC1INGA0LDRgdGB0YLRgNCw0LjQstCw0LnRgtC10YHRjCDQuCDQv9GA0L7RgdGC0L4g0L7QsdGA0LDRgtC40YLQtdGB0Ywg0Log0L3QsNGI0LXQvNGDINC+0L/QtdGA0LDRgtC+0YDRgyDRgdC70YPQttCx0Ysg0L/QvtC00LTQtdGA0LbQutC4LjwvcD48YnI+JyArXG4gICAgICAnPHA+0KHQv9Cw0YHQuNCx0L4uPC9wPicpO1xuICAgIGFqYXhGb3JtKHdyYXApO1xuXG4gIH1cblxuICBmdW5jdGlvbiBvblN1Ym1pdChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAvL2Uuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB2YXIgY3VycmVudFRpbWVNaWxsaXMgPSArbmV3IERhdGUoKTtcbiAgICBpZiAoY3VycmVudFRpbWVNaWxsaXMgLSBsYXN0X3Bvc3QgPCAxMDAwICogMikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxhc3RfcG9zdCA9IGN1cnJlbnRUaW1lTWlsbGlzO1xuICAgIHZhciBkYXRhID0gdGhpcztcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcbiAgICBkYXRhLndyYXBfaHRtbD13cmFwLmh0bWwoKTtcbiAgICB2YXIgaXNWYWxpZCA9IHRydWU7XG5cbiAgICAvL2luaXQod3JhcCk7XG5cbiAgICBpZiAoZm9ybS55aWlBY3RpdmVGb3JtKSB7XG4gICAgICB2YXIgZCA9IGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScpO1xuICAgICAgaWYgKGQpIHtcbiAgICAgICAgZC52YWxpZGF0ZWQgPSB0cnVlO1xuICAgICAgICBmb3JtLmRhdGEoJ3lpaUFjdGl2ZUZvcm0nLCBkKTtcbiAgICAgICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScpO1xuICAgICAgICBpc1ZhbGlkID0gZC52YWxpZGF0ZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaXNWYWxpZCA9IGlzVmFsaWQgJiYgKGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGggPT0gMCk7XG5cbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuXG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHZhciByZXF1aXJlZCA9IGZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQnKTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCByZXF1aXJlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaGVscEJsb2NrID0gcmVxdWlyZWQuZXEoaSkuYXR0cigndHlwZScpID09ICdoaWRkZW4nID8gcmVxdWlyZWQuZXEoaSkubmV4dCgnLmhlbHAtYmxvY2snKSA6XG4gICAgICAgICAgcmVxdWlyZWQuZXEoaSkuY2xvc2VzdCgnLmZvcm0taW5wdXQtZ3JvdXAnKS5uZXh0KCcuaGVscC1ibG9jaycpO1xuICAgICAgICB2YXIgaGVscE1lc3NhZ2UgPSBoZWxwQmxvY2sgJiYgaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA/IGhlbHBCbG9jay5kYXRhKCdtZXNzYWdlJykgOiAn0J3QtdC+0LHRhdC+0LTQuNC80L4g0LfQsNC/0L7Qu9C90LjRgtGMJztcblxuICAgICAgICBpZiAocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoIDwgMSkge1xuICAgICAgICAgIGhlbHBCbG9jay5odG1sKGhlbHBNZXNzYWdlKTtcbiAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGVscEJsb2NrLmh0bWwoJycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghZm9ybS5zZXJpYWxpemVPYmplY3QpYWRkU1JPKCk7XG5cbiAgICB2YXIgcG9zdERhdGEgPSBmb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xuICAgIGZvcm0uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICBmb3JtLmh0bWwoJycpO1xuICAgIHdyYXAuaHRtbCgnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxwPtCe0YLQv9GA0LDQstC60LAg0LTQsNC90L3Ri9GFPC9wPjwvZGl2PicpO1xuXG4gICAgZGF0YS51cmwgKz0gKGRhdGEudXJsLmluZGV4T2YoJz8nKSA+IDAgPyAnJicgOiAnPycpICsgJ3JjPScgKyBNYXRoLnJhbmRvbSgpO1xuICAgIC8vY29uc29sZS5sb2coZGF0YS51cmwpO1xuXG4gICAgJC5wb3N0KFxuICAgICAgZGF0YS51cmwsXG4gICAgICBwb3N0RGF0YSxcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxuICAgICAgJ2pzb24nXG4gICAgKS5mYWlsKG9uRmFpbC5iaW5kKGRhdGEpKTtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQod3JhcCkge1xuICAgIGZvcm0gPSB3cmFwLmZpbmQoJ2Zvcm0nKTtcbiAgICBkYXRhID0ge1xuICAgICAgZm9ybTogZm9ybSxcbiAgICAgIHBhcmFtOiBkZWZhdWx0cyxcbiAgICAgIHdyYXA6IHdyYXBcbiAgICB9O1xuICAgIGRhdGEudXJsID0gZm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xuICAgIGRhdGEubWV0aG9kID0gZm9ybS5hdHRyKCdtZXRob2QnKSB8fCAncG9zdCc7XG4gICAgZm9ybS51bmJpbmQoJ3N1Ym1pdCcpO1xuICAgIC8vZm9ybS5vZmYoJ3N1Ym1pdCcpO1xuICAgIGZvcm0ub24oJ3N1Ym1pdCcsIG9uU3VibWl0LmJpbmQoZGF0YSkpO1xuICB9XG5cbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxuICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpO1xuXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcbiAgICBpbml0KGVscy5lcShpKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkU1JPKCkge1xuICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbyA9IHt9O1xuICAgIHZhciBhID0gdGhpcy5zZXJpYWxpemVBcnJheSgpO1xuICAgICQuZWFjaChhLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAob1t0aGlzLm5hbWVdKSB7XG4gICAgICAgIGlmICghb1t0aGlzLm5hbWVdLnB1c2gpIHtcbiAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcbiAgICAgICAgfVxuICAgICAgICBvW3RoaXMubmFtZV0ucHVzaCh0aGlzLnZhbHVlIHx8ICcnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9bdGhpcy5uYW1lXSA9IHRoaXMudmFsdWUgfHwgJyc7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG87XG4gIH07XG59O1xuYWRkU1JPKCk7IiwiIWZ1bmN0aW9uKHQpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLHQpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPXQocmVxdWlyZShcImpxdWVyeVwiKSk6dChqUXVlcnkpfShmdW5jdGlvbih0KXtmdW5jdGlvbiBvKG8sZSl7dGhpcy5lbGVtZW50PW8sdGhpcy4kZWxlbWVudD10KHRoaXMuZWxlbWVudCksdGhpcy5kb2M9dChkb2N1bWVudCksdGhpcy53aW49dCh3aW5kb3cpLHRoaXMuc2V0dGluZ3M9dC5leHRlbmQoe30sbixlKSxcIm9iamVjdFwiPT10eXBlb2YgdGhpcy4kZWxlbWVudC5kYXRhKFwidGlwc29cIikmJnQuZXh0ZW5kKHRoaXMuc2V0dGluZ3MsdGhpcy4kZWxlbWVudC5kYXRhKFwidGlwc29cIikpO2Zvcih2YXIgcj1PYmplY3Qua2V5cyh0aGlzLiRlbGVtZW50LmRhdGEoKSkscz17fSxkPTA7ZDxyLmxlbmd0aDtkKyspe3ZhciBsPXJbZF0ucmVwbGFjZShpLFwiXCIpO2lmKFwiXCIhPT1sKXtsPWwuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkrbC5zbGljZSgxKSxzW2xdPXRoaXMuJGVsZW1lbnQuZGF0YShyW2RdKTtmb3IodmFyIHAgaW4gdGhpcy5zZXR0aW5ncylwLnRvTG93ZXJDYXNlKCk9PWwmJih0aGlzLnNldHRpbmdzW3BdPXNbbF0pfX10aGlzLl9kZWZhdWx0cz1uLHRoaXMuX25hbWU9aSx0aGlzLl90aXRsZT10aGlzLiRlbGVtZW50LmF0dHIoXCJ0aXRsZVwiKSx0aGlzLm1vZGU9XCJoaWRlXCIsdGhpcy5pZUZhZGU9IWEsdGhpcy5zZXR0aW5ncy5wcmVmZXJlZFBvc2l0aW9uPXRoaXMuc2V0dGluZ3MucG9zaXRpb24sdGhpcy5pbml0KCl9ZnVuY3Rpb24gZShvKXt2YXIgZT1vLmNsb25lKCk7ZS5jc3MoXCJ2aXNpYmlsaXR5XCIsXCJoaWRkZW5cIiksdChcImJvZHlcIikuYXBwZW5kKGUpO3ZhciByPWUub3V0ZXJIZWlnaHQoKSxzPWUub3V0ZXJXaWR0aCgpO3JldHVybiBlLnJlbW92ZSgpLHt3aWR0aDpzLGhlaWdodDpyfX1mdW5jdGlvbiByKHQpe3QucmVtb3ZlQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyIGJvdHRvbV9yaWdodF9jb3JuZXIgdG9wX2xlZnRfY29ybmVyIGJvdHRvbV9sZWZ0X2Nvcm5lclwiKSx0LmZpbmQoXCIudGlwc29fdGl0bGVcIikucmVtb3ZlQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyIGJvdHRvbV9yaWdodF9jb3JuZXIgdG9wX2xlZnRfY29ybmVyIGJvdHRvbV9sZWZ0X2Nvcm5lclwiKX1mdW5jdGlvbiBzKG8pe3ZhciBpLG4sYSxkPW8udG9vbHRpcCgpLGw9by4kZWxlbWVudCxwPW8sZj10KHdpbmRvdyksZz0xMCxjPXAuc2V0dGluZ3MuYmFja2dyb3VuZCxoPXAudGl0bGVDb250ZW50KCk7c3dpdGNoKHZvaWQgMCE9PWgmJlwiXCIhPT1oJiYoYz1wLnNldHRpbmdzLnRpdGxlQmFja2dyb3VuZCksbC5wYXJlbnQoKS5vdXRlcldpZHRoKCk+Zi5vdXRlcldpZHRoKCkmJihmPWwucGFyZW50KCkpLHAuc2V0dGluZ3MucG9zaXRpb24pe2Nhc2VcInRvcC1yaWdodFwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbV9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwiYm90dG9tX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6Y30pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AtcmlnaHQgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudCBcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kfSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTticmVhaztjYXNlXCJ0b3AtbGVmdFwiOm49bC5vZmZzZXQoKS5sZWZ0LWUoZCkud2lkdGgsaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwiYm90dG9tX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcImJvdHRvbV9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOmN9KSxkLnJlbW92ZUNsYXNzKFwidG9wLXJpZ2h0IHRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnQgXCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcInRvcF9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZH0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk7YnJlYWs7Y2FzZVwiYm90dG9tLXJpZ2h0XCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCksaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpK2UoZCkuaGVpZ2h0PmYuc2Nyb2xsVG9wKCkrZi5vdXRlckhlaWdodCgpPyhpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJ0b3BfbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZH0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AtcmlnaHQgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwiYm90dG9tX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJib3R0b21fcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpjfSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTticmVhaztjYXNlXCJib3R0b20tbGVmdFwiOm49bC5vZmZzZXQoKS5sZWZ0LWUoZCkud2lkdGgsaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpK2UoZCkuaGVpZ2h0PmYuc2Nyb2xsVG9wKCkrZi5vdXRlckhlaWdodCgpPyhpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwidG9wX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcInRvcF9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZH0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AtcmlnaHQgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwiYm90dG9tX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcImJvdHRvbV9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOmN9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpO2JyZWFrO2Nhc2VcInRvcFwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLzItZShkKS53aWR0aC8yLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkvMi1lKGQpLndpZHRoLzIsaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpK2UoZCkuaGVpZ2h0PmYuc2Nyb2xsVG9wKCkrZi5vdXRlckhlaWdodCgpPyhpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhwLnNldHRpbmdzLnBvc2l0aW9uKSk7YnJlYWs7Y2FzZVwibGVmdFwiOm49bC5vZmZzZXQoKS5sZWZ0LWUoZCkud2lkdGgtZyxpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKS8yLWUoZCkuaGVpZ2h0LzIsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luVG9wOi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luTGVmdDpcIlwifSksbjxmLnNjcm9sbExlZnQoKT8obj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJyaWdodFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhwLnNldHRpbmdzLnBvc2l0aW9uKSk7YnJlYWs7Y2FzZVwicmlnaHRcIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKStnLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpLzItZShkKS5oZWlnaHQvMixkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5Ub3A6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5MZWZ0OlwiXCJ9KSxuK2crcC5zZXR0aW5ncy53aWR0aD5mLnNjcm9sbExlZnQoKStmLm91dGVyV2lkdGgoKT8obj1sLm9mZnNldCgpLmxlZnQtZShkKS53aWR0aC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImxlZnRcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MocC5zZXR0aW5ncy5wb3NpdGlvbikpfWlmKFwidG9wLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uJiZkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcIm1hcmdpbi1sZWZ0XCI6LXAuc2V0dGluZ3Mud2lkdGgvMn0pLFwidG9wLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pe3ZhciBtPWQuZmluZChcIi50aXBzb19hcnJvd1wiKS5lcSgwKTttLmNzcyh7XCJtYXJnaW4tbGVmdFwiOnAuc2V0dGluZ3Mud2lkdGgvMi0yKnAuc2V0dGluZ3MuYXJyb3dXaWR0aH0pfWlmKFwiYm90dG9tLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKXt2YXIgbT1kLmZpbmQoXCIudGlwc29fYXJyb3dcIikuZXEoMCk7bS5jc3Moe1wibWFyZ2luLWxlZnRcIjotcC5zZXR0aW5ncy53aWR0aC8yLFwibWFyZ2luLXRvcFwiOlwiXCJ9KX1pZihcImJvdHRvbS1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKXt2YXIgbT1kLmZpbmQoXCIudGlwc29fYXJyb3dcIikuZXEoMCk7bS5jc3Moe1wibWFyZ2luLWxlZnRcIjpwLnNldHRpbmdzLndpZHRoLzItMipwLnNldHRpbmdzLmFycm93V2lkdGgsXCJtYXJnaW4tdG9wXCI6XCJcIn0pfW48Zi5zY3JvbGxMZWZ0KCkmJihcImJvdHRvbVwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3BcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYoZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDpuLXAuc2V0dGluZ3MuYXJyb3dXaWR0aH0pLG49MCksbitwLnNldHRpbmdzLndpZHRoPmYub3V0ZXJXaWR0aCgpJiYoXCJib3R0b21cIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wXCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKGE9Zi5vdXRlcldpZHRoKCktKG4rcC5zZXR0aW5ncy53aWR0aCksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotYS1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxuKz1hKSxuPGYuc2Nyb2xsTGVmdCgpJiYoXCJsZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcC1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3AtbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJib3R0b20tcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwiYm90dG9tLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYobj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkvMi1lKGQpLndpZHRoLzIsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLHIoZCksZC5hZGRDbGFzcyhcInRvcFwiKSksbitwLnNldHRpbmdzLndpZHRoPmYub3V0ZXJXaWR0aCgpJiYoYT1mLm91dGVyV2lkdGgoKS0obitwLnNldHRpbmdzLndpZHRoKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1hLXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLG4rPWEpLG48Zi5zY3JvbGxMZWZ0KCkmJihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Om4tcC5zZXR0aW5ncy5hcnJvd1dpZHRofSksbj0wKSksbitwLnNldHRpbmdzLndpZHRoPmYub3V0ZXJXaWR0aCgpJiYoXCJsZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcC1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3AtbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJib3R0b20tcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwiYm90dG9tLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKG49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLzItZShkKS53aWR0aC8yLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpLG4rcC5zZXR0aW5ncy53aWR0aD5mLm91dGVyV2lkdGgoKSYmKGE9Zi5vdXRlcldpZHRoKCktKG4rcC5zZXR0aW5ncy53aWR0aCksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotYS1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxuKz1hKSxuPGYuc2Nyb2xsTGVmdCgpJiYoZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDpuLXAuc2V0dGluZ3MuYXJyb3dXaWR0aH0pLG49MCkpLGQuY3NzKHtsZWZ0Om4rcC5zZXR0aW5ncy5vZmZzZXRYLHRvcDppK3Auc2V0dGluZ3Mub2Zmc2V0WX0pLGk8Zi5zY3JvbGxUb3AoKSYmKFwicmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwibGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihsLnRpcHNvKFwidXBkYXRlXCIsXCJwb3NpdGlvblwiLFwiYm90dG9tXCIpLHMocCkpLGkrZShkKS5oZWlnaHQ+Zi5zY3JvbGxUb3AoKStmLm91dGVySGVpZ2h0KCkmJihcInJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYobC50aXBzbyhcInVwZGF0ZVwiLFwicG9zaXRpb25cIixcInRvcFwiKSxzKHApKX12YXIgaT1cInRpcHNvXCIsbj17c3BlZWQ6NDAwLGJhY2tncm91bmQ6XCIjNTViNTU1XCIsdGl0bGVCYWNrZ3JvdW5kOlwiIzMzMzMzM1wiLGNvbG9yOlwiI2ZmZmZmZlwiLHRpdGxlQ29sb3I6XCIjZmZmZmZmXCIsdGl0bGVDb250ZW50OlwiXCIsc2hvd0Fycm93OiEwLHBvc2l0aW9uOlwidG9wXCIsd2lkdGg6MjAwLG1heFdpZHRoOlwiXCIsZGVsYXk6MjAwLGhpZGVEZWxheTowLGFuaW1hdGlvbkluOlwiXCIsYW5pbWF0aW9uT3V0OlwiXCIsb2Zmc2V0WDowLG9mZnNldFk6MCxhcnJvd1dpZHRoOjgsdG9vbHRpcEhvdmVyOiExLGNvbnRlbnQ6bnVsbCxhamF4Q29udGVudFVybDpudWxsLGFqYXhDb250ZW50QnVmZmVyOjAsY29udGVudEVsZW1lbnRJZDpudWxsLHVzZVRpdGxlOiExLHRlbXBsYXRlRW5naW5lRnVuYzpudWxsLG9uQmVmb3JlU2hvdzpudWxsLG9uU2hvdzpudWxsLG9uSGlkZTpudWxsfTt0LmV4dGVuZChvLnByb3RvdHlwZSx7aW5pdDpmdW5jdGlvbigpe3t2YXIgdD10aGlzLG89dGhpcy4kZWxlbWVudDt0aGlzLmRvY31pZihvLmFkZENsYXNzKFwidGlwc29fc3R5bGVcIikucmVtb3ZlQXR0cihcInRpdGxlXCIpLHQuc2V0dGluZ3MudG9vbHRpcEhvdmVyKXt2YXIgZT1udWxsLHI9bnVsbDtvLm9uKFwibW91c2VvdmVyLlwiK2ksZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoZSksY2xlYXJUaW1lb3V0KHIpLHI9c2V0VGltZW91dChmdW5jdGlvbigpe3Quc2hvdygpfSwxNTApfSksby5vbihcIm1vdXNlb3V0LlwiK2ksZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoZSksY2xlYXJUaW1lb3V0KHIpLGU9c2V0VGltZW91dChmdW5jdGlvbigpe3QuaGlkZSgpfSwyMDApLHQudG9vbHRpcCgpLm9uKFwibW91c2VvdmVyLlwiK2ksZnVuY3Rpb24oKXt0Lm1vZGU9XCJ0b29sdGlwSG92ZXJcIn0pLm9uKFwibW91c2VvdXQuXCIraSxmdW5jdGlvbigpe3QubW9kZT1cInNob3dcIixjbGVhclRpbWVvdXQoZSksZT1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC5oaWRlKCl9LDIwMCl9KX0pfWVsc2Ugby5vbihcIm1vdXNlb3Zlci5cIitpLGZ1bmN0aW9uKCl7dC5zaG93KCl9KSxvLm9uKFwibW91c2VvdXQuXCIraSxmdW5jdGlvbigpe3QuaGlkZSgpfSk7dC5zZXR0aW5ncy5hamF4Q29udGVudFVybCYmKHQuYWpheENvbnRlbnQ9bnVsbCl9LHRvb2x0aXA6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy50aXBzb19idWJibGV8fCh0aGlzLnRpcHNvX2J1YmJsZT10KCc8ZGl2IGNsYXNzPVwidGlwc29fYnViYmxlXCI+PGRpdiBjbGFzcz1cInRpcHNvX3RpdGxlXCI+PC9kaXY+PGRpdiBjbGFzcz1cInRpcHNvX2NvbnRlbnRcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGlwc29fYXJyb3dcIj48L2Rpdj48L2Rpdj4nKSksdGhpcy50aXBzb19idWJibGV9LHNob3c6ZnVuY3Rpb24oKXt2YXIgbz10aGlzLnRvb2x0aXAoKSxlPXRoaXMscj10aGlzLndpbjtlLnNldHRpbmdzLnNob3dBcnJvdz09PSExP28uZmluZChcIi50aXBzb19hcnJvd1wiKS5oaWRlKCk6by5maW5kKFwiLnRpcHNvX2Fycm93XCIpLnNob3coKSxcImhpZGVcIj09PWUubW9kZSYmKHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uQmVmb3JlU2hvdykmJmUuc2V0dGluZ3Mub25CZWZvcmVTaG93KGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpLGUuc2V0dGluZ3Muc2l6ZSYmby5hZGRDbGFzcyhlLnNldHRpbmdzLnNpemUpLGUuc2V0dGluZ3Mud2lkdGg/by5jc3Moe2JhY2tncm91bmQ6ZS5zZXR0aW5ncy5iYWNrZ3JvdW5kLGNvbG9yOmUuc2V0dGluZ3MuY29sb3Isd2lkdGg6ZS5zZXR0aW5ncy53aWR0aH0pLmhpZGUoKTplLnNldHRpbmdzLm1heFdpZHRoP28uY3NzKHtiYWNrZ3JvdW5kOmUuc2V0dGluZ3MuYmFja2dyb3VuZCxjb2xvcjplLnNldHRpbmdzLmNvbG9yLG1heFdpZHRoOmUuc2V0dGluZ3MubWF4V2lkdGh9KS5oaWRlKCk6by5jc3Moe2JhY2tncm91bmQ6ZS5zZXR0aW5ncy5iYWNrZ3JvdW5kLGNvbG9yOmUuc2V0dGluZ3MuY29sb3Isd2lkdGg6MjAwfSkuaGlkZSgpLG8uZmluZChcIi50aXBzb190aXRsZVwiKS5jc3Moe2JhY2tncm91bmQ6ZS5zZXR0aW5ncy50aXRsZUJhY2tncm91bmQsY29sb3I6ZS5zZXR0aW5ncy50aXRsZUNvbG9yfSksby5maW5kKFwiLnRpcHNvX2NvbnRlbnRcIikuaHRtbChlLmNvbnRlbnQoKSksby5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmh0bWwoZS50aXRsZUNvbnRlbnQoKSkscyhlKSxyLm9uKFwicmVzaXplLlwiK2ksZnVuY3Rpb24oKXtlLnNldHRpbmdzLnBvc2l0aW9uPWUuc2V0dGluZ3MucHJlZmVyZWRQb3NpdGlvbixzKGUpfSksd2luZG93LmNsZWFyVGltZW91dChlLnRpbWVvdXQpLGUudGltZW91dD1udWxsLGUudGltZW91dD13aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe2UuaWVGYWRlfHxcIlwiPT09ZS5zZXR0aW5ncy5hbmltYXRpb25Jbnx8XCJcIj09PWUuc2V0dGluZ3MuYW5pbWF0aW9uT3V0P28uYXBwZW5kVG8oXCJib2R5XCIpLnN0b3AoITAsITApLmZhZGVJbihlLnNldHRpbmdzLnNwZWVkLGZ1bmN0aW9uKCl7ZS5tb2RlPVwic2hvd1wiLHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uU2hvdykmJmUuc2V0dGluZ3Mub25TaG93KGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpfSk6by5yZW1vdmUoKS5hcHBlbmRUbyhcImJvZHlcIikuc3RvcCghMCwhMCkucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbk91dCkuYWRkQ2xhc3MoXCJub0FuaW1hdGlvblwiKS5yZW1vdmVDbGFzcyhcIm5vQW5pbWF0aW9uXCIpLmFkZENsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25JbikuZmFkZUluKGUuc2V0dGluZ3Muc3BlZWQsZnVuY3Rpb24oKXt0KHRoaXMpLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe3QodGhpcykucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbkluKX0pLGUubW9kZT1cInNob3dcIix0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vblNob3cpJiZlLnNldHRpbmdzLm9uU2hvdyhlLiRlbGVtZW50LGUuZWxlbWVudCxlKSxyLm9mZihcInJlc2l6ZS5cIitpLG51bGwsXCJ0aXBzb1Jlc2l6ZUhhbmRsZXJcIil9KX0sZS5zZXR0aW5ncy5kZWxheSkpfSxoaWRlOmZ1bmN0aW9uKG8pe3ZhciBlPXRoaXMscj10aGlzLndpbixzPXRoaXMudG9vbHRpcCgpLG49ZS5zZXR0aW5ncy5oaWRlRGVsYXk7byYmKG49MCxlLm1vZGU9XCJzaG93XCIpLHdpbmRvdy5jbGVhclRpbWVvdXQoZS50aW1lb3V0KSxlLnRpbWVvdXQ9bnVsbCxlLnRpbWVvdXQ9d2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcInRvb2x0aXBIb3ZlclwiIT09ZS5tb2RlJiYoZS5pZUZhZGV8fFwiXCI9PT1lLnNldHRpbmdzLmFuaW1hdGlvbklufHxcIlwiPT09ZS5zZXR0aW5ncy5hbmltYXRpb25PdXQ/cy5zdG9wKCEwLCEwKS5mYWRlT3V0KGUuc2V0dGluZ3Muc3BlZWQsZnVuY3Rpb24oKXt0KHRoaXMpLnJlbW92ZSgpLHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uSGlkZSkmJlwic2hvd1wiPT09ZS5tb2RlJiZlLnNldHRpbmdzLm9uSGlkZShlLiRlbGVtZW50LGUuZWxlbWVudCxlKSxlLm1vZGU9XCJoaWRlXCIsci5vZmYoXCJyZXNpemUuXCIraSxudWxsLFwidGlwc29SZXNpemVIYW5kbGVyXCIpfSk6cy5zdG9wKCEwLCEwKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uSW4pLmFkZENsYXNzKFwibm9BbmltYXRpb25cIikucmVtb3ZlQ2xhc3MoXCJub0FuaW1hdGlvblwiKS5hZGRDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uT3V0KS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXt0KHRoaXMpLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25PdXQpLnJlbW92ZSgpLHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uSGlkZSkmJlwic2hvd1wiPT09ZS5tb2RlJiZlLnNldHRpbmdzLm9uSGlkZShlLiRlbGVtZW50LGUuZWxlbWVudCxlKSxlLm1vZGU9XCJoaWRlXCIsci5vZmYoXCJyZXNpemUuXCIraSxudWxsLFwidGlwc29SZXNpemVIYW5kbGVyXCIpfSkpfSxuKX0sY2xvc2U6ZnVuY3Rpb24oKXt0aGlzLmhpZGUoITApfSxkZXN0cm95OmZ1bmN0aW9uKCl7e3ZhciB0PXRoaXMuJGVsZW1lbnQsbz10aGlzLndpbjt0aGlzLmRvY310Lm9mZihcIi5cIitpKSxvLm9mZihcInJlc2l6ZS5cIitpLG51bGwsXCJ0aXBzb1Jlc2l6ZUhhbmRsZXJcIiksdC5yZW1vdmVEYXRhKGkpLHQucmVtb3ZlQ2xhc3MoXCJ0aXBzb19zdHlsZVwiKS5hdHRyKFwidGl0bGVcIix0aGlzLl90aXRsZSl9LHRpdGxlQ29udGVudDpmdW5jdGlvbigpe3ZhciB0LG89dGhpcy4kZWxlbWVudCxlPXRoaXM7cmV0dXJuIHQ9ZS5zZXR0aW5ncy50aXRsZUNvbnRlbnQ/ZS5zZXR0aW5ncy50aXRsZUNvbnRlbnQ6by5kYXRhKFwidGlwc28tdGl0bGVcIil9LGNvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgbyxlPXRoaXMuJGVsZW1lbnQscj10aGlzLHM9dGhpcy5fdGl0bGU7cmV0dXJuIHIuc2V0dGluZ3MuYWpheENvbnRlbnRVcmw/ci5fYWpheENvbnRlbnQ/bz1yLl9hamF4Q29udGVudDooci5fYWpheENvbnRlbnQ9bz10LmFqYXgoe3R5cGU6XCJHRVRcIix1cmw6ci5zZXR0aW5ncy5hamF4Q29udGVudFVybCxhc3luYzohMX0pLnJlc3BvbnNlVGV4dCxyLnNldHRpbmdzLmFqYXhDb250ZW50QnVmZmVyPjA/c2V0VGltZW91dChmdW5jdGlvbigpe3IuX2FqYXhDb250ZW50PW51bGx9LHIuc2V0dGluZ3MuYWpheENvbnRlbnRCdWZmZXIpOnIuX2FqYXhDb250ZW50PW51bGwpOnIuc2V0dGluZ3MuY29udGVudEVsZW1lbnRJZD9vPXQoXCIjXCIrci5zZXR0aW5ncy5jb250ZW50RWxlbWVudElkKS50ZXh0KCk6ci5zZXR0aW5ncy5jb250ZW50P289ci5zZXR0aW5ncy5jb250ZW50OnIuc2V0dGluZ3MudXNlVGl0bGU9PT0hMD9vPXM6XCJzdHJpbmdcIj09dHlwZW9mIGUuZGF0YShcInRpcHNvXCIpJiYobz1lLmRhdGEoXCJ0aXBzb1wiKSksbnVsbCE9PXIuc2V0dGluZ3MudGVtcGxhdGVFbmdpbmVGdW5jJiYobz1yLnNldHRpbmdzLnRlbXBsYXRlRW5naW5lRnVuYyhvKSksb30sdXBkYXRlOmZ1bmN0aW9uKHQsbyl7dmFyIGU9dGhpcztyZXR1cm4gbz92b2lkKGUuc2V0dGluZ3NbdF09byk6ZS5zZXR0aW5nc1t0XX19KTt2YXIgYT1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpLnN0eWxlLG89W1wibXNcIixcIk9cIixcIk1velwiLFwiV2Via2l0XCJdO2lmKFwiXCI9PT10LnRyYW5zaXRpb24pcmV0dXJuITA7Zm9yKDtvLmxlbmd0aDspaWYoby5wb3AoKStcIlRyYW5zaXRpb25cImluIHQpcmV0dXJuITA7cmV0dXJuITF9KCk7dFtpXT10LmZuW2ldPWZ1bmN0aW9uKGUpe3ZhciByPWFyZ3VtZW50cztpZih2b2lkIDA9PT1lfHxcIm9iamVjdFwiPT10eXBlb2YgZSlyZXR1cm4gdGhpcyBpbnN0YW5jZW9mIHR8fHQuZXh0ZW5kKG4sZSksdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSl8fHQuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2ksbmV3IG8odGhpcyxlKSl9KTtpZihcInN0cmluZ1wiPT10eXBlb2YgZSYmXCJfXCIhPT1lWzBdJiZcImluaXRcIiE9PWUpe3ZhciBzO3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgbj10LmRhdGEodGhpcyxcInBsdWdpbl9cIitpKTtufHwobj10LmRhdGEodGhpcyxcInBsdWdpbl9cIitpLG5ldyBvKHRoaXMsZSkpKSxuIGluc3RhbmNlb2YgbyYmXCJmdW5jdGlvblwiPT10eXBlb2YgbltlXSYmKHM9bltlXS5hcHBseShuLEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHIsMSkpKSxcImRlc3Ryb3lcIj09PWUmJnQuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2ksbnVsbCl9KSx2b2lkIDAhPT1zP3M6dGhpc319fSk7IiwidmFyIG15VG9vbHRpcCA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgdG9vbHRpcENsaWNrVGltZTtcbiAgdmFyIHRvb2x0aXBUaW1lT3V0ID0gbnVsbDtcblxuICAkKCdbZGF0YS10b2dnbGU9dG9vbHRpcF0nKS50aXBzbyh7XG4gICAgYmFja2dyb3VuZDogJyNmZmYnLFxuICAgIGNvbG9yOiAnIzQzNGE1NCcsXG4gICAgc2l6ZTogJ3NtYWxsJyxcbiAgICBkZWxheTogMTAsXG4gICAgc3BlZWQ6IDEwLFxuICAgIHdpZHRoOiAyMDAsXG4gICAgLy9tYXhXaWR0aDogMjU4LFxuICAgIHNob3dBcnJvdzogdHJ1ZSxcbiAgICBvbkJlZm9yZVNob3c6IGZ1bmN0aW9uIChlbGUsIHRpcHNvKSB7XG4gICAgICB0aGlzLmNvbnRlbnQgPSBlbGUuZGF0YSgnb3JpZ2luYWwtdGl0bGUnKTtcbiAgICAgIHRoaXMucG9zaXRpb24gPSBlbGUuZGF0YSgncGxhY2VtZW50JykgPyBlbGUuZGF0YSgncGxhY2VtZW50JykgOiAndG9wJztcbiAgICB9XG4gIH0pO1xuXG4gICQoJ1tkYXRhLXRvZ2dsZT10b29sdGlwXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgdG9vbHRpcENsaWNrVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgLy/Rg9Cx0LjRgNCw0LXQvCDRgtCw0LnQvNCw0YPRglxuICAgIGNsZWFySW50ZXJ2YWwodG9vbHRpcFRpbWVPdXQpO1xuICAgIC8v0LfQsNC60YDRi9Cy0LDQstC10Lwg0LLRgdC1INGC0YPQu9GC0LjQv9GLXG4gICAgJCgnW2RhdGEtdG9nZ2xlPXRvb2x0aXBdJykudGlwc28oJ2hpZGUnKTtcbiAgICAvL9C00LDQvdC90YvQuSDQv9C+0LrQsNC30YvQstC10LxcbiAgICAkKHRoaXMpLnRpcHNvKCdzaG93Jyk7XG4gICAgLy/QvdC+0LLRi9C5INC40L3RgtC10YDQstCw0LtcbiAgICB0b29sdGlwVGltZU91dCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChuZXcgRGF0ZSgpIC0gdG9vbHRpcENsaWNrVGltZSA+IDEwMDAgKiA1KSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodG9vbHRpcFRpbWVPdXQpO1xuICAgICAgICAvL9C30LDQutGA0YvQstCw0LXQvCDQstGB0LUg0YLRg9C70YLQuNC/0YtcbiAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPXRvb2x0aXBdJykudGlwc28oJ2hpZGUnKTtcbiAgICAgIH1cbiAgICB9LCAxMDAwKTtcbiAgfSk7XG5cbn0oKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gIHZhciAkbm90eWZpX2J0biA9ICQoJy5oZWFkZXItbG9nb19ub3R5Jyk7XG4gIGlmICgkbm90eWZpX2J0bi5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gICQuZ2V0KCcvYWNjb3VudC9ub3RpZmljYXRpb24nLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGlmICghZGF0YS5ub3RpZmljYXRpb25zIHx8IGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGggPT0gMCkgcmV0dXJuO1xuXG4gICAgdmFyIG91dCA9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWJveD48dWwgY2xhc3M9XCJoZWFkZXItbm90eS1saXN0XCI+JztcbiAgICAkbm90eWZpX2J0bi5maW5kKCdhJykucmVtb3ZlQXR0cignaHJlZicpO1xuICAgIHZhciBoYXNfbmV3ID0gZmFsc2U7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm5vdGlmaWNhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGVsID0gZGF0YS5ub3RpZmljYXRpb25zW2ldO1xuICAgICAgdmFyIGlzX25ldyA9IChlbC5pc192aWV3ZWQgPT0gMCAmJiBlbC50eXBlX2lkID09IDIpO1xuICAgICAgb3V0ICs9ICc8bGkgY2xhc3M9XCJoZWFkZXItbm90eS1pdGVtJyArIChpc19uZXcgPyAnIGhlYWRlci1ub3R5LWl0ZW1fbmV3JyA6ICcnKSArICdcIj4nO1xuICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWRhdGE+JyArIGVsLmRhdGEgKyAnPC9kaXY+JztcbiAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1oZWFkZXItbm90eS10ZXh0PicgKyBlbC50ZXh0ICsgJzwvZGl2Pic7XG4gICAgICBvdXQgKz0gJzwvbGk+JztcbiAgICAgIGhhc19uZXcgPSBoYXNfbmV3IHx8IGlzX25ldztcbiAgICB9XG5cbiAgICBvdXQgKz0gJzwvdWw+JztcbiAgICBvdXQgKz0gJzxhIGNsYXNzPVwiYnRuXCIgaHJlZj1cIi9hY2NvdW50L25vdGlmaWNhdGlvblwiPicgKyBkYXRhLmJ0biArICc8L2E+JztcbiAgICBvdXQgKz0gJzwvZGl2Pic7XG4gICAgJCgnLmhlYWRlcicpLmFwcGVuZChvdXQpO1xuXG4gICAgaWYgKGhhc19uZXcpIHtcbiAgICAgICRub3R5ZmlfYnRuLmFkZENsYXNzKCd0b29sdGlwJykuYWRkQ2xhc3MoJ2hhcy1ub3R5Jyk7XG4gICAgfVxuXG4gICAgJG5vdHlmaV9idG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmICgkKCcuaGVhZGVyLW5vdHktYm94JykuaGFzQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJykpIHtcbiAgICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xuICAgICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5hZGRDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcbiAgICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XG5cbiAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2hhcy1ub3R5JykpIHtcbiAgICAgICAgICAkLnBvc3QoJy9hY2NvdW50L25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICQoJy5oZWFkZXItbG9nb19ub3R5JykucmVtb3ZlQ2xhc3MoJ3Rvb2x0aXAnKS5yZW1vdmVDbGFzcygnaGFzLW5vdHknKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICAkKCcuaGVhZGVyLW5vdHktYm94Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5yZW1vdmVDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcbiAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xuICAgIH0pO1xuXG4gICAgJCgnLmhlYWRlci1ub3R5LWxpc3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pXG4gIH0sICdqc29uJyk7XG5cbn0pKCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtZWdhc2xpZGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNsaWRlcl9kYXRhID0gZmFsc2U7XG4gIHZhciBjb250YWluZXJfaWQgPSBcInNlY3Rpb24jbWVnYV9zbGlkZXJcIjtcbiAgdmFyIHBhcmFsbGF4X2dyb3VwID0gZmFsc2U7XG4gIHZhciBwYXJhbGxheF90aW1lciA9IGZhbHNlO1xuICB2YXIgcGFyYWxsYXhfY291bnRlciA9IDA7XG4gIHZhciBwYXJhbGxheF9kID0gMTtcbiAgdmFyIG1vYmlsZV9tb2RlID0gLTE7XG4gIHZhciBtYXhfdGltZV9sb2FkX3BpYyA9IDMwMDtcbiAgdmFyIG1vYmlsZV9zaXplID0gNzAwO1xuICB2YXIgcmVuZGVyX3NsaWRlX25vbSA9IDA7XG4gIHZhciB0b3RfaW1nX3dhaXQ7XG4gIHZhciBzbGlkZXM7XG4gIHZhciBzbGlkZV9zZWxlY3RfYm94O1xuICB2YXIgZWRpdG9yO1xuICB2YXIgdGltZW91dElkO1xuICB2YXIgc2Nyb2xsX3BlcmlvZCA9IDUwMDA7XG5cbiAgdmFyIHBvc0FyciA9IFtcbiAgICAnc2xpZGVyX190ZXh0LWx0JywgJ3NsaWRlcl9fdGV4dC1jdCcsICdzbGlkZXJfX3RleHQtcnQnLFxuICAgICdzbGlkZXJfX3RleHQtbGMnLCAnc2xpZGVyX190ZXh0LWNjJywgJ3NsaWRlcl9fdGV4dC1yYycsXG4gICAgJ3NsaWRlcl9fdGV4dC1sYicsICdzbGlkZXJfX3RleHQtY2InLCAnc2xpZGVyX190ZXh0LXJiJyxcbiAgXTtcbiAgdmFyIHBvc19saXN0ID0gW1xuICAgICfQm9C10LLQviDQstC10YDRhScsICfRhtC10L3RgtGAINCy0LXRgNGFJywgJ9C/0YDQsNCy0L4g0LLQtdGA0YUnLFxuICAgICfQm9C10LLQviDRhtC10L3RgtGAJywgJ9GG0LXQvdGC0YAnLCAn0L/RgNCw0LLQviDRhtC10L3RgtGAJyxcbiAgICAn0JvQtdCy0L4g0L3QuNC3JywgJ9GG0LXQvdGC0YAg0L3QuNC3JywgJ9C/0YDQsNCy0L4g0L3QuNC3JyxcbiAgXTtcbiAgdmFyIHNob3dfZGVsYXkgPSBbXG4gICAgJ3Nob3dfbm9fZGVsYXknLFxuICAgICdzaG93X2RlbGF5XzA1JyxcbiAgICAnc2hvd19kZWxheV8xMCcsXG4gICAgJ3Nob3dfZGVsYXlfMTUnLFxuICAgICdzaG93X2RlbGF5XzIwJyxcbiAgICAnc2hvd19kZWxheV8yNScsXG4gICAgJ3Nob3dfZGVsYXlfMzAnXG4gIF07XG4gIHZhciBoaWRlX2RlbGF5ID0gW1xuICAgICdoaWRlX25vX2RlbGF5JyxcbiAgICAnaGlkZV9kZWxheV8wNScsXG4gICAgJ2hpZGVfZGVsYXlfMTAnLFxuICAgICdoaWRlX2RlbGF5XzE1JyxcbiAgICAnaGlkZV9kZWxheV8yMCdcbiAgXTtcbiAgdmFyIHllc19ub19hcnIgPSBbXG4gICAgJ25vJyxcbiAgICAneWVzJ1xuICBdO1xuICB2YXIgeWVzX25vX3ZhbCA9IFtcbiAgICAnJyxcbiAgICAnZml4ZWRfX2Z1bGwtaGVpZ2h0J1xuICBdO1xuICB2YXIgYnRuX3N0eWxlID0gW1xuICAgICdub25lJyxcbiAgICAnYm9yZG8nLFxuICBdO1xuICB2YXIgc2hvd19hbmltYXRpb25zID0gW1xuICAgIFwibm90X2FuaW1hdGVcIixcbiAgICBcImJvdW5jZUluXCIsXG4gICAgXCJib3VuY2VJbkRvd25cIixcbiAgICBcImJvdW5jZUluTGVmdFwiLFxuICAgIFwiYm91bmNlSW5SaWdodFwiLFxuICAgIFwiYm91bmNlSW5VcFwiLFxuICAgIFwiZmFkZUluXCIsXG4gICAgXCJmYWRlSW5Eb3duXCIsXG4gICAgXCJmYWRlSW5MZWZ0XCIsXG4gICAgXCJmYWRlSW5SaWdodFwiLFxuICAgIFwiZmFkZUluVXBcIixcbiAgICBcImZsaXBJblhcIixcbiAgICBcImZsaXBJbllcIixcbiAgICBcImxpZ2h0U3BlZWRJblwiLFxuICAgIFwicm90YXRlSW5cIixcbiAgICBcInJvdGF0ZUluRG93bkxlZnRcIixcbiAgICBcInJvdGF0ZUluVXBMZWZ0XCIsXG4gICAgXCJyb3RhdGVJblVwUmlnaHRcIixcbiAgICBcImphY2tJblRoZUJveFwiLFxuICAgIFwicm9sbEluXCIsXG4gICAgXCJ6b29tSW5cIlxuICBdO1xuXG4gIHZhciBoaWRlX2FuaW1hdGlvbnMgPSBbXG4gICAgXCJub3RfYW5pbWF0ZVwiLFxuICAgIFwiYm91bmNlT3V0XCIsXG4gICAgXCJib3VuY2VPdXREb3duXCIsXG4gICAgXCJib3VuY2VPdXRMZWZ0XCIsXG4gICAgXCJib3VuY2VPdXRSaWdodFwiLFxuICAgIFwiYm91bmNlT3V0VXBcIixcbiAgICBcImZhZGVPdXRcIixcbiAgICBcImZhZGVPdXREb3duXCIsXG4gICAgXCJmYWRlT3V0TGVmdFwiLFxuICAgIFwiZmFkZU91dFJpZ2h0XCIsXG4gICAgXCJmYWRlT3V0VXBcIixcbiAgICBcImZsaXBPdXRYXCIsXG4gICAgXCJsaXBPdXRZXCIsXG4gICAgXCJsaWdodFNwZWVkT3V0XCIsXG4gICAgXCJyb3RhdGVPdXRcIixcbiAgICBcInJvdGF0ZU91dERvd25MZWZ0XCIsXG4gICAgXCJyb3RhdGVPdXREb3duUmlnaHRcIixcbiAgICBcInJvdGF0ZU91dFVwTGVmdFwiLFxuICAgIFwicm90YXRlT3V0VXBSaWdodFwiLFxuICAgIFwiaGluZ2VcIixcbiAgICBcInJvbGxPdXRcIlxuICBdO1xuICB2YXIgc3RUYWJsZTtcbiAgdmFyIHBhcmFsYXhUYWJsZTtcblxuICBmdW5jdGlvbiBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWxzKSB7XG4gICAgaWYgKGVscy5sZW5ndGggPT0gMClyZXR1cm47XG4gICAgZWxzLndyYXAoJzxkaXYgY2xhc3M9XCJzZWxlY3RfaW1nXCI+Jyk7XG4gICAgZWxzID0gZWxzLnBhcmVudCgpO1xuICAgIGVscy5hcHBlbmQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmlsZV9idXR0b25cIj48aSBjbGFzcz1cIm1jZS1pY28gbWNlLWktYnJvd3NlXCI+PC9pPjwvYnV0dG9uPicpO1xuICAgIC8qZWxzLmZpbmQoJ2J1dHRvbicpLm9uKCdjbGljaycsZnVuY3Rpb24gKCkge1xuICAgICAkKCcjcm94eUN1c3RvbVBhbmVsMicpLmFkZENsYXNzKCdvcGVuJylcbiAgICAgfSk7Ki9cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGVsID0gZWxzLmVxKGkpLmZpbmQoJ2lucHV0Jyk7XG4gICAgICBpZiAoIWVsLmF0dHIoJ2lkJykpIHtcbiAgICAgICAgZWwuYXR0cignaWQnLCAnZmlsZV8nICsgaSArICdfJyArIERhdGUubm93KCkpXG4gICAgICB9XG4gICAgICB2YXIgdF9pZCA9IGVsLmF0dHIoJ2lkJyk7XG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIucmVnaXN0ZXIodF9pZCwgZnVuY3Rpb24gKGZpbGUsIGlkKSB7XG4gICAgICAgIC8vJCh0aGlzKS52YWwoZmlsZS51cmwpLnRyaWdnZXIoJ2NoYW5nZScsIFtmaWxlLCBpZF0pO1xuICAgICAgICAkKCcjJyArIGlkKS52YWwoZmlsZS51cmwpLmNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICA7XG5cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmZpbGVfYnV0dG9uJywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKS5wcmV2KCk7XG4gICAgICB2YXIgaWQgPSAkdGhpcy5hdHRyKCdpZCcpO1xuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLm9wZW5NYW5hZ2VyKHtcbiAgICAgICAgXCJ1cmxcIjogXCIvbWFuYWdlci9lbGZpbmRlcj9maWx0ZXI9aW1hZ2UmY2FsbGJhY2s9XCIgKyBpZCArIFwiJmxhbmc9cnVcIixcbiAgICAgICAgXCJ3aWR0aFwiOiBcImF1dG9cIixcbiAgICAgICAgXCJoZWlnaHRcIjogXCJhdXRvXCIsXG4gICAgICAgIFwiaWRcIjogaWRcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuSW5wdXQoZGF0YSkge1xuICAgIHZhciBpbnB1dCA9ICc8aW5wdXQgY2xhc3M9XCInICsgKGRhdGEuaW5wdXRDbGFzcyB8fCAnJykgKyAnXCIgdmFsdWU9XCInICsgKGRhdGEudmFsdWUgfHwgJycpICsgJ1wiPic7XG4gICAgaWYgKGRhdGEubGFiZWwpIHtcbiAgICAgIGlucHV0ID0gJzxsYWJlbD48c3Bhbj4nICsgZGF0YS5sYWJlbCArICc8L3NwYW4+JyArIGlucHV0ICsgJzwvbGFiZWw+JztcbiAgICB9XG4gICAgaWYgKGRhdGEucGFyZW50KSB7XG4gICAgICBpbnB1dCA9ICc8JyArIGRhdGEucGFyZW50ICsgJz4nICsgaW5wdXQgKyAnPC8nICsgZGF0YS5wYXJlbnQgKyAnPic7XG4gICAgfVxuICAgIGlucHV0ID0gJChpbnB1dCk7XG5cbiAgICBpZiAoZGF0YS5vbkNoYW5nZSkge1xuICAgICAgdmFyIG9uQ2hhbmdlO1xuICAgICAgaWYgKGRhdGEuYmluZCkge1xuICAgICAgICBkYXRhLmJpbmQuaW5wdXQgPSBpbnB1dC5maW5kKCdpbnB1dCcpO1xuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChkYXRhLmJpbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb25DaGFuZ2UgPSBkYXRhLm9uQ2hhbmdlLmJpbmQoaW5wdXQuZmluZCgnaW5wdXQnKSk7XG4gICAgICB9XG4gICAgICBpbnB1dC5maW5kKCdpbnB1dCcpLm9uKCdjaGFuZ2UnLCBvbkNoYW5nZSlcbiAgICB9XG4gICAgcmV0dXJuIGlucHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuU2VsZWN0KGRhdGEpIHtcbiAgICB2YXIgaW5wdXQgPSAkKCc8c2VsZWN0Lz4nKTtcblxuICAgIHZhciBlbCA9IHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdO1xuICAgIGlmIChkYXRhLmluZGV4ICE9PSBmYWxzZSkge1xuICAgICAgZWwgPSBlbFtkYXRhLmluZGV4XTtcbiAgICB9XG5cbiAgICBpZiAoZWxbZGF0YS5wYXJhbV0pIHtcbiAgICAgIGRhdGEudmFsdWUgPSBlbFtkYXRhLnBhcmFtXTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YS52YWx1ZSA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEuc3RhcnRfb3B0aW9uKSB7XG4gICAgICBpbnB1dC5hcHBlbmQoZGF0YS5zdGFydF9vcHRpb24pXG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWw7XG4gICAgICB2YXIgdHh0ID0gZGF0YS5saXN0W2ldO1xuICAgICAgaWYgKGRhdGEudmFsX3R5cGUgPT0gMCkge1xuICAgICAgICB2YWwgPSBkYXRhLmxpc3RbaV07XG4gICAgICB9IGVsc2UgaWYgKGRhdGEudmFsX3R5cGUgPT0gMSkge1xuICAgICAgICB2YWwgPSBpO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbF90eXBlID09IDIpIHtcbiAgICAgICAgLy92YWw9ZGF0YS52YWxfbGlzdFtpXTtcbiAgICAgICAgdmFsID0gaTtcbiAgICAgICAgdHh0ID0gZGF0YS52YWxfbGlzdFtpXTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNlbCA9ICh2YWwgPT0gZGF0YS52YWx1ZSA/ICdzZWxlY3RlZCcgOiAnJyk7XG4gICAgICBpZiAoc2VsID09ICdzZWxlY3RlZCcpIHtcbiAgICAgICAgaW5wdXQuYXR0cigndF92YWwnLCBkYXRhLmxpc3RbaV0pO1xuICAgICAgfVxuICAgICAgdmFyIG9wdGlvbiA9ICc8b3B0aW9uIHZhbHVlPVwiJyArIHZhbCArICdcIiAnICsgc2VsICsgJz4nICsgdHh0ICsgJzwvb3B0aW9uPic7XG4gICAgICBpZiAoZGF0YS52YWxfdHlwZSA9PSAyKSB7XG4gICAgICAgIG9wdGlvbiA9ICQob3B0aW9uKS5hdHRyKCdjb2RlJywgZGF0YS5saXN0W2ldKTtcbiAgICAgIH1cbiAgICAgIGlucHV0LmFwcGVuZChvcHRpb24pXG4gICAgfVxuXG4gICAgaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEgPSB0aGlzO1xuICAgICAgdmFyIHZhbCA9IGRhdGEuZWwudmFsKCk7XG4gICAgICB2YXIgc2xfb3AgPSBkYXRhLmVsLmZpbmQoJ29wdGlvblt2YWx1ZT0nICsgdmFsICsgJ10nKTtcbiAgICAgIHZhciBjbHMgPSBzbF9vcC50ZXh0KCk7XG4gICAgICB2YXIgY2ggPSBzbF9vcC5hdHRyKCdjb2RlJyk7XG4gICAgICBpZiAoIWNoKWNoID0gY2xzO1xuICAgICAgaWYgKGRhdGEuaW5kZXggIT09IGZhbHNlKSB7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdW2RhdGEuaW5kZXhdW2RhdGEucGFyYW1dID0gdmFsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5wYXJhbV0gPSB2YWw7XG4gICAgICB9XG5cbiAgICAgIGRhdGEub2JqLnJlbW92ZUNsYXNzKGRhdGEucHJlZml4ICsgZGF0YS5lbC5hdHRyKCd0X3ZhbCcpKTtcbiAgICAgIGRhdGEub2JqLmFkZENsYXNzKGRhdGEucHJlZml4ICsgY2gpO1xuICAgICAgZGF0YS5lbC5hdHRyKCd0X3ZhbCcsIGNoKTtcblxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBlbDogaW5wdXQsXG4gICAgICBvYmo6IGRhdGEub2JqLFxuICAgICAgZ3I6IGRhdGEuZ3IsXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOiBkYXRhLnBhcmFtLFxuICAgICAgcHJlZml4OiBkYXRhLnByZWZpeCB8fCAnJ1xuICAgIH0pKTtcblxuICAgIGlmIChkYXRhLnBhcmVudCkge1xuICAgICAgdmFyIHBhcmVudCA9ICQoJzwnICsgZGF0YS5wYXJlbnQgKyAnLz4nKTtcbiAgICAgIHBhcmVudC5hcHBlbmQoaW5wdXQpO1xuICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIGlucHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoZGF0YSkge1xuICAgIHZhciBhbmltX3NlbCA9IFtdO1xuICAgIHZhciBvdXQ7XG5cbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCQ0L3QuNC80LDRhtC40Y8g0L/QvtGP0LLQu9C10L3QuNGPPC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBzaG93X2FuaW1hdGlvbnMsXG4gICAgICB2YWxfdHlwZTogMCxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ICdzaG93X2FuaW1hdGlvbicsXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxuICAgIH0pKTtcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCX0LDQtNC10YDQttC60LAg0L/QvtGP0LLQu9C10L3QuNGPPC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBzaG93X2RlbGF5LFxuICAgICAgdmFsX3R5cGU6IDEsXG4gICAgICBvYmo6IGRhdGEub2JqLFxuICAgICAgZ3I6IGRhdGEuZ3IsXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOiAnc2hvd19kZWxheScsXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxuICAgIH0pKTtcblxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPGJyLz4nKTtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCQ0L3QuNC80LDRhtC40Y8g0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBoaWRlX2FuaW1hdGlvbnMsXG4gICAgICB2YWxfdHlwZTogMCxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ICdoaWRlX2FuaW1hdGlvbicsXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxuICAgIH0pKTtcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCX0LDQtNC10YDQttC60LAg0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBoaWRlX2RlbGF5LFxuICAgICAgdmFsX3R5cGU6IDEsXG4gICAgICBvYmo6IGRhdGEub2JqLFxuICAgICAgZ3I6IGRhdGEuZ3IsXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOiAnaGlkZV9kZWxheScsXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxuICAgIH0pKTtcblxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xuICAgICAgb3V0ID0gJCgnPGRpdiBjbGFzcz1cImFuaW1fc2VsXCIvPicpO1xuICAgICAgb3V0LmFwcGVuZChhbmltX3NlbCk7XG4gICAgfVxuICAgIGlmIChkYXRhLnR5cGUgPT0gMSkge1xuICAgICAgb3V0ID0gYW5pbV9zZWw7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRfZWRpdG9yKCkge1xuICAgICQoJyN3MScpLnJlbW92ZSgpO1xuICAgICQoJyN3MV9idXR0b24nKS5yZW1vdmUoKTtcbiAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUuc3BsaXQoJz8nKVswXTtcblxuICAgIHZhciBlbCA9ICQoJyNtZWdhX3NsaWRlcl9jb250cm9sZScpO1xuICAgIHZhciBidG5zX2JveCA9ICQoJzxkaXYgY2xhc3M9XCJidG5fYm94XCIvPicpO1xuXG4gICAgZWwuYXBwZW5kKCc8aDI+0KPQv9GA0LDQstC70LXQvdC40LU8L2gyPicpO1xuICAgIGVsLmFwcGVuZCgkKCc8dGV4dGFyZWEvPicsIHtcbiAgICAgIHRleHQ6IEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSxcbiAgICAgIGlkOiAnc2xpZGVfZGF0YScsXG4gICAgICBuYW1lOiBlZGl0b3JcbiAgICB9KSk7XG5cbiAgICB2YXIgYnRuID0gJCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XG4gICAgYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnaGlkZV9zbGlkZScpO1xuICAgIH0pO1xuXG4gICAgdmFyIGJ0biA9ICQoJzxidXR0b24gY2xhc3M9XCJcIi8+JykudGV4dChcItCU0LXQsNC60YLQuNCy0LjRgNC+0LLQsNGC0Ywg0YHQu9Cw0LnQtFwiKTtcbiAgICBidG5zX2JveC5hcHBlbmQoYnRuKTtcbiAgICBidG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmFkZENsYXNzKCdoaWRlX3NsaWRlJyk7XG4gICAgfSk7XG4gICAgZWwuYXBwZW5kKGJ0bnNfYm94KTtcblxuICAgIGVsLmFwcGVuZCgnPGgyPtCe0LHRidC40LUg0L/QsNGA0LDQvNC10YLRgNGLPC9oMj4nKTtcbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLm1vYmlsZSxcbiAgICAgIGxhYmVsOiBcItCh0LvQsNC50LQg0LTQu9GPINGC0LXQu9C10YTQvtC90LBcIixcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gJCh0aGlzKS52YWwoKVxuICAgICAgICAkKCcubW9iX2JnJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgc2xpZGVyX2RhdGFbMF0ubW9iaWxlICsgJyknKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0uZm9uLFxuICAgICAgbGFiZWw6IFwi0J7RgdC90L7QvdC+0Lkg0YTQvtC9XCIsXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZvbiA9ICQodGhpcykudmFsKClcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIHNsaWRlcl9kYXRhWzBdLmZvbiArICcpJylcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHZhciBidG5fY2ggPSAkKCc8ZGl2IGNsYXNzPVwiYnRuc1wiLz4nKTtcbiAgICBidG5fY2guYXBwZW5kKCc8aDM+0JrQvdC+0L/QutCwINC/0LXRgNC10YXQvtC00LAo0LTQu9GPINCf0Jog0LLQtdGA0YHQuNC4KTwvaDM+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQsXG4gICAgICBsYWJlbDogXCLQotC10LrRgdGCXCIsXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCA9ICQodGhpcykudmFsKCk7XG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCkudGV4dChzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH0sXG4gICAgfSkpO1xuXG4gICAgdmFyIGJ1dF9zbCA9ICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCk7XG5cbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoJzxzcGFuPtCe0YTQvtGA0LzQu9C10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcbiAgICBidG5fY2guYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBidG5fc3R5bGUsXG4gICAgICB2YWxfdHlwZTogMCxcbiAgICAgIG9iajogYnV0X3NsLFxuICAgICAgZ3I6ICdidXR0b24nLFxuICAgICAgaW5kZXg6IGZhbHNlLFxuICAgICAgcGFyYW06ICdjb2xvcidcbiAgICB9KSk7XG5cbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoJzxzcGFuPtCf0L7Qu9C+0LbQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogcG9zQXJyLFxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxuICAgICAgdmFsX3R5cGU6IDIsXG4gICAgICBvYmo6IGJ1dF9zbC5wYXJlbnQoKS5wYXJlbnQoKSxcbiAgICAgIGdyOiAnYnV0dG9uJyxcbiAgICAgIGluZGV4OiBmYWxzZSxcbiAgICAgIHBhcmFtOiAncG9zJ1xuICAgIH0pKTtcblxuICAgIGJ0bl9jaC5hcHBlbmQoZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoe1xuICAgICAgdHlwZTogMCxcbiAgICAgIG9iajogYnV0X3NsLnBhcmVudCgpLFxuICAgICAgZ3I6ICdidXR0b24nLFxuICAgICAgaW5kZXg6IGZhbHNlXG4gICAgfSkpO1xuICAgIGVsLmFwcGVuZChidG5fY2gpO1xuXG4gICAgdmFyIGxheWVyID0gJCgnPGRpdiBjbGFzcz1cImZpeGVkX2xheWVyXCIvPicpO1xuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCh0YLQsNGC0LjRh9C10YHQutC40LUg0YHQu9C+0Lg8L2gyPicpO1xuICAgIHZhciB0aCA9IFwiPHRoPuKEljwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JrQsNGA0YLQuNC90LrQsDwvdGg+XCIgK1xuICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIiArXG4gICAgICBcIjx0aD7QodC70L7QuSDQvdCwINCy0YHRjiDQstGL0YHQvtGC0YM8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCQ0L3QuNC80LDRhtC40Y8g0L/QvtGP0LLQu9C10L3QuNGPPC90aD5cIiArXG4gICAgICBcIjx0aD7Ql9Cw0LTQtdGA0LbQutCwINC/0L7Rj9Cy0LvQtdC90LjRjzwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiICtcbiAgICAgIFwiPHRoPtCX0LDQtNC10YDQttC60LAg0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC90aD5cIiArXG4gICAgICBcIjx0aD7QlNC10LnRgdGC0LLQuNC1PC90aD5cIjtcbiAgICBzdFRhYmxlID0gJCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+JyArIHRoICsgJzwvdHI+PC90YWJsZT4nKTtcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVswXS5maXhlZDtcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhZGRUclN0YXRpYyhkYXRhW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGF5ZXIuYXBwZW5kKHN0VGFibGUpO1xuICAgIHZhciBhZGRCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XG4gICAgICB0ZXh0OiBcItCU0L7QsdCw0LLQuNGC0Ywg0YHQu9C+0LlcIlxuICAgIH0pO1xuICAgIGFkZEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZGF0YSA9IGFkZFRyU3RhdGljKGZhbHNlKTtcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcbiAgICB9KSk7XG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XG4gICAgZWwuYXBwZW5kKGxheWVyKTtcblxuICAgIHZhciBsYXllciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGF4X2xheWVyXCIvPicpO1xuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCf0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lg8L2gyPicpO1xuICAgIHZhciB0aCA9IFwiPHRoPuKEljwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JrQsNGA0YLQuNC90LrQsDwvdGg+XCIgK1xuICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIiArXG4gICAgICBcIjx0aD7Qo9C00LDQu9C10L3QvdC+0YHRgtGMICjRhtC10LvQvtC1INC/0L7Qu9C+0LbQuNGC0LXQu9GM0L3QvtC1INGH0LjRgdC70L4pPC90aD5cIiArXG4gICAgICBcIjx0aD7QlNC10LnRgdGC0LLQuNC1PC90aD5cIjtcblxuICAgIHBhcmFsYXhUYWJsZSA9ICQoJzx0YWJsZSBib3JkZXI9XCIxXCI+PHRyPicgKyB0aCArICc8L3RyPjwvdGFibGU+Jyk7XG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbMF0ucGFyYWxheDtcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhZGRUclBhcmFsYXgoZGF0YVtpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxheWVyLmFwcGVuZChwYXJhbGF4VGFibGUpO1xuICAgIHZhciBhZGRCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XG4gICAgICB0ZXh0OiBcItCU0L7QsdCw0LLQuNGC0Ywg0YHQu9C+0LlcIlxuICAgIH0pO1xuICAgIGFkZEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZGF0YSA9IGFkZFRyUGFyYWxheChmYWxzZSk7XG4gICAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZGF0YS5lZGl0b3IuZmluZCgnLmZpbGVTZWxlY3QnKSk7XG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXG4gICAgfSkpO1xuXG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XG4gICAgZWwuYXBwZW5kKGxheWVyKTtcblxuICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChlbC5maW5kKCcuZmlsZVNlbGVjdCcpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFRyU3RhdGljKGRhdGEpIHtcbiAgICB2YXIgaSA9IHN0VGFibGUuZmluZCgndHInKS5sZW5ndGggLSAxO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgZGF0YSA9IHtcbiAgICAgICAgXCJpbWdcIjogXCJcIixcbiAgICAgICAgXCJmdWxsX2hlaWdodFwiOiAwLFxuICAgICAgICBcInBvc1wiOiAwLFxuICAgICAgICBcInNob3dfZGVsYXlcIjogMSxcbiAgICAgICAgXCJzaG93X2FuaW1hdGlvblwiOiBcImxpZ2h0U3BlZWRJblwiLFxuICAgICAgICBcImhpZGVfZGVsYXlcIjogMSxcbiAgICAgICAgXCJoaWRlX2FuaW1hdGlvblwiOiBcImJvdW5jZU91dFwiXG4gICAgICB9O1xuICAgICAgc2xpZGVyX2RhdGFbMF0uZml4ZWQucHVzaChkYXRhKTtcbiAgICAgIHZhciBmaXggPSAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwJyk7XG4gICAgICBhZGRTdGF0aWNMYXllcihkYXRhLCBmaXgsIHRydWUpO1xuICAgIH1cbiAgICA7XG5cbiAgICB2YXIgdHIgPSAkKCc8dHIvPicpO1xuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IGRhdGEuaW1nLFxuICAgICAgbGFiZWw6IGZhbHNlLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXG4gICAgICBiaW5kOiB7XG4gICAgICAgIGdyOiAnZml4ZWQnLFxuICAgICAgICBpbmRleDogaSxcbiAgICAgICAgcGFyYW06ICdpbWcnLFxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcbiAgICAgIH0sXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgICAgIGRhdGEub2JqLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW5wdXQudmFsKCkgKyAnKScpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5maXhlZFtkYXRhLmluZGV4XS5pbWcgPSBkYXRhLmlucHV0LnZhbCgpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogcG9zQXJyLFxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxuICAgICAgdmFsX3R5cGU6IDIsXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLFxuICAgICAgZ3I6ICdmaXhlZCcsXG4gICAgICBpbmRleDogaSxcbiAgICAgIHBhcmFtOiAncG9zJyxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiB5ZXNfbm9fdmFsLFxuICAgICAgdmFsX2xpc3Q6IHllc19ub19hcnIsXG4gICAgICB2YWxfdHlwZTogMixcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXG4gICAgICBncjogJ2ZpeGVkJyxcbiAgICAgIGluZGV4OiBpLFxuICAgICAgcGFyYW06ICdmdWxsX2hlaWdodCcsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XG4gICAgICB0eXBlOiAxLFxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5maW5kKCcuYW5pbWF0aW9uX2xheWVyJyksXG4gICAgICBncjogJ2ZpeGVkJyxcbiAgICAgIGluZGV4OiBpLFxuICAgICAgcGFyZW50OiAndGQnXG4gICAgfSkpO1xuICAgIHZhciBkZWxCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XG4gICAgICB0ZXh0OiBcItCj0LTQsNC70LjRgtGMXCJcbiAgICB9KTtcbiAgICBkZWxCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcy5lbCk7XG4gICAgICBpID0gJHRoaXMuY2xvc2VzdCgndHInKS5pbmRleCgpIC0gMTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcbiAgICAgIHRoaXMuc2xpZGVyX2RhdGFbMF0uZml4ZWQuc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgZWw6IGRlbEJ0bixcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxuICAgIH0pKTtcbiAgICB2YXIgZGVsQnRuVGQgPSAkKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xuICAgIHRyLmFwcGVuZChkZWxCdG5UZCk7XG4gICAgc3RUYWJsZS5hcHBlbmQodHIpXG5cbiAgICByZXR1cm4ge1xuICAgICAgZWRpdG9yOiB0cixcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhZGRUclBhcmFsYXgoZGF0YSkge1xuICAgIHZhciBpID0gcGFyYWxheFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoIC0gMTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIGRhdGEgPSB7XG4gICAgICAgIFwiaW1nXCI6IFwiXCIsXG4gICAgICAgIFwielwiOiAxXG4gICAgICB9O1xuICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheC5wdXNoKGRhdGEpO1xuICAgICAgdmFyIHBhcmFsYXhfZ3IgPSAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCcpO1xuICAgICAgYWRkUGFyYWxheExheWVyKGRhdGEsIHBhcmFsYXhfZ3IpO1xuICAgIH1cbiAgICA7XG4gICAgdmFyIHRyID0gJCgnPHRyLz4nKTtcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBkYXRhLmltZyxcbiAgICAgIGxhYmVsOiBmYWxzZSxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxuICAgICAgYmluZDoge1xuICAgICAgICBpbmRleDogaSxcbiAgICAgICAgcGFyYW06ICdpbWcnLFxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmlucHV0LnZhbCgpICsgJyknKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS5pbWcgPSBkYXRhLmlucHV0LnZhbCgpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogcG9zQXJyLFxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxuICAgICAgdmFsX3R5cGU6IDIsXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXG4gICAgICBncjogJ3BhcmFsYXgnLFxuICAgICAgaW5kZXg6IGksXG4gICAgICBwYXJhbTogJ3BvcycsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgICBzdGFydF9vcHRpb246ICc8b3B0aW9uIHZhbHVlPVwiXCIgY29kZT1cIlwiPtC90LAg0LLQtdGB0Ywg0Y3QutGA0LDQvTwvb3B0aW9uPidcbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBkYXRhLnosXG4gICAgICBsYWJlbDogZmFsc2UsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgICBiaW5kOiB7XG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwYXJhbTogJ2ltZycsXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLFxuICAgICAgfSxcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcbiAgICAgICAgZGF0YS5vYmouYXR0cigneicsIGRhdGEuaW5wdXQudmFsKCkpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLnogPSBkYXRhLmlucHV0LnZhbCgpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdmFyIGRlbEJ0biA9ICQoJzxidXR0b24vPicsIHtcbiAgICAgIHRleHQ6IFwi0KPQtNCw0LvQuNGC0YxcIlxuICAgIH0pO1xuICAgIGRlbEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzLmVsKTtcbiAgICAgIGkgPSAkdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCkgLSAxO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHQu9C+0Lkg0L3QsCDRgdC70LDQudC00LXRgNC1XG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5wYXJhbGF4LnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIGVsOiBkZWxCdG4sXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcbiAgICB9KSk7XG4gICAgdmFyIGRlbEJ0blRkID0gJCgnPHRkLz4nKS5hcHBlbmQoZGVsQnRuKTtcbiAgICB0ci5hcHBlbmQoZGVsQnRuVGQpO1xuICAgIHBhcmFsYXhUYWJsZS5hcHBlbmQodHIpXG5cbiAgICByZXR1cm4ge1xuICAgICAgZWRpdG9yOiB0cixcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhZGRfYW5pbWF0aW9uKGVsLCBkYXRhKSB7XG4gICAgdmFyIG91dCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICdjbGFzcyc6ICdhbmltYXRpb25fbGF5ZXInXG4gICAgfSk7XG5cbiAgICBpZiAodHlwZW9mKGRhdGEuc2hvd19kZWxheSkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG91dC5hZGRDbGFzcyhzaG93X2RlbGF5W2RhdGEuc2hvd19kZWxheV0pO1xuICAgICAgaWYgKGRhdGEuc2hvd19hbmltYXRpb24pIHtcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nICsgZGF0YS5zaG93X2FuaW1hdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZihkYXRhLmhpZGVfZGVsYXkpICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICBvdXQuYWRkQ2xhc3MoaGlkZV9kZWxheVtkYXRhLmhpZGVfZGVsYXldKTtcbiAgICAgIGlmIChkYXRhLmhpZGVfYW5pbWF0aW9uKSB7XG4gICAgICAgIG91dC5hZGRDbGFzcygnc2xpZGVfJyArIGRhdGEuaGlkZV9hbmltYXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGVsLmFwcGVuZChvdXQpO1xuICAgIHJldHVybiBlbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlX3NsaWRlKGRhdGEpIHtcbiAgICB2YXIgc2xpZGUgPSAkKCc8ZGl2IGNsYXNzPVwic2xpZGVcIi8+Jyk7XG5cbiAgICB2YXIgbW9iX2JnID0gJCgnPGEgY2xhc3M9XCJtb2JfYmdcIiBocmVmPVwiJyArIGRhdGEuYnV0dG9uLmhyZWYgKyAnXCIvPicpO1xuICAgIG1vYl9iZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLm1vYmlsZSArICcpJylcblxuICAgIHNsaWRlLmFwcGVuZChtb2JfYmcpO1xuICAgIGlmIChtb2JpbGVfbW9kZSkge1xuICAgICAgcmV0dXJuIHNsaWRlO1xuICAgIH1cblxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0YTQvtC9INGC0L4g0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgaWYgKGRhdGEuZm9uKSB7XG4gICAgICBzbGlkZS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmZvbiArICcpJylcbiAgICB9XG5cbiAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgaWYgKGRhdGEucGFyYWxheCAmJiBkYXRhLnBhcmFsYXgubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHBhcmFsYXhfZ3IgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2dyb3VwXCIvPicpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnBhcmFsYXgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYWRkUGFyYWxheExheWVyKGRhdGEucGFyYWxheFtpXSwgcGFyYWxheF9ncilcbiAgICAgIH1cbiAgICAgIHNsaWRlLmFwcGVuZChwYXJhbGF4X2dyKVxuICAgIH1cblxuICAgIHZhciBmaXggPSAkKCc8ZGl2IGNsYXNzPVwiZml4ZWRfZ3JvdXBcIi8+Jyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmZpeGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhZGRTdGF0aWNMYXllcihkYXRhLmZpeGVkW2ldLCBmaXgpXG4gICAgfVxuXG4gICAgdmFyIGRvcF9ibGsgPSAkKFwiPGRpdiBjbGFzcz0nZml4ZWRfX2xheWVyJy8+XCIpO1xuICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEuYnV0dG9uLnBvc10pO1xuICAgIHZhciBidXQgPSAkKFwiPGEgY2xhc3M9J3NsaWRlcl9faHJlZicvPlwiKTtcbiAgICBidXQuYXR0cignaHJlZicsIGRhdGEuYnV0dG9uLmhyZWYpO1xuICAgIGJ1dC50ZXh0KGRhdGEuYnV0dG9uLnRleHQpO1xuICAgIGJ1dC5hZGRDbGFzcyhkYXRhLmJ1dHRvbi5jb2xvcik7XG4gICAgZG9wX2JsayA9IGFkZF9hbmltYXRpb24oZG9wX2JsaywgZGF0YS5idXR0b24pO1xuICAgIGRvcF9ibGsuZmluZCgnZGl2JykuYXBwZW5kKGJ1dCk7XG4gICAgZml4LmFwcGVuZChkb3BfYmxrKTtcblxuICAgIHNsaWRlLmFwcGVuZChmaXgpO1xuICAgIHJldHVybiBzbGlkZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKSB7XG4gICAgdmFyIHBhcmFsbGF4X2xheWVyID0gJCgnPGRpdiBjbGFzcz1cInBhcmFsbGF4X19sYXllclwiXFw+Jyk7XG4gICAgcGFyYWxsYXhfbGF5ZXIuYXR0cigneicsIGRhdGEueiB8fCBpICogMTApO1xuICAgIHZhciBkb3BfYmxrID0gJChcIjxzcGFuIGNsYXNzPSdzbGlkZXJfX3RleHQnLz5cIik7XG4gICAgaWYgKGRhdGEucG9zKSB7XG4gICAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLnBvc10pO1xuICAgIH1cbiAgICBkb3BfYmxrLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcbiAgICBwYXJhbGxheF9sYXllci5hcHBlbmQoZG9wX2Jsayk7XG4gICAgcGFyYWxheF9nci5hcHBlbmQocGFyYWxsYXhfbGF5ZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkU3RhdGljTGF5ZXIoZGF0YSwgZml4LCBiZWZvcl9idXR0b24pIHtcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcbiAgICBpZiAoZGF0YS5mdWxsX2hlaWdodCkge1xuICAgICAgZG9wX2Jsay5hZGRDbGFzcygnZml4ZWRfX2Z1bGwtaGVpZ2h0Jyk7XG4gICAgfVxuICAgIGRvcF9ibGsgPSBhZGRfYW5pbWF0aW9uKGRvcF9ibGssIGRhdGEpO1xuICAgIGRvcF9ibGsuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcblxuICAgIGlmIChiZWZvcl9idXR0b24pIHtcbiAgICAgIGZpeC5maW5kKCcuc2xpZGVyX19ocmVmJykuY2xvc2VzdCgnLmZpeGVkX19sYXllcicpLmJlZm9yZShkb3BfYmxrKVxuICAgIH0gZWxzZSB7XG4gICAgICBmaXguYXBwZW5kKGRvcF9ibGspXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcbiAgICBpZiAoJCgnI21lZ2Ffc2xpZGVyJykuaGFzQ2xhc3MoJ3N0b3Bfc2xpZGUnKSlyZXR1cm47XG5cbiAgICB2YXIgc2xpZGVfcG9pbnRzID0gJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlX3NlbGVjdCcpXG4gICAgdmFyIHNsaWRlX2NudCA9IHNsaWRlX3BvaW50cy5sZW5ndGg7XG4gICAgdmFyIGFjdGl2ZSA9ICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykuaW5kZXgoKSArIDE7XG4gICAgaWYgKGFjdGl2ZSA+PSBzbGlkZV9jbnQpYWN0aXZlID0gMDtcbiAgICBzbGlkZV9wb2ludHMuZXEoYWN0aXZlKS5jbGljaygpO1xuXG4gICAgc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGltZ190b19sb2FkKHNyYykge1xuICAgIHZhciBpbWcgPSAkKCc8aW1nLz4nKTtcbiAgICBpbWcub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0b3RfaW1nX3dhaXQtLTtcblxuICAgICAgaWYgKHRvdF9pbWdfd2FpdCA9PSAwKSB7XG5cbiAgICAgICAgc2xpZGVzLmFwcGVuZChnZW5lcmF0ZV9zbGlkZShzbGlkZXJfZGF0YVtyZW5kZXJfc2xpZGVfbm9tXSkpO1xuICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEocmVuZGVyX3NsaWRlX25vbSkucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cbiAgICAgICAgaWYgKHJlbmRlcl9zbGlkZV9ub20gPT0gMCkge1xuICAgICAgICAgIHNsaWRlcy5maW5kKCcuc2xpZGUnKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93JylcbiAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuXG4gICAgICAgICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5maXJzdF9zaG93JykucmVtb3ZlQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcbiAgICAgICAgICAgIH0uYmluZChzbGlkZXMpLCA1MDAwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9iaWxlX21vZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcbiAgICAgICAgICAgIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xuICAgICAgICAgICAgcGFyYWxsYXhfdGltZXIgPSBzZXRJbnRlcnZhbChyZW5kZXIsIDEwMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGVkaXRvcikge1xuICAgICAgICAgICAgaW5pdF9lZGl0b3IoKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xuXG4gICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCcpLm9uKCdjbGljaycsICcuc2xpZGVfc2VsZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKSlyZXR1cm47XG5cbiAgICAgICAgICAgICAgdmFyIGluZGV4ID0gJHRoaXMuaW5kZXgoKTtcbiAgICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuXG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGUuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGUnKS5lcShpbmRleCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcblxuICAgICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5ob3ZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5hZGRDbGFzcygnc3RvcF9zbGlkZScpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xuICAgICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5yZW1vdmVDbGFzcygnc3RvcF9zbGlkZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVuZGVyX3NsaWRlX25vbSsrO1xuICAgICAgICBpZiAocmVuZGVyX3NsaWRlX25vbSA8IHNsaWRlcl9kYXRhLmxlbmd0aCkge1xuICAgICAgICAgIGxvYWRfc2xpZGVfaW1nKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLm9uKCdlcnJvcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xuICAgIH0pO1xuICAgIGltZy5wcm9wKCdzcmMnLCBzcmMpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9hZF9zbGlkZV9pbWcoKSB7XG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVtyZW5kZXJfc2xpZGVfbm9tXTtcbiAgICB0b3RfaW1nX3dhaXQgPSAxO1xuXG4gICAgaWYgKG1vYmlsZV9tb2RlID09PSBmYWxzZSkge1xuICAgICAgdG90X2ltZ193YWl0Kys7XG4gICAgICBpbWdfdG9fbG9hZChkYXRhLmZvbik7XG4gICAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgICBpZiAoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRvdF9pbWdfd2FpdCArPSBkYXRhLnBhcmFsYXgubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGFyYWxheC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEucGFyYWxheFtpXS5pbWcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChkYXRhLmZpeGVkICYmIGRhdGEuZml4ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB0b3RfaW1nX3dhaXQgKz0gZGF0YS5maXhlZC5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEuZml4ZWRbaV0uaW1nKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW1nX3RvX2xvYWQoZGF0YS5tb2JpbGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRfaW5pdF9zbGlkZShkYXRhKSB7XG4gICAgdmFyIG4gPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB2YXIgaW1nID0gJCgnPGltZy8+Jyk7XG4gICAgaW1nLmF0dHIoJ3RpbWUnLCBuKTtcblxuICAgIGZ1bmN0aW9uIG9uX2ltZ19sb2FkKCkge1xuICAgICAgdmFyIG4gPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIGltZyA9ICQodGhpcyk7XG4gICAgICBuID0gbiAtIHBhcnNlSW50KGltZy5hdHRyKCd0aW1lJykpO1xuICAgICAgaWYgKG4gPiBtYXhfdGltZV9sb2FkX3BpYykge1xuICAgICAgICBtb2JpbGVfbW9kZSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbWF4X3NpemUgPSAoc2NyZWVuLmhlaWdodCA+IHNjcmVlbi53aWR0aCA/IHNjcmVlbi5oZWlnaHQgOiBzY3JlZW4ud2lkdGgpO1xuICAgICAgICBpZiAobWF4X3NpemUgPCBtb2JpbGVfc2l6ZSkge1xuICAgICAgICAgIG1vYmlsZV9tb2RlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb2JpbGVfbW9kZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobW9iaWxlX21vZGUgPT0gdHJ1ZSkge1xuICAgICAgICAkKGNvbnRhaW5lcl9pZCkuYWRkQ2xhc3MoJ21vYmlsZV9tb2RlJylcbiAgICAgIH1cbiAgICAgIHJlbmRlcl9zbGlkZV9ub20gPSAwO1xuICAgICAgbG9hZF9zbGlkZV9pbWcoKTtcbiAgICB9O1xuXG4gICAgaW1nLm9uKCdsb2FkJywgb25faW1nX2xvYWQoKSk7XG4gICAgaWYgKHNsaWRlcl9kYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9IHNsaWRlcl9kYXRhWzBdLm1vYmlsZSArICc/cj0nICsgTWF0aC5yYW5kb20oKTtcbiAgICAgIGltZy5wcm9wKCdzcmMnLCBzbGlkZXJfZGF0YVswXS5tb2JpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbl9pbWdfbG9hZCgpLmJpbmQoaW1nKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbml0KGRhdGEsIGVkaXRvcl9pbml0KSB7XG4gICAgc2xpZGVyX2RhdGEgPSBkYXRhO1xuICAgIGVkaXRvciA9IGVkaXRvcl9pbml0O1xuICAgIC8v0L3QsNGF0L7QtNC40Lwg0LrQvtC90YLQtdC50L3QtdGAINC4INC+0YfQuNGJ0LDQtdC8INC10LPQvlxuICAgIHZhciBjb250YWluZXIgPSAkKGNvbnRhaW5lcl9pZCk7XG4gICAgY29udGFpbmVyLmh0bWwoJycpO1xuXG4gICAgLy/RgdC+0LfQttCw0LXQvCDQsdCw0LfQvtCy0YvQtSDQutC+0L3RgtC10LnQvdC10YDRiyDQtNC70Y8g0YHQsNC80LjRhSDRgdC70LDQudC00L7QsiDQuCDQtNC70Y8g0L/QtdGA0LXQutC70Y7Rh9Cw0YLQtdC70LXQuVxuICAgIHNsaWRlcyA9ICQoJzxkaXYvPicsIHtcbiAgICAgICdjbGFzcyc6ICdzbGlkZXMnXG4gICAgfSk7XG4gICAgdmFyIHNsaWRlX2NvbnRyb2wgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAnY2xhc3MnOiAnc2xpZGVfY29udHJvbCdcbiAgICB9KTtcbiAgICBzbGlkZV9zZWxlY3RfYm94ID0gJCgnPHVsLz4nLCB7XG4gICAgICAnY2xhc3MnOiAnc2xpZGVfc2VsZWN0X2JveCdcbiAgICB9KTtcblxuICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INC40L3QtNC40LrQsNGC0L7RgCDQt9Cw0LPRgNGD0LfQutC4XG4gICAgdmFyIGwgPSAnPGRpdiBjbGFzcz1cInNrLWZvbGRpbmctY3ViZVwiPicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMSBzay1jdWJlXCI+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUyIHNrLWN1YmVcIj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTQgc2stY3ViZVwiPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMyBzay1jdWJlXCI+PC9kaXY+JyArXG4gICAgICAnPC9kaXY+JztcbiAgICBjb250YWluZXIuaHRtbChsKTtcblxuXG4gICAgc3RhcnRfaW5pdF9zbGlkZShkYXRhWzBdKTtcblxuICAgIC8v0LPQtdC90LXRgNC40YDRg9C10Lwg0LrQvdC+0L/QutC4INC4INGB0LvQsNC50LTRi1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgLy9zbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKGRhdGFbaV0pKTtcbiAgICAgIHNsaWRlX3NlbGVjdF9ib3guYXBwZW5kKCc8bGkgY2xhc3M9XCJzbGlkZV9zZWxlY3QgZGlzYWJsZWRcIi8+JylcbiAgICB9XG5cbiAgICAvKnNsaWRlcy5maW5kKCcuc2xpZGUnKS5lcSgwKVxuICAgICAuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKVxuICAgICAuYWRkQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcbiAgICAgc2xpZGVfY29udHJvbC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7Ki9cblxuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVzKTtcbiAgICBzbGlkZV9jb250cm9sLmFwcGVuZChzbGlkZV9zZWxlY3RfYm94KTtcbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlX2NvbnRyb2wpO1xuXG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBpZiAoIXBhcmFsbGF4X2dyb3VwKXJldHVybiBmYWxzZTtcbiAgICB2YXIgcGFyYWxsYXhfayA9IChwYXJhbGxheF9jb3VudGVyIC0gMTApIC8gMjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYWxsYXhfZ3JvdXAubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbCA9IHBhcmFsbGF4X2dyb3VwLmVxKGkpO1xuICAgICAgdmFyIGogPSBlbC5hdHRyKCd6Jyk7XG4gICAgICB2YXIgdHIgPSAncm90YXRlM2QoMC4xLDAuOCwwLCcgKyAocGFyYWxsYXhfaykgKyAnZGVnKSBzY2FsZSgnICsgKDEgKyBqICogMC41KSArICcpIHRyYW5zbGF0ZVooLScgKyAoMTAgKyBqICogMjApICsgJ3B4KSc7XG4gICAgICBlbC5jc3MoJ3RyYW5zZm9ybScsIHRyKVxuICAgIH1cbiAgICBwYXJhbGxheF9jb3VudGVyICs9IHBhcmFsbGF4X2QgKiAwLjE7XG4gICAgaWYgKHBhcmFsbGF4X2NvdW50ZXIgPj0gMjApcGFyYWxsYXhfZCA9IC1wYXJhbGxheF9kO1xuICAgIGlmIChwYXJhbGxheF9jb3VudGVyIDw9IDApcGFyYWxsYXhfZCA9IC1wYXJhbGxheF9kO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG59KCkpO1xuIiwidmFyIGhlYWRlckFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgdmFyIHNoYWRvd2VkRG93biA9IGZhbHNlO1xuXG4gICQoJy5tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcbiAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAkKCcuZHJvcC1tZW51JykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgaWYgKCQoJy5oZWFkZXInKS5oYXNDbGFzcygnaGVhZGVyX29wZW4tbWVudScpKSB7XG4gICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdub19zY3JvbGwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoJy5zZWFyY2gtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgICQoJy5hY2NvdW50LW1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgJCgnI2F1dG9jb21wbGV0ZScpLmZhZGVPdXQoKTtcbiAgICBpZiAoJCgnLmhlYWRlcicpLmhhc0NsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKSkge1xuICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG4gICAgfVxuICB9KTtcblxuICAkKCcjaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS50YXJnZXQuaWQgPT0gJ2hlYWRlcicpIHtcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCh0aGlzKS5jbG9zZXN0KCdmb3JtJykuc3VibWl0KCk7XG4gIH0pO1xuXG4gICQoJy5oZWFkZXItc2Vjb25kbGluZV9jbG9zZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG4gICAgJCgnLmFjY291bnQtbWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcbiAgfSk7XG5cbiAgJCgnLmhlYWRlci11cGxpbmUnKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoIXNjcm9sbGVkRG93bilyZXR1cm47XG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgMTAyNCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcbiAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKCdsb2FkIHJlc2l6ZSBzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNoYWRvd0hlaWdodCA9IDUwO1xuICAgIHZhciBoaWRlSGVpZ2h0ID0gMjAwO1xuICAgIHZhciBoZWFkZXJTZWNvbmRMaW5lID0gJCgnLmhlYWRlci1zZWNvbmRsaW5lJyk7XG4gICAgdmFyIGhvdmVycyA9IGhlYWRlclNlY29uZExpbmUuZmluZCgnOmhvdmVyJyk7XG4gICAgdmFyIGhlYWRlciA9ICQoJy5oZWFkZXInKTtcblxuICAgIGlmICghaG92ZXJzLmxlbmd0aCkge1xuICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsYWJsZScpO1xuICAgICAgaGVhZGVyLnJlbW92ZUNsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgICAvL2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3BcbiAgICAgIHZhciBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gICAgICBpZiAoc2Nyb2xsVG9wID4gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gZmFsc2UpIHtcbiAgICAgICAgc2hhZG93ZWREb3duID0gdHJ1ZTtcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2hhZG93ZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmIChzY3JvbGxUb3AgPD0gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICBzaGFkb3dlZERvd24gPSBmYWxzZTtcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2hhZG93ZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmIChzY3JvbGxUb3AgPiBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gZmFsc2UpIHtcbiAgICAgICAgc2Nyb2xsZWREb3duID0gdHJ1ZTtcbiAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsLWRvd24nKTtcbiAgICAgIH1cbiAgICAgIGlmIChzY3JvbGxUb3AgPD0gaGlkZUhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IHRydWUpIHtcbiAgICAgICAgc2Nyb2xsZWREb3duID0gZmFsc2U7XG4gICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcbiAgICAgIGhlYWRlci5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xuICAgIH1cbiAgfSk7XG5cbiAgJCgnLm1lbnVfYW5nbGUtZG93biwgLmRyb3AtbWVudV9ncm91cF9fdXAtaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgbWVudU9wZW4gPSAkKHRoaXMpLmNsb3Nlc3QoJy5oZWFkZXJfb3Blbi1tZW51LCAuY2F0YWxvZy1jYXRlZ29yaWVzJyk7XG4gICAgaWYgKCFtZW51T3Blbi5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIHBhcmVudCA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudV9ncm91cF9fdXAsIC5tZW51LWdyb3VwJyk7XG4gICAgdmFyIHBhcmVudE1lbnUgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnUnKTtcbiAgICBpZiAocGFyZW50TWVudSkge1xuICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgfVxuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgJChwYXJlbnQpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gICAgICBpZiAocGFyZW50Lmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgJChwYXJlbnQpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgIGlmIChwYXJlbnRNZW51KSB7XG4gICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmFkZENsYXNzKCdjbG9zZScpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgIGlmIChwYXJlbnRNZW51KSB7XG4gICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICB2YXIgYWNjb3VudE1lbnVUaW1lT3V0ID0gbnVsbDtcbiAgdmFyIGFjY291bnRNZW51T3BlblRpbWUgPSAwO1xuICB2YXIgYWNjb3VudE1lbnUgPSAkKCcuYWNjb3VudC1tZW51Jyk7XG5cbiAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPiAxMDI0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcbiAgICB2YXIgdGhhdCA9ICQodGhpcyk7XG5cbiAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XG5cbiAgICBpZiAoYWNjb3VudE1lbnUuaGFzQ2xhc3MoJ2hpZGRlbicpKSB7XG4gICAgICBtZW51QWNjb3VudFVwKHRoYXQpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoYXQucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgIGFjY291bnRNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgLy/Qv9C+0LrQsNC3INC80LXQvdGOINCw0LrQutCw0YPQvdGCXG4gIGZ1bmN0aW9uIG1lbnVBY2NvdW50VXAodG9nZ2xlQnV0dG9uKSB7XG4gICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xuICAgIHRvZ2dsZUJ1dHRvbi5hZGRDbGFzcygnb3BlbicpO1xuICAgIGFjY291bnRNZW51LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gMTAyNCkge1xuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgIH1cblxuICAgIGFjY291bnRNZW51T3BlblRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIGFjY291bnRNZW51VGltZU91dCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IDEwMjQpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xuICAgICAgfVxuICAgICAgaWYgKChuZXcgRGF0ZSgpIC0gYWNjb3VudE1lbnVPcGVuVGltZSkgPiAxMDAwICogNykge1xuICAgICAgICBhY2NvdW50TWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgIHRvZ2dsZUJ1dHRvbi5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XG4gICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcbiAgICAgIH1cblxuICAgIH0sIDEwMDApO1xuICB9XG5cbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllcy1hY2NvdW50X21lbnUtaGVhZGVyJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uICgpIHtcbiAgICBhY2NvdW50TWVudU9wZW5UaW1lID0gbmV3IERhdGUoKTtcbiAgfSk7XG4gICQoJy5hY2NvdW50LW1lbnUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGlmICgkKGUudGFyZ2V0KS5oYXNDbGFzcygnYWNjb3VudC1tZW51JykpIHtcbiAgICAgICQoZS50YXJnZXQpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICB9XG4gIH0pO1xufSgpO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIHBhcnNlTnVtKHN0cikge1xuICAgIHJldHVybiBwYXJzZUZsb2F0KFxuICAgICAgU3RyaW5nKHN0cilcbiAgICAgICAgLnJlcGxhY2UoJywnLCAnLicpXG4gICAgICAgIC5tYXRjaCgvLT9cXGQrKD86XFwuXFxkKyk/L2csICcnKSB8fCAwXG4gICAgICAsIDEwXG4gICAgKTtcbiAgfVxuXG4gICQoJy5zaG9ydC1jYWxjLWNhc2hiYWNrJykuZmluZCgnc2VsZWN0LGlucHV0Jykub24oJ2NoYW5nZSBrZXl1cCBjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLmNsb3Nlc3QoJy5zaG9ydC1jYWxjLWNhc2hiYWNrJyk7XG4gICAgdmFyIGN1cnMgPSBwYXJzZU51bSgkdGhpcy5maW5kKCdzZWxlY3QnKS52YWwoKSk7XG4gICAgdmFyIHZhbCA9ICR0aGlzLmZpbmQoJ2lucHV0JykudmFsKCk7XG4gICAgaWYgKHBhcnNlTnVtKHZhbCkgIT0gdmFsKSB7XG4gICAgICB2YWwgPSAkdGhpcy5maW5kKCdpbnB1dCcpLnZhbChwYXJzZU51bSh2YWwpKTtcbiAgICB9XG4gICAgdmFsID0gcGFyc2VOdW0odmFsKTtcblxuICAgIHZhciBrb2VmID0gJHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrJykudHJpbSgpO1xuICAgIHZhciBwcm9tbyA9ICR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1wcm9tbycpLnRyaW0oKTtcbiAgICB2YXIgY3VycmVuY3kgPSAkdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2stY3VycmVuY3knKS50cmltKCk7XG4gICAgdmFyIHJlc3VsdCA9IDA7XG4gICAgdmFyIG91dCA9IDA7XG5cbiAgICBpZiAoa29lZiA9PSBwcm9tbykge1xuICAgICAgcHJvbW8gPSAwO1xuICAgIH1cblxuICAgIGlmIChrb2VmLmluZGV4T2YoJyUnKSA+IDApIHtcbiAgICAgIHJlc3VsdCA9IHBhcnNlTnVtKGtvZWYpICogdmFsICogY3VycyAvIDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycyA9IHBhcnNlTnVtKCR0aGlzLmZpbmQoJ1tjb2RlPScgKyBjdXJyZW5jeSArICddJykudmFsKCkpO1xuICAgICAgcmVzdWx0ID0gcGFyc2VOdW0oa29lZikgKiBjdXJzXG4gICAgfVxuXG4gICAgaWYgKHBhcnNlTnVtKHByb21vKSA+IDApIHtcbiAgICAgIGlmIChwcm9tby5pbmRleE9mKCclJykgPiAwKSB7XG4gICAgICAgIHByb21vID0gcGFyc2VOdW0ocHJvbW8pICogdmFsICogY3VycyAvIDEwMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb21vID0gcGFyc2VOdW0ocHJvbW8pICogY3Vyc1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvbW8gPiAwKSB7XG4gICAgICAgIG91dCA9IFwiPHNwYW4gY2xhc3M9b2xkX3ByaWNlPlwiICsgcmVzdWx0LnRvRml4ZWQoMikgKyBcIjwvc3Bhbj4gXCIgKyBwcm9tby50b0ZpeGVkKDIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0ID0gcmVzdWx0LnRvRml4ZWQoMik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IHJlc3VsdC50b0ZpeGVkKDIpO1xuICAgIH1cblxuXG4gICAgJHRoaXMuZmluZCgnLmNhbGMtcmVzdWx0X3ZhbHVlJykuaHRtbChvdXQpXG4gIH0pLmNsaWNrKClcbn0pO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVscyA9ICQoJy5hdXRvX2hpZGVfY29udHJvbCcpO1xuICBpZiAoZWxzLmxlbmd0aCA9PSAwKXJldHVybjtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBcIi5zY3JvbGxfYm94LXNob3dfbW9yZVwiLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGJ1dHRvblllczogZmFsc2UsXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibm90aWZ5X3doaXRlIG5vdGlmeV9ub3RfYmlnXCJcbiAgICB9O1xuXG4gICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgIHZhciBjb250ZW50ID0gJHRoaXMuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbScpLmNsb25lKCk7XG4gICAgY29udGVudCA9IGNvbnRlbnRbMF07XG4gICAgY29udGVudC5jbGFzc05hbWUgKz0gJyBzY3JvbGxfYm94LWl0ZW0tbW9kYWwnO1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuY2xhc3NOYW1lID0gJ2NvbW1lbnRzJztcbiAgICBkaXYuYXBwZW5kKGNvbnRlbnQpO1xuICAgICQoZGl2KS5maW5kKCcuc2Nyb2xsX2JveC1zaG93X21vcmUnKS5yZW1vdmUoKTtcbiAgICAkKGRpdikuZmluZCgnLm1heF90ZXh0X2hpZGUnKVxuICAgICAgLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLXgyJylcbiAgICAgIC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZScpO1xuICAgIGRhdGEucXVlc3Rpb24gPSBkaXYub3V0ZXJIVE1MO1xuXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuICB9KTtcblxuICBmdW5jdGlvbiBoYXNTY3JvbGwoZWwpIHtcbiAgICByZXR1cm4gZWwuc2Nyb2xsSGVpZ2h0ID4gZWwuY2xpZW50SGVpZ2h0O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVidWlsZCgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGVsID0gZWxzLmVxKGkpO1xuICAgICAgdmFyIGlzX2hpZGUgPSBmYWxzZTtcbiAgICAgIGlmIChlbC5oZWlnaHQoKSA8IDEwKSB7XG4gICAgICAgIGlzX2hpZGUgPSB0cnVlO1xuICAgICAgICBlbC5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtLWhpZGUnKS5zaG93KDApO1xuICAgICAgfVxuXG4gICAgICB2YXIgdGV4dCA9IGVsLmZpbmQoJy5zY3JvbGxfYm94LXRleHQnKTtcbiAgICAgIHZhciBhbnN3ZXIgPSBlbC5maW5kKCcuc2Nyb2xsX2JveC1hbnN3ZXInKTtcbiAgICAgIHZhciBzaG93X21vcmUgPSBlbC5maW5kKCcuc2Nyb2xsX2JveC1zaG93X21vcmUnKTtcblxuICAgICAgdmFyIHNob3dfYnRuID0gZmFsc2U7XG4gICAgICBpZiAoaGFzU2Nyb2xsKHRleHRbMF0pKSB7XG4gICAgICAgIHNob3dfYnRuID0gdHJ1ZTtcbiAgICAgICAgdGV4dC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0LmFkZENsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFuc3dlci5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8v0LXRgdGC0Ywg0L7RgtCy0LXRgiDQsNC00LzQuNC90LBcbiAgICAgICAgaWYgKGhhc1Njcm9sbChhbnN3ZXJbMF0pKSB7XG4gICAgICAgICAgc2hvd19idG4gPSB0cnVlO1xuICAgICAgICAgIGFuc3dlci5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYW5zd2VyLmFkZENsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc2hvd19idG4pIHtcbiAgICAgICAgc2hvd19tb3JlLnNob3coKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNob3dfbW9yZS5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc19oaWRlKSB7XG4gICAgICAgIGVsLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0taGlkZScpLmhpZGUoMCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgJCh3aW5kb3cpLnJlc2l6ZShyZWJ1aWxkKTtcbiAgcmVidWlsZCgpO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnNob3dfYWxsJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGNscyA9ICQodGhpcykuZGF0YSgnY250cmwtY2xhc3MnKTtcbiAgICAkKCcuaGlkZV9hbGxbZGF0YS1jbnRybC1jbGFzc10nKS5zaG93KCk7XG4gICAgJCh0aGlzKS5oaWRlKCk7XG4gICAgJCgnLicgKyBjbHMpLnNob3coKTtcbiAgfSk7XG5cbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcuaGlkZV9hbGwnLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgY2xzID0gJCh0aGlzKS5kYXRhKCdjbnRybC1jbGFzcycpO1xuICAgICQoJy5zaG93X2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcbiAgICAkKHRoaXMpLmhpZGUoKTtcbiAgICAkKCcuJyArIGNscykuaGlkZSgpO1xuICB9KTtcbn0pKCk7XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlY2xPZk51bShudW1iZXIsIHRpdGxlcykge1xuICAgIGNhc2VzID0gWzIsIDAsIDEsIDEsIDEsIDJdO1xuICAgIHJldHVybiB0aXRsZXNbKG51bWJlciAlIDEwMCA+IDQgJiYgbnVtYmVyICUgMTAwIDwgMjApID8gMiA6IGNhc2VzWyhudW1iZXIgJSAxMCA8IDUpID8gbnVtYmVyICUgMTAgOiA1XV07XG4gIH1cblxuICBmdW5jdGlvbiBmaXJzdFplcm8odikge1xuICAgIHYgPSBNYXRoLmZsb29yKHYpO1xuICAgIGlmICh2IDwgMTApXG4gICAgICByZXR1cm4gJzAnICsgdjtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gdjtcbiAgfVxuXG4gIHZhciBjbG9ja3MgPSAkKCcuY2xvY2snKTtcbiAgaWYgKGNsb2Nrcy5sZW5ndGggPiAwKSB7XG4gICAgZnVuY3Rpb24gdXBkYXRlQ2xvY2soKSB7XG4gICAgICB2YXIgY2xvY2tzID0gJCh0aGlzKTtcbiAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGMgPSBjbG9ja3MuZXEoaSk7XG4gICAgICAgIHZhciBlbmQgPSBuZXcgRGF0ZShjLmRhdGEoJ2VuZCcpLnJlcGxhY2UoLy0vZywgXCIvXCIpKTtcbiAgICAgICAgdmFyIGQgPSAoZW5kLmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCkpIC8gMTAwMDtcblxuICAgICAgICAvL9C10YHQu9C4INGB0YDQvtC6INC/0YDQvtGI0LXQu1xuICAgICAgICBpZiAoZCA8PSAwKSB7XG4gICAgICAgICAgYy50ZXh0KCfQn9GA0L7QvNC+0LrQvtC0INC40YHRgtC10LonKTtcbiAgICAgICAgICBjLmFkZENsYXNzKCdjbG9jay1leHBpcmVkJyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL9C10YHQu9C4INGB0YDQvtC6INCx0L7Qu9C10LUgMzAg0LTQvdC10LlcbiAgICAgICAgaWYgKGQgPiAzMCAqIDYwICogNjAgKiAyNCkge1xuICAgICAgICAgIGMuaHRtbCgn0J7RgdGC0LDQu9C+0YHRjDogPHNwYW4+0LHQvtC70LXQtSAzMCDQtNC90LXQuTwvc3Bhbj4nKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzID0gZCAlIDYwO1xuICAgICAgICBkID0gKGQgLSBzKSAvIDYwO1xuICAgICAgICB2YXIgbSA9IGQgJSA2MDtcbiAgICAgICAgZCA9IChkIC0gbSkgLyA2MDtcbiAgICAgICAgdmFyIGggPSBkICUgMjQ7XG4gICAgICAgIGQgPSAoZCAtIGgpIC8gMjQ7XG5cbiAgICAgICAgdmFyIHN0ciA9IGZpcnN0WmVybyhoKSArIFwiOlwiICsgZmlyc3RaZXJvKG0pICsgXCI6XCIgKyBmaXJzdFplcm8ocyk7XG4gICAgICAgIGlmIChkID4gMCkge1xuICAgICAgICAgIHN0ciA9IGQgKyBcIiBcIiArIGRlY2xPZk51bShkLCBbJ9C00LXQvdGMJywgJ9C00L3RjycsICfQtNC90LXQuSddKSArIFwiICBcIiArIHN0cjtcbiAgICAgICAgfVxuICAgICAgICBjLmh0bWwoXCLQntGB0YLQsNC70L7RgdGMOiA8c3Bhbj5cIiArIHN0ciArIFwiPC9zcGFuPlwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRJbnRlcnZhbCh1cGRhdGVDbG9jay5iaW5kKGNsb2NrcyksIDEwMDApO1xuICAgIHVwZGF0ZUNsb2NrLmJpbmQoY2xvY2tzKSgpO1xuICB9XG59KTtcbiIsInZhciBjYXRhbG9nVHlwZVN3aXRjaGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY2F0YWxvZyA9ICQoJy5jYXRhbG9nX2xpc3QnKTtcbiAgaWYgKGNhdGFsb2cubGVuZ3RoID09IDApcmV0dXJuO1xuXG4gICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5maW5kKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24nKS5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xuICAgICQodGhpcykuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcbiAgICBpZiAoY2F0YWxvZykge1xuICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2NhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbGlzdCcpKSB7XG4gICAgICAgIGNhdGFsb2cucmVtb3ZlQ2xhc3MoJ25hcnJvdycpO1xuICAgICAgICBzZXRDb29raWUoJ2NvdXBvbnNfdmlldycsICcnKVxuICAgICAgfVxuICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2NhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbmFycm93JykpIHtcbiAgICAgICAgY2F0YWxvZy5hZGRDbGFzcygnbmFycm93Jyk7XG4gICAgICAgIHNldENvb2tpZSgnY291cG9uc192aWV3JywgJ25hcnJvdycpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGdldENvb2tpZSgnY291cG9uc192aWV3JykgPT0gJ25hcnJvdycgJiYgIWNhdGFsb2cuaGFzQ2xhc3MoJ25hcnJvd19vZmYnKSkge1xuICAgIGNhdGFsb2cuYWRkQ2xhc3MoJ25hcnJvdycpO1xuICAgICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLW5hcnJvdycpLmFkZENsYXNzKCdjaGVja2VkJyk7XG4gICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbGlzdCcpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XG4gIH1cbn0oKTtcbiIsIiQoZnVuY3Rpb24gKCkge1xuICAkKCcuc2Qtc2VsZWN0LXNlbGVjdGVkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgIHZhciBwYXJlbnQgPSAkKHRoaXMpLnBhcmVudCgpO1xuICAgIHZhciBkcm9wQmxvY2sgPSAkKHBhcmVudCkuZmluZCgnLnNkLXNlbGVjdC1kcm9wJyk7XG5cbiAgICBpZiAoZHJvcEJsb2NrLmlzKCc6aGlkZGVuJykpIHtcbiAgICAgIGRyb3BCbG9jay5zbGlkZURvd24oKTtcblxuICAgICAgJCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cbiAgICAgIGlmICghcGFyZW50Lmhhc0NsYXNzKCdsaW5rZWQnKSkge1xuXG4gICAgICAgICQoJy5zZC1zZWxlY3QtZHJvcCcpLmZpbmQoJ2EnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHZhciBzZWxlY3RSZXN1bHQgPSAkKHRoaXMpLmh0bWwoKTtcblxuICAgICAgICAgICQocGFyZW50KS5maW5kKCdpbnB1dCcpLnZhbChzZWxlY3RSZXN1bHQpO1xuXG4gICAgICAgICAgJChwYXJlbnQpLmZpbmQoJy5zZC1zZWxlY3Qtc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcygnYWN0aXZlJykuaHRtbChzZWxlY3RSZXN1bHQpO1xuXG4gICAgICAgICAgZHJvcEJsb2NrLnNsaWRlVXAoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICBkcm9wQmxvY2suc2xpZGVVcCgpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG59KTtcbiIsInNlYXJjaCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG9wZW5BdXRvY29tcGxldGU7XG5cbiAgJCgnLnNlYXJjaC1mb3JtLWlucHV0Jykub24oJ2lucHV0JywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgIHZhciBxdWVyeSA9ICR0aGlzLnZhbCgpO1xuICAgIHZhciBkYXRhID0gJHRoaXMuY2xvc2VzdCgnZm9ybScpLnNlcmlhbGl6ZSgpO1xuICAgIHZhciBhdXRvY29tcGxldGUgPSAkdGhpcy5jbG9zZXN0KCcuc3RvcmVzX3NlYXJjaCcpLmZpbmQoJy5hdXRvY29tcGxldGUtd3JhcCcpOy8vICQoJyNhdXRvY29tcGxldGUnKSxcbiAgICB2YXIgYXV0b2NvbXBsZXRlTGlzdCA9ICQoYXV0b2NvbXBsZXRlKS5maW5kKCd1bCcpO1xuICAgIG9wZW5BdXRvY29tcGxldGUgPSBhdXRvY29tcGxldGU7XG4gICAgaWYgKHF1ZXJ5Lmxlbmd0aCA+IDEpIHtcbiAgICAgIHVybCA9ICR0aGlzLmNsb3Nlc3QoJ2Zvcm0nKS5hdHRyKCdhY3Rpb24nKSB8fCAnL3NlYXJjaCc7XG4gICAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgdHlwZTogJ2dldCcsXG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgJChhdXRvY29tcGxldGVMaXN0KS5odG1sKCcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9ICc8YSBjbGFzcz1cImF1dG9jb21wbGV0ZV9saW5rXCIgaHJlZj1cIicgKyBpdGVtLmRhdGEucm91dGUgKyAnXCInICsgJz4nICsgaXRlbS52YWx1ZSArIGl0ZW0uY2FzaGJhY2sgKyAnPC9hPic7XG4gICAgICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgICAgICBsaS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmFwcGVuZChsaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XG4gICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuaHRtbCgnJyk7XG4gICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSkub24oJ2ZvY3Vzb3V0JywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoISQoZS5yZWxhdGVkVGFyZ2V0KS5oYXNDbGFzcygnYXV0b2NvbXBsZXRlX2xpbmsnKSkge1xuICAgICAgLy8kKCcjYXV0b2NvbXBsZXRlJykuaGlkZSgpO1xuICAgICAgJChvcGVuQXV0b2NvbXBsZXRlKS5kZWxheSgxMDApLnNsaWRlVXAoMTAwKVxuICAgIH1cbiAgfSk7XG5cbiAgJCgnYm9keScpLm9uKCdzdWJtaXQnLCAnLnN0b3Jlcy1zZWFyY2hfZm9ybScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIHZhbCA9ICQodGhpcykuZmluZCgnLnNlYXJjaC1mb3JtLWlucHV0JykudmFsKCk7XG4gICAgaWYgKHZhbC5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9KVxufSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAkKCcuY291cG9ucy1saXN0X2l0ZW0tY29udGVudC1nb3RvLXByb21vY29kZS1saW5rJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgdGhhdCA9ICQodGhpcyk7XG4gICAgdmFyIGV4cGlyZWQgPSB0aGF0LmNsb3Nlc3QoJy5jb3Vwb25zLWxpc3RfaXRlbScpLmZpbmQoJy5jbG9jay1leHBpcmVkJyk7XG4gICAgdmFyIHVzZXJJZCA9ICQodGhhdCkuZGF0YSgndXNlcicpO1xuICAgIHZhciBpbmFjdGl2ZSA9ICQodGhhdCkuZGF0YSgnaW5hY3RpdmUnKTtcbiAgICB2YXIgZGF0YV9tZXNzYWdlID0gJCh0aGF0KS5kYXRhKCdtZXNzYWdlJyk7XG5cbiAgICBpZiAoaW5hY3RpdmUpIHtcbiAgICAgIHZhciB0aXRsZSA9IGRhdGFfbWVzc2FnZSA/IGRhdGFfbWVzc2FnZSA6ICfQmiDRgdC+0LbQsNC70LXQvdC40Y4sINC/0YDQvtC80L7QutC+0LQg0L3QtdCw0LrRgtC40LLQtdC9JztcbiAgICAgIHZhciBtZXNzYWdlID0gJ9CS0YHQtSDQtNC10LnRgdGC0LLRg9GO0YnQuNC1INC/0YDQvtC80L7QutC+0LTRiyDQstGLINC80L7QttC10YLQtSA8YSBocmVmPVwiL2NvdXBvbnNcIj7Qv9C+0YHQvNC+0YLRgNC10YLRjCDQt9C00LXRgdGMPC9hPic7XG4gICAgICBub3RpZmljYXRpb24uYWxlcnQoe1xuICAgICAgICAndGl0bGUnOiB0aXRsZSxcbiAgICAgICAgJ3F1ZXN0aW9uJzogbWVzc2FnZSxcbiAgICAgICAgJ2J1dHRvblllcyc6ICdPaycsXG4gICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxuICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGV4cGlyZWQubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHRpdGxlID0gJ9CaINGB0L7QttCw0LvQtdC90LjRjiwg0YHRgNC+0Log0LTQtdC50YHRgtCy0LjRjyDQtNCw0L3QvdC+0LPQviDQv9GA0L7QvNC+0LrQvtC00LAg0LjRgdGC0LXQuic7XG4gICAgICB2YXIgbWVzc2FnZSA9ICfQktGB0LUg0LTQtdC50YHRgtCy0YPRjtGJ0LjQtSDQv9GA0L7QvNC+0LrQvtC00Ysg0LLRiyDQvNC+0LbQtdGC0LUgPGEgaHJlZj1cIi9jb3Vwb25zXCI+0L/QvtGB0LzQvtGC0YDQtdGC0Ywg0LfQtNC10YHRjDwvYT4nO1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcbiAgICAgICAgJ3RpdGxlJzogdGl0bGUsXG4gICAgICAgICdxdWVzdGlvbic6IG1lc3NhZ2UsXG4gICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxuICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcbiAgICAgICAgJ25vdHlmeV9jbGFzcyc6ICdub3RpZnlfYm94LWFsZXJ0J1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmICghdXNlcklkKSB7XG4gICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgJ2J1dHRvblllcyc6IGZhbHNlLFxuICAgICAgICAnbm90eWZ5X2NsYXNzJzogXCJub3RpZnlfYm94LWFsZXJ0XCIsXG4gICAgICAgICd0aXRsZSc6ICfQmNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0L/RgNC+0LzQvtC60L7QtCcsXG4gICAgICAgICdxdWVzdGlvbic6ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveC1jb3Vwb24tbm9yZWdpc3RlclwiPicgK1xuICAgICAgICAnPGltZyBzcmM9XCIvaW1hZ2VzL3RlbXBsYXRlcy9zd2EucG5nXCIgYWx0PVwiXCI+JyArXG4gICAgICAgICc8cD48Yj7QldGB0LvQuCDQstGLINGF0L7RgtC40YLQtSDQv9C+0LvRg9GH0LDRgtGMINC10YnQtSDQuCDQmtCt0KjQkdCt0JogKNCy0L7Qt9Cy0YDQsNGCINC00LXQvdC10LMpLCDQstCw0Lwg0L3QtdC+0LHRhdC+0LTQuNC80L4g0LfQsNGA0LXQs9C40YHRgtGA0LjRgNC+0LLQsNGC0YzRgdGPLiDQndC+INC80L7QttC10YLQtSDQuCDQv9GA0L7RgdGC0L4g0LLQvtGB0L/QvtC70YzQt9C+0LLQsNGC0YzRgdGPINC/0YDQvtC80L7QutC+0LTQvtC8LCDQsdC10Lcg0LrRjdGI0LHRjdC60LAuPC9iPjwvcD4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtYnV0dG9uc1wiPicgK1xuICAgICAgICAnPGEgaHJlZj1cIicgKyB0aGF0LmF0dHIoJ2hyZWYnKSArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImJ0blwiPtCY0YHQv9C+0LvRjNC30L7QstCw0YLRjCDQv9GA0L7QvNC+0LrQvtC0PC9hPicgK1xuICAgICAgICAnPGEgaHJlZj1cIiNyZWdpc3RyYXRpb25cIiBjbGFzcz1cImJ0biBidG4tdHJhbnNmb3JtIG1vZGFsc19vcGVuXCI+0JfQsNGA0LXQs9C40YHRgtGA0LjRgNC+0LLQsNGC0YzRgdGPPC9hPicgK1xuICAgICAgICAnPC9kaXY+J1xuICAgICAgfTtcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pO1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnLmFjY291bnQtd2l0aGRyYXctbWV0aG9kc19pdGVtLW9wdGlvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBvcHRpb24gPSAkKHRoaXMpLmRhdGEoJ29wdGlvbi1wcm9jZXNzJyksXG4gICAgICBwbGFjZWhvbGRlciA9ICcnO1xuICAgIHN3aXRjaCAob3B0aW9uKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINGB0YfRkdGC0LBcIjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAgUi3QutC+0YjQtdC70YzQutCwXCI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM6XG4gICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINGC0LXQu9C10YTQvtC90LBcIjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgNDpcbiAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0LrQsNGA0YLRi1wiO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA1OlxuICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUgZW1haWwg0LDQtNGA0LXRgVwiO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA2OlxuICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDRgtC10LvQtdGE0L7QvdCwXCI7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgJCh0aGlzKS5wYXJlbnQoKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgJChcIiN1c2Vyc3dpdGhkcmF3LWJpbGxcIikuYXR0cihcInBsYWNlaG9sZGVyXCIsIHBsYWNlaG9sZGVyKTtcbiAgICAkKCcjdXNlcnN3aXRoZHJhdy1wcm9jZXNzX2lkJykudmFsKG9wdGlvbik7XG4gIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gIGFqYXhGb3JtKCQoJy5hamF4X2Zvcm0nKSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnLmRvYnJvLWZ1bmRzX2l0ZW0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAkKCcjZG9icm8tc2VuZC1mb3JtLWNoYXJpdHktcHJvY2VzcycpLnZhbCgkKHRoaXMpLmRhdGEoJ2lkJykpO1xuICB9KTtcblxufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgJCgnYm9keScpLmFkZENsYXNzKCdub19zY3JvbGwnKTtcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0JykuYWRkQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdC1vcGVuJyk7XG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLmFkZENsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUtb3BlbicpO1xuICB9KTtcbiAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdC1jbG9zZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQnKS5yZW1vdmVDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LW9wZW4nKTtcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZS1vcGVuJyk7XG4gIH0pO1xufSkoKTtcbiIsIi8vd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbnNoYXJlNDIgPSBmdW5jdGlvbiAoKXtcbiAgZT1kb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzaGFyZTQyaW5pdCcpO1xuICBmb3IgKHZhciBrID0gMDsgayA8IGUubGVuZ3RoOyBrKyspIHtcbiAgICB2YXIgdSA9IFwiXCI7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXNvY2lhbHMnKSAhPSAtMSlcbiAgICAgIHZhciBzb2NpYWxzID0gSlNPTi5wYXJzZSgnWycrZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29jaWFscycpKyddJyk7XG4gICAgdmFyIGljb25fdHlwZT1lW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXR5cGUnKSAhPSAtMT9lW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXR5cGUnKTonJztcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXJsJykgIT0gLTEpXG4gICAgICB1ID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXJsJyk7XG4gICAgdmFyIHByb21vID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvbW8nKTtcbiAgICBpZihwcm9tbyA9PSAtMSkge1xuICAgICAgdmFyIGtleSA9ICdwcm9tbz0nLFxuICAgICAgICBwcm9tb1N0YXJ0ID0gdS5pbmRleE9mKGtleSksXG4gICAgICAgIHByb21vRW5kID0gdS5pbmRleE9mKCcmJywgcHJvbW9TdGFydCksXG4gICAgICAgIHByb21vTGVuZ3RoID0gcHJvbW9FbmQgPiBwcm9tb1N0YXJ0ID8gcHJvbW9FbmQgLSBwcm9tb1N0YXJ0IC0ga2V5Lmxlbmd0aCA6IHUubGVuZ3RoIC0gcHJvbW9TdGFydCAtIGtleS5sZW5ndGg7XG4gICAgICBpZihwcm9tb1N0YXJ0ID4gMCkge1xuICAgICAgICBwcm9tbyA9IHUuc3Vic3RyKHByb21vU3RhcnQgKyBrZXkubGVuZ3RoLCBwcm9tb0xlbmd0aCk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBzZWxmX3Byb21vID0gcHJvbW8gIT0tMSA/IFwic2V0VGltZW91dChmdW5jdGlvbigpe3NlbmRfcHJvbW8oJ1wiK3Byb21vK1wiJyl9LDIwMDApO1wiIDogXCJcIjtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi1zaXplJykgIT0gLTEpXG4gICAgICB2YXIgaWNvbl9zaXplID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWNvbi1zaXplJyk7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJykgIT0gLTEpXG4gICAgICB2YXIgdCA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJyk7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWltYWdlJykgIT0gLTEpXG4gICAgICB2YXIgaSA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWltYWdlJyk7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWRlc2NyaXB0aW9uJykgIT0gLTEpXG4gICAgICB2YXIgZCA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWRlc2NyaXB0aW9uJyk7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLXBhdGgnKSAhPSAtMSlcbiAgICAgIHZhciBmID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF0aCcpO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29ucy1maWxlJykgIT0gLTEpXG4gICAgICB2YXIgZm4gPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29ucy1maWxlJyk7XG4gICAgaWYgKCFmKSB7XG4gICAgICBmdW5jdGlvbiBwYXRoKG5hbWUpIHtcbiAgICAgICAgdmFyIHNjID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpXG4gICAgICAgICAgLCBzciA9IG5ldyBSZWdFeHAoJ14oLiovfCkoJyArIG5hbWUgKyAnKShbIz9dfCQpJyk7XG4gICAgICAgIGZvciAodmFyIHAgPSAwLCBzY0wgPSBzYy5sZW5ndGg7IHAgPCBzY0w7IHArKykge1xuICAgICAgICAgIHZhciBtID0gU3RyaW5nKHNjW3BdLnNyYykubWF0Y2goc3IpO1xuICAgICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgICBpZiAobVsxXS5tYXRjaCgvXigoaHR0cHM/fGZpbGUpXFw6XFwvezIsfXxcXHc6W1xcL1xcXFxdKS8pKVxuICAgICAgICAgICAgICByZXR1cm4gbVsxXTtcbiAgICAgICAgICAgIGlmIChtWzFdLmluZGV4T2YoXCIvXCIpID09IDApXG4gICAgICAgICAgICAgIHJldHVybiBtWzFdO1xuICAgICAgICAgICAgYiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdiYXNlJyk7XG4gICAgICAgICAgICBpZiAoYlswXSAmJiBiWzBdLmhyZWYpXG4gICAgICAgICAgICAgIHJldHVybiBiWzBdLmhyZWYgKyBtWzFdO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUubWF0Y2goLyguKltcXC9cXFxcXSkvKVswXSArIG1bMV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZiA9IHBhdGgoJ3NoYXJlNDIuanMnKTtcbiAgICB9XG4gICAgaWYgKCF1KVxuICAgICAgdSA9IGxvY2F0aW9uLmhyZWY7XG4gICAgaWYgKCF0KVxuICAgICAgdCA9IGRvY3VtZW50LnRpdGxlO1xuICAgIGlmICghZm4pXG4gICAgICBmbiA9ICdpY29ucy5wbmcnO1xuICAgIGZ1bmN0aW9uIGRlc2MoKSB7XG4gICAgICB2YXIgbWV0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtZXRhJyk7XG4gICAgICBmb3IgKHZhciBtID0gMDsgbSA8IG1ldGEubGVuZ3RoOyBtKyspIHtcbiAgICAgICAgaWYgKG1ldGFbbV0ubmFtZS50b0xvd2VyQ2FzZSgpID09ICdkZXNjcmlwdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gbWV0YVttXS5jb250ZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGlmICghZClcbiAgICAgIGQgPSBkZXNjKCk7XG4gICAgdSA9IGVuY29kZVVSSUNvbXBvbmVudCh1KTtcbiAgICB0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHQpO1xuICAgIHQgPSB0LnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XG4gICAgaSA9IGVuY29kZVVSSUNvbXBvbmVudChpKTtcbiAgICB2YXIgZF9vcmlnPWQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcbiAgICBkID0gZW5jb2RlVVJJQ29tcG9uZW50KGQpO1xuICAgIGQgPSBkLnJlcGxhY2UoL1xcJy9nLCAnJTI3Jyk7XG4gICAgdmFyIGZiUXVlcnkgPSAndT0nICsgdTtcbiAgICBpZiAoaSAhPSAnbnVsbCcgJiYgaSAhPSAnJylcbiAgICAgIGZiUXVlcnkgPSAncz0xMDAmcFt1cmxdPScgKyB1ICsgJyZwW3RpdGxlXT0nICsgdCArICcmcFtzdW1tYXJ5XT0nICsgZCArICcmcFtpbWFnZXNdWzBdPScgKyBpO1xuICAgIHZhciB2a0ltYWdlID0gJyc7XG4gICAgaWYgKGkgIT0gJ251bGwnICYmIGkgIT0gJycpXG4gICAgICB2a0ltYWdlID0gJyZpbWFnZT0nICsgaTtcbiAgICB2YXIgcyA9IG5ldyBBcnJheShcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwiZmJcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT0nICsgdSArJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgRmFjZWJvb2tcIicsXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInZrXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy92ay5jb20vc2hhcmUucGhwP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyB2a0ltYWdlICsgJyZkZXNjcmlwdGlvbj0nICsgZCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCSINCa0L7QvdGC0LDQutGC0LVcIicsXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cIm9ka2xcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL2Nvbm5lY3Qub2sucnUvb2ZmZXI/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICcmZGVzY3JpcHRpb249JysgZCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIg0J7QtNC90L7QutC70LDRgdGB0L3QuNC60LhcIicsXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInR3aVwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9JyArIHQgKyAnJnVybD0nICsgdSArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIgVHdpdHRlclwiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwiZ3BsdXNcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3BsdXMuZ29vZ2xlLmNvbS9zaGFyZT91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgR29vZ2xlK1wiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwibWFpbFwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vY29ubmVjdC5tYWlsLnJ1L3NoYXJlP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnJmRlc2NyaXB0aW9uPScgKyBkICsgJyZpbWFnZXVybD0nICsgaSArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NTUwLCBoZWlnaHQ9NDQwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyINCc0L7QtdC8INCc0LjRgNC1QE1haWwuUnVcIicsXG4gICAgICAnXCIvL3d3dy5saXZlam91cm5hbC5jb20vdXBkYXRlLmJtbD9ldmVudD0nICsgdSArICcmc3ViamVjdD0nICsgdCArICdcIiB0aXRsZT1cItCe0L/Rg9Cx0LvQuNC60L7QstCw0YLRjCDQsiBMaXZlSm91cm5hbFwiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwicGluXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9waW50ZXJlc3QuY29tL3Bpbi9jcmVhdGUvYnV0dG9uLz91cmw9JyArIHUgKyAnJm1lZGlhPScgKyBpICsgJyZkZXNjcmlwdGlvbj0nICsgdCArICdcXCcsIFxcJ19ibGFua1xcJywgXFwnc2Nyb2xsYmFycz0wLCByZXNpemFibGU9MSwgbWVudWJhcj0wLCBsZWZ0PTEwMCwgdG9wPTEwMCwgd2lkdGg9NjAwLCBoZWlnaHQ9MzAwLCB0b29sYmFyPTAsIHN0YXR1cz0wXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCU0L7QsdCw0LLQuNGC0Ywg0LIgUGludGVyZXN0XCInLFxuICAgICAgJ1wiXCIgb25jbGljaz1cInJldHVybiBmYXYodGhpcyk7XCIgdGl0bGU9XCLQodC+0YXRgNCw0L3QuNGC0Ywg0LIg0LjQt9Cx0YDQsNC90L3QvtC1INCx0YDQsNGD0LfQtdGA0LBcIicsXG4gICAgICAnXCIjXCIgb25jbGljaz1cInByaW50KCk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQoNCw0YHQv9C10YfQsNGC0LDRgtGMXCInLFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJ0ZWxlZ3JhbVwiIG9uY2xpY2s9XCJ3aW5kb3cub3BlbihcXCcvL3RlbGVncmFtLm1lL3NoYXJlL3VybD91cmw9JyArIHUgKycmdGV4dD0nICsgdCArICdcXCcsIFxcJ3RlbGVncmFtXFwnLCBcXCd3aWR0aD01NTAsaGVpZ2h0PTQ0MCxsZWZ0PTEwMCx0b3A9MTAwXFwnKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIFRlbGVncmFtXCInLFxuICAgICAgJ1widmliZXI6Ly9mb3J3YXJkP3RleHQ9JysgdSArJyAtICcgKyB0ICsgJ1wiIGRhdGEtY291bnQ9XCJ2aWJlclwiIHJlbD1cIm5vZm9sbG93IG5vb3BlbmVyXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBWaWJlclwiJyxcbiAgICAgICdcIndoYXRzYXBwOi8vc2VuZD90ZXh0PScrIHUgKycgLSAnICsgdCArICdcIiBkYXRhLWNvdW50PVwid2hhdHNhcHBcIiByZWw9XCJub2ZvbGxvdyBub29wZW5lclwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgV2hhdHNBcHBcIidcblxuICAgICk7XG5cbiAgICB2YXIgbCA9ICcnO1xuXG4gICAgaWYoc29jaWFscy5sZW5ndGg+MSl7XG4gICAgICBmb3IgKHEgPSAwOyBxIDwgc29jaWFscy5sZW5ndGg7IHErKyl7XG4gICAgICAgIGo9c29jaWFsc1txXTtcbiAgICAgICAgbCArPSAnPGEgcmVsPVwibm9mb2xsb3dcIiBocmVmPScgKyBzW2pdICsgJyB0YXJnZXQ9XCJfYmxhbmtcIiAnK2dldEljb24oc1tqXSxqLGljb25fdHlwZSxmLGZuLGljb25fc2l6ZSkrJz48L2E+JztcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGZvciAoaiA9IDA7IGogPCBzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGwgKz0gJzxhIHJlbD1cIm5vZm9sbG93XCIgaHJlZj0nICsgc1tqXSArICcgdGFyZ2V0PVwiX2JsYW5rXCIgJytnZXRJY29uKHNbal0saixpY29uX3R5cGUsZixmbixpY29uX3NpemUpKyc+PC9hPic7XG4gICAgICB9XG4gICAgfVxuICAgIGVba10uaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPVwic2hhcmU0Ml93cmFwXCI+JyArIGwgKyAnPC9zcGFuPic7XG4gIH1cbiAgXG4vL30sIGZhbHNlKTtcbn0oKTtcblxuZnVuY3Rpb24gZ2V0SWNvbihzLGosdCxmLGZuLHNpemUpIHtcbiAgaWYoIXNpemUpe1xuICAgIHNpemU9MzI7XG4gIH1cbiAgaWYodD09J2Nzcycpe1xuICAgIGo9cy5pbmRleE9mKCdkYXRhLWNvdW50PVwiJykrMTI7XG4gICAgdmFyIGw9cy5pbmRleE9mKCdcIicsaiktajtcbiAgICB2YXIgbDI9cy5pbmRleE9mKCcuJyxqKS1qO1xuICAgIGw9bD5sMiAmJiBsMj4wID9sMjpsO1xuICAgIC8vdmFyIGljb249J2NsYXNzPVwic29jLWljb24gaWNvbi0nK3Muc3Vic3RyKGosbCkrJ1wiJztcbiAgICB2YXIgaWNvbj0nY2xhc3M9XCJzb2MtaWNvbi1zZCBpY29uLXNkLScrcy5zdWJzdHIoaixsKSsnXCInO1xuICB9ZWxzZSBpZih0PT0nc3ZnJyl7XG4gICAgdmFyIHN2Zz1bXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMTEuOTQsMTc3LjA4KVwiIGQ9XCJNMCAwIDAgNzAuMyAyMy42IDcwLjMgMjcuMSA5Ny43IDAgOTcuNyAwIDExNS4yQzAgMTIzLjIgMi4yIDEyOC42IDEzLjYgMTI4LjZMMjguMSAxMjguNiAyOC4xIDE1My4xQzI1LjYgMTUzLjQgMTcgMTU0LjIgNi45IDE1NC4yLTE0IDE1NC4yLTI4LjMgMTQxLjQtMjguMyAxMTcuOUwtMjguMyA5Ny43LTUyIDk3LjctNTIgNzAuMy0yOC4zIDcwLjMtMjguMyAwIDAgMFpcIi8+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDk4LjI3NCwxNDUuNTIpXCIgZD1cIk0wIDAgOS42IDBDOS42IDAgMTIuNSAwLjMgMTQgMS45IDE1LjQgMy40IDE1LjMgNi4xIDE1LjMgNi4xIDE1LjMgNi4xIDE1LjEgMTkgMjEuMSAyMSAyNyAyMi44IDM0LjYgOC41IDQyLjcgMyA0OC43LTEuMiA1My4zLTAuMyA1My4zLTAuM0w3NC44IDBDNzQuOCAwIDg2LjEgMC43IDgwLjcgOS41IDgwLjMgMTAuMyA3Ny42IDE2LjEgNjQuOCAyOCA1MS4zIDQwLjUgNTMuMSAzOC41IDY5LjMgNjAuMSA3OS4yIDczLjMgODMuMiA4MS40IDgxLjkgODQuOCA4MC44IDg4LjEgNzMuNSA4Ny4yIDczLjUgODcuMkw0OS4zIDg3LjFDNDkuMyA4Ny4xIDQ3LjUgODcuMyA0Ni4yIDg2LjUgNDQuOSA4NS43IDQ0IDgzLjkgNDQgODMuOSA0NCA4My45IDQwLjIgNzMuNyAzNS4xIDY1LjEgMjQuMyA0Ni44IDIwIDQ1LjggMTguMyA0Ni45IDE0LjIgNDkuNiAxNS4yIDU3LjYgMTUuMiA2My4yIDE1LjIgODEgMTcuOSA4OC40IDkuOSA5MC4zIDcuMyA5MC45IDUuNCA5MS4zLTEuNCA5MS40LTEwIDkxLjUtMTcuMyA5MS40LTIxLjQgODkuMy0yNC4yIDg4LTI2LjMgODUtMjUgODQuOC0yMy40IDg0LjYtMTkuOCA4My44LTE3LjkgODEuMi0xNS40IDc3LjktMTUuNSA3MC4zLTE1LjUgNzAuMy0xNS41IDcwLjMtMTQuMSA0OS40LTE4LjggNDYuOC0yMi4xIDQ1LTI2LjUgNDguNy0zNi4xIDY1LjMtNDEuMSA3My44LTQ0LjggODMuMi00NC44IDgzLjItNDQuOCA4My4yLTQ1LjUgODQuOS00Ni44IDg1LjktNDguMyA4Ny01MC41IDg3LjQtNTAuNSA4Ny40TC03My41IDg3LjJDLTczLjUgODcuMi03Ni45IDg3LjEtNzguMiA4NS42LTc5LjMgODQuMy03OC4zIDgxLjUtNzguMyA4MS41LTc4LjMgODEuNS02MC4zIDM5LjQtMzkuOSAxOC4yLTIxLjItMS4zIDAgMCAwIDBcIi8+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHZlcnNpb249XCIxLjFcIiB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgxMDYuODgsMTgzLjYxKVwiPjxnIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgtNi44ODA1LC0xMDApXCIgc3R5bGU9XCJzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCI+PHBhdGggZD1cIk0gMCwwIEMgOC4xNDYsMCAxNC43NjksLTYuNjI1IDE0Ljc2OSwtMTQuNzcgMTQuNzY5LC0yMi45MDcgOC4xNDYsLTI5LjUzMyAwLC0yOS41MzMgLTguMTM2LC0yOS41MzMgLTE0Ljc2OSwtMjIuOTA3IC0xNC43NjksLTE0Ljc3IC0xNC43NjksLTYuNjI1IC04LjEzNiwwIDAsMCBNIDAsLTUwLjQyOSBDIDE5LjY3NiwtNTAuNDI5IDM1LjY3LC0zNC40MzUgMzUuNjcsLTE0Ljc3IDM1LjY3LDQuOTAzIDE5LjY3NiwyMC45MDMgMCwyMC45MDMgLTE5LjY3MSwyMC45MDMgLTM1LjY2OSw0LjkwMyAtMzUuNjY5LC0xNC43NyAtMzUuNjY5LC0zNC40MzUgLTE5LjY3MSwtNTAuNDI5IDAsLTUwLjQyOVwiIHN0eWxlPVwiZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLW9wYWNpdHk6MVwiLz48L2c+PGcgdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDcuNTUxNiwtNTQuNTc3KVwiIHN0eWxlPVwic3Ryb2tlOm5vbmU7c3Ryb2tlLW9wYWNpdHk6MVwiPjxwYXRoIGQ9XCJNIDAsMCBDIDcuMjYyLDEuNjU1IDE0LjI2NCw0LjUyNiAyMC43MTQsOC41NzggMjUuNTk1LDExLjY1NCAyNy4wNjYsMTguMTA4IDIzLjk5LDIyLjk4OSAyMC45MTcsMjcuODgxIDE0LjQ2OSwyOS4zNTIgOS41NzksMjYuMjc1IC01LjAzMiwxNy4wODYgLTIzLjg0MywxNy4wOTIgLTM4LjQ0NiwyNi4yNzUgLTQzLjMzNiwyOS4zNTIgLTQ5Ljc4NCwyNy44ODEgLTUyLjg1MiwyMi45ODkgLTU1LjkyOCwxOC4xMDQgLTU0LjQ2MSwxMS42NTQgLTQ5LjU4LDguNTc4IC00My4xMzIsNC41MzEgLTM2LjEyOCwxLjY1NSAtMjguODY3LDAgTCAtNDguODA5LC0xOS45NDEgQyAtNTIuODg2LC0yNC4wMjIgLTUyLjg4NiwtMzAuNjM5IC00OC44MDUsLTM0LjcyIC00Ni43NjIsLTM2Ljc1OCAtNDQuMDksLTM3Ljc3OSAtNDEuNDE4LC0zNy43NzkgLTM4Ljc0MiwtMzcuNzc5IC0zNi4wNjUsLTM2Ljc1OCAtMzQuMDIzLC0zNC43MiBMIC0xNC40MzYsLTE1LjEyMyA1LjE2OSwtMzQuNzIgQyA5LjI0NiwtMzguODAxIDE1Ljg2MiwtMzguODAxIDE5Ljk0MywtMzQuNzIgMjQuMDI4LC0zMC42MzkgMjQuMDI4LC0yNC4wMTkgMTkuOTQzLC0xOS45NDEgTCAwLDAgWlwiIHN0eWxlPVwiZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLW9wYWNpdHk6MVwiLz48L2c+PC9nPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxNjkuNzYsNTYuNzI3KVwiIGQ9XCJNMCAwQy01LjEtMi4zLTEwLjYtMy44LTE2LjQtNC41LTEwLjUtMS02IDQuNi0zLjkgMTEuMy05LjQgOC0xNS41IDUuNy0yMiA0LjQtMjcuMyA5LjktMzQuNyAxMy40LTQyLjkgMTMuNC01OC43IDEzLjQtNzEuNiAwLjYtNzEuNi0xNS4yLTcxLjYtMTcuNC03MS4zLTE5LjYtNzAuOC0yMS43LTk0LjYtMjAuNS0xMTUuNy05LjEtMTI5LjggOC4yLTEzMi4zIDQtMTMzLjctMS0xMzMuNy02LjItMTMzLjctMTYuMS0xMjguNi0yNC45LTEyMC45LTMwLTEyNS42LTI5LjktMTMwLjEtMjguNi0xMzMuOS0yNi41LTEzMy45LTI2LjYtMTMzLjktMjYuNy0xMzMuOS0yNi44LTEzMy45LTQwLjctMTI0LTUyLjMtMTExLTU0LjktMTEzLjQtNTUuNS0xMTUuOS01NS45LTExOC41LTU1LjktMTIwLjMtNTUuOS0xMjIuMS01NS43LTEyMy45LTU1LjQtMTIwLjItNjYuNy0xMDkuNy03NS05Ny4xLTc1LjMtMTA2LjktODIuOS0xMTkuMy04Ny41LTEzMi43LTg3LjUtMTM1LTg3LjUtMTM3LjMtODcuNC0xMzkuNS04Ny4xLTEyNi44LTk1LjItMTExLjgtMTAwLTk1LjYtMTAwLTQzLTEwMC0xNC4yLTU2LjMtMTQuMi0xOC41LTE0LjItMTcuMy0xNC4yLTE2LTE0LjMtMTQuOC04LjctMTAuOC0zLjgtNS43IDAgMFwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMSAwIDAgLTEgNzIuMzgxIDkwLjE3MilcIj48cGF0aCBkPVwiTTg3LjIgMCA4Ny4yIDE3LjEgNzUgMTcuMSA3NSAwIDU3LjkgMCA1Ny45LTEyLjIgNzUtMTIuMiA3NS0yOS4zIDg3LjItMjkuMyA4Ny4yLTEyLjIgMTA0LjMtMTIuMiAxMDQuMyAwIDg3LjIgMFpcIi8+PHBhdGggZD1cIk0wIDAgMC0xOS42IDI2LjItMTkuNkMyNS40LTIzLjcgMjMuOC0yNy41IDIwLjgtMzAuNiAxMC4zLTQyLjEtOS4zLTQyLTIwLjUtMzAuNC0zMS43LTE4LjktMzEuNi0wLjMtMjAuMiAxMS4xLTkuNCAyMS45IDggMjIuNCAxOC42IDEyLjFMMTguNSAxMi4xIDMyLjggMjYuNEMxMy43IDQzLjgtMTUuOCA0My41LTM0LjUgMjUuMS01My44IDYuMS01NC0yNS0zNC45LTQ0LjMtMTUuOS02My41IDE3LjEtNjMuNyAzNC45LTQ0LjYgNDUuNi0zMyA0OC43LTE2LjQgNDYuMiAwTDAgMFpcIi8+PC9nPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw5Ny42NzYsNjIuNDExKVwiIGQ9XCJNMCAwQzEwLjIgMCAxOS45LTQuNSAyNi45LTExLjZMMjYuOS0xMS42QzI2LjktOC4yIDI5LjItNS43IDMyLjQtNS43TDMzLjItNS43QzM4LjItNS43IDM5LjItMTAuNCAzOS4yLTExLjlMMzkuMi02NC44QzM4LjktNjguMiA0Mi44LTcwIDQ1LTY3LjggNTMuNS01OS4xIDYzLjYtMjIuOSAzOS43LTIgMTcuNCAxNy42LTEyLjUgMTQuMy0yOC41IDMuNC00NS40LTguMy01Ni4yLTM0LjEtNDUuNy01OC40LTM0LjItODQuOS0xLjQtOTIuOCAxOC4xLTg0LjkgMjgtODAuOSAzMi41LTk0LjMgMjIuMy05OC42IDYuOC0xMDUuMi0zNi40LTEwNC41LTU2LjUtNjkuNi03MC4xLTQ2LjEtNjkuNC00LjYtMzMuMyAxNi45LTUuNyAzMy4zIDMwLjcgMjguOCA1Mi43IDUuOCA3NS42LTE4LjIgNzQuMy02MyA1MS45LTgwLjUgNDEuOC04OC40IDI2LjctODAuNyAyNi44LTY5LjJMMjYuNy02NS40QzE5LjYtNzIuNCAxMC4yLTc2LjUgMC03Ni41LTIwLjItNzYuNS0zOC01OC43LTM4LTM4LjQtMzgtMTgtMjAuMiAwIDAgME0yNS41LTM3QzI0LjctMjIuMiAxMy43LTEzLjMgMC40LTEzLjNMLTAuMS0xMy4zQy0xNS40LTEzLjMtMjMuOS0yNS4zLTIzLjktMzktMjMuOS01NC4zLTEzLjYtNjQtMC4xLTY0IDE0LjktNjQgMjQuOC01MyAyNS41LTQwTDI1LjUtMzdaXCIvPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgwLjQyNjIzIDAgMCAwLjQyNjIzIDM0Ljk5OSAzNSlcIj48cGF0aCBkPVwiTTE2MC43IDE5LjVjLTE4LjkgMC0zNy4zIDMuNy01NC43IDEwLjlMNzYuNCAwLjdjLTAuOC0wLjgtMi4xLTEtMy4xLTAuNEM0NC40IDE4LjIgMTkuOCA0Mi45IDEuOSA3MS43Yy0wLjYgMS0wLjUgMi4zIDAuNCAzLjFsMjguNCAyOC40Yy04LjUgMTguNi0xMi44IDM4LjUtMTIuOCA1OS4xIDAgNzguNyA2NCAxNDIuOCAxNDIuOCAxNDIuOCA3OC43IDAgMTQyLjgtNjQgMTQyLjgtMTQyLjhDMzAzLjQgODMuNSAyMzkuNCAxOS41IDE2MC43IDE5LjV6TTIxNy4yIDE0OC43bDkuOSA0Mi4xIDkuNSA0NC40IC00NC4zLTkuNSAtNDIuMS05LjlMMzYuNyAxMDIuMWMxNC4zLTI5LjMgMzguMy01Mi42IDY4LjEtNjUuOEwyMTcuMiAxNDguN3pcIi8+PHBhdGggZD1cIk0yMjEuOCAxODcuNGwtNy41LTMzYy0yNS45IDExLjktNDYuNCAzMi40LTU4LjMgNTguM2wzMyA3LjVDMTk2IDIwNi4yIDIwNy43IDE5NC40IDIyMS44IDE4Ny40elwiLz48L2c+PC9zdmc+JyxcbiAgICAgICcnLC8vcGluXG4gICAgICAnJywvL2ZhdlxuICAgICAgJycsLy9wcmludFxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsNzEuMjY0LDEwNi45MylcIiBkPVwiTTAgMCA2OC42IDQzLjFDNzIgNDUuMyA3My4xIDQyLjggNzEuNiA0MS4xTDE0LjYtMTAuMiAxMS43LTM1LjggMCAwWk04Ny4xIDYyLjktMzMuNCAxNy4yQy00MCAxNS4zLTM5LjggOC44LTM0LjkgNy4zTC00LjctMi4yIDYuOC0zNy42QzguMi00MS41IDkuNC00Mi45IDExLjgtNDMgMTQuMy00MyAxNS4zLTQyLjEgMTcuOS0zOS44IDIwLjktMzYuOSAyNS42LTMyLjMgMzMtMjUuMkw2NC40LTQ4LjRDNzAuMi01MS42IDc0LjMtNDkuOSA3NS44LTQzTDk1LjUgNTQuNEM5Ny42IDYyLjkgOTIuNiA2NS40IDg3LjEgNjIuOVwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsMTM1LjMzLDExOS44NSlcIiBkPVwiTTAgMEMtMi40LTUuNC02LjUtOS0xMi4yLTEwLjYtMTQuMy0xMS4yLTE2LjMtMTAuNy0xOC4yLTkuOS00NC40IDEuMi02My4zIDE5LjYtNzQgNDYuMi03NC44IDQ4LjEtNzUuMyA1MC4xLTc1LjIgNTEuOS03NS4yIDU4LjctNjkuMiA2NS02Mi42IDY1LjQtNjAuOCA2NS41LTU5LjIgNjQuOS01Ny45IDYzLjctNTMuMyA1OS4zLTQ5LjYgNTQuMy00Ni45IDQ4LjYtNDUuNCA0NS41LTQ2IDQzLjMtNDguNyA0MS4xLTQ5LjEgNDAuNy00OS41IDQwLjQtNTAgNDAuMS01My41IDM3LjUtNTQuMyAzNC45LTUyLjYgMzAuOC00OS44IDI0LjItNDUuNCAxOS0zOS4zIDE1LjEtMzcgMTMuNi0zNC43IDEyLjItMzIgMTEuNS0yOS42IDEwLjgtMjcuNyAxMS41LTI2LjEgMTMuNC0yNS45IDEzLjYtMjUuOCAxMy45LTI1LjYgMTQuMS0yMi4zIDE4LjgtMTguNiAxOS42LTEzLjcgMTYuNS05LjYgMTMuOS01LjYgMTEtMS44IDcuOCAwLjcgNS42IDEuMyAzIDAgME0tMTguMiAzNi43Qy0xOC4zIDM1LjktMTguMyAzNS40LTE4LjQgMzQuOS0xOC42IDM0LTE5LjIgMzMuNC0yMC4yIDMzLjQtMjEuMyAzMy40LTIxLjkgMzQtMjIuMiAzNC45LTIyLjMgMzUuNS0yMi40IDM2LjItMjIuNSAzNi45LTIzLjIgNDAuMy0yNS4yIDQyLjYtMjguNiA0My42LTI5LjEgNDMuNy0yOS41IDQzLjctMjkuOSA0My44LTMxIDQ0LjEtMzIuNCA0NC4yLTMyLjQgNDUuOC0zMi41IDQ3LjEtMzEuNSA0Ny45LTI5LjYgNDgtMjguNCA0OC4xLTI2LjUgNDcuNS0yNS40IDQ2LjktMjAuOSA0NC43LTE4LjcgNDEuNi0xOC4yIDM2LjdNLTI1LjUgNTEuMkMtMjggNTIuMS0zMC41IDUyLjgtMzMuMiA1My4yLTM0LjUgNTMuNC0zNS40IDU0LjEtMzUuMSA1NS42LTM0LjkgNTctMzQgNTcuNS0zMi42IDU3LjQtMjQgNTYuNi0xNy4zIDUzLjQtMTIuNiA0Ni0xMC41IDQyLjUtOS4yIDM3LjUtOS40IDMzLjgtOS41IDMxLjItOS45IDMwLjUtMTEuNCAzMC41LTEzLjYgMzAuNi0xMy4zIDMyLjQtMTMuNSAzMy43LTEzLjcgMzUuNy0xNC4yIDM3LjctMTQuNyAzOS43LTE2LjMgNDUuNC0xOS45IDQ5LjMtMjUuNSA1MS4yTS0zOCA2NC40Qy0zNy45IDY1LjktMzcgNjYuNS0zNS41IDY2LjQtMjMuMiA2NS44LTEzLjkgNjIuMi02LjcgNTIuNS0yLjUgNDYuOS0wLjIgMzkuMiAwIDMyLjIgMCAzMS4xIDAgMzAgMCAyOS0wLjEgMjcuOC0wLjYgMjYuOS0xLjkgMjYuOS0zLjIgMjYuOS0zLjkgMjcuNi00IDI5LTQuMyAzNC4yLTUuMyAzOS4zLTcuMyA0NC4xLTExLjIgNTMuNS0xOC42IDU4LjYtMjguMSA2MS4xLTMwLjcgNjEuNy0zMy4yIDYyLjItMzUuOCA2Mi41LTM3IDYyLjUtMzggNjIuOC0zOCA2NC40TTExLjUgNzQuMUM2LjYgNzguMyAwLjkgODAuOC01LjMgODIuNC0yMC44IDg2LjUtMzYuNSA4Ny41LTUyLjQgODUuMy02MC41IDg0LjItNjguMyA4Mi4xLTc1LjQgNzguMS04My44IDczLjQtODkuNiA2Ni42LTkyLjIgNTcuMS05NCA1MC40LTk0LjkgNDMuNi05NS4yIDM2LjYtOTUuNyAyNi40LTk1LjQgMTYuMy05Mi44IDYuMy04OS44LTUuMy04My4yLTEzLjgtNzEuOS0xOC4zLTcwLjctMTguOC02OS41LTE5LjUtNjguMy0yMC02Ny4yLTIwLjQtNjYuOC0yMS4yLTY2LjgtMjIuNC02Ni45LTMwLjQtNjYuOC0zOC40LTY2LjgtNDYuNy02My45LTQzLjktNjEuOC00MS44LTYwLjMtNDAuMS01NS45LTM1LjEtNTEuNy0zMC45LTQ3LjEtMjYuMS00NC43LTIzLjctNDUuNy0yMy44LTQyLjEtMjMuOC0zNy44LTIzLjktMzEtMjQuMS0yNi44LTIzLjgtMTguNi0yMy4xLTEwLjYtMjIuMS0yLjctMTkuNyA3LjItMTYuNyAxNS4yLTExLjQgMTkuMi0xLjMgMjAuMyAxLjMgMjEuNCA0IDIyIDYuOCAyNS45IDIyLjkgMjUuNCAzOC45IDIyLjIgNTUgMjAuNiA2Mi40IDE3LjUgNjkgMTEuNSA3NC4xXCIvPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMzAuODQsMTEyLjcpXCIgZD1cIk0wIDBDLTEuNiAwLjktOS40IDUuMS0xMC44IDUuNy0xMi4zIDYuMy0xMy40IDYuNi0xNC41IDUtMTUuNiAzLjQtMTguOS0wLjEtMTkuOS0xLjEtMjAuOC0yLjItMjEuOC0yLjMtMjMuNC0xLjQtMjUtMC41LTMwLjEgMS40LTM2LjEgNy4xLTQwLjcgMTEuNS00My43IDE3LTQ0LjYgMTguNi00NS41IDIwLjMtNDQuNiAyMS4xLTQzLjggMjEuOS00MyAyMi42LTQyLjEgMjMuNy00MS4zIDI0LjYtNDAuNCAyNS41LTQwLjEgMjYuMi0zOS41IDI3LjItMzkgMjguMy0zOS4yIDI5LjMtMzkuNiAzMC4xLTM5LjkgMzAuOS00Mi45IDM5LTQ0LjEgNDIuMy00NS4zIDQ1LjUtNDYuNyA0NS00Ny42IDQ1LjEtNDguNiA0NS4xLTQ5LjYgNDUuMy01MC43IDQ1LjMtNTEuOCA0NS40LTUzLjYgNDUtNTUuMSA0My41LTU2LjYgNDEuOS02MSAzOC4yLTYxLjMgMzAuMi02MS42IDIyLjMtNTYuMSAxNC40LTU1LjMgMTMuMy01NC41IDEyLjItNDQuOC01LjEtMjguNi0xMi4xLTEyLjQtMTkuMi0xMi40LTE3LjEtOS40LTE2LjktNi40LTE2LjggMC4zLTEzLjQgMS44LTkuNiAzLjMtNS45IDMuNC0yLjcgMy0yIDIuNi0xLjMgMS42LTAuOSAwIDBNLTI5LjctMzguM0MtNDAuNC0zOC4zLTUwLjMtMzUuMS01OC42LTI5LjZMLTc4LjktMzYuMS03Mi4zLTE2LjVDLTc4LjYtNy44LTgyLjMgMi44LTgyLjMgMTQuNC04Mi4zIDQzLjQtNTguNyA2Ny4xLTI5LjcgNjcuMS0wLjYgNjcuMSAyMyA0My40IDIzIDE0LjQgMjMtMTQuNy0wLjYtMzguMy0yOS43LTM4LjNNLTI5LjcgNzcuNkMtNjQuNiA3Ny42LTkyLjkgNDkuMy05Mi45IDE0LjQtOTIuOSAyLjQtODkuNi04LjgtODMuOS0xOC4zTC05NS4zLTUyLjItNjAuMi00MUMtNTEuMi00Ni00MC44LTQ4LjktMjkuNy00OC45IDUuMy00OC45IDMzLjYtMjAuNiAzMy42IDE0LjQgMzMuNiA0OS4zIDUuMyA3Ny42LTI5LjcgNzcuNlwiLz48L3N2Zz4nLFxuICAgIF07XG4gICAgdmFyIGljb249c3ZnW2pdO1xuICAgIHZhciBjc3M9JyBzdHlsZT1cIndpZHRoOicrc2l6ZSsncHg7aGVpZ2h0Oicrc2l6ZSsncHhcIiAnO1xuICAgIGljb249JzxzdmcgY2xhc3M9XCJzb2MtaWNvbi1zZCBpY29uLXNkLXN2Z1wiJytjc3MraWNvbi5zdWJzdHJpbmcoNCk7XG4gICAgaWNvbj0nPicraWNvbi5zdWJzdHJpbmcoMCwgaWNvbi5sZW5ndGggLSAxKTtcbiAgfWVsc2V7XG4gICAgaWNvbj0nc3R5bGU9XCJkaXNwbGF5OmlubGluZS1ibG9jazt2ZXJ0aWNhbC1hbGlnbjpib3R0b207d2lkdGg6JytzaXplKydweDtoZWlnaHQ6JytzaXplKydweDttYXJnaW46MCA2cHggNnB4IDA7cGFkZGluZzowO291dGxpbmU6bm9uZTtiYWNrZ3JvdW5kOnVybCgnICsgZiArIGZuICsgJykgLScgKyBzaXplICogaiArICdweCAwIG5vLXJlcGVhdDsgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcIidcbiAgfVxuICByZXR1cm4gaWNvbjtcbn1cblxuZnVuY3Rpb24gZmF2KGEpIHtcbiAgdmFyIHRpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gIHZhciB1cmwgPSBkb2N1bWVudC5sb2NhdGlvbjtcbiAgdHJ5IHtcbiAgICB3aW5kb3cuZXh0ZXJuYWwuQWRkRmF2b3JpdGUodXJsLCB0aXRsZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0cnkge1xuICAgICAgd2luZG93LnNpZGViYXIuYWRkUGFuZWwodGl0bGUsIHVybCwgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmICh0eXBlb2YgKG9wZXJhKSA9PSAnb2JqZWN0JyB8fCB3aW5kb3cuc2lkZWJhcikge1xuICAgICAgICBhLnJlbCA9ICdzaWRlYmFyJztcbiAgICAgICAgYS50aXRsZSA9IHRpdGxlO1xuICAgICAgICBhLnVybCA9IHVybDtcbiAgICAgICAgYS5ocmVmID0gdXJsO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFsZXJ0KCfQndCw0LbQvNC40YLQtSBDdHJsLUQsINGH0YLQvtCx0Ysg0LTQvtCx0LDQstC40YLRjCDRgdGC0YDQsNC90LjRhtGDINCyINC30LDQutC70LDQtNC60LgnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBzZW5kX3Byb21vKHByb21vKXtcbiAgJC5hamF4KHtcbiAgICBtZXRob2Q6IFwicG9zdFwiLFxuICAgIHVybDogXCJhY2NvdW50L3Byb21vXCIsXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICBkYXRhOiB7cHJvbW86IHByb21vfSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZiAoZGF0YS50aXRsZSAhPSBudWxsICYmIGRhdGEubWVzc2FnZSAhPSBudWxsKSB7XG4gICAgICAgIG9uX3Byb21vPSQoJy5vbl9wcm9tbycpO1xuICAgICAgICBpZihvbl9wcm9tby5sZW5ndGg9PTAgfHwgIW9uX3Byb21vLmlzKCc6dmlzaWJsZScpKSB7XG4gICAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICB0aXRsZTogZGF0YS50aXRsZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGRhdGEubWVzc2FnZVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgb25fcHJvbW8uc2hvdygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cbiIsInZhciBub3RpZmljYXRpb24gPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgY29udGVpbmVyO1xuICB2YXIgbW91c2VPdmVyID0gMDtcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xuICB2YXIgdGltZSA9IDEwMDAwO1xuXG4gIHZhciBub3RpZmljYXRpb25fYm94ID0gZmFsc2U7XG4gIHZhciBpc19pbml0ID0gZmFsc2U7XG4gIHZhciBjb25maXJtX29wdCA9IHtcbiAgICB0aXRsZTogXCLQo9C00LDQu9C10L3QuNC1XCIsXG4gICAgcXVlc3Rpb246IFwi0JLRiyDQtNC10LnRgdGC0LLQuNGC0LXQu9GM0L3QviDRhdC+0YLQuNGC0LUg0YPQtNCw0LvQuNGC0Yw/XCIsXG4gICAgYnV0dG9uWWVzOiBcItCU0LBcIixcbiAgICBidXR0b25ObzogXCLQndC10YJcIixcbiAgICBjYWxsYmFja1llczogZmFsc2UsXG4gICAgY2FsbGJhY2tObzogZmFsc2UsXG4gICAgb2JqOiBmYWxzZSxcbiAgICBidXR0b25UYWc6ICdkaXYnLFxuICAgIGJ1dHRvblllc0RvcDogJycsXG4gICAgYnV0dG9uTm9Eb3A6ICcnLFxuICB9O1xuICB2YXIgYWxlcnRfb3B0ID0ge1xuICAgIHRpdGxlOiBcIlwiLFxuICAgIHF1ZXN0aW9uOiBcItCh0L7QvtCx0YnQtdC90LjQtVwiLFxuICAgIGJ1dHRvblllczogXCLQlNCwXCIsXG4gICAgY2FsbGJhY2tZZXM6IGZhbHNlLFxuICAgIGJ1dHRvblRhZzogJ2RpdicsXG4gICAgb2JqOiBmYWxzZSxcbiAgfTtcblxuICBmdW5jdGlvbiB0ZXN0SXBob25lKCkge1xuICAgIGlmICghLyhpUGhvbmV8aVBhZHxpUG9kKS4qKE9TIDExKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgcmV0dXJuXG4gICAgbm90aWZpY2F0aW9uX2JveC5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5jc3MoJ3RvcCcsICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgaXNfaW5pdCA9IHRydWU7XG4gICAgbm90aWZpY2F0aW9uX2JveCA9ICQoJy5ub3RpZmljYXRpb25fYm94Jyk7XG4gICAgaWYgKG5vdGlmaWNhdGlvbl9ib3gubGVuZ3RoID4gMClyZXR1cm47XG5cbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3ggPSAkKCcubm90aWZpY2F0aW9uX2JveCcpO1xuXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCAnLm5vdGlmeV9jb250cm9sJywgY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCAnLm5vdGlmeV9jbG9zZScsIGNsb3NlTW9kYWwpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgY2xvc2VNb2RhbEZvbik7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCkge1xuICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICAkKCcubm90aWZpY2F0aW9uX2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKCcnKVxuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbEZvbihlKSB7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBpZiAodGFyZ2V0LmNsYXNzTmFtZSA9PSBcIm5vdGlmaWNhdGlvbl9ib3hcIikge1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBfc2V0VXBMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubm90aWZpY2F0aW9uX2Nsb3NlJywgX2Nsb3NlUG9wdXApO1xuICAgICQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkVudGVyKTtcbiAgICAkKCdib2R5Jykub24oJ21vdXNlbGVhdmUnLCAnLm5vdGlmaWNhdGlvbl9jb250YWluZXInLCBfb25MZWF2ZSk7XG4gIH07XG5cbiAgdmFyIF9vbkVudGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwgIT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2xlYXJBbGwpO1xuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICB2YXIgb3B0aW9uID0gJCh0aGlzKS5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmIChvcHRpb24udGltZXIpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KG9wdGlvbi50aW1lcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgbW91c2VPdmVyID0gMTtcbiAgfTtcblxuICB2YXIgX29uTGVhdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgICR0aGlzID0gJCh0aGlzKTtcbiAgICAgIHZhciBvcHRpb24gPSAkdGhpcy5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmIChvcHRpb24udGltZSA+IDApIHtcbiAgICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKG9wdGlvbi5jbG9zZSksIG9wdGlvbi50aW1lIC0gMTUwMCArIDEwMCAqIGkpO1xuICAgICAgICAkdGhpcy5kYXRhKCdvcHRpb24nLCBvcHRpb24pXG4gICAgICB9XG4gICAgfSk7XG4gICAgbW91c2VPdmVyID0gMDtcbiAgfTtcblxuICB2YXIgX2Nsb3NlUG9wdXAgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCk7XG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbiAoKSB7XG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgIH0pO1xuICAgICR0aGlzLmFkZENsYXNzKCdub3RpZmljYXRpb25faGlkZScpXG4gIH07XG5cbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSkge1xuICAgIGlmICghZGF0YSlkYXRhID0ge307XG4gICAgZGF0YSA9IG9iamVjdHMoYWxlcnRfb3B0LCBkYXRhKTtcblxuICAgIGlmICghaXNfaW5pdClpbml0KCk7XG4gICAgdGVzdElwaG9uZSgpO1xuXG4gICAgbm90eWZ5X2NsYXNzID0gJ25vdGlmeV9ib3ggJztcbiAgICBpZiAoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzICs9IGRhdGEubm90eWZ5X2NsYXNzO1xuXG4gICAgYm94X2h0bWwgPSAnPGRpdiBjbGFzcz1cIicgKyBub3R5ZnlfY2xhc3MgKyAnXCI+JztcbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwgKz0gZGF0YS50aXRsZTtcbiAgICBib3hfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcblxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xuICAgIGJveF9odG1sICs9IGRhdGEucXVlc3Rpb247XG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBpZiAoZGF0YS5idXR0b25ZZXMgfHwgZGF0YS5idXR0b25Obykge1xuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzwnICsgZGF0YS5idXR0b25UYWcgKyAnIGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIiAnICsgZGF0YS5idXR0b25ZZXNEb3AgKyAnPicgKyBkYXRhLmJ1dHRvblllcyArICc8LycgKyBkYXRhLmJ1dHRvblRhZyArICc+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8JyArIGRhdGEuYnV0dG9uVGFnICsgJyBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIiAnICsgZGF0YS5idXR0b25Ob0RvcCArICc+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC8nICsgZGF0YS5idXR0b25UYWcgKyAnPic7XG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG4gICAgO1xuXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgfSwgMTAwKVxuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKSB7XG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcbiAgICBkYXRhID0gb2JqZWN0cyhjb25maXJtX29wdCwgZGF0YSk7XG5cbiAgICBpZiAoIWlzX2luaXQpaW5pdCgpO1xuICAgIHRlc3RJcGhvbmUoKTtcbiAgICAvL2JveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XG5cbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XG5cbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xuXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xuICAgIGJveF9odG1sICs9IGRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG5cbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG4gICAgaWYgKGRhdGEuY2FsbGJhY2tZZXMgIT0gZmFsc2UpIHtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5feWVzJykub24oJ2NsaWNrJywgZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuICAgIGlmIChkYXRhLmNhbGxiYWNrTm8gIT0gZmFsc2UpIHtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrTm8uYmluZChkYXRhLm9iaikpO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sIDEwMClcblxuICB9XG5cbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xuICAgIHZhciBvcHRpb24gPSB7dGltZTogKGRhdGEudGltZSB8fCBkYXRhLnRpbWUgPT09IDApID8gZGF0YS50aW1lIDogdGltZX07XG4gICAgaWYgKCFjb250ZWluZXIpIHtcbiAgICAgIGNvbnRlaW5lciA9ICQoJzx1bC8+Jywge1xuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcbiAgICAgIH0pO1xuXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XG4gICAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgICB9XG5cbiAgICB2YXIgbGkgPSAkKCc8bGkvPicsIHtcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2l0ZW0nXG4gICAgfSk7XG5cbiAgICBpZiAoZGF0YS50eXBlKSB7XG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XG4gICAgfVxuXG4gICAgdmFyIGNsb3NlID0gJCgnPHNwYW4vPicsIHtcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2Nsb3NlJ1xuICAgIH0pO1xuICAgIG9wdGlvbi5jbG9zZSA9IGNsb3NlO1xuICAgIGxpLmFwcGVuZChjbG9zZSk7XG5cbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicsIHtcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcbiAgICB9KTtcblxuICAgIGlmIChkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHRpdGxlID0gJCgnPGg1Lz4nLCB7XG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXG4gICAgICB9KTtcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XG4gICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSk7XG4gICAgfVxuXG4gICAgdmFyIHRleHQgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGV4dFwiXG4gICAgfSk7XG4gICAgdGV4dC5odG1sKGRhdGEubWVzc2FnZSk7XG5cbiAgICBpZiAoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXG4gICAgICB9KTtcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XG4gICAgICB2YXIgd3JhcCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwid3JhcFwiXG4gICAgICB9KTtcblxuICAgICAgd3JhcC5hcHBlbmQoaW1nKTtcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xuICAgICAgY29udGVudC5hcHBlbmQod3JhcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRleHQpO1xuICAgIH1cbiAgICBsaS5hcHBlbmQoY29udGVudCk7XG5cbiAgICAvL1xuICAgIC8vIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xuICAgIC8vICAgdmFyIHRpdGxlID0gJCgnPHAvPicsIHtcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcbiAgICAvLyAgIH0pO1xuICAgIC8vICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcbiAgICAvLyAgIGxpLmFwcGVuZCh0aXRsZSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcbiAgICAvLyAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxuICAgIC8vICAgfSk7XG4gICAgLy8gICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcbiAgICAvLyAgIGxpLmFwcGVuZChpbWcpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XG4gICAgLy8gICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcbiAgICAvLyB9KTtcbiAgICAvLyBjb250ZW50Lmh0bWwoZGF0YS5tZXNzYWdlKTtcbiAgICAvL1xuICAgIC8vIGxpLmFwcGVuZChjb250ZW50KTtcbiAgICAvL1xuICAgIGNvbnRlaW5lci5hcHBlbmQobGkpO1xuXG4gICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xuICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKGNsb3NlKSwgb3B0aW9uLnRpbWUpO1xuICAgIH1cbiAgICBsaS5kYXRhKCdvcHRpb24nLCBvcHRpb24pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFsZXJ0OiBhbGVydCxcbiAgICBjb25maXJtOiBjb25maXJtLFxuICAgIG5vdGlmaTogbm90aWZpLFxuICB9O1xuXG59KSgpO1xuXG5cbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkdGhpcyA9ICQodGhpcyk7XG4gIGVsID0gJCgkdGhpcy5hdHRyKCdocmVmJykpO1xuICBkYXRhID0gZWwuZGF0YSgpO1xuXG4gIGRhdGEucXVlc3Rpb24gPSBlbC5odG1sKCk7XG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcbn0pO1xuXG5cbiQoJy5kaXNhYmxlZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJHRoaXMgPSAkKHRoaXMpO1xuICBkYXRhID0gJHRoaXMuZGF0YSgpO1xuICBpZiAoZGF0YVsnYnV0dG9uX3llcyddKWRhdGFbJ2J1dHRvblllcyddID0gZGF0YVsnYnV0dG9uX3llcyddXG5cbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xufSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcubW9kYWxzX29wZW4nLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuXG4gICAgLy/Qv9GA0Lgg0L7RgtC60YDRi9GC0LjQuCDRhNC+0YDQvNGLINGA0LXQs9C40YHRgtGA0LDRhtC40Lgg0LfQsNC60YDRi9GC0YwsINC10YHQu9C4INC+0YLRgNGL0YLQviAtINC/0L7Qv9Cw0L8g0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40Y8g0LrRg9C/0L7QvdCwINCx0LXQtyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4XG4gICAgdmFyIHBvcHVwID0gJChcImFbaHJlZj0nI3Nob3dwcm9tb2NvZGUtbm9yZWdpc3RlciddXCIpLmRhdGEoJ3BvcHVwJyk7XG4gICAgaWYgKHBvcHVwKSB7XG4gICAgICBwb3B1cC5jbG9zZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb3B1cCA9ICQoJ2Rpdi5wb3B1cF9jb250LCBkaXYucG9wdXBfYmFjaycpO1xuICAgICAgaWYgKHBvcHVwKSB7XG4gICAgICAgIHBvcHVwLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaHJlZiA9IHRoaXMuaHJlZi5zcGxpdCgnIycpO1xuICAgIGhyZWYgPSBocmVmW2hyZWYubGVuZ3RoIC0gMV07XG4gICAgdmFyIG5vdHlDbGFzcyA9ICQodGhpcykuZGF0YSgnbm90eWNsYXNzJyk7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxuICAgICAgbm90eWZ5X2NsYXNzOiBcImxvYWRpbmcgXCIgKyAoaHJlZi5pbmRleE9mKCd2aWRlbycpID09PSAwID8gJ21vZGFscy1mdWxsX3NjcmVlbicgOiAnbm90aWZ5X3doaXRlJykgKyAnICcgKyBub3R5Q2xhc3MsXG4gICAgICBxdWVzdGlvbjogJydcbiAgICB9O1xuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcblxuICAgICQuZ2V0KCcvJyArIGhyZWYsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAkKCcubm90aWZ5X2JveCcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKGRhdGEuaHRtbCk7XG4gICAgICBhamF4Rm9ybSgkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKSk7XG4gICAgfSwgJ2pzb24nKTtcblxuICAgIC8vY29uc29sZS5sb2codGhpcyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KVxufSgpKTtcbiIsIiQoJy5mb290ZXItbWVudS10aXRsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgaWYgKCR0aGlzLmhhc0NsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJykpIHtcbiAgICAkdGhpcy5yZW1vdmVDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpXG4gIH0gZWxzZSB7XG4gICAgJCgnLmZvb3Rlci1tZW51LXRpdGxlX29wZW4nKS5yZW1vdmVDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpO1xuICAgICR0aGlzLmFkZENsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XG4gIH1cblxufSk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gc3Rhck5vbWluYXRpb24oaW5kZXgpIHtcbiAgICB2YXIgc3RhcnMgPSAkKFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiKTtcbiAgICBzdGFycy5hZGRDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XG4gICAgICBzdGFycy5lcShpKS5yZW1vdmVDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XG4gICAgfVxuICB9XG5cbiAgJChkb2N1bWVudCkub24oXCJtb3VzZW92ZXJcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XG4gIH0pLm9uKFwibW91c2VsZWF2ZVwiLCBcIi5yYXRpbmctd3JhcHBlclwiLCBmdW5jdGlvbiAoZSkge1xuICAgIHN0YXJOb21pbmF0aW9uKCQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCkpO1xuICB9KS5vbihcImNsaWNrXCIsIFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiLCBmdW5jdGlvbiAoZSkge1xuICAgIHN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xuXG4gICAgJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoJCh0aGlzKS5pbmRleCgpICsgMSk7XG4gIH0pO1xufSk7XG4iLCIvL9C40LfQsdGA0LDQvdC90L7QtVxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAkKFwiLmZhdm9yaXRlLWxpbmtcIikub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgc2VsZiA9ICQodGhpcyk7XG4gICAgdmFyIHR5cGUgPSBzZWxmLmF0dHIoXCJkYXRhLXN0YXRlXCIpLFxuICAgICAgYWZmaWxpYXRlX2lkID0gc2VsZi5hdHRyKFwiZGF0YS1hZmZpbGlhdGUtaWRcIik7XG5cbiAgICBpZiAoIWFmZmlsaWF0ZV9pZCkge1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgIHRpdGxlOiBcItCd0LXQvtCx0YXQvtC00LjQvNC+INCw0LLRgtC+0YDQuNC30L7QstCw0YLRjNGB0Y9cIixcbiAgICAgICAgbWVzc2FnZTogJ9CU0L7QsdCw0LLQuNGC0Ywg0LIg0LjQt9Cx0YDQsNC90L3QvtC1INC80L7QttC10YIg0YLQvtC70YzQutC+INCw0LLRgtC+0YDQuNC30L7QstCw0L3QvdGL0Lkg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GMLjwvYnI+JyArXG4gICAgICAgICc8YSBocmVmPVwiI2xvZ2luXCIgY2xhc3M9XCJtb2RhbHNfb3BlblwiPtCS0YXQvtC0PC9hPiAgLyA8YSBocmVmPVwiI3JlZ2lzdHJhdGlvblwiIGNsYXNzPVwibW9kYWxzX29wZW5cIj7QoNC10LPQuNGB0YLRgNCw0YbQuNGPPC9hPicsXG4gICAgICAgIHR5cGU6ICdlcnInXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIH1cblxuICAgIGlmIChzZWxmLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgc2VsZi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblxuICAgIC8qaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgIHNlbGYuZmluZChcIi5pdGVtX2ljb25cIikucmVtb3ZlQ2xhc3MoXCJtdXRlZFwiKTtcbiAgICAgfSovXG5cbiAgICAkLnBvc3QoXCIvYWNjb3VudC9mYXZvcml0ZXNcIiwge1xuICAgICAgXCJ0eXBlXCI6IHR5cGUsXG4gICAgICBcImFmZmlsaWF0ZV9pZFwiOiBhZmZpbGlhdGVfaWRcbiAgICB9LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIGlmIChkYXRhLmVycm9yKSB7XG4gICAgICAgIHNlbGYuZmluZCgnc3ZnJykucmVtb3ZlQ2xhc3MoXCJzcGluXCIpO1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOiBkYXRhLmVycm9yLCB0eXBlOiAnZXJyJywgJ3RpdGxlJzogKGRhdGEudGl0bGUgPyBkYXRhLnRpdGxlIDogZmFsc2UpfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgIG1lc3NhZ2U6IGRhdGEubXNnLFxuICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICd0aXRsZSc6IChkYXRhLnRpdGxlID8gZGF0YS50aXRsZSA6IGZhbHNlKVxuICAgICAgfSk7XG5cbiAgICAgIGlmICh0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwiLml0ZW1faWNvblwiKS5hZGRDbGFzcyhcInN2Zy1uby1maWxsXCIpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLmF0dHIoe1xuICAgICAgICBcImRhdGEtc3RhdGVcIjogZGF0YVtcImRhdGEtc3RhdGVcIl0sXG4gICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiOiBkYXRhWydkYXRhLW9yaWdpbmFsLXRpdGxlJ11cbiAgICAgIH0pO1xuXG4gICAgICBpZiAodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gc3ZnLW5vLWZpbGxcIik7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJkZWxldGVcIikge1xuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluXCIpLmFkZENsYXNzKFwic3ZnLW5vLWZpbGxcIik7XG4gICAgICB9XG5cbiAgICB9LCAnanNvbicpLmZhaWwoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICBtZXNzYWdlOiBcIjxiPtCi0LXRhdC90LjRh9C10YHQutC40LUg0YDQsNCx0L7RgtGLITwvYj48YnI+0JIg0LTQsNC90L3Ri9C5INC80L7QvNC10L3RgiDQstGA0LXQvNC10L3QuFwiICtcbiAgICAgICAgXCIg0L/RgNC+0LjQt9Cy0LXQtNGR0L3QvdC+0LUg0LTQtdC50YHRgtCy0LjQtSDQvdC10LLQvtC30LzQvtC20L3Qvi4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtS5cIiArXG4gICAgICAgIFwiINCf0YDQuNC90L7RgdC40Lwg0YHQstC+0Lgg0LjQt9Cy0LjQvdC10L3QuNGPINC30LAg0L3QtdGD0LTQvtCx0YHRgtCy0L4uXCIsIHR5cGU6ICdlcnInXG4gICAgICB9KTtcblxuICAgICAgaWYgKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikuYWRkQ2xhc3MoXCJzdmctbm8tZmlsbFwiKTtcbiAgICAgIH1cbiAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW5cIik7XG4gICAgfSlcbiAgfSk7XG59KTtcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgJCgnLnNjcm9sbF90bycpLmNsaWNrKGZ1bmN0aW9uIChlKSB7IC8vINC70L7QstC40Lwg0LrQu9C40Log0L/QviDRgdGB0YvQu9C60LUg0YEg0LrQu9Cw0YHRgdC+0LwgZ29fdG9cbiAgICB2YXIgc2Nyb2xsX2VsID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7IC8vINCy0L7Qt9GM0LzQtdC8INGB0L7QtNC10YDQttC40LzQvtC1INCw0YLRgNC40LHRg9GC0LAgaHJlZiwg0LTQvtC70LbQtdC9INCx0YvRgtGMINGB0LXQu9C10LrRgtC+0YDQvtC8LCDRgi7QtS4g0L3QsNC/0YDQuNC80LXRgCDQvdCw0YfQuNC90LDRgtGM0YHRjyDRgSAjINC40LvQuCAuXG4gICAgc2Nyb2xsX2VsID0gJChzY3JvbGxfZWwpO1xuICAgIGlmIChzY3JvbGxfZWwubGVuZ3RoICE9IDApIHsgLy8g0L/RgNC+0LLQtdGA0LjQvCDRgdGD0YnQtdGB0YLQstC+0LLQsNC90LjQtSDRjdC70LXQvNC10L3RgtCwINGH0YLQvtCx0Ysg0LjQt9Cx0LXQttCw0YLRjCDQvtGI0LjQsdC60LhcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IHNjcm9sbF9lbC5vZmZzZXQoKS50b3AgLSAkKCcjaGVhZGVyPionKS5lcSgwKS5oZWlnaHQoKSAtIDUwfSwgNTAwKTsgLy8g0LDQvdC40LzQuNGA0YPQtdC8INGB0LrRgNC+0L7Qu9C40L3QsyDQuiDRjdC70LXQvNC10L3RgtGDIHNjcm9sbF9lbFxuICAgICAgaWYgKHNjcm9sbF9lbC5oYXNDbGFzcygnYWNjb3JkaW9uJykgJiYgIXNjcm9sbF9lbC5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAgIHNjcm9sbF9lbC5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wnKS5jbGljaygpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7IC8vINCy0YvQutC70Y7Rh9Cw0LXQvCDRgdGC0LDQvdC00LDRgNGC0L3QvtC1INC00LXQudGB0YLQstC40LVcbiAgfSk7XG59KTtcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgJChcImJvZHlcIikub24oJ2NsaWNrJywgJy5zZXRfY2xpcGJvYXJkJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICBjb3B5VG9DbGlwYm9hcmQoJHRoaXMuZGF0YSgnY2xpcGJvYXJkJyksICR0aGlzLmRhdGEoJ2NsaXBib2FyZC1ub3RpZnknKSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGNvcHlUb0NsaXBib2FyZChjb2RlLCBtc2cpIHtcbiAgICB2YXIgJHRlbXAgPSAkKFwiPGlucHV0PlwiKTtcbiAgICAkKFwiYm9keVwiKS5hcHBlbmQoJHRlbXApO1xuICAgICR0ZW1wLnZhbChjb2RlKS5zZWxlY3QoKTtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIik7XG4gICAgJHRlbXAucmVtb3ZlKCk7XG5cbiAgICBpZiAoIW1zZykge1xuICAgICAgbXNnID0gXCLQlNCw0L3QvdGL0LUg0YPRgdC/0LXRiNC90L4g0YHQutC+0L/QuNGA0L7QstCw0L3RiyDQsiDQsdGD0YTQtdGAINC+0LHQvNC10L3QsFwiO1xuICAgIH1cbiAgICBub3RpZmljYXRpb24ubm90aWZpKHsndHlwZSc6ICdpbmZvJywgJ21lc3NhZ2UnOiBtc2csICd0aXRsZSc6ICfQo9GB0L/QtdGI0L3Qvid9KVxuICB9XG5cbiAgJChcImJvZHlcIikub24oJ2NsaWNrJywgXCJpbnB1dC5saW5rXCIsIGZ1bmN0aW9uICgpIHtcdC8vINC/0L7Qu9GD0YfQtdC90LjQtSDRhNC+0LrRg9GB0LAg0YLQtdC60YHRgtC+0LLRi9C8INC/0L7Qu9C10Lwt0YHRgdGL0LvQutC+0LlcbiAgICAkKHRoaXMpLnNlbGVjdCgpO1xuICB9KTtcbn0pO1xuIiwiLy/RgdC60LDRh9C40LLQsNC90LjQtSDQutCw0YDRgtC40L3QvtC6XG4oZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgIHZhciBpbWcgPSBkYXRhLmltZztcbiAgICBpbWcud3JhcCgnPGRpdiBjbGFzcz1cImRvd25sb2FkXCI+PC9kaXY+Jyk7XG4gICAgdmFyIHdyYXAgPSBpbWcucGFyZW50KCk7XG4gICAgJCgnLmRvd25sb2FkX3Rlc3QnKS5hcHBlbmQoZGF0YS5lbCk7XG4gICAgc2l6ZSA9IGRhdGEuZWwud2lkdGgoKSArIFwieFwiICsgZGF0YS5lbC5oZWlnaHQoKTtcblxuICAgIHc9ZGF0YS5lbC53aWR0aCgpKjAuODtcbiAgICBpbWdcbiAgICAgIC5oZWlnaHQoJ2F1dG8nKVxuICAgICAgLy8ud2lkdGgodylcbiAgICAgIC5jc3MoJ21heC13aWR0aCcsJzk5JScpO1xuXG5cbiAgICBkYXRhLmVsLnJlbW92ZSgpO1xuICAgIHdyYXAuYXBwZW5kKCc8c3Bhbj4nICsgc2l6ZSArICc8L3NwYW4+IDxhIGhyZWY9XCInICsgZGF0YS5zcmMgKyAnXCIgZG93bmxvYWQ+0KHQutCw0YfQsNGC0Yw8L2E+Jyk7XG4gIH1cblxuICB2YXIgaW1ncyA9ICQoJy5kb3dubG9hZHNfaW1nIGltZycpO1xuICBpZihpbWdzLmxlbmd0aD09MClyZXR1cm47XG5cbiAgJCgnYm9keScpLmFwcGVuZCgnPGRpdiBjbGFzcz1kb3dubG9hZF90ZXN0PjwvZGl2PicpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGltZ3MubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaW1nID0gaW1ncy5lcShpKTtcbiAgICB2YXIgc3JjID0gaW1nLmF0dHIoJ3NyYycpO1xuICAgIGltYWdlID0gJCgnPGltZy8+Jywge1xuICAgICAgc3JjOiBzcmNcbiAgICB9KTtcbiAgICBkYXRhID0ge1xuICAgICAgc3JjOiBzcmMsXG4gICAgICBpbWc6IGltZyxcbiAgICAgIGVsOiBpbWFnZVxuICAgIH07XG4gICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcbiAgfVxufSkoKTtcblxuLy/Rh9GC0L4g0LEg0LjRhNGA0LXQudC80Ysg0Lgg0LrQsNGA0YLQuNC90LrQuCDQvdC1INCy0YvQu9Cw0LfQuNC70LhcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIC8qbV93ID0gJCgnLnRleHQtY29udGVudCcpLndpZHRoKClcbiAgIGlmIChtX3cgPCA1MCltX3cgPSBzY3JlZW4ud2lkdGggLSA0MCovXG4gIHZhciBtdz1zY3JlZW4ud2lkdGgtNDA7XG5cbiAgZnVuY3Rpb24gb3B0aW1hc2UoZWwpe1xuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnQoKTtcbiAgICBpZihwYXJlbnQubGVuZ3RoPT0wIHx8IHBhcmVudFswXS50YWdOYW1lPT1cIkFcIil7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKGVsLmhhc0NsYXNzKCdub19vcHRvbWl6ZScpKXJldHVybjtcblxuICAgIG1fdyA9IHBhcmVudC53aWR0aCgpLTMwO1xuICAgIHZhciB3PWVsLndpZHRoKCk7XG5cbiAgICAvL9Cx0LXQtyDRjdGC0L7Qs9C+INC/0LvRjtGJ0LjRgiDQsdCw0L3QtdGA0Ysg0LIg0LDQutCw0YDQtNC40L7QvdC1XG4gICAgaWYodzwzIHx8IG1fdzwzKXtcbiAgICAgIGVsXG4gICAgICAgIC5oZWlnaHQoJ2F1dG8nKVxuICAgICAgICAuY3NzKCdtYXgtd2lkdGgnLCc5OSUnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlbC53aWR0aCgnYXV0bycpO1xuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSU1HXCIgJiYgdz5lbC53aWR0aCgpKXc9ZWwud2lkdGgoKTtcblxuICAgIGlmIChtdz41MCAmJiBtX3cgPiBtdyltX3cgPSBtdztcbiAgICBpZiAodz5tX3cpIHtcbiAgICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpe1xuICAgICAgICBrID0gdyAvIG1fdztcbiAgICAgICAgZWwuaGVpZ2h0KGVsLmhlaWdodCgpIC8gayk7XG4gICAgICB9XG4gICAgICBlbC53aWR0aChtX3cpXG4gICAgfWVsc2V7XG4gICAgICBlbC53aWR0aCh3KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcbiAgICB2YXIgZWw9JCh0aGlzKTtcbiAgICBvcHRpbWFzZShlbCk7XG4gIH1cblxuICB2YXIgcCA9ICQoJy5jb250ZW50LXdyYXAgaW1nLC5jb250ZW50LXdyYXAgaWZyYW1lJyk7XG4gICQoJy5jb250ZW50LXdyYXAgaW1nOm5vdCgubm9fb3B0b21pemUpJykuaGVpZ2h0KCdhdXRvJyk7XG4gIC8vJCgnLmNvbnRhaW5lciBpbWcnKS53aWR0aCgnYXV0bycpO1xuICBmb3IgKGkgPSAwOyBpIDwgcC5sZW5ndGg7IGkrKykge1xuICAgIGVsID0gcC5lcShpKTtcbiAgICBpZihlbFswXS50YWdOYW1lPT1cIklGUkFNRVwiKSB7XG4gICAgICBvcHRpbWFzZShlbCk7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgc3JjPWVsLmF0dHIoJ3NyYycpO1xuICAgICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XG4gICAgICAgIHNyYzogc3JjXG4gICAgICB9KTtcbiAgICAgIGltYWdlLm9uKCdsb2FkJywgaW1nX2xvYWRfZmluaXNoLmJpbmQoZWwpKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5cbi8v0J/RgNC+0LLQtdGA0LrQsCDQsdC40YLRiyDQutCw0YDRgtC40L3QvtC6LlxuLy8gISEhISEhXG4vLyDQndGD0LbQvdC+INC/0YDQvtCy0LXRgNC40YLRjC4g0JLRi9C30YvQstCw0LvQviDQs9C70Y7QutC4INC/0YDQuCDQsNCy0YLQvtGA0LfQsNGG0LjQuCDRh9C10YDQtdC3INCk0JEg0L3QsCDRgdCw0YTQsNGA0Lhcbi8vICEhISEhIVxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBpZihkYXRhLnRhZ05hbWUpe1xuICAgICAgZGF0YT0kKGRhdGEpLmRhdGEoJ2RhdGEnKTtcbiAgICB9XG4gICAgdmFyIGltZz1kYXRhLmltZztcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcbiAgICAgIGltZy5hdHRyKCdzcmMnLCBkYXRhLnNyYyk7XG4gICAgfWVsc2V7XG4gICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XG4gICAgICBpbWcucmVtb3ZlQ2xhc3MoJ25vX2F2YScpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRlc3RJbWcoaW1ncyxub19pbWcpe1xuICAgIGlmKCFpbWdzIHx8IGltZ3MubGVuZ3RoPT0wKXJldHVybjtcblxuICAgIGlmKCFub19pbWcpbm9faW1nPScvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJztcblxuICAgIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XG4gICAgICB2YXIgaW1nPWltZ3MuZXEoaSk7XG4gICAgICBpZihpbWcuaGFzQ2xhc3MoJ25vX2F2YScpKXtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBkYXRhPXtcbiAgICAgICAgaW1nOmltZ1xuICAgICAgfTtcbiAgICAgIHZhciBzcmM7XG4gICAgICBpZihbMF0udGFnTmFtZT09XCJJTUdcIil7XG4gICAgICAgIGRhdGEudHlwZT0wO1xuICAgICAgICBzcmM9aW1nLmF0dHIoJ3NyYycpO1xuICAgICAgICBpbWcuYXR0cignc3JjJyxub19pbWcpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGRhdGEudHlwZT0xO1xuICAgICAgICBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xuICAgICAgICBpZighc3JjKWNvbnRpbnVlO1xuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybChcIicsJycpO1xuICAgICAgICBzcmM9c3JjLnJlcGxhY2UoJ1wiKScsJycpO1xuICAgICAgICBpbWcuYWRkQ2xhc3MoJ25vX2F2YScpO1xuICAgICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrbm9faW1nKycpJyk7XG4gICAgICB9XG4gICAgICBkYXRhLnNyYz1zcmM7XG4gICAgICB2YXIgaW1hZ2U9JCgnPGltZy8+Jyx7XG4gICAgICAgIHNyYzpzcmNcbiAgICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSk7XG4gICAgICBpbWFnZS5kYXRhKCdkYXRhJyxkYXRhKTtcbiAgICB9XG4gIH1cblxuICAvL9GC0LXRgdGCINC70L7Qs9C+INC80LDQs9Cw0LfQuNC90LBcbiAgdmFyIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJyk7XG4gIGltZ3M9aW1ncy5maW5kKCcubG9nbyBpbWcnKTtcbiAgdGVzdEltZyhpbWdzLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XG5cbiAgLy/RgtC10YHRgiDQsNCy0LDRgtCw0YDQvtC6INCyINC60L7QvNC10L3RgtCw0YDQuNGP0YVcbiAgaW1ncz0kKCcuY29tbWVudC1waG90bywuc2Nyb2xsX2JveC1hdmF0YXInKTtcbiAgdGVzdEltZyhpbWdzLCcvaW1hZ2VzL25vX2F2YV9zcXVhcmUucG5nJyk7XG59KTtcbiIsIi8v0LXRgdC70Lgg0L7RgtC60YDRi9GC0L4g0LrQsNC6INC00L7Rh9C10YDQvdC10LVcbihmdW5jdGlvbiAoKSB7XG4gIGlmICghd2luZG93Lm9wZW5lcilyZXR1cm47XG5cbiAgaHJlZiA9IHdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZjtcbiAgaWYgKFxuICAgIGhyZWYuaW5kZXhPZignYWNjb3VudC9vZmZsaW5lJykgPiAwXG4gICkge1xuICAgIHdpbmRvdy5wcmludCgpXG4gIH1cblxuICBpZiAoZG9jdW1lbnQucmVmZXJyZXIuaW5kZXhPZignc2VjcmV0ZGlzY291bnRlcicpIDwgMClyZXR1cm47XG5cbiAgaWYgKFxuICAgIGhyZWYuaW5kZXhPZignc29jaWFscycpID4gMCB8fFxuICAgIGhyZWYuaW5kZXhPZignbG9naW4nKSA+IDAgfHxcbiAgICBocmVmLmluZGV4T2YoJ2FkbWluJykgPiAwIHx8XG4gICAgaHJlZi5pbmRleE9mKCdhY2NvdW50JykgPiAwXG4gICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChocmVmLmluZGV4T2YoJ3N0b3JlJykgPiAwIHx8IGhyZWYuaW5kZXhPZignY291cG9uJykgPiAwIHx8IGhyZWYuaW5kZXhPZignc2V0dGluZ3MnKSA+IDApIHtcbiAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLnJlbG9hZCgpO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZiA9IGxvY2F0aW9uLmhyZWY7XG4gIH1cbiAgd2luZG93LmNsb3NlKCk7XG59KSgpO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAkKCdpbnB1dFt0eXBlPWZpbGVdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChldnQpIHtcbiAgICB2YXIgZmlsZSA9IGV2dC50YXJnZXQuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxuICAgIHZhciBmID0gZmlsZVswXTtcbiAgICAvLyBPbmx5IHByb2Nlc3MgaW1hZ2UgZmlsZXMuXG4gICAgaWYgKCFmLnR5cGUubWF0Y2goJ2ltYWdlLionKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgIGRhdGEgPSB7XG4gICAgICAnZWwnOiB0aGlzLFxuICAgICAgJ2YnOiBmXG4gICAgfTtcbiAgICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaW1nID0gJCgnW2Zvcj1cIicgKyBkYXRhLmVsLm5hbWUgKyAnXCJdJyk7XG4gICAgICAgIGlmIChpbWcubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGltZy5hdHRyKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoZGF0YSk7XG4gICAgLy8gUmVhZCBpbiB0aGUgaW1hZ2UgZmlsZSBhcyBhIGRhdGEgVVJMLlxuICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGYpO1xuICB9KTtcblxuICAkKCcuZHVibGljYXRlX3ZhbHVlJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgIHZhciBzZWwgPSAkKCR0aGlzLmRhdGEoJ3NlbGVjdG9yJykpO1xuICAgIHNlbC52YWwodGhpcy52YWx1ZSk7XG4gIH0pXG59KTtcbiIsIlxuZnVuY3Rpb24gZ2V0Q29va2llKG4pIHtcbiAgcmV0dXJuIHVuZXNjYXBlKChSZWdFeHAobiArICc9KFteO10rKScpLmV4ZWMoZG9jdW1lbnQuY29va2llKSB8fCBbMSwgJyddKVsxXSk7XG59XG5cbmZ1bmN0aW9uIHNldENvb2tpZShuYW1lLCB2YWx1ZSkge1xuICB2YXIgY29va2llX3N0cmluZyA9IG5hbWUgKyBcIj1cIiArIGVzY2FwZSAoIHZhbHVlICk7XG4gIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZV9zdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGVyYXNlQ29va2llKG5hbWUpe1xuICB2YXIgY29va2llX3N0cmluZyA9IG5hbWUgKyBcIj0wXCIgK1wiOyBleHBpcmVzPVdlZCwgMDEgT2N0IDIwMTcgMDA6MDA6MDAgR01UXCI7XG4gIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZV9zdHJpbmc7XG59XG4iLCIoZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIHRhYmxlcyA9ICQoJ3RhYmxlLmFkYXB0aXZlJyk7XG5cbiAgaWYgKHRhYmxlcy5sZW5ndGggPT0gMClyZXR1cm47XG5cbiAgZm9yICh2YXIgaSA9IDA7IHRhYmxlcy5sZW5ndGggPiBpOyBpKyspIHtcbiAgICB2YXIgdGFibGUgPSB0YWJsZXMuZXEoaSk7XG4gICAgdmFyIHRoID0gdGFibGUuZmluZCgndGhlYWQnKTtcbiAgICBpZiAodGgubGVuZ3RoID09IDApIHtcbiAgICAgIHRoID0gdGFibGUuZmluZCgndHInKS5lcSgwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGggPSB0aC5maW5kKCd0cicpLmVxKDApO1xuICAgIH1cbiAgICB0aCA9IHRoLmFkZENsYXNzKCd0YWJsZS1oZWFkZXInKS5maW5kKCd0ZCx0aCcpO1xuXG4gICAgdmFyIHRyID0gdGFibGUuZmluZCgndHInKS5ub3QoJy50YWJsZS1oZWFkZXInKTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGgubGVuZ3RoOyBqKyspIHtcbiAgICAgIHZhciBrID0gaiArIDE7XG4gICAgICB2YXIgdGQgPSB0ci5maW5kKCd0ZDpudGgtY2hpbGQoJyArIGsgKyAnKScpO1xuICAgICAgdGQuYXR0cignbGFiZWwnLCB0aC5lcShqKS50ZXh0KCkpO1xuICAgIH1cbiAgfVxuXG59KSh3aW5kb3csIGRvY3VtZW50KTtcbiIsIjtcbiQoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIG9uUmVtb3ZlKCl7XG4gICAgJHRoaXM9JCh0aGlzKTtcbiAgICBwb3N0PXtcbiAgICAgIGlkOiR0aGlzLmF0dHIoJ3VpZCcpLFxuICAgICAgdHlwZTokdGhpcy5hdHRyKCdtb2RlJylcbiAgICB9O1xuICAgICQucG9zdCgkdGhpcy5hdHRyKCd1cmwnKSxwb3N0LGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgaWYoZGF0YSAmJiBkYXRhPT0nZXJyJyl7XG4gICAgICAgIG1zZz0kdGhpcy5kYXRhKCdyZW1vdmUtZXJyb3InKTtcbiAgICAgICAgaWYoIW1zZyl7XG4gICAgICAgICAgbXNnPSfQndC10LLQvtC30LzQvtC20L3QviDRg9C00LDQu9C40YLRjCDRjdC70LXQvNC10L3Rgic7XG4gICAgICAgIH1cbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTptc2csdHlwZTonZXJyJ30pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG1vZGU9JHRoaXMuYXR0cignbW9kZScpO1xuICAgICAgaWYoIW1vZGUpe1xuICAgICAgICBtb2RlPSdybSc7XG4gICAgICB9XG5cbiAgICAgIGlmKG1vZGU9PSdybScpIHtcbiAgICAgICAgcm0gPSAkdGhpcy5jbG9zZXN0KCcudG9fcmVtb3ZlJyk7XG4gICAgICAgIHJtX2NsYXNzID0gcm0uYXR0cigncm1fY2xhc3MnKTtcbiAgICAgICAgaWYgKHJtX2NsYXNzKSB7XG4gICAgICAgICAgJChybV9jbGFzcykucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBybS5yZW1vdmUoKTtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0KPRgdC/0LXRiNC90L7QtSDRg9C00LDQu9C10L3QuNC1LicsdHlwZTonaW5mbyd9KVxuICAgICAgfVxuICAgICAgaWYobW9kZT09J3JlbG9hZCcpe1xuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgbG9jYXRpb24uaHJlZj1sb2NhdGlvbi5ocmVmO1xuICAgICAgfVxuICAgIH0pLmZhaWwoZnVuY3Rpb24oKXtcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Ce0YjQuNCx0LrQsCDRg9C00LDQu9C90LjRjycsdHlwZTonZXJyJ30pO1xuICAgIH0pXG4gIH1cblxuICAkKCdib2R5Jykub24oJ2NsaWNrJywnLmFqYXhfcmVtb3ZlJyxmdW5jdGlvbigpe1xuICAgIG5vdGlmaWNhdGlvbi5jb25maXJtKHtcbiAgICAgIGNhbGxiYWNrWWVzOm9uUmVtb3ZlLFxuICAgICAgb2JqOiQodGhpcyksXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibm90aWZ5X2JveC1hbGVydFwiXG4gICAgfSlcbiAgfSk7XG5cbn0pO1xuXG4iLCJpZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKG9UaGlzKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyDQsdC70LjQttCw0LnRiNC40Lkg0LDQvdCw0LvQvtCzINCy0L3Rg9GC0YDQtdC90L3QtdC5INGE0YPQvdC60YbQuNC4XG4gICAgICAvLyBJc0NhbGxhYmxlINCyIEVDTUFTY3JpcHQgNVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgLSB3aGF0IGlzIHRyeWluZyB0byBiZSBib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcbiAgICB9XG5cbiAgICB2YXIgYUFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgZlRvQmluZCA9IHRoaXMsXG4gICAgICBmTk9QID0gZnVuY3Rpb24gKCkge1xuICAgICAgfSxcbiAgICAgIGZCb3VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1AgJiYgb1RoaXNcbiAgICAgICAgICAgID8gdGhpc1xuICAgICAgICAgICAgOiBvVGhpcyxcbiAgICAgICAgICBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgfTtcblxuICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XG4gICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG5cbiAgICByZXR1cm4gZkJvdW5kO1xuICB9O1xufVxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnLmhpZGRlbi1saW5rJykucmVwbGFjZVdpdGgoZnVuY3Rpb24gKCkge1xuICAgICR0aGlzID0gJCh0aGlzKTtcbiAgICByZXR1cm4gJzxhIGhyZWY9XCInICsgJHRoaXMuZGF0YSgnbGluaycpICsgJ1wiIHJlbD1cIicrICR0aGlzLmRhdGEoJ3JlbCcpICsnXCIgY2xhc3M9XCInICsgJHRoaXMuYXR0cignY2xhc3MnKSArICdcIj4nICsgJHRoaXMudGV4dCgpICsgJzwvYT4nO1xuICB9KVxufSkoKTtcbiJdfQ==
