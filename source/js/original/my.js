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
$("a[href='#comment-popup']").popup({
  content : function() {
    var content = this.ele.parentElement.parentElement.cloneNode(true);
    content.setAttribute('data-comment-id', '9999');
    var div = document.createElement('div');
    div.className = 'comments';
    div.append(content);
    $(div).find('.current-comment__more').remove();
    $(div).find('.comment.list').removeClass('list');
    return div;
  },
  width: 500
});
//пройти по комментам, ограничить длину текста, вставить ссылку "показать полностью"
$('.current-comment').each(function(index, element) {
  var text = $(element).find('.text');
  var comment = $(text).find('.comment');
  if (comment[0].innerHTML.length > 210) {
    var a = document.createElement('a');
    a.className = 'current-comment__more';
    a.setAttribute('href', '#comment-popup');
    a.innerHTML = 'Показать полностью';
    text.append(a);
  }
});