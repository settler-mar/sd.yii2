$( document ).ready(function() {
  function declOfNum(number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
  }

  function firstZero(v){
    v=Math.floor(v);
    if(v<10)
      return '0'+v;
    else
      return v;
  }

  var clocks=$('.clock');
  if(clocks.length>0){
    function updateClock(){
      var clocks=$(this);
      var now=new Date();
      for(var i=0;i<clocks.length;i++){
        var c=clocks.eq(i);
        var end=new Date(c.data('end').replace(/-/g, "/"));
        var d=(end.getTime()-now.getTime())/ 1000;

        //если срок прошел
        if(d<=0){
          c.text('Срок действия промокода истек');
          continue;
        }

        //если срок более 30 дней
        if(d>30*60*60*24){
          c.text('Осталось более 30 дней');
          continue;
        }

        var s=d % 60;
        d=(d-s)/60;
        var m=d % 60;
        d=(d-m)/60;
        var h=d % 24;
        d=(d-h)/24;

        var str=firstZero(h)+":"+firstZero(m)+":"+firstZero(s);
        if(d>0){
          str=d+" "+declOfNum(d, ['день', 'дня', 'дней'])+"  "+str;
        }
        c.text("Осталось: "+str);
      }
    }

    setInterval(updateClock.bind(clocks),1000);
    updateClock.bind(clocks)();
  }

  $("a[href='#show-coupon-description']").on('click', function (e) {
    e.preventDefault();
    $(this).closest('.coupons-list_item-content-additional').addClass('open');
  });

  $("a[href='#copy']").on('click', function (e) {
    e.preventDefault();
    var codeElem = $(this).closest('.code').find('.code-text');
    copyToClipboard(codeElem);
  });

  function copyToClipboard(element) {
      var $temp = $("<input>");
      $("body").append($temp);
      $temp.val($(element).text()).select();
      document.execCommand("copy");
      $temp.remove();
  }


});