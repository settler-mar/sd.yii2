function ajaxForm(els) {
  var fileApi = window.File && window.FileReader && window.FileList && window.Blob ? true : false;
  var defaults = {
    error_class: '.has-error',
  };

  function onSubmit(e){
    e.preventDefault();
    var data=this;
    form=data.form;

    form.yiiActiveForm('validate');
    isValid=(form.find(data.param.error_class).length==0)

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

    post=form.serializeObject();
    $('.notify_box').addClass('loading');
    $('.notify_box .notify_content').html('');

    $.post(data.url,post,function(data){
      if(data.render){
        data.notyfy_class="notify_white";
        notification.alert(data);
      }else{
        $('.notify_box').removeClass('loading');
        $('.notify_box .notify_content').html(data.html);
        ajaxForm($('.notify_box .ajax_form'));
      }
    },'json');

    return false;
  }

  els.find('[required]')
    .addClass('required')
    .removeAttr('required');

  for(var i=0;i<els.length;i++){
    form=els.eq(i);
    data={
      form:form,
      param:defaults
    };
    data.url=form.attr('action') || location.href;
    data.method= form.attr('method') || 'post';
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