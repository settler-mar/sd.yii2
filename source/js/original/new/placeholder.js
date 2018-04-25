var placeholder = (function(){
  function onBlur(){
    var inputValue = $(this).val();
    if ( inputValue == "" ) {
      $(this).removeClass('filled');
      $(this).prev('label.placeholder').removeClass('focused');
    } else {
      $(this).addClass('filled');
    }
  }
  function run(par) {
    var els;
    if(!par)
      els=$('[placeholder]');
    else
      els=$(par).find('[placeholder]');

    els.focus(function(){
      $(this).prev('label.placeholder').addClass('focused');
    });
    els.blur(onBlur);

    for(var i = 0; i<els.length;i++){
      var el=els.eq(i);
      var text = el.attr('placeholder');
      el.attr('placeholder','');
      if(text.length<2)continue;

      var inputValue = el.val();
      var el_id = el.attr('id');
      if(!el_id){
        el_id='el_forms_'+Math.round(Math.random()*10000);
        el.attr('id',el_id)
      }

      var div = $('<label/>',{
        'class':'placeholder'+(inputValue.length>0?' focused':''),
        'text': text,
        'for':el_id
      });
      el.before(div);

      onBlur.bind(el)()
    }
  }

  run();
  return run;
})();