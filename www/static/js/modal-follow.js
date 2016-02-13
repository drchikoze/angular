$(document).ready(function () {
    function openPopup() {
        var topSize = $(window).scrollTop();
        $('.follow-price-popup').css({'top': topSize+30});
    }

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

    $('.follow-pp-btn2-gray').click(function () {
        $('#overlay-2').toggle();
        $('.follow-price-popup').fadeOut('fast');
    });
    $('.popup-close').on('click', function(){
        $('.follow-price-cheaper-span').removeClass('active');
        $('.follow-price-popup').hide();
        $('#overlay-2').hide();
        $('body').removeClass('overflow-hidden');
    });

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

    $('.follow-pp-watch-form-list').click(function () {
        $(this).toggleClass('active');
    });
    $('.follow-pp-watch-list-hidden ul li').click(function () {
        $('.follow-pp-watch-form-list').text($(this).text()).removeClass('active');
    });

    $('.follow-price-popup-inp-price').keypress(function() {
        $('.follow-price-popup-inp2-notice').fadeIn('fast');
    });
});