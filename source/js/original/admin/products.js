products = function() {

    $('#form-product-select-param').on('change', function() {
        var option = $(this).find('option:selected');
        var options = $(option).data('options');
        var selectValues = $('#form-product-select-value');
        $(selectValues).html(options);
    });

}();