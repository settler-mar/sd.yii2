var metaForm = function(){

  changeLabel = function(table){
     var values = [];
     $(table).find('input.meta-metatagarray').each(function(key, item){
         values.push($(item).val());
     });
     values = values.join('~');
     var label = $(table).closest('.form-group').find('label.meta-metatagarray-label');
     $(label).html('&lt;meta '+$(table).data('attribute')+'="'+$(table).data('name')+'" content="'+values+'"&gt;');
  };

  $('body').on('click', '.meta-input-remove', function() {
      var myTable = $(this).closest('table');
      $(this).closest('tr').remove();
      changeLabel(myTable);
  });

  $('body').on('click', '.meta-input-plus', function() {
        var myRow = $(this).closest('tr');
        var myTable = $(this).closest('table');
        var value = $(myRow).find('input').val();
        var row = $('<tr class="multiple-input-list__item"><td class="list-cell__data_meta">'+
            '<div class="form-group">' +
            '<input type="text" ' +
            'class="form-control meta-metatagarray" name="Meta[metaTagArray]['+$(this).data('key')+'][]" '+
            'value="'+value+'">' +
            '</div>' +
            '</td>' +
            '<td class="list-cell__button">' +
            '<div class="btn multiple-input-list__btn meta-input-remove btn btn-danger"><i class="glyphicon glyphicon-remove"></i></div>' +
            '</td></tr>');
        $(row).insertBefore(myRow);
        $(myRow).find('input').val('');

        changeLabel(myTable);
  });


}();