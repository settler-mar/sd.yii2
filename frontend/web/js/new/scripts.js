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
        /*if($accordion.hasClass('accordion-slim')){
            return false;
        }*/
        $accordion.find('.accordion-content').hide(300);
        $accordion.removeClass('open')
    } else {
        if($accordion.hasClass('accordion-slim')){
            $other=$accordion.parent().find('.accordion-slim');
            $other.find('.accordion-content')
                .hide(300)
                .removeClass('accordion-content_last-open');
            $other.removeClass('open');
            $other.removeClass('last-open');

            $accordion.find('.accordion-content').addClass('accordion-content_last-open');
            $accordion.addClass('last-open');
        }
        $accordion.find('.accordion-content').show(300);
        $accordion.addClass('open');
    }
    return false;
});
accordionControl.show();

//для cbvjd jnrhsdftv 1-й
accordionSlim=$('.accordion.accordion-slim');
if(accordionSlim.length>0){
    accordionSlim.parent().find('.accordion-slim:first-child')
        .addClass('open')
        .addClass('last-open')
        .find('.accordion-content')
            .show(300)
            .addClass('accordion-content_last-open');
}

function ajaxForm(els) {
  var fileApi = window.File && window.FileReader && window.FileList && window.Blob ? true : false;
  var defaults = {
    error_class: '.has-error',
  };

  function onPost(post){
    var data=this;
    form=data.form;
    wrap=data.wrap;
    if(post.render){
      post.notyfy_class="notify_white";
      notification.alert(post);
    }else{
      wrap.removeClass('loading');
      wrap.html(post.html);
      ajaxForm(wrap);
    }
  }

  function onFail(){
    var data=this;
    form=data.form;
    wrap=data.wrap;
    wrap.removeClass('loading');
    wrap.html('<h3>Упс... Возникла непредвиденная ошибка<h3>' +
      '<p>Часто это происходит в случае, если вы несколько раз подряд неверно ввели свои учетные данные. Но возможны и другие причины. В любом случае не расстраивайтесь и просто обратитесь к нашему оператору службы поддержки.</p><br>' +
      '<p>Спасибо.</p>');
    ajaxForm(wrap);

  }

  function onSubmit(e){
    e.preventDefault();
    var data=this;
    form=data.form;
    wrap=data.wrap;

    if(form.yiiActiveForm){
      form.yiiActiveForm('validate');
    };

    isValid=(form.find(data.param.error_class).length==0);

    if(!isValid){
      return false;
    }else{
      required=form.find('input.required');
      for(i=0;i<required.length;i++){
        if(required.eq(i).val().length<1){
          return false
        }
      }
    }

    if(!form.serializeObject)addSRO();

    var post=form.serializeObject();
    form.addClass('loading');
    form.html('');
    wrap.html('<div style="text-align:center;"><p>Отправка данных</p></div>');

    data.url+=(data.url.indexOf('?')>0?'&':'?')+'rc='+Math.random();

    $.post(
      data.url,
      post,
      onPost.bind(data),
      'json'
    ).fail(onFail.bind(data));

    return false;
  }

  els.find('[required]')
    .addClass('required')
    .removeAttr('required');

  for(var i=0;i<els.length;i++){
    wrap=els.eq(i);
    form=wrap.find('form');
    data={
      form:form,
      param:defaults,
      wrap:wrap
    };
    data.url=form.attr('action') || location.href;
    data.method= form.attr('method') || 'post';
    form.off('submit');
    form.on('submit', onSubmit.bind(data));
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
var headerActions = function () {
    var scrolledDown = false;
    var shadowedDown = false;

    $('.menu-toggle').click(function(e) {
        e.preventDefault();
        $('.header').toggleClass('header_open-menu');
        $('.drop-menu').find('li').removeClass('open').removeClass('close');
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


    $('.header-search_form-input').on('input', function(e){
        e.preventDefault();
        var query = $(this).val();
        var autocomplete = $('#autocomplete'),
            autocompleteList = $(autocomplete).find('ul');
        if (query.length>1) {
            $.ajax({
                url: '/search',
                type: 'get',
                data: {query: query},
                dataType: 'json',
                success: function(data){
                    if (data.suggestions) {
                        if (autocomplete) {
                            $(autocompleteList).html('');
                        }
                        if (data.suggestions.length) {
                            data.suggestions.forEach(function(item){
                                var html = '<a class="autocomplete_link" href="/stores/'+item.data.route+'"'+'>'+item.value+item.cashback+'</a>';
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
            $('#autocomplete').hide();
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
  $("a[href='#showpromocode-noregister']").on('click', function (e) {
    e.preventDefault();
    var id = $(this).data('id');
    console.log(id);
    var data = {
      buttonYes: false,
      notyfy_class: "notify_white notify_not_big",
      question: '<div class="coupon-noregister">' +
      '<div class="coupon-noregister__icon"><img src="/images/templates/swa.png" alt=""></div>' +
      '<div class="coupon-noregister__text"><b>Если вы хотите получать еще и КЭШБЭК (возврат денег), вам необходимо зарегистрироваться. Но можете и просто воспользоваться купоном, без кэшбэка.</b></div>' +
      '<div class="coupon-noregister__buttons">' +
      '<a href="goto/coupon:' + id + '" target="_blank" class="btn  btn-popup2">Использовать купон</a>' +
      '<a href="#registration" class="btn btn-popup2 btn-revert">Зарегистрироваться</a>' +
      '</div>' +
      '<div>'
    };
    notification.alert(data)
  });

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
          c.text('Срок действия промокода истек');
          continue;
        }

        //если срок более 30 дней
        if(d>30*60*60*24){
          c.text('Осталось более 30 дней');
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
        c.text("Осталось: "+str);
      }
    }

    setInterval(updateClock.bind(clocks),1000);
    updateClock.bind(clocks)();
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsImpxdWVyeS5mbGV4c2xpZGVyLW1pbi5qcyIsInRpcHNvLm1pbi5qcyIsInRvb2x0aXAuanMiLCJub3RpZmljYXRpb24uanMiLCJtb2RhbHMuanMiLCJmb290ZXJfbWVudS5qcyIsInJhdGluZy5qcyIsImFjY291bnRfbm90aWZpY2F0aW9uLmpzIiwic2xpZGVyLmpzIiwiZmF2b3JpdGVzLmpzIiwic2NyaXB0LmpzIiwiY2FsYy1jYXNoYmFjay5qcyIsImF1dG9faGlkZV9jb250cm9sLmpzIiwic2Nyb2xsX3RvLmpzIiwiaGlkZV9zaG93X2FsbC5qcyIsImNvdXBvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaDhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsib2JqZWN0cyA9IGZ1bmN0aW9uIChhLGIpIHtcbiAgICB2YXIgYyA9IGIsXG4gICAgICAgIGtleTtcbiAgICBmb3IgKGtleSBpbiBhKSB7XG4gICAgICAgIGlmIChhLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIGNba2V5XSA9IGtleSBpbiBiID8gYltrZXldIDogYVtrZXldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjO1xufTtcblxuZnVuY3Rpb24gbG9naW5fcmVkaXJlY3QobmV3X2hyZWYpe1xuICAgIGhyZWY9bG9jYXRpb24uaHJlZjtcbiAgICBpZihocmVmLmluZGV4T2YoJ3N0b3JlJyk+MCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpPjApe1xuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9ZWxzZXtcbiAgICAgICAgbG9jYXRpb24uaHJlZj1uZXdfaHJlZjtcbiAgICB9XG59XG4iLCIoZnVuY3Rpb24gKHcsIGQsICQpIHtcbiAgICB2YXIgc2Nyb2xsc19ibG9jayA9ICQoJy5zY3JvbGxfYm94Jyk7XG5cbiAgICBpZihzY3JvbGxzX2Jsb2NrLmxlbmd0aD09MCkgcmV0dXJuO1xuICAgIC8vJCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpLndyYXBBbGwoc2Nyb2xsc19ibG9jayk7XG4gICAgJChzY3JvbGxzX2Jsb2NrKS53cmFwKCc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC13cmFwXCI+PC9kaXY+Jyk7XG5cbiAgICBpbml0X3Njcm9sbCgpO1xuICAgIGNhbGNfc2Nyb2xsKCk7XG5cbiAgICB2YXIgdDEsdDI7XG5cbiAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHQxKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHQyKTtcbiAgICAgICAgdDE9c2V0VGltZW91dChjYWxjX3Njcm9sbCwzMDApO1xuICAgICAgICB0Mj1zZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLDgwMCk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBpbml0X3Njcm9sbCgpIHtcbiAgICAgICAgdmFyIGNvbnRyb2wgPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbFwiPjwvZGl2Pic7XG4gICAgICAgIGNvbnRyb2w9JChjb250cm9sKTtcbiAgICAgICAgY29udHJvbC5pbnNlcnRBZnRlcihzY3JvbGxzX2Jsb2NrKTtcbiAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTtcblxuICAgICAgICBzY3JvbGxzX2Jsb2NrLnByZXBlbmQoJzxkaXYgY2xhc3M9c2Nyb2xsX2JveC1tb3Zlcj48L2Rpdj4nKTtcblxuICAgICAgICBjb250cm9sLm9uKCdjbGljaycsJy5zY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnLGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICB2YXIgY29udHJvbCA9ICR0aGlzLnBhcmVudCgpO1xuICAgICAgICAgICAgdmFyIGkgPSAkdGhpcy5pbmRleCgpO1xuICAgICAgICAgICAgaWYoJHRoaXMuaGFzQ2xhc3MoJ2FjdGl2ZScpKXJldHVybjtcbiAgICAgICAgICAgIGNvbnRyb2wuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICR0aGlzLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuICAgICAgICAgICAgdmFyIGR4PWNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnKTtcbiAgICAgICAgICAgIHZhciBlbCA9IGNvbnRyb2wucHJldigpO1xuICAgICAgICAgICAgZWwuZmluZCgnLnNjcm9sbF9ib3gtbW92ZXInKS5jc3MoJ21hcmdpbi1sZWZ0JywtZHgqaSk7XG4gICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGkpO1xuXG4gICAgICAgICAgICBzdG9wU2Nyb2wuYmluZChlbCkoKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNjcm9sbHNfYmxvY2subGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIGVsID0gc2Nyb2xsc19ibG9jay5lcShqKTtcbiAgICAgICAgZWwucGFyZW50KCkuaG92ZXIoc3RvcFNjcm9sLmJpbmQoZWwpLHN0YXJ0U2Nyb2wuYmluZChlbCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0YXJ0U2Nyb2woKXtcbiAgICAgICAgdmFyICR0aGlzPSQodGhpcyk7XG4gICAgICAgIGlmKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpKXJldHVybjtcblxuICAgICAgICB2YXIgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLmJpbmQoJHRoaXMpLCAyMDAwKTtcbiAgICAgICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJyx0aW1lb3V0SWQpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RvcFNjcm9sKCl7XG4gICAgICAgIHZhciAkdGhpcz0kKHRoaXMpO1xuICAgICAgICB2YXIgdGltZW91dElkPSR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpO1xuICAgICAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLGZhbHNlKTtcbiAgICAgICAgaWYoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikgfHwgIXRpbWVvdXRJZClyZXR1cm47XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5leHRfc2xpZGUoKSB7XG4gICAgICAgIHZhciAkdGhpcz0kKHRoaXMpO1xuICAgICAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLGZhbHNlKTtcbiAgICAgICAgaWYoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xuXG4gICAgICAgIHZhciBjb250cm9scz0kdGhpcy5uZXh0KCkuZmluZCgnPionKTtcbiAgICAgICAgdmFyIGFjdGl2ZT0kdGhpcy5kYXRhKCdzbGlkZS1hY3RpdmUnKTtcbiAgICAgICAgdmFyIHBvaW50X2NudD1jb250cm9scy5sZW5ndGg7XG4gICAgICAgIGlmKCFhY3RpdmUpYWN0aXZlPTA7XG4gICAgICAgIGFjdGl2ZSsrO1xuICAgICAgICBpZihhY3RpdmU+PXBvaW50X2NudClhY3RpdmU9MDtcbiAgICAgICAgJHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJywgYWN0aXZlKTtcblxuICAgICAgICBjb250cm9scy5lcShhY3RpdmUpLmNsaWNrKCk7XG4gICAgICAgIHN0YXJ0U2Nyb2wuYmluZCgkdGhpcykoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxjX3Njcm9sbCgpIHtcbiAgICAgICAgZm9yKGk9MDtpPHNjcm9sbHNfYmxvY2subGVuZ3RoO2krKykge1xuICAgICAgICAgICAgdmFyIGVsID0gc2Nyb2xsc19ibG9jay5lcShpKTtcbiAgICAgICAgICAgIHZhciBjb250cm9sID0gZWwubmV4dCgpO1xuICAgICAgICAgICAgdmFyIHdpZHRoX21heCA9IGVsLmRhdGEoJ3Njcm9sbC13aWR0aC1tYXgnKTtcbiAgICAgICAgICAgIHcgPSBlbC53aWR0aCgpO1xuXG4gICAgICAgICAgICAvL9C00LXQu9Cw0LXQvCDQutC+0L3RgtGA0L7Qu9GMINC+0LPRgNCw0L3QuNGH0LXQvdC40Y8g0YjQuNGA0LjQvdGLLiDQldGB0LvQuCDQv9GA0LXQstGL0YjQtdC90L4g0YLQviDQvtGC0LrQu9GO0YfQsNC10Lwg0YHQutGA0L7QuyDQuCDQv9C10YDQtdGF0L7QtNC40Lwg0Log0YHQu9C10LTRg9GO0YnQtdC80YMg0Y3Qu9C10LzQtdC90YLRg1xuICAgICAgICAgICAgaWYgKHdpZHRoX21heCAmJiB3ID4gd2lkdGhfbWF4KSB7XG4gICAgICAgICAgICAgICAgY29udHJvbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBub19jbGFzcyA9IGVsLmRhdGEoJ3Njcm9sbC1lbGVtZXQtaWdub3JlLWNsYXNzJyk7XG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBlbC5maW5kKCc+KicpLm5vdCgnLnNjcm9sbF9ib3gtbW92ZXInKTtcbiAgICAgICAgICAgIGlmIChub19jbGFzcykge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gY2hpbGRyZW4ubm90KCcuJyArIG5vX2NsYXNzKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL9CV0YHQu9C4INC90LXRgiDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbiA9PSAwKSB7XG4gICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZl9lbD1jaGlsZHJlbi5lcSgxKTtcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbl93ID0gZl9lbC5vdXRlcldpZHRoKCk7IC8v0LLRgdC10LPQviDQtNC+0YfQtdGA0L3QuNGFINC00LvRjyDRgdC60YDQvtC70LBcbiAgICAgICAgICAgIGNoaWxkcmVuX3crPXBhcnNlRmxvYXQoZl9lbC5jc3MoJ21hcmdpbi1sZWZ0JykpO1xuICAgICAgICAgICAgY2hpbGRyZW5fdys9cGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLXJpZ2h0JykpO1xuXG4gICAgICAgICAgICB2YXIgc2NyZWFuX2NvdW50ID0gTWF0aC5mbG9vcih3IC8gY2hpbGRyZW5fdyk7XG5cbiAgICAgICAgICAgIC8v0JXRgdC70Lgg0LLRgdC1INCy0LvQsNC30LjRgiDQvdCwINGN0LrRgNCw0L1cbiAgICAgICAgICAgIGlmIChjaGlsZHJlbiA8PSBzY3JlYW5fY291bnQpIHtcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v0KPQttC1INGC0L7Rh9C90L4g0LfQvdCw0LXQvCDRh9GC0L4g0YHQutGA0L7QuyDQvdGD0LbQtdC9XG4gICAgICAgICAgICBlbC5hZGRDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xuXG4gICAgICAgICAgICB2YXIgcG9pbnRfY250ID0gY2hpbGRyZW4ubGVuZ3RoIC0gc2NyZWFuX2NvdW50ICsgMTtcbiAgICAgICAgICAgIC8v0LXRgdC70Lgg0L3QtSDQvdCw0LTQviDQvtCx0L3QvtCy0LvRj9GC0Ywg0LrQvtC90YLRgNC+0Lsg0YLQviDQstGL0YXQvtC00LjQvCwg0L3QtSDQt9Cw0LHRi9Cy0LDRjyDQvtCx0L3QvtCy0LjRgtGMINGI0LjRgNC40L3RgyDQtNC+0YfQtdGA0L3QuNGFXG4gICAgICAgICAgICBpZiAoY29udHJvbC5maW5kKCc+KicpLmxlbmd0aCA9PSBwb2ludF9jbnQpIHtcbiAgICAgICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWR4JywgY2hpbGRyZW5fdyk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFjdGl2ZSA9IGVsLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xuICAgICAgICAgICAgaWYgKCFhY3RpdmUpYWN0aXZlID0gMDtcbiAgICAgICAgICAgIGlmIChhY3RpdmUgPj0gcG9pbnRfY250KWFjdGl2ZSA9IHBvaW50X2NudCAtIDE7XG4gICAgICAgICAgICB2YXIgb3V0ID0gJyc7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvaW50X2NudDsgaisrKSB7XG4gICAgICAgICAgICAgICAgb3V0ICs9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sX3BvaW50Jysoaj09YWN0aXZlPycgYWN0aXZlJzonJykrJ1wiPjwvZGl2Pic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250cm9sLmh0bWwob3V0KTtcblxuICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xuICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1jb3VudCcsIHBvaW50X2NudCk7XG4gICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWR4JywgY2hpbGRyZW5fdyk7XG5cbiAgICAgICAgICAgIGlmKCFlbC5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKSl7XG4gICAgICAgICAgICAgICAgc3RhcnRTY3JvbC5iaW5kKGVsKSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSh3aW5kb3csIGRvY3VtZW50LCBqUXVlcnkpKTsiLCJ2YXIgYWNjb3JkaW9uQ29udHJvbCA9ICQoJy5hY2NvcmRpb24gLmFjY29yZGlvbi1jb250cm9sJyk7XG5cbmFjY29yZGlvbkNvbnRyb2wub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgICRhY2NvcmRpb24gPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uJyk7XG5cbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAgIC8qaWYoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLXNsaW0nKSl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0qL1xuICAgICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmhpZGUoMzAwKTtcbiAgICAgICAgJGFjY29yZGlvbi5yZW1vdmVDbGFzcygnb3BlbicpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYoJGFjY29yZGlvbi5oYXNDbGFzcygnYWNjb3JkaW9uLXNsaW0nKSl7XG4gICAgICAgICAgICAkb3RoZXI9JGFjY29yZGlvbi5wYXJlbnQoKS5maW5kKCcuYWNjb3JkaW9uLXNsaW0nKTtcbiAgICAgICAgICAgICRvdGhlci5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKVxuICAgICAgICAgICAgICAgIC5oaWRlKDMwMClcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xuICAgICAgICAgICAgJG90aGVyLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICAkb3RoZXIucmVtb3ZlQ2xhc3MoJ2xhc3Qtb3BlbicpO1xuXG4gICAgICAgICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmFkZENsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcbiAgICAgICAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpO1xuICAgICAgICB9XG4gICAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2hvdygzMDApO1xuICAgICAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdvcGVuJyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn0pO1xuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XG5cbi8v0LTQu9GPIGNidmpkIGpucmhzZGZ0diAxLdC5XG5hY2NvcmRpb25TbGltPSQoJy5hY2NvcmRpb24uYWNjb3JkaW9uLXNsaW0nKTtcbmlmKGFjY29yZGlvblNsaW0ubGVuZ3RoPjApe1xuICAgIGFjY29yZGlvblNsaW0ucGFyZW50KCkuZmluZCgnLmFjY29yZGlvbi1zbGltOmZpcnN0LWNoaWxkJylcbiAgICAgICAgLmFkZENsYXNzKCdvcGVuJylcbiAgICAgICAgLmFkZENsYXNzKCdsYXN0LW9wZW4nKVxuICAgICAgICAuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcbiAgICAgICAgICAgIC5zaG93KDMwMClcbiAgICAgICAgICAgIC5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG59XG4iLCJmdW5jdGlvbiBhamF4Rm9ybShlbHMpIHtcbiAgdmFyIGZpbGVBcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IgPyB0cnVlIDogZmFsc2U7XG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBlcnJvcl9jbGFzczogJy5oYXMtZXJyb3InLFxuICB9O1xuXG4gIGZ1bmN0aW9uIG9uUG9zdChwb3N0KXtcbiAgICB2YXIgZGF0YT10aGlzO1xuICAgIGZvcm09ZGF0YS5mb3JtO1xuICAgIHdyYXA9ZGF0YS53cmFwO1xuICAgIGlmKHBvc3QucmVuZGVyKXtcbiAgICAgIHBvc3Qubm90eWZ5X2NsYXNzPVwibm90aWZ5X3doaXRlXCI7XG4gICAgICBub3RpZmljYXRpb24uYWxlcnQocG9zdCk7XG4gICAgfWVsc2V7XG4gICAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICB3cmFwLmh0bWwocG9zdC5odG1sKTtcbiAgICAgIGFqYXhGb3JtKHdyYXApO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRmFpbCgpe1xuICAgIHZhciBkYXRhPXRoaXM7XG4gICAgZm9ybT1kYXRhLmZvcm07XG4gICAgd3JhcD1kYXRhLndyYXA7XG4gICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgIHdyYXAuaHRtbCgnPGgzPtCj0L/RgS4uLiDQktC+0LfQvdC40LrQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwPGgzPicgK1xuICAgICAgJzxwPtCn0LDRgdGC0L4g0Y3RgtC+INC/0YDQvtC40YHRhdC+0LTQuNGCINCyINGB0LvRg9GH0LDQtSwg0LXRgdC70Lgg0LLRiyDQvdC10YHQutC+0LvRjNC60L4g0YDQsNC3INC/0L7QtNGA0Y/QtCDQvdC10LLQtdGA0L3QviDQstCy0LXQu9C4INGB0LLQvtC4INGD0YfQtdGC0L3Ri9C1INC00LDQvdC90YvQtS4g0J3QviDQstC+0LfQvNC+0LbQvdGLINC4INC00YDRg9Cz0LjQtSDQv9GA0LjRh9C40L3Riy4g0JIg0LvRjtCx0L7QvCDRgdC70YPRh9Cw0LUg0L3QtSDRgNCw0YHRgdGC0YDQsNC40LLQsNC50YLQtdGB0Ywg0Lgg0L/RgNC+0YHRgtC+INC+0LHRgNCw0YLQuNGC0LXRgdGMINC6INC90LDRiNC10LzRgyDQvtC/0LXRgNCw0YLQvtGA0YMg0YHQu9GD0LbQsdGLINC/0L7QtNC00LXRgNC20LrQuC48L3A+PGJyPicgK1xuICAgICAgJzxwPtCh0L/QsNGB0LjQsdC+LjwvcD4nKTtcbiAgICBhamF4Rm9ybSh3cmFwKTtcblxuICB9XG5cbiAgZnVuY3Rpb24gb25TdWJtaXQoZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBkYXRhPXRoaXM7XG4gICAgZm9ybT1kYXRhLmZvcm07XG4gICAgd3JhcD1kYXRhLndyYXA7XG5cbiAgICBpZihmb3JtLnlpaUFjdGl2ZUZvcm0pe1xuICAgICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScpO1xuICAgIH07XG5cbiAgICBpc1ZhbGlkPShmb3JtLmZpbmQoZGF0YS5wYXJhbS5lcnJvcl9jbGFzcykubGVuZ3RoPT0wKTtcblxuICAgIGlmKCFpc1ZhbGlkKXtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9ZWxzZXtcbiAgICAgIHJlcXVpcmVkPWZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQnKTtcbiAgICAgIGZvcihpPTA7aTxyZXF1aXJlZC5sZW5ndGg7aSsrKXtcbiAgICAgICAgaWYocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoPDEpe1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIWZvcm0uc2VyaWFsaXplT2JqZWN0KWFkZFNSTygpO1xuXG4gICAgdmFyIHBvc3Q9Zm9ybS5zZXJpYWxpemVPYmplY3QoKTtcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XG4gICAgZm9ybS5odG1sKCcnKTtcbiAgICB3cmFwLmh0bWwoJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48cD7QntGC0L/RgNCw0LLQutCwINC00LDQvdC90YvRhTwvcD48L2Rpdj4nKTtcblxuICAgIGRhdGEudXJsKz0oZGF0YS51cmwuaW5kZXhPZignPycpPjA/JyYnOic/JykrJ3JjPScrTWF0aC5yYW5kb20oKTtcblxuICAgICQucG9zdChcbiAgICAgIGRhdGEudXJsLFxuICAgICAgcG9zdCxcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxuICAgICAgJ2pzb24nXG4gICAgKS5mYWlsKG9uRmFpbC5iaW5kKGRhdGEpKTtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGVscy5maW5kKCdbcmVxdWlyZWRdJylcbiAgICAuYWRkQ2xhc3MoJ3JlcXVpcmVkJylcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcblxuICBmb3IodmFyIGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcbiAgICB3cmFwPWVscy5lcShpKTtcbiAgICBmb3JtPXdyYXAuZmluZCgnZm9ybScpO1xuICAgIGRhdGE9e1xuICAgICAgZm9ybTpmb3JtLFxuICAgICAgcGFyYW06ZGVmYXVsdHMsXG4gICAgICB3cmFwOndyYXBcbiAgICB9O1xuICAgIGRhdGEudXJsPWZvcm0uYXR0cignYWN0aW9uJykgfHwgbG9jYXRpb24uaHJlZjtcbiAgICBkYXRhLm1ldGhvZD0gZm9ybS5hdHRyKCdtZXRob2QnKSB8fCAncG9zdCc7XG4gICAgZm9ybS5vZmYoJ3N1Ym1pdCcpO1xuICAgIGZvcm0ub24oJ3N1Ym1pdCcsIG9uU3VibWl0LmJpbmQoZGF0YSkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFNSTygpe1xuICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbyA9IHt9O1xuICAgIHZhciBhID0gdGhpcy5zZXJpYWxpemVBcnJheSgpO1xuICAgICQuZWFjaChhLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAob1t0aGlzLm5hbWVdKSB7XG4gICAgICAgIGlmICghb1t0aGlzLm5hbWVdLnB1c2gpIHtcbiAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcbiAgICAgICAgfVxuICAgICAgICBvW3RoaXMubmFtZV0ucHVzaCh0aGlzLnZhbHVlIHx8ICcnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9bdGhpcy5uYW1lXSA9IHRoaXMudmFsdWUgfHwgJyc7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG87XG4gIH07XG59O1xuYWRkU1JPKCk7IiwiLypcbiAqIGpRdWVyeSBGbGV4U2xpZGVyIHYyLjYuNFxuICogQ29weXJpZ2h0IDIwMTIgV29vVGhlbWVzXG4gKiBDb250cmlidXRpbmcgQXV0aG9yOiBUeWxlciBTbWl0aFxuICovIWZ1bmN0aW9uKCQpe3ZhciBlPSEwOyQuZmxleHNsaWRlcj1mdW5jdGlvbih0LGEpe3ZhciBuPSQodCk7bi52YXJzPSQuZXh0ZW5kKHt9LCQuZmxleHNsaWRlci5kZWZhdWx0cyxhKTt2YXIgaT1uLnZhcnMubmFtZXNwYWNlLHI9d2luZG93Lm5hdmlnYXRvciYmd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkJiZ3aW5kb3cuTVNHZXN0dXJlLHM9KFwib250b3VjaHN0YXJ0XCJpbiB3aW5kb3d8fHJ8fHdpbmRvdy5Eb2N1bWVudFRvdWNoJiZkb2N1bWVudCBpbnN0YW5jZW9mIERvY3VtZW50VG91Y2gpJiZuLnZhcnMudG91Y2gsbz1cImNsaWNrIHRvdWNoZW5kIE1TUG9pbnRlclVwIGtleXVwXCIsbD1cIlwiLGMsZD1cInZlcnRpY2FsXCI9PT1uLnZhcnMuZGlyZWN0aW9uLHU9bi52YXJzLnJldmVyc2Usdj1uLnZhcnMuaXRlbVdpZHRoPjAscD1cImZhZGVcIj09PW4udmFycy5hbmltYXRpb24sbT1cIlwiIT09bi52YXJzLmFzTmF2Rm9yLGY9e307JC5kYXRhKHQsXCJmbGV4c2xpZGVyXCIsbiksZj17aW5pdDpmdW5jdGlvbigpe24uYW5pbWF0aW5nPSExLG4uY3VycmVudFNsaWRlPXBhcnNlSW50KG4udmFycy5zdGFydEF0P24udmFycy5zdGFydEF0OjAsMTApLGlzTmFOKG4uY3VycmVudFNsaWRlKSYmKG4uY3VycmVudFNsaWRlPTApLG4uYW5pbWF0aW5nVG89bi5jdXJyZW50U2xpZGUsbi5hdEVuZD0wPT09bi5jdXJyZW50U2xpZGV8fG4uY3VycmVudFNsaWRlPT09bi5sYXN0LG4uY29udGFpbmVyU2VsZWN0b3I9bi52YXJzLnNlbGVjdG9yLnN1YnN0cigwLG4udmFycy5zZWxlY3Rvci5zZWFyY2goXCIgXCIpKSxuLnNsaWRlcz0kKG4udmFycy5zZWxlY3RvcixuKSxuLmNvbnRhaW5lcj0kKG4uY29udGFpbmVyU2VsZWN0b3Isbiksbi5jb3VudD1uLnNsaWRlcy5sZW5ndGgsbi5zeW5jRXhpc3RzPSQobi52YXJzLnN5bmMpLmxlbmd0aD4wLFwic2xpZGVcIj09PW4udmFycy5hbmltYXRpb24mJihuLnZhcnMuYW5pbWF0aW9uPVwic3dpbmdcIiksbi5wcm9wPWQ/XCJ0b3BcIjpcIm1hcmdpbkxlZnRcIixuLmFyZ3M9e30sbi5tYW51YWxQYXVzZT0hMSxuLnN0b3BwZWQ9ITEsbi5zdGFydGVkPSExLG4uc3RhcnRUaW1lb3V0PW51bGwsbi50cmFuc2l0aW9ucz0hbi52YXJzLnZpZGVvJiYhcCYmbi52YXJzLnVzZUNTUyYmZnVuY3Rpb24oKXt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHQ9W1wicGVyc3BlY3RpdmVQcm9wZXJ0eVwiLFwiV2Via2l0UGVyc3BlY3RpdmVcIixcIk1velBlcnNwZWN0aXZlXCIsXCJPUGVyc3BlY3RpdmVcIixcIm1zUGVyc3BlY3RpdmVcIl07Zm9yKHZhciBhIGluIHQpaWYodm9pZCAwIT09ZS5zdHlsZVt0W2FdXSlyZXR1cm4gbi5wZng9dFthXS5yZXBsYWNlKFwiUGVyc3BlY3RpdmVcIixcIlwiKS50b0xvd2VyQ2FzZSgpLG4ucHJvcD1cIi1cIituLnBmeCtcIi10cmFuc2Zvcm1cIiwhMDtyZXR1cm4hMX0oKSxuLmVuc3VyZUFuaW1hdGlvbkVuZD1cIlwiLFwiXCIhPT1uLnZhcnMuY29udHJvbHNDb250YWluZXImJihuLmNvbnRyb2xzQ29udGFpbmVyPSQobi52YXJzLmNvbnRyb2xzQ29udGFpbmVyKS5sZW5ndGg+MCYmJChuLnZhcnMuY29udHJvbHNDb250YWluZXIpKSxcIlwiIT09bi52YXJzLm1hbnVhbENvbnRyb2xzJiYobi5tYW51YWxDb250cm9scz0kKG4udmFycy5tYW51YWxDb250cm9scykubGVuZ3RoPjAmJiQobi52YXJzLm1hbnVhbENvbnRyb2xzKSksXCJcIiE9PW4udmFycy5jdXN0b21EaXJlY3Rpb25OYXYmJihuLmN1c3RvbURpcmVjdGlvbk5hdj0yPT09JChuLnZhcnMuY3VzdG9tRGlyZWN0aW9uTmF2KS5sZW5ndGgmJiQobi52YXJzLmN1c3RvbURpcmVjdGlvbk5hdikpLG4udmFycy5yYW5kb21pemUmJihuLnNsaWRlcy5zb3J0KGZ1bmN0aW9uKCl7cmV0dXJuIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSktLjV9KSxuLmNvbnRhaW5lci5lbXB0eSgpLmFwcGVuZChuLnNsaWRlcykpLG4uZG9NYXRoKCksbi5zZXR1cChcImluaXRcIiksbi52YXJzLmNvbnRyb2xOYXYmJmYuY29udHJvbE5hdi5zZXR1cCgpLG4udmFycy5kaXJlY3Rpb25OYXYmJmYuZGlyZWN0aW9uTmF2LnNldHVwKCksbi52YXJzLmtleWJvYXJkJiYoMT09PSQobi5jb250YWluZXJTZWxlY3RvcikubGVuZ3RofHxuLnZhcnMubXVsdGlwbGVLZXlib2FyZCkmJiQoZG9jdW1lbnQpLmJpbmQoXCJrZXl1cFwiLGZ1bmN0aW9uKGUpe3ZhciB0PWUua2V5Q29kZTtpZighbi5hbmltYXRpbmcmJigzOT09PXR8fDM3PT09dCkpe3ZhciBhPTM5PT09dD9uLmdldFRhcmdldChcIm5leHRcIik6Mzc9PT10JiZuLmdldFRhcmdldChcInByZXZcIik7bi5mbGV4QW5pbWF0ZShhLG4udmFycy5wYXVzZU9uQWN0aW9uKX19KSxuLnZhcnMubW91c2V3aGVlbCYmbi5iaW5kKFwibW91c2V3aGVlbFwiLGZ1bmN0aW9uKGUsdCxhLGkpe2UucHJldmVudERlZmF1bHQoKTt2YXIgcj10PDA/bi5nZXRUYXJnZXQoXCJuZXh0XCIpOm4uZ2V0VGFyZ2V0KFwicHJldlwiKTtuLmZsZXhBbmltYXRlKHIsbi52YXJzLnBhdXNlT25BY3Rpb24pfSksbi52YXJzLnBhdXNlUGxheSYmZi5wYXVzZVBsYXkuc2V0dXAoKSxuLnZhcnMuc2xpZGVzaG93JiZuLnZhcnMucGF1c2VJbnZpc2libGUmJmYucGF1c2VJbnZpc2libGUuaW5pdCgpLG4udmFycy5zbGlkZXNob3cmJihuLnZhcnMucGF1c2VPbkhvdmVyJiZuLmhvdmVyKGZ1bmN0aW9uKCl7bi5tYW51YWxQbGF5fHxuLm1hbnVhbFBhdXNlfHxuLnBhdXNlKCl9LGZ1bmN0aW9uKCl7bi5tYW51YWxQYXVzZXx8bi5tYW51YWxQbGF5fHxuLnN0b3BwZWR8fG4ucGxheSgpfSksbi52YXJzLnBhdXNlSW52aXNpYmxlJiZmLnBhdXNlSW52aXNpYmxlLmlzSGlkZGVuKCl8fChuLnZhcnMuaW5pdERlbGF5PjA/bi5zdGFydFRpbWVvdXQ9c2V0VGltZW91dChuLnBsYXksbi52YXJzLmluaXREZWxheSk6bi5wbGF5KCkpKSxtJiZmLmFzTmF2LnNldHVwKCkscyYmbi52YXJzLnRvdWNoJiZmLnRvdWNoKCksKCFwfHxwJiZuLnZhcnMuc21vb3RoSGVpZ2h0KSYmJCh3aW5kb3cpLmJpbmQoXCJyZXNpemUgb3JpZW50YXRpb25jaGFuZ2UgZm9jdXNcIixmLnJlc2l6ZSgpKSxuLmZpbmQoXCJpbWdcIikuYXR0cihcImRyYWdnYWJsZVwiLFwiZmFsc2VcIiksc2V0VGltZW91dChmdW5jdGlvbigpe24udmFycy5zdGFydChuKX0sMjAwKX0sYXNOYXY6e3NldHVwOmZ1bmN0aW9uKCl7bi5hc05hdj0hMCxuLmFuaW1hdGluZ1RvPU1hdGguZmxvb3Iobi5jdXJyZW50U2xpZGUvbi5tb3ZlKSxuLmN1cnJlbnRJdGVtPW4uY3VycmVudFNsaWRlLG4uc2xpZGVzLnJlbW92ZUNsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIikuZXEobi5jdXJyZW50SXRlbSkuYWRkQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKSxyPyh0Ll9zbGlkZXI9bixuLnNsaWRlcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9dGhpcztlLl9nZXN0dXJlPW5ldyBNU0dlc3R1cmUsZS5fZ2VzdHVyZS50YXJnZXQ9ZSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJNU1BvaW50ZXJEb3duXCIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpLGUuY3VycmVudFRhcmdldC5fZ2VzdHVyZSYmZS5jdXJyZW50VGFyZ2V0Ll9nZXN0dXJlLmFkZFBvaW50ZXIoZS5wb2ludGVySWQpfSwhMSksZS5hZGRFdmVudExpc3RlbmVyKFwiTVNHZXN0dXJlVGFwXCIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciB0PSQodGhpcyksYT10LmluZGV4KCk7JChuLnZhcnMuYXNOYXZGb3IpLmRhdGEoXCJmbGV4c2xpZGVyXCIpLmFuaW1hdGluZ3x8dC5oYXNDbGFzcyhcImFjdGl2ZVwiKXx8KG4uZGlyZWN0aW9uPW4uY3VycmVudEl0ZW08YT9cIm5leHRcIjpcInByZXZcIixuLmZsZXhBbmltYXRlKGEsbi52YXJzLnBhdXNlT25BY3Rpb24sITEsITAsITApKX0pfSkpOm4uc2xpZGVzLm9uKG8sZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciB0PSQodGhpcyksYT10LmluZGV4KCk7dC5vZmZzZXQoKS5sZWZ0LSQobikuc2Nyb2xsTGVmdCgpPD0wJiZ0Lmhhc0NsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIik/bi5mbGV4QW5pbWF0ZShuLmdldFRhcmdldChcInByZXZcIiksITApOiQobi52YXJzLmFzTmF2Rm9yKS5kYXRhKFwiZmxleHNsaWRlclwiKS5hbmltYXRpbmd8fHQuaGFzQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKXx8KG4uZGlyZWN0aW9uPW4uY3VycmVudEl0ZW08YT9cIm5leHRcIjpcInByZXZcIixuLmZsZXhBbmltYXRlKGEsbi52YXJzLnBhdXNlT25BY3Rpb24sITEsITAsITApKX0pfX0sY29udHJvbE5hdjp7c2V0dXA6ZnVuY3Rpb24oKXtuLm1hbnVhbENvbnRyb2xzP2YuY29udHJvbE5hdi5zZXR1cE1hbnVhbCgpOmYuY29udHJvbE5hdi5zZXR1cFBhZ2luZygpfSxzZXR1cFBhZ2luZzpmdW5jdGlvbigpe3ZhciBlPVwidGh1bWJuYWlsc1wiPT09bi52YXJzLmNvbnRyb2xOYXY/XCJjb250cm9sLXRodW1ic1wiOlwiY29udHJvbC1wYWdpbmdcIix0PTEsYSxyO2lmKG4uY29udHJvbE5hdlNjYWZmb2xkPSQoJzxvbCBjbGFzcz1cIicraStcImNvbnRyb2wtbmF2IFwiK2krZSsnXCI+PC9vbD4nKSxuLnBhZ2luZ0NvdW50PjEpZm9yKHZhciBzPTA7czxuLnBhZ2luZ0NvdW50O3MrKyl7cj1uLnNsaWRlcy5lcShzKSx2b2lkIDA9PT1yLmF0dHIoXCJkYXRhLXRodW1iLWFsdFwiKSYmci5hdHRyKFwiZGF0YS10aHVtYi1hbHRcIixcIlwiKTt2YXIgYz1cIlwiIT09ci5hdHRyKFwiZGF0YS10aHVtYi1hbHRcIik/Yz0nIGFsdD1cIicrci5hdHRyKFwiZGF0YS10aHVtYi1hbHRcIikrJ1wiJzpcIlwiO2lmKGE9XCJ0aHVtYm5haWxzXCI9PT1uLnZhcnMuY29udHJvbE5hdj8nPGltZyBzcmM9XCInK3IuYXR0cihcImRhdGEtdGh1bWJcIikrJ1wiJytjK1wiLz5cIjonPGEgaHJlZj1cIiNcIj4nK3QrXCI8L2E+XCIsXCJ0aHVtYm5haWxzXCI9PT1uLnZhcnMuY29udHJvbE5hdiYmITA9PT1uLnZhcnMudGh1bWJDYXB0aW9ucyl7dmFyIGQ9ci5hdHRyKFwiZGF0YS10aHVtYmNhcHRpb25cIik7XCJcIiE9PWQmJnZvaWQgMCE9PWQmJihhKz0nPHNwYW4gY2xhc3M9XCInK2krJ2NhcHRpb25cIj4nK2QrXCI8L3NwYW4+XCIpfW4uY29udHJvbE5hdlNjYWZmb2xkLmFwcGVuZChcIjxsaT5cIithK1wiPC9saT5cIiksdCsrfW4uY29udHJvbHNDb250YWluZXI/JChuLmNvbnRyb2xzQ29udGFpbmVyKS5hcHBlbmQobi5jb250cm9sTmF2U2NhZmZvbGQpOm4uYXBwZW5kKG4uY29udHJvbE5hdlNjYWZmb2xkKSxmLmNvbnRyb2xOYXYuc2V0KCksZi5jb250cm9sTmF2LmFjdGl2ZSgpLG4uY29udHJvbE5hdlNjYWZmb2xkLmRlbGVnYXRlKFwiYSwgaW1nXCIsbyxmdW5jdGlvbihlKXtpZihlLnByZXZlbnREZWZhdWx0KCksXCJcIj09PWx8fGw9PT1lLnR5cGUpe3ZhciB0PSQodGhpcyksYT1uLmNvbnRyb2xOYXYuaW5kZXgodCk7dC5oYXNDbGFzcyhpK1wiYWN0aXZlXCIpfHwobi5kaXJlY3Rpb249YT5uLmN1cnJlbnRTbGlkZT9cIm5leHRcIjpcInByZXZcIixuLmZsZXhBbmltYXRlKGEsbi52YXJzLnBhdXNlT25BY3Rpb24pKX1cIlwiPT09bCYmKGw9ZS50eXBlKSxmLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSxzZXR1cE1hbnVhbDpmdW5jdGlvbigpe24uY29udHJvbE5hdj1uLm1hbnVhbENvbnRyb2xzLGYuY29udHJvbE5hdi5hY3RpdmUoKSxuLmNvbnRyb2xOYXYuYmluZChvLGZ1bmN0aW9uKGUpe2lmKGUucHJldmVudERlZmF1bHQoKSxcIlwiPT09bHx8bD09PWUudHlwZSl7dmFyIHQ9JCh0aGlzKSxhPW4uY29udHJvbE5hdi5pbmRleCh0KTt0Lmhhc0NsYXNzKGkrXCJhY3RpdmVcIil8fChhPm4uY3VycmVudFNsaWRlP24uZGlyZWN0aW9uPVwibmV4dFwiOm4uZGlyZWN0aW9uPVwicHJldlwiLG4uZmxleEFuaW1hdGUoYSxuLnZhcnMucGF1c2VPbkFjdGlvbikpfVwiXCI9PT1sJiYobD1lLnR5cGUpLGYuc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHNldDpmdW5jdGlvbigpe3ZhciBlPVwidGh1bWJuYWlsc1wiPT09bi52YXJzLmNvbnRyb2xOYXY/XCJpbWdcIjpcImFcIjtuLmNvbnRyb2xOYXY9JChcIi5cIitpK1wiY29udHJvbC1uYXYgbGkgXCIrZSxuLmNvbnRyb2xzQ29udGFpbmVyP24uY29udHJvbHNDb250YWluZXI6bil9LGFjdGl2ZTpmdW5jdGlvbigpe24uY29udHJvbE5hdi5yZW1vdmVDbGFzcyhpK1wiYWN0aXZlXCIpLmVxKG4uYW5pbWF0aW5nVG8pLmFkZENsYXNzKGkrXCJhY3RpdmVcIil9LHVwZGF0ZTpmdW5jdGlvbihlLHQpe24ucGFnaW5nQ291bnQ+MSYmXCJhZGRcIj09PWU/bi5jb250cm9sTmF2U2NhZmZvbGQuYXBwZW5kKCQoJzxsaT48YSBocmVmPVwiI1wiPicrbi5jb3VudCtcIjwvYT48L2xpPlwiKSk6MT09PW4ucGFnaW5nQ291bnQ/bi5jb250cm9sTmF2U2NhZmZvbGQuZmluZChcImxpXCIpLnJlbW92ZSgpOm4uY29udHJvbE5hdi5lcSh0KS5jbG9zZXN0KFwibGlcIikucmVtb3ZlKCksZi5jb250cm9sTmF2LnNldCgpLG4ucGFnaW5nQ291bnQ+MSYmbi5wYWdpbmdDb3VudCE9PW4uY29udHJvbE5hdi5sZW5ndGg/bi51cGRhdGUodCxlKTpmLmNvbnRyb2xOYXYuYWN0aXZlKCl9fSxkaXJlY3Rpb25OYXY6e3NldHVwOmZ1bmN0aW9uKCl7dmFyIGU9JCgnPHVsIGNsYXNzPVwiJytpKydkaXJlY3Rpb24tbmF2XCI+PGxpIGNsYXNzPVwiJytpKyduYXYtcHJldlwiPjxhIGNsYXNzPVwiJytpKydwcmV2XCIgaHJlZj1cIiNcIj4nK24udmFycy5wcmV2VGV4dCsnPC9hPjwvbGk+PGxpIGNsYXNzPVwiJytpKyduYXYtbmV4dFwiPjxhIGNsYXNzPVwiJytpKyduZXh0XCIgaHJlZj1cIiNcIj4nK24udmFycy5uZXh0VGV4dCtcIjwvYT48L2xpPjwvdWw+XCIpO24uY3VzdG9tRGlyZWN0aW9uTmF2P24uZGlyZWN0aW9uTmF2PW4uY3VzdG9tRGlyZWN0aW9uTmF2Om4uY29udHJvbHNDb250YWluZXI/KCQobi5jb250cm9sc0NvbnRhaW5lcikuYXBwZW5kKGUpLG4uZGlyZWN0aW9uTmF2PSQoXCIuXCIraStcImRpcmVjdGlvbi1uYXYgbGkgYVwiLG4uY29udHJvbHNDb250YWluZXIpKToobi5hcHBlbmQoZSksbi5kaXJlY3Rpb25OYXY9JChcIi5cIitpK1wiZGlyZWN0aW9uLW5hdiBsaSBhXCIsbikpLGYuZGlyZWN0aW9uTmF2LnVwZGF0ZSgpLG4uZGlyZWN0aW9uTmF2LmJpbmQobyxmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCk7dmFyIHQ7XCJcIiE9PWwmJmwhPT1lLnR5cGV8fCh0PSQodGhpcykuaGFzQ2xhc3MoaStcIm5leHRcIik/bi5nZXRUYXJnZXQoXCJuZXh0XCIpOm4uZ2V0VGFyZ2V0KFwicHJldlwiKSxuLmZsZXhBbmltYXRlKHQsbi52YXJzLnBhdXNlT25BY3Rpb24pKSxcIlwiPT09bCYmKGw9ZS50eXBlKSxmLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSx1cGRhdGU6ZnVuY3Rpb24oKXt2YXIgZT1pK1wiZGlzYWJsZWRcIjsxPT09bi5wYWdpbmdDb3VudD9uLmRpcmVjdGlvbk5hdi5hZGRDbGFzcyhlKS5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpOm4udmFycy5hbmltYXRpb25Mb29wP24uZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLnJlbW92ZUF0dHIoXCJ0YWJpbmRleFwiKTowPT09bi5hbmltYXRpbmdUbz9uLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5maWx0ZXIoXCIuXCIraStcInByZXZcIikuYWRkQ2xhc3MoZSkuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTpuLmFuaW1hdGluZ1RvPT09bi5sYXN0P24uZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLmZpbHRlcihcIi5cIitpK1wibmV4dFwiKS5hZGRDbGFzcyhlKS5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpOm4uZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLnJlbW92ZUF0dHIoXCJ0YWJpbmRleFwiKX19LHBhdXNlUGxheTp7c2V0dXA6ZnVuY3Rpb24oKXt2YXIgZT0kKCc8ZGl2IGNsYXNzPVwiJytpKydwYXVzZXBsYXlcIj48YSBocmVmPVwiI1wiPjwvYT48L2Rpdj4nKTtuLmNvbnRyb2xzQ29udGFpbmVyPyhuLmNvbnRyb2xzQ29udGFpbmVyLmFwcGVuZChlKSxuLnBhdXNlUGxheT0kKFwiLlwiK2krXCJwYXVzZXBsYXkgYVwiLG4uY29udHJvbHNDb250YWluZXIpKToobi5hcHBlbmQoZSksbi5wYXVzZVBsYXk9JChcIi5cIitpK1wicGF1c2VwbGF5IGFcIixuKSksZi5wYXVzZVBsYXkudXBkYXRlKG4udmFycy5zbGlkZXNob3c/aStcInBhdXNlXCI6aStcInBsYXlcIiksbi5wYXVzZVBsYXkuYmluZChvLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKSxcIlwiIT09bCYmbCE9PWUudHlwZXx8KCQodGhpcykuaGFzQ2xhc3MoaStcInBhdXNlXCIpPyhuLm1hbnVhbFBhdXNlPSEwLG4ubWFudWFsUGxheT0hMSxuLnBhdXNlKCkpOihuLm1hbnVhbFBhdXNlPSExLG4ubWFudWFsUGxheT0hMCxuLnBsYXkoKSkpLFwiXCI9PT1sJiYobD1lLnR5cGUpLGYuc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHVwZGF0ZTpmdW5jdGlvbihlKXtcInBsYXlcIj09PWU/bi5wYXVzZVBsYXkucmVtb3ZlQ2xhc3MoaStcInBhdXNlXCIpLmFkZENsYXNzKGkrXCJwbGF5XCIpLmh0bWwobi52YXJzLnBsYXlUZXh0KTpuLnBhdXNlUGxheS5yZW1vdmVDbGFzcyhpK1wicGxheVwiKS5hZGRDbGFzcyhpK1wicGF1c2VcIikuaHRtbChuLnZhcnMucGF1c2VUZXh0KX19LHRvdWNoOmZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlKXtlLnN0b3BQcm9wYWdhdGlvbigpLG4uYW5pbWF0aW5nP2UucHJldmVudERlZmF1bHQoKToobi5wYXVzZSgpLHQuX2dlc3R1cmUuYWRkUG9pbnRlcihlLnBvaW50ZXJJZCksVD0wLGM9ZD9uLmg6bi53LGY9TnVtYmVyKG5ldyBEYXRlKSxsPXYmJnUmJm4uYW5pbWF0aW5nVG89PT1uLmxhc3Q/MDp2JiZ1P24ubGltaXQtKG4uaXRlbVcrbi52YXJzLml0ZW1NYXJnaW4pKm4ubW92ZSpuLmFuaW1hdGluZ1RvOnYmJm4uY3VycmVudFNsaWRlPT09bi5sYXN0P24ubGltaXQ6dj8obi5pdGVtVytuLnZhcnMuaXRlbU1hcmdpbikqbi5tb3ZlKm4uY3VycmVudFNsaWRlOnU/KG4ubGFzdC1uLmN1cnJlbnRTbGlkZStuLmNsb25lT2Zmc2V0KSpjOihuLmN1cnJlbnRTbGlkZStuLmNsb25lT2Zmc2V0KSpjKX1mdW5jdGlvbiBhKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCk7dmFyIGE9ZS50YXJnZXQuX3NsaWRlcjtpZihhKXt2YXIgbj0tZS50cmFuc2xhdGlvblgsaT0tZS50cmFuc2xhdGlvblk7aWYoVCs9ZD9pOm4sbT1ULHk9ZD9NYXRoLmFicyhUKTxNYXRoLmFicygtbik6TWF0aC5hYnMoVCk8TWF0aC5hYnMoLWkpLGUuZGV0YWlsPT09ZS5NU0dFU1RVUkVfRkxBR19JTkVSVElBKXJldHVybiB2b2lkIHNldEltbWVkaWF0ZShmdW5jdGlvbigpe3QuX2dlc3R1cmUuc3RvcCgpfSk7KCF5fHxOdW1iZXIobmV3IERhdGUpLWY+NTAwKSYmKGUucHJldmVudERlZmF1bHQoKSwhcCYmYS50cmFuc2l0aW9ucyYmKGEudmFycy5hbmltYXRpb25Mb29wfHwobT1ULygwPT09YS5jdXJyZW50U2xpZGUmJlQ8MHx8YS5jdXJyZW50U2xpZGU9PT1hLmxhc3QmJlQ+MD9NYXRoLmFicyhUKS9jKzI6MSkpLGEuc2V0UHJvcHMobCttLFwic2V0VG91Y2hcIikpKX19ZnVuY3Rpb24gaShlKXtlLnN0b3BQcm9wYWdhdGlvbigpO3ZhciB0PWUudGFyZ2V0Ll9zbGlkZXI7aWYodCl7aWYodC5hbmltYXRpbmdUbz09PXQuY3VycmVudFNsaWRlJiYheSYmbnVsbCE9PW0pe3ZhciBhPXU/LW06bSxuPWE+MD90LmdldFRhcmdldChcIm5leHRcIik6dC5nZXRUYXJnZXQoXCJwcmV2XCIpO3QuY2FuQWR2YW5jZShuKSYmKE51bWJlcihuZXcgRGF0ZSktZjw1NTAmJk1hdGguYWJzKGEpPjUwfHxNYXRoLmFicyhhKT5jLzIpP3QuZmxleEFuaW1hdGUobix0LnZhcnMucGF1c2VPbkFjdGlvbik6cHx8dC5mbGV4QW5pbWF0ZSh0LmN1cnJlbnRTbGlkZSx0LnZhcnMucGF1c2VPbkFjdGlvbiwhMCl9cz1udWxsLG89bnVsbCxtPW51bGwsbD1udWxsLFQ9MH19dmFyIHMsbyxsLGMsbSxmLGcsaCxTLHk9ITEseD0wLGI9MCxUPTA7cj8odC5zdHlsZS5tc1RvdWNoQWN0aW9uPVwibm9uZVwiLHQuX2dlc3R1cmU9bmV3IE1TR2VzdHVyZSx0Ll9nZXN0dXJlLnRhcmdldD10LHQuYWRkRXZlbnRMaXN0ZW5lcihcIk1TUG9pbnRlckRvd25cIixlLCExKSx0Ll9zbGlkZXI9bix0LmFkZEV2ZW50TGlzdGVuZXIoXCJNU0dlc3R1cmVDaGFuZ2VcIixhLCExKSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJNU0dlc3R1cmVFbmRcIixpLCExKSk6KGc9ZnVuY3Rpb24oZSl7bi5hbmltYXRpbmc/ZS5wcmV2ZW50RGVmYXVsdCgpOih3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWR8fDE9PT1lLnRvdWNoZXMubGVuZ3RoKSYmKG4ucGF1c2UoKSxjPWQ/bi5oOm4udyxmPU51bWJlcihuZXcgRGF0ZSkseD1lLnRvdWNoZXNbMF0ucGFnZVgsYj1lLnRvdWNoZXNbMF0ucGFnZVksbD12JiZ1JiZuLmFuaW1hdGluZ1RvPT09bi5sYXN0PzA6diYmdT9uLmxpbWl0LShuLml0ZW1XK24udmFycy5pdGVtTWFyZ2luKSpuLm1vdmUqbi5hbmltYXRpbmdUbzp2JiZuLmN1cnJlbnRTbGlkZT09PW4ubGFzdD9uLmxpbWl0OnY/KG4uaXRlbVcrbi52YXJzLml0ZW1NYXJnaW4pKm4ubW92ZSpuLmN1cnJlbnRTbGlkZTp1PyhuLmxhc3Qtbi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCkqYzoobi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCkqYyxzPWQ/Yjp4LG89ZD94OmIsdC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsaCwhMSksdC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIixTLCExKSl9LGg9ZnVuY3Rpb24oZSl7eD1lLnRvdWNoZXNbMF0ucGFnZVgsYj1lLnRvdWNoZXNbMF0ucGFnZVksbT1kP3MtYjpzLXgseT1kP01hdGguYWJzKG0pPE1hdGguYWJzKHgtbyk6TWF0aC5hYnMobSk8TWF0aC5hYnMoYi1vKTt2YXIgdD01MDA7KCF5fHxOdW1iZXIobmV3IERhdGUpLWY+NTAwKSYmKGUucHJldmVudERlZmF1bHQoKSwhcCYmbi50cmFuc2l0aW9ucyYmKG4udmFycy5hbmltYXRpb25Mb29wfHwobS89MD09PW4uY3VycmVudFNsaWRlJiZtPDB8fG4uY3VycmVudFNsaWRlPT09bi5sYXN0JiZtPjA/TWF0aC5hYnMobSkvYysyOjEpLG4uc2V0UHJvcHMobCttLFwic2V0VG91Y2hcIikpKX0sUz1mdW5jdGlvbihlKXtpZih0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixoLCExKSxuLmFuaW1hdGluZ1RvPT09bi5jdXJyZW50U2xpZGUmJiF5JiZudWxsIT09bSl7dmFyIGE9dT8tbTptLGk9YT4wP24uZ2V0VGFyZ2V0KFwibmV4dFwiKTpuLmdldFRhcmdldChcInByZXZcIik7bi5jYW5BZHZhbmNlKGkpJiYoTnVtYmVyKG5ldyBEYXRlKS1mPDU1MCYmTWF0aC5hYnMoYSk+NTB8fE1hdGguYWJzKGEpPmMvMik/bi5mbGV4QW5pbWF0ZShpLG4udmFycy5wYXVzZU9uQWN0aW9uKTpwfHxuLmZsZXhBbmltYXRlKG4uY3VycmVudFNsaWRlLG4udmFycy5wYXVzZU9uQWN0aW9uLCEwKX10LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLFMsITEpLHM9bnVsbCxvPW51bGwsbT1udWxsLGw9bnVsbH0sdC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLGcsITEpKX0scmVzaXplOmZ1bmN0aW9uKCl7IW4uYW5pbWF0aW5nJiZuLmlzKFwiOnZpc2libGVcIikmJih2fHxuLmRvTWF0aCgpLHA/Zi5zbW9vdGhIZWlnaHQoKTp2PyhuLnNsaWRlcy53aWR0aChuLmNvbXB1dGVkVyksbi51cGRhdGUobi5wYWdpbmdDb3VudCksbi5zZXRQcm9wcygpKTpkPyhuLnZpZXdwb3J0LmhlaWdodChuLmgpLG4uc2V0UHJvcHMobi5oLFwic2V0VG90YWxcIikpOihuLnZhcnMuc21vb3RoSGVpZ2h0JiZmLnNtb290aEhlaWdodCgpLG4ubmV3U2xpZGVzLndpZHRoKG4uY29tcHV0ZWRXKSxuLnNldFByb3BzKG4uY29tcHV0ZWRXLFwic2V0VG90YWxcIikpKX0sc21vb3RoSGVpZ2h0OmZ1bmN0aW9uKGUpe2lmKCFkfHxwKXt2YXIgdD1wP246bi52aWV3cG9ydDtlP3QuYW5pbWF0ZSh7aGVpZ2h0Om4uc2xpZGVzLmVxKG4uYW5pbWF0aW5nVG8pLmlubmVySGVpZ2h0KCl9LGUpOnQuaW5uZXJIZWlnaHQobi5zbGlkZXMuZXEobi5hbmltYXRpbmdUbykuaW5uZXJIZWlnaHQoKSl9fSxzeW5jOmZ1bmN0aW9uKGUpe3ZhciB0PSQobi52YXJzLnN5bmMpLmRhdGEoXCJmbGV4c2xpZGVyXCIpLGE9bi5hbmltYXRpbmdUbztzd2l0Y2goZSl7Y2FzZVwiYW5pbWF0ZVwiOnQuZmxleEFuaW1hdGUoYSxuLnZhcnMucGF1c2VPbkFjdGlvbiwhMSwhMCk7YnJlYWs7Y2FzZVwicGxheVwiOnQucGxheWluZ3x8dC5hc05hdnx8dC5wbGF5KCk7YnJlYWs7Y2FzZVwicGF1c2VcIjp0LnBhdXNlKCk7YnJlYWt9fSx1bmlxdWVJRDpmdW5jdGlvbihlKXtyZXR1cm4gZS5maWx0ZXIoXCJbaWRdXCIpLmFkZChlLmZpbmQoXCJbaWRdXCIpKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9JCh0aGlzKTtlLmF0dHIoXCJpZFwiLGUuYXR0cihcImlkXCIpK1wiX2Nsb25lXCIpfSksZX0scGF1c2VJbnZpc2libGU6e3Zpc1Byb3A6bnVsbCxpbml0OmZ1bmN0aW9uKCl7dmFyIGU9Zi5wYXVzZUludmlzaWJsZS5nZXRIaWRkZW5Qcm9wKCk7aWYoZSl7dmFyIHQ9ZS5yZXBsYWNlKC9bSHxoXWlkZGVuLyxcIlwiKStcInZpc2liaWxpdHljaGFuZ2VcIjtkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKHQsZnVuY3Rpb24oKXtmLnBhdXNlSW52aXNpYmxlLmlzSGlkZGVuKCk/bi5zdGFydFRpbWVvdXQ/Y2xlYXJUaW1lb3V0KG4uc3RhcnRUaW1lb3V0KTpuLnBhdXNlKCk6bi5zdGFydGVkP24ucGxheSgpOm4udmFycy5pbml0RGVsYXk+MD9zZXRUaW1lb3V0KG4ucGxheSxuLnZhcnMuaW5pdERlbGF5KTpuLnBsYXkoKX0pfX0saXNIaWRkZW46ZnVuY3Rpb24oKXt2YXIgZT1mLnBhdXNlSW52aXNpYmxlLmdldEhpZGRlblByb3AoKTtyZXR1cm4hIWUmJmRvY3VtZW50W2VdfSxnZXRIaWRkZW5Qcm9wOmZ1bmN0aW9uKCl7dmFyIGU9W1wid2Via2l0XCIsXCJtb3pcIixcIm1zXCIsXCJvXCJdO2lmKFwiaGlkZGVuXCJpbiBkb2N1bWVudClyZXR1cm5cImhpZGRlblwiO2Zvcih2YXIgdD0wO3Q8ZS5sZW5ndGg7dCsrKWlmKGVbdF0rXCJIaWRkZW5cImluIGRvY3VtZW50KXJldHVybiBlW3RdK1wiSGlkZGVuXCI7cmV0dXJuIG51bGx9fSxzZXRUb0NsZWFyV2F0Y2hlZEV2ZW50OmZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGMpLGM9c2V0VGltZW91dChmdW5jdGlvbigpe2w9XCJcIn0sM2UzKX19LG4uZmxleEFuaW1hdGU9ZnVuY3Rpb24oZSx0LGEscixvKXtpZihuLnZhcnMuYW5pbWF0aW9uTG9vcHx8ZT09PW4uY3VycmVudFNsaWRlfHwobi5kaXJlY3Rpb249ZT5uLmN1cnJlbnRTbGlkZT9cIm5leHRcIjpcInByZXZcIiksbSYmMT09PW4ucGFnaW5nQ291bnQmJihuLmRpcmVjdGlvbj1uLmN1cnJlbnRJdGVtPGU/XCJuZXh0XCI6XCJwcmV2XCIpLCFuLmFuaW1hdGluZyYmKG4uY2FuQWR2YW5jZShlLG8pfHxhKSYmbi5pcyhcIjp2aXNpYmxlXCIpKXtpZihtJiZyKXt2YXIgbD0kKG4udmFycy5hc05hdkZvcikuZGF0YShcImZsZXhzbGlkZXJcIik7aWYobi5hdEVuZD0wPT09ZXx8ZT09PW4uY291bnQtMSxsLmZsZXhBbmltYXRlKGUsITAsITEsITAsbyksbi5kaXJlY3Rpb249bi5jdXJyZW50SXRlbTxlP1wibmV4dFwiOlwicHJldlwiLGwuZGlyZWN0aW9uPW4uZGlyZWN0aW9uLE1hdGguY2VpbCgoZSsxKS9uLnZpc2libGUpLTE9PT1uLmN1cnJlbnRTbGlkZXx8MD09PWUpcmV0dXJuIG4uY3VycmVudEl0ZW09ZSxuLnNsaWRlcy5yZW1vdmVDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGUpLmFkZENsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIiksITE7bi5jdXJyZW50SXRlbT1lLG4uc2xpZGVzLnJlbW92ZUNsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIikuZXEoZSkuYWRkQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKSxlPU1hdGguZmxvb3IoZS9uLnZpc2libGUpfWlmKG4uYW5pbWF0aW5nPSEwLG4uYW5pbWF0aW5nVG89ZSx0JiZuLnBhdXNlKCksbi52YXJzLmJlZm9yZShuKSxuLnN5bmNFeGlzdHMmJiFvJiZmLnN5bmMoXCJhbmltYXRlXCIpLG4udmFycy5jb250cm9sTmF2JiZmLmNvbnRyb2xOYXYuYWN0aXZlKCksdnx8bi5zbGlkZXMucmVtb3ZlQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKS5lcShlKS5hZGRDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLG4uYXRFbmQ9MD09PWV8fGU9PT1uLmxhc3Qsbi52YXJzLmRpcmVjdGlvbk5hdiYmZi5kaXJlY3Rpb25OYXYudXBkYXRlKCksZT09PW4ubGFzdCYmKG4udmFycy5lbmQobiksbi52YXJzLmFuaW1hdGlvbkxvb3B8fG4ucGF1c2UoKSkscClzPyhuLnNsaWRlcy5lcShuLmN1cnJlbnRTbGlkZSkuY3NzKHtvcGFjaXR5OjAsekluZGV4OjF9KSxuLnNsaWRlcy5lcShlKS5jc3Moe29wYWNpdHk6MSx6SW5kZXg6Mn0pLG4ud3JhcHVwKGMpKToobi5zbGlkZXMuZXEobi5jdXJyZW50U2xpZGUpLmNzcyh7ekluZGV4OjF9KS5hbmltYXRlKHtvcGFjaXR5OjB9LG4udmFycy5hbmltYXRpb25TcGVlZCxuLnZhcnMuZWFzaW5nKSxuLnNsaWRlcy5lcShlKS5jc3Moe3pJbmRleDoyfSkuYW5pbWF0ZSh7b3BhY2l0eToxfSxuLnZhcnMuYW5pbWF0aW9uU3BlZWQsbi52YXJzLmVhc2luZyxuLndyYXB1cCkpO2Vsc2V7dmFyIGM9ZD9uLnNsaWRlcy5maWx0ZXIoXCI6Zmlyc3RcIikuaGVpZ2h0KCk6bi5jb21wdXRlZFcsZyxoLFM7dj8oZz1uLnZhcnMuaXRlbU1hcmdpbixTPShuLml0ZW1XK2cpKm4ubW92ZSpuLmFuaW1hdGluZ1RvLGg9Uz5uLmxpbWl0JiYxIT09bi52aXNpYmxlP24ubGltaXQ6Uyk6aD0wPT09bi5jdXJyZW50U2xpZGUmJmU9PT1uLmNvdW50LTEmJm4udmFycy5hbmltYXRpb25Mb29wJiZcIm5leHRcIiE9PW4uZGlyZWN0aW9uP3U/KG4uY291bnQrbi5jbG9uZU9mZnNldCkqYzowOm4uY3VycmVudFNsaWRlPT09bi5sYXN0JiYwPT09ZSYmbi52YXJzLmFuaW1hdGlvbkxvb3AmJlwicHJldlwiIT09bi5kaXJlY3Rpb24/dT8wOihuLmNvdW50KzEpKmM6dT8obi5jb3VudC0xLWUrbi5jbG9uZU9mZnNldCkqYzooZStuLmNsb25lT2Zmc2V0KSpjLG4uc2V0UHJvcHMoaCxcIlwiLG4udmFycy5hbmltYXRpb25TcGVlZCksbi50cmFuc2l0aW9ucz8obi52YXJzLmFuaW1hdGlvbkxvb3AmJm4uYXRFbmR8fChuLmFuaW1hdGluZz0hMSxuLmN1cnJlbnRTbGlkZT1uLmFuaW1hdGluZ1RvKSxuLmNvbnRhaW5lci51bmJpbmQoXCJ3ZWJraXRUcmFuc2l0aW9uRW5kIHRyYW5zaXRpb25lbmRcIiksbi5jb250YWluZXIuYmluZChcIndlYmtpdFRyYW5zaXRpb25FbmQgdHJhbnNpdGlvbmVuZFwiLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KG4uZW5zdXJlQW5pbWF0aW9uRW5kKSxuLndyYXB1cChjKX0pLGNsZWFyVGltZW91dChuLmVuc3VyZUFuaW1hdGlvbkVuZCksbi5lbnN1cmVBbmltYXRpb25FbmQ9c2V0VGltZW91dChmdW5jdGlvbigpe24ud3JhcHVwKGMpfSxuLnZhcnMuYW5pbWF0aW9uU3BlZWQrMTAwKSk6bi5jb250YWluZXIuYW5pbWF0ZShuLmFyZ3Msbi52YXJzLmFuaW1hdGlvblNwZWVkLG4udmFycy5lYXNpbmcsZnVuY3Rpb24oKXtuLndyYXB1cChjKX0pfW4udmFycy5zbW9vdGhIZWlnaHQmJmYuc21vb3RoSGVpZ2h0KG4udmFycy5hbmltYXRpb25TcGVlZCl9fSxuLndyYXB1cD1mdW5jdGlvbihlKXtwfHx2fHwoMD09PW4uY3VycmVudFNsaWRlJiZuLmFuaW1hdGluZ1RvPT09bi5sYXN0JiZuLnZhcnMuYW5pbWF0aW9uTG9vcD9uLnNldFByb3BzKGUsXCJqdW1wRW5kXCIpOm4uY3VycmVudFNsaWRlPT09bi5sYXN0JiYwPT09bi5hbmltYXRpbmdUbyYmbi52YXJzLmFuaW1hdGlvbkxvb3AmJm4uc2V0UHJvcHMoZSxcImp1bXBTdGFydFwiKSksbi5hbmltYXRpbmc9ITEsbi5jdXJyZW50U2xpZGU9bi5hbmltYXRpbmdUbyxuLnZhcnMuYWZ0ZXIobil9LG4uYW5pbWF0ZVNsaWRlcz1mdW5jdGlvbigpeyFuLmFuaW1hdGluZyYmZSYmbi5mbGV4QW5pbWF0ZShuLmdldFRhcmdldChcIm5leHRcIikpfSxuLnBhdXNlPWZ1bmN0aW9uKCl7Y2xlYXJJbnRlcnZhbChuLmFuaW1hdGVkU2xpZGVzKSxuLmFuaW1hdGVkU2xpZGVzPW51bGwsbi5wbGF5aW5nPSExLG4udmFycy5wYXVzZVBsYXkmJmYucGF1c2VQbGF5LnVwZGF0ZShcInBsYXlcIiksbi5zeW5jRXhpc3RzJiZmLnN5bmMoXCJwYXVzZVwiKX0sbi5wbGF5PWZ1bmN0aW9uKCl7bi5wbGF5aW5nJiZjbGVhckludGVydmFsKG4uYW5pbWF0ZWRTbGlkZXMpLG4uYW5pbWF0ZWRTbGlkZXM9bi5hbmltYXRlZFNsaWRlc3x8c2V0SW50ZXJ2YWwobi5hbmltYXRlU2xpZGVzLG4udmFycy5zbGlkZXNob3dTcGVlZCksbi5zdGFydGVkPW4ucGxheWluZz0hMCxuLnZhcnMucGF1c2VQbGF5JiZmLnBhdXNlUGxheS51cGRhdGUoXCJwYXVzZVwiKSxuLnN5bmNFeGlzdHMmJmYuc3luYyhcInBsYXlcIil9LG4uc3RvcD1mdW5jdGlvbigpe24ucGF1c2UoKSxuLnN0b3BwZWQ9ITB9LG4uY2FuQWR2YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBhPW0/bi5wYWdpbmdDb3VudC0xOm4ubGFzdDtyZXR1cm4hIXR8fCghKCFtfHxuLmN1cnJlbnRJdGVtIT09bi5jb3VudC0xfHwwIT09ZXx8XCJwcmV2XCIhPT1uLmRpcmVjdGlvbil8fCghbXx8MCE9PW4uY3VycmVudEl0ZW18fGUhPT1uLnBhZ2luZ0NvdW50LTF8fFwibmV4dFwiPT09bi5kaXJlY3Rpb24pJiYoIShlPT09bi5jdXJyZW50U2xpZGUmJiFtKSYmKCEhbi52YXJzLmFuaW1hdGlvbkxvb3B8fCghbi5hdEVuZHx8MCE9PW4uY3VycmVudFNsaWRlfHxlIT09YXx8XCJuZXh0XCI9PT1uLmRpcmVjdGlvbikmJighbi5hdEVuZHx8bi5jdXJyZW50U2xpZGUhPT1hfHwwIT09ZXx8XCJuZXh0XCIhPT1uLmRpcmVjdGlvbikpKSl9LG4uZ2V0VGFyZ2V0PWZ1bmN0aW9uKGUpe3JldHVybiBuLmRpcmVjdGlvbj1lLFwibmV4dFwiPT09ZT9uLmN1cnJlbnRTbGlkZT09PW4ubGFzdD8wOm4uY3VycmVudFNsaWRlKzE6MD09PW4uY3VycmVudFNsaWRlP24ubGFzdDpuLmN1cnJlbnRTbGlkZS0xfSxuLnNldFByb3BzPWZ1bmN0aW9uKGUsdCxhKXt2YXIgaT1mdW5jdGlvbigpe3ZhciBhPWV8fChuLml0ZW1XK24udmFycy5pdGVtTWFyZ2luKSpuLm1vdmUqbi5hbmltYXRpbmdUbztyZXR1cm4tMSpmdW5jdGlvbigpe2lmKHYpcmV0dXJuXCJzZXRUb3VjaFwiPT09dD9lOnUmJm4uYW5pbWF0aW5nVG89PT1uLmxhc3Q/MDp1P24ubGltaXQtKG4uaXRlbVcrbi52YXJzLml0ZW1NYXJnaW4pKm4ubW92ZSpuLmFuaW1hdGluZ1RvOm4uYW5pbWF0aW5nVG89PT1uLmxhc3Q/bi5saW1pdDphO3N3aXRjaCh0KXtjYXNlXCJzZXRUb3RhbFwiOnJldHVybiB1PyhuLmNvdW50LTEtbi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCkqZToobi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCkqZTtjYXNlXCJzZXRUb3VjaFwiOnJldHVybiBlO2Nhc2VcImp1bXBFbmRcIjpyZXR1cm4gdT9lOm4uY291bnQqZTtjYXNlXCJqdW1wU3RhcnRcIjpyZXR1cm4gdT9uLmNvdW50KmU6ZTtkZWZhdWx0OnJldHVybiBlfX0oKStcInB4XCJ9KCk7bi50cmFuc2l0aW9ucyYmKGk9ZD9cInRyYW5zbGF0ZTNkKDAsXCIraStcIiwwKVwiOlwidHJhbnNsYXRlM2QoXCIraStcIiwwLDApXCIsYT12b2lkIDAhPT1hP2EvMWUzK1wic1wiOlwiMHNcIixuLmNvbnRhaW5lci5jc3MoXCItXCIrbi5wZngrXCItdHJhbnNpdGlvbi1kdXJhdGlvblwiLGEpLG4uY29udGFpbmVyLmNzcyhcInRyYW5zaXRpb24tZHVyYXRpb25cIixhKSksbi5hcmdzW24ucHJvcF09aSwobi50cmFuc2l0aW9uc3x8dm9pZCAwPT09YSkmJm4uY29udGFpbmVyLmNzcyhuLmFyZ3MpLG4uY29udGFpbmVyLmNzcyhcInRyYW5zZm9ybVwiLGkpfSxuLnNldHVwPWZ1bmN0aW9uKGUpe2lmKHApbi5zbGlkZXMuY3NzKHt3aWR0aDpcIjEwMCVcIixmbG9hdDpcImxlZnRcIixtYXJnaW5SaWdodDpcIi0xMDAlXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksXCJpbml0XCI9PT1lJiYocz9uLnNsaWRlcy5jc3Moe29wYWNpdHk6MCxkaXNwbGF5OlwiYmxvY2tcIix3ZWJraXRUcmFuc2l0aW9uOlwib3BhY2l0eSBcIituLnZhcnMuYW5pbWF0aW9uU3BlZWQvMWUzK1wicyBlYXNlXCIsekluZGV4OjF9KS5lcShuLmN1cnJlbnRTbGlkZSkuY3NzKHtvcGFjaXR5OjEsekluZGV4OjJ9KTowPT1uLnZhcnMuZmFkZUZpcnN0U2xpZGU/bi5zbGlkZXMuY3NzKHtvcGFjaXR5OjAsZGlzcGxheTpcImJsb2NrXCIsekluZGV4OjF9KS5lcShuLmN1cnJlbnRTbGlkZSkuY3NzKHt6SW5kZXg6Mn0pLmNzcyh7b3BhY2l0eToxfSk6bi5zbGlkZXMuY3NzKHtvcGFjaXR5OjAsZGlzcGxheTpcImJsb2NrXCIsekluZGV4OjF9KS5lcShuLmN1cnJlbnRTbGlkZSkuY3NzKHt6SW5kZXg6Mn0pLmFuaW1hdGUoe29wYWNpdHk6MX0sbi52YXJzLmFuaW1hdGlvblNwZWVkLG4udmFycy5lYXNpbmcpKSxuLnZhcnMuc21vb3RoSGVpZ2h0JiZmLnNtb290aEhlaWdodCgpO2Vsc2V7dmFyIHQsYTtcImluaXRcIj09PWUmJihuLnZpZXdwb3J0PSQoJzxkaXYgY2xhc3M9XCInK2krJ3ZpZXdwb3J0XCI+PC9kaXY+JykuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLmFwcGVuZFRvKG4pLmFwcGVuZChuLmNvbnRhaW5lciksbi5jbG9uZUNvdW50PTAsbi5jbG9uZU9mZnNldD0wLHUmJihhPSQubWFrZUFycmF5KG4uc2xpZGVzKS5yZXZlcnNlKCksbi5zbGlkZXM9JChhKSxuLmNvbnRhaW5lci5lbXB0eSgpLmFwcGVuZChuLnNsaWRlcykpKSxuLnZhcnMuYW5pbWF0aW9uTG9vcCYmIXYmJihuLmNsb25lQ291bnQ9MixuLmNsb25lT2Zmc2V0PTEsXCJpbml0XCIhPT1lJiZuLmNvbnRhaW5lci5maW5kKFwiLmNsb25lXCIpLnJlbW92ZSgpLG4uY29udGFpbmVyLmFwcGVuZChmLnVuaXF1ZUlEKG4uc2xpZGVzLmZpcnN0KCkuY2xvbmUoKS5hZGRDbGFzcyhcImNsb25lXCIpKS5hdHRyKFwiYXJpYS1oaWRkZW5cIixcInRydWVcIikpLnByZXBlbmQoZi51bmlxdWVJRChuLnNsaWRlcy5sYXN0KCkuY2xvbmUoKS5hZGRDbGFzcyhcImNsb25lXCIpKS5hdHRyKFwiYXJpYS1oaWRkZW5cIixcInRydWVcIikpKSxuLm5ld1NsaWRlcz0kKG4udmFycy5zZWxlY3RvcixuKSx0PXU/bi5jb3VudC0xLW4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQ6bi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCxkJiYhdj8obi5jb250YWluZXIuaGVpZ2h0KDIwMCoobi5jb3VudCtuLmNsb25lQ291bnQpK1wiJVwiKS5jc3MoXCJwb3NpdGlvblwiLFwiYWJzb2x1dGVcIikud2lkdGgoXCIxMDAlXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLm5ld1NsaWRlcy5jc3Moe2Rpc3BsYXk6XCJibG9ja1wifSksbi5kb01hdGgoKSxuLnZpZXdwb3J0LmhlaWdodChuLmgpLG4uc2V0UHJvcHModCpuLmgsXCJpbml0XCIpfSxcImluaXRcIj09PWU/MTAwOjApKToobi5jb250YWluZXIud2lkdGgoMjAwKihuLmNvdW50K24uY2xvbmVDb3VudCkrXCIlXCIpLG4uc2V0UHJvcHModCpuLmNvbXB1dGVkVyxcImluaXRcIiksc2V0VGltZW91dChmdW5jdGlvbigpe24uZG9NYXRoKCksbi5uZXdTbGlkZXMuY3NzKHt3aWR0aDpuLmNvbXB1dGVkVyxtYXJnaW5SaWdodDpuLmNvbXB1dGVkTSxmbG9hdDpcImxlZnRcIixkaXNwbGF5OlwiYmxvY2tcIn0pLG4udmFycy5zbW9vdGhIZWlnaHQmJmYuc21vb3RoSGVpZ2h0KCl9LFwiaW5pdFwiPT09ZT8xMDA6MCkpfXZ8fG4uc2xpZGVzLnJlbW92ZUNsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIikuZXEobi5jdXJyZW50U2xpZGUpLmFkZENsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIiksbi52YXJzLmluaXQobil9LG4uZG9NYXRoPWZ1bmN0aW9uKCl7dmFyIGU9bi5zbGlkZXMuZmlyc3QoKSx0PW4udmFycy5pdGVtTWFyZ2luLGE9bi52YXJzLm1pbkl0ZW1zLGk9bi52YXJzLm1heEl0ZW1zO24udz12b2lkIDA9PT1uLnZpZXdwb3J0P24ud2lkdGgoKTpuLnZpZXdwb3J0LndpZHRoKCksbi5oPWUuaGVpZ2h0KCksbi5ib3hQYWRkaW5nPWUub3V0ZXJXaWR0aCgpLWUud2lkdGgoKSx2PyhuLml0ZW1UPW4udmFycy5pdGVtV2lkdGgrdCxuLml0ZW1NPXQsbi5taW5XPWE/YSpuLml0ZW1UOm4udyxuLm1heFc9aT9pKm4uaXRlbVQtdDpuLncsbi5pdGVtVz1uLm1pblc+bi53PyhuLnctdCooYS0xKSkvYTpuLm1heFc8bi53PyhuLnctdCooaS0xKSkvaTpuLnZhcnMuaXRlbVdpZHRoPm4udz9uLnc6bi52YXJzLml0ZW1XaWR0aCxuLnZpc2libGU9TWF0aC5mbG9vcihuLncvbi5pdGVtVyksbi5tb3ZlPW4udmFycy5tb3ZlPjAmJm4udmFycy5tb3ZlPG4udmlzaWJsZT9uLnZhcnMubW92ZTpuLnZpc2libGUsbi5wYWdpbmdDb3VudD1NYXRoLmNlaWwoKG4uY291bnQtbi52aXNpYmxlKS9uLm1vdmUrMSksbi5sYXN0PW4ucGFnaW5nQ291bnQtMSxuLmxpbWl0PTE9PT1uLnBhZ2luZ0NvdW50PzA6bi52YXJzLml0ZW1XaWR0aD5uLnc/bi5pdGVtVyoobi5jb3VudC0xKSt0KihuLmNvdW50LTEpOihuLml0ZW1XK3QpKm4uY291bnQtbi53LXQpOihuLml0ZW1XPW4udyxuLml0ZW1NPXQsbi5wYWdpbmdDb3VudD1uLmNvdW50LG4ubGFzdD1uLmNvdW50LTEpLG4uY29tcHV0ZWRXPW4uaXRlbVctbi5ib3hQYWRkaW5nLG4uY29tcHV0ZWRNPW4uaXRlbU19LG4udXBkYXRlPWZ1bmN0aW9uKGUsdCl7bi5kb01hdGgoKSx2fHwoZTxuLmN1cnJlbnRTbGlkZT9uLmN1cnJlbnRTbGlkZSs9MTplPD1uLmN1cnJlbnRTbGlkZSYmMCE9PWUmJihuLmN1cnJlbnRTbGlkZS09MSksbi5hbmltYXRpbmdUbz1uLmN1cnJlbnRTbGlkZSksbi52YXJzLmNvbnRyb2xOYXYmJiFuLm1hbnVhbENvbnRyb2xzJiYoXCJhZGRcIj09PXQmJiF2fHxuLnBhZ2luZ0NvdW50Pm4uY29udHJvbE5hdi5sZW5ndGg/Zi5jb250cm9sTmF2LnVwZGF0ZShcImFkZFwiKTooXCJyZW1vdmVcIj09PXQmJiF2fHxuLnBhZ2luZ0NvdW50PG4uY29udHJvbE5hdi5sZW5ndGgpJiYodiYmbi5jdXJyZW50U2xpZGU+bi5sYXN0JiYobi5jdXJyZW50U2xpZGUtPTEsbi5hbmltYXRpbmdUby09MSksZi5jb250cm9sTmF2LnVwZGF0ZShcInJlbW92ZVwiLG4ubGFzdCkpKSxuLnZhcnMuZGlyZWN0aW9uTmF2JiZmLmRpcmVjdGlvbk5hdi51cGRhdGUoKX0sbi5hZGRTbGlkZT1mdW5jdGlvbihlLHQpe3ZhciBhPSQoZSk7bi5jb3VudCs9MSxuLmxhc3Q9bi5jb3VudC0xLGQmJnU/dm9pZCAwIT09dD9uLnNsaWRlcy5lcShuLmNvdW50LXQpLmFmdGVyKGEpOm4uY29udGFpbmVyLnByZXBlbmQoYSk6dm9pZCAwIT09dD9uLnNsaWRlcy5lcSh0KS5iZWZvcmUoYSk6bi5jb250YWluZXIuYXBwZW5kKGEpLG4udXBkYXRlKHQsXCJhZGRcIiksbi5zbGlkZXM9JChuLnZhcnMuc2VsZWN0b3IrXCI6bm90KC5jbG9uZSlcIixuKSxuLnNldHVwKCksbi52YXJzLmFkZGVkKG4pfSxuLnJlbW92ZVNsaWRlPWZ1bmN0aW9uKGUpe3ZhciB0PWlzTmFOKGUpP24uc2xpZGVzLmluZGV4KCQoZSkpOmU7bi5jb3VudC09MSxuLmxhc3Q9bi5jb3VudC0xLGlzTmFOKGUpPyQoZSxuLnNsaWRlcykucmVtb3ZlKCk6ZCYmdT9uLnNsaWRlcy5lcShuLmxhc3QpLnJlbW92ZSgpOm4uc2xpZGVzLmVxKGUpLnJlbW92ZSgpLG4uZG9NYXRoKCksbi51cGRhdGUodCxcInJlbW92ZVwiKSxuLnNsaWRlcz0kKG4udmFycy5zZWxlY3RvcitcIjpub3QoLmNsb25lKVwiLG4pLG4uc2V0dXAoKSxuLnZhcnMucmVtb3ZlZChuKX0sZi5pbml0KCl9LCQod2luZG93KS5ibHVyKGZ1bmN0aW9uKHQpe2U9ITF9KS5mb2N1cyhmdW5jdGlvbih0KXtlPSEwfSksJC5mbGV4c2xpZGVyLmRlZmF1bHRzPXtuYW1lc3BhY2U6XCJmbGV4LVwiLHNlbGVjdG9yOlwiLnNsaWRlcyA+IGxpXCIsYW5pbWF0aW9uOlwiZmFkZVwiLGVhc2luZzpcInN3aW5nXCIsZGlyZWN0aW9uOlwiaG9yaXpvbnRhbFwiLHJldmVyc2U6ITEsYW5pbWF0aW9uTG9vcDohMCxzbW9vdGhIZWlnaHQ6ITEsc3RhcnRBdDowLHNsaWRlc2hvdzohMCxzbGlkZXNob3dTcGVlZDo3ZTMsYW5pbWF0aW9uU3BlZWQ6NjAwLGluaXREZWxheTowLHJhbmRvbWl6ZTohMSxmYWRlRmlyc3RTbGlkZTohMCx0aHVtYkNhcHRpb25zOiExLHBhdXNlT25BY3Rpb246ITAscGF1c2VPbkhvdmVyOiExLHBhdXNlSW52aXNpYmxlOiEwLHVzZUNTUzohMCx0b3VjaDohMCx2aWRlbzohMSxjb250cm9sTmF2OiEwLGRpcmVjdGlvbk5hdjohMCxwcmV2VGV4dDpcIlByZXZpb3VzXCIsbmV4dFRleHQ6XCJOZXh0XCIsa2V5Ym9hcmQ6ITAsbXVsdGlwbGVLZXlib2FyZDohMSxtb3VzZXdoZWVsOiExLHBhdXNlUGxheTohMSxwYXVzZVRleHQ6XCJQYXVzZVwiLHBsYXlUZXh0OlwiUGxheVwiLGNvbnRyb2xzQ29udGFpbmVyOlwiXCIsbWFudWFsQ29udHJvbHM6XCJcIixjdXN0b21EaXJlY3Rpb25OYXY6XCJcIixzeW5jOlwiXCIsYXNOYXZGb3I6XCJcIixpdGVtV2lkdGg6MCxpdGVtTWFyZ2luOjAsbWluSXRlbXM6MSxtYXhJdGVtczowLG1vdmU6MCxhbGxvd09uZVNsaWRlOiEwLHN0YXJ0OmZ1bmN0aW9uKCl7fSxiZWZvcmU6ZnVuY3Rpb24oKXt9LGFmdGVyOmZ1bmN0aW9uKCl7fSxlbmQ6ZnVuY3Rpb24oKXt9LGFkZGVkOmZ1bmN0aW9uKCl7fSxyZW1vdmVkOmZ1bmN0aW9uKCl7fSxpbml0OmZ1bmN0aW9uKCl7fX0sJC5mbi5mbGV4c2xpZGVyPWZ1bmN0aW9uKGUpe2lmKHZvaWQgMD09PWUmJihlPXt9KSxcIm9iamVjdFwiPT10eXBlb2YgZSlyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHQ9JCh0aGlzKSxhPWUuc2VsZWN0b3I/ZS5zZWxlY3RvcjpcIi5zbGlkZXMgPiBsaVwiLG49dC5maW5kKGEpOzE9PT1uLmxlbmd0aCYmITE9PT1lLmFsbG93T25lU2xpZGV8fDA9PT1uLmxlbmd0aD8obi5mYWRlSW4oNDAwKSxlLnN0YXJ0JiZlLnN0YXJ0KHQpKTp2b2lkIDA9PT10LmRhdGEoXCJmbGV4c2xpZGVyXCIpJiZuZXcgJC5mbGV4c2xpZGVyKHRoaXMsZSl9KTt2YXIgdD0kKHRoaXMpLmRhdGEoXCJmbGV4c2xpZGVyXCIpO3N3aXRjaChlKXtjYXNlXCJwbGF5XCI6dC5wbGF5KCk7YnJlYWs7Y2FzZVwicGF1c2VcIjp0LnBhdXNlKCk7YnJlYWs7Y2FzZVwic3RvcFwiOnQuc3RvcCgpO2JyZWFrO2Nhc2VcIm5leHRcIjp0LmZsZXhBbmltYXRlKHQuZ2V0VGFyZ2V0KFwibmV4dFwiKSwhMCk7YnJlYWs7Y2FzZVwicHJldlwiOmNhc2VcInByZXZpb3VzXCI6dC5mbGV4QW5pbWF0ZSh0LmdldFRhcmdldChcInByZXZcIiksITApO2JyZWFrO2RlZmF1bHQ6XCJudW1iZXJcIj09dHlwZW9mIGUmJnQuZmxleEFuaW1hdGUoZSwhMCl9fX0oalF1ZXJ5KTsiLCIhZnVuY3Rpb24odCl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJqcXVlcnlcIl0sdCk6XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9dChyZXF1aXJlKFwianF1ZXJ5XCIpKTp0KGpRdWVyeSl9KGZ1bmN0aW9uKHQpe2Z1bmN0aW9uIG8obyxlKXt0aGlzLmVsZW1lbnQ9byx0aGlzLiRlbGVtZW50PXQodGhpcy5lbGVtZW50KSx0aGlzLmRvYz10KGRvY3VtZW50KSx0aGlzLndpbj10KHdpbmRvdyksdGhpcy5zZXR0aW5ncz10LmV4dGVuZCh7fSxuLGUpLFwib2JqZWN0XCI9PXR5cGVvZiB0aGlzLiRlbGVtZW50LmRhdGEoXCJ0aXBzb1wiKSYmdC5leHRlbmQodGhpcy5zZXR0aW5ncyx0aGlzLiRlbGVtZW50LmRhdGEoXCJ0aXBzb1wiKSk7Zm9yKHZhciByPU9iamVjdC5rZXlzKHRoaXMuJGVsZW1lbnQuZGF0YSgpKSxzPXt9LGQ9MDtkPHIubGVuZ3RoO2QrKyl7dmFyIGw9cltkXS5yZXBsYWNlKGksXCJcIik7aWYoXCJcIiE9PWwpe2w9bC5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKStsLnNsaWNlKDEpLHNbbF09dGhpcy4kZWxlbWVudC5kYXRhKHJbZF0pO2Zvcih2YXIgcCBpbiB0aGlzLnNldHRpbmdzKXAudG9Mb3dlckNhc2UoKT09bCYmKHRoaXMuc2V0dGluZ3NbcF09c1tsXSl9fXRoaXMuX2RlZmF1bHRzPW4sdGhpcy5fbmFtZT1pLHRoaXMuX3RpdGxlPXRoaXMuJGVsZW1lbnQuYXR0cihcInRpdGxlXCIpLHRoaXMubW9kZT1cImhpZGVcIix0aGlzLmllRmFkZT0hYSx0aGlzLnNldHRpbmdzLnByZWZlcmVkUG9zaXRpb249dGhpcy5zZXR0aW5ncy5wb3NpdGlvbix0aGlzLmluaXQoKX1mdW5jdGlvbiBlKG8pe3ZhciBlPW8uY2xvbmUoKTtlLmNzcyhcInZpc2liaWxpdHlcIixcImhpZGRlblwiKSx0KFwiYm9keVwiKS5hcHBlbmQoZSk7dmFyIHI9ZS5vdXRlckhlaWdodCgpLHM9ZS5vdXRlcldpZHRoKCk7cmV0dXJuIGUucmVtb3ZlKCkse3dpZHRoOnMsaGVpZ2h0OnJ9fWZ1bmN0aW9uIHIodCl7dC5yZW1vdmVDbGFzcyhcInRvcF9yaWdodF9jb3JuZXIgYm90dG9tX3JpZ2h0X2Nvcm5lciB0b3BfbGVmdF9jb3JuZXIgYm90dG9tX2xlZnRfY29ybmVyXCIpLHQuZmluZChcIi50aXBzb190aXRsZVwiKS5yZW1vdmVDbGFzcyhcInRvcF9yaWdodF9jb3JuZXIgYm90dG9tX3JpZ2h0X2Nvcm5lciB0b3BfbGVmdF9jb3JuZXIgYm90dG9tX2xlZnRfY29ybmVyXCIpfWZ1bmN0aW9uIHMobyl7dmFyIGksbixhLGQ9by50b29sdGlwKCksbD1vLiRlbGVtZW50LHA9byxmPXQod2luZG93KSxnPTEwLGM9cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLGg9cC50aXRsZUNvbnRlbnQoKTtzd2l0Y2godm9pZCAwIT09aCYmXCJcIiE9PWgmJihjPXAuc2V0dGluZ3MudGl0bGVCYWNrZ3JvdW5kKSxsLnBhcmVudCgpLm91dGVyV2lkdGgoKT5mLm91dGVyV2lkdGgoKSYmKGY9bC5wYXJlbnQoKSkscC5zZXR0aW5ncy5wb3NpdGlvbil7Y2FzZVwidG9wLXJpZ2h0XCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCksaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwiYm90dG9tX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJib3R0b21fcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpjfSksZC5yZW1vdmVDbGFzcyhcInRvcC1yaWdodCB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50IFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmR9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpO2JyZWFrO2Nhc2VcInRvcC1sZWZ0XCI6bj1sLm9mZnNldCgpLmxlZnQtZShkKS53aWR0aCxpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21fbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwiYm90dG9tX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6Y30pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AtcmlnaHQgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudCBcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwidG9wX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kfSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTticmVhaztjYXNlXCJib3R0b20tcmlnaHRcIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKSxpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGkrZShkKS5oZWlnaHQ+Zi5zY3JvbGxUb3AoKStmLm91dGVySGVpZ2h0KCk/KGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcInRvcF9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kfSksZC5yZW1vdmVDbGFzcyhcInRvcC1yaWdodCB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21fcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcImJvdHRvbV9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOmN9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpO2JyZWFrO2Nhc2VcImJvdHRvbS1sZWZ0XCI6bj1sLm9mZnNldCgpLmxlZnQtZShkKS53aWR0aCxpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGkrZShkKS5oZWlnaHQ+Zi5zY3JvbGxUb3AoKStmLm91dGVySGVpZ2h0KCk/KGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BfbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwidG9wX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kfSksZC5yZW1vdmVDbGFzcyhcInRvcC1yaWdodCB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21fbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwiYm90dG9tX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6Y30pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk7YnJlYWs7Y2FzZVwidG9wXCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkvMi1lKGQpLndpZHRoLzIsaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTticmVhaztjYXNlXCJib3R0b21cIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKS8yLWUoZCkud2lkdGgvMixpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGkrZShkKS5oZWlnaHQ+Zi5zY3JvbGxUb3AoKStmLm91dGVySGVpZ2h0KCk/KGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKHAuc2V0dGluZ3MucG9zaXRpb24pKTticmVhaztjYXNlXCJsZWZ0XCI6bj1sLm9mZnNldCgpLmxlZnQtZShkKS53aWR0aC1nLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpLzItZShkKS5oZWlnaHQvMixkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5Ub3A6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5MZWZ0OlwiXCJ9KSxuPGYuc2Nyb2xsTGVmdCgpPyhuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInJpZ2h0XCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKHAuc2V0dGluZ3MucG9zaXRpb24pKTticmVhaztjYXNlXCJyaWdodFwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpK2csaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkvMi1lKGQpLmhlaWdodC8yLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpblRvcDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpbkxlZnQ6XCJcIn0pLG4rZytwLnNldHRpbmdzLndpZHRoPmYuc2Nyb2xsTGVmdCgpK2Yub3V0ZXJXaWR0aCgpPyhuPWwub2Zmc2V0KCkubGVmdC1lKGQpLndpZHRoLWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwibGVmdFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhwLnNldHRpbmdzLnBvc2l0aW9uKSl9aWYoXCJ0b3AtcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24mJmQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wibWFyZ2luLWxlZnRcIjotcC5zZXR0aW5ncy53aWR0aC8yfSksXCJ0b3AtbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbil7dmFyIG09ZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmVxKDApO20uY3NzKHtcIm1hcmdpbi1sZWZ0XCI6cC5zZXR0aW5ncy53aWR0aC8yLTIqcC5zZXR0aW5ncy5hcnJvd1dpZHRofSl9aWYoXCJib3R0b20tcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pe3ZhciBtPWQuZmluZChcIi50aXBzb19hcnJvd1wiKS5lcSgwKTttLmNzcyh7XCJtYXJnaW4tbGVmdFwiOi1wLnNldHRpbmdzLndpZHRoLzIsXCJtYXJnaW4tdG9wXCI6XCJcIn0pfWlmKFwiYm90dG9tLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pe3ZhciBtPWQuZmluZChcIi50aXBzb19hcnJvd1wiKS5lcSgwKTttLmNzcyh7XCJtYXJnaW4tbGVmdFwiOnAuc2V0dGluZ3Mud2lkdGgvMi0yKnAuc2V0dGluZ3MuYXJyb3dXaWR0aCxcIm1hcmdpbi10b3BcIjpcIlwifSl9bjxmLnNjcm9sbExlZnQoKSYmKFwiYm90dG9tXCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Om4tcC5zZXR0aW5ncy5hcnJvd1dpZHRofSksbj0wKSxuK3Auc2V0dGluZ3Mud2lkdGg+Zi5vdXRlcldpZHRoKCkmJihcImJvdHRvbVwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3BcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYoYT1mLm91dGVyV2lkdGgoKS0obitwLnNldHRpbmdzLndpZHRoKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1hLXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLG4rPWEpLG48Zi5zY3JvbGxMZWZ0KCkmJihcImxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwicmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcC1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImJvdHRvbS1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJib3R0b20tbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKS8yLWUoZCkud2lkdGgvMixkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIikscihkKSxkLmFkZENsYXNzKFwidG9wXCIpKSxuK3Auc2V0dGluZ3Mud2lkdGg+Zi5vdXRlcldpZHRoKCkmJihhPWYub3V0ZXJXaWR0aCgpLShuK3Auc2V0dGluZ3Mud2lkdGgpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LWEtcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksbis9YSksbjxmLnNjcm9sbExlZnQoKSYmKGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6bi1wLnNldHRpbmdzLmFycm93V2lkdGh9KSxuPTApKSxuK3Auc2V0dGluZ3Mud2lkdGg+Zi5vdXRlcldpZHRoKCkmJihcImxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwicmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcC1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImJvdHRvbS1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJib3R0b20tcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYobj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkvMi1lKGQpLndpZHRoLzIsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSksbitwLnNldHRpbmdzLndpZHRoPmYub3V0ZXJXaWR0aCgpJiYoYT1mLm91dGVyV2lkdGgoKS0obitwLnNldHRpbmdzLndpZHRoKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1hLXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLG4rPWEpLG48Zi5zY3JvbGxMZWZ0KCkmJihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Om4tcC5zZXR0aW5ncy5hcnJvd1dpZHRofSksbj0wKSksZC5jc3Moe2xlZnQ6bitwLnNldHRpbmdzLm9mZnNldFgsdG9wOmkrcC5zZXR0aW5ncy5vZmZzZXRZfSksaTxmLnNjcm9sbFRvcCgpJiYoXCJyaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJsZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKGwudGlwc28oXCJ1cGRhdGVcIixcInBvc2l0aW9uXCIsXCJib3R0b21cIikscyhwKSksaStlKGQpLmhlaWdodD5mLnNjcm9sbFRvcCgpK2Yub3V0ZXJIZWlnaHQoKSYmKFwicmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwibGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihsLnRpcHNvKFwidXBkYXRlXCIsXCJwb3NpdGlvblwiLFwidG9wXCIpLHMocCkpfXZhciBpPVwidGlwc29cIixuPXtzcGVlZDo0MDAsYmFja2dyb3VuZDpcIiM1NWI1NTVcIix0aXRsZUJhY2tncm91bmQ6XCIjMzMzMzMzXCIsY29sb3I6XCIjZmZmZmZmXCIsdGl0bGVDb2xvcjpcIiNmZmZmZmZcIix0aXRsZUNvbnRlbnQ6XCJcIixzaG93QXJyb3c6ITAscG9zaXRpb246XCJ0b3BcIix3aWR0aDoyMDAsbWF4V2lkdGg6XCJcIixkZWxheToyMDAsaGlkZURlbGF5OjAsYW5pbWF0aW9uSW46XCJcIixhbmltYXRpb25PdXQ6XCJcIixvZmZzZXRYOjAsb2Zmc2V0WTowLGFycm93V2lkdGg6OCx0b29sdGlwSG92ZXI6ITEsY29udGVudDpudWxsLGFqYXhDb250ZW50VXJsOm51bGwsYWpheENvbnRlbnRCdWZmZXI6MCxjb250ZW50RWxlbWVudElkOm51bGwsdXNlVGl0bGU6ITEsdGVtcGxhdGVFbmdpbmVGdW5jOm51bGwsb25CZWZvcmVTaG93Om51bGwsb25TaG93Om51bGwsb25IaWRlOm51bGx9O3QuZXh0ZW5kKG8ucHJvdG90eXBlLHtpbml0OmZ1bmN0aW9uKCl7e3ZhciB0PXRoaXMsbz10aGlzLiRlbGVtZW50O3RoaXMuZG9jfWlmKG8uYWRkQ2xhc3MoXCJ0aXBzb19zdHlsZVwiKS5yZW1vdmVBdHRyKFwidGl0bGVcIiksdC5zZXR0aW5ncy50b29sdGlwSG92ZXIpe3ZhciBlPW51bGwscj1udWxsO28ub24oXCJtb3VzZW92ZXIuXCIraSxmdW5jdGlvbigpe2NsZWFyVGltZW91dChlKSxjbGVhclRpbWVvdXQocikscj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC5zaG93KCl9LDE1MCl9KSxvLm9uKFwibW91c2VvdXQuXCIraSxmdW5jdGlvbigpe2NsZWFyVGltZW91dChlKSxjbGVhclRpbWVvdXQociksZT1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC5oaWRlKCl9LDIwMCksdC50b29sdGlwKCkub24oXCJtb3VzZW92ZXIuXCIraSxmdW5jdGlvbigpe3QubW9kZT1cInRvb2x0aXBIb3ZlclwifSkub24oXCJtb3VzZW91dC5cIitpLGZ1bmN0aW9uKCl7dC5tb2RlPVwic2hvd1wiLGNsZWFyVGltZW91dChlKSxlPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0LmhpZGUoKX0sMjAwKX0pfSl9ZWxzZSBvLm9uKFwibW91c2VvdmVyLlwiK2ksZnVuY3Rpb24oKXt0LnNob3coKX0pLG8ub24oXCJtb3VzZW91dC5cIitpLGZ1bmN0aW9uKCl7dC5oaWRlKCl9KTt0LnNldHRpbmdzLmFqYXhDb250ZW50VXJsJiYodC5hamF4Q29udGVudD1udWxsKX0sdG9vbHRpcDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnRpcHNvX2J1YmJsZXx8KHRoaXMudGlwc29fYnViYmxlPXQoJzxkaXYgY2xhc3M9XCJ0aXBzb19idWJibGVcIj48ZGl2IGNsYXNzPVwidGlwc29fdGl0bGVcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGlwc29fY29udGVudFwiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXBzb19hcnJvd1wiPjwvZGl2PjwvZGl2PicpKSx0aGlzLnRpcHNvX2J1YmJsZX0sc2hvdzpmdW5jdGlvbigpe3ZhciBvPXRoaXMudG9vbHRpcCgpLGU9dGhpcyxyPXRoaXMud2luO2Uuc2V0dGluZ3Muc2hvd0Fycm93PT09ITE/by5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmhpZGUoKTpvLmZpbmQoXCIudGlwc29fYXJyb3dcIikuc2hvdygpLFwiaGlkZVwiPT09ZS5tb2RlJiYodC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25CZWZvcmVTaG93KSYmZS5zZXR0aW5ncy5vbkJlZm9yZVNob3coZS4kZWxlbWVudCxlLmVsZW1lbnQsZSksZS5zZXR0aW5ncy5zaXplJiZvLmFkZENsYXNzKGUuc2V0dGluZ3Muc2l6ZSksZS5zZXR0aW5ncy53aWR0aD9vLmNzcyh7YmFja2dyb3VuZDplLnNldHRpbmdzLmJhY2tncm91bmQsY29sb3I6ZS5zZXR0aW5ncy5jb2xvcix3aWR0aDplLnNldHRpbmdzLndpZHRofSkuaGlkZSgpOmUuc2V0dGluZ3MubWF4V2lkdGg/by5jc3Moe2JhY2tncm91bmQ6ZS5zZXR0aW5ncy5iYWNrZ3JvdW5kLGNvbG9yOmUuc2V0dGluZ3MuY29sb3IsbWF4V2lkdGg6ZS5zZXR0aW5ncy5tYXhXaWR0aH0pLmhpZGUoKTpvLmNzcyh7YmFja2dyb3VuZDplLnNldHRpbmdzLmJhY2tncm91bmQsY29sb3I6ZS5zZXR0aW5ncy5jb2xvcix3aWR0aDoyMDB9KS5oaWRlKCksby5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmNzcyh7YmFja2dyb3VuZDplLnNldHRpbmdzLnRpdGxlQmFja2dyb3VuZCxjb2xvcjplLnNldHRpbmdzLnRpdGxlQ29sb3J9KSxvLmZpbmQoXCIudGlwc29fY29udGVudFwiKS5odG1sKGUuY29udGVudCgpKSxvLmZpbmQoXCIudGlwc29fdGl0bGVcIikuaHRtbChlLnRpdGxlQ29udGVudCgpKSxzKGUpLHIub24oXCJyZXNpemUuXCIraSxmdW5jdGlvbigpe2Uuc2V0dGluZ3MucG9zaXRpb249ZS5zZXR0aW5ncy5wcmVmZXJlZFBvc2l0aW9uLHMoZSl9KSx3aW5kb3cuY2xlYXJUaW1lb3V0KGUudGltZW91dCksZS50aW1lb3V0PW51bGwsZS50aW1lb3V0PXdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5pZUZhZGV8fFwiXCI9PT1lLnNldHRpbmdzLmFuaW1hdGlvbklufHxcIlwiPT09ZS5zZXR0aW5ncy5hbmltYXRpb25PdXQ/by5hcHBlbmRUbyhcImJvZHlcIikuc3RvcCghMCwhMCkuZmFkZUluKGUuc2V0dGluZ3Muc3BlZWQsZnVuY3Rpb24oKXtlLm1vZGU9XCJzaG93XCIsdC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25TaG93KSYmZS5zZXR0aW5ncy5vblNob3coZS4kZWxlbWVudCxlLmVsZW1lbnQsZSl9KTpvLnJlbW92ZSgpLmFwcGVuZFRvKFwiYm9keVwiKS5zdG9wKCEwLCEwKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uT3V0KS5hZGRDbGFzcyhcIm5vQW5pbWF0aW9uXCIpLnJlbW92ZUNsYXNzKFwibm9BbmltYXRpb25cIikuYWRkQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbkluKS5mYWRlSW4oZS5zZXR0aW5ncy5zcGVlZCxmdW5jdGlvbigpe3QodGhpcykub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7dCh0aGlzKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uSW4pfSksZS5tb2RlPVwic2hvd1wiLHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uU2hvdykmJmUuc2V0dGluZ3Mub25TaG93KGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpLHIub2ZmKFwicmVzaXplLlwiK2ksbnVsbCxcInRpcHNvUmVzaXplSGFuZGxlclwiKX0pfSxlLnNldHRpbmdzLmRlbGF5KSl9LGhpZGU6ZnVuY3Rpb24obyl7dmFyIGU9dGhpcyxyPXRoaXMud2luLHM9dGhpcy50b29sdGlwKCksbj1lLnNldHRpbmdzLmhpZGVEZWxheTtvJiYobj0wLGUubW9kZT1cInNob3dcIiksd2luZG93LmNsZWFyVGltZW91dChlLnRpbWVvdXQpLGUudGltZW91dD1udWxsLGUudGltZW91dD13aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1widG9vbHRpcEhvdmVyXCIhPT1lLm1vZGUmJihlLmllRmFkZXx8XCJcIj09PWUuc2V0dGluZ3MuYW5pbWF0aW9uSW58fFwiXCI9PT1lLnNldHRpbmdzLmFuaW1hdGlvbk91dD9zLnN0b3AoITAsITApLmZhZGVPdXQoZS5zZXR0aW5ncy5zcGVlZCxmdW5jdGlvbigpe3QodGhpcykucmVtb3ZlKCksdC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25IaWRlKSYmXCJzaG93XCI9PT1lLm1vZGUmJmUuc2V0dGluZ3Mub25IaWRlKGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpLGUubW9kZT1cImhpZGVcIixyLm9mZihcInJlc2l6ZS5cIitpLG51bGwsXCJ0aXBzb1Jlc2l6ZUhhbmRsZXJcIil9KTpzLnN0b3AoITAsITApLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25JbikuYWRkQ2xhc3MoXCJub0FuaW1hdGlvblwiKS5yZW1vdmVDbGFzcyhcIm5vQW5pbWF0aW9uXCIpLmFkZENsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25PdXQpLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe3QodGhpcykucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbk91dCkucmVtb3ZlKCksdC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25IaWRlKSYmXCJzaG93XCI9PT1lLm1vZGUmJmUuc2V0dGluZ3Mub25IaWRlKGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpLGUubW9kZT1cImhpZGVcIixyLm9mZihcInJlc2l6ZS5cIitpLG51bGwsXCJ0aXBzb1Jlc2l6ZUhhbmRsZXJcIil9KSl9LG4pfSxjbG9zZTpmdW5jdGlvbigpe3RoaXMuaGlkZSghMCl9LGRlc3Ryb3k6ZnVuY3Rpb24oKXt7dmFyIHQ9dGhpcy4kZWxlbWVudCxvPXRoaXMud2luO3RoaXMuZG9jfXQub2ZmKFwiLlwiK2kpLG8ub2ZmKFwicmVzaXplLlwiK2ksbnVsbCxcInRpcHNvUmVzaXplSGFuZGxlclwiKSx0LnJlbW92ZURhdGEoaSksdC5yZW1vdmVDbGFzcyhcInRpcHNvX3N0eWxlXCIpLmF0dHIoXCJ0aXRsZVwiLHRoaXMuX3RpdGxlKX0sdGl0bGVDb250ZW50OmZ1bmN0aW9uKCl7dmFyIHQsbz10aGlzLiRlbGVtZW50LGU9dGhpcztyZXR1cm4gdD1lLnNldHRpbmdzLnRpdGxlQ29udGVudD9lLnNldHRpbmdzLnRpdGxlQ29udGVudDpvLmRhdGEoXCJ0aXBzby10aXRsZVwiKX0sY29udGVudDpmdW5jdGlvbigpe3ZhciBvLGU9dGhpcy4kZWxlbWVudCxyPXRoaXMscz10aGlzLl90aXRsZTtyZXR1cm4gci5zZXR0aW5ncy5hamF4Q29udGVudFVybD9yLl9hamF4Q29udGVudD9vPXIuX2FqYXhDb250ZW50OihyLl9hamF4Q29udGVudD1vPXQuYWpheCh7dHlwZTpcIkdFVFwiLHVybDpyLnNldHRpbmdzLmFqYXhDb250ZW50VXJsLGFzeW5jOiExfSkucmVzcG9uc2VUZXh0LHIuc2V0dGluZ3MuYWpheENvbnRlbnRCdWZmZXI+MD9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ci5fYWpheENvbnRlbnQ9bnVsbH0sci5zZXR0aW5ncy5hamF4Q29udGVudEJ1ZmZlcik6ci5fYWpheENvbnRlbnQ9bnVsbCk6ci5zZXR0aW5ncy5jb250ZW50RWxlbWVudElkP289dChcIiNcIityLnNldHRpbmdzLmNvbnRlbnRFbGVtZW50SWQpLnRleHQoKTpyLnNldHRpbmdzLmNvbnRlbnQ/bz1yLnNldHRpbmdzLmNvbnRlbnQ6ci5zZXR0aW5ncy51c2VUaXRsZT09PSEwP289czpcInN0cmluZ1wiPT10eXBlb2YgZS5kYXRhKFwidGlwc29cIikmJihvPWUuZGF0YShcInRpcHNvXCIpKSxudWxsIT09ci5zZXR0aW5ncy50ZW1wbGF0ZUVuZ2luZUZ1bmMmJihvPXIuc2V0dGluZ3MudGVtcGxhdGVFbmdpbmVGdW5jKG8pKSxvfSx1cGRhdGU6ZnVuY3Rpb24odCxvKXt2YXIgZT10aGlzO3JldHVybiBvP3ZvaWQoZS5zZXR0aW5nc1t0XT1vKTplLnNldHRpbmdzW3RdfX0pO3ZhciBhPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIikuc3R5bGUsbz1bXCJtc1wiLFwiT1wiLFwiTW96XCIsXCJXZWJraXRcIl07aWYoXCJcIj09PXQudHJhbnNpdGlvbilyZXR1cm4hMDtmb3IoO28ubGVuZ3RoOylpZihvLnBvcCgpK1wiVHJhbnNpdGlvblwiaW4gdClyZXR1cm4hMDtyZXR1cm4hMX0oKTt0W2ldPXQuZm5baV09ZnVuY3Rpb24oZSl7dmFyIHI9YXJndW1lbnRzO2lmKHZvaWQgMD09PWV8fFwib2JqZWN0XCI9PXR5cGVvZiBlKXJldHVybiB0aGlzIGluc3RhbmNlb2YgdHx8dC5leHRlbmQobixlKSx0aGlzLmVhY2goZnVuY3Rpb24oKXt0LmRhdGEodGhpcyxcInBsdWdpbl9cIitpKXx8dC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSxuZXcgbyh0aGlzLGUpKX0pO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBlJiZcIl9cIiE9PWVbMF0mJlwiaW5pdFwiIT09ZSl7dmFyIHM7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBuPXQuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2kpO258fChuPXQuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2ksbmV3IG8odGhpcyxlKSkpLG4gaW5zdGFuY2VvZiBvJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBuW2VdJiYocz1uW2VdLmFwcGx5KG4sQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwociwxKSkpLFwiZGVzdHJveVwiPT09ZSYmdC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSxudWxsKX0pLHZvaWQgMCE9PXM/czp0aGlzfX19KTsiLCJ2YXIgbXlUb29sdGlwID0gZnVuY3Rpb24oKSB7XG4gICAgJCgnW2RhdGEtdG9nZ2xlPXRvb2x0aXBdJykudGlwc28oe1xuICAgICAgICBiYWNrZ3JvdW5kOiAnIzRBNEE0QScsXG4gICAgICAgIHNpemU6ICdzbWFsbCcsXG4gICAgICAgIGRlbGF5OiAxMDAsXG4gICAgICAgIHNwZWVkOiAxMDAsXG4gICAgICAgIG9uQmVmb3JlU2hvdzogZnVuY3Rpb24gKGVsZSwgdGlwc28pIHtcbiAgICAgICAgICAgIHRoaXMuY29udGVudCA9IGVsZS5kYXRhKCdvcmlnaW5hbC10aXRsZScpO1xuICAgICAgICB9XG4gICAgfSk7XG59KCk7XG4iLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgY29udGVpbmVyO1xuICB2YXIgbW91c2VPdmVyID0gMDtcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xuICB2YXIgdGltZSA9IDEwMDAwO1xuXG4gIHZhciBub3RpZmljYXRpb25fYm94ID1mYWxzZTtcbiAgdmFyIGlzX2luaXQ9ZmFsc2U7XG4gIHZhciBjb25maXJtX29wdD17XG4gICAgdGl0bGU6XCLQo9C00LDQu9C10L3QuNC1XCIsXG4gICAgcXVlc3Rpb246XCLQktGLINC00LXQudGB0YLQstC40YLQtdC70YzQvdC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjD9cIixcbiAgICBidXR0b25ZZXM6XCLQlNCwXCIsXG4gICAgYnV0dG9uTm86XCLQndC10YJcIixcbiAgICBjYWxsYmFja1llczpmYWxzZSxcbiAgICBjYWxsYmFja05vOmZhbHNlLFxuICAgIG9iajpmYWxzZSxcbiAgICBidXR0b25UYWc6J2RpdicsXG4gICAgYnV0dG9uWWVzRG9wOicnLFxuICAgIGJ1dHRvbk5vRG9wOicnLFxuICB9O1xuICB2YXIgYWxlcnRfb3B0PXtcbiAgICB0aXRsZTpcIlwiLFxuICAgIHF1ZXN0aW9uOlwi0KHQvtC+0LHRidC10L3QuNC1XCIsXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxuICAgIGJ1dHRvblRhZzonZGl2JyxcbiAgICBvYmo6ZmFsc2UsXG4gIH07XG5cblxuICBmdW5jdGlvbiBpbml0KCl7XG4gICAgaXNfaW5pdD10cnVlO1xuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcblxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xuXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2NvbnRyb2wnLGNsb3NlTW9kYWwpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLGNsb3NlTW9kYWxGb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpe1xuICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICAkKCcubm90aWZpY2F0aW9uX2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKCcnKVxuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbEZvbihlKXtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgIGlmKHRhcmdldC5jbGFzc05hbWU9PVwibm90aWZpY2F0aW9uX2JveFwiKXtcbiAgICAgIGNsb3NlTW9kYWwoKTtcbiAgICB9XG4gIH1cblxuICB2YXIgX3NldFVwTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubm90aWZpY2F0aW9uX2Nsb3NlJywgX2Nsb3NlUG9wdXApO1xuICAgICQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkVudGVyKTtcbiAgICAkKCdib2R5Jykub24oJ21vdXNlbGVhdmUnLCAnLm5vdGlmaWNhdGlvbl9jb250YWluZXInLCBfb25MZWF2ZSk7XG4gIH07XG5cbiAgdmFyIF9vbkVudGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZihldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICh0aW1lckNsZWFyQWxsIT1udWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJDbGVhckFsbCk7XG4gICAgICB0aW1lckNsZWFyQWxsID0gbnVsbDtcbiAgICB9XG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24oaSl7XG4gICAgICB2YXIgb3B0aW9uPSQodGhpcykuZGF0YSgnb3B0aW9uJyk7XG4gICAgICBpZihvcHRpb24udGltZXIpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KG9wdGlvbi50aW1lcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgbW91c2VPdmVyID0gMTtcbiAgfTtcblxuICB2YXIgX29uTGVhdmUgPSBmdW5jdGlvbigpIHtcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbihpKXtcbiAgICAgICR0aGlzPSQodGhpcyk7XG4gICAgICB2YXIgb3B0aW9uPSR0aGlzLmRhdGEoJ29wdGlvbicpO1xuICAgICAgaWYob3B0aW9uLnRpbWU+MCkge1xuICAgICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQob3B0aW9uLmNsb3NlKSwgb3B0aW9uLnRpbWUgLSAxNTAwICsgMTAwICogaSk7XG4gICAgICAgICR0aGlzLmRhdGEoJ29wdGlvbicsb3B0aW9uKVxuICAgICAgfVxuICAgIH0pO1xuICAgIG1vdXNlT3ZlciA9IDA7XG4gIH07XG5cbiAgdmFyIF9jbG9zZVBvcHVwID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZihldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAkdGhpcy5vbihhbmltYXRpb25FbmQsIGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICB9KTtcbiAgICAkdGhpcy5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2hpZGUnKVxuICB9O1xuXG4gIGZ1bmN0aW9uIGFsZXJ0KGRhdGEpe1xuICAgIGlmKCFkYXRhKWRhdGE9e307XG4gICAgZGF0YT1vYmplY3RzKGFsZXJ0X29wdCxkYXRhKTtcblxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcblxuICAgIG5vdHlmeV9jbGFzcz0nbm90aWZ5X2JveCAnO1xuICAgIGlmKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcys9ZGF0YS5ub3R5ZnlfY2xhc3M7XG5cbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIicrbm90eWZ5X2NsYXNzKydcIj4nO1xuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiICcrZGF0YS5idXR0b25ZZXNEb3ArJz4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8JytkYXRhLmJ1dHRvblRhZysnIGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiICcrZGF0YS5idXR0b25Ob0RvcCsnPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvJytkYXRhLmJ1dHRvblRhZysnPic7XG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICB9O1xuXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XG5cblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgfSwxMDApXG4gIH1cblxuICBmdW5jdGlvbiBjb25maXJtKGRhdGEpe1xuICAgIGlmKCFkYXRhKWRhdGE9e307XG4gICAgZGF0YT1vYmplY3RzKGNvbmZpcm1fb3B0LGRhdGEpO1xuXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xuXG4gICAgYm94X2h0bWw9JzxkaXYgY2xhc3M9XCJub3RpZnlfYm94XCI+JztcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnRpdGxlO1xuICAgIGJveF9odG1sKz0nPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEucXVlc3Rpb247XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgaWYoZGF0YS5idXR0b25ZZXN8fGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG5cbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuICAgIGlmKGRhdGEuY2FsbGJhY2tZZXMhPWZhbHNlKXtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5feWVzJykub24oJ2NsaWNrJyxkYXRhLmNhbGxiYWNrWWVzLmJpbmQoZGF0YS5vYmopKTtcbiAgICB9XG4gICAgaWYoZGF0YS5jYWxsYmFja05vIT1mYWxzZSl7XG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX25vJykub24oJ2NsaWNrJyxkYXRhLmNhbGxiYWNrTm8uYmluZChkYXRhLm9iaikpO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgfSwxMDApXG5cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vdGlmaShkYXRhKSB7XG4gICAgaWYoIWRhdGEpZGF0YT17fTtcbiAgICB2YXIgb3B0aW9uID0ge3RpbWUgOiAoZGF0YS50aW1lfHxkYXRhLnRpbWU9PT0wKT9kYXRhLnRpbWU6dGltZX07XG4gICAgaWYgKCFjb250ZWluZXIpIHtcbiAgICAgIGNvbnRlaW5lciA9ICQoJzx1bC8+Jywge1xuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcbiAgICAgIH0pO1xuXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XG4gICAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgICB9XG5cbiAgICB2YXIgbGkgPSAkKCc8bGkvPicsIHtcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2l0ZW0nXG4gICAgfSk7XG5cbiAgICBpZiAoZGF0YS50eXBlKXtcbiAgICAgIGxpLmFkZENsYXNzKCdub3RpZmljYXRpb25faXRlbS0nICsgZGF0YS50eXBlKTtcbiAgICB9XG5cbiAgICB2YXIgY2xvc2U9JCgnPHNwYW4vPicse1xuICAgICAgY2xhc3M6J25vdGlmaWNhdGlvbl9jbG9zZSdcbiAgICB9KTtcbiAgICBvcHRpb24uY2xvc2U9Y2xvc2U7XG4gICAgbGkuYXBwZW5kKGNsb3NlKTtcblxuICAgIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XG4gICAgICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcbiAgICB9KTtcblxuICAgIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xuICAgICAgdmFyIHRpdGxlID0gJCgnPGg1Lz4nLCB7XG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXG4gICAgICB9KTtcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XG4gICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSk7XG4gICAgfVxuXG4gICAgdmFyIHRleHQ9ICQoJzxkaXYvPicse1xuICAgICAgY2xhc3M6XCJub3RpZmljYXRpb25fdGV4dFwiXG4gICAgfSk7XG4gICAgdGV4dC5odG1sKGRhdGEubWVzc2FnZSk7XG5cbiAgICBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXG4gICAgICB9KTtcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xuICAgICAgdmFyIHdyYXAgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgIGNsYXNzOiBcIndyYXBcIlxuICAgICAgfSk7XG5cbiAgICAgIHdyYXAuYXBwZW5kKGltZyk7XG4gICAgICB3cmFwLmFwcGVuZCh0ZXh0KTtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHdyYXApO1xuICAgIH1lbHNle1xuICAgICAgY29udGVudC5hcHBlbmQodGV4dCk7XG4gICAgfVxuICAgIGxpLmFwcGVuZChjb250ZW50KTtcblxuICAgIC8vXG4gICAgLy8gaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XG4gICAgLy8gICB2YXIgdGl0bGUgPSAkKCc8cC8+Jywge1xuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxuICAgIC8vICAgfSk7XG4gICAgLy8gICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xuICAgIC8vICAgbGkuYXBwZW5kKHRpdGxlKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xuICAgIC8vICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXG4gICAgLy8gICB9KTtcbiAgICAvLyAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xuICAgIC8vICAgbGkuYXBwZW5kKGltZyk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcbiAgICAvLyAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxuICAgIC8vIH0pO1xuICAgIC8vIGNvbnRlbnQuaHRtbChkYXRhLm1lc3NhZ2UpO1xuICAgIC8vXG4gICAgLy8gbGkuYXBwZW5kKGNvbnRlbnQpO1xuICAgIC8vXG4gICAgIGNvbnRlaW5lci5hcHBlbmQobGkpO1xuXG4gICAgaWYob3B0aW9uLnRpbWU+MCl7XG4gICAgICBvcHRpb24udGltZXI9c2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKGNsb3NlKSwgb3B0aW9uLnRpbWUpO1xuICAgIH1cbiAgICBsaS5kYXRhKCdvcHRpb24nLG9wdGlvbilcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYWxlcnQ6IGFsZXJ0LFxuICAgIGNvbmZpcm06IGNvbmZpcm0sXG4gICAgbm90aWZpOiBub3RpZmksXG4gIH07XG5cbn0pKCk7XG5cblxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKXtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkdGhpcz0kKHRoaXMpO1xuICBlbD0kKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGE9ZWwuZGF0YSgpO1xuXG4gIGRhdGEucXVlc3Rpb249ZWwuaHRtbCgpO1xuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG59KTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsJy5tb2RhbHNfb3BlbicsZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuXG4gICAgICAgIC8v0L/RgNC4INC+0YLQutGA0YvRgtC40Lgg0YTQvtGA0LzRiyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4INC30LDQutGA0YvRgtGMLCDQtdGB0LvQuCDQvtGC0YDRi9GC0L4gLSDQv9C+0L/QsNC/INC40YHQv9C+0LvRjNC30L7QstCw0L3QuNGPINC60YPQv9C+0L3QsCDQsdC10Lcg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuFxuICAgICAgICB2YXIgcG9wdXAgPSAkKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikuZGF0YSgncG9wdXAnKTtcbiAgICAgICAgaWYgKHBvcHVwKSB7XG4gICAgICAgICAgICBwb3B1cC5jbG9zZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9wdXAgPSAkKCdkaXYucG9wdXBfY29udCwgZGl2LnBvcHVwX2JhY2snKTtcbiAgICAgICAgICAgIGlmIChwb3B1cCkge1xuICAgICAgICAgICAgICAgIHBvcHVwLmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGhyZWY9dGhpcy5ocmVmLnNwbGl0KCcjJyk7XG4gICAgICAgIGhyZWY9aHJlZltocmVmLmxlbmd0aC0xXTtcblxuICAgICAgICBkYXRhPXtcbiAgICAgICAgICAgIGJ1dHRvblllczpmYWxzZSxcbiAgICAgICAgICAgIG5vdHlmeV9jbGFzczpcImxvYWRpbmcgXCIrKGhyZWYuaW5kZXhPZigndmlkZW8nKT09PTA/J21vZGFscy1mdWxsX3NjcmVlbic6J25vdGlmeV93aGl0ZScpLFxuICAgICAgICAgICAgcXVlc3Rpb246JydcbiAgICAgICAgfTtcbiAgICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuXG4gICAgICAgICQuZ2V0KCcvJytocmVmLGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgJCgnLm5vdGlmeV9ib3gnKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbChkYXRhLmh0bWwpO1xuICAgICAgICAgICAgYWpheEZvcm0oJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykpO1xuICAgICAgICB9LCdqc29uJyk7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pXG59KCkpO1xuIiwiJCgnLmZvb3Rlci1tZW51LXRpdGxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgJHRoaXM9JCh0aGlzKTtcbiAgaWYoJHRoaXMuaGFzQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKSl7XG4gICAgJHRoaXMucmVtb3ZlQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKVxuICB9ZWxzZXtcbiAgICAkKCcuZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XG4gICAgJHRoaXMuYWRkQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKTtcbiAgfVxuXG59KTsiLCIkKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gc3Rhck5vbWluYXRpb24oaW5kZXgpIHtcbiAgICB2YXIgc3RhcnMgPSAkKFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiKTtcbiAgICBzdGFycy5hZGRDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XG4gICAgICBzdGFycy5lcShpKS5yZW1vdmVDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XG4gICAgfVxuICB9XG5cbiAgJChkb2N1bWVudCkub24oXCJtb3VzZW92ZXJcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XG4gIH0pLm9uKFwibW91c2VsZWF2ZVwiLCBcIi5yYXRpbmctd3JhcHBlclwiLCBmdW5jdGlvbiAoZSkge1xuICAgIHN0YXJOb21pbmF0aW9uKCQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCkpO1xuICB9KS5vbihcImNsaWNrXCIsIFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiLCBmdW5jdGlvbiAoZSkge1xuICAgIHN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xuXG4gICAgJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoJCh0aGlzKS5pbmRleCgpICsgMSk7XG4gIH0pO1xufSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgdmFyICRub3R5ZmlfYnRuPSQoJy5oZWFkZXItbG9nb19ub3R5Jyk7XG4gIGlmKCRub3R5ZmlfYnRuLmxlbmd0aD09MSlyZXR1cm47XG5cbiAgJC5nZXQoJy9hY2NvdW50L25vdGlmaWNhdGlvbicsZnVuY3Rpb24oZGF0YSl7XG4gICAgaWYoIWRhdGEubm90aWZpY2F0aW9ucyB8fCBkYXRhLm5vdGlmaWNhdGlvbnMubGVuZ3RoPT0wKSByZXR1cm47XG5cbiAgICB2YXIgb3V0PSc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWJveD48dWwgY2xhc3M9XCJoZWFkZXItbm90eS1saXN0XCI+JztcbiAgICAkbm90eWZpX2J0bi5maW5kKCdhJykucmVtb3ZlQXR0cignaHJlZicpO1xuICAgIHZhciBoYXNfbmV3PWZhbHNlO1xuICAgIGZvciAodmFyIGk9MDtpPGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGg7aSsrKXtcbiAgICAgIGVsPWRhdGEubm90aWZpY2F0aW9uc1tpXTtcbiAgICAgIHZhciBpc19uZXc9KGVsLmlzX3ZpZXdlZD09MCAmJiBlbC50eXBlX2lkPT0yKVxuICAgICAgb3V0Kz0nPGxpIGNsYXNzPVwiaGVhZGVyLW5vdHktaXRlbScrKGlzX25ldz8nIGhlYWRlci1ub3R5LWl0ZW1fbmV3JzonJykrJ1wiPic7XG4gICAgICBvdXQrPSc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWRhdGE+JytlbC5kYXRhKyc8L2Rpdj4nO1xuICAgICAgb3V0Kz0nPGRpdiBjbGFzcz1oZWFkZXItbm90eS10ZXh0PicrZWwudGV4dCsnPC9kaXY+JztcbiAgICAgIG91dCs9JzwvbGk+JztcbiAgICAgIGhhc19uZXc9aGFzX25ld3x8aXNfbmV3O1xuICAgIH1cblxuICAgIG91dCs9JzwvdWw+JztcbiAgICBvdXQrPSc8YSBjbGFzcz1cImJ0blwiIGhyZWY9XCIvYWNjb3VudC9ub3RpZmljYXRpb25cIj4nK2RhdGEuYnRuKyc8L2E+JztcbiAgICBvdXQrPSc8L2Rpdj4nO1xuICAgICQoJy5oZWFkZXInKS5hcHBlbmQob3V0KTtcblxuICAgIGlmKGhhc19uZXcpe1xuICAgICAgJG5vdHlmaV9idG4uYWRkQ2xhc3MoJ3Rvb2x0aXAnKS5hZGRDbGFzcygnaGFzLW5vdHknKTtcbiAgICB9XG5cbiAgICAkbm90eWZpX2J0bi5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYoJCgnLmhlYWRlci1ub3R5LWJveCcpLmhhc0NsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpKXtcbiAgICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xuICAgICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcbiAgICAgIH1lbHNle1xuICAgICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykuYWRkQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XG4gICAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xuXG4gICAgICAgIGlmKCQodGhpcykuaGFzQ2xhc3MoJ2hhcy1ub3R5Jykpe1xuICAgICAgICAgICQucG9zdCgnL2FjY291bnQvbm90aWZpY2F0aW9uJyxmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCgnLmhlYWRlci1sb2dvX25vdHknKS5yZW1vdmVDbGFzcygndG9vbHRpcCcpLnJlbW92ZUNsYXNzKCdoYXMtbm90eScpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xuICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpO1xuICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XG4gICAgfSk7XG5cbiAgICAkKCcuaGVhZGVyLW5vdHktbGlzdCcpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSlcbiAgfSwnanNvbicpO1xuXG59KSgpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1lZ2FzbGlkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBzbGlkZXJfZGF0YT1mYWxzZTtcbiAgdmFyIGNvbnRhaW5lcl9pZD1cInNlY3Rpb24jbWVnYV9zbGlkZXJcIjtcbiAgdmFyIHBhcmFsbGF4X2dyb3VwPWZhbHNlO1xuICB2YXIgcGFyYWxsYXhfdGltZXI9ZmFsc2U7XG4gIHZhciBwYXJhbGxheF9jb3VudGVyPTA7XG4gIHZhciBwYXJhbGxheF9kPTE7XG4gIHZhciBtb2JpbGVfbW9kZT0tMTtcbiAgdmFyIG1heF90aW1lX2xvYWRfcGljPTMwMDtcbiAgdmFyIG1vYmlsZV9zaXplPTcwMDtcbiAgdmFyIHJlbmRlcl9zbGlkZV9ub209MDtcbiAgdmFyIHRvdF9pbWdfd2FpdDtcbiAgdmFyIHNsaWRlcztcbiAgdmFyIHNsaWRlX3NlbGVjdF9ib3g7XG4gIHZhciBlZGl0b3I7XG4gIHZhciB0aW1lb3V0SWQ7XG4gIHZhciBzY3JvbGxfcGVyaW9kID0gNTAwMDtcblxuICB2YXIgcG9zQXJyPVtcbiAgICAnc2xpZGVyX190ZXh0LWx0Jywnc2xpZGVyX190ZXh0LWN0Jywnc2xpZGVyX190ZXh0LXJ0JyxcbiAgICAnc2xpZGVyX190ZXh0LWxjJywnc2xpZGVyX190ZXh0LWNjJywnc2xpZGVyX190ZXh0LXJjJyxcbiAgICAnc2xpZGVyX190ZXh0LWxiJywnc2xpZGVyX190ZXh0LWNiJywnc2xpZGVyX190ZXh0LXJiJyxcbiAgXTtcbiAgdmFyIHBvc19saXN0PVtcbiAgICAn0JvQtdCy0L4g0LLQtdGA0YUnLCfRhtC10L3RgtGAINCy0LXRgNGFJywn0L/RgNCw0LLQviDQstC10YDRhScsXG4gICAgJ9Cb0LXQstC+INGG0LXQvdGC0YAnLCfRhtC10L3RgtGAJywn0L/RgNCw0LLQviDRhtC10L3RgtGAJyxcbiAgICAn0JvQtdCy0L4g0L3QuNC3Jywn0YbQtdC90YLRgCDQvdC40LcnLCfQv9GA0LDQstC+INC90LjQtycsXG4gIF07XG4gIHZhciBzaG93X2RlbGF5PVtcbiAgICAnc2hvd19ub19kZWxheScsXG4gICAgJ3Nob3dfZGVsYXlfMDUnLFxuICAgICdzaG93X2RlbGF5XzEwJyxcbiAgICAnc2hvd19kZWxheV8xNScsXG4gICAgJ3Nob3dfZGVsYXlfMjAnLFxuICAgICdzaG93X2RlbGF5XzI1JyxcbiAgICAnc2hvd19kZWxheV8zMCdcbiAgXTtcbiAgdmFyIGhpZGVfZGVsYXk9W1xuICAgICdoaWRlX25vX2RlbGF5JyxcbiAgICAnaGlkZV9kZWxheV8wNScsXG4gICAgJ2hpZGVfZGVsYXlfMTAnLFxuICAgICdoaWRlX2RlbGF5XzE1JyxcbiAgICAnaGlkZV9kZWxheV8yMCdcbiAgXTtcbiAgdmFyIHllc19ub19hcnI9W1xuICAgICdubycsXG4gICAgJ3llcydcbiAgXTtcbiAgdmFyIHllc19ub192YWw9W1xuICAgICcnLFxuICAgICdmaXhlZF9fZnVsbC1oZWlnaHQnXG4gIF07XG4gIHZhciBidG5fc3R5bGU9W1xuICAgICdub25lJyxcbiAgICAnYm9yZG8nLFxuICBdO1xuICB2YXIgc2hvd19hbmltYXRpb25zPVtcbiAgICBcIm5vdF9hbmltYXRlXCIsXG4gICAgXCJib3VuY2VJblwiLFxuICAgIFwiYm91bmNlSW5Eb3duXCIsXG4gICAgXCJib3VuY2VJbkxlZnRcIixcbiAgICBcImJvdW5jZUluUmlnaHRcIixcbiAgICBcImJvdW5jZUluVXBcIixcbiAgICBcImZhZGVJblwiLFxuICAgIFwiZmFkZUluRG93blwiLFxuICAgIFwiZmFkZUluTGVmdFwiLFxuICAgIFwiZmFkZUluUmlnaHRcIixcbiAgICBcImZhZGVJblVwXCIsXG4gICAgXCJmbGlwSW5YXCIsXG4gICAgXCJmbGlwSW5ZXCIsXG4gICAgXCJsaWdodFNwZWVkSW5cIixcbiAgICBcInJvdGF0ZUluXCIsXG4gICAgXCJyb3RhdGVJbkRvd25MZWZ0XCIsXG4gICAgXCJyb3RhdGVJblVwTGVmdFwiLFxuICAgIFwicm90YXRlSW5VcFJpZ2h0XCIsXG4gICAgXCJqYWNrSW5UaGVCb3hcIixcbiAgICBcInJvbGxJblwiLFxuICAgIFwiem9vbUluXCJcbiAgXTtcblxuICB2YXIgaGlkZV9hbmltYXRpb25zPVtcbiAgICBcIm5vdF9hbmltYXRlXCIsXG4gICAgXCJib3VuY2VPdXRcIixcbiAgICBcImJvdW5jZU91dERvd25cIixcbiAgICBcImJvdW5jZU91dExlZnRcIixcbiAgICBcImJvdW5jZU91dFJpZ2h0XCIsXG4gICAgXCJib3VuY2VPdXRVcFwiLFxuICAgIFwiZmFkZU91dFwiLFxuICAgIFwiZmFkZU91dERvd25cIixcbiAgICBcImZhZGVPdXRMZWZ0XCIsXG4gICAgXCJmYWRlT3V0UmlnaHRcIixcbiAgICBcImZhZGVPdXRVcFwiLFxuICAgIFwiZmxpcE91dFhcIixcbiAgICBcImxpcE91dFlcIixcbiAgICBcImxpZ2h0U3BlZWRPdXRcIixcbiAgICBcInJvdGF0ZU91dFwiLFxuICAgIFwicm90YXRlT3V0RG93bkxlZnRcIixcbiAgICBcInJvdGF0ZU91dERvd25SaWdodFwiLFxuICAgIFwicm90YXRlT3V0VXBMZWZ0XCIsXG4gICAgXCJyb3RhdGVPdXRVcFJpZ2h0XCIsXG4gICAgXCJoaW5nZVwiLFxuICAgIFwicm9sbE91dFwiXG4gIF07XG4gIHZhciBzdFRhYmxlO1xuICB2YXIgcGFyYWxheFRhYmxlO1xuXG4gIGZ1bmN0aW9uIGluaXRJbWFnZVNlcnZlclNlbGVjdChlbHMpIHtcbiAgICBpZihlbHMubGVuZ3RoPT0wKXJldHVybjtcbiAgICBlbHMud3JhcCgnPGRpdiBjbGFzcz1cInNlbGVjdF9pbWdcIj4nKTtcbiAgICBlbHM9ZWxzLnBhcmVudCgpO1xuICAgIGVscy5hcHBlbmQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmlsZV9idXR0b25cIj48aSBjbGFzcz1cIm1jZS1pY28gbWNlLWktYnJvd3NlXCI+PC9pPjwvYnV0dG9uPicpO1xuICAgIC8qZWxzLmZpbmQoJ2J1dHRvbicpLm9uKCdjbGljaycsZnVuY3Rpb24gKCkge1xuICAgICAgJCgnI3JveHlDdXN0b21QYW5lbDInKS5hZGRDbGFzcygnb3BlbicpXG4gICAgfSk7Ki9cbiAgICBmb3IgKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKykge1xuICAgICAgdmFyIGVsPWVscy5lcShpKS5maW5kKCdpbnB1dCcpO1xuICAgICAgaWYoIWVsLmF0dHIoJ2lkJykpe1xuICAgICAgICBlbC5hdHRyKCdpZCcsJ2ZpbGVfJytpKydfJytEYXRlLm5vdygpKVxuICAgICAgfVxuICAgICAgdmFyIHRfaWQ9ZWwuYXR0cignaWQnKTtcbiAgICAgIG1paGFpbGRldi5lbEZpbmRlci5yZWdpc3Rlcih0X2lkLCBmdW5jdGlvbiAoZmlsZSwgaWQpIHtcbiAgICAgICAgLy8kKHRoaXMpLnZhbChmaWxlLnVybCkudHJpZ2dlcignY2hhbmdlJywgW2ZpbGUsIGlkXSk7XG4gICAgICAgICQoJyMnK2lkKS52YWwoZmlsZS51cmwpLmNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmZpbGVfYnV0dG9uJywgZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkdGhpcz0kKHRoaXMpLnByZXYoKTtcbiAgICAgIHZhciBpZD0kdGhpcy5hdHRyKCdpZCcpO1xuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLm9wZW5NYW5hZ2VyKHtcbiAgICAgICAgXCJ1cmxcIjpcIi9tYW5hZ2VyL2VsZmluZGVyP2ZpbHRlcj1pbWFnZSZjYWxsYmFjaz1cIitpZCtcIiZsYW5nPXJ1XCIsXG4gICAgICAgIFwid2lkdGhcIjpcImF1dG9cIixcbiAgICAgICAgXCJoZWlnaHRcIjpcImF1dG9cIixcbiAgICAgICAgXCJpZFwiOmlkXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbklucHV0KGRhdGEpe1xuICAgIHZhciBpbnB1dD0nPGlucHV0IGNsYXNzPVwiJyArIChkYXRhLmlucHV0Q2xhc3MgfHwgJycpICsgJ1wiIHZhbHVlPVwiJyArIChkYXRhLnZhbHVlIHx8ICcnKSArICdcIj4nO1xuICAgIGlmKGRhdGEubGFiZWwpIHtcbiAgICAgIGlucHV0ID0gJzxsYWJlbD48c3Bhbj4nICsgZGF0YS5sYWJlbCArICc8L3NwYW4+JytpbnB1dCsnPC9sYWJlbD4nO1xuICAgIH1cbiAgICBpZihkYXRhLnBhcmVudCkge1xuICAgICAgaW5wdXQgPSAnPCcrZGF0YS5wYXJlbnQrJz4nK2lucHV0Kyc8LycrZGF0YS5wYXJlbnQrJz4nO1xuICAgIH1cbiAgICBpbnB1dCA9ICQoaW5wdXQpO1xuXG4gICAgaWYoZGF0YS5vbkNoYW5nZSl7XG4gICAgICB2YXIgb25DaGFuZ2U7XG4gICAgICBpZihkYXRhLmJpbmQpe1xuICAgICAgICBkYXRhLmJpbmQuaW5wdXQ9aW5wdXQuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgb25DaGFuZ2UgPSBkYXRhLm9uQ2hhbmdlLmJpbmQoZGF0YS5iaW5kKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChpbnB1dC5maW5kKCdpbnB1dCcpKTtcbiAgICAgIH1cbiAgICAgIGlucHV0LmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsb25DaGFuZ2UpXG4gICAgfVxuICAgIHJldHVybiBpbnB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlblNlbGVjdChkYXRhKXtcbiAgICB2YXIgaW5wdXQ9JCgnPHNlbGVjdC8+Jyk7XG5cbiAgICB2YXIgZWw9c2xpZGVyX2RhdGFbMF1bZGF0YS5ncl07XG4gICAgaWYoZGF0YS5pbmRleCE9PWZhbHNlKXtcbiAgICAgIGVsPWVsW2RhdGEuaW5kZXhdO1xuICAgIH1cblxuICAgIGlmKGVsW2RhdGEucGFyYW1dKXtcbiAgICAgIGRhdGEudmFsdWU9ZWxbZGF0YS5wYXJhbV07XG4gICAgfWVsc2V7XG4gICAgICBkYXRhLnZhbHVlPTA7XG4gICAgfVxuXG4gICAgaWYoZGF0YS5zdGFydF9vcHRpb24pe1xuICAgICAgaW5wdXQuYXBwZW5kKGRhdGEuc3RhcnRfb3B0aW9uKVxuICAgIH1cblxuICAgIGZvcih2YXIgaT0wO2k8ZGF0YS5saXN0Lmxlbmd0aDtpKyspe1xuICAgICAgdmFyIHZhbDtcbiAgICAgIHZhciB0eHQ9ZGF0YS5saXN0W2ldO1xuICAgICAgaWYoZGF0YS52YWxfdHlwZT09MCl7XG4gICAgICAgIHZhbD1kYXRhLmxpc3RbaV07XG4gICAgICB9ZWxzZSBpZihkYXRhLnZhbF90eXBlPT0xKXtcbiAgICAgICAgdmFsPWk7XG4gICAgICB9ZWxzZSBpZihkYXRhLnZhbF90eXBlPT0yKXtcbiAgICAgICAgLy92YWw9ZGF0YS52YWxfbGlzdFtpXTtcbiAgICAgICAgdmFsPWk7XG4gICAgICAgIHR4dD1kYXRhLnZhbF9saXN0W2ldO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2VsPSh2YWw9PWRhdGEudmFsdWU/J3NlbGVjdGVkJzonJyk7XG4gICAgICBpZihzZWw9PSdzZWxlY3RlZCcpe1xuICAgICAgICBpbnB1dC5hdHRyKCd0X3ZhbCcsZGF0YS5saXN0W2ldKTtcbiAgICAgIH1cbiAgICAgIHZhciBvcHRpb249JzxvcHRpb24gdmFsdWU9XCInK3ZhbCsnXCIgJytzZWwrJz4nK3R4dCsnPC9vcHRpb24+JztcbiAgICAgIGlmKGRhdGEudmFsX3R5cGU9PTIpe1xuICAgICAgICBvcHRpb249JChvcHRpb24pLmF0dHIoJ2NvZGUnLGRhdGEubGlzdFtpXSk7XG4gICAgICB9XG4gICAgICBpbnB1dC5hcHBlbmQob3B0aW9uKVxuICAgIH1cblxuICAgIGlucHV0Lm9uKCdjaGFuZ2UnLGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGE9dGhpcztcbiAgICAgIHZhciB2YWw9ZGF0YS5lbC52YWwoKTtcbiAgICAgIHZhciBzbF9vcD1kYXRhLmVsLmZpbmQoJ29wdGlvblt2YWx1ZT0nK3ZhbCsnXScpO1xuICAgICAgdmFyIGNscz1zbF9vcC50ZXh0KCk7XG4gICAgICB2YXIgY2g9c2xfb3AuYXR0cignY29kZScpO1xuICAgICAgaWYoIWNoKWNoPWNscztcbiAgICAgIGlmKGRhdGEuaW5kZXghPT1mYWxzZSl7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdW2RhdGEuaW5kZXhdW2RhdGEucGFyYW1dPXZhbDtcbiAgICAgIH1lbHNle1xuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLnBhcmFtXT12YWw7XG4gICAgICB9XG5cbiAgICAgIGRhdGEub2JqLnJlbW92ZUNsYXNzKGRhdGEucHJlZml4K2RhdGEuZWwuYXR0cigndF92YWwnKSk7XG4gICAgICBkYXRhLm9iai5hZGRDbGFzcyhkYXRhLnByZWZpeCtjaCk7XG4gICAgICBkYXRhLmVsLmF0dHIoJ3RfdmFsJyxjaCk7XG5cbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgZWw6aW5wdXQsXG4gICAgICBvYmo6ZGF0YS5vYmosXG4gICAgICBncjpkYXRhLmdyLFxuICAgICAgaW5kZXg6ZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOmRhdGEucGFyYW0sXG4gICAgICBwcmVmaXg6ZGF0YS5wcmVmaXh8fCcnXG4gICAgfSkpO1xuXG4gICAgaWYoZGF0YS5wYXJlbnQpe1xuICAgICAgdmFyIHBhcmVudD0kKCc8JytkYXRhLnBhcmVudCsnLz4nKTtcbiAgICAgIHBhcmVudC5hcHBlbmQoaW5wdXQpO1xuICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIGlucHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoZGF0YSl7XG4gICAgdmFyIGFuaW1fc2VsPVtdO1xuICAgIHZhciBvdXQ7XG5cbiAgICBpZihkYXRhLnR5cGU9PTApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCQ0L3QuNC80LDRhtC40Y8g0L/QvtGP0LLQu9C10L3QuNGPPC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OnNob3dfYW5pbWF0aW9ucyxcbiAgICAgIHZhbF90eXBlOjAsXG4gICAgICBvYmo6ZGF0YS5vYmosXG4gICAgICBncjpkYXRhLmdyLFxuICAgICAgaW5kZXg6ZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOidzaG93X2FuaW1hdGlvbicsXG4gICAgICBwcmVmaXg6J3NsaWRlXycsXG4gICAgICBwYXJlbnQ6ZGF0YS5wYXJlbnRcbiAgICB9KSk7XG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj7Ql9Cw0LTQtdGA0LbQutCwINC/0L7Rj9Cy0LvQtdC90LjRjzwvc3Bhbj4nKTtcbiAgICB9XG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDpzaG93X2RlbGF5LFxuICAgICAgdmFsX3R5cGU6MSxcbiAgICAgIG9iajpkYXRhLm9iaixcbiAgICAgIGdyOmRhdGEuZ3IsXG4gICAgICBpbmRleDpkYXRhLmluZGV4LFxuICAgICAgcGFyYW06J3Nob3dfZGVsYXknLFxuICAgICAgcHJlZml4OidzbGlkZV8nLFxuICAgICAgcGFyZW50OmRhdGEucGFyZW50XG4gICAgfSkpO1xuXG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8YnIvPicpO1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+0JDQvdC40LzQsNGG0LjRjyDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6aGlkZV9hbmltYXRpb25zLFxuICAgICAgdmFsX3R5cGU6MCxcbiAgICAgIG9iajpkYXRhLm9iaixcbiAgICAgIGdyOmRhdGEuZ3IsXG4gICAgICBpbmRleDpkYXRhLmluZGV4LFxuICAgICAgcGFyYW06J2hpZGVfYW5pbWF0aW9uJyxcbiAgICAgIHByZWZpeDonc2xpZGVfJyxcbiAgICAgIHBhcmVudDpkYXRhLnBhcmVudFxuICAgIH0pKTtcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCX0LDQtNC10YDQttC60LAg0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OmhpZGVfZGVsYXksXG4gICAgICB2YWxfdHlwZToxLFxuICAgICAgb2JqOmRhdGEub2JqLFxuICAgICAgZ3I6ZGF0YS5ncixcbiAgICAgIGluZGV4OmRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTonaGlkZV9kZWxheScsXG4gICAgICBwcmVmaXg6J3NsaWRlXycsXG4gICAgICBwYXJlbnQ6ZGF0YS5wYXJlbnRcbiAgICB9KSk7XG5cbiAgICBpZihkYXRhLnR5cGU9PTApe1xuICAgICAgb3V0PSQoJzxkaXYgY2xhc3M9XCJhbmltX3NlbFwiLz4nKTtcbiAgICAgIG91dC5hcHBlbmQoYW5pbV9zZWwpO1xuICAgIH1cbiAgICBpZihkYXRhLnR5cGU9PTEpe1xuICAgICAgb3V0PWFuaW1fc2VsO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0X2VkaXRvcigpe1xuICAgICQoJyN3MScpLnJlbW92ZSgpO1xuICAgICQoJyN3MV9idXR0b24nKS5yZW1vdmUoKTtcbiAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGU9c2xpZGVyX2RhdGFbMF0ubW9iaWxlLnNwbGl0KCc/JylbMF07XG5cbiAgICB2YXIgZWw9JCgnI21lZ2Ffc2xpZGVyX2NvbnRyb2xlJyk7XG4gICAgdmFyIGJ0bnNfYm94PSQoJzxkaXYgY2xhc3M9XCJidG5fYm94XCIvPicpO1xuXG4gICAgZWwuYXBwZW5kKCc8aDI+0KPQv9GA0LDQstC70LXQvdC40LU8L2gyPicpO1xuICAgIGVsLmFwcGVuZCgkKCc8dGV4dGFyZWEvPicse1xuICAgICAgdGV4dDpKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSksXG4gICAgICBpZDonc2xpZGVfZGF0YScsXG4gICAgICBuYW1lOiBlZGl0b3JcbiAgICB9KSk7XG5cbiAgICB2YXIgYnRuPSQoJzxidXR0b24gY2xhc3M9XCJcIi8+JykudGV4dChcItCQ0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xuICAgIGJ0bi5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkucmVtb3ZlQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcbiAgICB9KTtcblxuICAgIHZhciBidG49JCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JTQtdCw0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xuICAgIGJ0bi5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcbiAgICB9KTtcbiAgICBlbC5hcHBlbmQoYnRuc19ib3gpO1xuXG4gICAgZWwuYXBwZW5kKCc8aDI+0J7QsdGJ0LjQtSDQv9Cw0YDQsNC80LXRgtGA0Ys8L2gyPicpO1xuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTpzbGlkZXJfZGF0YVswXS5tb2JpbGUsXG4gICAgICBsYWJlbDpcItCh0LvQsNC50LQg0LTQu9GPINGC0LXQu9C10YTQvtC90LBcIixcbiAgICAgIGlucHV0Q2xhc3M6XCJmaWxlU2VsZWN0XCIsXG4gICAgICBvbkNoYW5nZTpmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGU9JCh0aGlzKS52YWwoKVxuICAgICAgICAkKCcubW9iX2JnJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrc2xpZGVyX2RhdGFbMF0ubW9iaWxlKycpJyk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6c2xpZGVyX2RhdGFbMF0uZm9uLFxuICAgICAgbGFiZWw6XCLQntGB0L3QvtC90L7QuSDRhNC+0L1cIixcbiAgICAgIGlucHV0Q2xhc3M6XCJmaWxlU2VsZWN0XCIsXG4gICAgICBvbkNoYW5nZTpmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5mb249JCh0aGlzKS52YWwoKVxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrc2xpZGVyX2RhdGFbMF0uZm9uKycpJylcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHZhciBidG5fY2g9JCgnPGRpdiBjbGFzcz1cImJ0bnNcIi8+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZCgnPGgzPtCa0L3QvtC/0LrQsCDQv9C10YDQtdGF0L7QtNCwKNC00LvRjyDQn9CaINCy0LXRgNGB0LjQuCk8L2gzPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6c2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQsXG4gICAgICBsYWJlbDpcItCi0LXQutGB0YJcIixcbiAgICAgIG9uQ2hhbmdlOmZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0PSQodGhpcykudmFsKCk7XG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCkudGV4dChzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH0sXG4gICAgfSkpO1xuXG4gICAgdmFyIGJ1dF9zbD0kKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApO1xuXG4gICAgYnRuX2NoLmFwcGVuZCgnPGJyLz4nKTtcbiAgICBidG5fY2guYXBwZW5kKCc8c3Bhbj7QntGE0L7RgNC80LvQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDpidG5fc3R5bGUsXG4gICAgICB2YWxfdHlwZTowLFxuICAgICAgb2JqOmJ1dF9zbCxcbiAgICAgIGdyOididXR0b24nLFxuICAgICAgaW5kZXg6ZmFsc2UsXG4gICAgICBwYXJhbTonY29sb3InXG4gICAgfSkpO1xuXG4gICAgYnRuX2NoLmFwcGVuZCgnPGJyLz4nKTtcbiAgICBidG5fY2guYXBwZW5kKCc8c3Bhbj7Qn9C+0LvQvtC20LXQvdC40LUg0LrQvdC+0L/QutC4PC9zcGFuPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6cG9zQXJyLFxuICAgICAgdmFsX2xpc3Q6cG9zX2xpc3QsXG4gICAgICB2YWxfdHlwZToyLFxuICAgICAgb2JqOmJ1dF9zbC5wYXJlbnQoKS5wYXJlbnQoKSxcbiAgICAgIGdyOididXR0b24nLFxuICAgICAgaW5kZXg6ZmFsc2UsXG4gICAgICBwYXJhbToncG9zJ1xuICAgIH0pKTtcblxuICAgIGJ0bl9jaC5hcHBlbmQoZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoe1xuICAgICAgdHlwZTowLFxuICAgICAgb2JqOmJ1dF9zbC5wYXJlbnQoKSxcbiAgICAgIGdyOididXR0b24nLFxuICAgICAgaW5kZXg6ZmFsc2VcbiAgICB9KSk7XG4gICAgZWwuYXBwZW5kKGJ0bl9jaCk7XG5cbiAgICB2YXIgbGF5ZXI9JCgnPGRpdiBjbGFzcz1cImZpeGVkX2xheWVyXCIvPicpO1xuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCh0YLQsNGC0LjRh9C10YHQutC40LUg0YHQu9C+0Lg8L2gyPicpO1xuICAgIHZhciB0aD1cIjx0aD7ihJY8L3RoPlwiK1xuICAgICAgICAgICAgXCI8dGg+0JrQsNGA0YLQuNC90LrQsDwvdGg+XCIrXG4gICAgICAgICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiK1xuICAgICAgICAgICAgXCI8dGg+0KHQu9C+0Lkg0L3QsCDQstGB0Y4g0LLRi9GB0L7RgtGDPC90aD5cIitcbiAgICAgICAgICAgIFwiPHRoPtCQ0L3QuNC80LDRhtC40Y8g0L/QvtGP0LLQu9C10L3QuNGPPC90aD5cIitcbiAgICAgICAgICAgIFwiPHRoPtCX0LDQtNC10YDQttC60LAg0L/QvtGP0LLQu9C10L3QuNGPPC90aD5cIitcbiAgICAgICAgICAgIFwiPHRoPtCQ0L3QuNC80LDRhtC40Y8g0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC90aD5cIitcbiAgICAgICAgICAgIFwiPHRoPtCX0LDQtNC10YDQttC60LAg0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC90aD5cIitcbiAgICAgICAgICAgIFwiPHRoPtCU0LXQudGB0YLQstC40LU8L3RoPlwiO1xuICAgIHN0VGFibGU9JCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+Jyt0aCsnPC90cj48L3RhYmxlPicpO1xuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICB2YXIgZGF0YT1zbGlkZXJfZGF0YVswXS5maXhlZDtcbiAgICBpZihkYXRhICYmIGRhdGEubGVuZ3RoPjApe1xuICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xuICAgICAgICBhZGRUclN0YXRpYyhkYXRhW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGF5ZXIuYXBwZW5kKHN0VGFibGUpO1xuICAgIHZhciBhZGRCdG49JCgnPGJ1dHRvbi8+Jyx7XG4gICAgICB0ZXh0Olwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXG4gICAgfSk7XG4gICAgYWRkQnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBkYXRhID0gYWRkVHJTdGF0aWMoZmFsc2UpO1xuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIHNsaWRlcl9kYXRhOnNsaWRlcl9kYXRhXG4gICAgfSkpO1xuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xuICAgIGVsLmFwcGVuZChsYXllcik7XG5cbiAgICB2YXIgbGF5ZXI9JCgnPGRpdiBjbGFzcz1cInBhcmFsYXhfbGF5ZXJcIi8+Jyk7XG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0J/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuDwvaDI+Jyk7XG4gICAgdmFyIHRoPVwiPHRoPuKEljwvdGg+XCIrXG4gICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIitcbiAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIrXG4gICAgICBcIjx0aD7Qo9C00LDQu9C10L3QvdC+0YHRgtGMICjRhtC10LvQvtC1INC/0L7Qu9C+0LbQuNGC0LXQu9GM0L3QvtC1INGH0LjRgdC70L4pPC90aD5cIitcbiAgICAgIFwiPHRoPtCU0LXQudGB0YLQstC40LU8L3RoPlwiO1xuXG4gICAgcGFyYWxheFRhYmxlPSQoJzx0YWJsZSBib3JkZXI9XCIxXCI+PHRyPicrdGgrJzwvdHI+PC90YWJsZT4nKTtcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgdmFyIGRhdGE9c2xpZGVyX2RhdGFbMF0ucGFyYWxheDtcbiAgICBpZihkYXRhICYmIGRhdGEubGVuZ3RoPjApe1xuICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xuICAgICAgICBhZGRUclBhcmFsYXgoZGF0YVtpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxheWVyLmFwcGVuZChwYXJhbGF4VGFibGUpO1xuICAgIHZhciBhZGRCdG49JCgnPGJ1dHRvbi8+Jyx7XG4gICAgICB0ZXh0Olwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXG4gICAgfSk7XG4gICAgYWRkQnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBkYXRhID0gYWRkVHJQYXJhbGF4KGZhbHNlKTtcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBzbGlkZXJfZGF0YTpzbGlkZXJfZGF0YVxuICAgIH0pKTtcblxuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xuICAgIGVsLmFwcGVuZChsYXllcik7XG5cbiAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWwuZmluZCgnLmZpbGVTZWxlY3QnKSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRUclN0YXRpYyhkYXRhKSB7XG4gICAgdmFyIGk9c3RUYWJsZS5maW5kKCd0cicpLmxlbmd0aC0xO1xuICAgIGlmKCFkYXRhKXtcbiAgICAgIGRhdGE9e1xuICAgICAgICBcImltZ1wiOlwiXCIsXG4gICAgICAgIFwiZnVsbF9oZWlnaHRcIjowLFxuICAgICAgICBcInBvc1wiOjAsXG4gICAgICAgIFwic2hvd19kZWxheVwiOjEsXG4gICAgICAgIFwic2hvd19hbmltYXRpb25cIjpcImxpZ2h0U3BlZWRJblwiLFxuICAgICAgICBcImhpZGVfZGVsYXlcIjoxLFxuICAgICAgICBcImhpZGVfYW5pbWF0aW9uXCI6XCJib3VuY2VPdXRcIlxuICAgICAgfTtcbiAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkLnB1c2goZGF0YSk7XG4gICAgICB2YXIgZml4ID0gJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCcpO1xuICAgICAgYWRkU3RhdGljTGF5ZXIoZGF0YSwgZml4LHRydWUpO1xuICAgIH07XG5cbiAgICB2YXIgdHI9JCgnPHRyLz4nKTtcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOmRhdGEuaW1nLFxuICAgICAgbGFiZWw6ZmFsc2UsXG4gICAgICBwYXJlbnQ6J3RkJyxcbiAgICAgIGlucHV0Q2xhc3M6XCJmaWxlU2VsZWN0XCIsXG4gICAgICBiaW5kOntcbiAgICAgICAgZ3I6J2ZpeGVkJyxcbiAgICAgICAgaW5kZXg6aSxcbiAgICAgICAgcGFyYW06J2ltZycsXG4gICAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5maW5kKCcuYW5pbWF0aW9uX2xheWVyJyksXG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6ZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGRhdGE9dGhpcztcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbnB1dC52YWwoKSsnKScpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5maXhlZFtkYXRhLmluZGV4XS5pbWc9ZGF0YS5pbnB1dC52YWwoKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6cG9zQXJyLFxuICAgICAgdmFsX2xpc3Q6cG9zX2xpc3QsXG4gICAgICB2YWxfdHlwZToyLFxuICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLFxuICAgICAgZ3I6J2ZpeGVkJyxcbiAgICAgIGluZGV4OmksXG4gICAgICBwYXJhbToncG9zJyxcbiAgICAgIHBhcmVudDondGQnLFxuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6eWVzX25vX3ZhbCxcbiAgICAgIHZhbF9saXN0Onllc19ub19hcnIsXG4gICAgICB2YWxfdHlwZToyLFxuICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLFxuICAgICAgZ3I6J2ZpeGVkJyxcbiAgICAgIGluZGV4OmksXG4gICAgICBwYXJhbTonZnVsbF9oZWlnaHQnLFxuICAgICAgcGFyZW50Oid0ZCcsXG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XG4gICAgICB0eXBlOjEsXG4gICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxuICAgICAgZ3I6J2ZpeGVkJyxcbiAgICAgIGluZGV4OmksXG4gICAgICBwYXJlbnQ6J3RkJ1xuICAgIH0pKTtcbiAgICB2YXIgZGVsQnRuPSQoJzxidXR0b24vPicse1xuICAgICAgdGV4dDpcItCj0LTQsNC70LjRgtGMXCJcbiAgICB9KTtcbiAgICBkZWxCdG4ub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciAkdGhpcz0kKHRoaXMuZWwpO1xuICAgICAgaT0kdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCktMTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcbiAgICAgIHRoaXMuc2xpZGVyX2RhdGFbMF0uZml4ZWQuc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgZWw6ZGVsQnRuLFxuICAgICAgc2xpZGVyX2RhdGE6c2xpZGVyX2RhdGFcbiAgICB9KSk7XG4gICAgdmFyIGRlbEJ0blRkPSQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcbiAgICBzdFRhYmxlLmFwcGVuZCh0cilcblxuICAgIHJldHVybiB7XG4gICAgICBlZGl0b3I6dHIsXG4gICAgICBkYXRhOmRhdGFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhZGRUclBhcmFsYXgoZGF0YSkge1xuICAgIHZhciBpPXBhcmFsYXhUYWJsZS5maW5kKCd0cicpLmxlbmd0aC0xO1xuICAgIGlmKCFkYXRhKXtcbiAgICAgIGRhdGE9e1xuICAgICAgICBcImltZ1wiOlwiXCIsXG4gICAgICAgIFwielwiOjFcbiAgICAgIH07XG4gICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4LnB1c2goZGF0YSk7XG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwJyk7XG4gICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YSwgcGFyYWxheF9ncik7XG4gICAgfTtcbiAgICB2YXIgdHI9JCgnPHRyLz4nKTtcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOmRhdGEuaW1nLFxuICAgICAgbGFiZWw6ZmFsc2UsXG4gICAgICBwYXJlbnQ6J3RkJyxcbiAgICAgIGlucHV0Q2xhc3M6XCJmaWxlU2VsZWN0XCIsXG4gICAgICBiaW5kOntcbiAgICAgICAgaW5kZXg6aSxcbiAgICAgICAgcGFyYW06J2ltZycsXG4gICAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxuICAgICAgfSxcbiAgICAgIG9uQ2hhbmdlOmZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBkYXRhPXRoaXM7XG4gICAgICAgIGRhdGEub2JqLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW5wdXQudmFsKCkrJyknKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS5pbWc9ZGF0YS5pbnB1dC52YWwoKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6cG9zQXJyLFxuICAgICAgdmFsX2xpc3Q6cG9zX2xpc3QsXG4gICAgICB2YWxfdHlwZToyLFxuICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXG4gICAgICBncjoncGFyYWxheCcsXG4gICAgICBpbmRleDppLFxuICAgICAgcGFyYW06J3BvcycsXG4gICAgICBwYXJlbnQ6J3RkJyxcbiAgICAgIHN0YXJ0X29wdGlvbjonPG9wdGlvbiB2YWx1ZT1cIlwiIGNvZGU9XCJcIj7QvdCwINCy0LXRgdGMINGN0LrRgNCw0L08L29wdGlvbj4nXG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTpkYXRhLnosXG4gICAgICBsYWJlbDpmYWxzZSxcbiAgICAgIHBhcmVudDondGQnLFxuICAgICAgYmluZDp7XG4gICAgICAgIGluZGV4OmksXG4gICAgICAgIHBhcmFtOidpbWcnLFxuICAgICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLFxuICAgICAgfSxcbiAgICAgIG9uQ2hhbmdlOmZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBkYXRhPXRoaXM7XG4gICAgICAgIGRhdGEub2JqLmF0dHIoJ3onLGRhdGEuaW5wdXQudmFsKCkpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLno9ZGF0YS5pbnB1dC52YWwoKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHZhciBkZWxCdG49JCgnPGJ1dHRvbi8+Jyx7XG4gICAgICB0ZXh0Olwi0KPQtNCw0LvQuNGC0YxcIlxuICAgIH0pO1xuICAgIGRlbEJ0bi5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyICR0aGlzPSQodGhpcy5lbCk7XG4gICAgICBpPSR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKS0xO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHQu9C+0Lkg0L3QsCDRgdC70LDQudC00LXRgNC1XG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5wYXJhbGF4LnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIGVsOmRlbEJ0bixcbiAgICAgIHNsaWRlcl9kYXRhOnNsaWRlcl9kYXRhXG4gICAgfSkpO1xuICAgIHZhciBkZWxCdG5UZD0kKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xuICAgIHRyLmFwcGVuZChkZWxCdG5UZCk7XG4gICAgcGFyYWxheFRhYmxlLmFwcGVuZCh0cilcblxuICAgIHJldHVybiB7XG4gICAgICBlZGl0b3I6dHIsXG4gICAgICBkYXRhOmRhdGFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhZGRfYW5pbWF0aW9uKGVsLGRhdGEpe1xuICAgIHZhciBvdXQ9JCgnPGRpdi8+Jyx7XG4gICAgICAnY2xhc3MnOidhbmltYXRpb25fbGF5ZXInXG4gICAgfSk7XG5cbiAgICBpZih0eXBlb2YoZGF0YS5zaG93X2RlbGF5KSE9J3VuZGVmaW5lZCcpe1xuICAgICAgb3V0LmFkZENsYXNzKHNob3dfZGVsYXlbZGF0YS5zaG93X2RlbGF5XSk7XG4gICAgICBpZihkYXRhLnNob3dfYW5pbWF0aW9uKXtcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nK2RhdGEuc2hvd19hbmltYXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKHR5cGVvZihkYXRhLmhpZGVfZGVsYXkpIT0ndW5kZWZpbmVkJyl7XG4gICAgICBvdXQuYWRkQ2xhc3MoaGlkZV9kZWxheVtkYXRhLmhpZGVfZGVsYXldKTtcbiAgICAgIGlmKGRhdGEuaGlkZV9hbmltYXRpb24pe1xuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycrZGF0YS5oaWRlX2FuaW1hdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZWwuYXBwZW5kKG91dCk7XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVfc2xpZGUoZGF0YSl7XG4gICAgdmFyIHNsaWRlPSQoJzxkaXYgY2xhc3M9XCJzbGlkZVwiLz4nKTtcblxuICAgIHZhciBtb2JfYmc9JCgnPGEgY2xhc3M9XCJtb2JfYmdcIiBocmVmPVwiJytkYXRhLmJ1dHRvbi5ocmVmKydcIi8+Jyk7XG4gICAgbW9iX2JnLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEubW9iaWxlKycpJylcblxuICAgIHNsaWRlLmFwcGVuZChtb2JfYmcpO1xuICAgIGlmKG1vYmlsZV9tb2RlKXtcbiAgICAgIHJldHVybiBzbGlkZTtcbiAgICB9XG5cbiAgICAvL9C10YHQu9C4INC10YHRgtGMINGE0L7QvSDRgtC+INC30LDQv9C+0LvQvdGP0LXQvFxuICAgIGlmKGRhdGEuZm9uKXtcbiAgICAgIHNsaWRlLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuZm9uKycpJylcbiAgICB9XG5cbiAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgaWYoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGg+MCl7XG4gICAgICB2YXIgcGFyYWxheF9ncj0kKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2dyb3VwXCIvPicpO1xuICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLnBhcmFsYXgubGVuZ3RoO2krKyl7XG4gICAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLnBhcmFsYXhbaV0scGFyYWxheF9ncilcbiAgICAgIH1cbiAgICAgIHNsaWRlLmFwcGVuZChwYXJhbGF4X2dyKVxuICAgIH1cblxuICAgIHZhciBmaXg9JCgnPGRpdiBjbGFzcz1cImZpeGVkX2dyb3VwXCIvPicpO1xuICAgIGZvcih2YXIgaT0wO2k8ZGF0YS5maXhlZC5sZW5ndGg7aSsrKXtcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEuZml4ZWRbaV0sZml4KVxuICAgIH1cblxuICAgIHZhciBkb3BfYmxrPSQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5idXR0b24ucG9zXSk7XG4gICAgdmFyIGJ1dD0kKFwiPGEgY2xhc3M9J3NsaWRlcl9faHJlZicvPlwiKTtcbiAgICBidXQuYXR0cignaHJlZicsZGF0YS5idXR0b24uaHJlZik7XG4gICAgYnV0LnRleHQoZGF0YS5idXR0b24udGV4dCk7XG4gICAgYnV0LmFkZENsYXNzKGRhdGEuYnV0dG9uLmNvbG9yKTtcbiAgICBkb3BfYmxrPWFkZF9hbmltYXRpb24oZG9wX2JsayxkYXRhLmJ1dHRvbik7XG4gICAgZG9wX2Jsay5maW5kKCdkaXYnKS5hcHBlbmQoYnV0KTtcbiAgICBmaXguYXBwZW5kKGRvcF9ibGspO1xuXG4gICAgc2xpZGUuYXBwZW5kKGZpeCk7XG4gICAgcmV0dXJuIHNsaWRlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkUGFyYWxheExheWVyKGRhdGEscGFyYWxheF9ncil7XG4gICAgdmFyIHBhcmFsbGF4X2xheWVyPSQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fbGF5ZXJcIlxcPicpO1xuICAgIHBhcmFsbGF4X2xheWVyLmF0dHIoJ3onLGRhdGEuenx8aSoxMCk7XG4gICAgdmFyIGRvcF9ibGs9JChcIjxzcGFuIGNsYXNzPSdzbGlkZXJfX3RleHQnLz5cIik7XG4gICAgaWYoZGF0YS5wb3MpIHtcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XG4gICAgfVxuICAgIGRvcF9ibGsuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcbiAgICBwYXJhbGxheF9sYXllci5hcHBlbmQoZG9wX2Jsayk7XG4gICAgcGFyYWxheF9nci5hcHBlbmQocGFyYWxsYXhfbGF5ZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkU3RhdGljTGF5ZXIoZGF0YSxmaXgsYmVmb3JfYnV0dG9uKXtcbiAgICB2YXIgZG9wX2Jsaz0kKFwiPGRpdiBjbGFzcz0nZml4ZWRfX2xheWVyJy8+XCIpO1xuICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XG4gICAgaWYoZGF0YS5mdWxsX2hlaWdodCl7XG4gICAgICBkb3BfYmxrLmFkZENsYXNzKCdmaXhlZF9fZnVsbC1oZWlnaHQnKTtcbiAgICB9XG4gICAgZG9wX2Jsaz1hZGRfYW5pbWF0aW9uKGRvcF9ibGssZGF0YSk7XG4gICAgZG9wX2Jsay5maW5kKCcuYW5pbWF0aW9uX2xheWVyJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcblxuICAgIGlmKGJlZm9yX2J1dHRvbil7XG4gICAgICBmaXguZmluZCgnLnNsaWRlcl9faHJlZicpLmNsb3Nlc3QoJy5maXhlZF9fbGF5ZXInKS5iZWZvcmUoZG9wX2JsaylcbiAgICB9ZWxzZSB7XG4gICAgICBmaXguYXBwZW5kKGRvcF9ibGspXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcbiAgICBpZigkKCcjbWVnYV9zbGlkZXInKS5oYXNDbGFzcygnc3RvcF9zbGlkZScpKXJldHVybjtcblxuICAgIHZhciBzbGlkZV9wb2ludHM9JCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlX3NlbGVjdCcpXG4gICAgdmFyIHNsaWRlX2NudD1zbGlkZV9wb2ludHMubGVuZ3RoO1xuICAgIHZhciBhY3RpdmU9JCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5pbmRleCgpKzE7XG4gICAgaWYoYWN0aXZlPj1zbGlkZV9jbnQpYWN0aXZlPTA7XG4gICAgc2xpZGVfcG9pbnRzLmVxKGFjdGl2ZSkuY2xpY2soKTtcblxuICAgIHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbWdfdG9fbG9hZChzcmMpe1xuICAgIHZhciBpbWc9JCgnPGltZy8+Jyk7XG4gICAgaW1nLm9uKCdsb2FkJyxmdW5jdGlvbigpe1xuICAgICAgdG90X2ltZ193YWl0LS07XG5cbiAgICAgIGlmKHRvdF9pbWdfd2FpdD09MCl7XG5cbiAgICAgICAgc2xpZGVzLmFwcGVuZChnZW5lcmF0ZV9zbGlkZShzbGlkZXJfZGF0YVtyZW5kZXJfc2xpZGVfbm9tXSkpO1xuICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEocmVuZGVyX3NsaWRlX25vbSkucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cbiAgICAgICAgaWYocmVuZGVyX3NsaWRlX25vbT09MCl7XG4gICAgICAgICAgc2xpZGVzLmZpbmQoJy5zbGlkZScpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2ZpcnN0X3Nob3cnKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG5cbiAgICAgICAgICBpZighZWRpdG9yKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuZmlyc3Rfc2hvdycpLnJlbW92ZUNsYXNzKCdmaXJzdF9zaG93Jyk7XG4gICAgICAgICAgICB9LmJpbmQoc2xpZGVzKSwgNTAwMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYobW9iaWxlX21vZGU9PT1mYWxzZSkge1xuICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XG4gICAgICAgICAgICBwYXJhbGxheF9jb3VudGVyID0gMDtcbiAgICAgICAgICAgIHBhcmFsbGF4X3RpbWVyID0gc2V0SW50ZXJ2YWwocmVuZGVyLCAxMDApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGVkaXRvcil7XG4gICAgICAgICAgICBpbml0X2VkaXRvcigpXG4gICAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcblxuICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3gnKS5vbignY2xpY2snLCcuc2xpZGVfc2VsZWN0JyxmdW5jdGlvbigpe1xuICAgICAgICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKTtcbiAgICAgICAgICAgICAgaWYoJHRoaXMuaGFzQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKSlyZXR1cm47XG5cbiAgICAgICAgICAgICAgdmFyIGluZGV4ID0gJHRoaXMuaW5kZXgoKTtcbiAgICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuXG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkKycgLnNsaWRlLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCsnIC5zbGlkZScpLmVxKGluZGV4KS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuXG4gICAgICAgICAgICAgIHBhcmFsbGF4X2dyb3VwID0gJChjb250YWluZXJfaWQgKyAnIC5zbGlkZXItYWN0aXZlIC5wYXJhbGxheF9fZ3JvdXA+KicpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmhvdmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmFkZENsYXNzKCdzdG9wX3NsaWRlJyk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLnJlbW92ZUNsYXNzKCdzdG9wX3NsaWRlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZW5kZXJfc2xpZGVfbm9tKys7XG4gICAgICAgIGlmKHJlbmRlcl9zbGlkZV9ub208c2xpZGVyX2RhdGEubGVuZ3RoKXtcbiAgICAgICAgICBsb2FkX3NsaWRlX2ltZygpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5vbignZXJyb3InLGZ1bmN0aW9uICgpIHtcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xuICAgIH0pO1xuICAgIGltZy5wcm9wKCdzcmMnLHNyYyk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2FkX3NsaWRlX2ltZygpe1xuICAgIHZhciBkYXRhPXNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dO1xuICAgIHRvdF9pbWdfd2FpdD0xO1xuXG4gICAgaWYobW9iaWxlX21vZGU9PT1mYWxzZSl7XG4gICAgICB0b3RfaW1nX3dhaXQrKztcbiAgICAgIGltZ190b19sb2FkKGRhdGEuZm9uKTtcbiAgICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICAgIGlmKGRhdGEucGFyYWxheCAmJiBkYXRhLnBhcmFsYXgubGVuZ3RoPjApe1xuICAgICAgICB0b3RfaW1nX3dhaXQrPWRhdGEucGFyYWxheC5sZW5ndGg7XG4gICAgICAgIGZvcih2YXIgaT0wO2k8ZGF0YS5wYXJhbGF4Lmxlbmd0aDtpKyspIHtcbiAgICAgICAgICBpbWdfdG9fbG9hZChkYXRhLnBhcmFsYXhbaV0uaW1nKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZihkYXRhLmZpeGVkICYmIGRhdGEuZml4ZWQubGVuZ3RoPjApIHtcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEuZml4ZWQubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuZml4ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpbWdfdG9fbG9hZChkYXRhLmZpeGVkW2ldLmltZylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGltZ190b19sb2FkKGRhdGEubW9iaWxlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0X2luaXRfc2xpZGUoZGF0YSl7XG4gICAgdmFyIG4gPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB2YXIgaW1nPSQoJzxpbWcvPicpO1xuICAgIGltZy5hdHRyKCd0aW1lJyxuKTtcblxuICAgIGZ1bmN0aW9uIG9uX2ltZ19sb2FkKCl7XG4gICAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgaW1nPSQodGhpcyk7XG4gICAgICBuPW4tcGFyc2VJbnQoaW1nLmF0dHIoJ3RpbWUnKSk7XG4gICAgICBpZihuPm1heF90aW1lX2xvYWRfcGljKXtcbiAgICAgICAgbW9iaWxlX21vZGU9dHJ1ZTtcbiAgICAgIH1lbHNle1xuICAgICAgICB2YXIgbWF4X3NpemU9KHNjcmVlbi5oZWlnaHQ+c2NyZWVuLndpZHRoP3NjcmVlbi5oZWlnaHQ6c2NyZWVuLndpZHRoKTtcbiAgICAgICAgaWYobWF4X3NpemU8bW9iaWxlX3NpemUpe1xuICAgICAgICAgIG1vYmlsZV9tb2RlPXRydWU7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIG1vYmlsZV9tb2RlPWZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZihtb2JpbGVfbW9kZT09dHJ1ZSl7XG4gICAgICAgICQoY29udGFpbmVyX2lkKS5hZGRDbGFzcygnbW9iaWxlX21vZGUnKVxuICAgICAgfVxuICAgICAgcmVuZGVyX3NsaWRlX25vbT0wO1xuICAgICAgbG9hZF9zbGlkZV9pbWcoKTtcbiAgICB9O1xuXG4gICAgaW1nLm9uKCdsb2FkJyxvbl9pbWdfbG9hZCgpKTtcbiAgICBpZihzbGlkZXJfZGF0YS5sZW5ndGg+MCkge1xuICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gc2xpZGVyX2RhdGFbMF0ubW9iaWxlICsgJz9yPScgKyBNYXRoLnJhbmRvbSgpO1xuICAgICAgaW1nLnByb3AoJ3NyYycsIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSk7XG4gICAgfWVsc2V7XG4gICAgICBvbl9pbWdfbG9hZCgpLmJpbmQoaW1nKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbml0KGRhdGEsZWRpdG9yX2luaXQpe1xuICAgIHNsaWRlcl9kYXRhPWRhdGE7XG4gICAgZWRpdG9yPWVkaXRvcl9pbml0O1xuICAgIC8v0L3QsNGF0L7QtNC40Lwg0LrQvtC90YLQtdC50L3QtdGAINC4INC+0YfQuNGJ0LDQtdC8INC10LPQvlxuICAgIHZhciBjb250YWluZXI9JChjb250YWluZXJfaWQpO1xuICAgIGNvbnRhaW5lci5odG1sKCcnKTtcblxuICAgIC8v0YHQvtC30LbQsNC10Lwg0LHQsNC30L7QstGL0LUg0LrQvtC90YLQtdC50L3QtdGA0Ysg0LTQu9GPINGB0LDQvNC40YUg0YHQu9Cw0LnQtNC+0LIg0Lgg0LTQu9GPINC/0LXRgNC10LrQu9GO0YfQsNGC0LXQu9C10LlcbiAgICBzbGlkZXM9JCgnPGRpdi8+Jyx7XG4gICAgICAnY2xhc3MnOidzbGlkZXMnXG4gICAgfSk7XG4gICAgdmFyIHNsaWRlX2NvbnRyb2w9JCgnPGRpdi8+Jyx7XG4gICAgICAnY2xhc3MnOidzbGlkZV9jb250cm9sJ1xuICAgIH0pO1xuICAgIHNsaWRlX3NlbGVjdF9ib3g9JCgnPHVsLz4nLHtcbiAgICAgICdjbGFzcyc6J3NsaWRlX3NlbGVjdF9ib3gnXG4gICAgfSk7XG5cbiAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQuNC90LTQuNC60LDRgtC+0YAg0LfQsNCz0YDRg9C30LrQuFxuICAgIHZhciBsPSc8ZGl2IGNsYXNzPVwic2stZm9sZGluZy1jdWJlXCI+JytcbiAgICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUxIHNrLWN1YmVcIj48L2Rpdj4nK1xuICAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTIgc2stY3ViZVwiPjwvZGl2PicrXG4gICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlNCBzay1jdWJlXCI+PC9kaXY+JytcbiAgICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUzIHNrLWN1YmVcIj48L2Rpdj4nK1xuICAgICAgICc8L2Rpdj4nO1xuICAgIGNvbnRhaW5lci5odG1sKGwpO1xuXG5cbiAgICBzdGFydF9pbml0X3NsaWRlKGRhdGFbMF0pO1xuXG4gICAgLy/Qs9C10L3QtdGA0LjRgNGD0LXQvCDQutC90L7Qv9C60Lgg0Lgg0YHQu9Cw0LnQtNGLXG4gICAgZm9yICh2YXIgaT0wO2k8ZGF0YS5sZW5ndGg7aSsrKXtcbiAgICAgIC8vc2xpZGVzLmFwcGVuZChnZW5lcmF0ZV9zbGlkZShkYXRhW2ldKSk7XG4gICAgICBzbGlkZV9zZWxlY3RfYm94LmFwcGVuZCgnPGxpIGNsYXNzPVwic2xpZGVfc2VsZWN0IGRpc2FibGVkXCIvPicpXG4gICAgfVxuXG4gICAgLypzbGlkZXMuZmluZCgnLnNsaWRlJykuZXEoMClcbiAgICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpXG4gICAgICAuYWRkQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcbiAgICBzbGlkZV9jb250cm9sLmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTsqL1xuXG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZXMpO1xuICAgIHNsaWRlX2NvbnRyb2wuYXBwZW5kKHNsaWRlX3NlbGVjdF9ib3gpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVfY29udHJvbCk7XG5cblxuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyKCl7XG4gICAgaWYoIXBhcmFsbGF4X2dyb3VwKXJldHVybiBmYWxzZTtcbiAgICB2YXIgcGFyYWxsYXhfaz0ocGFyYWxsYXhfY291bnRlci0xMCkvMjtcblxuICAgIGZvcih2YXIgaT0wO2k8cGFyYWxsYXhfZ3JvdXAubGVuZ3RoO2krKyl7XG4gICAgICB2YXIgZWw9cGFyYWxsYXhfZ3JvdXAuZXEoaSk7XG4gICAgICB2YXIgaj1lbC5hdHRyKCd6Jyk7XG4gICAgICB2YXIgdHI9J3JvdGF0ZTNkKDAuMSwwLjgsMCwnKyhwYXJhbGxheF9rKSsnZGVnKSBzY2FsZSgnKygxK2oqMC41KSsnKSB0cmFuc2xhdGVaKC0nKygxMCtqKjIwKSsncHgpJztcbiAgICAgIGVsLmNzcygndHJhbnNmb3JtJyx0cilcbiAgICB9XG4gICAgcGFyYWxsYXhfY291bnRlcis9cGFyYWxsYXhfZCowLjE7XG4gICAgaWYocGFyYWxsYXhfY291bnRlcj49MjApcGFyYWxsYXhfZD0tcGFyYWxsYXhfZDtcbiAgICBpZihwYXJhbGxheF9jb3VudGVyPD0wKXBhcmFsbGF4X2Q9LXBhcmFsbGF4X2Q7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfTtcbn0oKSk7XG4iLCIvL9C40LfQsdGA0LDQvdC90L7QtVxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgJChcIi5zaG9wcyAuZmF2b3JpdGUtbGlua1wiKS5vbignY2xpY2snLGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgc2VsZiA9ICQodGhpcyk7XG4gICAgdmFyIHR5cGUgPSBzZWxmLmF0dHIoXCJkYXRhLXN0YXRlXCIpLFxuICAgICAgYWZmaWxpYXRlX2lkID0gc2VsZi5hdHRyKFwiZGF0YS1hZmZpbGlhdGUtaWRcIik7XG4gICAgaWYgKHNlbGYuaGFzQ2xhc3MoJ2Rpc2FibGVkJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBzZWxmLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXG4gICAgLyppZih0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgIHNlbGYuZmluZChcIi5pdGVtX2ljb25cIikucmVtb3ZlQ2xhc3MoXCJtdXRlZFwiKTtcbiAgICB9Ki9cblxuICAgICQucG9zdChcIi9hY2NvdW50L2Zhdm9yaXRlc1wiLHtcbiAgICAgIFwidHlwZVwiIDogdHlwZSAsXG4gICAgICBcImFmZmlsaWF0ZV9pZFwiOiBhZmZpbGlhdGVfaWRcbiAgICB9LGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgaWYoZGF0YS5lcnJvcil7XG4gICAgICAgIHNlbGYuZmluZCgnc3ZnJykucmVtb3ZlQ2xhc3MoXCJzcGluXCIpO1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOmRhdGEuZXJyb3IsdHlwZTonZXJyJywndGl0bGUnOihkYXRhLnRpdGxlP2RhdGEudGl0bGU6ZmFsc2UpfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgIG1lc3NhZ2U6ZGF0YS5tc2csXG4gICAgICAgIHR5cGU6J3N1Y2Nlc3MnLFxuICAgICAgICAndGl0bGUnOihkYXRhLnRpdGxlP2RhdGEudGl0bGU6ZmFsc2UpXG4gICAgICB9KTtcblxuICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcIi5pdGVtX2ljb25cIikuYWRkQ2xhc3MoXCJzdmctbm8tZmlsbFwiKTtcbiAgICAgIH1cblxuICAgICAgc2VsZi5hdHRyKHtcbiAgICAgICAgXCJkYXRhLXN0YXRlXCI6IGRhdGFbXCJkYXRhLXN0YXRlXCJdLFxuICAgICAgICBcImRhdGEtb3JpZ2luYWwtdGl0bGVcIjogZGF0YVsnZGF0YS1vcmlnaW5hbC10aXRsZSddXG4gICAgICB9KTtcblxuICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW4gc3ZnLW5vLWZpbGxcIik7XG4gICAgICB9IGVsc2UgaWYodHlwZSA9PSBcImRlbGV0ZVwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5yZW1vdmVDbGFzcyhcInNwaW5cIikuYWRkQ2xhc3MoXCJzdmctbm8tZmlsbFwiKTtcbiAgICAgIH1cblxuICAgIH0sJ2pzb24nKS5pdGVtX2ljb25pbChmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOlwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgK1xuICAgICAgXCIg0L/RgNC+0LjQt9Cy0LXQtNGR0L3QvdC+0LUg0LTQtdC50YHRgtCy0LjQtSDQvdC10LLQvtC30LzQvtC20L3Qvi4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtS5cIiArXG4gICAgICBcIiDQn9GA0LjQvdC+0YHQuNC8INGB0LLQvtC4INC40LfQstC40L3QtdC90LjRjyDQt9CwINC90LXRg9C00L7QsdGB0YLQstC+LlwiLHR5cGU6J2Vycid9KTtcblxuICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcInN2Z1wiKS5hZGRDbGFzcyhcInN2Zy1uby1maWxsXCIpO1xuICAgICAgfVxuICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpblwiKTtcbiAgICB9KVxuICB9KTtcbn0pOyIsInZhciBoZWFkZXJBY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgICB2YXIgc2hhZG93ZWREb3duID0gZmFsc2U7XG5cbiAgICAkKCcubWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCgnLmhlYWRlcicpLnRvZ2dsZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG4gICAgICAgICQoJy5kcm9wLW1lbnUnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKSkge1xuICAgICAgICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICQoJy5zZWFyY2gtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgICAgICQoJyNhdXRvY29tcGxldGUnKS5mYWRlT3V0KCk7XG4gICAgICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpKSB7XG4gICAgICAgICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnI2hlYWRlcicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC5pZCA9PSAnaGVhZGVyJykge1xuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0tYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCdmb3JtJykuc3VibWl0KCk7XG4gICAgfSk7XG5cblxuXG4gICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lX2Nsb3NlJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgIH0pO1xuXG4gICAgJCgnLmhlYWRlci11cGxpbmUnKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICQoJy5oZWFkZXItc2Vjb25kbGluZScpLnJlbW92ZUNsYXNzKCdzY3JvbGwtZG93bicpO1xuICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgICB9KTtcblxuICAgICQod2luZG93KS5vbignbG9hZCByZXNpemUgc2Nyb2xsJyxmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNoYWRvd0hlaWdodCA9IDUwO1xuICAgICAgICB2YXIgaGlkZUhlaWdodCA9IDIwMDtcbiAgICAgICAgdmFyIGhlYWRlclNlY29uZExpbmUgPSAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKTtcbiAgICAgICAgdmFyIGhvdmVycyA9IGhlYWRlclNlY29uZExpbmUuZmluZCgnOmhvdmVyJyk7XG4gICAgICAgIHZhciBoZWFkZXIgPSAkKCcuaGVhZGVyJyk7XG5cbiAgICAgICAgaWYgKCFob3ZlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgICAgICAgICBoZWFkZXIucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcbiAgICAgICAgICAgIC8vZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuICAgICAgICAgICAgdmFyIHNjcm9sbFRvcD0kKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICBpZiAoc2Nyb2xsVG9wID4gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBzaGFkb3dlZERvd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3NoYWRvd2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2Nyb2xsVG9wIDw9IHNoYWRvd0hlaWdodCAmJiBzaGFkb3dlZERvd24gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBzaGFkb3dlZERvd24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzaGFkb3dlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNjcm9sbFRvcCA+IGhpZGVIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHNjcm9sbGVkRG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsLWRvd24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPD0gaGlkZUhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzY3JvbGwtZG93bicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xuICAgICAgICAgICAgaGVhZGVyLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgICQoJy5tZW51X2FuZ2xlLWRvd24sIC5kcm9wLW1lbnVfZ3JvdXBfX3VwLWhlYWRlcicpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIG1lbnVPcGVuID0gJCh0aGlzKS5jbG9zZXN0KCcuaGVhZGVyX29wZW4tbWVudSwgLmNhdGFsb2ctY2F0ZWdvcmllcycpO1xuICAgICAgICBpZiAoIW1lbnVPcGVuLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgcGFyZW50ID0gJCh0aGlzKS5jbG9zZXN0KCcuZHJvcC1tZW51X2dyb3VwX191cCwgLm1lbnUtZ3JvdXAnKTtcbiAgICAgICAgdmFyIHBhcmVudE1lbnUgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnUnKTtcbiAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcbiAgICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgJChwYXJlbnQpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICBpZiAocGFyZW50Lmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgICAgICAgICAkKHBhcmVudCkucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLmFkZENsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRNZW51KSB7XG4gICAgICAgICAgICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuY2hpbGRyZW4oJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcbiAgICAgICAgICAgICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cblxuICAgIHZhciBhY2NvdW50TWVudVRpbWVPdXQgPSBudWxsO1xuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIG1lbnUgPSAkKCcuYWNjb3VudC1tZW51Jyk7XG4gICAgICAgIGlmIChtZW51KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoYWNjb3VudE1lbnVUaW1lT3V0KTtcbiAgICAgICAgICAgIG1lbnUudG9nZ2xlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAgICAgaWYgKCFtZW51Lmhhc0NsYXNzKCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgICAgIGFjY291bnRNZW51VGltZU91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgICAgICAgICB9LCA3MDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cblxuICAgICQoJy5oZWFkZXItc2VhcmNoX2Zvcm0taW5wdXQnKS5vbignaW5wdXQnLCBmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgcXVlcnkgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgICB2YXIgYXV0b2NvbXBsZXRlID0gJCgnI2F1dG9jb21wbGV0ZScpLFxuICAgICAgICAgICAgYXV0b2NvbXBsZXRlTGlzdCA9ICQoYXV0b2NvbXBsZXRlKS5maW5kKCd1bCcpO1xuICAgICAgICBpZiAocXVlcnkubGVuZ3RoPjEpIHtcbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiAnL3NlYXJjaCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2dldCcsXG4gICAgICAgICAgICAgICAgZGF0YToge3F1ZXJ5OiBxdWVyeX0sXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaHRtbCA9ICc8YSBjbGFzcz1cImF1dG9jb21wbGV0ZV9saW5rXCIgaHJlZj1cIi9zdG9yZXMvJytpdGVtLmRhdGEucm91dGUrJ1wiJysnPicraXRlbS52YWx1ZStpdGVtLmNhc2hiYWNrKyc8L2E+JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGkuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuYXBwZW5kKGxpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVJbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZSkuZmFkZU91dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuaHRtbCgnJyk7XG4gICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSkub24oJ2ZvY3Vzb3V0JyxmdW5jdGlvbihlKXtcbiAgICAgICAgaWYgKCEkKGUucmVsYXRlZFRhcmdldCkuaGFzQ2xhc3MoJ2F1dG9jb21wbGV0ZV9saW5rJykpIHtcbiAgICAgICAgICAgICQoJyNhdXRvY29tcGxldGUnKS5oaWRlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuXG5cbn0oKTtcblxuXG5cblxuIiwiJChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBwYXJzZU51bShzdHIpe1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChcbiAgICAgICAgICAgIFN0cmluZyhzdHIpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoJywnLCcuJylcbiAgICAgICAgICAgICAgICAubWF0Y2goLy0/XFxkKyg/OlxcLlxcZCspPy9nLCAnJykgfHwgMFxuICAgICAgICAgICAgLCAxMFxuICAgICAgICApO1xuICAgIH1cblxuICAgICQoJy5zaG9ydC1jYWxjLWNhc2hiYWNrJykuZmluZCgnc2VsZWN0LGlucHV0Jykub24oJ2NoYW5nZSBrZXl1cCBjbGljaycsZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKS5jbG9zZXN0KCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpO1xuICAgICAgICB2YXIgY3Vycz1wYXJzZU51bSgkdGhpcy5maW5kKCdzZWxlY3QnKS52YWwoKSk7XG4gICAgICAgIHZhciB2YWw9JHRoaXMuZmluZCgnaW5wdXQnKS52YWwoKTtcbiAgICAgICAgaWYgKHBhcnNlTnVtKHZhbCkgIT0gdmFsKSB7XG4gICAgICAgICAgICB2YWw9JHRoaXMuZmluZCgnaW5wdXQnKS52YWwocGFyc2VOdW0odmFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsPXBhcnNlTnVtKHZhbCk7XG5cbiAgICAgICAgdmFyIGtvZWY9JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrJykudHJpbSgpO1xuICAgICAgICB2YXIgcHJvbW89JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLXByb21vJykudHJpbSgpO1xuICAgICAgICB2YXIgY3VycmVuY3k9JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLWN1cnJlbmN5JykudHJpbSgpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gMDtcbiAgICAgICAgdmFyIG91dCA9IDA7XG5cbiAgICAgICAgaWYgKGtvZWY9PXByb21vKSB7XG4gICAgICAgICAgICBwcm9tbz0wO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoa29lZi5pbmRleE9mKCclJyk+MCl7XG4gICAgICAgICAgICByZXN1bHQ9cGFyc2VOdW0oa29lZikqdmFsKmN1cnMvMTAwO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGN1cnM9cGFyc2VOdW0oJHRoaXMuZmluZCgnW2NvZGU9JytjdXJyZW5jeSsnXScpLnZhbCgpKTtcbiAgICAgICAgICAgIHJlc3VsdD1wYXJzZU51bShrb2VmKSpjdXJzXG4gICAgICAgIH1cblxuICAgICAgICBpZihwYXJzZU51bShwcm9tbyk+MCkge1xuICAgICAgICAgICAgaWYocHJvbW8uaW5kZXhPZignJScpPjApe1xuICAgICAgICAgICAgICAgIHByb21vPXBhcnNlTnVtKHByb21vKSp2YWwqY3Vycy8xMDA7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBwcm9tbz1wYXJzZU51bShwcm9tbykqY3Vyc1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihwcm9tbz4wKSB7XG4gICAgICAgICAgICAgICAgb3V0ID0gXCI8c3BhbiBjbGFzcz1vbGRfcHJpY2U+XCIgKyByZXN1bHQudG9GaXhlZCgyKSArIFwiPC9zcGFuPiBcIiArIHByb21vLnRvRml4ZWQoMilcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIG91dD1yZXN1bHQudG9GaXhlZCgyKVxuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG91dD1yZXN1bHQudG9GaXhlZCgyKVxuICAgICAgICB9XG5cblxuICAgICAgICAkdGhpcy5maW5kKCcuY2FsYy1yZXN1bHRfdmFsdWUnKS5odG1sKG91dClcbiAgICB9KS5jbGljaygpXG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICB2YXIgZWxzPSQoJy5hdXRvX2hpZGVfY29udHJvbCcpO1xuICBpZihlbHMubGVuZ3RoPT0wKXJldHVybjtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLFwiLnNjcm9sbF9ib3gtc2hvd19tb3JlXCIsZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBkYXRhPXtcbiAgICAgIGJ1dHRvblllczpmYWxzZSxcbiAgICAgIG5vdHlmeV9jbGFzczpcIm5vdGlmeV93aGl0ZSBub3RpZnlfbm90X2JpZ1wiXG4gICAgfTtcblxuICAgICR0aGlzPSQodGhpcyk7XG4gICAgdmFyIGNvbnRlbnQgPSAkdGhpcy5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtJykuY2xvbmUoKTtcbiAgICBjb250ZW50PWNvbnRlbnRbMF07XG4gICAgY29udGVudC5jbGFzc05hbWUgKz0gJyBzY3JvbGxfYm94LWl0ZW0tbW9kYWwnO1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuY2xhc3NOYW1lID0gJ2NvbW1lbnRzJztcbiAgICBkaXYuYXBwZW5kKGNvbnRlbnQpO1xuICAgICQoZGl2KS5maW5kKCcuc2Nyb2xsX2JveC1zaG93X21vcmUnKS5yZW1vdmUoKTtcbiAgICAkKGRpdikuZmluZCgnLm1heF90ZXh0X2hpZGUnKVxuICAgICAgLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLXgyJylcbiAgICAgIC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZScpO1xuICAgIGRhdGEucXVlc3Rpb249IGRpdi5vdXRlckhUTUw7XG5cbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG4gIH0pO1xuXG5cbiAgZnVuY3Rpb24gaGFzU2Nyb2xsKGVsKSB7XG4gICAgcmV0dXJuIGVsLnNjcm9sbEhlaWdodD5lbC5jbGllbnRIZWlnaHQ7XG4gIH1cblxuICBmdW5jdGlvbiByZWJ1aWxkKCl7XG4gICAgZm9yKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKyl7XG4gICAgICB2YXIgZWw9ZWxzLmVxKGkpO1xuICAgICAgdmFyIGlzX2hpZGU9ZmFsc2U7XG4gICAgICBpZihlbC5oZWlnaHQoKTwxMCl7XG4gICAgICAgIGlzX2hpZGU9dHJ1ZTtcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuc2hvdygwKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRleHQ9ZWwuZmluZCgnLnNjcm9sbF9ib3gtdGV4dCcpO1xuICAgICAgdmFyIGFuc3dlcj1lbC5maW5kKCcuc2Nyb2xsX2JveC1hbnN3ZXInKTtcbiAgICAgIHZhciBzaG93X21vcmU9ZWwuZmluZCgnLnNjcm9sbF9ib3gtc2hvd19tb3JlJyk7XG5cbiAgICAgIHZhciBzaG93X2J0bj1mYWxzZTtcbiAgICAgIGlmKGhhc1Njcm9sbCh0ZXh0WzBdKSl7XG4gICAgICAgIHNob3dfYnRuPXRydWU7XG4gICAgICAgIHRleHQucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRleHQuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgfVxuXG4gICAgICBpZihhbnN3ZXIubGVuZ3RoPjApe1xuICAgICAgICAvL9C10YHRgtGMINC+0YLQstC10YIg0LDQtNC80LjQvdCwXG4gICAgICAgIGlmKGhhc1Njcm9sbChhbnN3ZXJbMF0pKXtcbiAgICAgICAgICBzaG93X2J0bj10cnVlO1xuICAgICAgICAgIGFuc3dlci5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGFuc3dlci5hZGRDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoc2hvd19idG4pe1xuICAgICAgICBzaG93X21vcmUuc2hvdygpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHNob3dfbW9yZS5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGlzX2hpZGUpe1xuICAgICAgICBlbC5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtLWhpZGUnKS5oaWRlKDApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gICQod2luZG93KS5yZXNpemUocmVidWlsZCk7XG4gIHJlYnVpbGQoKTtcbn0pKCk7XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAkKCcuc2Nyb2xsX3RvJykuY2xpY2soIGZ1bmN0aW9uKGUpeyAvLyDQu9C+0LLQuNC8INC60LvQuNC6INC/0L4g0YHRgdGL0LvQutC1INGBINC60LvQsNGB0YHQvtC8IGdvX3RvXG4gICAgdmFyIHNjcm9sbF9lbCA9ICQodGhpcykuYXR0cignaHJlZicpOyAvLyDQstC+0LfRjNC80LXQvCDRgdC+0LTQtdGA0LbQuNC80L7QtSDQsNGC0YDQuNCx0YPRgtCwIGhyZWYsINC00L7Qu9C20LXQvSDQsdGL0YLRjCDRgdC10LvQtdC60YLQvtGA0L7QvCwg0YIu0LUuINC90LDQv9GA0LjQvNC10YAg0L3QsNGH0LjQvdCw0YLRjNGB0Y8g0YEgIyDQuNC70LggLlxuICAgIHNjcm9sbF9lbD0kKHNjcm9sbF9lbCk7XG4gICAgaWYgKHNjcm9sbF9lbC5sZW5ndGggIT0gMCkgeyAvLyDQv9GA0L7QstC10YDQuNC8INGB0YPRidC10YHRgtCy0L7QstCw0L3QuNC1INGN0LvQtdC80LXQvdGC0LAg0YfRgtC+0LHRiyDQuNC30LHQtdC20LDRgtGMINC+0YjQuNCx0LrQuFxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IHNjcm9sbF9lbC5vZmZzZXQoKS50b3AtJCgnI2hlYWRlcj4qJykuZXEoMCkuaGVpZ2h0KCktNTAgfSwgNTAwKTsgLy8g0LDQvdC40LzQuNGA0YPQtdC8INGB0LrRgNC+0L7Qu9C40L3QsyDQuiDRjdC70LXQvNC10L3RgtGDIHNjcm9sbF9lbFxuICAgICAgaWYoc2Nyb2xsX2VsLmhhc0NsYXNzKCdhY2NvcmRpb24nKSAmJiAhc2Nyb2xsX2VsLmhhc0NsYXNzKCdvcGVuJykpe1xuICAgICAgICBzY3JvbGxfZWwuZmluZCgnLmFjY29yZGlvbi1jb250cm9sJykuY2xpY2soKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlOyAvLyDQstGL0LrQu9GO0YfQsNC10Lwg0YHRgtCw0L3QtNCw0YDRgtC90L7QtSDQtNC10LnRgdGC0LLQuNC1XG4gIH0pO1xufSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5zaG93X2FsbCcsZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBjbHM9JCh0aGlzKS5kYXRhKCdjbnRybC1jbGFzcycpO1xuICAgICQoJy5oaWRlX2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcbiAgICAkKHRoaXMpLmhpZGUoKTtcbiAgICAkKCcuJytjbHMpLnNob3coKTtcbiAgfSk7XG5cbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5oaWRlX2FsbCcsZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBjbHM9JCh0aGlzKS5kYXRhKCdjbnRybC1jbGFzcycpO1xuICAgICQoJy5zaG93X2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcbiAgICAkKHRoaXMpLmhpZGUoKTtcbiAgICAkKCcuJytjbHMpLmhpZGUoKTtcbiAgfSk7XG59KSgpO1xuIiwiJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgJChcImFbaHJlZj0nI3Nob3dwcm9tb2NvZGUtbm9yZWdpc3RlciddXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICBjb25zb2xlLmxvZyhpZCk7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxuICAgICAgbm90eWZ5X2NsYXNzOiBcIm5vdGlmeV93aGl0ZSBub3RpZnlfbm90X2JpZ1wiLFxuICAgICAgcXVlc3Rpb246ICc8ZGl2IGNsYXNzPVwiY291cG9uLW5vcmVnaXN0ZXJcIj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiY291cG9uLW5vcmVnaXN0ZXJfX2ljb25cIj48aW1nIHNyYz1cIi9pbWFnZXMvdGVtcGxhdGVzL3N3YS5wbmdcIiBhbHQ9XCJcIj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiY291cG9uLW5vcmVnaXN0ZXJfX3RleHRcIj48Yj7QldGB0LvQuCDQstGLINGF0L7RgtC40YLQtSDQv9C+0LvRg9GH0LDRgtGMINC10YnQtSDQuCDQmtCt0KjQkdCt0JogKNCy0L7Qt9Cy0YDQsNGCINC00LXQvdC10LMpLCDQstCw0Lwg0L3QtdC+0LHRhdC+0LTQuNC80L4g0LfQsNGA0LXQs9C40YHRgtGA0LjRgNC+0LLQsNGC0YzRgdGPLiDQndC+INC80L7QttC10YLQtSDQuCDQv9GA0L7RgdGC0L4g0LLQvtGB0L/QvtC70YzQt9C+0LLQsNGC0YzRgdGPINC60YPQv9C+0L3QvtC8LCDQsdC10Lcg0LrRjdGI0LHRjdC60LAuPC9iPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJjb3Vwb24tbm9yZWdpc3Rlcl9fYnV0dG9uc1wiPicgK1xuICAgICAgJzxhIGhyZWY9XCJnb3RvL2NvdXBvbjonICsgaWQgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJidG4gIGJ0bi1wb3B1cDJcIj7QmNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0LrRg9C/0L7QvTwvYT4nICtcbiAgICAgICc8YSBocmVmPVwiI3JlZ2lzdHJhdGlvblwiIGNsYXNzPVwiYnRuIGJ0bi1wb3B1cDIgYnRuLXJldmVydFwiPtCX0LDRgNC10LPQuNGB0YLRgNC40YDQvtCy0LDRgtGM0YHRjzwvYT4nICtcbiAgICAgICc8L2Rpdj4nICtcbiAgICAgICc8ZGl2PidcbiAgICB9O1xuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKVxuICB9KTtcblxuICBmdW5jdGlvbiBkZWNsT2ZOdW0obnVtYmVyLCB0aXRsZXMpIHtcbiAgICBjYXNlcyA9IFsyLCAwLCAxLCAxLCAxLCAyXTtcbiAgICByZXR1cm4gdGl0bGVzWyAobnVtYmVyJTEwMD40ICYmIG51bWJlciUxMDA8MjApPyAyIDogY2FzZXNbKG51bWJlciUxMDw1KT9udW1iZXIlMTA6NV0gXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpcnN0WmVybyh2KXtcbiAgICB2PU1hdGguZmxvb3Iodik7XG4gICAgaWYodjwxMClcbiAgICAgIHJldHVybiAnMCcrdjtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gdjtcbiAgfVxuXG4gIHZhciBjbG9ja3M9JCgnLmNsb2NrJyk7XG4gIGlmKGNsb2Nrcy5sZW5ndGg+MCl7XG4gICAgZnVuY3Rpb24gdXBkYXRlQ2xvY2soKXtcbiAgICAgIHZhciBjbG9ja3M9JCh0aGlzKTtcbiAgICAgIHZhciBub3c9bmV3IERhdGUoKTtcbiAgICAgIGZvcih2YXIgaT0wO2k8Y2xvY2tzLmxlbmd0aDtpKyspe1xuICAgICAgICB2YXIgYz1jbG9ja3MuZXEoaSk7XG4gICAgICAgIHZhciBlbmQ9bmV3IERhdGUoYy5kYXRhKCdlbmQnKS5yZXBsYWNlKC8tL2csIFwiL1wiKSk7XG4gICAgICAgIHZhciBkPShlbmQuZ2V0VGltZSgpLW5vdy5nZXRUaW1lKCkpLyAxMDAwO1xuXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0L/RgNC+0YjQtdC7XG4gICAgICAgIGlmKGQ8PTApe1xuICAgICAgICAgIGMudGV4dCgn0KHRgNC+0Log0LTQtdC50YHRgtCy0LjRjyDQv9GA0L7QvNC+0LrQvtC00LAg0LjRgdGC0LXQuicpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/QtdGB0LvQuCDRgdGA0L7QuiDQsdC+0LvQtdC1IDMwINC00L3QtdC5XG4gICAgICAgIGlmKGQ+MzAqNjAqNjAqMjQpe1xuICAgICAgICAgIGMudGV4dCgn0J7RgdGC0LDQu9C+0YHRjCDQsdC+0LvQtdC1IDMwINC00L3QtdC5Jyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcz1kICUgNjA7XG4gICAgICAgIGQ9KGQtcykvNjA7XG4gICAgICAgIHZhciBtPWQgJSA2MDtcbiAgICAgICAgZD0oZC1tKS82MDtcbiAgICAgICAgdmFyIGg9ZCAlIDI0O1xuICAgICAgICBkPShkLWgpLzI0O1xuXG4gICAgICAgIHZhciBzdHI9Zmlyc3RaZXJvKGgpK1wiOlwiK2ZpcnN0WmVybyhtKStcIjpcIitmaXJzdFplcm8ocyk7XG4gICAgICAgIGlmKGQ+MCl7XG4gICAgICAgICAgc3RyPWQrXCIgXCIrZGVjbE9mTnVtKGQsIFsn0LTQtdC90YwnLCAn0LTQvdGPJywgJ9C00L3QtdC5J10pK1wiICBcIitzdHI7XG4gICAgICAgIH1cbiAgICAgICAgYy50ZXh0KFwi0J7RgdGC0LDQu9C+0YHRjDogXCIrc3RyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRJbnRlcnZhbCh1cGRhdGVDbG9jay5iaW5kKGNsb2NrcyksMTAwMCk7XG4gICAgdXBkYXRlQ2xvY2suYmluZChjbG9ja3MpKCk7XG4gIH1cbn0pOyJdfQ==
