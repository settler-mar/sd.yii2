objects = function (a,b) {
    var c = b,
        key;
    for (key in a) {
        if (a.hasOwnProperty(key)) {
            c[key] = key in b ? b[key] : a[key];
        }
    }
    return c;
};

function login_redirect(new_href){
    href=location.href;
    if(href.indexOf('store')>0 || href.indexOf('coupon')>0){
        location.reload();
    }else{
        location.href=new_href;
    }
}

(function (w, d, $) {
    var scrolls_block = $('.scroll_box');

    if(scrolls_block.length==0) return;
    //$('<div class="scroll_box-wrap"></div>').wrapAll(scrolls_block);
    $(scrolls_block).wrap('<div class="scroll_box-wrap"></div>');

    init_scroll();
    calc_scroll();

    var t1,t2;

    $(window).resize(function () {
        clearTimeout(t1);
        clearTimeout(t2);
        t1=setTimeout(calc_scroll,300);
        t2=setTimeout(calc_scroll,800);
    });

    function init_scroll() {
        var control = '<div class="scroll_box-control"></div>';
        control=$(control);
        control.insertAfter(scrolls_block);
        control.data('slide-active', 0);

        scrolls_block.prepend('<div class=scroll_box-mover></div>');

        control.on('click','.scroll_box-control_point',function () {
            var $this = $(this);
            var control = $this.parent();
            var i = $this.index();
            if($this.hasClass('active'))return;
            control.find('.active').removeClass('active');
            $this.addClass('active');

            var dx=control.data('slide-dx');
            var el = control.prev();
            el.find('.scroll_box-mover').css('margin-left',-dx*i);
            control.data('slide-active', i);

            stopScrol.bind(el)();
        })
    }

    for (var j = 0; j < scrolls_block.length; j++) {
        var el = scrolls_block.eq(j);
        el.parent().hover(stopScrol.bind(el),startScrol.bind(el));
    }

    function startScrol(){
        var $this=$(this);
        if(!$this.hasClass("scroll_box-active"))return;

        var timeoutId = setTimeout(next_slide.bind($this), 2000);
        $this.data('slide-timeoutId',timeoutId)
    }

    function stopScrol(){
        var $this=$(this);
        var timeoutId=$this.data('slide-timeoutId');
        $this.data('slide-timeoutId',false);
        if(!$this.hasClass("scroll_box-active") || !timeoutId)return;
        clearTimeout(timeoutId);
    }

    function next_slide() {
        var $this=$(this);
        $this.data('slide-timeoutId',false);
        if(!$this.hasClass("scroll_box-active"))return;

        var controls=$this.next().find('>*');
        var active=$this.data('slide-active');
        var point_cnt=controls.length;
        if(!active)active=0;
        active++;
        if(active>=point_cnt)active=0;
        $this.data('slide-active', active);

        controls.eq(active).click();
        startScrol.bind($this)();
    }

    function calc_scroll() {
        for(i=0;i<scrolls_block.length;i++) {
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

            var f_el=children.eq(1);
            var children_w = f_el.outerWidth(); //всего дочерних для скрола
            children_w+=parseFloat(f_el.css('margin-left'));
            children_w+=parseFloat(f_el.css('margin-right'));

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
                out += '<div class="scroll_box-control_point'+(j==active?' active':'')+'"></div>';
            }
            control.html(out);

            control.data('slide-active', active);
            control.data('slide-count', point_cnt);
            control.data('slide-dx', children_w);

            if(!el.data('slide-timeoutId')){
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

$('body').on('click',function () {
  $('.accordion_fullscrean_close.open .accordion-control:first-child').click()
});

$('.accordion-content').on('click',function (e) {
  if (e.target.tagName != 'A') {
      $(this).closest('.accordion').find('.accordion-control.accordion-title').click();
      e.preventDefault();
      return false;
  }
});

$('.accordion-content a').on('click',function (e) {
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
          form.find('input[type=text],textarea').val('')
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
    //form.html('');
    //wrap.html('<div style="text-align:center;"><p>Отправка данных</p></div>');

    data.url += (data.url.indexOf('?') > 0 ? '&' : '?') + 'rc=' + Math.random();
    console.log(data.url);

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
var myTooltip = function() {

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

    $('[data-toggle=tooltip]').on('click', function(e){

        tooltipClickTime = new Date();
        //убираем таймаут
        clearInterval(tooltipTimeOut);
        //закрывавем все тултипы
        $('[data-toggle=tooltip]').tipso('hide');
        //данный показывем
        $(this).tipso('show');
        //новый интервал
        tooltipTimeOut = setInterval(function(){
            if (new Date() - tooltipClickTime > 1000 * 5) {
                clearInterval(tooltipTimeOut);
                //закрываем все тултипы
                $('[data-toggle=tooltip]').tipso('hide');
            }
        },1000);


    });

}();

(function () {
  var $notyfi_btn=$('.header-logo_noty');
  if ($notyfi_btn.length == 0) {
    return;
  }

  $.get('/account/notification',function(data){
    if(!data.notifications || data.notifications.length==0) return;

    var out='<div class=header-noty-box><ul class="header-noty-list">';
    $notyfi_btn.find('a').removeAttr('href');
    var has_new=false;
    for (var i=0;i<data.notifications.length;i++){
      el=data.notifications[i];
      var is_new=(el.is_viewed==0 && el.type_id==2)
      out+='<li class="header-noty-item'+(is_new?' header-noty-item_new':'')+'">';
      out+='<div class=header-noty-data>'+el.data+'</div>';
      out+='<div class=header-noty-text>'+el.text+'</div>';
      out+='</li>';
      has_new=has_new||is_new;
    }

    out+='</ul>';
    out+='<a class="btn" href="/account/notification">'+data.btn+'</a>';
    out+='</div>';
    $('.header').append(out);

    if(has_new){
      $notyfi_btn.addClass('tooltip').addClass('has-noty');
    }

    $notyfi_btn.on('click',function(e){
      e.preventDefault();
      if($('.header-noty-box').hasClass('header-noty-box_open')){
        $('.header-noty-box').removeClass('header-noty-box_open');
        $('html').removeClass('no_scrol_laptop_min');
      }else{
        $('.header-noty-box').addClass('header-noty-box_open');
        $('html').addClass('no_scrol_laptop_min');

        if($(this).hasClass('has-noty')){
          $.post('/account/notification',function(){
            $('.header-logo_noty').removeClass('tooltip').removeClass('has-noty');
          })
        }
      }
      return false;
    });

    $('.header-noty-box').on('click',function(e){
      $('.header-noty-box').removeClass('header-noty-box_open');
      $('html').removeClass('no_scrol_laptop_min');
    });

    $('.header-noty-list').on('click',function(e){
      e.preventDefault();
      return false;
    })
  },'json');

})();
'use strict';

var megaslider = (function() {
  var slider_data=false;
  var container_id="section#mega_slider";
  var parallax_group=false;
  var parallax_timer=false;
  var parallax_counter=0;
  var parallax_d=1;
  var mobile_mode=-1;
  var max_time_load_pic=300;
  var mobile_size=700;
  var render_slide_nom=0;
  var tot_img_wait;
  var slides;
  var slide_select_box;
  var editor;
  var timeoutId;
  var scroll_period = 5000;

  var posArr=[
    'slider__text-lt','slider__text-ct','slider__text-rt',
    'slider__text-lc','slider__text-cc','slider__text-rc',
    'slider__text-lb','slider__text-cb','slider__text-rb',
  ];
  var pos_list=[
    'Лево верх','центр верх','право верх',
    'Лево центр','центр','право центр',
    'Лево низ','центр низ','право низ',
  ];
  var show_delay=[
    'show_no_delay',
    'show_delay_05',
    'show_delay_10',
    'show_delay_15',
    'show_delay_20',
    'show_delay_25',
    'show_delay_30'
  ];
  var hide_delay=[
    'hide_no_delay',
    'hide_delay_05',
    'hide_delay_10',
    'hide_delay_15',
    'hide_delay_20'
  ];
  var yes_no_arr=[
    'no',
    'yes'
  ];
  var yes_no_val=[
    '',
    'fixed__full-height'
  ];
  var btn_style=[
    'none',
    'bordo',
  ];
  var show_animations=[
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

  var hide_animations=[
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
    if(els.length==0)return;
    els.wrap('<div class="select_img">');
    els=els.parent();
    els.append('<button type="button" class="file_button"><i class="mce-ico mce-i-browse"></i></button>');
    /*els.find('button').on('click',function () {
      $('#roxyCustomPanel2').addClass('open')
    });*/
    for (var i=0;i<els.length;i++) {
      var el=els.eq(i).find('input');
      if(!el.attr('id')){
        el.attr('id','file_'+i+'_'+Date.now())
      }
      var t_id=el.attr('id');
      mihaildev.elFinder.register(t_id, function (file, id) {
        //$(this).val(file.url).trigger('change', [file, id]);
        $('#'+id).val(file.url).change();
        return true;
      });
    };

    $(document).on('click', '.file_button', function(){
      var $this=$(this).prev();
      var id=$this.attr('id');
      mihaildev.elFinder.openManager({
        "url":"/manager/elfinder?filter=image&callback="+id+"&lang=ru",
        "width":"auto",
        "height":"auto",
        "id":id
      });
    });
  }

  function genInput(data){
    var input='<input class="' + (data.inputClass || '') + '" value="' + (data.value || '') + '">';
    if(data.label) {
      input = '<label><span>' + data.label + '</span>'+input+'</label>';
    }
    if(data.parent) {
      input = '<'+data.parent+'>'+input+'</'+data.parent+'>';
    }
    input = $(input);

    if(data.onChange){
      var onChange;
      if(data.bind){
        data.bind.input=input.find('input');
        onChange = data.onChange.bind(data.bind);
      }else{
        onChange = data.onChange.bind(input.find('input'));
      }
      input.find('input').on('change',onChange)
    }
    return input;
  }

  function genSelect(data){
    var input=$('<select/>');

    var el=slider_data[0][data.gr];
    if(data.index!==false){
      el=el[data.index];
    }

    if(el[data.param]){
      data.value=el[data.param];
    }else{
      data.value=0;
    }

    if(data.start_option){
      input.append(data.start_option)
    }

    for(var i=0;i<data.list.length;i++){
      var val;
      var txt=data.list[i];
      if(data.val_type==0){
        val=data.list[i];
      }else if(data.val_type==1){
        val=i;
      }else if(data.val_type==2){
        //val=data.val_list[i];
        val=i;
        txt=data.val_list[i];
      }

      var sel=(val==data.value?'selected':'');
      if(sel=='selected'){
        input.attr('t_val',data.list[i]);
      }
      var option='<option value="'+val+'" '+sel+'>'+txt+'</option>';
      if(data.val_type==2){
        option=$(option).attr('code',data.list[i]);
      }
      input.append(option)
    }

    input.on('change',function () {
      data=this;
      var val=data.el.val();
      var sl_op=data.el.find('option[value='+val+']');
      var cls=sl_op.text();
      var ch=sl_op.attr('code');
      if(!ch)ch=cls;
      if(data.index!==false){
        slider_data[0][data.gr][data.index][data.param]=val;
      }else{
        slider_data[0][data.gr][data.param]=val;
      }

      data.obj.removeClass(data.prefix+data.el.attr('t_val'));
      data.obj.addClass(data.prefix+ch);
      data.el.attr('t_val',ch);

      $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
    }.bind({
      el:input,
      obj:data.obj,
      gr:data.gr,
      index:data.index,
      param:data.param,
      prefix:data.prefix||''
    }));

    if(data.parent){
      var parent=$('<'+data.parent+'/>');
      parent.append(input);
      return parent;
    }
    return input;
  }

  function getSelAnimationControll(data){
    var anim_sel=[];
    var out;

    if(data.type==0) {
      anim_sel.push('<span>Анимация появления</span>');
    }
    anim_sel.push(genSelect({
      list:show_animations,
      val_type:0,
      obj:data.obj,
      gr:data.gr,
      index:data.index,
      param:'show_animation',
      prefix:'slide_',
      parent:data.parent
    }));
    if(data.type==0) {
      anim_sel.push('<span>Задержка появления</span>');
    }
    anim_sel.push(genSelect({
      list:show_delay,
      val_type:1,
      obj:data.obj,
      gr:data.gr,
      index:data.index,
      param:'show_delay',
      prefix:'slide_',
      parent:data.parent
    }));

    if(data.type==0) {
      anim_sel.push('<br/>');
      anim_sel.push('<span>Анимация исчезновения</span>');
    }
    anim_sel.push(genSelect({
      list:hide_animations,
      val_type:0,
      obj:data.obj,
      gr:data.gr,
      index:data.index,
      param:'hide_animation',
      prefix:'slide_',
      parent:data.parent
    }));
    if(data.type==0) {
      anim_sel.push('<span>Задержка исчезновения</span>');
    }
    anim_sel.push(genSelect({
      list:hide_delay,
      val_type:1,
      obj:data.obj,
      gr:data.gr,
      index:data.index,
      param:'hide_delay',
      prefix:'slide_',
      parent:data.parent
    }));

    if(data.type==0){
      out=$('<div class="anim_sel"/>');
      out.append(anim_sel);
    }
    if(data.type==1){
      out=anim_sel;
    }

    return out;
  }

  function init_editor(){
    $('#w1').remove();
    $('#w1_button').remove();
    slider_data[0].mobile=slider_data[0].mobile.split('?')[0];

    var el=$('#mega_slider_controle');
    var btns_box=$('<div class="btn_box"/>');

    el.append('<h2>Управление</h2>');
    el.append($('<textarea/>',{
      text:JSON.stringify(slider_data[0]),
      id:'slide_data',
      name: editor
    }));

    var btn=$('<button class=""/>').text("Активировать слайд");
    btns_box.append(btn);
    btn.on('click',function(e){
      e.preventDefault();
      $('#mega_slider .slide').eq(0).addClass('slider-active');
      $('#mega_slider .slide').eq(0).removeClass('hide_slide');
    });

    var btn=$('<button class=""/>').text("Деактивировать слайд");
    btns_box.append(btn);
    btn.on('click',function(e){
      e.preventDefault();
      $('#mega_slider .slide').eq(0).removeClass('slider-active');
      $('#mega_slider .slide').eq(0).addClass('hide_slide');
    });
    el.append(btns_box);

    el.append('<h2>Общие параметры</h2>');
    el.append(genInput({
      value:slider_data[0].mobile,
      label:"Слайд для телефона",
      inputClass:"fileSelect",
      onChange:function(e){
        e.preventDefault();
        slider_data[0].mobile=$(this).val()
        $('.mob_bg').eq(0).css('background-image','url('+slider_data[0].mobile+')');
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));

    el.append(genInput({
      value:slider_data[0].fon,
      label:"Осноной фон",
      inputClass:"fileSelect",
      onChange:function(e){
        e.preventDefault();
        slider_data[0].fon=$(this).val()
        $('#mega_slider .slide').eq(0).css('background-image','url('+slider_data[0].fon+')')
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));

    var btn_ch=$('<div class="btns"/>');
    btn_ch.append('<h3>Кнопка перехода(для ПК версии)</h3>');
    btn_ch.append(genInput({
      value:slider_data[0].button.text,
      label:"Текст",
      onChange:function(e){
        e.preventDefault();
        slider_data[0].button.text=$(this).val();
        $('#mega_slider .slider__href').eq(0).text(slider_data[0].button.text);
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      },
    }));

    var but_sl=$('#mega_slider .slider__href').eq(0);

    btn_ch.append('<br/>');
    btn_ch.append('<span>Оформление кнопки</span>');
    btn_ch.append(genSelect({
      list:btn_style,
      val_type:0,
      obj:but_sl,
      gr:'button',
      index:false,
      param:'color'
    }));

    btn_ch.append('<br/>');
    btn_ch.append('<span>Положение кнопки</span>');
    btn_ch.append(genSelect({
      list:posArr,
      val_list:pos_list,
      val_type:2,
      obj:but_sl.parent().parent(),
      gr:'button',
      index:false,
      param:'pos'
    }));

    btn_ch.append(getSelAnimationControll({
      type:0,
      obj:but_sl.parent(),
      gr:'button',
      index:false
    }));
    el.append(btn_ch);

    var layer=$('<div class="fixed_layer"/>');
    layer.append('<h2>Статические слои</h2>');
    var th="<th>№</th>"+
            "<th>Картинка</th>"+
            "<th>Положение</th>"+
            "<th>Слой на всю высоту</th>"+
            "<th>Анимация появления</th>"+
            "<th>Задержка появления</th>"+
            "<th>Анимация исчезновения</th>"+
            "<th>Задержка исчезновения</th>"+
            "<th>Действие</th>";
    stTable=$('<table border="1"><tr>'+th+'</tr></table>');
    //если есть паралакс слои заполняем
    var data=slider_data[0].fixed;
    if(data && data.length>0){
      for(var i=0;i<data.length;i++){
        addTrStatic(data[i]);
      }
    }
    layer.append(stTable);
    var addBtn=$('<button/>',{
      text:"Добавить слой"
    });
    addBtn.on('click',function(e){
      e.preventDefault();
      data = addTrStatic(false);
      initImageServerSelect(data.editor.find('.fileSelect'));
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      slider_data:slider_data
    }));
    layer.append(addBtn);
    el.append(layer);

    var layer=$('<div class="paralax_layer"/>');
    layer.append('<h2>Паралакс слои</h2>');
    var th="<th>№</th>"+
      "<th>Картинка</th>"+
      "<th>Положение</th>"+
      "<th>Удаленность (целое положительное число)</th>"+
      "<th>Действие</th>";

    paralaxTable=$('<table border="1"><tr>'+th+'</tr></table>');
    //если есть паралакс слои заполняем
    var data=slider_data[0].paralax;
    if(data && data.length>0){
      for(var i=0;i<data.length;i++){
        addTrParalax(data[i]);
      }
    }
    layer.append(paralaxTable);
    var addBtn=$('<button/>',{
      text:"Добавить слой"
    });
    addBtn.on('click',function(e){
      e.preventDefault();
      data = addTrParalax(false);
      initImageServerSelect(data.editor.find('.fileSelect'));
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      slider_data:slider_data
    }));

    layer.append(addBtn);
    el.append(layer);

    initImageServerSelect(el.find('.fileSelect'));
  }

  function addTrStatic(data) {
    var i=stTable.find('tr').length-1;
    if(!data){
      data={
        "img":"",
        "full_height":0,
        "pos":0,
        "show_delay":1,
        "show_animation":"lightSpeedIn",
        "hide_delay":1,
        "hide_animation":"bounceOut"
      };
      slider_data[0].fixed.push(data);
      var fix = $('#mega_slider .fixed_group');
      addStaticLayer(data, fix,true);
    };

    var tr=$('<tr/>');
    tr.append('<td class="td_counter"/>');
    tr.append(genInput({
      value:data.img,
      label:false,
      parent:'td',
      inputClass:"fileSelect",
      bind:{
        gr:'fixed',
        index:i,
        param:'img',
        obj:$('#mega_slider .fixed_group .fixed__layer').eq(i).find('.animation_layer'),
      },
      onChange:function(e){
        e.preventDefault();
        var data=this;
        data.obj.css('background-image','url('+data.input.val()+')');
        slider_data[0].fixed[data.index].img=data.input.val();
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));
    tr.append(genSelect({
      list:posArr,
      val_list:pos_list,
      val_type:2,
      obj:$('#mega_slider .fixed_group .fixed__layer').eq(i),
      gr:'fixed',
      index:i,
      param:'pos',
      parent:'td',
    }));
    tr.append(genSelect({
      list:yes_no_val,
      val_list:yes_no_arr,
      val_type:2,
      obj:$('#mega_slider .fixed_group .fixed__layer').eq(i),
      gr:'fixed',
      index:i,
      param:'full_height',
      parent:'td',
    }));
    tr.append(getSelAnimationControll({
      type:1,
      obj:$('#mega_slider .fixed_group .fixed__layer').eq(i).find('.animation_layer'),
      gr:'fixed',
      index:i,
      parent:'td'
    }));
    var delBtn=$('<button/>',{
      text:"Удалить"
    });
    delBtn.on('click',function(e){
      e.preventDefault();
      var $this=$(this.el);
      i=$this.closest('tr').index()-1;
      $('#mega_slider .fixed_group .fixed__layer').eq(i).remove(); //удаляем слой на слайдере
      $this.closest('tr').remove(); //удаляем строку в таблице
      this.slider_data[0].fixed.splice(i, 1); //удаляем из конфига слайда
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      el:delBtn,
      slider_data:slider_data
    }));
    var delBtnTd=$('<td/>').append(delBtn);
    tr.append(delBtnTd);
    stTable.append(tr)

    return {
      editor:tr,
      data:data
    }
  }

  function addTrParalax(data) {
    var i=paralaxTable.find('tr').length-1;
    if(!data){
      data={
        "img":"",
        "z":1
      };
      slider_data[0].paralax.push(data);
      var paralax_gr = $('#mega_slider .parallax__group');
      addParalaxLayer(data, paralax_gr);
    };
    var tr=$('<tr/>');
    tr.append('<td class="td_counter"/>');
    tr.append(genInput({
      value:data.img,
      label:false,
      parent:'td',
      inputClass:"fileSelect",
      bind:{
        index:i,
        param:'img',
        obj:$('#mega_slider .parallax__group .parallax__layer').eq(i).find('span'),
      },
      onChange:function(e){
        e.preventDefault();
        var data=this;
        data.obj.css('background-image','url('+data.input.val()+')');
        slider_data[0].paralax[data.index].img=data.input.val();
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));
    tr.append(genSelect({
      list:posArr,
      val_list:pos_list,
      val_type:2,
      obj:$('#mega_slider .parallax__group .parallax__layer').eq(i).find('span'),
      gr:'paralax',
      index:i,
      param:'pos',
      parent:'td',
      start_option:'<option value="" code="">на весь экран</option>'
    }));
    tr.append(genInput({
      value:data.z,
      label:false,
      parent:'td',
      bind:{
        index:i,
        param:'img',
        obj:$('#mega_slider .parallax__group .parallax__layer').eq(i),
      },
      onChange:function(e){
        e.preventDefault();
        var data=this;
        data.obj.attr('z',data.input.val());
        slider_data[0].paralax[data.index].z=data.input.val();
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));

    var delBtn=$('<button/>',{
      text:"Удалить"
    });
    delBtn.on('click',function(e){
      e.preventDefault();
      var $this=$(this.el);
      i=$this.closest('tr').index()-1;
      $('#mega_slider .fixed_group .fixed__layer').eq(i).remove(); //удаляем слой на слайдере
      $this.closest('tr').remove(); //удаляем строку в таблице
      this.slider_data[0].paralax.splice(i, 1); //удаляем из конфига слайда
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      el:delBtn,
      slider_data:slider_data
    }));
    var delBtnTd=$('<td/>').append(delBtn);
    tr.append(delBtnTd);
    paralaxTable.append(tr)

    return {
      editor:tr,
      data:data
    }
  }

  function add_animation(el,data){
    var out=$('<div/>',{
      'class':'animation_layer'
    });

    if(typeof(data.show_delay)!='undefined'){
      out.addClass(show_delay[data.show_delay]);
      if(data.show_animation){
        out.addClass('slide_'+data.show_animation);
      }
    }

    if(typeof(data.hide_delay)!='undefined'){
      out.addClass(hide_delay[data.hide_delay]);
      if(data.hide_animation){
        out.addClass('slide_'+data.hide_animation);
      }
    }

    el.append(out);
    return el;
  }

  function generate_slide(data){
    var slide=$('<div class="slide"/>');

    var mob_bg=$('<a class="mob_bg" href="'+data.button.href+'"/>');
    mob_bg.css('background-image','url('+data.mobile+')')

    slide.append(mob_bg);
    if(mobile_mode){
      return slide;
    }

    //если есть фон то заполняем
    if(data.fon){
      slide.css('background-image','url('+data.fon+')')
    }

    //если есть паралакс слои заполняем
    if(data.paralax && data.paralax.length>0){
      var paralax_gr=$('<div class="parallax__group"/>');
      for(var i=0;i<data.paralax.length;i++){
        addParalaxLayer(data.paralax[i],paralax_gr)
      }
      slide.append(paralax_gr)
    }

    var fix=$('<div class="fixed_group"/>');
    for(var i=0;i<data.fixed.length;i++){
      addStaticLayer(data.fixed[i],fix)
    }

    var dop_blk=$("<div class='fixed__layer'/>");
    dop_blk.addClass(posArr[data.button.pos]);
    var but=$("<a class='slider__href'/>");
    but.attr('href',data.button.href);
    but.text(data.button.text);
    but.addClass(data.button.color);
    dop_blk=add_animation(dop_blk,data.button);
    dop_blk.find('div').append(but);
    fix.append(dop_blk);

    slide.append(fix);
    return slide;
  }

  function addParalaxLayer(data,paralax_gr){
    var parallax_layer=$('<div class="parallax__layer"\>');
    parallax_layer.attr('z',data.z||i*10);
    var dop_blk=$("<span class='slider__text'/>");
    if(data.pos) {
      dop_blk.addClass(posArr[data.pos]);
    }
    dop_blk.css('background-image','url('+data.img+')');
    parallax_layer.append(dop_blk);
    paralax_gr.append(parallax_layer);
  }

  function addStaticLayer(data,fix,befor_button){
    var dop_blk=$("<div class='fixed__layer'/>");
    dop_blk.addClass(posArr[data.pos]);
    if(data.full_height){
      dop_blk.addClass('fixed__full-height');
    }
    dop_blk=add_animation(dop_blk,data);
    dop_blk.find('.animation_layer').css('background-image','url('+data.img+')');

    if(befor_button){
      fix.find('.slider__href').closest('.fixed__layer').before(dop_blk)
    }else {
      fix.append(dop_blk)
    }
  }

  function next_slide() {
    if($('#mega_slider').hasClass('stop_slide'))return;

    var slide_points=$('.slide_select_box .slide_select')
    var slide_cnt=slide_points.length;
    var active=$('.slide_select_box .slider-active').index()+1;
    if(active>=slide_cnt)active=0;
    slide_points.eq(active).click();

    setTimeout(next_slide, scroll_period);
  }

  function img_to_load(src){
    var img=$('<img/>');
    img.on('load',function(){
      tot_img_wait--;

      if(tot_img_wait==0){

        slides.append(generate_slide(slider_data[render_slide_nom]));
        slide_select_box.find('li').eq(render_slide_nom).removeClass('disabled');

        if(render_slide_nom==0){
          slides.find('.slide')
            .addClass('first_show')
            .addClass('slider-active');
          slide_select_box.find('li').eq(0).addClass('slider-active');

          if(!editor) {
            setTimeout(function () {
              $(this).find('.first_show').removeClass('first_show');
            }.bind(slides), 5000);
          }

          if(mobile_mode===false) {
            parallax_group = $(container_id + ' .slider-active .parallax__group>*');
            parallax_counter = 0;
            parallax_timer = setInterval(render, 100);
          }

          if(editor){
            init_editor()
          }else {
            timeoutId = setTimeout(next_slide, scroll_period);

            $('.slide_select_box').on('click','.slide_select',function(){
              var $this=$(this);
              if($this.hasClass('slider-active'))return;

              var index = $this.index();
              $('.slide_select_box .slider-active').removeClass('slider-active');
              $this.addClass('slider-active');

              $(container_id+' .slide.slider-active').removeClass('slider-active');
              $(container_id+' .slide').eq(index).addClass('slider-active');

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
        if(render_slide_nom<slider_data.length){
          load_slide_img()
        }
      }
    }).on('error',function () {
      tot_img_wait--;
    });
    img.prop('src',src);
  }

  function load_slide_img(){
    var data=slider_data[render_slide_nom];
    tot_img_wait=1;

    if(mobile_mode===false){
      tot_img_wait++;
      img_to_load(data.fon);
      //если есть паралакс слои заполняем
      if(data.paralax && data.paralax.length>0){
        tot_img_wait+=data.paralax.length;
        for(var i=0;i<data.paralax.length;i++) {
          img_to_load(data.paralax[i].img)
        }
      }
      if(data.fixed && data.fixed.length>0) {
        tot_img_wait += data.fixed.length;
        for (var i = 0; i < data.fixed.length; i++) {
          img_to_load(data.fixed[i].img)
        }
      }
    }

    img_to_load(data.mobile);
  }

  function start_init_slide(data){
    var n = performance.now();
    var img=$('<img/>');
    img.attr('time',n);

    function on_img_load(){
      var n = performance.now();
      img=$(this);
      n=n-parseInt(img.attr('time'));
      if(n>max_time_load_pic){
        mobile_mode=true;
      }else{
        var max_size=(screen.height>screen.width?screen.height:screen.width);
        if(max_size<mobile_size){
          mobile_mode=true;
        }else{
          mobile_mode=false;
        }
      }
      if(mobile_mode==true){
        $(container_id).addClass('mobile_mode')
      }
      render_slide_nom=0;
      load_slide_img();
    };

    img.on('load',on_img_load());
    if(slider_data.length>0) {
      slider_data[0].mobile = slider_data[0].mobile + '?r=' + Math.random();
      img.prop('src', slider_data[0].mobile);
    }else{
      on_img_load().bind(img);
    }
  }

  function init(data,editor_init){
    slider_data=data;
    editor=editor_init;
    //находим контейнер и очищаем его
    var container=$(container_id);
    container.html('');

    //созжаем базовые контейнеры для самих слайдов и для переключателей
    slides=$('<div/>',{
      'class':'slides'
    });
    var slide_control=$('<div/>',{
      'class':'slide_control'
    });
    slide_select_box=$('<ul/>',{
      'class':'slide_select_box'
    });

    //добавляем индикатор загрузки
    var l='<div class="sk-folding-cube">'+
       '<div class="sk-cube1 sk-cube"></div>'+
       '<div class="sk-cube2 sk-cube"></div>'+
       '<div class="sk-cube4 sk-cube"></div>'+
       '<div class="sk-cube3 sk-cube"></div>'+
       '</div>';
    container.html(l);


    start_init_slide(data[0]);

    //генерируем кнопки и слайды
    for (var i=0;i<data.length;i++){
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

  function render(){
    if(!parallax_group)return false;
    var parallax_k=(parallax_counter-10)/2;

    for(var i=0;i<parallax_group.length;i++){
      var el=parallax_group.eq(i);
      var j=el.attr('z');
      var tr='rotate3d(0.1,0.8,0,'+(parallax_k)+'deg) scale('+(1+j*0.5)+') translateZ(-'+(10+j*20)+'px)';
      el.css('transform',tr)
    }
    parallax_counter+=parallax_d*0.1;
    if(parallax_counter>=20)parallax_d=-parallax_d;
    if(parallax_counter<=0)parallax_d=-parallax_d;
  }

  return {
    init: init
  };
}());

var headerActions = function () {
    var scrolledDown = false;
    var shadowedDown = false;

    $('.menu-toggle').click(function(e) {
        e.preventDefault();
        $('body').removeClass('no_scroll_account');
        $('.account-menu-toggle').removeClass('open');
        $('.account-menu').addClass('hidden');
        $('.header').toggleClass('header_open-menu');
        $('.drop-menu').removeClass('open').removeClass('close').find('li').removeClass('open').removeClass('close');
        if ($('.header').hasClass('header_open-menu')) {
            $('.header').removeClass('header-search-open');
            $('body').addClass('no_scroll');
        }else{
            $('body').removeClass('no_scroll');
        }
    });

    $('.search-toggle').click(function(e) {
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

    $('.header-search_form-button').click(function(e){
        e.preventDefault();
        $(this).closest('form').submit();
    });

    $('.header-secondline_close').click(function(e){
        $('.header').removeClass('header_open-menu');
        $('.account-menu').addClass('hidden');
        $('body').removeClass('no_scroll');
        $('body').removeClass('no_scroll_account');
    });

    $('.header-upline').on('mouseover', function(e){
        $('.header-secondline').removeClass('scroll-down');
        $('body').removeClass('no_scroll');
        scrolledDown = false;
    });

    $(window).on('load resize scroll',function() {
        var shadowHeight = 50;
        var hideHeight = 200;
        var headerSecondLine = $('.header-secondline');
        var hovers = headerSecondLine.find(':hover');
        var header = $('.header');

        if (!hovers.length) {
            headerSecondLine.removeClass('scrollable');
            header.removeClass('scrollable');
            //document.documentElement.scrollTop
            var scrollTop=$(window).scrollTop();
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

    $('.menu_angle-down, .drop-menu_group__up-header').click(function(e) {
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

    $('.account-menu-toggle').click(function(e){
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
    function menuAccountUp(toggleButton)
    {
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

    $('.catalog-categories-account_menu-header').on('mouseover', function(){
        accountMenuOpenTime = new Date();
    });
    $('.account-menu').click(function(e){
        if ($(e.target).hasClass('account-menu')) {
            $(e.target).addClass('hidden');
            $('.account-menu-toggle').removeClass('open');
        }
    });


}();





$(function() {
    function parseNum(str){
        return parseFloat(
            String(str)
                .replace(',','.')
                .match(/-?\d+(?:\.\d+)?/g, '') || 0
            , 10
        );
    }

    $('.short-calc-cashback').find('select,input').on('change keyup click',function () {
        var $this=$(this).closest('.short-calc-cashback');
        var curs=parseNum($this.find('select').val());
        var val=$this.find('input').val();
        if (parseNum(val) != val) {
            val=$this.find('input').val(parseNum(val));
        }
        val=parseNum(val);

        var koef=$this.find('input').attr('data-cashback').trim();
        var promo=$this.find('input').attr('data-cashback-promo').trim();
        var currency=$this.find('input').attr('data-cashback-currency').trim();
        var result = 0;
        var out = 0;

        if (koef==promo) {
            promo=0;
        }

        if(koef.indexOf('%')>0){
            result=parseNum(koef)*val*curs/100;
        }else{
            curs=parseNum($this.find('[code='+currency+']').val());
            result=parseNum(koef)*curs
        }

        if(parseNum(promo)>0) {
            if(promo.indexOf('%')>0){
                promo=parseNum(promo)*val*curs/100;
            }else{
                promo=parseNum(promo)*curs
            }

            if(promo>0) {
                out = "<span class=old_price>" + result.toFixed(2) + "</span> " + promo.toFixed(2)
            }else{
                out=result.toFixed(2)
            }
        }else{
            out=result.toFixed(2)
        }


        $this.find('.calc-result_value').html(out)
    }).click()
});
(function () {
  var els=$('.auto_hide_control');
  if(els.length==0)return;

  $(document).on('click',".scroll_box-show_more",function(e){
    e.preventDefault();
    var data={
      buttonYes:false,
      notyfy_class:"notify_white notify_not_big"
    };

    $this=$(this);
    var content = $this.closest('.scroll_box-item').clone();
    content=content[0];
    content.className += ' scroll_box-item-modal';
    var div = document.createElement('div');
    div.className = 'comments';
    div.append(content);
    $(div).find('.scroll_box-show_more').remove();
    $(div).find('.max_text_hide')
      .removeClass('max_text_hide-x2')
      .removeClass('max_text_hide');
    data.question= div.outerHTML;

    notification.alert(data);
  });


  function hasScroll(el) {
    return el.scrollHeight>el.clientHeight;
  }

  function rebuild(){
    for(var i=0;i<els.length;i++){
      var el=els.eq(i);
      var is_hide=false;
      if(el.height()<10){
        is_hide=true;
        el.closest('.scroll_box-item-hide').show(0);
      }

      var text=el.find('.scroll_box-text');
      var answer=el.find('.scroll_box-answer');
      var show_more=el.find('.scroll_box-show_more');

      var show_btn=false;
      if(hasScroll(text[0])){
        show_btn=true;
        text.removeClass('max_text_hide-hide');
      }else{
        text.addClass('max_text_hide-hide');
      }

      if(answer.length>0){
        //есть ответ админа
        if(hasScroll(answer[0])){
          show_btn=true;
          answer.removeClass('max_text_hide-hide');
        }else{
          answer.addClass('max_text_hide-hide');
        }
      }

      if(show_btn){
        show_more.show();
      }else{
        show_more.hide();
      }

      if(is_hide){
        el.closest('.scroll_box-item-hide').hide(0);
      }
    }
  }

  $(window).resize(rebuild);
  rebuild();
})();

(function () {
  $('body').on('click','.show_all',function(e){
    e.preventDefault();
    var cls=$(this).data('cntrl-class');
    $('.hide_all[data-cntrl-class]').show();
    $(this).hide();
    $('.'+cls).show();
  });

  $('body').on('click','.hide_all',function(e){
    e.preventDefault();
    var cls=$(this).data('cntrl-class');
    $('.show_all[data-cntrl-class]').show();
    $(this).hide();
    $('.'+cls).hide();
  });
})();

$( document ).ready(function() {
  function declOfNum(number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
  }

  function firstZero(v){
    v=Math.floor(v);
    if(v<10)
      return '0'+v;
    else
      return v;
  }

  var clocks=$('.clock');
  if(clocks.length>0){
    function updateClock(){
      var clocks=$(this);
      var now=new Date();
      for(var i=0;i<clocks.length;i++){
        var c=clocks.eq(i);
        var end=new Date(c.data('end').replace(/-/g, "/"));
        var d=(end.getTime()-now.getTime())/ 1000;

        //если срок прошел
        if(d<=0){
          c.text('Промокод истек');
          c.addClass('clock-expired');
          continue;
        }

        //если срок более 30 дней
        if(d>30*60*60*24){
          c.html('Осталось: <span>более 30 дней</span>');
          continue;
        }

        var s=d % 60;
        d=(d-s)/60;
        var m=d % 60;
        d=(d-m)/60;
        var h=d % 24;
        d=(d-h)/24;

        var str=firstZero(h)+":"+firstZero(m)+":"+firstZero(s);
        if(d>0){
          str=d+" "+declOfNum(d, ['день', 'дня', 'дней'])+"  "+str;
        }
        c.html("Осталось: <span>"+str+"</span>");
      }
    }

    setInterval(updateClock.bind(clocks),1000);
    updateClock.bind(clocks)();
  }

});
var catalogTypeSwitcher = function() {
    var catalog = $('.catalog_list');
    if(catalog.length==0)return;

    $('.catalog-stores_switcher-item-button').click(function (e) {
        e.preventDefault();
        $(this).parent().siblings().find('.catalog-stores_switcher-item-button').removeClass('checked');
        $(this).addClass('checked');
        if (catalog) {
            if ($(this).hasClass('catalog-stores_switcher-item-button-type-list')) {
                catalog.removeClass('narrow');
                setCookie('coupons_view','')
            }
            if ($(this).hasClass('catalog-stores_switcher-item-button-type-narrow')) {
                catalog.addClass('narrow');
                setCookie('coupons_view','narrow');
            }
        }
    });

    if(getCookie('coupons_view')=='narrow' && !catalog.hasClass('narrow_off')){
        catalog.addClass('narrow');
        $('.catalog-stores_switcher-item-button-type-narrow').addClass('checked');
        $('.catalog-stores_switcher-item-button-type-list').removeClass('checked');
    }
}();
$(function () {
    $('.sd-select-selected').click(function(){
        var parent = $(this).parent();
        var dropBlock = $(parent).find('.sd-select-drop');

        if( dropBlock.is(':hidden') ) {
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
search = function() {
    var openAutocomplete;

    $('.search-form-input').on('input', function(e){
        e.preventDefault();
        $this=$(this);
        var query = $this.val();
        var data = $this.closest('form').serialize();
        var autocomplete = $this.closest('.stores_search').find('.autocomplete-wrap');// $('#autocomplete'),
        var autocompleteList = $(autocomplete).find('ul');
        openAutocomplete  = autocomplete;
        if (query.length>1) {
            url=$this.closest('form').attr('action')||'/search';
            $.ajax({
                url: url,
                type: 'get',
                data: data,
                dataType: 'json',
                success: function(data){
                    if (data.suggestions) {
                        if (autocomplete) {
                            $(autocompleteList).html('');
                        }
                        if (data.suggestions.length) {
                            data.suggestions.forEach(function(item){
                                var html = '<a class="autocomplete_link" href="'+item.data.route+'"'+'>'+item.value+item.cashback+'</a>';
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
    }).on('focusout',function(e){
        if (!$(e.relatedTarget).hasClass('autocomplete_link')) {
            //$('#autocomplete').hide();
            $(openAutocomplete).delay( 100 ).slideUp(100)
        }
    });

    $('body').on('submit', '.stores-search_form', function(e) {
        var val = $(this).find('.search-form-input').val();
        if (val.length < 2) {
            return false;
        }
    })

}();

(function(){

    $('.coupons-list_item-content-goto-promocode-link').click(function(e){
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
        }  else if (expired.length > 0) {
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
            var data={
                'buttonYes':false,
                'notyfy_class': "notify_box-alert",
                'title': 'Использовать промокод',
                'question':
                    '<div class="notify_box-coupon-noregister">'+
                        '<img src="/images/templates/swa.png" alt="">'+
                        '<p><b>Если вы хотите получать еще и КЭШБЭК (возврат денег), вам необходимо зарегистрироваться. Но можете и просто воспользоваться промокодом, без кэшбэка.</b></p>'+
                    '</div>'+
                    '<div class="notify_box-buttons">'+
                        '<a href="'+that.attr('href')+'" target="_blank" class="btn">Использовать промокод</a>'+
                        '<a href="#registration" class="btn btn-transform modals_open">Зарегистрироваться</a>'+
                    '</div>'
            };
            notification.alert(data);
            return false;
        }
    });

}());
(function() {
    $('.account-withdraw-methods_item-option').click(function(e){
        e.preventDefault();
        var option = $(this).data('option-process'),
            placeholder = '';
        switch(option) {
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
(function(){

    ajaxForm($('.ajax_form'));

})();
(function(){

    $('.dobro-funds_item-button').click(function(e){
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
      '<svg width="200" height="200" viewBox="0 0 200 200"><path transform="matrix(1,0,0,-1,130.84,112.7)" d="M0 0C-1.6 0.9-9.4 5.1-10.8 5.7-12.3 6.3-13.4 6.6-14.5 5-15.6 3.4-18.9-0.1-19.9-1.1-20.8-2.2-21.8-2.3-23.4-1.4-25-0.5-30.1 1.4-36.1 7.1-40.7 11.5-43.7 17-44.6 18.6-45.5 20.3-44.6 21.1-43.8 21.9-43 22.6-42.1 23.7-41.3 24.6-40.4 25.5-40.1 26.2-39.5 27.2-39 28.3-39.2 29.3-39.6 30.1-39.9 30.9-42.9 39-44.1 42.3-45.3 45.5-46.7 45-47.6 45.1-48.6 45.1-49.6 45.3-50.7 45.3-51.8 45.4-53.6 45-55.1 43.5-56.6 41.9-61 38.2-61.3 30.2-61.6 22.3-56.1 14.4-55.3 13.3-54.5 12.2-44.8-5.1-28.6-12.1-12.4-19.2-12.4-17.1-9.4-16.9-6.4-16.8 0.3-13.4 1.8-9.6 3.3-5.9 3.4-2.7 3-2 2.6-1.3 1.6-0.9 0 0M-29.7-38.3C-40.4-38.3-50.3-35.1-58.6-29.6L-78.9-36.1-72.3-16.5C-78.6-7.8-82.3 2.8-82.3 14.4-82.3 43.4-58.7 67.1-29.7 67.1-0.6 67.1 23 43.4 23 14.4 23-14.7-0.6-38.3-29.7-38.3M-29.7 77.6C-64.6 77.6-92.9 49.3-92.9 14.4-92.9 2.4-89.6-8.8-83.9-18.3L-95.3-52.2-60.2-41C-51.2-46-40.8-48.9-29.7-48.9 5.3-48.9 33.6-20.6 33.6 14.4 33.6 49.3 5.3 77.6-29.7 77.6"/></svg>',
      '<svg width="200" height="200" viewBox="0 0 200 200"><path transform="matrix(1,0,0,-1,135.33,119.85)" d="M0 0C-2.4-5.4-6.5-9-12.2-10.6-14.3-11.2-16.3-10.7-18.2-9.9-44.4 1.2-63.3 19.6-74 46.2-74.8 48.1-75.3 50.1-75.2 51.9-75.2 58.7-69.2 65-62.6 65.4-60.8 65.5-59.2 64.9-57.9 63.7-53.3 59.3-49.6 54.3-46.9 48.6-45.4 45.5-46 43.3-48.7 41.1-49.1 40.7-49.5 40.4-50 40.1-53.5 37.5-54.3 34.9-52.6 30.8-49.8 24.2-45.4 19-39.3 15.1-37 13.6-34.7 12.2-32 11.5-29.6 10.8-27.7 11.5-26.1 13.4-25.9 13.6-25.8 13.9-25.6 14.1-22.3 18.8-18.6 19.6-13.7 16.5-9.6 13.9-5.6 11-1.8 7.8 0.7 5.6 1.3 3 0 0M-18.2 36.7C-18.3 35.9-18.3 35.4-18.4 34.9-18.6 34-19.2 33.4-20.2 33.4-21.3 33.4-21.9 34-22.2 34.9-22.3 35.5-22.4 36.2-22.5 36.9-23.2 40.3-25.2 42.6-28.6 43.6-29.1 43.7-29.5 43.7-29.9 43.8-31 44.1-32.4 44.2-32.4 45.8-32.5 47.1-31.5 47.9-29.6 48-28.4 48.1-26.5 47.5-25.4 46.9-20.9 44.7-18.7 41.6-18.2 36.7M-25.5 51.2C-28 52.1-30.5 52.8-33.2 53.2-34.5 53.4-35.4 54.1-35.1 55.6-34.9 57-34 57.5-32.6 57.4-24 56.6-17.3 53.4-12.6 46-10.5 42.5-9.2 37.5-9.4 33.8-9.5 31.2-9.9 30.5-11.4 30.5-13.6 30.6-13.3 32.4-13.5 33.7-13.7 35.7-14.2 37.7-14.7 39.7-16.3 45.4-19.9 49.3-25.5 51.2M-38 64.4C-37.9 65.9-37 66.5-35.5 66.4-23.2 65.8-13.9 62.2-6.7 52.5-2.5 46.9-0.2 39.2 0 32.2 0 31.1 0 30 0 29-0.1 27.8-0.6 26.9-1.9 26.9-3.2 26.9-3.9 27.6-4 29-4.3 34.2-5.3 39.3-7.3 44.1-11.2 53.5-18.6 58.6-28.1 61.1-30.7 61.7-33.2 62.2-35.8 62.5-37 62.5-38 62.8-38 64.4M11.5 74.1C6.6 78.3 0.9 80.8-5.3 82.4-20.8 86.5-36.5 87.5-52.4 85.3-60.5 84.2-68.3 82.1-75.4 78.1-83.8 73.4-89.6 66.6-92.2 57.1-94 50.4-94.9 43.6-95.2 36.6-95.7 26.4-95.4 16.3-92.8 6.3-89.8-5.3-83.2-13.8-71.9-18.3-70.7-18.8-69.5-19.5-68.3-20-67.2-20.4-66.8-21.2-66.8-22.4-66.9-30.4-66.8-38.4-66.8-46.7-63.9-43.9-61.8-41.8-60.3-40.1-55.9-35.1-51.7-30.9-47.1-26.1-44.7-23.7-45.7-23.8-42.1-23.8-37.8-23.9-31-24.1-26.8-23.8-18.6-23.1-10.6-22.1-2.7-19.7 7.2-16.7 15.2-11.4 19.2-1.3 20.3 1.3 21.4 4 22 6.8 25.9 22.9 25.4 38.9 22.2 55 20.6 62.4 17.5 69 11.5 74.1"/></svg>',
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
    $('body').on('click','.modals_open',function (e) {
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

        var href=this.href.split('#');
        href=href[href.length-1];
        var notyClass = $(this).data('notyclass');
        var data={
            buttonYes:false,
            notyfy_class:"loading "+(href.indexOf('video')===0?'modals-full_screen':'notify_white')+' '+notyClass,
            question:''
        };
        notification.alert(data);

        $.get('/'+href,function(data){
            $('.notify_box').removeClass('loading');
            $('.notify_box .notify_content').html(data.html);
            ajaxForm($('.notify_box .notify_content'));
        },'json');

        //console.log(this);
        return false;
    })
}());

$('.footer-menu-title').on('click', function (e) {
  $this=$(this);
  if($this.hasClass('footer-menu-title_open')){
    $this.removeClass('footer-menu-title_open')
  }else{
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
$( document ).ready(function() {
  $(".favorite-link").on('click',function(e) {
    e.preventDefault();

    var self = $(this);
    var type = self.attr("data-state"),
      affiliate_id = self.attr("data-affiliate-id");

    if(!affiliate_id){
      notification.notifi({
          title:"Необходимо авторизоваться",
          message:'Добавить в избранное может только авторизованный пользователь.</br>'+
            '<a href="#login" class="modals_open">Вход</a>  / <a href="#registration" class="modals_open">Регистрация</a>',
          type:'info'
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

    $.post("/account/favorites",{
      "type" : type ,
      "affiliate_id": affiliate_id
    },function (data) {
      self.removeClass('disabled');
      if(data.error){
        self.find('svg').removeClass("spin");
        notification.notifi({message:data.error,type:'err','title':(data.title?data.title:false)});
        return;
      }

      notification.notifi({
        message:data.msg,
        type:'success',
        'title':(data.title?data.title:false)
      });

      if(type == "add") {
        self.find(".item_icon").addClass("svg-no-fill");
      }

      self.attr({
        "data-state": data["data-state"],
        "data-original-title": data['data-original-title']
      });

      if(type == "add") {
        self.find("svg").removeClass("spin svg-no-fill");
      } else if(type == "delete") {
        self.find("svg").removeClass("spin").addClass("svg-no-fill");
      }

    },'json').fail(function() {
      self.removeClass('disabled');
      notification.notifi({message:"<b>Технические работы!</b><br>В данный момент времени" +
      " произведённое действие невозможно. Попробуйте позже." +
      " Приносим свои извинения за неудобство.",type:'err'});

      if(type == "add") {
        self.find("svg").addClass("svg-no-fill");
      }
      self.find("svg").removeClass("spin");
    })
  });
});
$(document).ready(function(){
  $('.scroll_to').click( function(e){ // ловим клик по ссылке с классом go_to
    var scroll_el = $(this).attr('href'); // возьмем содержимое атрибута href, должен быть селектором, т.е. например начинаться с # или .
    scroll_el=$(scroll_el);
    if (scroll_el.length != 0) { // проверим существование элемента чтобы избежать ошибки
      e.preventDefault();
      $('html, body').animate({ scrollTop: scroll_el.offset().top-$('#header>*').eq(0).height()-50 }, 500); // анимируем скроолинг к элементу scroll_el
      if(scroll_el.hasClass('accordion') && !scroll_el.hasClass('open')){
        scroll_el.find('.accordion-control').click();
      }
    }
    return false; // выключаем стандартное действие
  });
});
$( document ).ready(function() {
  $("body").on('click','.set_clipboard', function (e) {
    e.preventDefault();
    var $this = $(this);
    copyToClipboard($this.data('clipboard'),$this.data('clipboard-notify'));
  });

  function copyToClipboard(code,msg) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(code).select();
    document.execCommand("copy");
    $temp.remove();

    if(!msg){
      msg="Данные успешно скопированы в буфер обмена";
    }
    notification.notifi({'type':'info','message':msg,'title':'Успешно'})
  }

  $("body").on('click',"input.link",function(){	// получение фокуса текстовым полем-ссылкой
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
    data=this;
    if(data.type==0) {
      data.img.attr('src', data.src);
    }else{
      data.img.css('background-image', 'url('+data.src+')');
      data.img.removeClass('no_ava');
    }
  }

  //тест лого магазина
  imgs=$('section:not(.navigation)').find('.logo img');
  for (var i=0;i<imgs.length;i++){
    img=imgs.eq(i);
    src=img.attr('src');
    img.attr('src','/images/template-logo.jpg');
    data={
      src:src,
      img:img,
      type:0 // для img[src]
    };
    image=$('<img/>',{
      src:src
    }).on('load',img_load_finish.bind(data))
  }

  //тест аватарок в коментариях
  imgs=$('.comment-photo');
  for (var i=0;i<imgs.length;i++){
    img=imgs.eq(i);
    if(img.hasClass('no_ava')){
      continue;
    }

    var src=img.css('background-image');
    src=src.replace('url("','');
    src=src.replace('")','');
    img.addClass('no_ava');

    img.css('background-image','url(/images/no_ava.png)');
    data={
      src:src,
      img:img,
      type:1 // для фоновых картинок
    };
    image=$('<img/>',{
      src:src
    }).on('load',img_load_finish.bind(data))
  }
});
//если открыто как дочернее
(function(){
  if(!window.opener)return;

  href=window.opener.location.href;
  if(
    href.indexOf('account/offline')>0
  ){
    window.print()
  }

  if(document.referrer.indexOf('secretdiscounter')<0)return;

  if(
    href.indexOf('socials')>0 ||
    href.indexOf('login')>0 ||
    href.indexOf('admin')>0 ||
    href.indexOf('account')>0
  ){
    return;
  }
  if(href.indexOf('store')>0 || href.indexOf('coupon')>0 || href.indexOf('settings')>0){
    window.opener.location.reload();
  }else{
    window.opener.location.href=location.href;
  }
  window.close();
})();

$( document ).ready(function() {
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

  $('.dublicate_value').on('change',function () {
    var $this=$(this);
    var sel=$($this.data('selector'));
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
      var k=j+1;
      var td = tr.find('td:nth-child('+k+')');
      td.attr('label',th.eq(j).text());
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



//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsInRpcHNvLm1pbi5qcyIsInRvb2x0aXAuanMiLCJhY2NvdW50X25vdGlmaWNhdGlvbi5qcyIsInNsaWRlci5qcyIsImhlYWRlcl9tZW51X2FuZF9zZWFyY2guanMiLCJjYWxjLWNhc2hiYWNrLmpzIiwiYXV0b19oaWRlX2NvbnRyb2wuanMiLCJoaWRlX3Nob3dfYWxsLmpzIiwiY2xvY2suanMiLCJsaXN0X3R5cGVfc3dpdGNoZXIuanMiLCJzZWxlY3QuanMiLCJzZWFyY2guanMiLCJnb3RvLmpzIiwiYWNjb3VudC13aXRoZHJhdy5qcyIsImFqYXguanMiLCJkb2Jyby5qcyIsImxlZnQtbWVudS10b2dnbGUuanMiLCJzaGFyZTQyLmpzIiwibm90aWZpY2F0aW9uLmpzIiwibW9kYWxzLmpzIiwiZm9vdGVyX21lbnUuanMiLCJyYXRpbmcuanMiLCJmYXZvcml0ZXMuanMiLCJzY3JvbGxfdG8uanMiLCJjb3B5X3RvX2NsaXBib2FyZC5qcyIsImltZy5qcyIsInBhcmVudHNfb3Blbl93aW5kb3dzLmpzIiwiZm9ybXMuanMiLCJjb29raWUuanMiLCJ0YWJsZS5qcyIsImFqYXhfcmVtb3ZlLmpzIiwiZml4ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqTUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2g4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJvYmplY3RzID0gZnVuY3Rpb24gKGEsYikge1xuICAgIHZhciBjID0gYixcbiAgICAgICAga2V5O1xuICAgIGZvciAoa2V5IGluIGEpIHtcbiAgICAgICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGM7XG59O1xuXG5mdW5jdGlvbiBsb2dpbl9yZWRpcmVjdChuZXdfaHJlZil7XG4gICAgaHJlZj1sb2NhdGlvbi5ocmVmO1xuICAgIGlmKGhyZWYuaW5kZXhPZignc3RvcmUnKT4wIHx8IGhyZWYuaW5kZXhPZignY291cG9uJyk+MCl7XG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1lbHNle1xuICAgICAgICBsb2NhdGlvbi5ocmVmPW5ld19ocmVmO1xuICAgIH1cbn1cbiIsIihmdW5jdGlvbiAodywgZCwgJCkge1xuICAgIHZhciBzY3JvbGxzX2Jsb2NrID0gJCgnLnNjcm9sbF9ib3gnKTtcblxuICAgIGlmKHNjcm9sbHNfYmxvY2subGVuZ3RoPT0wKSByZXR1cm47XG4gICAgLy8kKCc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC13cmFwXCI+PC9kaXY+Jykud3JhcEFsbChzY3JvbGxzX2Jsb2NrKTtcbiAgICAkKHNjcm9sbHNfYmxvY2spLndyYXAoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKTtcblxuICAgIGluaXRfc2Nyb2xsKCk7XG4gICAgY2FsY19zY3JvbGwoKTtcblxuICAgIHZhciB0MSx0MjtcblxuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24gKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodDEpO1xuICAgICAgICBjbGVhclRpbWVvdXQodDIpO1xuICAgICAgICB0MT1zZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLDMwMCk7XG4gICAgICAgIHQyPXNldFRpbWVvdXQoY2FsY19zY3JvbGwsODAwKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGluaXRfc2Nyb2xsKCkge1xuICAgICAgICB2YXIgY29udHJvbCA9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sXCI+PC9kaXY+JztcbiAgICAgICAgY29udHJvbD0kKGNvbnRyb2wpO1xuICAgICAgICBjb250cm9sLmluc2VydEFmdGVyKHNjcm9sbHNfYmxvY2spO1xuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApO1xuXG4gICAgICAgIHNjcm9sbHNfYmxvY2sucHJlcGVuZCgnPGRpdiBjbGFzcz1zY3JvbGxfYm94LW1vdmVyPjwvZGl2PicpO1xuXG4gICAgICAgIGNvbnRyb2wub24oJ2NsaWNrJywnLnNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcsZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgIHZhciBjb250cm9sID0gJHRoaXMucGFyZW50KCk7XG4gICAgICAgICAgICB2YXIgaSA9ICR0aGlzLmluZGV4KCk7XG4gICAgICAgICAgICBpZigkdGhpcy5oYXNDbGFzcygnYWN0aXZlJykpcmV0dXJuO1xuICAgICAgICAgICAgY29udHJvbC5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgICAgICAgICB2YXIgZHg9Y29udHJvbC5kYXRhKCdzbGlkZS1keCcpO1xuICAgICAgICAgICAgdmFyIGVsID0gY29udHJvbC5wcmV2KCk7XG4gICAgICAgICAgICBlbC5maW5kKCcuc2Nyb2xsX2JveC1tb3ZlcicpLmNzcygnbWFyZ2luLWxlZnQnLC1keCppKTtcbiAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgaSk7XG5cbiAgICAgICAgICAgIHN0b3BTY3JvbC5iaW5kKGVsKSgpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGopO1xuICAgICAgICBlbC5wYXJlbnQoKS5ob3ZlcihzdG9wU2Nyb2wuYmluZChlbCksc3RhcnRTY3JvbC5iaW5kKGVsKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RhcnRTY3JvbCgpe1xuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKTtcbiAgICAgICAgaWYoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xuXG4gICAgICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUuYmluZCgkdGhpcyksIDIwMDApO1xuICAgICAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLHRpbWVvdXRJZClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdG9wU2Nyb2woKXtcbiAgICAgICAgdmFyICR0aGlzPSQodGhpcyk7XG4gICAgICAgIHZhciB0aW1lb3V0SWQ9JHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJyk7XG4gICAgICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsZmFsc2UpO1xuICAgICAgICBpZighJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSB8fCAhdGltZW91dElkKXJldHVybjtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcbiAgICAgICAgdmFyICR0aGlzPSQodGhpcyk7XG4gICAgICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsZmFsc2UpO1xuICAgICAgICBpZighJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XG5cbiAgICAgICAgdmFyIGNvbnRyb2xzPSR0aGlzLm5leHQoKS5maW5kKCc+KicpO1xuICAgICAgICB2YXIgYWN0aXZlPSR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xuICAgICAgICB2YXIgcG9pbnRfY250PWNvbnRyb2xzLmxlbmd0aDtcbiAgICAgICAgaWYoIWFjdGl2ZSlhY3RpdmU9MDtcbiAgICAgICAgYWN0aXZlKys7XG4gICAgICAgIGlmKGFjdGl2ZT49cG9pbnRfY250KWFjdGl2ZT0wO1xuICAgICAgICAkdGhpcy5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xuXG4gICAgICAgIGNvbnRyb2xzLmVxKGFjdGl2ZSkuY2xpY2soKTtcbiAgICAgICAgc3RhcnRTY3JvbC5iaW5kKCR0aGlzKSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGNfc2Nyb2xsKCkge1xuICAgICAgICBmb3IoaT0wO2k8c2Nyb2xsc19ibG9jay5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGkpO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2wgPSBlbC5uZXh0KCk7XG4gICAgICAgICAgICB2YXIgd2lkdGhfbWF4ID0gZWwuZGF0YSgnc2Nyb2xsLXdpZHRoLW1heCcpO1xuICAgICAgICAgICAgdyA9IGVsLndpZHRoKCk7XG5cbiAgICAgICAgICAgIC8v0LTQtdC70LDQtdC8INC60L7QvdGC0YDQvtC70Ywg0L7Qs9GA0LDQvdC40YfQtdC90LjRjyDRiNC40YDQuNC90YsuINCV0YHQu9C4INC/0YDQtdCy0YvRiNC10L3QviDRgtC+INC+0YLQutC70Y7Rh9Cw0LXQvCDRgdC60YDQvtC7INC4INC/0LXRgNC10YXQvtC00LjQvCDQuiDRgdC70LXQtNGD0Y7RidC10LzRgyDRjdC70LXQvNC10L3RgtGDXG4gICAgICAgICAgICBpZiAod2lkdGhfbWF4ICYmIHcgPiB3aWR0aF9tYXgpIHtcbiAgICAgICAgICAgICAgICBjb250cm9sLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG5vX2NsYXNzID0gZWwuZGF0YSgnc2Nyb2xsLWVsZW1ldC1pZ25vcmUtY2xhc3MnKTtcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IGVsLmZpbmQoJz4qJykubm90KCcuc2Nyb2xsX2JveC1tb3ZlcicpO1xuICAgICAgICAgICAgaWYgKG5vX2NsYXNzKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5ub3QoJy4nICsgbm9fY2xhc3MpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v0JXRgdC70Lgg0L3QtdGCINC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuID09IDApIHtcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBmX2VsPWNoaWxkcmVuLmVxKDEpO1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuX3cgPSBmX2VsLm91dGVyV2lkdGgoKTsgLy/QstGB0LXQs9C+INC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxuICAgICAgICAgICAgY2hpbGRyZW5fdys9cGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLWxlZnQnKSk7XG4gICAgICAgICAgICBjaGlsZHJlbl93Kz1wYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tcmlnaHQnKSk7XG5cbiAgICAgICAgICAgIHZhciBzY3JlYW5fY291bnQgPSBNYXRoLmZsb29yKHcgLyBjaGlsZHJlbl93KTtcblxuICAgICAgICAgICAgLy/QldGB0LvQuCDQstGB0LUg0LLQu9Cw0LfQuNGCINC90LAg0Y3QutGA0LDQvVxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuIDw9IHNjcmVhbl9jb3VudCkge1xuICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/Qo9C20LUg0YLQvtGH0L3QviDQt9C90LDQtdC8INGH0YLQviDRgdC60YDQvtC7INC90YPQttC10L1cbiAgICAgICAgICAgIGVsLmFkZENsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG5cbiAgICAgICAgICAgIHZhciBwb2ludF9jbnQgPSBjaGlsZHJlbi5sZW5ndGggLSBzY3JlYW5fY291bnQgKyAxO1xuICAgICAgICAgICAgLy/QtdGB0LvQuCDQvdC1INC90LDQtNC+INC+0LHQvdC+0LLQu9GP0YLRjCDQutC+0L3RgtGA0L7QuyDRgtC+INCy0YvRhdC+0LTQuNC8LCDQvdC1INC30LDQsdGL0LLQsNGPINC+0LHQvdC+0LLQuNGC0Ywg0YjQuNGA0LjQvdGDINC00L7Rh9C10YDQvdC40YVcbiAgICAgICAgICAgIGlmIChjb250cm9sLmZpbmQoJz4qJykubGVuZ3RoID09IHBvaW50X2NudCkge1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWN0aXZlID0gZWwuZGF0YSgnc2xpZGUtYWN0aXZlJyk7XG4gICAgICAgICAgICBpZiAoIWFjdGl2ZSlhY3RpdmUgPSAwO1xuICAgICAgICAgICAgaWYgKGFjdGl2ZSA+PSBwb2ludF9jbnQpYWN0aXZlID0gcG9pbnRfY250IC0gMTtcbiAgICAgICAgICAgIHZhciBvdXQgPSAnJztcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcG9pbnRfY250OyBqKyspIHtcbiAgICAgICAgICAgICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnKyhqPT1hY3RpdmU/JyBhY3RpdmUnOicnKSsnXCI+PC9kaXY+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRyb2wuaHRtbChvdXQpO1xuXG4gICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XG4gICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWNvdW50JywgcG9pbnRfY250KTtcbiAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcblxuICAgICAgICAgICAgaWYoIWVsLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpKXtcbiAgICAgICAgICAgICAgICBzdGFydFNjcm9sLmJpbmQoZWwpKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSkpOyIsInZhciBhY2NvcmRpb25Db250cm9sID0gJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKTtcblxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcblxuXG4gIGlmICgkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tdGl0bGUnKS5oYXNDbGFzcygnYWNjb3JkaW9uLXRpdGxlLWRpc2FibGVkJykpcmV0dXJuO1xuXG4gIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAvKmlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKXtcbiAgICAgcmV0dXJuIGZhbHNlO1xuICAgICB9Ki9cbiAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlVXAoMzAwKTtcbiAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcbiAgfSBlbHNlIHtcbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJykpIHtcbiAgICAgICRvdGhlciA9ICQoJy5hY2NvcmRpb24tb25seV9vbmUnKTtcbiAgICAgICRvdGhlci5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKVxuICAgICAgICAuc2xpZGVVcCgzMDApXG4gICAgICAgIC5yZW1vdmVDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG4gICAgICAkb3RoZXIucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnbGFzdC1vcGVuJyk7XG5cbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnbGFzdC1vcGVuJyk7XG4gICAgfVxuICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2xpZGVEb3duKDMwMCk7XG4gICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn0pO1xuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XG5cblxuJCgnLmFjY29yZGlvbi13cmFwLm9wZW5fZmlyc3QgLmFjY29yZGlvbjpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XG4kKCcuYWNjb3JkaW9uLXdyYXAgLmFjY29yZGlvbi5hY2NvcmRpb24tc2xpbTpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XG4kKCcuYWNjb3JkaW9uLXNsaW0nKS5hZGRDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJyk7XG5cbi8v0LTQu9GPINGB0LjQvNC+0LIg0L7RgtC60YDRi9Cy0LDQtdC8INC10YHQu9C4INC10YHRgtGMINC/0L7QvNC10YLQutCwIG9wZW4g0YLQviDQv9GA0LjRgdCy0LDQuNCy0LDQtdC8INCy0YHQtSDQvtGB0YLQsNC70YzQvdGL0LUg0LrQu9Cw0YHRi1xuYWNjb3JkaW9uU2xpbSA9ICQoJy5hY2NvcmRpb24uYWNjb3JkaW9uLW9ubHlfb25lJyk7XG5pZiAoYWNjb3JkaW9uU2xpbS5sZW5ndGggPiAwKSB7XG4gIGFjY29yZGlvblNsaW0ucGFyZW50KCkuZmluZCgnLmFjY29yZGlvbi5vcGVuJylcbiAgICAuYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpXG4gICAgLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXG4gICAgLnNob3coMzAwKVxuICAgIC5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG59XG5cbiQoJ2JvZHknKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcbiAgJCgnLmFjY29yZGlvbl9mdWxsc2NyZWFuX2Nsb3NlLm9wZW4gLmFjY29yZGlvbi1jb250cm9sOmZpcnN0LWNoaWxkJykuY2xpY2soKVxufSk7XG5cbiQoJy5hY2NvcmRpb24tY29udGVudCcpLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpIHtcbiAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgIT0gJ0EnKSB7XG4gICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hY2NvcmRpb24nKS5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wuYWNjb3JkaW9uLXRpdGxlJykuY2xpY2soKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufSk7XG5cbiQoJy5hY2NvcmRpb24tY29udGVudCBhJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSkge1xuICBlLnN0b3BQcm9wYWdhdGlvbigpXG59KTtcblxuIiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJ1xuICB9O1xuICB2YXIgbGFzdF9wb3N0ID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gb25Qb3N0KHBvc3QpIHtcbiAgICBsYXN0X3Bvc3QgPSArbmV3IERhdGUoKTtcbiAgICAvL2NvbnNvbGUubG9nKHBvc3QsIHRoaXMpO1xuICAgIHZhciBkYXRhID0gdGhpcztcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcblxuICAgIGlmIChwb3N0LnJlbmRlcikge1xuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3MgPSBcIm5vdGlmeV93aGl0ZVwiO1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHBvc3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICBmb3JtLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICBpZiAocG9zdC5odG1sKSB7XG4gICAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xuICAgICAgICBhamF4Rm9ybSh3cmFwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghcG9zdC5lcnJvcikge1xuICAgICAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgICBmb3JtLmZpbmQoJ2lucHV0W3R5cGU9dGV4dF0sdGV4dGFyZWEnKS52YWwoJycpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwb3N0LmVycm9yID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBmb3IgKHZhciBpbmRleCBpbiBwb3N0LmVycm9yKSB7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICAgICd0eXBlJzogJ2VycicsXG4gICAgICAgICAgJ3RpdGxlJzogJ9Ce0YjQuNCx0LrQsCcsXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0LmVycm9yW2luZGV4XVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zdC5lcnJvci5sZW5ndGg7IGkrKykge1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgICAndHlwZSc6ICdlcnInLFxuICAgICAgICAgICd0aXRsZSc6ICfQntGI0LjQsdC60LAnLFxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpXVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHBvc3QuZXJyb3IgfHwgcG9zdC5tZXNzYWdlKSB7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICfQo9GB0L/QtdGI0L3QvicgOiAn0J7RiNC40LHQutCwJyxcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3JcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vXG4gICAgLy8gbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgLy8gICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcbiAgICAvLyAgICAgJ3RpdGxlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAn0KPRgdC/0LXRiNC90L4nIDogJ9Ce0YjQuNCx0LrQsCcsXG4gICAgLy8gICAgICdtZXNzYWdlJzogQXJyYXkuaXNBcnJheShwb3N0LmVycm9yKSA/IHBvc3QuZXJyb3JbMF0gOiAocG9zdC5tZXNzYWdlID8gcG9zdC5tZXNzYWdlIDogcG9zdC5lcnJvcilcbiAgICAvLyB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRmFpbCgpIHtcbiAgICBsYXN0X3Bvc3QgPSArbmV3IERhdGUoKTtcbiAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XG4gICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgIHdyYXAuaHRtbCgnPGgzPtCj0L/RgS4uLiDQktC+0LfQvdC40LrQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwPGgzPicgK1xuICAgICAgJzxwPtCn0LDRgdGC0L4g0Y3RgtC+INC/0YDQvtC40YHRhdC+0LTQuNGCINCyINGB0LvRg9GH0LDQtSwg0LXRgdC70Lgg0LLRiyDQvdC10YHQutC+0LvRjNC60L4g0YDQsNC3INC/0L7QtNGA0Y/QtCDQvdC10LLQtdGA0L3QviDQstCy0LXQu9C4INGB0LLQvtC4INGD0YfQtdGC0L3Ri9C1INC00LDQvdC90YvQtS4g0J3QviDQstC+0LfQvNC+0LbQvdGLINC4INC00YDRg9Cz0LjQtSDQv9GA0LjRh9C40L3Riy4g0JIg0LvRjtCx0L7QvCDRgdC70YPRh9Cw0LUg0L3QtSDRgNCw0YHRgdGC0YDQsNC40LLQsNC50YLQtdGB0Ywg0Lgg0L/RgNC+0YHRgtC+INC+0LHRgNCw0YLQuNGC0LXRgdGMINC6INC90LDRiNC10LzRgyDQvtC/0LXRgNCw0YLQvtGA0YMg0YHQu9GD0LbQsdGLINC/0L7QtNC00LXRgNC20LrQuC48L3A+PGJyPicgK1xuICAgICAgJzxwPtCh0L/QsNGB0LjQsdC+LjwvcD4nKTtcbiAgICBhamF4Rm9ybSh3cmFwKTtcblxuICB9XG5cbiAgZnVuY3Rpb24gb25TdWJtaXQoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAvL2Uuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgLy9lLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgdmFyIGN1cnJlbnRUaW1lTWlsbGlzID0gK25ldyBEYXRlKCk7XG4gICAgaWYgKGN1cnJlbnRUaW1lTWlsbGlzIC0gbGFzdF9wb3N0IDwgMTAwMCAqIDIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsYXN0X3Bvc3QgPSBjdXJyZW50VGltZU1pbGxpcztcbiAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XG4gICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xuXG4gICAgLy9pbml0KHdyYXApO1xuXG4gICAgaWYgKGZvcm0ueWlpQWN0aXZlRm9ybSkge1xuICAgICAgdmFyIGQgPSBmb3JtLmRhdGEoJ3lpaUFjdGl2ZUZvcm0nKTtcbiAgICAgIGlmIChkKSB7XG4gICAgICAgIGQudmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJywgZCk7XG4gICAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcbiAgICAgICAgaXNWYWxpZCA9IGQudmFsaWRhdGVkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlzVmFsaWQgPSBpc1ZhbGlkICYmIChmb3JtLmZpbmQoZGF0YS5wYXJhbS5lcnJvcl9jbGFzcykubGVuZ3RoID09IDApO1xuXG4gICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcblxuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIHZhciByZXF1aXJlZCA9IGZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQnKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IHJlcXVpcmVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBoZWxwQmxvY2sgPSByZXF1aXJlZC5lcShpKS5hdHRyKCd0eXBlJykgPT0gJ2hpZGRlbicgPyByZXF1aXJlZC5lcShpKS5uZXh0KCcuaGVscC1ibG9jaycpIDpcbiAgICAgICAgICByZXF1aXJlZC5lcShpKS5jbG9zZXN0KCcuZm9ybS1pbnB1dC1ncm91cCcpLm5leHQoJy5oZWxwLWJsb2NrJyk7XG4gICAgICAgIHZhciBoZWxwTWVzc2FnZSA9IGhlbHBCbG9jayAmJiBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpID8gaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA6ICfQndC10L7QsdGF0L7QtNC40LzQviDQt9Cw0L/QvtC70L3QuNGC0YwnO1xuXG4gICAgICAgIGlmIChyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgaGVscEJsb2NrLmh0bWwoaGVscE1lc3NhZ2UpO1xuICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoZWxwQmxvY2suaHRtbCgnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcblxuICAgIHZhciBwb3N0RGF0YSA9IGZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xuICAgIC8vZm9ybS5odG1sKCcnKTtcbiAgICAvL3dyYXAuaHRtbCgnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxwPtCe0YLQv9GA0LDQstC60LAg0LTQsNC90L3Ri9GFPC9wPjwvZGl2PicpO1xuXG4gICAgZGF0YS51cmwgKz0gKGRhdGEudXJsLmluZGV4T2YoJz8nKSA+IDAgPyAnJicgOiAnPycpICsgJ3JjPScgKyBNYXRoLnJhbmRvbSgpO1xuICAgIGNvbnNvbGUubG9nKGRhdGEudXJsKTtcblxuICAgICQucG9zdChcbiAgICAgIGRhdGEudXJsLFxuICAgICAgcG9zdERhdGEsXG4gICAgICBvblBvc3QuYmluZChkYXRhKSxcbiAgICAgICdqc29uJ1xuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0KHdyYXApIHtcbiAgICBmb3JtID0gd3JhcC5maW5kKCdmb3JtJyk7XG4gICAgZGF0YSA9IHtcbiAgICAgIGZvcm06IGZvcm0sXG4gICAgICBwYXJhbTogZGVmYXVsdHMsXG4gICAgICB3cmFwOiB3cmFwXG4gICAgfTtcbiAgICBkYXRhLnVybCA9IGZvcm0uYXR0cignYWN0aW9uJykgfHwgbG9jYXRpb24uaHJlZjtcbiAgICBkYXRhLm1ldGhvZCA9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xuICAgIGZvcm0udW5iaW5kKCdzdWJtaXQnKTtcbiAgICAvL2Zvcm0ub2ZmKCdzdWJtaXQnKTtcbiAgICBmb3JtLm9uKCdzdWJtaXQnLCBvblN1Ym1pdC5iaW5kKGRhdGEpKTtcbiAgfVxuXG4gIGVscy5maW5kKCdbcmVxdWlyZWRdJylcbiAgICAuYWRkQ2xhc3MoJ3JlcXVpcmVkJylcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcblxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgaW5pdChlbHMuZXEoaSkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFNSTygpIHtcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG8gPSB7fTtcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XG4gICAgICAgIH1cbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvO1xuICB9O1xufTtcbmFkZFNSTygpOyIsIiFmdW5jdGlvbih0KXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImpxdWVyeVwiXSx0KTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz10KHJlcXVpcmUoXCJqcXVlcnlcIikpOnQoalF1ZXJ5KX0oZnVuY3Rpb24odCl7ZnVuY3Rpb24gbyhvLGUpe3RoaXMuZWxlbWVudD1vLHRoaXMuJGVsZW1lbnQ9dCh0aGlzLmVsZW1lbnQpLHRoaXMuZG9jPXQoZG9jdW1lbnQpLHRoaXMud2luPXQod2luZG93KSx0aGlzLnNldHRpbmdzPXQuZXh0ZW5kKHt9LG4sZSksXCJvYmplY3RcIj09dHlwZW9mIHRoaXMuJGVsZW1lbnQuZGF0YShcInRpcHNvXCIpJiZ0LmV4dGVuZCh0aGlzLnNldHRpbmdzLHRoaXMuJGVsZW1lbnQuZGF0YShcInRpcHNvXCIpKTtmb3IodmFyIHI9T2JqZWN0LmtleXModGhpcy4kZWxlbWVudC5kYXRhKCkpLHM9e30sZD0wO2Q8ci5sZW5ndGg7ZCsrKXt2YXIgbD1yW2RdLnJlcGxhY2UoaSxcIlwiKTtpZihcIlwiIT09bCl7bD1sLmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpK2wuc2xpY2UoMSksc1tsXT10aGlzLiRlbGVtZW50LmRhdGEocltkXSk7Zm9yKHZhciBwIGluIHRoaXMuc2V0dGluZ3MpcC50b0xvd2VyQ2FzZSgpPT1sJiYodGhpcy5zZXR0aW5nc1twXT1zW2xdKX19dGhpcy5fZGVmYXVsdHM9bix0aGlzLl9uYW1lPWksdGhpcy5fdGl0bGU9dGhpcy4kZWxlbWVudC5hdHRyKFwidGl0bGVcIiksdGhpcy5tb2RlPVwiaGlkZVwiLHRoaXMuaWVGYWRlPSFhLHRoaXMuc2V0dGluZ3MucHJlZmVyZWRQb3NpdGlvbj10aGlzLnNldHRpbmdzLnBvc2l0aW9uLHRoaXMuaW5pdCgpfWZ1bmN0aW9uIGUobyl7dmFyIGU9by5jbG9uZSgpO2UuY3NzKFwidmlzaWJpbGl0eVwiLFwiaGlkZGVuXCIpLHQoXCJib2R5XCIpLmFwcGVuZChlKTt2YXIgcj1lLm91dGVySGVpZ2h0KCkscz1lLm91dGVyV2lkdGgoKTtyZXR1cm4gZS5yZW1vdmUoKSx7d2lkdGg6cyxoZWlnaHQ6cn19ZnVuY3Rpb24gcih0KXt0LnJlbW92ZUNsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lciBib3R0b21fcmlnaHRfY29ybmVyIHRvcF9sZWZ0X2Nvcm5lciBib3R0b21fbGVmdF9jb3JuZXJcIiksdC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLnJlbW92ZUNsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lciBib3R0b21fcmlnaHRfY29ybmVyIHRvcF9sZWZ0X2Nvcm5lciBib3R0b21fbGVmdF9jb3JuZXJcIil9ZnVuY3Rpb24gcyhvKXt2YXIgaSxuLGEsZD1vLnRvb2x0aXAoKSxsPW8uJGVsZW1lbnQscD1vLGY9dCh3aW5kb3cpLGc9MTAsYz1wLnNldHRpbmdzLmJhY2tncm91bmQsaD1wLnRpdGxlQ29udGVudCgpO3N3aXRjaCh2b2lkIDAhPT1oJiZcIlwiIT09aCYmKGM9cC5zZXR0aW5ncy50aXRsZUJhY2tncm91bmQpLGwucGFyZW50KCkub3V0ZXJXaWR0aCgpPmYub3V0ZXJXaWR0aCgpJiYoZj1sLnBhcmVudCgpKSxwLnNldHRpbmdzLnBvc2l0aW9uKXtjYXNlXCJ0b3AtcmlnaHRcIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKSxpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21fcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcImJvdHRvbV9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOmN9KSxkLnJlbW92ZUNsYXNzKFwidG9wLXJpZ2h0IHRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnQgXCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcInRvcF9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZH0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk7YnJlYWs7Y2FzZVwidG9wLWxlZnRcIjpuPWwub2Zmc2V0KCkubGVmdC1lKGQpLndpZHRoLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbV9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJib3R0b21fbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpjfSksZC5yZW1vdmVDbGFzcyhcInRvcC1yaWdodCB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50IFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BfbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmR9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpO2JyZWFrO2Nhc2VcImJvdHRvbS1yaWdodFwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaStlKGQpLmhlaWdodD5mLnNjcm9sbFRvcCgpK2Yub3V0ZXJIZWlnaHQoKT8oaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcInRvcF9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwidG9wX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmR9KSxkLnJlbW92ZUNsYXNzKFwidG9wLXJpZ2h0IHRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbV9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwiYm90dG9tX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6Y30pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk7YnJlYWs7Y2FzZVwiYm90dG9tLWxlZnRcIjpuPWwub2Zmc2V0KCkubGVmdC1lKGQpLndpZHRoLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaStlKGQpLmhlaWdodD5mLnNjcm9sbFRvcCgpK2Yub3V0ZXJIZWlnaHQoKT8oaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcInRvcF9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJ0b3BfbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmR9KSxkLnJlbW92ZUNsYXNzKFwidG9wLXJpZ2h0IHRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbV9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJib3R0b21fbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpjfSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTticmVhaztjYXNlXCJ0b3BcIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKS8yLWUoZCkud2lkdGgvMixpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpO2JyZWFrO2Nhc2VcImJvdHRvbVwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLzItZShkKS53aWR0aC8yLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaStlKGQpLmhlaWdodD5mLnNjcm9sbFRvcCgpK2Yub3V0ZXJIZWlnaHQoKT8oaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MocC5zZXR0aW5ncy5wb3NpdGlvbikpO2JyZWFrO2Nhc2VcImxlZnRcIjpuPWwub2Zmc2V0KCkubGVmdC1lKGQpLndpZHRoLWcsaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkvMi1lKGQpLmhlaWdodC8yLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpblRvcDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpbkxlZnQ6XCJcIn0pLG48Zi5zY3JvbGxMZWZ0KCk/KG49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwicmlnaHRcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MocC5zZXR0aW5ncy5wb3NpdGlvbikpO2JyZWFrO2Nhc2VcInJpZ2h0XCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkrZyxpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKS8yLWUoZCkuaGVpZ2h0LzIsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luVG9wOi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luTGVmdDpcIlwifSksbitnK3Auc2V0dGluZ3Mud2lkdGg+Zi5zY3JvbGxMZWZ0KCkrZi5vdXRlcldpZHRoKCk/KG49bC5vZmZzZXQoKS5sZWZ0LWUoZCkud2lkdGgtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJsZWZ0XCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKHAuc2V0dGluZ3MucG9zaXRpb24pKX1pZihcInRvcC1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbiYmZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJtYXJnaW4tbGVmdFwiOi1wLnNldHRpbmdzLndpZHRoLzJ9KSxcInRvcC1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKXt2YXIgbT1kLmZpbmQoXCIudGlwc29fYXJyb3dcIikuZXEoMCk7bS5jc3Moe1wibWFyZ2luLWxlZnRcIjpwLnNldHRpbmdzLndpZHRoLzItMipwLnNldHRpbmdzLmFycm93V2lkdGh9KX1pZihcImJvdHRvbS1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbil7dmFyIG09ZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmVxKDApO20uY3NzKHtcIm1hcmdpbi1sZWZ0XCI6LXAuc2V0dGluZ3Mud2lkdGgvMixcIm1hcmdpbi10b3BcIjpcIlwifSl9aWYoXCJib3R0b20tbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbil7dmFyIG09ZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmVxKDApO20uY3NzKHtcIm1hcmdpbi1sZWZ0XCI6cC5zZXR0aW5ncy53aWR0aC8yLTIqcC5zZXR0aW5ncy5hcnJvd1dpZHRoLFwibWFyZ2luLXRvcFwiOlwiXCJ9KX1uPGYuc2Nyb2xsTGVmdCgpJiYoXCJib3R0b21cIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wXCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6bi1wLnNldHRpbmdzLmFycm93V2lkdGh9KSxuPTApLG4rcC5zZXR0aW5ncy53aWR0aD5mLm91dGVyV2lkdGgoKSYmKFwiYm90dG9tXCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihhPWYub3V0ZXJXaWR0aCgpLShuK3Auc2V0dGluZ3Mud2lkdGgpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LWEtcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksbis9YSksbjxmLnNjcm9sbExlZnQoKSYmKFwibGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJyaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3AtcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwiYm90dG9tLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImJvdHRvbS1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKG49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLzItZShkKS53aWR0aC8yLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIikscihkKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpLG4rcC5zZXR0aW5ncy53aWR0aD5mLm91dGVyV2lkdGgoKSYmKGE9Zi5vdXRlcldpZHRoKCktKG4rcC5zZXR0aW5ncy53aWR0aCksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotYS1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxuKz1hKSxuPGYuc2Nyb2xsTGVmdCgpJiYoZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDpuLXAuc2V0dGluZ3MuYXJyb3dXaWR0aH0pLG49MCkpLG4rcC5zZXR0aW5ncy53aWR0aD5mLm91dGVyV2lkdGgoKSYmKFwibGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJyaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3AtcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwiYm90dG9tLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImJvdHRvbS1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKS8yLWUoZCkud2lkdGgvMixkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKSxuK3Auc2V0dGluZ3Mud2lkdGg+Zi5vdXRlcldpZHRoKCkmJihhPWYub3V0ZXJXaWR0aCgpLShuK3Auc2V0dGluZ3Mud2lkdGgpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LWEtcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksbis9YSksbjxmLnNjcm9sbExlZnQoKSYmKGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6bi1wLnNldHRpbmdzLmFycm93V2lkdGh9KSxuPTApKSxkLmNzcyh7bGVmdDpuK3Auc2V0dGluZ3Mub2Zmc2V0WCx0b3A6aStwLnNldHRpbmdzLm9mZnNldFl9KSxpPGYuc2Nyb2xsVG9wKCkmJihcInJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYobC50aXBzbyhcInVwZGF0ZVwiLFwicG9zaXRpb25cIixcImJvdHRvbVwiKSxzKHApKSxpK2UoZCkuaGVpZ2h0PmYuc2Nyb2xsVG9wKCkrZi5vdXRlckhlaWdodCgpJiYoXCJyaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJsZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKGwudGlwc28oXCJ1cGRhdGVcIixcInBvc2l0aW9uXCIsXCJ0b3BcIikscyhwKSl9dmFyIGk9XCJ0aXBzb1wiLG49e3NwZWVkOjQwMCxiYWNrZ3JvdW5kOlwiIzU1YjU1NVwiLHRpdGxlQmFja2dyb3VuZDpcIiMzMzMzMzNcIixjb2xvcjpcIiNmZmZmZmZcIix0aXRsZUNvbG9yOlwiI2ZmZmZmZlwiLHRpdGxlQ29udGVudDpcIlwiLHNob3dBcnJvdzohMCxwb3NpdGlvbjpcInRvcFwiLHdpZHRoOjIwMCxtYXhXaWR0aDpcIlwiLGRlbGF5OjIwMCxoaWRlRGVsYXk6MCxhbmltYXRpb25JbjpcIlwiLGFuaW1hdGlvbk91dDpcIlwiLG9mZnNldFg6MCxvZmZzZXRZOjAsYXJyb3dXaWR0aDo4LHRvb2x0aXBIb3ZlcjohMSxjb250ZW50Om51bGwsYWpheENvbnRlbnRVcmw6bnVsbCxhamF4Q29udGVudEJ1ZmZlcjowLGNvbnRlbnRFbGVtZW50SWQ6bnVsbCx1c2VUaXRsZTohMSx0ZW1wbGF0ZUVuZ2luZUZ1bmM6bnVsbCxvbkJlZm9yZVNob3c6bnVsbCxvblNob3c6bnVsbCxvbkhpZGU6bnVsbH07dC5leHRlbmQoby5wcm90b3R5cGUse2luaXQ6ZnVuY3Rpb24oKXt7dmFyIHQ9dGhpcyxvPXRoaXMuJGVsZW1lbnQ7dGhpcy5kb2N9aWYoby5hZGRDbGFzcyhcInRpcHNvX3N0eWxlXCIpLnJlbW92ZUF0dHIoXCJ0aXRsZVwiKSx0LnNldHRpbmdzLnRvb2x0aXBIb3Zlcil7dmFyIGU9bnVsbCxyPW51bGw7by5vbihcIm1vdXNlb3Zlci5cIitpLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGUpLGNsZWFyVGltZW91dChyKSxyPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0LnNob3coKX0sMTUwKX0pLG8ub24oXCJtb3VzZW91dC5cIitpLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGUpLGNsZWFyVGltZW91dChyKSxlPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0LmhpZGUoKX0sMjAwKSx0LnRvb2x0aXAoKS5vbihcIm1vdXNlb3Zlci5cIitpLGZ1bmN0aW9uKCl7dC5tb2RlPVwidG9vbHRpcEhvdmVyXCJ9KS5vbihcIm1vdXNlb3V0LlwiK2ksZnVuY3Rpb24oKXt0Lm1vZGU9XCJzaG93XCIsY2xlYXJUaW1lb3V0KGUpLGU9c2V0VGltZW91dChmdW5jdGlvbigpe3QuaGlkZSgpfSwyMDApfSl9KX1lbHNlIG8ub24oXCJtb3VzZW92ZXIuXCIraSxmdW5jdGlvbigpe3Quc2hvdygpfSksby5vbihcIm1vdXNlb3V0LlwiK2ksZnVuY3Rpb24oKXt0LmhpZGUoKX0pO3Quc2V0dGluZ3MuYWpheENvbnRlbnRVcmwmJih0LmFqYXhDb250ZW50PW51bGwpfSx0b29sdGlwOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudGlwc29fYnViYmxlfHwodGhpcy50aXBzb19idWJibGU9dCgnPGRpdiBjbGFzcz1cInRpcHNvX2J1YmJsZVwiPjxkaXYgY2xhc3M9XCJ0aXBzb190aXRsZVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXBzb19jb250ZW50XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRpcHNvX2Fycm93XCI+PC9kaXY+PC9kaXY+JykpLHRoaXMudGlwc29fYnViYmxlfSxzaG93OmZ1bmN0aW9uKCl7dmFyIG89dGhpcy50b29sdGlwKCksZT10aGlzLHI9dGhpcy53aW47ZS5zZXR0aW5ncy5zaG93QXJyb3c9PT0hMT9vLmZpbmQoXCIudGlwc29fYXJyb3dcIikuaGlkZSgpOm8uZmluZChcIi50aXBzb19hcnJvd1wiKS5zaG93KCksXCJoaWRlXCI9PT1lLm1vZGUmJih0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vbkJlZm9yZVNob3cpJiZlLnNldHRpbmdzLm9uQmVmb3JlU2hvdyhlLiRlbGVtZW50LGUuZWxlbWVudCxlKSxlLnNldHRpbmdzLnNpemUmJm8uYWRkQ2xhc3MoZS5zZXR0aW5ncy5zaXplKSxlLnNldHRpbmdzLndpZHRoP28uY3NzKHtiYWNrZ3JvdW5kOmUuc2V0dGluZ3MuYmFja2dyb3VuZCxjb2xvcjplLnNldHRpbmdzLmNvbG9yLHdpZHRoOmUuc2V0dGluZ3Mud2lkdGh9KS5oaWRlKCk6ZS5zZXR0aW5ncy5tYXhXaWR0aD9vLmNzcyh7YmFja2dyb3VuZDplLnNldHRpbmdzLmJhY2tncm91bmQsY29sb3I6ZS5zZXR0aW5ncy5jb2xvcixtYXhXaWR0aDplLnNldHRpbmdzLm1heFdpZHRofSkuaGlkZSgpOm8uY3NzKHtiYWNrZ3JvdW5kOmUuc2V0dGluZ3MuYmFja2dyb3VuZCxjb2xvcjplLnNldHRpbmdzLmNvbG9yLHdpZHRoOjIwMH0pLmhpZGUoKSxvLmZpbmQoXCIudGlwc29fdGl0bGVcIikuY3NzKHtiYWNrZ3JvdW5kOmUuc2V0dGluZ3MudGl0bGVCYWNrZ3JvdW5kLGNvbG9yOmUuc2V0dGluZ3MudGl0bGVDb2xvcn0pLG8uZmluZChcIi50aXBzb19jb250ZW50XCIpLmh0bWwoZS5jb250ZW50KCkpLG8uZmluZChcIi50aXBzb190aXRsZVwiKS5odG1sKGUudGl0bGVDb250ZW50KCkpLHMoZSksci5vbihcInJlc2l6ZS5cIitpLGZ1bmN0aW9uKCl7ZS5zZXR0aW5ncy5wb3NpdGlvbj1lLnNldHRpbmdzLnByZWZlcmVkUG9zaXRpb24scyhlKX0pLHdpbmRvdy5jbGVhclRpbWVvdXQoZS50aW1lb3V0KSxlLnRpbWVvdXQ9bnVsbCxlLnRpbWVvdXQ9d2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLmllRmFkZXx8XCJcIj09PWUuc2V0dGluZ3MuYW5pbWF0aW9uSW58fFwiXCI9PT1lLnNldHRpbmdzLmFuaW1hdGlvbk91dD9vLmFwcGVuZFRvKFwiYm9keVwiKS5zdG9wKCEwLCEwKS5mYWRlSW4oZS5zZXR0aW5ncy5zcGVlZCxmdW5jdGlvbigpe2UubW9kZT1cInNob3dcIix0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vblNob3cpJiZlLnNldHRpbmdzLm9uU2hvdyhlLiRlbGVtZW50LGUuZWxlbWVudCxlKX0pOm8ucmVtb3ZlKCkuYXBwZW5kVG8oXCJib2R5XCIpLnN0b3AoITAsITApLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25PdXQpLmFkZENsYXNzKFwibm9BbmltYXRpb25cIikucmVtb3ZlQ2xhc3MoXCJub0FuaW1hdGlvblwiKS5hZGRDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uSW4pLmZhZGVJbihlLnNldHRpbmdzLnNwZWVkLGZ1bmN0aW9uKCl7dCh0aGlzKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXt0KHRoaXMpLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25Jbil9KSxlLm1vZGU9XCJzaG93XCIsdC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25TaG93KSYmZS5zZXR0aW5ncy5vblNob3coZS4kZWxlbWVudCxlLmVsZW1lbnQsZSksci5vZmYoXCJyZXNpemUuXCIraSxudWxsLFwidGlwc29SZXNpemVIYW5kbGVyXCIpfSl9LGUuc2V0dGluZ3MuZGVsYXkpKX0saGlkZTpmdW5jdGlvbihvKXt2YXIgZT10aGlzLHI9dGhpcy53aW4scz10aGlzLnRvb2x0aXAoKSxuPWUuc2V0dGluZ3MuaGlkZURlbGF5O28mJihuPTAsZS5tb2RlPVwic2hvd1wiKSx3aW5kb3cuY2xlYXJUaW1lb3V0KGUudGltZW91dCksZS50aW1lb3V0PW51bGwsZS50aW1lb3V0PXdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XCJ0b29sdGlwSG92ZXJcIiE9PWUubW9kZSYmKGUuaWVGYWRlfHxcIlwiPT09ZS5zZXR0aW5ncy5hbmltYXRpb25Jbnx8XCJcIj09PWUuc2V0dGluZ3MuYW5pbWF0aW9uT3V0P3Muc3RvcCghMCwhMCkuZmFkZU91dChlLnNldHRpbmdzLnNwZWVkLGZ1bmN0aW9uKCl7dCh0aGlzKS5yZW1vdmUoKSx0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vbkhpZGUpJiZcInNob3dcIj09PWUubW9kZSYmZS5zZXR0aW5ncy5vbkhpZGUoZS4kZWxlbWVudCxlLmVsZW1lbnQsZSksZS5tb2RlPVwiaGlkZVwiLHIub2ZmKFwicmVzaXplLlwiK2ksbnVsbCxcInRpcHNvUmVzaXplSGFuZGxlclwiKX0pOnMuc3RvcCghMCwhMCkucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbkluKS5hZGRDbGFzcyhcIm5vQW5pbWF0aW9uXCIpLnJlbW92ZUNsYXNzKFwibm9BbmltYXRpb25cIikuYWRkQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbk91dCkub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7dCh0aGlzKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uT3V0KS5yZW1vdmUoKSx0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vbkhpZGUpJiZcInNob3dcIj09PWUubW9kZSYmZS5zZXR0aW5ncy5vbkhpZGUoZS4kZWxlbWVudCxlLmVsZW1lbnQsZSksZS5tb2RlPVwiaGlkZVwiLHIub2ZmKFwicmVzaXplLlwiK2ksbnVsbCxcInRpcHNvUmVzaXplSGFuZGxlclwiKX0pKX0sbil9LGNsb3NlOmZ1bmN0aW9uKCl7dGhpcy5oaWRlKCEwKX0sZGVzdHJveTpmdW5jdGlvbigpe3t2YXIgdD10aGlzLiRlbGVtZW50LG89dGhpcy53aW47dGhpcy5kb2N9dC5vZmYoXCIuXCIraSksby5vZmYoXCJyZXNpemUuXCIraSxudWxsLFwidGlwc29SZXNpemVIYW5kbGVyXCIpLHQucmVtb3ZlRGF0YShpKSx0LnJlbW92ZUNsYXNzKFwidGlwc29fc3R5bGVcIikuYXR0cihcInRpdGxlXCIsdGhpcy5fdGl0bGUpfSx0aXRsZUNvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgdCxvPXRoaXMuJGVsZW1lbnQsZT10aGlzO3JldHVybiB0PWUuc2V0dGluZ3MudGl0bGVDb250ZW50P2Uuc2V0dGluZ3MudGl0bGVDb250ZW50Om8uZGF0YShcInRpcHNvLXRpdGxlXCIpfSxjb250ZW50OmZ1bmN0aW9uKCl7dmFyIG8sZT10aGlzLiRlbGVtZW50LHI9dGhpcyxzPXRoaXMuX3RpdGxlO3JldHVybiByLnNldHRpbmdzLmFqYXhDb250ZW50VXJsP3IuX2FqYXhDb250ZW50P289ci5fYWpheENvbnRlbnQ6KHIuX2FqYXhDb250ZW50PW89dC5hamF4KHt0eXBlOlwiR0VUXCIsdXJsOnIuc2V0dGluZ3MuYWpheENvbnRlbnRVcmwsYXN5bmM6ITF9KS5yZXNwb25zZVRleHQsci5zZXR0aW5ncy5hamF4Q29udGVudEJ1ZmZlcj4wP3NldFRpbWVvdXQoZnVuY3Rpb24oKXtyLl9hamF4Q29udGVudD1udWxsfSxyLnNldHRpbmdzLmFqYXhDb250ZW50QnVmZmVyKTpyLl9hamF4Q29udGVudD1udWxsKTpyLnNldHRpbmdzLmNvbnRlbnRFbGVtZW50SWQ/bz10KFwiI1wiK3Iuc2V0dGluZ3MuY29udGVudEVsZW1lbnRJZCkudGV4dCgpOnIuc2V0dGluZ3MuY29udGVudD9vPXIuc2V0dGluZ3MuY29udGVudDpyLnNldHRpbmdzLnVzZVRpdGxlPT09ITA/bz1zOlwic3RyaW5nXCI9PXR5cGVvZiBlLmRhdGEoXCJ0aXBzb1wiKSYmKG89ZS5kYXRhKFwidGlwc29cIikpLG51bGwhPT1yLnNldHRpbmdzLnRlbXBsYXRlRW5naW5lRnVuYyYmKG89ci5zZXR0aW5ncy50ZW1wbGF0ZUVuZ2luZUZ1bmMobykpLG99LHVwZGF0ZTpmdW5jdGlvbih0LG8pe3ZhciBlPXRoaXM7cmV0dXJuIG8/dm9pZChlLnNldHRpbmdzW3RdPW8pOmUuc2V0dGluZ3NbdF19fSk7dmFyIGE9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKS5zdHlsZSxvPVtcIm1zXCIsXCJPXCIsXCJNb3pcIixcIldlYmtpdFwiXTtpZihcIlwiPT09dC50cmFuc2l0aW9uKXJldHVybiEwO2Zvcig7by5sZW5ndGg7KWlmKG8ucG9wKCkrXCJUcmFuc2l0aW9uXCJpbiB0KXJldHVybiEwO3JldHVybiExfSgpO3RbaV09dC5mbltpXT1mdW5jdGlvbihlKXt2YXIgcj1hcmd1bWVudHM7aWYodm9pZCAwPT09ZXx8XCJvYmplY3RcIj09dHlwZW9mIGUpcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiB0fHx0LmV4dGVuZChuLGUpLHRoaXMuZWFjaChmdW5jdGlvbigpe3QuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2kpfHx0LmRhdGEodGhpcyxcInBsdWdpbl9cIitpLG5ldyBvKHRoaXMsZSkpfSk7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGUmJlwiX1wiIT09ZVswXSYmXCJpbml0XCIhPT1lKXt2YXIgcztyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIG49dC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSk7bnx8KG49dC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSxuZXcgbyh0aGlzLGUpKSksbiBpbnN0YW5jZW9mIG8mJlwiZnVuY3Rpb25cIj09dHlwZW9mIG5bZV0mJihzPW5bZV0uYXBwbHkobixBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChyLDEpKSksXCJkZXN0cm95XCI9PT1lJiZ0LmRhdGEodGhpcyxcInBsdWdpbl9cIitpLG51bGwpfSksdm9pZCAwIT09cz9zOnRoaXN9fX0pOyIsInZhciBteVRvb2x0aXAgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciB0b29sdGlwQ2xpY2tUaW1lO1xuICAgIHZhciB0b29sdGlwVGltZU91dCA9IG51bGw7XG5cbiAgICAkKCdbZGF0YS10b2dnbGU9dG9vbHRpcF0nKS50aXBzbyh7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjZmZmJyxcbiAgICAgICAgY29sb3I6ICcjNDM0YTU0JyxcbiAgICAgICAgc2l6ZTogJ3NtYWxsJyxcbiAgICAgICAgZGVsYXk6IDEwLFxuICAgICAgICBzcGVlZDogMTAsXG4gICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgIC8vbWF4V2lkdGg6IDI1OCxcbiAgICAgICAgc2hvd0Fycm93OiB0cnVlLFxuICAgICAgICBvbkJlZm9yZVNob3c6IGZ1bmN0aW9uIChlbGUsIHRpcHNvKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQgPSBlbGUuZGF0YSgnb3JpZ2luYWwtdGl0bGUnKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSBlbGUuZGF0YSgncGxhY2VtZW50JykgPyBlbGUuZGF0YSgncGxhY2VtZW50JykgOiAndG9wJztcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnW2RhdGEtdG9nZ2xlPXRvb2x0aXBdJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG5cbiAgICAgICAgdG9vbHRpcENsaWNrVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIC8v0YPQsdC40YDQsNC10Lwg0YLQsNC50LzQsNGD0YJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0b29sdGlwVGltZU91dCk7XG4gICAgICAgIC8v0LfQsNC60YDRi9Cy0LDQstC10Lwg0LLRgdC1INGC0YPQu9GC0LjQv9GLXG4gICAgICAgICQoJ1tkYXRhLXRvZ2dsZT10b29sdGlwXScpLnRpcHNvKCdoaWRlJyk7XG4gICAgICAgIC8v0LTQsNC90L3Ri9C5INC/0L7QutCw0LfRi9Cy0LXQvFxuICAgICAgICAkKHRoaXMpLnRpcHNvKCdzaG93Jyk7XG4gICAgICAgIC8v0L3QvtCy0YvQuSDQuNC90YLQtdGA0LLQsNC7XG4gICAgICAgIHRvb2x0aXBUaW1lT3V0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChuZXcgRGF0ZSgpIC0gdG9vbHRpcENsaWNrVGltZSA+IDEwMDAgKiA1KSB7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0b29sdGlwVGltZU91dCk7XG4gICAgICAgICAgICAgICAgLy/Qt9Cw0LrRgNGL0LLQsNC10Lwg0LLRgdC1INGC0YPQu9GC0LjQv9GLXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPXRvb2x0aXBdJykudGlwc28oJ2hpZGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwxMDAwKTtcblxuXG4gICAgfSk7XG5cbn0oKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gIHZhciAkbm90eWZpX2J0bj0kKCcuaGVhZGVyLWxvZ29fbm90eScpO1xuICBpZiAoJG5vdHlmaV9idG4ubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAkLmdldCgnL2FjY291bnQvbm90aWZpY2F0aW9uJyxmdW5jdGlvbihkYXRhKXtcbiAgICBpZighZGF0YS5ub3RpZmljYXRpb25zIHx8IGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGg9PTApIHJldHVybjtcblxuICAgIHZhciBvdXQ9JzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktYm94Pjx1bCBjbGFzcz1cImhlYWRlci1ub3R5LWxpc3RcIj4nO1xuICAgICRub3R5ZmlfYnRuLmZpbmQoJ2EnKS5yZW1vdmVBdHRyKCdocmVmJyk7XG4gICAgdmFyIGhhc19uZXc9ZmFsc2U7XG4gICAgZm9yICh2YXIgaT0wO2k8ZGF0YS5ub3RpZmljYXRpb25zLmxlbmd0aDtpKyspe1xuICAgICAgZWw9ZGF0YS5ub3RpZmljYXRpb25zW2ldO1xuICAgICAgdmFyIGlzX25ldz0oZWwuaXNfdmlld2VkPT0wICYmIGVsLnR5cGVfaWQ9PTIpXG4gICAgICBvdXQrPSc8bGkgY2xhc3M9XCJoZWFkZXItbm90eS1pdGVtJysoaXNfbmV3PycgaGVhZGVyLW5vdHktaXRlbV9uZXcnOicnKSsnXCI+JztcbiAgICAgIG91dCs9JzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktZGF0YT4nK2VsLmRhdGErJzwvZGl2Pic7XG4gICAgICBvdXQrPSc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LXRleHQ+JytlbC50ZXh0Kyc8L2Rpdj4nO1xuICAgICAgb3V0Kz0nPC9saT4nO1xuICAgICAgaGFzX25ldz1oYXNfbmV3fHxpc19uZXc7XG4gICAgfVxuXG4gICAgb3V0Kz0nPC91bD4nO1xuICAgIG91dCs9JzxhIGNsYXNzPVwiYnRuXCIgaHJlZj1cIi9hY2NvdW50L25vdGlmaWNhdGlvblwiPicrZGF0YS5idG4rJzwvYT4nO1xuICAgIG91dCs9JzwvZGl2Pic7XG4gICAgJCgnLmhlYWRlcicpLmFwcGVuZChvdXQpO1xuXG4gICAgaWYoaGFzX25ldyl7XG4gICAgICAkbm90eWZpX2J0bi5hZGRDbGFzcygndG9vbHRpcCcpLmFkZENsYXNzKCdoYXMtbm90eScpO1xuICAgIH1cblxuICAgICRub3R5ZmlfYnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZigkKCcuaGVhZGVyLW5vdHktYm94JykuaGFzQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJykpe1xuICAgICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xuICAgICAgfWVsc2V7XG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5hZGRDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcbiAgICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XG5cbiAgICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcygnaGFzLW5vdHknKSl7XG4gICAgICAgICAgJC5wb3N0KCcvYWNjb3VudC9ub3RpZmljYXRpb24nLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKCcuaGVhZGVyLWxvZ29fbm90eScpLnJlbW92ZUNsYXNzKCd0b29sdGlwJykucmVtb3ZlQ2xhc3MoJ2hhcy1ub3R5Jyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XG4gICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcbiAgICB9KTtcblxuICAgICQoJy5oZWFkZXItbm90eS1saXN0Jykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KVxuICB9LCdqc29uJyk7XG5cbn0pKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWVnYXNsaWRlciA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHNsaWRlcl9kYXRhPWZhbHNlO1xuICB2YXIgY29udGFpbmVyX2lkPVwic2VjdGlvbiNtZWdhX3NsaWRlclwiO1xuICB2YXIgcGFyYWxsYXhfZ3JvdXA9ZmFsc2U7XG4gIHZhciBwYXJhbGxheF90aW1lcj1mYWxzZTtcbiAgdmFyIHBhcmFsbGF4X2NvdW50ZXI9MDtcbiAgdmFyIHBhcmFsbGF4X2Q9MTtcbiAgdmFyIG1vYmlsZV9tb2RlPS0xO1xuICB2YXIgbWF4X3RpbWVfbG9hZF9waWM9MzAwO1xuICB2YXIgbW9iaWxlX3NpemU9NzAwO1xuICB2YXIgcmVuZGVyX3NsaWRlX25vbT0wO1xuICB2YXIgdG90X2ltZ193YWl0O1xuICB2YXIgc2xpZGVzO1xuICB2YXIgc2xpZGVfc2VsZWN0X2JveDtcbiAgdmFyIGVkaXRvcjtcbiAgdmFyIHRpbWVvdXRJZDtcbiAgdmFyIHNjcm9sbF9wZXJpb2QgPSA1MDAwO1xuXG4gIHZhciBwb3NBcnI9W1xuICAgICdzbGlkZXJfX3RleHQtbHQnLCdzbGlkZXJfX3RleHQtY3QnLCdzbGlkZXJfX3RleHQtcnQnLFxuICAgICdzbGlkZXJfX3RleHQtbGMnLCdzbGlkZXJfX3RleHQtY2MnLCdzbGlkZXJfX3RleHQtcmMnLFxuICAgICdzbGlkZXJfX3RleHQtbGInLCdzbGlkZXJfX3RleHQtY2InLCdzbGlkZXJfX3RleHQtcmInLFxuICBdO1xuICB2YXIgcG9zX2xpc3Q9W1xuICAgICfQm9C10LLQviDQstC10YDRhScsJ9GG0LXQvdGC0YAg0LLQtdGA0YUnLCfQv9GA0LDQstC+INCy0LXRgNGFJyxcbiAgICAn0JvQtdCy0L4g0YbQtdC90YLRgCcsJ9GG0LXQvdGC0YAnLCfQv9GA0LDQstC+INGG0LXQvdGC0YAnLFxuICAgICfQm9C10LLQviDQvdC40LcnLCfRhtC10L3RgtGAINC90LjQtycsJ9C/0YDQsNCy0L4g0L3QuNC3JyxcbiAgXTtcbiAgdmFyIHNob3dfZGVsYXk9W1xuICAgICdzaG93X25vX2RlbGF5JyxcbiAgICAnc2hvd19kZWxheV8wNScsXG4gICAgJ3Nob3dfZGVsYXlfMTAnLFxuICAgICdzaG93X2RlbGF5XzE1JyxcbiAgICAnc2hvd19kZWxheV8yMCcsXG4gICAgJ3Nob3dfZGVsYXlfMjUnLFxuICAgICdzaG93X2RlbGF5XzMwJ1xuICBdO1xuICB2YXIgaGlkZV9kZWxheT1bXG4gICAgJ2hpZGVfbm9fZGVsYXknLFxuICAgICdoaWRlX2RlbGF5XzA1JyxcbiAgICAnaGlkZV9kZWxheV8xMCcsXG4gICAgJ2hpZGVfZGVsYXlfMTUnLFxuICAgICdoaWRlX2RlbGF5XzIwJ1xuICBdO1xuICB2YXIgeWVzX25vX2Fycj1bXG4gICAgJ25vJyxcbiAgICAneWVzJ1xuICBdO1xuICB2YXIgeWVzX25vX3ZhbD1bXG4gICAgJycsXG4gICAgJ2ZpeGVkX19mdWxsLWhlaWdodCdcbiAgXTtcbiAgdmFyIGJ0bl9zdHlsZT1bXG4gICAgJ25vbmUnLFxuICAgICdib3JkbycsXG4gIF07XG4gIHZhciBzaG93X2FuaW1hdGlvbnM9W1xuICAgIFwibm90X2FuaW1hdGVcIixcbiAgICBcImJvdW5jZUluXCIsXG4gICAgXCJib3VuY2VJbkRvd25cIixcbiAgICBcImJvdW5jZUluTGVmdFwiLFxuICAgIFwiYm91bmNlSW5SaWdodFwiLFxuICAgIFwiYm91bmNlSW5VcFwiLFxuICAgIFwiZmFkZUluXCIsXG4gICAgXCJmYWRlSW5Eb3duXCIsXG4gICAgXCJmYWRlSW5MZWZ0XCIsXG4gICAgXCJmYWRlSW5SaWdodFwiLFxuICAgIFwiZmFkZUluVXBcIixcbiAgICBcImZsaXBJblhcIixcbiAgICBcImZsaXBJbllcIixcbiAgICBcImxpZ2h0U3BlZWRJblwiLFxuICAgIFwicm90YXRlSW5cIixcbiAgICBcInJvdGF0ZUluRG93bkxlZnRcIixcbiAgICBcInJvdGF0ZUluVXBMZWZ0XCIsXG4gICAgXCJyb3RhdGVJblVwUmlnaHRcIixcbiAgICBcImphY2tJblRoZUJveFwiLFxuICAgIFwicm9sbEluXCIsXG4gICAgXCJ6b29tSW5cIlxuICBdO1xuXG4gIHZhciBoaWRlX2FuaW1hdGlvbnM9W1xuICAgIFwibm90X2FuaW1hdGVcIixcbiAgICBcImJvdW5jZU91dFwiLFxuICAgIFwiYm91bmNlT3V0RG93blwiLFxuICAgIFwiYm91bmNlT3V0TGVmdFwiLFxuICAgIFwiYm91bmNlT3V0UmlnaHRcIixcbiAgICBcImJvdW5jZU91dFVwXCIsXG4gICAgXCJmYWRlT3V0XCIsXG4gICAgXCJmYWRlT3V0RG93blwiLFxuICAgIFwiZmFkZU91dExlZnRcIixcbiAgICBcImZhZGVPdXRSaWdodFwiLFxuICAgIFwiZmFkZU91dFVwXCIsXG4gICAgXCJmbGlwT3V0WFwiLFxuICAgIFwibGlwT3V0WVwiLFxuICAgIFwibGlnaHRTcGVlZE91dFwiLFxuICAgIFwicm90YXRlT3V0XCIsXG4gICAgXCJyb3RhdGVPdXREb3duTGVmdFwiLFxuICAgIFwicm90YXRlT3V0RG93blJpZ2h0XCIsXG4gICAgXCJyb3RhdGVPdXRVcExlZnRcIixcbiAgICBcInJvdGF0ZU91dFVwUmlnaHRcIixcbiAgICBcImhpbmdlXCIsXG4gICAgXCJyb2xsT3V0XCJcbiAgXTtcbiAgdmFyIHN0VGFibGU7XG4gIHZhciBwYXJhbGF4VGFibGU7XG5cbiAgZnVuY3Rpb24gaW5pdEltYWdlU2VydmVyU2VsZWN0KGVscykge1xuICAgIGlmKGVscy5sZW5ndGg9PTApcmV0dXJuO1xuICAgIGVscy53cmFwKCc8ZGl2IGNsYXNzPVwic2VsZWN0X2ltZ1wiPicpO1xuICAgIGVscz1lbHMucGFyZW50KCk7XG4gICAgZWxzLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmaWxlX2J1dHRvblwiPjxpIGNsYXNzPVwibWNlLWljbyBtY2UtaS1icm93c2VcIj48L2k+PC9idXR0b24+Jyk7XG4gICAgLyplbHMuZmluZCgnYnV0dG9uJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcjcm94eUN1c3RvbVBhbmVsMicpLmFkZENsYXNzKCdvcGVuJylcbiAgICB9KTsqL1xuICAgIGZvciAodmFyIGk9MDtpPGVscy5sZW5ndGg7aSsrKSB7XG4gICAgICB2YXIgZWw9ZWxzLmVxKGkpLmZpbmQoJ2lucHV0Jyk7XG4gICAgICBpZighZWwuYXR0cignaWQnKSl7XG4gICAgICAgIGVsLmF0dHIoJ2lkJywnZmlsZV8nK2krJ18nK0RhdGUubm93KCkpXG4gICAgICB9XG4gICAgICB2YXIgdF9pZD1lbC5hdHRyKCdpZCcpO1xuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLnJlZ2lzdGVyKHRfaWQsIGZ1bmN0aW9uIChmaWxlLCBpZCkge1xuICAgICAgICAvLyQodGhpcykudmFsKGZpbGUudXJsKS50cmlnZ2VyKCdjaGFuZ2UnLCBbZmlsZSwgaWRdKTtcbiAgICAgICAgJCgnIycraWQpLnZhbChmaWxlLnVybCkuY2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZmlsZV9idXR0b24nLCBmdW5jdGlvbigpe1xuICAgICAgdmFyICR0aGlzPSQodGhpcykucHJldigpO1xuICAgICAgdmFyIGlkPSR0aGlzLmF0dHIoJ2lkJyk7XG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIub3Blbk1hbmFnZXIoe1xuICAgICAgICBcInVybFwiOlwiL21hbmFnZXIvZWxmaW5kZXI/ZmlsdGVyPWltYWdlJmNhbGxiYWNrPVwiK2lkK1wiJmxhbmc9cnVcIixcbiAgICAgICAgXCJ3aWR0aFwiOlwiYXV0b1wiLFxuICAgICAgICBcImhlaWdodFwiOlwiYXV0b1wiLFxuICAgICAgICBcImlkXCI6aWRcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuSW5wdXQoZGF0YSl7XG4gICAgdmFyIGlucHV0PSc8aW5wdXQgY2xhc3M9XCInICsgKGRhdGEuaW5wdXRDbGFzcyB8fCAnJykgKyAnXCIgdmFsdWU9XCInICsgKGRhdGEudmFsdWUgfHwgJycpICsgJ1wiPic7XG4gICAgaWYoZGF0YS5sYWJlbCkge1xuICAgICAgaW5wdXQgPSAnPGxhYmVsPjxzcGFuPicgKyBkYXRhLmxhYmVsICsgJzwvc3Bhbj4nK2lucHV0Kyc8L2xhYmVsPic7XG4gICAgfVxuICAgIGlmKGRhdGEucGFyZW50KSB7XG4gICAgICBpbnB1dCA9ICc8JytkYXRhLnBhcmVudCsnPicraW5wdXQrJzwvJytkYXRhLnBhcmVudCsnPic7XG4gICAgfVxuICAgIGlucHV0ID0gJChpbnB1dCk7XG5cbiAgICBpZihkYXRhLm9uQ2hhbmdlKXtcbiAgICAgIHZhciBvbkNoYW5nZTtcbiAgICAgIGlmKGRhdGEuYmluZCl7XG4gICAgICAgIGRhdGEuYmluZC5pbnB1dD1pbnB1dC5maW5kKCdpbnB1dCcpO1xuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChkYXRhLmJpbmQpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGlucHV0LmZpbmQoJ2lucHV0JykpO1xuICAgICAgfVxuICAgICAgaW5wdXQuZmluZCgnaW5wdXQnKS5vbignY2hhbmdlJyxvbkNoYW5nZSlcbiAgICB9XG4gICAgcmV0dXJuIGlucHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuU2VsZWN0KGRhdGEpe1xuICAgIHZhciBpbnB1dD0kKCc8c2VsZWN0Lz4nKTtcblxuICAgIHZhciBlbD1zbGlkZXJfZGF0YVswXVtkYXRhLmdyXTtcbiAgICBpZihkYXRhLmluZGV4IT09ZmFsc2Upe1xuICAgICAgZWw9ZWxbZGF0YS5pbmRleF07XG4gICAgfVxuXG4gICAgaWYoZWxbZGF0YS5wYXJhbV0pe1xuICAgICAgZGF0YS52YWx1ZT1lbFtkYXRhLnBhcmFtXTtcbiAgICB9ZWxzZXtcbiAgICAgIGRhdGEudmFsdWU9MDtcbiAgICB9XG5cbiAgICBpZihkYXRhLnN0YXJ0X29wdGlvbil7XG4gICAgICBpbnB1dC5hcHBlbmQoZGF0YS5zdGFydF9vcHRpb24pXG4gICAgfVxuXG4gICAgZm9yKHZhciBpPTA7aTxkYXRhLmxpc3QubGVuZ3RoO2krKyl7XG4gICAgICB2YXIgdmFsO1xuICAgICAgdmFyIHR4dD1kYXRhLmxpc3RbaV07XG4gICAgICBpZihkYXRhLnZhbF90eXBlPT0wKXtcbiAgICAgICAgdmFsPWRhdGEubGlzdFtpXTtcbiAgICAgIH1lbHNlIGlmKGRhdGEudmFsX3R5cGU9PTEpe1xuICAgICAgICB2YWw9aTtcbiAgICAgIH1lbHNlIGlmKGRhdGEudmFsX3R5cGU9PTIpe1xuICAgICAgICAvL3ZhbD1kYXRhLnZhbF9saXN0W2ldO1xuICAgICAgICB2YWw9aTtcbiAgICAgICAgdHh0PWRhdGEudmFsX2xpc3RbaV07XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWw9KHZhbD09ZGF0YS52YWx1ZT8nc2VsZWN0ZWQnOicnKTtcbiAgICAgIGlmKHNlbD09J3NlbGVjdGVkJyl7XG4gICAgICAgIGlucHV0LmF0dHIoJ3RfdmFsJyxkYXRhLmxpc3RbaV0pO1xuICAgICAgfVxuICAgICAgdmFyIG9wdGlvbj0nPG9wdGlvbiB2YWx1ZT1cIicrdmFsKydcIiAnK3NlbCsnPicrdHh0Kyc8L29wdGlvbj4nO1xuICAgICAgaWYoZGF0YS52YWxfdHlwZT09Mil7XG4gICAgICAgIG9wdGlvbj0kKG9wdGlvbikuYXR0cignY29kZScsZGF0YS5saXN0W2ldKTtcbiAgICAgIH1cbiAgICAgIGlucHV0LmFwcGVuZChvcHRpb24pXG4gICAgfVxuXG4gICAgaW5wdXQub24oJ2NoYW5nZScsZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YT10aGlzO1xuICAgICAgdmFyIHZhbD1kYXRhLmVsLnZhbCgpO1xuICAgICAgdmFyIHNsX29wPWRhdGEuZWwuZmluZCgnb3B0aW9uW3ZhbHVlPScrdmFsKyddJyk7XG4gICAgICB2YXIgY2xzPXNsX29wLnRleHQoKTtcbiAgICAgIHZhciBjaD1zbF9vcC5hdHRyKCdjb2RlJyk7XG4gICAgICBpZighY2gpY2g9Y2xzO1xuICAgICAgaWYoZGF0YS5pbmRleCE9PWZhbHNlKXtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5pbmRleF1bZGF0YS5wYXJhbV09dmFsO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdW2RhdGEucGFyYW1dPXZhbDtcbiAgICAgIH1cblxuICAgICAgZGF0YS5vYmoucmVtb3ZlQ2xhc3MoZGF0YS5wcmVmaXgrZGF0YS5lbC5hdHRyKCd0X3ZhbCcpKTtcbiAgICAgIGRhdGEub2JqLmFkZENsYXNzKGRhdGEucHJlZml4K2NoKTtcbiAgICAgIGRhdGEuZWwuYXR0cigndF92YWwnLGNoKTtcblxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBlbDppbnB1dCxcbiAgICAgIG9iajpkYXRhLm9iaixcbiAgICAgIGdyOmRhdGEuZ3IsXG4gICAgICBpbmRleDpkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ZGF0YS5wYXJhbSxcbiAgICAgIHByZWZpeDpkYXRhLnByZWZpeHx8JydcbiAgICB9KSk7XG5cbiAgICBpZihkYXRhLnBhcmVudCl7XG4gICAgICB2YXIgcGFyZW50PSQoJzwnK2RhdGEucGFyZW50KycvPicpO1xuICAgICAgcGFyZW50LmFwcGVuZChpbnB1dCk7XG4gICAgICByZXR1cm4gcGFyZW50O1xuICAgIH1cbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTZWxBbmltYXRpb25Db250cm9sbChkYXRhKXtcbiAgICB2YXIgYW5pbV9zZWw9W107XG4gICAgdmFyIG91dDtcblxuICAgIGlmKGRhdGEudHlwZT09MCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6c2hvd19hbmltYXRpb25zLFxuICAgICAgdmFsX3R5cGU6MCxcbiAgICAgIG9iajpkYXRhLm9iaixcbiAgICAgIGdyOmRhdGEuZ3IsXG4gICAgICBpbmRleDpkYXRhLmluZGV4LFxuICAgICAgcGFyYW06J3Nob3dfYW5pbWF0aW9uJyxcbiAgICAgIHByZWZpeDonc2xpZGVfJyxcbiAgICAgIHBhcmVudDpkYXRhLnBhcmVudFxuICAgIH0pKTtcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCX0LDQtNC10YDQttC60LAg0L/QvtGP0LLQu9C10L3QuNGPPC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OnNob3dfZGVsYXksXG4gICAgICB2YWxfdHlwZToxLFxuICAgICAgb2JqOmRhdGEub2JqLFxuICAgICAgZ3I6ZGF0YS5ncixcbiAgICAgIGluZGV4OmRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTonc2hvd19kZWxheScsXG4gICAgICBwcmVmaXg6J3NsaWRlXycsXG4gICAgICBwYXJlbnQ6ZGF0YS5wYXJlbnRcbiAgICB9KSk7XG5cbiAgICBpZihkYXRhLnR5cGU9PTApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxici8+Jyk7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvc3Bhbj4nKTtcbiAgICB9XG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDpoaWRlX2FuaW1hdGlvbnMsXG4gICAgICB2YWxfdHlwZTowLFxuICAgICAgb2JqOmRhdGEub2JqLFxuICAgICAgZ3I6ZGF0YS5ncixcbiAgICAgIGluZGV4OmRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTonaGlkZV9hbmltYXRpb24nLFxuICAgICAgcHJlZml4OidzbGlkZV8nLFxuICAgICAgcGFyZW50OmRhdGEucGFyZW50XG4gICAgfSkpO1xuICAgIGlmKGRhdGEudHlwZT09MCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+0JfQsNC00LXRgNC20LrQsCDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6aGlkZV9kZWxheSxcbiAgICAgIHZhbF90eXBlOjEsXG4gICAgICBvYmo6ZGF0YS5vYmosXG4gICAgICBncjpkYXRhLmdyLFxuICAgICAgaW5kZXg6ZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOidoaWRlX2RlbGF5JyxcbiAgICAgIHByZWZpeDonc2xpZGVfJyxcbiAgICAgIHBhcmVudDpkYXRhLnBhcmVudFxuICAgIH0pKTtcblxuICAgIGlmKGRhdGEudHlwZT09MCl7XG4gICAgICBvdXQ9JCgnPGRpdiBjbGFzcz1cImFuaW1fc2VsXCIvPicpO1xuICAgICAgb3V0LmFwcGVuZChhbmltX3NlbCk7XG4gICAgfVxuICAgIGlmKGRhdGEudHlwZT09MSl7XG4gICAgICBvdXQ9YW5pbV9zZWw7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRfZWRpdG9yKCl7XG4gICAgJCgnI3cxJykucmVtb3ZlKCk7XG4gICAgJCgnI3cxX2J1dHRvbicpLnJlbW92ZSgpO1xuICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZT1zbGlkZXJfZGF0YVswXS5tb2JpbGUuc3BsaXQoJz8nKVswXTtcblxuICAgIHZhciBlbD0kKCcjbWVnYV9zbGlkZXJfY29udHJvbGUnKTtcbiAgICB2YXIgYnRuc19ib3g9JCgnPGRpdiBjbGFzcz1cImJ0bl9ib3hcIi8+Jyk7XG5cbiAgICBlbC5hcHBlbmQoJzxoMj7Qo9C/0YDQsNCy0LvQtdC90LjQtTwvaDI+Jyk7XG4gICAgZWwuYXBwZW5kKCQoJzx0ZXh0YXJlYS8+Jyx7XG4gICAgICB0ZXh0OkpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSxcbiAgICAgIGlkOidzbGlkZV9kYXRhJyxcbiAgICAgIG5hbWU6IGVkaXRvclxuICAgIH0pKTtcblxuICAgIHZhciBidG49JCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XG4gICAgYnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnaGlkZV9zbGlkZScpO1xuICAgIH0pO1xuXG4gICAgdmFyIGJ0bj0kKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQlNC10LDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XG4gICAgYnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5hZGRDbGFzcygnaGlkZV9zbGlkZScpO1xuICAgIH0pO1xuICAgIGVsLmFwcGVuZChidG5zX2JveCk7XG5cbiAgICBlbC5hcHBlbmQoJzxoMj7QntCx0YnQuNC1INC/0LDRgNCw0LzQtdGC0YDRizwvaDI+Jyk7XG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOnNsaWRlcl9kYXRhWzBdLm1vYmlsZSxcbiAgICAgIGxhYmVsOlwi0KHQu9Cw0LnQtCDQtNC70Y8g0YLQtdC70LXRhNC+0L3QsFwiLFxuICAgICAgaW5wdXRDbGFzczpcImZpbGVTZWxlY3RcIixcbiAgICAgIG9uQ2hhbmdlOmZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZT0kKHRoaXMpLnZhbCgpXG4gICAgICAgICQoJy5tb2JfYmcnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytzbGlkZXJfZGF0YVswXS5tb2JpbGUrJyknKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTpzbGlkZXJfZGF0YVswXS5mb24sXG4gICAgICBsYWJlbDpcItCe0YHQvdC+0L3QvtC5INGE0L7QvVwiLFxuICAgICAgaW5wdXRDbGFzczpcImZpbGVTZWxlY3RcIixcbiAgICAgIG9uQ2hhbmdlOmZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZvbj0kKHRoaXMpLnZhbCgpXG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytzbGlkZXJfZGF0YVswXS5mb24rJyknKVxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdmFyIGJ0bl9jaD0kKCc8ZGl2IGNsYXNzPVwiYnRuc1wiLz4nKTtcbiAgICBidG5fY2guYXBwZW5kKCc8aDM+0JrQvdC+0L/QutCwINC/0LXRgNC10YXQvtC00LAo0LTQu9GPINCf0Jog0LLQtdGA0YHQuNC4KTwvaDM+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTpzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCxcbiAgICAgIGxhYmVsOlwi0KLQtdC60YHRglwiLFxuICAgICAgb25DaGFuZ2U6ZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQ9JCh0aGlzKS52YWwoKTtcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS50ZXh0KHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0KTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfSxcbiAgICB9KSk7XG5cbiAgICB2YXIgYnV0X3NsPSQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCk7XG5cbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoJzxzcGFuPtCe0YTQvtGA0LzQu9C10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcbiAgICBidG5fY2guYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OmJ0bl9zdHlsZSxcbiAgICAgIHZhbF90eXBlOjAsXG4gICAgICBvYmo6YnV0X3NsLFxuICAgICAgZ3I6J2J1dHRvbicsXG4gICAgICBpbmRleDpmYWxzZSxcbiAgICAgIHBhcmFtOidjb2xvcidcbiAgICB9KSk7XG5cbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoJzxzcGFuPtCf0L7Qu9C+0LbQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDpwb3NBcnIsXG4gICAgICB2YWxfbGlzdDpwb3NfbGlzdCxcbiAgICAgIHZhbF90eXBlOjIsXG4gICAgICBvYmo6YnV0X3NsLnBhcmVudCgpLnBhcmVudCgpLFxuICAgICAgZ3I6J2J1dHRvbicsXG4gICAgICBpbmRleDpmYWxzZSxcbiAgICAgIHBhcmFtOidwb3MnXG4gICAgfSkpO1xuXG4gICAgYnRuX2NoLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XG4gICAgICB0eXBlOjAsXG4gICAgICBvYmo6YnV0X3NsLnBhcmVudCgpLFxuICAgICAgZ3I6J2J1dHRvbicsXG4gICAgICBpbmRleDpmYWxzZVxuICAgIH0pKTtcbiAgICBlbC5hcHBlbmQoYnRuX2NoKTtcblxuICAgIHZhciBsYXllcj0kKCc8ZGl2IGNsYXNzPVwiZml4ZWRfbGF5ZXJcIi8+Jyk7XG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0KHRgtCw0YLQuNGH0LXRgdC60LjQtSDRgdC70L7QuDwvaDI+Jyk7XG4gICAgdmFyIHRoPVwiPHRoPuKEljwvdGg+XCIrXG4gICAgICAgICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIitcbiAgICAgICAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIrXG4gICAgICAgICAgICBcIjx0aD7QodC70L7QuSDQvdCwINCy0YHRjiDQstGL0YHQvtGC0YM8L3RoPlwiK1xuICAgICAgICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiK1xuICAgICAgICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiK1xuICAgICAgICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiK1xuICAgICAgICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiK1xuICAgICAgICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XG4gICAgc3RUYWJsZT0kKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nK3RoKyc8L3RyPjwvdGFibGU+Jyk7XG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxuICAgIHZhciBkYXRhPXNsaWRlcl9kYXRhWzBdLmZpeGVkO1xuICAgIGlmKGRhdGEgJiYgZGF0YS5sZW5ndGg+MCl7XG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKyl7XG4gICAgICAgIGFkZFRyU3RhdGljKGRhdGFbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXllci5hcHBlbmQoc3RUYWJsZSk7XG4gICAgdmFyIGFkZEJ0bj0kKCc8YnV0dG9uLz4nLHtcbiAgICAgIHRleHQ6XCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcbiAgICB9KTtcbiAgICBhZGRCdG4ub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGRhdGEgPSBhZGRUclN0YXRpYyhmYWxzZSk7XG4gICAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZGF0YS5lZGl0b3IuZmluZCgnLmZpbGVTZWxlY3QnKSk7XG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgc2xpZGVyX2RhdGE6c2xpZGVyX2RhdGFcbiAgICB9KSk7XG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XG4gICAgZWwuYXBwZW5kKGxheWVyKTtcblxuICAgIHZhciBsYXllcj0kKCc8ZGl2IGNsYXNzPVwicGFyYWxheF9sYXllclwiLz4nKTtcbiAgICBsYXllci5hcHBlbmQoJzxoMj7Qn9Cw0YDQsNC70LDQutGBINGB0LvQvtC4PC9oMj4nKTtcbiAgICB2YXIgdGg9XCI8dGg+4oSWPC90aD5cIitcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiK1xuICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIitcbiAgICAgIFwiPHRoPtCj0LTQsNC70LXQvdC90L7RgdGC0YwgKNGG0LXQu9C+0LUg0L/QvtC70L7QttC40YLQtdC70YzQvdC+0LUg0YfQuNGB0LvQvik8L3RoPlwiK1xuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XG5cbiAgICBwYXJhbGF4VGFibGU9JCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+Jyt0aCsnPC90cj48L3RhYmxlPicpO1xuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICB2YXIgZGF0YT1zbGlkZXJfZGF0YVswXS5wYXJhbGF4O1xuICAgIGlmKGRhdGEgJiYgZGF0YS5sZW5ndGg+MCl7XG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKyl7XG4gICAgICAgIGFkZFRyUGFyYWxheChkYXRhW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGF5ZXIuYXBwZW5kKHBhcmFsYXhUYWJsZSk7XG4gICAgdmFyIGFkZEJ0bj0kKCc8YnV0dG9uLz4nLHtcbiAgICAgIHRleHQ6XCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcbiAgICB9KTtcbiAgICBhZGRCdG4ub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGRhdGEgPSBhZGRUclBhcmFsYXgoZmFsc2UpO1xuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIHNsaWRlcl9kYXRhOnNsaWRlcl9kYXRhXG4gICAgfSkpO1xuXG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XG4gICAgZWwuYXBwZW5kKGxheWVyKTtcblxuICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChlbC5maW5kKCcuZmlsZVNlbGVjdCcpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFRyU3RhdGljKGRhdGEpIHtcbiAgICB2YXIgaT1zdFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoLTE7XG4gICAgaWYoIWRhdGEpe1xuICAgICAgZGF0YT17XG4gICAgICAgIFwiaW1nXCI6XCJcIixcbiAgICAgICAgXCJmdWxsX2hlaWdodFwiOjAsXG4gICAgICAgIFwicG9zXCI6MCxcbiAgICAgICAgXCJzaG93X2RlbGF5XCI6MSxcbiAgICAgICAgXCJzaG93X2FuaW1hdGlvblwiOlwibGlnaHRTcGVlZEluXCIsXG4gICAgICAgIFwiaGlkZV9kZWxheVwiOjEsXG4gICAgICAgIFwiaGlkZV9hbmltYXRpb25cIjpcImJvdW5jZU91dFwiXG4gICAgICB9O1xuICAgICAgc2xpZGVyX2RhdGFbMF0uZml4ZWQucHVzaChkYXRhKTtcbiAgICAgIHZhciBmaXggPSAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwJyk7XG4gICAgICBhZGRTdGF0aWNMYXllcihkYXRhLCBmaXgsdHJ1ZSk7XG4gICAgfTtcblxuICAgIHZhciB0cj0kKCc8dHIvPicpO1xuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6ZGF0YS5pbWcsXG4gICAgICBsYWJlbDpmYWxzZSxcbiAgICAgIHBhcmVudDondGQnLFxuICAgICAgaW5wdXRDbGFzczpcImZpbGVTZWxlY3RcIixcbiAgICAgIGJpbmQ6e1xuICAgICAgICBncjonZml4ZWQnLFxuICAgICAgICBpbmRleDppLFxuICAgICAgICBwYXJhbTonaW1nJyxcbiAgICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcbiAgICAgIH0sXG4gICAgICBvbkNoYW5nZTpmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgZGF0YT10aGlzO1xuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmlucHV0LnZhbCgpKycpJyk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkW2RhdGEuaW5kZXhdLmltZz1kYXRhLmlucHV0LnZhbCgpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDpwb3NBcnIsXG4gICAgICB2YWxfbGlzdDpwb3NfbGlzdCxcbiAgICAgIHZhbF90eXBlOjIsXG4gICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXG4gICAgICBncjonZml4ZWQnLFxuICAgICAgaW5kZXg6aSxcbiAgICAgIHBhcmFtOidwb3MnLFxuICAgICAgcGFyZW50Oid0ZCcsXG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDp5ZXNfbm9fdmFsLFxuICAgICAgdmFsX2xpc3Q6eWVzX25vX2FycixcbiAgICAgIHZhbF90eXBlOjIsXG4gICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXG4gICAgICBncjonZml4ZWQnLFxuICAgICAgaW5kZXg6aSxcbiAgICAgIHBhcmFtOidmdWxsX2hlaWdodCcsXG4gICAgICBwYXJlbnQ6J3RkJyxcbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcbiAgICAgIHR5cGU6MSxcbiAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5maW5kKCcuYW5pbWF0aW9uX2xheWVyJyksXG4gICAgICBncjonZml4ZWQnLFxuICAgICAgaW5kZXg6aSxcbiAgICAgIHBhcmVudDondGQnXG4gICAgfSkpO1xuICAgIHZhciBkZWxCdG49JCgnPGJ1dHRvbi8+Jyx7XG4gICAgICB0ZXh0Olwi0KPQtNCw0LvQuNGC0YxcIlxuICAgIH0pO1xuICAgIGRlbEJ0bi5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyICR0aGlzPSQodGhpcy5lbCk7XG4gICAgICBpPSR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKS0xO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHQu9C+0Lkg0L3QsCDRgdC70LDQudC00LXRgNC1XG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5maXhlZC5zcGxpY2UoaSwgMSk7IC8v0YPQtNCw0LvRj9C10Lwg0LjQtyDQutC+0L3RhNC40LPQsCDRgdC70LDQudC00LBcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBlbDpkZWxCdG4sXG4gICAgICBzbGlkZXJfZGF0YTpzbGlkZXJfZGF0YVxuICAgIH0pKTtcbiAgICB2YXIgZGVsQnRuVGQ9JCgnPHRkLz4nKS5hcHBlbmQoZGVsQnRuKTtcbiAgICB0ci5hcHBlbmQoZGVsQnRuVGQpO1xuICAgIHN0VGFibGUuYXBwZW5kKHRyKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVkaXRvcjp0cixcbiAgICAgIGRhdGE6ZGF0YVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFRyUGFyYWxheChkYXRhKSB7XG4gICAgdmFyIGk9cGFyYWxheFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoLTE7XG4gICAgaWYoIWRhdGEpe1xuICAgICAgZGF0YT17XG4gICAgICAgIFwiaW1nXCI6XCJcIixcbiAgICAgICAgXCJ6XCI6MVxuICAgICAgfTtcbiAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXgucHVzaChkYXRhKTtcbiAgICAgIHZhciBwYXJhbGF4X2dyID0gJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAnKTtcbiAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKTtcbiAgICB9O1xuICAgIHZhciB0cj0kKCc8dHIvPicpO1xuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6ZGF0YS5pbWcsXG4gICAgICBsYWJlbDpmYWxzZSxcbiAgICAgIHBhcmVudDondGQnLFxuICAgICAgaW5wdXRDbGFzczpcImZpbGVTZWxlY3RcIixcbiAgICAgIGJpbmQ6e1xuICAgICAgICBpbmRleDppLFxuICAgICAgICBwYXJhbTonaW1nJyxcbiAgICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6ZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGRhdGE9dGhpcztcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbnB1dC52YWwoKSsnKScpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLmltZz1kYXRhLmlucHV0LnZhbCgpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDpwb3NBcnIsXG4gICAgICB2YWxfbGlzdDpwb3NfbGlzdCxcbiAgICAgIHZhbF90eXBlOjIsXG4gICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLmZpbmQoJ3NwYW4nKSxcbiAgICAgIGdyOidwYXJhbGF4JyxcbiAgICAgIGluZGV4OmksXG4gICAgICBwYXJhbToncG9zJyxcbiAgICAgIHBhcmVudDondGQnLFxuICAgICAgc3RhcnRfb3B0aW9uOic8b3B0aW9uIHZhbHVlPVwiXCIgY29kZT1cIlwiPtC90LAg0LLQtdGB0Ywg0Y3QutGA0LDQvTwvb3B0aW9uPidcbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOmRhdGEueixcbiAgICAgIGxhYmVsOmZhbHNlLFxuICAgICAgcGFyZW50Oid0ZCcsXG4gICAgICBiaW5kOntcbiAgICAgICAgaW5kZXg6aSxcbiAgICAgICAgcGFyYW06J2ltZycsXG4gICAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSksXG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6ZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGRhdGE9dGhpcztcbiAgICAgICAgZGF0YS5vYmouYXR0cigneicsZGF0YS5pbnB1dC52YWwoKSk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0uej1kYXRhLmlucHV0LnZhbCgpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdmFyIGRlbEJ0bj0kKCc8YnV0dG9uLz4nLHtcbiAgICAgIHRleHQ6XCLQo9C00LDQu9C40YLRjFwiXG4gICAgfSk7XG4gICAgZGVsQnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgJHRoaXM9JCh0aGlzLmVsKTtcbiAgICAgIGk9JHRoaXMuY2xvc2VzdCgndHInKS5pbmRleCgpLTE7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcbiAgICAgICR0aGlzLmNsb3Nlc3QoJ3RyJykucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHRgtGA0L7QutGDINCyINGC0LDQsdC70LjRhtC1XG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLnBhcmFsYXguc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgZWw6ZGVsQnRuLFxuICAgICAgc2xpZGVyX2RhdGE6c2xpZGVyX2RhdGFcbiAgICB9KSk7XG4gICAgdmFyIGRlbEJ0blRkPSQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcbiAgICBwYXJhbGF4VGFibGUuYXBwZW5kKHRyKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVkaXRvcjp0cixcbiAgICAgIGRhdGE6ZGF0YVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZF9hbmltYXRpb24oZWwsZGF0YSl7XG4gICAgdmFyIG91dD0kKCc8ZGl2Lz4nLHtcbiAgICAgICdjbGFzcyc6J2FuaW1hdGlvbl9sYXllcidcbiAgICB9KTtcblxuICAgIGlmKHR5cGVvZihkYXRhLnNob3dfZGVsYXkpIT0ndW5kZWZpbmVkJyl7XG4gICAgICBvdXQuYWRkQ2xhc3Moc2hvd19kZWxheVtkYXRhLnNob3dfZGVsYXldKTtcbiAgICAgIGlmKGRhdGEuc2hvd19hbmltYXRpb24pe1xuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycrZGF0YS5zaG93X2FuaW1hdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYodHlwZW9mKGRhdGEuaGlkZV9kZWxheSkhPSd1bmRlZmluZWQnKXtcbiAgICAgIG91dC5hZGRDbGFzcyhoaWRlX2RlbGF5W2RhdGEuaGlkZV9kZWxheV0pO1xuICAgICAgaWYoZGF0YS5oaWRlX2FuaW1hdGlvbil7XG4gICAgICAgIG91dC5hZGRDbGFzcygnc2xpZGVfJytkYXRhLmhpZGVfYW5pbWF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlbC5hcHBlbmQob3V0KTtcbiAgICByZXR1cm4gZWw7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZV9zbGlkZShkYXRhKXtcbiAgICB2YXIgc2xpZGU9JCgnPGRpdiBjbGFzcz1cInNsaWRlXCIvPicpO1xuXG4gICAgdmFyIG1vYl9iZz0kKCc8YSBjbGFzcz1cIm1vYl9iZ1wiIGhyZWY9XCInK2RhdGEuYnV0dG9uLmhyZWYrJ1wiLz4nKTtcbiAgICBtb2JfYmcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5tb2JpbGUrJyknKVxuXG4gICAgc2xpZGUuYXBwZW5kKG1vYl9iZyk7XG4gICAgaWYobW9iaWxlX21vZGUpe1xuICAgICAgcmV0dXJuIHNsaWRlO1xuICAgIH1cblxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0YTQvtC9INGC0L4g0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgaWYoZGF0YS5mb24pe1xuICAgICAgc2xpZGUuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5mb24rJyknKVxuICAgIH1cblxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICBpZihkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aD4wKXtcbiAgICAgIHZhciBwYXJhbGF4X2dyPSQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fZ3JvdXBcIi8+Jyk7XG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEucGFyYWxheC5sZW5ndGg7aSsrKXtcbiAgICAgICAgYWRkUGFyYWxheExheWVyKGRhdGEucGFyYWxheFtpXSxwYXJhbGF4X2dyKVxuICAgICAgfVxuICAgICAgc2xpZGUuYXBwZW5kKHBhcmFsYXhfZ3IpXG4gICAgfVxuXG4gICAgdmFyIGZpeD0kKCc8ZGl2IGNsYXNzPVwiZml4ZWRfZ3JvdXBcIi8+Jyk7XG4gICAgZm9yKHZhciBpPTA7aTxkYXRhLmZpeGVkLmxlbmd0aDtpKyspe1xuICAgICAgYWRkU3RhdGljTGF5ZXIoZGF0YS5maXhlZFtpXSxmaXgpXG4gICAgfVxuXG4gICAgdmFyIGRvcF9ibGs9JChcIjxkaXYgY2xhc3M9J2ZpeGVkX19sYXllcicvPlwiKTtcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLmJ1dHRvbi5wb3NdKTtcbiAgICB2YXIgYnV0PSQoXCI8YSBjbGFzcz0nc2xpZGVyX19ocmVmJy8+XCIpO1xuICAgIGJ1dC5hdHRyKCdocmVmJyxkYXRhLmJ1dHRvbi5ocmVmKTtcbiAgICBidXQudGV4dChkYXRhLmJ1dHRvbi50ZXh0KTtcbiAgICBidXQuYWRkQ2xhc3MoZGF0YS5idXR0b24uY29sb3IpO1xuICAgIGRvcF9ibGs9YWRkX2FuaW1hdGlvbihkb3BfYmxrLGRhdGEuYnV0dG9uKTtcbiAgICBkb3BfYmxrLmZpbmQoJ2RpdicpLmFwcGVuZChidXQpO1xuICAgIGZpeC5hcHBlbmQoZG9wX2Jsayk7XG5cbiAgICBzbGlkZS5hcHBlbmQoZml4KTtcbiAgICByZXR1cm4gc2xpZGU7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRQYXJhbGF4TGF5ZXIoZGF0YSxwYXJhbGF4X2dyKXtcbiAgICB2YXIgcGFyYWxsYXhfbGF5ZXI9JCgnPGRpdiBjbGFzcz1cInBhcmFsbGF4X19sYXllclwiXFw+Jyk7XG4gICAgcGFyYWxsYXhfbGF5ZXIuYXR0cigneicsZGF0YS56fHxpKjEwKTtcbiAgICB2YXIgZG9wX2Jsaz0kKFwiPHNwYW4gY2xhc3M9J3NsaWRlcl9fdGV4dCcvPlwiKTtcbiAgICBpZihkYXRhLnBvcykge1xuICAgICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcbiAgICB9XG4gICAgZG9wX2Jsay5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xuICAgIHBhcmFsbGF4X2xheWVyLmFwcGVuZChkb3BfYmxrKTtcbiAgICBwYXJhbGF4X2dyLmFwcGVuZChwYXJhbGxheF9sYXllcik7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTdGF0aWNMYXllcihkYXRhLGZpeCxiZWZvcl9idXR0b24pe1xuICAgIHZhciBkb3BfYmxrPSQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcbiAgICBpZihkYXRhLmZ1bGxfaGVpZ2h0KXtcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MoJ2ZpeGVkX19mdWxsLWhlaWdodCcpO1xuICAgIH1cbiAgICBkb3BfYmxrPWFkZF9hbmltYXRpb24oZG9wX2JsayxkYXRhKTtcbiAgICBkb3BfYmxrLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xuXG4gICAgaWYoYmVmb3JfYnV0dG9uKXtcbiAgICAgIGZpeC5maW5kKCcuc2xpZGVyX19ocmVmJykuY2xvc2VzdCgnLmZpeGVkX19sYXllcicpLmJlZm9yZShkb3BfYmxrKVxuICAgIH1lbHNlIHtcbiAgICAgIGZpeC5hcHBlbmQoZG9wX2JsaylcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xuICAgIGlmKCQoJyNtZWdhX3NsaWRlcicpLmhhc0NsYXNzKCdzdG9wX3NsaWRlJykpcmV0dXJuO1xuXG4gICAgdmFyIHNsaWRlX3BvaW50cz0kKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVfc2VsZWN0JylcbiAgICB2YXIgc2xpZGVfY250PXNsaWRlX3BvaW50cy5sZW5ndGg7XG4gICAgdmFyIGFjdGl2ZT0kKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVyLWFjdGl2ZScpLmluZGV4KCkrMTtcbiAgICBpZihhY3RpdmU+PXNsaWRlX2NudClhY3RpdmU9MDtcbiAgICBzbGlkZV9wb2ludHMuZXEoYWN0aXZlKS5jbGljaygpO1xuXG4gICAgc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGltZ190b19sb2FkKHNyYyl7XG4gICAgdmFyIGltZz0kKCc8aW1nLz4nKTtcbiAgICBpbWcub24oJ2xvYWQnLGZ1bmN0aW9uKCl7XG4gICAgICB0b3RfaW1nX3dhaXQtLTtcblxuICAgICAgaWYodG90X2ltZ193YWl0PT0wKXtcblxuICAgICAgICBzbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dKSk7XG4gICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcShyZW5kZXJfc2xpZGVfbm9tKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblxuICAgICAgICBpZihyZW5kZXJfc2xpZGVfbm9tPT0wKXtcbiAgICAgICAgICBzbGlkZXMuZmluZCgnLnNsaWRlJylcbiAgICAgICAgICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcblxuICAgICAgICAgIGlmKCFlZGl0b3IpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5maXJzdF9zaG93JykucmVtb3ZlQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcbiAgICAgICAgICAgIH0uYmluZChzbGlkZXMpLCA1MDAwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihtb2JpbGVfbW9kZT09PWZhbHNlKSB7XG4gICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcbiAgICAgICAgICAgIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xuICAgICAgICAgICAgcGFyYWxsYXhfdGltZXIgPSBzZXRJbnRlcnZhbChyZW5kZXIsIDEwMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoZWRpdG9yKXtcbiAgICAgICAgICAgIGluaXRfZWRpdG9yKClcbiAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xuXG4gICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCcpLm9uKCdjbGljaycsJy5zbGlkZV9zZWxlY3QnLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHZhciAkdGhpcz0kKHRoaXMpO1xuICAgICAgICAgICAgICBpZigkdGhpcy5oYXNDbGFzcygnc2xpZGVyLWFjdGl2ZScpKXJldHVybjtcblxuICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkdGhpcy5pbmRleCgpO1xuICAgICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgICAgICR0aGlzLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG5cbiAgICAgICAgICAgICAgJChjb250YWluZXJfaWQrJyAuc2xpZGUuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkKycgLnNsaWRlJykuZXEoaW5kZXgpLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG5cbiAgICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuaG92ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuYWRkQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykucmVtb3ZlQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlbmRlcl9zbGlkZV9ub20rKztcbiAgICAgICAgaWYocmVuZGVyX3NsaWRlX25vbTxzbGlkZXJfZGF0YS5sZW5ndGgpe1xuICAgICAgICAgIGxvYWRfc2xpZGVfaW1nKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLm9uKCdlcnJvcicsZnVuY3Rpb24gKCkge1xuICAgICAgdG90X2ltZ193YWl0LS07XG4gICAgfSk7XG4gICAgaW1nLnByb3AoJ3NyYycsc3JjKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRfc2xpZGVfaW1nKCl7XG4gICAgdmFyIGRhdGE9c2xpZGVyX2RhdGFbcmVuZGVyX3NsaWRlX25vbV07XG4gICAgdG90X2ltZ193YWl0PTE7XG5cbiAgICBpZihtb2JpbGVfbW9kZT09PWZhbHNlKXtcbiAgICAgIHRvdF9pbWdfd2FpdCsrO1xuICAgICAgaW1nX3RvX2xvYWQoZGF0YS5mb24pO1xuICAgICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxuICAgICAgaWYoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGg+MCl7XG4gICAgICAgIHRvdF9pbWdfd2FpdCs9ZGF0YS5wYXJhbGF4Lmxlbmd0aDtcbiAgICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLnBhcmFsYXgubGVuZ3RoO2krKykge1xuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEucGFyYWxheFtpXS5pbWcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmKGRhdGEuZml4ZWQgJiYgZGF0YS5maXhlZC5sZW5ndGg+MCkge1xuICAgICAgICB0b3RfaW1nX3dhaXQgKz0gZGF0YS5maXhlZC5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEuZml4ZWRbaV0uaW1nKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW1nX3RvX2xvYWQoZGF0YS5tb2JpbGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRfaW5pdF9zbGlkZShkYXRhKXtcbiAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHZhciBpbWc9JCgnPGltZy8+Jyk7XG4gICAgaW1nLmF0dHIoJ3RpbWUnLG4pO1xuXG4gICAgZnVuY3Rpb24gb25faW1nX2xvYWQoKXtcbiAgICAgIHZhciBuID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBpbWc9JCh0aGlzKTtcbiAgICAgIG49bi1wYXJzZUludChpbWcuYXR0cigndGltZScpKTtcbiAgICAgIGlmKG4+bWF4X3RpbWVfbG9hZF9waWMpe1xuICAgICAgICBtb2JpbGVfbW9kZT10cnVlO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHZhciBtYXhfc2l6ZT0oc2NyZWVuLmhlaWdodD5zY3JlZW4ud2lkdGg/c2NyZWVuLmhlaWdodDpzY3JlZW4ud2lkdGgpO1xuICAgICAgICBpZihtYXhfc2l6ZTxtb2JpbGVfc2l6ZSl7XG4gICAgICAgICAgbW9iaWxlX21vZGU9dHJ1ZTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgbW9iaWxlX21vZGU9ZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmKG1vYmlsZV9tb2RlPT10cnVlKXtcbiAgICAgICAgJChjb250YWluZXJfaWQpLmFkZENsYXNzKCdtb2JpbGVfbW9kZScpXG4gICAgICB9XG4gICAgICByZW5kZXJfc2xpZGVfbm9tPTA7XG4gICAgICBsb2FkX3NsaWRlX2ltZygpO1xuICAgIH07XG5cbiAgICBpbWcub24oJ2xvYWQnLG9uX2ltZ19sb2FkKCkpO1xuICAgIGlmKHNsaWRlcl9kYXRhLmxlbmd0aD4wKSB7XG4gICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnP3I9JyArIE1hdGgucmFuZG9tKCk7XG4gICAgICBpbWcucHJvcCgnc3JjJywgc2xpZGVyX2RhdGFbMF0ubW9iaWxlKTtcbiAgICB9ZWxzZXtcbiAgICAgIG9uX2ltZ19sb2FkKCkuYmluZChpbWcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoZGF0YSxlZGl0b3JfaW5pdCl7XG4gICAgc2xpZGVyX2RhdGE9ZGF0YTtcbiAgICBlZGl0b3I9ZWRpdG9yX2luaXQ7XG4gICAgLy/QvdCw0YXQvtC00LjQvCDQutC+0L3RgtC10LnQvdC10YAg0Lgg0L7Rh9C40YnQsNC10Lwg0LXQs9C+XG4gICAgdmFyIGNvbnRhaW5lcj0kKGNvbnRhaW5lcl9pZCk7XG4gICAgY29udGFpbmVyLmh0bWwoJycpO1xuXG4gICAgLy/RgdC+0LfQttCw0LXQvCDQsdCw0LfQvtCy0YvQtSDQutC+0L3RgtC10LnQvdC10YDRiyDQtNC70Y8g0YHQsNC80LjRhSDRgdC70LDQudC00L7QsiDQuCDQtNC70Y8g0L/QtdGA0LXQutC70Y7Rh9Cw0YLQtdC70LXQuVxuICAgIHNsaWRlcz0kKCc8ZGl2Lz4nLHtcbiAgICAgICdjbGFzcyc6J3NsaWRlcydcbiAgICB9KTtcbiAgICB2YXIgc2xpZGVfY29udHJvbD0kKCc8ZGl2Lz4nLHtcbiAgICAgICdjbGFzcyc6J3NsaWRlX2NvbnRyb2wnXG4gICAgfSk7XG4gICAgc2xpZGVfc2VsZWN0X2JveD0kKCc8dWwvPicse1xuICAgICAgJ2NsYXNzJzonc2xpZGVfc2VsZWN0X2JveCdcbiAgICB9KTtcblxuICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INC40L3QtNC40LrQsNGC0L7RgCDQt9Cw0LPRgNGD0LfQutC4XG4gICAgdmFyIGw9JzxkaXYgY2xhc3M9XCJzay1mb2xkaW5nLWN1YmVcIj4nK1xuICAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTEgc2stY3ViZVwiPjwvZGl2PicrXG4gICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMiBzay1jdWJlXCI+PC9kaXY+JytcbiAgICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmU0IHNrLWN1YmVcIj48L2Rpdj4nK1xuICAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTMgc2stY3ViZVwiPjwvZGl2PicrXG4gICAgICAgJzwvZGl2Pic7XG4gICAgY29udGFpbmVyLmh0bWwobCk7XG5cblxuICAgIHN0YXJ0X2luaXRfc2xpZGUoZGF0YVswXSk7XG5cbiAgICAvL9Cz0LXQvdC10YDQuNGA0YPQtdC8INC60L3QvtC/0LrQuCDQuCDRgdC70LDQudC00YtcbiAgICBmb3IgKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xuICAgICAgLy9zbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKGRhdGFbaV0pKTtcbiAgICAgIHNsaWRlX3NlbGVjdF9ib3guYXBwZW5kKCc8bGkgY2xhc3M9XCJzbGlkZV9zZWxlY3QgZGlzYWJsZWRcIi8+JylcbiAgICB9XG5cbiAgICAvKnNsaWRlcy5maW5kKCcuc2xpZGUnKS5lcSgwKVxuICAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJylcbiAgICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpO1xuICAgIHNsaWRlX2NvbnRyb2wuZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpOyovXG5cbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlcyk7XG4gICAgc2xpZGVfY29udHJvbC5hcHBlbmQoc2xpZGVfc2VsZWN0X2JveCk7XG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZV9jb250cm9sKTtcblxuXG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXIoKXtcbiAgICBpZighcGFyYWxsYXhfZ3JvdXApcmV0dXJuIGZhbHNlO1xuICAgIHZhciBwYXJhbGxheF9rPShwYXJhbGxheF9jb3VudGVyLTEwKS8yO1xuXG4gICAgZm9yKHZhciBpPTA7aTxwYXJhbGxheF9ncm91cC5sZW5ndGg7aSsrKXtcbiAgICAgIHZhciBlbD1wYXJhbGxheF9ncm91cC5lcShpKTtcbiAgICAgIHZhciBqPWVsLmF0dHIoJ3onKTtcbiAgICAgIHZhciB0cj0ncm90YXRlM2QoMC4xLDAuOCwwLCcrKHBhcmFsbGF4X2spKydkZWcpIHNjYWxlKCcrKDEraiowLjUpKycpIHRyYW5zbGF0ZVooLScrKDEwK2oqMjApKydweCknO1xuICAgICAgZWwuY3NzKCd0cmFuc2Zvcm0nLHRyKVxuICAgIH1cbiAgICBwYXJhbGxheF9jb3VudGVyKz1wYXJhbGxheF9kKjAuMTtcbiAgICBpZihwYXJhbGxheF9jb3VudGVyPj0yMClwYXJhbGxheF9kPS1wYXJhbGxheF9kO1xuICAgIGlmKHBhcmFsbGF4X2NvdW50ZXI8PTApcGFyYWxsYXhfZD0tcGFyYWxsYXhfZDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xufSgpKTtcbiIsInZhciBoZWFkZXJBY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgICB2YXIgc2hhZG93ZWREb3duID0gZmFsc2U7XG5cbiAgICAkKCcubWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgICAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICQoJy5hY2NvdW50LW1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgICAgICAkKCcuZHJvcC1tZW51JykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKSkge1xuICAgICAgICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnbm9fc2Nyb2xsJyk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnLnNlYXJjaC10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGxfYWNjb3VudCcpO1xuICAgICAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgICAgICQoJyNhdXRvY29tcGxldGUnKS5mYWRlT3V0KCk7XG4gICAgICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpKSB7XG4gICAgICAgICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnI2hlYWRlcicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC5pZCA9PSAnaGVhZGVyJykge1xuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCcuaGVhZGVyLXNlYXJjaF9mb3JtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQodGhpcykuY2xvc2VzdCgnZm9ybScpLnN1Ym1pdCgpO1xuICAgIH0pO1xuXG4gICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lX2Nsb3NlJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgICAgICAkKCcuYWNjb3VudC1tZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbCcpO1xuICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XG4gICAgfSk7XG5cbiAgICAkKCcuaGVhZGVyLXVwbGluZScpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbihlKXtcbiAgICAgICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XG4gICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsJyk7XG4gICAgICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdsb2FkIHJlc2l6ZSBzY3JvbGwnLGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2hhZG93SGVpZ2h0ID0gNTA7XG4gICAgICAgIHZhciBoaWRlSGVpZ2h0ID0gMjAwO1xuICAgICAgICB2YXIgaGVhZGVyU2Vjb25kTGluZSA9ICQoJy5oZWFkZXItc2Vjb25kbGluZScpO1xuICAgICAgICB2YXIgaG92ZXJzID0gaGVhZGVyU2Vjb25kTGluZS5maW5kKCc6aG92ZXInKTtcbiAgICAgICAgdmFyIGhlYWRlciA9ICQoJy5oZWFkZXInKTtcblxuICAgICAgICBpZiAoIWhvdmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcbiAgICAgICAgICAgIGhlYWRlci5yZW1vdmVDbGFzcygnc2Nyb2xsYWJsZScpO1xuICAgICAgICAgICAgLy9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXG4gICAgICAgICAgICB2YXIgc2Nyb2xsVG9wPSQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPiBzaGFkb3dIZWlnaHQgJiYgc2hhZG93ZWREb3duID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHNoYWRvd2VkRG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2hhZG93ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPD0gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHNoYWRvd2VkRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3NoYWRvd2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2Nyb2xsVG9wID4gaGlkZUhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsZWREb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzY3JvbGwtZG93bicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNjcm9sbFRvcCA8PSBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgICAgICAgICBoZWFkZXIuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnLm1lbnVfYW5nbGUtZG93biwgLmRyb3AtbWVudV9ncm91cF9fdXAtaGVhZGVyJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgbWVudU9wZW4gPSAkKHRoaXMpLmNsb3Nlc3QoJy5oZWFkZXJfb3Blbi1tZW51LCAuY2F0YWxvZy1jYXRlZ29yaWVzJyk7XG4gICAgICAgIGlmICghbWVudU9wZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBwYXJlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnVfZ3JvdXBfX3VwLCAubWVudS1ncm91cCcpO1xuICAgICAgICB2YXIgcGFyZW50TWVudSA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudScpO1xuICAgICAgICBpZiAocGFyZW50TWVudSkge1xuICAgICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICAkKHBhcmVudCkudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgIGlmIChwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgICAgICAgICAgICQocGFyZW50KS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcbiAgICAgICAgICAgICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5hZGRDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50TWVudSkge1xuICAgICAgICAgICAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuXG4gICAgdmFyIGFjY291bnRNZW51VGltZU91dCA9IG51bGw7XG4gICAgdmFyIGFjY291bnRNZW51T3BlblRpbWUgPSAwO1xuICAgIHZhciBhY2NvdW50TWVudSA9ICQoJy5hY2NvdW50LW1lbnUnKTtcblxuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gMTAyNCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG4gICAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcblxuICAgICAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XG5cbiAgICAgICAgIGlmIChhY2NvdW50TWVudS5oYXNDbGFzcygnaGlkZGVuJykpIHtcbiAgICAgICAgICAgICBtZW51QWNjb3VudFVwKHRoYXQpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGF0LnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICBhY2NvdW50TWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgLy/Qv9C+0LrQsNC3INC80LXQvdGOINCw0LrQutCw0YPQvdGCXG4gICAgZnVuY3Rpb24gbWVudUFjY291bnRVcCh0b2dnbGVCdXR0b24pXG4gICAge1xuICAgICAgICBjbGVhckludGVydmFsKGFjY291bnRNZW51VGltZU91dCk7XG4gICAgICAgIHRvZ2dsZUJ1dHRvbi5hZGRDbGFzcygnb3BlbicpO1xuICAgICAgICBhY2NvdW50TWVudS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSAxMDI0KSB7XG4gICAgICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ25vX3Njcm9sbF9hY2NvdW50Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBhY2NvdW50TWVudU9wZW5UaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgYWNjb3VudE1lbnVUaW1lT3V0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gMTAyNCkge1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoYWNjb3VudE1lbnVUaW1lT3V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgobmV3IERhdGUoKSAtIGFjY291bnRNZW51T3BlblRpbWUpID4gMTAwMCAqIDcpIHtcbiAgICAgICAgICAgICAgICBhY2NvdW50TWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgdG9nZ2xlQnV0dG9uLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChhY2NvdW50TWVudVRpbWVPdXQpO1xuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xsX2FjY291bnQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LCAxMDAwKTtcbiAgICB9XG5cbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzLWFjY291bnRfbWVudS1oZWFkZXInKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24oKXtcbiAgICAgICAgYWNjb3VudE1lbnVPcGVuVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgfSk7XG4gICAgJCgnLmFjY291bnQtbWVudScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgICBpZiAoJChlLnRhcmdldCkuaGFzQ2xhc3MoJ2FjY291bnQtbWVudScpKSB7XG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuXG59KCk7XG5cblxuXG5cbiIsIiQoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gcGFyc2VOdW0oc3RyKXtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoXG4gICAgICAgICAgICBTdHJpbmcoc3RyKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKCcsJywnLicpXG4gICAgICAgICAgICAgICAgLm1hdGNoKC8tP1xcZCsoPzpcXC5cXGQrKT8vZywgJycpIHx8IDBcbiAgICAgICAgICAgICwgMTBcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAkKCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpLmZpbmQoJ3NlbGVjdCxpbnB1dCcpLm9uKCdjaGFuZ2Uga2V5dXAgY2xpY2snLGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICR0aGlzPSQodGhpcykuY2xvc2VzdCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKTtcbiAgICAgICAgdmFyIGN1cnM9cGFyc2VOdW0oJHRoaXMuZmluZCgnc2VsZWN0JykudmFsKCkpO1xuICAgICAgICB2YXIgdmFsPSR0aGlzLmZpbmQoJ2lucHV0JykudmFsKCk7XG4gICAgICAgIGlmIChwYXJzZU51bSh2YWwpICE9IHZhbCkge1xuICAgICAgICAgICAgdmFsPSR0aGlzLmZpbmQoJ2lucHV0JykudmFsKHBhcnNlTnVtKHZhbCkpO1xuICAgICAgICB9XG4gICAgICAgIHZhbD1wYXJzZU51bSh2YWwpO1xuXG4gICAgICAgIHZhciBrb2VmPSR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjaycpLnRyaW0oKTtcbiAgICAgICAgdmFyIHByb21vPSR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1wcm9tbycpLnRyaW0oKTtcbiAgICAgICAgdmFyIGN1cnJlbmN5PSR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1jdXJyZW5jeScpLnRyaW0oKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IDA7XG4gICAgICAgIHZhciBvdXQgPSAwO1xuXG4gICAgICAgIGlmIChrb2VmPT1wcm9tbykge1xuICAgICAgICAgICAgcHJvbW89MDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGtvZWYuaW5kZXhPZignJScpPjApe1xuICAgICAgICAgICAgcmVzdWx0PXBhcnNlTnVtKGtvZWYpKnZhbCpjdXJzLzEwMDtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjdXJzPXBhcnNlTnVtKCR0aGlzLmZpbmQoJ1tjb2RlPScrY3VycmVuY3krJ10nKS52YWwoKSk7XG4gICAgICAgICAgICByZXN1bHQ9cGFyc2VOdW0oa29lZikqY3Vyc1xuICAgICAgICB9XG5cbiAgICAgICAgaWYocGFyc2VOdW0ocHJvbW8pPjApIHtcbiAgICAgICAgICAgIGlmKHByb21vLmluZGV4T2YoJyUnKT4wKXtcbiAgICAgICAgICAgICAgICBwcm9tbz1wYXJzZU51bShwcm9tbykqdmFsKmN1cnMvMTAwO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgcHJvbW89cGFyc2VOdW0ocHJvbW8pKmN1cnNcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYocHJvbW8+MCkge1xuICAgICAgICAgICAgICAgIG91dCA9IFwiPHNwYW4gY2xhc3M9b2xkX3ByaWNlPlwiICsgcmVzdWx0LnRvRml4ZWQoMikgKyBcIjwvc3Bhbj4gXCIgKyBwcm9tby50b0ZpeGVkKDIpXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBvdXQ9cmVzdWx0LnRvRml4ZWQoMilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBvdXQ9cmVzdWx0LnRvRml4ZWQoMilcbiAgICAgICAgfVxuXG5cbiAgICAgICAgJHRoaXMuZmluZCgnLmNhbGMtcmVzdWx0X3ZhbHVlJykuaHRtbChvdXQpXG4gICAgfSkuY2xpY2soKVxufSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVscz0kKCcuYXV0b19oaWRlX2NvbnRyb2wnKTtcbiAgaWYoZWxzLmxlbmd0aD09MClyZXR1cm47XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJyxcIi5zY3JvbGxfYm94LXNob3dfbW9yZVwiLGZ1bmN0aW9uKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgZGF0YT17XG4gICAgICBidXR0b25ZZXM6ZmFsc2UsXG4gICAgICBub3R5ZnlfY2xhc3M6XCJub3RpZnlfd2hpdGUgbm90aWZ5X25vdF9iaWdcIlxuICAgIH07XG5cbiAgICAkdGhpcz0kKHRoaXMpO1xuICAgIHZhciBjb250ZW50ID0gJHRoaXMuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbScpLmNsb25lKCk7XG4gICAgY29udGVudD1jb250ZW50WzBdO1xuICAgIGNvbnRlbnQuY2xhc3NOYW1lICs9ICcgc2Nyb2xsX2JveC1pdGVtLW1vZGFsJztcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LmNsYXNzTmFtZSA9ICdjb21tZW50cyc7XG4gICAgZGl2LmFwcGVuZChjb250ZW50KTtcbiAgICAkKGRpdikuZmluZCgnLnNjcm9sbF9ib3gtc2hvd19tb3JlJykucmVtb3ZlKCk7XG4gICAgJChkaXYpLmZpbmQoJy5tYXhfdGV4dF9oaWRlJylcbiAgICAgIC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS14MicpXG4gICAgICAucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUnKTtcbiAgICBkYXRhLnF1ZXN0aW9uPSBkaXYub3V0ZXJIVE1MO1xuXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuICB9KTtcblxuXG4gIGZ1bmN0aW9uIGhhc1Njcm9sbChlbCkge1xuICAgIHJldHVybiBlbC5zY3JvbGxIZWlnaHQ+ZWwuY2xpZW50SGVpZ2h0O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVidWlsZCgpe1xuICAgIGZvcih2YXIgaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xuICAgICAgdmFyIGVsPWVscy5lcShpKTtcbiAgICAgIHZhciBpc19oaWRlPWZhbHNlO1xuICAgICAgaWYoZWwuaGVpZ2h0KCk8MTApe1xuICAgICAgICBpc19oaWRlPXRydWU7XG4gICAgICAgIGVsLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0taGlkZScpLnNob3coMCk7XG4gICAgICB9XG5cbiAgICAgIHZhciB0ZXh0PWVsLmZpbmQoJy5zY3JvbGxfYm94LXRleHQnKTtcbiAgICAgIHZhciBhbnN3ZXI9ZWwuZmluZCgnLnNjcm9sbF9ib3gtYW5zd2VyJyk7XG4gICAgICB2YXIgc2hvd19tb3JlPWVsLmZpbmQoJy5zY3JvbGxfYm94LXNob3dfbW9yZScpO1xuXG4gICAgICB2YXIgc2hvd19idG49ZmFsc2U7XG4gICAgICBpZihoYXNTY3JvbGwodGV4dFswXSkpe1xuICAgICAgICBzaG93X2J0bj10cnVlO1xuICAgICAgICB0ZXh0LnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0ZXh0LmFkZENsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcbiAgICAgIH1cblxuICAgICAgaWYoYW5zd2VyLmxlbmd0aD4wKXtcbiAgICAgICAgLy/QtdGB0YLRjCDQvtGC0LLQtdGCINCw0LTQvNC40L3QsFxuICAgICAgICBpZihoYXNTY3JvbGwoYW5zd2VyWzBdKSl7XG4gICAgICAgICAgc2hvd19idG49dHJ1ZTtcbiAgICAgICAgICBhbnN3ZXIucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBhbnN3ZXIuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHNob3dfYnRuKXtcbiAgICAgICAgc2hvd19tb3JlLnNob3coKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBzaG93X21vcmUuaGlkZSgpO1xuICAgICAgfVxuXG4gICAgICBpZihpc19oaWRlKXtcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuaGlkZSgwKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAkKHdpbmRvdykucmVzaXplKHJlYnVpbGQpO1xuICByZWJ1aWxkKCk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5zaG93X2FsbCcsZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBjbHM9JCh0aGlzKS5kYXRhKCdjbnRybC1jbGFzcycpO1xuICAgICQoJy5oaWRlX2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcbiAgICAkKHRoaXMpLmhpZGUoKTtcbiAgICAkKCcuJytjbHMpLnNob3coKTtcbiAgfSk7XG5cbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5oaWRlX2FsbCcsZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBjbHM9JCh0aGlzKS5kYXRhKCdjbnRybC1jbGFzcycpO1xuICAgICQoJy5zaG93X2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcbiAgICAkKHRoaXMpLmhpZGUoKTtcbiAgICAkKCcuJytjbHMpLmhpZGUoKTtcbiAgfSk7XG59KSgpO1xuIiwiJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gZGVjbE9mTnVtKG51bWJlciwgdGl0bGVzKSB7XG4gICAgY2FzZXMgPSBbMiwgMCwgMSwgMSwgMSwgMl07XG4gICAgcmV0dXJuIHRpdGxlc1sgKG51bWJlciUxMDA+NCAmJiBudW1iZXIlMTAwPDIwKT8gMiA6IGNhc2VzWyhudW1iZXIlMTA8NSk/bnVtYmVyJTEwOjVdIF07XG4gIH1cblxuICBmdW5jdGlvbiBmaXJzdFplcm8odil7XG4gICAgdj1NYXRoLmZsb29yKHYpO1xuICAgIGlmKHY8MTApXG4gICAgICByZXR1cm4gJzAnK3Y7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHY7XG4gIH1cblxuICB2YXIgY2xvY2tzPSQoJy5jbG9jaycpO1xuICBpZihjbG9ja3MubGVuZ3RoPjApe1xuICAgIGZ1bmN0aW9uIHVwZGF0ZUNsb2NrKCl7XG4gICAgICB2YXIgY2xvY2tzPSQodGhpcyk7XG4gICAgICB2YXIgbm93PW5ldyBEYXRlKCk7XG4gICAgICBmb3IodmFyIGk9MDtpPGNsb2Nrcy5sZW5ndGg7aSsrKXtcbiAgICAgICAgdmFyIGM9Y2xvY2tzLmVxKGkpO1xuICAgICAgICB2YXIgZW5kPW5ldyBEYXRlKGMuZGF0YSgnZW5kJykucmVwbGFjZSgvLS9nLCBcIi9cIikpO1xuICAgICAgICB2YXIgZD0oZW5kLmdldFRpbWUoKS1ub3cuZ2V0VGltZSgpKS8gMTAwMDtcblxuICAgICAgICAvL9C10YHQu9C4INGB0YDQvtC6INC/0YDQvtGI0LXQu1xuICAgICAgICBpZihkPD0wKXtcbiAgICAgICAgICBjLnRleHQoJ9Cf0YDQvtC80L7QutC+0LQg0LjRgdGC0LXQuicpO1xuICAgICAgICAgIGMuYWRkQ2xhc3MoJ2Nsb2NrLWV4cGlyZWQnKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0LHQvtC70LXQtSAzMCDQtNC90LXQuVxuICAgICAgICBpZihkPjMwKjYwKjYwKjI0KXtcbiAgICAgICAgICBjLmh0bWwoJ9Ce0YHRgtCw0LvQvtGB0Yw6IDxzcGFuPtCx0L7Qu9C10LUgMzAg0LTQvdC10Lk8L3NwYW4+Jyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcz1kICUgNjA7XG4gICAgICAgIGQ9KGQtcykvNjA7XG4gICAgICAgIHZhciBtPWQgJSA2MDtcbiAgICAgICAgZD0oZC1tKS82MDtcbiAgICAgICAgdmFyIGg9ZCAlIDI0O1xuICAgICAgICBkPShkLWgpLzI0O1xuXG4gICAgICAgIHZhciBzdHI9Zmlyc3RaZXJvKGgpK1wiOlwiK2ZpcnN0WmVybyhtKStcIjpcIitmaXJzdFplcm8ocyk7XG4gICAgICAgIGlmKGQ+MCl7XG4gICAgICAgICAgc3RyPWQrXCIgXCIrZGVjbE9mTnVtKGQsIFsn0LTQtdC90YwnLCAn0LTQvdGPJywgJ9C00L3QtdC5J10pK1wiICBcIitzdHI7XG4gICAgICAgIH1cbiAgICAgICAgYy5odG1sKFwi0J7RgdGC0LDQu9C+0YHRjDogPHNwYW4+XCIrc3RyK1wiPC9zcGFuPlwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRJbnRlcnZhbCh1cGRhdGVDbG9jay5iaW5kKGNsb2NrcyksMTAwMCk7XG4gICAgdXBkYXRlQ2xvY2suYmluZChjbG9ja3MpKCk7XG4gIH1cblxufSk7IiwidmFyIGNhdGFsb2dUeXBlU3dpdGNoZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2F0YWxvZyA9ICQoJy5jYXRhbG9nX2xpc3QnKTtcbiAgICBpZihjYXRhbG9nLmxlbmd0aD09MClyZXR1cm47XG5cbiAgICAkKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5maW5kKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24nKS5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xuICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdjaGVja2VkJyk7XG4gICAgICAgIGlmIChjYXRhbG9nKSB7XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykpIHtcbiAgICAgICAgICAgICAgICBjYXRhbG9nLnJlbW92ZUNsYXNzKCduYXJyb3cnKTtcbiAgICAgICAgICAgICAgICBzZXRDb29raWUoJ2NvdXBvbnNfdmlldycsJycpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1uYXJyb3cnKSkge1xuICAgICAgICAgICAgICAgIGNhdGFsb2cuYWRkQ2xhc3MoJ25hcnJvdycpO1xuICAgICAgICAgICAgICAgIHNldENvb2tpZSgnY291cG9uc192aWV3JywnbmFycm93Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmKGdldENvb2tpZSgnY291cG9uc192aWV3Jyk9PSduYXJyb3cnICYmICFjYXRhbG9nLmhhc0NsYXNzKCduYXJyb3dfb2ZmJykpe1xuICAgICAgICBjYXRhbG9nLmFkZENsYXNzKCduYXJyb3cnKTtcbiAgICAgICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbmFycm93JykuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcbiAgICAgICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbGlzdCcpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XG4gICAgfVxufSgpOyIsIiQoZnVuY3Rpb24gKCkge1xuICAgICQoJy5zZC1zZWxlY3Qtc2VsZWN0ZWQnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgICB2YXIgcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAgICAgdmFyIGRyb3BCbG9jayA9ICQocGFyZW50KS5maW5kKCcuc2Qtc2VsZWN0LWRyb3AnKTtcblxuICAgICAgICBpZiggZHJvcEJsb2NrLmlzKCc6aGlkZGVuJykgKSB7XG4gICAgICAgICAgICBkcm9wQmxvY2suc2xpZGVEb3duKCk7XG5cbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgICAgICAgICBpZiAoIXBhcmVudC5oYXNDbGFzcygnbGlua2VkJykpIHtcblxuICAgICAgICAgICAgICAgICQoJy5zZC1zZWxlY3QtZHJvcCcpLmZpbmQoJ2EnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdFJlc3VsdCA9ICQodGhpcykuaHRtbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICQocGFyZW50KS5maW5kKCdpbnB1dCcpLnZhbChzZWxlY3RSZXN1bHQpO1xuXG4gICAgICAgICAgICAgICAgICAgICQocGFyZW50KS5maW5kKCcuc2Qtc2VsZWN0LXNlbGVjdGVkJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLmh0bWwoc2VsZWN0UmVzdWx0KTtcblxuICAgICAgICAgICAgICAgICAgICBkcm9wQmxvY2suc2xpZGVVcCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG59KTsiLCJzZWFyY2ggPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3BlbkF1dG9jb21wbGV0ZTtcblxuICAgICQoJy5zZWFyY2gtZm9ybS1pbnB1dCcpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICR0aGlzPSQodGhpcyk7XG4gICAgICAgIHZhciBxdWVyeSA9ICR0aGlzLnZhbCgpO1xuICAgICAgICB2YXIgZGF0YSA9ICR0aGlzLmNsb3Nlc3QoJ2Zvcm0nKS5zZXJpYWxpemUoKTtcbiAgICAgICAgdmFyIGF1dG9jb21wbGV0ZSA9ICR0aGlzLmNsb3Nlc3QoJy5zdG9yZXNfc2VhcmNoJykuZmluZCgnLmF1dG9jb21wbGV0ZS13cmFwJyk7Ly8gJCgnI2F1dG9jb21wbGV0ZScpLFxuICAgICAgICB2YXIgYXV0b2NvbXBsZXRlTGlzdCA9ICQoYXV0b2NvbXBsZXRlKS5maW5kKCd1bCcpO1xuICAgICAgICBvcGVuQXV0b2NvbXBsZXRlICA9IGF1dG9jb21wbGV0ZTtcbiAgICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aD4xKSB7XG4gICAgICAgICAgICB1cmw9JHRoaXMuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicpfHwnL3NlYXJjaCc7XG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdnZXQnLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaHRtbCA9ICc8YSBjbGFzcz1cImF1dG9jb21wbGV0ZV9saW5rXCIgaHJlZj1cIicraXRlbS5kYXRhLnJvdXRlKydcIicrJz4nK2l0ZW0udmFsdWUraXRlbS5jYXNoYmFjaysnPC9hPic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmFwcGVuZChsaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pLm9uKCdmb2N1c291dCcsZnVuY3Rpb24oZSl7XG4gICAgICAgIGlmICghJChlLnJlbGF0ZWRUYXJnZXQpLmhhc0NsYXNzKCdhdXRvY29tcGxldGVfbGluaycpKSB7XG4gICAgICAgICAgICAvLyQoJyNhdXRvY29tcGxldGUnKS5oaWRlKCk7XG4gICAgICAgICAgICAkKG9wZW5BdXRvY29tcGxldGUpLmRlbGF5KCAxMDAgKS5zbGlkZVVwKDEwMClcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnYm9keScpLm9uKCdzdWJtaXQnLCAnLnN0b3Jlcy1zZWFyY2hfZm9ybScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHZhbCA9ICQodGhpcykuZmluZCgnLnNlYXJjaC1mb3JtLWlucHV0JykudmFsKCk7XG4gICAgICAgIGlmICh2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSlcblxufSgpO1xuIiwiKGZ1bmN0aW9uKCl7XG5cbiAgICAkKCcuY291cG9ucy1saXN0X2l0ZW0tY29udGVudC1nb3RvLXByb21vY29kZS1saW5rJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcbiAgICAgICAgdmFyIGV4cGlyZWQgPSB0aGF0LmNsb3Nlc3QoJy5jb3Vwb25zLWxpc3RfaXRlbScpLmZpbmQoJy5jbG9jay1leHBpcmVkJyk7XG4gICAgICAgIHZhciB1c2VySWQgPSAkKHRoYXQpLmRhdGEoJ3VzZXInKTtcbiAgICAgICAgdmFyIGluYWN0aXZlID0gJCh0aGF0KS5kYXRhKCdpbmFjdGl2ZScpO1xuICAgICAgICB2YXIgZGF0YV9tZXNzYWdlID0gJCh0aGF0KS5kYXRhKCdtZXNzYWdlJyk7XG5cbiAgICAgICAgaWYgKGluYWN0aXZlKSB7XG4gICAgICAgICAgICB2YXIgdGl0bGUgPSBkYXRhX21lc3NhZ2UgPyBkYXRhX21lc3NhZ2UgOiAn0Jog0YHQvtC20LDQu9C10L3QuNGOLCDQv9GA0L7QvNC+0LrQvtC0INC90LXQsNC60YLQuNCy0LXQvSc7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9ICfQktGB0LUg0LTQtdC50YHRgtCy0YPRjtGJ0LjQtSDQv9GA0L7QvNC+0LrQvtC00Ysg0LLRiyDQvNC+0LbQtdGC0LUgPGEgaHJlZj1cIi9jb3Vwb25zXCI+0L/QvtGB0LzQvtGC0YDQtdGC0Ywg0LfQtNC10YHRjDwvYT4nO1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHtcbiAgICAgICAgICAgICAgICAndGl0bGUnOiB0aXRsZSxcbiAgICAgICAgICAgICAgICAncXVlc3Rpb24nOiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICdidXR0b25ZZXMnOiAnT2snLFxuICAgICAgICAgICAgICAgICdidXR0b25Obyc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICdub3R5ZnlfY2xhc3MnOiAnbm90aWZ5X2JveC1hbGVydCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9ICBlbHNlIGlmIChleHBpcmVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciB0aXRsZSA9ICfQmiDRgdC+0LbQsNC70LXQvdC40Y4sINGB0YDQvtC6INC00LXQudGB0YLQstC40Y8g0LTQsNC90L3QvtCz0L4g0L/RgNC+0LzQvtC60L7QtNCwINC40YHRgtC10LonO1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSAn0JLRgdC1INC00LXQudGB0YLQstGD0Y7RidC40LUg0L/RgNC+0LzQvtC60L7QtNGLINCy0Ysg0LzQvtC20LXRgtC1IDxhIGhyZWY9XCIvY291cG9uc1wiPtC/0L7RgdC80L7RgtGA0LXRgtGMINC30LTQtdGB0Yw8L2E+JztcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzogdGl0bGUsXG4gICAgICAgICAgICAgICAgJ3F1ZXN0aW9uJzogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAnYnV0dG9uWWVzJzogJ09rJyxcbiAgICAgICAgICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAnbm90eWZ5X2NsYXNzJzogJ25vdGlmeV9ib3gtYWxlcnQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmICghdXNlcklkKSB7XG4gICAgICAgICAgICB2YXIgZGF0YT17XG4gICAgICAgICAgICAgICAgJ2J1dHRvblllcyc6ZmFsc2UsXG4gICAgICAgICAgICAgICAgJ25vdHlmeV9jbGFzcyc6IFwibm90aWZ5X2JveC1hbGVydFwiLFxuICAgICAgICAgICAgICAgICd0aXRsZSc6ICfQmNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0L/RgNC+0LzQvtC60L7QtCcsXG4gICAgICAgICAgICAgICAgJ3F1ZXN0aW9uJzpcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJub3RpZnlfYm94LWNvdXBvbi1ub3JlZ2lzdGVyXCI+JytcbiAgICAgICAgICAgICAgICAgICAgICAgICc8aW1nIHNyYz1cIi9pbWFnZXMvdGVtcGxhdGVzL3N3YS5wbmdcIiBhbHQ9XCJcIj4nK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxwPjxiPtCV0YHQu9C4INCy0Ysg0YXQvtGC0LjRgtC1INC/0L7Qu9GD0YfQsNGC0Ywg0LXRidC1INC4INCa0K3QqNCR0K3QmiAo0LLQvtC30LLRgNCw0YIg0LTQtdC90LXQsyksINCy0LDQvCDQvdC10L7QsdGF0L7QtNC40LzQviDQt9Cw0YDQtdCz0LjRgdGC0YDQuNGA0L7QstCw0YLRjNGB0Y8uINCd0L4g0LzQvtC20LXRgtC1INC4INC/0YDQvtGB0YLQviDQstC+0YHQv9C+0LvRjNC30L7QstCw0YLRjNGB0Y8g0L/RgNC+0LzQvtC60L7QtNC+0LwsINCx0LXQtyDQutGN0YjQsdGN0LrQsC48L2I+PC9wPicrXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3gtYnV0dG9uc1wiPicrXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGEgaHJlZj1cIicrdGhhdC5hdHRyKCdocmVmJykrJ1wiIHRhcmdldD1cIl9ibGFua1wiIGNsYXNzPVwiYnRuXCI+0JjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMINC/0YDQvtC80L7QutC+0LQ8L2E+JytcbiAgICAgICAgICAgICAgICAgICAgICAgICc8YSBocmVmPVwiI3JlZ2lzdHJhdGlvblwiIGNsYXNzPVwiYnRuIGJ0bi10cmFuc2Zvcm0gbW9kYWxzX29wZW5cIj7Ql9Cw0YDQtdCz0LjRgdGC0YDQuNGA0L7QstCw0YLRjNGB0Y88L2E+JytcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PidcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJCgnLmFjY291bnQtd2l0aGRyYXctbWV0aG9kc19pdGVtLW9wdGlvbicpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBvcHRpb24gPSAkKHRoaXMpLmRhdGEoJ29wdGlvbi1wcm9jZXNzJyksXG4gICAgICAgICAgICBwbGFjZWhvbGRlciA9ICcnO1xuICAgICAgICBzd2l0Y2gob3B0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YHRh9GR0YLQsFwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAgUi3QutC+0YjQtdC70YzQutCwXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDRgtC10LvQtdGE0L7QvdCwXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDQutCw0YDRgtGLXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUgZW1haWwg0LDQtNGA0LXRgVwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YLQtdC70LXRhNC+0L3QsFwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoXCIjdXNlcnN3aXRoZHJhdy1iaWxsXCIpLmF0dHIoXCJwbGFjZWhvbGRlclwiLCBwbGFjZWhvbGRlcik7XG4gICAgICAgICQoJyN1c2Vyc3dpdGhkcmF3LXByb2Nlc3NfaWQnKS52YWwob3B0aW9uKTtcbiAgICB9KTtcblxufSkoKTsiLCIoZnVuY3Rpb24oKXtcblxuICAgIGFqYXhGb3JtKCQoJy5hamF4X2Zvcm0nKSk7XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG5cbiAgICAkKCcuZG9icm8tZnVuZHNfaXRlbS1idXR0b24nKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgICAgJCgnI2RvYnJvLXNlbmQtZm9ybS1jaGFyaXR5LXByb2Nlc3MnKS52YWwoJCh0aGlzKS5kYXRhKCdpZCcpKTtcbiAgICB9KTtcblxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICQoJ2JvZHknKS5hZGRDbGFzcygnbm9fc2Nyb2xsJyk7XG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdCcpLmFkZENsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtb3BlbicpO1xuICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS5hZGRDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlLW9wZW4nKTtcbiAgfSk7XG4gICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtY2xvc2UnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdub19zY3JvbGwnKTtcbiAgICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0JykucmVtb3ZlQ2xhc3MoJ2NhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdC1vcGVuJyk7XG4gICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLnJlbW92ZUNsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUtb3BlbicpO1xuICB9KTtcbn0pKCk7IiwiLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xuc2hhcmU0MiA9IGZ1bmN0aW9uICgpe1xuICBlPWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXJlNDJpbml0Jyk7XG4gIGZvciAodmFyIGsgPSAwOyBrIDwgZS5sZW5ndGg7IGsrKykge1xuICAgIHZhciB1ID0gXCJcIjtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29jaWFscycpICE9IC0xKVxuICAgICAgdmFyIHNvY2lhbHMgPSBKU09OLnBhcnNlKCdbJytlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1zb2NpYWxzJykrJ10nKTtcbiAgICB2YXIgaWNvbl90eXBlPWVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tdHlwZScpICE9IC0xP2Vba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24tdHlwZScpOicnO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKSAhPSAtMSlcbiAgICAgIHUgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKTtcbiAgICB2YXIgcHJvbW8gPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9tbycpO1xuICAgIGlmKHByb21vID09IC0xKSB7XG4gICAgICB2YXIga2V5ID0gJ3Byb21vPScsXG4gICAgICAgIHByb21vU3RhcnQgPSB1LmluZGV4T2Yoa2V5KSxcbiAgICAgICAgcHJvbW9FbmQgPSB1LmluZGV4T2YoJyYnLCBwcm9tb1N0YXJ0KSxcbiAgICAgICAgcHJvbW9MZW5ndGggPSBwcm9tb0VuZCA+IHByb21vU3RhcnQgPyBwcm9tb0VuZCAtIHByb21vU3RhcnQgLSBrZXkubGVuZ3RoIDogdS5sZW5ndGggLSBwcm9tb1N0YXJ0IC0ga2V5Lmxlbmd0aDtcbiAgICAgIGlmKHByb21vU3RhcnQgPiAwKSB7XG4gICAgICAgIHByb21vID0gdS5zdWJzdHIocHJvbW9TdGFydCArIGtleS5sZW5ndGgsIHByb21vTGVuZ3RoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIHNlbGZfcHJvbW8gPSBwcm9tbyAhPS0xID8gXCJzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2VuZF9wcm9tbygnXCIrcHJvbW8rXCInKX0sMjAwMCk7XCIgOiBcIlwiO1xuICAgIGlmIChlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXNpemUnKSAhPSAtMSlcbiAgICAgIHZhciBpY29uX3NpemUgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uLXNpemUnKTtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnKSAhPSAtMSlcbiAgICAgIHZhciB0ID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnKTtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1hZ2UnKSAhPSAtMSlcbiAgICAgIHZhciBpID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1hZ2UnKTtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzY3JpcHRpb24nKSAhPSAtMSlcbiAgICAgIHZhciBkID0gZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzY3JpcHRpb24nKTtcbiAgICBpZiAoZVtrXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF0aCcpICE9IC0xKVxuICAgICAgdmFyIGYgPSBlW2tdLmdldEF0dHJpYnV0ZSgnZGF0YS1wYXRoJyk7XG4gICAgaWYgKGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb25zLWZpbGUnKSAhPSAtMSlcbiAgICAgIHZhciBmbiA9IGVba10uZ2V0QXR0cmlidXRlKCdkYXRhLWljb25zLWZpbGUnKTtcbiAgICBpZiAoIWYpIHtcbiAgICAgIGZ1bmN0aW9uIHBhdGgobmFtZSkge1xuICAgICAgICB2YXIgc2MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylcbiAgICAgICAgICAsIHNyID0gbmV3IFJlZ0V4cCgnXiguKi98KSgnICsgbmFtZSArICcpKFsjP118JCknKTtcbiAgICAgICAgZm9yICh2YXIgcCA9IDAsIHNjTCA9IHNjLmxlbmd0aDsgcCA8IHNjTDsgcCsrKSB7XG4gICAgICAgICAgdmFyIG0gPSBTdHJpbmcoc2NbcF0uc3JjKS5tYXRjaChzcik7XG4gICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgIGlmIChtWzFdLm1hdGNoKC9eKChodHRwcz98ZmlsZSlcXDpcXC97Mix9fFxcdzpbXFwvXFxcXF0pLykpXG4gICAgICAgICAgICAgIHJldHVybiBtWzFdO1xuICAgICAgICAgICAgaWYgKG1bMV0uaW5kZXhPZihcIi9cIikgPT0gMClcbiAgICAgICAgICAgICAgcmV0dXJuIG1bMV07XG4gICAgICAgICAgICBiID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2Jhc2UnKTtcbiAgICAgICAgICAgIGlmIChiWzBdICYmIGJbMF0uaHJlZilcbiAgICAgICAgICAgICAgcmV0dXJuIGJbMF0uaHJlZiArIG1bMV07XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvKC4qW1xcL1xcXFxdKS8pWzBdICsgbVsxXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBmID0gcGF0aCgnc2hhcmU0Mi5qcycpO1xuICAgIH1cbiAgICBpZiAoIXUpXG4gICAgICB1ID0gbG9jYXRpb24uaHJlZjtcbiAgICBpZiAoIXQpXG4gICAgICB0ID0gZG9jdW1lbnQudGl0bGU7XG4gICAgaWYgKCFmbilcbiAgICAgIGZuID0gJ2ljb25zLnBuZyc7XG4gICAgZnVuY3Rpb24gZGVzYygpIHtcbiAgICAgIHZhciBtZXRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ldGEnKTtcbiAgICAgIGZvciAodmFyIG0gPSAwOyBtIDwgbWV0YS5sZW5ndGg7IG0rKykge1xuICAgICAgICBpZiAobWV0YVttXS5uYW1lLnRvTG93ZXJDYXNlKCkgPT0gJ2Rlc2NyaXB0aW9uJykge1xuICAgICAgICAgIHJldHVybiBtZXRhW21dLmNvbnRlbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgaWYgKCFkKVxuICAgICAgZCA9IGRlc2MoKTtcbiAgICB1ID0gZW5jb2RlVVJJQ29tcG9uZW50KHUpO1xuICAgIHQgPSBlbmNvZGVVUklDb21wb25lbnQodCk7XG4gICAgdCA9IHQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcbiAgICBpID0gZW5jb2RlVVJJQ29tcG9uZW50KGkpO1xuICAgIHZhciBkX29yaWc9ZC5yZXBsYWNlKC9cXCcvZywgJyUyNycpO1xuICAgIGQgPSBlbmNvZGVVUklDb21wb25lbnQoZCk7XG4gICAgZCA9IGQucmVwbGFjZSgvXFwnL2csICclMjcnKTtcbiAgICB2YXIgZmJRdWVyeSA9ICd1PScgKyB1O1xuICAgIGlmIChpICE9ICdudWxsJyAmJiBpICE9ICcnKVxuICAgICAgZmJRdWVyeSA9ICdzPTEwMCZwW3VybF09JyArIHUgKyAnJnBbdGl0bGVdPScgKyB0ICsgJyZwW3N1bW1hcnldPScgKyBkICsgJyZwW2ltYWdlc11bMF09JyArIGk7XG4gICAgdmFyIHZrSW1hZ2UgPSAnJztcbiAgICBpZiAoaSAhPSAnbnVsbCcgJiYgaSAhPSAnJylcbiAgICAgIHZrSW1hZ2UgPSAnJmltYWdlPScgKyBpO1xuICAgIHZhciBzID0gbmV3IEFycmF5KFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJmYlwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PScgKyB1ICsnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBGYWNlYm9va1wiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidmtcIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3ZrLmNvbS9zaGFyZS5waHA/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArIHZrSW1hZ2UgKyAnJmRlc2NyaXB0aW9uPScgKyBkICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0JIg0JrQvtC90YLQsNC60YLQtVwiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwib2RrbFwiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vY29ubmVjdC5vay5ydS9vZmZlcj91cmw9JyArIHUgKyAnJnRpdGxlPScgKyB0ICsgJyZkZXNjcmlwdGlvbj0nKyBkICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiDQntC00L3QvtC60LvQsNGB0YHQvdC40LrQuFwiJyxcbiAgICAgICdcIiNcIiBkYXRhLWNvdW50PVwidHdpXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD0nICsgdCArICcmdXJsPScgKyB1ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiBUd2l0dGVyXCInLFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJncGx1c1wiIG9uY2xpY2s9XCInK3NlbGZfcHJvbW8rJ3dpbmRvdy5vcGVuKFxcJy8vcGx1cy5nb29nbGUuY29tL3NoYXJlP3VybD0nICsgdSArICcmdGl0bGU9JyArIHQgKyAnXFwnLCBcXCdfYmxhbmtcXCcsIFxcJ3Njcm9sbGJhcnM9MCwgcmVzaXphYmxlPTEsIG1lbnViYXI9MCwgbGVmdD0xMDAsIHRvcD0xMDAsIHdpZHRoPTU1MCwgaGVpZ2h0PTQ0MCwgdG9vbGJhcj0wLCBzdGF0dXM9MFxcJyk7cmV0dXJuIGZhbHNlXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBHb29nbGUrXCInLFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJtYWlsXCIgb25jbGljaz1cIicrc2VsZl9wcm9tbysnd2luZG93Lm9wZW4oXFwnLy9jb25uZWN0Lm1haWwucnUvc2hhcmU/dXJsPScgKyB1ICsgJyZ0aXRsZT0nICsgdCArICcmZGVzY3JpcHRpb249JyArIGQgKyAnJmltYWdldXJsPScgKyBpICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD01NTAsIGhlaWdodD00NDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIg0JzQvtC10Lwg0JzQuNGA0LVATWFpbC5SdVwiJyxcbiAgICAgICdcIi8vd3d3LmxpdmVqb3VybmFsLmNvbS91cGRhdGUuYm1sP2V2ZW50PScgKyB1ICsgJyZzdWJqZWN0PScgKyB0ICsgJ1wiIHRpdGxlPVwi0J7Qv9GD0LHQu9C40LrQvtCy0LDRgtGMINCyIExpdmVKb3VybmFsXCInLFxuICAgICAgJ1wiI1wiIGRhdGEtY291bnQ9XCJwaW5cIiBvbmNsaWNrPVwiJytzZWxmX3Byb21vKyd3aW5kb3cub3BlbihcXCcvL3BpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD0nICsgdSArICcmbWVkaWE9JyArIGkgKyAnJmRlc2NyaXB0aW9uPScgKyB0ICsgJ1xcJywgXFwnX2JsYW5rXFwnLCBcXCdzY3JvbGxiYXJzPTAsIHJlc2l6YWJsZT0xLCBtZW51YmFyPTAsIGxlZnQ9MTAwLCB0b3A9MTAwLCB3aWR0aD02MDAsIGhlaWdodD0zMDAsIHRvb2xiYXI9MCwgc3RhdHVzPTBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0JTQvtCx0LDQstC40YLRjCDQsiBQaW50ZXJlc3RcIicsXG4gICAgICAnXCJcIiBvbmNsaWNrPVwicmV0dXJuIGZhdih0aGlzKTtcIiB0aXRsZT1cItCh0L7RhdGA0LDQvdC40YLRjCDQsiDQuNC30LHRgNCw0L3QvdC+0LUg0LHRgNCw0YPQt9C10YDQsFwiJyxcbiAgICAgICdcIiNcIiBvbmNsaWNrPVwicHJpbnQoKTtyZXR1cm4gZmFsc2VcIiB0aXRsZT1cItCg0LDRgdC/0LXRh9Cw0YLQsNGC0YxcIicsXG4gICAgICAnXCIjXCIgZGF0YS1jb3VudD1cInRlbGVncmFtXCIgb25jbGljaz1cIndpbmRvdy5vcGVuKFxcJy8vdGVsZWdyYW0ubWUvc2hhcmUvdXJsP3VybD0nICsgdSArJyZ0ZXh0PScgKyB0ICsgJ1xcJywgXFwndGVsZWdyYW1cXCcsIFxcJ3dpZHRoPTU1MCxoZWlnaHQ9NDQwLGxlZnQ9MTAwLHRvcD0xMDBcXCcpO3JldHVybiBmYWxzZVwiIHRpdGxlPVwi0J/QvtC00LXQu9C40YLRjNGB0Y8g0LIgVGVsZWdyYW1cIicsXG4gICAgICAnXCJ2aWJlcjovL2ZvcndhcmQ/dGV4dD0nKyB1ICsnIC0gJyArIHQgKyAnXCIgZGF0YS1jb3VudD1cInZpYmVyXCIgcmVsPVwibm9mb2xsb3cgbm9vcGVuZXJcIiB0aXRsZT1cItCf0L7QtNC10LvQuNGC0YzRgdGPINCyIFZpYmVyXCInLFxuICAgICAgJ1wid2hhdHNhcHA6Ly9zZW5kP3RleHQ9JysgdSArJyAtICcgKyB0ICsgJ1wiIGRhdGEtY291bnQ9XCJ3aGF0c2FwcFwiIHJlbD1cIm5vZm9sbG93IG5vb3BlbmVyXCIgdGl0bGU9XCLQn9C+0LTQtdC70LjRgtGM0YHRjyDQsiBXaGF0c0FwcFwiJ1xuXG4gICAgKTtcblxuICAgIHZhciBsID0gJyc7XG5cbiAgICBpZihzb2NpYWxzLmxlbmd0aD4xKXtcbiAgICAgIGZvciAocSA9IDA7IHEgPCBzb2NpYWxzLmxlbmd0aDsgcSsrKXtcbiAgICAgICAgaj1zb2NpYWxzW3FdO1xuICAgICAgICBsICs9ICc8YSByZWw9XCJub2ZvbGxvd1wiIGhyZWY9JyArIHNbal0gKyAnIHRhcmdldD1cIl9ibGFua1wiICcrZ2V0SWNvbihzW2pdLGosaWNvbl90eXBlLGYsZm4saWNvbl9zaXplKSsnPjwvYT4nO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgZm9yIChqID0gMDsgaiA8IHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgbCArPSAnPGEgcmVsPVwibm9mb2xsb3dcIiBocmVmPScgKyBzW2pdICsgJyB0YXJnZXQ9XCJfYmxhbmtcIiAnK2dldEljb24oc1tqXSxqLGljb25fdHlwZSxmLGZuLGljb25fc2l6ZSkrJz48L2E+JztcbiAgICAgIH1cbiAgICB9XG4gICAgZVtrXS5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJzaGFyZTQyX3dyYXBcIj4nICsgbCArICc8L3NwYW4+JztcbiAgfVxuICBcbi8vfSwgZmFsc2UpO1xufSgpO1xuXG5mdW5jdGlvbiBnZXRJY29uKHMsaix0LGYsZm4sc2l6ZSkge1xuICBpZighc2l6ZSl7XG4gICAgc2l6ZT0zMjtcbiAgfVxuICBpZih0PT0nY3NzJyl7XG4gICAgaj1zLmluZGV4T2YoJ2RhdGEtY291bnQ9XCInKSsxMjtcbiAgICB2YXIgbD1zLmluZGV4T2YoJ1wiJyxqKS1qO1xuICAgIHZhciBsMj1zLmluZGV4T2YoJy4nLGopLWo7XG4gICAgbD1sPmwyICYmIGwyPjAgP2wyOmw7XG4gICAgLy92YXIgaWNvbj0nY2xhc3M9XCJzb2MtaWNvbiBpY29uLScrcy5zdWJzdHIoaixsKSsnXCInO1xuICAgIHZhciBpY29uPSdjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2QtJytzLnN1YnN0cihqLGwpKydcIic7XG4gIH1lbHNlIGlmKHQ9PSdzdmcnKXtcbiAgICB2YXIgc3ZnPVtcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDExMS45NCwxNzcuMDgpXCIgZD1cIk0wIDAgMCA3MC4zIDIzLjYgNzAuMyAyNy4xIDk3LjcgMCA5Ny43IDAgMTE1LjJDMCAxMjMuMiAyLjIgMTI4LjYgMTMuNiAxMjguNkwyOC4xIDEyOC42IDI4LjEgMTUzLjFDMjUuNiAxNTMuNCAxNyAxNTQuMiA2LjkgMTU0LjItMTQgMTU0LjItMjguMyAxNDEuNC0yOC4zIDExNy45TC0yOC4zIDk3LjctNTIgOTcuNy01MiA3MC4zLTI4LjMgNzAuMy0yOC4zIDAgMCAwWlwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsOTguMjc0LDE0NS41MilcIiBkPVwiTTAgMCA5LjYgMEM5LjYgMCAxMi41IDAuMyAxNCAxLjkgMTUuNCAzLjQgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMyA2LjEgMTUuMSAxOSAyMS4xIDIxIDI3IDIyLjggMzQuNiA4LjUgNDIuNyAzIDQ4LjctMS4yIDUzLjMtMC4zIDUzLjMtMC4zTDc0LjggMEM3NC44IDAgODYuMSAwLjcgODAuNyA5LjUgODAuMyAxMC4zIDc3LjYgMTYuMSA2NC44IDI4IDUxLjMgNDAuNSA1My4xIDM4LjUgNjkuMyA2MC4xIDc5LjIgNzMuMyA4My4yIDgxLjQgODEuOSA4NC44IDgwLjggODguMSA3My41IDg3LjIgNzMuNSA4Ny4yTDQ5LjMgODcuMUM0OS4zIDg3LjEgNDcuNSA4Ny4zIDQ2LjIgODYuNSA0NC45IDg1LjcgNDQgODMuOSA0NCA4My45IDQ0IDgzLjkgNDAuMiA3My43IDM1LjEgNjUuMSAyNC4zIDQ2LjggMjAgNDUuOCAxOC4zIDQ2LjkgMTQuMiA0OS42IDE1LjIgNTcuNiAxNS4yIDYzLjIgMTUuMiA4MSAxNy45IDg4LjQgOS45IDkwLjMgNy4zIDkwLjkgNS40IDkxLjMtMS40IDkxLjQtMTAgOTEuNS0xNy4zIDkxLjQtMjEuNCA4OS4zLTI0LjIgODgtMjYuMyA4NS0yNSA4NC44LTIzLjQgODQuNi0xOS44IDgzLjgtMTcuOSA4MS4yLTE1LjQgNzcuOS0xNS41IDcwLjMtMTUuNSA3MC4zLTE1LjUgNzAuMy0xNC4xIDQ5LjQtMTguOCA0Ni44LTIyLjEgNDUtMjYuNSA0OC43LTM2LjEgNjUuMy00MS4xIDczLjgtNDQuOCA4My4yLTQ0LjggODMuMi00NC44IDgzLjItNDUuNSA4NC45LTQ2LjggODUuOS00OC4zIDg3LTUwLjUgODcuNC01MC41IDg3LjRMLTczLjUgODcuMkMtNzMuNSA4Ny4yLTc2LjkgODcuMS03OC4yIDg1LjYtNzkuMyA4NC4zLTc4LjMgODEuNS03OC4zIDgxLjUtNzguMyA4MS41LTYwLjMgMzkuNC0zOS45IDE4LjItMjEuMi0xLjMgMCAwIDAgMFwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDEwNi44OCwxODMuNjEpXCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKC02Ljg4MDUsLTEwMClcIiBzdHlsZT1cInN0cm9rZTpub25lO3N0cm9rZS1vcGFjaXR5OjFcIj48cGF0aCBkPVwiTSAwLDAgQyA4LjE0NiwwIDE0Ljc2OSwtNi42MjUgMTQuNzY5LC0xNC43NyAxNC43NjksLTIyLjkwNyA4LjE0NiwtMjkuNTMzIDAsLTI5LjUzMyAtOC4xMzYsLTI5LjUzMyAtMTQuNzY5LC0yMi45MDcgLTE0Ljc2OSwtMTQuNzcgLTE0Ljc2OSwtNi42MjUgLTguMTM2LDAgMCwwIE0gMCwtNTAuNDI5IEMgMTkuNjc2LC01MC40MjkgMzUuNjcsLTM0LjQzNSAzNS42NywtMTQuNzcgMzUuNjcsNC45MDMgMTkuNjc2LDIwLjkwMyAwLDIwLjkwMyAtMTkuNjcxLDIwLjkwMyAtMzUuNjY5LDQuOTAzIC0zNS42NjksLTE0Ljc3IC0zNS42NjksLTM0LjQzNSAtMTkuNjcxLC01MC40MjkgMCwtNTAuNDI5XCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsNy41NTE2LC01NC41NzcpXCIgc3R5bGU9XCJzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCI+PHBhdGggZD1cIk0gMCwwIEMgNy4yNjIsMS42NTUgMTQuMjY0LDQuNTI2IDIwLjcxNCw4LjU3OCAyNS41OTUsMTEuNjU0IDI3LjA2NiwxOC4xMDggMjMuOTksMjIuOTg5IDIwLjkxNywyNy44ODEgMTQuNDY5LDI5LjM1MiA5LjU3OSwyNi4yNzUgLTUuMDMyLDE3LjA4NiAtMjMuODQzLDE3LjA5MiAtMzguNDQ2LDI2LjI3NSAtNDMuMzM2LDI5LjM1MiAtNDkuNzg0LDI3Ljg4MSAtNTIuODUyLDIyLjk4OSAtNTUuOTI4LDE4LjEwNCAtNTQuNDYxLDExLjY1NCAtNDkuNTgsOC41NzggLTQzLjEzMiw0LjUzMSAtMzYuMTI4LDEuNjU1IC0yOC44NjcsMCBMIC00OC44MDksLTE5Ljk0MSBDIC01Mi44ODYsLTI0LjAyMiAtNTIuODg2LC0zMC42MzkgLTQ4LjgwNSwtMzQuNzIgLTQ2Ljc2MiwtMzYuNzU4IC00NC4wOSwtMzcuNzc5IC00MS40MTgsLTM3Ljc3OSAtMzguNzQyLC0zNy43NzkgLTM2LjA2NSwtMzYuNzU4IC0zNC4wMjMsLTM0LjcyIEwgLTE0LjQzNiwtMTUuMTIzIDUuMTY5LC0zNC43MiBDIDkuMjQ2LC0zOC44MDEgMTUuODYyLC0zOC44MDEgMTkuOTQzLC0zNC43MiAyNC4wMjgsLTMwLjYzOSAyNC4wMjgsLTI0LjAxOSAxOS45NDMsLTE5Ljk0MSBMIDAsMCBaXCIgc3R5bGU9XCJmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxXCIvPjwvZz48L2c+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDE2OS43Niw1Ni43MjcpXCIgZD1cIk0wIDBDLTUuMS0yLjMtMTAuNi0zLjgtMTYuNC00LjUtMTAuNS0xLTYgNC42LTMuOSAxMS4zLTkuNCA4LTE1LjUgNS43LTIyIDQuNC0yNy4zIDkuOS0zNC43IDEzLjQtNDIuOSAxMy40LTU4LjcgMTMuNC03MS42IDAuNi03MS42LTE1LjItNzEuNi0xNy40LTcxLjMtMTkuNi03MC44LTIxLjctOTQuNi0yMC41LTExNS43LTkuMS0xMjkuOCA4LjItMTMyLjMgNC0xMzMuNy0xLTEzMy43LTYuMi0xMzMuNy0xNi4xLTEyOC42LTI0LjktMTIwLjktMzAtMTI1LjYtMjkuOS0xMzAuMS0yOC42LTEzMy45LTI2LjUtMTMzLjktMjYuNi0xMzMuOS0yNi43LTEzMy45LTI2LjgtMTMzLjktNDAuNy0xMjQtNTIuMy0xMTEtNTQuOS0xMTMuNC01NS41LTExNS45LTU1LjktMTE4LjUtNTUuOS0xMjAuMy01NS45LTEyMi4xLTU1LjctMTIzLjktNTUuNC0xMjAuMi02Ni43LTEwOS43LTc1LTk3LjEtNzUuMy0xMDYuOS04Mi45LTExOS4zLTg3LjUtMTMyLjctODcuNS0xMzUtODcuNS0xMzcuMy04Ny40LTEzOS41LTg3LjEtMTI2LjgtOTUuMi0xMTEuOC0xMDAtOTUuNi0xMDAtNDMtMTAwLTE0LjItNTYuMy0xNC4yLTE4LjUtMTQuMi0xNy4zLTE0LjItMTYtMTQuMy0xNC44LTguNy0xMC44LTMuOC01LjcgMCAwXCIvPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCgxIDAgMCAtMSA3Mi4zODEgOTAuMTcyKVwiPjxwYXRoIGQ9XCJNODcuMiAwIDg3LjIgMTcuMSA3NSAxNy4xIDc1IDAgNTcuOSAwIDU3LjktMTIuMiA3NS0xMi4yIDc1LTI5LjMgODcuMi0yOS4zIDg3LjItMTIuMiAxMDQuMy0xMi4yIDEwNC4zIDAgODcuMiAwWlwiLz48cGF0aCBkPVwiTTAgMCAwLTE5LjYgMjYuMi0xOS42QzI1LjQtMjMuNyAyMy44LTI3LjUgMjAuOC0zMC42IDEwLjMtNDIuMS05LjMtNDItMjAuNS0zMC40LTMxLjctMTguOS0zMS42LTAuMy0yMC4yIDExLjEtOS40IDIxLjkgOCAyMi40IDE4LjYgMTIuMUwxOC41IDEyLjEgMzIuOCAyNi40QzEzLjcgNDMuOC0xNS44IDQzLjUtMzQuNSAyNS4xLTUzLjggNi4xLTU0LTI1LTM0LjktNDQuMy0xNS45LTYzLjUgMTcuMS02My43IDM0LjktNDQuNiA0NS42LTMzIDQ4LjctMTYuNCA0Ni4yIDBMMCAwWlwiLz48L2c+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PHBhdGggdHJhbnNmb3JtPVwibWF0cml4KDEsMCwwLC0xLDk3LjY3Niw2Mi40MTEpXCIgZD1cIk0wIDBDMTAuMiAwIDE5LjktNC41IDI2LjktMTEuNkwyNi45LTExLjZDMjYuOS04LjIgMjkuMi01LjcgMzIuNC01LjdMMzMuMi01LjdDMzguMi01LjcgMzkuMi0xMC40IDM5LjItMTEuOUwzOS4yLTY0LjhDMzguOS02OC4yIDQyLjgtNzAgNDUtNjcuOCA1My41LTU5LjEgNjMuNi0yMi45IDM5LjctMiAxNy40IDE3LjYtMTIuNSAxNC4zLTI4LjUgMy40LTQ1LjQtOC4zLTU2LjItMzQuMS00NS43LTU4LjQtMzQuMi04NC45LTEuNC05Mi44IDE4LjEtODQuOSAyOC04MC45IDMyLjUtOTQuMyAyMi4zLTk4LjYgNi44LTEwNS4yLTM2LjQtMTA0LjUtNTYuNS02OS42LTcwLjEtNDYuMS02OS40LTQuNi0zMy4zIDE2LjktNS43IDMzLjMgMzAuNyAyOC44IDUyLjcgNS44IDc1LjYtMTguMiA3NC4zLTYzIDUxLjktODAuNSA0MS44LTg4LjQgMjYuNy04MC43IDI2LjgtNjkuMkwyNi43LTY1LjRDMTkuNi03Mi40IDEwLjItNzYuNSAwLTc2LjUtMjAuMi03Ni41LTM4LTU4LjctMzgtMzguNC0zOC0xOC0yMC4yIDAgMCAwTTI1LjUtMzdDMjQuNy0yMi4yIDEzLjctMTMuMyAwLjQtMTMuM0wtMC4xLTEzLjNDLTE1LjQtMTMuMy0yMy45LTI1LjMtMjMuOS0zOS0yMy45LTU0LjMtMTMuNi02NC0wLjEtNjQgMTQuOS02NCAyNC44LTUzIDI1LjUtNDBMMjUuNS0zN1pcIi8+PC9zdmc+JyxcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCIgdmlld0JveD1cIjAgMCAyMDAgMjAwXCI+PGcgdHJhbnNmb3JtPVwibWF0cml4KDAuNDI2MjMgMCAwIDAuNDI2MjMgMzQuOTk5IDM1KVwiPjxwYXRoIGQ9XCJNMTYwLjcgMTkuNWMtMTguOSAwLTM3LjMgMy43LTU0LjcgMTAuOUw3Ni40IDAuN2MtMC44LTAuOC0yLjEtMS0zLjEtMC40QzQ0LjQgMTguMiAxOS44IDQyLjkgMS45IDcxLjdjLTAuNiAxLTAuNSAyLjMgMC40IDMuMWwyOC40IDI4LjRjLTguNSAxOC42LTEyLjggMzguNS0xMi44IDU5LjEgMCA3OC43IDY0IDE0Mi44IDE0Mi44IDE0Mi44IDc4LjcgMCAxNDIuOC02NCAxNDIuOC0xNDIuOEMzMDMuNCA4My41IDIzOS40IDE5LjUgMTYwLjcgMTkuNXpNMjE3LjIgMTQ4LjdsOS45IDQyLjEgOS41IDQ0LjQgLTQ0LjMtOS41IC00Mi4xLTkuOUwzNi43IDEwMi4xYzE0LjMtMjkuMyAzOC4zLTUyLjYgNjguMS02NS44TDIxNy4yIDE0OC43elwiLz48cGF0aCBkPVwiTTIyMS44IDE4Ny40bC03LjUtMzNjLTI1LjkgMTEuOS00Ni40IDMyLjQtNTguMyA1OC4zbDMzIDcuNUMxOTYgMjA2LjIgMjA3LjcgMTk0LjQgMjIxLjggMTg3LjR6XCIvPjwvZz48L3N2Zz4nLFxuICAgICAgJycsLy9waW5cbiAgICAgICcnLC8vZmF2XG4gICAgICAnJywvL3ByaW50XG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSw3MS4yNjQsMTA2LjkzKVwiIGQ9XCJNMCAwIDY4LjYgNDMuMUM3MiA0NS4zIDczLjEgNDIuOCA3MS42IDQxLjFMMTQuNi0xMC4yIDExLjctMzUuOCAwIDBaTTg3LjEgNjIuOS0zMy40IDE3LjJDLTQwIDE1LjMtMzkuOCA4LjgtMzQuOSA3LjNMLTQuNy0yLjIgNi44LTM3LjZDOC4yLTQxLjUgOS40LTQyLjkgMTEuOC00MyAxNC4zLTQzIDE1LjMtNDIuMSAxNy45LTM5LjggMjAuOS0zNi45IDI1LjYtMzIuMyAzMy0yNS4yTDY0LjQtNDguNEM3MC4yLTUxLjYgNzQuMy00OS45IDc1LjgtNDNMOTUuNSA1NC40Qzk3LjYgNjIuOSA5Mi42IDY1LjQgODcuMSA2Mi45XCIvPjwvc3ZnPicsXG4gICAgICAnPHN2ZyB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPjxwYXRoIHRyYW5zZm9ybT1cIm1hdHJpeCgxLDAsMCwtMSwxMzAuODQsMTEyLjcpXCIgZD1cIk0wIDBDLTEuNiAwLjktOS40IDUuMS0xMC44IDUuNy0xMi4zIDYuMy0xMy40IDYuNi0xNC41IDUtMTUuNiAzLjQtMTguOS0wLjEtMTkuOS0xLjEtMjAuOC0yLjItMjEuOC0yLjMtMjMuNC0xLjQtMjUtMC41LTMwLjEgMS40LTM2LjEgNy4xLTQwLjcgMTEuNS00My43IDE3LTQ0LjYgMTguNi00NS41IDIwLjMtNDQuNiAyMS4xLTQzLjggMjEuOS00MyAyMi42LTQyLjEgMjMuNy00MS4zIDI0LjYtNDAuNCAyNS41LTQwLjEgMjYuMi0zOS41IDI3LjItMzkgMjguMy0zOS4yIDI5LjMtMzkuNiAzMC4xLTM5LjkgMzAuOS00Mi45IDM5LTQ0LjEgNDIuMy00NS4zIDQ1LjUtNDYuNyA0NS00Ny42IDQ1LjEtNDguNiA0NS4xLTQ5LjYgNDUuMy01MC43IDQ1LjMtNTEuOCA0NS40LTUzLjYgNDUtNTUuMSA0My41LTU2LjYgNDEuOS02MSAzOC4yLTYxLjMgMzAuMi02MS42IDIyLjMtNTYuMSAxNC40LTU1LjMgMTMuMy01NC41IDEyLjItNDQuOC01LjEtMjguNi0xMi4xLTEyLjQtMTkuMi0xMi40LTE3LjEtOS40LTE2LjktNi40LTE2LjggMC4zLTEzLjQgMS44LTkuNiAzLjMtNS45IDMuNC0yLjcgMy0yIDIuNi0xLjMgMS42LTAuOSAwIDBNLTI5LjctMzguM0MtNDAuNC0zOC4zLTUwLjMtMzUuMS01OC42LTI5LjZMLTc4LjktMzYuMS03Mi4zLTE2LjVDLTc4LjYtNy44LTgyLjMgMi44LTgyLjMgMTQuNC04Mi4zIDQzLjQtNTguNyA2Ny4xLTI5LjcgNjcuMS0wLjYgNjcuMSAyMyA0My40IDIzIDE0LjQgMjMtMTQuNy0wLjYtMzguMy0yOS43LTM4LjNNLTI5LjcgNzcuNkMtNjQuNiA3Ny42LTkyLjkgNDkuMy05Mi45IDE0LjQtOTIuOSAyLjQtODkuNi04LjgtODMuOS0xOC4zTC05NS4zLTUyLjItNjAuMi00MUMtNTEuMi00Ni00MC44LTQ4LjktMjkuNy00OC45IDUuMy00OC45IDMzLjYtMjAuNiAzMy42IDE0LjQgMzMuNiA0OS4zIDUuMyA3Ny42LTI5LjcgNzcuNlwiLz48L3N2Zz4nLFxuICAgICAgJzxzdmcgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIj48cGF0aCB0cmFuc2Zvcm09XCJtYXRyaXgoMSwwLDAsLTEsMTM1LjMzLDExOS44NSlcIiBkPVwiTTAgMEMtMi40LTUuNC02LjUtOS0xMi4yLTEwLjYtMTQuMy0xMS4yLTE2LjMtMTAuNy0xOC4yLTkuOS00NC40IDEuMi02My4zIDE5LjYtNzQgNDYuMi03NC44IDQ4LjEtNzUuMyA1MC4xLTc1LjIgNTEuOS03NS4yIDU4LjctNjkuMiA2NS02Mi42IDY1LjQtNjAuOCA2NS41LTU5LjIgNjQuOS01Ny45IDYzLjctNTMuMyA1OS4zLTQ5LjYgNTQuMy00Ni45IDQ4LjYtNDUuNCA0NS41LTQ2IDQzLjMtNDguNyA0MS4xLTQ5LjEgNDAuNy00OS41IDQwLjQtNTAgNDAuMS01My41IDM3LjUtNTQuMyAzNC45LTUyLjYgMzAuOC00OS44IDI0LjItNDUuNCAxOS0zOS4zIDE1LjEtMzcgMTMuNi0zNC43IDEyLjItMzIgMTEuNS0yOS42IDEwLjgtMjcuNyAxMS41LTI2LjEgMTMuNC0yNS45IDEzLjYtMjUuOCAxMy45LTI1LjYgMTQuMS0yMi4zIDE4LjgtMTguNiAxOS42LTEzLjcgMTYuNS05LjYgMTMuOS01LjYgMTEtMS44IDcuOCAwLjcgNS42IDEuMyAzIDAgME0tMTguMiAzNi43Qy0xOC4zIDM1LjktMTguMyAzNS40LTE4LjQgMzQuOS0xOC42IDM0LTE5LjIgMzMuNC0yMC4yIDMzLjQtMjEuMyAzMy40LTIxLjkgMzQtMjIuMiAzNC45LTIyLjMgMzUuNS0yMi40IDM2LjItMjIuNSAzNi45LTIzLjIgNDAuMy0yNS4yIDQyLjYtMjguNiA0My42LTI5LjEgNDMuNy0yOS41IDQzLjctMjkuOSA0My44LTMxIDQ0LjEtMzIuNCA0NC4yLTMyLjQgNDUuOC0zMi41IDQ3LjEtMzEuNSA0Ny45LTI5LjYgNDgtMjguNCA0OC4xLTI2LjUgNDcuNS0yNS40IDQ2LjktMjAuOSA0NC43LTE4LjcgNDEuNi0xOC4yIDM2LjdNLTI1LjUgNTEuMkMtMjggNTIuMS0zMC41IDUyLjgtMzMuMiA1My4yLTM0LjUgNTMuNC0zNS40IDU0LjEtMzUuMSA1NS42LTM0LjkgNTctMzQgNTcuNS0zMi42IDU3LjQtMjQgNTYuNi0xNy4zIDUzLjQtMTIuNiA0Ni0xMC41IDQyLjUtOS4yIDM3LjUtOS40IDMzLjgtOS41IDMxLjItOS45IDMwLjUtMTEuNCAzMC41LTEzLjYgMzAuNi0xMy4zIDMyLjQtMTMuNSAzMy43LTEzLjcgMzUuNy0xNC4yIDM3LjctMTQuNyAzOS43LTE2LjMgNDUuNC0xOS45IDQ5LjMtMjUuNSA1MS4yTS0zOCA2NC40Qy0zNy45IDY1LjktMzcgNjYuNS0zNS41IDY2LjQtMjMuMiA2NS44LTEzLjkgNjIuMi02LjcgNTIuNS0yLjUgNDYuOS0wLjIgMzkuMiAwIDMyLjIgMCAzMS4xIDAgMzAgMCAyOS0wLjEgMjcuOC0wLjYgMjYuOS0xLjkgMjYuOS0zLjIgMjYuOS0zLjkgMjcuNi00IDI5LTQuMyAzNC4yLTUuMyAzOS4zLTcuMyA0NC4xLTExLjIgNTMuNS0xOC42IDU4LjYtMjguMSA2MS4xLTMwLjcgNjEuNy0zMy4yIDYyLjItMzUuOCA2Mi41LTM3IDYyLjUtMzggNjIuOC0zOCA2NC40TTExLjUgNzQuMUM2LjYgNzguMyAwLjkgODAuOC01LjMgODIuNC0yMC44IDg2LjUtMzYuNSA4Ny41LTUyLjQgODUuMy02MC41IDg0LjItNjguMyA4Mi4xLTc1LjQgNzguMS04My44IDczLjQtODkuNiA2Ni42LTkyLjIgNTcuMS05NCA1MC40LTk0LjkgNDMuNi05NS4yIDM2LjYtOTUuNyAyNi40LTk1LjQgMTYuMy05Mi44IDYuMy04OS44LTUuMy04My4yLTEzLjgtNzEuOS0xOC4zLTcwLjctMTguOC02OS41LTE5LjUtNjguMy0yMC02Ny4yLTIwLjQtNjYuOC0yMS4yLTY2LjgtMjIuNC02Ni45LTMwLjQtNjYuOC0zOC40LTY2LjgtNDYuNy02My45LTQzLjktNjEuOC00MS44LTYwLjMtNDAuMS01NS45LTM1LjEtNTEuNy0zMC45LTQ3LjEtMjYuMS00NC43LTIzLjctNDUuNy0yMy44LTQyLjEtMjMuOC0zNy44LTIzLjktMzEtMjQuMS0yNi44LTIzLjgtMTguNi0yMy4xLTEwLjYtMjIuMS0yLjctMTkuNyA3LjItMTYuNyAxNS4yLTExLjQgMTkuMi0xLjMgMjAuMyAxLjMgMjEuNCA0IDIyIDYuOCAyNS45IDIyLjkgMjUuNCAzOC45IDIyLjIgNTUgMjAuNiA2Mi40IDE3LjUgNjkgMTEuNSA3NC4xXCIvPjwvc3ZnPicsXG4gICAgXTtcbiAgICB2YXIgaWNvbj1zdmdbal07XG4gICAgdmFyIGNzcz0nIHN0eWxlPVwid2lkdGg6JytzaXplKydweDtoZWlnaHQ6JytzaXplKydweFwiICc7XG4gICAgaWNvbj0nPHN2ZyBjbGFzcz1cInNvYy1pY29uLXNkIGljb24tc2Qtc3ZnXCInK2NzcytpY29uLnN1YnN0cmluZyg0KTtcbiAgICBpY29uPSc+JytpY29uLnN1YnN0cmluZygwLCBpY29uLmxlbmd0aCAtIDEpO1xuICB9ZWxzZXtcbiAgICBpY29uPSdzdHlsZT1cImRpc3BsYXk6aW5saW5lLWJsb2NrO3ZlcnRpY2FsLWFsaWduOmJvdHRvbTt3aWR0aDonK3NpemUrJ3B4O2hlaWdodDonK3NpemUrJ3B4O21hcmdpbjowIDZweCA2cHggMDtwYWRkaW5nOjA7b3V0bGluZTpub25lO2JhY2tncm91bmQ6dXJsKCcgKyBmICsgZm4gKyAnKSAtJyArIHNpemUgKiBqICsgJ3B4IDAgbm8tcmVwZWF0OyBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1wiJ1xuICB9XG4gIHJldHVybiBpY29uO1xufVxuXG5mdW5jdGlvbiBmYXYoYSkge1xuICB2YXIgdGl0bGUgPSBkb2N1bWVudC50aXRsZTtcbiAgdmFyIHVybCA9IGRvY3VtZW50LmxvY2F0aW9uO1xuICB0cnkge1xuICAgIHdpbmRvdy5leHRlcm5hbC5BZGRGYXZvcml0ZSh1cmwsIHRpdGxlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRyeSB7XG4gICAgICB3aW5kb3cuc2lkZWJhci5hZGRQYW5lbCh0aXRsZSwgdXJsLCAnJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKHR5cGVvZiAob3BlcmEpID09ICdvYmplY3QnIHx8IHdpbmRvdy5zaWRlYmFyKSB7XG4gICAgICAgIGEucmVsID0gJ3NpZGViYXInO1xuICAgICAgICBhLnRpdGxlID0gdGl0bGU7XG4gICAgICAgIGEudXJsID0gdXJsO1xuICAgICAgICBhLmhyZWYgPSB1cmw7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoJ9Cd0LDQttC80LjRgtC1IEN0cmwtRCwg0YfRgtC+0LHRiyDQtNC+0LHQsNCy0LjRgtGMINGB0YLRgNCw0L3QuNGG0YMg0LIg0LfQsNC60LvQsNC00LrQuCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHNlbmRfcHJvbW8ocHJvbW8pe1xuICAkLmFqYXgoe1xuICAgIG1ldGhvZDogXCJwb3N0XCIsXG4gICAgdXJsOiBcImFjY291bnQvcHJvbW9cIixcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIGRhdGE6IHtwcm9tbzogcHJvbW99LFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGlmIChkYXRhLnRpdGxlICE9IG51bGwgJiYgZGF0YS5tZXNzYWdlICE9IG51bGwpIHtcbiAgICAgICAgb25fcHJvbW89JCgnLm9uX3Byb21vJyk7XG4gICAgICAgIGlmKG9uX3Byb21vLmxlbmd0aD09MCB8fCAhb25fcHJvbW8uaXMoJzp2aXNpYmxlJykpIHtcbiAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxuICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBvbl9wcm9tby5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuIiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBjb250ZWluZXI7XG4gIHZhciBtb3VzZU92ZXIgPSAwO1xuICB2YXIgdGltZXJDbGVhckFsbCA9IG51bGw7XG4gIHZhciBhbmltYXRpb25FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCc7XG4gIHZhciB0aW1lID0gMTAwMDA7XG5cbiAgdmFyIG5vdGlmaWNhdGlvbl9ib3ggPSBmYWxzZTtcbiAgdmFyIGlzX2luaXQgPSBmYWxzZTtcbiAgdmFyIGNvbmZpcm1fb3B0ID0ge1xuICAgIHRpdGxlOiBcItCj0LTQsNC70LXQvdC40LVcIixcbiAgICBxdWVzdGlvbjogXCLQktGLINC00LXQudGB0YLQstC40YLQtdC70YzQvdC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjD9cIixcbiAgICBidXR0b25ZZXM6IFwi0JTQsFwiLFxuICAgIGJ1dHRvbk5vOiBcItCd0LXRglwiLFxuICAgIGNhbGxiYWNrWWVzOiBmYWxzZSxcbiAgICBjYWxsYmFja05vOiBmYWxzZSxcbiAgICBvYmo6IGZhbHNlLFxuICAgIGJ1dHRvblRhZzogJ2RpdicsXG4gICAgYnV0dG9uWWVzRG9wOiAnJyxcbiAgICBidXR0b25Ob0RvcDogJycsXG4gIH07XG4gIHZhciBhbGVydF9vcHQgPSB7XG4gICAgdGl0bGU6IFwiXCIsXG4gICAgcXVlc3Rpb246IFwi0KHQvtC+0LHRidC10L3QuNC1XCIsXG4gICAgYnV0dG9uWWVzOiBcItCU0LBcIixcbiAgICBjYWxsYmFja1llczogZmFsc2UsXG4gICAgYnV0dG9uVGFnOiAnZGl2JyxcbiAgICBvYmo6IGZhbHNlLFxuICB9O1xuXG4gIGZ1bmN0aW9uIHRlc3RJcGhvbmUoKSB7XG4gICAgaWYgKCEvKGlQaG9uZXxpUGFkfGlQb2QpLiooT1MgMTEpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSByZXR1cm5cbiAgICBub3RpZmljYXRpb25fYm94LmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcbiAgICBub3RpZmljYXRpb25fYm94LmNzcygndG9wJywgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBpc19pbml0ID0gdHJ1ZTtcbiAgICBub3RpZmljYXRpb25fYm94ID0gJCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcbiAgICBpZiAobm90aWZpY2F0aW9uX2JveC5sZW5ndGggPiAwKXJldHVybjtcblxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XG4gICAgbm90aWZpY2F0aW9uX2JveCA9ICQoJy5ub3RpZmljYXRpb25fYm94Jyk7XG5cbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2NvbnRyb2wnLCBjbG9zZU1vZGFsKTtcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2Nsb3NlJywgY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCBjbG9zZU1vZGFsRm9uKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XG4gICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xuICAgICQoJy5ub3RpZmljYXRpb25fYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoJycpXG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgIGlmICh0YXJnZXQuY2xhc3NOYW1lID09IFwibm90aWZpY2F0aW9uX2JveFwiKSB7XG4gICAgICBjbG9zZU1vZGFsKCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5ub3RpZmljYXRpb25fY2xvc2UnLCBfY2xvc2VQb3B1cCk7XG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcbiAgfTtcblxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodGltZXJDbGVhckFsbCAhPSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJDbGVhckFsbCk7XG4gICAgICB0aW1lckNsZWFyQWxsID0gbnVsbDtcbiAgICB9XG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgIHZhciBvcHRpb24gPSAkKHRoaXMpLmRhdGEoJ29wdGlvbicpO1xuICAgICAgaWYgKG9wdGlvbi50aW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAxO1xuICB9O1xuXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgdmFyIG9wdGlvbiA9ICR0aGlzLmRhdGEoJ29wdGlvbicpO1xuICAgICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xuICAgICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQob3B0aW9uLmNsb3NlKSwgb3B0aW9uLnRpbWUgLSAxNTAwICsgMTAwICogaSk7XG4gICAgICAgICR0aGlzLmRhdGEoJ29wdGlvbicsIG9wdGlvbilcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAwO1xuICB9O1xuXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAkdGhpcy5vbihhbmltYXRpb25FbmQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgfSk7XG4gICAgJHRoaXMuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9oaWRlJylcbiAgfTtcblxuICBmdW5jdGlvbiBhbGVydChkYXRhKSB7XG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcbiAgICBkYXRhID0gb2JqZWN0cyhhbGVydF9vcHQsIGRhdGEpO1xuXG4gICAgaWYgKCFpc19pbml0KWluaXQoKTtcbiAgICB0ZXN0SXBob25lKCk7XG5cbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XG5cbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCArPSBkYXRhLnRpdGxlO1xuICAgIGJveF9odG1sICs9ICc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XG4gICAgYm94X2h0bWwgKz0gZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcblxuICAgIGlmIChkYXRhLmJ1dHRvblllcyB8fCBkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiICcgKyBkYXRhLmJ1dHRvblllc0RvcCArICc+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnICsgZGF0YS5idXR0b25UYWcgKyAnIGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiICcgKyBkYXRhLmJ1dHRvbk5vRG9wICsgJz4nICsgZGF0YS5idXR0b25ObyArICc8LycgKyBkYXRhLmJ1dHRvblRhZyArICc+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cbiAgICA7XG5cbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LCAxMDApXG4gIH1cblxuICBmdW5jdGlvbiBjb25maXJtKGRhdGEpIHtcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xuICAgIGRhdGEgPSBvYmplY3RzKGNvbmZpcm1fb3B0LCBkYXRhKTtcblxuICAgIGlmICghaXNfaW5pdClpbml0KCk7XG4gICAgdGVzdElwaG9uZSgpO1xuICAgIC8vYm94X2h0bWw9JzxkaXYgY2xhc3M9XCJub3RpZnlfYm94XCI+JztcblxuICAgIG5vdHlmeV9jbGFzcyA9ICdub3RpZnlfYm94ICc7XG4gICAgaWYgKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcyArPSBkYXRhLm5vdHlmeV9jbGFzcztcblxuICAgIGJveF9odG1sID0gJzxkaXYgY2xhc3M9XCInICsgbm90eWZ5X2NsYXNzICsgJ1wiPic7XG5cbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwgKz0gZGF0YS50aXRsZTtcbiAgICBib3hfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcblxuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xuICAgIGJveF9odG1sICs9IGRhdGEucXVlc3Rpb247XG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBpZiAoZGF0YS5idXR0b25ZZXMgfHwgZGF0YS5idXR0b25Obykge1xuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cblxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XG5cbiAgICBpZiAoZGF0YS5jYWxsYmFja1llcyAhPSBmYWxzZSkge1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrWWVzLmJpbmQoZGF0YS5vYmopKTtcbiAgICB9XG4gICAgaWYgKGRhdGEuY2FsbGJhY2tObyAhPSBmYWxzZSkge1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsIGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgfSwgMTAwKVxuXG4gIH1cblxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xuICAgIGlmICghZGF0YSlkYXRhID0ge307XG4gICAgdmFyIG9wdGlvbiA9IHt0aW1lOiAoZGF0YS50aW1lIHx8IGRhdGEudGltZSA9PT0gMCkgPyBkYXRhLnRpbWUgOiB0aW1lfTtcbiAgICBpZiAoIWNvbnRlaW5lcikge1xuICAgICAgY29udGVpbmVyID0gJCgnPHVsLz4nLCB7XG4gICAgICAgICdjbGFzcyc6ICdub3RpZmljYXRpb25fY29udGFpbmVyJ1xuICAgICAgfSk7XG5cbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoY29udGVpbmVyKTtcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xuICAgIH1cblxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25faXRlbSdcbiAgICB9KTtcblxuICAgIGlmIChkYXRhLnR5cGUpIHtcbiAgICAgIGxpLmFkZENsYXNzKCdub3RpZmljYXRpb25faXRlbS0nICsgZGF0YS50eXBlKTtcbiAgICB9XG5cbiAgICB2YXIgY2xvc2UgPSAkKCc8c3Bhbi8+Jywge1xuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25fY2xvc2UnXG4gICAgfSk7XG4gICAgb3B0aW9uLmNsb3NlID0gY2xvc2U7XG4gICAgbGkuYXBwZW5kKGNsb3NlKTtcblxuICAgIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jywge1xuICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxuICAgIH0pO1xuXG4gICAgaWYgKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgdGl0bGUgPSAkKCc8aDUvPicsIHtcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcbiAgICAgIH0pO1xuICAgICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlKTtcbiAgICB9XG5cbiAgICB2YXIgdGV4dCA9ICQoJzxkaXYvPicsIHtcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90ZXh0XCJcbiAgICB9KTtcbiAgICB0ZXh0Lmh0bWwoZGF0YS5tZXNzYWdlKTtcblxuICAgIGlmIChkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcbiAgICAgIH0pO1xuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcbiAgICAgIHZhciB3cmFwID0gJCgnPGRpdi8+Jywge1xuICAgICAgICBjbGFzczogXCJ3cmFwXCJcbiAgICAgIH0pO1xuXG4gICAgICB3cmFwLmFwcGVuZChpbWcpO1xuICAgICAgd3JhcC5hcHBlbmQodGV4dCk7XG4gICAgICBjb250ZW50LmFwcGVuZCh3cmFwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudC5hcHBlbmQodGV4dCk7XG4gICAgfVxuICAgIGxpLmFwcGVuZChjb250ZW50KTtcblxuICAgIC8vXG4gICAgLy8gaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XG4gICAgLy8gICB2YXIgdGl0bGUgPSAkKCc8cC8+Jywge1xuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxuICAgIC8vICAgfSk7XG4gICAgLy8gICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xuICAgIC8vICAgbGkuYXBwZW5kKHRpdGxlKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xuICAgIC8vICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXG4gICAgLy8gICB9KTtcbiAgICAvLyAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xuICAgIC8vICAgbGkuYXBwZW5kKGltZyk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcbiAgICAvLyAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxuICAgIC8vIH0pO1xuICAgIC8vIGNvbnRlbnQuaHRtbChkYXRhLm1lc3NhZ2UpO1xuICAgIC8vXG4gICAgLy8gbGkuYXBwZW5kKGNvbnRlbnQpO1xuICAgIC8vXG4gICAgY29udGVpbmVyLmFwcGVuZChsaSk7XG5cbiAgICBpZiAob3B0aW9uLnRpbWUgPiAwKSB7XG4gICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQoY2xvc2UpLCBvcHRpb24udGltZSk7XG4gICAgfVxuICAgIGxpLmRhdGEoJ29wdGlvbicsIG9wdGlvbilcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYWxlcnQ6IGFsZXJ0LFxuICAgIGNvbmZpcm06IGNvbmZpcm0sXG4gICAgbm90aWZpOiBub3RpZmksXG4gIH07XG5cbn0pKCk7XG5cblxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGEgPSBlbC5kYXRhKCk7XG5cbiAgZGF0YS5xdWVzdGlvbiA9IGVsLmh0bWwoKTtcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xufSk7XG5cblxuJCgnLmRpc2FibGVkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkdGhpcyA9ICQodGhpcyk7XG4gIGRhdGEgPSAkdGhpcy5kYXRhKCk7XG4gIGlmIChkYXRhWydidXR0b25feWVzJ10pZGF0YVsnYnV0dG9uWWVzJ10gPSBkYXRhWydidXR0b25feWVzJ11cblxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCcubW9kYWxzX29wZW4nLGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcblxuICAgICAgICAvL9C/0YDQuCDQvtGC0LrRgNGL0YLQuNC4INGE0L7RgNC80Ysg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuCDQt9Cw0LrRgNGL0YLRjCwg0LXRgdC70Lgg0L7RgtGA0YvRgtC+IC0g0L/QvtC/0LDQvyDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjyDQutGD0L/QvtC90LAg0LHQtdC3INGA0LXQs9C40YHRgtGA0LDRhtC40LhcbiAgICAgICAgdmFyIHBvcHVwID0gJChcImFbaHJlZj0nI3Nob3dwcm9tb2NvZGUtbm9yZWdpc3RlciddXCIpLmRhdGEoJ3BvcHVwJyk7XG4gICAgICAgIGlmIChwb3B1cCkge1xuICAgICAgICAgICAgcG9wdXAuY2xvc2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvcHVwID0gJCgnZGl2LnBvcHVwX2NvbnQsIGRpdi5wb3B1cF9iYWNrJyk7XG4gICAgICAgICAgICBpZiAocG9wdXApIHtcbiAgICAgICAgICAgICAgICBwb3B1cC5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcbiAgICAgICAgaHJlZj1ocmVmW2hyZWYubGVuZ3RoLTFdO1xuICAgICAgICB2YXIgbm90eUNsYXNzID0gJCh0aGlzKS5kYXRhKCdub3R5Y2xhc3MnKTtcbiAgICAgICAgdmFyIGRhdGE9e1xuICAgICAgICAgICAgYnV0dG9uWWVzOmZhbHNlLFxuICAgICAgICAgICAgbm90eWZ5X2NsYXNzOlwibG9hZGluZyBcIisoaHJlZi5pbmRleE9mKCd2aWRlbycpPT09MD8nbW9kYWxzLWZ1bGxfc2NyZWVuJzonbm90aWZ5X3doaXRlJykrJyAnK25vdHlDbGFzcyxcbiAgICAgICAgICAgIHF1ZXN0aW9uOicnXG4gICAgICAgIH07XG4gICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcblxuICAgICAgICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcbiAgICAgICAgICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcbiAgICAgICAgfSwnanNvbicpO1xuXG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KVxufSgpKTtcbiIsIiQoJy5mb290ZXItbWVudS10aXRsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICR0aGlzPSQodGhpcyk7XG4gIGlmKCR0aGlzLmhhc0NsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJykpe1xuICAgICR0aGlzLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJylcbiAgfWVsc2V7XG4gICAgJCgnLmZvb3Rlci1tZW51LXRpdGxlX29wZW4nKS5yZW1vdmVDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpO1xuICAgICR0aGlzLmFkZENsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XG4gIH1cblxufSk7IiwiJChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIHN0YXJOb21pbmF0aW9uKGluZGV4KSB7XG4gICAgdmFyIHN0YXJzID0gJChcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIik7XG4gICAgc3RhcnMuYWRkQ2xhc3MoXCJyYXRpbmctc3Rhci1vcGVuXCIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5kZXg7IGkrKykge1xuICAgICAgc3RhcnMuZXEoaSkucmVtb3ZlQ2xhc3MoXCJyYXRpbmctc3Rhci1vcGVuXCIpO1xuICAgIH1cbiAgfVxuXG4gICQoZG9jdW1lbnQpLm9uKFwibW91c2VvdmVyXCIsIFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiLCBmdW5jdGlvbiAoZSkge1xuICAgIHN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xuICB9KS5vbihcIm1vdXNlbGVhdmVcIiwgXCIucmF0aW5nLXdyYXBwZXJcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICBzdGFyTm9taW5hdGlvbigkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgpKTtcbiAgfSkub24oXCJjbGlja1wiLCBcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcblxuICAgICQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCQodGhpcykuaW5kZXgoKSArIDEpO1xuICB9KTtcbn0pOyIsIi8v0LjQt9Cx0YDQsNC90L3QvtC1XG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAkKFwiLmZhdm9yaXRlLWxpbmtcIikub24oJ2NsaWNrJyxmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xuICAgIHZhciB0eXBlID0gc2VsZi5hdHRyKFwiZGF0YS1zdGF0ZVwiKSxcbiAgICAgIGFmZmlsaWF0ZV9pZCA9IHNlbGYuYXR0cihcImRhdGEtYWZmaWxpYXRlLWlkXCIpO1xuXG4gICAgaWYoIWFmZmlsaWF0ZV9pZCl7XG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgICB0aXRsZTpcItCd0LXQvtCx0YXQvtC00LjQvNC+INCw0LLRgtC+0YDQuNC30L7QstCw0YLRjNGB0Y9cIixcbiAgICAgICAgICBtZXNzYWdlOifQlNC+0LHQsNCy0LjRgtGMINCyINC40LfQsdGA0LDQvdC90L7QtSDQvNC+0LbQtdGCINGC0L7Qu9GM0LrQviDQsNCy0YLQvtGA0LjQt9C+0LLQsNC90L3Ri9C5INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjC48L2JyPicrXG4gICAgICAgICAgICAnPGEgaHJlZj1cIiNsb2dpblwiIGNsYXNzPVwibW9kYWxzX29wZW5cIj7QktGF0L7QtDwvYT4gIC8gPGEgaHJlZj1cIiNyZWdpc3RyYXRpb25cIiBjbGFzcz1cIm1vZGFsc19vcGVuXCI+0KDQtdCz0LjRgdGC0YDQsNGG0LjRjzwvYT4nLFxuICAgICAgICAgIHR5cGU6J2luZm8nXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIH1cblxuICAgIGlmIChzZWxmLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgc2VsZi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblxuICAgIC8qaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICBzZWxmLmZpbmQoXCIuaXRlbV9pY29uXCIpLnJlbW92ZUNsYXNzKFwibXV0ZWRcIik7XG4gICAgfSovXG5cbiAgICAkLnBvc3QoXCIvYWNjb3VudC9mYXZvcml0ZXNcIix7XG4gICAgICBcInR5cGVcIiA6IHR5cGUgLFxuICAgICAgXCJhZmZpbGlhdGVfaWRcIjogYWZmaWxpYXRlX2lkXG4gICAgfSxmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIGlmKGRhdGEuZXJyb3Ipe1xuICAgICAgICBzZWxmLmZpbmQoJ3N2ZycpLnJlbW92ZUNsYXNzKFwic3BpblwiKTtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTpkYXRhLmVycm9yLHR5cGU6J2VycicsJ3RpdGxlJzooZGF0YS50aXRsZT9kYXRhLnRpdGxlOmZhbHNlKX0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICBtZXNzYWdlOmRhdGEubXNnLFxuICAgICAgICB0eXBlOidzdWNjZXNzJyxcbiAgICAgICAgJ3RpdGxlJzooZGF0YS50aXRsZT9kYXRhLnRpdGxlOmZhbHNlKVxuICAgICAgfSk7XG5cbiAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgICBzZWxmLmZpbmQoXCIuaXRlbV9pY29uXCIpLmFkZENsYXNzKFwic3ZnLW5vLWZpbGxcIik7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuYXR0cih7XG4gICAgICAgIFwiZGF0YS1zdGF0ZVwiOiBkYXRhW1wiZGF0YS1zdGF0ZVwiXSxcbiAgICAgICAgXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCI6IGRhdGFbJ2RhdGEtb3JpZ2luYWwtdGl0bGUnXVxuICAgICAgfSk7XG5cbiAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluIHN2Zy1uby1maWxsXCIpO1xuICAgICAgfSBlbHNlIGlmKHR5cGUgPT0gXCJkZWxldGVcIikge1xuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluXCIpLmFkZENsYXNzKFwic3ZnLW5vLWZpbGxcIik7XG4gICAgICB9XG5cbiAgICB9LCdqc29uJykuZmFpbChmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOlwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgK1xuICAgICAgXCIg0L/RgNC+0LjQt9Cy0LXQtNGR0L3QvdC+0LUg0LTQtdC50YHRgtCy0LjQtSDQvdC10LLQvtC30LzQvtC20L3Qvi4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtS5cIiArXG4gICAgICBcIiDQn9GA0LjQvdC+0YHQuNC8INGB0LLQvtC4INC40LfQstC40L3QtdC90LjRjyDQt9CwINC90LXRg9C00L7QsdGB0YLQstC+LlwiLHR5cGU6J2Vycid9KTtcblxuICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5hZGRDbGFzcyhcInN2Zy1uby1maWxsXCIpO1xuICAgICAgfVxuICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpblwiKTtcbiAgICB9KVxuICB9KTtcbn0pOyIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG4gICQoJy5zY3JvbGxfdG8nKS5jbGljayggZnVuY3Rpb24oZSl7IC8vINC70L7QstC40Lwg0LrQu9C40Log0L/QviDRgdGB0YvQu9C60LUg0YEg0LrQu9Cw0YHRgdC+0LwgZ29fdG9cbiAgICB2YXIgc2Nyb2xsX2VsID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7IC8vINCy0L7Qt9GM0LzQtdC8INGB0L7QtNC10YDQttC40LzQvtC1INCw0YLRgNC40LHRg9GC0LAgaHJlZiwg0LTQvtC70LbQtdC9INCx0YvRgtGMINGB0LXQu9C10LrRgtC+0YDQvtC8LCDRgi7QtS4g0L3QsNC/0YDQuNC80LXRgCDQvdCw0YfQuNC90LDRgtGM0YHRjyDRgSAjINC40LvQuCAuXG4gICAgc2Nyb2xsX2VsPSQoc2Nyb2xsX2VsKTtcbiAgICBpZiAoc2Nyb2xsX2VsLmxlbmd0aCAhPSAwKSB7IC8vINC/0YDQvtCy0LXRgNC40Lwg0YHRg9GJ0LXRgdGC0LLQvtCy0LDQvdC40LUg0Y3Qu9C10LzQtdC90YLQsCDRh9GC0L7QsdGLINC40LfQsdC10LbQsNGC0Ywg0L7RiNC40LHQutC4XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogc2Nyb2xsX2VsLm9mZnNldCgpLnRvcC0kKCcjaGVhZGVyPionKS5lcSgwKS5oZWlnaHQoKS01MCB9LCA1MDApOyAvLyDQsNC90LjQvNC40YDRg9C10Lwg0YHQutGA0L7QvtC70LjQvdCzINC6INGN0LvQtdC80LXQvdGC0YMgc2Nyb2xsX2VsXG4gICAgICBpZihzY3JvbGxfZWwuaGFzQ2xhc3MoJ2FjY29yZGlvbicpICYmICFzY3JvbGxfZWwuaGFzQ2xhc3MoJ29wZW4nKSl7XG4gICAgICAgIHNjcm9sbF9lbC5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wnKS5jbGljaygpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7IC8vINCy0YvQutC70Y7Rh9Cw0LXQvCDRgdGC0LDQvdC00LDRgNGC0L3QvtC1INC00LXQudGB0YLQstC40LVcbiAgfSk7XG59KTsiLCIkKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAkKFwiYm9keVwiKS5vbignY2xpY2snLCcuc2V0X2NsaXBib2FyZCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgY29weVRvQ2xpcGJvYXJkKCR0aGlzLmRhdGEoJ2NsaXBib2FyZCcpLCR0aGlzLmRhdGEoJ2NsaXBib2FyZC1ub3RpZnknKSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGNvcHlUb0NsaXBib2FyZChjb2RlLG1zZykge1xuICAgIHZhciAkdGVtcCA9ICQoXCI8aW5wdXQ+XCIpO1xuICAgICQoXCJib2R5XCIpLmFwcGVuZCgkdGVtcCk7XG4gICAgJHRlbXAudmFsKGNvZGUpLnNlbGVjdCgpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiY29weVwiKTtcbiAgICAkdGVtcC5yZW1vdmUoKTtcblxuICAgIGlmKCFtc2cpe1xuICAgICAgbXNnPVwi0JTQsNC90L3Ri9C1INGD0YHQv9C10YjQvdC+INGB0LrQvtC/0LjRgNC+0LLQsNC90Ysg0LIg0LHRg9GE0LXRgCDQvtCx0LzQtdC90LBcIjtcbiAgICB9XG4gICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7J3R5cGUnOidpbmZvJywnbWVzc2FnZSc6bXNnLCd0aXRsZSc6J9Cj0YHQv9C10YjQvdC+J30pXG4gIH1cblxuICAkKFwiYm9keVwiKS5vbignY2xpY2snLFwiaW5wdXQubGlua1wiLGZ1bmN0aW9uKCl7XHQvLyDQv9C+0LvRg9GH0LXQvdC40LUg0YTQvtC60YPRgdCwINGC0LXQutGB0YLQvtCy0YvQvCDQv9C+0LvQtdC8LdGB0YHRi9C70LrQvtC5XG4gICAgJCh0aGlzKS5zZWxlY3QoKTtcbiAgfSk7XG59KTsiLCIvL9GB0LrQsNGH0LjQstCw0L3QuNC1INC60LDRgNGC0LjQvdC+0LpcbihmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgdmFyIGltZyA9IGRhdGEuaW1nO1xuICAgIGltZy53cmFwKCc8ZGl2IGNsYXNzPVwiZG93bmxvYWRcIj48L2Rpdj4nKTtcbiAgICB2YXIgd3JhcCA9IGltZy5wYXJlbnQoKTtcbiAgICAkKCcuZG93bmxvYWRfdGVzdCcpLmFwcGVuZChkYXRhLmVsKTtcbiAgICBzaXplID0gZGF0YS5lbC53aWR0aCgpICsgXCJ4XCIgKyBkYXRhLmVsLmhlaWdodCgpO1xuXG4gICAgdz1kYXRhLmVsLndpZHRoKCkqMC44O1xuICAgIGltZ1xuICAgICAgLmhlaWdodCgnYXV0bycpXG4gICAgICAvLy53aWR0aCh3KVxuICAgICAgLmNzcygnbWF4LXdpZHRoJywnOTklJyk7XG5cblxuICAgIGRhdGEuZWwucmVtb3ZlKCk7XG4gICAgd3JhcC5hcHBlbmQoJzxzcGFuPicgKyBzaXplICsgJzwvc3Bhbj4gPGEgaHJlZj1cIicgKyBkYXRhLnNyYyArICdcIiBkb3dubG9hZD7QodC60LDRh9Cw0YLRjDwvYT4nKTtcbiAgfVxuXG4gIHZhciBpbWdzID0gJCgnLmRvd25sb2Fkc19pbWcgaW1nJyk7XG4gIGlmKGltZ3MubGVuZ3RoPT0wKXJldHVybjtcblxuICAkKCdib2R5JykuYXBwZW5kKCc8ZGl2IGNsYXNzPWRvd25sb2FkX3Rlc3Q+PC9kaXY+Jyk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpbWcgPSBpbWdzLmVxKGkpO1xuICAgIHZhciBzcmMgPSBpbWcuYXR0cignc3JjJyk7XG4gICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XG4gICAgICBzcmM6IHNyY1xuICAgIH0pO1xuICAgIGRhdGEgPSB7XG4gICAgICBzcmM6IHNyYyxcbiAgICAgIGltZzogaW1nLFxuICAgICAgZWw6IGltYWdlXG4gICAgfTtcbiAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxuICB9XG59KSgpO1xuXG5cbi8v0YfRgtC+INCxINC40YTRgNC10LnQvNGLINC4INC60LDRgNGC0LjQvdC60Lgg0L3QtSDQstGL0LvQsNC30LjQu9C4XG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAvKm1fdyA9ICQoJy50ZXh0LWNvbnRlbnQnKS53aWR0aCgpXG4gICBpZiAobV93IDwgNTApbV93ID0gc2NyZWVuLndpZHRoIC0gNDAqL1xuICB2YXIgbXc9c2NyZWVuLndpZHRoLTQwO1xuXG4gIGZ1bmN0aW9uIG9wdGltYXNlKGVsKXtcbiAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50KCk7XG4gICAgaWYocGFyZW50Lmxlbmd0aD09MCB8fCBwYXJlbnRbMF0udGFnTmFtZT09XCJBXCIpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZihlbC5oYXNDbGFzcygnbm9fb3B0b21pemUnKSlyZXR1cm47XG5cbiAgICBtX3cgPSBwYXJlbnQud2lkdGgoKS0zMDtcbiAgICB2YXIgdz1lbC53aWR0aCgpO1xuXG4gICAgLy/QsdC10Lcg0Y3RgtC+0LPQviDQv9C70Y7RidC40YIg0LHQsNC90LXRgNGLINCyINCw0LrQsNGA0LTQuNC+0L3QtVxuICAgIGlmKHc8MyB8fCBtX3c8Myl7XG4gICAgICBlbFxuICAgICAgICAuaGVpZ2h0KCdhdXRvJylcbiAgICAgICAgLmNzcygnbWF4LXdpZHRoJywnOTklJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZWwud2lkdGgoJ2F1dG8nKTtcbiAgICBpZihlbFswXS50YWdOYW1lPT1cIklNR1wiICYmIHc+ZWwud2lkdGgoKSl3PWVsLndpZHRoKCk7XG5cbiAgICBpZiAobXc+NTAgJiYgbV93ID4gbXcpbV93ID0gbXc7XG4gICAgaWYgKHc+bV93KSB7XG4gICAgICBpZihlbFswXS50YWdOYW1lPT1cIklGUkFNRVwiKXtcbiAgICAgICAgayA9IHcgLyBtX3c7XG4gICAgICAgIGVsLmhlaWdodChlbC5oZWlnaHQoKSAvIGspO1xuICAgICAgfVxuICAgICAgZWwud2lkdGgobV93KVxuICAgIH1lbHNle1xuICAgICAgZWwud2lkdGgodyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgdmFyIGVsPSQodGhpcyk7XG4gICAgb3B0aW1hc2UoZWwpO1xuICB9XG5cbiAgdmFyIHAgPSAkKCcuY29udGVudC13cmFwIGltZywuY29udGVudC13cmFwIGlmcmFtZScpO1xuICAkKCcuY29udGVudC13cmFwIGltZzpub3QoLm5vX29wdG9taXplKScpLmhlaWdodCgnYXV0bycpO1xuICAvLyQoJy5jb250YWluZXIgaW1nJykud2lkdGgoJ2F1dG8nKTtcbiAgZm9yIChpID0gMDsgaSA8IHAubGVuZ3RoOyBpKyspIHtcbiAgICBlbCA9IHAuZXEoaSk7XG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIikge1xuICAgICAgb3B0aW1hc2UoZWwpO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHNyYz1lbC5hdHRyKCdzcmMnKTtcbiAgICAgIGltYWdlID0gJCgnPGltZy8+Jywge1xuICAgICAgICBzcmM6IHNyY1xuICAgICAgfSk7XG4gICAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGVsKSk7XG4gICAgfVxuICB9XG59KTtcblxuXG4vL9Cf0YDQvtCy0LXRgNC60LAg0LHQuNGC0Ysg0LrQsNGA0YLQuNC90L7Qui5cblxuLy8gISEhISEhXG4vLyDQndGD0LbQvdC+INC/0YDQvtCy0LXRgNC40YLRjFxuLy8gISEhISEhXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcbiAgICBkYXRhPXRoaXM7XG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XG4gICAgICBkYXRhLmltZy5hdHRyKCdzcmMnLCBkYXRhLnNyYyk7XG4gICAgfWVsc2V7XG4gICAgICBkYXRhLmltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcrZGF0YS5zcmMrJyknKTtcbiAgICAgIGRhdGEuaW1nLnJlbW92ZUNsYXNzKCdub19hdmEnKTtcbiAgICB9XG4gIH1cblxuICAvL9GC0LXRgdGCINC70L7Qs9C+INC80LDQs9Cw0LfQuNC90LBcbiAgaW1ncz0kKCdzZWN0aW9uOm5vdCgubmF2aWdhdGlvbiknKS5maW5kKCcubG9nbyBpbWcnKTtcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcbiAgICBpbWc9aW1ncy5lcShpKTtcbiAgICBzcmM9aW1nLmF0dHIoJ3NyYycpO1xuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XG4gICAgZGF0YT17XG4gICAgICBzcmM6c3JjLFxuICAgICAgaW1nOmltZyxcbiAgICAgIHR5cGU6MCAvLyDQtNC70Y8gaW1nW3NyY11cbiAgICB9O1xuICAgIGltYWdlPSQoJzxpbWcvPicse1xuICAgICAgc3JjOnNyY1xuICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcbiAgfVxuXG4gIC8v0YLQtdGB0YIg0LDQstCw0YLQsNGA0L7QuiDQsiDQutC+0LzQtdC90YLQsNGA0LjRj9GFXG4gIGltZ3M9JCgnLmNvbW1lbnQtcGhvdG8nKTtcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcbiAgICBpbWc9aW1ncy5lcShpKTtcbiAgICBpZihpbWcuaGFzQ2xhc3MoJ25vX2F2YScpKXtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHZhciBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xuICAgIHNyYz1zcmMucmVwbGFjZSgndXJsKFwiJywnJyk7XG4gICAgc3JjPXNyYy5yZXBsYWNlKCdcIiknLCcnKTtcbiAgICBpbWcuYWRkQ2xhc3MoJ25vX2F2YScpO1xuXG4gICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgvaW1hZ2VzL25vX2F2YS5wbmcpJyk7XG4gICAgZGF0YT17XG4gICAgICBzcmM6c3JjLFxuICAgICAgaW1nOmltZyxcbiAgICAgIHR5cGU6MSAvLyDQtNC70Y8g0YTQvtC90L7QstGL0YUg0LrQsNGA0YLQuNC90L7QulxuICAgIH07XG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XG4gICAgICBzcmM6c3JjXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxuICB9XG59KTsiLCIvL9C10YHQu9C4INC+0YLQutGA0YvRgtC+INC60LDQuiDQtNC+0YfQtdGA0L3QtdC1XG4oZnVuY3Rpb24oKXtcbiAgaWYoIXdpbmRvdy5vcGVuZXIpcmV0dXJuO1xuXG4gIGhyZWY9d2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmO1xuICBpZihcbiAgICBocmVmLmluZGV4T2YoJ2FjY291bnQvb2ZmbGluZScpPjBcbiAgKXtcbiAgICB3aW5kb3cucHJpbnQoKVxuICB9XG5cbiAgaWYoZG9jdW1lbnQucmVmZXJyZXIuaW5kZXhPZignc2VjcmV0ZGlzY291bnRlcicpPDApcmV0dXJuO1xuXG4gIGlmKFxuICAgIGhyZWYuaW5kZXhPZignc29jaWFscycpPjAgfHxcbiAgICBocmVmLmluZGV4T2YoJ2xvZ2luJyk+MCB8fFxuICAgIGhyZWYuaW5kZXhPZignYWRtaW4nKT4wIHx8XG4gICAgaHJlZi5pbmRleE9mKCdhY2NvdW50Jyk+MFxuICApe1xuICAgIHJldHVybjtcbiAgfVxuICBpZihocmVmLmluZGV4T2YoJ3N0b3JlJyk+MCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpPjAgfHwgaHJlZi5pbmRleE9mKCdzZXR0aW5ncycpPjApe1xuICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24ucmVsb2FkKCk7XG4gIH1lbHNle1xuICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZj1sb2NhdGlvbi5ocmVmO1xuICB9XG4gIHdpbmRvdy5jbG9zZSgpO1xufSkoKTtcbiIsIiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKGV2dCkge1xuICAgIHZhciBmaWxlID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XG4gICAgdmFyIGYgPSBmaWxlWzBdO1xuICAgIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cbiAgICBpZiAoIWYudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgZGF0YSA9IHtcbiAgICAgICdlbCc6IHRoaXMsXG4gICAgICAnZic6IGZcbiAgICB9O1xuICAgIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpbWcgPSAkKCdbZm9yPVwiJyArIGRhdGEuZWwubmFtZSArICdcIl0nKTtcbiAgICAgICAgaWYgKGltZy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgaW1nLmF0dHIoJ3NyYycsIGUudGFyZ2V0LnJlc3VsdClcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KShkYXRhKTtcbiAgICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXG4gICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZik7XG4gIH0pO1xuXG4gICQoJy5kdWJsaWNhdGVfdmFsdWUnKS5vbignY2hhbmdlJyxmdW5jdGlvbiAoKSB7XG4gICAgdmFyICR0aGlzPSQodGhpcyk7XG4gICAgdmFyIHNlbD0kKCR0aGlzLmRhdGEoJ3NlbGVjdG9yJykpO1xuICAgIHNlbC52YWwodGhpcy52YWx1ZSk7XG4gIH0pXG59KTtcbiIsIlxuZnVuY3Rpb24gZ2V0Q29va2llKG4pIHtcbiAgcmV0dXJuIHVuZXNjYXBlKChSZWdFeHAobiArICc9KFteO10rKScpLmV4ZWMoZG9jdW1lbnQuY29va2llKSB8fCBbMSwgJyddKVsxXSk7XG59XG5cbmZ1bmN0aW9uIHNldENvb2tpZShuYW1lLCB2YWx1ZSkge1xuICB2YXIgY29va2llX3N0cmluZyA9IG5hbWUgKyBcIj1cIiArIGVzY2FwZSAoIHZhbHVlICk7XG4gIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZV9zdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGVyYXNlQ29va2llKG5hbWUpe1xuICB2YXIgY29va2llX3N0cmluZyA9IG5hbWUgKyBcIj0wXCIgK1wiOyBleHBpcmVzPVdlZCwgMDEgT2N0IDIwMTcgMDA6MDA6MDAgR01UXCI7XG4gIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZV9zdHJpbmc7XG59IiwiKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50KSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciB0YWJsZXMgPSAkKCd0YWJsZS5hZGFwdGl2ZScpO1xuXG4gIGlmICh0YWJsZXMubGVuZ3RoID09IDApcmV0dXJuO1xuXG4gIGZvciAodmFyIGkgPSAwOyB0YWJsZXMubGVuZ3RoID4gaTsgaSsrKSB7XG4gICAgdmFyIHRhYmxlID0gdGFibGVzLmVxKGkpO1xuICAgIHZhciB0aCA9IHRhYmxlLmZpbmQoJ3RoZWFkJyk7XG4gICAgaWYgKHRoLmxlbmd0aCA9PSAwKSB7XG4gICAgICB0aCA9IHRhYmxlLmZpbmQoJ3RyJykuZXEoMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoID0gdGguZmluZCgndHInKS5lcSgwKTtcbiAgICB9XG4gICAgdGggPSB0aC5hZGRDbGFzcygndGFibGUtaGVhZGVyJykuZmluZCgndGQsdGgnKTtcblxuICAgIHZhciB0ciA9IHRhYmxlLmZpbmQoJ3RyJykubm90KCcudGFibGUtaGVhZGVyJyk7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoLmxlbmd0aDsgaisrKSB7XG4gICAgICB2YXIgaz1qKzE7XG4gICAgICB2YXIgdGQgPSB0ci5maW5kKCd0ZDpudGgtY2hpbGQoJytrKycpJyk7XG4gICAgICB0ZC5hdHRyKCdsYWJlbCcsdGguZXEoaikudGV4dCgpKTtcbiAgICB9XG4gIH1cblxufSkod2luZG93LCBkb2N1bWVudCk7IiwiO1xuJChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gb25SZW1vdmUoKXtcbiAgICAkdGhpcz0kKHRoaXMpO1xuICAgIHBvc3Q9e1xuICAgICAgaWQ6JHRoaXMuYXR0cigndWlkJyksXG4gICAgICB0eXBlOiR0aGlzLmF0dHIoJ21vZGUnKVxuICAgIH07XG4gICAgJC5wb3N0KCR0aGlzLmF0dHIoJ3VybCcpLHBvc3QsZnVuY3Rpb24oZGF0YSl7XG4gICAgICBpZihkYXRhICYmIGRhdGE9PSdlcnInKXtcbiAgICAgICAgbXNnPSR0aGlzLmRhdGEoJ3JlbW92ZS1lcnJvcicpO1xuICAgICAgICBpZighbXNnKXtcbiAgICAgICAgICBtc2c9J9Cd0LXQstC+0LfQvNC+0LbQvdC+INGD0LTQsNC70LjRgtGMINGN0LvQtdC80LXQvdGCJztcbiAgICAgICAgfVxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOm1zZyx0eXBlOidlcnInfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbW9kZT0kdGhpcy5hdHRyKCdtb2RlJyk7XG4gICAgICBpZighbW9kZSl7XG4gICAgICAgIG1vZGU9J3JtJztcbiAgICAgIH1cblxuICAgICAgaWYobW9kZT09J3JtJykge1xuICAgICAgICBybSA9ICR0aGlzLmNsb3Nlc3QoJy50b19yZW1vdmUnKTtcbiAgICAgICAgcm1fY2xhc3MgPSBybS5hdHRyKCdybV9jbGFzcycpO1xuICAgICAgICBpZiAocm1fY2xhc3MpIHtcbiAgICAgICAgICAkKHJtX2NsYXNzKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJtLnJlbW92ZSgpO1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQo9GB0L/QtdGI0L3QvtC1INGD0LTQsNC70LXQvdC40LUuJyx0eXBlOidpbmZvJ30pXG4gICAgICB9XG4gICAgICBpZihtb2RlPT0ncmVsb2FkJyl7XG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICBsb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XG4gICAgICB9XG4gICAgfSkuZmFpbChmdW5jdGlvbigpe1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J7RiNC40LHQutCwINGD0LTQsNC70L3QuNGPJyx0eXBlOidlcnInfSk7XG4gICAgfSlcbiAgfVxuXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuYWpheF9yZW1vdmUnLGZ1bmN0aW9uKCl7XG4gICAgbm90aWZpY2F0aW9uLmNvbmZpcm0oe1xuICAgICAgY2FsbGJhY2tZZXM6b25SZW1vdmUsXG4gICAgICBvYmo6JCh0aGlzKSxcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfYm94LWFsZXJ0XCJcbiAgICB9KVxuICB9KTtcblxufSk7XG5cbiIsIiJdfQ==
