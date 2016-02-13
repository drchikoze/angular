/**
 * Created by dmitriy on 04.08.2015.
 */
$(function() {
    $('.scroll-to-requests').on('click', function() {
        if (location.href.split('/').pop() != 'my_tourbook') {
            return;
        }
        if ( $('#FeedView').is(':visible') && $('.booking-item').eq(0).is(':visible') ) {
            $("html, body").animate({
                scrollTop: $('.booking-item').eq(0).offset().top
            }, 400);

        } else if ($('#SectionsView').is(':visible') ) {
            $("html, body").animate({
                scrollTop: $('#booking-section').offset().top
            }, 400);
        }
        return false;
    });
    $('.scroll-to-history').on('click', function() {
        if (location.href.split('/').pop() != 'my_tourbook') {
            return;
        }
        if ($('#FeedView').is(':visible') && $('.search-history-item').eq(0).is(':visible') ) {
            $("html, body").animate({
                scrollTop: $('.search-history-item').eq(0).offset().top
            }, 400);
        } else if ($('#SectionsView').is(':visible')) {
            $("html, body").animate({
                scrollTop: $('#history-section').offset().top
            }, 400);
        }
        return false;
    });
    $('.scroll-to-favs').on('click', function() {
        if (location.href.split('/').pop() != 'my_tourbook') {
            return;
        }
        if ($('#FeedView').is(':visible') && $('.favorite-item').eq(0).is(':visible') ) {
            $("html, body").animate({
                scrollTop: $('.favorite-item').eq(0).offset().top
            }, 400);
        } else if ($('#SectionsView').is(':visible')) {
            $("html, body").animate({
                scrollTop: $('#favorites-section').offset().top
            }, 400);
        }
        return false;
    });
    $(window).on('load', function () {
        if (window.location.hash == '#booking-section') {
            $('.scroll-to-requests').trigger('click');
        } else if (window.location.hash == '#favorites-section') {
            $('.scroll-to-favs').trigger('click');
        } else if (window.location.hash == '#history-section') {
            $('.scroll-to-history').trigger('click');
        }
    });
});

(function() {
    // Удаляем ID сессии из ссылки
    var pos = window.location.href.indexOf('TPSID');
    if (pos != -1 && window.history) {
        window.history.pushState({}, '', window.location.href.replace(/(\?|&)TPSID=[a-zA-Z0-9]*/, '$1'))
    }
})();

function number_format(number, decimals, dec_point, thousands_sep) {
    var i, j, kw, kd, minus = "";
    if (isNaN(decimals = Math.abs(decimals))) {
        decimals = 2;
    }
    if (number < 0) {
        minus = "-";
        number = number * -1;
    }
    if (dec_point == undefined) {
        dec_point = ",";
    }
    if (thousands_sep == undefined) {
        thousands_sep = ".";
    }
    i = parseInt(number = (+number || 0).toFixed(decimals)) + "";
    kw = i.split( /(?=(?:\d{3})+$)/ ).join(thousands_sep);
    kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");
    return minus + kw + kd;
}
