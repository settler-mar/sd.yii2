var file_api = ( window.File && window.FileReader && window.FileList && window.Blob ) ? true : false;

function init_file_prev(obj){
  obj.on('change',function(){
    var file_name;
    var input=this;
    var $this=$(input);

    if( file_api && input.files.length>0 ){
      var prew_blk = $this.closest('.input_file').find('.prew_blk');
      var tpl = prew_blk.find('.img_blk.tpl');
      var save_url=$this.data('url');
      for(var i=0;i<input.files.length;i++){
        add_photo(input.files[i],prew_blk,tpl.clone().removeClass('tpl'),save_url,i)
      }
    }else{
      file_name = $this.val();
    }
    /*if(!file_name.length){
     $this.parent().find('span.image_name').text($this.attr('default_text'))
     }else{
     $this.parent().find('span.image_name').text(file_name)
     }*/
  });
  var el=obj.parent();
  el.find('.clear_photo').click(function(){
    $el=$(this).parent().parent();
    $el.find('img').remove();
    $el.find('input').val('');
    $el.find('.help-block').html('');
    $(this).hide();
  });

  function add_photo(file,prew_blk,tpl,save_url,index) {
    baze_img=tpl.find('.img');
    file_name = file.name;

    var reader = new FileReader();
    //var img = document.createElement("img");
    //img.file = file;

    baze_img
      .addClass('loading');

    reader.onload = (function(aImg,file,index) {
      return function(e) {
        var $data = new FormData();
        $data.append('title', file.name);
        $data.append('file', file);
        $data.append('index', index);

        $.ajax({
          type: 'POST',
          url: save_url,
          data: $data,
          success: function(response) {
            $this=$(this);
            $this.removeClass('loading');
            if(response.err){
              $this.attr('err',response.err)
            }else{
              $this.find('img').attr('src',response.name)
            }
          }.bind(aImg),
          error: function(response) {
            $this=$(this);
            $this.attr('err','Ошибка загрузки')
          }.bind(aImg),
          processData: false,
          contentType: false,
          dataType : "json"
        });

        img = document.createElement("img");
        img.src = e.target.result;
        aImg.append(img);
      };
    })(baze_img,file,index);

    reader.readAsDataURL(file);
    prew_blk.append(tpl);
  }
}

$(function() {

  function onRemove() {
    data = this;
    $this = data.el;
    del_url = data.del_url;
    $this.addClass('loading');

    post={
      path:$this.find('.img img').attr('src')
    };
    $.post(del_url,post,function(data) {
      if (data && data == 'err') {
        this
          .removeClass('loading')
          .attr('err','Ошибка удалния');
        notification.notifi({message: 'Невозможно удалить элемент', type: 'err'});
      }else{
        this.remove();
        notification.notifi({message: 'Фаил успешно удален', type: 'info'});
      }
    }.bind($this)).fail(function(){
      this
        .removeClass('loading')
        .attr('err','Ошибка удалния');
      notification.notifi({message:'Ошибка удалния',type:'err'});
    }.bind($this))
    console.log(this);
  }

  $('body .input_file').on('click', '.del', function () {
    $this = $(this).closest('.img_blk');
    del_url = $this.closest('.input_file').find('.btn-add input[type=file]').data('remove-url');
    data = {
      el: $this,
      del_url: del_url
    };
    notification.confirm({
      callbackYes: onRemove,
      obj: data
    })
  })
});