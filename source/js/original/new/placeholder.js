var placeholder = (function(){
  function run() {
    var els=$('[placeholder]');
    for(var i = 0; i<els.length;i++){
      var el=els.eq(i);
      var text = el.attr('placeholder');
      el.attr('placeholder','');
      if(text.length<2)continue;

      var el_id = el.attr('id');
      if(!el_id){
        el_id='el_forms_'+Math.round(Math.random()*10000);
        el.attr('id',el_id)
      }

      var div = $('<label/>',{
        'class':'placeholder',
        'text': text,
        'for':el_id
      });

      el.before(div);
    }
    els.focus(function(){
      $(this).prev('label').addClass('focused');
    });
    els.blur(function(){
      var inputValue = $(this).val();
      if ( inputValue == "" ) {
        $(this).removeClass('filled');
        $(this).prev('label').removeClass('focused');
      } else {
        $(this).addClass('filled');
      }
    })
  }

  run();
  return run;
})();