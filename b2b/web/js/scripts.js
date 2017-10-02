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

//checkboxes времён работы точек продаж, при кликах функционал
var storesPointCheckboxes = $('.b2b-stores-points-form input[type="checkbox"]');

storesPointCheckboxes.click(function() {
    var name = $(this).attr('name');
    var row = $(this).closest('tr');
    if (name.match(/B2bStoresPoints\[work_time_details\]\[\d*\]\[holiday\]/)) {
        checkDisabled(row, this.checked, 'depends-holiday');
    }
    if (name.match(/B2bStoresPoints\[work_time_details\]\[\d*\]\[24-hour\]/)) {
        checkDisabled(row, this.checked, 'depends-24-hour');
    }
});

//при загрузке проверяем то же, что при клике
$.each(storesPointCheckboxes, function(index, item){
    var name = $(item).attr('name');
    var row = $(item).closest('tr');
    if (name.match(/B2bStoresPoints\[work_time_details\]\[\d*\]\[holiday\]/) && item.checked) {
        checkDisabled(row, true, 'depends-holiday');
    }
    if (name.match(/B2bStoresPoints\[work_time_details\]\[\d*\]\[24-hour\]/) && item.checked) {
        checkDisabled(row, true, 'depends-24-hour');
    }
});

function  checkDisabled(row, checked, className) {
    var inputsCheckbox = $(row).find('input[type="checkbox"].'+className);
    var inputsText = $(row).find('input[type="text"].'+className);
    inputsText.val('');
    inputsCheckbox.attr('checked', false);
    inputsText.attr('disabled', checked);
    inputsCheckbox.attr('disabled', checked);
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcl9hbGwuanMiLCJub3RpZmljYXRpb24uanMiLCJqcXVlcnkuYWpheEZvcm0uanMiLCJiMmIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8kKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcblxudmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xuXG5hY2NvcmRpb25Db250cm9sLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICR0aGlzID0gJCh0aGlzKTtcbiAgICAkYWNjb3JkaW9uID0gJHRoaXMuY2xvc2VzdCgnLmFjY29yZGlvbicpO1xuXG4gICAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5oaWRlKDMwMCk7XG4gICAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcbiAgICB9IGVsc2Uge1xuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zaG93KDMwMCk7XG4gICAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdvcGVuJylcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbmFjY29yZGlvbkNvbnRyb2wuc2hvdygpO1xuLy99KVxuXG5vYmplY3RzID0gZnVuY3Rpb24gKGEsYikge1xuICB2YXIgYyA9IGIsXG4gICAga2V5O1xuICBmb3IgKGtleSBpbiBhKSB7XG4gICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiBjO1xufTtcblxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgZGF0YT10aGlzO1xuICAgIGlmKGRhdGEudHlwZT09MCkge1xuICAgICAgZGF0YS5pbWcuYXR0cignc3JjJywgZGF0YS5zcmMpO1xuICAgIH1lbHNle1xuICAgICAgZGF0YS5pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XG4gICAgICBkYXRhLmltZy5yZW1vdmVDbGFzcygnbm9fYXZhJyk7XG4gICAgfVxuICB9XG5cbiAgLy/RgtC10YHRgiDQu9C+0LPQviDQvNCw0LPQsNC30LjQvdCwXG4gIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJykuZmluZCgnLmxvZ28gaW1nJyk7XG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XG4gICAgaW1nPWltZ3MuZXEoaSk7XG4gICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcbiAgICBpbWcuYXR0cignc3JjJywnL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZycpO1xuICAgIGRhdGE9e1xuICAgICAgc3JjOnNyYyxcbiAgICAgIGltZzppbWcsXG4gICAgICB0eXBlOjAgLy8g0LTQu9GPIGltZ1tzcmNdXG4gICAgfTtcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcbiAgICAgIHNyYzpzcmNcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXG4gIH1cblxuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvJyk7XG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XG4gICAgaW1nPWltZ3MuZXEoaSk7XG4gICAgaWYoaW1nLmhhc0NsYXNzKCdub19hdmEnKSl7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xuICAgIHNyYz1zcmMucmVwbGFjZSgndXJsKFwiJywnJyk7XG4gICAgc3JjPXNyYy5yZXBsYWNlKCdcIiknLCcnKTtcbiAgICBpbWcuYWRkQ2xhc3MoJ25vX2F2YScpO1xuXG4gICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgvaW1hZ2VzL25vX2F2YS5wbmcpJyk7XG4gICAgZGF0YT17XG4gICAgICBzcmM6c3JjLFxuICAgICAgaW1nOmltZyxcbiAgICAgIHR5cGU6MSAvLyDQtNC70Y8g0YTQvtC90L7QstGL0YUg0LrQsNGA0YLQuNC90L7QulxuICAgIH07XG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XG4gICAgICBzcmM6c3JjXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxuICB9XG59KTtcblxuKGZ1bmN0aW9uKCkge1xuICBlbHM9JCgnLmFqYXhfbG9hZCcpO1xuICBmb3IoaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xuICAgIGVsPWVscy5lcShpKTtcbiAgICB1cmw9ZWwuYXR0cigncmVzJyk7XG4gICAgJC5nZXQodXJsLGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAkdGhpcz0kKHRoaXMpO1xuICAgICAgJHRoaXMuaHRtbChkYXRhKTtcbiAgICAgIGFqYXhGb3JtKCR0aGlzKTtcbiAgICB9LmJpbmQoZWwpKVxuICB9XG59KSgpO1xuXG4kKCdpbnB1dFt0eXBlPWZpbGVdJykub24oJ2NoYW5nZScsZnVuY3Rpb24oZXZ0KXtcbiAgdmFyIGZpbGUgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcbiAgdmFyIGYgPSBmaWxlWzBdO1xuICAvLyBPbmx5IHByb2Nlc3MgaW1hZ2UgZmlsZXMuXG4gIGlmICghZi50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgZGF0YT0ge1xuICAgICdlbCc6IHRoaXMsXG4gICAgJ2YnOiBmXG4gIH07XG4gIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICBpbWc9JCgnW2Zvcj1cIicrZGF0YS5lbC5uYW1lKydcIl0nKTtcbiAgICAgIGlmKGltZy5sZW5ndGg+MCl7XG4gICAgICAgIGltZy5hdHRyKCdzcmMnLGUudGFyZ2V0LnJlc3VsdClcbiAgICAgIH1cbiAgICB9O1xuICB9KShkYXRhKTtcbiAgLy8gUmVhZCBpbiB0aGUgaW1hZ2UgZmlsZSBhcyBhIGRhdGEgVVJMLlxuICByZWFkZXIucmVhZEFzRGF0YVVSTChmKTtcbn0pO1xuXG4kKCdib2R5Jykub24oJ2NsaWNrJywnYS5hamF4Rm9ybU9wZW4nLGZ1bmN0aW9uKGUpe1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGhyZWY9dGhpcy5ocmVmLnNwbGl0KCcjJyk7XG4gIGhyZWY9aHJlZltocmVmLmxlbmd0aC0xXTtcblxuICBkYXRhPXtcbiAgICBidXR0b25ZZXM6ZmFsc2UsXG4gICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIGxvYWRpbmdcIixcbiAgICBxdWVzdGlvbjonJ1xuICB9O1xuICBtb2RhbF9jbGFzcz0kKHRoaXMpLmRhdGEoJ21vZGFsLWNsYXNzJyk7XG5cbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcbiAgICAkKCcubm90aWZ5X2JveCcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbChkYXRhLmh0bWwpO1xuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcbiAgICBpZihtb2RhbF9jbGFzcyl7XG4gICAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQgLnJvdycpLmFkZENsYXNzKG1vZGFsX2NsYXNzKTtcbiAgICB9XG4gIH0sJ2pzb24nKVxufSk7XG4iLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgY29udGVpbmVyO1xuICB2YXIgbW91c2VPdmVyID0gMDtcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xuICB2YXIgdGltZSA9IDEwMDAwO1xuXG4gIHZhciBub3RpZmljYXRpb25fYm94ID1mYWxzZTtcbiAgdmFyIGlzX2luaXQ9ZmFsc2U7XG4gIHZhciBjb25maXJtX29wdD17XG4gICAgdGl0bGU6XCLQo9C00LDQu9C10L3QuNC1XCIsXG4gICAgcXVlc3Rpb246XCLQktGLINC00LXQudGB0YLQstC40YLQtdC70YzQvdC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjD9cIixcbiAgICBidXR0b25ZZXM6XCLQlNCwXCIsXG4gICAgYnV0dG9uTm86XCLQndC10YJcIixcbiAgICBjYWxsYmFja1llczpmYWxzZSxcbiAgICBjYWxsYmFja05vOmZhbHNlLFxuICAgIG9iajpmYWxzZSxcbiAgICBidXR0b25UYWc6J2RpdicsXG4gICAgYnV0dG9uWWVzRG9wOicnLFxuICAgIGJ1dHRvbk5vRG9wOicnLFxuICB9O1xuICB2YXIgYWxlcnRfb3B0PXtcbiAgICB0aXRsZTpcIlwiLFxuICAgIHF1ZXN0aW9uOlwi0KHQvtC+0LHRidC10L3QuNC1XCIsXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxuICAgIGJ1dHRvblRhZzonZGl2JyxcbiAgICBvYmo6ZmFsc2UsXG4gIH07XG5cblxuICBmdW5jdGlvbiBpbml0KCl7XG4gICAgaXNfaW5pdD10cnVlO1xuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcblxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xuXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2NvbnRyb2wnLGNsb3NlTW9kYWwpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLGNsb3NlTW9kYWxGb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpe1xuICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWxGb24oZSl7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBpZih0YXJnZXQuY2xhc3NOYW1lPT1cIm5vdGlmaWNhdGlvbl9ib3hcIil7XG4gICAgICBjbG9zZU1vZGFsKCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm5vdGlmaWNhdGlvbl9jbG9zZScsIF9jbG9zZVBvcHVwKTtcbiAgICAkKCdib2R5Jykub24oJ21vdXNlZW50ZXInLCAnLm5vdGlmaWNhdGlvbl9jb250YWluZXInLCBfb25FbnRlcik7XG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uTGVhdmUpO1xuICB9O1xuXG4gIHZhciBfb25FbnRlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodGltZXJDbGVhckFsbCE9bnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2xlYXJBbGwpO1xuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKGkpe1xuICAgICAgdmFyIG9wdGlvbj0kKHRoaXMpLmRhdGEoJ29wdGlvbicpO1xuICAgICAgaWYob3B0aW9uLnRpbWVyKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChvcHRpb24udGltZXIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG1vdXNlT3ZlciA9IDE7XG4gIH07XG5cbiAgdmFyIF9vbkxlYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24oaSl7XG4gICAgICAkdGhpcz0kKHRoaXMpO1xuICAgICAgdmFyIG9wdGlvbj0kdGhpcy5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmKG9wdGlvbi50aW1lPjApIHtcbiAgICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKG9wdGlvbi5jbG9zZSksIG9wdGlvbi50aW1lIC0gMTUwMCArIDEwMCAqIGkpO1xuICAgICAgICAkdGhpcy5kYXRhKCdvcHRpb24nLG9wdGlvbilcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAwO1xuICB9O1xuXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCk7XG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgfSk7XG4gICAgJHRoaXMuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9oaWRlJylcbiAgfTtcblxuICBmdW5jdGlvbiBhbGVydChkYXRhKXtcbiAgICBpZighZGF0YSlkYXRhPXt9O1xuICAgIGRhdGE9b2JqZWN0cyhhbGVydF9vcHQsZGF0YSk7XG5cbiAgICBpZighaXNfaW5pdClpbml0KCk7XG5cbiAgICBub3R5ZnlfY2xhc3M9J25vdGlmeV9ib3ggJztcbiAgICBpZihkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MrPWRhdGEubm90eWZ5X2NsYXNzO1xuXG4gICAgYm94X2h0bWw9JzxkaXYgY2xhc3M9XCInK25vdHlmeV9jbGFzcysnXCI+JztcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnRpdGxlO1xuICAgIGJveF9odG1sKz0nPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEucXVlc3Rpb247XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgaWYoZGF0YS5idXR0b25ZZXN8fGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8JytkYXRhLmJ1dHRvblRhZysnIGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIiAnK2RhdGEuYnV0dG9uWWVzRG9wKyc+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvJytkYXRhLmJ1dHRvblRhZysnPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPCcrZGF0YS5idXR0b25UYWcrJyBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIiAnK2RhdGEuYnV0dG9uTm9Eb3ArJz4nICsgZGF0YS5idXR0b25ObyArICc8LycrZGF0YS5idXR0b25UYWcrJz4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfTtcblxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sMTAwKVxuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKXtcbiAgICBpZighZGF0YSlkYXRhPXt9O1xuICAgIGRhdGE9b2JqZWN0cyhjb25maXJtX29wdCxkYXRhKTtcblxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcblxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XG5cbiAgICBpZihkYXRhLmNhbGxiYWNrWWVzIT1mYWxzZSl7XG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuICAgIGlmKGRhdGEuY2FsbGJhY2tObyE9ZmFsc2Upe1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sMTAwKVxuXG4gIH1cblxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xuICAgIGlmKCFkYXRhKWRhdGE9e307XG4gICAgdmFyIG9wdGlvbiA9IHt0aW1lIDogKGRhdGEudGltZXx8ZGF0YS50aW1lPT09MCk/ZGF0YS50aW1lOnRpbWV9O1xuICAgIGlmICghY29udGVpbmVyKSB7XG4gICAgICBjb250ZWluZXIgPSAkKCc8dWwvPicsIHtcbiAgICAgICAgJ2NsYXNzJzogJ25vdGlmaWNhdGlvbl9jb250YWluZXInXG4gICAgICB9KTtcblxuICAgICAgJCgnYm9keScpLmFwcGVuZChjb250ZWluZXIpO1xuICAgICAgX3NldFVwTGlzdGVuZXJzKCk7XG4gICAgfVxuXG4gICAgdmFyIGxpID0gJCgnPGxpLz4nLCB7XG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9pdGVtJ1xuICAgIH0pO1xuXG4gICAgaWYgKGRhdGEudHlwZSl7XG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XG4gICAgfVxuXG4gICAgdmFyIGNsb3NlPSQoJzxzcGFuLz4nLHtcbiAgICAgIGNsYXNzOidub3RpZmljYXRpb25fY2xvc2UnXG4gICAgfSk7XG4gICAgb3B0aW9uLmNsb3NlPWNsb3NlO1xuICAgIGxpLmFwcGVuZChjbG9zZSk7XG5cbiAgICBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcbiAgICAgIHZhciB0aXRsZSA9ICQoJzxwLz4nLCB7XG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXG4gICAgICB9KTtcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XG4gICAgICBsaS5hcHBlbmQodGl0bGUpO1xuICAgIH1cblxuICAgIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XG4gICAgICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcbiAgICAgIH0pO1xuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XG4gICAgICBsaS5hcHBlbmQoaW1nKTtcbiAgICB9XG5cbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xuICAgICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXG4gICAgfSk7XG4gICAgY29udGVudC5odG1sKGRhdGEubWVzc2FnZSk7XG5cbiAgICBsaS5hcHBlbmQoY29udGVudCk7XG5cbiAgICBjb250ZWluZXIuYXBwZW5kKGxpKTtcblxuICAgIGlmKG9wdGlvbi50aW1lPjApe1xuICAgICAgb3B0aW9uLnRpbWVyPXNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChjbG9zZSksIG9wdGlvbi50aW1lKTtcbiAgICB9XG4gICAgbGkuZGF0YSgnb3B0aW9uJyxvcHRpb24pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFsZXJ0OiBhbGVydCxcbiAgICBjb25maXJtOiBjb25maXJtLFxuICAgIG5vdGlmaTogbm90aWZpLFxuICB9O1xuXG59KSgpO1xuXG5cbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSl7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJHRoaXM9JCh0aGlzKTtcbiAgZWw9JCgkdGhpcy5hdHRyKCdocmVmJykpO1xuICBkYXRhPWVsLmRhdGEoKTtcblxuICBkYXRhLnF1ZXN0aW9uPWVsLmh0bWwoKTtcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xufSk7XG4iLCJmdW5jdGlvbiBhamF4Rm9ybShlbHMpIHtcbiAgdmFyIGZpbGVBcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IgPyB0cnVlIDogZmFsc2U7XG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBlcnJvcl9jbGFzczogJy5oYXMtZXJyb3InLFxuICB9O1xuXG4gIGZ1bmN0aW9uIG9uUG9zdChwb3N0KXtcbiAgICB2YXIgZGF0YT10aGlzO1xuICAgIGZvcm09ZGF0YS5mb3JtO1xuICAgIHdyYXA9ZGF0YS53cmFwO1xuICAgIGlmKHBvc3QucmVuZGVyKXtcbiAgICAgIHBvc3Qubm90eWZ5X2NsYXNzPVwibm90aWZ5X3doaXRlXCI7XG4gICAgICBub3RpZmljYXRpb24uYWxlcnQocG9zdCk7XG4gICAgfWVsc2V7XG4gICAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICB3cmFwLmh0bWwocG9zdC5odG1sKTtcbiAgICAgIGFqYXhGb3JtKHdyYXApO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRmFpbCgpe1xuICAgIHZhciBkYXRhPXRoaXM7XG4gICAgZm9ybT1kYXRhLmZvcm07XG4gICAgd3JhcD1kYXRhLndyYXA7XG4gICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgIHdyYXAuaHRtbCgnPGgzPtCj0L/RgS4uLiDQktC+0LfQvdC40LrQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwLjxoMz4nICtcbiAgICAgICc8cD7Qp9Cw0YHRgtC+INGN0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDQsiDRgdC70YPRh9Cw0LUsINC10YHQu9C4INCy0Ysg0L3QtdGB0LrQvtC70YzQutC+INGA0LDQtyDQv9C+0LTRgNGP0LQg0L3QtdCy0LXRgNC90L4g0LLQstC10LvQuCDRgdCy0L7QuCDRg9GH0LXRgtC90YvQtSDQtNCw0L3QvdGL0LUuINCd0L4g0LLQvtC30LzQvtC20L3RiyDQuCDQtNGA0YPQs9C40LUg0L/RgNC40YfQuNC90YsuINCSINC70Y7QsdC+0Lwg0YHQu9GD0YfQsNC1INC90LUg0YDQsNGB0YHRgtGA0LDQuNCy0LDQudGC0LXRgdGMINC4INC/0YDQvtGB0YLQviDQvtCx0YDQsNGC0LjRgtC10YHRjCDQuiDQvdCw0YjQtdC80YMg0L7Qv9C10YDQsNGC0L7RgNGDINGB0LvRg9C20LHRiyDQv9C+0LTQtNC10YDQttC60LguPC9wPjxicj4nICtcbiAgICAgICc8cD7QodC/0LDRgdC40LHQvi48L3A+Jyk7XG4gICAgYWpheEZvcm0od3JhcCk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU3VibWl0KGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgZGF0YT10aGlzO1xuICAgIGZvcm09ZGF0YS5mb3JtO1xuICAgIHdyYXA9ZGF0YS53cmFwO1xuXG4gICAgaWYoZm9ybS55aWlBY3RpdmVGb3JtKXtcbiAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcbiAgICB9O1xuXG4gICAgaXNWYWxpZD0oZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aD09MCk7XG5cbiAgICBpZighaXNWYWxpZCl7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfWVsc2V7XG4gICAgICByZXF1aXJlZD1mb3JtLmZpbmQoJ2lucHV0LnJlcXVpcmVkJyk7XG4gICAgICBmb3IoaT0wO2k8cmVxdWlyZWQubGVuZ3RoO2krKyl7XG4gICAgICAgIGlmKHJlcXVpcmVkLmVxKGkpLnZhbCgpLmxlbmd0aDwxKXtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcblxuICAgIHZhciBwb3N0PWZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xuICAgIGZvcm0uaHRtbCgnJyk7XG5cbiAgICAkLnBvc3QoXG4gICAgICBkYXRhLnVybCxcbiAgICAgIHBvc3QsXG4gICAgICBvblBvc3QuYmluZChkYXRhKSxcbiAgICAgICdqc29uJ1xuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBlbHMuZmluZCgnW3JlcXVpcmVkXScpXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXG4gICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJyk7XG5cbiAgZm9yKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKyl7XG4gICAgd3JhcD1lbHMuZXEoaSk7XG4gICAgZm9ybT13cmFwLmZpbmQoJ2Zvcm0nKTtcbiAgICBkYXRhPXtcbiAgICAgIGZvcm06Zm9ybSxcbiAgICAgIHBhcmFtOmRlZmF1bHRzLFxuICAgICAgd3JhcDp3cmFwXG4gICAgfTtcbiAgICBkYXRhLnVybD1mb3JtLmF0dHIoJ2FjdGlvbicpIHx8IGxvY2F0aW9uLmhyZWY7XG4gICAgZGF0YS5tZXRob2Q9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xuICAgIGZvcm0ub2ZmKCdzdWJtaXQnKTtcbiAgICBmb3JtLm9uKCdzdWJtaXQnLCBvblN1Ym1pdC5iaW5kKGRhdGEpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRTUk8oKXtcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG8gPSB7fTtcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XG4gICAgICAgIH1cbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvO1xuICB9O1xufTtcbmFkZFNSTygpOyIsIiQoJy5hY3Rpb25fdXNlcl9jb25maXJtJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgIGlmICghY29uZmlybSgpKXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0pO1xuXG4vL2NoZWNrYm94ZXMg0LLRgNC10LzRkdC9INGA0LDQsdC+0YLRiyDRgtC+0YfQtdC6INC/0YDQvtC00LDQtiwg0L/RgNC4INC60LvQuNC60LDRhSDRhNGD0L3QutGG0LjQvtC90LDQu1xudmFyIHN0b3Jlc1BvaW50Q2hlY2tib3hlcyA9ICQoJy5iMmItc3RvcmVzLXBvaW50cy1mb3JtIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXScpO1xuXG5zdG9yZXNQb2ludENoZWNrYm94ZXMuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5hbWUgPSAkKHRoaXMpLmF0dHIoJ25hbWUnKTtcbiAgICB2YXIgcm93ID0gJCh0aGlzKS5jbG9zZXN0KCd0cicpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9CMmJTdG9yZXNQb2ludHNcXFt3b3JrX3RpbWVfZGV0YWlsc1xcXVxcW1xcZCpcXF1cXFtob2xpZGF5XFxdLykpIHtcbiAgICAgICAgY2hlY2tEaXNhYmxlZChyb3csIHRoaXMuY2hlY2tlZCwgJ2RlcGVuZHMtaG9saWRheScpO1xuICAgIH1cbiAgICBpZiAobmFtZS5tYXRjaCgvQjJiU3RvcmVzUG9pbnRzXFxbd29ya190aW1lX2RldGFpbHNcXF1cXFtcXGQqXFxdXFxbMjQtaG91clxcXS8pKSB7XG4gICAgICAgIGNoZWNrRGlzYWJsZWQocm93LCB0aGlzLmNoZWNrZWQsICdkZXBlbmRzLTI0LWhvdXInKTtcbiAgICB9XG59KTtcblxuLy/Qv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDQv9GA0L7QstC10YDRj9C10Lwg0YLQviDQttC1LCDRh9GC0L4g0L/RgNC4INC60LvQuNC60LVcbiQuZWFjaChzdG9yZXNQb2ludENoZWNrYm94ZXMsIGZ1bmN0aW9uKGluZGV4LCBpdGVtKXtcbiAgICB2YXIgbmFtZSA9ICQoaXRlbSkuYXR0cignbmFtZScpO1xuICAgIHZhciByb3cgPSAkKGl0ZW0pLmNsb3Nlc3QoJ3RyJyk7XG4gICAgaWYgKG5hbWUubWF0Y2goL0IyYlN0b3Jlc1BvaW50c1xcW3dvcmtfdGltZV9kZXRhaWxzXFxdXFxbXFxkKlxcXVxcW2hvbGlkYXlcXF0vKSAmJiBpdGVtLmNoZWNrZWQpIHtcbiAgICAgICAgY2hlY2tEaXNhYmxlZChyb3csIHRydWUsICdkZXBlbmRzLWhvbGlkYXknKTtcbiAgICB9XG4gICAgaWYgKG5hbWUubWF0Y2goL0IyYlN0b3Jlc1BvaW50c1xcW3dvcmtfdGltZV9kZXRhaWxzXFxdXFxbXFxkKlxcXVxcWzI0LWhvdXJcXF0vKSAmJiBpdGVtLmNoZWNrZWQpIHtcbiAgICAgICAgY2hlY2tEaXNhYmxlZChyb3csIHRydWUsICdkZXBlbmRzLTI0LWhvdXInKTtcbiAgICB9XG59KTtcblxuZnVuY3Rpb24gIGNoZWNrRGlzYWJsZWQocm93LCBjaGVja2VkLCBjbGFzc05hbWUpIHtcbiAgICB2YXIgaW5wdXRzQ2hlY2tib3ggPSAkKHJvdykuZmluZCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdLicrY2xhc3NOYW1lKTtcbiAgICB2YXIgaW5wdXRzVGV4dCA9ICQocm93KS5maW5kKCdpbnB1dFt0eXBlPVwidGV4dFwiXS4nK2NsYXNzTmFtZSk7XG4gICAgaW5wdXRzVGV4dC52YWwoJycpO1xuICAgIGlucHV0c0NoZWNrYm94LmF0dHIoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgaW5wdXRzVGV4dC5hdHRyKCdkaXNhYmxlZCcsIGNoZWNrZWQpO1xuICAgIGlucHV0c0NoZWNrYm94LmF0dHIoJ2Rpc2FibGVkJywgY2hlY2tlZCk7XG59XG4iXX0=
