$(function() {
    // temp
    $(document).on("click", "a[href='#reflink']", function() {return false;});

    var urlPrefix = '';

    var ajax = {
        control: {
            sendFormData: function(form, url, logName, successCallback) {
                $(document).on( "submit", form, function(e) {
                    e.preventDefault();
                    
                    var self = $(this),
                          dataForm = $(this).serialize(),
                          submitButton = $(this).find("button[type=submit]"),
                          oldButtonValue = submitButton.html();

                    submitButton.attr("disabled", "disabled").html('<i class="fa fa-cog fa-spin"></i>');

                    $.ajax({
                        method: "post",
                        url: urlPrefix + url,
                        data: dataForm,
                        success: function(response) {
                            var response = $.parseJSON(response);

                            if(response.error) {
                                for(key in response) {
                                    if(response[key][0] !== undefined) {
                                        var formError = noty({
                                            text: "<b>Ошибка!</b> " + response[key][0],
                                            animation: {
                                                open: 'animated fadeInLeft',
                                                close: 'animated flipOutX',
                                                easing: 'swing',
                                                speed: 300
                                            },
                                            type: 'error',
                                            theme: 'relax',
                                            layout: 'topRight',
                                            timeout: 7000
                                        });
                                    }
                                }
                            } else {
                                successCallback();
                            }
                        },
                        error: function(jqxhr) {
                            errors.control.log(logName, jqxhr);

                            var formErrorAjax = noty({
                                text: "<b>Технические работы!</b><br>В данный момент времени" + 
                                        " произведённое действие невозможно. Попробуйте позже." +
                                        " Приносим свои извинения за неудобство.",
                                animation: {
                                    open: 'animated fadeInLeft',
                                    close: 'animated flipOutX',
                                    easing: 'swing',
                                    speed: 300
                                },
                                type: 'warning',
                                theme: 'relax',
                                layout: 'topRight',
                                timeout: 10000
                            });
                        },
                        complete: function() {
                            submitButton.removeAttr("disabled").html(oldButtonValue);
                        }
                    });
                });
            }
        }
    }

    var errors = {
        control: {
            log: function(type, jqxhr) {
                $("<div id='error-container' style='display:none;'>" + jqxhr.responseText + "</div>").appendTo("body");

                var errorContainer = $("#error-container"),
                      errorMessage = type + ": " + jqxhr.status + " " + jqxhr.statusText + " ";

                if(errorContainer.find("h2:first").text() == "Details") {
                    errorMessage += "- ";
                    errorContainer.find("div").each(function(index) {
                        if(index > 4) return false;
                        var delimiter = ", ";
                        if(index == 4) delimiter = "";
                        errorMessage += $(this).text() + delimiter;
                    });
                }

                $.ajax({
                    method: "post",
                    url: urlPrefix + "/ajax-error",
                    data: "message=" + errorMessage,
                });

                errorContainer.remove();
            }
        }
    }

    var settings = {
        control: {
            events: function() {
                ajax.control.sendFormData("#top form[name=user-settings]", "/account/settings/change-settings", "Account Settings Ajax Error", function() {
                    $("#top form[name=user-settings]").attr("name", "valid-data-settings");

                    var settingsSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Информация успешно обновлена.",
                        animation: {
                            open: 'animated fadeInLeft',
                            close: 'animated flipOutX',
                            easing: 'swing',
                            speed: 300
                        },
                        type: 'success',
                        theme: 'relax',
                        layout: 'topRight',
                        timeout: 7000
                    });

                    setTimeout(function() {
                        $("#top form[name=valid-data-settings]").submit();
                    }, 1500);
                });

                ajax.control.sendFormData("#top form[name=user-password]", "/account/settings/change-password", "Account Password Ajax Error", function() {
                    var passwordSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Пароль успешно изменён.",
                        animation: {
                            open: 'animated fadeInLeft',
                            close: 'animated flipOutX',
                            easing: 'swing',
                            speed: 300
                        },
                        type: 'success',
                        theme: 'relax',
                        layout: 'topRight',
                        timeout: 7000
                    });

                    $("#top form[name=user-password]")[0].reset();
                });

                $('#top input[ref=date]').datepicker({
                    dateFormat: "yyyy-mm-dd"
                });
            }   
        }
    }


    var balance = {
        control: {
            events: function() {
                var confirmBalance = $("#uinfo").attr("data-balance"),
                      status = $("#uinfo").attr("data-status");

                Circles.create({
                    id: 'bronze',
                    radius: 100,
                    value: confirmBalance,
                    maxValue: 500,
                    width: (status == "default" ? 20 : 10),
                    text: function(value) {
                        return value + ' <span class="fa fa-rub"></span>';
                    },
                    colors:  ['#EC8B6C', '#87260C'],
                    duration: 500,
                    wrpClass: 'circles-wrp',
                    textClass:  'circles-text',
                    valueStrokeClass:  'circles-valueStroke',
                    maxValueStrokeClass: 'circles-maxValueStroke',
                    styleWrapper: true,
                    styleText:  true
                });

                Circles.create({
                    id: 'silver',
                    radius: 100,
                    value: confirmBalance,
                    maxValue: 3000,
                    width: (status == "bronze" ? 20 : 10),
                    text: function(value){return value + ' <span class="fa fa-rub"></span>';},
                    colors:  ['#E3E3E3', '#9D9D9B'],
                    duration: 600,
                    wrpClass: 'circles-wrp',
                    textClass:  'circles-text',
                    valueStrokeClass:  'circles-valueStroke',
                    maxValueStrokeClass: 'circles-maxValueStroke',
                    styleWrapper: true,
                    styleText:  true
                });

                Circles.create({
                    id: 'gold',
                    radius: 100,
                    value: confirmBalance,
                    maxValue: 7000,
                    width: (status == "silver" ? 20 : 10),
                    text: function(value){return value + ' <span class="fa fa-rub"></span>';},
                    colors:  ['#FCB84B', '#D58417'],
                    duration: 700,
                    wrpClass: 'circles-wrp',
                    textClass:  'circles-text',
                    valueStrokeClass:  'circles-valueStroke',
                    maxValueStrokeClass: 'circles-maxValueStroke',
                    styleWrapper: true,
                    styleText:  true
                });

                Circles.create({
                    id: 'platinum',
                    radius: 100,
                    value: confirmBalance,
                    maxValue: 10000,
                    width: (status == "gold" ? 20 : 10),
                    text: function(value){return value + ' <span class="fa fa-rub"></span>';},
                    colors:  ['#9D9D9B', '#060606'],
                    duration: 800,
                    wrpClass: 'circles-wrp',
                    textClass:  'circles-text',
                    valueStrokeClass:  'circles-valueStroke',
                    maxValueStrokeClass: 'circles-maxValueStroke',
                    styleWrapper: true,
                    styleText:  true
                });                
            }
        }
    }

    var favorites = {
        control: {
            events: function() {
                $("#top").find(".favorite-link").click(function() {
                    var self = $(this);
                    var type = self.attr("data-state"),
                          affiliate_id = self.attr("data-affiliate-id");

                    if(type == "add") {
                        self.find(".fa").removeClass("muted");
                    }

                    self.find(".fa").removeClass("pulse2").addClass("fa-spin");

                    $.ajax({
                        method: "post",
                        url: urlPrefix + "/account/favorites",
                        data: "type=" + type + "&affiliate_id=" + affiliate_id,
                        error: function (jqxhr) {
                            errors.control.log('Favorites Ajax Error', jqxhr);

                            var favErrorAjax = noty({
                                text: "<b>Технические работы!</b><br>В данный момент времени" + 
                                        " произведённое действие невозможно. Попробуйте позже." +
                                        " Приносим свои извинения за неудобство.",
                                animation: {
                                    open: 'animated fadeInLeft',
                                    close: 'animated flipOutX',
                                    easing: 'swing',
                                    speed: 300
                                },
                                type: 'warning',
                                theme: 'relax',
                                layout: 'topRight',
                                timeout: 10000
                            });

                            if(type == "add") {
                                self.find(".fa").addClass("muted");
                            }

                            self.find(".fa").removeClass("fa-spin").addClass("pulse2");
                        },
                        success: function(response) {
                            var response = $.parseJSON(response);

                            if(response.error) {
                                for(key in response) {
                                    if(response[key][0] !== undefined) {
                                        var favoritesError = noty({
                                            text: "<b>Ошибка!</b> " + response[key][0],
                                            animation: {
                                                open: 'animated fadeInLeft',
                                                close: 'animated flipOutX',
                                                easing: 'swing',
                                                speed: 300
                                            },
                                            type: 'error',
                                            theme: 'relax',
                                            layout: 'topRight',
                                            timeout: 7000
                                        });
                                    }
                                }

                                if(type == "add") {
                                    self.find(".fa").addClass("muted");
                                }

                                self.find(".fa").removeClass("fa-spin").addClass("pulse2");
                            } else {
                                var favoritesSuccess = noty({
                                    text: response.msg,
                                    animation: {
                                        open: 'animated fadeInLeft',
                                        close: 'animated flipOutX',
                                        easing: 'swing',
                                        speed: 300
                                    },
                                    type: 'success',
                                    theme: 'relax',
                                    layout: 'topRight',
                                    timeout: 7000
                                });

                                if(type == "add") {
                                    self.attr({
                                        "data-state": "delete",
                                        "data-original-title": "Удалить из избранного"
                                    });

                                    // self.find(".fa").removeClass("fa-spin fa-star-o").addClass("pulse2 fa-star");
                                    self.find(".fa").removeClass("fa-spin fa-heart-o").addClass("pulse2 fa-heart");
                                } else if(type == "delete") {
                                    self.attr({
                                        "data-state": "add",
                                        "data-original-title" : "Добавить в избранное"
                                    });                   

                                    // self.find(".fa").removeClass("fa-spin fa-star").addClass("pulse2 fa-star-o muted");
                                    self.find(".fa").removeClass("fa-spin fa-heart").addClass("pulse2 fa-heart-o muted");
                                }
                            }
                        }
                    });       

                    return false;                
                });
            }
        }
    }

    var header = {
        control: {
            events: function() {
                if($(window).width() > 991) {
                    $("#search").autocomplete({
                        serviceUrl: '/search',
                        noCache: 'true',
                        deferRequestBy: 300,
                        triggerSelectOnValidInput: false,
                        onSelect: function (suggestion) {
                            location.href = '/stores/' + suggestion.data.route;
                        }
                    });
                }

                $(".dobrohead i").animo({animation: "pulse", iterate: "infinite"});
                $(".link-head-stores span").animo({animation: "flash", iterate: "infinite", duration: 2.4});
            }
        }
    }

    var withdraw = {
        control: {
            events: function() {
                $("#top").find(".account-withdraw .option a").click(function() {
                    var self = $(this),
                          option = self.parent().attr("data-option-process"),
                          placeholder = "";
                    $("#top").find(".account-withdraw .option a").removeClass("active");
                    self.addClass("active");

                    $("#top").find("form[name=withdraw-form]").find("input[name=withdraw-process]").val(option);

                    switch(option) {
                        case "1":
                        placeholder = "Введите номер счёта";
                        break;

                        case "2":
                        placeholder = "Введите номер R-кошелька";
                        break;

                        case "3":
                        placeholder = "Введите номер телефона";
                        break;

                        case "4":
                        placeholder = "Введите номер карты";
                        break;

                        case "5":
                        placeholder = "Введите email адрес";
                        break;

                        case "6":
                        placeholder = "Введите номер телефона";
                        break;
                    }

                    $("#top").find("form[name=withdraw-form]").find("input[name=bill]").attr("placeholder", placeholder);

                    return false;
                });

                ajax.control.sendFormData("#top form[name=withdraw-form]", "/account/withdraw", "Withdraw Ajax Error", function() {
                    var withdrawSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Запрос на вывод денег был успешно выполнен.",
                        animation: {
                            open: 'animated fadeInLeft',
                            close: 'animated flipOutX',
                            easing: 'swing',
                            speed: 300
                        },
                        type: 'success',
                        theme: 'relax',
                        layout: 'topRight',
                        timeout: 7000
                    });

                    $("#top form[name=withdraw-form]")[0].reset();
                });
            }
        }
    }

    var charity = {
        control: {
            events: function() {
                $("#top").find(".account-fund-transfer .option a").click(function() {
                    var self = $(this),
                          option = self.parent().attr("data-option-process"),
                          placeholder = "";

                    var titleFund = self.prev(".title").text();
                    $(".to-fund span").text(titleFund);

                    $("#top").find(".account-fund-transfer .option a").removeClass("active");
                    self.addClass("active");

                    $("#top").find("form[name=fund-transfer-form]").find("input[name=charity-process]").val(option);

                    $("#top").find(".account-fund-transfer .autopayment-info").css("display", "block");
                    $("#top").find("form[name=autopayment-form]").find("input[name=autopayment-uid]").val(option);

                    return false;
                });

                ajax.control.sendFormData("#top form[name=fund-transfer-form]", "/account/dobro/send", "Fund Transfer Ajax Error", function() {
                    var withdrawSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Денежные средства успешно переведены. Спасибо за Вашу помощь. Историю Ваших добрых дел вы можете посмотреть в <a href='/account/charity'>личном кабинете</a>.",
                        animation: {
                            open: 'animated fadeInLeft',
                            close: 'animated flipOutX',
                            easing: 'swing',
                            speed: 300
                        },
                        type: 'success',
                        theme: 'relax',
                        layout: 'topRight',
                        timeout: 7000
                    });

                    $("#top form[name=fund-transfer-form]")[0].reset();
                });

                ajax.control.sendFormData("#top form[name=autopayment-form]", "/account/dobro/auto-send", "Auto Payment Ajax Error", function() {
                    var withdrawSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Автоплатёж был успешно установлен.",
                        animation: {
                            open: 'animated fadeInLeft',
                            close: 'animated flipOutX',
                            easing: 'swing',
                            speed: 300
                        },
                        type: 'success',
                        theme: 'relax',
                        layout: 'topRight',
                        timeout: 7000
                    });
                });

                ajax.control.sendFormData("#top form[name=delete-autopayment-form]", "/account/dobro/auto-delete", "Delete Auto Payment Ajax Error", function() {
                    var withdrawSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Автоплатёж был успешно удалён.",
                        animation: {
                            open: 'animated fadeInLeft',
                            close: 'animated flipOutX',
                            easing: 'swing',
                            speed: 300
                        },
                        type: 'success',
                        theme: 'relax',
                        layout: 'topRight',
                        timeout: 7000
                    });

                    $("#top").find(".self-autopayment").parent().remove();
                });
            }
        }
    }

    var support = {
        control: {
            events: function() {
                ajax.control.sendFormData("#top form[name=support-form]", "/account/support", "Support Ajax Error", function() {
                    var supportSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Запрос в службу поддержки был успешно отправлен.",
                        animation: {
                            open: 'animated fadeInLeft',
                            close: 'animated flipOutX',
                            easing: 'swing',
                            speed: 300
                        },
                        type: 'success',
                        theme: 'relax',
                        layout: 'topRight',
                        timeout: 7000
                    });

                    $("#top form[name=support-form]")[0].reset();
                });
            }
        }
    }

    support.control.events();
    withdraw.control.events();
    charity.control.events();
    settings.control.events();
    balance.control.events();
    favorites.control.events();
    header.control.events();
});

$(function(){
    $("input.link").click(function(){	// получение фокуса текстовым полем-ссылкой
        $(this).select();
    });
});

$('body').on('click', '.link-to-clipboard', function(e){
    e.preventDefault();
    var linkText = $(this).data('link');
    var tmp   = document.createElement('INPUT');
    tmp.value = linkText;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    notification.notifi({
        title: 'Успешно',
        message: 'Ваша партнёрская ссылка скопирована в буфер обмена. Удачной работы!',
        type: 'success'
    });
});
