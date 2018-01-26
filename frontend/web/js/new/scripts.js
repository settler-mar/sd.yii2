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
          c.text('Cрок действия истёк');
          continue;
        }

        //если срок более 30 дней
        if(d>30*60*60*24){
          c.text('более 30 дней');
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
        c.text(str);
      }
    }

    setInterval(updateClock.bind(clocks),1000);
    updateClock.bind(clocks)();
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsImpxdWVyeS5mbGV4c2xpZGVyLW1pbi5qcyIsInRpcHNvLm1pbi5qcyIsInRvb2x0aXAuanMiLCJub3RpZmljYXRpb24uanMiLCJtb2RhbHMuanMiLCJmb290ZXJfbWVudS5qcyIsInJhdGluZy5qcyIsImFjY291bnRfbm90aWZpY2F0aW9uLmpzIiwic2xpZGVyLmpzIiwiZmF2b3JpdGVzLmpzIiwic2NyaXB0LmpzIiwiY2FsYy1jYXNoYmFjay5qcyIsImF1dG9faGlkZV9jb250cm9sLmpzIiwic2Nyb2xsX3RvLmpzIiwiaGlkZV9zaG93X2FsbC5qcyIsImNvdXBvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaDhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJvYmplY3RzID0gZnVuY3Rpb24gKGEsYikge1xuICAgIHZhciBjID0gYixcbiAgICAgICAga2V5O1xuICAgIGZvciAoa2V5IGluIGEpIHtcbiAgICAgICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGM7XG59O1xuXG5mdW5jdGlvbiBsb2dpbl9yZWRpcmVjdChuZXdfaHJlZil7XG4gICAgaHJlZj1sb2NhdGlvbi5ocmVmO1xuICAgIGlmKGhyZWYuaW5kZXhPZignc3RvcmUnKT4wIHx8IGhyZWYuaW5kZXhPZignY291cG9uJyk+MCl7XG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1lbHNle1xuICAgICAgICBsb2NhdGlvbi5ocmVmPW5ld19ocmVmO1xuICAgIH1cbn1cbiIsIihmdW5jdGlvbiAodywgZCwgJCkge1xuICAgIHZhciBzY3JvbGxzX2Jsb2NrID0gJCgnLnNjcm9sbF9ib3gnKTtcblxuICAgIGlmKHNjcm9sbHNfYmxvY2subGVuZ3RoPT0wKSByZXR1cm47XG4gICAgLy8kKCc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC13cmFwXCI+PC9kaXY+Jykud3JhcEFsbChzY3JvbGxzX2Jsb2NrKTtcbiAgICAkKHNjcm9sbHNfYmxvY2spLndyYXAoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKTtcblxuICAgIGluaXRfc2Nyb2xsKCk7XG4gICAgY2FsY19zY3JvbGwoKTtcblxuICAgIHZhciB0MSx0MjtcblxuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24gKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodDEpO1xuICAgICAgICBjbGVhclRpbWVvdXQodDIpO1xuICAgICAgICB0MT1zZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLDMwMCk7XG4gICAgICAgIHQyPXNldFRpbWVvdXQoY2FsY19zY3JvbGwsODAwKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGluaXRfc2Nyb2xsKCkge1xuICAgICAgICB2YXIgY29udHJvbCA9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sXCI+PC9kaXY+JztcbiAgICAgICAgY29udHJvbD0kKGNvbnRyb2wpO1xuICAgICAgICBjb250cm9sLmluc2VydEFmdGVyKHNjcm9sbHNfYmxvY2spO1xuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApO1xuXG4gICAgICAgIHNjcm9sbHNfYmxvY2sucHJlcGVuZCgnPGRpdiBjbGFzcz1zY3JvbGxfYm94LW1vdmVyPjwvZGl2PicpO1xuXG4gICAgICAgIGNvbnRyb2wub24oJ2NsaWNrJywnLnNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcsZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgIHZhciBjb250cm9sID0gJHRoaXMucGFyZW50KCk7XG4gICAgICAgICAgICB2YXIgaSA9ICR0aGlzLmluZGV4KCk7XG4gICAgICAgICAgICBpZigkdGhpcy5oYXNDbGFzcygnYWN0aXZlJykpcmV0dXJuO1xuICAgICAgICAgICAgY29udHJvbC5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgICAgICAgICB2YXIgZHg9Y29udHJvbC5kYXRhKCdzbGlkZS1keCcpO1xuICAgICAgICAgICAgdmFyIGVsID0gY29udHJvbC5wcmV2KCk7XG4gICAgICAgICAgICBlbC5maW5kKCcuc2Nyb2xsX2JveC1tb3ZlcicpLmNzcygnbWFyZ2luLWxlZnQnLC1keCppKTtcbiAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgaSk7XG5cbiAgICAgICAgICAgIHN0b3BTY3JvbC5iaW5kKGVsKSgpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGopO1xuICAgICAgICBlbC5wYXJlbnQoKS5ob3ZlcihzdG9wU2Nyb2wuYmluZChlbCksc3RhcnRTY3JvbC5iaW5kKGVsKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RhcnRTY3JvbCgpe1xuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKTtcbiAgICAgICAgaWYoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xuXG4gICAgICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUuYmluZCgkdGhpcyksIDIwMDApO1xuICAgICAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLHRpbWVvdXRJZClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdG9wU2Nyb2woKXtcbiAgICAgICAgdmFyICR0aGlzPSQodGhpcyk7XG4gICAgICAgIHZhciB0aW1lb3V0SWQ9JHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJyk7XG4gICAgICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsZmFsc2UpO1xuICAgICAgICBpZighJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSB8fCAhdGltZW91dElkKXJldHVybjtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcbiAgICAgICAgdmFyICR0aGlzPSQodGhpcyk7XG4gICAgICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsZmFsc2UpO1xuICAgICAgICBpZighJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XG5cbiAgICAgICAgdmFyIGNvbnRyb2xzPSR0aGlzLm5leHQoKS5maW5kKCc+KicpO1xuICAgICAgICB2YXIgYWN0aXZlPSR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xuICAgICAgICB2YXIgcG9pbnRfY250PWNvbnRyb2xzLmxlbmd0aDtcbiAgICAgICAgaWYoIWFjdGl2ZSlhY3RpdmU9MDtcbiAgICAgICAgYWN0aXZlKys7XG4gICAgICAgIGlmKGFjdGl2ZT49cG9pbnRfY250KWFjdGl2ZT0wO1xuICAgICAgICAkdGhpcy5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xuXG4gICAgICAgIGNvbnRyb2xzLmVxKGFjdGl2ZSkuY2xpY2soKTtcbiAgICAgICAgc3RhcnRTY3JvbC5iaW5kKCR0aGlzKSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGNfc2Nyb2xsKCkge1xuICAgICAgICBmb3IoaT0wO2k8c2Nyb2xsc19ibG9jay5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGkpO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2wgPSBlbC5uZXh0KCk7XG4gICAgICAgICAgICB2YXIgd2lkdGhfbWF4ID0gZWwuZGF0YSgnc2Nyb2xsLXdpZHRoLW1heCcpO1xuICAgICAgICAgICAgdyA9IGVsLndpZHRoKCk7XG5cbiAgICAgICAgICAgIC8v0LTQtdC70LDQtdC8INC60L7QvdGC0YDQvtC70Ywg0L7Qs9GA0LDQvdC40YfQtdC90LjRjyDRiNC40YDQuNC90YsuINCV0YHQu9C4INC/0YDQtdCy0YvRiNC10L3QviDRgtC+INC+0YLQutC70Y7Rh9Cw0LXQvCDRgdC60YDQvtC7INC4INC/0LXRgNC10YXQvtC00LjQvCDQuiDRgdC70LXQtNGD0Y7RidC10LzRgyDRjdC70LXQvNC10L3RgtGDXG4gICAgICAgICAgICBpZiAod2lkdGhfbWF4ICYmIHcgPiB3aWR0aF9tYXgpIHtcbiAgICAgICAgICAgICAgICBjb250cm9sLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG5vX2NsYXNzID0gZWwuZGF0YSgnc2Nyb2xsLWVsZW1ldC1pZ25vcmUtY2xhc3MnKTtcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IGVsLmZpbmQoJz4qJykubm90KCcuc2Nyb2xsX2JveC1tb3ZlcicpO1xuICAgICAgICAgICAgaWYgKG5vX2NsYXNzKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5ub3QoJy4nICsgbm9fY2xhc3MpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v0JXRgdC70Lgg0L3QtdGCINC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuID09IDApIHtcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBmX2VsPWNoaWxkcmVuLmVxKDEpO1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuX3cgPSBmX2VsLm91dGVyV2lkdGgoKTsgLy/QstGB0LXQs9C+INC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxuICAgICAgICAgICAgY2hpbGRyZW5fdys9cGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLWxlZnQnKSk7XG4gICAgICAgICAgICBjaGlsZHJlbl93Kz1wYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tcmlnaHQnKSk7XG5cbiAgICAgICAgICAgIHZhciBzY3JlYW5fY291bnQgPSBNYXRoLmZsb29yKHcgLyBjaGlsZHJlbl93KTtcblxuICAgICAgICAgICAgLy/QldGB0LvQuCDQstGB0LUg0LLQu9Cw0LfQuNGCINC90LAg0Y3QutGA0LDQvVxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuIDw9IHNjcmVhbl9jb3VudCkge1xuICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/Qo9C20LUg0YLQvtGH0L3QviDQt9C90LDQtdC8INGH0YLQviDRgdC60YDQvtC7INC90YPQttC10L1cbiAgICAgICAgICAgIGVsLmFkZENsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG5cbiAgICAgICAgICAgIHZhciBwb2ludF9jbnQgPSBjaGlsZHJlbi5sZW5ndGggLSBzY3JlYW5fY291bnQgKyAxO1xuICAgICAgICAgICAgLy/QtdGB0LvQuCDQvdC1INC90LDQtNC+INC+0LHQvdC+0LLQu9GP0YLRjCDQutC+0L3RgtGA0L7QuyDRgtC+INCy0YvRhdC+0LTQuNC8LCDQvdC1INC30LDQsdGL0LLQsNGPINC+0LHQvdC+0LLQuNGC0Ywg0YjQuNGA0LjQvdGDINC00L7Rh9C10YDQvdC40YVcbiAgICAgICAgICAgIGlmIChjb250cm9sLmZpbmQoJz4qJykubGVuZ3RoID09IHBvaW50X2NudCkge1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWN0aXZlID0gZWwuZGF0YSgnc2xpZGUtYWN0aXZlJyk7XG4gICAgICAgICAgICBpZiAoIWFjdGl2ZSlhY3RpdmUgPSAwO1xuICAgICAgICAgICAgaWYgKGFjdGl2ZSA+PSBwb2ludF9jbnQpYWN0aXZlID0gcG9pbnRfY250IC0gMTtcbiAgICAgICAgICAgIHZhciBvdXQgPSAnJztcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcG9pbnRfY250OyBqKyspIHtcbiAgICAgICAgICAgICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnKyhqPT1hY3RpdmU/JyBhY3RpdmUnOicnKSsnXCI+PC9kaXY+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRyb2wuaHRtbChvdXQpO1xuXG4gICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XG4gICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWNvdW50JywgcG9pbnRfY250KTtcbiAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcblxuICAgICAgICAgICAgaWYoIWVsLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpKXtcbiAgICAgICAgICAgICAgICBzdGFydFNjcm9sLmJpbmQoZWwpKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSkpOyIsInZhciBhY2NvcmRpb25Db250cm9sID0gJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKTtcblxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcblxuICAgIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgLyppZigkYWNjb3JkaW9uLmhhc0NsYXNzKCdhY2NvcmRpb24tc2xpbScpKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSovXG4gICAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuaGlkZSgzMDApO1xuICAgICAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZigkYWNjb3JkaW9uLmhhc0NsYXNzKCdhY2NvcmRpb24tc2xpbScpKXtcbiAgICAgICAgICAgICRvdGhlcj0kYWNjb3JkaW9uLnBhcmVudCgpLmZpbmQoJy5hY2NvcmRpb24tc2xpbScpO1xuICAgICAgICAgICAgJG90aGVyLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXG4gICAgICAgICAgICAgICAgLmhpZGUoMzAwKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG4gICAgICAgICAgICAkb3RoZXIucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnbGFzdC1vcGVuJyk7XG5cbiAgICAgICAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xuICAgICAgICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnbGFzdC1vcGVuJyk7XG4gICAgICAgIH1cbiAgICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zaG93KDMwMCk7XG4gICAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufSk7XG5hY2NvcmRpb25Db250cm9sLnNob3coKTtcblxuLy/QtNC70Y8gY2J2amQgam5yaHNkZnR2IDEt0LlcbmFjY29yZGlvblNsaW09JCgnLmFjY29yZGlvbi5hY2NvcmRpb24tc2xpbScpO1xuaWYoYWNjb3JkaW9uU2xpbS5sZW5ndGg+MCl7XG4gICAgYWNjb3JkaW9uU2xpbS5wYXJlbnQoKS5maW5kKCcuYWNjb3JkaW9uLXNsaW06Zmlyc3QtY2hpbGQnKVxuICAgICAgICAuYWRkQ2xhc3MoJ29wZW4nKVxuICAgICAgICAuYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpXG4gICAgICAgIC5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKVxuICAgICAgICAgICAgLnNob3coMzAwKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcbn1cbiIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xuICB2YXIgZmlsZUFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiA/IHRydWUgOiBmYWxzZTtcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcicsXG4gIH07XG5cbiAgZnVuY3Rpb24gb25Qb3N0KHBvc3Qpe1xuICAgIHZhciBkYXRhPXRoaXM7XG4gICAgZm9ybT1kYXRhLmZvcm07XG4gICAgd3JhcD1kYXRhLndyYXA7XG4gICAgaWYocG9zdC5yZW5kZXIpe1xuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3M9XCJub3RpZnlfd2hpdGVcIjtcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcbiAgICB9ZWxzZXtcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xuICAgICAgYWpheEZvcm0od3JhcCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25GYWlsKCl7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBmb3JtPWRhdGEuZm9ybTtcbiAgICB3cmFwPWRhdGEud3JhcDtcbiAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgd3JhcC5odG1sKCc8aDM+0KPQv9GBLi4uINCS0L7Qt9C90LjQutC70LAg0L3QtdC/0YDQtdC00LLQuNC00LXQvdC90LDRjyDQvtGI0LjQsdC60LA8aDM+JyArXG4gICAgICAnPHA+0KfQsNGB0YLQviDRjdGC0L4g0L/RgNC+0LjRgdGF0L7QtNC40YIg0LIg0YHQu9GD0YfQsNC1LCDQtdGB0LvQuCDQstGLINC90LXRgdC60L7Qu9GM0LrQviDRgNCw0Lcg0L/QvtC00YDRj9C0INC90LXQstC10YDQvdC+INCy0LLQtdC70Lgg0YHQstC+0Lgg0YPRh9C10YLQvdGL0LUg0LTQsNC90L3Ri9C1LiDQndC+INCy0L7Qt9C80L7QttC90Ysg0Lgg0LTRgNGD0LPQuNC1INC/0YDQuNGH0LjQvdGLLiDQkiDQu9GO0LHQvtC8INGB0LvRg9GH0LDQtSDQvdC1INGA0LDRgdGB0YLRgNCw0LjQstCw0LnRgtC10YHRjCDQuCDQv9GA0L7RgdGC0L4g0L7QsdGA0LDRgtC40YLQtdGB0Ywg0Log0L3QsNGI0LXQvNGDINC+0L/QtdGA0LDRgtC+0YDRgyDRgdC70YPQttCx0Ysg0L/QvtC00LTQtdGA0LbQutC4LjwvcD48YnI+JyArXG4gICAgICAnPHA+0KHQv9Cw0YHQuNCx0L4uPC9wPicpO1xuICAgIGFqYXhGb3JtKHdyYXApO1xuXG4gIH1cblxuICBmdW5jdGlvbiBvblN1Ym1pdChlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBmb3JtPWRhdGEuZm9ybTtcbiAgICB3cmFwPWRhdGEud3JhcDtcblxuICAgIGlmKGZvcm0ueWlpQWN0aXZlRm9ybSl7XG4gICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJyk7XG4gICAgfTtcblxuICAgIGlzVmFsaWQ9KGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGg9PTApO1xuXG4gICAgaWYoIWlzVmFsaWQpe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1lbHNle1xuICAgICAgcmVxdWlyZWQ9Zm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCcpO1xuICAgICAgZm9yKGk9MDtpPHJlcXVpcmVkLmxlbmd0aDtpKyspe1xuICAgICAgICBpZihyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGg8MSl7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZighZm9ybS5zZXJpYWxpemVPYmplY3QpYWRkU1JPKCk7XG5cbiAgICB2YXIgcG9zdD1mb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xuICAgIGZvcm0uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICBmb3JtLmh0bWwoJycpO1xuICAgIHdyYXAuaHRtbCgnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxwPtCe0YLQv9GA0LDQstC60LAg0LTQsNC90L3Ri9GFPC9wPjwvZGl2PicpO1xuXG4gICAgZGF0YS51cmwrPShkYXRhLnVybC5pbmRleE9mKCc/Jyk+MD8nJic6Jz8nKSsncmM9JytNYXRoLnJhbmRvbSgpO1xuXG4gICAgJC5wb3N0KFxuICAgICAgZGF0YS51cmwsXG4gICAgICBwb3N0LFxuICAgICAgb25Qb3N0LmJpbmQoZGF0YSksXG4gICAgICAnanNvbidcbiAgICApLmZhaWwob25GYWlsLmJpbmQoZGF0YSkpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxuICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpO1xuXG4gIGZvcih2YXIgaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xuICAgIHdyYXA9ZWxzLmVxKGkpO1xuICAgIGZvcm09d3JhcC5maW5kKCdmb3JtJyk7XG4gICAgZGF0YT17XG4gICAgICBmb3JtOmZvcm0sXG4gICAgICBwYXJhbTpkZWZhdWx0cyxcbiAgICAgIHdyYXA6d3JhcFxuICAgIH07XG4gICAgZGF0YS51cmw9Zm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xuICAgIGRhdGEubWV0aG9kPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcbiAgICBmb3JtLm9mZignc3VibWl0Jyk7XG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkU1JPKCl7XG4gICQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvID0ge307XG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgJC5lYWNoKGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xuICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xuICAgICAgICB9XG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbztcbiAgfTtcbn07XG5hZGRTUk8oKTsiLCIvKlxuICogalF1ZXJ5IEZsZXhTbGlkZXIgdjIuNi40XG4gKiBDb3B5cmlnaHQgMjAxMiBXb29UaGVtZXNcbiAqIENvbnRyaWJ1dGluZyBBdXRob3I6IFR5bGVyIFNtaXRoXG4gKi8hZnVuY3Rpb24oJCl7dmFyIGU9ITA7JC5mbGV4c2xpZGVyPWZ1bmN0aW9uKHQsYSl7dmFyIG49JCh0KTtuLnZhcnM9JC5leHRlbmQoe30sJC5mbGV4c2xpZGVyLmRlZmF1bHRzLGEpO3ZhciBpPW4udmFycy5uYW1lc3BhY2Uscj13aW5kb3cubmF2aWdhdG9yJiZ3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQmJndpbmRvdy5NU0dlc3R1cmUscz0oXCJvbnRvdWNoc3RhcnRcImluIHdpbmRvd3x8cnx8d2luZG93LkRvY3VtZW50VG91Y2gmJmRvY3VtZW50IGluc3RhbmNlb2YgRG9jdW1lbnRUb3VjaCkmJm4udmFycy50b3VjaCxvPVwiY2xpY2sgdG91Y2hlbmQgTVNQb2ludGVyVXAga2V5dXBcIixsPVwiXCIsYyxkPVwidmVydGljYWxcIj09PW4udmFycy5kaXJlY3Rpb24sdT1uLnZhcnMucmV2ZXJzZSx2PW4udmFycy5pdGVtV2lkdGg+MCxwPVwiZmFkZVwiPT09bi52YXJzLmFuaW1hdGlvbixtPVwiXCIhPT1uLnZhcnMuYXNOYXZGb3IsZj17fTskLmRhdGEodCxcImZsZXhzbGlkZXJcIixuKSxmPXtpbml0OmZ1bmN0aW9uKCl7bi5hbmltYXRpbmc9ITEsbi5jdXJyZW50U2xpZGU9cGFyc2VJbnQobi52YXJzLnN0YXJ0QXQ/bi52YXJzLnN0YXJ0QXQ6MCwxMCksaXNOYU4obi5jdXJyZW50U2xpZGUpJiYobi5jdXJyZW50U2xpZGU9MCksbi5hbmltYXRpbmdUbz1uLmN1cnJlbnRTbGlkZSxuLmF0RW5kPTA9PT1uLmN1cnJlbnRTbGlkZXx8bi5jdXJyZW50U2xpZGU9PT1uLmxhc3Qsbi5jb250YWluZXJTZWxlY3Rvcj1uLnZhcnMuc2VsZWN0b3Iuc3Vic3RyKDAsbi52YXJzLnNlbGVjdG9yLnNlYXJjaChcIiBcIikpLG4uc2xpZGVzPSQobi52YXJzLnNlbGVjdG9yLG4pLG4uY29udGFpbmVyPSQobi5jb250YWluZXJTZWxlY3RvcixuKSxuLmNvdW50PW4uc2xpZGVzLmxlbmd0aCxuLnN5bmNFeGlzdHM9JChuLnZhcnMuc3luYykubGVuZ3RoPjAsXCJzbGlkZVwiPT09bi52YXJzLmFuaW1hdGlvbiYmKG4udmFycy5hbmltYXRpb249XCJzd2luZ1wiKSxuLnByb3A9ZD9cInRvcFwiOlwibWFyZ2luTGVmdFwiLG4uYXJncz17fSxuLm1hbnVhbFBhdXNlPSExLG4uc3RvcHBlZD0hMSxuLnN0YXJ0ZWQ9ITEsbi5zdGFydFRpbWVvdXQ9bnVsbCxuLnRyYW5zaXRpb25zPSFuLnZhcnMudmlkZW8mJiFwJiZuLnZhcnMudXNlQ1NTJiZmdW5jdGlvbigpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdD1bXCJwZXJzcGVjdGl2ZVByb3BlcnR5XCIsXCJXZWJraXRQZXJzcGVjdGl2ZVwiLFwiTW96UGVyc3BlY3RpdmVcIixcIk9QZXJzcGVjdGl2ZVwiLFwibXNQZXJzcGVjdGl2ZVwiXTtmb3IodmFyIGEgaW4gdClpZih2b2lkIDAhPT1lLnN0eWxlW3RbYV1dKXJldHVybiBuLnBmeD10W2FdLnJlcGxhY2UoXCJQZXJzcGVjdGl2ZVwiLFwiXCIpLnRvTG93ZXJDYXNlKCksbi5wcm9wPVwiLVwiK24ucGZ4K1wiLXRyYW5zZm9ybVwiLCEwO3JldHVybiExfSgpLG4uZW5zdXJlQW5pbWF0aW9uRW5kPVwiXCIsXCJcIiE9PW4udmFycy5jb250cm9sc0NvbnRhaW5lciYmKG4uY29udHJvbHNDb250YWluZXI9JChuLnZhcnMuY29udHJvbHNDb250YWluZXIpLmxlbmd0aD4wJiYkKG4udmFycy5jb250cm9sc0NvbnRhaW5lcikpLFwiXCIhPT1uLnZhcnMubWFudWFsQ29udHJvbHMmJihuLm1hbnVhbENvbnRyb2xzPSQobi52YXJzLm1hbnVhbENvbnRyb2xzKS5sZW5ndGg+MCYmJChuLnZhcnMubWFudWFsQ29udHJvbHMpKSxcIlwiIT09bi52YXJzLmN1c3RvbURpcmVjdGlvbk5hdiYmKG4uY3VzdG9tRGlyZWN0aW9uTmF2PTI9PT0kKG4udmFycy5jdXN0b21EaXJlY3Rpb25OYXYpLmxlbmd0aCYmJChuLnZhcnMuY3VzdG9tRGlyZWN0aW9uTmF2KSksbi52YXJzLnJhbmRvbWl6ZSYmKG4uc2xpZGVzLnNvcnQoZnVuY3Rpb24oKXtyZXR1cm4gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKS0uNX0pLG4uY29udGFpbmVyLmVtcHR5KCkuYXBwZW5kKG4uc2xpZGVzKSksbi5kb01hdGgoKSxuLnNldHVwKFwiaW5pdFwiKSxuLnZhcnMuY29udHJvbE5hdiYmZi5jb250cm9sTmF2LnNldHVwKCksbi52YXJzLmRpcmVjdGlvbk5hdiYmZi5kaXJlY3Rpb25OYXYuc2V0dXAoKSxuLnZhcnMua2V5Ym9hcmQmJigxPT09JChuLmNvbnRhaW5lclNlbGVjdG9yKS5sZW5ndGh8fG4udmFycy5tdWx0aXBsZUtleWJvYXJkKSYmJChkb2N1bWVudCkuYmluZChcImtleXVwXCIsZnVuY3Rpb24oZSl7dmFyIHQ9ZS5rZXlDb2RlO2lmKCFuLmFuaW1hdGluZyYmKDM5PT09dHx8Mzc9PT10KSl7dmFyIGE9Mzk9PT10P24uZ2V0VGFyZ2V0KFwibmV4dFwiKTozNz09PXQmJm4uZ2V0VGFyZ2V0KFwicHJldlwiKTtuLmZsZXhBbmltYXRlKGEsbi52YXJzLnBhdXNlT25BY3Rpb24pfX0pLG4udmFycy5tb3VzZXdoZWVsJiZuLmJpbmQoXCJtb3VzZXdoZWVsXCIsZnVuY3Rpb24oZSx0LGEsaSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciByPXQ8MD9uLmdldFRhcmdldChcIm5leHRcIik6bi5nZXRUYXJnZXQoXCJwcmV2XCIpO24uZmxleEFuaW1hdGUocixuLnZhcnMucGF1c2VPbkFjdGlvbil9KSxuLnZhcnMucGF1c2VQbGF5JiZmLnBhdXNlUGxheS5zZXR1cCgpLG4udmFycy5zbGlkZXNob3cmJm4udmFycy5wYXVzZUludmlzaWJsZSYmZi5wYXVzZUludmlzaWJsZS5pbml0KCksbi52YXJzLnNsaWRlc2hvdyYmKG4udmFycy5wYXVzZU9uSG92ZXImJm4uaG92ZXIoZnVuY3Rpb24oKXtuLm1hbnVhbFBsYXl8fG4ubWFudWFsUGF1c2V8fG4ucGF1c2UoKX0sZnVuY3Rpb24oKXtuLm1hbnVhbFBhdXNlfHxuLm1hbnVhbFBsYXl8fG4uc3RvcHBlZHx8bi5wbGF5KCl9KSxuLnZhcnMucGF1c2VJbnZpc2libGUmJmYucGF1c2VJbnZpc2libGUuaXNIaWRkZW4oKXx8KG4udmFycy5pbml0RGVsYXk+MD9uLnN0YXJ0VGltZW91dD1zZXRUaW1lb3V0KG4ucGxheSxuLnZhcnMuaW5pdERlbGF5KTpuLnBsYXkoKSkpLG0mJmYuYXNOYXYuc2V0dXAoKSxzJiZuLnZhcnMudG91Y2gmJmYudG91Y2goKSwoIXB8fHAmJm4udmFycy5zbW9vdGhIZWlnaHQpJiYkKHdpbmRvdykuYmluZChcInJlc2l6ZSBvcmllbnRhdGlvbmNoYW5nZSBmb2N1c1wiLGYucmVzaXplKCkpLG4uZmluZChcImltZ1wiKS5hdHRyKFwiZHJhZ2dhYmxlXCIsXCJmYWxzZVwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bi52YXJzLnN0YXJ0KG4pfSwyMDApfSxhc05hdjp7c2V0dXA6ZnVuY3Rpb24oKXtuLmFzTmF2PSEwLG4uYW5pbWF0aW5nVG89TWF0aC5mbG9vcihuLmN1cnJlbnRTbGlkZS9uLm1vdmUpLG4uY3VycmVudEl0ZW09bi5jdXJyZW50U2xpZGUsbi5zbGlkZXMucmVtb3ZlQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKS5lcShuLmN1cnJlbnRJdGVtKS5hZGRDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLHI/KHQuX3NsaWRlcj1uLG4uc2xpZGVzLmVhY2goZnVuY3Rpb24oKXt2YXIgZT10aGlzO2UuX2dlc3R1cmU9bmV3IE1TR2VzdHVyZSxlLl9nZXN0dXJlLnRhcmdldD1lLGUuYWRkRXZlbnRMaXN0ZW5lcihcIk1TUG9pbnRlckRvd25cIixmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCksZS5jdXJyZW50VGFyZ2V0Ll9nZXN0dXJlJiZlLmN1cnJlbnRUYXJnZXQuX2dlc3R1cmUuYWRkUG9pbnRlcihlLnBvaW50ZXJJZCl9LCExKSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJNU0dlc3R1cmVUYXBcIixmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCk7dmFyIHQ9JCh0aGlzKSxhPXQuaW5kZXgoKTskKG4udmFycy5hc05hdkZvcikuZGF0YShcImZsZXhzbGlkZXJcIikuYW5pbWF0aW5nfHx0Lmhhc0NsYXNzKFwiYWN0aXZlXCIpfHwobi5kaXJlY3Rpb249bi5jdXJyZW50SXRlbTxhP1wibmV4dFwiOlwicHJldlwiLG4uZmxleEFuaW1hdGUoYSxuLnZhcnMucGF1c2VPbkFjdGlvbiwhMSwhMCwhMCkpfSl9KSk6bi5zbGlkZXMub24obyxmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCk7dmFyIHQ9JCh0aGlzKSxhPXQuaW5kZXgoKTt0Lm9mZnNldCgpLmxlZnQtJChuKS5zY3JvbGxMZWZ0KCk8PTAmJnQuaGFzQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKT9uLmZsZXhBbmltYXRlKG4uZ2V0VGFyZ2V0KFwicHJldlwiKSwhMCk6JChuLnZhcnMuYXNOYXZGb3IpLmRhdGEoXCJmbGV4c2xpZGVyXCIpLmFuaW1hdGluZ3x8dC5oYXNDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpfHwobi5kaXJlY3Rpb249bi5jdXJyZW50SXRlbTxhP1wibmV4dFwiOlwicHJldlwiLG4uZmxleEFuaW1hdGUoYSxuLnZhcnMucGF1c2VPbkFjdGlvbiwhMSwhMCwhMCkpfSl9fSxjb250cm9sTmF2OntzZXR1cDpmdW5jdGlvbigpe24ubWFudWFsQ29udHJvbHM/Zi5jb250cm9sTmF2LnNldHVwTWFudWFsKCk6Zi5jb250cm9sTmF2LnNldHVwUGFnaW5nKCl9LHNldHVwUGFnaW5nOmZ1bmN0aW9uKCl7dmFyIGU9XCJ0aHVtYm5haWxzXCI9PT1uLnZhcnMuY29udHJvbE5hdj9cImNvbnRyb2wtdGh1bWJzXCI6XCJjb250cm9sLXBhZ2luZ1wiLHQ9MSxhLHI7aWYobi5jb250cm9sTmF2U2NhZmZvbGQ9JCgnPG9sIGNsYXNzPVwiJytpK1wiY29udHJvbC1uYXYgXCIraStlKydcIj48L29sPicpLG4ucGFnaW5nQ291bnQ+MSlmb3IodmFyIHM9MDtzPG4ucGFnaW5nQ291bnQ7cysrKXtyPW4uc2xpZGVzLmVxKHMpLHZvaWQgMD09PXIuYXR0cihcImRhdGEtdGh1bWItYWx0XCIpJiZyLmF0dHIoXCJkYXRhLXRodW1iLWFsdFwiLFwiXCIpO3ZhciBjPVwiXCIhPT1yLmF0dHIoXCJkYXRhLXRodW1iLWFsdFwiKT9jPScgYWx0PVwiJytyLmF0dHIoXCJkYXRhLXRodW1iLWFsdFwiKSsnXCInOlwiXCI7aWYoYT1cInRodW1ibmFpbHNcIj09PW4udmFycy5jb250cm9sTmF2Pyc8aW1nIHNyYz1cIicrci5hdHRyKFwiZGF0YS10aHVtYlwiKSsnXCInK2MrXCIvPlwiOic8YSBocmVmPVwiI1wiPicrdCtcIjwvYT5cIixcInRodW1ibmFpbHNcIj09PW4udmFycy5jb250cm9sTmF2JiYhMD09PW4udmFycy50aHVtYkNhcHRpb25zKXt2YXIgZD1yLmF0dHIoXCJkYXRhLXRodW1iY2FwdGlvblwiKTtcIlwiIT09ZCYmdm9pZCAwIT09ZCYmKGErPSc8c3BhbiBjbGFzcz1cIicraSsnY2FwdGlvblwiPicrZCtcIjwvc3Bhbj5cIil9bi5jb250cm9sTmF2U2NhZmZvbGQuYXBwZW5kKFwiPGxpPlwiK2ErXCI8L2xpPlwiKSx0Kyt9bi5jb250cm9sc0NvbnRhaW5lcj8kKG4uY29udHJvbHNDb250YWluZXIpLmFwcGVuZChuLmNvbnRyb2xOYXZTY2FmZm9sZCk6bi5hcHBlbmQobi5jb250cm9sTmF2U2NhZmZvbGQpLGYuY29udHJvbE5hdi5zZXQoKSxmLmNvbnRyb2xOYXYuYWN0aXZlKCksbi5jb250cm9sTmF2U2NhZmZvbGQuZGVsZWdhdGUoXCJhLCBpbWdcIixvLGZ1bmN0aW9uKGUpe2lmKGUucHJldmVudERlZmF1bHQoKSxcIlwiPT09bHx8bD09PWUudHlwZSl7dmFyIHQ9JCh0aGlzKSxhPW4uY29udHJvbE5hdi5pbmRleCh0KTt0Lmhhc0NsYXNzKGkrXCJhY3RpdmVcIil8fChuLmRpcmVjdGlvbj1hPm4uY3VycmVudFNsaWRlP1wibmV4dFwiOlwicHJldlwiLG4uZmxleEFuaW1hdGUoYSxuLnZhcnMucGF1c2VPbkFjdGlvbikpfVwiXCI9PT1sJiYobD1lLnR5cGUpLGYuc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHNldHVwTWFudWFsOmZ1bmN0aW9uKCl7bi5jb250cm9sTmF2PW4ubWFudWFsQ29udHJvbHMsZi5jb250cm9sTmF2LmFjdGl2ZSgpLG4uY29udHJvbE5hdi5iaW5kKG8sZnVuY3Rpb24oZSl7aWYoZS5wcmV2ZW50RGVmYXVsdCgpLFwiXCI9PT1sfHxsPT09ZS50eXBlKXt2YXIgdD0kKHRoaXMpLGE9bi5jb250cm9sTmF2LmluZGV4KHQpO3QuaGFzQ2xhc3MoaStcImFjdGl2ZVwiKXx8KGE+bi5jdXJyZW50U2xpZGU/bi5kaXJlY3Rpb249XCJuZXh0XCI6bi5kaXJlY3Rpb249XCJwcmV2XCIsbi5mbGV4QW5pbWF0ZShhLG4udmFycy5wYXVzZU9uQWN0aW9uKSl9XCJcIj09PWwmJihsPWUudHlwZSksZi5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sc2V0OmZ1bmN0aW9uKCl7dmFyIGU9XCJ0aHVtYm5haWxzXCI9PT1uLnZhcnMuY29udHJvbE5hdj9cImltZ1wiOlwiYVwiO24uY29udHJvbE5hdj0kKFwiLlwiK2krXCJjb250cm9sLW5hdiBsaSBcIitlLG4uY29udHJvbHNDb250YWluZXI/bi5jb250cm9sc0NvbnRhaW5lcjpuKX0sYWN0aXZlOmZ1bmN0aW9uKCl7bi5jb250cm9sTmF2LnJlbW92ZUNsYXNzKGkrXCJhY3RpdmVcIikuZXEobi5hbmltYXRpbmdUbykuYWRkQ2xhc3MoaStcImFjdGl2ZVwiKX0sdXBkYXRlOmZ1bmN0aW9uKGUsdCl7bi5wYWdpbmdDb3VudD4xJiZcImFkZFwiPT09ZT9uLmNvbnRyb2xOYXZTY2FmZm9sZC5hcHBlbmQoJCgnPGxpPjxhIGhyZWY9XCIjXCI+JytuLmNvdW50K1wiPC9hPjwvbGk+XCIpKToxPT09bi5wYWdpbmdDb3VudD9uLmNvbnRyb2xOYXZTY2FmZm9sZC5maW5kKFwibGlcIikucmVtb3ZlKCk6bi5jb250cm9sTmF2LmVxKHQpLmNsb3Nlc3QoXCJsaVwiKS5yZW1vdmUoKSxmLmNvbnRyb2xOYXYuc2V0KCksbi5wYWdpbmdDb3VudD4xJiZuLnBhZ2luZ0NvdW50IT09bi5jb250cm9sTmF2Lmxlbmd0aD9uLnVwZGF0ZSh0LGUpOmYuY29udHJvbE5hdi5hY3RpdmUoKX19LGRpcmVjdGlvbk5hdjp7c2V0dXA6ZnVuY3Rpb24oKXt2YXIgZT0kKCc8dWwgY2xhc3M9XCInK2krJ2RpcmVjdGlvbi1uYXZcIj48bGkgY2xhc3M9XCInK2krJ25hdi1wcmV2XCI+PGEgY2xhc3M9XCInK2krJ3ByZXZcIiBocmVmPVwiI1wiPicrbi52YXJzLnByZXZUZXh0Kyc8L2E+PC9saT48bGkgY2xhc3M9XCInK2krJ25hdi1uZXh0XCI+PGEgY2xhc3M9XCInK2krJ25leHRcIiBocmVmPVwiI1wiPicrbi52YXJzLm5leHRUZXh0K1wiPC9hPjwvbGk+PC91bD5cIik7bi5jdXN0b21EaXJlY3Rpb25OYXY/bi5kaXJlY3Rpb25OYXY9bi5jdXN0b21EaXJlY3Rpb25OYXY6bi5jb250cm9sc0NvbnRhaW5lcj8oJChuLmNvbnRyb2xzQ29udGFpbmVyKS5hcHBlbmQoZSksbi5kaXJlY3Rpb25OYXY9JChcIi5cIitpK1wiZGlyZWN0aW9uLW5hdiBsaSBhXCIsbi5jb250cm9sc0NvbnRhaW5lcikpOihuLmFwcGVuZChlKSxuLmRpcmVjdGlvbk5hdj0kKFwiLlwiK2krXCJkaXJlY3Rpb24tbmF2IGxpIGFcIixuKSksZi5kaXJlY3Rpb25OYXYudXBkYXRlKCksbi5kaXJlY3Rpb25OYXYuYmluZChvLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt2YXIgdDtcIlwiIT09bCYmbCE9PWUudHlwZXx8KHQ9JCh0aGlzKS5oYXNDbGFzcyhpK1wibmV4dFwiKT9uLmdldFRhcmdldChcIm5leHRcIik6bi5nZXRUYXJnZXQoXCJwcmV2XCIpLG4uZmxleEFuaW1hdGUodCxuLnZhcnMucGF1c2VPbkFjdGlvbikpLFwiXCI9PT1sJiYobD1lLnR5cGUpLGYuc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHVwZGF0ZTpmdW5jdGlvbigpe3ZhciBlPWkrXCJkaXNhYmxlZFwiOzE9PT1uLnBhZ2luZ0NvdW50P24uZGlyZWN0aW9uTmF2LmFkZENsYXNzKGUpLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIik6bi52YXJzLmFuaW1hdGlvbkxvb3A/bi5kaXJlY3Rpb25OYXYucmVtb3ZlQ2xhc3MoZSkucmVtb3ZlQXR0cihcInRhYmluZGV4XCIpOjA9PT1uLmFuaW1hdGluZ1RvP24uZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLmZpbHRlcihcIi5cIitpK1wicHJldlwiKS5hZGRDbGFzcyhlKS5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpOm4uYW5pbWF0aW5nVG89PT1uLmxhc3Q/bi5kaXJlY3Rpb25OYXYucmVtb3ZlQ2xhc3MoZSkuZmlsdGVyKFwiLlwiK2krXCJuZXh0XCIpLmFkZENsYXNzKGUpLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIik6bi5kaXJlY3Rpb25OYXYucmVtb3ZlQ2xhc3MoZSkucmVtb3ZlQXR0cihcInRhYmluZGV4XCIpfX0scGF1c2VQbGF5OntzZXR1cDpmdW5jdGlvbigpe3ZhciBlPSQoJzxkaXYgY2xhc3M9XCInK2krJ3BhdXNlcGxheVwiPjxhIGhyZWY9XCIjXCI+PC9hPjwvZGl2PicpO24uY29udHJvbHNDb250YWluZXI/KG4uY29udHJvbHNDb250YWluZXIuYXBwZW5kKGUpLG4ucGF1c2VQbGF5PSQoXCIuXCIraStcInBhdXNlcGxheSBhXCIsbi5jb250cm9sc0NvbnRhaW5lcikpOihuLmFwcGVuZChlKSxuLnBhdXNlUGxheT0kKFwiLlwiK2krXCJwYXVzZXBsYXkgYVwiLG4pKSxmLnBhdXNlUGxheS51cGRhdGUobi52YXJzLnNsaWRlc2hvdz9pK1wicGF1c2VcIjppK1wicGxheVwiKSxuLnBhdXNlUGxheS5iaW5kKG8sZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpLFwiXCIhPT1sJiZsIT09ZS50eXBlfHwoJCh0aGlzKS5oYXNDbGFzcyhpK1wicGF1c2VcIik/KG4ubWFudWFsUGF1c2U9ITAsbi5tYW51YWxQbGF5PSExLG4ucGF1c2UoKSk6KG4ubWFudWFsUGF1c2U9ITEsbi5tYW51YWxQbGF5PSEwLG4ucGxheSgpKSksXCJcIj09PWwmJihsPWUudHlwZSksZi5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sdXBkYXRlOmZ1bmN0aW9uKGUpe1wicGxheVwiPT09ZT9uLnBhdXNlUGxheS5yZW1vdmVDbGFzcyhpK1wicGF1c2VcIikuYWRkQ2xhc3MoaStcInBsYXlcIikuaHRtbChuLnZhcnMucGxheVRleHQpOm4ucGF1c2VQbGF5LnJlbW92ZUNsYXNzKGkrXCJwbGF5XCIpLmFkZENsYXNzKGkrXCJwYXVzZVwiKS5odG1sKG4udmFycy5wYXVzZVRleHQpfX0sdG91Y2g6ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCksbi5hbmltYXRpbmc/ZS5wcmV2ZW50RGVmYXVsdCgpOihuLnBhdXNlKCksdC5fZ2VzdHVyZS5hZGRQb2ludGVyKGUucG9pbnRlcklkKSxUPTAsYz1kP24uaDpuLncsZj1OdW1iZXIobmV3IERhdGUpLGw9diYmdSYmbi5hbmltYXRpbmdUbz09PW4ubGFzdD8wOnYmJnU/bi5saW1pdC0obi5pdGVtVytuLnZhcnMuaXRlbU1hcmdpbikqbi5tb3ZlKm4uYW5pbWF0aW5nVG86diYmbi5jdXJyZW50U2xpZGU9PT1uLmxhc3Q/bi5saW1pdDp2PyhuLml0ZW1XK24udmFycy5pdGVtTWFyZ2luKSpuLm1vdmUqbi5jdXJyZW50U2xpZGU6dT8obi5sYXN0LW4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQpKmM6KG4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQpKmMpfWZ1bmN0aW9uIGEoZSl7ZS5zdG9wUHJvcGFnYXRpb24oKTt2YXIgYT1lLnRhcmdldC5fc2xpZGVyO2lmKGEpe3ZhciBuPS1lLnRyYW5zbGF0aW9uWCxpPS1lLnRyYW5zbGF0aW9uWTtpZihUKz1kP2k6bixtPVQseT1kP01hdGguYWJzKFQpPE1hdGguYWJzKC1uKTpNYXRoLmFicyhUKTxNYXRoLmFicygtaSksZS5kZXRhaWw9PT1lLk1TR0VTVFVSRV9GTEFHX0lORVJUSUEpcmV0dXJuIHZvaWQgc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCl7dC5fZ2VzdHVyZS5zdG9wKCl9KTsoIXl8fE51bWJlcihuZXcgRGF0ZSktZj41MDApJiYoZS5wcmV2ZW50RGVmYXVsdCgpLCFwJiZhLnRyYW5zaXRpb25zJiYoYS52YXJzLmFuaW1hdGlvbkxvb3B8fChtPVQvKDA9PT1hLmN1cnJlbnRTbGlkZSYmVDwwfHxhLmN1cnJlbnRTbGlkZT09PWEubGFzdCYmVD4wP01hdGguYWJzKFQpL2MrMjoxKSksYS5zZXRQcm9wcyhsK20sXCJzZXRUb3VjaFwiKSkpfX1mdW5jdGlvbiBpKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCk7dmFyIHQ9ZS50YXJnZXQuX3NsaWRlcjtpZih0KXtpZih0LmFuaW1hdGluZ1RvPT09dC5jdXJyZW50U2xpZGUmJiF5JiZudWxsIT09bSl7dmFyIGE9dT8tbTptLG49YT4wP3QuZ2V0VGFyZ2V0KFwibmV4dFwiKTp0LmdldFRhcmdldChcInByZXZcIik7dC5jYW5BZHZhbmNlKG4pJiYoTnVtYmVyKG5ldyBEYXRlKS1mPDU1MCYmTWF0aC5hYnMoYSk+NTB8fE1hdGguYWJzKGEpPmMvMik/dC5mbGV4QW5pbWF0ZShuLHQudmFycy5wYXVzZU9uQWN0aW9uKTpwfHx0LmZsZXhBbmltYXRlKHQuY3VycmVudFNsaWRlLHQudmFycy5wYXVzZU9uQWN0aW9uLCEwKX1zPW51bGwsbz1udWxsLG09bnVsbCxsPW51bGwsVD0wfX12YXIgcyxvLGwsYyxtLGYsZyxoLFMseT0hMSx4PTAsYj0wLFQ9MDtyPyh0LnN0eWxlLm1zVG91Y2hBY3Rpb249XCJub25lXCIsdC5fZ2VzdHVyZT1uZXcgTVNHZXN0dXJlLHQuX2dlc3R1cmUudGFyZ2V0PXQsdC5hZGRFdmVudExpc3RlbmVyKFwiTVNQb2ludGVyRG93blwiLGUsITEpLHQuX3NsaWRlcj1uLHQuYWRkRXZlbnRMaXN0ZW5lcihcIk1TR2VzdHVyZUNoYW5nZVwiLGEsITEpLHQuYWRkRXZlbnRMaXN0ZW5lcihcIk1TR2VzdHVyZUVuZFwiLGksITEpKTooZz1mdW5jdGlvbihlKXtuLmFuaW1hdGluZz9lLnByZXZlbnREZWZhdWx0KCk6KHdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZHx8MT09PWUudG91Y2hlcy5sZW5ndGgpJiYobi5wYXVzZSgpLGM9ZD9uLmg6bi53LGY9TnVtYmVyKG5ldyBEYXRlKSx4PWUudG91Y2hlc1swXS5wYWdlWCxiPWUudG91Y2hlc1swXS5wYWdlWSxsPXYmJnUmJm4uYW5pbWF0aW5nVG89PT1uLmxhc3Q/MDp2JiZ1P24ubGltaXQtKG4uaXRlbVcrbi52YXJzLml0ZW1NYXJnaW4pKm4ubW92ZSpuLmFuaW1hdGluZ1RvOnYmJm4uY3VycmVudFNsaWRlPT09bi5sYXN0P24ubGltaXQ6dj8obi5pdGVtVytuLnZhcnMuaXRlbU1hcmdpbikqbi5tb3ZlKm4uY3VycmVudFNsaWRlOnU/KG4ubGFzdC1uLmN1cnJlbnRTbGlkZStuLmNsb25lT2Zmc2V0KSpjOihuLmN1cnJlbnRTbGlkZStuLmNsb25lT2Zmc2V0KSpjLHM9ZD9iOngsbz1kP3g6Yix0LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixoLCExKSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLFMsITEpKX0saD1mdW5jdGlvbihlKXt4PWUudG91Y2hlc1swXS5wYWdlWCxiPWUudG91Y2hlc1swXS5wYWdlWSxtPWQ/cy1iOnMteCx5PWQ/TWF0aC5hYnMobSk8TWF0aC5hYnMoeC1vKTpNYXRoLmFicyhtKTxNYXRoLmFicyhiLW8pO3ZhciB0PTUwMDsoIXl8fE51bWJlcihuZXcgRGF0ZSktZj41MDApJiYoZS5wcmV2ZW50RGVmYXVsdCgpLCFwJiZuLnRyYW5zaXRpb25zJiYobi52YXJzLmFuaW1hdGlvbkxvb3B8fChtLz0wPT09bi5jdXJyZW50U2xpZGUmJm08MHx8bi5jdXJyZW50U2xpZGU9PT1uLmxhc3QmJm0+MD9NYXRoLmFicyhtKS9jKzI6MSksbi5zZXRQcm9wcyhsK20sXCJzZXRUb3VjaFwiKSkpfSxTPWZ1bmN0aW9uKGUpe2lmKHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLGgsITEpLG4uYW5pbWF0aW5nVG89PT1uLmN1cnJlbnRTbGlkZSYmIXkmJm51bGwhPT1tKXt2YXIgYT11Py1tOm0saT1hPjA/bi5nZXRUYXJnZXQoXCJuZXh0XCIpOm4uZ2V0VGFyZ2V0KFwicHJldlwiKTtuLmNhbkFkdmFuY2UoaSkmJihOdW1iZXIobmV3IERhdGUpLWY8NTUwJiZNYXRoLmFicyhhKT41MHx8TWF0aC5hYnMoYSk+Yy8yKT9uLmZsZXhBbmltYXRlKGksbi52YXJzLnBhdXNlT25BY3Rpb24pOnB8fG4uZmxleEFuaW1hdGUobi5jdXJyZW50U2xpZGUsbi52YXJzLnBhdXNlT25BY3Rpb24sITApfXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsUywhMSkscz1udWxsLG89bnVsbCxtPW51bGwsbD1udWxsfSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsZywhMSkpfSxyZXNpemU6ZnVuY3Rpb24oKXshbi5hbmltYXRpbmcmJm4uaXMoXCI6dmlzaWJsZVwiKSYmKHZ8fG4uZG9NYXRoKCkscD9mLnNtb290aEhlaWdodCgpOnY/KG4uc2xpZGVzLndpZHRoKG4uY29tcHV0ZWRXKSxuLnVwZGF0ZShuLnBhZ2luZ0NvdW50KSxuLnNldFByb3BzKCkpOmQ/KG4udmlld3BvcnQuaGVpZ2h0KG4uaCksbi5zZXRQcm9wcyhuLmgsXCJzZXRUb3RhbFwiKSk6KG4udmFycy5zbW9vdGhIZWlnaHQmJmYuc21vb3RoSGVpZ2h0KCksbi5uZXdTbGlkZXMud2lkdGgobi5jb21wdXRlZFcpLG4uc2V0UHJvcHMobi5jb21wdXRlZFcsXCJzZXRUb3RhbFwiKSkpfSxzbW9vdGhIZWlnaHQ6ZnVuY3Rpb24oZSl7aWYoIWR8fHApe3ZhciB0PXA/bjpuLnZpZXdwb3J0O2U/dC5hbmltYXRlKHtoZWlnaHQ6bi5zbGlkZXMuZXEobi5hbmltYXRpbmdUbykuaW5uZXJIZWlnaHQoKX0sZSk6dC5pbm5lckhlaWdodChuLnNsaWRlcy5lcShuLmFuaW1hdGluZ1RvKS5pbm5lckhlaWdodCgpKX19LHN5bmM6ZnVuY3Rpb24oZSl7dmFyIHQ9JChuLnZhcnMuc3luYykuZGF0YShcImZsZXhzbGlkZXJcIiksYT1uLmFuaW1hdGluZ1RvO3N3aXRjaChlKXtjYXNlXCJhbmltYXRlXCI6dC5mbGV4QW5pbWF0ZShhLG4udmFycy5wYXVzZU9uQWN0aW9uLCExLCEwKTticmVhaztjYXNlXCJwbGF5XCI6dC5wbGF5aW5nfHx0LmFzTmF2fHx0LnBsYXkoKTticmVhaztjYXNlXCJwYXVzZVwiOnQucGF1c2UoKTticmVha319LHVuaXF1ZUlEOmZ1bmN0aW9uKGUpe3JldHVybiBlLmZpbHRlcihcIltpZF1cIikuYWRkKGUuZmluZChcIltpZF1cIikpLmVhY2goZnVuY3Rpb24oKXt2YXIgZT0kKHRoaXMpO2UuYXR0cihcImlkXCIsZS5hdHRyKFwiaWRcIikrXCJfY2xvbmVcIil9KSxlfSxwYXVzZUludmlzaWJsZTp7dmlzUHJvcDpudWxsLGluaXQ6ZnVuY3Rpb24oKXt2YXIgZT1mLnBhdXNlSW52aXNpYmxlLmdldEhpZGRlblByb3AoKTtpZihlKXt2YXIgdD1lLnJlcGxhY2UoL1tIfGhdaWRkZW4vLFwiXCIpK1widmlzaWJpbGl0eWNoYW5nZVwiO2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIodCxmdW5jdGlvbigpe2YucGF1c2VJbnZpc2libGUuaXNIaWRkZW4oKT9uLnN0YXJ0VGltZW91dD9jbGVhclRpbWVvdXQobi5zdGFydFRpbWVvdXQpOm4ucGF1c2UoKTpuLnN0YXJ0ZWQ/bi5wbGF5KCk6bi52YXJzLmluaXREZWxheT4wP3NldFRpbWVvdXQobi5wbGF5LG4udmFycy5pbml0RGVsYXkpOm4ucGxheSgpfSl9fSxpc0hpZGRlbjpmdW5jdGlvbigpe3ZhciBlPWYucGF1c2VJbnZpc2libGUuZ2V0SGlkZGVuUHJvcCgpO3JldHVybiEhZSYmZG9jdW1lbnRbZV19LGdldEhpZGRlblByb3A6ZnVuY3Rpb24oKXt2YXIgZT1bXCJ3ZWJraXRcIixcIm1velwiLFwibXNcIixcIm9cIl07aWYoXCJoaWRkZW5cImluIGRvY3VtZW50KXJldHVyblwiaGlkZGVuXCI7Zm9yKHZhciB0PTA7dDxlLmxlbmd0aDt0KyspaWYoZVt0XStcIkhpZGRlblwiaW4gZG9jdW1lbnQpcmV0dXJuIGVbdF0rXCJIaWRkZW5cIjtyZXR1cm4gbnVsbH19LHNldFRvQ2xlYXJXYXRjaGVkRXZlbnQ6ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoYyksYz1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bD1cIlwifSwzZTMpfX0sbi5mbGV4QW5pbWF0ZT1mdW5jdGlvbihlLHQsYSxyLG8pe2lmKG4udmFycy5hbmltYXRpb25Mb29wfHxlPT09bi5jdXJyZW50U2xpZGV8fChuLmRpcmVjdGlvbj1lPm4uY3VycmVudFNsaWRlP1wibmV4dFwiOlwicHJldlwiKSxtJiYxPT09bi5wYWdpbmdDb3VudCYmKG4uZGlyZWN0aW9uPW4uY3VycmVudEl0ZW08ZT9cIm5leHRcIjpcInByZXZcIiksIW4uYW5pbWF0aW5nJiYobi5jYW5BZHZhbmNlKGUsbyl8fGEpJiZuLmlzKFwiOnZpc2libGVcIikpe2lmKG0mJnIpe3ZhciBsPSQobi52YXJzLmFzTmF2Rm9yKS5kYXRhKFwiZmxleHNsaWRlclwiKTtpZihuLmF0RW5kPTA9PT1lfHxlPT09bi5jb3VudC0xLGwuZmxleEFuaW1hdGUoZSwhMCwhMSwhMCxvKSxuLmRpcmVjdGlvbj1uLmN1cnJlbnRJdGVtPGU/XCJuZXh0XCI6XCJwcmV2XCIsbC5kaXJlY3Rpb249bi5kaXJlY3Rpb24sTWF0aC5jZWlsKChlKzEpL24udmlzaWJsZSktMT09PW4uY3VycmVudFNsaWRlfHwwPT09ZSlyZXR1cm4gbi5jdXJyZW50SXRlbT1lLG4uc2xpZGVzLnJlbW92ZUNsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIikuZXEoZSkuYWRkQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKSwhMTtuLmN1cnJlbnRJdGVtPWUsbi5zbGlkZXMucmVtb3ZlQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKS5lcShlKS5hZGRDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLGU9TWF0aC5mbG9vcihlL24udmlzaWJsZSl9aWYobi5hbmltYXRpbmc9ITAsbi5hbmltYXRpbmdUbz1lLHQmJm4ucGF1c2UoKSxuLnZhcnMuYmVmb3JlKG4pLG4uc3luY0V4aXN0cyYmIW8mJmYuc3luYyhcImFuaW1hdGVcIiksbi52YXJzLmNvbnRyb2xOYXYmJmYuY29udHJvbE5hdi5hY3RpdmUoKSx2fHxuLnNsaWRlcy5yZW1vdmVDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGUpLmFkZENsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIiksbi5hdEVuZD0wPT09ZXx8ZT09PW4ubGFzdCxuLnZhcnMuZGlyZWN0aW9uTmF2JiZmLmRpcmVjdGlvbk5hdi51cGRhdGUoKSxlPT09bi5sYXN0JiYobi52YXJzLmVuZChuKSxuLnZhcnMuYW5pbWF0aW9uTG9vcHx8bi5wYXVzZSgpKSxwKXM/KG4uc2xpZGVzLmVxKG4uY3VycmVudFNsaWRlKS5jc3Moe29wYWNpdHk6MCx6SW5kZXg6MX0pLG4uc2xpZGVzLmVxKGUpLmNzcyh7b3BhY2l0eToxLHpJbmRleDoyfSksbi53cmFwdXAoYykpOihuLnNsaWRlcy5lcShuLmN1cnJlbnRTbGlkZSkuY3NzKHt6SW5kZXg6MX0pLmFuaW1hdGUoe29wYWNpdHk6MH0sbi52YXJzLmFuaW1hdGlvblNwZWVkLG4udmFycy5lYXNpbmcpLG4uc2xpZGVzLmVxKGUpLmNzcyh7ekluZGV4OjJ9KS5hbmltYXRlKHtvcGFjaXR5OjF9LG4udmFycy5hbmltYXRpb25TcGVlZCxuLnZhcnMuZWFzaW5nLG4ud3JhcHVwKSk7ZWxzZXt2YXIgYz1kP24uc2xpZGVzLmZpbHRlcihcIjpmaXJzdFwiKS5oZWlnaHQoKTpuLmNvbXB1dGVkVyxnLGgsUzt2PyhnPW4udmFycy5pdGVtTWFyZ2luLFM9KG4uaXRlbVcrZykqbi5tb3ZlKm4uYW5pbWF0aW5nVG8saD1TPm4ubGltaXQmJjEhPT1uLnZpc2libGU/bi5saW1pdDpTKTpoPTA9PT1uLmN1cnJlbnRTbGlkZSYmZT09PW4uY291bnQtMSYmbi52YXJzLmFuaW1hdGlvbkxvb3AmJlwibmV4dFwiIT09bi5kaXJlY3Rpb24/dT8obi5jb3VudCtuLmNsb25lT2Zmc2V0KSpjOjA6bi5jdXJyZW50U2xpZGU9PT1uLmxhc3QmJjA9PT1lJiZuLnZhcnMuYW5pbWF0aW9uTG9vcCYmXCJwcmV2XCIhPT1uLmRpcmVjdGlvbj91PzA6KG4uY291bnQrMSkqYzp1PyhuLmNvdW50LTEtZStuLmNsb25lT2Zmc2V0KSpjOihlK24uY2xvbmVPZmZzZXQpKmMsbi5zZXRQcm9wcyhoLFwiXCIsbi52YXJzLmFuaW1hdGlvblNwZWVkKSxuLnRyYW5zaXRpb25zPyhuLnZhcnMuYW5pbWF0aW9uTG9vcCYmbi5hdEVuZHx8KG4uYW5pbWF0aW5nPSExLG4uY3VycmVudFNsaWRlPW4uYW5pbWF0aW5nVG8pLG4uY29udGFpbmVyLnVuYmluZChcIndlYmtpdFRyYW5zaXRpb25FbmQgdHJhbnNpdGlvbmVuZFwiKSxuLmNvbnRhaW5lci5iaW5kKFwid2Via2l0VHJhbnNpdGlvbkVuZCB0cmFuc2l0aW9uZW5kXCIsZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQobi5lbnN1cmVBbmltYXRpb25FbmQpLG4ud3JhcHVwKGMpfSksY2xlYXJUaW1lb3V0KG4uZW5zdXJlQW5pbWF0aW9uRW5kKSxuLmVuc3VyZUFuaW1hdGlvbkVuZD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bi53cmFwdXAoYyl9LG4udmFycy5hbmltYXRpb25TcGVlZCsxMDApKTpuLmNvbnRhaW5lci5hbmltYXRlKG4uYXJncyxuLnZhcnMuYW5pbWF0aW9uU3BlZWQsbi52YXJzLmVhc2luZyxmdW5jdGlvbigpe24ud3JhcHVwKGMpfSl9bi52YXJzLnNtb290aEhlaWdodCYmZi5zbW9vdGhIZWlnaHQobi52YXJzLmFuaW1hdGlvblNwZWVkKX19LG4ud3JhcHVwPWZ1bmN0aW9uKGUpe3B8fHZ8fCgwPT09bi5jdXJyZW50U2xpZGUmJm4uYW5pbWF0aW5nVG89PT1uLmxhc3QmJm4udmFycy5hbmltYXRpb25Mb29wP24uc2V0UHJvcHMoZSxcImp1bXBFbmRcIik6bi5jdXJyZW50U2xpZGU9PT1uLmxhc3QmJjA9PT1uLmFuaW1hdGluZ1RvJiZuLnZhcnMuYW5pbWF0aW9uTG9vcCYmbi5zZXRQcm9wcyhlLFwianVtcFN0YXJ0XCIpKSxuLmFuaW1hdGluZz0hMSxuLmN1cnJlbnRTbGlkZT1uLmFuaW1hdGluZ1RvLG4udmFycy5hZnRlcihuKX0sbi5hbmltYXRlU2xpZGVzPWZ1bmN0aW9uKCl7IW4uYW5pbWF0aW5nJiZlJiZuLmZsZXhBbmltYXRlKG4uZ2V0VGFyZ2V0KFwibmV4dFwiKSl9LG4ucGF1c2U9ZnVuY3Rpb24oKXtjbGVhckludGVydmFsKG4uYW5pbWF0ZWRTbGlkZXMpLG4uYW5pbWF0ZWRTbGlkZXM9bnVsbCxuLnBsYXlpbmc9ITEsbi52YXJzLnBhdXNlUGxheSYmZi5wYXVzZVBsYXkudXBkYXRlKFwicGxheVwiKSxuLnN5bmNFeGlzdHMmJmYuc3luYyhcInBhdXNlXCIpfSxuLnBsYXk9ZnVuY3Rpb24oKXtuLnBsYXlpbmcmJmNsZWFySW50ZXJ2YWwobi5hbmltYXRlZFNsaWRlcyksbi5hbmltYXRlZFNsaWRlcz1uLmFuaW1hdGVkU2xpZGVzfHxzZXRJbnRlcnZhbChuLmFuaW1hdGVTbGlkZXMsbi52YXJzLnNsaWRlc2hvd1NwZWVkKSxuLnN0YXJ0ZWQ9bi5wbGF5aW5nPSEwLG4udmFycy5wYXVzZVBsYXkmJmYucGF1c2VQbGF5LnVwZGF0ZShcInBhdXNlXCIpLG4uc3luY0V4aXN0cyYmZi5zeW5jKFwicGxheVwiKX0sbi5zdG9wPWZ1bmN0aW9uKCl7bi5wYXVzZSgpLG4uc3RvcHBlZD0hMH0sbi5jYW5BZHZhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIGE9bT9uLnBhZ2luZ0NvdW50LTE6bi5sYXN0O3JldHVybiEhdHx8KCEoIW18fG4uY3VycmVudEl0ZW0hPT1uLmNvdW50LTF8fDAhPT1lfHxcInByZXZcIiE9PW4uZGlyZWN0aW9uKXx8KCFtfHwwIT09bi5jdXJyZW50SXRlbXx8ZSE9PW4ucGFnaW5nQ291bnQtMXx8XCJuZXh0XCI9PT1uLmRpcmVjdGlvbikmJighKGU9PT1uLmN1cnJlbnRTbGlkZSYmIW0pJiYoISFuLnZhcnMuYW5pbWF0aW9uTG9vcHx8KCFuLmF0RW5kfHwwIT09bi5jdXJyZW50U2xpZGV8fGUhPT1hfHxcIm5leHRcIj09PW4uZGlyZWN0aW9uKSYmKCFuLmF0RW5kfHxuLmN1cnJlbnRTbGlkZSE9PWF8fDAhPT1lfHxcIm5leHRcIiE9PW4uZGlyZWN0aW9uKSkpKX0sbi5nZXRUYXJnZXQ9ZnVuY3Rpb24oZSl7cmV0dXJuIG4uZGlyZWN0aW9uPWUsXCJuZXh0XCI9PT1lP24uY3VycmVudFNsaWRlPT09bi5sYXN0PzA6bi5jdXJyZW50U2xpZGUrMTowPT09bi5jdXJyZW50U2xpZGU/bi5sYXN0Om4uY3VycmVudFNsaWRlLTF9LG4uc2V0UHJvcHM9ZnVuY3Rpb24oZSx0LGEpe3ZhciBpPWZ1bmN0aW9uKCl7dmFyIGE9ZXx8KG4uaXRlbVcrbi52YXJzLml0ZW1NYXJnaW4pKm4ubW92ZSpuLmFuaW1hdGluZ1RvO3JldHVybi0xKmZ1bmN0aW9uKCl7aWYodilyZXR1cm5cInNldFRvdWNoXCI9PT10P2U6dSYmbi5hbmltYXRpbmdUbz09PW4ubGFzdD8wOnU/bi5saW1pdC0obi5pdGVtVytuLnZhcnMuaXRlbU1hcmdpbikqbi5tb3ZlKm4uYW5pbWF0aW5nVG86bi5hbmltYXRpbmdUbz09PW4ubGFzdD9uLmxpbWl0OmE7c3dpdGNoKHQpe2Nhc2VcInNldFRvdGFsXCI6cmV0dXJuIHU/KG4uY291bnQtMS1uLmN1cnJlbnRTbGlkZStuLmNsb25lT2Zmc2V0KSplOihuLmN1cnJlbnRTbGlkZStuLmNsb25lT2Zmc2V0KSplO2Nhc2VcInNldFRvdWNoXCI6cmV0dXJuIGU7Y2FzZVwianVtcEVuZFwiOnJldHVybiB1P2U6bi5jb3VudCplO2Nhc2VcImp1bXBTdGFydFwiOnJldHVybiB1P24uY291bnQqZTplO2RlZmF1bHQ6cmV0dXJuIGV9fSgpK1wicHhcIn0oKTtuLnRyYW5zaXRpb25zJiYoaT1kP1widHJhbnNsYXRlM2QoMCxcIitpK1wiLDApXCI6XCJ0cmFuc2xhdGUzZChcIitpK1wiLDAsMClcIixhPXZvaWQgMCE9PWE/YS8xZTMrXCJzXCI6XCIwc1wiLG4uY29udGFpbmVyLmNzcyhcIi1cIituLnBmeCtcIi10cmFuc2l0aW9uLWR1cmF0aW9uXCIsYSksbi5jb250YWluZXIuY3NzKFwidHJhbnNpdGlvbi1kdXJhdGlvblwiLGEpKSxuLmFyZ3Nbbi5wcm9wXT1pLChuLnRyYW5zaXRpb25zfHx2b2lkIDA9PT1hKSYmbi5jb250YWluZXIuY3NzKG4uYXJncyksbi5jb250YWluZXIuY3NzKFwidHJhbnNmb3JtXCIsaSl9LG4uc2V0dXA9ZnVuY3Rpb24oZSl7aWYocCluLnNsaWRlcy5jc3Moe3dpZHRoOlwiMTAwJVwiLGZsb2F0OlwibGVmdFwiLG1hcmdpblJpZ2h0OlwiLTEwMCVcIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KSxcImluaXRcIj09PWUmJihzP24uc2xpZGVzLmNzcyh7b3BhY2l0eTowLGRpc3BsYXk6XCJibG9ja1wiLHdlYmtpdFRyYW5zaXRpb246XCJvcGFjaXR5IFwiK24udmFycy5hbmltYXRpb25TcGVlZC8xZTMrXCJzIGVhc2VcIix6SW5kZXg6MX0pLmVxKG4uY3VycmVudFNsaWRlKS5jc3Moe29wYWNpdHk6MSx6SW5kZXg6Mn0pOjA9PW4udmFycy5mYWRlRmlyc3RTbGlkZT9uLnNsaWRlcy5jc3Moe29wYWNpdHk6MCxkaXNwbGF5OlwiYmxvY2tcIix6SW5kZXg6MX0pLmVxKG4uY3VycmVudFNsaWRlKS5jc3Moe3pJbmRleDoyfSkuY3NzKHtvcGFjaXR5OjF9KTpuLnNsaWRlcy5jc3Moe29wYWNpdHk6MCxkaXNwbGF5OlwiYmxvY2tcIix6SW5kZXg6MX0pLmVxKG4uY3VycmVudFNsaWRlKS5jc3Moe3pJbmRleDoyfSkuYW5pbWF0ZSh7b3BhY2l0eToxfSxuLnZhcnMuYW5pbWF0aW9uU3BlZWQsbi52YXJzLmVhc2luZykpLG4udmFycy5zbW9vdGhIZWlnaHQmJmYuc21vb3RoSGVpZ2h0KCk7ZWxzZXt2YXIgdCxhO1wiaW5pdFwiPT09ZSYmKG4udmlld3BvcnQ9JCgnPGRpdiBjbGFzcz1cIicraSsndmlld3BvcnRcIj48L2Rpdj4nKS5jc3Moe292ZXJmbG93OlwiaGlkZGVuXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSkuYXBwZW5kVG8obikuYXBwZW5kKG4uY29udGFpbmVyKSxuLmNsb25lQ291bnQ9MCxuLmNsb25lT2Zmc2V0PTAsdSYmKGE9JC5tYWtlQXJyYXkobi5zbGlkZXMpLnJldmVyc2UoKSxuLnNsaWRlcz0kKGEpLG4uY29udGFpbmVyLmVtcHR5KCkuYXBwZW5kKG4uc2xpZGVzKSkpLG4udmFycy5hbmltYXRpb25Mb29wJiYhdiYmKG4uY2xvbmVDb3VudD0yLG4uY2xvbmVPZmZzZXQ9MSxcImluaXRcIiE9PWUmJm4uY29udGFpbmVyLmZpbmQoXCIuY2xvbmVcIikucmVtb3ZlKCksbi5jb250YWluZXIuYXBwZW5kKGYudW5pcXVlSUQobi5zbGlkZXMuZmlyc3QoKS5jbG9uZSgpLmFkZENsYXNzKFwiY2xvbmVcIikpLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKSkucHJlcGVuZChmLnVuaXF1ZUlEKG4uc2xpZGVzLmxhc3QoKS5jbG9uZSgpLmFkZENsYXNzKFwiY2xvbmVcIikpLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKSkpLG4ubmV3U2xpZGVzPSQobi52YXJzLnNlbGVjdG9yLG4pLHQ9dT9uLmNvdW50LTEtbi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldDpuLmN1cnJlbnRTbGlkZStuLmNsb25lT2Zmc2V0LGQmJiF2PyhuLmNvbnRhaW5lci5oZWlnaHQoMjAwKihuLmNvdW50K24uY2xvbmVDb3VudCkrXCIlXCIpLmNzcyhcInBvc2l0aW9uXCIsXCJhYnNvbHV0ZVwiKS53aWR0aChcIjEwMCVcIiksc2V0VGltZW91dChmdW5jdGlvbigpe24ubmV3U2xpZGVzLmNzcyh7ZGlzcGxheTpcImJsb2NrXCJ9KSxuLmRvTWF0aCgpLG4udmlld3BvcnQuaGVpZ2h0KG4uaCksbi5zZXRQcm9wcyh0Km4uaCxcImluaXRcIil9LFwiaW5pdFwiPT09ZT8xMDA6MCkpOihuLmNvbnRhaW5lci53aWR0aCgyMDAqKG4uY291bnQrbi5jbG9uZUNvdW50KStcIiVcIiksbi5zZXRQcm9wcyh0Km4uY29tcHV0ZWRXLFwiaW5pdFwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bi5kb01hdGgoKSxuLm5ld1NsaWRlcy5jc3Moe3dpZHRoOm4uY29tcHV0ZWRXLG1hcmdpblJpZ2h0Om4uY29tcHV0ZWRNLGZsb2F0OlwibGVmdFwiLGRpc3BsYXk6XCJibG9ja1wifSksbi52YXJzLnNtb290aEhlaWdodCYmZi5zbW9vdGhIZWlnaHQoKX0sXCJpbml0XCI9PT1lPzEwMDowKSl9dnx8bi5zbGlkZXMucmVtb3ZlQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKS5lcShuLmN1cnJlbnRTbGlkZSkuYWRkQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKSxuLnZhcnMuaW5pdChuKX0sbi5kb01hdGg9ZnVuY3Rpb24oKXt2YXIgZT1uLnNsaWRlcy5maXJzdCgpLHQ9bi52YXJzLml0ZW1NYXJnaW4sYT1uLnZhcnMubWluSXRlbXMsaT1uLnZhcnMubWF4SXRlbXM7bi53PXZvaWQgMD09PW4udmlld3BvcnQ/bi53aWR0aCgpOm4udmlld3BvcnQud2lkdGgoKSxuLmg9ZS5oZWlnaHQoKSxuLmJveFBhZGRpbmc9ZS5vdXRlcldpZHRoKCktZS53aWR0aCgpLHY/KG4uaXRlbVQ9bi52YXJzLml0ZW1XaWR0aCt0LG4uaXRlbU09dCxuLm1pblc9YT9hKm4uaXRlbVQ6bi53LG4ubWF4Vz1pP2kqbi5pdGVtVC10Om4udyxuLml0ZW1XPW4ubWluVz5uLnc/KG4udy10KihhLTEpKS9hOm4ubWF4VzxuLnc/KG4udy10KihpLTEpKS9pOm4udmFycy5pdGVtV2lkdGg+bi53P24udzpuLnZhcnMuaXRlbVdpZHRoLG4udmlzaWJsZT1NYXRoLmZsb29yKG4udy9uLml0ZW1XKSxuLm1vdmU9bi52YXJzLm1vdmU+MCYmbi52YXJzLm1vdmU8bi52aXNpYmxlP24udmFycy5tb3ZlOm4udmlzaWJsZSxuLnBhZ2luZ0NvdW50PU1hdGguY2VpbCgobi5jb3VudC1uLnZpc2libGUpL24ubW92ZSsxKSxuLmxhc3Q9bi5wYWdpbmdDb3VudC0xLG4ubGltaXQ9MT09PW4ucGFnaW5nQ291bnQ/MDpuLnZhcnMuaXRlbVdpZHRoPm4udz9uLml0ZW1XKihuLmNvdW50LTEpK3QqKG4uY291bnQtMSk6KG4uaXRlbVcrdCkqbi5jb3VudC1uLnctdCk6KG4uaXRlbVc9bi53LG4uaXRlbU09dCxuLnBhZ2luZ0NvdW50PW4uY291bnQsbi5sYXN0PW4uY291bnQtMSksbi5jb21wdXRlZFc9bi5pdGVtVy1uLmJveFBhZGRpbmcsbi5jb21wdXRlZE09bi5pdGVtTX0sbi51cGRhdGU9ZnVuY3Rpb24oZSx0KXtuLmRvTWF0aCgpLHZ8fChlPG4uY3VycmVudFNsaWRlP24uY3VycmVudFNsaWRlKz0xOmU8PW4uY3VycmVudFNsaWRlJiYwIT09ZSYmKG4uY3VycmVudFNsaWRlLT0xKSxuLmFuaW1hdGluZ1RvPW4uY3VycmVudFNsaWRlKSxuLnZhcnMuY29udHJvbE5hdiYmIW4ubWFudWFsQ29udHJvbHMmJihcImFkZFwiPT09dCYmIXZ8fG4ucGFnaW5nQ291bnQ+bi5jb250cm9sTmF2Lmxlbmd0aD9mLmNvbnRyb2xOYXYudXBkYXRlKFwiYWRkXCIpOihcInJlbW92ZVwiPT09dCYmIXZ8fG4ucGFnaW5nQ291bnQ8bi5jb250cm9sTmF2Lmxlbmd0aCkmJih2JiZuLmN1cnJlbnRTbGlkZT5uLmxhc3QmJihuLmN1cnJlbnRTbGlkZS09MSxuLmFuaW1hdGluZ1RvLT0xKSxmLmNvbnRyb2xOYXYudXBkYXRlKFwicmVtb3ZlXCIsbi5sYXN0KSkpLG4udmFycy5kaXJlY3Rpb25OYXYmJmYuZGlyZWN0aW9uTmF2LnVwZGF0ZSgpfSxuLmFkZFNsaWRlPWZ1bmN0aW9uKGUsdCl7dmFyIGE9JChlKTtuLmNvdW50Kz0xLG4ubGFzdD1uLmNvdW50LTEsZCYmdT92b2lkIDAhPT10P24uc2xpZGVzLmVxKG4uY291bnQtdCkuYWZ0ZXIoYSk6bi5jb250YWluZXIucHJlcGVuZChhKTp2b2lkIDAhPT10P24uc2xpZGVzLmVxKHQpLmJlZm9yZShhKTpuLmNvbnRhaW5lci5hcHBlbmQoYSksbi51cGRhdGUodCxcImFkZFwiKSxuLnNsaWRlcz0kKG4udmFycy5zZWxlY3RvcitcIjpub3QoLmNsb25lKVwiLG4pLG4uc2V0dXAoKSxuLnZhcnMuYWRkZWQobil9LG4ucmVtb3ZlU2xpZGU9ZnVuY3Rpb24oZSl7dmFyIHQ9aXNOYU4oZSk/bi5zbGlkZXMuaW5kZXgoJChlKSk6ZTtuLmNvdW50LT0xLG4ubGFzdD1uLmNvdW50LTEsaXNOYU4oZSk/JChlLG4uc2xpZGVzKS5yZW1vdmUoKTpkJiZ1P24uc2xpZGVzLmVxKG4ubGFzdCkucmVtb3ZlKCk6bi5zbGlkZXMuZXEoZSkucmVtb3ZlKCksbi5kb01hdGgoKSxuLnVwZGF0ZSh0LFwicmVtb3ZlXCIpLG4uc2xpZGVzPSQobi52YXJzLnNlbGVjdG9yK1wiOm5vdCguY2xvbmUpXCIsbiksbi5zZXR1cCgpLG4udmFycy5yZW1vdmVkKG4pfSxmLmluaXQoKX0sJCh3aW5kb3cpLmJsdXIoZnVuY3Rpb24odCl7ZT0hMX0pLmZvY3VzKGZ1bmN0aW9uKHQpe2U9ITB9KSwkLmZsZXhzbGlkZXIuZGVmYXVsdHM9e25hbWVzcGFjZTpcImZsZXgtXCIsc2VsZWN0b3I6XCIuc2xpZGVzID4gbGlcIixhbmltYXRpb246XCJmYWRlXCIsZWFzaW5nOlwic3dpbmdcIixkaXJlY3Rpb246XCJob3Jpem9udGFsXCIscmV2ZXJzZTohMSxhbmltYXRpb25Mb29wOiEwLHNtb290aEhlaWdodDohMSxzdGFydEF0OjAsc2xpZGVzaG93OiEwLHNsaWRlc2hvd1NwZWVkOjdlMyxhbmltYXRpb25TcGVlZDo2MDAsaW5pdERlbGF5OjAscmFuZG9taXplOiExLGZhZGVGaXJzdFNsaWRlOiEwLHRodW1iQ2FwdGlvbnM6ITEscGF1c2VPbkFjdGlvbjohMCxwYXVzZU9uSG92ZXI6ITEscGF1c2VJbnZpc2libGU6ITAsdXNlQ1NTOiEwLHRvdWNoOiEwLHZpZGVvOiExLGNvbnRyb2xOYXY6ITAsZGlyZWN0aW9uTmF2OiEwLHByZXZUZXh0OlwiUHJldmlvdXNcIixuZXh0VGV4dDpcIk5leHRcIixrZXlib2FyZDohMCxtdWx0aXBsZUtleWJvYXJkOiExLG1vdXNld2hlZWw6ITEscGF1c2VQbGF5OiExLHBhdXNlVGV4dDpcIlBhdXNlXCIscGxheVRleHQ6XCJQbGF5XCIsY29udHJvbHNDb250YWluZXI6XCJcIixtYW51YWxDb250cm9sczpcIlwiLGN1c3RvbURpcmVjdGlvbk5hdjpcIlwiLHN5bmM6XCJcIixhc05hdkZvcjpcIlwiLGl0ZW1XaWR0aDowLGl0ZW1NYXJnaW46MCxtaW5JdGVtczoxLG1heEl0ZW1zOjAsbW92ZTowLGFsbG93T25lU2xpZGU6ITAsc3RhcnQ6ZnVuY3Rpb24oKXt9LGJlZm9yZTpmdW5jdGlvbigpe30sYWZ0ZXI6ZnVuY3Rpb24oKXt9LGVuZDpmdW5jdGlvbigpe30sYWRkZWQ6ZnVuY3Rpb24oKXt9LHJlbW92ZWQ6ZnVuY3Rpb24oKXt9LGluaXQ6ZnVuY3Rpb24oKXt9fSwkLmZuLmZsZXhzbGlkZXI9ZnVuY3Rpb24oZSl7aWYodm9pZCAwPT09ZSYmKGU9e30pLFwib2JqZWN0XCI9PXR5cGVvZiBlKXJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgdD0kKHRoaXMpLGE9ZS5zZWxlY3Rvcj9lLnNlbGVjdG9yOlwiLnNsaWRlcyA+IGxpXCIsbj10LmZpbmQoYSk7MT09PW4ubGVuZ3RoJiYhMT09PWUuYWxsb3dPbmVTbGlkZXx8MD09PW4ubGVuZ3RoPyhuLmZhZGVJbig0MDApLGUuc3RhcnQmJmUuc3RhcnQodCkpOnZvaWQgMD09PXQuZGF0YShcImZsZXhzbGlkZXJcIikmJm5ldyAkLmZsZXhzbGlkZXIodGhpcyxlKX0pO3ZhciB0PSQodGhpcykuZGF0YShcImZsZXhzbGlkZXJcIik7c3dpdGNoKGUpe2Nhc2VcInBsYXlcIjp0LnBsYXkoKTticmVhaztjYXNlXCJwYXVzZVwiOnQucGF1c2UoKTticmVhaztjYXNlXCJzdG9wXCI6dC5zdG9wKCk7YnJlYWs7Y2FzZVwibmV4dFwiOnQuZmxleEFuaW1hdGUodC5nZXRUYXJnZXQoXCJuZXh0XCIpLCEwKTticmVhaztjYXNlXCJwcmV2XCI6Y2FzZVwicHJldmlvdXNcIjp0LmZsZXhBbmltYXRlKHQuZ2V0VGFyZ2V0KFwicHJldlwiKSwhMCk7YnJlYWs7ZGVmYXVsdDpcIm51bWJlclwiPT10eXBlb2YgZSYmdC5mbGV4QW5pbWF0ZShlLCEwKX19fShqUXVlcnkpOyIsIiFmdW5jdGlvbih0KXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImpxdWVyeVwiXSx0KTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz10KHJlcXVpcmUoXCJqcXVlcnlcIikpOnQoalF1ZXJ5KX0oZnVuY3Rpb24odCl7ZnVuY3Rpb24gbyhvLGUpe3RoaXMuZWxlbWVudD1vLHRoaXMuJGVsZW1lbnQ9dCh0aGlzLmVsZW1lbnQpLHRoaXMuZG9jPXQoZG9jdW1lbnQpLHRoaXMud2luPXQod2luZG93KSx0aGlzLnNldHRpbmdzPXQuZXh0ZW5kKHt9LG4sZSksXCJvYmplY3RcIj09dHlwZW9mIHRoaXMuJGVsZW1lbnQuZGF0YShcInRpcHNvXCIpJiZ0LmV4dGVuZCh0aGlzLnNldHRpbmdzLHRoaXMuJGVsZW1lbnQuZGF0YShcInRpcHNvXCIpKTtmb3IodmFyIHI9T2JqZWN0LmtleXModGhpcy4kZWxlbWVudC5kYXRhKCkpLHM9e30sZD0wO2Q8ci5sZW5ndGg7ZCsrKXt2YXIgbD1yW2RdLnJlcGxhY2UoaSxcIlwiKTtpZihcIlwiIT09bCl7bD1sLmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpK2wuc2xpY2UoMSksc1tsXT10aGlzLiRlbGVtZW50LmRhdGEocltkXSk7Zm9yKHZhciBwIGluIHRoaXMuc2V0dGluZ3MpcC50b0xvd2VyQ2FzZSgpPT1sJiYodGhpcy5zZXR0aW5nc1twXT1zW2xdKX19dGhpcy5fZGVmYXVsdHM9bix0aGlzLl9uYW1lPWksdGhpcy5fdGl0bGU9dGhpcy4kZWxlbWVudC5hdHRyKFwidGl0bGVcIiksdGhpcy5tb2RlPVwiaGlkZVwiLHRoaXMuaWVGYWRlPSFhLHRoaXMuc2V0dGluZ3MucHJlZmVyZWRQb3NpdGlvbj10aGlzLnNldHRpbmdzLnBvc2l0aW9uLHRoaXMuaW5pdCgpfWZ1bmN0aW9uIGUobyl7dmFyIGU9by5jbG9uZSgpO2UuY3NzKFwidmlzaWJpbGl0eVwiLFwiaGlkZGVuXCIpLHQoXCJib2R5XCIpLmFwcGVuZChlKTt2YXIgcj1lLm91dGVySGVpZ2h0KCkscz1lLm91dGVyV2lkdGgoKTtyZXR1cm4gZS5yZW1vdmUoKSx7d2lkdGg6cyxoZWlnaHQ6cn19ZnVuY3Rpb24gcih0KXt0LnJlbW92ZUNsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lciBib3R0b21fcmlnaHRfY29ybmVyIHRvcF9sZWZ0X2Nvcm5lciBib3R0b21fbGVmdF9jb3JuZXJcIiksdC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLnJlbW92ZUNsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lciBib3R0b21fcmlnaHRfY29ybmVyIHRvcF9sZWZ0X2Nvcm5lciBib3R0b21fbGVmdF9jb3JuZXJcIil9ZnVuY3Rpb24gcyhvKXt2YXIgaSxuLGEsZD1vLnRvb2x0aXAoKSxsPW8uJGVsZW1lbnQscD1vLGY9dCh3aW5kb3cpLGc9MTAsYz1wLnNldHRpbmdzLmJhY2tncm91bmQsaD1wLnRpdGxlQ29udGVudCgpO3N3aXRjaCh2b2lkIDAhPT1oJiZcIlwiIT09aCYmKGM9cC5zZXR0aW5ncy50aXRsZUJhY2tncm91bmQpLGwucGFyZW50KCkub3V0ZXJXaWR0aCgpPmYub3V0ZXJXaWR0aCgpJiYoZj1sLnBhcmVudCgpKSxwLnNldHRpbmdzLnBvc2l0aW9uKXtjYXNlXCJ0b3AtcmlnaHRcIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKSxpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21fcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcImJvdHRvbV9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOmN9KSxkLnJlbW92ZUNsYXNzKFwidG9wLXJpZ2h0IHRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnQgXCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcInRvcF9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZH0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk7YnJlYWs7Y2FzZVwidG9wLWxlZnRcIjpuPWwub2Zmc2V0KCkubGVmdC1lKGQpLndpZHRoLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbV9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJib3R0b21fbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpjfSksZC5yZW1vdmVDbGFzcyhcInRvcC1yaWdodCB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50IFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BfbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmR9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpO2JyZWFrO2Nhc2VcImJvdHRvbS1yaWdodFwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaStlKGQpLmhlaWdodD5mLnNjcm9sbFRvcCgpK2Yub3V0ZXJIZWlnaHQoKT8oaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcInRvcF9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwidG9wX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmR9KSxkLnJlbW92ZUNsYXNzKFwidG9wLXJpZ2h0IHRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbV9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwiYm90dG9tX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6Y30pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk7YnJlYWs7Y2FzZVwiYm90dG9tLWxlZnRcIjpuPWwub2Zmc2V0KCkubGVmdC1lKGQpLndpZHRoLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaStlKGQpLmhlaWdodD5mLnNjcm9sbFRvcCgpK2Yub3V0ZXJIZWlnaHQoKT8oaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcInRvcF9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJ0b3BfbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmR9KSxkLnJlbW92ZUNsYXNzKFwidG9wLXJpZ2h0IHRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbV9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJib3R0b21fbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpjfSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTticmVhaztjYXNlXCJ0b3BcIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKS8yLWUoZCkud2lkdGgvMixpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpO2JyZWFrO2Nhc2VcImJvdHRvbVwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLzItZShkKS53aWR0aC8yLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaStlKGQpLmhlaWdodD5mLnNjcm9sbFRvcCgpK2Yub3V0ZXJIZWlnaHQoKT8oaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MocC5zZXR0aW5ncy5wb3NpdGlvbikpO2JyZWFrO2Nhc2VcImxlZnRcIjpuPWwub2Zmc2V0KCkubGVmdC1lKGQpLndpZHRoLWcsaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkvMi1lKGQpLmhlaWdodC8yLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpblRvcDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpbkxlZnQ6XCJcIn0pLG48Zi5zY3JvbGxMZWZ0KCk/KG49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwicmlnaHRcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MocC5zZXR0aW5ncy5wb3NpdGlvbikpO2JyZWFrO2Nhc2VcInJpZ2h0XCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkrZyxpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKS8yLWUoZCkuaGVpZ2h0LzIsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luVG9wOi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luTGVmdDpcIlwifSksbitnK3Auc2V0dGluZ3Mud2lkdGg+Zi5zY3JvbGxMZWZ0KCkrZi5vdXRlcldpZHRoKCk/KG49bC5vZmZzZXQoKS5sZWZ0LWUoZCkud2lkdGgtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJsZWZ0XCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKHAuc2V0dGluZ3MucG9zaXRpb24pKX1pZihcInRvcC1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbiYmZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJtYXJnaW4tbGVmdFwiOi1wLnNldHRpbmdzLndpZHRoLzJ9KSxcInRvcC1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKXt2YXIgbT1kLmZpbmQoXCIudGlwc29fYXJyb3dcIikuZXEoMCk7bS5jc3Moe1wibWFyZ2luLWxlZnRcIjpwLnNldHRpbmdzLndpZHRoLzItMipwLnNldHRpbmdzLmFycm93V2lkdGh9KX1pZihcImJvdHRvbS1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbil7dmFyIG09ZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmVxKDApO20uY3NzKHtcIm1hcmdpbi1sZWZ0XCI6LXAuc2V0dGluZ3Mud2lkdGgvMixcIm1hcmdpbi10b3BcIjpcIlwifSl9aWYoXCJib3R0b20tbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbil7dmFyIG09ZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmVxKDApO20uY3NzKHtcIm1hcmdpbi1sZWZ0XCI6cC5zZXR0aW5ncy53aWR0aC8yLTIqcC5zZXR0aW5ncy5hcnJvd1dpZHRoLFwibWFyZ2luLXRvcFwiOlwiXCJ9KX1uPGYuc2Nyb2xsTGVmdCgpJiYoXCJib3R0b21cIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wXCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6bi1wLnNldHRpbmdzLmFycm93V2lkdGh9KSxuPTApLG4rcC5zZXR0aW5ncy53aWR0aD5mLm91dGVyV2lkdGgoKSYmKFwiYm90dG9tXCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihhPWYub3V0ZXJXaWR0aCgpLShuK3Auc2V0dGluZ3Mud2lkdGgpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LWEtcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksbis9YSksbjxmLnNjcm9sbExlZnQoKSYmKFwibGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJyaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3AtcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwiYm90dG9tLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImJvdHRvbS1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKG49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLzItZShkKS53aWR0aC8yLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIikscihkKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpLG4rcC5zZXR0aW5ncy53aWR0aD5mLm91dGVyV2lkdGgoKSYmKGE9Zi5vdXRlcldpZHRoKCktKG4rcC5zZXR0aW5ncy53aWR0aCksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotYS1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxuKz1hKSxuPGYuc2Nyb2xsTGVmdCgpJiYoZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDpuLXAuc2V0dGluZ3MuYXJyb3dXaWR0aH0pLG49MCkpLG4rcC5zZXR0aW5ncy53aWR0aD5mLm91dGVyV2lkdGgoKSYmKFwibGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJyaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3AtcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwiYm90dG9tLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImJvdHRvbS1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKS8yLWUoZCkud2lkdGgvMixkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKSxuK3Auc2V0dGluZ3Mud2lkdGg+Zi5vdXRlcldpZHRoKCkmJihhPWYub3V0ZXJXaWR0aCgpLShuK3Auc2V0dGluZ3Mud2lkdGgpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LWEtcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksbis9YSksbjxmLnNjcm9sbExlZnQoKSYmKGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6bi1wLnNldHRpbmdzLmFycm93V2lkdGh9KSxuPTApKSxkLmNzcyh7bGVmdDpuK3Auc2V0dGluZ3Mub2Zmc2V0WCx0b3A6aStwLnNldHRpbmdzLm9mZnNldFl9KSxpPGYuc2Nyb2xsVG9wKCkmJihcInJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYobC50aXBzbyhcInVwZGF0ZVwiLFwicG9zaXRpb25cIixcImJvdHRvbVwiKSxzKHApKSxpK2UoZCkuaGVpZ2h0PmYuc2Nyb2xsVG9wKCkrZi5vdXRlckhlaWdodCgpJiYoXCJyaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJsZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKGwudGlwc28oXCJ1cGRhdGVcIixcInBvc2l0aW9uXCIsXCJ0b3BcIikscyhwKSl9dmFyIGk9XCJ0aXBzb1wiLG49e3NwZWVkOjQwMCxiYWNrZ3JvdW5kOlwiIzU1YjU1NVwiLHRpdGxlQmFja2dyb3VuZDpcIiMzMzMzMzNcIixjb2xvcjpcIiNmZmZmZmZcIix0aXRsZUNvbG9yOlwiI2ZmZmZmZlwiLHRpdGxlQ29udGVudDpcIlwiLHNob3dBcnJvdzohMCxwb3NpdGlvbjpcInRvcFwiLHdpZHRoOjIwMCxtYXhXaWR0aDpcIlwiLGRlbGF5OjIwMCxoaWRlRGVsYXk6MCxhbmltYXRpb25JbjpcIlwiLGFuaW1hdGlvbk91dDpcIlwiLG9mZnNldFg6MCxvZmZzZXRZOjAsYXJyb3dXaWR0aDo4LHRvb2x0aXBIb3ZlcjohMSxjb250ZW50Om51bGwsYWpheENvbnRlbnRVcmw6bnVsbCxhamF4Q29udGVudEJ1ZmZlcjowLGNvbnRlbnRFbGVtZW50SWQ6bnVsbCx1c2VUaXRsZTohMSx0ZW1wbGF0ZUVuZ2luZUZ1bmM6bnVsbCxvbkJlZm9yZVNob3c6bnVsbCxvblNob3c6bnVsbCxvbkhpZGU6bnVsbH07dC5leHRlbmQoby5wcm90b3R5cGUse2luaXQ6ZnVuY3Rpb24oKXt7dmFyIHQ9dGhpcyxvPXRoaXMuJGVsZW1lbnQ7dGhpcy5kb2N9aWYoby5hZGRDbGFzcyhcInRpcHNvX3N0eWxlXCIpLnJlbW92ZUF0dHIoXCJ0aXRsZVwiKSx0LnNldHRpbmdzLnRvb2x0aXBIb3Zlcil7dmFyIGU9bnVsbCxyPW51bGw7by5vbihcIm1vdXNlb3Zlci5cIitpLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGUpLGNsZWFyVGltZW91dChyKSxyPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0LnNob3coKX0sMTUwKX0pLG8ub24oXCJtb3VzZW91dC5cIitpLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGUpLGNsZWFyVGltZW91dChyKSxlPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0LmhpZGUoKX0sMjAwKSx0LnRvb2x0aXAoKS5vbihcIm1vdXNlb3Zlci5cIitpLGZ1bmN0aW9uKCl7dC5tb2RlPVwidG9vbHRpcEhvdmVyXCJ9KS5vbihcIm1vdXNlb3V0LlwiK2ksZnVuY3Rpb24oKXt0Lm1vZGU9XCJzaG93XCIsY2xlYXJUaW1lb3V0KGUpLGU9c2V0VGltZW91dChmdW5jdGlvbigpe3QuaGlkZSgpfSwyMDApfSl9KX1lbHNlIG8ub24oXCJtb3VzZW92ZXIuXCIraSxmdW5jdGlvbigpe3Quc2hvdygpfSksby5vbihcIm1vdXNlb3V0LlwiK2ksZnVuY3Rpb24oKXt0LmhpZGUoKX0pO3Quc2V0dGluZ3MuYWpheENvbnRlbnRVcmwmJih0LmFqYXhDb250ZW50PW51bGwpfSx0b29sdGlwOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudGlwc29fYnViYmxlfHwodGhpcy50aXBzb19idWJibGU9dCgnPGRpdiBjbGFzcz1cInRpcHNvX2J1YmJsZVwiPjxkaXYgY2xhc3M9XCJ0aXBzb190aXRsZVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXBzb19jb250ZW50XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRpcHNvX2Fycm93XCI+PC9kaXY+PC9kaXY+JykpLHRoaXMudGlwc29fYnViYmxlfSxzaG93OmZ1bmN0aW9uKCl7dmFyIG89dGhpcy50b29sdGlwKCksZT10aGlzLHI9dGhpcy53aW47ZS5zZXR0aW5ncy5zaG93QXJyb3c9PT0hMT9vLmZpbmQoXCIudGlwc29fYXJyb3dcIikuaGlkZSgpOm8uZmluZChcIi50aXBzb19hcnJvd1wiKS5zaG93KCksXCJoaWRlXCI9PT1lLm1vZGUmJih0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vbkJlZm9yZVNob3cpJiZlLnNldHRpbmdzLm9uQmVmb3JlU2hvdyhlLiRlbGVtZW50LGUuZWxlbWVudCxlKSxlLnNldHRpbmdzLnNpemUmJm8uYWRkQ2xhc3MoZS5zZXR0aW5ncy5zaXplKSxlLnNldHRpbmdzLndpZHRoP28uY3NzKHtiYWNrZ3JvdW5kOmUuc2V0dGluZ3MuYmFja2dyb3VuZCxjb2xvcjplLnNldHRpbmdzLmNvbG9yLHdpZHRoOmUuc2V0dGluZ3Mud2lkdGh9KS5oaWRlKCk6ZS5zZXR0aW5ncy5tYXhXaWR0aD9vLmNzcyh7YmFja2dyb3VuZDplLnNldHRpbmdzLmJhY2tncm91bmQsY29sb3I6ZS5zZXR0aW5ncy5jb2xvcixtYXhXaWR0aDplLnNldHRpbmdzLm1heFdpZHRofSkuaGlkZSgpOm8uY3NzKHtiYWNrZ3JvdW5kOmUuc2V0dGluZ3MuYmFja2dyb3VuZCxjb2xvcjplLnNldHRpbmdzLmNvbG9yLHdpZHRoOjIwMH0pLmhpZGUoKSxvLmZpbmQoXCIudGlwc29fdGl0bGVcIikuY3NzKHtiYWNrZ3JvdW5kOmUuc2V0dGluZ3MudGl0bGVCYWNrZ3JvdW5kLGNvbG9yOmUuc2V0dGluZ3MudGl0bGVDb2xvcn0pLG8uZmluZChcIi50aXBzb19jb250ZW50XCIpLmh0bWwoZS5jb250ZW50KCkpLG8uZmluZChcIi50aXBzb190aXRsZVwiKS5odG1sKGUudGl0bGVDb250ZW50KCkpLHMoZSksci5vbihcInJlc2l6ZS5cIitpLGZ1bmN0aW9uKCl7ZS5zZXR0aW5ncy5wb3NpdGlvbj1lLnNldHRpbmdzLnByZWZlcmVkUG9zaXRpb24scyhlKX0pLHdpbmRvdy5jbGVhclRpbWVvdXQoZS50aW1lb3V0KSxlLnRpbWVvdXQ9bnVsbCxlLnRpbWVvdXQ9d2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLmllRmFkZXx8XCJcIj09PWUuc2V0dGluZ3MuYW5pbWF0aW9uSW58fFwiXCI9PT1lLnNldHRpbmdzLmFuaW1hdGlvbk91dD9vLmFwcGVuZFRvKFwiYm9keVwiKS5zdG9wKCEwLCEwKS5mYWRlSW4oZS5zZXR0aW5ncy5zcGVlZCxmdW5jdGlvbigpe2UubW9kZT1cInNob3dcIix0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vblNob3cpJiZlLnNldHRpbmdzLm9uU2hvdyhlLiRlbGVtZW50LGUuZWxlbWVudCxlKX0pOm8ucmVtb3ZlKCkuYXBwZW5kVG8oXCJib2R5XCIpLnN0b3AoITAsITApLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25PdXQpLmFkZENsYXNzKFwibm9BbmltYXRpb25cIikucmVtb3ZlQ2xhc3MoXCJub0FuaW1hdGlvblwiKS5hZGRDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uSW4pLmZhZGVJbihlLnNldHRpbmdzLnNwZWVkLGZ1bmN0aW9uKCl7dCh0aGlzKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXt0KHRoaXMpLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25Jbil9KSxlLm1vZGU9XCJzaG93XCIsdC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25TaG93KSYmZS5zZXR0aW5ncy5vblNob3coZS4kZWxlbWVudCxlLmVsZW1lbnQsZSksci5vZmYoXCJyZXNpemUuXCIraSxudWxsLFwidGlwc29SZXNpemVIYW5kbGVyXCIpfSl9LGUuc2V0dGluZ3MuZGVsYXkpKX0saGlkZTpmdW5jdGlvbihvKXt2YXIgZT10aGlzLHI9dGhpcy53aW4scz10aGlzLnRvb2x0aXAoKSxuPWUuc2V0dGluZ3MuaGlkZURlbGF5O28mJihuPTAsZS5tb2RlPVwic2hvd1wiKSx3aW5kb3cuY2xlYXJUaW1lb3V0KGUudGltZW91dCksZS50aW1lb3V0PW51bGwsZS50aW1lb3V0PXdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XCJ0b29sdGlwSG92ZXJcIiE9PWUubW9kZSYmKGUuaWVGYWRlfHxcIlwiPT09ZS5zZXR0aW5ncy5hbmltYXRpb25Jbnx8XCJcIj09PWUuc2V0dGluZ3MuYW5pbWF0aW9uT3V0P3Muc3RvcCghMCwhMCkuZmFkZU91dChlLnNldHRpbmdzLnNwZWVkLGZ1bmN0aW9uKCl7dCh0aGlzKS5yZW1vdmUoKSx0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vbkhpZGUpJiZcInNob3dcIj09PWUubW9kZSYmZS5zZXR0aW5ncy5vbkhpZGUoZS4kZWxlbWVudCxlLmVsZW1lbnQsZSksZS5tb2RlPVwiaGlkZVwiLHIub2ZmKFwicmVzaXplLlwiK2ksbnVsbCxcInRpcHNvUmVzaXplSGFuZGxlclwiKX0pOnMuc3RvcCghMCwhMCkucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbkluKS5hZGRDbGFzcyhcIm5vQW5pbWF0aW9uXCIpLnJlbW92ZUNsYXNzKFwibm9BbmltYXRpb25cIikuYWRkQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbk91dCkub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7dCh0aGlzKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uT3V0KS5yZW1vdmUoKSx0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vbkhpZGUpJiZcInNob3dcIj09PWUubW9kZSYmZS5zZXR0aW5ncy5vbkhpZGUoZS4kZWxlbWVudCxlLmVsZW1lbnQsZSksZS5tb2RlPVwiaGlkZVwiLHIub2ZmKFwicmVzaXplLlwiK2ksbnVsbCxcInRpcHNvUmVzaXplSGFuZGxlclwiKX0pKX0sbil9LGNsb3NlOmZ1bmN0aW9uKCl7dGhpcy5oaWRlKCEwKX0sZGVzdHJveTpmdW5jdGlvbigpe3t2YXIgdD10aGlzLiRlbGVtZW50LG89dGhpcy53aW47dGhpcy5kb2N9dC5vZmYoXCIuXCIraSksby5vZmYoXCJyZXNpemUuXCIraSxudWxsLFwidGlwc29SZXNpemVIYW5kbGVyXCIpLHQucmVtb3ZlRGF0YShpKSx0LnJlbW92ZUNsYXNzKFwidGlwc29fc3R5bGVcIikuYXR0cihcInRpdGxlXCIsdGhpcy5fdGl0bGUpfSx0aXRsZUNvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgdCxvPXRoaXMuJGVsZW1lbnQsZT10aGlzO3JldHVybiB0PWUuc2V0dGluZ3MudGl0bGVDb250ZW50P2Uuc2V0dGluZ3MudGl0bGVDb250ZW50Om8uZGF0YShcInRpcHNvLXRpdGxlXCIpfSxjb250ZW50OmZ1bmN0aW9uKCl7dmFyIG8sZT10aGlzLiRlbGVtZW50LHI9dGhpcyxzPXRoaXMuX3RpdGxlO3JldHVybiByLnNldHRpbmdzLmFqYXhDb250ZW50VXJsP3IuX2FqYXhDb250ZW50P289ci5fYWpheENvbnRlbnQ6KHIuX2FqYXhDb250ZW50PW89dC5hamF4KHt0eXBlOlwiR0VUXCIsdXJsOnIuc2V0dGluZ3MuYWpheENvbnRlbnRVcmwsYXN5bmM6ITF9KS5yZXNwb25zZVRleHQsci5zZXR0aW5ncy5hamF4Q29udGVudEJ1ZmZlcj4wP3NldFRpbWVvdXQoZnVuY3Rpb24oKXtyLl9hamF4Q29udGVudD1udWxsfSxyLnNldHRpbmdzLmFqYXhDb250ZW50QnVmZmVyKTpyLl9hamF4Q29udGVudD1udWxsKTpyLnNldHRpbmdzLmNvbnRlbnRFbGVtZW50SWQ/bz10KFwiI1wiK3Iuc2V0dGluZ3MuY29udGVudEVsZW1lbnRJZCkudGV4dCgpOnIuc2V0dGluZ3MuY29udGVudD9vPXIuc2V0dGluZ3MuY29udGVudDpyLnNldHRpbmdzLnVzZVRpdGxlPT09ITA/bz1zOlwic3RyaW5nXCI9PXR5cGVvZiBlLmRhdGEoXCJ0aXBzb1wiKSYmKG89ZS5kYXRhKFwidGlwc29cIikpLG51bGwhPT1yLnNldHRpbmdzLnRlbXBsYXRlRW5naW5lRnVuYyYmKG89ci5zZXR0aW5ncy50ZW1wbGF0ZUVuZ2luZUZ1bmMobykpLG99LHVwZGF0ZTpmdW5jdGlvbih0LG8pe3ZhciBlPXRoaXM7cmV0dXJuIG8/dm9pZChlLnNldHRpbmdzW3RdPW8pOmUuc2V0dGluZ3NbdF19fSk7dmFyIGE9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKS5zdHlsZSxvPVtcIm1zXCIsXCJPXCIsXCJNb3pcIixcIldlYmtpdFwiXTtpZihcIlwiPT09dC50cmFuc2l0aW9uKXJldHVybiEwO2Zvcig7by5sZW5ndGg7KWlmKG8ucG9wKCkrXCJUcmFuc2l0aW9uXCJpbiB0KXJldHVybiEwO3JldHVybiExfSgpO3RbaV09dC5mbltpXT1mdW5jdGlvbihlKXt2YXIgcj1hcmd1bWVudHM7aWYodm9pZCAwPT09ZXx8XCJvYmplY3RcIj09dHlwZW9mIGUpcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiB0fHx0LmV4dGVuZChuLGUpLHRoaXMuZWFjaChmdW5jdGlvbigpe3QuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2kpfHx0LmRhdGEodGhpcyxcInBsdWdpbl9cIitpLG5ldyBvKHRoaXMsZSkpfSk7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGUmJlwiX1wiIT09ZVswXSYmXCJpbml0XCIhPT1lKXt2YXIgcztyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIG49dC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSk7bnx8KG49dC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSxuZXcgbyh0aGlzLGUpKSksbiBpbnN0YW5jZW9mIG8mJlwiZnVuY3Rpb25cIj09dHlwZW9mIG5bZV0mJihzPW5bZV0uYXBwbHkobixBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChyLDEpKSksXCJkZXN0cm95XCI9PT1lJiZ0LmRhdGEodGhpcyxcInBsdWdpbl9cIitpLG51bGwpfSksdm9pZCAwIT09cz9zOnRoaXN9fX0pOyIsInZhciBteVRvb2x0aXAgPSBmdW5jdGlvbigpIHtcbiAgICAkKCdbZGF0YS10b2dnbGU9dG9vbHRpcF0nKS50aXBzbyh7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjNEE0QTRBJyxcbiAgICAgICAgc2l6ZTogJ3NtYWxsJyxcbiAgICAgICAgZGVsYXk6IDEwMCxcbiAgICAgICAgc3BlZWQ6IDEwMCxcbiAgICAgICAgb25CZWZvcmVTaG93OiBmdW5jdGlvbiAoZWxlLCB0aXBzbykge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50ID0gZWxlLmRhdGEoJ29yaWdpbmFsLXRpdGxlJyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn0oKTtcbiIsInZhciBub3RpZmljYXRpb24gPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBjb250ZWluZXI7XG4gIHZhciBtb3VzZU92ZXIgPSAwO1xuICB2YXIgdGltZXJDbGVhckFsbCA9IG51bGw7XG4gIHZhciBhbmltYXRpb25FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCc7XG4gIHZhciB0aW1lID0gMTAwMDA7XG5cbiAgdmFyIG5vdGlmaWNhdGlvbl9ib3ggPWZhbHNlO1xuICB2YXIgaXNfaW5pdD1mYWxzZTtcbiAgdmFyIGNvbmZpcm1fb3B0PXtcbiAgICB0aXRsZTpcItCj0LTQsNC70LXQvdC40LVcIixcbiAgICBxdWVzdGlvbjpcItCS0Ysg0LTQtdC50YHRgtCy0LjRgtC10LvRjNC90L4g0YXQvtGC0LjRgtC1INGD0LTQsNC70LjRgtGMP1wiLFxuICAgIGJ1dHRvblllczpcItCU0LBcIixcbiAgICBidXR0b25ObzpcItCd0LXRglwiLFxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxuICAgIGNhbGxiYWNrTm86ZmFsc2UsXG4gICAgb2JqOmZhbHNlLFxuICAgIGJ1dHRvblRhZzonZGl2JyxcbiAgICBidXR0b25ZZXNEb3A6JycsXG4gICAgYnV0dG9uTm9Eb3A6JycsXG4gIH07XG4gIHZhciBhbGVydF9vcHQ9e1xuICAgIHRpdGxlOlwiXCIsXG4gICAgcXVlc3Rpb246XCLQodC+0L7QsdGJ0LXQvdC40LVcIixcbiAgICBidXR0b25ZZXM6XCLQlNCwXCIsXG4gICAgY2FsbGJhY2tZZXM6ZmFsc2UsXG4gICAgYnV0dG9uVGFnOidkaXYnLFxuICAgIG9iajpmYWxzZSxcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIGluaXQoKXtcbiAgICBpc19pbml0PXRydWU7XG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xuICAgIGlmKG5vdGlmaWNhdGlvbl9ib3gubGVuZ3RoPjApcmV0dXJuO1xuXG4gICAgJCgnYm9keScpLmFwcGVuZChcIjxkaXYgY2xhc3M9J25vdGlmaWNhdGlvbl9ib3gnPjwvZGl2PlwiKTtcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XG5cbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsJy5ub3RpZnlfY29udHJvbCcsY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2Nsb3NlJyxjbG9zZU1vZGFsKTtcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsY2xvc2VNb2RhbEZvbik7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCl7XG4gICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xuICAgICQoJy5ub3RpZmljYXRpb25fYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoJycpXG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpe1xuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgaWYodGFyZ2V0LmNsYXNzTmFtZT09XCJub3RpZmljYXRpb25fYm94XCIpe1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBfc2V0VXBMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5ub3RpZmljYXRpb25fY2xvc2UnLCBfY2xvc2VQb3B1cCk7XG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcbiAgfTtcblxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwhPW51bGwpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lckNsZWFyQWxsKTtcbiAgICAgIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xuICAgIH1cbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbihpKXtcbiAgICAgIHZhciBvcHRpb249JCh0aGlzKS5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmKG9wdGlvbi50aW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAxO1xuICB9O1xuXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKGkpe1xuICAgICAgJHRoaXM9JCh0aGlzKTtcbiAgICAgIHZhciBvcHRpb249JHRoaXMuZGF0YSgnb3B0aW9uJyk7XG4gICAgICBpZihvcHRpb24udGltZT4wKSB7XG4gICAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChvcHRpb24uY2xvc2UpLCBvcHRpb24udGltZSAtIDE1MDAgKyAxMDAgKiBpKTtcbiAgICAgICAgJHRoaXMuZGF0YSgnb3B0aW9uJyxvcHRpb24pXG4gICAgICB9XG4gICAgfSk7XG4gICAgbW91c2VPdmVyID0gMDtcbiAgfTtcblxuICB2YXIgX2Nsb3NlUG9wdXAgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpO1xuICAgICR0aGlzLm9uKGFuaW1hdGlvbkVuZCwgZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgIH0pO1xuICAgICR0aGlzLmFkZENsYXNzKCdub3RpZmljYXRpb25faGlkZScpXG4gIH07XG5cbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSl7XG4gICAgaWYoIWRhdGEpZGF0YT17fTtcbiAgICBkYXRhPW9iamVjdHMoYWxlcnRfb3B0LGRhdGEpO1xuXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xuXG4gICAgbm90eWZ5X2NsYXNzPSdub3RpZnlfYm94ICc7XG4gICAgaWYoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzKz1kYXRhLm5vdHlmeV9jbGFzcztcblxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwiJytub3R5ZnlfY2xhc3MrJ1wiPic7XG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPCcrZGF0YS5idXR0b25UYWcrJyBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCIgJytkYXRhLmJ1dHRvblllc0RvcCsnPicgKyBkYXRhLmJ1dHRvblllcyArICc8LycrZGF0YS5idXR0b25UYWcrJz4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJytkYXRhLmJ1dHRvbk5vRG9wKyc+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH07XG5cbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LDEwMClcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbmZpcm0oZGF0YSl7XG4gICAgaWYoIWRhdGEpZGF0YT17fTtcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XG5cbiAgICBpZighaXNfaW5pdClpbml0KCk7XG5cbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3hcIj4nO1xuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cblxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tZZXMuYmluZChkYXRhLm9iaikpO1xuICAgIH1cbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LDEwMClcblxuICB9XG5cbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcbiAgICBpZighZGF0YSlkYXRhPXt9O1xuICAgIHZhciBvcHRpb24gPSB7dGltZSA6IChkYXRhLnRpbWV8fGRhdGEudGltZT09PTApP2RhdGEudGltZTp0aW1lfTtcbiAgICBpZiAoIWNvbnRlaW5lcikge1xuICAgICAgY29udGVpbmVyID0gJCgnPHVsLz4nLCB7XG4gICAgICAgICdjbGFzcyc6ICdub3RpZmljYXRpb25fY29udGFpbmVyJ1xuICAgICAgfSk7XG5cbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoY29udGVpbmVyKTtcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xuICAgIH1cblxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25faXRlbSdcbiAgICB9KTtcblxuICAgIGlmIChkYXRhLnR5cGUpe1xuICAgICAgbGkuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9pdGVtLScgKyBkYXRhLnR5cGUpO1xuICAgIH1cblxuICAgIHZhciBjbG9zZT0kKCc8c3Bhbi8+Jyx7XG4gICAgICBjbGFzczonbm90aWZpY2F0aW9uX2Nsb3NlJ1xuICAgIH0pO1xuICAgIG9wdGlvbi5jbG9zZT1jbG9zZTtcbiAgICBsaS5hcHBlbmQoY2xvc2UpO1xuXG4gICAgdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcbiAgICAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxuICAgIH0pO1xuXG4gICAgaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XG4gICAgICB2YXIgdGl0bGUgPSAkKCc8aDUvPicsIHtcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcbiAgICAgIH0pO1xuICAgICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlKTtcbiAgICB9XG5cbiAgICB2YXIgdGV4dD0gJCgnPGRpdi8+Jyx7XG4gICAgICBjbGFzczpcIm5vdGlmaWNhdGlvbl90ZXh0XCJcbiAgICB9KTtcbiAgICB0ZXh0Lmh0bWwoZGF0YS5tZXNzYWdlKTtcblxuICAgIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XG4gICAgICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcbiAgICAgIH0pO1xuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XG4gICAgICB2YXIgd3JhcCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwid3JhcFwiXG4gICAgICB9KTtcblxuICAgICAgd3JhcC5hcHBlbmQoaW1nKTtcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xuICAgICAgY29udGVudC5hcHBlbmQod3JhcCk7XG4gICAgfWVsc2V7XG4gICAgICBjb250ZW50LmFwcGVuZCh0ZXh0KTtcbiAgICB9XG4gICAgbGkuYXBwZW5kKGNvbnRlbnQpO1xuXG4gICAgLy9cbiAgICAvLyBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcbiAgICAvLyAgIHZhciB0aXRsZSA9ICQoJzxwLz4nLCB7XG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXG4gICAgLy8gICB9KTtcbiAgICAvLyAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XG4gICAgLy8gICBsaS5hcHBlbmQodGl0bGUpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XG4gICAgLy8gICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcbiAgICAvLyAgIH0pO1xuICAgIC8vICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XG4gICAgLy8gICBsaS5hcHBlbmQoaW1nKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xuICAgIC8vICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXG4gICAgLy8gfSk7XG4gICAgLy8gY29udGVudC5odG1sKGRhdGEubWVzc2FnZSk7XG4gICAgLy9cbiAgICAvLyBsaS5hcHBlbmQoY29udGVudCk7XG4gICAgLy9cbiAgICAgY29udGVpbmVyLmFwcGVuZChsaSk7XG5cbiAgICBpZihvcHRpb24udGltZT4wKXtcbiAgICAgIG9wdGlvbi50aW1lcj1zZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQoY2xvc2UpLCBvcHRpb24udGltZSk7XG4gICAgfVxuICAgIGxpLmRhdGEoJ29wdGlvbicsb3B0aW9uKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhbGVydDogYWxlcnQsXG4gICAgY29uZmlybTogY29uZmlybSxcbiAgICBub3RpZmk6IG5vdGlmaSxcbiAgfTtcblxufSkoKTtcblxuXG4kKCdbcmVmPXBvcHVwXScpLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpe1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzPSQodGhpcyk7XG4gIGVsPSQoJHRoaXMuYXR0cignaHJlZicpKTtcbiAgZGF0YT1lbC5kYXRhKCk7XG5cbiAgZGF0YS5xdWVzdGlvbj1lbC5odG1sKCk7XG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcbn0pO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywnLm1vZGFsc19vcGVuJyxmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG5cbiAgICAgICAgLy/Qv9GA0Lgg0L7RgtC60YDRi9GC0LjQuCDRhNC+0YDQvNGLINGA0LXQs9C40YHRgtGA0LDRhtC40Lgg0LfQsNC60YDRi9GC0YwsINC10YHQu9C4INC+0YLRgNGL0YLQviAtINC/0L7Qv9Cw0L8g0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40Y8g0LrRg9C/0L7QvdCwINCx0LXQtyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4XG4gICAgICAgIHZhciBwb3B1cCA9ICQoXCJhW2hyZWY9JyNzaG93cHJvbW9jb2RlLW5vcmVnaXN0ZXInXVwiKS5kYXRhKCdwb3B1cCcpO1xuICAgICAgICBpZiAocG9wdXApIHtcbiAgICAgICAgICAgIHBvcHVwLmNsb3NlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3B1cCA9ICQoJ2Rpdi5wb3B1cF9jb250LCBkaXYucG9wdXBfYmFjaycpO1xuICAgICAgICAgICAgaWYgKHBvcHVwKSB7XG4gICAgICAgICAgICAgICAgcG9wdXAuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcbiAgICAgICAgaHJlZj1ocmVmW2hyZWYubGVuZ3RoLTFdO1xuXG4gICAgICAgIGRhdGE9e1xuICAgICAgICAgICAgYnV0dG9uWWVzOmZhbHNlLFxuICAgICAgICAgICAgbm90eWZ5X2NsYXNzOlwibG9hZGluZyBcIisoaHJlZi5pbmRleE9mKCd2aWRlbycpPT09MD8nbW9kYWxzLWZ1bGxfc2NyZWVuJzonbm90aWZ5X3doaXRlJyksXG4gICAgICAgICAgICBxdWVzdGlvbjonJ1xuICAgICAgICB9O1xuICAgICAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG5cbiAgICAgICAgJC5nZXQoJy8nK2hyZWYsZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAkKCcubm90aWZ5X2JveCcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAgICAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKGRhdGEuaHRtbCk7XG4gICAgICAgICAgICBhamF4Rm9ybSgkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKSk7XG4gICAgICAgIH0sJ2pzb24nKTtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSlcbn0oKSk7XG4iLCIkKCcuZm9vdGVyLW1lbnUtdGl0bGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAkdGhpcz0kKHRoaXMpO1xuICBpZigkdGhpcy5oYXNDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpKXtcbiAgICAkdGhpcy5yZW1vdmVDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpXG4gIH1lbHNle1xuICAgICQoJy5mb290ZXItbWVudS10aXRsZV9vcGVuJykucmVtb3ZlQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKTtcbiAgICAkdGhpcy5hZGRDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpO1xuICB9XG5cbn0pOyIsIiQoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBzdGFyTm9taW5hdGlvbihpbmRleCkge1xuICAgIHZhciBzdGFycyA9ICQoXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIpO1xuICAgIHN0YXJzLmFkZENsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcbiAgICAgIHN0YXJzLmVxKGkpLnJlbW92ZUNsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcbiAgICB9XG4gIH1cblxuICAkKGRvY3VtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcbiAgfSkub24oXCJtb3VzZWxlYXZlXCIsIFwiLnJhdGluZy13cmFwcGVyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoKSk7XG4gIH0pLm9uKFwiY2xpY2tcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XG5cbiAgICAkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgkKHRoaXMpLmluZGV4KCkgKyAxKTtcbiAgfSk7XG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICB2YXIgJG5vdHlmaV9idG49JCgnLmhlYWRlci1sb2dvX25vdHknKTtcbiAgaWYoJG5vdHlmaV9idG4ubGVuZ3RoPT0xKXJldHVybjtcblxuICAkLmdldCgnL2FjY291bnQvbm90aWZpY2F0aW9uJyxmdW5jdGlvbihkYXRhKXtcbiAgICBpZighZGF0YS5ub3RpZmljYXRpb25zIHx8IGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGg9PTApIHJldHVybjtcblxuICAgIHZhciBvdXQ9JzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktYm94Pjx1bCBjbGFzcz1cImhlYWRlci1ub3R5LWxpc3RcIj4nO1xuICAgICRub3R5ZmlfYnRuLmZpbmQoJ2EnKS5yZW1vdmVBdHRyKCdocmVmJyk7XG4gICAgdmFyIGhhc19uZXc9ZmFsc2U7XG4gICAgZm9yICh2YXIgaT0wO2k8ZGF0YS5ub3RpZmljYXRpb25zLmxlbmd0aDtpKyspe1xuICAgICAgZWw9ZGF0YS5ub3RpZmljYXRpb25zW2ldO1xuICAgICAgdmFyIGlzX25ldz0oZWwuaXNfdmlld2VkPT0wICYmIGVsLnR5cGVfaWQ9PTIpXG4gICAgICBvdXQrPSc8bGkgY2xhc3M9XCJoZWFkZXItbm90eS1pdGVtJysoaXNfbmV3PycgaGVhZGVyLW5vdHktaXRlbV9uZXcnOicnKSsnXCI+JztcbiAgICAgIG91dCs9JzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktZGF0YT4nK2VsLmRhdGErJzwvZGl2Pic7XG4gICAgICBvdXQrPSc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LXRleHQ+JytlbC50ZXh0Kyc8L2Rpdj4nO1xuICAgICAgb3V0Kz0nPC9saT4nO1xuICAgICAgaGFzX25ldz1oYXNfbmV3fHxpc19uZXc7XG4gICAgfVxuXG4gICAgb3V0Kz0nPC91bD4nO1xuICAgIG91dCs9JzxhIGNsYXNzPVwiYnRuXCIgaHJlZj1cIi9hY2NvdW50L25vdGlmaWNhdGlvblwiPicrZGF0YS5idG4rJzwvYT4nO1xuICAgIG91dCs9JzwvZGl2Pic7XG4gICAgJCgnLmhlYWRlcicpLmFwcGVuZChvdXQpO1xuXG4gICAgaWYoaGFzX25ldyl7XG4gICAgICAkbm90eWZpX2J0bi5hZGRDbGFzcygndG9vbHRpcCcpLmFkZENsYXNzKCdoYXMtbm90eScpO1xuICAgIH1cblxuICAgICRub3R5ZmlfYnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZigkKCcuaGVhZGVyLW5vdHktYm94JykuaGFzQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJykpe1xuICAgICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xuICAgICAgfWVsc2V7XG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5hZGRDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcbiAgICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XG5cbiAgICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcygnaGFzLW5vdHknKSl7XG4gICAgICAgICAgJC5wb3N0KCcvYWNjb3VudC9ub3RpZmljYXRpb24nLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKCcuaGVhZGVyLWxvZ29fbm90eScpLnJlbW92ZUNsYXNzKCd0b29sdGlwJykucmVtb3ZlQ2xhc3MoJ2hhcy1ub3R5Jyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XG4gICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcbiAgICB9KTtcblxuICAgICQoJy5oZWFkZXItbm90eS1saXN0Jykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KVxuICB9LCdqc29uJyk7XG5cbn0pKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWVnYXNsaWRlciA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHNsaWRlcl9kYXRhPWZhbHNlO1xuICB2YXIgY29udGFpbmVyX2lkPVwic2VjdGlvbiNtZWdhX3NsaWRlclwiO1xuICB2YXIgcGFyYWxsYXhfZ3JvdXA9ZmFsc2U7XG4gIHZhciBwYXJhbGxheF90aW1lcj1mYWxzZTtcbiAgdmFyIHBhcmFsbGF4X2NvdW50ZXI9MDtcbiAgdmFyIHBhcmFsbGF4X2Q9MTtcbiAgdmFyIG1vYmlsZV9tb2RlPS0xO1xuICB2YXIgbWF4X3RpbWVfbG9hZF9waWM9MzAwO1xuICB2YXIgbW9iaWxlX3NpemU9NzAwO1xuICB2YXIgcmVuZGVyX3NsaWRlX25vbT0wO1xuICB2YXIgdG90X2ltZ193YWl0O1xuICB2YXIgc2xpZGVzO1xuICB2YXIgc2xpZGVfc2VsZWN0X2JveDtcbiAgdmFyIGVkaXRvcjtcbiAgdmFyIHRpbWVvdXRJZDtcbiAgdmFyIHNjcm9sbF9wZXJpb2QgPSA1MDAwO1xuXG4gIHZhciBwb3NBcnI9W1xuICAgICdzbGlkZXJfX3RleHQtbHQnLCdzbGlkZXJfX3RleHQtY3QnLCdzbGlkZXJfX3RleHQtcnQnLFxuICAgICdzbGlkZXJfX3RleHQtbGMnLCdzbGlkZXJfX3RleHQtY2MnLCdzbGlkZXJfX3RleHQtcmMnLFxuICAgICdzbGlkZXJfX3RleHQtbGInLCdzbGlkZXJfX3RleHQtY2InLCdzbGlkZXJfX3RleHQtcmInLFxuICBdO1xuICB2YXIgcG9zX2xpc3Q9W1xuICAgICfQm9C10LLQviDQstC10YDRhScsJ9GG0LXQvdGC0YAg0LLQtdGA0YUnLCfQv9GA0LDQstC+INCy0LXRgNGFJyxcbiAgICAn0JvQtdCy0L4g0YbQtdC90YLRgCcsJ9GG0LXQvdGC0YAnLCfQv9GA0LDQstC+INGG0LXQvdGC0YAnLFxuICAgICfQm9C10LLQviDQvdC40LcnLCfRhtC10L3RgtGAINC90LjQtycsJ9C/0YDQsNCy0L4g0L3QuNC3JyxcbiAgXTtcbiAgdmFyIHNob3dfZGVsYXk9W1xuICAgICdzaG93X25vX2RlbGF5JyxcbiAgICAnc2hvd19kZWxheV8wNScsXG4gICAgJ3Nob3dfZGVsYXlfMTAnLFxuICAgICdzaG93X2RlbGF5XzE1JyxcbiAgICAnc2hvd19kZWxheV8yMCcsXG4gICAgJ3Nob3dfZGVsYXlfMjUnLFxuICAgICdzaG93X2RlbGF5XzMwJ1xuICBdO1xuICB2YXIgaGlkZV9kZWxheT1bXG4gICAgJ2hpZGVfbm9fZGVsYXknLFxuICAgICdoaWRlX2RlbGF5XzA1JyxcbiAgICAnaGlkZV9kZWxheV8xMCcsXG4gICAgJ2hpZGVfZGVsYXlfMTUnLFxuICAgICdoaWRlX2RlbGF5XzIwJ1xuICBdO1xuICB2YXIgeWVzX25vX2Fycj1bXG4gICAgJ25vJyxcbiAgICAneWVzJ1xuICBdO1xuICB2YXIgeWVzX25vX3ZhbD1bXG4gICAgJycsXG4gICAgJ2ZpeGVkX19mdWxsLWhlaWdodCdcbiAgXTtcbiAgdmFyIGJ0bl9zdHlsZT1bXG4gICAgJ25vbmUnLFxuICAgICdib3JkbycsXG4gIF07XG4gIHZhciBzaG93X2FuaW1hdGlvbnM9W1xuICAgIFwibm90X2FuaW1hdGVcIixcbiAgICBcImJvdW5jZUluXCIsXG4gICAgXCJib3VuY2VJbkRvd25cIixcbiAgICBcImJvdW5jZUluTGVmdFwiLFxuICAgIFwiYm91bmNlSW5SaWdodFwiLFxuICAgIFwiYm91bmNlSW5VcFwiLFxuICAgIFwiZmFkZUluXCIsXG4gICAgXCJmYWRlSW5Eb3duXCIsXG4gICAgXCJmYWRlSW5MZWZ0XCIsXG4gICAgXCJmYWRlSW5SaWdodFwiLFxuICAgIFwiZmFkZUluVXBcIixcbiAgICBcImZsaXBJblhcIixcbiAgICBcImZsaXBJbllcIixcbiAgICBcImxpZ2h0U3BlZWRJblwiLFxuICAgIFwicm90YXRlSW5cIixcbiAgICBcInJvdGF0ZUluRG93bkxlZnRcIixcbiAgICBcInJvdGF0ZUluVXBMZWZ0XCIsXG4gICAgXCJyb3RhdGVJblVwUmlnaHRcIixcbiAgICBcImphY2tJblRoZUJveFwiLFxuICAgIFwicm9sbEluXCIsXG4gICAgXCJ6b29tSW5cIlxuICBdO1xuXG4gIHZhciBoaWRlX2FuaW1hdGlvbnM9W1xuICAgIFwibm90X2FuaW1hdGVcIixcbiAgICBcImJvdW5jZU91dFwiLFxuICAgIFwiYm91bmNlT3V0RG93blwiLFxuICAgIFwiYm91bmNlT3V0TGVmdFwiLFxuICAgIFwiYm91bmNlT3V0UmlnaHRcIixcbiAgICBcImJvdW5jZU91dFVwXCIsXG4gICAgXCJmYWRlT3V0XCIsXG4gICAgXCJmYWRlT3V0RG93blwiLFxuICAgIFwiZmFkZU91dExlZnRcIixcbiAgICBcImZhZGVPdXRSaWdodFwiLFxuICAgIFwiZmFkZU91dFVwXCIsXG4gICAgXCJmbGlwT3V0WFwiLFxuICAgIFwibGlwT3V0WVwiLFxuICAgIFwibGlnaHRTcGVlZE91dFwiLFxuICAgIFwicm90YXRlT3V0XCIsXG4gICAgXCJyb3RhdGVPdXREb3duTGVmdFwiLFxuICAgIFwicm90YXRlT3V0RG93blJpZ2h0XCIsXG4gICAgXCJyb3RhdGVPdXRVcExlZnRcIixcbiAgICBcInJvdGF0ZU91dFVwUmlnaHRcIixcbiAgICBcImhpbmdlXCIsXG4gICAgXCJyb2xsT3V0XCJcbiAgXTtcbiAgdmFyIHN0VGFibGU7XG4gIHZhciBwYXJhbGF4VGFibGU7XG5cbiAgZnVuY3Rpb24gaW5pdEltYWdlU2VydmVyU2VsZWN0KGVscykge1xuICAgIGlmKGVscy5sZW5ndGg9PTApcmV0dXJuO1xuICAgIGVscy53cmFwKCc8ZGl2IGNsYXNzPVwic2VsZWN0X2ltZ1wiPicpO1xuICAgIGVscz1lbHMucGFyZW50KCk7XG4gICAgZWxzLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmaWxlX2J1dHRvblwiPjxpIGNsYXNzPVwibWNlLWljbyBtY2UtaS1icm93c2VcIj48L2k+PC9idXR0b24+Jyk7XG4gICAgLyplbHMuZmluZCgnYnV0dG9uJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcjcm94eUN1c3RvbVBhbmVsMicpLmFkZENsYXNzKCdvcGVuJylcbiAgICB9KTsqL1xuICAgIGZvciAodmFyIGk9MDtpPGVscy5sZW5ndGg7aSsrKSB7XG4gICAgICB2YXIgZWw9ZWxzLmVxKGkpLmZpbmQoJ2lucHV0Jyk7XG4gICAgICBpZighZWwuYXR0cignaWQnKSl7XG4gICAgICAgIGVsLmF0dHIoJ2lkJywnZmlsZV8nK2krJ18nK0RhdGUubm93KCkpXG4gICAgICB9XG4gICAgICB2YXIgdF9pZD1lbC5hdHRyKCdpZCcpO1xuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLnJlZ2lzdGVyKHRfaWQsIGZ1bmN0aW9uIChmaWxlLCBpZCkge1xuICAgICAgICAvLyQodGhpcykudmFsKGZpbGUudXJsKS50cmlnZ2VyKCdjaGFuZ2UnLCBbZmlsZSwgaWRdKTtcbiAgICAgICAgJCgnIycraWQpLnZhbChmaWxlLnVybCkuY2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZmlsZV9idXR0b24nLCBmdW5jdGlvbigpe1xuICAgICAgdmFyICR0aGlzPSQodGhpcykucHJldigpO1xuICAgICAgdmFyIGlkPSR0aGlzLmF0dHIoJ2lkJyk7XG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIub3Blbk1hbmFnZXIoe1xuICAgICAgICBcInVybFwiOlwiL21hbmFnZXIvZWxmaW5kZXI/ZmlsdGVyPWltYWdlJmNhbGxiYWNrPVwiK2lkK1wiJmxhbmc9cnVcIixcbiAgICAgICAgXCJ3aWR0aFwiOlwiYXV0b1wiLFxuICAgICAgICBcImhlaWdodFwiOlwiYXV0b1wiLFxuICAgICAgICBcImlkXCI6aWRcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuSW5wdXQoZGF0YSl7XG4gICAgdmFyIGlucHV0PSc8aW5wdXQgY2xhc3M9XCInICsgKGRhdGEuaW5wdXRDbGFzcyB8fCAnJykgKyAnXCIgdmFsdWU9XCInICsgKGRhdGEudmFsdWUgfHwgJycpICsgJ1wiPic7XG4gICAgaWYoZGF0YS5sYWJlbCkge1xuICAgICAgaW5wdXQgPSAnPGxhYmVsPjxzcGFuPicgKyBkYXRhLmxhYmVsICsgJzwvc3Bhbj4nK2lucHV0Kyc8L2xhYmVsPic7XG4gICAgfVxuICAgIGlmKGRhdGEucGFyZW50KSB7XG4gICAgICBpbnB1dCA9ICc8JytkYXRhLnBhcmVudCsnPicraW5wdXQrJzwvJytkYXRhLnBhcmVudCsnPic7XG4gICAgfVxuICAgIGlucHV0ID0gJChpbnB1dCk7XG5cbiAgICBpZihkYXRhLm9uQ2hhbmdlKXtcbiAgICAgIHZhciBvbkNoYW5nZTtcbiAgICAgIGlmKGRhdGEuYmluZCl7XG4gICAgICAgIGRhdGEuYmluZC5pbnB1dD1pbnB1dC5maW5kKCdpbnB1dCcpO1xuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChkYXRhLmJpbmQpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGlucHV0LmZpbmQoJ2lucHV0JykpO1xuICAgICAgfVxuICAgICAgaW5wdXQuZmluZCgnaW5wdXQnKS5vbignY2hhbmdlJyxvbkNoYW5nZSlcbiAgICB9XG4gICAgcmV0dXJuIGlucHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuU2VsZWN0KGRhdGEpe1xuICAgIHZhciBpbnB1dD0kKCc8c2VsZWN0Lz4nKTtcblxuICAgIHZhciBlbD1zbGlkZXJfZGF0YVswXVtkYXRhLmdyXTtcbiAgICBpZihkYXRhLmluZGV4IT09ZmFsc2Upe1xuICAgICAgZWw9ZWxbZGF0YS5pbmRleF07XG4gICAgfVxuXG4gICAgaWYoZWxbZGF0YS5wYXJhbV0pe1xuICAgICAgZGF0YS52YWx1ZT1lbFtkYXRhLnBhcmFtXTtcbiAgICB9ZWxzZXtcbiAgICAgIGRhdGEudmFsdWU9MDtcbiAgICB9XG5cbiAgICBpZihkYXRhLnN0YXJ0X29wdGlvbil7XG4gICAgICBpbnB1dC5hcHBlbmQoZGF0YS5zdGFydF9vcHRpb24pXG4gICAgfVxuXG4gICAgZm9yKHZhciBpPTA7aTxkYXRhLmxpc3QubGVuZ3RoO2krKyl7XG4gICAgICB2YXIgdmFsO1xuICAgICAgdmFyIHR4dD1kYXRhLmxpc3RbaV07XG4gICAgICBpZihkYXRhLnZhbF90eXBlPT0wKXtcbiAgICAgICAgdmFsPWRhdGEubGlzdFtpXTtcbiAgICAgIH1lbHNlIGlmKGRhdGEudmFsX3R5cGU9PTEpe1xuICAgICAgICB2YWw9aTtcbiAgICAgIH1lbHNlIGlmKGRhdGEudmFsX3R5cGU9PTIpe1xuICAgICAgICAvL3ZhbD1kYXRhLnZhbF9saXN0W2ldO1xuICAgICAgICB2YWw9aTtcbiAgICAgICAgdHh0PWRhdGEudmFsX2xpc3RbaV07XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWw9KHZhbD09ZGF0YS52YWx1ZT8nc2VsZWN0ZWQnOicnKTtcbiAgICAgIGlmKHNlbD09J3NlbGVjdGVkJyl7XG4gICAgICAgIGlucHV0LmF0dHIoJ3RfdmFsJyxkYXRhLmxpc3RbaV0pO1xuICAgICAgfVxuICAgICAgdmFyIG9wdGlvbj0nPG9wdGlvbiB2YWx1ZT1cIicrdmFsKydcIiAnK3NlbCsnPicrdHh0Kyc8L29wdGlvbj4nO1xuICAgICAgaWYoZGF0YS52YWxfdHlwZT09Mil7XG4gICAgICAgIG9wdGlvbj0kKG9wdGlvbikuYXR0cignY29kZScsZGF0YS5saXN0W2ldKTtcbiAgICAgIH1cbiAgICAgIGlucHV0LmFwcGVuZChvcHRpb24pXG4gICAgfVxuXG4gICAgaW5wdXQub24oJ2NoYW5nZScsZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YT10aGlzO1xuICAgICAgdmFyIHZhbD1kYXRhLmVsLnZhbCgpO1xuICAgICAgdmFyIHNsX29wPWRhdGEuZWwuZmluZCgnb3B0aW9uW3ZhbHVlPScrdmFsKyddJyk7XG4gICAgICB2YXIgY2xzPXNsX29wLnRleHQoKTtcbiAgICAgIHZhciBjaD1zbF9vcC5hdHRyKCdjb2RlJyk7XG4gICAgICBpZighY2gpY2g9Y2xzO1xuICAgICAgaWYoZGF0YS5pbmRleCE9PWZhbHNlKXtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5pbmRleF1bZGF0YS5wYXJhbV09dmFsO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdW2RhdGEucGFyYW1dPXZhbDtcbiAgICAgIH1cblxuICAgICAgZGF0YS5vYmoucmVtb3ZlQ2xhc3MoZGF0YS5wcmVmaXgrZGF0YS5lbC5hdHRyKCd0X3ZhbCcpKTtcbiAgICAgIGRhdGEub2JqLmFkZENsYXNzKGRhdGEucHJlZml4K2NoKTtcbiAgICAgIGRhdGEuZWwuYXR0cigndF92YWwnLGNoKTtcblxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBlbDppbnB1dCxcbiAgICAgIG9iajpkYXRhLm9iaixcbiAgICAgIGdyOmRhdGEuZ3IsXG4gICAgICBpbmRleDpkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ZGF0YS5wYXJhbSxcbiAgICAgIHByZWZpeDpkYXRhLnByZWZpeHx8JydcbiAgICB9KSk7XG5cbiAgICBpZihkYXRhLnBhcmVudCl7XG4gICAgICB2YXIgcGFyZW50PSQoJzwnK2RhdGEucGFyZW50KycvPicpO1xuICAgICAgcGFyZW50LmFwcGVuZChpbnB1dCk7XG4gICAgICByZXR1cm4gcGFyZW50O1xuICAgIH1cbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTZWxBbmltYXRpb25Db250cm9sbChkYXRhKXtcbiAgICB2YXIgYW5pbV9zZWw9W107XG4gICAgdmFyIG91dDtcblxuICAgIGlmKGRhdGEudHlwZT09MCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6c2hvd19hbmltYXRpb25zLFxuICAgICAgdmFsX3R5cGU6MCxcbiAgICAgIG9iajpkYXRhLm9iaixcbiAgICAgIGdyOmRhdGEuZ3IsXG4gICAgICBpbmRleDpkYXRhLmluZGV4LFxuICAgICAgcGFyYW06J3Nob3dfYW5pbWF0aW9uJyxcbiAgICAgIHByZWZpeDonc2xpZGVfJyxcbiAgICAgIHBhcmVudDpkYXRhLnBhcmVudFxuICAgIH0pKTtcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCX0LDQtNC10YDQttC60LAg0L/QvtGP0LLQu9C10L3QuNGPPC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OnNob3dfZGVsYXksXG4gICAgICB2YWxfdHlwZToxLFxuICAgICAgb2JqOmRhdGEub2JqLFxuICAgICAgZ3I6ZGF0YS5ncixcbiAgICAgIGluZGV4OmRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTonc2hvd19kZWxheScsXG4gICAgICBwcmVmaXg6J3NsaWRlXycsXG4gICAgICBwYXJlbnQ6ZGF0YS5wYXJlbnRcbiAgICB9KSk7XG5cbiAgICBpZihkYXRhLnR5cGU9PTApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxici8+Jyk7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvc3Bhbj4nKTtcbiAgICB9XG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDpoaWRlX2FuaW1hdGlvbnMsXG4gICAgICB2YWxfdHlwZTowLFxuICAgICAgb2JqOmRhdGEub2JqLFxuICAgICAgZ3I6ZGF0YS5ncixcbiAgICAgIGluZGV4OmRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTonaGlkZV9hbmltYXRpb24nLFxuICAgICAgcHJlZml4OidzbGlkZV8nLFxuICAgICAgcGFyZW50OmRhdGEucGFyZW50XG4gICAgfSkpO1xuICAgIGlmKGRhdGEudHlwZT09MCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+0JfQsNC00LXRgNC20LrQsCDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6aGlkZV9kZWxheSxcbiAgICAgIHZhbF90eXBlOjEsXG4gICAgICBvYmo6ZGF0YS5vYmosXG4gICAgICBncjpkYXRhLmdyLFxuICAgICAgaW5kZXg6ZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOidoaWRlX2RlbGF5JyxcbiAgICAgIHByZWZpeDonc2xpZGVfJyxcbiAgICAgIHBhcmVudDpkYXRhLnBhcmVudFxuICAgIH0pKTtcblxuICAgIGlmKGRhdGEudHlwZT09MCl7XG4gICAgICBvdXQ9JCgnPGRpdiBjbGFzcz1cImFuaW1fc2VsXCIvPicpO1xuICAgICAgb3V0LmFwcGVuZChhbmltX3NlbCk7XG4gICAgfVxuICAgIGlmKGRhdGEudHlwZT09MSl7XG4gICAgICBvdXQ9YW5pbV9zZWw7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRfZWRpdG9yKCl7XG4gICAgJCgnI3cxJykucmVtb3ZlKCk7XG4gICAgJCgnI3cxX2J1dHRvbicpLnJlbW92ZSgpO1xuICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZT1zbGlkZXJfZGF0YVswXS5tb2JpbGUuc3BsaXQoJz8nKVswXTtcblxuICAgIHZhciBlbD0kKCcjbWVnYV9zbGlkZXJfY29udHJvbGUnKTtcbiAgICB2YXIgYnRuc19ib3g9JCgnPGRpdiBjbGFzcz1cImJ0bl9ib3hcIi8+Jyk7XG5cbiAgICBlbC5hcHBlbmQoJzxoMj7Qo9C/0YDQsNCy0LvQtdC90LjQtTwvaDI+Jyk7XG4gICAgZWwuYXBwZW5kKCQoJzx0ZXh0YXJlYS8+Jyx7XG4gICAgICB0ZXh0OkpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSxcbiAgICAgIGlkOidzbGlkZV9kYXRhJyxcbiAgICAgIG5hbWU6IGVkaXRvclxuICAgIH0pKTtcblxuICAgIHZhciBidG49JCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XG4gICAgYnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnaGlkZV9zbGlkZScpO1xuICAgIH0pO1xuXG4gICAgdmFyIGJ0bj0kKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQlNC10LDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XG4gICAgYnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5hZGRDbGFzcygnaGlkZV9zbGlkZScpO1xuICAgIH0pO1xuICAgIGVsLmFwcGVuZChidG5zX2JveCk7XG5cbiAgICBlbC5hcHBlbmQoJzxoMj7QntCx0YnQuNC1INC/0LDRgNCw0LzQtdGC0YDRizwvaDI+Jyk7XG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOnNsaWRlcl9kYXRhWzBdLm1vYmlsZSxcbiAgICAgIGxhYmVsOlwi0KHQu9Cw0LnQtCDQtNC70Y8g0YLQtdC70LXRhNC+0L3QsFwiLFxuICAgICAgaW5wdXRDbGFzczpcImZpbGVTZWxlY3RcIixcbiAgICAgIG9uQ2hhbmdlOmZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZT0kKHRoaXMpLnZhbCgpXG4gICAgICAgICQoJy5tb2JfYmcnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytzbGlkZXJfZGF0YVswXS5tb2JpbGUrJyknKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTpzbGlkZXJfZGF0YVswXS5mb24sXG4gICAgICBsYWJlbDpcItCe0YHQvdC+0L3QvtC5INGE0L7QvVwiLFxuICAgICAgaW5wdXRDbGFzczpcImZpbGVTZWxlY3RcIixcbiAgICAgIG9uQ2hhbmdlOmZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZvbj0kKHRoaXMpLnZhbCgpXG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytzbGlkZXJfZGF0YVswXS5mb24rJyknKVxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdmFyIGJ0bl9jaD0kKCc8ZGl2IGNsYXNzPVwiYnRuc1wiLz4nKTtcbiAgICBidG5fY2guYXBwZW5kKCc8aDM+0JrQvdC+0L/QutCwINC/0LXRgNC10YXQvtC00LAo0LTQu9GPINCf0Jog0LLQtdGA0YHQuNC4KTwvaDM+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTpzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCxcbiAgICAgIGxhYmVsOlwi0KLQtdC60YHRglwiLFxuICAgICAgb25DaGFuZ2U6ZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQ9JCh0aGlzKS52YWwoKTtcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS50ZXh0KHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0KTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfSxcbiAgICB9KSk7XG5cbiAgICB2YXIgYnV0X3NsPSQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCk7XG5cbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoJzxzcGFuPtCe0YTQvtGA0LzQu9C10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcbiAgICBidG5fY2guYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OmJ0bl9zdHlsZSxcbiAgICAgIHZhbF90eXBlOjAsXG4gICAgICBvYmo6YnV0X3NsLFxuICAgICAgZ3I6J2J1dHRvbicsXG4gICAgICBpbmRleDpmYWxzZSxcbiAgICAgIHBhcmFtOidjb2xvcidcbiAgICB9KSk7XG5cbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoJzxzcGFuPtCf0L7Qu9C+0LbQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDpwb3NBcnIsXG4gICAgICB2YWxfbGlzdDpwb3NfbGlzdCxcbiAgICAgIHZhbF90eXBlOjIsXG4gICAgICBvYmo6YnV0X3NsLnBhcmVudCgpLnBhcmVudCgpLFxuICAgICAgZ3I6J2J1dHRvbicsXG4gICAgICBpbmRleDpmYWxzZSxcbiAgICAgIHBhcmFtOidwb3MnXG4gICAgfSkpO1xuXG4gICAgYnRuX2NoLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XG4gICAgICB0eXBlOjAsXG4gICAgICBvYmo6YnV0X3NsLnBhcmVudCgpLFxuICAgICAgZ3I6J2J1dHRvbicsXG4gICAgICBpbmRleDpmYWxzZVxuICAgIH0pKTtcbiAgICBlbC5hcHBlbmQoYnRuX2NoKTtcblxuICAgIHZhciBsYXllcj0kKCc8ZGl2IGNsYXNzPVwiZml4ZWRfbGF5ZXJcIi8+Jyk7XG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0KHRgtCw0YLQuNGH0LXRgdC60LjQtSDRgdC70L7QuDwvaDI+Jyk7XG4gICAgdmFyIHRoPVwiPHRoPuKEljwvdGg+XCIrXG4gICAgICAgICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIitcbiAgICAgICAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIrXG4gICAgICAgICAgICBcIjx0aD7QodC70L7QuSDQvdCwINCy0YHRjiDQstGL0YHQvtGC0YM8L3RoPlwiK1xuICAgICAgICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiK1xuICAgICAgICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiK1xuICAgICAgICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiK1xuICAgICAgICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiK1xuICAgICAgICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XG4gICAgc3RUYWJsZT0kKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nK3RoKyc8L3RyPjwvdGFibGU+Jyk7XG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxuICAgIHZhciBkYXRhPXNsaWRlcl9kYXRhWzBdLmZpeGVkO1xuICAgIGlmKGRhdGEgJiYgZGF0YS5sZW5ndGg+MCl7XG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKyl7XG4gICAgICAgIGFkZFRyU3RhdGljKGRhdGFbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXllci5hcHBlbmQoc3RUYWJsZSk7XG4gICAgdmFyIGFkZEJ0bj0kKCc8YnV0dG9uLz4nLHtcbiAgICAgIHRleHQ6XCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcbiAgICB9KTtcbiAgICBhZGRCdG4ub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGRhdGEgPSBhZGRUclN0YXRpYyhmYWxzZSk7XG4gICAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZGF0YS5lZGl0b3IuZmluZCgnLmZpbGVTZWxlY3QnKSk7XG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgc2xpZGVyX2RhdGE6c2xpZGVyX2RhdGFcbiAgICB9KSk7XG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XG4gICAgZWwuYXBwZW5kKGxheWVyKTtcblxuICAgIHZhciBsYXllcj0kKCc8ZGl2IGNsYXNzPVwicGFyYWxheF9sYXllclwiLz4nKTtcbiAgICBsYXllci5hcHBlbmQoJzxoMj7Qn9Cw0YDQsNC70LDQutGBINGB0LvQvtC4PC9oMj4nKTtcbiAgICB2YXIgdGg9XCI8dGg+4oSWPC90aD5cIitcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiK1xuICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIitcbiAgICAgIFwiPHRoPtCj0LTQsNC70LXQvdC90L7RgdGC0YwgKNGG0LXQu9C+0LUg0L/QvtC70L7QttC40YLQtdC70YzQvdC+0LUg0YfQuNGB0LvQvik8L3RoPlwiK1xuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XG5cbiAgICBwYXJhbGF4VGFibGU9JCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+Jyt0aCsnPC90cj48L3RhYmxlPicpO1xuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICB2YXIgZGF0YT1zbGlkZXJfZGF0YVswXS5wYXJhbGF4O1xuICAgIGlmKGRhdGEgJiYgZGF0YS5sZW5ndGg+MCl7XG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKyl7XG4gICAgICAgIGFkZFRyUGFyYWxheChkYXRhW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGF5ZXIuYXBwZW5kKHBhcmFsYXhUYWJsZSk7XG4gICAgdmFyIGFkZEJ0bj0kKCc8YnV0dG9uLz4nLHtcbiAgICAgIHRleHQ6XCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcbiAgICB9KTtcbiAgICBhZGRCdG4ub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGRhdGEgPSBhZGRUclBhcmFsYXgoZmFsc2UpO1xuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIHNsaWRlcl9kYXRhOnNsaWRlcl9kYXRhXG4gICAgfSkpO1xuXG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XG4gICAgZWwuYXBwZW5kKGxheWVyKTtcblxuICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChlbC5maW5kKCcuZmlsZVNlbGVjdCcpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFRyU3RhdGljKGRhdGEpIHtcbiAgICB2YXIgaT1zdFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoLTE7XG4gICAgaWYoIWRhdGEpe1xuICAgICAgZGF0YT17XG4gICAgICAgIFwiaW1nXCI6XCJcIixcbiAgICAgICAgXCJmdWxsX2hlaWdodFwiOjAsXG4gICAgICAgIFwicG9zXCI6MCxcbiAgICAgICAgXCJzaG93X2RlbGF5XCI6MSxcbiAgICAgICAgXCJzaG93X2FuaW1hdGlvblwiOlwibGlnaHRTcGVlZEluXCIsXG4gICAgICAgIFwiaGlkZV9kZWxheVwiOjEsXG4gICAgICAgIFwiaGlkZV9hbmltYXRpb25cIjpcImJvdW5jZU91dFwiXG4gICAgICB9O1xuICAgICAgc2xpZGVyX2RhdGFbMF0uZml4ZWQucHVzaChkYXRhKTtcbiAgICAgIHZhciBmaXggPSAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwJyk7XG4gICAgICBhZGRTdGF0aWNMYXllcihkYXRhLCBmaXgsdHJ1ZSk7XG4gICAgfTtcblxuICAgIHZhciB0cj0kKCc8dHIvPicpO1xuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6ZGF0YS5pbWcsXG4gICAgICBsYWJlbDpmYWxzZSxcbiAgICAgIHBhcmVudDondGQnLFxuICAgICAgaW5wdXRDbGFzczpcImZpbGVTZWxlY3RcIixcbiAgICAgIGJpbmQ6e1xuICAgICAgICBncjonZml4ZWQnLFxuICAgICAgICBpbmRleDppLFxuICAgICAgICBwYXJhbTonaW1nJyxcbiAgICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcbiAgICAgIH0sXG4gICAgICBvbkNoYW5nZTpmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgZGF0YT10aGlzO1xuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmlucHV0LnZhbCgpKycpJyk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkW2RhdGEuaW5kZXhdLmltZz1kYXRhLmlucHV0LnZhbCgpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDpwb3NBcnIsXG4gICAgICB2YWxfbGlzdDpwb3NfbGlzdCxcbiAgICAgIHZhbF90eXBlOjIsXG4gICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXG4gICAgICBncjonZml4ZWQnLFxuICAgICAgaW5kZXg6aSxcbiAgICAgIHBhcmFtOidwb3MnLFxuICAgICAgcGFyZW50Oid0ZCcsXG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDp5ZXNfbm9fdmFsLFxuICAgICAgdmFsX2xpc3Q6eWVzX25vX2FycixcbiAgICAgIHZhbF90eXBlOjIsXG4gICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXG4gICAgICBncjonZml4ZWQnLFxuICAgICAgaW5kZXg6aSxcbiAgICAgIHBhcmFtOidmdWxsX2hlaWdodCcsXG4gICAgICBwYXJlbnQ6J3RkJyxcbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcbiAgICAgIHR5cGU6MSxcbiAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5maW5kKCcuYW5pbWF0aW9uX2xheWVyJyksXG4gICAgICBncjonZml4ZWQnLFxuICAgICAgaW5kZXg6aSxcbiAgICAgIHBhcmVudDondGQnXG4gICAgfSkpO1xuICAgIHZhciBkZWxCdG49JCgnPGJ1dHRvbi8+Jyx7XG4gICAgICB0ZXh0Olwi0KPQtNCw0LvQuNGC0YxcIlxuICAgIH0pO1xuICAgIGRlbEJ0bi5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyICR0aGlzPSQodGhpcy5lbCk7XG4gICAgICBpPSR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKS0xO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHQu9C+0Lkg0L3QsCDRgdC70LDQudC00LXRgNC1XG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5maXhlZC5zcGxpY2UoaSwgMSk7IC8v0YPQtNCw0LvRj9C10Lwg0LjQtyDQutC+0L3RhNC40LPQsCDRgdC70LDQudC00LBcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBlbDpkZWxCdG4sXG4gICAgICBzbGlkZXJfZGF0YTpzbGlkZXJfZGF0YVxuICAgIH0pKTtcbiAgICB2YXIgZGVsQnRuVGQ9JCgnPHRkLz4nKS5hcHBlbmQoZGVsQnRuKTtcbiAgICB0ci5hcHBlbmQoZGVsQnRuVGQpO1xuICAgIHN0VGFibGUuYXBwZW5kKHRyKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVkaXRvcjp0cixcbiAgICAgIGRhdGE6ZGF0YVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFRyUGFyYWxheChkYXRhKSB7XG4gICAgdmFyIGk9cGFyYWxheFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoLTE7XG4gICAgaWYoIWRhdGEpe1xuICAgICAgZGF0YT17XG4gICAgICAgIFwiaW1nXCI6XCJcIixcbiAgICAgICAgXCJ6XCI6MVxuICAgICAgfTtcbiAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXgucHVzaChkYXRhKTtcbiAgICAgIHZhciBwYXJhbGF4X2dyID0gJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAnKTtcbiAgICAgIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKTtcbiAgICB9O1xuICAgIHZhciB0cj0kKCc8dHIvPicpO1xuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6ZGF0YS5pbWcsXG4gICAgICBsYWJlbDpmYWxzZSxcbiAgICAgIHBhcmVudDondGQnLFxuICAgICAgaW5wdXRDbGFzczpcImZpbGVTZWxlY3RcIixcbiAgICAgIGJpbmQ6e1xuICAgICAgICBpbmRleDppLFxuICAgICAgICBwYXJhbTonaW1nJyxcbiAgICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6ZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGRhdGE9dGhpcztcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbnB1dC52YWwoKSsnKScpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLmltZz1kYXRhLmlucHV0LnZhbCgpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDpwb3NBcnIsXG4gICAgICB2YWxfbGlzdDpwb3NfbGlzdCxcbiAgICAgIHZhbF90eXBlOjIsXG4gICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLmZpbmQoJ3NwYW4nKSxcbiAgICAgIGdyOidwYXJhbGF4JyxcbiAgICAgIGluZGV4OmksXG4gICAgICBwYXJhbToncG9zJyxcbiAgICAgIHBhcmVudDondGQnLFxuICAgICAgc3RhcnRfb3B0aW9uOic8b3B0aW9uIHZhbHVlPVwiXCIgY29kZT1cIlwiPtC90LAg0LLQtdGB0Ywg0Y3QutGA0LDQvTwvb3B0aW9uPidcbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOmRhdGEueixcbiAgICAgIGxhYmVsOmZhbHNlLFxuICAgICAgcGFyZW50Oid0ZCcsXG4gICAgICBiaW5kOntcbiAgICAgICAgaW5kZXg6aSxcbiAgICAgICAgcGFyYW06J2ltZycsXG4gICAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSksXG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6ZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGRhdGE9dGhpcztcbiAgICAgICAgZGF0YS5vYmouYXR0cigneicsZGF0YS5pbnB1dC52YWwoKSk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0uej1kYXRhLmlucHV0LnZhbCgpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdmFyIGRlbEJ0bj0kKCc8YnV0dG9uLz4nLHtcbiAgICAgIHRleHQ6XCLQo9C00LDQu9C40YLRjFwiXG4gICAgfSk7XG4gICAgZGVsQnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgJHRoaXM9JCh0aGlzLmVsKTtcbiAgICAgIGk9JHRoaXMuY2xvc2VzdCgndHInKS5pbmRleCgpLTE7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcbiAgICAgICR0aGlzLmNsb3Nlc3QoJ3RyJykucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHRgtGA0L7QutGDINCyINGC0LDQsdC70LjRhtC1XG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLnBhcmFsYXguc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgZWw6ZGVsQnRuLFxuICAgICAgc2xpZGVyX2RhdGE6c2xpZGVyX2RhdGFcbiAgICB9KSk7XG4gICAgdmFyIGRlbEJ0blRkPSQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcbiAgICBwYXJhbGF4VGFibGUuYXBwZW5kKHRyKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVkaXRvcjp0cixcbiAgICAgIGRhdGE6ZGF0YVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZF9hbmltYXRpb24oZWwsZGF0YSl7XG4gICAgdmFyIG91dD0kKCc8ZGl2Lz4nLHtcbiAgICAgICdjbGFzcyc6J2FuaW1hdGlvbl9sYXllcidcbiAgICB9KTtcblxuICAgIGlmKHR5cGVvZihkYXRhLnNob3dfZGVsYXkpIT0ndW5kZWZpbmVkJyl7XG4gICAgICBvdXQuYWRkQ2xhc3Moc2hvd19kZWxheVtkYXRhLnNob3dfZGVsYXldKTtcbiAgICAgIGlmKGRhdGEuc2hvd19hbmltYXRpb24pe1xuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycrZGF0YS5zaG93X2FuaW1hdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYodHlwZW9mKGRhdGEuaGlkZV9kZWxheSkhPSd1bmRlZmluZWQnKXtcbiAgICAgIG91dC5hZGRDbGFzcyhoaWRlX2RlbGF5W2RhdGEuaGlkZV9kZWxheV0pO1xuICAgICAgaWYoZGF0YS5oaWRlX2FuaW1hdGlvbil7XG4gICAgICAgIG91dC5hZGRDbGFzcygnc2xpZGVfJytkYXRhLmhpZGVfYW5pbWF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlbC5hcHBlbmQob3V0KTtcbiAgICByZXR1cm4gZWw7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZV9zbGlkZShkYXRhKXtcbiAgICB2YXIgc2xpZGU9JCgnPGRpdiBjbGFzcz1cInNsaWRlXCIvPicpO1xuXG4gICAgdmFyIG1vYl9iZz0kKCc8YSBjbGFzcz1cIm1vYl9iZ1wiIGhyZWY9XCInK2RhdGEuYnV0dG9uLmhyZWYrJ1wiLz4nKTtcbiAgICBtb2JfYmcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5tb2JpbGUrJyknKVxuXG4gICAgc2xpZGUuYXBwZW5kKG1vYl9iZyk7XG4gICAgaWYobW9iaWxlX21vZGUpe1xuICAgICAgcmV0dXJuIHNsaWRlO1xuICAgIH1cblxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0YTQvtC9INGC0L4g0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgaWYoZGF0YS5mb24pe1xuICAgICAgc2xpZGUuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5mb24rJyknKVxuICAgIH1cblxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICBpZihkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aD4wKXtcbiAgICAgIHZhciBwYXJhbGF4X2dyPSQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fZ3JvdXBcIi8+Jyk7XG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEucGFyYWxheC5sZW5ndGg7aSsrKXtcbiAgICAgICAgYWRkUGFyYWxheExheWVyKGRhdGEucGFyYWxheFtpXSxwYXJhbGF4X2dyKVxuICAgICAgfVxuICAgICAgc2xpZGUuYXBwZW5kKHBhcmFsYXhfZ3IpXG4gICAgfVxuXG4gICAgdmFyIGZpeD0kKCc8ZGl2IGNsYXNzPVwiZml4ZWRfZ3JvdXBcIi8+Jyk7XG4gICAgZm9yKHZhciBpPTA7aTxkYXRhLmZpeGVkLmxlbmd0aDtpKyspe1xuICAgICAgYWRkU3RhdGljTGF5ZXIoZGF0YS5maXhlZFtpXSxmaXgpXG4gICAgfVxuXG4gICAgdmFyIGRvcF9ibGs9JChcIjxkaXYgY2xhc3M9J2ZpeGVkX19sYXllcicvPlwiKTtcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLmJ1dHRvbi5wb3NdKTtcbiAgICB2YXIgYnV0PSQoXCI8YSBjbGFzcz0nc2xpZGVyX19ocmVmJy8+XCIpO1xuICAgIGJ1dC5hdHRyKCdocmVmJyxkYXRhLmJ1dHRvbi5ocmVmKTtcbiAgICBidXQudGV4dChkYXRhLmJ1dHRvbi50ZXh0KTtcbiAgICBidXQuYWRkQ2xhc3MoZGF0YS5idXR0b24uY29sb3IpO1xuICAgIGRvcF9ibGs9YWRkX2FuaW1hdGlvbihkb3BfYmxrLGRhdGEuYnV0dG9uKTtcbiAgICBkb3BfYmxrLmZpbmQoJ2RpdicpLmFwcGVuZChidXQpO1xuICAgIGZpeC5hcHBlbmQoZG9wX2Jsayk7XG5cbiAgICBzbGlkZS5hcHBlbmQoZml4KTtcbiAgICByZXR1cm4gc2xpZGU7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRQYXJhbGF4TGF5ZXIoZGF0YSxwYXJhbGF4X2dyKXtcbiAgICB2YXIgcGFyYWxsYXhfbGF5ZXI9JCgnPGRpdiBjbGFzcz1cInBhcmFsbGF4X19sYXllclwiXFw+Jyk7XG4gICAgcGFyYWxsYXhfbGF5ZXIuYXR0cigneicsZGF0YS56fHxpKjEwKTtcbiAgICB2YXIgZG9wX2Jsaz0kKFwiPHNwYW4gY2xhc3M9J3NsaWRlcl9fdGV4dCcvPlwiKTtcbiAgICBpZihkYXRhLnBvcykge1xuICAgICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcbiAgICB9XG4gICAgZG9wX2Jsay5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xuICAgIHBhcmFsbGF4X2xheWVyLmFwcGVuZChkb3BfYmxrKTtcbiAgICBwYXJhbGF4X2dyLmFwcGVuZChwYXJhbGxheF9sYXllcik7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTdGF0aWNMYXllcihkYXRhLGZpeCxiZWZvcl9idXR0b24pe1xuICAgIHZhciBkb3BfYmxrPSQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcbiAgICBpZihkYXRhLmZ1bGxfaGVpZ2h0KXtcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MoJ2ZpeGVkX19mdWxsLWhlaWdodCcpO1xuICAgIH1cbiAgICBkb3BfYmxrPWFkZF9hbmltYXRpb24oZG9wX2JsayxkYXRhKTtcbiAgICBkb3BfYmxrLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xuXG4gICAgaWYoYmVmb3JfYnV0dG9uKXtcbiAgICAgIGZpeC5maW5kKCcuc2xpZGVyX19ocmVmJykuY2xvc2VzdCgnLmZpeGVkX19sYXllcicpLmJlZm9yZShkb3BfYmxrKVxuICAgIH1lbHNlIHtcbiAgICAgIGZpeC5hcHBlbmQoZG9wX2JsaylcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xuICAgIGlmKCQoJyNtZWdhX3NsaWRlcicpLmhhc0NsYXNzKCdzdG9wX3NsaWRlJykpcmV0dXJuO1xuXG4gICAgdmFyIHNsaWRlX3BvaW50cz0kKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVfc2VsZWN0JylcbiAgICB2YXIgc2xpZGVfY250PXNsaWRlX3BvaW50cy5sZW5ndGg7XG4gICAgdmFyIGFjdGl2ZT0kKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVyLWFjdGl2ZScpLmluZGV4KCkrMTtcbiAgICBpZihhY3RpdmU+PXNsaWRlX2NudClhY3RpdmU9MDtcbiAgICBzbGlkZV9wb2ludHMuZXEoYWN0aXZlKS5jbGljaygpO1xuXG4gICAgc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGltZ190b19sb2FkKHNyYyl7XG4gICAgdmFyIGltZz0kKCc8aW1nLz4nKTtcbiAgICBpbWcub24oJ2xvYWQnLGZ1bmN0aW9uKCl7XG4gICAgICB0b3RfaW1nX3dhaXQtLTtcblxuICAgICAgaWYodG90X2ltZ193YWl0PT0wKXtcblxuICAgICAgICBzbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dKSk7XG4gICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcShyZW5kZXJfc2xpZGVfbm9tKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblxuICAgICAgICBpZihyZW5kZXJfc2xpZGVfbm9tPT0wKXtcbiAgICAgICAgICBzbGlkZXMuZmluZCgnLnNsaWRlJylcbiAgICAgICAgICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcblxuICAgICAgICAgIGlmKCFlZGl0b3IpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5maXJzdF9zaG93JykucmVtb3ZlQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcbiAgICAgICAgICAgIH0uYmluZChzbGlkZXMpLCA1MDAwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihtb2JpbGVfbW9kZT09PWZhbHNlKSB7XG4gICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcbiAgICAgICAgICAgIHBhcmFsbGF4X2NvdW50ZXIgPSAwO1xuICAgICAgICAgICAgcGFyYWxsYXhfdGltZXIgPSBzZXRJbnRlcnZhbChyZW5kZXIsIDEwMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoZWRpdG9yKXtcbiAgICAgICAgICAgIGluaXRfZWRpdG9yKClcbiAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xuXG4gICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCcpLm9uKCdjbGljaycsJy5zbGlkZV9zZWxlY3QnLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHZhciAkdGhpcz0kKHRoaXMpO1xuICAgICAgICAgICAgICBpZigkdGhpcy5oYXNDbGFzcygnc2xpZGVyLWFjdGl2ZScpKXJldHVybjtcblxuICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkdGhpcy5pbmRleCgpO1xuICAgICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgICAgICR0aGlzLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG5cbiAgICAgICAgICAgICAgJChjb250YWluZXJfaWQrJyAuc2xpZGUuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgICAgICQoY29udGFpbmVyX2lkKycgLnNsaWRlJykuZXEoaW5kZXgpLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG5cbiAgICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuaG92ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuYWRkQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykucmVtb3ZlQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlbmRlcl9zbGlkZV9ub20rKztcbiAgICAgICAgaWYocmVuZGVyX3NsaWRlX25vbTxzbGlkZXJfZGF0YS5sZW5ndGgpe1xuICAgICAgICAgIGxvYWRfc2xpZGVfaW1nKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLm9uKCdlcnJvcicsZnVuY3Rpb24gKCkge1xuICAgICAgdG90X2ltZ193YWl0LS07XG4gICAgfSk7XG4gICAgaW1nLnByb3AoJ3NyYycsc3JjKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRfc2xpZGVfaW1nKCl7XG4gICAgdmFyIGRhdGE9c2xpZGVyX2RhdGFbcmVuZGVyX3NsaWRlX25vbV07XG4gICAgdG90X2ltZ193YWl0PTE7XG5cbiAgICBpZihtb2JpbGVfbW9kZT09PWZhbHNlKXtcbiAgICAgIHRvdF9pbWdfd2FpdCsrO1xuICAgICAgaW1nX3RvX2xvYWQoZGF0YS5mb24pO1xuICAgICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxuICAgICAgaWYoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGg+MCl7XG4gICAgICAgIHRvdF9pbWdfd2FpdCs9ZGF0YS5wYXJhbGF4Lmxlbmd0aDtcbiAgICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLnBhcmFsYXgubGVuZ3RoO2krKykge1xuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEucGFyYWxheFtpXS5pbWcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmKGRhdGEuZml4ZWQgJiYgZGF0YS5maXhlZC5sZW5ndGg+MCkge1xuICAgICAgICB0b3RfaW1nX3dhaXQgKz0gZGF0YS5maXhlZC5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEuZml4ZWRbaV0uaW1nKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW1nX3RvX2xvYWQoZGF0YS5tb2JpbGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRfaW5pdF9zbGlkZShkYXRhKXtcbiAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHZhciBpbWc9JCgnPGltZy8+Jyk7XG4gICAgaW1nLmF0dHIoJ3RpbWUnLG4pO1xuXG4gICAgZnVuY3Rpb24gb25faW1nX2xvYWQoKXtcbiAgICAgIHZhciBuID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBpbWc9JCh0aGlzKTtcbiAgICAgIG49bi1wYXJzZUludChpbWcuYXR0cigndGltZScpKTtcbiAgICAgIGlmKG4+bWF4X3RpbWVfbG9hZF9waWMpe1xuICAgICAgICBtb2JpbGVfbW9kZT10cnVlO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHZhciBtYXhfc2l6ZT0oc2NyZWVuLmhlaWdodD5zY3JlZW4ud2lkdGg/c2NyZWVuLmhlaWdodDpzY3JlZW4ud2lkdGgpO1xuICAgICAgICBpZihtYXhfc2l6ZTxtb2JpbGVfc2l6ZSl7XG4gICAgICAgICAgbW9iaWxlX21vZGU9dHJ1ZTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgbW9iaWxlX21vZGU9ZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmKG1vYmlsZV9tb2RlPT10cnVlKXtcbiAgICAgICAgJChjb250YWluZXJfaWQpLmFkZENsYXNzKCdtb2JpbGVfbW9kZScpXG4gICAgICB9XG4gICAgICByZW5kZXJfc2xpZGVfbm9tPTA7XG4gICAgICBsb2FkX3NsaWRlX2ltZygpO1xuICAgIH07XG5cbiAgICBpbWcub24oJ2xvYWQnLG9uX2ltZ19sb2FkKCkpO1xuICAgIGlmKHNsaWRlcl9kYXRhLmxlbmd0aD4wKSB7XG4gICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnP3I9JyArIE1hdGgucmFuZG9tKCk7XG4gICAgICBpbWcucHJvcCgnc3JjJywgc2xpZGVyX2RhdGFbMF0ubW9iaWxlKTtcbiAgICB9ZWxzZXtcbiAgICAgIG9uX2ltZ19sb2FkKCkuYmluZChpbWcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoZGF0YSxlZGl0b3JfaW5pdCl7XG4gICAgc2xpZGVyX2RhdGE9ZGF0YTtcbiAgICBlZGl0b3I9ZWRpdG9yX2luaXQ7XG4gICAgLy/QvdCw0YXQvtC00LjQvCDQutC+0L3RgtC10LnQvdC10YAg0Lgg0L7Rh9C40YnQsNC10Lwg0LXQs9C+XG4gICAgdmFyIGNvbnRhaW5lcj0kKGNvbnRhaW5lcl9pZCk7XG4gICAgY29udGFpbmVyLmh0bWwoJycpO1xuXG4gICAgLy/RgdC+0LfQttCw0LXQvCDQsdCw0LfQvtCy0YvQtSDQutC+0L3RgtC10LnQvdC10YDRiyDQtNC70Y8g0YHQsNC80LjRhSDRgdC70LDQudC00L7QsiDQuCDQtNC70Y8g0L/QtdGA0LXQutC70Y7Rh9Cw0YLQtdC70LXQuVxuICAgIHNsaWRlcz0kKCc8ZGl2Lz4nLHtcbiAgICAgICdjbGFzcyc6J3NsaWRlcydcbiAgICB9KTtcbiAgICB2YXIgc2xpZGVfY29udHJvbD0kKCc8ZGl2Lz4nLHtcbiAgICAgICdjbGFzcyc6J3NsaWRlX2NvbnRyb2wnXG4gICAgfSk7XG4gICAgc2xpZGVfc2VsZWN0X2JveD0kKCc8dWwvPicse1xuICAgICAgJ2NsYXNzJzonc2xpZGVfc2VsZWN0X2JveCdcbiAgICB9KTtcblxuICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INC40L3QtNC40LrQsNGC0L7RgCDQt9Cw0LPRgNGD0LfQutC4XG4gICAgdmFyIGw9JzxkaXYgY2xhc3M9XCJzay1mb2xkaW5nLWN1YmVcIj4nK1xuICAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTEgc2stY3ViZVwiPjwvZGl2PicrXG4gICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMiBzay1jdWJlXCI+PC9kaXY+JytcbiAgICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmU0IHNrLWN1YmVcIj48L2Rpdj4nK1xuICAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTMgc2stY3ViZVwiPjwvZGl2PicrXG4gICAgICAgJzwvZGl2Pic7XG4gICAgY29udGFpbmVyLmh0bWwobCk7XG5cblxuICAgIHN0YXJ0X2luaXRfc2xpZGUoZGF0YVswXSk7XG5cbiAgICAvL9Cz0LXQvdC10YDQuNGA0YPQtdC8INC60L3QvtC/0LrQuCDQuCDRgdC70LDQudC00YtcbiAgICBmb3IgKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xuICAgICAgLy9zbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKGRhdGFbaV0pKTtcbiAgICAgIHNsaWRlX3NlbGVjdF9ib3guYXBwZW5kKCc8bGkgY2xhc3M9XCJzbGlkZV9zZWxlY3QgZGlzYWJsZWRcIi8+JylcbiAgICB9XG5cbiAgICAvKnNsaWRlcy5maW5kKCcuc2xpZGUnKS5lcSgwKVxuICAgICAgLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJylcbiAgICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpO1xuICAgIHNsaWRlX2NvbnRyb2wuZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpOyovXG5cbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlcyk7XG4gICAgc2xpZGVfY29udHJvbC5hcHBlbmQoc2xpZGVfc2VsZWN0X2JveCk7XG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZV9jb250cm9sKTtcblxuXG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXIoKXtcbiAgICBpZighcGFyYWxsYXhfZ3JvdXApcmV0dXJuIGZhbHNlO1xuICAgIHZhciBwYXJhbGxheF9rPShwYXJhbGxheF9jb3VudGVyLTEwKS8yO1xuXG4gICAgZm9yKHZhciBpPTA7aTxwYXJhbGxheF9ncm91cC5sZW5ndGg7aSsrKXtcbiAgICAgIHZhciBlbD1wYXJhbGxheF9ncm91cC5lcShpKTtcbiAgICAgIHZhciBqPWVsLmF0dHIoJ3onKTtcbiAgICAgIHZhciB0cj0ncm90YXRlM2QoMC4xLDAuOCwwLCcrKHBhcmFsbGF4X2spKydkZWcpIHNjYWxlKCcrKDEraiowLjUpKycpIHRyYW5zbGF0ZVooLScrKDEwK2oqMjApKydweCknO1xuICAgICAgZWwuY3NzKCd0cmFuc2Zvcm0nLHRyKVxuICAgIH1cbiAgICBwYXJhbGxheF9jb3VudGVyKz1wYXJhbGxheF9kKjAuMTtcbiAgICBpZihwYXJhbGxheF9jb3VudGVyPj0yMClwYXJhbGxheF9kPS1wYXJhbGxheF9kO1xuICAgIGlmKHBhcmFsbGF4X2NvdW50ZXI8PTApcGFyYWxsYXhfZD0tcGFyYWxsYXhfZDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xufSgpKTtcbiIsIi8v0LjQt9Cx0YDQsNC90L3QvtC1XG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAkKFwiLnNob3BzIC5mYXZvcml0ZS1saW5rXCIpLm9uKCdjbGljaycsZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBzZWxmID0gJCh0aGlzKTtcbiAgICB2YXIgdHlwZSA9IHNlbGYuYXR0cihcImRhdGEtc3RhdGVcIiksXG4gICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmF0dHIoXCJkYXRhLWFmZmlsaWF0ZS1pZFwiKTtcbiAgICBpZiAoc2VsZi5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHNlbGYuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cbiAgICAvKmlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgc2VsZi5maW5kKFwiLml0ZW1faWNvblwiKS5yZW1vdmVDbGFzcyhcIm11dGVkXCIpO1xuICAgIH0qL1xuXG4gICAgJC5wb3N0KFwiL2FjY291bnQvZmF2b3JpdGVzXCIse1xuICAgICAgXCJ0eXBlXCIgOiB0eXBlICxcbiAgICAgIFwiYWZmaWxpYXRlX2lkXCI6IGFmZmlsaWF0ZV9pZFxuICAgIH0sZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICBpZihkYXRhLmVycm9yKXtcbiAgICAgICAgc2VsZi5maW5kKCdzdmcnKS5yZW1vdmVDbGFzcyhcInNwaW5cIik7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6ZGF0YS5lcnJvcix0eXBlOidlcnInLCd0aXRsZSc6KGRhdGEudGl0bGU/ZGF0YS50aXRsZTpmYWxzZSl9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgbWVzc2FnZTpkYXRhLm1zZyxcbiAgICAgICAgdHlwZTonc3VjY2VzcycsXG4gICAgICAgICd0aXRsZSc6KGRhdGEudGl0bGU/ZGF0YS50aXRsZTpmYWxzZSlcbiAgICAgIH0pO1xuXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwiLml0ZW1faWNvblwiKS5hZGRDbGFzcyhcInN2Zy1uby1maWxsXCIpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLmF0dHIoe1xuICAgICAgICBcImRhdGEtc3RhdGVcIjogZGF0YVtcImRhdGEtc3RhdGVcIl0sXG4gICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiOiBkYXRhWydkYXRhLW9yaWdpbmFsLXRpdGxlJ11cbiAgICAgIH0pO1xuXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpbiBzdmctbm8tZmlsbFwiKTtcbiAgICAgIH0gZWxzZSBpZih0eXBlID09IFwiZGVsZXRlXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpblwiKS5hZGRDbGFzcyhcInN2Zy1uby1maWxsXCIpO1xuICAgICAgfVxuXG4gICAgfSwnanNvbicpLml0ZW1faWNvbmlsKGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6XCI8Yj7QotC10YXQvdC40YfQtdGB0LrQuNC1INGA0LDQsdC+0YLRiyE8L2I+PGJyPtCSINC00LDQvdC90YvQuSDQvNC+0LzQtdC90YIg0LLRgNC10LzQtdC90LhcIiArXG4gICAgICBcIiDQv9GA0L7QuNC30LLQtdC00ZHQvdC90L7QtSDQtNC10LnRgdGC0LLQuNC1INC90LXQstC+0LfQvNC+0LbQvdC+LiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1LlwiICtcbiAgICAgIFwiINCf0YDQuNC90L7RgdC40Lwg0YHQstC+0Lgg0LjQt9Cy0LjQvdC10L3QuNGPINC30LAg0L3QtdGD0LTQvtCx0YHRgtCy0L4uXCIsdHlwZTonZXJyJ30pO1xuXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLmFkZENsYXNzKFwic3ZnLW5vLWZpbGxcIik7XG4gICAgICB9XG4gICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluXCIpO1xuICAgIH0pXG4gIH0pO1xufSk7IiwidmFyIGhlYWRlckFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuICAgIHZhciBzaGFkb3dlZERvd24gPSBmYWxzZTtcblxuICAgICQoJy5tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAgICAgJCgnLmRyb3AtbWVudScpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgaWYgKCQoJy5oZWFkZXInKS5oYXNDbGFzcygnaGVhZGVyX29wZW4tbWVudScpKSB7XG4gICAgICAgICAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJCgnLnNlYXJjaC10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCgnLmhlYWRlcicpLnRvZ2dsZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcbiAgICAgICAgJCgnI2F1dG9jb21wbGV0ZScpLmZhZGVPdXQoKTtcbiAgICAgICAgaWYgKCQoJy5oZWFkZXInKS5oYXNDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJykpIHtcbiAgICAgICAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCcjaGVhZGVyJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGUudGFyZ2V0LmlkID09ICdoZWFkZXInKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1idXR0b24nKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJ2Zvcm0nKS5zdWJtaXQoKTtcbiAgICB9KTtcblxuXG5cbiAgICAkKCcuaGVhZGVyLXNlY29uZGxpbmVfY2xvc2UnKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG4gICAgfSk7XG5cbiAgICAkKCcuaGVhZGVyLXVwbGluZScpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbihlKXtcbiAgICAgICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XG4gICAgICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdsb2FkIHJlc2l6ZSBzY3JvbGwnLGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2hhZG93SGVpZ2h0ID0gNTA7XG4gICAgICAgIHZhciBoaWRlSGVpZ2h0ID0gMjAwO1xuICAgICAgICB2YXIgaGVhZGVyU2Vjb25kTGluZSA9ICQoJy5oZWFkZXItc2Vjb25kbGluZScpO1xuICAgICAgICB2YXIgaG92ZXJzID0gaGVhZGVyU2Vjb25kTGluZS5maW5kKCc6aG92ZXInKTtcbiAgICAgICAgdmFyIGhlYWRlciA9ICQoJy5oZWFkZXInKTtcblxuICAgICAgICBpZiAoIWhvdmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcbiAgICAgICAgICAgIGhlYWRlci5yZW1vdmVDbGFzcygnc2Nyb2xsYWJsZScpO1xuICAgICAgICAgICAgLy9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXG4gICAgICAgICAgICB2YXIgc2Nyb2xsVG9wPSQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPiBzaGFkb3dIZWlnaHQgJiYgc2hhZG93ZWREb3duID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHNoYWRvd2VkRG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2hhZG93ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPD0gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHNoYWRvd2VkRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3NoYWRvd2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2Nyb2xsVG9wID4gaGlkZUhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsZWREb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzY3JvbGwtZG93bicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNjcm9sbFRvcCA8PSBoaWRlSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgICAgICAgICBoZWFkZXIuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnLm1lbnVfYW5nbGUtZG93biwgLmRyb3AtbWVudV9ncm91cF9fdXAtaGVhZGVyJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgbWVudU9wZW4gPSAkKHRoaXMpLmNsb3Nlc3QoJy5oZWFkZXJfb3Blbi1tZW51LCAuY2F0YWxvZy1jYXRlZ29yaWVzJyk7XG4gICAgICAgIGlmICghbWVudU9wZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBwYXJlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnVfZ3JvdXBfX3VwLCAubWVudS1ncm91cCcpO1xuICAgICAgICB2YXIgcGFyZW50TWVudSA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudScpO1xuICAgICAgICBpZiAocGFyZW50TWVudSkge1xuICAgICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICAkKHBhcmVudCkudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgIGlmIChwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgICAgICAgICAgICQocGFyZW50KS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudE1lbnUpIHtcbiAgICAgICAgICAgICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5hZGRDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50TWVudSkge1xuICAgICAgICAgICAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuXG4gICAgdmFyIGFjY291bnRNZW51VGltZU91dCA9IG51bGw7XG4gICAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgbWVudSA9ICQoJy5hY2NvdW50LW1lbnUnKTtcbiAgICAgICAgaWYgKG1lbnUpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChhY2NvdW50TWVudVRpbWVPdXQpO1xuICAgICAgICAgICAgbWVudS50b2dnbGVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICBpZiAoIW1lbnUuaGFzQ2xhc3MoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICAgICAgYWNjb3VudE1lbnVUaW1lT3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAgICAgICAgIH0sIDcwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9KTtcblxuXG4gICAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dCcpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBxdWVyeSA9ICQodGhpcykudmFsKCk7XG4gICAgICAgIHZhciBhdXRvY29tcGxldGUgPSAkKCcjYXV0b2NvbXBsZXRlJyksXG4gICAgICAgICAgICBhdXRvY29tcGxldGVMaXN0ID0gJChhdXRvY29tcGxldGUpLmZpbmQoJ3VsJyk7XG4gICAgICAgIGlmIChxdWVyeS5sZW5ndGg+MSkge1xuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvc2VhcmNoJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnZ2V0JyxcbiAgICAgICAgICAgICAgICBkYXRhOiB7cXVlcnk6IHF1ZXJ5fSxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuaHRtbCgnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zLmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gJzxhIGhyZWY9XCIvc3RvcmVzLycraXRlbS5kYXRhLnJvdXRlKydcIicrJz4nK2l0ZW0udmFsdWUraXRlbS5jYXNoYmFjaysnPC9hPic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmFwcGVuZChsaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pLm9uKCdmb2N1c291dCcsZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnI2F1dG9jb21wbGV0ZScpLmhpZGUoKTtcbiAgICB9KTtcblxuXG5cbn0oKTtcblxuXG5cblxuIiwiJChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBwYXJzZU51bShzdHIpe1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChcbiAgICAgICAgICAgIFN0cmluZyhzdHIpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoJywnLCcuJylcbiAgICAgICAgICAgICAgICAubWF0Y2goLy0/XFxkKyg/OlxcLlxcZCspPy9nLCAnJykgfHwgMFxuICAgICAgICAgICAgLCAxMFxuICAgICAgICApO1xuICAgIH1cblxuICAgICQoJy5zaG9ydC1jYWxjLWNhc2hiYWNrJykuZmluZCgnc2VsZWN0LGlucHV0Jykub24oJ2NoYW5nZSBrZXl1cCBjbGljaycsZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKS5jbG9zZXN0KCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpO1xuICAgICAgICB2YXIgY3Vycz1wYXJzZU51bSgkdGhpcy5maW5kKCdzZWxlY3QnKS52YWwoKSk7XG4gICAgICAgIHZhciB2YWw9JHRoaXMuZmluZCgnaW5wdXQnKS52YWwoKTtcbiAgICAgICAgaWYgKHBhcnNlTnVtKHZhbCkgIT0gdmFsKSB7XG4gICAgICAgICAgICB2YWw9JHRoaXMuZmluZCgnaW5wdXQnKS52YWwocGFyc2VOdW0odmFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsPXBhcnNlTnVtKHZhbCk7XG5cbiAgICAgICAgdmFyIGtvZWY9JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrJykudHJpbSgpO1xuICAgICAgICB2YXIgcHJvbW89JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLXByb21vJykudHJpbSgpO1xuICAgICAgICB2YXIgY3VycmVuY3k9JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLWN1cnJlbmN5JykudHJpbSgpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gMDtcbiAgICAgICAgdmFyIG91dCA9IDA7XG5cbiAgICAgICAgaWYgKGtvZWY9PXByb21vKSB7XG4gICAgICAgICAgICBwcm9tbz0wO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoa29lZi5pbmRleE9mKCclJyk+MCl7XG4gICAgICAgICAgICByZXN1bHQ9cGFyc2VOdW0oa29lZikqdmFsKmN1cnMvMTAwO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGN1cnM9cGFyc2VOdW0oJHRoaXMuZmluZCgnW2NvZGU9JytjdXJyZW5jeSsnXScpLnZhbCgpKTtcbiAgICAgICAgICAgIHJlc3VsdD1wYXJzZU51bShrb2VmKSpjdXJzXG4gICAgICAgIH1cblxuICAgICAgICBpZihwYXJzZU51bShwcm9tbyk+MCkge1xuICAgICAgICAgICAgaWYocHJvbW8uaW5kZXhPZignJScpPjApe1xuICAgICAgICAgICAgICAgIHByb21vPXBhcnNlTnVtKHByb21vKSp2YWwqY3Vycy8xMDA7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBwcm9tbz1wYXJzZU51bShwcm9tbykqY3Vyc1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihwcm9tbz4wKSB7XG4gICAgICAgICAgICAgICAgb3V0ID0gXCI8c3BhbiBjbGFzcz1vbGRfcHJpY2U+XCIgKyByZXN1bHQudG9GaXhlZCgyKSArIFwiPC9zcGFuPiBcIiArIHByb21vLnRvRml4ZWQoMilcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIG91dD1yZXN1bHQudG9GaXhlZCgyKVxuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG91dD1yZXN1bHQudG9GaXhlZCgyKVxuICAgICAgICB9XG5cblxuICAgICAgICAkdGhpcy5maW5kKCcuY2FsYy1yZXN1bHRfdmFsdWUnKS5odG1sKG91dClcbiAgICB9KS5jbGljaygpXG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICB2YXIgZWxzPSQoJy5hdXRvX2hpZGVfY29udHJvbCcpO1xuICBpZihlbHMubGVuZ3RoPT0wKXJldHVybjtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLFwiLnNjcm9sbF9ib3gtc2hvd19tb3JlXCIsZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBkYXRhPXtcbiAgICAgIGJ1dHRvblllczpmYWxzZSxcbiAgICAgIG5vdHlmeV9jbGFzczpcIm5vdGlmeV93aGl0ZSBub3RpZnlfbm90X2JpZ1wiXG4gICAgfTtcblxuICAgICR0aGlzPSQodGhpcyk7XG4gICAgdmFyIGNvbnRlbnQgPSAkdGhpcy5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtJykuY2xvbmUoKTtcbiAgICBjb250ZW50PWNvbnRlbnRbMF07XG4gICAgY29udGVudC5jbGFzc05hbWUgKz0gJyBzY3JvbGxfYm94LWl0ZW0tbW9kYWwnO1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuY2xhc3NOYW1lID0gJ2NvbW1lbnRzJztcbiAgICBkaXYuYXBwZW5kKGNvbnRlbnQpO1xuICAgICQoZGl2KS5maW5kKCcuc2Nyb2xsX2JveC1zaG93X21vcmUnKS5yZW1vdmUoKTtcbiAgICAkKGRpdikuZmluZCgnLm1heF90ZXh0X2hpZGUnKVxuICAgICAgLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLXgyJylcbiAgICAgIC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZScpO1xuICAgIGRhdGEucXVlc3Rpb249IGRpdi5vdXRlckhUTUw7XG5cbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG4gIH0pO1xuXG5cbiAgZnVuY3Rpb24gaGFzU2Nyb2xsKGVsKSB7XG4gICAgcmV0dXJuIGVsLnNjcm9sbEhlaWdodD5lbC5jbGllbnRIZWlnaHQ7XG4gIH1cblxuICBmdW5jdGlvbiByZWJ1aWxkKCl7XG4gICAgZm9yKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKyl7XG4gICAgICB2YXIgZWw9ZWxzLmVxKGkpO1xuICAgICAgdmFyIGlzX2hpZGU9ZmFsc2U7XG4gICAgICBpZihlbC5oZWlnaHQoKTwxMCl7XG4gICAgICAgIGlzX2hpZGU9dHJ1ZTtcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuc2hvdygwKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRleHQ9ZWwuZmluZCgnLnNjcm9sbF9ib3gtdGV4dCcpO1xuICAgICAgdmFyIGFuc3dlcj1lbC5maW5kKCcuc2Nyb2xsX2JveC1hbnN3ZXInKTtcbiAgICAgIHZhciBzaG93X21vcmU9ZWwuZmluZCgnLnNjcm9sbF9ib3gtc2hvd19tb3JlJyk7XG5cbiAgICAgIHZhciBzaG93X2J0bj1mYWxzZTtcbiAgICAgIGlmKGhhc1Njcm9sbCh0ZXh0WzBdKSl7XG4gICAgICAgIHNob3dfYnRuPXRydWU7XG4gICAgICAgIHRleHQucmVtb3ZlQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRleHQuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xuICAgICAgfVxuXG4gICAgICBpZihhbnN3ZXIubGVuZ3RoPjApe1xuICAgICAgICAvL9C10YHRgtGMINC+0YLQstC10YIg0LDQtNC80LjQvdCwXG4gICAgICAgIGlmKGhhc1Njcm9sbChhbnN3ZXJbMF0pKXtcbiAgICAgICAgICBzaG93X2J0bj10cnVlO1xuICAgICAgICAgIGFuc3dlci5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGFuc3dlci5hZGRDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoc2hvd19idG4pe1xuICAgICAgICBzaG93X21vcmUuc2hvdygpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHNob3dfbW9yZS5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGlzX2hpZGUpe1xuICAgICAgICBlbC5jbG9zZXN0KCcuc2Nyb2xsX2JveC1pdGVtLWhpZGUnKS5oaWRlKDApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gICQod2luZG93KS5yZXNpemUocmVidWlsZCk7XG4gIHJlYnVpbGQoKTtcbn0pKCk7XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAkKCcuc2Nyb2xsX3RvJykuY2xpY2soIGZ1bmN0aW9uKGUpeyAvLyDQu9C+0LLQuNC8INC60LvQuNC6INC/0L4g0YHRgdGL0LvQutC1INGBINC60LvQsNGB0YHQvtC8IGdvX3RvXG4gICAgdmFyIHNjcm9sbF9lbCA9ICQodGhpcykuYXR0cignaHJlZicpOyAvLyDQstC+0LfRjNC80LXQvCDRgdC+0LTQtdGA0LbQuNC80L7QtSDQsNGC0YDQuNCx0YPRgtCwIGhyZWYsINC00L7Qu9C20LXQvSDQsdGL0YLRjCDRgdC10LvQtdC60YLQvtGA0L7QvCwg0YIu0LUuINC90LDQv9GA0LjQvNC10YAg0L3QsNGH0LjQvdCw0YLRjNGB0Y8g0YEgIyDQuNC70LggLlxuICAgIHNjcm9sbF9lbD0kKHNjcm9sbF9lbCk7XG4gICAgaWYgKHNjcm9sbF9lbC5sZW5ndGggIT0gMCkgeyAvLyDQv9GA0L7QstC10YDQuNC8INGB0YPRidC10YHRgtCy0L7QstCw0L3QuNC1INGN0LvQtdC80LXQvdGC0LAg0YfRgtC+0LHRiyDQuNC30LHQtdC20LDRgtGMINC+0YjQuNCx0LrQuFxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IHNjcm9sbF9lbC5vZmZzZXQoKS50b3AtJCgnI2hlYWRlcj4qJykuZXEoMCkuaGVpZ2h0KCktNTAgfSwgNTAwKTsgLy8g0LDQvdC40LzQuNGA0YPQtdC8INGB0LrRgNC+0L7Qu9C40L3QsyDQuiDRjdC70LXQvNC10L3RgtGDIHNjcm9sbF9lbFxuICAgICAgaWYoc2Nyb2xsX2VsLmhhc0NsYXNzKCdhY2NvcmRpb24nKSAmJiAhc2Nyb2xsX2VsLmhhc0NsYXNzKCdvcGVuJykpe1xuICAgICAgICBzY3JvbGxfZWwuZmluZCgnLmFjY29yZGlvbi1jb250cm9sJykuY2xpY2soKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlOyAvLyDQstGL0LrQu9GO0YfQsNC10Lwg0YHRgtCw0L3QtNCw0YDRgtC90L7QtSDQtNC10LnRgdGC0LLQuNC1XG4gIH0pO1xufSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5zaG93X2FsbCcsZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBjbHM9JCh0aGlzKS5kYXRhKCdjbnRybC1jbGFzcycpO1xuICAgICQoJy5oaWRlX2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcbiAgICAkKHRoaXMpLmhpZGUoKTtcbiAgICAkKCcuJytjbHMpLnNob3coKTtcbiAgfSk7XG5cbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5oaWRlX2FsbCcsZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBjbHM9JCh0aGlzKS5kYXRhKCdjbnRybC1jbGFzcycpO1xuICAgICQoJy5zaG93X2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcbiAgICAkKHRoaXMpLmhpZGUoKTtcbiAgICAkKCcuJytjbHMpLmhpZGUoKTtcbiAgfSk7XG59KSgpO1xuIiwiJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgJChcImFbaHJlZj0nI3Nob3dwcm9tb2NvZGUtbm9yZWdpc3RlciddXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICBjb25zb2xlLmxvZyhpZCk7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBidXR0b25ZZXM6IGZhbHNlLFxuICAgICAgbm90eWZ5X2NsYXNzOiBcIm5vdGlmeV93aGl0ZSBub3RpZnlfbm90X2JpZ1wiLFxuICAgICAgcXVlc3Rpb246ICc8ZGl2IGNsYXNzPVwiY291cG9uLW5vcmVnaXN0ZXJcIj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiY291cG9uLW5vcmVnaXN0ZXJfX2ljb25cIj48aW1nIHNyYz1cIi9pbWFnZXMvdGVtcGxhdGVzL3N3YS5wbmdcIiBhbHQ9XCJcIj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiY291cG9uLW5vcmVnaXN0ZXJfX3RleHRcIj48Yj7QldGB0LvQuCDQstGLINGF0L7RgtC40YLQtSDQv9C+0LvRg9GH0LDRgtGMINC10YnQtSDQuCDQmtCt0KjQkdCt0JogKNCy0L7Qt9Cy0YDQsNGCINC00LXQvdC10LMpLCDQstCw0Lwg0L3QtdC+0LHRhdC+0LTQuNC80L4g0LfQsNGA0LXQs9C40YHRgtGA0LjRgNC+0LLQsNGC0YzRgdGPLiDQndC+INC80L7QttC10YLQtSDQuCDQv9GA0L7RgdGC0L4g0LLQvtGB0L/QvtC70YzQt9C+0LLQsNGC0YzRgdGPINC60YPQv9C+0L3QvtC8LCDQsdC10Lcg0LrRjdGI0LHRjdC60LAuPC9iPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJjb3Vwb24tbm9yZWdpc3Rlcl9fYnV0dG9uc1wiPicgK1xuICAgICAgJzxhIGhyZWY9XCJnb3RvL2NvdXBvbjonICsgaWQgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJidG4gIGJ0bi1wb3B1cDJcIj7QmNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0LrRg9C/0L7QvTwvYT4nICtcbiAgICAgICc8YSBocmVmPVwiI3JlZ2lzdHJhdGlvblwiIGNsYXNzPVwiYnRuIGJ0bi1wb3B1cDIgYnRuLXJldmVydFwiPtCX0LDRgNC10LPQuNGB0YLRgNC40YDQvtCy0LDRgtGM0YHRjzwvYT4nICtcbiAgICAgICc8L2Rpdj4nICtcbiAgICAgICc8ZGl2PidcbiAgICB9O1xuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKVxuICB9KTtcblxuICBmdW5jdGlvbiBkZWNsT2ZOdW0obnVtYmVyLCB0aXRsZXMpIHtcbiAgICBjYXNlcyA9IFsyLCAwLCAxLCAxLCAxLCAyXTtcbiAgICByZXR1cm4gdGl0bGVzWyAobnVtYmVyJTEwMD40ICYmIG51bWJlciUxMDA8MjApPyAyIDogY2FzZXNbKG51bWJlciUxMDw1KT9udW1iZXIlMTA6NV0gXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpcnN0WmVybyh2KXtcbiAgICB2PU1hdGguZmxvb3Iodik7XG4gICAgaWYodjwxMClcbiAgICAgIHJldHVybiAnMCcrdjtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gdjtcbiAgfVxuXG4gIHZhciBjbG9ja3M9JCgnLmNsb2NrJyk7XG4gIGlmKGNsb2Nrcy5sZW5ndGg+MCl7XG4gICAgZnVuY3Rpb24gdXBkYXRlQ2xvY2soKXtcbiAgICAgIHZhciBjbG9ja3M9JCh0aGlzKTtcbiAgICAgIHZhciBub3c9bmV3IERhdGUoKTtcbiAgICAgIGZvcih2YXIgaT0wO2k8Y2xvY2tzLmxlbmd0aDtpKyspe1xuICAgICAgICB2YXIgYz1jbG9ja3MuZXEoaSk7XG4gICAgICAgIHZhciBlbmQ9bmV3IERhdGUoYy5kYXRhKCdlbmQnKS5yZXBsYWNlKC8tL2csIFwiL1wiKSk7XG4gICAgICAgIHZhciBkPShlbmQuZ2V0VGltZSgpLW5vdy5nZXRUaW1lKCkpLyAxMDAwO1xuXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0L/RgNC+0YjQtdC7XG4gICAgICAgIGlmKGQ8PTApe1xuICAgICAgICAgIGMudGV4dCgnQ9GA0L7QuiDQtNC10LnRgdGC0LLQuNGPINC40YHRgtGR0LonKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0LHQvtC70LXQtSAzMCDQtNC90LXQuVxuICAgICAgICBpZihkPjMwKjYwKjYwKjI0KXtcbiAgICAgICAgICBjLnRleHQoJ9Cx0L7Qu9C10LUgMzAg0LTQvdC10LknKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzPWQgJSA2MDtcbiAgICAgICAgZD0oZC1zKS82MDtcbiAgICAgICAgdmFyIG09ZCAlIDYwO1xuICAgICAgICBkPShkLW0pLzYwO1xuICAgICAgICB2YXIgaD1kICUgMjQ7XG4gICAgICAgIGQ9KGQtaCkvMjQ7XG5cbiAgICAgICAgdmFyIHN0cj1maXJzdFplcm8oaCkrXCI6XCIrZmlyc3RaZXJvKG0pK1wiOlwiK2ZpcnN0WmVybyhzKTtcbiAgICAgICAgaWYoZD4wKXtcbiAgICAgICAgICBzdHI9ZCtcIiBcIitkZWNsT2ZOdW0oZCwgWyfQtNC10L3RjCcsICfQtNC90Y8nLCAn0LTQvdC10LknXSkrXCIgIFwiK3N0cjtcbiAgICAgICAgfVxuICAgICAgICBjLnRleHQoc3RyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRJbnRlcnZhbCh1cGRhdGVDbG9jay5iaW5kKGNsb2NrcyksMTAwMCk7XG4gICAgdXBkYXRlQ2xvY2suYmluZChjbG9ja3MpKCk7XG4gIH1cbn0pOyJdfQ==
