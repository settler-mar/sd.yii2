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
    return el.scrollHeight>el.offsetHeight;
  }

  function rebuild(){
    for(var i=0;i<els.length;i++){
      var el=els.eq(i);
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