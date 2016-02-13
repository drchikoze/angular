// Вынес код из php
$(document).ready(function() {

    $('.modal-show').click(function(e){
        var t = $(this).data('target');
        // $('.overlay').show();
        $('.modal-window#' + t).show();
        e.preventDefault();
    });

    $('.modal-close').click(function(e){
        $(this).closest('.modal-window').hide();
        $('.overlay').hide();
        e.preventDefault();
    });

    $(document).scrollTop(0);
    isLoadingFilters = function() {
        return $('.search-res-ttl').offset().top != 0;
    };

    var $window = $(window),
        $titleWrapper = $("#title-wrapper"),
        $headerBreadcrumbs = $('.header-breadcrumbs'),
        $redLinks = $('.hp-red-links');

    var $titlePlaceholder = $('#title-placeholder');
    var $headerPlaceholder = $('#header-breadcrumbs-placeholder');
    var paddingBetweenBreadCrumbsAndTitleWrapper = 13;
    var $breadcrumbsPlaceholderHeight = $headerBreadcrumbs.height();
    var $breadcrumbsPlaceholderWidth = $headerBreadcrumbs.width();

    $window.scroll(function() {

        if (!$titleWrapper.hasClass("fixed-scroll") && ($window.scrollTop() + $breadcrumbsPlaceholderHeight + paddingBetweenBreadCrumbsAndTitleWrapper > $titleWrapper.offset().top) && document.body.clientHeight > 500 && window.innerWidth >= /* 760*/ 1100) {
            var titleWidth = ($('.page').width()) - 40 + 'px';
            var $titlePlaceholderHeight = $titleWrapper.height() + parseInt($redLinks.css('margin-bottom'));
            var $titlePlaceholderWidth = $titleWrapper.width();
            $titleWrapper.data('top', $titleWrapper.offset().top).addClass("fixed-scroll");
            $titleWrapper.css({
                'z-index': 7, 'top': $breadcrumbsPlaceholderHeight,
                width: titleWidth,
                'padding-top': paddingBetweenBreadCrumbsAndTitleWrapper,
                'box-shadow': 'rgba(100, 100, 100, 0.298039) 0px 5px 5px -3px'
            });
            $titlePlaceholder.css({ 'height': $titlePlaceholderHeight,
                'width': $titlePlaceholderWidth });
            $redLinks.css({
                'margin-bottom': '0',
                'border-bottom': 'none'
            });
        }
        else if (($titleWrapper.hasClass("fixed-scroll") && ($window.scrollTop() + $breadcrumbsPlaceholderHeight + paddingBetweenBreadCrumbsAndTitleWrapper < ($titleWrapper.data("top")))) || window.innerWidth < /* 760*/ 1100) {
            $titlePlaceholder.css({ 'height': '',
                'width': '' });
            $titleWrapper.removeClass("fixed-scroll").css({
                'width': '',
                'padding-top': 0,
                'box-shadow': 'none'
            });
            $redLinks.css({ 'margin-bottom': '',
                'margin-bottom': '',
                'border-bottom': '1px solid #d7d7d7'
            });
        }

        if (!$headerBreadcrumbs.hasClass("fixed-scroll") && ($window.scrollTop() > $headerBreadcrumbs.offset().top) && document.body.clientHeight > 500 && window.innerWidth >=/* 760*/ 1100) {
            var width = ($('.page').width() - 10) + 'px';
            $headerPlaceholder.css({ 'height': $breadcrumbsPlaceholderHeight,
                'width': $breadcrumbsPlaceholderWidth});
            $headerBreadcrumbs.addClass("fixed-scroll").data("top", $headerBreadcrumbs.offset().top);
            $('.header-breadcrumbs ul').prepend('<li class="inserted" style="display: inline-block; color: white; ' +
                'background: #f13d41; height: 26px; line-height: 20px; padding: 3px; margin-right: 10px;">' +
                '<a href="/" style="color: #ffffff; text-decoration: none;">TOURBOOK</a>' +
                '</li>');

            $headerBreadcrumbs.css({ 'width' : width,
                'z-index' : 11});
        }
        else if (($headerBreadcrumbs.hasClass("fixed-scroll") && !$titleWrapper.hasClass("fixed-scroll") && ($window.scrollTop() < $headerBreadcrumbs.data("top"))) || window.innerWidth < /* 760*/ 1100) {
            $headerPlaceholder.css({ 'height': '',
                'width': '',
                'z-index': ''
            });
            $headerBreadcrumbs.removeClass("fixed-scroll");
            $(".inserted").remove();
        }

        var scroll = $(document).scrollTop() ;
        if (!$('.side-graph').hasClass('plot-fixed') && scroll + $('#title-wrapper').outerHeight() + $breadcrumbsPlaceholderHeight >= $('.side-graph').offset().top - 20) {
            $('.side-graph').addClass('plot-fixed');
            $('.ti-search-link').addClass('ti-search-fixed');
        } else if (scroll + $('#title-wrapper').outerHeight() + $breadcrumbsPlaceholderHeight < $('.right-chooser.tb-filters-hotel').offset().top + $('.right-chooser.tb-filters-hotel').outerHeight()) {
            $('.side-graph').removeClass('plot-fixed');
            $('.ti-search-link').removeClass('ti-search-fixed');
        }
    });
    $(window).resize(function() {
        if (window.innerWidth </* 760*/ 1100) {
            $headerPlaceholder.css({ 'height': '',
                'width': '',
                'z-index': ''
            });
            $headerBreadcrumbs.add($titleWrapper).removeClass("fixed-scroll");
            $(".inserted").remove();
        }
    });
});
