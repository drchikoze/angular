$(document).ready(function () {    
    function openPopup() {
        var topSize = $(window).scrollTop();
        $('.follow-price-popup').css({'top': topSize+30});
    }    
    // открытие попапа 
        $('.follow-price-cheaper-span.bell').on('click', function(){
        $('#overlay-2').toggle();
        $('.follow-pp-tab').removeClass('active');
        $('.follow-pp-buy').hide();
        $('.follow-price-popup').fadeIn('fast');
        $('.follow-pp-watch').fadeIn('fast');
        $('.follow-pp-tab-watch').addClass('active');
        openPopup();
    });
    $('.follow-price-cheaper-span.persent').on('click', function(){
        $('#overlay-2').toggle();
        $('.follow-pp-tab').removeClass('active');
        $('.follow-pp-watch').hide();
        $('.follow-price-popup').fadeIn('fast');
        $('.follow-pp-buy').fadeIn('fast');
        $('.follow-pp-tab-buy').addClass('active');
        openPopup();
    });
    // закрытие 
    $('.follow-pp-btn2-gray').click(function () {
        $('#overlay-2').toggle();
        $('.follow-price-popup').fadeOut('fast');
    })
    $('.popup-close').on('click', function(){
        $('.follow-price-cheaper-span').removeClass('active');
        $('.follow-price-popup').hide();
        $('#overlay-2').hide();
        $('body').removeClass('overflow-hidden');
    });
    // Переключение табов 
    $('.follow-pp-tab').click(function () {
        if ($(this).hasClass('follow-pp-tab-watch')) {
            $('.follow-pp-buy').hide();
            $('.follow-pp-watch').fadeIn('fast');
        }
        if ($(this).hasClass('follow-pp-tab-buy')) {
            $('.follow-pp-watch').hide();
            $('.follow-pp-buy').fadeIn('fast');
        }
        $('.follow-pp-tab').removeClass('active');
        $(this).addClass('active');
    });
    // Шаги 
    //$('.follow-pp-watch-footer .follow-pp-btn').click(function () {
    //        $('.follow-pp-watch-one-step').hide();
    //        $('.follow-pp-watch-two-step').fadeIn('fast');
    //})
    //$('.follow-pp-buy-footer .follow-pp-btn').click(function () {
    //        $('.follow-pp-buy-one-step').hide();
    //        $('.follow-pp-buy-two-step').fadeIn('fast');
    //})
    // Элементы форм и алерты 
    $('.follow-pp-watch-form-list').click(function () {
        $(this).toggleClass('active');
    })
    $('.follow-pp-watch-list-hidden ul li').click(function () {
        $('.follow-pp-watch-form-list').text($(this).text()).removeClass('active');
    })

    //$('.follow-pp-watch-form-inp').keyup(function(e){
    //    if ($('.follow-pp-watch-form-inp').val() != "") {
    //        $(this).addClass('error');
    //    }
    //    if ($('.follow-pp-watch-form-inp').val() === "") {
    //        $(this).removeClass('error');
    //    }
    //});
    //$('.follow-pp-watch-form-inp, .follow-pp-buy-inp, .follow-pp-buy-form-inp').keyup(function(e){
    //    if ($(this).val() != "") {
    //        $(this).addClass('error');
    //    }
    //    if ($(this).val() === "") {
    //        $(this).removeClass('error');
    //    }
    //});
    //$('.follow-pp-watch-form-inp').keyup(function(e){
    //    if ($('.follow-pp-watch-form-inp').val() != "") {
    //        $(this).addClass('error');
    //    }
    //    if ($('.follow-pp-watch-form-inp').val() === "") {
    //        $(this).removeClass('error');
    //    }
    //});
    $('.follow-price-popup-inp-price').keypress(function(e){
        $('.follow-price-popup-inp2-notice').fadeIn('fast');
    });
    $('.modal-close').click(function(e){
        $(this).closest('.modal-window').hide();
        $('.overlay').hide();
        e.preventDefault;
    });
})