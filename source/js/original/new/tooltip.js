var myTooltip = function() {

    var tooltipClickTime;
    var tooltipTimeOut = null;

    $('[data-toggle=tooltip]').tipso({
        background: '#fff',
        color: '#434a54',
        size: 'small',
        delay: 10,
        speed: 10,
        width: 200,
        //maxWidth: 258,
        showArrow: true,
        onBeforeShow: function (ele, tipso) {
            this.content = ele.data('original-title');
            this.position = ele.data('placement') ? ele.data('placement') : 'top';
        }
    });

    $('[data-toggle=tooltip]').on('click', function(e){

        tooltipClickTime = new Date();
        //убираем таймаут
        clearInterval(tooltipTimeOut);
        //закрывавем все тултипы
        $('[data-toggle=tooltip]').tipso('hide');
        //данный показывем
        $(this).tipso('show');
        //новый интервал
        tooltipTimeOut = setInterval(function(){
            if (new Date() - tooltipClickTime > 1000 * 5) {
                clearInterval(tooltipTimeOut);
                //закрываем все тултипы
                $('[data-toggle=tooltip]').tipso('hide');
            }
        },1000);


    });

}();
