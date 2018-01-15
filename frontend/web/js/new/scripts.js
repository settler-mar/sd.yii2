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
      var is_new=(el.is_viewed==1);
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
/***************** Initiate Flexslider ******************/
var slider = function(){
    $('.flexslider').flexslider({
        animation: "slide",
        slideshowSpeed: 10000,
        animationDuration: 400,
        pauseOnHover: true
    });
}();
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

    $('.tooltip').tipso({
        background : '#4A4A4A',
        size: 'small',
        delay: 100,
        speed: 100,
        onBeforeShow : function(ele, tipso) {
            this.content = ele.data('tooltip');
        }
    });

    $('[data-toggle=tooltip]').tipso({
        background : '#4A4A4A',
        size: 'small',
        delay: 100,
        speed: 100,
        onBeforeShow : function(ele, tipso) {
            this.content = ele.data('original-title');
        }
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

    $('.menu_angle-down').click(function(e) {
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
                }
            } else {
                $(parent).siblings('li').removeClass('close');
                if (parentMenu) {
                    $(parentMenu).siblings('ul').children('li').removeClass('close');
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
                                var html = '<a href="/stores/'+item.data.route+'"'+'>'+item.value+item.cashback+'</a>';
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
    }).on('focusout',function(){
        $('#autocomplete').hide();
    });



}();





//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsImpxdWVyeS5mbGV4c2xpZGVyLW1pbi5qcyIsInRpcHNvLm1pbi5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsIm1vZGFscy5qcyIsImZvb3Rlcl9tZW51LmpzIiwicmF0aW5nLmpzIiwiYWNjb3VudF9ub3RpZmljYXRpb24uanMiLCJzbGlkZXIuanMiLCJmYXZvcml0ZXMuanMiLCJzY3JpcHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJvYmplY3RzID0gZnVuY3Rpb24gKGEsYikge1xyXG4gICAgdmFyIGMgPSBiLFxyXG4gICAgICAgIGtleTtcclxuICAgIGZvciAoa2V5IGluIGEpIHtcclxuICAgICAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgIGNba2V5XSA9IGtleSBpbiBiID8gYltrZXldIDogYVtrZXldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBjO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gbG9naW5fcmVkaXJlY3QobmV3X2hyZWYpe1xyXG4gICAgaHJlZj1sb2NhdGlvbi5ocmVmO1xyXG4gICAgaWYoaHJlZi5pbmRleE9mKCdzdG9yZScpPjAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKT4wKXtcclxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgIH1lbHNle1xyXG4gICAgICAgIGxvY2F0aW9uLmhyZWY9bmV3X2hyZWY7XHJcbiAgICB9XHJcbn1cclxuIiwiKGZ1bmN0aW9uICh3LCBkLCAkKSB7XHJcbiAgICB2YXIgc2Nyb2xsc19ibG9jayA9ICQoJy5zY3JvbGxfYm94Jyk7XHJcblxyXG4gICAgaWYoc2Nyb2xsc19ibG9jay5sZW5ndGg9PTApIHJldHVybjtcclxuICAgIC8vJCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpLndyYXBBbGwoc2Nyb2xsc19ibG9jayk7XHJcbiAgICAkKHNjcm9sbHNfYmxvY2spLndyYXAoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKTtcclxuXHJcbiAgICBpbml0X3Njcm9sbCgpO1xyXG4gICAgY2FsY19zY3JvbGwoKTtcclxuXHJcbiAgICB2YXIgdDEsdDI7XHJcblxyXG4gICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHQxKTtcclxuICAgICAgICBjbGVhclRpbWVvdXQodDIpO1xyXG4gICAgICAgIHQxPXNldFRpbWVvdXQoY2FsY19zY3JvbGwsMzAwKTtcclxuICAgICAgICB0Mj1zZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLDgwMCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0X3Njcm9sbCgpIHtcclxuICAgICAgICB2YXIgY29udHJvbCA9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sXCI+PC9kaXY+JztcclxuICAgICAgICBjb250cm9sPSQoY29udHJvbCk7XHJcbiAgICAgICAgY29udHJvbC5pbnNlcnRBZnRlcihzY3JvbGxzX2Jsb2NrKTtcclxuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApO1xyXG5cclxuICAgICAgICBzY3JvbGxzX2Jsb2NrLnByZXBlbmQoJzxkaXYgY2xhc3M9c2Nyb2xsX2JveC1tb3Zlcj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgY29udHJvbC5vbignY2xpY2snLCcuc2Nyb2xsX2JveC1jb250cm9sX3BvaW50JyxmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBjb250cm9sID0gJHRoaXMucGFyZW50KCk7XHJcbiAgICAgICAgICAgIHZhciBpID0gJHRoaXMuaW5kZXgoKTtcclxuICAgICAgICAgICAgaWYoJHRoaXMuaGFzQ2xhc3MoJ2FjdGl2ZScpKXJldHVybjtcclxuICAgICAgICAgICAgY29udHJvbC5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgZHg9Y29udHJvbC5kYXRhKCdzbGlkZS1keCcpO1xyXG4gICAgICAgICAgICB2YXIgZWwgPSBjb250cm9sLnByZXYoKTtcclxuICAgICAgICAgICAgZWwuZmluZCgnLnNjcm9sbF9ib3gtbW92ZXInKS5jc3MoJ21hcmdpbi1sZWZ0JywtZHgqaSk7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgaSk7XHJcblxyXG4gICAgICAgICAgICBzdG9wU2Nyb2wuYmluZChlbCkoKTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGorKykge1xyXG4gICAgICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaik7XHJcbiAgICAgICAgZWwucGFyZW50KCkuaG92ZXIoc3RvcFNjcm9sLmJpbmQoZWwpLHN0YXJ0U2Nyb2wuYmluZChlbCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN0YXJ0U2Nyb2woKXtcclxuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKTtcclxuICAgICAgICBpZighJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XHJcblxyXG4gICAgICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUuYmluZCgkdGhpcyksIDIwMDApO1xyXG4gICAgICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsdGltZW91dElkKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN0b3BTY3JvbCgpe1xyXG4gICAgICAgIHZhciAkdGhpcz0kKHRoaXMpO1xyXG4gICAgICAgIHZhciB0aW1lb3V0SWQ9JHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJyk7XHJcbiAgICAgICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJyxmYWxzZSk7XHJcbiAgICAgICAgaWYoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikgfHwgIXRpbWVvdXRJZClyZXR1cm47XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcclxuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKTtcclxuICAgICAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLGZhbHNlKTtcclxuICAgICAgICBpZighJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBjb250cm9scz0kdGhpcy5uZXh0KCkuZmluZCgnPionKTtcclxuICAgICAgICB2YXIgYWN0aXZlPSR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xyXG4gICAgICAgIHZhciBwb2ludF9jbnQ9Y29udHJvbHMubGVuZ3RoO1xyXG4gICAgICAgIGlmKCFhY3RpdmUpYWN0aXZlPTA7XHJcbiAgICAgICAgYWN0aXZlKys7XHJcbiAgICAgICAgaWYoYWN0aXZlPj1wb2ludF9jbnQpYWN0aXZlPTA7XHJcbiAgICAgICAgJHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJywgYWN0aXZlKTtcclxuXHJcbiAgICAgICAgY29udHJvbHMuZXEoYWN0aXZlKS5jbGljaygpO1xyXG4gICAgICAgIHN0YXJ0U2Nyb2wuYmluZCgkdGhpcykoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjYWxjX3Njcm9sbCgpIHtcclxuICAgICAgICBmb3IoaT0wO2k8c2Nyb2xsc19ibG9jay5sZW5ndGg7aSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaSk7XHJcbiAgICAgICAgICAgIHZhciBjb250cm9sID0gZWwubmV4dCgpO1xyXG4gICAgICAgICAgICB2YXIgd2lkdGhfbWF4ID0gZWwuZGF0YSgnc2Nyb2xsLXdpZHRoLW1heCcpO1xyXG4gICAgICAgICAgICB3ID0gZWwud2lkdGgoKTtcclxuXHJcbiAgICAgICAgICAgIC8v0LTQtdC70LDQtdC8INC60L7QvdGC0YDQvtC70Ywg0L7Qs9GA0LDQvdC40YfQtdC90LjRjyDRiNC40YDQuNC90YsuINCV0YHQu9C4INC/0YDQtdCy0YvRiNC10L3QviDRgtC+INC+0YLQutC70Y7Rh9Cw0LXQvCDRgdC60YDQvtC7INC4INC/0LXRgNC10YXQvtC00LjQvCDQuiDRgdC70LXQtNGD0Y7RidC10LzRgyDRjdC70LXQvNC10L3RgtGDXHJcbiAgICAgICAgICAgIGlmICh3aWR0aF9tYXggJiYgdyA+IHdpZHRoX21heCkge1xyXG4gICAgICAgICAgICAgICAgY29udHJvbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgbm9fY2xhc3MgPSBlbC5kYXRhKCdzY3JvbGwtZWxlbWV0LWlnbm9yZS1jbGFzcycpO1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBlbC5maW5kKCc+KicpLm5vdCgnLnNjcm9sbF9ib3gtbW92ZXInKTtcclxuICAgICAgICAgICAgaWYgKG5vX2NsYXNzKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGNoaWxkcmVuLm5vdCgnLicgKyBub19jbGFzcylcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy/QldGB0LvQuCDQvdC10YIg0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbiA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgZl9lbD1jaGlsZHJlbi5lcSgxKTtcclxuICAgICAgICAgICAgdmFyIGNoaWxkcmVuX3cgPSBmX2VsLm91dGVyV2lkdGgoKTsgLy/QstGB0LXQs9C+INC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxyXG4gICAgICAgICAgICBjaGlsZHJlbl93Kz1wYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tbGVmdCcpKTtcclxuICAgICAgICAgICAgY2hpbGRyZW5fdys9cGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLXJpZ2h0JykpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNjcmVhbl9jb3VudCA9IE1hdGguZmxvb3IodyAvIGNoaWxkcmVuX3cpO1xyXG5cclxuICAgICAgICAgICAgLy/QldGB0LvQuCDQstGB0LUg0LLQu9Cw0LfQuNGCINC90LAg0Y3QutGA0LDQvVxyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4gPD0gc2NyZWFuX2NvdW50KSB7XHJcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL9Cj0LbQtSDRgtC+0YfQvdC+INC30L3QsNC10Lwg0YfRgtC+INGB0LrRgNC+0Lsg0L3Rg9C20LXQvVxyXG4gICAgICAgICAgICBlbC5hZGRDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHBvaW50X2NudCA9IGNoaWxkcmVuLmxlbmd0aCAtIHNjcmVhbl9jb3VudCArIDE7XHJcbiAgICAgICAgICAgIC8v0LXRgdC70Lgg0L3QtSDQvdCw0LTQviDQvtCx0L3QvtCy0LvRj9GC0Ywg0LrQvtC90YLRgNC+0Lsg0YLQviDQstGL0YXQvtC00LjQvCwg0L3QtSDQt9Cw0LHRi9Cy0LDRjyDQvtCx0L3QvtCy0LjRgtGMINGI0LjRgNC40L3RgyDQtNC+0YfQtdGA0L3QuNGFXHJcbiAgICAgICAgICAgIGlmIChjb250cm9sLmZpbmQoJz4qJykubGVuZ3RoID09IHBvaW50X2NudCkge1xyXG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGFjdGl2ZSA9IGVsLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAoIWFjdGl2ZSlhY3RpdmUgPSAwO1xyXG4gICAgICAgICAgICBpZiAoYWN0aXZlID49IHBvaW50X2NudClhY3RpdmUgPSBwb2ludF9jbnQgLSAxO1xyXG4gICAgICAgICAgICB2YXIgb3V0ID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcG9pbnRfY250OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcrKGo9PWFjdGl2ZT8nIGFjdGl2ZSc6JycpKydcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRyb2wuaHRtbChvdXQpO1xyXG5cclxuICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xyXG4gICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWNvdW50JywgcG9pbnRfY250KTtcclxuICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xyXG5cclxuICAgICAgICAgICAgaWYoIWVsLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpKXtcclxuICAgICAgICAgICAgICAgIHN0YXJ0U2Nyb2wuYmluZChlbCkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSh3aW5kb3csIGRvY3VtZW50LCBqUXVlcnkpKTsiLCJ2YXIgYWNjb3JkaW9uQ29udHJvbCA9ICQoJy5hY2NvcmRpb24gLmFjY29yZGlvbi1jb250cm9sJyk7XHJcblxyXG5hY2NvcmRpb25Db250cm9sLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAkYWNjb3JkaW9uID0gJHRoaXMuY2xvc2VzdCgnLmFjY29yZGlvbicpO1xyXG5cclxuICAgIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgICAgICAvKmlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1zbGltJykpe1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSovXHJcbiAgICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5oaWRlKDMwMCk7XHJcbiAgICAgICAgJGFjY29yZGlvbi5yZW1vdmVDbGFzcygnb3BlbicpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1zbGltJykpe1xyXG4gICAgICAgICAgICAkb3RoZXI9JGFjY29yZGlvbi5wYXJlbnQoKS5maW5kKCcuYWNjb3JkaW9uLXNsaW0nKTtcclxuICAgICAgICAgICAgJG90aGVyLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXHJcbiAgICAgICAgICAgICAgICAuaGlkZSgzMDApXHJcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xyXG4gICAgICAgICAgICAkb3RoZXIucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgICAgICAgJG90aGVyLnJlbW92ZUNsYXNzKCdsYXN0LW9wZW4nKTtcclxuXHJcbiAgICAgICAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xyXG4gICAgICAgICAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdsYXN0LW9wZW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zaG93KDMwMCk7XHJcbiAgICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59KTtcclxuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XHJcblxyXG4vL9C00LvRjyBjYnZqZCBqbnJoc2RmdHYgMS3QuVxyXG5hY2NvcmRpb25TbGltPSQoJy5hY2NvcmRpb24uYWNjb3JkaW9uLXNsaW0nKTtcclxuaWYoYWNjb3JkaW9uU2xpbS5sZW5ndGg+MCl7XHJcbiAgICBhY2NvcmRpb25TbGltLnBhcmVudCgpLmZpbmQoJy5hY2NvcmRpb24tc2xpbTpmaXJzdC1jaGlsZCcpXHJcbiAgICAgICAgLmFkZENsYXNzKCdvcGVuJylcclxuICAgICAgICAuYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpXHJcbiAgICAgICAgLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXHJcbiAgICAgICAgICAgIC5zaG93KDMwMClcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcclxufVxyXG4iLCJmdW5jdGlvbiBhamF4Rm9ybShlbHMpIHtcclxuICB2YXIgZmlsZUFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiA/IHRydWUgOiBmYWxzZTtcclxuICB2YXIgZGVmYXVsdHMgPSB7XHJcbiAgICBlcnJvcl9jbGFzczogJy5oYXMtZXJyb3InLFxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIG9uUG9zdChwb3N0KXtcclxuICAgIHZhciBkYXRhPXRoaXM7XHJcbiAgICBmb3JtPWRhdGEuZm9ybTtcclxuICAgIHdyYXA9ZGF0YS53cmFwO1xyXG4gICAgaWYocG9zdC5yZW5kZXIpe1xyXG4gICAgICBwb3N0Lm5vdHlmeV9jbGFzcz1cIm5vdGlmeV93aGl0ZVwiO1xyXG4gICAgICBub3RpZmljYXRpb24uYWxlcnQocG9zdCk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICB3cmFwLmh0bWwocG9zdC5odG1sKTtcclxuICAgICAgYWpheEZvcm0od3JhcCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvbkZhaWwoKXtcclxuICAgIHZhciBkYXRhPXRoaXM7XHJcbiAgICBmb3JtPWRhdGEuZm9ybTtcclxuICAgIHdyYXA9ZGF0YS53cmFwO1xyXG4gICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgd3JhcC5odG1sKCc8aDM+0KPQv9GBLi4uINCS0L7Qt9C90LjQutC70LAg0L3QtdC/0YDQtdC00LLQuNC00LXQvdC90LDRjyDQvtGI0LjQsdC60LA8aDM+JyArXHJcbiAgICAgICc8cD7Qp9Cw0YHRgtC+INGN0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDQsiDRgdC70YPRh9Cw0LUsINC10YHQu9C4INCy0Ysg0L3QtdGB0LrQvtC70YzQutC+INGA0LDQtyDQv9C+0LTRgNGP0LQg0L3QtdCy0LXRgNC90L4g0LLQstC10LvQuCDRgdCy0L7QuCDRg9GH0LXRgtC90YvQtSDQtNCw0L3QvdGL0LUuINCd0L4g0LLQvtC30LzQvtC20L3RiyDQuCDQtNGA0YPQs9C40LUg0L/RgNC40YfQuNC90YsuINCSINC70Y7QsdC+0Lwg0YHQu9GD0YfQsNC1INC90LUg0YDQsNGB0YHRgtGA0LDQuNCy0LDQudGC0LXRgdGMINC4INC/0YDQvtGB0YLQviDQvtCx0YDQsNGC0LjRgtC10YHRjCDQuiDQvdCw0YjQtdC80YMg0L7Qv9C10YDQsNGC0L7RgNGDINGB0LvRg9C20LHRiyDQv9C+0LTQtNC10YDQttC60LguPC9wPjxicj4nICtcclxuICAgICAgJzxwPtCh0L/QsNGB0LjQsdC+LjwvcD4nKTtcclxuICAgIGFqYXhGb3JtKHdyYXApO1xyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uU3VibWl0KGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGRhdGE9dGhpcztcclxuICAgIGZvcm09ZGF0YS5mb3JtO1xyXG4gICAgd3JhcD1kYXRhLndyYXA7XHJcblxyXG4gICAgaWYoZm9ybS55aWlBY3RpdmVGb3JtKXtcclxuICAgICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScpO1xyXG4gICAgfTtcclxuXHJcbiAgICBpc1ZhbGlkPShmb3JtLmZpbmQoZGF0YS5wYXJhbS5lcnJvcl9jbGFzcykubGVuZ3RoPT0wKTtcclxuXHJcbiAgICBpZighaXNWYWxpZCl7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1lbHNle1xyXG4gICAgICByZXF1aXJlZD1mb3JtLmZpbmQoJ2lucHV0LnJlcXVpcmVkJyk7XHJcbiAgICAgIGZvcihpPTA7aTxyZXF1aXJlZC5sZW5ndGg7aSsrKXtcclxuICAgICAgICBpZihyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGg8MSl7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZighZm9ybS5zZXJpYWxpemVPYmplY3QpYWRkU1JPKCk7XHJcblxyXG4gICAgdmFyIHBvc3Q9Zm9ybS5zZXJpYWxpemVPYmplY3QoKTtcclxuICAgIGZvcm0uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIGZvcm0uaHRtbCgnJyk7XHJcbiAgICB3cmFwLmh0bWwoJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48cD7QntGC0L/RgNCw0LLQutCwINC00LDQvdC90YvRhTwvcD48L2Rpdj4nKTtcclxuXHJcbiAgICBkYXRhLnVybCs9KGRhdGEudXJsLmluZGV4T2YoJz8nKT4wPycmJzonPycpKydyYz0nK01hdGgucmFuZG9tKCk7XHJcblxyXG4gICAgJC5wb3N0KFxyXG4gICAgICBkYXRhLnVybCxcclxuICAgICAgcG9zdCxcclxuICAgICAgb25Qb3N0LmJpbmQoZGF0YSksXHJcbiAgICAgICdqc29uJ1xyXG4gICAgKS5mYWlsKG9uRmFpbC5iaW5kKGRhdGEpKTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBlbHMuZmluZCgnW3JlcXVpcmVkXScpXHJcbiAgICAuYWRkQ2xhc3MoJ3JlcXVpcmVkJylcclxuICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpO1xyXG5cclxuICBmb3IodmFyIGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcclxuICAgIHdyYXA9ZWxzLmVxKGkpO1xyXG4gICAgZm9ybT13cmFwLmZpbmQoJ2Zvcm0nKTtcclxuICAgIGRhdGE9e1xyXG4gICAgICBmb3JtOmZvcm0sXHJcbiAgICAgIHBhcmFtOmRlZmF1bHRzLFxyXG4gICAgICB3cmFwOndyYXBcclxuICAgIH07XHJcbiAgICBkYXRhLnVybD1mb3JtLmF0dHIoJ2FjdGlvbicpIHx8IGxvY2F0aW9uLmhyZWY7XHJcbiAgICBkYXRhLm1ldGhvZD0gZm9ybS5hdHRyKCdtZXRob2QnKSB8fCAncG9zdCc7XHJcbiAgICBmb3JtLm9mZignc3VibWl0Jyk7XHJcbiAgICBmb3JtLm9uKCdzdWJtaXQnLCBvblN1Ym1pdC5iaW5kKGRhdGEpKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFNSTygpe1xyXG4gICQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG8gPSB7fTtcclxuICAgIHZhciBhID0gdGhpcy5zZXJpYWxpemVBcnJheSgpO1xyXG4gICAgJC5lYWNoKGEsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xyXG4gICAgICAgIGlmICghb1t0aGlzLm5hbWVdLnB1c2gpIHtcclxuICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvW3RoaXMubmFtZV0ucHVzaCh0aGlzLnZhbHVlIHx8ICcnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBvO1xyXG4gIH07XHJcbn07XHJcbmFkZFNSTygpOyIsIi8qXG4gKiBqUXVlcnkgRmxleFNsaWRlciB2Mi42LjRcbiAqIENvcHlyaWdodCAyMDEyIFdvb1RoZW1lc1xuICogQ29udHJpYnV0aW5nIEF1dGhvcjogVHlsZXIgU21pdGhcbiAqLyFmdW5jdGlvbigkKXt2YXIgZT0hMDskLmZsZXhzbGlkZXI9ZnVuY3Rpb24odCxhKXt2YXIgbj0kKHQpO24udmFycz0kLmV4dGVuZCh7fSwkLmZsZXhzbGlkZXIuZGVmYXVsdHMsYSk7dmFyIGk9bi52YXJzLm5hbWVzcGFjZSxyPXdpbmRvdy5uYXZpZ2F0b3ImJndpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCYmd2luZG93Lk1TR2VzdHVyZSxzPShcIm9udG91Y2hzdGFydFwiaW4gd2luZG93fHxyfHx3aW5kb3cuRG9jdW1lbnRUb3VjaCYmZG9jdW1lbnQgaW5zdGFuY2VvZiBEb2N1bWVudFRvdWNoKSYmbi52YXJzLnRvdWNoLG89XCJjbGljayB0b3VjaGVuZCBNU1BvaW50ZXJVcCBrZXl1cFwiLGw9XCJcIixjLGQ9XCJ2ZXJ0aWNhbFwiPT09bi52YXJzLmRpcmVjdGlvbix1PW4udmFycy5yZXZlcnNlLHY9bi52YXJzLml0ZW1XaWR0aD4wLHA9XCJmYWRlXCI9PT1uLnZhcnMuYW5pbWF0aW9uLG09XCJcIiE9PW4udmFycy5hc05hdkZvcixmPXt9OyQuZGF0YSh0LFwiZmxleHNsaWRlclwiLG4pLGY9e2luaXQ6ZnVuY3Rpb24oKXtuLmFuaW1hdGluZz0hMSxuLmN1cnJlbnRTbGlkZT1wYXJzZUludChuLnZhcnMuc3RhcnRBdD9uLnZhcnMuc3RhcnRBdDowLDEwKSxpc05hTihuLmN1cnJlbnRTbGlkZSkmJihuLmN1cnJlbnRTbGlkZT0wKSxuLmFuaW1hdGluZ1RvPW4uY3VycmVudFNsaWRlLG4uYXRFbmQ9MD09PW4uY3VycmVudFNsaWRlfHxuLmN1cnJlbnRTbGlkZT09PW4ubGFzdCxuLmNvbnRhaW5lclNlbGVjdG9yPW4udmFycy5zZWxlY3Rvci5zdWJzdHIoMCxuLnZhcnMuc2VsZWN0b3Iuc2VhcmNoKFwiIFwiKSksbi5zbGlkZXM9JChuLnZhcnMuc2VsZWN0b3Isbiksbi5jb250YWluZXI9JChuLmNvbnRhaW5lclNlbGVjdG9yLG4pLG4uY291bnQ9bi5zbGlkZXMubGVuZ3RoLG4uc3luY0V4aXN0cz0kKG4udmFycy5zeW5jKS5sZW5ndGg+MCxcInNsaWRlXCI9PT1uLnZhcnMuYW5pbWF0aW9uJiYobi52YXJzLmFuaW1hdGlvbj1cInN3aW5nXCIpLG4ucHJvcD1kP1widG9wXCI6XCJtYXJnaW5MZWZ0XCIsbi5hcmdzPXt9LG4ubWFudWFsUGF1c2U9ITEsbi5zdG9wcGVkPSExLG4uc3RhcnRlZD0hMSxuLnN0YXJ0VGltZW91dD1udWxsLG4udHJhbnNpdGlvbnM9IW4udmFycy52aWRlbyYmIXAmJm4udmFycy51c2VDU1MmJmZ1bmN0aW9uKCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0PVtcInBlcnNwZWN0aXZlUHJvcGVydHlcIixcIldlYmtpdFBlcnNwZWN0aXZlXCIsXCJNb3pQZXJzcGVjdGl2ZVwiLFwiT1BlcnNwZWN0aXZlXCIsXCJtc1BlcnNwZWN0aXZlXCJdO2Zvcih2YXIgYSBpbiB0KWlmKHZvaWQgMCE9PWUuc3R5bGVbdFthXV0pcmV0dXJuIG4ucGZ4PXRbYV0ucmVwbGFjZShcIlBlcnNwZWN0aXZlXCIsXCJcIikudG9Mb3dlckNhc2UoKSxuLnByb3A9XCItXCIrbi5wZngrXCItdHJhbnNmb3JtXCIsITA7cmV0dXJuITF9KCksbi5lbnN1cmVBbmltYXRpb25FbmQ9XCJcIixcIlwiIT09bi52YXJzLmNvbnRyb2xzQ29udGFpbmVyJiYobi5jb250cm9sc0NvbnRhaW5lcj0kKG4udmFycy5jb250cm9sc0NvbnRhaW5lcikubGVuZ3RoPjAmJiQobi52YXJzLmNvbnRyb2xzQ29udGFpbmVyKSksXCJcIiE9PW4udmFycy5tYW51YWxDb250cm9scyYmKG4ubWFudWFsQ29udHJvbHM9JChuLnZhcnMubWFudWFsQ29udHJvbHMpLmxlbmd0aD4wJiYkKG4udmFycy5tYW51YWxDb250cm9scykpLFwiXCIhPT1uLnZhcnMuY3VzdG9tRGlyZWN0aW9uTmF2JiYobi5jdXN0b21EaXJlY3Rpb25OYXY9Mj09PSQobi52YXJzLmN1c3RvbURpcmVjdGlvbk5hdikubGVuZ3RoJiYkKG4udmFycy5jdXN0b21EaXJlY3Rpb25OYXYpKSxuLnZhcnMucmFuZG9taXplJiYobi5zbGlkZXMuc29ydChmdW5jdGlvbigpe3JldHVybiBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpLS41fSksbi5jb250YWluZXIuZW1wdHkoKS5hcHBlbmQobi5zbGlkZXMpKSxuLmRvTWF0aCgpLG4uc2V0dXAoXCJpbml0XCIpLG4udmFycy5jb250cm9sTmF2JiZmLmNvbnRyb2xOYXYuc2V0dXAoKSxuLnZhcnMuZGlyZWN0aW9uTmF2JiZmLmRpcmVjdGlvbk5hdi5zZXR1cCgpLG4udmFycy5rZXlib2FyZCYmKDE9PT0kKG4uY29udGFpbmVyU2VsZWN0b3IpLmxlbmd0aHx8bi52YXJzLm11bHRpcGxlS2V5Ym9hcmQpJiYkKGRvY3VtZW50KS5iaW5kKFwia2V5dXBcIixmdW5jdGlvbihlKXt2YXIgdD1lLmtleUNvZGU7aWYoIW4uYW5pbWF0aW5nJiYoMzk9PT10fHwzNz09PXQpKXt2YXIgYT0zOT09PXQ/bi5nZXRUYXJnZXQoXCJuZXh0XCIpOjM3PT09dCYmbi5nZXRUYXJnZXQoXCJwcmV2XCIpO24uZmxleEFuaW1hdGUoYSxuLnZhcnMucGF1c2VPbkFjdGlvbil9fSksbi52YXJzLm1vdXNld2hlZWwmJm4uYmluZChcIm1vdXNld2hlZWxcIixmdW5jdGlvbihlLHQsYSxpKXtlLnByZXZlbnREZWZhdWx0KCk7dmFyIHI9dDwwP24uZ2V0VGFyZ2V0KFwibmV4dFwiKTpuLmdldFRhcmdldChcInByZXZcIik7bi5mbGV4QW5pbWF0ZShyLG4udmFycy5wYXVzZU9uQWN0aW9uKX0pLG4udmFycy5wYXVzZVBsYXkmJmYucGF1c2VQbGF5LnNldHVwKCksbi52YXJzLnNsaWRlc2hvdyYmbi52YXJzLnBhdXNlSW52aXNpYmxlJiZmLnBhdXNlSW52aXNpYmxlLmluaXQoKSxuLnZhcnMuc2xpZGVzaG93JiYobi52YXJzLnBhdXNlT25Ib3ZlciYmbi5ob3ZlcihmdW5jdGlvbigpe24ubWFudWFsUGxheXx8bi5tYW51YWxQYXVzZXx8bi5wYXVzZSgpfSxmdW5jdGlvbigpe24ubWFudWFsUGF1c2V8fG4ubWFudWFsUGxheXx8bi5zdG9wcGVkfHxuLnBsYXkoKX0pLG4udmFycy5wYXVzZUludmlzaWJsZSYmZi5wYXVzZUludmlzaWJsZS5pc0hpZGRlbigpfHwobi52YXJzLmluaXREZWxheT4wP24uc3RhcnRUaW1lb3V0PXNldFRpbWVvdXQobi5wbGF5LG4udmFycy5pbml0RGVsYXkpOm4ucGxheSgpKSksbSYmZi5hc05hdi5zZXR1cCgpLHMmJm4udmFycy50b3VjaCYmZi50b3VjaCgpLCghcHx8cCYmbi52YXJzLnNtb290aEhlaWdodCkmJiQod2luZG93KS5iaW5kKFwicmVzaXplIG9yaWVudGF0aW9uY2hhbmdlIGZvY3VzXCIsZi5yZXNpemUoKSksbi5maW5kKFwiaW1nXCIpLmF0dHIoXCJkcmFnZ2FibGVcIixcImZhbHNlXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLnZhcnMuc3RhcnQobil9LDIwMCl9LGFzTmF2OntzZXR1cDpmdW5jdGlvbigpe24uYXNOYXY9ITAsbi5hbmltYXRpbmdUbz1NYXRoLmZsb29yKG4uY3VycmVudFNsaWRlL24ubW92ZSksbi5jdXJyZW50SXRlbT1uLmN1cnJlbnRTbGlkZSxuLnNsaWRlcy5yZW1vdmVDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLmVxKG4uY3VycmVudEl0ZW0pLmFkZENsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIikscj8odC5fc2xpZGVyPW4sbi5zbGlkZXMuZWFjaChmdW5jdGlvbigpe3ZhciBlPXRoaXM7ZS5fZ2VzdHVyZT1uZXcgTVNHZXN0dXJlLGUuX2dlc3R1cmUudGFyZ2V0PWUsZS5hZGRFdmVudExpc3RlbmVyKFwiTVNQb2ludGVyRG93blwiLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKSxlLmN1cnJlbnRUYXJnZXQuX2dlc3R1cmUmJmUuY3VycmVudFRhcmdldC5fZ2VzdHVyZS5hZGRQb2ludGVyKGUucG9pbnRlcklkKX0sITEpLGUuYWRkRXZlbnRMaXN0ZW5lcihcIk1TR2VzdHVyZVRhcFwiLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt2YXIgdD0kKHRoaXMpLGE9dC5pbmRleCgpOyQobi52YXJzLmFzTmF2Rm9yKS5kYXRhKFwiZmxleHNsaWRlclwiKS5hbmltYXRpbmd8fHQuaGFzQ2xhc3MoXCJhY3RpdmVcIil8fChuLmRpcmVjdGlvbj1uLmN1cnJlbnRJdGVtPGE/XCJuZXh0XCI6XCJwcmV2XCIsbi5mbGV4QW5pbWF0ZShhLG4udmFycy5wYXVzZU9uQWN0aW9uLCExLCEwLCEwKSl9KX0pKTpuLnNsaWRlcy5vbihvLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt2YXIgdD0kKHRoaXMpLGE9dC5pbmRleCgpO3Qub2Zmc2V0KCkubGVmdC0kKG4pLnNjcm9sbExlZnQoKTw9MCYmdC5oYXNDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpP24uZmxleEFuaW1hdGUobi5nZXRUYXJnZXQoXCJwcmV2XCIpLCEwKTokKG4udmFycy5hc05hdkZvcikuZGF0YShcImZsZXhzbGlkZXJcIikuYW5pbWF0aW5nfHx0Lmhhc0NsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIil8fChuLmRpcmVjdGlvbj1uLmN1cnJlbnRJdGVtPGE/XCJuZXh0XCI6XCJwcmV2XCIsbi5mbGV4QW5pbWF0ZShhLG4udmFycy5wYXVzZU9uQWN0aW9uLCExLCEwLCEwKSl9KX19LGNvbnRyb2xOYXY6e3NldHVwOmZ1bmN0aW9uKCl7bi5tYW51YWxDb250cm9scz9mLmNvbnRyb2xOYXYuc2V0dXBNYW51YWwoKTpmLmNvbnRyb2xOYXYuc2V0dXBQYWdpbmcoKX0sc2V0dXBQYWdpbmc6ZnVuY3Rpb24oKXt2YXIgZT1cInRodW1ibmFpbHNcIj09PW4udmFycy5jb250cm9sTmF2P1wiY29udHJvbC10aHVtYnNcIjpcImNvbnRyb2wtcGFnaW5nXCIsdD0xLGEscjtpZihuLmNvbnRyb2xOYXZTY2FmZm9sZD0kKCc8b2wgY2xhc3M9XCInK2krXCJjb250cm9sLW5hdiBcIitpK2UrJ1wiPjwvb2w+Jyksbi5wYWdpbmdDb3VudD4xKWZvcih2YXIgcz0wO3M8bi5wYWdpbmdDb3VudDtzKyspe3I9bi5zbGlkZXMuZXEocyksdm9pZCAwPT09ci5hdHRyKFwiZGF0YS10aHVtYi1hbHRcIikmJnIuYXR0cihcImRhdGEtdGh1bWItYWx0XCIsXCJcIik7dmFyIGM9XCJcIiE9PXIuYXR0cihcImRhdGEtdGh1bWItYWx0XCIpP2M9JyBhbHQ9XCInK3IuYXR0cihcImRhdGEtdGh1bWItYWx0XCIpKydcIic6XCJcIjtpZihhPVwidGh1bWJuYWlsc1wiPT09bi52YXJzLmNvbnRyb2xOYXY/JzxpbWcgc3JjPVwiJytyLmF0dHIoXCJkYXRhLXRodW1iXCIpKydcIicrYytcIi8+XCI6JzxhIGhyZWY9XCIjXCI+Jyt0K1wiPC9hPlwiLFwidGh1bWJuYWlsc1wiPT09bi52YXJzLmNvbnRyb2xOYXYmJiEwPT09bi52YXJzLnRodW1iQ2FwdGlvbnMpe3ZhciBkPXIuYXR0cihcImRhdGEtdGh1bWJjYXB0aW9uXCIpO1wiXCIhPT1kJiZ2b2lkIDAhPT1kJiYoYSs9JzxzcGFuIGNsYXNzPVwiJytpKydjYXB0aW9uXCI+JytkK1wiPC9zcGFuPlwiKX1uLmNvbnRyb2xOYXZTY2FmZm9sZC5hcHBlbmQoXCI8bGk+XCIrYStcIjwvbGk+XCIpLHQrK31uLmNvbnRyb2xzQ29udGFpbmVyPyQobi5jb250cm9sc0NvbnRhaW5lcikuYXBwZW5kKG4uY29udHJvbE5hdlNjYWZmb2xkKTpuLmFwcGVuZChuLmNvbnRyb2xOYXZTY2FmZm9sZCksZi5jb250cm9sTmF2LnNldCgpLGYuY29udHJvbE5hdi5hY3RpdmUoKSxuLmNvbnRyb2xOYXZTY2FmZm9sZC5kZWxlZ2F0ZShcImEsIGltZ1wiLG8sZnVuY3Rpb24oZSl7aWYoZS5wcmV2ZW50RGVmYXVsdCgpLFwiXCI9PT1sfHxsPT09ZS50eXBlKXt2YXIgdD0kKHRoaXMpLGE9bi5jb250cm9sTmF2LmluZGV4KHQpO3QuaGFzQ2xhc3MoaStcImFjdGl2ZVwiKXx8KG4uZGlyZWN0aW9uPWE+bi5jdXJyZW50U2xpZGU/XCJuZXh0XCI6XCJwcmV2XCIsbi5mbGV4QW5pbWF0ZShhLG4udmFycy5wYXVzZU9uQWN0aW9uKSl9XCJcIj09PWwmJihsPWUudHlwZSksZi5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sc2V0dXBNYW51YWw6ZnVuY3Rpb24oKXtuLmNvbnRyb2xOYXY9bi5tYW51YWxDb250cm9scyxmLmNvbnRyb2xOYXYuYWN0aXZlKCksbi5jb250cm9sTmF2LmJpbmQobyxmdW5jdGlvbihlKXtpZihlLnByZXZlbnREZWZhdWx0KCksXCJcIj09PWx8fGw9PT1lLnR5cGUpe3ZhciB0PSQodGhpcyksYT1uLmNvbnRyb2xOYXYuaW5kZXgodCk7dC5oYXNDbGFzcyhpK1wiYWN0aXZlXCIpfHwoYT5uLmN1cnJlbnRTbGlkZT9uLmRpcmVjdGlvbj1cIm5leHRcIjpuLmRpcmVjdGlvbj1cInByZXZcIixuLmZsZXhBbmltYXRlKGEsbi52YXJzLnBhdXNlT25BY3Rpb24pKX1cIlwiPT09bCYmKGw9ZS50eXBlKSxmLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSxzZXQ6ZnVuY3Rpb24oKXt2YXIgZT1cInRodW1ibmFpbHNcIj09PW4udmFycy5jb250cm9sTmF2P1wiaW1nXCI6XCJhXCI7bi5jb250cm9sTmF2PSQoXCIuXCIraStcImNvbnRyb2wtbmF2IGxpIFwiK2Usbi5jb250cm9sc0NvbnRhaW5lcj9uLmNvbnRyb2xzQ29udGFpbmVyOm4pfSxhY3RpdmU6ZnVuY3Rpb24oKXtuLmNvbnRyb2xOYXYucmVtb3ZlQ2xhc3MoaStcImFjdGl2ZVwiKS5lcShuLmFuaW1hdGluZ1RvKS5hZGRDbGFzcyhpK1wiYWN0aXZlXCIpfSx1cGRhdGU6ZnVuY3Rpb24oZSx0KXtuLnBhZ2luZ0NvdW50PjEmJlwiYWRkXCI9PT1lP24uY29udHJvbE5hdlNjYWZmb2xkLmFwcGVuZCgkKCc8bGk+PGEgaHJlZj1cIiNcIj4nK24uY291bnQrXCI8L2E+PC9saT5cIikpOjE9PT1uLnBhZ2luZ0NvdW50P24uY29udHJvbE5hdlNjYWZmb2xkLmZpbmQoXCJsaVwiKS5yZW1vdmUoKTpuLmNvbnRyb2xOYXYuZXEodCkuY2xvc2VzdChcImxpXCIpLnJlbW92ZSgpLGYuY29udHJvbE5hdi5zZXQoKSxuLnBhZ2luZ0NvdW50PjEmJm4ucGFnaW5nQ291bnQhPT1uLmNvbnRyb2xOYXYubGVuZ3RoP24udXBkYXRlKHQsZSk6Zi5jb250cm9sTmF2LmFjdGl2ZSgpfX0sZGlyZWN0aW9uTmF2OntzZXR1cDpmdW5jdGlvbigpe3ZhciBlPSQoJzx1bCBjbGFzcz1cIicraSsnZGlyZWN0aW9uLW5hdlwiPjxsaSBjbGFzcz1cIicraSsnbmF2LXByZXZcIj48YSBjbGFzcz1cIicraSsncHJldlwiIGhyZWY9XCIjXCI+JytuLnZhcnMucHJldlRleHQrJzwvYT48L2xpPjxsaSBjbGFzcz1cIicraSsnbmF2LW5leHRcIj48YSBjbGFzcz1cIicraSsnbmV4dFwiIGhyZWY9XCIjXCI+JytuLnZhcnMubmV4dFRleHQrXCI8L2E+PC9saT48L3VsPlwiKTtuLmN1c3RvbURpcmVjdGlvbk5hdj9uLmRpcmVjdGlvbk5hdj1uLmN1c3RvbURpcmVjdGlvbk5hdjpuLmNvbnRyb2xzQ29udGFpbmVyPygkKG4uY29udHJvbHNDb250YWluZXIpLmFwcGVuZChlKSxuLmRpcmVjdGlvbk5hdj0kKFwiLlwiK2krXCJkaXJlY3Rpb24tbmF2IGxpIGFcIixuLmNvbnRyb2xzQ29udGFpbmVyKSk6KG4uYXBwZW5kKGUpLG4uZGlyZWN0aW9uTmF2PSQoXCIuXCIraStcImRpcmVjdGlvbi1uYXYgbGkgYVwiLG4pKSxmLmRpcmVjdGlvbk5hdi51cGRhdGUoKSxuLmRpcmVjdGlvbk5hdi5iaW5kKG8sZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciB0O1wiXCIhPT1sJiZsIT09ZS50eXBlfHwodD0kKHRoaXMpLmhhc0NsYXNzKGkrXCJuZXh0XCIpP24uZ2V0VGFyZ2V0KFwibmV4dFwiKTpuLmdldFRhcmdldChcInByZXZcIiksbi5mbGV4QW5pbWF0ZSh0LG4udmFycy5wYXVzZU9uQWN0aW9uKSksXCJcIj09PWwmJihsPWUudHlwZSksZi5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sdXBkYXRlOmZ1bmN0aW9uKCl7dmFyIGU9aStcImRpc2FibGVkXCI7MT09PW4ucGFnaW5nQ291bnQ/bi5kaXJlY3Rpb25OYXYuYWRkQ2xhc3MoZSkuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTpuLnZhcnMuYW5pbWF0aW9uTG9vcD9uLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5yZW1vdmVBdHRyKFwidGFiaW5kZXhcIik6MD09PW4uYW5pbWF0aW5nVG8/bi5kaXJlY3Rpb25OYXYucmVtb3ZlQ2xhc3MoZSkuZmlsdGVyKFwiLlwiK2krXCJwcmV2XCIpLmFkZENsYXNzKGUpLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIik6bi5hbmltYXRpbmdUbz09PW4ubGFzdD9uLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5maWx0ZXIoXCIuXCIraStcIm5leHRcIikuYWRkQ2xhc3MoZSkuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTpuLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5yZW1vdmVBdHRyKFwidGFiaW5kZXhcIil9fSxwYXVzZVBsYXk6e3NldHVwOmZ1bmN0aW9uKCl7dmFyIGU9JCgnPGRpdiBjbGFzcz1cIicraSsncGF1c2VwbGF5XCI+PGEgaHJlZj1cIiNcIj48L2E+PC9kaXY+Jyk7bi5jb250cm9sc0NvbnRhaW5lcj8obi5jb250cm9sc0NvbnRhaW5lci5hcHBlbmQoZSksbi5wYXVzZVBsYXk9JChcIi5cIitpK1wicGF1c2VwbGF5IGFcIixuLmNvbnRyb2xzQ29udGFpbmVyKSk6KG4uYXBwZW5kKGUpLG4ucGF1c2VQbGF5PSQoXCIuXCIraStcInBhdXNlcGxheSBhXCIsbikpLGYucGF1c2VQbGF5LnVwZGF0ZShuLnZhcnMuc2xpZGVzaG93P2krXCJwYXVzZVwiOmkrXCJwbGF5XCIpLG4ucGF1c2VQbGF5LmJpbmQobyxmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCksXCJcIiE9PWwmJmwhPT1lLnR5cGV8fCgkKHRoaXMpLmhhc0NsYXNzKGkrXCJwYXVzZVwiKT8obi5tYW51YWxQYXVzZT0hMCxuLm1hbnVhbFBsYXk9ITEsbi5wYXVzZSgpKToobi5tYW51YWxQYXVzZT0hMSxuLm1hbnVhbFBsYXk9ITAsbi5wbGF5KCkpKSxcIlwiPT09bCYmKGw9ZS50eXBlKSxmLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSx1cGRhdGU6ZnVuY3Rpb24oZSl7XCJwbGF5XCI9PT1lP24ucGF1c2VQbGF5LnJlbW92ZUNsYXNzKGkrXCJwYXVzZVwiKS5hZGRDbGFzcyhpK1wicGxheVwiKS5odG1sKG4udmFycy5wbGF5VGV4dCk6bi5wYXVzZVBsYXkucmVtb3ZlQ2xhc3MoaStcInBsYXlcIikuYWRkQ2xhc3MoaStcInBhdXNlXCIpLmh0bWwobi52YXJzLnBhdXNlVGV4dCl9fSx0b3VjaDpmdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSl7ZS5zdG9wUHJvcGFnYXRpb24oKSxuLmFuaW1hdGluZz9lLnByZXZlbnREZWZhdWx0KCk6KG4ucGF1c2UoKSx0Ll9nZXN0dXJlLmFkZFBvaW50ZXIoZS5wb2ludGVySWQpLFQ9MCxjPWQ/bi5oOm4udyxmPU51bWJlcihuZXcgRGF0ZSksbD12JiZ1JiZuLmFuaW1hdGluZ1RvPT09bi5sYXN0PzA6diYmdT9uLmxpbWl0LShuLml0ZW1XK24udmFycy5pdGVtTWFyZ2luKSpuLm1vdmUqbi5hbmltYXRpbmdUbzp2JiZuLmN1cnJlbnRTbGlkZT09PW4ubGFzdD9uLmxpbWl0OnY/KG4uaXRlbVcrbi52YXJzLml0ZW1NYXJnaW4pKm4ubW92ZSpuLmN1cnJlbnRTbGlkZTp1PyhuLmxhc3Qtbi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCkqYzoobi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCkqYyl9ZnVuY3Rpb24gYShlKXtlLnN0b3BQcm9wYWdhdGlvbigpO3ZhciBhPWUudGFyZ2V0Ll9zbGlkZXI7aWYoYSl7dmFyIG49LWUudHJhbnNsYXRpb25YLGk9LWUudHJhbnNsYXRpb25ZO2lmKFQrPWQ/aTpuLG09VCx5PWQ/TWF0aC5hYnMoVCk8TWF0aC5hYnMoLW4pOk1hdGguYWJzKFQpPE1hdGguYWJzKC1pKSxlLmRldGFpbD09PWUuTVNHRVNUVVJFX0ZMQUdfSU5FUlRJQSlyZXR1cm4gdm9pZCBzZXRJbW1lZGlhdGUoZnVuY3Rpb24oKXt0Ll9nZXN0dXJlLnN0b3AoKX0pOygheXx8TnVtYmVyKG5ldyBEYXRlKS1mPjUwMCkmJihlLnByZXZlbnREZWZhdWx0KCksIXAmJmEudHJhbnNpdGlvbnMmJihhLnZhcnMuYW5pbWF0aW9uTG9vcHx8KG09VC8oMD09PWEuY3VycmVudFNsaWRlJiZUPDB8fGEuY3VycmVudFNsaWRlPT09YS5sYXN0JiZUPjA/TWF0aC5hYnMoVCkvYysyOjEpKSxhLnNldFByb3BzKGwrbSxcInNldFRvdWNoXCIpKSl9fWZ1bmN0aW9uIGkoZSl7ZS5zdG9wUHJvcGFnYXRpb24oKTt2YXIgdD1lLnRhcmdldC5fc2xpZGVyO2lmKHQpe2lmKHQuYW5pbWF0aW5nVG89PT10LmN1cnJlbnRTbGlkZSYmIXkmJm51bGwhPT1tKXt2YXIgYT11Py1tOm0sbj1hPjA/dC5nZXRUYXJnZXQoXCJuZXh0XCIpOnQuZ2V0VGFyZ2V0KFwicHJldlwiKTt0LmNhbkFkdmFuY2UobikmJihOdW1iZXIobmV3IERhdGUpLWY8NTUwJiZNYXRoLmFicyhhKT41MHx8TWF0aC5hYnMoYSk+Yy8yKT90LmZsZXhBbmltYXRlKG4sdC52YXJzLnBhdXNlT25BY3Rpb24pOnB8fHQuZmxleEFuaW1hdGUodC5jdXJyZW50U2xpZGUsdC52YXJzLnBhdXNlT25BY3Rpb24sITApfXM9bnVsbCxvPW51bGwsbT1udWxsLGw9bnVsbCxUPTB9fXZhciBzLG8sbCxjLG0sZixnLGgsUyx5PSExLHg9MCxiPTAsVD0wO3I/KHQuc3R5bGUubXNUb3VjaEFjdGlvbj1cIm5vbmVcIix0Ll9nZXN0dXJlPW5ldyBNU0dlc3R1cmUsdC5fZ2VzdHVyZS50YXJnZXQ9dCx0LmFkZEV2ZW50TGlzdGVuZXIoXCJNU1BvaW50ZXJEb3duXCIsZSwhMSksdC5fc2xpZGVyPW4sdC5hZGRFdmVudExpc3RlbmVyKFwiTVNHZXN0dXJlQ2hhbmdlXCIsYSwhMSksdC5hZGRFdmVudExpc3RlbmVyKFwiTVNHZXN0dXJlRW5kXCIsaSwhMSkpOihnPWZ1bmN0aW9uKGUpe24uYW5pbWF0aW5nP2UucHJldmVudERlZmF1bHQoKTood2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkfHwxPT09ZS50b3VjaGVzLmxlbmd0aCkmJihuLnBhdXNlKCksYz1kP24uaDpuLncsZj1OdW1iZXIobmV3IERhdGUpLHg9ZS50b3VjaGVzWzBdLnBhZ2VYLGI9ZS50b3VjaGVzWzBdLnBhZ2VZLGw9diYmdSYmbi5hbmltYXRpbmdUbz09PW4ubGFzdD8wOnYmJnU/bi5saW1pdC0obi5pdGVtVytuLnZhcnMuaXRlbU1hcmdpbikqbi5tb3ZlKm4uYW5pbWF0aW5nVG86diYmbi5jdXJyZW50U2xpZGU9PT1uLmxhc3Q/bi5saW1pdDp2PyhuLml0ZW1XK24udmFycy5pdGVtTWFyZ2luKSpuLm1vdmUqbi5jdXJyZW50U2xpZGU6dT8obi5sYXN0LW4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQpKmM6KG4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQpKmMscz1kP2I6eCxvPWQ/eDpiLHQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLGgsITEpLHQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsUywhMSkpfSxoPWZ1bmN0aW9uKGUpe3g9ZS50b3VjaGVzWzBdLnBhZ2VYLGI9ZS50b3VjaGVzWzBdLnBhZ2VZLG09ZD9zLWI6cy14LHk9ZD9NYXRoLmFicyhtKTxNYXRoLmFicyh4LW8pOk1hdGguYWJzKG0pPE1hdGguYWJzKGItbyk7dmFyIHQ9NTAwOygheXx8TnVtYmVyKG5ldyBEYXRlKS1mPjUwMCkmJihlLnByZXZlbnREZWZhdWx0KCksIXAmJm4udHJhbnNpdGlvbnMmJihuLnZhcnMuYW5pbWF0aW9uTG9vcHx8KG0vPTA9PT1uLmN1cnJlbnRTbGlkZSYmbTwwfHxuLmN1cnJlbnRTbGlkZT09PW4ubGFzdCYmbT4wP01hdGguYWJzKG0pL2MrMjoxKSxuLnNldFByb3BzKGwrbSxcInNldFRvdWNoXCIpKSl9LFM9ZnVuY3Rpb24oZSl7aWYodC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsaCwhMSksbi5hbmltYXRpbmdUbz09PW4uY3VycmVudFNsaWRlJiYheSYmbnVsbCE9PW0pe3ZhciBhPXU/LW06bSxpPWE+MD9uLmdldFRhcmdldChcIm5leHRcIik6bi5nZXRUYXJnZXQoXCJwcmV2XCIpO24uY2FuQWR2YW5jZShpKSYmKE51bWJlcihuZXcgRGF0ZSktZjw1NTAmJk1hdGguYWJzKGEpPjUwfHxNYXRoLmFicyhhKT5jLzIpP24uZmxleEFuaW1hdGUoaSxuLnZhcnMucGF1c2VPbkFjdGlvbik6cHx8bi5mbGV4QW5pbWF0ZShuLmN1cnJlbnRTbGlkZSxuLnZhcnMucGF1c2VPbkFjdGlvbiwhMCl9dC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIixTLCExKSxzPW51bGwsbz1udWxsLG09bnVsbCxsPW51bGx9LHQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIixnLCExKSl9LHJlc2l6ZTpmdW5jdGlvbigpeyFuLmFuaW1hdGluZyYmbi5pcyhcIjp2aXNpYmxlXCIpJiYodnx8bi5kb01hdGgoKSxwP2Yuc21vb3RoSGVpZ2h0KCk6dj8obi5zbGlkZXMud2lkdGgobi5jb21wdXRlZFcpLG4udXBkYXRlKG4ucGFnaW5nQ291bnQpLG4uc2V0UHJvcHMoKSk6ZD8obi52aWV3cG9ydC5oZWlnaHQobi5oKSxuLnNldFByb3BzKG4uaCxcInNldFRvdGFsXCIpKToobi52YXJzLnNtb290aEhlaWdodCYmZi5zbW9vdGhIZWlnaHQoKSxuLm5ld1NsaWRlcy53aWR0aChuLmNvbXB1dGVkVyksbi5zZXRQcm9wcyhuLmNvbXB1dGVkVyxcInNldFRvdGFsXCIpKSl9LHNtb290aEhlaWdodDpmdW5jdGlvbihlKXtpZighZHx8cCl7dmFyIHQ9cD9uOm4udmlld3BvcnQ7ZT90LmFuaW1hdGUoe2hlaWdodDpuLnNsaWRlcy5lcShuLmFuaW1hdGluZ1RvKS5pbm5lckhlaWdodCgpfSxlKTp0LmlubmVySGVpZ2h0KG4uc2xpZGVzLmVxKG4uYW5pbWF0aW5nVG8pLmlubmVySGVpZ2h0KCkpfX0sc3luYzpmdW5jdGlvbihlKXt2YXIgdD0kKG4udmFycy5zeW5jKS5kYXRhKFwiZmxleHNsaWRlclwiKSxhPW4uYW5pbWF0aW5nVG87c3dpdGNoKGUpe2Nhc2VcImFuaW1hdGVcIjp0LmZsZXhBbmltYXRlKGEsbi52YXJzLnBhdXNlT25BY3Rpb24sITEsITApO2JyZWFrO2Nhc2VcInBsYXlcIjp0LnBsYXlpbmd8fHQuYXNOYXZ8fHQucGxheSgpO2JyZWFrO2Nhc2VcInBhdXNlXCI6dC5wYXVzZSgpO2JyZWFrfX0sdW5pcXVlSUQ6ZnVuY3Rpb24oZSl7cmV0dXJuIGUuZmlsdGVyKFwiW2lkXVwiKS5hZGQoZS5maW5kKFwiW2lkXVwiKSkuZWFjaChmdW5jdGlvbigpe3ZhciBlPSQodGhpcyk7ZS5hdHRyKFwiaWRcIixlLmF0dHIoXCJpZFwiKStcIl9jbG9uZVwiKX0pLGV9LHBhdXNlSW52aXNpYmxlOnt2aXNQcm9wOm51bGwsaW5pdDpmdW5jdGlvbigpe3ZhciBlPWYucGF1c2VJbnZpc2libGUuZ2V0SGlkZGVuUHJvcCgpO2lmKGUpe3ZhciB0PWUucmVwbGFjZSgvW0h8aF1pZGRlbi8sXCJcIikrXCJ2aXNpYmlsaXR5Y2hhbmdlXCI7ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0LGZ1bmN0aW9uKCl7Zi5wYXVzZUludmlzaWJsZS5pc0hpZGRlbigpP24uc3RhcnRUaW1lb3V0P2NsZWFyVGltZW91dChuLnN0YXJ0VGltZW91dCk6bi5wYXVzZSgpOm4uc3RhcnRlZD9uLnBsYXkoKTpuLnZhcnMuaW5pdERlbGF5PjA/c2V0VGltZW91dChuLnBsYXksbi52YXJzLmluaXREZWxheSk6bi5wbGF5KCl9KX19LGlzSGlkZGVuOmZ1bmN0aW9uKCl7dmFyIGU9Zi5wYXVzZUludmlzaWJsZS5nZXRIaWRkZW5Qcm9wKCk7cmV0dXJuISFlJiZkb2N1bWVudFtlXX0sZ2V0SGlkZGVuUHJvcDpmdW5jdGlvbigpe3ZhciBlPVtcIndlYmtpdFwiLFwibW96XCIsXCJtc1wiLFwib1wiXTtpZihcImhpZGRlblwiaW4gZG9jdW1lbnQpcmV0dXJuXCJoaWRkZW5cIjtmb3IodmFyIHQ9MDt0PGUubGVuZ3RoO3QrKylpZihlW3RdK1wiSGlkZGVuXCJpbiBkb2N1bWVudClyZXR1cm4gZVt0XStcIkhpZGRlblwiO3JldHVybiBudWxsfX0sc2V0VG9DbGVhcldhdGNoZWRFdmVudDpmdW5jdGlvbigpe2NsZWFyVGltZW91dChjKSxjPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtsPVwiXCJ9LDNlMyl9fSxuLmZsZXhBbmltYXRlPWZ1bmN0aW9uKGUsdCxhLHIsbyl7aWYobi52YXJzLmFuaW1hdGlvbkxvb3B8fGU9PT1uLmN1cnJlbnRTbGlkZXx8KG4uZGlyZWN0aW9uPWU+bi5jdXJyZW50U2xpZGU/XCJuZXh0XCI6XCJwcmV2XCIpLG0mJjE9PT1uLnBhZ2luZ0NvdW50JiYobi5kaXJlY3Rpb249bi5jdXJyZW50SXRlbTxlP1wibmV4dFwiOlwicHJldlwiKSwhbi5hbmltYXRpbmcmJihuLmNhbkFkdmFuY2UoZSxvKXx8YSkmJm4uaXMoXCI6dmlzaWJsZVwiKSl7aWYobSYmcil7dmFyIGw9JChuLnZhcnMuYXNOYXZGb3IpLmRhdGEoXCJmbGV4c2xpZGVyXCIpO2lmKG4uYXRFbmQ9MD09PWV8fGU9PT1uLmNvdW50LTEsbC5mbGV4QW5pbWF0ZShlLCEwLCExLCEwLG8pLG4uZGlyZWN0aW9uPW4uY3VycmVudEl0ZW08ZT9cIm5leHRcIjpcInByZXZcIixsLmRpcmVjdGlvbj1uLmRpcmVjdGlvbixNYXRoLmNlaWwoKGUrMSkvbi52aXNpYmxlKS0xPT09bi5jdXJyZW50U2xpZGV8fDA9PT1lKXJldHVybiBuLmN1cnJlbnRJdGVtPWUsbi5zbGlkZXMucmVtb3ZlQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKS5lcShlKS5hZGRDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLCExO24uY3VycmVudEl0ZW09ZSxuLnNsaWRlcy5yZW1vdmVDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGUpLmFkZENsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIiksZT1NYXRoLmZsb29yKGUvbi52aXNpYmxlKX1pZihuLmFuaW1hdGluZz0hMCxuLmFuaW1hdGluZ1RvPWUsdCYmbi5wYXVzZSgpLG4udmFycy5iZWZvcmUobiksbi5zeW5jRXhpc3RzJiYhbyYmZi5zeW5jKFwiYW5pbWF0ZVwiKSxuLnZhcnMuY29udHJvbE5hdiYmZi5jb250cm9sTmF2LmFjdGl2ZSgpLHZ8fG4uc2xpZGVzLnJlbW92ZUNsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIikuZXEoZSkuYWRkQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKSxuLmF0RW5kPTA9PT1lfHxlPT09bi5sYXN0LG4udmFycy5kaXJlY3Rpb25OYXYmJmYuZGlyZWN0aW9uTmF2LnVwZGF0ZSgpLGU9PT1uLmxhc3QmJihuLnZhcnMuZW5kKG4pLG4udmFycy5hbmltYXRpb25Mb29wfHxuLnBhdXNlKCkpLHApcz8obi5zbGlkZXMuZXEobi5jdXJyZW50U2xpZGUpLmNzcyh7b3BhY2l0eTowLHpJbmRleDoxfSksbi5zbGlkZXMuZXEoZSkuY3NzKHtvcGFjaXR5OjEsekluZGV4OjJ9KSxuLndyYXB1cChjKSk6KG4uc2xpZGVzLmVxKG4uY3VycmVudFNsaWRlKS5jc3Moe3pJbmRleDoxfSkuYW5pbWF0ZSh7b3BhY2l0eTowfSxuLnZhcnMuYW5pbWF0aW9uU3BlZWQsbi52YXJzLmVhc2luZyksbi5zbGlkZXMuZXEoZSkuY3NzKHt6SW5kZXg6Mn0pLmFuaW1hdGUoe29wYWNpdHk6MX0sbi52YXJzLmFuaW1hdGlvblNwZWVkLG4udmFycy5lYXNpbmcsbi53cmFwdXApKTtlbHNle3ZhciBjPWQ/bi5zbGlkZXMuZmlsdGVyKFwiOmZpcnN0XCIpLmhlaWdodCgpOm4uY29tcHV0ZWRXLGcsaCxTO3Y/KGc9bi52YXJzLml0ZW1NYXJnaW4sUz0obi5pdGVtVytnKSpuLm1vdmUqbi5hbmltYXRpbmdUbyxoPVM+bi5saW1pdCYmMSE9PW4udmlzaWJsZT9uLmxpbWl0OlMpOmg9MD09PW4uY3VycmVudFNsaWRlJiZlPT09bi5jb3VudC0xJiZuLnZhcnMuYW5pbWF0aW9uTG9vcCYmXCJuZXh0XCIhPT1uLmRpcmVjdGlvbj91PyhuLmNvdW50K24uY2xvbmVPZmZzZXQpKmM6MDpuLmN1cnJlbnRTbGlkZT09PW4ubGFzdCYmMD09PWUmJm4udmFycy5hbmltYXRpb25Mb29wJiZcInByZXZcIiE9PW4uZGlyZWN0aW9uP3U/MDoobi5jb3VudCsxKSpjOnU/KG4uY291bnQtMS1lK24uY2xvbmVPZmZzZXQpKmM6KGUrbi5jbG9uZU9mZnNldCkqYyxuLnNldFByb3BzKGgsXCJcIixuLnZhcnMuYW5pbWF0aW9uU3BlZWQpLG4udHJhbnNpdGlvbnM/KG4udmFycy5hbmltYXRpb25Mb29wJiZuLmF0RW5kfHwobi5hbmltYXRpbmc9ITEsbi5jdXJyZW50U2xpZGU9bi5hbmltYXRpbmdUbyksbi5jb250YWluZXIudW5iaW5kKFwid2Via2l0VHJhbnNpdGlvbkVuZCB0cmFuc2l0aW9uZW5kXCIpLG4uY29udGFpbmVyLmJpbmQoXCJ3ZWJraXRUcmFuc2l0aW9uRW5kIHRyYW5zaXRpb25lbmRcIixmdW5jdGlvbigpe2NsZWFyVGltZW91dChuLmVuc3VyZUFuaW1hdGlvbkVuZCksbi53cmFwdXAoYyl9KSxjbGVhclRpbWVvdXQobi5lbnN1cmVBbmltYXRpb25FbmQpLG4uZW5zdXJlQW5pbWF0aW9uRW5kPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLndyYXB1cChjKX0sbi52YXJzLmFuaW1hdGlvblNwZWVkKzEwMCkpOm4uY29udGFpbmVyLmFuaW1hdGUobi5hcmdzLG4udmFycy5hbmltYXRpb25TcGVlZCxuLnZhcnMuZWFzaW5nLGZ1bmN0aW9uKCl7bi53cmFwdXAoYyl9KX1uLnZhcnMuc21vb3RoSGVpZ2h0JiZmLnNtb290aEhlaWdodChuLnZhcnMuYW5pbWF0aW9uU3BlZWQpfX0sbi53cmFwdXA9ZnVuY3Rpb24oZSl7cHx8dnx8KDA9PT1uLmN1cnJlbnRTbGlkZSYmbi5hbmltYXRpbmdUbz09PW4ubGFzdCYmbi52YXJzLmFuaW1hdGlvbkxvb3A/bi5zZXRQcm9wcyhlLFwianVtcEVuZFwiKTpuLmN1cnJlbnRTbGlkZT09PW4ubGFzdCYmMD09PW4uYW5pbWF0aW5nVG8mJm4udmFycy5hbmltYXRpb25Mb29wJiZuLnNldFByb3BzKGUsXCJqdW1wU3RhcnRcIikpLG4uYW5pbWF0aW5nPSExLG4uY3VycmVudFNsaWRlPW4uYW5pbWF0aW5nVG8sbi52YXJzLmFmdGVyKG4pfSxuLmFuaW1hdGVTbGlkZXM9ZnVuY3Rpb24oKXshbi5hbmltYXRpbmcmJmUmJm4uZmxleEFuaW1hdGUobi5nZXRUYXJnZXQoXCJuZXh0XCIpKX0sbi5wYXVzZT1mdW5jdGlvbigpe2NsZWFySW50ZXJ2YWwobi5hbmltYXRlZFNsaWRlcyksbi5hbmltYXRlZFNsaWRlcz1udWxsLG4ucGxheWluZz0hMSxuLnZhcnMucGF1c2VQbGF5JiZmLnBhdXNlUGxheS51cGRhdGUoXCJwbGF5XCIpLG4uc3luY0V4aXN0cyYmZi5zeW5jKFwicGF1c2VcIil9LG4ucGxheT1mdW5jdGlvbigpe24ucGxheWluZyYmY2xlYXJJbnRlcnZhbChuLmFuaW1hdGVkU2xpZGVzKSxuLmFuaW1hdGVkU2xpZGVzPW4uYW5pbWF0ZWRTbGlkZXN8fHNldEludGVydmFsKG4uYW5pbWF0ZVNsaWRlcyxuLnZhcnMuc2xpZGVzaG93U3BlZWQpLG4uc3RhcnRlZD1uLnBsYXlpbmc9ITAsbi52YXJzLnBhdXNlUGxheSYmZi5wYXVzZVBsYXkudXBkYXRlKFwicGF1c2VcIiksbi5zeW5jRXhpc3RzJiZmLnN5bmMoXCJwbGF5XCIpfSxuLnN0b3A9ZnVuY3Rpb24oKXtuLnBhdXNlKCksbi5zdG9wcGVkPSEwfSxuLmNhbkFkdmFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgYT1tP24ucGFnaW5nQ291bnQtMTpuLmxhc3Q7cmV0dXJuISF0fHwoISghbXx8bi5jdXJyZW50SXRlbSE9PW4uY291bnQtMXx8MCE9PWV8fFwicHJldlwiIT09bi5kaXJlY3Rpb24pfHwoIW18fDAhPT1uLmN1cnJlbnRJdGVtfHxlIT09bi5wYWdpbmdDb3VudC0xfHxcIm5leHRcIj09PW4uZGlyZWN0aW9uKSYmKCEoZT09PW4uY3VycmVudFNsaWRlJiYhbSkmJighIW4udmFycy5hbmltYXRpb25Mb29wfHwoIW4uYXRFbmR8fDAhPT1uLmN1cnJlbnRTbGlkZXx8ZSE9PWF8fFwibmV4dFwiPT09bi5kaXJlY3Rpb24pJiYoIW4uYXRFbmR8fG4uY3VycmVudFNsaWRlIT09YXx8MCE9PWV8fFwibmV4dFwiIT09bi5kaXJlY3Rpb24pKSkpfSxuLmdldFRhcmdldD1mdW5jdGlvbihlKXtyZXR1cm4gbi5kaXJlY3Rpb249ZSxcIm5leHRcIj09PWU/bi5jdXJyZW50U2xpZGU9PT1uLmxhc3Q/MDpuLmN1cnJlbnRTbGlkZSsxOjA9PT1uLmN1cnJlbnRTbGlkZT9uLmxhc3Q6bi5jdXJyZW50U2xpZGUtMX0sbi5zZXRQcm9wcz1mdW5jdGlvbihlLHQsYSl7dmFyIGk9ZnVuY3Rpb24oKXt2YXIgYT1lfHwobi5pdGVtVytuLnZhcnMuaXRlbU1hcmdpbikqbi5tb3ZlKm4uYW5pbWF0aW5nVG87cmV0dXJuLTEqZnVuY3Rpb24oKXtpZih2KXJldHVyblwic2V0VG91Y2hcIj09PXQ/ZTp1JiZuLmFuaW1hdGluZ1RvPT09bi5sYXN0PzA6dT9uLmxpbWl0LShuLml0ZW1XK24udmFycy5pdGVtTWFyZ2luKSpuLm1vdmUqbi5hbmltYXRpbmdUbzpuLmFuaW1hdGluZ1RvPT09bi5sYXN0P24ubGltaXQ6YTtzd2l0Y2godCl7Y2FzZVwic2V0VG90YWxcIjpyZXR1cm4gdT8obi5jb3VudC0xLW4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQpKmU6KG4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQpKmU7Y2FzZVwic2V0VG91Y2hcIjpyZXR1cm4gZTtjYXNlXCJqdW1wRW5kXCI6cmV0dXJuIHU/ZTpuLmNvdW50KmU7Y2FzZVwianVtcFN0YXJ0XCI6cmV0dXJuIHU/bi5jb3VudCplOmU7ZGVmYXVsdDpyZXR1cm4gZX19KCkrXCJweFwifSgpO24udHJhbnNpdGlvbnMmJihpPWQ/XCJ0cmFuc2xhdGUzZCgwLFwiK2krXCIsMClcIjpcInRyYW5zbGF0ZTNkKFwiK2krXCIsMCwwKVwiLGE9dm9pZCAwIT09YT9hLzFlMytcInNcIjpcIjBzXCIsbi5jb250YWluZXIuY3NzKFwiLVwiK24ucGZ4K1wiLXRyYW5zaXRpb24tZHVyYXRpb25cIixhKSxuLmNvbnRhaW5lci5jc3MoXCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCIsYSkpLG4uYXJnc1tuLnByb3BdPWksKG4udHJhbnNpdGlvbnN8fHZvaWQgMD09PWEpJiZuLmNvbnRhaW5lci5jc3Mobi5hcmdzKSxuLmNvbnRhaW5lci5jc3MoXCJ0cmFuc2Zvcm1cIixpKX0sbi5zZXR1cD1mdW5jdGlvbihlKXtpZihwKW4uc2xpZGVzLmNzcyh7d2lkdGg6XCIxMDAlXCIsZmxvYXQ6XCJsZWZ0XCIsbWFyZ2luUmlnaHQ6XCItMTAwJVwiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLFwiaW5pdFwiPT09ZSYmKHM/bi5zbGlkZXMuY3NzKHtvcGFjaXR5OjAsZGlzcGxheTpcImJsb2NrXCIsd2Via2l0VHJhbnNpdGlvbjpcIm9wYWNpdHkgXCIrbi52YXJzLmFuaW1hdGlvblNwZWVkLzFlMytcInMgZWFzZVwiLHpJbmRleDoxfSkuZXEobi5jdXJyZW50U2xpZGUpLmNzcyh7b3BhY2l0eToxLHpJbmRleDoyfSk6MD09bi52YXJzLmZhZGVGaXJzdFNsaWRlP24uc2xpZGVzLmNzcyh7b3BhY2l0eTowLGRpc3BsYXk6XCJibG9ja1wiLHpJbmRleDoxfSkuZXEobi5jdXJyZW50U2xpZGUpLmNzcyh7ekluZGV4OjJ9KS5jc3Moe29wYWNpdHk6MX0pOm4uc2xpZGVzLmNzcyh7b3BhY2l0eTowLGRpc3BsYXk6XCJibG9ja1wiLHpJbmRleDoxfSkuZXEobi5jdXJyZW50U2xpZGUpLmNzcyh7ekluZGV4OjJ9KS5hbmltYXRlKHtvcGFjaXR5OjF9LG4udmFycy5hbmltYXRpb25TcGVlZCxuLnZhcnMuZWFzaW5nKSksbi52YXJzLnNtb290aEhlaWdodCYmZi5zbW9vdGhIZWlnaHQoKTtlbHNle3ZhciB0LGE7XCJpbml0XCI9PT1lJiYobi52aWV3cG9ydD0kKCc8ZGl2IGNsYXNzPVwiJytpKyd2aWV3cG9ydFwiPjwvZGl2PicpLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KS5hcHBlbmRUbyhuKS5hcHBlbmQobi5jb250YWluZXIpLG4uY2xvbmVDb3VudD0wLG4uY2xvbmVPZmZzZXQ9MCx1JiYoYT0kLm1ha2VBcnJheShuLnNsaWRlcykucmV2ZXJzZSgpLG4uc2xpZGVzPSQoYSksbi5jb250YWluZXIuZW1wdHkoKS5hcHBlbmQobi5zbGlkZXMpKSksbi52YXJzLmFuaW1hdGlvbkxvb3AmJiF2JiYobi5jbG9uZUNvdW50PTIsbi5jbG9uZU9mZnNldD0xLFwiaW5pdFwiIT09ZSYmbi5jb250YWluZXIuZmluZChcIi5jbG9uZVwiKS5yZW1vdmUoKSxuLmNvbnRhaW5lci5hcHBlbmQoZi51bmlxdWVJRChuLnNsaWRlcy5maXJzdCgpLmNsb25lKCkuYWRkQ2xhc3MoXCJjbG9uZVwiKSkuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpKS5wcmVwZW5kKGYudW5pcXVlSUQobi5zbGlkZXMubGFzdCgpLmNsb25lKCkuYWRkQ2xhc3MoXCJjbG9uZVwiKSkuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpKSksbi5uZXdTbGlkZXM9JChuLnZhcnMuc2VsZWN0b3IsbiksdD11P24uY291bnQtMS1uLmN1cnJlbnRTbGlkZStuLmNsb25lT2Zmc2V0Om4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQsZCYmIXY/KG4uY29udGFpbmVyLmhlaWdodCgyMDAqKG4uY291bnQrbi5jbG9uZUNvdW50KStcIiVcIikuY3NzKFwicG9zaXRpb25cIixcImFic29sdXRlXCIpLndpZHRoKFwiMTAwJVwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bi5uZXdTbGlkZXMuY3NzKHtkaXNwbGF5OlwiYmxvY2tcIn0pLG4uZG9NYXRoKCksbi52aWV3cG9ydC5oZWlnaHQobi5oKSxuLnNldFByb3BzKHQqbi5oLFwiaW5pdFwiKX0sXCJpbml0XCI9PT1lPzEwMDowKSk6KG4uY29udGFpbmVyLndpZHRoKDIwMCoobi5jb3VudCtuLmNsb25lQ291bnQpK1wiJVwiKSxuLnNldFByb3BzKHQqbi5jb21wdXRlZFcsXCJpbml0XCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLmRvTWF0aCgpLG4ubmV3U2xpZGVzLmNzcyh7d2lkdGg6bi5jb21wdXRlZFcsbWFyZ2luUmlnaHQ6bi5jb21wdXRlZE0sZmxvYXQ6XCJsZWZ0XCIsZGlzcGxheTpcImJsb2NrXCJ9KSxuLnZhcnMuc21vb3RoSGVpZ2h0JiZmLnNtb290aEhlaWdodCgpfSxcImluaXRcIj09PWU/MTAwOjApKX12fHxuLnNsaWRlcy5yZW1vdmVDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLmVxKG4uY3VycmVudFNsaWRlKS5hZGRDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLG4udmFycy5pbml0KG4pfSxuLmRvTWF0aD1mdW5jdGlvbigpe3ZhciBlPW4uc2xpZGVzLmZpcnN0KCksdD1uLnZhcnMuaXRlbU1hcmdpbixhPW4udmFycy5taW5JdGVtcyxpPW4udmFycy5tYXhJdGVtcztuLnc9dm9pZCAwPT09bi52aWV3cG9ydD9uLndpZHRoKCk6bi52aWV3cG9ydC53aWR0aCgpLG4uaD1lLmhlaWdodCgpLG4uYm94UGFkZGluZz1lLm91dGVyV2lkdGgoKS1lLndpZHRoKCksdj8obi5pdGVtVD1uLnZhcnMuaXRlbVdpZHRoK3Qsbi5pdGVtTT10LG4ubWluVz1hP2Eqbi5pdGVtVDpuLncsbi5tYXhXPWk/aSpuLml0ZW1ULXQ6bi53LG4uaXRlbVc9bi5taW5XPm4udz8obi53LXQqKGEtMSkpL2E6bi5tYXhXPG4udz8obi53LXQqKGktMSkpL2k6bi52YXJzLml0ZW1XaWR0aD5uLnc/bi53Om4udmFycy5pdGVtV2lkdGgsbi52aXNpYmxlPU1hdGguZmxvb3Iobi53L24uaXRlbVcpLG4ubW92ZT1uLnZhcnMubW92ZT4wJiZuLnZhcnMubW92ZTxuLnZpc2libGU/bi52YXJzLm1vdmU6bi52aXNpYmxlLG4ucGFnaW5nQ291bnQ9TWF0aC5jZWlsKChuLmNvdW50LW4udmlzaWJsZSkvbi5tb3ZlKzEpLG4ubGFzdD1uLnBhZ2luZ0NvdW50LTEsbi5saW1pdD0xPT09bi5wYWdpbmdDb3VudD8wOm4udmFycy5pdGVtV2lkdGg+bi53P24uaXRlbVcqKG4uY291bnQtMSkrdCoobi5jb3VudC0xKToobi5pdGVtVyt0KSpuLmNvdW50LW4udy10KToobi5pdGVtVz1uLncsbi5pdGVtTT10LG4ucGFnaW5nQ291bnQ9bi5jb3VudCxuLmxhc3Q9bi5jb3VudC0xKSxuLmNvbXB1dGVkVz1uLml0ZW1XLW4uYm94UGFkZGluZyxuLmNvbXB1dGVkTT1uLml0ZW1NfSxuLnVwZGF0ZT1mdW5jdGlvbihlLHQpe24uZG9NYXRoKCksdnx8KGU8bi5jdXJyZW50U2xpZGU/bi5jdXJyZW50U2xpZGUrPTE6ZTw9bi5jdXJyZW50U2xpZGUmJjAhPT1lJiYobi5jdXJyZW50U2xpZGUtPTEpLG4uYW5pbWF0aW5nVG89bi5jdXJyZW50U2xpZGUpLG4udmFycy5jb250cm9sTmF2JiYhbi5tYW51YWxDb250cm9scyYmKFwiYWRkXCI9PT10JiYhdnx8bi5wYWdpbmdDb3VudD5uLmNvbnRyb2xOYXYubGVuZ3RoP2YuY29udHJvbE5hdi51cGRhdGUoXCJhZGRcIik6KFwicmVtb3ZlXCI9PT10JiYhdnx8bi5wYWdpbmdDb3VudDxuLmNvbnRyb2xOYXYubGVuZ3RoKSYmKHYmJm4uY3VycmVudFNsaWRlPm4ubGFzdCYmKG4uY3VycmVudFNsaWRlLT0xLG4uYW5pbWF0aW5nVG8tPTEpLGYuY29udHJvbE5hdi51cGRhdGUoXCJyZW1vdmVcIixuLmxhc3QpKSksbi52YXJzLmRpcmVjdGlvbk5hdiYmZi5kaXJlY3Rpb25OYXYudXBkYXRlKCl9LG4uYWRkU2xpZGU9ZnVuY3Rpb24oZSx0KXt2YXIgYT0kKGUpO24uY291bnQrPTEsbi5sYXN0PW4uY291bnQtMSxkJiZ1P3ZvaWQgMCE9PXQ/bi5zbGlkZXMuZXEobi5jb3VudC10KS5hZnRlcihhKTpuLmNvbnRhaW5lci5wcmVwZW5kKGEpOnZvaWQgMCE9PXQ/bi5zbGlkZXMuZXEodCkuYmVmb3JlKGEpOm4uY29udGFpbmVyLmFwcGVuZChhKSxuLnVwZGF0ZSh0LFwiYWRkXCIpLG4uc2xpZGVzPSQobi52YXJzLnNlbGVjdG9yK1wiOm5vdCguY2xvbmUpXCIsbiksbi5zZXR1cCgpLG4udmFycy5hZGRlZChuKX0sbi5yZW1vdmVTbGlkZT1mdW5jdGlvbihlKXt2YXIgdD1pc05hTihlKT9uLnNsaWRlcy5pbmRleCgkKGUpKTplO24uY291bnQtPTEsbi5sYXN0PW4uY291bnQtMSxpc05hTihlKT8kKGUsbi5zbGlkZXMpLnJlbW92ZSgpOmQmJnU/bi5zbGlkZXMuZXEobi5sYXN0KS5yZW1vdmUoKTpuLnNsaWRlcy5lcShlKS5yZW1vdmUoKSxuLmRvTWF0aCgpLG4udXBkYXRlKHQsXCJyZW1vdmVcIiksbi5zbGlkZXM9JChuLnZhcnMuc2VsZWN0b3IrXCI6bm90KC5jbG9uZSlcIixuKSxuLnNldHVwKCksbi52YXJzLnJlbW92ZWQobil9LGYuaW5pdCgpfSwkKHdpbmRvdykuYmx1cihmdW5jdGlvbih0KXtlPSExfSkuZm9jdXMoZnVuY3Rpb24odCl7ZT0hMH0pLCQuZmxleHNsaWRlci5kZWZhdWx0cz17bmFtZXNwYWNlOlwiZmxleC1cIixzZWxlY3RvcjpcIi5zbGlkZXMgPiBsaVwiLGFuaW1hdGlvbjpcImZhZGVcIixlYXNpbmc6XCJzd2luZ1wiLGRpcmVjdGlvbjpcImhvcml6b250YWxcIixyZXZlcnNlOiExLGFuaW1hdGlvbkxvb3A6ITAsc21vb3RoSGVpZ2h0OiExLHN0YXJ0QXQ6MCxzbGlkZXNob3c6ITAsc2xpZGVzaG93U3BlZWQ6N2UzLGFuaW1hdGlvblNwZWVkOjYwMCxpbml0RGVsYXk6MCxyYW5kb21pemU6ITEsZmFkZUZpcnN0U2xpZGU6ITAsdGh1bWJDYXB0aW9uczohMSxwYXVzZU9uQWN0aW9uOiEwLHBhdXNlT25Ib3ZlcjohMSxwYXVzZUludmlzaWJsZTohMCx1c2VDU1M6ITAsdG91Y2g6ITAsdmlkZW86ITEsY29udHJvbE5hdjohMCxkaXJlY3Rpb25OYXY6ITAscHJldlRleHQ6XCJQcmV2aW91c1wiLG5leHRUZXh0OlwiTmV4dFwiLGtleWJvYXJkOiEwLG11bHRpcGxlS2V5Ym9hcmQ6ITEsbW91c2V3aGVlbDohMSxwYXVzZVBsYXk6ITEscGF1c2VUZXh0OlwiUGF1c2VcIixwbGF5VGV4dDpcIlBsYXlcIixjb250cm9sc0NvbnRhaW5lcjpcIlwiLG1hbnVhbENvbnRyb2xzOlwiXCIsY3VzdG9tRGlyZWN0aW9uTmF2OlwiXCIsc3luYzpcIlwiLGFzTmF2Rm9yOlwiXCIsaXRlbVdpZHRoOjAsaXRlbU1hcmdpbjowLG1pbkl0ZW1zOjEsbWF4SXRlbXM6MCxtb3ZlOjAsYWxsb3dPbmVTbGlkZTohMCxzdGFydDpmdW5jdGlvbigpe30sYmVmb3JlOmZ1bmN0aW9uKCl7fSxhZnRlcjpmdW5jdGlvbigpe30sZW5kOmZ1bmN0aW9uKCl7fSxhZGRlZDpmdW5jdGlvbigpe30scmVtb3ZlZDpmdW5jdGlvbigpe30saW5pdDpmdW5jdGlvbigpe319LCQuZm4uZmxleHNsaWRlcj1mdW5jdGlvbihlKXtpZih2b2lkIDA9PT1lJiYoZT17fSksXCJvYmplY3RcIj09dHlwZW9mIGUpcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciB0PSQodGhpcyksYT1lLnNlbGVjdG9yP2Uuc2VsZWN0b3I6XCIuc2xpZGVzID4gbGlcIixuPXQuZmluZChhKTsxPT09bi5sZW5ndGgmJiExPT09ZS5hbGxvd09uZVNsaWRlfHwwPT09bi5sZW5ndGg/KG4uZmFkZUluKDQwMCksZS5zdGFydCYmZS5zdGFydCh0KSk6dm9pZCAwPT09dC5kYXRhKFwiZmxleHNsaWRlclwiKSYmbmV3ICQuZmxleHNsaWRlcih0aGlzLGUpfSk7dmFyIHQ9JCh0aGlzKS5kYXRhKFwiZmxleHNsaWRlclwiKTtzd2l0Y2goZSl7Y2FzZVwicGxheVwiOnQucGxheSgpO2JyZWFrO2Nhc2VcInBhdXNlXCI6dC5wYXVzZSgpO2JyZWFrO2Nhc2VcInN0b3BcIjp0LnN0b3AoKTticmVhaztjYXNlXCJuZXh0XCI6dC5mbGV4QW5pbWF0ZSh0LmdldFRhcmdldChcIm5leHRcIiksITApO2JyZWFrO2Nhc2VcInByZXZcIjpjYXNlXCJwcmV2aW91c1wiOnQuZmxleEFuaW1hdGUodC5nZXRUYXJnZXQoXCJwcmV2XCIpLCEwKTticmVhaztkZWZhdWx0OlwibnVtYmVyXCI9PXR5cGVvZiBlJiZ0LmZsZXhBbmltYXRlKGUsITApfX19KGpRdWVyeSk7IiwiIWZ1bmN0aW9uKHQpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLHQpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPXQocmVxdWlyZShcImpxdWVyeVwiKSk6dChqUXVlcnkpfShmdW5jdGlvbih0KXtmdW5jdGlvbiBvKG8sZSl7dGhpcy5lbGVtZW50PW8sdGhpcy4kZWxlbWVudD10KHRoaXMuZWxlbWVudCksdGhpcy5kb2M9dChkb2N1bWVudCksdGhpcy53aW49dCh3aW5kb3cpLHRoaXMuc2V0dGluZ3M9dC5leHRlbmQoe30sbixlKSxcIm9iamVjdFwiPT10eXBlb2YgdGhpcy4kZWxlbWVudC5kYXRhKFwidGlwc29cIikmJnQuZXh0ZW5kKHRoaXMuc2V0dGluZ3MsdGhpcy4kZWxlbWVudC5kYXRhKFwidGlwc29cIikpO2Zvcih2YXIgcj1PYmplY3Qua2V5cyh0aGlzLiRlbGVtZW50LmRhdGEoKSkscz17fSxkPTA7ZDxyLmxlbmd0aDtkKyspe3ZhciBsPXJbZF0ucmVwbGFjZShpLFwiXCIpO2lmKFwiXCIhPT1sKXtsPWwuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkrbC5zbGljZSgxKSxzW2xdPXRoaXMuJGVsZW1lbnQuZGF0YShyW2RdKTtmb3IodmFyIHAgaW4gdGhpcy5zZXR0aW5ncylwLnRvTG93ZXJDYXNlKCk9PWwmJih0aGlzLnNldHRpbmdzW3BdPXNbbF0pfX10aGlzLl9kZWZhdWx0cz1uLHRoaXMuX25hbWU9aSx0aGlzLl90aXRsZT10aGlzLiRlbGVtZW50LmF0dHIoXCJ0aXRsZVwiKSx0aGlzLm1vZGU9XCJoaWRlXCIsdGhpcy5pZUZhZGU9IWEsdGhpcy5zZXR0aW5ncy5wcmVmZXJlZFBvc2l0aW9uPXRoaXMuc2V0dGluZ3MucG9zaXRpb24sdGhpcy5pbml0KCl9ZnVuY3Rpb24gZShvKXt2YXIgZT1vLmNsb25lKCk7ZS5jc3MoXCJ2aXNpYmlsaXR5XCIsXCJoaWRkZW5cIiksdChcImJvZHlcIikuYXBwZW5kKGUpO3ZhciByPWUub3V0ZXJIZWlnaHQoKSxzPWUub3V0ZXJXaWR0aCgpO3JldHVybiBlLnJlbW92ZSgpLHt3aWR0aDpzLGhlaWdodDpyfX1mdW5jdGlvbiByKHQpe3QucmVtb3ZlQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyIGJvdHRvbV9yaWdodF9jb3JuZXIgdG9wX2xlZnRfY29ybmVyIGJvdHRvbV9sZWZ0X2Nvcm5lclwiKSx0LmZpbmQoXCIudGlwc29fdGl0bGVcIikucmVtb3ZlQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyIGJvdHRvbV9yaWdodF9jb3JuZXIgdG9wX2xlZnRfY29ybmVyIGJvdHRvbV9sZWZ0X2Nvcm5lclwiKX1mdW5jdGlvbiBzKG8pe3ZhciBpLG4sYSxkPW8udG9vbHRpcCgpLGw9by4kZWxlbWVudCxwPW8sZj10KHdpbmRvdyksZz0xMCxjPXAuc2V0dGluZ3MuYmFja2dyb3VuZCxoPXAudGl0bGVDb250ZW50KCk7c3dpdGNoKHZvaWQgMCE9PWgmJlwiXCIhPT1oJiYoYz1wLnNldHRpbmdzLnRpdGxlQmFja2dyb3VuZCksbC5wYXJlbnQoKS5vdXRlcldpZHRoKCk+Zi5vdXRlcldpZHRoKCkmJihmPWwucGFyZW50KCkpLHAuc2V0dGluZ3MucG9zaXRpb24pe2Nhc2VcInRvcC1yaWdodFwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbV9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwiYm90dG9tX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6Y30pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AtcmlnaHQgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudCBcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kfSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTticmVhaztjYXNlXCJ0b3AtbGVmdFwiOm49bC5vZmZzZXQoKS5sZWZ0LWUoZCkud2lkdGgsaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwiYm90dG9tX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcImJvdHRvbV9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOmN9KSxkLnJlbW92ZUNsYXNzKFwidG9wLXJpZ2h0IHRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnQgXCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcInRvcF9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZH0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk7YnJlYWs7Y2FzZVwiYm90dG9tLXJpZ2h0XCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCksaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpK2UoZCkuaGVpZ2h0PmYuc2Nyb2xsVG9wKCkrZi5vdXRlckhlaWdodCgpPyhpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJ0b3BfbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZH0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AtcmlnaHQgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwiYm90dG9tX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJib3R0b21fcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpjfSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTticmVhaztjYXNlXCJib3R0b20tbGVmdFwiOm49bC5vZmZzZXQoKS5sZWZ0LWUoZCkud2lkdGgsaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpK2UoZCkuaGVpZ2h0PmYuc2Nyb2xsVG9wKCkrZi5vdXRlckhlaWdodCgpPyhpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwidG9wX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcInRvcF9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZH0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AtcmlnaHQgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwiYm90dG9tX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcImJvdHRvbV9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOmN9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpO2JyZWFrO2Nhc2VcInRvcFwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLzItZShkKS53aWR0aC8yLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkvMi1lKGQpLndpZHRoLzIsaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpK2UoZCkuaGVpZ2h0PmYuc2Nyb2xsVG9wKCkrZi5vdXRlckhlaWdodCgpPyhpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhwLnNldHRpbmdzLnBvc2l0aW9uKSk7YnJlYWs7Y2FzZVwibGVmdFwiOm49bC5vZmZzZXQoKS5sZWZ0LWUoZCkud2lkdGgtZyxpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKS8yLWUoZCkuaGVpZ2h0LzIsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luVG9wOi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luTGVmdDpcIlwifSksbjxmLnNjcm9sbExlZnQoKT8obj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJyaWdodFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhwLnNldHRpbmdzLnBvc2l0aW9uKSk7YnJlYWs7Y2FzZVwicmlnaHRcIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKStnLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpLzItZShkKS5oZWlnaHQvMixkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5Ub3A6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5MZWZ0OlwiXCJ9KSxuK2crcC5zZXR0aW5ncy53aWR0aD5mLnNjcm9sbExlZnQoKStmLm91dGVyV2lkdGgoKT8obj1sLm9mZnNldCgpLmxlZnQtZShkKS53aWR0aC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImxlZnRcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MocC5zZXR0aW5ncy5wb3NpdGlvbikpfWlmKFwidG9wLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uJiZkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcIm1hcmdpbi1sZWZ0XCI6LXAuc2V0dGluZ3Mud2lkdGgvMn0pLFwidG9wLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pe3ZhciBtPWQuZmluZChcIi50aXBzb19hcnJvd1wiKS5lcSgwKTttLmNzcyh7XCJtYXJnaW4tbGVmdFwiOnAuc2V0dGluZ3Mud2lkdGgvMi0yKnAuc2V0dGluZ3MuYXJyb3dXaWR0aH0pfWlmKFwiYm90dG9tLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKXt2YXIgbT1kLmZpbmQoXCIudGlwc29fYXJyb3dcIikuZXEoMCk7bS5jc3Moe1wibWFyZ2luLWxlZnRcIjotcC5zZXR0aW5ncy53aWR0aC8yLFwibWFyZ2luLXRvcFwiOlwiXCJ9KX1pZihcImJvdHRvbS1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKXt2YXIgbT1kLmZpbmQoXCIudGlwc29fYXJyb3dcIikuZXEoMCk7bS5jc3Moe1wibWFyZ2luLWxlZnRcIjpwLnNldHRpbmdzLndpZHRoLzItMipwLnNldHRpbmdzLmFycm93V2lkdGgsXCJtYXJnaW4tdG9wXCI6XCJcIn0pfW48Zi5zY3JvbGxMZWZ0KCkmJihcImJvdHRvbVwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3BcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYoZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDpuLXAuc2V0dGluZ3MuYXJyb3dXaWR0aH0pLG49MCksbitwLnNldHRpbmdzLndpZHRoPmYub3V0ZXJXaWR0aCgpJiYoXCJib3R0b21cIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wXCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKGE9Zi5vdXRlcldpZHRoKCktKG4rcC5zZXR0aW5ncy53aWR0aCksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotYS1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxuKz1hKSxuPGYuc2Nyb2xsTGVmdCgpJiYoXCJsZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcC1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3AtbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJib3R0b20tcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwiYm90dG9tLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYobj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkvMi1lKGQpLndpZHRoLzIsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLHIoZCksZC5hZGRDbGFzcyhcInRvcFwiKSksbitwLnNldHRpbmdzLndpZHRoPmYub3V0ZXJXaWR0aCgpJiYoYT1mLm91dGVyV2lkdGgoKS0obitwLnNldHRpbmdzLndpZHRoKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1hLXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLG4rPWEpLG48Zi5zY3JvbGxMZWZ0KCkmJihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Om4tcC5zZXR0aW5ncy5hcnJvd1dpZHRofSksbj0wKSksbitwLnNldHRpbmdzLndpZHRoPmYub3V0ZXJXaWR0aCgpJiYoXCJsZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcC1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3AtbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJib3R0b20tcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwiYm90dG9tLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKG49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLzItZShkKS53aWR0aC8yLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpLG4rcC5zZXR0aW5ncy53aWR0aD5mLm91dGVyV2lkdGgoKSYmKGE9Zi5vdXRlcldpZHRoKCktKG4rcC5zZXR0aW5ncy53aWR0aCksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotYS1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxuKz1hKSxuPGYuc2Nyb2xsTGVmdCgpJiYoZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDpuLXAuc2V0dGluZ3MuYXJyb3dXaWR0aH0pLG49MCkpLGQuY3NzKHtsZWZ0Om4rcC5zZXR0aW5ncy5vZmZzZXRYLHRvcDppK3Auc2V0dGluZ3Mub2Zmc2V0WX0pLGk8Zi5zY3JvbGxUb3AoKSYmKFwicmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwibGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihsLnRpcHNvKFwidXBkYXRlXCIsXCJwb3NpdGlvblwiLFwiYm90dG9tXCIpLHMocCkpLGkrZShkKS5oZWlnaHQ+Zi5zY3JvbGxUb3AoKStmLm91dGVySGVpZ2h0KCkmJihcInJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYobC50aXBzbyhcInVwZGF0ZVwiLFwicG9zaXRpb25cIixcInRvcFwiKSxzKHApKX12YXIgaT1cInRpcHNvXCIsbj17c3BlZWQ6NDAwLGJhY2tncm91bmQ6XCIjNTViNTU1XCIsdGl0bGVCYWNrZ3JvdW5kOlwiIzMzMzMzM1wiLGNvbG9yOlwiI2ZmZmZmZlwiLHRpdGxlQ29sb3I6XCIjZmZmZmZmXCIsdGl0bGVDb250ZW50OlwiXCIsc2hvd0Fycm93OiEwLHBvc2l0aW9uOlwidG9wXCIsd2lkdGg6MjAwLG1heFdpZHRoOlwiXCIsZGVsYXk6MjAwLGhpZGVEZWxheTowLGFuaW1hdGlvbkluOlwiXCIsYW5pbWF0aW9uT3V0OlwiXCIsb2Zmc2V0WDowLG9mZnNldFk6MCxhcnJvd1dpZHRoOjgsdG9vbHRpcEhvdmVyOiExLGNvbnRlbnQ6bnVsbCxhamF4Q29udGVudFVybDpudWxsLGFqYXhDb250ZW50QnVmZmVyOjAsY29udGVudEVsZW1lbnRJZDpudWxsLHVzZVRpdGxlOiExLHRlbXBsYXRlRW5naW5lRnVuYzpudWxsLG9uQmVmb3JlU2hvdzpudWxsLG9uU2hvdzpudWxsLG9uSGlkZTpudWxsfTt0LmV4dGVuZChvLnByb3RvdHlwZSx7aW5pdDpmdW5jdGlvbigpe3t2YXIgdD10aGlzLG89dGhpcy4kZWxlbWVudDt0aGlzLmRvY31pZihvLmFkZENsYXNzKFwidGlwc29fc3R5bGVcIikucmVtb3ZlQXR0cihcInRpdGxlXCIpLHQuc2V0dGluZ3MudG9vbHRpcEhvdmVyKXt2YXIgZT1udWxsLHI9bnVsbDtvLm9uKFwibW91c2VvdmVyLlwiK2ksZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoZSksY2xlYXJUaW1lb3V0KHIpLHI9c2V0VGltZW91dChmdW5jdGlvbigpe3Quc2hvdygpfSwxNTApfSksby5vbihcIm1vdXNlb3V0LlwiK2ksZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoZSksY2xlYXJUaW1lb3V0KHIpLGU9c2V0VGltZW91dChmdW5jdGlvbigpe3QuaGlkZSgpfSwyMDApLHQudG9vbHRpcCgpLm9uKFwibW91c2VvdmVyLlwiK2ksZnVuY3Rpb24oKXt0Lm1vZGU9XCJ0b29sdGlwSG92ZXJcIn0pLm9uKFwibW91c2VvdXQuXCIraSxmdW5jdGlvbigpe3QubW9kZT1cInNob3dcIixjbGVhclRpbWVvdXQoZSksZT1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC5oaWRlKCl9LDIwMCl9KX0pfWVsc2Ugby5vbihcIm1vdXNlb3Zlci5cIitpLGZ1bmN0aW9uKCl7dC5zaG93KCl9KSxvLm9uKFwibW91c2VvdXQuXCIraSxmdW5jdGlvbigpe3QuaGlkZSgpfSk7dC5zZXR0aW5ncy5hamF4Q29udGVudFVybCYmKHQuYWpheENvbnRlbnQ9bnVsbCl9LHRvb2x0aXA6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy50aXBzb19idWJibGV8fCh0aGlzLnRpcHNvX2J1YmJsZT10KCc8ZGl2IGNsYXNzPVwidGlwc29fYnViYmxlXCI+PGRpdiBjbGFzcz1cInRpcHNvX3RpdGxlXCI+PC9kaXY+PGRpdiBjbGFzcz1cInRpcHNvX2NvbnRlbnRcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGlwc29fYXJyb3dcIj48L2Rpdj48L2Rpdj4nKSksdGhpcy50aXBzb19idWJibGV9LHNob3c6ZnVuY3Rpb24oKXt2YXIgbz10aGlzLnRvb2x0aXAoKSxlPXRoaXMscj10aGlzLndpbjtlLnNldHRpbmdzLnNob3dBcnJvdz09PSExP28uZmluZChcIi50aXBzb19hcnJvd1wiKS5oaWRlKCk6by5maW5kKFwiLnRpcHNvX2Fycm93XCIpLnNob3coKSxcImhpZGVcIj09PWUubW9kZSYmKHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uQmVmb3JlU2hvdykmJmUuc2V0dGluZ3Mub25CZWZvcmVTaG93KGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpLGUuc2V0dGluZ3Muc2l6ZSYmby5hZGRDbGFzcyhlLnNldHRpbmdzLnNpemUpLGUuc2V0dGluZ3Mud2lkdGg/by5jc3Moe2JhY2tncm91bmQ6ZS5zZXR0aW5ncy5iYWNrZ3JvdW5kLGNvbG9yOmUuc2V0dGluZ3MuY29sb3Isd2lkdGg6ZS5zZXR0aW5ncy53aWR0aH0pLmhpZGUoKTplLnNldHRpbmdzLm1heFdpZHRoP28uY3NzKHtiYWNrZ3JvdW5kOmUuc2V0dGluZ3MuYmFja2dyb3VuZCxjb2xvcjplLnNldHRpbmdzLmNvbG9yLG1heFdpZHRoOmUuc2V0dGluZ3MubWF4V2lkdGh9KS5oaWRlKCk6by5jc3Moe2JhY2tncm91bmQ6ZS5zZXR0aW5ncy5iYWNrZ3JvdW5kLGNvbG9yOmUuc2V0dGluZ3MuY29sb3Isd2lkdGg6MjAwfSkuaGlkZSgpLG8uZmluZChcIi50aXBzb190aXRsZVwiKS5jc3Moe2JhY2tncm91bmQ6ZS5zZXR0aW5ncy50aXRsZUJhY2tncm91bmQsY29sb3I6ZS5zZXR0aW5ncy50aXRsZUNvbG9yfSksby5maW5kKFwiLnRpcHNvX2NvbnRlbnRcIikuaHRtbChlLmNvbnRlbnQoKSksby5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmh0bWwoZS50aXRsZUNvbnRlbnQoKSkscyhlKSxyLm9uKFwicmVzaXplLlwiK2ksZnVuY3Rpb24oKXtlLnNldHRpbmdzLnBvc2l0aW9uPWUuc2V0dGluZ3MucHJlZmVyZWRQb3NpdGlvbixzKGUpfSksd2luZG93LmNsZWFyVGltZW91dChlLnRpbWVvdXQpLGUudGltZW91dD1udWxsLGUudGltZW91dD13aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe2UuaWVGYWRlfHxcIlwiPT09ZS5zZXR0aW5ncy5hbmltYXRpb25Jbnx8XCJcIj09PWUuc2V0dGluZ3MuYW5pbWF0aW9uT3V0P28uYXBwZW5kVG8oXCJib2R5XCIpLnN0b3AoITAsITApLmZhZGVJbihlLnNldHRpbmdzLnNwZWVkLGZ1bmN0aW9uKCl7ZS5tb2RlPVwic2hvd1wiLHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uU2hvdykmJmUuc2V0dGluZ3Mub25TaG93KGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpfSk6by5yZW1vdmUoKS5hcHBlbmRUbyhcImJvZHlcIikuc3RvcCghMCwhMCkucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbk91dCkuYWRkQ2xhc3MoXCJub0FuaW1hdGlvblwiKS5yZW1vdmVDbGFzcyhcIm5vQW5pbWF0aW9uXCIpLmFkZENsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25JbikuZmFkZUluKGUuc2V0dGluZ3Muc3BlZWQsZnVuY3Rpb24oKXt0KHRoaXMpLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe3QodGhpcykucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbkluKX0pLGUubW9kZT1cInNob3dcIix0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vblNob3cpJiZlLnNldHRpbmdzLm9uU2hvdyhlLiRlbGVtZW50LGUuZWxlbWVudCxlKSxyLm9mZihcInJlc2l6ZS5cIitpLG51bGwsXCJ0aXBzb1Jlc2l6ZUhhbmRsZXJcIil9KX0sZS5zZXR0aW5ncy5kZWxheSkpfSxoaWRlOmZ1bmN0aW9uKG8pe3ZhciBlPXRoaXMscj10aGlzLndpbixzPXRoaXMudG9vbHRpcCgpLG49ZS5zZXR0aW5ncy5oaWRlRGVsYXk7byYmKG49MCxlLm1vZGU9XCJzaG93XCIpLHdpbmRvdy5jbGVhclRpbWVvdXQoZS50aW1lb3V0KSxlLnRpbWVvdXQ9bnVsbCxlLnRpbWVvdXQ9d2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcInRvb2x0aXBIb3ZlclwiIT09ZS5tb2RlJiYoZS5pZUZhZGV8fFwiXCI9PT1lLnNldHRpbmdzLmFuaW1hdGlvbklufHxcIlwiPT09ZS5zZXR0aW5ncy5hbmltYXRpb25PdXQ/cy5zdG9wKCEwLCEwKS5mYWRlT3V0KGUuc2V0dGluZ3Muc3BlZWQsZnVuY3Rpb24oKXt0KHRoaXMpLnJlbW92ZSgpLHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uSGlkZSkmJlwic2hvd1wiPT09ZS5tb2RlJiZlLnNldHRpbmdzLm9uSGlkZShlLiRlbGVtZW50LGUuZWxlbWVudCxlKSxlLm1vZGU9XCJoaWRlXCIsci5vZmYoXCJyZXNpemUuXCIraSxudWxsLFwidGlwc29SZXNpemVIYW5kbGVyXCIpfSk6cy5zdG9wKCEwLCEwKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uSW4pLmFkZENsYXNzKFwibm9BbmltYXRpb25cIikucmVtb3ZlQ2xhc3MoXCJub0FuaW1hdGlvblwiKS5hZGRDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uT3V0KS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXt0KHRoaXMpLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25PdXQpLnJlbW92ZSgpLHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uSGlkZSkmJlwic2hvd1wiPT09ZS5tb2RlJiZlLnNldHRpbmdzLm9uSGlkZShlLiRlbGVtZW50LGUuZWxlbWVudCxlKSxlLm1vZGU9XCJoaWRlXCIsci5vZmYoXCJyZXNpemUuXCIraSxudWxsLFwidGlwc29SZXNpemVIYW5kbGVyXCIpfSkpfSxuKX0sY2xvc2U6ZnVuY3Rpb24oKXt0aGlzLmhpZGUoITApfSxkZXN0cm95OmZ1bmN0aW9uKCl7e3ZhciB0PXRoaXMuJGVsZW1lbnQsbz10aGlzLndpbjt0aGlzLmRvY310Lm9mZihcIi5cIitpKSxvLm9mZihcInJlc2l6ZS5cIitpLG51bGwsXCJ0aXBzb1Jlc2l6ZUhhbmRsZXJcIiksdC5yZW1vdmVEYXRhKGkpLHQucmVtb3ZlQ2xhc3MoXCJ0aXBzb19zdHlsZVwiKS5hdHRyKFwidGl0bGVcIix0aGlzLl90aXRsZSl9LHRpdGxlQ29udGVudDpmdW5jdGlvbigpe3ZhciB0LG89dGhpcy4kZWxlbWVudCxlPXRoaXM7cmV0dXJuIHQ9ZS5zZXR0aW5ncy50aXRsZUNvbnRlbnQ/ZS5zZXR0aW5ncy50aXRsZUNvbnRlbnQ6by5kYXRhKFwidGlwc28tdGl0bGVcIil9LGNvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgbyxlPXRoaXMuJGVsZW1lbnQscj10aGlzLHM9dGhpcy5fdGl0bGU7cmV0dXJuIHIuc2V0dGluZ3MuYWpheENvbnRlbnRVcmw/ci5fYWpheENvbnRlbnQ/bz1yLl9hamF4Q29udGVudDooci5fYWpheENvbnRlbnQ9bz10LmFqYXgoe3R5cGU6XCJHRVRcIix1cmw6ci5zZXR0aW5ncy5hamF4Q29udGVudFVybCxhc3luYzohMX0pLnJlc3BvbnNlVGV4dCxyLnNldHRpbmdzLmFqYXhDb250ZW50QnVmZmVyPjA/c2V0VGltZW91dChmdW5jdGlvbigpe3IuX2FqYXhDb250ZW50PW51bGx9LHIuc2V0dGluZ3MuYWpheENvbnRlbnRCdWZmZXIpOnIuX2FqYXhDb250ZW50PW51bGwpOnIuc2V0dGluZ3MuY29udGVudEVsZW1lbnRJZD9vPXQoXCIjXCIrci5zZXR0aW5ncy5jb250ZW50RWxlbWVudElkKS50ZXh0KCk6ci5zZXR0aW5ncy5jb250ZW50P289ci5zZXR0aW5ncy5jb250ZW50OnIuc2V0dGluZ3MudXNlVGl0bGU9PT0hMD9vPXM6XCJzdHJpbmdcIj09dHlwZW9mIGUuZGF0YShcInRpcHNvXCIpJiYobz1lLmRhdGEoXCJ0aXBzb1wiKSksbnVsbCE9PXIuc2V0dGluZ3MudGVtcGxhdGVFbmdpbmVGdW5jJiYobz1yLnNldHRpbmdzLnRlbXBsYXRlRW5naW5lRnVuYyhvKSksb30sdXBkYXRlOmZ1bmN0aW9uKHQsbyl7dmFyIGU9dGhpcztyZXR1cm4gbz92b2lkKGUuc2V0dGluZ3NbdF09byk6ZS5zZXR0aW5nc1t0XX19KTt2YXIgYT1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpLnN0eWxlLG89W1wibXNcIixcIk9cIixcIk1velwiLFwiV2Via2l0XCJdO2lmKFwiXCI9PT10LnRyYW5zaXRpb24pcmV0dXJuITA7Zm9yKDtvLmxlbmd0aDspaWYoby5wb3AoKStcIlRyYW5zaXRpb25cImluIHQpcmV0dXJuITA7cmV0dXJuITF9KCk7dFtpXT10LmZuW2ldPWZ1bmN0aW9uKGUpe3ZhciByPWFyZ3VtZW50cztpZih2b2lkIDA9PT1lfHxcIm9iamVjdFwiPT10eXBlb2YgZSlyZXR1cm4gdGhpcyBpbnN0YW5jZW9mIHR8fHQuZXh0ZW5kKG4sZSksdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSl8fHQuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2ksbmV3IG8odGhpcyxlKSl9KTtpZihcInN0cmluZ1wiPT10eXBlb2YgZSYmXCJfXCIhPT1lWzBdJiZcImluaXRcIiE9PWUpe3ZhciBzO3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgbj10LmRhdGEodGhpcyxcInBsdWdpbl9cIitpKTtufHwobj10LmRhdGEodGhpcyxcInBsdWdpbl9cIitpLG5ldyBvKHRoaXMsZSkpKSxuIGluc3RhbmNlb2YgbyYmXCJmdW5jdGlvblwiPT10eXBlb2YgbltlXSYmKHM9bltlXS5hcHBseShuLEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHIsMSkpKSxcImRlc3Ryb3lcIj09PWUmJnQuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2ksbnVsbCl9KSx2b2lkIDAhPT1zP3M6dGhpc319fSk7IiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbigpIHtcclxuICB2YXIgY29udGVpbmVyO1xyXG4gIHZhciBtb3VzZU92ZXIgPSAwO1xyXG4gIHZhciB0aW1lckNsZWFyQWxsID0gbnVsbDtcclxuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xyXG4gIHZhciB0aW1lID0gMTAwMDA7XHJcblxyXG4gIHZhciBub3RpZmljYXRpb25fYm94ID1mYWxzZTtcclxuICB2YXIgaXNfaW5pdD1mYWxzZTtcclxuICB2YXIgY29uZmlybV9vcHQ9e1xyXG4gICAgdGl0bGU6XCLQo9C00LDQu9C10L3QuNC1XCIsXHJcbiAgICBxdWVzdGlvbjpcItCS0Ysg0LTQtdC50YHRgtCy0LjRgtC10LvRjNC90L4g0YXQvtGC0LjRgtC1INGD0LTQsNC70LjRgtGMP1wiLFxyXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxyXG4gICAgYnV0dG9uTm86XCLQndC10YJcIixcclxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxyXG4gICAgY2FsbGJhY2tObzpmYWxzZSxcclxuICAgIG9iajpmYWxzZSxcclxuICAgIGJ1dHRvblRhZzonZGl2JyxcclxuICAgIGJ1dHRvblllc0RvcDonJyxcclxuICAgIGJ1dHRvbk5vRG9wOicnLFxyXG4gIH07XHJcbiAgdmFyIGFsZXJ0X29wdD17XHJcbiAgICB0aXRsZTpcIlwiLFxyXG4gICAgcXVlc3Rpb246XCLQodC+0L7QsdGJ0LXQvdC40LVcIixcclxuICAgIGJ1dHRvblllczpcItCU0LBcIixcclxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxyXG4gICAgYnV0dG9uVGFnOidkaXYnLFxyXG4gICAgb2JqOmZhbHNlLFxyXG4gIH07XHJcblxyXG5cclxuICBmdW5jdGlvbiBpbml0KCl7XHJcbiAgICBpc19pbml0PXRydWU7XHJcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcclxuXHJcbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jb250cm9sJyxjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsY2xvc2VNb2RhbEZvbik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCl7XHJcbiAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICAkKCcubm90aWZpY2F0aW9uX2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKCcnKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xvc2VNb2RhbEZvbihlKXtcclxuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcbiAgICBpZih0YXJnZXQuY2xhc3NOYW1lPT1cIm5vdGlmaWNhdGlvbl9ib3hcIil7XHJcbiAgICAgIGNsb3NlTW9kYWwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHZhciBfc2V0VXBMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcclxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm5vdGlmaWNhdGlvbl9jbG9zZScsIF9jbG9zZVBvcHVwKTtcclxuICAgICQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkVudGVyKTtcclxuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcclxuICB9O1xyXG5cclxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGlmICh0aW1lckNsZWFyQWxsIT1udWxsKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lckNsZWFyQWxsKTtcclxuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbihpKXtcclxuICAgICAgdmFyIG9wdGlvbj0kKHRoaXMpLmRhdGEoJ29wdGlvbicpO1xyXG4gICAgICBpZihvcHRpb24udGltZXIpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAxO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24oaSl7XHJcbiAgICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICAgIHZhciBvcHRpb249JHRoaXMuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmKG9wdGlvbi50aW1lPjApIHtcclxuICAgICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQob3B0aW9uLmNsb3NlKSwgb3B0aW9uLnRpbWUgLSAxNTAwICsgMTAwICogaSk7XHJcbiAgICAgICAgJHRoaXMuZGF0YSgnb3B0aW9uJyxvcHRpb24pXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgbW91c2VPdmVyID0gMDtcclxuICB9O1xyXG5cclxuICB2YXIgX2Nsb3NlUG9wdXAgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbigpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcclxuICAgIH0pO1xyXG4gICAgJHRoaXMuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9oaWRlJylcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBhbGVydChkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoYWxlcnRfb3B0LGRhdGEpO1xyXG5cclxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcclxuXHJcbiAgICBub3R5ZnlfY2xhc3M9J25vdGlmeV9ib3ggJztcclxuICAgIGlmKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcys9ZGF0YS5ub3R5ZnlfY2xhc3M7XHJcblxyXG4gICAgYm94X2h0bWw9JzxkaXYgY2xhc3M9XCInK25vdHlmeV9jbGFzcysnXCI+JztcclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcclxuICAgIGJveF9odG1sKz0nPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xyXG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8JytkYXRhLmJ1dHRvblRhZysnIGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIiAnK2RhdGEuYnV0dG9uWWVzRG9wKyc+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvJytkYXRhLmJ1dHRvblRhZysnPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8JytkYXRhLmJ1dHRvblRhZysnIGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiICcrZGF0YS5idXR0b25Ob0RvcCsnPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvJytkYXRhLmJ1dHRvblRhZysnPic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfTtcclxuXHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xyXG5cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LDEwMClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbmZpcm0oZGF0YSl7XHJcbiAgICBpZighZGF0YSlkYXRhPXt9O1xyXG4gICAgZGF0YT1vYmplY3RzKGNvbmZpcm1fb3B0LGRhdGEpO1xyXG5cclxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcclxuXHJcbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3hcIj4nO1xyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnRpdGxlO1xyXG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xyXG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xyXG5cclxuICAgIGlmKGRhdGEuY2FsbGJhY2tZZXMhPWZhbHNlKXtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tZZXMuYmluZChkYXRhLm9iaikpO1xyXG4gICAgfVxyXG4gICAgaWYoZGF0YS5jYWxsYmFja05vIT1mYWxzZSl7XHJcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgfSwxMDApXHJcblxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICB2YXIgb3B0aW9uID0ge3RpbWUgOiAoZGF0YS50aW1lfHxkYXRhLnRpbWU9PT0wKT9kYXRhLnRpbWU6dGltZX07XHJcbiAgICBpZiAoIWNvbnRlaW5lcikge1xyXG4gICAgICBjb250ZWluZXIgPSAkKCc8dWwvPicsIHtcclxuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XHJcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xyXG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9pdGVtJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSl7XHJcbiAgICAgIGxpLmFkZENsYXNzKCdub3RpZmljYXRpb25faXRlbS0nICsgZGF0YS50eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2xvc2U9JCgnPHNwYW4vPicse1xyXG4gICAgICBjbGFzczonbm90aWZpY2F0aW9uX2Nsb3NlJ1xyXG4gICAgfSk7XHJcbiAgICBvcHRpb24uY2xvc2U9Y2xvc2U7XHJcbiAgICBsaS5hcHBlbmQoY2xvc2UpO1xyXG5cclxuICAgIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XHJcbiAgICAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XHJcbiAgICAgIHZhciB0aXRsZSA9ICQoJzxoNS8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRleHQ9ICQoJzxkaXYvPicse1xyXG4gICAgICBjbGFzczpcIm5vdGlmaWNhdGlvbl90ZXh0XCJcclxuICAgIH0pO1xyXG4gICAgdGV4dC5odG1sKGRhdGEubWVzc2FnZSk7XHJcblxyXG4gICAgaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcclxuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcclxuICAgICAgfSk7XHJcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xyXG4gICAgICB2YXIgd3JhcCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgICBjbGFzczogXCJ3cmFwXCJcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB3cmFwLmFwcGVuZChpbWcpO1xyXG4gICAgICB3cmFwLmFwcGVuZCh0ZXh0KTtcclxuICAgICAgY29udGVudC5hcHBlbmQod3JhcCk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgY29udGVudC5hcHBlbmQodGV4dCk7XHJcbiAgICB9XHJcbiAgICBsaS5hcHBlbmQoY29udGVudCk7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xyXG4gICAgLy8gICB2YXIgdGl0bGUgPSAkKCc8cC8+Jywge1xyXG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXHJcbiAgICAvLyAgIH0pO1xyXG4gICAgLy8gICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xyXG4gICAgLy8gICBsaS5hcHBlbmQodGl0bGUpO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuICAgIC8vIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XHJcbiAgICAvLyAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXHJcbiAgICAvLyAgIH0pO1xyXG4gICAgLy8gICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcclxuICAgIC8vICAgbGkuYXBwZW5kKGltZyk7XHJcbiAgICAvLyB9XHJcbiAgICAvL1xyXG4gICAgLy8gdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcclxuICAgIC8vICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXHJcbiAgICAvLyB9KTtcclxuICAgIC8vIGNvbnRlbnQuaHRtbChkYXRhLm1lc3NhZ2UpO1xyXG4gICAgLy9cclxuICAgIC8vIGxpLmFwcGVuZChjb250ZW50KTtcclxuICAgIC8vXHJcbiAgICAgY29udGVpbmVyLmFwcGVuZChsaSk7XHJcblxyXG4gICAgaWYob3B0aW9uLnRpbWU+MCl7XHJcbiAgICAgIG9wdGlvbi50aW1lcj1zZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQoY2xvc2UpLCBvcHRpb24udGltZSk7XHJcbiAgICB9XHJcbiAgICBsaS5kYXRhKCdvcHRpb24nLG9wdGlvbilcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBhbGVydDogYWxlcnQsXHJcbiAgICBjb25maXJtOiBjb25maXJtLFxyXG4gICAgbm90aWZpOiBub3RpZmksXHJcbiAgfTtcclxuXHJcbn0pKCk7XHJcblxyXG5cclxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKXtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXM9JCh0aGlzKTtcclxuICBlbD0kKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XHJcbiAgZGF0YT1lbC5kYXRhKCk7XHJcblxyXG4gIGRhdGEucXVlc3Rpb249ZWwuaHRtbCgpO1xyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywnLm1vZGFsc19vcGVuJyxmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcblxyXG4gICAgICAgIC8v0L/RgNC4INC+0YLQutGA0YvRgtC40Lgg0YTQvtGA0LzRiyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4INC30LDQutGA0YvRgtGMLCDQtdGB0LvQuCDQvtGC0YDRi9GC0L4gLSDQv9C+0L/QsNC/INC40YHQv9C+0LvRjNC30L7QstCw0L3QuNGPINC60YPQv9C+0L3QsCDQsdC10Lcg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuFxyXG4gICAgICAgIHZhciBwb3B1cCA9ICQoXCJhW2hyZWY9JyNzaG93cHJvbW9jb2RlLW5vcmVnaXN0ZXInXVwiKS5kYXRhKCdwb3B1cCcpO1xyXG4gICAgICAgIGlmIChwb3B1cCkge1xyXG4gICAgICAgICAgICBwb3B1cC5jbG9zZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBvcHVwID0gJCgnZGl2LnBvcHVwX2NvbnQsIGRpdi5wb3B1cF9iYWNrJyk7XHJcbiAgICAgICAgICAgIGlmIChwb3B1cCkge1xyXG4gICAgICAgICAgICAgICAgcG9wdXAuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBocmVmPXRoaXMuaHJlZi5zcGxpdCgnIycpO1xyXG4gICAgICAgIGhyZWY9aHJlZltocmVmLmxlbmd0aC0xXTtcclxuXHJcbiAgICAgICAgZGF0YT17XHJcbiAgICAgICAgICAgIGJ1dHRvblllczpmYWxzZSxcclxuICAgICAgICAgICAgbm90eWZ5X2NsYXNzOlwibG9hZGluZyBcIisoaHJlZi5pbmRleE9mKCd2aWRlbycpPT09MD8nbW9kYWxzLWZ1bGxfc2NyZWVuJzonbm90aWZ5X3doaXRlJyksXHJcbiAgICAgICAgICAgIHF1ZXN0aW9uOicnXHJcbiAgICAgICAgfTtcclxuICAgICAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcblxyXG4gICAgICAgICQuZ2V0KCcvJytocmVmLGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAkKCcubm90aWZ5X2JveCcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcclxuICAgICAgICAgICAgYWpheEZvcm0oJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykpO1xyXG4gICAgICAgIH0sJ2pzb24nKTtcclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KVxyXG59KCkpO1xyXG4iLCIkKCcuZm9vdGVyLW1lbnUtdGl0bGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICR0aGlzPSQodGhpcyk7XHJcbiAgaWYoJHRoaXMuaGFzQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKSl7XHJcbiAgICAkdGhpcy5yZW1vdmVDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpXHJcbiAgfWVsc2V7XHJcbiAgICAkKCcuZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpO1xyXG4gIH1cclxuXHJcbn0pOyIsIiQoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIHN0YXJOb21pbmF0aW9uKGluZGV4KSB7XHJcbiAgICB2YXIgc3RhcnMgPSAkKFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiKTtcclxuICAgIHN0YXJzLmFkZENsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5kZXg7IGkrKykge1xyXG4gICAgICBzdGFycy5lcShpKS5yZW1vdmVDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkKGRvY3VtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIHN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xyXG4gIH0pLm9uKFwibW91c2VsZWF2ZVwiLCBcIi5yYXRpbmctd3JhcHBlclwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoKSk7XHJcbiAgfSkub24oXCJjbGlja1wiLCBcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIHN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xyXG5cclxuICAgICQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCQodGhpcykuaW5kZXgoKSArIDEpO1xyXG4gIH0pO1xyXG59KTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gIHZhciAkbm90eWZpX2J0bj0kKCcuaGVhZGVyLWxvZ29fbm90eScpO1xyXG4gIGlmKCRub3R5ZmlfYnRuLmxlbmd0aD09MSlyZXR1cm47XHJcblxyXG4gICQuZ2V0KCcvYWNjb3VudC9ub3RpZmljYXRpb24nLGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgaWYoIWRhdGEubm90aWZpY2F0aW9ucyB8fCBkYXRhLm5vdGlmaWNhdGlvbnMubGVuZ3RoPT0wKSByZXR1cm47XHJcblxyXG4gICAgdmFyIG91dD0nPGRpdiBjbGFzcz1oZWFkZXItbm90eS1ib3g+PHVsIGNsYXNzPVwiaGVhZGVyLW5vdHktbGlzdFwiPic7XHJcbiAgICAkbm90eWZpX2J0bi5maW5kKCdhJykucmVtb3ZlQXR0cignaHJlZicpO1xyXG4gICAgdmFyIGhhc19uZXc9ZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpPTA7aTxkYXRhLm5vdGlmaWNhdGlvbnMubGVuZ3RoO2krKyl7XHJcbiAgICAgIGVsPWRhdGEubm90aWZpY2F0aW9uc1tpXTtcclxuICAgICAgdmFyIGlzX25ldz0oZWwuaXNfdmlld2VkPT0xKTtcclxuICAgICAgb3V0Kz0nPGxpIGNsYXNzPVwiaGVhZGVyLW5vdHktaXRlbScrKGlzX25ldz8nIGhlYWRlci1ub3R5LWl0ZW1fbmV3JzonJykrJ1wiPic7XHJcbiAgICAgIG91dCs9JzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktZGF0YT4nK2VsLmRhdGErJzwvZGl2Pic7XHJcbiAgICAgIG91dCs9JzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktdGV4dD4nK2VsLnRleHQrJzwvZGl2Pic7XHJcbiAgICAgIG91dCs9JzwvbGk+JztcclxuICAgICAgaGFzX25ldz1oYXNfbmV3fHxpc19uZXc7XHJcbiAgICB9XHJcblxyXG4gICAgb3V0Kz0nPC91bD4nO1xyXG4gICAgb3V0Kz0nPGEgY2xhc3M9XCJidG5cIiBocmVmPVwiL2FjY291bnQvbm90aWZpY2F0aW9uXCI+JytkYXRhLmJ0bisnPC9hPic7XHJcbiAgICBvdXQrPSc8L2Rpdj4nO1xyXG4gICAgJCgnLmhlYWRlcicpLmFwcGVuZChvdXQpO1xyXG5cclxuICAgIGlmKGhhc19uZXcpe1xyXG4gICAgICAkbm90eWZpX2J0bi5hZGRDbGFzcygndG9vbHRpcCcpLmFkZENsYXNzKCdoYXMtbm90eScpO1xyXG4gICAgfVxyXG5cclxuICAgICRub3R5ZmlfYnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgaWYoJCgnLmhlYWRlci1ub3R5LWJveCcpLmhhc0NsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpKXtcclxuICAgICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XHJcbiAgICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5hZGRDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuXHJcbiAgICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcygnaGFzLW5vdHknKSl7XHJcbiAgICAgICAgICAkLnBvc3QoJy9hY2NvdW50L25vdGlmaWNhdGlvbicsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgJCgnLmhlYWRlci1sb2dvX25vdHknKS5yZW1vdmVDbGFzcygndG9vbHRpcCcpLnJlbW92ZUNsYXNzKCdoYXMtbm90eScpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5yZW1vdmVDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLW5vdHktbGlzdCcpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSlcclxuICB9LCdqc29uJyk7XHJcblxyXG59KSgpOyIsIi8qKioqKioqKioqKioqKioqKiBJbml0aWF0ZSBGbGV4c2xpZGVyICoqKioqKioqKioqKioqKioqKi9cclxudmFyIHNsaWRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAkKCcuZmxleHNsaWRlcicpLmZsZXhzbGlkZXIoe1xyXG4gICAgICAgIGFuaW1hdGlvbjogXCJzbGlkZVwiLFxyXG4gICAgICAgIHNsaWRlc2hvd1NwZWVkOiAxMDAwMCxcclxuICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogNDAwLFxyXG4gICAgICAgIHBhdXNlT25Ib3ZlcjogdHJ1ZVxyXG4gICAgfSk7XHJcbn0oKTsiLCIvL9C40LfQsdGA0LDQvdC90L7QtVxyXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICQoXCIuc2hvcHMgLmZhdm9yaXRlLWxpbmtcIikub24oJ2NsaWNrJyxmdW5jdGlvbihlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHR5cGUgPSBzZWxmLmF0dHIoXCJkYXRhLXN0YXRlXCIpLFxyXG4gICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmF0dHIoXCJkYXRhLWFmZmlsaWF0ZS1pZFwiKTtcclxuICAgIGlmIChzZWxmLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgc2VsZi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuXHJcbiAgICAvKmlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICBzZWxmLmZpbmQoXCIuaXRlbV9pY29uXCIpLnJlbW92ZUNsYXNzKFwibXV0ZWRcIik7XHJcbiAgICB9Ki9cclxuXHJcbiAgICAkLnBvc3QoXCIvYWNjb3VudC9mYXZvcml0ZXNcIix7XHJcbiAgICAgIFwidHlwZVwiIDogdHlwZSAsXHJcbiAgICAgIFwiYWZmaWxpYXRlX2lkXCI6IGFmZmlsaWF0ZV9pZFxyXG4gICAgfSxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICBpZihkYXRhLmVycm9yKXtcclxuICAgICAgICBzZWxmLmZpbmQoJ3N2ZycpLnJlbW92ZUNsYXNzKFwic3BpblwiKTtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOmRhdGEuZXJyb3IsdHlwZTonZXJyJywndGl0bGUnOihkYXRhLnRpdGxlP2RhdGEudGl0bGU6ZmFsc2UpfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICBtZXNzYWdlOmRhdGEubXNnLFxyXG4gICAgICAgIHR5cGU6J3N1Y2Nlc3MnLFxyXG4gICAgICAgICd0aXRsZSc6KGRhdGEudGl0bGU/ZGF0YS50aXRsZTpmYWxzZSlcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCIuaXRlbV9pY29uXCIpLmFkZENsYXNzKFwic3ZnLW5vLWZpbGxcIik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYuYXR0cih7XHJcbiAgICAgICAgXCJkYXRhLXN0YXRlXCI6IGRhdGFbXCJkYXRhLXN0YXRlXCJdLFxyXG4gICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiOiBkYXRhWydkYXRhLW9yaWdpbmFsLXRpdGxlJ11cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluIHN2Zy1uby1maWxsXCIpO1xyXG4gICAgICB9IGVsc2UgaWYodHlwZSA9PSBcImRlbGV0ZVwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpblwiKS5hZGRDbGFzcyhcInN2Zy1uby1maWxsXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSwnanNvbicpLml0ZW1faWNvbmlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOlwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgK1xyXG4gICAgICBcIiDQv9GA0L7QuNC30LLQtdC00ZHQvdC90L7QtSDQtNC10LnRgdGC0LLQuNC1INC90LXQstC+0LfQvNC+0LbQvdC+LiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1LlwiICtcclxuICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIix0eXBlOidlcnInfSk7XHJcblxyXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikuYWRkQ2xhc3MoXCJzdmctbm8tZmlsbFwiKTtcclxuICAgICAgfVxyXG4gICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluXCIpO1xyXG4gICAgfSlcclxuICB9KTtcclxufSk7IiwidmFyIGhlYWRlckFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2Nyb2xsZWREb3duID0gZmFsc2U7XHJcbiAgICB2YXIgc2hhZG93ZWREb3duID0gZmFsc2U7XHJcblxyXG4gICAgJCgnLm1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgICAgICAkKCcuZHJvcC1tZW51JykuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgIGlmICgkKCcuaGVhZGVyJykuaGFzQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKSkge1xyXG4gICAgICAgICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgJCgnLnNlYXJjaC10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XHJcbiAgICAgICAgJCgnI2F1dG9jb21wbGV0ZScpLmZhZGVPdXQoKTtcclxuICAgICAgICBpZiAoJCgnLmhlYWRlcicpLmhhc0NsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKSkge1xyXG4gICAgICAgICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcjaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpZiAoZS50YXJnZXQuaWQgPT0gJ2hlYWRlcicpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLXNlYXJjaF9mb3JtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJ2Zvcm0nKS5zdWJtaXQoKTtcclxuICAgIH0pO1xyXG5cclxuXHJcblxyXG4gICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lX2Nsb3NlJykuY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLXVwbGluZScpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy50b29sdGlwJykudGlwc28oe1xyXG4gICAgICAgIGJhY2tncm91bmQgOiAnIzRBNEE0QScsXHJcbiAgICAgICAgc2l6ZTogJ3NtYWxsJyxcclxuICAgICAgICBkZWxheTogMTAwLFxyXG4gICAgICAgIHNwZWVkOiAxMDAsXHJcbiAgICAgICAgb25CZWZvcmVTaG93IDogZnVuY3Rpb24oZWxlLCB0aXBzbykge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQgPSBlbGUuZGF0YSgndG9vbHRpcCcpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgICQoJ1tkYXRhLXRvZ2dsZT10b29sdGlwXScpLnRpcHNvKHtcclxuICAgICAgICBiYWNrZ3JvdW5kIDogJyM0QTRBNEEnLFxyXG4gICAgICAgIHNpemU6ICdzbWFsbCcsXHJcbiAgICAgICAgZGVsYXk6IDEwMCxcclxuICAgICAgICBzcGVlZDogMTAwLFxyXG4gICAgICAgIG9uQmVmb3JlU2hvdyA6IGZ1bmN0aW9uKGVsZSwgdGlwc28pIHtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50ID0gZWxlLmRhdGEoJ29yaWdpbmFsLXRpdGxlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgICQod2luZG93KS5vbignbG9hZCByZXNpemUgc2Nyb2xsJyxmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2hhZG93SGVpZ2h0ID0gNTA7XHJcbiAgICAgICAgdmFyIGhpZGVIZWlnaHQgPSAyMDA7XHJcbiAgICAgICAgdmFyIGhlYWRlclNlY29uZExpbmUgPSAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKTtcclxuICAgICAgICB2YXIgaG92ZXJzID0gaGVhZGVyU2Vjb25kTGluZS5maW5kKCc6aG92ZXInKTtcclxuICAgICAgICB2YXIgaGVhZGVyID0gJCgnLmhlYWRlcicpO1xyXG5cclxuICAgICAgICBpZiAoIWhvdmVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgICAgICAgICBoZWFkZXIucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgICAgICAgICAgLy9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXHJcbiAgICAgICAgICAgIHZhciBzY3JvbGxUb3A9JCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG4gICAgICAgICAgICBpZiAoc2Nyb2xsVG9wID4gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHNoYWRvd2VkRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzaGFkb3dlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPD0gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgc2hhZG93ZWREb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzaGFkb3dlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPiBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHNjcm9sbGVkRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzY3JvbGwtZG93bicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPD0gaGlkZUhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgICAgICAgICAgaGVhZGVyLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLm1lbnVfYW5nbGUtZG93bicpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIHBhcmVudCA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudV9ncm91cF9fdXAsIC5tZW51LWdyb3VwJyk7XHJcbiAgICAgICAgdmFyIHBhcmVudE1lbnUgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnUnKTtcclxuICAgICAgICBpZiAocGFyZW50TWVudSkge1xyXG4gICAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgICAgICAgJChwYXJlbnQpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgJChwYXJlbnQpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLmFkZENsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLmFkZENsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgYWNjb3VudE1lbnVUaW1lT3V0ID0gbnVsbDtcclxuICAgICQoJy5hY2NvdW50LW1lbnUtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBtZW51ID0gJCgnLmFjY291bnQtbWVudScpO1xyXG4gICAgICAgIGlmIChtZW51KSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChhY2NvdW50TWVudVRpbWVPdXQpO1xyXG4gICAgICAgICAgICBtZW51LnRvZ2dsZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgaWYgKCFtZW51Lmhhc0NsYXNzKCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgYWNjb3VudE1lbnVUaW1lT3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICB9LCA3MDAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dCcpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgcXVlcnkgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgIHZhciBhdXRvY29tcGxldGUgPSAkKCcjYXV0b2NvbXBsZXRlJyksXHJcbiAgICAgICAgICAgIGF1dG9jb21wbGV0ZUxpc3QgPSAkKGF1dG9jb21wbGV0ZSkuZmluZCgndWwnKTtcclxuICAgICAgICBpZiAocXVlcnkubGVuZ3RoPjEpIHtcclxuICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9zZWFyY2gnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2dldCcsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7cXVlcnk6IHF1ZXJ5fSxcclxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gJzxhIGhyZWY9XCIvc3RvcmVzLycraXRlbS5kYXRhLnJvdXRlKydcIicrJz4nK2l0ZW0udmFsdWUraXRlbS5jYXNoYmFjaysnPC9hPic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaS5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuYXBwZW5kKGxpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZSkuZmFkZUluKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGVMaXN0KS5odG1sKCcnKTtcclxuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSkub24oJ2ZvY3Vzb3V0JyxmdW5jdGlvbigpe1xyXG4gICAgICAgICQoJyNhdXRvY29tcGxldGUnKS5oaWRlKCk7XHJcbiAgICB9KTtcclxuXHJcblxyXG5cclxufSgpO1xyXG5cclxuXHJcblxyXG5cclxuIl19
