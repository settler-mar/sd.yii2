$('body').on('click','a[href=#login],a[href=#registration],a[href=#resetpassword],a.ajaxFormOpen',function(e){
  e.preventDefault();
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