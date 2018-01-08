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
$('.menu-toggle').click(function(e) {
    e.preventDefault();
    $('.header').toggleClass('header_open-menu');
});

$('.search-toggle').click(function(e) {
    e.preventDefault();
    $('.header-search').toggleClass('open');
});

$('.header-secondline_close').click(function(e){
    $('.header').removeClass('header_open-menu');
});

var scrolledDown = false;

window.onscroll = function() {
    var scrollHeight = 50;
    if (document.documentElement.scrollTop > scrollHeight && scrolledDown === false) {
        scrolledDown = true;
        $('.header-secondline').addClass('scroll-down');
    }
    if (document.documentElement.scrollTop <= scrollHeight && scrolledDown === true) {
        scrolledDown = false;
        $('.header-secondline').removeClass('scroll-down');
    }
};

$('.menu_angle-down').click(function(e) {
   e.preventDefault();
   var parent = $(this).closest('.drop-menu_group__up, .menu-group');
   if (parent) {
       $(parent).siblings('li').removeClass('open');
       $(parent).toggleClass('open');
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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcm9sbC5qcyIsImFjY29yZGlvbi5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsInNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAodywgZCwgJCkge1xuICAgIHZhciBzY3JvbGxzX2Jsb2NrID0gJCgnLnNjcm9sbF9ib3gnKTtcblxuICAgIGlmKHNjcm9sbHNfYmxvY2subGVuZ3RoPT0wKSByZXR1cm47XG4gICAgLy8kKCc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC13cmFwXCI+PC9kaXY+Jykud3JhcEFsbChzY3JvbGxzX2Jsb2NrKTtcbiAgICAkKHNjcm9sbHNfYmxvY2spLndyYXAoJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LXdyYXBcIj48L2Rpdj4nKTtcblxuICAgIGluaXRfc2Nyb2xsKCk7XG4gICAgY2FsY19zY3JvbGwoKTtcblxuICAgIHZhciB0MSx0MjtcblxuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24gKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodDEpO1xuICAgICAgICBjbGVhclRpbWVvdXQodDIpO1xuICAgICAgICB0MT1zZXRUaW1lb3V0KGNhbGNfc2Nyb2xsLDMwMCk7XG4gICAgICAgIHQyPXNldFRpbWVvdXQoY2FsY19zY3JvbGwsODAwKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGluaXRfc2Nyb2xsKCkge1xuICAgICAgICB2YXIgY29udHJvbCA9ICc8ZGl2IGNsYXNzPVwic2Nyb2xsX2JveC1jb250cm9sXCI+PC9kaXY+JztcbiAgICAgICAgY29udHJvbD0kKGNvbnRyb2wpO1xuICAgICAgICBjb250cm9sLmluc2VydEFmdGVyKHNjcm9sbHNfYmxvY2spO1xuICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIDApO1xuXG4gICAgICAgIHNjcm9sbHNfYmxvY2sucHJlcGVuZCgnPGRpdiBjbGFzcz1zY3JvbGxfYm94LW1vdmVyPjwvZGl2PicpO1xuXG4gICAgICAgIGNvbnRyb2wub24oJ2NsaWNrJywnLnNjcm9sbF9ib3gtY29udHJvbF9wb2ludCcsZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgIHZhciBjb250cm9sID0gJHRoaXMucGFyZW50KCk7XG4gICAgICAgICAgICB2YXIgaSA9ICR0aGlzLmluZGV4KCk7XG4gICAgICAgICAgICBpZigkdGhpcy5oYXNDbGFzcygnYWN0aXZlJykpcmV0dXJuO1xuICAgICAgICAgICAgY29udHJvbC5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgICAgICAgICB2YXIgZHg9Y29udHJvbC5kYXRhKCdzbGlkZS1keCcpO1xuICAgICAgICAgICAgdmFyIGVsID0gY29udHJvbC5wcmV2KCk7XG4gICAgICAgICAgICBlbC5maW5kKCcuc2Nyb2xsX2JveC1tb3ZlcicpLmNzcygnbWFyZ2luLWxlZnQnLC1keCppKTtcbiAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgaSk7XG5cbiAgICAgICAgICAgIHN0b3BTY3JvbC5iaW5kKGVsKSgpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2Nyb2xsc19ibG9jay5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGopO1xuICAgICAgICBlbC5wYXJlbnQoKS5ob3ZlcihzdG9wU2Nyb2wuYmluZChlbCksc3RhcnRTY3JvbC5iaW5kKGVsKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RhcnRTY3JvbCgpe1xuICAgICAgICB2YXIgJHRoaXM9JCh0aGlzKTtcbiAgICAgICAgaWYoISR0aGlzLmhhc0NsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIikpcmV0dXJuO1xuXG4gICAgICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUuYmluZCgkdGhpcyksIDIwMDApO1xuICAgICAgICAkdGhpcy5kYXRhKCdzbGlkZS10aW1lb3V0SWQnLHRpbWVvdXRJZClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdG9wU2Nyb2woKXtcbiAgICAgICAgdmFyICR0aGlzPSQodGhpcyk7XG4gICAgICAgIHZhciB0aW1lb3V0SWQ9JHRoaXMuZGF0YSgnc2xpZGUtdGltZW91dElkJyk7XG4gICAgICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsZmFsc2UpO1xuICAgICAgICBpZighJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSB8fCAhdGltZW91dElkKXJldHVybjtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcbiAgICAgICAgdmFyICR0aGlzPSQodGhpcyk7XG4gICAgICAgICR0aGlzLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcsZmFsc2UpO1xuICAgICAgICBpZighJHRoaXMuaGFzQ2xhc3MoXCJzY3JvbGxfYm94LWFjdGl2ZVwiKSlyZXR1cm47XG5cbiAgICAgICAgdmFyIGNvbnRyb2xzPSR0aGlzLm5leHQoKS5maW5kKCc+KicpO1xuICAgICAgICB2YXIgYWN0aXZlPSR0aGlzLmRhdGEoJ3NsaWRlLWFjdGl2ZScpO1xuICAgICAgICB2YXIgcG9pbnRfY250PWNvbnRyb2xzLmxlbmd0aDtcbiAgICAgICAgaWYoIWFjdGl2ZSlhY3RpdmU9MDtcbiAgICAgICAgYWN0aXZlKys7XG4gICAgICAgIGlmKGFjdGl2ZT49cG9pbnRfY250KWFjdGl2ZT0wO1xuICAgICAgICAkdGhpcy5kYXRhKCdzbGlkZS1hY3RpdmUnLCBhY3RpdmUpO1xuXG4gICAgICAgIGNvbnRyb2xzLmVxKGFjdGl2ZSkuY2xpY2soKTtcbiAgICAgICAgc3RhcnRTY3JvbC5iaW5kKCR0aGlzKSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGNfc2Nyb2xsKCkge1xuICAgICAgICBmb3IoaT0wO2k8c2Nyb2xsc19ibG9jay5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICB2YXIgZWwgPSBzY3JvbGxzX2Jsb2NrLmVxKGkpO1xuICAgICAgICAgICAgdmFyIGNvbnRyb2wgPSBlbC5uZXh0KCk7XG4gICAgICAgICAgICB2YXIgd2lkdGhfbWF4ID0gZWwuZGF0YSgnc2Nyb2xsLXdpZHRoLW1heCcpO1xuICAgICAgICAgICAgdyA9IGVsLndpZHRoKCk7XG5cbiAgICAgICAgICAgIC8v0LTQtdC70LDQtdC8INC60L7QvdGC0YDQvtC70Ywg0L7Qs9GA0LDQvdC40YfQtdC90LjRjyDRiNC40YDQuNC90YsuINCV0YHQu9C4INC/0YDQtdCy0YvRiNC10L3QviDRgtC+INC+0YLQutC70Y7Rh9Cw0LXQvCDRgdC60YDQvtC7INC4INC/0LXRgNC10YXQvtC00LjQvCDQuiDRgdC70LXQtNGD0Y7RidC10LzRgyDRjdC70LXQvNC10L3RgtGDXG4gICAgICAgICAgICBpZiAod2lkdGhfbWF4ICYmIHcgPiB3aWR0aF9tYXgpIHtcbiAgICAgICAgICAgICAgICBjb250cm9sLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG5vX2NsYXNzID0gZWwuZGF0YSgnc2Nyb2xsLWVsZW1ldC1pZ25vcmUtY2xhc3MnKTtcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IGVsLmZpbmQoJz4qJykubm90KCcuc2Nyb2xsX2JveC1tb3ZlcicpO1xuICAgICAgICAgICAgaWYgKG5vX2NsYXNzKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5ub3QoJy4nICsgbm9fY2xhc3MpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v0JXRgdC70Lgg0L3QtdGCINC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuID09IDApIHtcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcInNjcm9sbF9ib3gtYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtYWN0aXZlJywgMCk7IC8v0YHQsdGA0L7RgSDRgdGH0LXRgtGH0LjQutCwXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBmX2VsPWNoaWxkcmVuLmVxKDEpO1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuX3cgPSBmX2VsLm91dGVyV2lkdGgoKTsgLy/QstGB0LXQs9C+INC00L7Rh9C10YDQvdC40YUg0LTQu9GPINGB0LrRgNC+0LvQsFxuICAgICAgICAgICAgY2hpbGRyZW5fdys9cGFyc2VGbG9hdChmX2VsLmNzcygnbWFyZ2luLWxlZnQnKSk7XG4gICAgICAgICAgICBjaGlsZHJlbl93Kz1wYXJzZUZsb2F0KGZfZWwuY3NzKCdtYXJnaW4tcmlnaHQnKSk7XG5cbiAgICAgICAgICAgIHZhciBzY3JlYW5fY291bnQgPSBNYXRoLmZsb29yKHcgLyBjaGlsZHJlbl93KTtcblxuICAgICAgICAgICAgLy/QldGB0LvQuCDQstGB0LUg0LLQu9Cw0LfQuNGCINC90LAg0Y3QutGA0LDQvVxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuIDw9IHNjcmVhbl9jb3VudCkge1xuICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgY29udHJvbC5kYXRhKCdzbGlkZS1hY3RpdmUnLCAwKTsgLy/RgdCx0YDQvtGBINGB0YfQtdGC0YfQuNC60LBcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/Qo9C20LUg0YLQvtGH0L3QviDQt9C90LDQtdC8INGH0YLQviDRgdC60YDQvtC7INC90YPQttC10L1cbiAgICAgICAgICAgIGVsLmFkZENsYXNzKFwic2Nyb2xsX2JveC1hY3RpdmVcIik7XG5cbiAgICAgICAgICAgIHZhciBwb2ludF9jbnQgPSBjaGlsZHJlbi5sZW5ndGggLSBzY3JlYW5fY291bnQgKyAxO1xuICAgICAgICAgICAgLy/QtdGB0LvQuCDQvdC1INC90LDQtNC+INC+0LHQvdC+0LLQu9GP0YLRjCDQutC+0L3RgtGA0L7QuyDRgtC+INCy0YvRhdC+0LTQuNC8LCDQvdC1INC30LDQsdGL0LLQsNGPINC+0LHQvdC+0LLQuNGC0Ywg0YjQuNGA0LjQvdGDINC00L7Rh9C10YDQvdC40YVcbiAgICAgICAgICAgIGlmIChjb250cm9sLmZpbmQoJz4qJykubGVuZ3RoID09IHBvaW50X2NudCkge1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWN0aXZlID0gZWwuZGF0YSgnc2xpZGUtYWN0aXZlJyk7XG4gICAgICAgICAgICBpZiAoIWFjdGl2ZSlhY3RpdmUgPSAwO1xuICAgICAgICAgICAgaWYgKGFjdGl2ZSA+PSBwb2ludF9jbnQpYWN0aXZlID0gcG9pbnRfY250IC0gMTtcbiAgICAgICAgICAgIHZhciBvdXQgPSAnJztcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcG9pbnRfY250OyBqKyspIHtcbiAgICAgICAgICAgICAgICBvdXQgKz0gJzxkaXYgY2xhc3M9XCJzY3JvbGxfYm94LWNvbnRyb2xfcG9pbnQnKyhqPT1hY3RpdmU/JyBhY3RpdmUnOicnKSsnXCI+PC9kaXY+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRyb2wuaHRtbChvdXQpO1xuXG4gICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWFjdGl2ZScsIGFjdGl2ZSk7XG4gICAgICAgICAgICBjb250cm9sLmRhdGEoJ3NsaWRlLWNvdW50JywgcG9pbnRfY250KTtcbiAgICAgICAgICAgIGNvbnRyb2wuZGF0YSgnc2xpZGUtZHgnLCBjaGlsZHJlbl93KTtcblxuICAgICAgICAgICAgaWYoIWVsLmRhdGEoJ3NsaWRlLXRpbWVvdXRJZCcpKXtcbiAgICAgICAgICAgICAgICBzdGFydFNjcm9sLmJpbmQoZWwpKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSkpOyIsInZhciBhY2NvcmRpb25Db250cm9sID0gJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKTtcblxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcblxuICAgIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgLyppZigkYWNjb3JkaW9uLmhhc0NsYXNzKCdhY2NvcmRpb24tc2xpbScpKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSovXG4gICAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuaGlkZSgzMDApO1xuICAgICAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZigkYWNjb3JkaW9uLmhhc0NsYXNzKCdhY2NvcmRpb24tc2xpbScpKXtcbiAgICAgICAgICAgICRvdGhlcj0kYWNjb3JkaW9uLnBhcmVudCgpLmZpbmQoJy5hY2NvcmRpb24tc2xpbScpO1xuICAgICAgICAgICAgJG90aGVyLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpXG4gICAgICAgICAgICAgICAgLmhpZGUoMzAwKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnYWNjb3JkaW9uLWNvbnRlbnRfbGFzdC1vcGVuJyk7XG4gICAgICAgICAgICAkb3RoZXIucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgICRvdGhlci5yZW1vdmVDbGFzcygnbGFzdC1vcGVuJyk7XG5cbiAgICAgICAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50X2xhc3Qtb3BlbicpO1xuICAgICAgICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnbGFzdC1vcGVuJyk7XG4gICAgICAgIH1cbiAgICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zaG93KDMwMCk7XG4gICAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufSk7XG5hY2NvcmRpb25Db250cm9sLnNob3coKTtcblxuLy/QtNC70Y8gY2J2amQgam5yaHNkZnR2IDEt0LlcbmFjY29yZGlvblNsaW09JCgnLmFjY29yZGlvbi5hY2NvcmRpb24tc2xpbScpO1xuaWYoYWNjb3JkaW9uU2xpbS5sZW5ndGg+MCl7XG4gICAgYWNjb3JkaW9uU2xpbS5wYXJlbnQoKS5maW5kKCcuYWNjb3JkaW9uLXNsaW06Zmlyc3QtY2hpbGQnKVxuICAgICAgICAuYWRkQ2xhc3MoJ29wZW4nKVxuICAgICAgICAuYWRkQ2xhc3MoJ2xhc3Qtb3BlbicpXG4gICAgICAgIC5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKVxuICAgICAgICAgICAgLnNob3coMzAwKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdhY2NvcmRpb24tY29udGVudF9sYXN0LW9wZW4nKTtcbn1cbiIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xuICB2YXIgZmlsZUFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiA/IHRydWUgOiBmYWxzZTtcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcicsXG4gIH07XG5cbiAgZnVuY3Rpb24gb25Qb3N0KHBvc3Qpe1xuICAgIHZhciBkYXRhPXRoaXM7XG4gICAgZm9ybT1kYXRhLmZvcm07XG4gICAgd3JhcD1kYXRhLndyYXA7XG4gICAgaWYocG9zdC5yZW5kZXIpe1xuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3M9XCJub3RpZnlfd2hpdGVcIjtcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcbiAgICB9ZWxzZXtcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xuICAgICAgYWpheEZvcm0od3JhcCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25GYWlsKCl7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBmb3JtPWRhdGEuZm9ybTtcbiAgICB3cmFwPWRhdGEud3JhcDtcbiAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgd3JhcC5odG1sKCc8aDM+0KPQv9GBLi4uINCS0L7Qt9C90LjQutC70LAg0L3QtdC/0YDQtdC00LLQuNC00LXQvdC90LDRjyDQvtGI0LjQsdC60LA8aDM+JyArXG4gICAgICAnPHA+0KfQsNGB0YLQviDRjdGC0L4g0L/RgNC+0LjRgdGF0L7QtNC40YIg0LIg0YHQu9GD0YfQsNC1LCDQtdGB0LvQuCDQstGLINC90LXRgdC60L7Qu9GM0LrQviDRgNCw0Lcg0L/QvtC00YDRj9C0INC90LXQstC10YDQvdC+INCy0LLQtdC70Lgg0YHQstC+0Lgg0YPRh9C10YLQvdGL0LUg0LTQsNC90L3Ri9C1LiDQndC+INCy0L7Qt9C80L7QttC90Ysg0Lgg0LTRgNGD0LPQuNC1INC/0YDQuNGH0LjQvdGLLiDQkiDQu9GO0LHQvtC8INGB0LvRg9GH0LDQtSDQvdC1INGA0LDRgdGB0YLRgNCw0LjQstCw0LnRgtC10YHRjCDQuCDQv9GA0L7RgdGC0L4g0L7QsdGA0LDRgtC40YLQtdGB0Ywg0Log0L3QsNGI0LXQvNGDINC+0L/QtdGA0LDRgtC+0YDRgyDRgdC70YPQttCx0Ysg0L/QvtC00LTQtdGA0LbQutC4LjwvcD48YnI+JyArXG4gICAgICAnPHA+0KHQv9Cw0YHQuNCx0L4uPC9wPicpO1xuICAgIGFqYXhGb3JtKHdyYXApO1xuXG4gIH1cblxuICBmdW5jdGlvbiBvblN1Ym1pdChlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBmb3JtPWRhdGEuZm9ybTtcbiAgICB3cmFwPWRhdGEud3JhcDtcblxuICAgIGlmKGZvcm0ueWlpQWN0aXZlRm9ybSl7XG4gICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJyk7XG4gICAgfTtcblxuICAgIGlzVmFsaWQ9KGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGg9PTApO1xuXG4gICAgaWYoIWlzVmFsaWQpe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1lbHNle1xuICAgICAgcmVxdWlyZWQ9Zm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCcpO1xuICAgICAgZm9yKGk9MDtpPHJlcXVpcmVkLmxlbmd0aDtpKyspe1xuICAgICAgICBpZihyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGg8MSl7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZighZm9ybS5zZXJpYWxpemVPYmplY3QpYWRkU1JPKCk7XG5cbiAgICB2YXIgcG9zdD1mb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xuICAgIGZvcm0uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICBmb3JtLmh0bWwoJycpO1xuICAgIHdyYXAuaHRtbCgnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxwPtCe0YLQv9GA0LDQstC60LAg0LTQsNC90L3Ri9GFPC9wPjwvZGl2PicpO1xuXG4gICAgZGF0YS51cmwrPShkYXRhLnVybC5pbmRleE9mKCc/Jyk+MD8nJic6Jz8nKSsncmM9JytNYXRoLnJhbmRvbSgpO1xuXG4gICAgJC5wb3N0KFxuICAgICAgZGF0YS51cmwsXG4gICAgICBwb3N0LFxuICAgICAgb25Qb3N0LmJpbmQoZGF0YSksXG4gICAgICAnanNvbidcbiAgICApLmZhaWwob25GYWlsLmJpbmQoZGF0YSkpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxuICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpO1xuXG4gIGZvcih2YXIgaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xuICAgIHdyYXA9ZWxzLmVxKGkpO1xuICAgIGZvcm09d3JhcC5maW5kKCdmb3JtJyk7XG4gICAgZGF0YT17XG4gICAgICBmb3JtOmZvcm0sXG4gICAgICBwYXJhbTpkZWZhdWx0cyxcbiAgICAgIHdyYXA6d3JhcFxuICAgIH07XG4gICAgZGF0YS51cmw9Zm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xuICAgIGRhdGEubWV0aG9kPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcbiAgICBmb3JtLm9mZignc3VibWl0Jyk7XG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkU1JPKCl7XG4gICQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvID0ge307XG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgJC5lYWNoKGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xuICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xuICAgICAgICB9XG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbztcbiAgfTtcbn07XG5hZGRTUk8oKTsiLCIkKCcubWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJy5oZWFkZXInKS50b2dnbGVDbGFzcygnaGVhZGVyX29wZW4tbWVudScpO1xufSk7XG5cbiQoJy5zZWFyY2gtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcuaGVhZGVyLXNlYXJjaCcpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG59KTtcblxuJCgnLmhlYWRlci1zZWNvbmRsaW5lX2Nsb3NlJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgJCgnLmhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXJfb3Blbi1tZW51Jyk7XG59KTtcblxudmFyIHNjcm9sbGVkRG93biA9IGZhbHNlO1xuXG53aW5kb3cub25zY3JvbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2Nyb2xsSGVpZ2h0ID0gNTA7XG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgPiBzY3JvbGxIZWlnaHQgJiYgc2Nyb2xsZWREb3duID09PSBmYWxzZSkge1xuICAgICAgICBzY3JvbGxlZERvd24gPSB0cnVlO1xuICAgICAgICAkKCcuaGVhZGVyLXNlY29uZGxpbmUnKS5hZGRDbGFzcygnc2Nyb2xsLWRvd24nKTtcbiAgICB9XG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgPD0gc2Nyb2xsSGVpZ2h0ICYmIHNjcm9sbGVkRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICBzY3JvbGxlZERvd24gPSBmYWxzZTtcbiAgICAgICAgJCgnLmhlYWRlci1zZWNvbmRsaW5lJykucmVtb3ZlQ2xhc3MoJ3Njcm9sbC1kb3duJyk7XG4gICAgfVxufTtcblxuJCgnLm1lbnVfYW5nbGUtZG93bicpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgIHZhciBwYXJlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcm9wLW1lbnVfZ3JvdXBfX3VwLCAubWVudS1ncm91cCcpO1xuICAgaWYgKHBhcmVudCkge1xuICAgICAgICQocGFyZW50KS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICQocGFyZW50KS50b2dnbGVDbGFzcygnb3BlbicpO1xuICAgfVxuICAgcmV0dXJuIGZhbHNlO1xufSk7XG5cbnZhciBhY2NvdW50TWVudVRpbWVPdXQgPSBudWxsO1xuJCgnLmFjY291bnQtbWVudS10b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIG1lbnUgPSAkKCcuYWNjb3VudC1tZW51Jyk7XG4gICAgaWYgKG1lbnUpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGFjY291bnRNZW51VGltZU91dCk7XG4gICAgICAgIG1lbnUudG9nZ2xlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICBpZiAoIW1lbnUuaGFzQ2xhc3MoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICBhY2NvdW50TWVudVRpbWVPdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBtZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgICAgIH0sIDcwMDApO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbiJdfQ==
