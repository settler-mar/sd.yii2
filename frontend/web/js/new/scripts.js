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


}();

(function(){

    $('.coupons-list_item-content-goto-promocode-link').click(function(e){
        var expired = $(this).closest('.coupons-list_item').find('.clock-expired');
        if (expired.length > 0) {
            var title = 'К сожалению, срок действия данного промокода истек.';
            var message = 'Все действующие промокоды вы можете посмотреть <a href="/coupons">здесь</a>';
            notification.alert({
                'title': title,
                'question': message,
                'buttonYes': false,
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

    var forms = $('.ajax-action-form');
    console.log(forms);
    ajaxForm(forms);
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
    notification.notifi({'type':'info','message':msg})
  }
});
//скачивание картинок
(function () {
  function img_load_finish() {
    var data = this;
    var img = data.img;
    img.wrap('<div class="download"></div>');
    var wrap = img.parent();
    $('body').append(data.el);
    size = data.el.width() + "x" + data.el.height();
    data.el.remove();
    wrap.append('<span>' + size + '</span> <a href="' + data.src + '" download>Скачать</a>')
  }

  var imgs = $('.downloads_img img');
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
    el.width('auto');
    if(el[0].tagName=="IMG" && w>el.width())w=el.width();

    if (mw>50 && m_w > mw)m_w = mw;
    if (w>m_w > m_w) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsImpxdWVyeS5mbGV4c2xpZGVyLW1pbi5qcyIsInRpcHNvLm1pbi5qcyIsInRvb2x0aXAuanMiLCJhY2NvdW50X25vdGlmaWNhdGlvbi5qcyIsInNsaWRlci5qcyIsImhlYWRlcl9tZW51X2FuZF9zZWFyY2guanMiLCJjYWxjLWNhc2hiYWNrLmpzIiwiYXV0b19oaWRlX2NvbnRyb2wuanMiLCJoaWRlX3Nob3dfYWxsLmpzIiwiY2xvY2suanMiLCJsaXN0X3R5cGVfc3dpdGNoZXIuanMiLCJzZWxlY3QuanMiLCJzZWFyY2guanMiLCJnb3RvLmpzIiwiYWNjb3VudC13aXRoZHJhdy5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsIm1vZGFscy5qcyIsImZvb3Rlcl9tZW51LmpzIiwicmF0aW5nLmpzIiwiZmF2b3JpdGVzLmpzIiwic2Nyb2xsX3RvLmpzIiwiY29weV90b19jbGlwYm9hcmQuanMiLCJpbWcuanMiLCJwYXJlbnRzX29wZW5fd2luZG93cy5qcyIsImZvcm1zLmpzIiwiY29va2llLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaDhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJvYmplY3RzID0gZnVuY3Rpb24gKGEsYikge1xyXG4gICAgdmFyIGMgPSBiLFxyXG4gICAgICAgIGtleTtcclxuICAgIGZvciAoa2V5IGluIGEpIHtcclxuICAgICAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgIGNba2V5XSA9IGtleSBpbiBiID8gYltrZXldIDogYVtrZXldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBjO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gbG9naW5fcmVkaXJlY3QobmV3X2hyZWYpe1xyXG4gICAgaHJlZj1sb2NhdGlvbi5ocmVmO1xyXG4gICAgaWYoaHJlZi5pbmRleE9mKCdzdG9yZScpPjAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKT4wKXtcclxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgIH1lbHNle1xyXG4gICAgICAgIGxvY2F0aW9uLmhyZWY9bmV3X2hyZWY7XHJcbiAgICB9XHJcbn1cclxuIiwiKGZ1bmN0aW9uICh3LCBkLCAkKSB7XHJcbiAgICB2YXIgc2Nyb2xsc19ibG9jayA9ICQoJy5zY3JvbGxfYm94Jyk7XHJcblxyXG4gICAgaWYoc2Nyb2xsc19ibG9jay5sZW5ndGg9PTApIHJldHVybjtcclxuICAgIC8vJCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpLndyYXBBbGwoc2Nyb2xsc19ibG9jayk7XHJcbiAgICAkKHNjcm9sbHNfYmxvY2spLndyYXAoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKTtcclxuXHJcbiAgICBpbml0X3Njcm9sbCgpO1xyXG4gICAgY2FsY19zY3JvbGwoKTtcclxuXHJcbiAgICB2YXIgdDEsdDI7XHJcblxyXG4gICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHQxKTtcclxuICAgICAgICBjbGVhclRpbWVvdXQodDIpO1xyXG4gICAgICAgIHQxPXNldFRpbWVvdXQoY2FsY19zY3JvbGwsMzAwKTtcclxuICAgICAgICB0Mj1zZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLDgwMCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0X3Njcm9sbCgpIHtcclxuICAgICAgICB2YXIgY29udHJvbCA9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sXCI+PC9kaXY+JztcclxuICAgICAgICBjb250cm9sPSQoY29udHJvbCk7XHJcbiAgICAgICAgY29udHJvbC5pbnNlcnRBZnRlcihzY3JvbGxzX2Jsb2NrKTtcclxuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApO1xyXG5cclxuICAgICAgICBzY3JvbGxzX2Jsb2NrLnByZXBlbmQoJzxkaXYgY2xhc3M9c2Nyb2xsX2JveC1tb3Zlcj48L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgY29udHJvbC5vbignY2xpY2snLCcuc2Nyb2xsX2JveC1jb250cm9sX3BvaW50JyxmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBjb250cm9sID0gJHRoaXMucGFyZW50KCk7XHJcbiAgICAgICAgICAgIHZhciBpID0gJHRoaXMuaW5kZXgoKTtcclxuICAgICAgICAgICAgaWYoJHRoaXMuaGFzQ2xhc3MoJ2FjdGl2ZScpKXJldHVybjtcclxuICAgICAgICAgICAgY29udHJvbC5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgZHg9Y29udHJvbC5kYXRhKCdzbGlkZS1keCcpO1xyXG4gICAgICAgICAgICB2YXIgZWwgPSBjb250cm9sLnByZXYoKTtcclxuICAgICAgICAgICAgZWwuZmluZCgnLnNjcm9sbF9ib3gtbW92ZXInKS5jc3MoJ21hcmdpbi1sZWZ0JywtZHgqaSk7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgaSk7XHJcblxyXG4gICAgICAgICAgICBzdG9wU2Nyb2wuYmluZChlbCkoKTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGorKykge1xyXG4gICAgICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaik7XHJcbiAgICAgICAgZWwucGFyZW50KCkuaG92ZXIoc3RvcFNjcm9sLmJpbmQoZWwpLHN0YXJ0U2Nyb2wuYmluZChlbCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN0YXJ0U2Nyb2woKXtcclxuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKTtcclxuICAgICAgICBpZighJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XHJcblxyXG4gICAgICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUuYmluZCgkdGhpcyksIDIwMDApO1xyXG4gICAgICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsdGltZW91dElkKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN0b3BTY3JvbCgpe1xyXG4gICAgICAgIHZhciAkdGhpcz0kKHRoaXMpO1xyXG4gICAgICAgIHZhciB0aW1lb3V0SWQ9JHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJyk7XHJcbiAgICAgICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJyxmYWxzZSk7XHJcbiAgICAgICAgaWYoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikgfHwgIXRpbWVvdXRJZClyZXR1cm47XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcclxuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKTtcclxuICAgICAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLGZhbHNlKTtcclxuICAgICAgICBpZighJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBjb250cm9scz0kdGhpcy5uZXh0KCkuZmluZCgnPionKTtcclxuICAgICAgICB2YXIgYWN0aXZlPSR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xyXG4gICAgICAgIHZhciBwb2ludF9jbnQ9Y29udHJvbHMubGVuZ3RoO1xyXG4gICAgICAgIGlmKCFhY3RpdmUpYWN0aXZlPTA7XHJcbiAgICAgICAgYWN0aXZlKys7XHJcbiAgICAgICAgaWYoYWN0aXZlPj1wb2ludF9jbnQpYWN0aXZlPTA7XHJcbiAgICAgICAgJHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJywgYWN0aXZlKTtcclxuXHJcbiAgICAgICAgY29udHJvbHMuZXEoYWN0aXZlKS5jbGljaygpO1xyXG4gICAgICAgIHN0YXJ0U2Nyb2wuYmluZCgkdGhpcykoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjYWxjX3Njcm9sbCgpIHtcclxuICAgICAgICBmb3IoaT0wO2k8c2Nyb2xsc19ibG9jay5sZW5ndGg7aSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaSk7XHJcbiAgICAgICAgICAgIHZhciBjb250cm9sID0gZWwubmV4dCgpO1xyXG4gICAgICAgICAgICB2YXIgd2lkdGhfbWF4ID0gZWwuZGF0YSgnc2Nyb2xsLXdpZHRoLW1heCcpO1xyXG4gICAgICAgICAgICB3ID0gZWwud2lkdGgoKTtcclxuXHJcbiAgICAgICAgICAgIC8v0LTQtdC70LDQtdC8INC60L7QvdGC0YDQvtC70Ywg0L7Qs9GA0LDQvdC40YfQtdC90LjRjyDRiNC40YDQuNC90YsuINCV0YHQu9C4INC/0YDQtdCy0YvRiNC10L3QviDRgtC+INC+0YLQutC70Y7Rh9Cw0LXQvCDRgdC60YDQvtC7INC4INC/0LXRgNC10YXQvtC00LjQvCDQuiDRgdC70LXQtNGD0Y7RidC10LzRgyDRjdC70LXQvNC10L3RgtGDXHJcbiAgICAgICAgICAgIGlmICh3aWR0aF9tYXggJiYgdyA+IHdpZHRoX21heCkge1xyXG4gICAgICAgICAgICAgICAgY29udHJvbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgbm9fY2xhc3MgPSBlbC5kYXRhKCdzY3JvbGwtZWxlbWV0LWlnbm9yZS1jbGFzcycpO1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBlbC5maW5kKCc+KicpLm5vdCgnLnNjcm9sbF9ib3gtbW92ZXInKTtcclxuICAgICAgICAgICAgaWYgKG5vX2NsYXNzKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGNoaWxkcmVuLm5vdCgnLicgKyBub19jbGFzcylcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy/QldGB0LvQuCDQvdC10YIg0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbiA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgZl9lbD1jaGlsZHJlbi5lcSgxKTtcclxuICAgICAgICAgICAgdmFyIGNoaWxkcmVuX3cgPSBmX2VsLm91dGVyV2lkdGgoKTsgLy/QstGB0LXQs9C+INC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxyXG4gICAgICAgICAgICBjaGlsZHJlbl93Kz1wYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tbGVmdCcpKTtcclxuICAgICAgICAgICAgY2hpbGRyZW5fdys9cGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLXJpZ2h0JykpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNjcmVhbl9jb3VudCA9IE1hdGguZmxvb3IodyAvIGNoaWxkcmVuX3cpO1xyXG5cclxuICAgICAgICAgICAgLy/QldGB0LvQuCDQstGB0LUg0LLQu9Cw0LfQuNGCINC90LAg0Y3QutGA0LDQvVxyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4gPD0gc2NyZWFuX2NvdW50KSB7XHJcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL9Cj0LbQtSDRgtC+0YfQvdC+INC30L3QsNC10Lwg0YfRgtC+INGB0LrRgNC+0Lsg0L3Rg9C20LXQvVxyXG4gICAgICAgICAgICBlbC5hZGRDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHBvaW50X2NudCA9IGNoaWxkcmVuLmxlbmd0aCAtIHNjcmVhbl9jb3VudCArIDE7XHJcbiAgICAgICAgICAgIC8v0LXRgdC70Lgg0L3QtSDQvdCw0LTQviDQvtCx0L3QvtCy0LvRj9GC0Ywg0LrQvtC90YLRgNC+0Lsg0YLQviDQstGL0YXQvtC00LjQvCwg0L3QtSDQt9Cw0LHRi9Cy0LDRjyDQvtCx0L3QvtCy0LjRgtGMINGI0LjRgNC40L3RgyDQtNC+0YfQtdGA0L3QuNGFXHJcbiAgICAgICAgICAgIGlmIChjb250cm9sLmZpbmQoJz4qJykubGVuZ3RoID09IHBvaW50X2NudCkge1xyXG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGFjdGl2ZSA9IGVsLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAoIWFjdGl2ZSlhY3RpdmUgPSAwO1xyXG4gICAgICAgICAgICBpZiAoYWN0aXZlID49IHBvaW50X2NudClhY3RpdmUgPSBwb2ludF9jbnQgLSAxO1xyXG4gICAgICAgICAgICB2YXIgb3V0ID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcG9pbnRfY250OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcrKGo9PWFjdGl2ZT8nIGFjdGl2ZSc6JycpKydcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRyb2wuaHRtbChvdXQpO1xyXG5cclxuICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xyXG4gICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWNvdW50JywgcG9pbnRfY250KTtcclxuICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xyXG5cclxuICAgICAgICAgICAgaWYoIWVsLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpKXtcclxuICAgICAgICAgICAgICAgIHN0YXJ0U2Nyb2wuYmluZChlbCkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSh3aW5kb3csIGRvY3VtZW50LCBqUXVlcnkpKTsiLCJ2YXIgYWNjb3JkaW9uQ29udHJvbCA9ICQoJy5hY2NvcmRpb24gLmFjY29yZGlvbi1jb250cm9sJyk7XHJcblxyXG5hY2NvcmRpb25Db250cm9sLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAkYWNjb3JkaW9uID0gJHRoaXMuY2xvc2VzdCgnLmFjY29yZGlvbicpO1xyXG5cclxuICAgIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgICAgICAvKmlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpKXtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0qL1xyXG4gICAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2xpZGVVcCgzMDApO1xyXG4gICAgICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZigkYWNjb3JkaW9uLmhhc0NsYXNzKCdhY2NvcmRpb24tb25seV9vbmUnKSl7XHJcbiAgICAgICAgICAgICRvdGhlcj0kKCcuYWNjb3JkaW9uLW9ubHlfb25lJyk7XHJcbiAgICAgICAgICAgICRvdGhlci5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKVxyXG4gICAgICAgICAgICAgICAgLnNsaWRlVXAoMzAwKVxyXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcclxuICAgICAgICAgICAgJG90aGVyLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnbGFzdC1vcGVuJyk7XHJcblxyXG4gICAgICAgICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmFkZENsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcclxuICAgICAgICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnbGFzdC1vcGVuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2xpZGVEb3duKDMwMCk7XHJcbiAgICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59KTtcclxuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XHJcblxyXG5cclxuJCgnLmFjY29yZGlvbi13cmFwLm9wZW5fZmlyc3QgLmFjY29yZGlvbjpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdvcGVuJyk7XHJcbiQoJy5hY2NvcmRpb24td3JhcCAuYWNjb3JkaW9uLmFjY29yZGlvbi1zbGltOmZpcnN0LWNoaWxkJykuYWRkQ2xhc3MoJ29wZW4nKTtcclxuJCgnLmFjY29yZGlvbi1zbGltJykuYWRkQ2xhc3MoJ2FjY29yZGlvbi1vbmx5X29uZScpO1xyXG5cclxuLy/QtNC70Y8g0YHQuNC80L7QsiDQvtGC0LrRgNGL0LLQsNC10Lwg0LXRgdC70Lgg0LXRgdGC0Ywg0L/QvtC80LXRgtC60LAgb3BlbiDRgtC+INC/0YDQuNGB0LLQsNC40LLQsNC10Lwg0LLRgdC1INC+0YHRgtCw0LvRjNC90YvQtSDQutC70LDRgdGLXHJcbmFjY29yZGlvblNsaW09JCgnLmFjY29yZGlvbi5hY2NvcmRpb24tb25seV9vbmUnKTtcclxuaWYoYWNjb3JkaW9uU2xpbS5sZW5ndGg+MCl7XHJcbiAgICBhY2NvcmRpb25TbGltLnBhcmVudCgpLmZpbmQoJy5hY2NvcmRpb24ub3BlbicpXHJcbiAgICAgICAgLmFkZENsYXNzKCdsYXN0LW9wZW4nKVxyXG4gICAgICAgIC5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKVxyXG4gICAgICAgICAgICAuc2hvdygzMDApXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XHJcbn1cclxuIiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XHJcbiAgdmFyIGZpbGVBcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IgPyB0cnVlIDogZmFsc2U7XHJcbiAgdmFyIGRlZmF1bHRzID0ge1xyXG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJyxcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBvblBvc3QocG9zdCl7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgZm9ybT1kYXRhLmZvcm07XHJcbiAgICB3cmFwPWRhdGEud3JhcDtcclxuICAgIGlmKHBvc3QucmVuZGVyKXtcclxuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3M9XCJub3RpZnlfd2hpdGVcIjtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHBvc3QpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XHJcbiAgICAgIGFqYXhGb3JtKHdyYXApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25GYWlsKCl7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgZm9ybT1kYXRhLmZvcm07XHJcbiAgICB3cmFwPWRhdGEud3JhcDtcclxuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIHdyYXAuaHRtbCgnPGgzPtCj0L/RgS4uLiDQktC+0LfQvdC40LrQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwPGgzPicgK1xyXG4gICAgICAnPHA+0KfQsNGB0YLQviDRjdGC0L4g0L/RgNC+0LjRgdGF0L7QtNC40YIg0LIg0YHQu9GD0YfQsNC1LCDQtdGB0LvQuCDQstGLINC90LXRgdC60L7Qu9GM0LrQviDRgNCw0Lcg0L/QvtC00YDRj9C0INC90LXQstC10YDQvdC+INCy0LLQtdC70Lgg0YHQstC+0Lgg0YPRh9C10YLQvdGL0LUg0LTQsNC90L3Ri9C1LiDQndC+INCy0L7Qt9C80L7QttC90Ysg0Lgg0LTRgNGD0LPQuNC1INC/0YDQuNGH0LjQvdGLLiDQkiDQu9GO0LHQvtC8INGB0LvRg9GH0LDQtSDQvdC1INGA0LDRgdGB0YLRgNCw0LjQstCw0LnRgtC10YHRjCDQuCDQv9GA0L7RgdGC0L4g0L7QsdGA0LDRgtC40YLQtdGB0Ywg0Log0L3QsNGI0LXQvNGDINC+0L/QtdGA0LDRgtC+0YDRgyDRgdC70YPQttCx0Ysg0L/QvtC00LTQtdGA0LbQutC4LjwvcD48YnI+JyArXHJcbiAgICAgICc8cD7QodC/0LDRgdC40LHQvi48L3A+Jyk7XHJcbiAgICBhamF4Rm9ybSh3cmFwKTtcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvblN1Ym1pdChlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBkYXRhPXRoaXM7XHJcbiAgICBmb3JtPWRhdGEuZm9ybTtcclxuICAgIHdyYXA9ZGF0YS53cmFwO1xyXG5cclxuICAgIGlmKGZvcm0ueWlpQWN0aXZlRm9ybSl7XHJcbiAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcclxuICAgIH07XHJcblxyXG4gICAgaXNWYWxpZD0oZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aD09MCk7XHJcblxyXG4gICAgaWYoIWlzVmFsaWQpe1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgcmVxdWlyZWQ9Zm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCcpO1xyXG4gICAgICBmb3IoaT0wO2k8cmVxdWlyZWQubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgaWYocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoPDEpe1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIWZvcm0uc2VyaWFsaXplT2JqZWN0KWFkZFNSTygpO1xyXG5cclxuICAgIHZhciBwb3N0PWZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XHJcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICBmb3JtLmh0bWwoJycpO1xyXG4gICAgd3JhcC5odG1sKCc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHA+0J7RgtC/0YDQsNCy0LrQsCDQtNCw0L3QvdGL0YU8L3A+PC9kaXY+Jyk7XHJcblxyXG4gICAgZGF0YS51cmwrPShkYXRhLnVybC5pbmRleE9mKCc/Jyk+MD8nJic6Jz8nKSsncmM9JytNYXRoLnJhbmRvbSgpO1xyXG5cclxuICAgICQucG9zdChcclxuICAgICAgZGF0YS51cmwsXHJcbiAgICAgIHBvc3QsXHJcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxyXG4gICAgICAnanNvbidcclxuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxyXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXHJcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcclxuXHJcbiAgZm9yKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKyl7XHJcbiAgICB3cmFwPWVscy5lcShpKTtcclxuICAgIGZvcm09d3JhcC5maW5kKCdmb3JtJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgZm9ybTpmb3JtLFxyXG4gICAgICBwYXJhbTpkZWZhdWx0cyxcclxuICAgICAgd3JhcDp3cmFwXHJcbiAgICB9O1xyXG4gICAgZGF0YS51cmw9Zm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xyXG4gICAgZGF0YS5tZXRob2Q9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xyXG4gICAgZm9ybS5vZmYoJ3N1Ym1pdCcpO1xyXG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRTUk8oKXtcclxuICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvID0ge307XHJcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcclxuICAgICQuZWFjaChhLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcclxuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XHJcbiAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbztcclxuICB9O1xyXG59O1xyXG5hZGRTUk8oKTsiLCIvKlxyXG4gKiBqUXVlcnkgRmxleFNsaWRlciB2Mi42LjRcclxuICogQ29weXJpZ2h0IDIwMTIgV29vVGhlbWVzXHJcbiAqIENvbnRyaWJ1dGluZyBBdXRob3I6IFR5bGVyIFNtaXRoXHJcbiAqLyFmdW5jdGlvbigkKXt2YXIgZT0hMDskLmZsZXhzbGlkZXI9ZnVuY3Rpb24odCxhKXt2YXIgbj0kKHQpO24udmFycz0kLmV4dGVuZCh7fSwkLmZsZXhzbGlkZXIuZGVmYXVsdHMsYSk7dmFyIGk9bi52YXJzLm5hbWVzcGFjZSxyPXdpbmRvdy5uYXZpZ2F0b3ImJndpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCYmd2luZG93Lk1TR2VzdHVyZSxzPShcIm9udG91Y2hzdGFydFwiaW4gd2luZG93fHxyfHx3aW5kb3cuRG9jdW1lbnRUb3VjaCYmZG9jdW1lbnQgaW5zdGFuY2VvZiBEb2N1bWVudFRvdWNoKSYmbi52YXJzLnRvdWNoLG89XCJjbGljayB0b3VjaGVuZCBNU1BvaW50ZXJVcCBrZXl1cFwiLGw9XCJcIixjLGQ9XCJ2ZXJ0aWNhbFwiPT09bi52YXJzLmRpcmVjdGlvbix1PW4udmFycy5yZXZlcnNlLHY9bi52YXJzLml0ZW1XaWR0aD4wLHA9XCJmYWRlXCI9PT1uLnZhcnMuYW5pbWF0aW9uLG09XCJcIiE9PW4udmFycy5hc05hdkZvcixmPXt9OyQuZGF0YSh0LFwiZmxleHNsaWRlclwiLG4pLGY9e2luaXQ6ZnVuY3Rpb24oKXtuLmFuaW1hdGluZz0hMSxuLmN1cnJlbnRTbGlkZT1wYXJzZUludChuLnZhcnMuc3RhcnRBdD9uLnZhcnMuc3RhcnRBdDowLDEwKSxpc05hTihuLmN1cnJlbnRTbGlkZSkmJihuLmN1cnJlbnRTbGlkZT0wKSxuLmFuaW1hdGluZ1RvPW4uY3VycmVudFNsaWRlLG4uYXRFbmQ9MD09PW4uY3VycmVudFNsaWRlfHxuLmN1cnJlbnRTbGlkZT09PW4ubGFzdCxuLmNvbnRhaW5lclNlbGVjdG9yPW4udmFycy5zZWxlY3Rvci5zdWJzdHIoMCxuLnZhcnMuc2VsZWN0b3Iuc2VhcmNoKFwiIFwiKSksbi5zbGlkZXM9JChuLnZhcnMuc2VsZWN0b3Isbiksbi5jb250YWluZXI9JChuLmNvbnRhaW5lclNlbGVjdG9yLG4pLG4uY291bnQ9bi5zbGlkZXMubGVuZ3RoLG4uc3luY0V4aXN0cz0kKG4udmFycy5zeW5jKS5sZW5ndGg+MCxcInNsaWRlXCI9PT1uLnZhcnMuYW5pbWF0aW9uJiYobi52YXJzLmFuaW1hdGlvbj1cInN3aW5nXCIpLG4ucHJvcD1kP1widG9wXCI6XCJtYXJnaW5MZWZ0XCIsbi5hcmdzPXt9LG4ubWFudWFsUGF1c2U9ITEsbi5zdG9wcGVkPSExLG4uc3RhcnRlZD0hMSxuLnN0YXJ0VGltZW91dD1udWxsLG4udHJhbnNpdGlvbnM9IW4udmFycy52aWRlbyYmIXAmJm4udmFycy51c2VDU1MmJmZ1bmN0aW9uKCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0PVtcInBlcnNwZWN0aXZlUHJvcGVydHlcIixcIldlYmtpdFBlcnNwZWN0aXZlXCIsXCJNb3pQZXJzcGVjdGl2ZVwiLFwiT1BlcnNwZWN0aXZlXCIsXCJtc1BlcnNwZWN0aXZlXCJdO2Zvcih2YXIgYSBpbiB0KWlmKHZvaWQgMCE9PWUuc3R5bGVbdFthXV0pcmV0dXJuIG4ucGZ4PXRbYV0ucmVwbGFjZShcIlBlcnNwZWN0aXZlXCIsXCJcIikudG9Mb3dlckNhc2UoKSxuLnByb3A9XCItXCIrbi5wZngrXCItdHJhbnNmb3JtXCIsITA7cmV0dXJuITF9KCksbi5lbnN1cmVBbmltYXRpb25FbmQ9XCJcIixcIlwiIT09bi52YXJzLmNvbnRyb2xzQ29udGFpbmVyJiYobi5jb250cm9sc0NvbnRhaW5lcj0kKG4udmFycy5jb250cm9sc0NvbnRhaW5lcikubGVuZ3RoPjAmJiQobi52YXJzLmNvbnRyb2xzQ29udGFpbmVyKSksXCJcIiE9PW4udmFycy5tYW51YWxDb250cm9scyYmKG4ubWFudWFsQ29udHJvbHM9JChuLnZhcnMubWFudWFsQ29udHJvbHMpLmxlbmd0aD4wJiYkKG4udmFycy5tYW51YWxDb250cm9scykpLFwiXCIhPT1uLnZhcnMuY3VzdG9tRGlyZWN0aW9uTmF2JiYobi5jdXN0b21EaXJlY3Rpb25OYXY9Mj09PSQobi52YXJzLmN1c3RvbURpcmVjdGlvbk5hdikubGVuZ3RoJiYkKG4udmFycy5jdXN0b21EaXJlY3Rpb25OYXYpKSxuLnZhcnMucmFuZG9taXplJiYobi5zbGlkZXMuc29ydChmdW5jdGlvbigpe3JldHVybiBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpLS41fSksbi5jb250YWluZXIuZW1wdHkoKS5hcHBlbmQobi5zbGlkZXMpKSxuLmRvTWF0aCgpLG4uc2V0dXAoXCJpbml0XCIpLG4udmFycy5jb250cm9sTmF2JiZmLmNvbnRyb2xOYXYuc2V0dXAoKSxuLnZhcnMuZGlyZWN0aW9uTmF2JiZmLmRpcmVjdGlvbk5hdi5zZXR1cCgpLG4udmFycy5rZXlib2FyZCYmKDE9PT0kKG4uY29udGFpbmVyU2VsZWN0b3IpLmxlbmd0aHx8bi52YXJzLm11bHRpcGxlS2V5Ym9hcmQpJiYkKGRvY3VtZW50KS5iaW5kKFwia2V5dXBcIixmdW5jdGlvbihlKXt2YXIgdD1lLmtleUNvZGU7aWYoIW4uYW5pbWF0aW5nJiYoMzk9PT10fHwzNz09PXQpKXt2YXIgYT0zOT09PXQ/bi5nZXRUYXJnZXQoXCJuZXh0XCIpOjM3PT09dCYmbi5nZXRUYXJnZXQoXCJwcmV2XCIpO24uZmxleEFuaW1hdGUoYSxuLnZhcnMucGF1c2VPbkFjdGlvbil9fSksbi52YXJzLm1vdXNld2hlZWwmJm4uYmluZChcIm1vdXNld2hlZWxcIixmdW5jdGlvbihlLHQsYSxpKXtlLnByZXZlbnREZWZhdWx0KCk7dmFyIHI9dDwwP24uZ2V0VGFyZ2V0KFwibmV4dFwiKTpuLmdldFRhcmdldChcInByZXZcIik7bi5mbGV4QW5pbWF0ZShyLG4udmFycy5wYXVzZU9uQWN0aW9uKX0pLG4udmFycy5wYXVzZVBsYXkmJmYucGF1c2VQbGF5LnNldHVwKCksbi52YXJzLnNsaWRlc2hvdyYmbi52YXJzLnBhdXNlSW52aXNpYmxlJiZmLnBhdXNlSW52aXNpYmxlLmluaXQoKSxuLnZhcnMuc2xpZGVzaG93JiYobi52YXJzLnBhdXNlT25Ib3ZlciYmbi5ob3ZlcihmdW5jdGlvbigpe24ubWFudWFsUGxheXx8bi5tYW51YWxQYXVzZXx8bi5wYXVzZSgpfSxmdW5jdGlvbigpe24ubWFudWFsUGF1c2V8fG4ubWFudWFsUGxheXx8bi5zdG9wcGVkfHxuLnBsYXkoKX0pLG4udmFycy5wYXVzZUludmlzaWJsZSYmZi5wYXVzZUludmlzaWJsZS5pc0hpZGRlbigpfHwobi52YXJzLmluaXREZWxheT4wP24uc3RhcnRUaW1lb3V0PXNldFRpbWVvdXQobi5wbGF5LG4udmFycy5pbml0RGVsYXkpOm4ucGxheSgpKSksbSYmZi5hc05hdi5zZXR1cCgpLHMmJm4udmFycy50b3VjaCYmZi50b3VjaCgpLCghcHx8cCYmbi52YXJzLnNtb290aEhlaWdodCkmJiQod2luZG93KS5iaW5kKFwicmVzaXplIG9yaWVudGF0aW9uY2hhbmdlIGZvY3VzXCIsZi5yZXNpemUoKSksbi5maW5kKFwiaW1nXCIpLmF0dHIoXCJkcmFnZ2FibGVcIixcImZhbHNlXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLnZhcnMuc3RhcnQobil9LDIwMCl9LGFzTmF2OntzZXR1cDpmdW5jdGlvbigpe24uYXNOYXY9ITAsbi5hbmltYXRpbmdUbz1NYXRoLmZsb29yKG4uY3VycmVudFNsaWRlL24ubW92ZSksbi5jdXJyZW50SXRlbT1uLmN1cnJlbnRTbGlkZSxuLnNsaWRlcy5yZW1vdmVDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLmVxKG4uY3VycmVudEl0ZW0pLmFkZENsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIikscj8odC5fc2xpZGVyPW4sbi5zbGlkZXMuZWFjaChmdW5jdGlvbigpe3ZhciBlPXRoaXM7ZS5fZ2VzdHVyZT1uZXcgTVNHZXN0dXJlLGUuX2dlc3R1cmUudGFyZ2V0PWUsZS5hZGRFdmVudExpc3RlbmVyKFwiTVNQb2ludGVyRG93blwiLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKSxlLmN1cnJlbnRUYXJnZXQuX2dlc3R1cmUmJmUuY3VycmVudFRhcmdldC5fZ2VzdHVyZS5hZGRQb2ludGVyKGUucG9pbnRlcklkKX0sITEpLGUuYWRkRXZlbnRMaXN0ZW5lcihcIk1TR2VzdHVyZVRhcFwiLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt2YXIgdD0kKHRoaXMpLGE9dC5pbmRleCgpOyQobi52YXJzLmFzTmF2Rm9yKS5kYXRhKFwiZmxleHNsaWRlclwiKS5hbmltYXRpbmd8fHQuaGFzQ2xhc3MoXCJhY3RpdmVcIil8fChuLmRpcmVjdGlvbj1uLmN1cnJlbnRJdGVtPGE/XCJuZXh0XCI6XCJwcmV2XCIsbi5mbGV4QW5pbWF0ZShhLG4udmFycy5wYXVzZU9uQWN0aW9uLCExLCEwLCEwKSl9KX0pKTpuLnNsaWRlcy5vbihvLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt2YXIgdD0kKHRoaXMpLGE9dC5pbmRleCgpO3Qub2Zmc2V0KCkubGVmdC0kKG4pLnNjcm9sbExlZnQoKTw9MCYmdC5oYXNDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpP24uZmxleEFuaW1hdGUobi5nZXRUYXJnZXQoXCJwcmV2XCIpLCEwKTokKG4udmFycy5hc05hdkZvcikuZGF0YShcImZsZXhzbGlkZXJcIikuYW5pbWF0aW5nfHx0Lmhhc0NsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIil8fChuLmRpcmVjdGlvbj1uLmN1cnJlbnRJdGVtPGE/XCJuZXh0XCI6XCJwcmV2XCIsbi5mbGV4QW5pbWF0ZShhLG4udmFycy5wYXVzZU9uQWN0aW9uLCExLCEwLCEwKSl9KX19LGNvbnRyb2xOYXY6e3NldHVwOmZ1bmN0aW9uKCl7bi5tYW51YWxDb250cm9scz9mLmNvbnRyb2xOYXYuc2V0dXBNYW51YWwoKTpmLmNvbnRyb2xOYXYuc2V0dXBQYWdpbmcoKX0sc2V0dXBQYWdpbmc6ZnVuY3Rpb24oKXt2YXIgZT1cInRodW1ibmFpbHNcIj09PW4udmFycy5jb250cm9sTmF2P1wiY29udHJvbC10aHVtYnNcIjpcImNvbnRyb2wtcGFnaW5nXCIsdD0xLGEscjtpZihuLmNvbnRyb2xOYXZTY2FmZm9sZD0kKCc8b2wgY2xhc3M9XCInK2krXCJjb250cm9sLW5hdiBcIitpK2UrJ1wiPjwvb2w+Jyksbi5wYWdpbmdDb3VudD4xKWZvcih2YXIgcz0wO3M8bi5wYWdpbmdDb3VudDtzKyspe3I9bi5zbGlkZXMuZXEocyksdm9pZCAwPT09ci5hdHRyKFwiZGF0YS10aHVtYi1hbHRcIikmJnIuYXR0cihcImRhdGEtdGh1bWItYWx0XCIsXCJcIik7dmFyIGM9XCJcIiE9PXIuYXR0cihcImRhdGEtdGh1bWItYWx0XCIpP2M9JyBhbHQ9XCInK3IuYXR0cihcImRhdGEtdGh1bWItYWx0XCIpKydcIic6XCJcIjtpZihhPVwidGh1bWJuYWlsc1wiPT09bi52YXJzLmNvbnRyb2xOYXY/JzxpbWcgc3JjPVwiJytyLmF0dHIoXCJkYXRhLXRodW1iXCIpKydcIicrYytcIi8+XCI6JzxhIGhyZWY9XCIjXCI+Jyt0K1wiPC9hPlwiLFwidGh1bWJuYWlsc1wiPT09bi52YXJzLmNvbnRyb2xOYXYmJiEwPT09bi52YXJzLnRodW1iQ2FwdGlvbnMpe3ZhciBkPXIuYXR0cihcImRhdGEtdGh1bWJjYXB0aW9uXCIpO1wiXCIhPT1kJiZ2b2lkIDAhPT1kJiYoYSs9JzxzcGFuIGNsYXNzPVwiJytpKydjYXB0aW9uXCI+JytkK1wiPC9zcGFuPlwiKX1uLmNvbnRyb2xOYXZTY2FmZm9sZC5hcHBlbmQoXCI8bGk+XCIrYStcIjwvbGk+XCIpLHQrK31uLmNvbnRyb2xzQ29udGFpbmVyPyQobi5jb250cm9sc0NvbnRhaW5lcikuYXBwZW5kKG4uY29udHJvbE5hdlNjYWZmb2xkKTpuLmFwcGVuZChuLmNvbnRyb2xOYXZTY2FmZm9sZCksZi5jb250cm9sTmF2LnNldCgpLGYuY29udHJvbE5hdi5hY3RpdmUoKSxuLmNvbnRyb2xOYXZTY2FmZm9sZC5kZWxlZ2F0ZShcImEsIGltZ1wiLG8sZnVuY3Rpb24oZSl7aWYoZS5wcmV2ZW50RGVmYXVsdCgpLFwiXCI9PT1sfHxsPT09ZS50eXBlKXt2YXIgdD0kKHRoaXMpLGE9bi5jb250cm9sTmF2LmluZGV4KHQpO3QuaGFzQ2xhc3MoaStcImFjdGl2ZVwiKXx8KG4uZGlyZWN0aW9uPWE+bi5jdXJyZW50U2xpZGU/XCJuZXh0XCI6XCJwcmV2XCIsbi5mbGV4QW5pbWF0ZShhLG4udmFycy5wYXVzZU9uQWN0aW9uKSl9XCJcIj09PWwmJihsPWUudHlwZSksZi5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sc2V0dXBNYW51YWw6ZnVuY3Rpb24oKXtuLmNvbnRyb2xOYXY9bi5tYW51YWxDb250cm9scyxmLmNvbnRyb2xOYXYuYWN0aXZlKCksbi5jb250cm9sTmF2LmJpbmQobyxmdW5jdGlvbihlKXtpZihlLnByZXZlbnREZWZhdWx0KCksXCJcIj09PWx8fGw9PT1lLnR5cGUpe3ZhciB0PSQodGhpcyksYT1uLmNvbnRyb2xOYXYuaW5kZXgodCk7dC5oYXNDbGFzcyhpK1wiYWN0aXZlXCIpfHwoYT5uLmN1cnJlbnRTbGlkZT9uLmRpcmVjdGlvbj1cIm5leHRcIjpuLmRpcmVjdGlvbj1cInByZXZcIixuLmZsZXhBbmltYXRlKGEsbi52YXJzLnBhdXNlT25BY3Rpb24pKX1cIlwiPT09bCYmKGw9ZS50eXBlKSxmLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSxzZXQ6ZnVuY3Rpb24oKXt2YXIgZT1cInRodW1ibmFpbHNcIj09PW4udmFycy5jb250cm9sTmF2P1wiaW1nXCI6XCJhXCI7bi5jb250cm9sTmF2PSQoXCIuXCIraStcImNvbnRyb2wtbmF2IGxpIFwiK2Usbi5jb250cm9sc0NvbnRhaW5lcj9uLmNvbnRyb2xzQ29udGFpbmVyOm4pfSxhY3RpdmU6ZnVuY3Rpb24oKXtuLmNvbnRyb2xOYXYucmVtb3ZlQ2xhc3MoaStcImFjdGl2ZVwiKS5lcShuLmFuaW1hdGluZ1RvKS5hZGRDbGFzcyhpK1wiYWN0aXZlXCIpfSx1cGRhdGU6ZnVuY3Rpb24oZSx0KXtuLnBhZ2luZ0NvdW50PjEmJlwiYWRkXCI9PT1lP24uY29udHJvbE5hdlNjYWZmb2xkLmFwcGVuZCgkKCc8bGk+PGEgaHJlZj1cIiNcIj4nK24uY291bnQrXCI8L2E+PC9saT5cIikpOjE9PT1uLnBhZ2luZ0NvdW50P24uY29udHJvbE5hdlNjYWZmb2xkLmZpbmQoXCJsaVwiKS5yZW1vdmUoKTpuLmNvbnRyb2xOYXYuZXEodCkuY2xvc2VzdChcImxpXCIpLnJlbW92ZSgpLGYuY29udHJvbE5hdi5zZXQoKSxuLnBhZ2luZ0NvdW50PjEmJm4ucGFnaW5nQ291bnQhPT1uLmNvbnRyb2xOYXYubGVuZ3RoP24udXBkYXRlKHQsZSk6Zi5jb250cm9sTmF2LmFjdGl2ZSgpfX0sZGlyZWN0aW9uTmF2OntzZXR1cDpmdW5jdGlvbigpe3ZhciBlPSQoJzx1bCBjbGFzcz1cIicraSsnZGlyZWN0aW9uLW5hdlwiPjxsaSBjbGFzcz1cIicraSsnbmF2LXByZXZcIj48YSBjbGFzcz1cIicraSsncHJldlwiIGhyZWY9XCIjXCI+JytuLnZhcnMucHJldlRleHQrJzwvYT48L2xpPjxsaSBjbGFzcz1cIicraSsnbmF2LW5leHRcIj48YSBjbGFzcz1cIicraSsnbmV4dFwiIGhyZWY9XCIjXCI+JytuLnZhcnMubmV4dFRleHQrXCI8L2E+PC9saT48L3VsPlwiKTtuLmN1c3RvbURpcmVjdGlvbk5hdj9uLmRpcmVjdGlvbk5hdj1uLmN1c3RvbURpcmVjdGlvbk5hdjpuLmNvbnRyb2xzQ29udGFpbmVyPygkKG4uY29udHJvbHNDb250YWluZXIpLmFwcGVuZChlKSxuLmRpcmVjdGlvbk5hdj0kKFwiLlwiK2krXCJkaXJlY3Rpb24tbmF2IGxpIGFcIixuLmNvbnRyb2xzQ29udGFpbmVyKSk6KG4uYXBwZW5kKGUpLG4uZGlyZWN0aW9uTmF2PSQoXCIuXCIraStcImRpcmVjdGlvbi1uYXYgbGkgYVwiLG4pKSxmLmRpcmVjdGlvbk5hdi51cGRhdGUoKSxuLmRpcmVjdGlvbk5hdi5iaW5kKG8sZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciB0O1wiXCIhPT1sJiZsIT09ZS50eXBlfHwodD0kKHRoaXMpLmhhc0NsYXNzKGkrXCJuZXh0XCIpP24uZ2V0VGFyZ2V0KFwibmV4dFwiKTpuLmdldFRhcmdldChcInByZXZcIiksbi5mbGV4QW5pbWF0ZSh0LG4udmFycy5wYXVzZU9uQWN0aW9uKSksXCJcIj09PWwmJihsPWUudHlwZSksZi5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sdXBkYXRlOmZ1bmN0aW9uKCl7dmFyIGU9aStcImRpc2FibGVkXCI7MT09PW4ucGFnaW5nQ291bnQ/bi5kaXJlY3Rpb25OYXYuYWRkQ2xhc3MoZSkuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTpuLnZhcnMuYW5pbWF0aW9uTG9vcD9uLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5yZW1vdmVBdHRyKFwidGFiaW5kZXhcIik6MD09PW4uYW5pbWF0aW5nVG8/bi5kaXJlY3Rpb25OYXYucmVtb3ZlQ2xhc3MoZSkuZmlsdGVyKFwiLlwiK2krXCJwcmV2XCIpLmFkZENsYXNzKGUpLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIik6bi5hbmltYXRpbmdUbz09PW4ubGFzdD9uLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5maWx0ZXIoXCIuXCIraStcIm5leHRcIikuYWRkQ2xhc3MoZSkuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTpuLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5yZW1vdmVBdHRyKFwidGFiaW5kZXhcIil9fSxwYXVzZVBsYXk6e3NldHVwOmZ1bmN0aW9uKCl7dmFyIGU9JCgnPGRpdiBjbGFzcz1cIicraSsncGF1c2VwbGF5XCI+PGEgaHJlZj1cIiNcIj48L2E+PC9kaXY+Jyk7bi5jb250cm9sc0NvbnRhaW5lcj8obi5jb250cm9sc0NvbnRhaW5lci5hcHBlbmQoZSksbi5wYXVzZVBsYXk9JChcIi5cIitpK1wicGF1c2VwbGF5IGFcIixuLmNvbnRyb2xzQ29udGFpbmVyKSk6KG4uYXBwZW5kKGUpLG4ucGF1c2VQbGF5PSQoXCIuXCIraStcInBhdXNlcGxheSBhXCIsbikpLGYucGF1c2VQbGF5LnVwZGF0ZShuLnZhcnMuc2xpZGVzaG93P2krXCJwYXVzZVwiOmkrXCJwbGF5XCIpLG4ucGF1c2VQbGF5LmJpbmQobyxmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCksXCJcIiE9PWwmJmwhPT1lLnR5cGV8fCgkKHRoaXMpLmhhc0NsYXNzKGkrXCJwYXVzZVwiKT8obi5tYW51YWxQYXVzZT0hMCxuLm1hbnVhbFBsYXk9ITEsbi5wYXVzZSgpKToobi5tYW51YWxQYXVzZT0hMSxuLm1hbnVhbFBsYXk9ITAsbi5wbGF5KCkpKSxcIlwiPT09bCYmKGw9ZS50eXBlKSxmLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSx1cGRhdGU6ZnVuY3Rpb24oZSl7XCJwbGF5XCI9PT1lP24ucGF1c2VQbGF5LnJlbW92ZUNsYXNzKGkrXCJwYXVzZVwiKS5hZGRDbGFzcyhpK1wicGxheVwiKS5odG1sKG4udmFycy5wbGF5VGV4dCk6bi5wYXVzZVBsYXkucmVtb3ZlQ2xhc3MoaStcInBsYXlcIikuYWRkQ2xhc3MoaStcInBhdXNlXCIpLmh0bWwobi52YXJzLnBhdXNlVGV4dCl9fSx0b3VjaDpmdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSl7ZS5zdG9wUHJvcGFnYXRpb24oKSxuLmFuaW1hdGluZz9lLnByZXZlbnREZWZhdWx0KCk6KG4ucGF1c2UoKSx0Ll9nZXN0dXJlLmFkZFBvaW50ZXIoZS5wb2ludGVySWQpLFQ9MCxjPWQ/bi5oOm4udyxmPU51bWJlcihuZXcgRGF0ZSksbD12JiZ1JiZuLmFuaW1hdGluZ1RvPT09bi5sYXN0PzA6diYmdT9uLmxpbWl0LShuLml0ZW1XK24udmFycy5pdGVtTWFyZ2luKSpuLm1vdmUqbi5hbmltYXRpbmdUbzp2JiZuLmN1cnJlbnRTbGlkZT09PW4ubGFzdD9uLmxpbWl0OnY/KG4uaXRlbVcrbi52YXJzLml0ZW1NYXJnaW4pKm4ubW92ZSpuLmN1cnJlbnRTbGlkZTp1PyhuLmxhc3Qtbi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCkqYzoobi5jdXJyZW50U2xpZGUrbi5jbG9uZU9mZnNldCkqYyl9ZnVuY3Rpb24gYShlKXtlLnN0b3BQcm9wYWdhdGlvbigpO3ZhciBhPWUudGFyZ2V0Ll9zbGlkZXI7aWYoYSl7dmFyIG49LWUudHJhbnNsYXRpb25YLGk9LWUudHJhbnNsYXRpb25ZO2lmKFQrPWQ/aTpuLG09VCx5PWQ/TWF0aC5hYnMoVCk8TWF0aC5hYnMoLW4pOk1hdGguYWJzKFQpPE1hdGguYWJzKC1pKSxlLmRldGFpbD09PWUuTVNHRVNUVVJFX0ZMQUdfSU5FUlRJQSlyZXR1cm4gdm9pZCBzZXRJbW1lZGlhdGUoZnVuY3Rpb24oKXt0Ll9nZXN0dXJlLnN0b3AoKX0pOygheXx8TnVtYmVyKG5ldyBEYXRlKS1mPjUwMCkmJihlLnByZXZlbnREZWZhdWx0KCksIXAmJmEudHJhbnNpdGlvbnMmJihhLnZhcnMuYW5pbWF0aW9uTG9vcHx8KG09VC8oMD09PWEuY3VycmVudFNsaWRlJiZUPDB8fGEuY3VycmVudFNsaWRlPT09YS5sYXN0JiZUPjA/TWF0aC5hYnMoVCkvYysyOjEpKSxhLnNldFByb3BzKGwrbSxcInNldFRvdWNoXCIpKSl9fWZ1bmN0aW9uIGkoZSl7ZS5zdG9wUHJvcGFnYXRpb24oKTt2YXIgdD1lLnRhcmdldC5fc2xpZGVyO2lmKHQpe2lmKHQuYW5pbWF0aW5nVG89PT10LmN1cnJlbnRTbGlkZSYmIXkmJm51bGwhPT1tKXt2YXIgYT11Py1tOm0sbj1hPjA/dC5nZXRUYXJnZXQoXCJuZXh0XCIpOnQuZ2V0VGFyZ2V0KFwicHJldlwiKTt0LmNhbkFkdmFuY2UobikmJihOdW1iZXIobmV3IERhdGUpLWY8NTUwJiZNYXRoLmFicyhhKT41MHx8TWF0aC5hYnMoYSk+Yy8yKT90LmZsZXhBbmltYXRlKG4sdC52YXJzLnBhdXNlT25BY3Rpb24pOnB8fHQuZmxleEFuaW1hdGUodC5jdXJyZW50U2xpZGUsdC52YXJzLnBhdXNlT25BY3Rpb24sITApfXM9bnVsbCxvPW51bGwsbT1udWxsLGw9bnVsbCxUPTB9fXZhciBzLG8sbCxjLG0sZixnLGgsUyx5PSExLHg9MCxiPTAsVD0wO3I/KHQuc3R5bGUubXNUb3VjaEFjdGlvbj1cIm5vbmVcIix0Ll9nZXN0dXJlPW5ldyBNU0dlc3R1cmUsdC5fZ2VzdHVyZS50YXJnZXQ9dCx0LmFkZEV2ZW50TGlzdGVuZXIoXCJNU1BvaW50ZXJEb3duXCIsZSwhMSksdC5fc2xpZGVyPW4sdC5hZGRFdmVudExpc3RlbmVyKFwiTVNHZXN0dXJlQ2hhbmdlXCIsYSwhMSksdC5hZGRFdmVudExpc3RlbmVyKFwiTVNHZXN0dXJlRW5kXCIsaSwhMSkpOihnPWZ1bmN0aW9uKGUpe24uYW5pbWF0aW5nP2UucHJldmVudERlZmF1bHQoKTood2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkfHwxPT09ZS50b3VjaGVzLmxlbmd0aCkmJihuLnBhdXNlKCksYz1kP24uaDpuLncsZj1OdW1iZXIobmV3IERhdGUpLHg9ZS50b3VjaGVzWzBdLnBhZ2VYLGI9ZS50b3VjaGVzWzBdLnBhZ2VZLGw9diYmdSYmbi5hbmltYXRpbmdUbz09PW4ubGFzdD8wOnYmJnU/bi5saW1pdC0obi5pdGVtVytuLnZhcnMuaXRlbU1hcmdpbikqbi5tb3ZlKm4uYW5pbWF0aW5nVG86diYmbi5jdXJyZW50U2xpZGU9PT1uLmxhc3Q/bi5saW1pdDp2PyhuLml0ZW1XK24udmFycy5pdGVtTWFyZ2luKSpuLm1vdmUqbi5jdXJyZW50U2xpZGU6dT8obi5sYXN0LW4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQpKmM6KG4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQpKmMscz1kP2I6eCxvPWQ/eDpiLHQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLGgsITEpLHQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsUywhMSkpfSxoPWZ1bmN0aW9uKGUpe3g9ZS50b3VjaGVzWzBdLnBhZ2VYLGI9ZS50b3VjaGVzWzBdLnBhZ2VZLG09ZD9zLWI6cy14LHk9ZD9NYXRoLmFicyhtKTxNYXRoLmFicyh4LW8pOk1hdGguYWJzKG0pPE1hdGguYWJzKGItbyk7dmFyIHQ9NTAwOygheXx8TnVtYmVyKG5ldyBEYXRlKS1mPjUwMCkmJihlLnByZXZlbnREZWZhdWx0KCksIXAmJm4udHJhbnNpdGlvbnMmJihuLnZhcnMuYW5pbWF0aW9uTG9vcHx8KG0vPTA9PT1uLmN1cnJlbnRTbGlkZSYmbTwwfHxuLmN1cnJlbnRTbGlkZT09PW4ubGFzdCYmbT4wP01hdGguYWJzKG0pL2MrMjoxKSxuLnNldFByb3BzKGwrbSxcInNldFRvdWNoXCIpKSl9LFM9ZnVuY3Rpb24oZSl7aWYodC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsaCwhMSksbi5hbmltYXRpbmdUbz09PW4uY3VycmVudFNsaWRlJiYheSYmbnVsbCE9PW0pe3ZhciBhPXU/LW06bSxpPWE+MD9uLmdldFRhcmdldChcIm5leHRcIik6bi5nZXRUYXJnZXQoXCJwcmV2XCIpO24uY2FuQWR2YW5jZShpKSYmKE51bWJlcihuZXcgRGF0ZSktZjw1NTAmJk1hdGguYWJzKGEpPjUwfHxNYXRoLmFicyhhKT5jLzIpP24uZmxleEFuaW1hdGUoaSxuLnZhcnMucGF1c2VPbkFjdGlvbik6cHx8bi5mbGV4QW5pbWF0ZShuLmN1cnJlbnRTbGlkZSxuLnZhcnMucGF1c2VPbkFjdGlvbiwhMCl9dC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIixTLCExKSxzPW51bGwsbz1udWxsLG09bnVsbCxsPW51bGx9LHQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIixnLCExKSl9LHJlc2l6ZTpmdW5jdGlvbigpeyFuLmFuaW1hdGluZyYmbi5pcyhcIjp2aXNpYmxlXCIpJiYodnx8bi5kb01hdGgoKSxwP2Yuc21vb3RoSGVpZ2h0KCk6dj8obi5zbGlkZXMud2lkdGgobi5jb21wdXRlZFcpLG4udXBkYXRlKG4ucGFnaW5nQ291bnQpLG4uc2V0UHJvcHMoKSk6ZD8obi52aWV3cG9ydC5oZWlnaHQobi5oKSxuLnNldFByb3BzKG4uaCxcInNldFRvdGFsXCIpKToobi52YXJzLnNtb290aEhlaWdodCYmZi5zbW9vdGhIZWlnaHQoKSxuLm5ld1NsaWRlcy53aWR0aChuLmNvbXB1dGVkVyksbi5zZXRQcm9wcyhuLmNvbXB1dGVkVyxcInNldFRvdGFsXCIpKSl9LHNtb290aEhlaWdodDpmdW5jdGlvbihlKXtpZighZHx8cCl7dmFyIHQ9cD9uOm4udmlld3BvcnQ7ZT90LmFuaW1hdGUoe2hlaWdodDpuLnNsaWRlcy5lcShuLmFuaW1hdGluZ1RvKS5pbm5lckhlaWdodCgpfSxlKTp0LmlubmVySGVpZ2h0KG4uc2xpZGVzLmVxKG4uYW5pbWF0aW5nVG8pLmlubmVySGVpZ2h0KCkpfX0sc3luYzpmdW5jdGlvbihlKXt2YXIgdD0kKG4udmFycy5zeW5jKS5kYXRhKFwiZmxleHNsaWRlclwiKSxhPW4uYW5pbWF0aW5nVG87c3dpdGNoKGUpe2Nhc2VcImFuaW1hdGVcIjp0LmZsZXhBbmltYXRlKGEsbi52YXJzLnBhdXNlT25BY3Rpb24sITEsITApO2JyZWFrO2Nhc2VcInBsYXlcIjp0LnBsYXlpbmd8fHQuYXNOYXZ8fHQucGxheSgpO2JyZWFrO2Nhc2VcInBhdXNlXCI6dC5wYXVzZSgpO2JyZWFrfX0sdW5pcXVlSUQ6ZnVuY3Rpb24oZSl7cmV0dXJuIGUuZmlsdGVyKFwiW2lkXVwiKS5hZGQoZS5maW5kKFwiW2lkXVwiKSkuZWFjaChmdW5jdGlvbigpe3ZhciBlPSQodGhpcyk7ZS5hdHRyKFwiaWRcIixlLmF0dHIoXCJpZFwiKStcIl9jbG9uZVwiKX0pLGV9LHBhdXNlSW52aXNpYmxlOnt2aXNQcm9wOm51bGwsaW5pdDpmdW5jdGlvbigpe3ZhciBlPWYucGF1c2VJbnZpc2libGUuZ2V0SGlkZGVuUHJvcCgpO2lmKGUpe3ZhciB0PWUucmVwbGFjZSgvW0h8aF1pZGRlbi8sXCJcIikrXCJ2aXNpYmlsaXR5Y2hhbmdlXCI7ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0LGZ1bmN0aW9uKCl7Zi5wYXVzZUludmlzaWJsZS5pc0hpZGRlbigpP24uc3RhcnRUaW1lb3V0P2NsZWFyVGltZW91dChuLnN0YXJ0VGltZW91dCk6bi5wYXVzZSgpOm4uc3RhcnRlZD9uLnBsYXkoKTpuLnZhcnMuaW5pdERlbGF5PjA/c2V0VGltZW91dChuLnBsYXksbi52YXJzLmluaXREZWxheSk6bi5wbGF5KCl9KX19LGlzSGlkZGVuOmZ1bmN0aW9uKCl7dmFyIGU9Zi5wYXVzZUludmlzaWJsZS5nZXRIaWRkZW5Qcm9wKCk7cmV0dXJuISFlJiZkb2N1bWVudFtlXX0sZ2V0SGlkZGVuUHJvcDpmdW5jdGlvbigpe3ZhciBlPVtcIndlYmtpdFwiLFwibW96XCIsXCJtc1wiLFwib1wiXTtpZihcImhpZGRlblwiaW4gZG9jdW1lbnQpcmV0dXJuXCJoaWRkZW5cIjtmb3IodmFyIHQ9MDt0PGUubGVuZ3RoO3QrKylpZihlW3RdK1wiSGlkZGVuXCJpbiBkb2N1bWVudClyZXR1cm4gZVt0XStcIkhpZGRlblwiO3JldHVybiBudWxsfX0sc2V0VG9DbGVhcldhdGNoZWRFdmVudDpmdW5jdGlvbigpe2NsZWFyVGltZW91dChjKSxjPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtsPVwiXCJ9LDNlMyl9fSxuLmZsZXhBbmltYXRlPWZ1bmN0aW9uKGUsdCxhLHIsbyl7aWYobi52YXJzLmFuaW1hdGlvbkxvb3B8fGU9PT1uLmN1cnJlbnRTbGlkZXx8KG4uZGlyZWN0aW9uPWU+bi5jdXJyZW50U2xpZGU/XCJuZXh0XCI6XCJwcmV2XCIpLG0mJjE9PT1uLnBhZ2luZ0NvdW50JiYobi5kaXJlY3Rpb249bi5jdXJyZW50SXRlbTxlP1wibmV4dFwiOlwicHJldlwiKSwhbi5hbmltYXRpbmcmJihuLmNhbkFkdmFuY2UoZSxvKXx8YSkmJm4uaXMoXCI6dmlzaWJsZVwiKSl7aWYobSYmcil7dmFyIGw9JChuLnZhcnMuYXNOYXZGb3IpLmRhdGEoXCJmbGV4c2xpZGVyXCIpO2lmKG4uYXRFbmQ9MD09PWV8fGU9PT1uLmNvdW50LTEsbC5mbGV4QW5pbWF0ZShlLCEwLCExLCEwLG8pLG4uZGlyZWN0aW9uPW4uY3VycmVudEl0ZW08ZT9cIm5leHRcIjpcInByZXZcIixsLmRpcmVjdGlvbj1uLmRpcmVjdGlvbixNYXRoLmNlaWwoKGUrMSkvbi52aXNpYmxlKS0xPT09bi5jdXJyZW50U2xpZGV8fDA9PT1lKXJldHVybiBuLmN1cnJlbnRJdGVtPWUsbi5zbGlkZXMucmVtb3ZlQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKS5lcShlKS5hZGRDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLCExO24uY3VycmVudEl0ZW09ZSxuLnNsaWRlcy5yZW1vdmVDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGUpLmFkZENsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIiksZT1NYXRoLmZsb29yKGUvbi52aXNpYmxlKX1pZihuLmFuaW1hdGluZz0hMCxuLmFuaW1hdGluZ1RvPWUsdCYmbi5wYXVzZSgpLG4udmFycy5iZWZvcmUobiksbi5zeW5jRXhpc3RzJiYhbyYmZi5zeW5jKFwiYW5pbWF0ZVwiKSxuLnZhcnMuY29udHJvbE5hdiYmZi5jb250cm9sTmF2LmFjdGl2ZSgpLHZ8fG4uc2xpZGVzLnJlbW92ZUNsYXNzKGkrXCJhY3RpdmUtc2xpZGVcIikuZXEoZSkuYWRkQ2xhc3MoaStcImFjdGl2ZS1zbGlkZVwiKSxuLmF0RW5kPTA9PT1lfHxlPT09bi5sYXN0LG4udmFycy5kaXJlY3Rpb25OYXYmJmYuZGlyZWN0aW9uTmF2LnVwZGF0ZSgpLGU9PT1uLmxhc3QmJihuLnZhcnMuZW5kKG4pLG4udmFycy5hbmltYXRpb25Mb29wfHxuLnBhdXNlKCkpLHApcz8obi5zbGlkZXMuZXEobi5jdXJyZW50U2xpZGUpLmNzcyh7b3BhY2l0eTowLHpJbmRleDoxfSksbi5zbGlkZXMuZXEoZSkuY3NzKHtvcGFjaXR5OjEsekluZGV4OjJ9KSxuLndyYXB1cChjKSk6KG4uc2xpZGVzLmVxKG4uY3VycmVudFNsaWRlKS5jc3Moe3pJbmRleDoxfSkuYW5pbWF0ZSh7b3BhY2l0eTowfSxuLnZhcnMuYW5pbWF0aW9uU3BlZWQsbi52YXJzLmVhc2luZyksbi5zbGlkZXMuZXEoZSkuY3NzKHt6SW5kZXg6Mn0pLmFuaW1hdGUoe29wYWNpdHk6MX0sbi52YXJzLmFuaW1hdGlvblNwZWVkLG4udmFycy5lYXNpbmcsbi53cmFwdXApKTtlbHNle3ZhciBjPWQ/bi5zbGlkZXMuZmlsdGVyKFwiOmZpcnN0XCIpLmhlaWdodCgpOm4uY29tcHV0ZWRXLGcsaCxTO3Y/KGc9bi52YXJzLml0ZW1NYXJnaW4sUz0obi5pdGVtVytnKSpuLm1vdmUqbi5hbmltYXRpbmdUbyxoPVM+bi5saW1pdCYmMSE9PW4udmlzaWJsZT9uLmxpbWl0OlMpOmg9MD09PW4uY3VycmVudFNsaWRlJiZlPT09bi5jb3VudC0xJiZuLnZhcnMuYW5pbWF0aW9uTG9vcCYmXCJuZXh0XCIhPT1uLmRpcmVjdGlvbj91PyhuLmNvdW50K24uY2xvbmVPZmZzZXQpKmM6MDpuLmN1cnJlbnRTbGlkZT09PW4ubGFzdCYmMD09PWUmJm4udmFycy5hbmltYXRpb25Mb29wJiZcInByZXZcIiE9PW4uZGlyZWN0aW9uP3U/MDoobi5jb3VudCsxKSpjOnU/KG4uY291bnQtMS1lK24uY2xvbmVPZmZzZXQpKmM6KGUrbi5jbG9uZU9mZnNldCkqYyxuLnNldFByb3BzKGgsXCJcIixuLnZhcnMuYW5pbWF0aW9uU3BlZWQpLG4udHJhbnNpdGlvbnM/KG4udmFycy5hbmltYXRpb25Mb29wJiZuLmF0RW5kfHwobi5hbmltYXRpbmc9ITEsbi5jdXJyZW50U2xpZGU9bi5hbmltYXRpbmdUbyksbi5jb250YWluZXIudW5iaW5kKFwid2Via2l0VHJhbnNpdGlvbkVuZCB0cmFuc2l0aW9uZW5kXCIpLG4uY29udGFpbmVyLmJpbmQoXCJ3ZWJraXRUcmFuc2l0aW9uRW5kIHRyYW5zaXRpb25lbmRcIixmdW5jdGlvbigpe2NsZWFyVGltZW91dChuLmVuc3VyZUFuaW1hdGlvbkVuZCksbi53cmFwdXAoYyl9KSxjbGVhclRpbWVvdXQobi5lbnN1cmVBbmltYXRpb25FbmQpLG4uZW5zdXJlQW5pbWF0aW9uRW5kPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLndyYXB1cChjKX0sbi52YXJzLmFuaW1hdGlvblNwZWVkKzEwMCkpOm4uY29udGFpbmVyLmFuaW1hdGUobi5hcmdzLG4udmFycy5hbmltYXRpb25TcGVlZCxuLnZhcnMuZWFzaW5nLGZ1bmN0aW9uKCl7bi53cmFwdXAoYyl9KX1uLnZhcnMuc21vb3RoSGVpZ2h0JiZmLnNtb290aEhlaWdodChuLnZhcnMuYW5pbWF0aW9uU3BlZWQpfX0sbi53cmFwdXA9ZnVuY3Rpb24oZSl7cHx8dnx8KDA9PT1uLmN1cnJlbnRTbGlkZSYmbi5hbmltYXRpbmdUbz09PW4ubGFzdCYmbi52YXJzLmFuaW1hdGlvbkxvb3A/bi5zZXRQcm9wcyhlLFwianVtcEVuZFwiKTpuLmN1cnJlbnRTbGlkZT09PW4ubGFzdCYmMD09PW4uYW5pbWF0aW5nVG8mJm4udmFycy5hbmltYXRpb25Mb29wJiZuLnNldFByb3BzKGUsXCJqdW1wU3RhcnRcIikpLG4uYW5pbWF0aW5nPSExLG4uY3VycmVudFNsaWRlPW4uYW5pbWF0aW5nVG8sbi52YXJzLmFmdGVyKG4pfSxuLmFuaW1hdGVTbGlkZXM9ZnVuY3Rpb24oKXshbi5hbmltYXRpbmcmJmUmJm4uZmxleEFuaW1hdGUobi5nZXRUYXJnZXQoXCJuZXh0XCIpKX0sbi5wYXVzZT1mdW5jdGlvbigpe2NsZWFySW50ZXJ2YWwobi5hbmltYXRlZFNsaWRlcyksbi5hbmltYXRlZFNsaWRlcz1udWxsLG4ucGxheWluZz0hMSxuLnZhcnMucGF1c2VQbGF5JiZmLnBhdXNlUGxheS51cGRhdGUoXCJwbGF5XCIpLG4uc3luY0V4aXN0cyYmZi5zeW5jKFwicGF1c2VcIil9LG4ucGxheT1mdW5jdGlvbigpe24ucGxheWluZyYmY2xlYXJJbnRlcnZhbChuLmFuaW1hdGVkU2xpZGVzKSxuLmFuaW1hdGVkU2xpZGVzPW4uYW5pbWF0ZWRTbGlkZXN8fHNldEludGVydmFsKG4uYW5pbWF0ZVNsaWRlcyxuLnZhcnMuc2xpZGVzaG93U3BlZWQpLG4uc3RhcnRlZD1uLnBsYXlpbmc9ITAsbi52YXJzLnBhdXNlUGxheSYmZi5wYXVzZVBsYXkudXBkYXRlKFwicGF1c2VcIiksbi5zeW5jRXhpc3RzJiZmLnN5bmMoXCJwbGF5XCIpfSxuLnN0b3A9ZnVuY3Rpb24oKXtuLnBhdXNlKCksbi5zdG9wcGVkPSEwfSxuLmNhbkFkdmFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgYT1tP24ucGFnaW5nQ291bnQtMTpuLmxhc3Q7cmV0dXJuISF0fHwoISghbXx8bi5jdXJyZW50SXRlbSE9PW4uY291bnQtMXx8MCE9PWV8fFwicHJldlwiIT09bi5kaXJlY3Rpb24pfHwoIW18fDAhPT1uLmN1cnJlbnRJdGVtfHxlIT09bi5wYWdpbmdDb3VudC0xfHxcIm5leHRcIj09PW4uZGlyZWN0aW9uKSYmKCEoZT09PW4uY3VycmVudFNsaWRlJiYhbSkmJighIW4udmFycy5hbmltYXRpb25Mb29wfHwoIW4uYXRFbmR8fDAhPT1uLmN1cnJlbnRTbGlkZXx8ZSE9PWF8fFwibmV4dFwiPT09bi5kaXJlY3Rpb24pJiYoIW4uYXRFbmR8fG4uY3VycmVudFNsaWRlIT09YXx8MCE9PWV8fFwibmV4dFwiIT09bi5kaXJlY3Rpb24pKSkpfSxuLmdldFRhcmdldD1mdW5jdGlvbihlKXtyZXR1cm4gbi5kaXJlY3Rpb249ZSxcIm5leHRcIj09PWU/bi5jdXJyZW50U2xpZGU9PT1uLmxhc3Q/MDpuLmN1cnJlbnRTbGlkZSsxOjA9PT1uLmN1cnJlbnRTbGlkZT9uLmxhc3Q6bi5jdXJyZW50U2xpZGUtMX0sbi5zZXRQcm9wcz1mdW5jdGlvbihlLHQsYSl7dmFyIGk9ZnVuY3Rpb24oKXt2YXIgYT1lfHwobi5pdGVtVytuLnZhcnMuaXRlbU1hcmdpbikqbi5tb3ZlKm4uYW5pbWF0aW5nVG87cmV0dXJuLTEqZnVuY3Rpb24oKXtpZih2KXJldHVyblwic2V0VG91Y2hcIj09PXQ/ZTp1JiZuLmFuaW1hdGluZ1RvPT09bi5sYXN0PzA6dT9uLmxpbWl0LShuLml0ZW1XK24udmFycy5pdGVtTWFyZ2luKSpuLm1vdmUqbi5hbmltYXRpbmdUbzpuLmFuaW1hdGluZ1RvPT09bi5sYXN0P24ubGltaXQ6YTtzd2l0Y2godCl7Y2FzZVwic2V0VG90YWxcIjpyZXR1cm4gdT8obi5jb3VudC0xLW4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQpKmU6KG4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQpKmU7Y2FzZVwic2V0VG91Y2hcIjpyZXR1cm4gZTtjYXNlXCJqdW1wRW5kXCI6cmV0dXJuIHU/ZTpuLmNvdW50KmU7Y2FzZVwianVtcFN0YXJ0XCI6cmV0dXJuIHU/bi5jb3VudCplOmU7ZGVmYXVsdDpyZXR1cm4gZX19KCkrXCJweFwifSgpO24udHJhbnNpdGlvbnMmJihpPWQ/XCJ0cmFuc2xhdGUzZCgwLFwiK2krXCIsMClcIjpcInRyYW5zbGF0ZTNkKFwiK2krXCIsMCwwKVwiLGE9dm9pZCAwIT09YT9hLzFlMytcInNcIjpcIjBzXCIsbi5jb250YWluZXIuY3NzKFwiLVwiK24ucGZ4K1wiLXRyYW5zaXRpb24tZHVyYXRpb25cIixhKSxuLmNvbnRhaW5lci5jc3MoXCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCIsYSkpLG4uYXJnc1tuLnByb3BdPWksKG4udHJhbnNpdGlvbnN8fHZvaWQgMD09PWEpJiZuLmNvbnRhaW5lci5jc3Mobi5hcmdzKSxuLmNvbnRhaW5lci5jc3MoXCJ0cmFuc2Zvcm1cIixpKX0sbi5zZXR1cD1mdW5jdGlvbihlKXtpZihwKW4uc2xpZGVzLmNzcyh7d2lkdGg6XCIxMDAlXCIsZmxvYXQ6XCJsZWZ0XCIsbWFyZ2luUmlnaHQ6XCItMTAwJVwiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLFwiaW5pdFwiPT09ZSYmKHM/bi5zbGlkZXMuY3NzKHtvcGFjaXR5OjAsZGlzcGxheTpcImJsb2NrXCIsd2Via2l0VHJhbnNpdGlvbjpcIm9wYWNpdHkgXCIrbi52YXJzLmFuaW1hdGlvblNwZWVkLzFlMytcInMgZWFzZVwiLHpJbmRleDoxfSkuZXEobi5jdXJyZW50U2xpZGUpLmNzcyh7b3BhY2l0eToxLHpJbmRleDoyfSk6MD09bi52YXJzLmZhZGVGaXJzdFNsaWRlP24uc2xpZGVzLmNzcyh7b3BhY2l0eTowLGRpc3BsYXk6XCJibG9ja1wiLHpJbmRleDoxfSkuZXEobi5jdXJyZW50U2xpZGUpLmNzcyh7ekluZGV4OjJ9KS5jc3Moe29wYWNpdHk6MX0pOm4uc2xpZGVzLmNzcyh7b3BhY2l0eTowLGRpc3BsYXk6XCJibG9ja1wiLHpJbmRleDoxfSkuZXEobi5jdXJyZW50U2xpZGUpLmNzcyh7ekluZGV4OjJ9KS5hbmltYXRlKHtvcGFjaXR5OjF9LG4udmFycy5hbmltYXRpb25TcGVlZCxuLnZhcnMuZWFzaW5nKSksbi52YXJzLnNtb290aEhlaWdodCYmZi5zbW9vdGhIZWlnaHQoKTtlbHNle3ZhciB0LGE7XCJpbml0XCI9PT1lJiYobi52aWV3cG9ydD0kKCc8ZGl2IGNsYXNzPVwiJytpKyd2aWV3cG9ydFwiPjwvZGl2PicpLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KS5hcHBlbmRUbyhuKS5hcHBlbmQobi5jb250YWluZXIpLG4uY2xvbmVDb3VudD0wLG4uY2xvbmVPZmZzZXQ9MCx1JiYoYT0kLm1ha2VBcnJheShuLnNsaWRlcykucmV2ZXJzZSgpLG4uc2xpZGVzPSQoYSksbi5jb250YWluZXIuZW1wdHkoKS5hcHBlbmQobi5zbGlkZXMpKSksbi52YXJzLmFuaW1hdGlvbkxvb3AmJiF2JiYobi5jbG9uZUNvdW50PTIsbi5jbG9uZU9mZnNldD0xLFwiaW5pdFwiIT09ZSYmbi5jb250YWluZXIuZmluZChcIi5jbG9uZVwiKS5yZW1vdmUoKSxuLmNvbnRhaW5lci5hcHBlbmQoZi51bmlxdWVJRChuLnNsaWRlcy5maXJzdCgpLmNsb25lKCkuYWRkQ2xhc3MoXCJjbG9uZVwiKSkuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpKS5wcmVwZW5kKGYudW5pcXVlSUQobi5zbGlkZXMubGFzdCgpLmNsb25lKCkuYWRkQ2xhc3MoXCJjbG9uZVwiKSkuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpKSksbi5uZXdTbGlkZXM9JChuLnZhcnMuc2VsZWN0b3IsbiksdD11P24uY291bnQtMS1uLmN1cnJlbnRTbGlkZStuLmNsb25lT2Zmc2V0Om4uY3VycmVudFNsaWRlK24uY2xvbmVPZmZzZXQsZCYmIXY/KG4uY29udGFpbmVyLmhlaWdodCgyMDAqKG4uY291bnQrbi5jbG9uZUNvdW50KStcIiVcIikuY3NzKFwicG9zaXRpb25cIixcImFic29sdXRlXCIpLndpZHRoKFwiMTAwJVwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bi5uZXdTbGlkZXMuY3NzKHtkaXNwbGF5OlwiYmxvY2tcIn0pLG4uZG9NYXRoKCksbi52aWV3cG9ydC5oZWlnaHQobi5oKSxuLnNldFByb3BzKHQqbi5oLFwiaW5pdFwiKX0sXCJpbml0XCI9PT1lPzEwMDowKSk6KG4uY29udGFpbmVyLndpZHRoKDIwMCoobi5jb3VudCtuLmNsb25lQ291bnQpK1wiJVwiKSxuLnNldFByb3BzKHQqbi5jb21wdXRlZFcsXCJpbml0XCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLmRvTWF0aCgpLG4ubmV3U2xpZGVzLmNzcyh7d2lkdGg6bi5jb21wdXRlZFcsbWFyZ2luUmlnaHQ6bi5jb21wdXRlZE0sZmxvYXQ6XCJsZWZ0XCIsZGlzcGxheTpcImJsb2NrXCJ9KSxuLnZhcnMuc21vb3RoSGVpZ2h0JiZmLnNtb290aEhlaWdodCgpfSxcImluaXRcIj09PWU/MTAwOjApKX12fHxuLnNsaWRlcy5yZW1vdmVDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLmVxKG4uY3VycmVudFNsaWRlKS5hZGRDbGFzcyhpK1wiYWN0aXZlLXNsaWRlXCIpLG4udmFycy5pbml0KG4pfSxuLmRvTWF0aD1mdW5jdGlvbigpe3ZhciBlPW4uc2xpZGVzLmZpcnN0KCksdD1uLnZhcnMuaXRlbU1hcmdpbixhPW4udmFycy5taW5JdGVtcyxpPW4udmFycy5tYXhJdGVtcztuLnc9dm9pZCAwPT09bi52aWV3cG9ydD9uLndpZHRoKCk6bi52aWV3cG9ydC53aWR0aCgpLG4uaD1lLmhlaWdodCgpLG4uYm94UGFkZGluZz1lLm91dGVyV2lkdGgoKS1lLndpZHRoKCksdj8obi5pdGVtVD1uLnZhcnMuaXRlbVdpZHRoK3Qsbi5pdGVtTT10LG4ubWluVz1hP2Eqbi5pdGVtVDpuLncsbi5tYXhXPWk/aSpuLml0ZW1ULXQ6bi53LG4uaXRlbVc9bi5taW5XPm4udz8obi53LXQqKGEtMSkpL2E6bi5tYXhXPG4udz8obi53LXQqKGktMSkpL2k6bi52YXJzLml0ZW1XaWR0aD5uLnc/bi53Om4udmFycy5pdGVtV2lkdGgsbi52aXNpYmxlPU1hdGguZmxvb3Iobi53L24uaXRlbVcpLG4ubW92ZT1uLnZhcnMubW92ZT4wJiZuLnZhcnMubW92ZTxuLnZpc2libGU/bi52YXJzLm1vdmU6bi52aXNpYmxlLG4ucGFnaW5nQ291bnQ9TWF0aC5jZWlsKChuLmNvdW50LW4udmlzaWJsZSkvbi5tb3ZlKzEpLG4ubGFzdD1uLnBhZ2luZ0NvdW50LTEsbi5saW1pdD0xPT09bi5wYWdpbmdDb3VudD8wOm4udmFycy5pdGVtV2lkdGg+bi53P24uaXRlbVcqKG4uY291bnQtMSkrdCoobi5jb3VudC0xKToobi5pdGVtVyt0KSpuLmNvdW50LW4udy10KToobi5pdGVtVz1uLncsbi5pdGVtTT10LG4ucGFnaW5nQ291bnQ9bi5jb3VudCxuLmxhc3Q9bi5jb3VudC0xKSxuLmNvbXB1dGVkVz1uLml0ZW1XLW4uYm94UGFkZGluZyxuLmNvbXB1dGVkTT1uLml0ZW1NfSxuLnVwZGF0ZT1mdW5jdGlvbihlLHQpe24uZG9NYXRoKCksdnx8KGU8bi5jdXJyZW50U2xpZGU/bi5jdXJyZW50U2xpZGUrPTE6ZTw9bi5jdXJyZW50U2xpZGUmJjAhPT1lJiYobi5jdXJyZW50U2xpZGUtPTEpLG4uYW5pbWF0aW5nVG89bi5jdXJyZW50U2xpZGUpLG4udmFycy5jb250cm9sTmF2JiYhbi5tYW51YWxDb250cm9scyYmKFwiYWRkXCI9PT10JiYhdnx8bi5wYWdpbmdDb3VudD5uLmNvbnRyb2xOYXYubGVuZ3RoP2YuY29udHJvbE5hdi51cGRhdGUoXCJhZGRcIik6KFwicmVtb3ZlXCI9PT10JiYhdnx8bi5wYWdpbmdDb3VudDxuLmNvbnRyb2xOYXYubGVuZ3RoKSYmKHYmJm4uY3VycmVudFNsaWRlPm4ubGFzdCYmKG4uY3VycmVudFNsaWRlLT0xLG4uYW5pbWF0aW5nVG8tPTEpLGYuY29udHJvbE5hdi51cGRhdGUoXCJyZW1vdmVcIixuLmxhc3QpKSksbi52YXJzLmRpcmVjdGlvbk5hdiYmZi5kaXJlY3Rpb25OYXYudXBkYXRlKCl9LG4uYWRkU2xpZGU9ZnVuY3Rpb24oZSx0KXt2YXIgYT0kKGUpO24uY291bnQrPTEsbi5sYXN0PW4uY291bnQtMSxkJiZ1P3ZvaWQgMCE9PXQ/bi5zbGlkZXMuZXEobi5jb3VudC10KS5hZnRlcihhKTpuLmNvbnRhaW5lci5wcmVwZW5kKGEpOnZvaWQgMCE9PXQ/bi5zbGlkZXMuZXEodCkuYmVmb3JlKGEpOm4uY29udGFpbmVyLmFwcGVuZChhKSxuLnVwZGF0ZSh0LFwiYWRkXCIpLG4uc2xpZGVzPSQobi52YXJzLnNlbGVjdG9yK1wiOm5vdCguY2xvbmUpXCIsbiksbi5zZXR1cCgpLG4udmFycy5hZGRlZChuKX0sbi5yZW1vdmVTbGlkZT1mdW5jdGlvbihlKXt2YXIgdD1pc05hTihlKT9uLnNsaWRlcy5pbmRleCgkKGUpKTplO24uY291bnQtPTEsbi5sYXN0PW4uY291bnQtMSxpc05hTihlKT8kKGUsbi5zbGlkZXMpLnJlbW92ZSgpOmQmJnU/bi5zbGlkZXMuZXEobi5sYXN0KS5yZW1vdmUoKTpuLnNsaWRlcy5lcShlKS5yZW1vdmUoKSxuLmRvTWF0aCgpLG4udXBkYXRlKHQsXCJyZW1vdmVcIiksbi5zbGlkZXM9JChuLnZhcnMuc2VsZWN0b3IrXCI6bm90KC5jbG9uZSlcIixuKSxuLnNldHVwKCksbi52YXJzLnJlbW92ZWQobil9LGYuaW5pdCgpfSwkKHdpbmRvdykuYmx1cihmdW5jdGlvbih0KXtlPSExfSkuZm9jdXMoZnVuY3Rpb24odCl7ZT0hMH0pLCQuZmxleHNsaWRlci5kZWZhdWx0cz17bmFtZXNwYWNlOlwiZmxleC1cIixzZWxlY3RvcjpcIi5zbGlkZXMgPiBsaVwiLGFuaW1hdGlvbjpcImZhZGVcIixlYXNpbmc6XCJzd2luZ1wiLGRpcmVjdGlvbjpcImhvcml6b250YWxcIixyZXZlcnNlOiExLGFuaW1hdGlvbkxvb3A6ITAsc21vb3RoSGVpZ2h0OiExLHN0YXJ0QXQ6MCxzbGlkZXNob3c6ITAsc2xpZGVzaG93U3BlZWQ6N2UzLGFuaW1hdGlvblNwZWVkOjYwMCxpbml0RGVsYXk6MCxyYW5kb21pemU6ITEsZmFkZUZpcnN0U2xpZGU6ITAsdGh1bWJDYXB0aW9uczohMSxwYXVzZU9uQWN0aW9uOiEwLHBhdXNlT25Ib3ZlcjohMSxwYXVzZUludmlzaWJsZTohMCx1c2VDU1M6ITAsdG91Y2g6ITAsdmlkZW86ITEsY29udHJvbE5hdjohMCxkaXJlY3Rpb25OYXY6ITAscHJldlRleHQ6XCJQcmV2aW91c1wiLG5leHRUZXh0OlwiTmV4dFwiLGtleWJvYXJkOiEwLG11bHRpcGxlS2V5Ym9hcmQ6ITEsbW91c2V3aGVlbDohMSxwYXVzZVBsYXk6ITEscGF1c2VUZXh0OlwiUGF1c2VcIixwbGF5VGV4dDpcIlBsYXlcIixjb250cm9sc0NvbnRhaW5lcjpcIlwiLG1hbnVhbENvbnRyb2xzOlwiXCIsY3VzdG9tRGlyZWN0aW9uTmF2OlwiXCIsc3luYzpcIlwiLGFzTmF2Rm9yOlwiXCIsaXRlbVdpZHRoOjAsaXRlbU1hcmdpbjowLG1pbkl0ZW1zOjEsbWF4SXRlbXM6MCxtb3ZlOjAsYWxsb3dPbmVTbGlkZTohMCxzdGFydDpmdW5jdGlvbigpe30sYmVmb3JlOmZ1bmN0aW9uKCl7fSxhZnRlcjpmdW5jdGlvbigpe30sZW5kOmZ1bmN0aW9uKCl7fSxhZGRlZDpmdW5jdGlvbigpe30scmVtb3ZlZDpmdW5jdGlvbigpe30saW5pdDpmdW5jdGlvbigpe319LCQuZm4uZmxleHNsaWRlcj1mdW5jdGlvbihlKXtpZih2b2lkIDA9PT1lJiYoZT17fSksXCJvYmplY3RcIj09dHlwZW9mIGUpcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciB0PSQodGhpcyksYT1lLnNlbGVjdG9yP2Uuc2VsZWN0b3I6XCIuc2xpZGVzID4gbGlcIixuPXQuZmluZChhKTsxPT09bi5sZW5ndGgmJiExPT09ZS5hbGxvd09uZVNsaWRlfHwwPT09bi5sZW5ndGg/KG4uZmFkZUluKDQwMCksZS5zdGFydCYmZS5zdGFydCh0KSk6dm9pZCAwPT09dC5kYXRhKFwiZmxleHNsaWRlclwiKSYmbmV3ICQuZmxleHNsaWRlcih0aGlzLGUpfSk7dmFyIHQ9JCh0aGlzKS5kYXRhKFwiZmxleHNsaWRlclwiKTtzd2l0Y2goZSl7Y2FzZVwicGxheVwiOnQucGxheSgpO2JyZWFrO2Nhc2VcInBhdXNlXCI6dC5wYXVzZSgpO2JyZWFrO2Nhc2VcInN0b3BcIjp0LnN0b3AoKTticmVhaztjYXNlXCJuZXh0XCI6dC5mbGV4QW5pbWF0ZSh0LmdldFRhcmdldChcIm5leHRcIiksITApO2JyZWFrO2Nhc2VcInByZXZcIjpjYXNlXCJwcmV2aW91c1wiOnQuZmxleEFuaW1hdGUodC5nZXRUYXJnZXQoXCJwcmV2XCIpLCEwKTticmVhaztkZWZhdWx0OlwibnVtYmVyXCI9PXR5cGVvZiBlJiZ0LmZsZXhBbmltYXRlKGUsITApfX19KGpRdWVyeSk7IiwiIWZ1bmN0aW9uKHQpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLHQpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPXQocmVxdWlyZShcImpxdWVyeVwiKSk6dChqUXVlcnkpfShmdW5jdGlvbih0KXtmdW5jdGlvbiBvKG8sZSl7dGhpcy5lbGVtZW50PW8sdGhpcy4kZWxlbWVudD10KHRoaXMuZWxlbWVudCksdGhpcy5kb2M9dChkb2N1bWVudCksdGhpcy53aW49dCh3aW5kb3cpLHRoaXMuc2V0dGluZ3M9dC5leHRlbmQoe30sbixlKSxcIm9iamVjdFwiPT10eXBlb2YgdGhpcy4kZWxlbWVudC5kYXRhKFwidGlwc29cIikmJnQuZXh0ZW5kKHRoaXMuc2V0dGluZ3MsdGhpcy4kZWxlbWVudC5kYXRhKFwidGlwc29cIikpO2Zvcih2YXIgcj1PYmplY3Qua2V5cyh0aGlzLiRlbGVtZW50LmRhdGEoKSkscz17fSxkPTA7ZDxyLmxlbmd0aDtkKyspe3ZhciBsPXJbZF0ucmVwbGFjZShpLFwiXCIpO2lmKFwiXCIhPT1sKXtsPWwuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkrbC5zbGljZSgxKSxzW2xdPXRoaXMuJGVsZW1lbnQuZGF0YShyW2RdKTtmb3IodmFyIHAgaW4gdGhpcy5zZXR0aW5ncylwLnRvTG93ZXJDYXNlKCk9PWwmJih0aGlzLnNldHRpbmdzW3BdPXNbbF0pfX10aGlzLl9kZWZhdWx0cz1uLHRoaXMuX25hbWU9aSx0aGlzLl90aXRsZT10aGlzLiRlbGVtZW50LmF0dHIoXCJ0aXRsZVwiKSx0aGlzLm1vZGU9XCJoaWRlXCIsdGhpcy5pZUZhZGU9IWEsdGhpcy5zZXR0aW5ncy5wcmVmZXJlZFBvc2l0aW9uPXRoaXMuc2V0dGluZ3MucG9zaXRpb24sdGhpcy5pbml0KCl9ZnVuY3Rpb24gZShvKXt2YXIgZT1vLmNsb25lKCk7ZS5jc3MoXCJ2aXNpYmlsaXR5XCIsXCJoaWRkZW5cIiksdChcImJvZHlcIikuYXBwZW5kKGUpO3ZhciByPWUub3V0ZXJIZWlnaHQoKSxzPWUub3V0ZXJXaWR0aCgpO3JldHVybiBlLnJlbW92ZSgpLHt3aWR0aDpzLGhlaWdodDpyfX1mdW5jdGlvbiByKHQpe3QucmVtb3ZlQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyIGJvdHRvbV9yaWdodF9jb3JuZXIgdG9wX2xlZnRfY29ybmVyIGJvdHRvbV9sZWZ0X2Nvcm5lclwiKSx0LmZpbmQoXCIudGlwc29fdGl0bGVcIikucmVtb3ZlQ2xhc3MoXCJ0b3BfcmlnaHRfY29ybmVyIGJvdHRvbV9yaWdodF9jb3JuZXIgdG9wX2xlZnRfY29ybmVyIGJvdHRvbV9sZWZ0X2Nvcm5lclwiKX1mdW5jdGlvbiBzKG8pe3ZhciBpLG4sYSxkPW8udG9vbHRpcCgpLGw9by4kZWxlbWVudCxwPW8sZj10KHdpbmRvdyksZz0xMCxjPXAuc2V0dGluZ3MuYmFja2dyb3VuZCxoPXAudGl0bGVDb250ZW50KCk7c3dpdGNoKHZvaWQgMCE9PWgmJlwiXCIhPT1oJiYoYz1wLnNldHRpbmdzLnRpdGxlQmFja2dyb3VuZCksbC5wYXJlbnQoKS5vdXRlcldpZHRoKCk+Zi5vdXRlcldpZHRoKCkmJihmPWwucGFyZW50KCkpLHAuc2V0dGluZ3MucG9zaXRpb24pe2Nhc2VcInRvcC1yaWdodFwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbV9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwiYm90dG9tX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6Y30pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AtcmlnaHQgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudCBcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kfSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTticmVhaztjYXNlXCJ0b3AtbGVmdFwiOm49bC5vZmZzZXQoKS5sZWZ0LWUoZCkud2lkdGgsaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwiYm90dG9tX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcImJvdHRvbV9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOmN9KSxkLnJlbW92ZUNsYXNzKFwidG9wLXJpZ2h0IHRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnQgXCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcInRvcF9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZH0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk7YnJlYWs7Y2FzZVwiYm90dG9tLXJpZ2h0XCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCksaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpK2UoZCkuaGVpZ2h0PmYuc2Nyb2xsVG9wKCkrZi5vdXRlckhlaWdodCgpPyhpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJ0b3BfbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZH0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AtcmlnaHQgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwiYm90dG9tX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJib3R0b21fcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpjfSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTticmVhaztjYXNlXCJib3R0b20tbGVmdFwiOm49bC5vZmZzZXQoKS5sZWZ0LWUoZCkud2lkdGgsaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpK2UoZCkuaGVpZ2h0PmYuc2Nyb2xsVG9wKCkrZi5vdXRlckhlaWdodCgpPyhpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwidG9wX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcInRvcF9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZH0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AtcmlnaHQgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLmFkZENsYXNzKFwiYm90dG9tX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcImJvdHRvbV9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOmN9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpO2JyZWFrO2Nhc2VcInRvcFwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLzItZShkKS53aWR0aC8yLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkvMi1lKGQpLndpZHRoLzIsaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpK2UoZCkuaGVpZ2h0PmYuc2Nyb2xsVG9wKCkrZi5vdXRlckhlaWdodCgpPyhpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhwLnNldHRpbmdzLnBvc2l0aW9uKSk7YnJlYWs7Y2FzZVwibGVmdFwiOm49bC5vZmZzZXQoKS5sZWZ0LWUoZCkud2lkdGgtZyxpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKS8yLWUoZCkuaGVpZ2h0LzIsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luVG9wOi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luTGVmdDpcIlwifSksbjxmLnNjcm9sbExlZnQoKT8obj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJyaWdodFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhwLnNldHRpbmdzLnBvc2l0aW9uKSk7YnJlYWs7Y2FzZVwicmlnaHRcIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKStnLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpLzItZShkKS5oZWlnaHQvMixkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5Ub3A6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5MZWZ0OlwiXCJ9KSxuK2crcC5zZXR0aW5ncy53aWR0aD5mLnNjcm9sbExlZnQoKStmLm91dGVyV2lkdGgoKT8obj1sLm9mZnNldCgpLmxlZnQtZShkKS53aWR0aC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImxlZnRcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1yaWdodC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MocC5zZXR0aW5ncy5wb3NpdGlvbikpfWlmKFwidG9wLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uJiZkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcIm1hcmdpbi1sZWZ0XCI6LXAuc2V0dGluZ3Mud2lkdGgvMn0pLFwidG9wLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pe3ZhciBtPWQuZmluZChcIi50aXBzb19hcnJvd1wiKS5lcSgwKTttLmNzcyh7XCJtYXJnaW4tbGVmdFwiOnAuc2V0dGluZ3Mud2lkdGgvMi0yKnAuc2V0dGluZ3MuYXJyb3dXaWR0aH0pfWlmKFwiYm90dG9tLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKXt2YXIgbT1kLmZpbmQoXCIudGlwc29fYXJyb3dcIikuZXEoMCk7bS5jc3Moe1wibWFyZ2luLWxlZnRcIjotcC5zZXR0aW5ncy53aWR0aC8yLFwibWFyZ2luLXRvcFwiOlwiXCJ9KX1pZihcImJvdHRvbS1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKXt2YXIgbT1kLmZpbmQoXCIudGlwc29fYXJyb3dcIikuZXEoMCk7bS5jc3Moe1wibWFyZ2luLWxlZnRcIjpwLnNldHRpbmdzLndpZHRoLzItMipwLnNldHRpbmdzLmFycm93V2lkdGgsXCJtYXJnaW4tdG9wXCI6XCJcIn0pfW48Zi5zY3JvbGxMZWZ0KCkmJihcImJvdHRvbVwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3BcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYoZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDpuLXAuc2V0dGluZ3MuYXJyb3dXaWR0aH0pLG49MCksbitwLnNldHRpbmdzLndpZHRoPmYub3V0ZXJXaWR0aCgpJiYoXCJib3R0b21cIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wXCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKGE9Zi5vdXRlcldpZHRoKCktKG4rcC5zZXR0aW5ncy53aWR0aCksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotYS1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxuKz1hKSxuPGYuc2Nyb2xsTGVmdCgpJiYoXCJsZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcC1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3AtbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJib3R0b20tcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwiYm90dG9tLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYobj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkvMi1lKGQpLndpZHRoLzIsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGk8Zi5zY3JvbGxUb3AoKT8oaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkrZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1ib3R0b20tY29sb3JcIjpjLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLHIoZCksZC5hZGRDbGFzcyhcInRvcFwiKSksbitwLnNldHRpbmdzLndpZHRoPmYub3V0ZXJXaWR0aCgpJiYoYT1mLm91dGVyV2lkdGgoKS0obitwLnNldHRpbmdzLndpZHRoKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1hLXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLG4rPWEpLG48Zi5zY3JvbGxMZWZ0KCkmJihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Om4tcC5zZXR0aW5ncy5hcnJvd1dpZHRofSksbj0wKSksbitwLnNldHRpbmdzLndpZHRoPmYub3V0ZXJXaWR0aCgpJiYoXCJsZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcC1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3AtbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJib3R0b20tcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwiYm90dG9tLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKG49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLzItZShkKS53aWR0aC8yLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSkscihkKSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpLG4rcC5zZXR0aW5ncy53aWR0aD5mLm91dGVyV2lkdGgoKSYmKGE9Zi5vdXRlcldpZHRoKCktKG4rcC5zZXR0aW5ncy53aWR0aCksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotYS1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxuKz1hKSxuPGYuc2Nyb2xsTGVmdCgpJiYoZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDpuLXAuc2V0dGluZ3MuYXJyb3dXaWR0aH0pLG49MCkpLGQuY3NzKHtsZWZ0Om4rcC5zZXR0aW5ncy5vZmZzZXRYLHRvcDppK3Auc2V0dGluZ3Mub2Zmc2V0WX0pLGk8Zi5zY3JvbGxUb3AoKSYmKFwicmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwibGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihsLnRpcHNvKFwidXBkYXRlXCIsXCJwb3NpdGlvblwiLFwiYm90dG9tXCIpLHMocCkpLGkrZShkKS5oZWlnaHQ+Zi5zY3JvbGxUb3AoKStmLm91dGVySGVpZ2h0KCkmJihcInJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYobC50aXBzbyhcInVwZGF0ZVwiLFwicG9zaXRpb25cIixcInRvcFwiKSxzKHApKX12YXIgaT1cInRpcHNvXCIsbj17c3BlZWQ6NDAwLGJhY2tncm91bmQ6XCIjNTViNTU1XCIsdGl0bGVCYWNrZ3JvdW5kOlwiIzMzMzMzM1wiLGNvbG9yOlwiI2ZmZmZmZlwiLHRpdGxlQ29sb3I6XCIjZmZmZmZmXCIsdGl0bGVDb250ZW50OlwiXCIsc2hvd0Fycm93OiEwLHBvc2l0aW9uOlwidG9wXCIsd2lkdGg6MjAwLG1heFdpZHRoOlwiXCIsZGVsYXk6MjAwLGhpZGVEZWxheTowLGFuaW1hdGlvbkluOlwiXCIsYW5pbWF0aW9uT3V0OlwiXCIsb2Zmc2V0WDowLG9mZnNldFk6MCxhcnJvd1dpZHRoOjgsdG9vbHRpcEhvdmVyOiExLGNvbnRlbnQ6bnVsbCxhamF4Q29udGVudFVybDpudWxsLGFqYXhDb250ZW50QnVmZmVyOjAsY29udGVudEVsZW1lbnRJZDpudWxsLHVzZVRpdGxlOiExLHRlbXBsYXRlRW5naW5lRnVuYzpudWxsLG9uQmVmb3JlU2hvdzpudWxsLG9uU2hvdzpudWxsLG9uSGlkZTpudWxsfTt0LmV4dGVuZChvLnByb3RvdHlwZSx7aW5pdDpmdW5jdGlvbigpe3t2YXIgdD10aGlzLG89dGhpcy4kZWxlbWVudDt0aGlzLmRvY31pZihvLmFkZENsYXNzKFwidGlwc29fc3R5bGVcIikucmVtb3ZlQXR0cihcInRpdGxlXCIpLHQuc2V0dGluZ3MudG9vbHRpcEhvdmVyKXt2YXIgZT1udWxsLHI9bnVsbDtvLm9uKFwibW91c2VvdmVyLlwiK2ksZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoZSksY2xlYXJUaW1lb3V0KHIpLHI9c2V0VGltZW91dChmdW5jdGlvbigpe3Quc2hvdygpfSwxNTApfSksby5vbihcIm1vdXNlb3V0LlwiK2ksZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoZSksY2xlYXJUaW1lb3V0KHIpLGU9c2V0VGltZW91dChmdW5jdGlvbigpe3QuaGlkZSgpfSwyMDApLHQudG9vbHRpcCgpLm9uKFwibW91c2VvdmVyLlwiK2ksZnVuY3Rpb24oKXt0Lm1vZGU9XCJ0b29sdGlwSG92ZXJcIn0pLm9uKFwibW91c2VvdXQuXCIraSxmdW5jdGlvbigpe3QubW9kZT1cInNob3dcIixjbGVhclRpbWVvdXQoZSksZT1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC5oaWRlKCl9LDIwMCl9KX0pfWVsc2Ugby5vbihcIm1vdXNlb3Zlci5cIitpLGZ1bmN0aW9uKCl7dC5zaG93KCl9KSxvLm9uKFwibW91c2VvdXQuXCIraSxmdW5jdGlvbigpe3QuaGlkZSgpfSk7dC5zZXR0aW5ncy5hamF4Q29udGVudFVybCYmKHQuYWpheENvbnRlbnQ9bnVsbCl9LHRvb2x0aXA6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy50aXBzb19idWJibGV8fCh0aGlzLnRpcHNvX2J1YmJsZT10KCc8ZGl2IGNsYXNzPVwidGlwc29fYnViYmxlXCI+PGRpdiBjbGFzcz1cInRpcHNvX3RpdGxlXCI+PC9kaXY+PGRpdiBjbGFzcz1cInRpcHNvX2NvbnRlbnRcIj48L2Rpdj48ZGl2IGNsYXNzPVwidGlwc29fYXJyb3dcIj48L2Rpdj48L2Rpdj4nKSksdGhpcy50aXBzb19idWJibGV9LHNob3c6ZnVuY3Rpb24oKXt2YXIgbz10aGlzLnRvb2x0aXAoKSxlPXRoaXMscj10aGlzLndpbjtlLnNldHRpbmdzLnNob3dBcnJvdz09PSExP28uZmluZChcIi50aXBzb19hcnJvd1wiKS5oaWRlKCk6by5maW5kKFwiLnRpcHNvX2Fycm93XCIpLnNob3coKSxcImhpZGVcIj09PWUubW9kZSYmKHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uQmVmb3JlU2hvdykmJmUuc2V0dGluZ3Mub25CZWZvcmVTaG93KGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpLGUuc2V0dGluZ3Muc2l6ZSYmby5hZGRDbGFzcyhlLnNldHRpbmdzLnNpemUpLGUuc2V0dGluZ3Mud2lkdGg/by5jc3Moe2JhY2tncm91bmQ6ZS5zZXR0aW5ncy5iYWNrZ3JvdW5kLGNvbG9yOmUuc2V0dGluZ3MuY29sb3Isd2lkdGg6ZS5zZXR0aW5ncy53aWR0aH0pLmhpZGUoKTplLnNldHRpbmdzLm1heFdpZHRoP28uY3NzKHtiYWNrZ3JvdW5kOmUuc2V0dGluZ3MuYmFja2dyb3VuZCxjb2xvcjplLnNldHRpbmdzLmNvbG9yLG1heFdpZHRoOmUuc2V0dGluZ3MubWF4V2lkdGh9KS5oaWRlKCk6by5jc3Moe2JhY2tncm91bmQ6ZS5zZXR0aW5ncy5iYWNrZ3JvdW5kLGNvbG9yOmUuc2V0dGluZ3MuY29sb3Isd2lkdGg6MjAwfSkuaGlkZSgpLG8uZmluZChcIi50aXBzb190aXRsZVwiKS5jc3Moe2JhY2tncm91bmQ6ZS5zZXR0aW5ncy50aXRsZUJhY2tncm91bmQsY29sb3I6ZS5zZXR0aW5ncy50aXRsZUNvbG9yfSksby5maW5kKFwiLnRpcHNvX2NvbnRlbnRcIikuaHRtbChlLmNvbnRlbnQoKSksby5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmh0bWwoZS50aXRsZUNvbnRlbnQoKSkscyhlKSxyLm9uKFwicmVzaXplLlwiK2ksZnVuY3Rpb24oKXtlLnNldHRpbmdzLnBvc2l0aW9uPWUuc2V0dGluZ3MucHJlZmVyZWRQb3NpdGlvbixzKGUpfSksd2luZG93LmNsZWFyVGltZW91dChlLnRpbWVvdXQpLGUudGltZW91dD1udWxsLGUudGltZW91dD13aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe2UuaWVGYWRlfHxcIlwiPT09ZS5zZXR0aW5ncy5hbmltYXRpb25Jbnx8XCJcIj09PWUuc2V0dGluZ3MuYW5pbWF0aW9uT3V0P28uYXBwZW5kVG8oXCJib2R5XCIpLnN0b3AoITAsITApLmZhZGVJbihlLnNldHRpbmdzLnNwZWVkLGZ1bmN0aW9uKCl7ZS5tb2RlPVwic2hvd1wiLHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uU2hvdykmJmUuc2V0dGluZ3Mub25TaG93KGUuJGVsZW1lbnQsZS5lbGVtZW50LGUpfSk6by5yZW1vdmUoKS5hcHBlbmRUbyhcImJvZHlcIikuc3RvcCghMCwhMCkucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbk91dCkuYWRkQ2xhc3MoXCJub0FuaW1hdGlvblwiKS5yZW1vdmVDbGFzcyhcIm5vQW5pbWF0aW9uXCIpLmFkZENsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25JbikuZmFkZUluKGUuc2V0dGluZ3Muc3BlZWQsZnVuY3Rpb24oKXt0KHRoaXMpLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe3QodGhpcykucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbkluKX0pLGUubW9kZT1cInNob3dcIix0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vblNob3cpJiZlLnNldHRpbmdzLm9uU2hvdyhlLiRlbGVtZW50LGUuZWxlbWVudCxlKSxyLm9mZihcInJlc2l6ZS5cIitpLG51bGwsXCJ0aXBzb1Jlc2l6ZUhhbmRsZXJcIil9KX0sZS5zZXR0aW5ncy5kZWxheSkpfSxoaWRlOmZ1bmN0aW9uKG8pe3ZhciBlPXRoaXMscj10aGlzLndpbixzPXRoaXMudG9vbHRpcCgpLG49ZS5zZXR0aW5ncy5oaWRlRGVsYXk7byYmKG49MCxlLm1vZGU9XCJzaG93XCIpLHdpbmRvdy5jbGVhclRpbWVvdXQoZS50aW1lb3V0KSxlLnRpbWVvdXQ9bnVsbCxlLnRpbWVvdXQ9d2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcInRvb2x0aXBIb3ZlclwiIT09ZS5tb2RlJiYoZS5pZUZhZGV8fFwiXCI9PT1lLnNldHRpbmdzLmFuaW1hdGlvbklufHxcIlwiPT09ZS5zZXR0aW5ncy5hbmltYXRpb25PdXQ/cy5zdG9wKCEwLCEwKS5mYWRlT3V0KGUuc2V0dGluZ3Muc3BlZWQsZnVuY3Rpb24oKXt0KHRoaXMpLnJlbW92ZSgpLHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uSGlkZSkmJlwic2hvd1wiPT09ZS5tb2RlJiZlLnNldHRpbmdzLm9uSGlkZShlLiRlbGVtZW50LGUuZWxlbWVudCxlKSxlLm1vZGU9XCJoaWRlXCIsci5vZmYoXCJyZXNpemUuXCIraSxudWxsLFwidGlwc29SZXNpemVIYW5kbGVyXCIpfSk6cy5zdG9wKCEwLCEwKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uSW4pLmFkZENsYXNzKFwibm9BbmltYXRpb25cIikucmVtb3ZlQ2xhc3MoXCJub0FuaW1hdGlvblwiKS5hZGRDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uT3V0KS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXt0KHRoaXMpLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25PdXQpLnJlbW92ZSgpLHQuaXNGdW5jdGlvbihlLnNldHRpbmdzLm9uSGlkZSkmJlwic2hvd1wiPT09ZS5tb2RlJiZlLnNldHRpbmdzLm9uSGlkZShlLiRlbGVtZW50LGUuZWxlbWVudCxlKSxlLm1vZGU9XCJoaWRlXCIsci5vZmYoXCJyZXNpemUuXCIraSxudWxsLFwidGlwc29SZXNpemVIYW5kbGVyXCIpfSkpfSxuKX0sY2xvc2U6ZnVuY3Rpb24oKXt0aGlzLmhpZGUoITApfSxkZXN0cm95OmZ1bmN0aW9uKCl7e3ZhciB0PXRoaXMuJGVsZW1lbnQsbz10aGlzLndpbjt0aGlzLmRvY310Lm9mZihcIi5cIitpKSxvLm9mZihcInJlc2l6ZS5cIitpLG51bGwsXCJ0aXBzb1Jlc2l6ZUhhbmRsZXJcIiksdC5yZW1vdmVEYXRhKGkpLHQucmVtb3ZlQ2xhc3MoXCJ0aXBzb19zdHlsZVwiKS5hdHRyKFwidGl0bGVcIix0aGlzLl90aXRsZSl9LHRpdGxlQ29udGVudDpmdW5jdGlvbigpe3ZhciB0LG89dGhpcy4kZWxlbWVudCxlPXRoaXM7cmV0dXJuIHQ9ZS5zZXR0aW5ncy50aXRsZUNvbnRlbnQ/ZS5zZXR0aW5ncy50aXRsZUNvbnRlbnQ6by5kYXRhKFwidGlwc28tdGl0bGVcIil9LGNvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgbyxlPXRoaXMuJGVsZW1lbnQscj10aGlzLHM9dGhpcy5fdGl0bGU7cmV0dXJuIHIuc2V0dGluZ3MuYWpheENvbnRlbnRVcmw/ci5fYWpheENvbnRlbnQ/bz1yLl9hamF4Q29udGVudDooci5fYWpheENvbnRlbnQ9bz10LmFqYXgoe3R5cGU6XCJHRVRcIix1cmw6ci5zZXR0aW5ncy5hamF4Q29udGVudFVybCxhc3luYzohMX0pLnJlc3BvbnNlVGV4dCxyLnNldHRpbmdzLmFqYXhDb250ZW50QnVmZmVyPjA/c2V0VGltZW91dChmdW5jdGlvbigpe3IuX2FqYXhDb250ZW50PW51bGx9LHIuc2V0dGluZ3MuYWpheENvbnRlbnRCdWZmZXIpOnIuX2FqYXhDb250ZW50PW51bGwpOnIuc2V0dGluZ3MuY29udGVudEVsZW1lbnRJZD9vPXQoXCIjXCIrci5zZXR0aW5ncy5jb250ZW50RWxlbWVudElkKS50ZXh0KCk6ci5zZXR0aW5ncy5jb250ZW50P289ci5zZXR0aW5ncy5jb250ZW50OnIuc2V0dGluZ3MudXNlVGl0bGU9PT0hMD9vPXM6XCJzdHJpbmdcIj09dHlwZW9mIGUuZGF0YShcInRpcHNvXCIpJiYobz1lLmRhdGEoXCJ0aXBzb1wiKSksbnVsbCE9PXIuc2V0dGluZ3MudGVtcGxhdGVFbmdpbmVGdW5jJiYobz1yLnNldHRpbmdzLnRlbXBsYXRlRW5naW5lRnVuYyhvKSksb30sdXBkYXRlOmZ1bmN0aW9uKHQsbyl7dmFyIGU9dGhpcztyZXR1cm4gbz92b2lkKGUuc2V0dGluZ3NbdF09byk6ZS5zZXR0aW5nc1t0XX19KTt2YXIgYT1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpLnN0eWxlLG89W1wibXNcIixcIk9cIixcIk1velwiLFwiV2Via2l0XCJdO2lmKFwiXCI9PT10LnRyYW5zaXRpb24pcmV0dXJuITA7Zm9yKDtvLmxlbmd0aDspaWYoby5wb3AoKStcIlRyYW5zaXRpb25cImluIHQpcmV0dXJuITA7cmV0dXJuITF9KCk7dFtpXT10LmZuW2ldPWZ1bmN0aW9uKGUpe3ZhciByPWFyZ3VtZW50cztpZih2b2lkIDA9PT1lfHxcIm9iamVjdFwiPT10eXBlb2YgZSlyZXR1cm4gdGhpcyBpbnN0YW5jZW9mIHR8fHQuZXh0ZW5kKG4sZSksdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSl8fHQuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2ksbmV3IG8odGhpcyxlKSl9KTtpZihcInN0cmluZ1wiPT10eXBlb2YgZSYmXCJfXCIhPT1lWzBdJiZcImluaXRcIiE9PWUpe3ZhciBzO3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgbj10LmRhdGEodGhpcyxcInBsdWdpbl9cIitpKTtufHwobj10LmRhdGEodGhpcyxcInBsdWdpbl9cIitpLG5ldyBvKHRoaXMsZSkpKSxuIGluc3RhbmNlb2YgbyYmXCJmdW5jdGlvblwiPT10eXBlb2YgbltlXSYmKHM9bltlXS5hcHBseShuLEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHIsMSkpKSxcImRlc3Ryb3lcIj09PWUmJnQuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2ksbnVsbCl9KSx2b2lkIDAhPT1zP3M6dGhpc319fSk7IiwidmFyIG15VG9vbHRpcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJCgnW2RhdGEtdG9nZ2xlPXRvb2x0aXBdJykudGlwc28oe1xyXG4gICAgICAgIGJhY2tncm91bmQ6ICcjNEE0QTRBJyxcclxuICAgICAgICBzaXplOiAnc21hbGwnLFxyXG4gICAgICAgIGRlbGF5OiAxMDAsXHJcbiAgICAgICAgc3BlZWQ6IDEwMCxcclxuICAgICAgICBvbkJlZm9yZVNob3c6IGZ1bmN0aW9uIChlbGUsIHRpcHNvKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudCA9IGVsZS5kYXRhKCdvcmlnaW5hbC10aXRsZScpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59KCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgdmFyICRub3R5ZmlfYnRuPSQoJy5oZWFkZXItbG9nb19ub3R5Jyk7XHJcbiAgaWYoJG5vdHlmaV9idG4ubGVuZ3RoPT0xKXJldHVybjtcclxuXHJcbiAgJC5nZXQoJy9hY2NvdW50L25vdGlmaWNhdGlvbicsZnVuY3Rpb24oZGF0YSl7XHJcbiAgICBpZighZGF0YS5ub3RpZmljYXRpb25zIHx8IGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGg9PTApIHJldHVybjtcclxuXHJcbiAgICB2YXIgb3V0PSc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWJveD48dWwgY2xhc3M9XCJoZWFkZXItbm90eS1saXN0XCI+JztcclxuICAgICRub3R5ZmlfYnRuLmZpbmQoJ2EnKS5yZW1vdmVBdHRyKCdocmVmJyk7XHJcbiAgICB2YXIgaGFzX25ldz1mYWxzZTtcclxuICAgIGZvciAodmFyIGk9MDtpPGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGg7aSsrKXtcclxuICAgICAgZWw9ZGF0YS5ub3RpZmljYXRpb25zW2ldO1xyXG4gICAgICB2YXIgaXNfbmV3PShlbC5pc192aWV3ZWQ9PTAgJiYgZWwudHlwZV9pZD09MilcclxuICAgICAgb3V0Kz0nPGxpIGNsYXNzPVwiaGVhZGVyLW5vdHktaXRlbScrKGlzX25ldz8nIGhlYWRlci1ub3R5LWl0ZW1fbmV3JzonJykrJ1wiPic7XHJcbiAgICAgIG91dCs9JzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktZGF0YT4nK2VsLmRhdGErJzwvZGl2Pic7XHJcbiAgICAgIG91dCs9JzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktdGV4dD4nK2VsLnRleHQrJzwvZGl2Pic7XHJcbiAgICAgIG91dCs9JzwvbGk+JztcclxuICAgICAgaGFzX25ldz1oYXNfbmV3fHxpc19uZXc7XHJcbiAgICB9XHJcblxyXG4gICAgb3V0Kz0nPC91bD4nO1xyXG4gICAgb3V0Kz0nPGEgY2xhc3M9XCJidG5cIiBocmVmPVwiL2FjY291bnQvbm90aWZpY2F0aW9uXCI+JytkYXRhLmJ0bisnPC9hPic7XHJcbiAgICBvdXQrPSc8L2Rpdj4nO1xyXG4gICAgJCgnLmhlYWRlcicpLmFwcGVuZChvdXQpO1xyXG5cclxuICAgIGlmKGhhc19uZXcpe1xyXG4gICAgICAkbm90eWZpX2J0bi5hZGRDbGFzcygndG9vbHRpcCcpLmFkZENsYXNzKCdoYXMtbm90eScpO1xyXG4gICAgfVxyXG5cclxuICAgICRub3R5ZmlfYnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgaWYoJCgnLmhlYWRlci1ub3R5LWJveCcpLmhhc0NsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpKXtcclxuICAgICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XHJcbiAgICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5hZGRDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcclxuXHJcbiAgICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcygnaGFzLW5vdHknKSl7XHJcbiAgICAgICAgICAkLnBvc3QoJy9hY2NvdW50L25vdGlmaWNhdGlvbicsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgJCgnLmhlYWRlci1sb2dvX25vdHknKS5yZW1vdmVDbGFzcygndG9vbHRpcCcpLnJlbW92ZUNsYXNzKCdoYXMtbm90eScpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5yZW1vdmVDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcclxuICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcuaGVhZGVyLW5vdHktbGlzdCcpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSlcclxuICB9LCdqc29uJyk7XHJcblxyXG59KSgpOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBtZWdhc2xpZGVyID0gKGZ1bmN0aW9uKCkge1xyXG4gIHZhciBzbGlkZXJfZGF0YT1mYWxzZTtcclxuICB2YXIgY29udGFpbmVyX2lkPVwic2VjdGlvbiNtZWdhX3NsaWRlclwiO1xyXG4gIHZhciBwYXJhbGxheF9ncm91cD1mYWxzZTtcclxuICB2YXIgcGFyYWxsYXhfdGltZXI9ZmFsc2U7XHJcbiAgdmFyIHBhcmFsbGF4X2NvdW50ZXI9MDtcclxuICB2YXIgcGFyYWxsYXhfZD0xO1xyXG4gIHZhciBtb2JpbGVfbW9kZT0tMTtcclxuICB2YXIgbWF4X3RpbWVfbG9hZF9waWM9MzAwO1xyXG4gIHZhciBtb2JpbGVfc2l6ZT03MDA7XHJcbiAgdmFyIHJlbmRlcl9zbGlkZV9ub209MDtcclxuICB2YXIgdG90X2ltZ193YWl0O1xyXG4gIHZhciBzbGlkZXM7XHJcbiAgdmFyIHNsaWRlX3NlbGVjdF9ib3g7XHJcbiAgdmFyIGVkaXRvcjtcclxuICB2YXIgdGltZW91dElkO1xyXG4gIHZhciBzY3JvbGxfcGVyaW9kID0gNTAwMDtcclxuXHJcbiAgdmFyIHBvc0Fycj1bXHJcbiAgICAnc2xpZGVyX190ZXh0LWx0Jywnc2xpZGVyX190ZXh0LWN0Jywnc2xpZGVyX190ZXh0LXJ0JyxcclxuICAgICdzbGlkZXJfX3RleHQtbGMnLCdzbGlkZXJfX3RleHQtY2MnLCdzbGlkZXJfX3RleHQtcmMnLFxyXG4gICAgJ3NsaWRlcl9fdGV4dC1sYicsJ3NsaWRlcl9fdGV4dC1jYicsJ3NsaWRlcl9fdGV4dC1yYicsXHJcbiAgXTtcclxuICB2YXIgcG9zX2xpc3Q9W1xyXG4gICAgJ9Cb0LXQstC+INCy0LXRgNGFJywn0YbQtdC90YLRgCDQstC10YDRhScsJ9C/0YDQsNCy0L4g0LLQtdGA0YUnLFxyXG4gICAgJ9Cb0LXQstC+INGG0LXQvdGC0YAnLCfRhtC10L3RgtGAJywn0L/RgNCw0LLQviDRhtC10L3RgtGAJyxcclxuICAgICfQm9C10LLQviDQvdC40LcnLCfRhtC10L3RgtGAINC90LjQtycsJ9C/0YDQsNCy0L4g0L3QuNC3JyxcclxuICBdO1xyXG4gIHZhciBzaG93X2RlbGF5PVtcclxuICAgICdzaG93X25vX2RlbGF5JyxcclxuICAgICdzaG93X2RlbGF5XzA1JyxcclxuICAgICdzaG93X2RlbGF5XzEwJyxcclxuICAgICdzaG93X2RlbGF5XzE1JyxcclxuICAgICdzaG93X2RlbGF5XzIwJyxcclxuICAgICdzaG93X2RlbGF5XzI1JyxcclxuICAgICdzaG93X2RlbGF5XzMwJ1xyXG4gIF07XHJcbiAgdmFyIGhpZGVfZGVsYXk9W1xyXG4gICAgJ2hpZGVfbm9fZGVsYXknLFxyXG4gICAgJ2hpZGVfZGVsYXlfMDUnLFxyXG4gICAgJ2hpZGVfZGVsYXlfMTAnLFxyXG4gICAgJ2hpZGVfZGVsYXlfMTUnLFxyXG4gICAgJ2hpZGVfZGVsYXlfMjAnXHJcbiAgXTtcclxuICB2YXIgeWVzX25vX2Fycj1bXHJcbiAgICAnbm8nLFxyXG4gICAgJ3llcydcclxuICBdO1xyXG4gIHZhciB5ZXNfbm9fdmFsPVtcclxuICAgICcnLFxyXG4gICAgJ2ZpeGVkX19mdWxsLWhlaWdodCdcclxuICBdO1xyXG4gIHZhciBidG5fc3R5bGU9W1xyXG4gICAgJ25vbmUnLFxyXG4gICAgJ2JvcmRvJyxcclxuICBdO1xyXG4gIHZhciBzaG93X2FuaW1hdGlvbnM9W1xyXG4gICAgXCJub3RfYW5pbWF0ZVwiLFxyXG4gICAgXCJib3VuY2VJblwiLFxyXG4gICAgXCJib3VuY2VJbkRvd25cIixcclxuICAgIFwiYm91bmNlSW5MZWZ0XCIsXHJcbiAgICBcImJvdW5jZUluUmlnaHRcIixcclxuICAgIFwiYm91bmNlSW5VcFwiLFxyXG4gICAgXCJmYWRlSW5cIixcclxuICAgIFwiZmFkZUluRG93blwiLFxyXG4gICAgXCJmYWRlSW5MZWZ0XCIsXHJcbiAgICBcImZhZGVJblJpZ2h0XCIsXHJcbiAgICBcImZhZGVJblVwXCIsXHJcbiAgICBcImZsaXBJblhcIixcclxuICAgIFwiZmxpcEluWVwiLFxyXG4gICAgXCJsaWdodFNwZWVkSW5cIixcclxuICAgIFwicm90YXRlSW5cIixcclxuICAgIFwicm90YXRlSW5Eb3duTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVJblVwTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVJblVwUmlnaHRcIixcclxuICAgIFwiamFja0luVGhlQm94XCIsXHJcbiAgICBcInJvbGxJblwiLFxyXG4gICAgXCJ6b29tSW5cIlxyXG4gIF07XHJcblxyXG4gIHZhciBoaWRlX2FuaW1hdGlvbnM9W1xyXG4gICAgXCJub3RfYW5pbWF0ZVwiLFxyXG4gICAgXCJib3VuY2VPdXRcIixcclxuICAgIFwiYm91bmNlT3V0RG93blwiLFxyXG4gICAgXCJib3VuY2VPdXRMZWZ0XCIsXHJcbiAgICBcImJvdW5jZU91dFJpZ2h0XCIsXHJcbiAgICBcImJvdW5jZU91dFVwXCIsXHJcbiAgICBcImZhZGVPdXRcIixcclxuICAgIFwiZmFkZU91dERvd25cIixcclxuICAgIFwiZmFkZU91dExlZnRcIixcclxuICAgIFwiZmFkZU91dFJpZ2h0XCIsXHJcbiAgICBcImZhZGVPdXRVcFwiLFxyXG4gICAgXCJmbGlwT3V0WFwiLFxyXG4gICAgXCJsaXBPdXRZXCIsXHJcbiAgICBcImxpZ2h0U3BlZWRPdXRcIixcclxuICAgIFwicm90YXRlT3V0XCIsXHJcbiAgICBcInJvdGF0ZU91dERvd25MZWZ0XCIsXHJcbiAgICBcInJvdGF0ZU91dERvd25SaWdodFwiLFxyXG4gICAgXCJyb3RhdGVPdXRVcExlZnRcIixcclxuICAgIFwicm90YXRlT3V0VXBSaWdodFwiLFxyXG4gICAgXCJoaW5nZVwiLFxyXG4gICAgXCJyb2xsT3V0XCJcclxuICBdO1xyXG4gIHZhciBzdFRhYmxlO1xyXG4gIHZhciBwYXJhbGF4VGFibGU7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRJbWFnZVNlcnZlclNlbGVjdChlbHMpIHtcclxuICAgIGlmKGVscy5sZW5ndGg9PTApcmV0dXJuO1xyXG4gICAgZWxzLndyYXAoJzxkaXYgY2xhc3M9XCJzZWxlY3RfaW1nXCI+Jyk7XHJcbiAgICBlbHM9ZWxzLnBhcmVudCgpO1xyXG4gICAgZWxzLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmaWxlX2J1dHRvblwiPjxpIGNsYXNzPVwibWNlLWljbyBtY2UtaS1icm93c2VcIj48L2k+PC9idXR0b24+Jyk7XHJcbiAgICAvKmVscy5maW5kKCdidXR0b24nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCgnI3JveHlDdXN0b21QYW5lbDInKS5hZGRDbGFzcygnb3BlbicpXHJcbiAgICB9KTsqL1xyXG4gICAgZm9yICh2YXIgaT0wO2k8ZWxzLmxlbmd0aDtpKyspIHtcclxuICAgICAgdmFyIGVsPWVscy5lcShpKS5maW5kKCdpbnB1dCcpO1xyXG4gICAgICBpZighZWwuYXR0cignaWQnKSl7XHJcbiAgICAgICAgZWwuYXR0cignaWQnLCdmaWxlXycraSsnXycrRGF0ZS5ub3coKSlcclxuICAgICAgfVxyXG4gICAgICB2YXIgdF9pZD1lbC5hdHRyKCdpZCcpO1xyXG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIucmVnaXN0ZXIodF9pZCwgZnVuY3Rpb24gKGZpbGUsIGlkKSB7XHJcbiAgICAgICAgLy8kKHRoaXMpLnZhbChmaWxlLnVybCkudHJpZ2dlcignY2hhbmdlJywgW2ZpbGUsIGlkXSk7XHJcbiAgICAgICAgJCgnIycraWQpLnZhbChmaWxlLnVybCkuY2hhbmdlKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmZpbGVfYnV0dG9uJywgZnVuY3Rpb24oKXtcclxuICAgICAgdmFyICR0aGlzPSQodGhpcykucHJldigpO1xyXG4gICAgICB2YXIgaWQ9JHRoaXMuYXR0cignaWQnKTtcclxuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLm9wZW5NYW5hZ2VyKHtcclxuICAgICAgICBcInVybFwiOlwiL21hbmFnZXIvZWxmaW5kZXI/ZmlsdGVyPWltYWdlJmNhbGxiYWNrPVwiK2lkK1wiJmxhbmc9cnVcIixcclxuICAgICAgICBcIndpZHRoXCI6XCJhdXRvXCIsXHJcbiAgICAgICAgXCJoZWlnaHRcIjpcImF1dG9cIixcclxuICAgICAgICBcImlkXCI6aWRcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbklucHV0KGRhdGEpe1xyXG4gICAgdmFyIGlucHV0PSc8aW5wdXQgY2xhc3M9XCInICsgKGRhdGEuaW5wdXRDbGFzcyB8fCAnJykgKyAnXCIgdmFsdWU9XCInICsgKGRhdGEudmFsdWUgfHwgJycpICsgJ1wiPic7XHJcbiAgICBpZihkYXRhLmxhYmVsKSB7XHJcbiAgICAgIGlucHV0ID0gJzxsYWJlbD48c3Bhbj4nICsgZGF0YS5sYWJlbCArICc8L3NwYW4+JytpbnB1dCsnPC9sYWJlbD4nO1xyXG4gICAgfVxyXG4gICAgaWYoZGF0YS5wYXJlbnQpIHtcclxuICAgICAgaW5wdXQgPSAnPCcrZGF0YS5wYXJlbnQrJz4nK2lucHV0Kyc8LycrZGF0YS5wYXJlbnQrJz4nO1xyXG4gICAgfVxyXG4gICAgaW5wdXQgPSAkKGlucHV0KTtcclxuXHJcbiAgICBpZihkYXRhLm9uQ2hhbmdlKXtcclxuICAgICAgdmFyIG9uQ2hhbmdlO1xyXG4gICAgICBpZihkYXRhLmJpbmQpe1xyXG4gICAgICAgIGRhdGEuYmluZC5pbnB1dD1pbnB1dC5maW5kKCdpbnB1dCcpO1xyXG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGRhdGEuYmluZCk7XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGlucHV0LmZpbmQoJ2lucHV0JykpO1xyXG4gICAgICB9XHJcbiAgICAgIGlucHV0LmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsb25DaGFuZ2UpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5TZWxlY3QoZGF0YSl7XHJcbiAgICB2YXIgaW5wdXQ9JCgnPHNlbGVjdC8+Jyk7XHJcblxyXG4gICAgdmFyIGVsPXNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdO1xyXG4gICAgaWYoZGF0YS5pbmRleCE9PWZhbHNlKXtcclxuICAgICAgZWw9ZWxbZGF0YS5pbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgaWYoZWxbZGF0YS5wYXJhbV0pe1xyXG4gICAgICBkYXRhLnZhbHVlPWVsW2RhdGEucGFyYW1dO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGRhdGEudmFsdWU9MDtcclxuICAgIH1cclxuXHJcbiAgICBpZihkYXRhLnN0YXJ0X29wdGlvbil7XHJcbiAgICAgIGlucHV0LmFwcGVuZChkYXRhLnN0YXJ0X29wdGlvbilcclxuICAgIH1cclxuXHJcbiAgICBmb3IodmFyIGk9MDtpPGRhdGEubGlzdC5sZW5ndGg7aSsrKXtcclxuICAgICAgdmFyIHZhbDtcclxuICAgICAgdmFyIHR4dD1kYXRhLmxpc3RbaV07XHJcbiAgICAgIGlmKGRhdGEudmFsX3R5cGU9PTApe1xyXG4gICAgICAgIHZhbD1kYXRhLmxpc3RbaV07XHJcbiAgICAgIH1lbHNlIGlmKGRhdGEudmFsX3R5cGU9PTEpe1xyXG4gICAgICAgIHZhbD1pO1xyXG4gICAgICB9ZWxzZSBpZihkYXRhLnZhbF90eXBlPT0yKXtcclxuICAgICAgICAvL3ZhbD1kYXRhLnZhbF9saXN0W2ldO1xyXG4gICAgICAgIHZhbD1pO1xyXG4gICAgICAgIHR4dD1kYXRhLnZhbF9saXN0W2ldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2VsPSh2YWw9PWRhdGEudmFsdWU/J3NlbGVjdGVkJzonJyk7XHJcbiAgICAgIGlmKHNlbD09J3NlbGVjdGVkJyl7XHJcbiAgICAgICAgaW5wdXQuYXR0cigndF92YWwnLGRhdGEubGlzdFtpXSk7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIG9wdGlvbj0nPG9wdGlvbiB2YWx1ZT1cIicrdmFsKydcIiAnK3NlbCsnPicrdHh0Kyc8L29wdGlvbj4nO1xyXG4gICAgICBpZihkYXRhLnZhbF90eXBlPT0yKXtcclxuICAgICAgICBvcHRpb249JChvcHRpb24pLmF0dHIoJ2NvZGUnLGRhdGEubGlzdFtpXSk7XHJcbiAgICAgIH1cclxuICAgICAgaW5wdXQuYXBwZW5kKG9wdGlvbilcclxuICAgIH1cclxuXHJcbiAgICBpbnB1dC5vbignY2hhbmdlJyxmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGRhdGE9dGhpcztcclxuICAgICAgdmFyIHZhbD1kYXRhLmVsLnZhbCgpO1xyXG4gICAgICB2YXIgc2xfb3A9ZGF0YS5lbC5maW5kKCdvcHRpb25bdmFsdWU9Jyt2YWwrJ10nKTtcclxuICAgICAgdmFyIGNscz1zbF9vcC50ZXh0KCk7XHJcbiAgICAgIHZhciBjaD1zbF9vcC5hdHRyKCdjb2RlJyk7XHJcbiAgICAgIGlmKCFjaCljaD1jbHM7XHJcbiAgICAgIGlmKGRhdGEuaW5kZXghPT1mYWxzZSl7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5pbmRleF1bZGF0YS5wYXJhbV09dmFsO1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLnBhcmFtXT12YWw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRhdGEub2JqLnJlbW92ZUNsYXNzKGRhdGEucHJlZml4K2RhdGEuZWwuYXR0cigndF92YWwnKSk7XHJcbiAgICAgIGRhdGEub2JqLmFkZENsYXNzKGRhdGEucHJlZml4K2NoKTtcclxuICAgICAgZGF0YS5lbC5hdHRyKCd0X3ZhbCcsY2gpO1xyXG5cclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgfS5iaW5kKHtcclxuICAgICAgZWw6aW5wdXQsXHJcbiAgICAgIG9iajpkYXRhLm9iaixcclxuICAgICAgZ3I6ZGF0YS5ncixcclxuICAgICAgaW5kZXg6ZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ZGF0YS5wYXJhbSxcclxuICAgICAgcHJlZml4OmRhdGEucHJlZml4fHwnJ1xyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmKGRhdGEucGFyZW50KXtcclxuICAgICAgdmFyIHBhcmVudD0kKCc8JytkYXRhLnBhcmVudCsnLz4nKTtcclxuICAgICAgcGFyZW50LmFwcGVuZChpbnB1dCk7XHJcbiAgICAgIHJldHVybiBwYXJlbnQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRTZWxBbmltYXRpb25Db250cm9sbChkYXRhKXtcclxuICAgIHZhciBhbmltX3NlbD1bXTtcclxuICAgIHZhciBvdXQ7XHJcblxyXG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCQ0L3QuNC80LDRhtC40Y8g0L/QvtGP0LLQu9C10L3QuNGPPC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OnNob3dfYW5pbWF0aW9ucyxcclxuICAgICAgdmFsX3R5cGU6MCxcclxuICAgICAgb2JqOmRhdGEub2JqLFxyXG4gICAgICBncjpkYXRhLmdyLFxyXG4gICAgICBpbmRleDpkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTonc2hvd19hbmltYXRpb24nLFxyXG4gICAgICBwcmVmaXg6J3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDpkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCX0LDQtNC10YDQttC60LAg0L/QvtGP0LLQu9C10L3QuNGPPC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OnNob3dfZGVsYXksXHJcbiAgICAgIHZhbF90eXBlOjEsXHJcbiAgICAgIG9iajpkYXRhLm9iaixcclxuICAgICAgZ3I6ZGF0YS5ncixcclxuICAgICAgaW5kZXg6ZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06J3Nob3dfZGVsYXknLFxyXG4gICAgICBwcmVmaXg6J3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDpkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmKGRhdGEudHlwZT09MCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8YnIvPicpO1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDpoaWRlX2FuaW1hdGlvbnMsXHJcbiAgICAgIHZhbF90eXBlOjAsXHJcbiAgICAgIG9iajpkYXRhLm9iaixcclxuICAgICAgZ3I6ZGF0YS5ncixcclxuICAgICAgaW5kZXg6ZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06J2hpZGVfYW5pbWF0aW9uJyxcclxuICAgICAgcHJlZml4OidzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6ZGF0YS5wYXJlbnRcclxuICAgIH0pKTtcclxuICAgIGlmKGRhdGEudHlwZT09MCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj7Ql9Cw0LTQtdGA0LbQutCwINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDpoaWRlX2RlbGF5LFxyXG4gICAgICB2YWxfdHlwZToxLFxyXG4gICAgICBvYmo6ZGF0YS5vYmosXHJcbiAgICAgIGdyOmRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OmRhdGEuaW5kZXgsXHJcbiAgICAgIHBhcmFtOidoaWRlX2RlbGF5JyxcclxuICAgICAgcHJlZml4OidzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6ZGF0YS5wYXJlbnRcclxuICAgIH0pKTtcclxuXHJcbiAgICBpZihkYXRhLnR5cGU9PTApe1xyXG4gICAgICBvdXQ9JCgnPGRpdiBjbGFzcz1cImFuaW1fc2VsXCIvPicpO1xyXG4gICAgICBvdXQuYXBwZW5kKGFuaW1fc2VsKTtcclxuICAgIH1cclxuICAgIGlmKGRhdGEudHlwZT09MSl7XHJcbiAgICAgIG91dD1hbmltX3NlbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3V0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdF9lZGl0b3IoKXtcclxuICAgICQoJyN3MScpLnJlbW92ZSgpO1xyXG4gICAgJCgnI3cxX2J1dHRvbicpLnJlbW92ZSgpO1xyXG4gICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlPXNsaWRlcl9kYXRhWzBdLm1vYmlsZS5zcGxpdCgnPycpWzBdO1xyXG5cclxuICAgIHZhciBlbD0kKCcjbWVnYV9zbGlkZXJfY29udHJvbGUnKTtcclxuICAgIHZhciBidG5zX2JveD0kKCc8ZGl2IGNsYXNzPVwiYnRuX2JveFwiLz4nKTtcclxuXHJcbiAgICBlbC5hcHBlbmQoJzxoMj7Qo9C/0YDQsNCy0LvQtdC90LjQtTwvaDI+Jyk7XHJcbiAgICBlbC5hcHBlbmQoJCgnPHRleHRhcmVhLz4nLHtcclxuICAgICAgdGV4dDpKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSksXHJcbiAgICAgIGlkOidzbGlkZV9kYXRhJyxcclxuICAgICAgbmFtZTogZWRpdG9yXHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGJ0bj0kKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQkNC60YLQuNCy0LjRgNC+0LLQsNGC0Ywg0YHQu9Cw0LnQtFwiKTtcclxuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xyXG4gICAgYnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnaGlkZV9zbGlkZScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGJ0bj0kKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQlNC10LDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XHJcbiAgICBidG5zX2JveC5hcHBlbmQoYnRuKTtcclxuICAgIGJ0bi5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcclxuICAgIH0pO1xyXG4gICAgZWwuYXBwZW5kKGJ0bnNfYm94KTtcclxuXHJcbiAgICBlbC5hcHBlbmQoJzxoMj7QntCx0YnQuNC1INC/0LDRgNCw0LzQtdGC0YDRizwvaDI+Jyk7XHJcbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTpzbGlkZXJfZGF0YVswXS5tb2JpbGUsXHJcbiAgICAgIGxhYmVsOlwi0KHQu9Cw0LnQtCDQtNC70Y8g0YLQtdC70LXRhNC+0L3QsFwiLFxyXG4gICAgICBpbnB1dENsYXNzOlwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBvbkNoYW5nZTpmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlPSQodGhpcykudmFsKClcclxuICAgICAgICAkKCcubW9iX2JnJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrc2xpZGVyX2RhdGFbMF0ubW9iaWxlKycpJyk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcblxyXG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6c2xpZGVyX2RhdGFbMF0uZm9uLFxyXG4gICAgICBsYWJlbDpcItCe0YHQvdC+0L3QvtC5INGE0L7QvVwiLFxyXG4gICAgICBpbnB1dENsYXNzOlwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBvbkNoYW5nZTpmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uZm9uPSQodGhpcykudmFsKClcclxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrc2xpZGVyX2RhdGFbMF0uZm9uKycpJylcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgYnRuX2NoPSQoJzxkaXYgY2xhc3M9XCJidG5zXCIvPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZCgnPGgzPtCa0L3QvtC/0LrQsCDQv9C10YDQtdGF0L7QtNCwKNC00LvRjyDQn9CaINCy0LXRgNGB0LjQuCk8L2gzPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOnNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0LFxyXG4gICAgICBsYWJlbDpcItCi0LXQutGB0YJcIixcclxuICAgICAgb25DaGFuZ2U6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0PSQodGhpcykudmFsKCk7XHJcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS50ZXh0KHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0KTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH0sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGJ1dF9zbD0kKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApO1xyXG5cclxuICAgIGJ0bl9jaC5hcHBlbmQoJzxici8+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKCc8c3Bhbj7QntGE0L7RgNC80LvQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6YnRuX3N0eWxlLFxyXG4gICAgICB2YWxfdHlwZTowLFxyXG4gICAgICBvYmo6YnV0X3NsLFxyXG4gICAgICBncjonYnV0dG9uJyxcclxuICAgICAgaW5kZXg6ZmFsc2UsXHJcbiAgICAgIHBhcmFtOidjb2xvcidcclxuICAgIH0pKTtcclxuXHJcbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZCgnPHNwYW4+0J/QvtC70L7QttC10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDpwb3NBcnIsXHJcbiAgICAgIHZhbF9saXN0OnBvc19saXN0LFxyXG4gICAgICB2YWxfdHlwZToyLFxyXG4gICAgICBvYmo6YnV0X3NsLnBhcmVudCgpLnBhcmVudCgpLFxyXG4gICAgICBncjonYnV0dG9uJyxcclxuICAgICAgaW5kZXg6ZmFsc2UsXHJcbiAgICAgIHBhcmFtOidwb3MnXHJcbiAgICB9KSk7XHJcblxyXG4gICAgYnRuX2NoLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XHJcbiAgICAgIHR5cGU6MCxcclxuICAgICAgb2JqOmJ1dF9zbC5wYXJlbnQoKSxcclxuICAgICAgZ3I6J2J1dHRvbicsXHJcbiAgICAgIGluZGV4OmZhbHNlXHJcbiAgICB9KSk7XHJcbiAgICBlbC5hcHBlbmQoYnRuX2NoKTtcclxuXHJcbiAgICB2YXIgbGF5ZXI9JCgnPGRpdiBjbGFzcz1cImZpeGVkX2xheWVyXCIvPicpO1xyXG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0KHRgtCw0YLQuNGH0LXRgdC60LjQtSDRgdC70L7QuDwvaDI+Jyk7XHJcbiAgICB2YXIgdGg9XCI8dGg+4oSWPC90aD5cIitcclxuICAgICAgICAgICAgXCI8dGg+0JrQsNGA0YLQuNC90LrQsDwvdGg+XCIrXHJcbiAgICAgICAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIrXHJcbiAgICAgICAgICAgIFwiPHRoPtCh0LvQvtC5INC90LAg0LLRgdGOINCy0YvRgdC+0YLRgzwvdGg+XCIrXHJcbiAgICAgICAgICAgIFwiPHRoPtCQ0L3QuNC80LDRhtC40Y8g0L/QvtGP0LLQu9C10L3QuNGPPC90aD5cIitcclxuICAgICAgICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiK1xyXG4gICAgICAgICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIrXHJcbiAgICAgICAgICAgIFwiPHRoPtCX0LDQtNC10YDQttC60LAg0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC90aD5cIitcclxuICAgICAgICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XHJcbiAgICBzdFRhYmxlPSQoJzx0YWJsZSBib3JkZXI9XCIxXCI+PHRyPicrdGgrJzwvdHI+PC90YWJsZT4nKTtcclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIHZhciBkYXRhPXNsaWRlcl9kYXRhWzBdLmZpeGVkO1xyXG4gICAgaWYoZGF0YSAmJiBkYXRhLmxlbmd0aD4wKXtcclxuICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xyXG4gICAgICAgIGFkZFRyU3RhdGljKGRhdGFbaV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBsYXllci5hcHBlbmQoc3RUYWJsZSk7XHJcbiAgICB2YXIgYWRkQnRuPSQoJzxidXR0b24vPicse1xyXG4gICAgICB0ZXh0Olwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXHJcbiAgICB9KTtcclxuICAgIGFkZEJ0bi5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGRhdGEgPSBhZGRUclN0YXRpYyhmYWxzZSk7XHJcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBzbGlkZXJfZGF0YTpzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XHJcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xyXG5cclxuICAgIHZhciBsYXllcj0kKCc8ZGl2IGNsYXNzPVwicGFyYWxheF9sYXllclwiLz4nKTtcclxuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCf0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lg8L2gyPicpO1xyXG4gICAgdmFyIHRoPVwiPHRoPuKEljwvdGg+XCIrXHJcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiK1xyXG4gICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiK1xyXG4gICAgICBcIjx0aD7Qo9C00LDQu9C10L3QvdC+0YHRgtGMICjRhtC10LvQvtC1INC/0L7Qu9C+0LbQuNGC0LXQu9GM0L3QvtC1INGH0LjRgdC70L4pPC90aD5cIitcclxuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XHJcblxyXG4gICAgcGFyYWxheFRhYmxlPSQoJzx0YWJsZSBib3JkZXI9XCIxXCI+PHRyPicrdGgrJzwvdHI+PC90YWJsZT4nKTtcclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIHZhciBkYXRhPXNsaWRlcl9kYXRhWzBdLnBhcmFsYXg7XHJcbiAgICBpZihkYXRhICYmIGRhdGEubGVuZ3RoPjApe1xyXG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgYWRkVHJQYXJhbGF4KGRhdGFbaV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBsYXllci5hcHBlbmQocGFyYWxheFRhYmxlKTtcclxuICAgIHZhciBhZGRCdG49JCgnPGJ1dHRvbi8+Jyx7XHJcbiAgICAgIHRleHQ6XCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcclxuICAgIH0pO1xyXG4gICAgYWRkQnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZGF0YSA9IGFkZFRyUGFyYWxheChmYWxzZSk7XHJcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBzbGlkZXJfZGF0YTpzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG5cclxuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xyXG4gICAgZWwuYXBwZW5kKGxheWVyKTtcclxuXHJcbiAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWwuZmluZCgnLmZpbGVTZWxlY3QnKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRUclN0YXRpYyhkYXRhKSB7XHJcbiAgICB2YXIgaT1zdFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoLTE7XHJcbiAgICBpZighZGF0YSl7XHJcbiAgICAgIGRhdGE9e1xyXG4gICAgICAgIFwiaW1nXCI6XCJcIixcclxuICAgICAgICBcImZ1bGxfaGVpZ2h0XCI6MCxcclxuICAgICAgICBcInBvc1wiOjAsXHJcbiAgICAgICAgXCJzaG93X2RlbGF5XCI6MSxcclxuICAgICAgICBcInNob3dfYW5pbWF0aW9uXCI6XCJsaWdodFNwZWVkSW5cIixcclxuICAgICAgICBcImhpZGVfZGVsYXlcIjoxLFxyXG4gICAgICAgIFwiaGlkZV9hbmltYXRpb25cIjpcImJvdW5jZU91dFwiXHJcbiAgICAgIH07XHJcbiAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkLnB1c2goZGF0YSk7XHJcbiAgICAgIHZhciBmaXggPSAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwJyk7XHJcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCx0cnVlKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHRyPSQoJzx0ci8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTpkYXRhLmltZyxcclxuICAgICAgbGFiZWw6ZmFsc2UsXHJcbiAgICAgIHBhcmVudDondGQnLFxyXG4gICAgICBpbnB1dENsYXNzOlwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBiaW5kOntcclxuICAgICAgICBncjonZml4ZWQnLFxyXG4gICAgICAgIGluZGV4OmksXHJcbiAgICAgICAgcGFyYW06J2ltZycsXHJcbiAgICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcclxuICAgICAgfSxcclxuICAgICAgb25DaGFuZ2U6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBkYXRhPXRoaXM7XHJcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbnB1dC52YWwoKSsnKScpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkW2RhdGEuaW5kZXhdLmltZz1kYXRhLmlucHV0LnZhbCgpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6cG9zQXJyLFxyXG4gICAgICB2YWxfbGlzdDpwb3NfbGlzdCxcclxuICAgICAgdmFsX3R5cGU6MixcclxuICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLFxyXG4gICAgICBncjonZml4ZWQnLFxyXG4gICAgICBpbmRleDppLFxyXG4gICAgICBwYXJhbToncG9zJyxcclxuICAgICAgcGFyZW50Oid0ZCcsXHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDp5ZXNfbm9fdmFsLFxyXG4gICAgICB2YWxfbGlzdDp5ZXNfbm9fYXJyLFxyXG4gICAgICB2YWxfdHlwZToyLFxyXG4gICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXHJcbiAgICAgIGdyOidmaXhlZCcsXHJcbiAgICAgIGluZGV4OmksXHJcbiAgICAgIHBhcmFtOidmdWxsX2hlaWdodCcsXHJcbiAgICAgIHBhcmVudDondGQnLFxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcclxuICAgICAgdHlwZToxLFxyXG4gICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxyXG4gICAgICBncjonZml4ZWQnLFxyXG4gICAgICBpbmRleDppLFxyXG4gICAgICBwYXJlbnQ6J3RkJ1xyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0bj0kKCc8YnV0dG9uLz4nLHtcclxuICAgICAgdGV4dDpcItCj0LTQsNC70LjRgtGMXCJcclxuICAgIH0pO1xyXG4gICAgZGVsQnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICR0aGlzPSQodGhpcy5lbCk7XHJcbiAgICAgIGk9JHRoaXMuY2xvc2VzdCgndHInKS5pbmRleCgpLTE7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxyXG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxyXG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLmZpeGVkLnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOmRlbEJ0bixcclxuICAgICAgc2xpZGVyX2RhdGE6c2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuICAgIHZhciBkZWxCdG5UZD0kKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xyXG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcclxuICAgIHN0VGFibGUuYXBwZW5kKHRyKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVkaXRvcjp0cixcclxuICAgICAgZGF0YTpkYXRhXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRUclBhcmFsYXgoZGF0YSkge1xyXG4gICAgdmFyIGk9cGFyYWxheFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoLTE7XHJcbiAgICBpZighZGF0YSl7XHJcbiAgICAgIGRhdGE9e1xyXG4gICAgICAgIFwiaW1nXCI6XCJcIixcclxuICAgICAgICBcInpcIjoxXHJcbiAgICAgIH07XHJcbiAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXgucHVzaChkYXRhKTtcclxuICAgICAgdmFyIHBhcmFsYXhfZ3IgPSAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCcpO1xyXG4gICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YSwgcGFyYWxheF9ncik7XHJcbiAgICB9O1xyXG4gICAgdmFyIHRyPSQoJzx0ci8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTpkYXRhLmltZyxcclxuICAgICAgbGFiZWw6ZmFsc2UsXHJcbiAgICAgIHBhcmVudDondGQnLFxyXG4gICAgICBpbnB1dENsYXNzOlwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBiaW5kOntcclxuICAgICAgICBpbmRleDppLFxyXG4gICAgICAgIHBhcmFtOidpbWcnLFxyXG4gICAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxyXG4gICAgICB9LFxyXG4gICAgICBvbkNoYW5nZTpmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIGRhdGE9dGhpcztcclxuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmlucHV0LnZhbCgpKycpJyk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS5pbWc9ZGF0YS5pbnB1dC52YWwoKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OnBvc0FycixcclxuICAgICAgdmFsX2xpc3Q6cG9zX2xpc3QsXHJcbiAgICAgIHZhbF90eXBlOjIsXHJcbiAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxyXG4gICAgICBncjoncGFyYWxheCcsXHJcbiAgICAgIGluZGV4OmksXHJcbiAgICAgIHBhcmFtOidwb3MnLFxyXG4gICAgICBwYXJlbnQ6J3RkJyxcclxuICAgICAgc3RhcnRfb3B0aW9uOic8b3B0aW9uIHZhbHVlPVwiXCIgY29kZT1cIlwiPtC90LAg0LLQtdGB0Ywg0Y3QutGA0LDQvTwvb3B0aW9uPidcclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOmRhdGEueixcclxuICAgICAgbGFiZWw6ZmFsc2UsXHJcbiAgICAgIHBhcmVudDondGQnLFxyXG4gICAgICBiaW5kOntcclxuICAgICAgICBpbmRleDppLFxyXG4gICAgICAgIHBhcmFtOidpbWcnLFxyXG4gICAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSksXHJcbiAgICAgIH0sXHJcbiAgICAgIG9uQ2hhbmdlOmZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgICAgIGRhdGEub2JqLmF0dHIoJ3onLGRhdGEuaW5wdXQudmFsKCkpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0uej1kYXRhLmlucHV0LnZhbCgpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG5cclxuICAgIHZhciBkZWxCdG49JCgnPGJ1dHRvbi8+Jyx7XHJcbiAgICAgIHRleHQ6XCLQo9C00LDQu9C40YLRjFwiXHJcbiAgICB9KTtcclxuICAgIGRlbEJ0bi5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHZhciAkdGhpcz0kKHRoaXMuZWwpO1xyXG4gICAgICBpPSR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKS0xO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcclxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcclxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5wYXJhbGF4LnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOmRlbEJ0bixcclxuICAgICAgc2xpZGVyX2RhdGE6c2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuICAgIHZhciBkZWxCdG5UZD0kKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xyXG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcclxuICAgIHBhcmFsYXhUYWJsZS5hcHBlbmQodHIpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZWRpdG9yOnRyLFxyXG4gICAgICBkYXRhOmRhdGFcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZF9hbmltYXRpb24oZWwsZGF0YSl7XHJcbiAgICB2YXIgb3V0PSQoJzxkaXYvPicse1xyXG4gICAgICAnY2xhc3MnOidhbmltYXRpb25fbGF5ZXInXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZih0eXBlb2YoZGF0YS5zaG93X2RlbGF5KSE9J3VuZGVmaW5lZCcpe1xyXG4gICAgICBvdXQuYWRkQ2xhc3Moc2hvd19kZWxheVtkYXRhLnNob3dfZGVsYXldKTtcclxuICAgICAgaWYoZGF0YS5zaG93X2FuaW1hdGlvbil7XHJcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nK2RhdGEuc2hvd19hbmltYXRpb24pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYodHlwZW9mKGRhdGEuaGlkZV9kZWxheSkhPSd1bmRlZmluZWQnKXtcclxuICAgICAgb3V0LmFkZENsYXNzKGhpZGVfZGVsYXlbZGF0YS5oaWRlX2RlbGF5XSk7XHJcbiAgICAgIGlmKGRhdGEuaGlkZV9hbmltYXRpb24pe1xyXG4gICAgICAgIG91dC5hZGRDbGFzcygnc2xpZGVfJytkYXRhLmhpZGVfYW5pbWF0aW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGVsLmFwcGVuZChvdXQpO1xyXG4gICAgcmV0dXJuIGVsO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVfc2xpZGUoZGF0YSl7XHJcbiAgICB2YXIgc2xpZGU9JCgnPGRpdiBjbGFzcz1cInNsaWRlXCIvPicpO1xyXG5cclxuICAgIHZhciBtb2JfYmc9JCgnPGEgY2xhc3M9XCJtb2JfYmdcIiBocmVmPVwiJytkYXRhLmJ1dHRvbi5ocmVmKydcIi8+Jyk7XHJcbiAgICBtb2JfYmcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5tb2JpbGUrJyknKVxyXG5cclxuICAgIHNsaWRlLmFwcGVuZChtb2JfYmcpO1xyXG4gICAgaWYobW9iaWxlX21vZGUpe1xyXG4gICAgICByZXR1cm4gc2xpZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDRhNC+0L0g0YLQviDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIGlmKGRhdGEuZm9uKXtcclxuICAgICAgc2xpZGUuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5mb24rJyknKVxyXG4gICAgfVxyXG5cclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIGlmKGRhdGEucGFyYWxheCAmJiBkYXRhLnBhcmFsYXgubGVuZ3RoPjApe1xyXG4gICAgICB2YXIgcGFyYWxheF9ncj0kKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2dyb3VwXCIvPicpO1xyXG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEucGFyYWxheC5sZW5ndGg7aSsrKXtcclxuICAgICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YS5wYXJhbGF4W2ldLHBhcmFsYXhfZ3IpXHJcbiAgICAgIH1cclxuICAgICAgc2xpZGUuYXBwZW5kKHBhcmFsYXhfZ3IpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGZpeD0kKCc8ZGl2IGNsYXNzPVwiZml4ZWRfZ3JvdXBcIi8+Jyk7XHJcbiAgICBmb3IodmFyIGk9MDtpPGRhdGEuZml4ZWQubGVuZ3RoO2krKyl7XHJcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEuZml4ZWRbaV0sZml4KVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBkb3BfYmxrPSQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XHJcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLmJ1dHRvbi5wb3NdKTtcclxuICAgIHZhciBidXQ9JChcIjxhIGNsYXNzPSdzbGlkZXJfX2hyZWYnLz5cIik7XHJcbiAgICBidXQuYXR0cignaHJlZicsZGF0YS5idXR0b24uaHJlZik7XHJcbiAgICBidXQudGV4dChkYXRhLmJ1dHRvbi50ZXh0KTtcclxuICAgIGJ1dC5hZGRDbGFzcyhkYXRhLmJ1dHRvbi5jb2xvcik7XHJcbiAgICBkb3BfYmxrPWFkZF9hbmltYXRpb24oZG9wX2JsayxkYXRhLmJ1dHRvbik7XHJcbiAgICBkb3BfYmxrLmZpbmQoJ2RpdicpLmFwcGVuZChidXQpO1xyXG4gICAgZml4LmFwcGVuZChkb3BfYmxrKTtcclxuXHJcbiAgICBzbGlkZS5hcHBlbmQoZml4KTtcclxuICAgIHJldHVybiBzbGlkZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFBhcmFsYXhMYXllcihkYXRhLHBhcmFsYXhfZ3Ipe1xyXG4gICAgdmFyIHBhcmFsbGF4X2xheWVyPSQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fbGF5ZXJcIlxcPicpO1xyXG4gICAgcGFyYWxsYXhfbGF5ZXIuYXR0cigneicsZGF0YS56fHxpKjEwKTtcclxuICAgIHZhciBkb3BfYmxrPSQoXCI8c3BhbiBjbGFzcz0nc2xpZGVyX190ZXh0Jy8+XCIpO1xyXG4gICAgaWYoZGF0YS5wb3MpIHtcclxuICAgICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcclxuICAgIH1cclxuICAgIGRvcF9ibGsuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcclxuICAgIHBhcmFsbGF4X2xheWVyLmFwcGVuZChkb3BfYmxrKTtcclxuICAgIHBhcmFsYXhfZ3IuYXBwZW5kKHBhcmFsbGF4X2xheWVyKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFN0YXRpY0xheWVyKGRhdGEsZml4LGJlZm9yX2J1dHRvbil7XHJcbiAgICB2YXIgZG9wX2Jsaz0kKFwiPGRpdiBjbGFzcz0nZml4ZWRfX2xheWVyJy8+XCIpO1xyXG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcclxuICAgIGlmKGRhdGEuZnVsbF9oZWlnaHQpe1xyXG4gICAgICBkb3BfYmxrLmFkZENsYXNzKCdmaXhlZF9fZnVsbC1oZWlnaHQnKTtcclxuICAgIH1cclxuICAgIGRvcF9ibGs9YWRkX2FuaW1hdGlvbihkb3BfYmxrLGRhdGEpO1xyXG4gICAgZG9wX2Jsay5maW5kKCcuYW5pbWF0aW9uX2xheWVyJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcclxuXHJcbiAgICBpZihiZWZvcl9idXR0b24pe1xyXG4gICAgICBmaXguZmluZCgnLnNsaWRlcl9faHJlZicpLmNsb3Nlc3QoJy5maXhlZF9fbGF5ZXInKS5iZWZvcmUoZG9wX2JsaylcclxuICAgIH1lbHNlIHtcclxuICAgICAgZml4LmFwcGVuZChkb3BfYmxrKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcclxuICAgIGlmKCQoJyNtZWdhX3NsaWRlcicpLmhhc0NsYXNzKCdzdG9wX3NsaWRlJykpcmV0dXJuO1xyXG5cclxuICAgIHZhciBzbGlkZV9wb2ludHM9JCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlX3NlbGVjdCcpXHJcbiAgICB2YXIgc2xpZGVfY250PXNsaWRlX3BvaW50cy5sZW5ndGg7XHJcbiAgICB2YXIgYWN0aXZlPSQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykuaW5kZXgoKSsxO1xyXG4gICAgaWYoYWN0aXZlPj1zbGlkZV9jbnQpYWN0aXZlPTA7XHJcbiAgICBzbGlkZV9wb2ludHMuZXEoYWN0aXZlKS5jbGljaygpO1xyXG5cclxuICAgIHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbWdfdG9fbG9hZChzcmMpe1xyXG4gICAgdmFyIGltZz0kKCc8aW1nLz4nKTtcclxuICAgIGltZy5vbignbG9hZCcsZnVuY3Rpb24oKXtcclxuICAgICAgdG90X2ltZ193YWl0LS07XHJcblxyXG4gICAgICBpZih0b3RfaW1nX3dhaXQ9PTApe1xyXG5cclxuICAgICAgICBzbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dKSk7XHJcbiAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKHJlbmRlcl9zbGlkZV9ub20pLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgICAgICBpZihyZW5kZXJfc2xpZGVfbm9tPT0wKXtcclxuICAgICAgICAgIHNsaWRlcy5maW5kKCcuc2xpZGUnKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2ZpcnN0X3Nob3cnKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgIGlmKCFlZGl0b3IpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuZmlyc3Rfc2hvdycpLnJlbW92ZUNsYXNzKCdmaXJzdF9zaG93Jyk7XHJcbiAgICAgICAgICAgIH0uYmluZChzbGlkZXMpLCA1MDAwKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZihtb2JpbGVfbW9kZT09PWZhbHNlKSB7XHJcbiAgICAgICAgICAgIHBhcmFsbGF4X2dyb3VwID0gJChjb250YWluZXJfaWQgKyAnIC5zbGlkZXItYWN0aXZlIC5wYXJhbGxheF9fZ3JvdXA+KicpO1xyXG4gICAgICAgICAgICBwYXJhbGxheF9jb3VudGVyID0gMDtcclxuICAgICAgICAgICAgcGFyYWxsYXhfdGltZXIgPSBzZXRJbnRlcnZhbChyZW5kZXIsIDEwMCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYoZWRpdG9yKXtcclxuICAgICAgICAgICAgaW5pdF9lZGl0b3IoKVxyXG4gICAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xyXG5cclxuICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3gnKS5vbignY2xpY2snLCcuc2xpZGVfc2VsZWN0JyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgIHZhciAkdGhpcz0kKHRoaXMpO1xyXG4gICAgICAgICAgICAgIGlmKCR0aGlzLmhhc0NsYXNzKCdzbGlkZXItYWN0aXZlJykpcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkdGhpcy5pbmRleCgpO1xyXG4gICAgICAgICAgICAgICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCsnIC5zbGlkZS5zbGlkZXItYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCsnIC5zbGlkZScpLmVxKGluZGV4KS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5ob3ZlcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuYWRkQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XHJcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykucmVtb3ZlQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZW5kZXJfc2xpZGVfbm9tKys7XHJcbiAgICAgICAgaWYocmVuZGVyX3NsaWRlX25vbTxzbGlkZXJfZGF0YS5sZW5ndGgpe1xyXG4gICAgICAgICAgbG9hZF9zbGlkZV9pbWcoKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSkub24oJ2Vycm9yJyxmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xyXG4gICAgfSk7XHJcbiAgICBpbWcucHJvcCgnc3JjJyxzcmMpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbG9hZF9zbGlkZV9pbWcoKXtcclxuICAgIHZhciBkYXRhPXNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dO1xyXG4gICAgdG90X2ltZ193YWl0PTE7XHJcblxyXG4gICAgaWYobW9iaWxlX21vZGU9PT1mYWxzZSl7XHJcbiAgICAgIHRvdF9pbWdfd2FpdCsrO1xyXG4gICAgICBpbWdfdG9fbG9hZChkYXRhLmZvbik7XHJcbiAgICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgICAgaWYoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGg+MCl7XHJcbiAgICAgICAgdG90X2ltZ193YWl0Kz1kYXRhLnBhcmFsYXgubGVuZ3RoO1xyXG4gICAgICAgIGZvcih2YXIgaT0wO2k8ZGF0YS5wYXJhbGF4Lmxlbmd0aDtpKyspIHtcclxuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEucGFyYWxheFtpXS5pbWcpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmKGRhdGEuZml4ZWQgJiYgZGF0YS5maXhlZC5sZW5ndGg+MCkge1xyXG4gICAgICAgIHRvdF9pbWdfd2FpdCArPSBkYXRhLmZpeGVkLmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuZml4ZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEuZml4ZWRbaV0uaW1nKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGltZ190b19sb2FkKGRhdGEubW9iaWxlKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN0YXJ0X2luaXRfc2xpZGUoZGF0YSl7XHJcbiAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgdmFyIGltZz0kKCc8aW1nLz4nKTtcclxuICAgIGltZy5hdHRyKCd0aW1lJyxuKTtcclxuXHJcbiAgICBmdW5jdGlvbiBvbl9pbWdfbG9hZCgpe1xyXG4gICAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICBpbWc9JCh0aGlzKTtcclxuICAgICAgbj1uLXBhcnNlSW50KGltZy5hdHRyKCd0aW1lJykpO1xyXG4gICAgICBpZihuPm1heF90aW1lX2xvYWRfcGljKXtcclxuICAgICAgICBtb2JpbGVfbW9kZT10cnVlO1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICB2YXIgbWF4X3NpemU9KHNjcmVlbi5oZWlnaHQ+c2NyZWVuLndpZHRoP3NjcmVlbi5oZWlnaHQ6c2NyZWVuLndpZHRoKTtcclxuICAgICAgICBpZihtYXhfc2l6ZTxtb2JpbGVfc2l6ZSl7XHJcbiAgICAgICAgICBtb2JpbGVfbW9kZT10cnVlO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgbW9iaWxlX21vZGU9ZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmKG1vYmlsZV9tb2RlPT10cnVlKXtcclxuICAgICAgICAkKGNvbnRhaW5lcl9pZCkuYWRkQ2xhc3MoJ21vYmlsZV9tb2RlJylcclxuICAgICAgfVxyXG4gICAgICByZW5kZXJfc2xpZGVfbm9tPTA7XHJcbiAgICAgIGxvYWRfc2xpZGVfaW1nKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGltZy5vbignbG9hZCcsb25faW1nX2xvYWQoKSk7XHJcbiAgICBpZihzbGlkZXJfZGF0YS5sZW5ndGg+MCkge1xyXG4gICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnP3I9JyArIE1hdGgucmFuZG9tKCk7XHJcbiAgICAgIGltZy5wcm9wKCdzcmMnLCBzbGlkZXJfZGF0YVswXS5tb2JpbGUpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIG9uX2ltZ19sb2FkKCkuYmluZChpbWcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdChkYXRhLGVkaXRvcl9pbml0KXtcclxuICAgIHNsaWRlcl9kYXRhPWRhdGE7XHJcbiAgICBlZGl0b3I9ZWRpdG9yX2luaXQ7XHJcbiAgICAvL9C90LDRhdC+0LTQuNC8INC60L7QvdGC0LXQudC90LXRgCDQuCDQvtGH0LjRidCw0LXQvCDQtdCz0L5cclxuICAgIHZhciBjb250YWluZXI9JChjb250YWluZXJfaWQpO1xyXG4gICAgY29udGFpbmVyLmh0bWwoJycpO1xyXG5cclxuICAgIC8v0YHQvtC30LbQsNC10Lwg0LHQsNC30L7QstGL0LUg0LrQvtC90YLQtdC50L3QtdGA0Ysg0LTQu9GPINGB0LDQvNC40YUg0YHQu9Cw0LnQtNC+0LIg0Lgg0LTQu9GPINC/0LXRgNC10LrQu9GO0YfQsNGC0LXQu9C10LlcclxuICAgIHNsaWRlcz0kKCc8ZGl2Lz4nLHtcclxuICAgICAgJ2NsYXNzJzonc2xpZGVzJ1xyXG4gICAgfSk7XHJcbiAgICB2YXIgc2xpZGVfY29udHJvbD0kKCc8ZGl2Lz4nLHtcclxuICAgICAgJ2NsYXNzJzonc2xpZGVfY29udHJvbCdcclxuICAgIH0pO1xyXG4gICAgc2xpZGVfc2VsZWN0X2JveD0kKCc8dWwvPicse1xyXG4gICAgICAnY2xhc3MnOidzbGlkZV9zZWxlY3RfYm94J1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy/QtNC+0LHQsNCy0LvRj9C10Lwg0LjQvdC00LjQutCw0YLQvtGAINC30LDQs9GA0YPQt9C60LhcclxuICAgIHZhciBsPSc8ZGl2IGNsYXNzPVwic2stZm9sZGluZy1jdWJlXCI+JytcclxuICAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTEgc2stY3ViZVwiPjwvZGl2PicrXHJcbiAgICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUyIHNrLWN1YmVcIj48L2Rpdj4nK1xyXG4gICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlNCBzay1jdWJlXCI+PC9kaXY+JytcclxuICAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTMgc2stY3ViZVwiPjwvZGl2PicrXHJcbiAgICAgICAnPC9kaXY+JztcclxuICAgIGNvbnRhaW5lci5odG1sKGwpO1xyXG5cclxuXHJcbiAgICBzdGFydF9pbml0X3NsaWRlKGRhdGFbMF0pO1xyXG5cclxuICAgIC8v0LPQtdC90LXRgNC40YDRg9C10Lwg0LrQvdC+0L/QutC4INC4INGB0LvQsNC50LTRi1xyXG4gICAgZm9yICh2YXIgaT0wO2k8ZGF0YS5sZW5ndGg7aSsrKXtcclxuICAgICAgLy9zbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKGRhdGFbaV0pKTtcclxuICAgICAgc2xpZGVfc2VsZWN0X2JveC5hcHBlbmQoJzxsaSBjbGFzcz1cInNsaWRlX3NlbGVjdCBkaXNhYmxlZFwiLz4nKVxyXG4gICAgfVxyXG5cclxuICAgIC8qc2xpZGVzLmZpbmQoJy5zbGlkZScpLmVxKDApXHJcbiAgICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpXHJcbiAgICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpO1xyXG4gICAgc2xpZGVfY29udHJvbC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7Ki9cclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlcyk7XHJcbiAgICBzbGlkZV9jb250cm9sLmFwcGVuZChzbGlkZV9zZWxlY3RfYm94KTtcclxuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVfY29udHJvbCk7XHJcblxyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlcigpe1xyXG4gICAgaWYoIXBhcmFsbGF4X2dyb3VwKXJldHVybiBmYWxzZTtcclxuICAgIHZhciBwYXJhbGxheF9rPShwYXJhbGxheF9jb3VudGVyLTEwKS8yO1xyXG5cclxuICAgIGZvcih2YXIgaT0wO2k8cGFyYWxsYXhfZ3JvdXAubGVuZ3RoO2krKyl7XHJcbiAgICAgIHZhciBlbD1wYXJhbGxheF9ncm91cC5lcShpKTtcclxuICAgICAgdmFyIGo9ZWwuYXR0cigneicpO1xyXG4gICAgICB2YXIgdHI9J3JvdGF0ZTNkKDAuMSwwLjgsMCwnKyhwYXJhbGxheF9rKSsnZGVnKSBzY2FsZSgnKygxK2oqMC41KSsnKSB0cmFuc2xhdGVaKC0nKygxMCtqKjIwKSsncHgpJztcclxuICAgICAgZWwuY3NzKCd0cmFuc2Zvcm0nLHRyKVxyXG4gICAgfVxyXG4gICAgcGFyYWxsYXhfY291bnRlcis9cGFyYWxsYXhfZCowLjE7XHJcbiAgICBpZihwYXJhbGxheF9jb3VudGVyPj0yMClwYXJhbGxheF9kPS1wYXJhbGxheF9kO1xyXG4gICAgaWYocGFyYWxsYXhfY291bnRlcjw9MClwYXJhbGxheF9kPS1wYXJhbGxheF9kO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGluaXQ6IGluaXRcclxuICB9O1xyXG59KCkpO1xyXG4iLCJ2YXIgaGVhZGVyQWN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxuICAgIHZhciBzaGFkb3dlZERvd24gPSBmYWxzZTtcclxuXHJcbiAgICAkKCcubWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgICAgICQoJy5kcm9wLW1lbnUnKS5yZW1vdmVDbGFzcygnb3BlbicpLnJlbW92ZUNsYXNzKCdjbG9zZScpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICBpZiAoJCgnLmhlYWRlcicpLmhhc0NsYXNzKCdoZWFkZXJfb3Blbi1tZW51JykpIHtcclxuICAgICAgICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItc2VhcmNoLW9wZW4nKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgICQoJy5zZWFyY2gtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlci1zZWFyY2gtb3BlbicpO1xyXG4gICAgICAgICQoJyNhdXRvY29tcGxldGUnKS5mYWRlT3V0KCk7XHJcbiAgICAgICAgaWYgKCQoJy5oZWFkZXInKS5oYXNDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJykpIHtcclxuICAgICAgICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnI2hlYWRlcicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaWYgKGUudGFyZ2V0LmlkID09ICdoZWFkZXInKSB7XHJcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGVhZGVyLXNlYXJjaC1vcGVuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1idXR0b24nKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCdmb3JtJykuc3VibWl0KCk7XHJcbiAgICB9KTtcclxuXHJcblxyXG5cclxuICAgICQoJy5oZWFkZXItc2Vjb25kbGluZV9jbG9zZScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLmhlYWRlci11cGxpbmUnKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICAgICAgc2Nyb2xsZWREb3duID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKHdpbmRvdykub24oJ2xvYWQgcmVzaXplIHNjcm9sbCcsZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNoYWRvd0hlaWdodCA9IDUwO1xyXG4gICAgICAgIHZhciBoaWRlSGVpZ2h0ID0gMjAwO1xyXG4gICAgICAgIHZhciBoZWFkZXJTZWNvbmRMaW5lID0gJCgnLmhlYWRlci1zZWNvbmRsaW5lJyk7XHJcbiAgICAgICAgdmFyIGhvdmVycyA9IGhlYWRlclNlY29uZExpbmUuZmluZCgnOmhvdmVyJyk7XHJcbiAgICAgICAgdmFyIGhlYWRlciA9ICQoJy5oZWFkZXInKTtcclxuXHJcbiAgICAgICAgaWYgKCFob3ZlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcclxuICAgICAgICAgICAgaGVhZGVyLnJlbW92ZUNsYXNzKCdzY3JvbGxhYmxlJyk7XHJcbiAgICAgICAgICAgIC8vZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxyXG4gICAgICAgICAgICB2YXIgc2Nyb2xsVG9wPSQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuICAgICAgICAgICAgaWYgKHNjcm9sbFRvcCA+IHNoYWRvd0hlaWdodCAmJiBzaGFkb3dlZERvd24gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBzaGFkb3dlZERvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2hhZG93ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoc2Nyb2xsVG9wIDw9IHNoYWRvd0hlaWdodCAmJiBzaGFkb3dlZERvd24gPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHNoYWRvd2VkRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5yZW1vdmVDbGFzcygnc2hhZG93ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoc2Nyb2xsVG9wID4gaGlkZUhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBzY3JvbGxlZERvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsLWRvd24nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoc2Nyb2xsVG9wIDw9IGhpZGVIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGhlYWRlclNlY29uZExpbmUucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XHJcbiAgICAgICAgICAgIGhlYWRlci5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5tZW51X2FuZ2xlLWRvd24sIC5kcm9wLW1lbnVfZ3JvdXBfX3VwLWhlYWRlcicpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgbWVudU9wZW4gPSAkKHRoaXMpLmNsb3Nlc3QoJy5oZWFkZXJfb3Blbi1tZW51LCAuY2F0YWxvZy1jYXRlZ29yaWVzJyk7XHJcbiAgICAgICAgaWYgKCFtZW51T3Blbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgcGFyZW50ID0gJCh0aGlzKS5jbG9zZXN0KCcuZHJvcC1tZW51X2dyb3VwX191cCwgLm1lbnUtZ3JvdXAnKTtcclxuICAgICAgICB2YXIgcGFyZW50TWVudSA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudScpO1xyXG4gICAgICAgIGlmIChwYXJlbnRNZW51KSB7XHJcbiAgICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgICAgICAgICAkKHBhcmVudCkudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgICAgICAgaWYgKHBhcmVudC5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHBhcmVudCkucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50TWVudSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuY2hpbGRyZW4oJ2xpJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5hZGRDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRNZW51KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChwYXJlbnRNZW51KS5zaWJsaW5ncygndWwnKS5jaGlsZHJlbignbGknKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgdmFyIGFjY291bnRNZW51VGltZU91dCA9IG51bGw7XHJcbiAgICAkKCcuYWNjb3VudC1tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgbWVudSA9ICQoJy5hY2NvdW50LW1lbnUnKTtcclxuICAgICAgICBpZiAobWVudSkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoYWNjb3VudE1lbnVUaW1lT3V0KTtcclxuICAgICAgICAgICAgbWVudS50b2dnbGVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIGlmICghbWVudS5oYXNDbGFzcygnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIGFjY291bnRNZW51VGltZU91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgfSwgNzAwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfSk7XHJcblxyXG5cclxufSgpO1xyXG5cclxuXHJcblxyXG5cclxuIiwiJChmdW5jdGlvbigpIHtcclxuICAgIGZ1bmN0aW9uIHBhcnNlTnVtKHN0cil7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoXHJcbiAgICAgICAgICAgIFN0cmluZyhzdHIpXHJcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgnLCcsJy4nKVxyXG4gICAgICAgICAgICAgICAgLm1hdGNoKC8tP1xcZCsoPzpcXC5cXGQrKT8vZywgJycpIHx8IDBcclxuICAgICAgICAgICAgLCAxMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgJCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKS5maW5kKCdzZWxlY3QsaW5wdXQnKS5vbignY2hhbmdlIGtleXVwIGNsaWNrJyxmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyICR0aGlzPSQodGhpcykuY2xvc2VzdCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKTtcclxuICAgICAgICB2YXIgY3Vycz1wYXJzZU51bSgkdGhpcy5maW5kKCdzZWxlY3QnKS52YWwoKSk7XHJcbiAgICAgICAgdmFyIHZhbD0kdGhpcy5maW5kKCdpbnB1dCcpLnZhbCgpO1xyXG4gICAgICAgIGlmIChwYXJzZU51bSh2YWwpICE9IHZhbCkge1xyXG4gICAgICAgICAgICB2YWw9JHRoaXMuZmluZCgnaW5wdXQnKS52YWwocGFyc2VOdW0odmFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhbD1wYXJzZU51bSh2YWwpO1xyXG5cclxuICAgICAgICB2YXIga29lZj0kdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2snKS50cmltKCk7XHJcbiAgICAgICAgdmFyIHByb21vPSR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1wcm9tbycpLnRyaW0oKTtcclxuICAgICAgICB2YXIgY3VycmVuY3k9JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLWN1cnJlbmN5JykudHJpbSgpO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAwO1xyXG4gICAgICAgIHZhciBvdXQgPSAwO1xyXG5cclxuICAgICAgICBpZiAoa29lZj09cHJvbW8pIHtcclxuICAgICAgICAgICAgcHJvbW89MDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGtvZWYuaW5kZXhPZignJScpPjApe1xyXG4gICAgICAgICAgICByZXN1bHQ9cGFyc2VOdW0oa29lZikqdmFsKmN1cnMvMTAwO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBjdXJzPXBhcnNlTnVtKCR0aGlzLmZpbmQoJ1tjb2RlPScrY3VycmVuY3krJ10nKS52YWwoKSk7XHJcbiAgICAgICAgICAgIHJlc3VsdD1wYXJzZU51bShrb2VmKSpjdXJzXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihwYXJzZU51bShwcm9tbyk+MCkge1xyXG4gICAgICAgICAgICBpZihwcm9tby5pbmRleE9mKCclJyk+MCl7XHJcbiAgICAgICAgICAgICAgICBwcm9tbz1wYXJzZU51bShwcm9tbykqdmFsKmN1cnMvMTAwO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHByb21vPXBhcnNlTnVtKHByb21vKSpjdXJzXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHByb21vPjApIHtcclxuICAgICAgICAgICAgICAgIG91dCA9IFwiPHNwYW4gY2xhc3M9b2xkX3ByaWNlPlwiICsgcmVzdWx0LnRvRml4ZWQoMikgKyBcIjwvc3Bhbj4gXCIgKyBwcm9tby50b0ZpeGVkKDIpXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgb3V0PXJlc3VsdC50b0ZpeGVkKDIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgb3V0PXJlc3VsdC50b0ZpeGVkKDIpXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgJHRoaXMuZmluZCgnLmNhbGMtcmVzdWx0X3ZhbHVlJykuaHRtbChvdXQpXHJcbiAgICB9KS5jbGljaygpXHJcbn0pOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIGVscz0kKCcuYXV0b19oaWRlX2NvbnRyb2wnKTtcclxuICBpZihlbHMubGVuZ3RoPT0wKXJldHVybjtcclxuXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJyxcIi5zY3JvbGxfYm94LXNob3dfbW9yZVwiLGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGRhdGE9e1xyXG4gICAgICBidXR0b25ZZXM6ZmFsc2UsXHJcbiAgICAgIG5vdHlmeV9jbGFzczpcIm5vdGlmeV93aGl0ZSBub3RpZnlfbm90X2JpZ1wiXHJcbiAgICB9O1xyXG5cclxuICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICB2YXIgY29udGVudCA9ICR0aGlzLmNsb3Nlc3QoJy5zY3JvbGxfYm94LWl0ZW0nKS5jbG9uZSgpO1xyXG4gICAgY29udGVudD1jb250ZW50WzBdO1xyXG4gICAgY29udGVudC5jbGFzc05hbWUgKz0gJyBzY3JvbGxfYm94LWl0ZW0tbW9kYWwnO1xyXG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZGl2LmNsYXNzTmFtZSA9ICdjb21tZW50cyc7XHJcbiAgICBkaXYuYXBwZW5kKGNvbnRlbnQpO1xyXG4gICAgJChkaXYpLmZpbmQoJy5zY3JvbGxfYm94LXNob3dfbW9yZScpLnJlbW92ZSgpO1xyXG4gICAgJChkaXYpLmZpbmQoJy5tYXhfdGV4dF9oaWRlJylcclxuICAgICAgLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLXgyJylcclxuICAgICAgLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlJyk7XHJcbiAgICBkYXRhLnF1ZXN0aW9uPSBkaXYub3V0ZXJIVE1MO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICB9KTtcclxuXHJcblxyXG4gIGZ1bmN0aW9uIGhhc1Njcm9sbChlbCkge1xyXG4gICAgcmV0dXJuIGVsLnNjcm9sbEhlaWdodD5lbC5jbGllbnRIZWlnaHQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZWJ1aWxkKCl7XHJcbiAgICBmb3IodmFyIGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcclxuICAgICAgdmFyIGVsPWVscy5lcShpKTtcclxuICAgICAgdmFyIGlzX2hpZGU9ZmFsc2U7XHJcbiAgICAgIGlmKGVsLmhlaWdodCgpPDEwKXtcclxuICAgICAgICBpc19oaWRlPXRydWU7XHJcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuc2hvdygwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHRleHQ9ZWwuZmluZCgnLnNjcm9sbF9ib3gtdGV4dCcpO1xyXG4gICAgICB2YXIgYW5zd2VyPWVsLmZpbmQoJy5zY3JvbGxfYm94LWFuc3dlcicpO1xyXG4gICAgICB2YXIgc2hvd19tb3JlPWVsLmZpbmQoJy5zY3JvbGxfYm94LXNob3dfbW9yZScpO1xyXG5cclxuICAgICAgdmFyIHNob3dfYnRuPWZhbHNlO1xyXG4gICAgICBpZihoYXNTY3JvbGwodGV4dFswXSkpe1xyXG4gICAgICAgIHNob3dfYnRuPXRydWU7XHJcbiAgICAgICAgdGV4dC5yZW1vdmVDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIHRleHQuYWRkQ2xhc3MoJ21heF90ZXh0X2hpZGUtaGlkZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZihhbnN3ZXIubGVuZ3RoPjApe1xyXG4gICAgICAgIC8v0LXRgdGC0Ywg0L7RgtCy0LXRgiDQsNC00LzQuNC90LBcclxuICAgICAgICBpZihoYXNTY3JvbGwoYW5zd2VyWzBdKSl7XHJcbiAgICAgICAgICBzaG93X2J0bj10cnVlO1xyXG4gICAgICAgICAgYW5zd2VyLnJlbW92ZUNsYXNzKCdtYXhfdGV4dF9oaWRlLWhpZGUnKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgIGFuc3dlci5hZGRDbGFzcygnbWF4X3RleHRfaGlkZS1oaWRlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZihzaG93X2J0bil7XHJcbiAgICAgICAgc2hvd19tb3JlLnNob3coKTtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgc2hvd19tb3JlLmhpZGUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYoaXNfaGlkZSl7XHJcbiAgICAgICAgZWwuY2xvc2VzdCgnLnNjcm9sbF9ib3gtaXRlbS1oaWRlJykuaGlkZSgwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJCh3aW5kb3cpLnJlc2l6ZShyZWJ1aWxkKTtcclxuICByZWJ1aWxkKCk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5zaG93X2FsbCcsZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgY2xzPSQodGhpcykuZGF0YSgnY250cmwtY2xhc3MnKTtcclxuICAgICQoJy5oaWRlX2FsbFtkYXRhLWNudHJsLWNsYXNzXScpLnNob3coKTtcclxuICAgICQodGhpcykuaGlkZSgpO1xyXG4gICAgJCgnLicrY2xzKS5zaG93KCk7XHJcbiAgfSk7XHJcblxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuaGlkZV9hbGwnLGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGNscz0kKHRoaXMpLmRhdGEoJ2NudHJsLWNsYXNzJyk7XHJcbiAgICAkKCcuc2hvd19hbGxbZGF0YS1jbnRybC1jbGFzc10nKS5zaG93KCk7XHJcbiAgICAkKHRoaXMpLmhpZGUoKTtcclxuICAgICQoJy4nK2NscykuaGlkZSgpO1xyXG4gIH0pO1xyXG59KSgpO1xyXG4iLCIkKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIGRlY2xPZk51bShudW1iZXIsIHRpdGxlcykge1xyXG4gICAgY2FzZXMgPSBbMiwgMCwgMSwgMSwgMSwgMl07XHJcbiAgICByZXR1cm4gdGl0bGVzWyAobnVtYmVyJTEwMD40ICYmIG51bWJlciUxMDA8MjApPyAyIDogY2FzZXNbKG51bWJlciUxMDw1KT9udW1iZXIlMTA6NV0gXTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpcnN0WmVybyh2KXtcclxuICAgIHY9TWF0aC5mbG9vcih2KTtcclxuICAgIGlmKHY8MTApXHJcbiAgICAgIHJldHVybiAnMCcrdjtcclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuIHY7XHJcbiAgfVxyXG5cclxuICB2YXIgY2xvY2tzPSQoJy5jbG9jaycpO1xyXG4gIGlmKGNsb2Nrcy5sZW5ndGg+MCl7XHJcbiAgICBmdW5jdGlvbiB1cGRhdGVDbG9jaygpe1xyXG4gICAgICB2YXIgY2xvY2tzPSQodGhpcyk7XHJcbiAgICAgIHZhciBub3c9bmV3IERhdGUoKTtcclxuICAgICAgZm9yKHZhciBpPTA7aTxjbG9ja3MubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgdmFyIGM9Y2xvY2tzLmVxKGkpO1xyXG4gICAgICAgIHZhciBlbmQ9bmV3IERhdGUoYy5kYXRhKCdlbmQnKS5yZXBsYWNlKC8tL2csIFwiL1wiKSk7XHJcbiAgICAgICAgdmFyIGQ9KGVuZC5nZXRUaW1lKCktbm93LmdldFRpbWUoKSkvIDEwMDA7XHJcblxyXG4gICAgICAgIC8v0LXRgdC70Lgg0YHRgNC+0Log0L/RgNC+0YjQtdC7XHJcbiAgICAgICAgaWYoZDw9MCl7XHJcbiAgICAgICAgICBjLnRleHQoJ9Cf0YDQvtC80L7QutC+0LQg0LjRgdGC0LXQuicpO1xyXG4gICAgICAgICAgYy5hZGRDbGFzcygnY2xvY2stZXhwaXJlZCcpO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL9C10YHQu9C4INGB0YDQvtC6INCx0L7Qu9C10LUgMzAg0LTQvdC10LlcclxuICAgICAgICBpZihkPjMwKjYwKjYwKjI0KXtcclxuICAgICAgICAgIGMuaHRtbCgn0J7RgdGC0LDQu9C+0YHRjDogPHNwYW4+0LHQvtC70LXQtSAzMCDQtNC90LXQuTwvc3Bhbj4nKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHM9ZCAlIDYwO1xyXG4gICAgICAgIGQ9KGQtcykvNjA7XHJcbiAgICAgICAgdmFyIG09ZCAlIDYwO1xyXG4gICAgICAgIGQ9KGQtbSkvNjA7XHJcbiAgICAgICAgdmFyIGg9ZCAlIDI0O1xyXG4gICAgICAgIGQ9KGQtaCkvMjQ7XHJcblxyXG4gICAgICAgIHZhciBzdHI9Zmlyc3RaZXJvKGgpK1wiOlwiK2ZpcnN0WmVybyhtKStcIjpcIitmaXJzdFplcm8ocyk7XHJcbiAgICAgICAgaWYoZD4wKXtcclxuICAgICAgICAgIHN0cj1kK1wiIFwiK2RlY2xPZk51bShkLCBbJ9C00LXQvdGMJywgJ9C00L3RjycsICfQtNC90LXQuSddKStcIiAgXCIrc3RyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjLmh0bWwoXCLQntGB0YLQsNC70L7RgdGMOiA8c3Bhbj5cIitzdHIrXCI8L3NwYW4+XCIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SW50ZXJ2YWwodXBkYXRlQ2xvY2suYmluZChjbG9ja3MpLDEwMDApO1xyXG4gICAgdXBkYXRlQ2xvY2suYmluZChjbG9ja3MpKCk7XHJcbiAgfVxyXG5cclxufSk7IiwidmFyIGNhdGFsb2dUeXBlU3dpdGNoZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYXRhbG9nID0gJCgnLmNhdGFsb2dfbGlzdCcpO1xyXG4gICAgaWYoY2F0YWxvZy5sZW5ndGg9PTApcmV0dXJuO1xyXG5cclxuICAgICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5maW5kKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24nKS5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xyXG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcclxuICAgICAgICBpZiAoY2F0YWxvZykge1xyXG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1saXN0JykpIHtcclxuICAgICAgICAgICAgICAgIGNhdGFsb2cucmVtb3ZlQ2xhc3MoJ25hcnJvdycpO1xyXG4gICAgICAgICAgICAgICAgc2V0Q29va2llKCdjb3Vwb25zX3ZpZXcnLCcnKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdjYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLW5hcnJvdycpKSB7XHJcbiAgICAgICAgICAgICAgICBjYXRhbG9nLmFkZENsYXNzKCduYXJyb3cnKTtcclxuICAgICAgICAgICAgICAgIHNldENvb2tpZSgnY291cG9uc192aWV3JywnbmFycm93Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZihnZXRDb29raWUoJ2NvdXBvbnNfdmlldycpPT0nbmFycm93JyAmJiAhY2F0YWxvZy5oYXNDbGFzcygnbmFycm93X29mZicpKXtcclxuICAgICAgICBjYXRhbG9nLmFkZENsYXNzKCduYXJyb3cnKTtcclxuICAgICAgICAkKCcuY2F0YWxvZy1zdG9yZXNfc3dpdGNoZXItaXRlbS1idXR0b24tdHlwZS1uYXJyb3cnKS5hZGRDbGFzcygnY2hlY2tlZCcpO1xyXG4gICAgICAgICQoJy5jYXRhbG9nLXN0b3Jlc19zd2l0Y2hlci1pdGVtLWJ1dHRvbi10eXBlLWxpc3QnKS5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xyXG4gICAgfVxyXG59KCk7IiwiJChmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCcuc2Qtc2VsZWN0LXNlbGVjdGVkJykuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcclxuICAgICAgICB2YXIgZHJvcEJsb2NrID0gJChwYXJlbnQpLmZpbmQoJy5zZC1zZWxlY3QtZHJvcCcpO1xyXG5cclxuICAgICAgICBpZiggZHJvcEJsb2NrLmlzKCc6aGlkZGVuJykgKSB7XHJcbiAgICAgICAgICAgIGRyb3BCbG9jay5zbGlkZURvd24oKTtcclxuXHJcbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFwYXJlbnQuaGFzQ2xhc3MoJ2xpbmtlZCcpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnNkLXNlbGVjdC1kcm9wJykuZmluZCgnYScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0UmVzdWx0ID0gJCh0aGlzKS5odG1sKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQocGFyZW50KS5maW5kKCdpbnB1dCcpLnZhbChzZWxlY3RSZXN1bHQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHBhcmVudCkuZmluZCgnLnNkLXNlbGVjdC1zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5odG1sKHNlbGVjdFJlc3VsdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRyb3BCbG9jay5zbGlkZVVwKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgZHJvcEJsb2NrLnNsaWRlVXAoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG59KTsiLCJzZWFyY2ggPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBvcGVuQXV0b2NvbXBsZXRlO1xyXG5cclxuICAgICQoJy5zZWFyY2gtZm9ybS1pbnB1dCcpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgICAgIHZhciBxdWVyeSA9ICR0aGlzLnZhbCgpO1xyXG4gICAgICAgIHZhciBkYXRhID0gJHRoaXMuY2xvc2VzdCgnZm9ybScpLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgIHZhciBhdXRvY29tcGxldGUgPSAkdGhpcy5jbG9zZXN0KCcuc3RvcmVzX3NlYXJjaCcpLmZpbmQoJy5hdXRvY29tcGxldGUtd3JhcCcpOy8vICQoJyNhdXRvY29tcGxldGUnKSxcclxuICAgICAgICB2YXIgYXV0b2NvbXBsZXRlTGlzdCA9ICQoYXV0b2NvbXBsZXRlKS5maW5kKCd1bCcpO1xyXG4gICAgICAgIG9wZW5BdXRvY29tcGxldGUgID0gYXV0b2NvbXBsZXRlO1xyXG4gICAgICAgIGlmIChxdWVyeS5sZW5ndGg+MSkge1xyXG4gICAgICAgICAgICB1cmw9JHRoaXMuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicpfHwnL3NlYXJjaCc7XHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gJzxhIGNsYXNzPVwiYXV0b2NvbXBsZXRlX2xpbmtcIiBocmVmPVwiJytpdGVtLmRhdGEucm91dGUrJ1wiJysnPicraXRlbS52YWx1ZStpdGVtLmNhc2hiYWNrKyc8L2E+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpLmlubmVySFRNTCA9IGh0bWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGVMaXN0KS5hcHBlbmQobGkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlSW4oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZSkuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xyXG4gICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KS5vbignZm9jdXNvdXQnLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGlmICghJChlLnJlbGF0ZWRUYXJnZXQpLmhhc0NsYXNzKCdhdXRvY29tcGxldGVfbGluaycpKSB7XHJcbiAgICAgICAgICAgIC8vJCgnI2F1dG9jb21wbGV0ZScpLmhpZGUoKTtcclxuICAgICAgICAgICAgJChvcGVuQXV0b2NvbXBsZXRlKS5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5cclxufSgpO1xyXG4iLCIoZnVuY3Rpb24oKXtcclxuXHJcbiAgICAkKCcuY291cG9ucy1saXN0X2l0ZW0tY29udGVudC1nb3RvLXByb21vY29kZS1saW5rJykuY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgdmFyIGV4cGlyZWQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5jb3Vwb25zLWxpc3RfaXRlbScpLmZpbmQoJy5jbG9jay1leHBpcmVkJyk7XHJcbiAgICAgICAgaWYgKGV4cGlyZWQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgdGl0bGUgPSAn0Jog0YHQvtC20LDQu9C10L3QuNGOLCDRgdGA0L7QuiDQtNC10LnRgdGC0LLQuNGPINC00LDQvdC90L7Qs9C+INC/0YDQvtC80L7QutC+0LTQsCDQuNGB0YLQtdC6Lic7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gJ9CS0YHQtSDQtNC10LnRgdGC0LLRg9GO0YnQuNC1INC/0YDQvtC80L7QutC+0LTRiyDQstGLINC80L7QttC10YLQtSDQv9C+0YHQvNC+0YLRgNC10YLRjCA8YSBocmVmPVwiL2NvdXBvbnNcIj7Qt9C00LXRgdGMPC9hPic7XHJcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XHJcbiAgICAgICAgICAgICAgICAndGl0bGUnOiB0aXRsZSxcclxuICAgICAgICAgICAgICAgICdxdWVzdGlvbic6IG1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICAnYnV0dG9uWWVzJzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAnYnV0dG9uTm8nOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICdub3R5ZnlfY2xhc3MnOiAnbm90aWZ5X2JveC1hbGVydCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJCgnLmFjY291bnQtd2l0aGRyYXctbWV0aG9kc19pdGVtLW9wdGlvbicpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgb3B0aW9uID0gJCh0aGlzKS5kYXRhKCdvcHRpb24tcHJvY2VzcycpLFxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlciA9ICcnO1xyXG4gICAgICAgIHN3aXRjaChvcHRpb24pIHtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YHRh9GR0YLQsFwiO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCBSLdC60L7RiNC10LvRjNC60LBcIjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YLQtdC70LXRhNC+0L3QsFwiO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDQutCw0YDRgtGLXCI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSBlbWFpbCDQsNC00YDQtdGBXCI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINGC0LXQu9C10YTQvtC90LBcIjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAkKFwiI3VzZXJzd2l0aGRyYXctYmlsbFwiKS5hdHRyKFwicGxhY2Vob2xkZXJcIiwgcGxhY2Vob2xkZXIpO1xyXG4gICAgICAgICQoJyN1c2Vyc3dpdGhkcmF3LXByb2Nlc3NfaWQnKS52YWwob3B0aW9uKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBmb3JtcyA9ICQoJy5hamF4LWFjdGlvbi1mb3JtJyk7XHJcbiAgICBjb25zb2xlLmxvZyhmb3Jtcyk7XHJcbiAgICBhamF4Rm9ybShmb3Jtcyk7XHJcbn0pKCk7IiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbigpIHtcclxuICB2YXIgY29udGVpbmVyO1xyXG4gIHZhciBtb3VzZU92ZXIgPSAwO1xyXG4gIHZhciB0aW1lckNsZWFyQWxsID0gbnVsbDtcclxuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xyXG4gIHZhciB0aW1lID0gMTAwMDA7XHJcblxyXG4gIHZhciBub3RpZmljYXRpb25fYm94ID1mYWxzZTtcclxuICB2YXIgaXNfaW5pdD1mYWxzZTtcclxuICB2YXIgY29uZmlybV9vcHQ9e1xyXG4gICAgdGl0bGU6XCLQo9C00LDQu9C10L3QuNC1XCIsXHJcbiAgICBxdWVzdGlvbjpcItCS0Ysg0LTQtdC50YHRgtCy0LjRgtC10LvRjNC90L4g0YXQvtGC0LjRgtC1INGD0LTQsNC70LjRgtGMP1wiLFxyXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxyXG4gICAgYnV0dG9uTm86XCLQndC10YJcIixcclxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxyXG4gICAgY2FsbGJhY2tObzpmYWxzZSxcclxuICAgIG9iajpmYWxzZSxcclxuICAgIGJ1dHRvblRhZzonZGl2JyxcclxuICAgIGJ1dHRvblllc0RvcDonJyxcclxuICAgIGJ1dHRvbk5vRG9wOicnLFxyXG4gIH07XHJcbiAgdmFyIGFsZXJ0X29wdD17XHJcbiAgICB0aXRsZTpcIlwiLFxyXG4gICAgcXVlc3Rpb246XCLQodC+0L7QsdGJ0LXQvdC40LVcIixcclxuICAgIGJ1dHRvblllczpcItCU0LBcIixcclxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxyXG4gICAgYnV0dG9uVGFnOidkaXYnLFxyXG4gICAgb2JqOmZhbHNlLFxyXG4gIH07XHJcblxyXG5cclxuICBmdW5jdGlvbiBpbml0KCl7XHJcbiAgICBpc19pbml0PXRydWU7XHJcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcclxuXHJcbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jb250cm9sJyxjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsY2xvc2VNb2RhbEZvbik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCl7XHJcbiAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICAkKCcubm90aWZpY2F0aW9uX2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKCcnKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xvc2VNb2RhbEZvbihlKXtcclxuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcbiAgICBpZih0YXJnZXQuY2xhc3NOYW1lPT1cIm5vdGlmaWNhdGlvbl9ib3hcIil7XHJcbiAgICAgIGNsb3NlTW9kYWwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHZhciBfc2V0VXBMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcclxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm5vdGlmaWNhdGlvbl9jbG9zZScsIF9jbG9zZVBvcHVwKTtcclxuICAgICQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkVudGVyKTtcclxuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcclxuICB9O1xyXG5cclxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGlmICh0aW1lckNsZWFyQWxsIT1udWxsKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lckNsZWFyQWxsKTtcclxuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbihpKXtcclxuICAgICAgdmFyIG9wdGlvbj0kKHRoaXMpLmRhdGEoJ29wdGlvbicpO1xyXG4gICAgICBpZihvcHRpb24udGltZXIpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAxO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24oaSl7XHJcbiAgICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICAgIHZhciBvcHRpb249JHRoaXMuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmKG9wdGlvbi50aW1lPjApIHtcclxuICAgICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQob3B0aW9uLmNsb3NlKSwgb3B0aW9uLnRpbWUgLSAxNTAwICsgMTAwICogaSk7XHJcbiAgICAgICAgJHRoaXMuZGF0YSgnb3B0aW9uJyxvcHRpb24pXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgbW91c2VPdmVyID0gMDtcclxuICB9O1xyXG5cclxuICB2YXIgX2Nsb3NlUG9wdXAgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbigpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcclxuICAgIH0pO1xyXG4gICAgJHRoaXMuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9oaWRlJylcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBhbGVydChkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoYWxlcnRfb3B0LGRhdGEpO1xyXG5cclxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcclxuXHJcbiAgICBub3R5ZnlfY2xhc3M9J25vdGlmeV9ib3ggJztcclxuICAgIGlmKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcys9ZGF0YS5ub3R5ZnlfY2xhc3M7XHJcblxyXG4gICAgYm94X2h0bWw9JzxkaXYgY2xhc3M9XCInK25vdHlmeV9jbGFzcysnXCI+JztcclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcclxuICAgIGJveF9odG1sKz0nPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xyXG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8JytkYXRhLmJ1dHRvblRhZysnIGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIiAnK2RhdGEuYnV0dG9uWWVzRG9wKyc+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvJytkYXRhLmJ1dHRvblRhZysnPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8JytkYXRhLmJ1dHRvblRhZysnIGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiICcrZGF0YS5idXR0b25Ob0RvcCsnPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvJytkYXRhLmJ1dHRvblRhZysnPic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfTtcclxuXHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xyXG5cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LDEwMClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbmZpcm0oZGF0YSl7XHJcbiAgICBpZighZGF0YSlkYXRhPXt9O1xyXG4gICAgZGF0YT1vYmplY3RzKGNvbmZpcm1fb3B0LGRhdGEpO1xyXG5cclxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcclxuXHJcbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3hcIj4nO1xyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnRpdGxlO1xyXG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xyXG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xyXG5cclxuICAgIGlmKGRhdGEuY2FsbGJhY2tZZXMhPWZhbHNlKXtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tZZXMuYmluZChkYXRhLm9iaikpO1xyXG4gICAgfVxyXG4gICAgaWYoZGF0YS5jYWxsYmFja05vIT1mYWxzZSl7XHJcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgfSwxMDApXHJcblxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICB2YXIgb3B0aW9uID0ge3RpbWUgOiAoZGF0YS50aW1lfHxkYXRhLnRpbWU9PT0wKT9kYXRhLnRpbWU6dGltZX07XHJcbiAgICBpZiAoIWNvbnRlaW5lcikge1xyXG4gICAgICBjb250ZWluZXIgPSAkKCc8dWwvPicsIHtcclxuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XHJcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xyXG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9pdGVtJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSl7XHJcbiAgICAgIGxpLmFkZENsYXNzKCdub3RpZmljYXRpb25faXRlbS0nICsgZGF0YS50eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2xvc2U9JCgnPHNwYW4vPicse1xyXG4gICAgICBjbGFzczonbm90aWZpY2F0aW9uX2Nsb3NlJ1xyXG4gICAgfSk7XHJcbiAgICBvcHRpb24uY2xvc2U9Y2xvc2U7XHJcbiAgICBsaS5hcHBlbmQoY2xvc2UpO1xyXG5cclxuICAgIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XHJcbiAgICAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XHJcbiAgICAgIHZhciB0aXRsZSA9ICQoJzxoNS8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRleHQ9ICQoJzxkaXYvPicse1xyXG4gICAgICBjbGFzczpcIm5vdGlmaWNhdGlvbl90ZXh0XCJcclxuICAgIH0pO1xyXG4gICAgdGV4dC5odG1sKGRhdGEubWVzc2FnZSk7XHJcblxyXG4gICAgaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcclxuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcclxuICAgICAgfSk7XHJcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xyXG4gICAgICB2YXIgd3JhcCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgICBjbGFzczogXCJ3cmFwXCJcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB3cmFwLmFwcGVuZChpbWcpO1xyXG4gICAgICB3cmFwLmFwcGVuZCh0ZXh0KTtcclxuICAgICAgY29udGVudC5hcHBlbmQod3JhcCk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgY29udGVudC5hcHBlbmQodGV4dCk7XHJcbiAgICB9XHJcbiAgICBsaS5hcHBlbmQoY29udGVudCk7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xyXG4gICAgLy8gICB2YXIgdGl0bGUgPSAkKCc8cC8+Jywge1xyXG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXHJcbiAgICAvLyAgIH0pO1xyXG4gICAgLy8gICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xyXG4gICAgLy8gICBsaS5hcHBlbmQodGl0bGUpO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuICAgIC8vIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XHJcbiAgICAvLyAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXHJcbiAgICAvLyAgIH0pO1xyXG4gICAgLy8gICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcclxuICAgIC8vICAgbGkuYXBwZW5kKGltZyk7XHJcbiAgICAvLyB9XHJcbiAgICAvL1xyXG4gICAgLy8gdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcclxuICAgIC8vICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXHJcbiAgICAvLyB9KTtcclxuICAgIC8vIGNvbnRlbnQuaHRtbChkYXRhLm1lc3NhZ2UpO1xyXG4gICAgLy9cclxuICAgIC8vIGxpLmFwcGVuZChjb250ZW50KTtcclxuICAgIC8vXHJcbiAgICAgY29udGVpbmVyLmFwcGVuZChsaSk7XHJcblxyXG4gICAgaWYob3B0aW9uLnRpbWU+MCl7XHJcbiAgICAgIG9wdGlvbi50aW1lcj1zZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQoY2xvc2UpLCBvcHRpb24udGltZSk7XHJcbiAgICB9XHJcbiAgICBsaS5kYXRhKCdvcHRpb24nLG9wdGlvbilcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBhbGVydDogYWxlcnQsXHJcbiAgICBjb25maXJtOiBjb25maXJtLFxyXG4gICAgbm90aWZpOiBub3RpZmksXHJcbiAgfTtcclxuXHJcbn0pKCk7XHJcblxyXG5cclxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKXtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXM9JCh0aGlzKTtcclxuICBlbD0kKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XHJcbiAgZGF0YT1lbC5kYXRhKCk7XHJcblxyXG4gIGRhdGEucXVlc3Rpb249ZWwuaHRtbCgpO1xyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7XHJcblxyXG5cclxuJCgnLmRpc2FibGVkJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSl7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzPSQodGhpcyk7XHJcbiAgZGF0YT0kdGhpcy5kYXRhKCk7XHJcbiAgaWYoZGF0YVsnYnV0dG9uX3llcyddKWRhdGFbJ2J1dHRvblllcyddPWRhdGFbJ2J1dHRvbl95ZXMnXVxyXG5cclxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcbn0pOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywnLm1vZGFsc19vcGVuJyxmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XHJcblxyXG4gICAgICAgIC8v0L/RgNC4INC+0YLQutGA0YvRgtC40Lgg0YTQvtGA0LzRiyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4INC30LDQutGA0YvRgtGMLCDQtdGB0LvQuCDQvtGC0YDRi9GC0L4gLSDQv9C+0L/QsNC/INC40YHQv9C+0LvRjNC30L7QstCw0L3QuNGPINC60YPQv9C+0L3QsCDQsdC10Lcg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuFxyXG4gICAgICAgIHZhciBwb3B1cCA9ICQoXCJhW2hyZWY9JyNzaG93cHJvbW9jb2RlLW5vcmVnaXN0ZXInXVwiKS5kYXRhKCdwb3B1cCcpO1xyXG4gICAgICAgIGlmIChwb3B1cCkge1xyXG4gICAgICAgICAgICBwb3B1cC5jbG9zZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBvcHVwID0gJCgnZGl2LnBvcHVwX2NvbnQsIGRpdi5wb3B1cF9iYWNrJyk7XHJcbiAgICAgICAgICAgIGlmIChwb3B1cCkge1xyXG4gICAgICAgICAgICAgICAgcG9wdXAuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBocmVmPXRoaXMuaHJlZi5zcGxpdCgnIycpO1xyXG4gICAgICAgIGhyZWY9aHJlZltocmVmLmxlbmd0aC0xXTtcclxuXHJcbiAgICAgICAgZGF0YT17XHJcbiAgICAgICAgICAgIGJ1dHRvblllczpmYWxzZSxcclxuICAgICAgICAgICAgbm90eWZ5X2NsYXNzOlwibG9hZGluZyBcIisoaHJlZi5pbmRleE9mKCd2aWRlbycpPT09MD8nbW9kYWxzLWZ1bGxfc2NyZWVuJzonbm90aWZ5X3doaXRlJyksXHJcbiAgICAgICAgICAgIHF1ZXN0aW9uOicnXHJcbiAgICAgICAgfTtcclxuICAgICAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcblxyXG4gICAgICAgICQuZ2V0KCcvJytocmVmLGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAkKCcubm90aWZ5X2JveCcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcclxuICAgICAgICAgICAgYWpheEZvcm0oJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykpO1xyXG4gICAgICAgIH0sJ2pzb24nKTtcclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KVxyXG59KCkpO1xyXG4iLCIkKCcuZm9vdGVyLW1lbnUtdGl0bGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICR0aGlzPSQodGhpcyk7XHJcbiAgaWYoJHRoaXMuaGFzQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKSl7XHJcbiAgICAkdGhpcy5yZW1vdmVDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpXHJcbiAgfWVsc2V7XHJcbiAgICAkKCcuZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpO1xyXG4gIH1cclxuXHJcbn0pOyIsIiQoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIHN0YXJOb21pbmF0aW9uKGluZGV4KSB7XHJcbiAgICB2YXIgc3RhcnMgPSAkKFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiKTtcclxuICAgIHN0YXJzLmFkZENsYXNzKFwicmF0aW5nLXN0YXItb3BlblwiKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5kZXg7IGkrKykge1xyXG4gICAgICBzdGFycy5lcShpKS5yZW1vdmVDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkKGRvY3VtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIHN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xyXG4gIH0pLm9uKFwibW91c2VsZWF2ZVwiLCBcIi5yYXRpbmctd3JhcHBlclwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoKSk7XHJcbiAgfSkub24oXCJjbGlja1wiLCBcIi5yYXRpbmctd3JhcHBlciAucmF0aW5nLXN0YXJcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIHN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xyXG5cclxuICAgICQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCQodGhpcykuaW5kZXgoKSArIDEpO1xyXG4gIH0pO1xyXG59KTsiLCIvL9C40LfQsdGA0LDQvdC90L7QtVxyXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICQoXCIuc2hvcHMgLmZhdm9yaXRlLWxpbmtcIikub24oJ2NsaWNrJyxmdW5jdGlvbihlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHR5cGUgPSBzZWxmLmF0dHIoXCJkYXRhLXN0YXRlXCIpLFxyXG4gICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmF0dHIoXCJkYXRhLWFmZmlsaWF0ZS1pZFwiKTtcclxuICAgIGlmIChzZWxmLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgc2VsZi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuXHJcbiAgICAvKmlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICBzZWxmLmZpbmQoXCIuaXRlbV9pY29uXCIpLnJlbW92ZUNsYXNzKFwibXV0ZWRcIik7XHJcbiAgICB9Ki9cclxuXHJcbiAgICAkLnBvc3QoXCIvYWNjb3VudC9mYXZvcml0ZXNcIix7XHJcbiAgICAgIFwidHlwZVwiIDogdHlwZSAsXHJcbiAgICAgIFwiYWZmaWxpYXRlX2lkXCI6IGFmZmlsaWF0ZV9pZFxyXG4gICAgfSxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICBpZihkYXRhLmVycm9yKXtcclxuICAgICAgICBzZWxmLmZpbmQoJ3N2ZycpLnJlbW92ZUNsYXNzKFwic3BpblwiKTtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOmRhdGEuZXJyb3IsdHlwZTonZXJyJywndGl0bGUnOihkYXRhLnRpdGxlP2RhdGEudGl0bGU6ZmFsc2UpfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICBtZXNzYWdlOmRhdGEubXNnLFxyXG4gICAgICAgIHR5cGU6J3N1Y2Nlc3MnLFxyXG4gICAgICAgICd0aXRsZSc6KGRhdGEudGl0bGU/ZGF0YS50aXRsZTpmYWxzZSlcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCIuaXRlbV9pY29uXCIpLmFkZENsYXNzKFwic3ZnLW5vLWZpbGxcIik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYuYXR0cih7XHJcbiAgICAgICAgXCJkYXRhLXN0YXRlXCI6IGRhdGFbXCJkYXRhLXN0YXRlXCJdLFxyXG4gICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiOiBkYXRhWydkYXRhLW9yaWdpbmFsLXRpdGxlJ11cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluIHN2Zy1uby1maWxsXCIpO1xyXG4gICAgICB9IGVsc2UgaWYodHlwZSA9PSBcImRlbGV0ZVwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwic3ZnXCIpLnJlbW92ZUNsYXNzKFwic3BpblwiKS5hZGRDbGFzcyhcInN2Zy1uby1maWxsXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSwnanNvbicpLml0ZW1faWNvbmlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOlwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgK1xyXG4gICAgICBcIiDQv9GA0L7QuNC30LLQtdC00ZHQvdC90L7QtSDQtNC10LnRgdGC0LLQuNC1INC90LXQstC+0LfQvNC+0LbQvdC+LiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1LlwiICtcclxuICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIix0eXBlOidlcnInfSk7XHJcblxyXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCJzdmdcIikuYWRkQ2xhc3MoXCJzdmctbm8tZmlsbFwiKTtcclxuICAgICAgfVxyXG4gICAgICBzZWxmLmZpbmQoXCJzdmdcIikucmVtb3ZlQ2xhc3MoXCJzcGluXCIpO1xyXG4gICAgfSlcclxuICB9KTtcclxufSk7IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcclxuICAkKCcuc2Nyb2xsX3RvJykuY2xpY2soIGZ1bmN0aW9uKGUpeyAvLyDQu9C+0LLQuNC8INC60LvQuNC6INC/0L4g0YHRgdGL0LvQutC1INGBINC60LvQsNGB0YHQvtC8IGdvX3RvXHJcbiAgICB2YXIgc2Nyb2xsX2VsID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7IC8vINCy0L7Qt9GM0LzQtdC8INGB0L7QtNC10YDQttC40LzQvtC1INCw0YLRgNC40LHRg9GC0LAgaHJlZiwg0LTQvtC70LbQtdC9INCx0YvRgtGMINGB0LXQu9C10LrRgtC+0YDQvtC8LCDRgi7QtS4g0L3QsNC/0YDQuNC80LXRgCDQvdCw0YfQuNC90LDRgtGM0YHRjyDRgSAjINC40LvQuCAuXHJcbiAgICBzY3JvbGxfZWw9JChzY3JvbGxfZWwpO1xyXG4gICAgaWYgKHNjcm9sbF9lbC5sZW5ndGggIT0gMCkgeyAvLyDQv9GA0L7QstC10YDQuNC8INGB0YPRidC10YHRgtCy0L7QstCw0L3QuNC1INGN0LvQtdC80LXQvdGC0LAg0YfRgtC+0LHRiyDQuNC30LHQtdC20LDRgtGMINC+0YjQuNCx0LrQuFxyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBzY3JvbGxfZWwub2Zmc2V0KCkudG9wLSQoJyNoZWFkZXI+KicpLmVxKDApLmhlaWdodCgpLTUwIH0sIDUwMCk7IC8vINCw0L3QuNC80LjRgNGD0LXQvCDRgdC60YDQvtC+0LvQuNC90LMg0Log0Y3Qu9C10LzQtdC90YLRgyBzY3JvbGxfZWxcclxuICAgICAgaWYoc2Nyb2xsX2VsLmhhc0NsYXNzKCdhY2NvcmRpb24nKSAmJiAhc2Nyb2xsX2VsLmhhc0NsYXNzKCdvcGVuJykpe1xyXG4gICAgICAgIHNjcm9sbF9lbC5maW5kKCcuYWNjb3JkaW9uLWNvbnRyb2wnKS5jbGljaygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7IC8vINCy0YvQutC70Y7Rh9Cw0LXQvCDRgdGC0LDQvdC00LDRgNGC0L3QvtC1INC00LXQudGB0YLQstC40LVcclxuICB9KTtcclxufSk7IiwiJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAkKFwiYm9keVwiKS5vbignY2xpY2snLCcuc2V0X2NsaXBib2FyZCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgY29weVRvQ2xpcGJvYXJkKCR0aGlzLmRhdGEoJ2NsaXBib2FyZCcpLCR0aGlzLmRhdGEoJ2NsaXBib2FyZC1ub3RpZnknKSk7XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGNvcHlUb0NsaXBib2FyZChjb2RlLG1zZykge1xyXG4gICAgdmFyICR0ZW1wID0gJChcIjxpbnB1dD5cIik7XHJcbiAgICAkKFwiYm9keVwiKS5hcHBlbmQoJHRlbXApO1xyXG4gICAgJHRlbXAudmFsKGNvZGUpLnNlbGVjdCgpO1xyXG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJjb3B5XCIpO1xyXG4gICAgJHRlbXAucmVtb3ZlKCk7XHJcblxyXG4gICAgaWYoIW1zZyl7XHJcbiAgICAgIG1zZz1cItCU0LDQvdC90YvQtSDRg9GB0L/QtdGI0L3QviDRgdC60L7Qv9C40YDQvtCy0LDQvdGLINCyINCx0YPRhNC10YAg0L7QsdC80LXQvdCwXCI7XHJcbiAgICB9XHJcbiAgICBub3RpZmljYXRpb24ubm90aWZpKHsndHlwZSc6J2luZm8nLCdtZXNzYWdlJzptc2d9KVxyXG4gIH1cclxufSk7IiwiLy/RgdC60LDRh9C40LLQsNC90LjQtSDQutCw0YDRgtC40L3QvtC6XHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCkge1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGltZyA9IGRhdGEuaW1nO1xyXG4gICAgaW1nLndyYXAoJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPjwvZGl2PicpO1xyXG4gICAgdmFyIHdyYXAgPSBpbWcucGFyZW50KCk7XHJcbiAgICAkKCdib2R5JykuYXBwZW5kKGRhdGEuZWwpO1xyXG4gICAgc2l6ZSA9IGRhdGEuZWwud2lkdGgoKSArIFwieFwiICsgZGF0YS5lbC5oZWlnaHQoKTtcclxuICAgIGRhdGEuZWwucmVtb3ZlKCk7XHJcbiAgICB3cmFwLmFwcGVuZCgnPHNwYW4+JyArIHNpemUgKyAnPC9zcGFuPiA8YSBocmVmPVwiJyArIGRhdGEuc3JjICsgJ1wiIGRvd25sb2FkPtCh0LrQsNGH0LDRgtGMPC9hPicpXHJcbiAgfVxyXG5cclxuICB2YXIgaW1ncyA9ICQoJy5kb3dubG9hZHNfaW1nIGltZycpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGltZyA9IGltZ3MuZXEoaSk7XHJcbiAgICB2YXIgc3JjID0gaW1nLmF0dHIoJ3NyYycpO1xyXG4gICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XHJcbiAgICAgIHNyYzogc3JjXHJcbiAgICB9KTtcclxuICAgIGRhdGEgPSB7XHJcbiAgICAgIHNyYzogc3JjLFxyXG4gICAgICBpbWc6IGltZyxcclxuICAgICAgZWw6IGltYWdlXHJcbiAgICB9O1xyXG4gICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcclxuICB9XHJcbn0pKCk7XHJcblxyXG5cclxuLy/Rh9GC0L4g0LEg0LjRhNGA0LXQudC80Ysg0Lgg0LrQsNGA0YLQuNC90LrQuCDQvdC1INCy0YvQu9Cw0LfQuNC70LhcclxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAvKm1fdyA9ICQoJy50ZXh0LWNvbnRlbnQnKS53aWR0aCgpXHJcbiAgIGlmIChtX3cgPCA1MCltX3cgPSBzY3JlZW4ud2lkdGggLSA0MCovXHJcbiAgdmFyIG13PXNjcmVlbi53aWR0aC00MDtcclxuXHJcbiAgZnVuY3Rpb24gb3B0aW1hc2UoZWwpe1xyXG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudCgpO1xyXG4gICAgaWYocGFyZW50Lmxlbmd0aD09MCB8fCBwYXJlbnRbMF0udGFnTmFtZT09XCJBXCIpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBtX3cgPSBwYXJlbnQud2lkdGgoKS0zMDtcclxuICAgIHZhciB3PWVsLndpZHRoKCk7XHJcbiAgICBlbC53aWR0aCgnYXV0bycpO1xyXG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJTUdcIiAmJiB3PmVsLndpZHRoKCkpdz1lbC53aWR0aCgpO1xyXG5cclxuICAgIGlmIChtdz41MCAmJiBtX3cgPiBtdyltX3cgPSBtdztcclxuICAgIGlmICh3Pm1fdyA+IG1fdykge1xyXG4gICAgICBpZihlbFswXS50YWdOYW1lPT1cIklGUkFNRVwiKXtcclxuICAgICAgICBrID0gdyAvIG1fdztcclxuICAgICAgICBlbC5oZWlnaHQoZWwuaGVpZ2h0KCkgLyBrKTtcclxuICAgICAgfVxyXG4gICAgICBlbC53aWR0aChtX3cpXHJcbiAgICB9ZWxzZXtcclxuICAgICAgZWwud2lkdGgodyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcclxuICAgIHZhciBlbD0kKHRoaXMpO1xyXG4gICAgb3B0aW1hc2UoZWwpO1xyXG4gIH1cclxuXHJcbiAgdmFyIHAgPSAkKCcuY29udGVudC13cmFwIGltZywuY29udGVudC13cmFwIGlmcmFtZScpO1xyXG4gICQoJy5jb250ZW50LXdyYXAgaW1nJykuaGVpZ2h0KCdhdXRvJyk7XHJcbiAgLy8kKCcuY29udGFpbmVyIGltZycpLndpZHRoKCdhdXRvJyk7XHJcbiAgZm9yIChpID0gMDsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgIGVsID0gcC5lcShpKTtcclxuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpIHtcclxuICAgICAgb3B0aW1hc2UoZWwpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHZhciBzcmM9ZWwuYXR0cignc3JjJyk7XHJcbiAgICAgIGltYWdlID0gJCgnPGltZy8+Jywge1xyXG4gICAgICAgIHNyYzogc3JjXHJcbiAgICAgIH0pO1xyXG4gICAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGVsKSk7XHJcblxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG5cclxuLy/Qn9GA0L7QstC10YDQutCwINCx0LjRgtGLINC60LDRgNGC0LjQvdC+0LouXHJcblxyXG4vLyAhISEhISFcclxuLy8g0J3Rg9C20L3QviDQv9GA0L7QstC10YDQuNGC0YxcclxuLy8gISEhISEhXHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICBkYXRhPXRoaXM7XHJcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcclxuICAgICAgZGF0YS5pbWcuYXR0cignc3JjJywgZGF0YS5zcmMpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGRhdGEuaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJytkYXRhLnNyYysnKScpO1xyXG4gICAgICBkYXRhLmltZy5yZW1vdmVDbGFzcygnbm9fYXZhJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL9GC0LXRgdGCINC70L7Qs9C+INC80LDQs9Cw0LfQuNC90LBcclxuICBpbWdzPSQoJ3NlY3Rpb246bm90KC5uYXZpZ2F0aW9uKScpLmZpbmQoJy5sb2dvIGltZycpO1xyXG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XHJcbiAgICBpbWc9aW1ncy5lcShpKTtcclxuICAgIHNyYz1pbWcuYXR0cignc3JjJyk7XHJcbiAgICBpbWcuYXR0cignc3JjJywnL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZycpO1xyXG4gICAgZGF0YT17XHJcbiAgICAgIHNyYzpzcmMsXHJcbiAgICAgIGltZzppbWcsXHJcbiAgICAgIHR5cGU6MCAvLyDQtNC70Y8gaW1nW3NyY11cclxuICAgIH07XHJcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcclxuICAgICAgc3JjOnNyY1xyXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxyXG4gIH1cclxuXHJcbiAgLy/RgtC10YHRgiDQsNCy0LDRgtCw0YDQvtC6INCyINC60L7QvNC10L3RgtCw0YDQuNGP0YVcclxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvJyk7XHJcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcclxuICAgIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgaWYoaW1nLmhhc0NsYXNzKCdub19hdmEnKSl7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xyXG4gICAgc3JjPXNyYy5yZXBsYWNlKCd1cmwoXCInLCcnKTtcclxuICAgIHNyYz1zcmMucmVwbGFjZSgnXCIpJywnJyk7XHJcbiAgICBpbWcuYWRkQ2xhc3MoJ25vX2F2YScpO1xyXG5cclxuICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoL2ltYWdlcy9ub19hdmEucG5nKScpO1xyXG4gICAgZGF0YT17XHJcbiAgICAgIHNyYzpzcmMsXHJcbiAgICAgIGltZzppbWcsXHJcbiAgICAgIHR5cGU6MSAvLyDQtNC70Y8g0YTQvtC90L7QstGL0YUg0LrQsNGA0YLQuNC90L7QulxyXG4gICAgfTtcclxuICAgIGltYWdlPSQoJzxpbWcvPicse1xyXG4gICAgICBzcmM6c3JjXHJcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXHJcbiAgfVxyXG59KTsiLCIvL9C10YHQu9C4INC+0YLQutGA0YvRgtC+INC60LDQuiDQtNC+0YfQtdGA0L3QtdC1XHJcbihmdW5jdGlvbigpe1xyXG4gIGlmKCF3aW5kb3cub3BlbmVyKXJldHVybjtcclxuICBpZihkb2N1bWVudC5yZWZlcnJlci5pbmRleE9mKCdzZWNyZXRkaXNjb3VudGVyJyk8MClyZXR1cm47XHJcblxyXG4gIGhyZWY9d2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmO1xyXG4gIGlmKFxyXG4gICAgaHJlZi5pbmRleE9mKCdzb2NpYWxzJyk+MCB8fFxyXG4gICAgaHJlZi5pbmRleE9mKCdsb2dpbicpPjAgfHxcclxuICAgIGhyZWYuaW5kZXhPZignYWRtaW4nKT4wIHx8XHJcbiAgICBocmVmLmluZGV4T2YoJ2FjY291bnQnKT4wXHJcbiAgKXtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgaWYoaHJlZi5pbmRleE9mKCdzdG9yZScpPjAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKT4wIHx8IGhyZWYuaW5kZXhPZignc2V0dGluZ3MnKT4wKXtcclxuICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgfWVsc2V7XHJcbiAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY9bG9jYXRpb24uaHJlZjtcclxuICB9XHJcbiAgd2luZG93LmNsb3NlKCk7XHJcbn0pKCk7XHJcbiIsIiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgJCgnaW5wdXRbdHlwZT1maWxlXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICB2YXIgZmlsZSA9IGV2dC50YXJnZXQuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxyXG4gICAgdmFyIGYgPSBmaWxlWzBdO1xyXG4gICAgLy8gT25seSBwcm9jZXNzIGltYWdlIGZpbGVzLlxyXG4gICAgaWYgKCFmLnR5cGUubWF0Y2goJ2ltYWdlLionKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgICBkYXRhID0ge1xyXG4gICAgICAnZWwnOiB0aGlzLFxyXG4gICAgICAnZic6IGZcclxuICAgIH07XHJcbiAgICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGltZyA9ICQoJ1tmb3I9XCInICsgZGF0YS5lbC5uYW1lICsgJ1wiXScpO1xyXG4gICAgICAgIGlmIChpbWcubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgaW1nLmF0dHIoJ3NyYycsIGUudGFyZ2V0LnJlc3VsdClcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9KShkYXRhKTtcclxuICAgIC8vIFJlYWQgaW4gdGhlIGltYWdlIGZpbGUgYXMgYSBkYXRhIFVSTC5cclxuICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGYpO1xyXG4gIH0pO1xyXG59KTtcclxuIiwiXHJcbmZ1bmN0aW9uIGdldENvb2tpZShuKSB7XHJcbiAgcmV0dXJuIHVuZXNjYXBlKChSZWdFeHAobiArICc9KFteO10rKScpLmV4ZWMoZG9jdW1lbnQuY29va2llKSB8fCBbMSwgJyddKVsxXSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldENvb2tpZShuYW1lLCB2YWx1ZSkge1xyXG4gIHZhciBjb29raWVfc3RyaW5nID0gbmFtZSArIFwiPVwiICsgZXNjYXBlICggdmFsdWUgKTtcclxuICBkb2N1bWVudC5jb29raWUgPSBjb29raWVfc3RyaW5nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBlcmFzZUNvb2tpZShuYW1lKXtcclxuICB2YXIgY29va2llX3N0cmluZyA9IG5hbWUgKyBcIj0wXCIgK1wiOyBleHBpcmVzPVdlZCwgMDEgT2N0IDIwMTcgMDA6MDA6MDAgR01UXCI7XHJcbiAgZG9jdW1lbnQuY29va2llID0gY29va2llX3N0cmluZztcclxufSJdfQ==
