(function () {
  $notyfi_btn=$('.header-logo_noty');
  if($notyfi_btn.length==0)return;
  $.get('/account/notification',function(data){
    console.log(data)
  },'json');

})();