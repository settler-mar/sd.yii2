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

    if ($accordion.hasClass('open')) {
        /*if($accordion.hasClass('accordion-only_one')){
            return false;
        }*/
        $accordion.find('.accordion-content').slideUp(300);
        $accordion.removeClass('open')
    } else {
        if($accordion.hasClass('accordion-only_one')){
            $other=$('.accordion-only_one');
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
accordionSlim=$('.accordion.accordion-only_one');
if(accordionSlim.length>0){
    accordionSlim.parent().find('.accordion.open')
        .addClass('last-open')
        .find('.accordion-content')
            .show(300)
            .addClass('accordion-content_last-open');
}

function ajaxForm(els) {
  var fileApi = window.File && window.FileReader && window.FileList && window.Blob ? true : false;
  var defaults = {
    error_class: '.has-error'
  };
  var last_post=false;

  function onPost(post){
    last_post = +new Date();
    //console.log(post, this);
    var data=this;
    var form=data.form;
    var wrap=data.wrap;

    if (post.render) {
        post.notyfy_class = "notify_white";
        notification.alert(post);
    } else {
        wrap.removeClass('loading');
        form.removeClass('loading');
        if(post.html) {
          wrap.html(post.html);
          ajaxForm(wrap);
        }else{
          if(!post.error) {
            form.removeClass('loading');
            form.find('input[type=text],textarea').val('')
          }
        }
    }
    if (typeof post.error === "object") {
        for (var index in post.error) {
            notification.notifi({
                'type':'err',
                'title': 'Ошибка',
                'message': post.error[index]
            });
        }
    } else if (Array.isArray(post.error)){
        for (var i=0; i<post.error.length; i++) {
            notification.notifi({
                'type':'err',
                'title': 'Ошибка',
                'message': post.error[i]
            });
        }
    } else {
        notification.notifi({
            'type': post.error === false ? 'success' : 'err',
            'title': post.error === false ? 'Успешно' : 'Ошибка',
            'message': post.message ? post.message : post.error
        });
    }
    //
    // notification.notifi({
    //     'type': post.error === false ? 'success' : 'err',
    //     'title': post.error === false ? 'Успешно' : 'Ошибка',
    //     'message': Array.isArray(post.error) ? post.error[0] : (post.message ? post.message : post.error)
    // });
  }

  function onFail(){
    last_post = +new Date();
    var data=this;
    var form=data.form;
    var wrap=data.wrap;
    wrap.removeClass('loading');
    wrap.html('<h3>Упс... Возникла непредвиденная ошибка<h3>' +
      '<p>Часто это происходит в случае, если вы несколько раз подряд неверно ввели свои учетные данные. Но возможны и другие причины. В любом случае не расстраивайтесь и просто обратитесь к нашему оператору службы поддержки.</p><br>' +
      '<p>Спасибо.</p>');
    ajaxForm(wrap);

  }

  function onSubmit(e){
    e.preventDefault();
    //e.stopImmediatePropagation();
    //e.stopPropagation();

    var currentTimeMillis = +new Date();
    if(currentTimeMillis-last_post<1000*2){
      return false;
    }

    last_post = currentTimeMillis;
    var data=this;
    var form=data.form;
    var wrap=data.wrap;
    var isValid=true;

    //init(wrap);

    if(form.yiiActiveForm){
      form.yiiActiveForm('validate');
      var d = form.data('yiiActiveForm');
      isValid=d.validated;
    }

    isValid=isValid && (form.find(data.param.error_class).length==0);

    if (!isValid) {
      return false;
    } else {

      e.stopImmediatePropagation();
      e.stopPropagation();

      var required=form.find('input.required');

      for(i=0;i<required.length;i++){
        var helpBlock = required.eq(i).attr('type') == 'hidden' ? required.eq(i).next('.help-block') :
            required.eq(i).closest('.form-input-group').next('.help-block');
        var helpMessage = helpBlock && helpBlock.data('message') ? helpBlock.data('message') : 'Необходимо заполнить';

        if(required.eq(i).val().length<1){
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

    if(!form.serializeObject)addSRO();

    var postData = form.serializeObject();
    form.addClass('loading');
    //form.html('');
    //wrap.html('<div style="text-align:center;"><p>Отправка данных</p></div>');

    data.url+=(data.url.indexOf('?')>0?'&':'?')+'rc='+Math.random();
    console.log(data.url);

    $.post(
      data.url,
      postData,
      onPost.bind(data),
      'json'
    ).fail(onFail.bind(data));

    return false;
  }

  function init(wrap){
    form=wrap.find('form');
    data={
      form:form,
      param:defaults,
      wrap:wrap
    };
    data.url=form.attr('action') || location.href;
    data.method= form.attr('method') || 'post';
    form.unbind('submit');
    //form.off('submit');
    form.on('submit', onSubmit.bind(data));
  }

  els.find('[required]')
    .addClass('required')
    .removeAttr('required');


  for(var i=0;i<els.length;i++){
    init(els.eq(i));
  }
}

function addSRO(){
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
/*
 * jQuery FlexSlider v2.6.4
 * Copyright 2012 WooThemes
 * Contributing Author: Tyler Smith
 */!function($){var e=!0;$.flexslider=function(t,a){var n=$(t);n.vars=$.extend({},$.flexslider.defaults,a);var i=n.vars.namespace,r=window.navigator&&window.navigator.msPointerEnabled&&window.MSGesture,s=("ontouchstart"in window||r||window.DocumentTouch&&document instanceof DocumentTouch)&&n.vars.touch,o="click touchend MSPointerUp keyup",l="",c,d="vertical"===n.vars.direction,u=n.vars.reverse,v=n.vars.itemWidth>0,p="fade"===n.vars.animation,m=""!==n.vars.asNavFor,f={};$.data(t,"flexslider",n),f={init:function(){n.animating=!1,n.currentSlide=parseInt(n.vars.startAt?n.vars.startAt:0,10),isNaN(n.currentSlide)&&(n.currentSlide=0),n.animatingTo=n.currentSlide,n.atEnd=0===n.currentSlide||n.currentSlide===n.last,n.containerSelector=n.vars.selector.substr(0,n.vars.selector.search(" ")),n.slides=$(n.vars.selector,n),n.container=$(n.containerSelector,n),n.count=n.slides.length,n.syncExists=$(n.vars.sync).length>0,"slide"===n.vars.animation&&(n.vars.animation="swing"),n.prop=d?"top":"marginLeft",n.args={},n.manualPause=!1,n.stopped=!1,n.started=!1,n.startTimeout=null,n.transitions=!n.vars.video&&!p&&n.vars.useCSS&&function(){var e=document.createElement("div"),t=["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var a in t)if(void 0!==e.style[t[a]])return n.pfx=t[a].replace("Perspective","").toLowerCase(),n.prop="-"+n.pfx+"-transform",!0;return!1}(),n.ensureAnimationEnd="",""!==n.vars.controlsContainer&&(n.controlsContainer=$(n.vars.controlsContainer).length>0&&$(n.vars.controlsContainer)),""!==n.vars.manualControls&&(n.manualControls=$(n.vars.manualControls).length>0&&$(n.vars.manualControls)),""!==n.vars.customDirectionNav&&(n.customDirectionNav=2===$(n.vars.customDirectionNav).length&&$(n.vars.customDirectionNav)),n.vars.randomize&&(n.slides.sort(function(){return Math.round(Math.random())-.5}),n.container.empty().append(n.slides)),n.doMath(),n.setup("init"),n.vars.controlNav&&f.controlNav.setup(),n.vars.directionNav&&f.directionNav.setup(),n.vars.keyboard&&(1===$(n.containerSelector).length||n.vars.multipleKeyboard)&&$(document).bind("keyup",function(e){var t=e.keyCode;if(!n.animating&&(39===t||37===t)){var a=39===t?n.getTarget("next"):37===t&&n.getTarget("prev");n.flexAnimate(a,n.vars.pauseOnAction)}}),n.vars.mousewheel&&n.bind("mousewheel",function(e,t,a,i){e.preventDefault();var r=t<0?n.getTarget("next"):n.getTarget("prev");n.flexAnimate(r,n.vars.pauseOnAction)}),n.vars.pausePlay&&f.pausePlay.setup(),n.vars.slideshow&&n.vars.pauseInvisible&&f.pauseInvisible.init(),n.vars.slideshow&&(n.vars.pauseOnHover&&n.hover(function(){n.manualPlay||n.manualPause||n.pause()},function(){n.manualPause||n.manualPlay||n.stopped||n.play()}),n.vars.pauseInvisible&&f.pauseInvisible.isHidden()||(n.vars.initDelay>0?n.startTimeout=setTimeout(n.play,n.vars.initDelay):n.play())),m&&f.asNav.setup(),s&&n.vars.touch&&f.touch(),(!p||p&&n.vars.smoothHeight)&&$(window).bind("resize orientationchange focus",f.resize()),n.find("img").attr("draggable","false"),setTimeout(function(){n.vars.start(n)},200)},asNav:{setup:function(){n.asNav=!0,n.animatingTo=Math.floor(n.currentSlide/n.move),n.currentItem=n.currentSlide,n.slides.removeClass(i+"active-slide").eq(n.currentItem).addClass(i+"active-slide"),r?(t._slider=n,n.slides.each(function(){var e=this;e._gesture=new MSGesture,e._gesture.target=e,e.addEventListener("MSPointerDown",function(e){e.preventDefault(),e.currentTarget._gesture&&e.currentTarget._gesture.addPointer(e.pointerId)},!1),e.addEventListener("MSGestureTap",function(e){e.preventDefault();var t=$(this),a=t.index();$(n.vars.asNavFor).data("flexslider").animating||t.hasClass("active")||(n.direction=n.currentItem<a?"next":"prev",n.flexAnimate(a,n.vars.pauseOnAction,!1,!0,!0))})})):n.slides.on(o,function(e){e.preventDefault();var t=$(this),a=t.index();t.offset().left-$(n).scrollLeft()<=0&&t.hasClass(i+"active-slide")?n.flexAnimate(n.getTarget("prev"),!0):$(n.vars.asNavFor).data("flexslider").animating||t.hasClass(i+"active-slide")||(n.direction=n.currentItem<a?"next":"prev",n.flexAnimate(a,n.vars.pauseOnAction,!1,!0,!0))})}},controlNav:{setup:function(){n.manualControls?f.controlNav.setupManual():f.controlNav.setupPaging()},setupPaging:function(){var e="thumbnails"===n.vars.controlNav?"control-thumbs":"control-paging",t=1,a,r;if(n.controlNavScaffold=$('<ol class="'+i+"control-nav "+i+e+'"></ol>'),n.pagingCount>1)for(var s=0;s<n.pagingCount;s++){r=n.slides.eq(s),void 0===r.attr("data-thumb-alt")&&r.attr("data-thumb-alt","");var c=""!==r.attr("data-thumb-alt")?c=' alt="'+r.attr("data-thumb-alt")+'"':"";if(a="thumbnails"===n.vars.controlNav?'<img src="'+r.attr("data-thumb")+'"'+c+"/>":'<a href="#">'+t+"</a>","thumbnails"===n.vars.controlNav&&!0===n.vars.thumbCaptions){var d=r.attr("data-thumbcaption");""!==d&&void 0!==d&&(a+='<span class="'+i+'caption">'+d+"</span>")}n.controlNavScaffold.append("<li>"+a+"</li>"),t++}n.controlsContainer?$(n.controlsContainer).append(n.controlNavScaffold):n.append(n.controlNavScaffold),f.controlNav.set(),f.controlNav.active(),n.controlNavScaffold.delegate("a, img",o,function(e){if(e.preventDefault(),""===l||l===e.type){var t=$(this),a=n.controlNav.index(t);t.hasClass(i+"active")||(n.direction=a>n.currentSlide?"next":"prev",n.flexAnimate(a,n.vars.pauseOnAction))}""===l&&(l=e.type),f.setToClearWatchedEvent()})},setupManual:function(){n.controlNav=n.manualControls,f.controlNav.active(),n.controlNav.bind(o,function(e){if(e.preventDefault(),""===l||l===e.type){var t=$(this),a=n.controlNav.index(t);t.hasClass(i+"active")||(a>n.currentSlide?n.direction="next":n.direction="prev",n.flexAnimate(a,n.vars.pauseOnAction))}""===l&&(l=e.type),f.setToClearWatchedEvent()})},set:function(){var e="thumbnails"===n.vars.controlNav?"img":"a";n.controlNav=$("."+i+"control-nav li "+e,n.controlsContainer?n.controlsContainer:n)},active:function(){n.controlNav.removeClass(i+"active").eq(n.animatingTo).addClass(i+"active")},update:function(e,t){n.pagingCount>1&&"add"===e?n.controlNavScaffold.append($('<li><a href="#">'+n.count+"</a></li>")):1===n.pagingCount?n.controlNavScaffold.find("li").remove():n.controlNav.eq(t).closest("li").remove(),f.controlNav.set(),n.pagingCount>1&&n.pagingCount!==n.controlNav.length?n.update(t,e):f.controlNav.active()}},directionNav:{setup:function(){var e=$('<ul class="'+i+'direction-nav"><li class="'+i+'nav-prev"><a class="'+i+'prev" href="#">'+n.vars.prevText+'</a></li><li class="'+i+'nav-next"><a class="'+i+'next" href="#">'+n.vars.nextText+"</a></li></ul>");n.customDirectionNav?n.directionNav=n.customDirectionNav:n.controlsContainer?($(n.controlsContainer).append(e),n.directionNav=$("."+i+"direction-nav li a",n.controlsContainer)):(n.append(e),n.directionNav=$("."+i+"direction-nav li a",n)),f.directionNav.update(),n.directionNav.bind(o,function(e){e.preventDefault();var t;""!==l&&l!==e.type||(t=$(this).hasClass(i+"next")?n.getTarget("next"):n.getTarget("prev"),n.flexAnimate(t,n.vars.pauseOnAction)),""===l&&(l=e.type),f.setToClearWatchedEvent()})},update:function(){var e=i+"disabled";1===n.pagingCount?n.directionNav.addClass(e).attr("tabindex","-1"):n.vars.animationLoop?n.directionNav.removeClass(e).removeAttr("tabindex"):0===n.animatingTo?n.directionNav.removeClass(e).filter("."+i+"prev").addClass(e).attr("tabindex","-1"):n.animatingTo===n.last?n.directionNav.removeClass(e).filter("."+i+"next").addClass(e).attr("tabindex","-1"):n.directionNav.removeClass(e).removeAttr("tabindex")}},pausePlay:{setup:function(){var e=$('<div class="'+i+'pauseplay"><a href="#"></a></div>');n.controlsContainer?(n.controlsContainer.append(e),n.pausePlay=$("."+i+"pauseplay a",n.controlsContainer)):(n.append(e),n.pausePlay=$("."+i+"pauseplay a",n)),f.pausePlay.update(n.vars.slideshow?i+"pause":i+"play"),n.pausePlay.bind(o,function(e){e.preventDefault(),""!==l&&l!==e.type||($(this).hasClass(i+"pause")?(n.manualPause=!0,n.manualPlay=!1,n.pause()):(n.manualPause=!1,n.manualPlay=!0,n.play())),""===l&&(l=e.type),f.setToClearWatchedEvent()})},update:function(e){"play"===e?n.pausePlay.removeClass(i+"pause").addClass(i+"play").html(n.vars.playText):n.pausePlay.removeClass(i+"play").addClass(i+"pause").html(n.vars.pauseText)}},touch:function(){function e(e){e.stopPropagation(),n.animating?e.preventDefault():(n.pause(),t._gesture.addPointer(e.pointerId),T=0,c=d?n.h:n.w,f=Number(new Date),l=v&&u&&n.animatingTo===n.last?0:v&&u?n.limit-(n.itemW+n.vars.itemMargin)*n.move*n.animatingTo:v&&n.currentSlide===n.last?n.limit:v?(n.itemW+n.vars.itemMargin)*n.move*n.currentSlide:u?(n.last-n.currentSlide+n.cloneOffset)*c:(n.currentSlide+n.cloneOffset)*c)}function a(e){e.stopPropagation();var a=e.target._slider;if(a){var n=-e.translationX,i=-e.translationY;if(T+=d?i:n,m=T,y=d?Math.abs(T)<Math.abs(-n):Math.abs(T)<Math.abs(-i),e.detail===e.MSGESTURE_FLAG_INERTIA)return void setImmediate(function(){t._gesture.stop()});(!y||Number(new Date)-f>500)&&(e.preventDefault(),!p&&a.transitions&&(a.vars.animationLoop||(m=T/(0===a.currentSlide&&T<0||a.currentSlide===a.last&&T>0?Math.abs(T)/c+2:1)),a.setProps(l+m,"setTouch")))}}function i(e){e.stopPropagation();var t=e.target._slider;if(t){if(t.animatingTo===t.currentSlide&&!y&&null!==m){var a=u?-m:m,n=a>0?t.getTarget("next"):t.getTarget("prev");t.canAdvance(n)&&(Number(new Date)-f<550&&Math.abs(a)>50||Math.abs(a)>c/2)?t.flexAnimate(n,t.vars.pauseOnAction):p||t.flexAnimate(t.currentSlide,t.vars.pauseOnAction,!0)}s=null,o=null,m=null,l=null,T=0}}var s,o,l,c,m,f,g,h,S,y=!1,x=0,b=0,T=0;r?(t.style.msTouchAction="none",t._gesture=new MSGesture,t._gesture.target=t,t.addEventListener("MSPointerDown",e,!1),t._slider=n,t.addEventListener("MSGestureChange",a,!1),t.addEventListener("MSGestureEnd",i,!1)):(g=function(e){n.animating?e.preventDefault():(window.navigator.msPointerEnabled||1===e.touches.length)&&(n.pause(),c=d?n.h:n.w,f=Number(new Date),x=e.touches[0].pageX,b=e.touches[0].pageY,l=v&&u&&n.animatingTo===n.last?0:v&&u?n.limit-(n.itemW+n.vars.itemMargin)*n.move*n.animatingTo:v&&n.currentSlide===n.last?n.limit:v?(n.itemW+n.vars.itemMargin)*n.move*n.currentSlide:u?(n.last-n.currentSlide+n.cloneOffset)*c:(n.currentSlide+n.cloneOffset)*c,s=d?b:x,o=d?x:b,t.addEventListener("touchmove",h,!1),t.addEventListener("touchend",S,!1))},h=function(e){x=e.touches[0].pageX,b=e.touches[0].pageY,m=d?s-b:s-x,y=d?Math.abs(m)<Math.abs(x-o):Math.abs(m)<Math.abs(b-o);var t=500;(!y||Number(new Date)-f>500)&&(e.preventDefault(),!p&&n.transitions&&(n.vars.animationLoop||(m/=0===n.currentSlide&&m<0||n.currentSlide===n.last&&m>0?Math.abs(m)/c+2:1),n.setProps(l+m,"setTouch")))},S=function(e){if(t.removeEventListener("touchmove",h,!1),n.animatingTo===n.currentSlide&&!y&&null!==m){var a=u?-m:m,i=a>0?n.getTarget("next"):n.getTarget("prev");n.canAdvance(i)&&(Number(new Date)-f<550&&Math.abs(a)>50||Math.abs(a)>c/2)?n.flexAnimate(i,n.vars.pauseOnAction):p||n.flexAnimate(n.currentSlide,n.vars.pauseOnAction,!0)}t.removeEventListener("touchend",S,!1),s=null,o=null,m=null,l=null},t.addEventListener("touchstart",g,!1))},resize:function(){!n.animating&&n.is(":visible")&&(v||n.doMath(),p?f.smoothHeight():v?(n.slides.width(n.computedW),n.update(n.pagingCount),n.setProps()):d?(n.viewport.height(n.h),n.setProps(n.h,"setTotal")):(n.vars.smoothHeight&&f.smoothHeight(),n.newSlides.width(n.computedW),n.setProps(n.computedW,"setTotal")))},smoothHeight:function(e){if(!d||p){var t=p?n:n.viewport;e?t.animate({height:n.slides.eq(n.animatingTo).innerHeight()},e):t.innerHeight(n.slides.eq(n.animatingTo).innerHeight())}},sync:function(e){var t=$(n.vars.sync).data("flexslider"),a=n.animatingTo;switch(e){case"animate":t.flexAnimate(a,n.vars.pauseOnAction,!1,!0);break;case"play":t.playing||t.asNav||t.play();break;case"pause":t.pause();break}},uniqueID:function(e){return e.filter("[id]").add(e.find("[id]")).each(function(){var e=$(this);e.attr("id",e.attr("id")+"_clone")}),e},pauseInvisible:{visProp:null,init:function(){var e=f.pauseInvisible.getHiddenProp();if(e){var t=e.replace(/[H|h]idden/,"")+"visibilitychange";document.addEventListener(t,function(){f.pauseInvisible.isHidden()?n.startTimeout?clearTimeout(n.startTimeout):n.pause():n.started?n.play():n.vars.initDelay>0?setTimeout(n.play,n.vars.initDelay):n.play()})}},isHidden:function(){var e=f.pauseInvisible.getHiddenProp();return!!e&&document[e]},getHiddenProp:function(){var e=["webkit","moz","ms","o"];if("hidden"in document)return"hidden";for(var t=0;t<e.length;t++)if(e[t]+"Hidden"in document)return e[t]+"Hidden";return null}},setToClearWatchedEvent:function(){clearTimeout(c),c=setTimeout(function(){l=""},3e3)}},n.flexAnimate=function(e,t,a,r,o){if(n.vars.animationLoop||e===n.currentSlide||(n.direction=e>n.currentSlide?"next":"prev"),m&&1===n.pagingCount&&(n.direction=n.currentItem<e?"next":"prev"),!n.animating&&(n.canAdvance(e,o)||a)&&n.is(":visible")){if(m&&r){var l=$(n.vars.asNavFor).data("flexslider");if(n.atEnd=0===e||e===n.count-1,l.flexAnimate(e,!0,!1,!0,o),n.direction=n.currentItem<e?"next":"prev",l.direction=n.direction,Math.ceil((e+1)/n.visible)-1===n.currentSlide||0===e)return n.currentItem=e,n.slides.removeClass(i+"active-slide").eq(e).addClass(i+"active-slide"),!1;n.currentItem=e,n.slides.removeClass(i+"active-slide").eq(e).addClass(i+"active-slide"),e=Math.floor(e/n.visible)}if(n.animating=!0,n.animatingTo=e,t&&n.pause(),n.vars.before(n),n.syncExists&&!o&&f.sync("animate"),n.vars.controlNav&&f.controlNav.active(),v||n.slides.removeClass(i+"active-slide").eq(e).addClass(i+"active-slide"),n.atEnd=0===e||e===n.last,n.vars.directionNav&&f.directionNav.update(),e===n.last&&(n.vars.end(n),n.vars.animationLoop||n.pause()),p)s?(n.slides.eq(n.currentSlide).css({opacity:0,zIndex:1}),n.slides.eq(e).css({opacity:1,zIndex:2}),n.wrapup(c)):(n.slides.eq(n.currentSlide).css({zIndex:1}).animate({opacity:0},n.vars.animationSpeed,n.vars.easing),n.slides.eq(e).css({zIndex:2}).animate({opacity:1},n.vars.animationSpeed,n.vars.easing,n.wrapup));else{var c=d?n.slides.filter(":first").height():n.computedW,g,h,S;v?(g=n.vars.itemMargin,S=(n.itemW+g)*n.move*n.animatingTo,h=S>n.limit&&1!==n.visible?n.limit:S):h=0===n.currentSlide&&e===n.count-1&&n.vars.animationLoop&&"next"!==n.direction?u?(n.count+n.cloneOffset)*c:0:n.currentSlide===n.last&&0===e&&n.vars.animationLoop&&"prev"!==n.direction?u?0:(n.count+1)*c:u?(n.count-1-e+n.cloneOffset)*c:(e+n.cloneOffset)*c,n.setProps(h,"",n.vars.animationSpeed),n.transitions?(n.vars.animationLoop&&n.atEnd||(n.animating=!1,n.currentSlide=n.animatingTo),n.container.unbind("webkitTransitionEnd transitionend"),n.container.bind("webkitTransitionEnd transitionend",function(){clearTimeout(n.ensureAnimationEnd),n.wrapup(c)}),clearTimeout(n.ensureAnimationEnd),n.ensureAnimationEnd=setTimeout(function(){n.wrapup(c)},n.vars.animationSpeed+100)):n.container.animate(n.args,n.vars.animationSpeed,n.vars.easing,function(){n.wrapup(c)})}n.vars.smoothHeight&&f.smoothHeight(n.vars.animationSpeed)}},n.wrapup=function(e){p||v||(0===n.currentSlide&&n.animatingTo===n.last&&n.vars.animationLoop?n.setProps(e,"jumpEnd"):n.currentSlide===n.last&&0===n.animatingTo&&n.vars.animationLoop&&n.setProps(e,"jumpStart")),n.animating=!1,n.currentSlide=n.animatingTo,n.vars.after(n)},n.animateSlides=function(){!n.animating&&e&&n.flexAnimate(n.getTarget("next"))},n.pause=function(){clearInterval(n.animatedSlides),n.animatedSlides=null,n.playing=!1,n.vars.pausePlay&&f.pausePlay.update("play"),n.syncExists&&f.sync("pause")},n.play=function(){n.playing&&clearInterval(n.animatedSlides),n.animatedSlides=n.animatedSlides||setInterval(n.animateSlides,n.vars.slideshowSpeed),n.started=n.playing=!0,n.vars.pausePlay&&f.pausePlay.update("pause"),n.syncExists&&f.sync("play")},n.stop=function(){n.pause(),n.stopped=!0},n.canAdvance=function(e,t){var a=m?n.pagingCount-1:n.last;return!!t||(!(!m||n.currentItem!==n.count-1||0!==e||"prev"!==n.direction)||(!m||0!==n.currentItem||e!==n.pagingCount-1||"next"===n.direction)&&(!(e===n.currentSlide&&!m)&&(!!n.vars.animationLoop||(!n.atEnd||0!==n.currentSlide||e!==a||"next"===n.direction)&&(!n.atEnd||n.currentSlide!==a||0!==e||"next"!==n.direction))))},n.getTarget=function(e){return n.direction=e,"next"===e?n.currentSlide===n.last?0:n.currentSlide+1:0===n.currentSlide?n.last:n.currentSlide-1},n.setProps=function(e,t,a){var i=function(){var a=e||(n.itemW+n.vars.itemMargin)*n.move*n.animatingTo;return-1*function(){if(v)return"setTouch"===t?e:u&&n.animatingTo===n.last?0:u?n.limit-(n.itemW+n.vars.itemMargin)*n.move*n.animatingTo:n.animatingTo===n.last?n.limit:a;switch(t){case"setTotal":return u?(n.count-1-n.currentSlide+n.cloneOffset)*e:(n.currentSlide+n.cloneOffset)*e;case"setTouch":return e;case"jumpEnd":return u?e:n.count*e;case"jumpStart":return u?n.count*e:e;default:return e}}()+"px"}();n.transitions&&(i=d?"translate3d(0,"+i+",0)":"translate3d("+i+",0,0)",a=void 0!==a?a/1e3+"s":"0s",n.container.css("-"+n.pfx+"-transition-duration",a),n.container.css("transition-duration",a)),n.args[n.prop]=i,(n.transitions||void 0===a)&&n.container.css(n.args),n.container.css("transform",i)},n.setup=function(e){if(p)n.slides.css({width:"100%",float:"left",marginRight:"-100%",position:"relative"}),"init"===e&&(s?n.slides.css({opacity:0,display:"block",webkitTransition:"opacity "+n.vars.animationSpeed/1e3+"s ease",zIndex:1}).eq(n.currentSlide).css({opacity:1,zIndex:2}):0==n.vars.fadeFirstSlide?n.slides.css({opacity:0,display:"block",zIndex:1}).eq(n.currentSlide).css({zIndex:2}).css({opacity:1}):n.slides.css({opacity:0,display:"block",zIndex:1}).eq(n.currentSlide).css({zIndex:2}).animate({opacity:1},n.vars.animationSpeed,n.vars.easing)),n.vars.smoothHeight&&f.smoothHeight();else{var t,a;"init"===e&&(n.viewport=$('<div class="'+i+'viewport"></div>').css({overflow:"hidden",position:"relative"}).appendTo(n).append(n.container),n.cloneCount=0,n.cloneOffset=0,u&&(a=$.makeArray(n.slides).reverse(),n.slides=$(a),n.container.empty().append(n.slides))),n.vars.animationLoop&&!v&&(n.cloneCount=2,n.cloneOffset=1,"init"!==e&&n.container.find(".clone").remove(),n.container.append(f.uniqueID(n.slides.first().clone().addClass("clone")).attr("aria-hidden","true")).prepend(f.uniqueID(n.slides.last().clone().addClass("clone")).attr("aria-hidden","true"))),n.newSlides=$(n.vars.selector,n),t=u?n.count-1-n.currentSlide+n.cloneOffset:n.currentSlide+n.cloneOffset,d&&!v?(n.container.height(200*(n.count+n.cloneCount)+"%").css("position","absolute").width("100%"),setTimeout(function(){n.newSlides.css({display:"block"}),n.doMath(),n.viewport.height(n.h),n.setProps(t*n.h,"init")},"init"===e?100:0)):(n.container.width(200*(n.count+n.cloneCount)+"%"),n.setProps(t*n.computedW,"init"),setTimeout(function(){n.doMath(),n.newSlides.css({width:n.computedW,marginRight:n.computedM,float:"left",display:"block"}),n.vars.smoothHeight&&f.smoothHeight()},"init"===e?100:0))}v||n.slides.removeClass(i+"active-slide").eq(n.currentSlide).addClass(i+"active-slide"),n.vars.init(n)},n.doMath=function(){var e=n.slides.first(),t=n.vars.itemMargin,a=n.vars.minItems,i=n.vars.maxItems;n.w=void 0===n.viewport?n.width():n.viewport.width(),n.h=e.height(),n.boxPadding=e.outerWidth()-e.width(),v?(n.itemT=n.vars.itemWidth+t,n.itemM=t,n.minW=a?a*n.itemT:n.w,n.maxW=i?i*n.itemT-t:n.w,n.itemW=n.minW>n.w?(n.w-t*(a-1))/a:n.maxW<n.w?(n.w-t*(i-1))/i:n.vars.itemWidth>n.w?n.w:n.vars.itemWidth,n.visible=Math.floor(n.w/n.itemW),n.move=n.vars.move>0&&n.vars.move<n.visible?n.vars.move:n.visible,n.pagingCount=Math.ceil((n.count-n.visible)/n.move+1),n.last=n.pagingCount-1,n.limit=1===n.pagingCount?0:n.vars.itemWidth>n.w?n.itemW*(n.count-1)+t*(n.count-1):(n.itemW+t)*n.count-n.w-t):(n.itemW=n.w,n.itemM=t,n.pagingCount=n.count,n.last=n.count-1),n.computedW=n.itemW-n.boxPadding,n.computedM=n.itemM},n.update=function(e,t){n.doMath(),v||(e<n.currentSlide?n.currentSlide+=1:e<=n.currentSlide&&0!==e&&(n.currentSlide-=1),n.animatingTo=n.currentSlide),n.vars.controlNav&&!n.manualControls&&("add"===t&&!v||n.pagingCount>n.controlNav.length?f.controlNav.update("add"):("remove"===t&&!v||n.pagingCount<n.controlNav.length)&&(v&&n.currentSlide>n.last&&(n.currentSlide-=1,n.animatingTo-=1),f.controlNav.update("remove",n.last))),n.vars.directionNav&&f.directionNav.update()},n.addSlide=function(e,t){var a=$(e);n.count+=1,n.last=n.count-1,d&&u?void 0!==t?n.slides.eq(n.count-t).after(a):n.container.prepend(a):void 0!==t?n.slides.eq(t).before(a):n.container.append(a),n.update(t,"add"),n.slides=$(n.vars.selector+":not(.clone)",n),n.setup(),n.vars.added(n)},n.removeSlide=function(e){var t=isNaN(e)?n.slides.index($(e)):e;n.count-=1,n.last=n.count-1,isNaN(e)?$(e,n.slides).remove():d&&u?n.slides.eq(n.last).remove():n.slides.eq(e).remove(),n.doMath(),n.update(t,"remove"),n.slides=$(n.vars.selector+":not(.clone)",n),n.setup(),n.vars.removed(n)},f.init()},$(window).blur(function(t){e=!1}).focus(function(t){e=!0}),$.flexslider.defaults={namespace:"flex-",selector:".slides > li",animation:"fade",easing:"swing",direction:"horizontal",reverse:!1,animationLoop:!0,smoothHeight:!1,startAt:0,slideshow:!0,slideshowSpeed:7e3,animationSpeed:600,initDelay:0,randomize:!1,fadeFirstSlide:!0,thumbCaptions:!1,pauseOnAction:!0,pauseOnHover:!1,pauseInvisible:!0,useCSS:!0,touch:!0,video:!1,controlNav:!0,directionNav:!0,prevText:"Previous",nextText:"Next",keyboard:!0,multipleKeyboard:!1,mousewheel:!1,pausePlay:!1,pauseText:"Pause",playText:"Play",controlsContainer:"",manualControls:"",customDirectionNav:"",sync:"",asNavFor:"",itemWidth:0,itemMargin:0,minItems:1,maxItems:0,move:0,allowOneSlide:!0,start:function(){},before:function(){},after:function(){},end:function(){},added:function(){},removed:function(){},init:function(){}},$.fn.flexslider=function(e){if(void 0===e&&(e={}),"object"==typeof e)return this.each(function(){var t=$(this),a=e.selector?e.selector:".slides > li",n=t.find(a);1===n.length&&!1===e.allowOneSlide||0===n.length?(n.fadeIn(400),e.start&&e.start(t)):void 0===t.data("flexslider")&&new $.flexslider(this,e)});var t=$(this).data("flexslider");switch(e){case"play":t.play();break;case"pause":t.pause();break;case"stop":t.stop();break;case"next":t.flexAnimate(t.getTarget("next"),!0);break;case"prev":case"previous":t.flexAnimate(t.getTarget("prev"),!0);break;default:"number"==typeof e&&t.flexAnimate(e,!0)}}}(jQuery);
!function(t){"function"==typeof define&&define.amd?define(["jquery"],t):"object"==typeof exports?module.exports=t(require("jquery")):t(jQuery)}(function(t){function o(o,e){this.element=o,this.$element=t(this.element),this.doc=t(document),this.win=t(window),this.settings=t.extend({},n,e),"object"==typeof this.$element.data("tipso")&&t.extend(this.settings,this.$element.data("tipso"));for(var r=Object.keys(this.$element.data()),s={},d=0;d<r.length;d++){var l=r[d].replace(i,"");if(""!==l){l=l.charAt(0).toLowerCase()+l.slice(1),s[l]=this.$element.data(r[d]);for(var p in this.settings)p.toLowerCase()==l&&(this.settings[p]=s[l])}}this._defaults=n,this._name=i,this._title=this.$element.attr("title"),this.mode="hide",this.ieFade=!a,this.settings.preferedPosition=this.settings.position,this.init()}function e(o){var e=o.clone();e.css("visibility","hidden"),t("body").append(e);var r=e.outerHeight(),s=e.outerWidth();return e.remove(),{width:s,height:r}}function r(t){t.removeClass("top_right_corner bottom_right_corner top_left_corner bottom_left_corner"),t.find(".tipso_title").removeClass("top_right_corner bottom_right_corner top_left_corner bottom_left_corner")}function s(o){var i,n,a,d=o.tooltip(),l=o.$element,p=o,f=t(window),g=10,c=p.settings.background,h=p.titleContent();switch(void 0!==h&&""!==h&&(c=p.settings.titleBackground),l.parent().outerWidth()>f.outerWidth()&&(f=l.parent()),p.settings.position){case"top-right":n=l.offset().left+l.outerWidth(),i=l.offset().top-e(d).height-g,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i<f.scrollTop()?(i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({"border-bottom-color":c,"border-top-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("bottom_right_corner"),d.find(".tipso_title").addClass("bottom_right_corner"),d.find(".tipso_arrow").css({"border-left-color":c}),d.removeClass("top-right top bottom left right"),d.addClass("bottom")):(d.find(".tipso_arrow").css({"border-top-color":p.settings.background,"border-bottom-color":"transparent ","border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("top_right_corner"),d.find(".tipso_arrow").css({"border-left-color":p.settings.background}),d.removeClass("top bottom left right"),d.addClass("top"));break;case"top-left":n=l.offset().left-e(d).width,i=l.offset().top-e(d).height-g,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i<f.scrollTop()?(i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({"border-bottom-color":c,"border-top-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("bottom_left_corner"),d.find(".tipso_title").addClass("bottom_left_corner"),d.find(".tipso_arrow").css({"border-right-color":c}),d.removeClass("top-right top bottom left right"),d.addClass("bottom")):(d.find(".tipso_arrow").css({"border-top-color":p.settings.background,"border-bottom-color":"transparent ","border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("top_left_corner"),d.find(".tipso_arrow").css({"border-right-color":p.settings.background}),d.removeClass("top bottom left right"),d.addClass("top"));break;case"bottom-right":n=l.offset().left+l.outerWidth(),i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i+e(d).height>f.scrollTop()+f.outerHeight()?(i=l.offset().top-e(d).height-g,d.find(".tipso_arrow").css({"border-bottom-color":"transparent","border-top-color":p.settings.background,"border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("top_right_corner"),d.find(".tipso_title").addClass("top_left_corner"),d.find(".tipso_arrow").css({"border-left-color":p.settings.background}),d.removeClass("top-right top bottom left right"),d.addClass("top")):(d.find(".tipso_arrow").css({"border-top-color":"transparent","border-bottom-color":c,"border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("bottom_right_corner"),d.find(".tipso_title").addClass("bottom_right_corner"),d.find(".tipso_arrow").css({"border-left-color":c}),d.removeClass("top bottom left right"),d.addClass("bottom"));break;case"bottom-left":n=l.offset().left-e(d).width,i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i+e(d).height>f.scrollTop()+f.outerHeight()?(i=l.offset().top-e(d).height-g,d.find(".tipso_arrow").css({"border-bottom-color":"transparent","border-top-color":p.settings.background,"border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("top_left_corner"),d.find(".tipso_title").addClass("top_left_corner"),d.find(".tipso_arrow").css({"border-right-color":p.settings.background}),d.removeClass("top-right top bottom left right"),d.addClass("top")):(d.find(".tipso_arrow").css({"border-top-color":"transparent","border-bottom-color":c,"border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.addClass("bottom_left_corner"),d.find(".tipso_title").addClass("bottom_left_corner"),d.find(".tipso_arrow").css({"border-right-color":c}),d.removeClass("top bottom left right"),d.addClass("bottom"));break;case"top":n=l.offset().left+l.outerWidth()/2-e(d).width/2,i=l.offset().top-e(d).height-g,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i<f.scrollTop()?(i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({"border-bottom-color":c,"border-top-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass("bottom")):(d.find(".tipso_arrow").css({"border-top-color":p.settings.background,"border-bottom-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass("top"));break;case"bottom":n=l.offset().left+l.outerWidth()/2-e(d).width/2,i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i+e(d).height>f.scrollTop()+f.outerHeight()?(i=l.offset().top-e(d).height-g,d.find(".tipso_arrow").css({"border-top-color":p.settings.background,"border-bottom-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass("top")):(d.find(".tipso_arrow").css({"border-bottom-color":c,"border-top-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass(p.settings.position));break;case"left":n=l.offset().left-e(d).width-g,i=l.offset().top+l.outerHeight()/2-e(d).height/2,d.find(".tipso_arrow").css({marginTop:-p.settings.arrowWidth,marginLeft:""}),n<f.scrollLeft()?(n=l.offset().left+l.outerWidth()+g,d.find(".tipso_arrow").css({"border-right-color":p.settings.background,"border-left-color":"transparent","border-top-color":"transparent","border-bottom-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass("right")):(d.find(".tipso_arrow").css({"border-left-color":p.settings.background,"border-right-color":"transparent","border-top-color":"transparent","border-bottom-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass(p.settings.position));break;case"right":n=l.offset().left+l.outerWidth()+g,i=l.offset().top+l.outerHeight()/2-e(d).height/2,d.find(".tipso_arrow").css({marginTop:-p.settings.arrowWidth,marginLeft:""}),n+g+p.settings.width>f.scrollLeft()+f.outerWidth()?(n=l.offset().left-e(d).width-g,d.find(".tipso_arrow").css({"border-left-color":p.settings.background,"border-right-color":"transparent","border-top-color":"transparent","border-bottom-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass("left")):(d.find(".tipso_arrow").css({"border-right-color":p.settings.background,"border-left-color":"transparent","border-top-color":"transparent","border-bottom-color":"transparent"}),d.removeClass("top bottom left right"),d.addClass(p.settings.position))}if("top-right"===p.settings.position&&d.find(".tipso_arrow").css({"margin-left":-p.settings.width/2}),"top-left"===p.settings.position){var m=d.find(".tipso_arrow").eq(0);m.css({"margin-left":p.settings.width/2-2*p.settings.arrowWidth})}if("bottom-right"===p.settings.position){var m=d.find(".tipso_arrow").eq(0);m.css({"margin-left":-p.settings.width/2,"margin-top":""})}if("bottom-left"===p.settings.position){var m=d.find(".tipso_arrow").eq(0);m.css({"margin-left":p.settings.width/2-2*p.settings.arrowWidth,"margin-top":""})}n<f.scrollLeft()&&("bottom"===p.settings.position||"top"===p.settings.position)&&(d.find(".tipso_arrow").css({marginLeft:n-p.settings.arrowWidth}),n=0),n+p.settings.width>f.outerWidth()&&("bottom"===p.settings.position||"top"===p.settings.position)&&(a=f.outerWidth()-(n+p.settings.width),d.find(".tipso_arrow").css({marginLeft:-a-p.settings.arrowWidth,marginTop:""}),n+=a),n<f.scrollLeft()&&("left"===p.settings.position||"right"===p.settings.position||"top-right"===p.settings.position||"top-left"===p.settings.position||"bottom-right"===p.settings.position||"bottom-left"===p.settings.position)&&(n=l.offset().left+l.outerWidth()/2-e(d).width/2,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i=l.offset().top-e(d).height-g,i<f.scrollTop()?(i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({"border-bottom-color":c,"border-top-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),d.removeClass("top bottom left right"),r(d),d.addClass("bottom")):(d.find(".tipso_arrow").css({"border-top-color":p.settings.background,"border-bottom-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),d.removeClass("top bottom left right"),r(d),d.addClass("top")),n+p.settings.width>f.outerWidth()&&(a=f.outerWidth()-(n+p.settings.width),d.find(".tipso_arrow").css({marginLeft:-a-p.settings.arrowWidth,marginTop:""}),n+=a),n<f.scrollLeft()&&(d.find(".tipso_arrow").css({marginLeft:n-p.settings.arrowWidth}),n=0)),n+p.settings.width>f.outerWidth()&&("left"===p.settings.position||"right"===p.settings.position||"top-right"===p.settings.position||"top-left"===p.settings.position||"bottom-right"===p.settings.position||"bottom-right"===p.settings.position)&&(n=l.offset().left+l.outerWidth()/2-e(d).width/2,d.find(".tipso_arrow").css({marginLeft:-p.settings.arrowWidth,marginTop:""}),i=l.offset().top-e(d).height-g,i<f.scrollTop()?(i=l.offset().top+l.outerHeight()+g,d.find(".tipso_arrow").css({"border-bottom-color":c,"border-top-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.removeClass("top bottom left right"),d.addClass("bottom")):(d.find(".tipso_arrow").css({"border-top-color":p.settings.background,"border-bottom-color":"transparent","border-left-color":"transparent","border-right-color":"transparent"}),r(d),d.removeClass("top bottom left right"),d.addClass("top")),n+p.settings.width>f.outerWidth()&&(a=f.outerWidth()-(n+p.settings.width),d.find(".tipso_arrow").css({marginLeft:-a-p.settings.arrowWidth,marginTop:""}),n+=a),n<f.scrollLeft()&&(d.find(".tipso_arrow").css({marginLeft:n-p.settings.arrowWidth}),n=0)),d.css({left:n+p.settings.offsetX,top:i+p.settings.offsetY}),i<f.scrollTop()&&("right"===p.settings.position||"left"===p.settings.position)&&(l.tipso("update","position","bottom"),s(p)),i+e(d).height>f.scrollTop()+f.outerHeight()&&("right"===p.settings.position||"left"===p.settings.position)&&(l.tipso("update","position","top"),s(p))}var i="tipso",n={speed:400,background:"#55b555",titleBackground:"#333333",color:"#ffffff",titleColor:"#ffffff",titleContent:"",showArrow:!0,position:"top",width:200,maxWidth:"",delay:200,hideDelay:0,animationIn:"",animationOut:"",offsetX:0,offsetY:0,arrowWidth:8,tooltipHover:!1,content:null,ajaxContentUrl:null,ajaxContentBuffer:0,contentElementId:null,useTitle:!1,templateEngineFunc:null,onBeforeShow:null,onShow:null,onHide:null};t.extend(o.prototype,{init:function(){{var t=this,o=this.$element;this.doc}if(o.addClass("tipso_style").removeAttr("title"),t.settings.tooltipHover){var e=null,r=null;o.on("mouseover."+i,function(){clearTimeout(e),clearTimeout(r),r=setTimeout(function(){t.show()},150)}),o.on("mouseout."+i,function(){clearTimeout(e),clearTimeout(r),e=setTimeout(function(){t.hide()},200),t.tooltip().on("mouseover."+i,function(){t.mode="tooltipHover"}).on("mouseout."+i,function(){t.mode="show",clearTimeout(e),e=setTimeout(function(){t.hide()},200)})})}else o.on("mouseover."+i,function(){t.show()}),o.on("mouseout."+i,function(){t.hide()});t.settings.ajaxContentUrl&&(t.ajaxContent=null)},tooltip:function(){return this.tipso_bubble||(this.tipso_bubble=t('<div class="tipso_bubble"><div class="tipso_title"></div><div class="tipso_content"></div><div class="tipso_arrow"></div></div>')),this.tipso_bubble},show:function(){var o=this.tooltip(),e=this,r=this.win;e.settings.showArrow===!1?o.find(".tipso_arrow").hide():o.find(".tipso_arrow").show(),"hide"===e.mode&&(t.isFunction(e.settings.onBeforeShow)&&e.settings.onBeforeShow(e.$element,e.element,e),e.settings.size&&o.addClass(e.settings.size),e.settings.width?o.css({background:e.settings.background,color:e.settings.color,width:e.settings.width}).hide():e.settings.maxWidth?o.css({background:e.settings.background,color:e.settings.color,maxWidth:e.settings.maxWidth}).hide():o.css({background:e.settings.background,color:e.settings.color,width:200}).hide(),o.find(".tipso_title").css({background:e.settings.titleBackground,color:e.settings.titleColor}),o.find(".tipso_content").html(e.content()),o.find(".tipso_title").html(e.titleContent()),s(e),r.on("resize."+i,function(){e.settings.position=e.settings.preferedPosition,s(e)}),window.clearTimeout(e.timeout),e.timeout=null,e.timeout=window.setTimeout(function(){e.ieFade||""===e.settings.animationIn||""===e.settings.animationOut?o.appendTo("body").stop(!0,!0).fadeIn(e.settings.speed,function(){e.mode="show",t.isFunction(e.settings.onShow)&&e.settings.onShow(e.$element,e.element,e)}):o.remove().appendTo("body").stop(!0,!0).removeClass("animated "+e.settings.animationOut).addClass("noAnimation").removeClass("noAnimation").addClass("animated "+e.settings.animationIn).fadeIn(e.settings.speed,function(){t(this).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){t(this).removeClass("animated "+e.settings.animationIn)}),e.mode="show",t.isFunction(e.settings.onShow)&&e.settings.onShow(e.$element,e.element,e),r.off("resize."+i,null,"tipsoResizeHandler")})},e.settings.delay))},hide:function(o){var e=this,r=this.win,s=this.tooltip(),n=e.settings.hideDelay;o&&(n=0,e.mode="show"),window.clearTimeout(e.timeout),e.timeout=null,e.timeout=window.setTimeout(function(){"tooltipHover"!==e.mode&&(e.ieFade||""===e.settings.animationIn||""===e.settings.animationOut?s.stop(!0,!0).fadeOut(e.settings.speed,function(){t(this).remove(),t.isFunction(e.settings.onHide)&&"show"===e.mode&&e.settings.onHide(e.$element,e.element,e),e.mode="hide",r.off("resize."+i,null,"tipsoResizeHandler")}):s.stop(!0,!0).removeClass("animated "+e.settings.animationIn).addClass("noAnimation").removeClass("noAnimation").addClass("animated "+e.settings.animationOut).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){t(this).removeClass("animated "+e.settings.animationOut).remove(),t.isFunction(e.settings.onHide)&&"show"===e.mode&&e.settings.onHide(e.$element,e.element,e),e.mode="hide",r.off("resize."+i,null,"tipsoResizeHandler")}))},n)},close:function(){this.hide(!0)},destroy:function(){{var t=this.$element,o=this.win;this.doc}t.off("."+i),o.off("resize."+i,null,"tipsoResizeHandler"),t.removeData(i),t.removeClass("tipso_style").attr("title",this._title)},titleContent:function(){var t,o=this.$element,e=this;return t=e.settings.titleContent?e.settings.titleContent:o.data("tipso-title")},content:function(){var o,e=this.$element,r=this,s=this._title;return r.settings.ajaxContentUrl?r._ajaxContent?o=r._ajaxContent:(r._ajaxContent=o=t.ajax({type:"GET",url:r.settings.ajaxContentUrl,async:!1}).responseText,r.settings.ajaxContentBuffer>0?setTimeout(function(){r._ajaxContent=null},r.settings.ajaxContentBuffer):r._ajaxContent=null):r.settings.contentElementId?o=t("#"+r.settings.contentElementId).text():r.settings.content?o=r.settings.content:r.settings.useTitle===!0?o=s:"string"==typeof e.data("tipso")&&(o=e.data("tipso")),null!==r.settings.templateEngineFunc&&(o=r.settings.templateEngineFunc(o)),o},update:function(t,o){var e=this;return o?void(e.settings[t]=o):e.settings[t]}});var a=function(){var t=document.createElement("p").style,o=["ms","O","Moz","Webkit"];if(""===t.transition)return!0;for(;o.length;)if(o.pop()+"Transition"in t)return!0;return!1}();t[i]=t.fn[i]=function(e){var r=arguments;if(void 0===e||"object"==typeof e)return this instanceof t||t.extend(n,e),this.each(function(){t.data(this,"plugin_"+i)||t.data(this,"plugin_"+i,new o(this,e))});if("string"==typeof e&&"_"!==e[0]&&"init"!==e){var s;return this.each(function(){var n=t.data(this,"plugin_"+i);n||(n=t.data(this,"plugin_"+i,new o(this,e))),n instanceof o&&"function"==typeof n[e]&&(s=n[e].apply(n,Array.prototype.slice.call(r,1))),"destroy"===e&&t.data(this,"plugin_"+i,null)}),void 0!==s?s:this}}});
var myTooltip = function() {
    $('[data-toggle=tooltip]').tipso({
        background: '#4A4A4A',
        size: 'small',
        delay: 100,
        speed: 100,
        onBeforeShow: function (ele, tipso) {
            this.content = ele.data('original-title');
        }
    });
}();

(function () {
  var $notyfi_btn=$('.header-logo_noty');
  if($notyfi_btn.length==1)return;

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
        $('.header').toggleClass('header_open-menu');
        $('.drop-menu').removeClass('open').removeClass('close').find('li').removeClass('open').removeClass('close');
        if ($('.header').hasClass('header_open-menu')) {
            $('.header').removeClass('header-search-open');
        }
    });
    $('.search-toggle').click(function(e) {
        e.preventDefault();
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
        }
    });

    $('.header-search_form-button').click(function(e){
        e.preventDefault();
        $(this).closest('form').submit();
    });



    $('.header-secondline_close').click(function(e){
        $('.header').removeClass('header_open-menu');
    });

    $('.header-upline').on('mouseover', function(e){
        $('.header-secondline').removeClass('scroll-down');
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
    $('.account-menu-toggle').click(function(e){
        e.preventDefault();
        var menu = $('.account-menu');
        if (menu) {
            clearTimeout(accountMenuTimeOut);
            menu.toggleClass('hidden');
            if (!menu.hasClass('hidden')) {
                accountMenuTimeOut = setTimeout(function () {
                    menu.addClass('hidden');
                }, 7000);
            }
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
            $(openAutocomplete).hide();
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
        var expired = $(this).closest('.coupons-list_item').find('.clock-expired');
        if (expired.length > 0) {
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
(function(){
   $('.catalog-categories_tree-toggle').on('click', function(){
       $('.catalog-categories_tree-cat').toggleClass('catalog-categories_tree-cat-open');
       $('.catalog-categories_tree-toggle').toggleClass('catalog-categories_tree-toggle-open');
   });
   $('.catalog-categories_tree-cat-close').on('click', function(){
       $('.catalog-categories_tree-cat').toggleClass('catalog-categories_tree-cat-open');
       $('.catalog-categories_tree-toggle').toggleClass('catalog-categories_tree-toggle-open');
   });
})();
var notification = (function() {
  var conteiner;
  var mouseOver = 0;
  var timerClearAll = null;
  var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
  var time = 10000;

  var notification_box =false;
  var is_init=false;
  var confirm_opt={
    title:"Удаление",
    question:"Вы действительно хотите удалить?",
    buttonYes:"Да",
    buttonNo:"Нет",
    callbackYes:false,
    callbackNo:false,
    obj:false,
    buttonTag:'div',
    buttonYesDop:'',
    buttonNoDop:'',
  };
  var alert_opt={
    title:"",
    question:"Сообщение",
    buttonYes:"Да",
    callbackYes:false,
    buttonTag:'div',
    obj:false,
  };


  function init(){
    is_init=true;
    notification_box=$('.notification_box');
    if(notification_box.length>0)return;

    $('body').append("<div class='notification_box'></div>");
    notification_box=$('.notification_box');

    notification_box.on('click','.notify_control',closeModal);
    notification_box.on('click','.notify_close',closeModal);
    notification_box.on('click',closeModalFon);
  }

  function closeModal(){
    $('html').removeClass('show_notifi');
    $('.notification_box .notify_content').html('')
  }

  function closeModalFon(e){
    var target = e.target || e.srcElement;
    if(target.className=="notification_box"){
      closeModal();
    }
  }

  var _setUpListeners = function() {
    $('body').on('click', '.notification_close', _closePopup);
    $('body').on('mouseenter', '.notification_container', _onEnter);
    $('body').on('mouseleave', '.notification_container', _onLeave);
  };

  var _onEnter = function(event) {
    if(event)event.preventDefault();
    if (timerClearAll!=null) {
      clearTimeout(timerClearAll);
      timerClearAll = null;
    }
    conteiner.find('.notification_item').each(function(i){
      var option=$(this).data('option');
      if(option.timer) {
        clearTimeout(option.timer);
      }
    });
    mouseOver = 1;
  };

  var _onLeave = function() {
    conteiner.find('.notification_item').each(function(i){
      $this=$(this);
      var option=$this.data('option');
      if(option.time>0) {
        option.timer = setTimeout(_closePopup.bind(option.close), option.time - 1500 + 100 * i);
        $this.data('option',option)
      }
    });
    mouseOver = 0;
  };

  var _closePopup = function(event) {
    if(event)event.preventDefault();

    var $this = $(this).parent();
    $this.on(animationEnd, function() {
      $(this).remove();
    });
    $this.addClass('notification_hide')
  };

  function alert(data){
    if(!data)data={};
    data=objects(alert_opt,data);

    if(!is_init)init();

    notyfy_class='notify_box ';
    if(data.notyfy_class)notyfy_class+=data.notyfy_class;

    box_html='<div class="'+notyfy_class+'">';
    box_html+='<div class="notify_title">';
    box_html+=data.title;
    box_html+='<span class="notify_close"></span>';
    box_html+='</div>';

    box_html+='<div class="notify_content">';
    box_html+=data.question;
    box_html+='</div>';

    if(data.buttonYes||data.buttonNo) {
      box_html += '<div class="notify_control">';
      if (data.buttonYes)box_html += '<'+data.buttonTag+' class="notify_btn_yes" '+data.buttonYesDop+'>' + data.buttonYes + '</'+data.buttonTag+'>';
      if (data.buttonNo)box_html += '<'+data.buttonTag+' class="notify_btn_no" '+data.buttonNoDop+'>' + data.buttonNo + '</'+data.buttonTag+'>';
      box_html += '</div>';
    };

    box_html+='</div>';
    notification_box.html(box_html);


    setTimeout(function() {
      $('html').addClass('show_notifi');
    },100)
  }

  function confirm(data){
    if(!data)data={};
    data=objects(confirm_opt,data);

    if(!is_init)init();

    box_html='<div class="notify_box">';
    box_html+='<div class="notify_title">';
    box_html+=data.title;
    box_html+='<span class="notify_close"></span>';
    box_html+='</div>';

    box_html+='<div class="notify_content">';
    box_html+=data.question;
    box_html+='</div>';

    if(data.buttonYes||data.buttonNo) {
      box_html += '<div class="notify_control">';
      if (data.buttonYes)box_html += '<div class="notify_btn_yes">' + data.buttonYes + '</div>';
      if (data.buttonNo)box_html += '<div class="notify_btn_no">' + data.buttonNo + '</div>';
      box_html += '</div>';
    }

    box_html+='</div>';
    notification_box.html(box_html);

    if(data.callbackYes!=false){
      notification_box.find('.notify_btn_yes').on('click',data.callbackYes.bind(data.obj));
    }
    if(data.callbackNo!=false){
      notification_box.find('.notify_btn_no').on('click',data.callbackNo.bind(data.obj));
    }

    setTimeout(function() {
      $('html').addClass('show_notifi');
    },100)

  }

  function notifi(data) {
    if(!data)data={};
    var option = {time : (data.time||data.time===0)?data.time:time};
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

    if (data.type){
      li.addClass('notification_item-' + data.type);
    }

    var close=$('<span/>',{
      class:'notification_close'
    });
    option.close=close;
    li.append(close);

    var content = $('<div/>',{
      class:"notification_content"
    });

    if(data.title && data.title.length>0) {
      var title = $('<h5/>', {
        class: "notification_title"
      });
      title.html(data.title);
      content.append(title);
    }

    var text= $('<div/>',{
      class:"notification_text"
    });
    text.html(data.message);

    if(data.img && data.img.length>0) {
      var img = $('<div/>', {
        class: "notification_img"
      });
      img.css('background-image','url('+data.img+')');
      var wrap = $('<div/>', {
        class: "wrap"
      });

      wrap.append(img);
      wrap.append(text);
      content.append(wrap);
    }else{
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

    if(option.time>0){
      option.timer=setTimeout(_closePopup.bind(close), option.time);
    }
    li.data('option',option)
  }

  return {
    alert: alert,
    confirm: confirm,
    notifi: notifi,
  };

})();


$('[ref=popup]').on('click',function (e){
  e.preventDefault();
  $this=$(this);
  el=$($this.attr('href'));
  data=el.data();

  data.question=el.html();
  notification.alert(data);
});


$('.disabled').on('click',function (e){
  e.preventDefault();
  $this=$(this);
  data=$this.data();
  if(data['button_yes'])data['buttonYes']=data['button_yes']

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

        href=this.href.split('#');
        href=href[href.length-1];

        data={
            buttonYes:false,
            notyfy_class:"loading "+(href.indexOf('video')===0?'modals-full_screen':'notify_white'),
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
  $(".shops .favorite-link").on('click',function(e) {
    e.preventDefault();

    var self = $(this);
    var type = self.attr("data-state"),
      affiliate_id = self.attr("data-affiliate-id");
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

    },'json').item_iconil(function() {
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
  $('.content-wrap img').height('auto');
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
  if(document.referrer.indexOf('secretdiscounter')<0)return;

  href=window.opener.location.href;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsImpxdWVyeS5mbGV4c2xpZGVyLW1pbi5qcyIsInRpcHNvLm1pbi5qcyIsInRvb2x0aXAuanMiLCJhY2NvdW50X25vdGlmaWNhdGlvbi5qcyIsInNsaWRlci5qcyIsImhlYWRlcl9tZW51X2FuZF9zZWFyY2guanMiLCJjYWxjLWNhc2hiYWNrLmpzIiwiYXV0b19oaWRlX2NvbnRyb2wuanMiLCJoaWRlX3Nob3dfYWxsLmpzIiwiY2xvY2suanMiLCJsaXN0X3R5cGVfc3dpdGNoZXIuanMiLCJzZWxlY3QuanMiLCJzZWFyY2guanMiLCJnb3RvLmpzIiwiYWNjb3VudC13aXRoZHJhdy5qcyIsImFqYXguanMiLCJkb2Jyby5qcyIsImxlZnQtbWVudS10b2dnbGUuanMiLCJub3RpZmljYXRpb24uanMiLCJtb2RhbHMuanMiLCJmb290ZXJfbWVudS5qcyIsInJhdGluZy5qcyIsImZhdm9yaXRlcy5qcyIsInNjcm9sbF90by5qcyIsImNvcHlfdG9fY2xpcGJvYXJkLmpzIiwiaW1nLmpzIiwicGFyZW50c19vcGVuX3dpbmRvd3MuanMiLCJmb3Jtcy5qcyIsImNvb2tpZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoOEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsib2JqZWN0cyA9IGZ1bmN0aW9uIChhLGIpIHtcclxuICAgIHZhciBjID0gYixcclxuICAgICAgICBrZXk7XHJcbiAgICBmb3IgKGtleSBpbiBhKSB7XHJcbiAgICAgICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYztcclxufTtcclxuXHJcbmZ1bmN0aW9uIGxvZ2luX3JlZGlyZWN0KG5ld19ocmVmKXtcclxuICAgIGhyZWY9bG9jYXRpb24uaHJlZjtcclxuICAgIGlmKGhyZWYuaW5kZXhPZignc3RvcmUnKT4wIHx8IGhyZWYuaW5kZXhPZignY291cG9uJyk+MCl7XHJcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgICBsb2NhdGlvbi5ocmVmPW5ld19ocmVmO1xyXG4gICAgfVxyXG59XHJcbiIsIihmdW5jdGlvbiAodywgZCwgJCkge1xyXG4gICAgdmFyIHNjcm9sbHNfYmxvY2sgPSAkKCcuc2Nyb2xsX2JveCcpO1xyXG5cclxuICAgIGlmKHNjcm9sbHNfYmxvY2subGVuZ3RoPT0wKSByZXR1cm47XHJcbiAgICAvLyQoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKS53cmFwQWxsKHNjcm9sbHNfYmxvY2spO1xyXG4gICAgJChzY3JvbGxzX2Jsb2NrKS53cmFwKCc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC13cmFwXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgaW5pdF9zY3JvbGwoKTtcclxuICAgIGNhbGNfc2Nyb2xsKCk7XHJcblxyXG4gICAgdmFyIHQxLHQyO1xyXG5cclxuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0MSk7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHQyKTtcclxuICAgICAgICB0MT1zZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLDMwMCk7XHJcbiAgICAgICAgdDI9c2V0VGltZW91dChjYWxjX3Njcm9sbCw4MDApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdF9zY3JvbGwoKSB7XHJcbiAgICAgICAgdmFyIGNvbnRyb2wgPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbFwiPjwvZGl2Pic7XHJcbiAgICAgICAgY29udHJvbD0kKGNvbnRyb2wpO1xyXG4gICAgICAgIGNvbnRyb2wuaW5zZXJ0QWZ0ZXIoc2Nyb2xsc19ibG9jayk7XHJcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTtcclxuXHJcbiAgICAgICAgc2Nyb2xsc19ibG9jay5wcmVwZW5kKCc8ZGl2IGNsYXNzPXNjcm9sbF9ib3gtbW92ZXI+PC9kaXY+Jyk7XHJcblxyXG4gICAgICAgIGNvbnRyb2wub24oJ2NsaWNrJywnLnNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcsZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICB2YXIgY29udHJvbCA9ICR0aGlzLnBhcmVudCgpO1xyXG4gICAgICAgICAgICB2YXIgaSA9ICR0aGlzLmluZGV4KCk7XHJcbiAgICAgICAgICAgIGlmKCR0aGlzLmhhc0NsYXNzKCdhY3RpdmUnKSlyZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnRyb2wuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGR4PWNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnKTtcclxuICAgICAgICAgICAgdmFyIGVsID0gY29udHJvbC5wcmV2KCk7XHJcbiAgICAgICAgICAgIGVsLmZpbmQoJy5zY3JvbGxfYm94LW1vdmVyJykuY3NzKCdtYXJnaW4tbGVmdCcsLWR4KmkpO1xyXG4gICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGkpO1xyXG5cclxuICAgICAgICAgICAgc3RvcFNjcm9sLmJpbmQoZWwpKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNjcm9sbHNfYmxvY2subGVuZ3RoOyBqKyspIHtcclxuICAgICAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGopO1xyXG4gICAgICAgIGVsLnBhcmVudCgpLmhvdmVyKHN0b3BTY3JvbC5iaW5kKGVsKSxzdGFydFNjcm9sLmJpbmQoZWwpKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdGFydFNjcm9sKCl7XHJcbiAgICAgICAgdmFyICR0aGlzPSQodGhpcyk7XHJcbiAgICAgICAgaWYoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLmJpbmQoJHRoaXMpLCAyMDAwKTtcclxuICAgICAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLHRpbWVvdXRJZClcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdG9wU2Nyb2woKXtcclxuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKTtcclxuICAgICAgICB2YXIgdGltZW91dElkPSR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpO1xyXG4gICAgICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsZmFsc2UpO1xyXG4gICAgICAgIGlmKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpIHx8ICF0aW1lb3V0SWQpcmV0dXJuO1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG5leHRfc2xpZGUoKSB7XHJcbiAgICAgICAgdmFyICR0aGlzPSQodGhpcyk7XHJcbiAgICAgICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJyxmYWxzZSk7XHJcbiAgICAgICAgaWYoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgY29udHJvbHM9JHRoaXMubmV4dCgpLmZpbmQoJz4qJyk7XHJcbiAgICAgICAgdmFyIGFjdGl2ZT0kdGhpcy5kYXRhKCdzbGlkZS1hY3RpdmUnKTtcclxuICAgICAgICB2YXIgcG9pbnRfY250PWNvbnRyb2xzLmxlbmd0aDtcclxuICAgICAgICBpZighYWN0aXZlKWFjdGl2ZT0wO1xyXG4gICAgICAgIGFjdGl2ZSsrO1xyXG4gICAgICAgIGlmKGFjdGl2ZT49cG9pbnRfY250KWFjdGl2ZT0wO1xyXG4gICAgICAgICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XHJcblxyXG4gICAgICAgIGNvbnRyb2xzLmVxKGFjdGl2ZSkuY2xpY2soKTtcclxuICAgICAgICBzdGFydFNjcm9sLmJpbmQoJHRoaXMpKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2FsY19zY3JvbGwoKSB7XHJcbiAgICAgICAgZm9yKGk9MDtpPHNjcm9sbHNfYmxvY2subGVuZ3RoO2krKykge1xyXG4gICAgICAgICAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGkpO1xyXG4gICAgICAgICAgICB2YXIgY29udHJvbCA9IGVsLm5leHQoKTtcclxuICAgICAgICAgICAgdmFyIHdpZHRoX21heCA9IGVsLmRhdGEoJ3Njcm9sbC13aWR0aC1tYXgnKTtcclxuICAgICAgICAgICAgdyA9IGVsLndpZHRoKCk7XHJcblxyXG4gICAgICAgICAgICAvL9C00LXQu9Cw0LXQvCDQutC+0L3RgtGA0L7Qu9GMINC+0LPRgNCw0L3QuNGH0LXQvdC40Y8g0YjQuNGA0LjQvdGLLiDQldGB0LvQuCDQv9GA0LXQstGL0YjQtdC90L4g0YLQviDQvtGC0LrQu9GO0YfQsNC10Lwg0YHQutGA0L7QuyDQuCDQv9C10YDQtdGF0L7QtNC40Lwg0Log0YHQu9C10LTRg9GO0YnQtdC80YMg0Y3Qu9C10LzQtdC90YLRg1xyXG4gICAgICAgICAgICBpZiAod2lkdGhfbWF4ICYmIHcgPiB3aWR0aF9tYXgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRyb2wucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcclxuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIG5vX2NsYXNzID0gZWwuZGF0YSgnc2Nyb2xsLWVsZW1ldC1pZ25vcmUtY2xhc3MnKTtcclxuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gZWwuZmluZCgnPionKS5ub3QoJy5zY3JvbGxfYm94LW1vdmVyJyk7XHJcbiAgICAgICAgICAgIGlmIChub19jbGFzcykge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5ub3QoJy4nICsgbm9fY2xhc3MpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8v0JXRgdC70Lgg0L3QtdGCINC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4gPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcclxuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGZfZWw9Y2hpbGRyZW4uZXEoMSk7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbl93ID0gZl9lbC5vdXRlcldpZHRoKCk7IC8v0LLRgdC10LPQviDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcclxuICAgICAgICAgICAgY2hpbGRyZW5fdys9cGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLWxlZnQnKSk7XHJcbiAgICAgICAgICAgIGNoaWxkcmVuX3crPXBhcnNlRmxvYXQoZl9lbC5jc3MoJ21hcmdpbi1yaWdodCcpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzY3JlYW5fY291bnQgPSBNYXRoLmZsb29yKHcgLyBjaGlsZHJlbl93KTtcclxuXHJcbiAgICAgICAgICAgIC8v0JXRgdC70Lgg0LLRgdC1INCy0LvQsNC30LjRgiDQvdCwINGN0LrRgNCw0L1cclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuIDw9IHNjcmVhbl9jb3VudCkge1xyXG4gICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcclxuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy/Qo9C20LUg0YLQvtGH0L3QviDQt9C90LDQtdC8INGH0YLQviDRgdC60YDQvtC7INC90YPQttC10L1cclxuICAgICAgICAgICAgZWwuYWRkQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBwb2ludF9jbnQgPSBjaGlsZHJlbi5sZW5ndGggLSBzY3JlYW5fY291bnQgKyAxO1xyXG4gICAgICAgICAgICAvL9C10YHQu9C4INC90LUg0L3QsNC00L4g0L7QsdC90L7QstC70Y/RgtGMINC60L7QvdGC0YDQvtC7INGC0L4g0LLRi9GF0L7QtNC40LwsINC90LUg0LfQsNCx0YvQstCw0Y8g0L7QsdC90L7QstC40YLRjCDRiNC40YDQuNC90YMg0LTQvtGH0LXRgNC90LjRhVxyXG4gICAgICAgICAgICBpZiAoY29udHJvbC5maW5kKCc+KicpLmxlbmd0aCA9PSBwb2ludF9jbnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhY3RpdmUgPSBlbC5kYXRhKCdzbGlkZS1hY3RpdmUnKTtcclxuICAgICAgICAgICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcclxuICAgICAgICAgICAgaWYgKGFjdGl2ZSA+PSBwb2ludF9jbnQpYWN0aXZlID0gcG9pbnRfY250IC0gMTtcclxuICAgICAgICAgICAgdmFyIG91dCA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvaW50X2NudDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnKyhqPT1hY3RpdmU/JyBhY3RpdmUnOicnKSsnXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb250cm9sLmh0bWwob3V0KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgYWN0aXZlKTtcclxuICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1jb3VudCcsIHBvaW50X2NudCk7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcclxuXHJcbiAgICAgICAgICAgIGlmKCFlbC5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKSl7XHJcbiAgICAgICAgICAgICAgICBzdGFydFNjcm9sLmJpbmQoZWwpKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0od2luZG93LCBkb2N1bWVudCwgalF1ZXJ5KSk7IiwidmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xyXG5cclxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcclxuXHJcbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAgICAgLyppZigkYWNjb3JkaW9uLmhhc0NsYXNzKCdhY2NvcmRpb24tb25seV9vbmUnKSl7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9Ki9cclxuICAgICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlVXAoMzAwKTtcclxuICAgICAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLW9ubHlfb25lJykpe1xyXG4gICAgICAgICAgICAkb3RoZXI9JCgnLmFjY29yZGlvbi1vbmx5X29uZScpO1xyXG4gICAgICAgICAgICAkb3RoZXIuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcclxuICAgICAgICAgICAgICAgIC5zbGlkZVVwKDMwMClcclxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XHJcbiAgICAgICAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAgICAgICAkb3RoZXIucmVtb3ZlQ2xhc3MoJ2xhc3Qtb3BlbicpO1xyXG5cclxuICAgICAgICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XHJcbiAgICAgICAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNsaWRlRG93bigzMDApO1xyXG4gICAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufSk7XHJcbmFjY29yZGlvbkNvbnRyb2wuc2hvdygpO1xyXG5cclxuXHJcbiQoJy5hY2NvcmRpb24td3JhcC5vcGVuX2ZpcnN0IC5hY2NvcmRpb246Zmlyc3QtY2hpbGQnKS5hZGRDbGFzcygnb3BlbicpO1xyXG4kKCcuYWNjb3JkaW9uLXdyYXAgLmFjY29yZGlvbi5hY2NvcmRpb24tc2xpbTpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XHJcbiQoJy5hY2NvcmRpb24tc2xpbScpLmFkZENsYXNzKCdhY2NvcmRpb24tb25seV9vbmUnKTtcclxuXHJcbi8v0LTQu9GPINGB0LjQvNC+0LIg0L7RgtC60YDRi9Cy0LDQtdC8INC10YHQu9C4INC10YHRgtGMINC/0L7QvNC10YLQutCwIG9wZW4g0YLQviDQv9GA0LjRgdCy0LDQuNCy0LDQtdC8INCy0YHQtSDQvtGB0YLQsNC70YzQvdGL0LUg0LrQu9Cw0YHRi1xyXG5hY2NvcmRpb25TbGltPSQoJy5hY2NvcmRpb24uYWNjb3JkaW9uLW9ubHlfb25lJyk7XHJcbmlmKGFjY29yZGlvblNsaW0ubGVuZ3RoPjApe1xyXG4gICAgYWNjb3JkaW9uU2xpbS5wYXJlbnQoKS5maW5kKCcuYWNjb3JkaW9uLm9wZW4nKVxyXG4gICAgICAgIC5hZGRDbGFzcygnbGFzdC1vcGVuJylcclxuICAgICAgICAuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcclxuICAgICAgICAgICAgLnNob3coMzAwKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xyXG59XHJcbiIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xyXG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xyXG4gIHZhciBkZWZhdWx0cyA9IHtcclxuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcidcclxuICB9O1xyXG4gIHZhciBsYXN0X3Bvc3Q9ZmFsc2U7XHJcblxyXG4gIGZ1bmN0aW9uIG9uUG9zdChwb3N0KXtcclxuICAgIGxhc3RfcG9zdCA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgLy9jb25zb2xlLmxvZyhwb3N0LCB0aGlzKTtcclxuICAgIHZhciBkYXRhPXRoaXM7XHJcbiAgICB2YXIgZm9ybT1kYXRhLmZvcm07XHJcbiAgICB2YXIgd3JhcD1kYXRhLndyYXA7XHJcblxyXG4gICAgaWYgKHBvc3QucmVuZGVyKSB7XHJcbiAgICAgICAgcG9zdC5ub3R5ZnlfY2xhc3MgPSBcIm5vdGlmeV93aGl0ZVwiO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgICBpZihwb3N0Lmh0bWwpIHtcclxuICAgICAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xyXG4gICAgICAgICAgYWpheEZvcm0od3JhcCk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICBpZighcG9zdC5lcnJvcikge1xyXG4gICAgICAgICAgICBmb3JtLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgICAgIGZvcm0uZmluZCgnaW5wdXRbdHlwZT10ZXh0XSx0ZXh0YXJlYScpLnZhbCgnJylcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHBvc3QuZXJyb3IgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICBmb3IgKHZhciBpbmRleCBpbiBwb3N0LmVycm9yKSB7XHJcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgICAgICAgJ3R5cGUnOidlcnInLFxyXG4gICAgICAgICAgICAgICAgJ3RpdGxlJzogJ9Ce0YjQuNCx0LrQsCcsXHJcbiAgICAgICAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QuZXJyb3JbaW5kZXhdXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwb3N0LmVycm9yKSl7XHJcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHBvc3QuZXJyb3IubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgICAgICAgICAndHlwZSc6J2VycicsXHJcbiAgICAgICAgICAgICAgICAndGl0bGUnOiAn0J7RiNC40LHQutCwJyxcclxuICAgICAgICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpXVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgICAndHlwZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ3N1Y2Nlc3MnIDogJ2VycicsXHJcbiAgICAgICAgICAgICd0aXRsZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ9Cj0YHQv9C10YjQvdC+JyA6ICfQntGI0LjQsdC60LAnLFxyXG4gICAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3JcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgIC8vICAgICAndHlwZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ3N1Y2Nlc3MnIDogJ2VycicsXHJcbiAgICAvLyAgICAgJ3RpdGxlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAn0KPRgdC/0LXRiNC90L4nIDogJ9Ce0YjQuNCx0LrQsCcsXHJcbiAgICAvLyAgICAgJ21lc3NhZ2UnOiBBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpID8gcG9zdC5lcnJvclswXSA6IChwb3N0Lm1lc3NhZ2UgPyBwb3N0Lm1lc3NhZ2UgOiBwb3N0LmVycm9yKVxyXG4gICAgLy8gfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvbkZhaWwoKXtcclxuICAgIGxhc3RfcG9zdCA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgdmFyIGRhdGE9dGhpcztcclxuICAgIHZhciBmb3JtPWRhdGEuZm9ybTtcclxuICAgIHZhciB3cmFwPWRhdGEud3JhcDtcclxuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIHdyYXAuaHRtbCgnPGgzPtCj0L/RgS4uLiDQktC+0LfQvdC40LrQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwPGgzPicgK1xyXG4gICAgICAnPHA+0KfQsNGB0YLQviDRjdGC0L4g0L/RgNC+0LjRgdGF0L7QtNC40YIg0LIg0YHQu9GD0YfQsNC1LCDQtdGB0LvQuCDQstGLINC90LXRgdC60L7Qu9GM0LrQviDRgNCw0Lcg0L/QvtC00YDRj9C0INC90LXQstC10YDQvdC+INCy0LLQtdC70Lgg0YHQstC+0Lgg0YPRh9C10YLQvdGL0LUg0LTQsNC90L3Ri9C1LiDQndC+INCy0L7Qt9C80L7QttC90Ysg0Lgg0LTRgNGD0LPQuNC1INC/0YDQuNGH0LjQvdGLLiDQkiDQu9GO0LHQvtC8INGB0LvRg9GH0LDQtSDQvdC1INGA0LDRgdGB0YLRgNCw0LjQstCw0LnRgtC10YHRjCDQuCDQv9GA0L7RgdGC0L4g0L7QsdGA0LDRgtC40YLQtdGB0Ywg0Log0L3QsNGI0LXQvNGDINC+0L/QtdGA0LDRgtC+0YDRgyDRgdC70YPQttCx0Ysg0L/QvtC00LTQtdGA0LbQutC4LjwvcD48YnI+JyArXHJcbiAgICAgICc8cD7QodC/0LDRgdC40LHQvi48L3A+Jyk7XHJcbiAgICBhamF4Rm9ybSh3cmFwKTtcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvblN1Ym1pdChlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIC8vZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgIC8vZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICB2YXIgY3VycmVudFRpbWVNaWxsaXMgPSArbmV3IERhdGUoKTtcclxuICAgIGlmKGN1cnJlbnRUaW1lTWlsbGlzLWxhc3RfcG9zdDwxMDAwKjIpe1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgbGFzdF9wb3N0ID0gY3VycmVudFRpbWVNaWxsaXM7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgdmFyIGZvcm09ZGF0YS5mb3JtO1xyXG4gICAgdmFyIHdyYXA9ZGF0YS53cmFwO1xyXG4gICAgdmFyIGlzVmFsaWQ9dHJ1ZTtcclxuXHJcbiAgICAvL2luaXQod3JhcCk7XHJcblxyXG4gICAgaWYoZm9ybS55aWlBY3RpdmVGb3JtKXtcclxuICAgICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScpO1xyXG4gICAgICB2YXIgZCA9IGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScpO1xyXG4gICAgICBpc1ZhbGlkPWQudmFsaWRhdGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlzVmFsaWQ9aXNWYWxpZCAmJiAoZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aD09MCk7XHJcblxyXG4gICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgdmFyIHJlcXVpcmVkPWZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQnKTtcclxuXHJcbiAgICAgIGZvcihpPTA7aTxyZXF1aXJlZC5sZW5ndGg7aSsrKXtcclxuICAgICAgICB2YXIgaGVscEJsb2NrID0gcmVxdWlyZWQuZXEoaSkuYXR0cigndHlwZScpID09ICdoaWRkZW4nID8gcmVxdWlyZWQuZXEoaSkubmV4dCgnLmhlbHAtYmxvY2snKSA6XHJcbiAgICAgICAgICAgIHJlcXVpcmVkLmVxKGkpLmNsb3Nlc3QoJy5mb3JtLWlucHV0LWdyb3VwJykubmV4dCgnLmhlbHAtYmxvY2snKTtcclxuICAgICAgICB2YXIgaGVscE1lc3NhZ2UgPSBoZWxwQmxvY2sgJiYgaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA/IGhlbHBCbG9jay5kYXRhKCdtZXNzYWdlJykgOiAn0J3QtdC+0LHRhdC+0LTQuNC80L4g0LfQsNC/0L7Qu9C90LjRgtGMJztcclxuXHJcbiAgICAgICAgaWYocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoPDEpe1xyXG4gICAgICAgICAgaGVscEJsb2NrLmh0bWwoaGVscE1lc3NhZ2UpO1xyXG4gICAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBoZWxwQmxvY2suaHRtbCgnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICghaXNWYWxpZCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcclxuXHJcbiAgICB2YXIgcG9zdERhdGEgPSBmb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xyXG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xyXG4gICAgLy9mb3JtLmh0bWwoJycpO1xyXG4gICAgLy93cmFwLmh0bWwoJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48cD7QntGC0L/RgNCw0LLQutCwINC00LDQvdC90YvRhTwvcD48L2Rpdj4nKTtcclxuXHJcbiAgICBkYXRhLnVybCs9KGRhdGEudXJsLmluZGV4T2YoJz8nKT4wPycmJzonPycpKydyYz0nK01hdGgucmFuZG9tKCk7XHJcbiAgICBjb25zb2xlLmxvZyhkYXRhLnVybCk7XHJcblxyXG4gICAgJC5wb3N0KFxyXG4gICAgICBkYXRhLnVybCxcclxuICAgICAgcG9zdERhdGEsXHJcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxyXG4gICAgICAnanNvbidcclxuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdCh3cmFwKXtcclxuICAgIGZvcm09d3JhcC5maW5kKCdmb3JtJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgZm9ybTpmb3JtLFxyXG4gICAgICBwYXJhbTpkZWZhdWx0cyxcclxuICAgICAgd3JhcDp3cmFwXHJcbiAgICB9O1xyXG4gICAgZGF0YS51cmw9Zm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xyXG4gICAgZGF0YS5tZXRob2Q9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xyXG4gICAgZm9ybS51bmJpbmQoJ3N1Ym1pdCcpO1xyXG4gICAgLy9mb3JtLm9mZignc3VibWl0Jyk7XHJcbiAgICBmb3JtLm9uKCdzdWJtaXQnLCBvblN1Ym1pdC5iaW5kKGRhdGEpKTtcclxuICB9XHJcblxyXG4gIGVscy5maW5kKCdbcmVxdWlyZWRdJylcclxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxyXG4gICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJyk7XHJcblxyXG5cclxuICBmb3IodmFyIGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcclxuICAgIGluaXQoZWxzLmVxKGkpKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFNSTygpe1xyXG4gICQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG8gPSB7fTtcclxuICAgIHZhciBhID0gdGhpcy5zZXJpYWxpemVBcnJheSgpO1xyXG4gICAgJC5lYWNoKGEsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xyXG4gICAgICAgIGlmICghb1t0aGlzLm5hbWVdLnB1c2gpIHtcclxuICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvW3RoaXMubmFtZV0ucHVzaCh0aGlzLnZhbHVlIHx8ICcnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBvO1xyXG4gIH07XHJcbn07XHJcbmFkZFNSTygpOyIsIi8qXHJcbiAqIGpRdWVyeSBGbGV4U2xpZGVyIHYyLjYuNFxyXG4gKiBDb3B5cmlnaHQgMjAxMiBXb29UaGVtZXNcclxuICogQ29udHJpYnV0aW5nIEF1dGhvcjogVHlsZXIgU21pdGhcclxuICovIWZ1bmN0aW9uKCQpe3ZhciBlPSEwOyQuZmxleHNsaWRlcj1mdW5jdGlvbih0LGEpe3ZhciBuPSQodCk7bi52YXJzPSQuZXh0ZW5kKHt9LCQuZmxleHNsaWRlci5kZWZhdWx0cyxhKTt2YXIgaT1uLnZhcnMubmFtZXNwYWNlLHI9d2luZG93Lm5hdmlnYXRvciYmd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkJiZ3aW5kb3cuTVNHZXN0dXJlLHM9KFwib250b3VjaHN0YXJ0XCJpbiB3aW5kb3d8fHJ8fHdpbmRvdy5Eb2N1bWVudFRvdWNoJiZkb2N1bWVudCBpbnN0YW5jZW9mIERvY3VtZW50VG91Y2gpJiZuLnZhcnMudG91Y2gsbz1cImNsaWNrIHRvdWNoZW5kIE1TUG9pbnRlclVwIGtleXVwXCIsbD1cIlwiLGMsZD1cInZlcnRpY2FsXCI9PT1uLnZhcnMuZGlyZWN0aW9uLHU9bi52YXJzLnJldmVyc2Usdj1uLnZhcnMuaXRlbVdpZHRoPjAscD1cImZhZGVcIj09PW4udmFycy5hbmltYXRpb24sbT1cIlwiIT09bi52YXJzLmFzTmF2Rm9yLGY9e307JC5kYXRhKHQsXCJmbGV4c2xpZGVyXCIsbiksZj17aW5pdDpmdW5jdGlvbigpe24uYW5pbWF0aW5nPSExLG4uY3VycmVudFNsaWRlPXBhcnNlSW50KG4udmFycy5zdGFydEF0P24udmFycy5zdGFydEF0OjAsMTApLGlzTmFOKG4uY3VycmVudFNsaWRlKSYmKG4uY3VycmVudFNsaWRlPTApLG4uYW5pbWF0aW5nVG89bi5jdXJyZW50U2xpZGUsbi5hdEVuZD0wPT09bi5jdXJyZW50U2xpZGV8fG4uY3VycmVudFNsaWRlPT09bi5sYXN0LG4uY29udGFpbmVyU2VsZWN0b3I9bi52YXJzLnNlbGVjdG9yLnN1YnN0cigwLG4udmFycy5zZWxlY3Rvci5zZWFyY2goXCIgXCIpKSxuLnNsaWRlcz0kKG4udmFycy5zZWxlY3RvcixuKSxuLmNvbnRhaW5lcj0kKG4uY29udGFpbmVyU2VsZWN0b3Isbiksbi5jb3VudD1uLnNsaWRlcy5sZW5ndGgsbi5zeW5jRXhpc3RzPSQobi52YXJzLnN5bmMpLmxlbmd0aD4wLFwic2xpZGVcIj09PW4udmFycy5hbmltYXRpb24mJihuLnZhcnMuYW5pbWF0aW9uPVwic3dpbmdcIiksbi5wcm9wPWQ/XCJ0b3BcIjpcIm1hcmdpbkxlZnRcIixuLmFyZ3M9e30sbi5tYW51YWxQYXVzZT0hMSxuLnN0b3BwZWQ9ITEsbi5zdGFydGVkPSExLG4uc3RhcnRUaW1lb3V0PW51bGwsbi50cmFuc2l0aW9ucz0hbi52YXJzLnZpZGVvJiYhcCYmbi52YXJzLnVzZUNTUyYmZnVuY3Rpb24oKXt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHQ9W1wicGVyc3BlY3RpdmVQcm9wZXJ0eVwiLFwiV2Via2l0UGVyc3BlY3RpdmVcIixcIk1velBlcnNwZWN0aXZlXCIsXCJPUGVyc3BlY3RpdmVcIixcIm1zUGVyc3BlY3RpdmVcIl07Zm9yKHZhciBhIGluIHQpaWYodm9pZCAwIT09ZS5zdHlsZVt0W2FdXSlyZXR1cm4gbi5wZng9dFthXS5yZXBsYWNlKFwiUGVyc3BlY3RpdmVcIixcIlwiKS50b0xvd2VyQ2FzZSgpLG4ucHJvcD1cIi1cIituLnBmeCtcIi10cmFuc2Zvcm1cIiwhMDtyZXR1cm4hMX0oKSxuLmVuc3VyZUFuaW1hdGlvbkVuZD1cIlwiLFwiXCIhPT1uLnZhcnMuY29udHJvbHNDb250YWluZXImJihuLmNvbnRyb2xzQ29udGFpbmVyPSQobi52YXJzLmNvbnRyb2xzQ29udGFpbmVyKS5sZW5ndGg+MCYmJChuLnZhcnMuY29udHJvbHNDb250YWluZXIpKSxcIlwiIT09bi52YXJzLm1hbnVhbENvbnRyb2xzJiYobi5tYW51YWxDb250cm9scz0kKG4udmFycy5tYW51YWxDb250cm9scykubGVuZ3RoPjAmJiQobi52YXJzLm1hbnVhbENvbnRyb2xzKSksXCJcIiE9PW4udmFycy5jdXN0b21EaXJlY3Rpb25OYXYmJihuLmN1c3RvbURpcmVjdGlvbk5hdj0yPT09JChuLnZhcnMuY3VzdG9tRGlyZWN0aW9uTmF2KS5sZW5ndGgmJiQobi52YXJzLmN1c3RvbURpcmVjdGlvbk5hdikpLG4udmFycy5yYW5kb21pemUmJihuLnNsaWRlcy5zb3J0KGZ1bmN0aW9uKCl7cmV0dXJuIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSktLjV9KSxuLmNvbnRhaW5lci5lbXB0eSgpLmFwcGVuZChuLnNsaWRlcykpLG4uZG9NYXRoKCksbi5zZXR1cChcImluaXRcIiksbi52YXJzLmNvbnRyb2xOYXYmJmYuY29udHJvbE5hdi5zZXR1cCgpLG4udmFycy5kaXJlY3Rpb25OYXYmJmYuZGlyZWN0aW9uTmF2LnNldHVwKCksbi52YXJzLmtleWJvYXJkJiYoMT09PSQobi5jb250YWluZXJTZWxlY3RvcikubGVuZ3RofHxuLnZhcnMubXVsdGlwbGVLZXlib2FyZCkmJiQoZG9jdW1lbnQpLmJpbmQoXCJrZXl1cFwiLGZ1bmN0aW9uKGUpe3ZhciB0PWUua2V5Q29kZTtpZighbi5hbmltYXRpbmcmJigzOT09PXR8fDM3PT09dCkpe3ZhciBhPTM5PT09dD9uLmdldFRhcmdldChcIm5leHRcIik6Mzc9PT10JiZuLmdldFRhcmdldChcInByZXZcIik7bi5mbGV4QW5pbWF0ZShhLG4udmFycy5wYXVzZU9uQWN0aW9uKX19KSxuLnZhcnMubW91c2V3aGVlbCYmbi5iaW5kKFwibW91c2V3aGVlbFwiLGZ1bmN0aW9uKGUsdCxhLGkpe2UucHJldmVudERlZmF1bHQoKTt2YXIgcj10PDA/bi5nZXRUYXJnZXQoXCJuZXh0XCIpOm4uZ2V0VGFyZ2V0KFwicHJldlwiKTtuLmZsZXhBbmltYXRlKHIsbi52YXJzLnBhdXNlT25BY3Rpb24pfSksbi52YXJzLnBhdXNlUGxheSYmZi5wYXVzZVBsYXkuc2V0dXAoKSxuLnZhcnMuc2xpZGVzaG93JiZuLnZhcnMucGF1c2VJbnZpc2libGUmJmYucGF1c2VJbnZpc2libGUuaW5pdCgpLG4udmFycy5zbGlkZXNob3cmJihuLnZhcnMucGF1c2VPbkhvdmVyJiZuLmhvdmVyKGZ1bmN0aW9uKCl7bi5tYW51YWxQbGF5fHxuLm1hbnVhbFBhdXNlfHxuLnBhdXNlKCl9LGZ1bmN0aW9uKCl7bi5tYW51YWxQYXVzZXx8bi5tYW51YWxQbGF5fHxuLnN0b3BwZWR8fG4ucGxheSgpfSksbi52YXJzLnBhdXNlSW52aXNpYmxlJiZmLnBhdXNlSW52aXNpYmxlLmlzSGlkZGVuKCl8fChuLnZhcnMuaW5pdERlbGF5PjA/bi5zdGFydFRpbWVvdXQ9c2V0VGltZW91dChuLnBsYXksbi52YXJzLmluaXREZWxheSk6bi5wbGF5KCkpKSxtJiZmLmFzTmF2LnNldHVwKCkscyYmbi52YXJzLnRvdWNoJiZmLnRvdWNoKCksKCFwfHxwJiZuLnZhcnMuc21vb3RoSGVpZ2h0KSYmJCh3aW5kb3cpLmJpbmQoXCJyZXNpemUgb3JpZW50YXRpb25jaGFuZ2UgZm9jdXNcIixmLnJlc2l6ZSgpKSxuLmZpbmQoXCJpbWdcIikuYXR0cihcImRyYWdnYWJsZVwiLFwiZmFsc2VcIiksc2V0VGltZW91dChmdW5jdGlvbigpe24udmFycy5zdGFydChuKX0sMjAwKX0sYXNOYXY6e3NldHVwOmZ1bmN0aW9uKCl7bi5hc05hdj0hMCxuLmFuaW1hdGluZ1RvPU1hdGguZmxvb3Iobi5jdXJyZW50U2xpZGUvbi5tb3ZlKSxuLmN1cnJlbnRJdGVtPW4uY3VycmVudFNsaWRlLG4uc2xpZGVzLnJlbW92ZUNsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIikuZXEobi5jdXJyZW50SXRlbSkuYWRkQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKSxyPyh0Ll9zbGlkZXI9bixuLnNsaWRlcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9dGhpcztlLl9nZXN0dXJlPW5ldyBNU0dlc3R1cmUsZS5fZ2VzdHVyZS50YXJnZXQ9ZSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJNU1BvaW50ZXJEb3duXCIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpLGUuY3VycmVudFRhcmdldC5fZ2VzdHVyZSYmZS5jdXJyZW50VGFyZ2V0Ll9nZXN0dXJlLmFkZFBvaW50ZXIoZS5wb2ludGVySWQpfSwhMSksZS5hZGRFdmVudExpc3RlbmVyKFwiTVNHZXN0dXJlVGFwXCIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciB0PSQodGhpcyksYT10LmluZGV4KCk7JChuLnZhcnMuYXNOYXZGb3IpLmRhdGEoXCJmbGV4c2xpZGVyXCIpLmFuaW1hdGluZ3x8dC5oYXNDbGFzcyhcImFjdGl2ZVwiKXx8KG4uZGlyZWN0aW9uPW4uY3VycmVudEl0ZW08YT9cIm5leHRcIjpcInByZXZcIixuLmZsZXhBbmltYXRlKGEsbi52YXJzLnBhdXNlT25BY3Rpb24sITEsITAsITApKX0pfSkpOm4uc2xpZGVzLm9uKG8sZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciB0PSQodGhpcyksYT10LmluZGV4KCk7dC5vZmZzZXQoKS5sZWZ0LSQobikuc2Nyb2xsTGVmdCgpPD0wJiZ0Lmhhc0NsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIik/bi5mbGV4QW5pbWF0ZShuLmdldFRhcmdldChcInByZXZcIiksITApOiQobi52YXJzLmFzTmF2Rm9yKS5kYXRhKFwiZmxleHNsaWRlclwiKS5hbmltYXRpbmd8fHQuaGFzQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKXx8KG4uZGlyZWN0aW9uPW4uY3VycmVudEl0ZW08YT9cIm5leHRcIjpcInByZXZcIixuLmZsZXhBbmltYXRlKGEsbi52YXJzLnBhdXNlT25BY3Rpb24sITEsITAsITApKX0pfX0sY29udHJvbE5hdjp7c2V0dXA6ZnVuY3Rpb24oKXtuLm1hbnVhbENvbnRyb2xzP2YuY29udHJvbE5hdi5zZXR1cE1hbnVhbCgpOmYuY29udHJvbE5hdi5zZXR1cFBhZ2luZygpfSxzZXR1cFBhZ2luZzpmdW5jdGlvbigpe3ZhciBlPVwidGh1bWJuYWlsc1wiPT09bi52YXJzLmNvbnRyb2xOYXY/XCJjb250cm9sLXRodW1ic1wiOlwiY29udHJvbC1wYWdpbmdcIix0PTEsYSxyO2lmKG4uY29udHJvbE5hdlNjYWZmb2xkPSQoJzxvbCBjbGFzcz1cIicraStcImNvbnRyb2wtbmF2IFwiK2krZSsnXCI+PC9vbD4nKSxuLnBhZ2luZ0NvdW50PjEpZm9yKHZhciBzPTA7czxuLnBhZ2luZ0NvdW50O3MrKyl7cj1uLnNsaWRlcy5lcShzKSx2b2lkIDA9PT1yLmF0dHIoXCJkYXRhLXRodW1iLWFsdFwiKSYmci5hdHRyKFwiZGF0YS10aHVtYi1hbHRcIixcIlwiKTt2YXIgYz1cIlwiIT09ci5hdHRyKFwiZGF0YS10aHVtYi1hbHRcIik/Yz0nIGFsdD1cIicrci5hdHRyKFwiZGF0YS10aHVtYi1hbHRcIikrJ1wiJzpcIlwiO2lmKGE9XCJ0aHVtYm5haWxzXCI9PT1uLnZhcnMuY29udHJvbE5hdj8nPGltZyBzcmM9XCInK3IuYXR0cihcImRhdGEtdGh1bWJcIikrJ1wiJytjK1wiLz5cIjonPGEgaHJlZj1cIiNcIj4nK3QrXCI8L2E+XCIsXCJ0aHVtYm5haWxzXCI9PT1uLnZhcnMuY29udHJvbE5hdiYmITA9PT1uLnZhcnMudGh1bWJDYXB0aW9ucyl7dmFyIGQ9ci5hdHRyKFwiZGF0YS10aHVtYmNhcHRpb25cIik7XCJcIiE9PWQmJnZvaWQgMCE9PWQmJihhKz0nPHNwYW4gY2xhc3M9XCInK2krJ2NhcHRpb25cIj4nK2QrXCI8L3NwYW4+XCIpfW4uY29udHJvbE5hdlNjYWZmb2xkLmFwcGVuZChcIjxsaT5cIithK1wiPC9saT5cIiksdCsrfW4uY29udHJvbHNDb250YWluZXI/JChuLmNvbnRyb2xzQ29udGFpbmVyKS5hcHBlbmQobi5jb250cm9sTmF2U2NhZmZvbGQpOm4uYXBwZW5kKG4uY29udHJvbE5hdlNjYWZmb2xkKSxmLmNvbnRyb2xOYXYuc2V0KCksZi5jb250cm9sTmF2LmFjdGl2ZSgpLG4uY29udHJvbE5hdlNjYWZmb2xkLmRlbGVnYXRlKFwiYSwgaW1nXCIsbyxmdW5jdGlvbihlKXtpZihlLnByZXZlbnREZWZhdWx0KCksXCJcIj09PWx8fGw9PT1lLnR5cGUpe3ZhciB0PSQodGhpcyksYT1uLmNvbnRyb2xOYXYuaW5kZXgodCk7dC5oYXNDbGFzcyhpK1wiYWN0aXZlXCIpfHwobi5kaXJlY3Rpb249YT5uLmN1cnJlbnRTbGlkZT9cIm5leHRcIjpcInByZXZcIixuLmZsZXhBbmltYXRlKGEsbi52YXJzLnBhdXNlT25BY3Rpb24pKX1cIlwiPT09bCYmKGw9ZS50eXBlKSxmLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSxzZXR1cE1hbnVhbDpmdW5jdGlvbigpe24uY29udHJvbE5hdj1uLm1hbnVhbENvbnRyb2xzLGYuY29udHJvbE5hdi5hY3RpdmUoKSxuLmNvbnRyb2xOYXYuYmluZChvLGZ1bmN0aW9uKGUpe2lmKGUucHJldmVudERlZmF1bHQoKSxcIlwiPT09bHx8bD09PWUudHlwZSl7dmFyIHQ9JCh0aGlzKSxhPW4uY29udHJvbE5hdi5pbmRleCh0KTt0Lmhhc0NsYXNzKGkrXCJhY3RpdmVcIil8fChhPm4uY3VycmVudFNsaWRlP24uZGlyZWN0aW9uPVwibmV4dFwiOm4uZGlyZWN0aW9uPVwicHJldlwiLG4uZmxleEFuaW1hdGUoYSxuLnZhcnMucGF1c2VPbkFjdGlvbikpfVwiXCI9PT1sJiYobD1lLnR5cGUpLGYuc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHNldDpmdW5jdGlvbigpe3ZhciBlPVwidGh1bWJuYWlsc1wiPT09bi52YXJzLmNvbnRyb2xOYXY/XCJpbWdcIjpcImFcIjtuLmNvbnRyb2xOYXY9JChcIi5cIitpK1wiY29udHJvbC1uYXYgbGkgXCIrZSxuLmNvbnRyb2xzQ29udGFpbmVyP24uY29udHJvbHNDb250YWluZXI6bil9LGFjdGl2ZTpmdW5jdGlvbigpe24uY29udHJvbE5hdi5yZW1vdmVDbGFzcyhpK1wiYWN0aXZlXCIpLmVxKG4uYW5pbWF0aW5nVG8pLmFkZENsYXNzKGkrXCJhY3RpdmVcIil9LHVwZGF0ZTpmdW5jdGlvbihlLHQpe24ucGFnaW5nQ291bnQ+MSYmXCJhZGRcIj09PWU/bi5jb250cm9sTmF2U2NhZmZvbGQuYXBwZW5kKCQoJzxsaT48YSBocmVmPVwiI1wiPicrbi5jb3VudCtcIjwvYT48L2xpPlwiKSk6MT09PW4ucGFnaW5nQ291bnQ/bi5jb250cm9sTmF2U2NhZmZvbGQuZmluZChcImxpXCIpLnJlbW92ZSgpOm4uY29udHJvbE5hdi5lcSh0KS5jbG9zZXN0KFwibGlcIikucmVtb3ZlKCksZi5jb250cm9sTmF2LnNldCgpLG4ucGFnaW5nQ291bnQ+MSYmbi5wYWdpbmdDb3VudCE9PW4uY29udHJvbE5hdi5sZW5ndGg/bi51cGRhdGUodCxlKTpmLmNvbnRyb2xOYXYuYWN0aXZlKCl9fSxkaXJlY3Rpb25OYXY6e3NldHVwOmZ1bmN0aW9uKCl7dmFyIGU9JCgnPHVsIGNsYXNzPVwiJytpKydkaXJlY3Rpb24tbmF2XCI+PGxpIGNsYXNzPVwiJytpKyduYXYtcHJldlwiPjxhIGNsYXNzPVwiJytpKydwcmV2XCIgaHJlZj1cIiNcIj4nK24udmFycy5wcmV2VGV4dCsnPC9hPjwvbGk+PGxpIGNsYXNzPVwiJytpKyduYXYtbmV4dFwiPjxhIGNsYXNzPVwiJytpKyduZXh0XCIgaHJlZj1cIiNcIj4nK24udmFycy5uZXh0VGV4dCtcIjwvYT48L2xpPjwvdWw+XCIpO24uY3VzdG9tRGlyZWN0aW9uTmF2P24uZGlyZWN0aW9uTmF2PW4uY3VzdG9tRGlyZWN0aW9uTmF2Om4uY29udHJvbHNDb250YWluZXI/KCQobi5jb250cm9sc0NvbnRhaW5lcikuYXBwZW5kKGUpLG4uZGlyZWN0aW9uTmF2PSQoXCIuXCIraStcImRpcmVjdGlvbi1uYXYgbGkgYVwiLG4uY29udHJvbHNDb250YWluZXIpKToobi5hcHBlbmQoZSksbi5kaXJlY3Rpb25OYXY9JChcIi5cIitpK1wiZGlyZWN0aW9uLW5hdiBsaSBhXCIsbikpLGYuZGlyZWN0aW9uTmF2LnVwZGF0ZSgpLG4uZGlyZWN0aW9uTmF2LmJpbmQobyxmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCk7dmFyIHQ7XCJcIiE9PWwmJmwhPT1lLnR5cGV8fCh0PSQodGhpcykuaGFzQ2xhc3MoaStcIm5leHRcIik/bi5nZXRUYXJnZXQoXCJuZXh0XCIpOm4uZ2V0VGFyZ2V0KFwicHJldlwiKSxuLmZsZXhBbmltYXRlKHQsbi52YXJzLnBhdXNlT25BY3Rpb24pKSxcIlwiPT09bCYmKGw9ZS50eXBlKSxmLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSx1cGRhdGU6ZnVuY3Rpb24oKXt2YXIgZT1pK1wiZGlzYWJsZWRcIjsxPT09bi5wYWdpbmdDb3VudD9uLmRpcmVjdGlvbk5hdi5hZGRDbGFzcyhlKS5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpOm4udmFycy5hbmltYXRpb25Mb29wP24uZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLnJlbW92ZUF0dHIoXCJ0YWJpbmRleFwiKTowPT09bi5hbmltYXRpbmdUbz9uLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5maWx0ZXIoXCIuXCIraStcInByZXZcIikuYWRkQ2xhc3MoZSkuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTpuLmFuaW1hdGluZ1RvPT09bi5sYXN0P24uZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLmZpbHRlcihcIi5cIitpK1wibmV4dFwiKS5hZGRDbGFzcyhlKS5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpOm4uZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLnJlbW92ZUF0dHIoXCJ0YWJpbmRleFwiKX19LHBhdXNlUGxheTp7c2V0dXA6ZnVuY3Rpb24oKXt2YXIgZT0kKCc8ZGl2IGNsYXNzPVwiJytpKydwYXVzZXBsYXlcIj48YSBocmVmPVwiI1wiPjwvYT48L2Rpdj4nKTtuLmNvbnRyb2xzQ29udGFpbmVyPyhuLmNvbnRyb2xzQ29udGFpbmVyLmFwcGVuZChlKSxuLnBhdXNlUGxheT0kKFwiLlwiK2krXCJwYXVzZXBsYXkgYVwiLG4uY29udHJvbHNDb250YWluZXIpKToobi5hcHBlbmQoZSksbi5wYXVzZVBsYXk9JChcIi5cIitpK1wicGF1c2VwbGF5IGFcIixuKSksZi5wYXVzZVBsYXkudXBkYXRlKG4udmFycy5zbGlkZXNob3c/aStcInBhdXNlXCI6aStcInBsYXlcIiksbi5wYXVzZVBsYXkuYmluZChvLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKSxcIlwiIT09bCYmbCE9PWUudHlwZXx8KCQodGhpcykuaGFzQ2xhc3MoaStcInBhdXNlXCIpPyhuLm1hbnVhbFBhdXNlPSEwLG4ubWFudWFsUGxheT0hMSxuLnBhdXNlKCkpOihuLm1hbnVhbFBhdXNlPSExLG4ubWFudWFsUGxheT0hMCxuLnBsYXkoKSkpLFwiXCI9PT1sJiYobD1lLnR5cGUpLGYuc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHVwZGF0ZTpmdW5jdGlvbihlKXtcInBsYXlcIj09PWU/bi5wYXVzZVBsYXkucmVtb3ZlQ2xhc3MoaStcInBhdXNlXCIpLmFkZENsYXNzKGkrXCJwbGF5XCIpLmh0bWwobi52YXJzLnBsYXlUZXh0KTpuLnBhdXNlUGxheS5yZW1vdmVDbGFzcyhpK1wicGxheVwiKS5hZGRDbGFzcyhpK1wicGF1c2VcIikuaHRtbChuLnZhcnMucGF1c2VUZXh0KX19LHRvdWNoOmZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlKXtlLnN0b3BQcm9wYWdhdGlvbigpLG4uYW5pbWF0aW5nP2UucHJldmVudERlZmF1bHQoKToobi5wYXVzZSgpLHQuX2dlc3R1cmUuYWRkUG9pbnRlcihlLnBvaW50ZXJJZCksVD0wLGM9ZD9uLmg6bi53LGY9TnVtYmVyKG5ldyBEYXRlKSxsPXYmJnUmJm4uYW5pbWF0aW5nVG89PT1uLmxhc3Q/MDp2JiZ1P24ubGltaXQtKG4uaXRlbVcrbi52YXJzLml0ZW1NYXJnaW4pKm4ubW92ZSpuLmFuaW1hdGluZ1RvOnYmJm4uY3VycmVudFNsaWRlPT09bi5sYXN0P24ubGltaXQ6dj8obi5pdGVtVytuLnZhcnMuaXRlbU1hcmdpbikqbi5tb3ZlKm4uY3VycmVudFNsaWRlOnU/KG4ubGFzdC1uLmN1cnJlbnRTbGlkZStuLmNsb25lT2Zmc2V0KSpjOihuLmN1cnJlbnRTbGlkZStuLmNsb25lT2Zmc2V0KSpjKX1mdW5jdGlvbiBhKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCk7dmFyIGE9ZS50YXJnZXQuX3NsaWRlcjtpZihhKXt2YXIgbj0tZS50cmFuc2xhdGlvblgsaT0tZS50cmFuc2xhdGlvblk7aWYoVCs9ZD9pOm4sbT1ULHk9ZD9NYXRoLmFicyhUKTxNYXRoLmFicygtbik6TWF0aC5hYnMoVCk8TWF0aC5hYnMoLWkpLGUuZGV0YWlsPT09ZS5NU0dFU1RVUkVfRkxBR19JTkVSVElBKXJldHVybiB2b2lkIHNldEltbWVkaWF0ZShmdW5jdGlvbigpe3QuX2dlc3R1cmUuc3RvcCgpfSk7KCF5fHxOdW1iZXIobmV3IERhdGUpLWY+NTAwKSYmKGUucHJldmVudERlZmF1bHQoKSwhcCYmYS50cmFuc2l0aW9ucyYmKGEudmFycy5hbmltYXRpb25Mb29wfHwobT1ULygwPT09YS5jdXJyZW50U2xpZGUmJlQ8MHx8YS5jdXJyZW50U2xpZGU9PT1hLmxhc3QmJlQ+MD9NYXRoLmFicyhUKS9jKzI6MSkpLGEuc2V0UHJvcHMobCttLFwic2V0VG91Y2hcIikpKX19ZnVuY3Rpb24gaShlKXtlLnN0b3BQcm9wYWdhdGlvbigpO3ZhciB0PWUudGFyZ2V0Ll9zbGlkZXI7aWYodCl7aWYodC5hbmltYXRpbmdUbz09PXQuY3VycmVudFNsaWRlJiYheSYmbnVsbCE9PW0pe3ZhciBhPXU/LW06bSxuPWE+MD90LmdldFRhcmdldChcIm5leHRcIik6dC5nZXRUYXJnZXQoXCJwcmV2XCIpO3QuY2FuQWR2YW5jZShuKSYmKE51bWJlcihuZXcgRGF0ZSktZjw1NTAmJk1hdGguYWJzKGEpPjUwfHxNYXRoLmFicyhhKT5jLzIpP3QuZmxleEFuaW1hdGUobix0LnZhcnMucGF1c2VPbkFjdGlvbik6cHx8dC5mbGV4QW5pbWF0ZSh0LmN1cnJlbnRTbGlkZSx0LnZhcnMucGF1c2VPbkFjdGlvbiwhMCl9cz1udWxsLG89bnVsbCxtPW51bGwsbD1udWxsLFQ9MH19dmFyIHMsbyxsLGMsbSxmLGcsaCxTLHk9ITEseD0wLGI9MCxUPTA7cj8odC5zdHlsZS5tc1RvdWNoQWN0aW9uPVwibm9uZVwiLHQuX2dlc3R1cmU9bmV3IE1TR2VzdHVyZSx0Ll9nZXN0dXJlLnRhcmdldD10LHQuYWRkRXZlbnRMaXN0ZW5lcihcIk1TUG9pbnRlckRvd25cIixlLCExKSx0Ll9zbGlkZXI9bix0LmFkZEV2ZW50TGlzdGVuZXIoXCJNU0dlc3R1cmVDaGFuZ2VcIixhLCExKSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJNU0dlc3R1cmVFbmRcIixpLCExKSk6KGc9ZnVuY3Rpb24oZSl7bi5hbmltYXRpbmc/ZS5wcmV2ZW50RGVmYXVsdCgpOih3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWR8fDE9PT1lLnRvdWNoZXMubGVuZ3RoKSYmKG4ucGF1c2UoKSxjPWQ/bi5oOm4udyxmPU51bWJlcihuZXcgRGF0ZSkseD1lLnRvdWNoZXNbMF0ucGFnZVgsYj1lLnRvdWNoZXNbMF0ucGFnZVksbD12JiZ1JiZuLmFuaW1hdGluZ1RvPT09bi5sYXN0PzA6diYmdT9uLmxpbWl0LShuLml0ZW1XK24udmFycy5pdGVtTWFyZ2luKSpuLm1vdmUqbi5hbmltYXRpbmdUbzp2JiZuLmN1cnJlbnRTbGlkZT09PW4ubGFzdD9uLmxpbWl0OnY/KG4uaXRlbVcrbi52YXJzLml0ZW1NYXJnaW4pKm4ubW92ZSpuLmN1cnJlbnRTbGlkZTp1PyhuLmxhc3Qtbi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCkqYzoobi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCkqYyxzPWQ/Yjp4LG89ZD94OmIsdC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsaCwhMSksdC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIixTLCExKSl9LGg9ZnVuY3Rpb24oZSl7eD1lLnRvdWNoZXNbMF0ucGFnZVgsYj1lLnRvdWNoZXNbMF0ucGFnZVksbT1kP3MtYjpzLXgseT1kP01hdGguYWJzKG0pPE1hdGguYWJzKHgtbyk6TWF0aC5hYnMobSk8TWF0aC5hYnMoYi1vKTt2YXIgdD01MDA7KCF5fHxOdW1iZXIobmV3IERhdGUpLWY+NTAwKSYmKGUucHJldmVudERlZmF1bHQoKSwhcCYmbi50cmFuc2l0aW9ucyYmKG4udmFycy5hbmltYXRpb25Mb29wfHwobS89MD09PW4uY3VycmVudFNsaWRlJiZtPDB8fG4uY3VycmVudFNsaWRlPT09bi5sYXN0JiZtPjA/TWF0aC5hYnMobSkvYysyOjEpLG4uc2V0UHJvcHMobCttLFwic2V0VG91Y2hcIikpKX0sUz1mdW5jdGlvbihlKXtpZih0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixoLCExKSxuLmFuaW1hdGluZ1RvPT09bi5jdXJyZW50U2xpZGUmJiF5JiZudWxsIT09bSl7dmFyIGE9dT8tbTptLGk9YT4wP24uZ2V0VGFyZ2V0KFwibmV4dFwiKTpuLmdldFRhcmdldChcInByZXZcIik7bi5jYW5BZHZhbmNlKGkpJiYoTnVtYmVyKG5ldyBEYXRlKS1mPDU1MCYmTWF0aC5hYnMoYSk+NTB8fE1hdGguYWJzKGEpPmMvMik/bi5mbGV4QW5pbWF0ZShpLG4udmFycy5wYXVzZU9uQWN0aW9uKTpwfHxuLmZsZXhBbmltYXRlKG4uY3VycmVudFNsaWRlLG4udmFycy5wYXVzZU9uQWN0aW9uLCEwKX10LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLFMsITEpLHM9bnVsbCxvPW51bGwsbT1udWxsLGw9bnVsbH0sdC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLGcsITEpKX0scmVzaXplOmZ1bmN0aW9uKCl7IW4uYW5pbWF0aW5nJiZuLmlzKFwiOnZpc2libGVcIikmJih2fHxuLmRvTWF0aCgpLHA/Zi5zbW9vdGhIZWlnaHQoKTp2PyhuLnNsaWRlcy53aWR0aChuLmNvbXB1dGVkVyksbi51cGRhdGUobi5wYWdpbmdDb3VudCksbi5zZXRQcm9wcygpKTpkPyhuLnZpZXdwb3J0LmhlaWdodChuLmgpLG4uc2V0UHJvcHMobi5oLFwic2V0VG90YWxcIikpOihuLnZhcnMuc21vb3RoSGVpZ2h0JiZmLnNtb290aEhlaWdodCgpLG4ubmV3U2xpZGVzLndpZHRoKG4uY29tcHV0ZWRXKSxuLnNldFByb3BzKG4uY29tcHV0ZWRXLFwic2V0VG90YWxcIikpKX0sc21vb3RoSGVpZ2h0OmZ1bmN0aW9uKGUpe2lmKCFkfHxwKXt2YXIgdD1wP246bi52aWV3cG9ydDtlP3QuYW5pbWF0ZSh7aGVpZ2h0Om4uc2xpZGVzLmVxKG4uYW5pbWF0aW5nVG8pLmlubmVySGVpZ2h0KCl9LGUpOnQuaW5uZXJIZWlnaHQobi5zbGlkZXMuZXEobi5hbmltYXRpbmdUbykuaW5uZXJIZWlnaHQoKSl9fSxzeW5jOmZ1bmN0aW9uKGUpe3ZhciB0PSQobi52YXJzLnN5bmMpLmRhdGEoXCJmbGV4c2xpZGVyXCIpLGE9bi5hbmltYXRpbmdUbztzd2l0Y2goZSl7Y2FzZVwiYW5pbWF0ZVwiOnQuZmxleEFuaW1hdGUoYSxuLnZhcnMucGF1c2VPbkFjdGlvbiwhMSwhMCk7YnJlYWs7Y2FzZVwicGxheVwiOnQucGxheWluZ3x8dC5hc05hdnx8dC5wbGF5KCk7YnJlYWs7Y2FzZVwicGF1c2VcIjp0LnBhdXNlKCk7YnJlYWt9fSx1bmlxdWVJRDpmdW5jdGlvbihlKXtyZXR1cm4gZS5maWx0ZXIoXCJbaWRdXCIpLmFkZChlLmZpbmQoXCJbaWRdXCIpKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9JCh0aGlzKTtlLmF0dHIoXCJpZFwiLGUuYXR0cihcImlkXCIpK1wiX2Nsb25lXCIpfSksZX0scGF1c2VJbnZpc2libGU6e3Zpc1Byb3A6bnVsbCxpbml0OmZ1bmN0aW9uKCl7dmFyIGU9Zi5wYXVzZUludmlzaWJsZS5nZXRIaWRkZW5Qcm9wKCk7aWYoZSl7dmFyIHQ9ZS5yZXBsYWNlKC9bSHxoXWlkZGVuLyxcIlwiKStcInZpc2liaWxpdHljaGFuZ2VcIjtkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKHQsZnVuY3Rpb24oKXtmLnBhdXNlSW52aXNpYmxlLmlzSGlkZGVuKCk/bi5zdGFydFRpbWVvdXQ/Y2xlYXJUaW1lb3V0KG4uc3RhcnRUaW1lb3V0KTpuLnBhdXNlKCk6bi5zdGFydGVkP24ucGxheSgpOm4udmFycy5pbml0RGVsYXk+MD9zZXRUaW1lb3V0KG4ucGxheSxuLnZhcnMuaW5pdERlbGF5KTpuLnBsYXkoKX0pfX0saXNIaWRkZW46ZnVuY3Rpb24oKXt2YXIgZT1mLnBhdXNlSW52aXNpYmxlLmdldEhpZGRlblByb3AoKTtyZXR1cm4hIWUmJmRvY3VtZW50W2VdfSxnZXRIaWRkZW5Qcm9wOmZ1bmN0aW9uKCl7dmFyIGU9W1wid2Via2l0XCIsXCJtb3pcIixcIm1zXCIsXCJvXCJdO2lmKFwiaGlkZGVuXCJpbiBkb2N1bWVudClyZXR1cm5cImhpZGRlblwiO2Zvcih2YXIgdD0wO3Q8ZS5sZW5ndGg7dCsrKWlmKGVbdF0rXCJIaWRkZW5cImluIGRvY3VtZW50KXJldHVybiBlW3RdK1wiSGlkZGVuXCI7cmV0dXJuIG51bGx9fSxzZXRUb0NsZWFyV2F0Y2hlZEV2ZW50OmZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGMpLGM9c2V0VGltZW91dChmdW5jdGlvbigpe2w9XCJcIn0sM2UzKX19LG4uZmxleEFuaW1hdGU9ZnVuY3Rpb24oZSx0LGEscixvKXtpZihuLnZhcnMuYW5pbWF0aW9uTG9vcHx8ZT09PW4uY3VycmVudFNsaWRlfHwobi5kaXJlY3Rpb249ZT5uLmN1cnJlbnRTbGlkZT9cIm5leHRcIjpcInByZXZcIiksbSYmMT09PW4ucGFnaW5nQ291bnQmJihuLmRpcmVjdGlvbj1uLmN1cnJlbnRJdGVtPGU/XCJuZXh0XCI6XCJwcmV2XCIpLCFuLmFuaW1hdGluZyYmKG4uY2FuQWR2YW5jZShlLG8pfHxhKSYmbi5pcyhcIjp2aXNpYmxlXCIpKXtpZihtJiZyKXt2YXIgbD0kKG4udmFycy5hc05hdkZvcikuZGF0YShcImZsZXhzbGlkZXJcIik7aWYobi5hdEVuZD0wPT09ZXx8ZT09PW4uY291bnQtMSxsLmZsZXhBbmltYXRlKGUsITAsITEsITAsbyksbi5kaXJlY3Rpb249bi5jdXJyZW50SXRlbTxlP1wibmV4dFwiOlwicHJldlwiLGwuZGlyZWN0aW9uPW4uZGlyZWN0aW9uLE1hdGguY2VpbCgoZSsxKS9uLnZpc2libGUpLTE9PT1uLmN1cnJlbnRTbGlkZXx8MD09PWUpcmV0dXJuIG4uY3VycmVudEl0ZW09ZSxuLnNsaWRlcy5yZW1vdmVDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGUpLmFkZENsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIiksITE7bi5jdXJyZW50SXRlbT1lLG4uc2xpZGVzLnJlbW92ZUNsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIikuZXEoZSkuYWRkQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKSxlPU1hdGguZmxvb3IoZS9uLnZpc2libGUpfWlmKG4uYW5pbWF0aW5nPSEwLG4uYW5pbWF0aW5nVG89ZSx0JiZuLnBhdXNlKCksbi52YXJzLmJlZm9yZShuKSxuLnN5bmNFeGlzdHMmJiFvJiZmLnN5bmMoXCJhbmltYXRlXCIpLG4udmFycy5jb250cm9sTmF2JiZmLmNvbnRyb2xOYXYuYWN0aXZlKCksdnx8bi5zbGlkZXMucmVtb3ZlQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKS5lcShlKS5hZGRDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLG4uYXRFbmQ9MD09PWV8fGU9PT1uLmxhc3Qsbi52YXJzLmRpcmVjdGlvbk5hdiYmZi5kaXJlY3Rpb25OYXYudXBkYXRlKCksZT09PW4ubGFzdCYmKG4udmFycy5lbmQobiksbi52YXJzLmFuaW1hdGlvbkxvb3B8fG4ucGF1c2UoKSkscClzPyhuLnNsaWRlcy5lcShuLmN1cnJlbnRTbGlkZSkuY3NzKHtvcGFjaXR5OjAsekluZGV4OjF9KSxuLnNsaWRlcy5lcShlKS5jc3Moe29wYWNpdHk6MSx6SW5kZXg6Mn0pLG4ud3JhcHVwKGMpKToobi5zbGlkZXMuZXEobi5jdXJyZW50U2xpZGUpLmNzcyh7ekluZGV4OjF9KS5hbmltYXRlKHtvcGFjaXR5OjB9LG4udmFycy5hbmltYXRpb25TcGVlZCxuLnZhcnMuZWFzaW5nKSxuLnNsaWRlcy5lcShlKS5jc3Moe3pJbmRleDoyfSkuYW5pbWF0ZSh7b3BhY2l0eToxfSxuLnZhcnMuYW5pbWF0aW9uU3BlZWQsbi52YXJzLmVhc2luZyxuLndyYXB1cCkpO2Vsc2V7dmFyIGM9ZD9uLnNsaWRlcy5maWx0ZXIoXCI6Zmlyc3RcIikuaGVpZ2h0KCk6bi5jb21wdXRlZFcsZyxoLFM7dj8oZz1uLnZhcnMuaXRlbU1hcmdpbixTPShuLml0ZW1XK2cpKm4ubW92ZSpuLmFuaW1hdGluZ1RvLGg9Uz5uLmxpbWl0JiYxIT09bi52aXNpYmxlP24ubGltaXQ6Uyk6aD0wPT09bi5jdXJyZW50U2xpZGUmJmU9PT1uLmNvdW50LTEmJm4udmFycy5hbmltYXRpb25Mb29wJiZcIm5leHRcIiE9PW4uZGlyZWN0aW9uP3U/KG4uY291bnQrbi5jbG9uZU9mZnNldCkqYzowOm4uY3VycmVudFNsaWRlPT09bi5sYXN0JiYwPT09ZSYmbi52YXJzLmFuaW1hdGlvbkxvb3AmJlwicHJldlwiIT09bi5kaXJlY3Rpb24/dT8wOihuLmNvdW50KzEpKmM6dT8obi5jb3VudC0xLWUrbi5jbG9uZU9mZnNldCkqYzooZStuLmNsb25lT2Zmc2V0KSpjLG4uc2V0UHJvcHMoaCxcIlwiLG4udmFycy5hbmltYXRpb25TcGVlZCksbi50cmFuc2l0aW9ucz8obi52YXJzLmFuaW1hdGlvbkxvb3AmJm4uYXRFbmR8fChuLmFuaW1hdGluZz0hMSxuLmN1cnJlbnRTbGlkZT1uLmFuaW1hdGluZ1RvKSxuLmNvbnRhaW5lci51bmJpbmQoXCJ3ZWJraXRUcmFuc2l0aW9uRW5kIHRyYW5zaXRpb25lbmRcIiksbi5jb250YWluZXIuYmluZChcIndlYmtpdFRyYW5zaXRpb25FbmQgdHJhbnNpdGlvbmVuZFwiLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KG4uZW5zdXJlQW5pbWF0aW9uRW5kKSxuLndyYXB1cChjKX0pLGNsZWFyVGltZW91dChuLmVuc3VyZUFuaW1hdGlvbkVuZCksbi5lbnN1cmVBbmltYXRpb25FbmQ9c2V0VGltZW91dChmdW5jdGlvbigpe24ud3JhcHVwKGMpfSxuLnZhcnMuYW5pbWF0aW9uU3BlZWQrMTAwKSk6bi5jb250YWluZXIuYW5pbWF0ZShuLmFyZ3Msbi52YXJzLmFuaW1hdGlvblNwZWVkLG4udmFycy5lYXNpbmcsZnVuY3Rpb24oKXtuLndyYXB1cChjKX0pfW4udmFycy5zbW9vdGhIZWlnaHQmJmYuc21vb3RoSGVpZ2h0KG4udmFycy5hbmltYXRpb25TcGVlZCl9fSxuLndyYXB1cD1mdW5jdGlvbihlKXtwfHx2fHwoMD09PW4uY3VycmVudFNsaWRlJiZuLmFuaW1hdGluZ1RvPT09bi5sYXN0JiZuLnZhcnMuYW5pbWF0aW9uTG9vcD9uLnNldFByb3BzKGUsXCJqdW1wRW5kXCIpOm4uY3VycmVudFNsaWRlPT09bi5sYXN0JiYwPT09bi5hbmltYXRpbmdUbyYmbi52YXJzLmFuaW1hdGlvbkxvb3AmJm4uc2V0UHJvcHMoZSxcImp1bXBTdGFydFwiKSksbi5hbmltYXRpbmc9ITEsbi5jdXJyZW50U2xpZGU9bi5hbmltYXRpbmdUbyxuLnZhcnMuYWZ0ZXIobil9LG4uYW5pbWF0ZVNsaWRlcz1mdW5jdGlvbigpeyFuLmFuaW1hdGluZyYmZSYmbi5mbGV4QW5pbWF0ZShuLmdldFRhcmdldChcIm5leHRcIikpfSxuLnBhdXNlPWZ1bmN0aW9uKCl7Y2xlYXJJbnRlcnZhbChuLmFuaW1hdGVkU2xpZGVzKSxuLmFuaW1hdGVkU2xpZGVzPW51bGwsbi5wbGF5aW5nPSExLG4udmFycy5wYXVzZVBsYXkmJmYucGF1c2VQbGF5LnVwZGF0ZShcInBsYXlcIiksbi5zeW5jRXhpc3RzJiZmLnN5bmMoXCJwYXVzZVwiKX0sbi5wbGF5PWZ1bmN0aW9uKCl7bi5wbGF5aW5nJiZjbGVhckludGVydmFsKG4uYW5pbWF0ZWRTbGlkZXMpLG4uYW5pbWF0ZWRTbGlkZXM9bi5hbmltYXRlZFNsaWRlc3x8c2V0SW50ZXJ2YWwobi5hbmltYXRlU2xpZGVzLG4udmFycy5zbGlkZXNob3dTcGVlZCksbi5zdGFydGVkPW4ucGxheWluZz0hMCxuLnZhcnMucGF1c2VQbGF5JiZmLnBhdXNlUGxheS51cGRhdGUoXCJwYXVzZVwiKSxuLnN5bmNFeGlzdHMmJmYuc3luYyhcInBsYXlcIil9LG4uc3RvcD1mdW5jdGlvbigpe24ucGF1c2UoKSxuLnN0b3BwZWQ9ITB9LG4uY2FuQWR2YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBhPW0/bi5wYWdpbmdDb3VudC0xOm4ubGFzdDtyZXR1cm4hIXR8fCghKCFtfHxuLmN1cnJlbnRJdGVtIT09bi5jb3VudC0xfHwwIT09ZXx8XCJwcmV2XCIhPT1uLmRpcmVjdGlvbil8fCghbXx8MCE9PW4uY3VycmVudEl0ZW18fGUhPT1uLnBhZ2luZ0NvdW50LTF8fFwibmV4dFwiPT09bi5kaXJlY3Rpb24pJiYoIShlPT09bi5jdXJyZW50U2xpZGUmJiFtKSYmKCEhbi52YXJzLmFuaW1hdGlvbkxvb3B8fCghbi5hdEVuZHx8MCE9PW4uY3VycmVudFNsaWRlfHxlIT09YXx8XCJuZXh0XCI9PT1uLmRpcmVjdGlvbikmJighbi5hdEVuZHx8bi5jdXJyZW50U2xpZGUhPT1hfHwwIT09ZXx8XCJuZXh0XCIhPT1uLmRpcmVjdGlvbikpKSl9LG4uZ2V0VGFyZ2V0PWZ1bmN0aW9uKGUpe3JldHVybiBuLmRpcmVjdGlvbj1lLFwibmV4dFwiPT09ZT9uLmN1cnJlbnRTbGlkZT09PW4ubGFzdD8wOm4uY3VycmVudFNsaWRlKzE6MD09PW4uY3VycmVudFNsaWRlP24ubGFzdDpuLmN1cnJlbnRTbGlkZS0xfSxuLnNldFByb3BzPWZ1bmN0aW9uKGUsdCxhKXt2YXIgaT1mdW5jdGlvbigpe3ZhciBhPWV8fChuLml0ZW1XK24udmFycy5pdGVtTWFyZ2luKSpuLm1vdmUqbi5hbmltYXRpbmdUbztyZXR1cm4tMSpmdW5jdGlvbigpe2lmKHYpcmV0dXJuXCJzZXRUb3VjaFwiPT09dD9lOnUmJm4uYW5pbWF0aW5nVG89PT1uLmxhc3Q/MDp1P24ubGltaXQtKG4uaXRlbVcrbi52YXJzLml0ZW1NYXJnaW4pKm4ubW92ZSpuLmFuaW1hdGluZ1RvOm4uYW5pbWF0aW5nVG89PT1uLmxhc3Q/bi5saW1pdDphO3N3aXRjaCh0KXtjYXNlXCJzZXRUb3RhbFwiOnJldHVybiB1PyhuLmNvdW50LTEtbi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCkqZToobi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCkqZTtjYXNlXCJzZXRUb3VjaFwiOnJldHVybiBlO2Nhc2VcImp1bXBFbmRcIjpyZXR1cm4gdT9lOm4uY291bnQqZTtjYXNlXCJqdW1wU3RhcnRcIjpyZXR1cm4gdT9uLmNvdW50KmU6ZTtkZWZhdWx0OnJldHVybiBlfX0oKStcInB4XCJ9KCk7bi50cmFuc2l0aW9ucyYmKGk9ZD9cInRyYW5zbGF0ZTNkKDAsXCIraStcIiwwKVwiOlwidHJhbnNsYXRlM2QoXCIraStcIiwwLDApXCIsYT12b2lkIDAhPT1hP2EvMWUzK1wic1wiOlwiMHNcIixuLmNvbnRhaW5lci5jc3MoXCItXCIrbi5wZngrXCItdHJhbnNpdGlvbi1kdXJhdGlvblwiLGEpLG4uY29udGFpbmVyLmNzcyhcInRyYW5zaXRpb24tZHVyYXRpb25cIixhKSksbi5hcmdzW24ucHJvcF09aSwobi50cmFuc2l0aW9uc3x8dm9pZCAwPT09YSkmJm4uY29udGFpbmVyLmNzcyhuLmFyZ3MpLG4uY29udGFpbmVyLmNzcyhcInRyYW5zZm9ybVwiLGkpfSxuLnNldHVwPWZ1bmN0aW9uKGUpe2lmKHApbi5zbGlkZXMuY3NzKHt3aWR0aDpcIjEwMCVcIixmbG9hdDpcImxlZnRcIixtYXJnaW5SaWdodDpcIi0xMDAlXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksXCJpbml0XCI9PT1lJiYocz9uLnNsaWRlcy5jc3Moe29wYWNpdHk6MCxkaXNwbGF5OlwiYmxvY2tcIix3ZWJraXRUcmFuc2l0aW9uOlwib3BhY2l0eSBcIituLnZhcnMuYW5pbWF0aW9uU3BlZWQvMWUzK1wicyBlYXNlXCIsekluZGV4OjF9KS5lcShuLmN1cnJlbnRTbGlkZSkuY3NzKHtvcGFjaXR5OjEsekluZGV4OjJ9KTowPT1uLnZhcnMuZmFkZUZpcnN0U2xpZGU/bi5zbGlkZXMuY3NzKHtvcGFjaXR5OjAsZGlzcGxheTpcImJsb2NrXCIsekluZGV4OjF9KS5lcShuLmN1cnJlbnRTbGlkZSkuY3NzKHt6SW5kZXg6Mn0pLmNzcyh7b3BhY2l0eToxfSk6bi5zbGlkZXMuY3NzKHtvcGFjaXR5OjAsZGlzcGxheTpcImJsb2NrXCIsekluZGV4OjF9KS5lcShuLmN1cnJlbnRTbGlkZSkuY3NzKHt6SW5kZXg6Mn0pLmFuaW1hdGUoe29wYWNpdHk6MX0sbi52YXJzLmFuaW1hdGlvblNwZWVkLG4udmFycy5lYXNpbmcpKSxuLnZhcnMuc21vb3RoSGVpZ2h0JiZmLnNtb290aEhlaWdodCgpO2Vsc2V7dmFyIHQsYTtcImluaXRcIj09PWUmJihuLnZpZXdwb3J0PSQoJzxkaXYgY2xhc3M9XCInK2krJ3ZpZXdwb3J0XCI+PC9kaXY+JykuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLmFwcGVuZFRvKG4pLmFwcGVuZChuLmNvbnRhaW5lciksbi5jbG9uZUNvdW50PTAsbi5jbG9uZU9mZnNldD0wLHUmJihhPSQubWFrZUFycmF5KG4uc2xpZGVzKS5yZXZlcnNlKCksbi5zbGlkZXM9JChhKSxuLmNvbnRhaW5lci5lbXB0eSgpLmFwcGVuZChuLnNsaWRlcykpKSxuLnZhcnMuYW5pbWF0aW9uTG9vcCYmIXYmJihuLmNsb25lQ291bnQ9MixuLmNsb25lT2Zmc2V0PTEsXCJpbml0XCIhPT1lJiZuLmNvbnRhaW5lci5maW5kKFwiLmNsb25lXCIpLnJlbW92ZSgpLG4uY29udGFpbmVyLmFwcGVuZChmLnVuaXF1ZUlEKG4uc2xpZGVzLmZpcnN0KCkuY2xvbmUoKS5hZGRDbGFzcyhcImNsb25lXCIpKS5hdHRyKFwiYXJpYS1oaWRkZW5cIixcInRydWVcIikpLnByZXBlbmQoZi51bmlxdWVJRChuLnNsaWRlcy5sYXN0KCkuY2xvbmUoKS5hZGRDbGFzcyhcImNsb25lXCIpKS5hdHRyKFwiYXJpYS1oaWRkZW5cIixcInRydWVcIikpKSxuLm5ld1NsaWRlcz0kKG4udmFycy5zZWxlY3RvcixuKSx0PXU/bi5jb3VudC0xLW4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQ6bi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCxkJiYhdj8obi5jb250YWluZXIuaGVpZ2h0KDIwMCoobi5jb3VudCtuLmNsb25lQ291bnQpK1wiJVwiKS5jc3MoXCJwb3NpdGlvblwiLFwiYWJzb2x1dGVcIikud2lkdGgoXCIxMDAlXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLm5ld1NsaWRlcy5jc3Moe2Rpc3BsYXk6XCJibG9ja1wifSksbi5kb01hdGgoKSxuLnZpZXdwb3J0LmhlaWdodChuLmgpLG4uc2V0UHJvcHModCpuLmgsXCJpbml0XCIpfSxcImluaXRcIj09PWU/MTAwOjApKToobi5jb250YWluZXIud2lkdGgoMjAwKihuLmNvdW50K24uY2xvbmVDb3VudCkrXCIlXCIpLG4uc2V0UHJvcHModCpuLmNvbXB1dGVkVyxcImluaXRcIiksc2V0VGltZW91dChmdW5jdGlvbigpe24uZG9NYXRoKCksbi5uZXdTbGlkZXMuY3NzKHt3aWR0aDpuLmNvbXB1dGVkVyxtYXJnaW5SaWdodDpuLmNvbXB1dGVkTSxmbG9hdDpcImxlZnRcIixkaXNwbGF5OlwiYmxvY2tcIn0pLG4udmFycy5zbW9vdGhIZWlnaHQmJmYuc21vb3RoSGVpZ2h0KCl9LFwiaW5pdFwiPT09ZT8xMDA6MCkpfXZ8fG4uc2xpZGVzLnJlbW92ZUNsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIikuZXEobi5jdXJyZW50U2xpZGUpLmFkZENsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIiksbi52YXJzLmluaXQobil9LG4uZG9NYXRoPWZ1bmN0aW9uKCl7dmFyIGU9bi5zbGlkZXMuZmlyc3QoKSx0PW4udmFycy5pdGVtTWFyZ2luLGE9bi52YXJzLm1pbkl0ZW1zLGk9bi52YXJzLm1heEl0ZW1zO24udz12b2lkIDA9PT1uLnZpZXdwb3J0P24ud2lkdGgoKTpuLnZpZXdwb3J0LndpZHRoKCksbi5oPWUuaGVpZ2h0KCksbi5ib3hQYWRkaW5nPWUub3V0ZXJXaWR0aCgpLWUud2lkdGgoKSx2PyhuLml0ZW1UPW4udmFycy5pdGVtV2lkdGgrdCxuLml0ZW1NPXQsbi5taW5XPWE/YSpuLml0ZW1UOm4udyxuLm1heFc9aT9pKm4uaXRlbVQtdDpuLncsbi5pdGVtVz1uLm1pblc+bi53PyhuLnctdCooYS0xKSkvYTpuLm1heFc8bi53PyhuLnctdCooaS0xKSkvaTpuLnZhcnMuaXRlbVdpZHRoPm4udz9uLnc6bi52YXJzLml0ZW1XaWR0aCxuLnZpc2libGU9TWF0aC5mbG9vcihuLncvbi5pdGVtVyksbi5tb3ZlPW4udmFycy5tb3ZlPjAmJm4udmFycy5tb3ZlPG4udmlzaWJsZT9uLnZhcnMubW92ZTpuLnZpc2libGUsbi5wYWdpbmdDb3VudD1NYXRoLmNlaWwoKG4uY291bnQtbi52aXNpYmxlKS9uLm1vdmUrMSksbi5sYXN0PW4ucGFnaW5nQ291bnQtMSxuLmxpbWl0PTE9PT1uLnBhZ2luZ0NvdW50PzA6bi52YXJzLml0ZW1XaWR0aD5uLnc/bi5pdGVtVyoobi5jb3VudC0xKSt0KihuLmNvdW50LTEpOihuLml0ZW1XK3QpKm4uY291bnQtbi53LXQpOihuLml0ZW1XPW4udyxuLml0ZW1NPXQsbi5wYWdpbmdDb3VudD1uLmNvdW50LG4ubGFzdD1uLmNvdW50LTEpLG4uY29tcHV0ZWRXPW4uaXRlbVctbi5ib3hQYWRkaW5nLG4uY29tcHV0ZWRNPW4uaXRlbU19LG4udXBkYXRlPWZ1bmN0aW9uKGUsdCl7bi5kb01hdGgoKSx2fHwoZTxuLmN1cnJlbnRTbGlkZT9uLmN1cnJlbnRTbGlkZSs9MTplPD1uLmN1cnJlbnRTbGlkZSYmMCE9PWUmJihuLmN1cnJlbnRTbGlkZS09MSksbi5hbmltYXRpbmdUbz1uLmN1cnJlbnRTbGlkZSksbi52YXJzLmNvbnRyb2xOYXYmJiFuLm1hbnVhbENvbnRyb2xzJiYoXCJhZGRcIj09PXQmJiF2fHxuLnBhZ2luZ0NvdW50Pm4uY29udHJvbE5hdi5sZW5ndGg/Zi5jb250cm9sTmF2LnVwZGF0ZShcImFkZFwiKTooXCJyZW1vdmVcIj09PXQmJiF2fHxuLnBhZ2luZ0NvdW50PG4uY29udHJvbE5hdi5sZW5ndGgpJiYodiYmbi5jdXJyZW50U2xpZGU+bi5sYXN0JiYobi5jdXJyZW50U2xpZGUtPTEsbi5hbmltYXRpbmdUby09MSksZi5jb250cm9sTmF2LnVwZGF0ZShcInJlbW92ZVwiLG4ubGFzdCkpKSxuLnZhcnMuZGlyZWN0aW9uTmF2JiZmLmRpcmVjdGlvbk5hdi51cGRhdGUoKX0sbi5hZGRTbGlkZT1mdW5jdGlvbihlLHQpe3ZhciBhPSQoZSk7bi5jb3VudCs9MSxuLmxhc3Q9bi5jb3VudC0xLGQmJnU/dm9pZCAwIT09dD9uLnNsaWRlcy5lcShuLmNvdW50LXQpLmFmdGVyKGEpOm4uY29udGFpbmVyLnByZXBlbmQoYSk6dm9pZCAwIT09dD9uLnNsaWRlcy5lcSh0KS5iZWZvcmUoYSk6bi5jb250YWluZXIuYXBwZW5kKGEpLG4udXBkYXRlKHQsXCJhZGRcIiksbi5zbGlkZXM9JChuLnZhcnMuc2VsZWN0b3IrXCI6bm90KC5jbG9uZSlcIixuKSxuLnNldHVwKCksbi52YXJzLmFkZGVkKG4pfSxuLnJlbW92ZVNsaWRlPWZ1bmN0aW9uKGUpe3ZhciB0PWlzTmFOKGUpP24uc2xpZGVzLmluZGV4KCQoZSkpOmU7bi5jb3VudC09MSxuLmxhc3Q9bi5jb3VudC0xLGlzTmFOKGUpPyQoZSxuLnNsaWRlcykucmVtb3ZlKCk6ZCYmdT9uLnNsaWRlcy5lcShuLmxhc3QpLnJlbW92ZSgpOm4uc2xpZGVzLmVxKGUpLnJlbW92ZSgpLG4uZG9NYXRoKCksbi51cGRhdGUodCxcInJlbW92ZVwiKSxuLnNsaWRlcz0kKG4udmFycy5zZWxlY3RvcitcIjpub3QoLmNsb25lKVwiLG4pLG4uc2V0dXAoKSxuLnZhcnMucmVtb3ZlZChuKX0sZi5pbml0KCl9LCQod2luZG93KS5ibHVyKGZ1bmN0aW9uKHQpe2U9ITF9KS5mb2N1cyhmdW5jdGlvbih0KXtlPSEwfSksJC5mbGV4c2xpZGVyLmRlZmF1bHRzPXtuYW1lc3BhY2U6XCJmbGV4LVwiLHNlbGVjdG9yOlwiLnNsaWRlcyA+IGxpXCIsYW5pbWF0aW9uOlwiZmFkZVwiLGVhc2luZzpcInN3aW5nXCIsZGlyZWN0aW9uOlwiaG9yaXpvbnRhbFwiLHJldmVyc2U6ITEsYW5pbWF0aW9uTG9vcDohMCxzbW9vdGhIZWlnaHQ6ITEsc3RhcnRBdDowLHNsaWRlc2hvdzohMCxzbGlkZXNob3dTcGVlZDo3ZTMsYW5pbWF0aW9uU3BlZWQ6NjAwLGluaXREZWxheTowLHJhbmRvbWl6ZTohMSxmYWRlRmlyc3RTbGlkZTohMCx0aHVtYkNhcHRpb25zOiExLHBhdXNlT25BY3Rpb246ITAscGF1c2VPbkhvdmVyOiExLHBhdXNlSW52aXNpYmxlOiEwLHVzZUNTUzohMCx0b3VjaDohMCx2aWRlbzohMSxjb250cm9sTmF2OiEwLGRpcmVjdGlvbk5hdjohMCxwcmV2VGV4dDpcIlByZXZpb3VzXCIsbmV4dFRleHQ6XCJOZXh0XCIsa2V5Ym9hcmQ6ITAsbXVsdGlwbGVLZXlib2FyZDohMSxtb3VzZXdoZWVsOiExLHBhdXNlUGxheTohMSxwYXVzZVRleHQ6XCJQYXVzZVwiLHBsYXlUZXh0OlwiUGxheVwiLGNvbnRyb2xzQ29udGFpbmVyOlwiXCIsbWFudWFsQ29udHJvbHM6XCJcIixjdXN0b21EaXJlY3Rpb25OYXY6XCJcIixzeW5jOlwiXCIsYXNOYXZGb3I6XCJcIixpdGVtV2lkdGg6MCxpdGVtTWFyZ2luOjAsbWluSXRlbXM6MSxtYXhJdGVtczowLG1vdmU6MCxhbGxvd09uZVNsaWRlOiEwLHN0YXJ0OmZ1bmN0aW9uKCl7fSxiZWZvcmU6ZnVuY3Rpb24oKXt9LGFmdGVyOmZ1bmN0aW9uKCl7fSxlbmQ6ZnVuY3Rpb24oKXt9LGFkZGVkOmZ1bmN0aW9uKCl7fSxyZW1vdmVkOmZ1bmN0aW9uKCl7fSxpbml0OmZ1bmN0aW9uKCl7fX0sJC5mbi5mbGV4c2xpZGVyPWZ1bmN0aW9uKGUpe2lmKHZvaWQgMD09PWUmJihlPXt9KSxcIm9iamVjdFwiPT10eXBlb2YgZSlyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHQ9JCh0aGlzKSxhPWUuc2VsZWN0b3I/ZS5zZWxlY3RvcjpcIi5zbGlkZXMgPiBsaVwiLG49dC5maW5kKGEpOzE9PT1uLmxlbmd0aCYmITE9PT1lLmFsbG93T25lU2xpZGV8fDA9PT1uLmxlbmd0aD8obi5mYWRlSW4oNDAwKSxlLnN0YXJ0JiZlLnN0YXJ0KHQpKTp2b2lkIDA9PT10LmRhdGEoXCJmbGV4c2xpZGVyXCIpJiZuZXcgJC5mbGV4c2xpZGVyKHRoaXMsZSl9KTt2YXIgdD0kKHRoaXMpLmRhdGEoXCJmbGV4c2xpZGVyXCIpO3N3aXRjaChlKXtjYXNlXCJwbGF5XCI6dC5wbGF5KCk7YnJlYWs7Y2FzZVwicGF1c2VcIjp0LnBhdXNlKCk7YnJlYWs7Y2FzZVwic3RvcFwiOnQuc3RvcCgpO2JyZWFrO2Nhc2VcIm5leHRcIjp0LmZsZXhBbmltYXRlKHQuZ2V0VGFyZ2V0KFwibmV4dFwiKSwhMCk7YnJlYWs7Y2FzZVwicHJldlwiOmNhc2VcInByZXZpb3VzXCI6dC5mbGV4QW5pbWF0ZSh0LmdldFRhcmdldChcInByZXZcIiksITApO2JyZWFrO2RlZmF1bHQ6XCJudW1iZXJcIj09dHlwZW9mIGUmJnQuZmxleEFuaW1hdGUoZSwhMCl9fX0oalF1ZXJ5KTsiLCIhZnVuY3Rpb24odCl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJqcXVlcnlcIl0sdCk6XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9dChyZXF1aXJlKFwianF1ZXJ5XCIpKTp0KGpRdWVyeSl9KGZ1bmN0aW9uKHQpe2Z1bmN0aW9uIG8obyxlKXt0aGlzLmVsZW1lbnQ9byx0aGlzLiRlbGVtZW50PXQodGhpcy5lbGVtZW50KSx0aGlzLmRvYz10KGRvY3VtZW50KSx0aGlzLndpbj10KHdpbmRvdyksdGhpcy5zZXR0aW5ncz10LmV4dGVuZCh7fSxuLGUpLFwib2JqZWN0XCI9PXR5cGVvZiB0aGlzLiRlbGVtZW50LmRhdGEoXCJ0aXBzb1wiKSYmdC5leHRlbmQodGhpcy5zZXR0aW5ncyx0aGlzLiRlbGVtZW50LmRhdGEoXCJ0aXBzb1wiKSk7Zm9yKHZhciByPU9iamVjdC5rZXlzKHRoaXMuJGVsZW1lbnQuZGF0YSgpKSxzPXt9LGQ9MDtkPHIubGVuZ3RoO2QrKyl7dmFyIGw9cltkXS5yZXBsYWNlKGksXCJcIik7aWYoXCJcIiE9PWwpe2w9bC5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKStsLnNsaWNlKDEpLHNbbF09dGhpcy4kZWxlbWVudC5kYXRhKHJbZF0pO2Zvcih2YXIgcCBpbiB0aGlzLnNldHRpbmdzKXAudG9Mb3dlckNhc2UoKT09bCYmKHRoaXMuc2V0dGluZ3NbcF09c1tsXSl9fXRoaXMuX2RlZmF1bHRzPW4sdGhpcy5fbmFtZT1pLHRoaXMuX3RpdGxlPXRoaXMuJGVsZW1lbnQuYXR0cihcInRpdGxlXCIpLHRoaXMubW9kZT1cImhpZGVcIix0aGlzLmllRmFkZT0hYSx0aGlzLnNldHRpbmdzLnByZWZlcmVkUG9zaXRpb249dGhpcy5zZXR0aW5ncy5wb3NpdGlvbix0aGlzLmluaXQoKX1mdW5jdGlvbiBlKG8pe3ZhciBlPW8uY2xvbmUoKTtlLmNzcyhcInZpc2liaWxpdHlcIixcImhpZGRlblwiKSx0KFwiYm9keVwiKS5hcHBlbmQoZSk7dmFyIHI9ZS5vdXRlckhlaWdodCgpLHM9ZS5vdXRlcldpZHRoKCk7cmV0dXJuIGUucmVtb3ZlKCkse3dpZHRoOnMsaGVpZ2h0OnJ9fWZ1bmN0aW9uIHIodCl7dC5yZW1vdmVDbGFzcyhcInRvcF9yaWdodF9jb3JuZXIgYm90dG9tX3JpZ2h0X2Nvcm5lciB0b3BfbGVmdF9jb3JuZXIgYm90dG9tX2xlZnRfY29ybmVyXCIpLHQuZmluZChcIi50aXBzb190aXRsZVwiKS5yZW1vdmVDbGFzcyhcInRvcF9yaWdodF9jb3JuZXIgYm90dG9tX3JpZ2h0X2Nvcm5lciB0b3BfbGVmdF9jb3JuZXIgYm90dG9tX2xlZnRfY29ybmVyXCIpfWZ1bmN0aW9uIHMobyl7dmFyIGksbixhLGQ9by50b29sdGlwKCksbD1vLiRlbGVtZW50LHA9byxmPXQod2luZG93KSxnPTEwLGM9cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLGg9cC50aXRsZUNvbnRlbnQoKTtzd2l0Y2godm9pZCAwIT09aCYmXCJcIiE9PWgmJihjPXAuc2V0dGluZ3MudGl0bGVCYWNrZ3JvdW5kKSxsLnBhcmVudCgpLm91dGVyV2lkdGgoKT5mLm91dGVyV2lkdGgoKSYmKGY9bC5wYXJlbnQoKSkscC5zZXR0aW5ncy5wb3NpdGlvbil7Y2FzZVwidG9wLXJpZ2h0XCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCksaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwiYm90dG9tX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJib3R0b21fcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpjfSksZC5yZW1vdmVDbGFzcyhcInRvcC1yaWdodCB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50IFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmR9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpO2JyZWFrO2Nhc2VcInRvcC1sZWZ0XCI6bj1sLm9mZnNldCgpLmxlZnQtZShkKS53aWR0aCxpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21fbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwiYm90dG9tX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6Y30pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AtcmlnaHQgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudCBcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwidG9wX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kfSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTticmVhaztjYXNlXCJib3R0b20tcmlnaHRcIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKSxpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGkrZShkKS5oZWlnaHQ+Zi5zY3JvbGxUb3AoKStmLm91dGVySGVpZ2h0KCk/KGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcInRvcF9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kfSksZC5yZW1vdmVDbGFzcyhcInRvcC1yaWdodCB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21fcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcImJvdHRvbV9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOmN9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpO2JyZWFrO2Nhc2VcImJvdHRvbS1sZWZ0XCI6bj1sLm9mZnNldCgpLmxlZnQtZShkKS53aWR0aCxpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGkrZShkKS5oZWlnaHQ+Zi5zY3JvbGxUb3AoKStmLm91dGVySGVpZ2h0KCk/KGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BfbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwidG9wX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kfSksZC5yZW1vdmVDbGFzcyhcInRvcC1yaWdodCB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21fbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwiYm90dG9tX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6Y30pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk7YnJlYWs7Y2FzZVwidG9wXCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkvMi1lKGQpLndpZHRoLzIsaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTticmVhaztjYXNlXCJib3R0b21cIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKS8yLWUoZCkud2lkdGgvMixpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGkrZShkKS5oZWlnaHQ+Zi5zY3JvbGxUb3AoKStmLm91dGVySGVpZ2h0KCk/KGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKHAuc2V0dGluZ3MucG9zaXRpb24pKTticmVhaztjYXNlXCJsZWZ0XCI6bj1sLm9mZnNldCgpLmxlZnQtZShkKS53aWR0aC1nLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpLzItZShkKS5oZWlnaHQvMixkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5Ub3A6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5MZWZ0OlwiXCJ9KSxuPGYuc2Nyb2xsTGVmdCgpPyhuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInJpZ2h0XCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKHAuc2V0dGluZ3MucG9zaXRpb24pKTticmVhaztjYXNlXCJyaWdodFwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpK2csaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkvMi1lKGQpLmhlaWdodC8yLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpblRvcDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpbkxlZnQ6XCJcIn0pLG4rZytwLnNldHRpbmdzLndpZHRoPmYuc2Nyb2xsTGVmdCgpK2Yub3V0ZXJXaWR0aCgpPyhuPWwub2Zmc2V0KCkubGVmdC1lKGQpLndpZHRoLWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwibGVmdFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhwLnNldHRpbmdzLnBvc2l0aW9uKSl9aWYoXCJ0b3AtcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24mJmQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wibWFyZ2luLWxlZnRcIjotcC5zZXR0aW5ncy53aWR0aC8yfSksXCJ0b3AtbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbil7dmFyIG09ZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmVxKDApO20uY3NzKHtcIm1hcmdpbi1sZWZ0XCI6cC5zZXR0aW5ncy53aWR0aC8yLTIqcC5zZXR0aW5ncy5hcnJvd1dpZHRofSl9aWYoXCJib3R0b20tcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pe3ZhciBtPWQuZmluZChcIi50aXBzb19hcnJvd1wiKS5lcSgwKTttLmNzcyh7XCJtYXJnaW4tbGVmdFwiOi1wLnNldHRpbmdzLndpZHRoLzIsXCJtYXJnaW4tdG9wXCI6XCJcIn0pfWlmKFwiYm90dG9tLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pe3ZhciBtPWQuZmluZChcIi50aXBzb19hcnJvd1wiKS5lcSgwKTttLmNzcyh7XCJtYXJnaW4tbGVmdFwiOnAuc2V0dGluZ3Mud2lkdGgvMi0yKnAuc2V0dGluZ3MuYXJyb3dXaWR0aCxcIm1hcmdpbi10b3BcIjpcIlwifSl9bjxmLnNjcm9sbExlZnQoKSYmKFwiYm90dG9tXCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Om4tcC5zZXR0aW5ncy5hcnJvd1dpZHRofSksbj0wKSxuK3Auc2V0dGluZ3Mud2lkdGg+Zi5vdXRlcldpZHRoKCkmJihcImJvdHRvbVwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3BcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYoYT1mLm91dGVyV2lkdGgoKS0obitwLnNldHRpbmdzLndpZHRoKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1hLXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLG4rPWEpLG48Zi5zY3JvbGxMZWZ0KCkmJihcImxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwicmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcC1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImJvdHRvbS1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJib3R0b20tbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKS8yLWUoZCkud2lkdGgvMixkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIikscihkKSxkLmFkZENsYXNzKFwidG9wXCIpKSxuK3Auc2V0dGluZ3Mud2lkdGg+Zi5vdXRlcldpZHRoKCkmJihhPWYub3V0ZXJXaWR0aCgpLShuK3Auc2V0dGluZ3Mud2lkdGgpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LWEtcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksbis9YSksbjxmLnNjcm9sbExlZnQoKSYmKGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6bi1wLnNldHRpbmdzLmFycm93V2lkdGh9KSxuPTApKSxuK3Auc2V0dGluZ3Mud2lkdGg+Zi5vdXRlcldpZHRoKCkmJihcImxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwicmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcC1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImJvdHRvbS1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJib3R0b20tcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYobj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkvMi1lKGQpLndpZHRoLzIsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSksbitwLnNldHRpbmdzLndpZHRoPmYub3V0ZXJXaWR0aCgpJiYoYT1mLm91dGVyV2lkdGgoKS0obitwLnNldHRpbmdzLndpZHRoKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1hLXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLG4rPWEpLG48Zi5zY3JvbGxMZWZ0KCkmJihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Om4tcC5zZXR0aW5ncy5hcnJvd1dpZHRofSksbj0wKSksZC5jc3Moe2xlZnQ6bitwLnNldHRpbmdzLm9mZnNldFgsdG9wOmkrcC5zZXR0aW5ncy5vZmZzZXRZfSksaTxmLnNjcm9sbFRvcCgpJiYoXCJyaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJsZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKGwudGlwc28oXCJ1cGRhdGVcIixcInBvc2l0aW9uXCIsXCJib3R0b21cIikscyhwKSksaStlKGQpLmhlaWdodD5mLnNjcm9sbFRvcCgpK2Yub3V0ZXJIZWlnaHQoKSYmKFwicmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwibGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihsLnRpcHNvKFwidXBkYXRlXCIsXCJwb3NpdGlvblwiLFwidG9wXCIpLHMocCkpfXZhciBpPVwidGlwc29cIixuPXtzcGVlZDo0MDAsYmFja2dyb3VuZDpcIiM1NWI1NTVcIix0aXRsZUJhY2tncm91bmQ6XCIjMzMzMzMzXCIsY29sb3I6XCIjZmZmZmZmXCIsdGl0bGVDb2xvcjpcIiNmZmZmZmZcIix0aXRsZUNvbnRlbnQ6XCJcIixzaG93QXJyb3c6ITAscG9zaXRpb246XCJ0b3BcIix3aWR0aDoyMDAsbWF4V2lkdGg6XCJcIixkZWxheToyMDAsaGlkZURlbGF5OjAsYW5pbWF0aW9uSW46XCJcIixhbmltYXRpb25PdXQ6XCJcIixvZmZzZXRYOjAsb2Zmc2V0WTowLGFycm93V2lkdGg6OCx0b29sdGlwSG92ZXI6ITEsY29udGVudDpudWxsLGFqYXhDb250ZW50VXJsOm51bGwsYWpheENvbnRlbnRCdWZmZXI6MCxjb250ZW50RWxlbWVudElkOm51bGwsdXNlVGl0bGU6ITEsdGVtcGxhdGVFbmdpbmVGdW5jOm51bGwsb25CZWZvcmVTaG93Om51bGwsb25TaG93Om51bGwsb25IaWRlOm51bGx9O3QuZXh0ZW5kKG8ucHJvdG90eXBlLHtpbml0OmZ1bmN0aW9uKCl7e3ZhciB0PXRoaXMsbz10aGlzLiRlbGVtZW50O3RoaXMuZG9jfWlmKG8uYWRkQ2xhc3MoXCJ0aXBzb19zdHlsZVwiKS5yZW1vdmVBdHRyKFwidGl0bGVcIiksdC5zZXR0aW5ncy50b29sdGlwSG92ZXIpe3ZhciBlPW51bGwscj1udWxsO28ub24oXCJtb3VzZW92ZXIuXCIraSxmdW5jdGlvbigpe2NsZWFyVGltZW91dChlKSxjbGVhclRpbWVvdXQocikscj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC5zaG93KCl9LDE1MCl9KSxvLm9uKFwibW91c2VvdXQuXCIraSxmdW5jdGlvbigpe2NsZWFyVGltZW91dChlKSxjbGVhclRpbWVvdXQociksZT1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC5oaWRlKCl9LDIwMCksdC50b29sdGlwKCkub24oXCJtb3VzZW92ZXIuXCIraSxmdW5jdGlvbigpe3QubW9kZT1cInRvb2x0aXBIb3ZlclwifSkub24oXCJtb3VzZW91dC5cIitpLGZ1bmN0aW9uKCl7dC5tb2RlPVwic2hvd1wiLGNsZWFyVGltZW91dChlKSxlPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0LmhpZGUoKX0sMjAwKX0pfSl9ZWxzZSBvLm9uKFwibW91c2VvdmVyLlwiK2ksZnVuY3Rpb24oKXt0LnNob3coKX0pLG8ub24oXCJtb3VzZW91dC5cIitpLGZ1bmN0aW9uKCl7dC5oaWRlKCl9KTt0LnNldHRpbmdzLmFqYXhDb250ZW50VXJsJiYodC5hamF4Q29udGVudD1udWxsKX0sdG9vbHRpcDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnRpcHNvX2J1YmJsZXx8KHRoaXMudGlwc29fYnViYmxlPXQoJzxkaXYgY2xhc3M9XCJ0aXBzb19idWJibGVcIj48ZGl2IGNsYXNzPVwidGlwc29fdGl0bGVcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGlwc29fY29udGVudFwiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXBzb19hcnJvd1wiPjwvZGl2PjwvZGl2PicpKSx0aGlzLnRpcHNvX2J1YmJsZX0sc2hvdzpmdW5jdGlvbigpe3ZhciBvPXRoaXMudG9vbHRpcCgpLGU9dGhpcyxyPXRoaXMud2luO2Uuc2V0dGluZ3Muc2hvd0Fycm93PT09ITE/by5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmhpZGUoKTpvLmZpbmQoXCIudGlwc29fYXJyb3dcIikuc2hvdygpLFwiaGlkZVwiPT09ZS5tb2RlJiYodC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25CZWZvcmVTaG93KSYmZS5zZXR0aW5ncy5vbkJlZm9yZVNob3coZS4kZWxlbWVudCxlLmVsZW1lbnQsZSksZS5zZXR0aW5ncy5zaXplJiZvLmFkZENsYXNzKGUuc2V0dGluZ3Muc2l6ZSksZS5zZXR0aW5ncy53aWR0aD9vLmNzcyh7YmFja2dyb3VuZDplLnNldHRpbmdzLmJhY2tncm91bmQsY29sb3I6ZS5zZXR0aW5ncy5jb2xvcix3aWR0aDplLnNldHRpbmdzLndpZHRofSkuaGlkZSgpOmUuc2V0dGluZ3MubWF4V2lkdGg/by5jc3Moe2JhY2tncm91bmQ6ZS5zZXR0aW5ncy5iYWNrZ3JvdW5kLGNvbG9yOmUuc2V0dGluZ3MuY29sb3IsbWF4V2lkdGg6ZS5zZXR0aW5ncy5tYXhXaWR0aH0pLmhpZGUoKTpvLmNzcyh7YmFja2dyb3VuZDplLnNldHRpbmdzLmJhY2tncm91bmQsY29sb3I6ZS5zZXR0aW5ncy5jb2xvcix3aWR0aDoyMDB9KS5oaWRlKCksby5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmNzcyh7YmFja2dyb3VuZDplLnNldHRpbmdzLnRpdGxlQmFja2dyb3VuZCxjb2xvcjplLnNldHRpbmdzLnRpdGxlQ29sb3J9KSxvLmZpbmQoXCIudGlwc29fY29udGVudFwiKS5odG1sKGUuY29udGVudCgpKSxvLmZpbmQoXCIudGlwc29fdGl0bGVcIikuaHRtbChlLnRpdGxlQ29udGVudCgpKSxzKGUpLHIub24oXCJyZXNpemUuXCIraSxmdW5jdGlvbigpe2Uuc2V0dGluZ3MucG9zaXRpb249ZS5zZXR0aW5ncy5wcmVmZXJlZFBvc2l0aW9uLHMoZSl9KSx3aW5kb3cuY2xlYXJUaW1lb3V0KGUudGltZW91dCksZS50aW1lb3V0PW51bGwsZS50aW1lb3V0PXdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5pZUZhZGV8fFwiXCI9PT1lLnNldHRpbmdzLmFuaW1hdGlvbklufHxcIlwiPT09ZS5zZXR0aW5ncy5hbmltYXRpb25PdXQ/by5hcHBlbmRUbyhcImJvZHlcIikuc3RvcCghMCwhMCkuZmFkZUluKGUuc2V0dGluZ3Muc3BlZWQsZnVuY3Rpb24oKXtlLm1vZGU9XCJzaG93XCIsdC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25TaG93KSYmZS5zZXR0aW5ncy5vblNob3coZS4kZWxlbWVudCxlLmVsZW1lbnQsZSl9KTpvLnJlbW92ZSgpLmFwcGVuZFRvKFwiYm9keVwiKS5zdG9wKCEwLCEwKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uT3V0KS5hZGRDbGFzcyhcIm5vQW5pbWF0aW9uXCIpLnJlbW92ZUNsYXNzKFwibm9BbmltYXRpb25cIikuYWRkQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbkluKS5mYWRlSW4oZS5zZXR0aW5ncy5zcGVlZCxmdW5jdGlvbigpe3QodGhpcykub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7dCh0aGlzKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uSW4pfSksZS5tb2RlPVwic2hvd1wiLHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uU2hvdykmJmUuc2V0dGluZ3Mub25TaG93KGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpLHIub2ZmKFwicmVzaXplLlwiK2ksbnVsbCxcInRpcHNvUmVzaXplSGFuZGxlclwiKX0pfSxlLnNldHRpbmdzLmRlbGF5KSl9LGhpZGU6ZnVuY3Rpb24obyl7dmFyIGU9dGhpcyxyPXRoaXMud2luLHM9dGhpcy50b29sdGlwKCksbj1lLnNldHRpbmdzLmhpZGVEZWxheTtvJiYobj0wLGUubW9kZT1cInNob3dcIiksd2luZG93LmNsZWFyVGltZW91dChlLnRpbWVvdXQpLGUudGltZW91dD1udWxsLGUudGltZW91dD13aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1widG9vbHRpcEhvdmVyXCIhPT1lLm1vZGUmJihlLmllRmFkZXx8XCJcIj09PWUuc2V0dGluZ3MuYW5pbWF0aW9uSW58fFwiXCI9PT1lLnNldHRpbmdzLmFuaW1hdGlvbk91dD9zLnN0b3AoITAsITApLmZhZGVPdXQoZS5zZXR0aW5ncy5zcGVlZCxmdW5jdGlvbigpe3QodGhpcykucmVtb3ZlKCksdC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25IaWRlKSYmXCJzaG93XCI9PT1lLm1vZGUmJmUuc2V0dGluZ3Mub25IaWRlKGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpLGUubW9kZT1cImhpZGVcIixyLm9mZihcInJlc2l6ZS5cIitpLG51bGwsXCJ0aXBzb1Jlc2l6ZUhhbmRsZXJcIil9KTpzLnN0b3AoITAsITApLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25JbikuYWRkQ2xhc3MoXCJub0FuaW1hdGlvblwiKS5yZW1vdmVDbGFzcyhcIm5vQW5pbWF0aW9uXCIpLmFkZENsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25PdXQpLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe3QodGhpcykucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbk91dCkucmVtb3ZlKCksdC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25IaWRlKSYmXCJzaG93XCI9PT1lLm1vZGUmJmUuc2V0dGluZ3Mub25IaWRlKGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpLGUubW9kZT1cImhpZGVcIixyLm9mZihcInJlc2l6ZS5cIitpLG51bGwsXCJ0aXBzb1Jlc2l6ZUhhbmRsZXJcIil9KSl9LG4pfSxjbG9zZTpmdW5jdGlvbigpe3RoaXMuaGlkZSghMCl9LGRlc3Ryb3k6ZnVuY3Rpb24oKXt7dmFyIHQ9dGhpcy4kZWxlbWVudCxvPXRoaXMud2luO3RoaXMuZG9jfXQub2ZmKFwiLlwiK2kpLG8ub2ZmKFwicmVzaXplLlwiK2ksbnVsbCxcInRpcHNvUmVzaXplSGFuZGxlclwiKSx0LnJlbW92ZURhdGEoaSksdC5yZW1vdmVDbGFzcyhcInRpcHNvX3N0eWxlXCIpLmF0dHIoXCJ0aXRsZVwiLHRoaXMuX3RpdGxlKX0sdGl0bGVDb250ZW50OmZ1bmN0aW9uKCl7dmFyIHQsbz10aGlzLiRlbGVtZW50LGU9dGhpcztyZXR1cm4gdD1lLnNldHRpbmdzLnRpdGxlQ29udGVudD9lLnNldHRpbmdzLnRpdGxlQ29udGVudDpvLmRhdGEoXCJ0aXBzby10aXRsZVwiKX0sY29udGVudDpmdW5jdGlvbigpe3ZhciBvLGU9dGhpcy4kZWxlbWVudCxyPXRoaXMscz10aGlzLl90aXRsZTtyZXR1cm4gci5zZXR0aW5ncy5hamF4Q29udGVudFVybD9yLl9hamF4Q29udGVudD9vPXIuX2FqYXhDb250ZW50OihyLl9hamF4Q29udGVudD1vPXQuYWpheCh7dHlwZTpcIkdFVFwiLHVybDpyLnNldHRpbmdzLmFqYXhDb250ZW50VXJsLGFzeW5jOiExfSkucmVzcG9uc2VUZXh0LHIuc2V0dGluZ3MuYWpheENvbnRlbnRCdWZmZXI+MD9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ci5fYWpheENvbnRlbnQ9bnVsbH0sci5zZXR0aW5ncy5hamF4Q29udGVudEJ1ZmZlcik6ci5fYWpheENvbnRlbnQ9bnVsbCk6ci5zZXR0aW5ncy5jb250ZW50RWxlbWVudElkP289dChcIiNcIityLnNldHRpbmdzLmNvbnRlbnRFbGVtZW50SWQpLnRleHQoKTpyLnNldHRpbmdzLmNvbnRlbnQ/bz1yLnNldHRpbmdzLmNvbnRlbnQ6ci5zZXR0aW5ncy51c2VUaXRsZT09PSEwP289czpcInN0cmluZ1wiPT10eXBlb2YgZS5kYXRhKFwidGlwc29cIikmJihvPWUuZGF0YShcInRpcHNvXCIpKSxudWxsIT09ci5zZXR0aW5ncy50ZW1wbGF0ZUVuZ2luZUZ1bmMmJihvPXIuc2V0dGluZ3MudGVtcGxhdGVFbmdpbmVGdW5jKG8pKSxvfSx1cGRhdGU6ZnVuY3Rpb24odCxvKXt2YXIgZT10aGlzO3JldHVybiBvP3ZvaWQoZS5zZXR0aW5nc1t0XT1vKTplLnNldHRpbmdzW3RdfX0pO3ZhciBhPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIikuc3R5bGUsbz1bXCJtc1wiLFwiT1wiLFwiTW96XCIsXCJXZWJraXRcIl07aWYoXCJcIj09PXQudHJhbnNpdGlvbilyZXR1cm4hMDtmb3IoO28ubGVuZ3RoOylpZihvLnBvcCgpK1wiVHJhbnNpdGlvblwiaW4gdClyZXR1cm4hMDtyZXR1cm4hMX0oKTt0W2ldPXQuZm5baV09ZnVuY3Rpb24oZSl7dmFyIHI9YXJndW1lbnRzO2lmKHZvaWQgMD09PWV8fFwib2JqZWN0XCI9PXR5cGVvZiBlKXJldHVybiB0aGlzIGluc3RhbmNlb2YgdHx8dC5leHRlbmQobixlKSx0aGlzLmVhY2goZnVuY3Rpb24oKXt0LmRhdGEodGhpcyxcInBsdWdpbl9cIitpKXx8dC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSxuZXcgbyh0aGlzLGUpKX0pO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBlJiZcIl9cIiE9PWVbMF0mJlwiaW5pdFwiIT09ZSl7dmFyIHM7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBuPXQuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2kpO258fChuPXQuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2ksbmV3IG8odGhpcyxlKSkpLG4gaW5zdGFuY2VvZiBvJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBuW2VdJiYocz1uW2VdLmFwcGx5KG4sQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwociwxKSkpLFwiZGVzdHJveVwiPT09ZSYmdC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSxudWxsKX0pLHZvaWQgMCE9PXM/czp0aGlzfX19KTsiLCJ2YXIgbXlUb29sdGlwID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkKCdbZGF0YS10b2dnbGU9dG9vbHRpcF0nKS50aXBzbyh7XHJcbiAgICAgICAgYmFja2dyb3VuZDogJyM0QTRBNEEnLFxyXG4gICAgICAgIHNpemU6ICdzbWFsbCcsXHJcbiAgICAgICAgZGVsYXk6IDEwMCxcclxuICAgICAgICBzcGVlZDogMTAwLFxyXG4gICAgICAgIG9uQmVmb3JlU2hvdzogZnVuY3Rpb24gKGVsZSwgdGlwc28pIHtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50ID0gZWxlLmRhdGEoJ29yaWdpbmFsLXRpdGxlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn0oKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgJG5vdHlmaV9idG49JCgnLmhlYWRlci1sb2dvX25vdHknKTtcclxuICBpZigkbm90eWZpX2J0bi5sZW5ndGg9PTEpcmV0dXJuO1xyXG5cclxuICAkLmdldCgnL2FjY291bnQvbm90aWZpY2F0aW9uJyxmdW5jdGlvbihkYXRhKXtcclxuICAgIGlmKCFkYXRhLm5vdGlmaWNhdGlvbnMgfHwgZGF0YS5ub3RpZmljYXRpb25zLmxlbmd0aD09MCkgcmV0dXJuO1xyXG5cclxuICAgIHZhciBvdXQ9JzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktYm94Pjx1bCBjbGFzcz1cImhlYWRlci1ub3R5LWxpc3RcIj4nO1xyXG4gICAgJG5vdHlmaV9idG4uZmluZCgnYScpLnJlbW92ZUF0dHIoJ2hyZWYnKTtcclxuICAgIHZhciBoYXNfbmV3PWZhbHNlO1xyXG4gICAgZm9yICh2YXIgaT0wO2k8ZGF0YS5ub3RpZmljYXRpb25zLmxlbmd0aDtpKyspe1xyXG4gICAgICBlbD1kYXRhLm5vdGlmaWNhdGlvbnNbaV07XHJcbiAgICAgIHZhciBpc19uZXc9KGVsLmlzX3ZpZXdlZD09MCAmJiBlbC50eXBlX2lkPT0yKVxyXG4gICAgICBvdXQrPSc8bGkgY2xhc3M9XCJoZWFkZXItbm90eS1pdGVtJysoaXNfbmV3PycgaGVhZGVyLW5vdHktaXRlbV9uZXcnOicnKSsnXCI+JztcclxuICAgICAgb3V0Kz0nPGRpdiBjbGFzcz1oZWFkZXItbm90eS1kYXRhPicrZWwuZGF0YSsnPC9kaXY+JztcclxuICAgICAgb3V0Kz0nPGRpdiBjbGFzcz1oZWFkZXItbm90eS10ZXh0PicrZWwudGV4dCsnPC9kaXY+JztcclxuICAgICAgb3V0Kz0nPC9saT4nO1xyXG4gICAgICBoYXNfbmV3PWhhc19uZXd8fGlzX25ldztcclxuICAgIH1cclxuXHJcbiAgICBvdXQrPSc8L3VsPic7XHJcbiAgICBvdXQrPSc8YSBjbGFzcz1cImJ0blwiIGhyZWY9XCIvYWNjb3VudC9ub3RpZmljYXRpb25cIj4nK2RhdGEuYnRuKyc8L2E+JztcclxuICAgIG91dCs9JzwvZGl2Pic7XHJcbiAgICAkKCcuaGVhZGVyJykuYXBwZW5kKG91dCk7XHJcblxyXG4gICAgaWYoaGFzX25ldyl7XHJcbiAgICAgICRub3R5ZmlfYnRuLmFkZENsYXNzKCd0b29sdGlwJykuYWRkQ2xhc3MoJ2hhcy1ub3R5Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgJG5vdHlmaV9idG4ub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBpZigkKCcuaGVhZGVyLW5vdHktYm94JykuaGFzQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJykpe1xyXG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5yZW1vdmVDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLmFkZENsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xyXG4gICAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xyXG5cclxuICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKCdoYXMtbm90eScpKXtcclxuICAgICAgICAgICQucG9zdCgnL2FjY291bnQvbm90aWZpY2F0aW9uJyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAkKCcuaGVhZGVyLWxvZ29fbm90eScpLnJlbW92ZUNsYXNzKCd0b29sdGlwJykucmVtb3ZlQ2xhc3MoJ2hhcy1ub3R5Jyk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLW5vdHktYm94Jykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcclxuICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xyXG4gICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5oZWFkZXItbm90eS1saXN0Jykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KVxyXG4gIH0sJ2pzb24nKTtcclxuXHJcbn0pKCk7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIG1lZ2FzbGlkZXIgPSAoZnVuY3Rpb24oKSB7XHJcbiAgdmFyIHNsaWRlcl9kYXRhPWZhbHNlO1xyXG4gIHZhciBjb250YWluZXJfaWQ9XCJzZWN0aW9uI21lZ2Ffc2xpZGVyXCI7XHJcbiAgdmFyIHBhcmFsbGF4X2dyb3VwPWZhbHNlO1xyXG4gIHZhciBwYXJhbGxheF90aW1lcj1mYWxzZTtcclxuICB2YXIgcGFyYWxsYXhfY291bnRlcj0wO1xyXG4gIHZhciBwYXJhbGxheF9kPTE7XHJcbiAgdmFyIG1vYmlsZV9tb2RlPS0xO1xyXG4gIHZhciBtYXhfdGltZV9sb2FkX3BpYz0zMDA7XHJcbiAgdmFyIG1vYmlsZV9zaXplPTcwMDtcclxuICB2YXIgcmVuZGVyX3NsaWRlX25vbT0wO1xyXG4gIHZhciB0b3RfaW1nX3dhaXQ7XHJcbiAgdmFyIHNsaWRlcztcclxuICB2YXIgc2xpZGVfc2VsZWN0X2JveDtcclxuICB2YXIgZWRpdG9yO1xyXG4gIHZhciB0aW1lb3V0SWQ7XHJcbiAgdmFyIHNjcm9sbF9wZXJpb2QgPSA1MDAwO1xyXG5cclxuICB2YXIgcG9zQXJyPVtcclxuICAgICdzbGlkZXJfX3RleHQtbHQnLCdzbGlkZXJfX3RleHQtY3QnLCdzbGlkZXJfX3RleHQtcnQnLFxyXG4gICAgJ3NsaWRlcl9fdGV4dC1sYycsJ3NsaWRlcl9fdGV4dC1jYycsJ3NsaWRlcl9fdGV4dC1yYycsXHJcbiAgICAnc2xpZGVyX190ZXh0LWxiJywnc2xpZGVyX190ZXh0LWNiJywnc2xpZGVyX190ZXh0LXJiJyxcclxuICBdO1xyXG4gIHZhciBwb3NfbGlzdD1bXHJcbiAgICAn0JvQtdCy0L4g0LLQtdGA0YUnLCfRhtC10L3RgtGAINCy0LXRgNGFJywn0L/RgNCw0LLQviDQstC10YDRhScsXHJcbiAgICAn0JvQtdCy0L4g0YbQtdC90YLRgCcsJ9GG0LXQvdGC0YAnLCfQv9GA0LDQstC+INGG0LXQvdGC0YAnLFxyXG4gICAgJ9Cb0LXQstC+INC90LjQtycsJ9GG0LXQvdGC0YAg0L3QuNC3Jywn0L/RgNCw0LLQviDQvdC40LcnLFxyXG4gIF07XHJcbiAgdmFyIHNob3dfZGVsYXk9W1xyXG4gICAgJ3Nob3dfbm9fZGVsYXknLFxyXG4gICAgJ3Nob3dfZGVsYXlfMDUnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMTAnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMTUnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMjAnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMjUnLFxyXG4gICAgJ3Nob3dfZGVsYXlfMzAnXHJcbiAgXTtcclxuICB2YXIgaGlkZV9kZWxheT1bXHJcbiAgICAnaGlkZV9ub19kZWxheScsXHJcbiAgICAnaGlkZV9kZWxheV8wNScsXHJcbiAgICAnaGlkZV9kZWxheV8xMCcsXHJcbiAgICAnaGlkZV9kZWxheV8xNScsXHJcbiAgICAnaGlkZV9kZWxheV8yMCdcclxuICBdO1xyXG4gIHZhciB5ZXNfbm9fYXJyPVtcclxuICAgICdubycsXHJcbiAgICAneWVzJ1xyXG4gIF07XHJcbiAgdmFyIHllc19ub192YWw9W1xyXG4gICAgJycsXHJcbiAgICAnZml4ZWRfX2Z1bGwtaGVpZ2h0J1xyXG4gIF07XHJcbiAgdmFyIGJ0bl9zdHlsZT1bXHJcbiAgICAnbm9uZScsXHJcbiAgICAnYm9yZG8nLFxyXG4gIF07XHJcbiAgdmFyIHNob3dfYW5pbWF0aW9ucz1bXHJcbiAgICBcIm5vdF9hbmltYXRlXCIsXHJcbiAgICBcImJvdW5jZUluXCIsXHJcbiAgICBcImJvdW5jZUluRG93blwiLFxyXG4gICAgXCJib3VuY2VJbkxlZnRcIixcclxuICAgIFwiYm91bmNlSW5SaWdodFwiLFxyXG4gICAgXCJib3VuY2VJblVwXCIsXHJcbiAgICBcImZhZGVJblwiLFxyXG4gICAgXCJmYWRlSW5Eb3duXCIsXHJcbiAgICBcImZhZGVJbkxlZnRcIixcclxuICAgIFwiZmFkZUluUmlnaHRcIixcclxuICAgIFwiZmFkZUluVXBcIixcclxuICAgIFwiZmxpcEluWFwiLFxyXG4gICAgXCJmbGlwSW5ZXCIsXHJcbiAgICBcImxpZ2h0U3BlZWRJblwiLFxyXG4gICAgXCJyb3RhdGVJblwiLFxyXG4gICAgXCJyb3RhdGVJbkRvd25MZWZ0XCIsXHJcbiAgICBcInJvdGF0ZUluVXBMZWZ0XCIsXHJcbiAgICBcInJvdGF0ZUluVXBSaWdodFwiLFxyXG4gICAgXCJqYWNrSW5UaGVCb3hcIixcclxuICAgIFwicm9sbEluXCIsXHJcbiAgICBcInpvb21JblwiXHJcbiAgXTtcclxuXHJcbiAgdmFyIGhpZGVfYW5pbWF0aW9ucz1bXHJcbiAgICBcIm5vdF9hbmltYXRlXCIsXHJcbiAgICBcImJvdW5jZU91dFwiLFxyXG4gICAgXCJib3VuY2VPdXREb3duXCIsXHJcbiAgICBcImJvdW5jZU91dExlZnRcIixcclxuICAgIFwiYm91bmNlT3V0UmlnaHRcIixcclxuICAgIFwiYm91bmNlT3V0VXBcIixcclxuICAgIFwiZmFkZU91dFwiLFxyXG4gICAgXCJmYWRlT3V0RG93blwiLFxyXG4gICAgXCJmYWRlT3V0TGVmdFwiLFxyXG4gICAgXCJmYWRlT3V0UmlnaHRcIixcclxuICAgIFwiZmFkZU91dFVwXCIsXHJcbiAgICBcImZsaXBPdXRYXCIsXHJcbiAgICBcImxpcE91dFlcIixcclxuICAgIFwibGlnaHRTcGVlZE91dFwiLFxyXG4gICAgXCJyb3RhdGVPdXRcIixcclxuICAgIFwicm90YXRlT3V0RG93bkxlZnRcIixcclxuICAgIFwicm90YXRlT3V0RG93blJpZ2h0XCIsXHJcbiAgICBcInJvdGF0ZU91dFVwTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVPdXRVcFJpZ2h0XCIsXHJcbiAgICBcImhpbmdlXCIsXHJcbiAgICBcInJvbGxPdXRcIlxyXG4gIF07XHJcbiAgdmFyIHN0VGFibGU7XHJcbiAgdmFyIHBhcmFsYXhUYWJsZTtcclxuXHJcbiAgZnVuY3Rpb24gaW5pdEltYWdlU2VydmVyU2VsZWN0KGVscykge1xyXG4gICAgaWYoZWxzLmxlbmd0aD09MClyZXR1cm47XHJcbiAgICBlbHMud3JhcCgnPGRpdiBjbGFzcz1cInNlbGVjdF9pbWdcIj4nKTtcclxuICAgIGVscz1lbHMucGFyZW50KCk7XHJcbiAgICBlbHMuYXBwZW5kKCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImZpbGVfYnV0dG9uXCI+PGkgY2xhc3M9XCJtY2UtaWNvIG1jZS1pLWJyb3dzZVwiPjwvaT48L2J1dHRvbj4nKTtcclxuICAgIC8qZWxzLmZpbmQoJ2J1dHRvbicpLm9uKCdjbGljaycsZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKCcjcm94eUN1c3RvbVBhbmVsMicpLmFkZENsYXNzKCdvcGVuJylcclxuICAgIH0pOyovXHJcbiAgICBmb3IgKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKykge1xyXG4gICAgICB2YXIgZWw9ZWxzLmVxKGkpLmZpbmQoJ2lucHV0Jyk7XHJcbiAgICAgIGlmKCFlbC5hdHRyKCdpZCcpKXtcclxuICAgICAgICBlbC5hdHRyKCdpZCcsJ2ZpbGVfJytpKydfJytEYXRlLm5vdygpKVxyXG4gICAgICB9XHJcbiAgICAgIHZhciB0X2lkPWVsLmF0dHIoJ2lkJyk7XHJcbiAgICAgIG1paGFpbGRldi5lbEZpbmRlci5yZWdpc3Rlcih0X2lkLCBmdW5jdGlvbiAoZmlsZSwgaWQpIHtcclxuICAgICAgICAvLyQodGhpcykudmFsKGZpbGUudXJsKS50cmlnZ2VyKCdjaGFuZ2UnLCBbZmlsZSwgaWRdKTtcclxuICAgICAgICAkKCcjJytpZCkudmFsKGZpbGUudXJsKS5jaGFuZ2UoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZmlsZV9idXR0b24nLCBmdW5jdGlvbigpe1xyXG4gICAgICB2YXIgJHRoaXM9JCh0aGlzKS5wcmV2KCk7XHJcbiAgICAgIHZhciBpZD0kdGhpcy5hdHRyKCdpZCcpO1xyXG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIub3Blbk1hbmFnZXIoe1xyXG4gICAgICAgIFwidXJsXCI6XCIvbWFuYWdlci9lbGZpbmRlcj9maWx0ZXI9aW1hZ2UmY2FsbGJhY2s9XCIraWQrXCImbGFuZz1ydVwiLFxyXG4gICAgICAgIFwid2lkdGhcIjpcImF1dG9cIixcclxuICAgICAgICBcImhlaWdodFwiOlwiYXV0b1wiLFxyXG4gICAgICAgIFwiaWRcIjppZFxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuSW5wdXQoZGF0YSl7XHJcbiAgICB2YXIgaW5wdXQ9JzxpbnB1dCBjbGFzcz1cIicgKyAoZGF0YS5pbnB1dENsYXNzIHx8ICcnKSArICdcIiB2YWx1ZT1cIicgKyAoZGF0YS52YWx1ZSB8fCAnJykgKyAnXCI+JztcclxuICAgIGlmKGRhdGEubGFiZWwpIHtcclxuICAgICAgaW5wdXQgPSAnPGxhYmVsPjxzcGFuPicgKyBkYXRhLmxhYmVsICsgJzwvc3Bhbj4nK2lucHV0Kyc8L2xhYmVsPic7XHJcbiAgICB9XHJcbiAgICBpZihkYXRhLnBhcmVudCkge1xyXG4gICAgICBpbnB1dCA9ICc8JytkYXRhLnBhcmVudCsnPicraW5wdXQrJzwvJytkYXRhLnBhcmVudCsnPic7XHJcbiAgICB9XHJcbiAgICBpbnB1dCA9ICQoaW5wdXQpO1xyXG5cclxuICAgIGlmKGRhdGEub25DaGFuZ2Upe1xyXG4gICAgICB2YXIgb25DaGFuZ2U7XHJcbiAgICAgIGlmKGRhdGEuYmluZCl7XHJcbiAgICAgICAgZGF0YS5iaW5kLmlucHV0PWlucHV0LmZpbmQoJ2lucHV0Jyk7XHJcbiAgICAgICAgb25DaGFuZ2UgPSBkYXRhLm9uQ2hhbmdlLmJpbmQoZGF0YS5iaW5kKTtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgb25DaGFuZ2UgPSBkYXRhLm9uQ2hhbmdlLmJpbmQoaW5wdXQuZmluZCgnaW5wdXQnKSk7XHJcbiAgICAgIH1cclxuICAgICAgaW5wdXQuZmluZCgnaW5wdXQnKS5vbignY2hhbmdlJyxvbkNoYW5nZSlcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlblNlbGVjdChkYXRhKXtcclxuICAgIHZhciBpbnB1dD0kKCc8c2VsZWN0Lz4nKTtcclxuXHJcbiAgICB2YXIgZWw9c2xpZGVyX2RhdGFbMF1bZGF0YS5ncl07XHJcbiAgICBpZihkYXRhLmluZGV4IT09ZmFsc2Upe1xyXG4gICAgICBlbD1lbFtkYXRhLmluZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBpZihlbFtkYXRhLnBhcmFtXSl7XHJcbiAgICAgIGRhdGEudmFsdWU9ZWxbZGF0YS5wYXJhbV07XHJcbiAgICB9ZWxzZXtcclxuICAgICAgZGF0YS52YWx1ZT0wO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGRhdGEuc3RhcnRfb3B0aW9uKXtcclxuICAgICAgaW5wdXQuYXBwZW5kKGRhdGEuc3RhcnRfb3B0aW9uKVxyXG4gICAgfVxyXG5cclxuICAgIGZvcih2YXIgaT0wO2k8ZGF0YS5saXN0Lmxlbmd0aDtpKyspe1xyXG4gICAgICB2YXIgdmFsO1xyXG4gICAgICB2YXIgdHh0PWRhdGEubGlzdFtpXTtcclxuICAgICAgaWYoZGF0YS52YWxfdHlwZT09MCl7XHJcbiAgICAgICAgdmFsPWRhdGEubGlzdFtpXTtcclxuICAgICAgfWVsc2UgaWYoZGF0YS52YWxfdHlwZT09MSl7XHJcbiAgICAgICAgdmFsPWk7XHJcbiAgICAgIH1lbHNlIGlmKGRhdGEudmFsX3R5cGU9PTIpe1xyXG4gICAgICAgIC8vdmFsPWRhdGEudmFsX2xpc3RbaV07XHJcbiAgICAgICAgdmFsPWk7XHJcbiAgICAgICAgdHh0PWRhdGEudmFsX2xpc3RbaV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBzZWw9KHZhbD09ZGF0YS52YWx1ZT8nc2VsZWN0ZWQnOicnKTtcclxuICAgICAgaWYoc2VsPT0nc2VsZWN0ZWQnKXtcclxuICAgICAgICBpbnB1dC5hdHRyKCd0X3ZhbCcsZGF0YS5saXN0W2ldKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgb3B0aW9uPSc8b3B0aW9uIHZhbHVlPVwiJyt2YWwrJ1wiICcrc2VsKyc+Jyt0eHQrJzwvb3B0aW9uPic7XHJcbiAgICAgIGlmKGRhdGEudmFsX3R5cGU9PTIpe1xyXG4gICAgICAgIG9wdGlvbj0kKG9wdGlvbikuYXR0cignY29kZScsZGF0YS5saXN0W2ldKTtcclxuICAgICAgfVxyXG4gICAgICBpbnB1dC5hcHBlbmQob3B0aW9uKVxyXG4gICAgfVxyXG5cclxuICAgIGlucHV0Lm9uKCdjaGFuZ2UnLGZ1bmN0aW9uICgpIHtcclxuICAgICAgZGF0YT10aGlzO1xyXG4gICAgICB2YXIgdmFsPWRhdGEuZWwudmFsKCk7XHJcbiAgICAgIHZhciBzbF9vcD1kYXRhLmVsLmZpbmQoJ29wdGlvblt2YWx1ZT0nK3ZhbCsnXScpO1xyXG4gICAgICB2YXIgY2xzPXNsX29wLnRleHQoKTtcclxuICAgICAgdmFyIGNoPXNsX29wLmF0dHIoJ2NvZGUnKTtcclxuICAgICAgaWYoIWNoKWNoPWNscztcclxuICAgICAgaWYoZGF0YS5pbmRleCE9PWZhbHNlKXtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLmluZGV4XVtkYXRhLnBhcmFtXT12YWw7XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdW2RhdGEucGFyYW1dPXZhbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgZGF0YS5vYmoucmVtb3ZlQ2xhc3MoZGF0YS5wcmVmaXgrZGF0YS5lbC5hdHRyKCd0X3ZhbCcpKTtcclxuICAgICAgZGF0YS5vYmouYWRkQ2xhc3MoZGF0YS5wcmVmaXgrY2gpO1xyXG4gICAgICBkYXRhLmVsLmF0dHIoJ3RfdmFsJyxjaCk7XHJcblxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBlbDppbnB1dCxcclxuICAgICAgb2JqOmRhdGEub2JqLFxyXG4gICAgICBncjpkYXRhLmdyLFxyXG4gICAgICBpbmRleDpkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTpkYXRhLnBhcmFtLFxyXG4gICAgICBwcmVmaXg6ZGF0YS5wcmVmaXh8fCcnXHJcbiAgICB9KSk7XHJcblxyXG4gICAgaWYoZGF0YS5wYXJlbnQpe1xyXG4gICAgICB2YXIgcGFyZW50PSQoJzwnK2RhdGEucGFyZW50KycvPicpO1xyXG4gICAgICBwYXJlbnQuYXBwZW5kKGlucHV0KTtcclxuICAgICAgcmV0dXJuIHBhcmVudDtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKGRhdGEpe1xyXG4gICAgdmFyIGFuaW1fc2VsPVtdO1xyXG4gICAgdmFyIG91dDtcclxuXHJcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3NwYW4+Jyk7XHJcbiAgICB9XHJcbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6c2hvd19hbmltYXRpb25zLFxyXG4gICAgICB2YWxfdHlwZTowLFxyXG4gICAgICBvYmo6ZGF0YS5vYmosXHJcbiAgICAgIGdyOmRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OmRhdGEuaW5kZXgsXHJcbiAgICAgIHBhcmFtOidzaG93X2FuaW1hdGlvbicsXHJcbiAgICAgIHByZWZpeDonc2xpZGVfJyxcclxuICAgICAgcGFyZW50OmRhdGEucGFyZW50XHJcbiAgICB9KSk7XHJcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcclxuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+0JfQsNC00LXRgNC20LrQsCDQv9C+0Y/QstC70LXQvdC40Y88L3NwYW4+Jyk7XHJcbiAgICB9XHJcbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6c2hvd19kZWxheSxcclxuICAgICAgdmFsX3R5cGU6MSxcclxuICAgICAgb2JqOmRhdGEub2JqLFxyXG4gICAgICBncjpkYXRhLmdyLFxyXG4gICAgICBpbmRleDpkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTonc2hvd19kZWxheScsXHJcbiAgICAgIHByZWZpeDonc2xpZGVfJyxcclxuICAgICAgcGFyZW50OmRhdGEucGFyZW50XHJcbiAgICB9KSk7XHJcblxyXG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxici8+Jyk7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCQ0L3QuNC80LDRhtC40Y8g0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OmhpZGVfYW5pbWF0aW9ucyxcclxuICAgICAgdmFsX3R5cGU6MCxcclxuICAgICAgb2JqOmRhdGEub2JqLFxyXG4gICAgICBncjpkYXRhLmdyLFxyXG4gICAgICBpbmRleDpkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTonaGlkZV9hbmltYXRpb24nLFxyXG4gICAgICBwcmVmaXg6J3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDpkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCX0LDQtNC10YDQttC60LAg0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OmhpZGVfZGVsYXksXHJcbiAgICAgIHZhbF90eXBlOjEsXHJcbiAgICAgIG9iajpkYXRhLm9iaixcclxuICAgICAgZ3I6ZGF0YS5ncixcclxuICAgICAgaW5kZXg6ZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06J2hpZGVfZGVsYXknLFxyXG4gICAgICBwcmVmaXg6J3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDpkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmKGRhdGEudHlwZT09MCl7XHJcbiAgICAgIG91dD0kKCc8ZGl2IGNsYXNzPVwiYW5pbV9zZWxcIi8+Jyk7XHJcbiAgICAgIG91dC5hcHBlbmQoYW5pbV9zZWwpO1xyXG4gICAgfVxyXG4gICAgaWYoZGF0YS50eXBlPT0xKXtcclxuICAgICAgb3V0PWFuaW1fc2VsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvdXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0X2VkaXRvcigpe1xyXG4gICAgJCgnI3cxJykucmVtb3ZlKCk7XHJcbiAgICAkKCcjdzFfYnV0dG9uJykucmVtb3ZlKCk7XHJcbiAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGU9c2xpZGVyX2RhdGFbMF0ubW9iaWxlLnNwbGl0KCc/JylbMF07XHJcblxyXG4gICAgdmFyIGVsPSQoJyNtZWdhX3NsaWRlcl9jb250cm9sZScpO1xyXG4gICAgdmFyIGJ0bnNfYm94PSQoJzxkaXYgY2xhc3M9XCJidG5fYm94XCIvPicpO1xyXG5cclxuICAgIGVsLmFwcGVuZCgnPGgyPtCj0L/RgNCw0LLQu9C10L3QuNC1PC9oMj4nKTtcclxuICAgIGVsLmFwcGVuZCgkKCc8dGV4dGFyZWEvPicse1xyXG4gICAgICB0ZXh0OkpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSxcclxuICAgICAgaWQ6J3NsaWRlX2RhdGEnLFxyXG4gICAgICBuYW1lOiBlZGl0b3JcclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgYnRuPSQoJzxidXR0b24gY2xhc3M9XCJcIi8+JykudGV4dChcItCQ0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xyXG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XHJcbiAgICBidG4ub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdoaWRlX3NsaWRlJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgYnRuPSQoJzxidXR0b24gY2xhc3M9XCJcIi8+JykudGV4dChcItCU0LXQsNC60YLQuNCy0LjRgNC+0LLQsNGC0Ywg0YHQu9Cw0LnQtFwiKTtcclxuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xyXG4gICAgYnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5hZGRDbGFzcygnaGlkZV9zbGlkZScpO1xyXG4gICAgfSk7XHJcbiAgICBlbC5hcHBlbmQoYnRuc19ib3gpO1xyXG5cclxuICAgIGVsLmFwcGVuZCgnPGgyPtCe0LHRidC40LUg0L/QsNGA0LDQvNC10YLRgNGLPC9oMj4nKTtcclxuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOnNsaWRlcl9kYXRhWzBdLm1vYmlsZSxcclxuICAgICAgbGFiZWw6XCLQodC70LDQudC0INC00LvRjyDRgtC10LvQtdGE0L7QvdCwXCIsXHJcbiAgICAgIGlucHV0Q2xhc3M6XCJmaWxlU2VsZWN0XCIsXHJcbiAgICAgIG9uQ2hhbmdlOmZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGU9JCh0aGlzKS52YWwoKVxyXG4gICAgICAgICQoJy5tb2JfYmcnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytzbGlkZXJfZGF0YVswXS5tb2JpbGUrJyknKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTpzbGlkZXJfZGF0YVswXS5mb24sXHJcbiAgICAgIGxhYmVsOlwi0J7RgdC90L7QvdC+0Lkg0YTQvtC9XCIsXHJcbiAgICAgIGlucHV0Q2xhc3M6XCJmaWxlU2VsZWN0XCIsXHJcbiAgICAgIG9uQ2hhbmdlOmZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5mb249JCh0aGlzKS52YWwoKVxyXG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytzbGlkZXJfZGF0YVswXS5mb24rJyknKVxyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG5cclxuICAgIHZhciBidG5fY2g9JCgnPGRpdiBjbGFzcz1cImJ0bnNcIi8+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKCc8aDM+0JrQvdC+0L/QutCwINC/0LXRgNC10YXQvtC00LAo0LTQu9GPINCf0Jog0LLQtdGA0YHQuNC4KTwvaDM+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6c2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQsXHJcbiAgICAgIGxhYmVsOlwi0KLQtdC60YHRglwiLFxyXG4gICAgICBvbkNoYW5nZTpmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQ9JCh0aGlzKS52YWwoKTtcclxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApLnRleHQoc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfSxcclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgYnV0X3NsPSQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCk7XHJcblxyXG4gICAgYnRuX2NoLmFwcGVuZCgnPGJyLz4nKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQoJzxzcGFuPtCe0YTQvtGA0LzQu9C10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDpidG5fc3R5bGUsXHJcbiAgICAgIHZhbF90eXBlOjAsXHJcbiAgICAgIG9iajpidXRfc2wsXHJcbiAgICAgIGdyOididXR0b24nLFxyXG4gICAgICBpbmRleDpmYWxzZSxcclxuICAgICAgcGFyYW06J2NvbG9yJ1xyXG4gICAgfSkpO1xyXG5cclxuICAgIGJ0bl9jaC5hcHBlbmQoJzxici8+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKCc8c3Bhbj7Qn9C+0LvQvtC20LXQvdC40LUg0LrQvdC+0L/QutC4PC9zcGFuPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OnBvc0FycixcclxuICAgICAgdmFsX2xpc3Q6cG9zX2xpc3QsXHJcbiAgICAgIHZhbF90eXBlOjIsXHJcbiAgICAgIG9iajpidXRfc2wucGFyZW50KCkucGFyZW50KCksXHJcbiAgICAgIGdyOididXR0b24nLFxyXG4gICAgICBpbmRleDpmYWxzZSxcclxuICAgICAgcGFyYW06J3BvcydcclxuICAgIH0pKTtcclxuXHJcbiAgICBidG5fY2guYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcclxuICAgICAgdHlwZTowLFxyXG4gICAgICBvYmo6YnV0X3NsLnBhcmVudCgpLFxyXG4gICAgICBncjonYnV0dG9uJyxcclxuICAgICAgaW5kZXg6ZmFsc2VcclxuICAgIH0pKTtcclxuICAgIGVsLmFwcGVuZChidG5fY2gpO1xyXG5cclxuICAgIHZhciBsYXllcj0kKCc8ZGl2IGNsYXNzPVwiZml4ZWRfbGF5ZXJcIi8+Jyk7XHJcbiAgICBsYXllci5hcHBlbmQoJzxoMj7QodGC0LDRgtC40YfQtdGB0LrQuNC1INGB0LvQvtC4PC9oMj4nKTtcclxuICAgIHZhciB0aD1cIjx0aD7ihJY8L3RoPlwiK1xyXG4gICAgICAgICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIitcclxuICAgICAgICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIitcclxuICAgICAgICAgICAgXCI8dGg+0KHQu9C+0Lkg0L3QsCDQstGB0Y4g0LLRi9GB0L7RgtGDPC90aD5cIitcclxuICAgICAgICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiK1xyXG4gICAgICAgICAgICBcIjx0aD7Ql9Cw0LTQtdGA0LbQutCwINC/0L7Rj9Cy0LvQtdC90LjRjzwvdGg+XCIrXHJcbiAgICAgICAgICAgIFwiPHRoPtCQ0L3QuNC80LDRhtC40Y8g0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC90aD5cIitcclxuICAgICAgICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiK1xyXG4gICAgICAgICAgICBcIjx0aD7QlNC10LnRgdGC0LLQuNC1PC90aD5cIjtcclxuICAgIHN0VGFibGU9JCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+Jyt0aCsnPC90cj48L3RhYmxlPicpO1xyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgdmFyIGRhdGE9c2xpZGVyX2RhdGFbMF0uZml4ZWQ7XHJcbiAgICBpZihkYXRhICYmIGRhdGEubGVuZ3RoPjApe1xyXG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgYWRkVHJTdGF0aWMoZGF0YVtpXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGxheWVyLmFwcGVuZChzdFRhYmxlKTtcclxuICAgIHZhciBhZGRCdG49JCgnPGJ1dHRvbi8+Jyx7XHJcbiAgICAgIHRleHQ6XCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcclxuICAgIH0pO1xyXG4gICAgYWRkQnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZGF0YSA9IGFkZFRyU3RhdGljKGZhbHNlKTtcclxuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIHNsaWRlcl9kYXRhOnNsaWRlcl9kYXRhXHJcbiAgICB9KSk7XHJcbiAgICBsYXllci5hcHBlbmQoYWRkQnRuKTtcclxuICAgIGVsLmFwcGVuZChsYXllcik7XHJcblxyXG4gICAgdmFyIGxheWVyPSQoJzxkaXYgY2xhc3M9XCJwYXJhbGF4X2xheWVyXCIvPicpO1xyXG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0J/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuDwvaDI+Jyk7XHJcbiAgICB2YXIgdGg9XCI8dGg+4oSWPC90aD5cIitcclxuICAgICAgXCI8dGg+0JrQsNGA0YLQuNC90LrQsDwvdGg+XCIrXHJcbiAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIrXHJcbiAgICAgIFwiPHRoPtCj0LTQsNC70LXQvdC90L7RgdGC0YwgKNGG0LXQu9C+0LUg0L/QvtC70L7QttC40YLQtdC70YzQvdC+0LUg0YfQuNGB0LvQvik8L3RoPlwiK1xyXG4gICAgICBcIjx0aD7QlNC10LnRgdGC0LLQuNC1PC90aD5cIjtcclxuXHJcbiAgICBwYXJhbGF4VGFibGU9JCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+Jyt0aCsnPC90cj48L3RhYmxlPicpO1xyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgdmFyIGRhdGE9c2xpZGVyX2RhdGFbMF0ucGFyYWxheDtcclxuICAgIGlmKGRhdGEgJiYgZGF0YS5sZW5ndGg+MCl7XHJcbiAgICAgIGZvcih2YXIgaT0wO2k8ZGF0YS5sZW5ndGg7aSsrKXtcclxuICAgICAgICBhZGRUclBhcmFsYXgoZGF0YVtpXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGxheWVyLmFwcGVuZChwYXJhbGF4VGFibGUpO1xyXG4gICAgdmFyIGFkZEJ0bj0kKCc8YnV0dG9uLz4nLHtcclxuICAgICAgdGV4dDpcItCU0L7QsdCw0LLQuNGC0Ywg0YHQu9C+0LlcIlxyXG4gICAgfSk7XHJcbiAgICBhZGRCdG4ub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBkYXRhID0gYWRkVHJQYXJhbGF4KGZhbHNlKTtcclxuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIHNsaWRlcl9kYXRhOnNsaWRlcl9kYXRhXHJcbiAgICB9KSk7XHJcblxyXG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XHJcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xyXG5cclxuICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChlbC5maW5kKCcuZmlsZVNlbGVjdCcpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFRyU3RhdGljKGRhdGEpIHtcclxuICAgIHZhciBpPXN0VGFibGUuZmluZCgndHInKS5sZW5ndGgtMTtcclxuICAgIGlmKCFkYXRhKXtcclxuICAgICAgZGF0YT17XHJcbiAgICAgICAgXCJpbWdcIjpcIlwiLFxyXG4gICAgICAgIFwiZnVsbF9oZWlnaHRcIjowLFxyXG4gICAgICAgIFwicG9zXCI6MCxcclxuICAgICAgICBcInNob3dfZGVsYXlcIjoxLFxyXG4gICAgICAgIFwic2hvd19hbmltYXRpb25cIjpcImxpZ2h0U3BlZWRJblwiLFxyXG4gICAgICAgIFwiaGlkZV9kZWxheVwiOjEsXHJcbiAgICAgICAgXCJoaWRlX2FuaW1hdGlvblwiOlwiYm91bmNlT3V0XCJcclxuICAgICAgfTtcclxuICAgICAgc2xpZGVyX2RhdGFbMF0uZml4ZWQucHVzaChkYXRhKTtcclxuICAgICAgdmFyIGZpeCA9ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAnKTtcclxuICAgICAgYWRkU3RhdGljTGF5ZXIoZGF0YSwgZml4LHRydWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgdHI9JCgnPHRyLz4nKTtcclxuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcclxuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOmRhdGEuaW1nLFxyXG4gICAgICBsYWJlbDpmYWxzZSxcclxuICAgICAgcGFyZW50Oid0ZCcsXHJcbiAgICAgIGlucHV0Q2xhc3M6XCJmaWxlU2VsZWN0XCIsXHJcbiAgICAgIGJpbmQ6e1xyXG4gICAgICAgIGdyOidmaXhlZCcsXHJcbiAgICAgICAgaW5kZXg6aSxcclxuICAgICAgICBwYXJhbTonaW1nJyxcclxuICAgICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxyXG4gICAgICB9LFxyXG4gICAgICBvbkNoYW5nZTpmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIGRhdGE9dGhpcztcclxuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmlucHV0LnZhbCgpKycpJyk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uZml4ZWRbZGF0YS5pbmRleF0uaW1nPWRhdGEuaW5wdXQudmFsKCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDpwb3NBcnIsXHJcbiAgICAgIHZhbF9saXN0OnBvc19saXN0LFxyXG4gICAgICB2YWxfdHlwZToyLFxyXG4gICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXHJcbiAgICAgIGdyOidmaXhlZCcsXHJcbiAgICAgIGluZGV4OmksXHJcbiAgICAgIHBhcmFtOidwb3MnLFxyXG4gICAgICBwYXJlbnQ6J3RkJyxcclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0Onllc19ub192YWwsXHJcbiAgICAgIHZhbF9saXN0Onllc19ub19hcnIsXHJcbiAgICAgIHZhbF90eXBlOjIsXHJcbiAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKSxcclxuICAgICAgZ3I6J2ZpeGVkJyxcclxuICAgICAgaW5kZXg6aSxcclxuICAgICAgcGFyYW06J2Z1bGxfaGVpZ2h0JyxcclxuICAgICAgcGFyZW50Oid0ZCcsXHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoe1xyXG4gICAgICB0eXBlOjEsXHJcbiAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5maW5kKCcuYW5pbWF0aW9uX2xheWVyJyksXHJcbiAgICAgIGdyOidmaXhlZCcsXHJcbiAgICAgIGluZGV4OmksXHJcbiAgICAgIHBhcmVudDondGQnXHJcbiAgICB9KSk7XHJcbiAgICB2YXIgZGVsQnRuPSQoJzxidXR0b24vPicse1xyXG4gICAgICB0ZXh0Olwi0KPQtNCw0LvQuNGC0YxcIlxyXG4gICAgfSk7XHJcbiAgICBkZWxCdG4ub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB2YXIgJHRoaXM9JCh0aGlzLmVsKTtcclxuICAgICAgaT0kdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCktMTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHQu9C+0Lkg0L3QsCDRgdC70LDQudC00LXRgNC1XHJcbiAgICAgICR0aGlzLmNsb3Nlc3QoJ3RyJykucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHRgtGA0L7QutGDINCyINGC0LDQsdC70LjRhtC1XHJcbiAgICAgIHRoaXMuc2xpZGVyX2RhdGFbMF0uZml4ZWQuc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXHJcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgfS5iaW5kKHtcclxuICAgICAgZWw6ZGVsQnRuLFxyXG4gICAgICBzbGlkZXJfZGF0YTpzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0blRkPSQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XHJcbiAgICB0ci5hcHBlbmQoZGVsQnRuVGQpO1xyXG4gICAgc3RUYWJsZS5hcHBlbmQodHIpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZWRpdG9yOnRyLFxyXG4gICAgICBkYXRhOmRhdGFcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFRyUGFyYWxheChkYXRhKSB7XHJcbiAgICB2YXIgaT1wYXJhbGF4VGFibGUuZmluZCgndHInKS5sZW5ndGgtMTtcclxuICAgIGlmKCFkYXRhKXtcclxuICAgICAgZGF0YT17XHJcbiAgICAgICAgXCJpbWdcIjpcIlwiLFxyXG4gICAgICAgIFwielwiOjFcclxuICAgICAgfTtcclxuICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheC5wdXNoKGRhdGEpO1xyXG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwJyk7XHJcbiAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKTtcclxuICAgIH07XHJcbiAgICB2YXIgdHI9JCgnPHRyLz4nKTtcclxuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcclxuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOmRhdGEuaW1nLFxyXG4gICAgICBsYWJlbDpmYWxzZSxcclxuICAgICAgcGFyZW50Oid0ZCcsXHJcbiAgICAgIGlucHV0Q2xhc3M6XCJmaWxlU2VsZWN0XCIsXHJcbiAgICAgIGJpbmQ6e1xyXG4gICAgICAgIGluZGV4OmksXHJcbiAgICAgICAgcGFyYW06J2ltZycsXHJcbiAgICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXHJcbiAgICAgIH0sXHJcbiAgICAgIG9uQ2hhbmdlOmZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgICAgIGRhdGEub2JqLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW5wdXQudmFsKCkrJyknKTtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLmltZz1kYXRhLmlucHV0LnZhbCgpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6cG9zQXJyLFxyXG4gICAgICB2YWxfbGlzdDpwb3NfbGlzdCxcclxuICAgICAgdmFsX3R5cGU6MixcclxuICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXHJcbiAgICAgIGdyOidwYXJhbGF4JyxcclxuICAgICAgaW5kZXg6aSxcclxuICAgICAgcGFyYW06J3BvcycsXHJcbiAgICAgIHBhcmVudDondGQnLFxyXG4gICAgICBzdGFydF9vcHRpb246JzxvcHRpb24gdmFsdWU9XCJcIiBjb2RlPVwiXCI+0L3QsCDQstC10YHRjCDRjdC60YDQsNC9PC9vcHRpb24+J1xyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6ZGF0YS56LFxyXG4gICAgICBsYWJlbDpmYWxzZSxcclxuICAgICAgcGFyZW50Oid0ZCcsXHJcbiAgICAgIGJpbmQ6e1xyXG4gICAgICAgIGluZGV4OmksXHJcbiAgICAgICAgcGFyYW06J2ltZycsXHJcbiAgICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKSxcclxuICAgICAgfSxcclxuICAgICAgb25DaGFuZ2U6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBkYXRhPXRoaXM7XHJcbiAgICAgICAgZGF0YS5vYmouYXR0cigneicsZGF0YS5pbnB1dC52YWwoKSk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS56PWRhdGEuaW5wdXQudmFsKCk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGRlbEJ0bj0kKCc8YnV0dG9uLz4nLHtcclxuICAgICAgdGV4dDpcItCj0LTQsNC70LjRgtGMXCJcclxuICAgIH0pO1xyXG4gICAgZGVsQnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICR0aGlzPSQodGhpcy5lbCk7XHJcbiAgICAgIGk9JHRoaXMuY2xvc2VzdCgndHInKS5pbmRleCgpLTE7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxyXG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxyXG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLnBhcmFsYXguc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXHJcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgfS5iaW5kKHtcclxuICAgICAgZWw6ZGVsQnRuLFxyXG4gICAgICBzbGlkZXJfZGF0YTpzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0blRkPSQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XHJcbiAgICB0ci5hcHBlbmQoZGVsQnRuVGQpO1xyXG4gICAgcGFyYWxheFRhYmxlLmFwcGVuZCh0cilcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlZGl0b3I6dHIsXHJcbiAgICAgIGRhdGE6ZGF0YVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkX2FuaW1hdGlvbihlbCxkYXRhKXtcclxuICAgIHZhciBvdXQ9JCgnPGRpdi8+Jyx7XHJcbiAgICAgICdjbGFzcyc6J2FuaW1hdGlvbl9sYXllcidcclxuICAgIH0pO1xyXG5cclxuICAgIGlmKHR5cGVvZihkYXRhLnNob3dfZGVsYXkpIT0ndW5kZWZpbmVkJyl7XHJcbiAgICAgIG91dC5hZGRDbGFzcyhzaG93X2RlbGF5W2RhdGEuc2hvd19kZWxheV0pO1xyXG4gICAgICBpZihkYXRhLnNob3dfYW5pbWF0aW9uKXtcclxuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycrZGF0YS5zaG93X2FuaW1hdGlvbik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZih0eXBlb2YoZGF0YS5oaWRlX2RlbGF5KSE9J3VuZGVmaW5lZCcpe1xyXG4gICAgICBvdXQuYWRkQ2xhc3MoaGlkZV9kZWxheVtkYXRhLmhpZGVfZGVsYXldKTtcclxuICAgICAgaWYoZGF0YS5oaWRlX2FuaW1hdGlvbil7XHJcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nK2RhdGEuaGlkZV9hbmltYXRpb24pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZWwuYXBwZW5kKG91dCk7XHJcbiAgICByZXR1cm4gZWw7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5lcmF0ZV9zbGlkZShkYXRhKXtcclxuICAgIHZhciBzbGlkZT0kKCc8ZGl2IGNsYXNzPVwic2xpZGVcIi8+Jyk7XHJcblxyXG4gICAgdmFyIG1vYl9iZz0kKCc8YSBjbGFzcz1cIm1vYl9iZ1wiIGhyZWY9XCInK2RhdGEuYnV0dG9uLmhyZWYrJ1wiLz4nKTtcclxuICAgIG1vYl9iZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLm1vYmlsZSsnKScpXHJcblxyXG4gICAgc2xpZGUuYXBwZW5kKG1vYl9iZyk7XHJcbiAgICBpZihtb2JpbGVfbW9kZSl7XHJcbiAgICAgIHJldHVybiBzbGlkZTtcclxuICAgIH1cclxuXHJcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINGE0L7QvSDRgtC+INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgaWYoZGF0YS5mb24pe1xyXG4gICAgICBzbGlkZS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmZvbisnKScpXHJcbiAgICB9XHJcblxyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgaWYoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGg+MCl7XHJcbiAgICAgIHZhciBwYXJhbGF4X2dyPSQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fZ3JvdXBcIi8+Jyk7XHJcbiAgICAgIGZvcih2YXIgaT0wO2k8ZGF0YS5wYXJhbGF4Lmxlbmd0aDtpKyspe1xyXG4gICAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLnBhcmFsYXhbaV0scGFyYWxheF9ncilcclxuICAgICAgfVxyXG4gICAgICBzbGlkZS5hcHBlbmQocGFyYWxheF9ncilcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZml4PSQoJzxkaXYgY2xhc3M9XCJmaXhlZF9ncm91cFwiLz4nKTtcclxuICAgIGZvcih2YXIgaT0wO2k8ZGF0YS5maXhlZC5sZW5ndGg7aSsrKXtcclxuICAgICAgYWRkU3RhdGljTGF5ZXIoZGF0YS5maXhlZFtpXSxmaXgpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRvcF9ibGs9JChcIjxkaXYgY2xhc3M9J2ZpeGVkX19sYXllcicvPlwiKTtcclxuICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEuYnV0dG9uLnBvc10pO1xyXG4gICAgdmFyIGJ1dD0kKFwiPGEgY2xhc3M9J3NsaWRlcl9faHJlZicvPlwiKTtcclxuICAgIGJ1dC5hdHRyKCdocmVmJyxkYXRhLmJ1dHRvbi5ocmVmKTtcclxuICAgIGJ1dC50ZXh0KGRhdGEuYnV0dG9uLnRleHQpO1xyXG4gICAgYnV0LmFkZENsYXNzKGRhdGEuYnV0dG9uLmNvbG9yKTtcclxuICAgIGRvcF9ibGs9YWRkX2FuaW1hdGlvbihkb3BfYmxrLGRhdGEuYnV0dG9uKTtcclxuICAgIGRvcF9ibGsuZmluZCgnZGl2JykuYXBwZW5kKGJ1dCk7XHJcbiAgICBmaXguYXBwZW5kKGRvcF9ibGspO1xyXG5cclxuICAgIHNsaWRlLmFwcGVuZChmaXgpO1xyXG4gICAgcmV0dXJuIHNsaWRlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkUGFyYWxheExheWVyKGRhdGEscGFyYWxheF9ncil7XHJcbiAgICB2YXIgcGFyYWxsYXhfbGF5ZXI9JCgnPGRpdiBjbGFzcz1cInBhcmFsbGF4X19sYXllclwiXFw+Jyk7XHJcbiAgICBwYXJhbGxheF9sYXllci5hdHRyKCd6JyxkYXRhLnp8fGkqMTApO1xyXG4gICAgdmFyIGRvcF9ibGs9JChcIjxzcGFuIGNsYXNzPSdzbGlkZXJfX3RleHQnLz5cIik7XHJcbiAgICBpZihkYXRhLnBvcykge1xyXG4gICAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLnBvc10pO1xyXG4gICAgfVxyXG4gICAgZG9wX2Jsay5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xyXG4gICAgcGFyYWxsYXhfbGF5ZXIuYXBwZW5kKGRvcF9ibGspO1xyXG4gICAgcGFyYWxheF9nci5hcHBlbmQocGFyYWxsYXhfbGF5ZXIpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkU3RhdGljTGF5ZXIoZGF0YSxmaXgsYmVmb3JfYnV0dG9uKXtcclxuICAgIHZhciBkb3BfYmxrPSQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XHJcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLnBvc10pO1xyXG4gICAgaWYoZGF0YS5mdWxsX2hlaWdodCl7XHJcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MoJ2ZpeGVkX19mdWxsLWhlaWdodCcpO1xyXG4gICAgfVxyXG4gICAgZG9wX2Jsaz1hZGRfYW5pbWF0aW9uKGRvcF9ibGssZGF0YSk7XHJcbiAgICBkb3BfYmxrLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xyXG5cclxuICAgIGlmKGJlZm9yX2J1dHRvbil7XHJcbiAgICAgIGZpeC5maW5kKCcuc2xpZGVyX19ocmVmJykuY2xvc2VzdCgnLmZpeGVkX19sYXllcicpLmJlZm9yZShkb3BfYmxrKVxyXG4gICAgfWVsc2Uge1xyXG4gICAgICBmaXguYXBwZW5kKGRvcF9ibGspXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xyXG4gICAgaWYoJCgnI21lZ2Ffc2xpZGVyJykuaGFzQ2xhc3MoJ3N0b3Bfc2xpZGUnKSlyZXR1cm47XHJcblxyXG4gICAgdmFyIHNsaWRlX3BvaW50cz0kKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVfc2VsZWN0JylcclxuICAgIHZhciBzbGlkZV9jbnQ9c2xpZGVfcG9pbnRzLmxlbmd0aDtcclxuICAgIHZhciBhY3RpdmU9JCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5pbmRleCgpKzE7XHJcbiAgICBpZihhY3RpdmU+PXNsaWRlX2NudClhY3RpdmU9MDtcclxuICAgIHNsaWRlX3BvaW50cy5lcShhY3RpdmUpLmNsaWNrKCk7XHJcblxyXG4gICAgc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGltZ190b19sb2FkKHNyYyl7XHJcbiAgICB2YXIgaW1nPSQoJzxpbWcvPicpO1xyXG4gICAgaW1nLm9uKCdsb2FkJyxmdW5jdGlvbigpe1xyXG4gICAgICB0b3RfaW1nX3dhaXQtLTtcclxuXHJcbiAgICAgIGlmKHRvdF9pbWdfd2FpdD09MCl7XHJcblxyXG4gICAgICAgIHNsaWRlcy5hcHBlbmQoZ2VuZXJhdGVfc2xpZGUoc2xpZGVyX2RhdGFbcmVuZGVyX3NsaWRlX25vbV0pKTtcclxuICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEocmVuZGVyX3NsaWRlX25vbSkucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcblxyXG4gICAgICAgIGlmKHJlbmRlcl9zbGlkZV9ub209PTApe1xyXG4gICAgICAgICAgc2xpZGVzLmZpbmQoJy5zbGlkZScpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgaWYoIWVkaXRvcikge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5maXJzdF9zaG93JykucmVtb3ZlQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcclxuICAgICAgICAgICAgfS5iaW5kKHNsaWRlcyksIDUwMDApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmKG1vYmlsZV9tb2RlPT09ZmFsc2UpIHtcclxuICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XHJcbiAgICAgICAgICAgIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICBwYXJhbGxheF90aW1lciA9IHNldEludGVydmFsKHJlbmRlciwgMTAwKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZihlZGl0b3Ipe1xyXG4gICAgICAgICAgICBpbml0X2VkaXRvcigpXHJcbiAgICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XHJcblxyXG4gICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCcpLm9uKCdjbGljaycsJy5zbGlkZV9zZWxlY3QnLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgdmFyICR0aGlzPSQodGhpcyk7XHJcbiAgICAgICAgICAgICAgaWYoJHRoaXMuaGFzQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKSlyZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgIHZhciBpbmRleCA9ICR0aGlzLmluZGV4KCk7XHJcbiAgICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICR0aGlzLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkKycgLnNsaWRlLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkKycgLnNsaWRlJykuZXEoaW5kZXgpLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgIHBhcmFsbGF4X2dyb3VwID0gJChjb250YWluZXJfaWQgKyAnIC5zbGlkZXItYWN0aXZlIC5wYXJhbGxheF9fZ3JvdXA+KicpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmhvdmVyKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5hZGRDbGFzcygnc3RvcF9zbGlkZScpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcclxuICAgICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5yZW1vdmVDbGFzcygnc3RvcF9zbGlkZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlbmRlcl9zbGlkZV9ub20rKztcclxuICAgICAgICBpZihyZW5kZXJfc2xpZGVfbm9tPHNsaWRlcl9kYXRhLmxlbmd0aCl7XHJcbiAgICAgICAgICBsb2FkX3NsaWRlX2ltZygpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KS5vbignZXJyb3InLGZ1bmN0aW9uICgpIHtcclxuICAgICAgdG90X2ltZ193YWl0LS07XHJcbiAgICB9KTtcclxuICAgIGltZy5wcm9wKCdzcmMnLHNyYyk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBsb2FkX3NsaWRlX2ltZygpe1xyXG4gICAgdmFyIGRhdGE9c2xpZGVyX2RhdGFbcmVuZGVyX3NsaWRlX25vbV07XHJcbiAgICB0b3RfaW1nX3dhaXQ9MTtcclxuXHJcbiAgICBpZihtb2JpbGVfbW9kZT09PWZhbHNlKXtcclxuICAgICAgdG90X2ltZ193YWl0Kys7XHJcbiAgICAgIGltZ190b19sb2FkKGRhdGEuZm9uKTtcclxuICAgICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxyXG4gICAgICBpZihkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aD4wKXtcclxuICAgICAgICB0b3RfaW1nX3dhaXQrPWRhdGEucGFyYWxheC5sZW5ndGg7XHJcbiAgICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLnBhcmFsYXgubGVuZ3RoO2krKykge1xyXG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5wYXJhbGF4W2ldLmltZylcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYoZGF0YS5maXhlZCAmJiBkYXRhLmZpeGVkLmxlbmd0aD4wKSB7XHJcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEuZml4ZWQubGVuZ3RoO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5maXhlZFtpXS5pbWcpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW1nX3RvX2xvYWQoZGF0YS5tb2JpbGUpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3RhcnRfaW5pdF9zbGlkZShkYXRhKXtcclxuICAgIHZhciBuID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICB2YXIgaW1nPSQoJzxpbWcvPicpO1xyXG4gICAgaW1nLmF0dHIoJ3RpbWUnLG4pO1xyXG5cclxuICAgIGZ1bmN0aW9uIG9uX2ltZ19sb2FkKCl7XHJcbiAgICAgIHZhciBuID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgIGltZz0kKHRoaXMpO1xyXG4gICAgICBuPW4tcGFyc2VJbnQoaW1nLmF0dHIoJ3RpbWUnKSk7XHJcbiAgICAgIGlmKG4+bWF4X3RpbWVfbG9hZF9waWMpe1xyXG4gICAgICAgIG1vYmlsZV9tb2RlPXRydWU7XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIHZhciBtYXhfc2l6ZT0oc2NyZWVuLmhlaWdodD5zY3JlZW4ud2lkdGg/c2NyZWVuLmhlaWdodDpzY3JlZW4ud2lkdGgpO1xyXG4gICAgICAgIGlmKG1heF9zaXplPG1vYmlsZV9zaXplKXtcclxuICAgICAgICAgIG1vYmlsZV9tb2RlPXRydWU7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICBtb2JpbGVfbW9kZT1mYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYobW9iaWxlX21vZGU9PXRydWUpe1xyXG4gICAgICAgICQoY29udGFpbmVyX2lkKS5hZGRDbGFzcygnbW9iaWxlX21vZGUnKVxyXG4gICAgICB9XHJcbiAgICAgIHJlbmRlcl9zbGlkZV9ub209MDtcclxuICAgICAgbG9hZF9zbGlkZV9pbWcoKTtcclxuICAgIH07XHJcblxyXG4gICAgaW1nLm9uKCdsb2FkJyxvbl9pbWdfbG9hZCgpKTtcclxuICAgIGlmKHNsaWRlcl9kYXRhLmxlbmd0aD4wKSB7XHJcbiAgICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9IHNsaWRlcl9kYXRhWzBdLm1vYmlsZSArICc/cj0nICsgTWF0aC5yYW5kb20oKTtcclxuICAgICAgaW1nLnByb3AoJ3NyYycsIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgb25faW1nX2xvYWQoKS5iaW5kKGltZyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0KGRhdGEsZWRpdG9yX2luaXQpe1xyXG4gICAgc2xpZGVyX2RhdGE9ZGF0YTtcclxuICAgIGVkaXRvcj1lZGl0b3JfaW5pdDtcclxuICAgIC8v0L3QsNGF0L7QtNC40Lwg0LrQvtC90YLQtdC50L3QtdGAINC4INC+0YfQuNGJ0LDQtdC8INC10LPQvlxyXG4gICAgdmFyIGNvbnRhaW5lcj0kKGNvbnRhaW5lcl9pZCk7XHJcbiAgICBjb250YWluZXIuaHRtbCgnJyk7XHJcblxyXG4gICAgLy/RgdC+0LfQttCw0LXQvCDQsdCw0LfQvtCy0YvQtSDQutC+0L3RgtC10LnQvdC10YDRiyDQtNC70Y8g0YHQsNC80LjRhSDRgdC70LDQudC00L7QsiDQuCDQtNC70Y8g0L/QtdGA0LXQutC70Y7Rh9Cw0YLQtdC70LXQuVxyXG4gICAgc2xpZGVzPSQoJzxkaXYvPicse1xyXG4gICAgICAnY2xhc3MnOidzbGlkZXMnXHJcbiAgICB9KTtcclxuICAgIHZhciBzbGlkZV9jb250cm9sPSQoJzxkaXYvPicse1xyXG4gICAgICAnY2xhc3MnOidzbGlkZV9jb250cm9sJ1xyXG4gICAgfSk7XHJcbiAgICBzbGlkZV9zZWxlY3RfYm94PSQoJzx1bC8+Jyx7XHJcbiAgICAgICdjbGFzcyc6J3NsaWRlX3NlbGVjdF9ib3gnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQuNC90LTQuNC60LDRgtC+0YAg0LfQsNCz0YDRg9C30LrQuFxyXG4gICAgdmFyIGw9JzxkaXYgY2xhc3M9XCJzay1mb2xkaW5nLWN1YmVcIj4nK1xyXG4gICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMSBzay1jdWJlXCI+PC9kaXY+JytcclxuICAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTIgc2stY3ViZVwiPjwvZGl2PicrXHJcbiAgICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmU0IHNrLWN1YmVcIj48L2Rpdj4nK1xyXG4gICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMyBzay1jdWJlXCI+PC9kaXY+JytcclxuICAgICAgICc8L2Rpdj4nO1xyXG4gICAgY29udGFpbmVyLmh0bWwobCk7XHJcblxyXG5cclxuICAgIHN0YXJ0X2luaXRfc2xpZGUoZGF0YVswXSk7XHJcblxyXG4gICAgLy/Qs9C10L3QtdGA0LjRgNGD0LXQvCDQutC90L7Qv9C60Lgg0Lgg0YHQu9Cw0LnQtNGLXHJcbiAgICBmb3IgKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xyXG4gICAgICAvL3NsaWRlcy5hcHBlbmQoZ2VuZXJhdGVfc2xpZGUoZGF0YVtpXSkpO1xyXG4gICAgICBzbGlkZV9zZWxlY3RfYm94LmFwcGVuZCgnPGxpIGNsYXNzPVwic2xpZGVfc2VsZWN0IGRpc2FibGVkXCIvPicpXHJcbiAgICB9XHJcblxyXG4gICAgLypzbGlkZXMuZmluZCgnLnNsaWRlJykuZXEoMClcclxuICAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJylcclxuICAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93Jyk7XHJcbiAgICBzbGlkZV9jb250cm9sLmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTsqL1xyXG5cclxuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVzKTtcclxuICAgIHNsaWRlX2NvbnRyb2wuYXBwZW5kKHNsaWRlX3NlbGVjdF9ib3gpO1xyXG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZV9jb250cm9sKTtcclxuXHJcblxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyKCl7XHJcbiAgICBpZighcGFyYWxsYXhfZ3JvdXApcmV0dXJuIGZhbHNlO1xyXG4gICAgdmFyIHBhcmFsbGF4X2s9KHBhcmFsbGF4X2NvdW50ZXItMTApLzI7XHJcblxyXG4gICAgZm9yKHZhciBpPTA7aTxwYXJhbGxheF9ncm91cC5sZW5ndGg7aSsrKXtcclxuICAgICAgdmFyIGVsPXBhcmFsbGF4X2dyb3VwLmVxKGkpO1xyXG4gICAgICB2YXIgaj1lbC5hdHRyKCd6Jyk7XHJcbiAgICAgIHZhciB0cj0ncm90YXRlM2QoMC4xLDAuOCwwLCcrKHBhcmFsbGF4X2spKydkZWcpIHNjYWxlKCcrKDEraiowLjUpKycpIHRyYW5zbGF0ZVooLScrKDEwK2oqMjApKydweCknO1xyXG4gICAgICBlbC5jc3MoJ3RyYW5zZm9ybScsdHIpXHJcbiAgICB9XHJcbiAgICBwYXJhbGxheF9jb3VudGVyKz1wYXJhbGxheF9kKjAuMTtcclxuICAgIGlmKHBhcmFsbGF4X2NvdW50ZXI+PTIwKXBhcmFsbGF4X2Q9LXBhcmFsbGF4X2Q7XHJcbiAgICBpZihwYXJhbGxheF9jb3VudGVyPD0wKXBhcmFsbGF4X2Q9LXBhcmFsbGF4X2Q7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgaW5pdDogaW5pdFxyXG4gIH07XHJcbn0oKSk7XHJcbiIsInZhciBoZWFkZXJBY3Rpb25zID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG4gICAgdmFyIHNoYWRvd2VkRG93biA9IGZhbHNlO1xyXG5cclxuICAgICQoJy5tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgJCgnLmhlYWRlcicpLnRvZ2dsZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAgICAgJCgnLmRyb3AtbWVudScpLnJlbW92ZUNsYXNzKCdvcGVuJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJykuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKSkge1xyXG4gICAgICAgICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgJCgnLnNlYXJjaC10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XHJcbiAgICAgICAgJCgnI2F1dG9jb21wbGV0ZScpLmZhZGVPdXQoKTtcclxuICAgICAgICBpZiAoJCgnLmhlYWRlcicpLmhhc0NsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKSkge1xyXG4gICAgICAgICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcjaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpZiAoZS50YXJnZXQuaWQgPT0gJ2hlYWRlcicpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLXNlYXJjaF9mb3JtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJ2Zvcm0nKS5zdWJtaXQoKTtcclxuICAgIH0pO1xyXG5cclxuXHJcblxyXG4gICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lX2Nsb3NlJykuY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLXVwbGluZScpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgICQod2luZG93KS5vbignbG9hZCByZXNpemUgc2Nyb2xsJyxmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2hhZG93SGVpZ2h0ID0gNTA7XHJcbiAgICAgICAgdmFyIGhpZGVIZWlnaHQgPSAyMDA7XHJcbiAgICAgICAgdmFyIGhlYWRlclNlY29uZExpbmUgPSAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKTtcclxuICAgICAgICB2YXIgaG92ZXJzID0gaGVhZGVyU2Vjb25kTGluZS5maW5kKCc6aG92ZXInKTtcclxuICAgICAgICB2YXIgaGVhZGVyID0gJCgnLmhlYWRlcicpO1xyXG5cclxuICAgICAgICBpZiAoIWhvdmVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgICAgICAgICBoZWFkZXIucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgICAgICAgICAgLy9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXHJcbiAgICAgICAgICAgIHZhciBzY3JvbGxUb3A9JCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG4gICAgICAgICAgICBpZiAoc2Nyb2xsVG9wID4gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHNoYWRvd2VkRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzaGFkb3dlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPD0gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgc2hhZG93ZWREb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzaGFkb3dlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPiBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHNjcm9sbGVkRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzY3JvbGwtZG93bicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPD0gaGlkZUhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgICAgICAgICAgaGVhZGVyLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLm1lbnVfYW5nbGUtZG93biwgLmRyb3AtbWVudV9ncm91cF9fdXAtaGVhZGVyJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBtZW51T3BlbiA9ICQodGhpcykuY2xvc2VzdCgnLmhlYWRlcl9vcGVuLW1lbnUsIC5jYXRhbG9nLWNhdGVnb3JpZXMnKTtcclxuICAgICAgICBpZiAoIW1lbnVPcGVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnVfZ3JvdXBfX3VwLCAubWVudS1ncm91cCcpO1xyXG4gICAgICAgIHZhciBwYXJlbnRNZW51ID0gJCh0aGlzKS5jbG9zZXN0KCcuZHJvcC1tZW51Jyk7XHJcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgICAgICQocGFyZW50KS50b2dnbGVDbGFzcygnb3BlbicpO1xyXG4gICAgICAgICAgICBpZiAocGFyZW50Lmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgICAgICAgICAgICAgICQocGFyZW50KS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRNZW51KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmFkZENsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgYWNjb3VudE1lbnVUaW1lT3V0ID0gbnVsbDtcclxuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBtZW51ID0gJCgnLmFjY291bnQtbWVudScpO1xyXG4gICAgICAgIGlmIChtZW51KSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChhY2NvdW50TWVudVRpbWVPdXQpO1xyXG4gICAgICAgICAgICBtZW51LnRvZ2dsZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgaWYgKCFtZW51Lmhhc0NsYXNzKCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgYWNjb3VudE1lbnVUaW1lT3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICB9LCA3MDAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KTtcclxuXHJcblxyXG59KCk7XHJcblxyXG5cclxuXHJcblxyXG4iLCIkKGZ1bmN0aW9uKCkge1xyXG4gICAgZnVuY3Rpb24gcGFyc2VOdW0oc3RyKXtcclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChcclxuICAgICAgICAgICAgU3RyaW5nKHN0cilcclxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKCcsJywnLicpXHJcbiAgICAgICAgICAgICAgICAubWF0Y2goLy0/XFxkKyg/OlxcLlxcZCspPy9nLCAnJykgfHwgMFxyXG4gICAgICAgICAgICAsIDEwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAkKCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpLmZpbmQoJ3NlbGVjdCxpbnB1dCcpLm9uKCdjaGFuZ2Uga2V5dXAgY2xpY2snLGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKS5jbG9zZXN0KCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpO1xyXG4gICAgICAgIHZhciBjdXJzPXBhcnNlTnVtKCR0aGlzLmZpbmQoJ3NlbGVjdCcpLnZhbCgpKTtcclxuICAgICAgICB2YXIgdmFsPSR0aGlzLmZpbmQoJ2lucHV0JykudmFsKCk7XHJcbiAgICAgICAgaWYgKHBhcnNlTnVtKHZhbCkgIT0gdmFsKSB7XHJcbiAgICAgICAgICAgIHZhbD0kdGhpcy5maW5kKCdpbnB1dCcpLnZhbChwYXJzZU51bSh2YWwpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFsPXBhcnNlTnVtKHZhbCk7XHJcblxyXG4gICAgICAgIHZhciBrb2VmPSR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjaycpLnRyaW0oKTtcclxuICAgICAgICB2YXIgcHJvbW89JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLXByb21vJykudHJpbSgpO1xyXG4gICAgICAgIHZhciBjdXJyZW5jeT0kdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2stY3VycmVuY3knKS50cmltKCk7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IDA7XHJcbiAgICAgICAgdmFyIG91dCA9IDA7XHJcblxyXG4gICAgICAgIGlmIChrb2VmPT1wcm9tbykge1xyXG4gICAgICAgICAgICBwcm9tbz0wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoa29lZi5pbmRleE9mKCclJyk+MCl7XHJcbiAgICAgICAgICAgIHJlc3VsdD1wYXJzZU51bShrb2VmKSp2YWwqY3Vycy8xMDA7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGN1cnM9cGFyc2VOdW0oJHRoaXMuZmluZCgnW2NvZGU9JytjdXJyZW5jeSsnXScpLnZhbCgpKTtcclxuICAgICAgICAgICAgcmVzdWx0PXBhcnNlTnVtKGtvZWYpKmN1cnNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHBhcnNlTnVtKHByb21vKT4wKSB7XHJcbiAgICAgICAgICAgIGlmKHByb21vLmluZGV4T2YoJyUnKT4wKXtcclxuICAgICAgICAgICAgICAgIHByb21vPXBhcnNlTnVtKHByb21vKSp2YWwqY3Vycy8xMDA7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgcHJvbW89cGFyc2VOdW0ocHJvbW8pKmN1cnNcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYocHJvbW8+MCkge1xyXG4gICAgICAgICAgICAgICAgb3V0ID0gXCI8c3BhbiBjbGFzcz1vbGRfcHJpY2U+XCIgKyByZXN1bHQudG9GaXhlZCgyKSArIFwiPC9zcGFuPiBcIiArIHByb21vLnRvRml4ZWQoMilcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBvdXQ9cmVzdWx0LnRvRml4ZWQoMilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBvdXQ9cmVzdWx0LnRvRml4ZWQoMilcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAkdGhpcy5maW5kKCcuY2FsYy1yZXN1bHRfdmFsdWUnKS5odG1sKG91dClcclxuICAgIH0pLmNsaWNrKClcclxufSk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgZWxzPSQoJy5hdXRvX2hpZGVfY29udHJvbCcpO1xyXG4gIGlmKGVscy5sZW5ndGg9PTApcmV0dXJuO1xyXG5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLFwiLnNjcm9sbF9ib3gtc2hvd19tb3JlXCIsZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgZGF0YT17XHJcbiAgICAgIGJ1dHRvblllczpmYWxzZSxcclxuICAgICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIG5vdGlmeV9ub3RfYmlnXCJcclxuICAgIH07XHJcblxyXG4gICAgJHRoaXM9JCh0aGlzKTtcclxuICAgIHZhciBjb250ZW50ID0gJHRoaXMuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbScpLmNsb25lKCk7XHJcbiAgICBjb250ZW50PWNvbnRlbnRbMF07XHJcbiAgICBjb250ZW50LmNsYXNzTmFtZSArPSAnIHNjcm9sbF9ib3gtaXRlbS1tb2RhbCc7XHJcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBkaXYuY2xhc3NOYW1lID0gJ2NvbW1lbnRzJztcclxuICAgIGRpdi5hcHBlbmQoY29udGVudCk7XHJcbiAgICAkKGRpdikuZmluZCgnLnNjcm9sbF9ib3gtc2hvd19tb3JlJykucmVtb3ZlKCk7XHJcbiAgICAkKGRpdikuZmluZCgnLm1heF90ZXh0X2hpZGUnKVxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUteDInKVxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUnKTtcclxuICAgIGRhdGEucXVlc3Rpb249IGRpdi5vdXRlckhUTUw7XHJcblxyXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG4gIH0pO1xyXG5cclxuXHJcbiAgZnVuY3Rpb24gaGFzU2Nyb2xsKGVsKSB7XHJcbiAgICByZXR1cm4gZWwuc2Nyb2xsSGVpZ2h0PmVsLmNsaWVudEhlaWdodDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlYnVpbGQoKXtcclxuICAgIGZvcih2YXIgaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xyXG4gICAgICB2YXIgZWw9ZWxzLmVxKGkpO1xyXG4gICAgICB2YXIgaXNfaGlkZT1mYWxzZTtcclxuICAgICAgaWYoZWwuaGVpZ2h0KCk8MTApe1xyXG4gICAgICAgIGlzX2hpZGU9dHJ1ZTtcclxuICAgICAgICBlbC5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtLWhpZGUnKS5zaG93KDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgdGV4dD1lbC5maW5kKCcuc2Nyb2xsX2JveC10ZXh0Jyk7XHJcbiAgICAgIHZhciBhbnN3ZXI9ZWwuZmluZCgnLnNjcm9sbF9ib3gtYW5zd2VyJyk7XHJcbiAgICAgIHZhciBzaG93X21vcmU9ZWwuZmluZCgnLnNjcm9sbF9ib3gtc2hvd19tb3JlJyk7XHJcblxyXG4gICAgICB2YXIgc2hvd19idG49ZmFsc2U7XHJcbiAgICAgIGlmKGhhc1Njcm9sbCh0ZXh0WzBdKSl7XHJcbiAgICAgICAgc2hvd19idG49dHJ1ZTtcclxuICAgICAgICB0ZXh0LnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgdGV4dC5hZGRDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKGFuc3dlci5sZW5ndGg+MCl7XHJcbiAgICAgICAgLy/QtdGB0YLRjCDQvtGC0LLQtdGCINCw0LTQvNC40L3QsFxyXG4gICAgICAgIGlmKGhhc1Njcm9sbChhbnN3ZXJbMF0pKXtcclxuICAgICAgICAgIHNob3dfYnRuPXRydWU7XHJcbiAgICAgICAgICBhbnN3ZXIucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgYW5zd2VyLmFkZENsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKHNob3dfYnRuKXtcclxuICAgICAgICBzaG93X21vcmUuc2hvdygpO1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICBzaG93X21vcmUuaGlkZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZihpc19oaWRlKXtcclxuICAgICAgICBlbC5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtLWhpZGUnKS5oaWRlKDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkKHdpbmRvdykucmVzaXplKHJlYnVpbGQpO1xyXG4gIHJlYnVpbGQoKTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAkKCdib2R5Jykub24oJ2NsaWNrJywnLnNob3dfYWxsJyxmdW5jdGlvbihlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBjbHM9JCh0aGlzKS5kYXRhKCdjbnRybC1jbGFzcycpO1xyXG4gICAgJCgnLmhpZGVfYWxsW2RhdGEtY250cmwtY2xhc3NdJykuc2hvdygpO1xyXG4gICAgJCh0aGlzKS5oaWRlKCk7XHJcbiAgICAkKCcuJytjbHMpLnNob3coKTtcclxuICB9KTtcclxuXHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5oaWRlX2FsbCcsZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgY2xzPSQodGhpcykuZGF0YSgnY250cmwtY2xhc3MnKTtcclxuICAgICQoJy5zaG93X2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcclxuICAgICQodGhpcykuaGlkZSgpO1xyXG4gICAgJCgnLicrY2xzKS5oaWRlKCk7XHJcbiAgfSk7XHJcbn0pKCk7XHJcbiIsIiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gZGVjbE9mTnVtKG51bWJlciwgdGl0bGVzKSB7XHJcbiAgICBjYXNlcyA9IFsyLCAwLCAxLCAxLCAxLCAyXTtcclxuICAgIHJldHVybiB0aXRsZXNbIChudW1iZXIlMTAwPjQgJiYgbnVtYmVyJTEwMDwyMCk/IDIgOiBjYXNlc1sobnVtYmVyJTEwPDUpP251bWJlciUxMDo1XSBdO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmlyc3RaZXJvKHYpe1xyXG4gICAgdj1NYXRoLmZsb29yKHYpO1xyXG4gICAgaWYodjwxMClcclxuICAgICAgcmV0dXJuICcwJyt2O1xyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gdjtcclxuICB9XHJcblxyXG4gIHZhciBjbG9ja3M9JCgnLmNsb2NrJyk7XHJcbiAgaWYoY2xvY2tzLmxlbmd0aD4wKXtcclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUNsb2NrKCl7XHJcbiAgICAgIHZhciBjbG9ja3M9JCh0aGlzKTtcclxuICAgICAgdmFyIG5vdz1uZXcgRGF0ZSgpO1xyXG4gICAgICBmb3IodmFyIGk9MDtpPGNsb2Nrcy5sZW5ndGg7aSsrKXtcclxuICAgICAgICB2YXIgYz1jbG9ja3MuZXEoaSk7XHJcbiAgICAgICAgdmFyIGVuZD1uZXcgRGF0ZShjLmRhdGEoJ2VuZCcpLnJlcGxhY2UoLy0vZywgXCIvXCIpKTtcclxuICAgICAgICB2YXIgZD0oZW5kLmdldFRpbWUoKS1ub3cuZ2V0VGltZSgpKS8gMTAwMDtcclxuXHJcbiAgICAgICAgLy/QtdGB0LvQuCDRgdGA0L7QuiDQv9GA0L7RiNC10LtcclxuICAgICAgICBpZihkPD0wKXtcclxuICAgICAgICAgIGMudGV4dCgn0J/RgNC+0LzQvtC60L7QtCDQuNGB0YLQtdC6Jyk7XHJcbiAgICAgICAgICBjLmFkZENsYXNzKCdjbG9jay1leHBpcmVkJyk7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0LHQvtC70LXQtSAzMCDQtNC90LXQuVxyXG4gICAgICAgIGlmKGQ+MzAqNjAqNjAqMjQpe1xyXG4gICAgICAgICAgYy5odG1sKCfQntGB0YLQsNC70L7RgdGMOiA8c3Bhbj7QsdC+0LvQtdC1IDMwINC00L3QtdC5PC9zcGFuPicpO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcz1kICUgNjA7XHJcbiAgICAgICAgZD0oZC1zKS82MDtcclxuICAgICAgICB2YXIgbT1kICUgNjA7XHJcbiAgICAgICAgZD0oZC1tKS82MDtcclxuICAgICAgICB2YXIgaD1kICUgMjQ7XHJcbiAgICAgICAgZD0oZC1oKS8yNDtcclxuXHJcbiAgICAgICAgdmFyIHN0cj1maXJzdFplcm8oaCkrXCI6XCIrZmlyc3RaZXJvKG0pK1wiOlwiK2ZpcnN0WmVybyhzKTtcclxuICAgICAgICBpZihkPjApe1xyXG4gICAgICAgICAgc3RyPWQrXCIgXCIrZGVjbE9mTnVtKGQsIFsn0LTQtdC90YwnLCAn0LTQvdGPJywgJ9C00L3QtdC5J10pK1wiICBcIitzdHI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGMuaHRtbChcItCe0YHRgtCw0LvQvtGB0Yw6IDxzcGFuPlwiK3N0citcIjwvc3Bhbj5cIik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRJbnRlcnZhbCh1cGRhdGVDbG9jay5iaW5kKGNsb2NrcyksMTAwMCk7XHJcbiAgICB1cGRhdGVDbG9jay5iaW5kKGNsb2NrcykoKTtcclxuICB9XHJcblxyXG59KTsiLCJ2YXIgY2F0YWxvZ1R5cGVTd2l0Y2hlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhdGFsb2cgPSAkKCcuY2F0YWxvZ19saXN0Jyk7XHJcbiAgICBpZihjYXRhbG9nLmxlbmd0aD09MClyZXR1cm47XHJcblxyXG4gICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLmZpbmQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbicpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XHJcbiAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnY2hlY2tlZCcpO1xyXG4gICAgICAgIGlmIChjYXRhbG9nKSB7XHJcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdjYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLWxpc3QnKSkge1xyXG4gICAgICAgICAgICAgICAgY2F0YWxvZy5yZW1vdmVDbGFzcygnbmFycm93Jyk7XHJcbiAgICAgICAgICAgICAgICBzZXRDb29raWUoJ2NvdXBvbnNfdmlldycsJycpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2NhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbmFycm93JykpIHtcclxuICAgICAgICAgICAgICAgIGNhdGFsb2cuYWRkQ2xhc3MoJ25hcnJvdycpO1xyXG4gICAgICAgICAgICAgICAgc2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnLCduYXJyb3cnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGlmKGdldENvb2tpZSgnY291cG9uc192aWV3Jyk9PSduYXJyb3cnICYmICFjYXRhbG9nLmhhc0NsYXNzKCduYXJyb3dfb2ZmJykpe1xyXG4gICAgICAgIGNhdGFsb2cuYWRkQ2xhc3MoJ25hcnJvdycpO1xyXG4gICAgICAgICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLW5hcnJvdycpLmFkZENsYXNzKCdjaGVja2VkJyk7XHJcbiAgICAgICAgJCgnLmNhdGFsb2ctc3RvcmVzX3N3aXRjaGVyLWl0ZW0tYnV0dG9uLXR5cGUtbGlzdCcpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XHJcbiAgICB9XHJcbn0oKTsiLCIkKGZ1bmN0aW9uICgpIHtcclxuICAgICQoJy5zZC1zZWxlY3Qtc2VsZWN0ZWQnKS5jbGljayhmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgICAgIHZhciBkcm9wQmxvY2sgPSAkKHBhcmVudCkuZmluZCgnLnNkLXNlbGVjdC1kcm9wJyk7XHJcblxyXG4gICAgICAgIGlmKCBkcm9wQmxvY2suaXMoJzpoaWRkZW4nKSApIHtcclxuICAgICAgICAgICAgZHJvcEJsb2NrLnNsaWRlRG93bigpO1xyXG5cclxuICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXBhcmVudC5oYXNDbGFzcygnbGlua2VkJykpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCcuc2Qtc2VsZWN0LWRyb3AnKS5maW5kKCdhJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RSZXN1bHQgPSAkKHRoaXMpLmh0bWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChwYXJlbnQpLmZpbmQoJ2lucHV0JykudmFsKHNlbGVjdFJlc3VsdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQocGFyZW50KS5maW5kKCcuc2Qtc2VsZWN0LXNlbGVjdGVkJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLmh0bWwoc2VsZWN0UmVzdWx0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZHJvcEJsb2NrLnNsaWRlVXAoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBkcm9wQmxvY2suc2xpZGVVcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbn0pOyIsInNlYXJjaCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG9wZW5BdXRvY29tcGxldGU7XHJcblxyXG4gICAgJCgnLnNlYXJjaC1mb3JtLWlucHV0Jykub24oJ2lucHV0JywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICAgICAgdmFyIHF1ZXJ5ID0gJHRoaXMudmFsKCk7XHJcbiAgICAgICAgdmFyIGRhdGEgPSAkdGhpcy5jbG9zZXN0KCdmb3JtJykuc2VyaWFsaXplKCk7XHJcbiAgICAgICAgdmFyIGF1dG9jb21wbGV0ZSA9ICR0aGlzLmNsb3Nlc3QoJy5zdG9yZXNfc2VhcmNoJykuZmluZCgnLmF1dG9jb21wbGV0ZS13cmFwJyk7Ly8gJCgnI2F1dG9jb21wbGV0ZScpLFxyXG4gICAgICAgIHZhciBhdXRvY29tcGxldGVMaXN0ID0gJChhdXRvY29tcGxldGUpLmZpbmQoJ3VsJyk7XHJcbiAgICAgICAgb3BlbkF1dG9jb21wbGV0ZSAgPSBhdXRvY29tcGxldGU7XHJcbiAgICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aD4xKSB7XHJcbiAgICAgICAgICAgIHVybD0kdGhpcy5jbG9zZXN0KCdmb3JtJykuYXR0cignYWN0aW9uJyl8fCcvc2VhcmNoJztcclxuICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2dldCcsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnN1Z2dlc3Rpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuaHRtbCgnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zLmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWwgPSAnPGEgY2xhc3M9XCJhdXRvY29tcGxldGVfbGlua1wiIGhyZWY9XCInK2l0ZW0uZGF0YS5yb3V0ZSsnXCInKyc+JytpdGVtLnZhbHVlK2l0ZW0uY2FzaGJhY2srJzwvYT4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGkuaW5uZXJIVE1MID0gaHRtbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmFwcGVuZChsaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVJbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuaHRtbCgnJyk7XHJcbiAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZSkuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pLm9uKCdmb2N1c291dCcsZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgaWYgKCEkKGUucmVsYXRlZFRhcmdldCkuaGFzQ2xhc3MoJ2F1dG9jb21wbGV0ZV9saW5rJykpIHtcclxuICAgICAgICAgICAgLy8kKCcjYXV0b2NvbXBsZXRlJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKG9wZW5BdXRvY29tcGxldGUpLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCdib2R5Jykub24oJ3N1Ym1pdCcsICcuc3RvcmVzLXNlYXJjaF9mb3JtJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciB2YWwgPSAkKHRoaXMpLmZpbmQoJy5zZWFyY2gtZm9ybS1pbnB1dCcpLnZhbCgpO1xyXG4gICAgICAgIGlmICh2YWwubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcblxyXG59KCk7XHJcbiIsIihmdW5jdGlvbigpe1xyXG5cclxuICAgICQoJy5jb3Vwb25zLWxpc3RfaXRlbS1jb250ZW50LWdvdG8tcHJvbW9jb2RlLWxpbmsnKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgICAgICB2YXIgZXhwaXJlZCA9ICQodGhpcykuY2xvc2VzdCgnLmNvdXBvbnMtbGlzdF9pdGVtJykuZmluZCgnLmNsb2NrLWV4cGlyZWQnKTtcclxuICAgICAgICBpZiAoZXhwaXJlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciB0aXRsZSA9ICfQmiDRgdC+0LbQsNC70LXQvdC40Y4sINGB0YDQvtC6INC00LXQudGB0YLQstC40Y8g0LTQsNC90L3QvtCz0L4g0L/RgNC+0LzQvtC60L7QtNCwINC40YHRgtC10LonO1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9ICfQktGB0LUg0LTQtdC50YHRgtCy0YPRjtGJ0LjQtSDQv9GA0L7QvNC+0LrQvtC00Ysg0LLRiyDQvNC+0LbQtdGC0LUgPGEgaHJlZj1cIi9jb3Vwb25zXCI+0L/QvtGB0LzQvtGC0YDQtdGC0Ywg0LfQtNC10YHRjDwvYT4nO1xyXG4gICAgICAgICAgICBub3RpZmljYXRpb24uYWxlcnQoe1xyXG4gICAgICAgICAgICAgICAgJ3RpdGxlJzogdGl0bGUsXHJcbiAgICAgICAgICAgICAgICAncXVlc3Rpb24nOiBtZXNzYWdlLFxyXG4gICAgICAgICAgICAgICAgJ2J1dHRvblllcyc6ICdPaycsXHJcbiAgICAgICAgICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICdub3R5ZnlfY2xhc3MnOiAnbm90aWZ5X2JveC1hbGVydCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJCgnLmFjY291bnQtd2l0aGRyYXctbWV0aG9kc19pdGVtLW9wdGlvbicpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgb3B0aW9uID0gJCh0aGlzKS5kYXRhKCdvcHRpb24tcHJvY2VzcycpLFxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlciA9ICcnO1xyXG4gICAgICAgIHN3aXRjaChvcHRpb24pIHtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YHRh9GR0YLQsFwiO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCBSLdC60L7RiNC10LvRjNC60LBcIjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YLQtdC70LXRhNC+0L3QsFwiO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDQutCw0YDRgtGLXCI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSBlbWFpbCDQsNC00YDQtdGBXCI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINGC0LXQu9C10YTQvtC90LBcIjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAkKFwiI3VzZXJzd2l0aGRyYXctYmlsbFwiKS5hdHRyKFwicGxhY2Vob2xkZXJcIiwgcGxhY2Vob2xkZXIpO1xyXG4gICAgICAgICQoJyN1c2Vyc3dpdGhkcmF3LXByb2Nlc3NfaWQnKS52YWwob3B0aW9uKTtcclxuICAgIH0pO1xyXG5cclxufSkoKTsiLCIoZnVuY3Rpb24oKXtcclxuXHJcbiAgICBhamF4Rm9ybSgkKCcuYWpheF9mb3JtJykpO1xyXG5cclxufSkoKTsiLCIoZnVuY3Rpb24oKXtcclxuXHJcbiAgICAkKCcuZG9icm8tZnVuZHNfaXRlbS1idXR0b24nKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgICAgICAkKCcjZG9icm8tc2VuZC1mb3JtLWNoYXJpdHktcHJvY2VzcycpLnZhbCgkKHRoaXMpLmRhdGEoJ2lkJykpO1xyXG4gICAgfSk7XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbigpe1xyXG4gICAkKCcuY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQnKS50b2dnbGVDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtY2F0LW9wZW4nKTtcclxuICAgICAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUnKS50b2dnbGVDbGFzcygnY2F0YWxvZy1jYXRlZ29yaWVzX3RyZWUtdG9nZ2xlLW9wZW4nKTtcclxuICAgfSk7XHJcbiAgICQoJy5jYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtY2xvc2UnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLWNhdCcpLnRvZ2dsZUNsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS1jYXQtb3BlbicpO1xyXG4gICAgICAgJCgnLmNhdGFsb2ctY2F0ZWdvcmllc190cmVlLXRvZ2dsZScpLnRvZ2dsZUNsYXNzKCdjYXRhbG9nLWNhdGVnb3JpZXNfdHJlZS10b2dnbGUtb3BlbicpO1xyXG4gICB9KTtcclxufSkoKTsiLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uKCkge1xyXG4gIHZhciBjb250ZWluZXI7XHJcbiAgdmFyIG1vdXNlT3ZlciA9IDA7XHJcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xyXG4gIHZhciBhbmltYXRpb25FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCc7XHJcbiAgdmFyIHRpbWUgPSAxMDAwMDtcclxuXHJcbiAgdmFyIG5vdGlmaWNhdGlvbl9ib3ggPWZhbHNlO1xyXG4gIHZhciBpc19pbml0PWZhbHNlO1xyXG4gIHZhciBjb25maXJtX29wdD17XHJcbiAgICB0aXRsZTpcItCj0LTQsNC70LXQvdC40LVcIixcclxuICAgIHF1ZXN0aW9uOlwi0JLRiyDQtNC10LnRgdGC0LLQuNGC0LXQu9GM0L3QviDRhdC+0YLQuNGC0LUg0YPQtNCw0LvQuNGC0Yw/XCIsXHJcbiAgICBidXR0b25ZZXM6XCLQlNCwXCIsXHJcbiAgICBidXR0b25ObzpcItCd0LXRglwiLFxyXG4gICAgY2FsbGJhY2tZZXM6ZmFsc2UsXHJcbiAgICBjYWxsYmFja05vOmZhbHNlLFxyXG4gICAgb2JqOmZhbHNlLFxyXG4gICAgYnV0dG9uVGFnOidkaXYnLFxyXG4gICAgYnV0dG9uWWVzRG9wOicnLFxyXG4gICAgYnV0dG9uTm9Eb3A6JycsXHJcbiAgfTtcclxuICB2YXIgYWxlcnRfb3B0PXtcclxuICAgIHRpdGxlOlwiXCIsXHJcbiAgICBxdWVzdGlvbjpcItCh0L7QvtCx0YnQtdC90LjQtVwiLFxyXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxyXG4gICAgY2FsbGJhY2tZZXM6ZmFsc2UsXHJcbiAgICBidXR0b25UYWc6J2RpdicsXHJcbiAgICBvYmo6ZmFsc2UsXHJcbiAgfTtcclxuXHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoKXtcclxuICAgIGlzX2luaXQ9dHJ1ZTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcclxuICAgIGlmKG5vdGlmaWNhdGlvbl9ib3gubGVuZ3RoPjApcmV0dXJuO1xyXG5cclxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XHJcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcblxyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2NvbnRyb2wnLGNsb3NlTW9kYWwpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2Nsb3NlJyxjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJyxjbG9zZU1vZGFsRm9uKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKXtcclxuICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICQoJy5ub3RpZmljYXRpb25fYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoJycpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpe1xyXG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgIGlmKHRhcmdldC5jbGFzc05hbWU9PVwibm90aWZpY2F0aW9uX2JveFwiKXtcclxuICAgICAgY2xvc2VNb2RhbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubm90aWZpY2F0aW9uX2Nsb3NlJywgX2Nsb3NlUG9wdXApO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uTGVhdmUpO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25FbnRlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZihldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwhPW51bGwpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2xlYXJBbGwpO1xyXG4gICAgICB0aW1lckNsZWFyQWxsID0gbnVsbDtcclxuICAgIH1cclxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKGkpe1xyXG4gICAgICB2YXIgb3B0aW9uPSQodGhpcykuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmKG9wdGlvbi50aW1lcikge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChvcHRpb24udGltZXIpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDE7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9vbkxlYXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbihpKXtcclxuICAgICAgJHRoaXM9JCh0aGlzKTtcclxuICAgICAgdmFyIG9wdGlvbj0kdGhpcy5kYXRhKCdvcHRpb24nKTtcclxuICAgICAgaWYob3B0aW9uLnRpbWU+MCkge1xyXG4gICAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChvcHRpb24uY2xvc2UpLCBvcHRpb24udGltZSAtIDE1MDAgKyAxMDAgKiBpKTtcclxuICAgICAgICAkdGhpcy5kYXRhKCdvcHRpb24nLG9wdGlvbilcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAwO1xyXG4gIH07XHJcblxyXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZihldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAkdGhpcy5vbihhbmltYXRpb25FbmQsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xyXG4gICAgfSk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2hpZGUnKVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGFsZXJ0KGRhdGEpe1xyXG4gICAgaWYoIWRhdGEpZGF0YT17fTtcclxuICAgIGRhdGE9b2JqZWN0cyhhbGVydF9vcHQsZGF0YSk7XHJcblxyXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xyXG5cclxuICAgIG5vdHlmeV9jbGFzcz0nbm90aWZ5X2JveCAnO1xyXG4gICAgaWYoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzKz1kYXRhLm5vdHlmeV9jbGFzcztcclxuXHJcbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIicrbm90eWZ5X2NsYXNzKydcIj4nO1xyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnRpdGxlO1xyXG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiICcrZGF0YS5idXR0b25ZZXNEb3ArJz4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJytkYXRhLmJ1dHRvbk5vRG9wKyc+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9O1xyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sMTAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XHJcblxyXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xyXG5cclxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEucXVlc3Rpb247XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgaWYoZGF0YS5idXR0b25ZZXN8fGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LDEwMClcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xyXG4gICAgaWYoIWRhdGEpZGF0YT17fTtcclxuICAgIHZhciBvcHRpb24gPSB7dGltZSA6IChkYXRhLnRpbWV8fGRhdGEudGltZT09PTApP2RhdGEudGltZTp0aW1lfTtcclxuICAgIGlmICghY29udGVpbmVyKSB7XHJcbiAgICAgIGNvbnRlaW5lciA9ICQoJzx1bC8+Jywge1xyXG4gICAgICAgICdjbGFzcyc6ICdub3RpZmljYXRpb25fY29udGFpbmVyJ1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoY29udGVpbmVyKTtcclxuICAgICAgX3NldFVwTGlzdGVuZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGxpID0gJCgnPGxpLz4nLCB7XHJcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2l0ZW0nXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlKXtcclxuICAgICAgbGkuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9pdGVtLScgKyBkYXRhLnR5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjbG9zZT0kKCc8c3Bhbi8+Jyx7XHJcbiAgICAgIGNsYXNzOidub3RpZmljYXRpb25fY2xvc2UnXHJcbiAgICB9KTtcclxuICAgIG9wdGlvbi5jbG9zZT1jbG9zZTtcclxuICAgIGxpLmFwcGVuZChjbG9zZSk7XHJcblxyXG4gICAgdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcclxuICAgICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcclxuICAgICAgdmFyIHRpdGxlID0gJCgnPGg1Lz4nLCB7XHJcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcclxuICAgICAgfSk7XHJcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGV4dD0gJCgnPGRpdi8+Jyx7XHJcbiAgICAgIGNsYXNzOlwibm90aWZpY2F0aW9uX3RleHRcIlxyXG4gICAgfSk7XHJcbiAgICB0ZXh0Lmh0bWwoZGF0YS5tZXNzYWdlKTtcclxuXHJcbiAgICBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xyXG4gICAgICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxyXG4gICAgICB9KTtcclxuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XHJcbiAgICAgIHZhciB3cmFwID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIndyYXBcIlxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHdyYXAuYXBwZW5kKGltZyk7XHJcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh3cmFwKTtcclxuICAgIH1lbHNle1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh0ZXh0KTtcclxuICAgIH1cclxuICAgIGxpLmFwcGVuZChjb250ZW50KTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XHJcbiAgICAvLyAgIHZhciB0aXRsZSA9ICQoJzxwLz4nLCB7XHJcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcclxuICAgIC8vICAgfSk7XHJcbiAgICAvLyAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XHJcbiAgICAvLyAgIGxpLmFwcGVuZCh0aXRsZSk7XHJcbiAgICAvLyB9XHJcbiAgICAvL1xyXG4gICAgLy8gaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcclxuICAgIC8vICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcclxuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcclxuICAgIC8vICAgfSk7XHJcbiAgICAvLyAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xyXG4gICAgLy8gICBsaS5hcHBlbmQoaW1nKTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xyXG4gICAgLy8gICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcclxuICAgIC8vIH0pO1xyXG4gICAgLy8gY29udGVudC5odG1sKGRhdGEubWVzc2FnZSk7XHJcbiAgICAvL1xyXG4gICAgLy8gbGkuYXBwZW5kKGNvbnRlbnQpO1xyXG4gICAgLy9cclxuICAgICBjb250ZWluZXIuYXBwZW5kKGxpKTtcclxuXHJcbiAgICBpZihvcHRpb24udGltZT4wKXtcclxuICAgICAgb3B0aW9uLnRpbWVyPXNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChjbG9zZSksIG9wdGlvbi50aW1lKTtcclxuICAgIH1cclxuICAgIGxpLmRhdGEoJ29wdGlvbicsb3B0aW9uKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGFsZXJ0OiBhbGVydCxcclxuICAgIGNvbmZpcm06IGNvbmZpcm0sXHJcbiAgICBub3RpZmk6IG5vdGlmaSxcclxuICB9O1xyXG5cclxufSkoKTtcclxuXHJcblxyXG4kKCdbcmVmPXBvcHVwXScpLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpe1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcz0kKHRoaXMpO1xyXG4gIGVsPSQoJHRoaXMuYXR0cignaHJlZicpKTtcclxuICBkYXRhPWVsLmRhdGEoKTtcclxuXHJcbiAgZGF0YS5xdWVzdGlvbj1lbC5odG1sKCk7XHJcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG59KTtcclxuXHJcblxyXG4kKCcuZGlzYWJsZWQnKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKXtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXM9JCh0aGlzKTtcclxuICBkYXRhPSR0aGlzLmRhdGEoKTtcclxuICBpZihkYXRhWydidXR0b25feWVzJ10pZGF0YVsnYnV0dG9uWWVzJ109ZGF0YVsnYnV0dG9uX3llcyddXHJcblxyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCcubW9kYWxzX29wZW4nLGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuXHJcbiAgICAgICAgLy/Qv9GA0Lgg0L7RgtC60YDRi9GC0LjQuCDRhNC+0YDQvNGLINGA0LXQs9C40YHRgtGA0LDRhtC40Lgg0LfQsNC60YDRi9GC0YwsINC10YHQu9C4INC+0YLRgNGL0YLQviAtINC/0L7Qv9Cw0L8g0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40Y8g0LrRg9C/0L7QvdCwINCx0LXQtyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4XHJcbiAgICAgICAgdmFyIHBvcHVwID0gJChcImFbaHJlZj0nI3Nob3dwcm9tb2NvZGUtbm9yZWdpc3RlciddXCIpLmRhdGEoJ3BvcHVwJyk7XHJcbiAgICAgICAgaWYgKHBvcHVwKSB7XHJcbiAgICAgICAgICAgIHBvcHVwLmNsb3NlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcG9wdXAgPSAkKCdkaXYucG9wdXBfY29udCwgZGl2LnBvcHVwX2JhY2snKTtcclxuICAgICAgICAgICAgaWYgKHBvcHVwKSB7XHJcbiAgICAgICAgICAgICAgICBwb3B1cC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGhyZWY9dGhpcy5ocmVmLnNwbGl0KCcjJyk7XHJcbiAgICAgICAgaHJlZj1ocmVmW2hyZWYubGVuZ3RoLTFdO1xyXG5cclxuICAgICAgICBkYXRhPXtcclxuICAgICAgICAgICAgYnV0dG9uWWVzOmZhbHNlLFxyXG4gICAgICAgICAgICBub3R5ZnlfY2xhc3M6XCJsb2FkaW5nIFwiKyhocmVmLmluZGV4T2YoJ3ZpZGVvJyk9PT0wPydtb2RhbHMtZnVsbF9zY3JlZW4nOidub3RpZnlfd2hpdGUnKSxcclxuICAgICAgICAgICAgcXVlc3Rpb246JydcclxuICAgICAgICB9O1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuXHJcbiAgICAgICAgJC5nZXQoJy8nK2hyZWYsZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgICAgICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbChkYXRhLmh0bWwpO1xyXG4gICAgICAgICAgICBhamF4Rm9ybSgkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKSk7XHJcbiAgICAgICAgfSwnanNvbicpO1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pXHJcbn0oKSk7XHJcbiIsIiQoJy5mb290ZXItbWVudS10aXRsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgJHRoaXM9JCh0aGlzKTtcclxuICBpZigkdGhpcy5oYXNDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpKXtcclxuICAgICR0aGlzLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJylcclxuICB9ZWxzZXtcclxuICAgICQoJy5mb290ZXItbWVudS10aXRsZV9vcGVuJykucmVtb3ZlQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKTtcclxuICAgICR0aGlzLmFkZENsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XHJcbiAgfVxyXG5cclxufSk7IiwiJChmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gc3Rhck5vbWluYXRpb24oaW5kZXgpIHtcclxuICAgIHZhciBzdGFycyA9ICQoXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIpO1xyXG4gICAgc3RhcnMuYWRkQ2xhc3MoXCJyYXRpbmctc3Rhci1vcGVuXCIpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XHJcbiAgICAgIHN0YXJzLmVxKGkpLnJlbW92ZUNsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKFwibW91c2VvdmVyXCIsIFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcbiAgfSkub24oXCJtb3VzZWxlYXZlXCIsIFwiLnJhdGluZy13cmFwcGVyXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgpKTtcclxuICB9KS5vbihcImNsaWNrXCIsIFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcblxyXG4gICAgJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcbiAgfSk7XHJcbn0pOyIsIi8v0LjQt9Cx0YDQsNC90L3QvtC1XHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgJChcIi5zaG9wcyAuZmF2b3JpdGUtbGlua1wiKS5vbignY2xpY2snLGZ1bmN0aW9uKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICB2YXIgc2VsZiA9ICQodGhpcyk7XHJcbiAgICB2YXIgdHlwZSA9IHNlbGYuYXR0cihcImRhdGEtc3RhdGVcIiksXHJcbiAgICAgIGFmZmlsaWF0ZV9pZCA9IHNlbGYuYXR0cihcImRhdGEtYWZmaWxpYXRlLWlkXCIpO1xyXG4gICAgaWYgKHNlbGYuaGFzQ2xhc3MoJ2Rpc2FibGVkJykpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBzZWxmLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgIC8qaWYodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgIHNlbGYuZmluZChcIi5pdGVtX2ljb25cIikucmVtb3ZlQ2xhc3MoXCJtdXRlZFwiKTtcclxuICAgIH0qL1xyXG5cclxuICAgICQucG9zdChcIi9hY2NvdW50L2Zhdm9yaXRlc1wiLHtcclxuICAgICAgXCJ0eXBlXCIgOiB0eXBlICxcclxuICAgICAgXCJhZmZpbGlhdGVfaWRcIjogYWZmaWxpYXRlX2lkXHJcbiAgICB9LGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgIGlmKGRhdGEuZXJyb3Ipe1xyXG4gICAgICAgIHNlbGYuZmluZCgnc3ZnJykucmVtb3ZlQ2xhc3MoXCJzcGluXCIpO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6ZGF0YS5lcnJvcix0eXBlOidlcnInLCd0aXRsZSc6KGRhdGEudGl0bGU/ZGF0YS50aXRsZTpmYWxzZSl9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgIG1lc3NhZ2U6ZGF0YS5tc2csXHJcbiAgICAgICAgdHlwZTonc3VjY2VzcycsXHJcbiAgICAgICAgJ3RpdGxlJzooZGF0YS50aXRsZT9kYXRhLnRpdGxlOmZhbHNlKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcIi5pdGVtX2ljb25cIikuYWRkQ2xhc3MoXCJzdmctbm8tZmlsbFwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VsZi5hdHRyKHtcclxuICAgICAgICBcImRhdGEtc3RhdGVcIjogZGF0YVtcImRhdGEtc3RhdGVcIl0sXHJcbiAgICAgICAgXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCI6IGRhdGFbJ2RhdGEtb3JpZ2luYWwtdGl0bGUnXVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gc3ZnLW5vLWZpbGxcIik7XHJcbiAgICAgIH0gZWxzZSBpZih0eXBlID09IFwiZGVsZXRlXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluXCIpLmFkZENsYXNzKFwic3ZnLW5vLWZpbGxcIik7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LCdqc29uJykuaXRlbV9pY29uaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6XCI8Yj7QotC10YXQvdC40YfQtdGB0LrQuNC1INGA0LDQsdC+0YLRiyE8L2I+PGJyPtCSINC00LDQvdC90YvQuSDQvNC+0LzQtdC90YIg0LLRgNC10LzQtdC90LhcIiArXHJcbiAgICAgIFwiINC/0YDQvtC40LfQstC10LTRkdC90L3QvtC1INC00LXQudGB0YLQstC40LUg0L3QtdCy0L7Qt9C80L7QttC90L4uINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC/0L7Qt9C20LUuXCIgK1xyXG4gICAgICBcIiDQn9GA0LjQvdC+0YHQuNC8INGB0LLQvtC4INC40LfQstC40L3QtdC90LjRjyDQt9CwINC90LXRg9C00L7QsdGB0YLQstC+LlwiLHR5cGU6J2Vycid9KTtcclxuXHJcbiAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5hZGRDbGFzcyhcInN2Zy1uby1maWxsXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW5cIik7XHJcbiAgICB9KVxyXG4gIH0pO1xyXG59KTsiLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xyXG4gICQoJy5zY3JvbGxfdG8nKS5jbGljayggZnVuY3Rpb24oZSl7IC8vINC70L7QstC40Lwg0LrQu9C40Log0L/QviDRgdGB0YvQu9C60LUg0YEg0LrQu9Cw0YHRgdC+0LwgZ29fdG9cclxuICAgIHZhciBzY3JvbGxfZWwgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTsgLy8g0LLQvtC30YzQvNC10Lwg0YHQvtC00LXRgNC20LjQvNC+0LUg0LDRgtGA0LjQsdGD0YLQsCBocmVmLCDQtNC+0LvQttC10L0g0LHRi9GC0Ywg0YHQtdC70LXQutGC0L7RgNC+0LwsINGCLtC1LiDQvdCw0L/RgNC40LzQtdGAINC90LDRh9C40L3QsNGC0YzRgdGPINGBICMg0LjQu9C4IC5cclxuICAgIHNjcm9sbF9lbD0kKHNjcm9sbF9lbCk7XHJcbiAgICBpZiAoc2Nyb2xsX2VsLmxlbmd0aCAhPSAwKSB7IC8vINC/0YDQvtCy0LXRgNC40Lwg0YHRg9GJ0LXRgdGC0LLQvtCy0LDQvdC40LUg0Y3Qu9C10LzQtdC90YLQsCDRh9GC0L7QsdGLINC40LfQsdC10LbQsNGC0Ywg0L7RiNC40LHQutC4XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IHNjcm9sbF9lbC5vZmZzZXQoKS50b3AtJCgnI2hlYWRlcj4qJykuZXEoMCkuaGVpZ2h0KCktNTAgfSwgNTAwKTsgLy8g0LDQvdC40LzQuNGA0YPQtdC8INGB0LrRgNC+0L7Qu9C40L3QsyDQuiDRjdC70LXQvNC10L3RgtGDIHNjcm9sbF9lbFxyXG4gICAgICBpZihzY3JvbGxfZWwuaGFzQ2xhc3MoJ2FjY29yZGlvbicpICYmICFzY3JvbGxfZWwuaGFzQ2xhc3MoJ29wZW4nKSl7XHJcbiAgICAgICAgc2Nyb2xsX2VsLmZpbmQoJy5hY2NvcmRpb24tY29udHJvbCcpLmNsaWNrKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTsgLy8g0LLRi9C60LvRjtGH0LDQtdC8INGB0YLQsNC90LTQsNGA0YLQvdC+0LUg0LTQtdC50YHRgtCy0LjQtVxyXG4gIH0pO1xyXG59KTsiLCIkKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICQoXCJib2R5XCIpLm9uKCdjbGljaycsJy5zZXRfY2xpcGJvYXJkJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICBjb3B5VG9DbGlwYm9hcmQoJHRoaXMuZGF0YSgnY2xpcGJvYXJkJyksJHRoaXMuZGF0YSgnY2xpcGJvYXJkLW5vdGlmeScpKTtcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gY29weVRvQ2xpcGJvYXJkKGNvZGUsbXNnKSB7XHJcbiAgICB2YXIgJHRlbXAgPSAkKFwiPGlucHV0PlwiKTtcclxuICAgICQoXCJib2R5XCIpLmFwcGVuZCgkdGVtcCk7XHJcbiAgICAkdGVtcC52YWwoY29kZSkuc2VsZWN0KCk7XHJcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIik7XHJcbiAgICAkdGVtcC5yZW1vdmUoKTtcclxuXHJcbiAgICBpZighbXNnKXtcclxuICAgICAgbXNnPVwi0JTQsNC90L3Ri9C1INGD0YHQv9C10YjQvdC+INGB0LrQvtC/0LjRgNC+0LLQsNC90Ysg0LIg0LHRg9GE0LXRgCDQvtCx0LzQtdC90LBcIjtcclxuICAgIH1cclxuICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoeyd0eXBlJzonaW5mbycsJ21lc3NhZ2UnOm1zZywndGl0bGUnOifQo9GB0L/QtdGI0L3Qvid9KVxyXG4gIH1cclxuXHJcbiAgJChcImJvZHlcIikub24oJ2NsaWNrJyxcImlucHV0LmxpbmtcIixmdW5jdGlvbigpe1x0Ly8g0L/QvtC70YPRh9C10L3QuNC1INGE0L7QutGD0YHQsCDRgtC10LrRgdGC0L7QstGL0Lwg0L/QvtC70LXQvC3RgdGB0YvQu9C60L7QuVxyXG4gICAgJCh0aGlzKS5zZWxlY3QoKTtcclxuICB9KTtcclxufSk7IiwiLy/RgdC60LDRh9C40LLQsNC90LjQtSDQutCw0YDRgtC40L3QvtC6XHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCkge1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGltZyA9IGRhdGEuaW1nO1xyXG4gICAgaW1nLndyYXAoJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPjwvZGl2PicpO1xyXG4gICAgdmFyIHdyYXAgPSBpbWcucGFyZW50KCk7XHJcbiAgICAkKCcuZG93bmxvYWRfdGVzdCcpLmFwcGVuZChkYXRhLmVsKTtcclxuICAgIHNpemUgPSBkYXRhLmVsLndpZHRoKCkgKyBcInhcIiArIGRhdGEuZWwuaGVpZ2h0KCk7XHJcblxyXG4gICAgdz1kYXRhLmVsLndpZHRoKCkqMC44O1xyXG4gICAgaW1nXHJcbiAgICAgIC5oZWlnaHQoJ2F1dG8nKVxyXG4gICAgICAvLy53aWR0aCh3KVxyXG4gICAgICAuY3NzKCdtYXgtd2lkdGgnLCc5OSUnKTtcclxuXHJcblxyXG4gICAgZGF0YS5lbC5yZW1vdmUoKTtcclxuICAgIHdyYXAuYXBwZW5kKCc8c3Bhbj4nICsgc2l6ZSArICc8L3NwYW4+IDxhIGhyZWY9XCInICsgZGF0YS5zcmMgKyAnXCIgZG93bmxvYWQ+0KHQutCw0YfQsNGC0Yw8L2E+Jyk7XHJcbiAgfVxyXG5cclxuICB2YXIgaW1ncyA9ICQoJy5kb3dubG9hZHNfaW1nIGltZycpO1xyXG4gIGlmKGltZ3MubGVuZ3RoPT0wKXJldHVybjtcclxuXHJcbiAgJCgnYm9keScpLmFwcGVuZCgnPGRpdiBjbGFzcz1kb3dubG9hZF90ZXN0PjwvZGl2PicpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGltZyA9IGltZ3MuZXEoaSk7XHJcbiAgICB2YXIgc3JjID0gaW1nLmF0dHIoJ3NyYycpO1xyXG4gICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XHJcbiAgICAgIHNyYzogc3JjXHJcbiAgICB9KTtcclxuICAgIGRhdGEgPSB7XHJcbiAgICAgIHNyYzogc3JjLFxyXG4gICAgICBpbWc6IGltZyxcclxuICAgICAgZWw6IGltYWdlXHJcbiAgICB9O1xyXG4gICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcclxuICB9XHJcbn0pKCk7XHJcblxyXG5cclxuLy/Rh9GC0L4g0LEg0LjRhNGA0LXQudC80Ysg0Lgg0LrQsNGA0YLQuNC90LrQuCDQvdC1INCy0YvQu9Cw0LfQuNC70LhcclxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAvKm1fdyA9ICQoJy50ZXh0LWNvbnRlbnQnKS53aWR0aCgpXHJcbiAgIGlmIChtX3cgPCA1MCltX3cgPSBzY3JlZW4ud2lkdGggLSA0MCovXHJcbiAgdmFyIG13PXNjcmVlbi53aWR0aC00MDtcclxuXHJcbiAgZnVuY3Rpb24gb3B0aW1hc2UoZWwpe1xyXG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudCgpO1xyXG4gICAgaWYocGFyZW50Lmxlbmd0aD09MCB8fCBwYXJlbnRbMF0udGFnTmFtZT09XCJBXCIpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBtX3cgPSBwYXJlbnQud2lkdGgoKS0zMDtcclxuICAgIHZhciB3PWVsLndpZHRoKCk7XHJcblxyXG4gICAgLy/QsdC10Lcg0Y3RgtC+0LPQviDQv9C70Y7RidC40YIg0LHQsNC90LXRgNGLINCyINCw0LrQsNGA0LTQuNC+0L3QtVxyXG4gICAgaWYodzwzIHx8IG1fdzwzKXtcclxuICAgICAgZWxcclxuICAgICAgICAuaGVpZ2h0KCdhdXRvJylcclxuICAgICAgICAuY3NzKCdtYXgtd2lkdGgnLCc5OSUnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGVsLndpZHRoKCdhdXRvJyk7XHJcbiAgICBpZihlbFswXS50YWdOYW1lPT1cIklNR1wiICYmIHc+ZWwud2lkdGgoKSl3PWVsLndpZHRoKCk7XHJcblxyXG4gICAgaWYgKG13PjUwICYmIG1fdyA+IG13KW1fdyA9IG13O1xyXG4gICAgaWYgKHc+bV93KSB7XHJcbiAgICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpe1xyXG4gICAgICAgIGsgPSB3IC8gbV93O1xyXG4gICAgICAgIGVsLmhlaWdodChlbC5oZWlnaHQoKSAvIGspO1xyXG4gICAgICB9XHJcbiAgICAgIGVsLndpZHRoKG1fdylcclxuICAgIH1lbHNle1xyXG4gICAgICBlbC53aWR0aCh3KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xyXG4gICAgdmFyIGVsPSQodGhpcyk7XHJcbiAgICBvcHRpbWFzZShlbCk7XHJcbiAgfVxyXG5cclxuICB2YXIgcCA9ICQoJy5jb250ZW50LXdyYXAgaW1nLC5jb250ZW50LXdyYXAgaWZyYW1lJyk7XHJcbiAgJCgnLmNvbnRlbnQtd3JhcCBpbWcnKS5oZWlnaHQoJ2F1dG8nKTtcclxuICAvLyQoJy5jb250YWluZXIgaW1nJykud2lkdGgoJ2F1dG8nKTtcclxuICBmb3IgKGkgPSAwOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgZWwgPSBwLmVxKGkpO1xyXG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIikge1xyXG4gICAgICBvcHRpbWFzZShlbCk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgdmFyIHNyYz1lbC5hdHRyKCdzcmMnKTtcclxuICAgICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XHJcbiAgICAgICAgc3JjOiBzcmNcclxuICAgICAgfSk7XHJcbiAgICAgIGltYWdlLm9uKCdsb2FkJywgaW1nX2xvYWRfZmluaXNoLmJpbmQoZWwpKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuXHJcbi8v0J/RgNC+0LLQtdGA0LrQsCDQsdC40YLRiyDQutCw0YDRgtC40L3QvtC6LlxyXG5cclxuLy8gISEhISEhXHJcbi8vINCd0YPQttC90L4g0L/RgNC+0LLQtdGA0LjRgtGMXHJcbi8vICEhISEhIVxyXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xyXG4gICAgZGF0YT10aGlzO1xyXG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XHJcbiAgICAgIGRhdGEuaW1nLmF0dHIoJ3NyYycsIGRhdGEuc3JjKTtcclxuICAgIH1lbHNle1xyXG4gICAgICBkYXRhLmltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcrZGF0YS5zcmMrJyknKTtcclxuICAgICAgZGF0YS5pbWcucmVtb3ZlQ2xhc3MoJ25vX2F2YScpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy/RgtC10YHRgiDQu9C+0LPQviDQvNCw0LPQsNC30LjQvdCwXHJcbiAgaW1ncz0kKCdzZWN0aW9uOm5vdCgubmF2aWdhdGlvbiknKS5maW5kKCcubG9nbyBpbWcnKTtcclxuICBmb3IgKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspe1xyXG4gICAgaW1nPWltZ3MuZXEoaSk7XHJcbiAgICBzcmM9aW1nLmF0dHIoJ3NyYycpO1xyXG4gICAgaW1nLmF0dHIoJ3NyYycsJy9pbWFnZXMvdGVtcGxhdGUtbG9nby5qcGcnKTtcclxuICAgIGRhdGE9e1xyXG4gICAgICBzcmM6c3JjLFxyXG4gICAgICBpbWc6aW1nLFxyXG4gICAgICB0eXBlOjAgLy8g0LTQu9GPIGltZ1tzcmNdXHJcbiAgICB9O1xyXG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XHJcbiAgICAgIHNyYzpzcmNcclxuICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcclxuICB9XHJcblxyXG4gIC8v0YLQtdGB0YIg0LDQstCw0YLQsNGA0L7QuiDQsiDQutC+0LzQtdC90YLQsNGA0LjRj9GFXHJcbiAgaW1ncz0kKCcuY29tbWVudC1waG90bycpO1xyXG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XHJcbiAgICBpbWc9aW1ncy5lcShpKTtcclxuICAgIGlmKGltZy5oYXNDbGFzcygnbm9fYXZhJykpe1xyXG4gICAgICBjb250aW51ZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc3JjPWltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKTtcclxuICAgIHNyYz1zcmMucmVwbGFjZSgndXJsKFwiJywnJyk7XHJcbiAgICBzcmM9c3JjLnJlcGxhY2UoJ1wiKScsJycpO1xyXG4gICAgaW1nLmFkZENsYXNzKCdub19hdmEnKTtcclxuXHJcbiAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKC9pbWFnZXMvbm9fYXZhLnBuZyknKTtcclxuICAgIGRhdGE9e1xyXG4gICAgICBzcmM6c3JjLFxyXG4gICAgICBpbWc6aW1nLFxyXG4gICAgICB0eXBlOjEgLy8g0LTQu9GPINGE0L7QvdC+0LLRi9GFINC60LDRgNGC0LjQvdC+0LpcclxuICAgIH07XHJcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcclxuICAgICAgc3JjOnNyY1xyXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxyXG4gIH1cclxufSk7IiwiLy/QtdGB0LvQuCDQvtGC0LrRgNGL0YLQviDQutCw0Log0LTQvtGH0LXRgNC90LXQtVxyXG4oZnVuY3Rpb24oKXtcclxuICBpZighd2luZG93Lm9wZW5lcilyZXR1cm47XHJcbiAgaWYoZG9jdW1lbnQucmVmZXJyZXIuaW5kZXhPZignc2VjcmV0ZGlzY291bnRlcicpPDApcmV0dXJuO1xyXG5cclxuICBocmVmPXdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZjtcclxuICBpZihcclxuICAgIGhyZWYuaW5kZXhPZignc29jaWFscycpPjAgfHxcclxuICAgIGhyZWYuaW5kZXhPZignbG9naW4nKT4wIHx8XHJcbiAgICBocmVmLmluZGV4T2YoJ2FkbWluJyk+MCB8fFxyXG4gICAgaHJlZi5pbmRleE9mKCdhY2NvdW50Jyk+MFxyXG4gICl7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIGlmKGhyZWYuaW5kZXhPZignc3RvcmUnKT4wIHx8IGhyZWYuaW5kZXhPZignY291cG9uJyk+MCB8fCBocmVmLmluZGV4T2YoJ3NldHRpbmdzJyk+MCl7XHJcbiAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gIH1lbHNle1xyXG4gICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XHJcbiAgfVxyXG4gIHdpbmRvdy5jbG9zZSgpO1xyXG59KSgpO1xyXG4iLCIkKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgdmFyIGZpbGUgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcclxuICAgIHZhciBmID0gZmlsZVswXTtcclxuICAgIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cclxuICAgIGlmICghZi50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgZGF0YSA9IHtcclxuICAgICAgJ2VsJzogdGhpcyxcclxuICAgICAgJ2YnOiBmXHJcbiAgICB9O1xyXG4gICAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpbWcgPSAkKCdbZm9yPVwiJyArIGRhdGEuZWwubmFtZSArICdcIl0nKTtcclxuICAgICAgICBpZiAoaW1nLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGltZy5hdHRyKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfSkoZGF0YSk7XHJcbiAgICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXHJcbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmKTtcclxuICB9KTtcclxuXHJcbiAgJCgnLmR1YmxpY2F0ZV92YWx1ZScpLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciAkdGhpcz0kKHRoaXMpO1xyXG4gICAgdmFyIHNlbD0kKCR0aGlzLmRhdGEoJ3NlbGVjdG9yJykpO1xyXG4gICAgc2VsLnZhbCh0aGlzLnZhbHVlKTtcclxuICB9KVxyXG59KTtcclxuIiwiXHJcbmZ1bmN0aW9uIGdldENvb2tpZShuKSB7XHJcbiAgcmV0dXJuIHVuZXNjYXBlKChSZWdFeHAobiArICc9KFteO10rKScpLmV4ZWMoZG9jdW1lbnQuY29va2llKSB8fCBbMSwgJyddKVsxXSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldENvb2tpZShuYW1lLCB2YWx1ZSkge1xyXG4gIHZhciBjb29raWVfc3RyaW5nID0gbmFtZSArIFwiPVwiICsgZXNjYXBlICggdmFsdWUgKTtcclxuICBkb2N1bWVudC5jb29raWUgPSBjb29raWVfc3RyaW5nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBlcmFzZUNvb2tpZShuYW1lKXtcclxuICB2YXIgY29va2llX3N0cmluZyA9IG5hbWUgKyBcIj0wXCIgK1wiOyBleHBpcmVzPVdlZCwgMDEgT2N0IDIwMTcgMDA6MDA6MDAgR01UXCI7XHJcbiAgZG9jdW1lbnQuY29va2llID0gY29va2llX3N0cmluZztcclxufSJdfQ==
