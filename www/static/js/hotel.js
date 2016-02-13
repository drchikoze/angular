function toggleDescription() {
    $('.hide_block').toggle();
    $('.show_hide_block').toggle();
    return false
}

$(window).scroll(function(){
    var offsetAnchors = {
        // цены начинаем подсвечивать раньше
        prices: $("#prices").offset().top,
        description: $("#description").offset().top,
        map: $("#map").size() ? $("#map").offset().top : 0,
        feedback: $("#feedback").size() ? $("#feedback").offset().top : 0,
        similar: $("#similar").size() ? $("#similar").offset().top : 0
    };
    // т.к. мы пересчитываем цифры каждый раз, добавляем к прокрутке высоту шапки
    var scrollTop = $(document).scrollTop() + $('#title-wrapper').outerHeight() + $('.header-breadcrumbs').outerHeight();
    $(".selectedBlock").removeClass("selectedBlock");
    if (scrollTop >= offsetAnchors.prices && scrollTop < offsetAnchors.description) {
        $("#prices-link").addClass('selectedBlock');
    } else if (scrollTop >= offsetAnchors.description && scrollTop < firstNotZero(offsetAnchors.map, offsetAnchors.feedback, offsetAnchors.similar)) {
        $("#description-link").addClass('selectedBlock');
    } else if (scrollTop >= firstNotZero(offsetAnchors.map, offsetAnchors.description, 0) && scrollTop < firstNotZero(offsetAnchors.feedback, offsetAnchors.similar, 0)) {
        $("#map-link").addClass('selectedBlock');
    } else if (scrollTop >= firstNotZero(offsetAnchors.feedback, offsetAnchors.map, offsetAnchors.description) && (scrollTop < offsetAnchors.similar ||  offsetAnchors.similar === 0)) {
        $("#feedback-link").addClass('selectedBlock');
    } else if (scrollTop >= offsetAnchors.similar) {
        $("#similar-link").addClass('selectedBlock');
    }

});

$(function() {

    var getFixedHeaderHeight = function () {
        return ( window.innerWidth < /* 760*/ 1100 ) ? 0 : $('.header-breadcrumbs').outerHeight() + $('#title-wrapper').outerHeight();
    };

   $('.hp-back-a, .best-price-to-date').click(function() {
       var body = $("html, body");
       var priceBlockOffset = $('#prices').eq(0).offset().top;
       var fixedHeaderHeight = getFixedHeaderHeight();
       $(body).stop().animate({scrollTop: priceBlockOffset - fixedHeaderHeight - 15}, 500);
   });
    $('.hp-ttl-discount').on('click', function () {
        var fixedHeaderHeight = getFixedHeaderHeight();
        $('body, html').stop().animate({scrollTop: $('[data-ng-controller=thSubscriberController]').offset().top - fixedHeaderHeight - 50}, 400)
    });


    $('.hp-ttl [data-toggle="tooltip"]').tooltip({
        title: function() {
            return $(this).attr('data-text');
        }
    });
});
function firstNotZero (x, y, z) {
    if (x != 0) {
        return x;
    }
    if (y != 0) {
        return y;
    }
    return z;
}