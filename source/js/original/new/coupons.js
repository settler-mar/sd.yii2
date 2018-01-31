$( document ).ready(function() {
  $("a[href='#showpromocode-noregister']").on('click', function (e) {
    e.preventDefault();
    var id = $(this).data('id');
    console.log(id);
    var data = {
      buttonYes: false,
      notyfy_class: "notify_white notify_not_big",
      question: '<div class="coupon-noregister">' +
      '<div class="coupon-noregister__icon"><img src="/images/templates/swa.png" alt=""></div>' +
      '<div class="coupon-noregister__text"><b>Если вы хотите получать еще и КЭШБЭК (возврат денег), вам необходимо зарегистрироваться. Но можете и просто воспользоваться купоном, без кэшбэка.</b></div>' +
      '<div class="coupon-noregister__buttons">' +
      '<a href="goto/coupon:' + id + '" target="_blank" class="btn  btn-popup2">Использовать купон</a>' +
      '<a href="#registration" class="btn btn-popup2 btn-revert">Зарегистрироваться</a>' +
      '</div>' +
      '<div>'
    };
    notification.alert(data)
  });

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
          c.text('Cрок действия истёк');
          $(c).closest('.coupons-list_item').find('.coupons-list_item-expiry-text').show();
          continue;
        }

        //если срок более 30 дней
        if(d>30*60*60*24){
          c.text('более 30 дней');
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
        c.text(str);
      }
    }

    setInterval(updateClock.bind(clocks),1000);
    updateClock.bind(clocks)();
  }

  $("a[href='#showpromocode']").on('click', function (e) {
    e.preventDefault();
    $(this).closest('.coupons-list_item-content-goto').addClass('open');
  });

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