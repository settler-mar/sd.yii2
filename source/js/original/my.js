$('body').on('click','a[href=#login],a[href=#registration],a[href=#resetpassword]',function(e){
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
    notyfy_class:"notify_white loading",
    question:''
  };
  notification.alert(data);
  $.get('/'+href,function(data){
    $('.notify_box').removeClass('loading');
    $('.notify_box .notify_content').html(data.html);
    ajaxForm($('.notify_box .notify_content'));
  },'json')
});

$(function() {
  function starNomination(index) {
    var stars = $(".notify_content .rating .fa-wrapper .fa");
    stars.removeClass("fa-star").addClass("fa-star-o");
    for (var i = 0; i < index; i++) {
      stars.eq(i).removeClass("fa-star-o").addClass("fa-star");
    }
  }

  $(document).on("mouseover", ".notify_content .rating .fa-wrapper .fa", function (e) {
    starNomination($(this).index() + 1);
  }).on("mouseleave", ".notify_content .rating .fa-wrapper", function (e) {
    starNomination($(".notify_content input[name=\"Reviews[rating]\"]").val());
  }).on("click", ".notify_content .rating .fa-wrapper .fa", function (e) {
    starNomination($(this).index() + 1);

    $(".notify_content input[name=\"Reviews[rating]\"]").val($(this).index() + 1);
  });
});

ajaxForm($('.ajax_form'));


$("a[href='#showpromocode-noregister']").popup({
  content : '<div class="coupon-noregister">'+
  '<div class="coupon-noregister__icon"><img src="/images/templates/swa.png" alt=""></div>'+
  '<div class="coupon-noregister__text">Для получения кэшбэка необходимо</br>авторизоваться на сайте</div>' +
  '<div class="coupon-noregister__buttons">'+
  '<a href="goto/coupon:{id}" target="_blank" class="btn  btn-popup">Воспользоваться</br>купоном</br>без регистрации</a>'+
  '<a href="#registration" class="btn btn-popup">Зарегистрироваться</br>и получить</br>ещё и кэшбэк</a>'+
  '</div>'+
  '<div>',
  type : 'html',
  beforeOpen: function() {
    //заменить в контенте {id}
    var id = $(this.ele).data('id');
    this.o.content = this.o.content.replace('{id}', id);
    //если закрыли принудительно, то показать
    popup = $('div.popup_cont, div.popup_back');
    if (popup) {
      popup.show();
    }
  },
  afterOpen: function() {
    $('.popup_content')[0].innerHTML = this.o.content;
  }
});
$(document).on('click',"a[href='#comment-popup']",function(e){
  e.preventDefault();
  var data={
    buttonYes:false,
    notyfy_class:"notify_white notify_not_big"
  };

  $this=$(this);
  var content = $this.closest('.current-comment').clone();
  content=content[0];
  content.className += ' modal-popup';
  var div = document.createElement('div');
  div.className = 'comments';
  div.append(content);
  $(div).find('.current-comment__more').remove();
  $(div).find('.comment.list').removeClass('list');
  data.question= div.outerHTML;

  notification.alert(data);
});

//пройти по комментам, ограничить длину текста, вставить ссылку "показать полностью"
$('.current-comment').each(function(index, element) {
  var text = $(element).find('.text');
  var comment = $(text).find('.comment');

  //var max_h=$(element).height()-text.position().top
  var max_h=$(element).height()+$(element).offset().top-text.offset().top-6;

  if (text.outerHeight() > max_h) {
    var a = document.createElement('a'),
        p = document.createElement('p');
    a.className = 'current-comment__more';
    a.setAttribute('href', '#comment-popup');
    a.innerHTML = 'Показать полностью';
    p.append(a);
    text.append(p);
  }
});

//для точек продаж, события на выбор селектов
$('body').on('change', '#store_point_country', function(e) {
  var data = $('option:selected', this).data('cities');
  data = data.split(',');
  if (data.length > 0) {
    var select = document.getElementById('store_point_city');
    var options = '<option value=""></option>';
    data.forEach(function(item){
      options += '<option value="'+item+'">'+item+'</option>';
    });
    select.innerHTML = options;
  }
});

$('body').on('change', '#store_point_city', function(e) {
  var city = $('option:selected', this).attr('value');
  var country = $('option:selected', $('#store_point_country')).attr('value');
  if (country && city) {
    var points= $('#store-points'),
        items = points.find('.store-points__points_row'),
        visible = false;
    googleMap.hideMarkers();
    googleMap.showMarker(country, city);
    $.each(items, function(index, div){
      if ($(div).data('city') == city && $(div).data('country') == country){
        $(div).show();
        visible = true;
      } else {
        $(div).hide() ;
      }
    });
    if (visible) {
      $(points).removeClass('hidden');
      googleMap.showMap();

    } else {
      $(points).addClass('hidden');
      googleMap.hideMap();
    }
  }
});