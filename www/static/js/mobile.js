/**
 * Created by dmitriy on 16.06.2015.
 */
$(function() {
    var switchblocks = function() {
        if (window.innerWidth < 1055) {
            /**
             * это необходимо для того чтобы цена отображалась ближе к заголовку "Cтоимость тура"
             * иначе она ужезжает под кнопки и выглядит не очень логично
             */
            $('.booking-closed-price').insertAfter('.booking-closed-top-inf .text-block');

            if (window.innerWidth < 350) {
                $('.header15-search-input').attr('placeholder', 'Отель, город или страна');
            } else if (window.innerWidth < 370) {
                $('.header15-search-input').attr('placeholder', 'Название отеля, города или страны');
            } else {
                $('.header15-search-input').attr('placeholder', 'Введите название отеля, города или страны');
            }
        } else {
            $('.booking-closed-price').insertAfter('.booking-closed-top-inf');
        }
    };
    switchblocks();
    $('#mobile-screen-accordion, #mobile-screen-accordion-bottom').accordion({
        collapsible: true,
        active: false
    }).show().children('div').css('height', 'auto');
   $(window).on('resize', switchblocks);
    $('.embedded .modal-step-prev').each(function() {
        var beforeElem = $(this).closest('.m-booking-form')
            .next('.m-booking-bot').find('.m-booking-help-r');
        $(this).insertBefore(beforeElem);
    });

});


