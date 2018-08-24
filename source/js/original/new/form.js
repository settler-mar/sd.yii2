(function(){

    $('body').on('beforeValidate', 'form', function(){
        var that = this;
        var isValid = true;
        var required = $(that).find('input[required="true"], input[aria-required="true"], textarea[required="true"], textarea[aria-required="true"]');
        var firstError = true;
        for (var i = 0; i < required.length; i++) {
            if (required.eq(i).val().length < 1) {
                isValid = false;
                notification.notifi({
                    'type': 'err',
                    'message': 'Необходимо заполнить ' + required.eq(i).attr('name')
                });
                if (firstError) {
                    firstError = false;
                    //позиционирование на input
                    $('html, body').animate({scrollTop: $(required.eq(i)).offset().top}, 500);
                    var tab = $(required.eq(i)).closest('.cpa_box');
                    if (tab) {
                        var classes = tab[0].classList;
                        for (var j=0; j < classes.length; j++) {
                            if (classes[j].indexOf('tab_') > -1) {
                                var tabIndex = classes[j].substring(4);
                                $(that).find('input[type="radio"][value="'+tabIndex+'"]').prop('checked', true);
                            }
                        }
                    }
                }
            }
        }
        if (!isValid) {
            return false;
        }
    });

})();
