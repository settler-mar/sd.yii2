var store_points = (function(){

    //для точек продаж, события на выбор селектов
    $('body').on('change', '#store_point_country', function(e) {
        var data = $('option:selected', this).data('cities'),
            points= $('#store-points'),
            country = $('option:selected', this).attr('value');
        data = data.split(',');
        if (data.length > 0) {
            var select = document.getElementById('store_point_city');
            var options = '<option value="">Выберите город</option>';
            data.forEach(function(item){
                options += '<option value="'+item+'">'+item+'</option>';
            });
            select.innerHTML = options;
        }
        $(points).addClass('hidden');
        googleMap.showMap();
        googleMap.showMarker(country, '');

        //googleMap.hideMap();
    });

    $('body').on('change', '#store_point_city', function(e) {
        var city = $('option:selected', this).attr('value'),
            country = $('option:selected', $('#store_point_country')).attr('value'),
            points= $('#store-points');
        if (country && city) {
            var items = points.find('.store-points__points_row'),
                visible = false;
            try {
                googleMap.showMarker(country, city);
            } catch (err) {
                console.log(err);
            }
            $.each(items, function(index, div){
                if ($(div).data('city') == city && $(div).data('country') == country){
                    $(div).removeClass('store-points__points_row-hidden');
                    visible = true;
                } else {
                    $(div).addClass('store-points__points_row-hidden') ;
                }
            });
            if (visible) {
                $(points).removeClass('store-points__points-hidden');
                googleMap.showMap();

            } else {
                $(points).addClass('store-points__points-hidden');
                googleMap.hideMap();
            }
        } else {
            $(points).addClass('store-points__points-hidden');
            googleMap.hideMap();
        }

    });


})();

