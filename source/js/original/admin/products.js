products = function() {

    $('#form-product-select-param').on('change', function() {
        var option = $(this).find('option:selected');
        var data = $(option).data('values');
        var selectValues = $('#form-product-select-value');
        var options = '<option value="">Выберите значение</option>';
        for(var i=0; i<data.length; i++) {
            options +='<option value="'+data[i].id+'">'+data[i].name+'</option>';
        }
        $(selectValues).html(options);
    });

}();