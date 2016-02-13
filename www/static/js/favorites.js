/**
 * Created by Михаил on 30.03.2015.
 */
$(document).ready(function() {
    var divider = '!!!';

    $('.my-price-edit').click(function (e) {
        showForm(e.target);
    });

    $('.favorite-notifications').click(function (e) {
        var row = $(this).closest('.favorites-row');
        var email = row.attr('data-email');
        var watcher = row.attr('data-watcher-id');
        var active = row.attr('data-active');
        if (active == 1) {
            $('.favorites-email-action').val('notifications-off');
            $('.favorites-email-btn-off').show();
            $('.favorites-email-btn-on').hide();
            $('.pp-favorites-description').hide();
        } else {
            $('.favorites-email-action').val('notifications-on');
            $('.favorites-email-btn-on').show();
            $('.favorites-email-btn-off').hide();
            $('.pp-favorites-description').show();
        }
        $('#favorites-email-field').val(email);
        $('.favorites-email-watcher').val(watcher);
        $('.favorites-email').fadeIn();
    });

    $('.pp-favorites-shadow').click(function () {
        $(this).fadeOut();
    });

    $('.pp-favorites-x').click(function () {
        $('.pp-favorites-shadow').click();
    });

    $('.pp-favorites').click(function () {
        return false;
    });

    $('.favorites-email-btn').click(function (e) {
        var form = $(this).closest('form');
        var watcher = $('.favorites-email-watcher').val();
        var email = $('#favorites-email-field').val();
        var active = $('.favorites-email-action').val() == 'notifications-on' ? 1 : 0;
        $.post('/favorites/ajax/', form.serialize())
                .done(function (data, textStatus, jqXHR) {
                    if (typeof data == 'string' || data instanceof String) {
                        if (data.indexOf(divider) != -1) {
                            data = JSON.parse(data.substr(0, data.indexOf(divider)));
                        } else {
                            data = JSON.parse(data);
                        }
                    }
                    if (data.status == 'ok') {
                        var row = $('[data-watcher-id=' + watcher + ']');
                        row.attr('data-active', active);
                        row.attr('data-email', email);
                    } else if (data.message) {
                        alert(data.message);
                    } else {
                        alert('Произошла ошибка')
                    }
                })
                .fail(function () {
                    alert('Произошла ошибка');
                })
                .complete(function () {
                    $('.pp-favorites-shadow').click();
                });
        e.preventDefault();
    });

    //$('.remove-favorite').click(function (e) {
    //    if (!confirm('Удалить тур из избранного?')) {
    //        return;
    //    }
    //    var row = $(this).closest('.favorites-row');
    //    var id = row.attr('data-watcher-id');
    //    $.post('/favorites/ajax/', {watcherId: id, action: 'remove'})
    //            .done(function (data, textStatus, jqXHR) {
    //                if (typeof data == 'string' || data instanceof String) {
    //                    if (data.indexOf(divider) != -1) {
    //                        data = JSON.parse(data.substr(0, data.indexOf(divider)));
    //                    } else {
    //                        data = JSON.parse(data);
    //                    }
    //                }
    //                if (data.status == 'ok') {
    //                    angular.element('#login-controller').scope().changeFavorites(-1);
    //                    row.slideUp('fast', function() {row.remove();});
    //                } else if (data.message) {
    //                    alert(data.message);
    //                } else {
    //                    alert('Произошла ошибка')
    //                }
    //            })
    //            .fail(function () {
    //                alert('Произошла ошибка');
    //            });
    //    e.preventDefault();
    //});

    $('.my-price-save').click(function (e) {
        var row = $(e.target).closest('.favorites-row');
        var myPriceBlock = row.find('.my-price-block');
        var myPriceForm = row.find('.my-price-form');
        var form = myPriceForm.find('form');
        var price = myPriceForm.find('[name="myPrice"]');
        $.post('/favorites/ajax/', form.serialize())
                .done(function (data, textStatus, jqXHR) {
                    if (typeof data == 'string' || data instanceof String) {
                        if (data.indexOf(divider) != -1) {
                            data = JSON.parse(data.substr(0, data.indexOf(divider)));
                        } else {
                            data = JSON.parse(data);
                        }
                    }
                    if (data.status == 'ok') {
                        // Записываем полученные данные
                        row.find('.favorites-hotel-price-your-details')
                                .text(priceFormat(price.val()) + ' ' + row.attr('data-currency') + ' ')
                                .append($('<span>', {class: 'fa fa-pencil my-price-edit'}).click(function (e) {
                                    showForm(e.target);
                                }));
                        row.attr('data-user-price', price.val());
                        // Рисуем разницу с ценой пользователя
                        showYourPriceDiff(row);
                        // Прячем форму
                        myPriceForm.hide();
                        myPriceBlock.show();
                    } else if (data.message) {
                        alert(data.message);
                    } else {
                        alert('Произошла ошибка')
                    }
                })
                .fail(function () {
                    alert('Произошла ошибка');
                });
        e.preventDefault();
    });

    $('.update-price-operator').click(function () {
        $('.favorites-hotel-price-last').each(function () {
            var block = $(this).parent();
            block.parent().find('.wait-price').toggle();
            block.toggle();
            var row = block.closest('.favorites-row');
            var id = row.attr('data-watcher-id');
            var tour_id = row.attr('data-tour-id');
            var url_prefix = row.attr('data-url-prefix');
            var url_return = row.attr('data-url-return');
            $.get('/favorites/tour_price/', {watcherId: id})
                .done(function (data, textStatus, jqXHR) {
                    if (typeof data == 'string' || data instanceof String) {
                        if (data.indexOf(divider) != -1) {
                            data = JSON.parse(data.substr(0, data.indexOf(divider)));
                        } else {
                            data = JSON.parse(data);
                        }
                    }
                    if (data.status == 'ok') {
                        var params = {"tour_id": data.tour_id};
                        params = JSON.stringify(params);

                        //Заменяем ссылки если ID тура изменился
                        if (tour_id != data.tour_id) {
                            row.find('.favorites-tour-link').attr('href', url_prefix + data.tour_id + url_return);
                        }

                        $.get('/tour/check_price', {params: params})
                            .done(function (data, textStatus, jqXHR) {
                                if (typeof data == 'string' || data instanceof String) {
                                    if (data.indexOf('   ') != -1) {
                                        data = JSON.parse(data.substr(0, data.indexOf('   ')));
                                    } else {
                                        data = JSON.parse(data);
                                    }
                                }
                                if (data.status == 'ok') {
                                    // Записываем полученные данные
                                    oldPrice = block.find('.favorites-hotel-price-old').text();
                                    newPrice =  data.price.priceRur + ' руб.';
                                    if (oldPrice != newPrice) {
                                        block.find('.favorites-hotel-price-last').text(newPrice);
                                        row.attr('data-price-now', data.price.priceRur.replace(/\s+/g, ''));

                                        block.find('.current-price-date').text(jQuery.datepicker.formatDate('dd.mm.yy', new Date()) + ' ' + data.price.fixLastUpdateTime);

                                        block.parent().find('.wait-price').toggle();
                                        block.find('.favorites-hotel-price-old').show();
                                        block.toggle();
                                    } else {
                                        block.parent().find('.wait-price').toggle();
                                        block.find('.favorites-hotel-price-favorites-hotel-price-old').hide();
                                        block.toggle();
                                    }
                                } else {
                                    block.parent().hide();
                                    block.parent().next().show();
                                    block.parent().next().next().find('.favorites-hotel-buttons-details').hide();
                                    block.parent().next().next().find('.favorites-hotel-buttons-notify').hide();
                                }
                            });

                    } else {

                        block.text(data.message);
                        block.parent().hide();
                        block.parent().next().show();
                        block.parent().next().next().find('.favorites-hotel-buttons-details').hide();
                        block.parent().next().next().find('.favorites-hotel-buttons-notify').hide();
                    }
                });
        });
    });

    function showForm(btn) {
        var root = $(btn).closest('.favorites-hotel-price');
        root.find('.my-price-block').hide();
        root.find('.my-price-form').show();
    }

    function showYourPriceDiff(row) {
        var priceUser = parseInt(row.attr('data-user-price'));
        var priceNow = parseInt(row.attr('data-price-now'));
        var currency = row.attr('data-currency');
        var diff = priceNow - priceUser;
        var moreOrLess = diff >= 0 ? 'Меньше' : 'Больше';
        row.find('.favorites-hotel-price-your-diff').text(moreOrLess + ' на: ' + priceFormat(diff) + ' ' + currency);
    }

    function priceFormat(price) {
        var formatted = '';
        price = Math.abs(price) + '';
        for(i = 0; i < price.length; ++i) {
            if (i % 3 == 0) {
                formatted = ' ' + formatted;
            }
            formatted = price[price.length - 1 - i] + formatted
        }
        return formatted;
    }
});
