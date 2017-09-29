//$(window).load(function() {

var accordionControl = $('.accordion .accordion-control');

accordionControl.on('click', function (e) {
    e.preventDefault();
    $this = $(this);
    $accordion = $this.closest('.accordion');

    if ($accordion.hasClass('open')) {
      $accordion.find('.accordion-content').hide(300);
      $accordion.removeClass('open')
    } else {
      $accordion.find('.accordion-content').show(300);
      $accordion.addClass('open')
    }
    return false;
  });
accordionControl.show();
//})

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

    src=img.css('background-image');
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

(function() {
  els=$('.ajax_load');
  for(i=0;i<els.length;i++){
    el=els.eq(i);
    url=el.attr('res');
    $.get(url,function (data) {
      $this=$(this);
      $this.html(data);
      ajaxForm($this);
    }.bind(el))
  }
})();

$('input[type=file]').on('change',function(evt){
  var file = evt.target.files; // FileList object
  var f = file[0];
  // Only process image files.
  if (!f.type.match('image.*')) {
    return false;
  }
  var reader = new FileReader();

  data= {
    'el': this,
    'f': f
  };
  reader.onload = (function(data) {
    return function(e) {
      img=$('[for="'+data.el.name+'"]');
      if(img.length>0){
        img.attr('src',e.target.result)
      }
    };
  })(data);
  // Read in the image file as a data URL.
  reader.readAsDataURL(f);
});

$('body').on('click','a.ajaxFormOpen',function(e){
  e.preventDefault();
  href=this.href.split('#');
  href=href[href.length-1];

  data={
    buttonYes:false,
    notyfy_class:"notify_white loading",
    question:''
  };
  modal_class=$(this).data('modal-class');

  notification.alert(data);
  $.get('/'+href,function(data){
    $('.notify_box').removeClass('loading');
    $('.notify_box .notify_content').html(data.html);
    ajaxForm($('.notify_box .notify_content'));
    if(modal_class){
      $('.notify_box .notify_content .row').addClass(modal_class);
    }
  },'json')
});

//проверка блокировщика рекламы
// CookieChecker.setCallback(function(cookieAllowed, adblockEnabled) {
//   console.log('Cookie Checker callback');
//
//   console.log(cookieAllowed);
//   console.log(adblockEnabled);
// });

setTimeout(function () {
  CookieChecker.run()
}, 2000);

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

    if(data.title && data.title.length>0) {
      var title = $('<p/>', {
        class: "notification_title"
      });
      title.html(data.title);
      li.append(title);
    }

    if(data.img && data.img.length>0) {
      var img = $('<div/>', {
        class: "notification_img"
      });
      img.css('background-image','url('+data.img+')');
      li.append(img);
    }

    var content = $('<div/>',{
      class:"notification_content"
    });
    content.html(data.message);

    li.append(content);

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
    wrap.html('<h3>Упс... Возникла непредвиденная ошибка.<h3>' +
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
$('.action_user_confirm').click(function () {
    if (!confirm()){
        return false;
    }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcl9hbGwuanMiLCJub3RpZmljYXRpb24uanMiLCJqcXVlcnkuYWpheEZvcm0uanMiLCJiMmIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8kKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcclxuXHJcbnZhciBhY2NvcmRpb25Db250cm9sID0gJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKTtcclxuXHJcbmFjY29yZGlvbkNvbnRyb2wub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgICRhY2NvcmRpb24gPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uJyk7XHJcblxyXG4gICAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmhpZGUoMzAwKTtcclxuICAgICAgJGFjY29yZGlvbi5yZW1vdmVDbGFzcygnb3BlbicpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNob3coMzAwKTtcclxuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcbmFjY29yZGlvbkNvbnRyb2wuc2hvdygpO1xyXG4vL30pXHJcblxyXG5vYmplY3RzID0gZnVuY3Rpb24gKGEsYikge1xyXG4gIHZhciBjID0gYixcclxuICAgIGtleTtcclxuICBmb3IgKGtleSBpbiBhKSB7XHJcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgIGNba2V5XSA9IGtleSBpbiBiID8gYltrZXldIDogYVtrZXldO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gYztcclxufTtcclxuXHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICBkYXRhPXRoaXM7XHJcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcclxuICAgICAgZGF0YS5pbWcuYXR0cignc3JjJywgZGF0YS5zcmMpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGRhdGEuaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJytkYXRhLnNyYysnKScpO1xyXG4gICAgICBkYXRhLmltZy5yZW1vdmVDbGFzcygnbm9fYXZhJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL9GC0LXRgdGCINC70L7Qs9C+INC80LDQs9Cw0LfQuNC90LBcclxuICBpbWdzPSQoJ3NlY3Rpb246bm90KC5uYXZpZ2F0aW9uKScpLmZpbmQoJy5sb2dvIGltZycpO1xyXG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XHJcbiAgICBpbWc9aW1ncy5lcShpKTtcclxuICAgIHNyYz1pbWcuYXR0cignc3JjJyk7XHJcbiAgICBpbWcuYXR0cignc3JjJywnL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZycpO1xyXG4gICAgZGF0YT17XHJcbiAgICAgIHNyYzpzcmMsXHJcbiAgICAgIGltZzppbWcsXHJcbiAgICAgIHR5cGU6MCAvLyDQtNC70Y8gaW1nW3NyY11cclxuICAgIH07XHJcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcclxuICAgICAgc3JjOnNyY1xyXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxyXG4gIH1cclxuXHJcbiAgLy/RgtC10YHRgiDQsNCy0LDRgtCw0YDQvtC6INCyINC60L7QvNC10L3RgtCw0YDQuNGP0YVcclxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvJyk7XHJcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcclxuICAgIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgaWYoaW1nLmhhc0NsYXNzKCdub19hdmEnKSl7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHNyYz1pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyk7XHJcbiAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybChcIicsJycpO1xyXG4gICAgc3JjPXNyYy5yZXBsYWNlKCdcIiknLCcnKTtcclxuICAgIGltZy5hZGRDbGFzcygnbm9fYXZhJyk7XHJcblxyXG4gICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgvaW1hZ2VzL25vX2F2YS5wbmcpJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgc3JjOnNyYyxcclxuICAgICAgaW1nOmltZyxcclxuICAgICAgdHlwZToxIC8vINC00LvRjyDRhNC+0L3QvtCy0YvRhSDQutCw0YDRgtC40L3QvtC6XHJcbiAgICB9O1xyXG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XHJcbiAgICAgIHNyYzpzcmNcclxuICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcclxuICB9XHJcbn0pO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gIGVscz0kKCcuYWpheF9sb2FkJyk7XHJcbiAgZm9yKGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcclxuICAgIGVsPWVscy5lcShpKTtcclxuICAgIHVybD1lbC5hdHRyKCdyZXMnKTtcclxuICAgICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgICAkdGhpcy5odG1sKGRhdGEpO1xyXG4gICAgICBhamF4Rm9ybSgkdGhpcyk7XHJcbiAgICB9LmJpbmQoZWwpKVxyXG4gIH1cclxufSkoKTtcclxuXHJcbiQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJyxmdW5jdGlvbihldnQpe1xyXG4gIHZhciBmaWxlID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XHJcbiAgdmFyIGYgPSBmaWxlWzBdO1xyXG4gIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cclxuICBpZiAoIWYudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICBkYXRhPSB7XHJcbiAgICAnZWwnOiB0aGlzLFxyXG4gICAgJ2YnOiBmXHJcbiAgfTtcclxuICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGltZz0kKCdbZm9yPVwiJytkYXRhLmVsLm5hbWUrJ1wiXScpO1xyXG4gICAgICBpZihpbWcubGVuZ3RoPjApe1xyXG4gICAgICAgIGltZy5hdHRyKCdzcmMnLGUudGFyZ2V0LnJlc3VsdClcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KShkYXRhKTtcclxuICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXHJcbiAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZik7XHJcbn0pO1xyXG5cclxuJCgnYm9keScpLm9uKCdjbGljaycsJ2EuYWpheEZvcm1PcGVuJyxmdW5jdGlvbihlKXtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcclxuICBocmVmPWhyZWZbaHJlZi5sZW5ndGgtMV07XHJcblxyXG4gIGRhdGE9e1xyXG4gICAgYnV0dG9uWWVzOmZhbHNlLFxyXG4gICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIGxvYWRpbmdcIixcclxuICAgIHF1ZXN0aW9uOicnXHJcbiAgfTtcclxuICBtb2RhbF9jbGFzcz0kKHRoaXMpLmRhdGEoJ21vZGFsLWNsYXNzJyk7XHJcblxyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcclxuICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcclxuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcclxuICAgIGlmKG1vZGFsX2NsYXNzKXtcclxuICAgICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50IC5yb3cnKS5hZGRDbGFzcyhtb2RhbF9jbGFzcyk7XHJcbiAgICB9XHJcbiAgfSwnanNvbicpXHJcbn0pO1xyXG5cclxuLy/Qv9GA0L7QstC10YDQutCwINCx0LvQvtC60LjRgNC+0LLRidC40LrQsCDRgNC10LrQu9Cw0LzRi1xyXG4vLyBDb29raWVDaGVja2VyLnNldENhbGxiYWNrKGZ1bmN0aW9uKGNvb2tpZUFsbG93ZWQsIGFkYmxvY2tFbmFibGVkKSB7XHJcbi8vICAgY29uc29sZS5sb2coJ0Nvb2tpZSBDaGVja2VyIGNhbGxiYWNrJyk7XHJcbi8vXHJcbi8vICAgY29uc29sZS5sb2coY29va2llQWxsb3dlZCk7XHJcbi8vICAgY29uc29sZS5sb2coYWRibG9ja0VuYWJsZWQpO1xyXG4vLyB9KTtcclxuXHJcbnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gIENvb2tpZUNoZWNrZXIucnVuKClcclxufSwgMjAwMCk7XHJcbiIsInZhciBub3RpZmljYXRpb24gPSAoZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGNvbnRlaW5lcjtcclxuICB2YXIgbW91c2VPdmVyID0gMDtcclxuICB2YXIgdGltZXJDbGVhckFsbCA9IG51bGw7XHJcbiAgdmFyIGFuaW1hdGlvbkVuZCA9ICd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJztcclxuICB2YXIgdGltZSA9IDEwMDAwO1xyXG5cclxuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9ZmFsc2U7XHJcbiAgdmFyIGlzX2luaXQ9ZmFsc2U7XHJcbiAgdmFyIGNvbmZpcm1fb3B0PXtcclxuICAgIHRpdGxlOlwi0KPQtNCw0LvQtdC90LjQtVwiLFxyXG4gICAgcXVlc3Rpb246XCLQktGLINC00LXQudGB0YLQstC40YLQtdC70YzQvdC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjD9cIixcclxuICAgIGJ1dHRvblllczpcItCU0LBcIixcclxuICAgIGJ1dHRvbk5vOlwi0J3QtdGCXCIsXHJcbiAgICBjYWxsYmFja1llczpmYWxzZSxcclxuICAgIGNhbGxiYWNrTm86ZmFsc2UsXHJcbiAgICBvYmo6ZmFsc2UsXHJcbiAgICBidXR0b25UYWc6J2RpdicsXHJcbiAgICBidXR0b25ZZXNEb3A6JycsXHJcbiAgICBidXR0b25Ob0RvcDonJyxcclxuICB9O1xyXG4gIHZhciBhbGVydF9vcHQ9e1xyXG4gICAgdGl0bGU6XCJcIixcclxuICAgIHF1ZXN0aW9uOlwi0KHQvtC+0LHRidC10L3QuNC1XCIsXHJcbiAgICBidXR0b25ZZXM6XCLQlNCwXCIsXHJcbiAgICBjYWxsYmFja1llczpmYWxzZSxcclxuICAgIG9iajpmYWxzZSxcclxuICB9O1xyXG5cclxuXHJcbiAgZnVuY3Rpb24gaW5pdCgpe1xyXG4gICAgaXNfaW5pdD10cnVlO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG4gICAgaWYobm90aWZpY2F0aW9uX2JveC5sZW5ndGg+MClyZXR1cm47XHJcblxyXG4gICAgJCgnYm9keScpLmFwcGVuZChcIjxkaXYgY2xhc3M9J25vdGlmaWNhdGlvbl9ib3gnPjwvZGl2PlwiKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcclxuXHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsJy5ub3RpZnlfY29udHJvbCcsY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsJy5ub3RpZnlfY2xvc2UnLGNsb3NlTW9kYWwpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLGNsb3NlTW9kYWxGb24pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpe1xyXG4gICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xvc2VNb2RhbEZvbihlKXtcclxuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcbiAgICBpZih0YXJnZXQuY2xhc3NOYW1lPT1cIm5vdGlmaWNhdGlvbl9ib3hcIil7XHJcbiAgICAgIGNsb3NlTW9kYWwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHZhciBfc2V0VXBMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcclxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm5vdGlmaWNhdGlvbl9jbG9zZScsIF9jbG9zZVBvcHVwKTtcclxuICAgICQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkVudGVyKTtcclxuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcclxuICB9O1xyXG5cclxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGlmICh0aW1lckNsZWFyQWxsIT1udWxsKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lckNsZWFyQWxsKTtcclxuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbihpKXtcclxuICAgICAgdmFyIG9wdGlvbj0kKHRoaXMpLmRhdGEoJ29wdGlvbicpO1xyXG4gICAgICBpZihvcHRpb24udGltZXIpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAxO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24oaSl7XHJcbiAgICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICAgIHZhciBvcHRpb249JHRoaXMuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmKG9wdGlvbi50aW1lPjApIHtcclxuICAgICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQob3B0aW9uLmNsb3NlKSwgb3B0aW9uLnRpbWUgLSAxNTAwICsgMTAwICogaSk7XHJcbiAgICAgICAgJHRoaXMuZGF0YSgnb3B0aW9uJyxvcHRpb24pXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgbW91c2VPdmVyID0gMDtcclxuICB9O1xyXG5cclxuICB2YXIgX2Nsb3NlUG9wdXAgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbigpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcclxuICAgIH0pO1xyXG4gICAgJHRoaXMuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9oaWRlJylcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBhbGVydChkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoYWxlcnRfb3B0LGRhdGEpO1xyXG5cclxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcclxuXHJcbiAgICBub3R5ZnlfY2xhc3M9J25vdGlmeV9ib3ggJztcclxuICAgIGlmKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcys9ZGF0YS5ub3R5ZnlfY2xhc3M7XHJcblxyXG4gICAgYm94X2h0bWw9JzxkaXYgY2xhc3M9XCInK25vdHlmeV9jbGFzcysnXCI+JztcclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcclxuICAgIGJveF9odG1sKz0nPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xyXG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8JytkYXRhLmJ1dHRvblRhZysnIGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIiAnK2RhdGEuYnV0dG9uWWVzRG9wKyc+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvJytkYXRhLmJ1dHRvblRhZysnPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8JytkYXRhLmJ1dHRvblRhZysnIGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiICcrZGF0YS5idXR0b25Ob0RvcCsnPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvJytkYXRhLmJ1dHRvblRhZysnPic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfTtcclxuXHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xyXG5cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LDEwMClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbmZpcm0oZGF0YSl7XHJcbiAgICBpZighZGF0YSlkYXRhPXt9O1xyXG4gICAgZGF0YT1vYmplY3RzKGNvbmZpcm1fb3B0LGRhdGEpO1xyXG5cclxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcclxuXHJcbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3hcIj4nO1xyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnRpdGxlO1xyXG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xyXG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xyXG5cclxuICAgIGlmKGRhdGEuY2FsbGJhY2tZZXMhPWZhbHNlKXtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tZZXMuYmluZChkYXRhLm9iaikpO1xyXG4gICAgfVxyXG4gICAgaWYoZGF0YS5jYWxsYmFja05vIT1mYWxzZSl7XHJcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgfSwxMDApXHJcblxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICB2YXIgb3B0aW9uID0ge3RpbWUgOiAoZGF0YS50aW1lfHxkYXRhLnRpbWU9PT0wKT9kYXRhLnRpbWU6dGltZX07XHJcbiAgICBpZiAoIWNvbnRlaW5lcikge1xyXG4gICAgICBjb250ZWluZXIgPSAkKCc8dWwvPicsIHtcclxuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XHJcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xyXG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9pdGVtJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGRhdGEudHlwZSl7XHJcbiAgICAgIGxpLmFkZENsYXNzKCdub3RpZmljYXRpb25faXRlbS0nICsgZGF0YS50eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2xvc2U9JCgnPHNwYW4vPicse1xyXG4gICAgICBjbGFzczonbm90aWZpY2F0aW9uX2Nsb3NlJ1xyXG4gICAgfSk7XHJcbiAgICBvcHRpb24uY2xvc2U9Y2xvc2U7XHJcbiAgICBsaS5hcHBlbmQoY2xvc2UpO1xyXG5cclxuICAgIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xyXG4gICAgICB2YXIgdGl0bGUgPSAkKCc8cC8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xyXG4gICAgICBsaS5hcHBlbmQodGl0bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XHJcbiAgICAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXHJcbiAgICAgIH0pO1xyXG4gICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcclxuICAgICAgbGkuYXBwZW5kKGltZyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcclxuICAgICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXHJcbiAgICB9KTtcclxuICAgIGNvbnRlbnQuaHRtbChkYXRhLm1lc3NhZ2UpO1xyXG5cclxuICAgIGxpLmFwcGVuZChjb250ZW50KTtcclxuXHJcbiAgICBjb250ZWluZXIuYXBwZW5kKGxpKTtcclxuXHJcbiAgICBpZihvcHRpb24udGltZT4wKXtcclxuICAgICAgb3B0aW9uLnRpbWVyPXNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChjbG9zZSksIG9wdGlvbi50aW1lKTtcclxuICAgIH1cclxuICAgIGxpLmRhdGEoJ29wdGlvbicsb3B0aW9uKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGFsZXJ0OiBhbGVydCxcclxuICAgIGNvbmZpcm06IGNvbmZpcm0sXHJcbiAgICBub3RpZmk6IG5vdGlmaSxcclxuICB9O1xyXG5cclxufSkoKTtcclxuXHJcblxyXG4kKCdbcmVmPXBvcHVwXScpLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpe1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcz0kKHRoaXMpO1xyXG4gIGVsPSQoJHRoaXMuYXR0cignaHJlZicpKTtcclxuICBkYXRhPWVsLmRhdGEoKTtcclxuXHJcbiAgZGF0YS5xdWVzdGlvbj1lbC5odG1sKCk7XHJcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG59KTtcclxuIiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XHJcbiAgdmFyIGZpbGVBcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IgPyB0cnVlIDogZmFsc2U7XHJcbiAgdmFyIGRlZmF1bHRzID0ge1xyXG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJyxcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBvblBvc3QocG9zdCl7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgZm9ybT1kYXRhLmZvcm07XHJcbiAgICB3cmFwPWRhdGEud3JhcDtcclxuICAgIGlmKHBvc3QucmVuZGVyKXtcclxuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3M9XCJub3RpZnlfd2hpdGVcIjtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHBvc3QpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XHJcbiAgICAgIGFqYXhGb3JtKHdyYXApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25GYWlsKCl7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgZm9ybT1kYXRhLmZvcm07XHJcbiAgICB3cmFwPWRhdGEud3JhcDtcclxuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIHdyYXAuaHRtbCgnPGgzPtCj0L/RgS4uLiDQktC+0LfQvdC40LrQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwLjxoMz4nICtcclxuICAgICAgJzxwPtCn0LDRgdGC0L4g0Y3RgtC+INC/0YDQvtC40YHRhdC+0LTQuNGCINCyINGB0LvRg9GH0LDQtSwg0LXRgdC70Lgg0LLRiyDQvdC10YHQutC+0LvRjNC60L4g0YDQsNC3INC/0L7QtNGA0Y/QtCDQvdC10LLQtdGA0L3QviDQstCy0LXQu9C4INGB0LLQvtC4INGD0YfQtdGC0L3Ri9C1INC00LDQvdC90YvQtS4g0J3QviDQstC+0LfQvNC+0LbQvdGLINC4INC00YDRg9Cz0LjQtSDQv9GA0LjRh9C40L3Riy4g0JIg0LvRjtCx0L7QvCDRgdC70YPRh9Cw0LUg0L3QtSDRgNCw0YHRgdGC0YDQsNC40LLQsNC50YLQtdGB0Ywg0Lgg0L/RgNC+0YHRgtC+INC+0LHRgNCw0YLQuNGC0LXRgdGMINC6INC90LDRiNC10LzRgyDQvtC/0LXRgNCw0YLQvtGA0YMg0YHQu9GD0LbQsdGLINC/0L7QtNC00LXRgNC20LrQuC48L3A+PGJyPicgK1xyXG4gICAgICAnPHA+0KHQv9Cw0YHQuNCx0L4uPC9wPicpO1xyXG4gICAgYWpheEZvcm0od3JhcCk7XHJcblxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25TdWJtaXQoZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgZm9ybT1kYXRhLmZvcm07XHJcbiAgICB3cmFwPWRhdGEud3JhcDtcclxuXHJcbiAgICBpZihmb3JtLnlpaUFjdGl2ZUZvcm0pe1xyXG4gICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIGlzVmFsaWQ9KGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGg9PTApO1xyXG5cclxuICAgIGlmKCFpc1ZhbGlkKXtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHJlcXVpcmVkPWZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQnKTtcclxuICAgICAgZm9yKGk9MDtpPHJlcXVpcmVkLmxlbmd0aDtpKyspe1xyXG4gICAgICAgIGlmKHJlcXVpcmVkLmVxKGkpLnZhbCgpLmxlbmd0aDwxKXtcclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcclxuXHJcbiAgICB2YXIgcG9zdD1mb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xyXG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xyXG4gICAgZm9ybS5odG1sKCcnKTtcclxuXHJcbiAgICAkLnBvc3QoXHJcbiAgICAgIGRhdGEudXJsLFxyXG4gICAgICBwb3N0LFxyXG4gICAgICBvblBvc3QuYmluZChkYXRhKSxcclxuICAgICAgJ2pzb24nXHJcbiAgICApLmZhaWwob25GYWlsLmJpbmQoZGF0YSkpO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGVscy5maW5kKCdbcmVxdWlyZWRdJylcclxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxyXG4gICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJyk7XHJcblxyXG4gIGZvcih2YXIgaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xyXG4gICAgd3JhcD1lbHMuZXEoaSk7XHJcbiAgICBmb3JtPXdyYXAuZmluZCgnZm9ybScpO1xyXG4gICAgZGF0YT17XHJcbiAgICAgIGZvcm06Zm9ybSxcclxuICAgICAgcGFyYW06ZGVmYXVsdHMsXHJcbiAgICAgIHdyYXA6d3JhcFxyXG4gICAgfTtcclxuICAgIGRhdGEudXJsPWZvcm0uYXR0cignYWN0aW9uJykgfHwgbG9jYXRpb24uaHJlZjtcclxuICAgIGRhdGEubWV0aG9kPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcclxuICAgIGZvcm0ub2ZmKCdzdWJtaXQnKTtcclxuICAgIGZvcm0ub24oJ3N1Ym1pdCcsIG9uU3VibWl0LmJpbmQoZGF0YSkpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWRkU1JPKCl7XHJcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbyA9IHt9O1xyXG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XHJcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAob1t0aGlzLm5hbWVdKSB7XHJcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xyXG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9bdGhpcy5uYW1lXSA9IHRoaXMudmFsdWUgfHwgJyc7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG87XHJcbiAgfTtcclxufTtcclxuYWRkU1JPKCk7IiwiJCgnLmFjdGlvbl91c2VyX2NvbmZpcm0nKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoIWNvbmZpcm0oKSl7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59KTtcclxuIl19
