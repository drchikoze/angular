/**
 * Created by wolfh on 14.12.2015.
 */
// Вынес из шаблона в отдельный файл
$(document).ready(function() {
    function smallScreen() {
        return $('body').outerWidth() < 1260;
    }
    if (!smallScreen()) {
        (function () {

            isLoadingFilters = function() {
                return $('.search-res-ttl').offset().top != 0;
            };

            $('#filters-search').addClass('in');

            var $window = $(window),
                $navigation = $("#filters-search"),
                $titleString = $("#title-string"),
                $titleWrapper = $("#title-wrapper"),
//                $searchResFilters = $(".search-res-filt"),
                $headerBreadcrumbs = $('.header-breadcrumbs');
            var $titlePlaceholder = $('#title-placeholder');
            var $headerPlaceholder = $('#header-breadcrumbs-placeholder');

            var $breadcrumbsPlaceholderHeight = $headerBreadcrumbs.height();
            var $breadcrumbsPlaceholderWidth = $headerBreadcrumbs.width();

            $window.scroll(function() {
                if (!smallScreen()) {

                    if (isLoadingFilters()) {
                        header15Height = $('.header15').height();
                        //Проверка center-col - чтобы избежать прилипания элементов при недостатке контента - тогда дергается скролла
                        var contentHeight = $('.center-col').height();
                        var $searchResFiltersTop = header15Height + $('#title-placeholder').height();
                        var footerOffsetTop = $('.footer').offset().top;

                        headerHeight = $(window).scrollTop() + $('#title-wrapper').height() + 36;
                        contentBlockHeight = $('.inner-field2').height() - $('#title-wrapper').height() - parseInt($('#title-string').css('marginBottom')) - parseInt($('.inner-field2').css('paddingBottom'));
                        if ((($window.scrollTop() + 30 > ($searchResFiltersTop - 100)) && (contentBlockHeight >= $('.right-chooser').height()) && (contentHeight >= 1500))) { // Если прокручено больше высоты заголовка или высота фильтра ограничивает высоту контента (100 - требуется для обработки остающихся плейсхолдеров)

                            if (($('.right-chooser').height() - $(window).height() + $('#title-wrapper').height() > 0) || ((footerOffsetTop - ($('.right-chooser').offset().top + $('.right-chooser').height())) < 200 && (contentHeight >= 1500))) {
                                $('.right-chooser').css('position', 'absolute');
                                $('.right-chooser').css('z-index', '3');
                                $('.right-chooser').addClass("fixed-search-filters");
                                $('.search-filters-placeholder').css('display', 'block');
                                if ($('.right-chooser').offset().top + 86 - headerHeight > 0) { // Верхняя граница ниже заголовка
                                    $('.right-chooser').css('top', headerHeight - 86 - header15Height + 'px');
                                } else if ($(window).scrollTop() + $(window).height() > $('.right-chooser').offset().top + $('.right-chooser').height()) { // нижняя граница выше низа
                                    if ($(window).scrollTop() + $(window).height() <= $('.footer').offset().top - 80) {
                                        $('.right-chooser').css('top', $(window).scrollTop() + $(window).height() - $('.right-chooser').height() - 86 - header15Height + 'px');
                                    } else {
                                        $('.right-chooser').css('top', $('.footer').offset().top - 80 - $('.right-chooser').height() - 86 - header15Height + 'px');
                                    }
                                }
                            } else { // Высота блока меньше высоты страницы
                                $('.search-filters-placeholder').css('display', 'none');
                                $('.right-chooser').css('position', 'fixed');
                                $('.right-chooser').css('z-index', '3');
                                $('.right-chooser').addClass("fixed-search-filters");
                                //30 - временный хак, потом можно будет пересчитать (поменялись элементы на странице)
                                $('.right-chooser').css('top', $navigation.offset().top - header15Height + $('.gluh-right-block').height() + 30);
                            }
                        } else { // прокрутка меньше заголовка
                            $('.right-chooser').css('position', 'inherit');
                            $('.right-chooser').css('z-index', '');
                            $('.right-chooser').removeClass("fixed-search-filters");
                            $('.search-filters-placeholder').css('display', 'none');
                        }
                    }


                    //Проверка center-col - чтобы избежать прилипания элементов при недостатке контента - тогда дергается скролл
                    if (!$titleWrapper.hasClass("fixed-scroll") && ($window.scrollTop() + 36 > $titleWrapper.offset().top) && ($('.center-col').height() >= 1500)) {
                        var titleWidth = ($('.page').width() - 262) + 'px';
                        var searchResFiltersWidth = ($('.page').width() - 267) + 'px';
                        $titleWrapper.addClass("fixed-scroll").data("top", $titleString.offset().top);
                        var $titlePlaceholderHeight = $titleWrapper.height();
                        //var $titlePlaceholderWidth = $titleWrapper.width();
                        $titlePlaceholder.css({'height': $titlePlaceholderHeight});
                        //$titlePlaceholder.css({'width': $titlePlaceholderWidth});
                        $titleString.css({'width': titleWidth});
                        $('.search-res-filt').css({'width': searchResFiltersWidth});
                        $titleString.css({'margin-top': '41px'});
                    }
                    else if ($titleWrapper.hasClass("fixed-scroll") && ($window.scrollTop() < ($titleWrapper.data("top")))) {
                        $titlePlaceholder.css({'height': ''});
                        $titlePlaceholder.css({'width': ''});
                        $titleString.css({'width': ''});
                        $('.search-res-filt').css({'width': ''});
                        $titleString.css({'margin-top': ''});
                        $titleWrapper.removeClass("fixed-scroll");
                    }

                    //Проверка center-col - чтобы избежать прилипания элементов при недостатке контента - тогда дергается скролл
                    if (!$headerBreadcrumbs.hasClass("fixed-scroll") && ($window.scrollTop() > $headerBreadcrumbs.offset().top) && ($('.center-col').height() >= 1500)) {
                        var width = ($('.page').width() - 20) + 'px';
                        $headerBreadcrumbs.addClass("fixed-scroll").data("top", $headerBreadcrumbs.offset().top);
                        $('.header-breadcrumbs ul').prepend('<li class="inserted" style="display: inline-block; color: white; ' +
                            'background: #f13d41; height: 26px; line-height: 20px; padding: 3px; margin-right: 10px;">' +
                            '<a href="/" style="color: #ffffff; text-decoration: none;">TOURBOOK</a>' +
                            '</li>');
                        $headerPlaceholder.css({'height': $breadcrumbsPlaceholderHeight});
                        $headerPlaceholder.css({'width': $breadcrumbsPlaceholderWidth});
                        $headerBreadcrumbs.css({'width': width});
                        $headerBreadcrumbs.css({'z-index': 11});
                    }
                    else if ($headerBreadcrumbs.hasClass("fixed-scroll") && ($window.scrollTop() < $headerBreadcrumbs.data("top"))) {
                        $headerPlaceholder.css({'height': ''});
                        $headerPlaceholder.css({'width': ''});
                        $headerBreadcrumbs.css({'z-index': ''});
                        $headerBreadcrumbs.css({'width': ''});
                        $headerBreadcrumbs.removeClass("fixed-scroll");
                        $(".inserted").remove();
                    }

//            if (!$searchResFilters.hasClass("fixed-scroll") && ($window.scrollTop() + 111 > $searchResFilters.offset().top)) {
//                var searchFiltersWidth = ($('.page').width() - 267) + 'px';
//                $searchResFilters.addClass("fixed-scroll").data("top", $searchResFilters.offset().top);
//                $searchResFilters.css({ 'width' : searchFiltersWidth });
//                $searchResFilters.css({ 'margin-top' : '112px' });
//                $searchResFilters.css({ 'z-index' : 2 });
//            }
//            else if ($searchResFilters.hasClass("fixed-scroll") && ($window.scrollTop() < ($searchResFilters.data("top") - 110))) {
//                $searchResFilters.css({ 'width' : '' });
//                $searchResFilters.removeClass("fixed-scroll");
//                $searchResFilters.css({ 'margin-top' : '' });
//                $searchResFilters.css({ 'z-index' : '' });
//            }
                }
            });
        })();
    } else {
        setTimeout(function() {
            angular.element('.alloccat-title-inp').scope().displaySelectPopup();
        }, 1000);
    }

    NProgress.configure({
        showSpinner: false,
        parent: 'div.search-progress-bar'
    });

    NProgress.start();
    NProgress.set(0);
    NProgress.inc();
});
