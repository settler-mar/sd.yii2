$('.action_user_confirm').click(function () {
    if (!confirm()){
        return false;
    }
});

//checkboxes времён работы точек продаж, при кликах функционал
var storesPointCheckboxes = $('.b2b-stores-points-form input[type="checkbox"]');

storesPointCheckboxes.click(function() {
    var name = $(this).attr('name');
    var row = $(this).closest('tr');
    // if (name.match(/B2bStoresPoints\[work_time_details\]\[\d*\]\[holiday\]/)) {
    //     checkDisabled(row, this.checked, 'depends-holiday');
    // }
    if (name.match(/B2bStoresPoints\[work_time_details\]\[\d*\]\[24-hour\]/)) {
        checkDisabled(row, this.checked, 'depends-24-hour');
    }
});

//при загрузке проверяем то же, что при клике
$.each(storesPointCheckboxes, function(index, item){
    var name = $(item).attr('name');
    var row = $(item).closest('tr');
    // if (name.match(/B2bStoresPoints\[work_time_details\]\[\d*\]\[holiday\]/) && item.checked) {
    //     checkDisabled(row, true, 'depends-holiday');
    // }
    if (name.match(/B2bStoresPoints\[work_time_details\]\[\d*\]\[24-hour\]/) && item.checked) {
        checkDisabled(row, true, 'depends-24-hour');
    }
});

function  checkDisabled(row, checked, className) {
    //var inputsCheckbox = $(row).find('input[type="checkbox"].'+className);
    var inputsText = $(row).find('input[type="text"].'+className);
    inputsText.val('');
    //inputsCheckbox.attr('checked', false);
    inputsText.attr('disabled', checked);
    //inputsCheckbox.attr('disabled', checked);
}

$('#payments_select_store').on('change', paymentsSelectStore);

function paymentsSelectStore(){
    var self = document.getElementById('payments_select_store'),
        selectPoints = document.getElementById('payments_select_store_point');
    if (self && selectPoints) {
        var points = $('option:selected', self).attr('data-points'),
            getSelectPoint = $(selectPoints).data('get'),
            options = '';
        if (points) {
            points = JSON.parse(points);
            options = '<option></option>';
            points.forEach(function(item){
                options += '<option value="'+item.id+'" '+(parseInt(getSelectPoint) == parseInt(item.id) ? 'selected' : '')+
                    '>'+item.name+', '+item.country+', '+item.city+', '+item.address+'</options>';
            });
        }
        selectPoints.innerHTML = options;
    }

}
paymentsSelectStore();

// b2b платежи - действия с грид
$(".revert-order").on('click', function(e) {
    e.preventDefault();
    var href = '/payments/revoke';
    var ids = $(this).data('id');
    var data={
        buttonYes:false,
        notyfy_class:"notify_white notify_not_big",
        title: 'При отмене платежей нужно указать причину отмены',
        question:
        '<form action="'+href+'" method="post" class="payments-forms revoke_payents_form">'+
        '<input type="hidden" name="ids" id="payments-id" value="'+ids+'"'+'>'+
        '<div class="form-group">'+
        '<input type="text" class="form-control" id="payments-admin-comment" name="admin-comment" placeholder="Введите причину отмены">'+
        '<p class="help-block help-block-error"></p>'+
        '</div>' +
        '<div class="form-group buttons">'+
        '<input type="submit" class="btn btn-primary" value="Отклонить">'+
        '</div>' +
        '<form>'
    };
    notification.alert(data)


});

$(".payments-grid-view .change-order-price").on('click',function(e){
    e.preventDefault();
    var id = $(this).data('id');
    var order_price = $(this).data('orderprice');
    var data={
        buttonYes:false,
        notyfy_class:"notify_white notify_not_big",
        title: 'Изменить сумму покупки',
        question:
        '<form action="/payments/update" method="post" class="payments-forms change_order_price_form">'+
        '<input type="hidden" name="Payments[uid]" id="payments-id" value="'+id+'"'+'>'+
        '<p class="help-block help-block-error"></p>'+
        '<div class="form-group">'+
        '<label>Новая сумма</label>'+
        '<input type="text" class="form-control" id="payments-order_price" name="Payments[order_price]" placeholder="Введите новую сумму" value="'+order_price+'">'+
            '<p class="help-block help-block-error"></p>'+
        '</div>' +
        '<div class="form-group">'+
        '<label>Комментарий</label>'+
        '<input type="text" class="form-control" id="payments-admin-comment" name="Payments[admin-comment]" placeholder="Введите комментарий">'+
        '<p class="help-block help-block-error"></p>'+
        '</div>' +
        '<div class="form-group buttons">'+
        '<input type="submit" class="btn btn-primary" value="Изменить">'+
        '</div>' +
        '<form>'
    };
    notification.alert(data)
});

$(document).on('submit','form.change_order_price_form', function(e){
    e.preventDefault();
    $(this).find('p.help-block').text('');
    var id = $('#payments-id').val();
    var order_price = $('#payments-order_price').val();
    var admin_comment = $('#payments-admin-comment').val();
    if (parseInt(id)<1) {
        $('#payments-id').siblings('p.help-block').text('ID должен быть целым числом');
        return false;
    }
    if (order_price == '') {
        $('#payments-order_price').siblings('p.help-block').text('Введите сумму');
        return false;
    }
    var reg = /^\d*\.?\d*$/;
    if (!order_price.match(reg)) {
        $('#payments-order_price').siblings('p.help-block').html('Введите правильно сумму.<br>Копейки от рублей должны отделяться точкой');
        return false;
    }
    if (admin_comment.length<5 || admin_comment.length>256) {
        $('#payments-admin-comment').siblings('p.help-block').text('Длина комментария должна быть от 5 до 256 символов');
        return false;
    }
    var data = {
        'id' : parseInt(id),
        'order_price' : order_price,
        'admin-comment' : admin_comment
    };
    $.post($(this).attr('action'), data, function(response){
        $('html').removeClass('show_notifi');
        if (response.error == false) {
            // notification.notifi({message: 'Платёж изменён', type:'success'});
            // var row = $('tr[data-key="'+id+'"]');
            // var td_price = $(row).find('.td-order-price');
            // $(td_price).text(response.recalc.order_price+' '+$(td_price).data('cur'));
            // $(row).find('.td-reward').html(response.recalc.reward+' <span class="fa fa-rub"></span>');
            // $(row).find('.td-cashback').html(response.recalc.cashback+' <span class="fa fa-rub"></span>');
            // $(row).find('.change-order-price').attr('data-orderprice', response.recalc.order_price);
            $('#grid-ajax-action').yiiGridView("applyFilter");
        } else {
            notification.notifi({message: 'Произошла ошибка', type:'err'});
        }
    },'json').fail(function (data) {
        $('html').removeClass('show_notifi');
        notification.notifi({message:'Произошла ошибка!', type:'err'})
    });
});

$(document).on('submit','form.revoke_payents_form', function(e){
    e.preventDefault();
    $(this).find('p.help-block').text('');
    var ids = $('#payments-id').val();
    var status = $('#payments-status').val();
    var admin_comment = $('#payments-admin-comment').val();

    if (admin_comment.length<5 || admin_comment.length>256) {
        $('#payments-admin-comment').siblings('p.help-block').text('Длина комментария должна быть от 5 до 256 символов');
        return false;
    }
    var data = {
        'ids' : ids,
        'status' : status,
        'admin-comment' : admin_comment
    };
    $.post($(this).attr('action'), data, function(response){
        $('html').removeClass('show_notifi');
        if (response.error == false) {
            
            $('#grid-ajax-action').yiiGridView("applyFilter");
        } else {
            notification.notifi({message: 'Произошла ошибка', type:'err'});
        }
    },'json').fail(function (data) {
        $('html').removeClass('show_notifi');
        notification.notifi({message:'Произошла ошибка!', type:'err'})
    });
});

$('a[href="#register-by-partner"]').on('click',function(e){
    e.preventDefault();
    var recaptchaKey = $('#recaptcha-key').val();
    var data={
        buttonYes:false,
        notyfy_class:"notify_white notify_not_big",
        title: 'Заявка на регистацию',
        question:
        '<form method="post" class="payments-forms register_form">'+
        '<div class="form-group">'+
        '<label>Тема</label>'+
        '<input type="text" class="form-control" id="register-subject" name="RegisterForm[subject]" placeholder="Тема сообщения" >'+
        '<p class="help-block help-block-error"></p>'+
        '</div>' +
        '<div class="form-group">'+
        '<label>Сообщение</label>'+
        '<textarea class="form-control" id="register-text" name="RegisterForm[text]" placeholder="Сообщение"></textarea>'+
        '<p class="help-block help-block-error"></p>'+
        '</div>' +
        '<div class="form-group">'+
        '<label>Я не робот</label>'+
        '<script src="https://www.google.com/recaptcha/api.js" async defer></script>'+
        '<div id="g-recaptcha" class="g-recaptcha" data-sitekey="'+recaptchaKey+'"></div>'+
        '<p id="recaptcha-help" class="help-block help-block-error"></p>'+
        '</div>' +
        '<div class="form-group buttons">'+
        '<input type="submit" class="btn btn-primary" value="Отправить">'+
        '</div>' +
        '<form>'
    };
    notification.alert(data);

});

$(document).on('submit','form.register_form', function(e){
    e.preventDefault();
    $(this).find('p.help-block').text('');
    var subject = $('#register-subject').val();
    var text = $('#register-text').val();
    var recaptcha = $('#g-recaptcha-response').val();

    var error = false;
    if (subject == '') {
        $('#register-subject').siblings('p.help-block').text('Тема сообщения обязательна.');
        error = true;
    }
    if (text == '') {
        $('#register-text').siblings('p.help-block').text('Текст сообщения обязателен.');
        error = true;
    }
    if (!recaptcha) {
        $('#recaptcha-help').text('Докажите, что вы не робот.');
        error = true;
    }
    if (error) {
        return false;
    }
    var data = {
        'RegisterForm[subject]' : subject,
        'RegisterForm[text]' : text,
        'RegisterForm[reCaptcha]' : recaptcha
        };
    $.post('', data, function(response){
        console.log(response);
        $('html').removeClass('show_notifi');
        if (response.error == false) {
           //notification.notifi({message: (response.message ? response.message : 'Сообщение отправлено, мы свяжемся с вами в ближайшее время.'), type:'success'});
           location.reload();
        } else {
            notification.notifi({message: 'Произошла ошибка', type:'err'});
        }
    },'json').fail(function (data) {
        $('html').removeClass('show_notifi');
        notification.notifi({message:'Произошла ошибка!', type:'err'})
    });
});



