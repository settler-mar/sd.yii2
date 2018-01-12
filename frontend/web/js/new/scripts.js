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

        console.log(this);
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
    });

    $('.content-wrap').on('mousedown',function(e){
      $('.header-noty-box').removeClass('header-noty-box_open')
      $('html').removeClass('no_scrol_laptop_min');
    })
  },'json');

})();
var headerActions = function () {
    var scrolledDown = false;
    var shadowedDown = false;

    $('.menu-toggle').click(function(e) {
        e.preventDefault();
        $('.header').toggleClass('header_open-menu');
        $('.drop-menu').find('li').removeClass('open').removeClass('close');
    });

    $('#header').click(function (e) {
        if (e.target.id == 'header') {
            $(this).removeClass('header_open-menu');
        }
    });

    $('.search-toggle').click(function(e) {
        e.preventDefault();
        $('.header-search').toggleClass('open');
        $('#autocomplete').fadeOut();
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
        onBeforeShow : function(ele, tipso) {
            if (ele.data('type')=='json') {
                var items = ele.data('tooltip');
                var html = '<ul class="noty-list">';
                items.forEach(function(item){
                    html += '<li class="noty-list_item"><span class="noty-list_item-type">'+item.type+
                        '</span><span class="noty-list_item-text">'+item.text+'</span></li>';
                });
                html += '</ul>';
                this.content = html;
                this.background = '#ccc';
            } else {
                this.content = ele.data('tooltip');
            }
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





//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1bmN0aW9ucy5qcyIsInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsInRpcHNvLm1pbi5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsIm1vZGFscy5qcyIsImZvb3Rlcl9tZW51LmpzIiwicmF0aW5nLmpzIiwiYWNjb3VudF9ub3RpZmljYXRpb24uanMiLCJzY3JpcHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm9iamVjdHMgPSBmdW5jdGlvbiAoYSxiKSB7XG4gICAgdmFyIGMgPSBiLFxuICAgICAgICBrZXk7XG4gICAgZm9yIChrZXkgaW4gYSkge1xuICAgICAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYztcbn07XG5cbmZ1bmN0aW9uIGxvZ2luX3JlZGlyZWN0KG5ld19ocmVmKXtcbiAgICBocmVmPWxvY2F0aW9uLmhyZWY7XG4gICAgaWYoaHJlZi5pbmRleE9mKCdzdG9yZScpPjAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKT4wKXtcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfWVsc2V7XG4gICAgICAgIGxvY2F0aW9uLmhyZWY9bmV3X2hyZWY7XG4gICAgfVxufVxuIiwiKGZ1bmN0aW9uICh3LCBkLCAkKSB7XG4gICAgdmFyIHNjcm9sbHNfYmxvY2sgPSAkKCcuc2Nyb2xsX2JveCcpO1xuXG4gICAgaWYoc2Nyb2xsc19ibG9jay5sZW5ndGg9PTApIHJldHVybjtcbiAgICAvLyQoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKS53cmFwQWxsKHNjcm9sbHNfYmxvY2spO1xuICAgICQoc2Nyb2xsc19ibG9jaykud3JhcCgnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtd3JhcFwiPjwvZGl2PicpO1xuXG4gICAgaW5pdF9zY3JvbGwoKTtcbiAgICBjYWxjX3Njcm9sbCgpO1xuXG4gICAgdmFyIHQxLHQyO1xuXG4gICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0MSk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0Mik7XG4gICAgICAgIHQxPXNldFRpbWVvdXQoY2FsY19zY3JvbGwsMzAwKTtcbiAgICAgICAgdDI9c2V0VGltZW91dChjYWxjX3Njcm9sbCw4MDApO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gaW5pdF9zY3JvbGwoKSB7XG4gICAgICAgIHZhciBjb250cm9sID0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xcIj48L2Rpdj4nO1xuICAgICAgICBjb250cm9sPSQoY29udHJvbCk7XG4gICAgICAgIGNvbnRyb2wuaW5zZXJ0QWZ0ZXIoc2Nyb2xsc19ibG9jayk7XG4gICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7XG5cbiAgICAgICAgc2Nyb2xsc19ibG9jay5wcmVwZW5kKCc8ZGl2IGNsYXNzPXNjcm9sbF9ib3gtbW92ZXI+PC9kaXY+Jyk7XG5cbiAgICAgICAgY29udHJvbC5vbignY2xpY2snLCcuc2Nyb2xsX2JveC1jb250cm9sX3BvaW50JyxmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2wgPSAkdGhpcy5wYXJlbnQoKTtcbiAgICAgICAgICAgIHZhciBpID0gJHRoaXMuaW5kZXgoKTtcbiAgICAgICAgICAgIGlmKCR0aGlzLmhhc0NsYXNzKCdhY3RpdmUnKSlyZXR1cm47XG4gICAgICAgICAgICBjb250cm9sLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnYWN0aXZlJyk7XG5cbiAgICAgICAgICAgIHZhciBkeD1jb250cm9sLmRhdGEoJ3NsaWRlLWR4Jyk7XG4gICAgICAgICAgICB2YXIgZWwgPSBjb250cm9sLnByZXYoKTtcbiAgICAgICAgICAgIGVsLmZpbmQoJy5zY3JvbGxfYm94LW1vdmVyJykuY3NzKCdtYXJnaW4tbGVmdCcsLWR4KmkpO1xuICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCBpKTtcblxuICAgICAgICAgICAgc3RvcFNjcm9sLmJpbmQoZWwpKCk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBzY3JvbGxzX2Jsb2NrLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaik7XG4gICAgICAgIGVsLnBhcmVudCgpLmhvdmVyKHN0b3BTY3JvbC5iaW5kKGVsKSxzdGFydFNjcm9sLmJpbmQoZWwpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdGFydFNjcm9sKCl7XG4gICAgICAgIHZhciAkdGhpcz0kKHRoaXMpO1xuICAgICAgICBpZighJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XG5cbiAgICAgICAgdmFyIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZS5iaW5kKCR0aGlzKSwgMjAwMCk7XG4gICAgICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsdGltZW91dElkKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0b3BTY3JvbCgpe1xuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKTtcbiAgICAgICAgdmFyIHRpbWVvdXRJZD0kdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnKTtcbiAgICAgICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJyxmYWxzZSk7XG4gICAgICAgIGlmKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpIHx8ICF0aW1lb3V0SWQpcmV0dXJuO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKTtcbiAgICAgICAgJHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJyxmYWxzZSk7XG4gICAgICAgIGlmKCEkdGhpcy5oYXNDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpKXJldHVybjtcblxuICAgICAgICB2YXIgY29udHJvbHM9JHRoaXMubmV4dCgpLmZpbmQoJz4qJyk7XG4gICAgICAgIHZhciBhY3RpdmU9JHRoaXMuZGF0YSgnc2xpZGUtYWN0aXZlJyk7XG4gICAgICAgIHZhciBwb2ludF9jbnQ9Y29udHJvbHMubGVuZ3RoO1xuICAgICAgICBpZighYWN0aXZlKWFjdGl2ZT0wO1xuICAgICAgICBhY3RpdmUrKztcbiAgICAgICAgaWYoYWN0aXZlPj1wb2ludF9jbnQpYWN0aXZlPTA7XG4gICAgICAgICR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XG5cbiAgICAgICAgY29udHJvbHMuZXEoYWN0aXZlKS5jbGljaygpO1xuICAgICAgICBzdGFydFNjcm9sLmJpbmQoJHRoaXMpKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsY19zY3JvbGwoKSB7XG4gICAgICAgIGZvcihpPTA7aTxzY3JvbGxzX2Jsb2NrLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgIHZhciBlbCA9IHNjcm9sbHNfYmxvY2suZXEoaSk7XG4gICAgICAgICAgICB2YXIgY29udHJvbCA9IGVsLm5leHQoKTtcbiAgICAgICAgICAgIHZhciB3aWR0aF9tYXggPSBlbC5kYXRhKCdzY3JvbGwtd2lkdGgtbWF4Jyk7XG4gICAgICAgICAgICB3ID0gZWwud2lkdGgoKTtcblxuICAgICAgICAgICAgLy/QtNC10LvQsNC10Lwg0LrQvtC90YLRgNC+0LvRjCDQvtCz0YDQsNC90LjRh9C10L3QuNGPINGI0LjRgNC40L3Riy4g0JXRgdC70Lgg0L/RgNC10LLRi9GI0LXQvdC+INGC0L4g0L7RgtC60LvRjtGH0LDQtdC8INGB0LrRgNC+0Lsg0Lgg0L/QtdGA0LXRhdC+0LTQuNC8INC6INGB0LvQtdC00YPRjtGJ0LXQvNGDINGN0LvQtdC80LXQvdGC0YNcbiAgICAgICAgICAgIGlmICh3aWR0aF9tYXggJiYgdyA+IHdpZHRoX21heCkge1xuICAgICAgICAgICAgICAgIGNvbnRyb2wucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbm9fY2xhc3MgPSBlbC5kYXRhKCdzY3JvbGwtZWxlbWV0LWlnbm9yZS1jbGFzcycpO1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gZWwuZmluZCgnPionKS5ub3QoJy5zY3JvbGxfYm94LW1vdmVyJyk7XG4gICAgICAgICAgICBpZiAobm9fY2xhc3MpIHtcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGNoaWxkcmVuLm5vdCgnLicgKyBub19jbGFzcylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/QldGB0LvQuCDQvdC10YIg0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4gPT0gMCkge1xuICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGZfZWw9Y2hpbGRyZW4uZXEoMSk7XG4gICAgICAgICAgICB2YXIgY2hpbGRyZW5fdyA9IGZfZWwub3V0ZXJXaWR0aCgpOyAvL9Cy0YHQtdCz0L4g0LTQvtGH0LXRgNC90LjRhSDQtNC70Y8g0YHQutGA0L7Qu9CwXG4gICAgICAgICAgICBjaGlsZHJlbl93Kz1wYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tbGVmdCcpKTtcbiAgICAgICAgICAgIGNoaWxkcmVuX3crPXBhcnNlRmxvYXQoZl9lbC5jc3MoJ21hcmdpbi1yaWdodCcpKTtcblxuICAgICAgICAgICAgdmFyIHNjcmVhbl9jb3VudCA9IE1hdGguZmxvb3IodyAvIGNoaWxkcmVuX3cpO1xuXG4gICAgICAgICAgICAvL9CV0YHQu9C4INCy0YHQtSDQstC70LDQt9C40YIg0L3QsCDRjdC60YDQsNC9XG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4gPD0gc2NyZWFuX2NvdW50KSB7XG4gICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApOyAvL9GB0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL9Cj0LbQtSDRgtC+0YfQvdC+INC30L3QsNC10Lwg0YfRgtC+INGB0LrRgNC+0Lsg0L3Rg9C20LXQvVxuICAgICAgICAgICAgZWwuYWRkQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKTtcblxuICAgICAgICAgICAgdmFyIHBvaW50X2NudCA9IGNoaWxkcmVuLmxlbmd0aCAtIHNjcmVhbl9jb3VudCArIDE7XG4gICAgICAgICAgICAvL9C10YHQu9C4INC90LUg0L3QsNC00L4g0L7QsdC90L7QstC70Y/RgtGMINC60L7QvdGC0YDQvtC7INGC0L4g0LLRi9GF0L7QtNC40LwsINC90LUg0LfQsNCx0YvQstCw0Y8g0L7QsdC90L7QstC40YLRjCDRiNC40YDQuNC90YMg0LTQvtGH0LXRgNC90LjRhVxuICAgICAgICAgICAgaWYgKGNvbnRyb2wuZmluZCgnPionKS5sZW5ndGggPT0gcG9pbnRfY250KSB7XG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhY3RpdmUgPSBlbC5kYXRhKCdzbGlkZS1hY3RpdmUnKTtcbiAgICAgICAgICAgIGlmICghYWN0aXZlKWFjdGl2ZSA9IDA7XG4gICAgICAgICAgICBpZiAoYWN0aXZlID49IHBvaW50X2NudClhY3RpdmUgPSBwb2ludF9jbnQgLSAxO1xuICAgICAgICAgICAgdmFyIG91dCA9ICcnO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwb2ludF9jbnQ7IGorKykge1xuICAgICAgICAgICAgICAgIG91dCArPSAnPGRpdiBjbGFzcz1cInNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcrKGo9PWFjdGl2ZT8nIGFjdGl2ZSc6JycpKydcIj48L2Rpdj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udHJvbC5odG1sKG91dCk7XG5cbiAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgYWN0aXZlKTtcbiAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtY291bnQnLCBwb2ludF9jbnQpO1xuICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1keCcsIGNoaWxkcmVuX3cpO1xuXG4gICAgICAgICAgICBpZighZWwuZGF0YSgnc2xpZGUtdGltZW91dElkJykpe1xuICAgICAgICAgICAgICAgIHN0YXJ0U2Nyb2wuYmluZChlbCkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0od2luZG93LCBkb2N1bWVudCwgalF1ZXJ5KSk7IiwidmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xuXG5hY2NvcmRpb25Db250cm9sLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICR0aGlzID0gJCh0aGlzKTtcbiAgICAkYWNjb3JkaW9uID0gJHRoaXMuY2xvc2VzdCgnLmFjY29yZGlvbicpO1xuXG4gICAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgICAvKmlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1zbGltJykpe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9Ki9cbiAgICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5oaWRlKDMwMCk7XG4gICAgICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ2FjY29yZGlvbi1zbGltJykpe1xuICAgICAgICAgICAgJG90aGVyPSRhY2NvcmRpb24ucGFyZW50KCkuZmluZCgnLmFjY29yZGlvbi1zbGltJyk7XG4gICAgICAgICAgICAkb3RoZXIuZmluZCgnLmFjY29yZGlvbi1jb250ZW50JylcbiAgICAgICAgICAgICAgICAuaGlkZSgzMDApXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcbiAgICAgICAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgJG90aGVyLnJlbW92ZUNsYXNzKCdsYXN0LW9wZW4nKTtcblxuICAgICAgICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5hZGRDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG4gICAgICAgICAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdsYXN0LW9wZW4nKTtcbiAgICAgICAgfVxuICAgICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNob3coMzAwKTtcbiAgICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59KTtcbmFjY29yZGlvbkNvbnRyb2wuc2hvdygpO1xuXG4vL9C00LvRjyBjYnZqZCBqbnJoc2RmdHYgMS3QuVxuYWNjb3JkaW9uU2xpbT0kKCcuYWNjb3JkaW9uLmFjY29yZGlvbi1zbGltJyk7XG5pZihhY2NvcmRpb25TbGltLmxlbmd0aD4wKXtcbiAgICBhY2NvcmRpb25TbGltLnBhcmVudCgpLmZpbmQoJy5hY2NvcmRpb24tc2xpbTpmaXJzdC1jaGlsZCcpXG4gICAgICAgIC5hZGRDbGFzcygnb3BlbicpXG4gICAgICAgIC5hZGRDbGFzcygnbGFzdC1vcGVuJylcbiAgICAgICAgLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXG4gICAgICAgICAgICAuc2hvdygzMDApXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xufVxuIiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJyxcbiAgfTtcblxuICBmdW5jdGlvbiBvblBvc3QocG9zdCl7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBmb3JtPWRhdGEuZm9ybTtcbiAgICB3cmFwPWRhdGEud3JhcDtcbiAgICBpZihwb3N0LnJlbmRlcil7XG4gICAgICBwb3N0Lm5vdHlmeV9jbGFzcz1cIm5vdGlmeV93aGl0ZVwiO1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHBvc3QpO1xuICAgIH1lbHNle1xuICAgICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XG4gICAgICBhamF4Rm9ybSh3cmFwKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvbkZhaWwoKXtcbiAgICB2YXIgZGF0YT10aGlzO1xuICAgIGZvcm09ZGF0YS5mb3JtO1xuICAgIHdyYXA9ZGF0YS53cmFwO1xuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICB3cmFwLmh0bWwoJzxoMz7Qo9C/0YEuLi4g0JLQvtC30L3QuNC60LvQsCDQvdC10L/RgNC10LTQstC40LTQtdC90L3QsNGPINC+0YjQuNCx0LrQsDxoMz4nICtcbiAgICAgICc8cD7Qp9Cw0YHRgtC+INGN0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDQsiDRgdC70YPRh9Cw0LUsINC10YHQu9C4INCy0Ysg0L3QtdGB0LrQvtC70YzQutC+INGA0LDQtyDQv9C+0LTRgNGP0LQg0L3QtdCy0LXRgNC90L4g0LLQstC10LvQuCDRgdCy0L7QuCDRg9GH0LXRgtC90YvQtSDQtNCw0L3QvdGL0LUuINCd0L4g0LLQvtC30LzQvtC20L3RiyDQuCDQtNGA0YPQs9C40LUg0L/RgNC40YfQuNC90YsuINCSINC70Y7QsdC+0Lwg0YHQu9GD0YfQsNC1INC90LUg0YDQsNGB0YHRgtGA0LDQuNCy0LDQudGC0LXRgdGMINC4INC/0YDQvtGB0YLQviDQvtCx0YDQsNGC0LjRgtC10YHRjCDQuiDQvdCw0YjQtdC80YMg0L7Qv9C10YDQsNGC0L7RgNGDINGB0LvRg9C20LHRiyDQv9C+0LTQtNC10YDQttC60LguPC9wPjxicj4nICtcbiAgICAgICc8cD7QodC/0LDRgdC40LHQvi48L3A+Jyk7XG4gICAgYWpheEZvcm0od3JhcCk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU3VibWl0KGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgZGF0YT10aGlzO1xuICAgIGZvcm09ZGF0YS5mb3JtO1xuICAgIHdyYXA9ZGF0YS53cmFwO1xuXG4gICAgaWYoZm9ybS55aWlBY3RpdmVGb3JtKXtcbiAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcbiAgICB9O1xuXG4gICAgaXNWYWxpZD0oZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aD09MCk7XG5cbiAgICBpZighaXNWYWxpZCl7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfWVsc2V7XG4gICAgICByZXF1aXJlZD1mb3JtLmZpbmQoJ2lucHV0LnJlcXVpcmVkJyk7XG4gICAgICBmb3IoaT0wO2k8cmVxdWlyZWQubGVuZ3RoO2krKyl7XG4gICAgICAgIGlmKHJlcXVpcmVkLmVxKGkpLnZhbCgpLmxlbmd0aDwxKXtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcblxuICAgIHZhciBwb3N0PWZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xuICAgIGZvcm0uaHRtbCgnJyk7XG4gICAgd3JhcC5odG1sKCc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHA+0J7RgtC/0YDQsNCy0LrQsCDQtNCw0L3QvdGL0YU8L3A+PC9kaXY+Jyk7XG5cbiAgICBkYXRhLnVybCs9KGRhdGEudXJsLmluZGV4T2YoJz8nKT4wPycmJzonPycpKydyYz0nK01hdGgucmFuZG9tKCk7XG5cbiAgICAkLnBvc3QoXG4gICAgICBkYXRhLnVybCxcbiAgICAgIHBvc3QsXG4gICAgICBvblBvc3QuYmluZChkYXRhKSxcbiAgICAgICdqc29uJ1xuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBlbHMuZmluZCgnW3JlcXVpcmVkXScpXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXG4gICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJyk7XG5cbiAgZm9yKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKyl7XG4gICAgd3JhcD1lbHMuZXEoaSk7XG4gICAgZm9ybT13cmFwLmZpbmQoJ2Zvcm0nKTtcbiAgICBkYXRhPXtcbiAgICAgIGZvcm06Zm9ybSxcbiAgICAgIHBhcmFtOmRlZmF1bHRzLFxuICAgICAgd3JhcDp3cmFwXG4gICAgfTtcbiAgICBkYXRhLnVybD1mb3JtLmF0dHIoJ2FjdGlvbicpIHx8IGxvY2F0aW9uLmhyZWY7XG4gICAgZGF0YS5tZXRob2Q9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xuICAgIGZvcm0ub2ZmKCdzdWJtaXQnKTtcbiAgICBmb3JtLm9uKCdzdWJtaXQnLCBvblN1Ym1pdC5iaW5kKGRhdGEpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRTUk8oKXtcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG8gPSB7fTtcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XG4gICAgICAgIH1cbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvO1xuICB9O1xufTtcbmFkZFNSTygpOyIsIiFmdW5jdGlvbih0KXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImpxdWVyeVwiXSx0KTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz10KHJlcXVpcmUoXCJqcXVlcnlcIikpOnQoalF1ZXJ5KX0oZnVuY3Rpb24odCl7ZnVuY3Rpb24gbyhvLGUpe3RoaXMuZWxlbWVudD1vLHRoaXMuJGVsZW1lbnQ9dCh0aGlzLmVsZW1lbnQpLHRoaXMuZG9jPXQoZG9jdW1lbnQpLHRoaXMud2luPXQod2luZG93KSx0aGlzLnNldHRpbmdzPXQuZXh0ZW5kKHt9LG4sZSksXCJvYmplY3RcIj09dHlwZW9mIHRoaXMuJGVsZW1lbnQuZGF0YShcInRpcHNvXCIpJiZ0LmV4dGVuZCh0aGlzLnNldHRpbmdzLHRoaXMuJGVsZW1lbnQuZGF0YShcInRpcHNvXCIpKTtmb3IodmFyIHI9T2JqZWN0LmtleXModGhpcy4kZWxlbWVudC5kYXRhKCkpLHM9e30sZD0wO2Q8ci5sZW5ndGg7ZCsrKXt2YXIgbD1yW2RdLnJlcGxhY2UoaSxcIlwiKTtpZihcIlwiIT09bCl7bD1sLmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpK2wuc2xpY2UoMSksc1tsXT10aGlzLiRlbGVtZW50LmRhdGEocltkXSk7Zm9yKHZhciBwIGluIHRoaXMuc2V0dGluZ3MpcC50b0xvd2VyQ2FzZSgpPT1sJiYodGhpcy5zZXR0aW5nc1twXT1zW2xdKX19dGhpcy5fZGVmYXVsdHM9bix0aGlzLl9uYW1lPWksdGhpcy5fdGl0bGU9dGhpcy4kZWxlbWVudC5hdHRyKFwidGl0bGVcIiksdGhpcy5tb2RlPVwiaGlkZVwiLHRoaXMuaWVGYWRlPSFhLHRoaXMuc2V0dGluZ3MucHJlZmVyZWRQb3NpdGlvbj10aGlzLnNldHRpbmdzLnBvc2l0aW9uLHRoaXMuaW5pdCgpfWZ1bmN0aW9uIGUobyl7dmFyIGU9by5jbG9uZSgpO2UuY3NzKFwidmlzaWJpbGl0eVwiLFwiaGlkZGVuXCIpLHQoXCJib2R5XCIpLmFwcGVuZChlKTt2YXIgcj1lLm91dGVySGVpZ2h0KCkscz1lLm91dGVyV2lkdGgoKTtyZXR1cm4gZS5yZW1vdmUoKSx7d2lkdGg6cyxoZWlnaHQ6cn19ZnVuY3Rpb24gcih0KXt0LnJlbW92ZUNsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lciBib3R0b21fcmlnaHRfY29ybmVyIHRvcF9sZWZ0X2Nvcm5lciBib3R0b21fbGVmdF9jb3JuZXJcIiksdC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLnJlbW92ZUNsYXNzKFwidG9wX3JpZ2h0X2Nvcm5lciBib3R0b21fcmlnaHRfY29ybmVyIHRvcF9sZWZ0X2Nvcm5lciBib3R0b21fbGVmdF9jb3JuZXJcIil9ZnVuY3Rpb24gcyhvKXt2YXIgaSxuLGEsZD1vLnRvb2x0aXAoKSxsPW8uJGVsZW1lbnQscD1vLGY9dCh3aW5kb3cpLGc9MTAsYz1wLnNldHRpbmdzLmJhY2tncm91bmQsaD1wLnRpdGxlQ29udGVudCgpO3N3aXRjaCh2b2lkIDAhPT1oJiZcIlwiIT09aCYmKGM9cC5zZXR0aW5ncy50aXRsZUJhY2tncm91bmQpLGwucGFyZW50KCkub3V0ZXJXaWR0aCgpPmYub3V0ZXJXaWR0aCgpJiYoZj1sLnBhcmVudCgpKSxwLnNldHRpbmdzLnBvc2l0aW9uKXtjYXNlXCJ0b3AtcmlnaHRcIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKSxpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJib3R0b21fcmlnaHRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb190aXRsZVwiKS5hZGRDbGFzcyhcImJvdHRvbV9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOmN9KSxkLnJlbW92ZUNsYXNzKFwidG9wLXJpZ2h0IHRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnQgXCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcInRvcF9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItbGVmdC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZH0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk7YnJlYWs7Y2FzZVwidG9wLWxlZnRcIjpuPWwub2Zmc2V0KCkubGVmdC1lKGQpLndpZHRoLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbV9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJib3R0b21fbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpjfSksZC5yZW1vdmVDbGFzcyhcInRvcC1yaWdodCB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50IFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BfbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmR9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpO2JyZWFrO2Nhc2VcImJvdHRvbS1yaWdodFwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaStlKGQpLmhlaWdodD5mLnNjcm9sbFRvcCgpK2Yub3V0ZXJIZWlnaHQoKT8oaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcInRvcF9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwidG9wX2xlZnRfY29ybmVyXCIpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWxlZnQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmR9KSxkLnJlbW92ZUNsYXNzKFwidG9wLXJpZ2h0IHRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbV9yaWdodF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX3RpdGxlXCIpLmFkZENsYXNzKFwiYm90dG9tX3JpZ2h0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6Y30pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk7YnJlYWs7Y2FzZVwiYm90dG9tLWxlZnRcIjpuPWwub2Zmc2V0KCkubGVmdC1lKGQpLndpZHRoLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaStlKGQpLmhlaWdodD5mLnNjcm9sbFRvcCgpK2Yub3V0ZXJIZWlnaHQoKT8oaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcInRvcF9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJ0b3BfbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmR9KSxkLnJlbW92ZUNsYXNzKFwidG9wLXJpZ2h0IHRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5hZGRDbGFzcyhcImJvdHRvbV9sZWZ0X2Nvcm5lclwiKSxkLmZpbmQoXCIudGlwc29fdGl0bGVcIikuYWRkQ2xhc3MoXCJib3R0b21fbGVmdF9jb3JuZXJcIiksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpjfSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTticmVhaztjYXNlXCJ0b3BcIjpuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKS8yLWUoZCkud2lkdGgvMixpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJib3R0b21cIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci10b3AtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpO2JyZWFrO2Nhc2VcImJvdHRvbVwiOm49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLzItZShkKS53aWR0aC8yLGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksaStlKGQpLmhlaWdodD5mLnNjcm9sbFRvcCgpK2Yub3V0ZXJIZWlnaHQoKT8oaT1sLm9mZnNldCgpLnRvcC1lKGQpLmhlaWdodC1nLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcInRvcFwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MocC5zZXR0aW5ncy5wb3NpdGlvbikpO2JyZWFrO2Nhc2VcImxlZnRcIjpuPWwub2Zmc2V0KCkubGVmdC1lKGQpLndpZHRoLWcsaT1sLm9mZnNldCgpLnRvcCtsLm91dGVySGVpZ2h0KCkvMi1lKGQpLmhlaWdodC8yLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpblRvcDotcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpbkxlZnQ6XCJcIn0pLG48Zi5zY3JvbGxMZWZ0KCk/KG49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwicmlnaHRcIikpOihkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MocC5zZXR0aW5ncy5wb3NpdGlvbikpO2JyZWFrO2Nhc2VcInJpZ2h0XCI6bj1sLm9mZnNldCgpLmxlZnQrbC5vdXRlcldpZHRoKCkrZyxpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKS8yLWUoZCkuaGVpZ2h0LzIsZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luVG9wOi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luTGVmdDpcIlwifSksbitnK3Auc2V0dGluZ3Mud2lkdGg+Zi5zY3JvbGxMZWZ0KCkrZi5vdXRlcldpZHRoKCk/KG49bC5vZmZzZXQoKS5sZWZ0LWUoZCkud2lkdGgtZyxkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHtcImJvcmRlci1sZWZ0LWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXRvcC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxkLnJlbW92ZUNsYXNzKFwidG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpLGQuYWRkQ2xhc3MoXCJsZWZ0XCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItcmlnaHQtY29sb3JcIjpwLnNldHRpbmdzLmJhY2tncm91bmQsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKHAuc2V0dGluZ3MucG9zaXRpb24pKX1pZihcInRvcC1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbiYmZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJtYXJnaW4tbGVmdFwiOi1wLnNldHRpbmdzLndpZHRoLzJ9KSxcInRvcC1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKXt2YXIgbT1kLmZpbmQoXCIudGlwc29fYXJyb3dcIikuZXEoMCk7bS5jc3Moe1wibWFyZ2luLWxlZnRcIjpwLnNldHRpbmdzLndpZHRoLzItMipwLnNldHRpbmdzLmFycm93V2lkdGh9KX1pZihcImJvdHRvbS1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbil7dmFyIG09ZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmVxKDApO20uY3NzKHtcIm1hcmdpbi1sZWZ0XCI6LXAuc2V0dGluZ3Mud2lkdGgvMixcIm1hcmdpbi10b3BcIjpcIlwifSl9aWYoXCJib3R0b20tbGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbil7dmFyIG09ZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmVxKDApO20uY3NzKHtcIm1hcmdpbi1sZWZ0XCI6cC5zZXR0aW5ncy53aWR0aC8yLTIqcC5zZXR0aW5ncy5hcnJvd1dpZHRoLFwibWFyZ2luLXRvcFwiOlwiXCJ9KX1uPGYuc2Nyb2xsTGVmdCgpJiYoXCJib3R0b21cIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wXCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6bi1wLnNldHRpbmdzLmFycm93V2lkdGh9KSxuPTApLG4rcC5zZXR0aW5ncy53aWR0aD5mLm91dGVyV2lkdGgoKSYmKFwiYm90dG9tXCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcInRvcFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihhPWYub3V0ZXJXaWR0aCgpLShuK3Auc2V0dGluZ3Mud2lkdGgpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LWEtcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksbis9YSksbjxmLnNjcm9sbExlZnQoKSYmKFwibGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJyaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3AtcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwiYm90dG9tLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImJvdHRvbS1sZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKG49bC5vZmZzZXQoKS5sZWZ0K2wub3V0ZXJXaWR0aCgpLzItZShkKS53aWR0aC8yLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LXAuc2V0dGluZ3MuYXJyb3dXaWR0aCxtYXJnaW5Ub3A6XCJcIn0pLGk9bC5vZmZzZXQoKS50b3AtZShkKS5oZWlnaHQtZyxpPGYuc2Nyb2xsVG9wKCk/KGk9bC5vZmZzZXQoKS50b3ArbC5vdXRlckhlaWdodCgpK2csZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItYm90dG9tLWNvbG9yXCI6YyxcImJvcmRlci10b3AtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIikscihkKSxkLmFkZENsYXNzKFwiYm90dG9tXCIpKTooZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7XCJib3JkZXItdG9wLWNvbG9yXCI6cC5zZXR0aW5ncy5iYWNrZ3JvdW5kLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1sZWZ0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwifSksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxyKGQpLGQuYWRkQ2xhc3MoXCJ0b3BcIikpLG4rcC5zZXR0aW5ncy53aWR0aD5mLm91dGVyV2lkdGgoKSYmKGE9Zi5vdXRlcldpZHRoKCktKG4rcC5zZXR0aW5ncy53aWR0aCksZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDotYS1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxuKz1hKSxuPGYuc2Nyb2xsTGVmdCgpJiYoZC5maW5kKFwiLnRpcHNvX2Fycm93XCIpLmNzcyh7bWFyZ2luTGVmdDpuLXAuc2V0dGluZ3MuYXJyb3dXaWR0aH0pLG49MCkpLG4rcC5zZXR0aW5ncy53aWR0aD5mLm91dGVyV2lkdGgoKSYmKFwibGVmdFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJyaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJ0b3AtcmlnaHRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwidG9wLWxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb258fFwiYm90dG9tLXJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImJvdHRvbS1yaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbikmJihuPWwub2Zmc2V0KCkubGVmdCtsLm91dGVyV2lkdGgoKS8yLWUoZCkud2lkdGgvMixkLmZpbmQoXCIudGlwc29fYXJyb3dcIikuY3NzKHttYXJnaW5MZWZ0Oi1wLnNldHRpbmdzLmFycm93V2lkdGgsbWFyZ2luVG9wOlwiXCJ9KSxpPWwub2Zmc2V0KCkudG9wLWUoZCkuaGVpZ2h0LWcsaTxmLnNjcm9sbFRvcCgpPyhpPWwub2Zmc2V0KCkudG9wK2wub3V0ZXJIZWlnaHQoKStnLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1jb2xvclwiOmMsXCJib3JkZXItdG9wLWNvbG9yXCI6XCJ0cmFuc3BhcmVudFwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItcmlnaHQtY29sb3JcIjpcInRyYW5zcGFyZW50XCJ9KSxyKGQpLGQucmVtb3ZlQ2xhc3MoXCJ0b3AgYm90dG9tIGxlZnQgcmlnaHRcIiksZC5hZGRDbGFzcyhcImJvdHRvbVwiKSk6KGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe1wiYm9yZGVyLXRvcC1jb2xvclwiOnAuc2V0dGluZ3MuYmFja2dyb3VuZCxcImJvcmRlci1ib3R0b20tY29sb3JcIjpcInRyYW5zcGFyZW50XCIsXCJib3JkZXItbGVmdC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIixcImJvcmRlci1yaWdodC1jb2xvclwiOlwidHJhbnNwYXJlbnRcIn0pLHIoZCksZC5yZW1vdmVDbGFzcyhcInRvcCBib3R0b20gbGVmdCByaWdodFwiKSxkLmFkZENsYXNzKFwidG9wXCIpKSxuK3Auc2V0dGluZ3Mud2lkdGg+Zi5vdXRlcldpZHRoKCkmJihhPWYub3V0ZXJXaWR0aCgpLShuK3Auc2V0dGluZ3Mud2lkdGgpLGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6LWEtcC5zZXR0aW5ncy5hcnJvd1dpZHRoLG1hcmdpblRvcDpcIlwifSksbis9YSksbjxmLnNjcm9sbExlZnQoKSYmKGQuZmluZChcIi50aXBzb19hcnJvd1wiKS5jc3Moe21hcmdpbkxlZnQ6bi1wLnNldHRpbmdzLmFycm93V2lkdGh9KSxuPTApKSxkLmNzcyh7bGVmdDpuK3Auc2V0dGluZ3Mub2Zmc2V0WCx0b3A6aStwLnNldHRpbmdzLm9mZnNldFl9KSxpPGYuc2Nyb2xsVG9wKCkmJihcInJpZ2h0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9ufHxcImxlZnRcIj09PXAuc2V0dGluZ3MucG9zaXRpb24pJiYobC50aXBzbyhcInVwZGF0ZVwiLFwicG9zaXRpb25cIixcImJvdHRvbVwiKSxzKHApKSxpK2UoZCkuaGVpZ2h0PmYuc2Nyb2xsVG9wKCkrZi5vdXRlckhlaWdodCgpJiYoXCJyaWdodFwiPT09cC5zZXR0aW5ncy5wb3NpdGlvbnx8XCJsZWZ0XCI9PT1wLnNldHRpbmdzLnBvc2l0aW9uKSYmKGwudGlwc28oXCJ1cGRhdGVcIixcInBvc2l0aW9uXCIsXCJ0b3BcIikscyhwKSl9dmFyIGk9XCJ0aXBzb1wiLG49e3NwZWVkOjQwMCxiYWNrZ3JvdW5kOlwiIzU1YjU1NVwiLHRpdGxlQmFja2dyb3VuZDpcIiMzMzMzMzNcIixjb2xvcjpcIiNmZmZmZmZcIix0aXRsZUNvbG9yOlwiI2ZmZmZmZlwiLHRpdGxlQ29udGVudDpcIlwiLHNob3dBcnJvdzohMCxwb3NpdGlvbjpcInRvcFwiLHdpZHRoOjIwMCxtYXhXaWR0aDpcIlwiLGRlbGF5OjIwMCxoaWRlRGVsYXk6MCxhbmltYXRpb25JbjpcIlwiLGFuaW1hdGlvbk91dDpcIlwiLG9mZnNldFg6MCxvZmZzZXRZOjAsYXJyb3dXaWR0aDo4LHRvb2x0aXBIb3ZlcjohMSxjb250ZW50Om51bGwsYWpheENvbnRlbnRVcmw6bnVsbCxhamF4Q29udGVudEJ1ZmZlcjowLGNvbnRlbnRFbGVtZW50SWQ6bnVsbCx1c2VUaXRsZTohMSx0ZW1wbGF0ZUVuZ2luZUZ1bmM6bnVsbCxvbkJlZm9yZVNob3c6bnVsbCxvblNob3c6bnVsbCxvbkhpZGU6bnVsbH07dC5leHRlbmQoby5wcm90b3R5cGUse2luaXQ6ZnVuY3Rpb24oKXt7dmFyIHQ9dGhpcyxvPXRoaXMuJGVsZW1lbnQ7dGhpcy5kb2N9aWYoby5hZGRDbGFzcyhcInRpcHNvX3N0eWxlXCIpLnJlbW92ZUF0dHIoXCJ0aXRsZVwiKSx0LnNldHRpbmdzLnRvb2x0aXBIb3Zlcil7dmFyIGU9bnVsbCxyPW51bGw7by5vbihcIm1vdXNlb3Zlci5cIitpLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGUpLGNsZWFyVGltZW91dChyKSxyPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0LnNob3coKX0sMTUwKX0pLG8ub24oXCJtb3VzZW91dC5cIitpLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGUpLGNsZWFyVGltZW91dChyKSxlPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0LmhpZGUoKX0sMjAwKSx0LnRvb2x0aXAoKS5vbihcIm1vdXNlb3Zlci5cIitpLGZ1bmN0aW9uKCl7dC5tb2RlPVwidG9vbHRpcEhvdmVyXCJ9KS5vbihcIm1vdXNlb3V0LlwiK2ksZnVuY3Rpb24oKXt0Lm1vZGU9XCJzaG93XCIsY2xlYXJUaW1lb3V0KGUpLGU9c2V0VGltZW91dChmdW5jdGlvbigpe3QuaGlkZSgpfSwyMDApfSl9KX1lbHNlIG8ub24oXCJtb3VzZW92ZXIuXCIraSxmdW5jdGlvbigpe3Quc2hvdygpfSksby5vbihcIm1vdXNlb3V0LlwiK2ksZnVuY3Rpb24oKXt0LmhpZGUoKX0pO3Quc2V0dGluZ3MuYWpheENvbnRlbnRVcmwmJih0LmFqYXhDb250ZW50PW51bGwpfSx0b29sdGlwOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudGlwc29fYnViYmxlfHwodGhpcy50aXBzb19idWJibGU9dCgnPGRpdiBjbGFzcz1cInRpcHNvX2J1YmJsZVwiPjxkaXYgY2xhc3M9XCJ0aXBzb190aXRsZVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXBzb19jb250ZW50XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRpcHNvX2Fycm93XCI+PC9kaXY+PC9kaXY+JykpLHRoaXMudGlwc29fYnViYmxlfSxzaG93OmZ1bmN0aW9uKCl7dmFyIG89dGhpcy50b29sdGlwKCksZT10aGlzLHI9dGhpcy53aW47ZS5zZXR0aW5ncy5zaG93QXJyb3c9PT0hMT9vLmZpbmQoXCIudGlwc29fYXJyb3dcIikuaGlkZSgpOm8uZmluZChcIi50aXBzb19hcnJvd1wiKS5zaG93KCksXCJoaWRlXCI9PT1lLm1vZGUmJih0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vbkJlZm9yZVNob3cpJiZlLnNldHRpbmdzLm9uQmVmb3JlU2hvdyhlLiRlbGVtZW50LGUuZWxlbWVudCxlKSxlLnNldHRpbmdzLnNpemUmJm8uYWRkQ2xhc3MoZS5zZXR0aW5ncy5zaXplKSxlLnNldHRpbmdzLndpZHRoP28uY3NzKHtiYWNrZ3JvdW5kOmUuc2V0dGluZ3MuYmFja2dyb3VuZCxjb2xvcjplLnNldHRpbmdzLmNvbG9yLHdpZHRoOmUuc2V0dGluZ3Mud2lkdGh9KS5oaWRlKCk6ZS5zZXR0aW5ncy5tYXhXaWR0aD9vLmNzcyh7YmFja2dyb3VuZDplLnNldHRpbmdzLmJhY2tncm91bmQsY29sb3I6ZS5zZXR0aW5ncy5jb2xvcixtYXhXaWR0aDplLnNldHRpbmdzLm1heFdpZHRofSkuaGlkZSgpOm8uY3NzKHtiYWNrZ3JvdW5kOmUuc2V0dGluZ3MuYmFja2dyb3VuZCxjb2xvcjplLnNldHRpbmdzLmNvbG9yLHdpZHRoOjIwMH0pLmhpZGUoKSxvLmZpbmQoXCIudGlwc29fdGl0bGVcIikuY3NzKHtiYWNrZ3JvdW5kOmUuc2V0dGluZ3MudGl0bGVCYWNrZ3JvdW5kLGNvbG9yOmUuc2V0dGluZ3MudGl0bGVDb2xvcn0pLG8uZmluZChcIi50aXBzb19jb250ZW50XCIpLmh0bWwoZS5jb250ZW50KCkpLG8uZmluZChcIi50aXBzb190aXRsZVwiKS5odG1sKGUudGl0bGVDb250ZW50KCkpLHMoZSksci5vbihcInJlc2l6ZS5cIitpLGZ1bmN0aW9uKCl7ZS5zZXR0aW5ncy5wb3NpdGlvbj1lLnNldHRpbmdzLnByZWZlcmVkUG9zaXRpb24scyhlKX0pLHdpbmRvdy5jbGVhclRpbWVvdXQoZS50aW1lb3V0KSxlLnRpbWVvdXQ9bnVsbCxlLnRpbWVvdXQ9d2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLmllRmFkZXx8XCJcIj09PWUuc2V0dGluZ3MuYW5pbWF0aW9uSW58fFwiXCI9PT1lLnNldHRpbmdzLmFuaW1hdGlvbk91dD9vLmFwcGVuZFRvKFwiYm9keVwiKS5zdG9wKCEwLCEwKS5mYWRlSW4oZS5zZXR0aW5ncy5zcGVlZCxmdW5jdGlvbigpe2UubW9kZT1cInNob3dcIix0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vblNob3cpJiZlLnNldHRpbmdzLm9uU2hvdyhlLiRlbGVtZW50LGUuZWxlbWVudCxlKX0pOm8ucmVtb3ZlKCkuYXBwZW5kVG8oXCJib2R5XCIpLnN0b3AoITAsITApLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25PdXQpLmFkZENsYXNzKFwibm9BbmltYXRpb25cIikucmVtb3ZlQ2xhc3MoXCJub0FuaW1hdGlvblwiKS5hZGRDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uSW4pLmZhZGVJbihlLnNldHRpbmdzLnNwZWVkLGZ1bmN0aW9uKCl7dCh0aGlzKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXt0KHRoaXMpLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgXCIrZS5zZXR0aW5ncy5hbmltYXRpb25Jbil9KSxlLm1vZGU9XCJzaG93XCIsdC5pc0Z1bmN0aW9uKGUuc2V0dGluZ3Mub25TaG93KSYmZS5zZXR0aW5ncy5vblNob3coZS4kZWxlbWVudCxlLmVsZW1lbnQsZSksci5vZmYoXCJyZXNpemUuXCIraSxudWxsLFwidGlwc29SZXNpemVIYW5kbGVyXCIpfSl9LGUuc2V0dGluZ3MuZGVsYXkpKX0saGlkZTpmdW5jdGlvbihvKXt2YXIgZT10aGlzLHI9dGhpcy53aW4scz10aGlzLnRvb2x0aXAoKSxuPWUuc2V0dGluZ3MuaGlkZURlbGF5O28mJihuPTAsZS5tb2RlPVwic2hvd1wiKSx3aW5kb3cuY2xlYXJUaW1lb3V0KGUudGltZW91dCksZS50aW1lb3V0PW51bGwsZS50aW1lb3V0PXdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XCJ0b29sdGlwSG92ZXJcIiE9PWUubW9kZSYmKGUuaWVGYWRlfHxcIlwiPT09ZS5zZXR0aW5ncy5hbmltYXRpb25Jbnx8XCJcIj09PWUuc2V0dGluZ3MuYW5pbWF0aW9uT3V0P3Muc3RvcCghMCwhMCkuZmFkZU91dChlLnNldHRpbmdzLnNwZWVkLGZ1bmN0aW9uKCl7dCh0aGlzKS5yZW1vdmUoKSx0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vbkhpZGUpJiZcInNob3dcIj09PWUubW9kZSYmZS5zZXR0aW5ncy5vbkhpZGUoZS4kZWxlbWVudCxlLmVsZW1lbnQsZSksZS5tb2RlPVwiaGlkZVwiLHIub2ZmKFwicmVzaXplLlwiK2ksbnVsbCxcInRpcHNvUmVzaXplSGFuZGxlclwiKX0pOnMuc3RvcCghMCwhMCkucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbkluKS5hZGRDbGFzcyhcIm5vQW5pbWF0aW9uXCIpLnJlbW92ZUNsYXNzKFwibm9BbmltYXRpb25cIikuYWRkQ2xhc3MoXCJhbmltYXRlZCBcIitlLnNldHRpbmdzLmFuaW1hdGlvbk91dCkub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7dCh0aGlzKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIFwiK2Uuc2V0dGluZ3MuYW5pbWF0aW9uT3V0KS5yZW1vdmUoKSx0LmlzRnVuY3Rpb24oZS5zZXR0aW5ncy5vbkhpZGUpJiZcInNob3dcIj09PWUubW9kZSYmZS5zZXR0aW5ncy5vbkhpZGUoZS4kZWxlbWVudCxlLmVsZW1lbnQsZSksZS5tb2RlPVwiaGlkZVwiLHIub2ZmKFwicmVzaXplLlwiK2ksbnVsbCxcInRpcHNvUmVzaXplSGFuZGxlclwiKX0pKX0sbil9LGNsb3NlOmZ1bmN0aW9uKCl7dGhpcy5oaWRlKCEwKX0sZGVzdHJveTpmdW5jdGlvbigpe3t2YXIgdD10aGlzLiRlbGVtZW50LG89dGhpcy53aW47dGhpcy5kb2N9dC5vZmYoXCIuXCIraSksby5vZmYoXCJyZXNpemUuXCIraSxudWxsLFwidGlwc29SZXNpemVIYW5kbGVyXCIpLHQucmVtb3ZlRGF0YShpKSx0LnJlbW92ZUNsYXNzKFwidGlwc29fc3R5bGVcIikuYXR0cihcInRpdGxlXCIsdGhpcy5fdGl0bGUpfSx0aXRsZUNvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgdCxvPXRoaXMuJGVsZW1lbnQsZT10aGlzO3JldHVybiB0PWUuc2V0dGluZ3MudGl0bGVDb250ZW50P2Uuc2V0dGluZ3MudGl0bGVDb250ZW50Om8uZGF0YShcInRpcHNvLXRpdGxlXCIpfSxjb250ZW50OmZ1bmN0aW9uKCl7dmFyIG8sZT10aGlzLiRlbGVtZW50LHI9dGhpcyxzPXRoaXMuX3RpdGxlO3JldHVybiByLnNldHRpbmdzLmFqYXhDb250ZW50VXJsP3IuX2FqYXhDb250ZW50P289ci5fYWpheENvbnRlbnQ6KHIuX2FqYXhDb250ZW50PW89dC5hamF4KHt0eXBlOlwiR0VUXCIsdXJsOnIuc2V0dGluZ3MuYWpheENvbnRlbnRVcmwsYXN5bmM6ITF9KS5yZXNwb25zZVRleHQsci5zZXR0aW5ncy5hamF4Q29udGVudEJ1ZmZlcj4wP3NldFRpbWVvdXQoZnVuY3Rpb24oKXtyLl9hamF4Q29udGVudD1udWxsfSxyLnNldHRpbmdzLmFqYXhDb250ZW50QnVmZmVyKTpyLl9hamF4Q29udGVudD1udWxsKTpyLnNldHRpbmdzLmNvbnRlbnRFbGVtZW50SWQ/bz10KFwiI1wiK3Iuc2V0dGluZ3MuY29udGVudEVsZW1lbnRJZCkudGV4dCgpOnIuc2V0dGluZ3MuY29udGVudD9vPXIuc2V0dGluZ3MuY29udGVudDpyLnNldHRpbmdzLnVzZVRpdGxlPT09ITA/bz1zOlwic3RyaW5nXCI9PXR5cGVvZiBlLmRhdGEoXCJ0aXBzb1wiKSYmKG89ZS5kYXRhKFwidGlwc29cIikpLG51bGwhPT1yLnNldHRpbmdzLnRlbXBsYXRlRW5naW5lRnVuYyYmKG89ci5zZXR0aW5ncy50ZW1wbGF0ZUVuZ2luZUZ1bmMobykpLG99LHVwZGF0ZTpmdW5jdGlvbih0LG8pe3ZhciBlPXRoaXM7cmV0dXJuIG8/dm9pZChlLnNldHRpbmdzW3RdPW8pOmUuc2V0dGluZ3NbdF19fSk7dmFyIGE9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKS5zdHlsZSxvPVtcIm1zXCIsXCJPXCIsXCJNb3pcIixcIldlYmtpdFwiXTtpZihcIlwiPT09dC50cmFuc2l0aW9uKXJldHVybiEwO2Zvcig7by5sZW5ndGg7KWlmKG8ucG9wKCkrXCJUcmFuc2l0aW9uXCJpbiB0KXJldHVybiEwO3JldHVybiExfSgpO3RbaV09dC5mbltpXT1mdW5jdGlvbihlKXt2YXIgcj1hcmd1bWVudHM7aWYodm9pZCAwPT09ZXx8XCJvYmplY3RcIj09dHlwZW9mIGUpcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiB0fHx0LmV4dGVuZChuLGUpLHRoaXMuZWFjaChmdW5jdGlvbigpe3QuZGF0YSh0aGlzLFwicGx1Z2luX1wiK2kpfHx0LmRhdGEodGhpcyxcInBsdWdpbl9cIitpLG5ldyBvKHRoaXMsZSkpfSk7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGUmJlwiX1wiIT09ZVswXSYmXCJpbml0XCIhPT1lKXt2YXIgcztyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIG49dC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSk7bnx8KG49dC5kYXRhKHRoaXMsXCJwbHVnaW5fXCIraSxuZXcgbyh0aGlzLGUpKSksbiBpbnN0YW5jZW9mIG8mJlwiZnVuY3Rpb25cIj09dHlwZW9mIG5bZV0mJihzPW5bZV0uYXBwbHkobixBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChyLDEpKSksXCJkZXN0cm95XCI9PT1lJiZ0LmRhdGEodGhpcyxcInBsdWdpbl9cIitpLG51bGwpfSksdm9pZCAwIT09cz9zOnRoaXN9fX0pOyIsInZhciBub3RpZmljYXRpb24gPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBjb250ZWluZXI7XG4gIHZhciBtb3VzZU92ZXIgPSAwO1xuICB2YXIgdGltZXJDbGVhckFsbCA9IG51bGw7XG4gIHZhciBhbmltYXRpb25FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCc7XG4gIHZhciB0aW1lID0gMTAwMDA7XG5cbiAgdmFyIG5vdGlmaWNhdGlvbl9ib3ggPWZhbHNlO1xuICB2YXIgaXNfaW5pdD1mYWxzZTtcbiAgdmFyIGNvbmZpcm1fb3B0PXtcbiAgICB0aXRsZTpcItCj0LTQsNC70LXQvdC40LVcIixcbiAgICBxdWVzdGlvbjpcItCS0Ysg0LTQtdC50YHRgtCy0LjRgtC10LvRjNC90L4g0YXQvtGC0LjRgtC1INGD0LTQsNC70LjRgtGMP1wiLFxuICAgIGJ1dHRvblllczpcItCU0LBcIixcbiAgICBidXR0b25ObzpcItCd0LXRglwiLFxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxuICAgIGNhbGxiYWNrTm86ZmFsc2UsXG4gICAgb2JqOmZhbHNlLFxuICAgIGJ1dHRvblRhZzonZGl2JyxcbiAgICBidXR0b25ZZXNEb3A6JycsXG4gICAgYnV0dG9uTm9Eb3A6JycsXG4gIH07XG4gIHZhciBhbGVydF9vcHQ9e1xuICAgIHRpdGxlOlwiXCIsXG4gICAgcXVlc3Rpb246XCLQodC+0L7QsdGJ0LXQvdC40LVcIixcbiAgICBidXR0b25ZZXM6XCLQlNCwXCIsXG4gICAgY2FsbGJhY2tZZXM6ZmFsc2UsXG4gICAgYnV0dG9uVGFnOidkaXYnLFxuICAgIG9iajpmYWxzZSxcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIGluaXQoKXtcbiAgICBpc19pbml0PXRydWU7XG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xuICAgIGlmKG5vdGlmaWNhdGlvbl9ib3gubGVuZ3RoPjApcmV0dXJuO1xuXG4gICAgJCgnYm9keScpLmFwcGVuZChcIjxkaXYgY2xhc3M9J25vdGlmaWNhdGlvbl9ib3gnPjwvZGl2PlwiKTtcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XG5cbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsJy5ub3RpZnlfY29udHJvbCcsY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2Nsb3NlJyxjbG9zZU1vZGFsKTtcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsY2xvc2VNb2RhbEZvbik7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCl7XG4gICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xuICAgICQoJy5ub3RpZmljYXRpb25fYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoJycpXG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpe1xuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgaWYodGFyZ2V0LmNsYXNzTmFtZT09XCJub3RpZmljYXRpb25fYm94XCIpe1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBfc2V0VXBMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5ub3RpZmljYXRpb25fY2xvc2UnLCBfY2xvc2VQb3B1cCk7XG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcbiAgfTtcblxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwhPW51bGwpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lckNsZWFyQWxsKTtcbiAgICAgIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xuICAgIH1cbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbihpKXtcbiAgICAgIHZhciBvcHRpb249JCh0aGlzKS5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmKG9wdGlvbi50aW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAxO1xuICB9O1xuXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKGkpe1xuICAgICAgJHRoaXM9JCh0aGlzKTtcbiAgICAgIHZhciBvcHRpb249JHRoaXMuZGF0YSgnb3B0aW9uJyk7XG4gICAgICBpZihvcHRpb24udGltZT4wKSB7XG4gICAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChvcHRpb24uY2xvc2UpLCBvcHRpb24udGltZSAtIDE1MDAgKyAxMDAgKiBpKTtcbiAgICAgICAgJHRoaXMuZGF0YSgnb3B0aW9uJyxvcHRpb24pXG4gICAgICB9XG4gICAgfSk7XG4gICAgbW91c2VPdmVyID0gMDtcbiAgfTtcblxuICB2YXIgX2Nsb3NlUG9wdXAgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpO1xuICAgICR0aGlzLm9uKGFuaW1hdGlvbkVuZCwgZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgIH0pO1xuICAgICR0aGlzLmFkZENsYXNzKCdub3RpZmljYXRpb25faGlkZScpXG4gIH07XG5cbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSl7XG4gICAgaWYoIWRhdGEpZGF0YT17fTtcbiAgICBkYXRhPW9iamVjdHMoYWxlcnRfb3B0LGRhdGEpO1xuXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xuXG4gICAgbm90eWZ5X2NsYXNzPSdub3RpZnlfYm94ICc7XG4gICAgaWYoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzKz1kYXRhLm5vdHlmeV9jbGFzcztcblxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwiJytub3R5ZnlfY2xhc3MrJ1wiPic7XG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPCcrZGF0YS5idXR0b25UYWcrJyBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCIgJytkYXRhLmJ1dHRvblllc0RvcCsnPicgKyBkYXRhLmJ1dHRvblllcyArICc8LycrZGF0YS5idXR0b25UYWcrJz4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJytkYXRhLmJ1dHRvbk5vRG9wKyc+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH07XG5cbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LDEwMClcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbmZpcm0oZGF0YSl7XG4gICAgaWYoIWRhdGEpZGF0YT17fTtcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XG5cbiAgICBpZighaXNfaW5pdClpbml0KCk7XG5cbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3hcIj4nO1xuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cblxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tZZXMuYmluZChkYXRhLm9iaikpO1xuICAgIH1cbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LDEwMClcblxuICB9XG5cbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcbiAgICBpZighZGF0YSlkYXRhPXt9O1xuICAgIHZhciBvcHRpb24gPSB7dGltZSA6IChkYXRhLnRpbWV8fGRhdGEudGltZT09PTApP2RhdGEudGltZTp0aW1lfTtcbiAgICBpZiAoIWNvbnRlaW5lcikge1xuICAgICAgY29udGVpbmVyID0gJCgnPHVsLz4nLCB7XG4gICAgICAgICdjbGFzcyc6ICdub3RpZmljYXRpb25fY29udGFpbmVyJ1xuICAgICAgfSk7XG5cbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoY29udGVpbmVyKTtcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xuICAgIH1cblxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25faXRlbSdcbiAgICB9KTtcblxuICAgIGlmIChkYXRhLnR5cGUpe1xuICAgICAgbGkuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9pdGVtLScgKyBkYXRhLnR5cGUpO1xuICAgIH1cblxuICAgIHZhciBjbG9zZT0kKCc8c3Bhbi8+Jyx7XG4gICAgICBjbGFzczonbm90aWZpY2F0aW9uX2Nsb3NlJ1xuICAgIH0pO1xuICAgIG9wdGlvbi5jbG9zZT1jbG9zZTtcbiAgICBsaS5hcHBlbmQoY2xvc2UpO1xuXG4gICAgdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcbiAgICAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxuICAgIH0pO1xuXG4gICAgaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XG4gICAgICB2YXIgdGl0bGUgPSAkKCc8aDUvPicsIHtcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcbiAgICAgIH0pO1xuICAgICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlKTtcbiAgICB9XG5cbiAgICB2YXIgdGV4dD0gJCgnPGRpdi8+Jyx7XG4gICAgICBjbGFzczpcIm5vdGlmaWNhdGlvbl90ZXh0XCJcbiAgICB9KTtcbiAgICB0ZXh0Lmh0bWwoZGF0YS5tZXNzYWdlKTtcblxuICAgIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XG4gICAgICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcbiAgICAgIH0pO1xuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XG4gICAgICB2YXIgd3JhcCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwid3JhcFwiXG4gICAgICB9KTtcblxuICAgICAgd3JhcC5hcHBlbmQoaW1nKTtcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xuICAgICAgY29udGVudC5hcHBlbmQod3JhcCk7XG4gICAgfWVsc2V7XG4gICAgICBjb250ZW50LmFwcGVuZCh0ZXh0KTtcbiAgICB9XG4gICAgbGkuYXBwZW5kKGNvbnRlbnQpO1xuXG4gICAgLy9cbiAgICAvLyBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcbiAgICAvLyAgIHZhciB0aXRsZSA9ICQoJzxwLz4nLCB7XG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXG4gICAgLy8gICB9KTtcbiAgICAvLyAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XG4gICAgLy8gICBsaS5hcHBlbmQodGl0bGUpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XG4gICAgLy8gICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcbiAgICAvLyAgIH0pO1xuICAgIC8vICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XG4gICAgLy8gICBsaS5hcHBlbmQoaW1nKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xuICAgIC8vICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXG4gICAgLy8gfSk7XG4gICAgLy8gY29udGVudC5odG1sKGRhdGEubWVzc2FnZSk7XG4gICAgLy9cbiAgICAvLyBsaS5hcHBlbmQoY29udGVudCk7XG4gICAgLy9cbiAgICAgY29udGVpbmVyLmFwcGVuZChsaSk7XG5cbiAgICBpZihvcHRpb24udGltZT4wKXtcbiAgICAgIG9wdGlvbi50aW1lcj1zZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQoY2xvc2UpLCBvcHRpb24udGltZSk7XG4gICAgfVxuICAgIGxpLmRhdGEoJ29wdGlvbicsb3B0aW9uKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhbGVydDogYWxlcnQsXG4gICAgY29uZmlybTogY29uZmlybSxcbiAgICBub3RpZmk6IG5vdGlmaSxcbiAgfTtcblxufSkoKTtcblxuXG4kKCdbcmVmPXBvcHVwXScpLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpe1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzPSQodGhpcyk7XG4gIGVsPSQoJHRoaXMuYXR0cignaHJlZicpKTtcbiAgZGF0YT1lbC5kYXRhKCk7XG5cbiAgZGF0YS5xdWVzdGlvbj1lbC5odG1sKCk7XG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcbn0pO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywnLm1vZGFsc19vcGVuJyxmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgLy/Qv9GA0Lgg0L7RgtC60YDRi9GC0LjQuCDRhNC+0YDQvNGLINGA0LXQs9C40YHRgtGA0LDRhtC40Lgg0LfQsNC60YDRi9GC0YwsINC10YHQu9C4INC+0YLRgNGL0YLQviAtINC/0L7Qv9Cw0L8g0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40Y8g0LrRg9C/0L7QvdCwINCx0LXQtyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4XG4gICAgICAgIHZhciBwb3B1cCA9ICQoXCJhW2hyZWY9JyNzaG93cHJvbW9jb2RlLW5vcmVnaXN0ZXInXVwiKS5kYXRhKCdwb3B1cCcpO1xuICAgICAgICBpZiAocG9wdXApIHtcbiAgICAgICAgICAgIHBvcHVwLmNsb3NlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3B1cCA9ICQoJ2Rpdi5wb3B1cF9jb250LCBkaXYucG9wdXBfYmFjaycpO1xuICAgICAgICAgICAgaWYgKHBvcHVwKSB7XG4gICAgICAgICAgICAgICAgcG9wdXAuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcbiAgICAgICAgaHJlZj1ocmVmW2hyZWYubGVuZ3RoLTFdO1xuXG4gICAgICAgIGRhdGE9e1xuICAgICAgICAgICAgYnV0dG9uWWVzOmZhbHNlLFxuICAgICAgICAgICAgbm90eWZ5X2NsYXNzOlwibG9hZGluZyBcIisoaHJlZi5pbmRleE9mKCd2aWRlbycpPT09MD8nbW9kYWxzLWZ1bGxfc2NyZWVuJzonbm90aWZ5X3doaXRlJyksXG4gICAgICAgICAgICBxdWVzdGlvbjonJ1xuICAgICAgICB9O1xuICAgICAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG5cbiAgICAgICAgJC5nZXQoJy8nK2hyZWYsZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAkKCcubm90aWZ5X2JveCcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAgICAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKGRhdGEuaHRtbCk7XG4gICAgICAgICAgICBhamF4Rm9ybSgkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKSk7XG4gICAgICAgIH0sJ2pzb24nKTtcblxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pXG59KCkpO1xuIiwiJCgnLmZvb3Rlci1tZW51LXRpdGxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgJHRoaXM9JCh0aGlzKTtcbiAgaWYoJHRoaXMuaGFzQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKSl7XG4gICAgJHRoaXMucmVtb3ZlQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKVxuICB9ZWxzZXtcbiAgICAkKCcuZm9vdGVyLW1lbnUtdGl0bGVfb3BlbicpLnJlbW92ZUNsYXNzKCdmb290ZXItbWVudS10aXRsZV9vcGVuJyk7XG4gICAgJHRoaXMuYWRkQ2xhc3MoJ2Zvb3Rlci1tZW51LXRpdGxlX29wZW4nKTtcbiAgfVxuXG59KTsiLCIkKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gc3Rhck5vbWluYXRpb24oaW5kZXgpIHtcbiAgICB2YXIgc3RhcnMgPSAkKFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiKTtcbiAgICBzdGFycy5hZGRDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XG4gICAgICBzdGFycy5lcShpKS5yZW1vdmVDbGFzcyhcInJhdGluZy1zdGFyLW9wZW5cIik7XG4gICAgfVxuICB9XG5cbiAgJChkb2N1bWVudCkub24oXCJtb3VzZW92ZXJcIiwgXCIucmF0aW5nLXdyYXBwZXIgLnJhdGluZy1zdGFyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XG4gIH0pLm9uKFwibW91c2VsZWF2ZVwiLCBcIi5yYXRpbmctd3JhcHBlclwiLCBmdW5jdGlvbiAoZSkge1xuICAgIHN0YXJOb21pbmF0aW9uKCQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCkpO1xuICB9KS5vbihcImNsaWNrXCIsIFwiLnJhdGluZy13cmFwcGVyIC5yYXRpbmctc3RhclwiLCBmdW5jdGlvbiAoZSkge1xuICAgIHN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xuXG4gICAgJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoJCh0aGlzKS5pbmRleCgpICsgMSk7XG4gIH0pO1xufSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgdmFyICRub3R5ZmlfYnRuPSQoJy5oZWFkZXItbG9nb19ub3R5Jyk7XG4gIGlmKCRub3R5ZmlfYnRuLmxlbmd0aD09MSlyZXR1cm47XG5cbiAgJC5nZXQoJy9hY2NvdW50L25vdGlmaWNhdGlvbicsZnVuY3Rpb24oZGF0YSl7XG4gICAgaWYoIWRhdGEubm90aWZpY2F0aW9ucyB8fCBkYXRhLm5vdGlmaWNhdGlvbnMubGVuZ3RoPT0wKSByZXR1cm47XG5cbiAgICB2YXIgb3V0PSc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LWJveD48dWwgY2xhc3M9XCJoZWFkZXItbm90eS1saXN0XCI+JztcbiAgICAkbm90eWZpX2J0bi5maW5kKCdhJykucmVtb3ZlQXR0cignaHJlZicpO1xuICAgIHZhciBoYXNfbmV3PWZhbHNlO1xuICAgIGZvciAodmFyIGk9MDtpPGRhdGEubm90aWZpY2F0aW9ucy5sZW5ndGg7aSsrKXtcbiAgICAgIGVsPWRhdGEubm90aWZpY2F0aW9uc1tpXTtcbiAgICAgIHZhciBpc19uZXc9KGVsLmlzX3ZpZXdlZD09MSk7XG4gICAgICBvdXQrPSc8bGkgY2xhc3M9XCJoZWFkZXItbm90eS1pdGVtJysoaXNfbmV3PycgaGVhZGVyLW5vdHktaXRlbV9uZXcnOicnKSsnXCI+JztcbiAgICAgIG91dCs9JzxkaXYgY2xhc3M9aGVhZGVyLW5vdHktZGF0YT4nK2VsLmRhdGErJzwvZGl2Pic7XG4gICAgICBvdXQrPSc8ZGl2IGNsYXNzPWhlYWRlci1ub3R5LXRleHQ+JytlbC50ZXh0Kyc8L2Rpdj4nO1xuICAgICAgb3V0Kz0nPC9saT4nO1xuICAgICAgaGFzX25ldz1oYXNfbmV3fHxpc19uZXc7XG4gICAgfVxuXG4gICAgb3V0Kz0nPC91bD4nO1xuICAgIG91dCs9JzxhIGNsYXNzPVwiYnRuXCIgaHJlZj1cIi9hY2NvdW50L25vdGlmaWNhdGlvblwiPicrZGF0YS5idG4rJzwvYT4nO1xuICAgIG91dCs9JzwvZGl2Pic7XG4gICAgJCgnLmhlYWRlcicpLmFwcGVuZChvdXQpO1xuXG4gICAgaWYoaGFzX25ldyl7XG4gICAgICAkbm90eWZpX2J0bi5hZGRDbGFzcygndG9vbHRpcCcpLmFkZENsYXNzKCdoYXMtbm90eScpO1xuICAgIH1cblxuICAgICRub3R5ZmlfYnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZigkKCcuaGVhZGVyLW5vdHktYm94JykuaGFzQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJykpe1xuICAgICAgICAkKCcuaGVhZGVyLW5vdHktYm94JykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1ub3R5LWJveF9vcGVuJyk7XG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnbm9fc2Nyb2xfbGFwdG9wX21pbicpO1xuICAgICAgfWVsc2V7XG4gICAgICAgICQoJy5oZWFkZXItbm90eS1ib3gnKS5hZGRDbGFzcygnaGVhZGVyLW5vdHktYm94X29wZW4nKTtcbiAgICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdub19zY3JvbF9sYXB0b3BfbWluJyk7XG5cbiAgICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcygnaGFzLW5vdHknKSl7XG4gICAgICAgICAgJC5wb3N0KCcvYWNjb3VudC9ub3RpZmljYXRpb24nLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKCcuaGVhZGVyLWxvZ29fbm90eScpLnJlbW92ZUNsYXNzKCd0b29sdGlwJykucmVtb3ZlQ2xhc3MoJ2hhcy1ub3R5Jyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnLmNvbnRlbnQtd3JhcCcpLm9uKCdtb3VzZWRvd24nLGZ1bmN0aW9uKGUpe1xuICAgICAgJCgnLmhlYWRlci1ub3R5LWJveCcpLnJlbW92ZUNsYXNzKCdoZWFkZXItbm90eS1ib3hfb3BlbicpXG4gICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ25vX3Njcm9sX2xhcHRvcF9taW4nKTtcbiAgICB9KVxuICB9LCdqc29uJyk7XG5cbn0pKCk7IiwidmFyIGhlYWRlckFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuICAgIHZhciBzaGFkb3dlZERvd24gPSBmYWxzZTtcblxuICAgICQoJy5tZW51LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKCcuaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAgICAgJCgnLmRyb3AtbWVudScpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKS5yZW1vdmVDbGFzcygnY2xvc2UnKTtcbiAgICB9KTtcblxuICAgICQoJyNoZWFkZXInKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQuaWQgPT0gJ2hlYWRlcicpIHtcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hlYWRlcl9vcGVuLW1lbnUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnLnNlYXJjaC10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCgnLmhlYWRlci1zZWFyY2gnKS50b2dnbGVDbGFzcygnb3BlbicpO1xuICAgICAgICAkKCcjYXV0b2NvbXBsZXRlJykuZmFkZU91dCgpO1xuICAgIH0pO1xuXG4gICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lX2Nsb3NlJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgICQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xuICAgIH0pO1xuXG4gICAgJCgnLmhlYWRlci11cGxpbmUnKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICQoJy5oZWFkZXItc2Vjb25kbGluZScpLnJlbW92ZUNsYXNzKCdzY3JvbGwtZG93bicpO1xuICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgICB9KTtcblxuICAgICQoJy50b29sdGlwJykudGlwc28oe1xuICAgICAgICBiYWNrZ3JvdW5kIDogJyM0QTRBNEEnLFxuICAgICAgICBzaXplOiAnc21hbGwnLFxuICAgICAgICBvbkJlZm9yZVNob3cgOiBmdW5jdGlvbihlbGUsIHRpcHNvKSB7XG4gICAgICAgICAgICBpZiAoZWxlLmRhdGEoJ3R5cGUnKT09J2pzb24nKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gZWxlLmRhdGEoJ3Rvb2x0aXAnKTtcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9ICc8dWwgY2xhc3M9XCJub3R5LWxpc3RcIj4nO1xuICAgICAgICAgICAgICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxsaSBjbGFzcz1cIm5vdHktbGlzdF9pdGVtXCI+PHNwYW4gY2xhc3M9XCJub3R5LWxpc3RfaXRlbS10eXBlXCI+JytpdGVtLnR5cGUrXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9zcGFuPjxzcGFuIGNsYXNzPVwibm90eS1saXN0X2l0ZW0tdGV4dFwiPicraXRlbS50ZXh0Kyc8L3NwYW4+PC9saT4nO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzwvdWw+JztcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnQgPSBodG1sO1xuICAgICAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZCA9ICcjY2NjJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50ID0gZWxlLmRhdGEoJ3Rvb2x0aXAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cblxuICAgICQod2luZG93KS5vbignbG9hZCByZXNpemUgc2Nyb2xsJyxmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNoYWRvd0hlaWdodCA9IDUwO1xuICAgICAgICB2YXIgaGlkZUhlaWdodCA9IDIwMDtcbiAgICAgICAgdmFyIGhlYWRlclNlY29uZExpbmUgPSAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKTtcbiAgICAgICAgdmFyIGhvdmVycyA9IGhlYWRlclNlY29uZExpbmUuZmluZCgnOmhvdmVyJyk7XG4gICAgICAgIHZhciBoZWFkZXIgPSAkKCcuaGVhZGVyJyk7XG5cbiAgICAgICAgaWYgKCFob3ZlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgICAgICAgICBoZWFkZXIucmVtb3ZlQ2xhc3MoJ3Njcm9sbGFibGUnKTtcbiAgICAgICAgICAgIC8vZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuICAgICAgICAgICAgdmFyIHNjcm9sbFRvcD0kKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICBpZiAoc2Nyb2xsVG9wID4gc2hhZG93SGVpZ2h0ICYmIHNoYWRvd2VkRG93biA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBzaGFkb3dlZERvd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGhlYWRlclNlY29uZExpbmUuYWRkQ2xhc3MoJ3NoYWRvd2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2Nyb2xsVG9wIDw9IHNoYWRvd0hlaWdodCAmJiBzaGFkb3dlZERvd24gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBzaGFkb3dlZERvd24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzaGFkb3dlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNjcm9sbFRvcCA+IGhpZGVIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHNjcm9sbGVkRG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsLWRvd24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzY3JvbGxUb3AgPD0gaGlkZUhlaWdodCAmJiBzY3JvbGxlZERvd24gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoZWFkZXJTZWNvbmRMaW5lLnJlbW92ZUNsYXNzKCdzY3JvbGwtZG93bicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGVhZGVyU2Vjb25kTGluZS5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xuICAgICAgICAgICAgaGVhZGVyLmFkZENsYXNzKCdzY3JvbGxhYmxlJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgICQoJy5tZW51X2FuZ2xlLWRvd24nKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIHBhcmVudCA9ICQodGhpcykuY2xvc2VzdCgnLmRyb3AtbWVudV9ncm91cF9fdXAsIC5tZW51LWdyb3VwJyk7XG4gICAgICAgIHZhciBwYXJlbnRNZW51ID0gJCh0aGlzKS5jbG9zZXN0KCcuZHJvcC1tZW51Jyk7XG4gICAgICAgIGlmIChwYXJlbnRNZW51KSB7XG4gICAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICAkKHBhcmVudCkuc2libGluZ3MoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgICQocGFyZW50KS50b2dnbGVDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgaWYgKHBhcmVudC5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAgICAgICAgICAgJChwYXJlbnQpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5hZGRDbGFzcygnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50TWVudSkge1xuICAgICAgICAgICAgICAgICAgICAkKHBhcmVudE1lbnUpLnNpYmxpbmdzKCd1bCcpLmNoaWxkcmVuKCdsaScpLmFkZENsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJChwYXJlbnQpLnNpYmxpbmdzKCdsaScpLnJlbW92ZUNsYXNzKCdjbG9zZScpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRNZW51KSB7XG4gICAgICAgICAgICAgICAgICAgICQocGFyZW50TWVudSkuc2libGluZ3MoJ3VsJykuY2hpbGRyZW4oJ2xpJykucmVtb3ZlQ2xhc3MoJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgdmFyIGFjY291bnRNZW51VGltZU91dCA9IG51bGw7XG4gICAgJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgbWVudSA9ICQoJy5hY2NvdW50LW1lbnUnKTtcbiAgICAgICAgaWYgKG1lbnUpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChhY2NvdW50TWVudVRpbWVPdXQpO1xuICAgICAgICAgICAgbWVudS50b2dnbGVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICBpZiAoIW1lbnUuaGFzQ2xhc3MoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICAgICAgYWNjb3VudE1lbnVUaW1lT3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAgICAgICAgIH0sIDcwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9KTtcblxuXG4gICAgJCgnLmhlYWRlci1zZWFyY2hfZm9ybS1pbnB1dCcpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBxdWVyeSA9ICQodGhpcykudmFsKCk7XG4gICAgICAgIHZhciBhdXRvY29tcGxldGUgPSAkKCcjYXV0b2NvbXBsZXRlJyksXG4gICAgICAgICAgICBhdXRvY29tcGxldGVMaXN0ID0gJChhdXRvY29tcGxldGUpLmZpbmQoJ3VsJyk7XG4gICAgICAgIGlmIChxdWVyeS5sZW5ndGg+MSkge1xuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvc2VhcmNoJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnZ2V0JyxcbiAgICAgICAgICAgICAgICBkYXRhOiB7cXVlcnk6IHF1ZXJ5fSxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlTGlzdCkuaHRtbCgnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5zdWdnZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zLmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gJzxhIGhyZWY9XCIvc3RvcmVzLycraXRlbS5kYXRhLnJvdXRlKydcIicrJz4nK2l0ZW0udmFsdWUraXRlbS5jYXNoYmFjaysnPC9hPic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmFwcGVuZChsaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChhdXRvY29tcGxldGUpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAkKGF1dG9jb21wbGV0ZUxpc3QpLmh0bWwoJycpO1xuICAgICAgICAgICAgICAgICQoYXV0b2NvbXBsZXRlKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pLm9uKCdmb2N1c291dCcsZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnI2F1dG9jb21wbGV0ZScpLmhpZGUoKTtcbiAgICB9KTtcblxuXG5cbn0oKTtcblxuXG5cblxuIl19
