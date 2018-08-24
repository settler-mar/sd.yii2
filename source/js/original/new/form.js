(function(){

    $('body').on('beforeValidate', 'form', function(){
        var that = this;
        var isValid = true;
        var required = $(that).find('input[required="true"], input[aria-required="true"], textarea[required="true"], textarea[aria-required="true"]');
        for (var i = 0; i < required.length; i++) {
            if (required.eq(i).val().length < 1) {
                isValid = false;
                notification.notifi({
                    'type': 'err',
                    'message': 'Необходимо заполнить ' + required.eq(i).attr('name')
                });
            }
        }
        if (!isValid) {
            return false;
        }
    });

})();
