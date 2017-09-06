;
$(function() {
  function onRemove(){
    $this=$(this);
    post={
      id:$this.attr('uid'),
      type:$this.attr('mode')
    };
    $.post($this.attr('url'),post,function(data){
      if(data && data=='err'){
        alert("Невозможно удалить элемент");
      }

      mode=$this.attr('mode');
      if(!mode){
        mode='rm';
      }

      if(mode='rm') {
        rm = $this.closest('.to_remove');
        rm_class = rm.attr('rm_class');
        if (rm_class) {
          $(rm_class).remove();
        }

        rm.remove();
      }
      if(mode=='reload'){
        location.reload();
        location.href=location.href;
      }
    }).fail(function(){
      alert('Не удается удалить')
    })
  }

  $('body').on('click','.ajax_remove',function(){
    notification.confirm({
      callbackYes:onRemove,
      obj:$(this)
    })
  });

});
