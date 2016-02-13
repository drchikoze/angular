var TourBook = TourBook || {};

TourBook.bookingPage = function() {
    var $ = jQuery;

    var settings = {
        tooltipClass: 'hint-tooltip'
    };

    var self = {
        data: {
        },

        init: function() {
            $(document).ready(function() {
                if (window.bookingPageData != undefined) {
                    self.data = window.bookingPageData;
                }

                self.ready();
            });
        },

        setEvents: function() {
            //
        },


        tooltip: function(selector) {
            $(selector).tooltip({
                tooltipClass: settings.tooltipClass,
                hide: { delay: 10},
                items: '[data-tooltip]',
                content: function() {
                    return $(this).data('tooltip');
                },
                position: {
                    my: "center bottom-20",
                    at: "center top",
                    using: function(position, feedback) {
                        $(this).css(position);
                        $("<div>")
                            .addClass("arrow")
                            .addClass(feedback.vertical)
                            .addClass(feedback.horizontal)
                            .appendTo(this);
                    }
                }
            });

        },

        initTooltips: function() {
            self.tooltip('[data-tooltip]');
        },

        ready: function() {
            self.setEvents();
            self.initTooltips();
        }
    };

    self.init();



    return {
        tooltips: self.initTooltips
    };
}();

$(function() {
    $('[data-toggle=operatorLogo]').popover({
        template: '<div class="operatorLogo popover" role="tooltip"><div class="popover-content"></div></div>',
        trigger: 'manual',
        placement: 'bottom',
        content: '<p>' + window.operatorName + ' является поставщиком тура. </p><p>Забронировать тур Вы можете на нашем сайте по цене поставщика. ' +
            'Отправьте заявку для уточнения деталей по туру и бронирования. ' +
            'Наши специалисты окажут Вам полную поддержку: подбор тура и дополнительных услуг, оформление визы, подготовку документов для отдыха, ' +
            'решение Ваших проблем и вопросов на протяжении всего отдыха.</p>',
        html: true
    }).on("mouseenter", function () {
        var _this = this;
        $(this).popover("show");
        $(".popover").on("mouseleave", function () {
            $(_this).popover('hide');
        });
    }).on("mouseleave", function () {
        var _this = this;
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popover("hide");
            }
        }, 300);
    });
});

$(function() {
    $(window).on('beforeunload', function () {
        $(window).scrollTop(0);
    });
    var buttons = $('.booking-closed-btn'),
        bookArrow = $('.book-button-arrow'),
        buttonsHeight = buttons.innerHeight(),
        breadcrumbs = $('#header-breadcrumbs-placeholder');
    $("#mobile-screen-accordion, #mobile-screen-accordion-bottom").on("accordionactivate", function () {
        if (buttons.is('.fixed')) {
            //запоминаем оффсет документа, в момент раскрытия формы,
            // чтобы узнать направление скрола и понять в какую сторону смещать нашу форму
            buttons.data('documentOffset', $(document).scrollTop());
            buttons.data('topLimit', parseInt(buttons.css('top')));
            if ($(document).scrollTop() + buttons.outerHeight() > $(document).outerHeight()) {
                $(window).off("scroll", realScrollHandler);
                $(window).on("scroll", tempScrollHandler);
                $(document).scrollTop($(document).outerHeight() - buttons.outerHeight());
                buttons.data('documentOffset', $(document).scrollTop());
            }
        }
    });
    var tempScrollHandler = function () {
        $(window).off("scroll", tempScrollHandler);
        $(window).on("scroll", realScrollHandler);
    };

    var isMobile = function () {
        var mobileDesktopBreakPoint = 760;
        return (window.innerWidth < mobileDesktopBreakPoint);
    };

    var isDesktop = function () {
        return !isMobile();
    };

    var realScrollHandler = function () {
        var scroll = $(document).scrollTop();
        var breadCrumbsPhoneClass = 'phone';
        var breadcrumbsOriginalPositionY = $('.navbar.navbar-default').offset().top + $('.navbar.navbar-default').outerHeight();
        if (scroll > breadcrumbs.offset().top && !breadcrumbs.is('.fixed') && isDesktop() && window.location.pathname != '/my_tourbook') {
            var width = $('.content-inner').innerWidth() - parseInt($('.content-inner').css('padding-right')) + parseInt($('.inner-field').css('padding-left'));
            breadcrumbs.addClass('fixed').css('width', width);

            var ul = breadcrumbs.find('ul');
            var lastListItem = ul.find('li:last-child');
            if (lastListItem.is('.' + breadCrumbsPhoneClass)) {
                lastListItem.show();
            } else {
                ul.append('<li class="' + breadCrumbsPhoneClass + '">/li>');
                var phone = $('.header15-phone-s').text();
                ul.find('.' + breadCrumbsPhoneClass)
                    .text('Наш телефон: ' + phone)
                    .css({float: 'right', 'font-weight': 'bold'})
            }
            //следующая строчка предотвращает "скачок" контента вверх
            $('.content.tourbook-form').css('padding-top', '+=' + breadcrumbs.outerHeight());
        } else if (scroll <= breadcrumbsOriginalPositionY && breadcrumbs.is('.fixed')) {
            //возврщаем всё в изначальное состояние
            breadcrumbs.removeClass('fixed');
            breadcrumbs.find('.' + breadCrumbsPhoneClass).hide();
            breadcrumbs.css('width', 'auto');
            $('.content.tourbook-form').css('padding-top', 0);
        }

        if (buttons.length > 0) {
            var buttonsOriginalPositionY = $('.booking-closed-top').offset().top + $('.booking-closed-top').outerHeight() - parseInt($('.booking-closed-top').css('padding-bottom'));
            var accordionClosed = $('.booking-closed-btn .ui-accordion-content-active').length === 0,
                accordionOpened = !accordionClosed;
            var fullScroll = (breadcrumbs.is('.fixed')) ? scroll + breadcrumbs.outerHeight() : scroll;
            var paddingTop = 20;
            if (fullScroll >= buttons.offset().top + paddingTop && !buttons.is('.fixed') && accordionClosed) {
                var visualPadding = 18; //подобрал это число, чтобы ничего не дергалось, не знаю как оно получается
                $('.booking-closed-top').css('margin-bottom', '+=' + (buttonsHeight - visualPadding));
                breadcrumbs.addClass('borderless');
                var css = {
                    'width': $('.booking-closed-top').innerWidth()
                };
                css.top = (!breadcrumbs.is('.fixed')) ? 0 : breadcrumbs.outerHeight();
                buttons.addClass('fixed').css(css);
                bookArrow.addClass('arrow-scroll');
            } else if (accordionOpened && buttons.is('.fixed')) {
                var from = buttons.data('documentOffset');
                var to = $(document).scrollTop();
                var topLimit = buttons.data('topLimit');
                var buttonsOldPosition = parseInt(buttons.css('top'));
                var buttonsNewPosition = buttonsOldPosition + (from - to);
                var limitTop = Math.min(buttonsNewPosition, topLimit); //чтобы верх формы не "отлип" от верха окна
                var alwaysVisiblePartSize = 60;
                //чтобы нельзя было проскроллить вниз и полностью скрыть форму за верхней границей окна
                //всегда оставляем нижний край видимым
                var limitBottom = Math.max(-buttons.outerHeight() + alwaysVisiblePartSize, limitTop);
                buttons.css('top', limitBottom); //имитируем скролл сдвигая форму по-вертикали
                //предотвращаем скрол документа, пока открыта фиксированная форма
                $(document).scrollTop(from);
            } else if (fullScroll <= buttonsOriginalPositionY && buttons.is('.fixed')) {
                buttons.removeClass('fixed');
                bookArrow.removeClass('arrow-scroll');
                breadcrumbs.removeClass('borderless');
                $('.booking-closed-top').css('margin-bottom', '-=' + (buttonsHeight - 18));
            }
        }
    };
    $(window).on('scroll', realScrollHandler);

    if ( isMobile() ) {
        $('.tooltip').css("width", "250px");
        $('.sub-agent').click(function(e) {
            $(this).find('.tooltip').toggle();
        });
    } else {
        $('.sub-agent').mouseover(function(e) {
            $(this).find('.tooltip').toggle();
        }).mouseout(function(e) {
            $(this).find('.tooltip').toggle();
        });
    }

    $(window).on('resize', function () {
        realScrollHandler();
        if (isMobile()) {
            if ($('.modal.m-booking:visible').length !== 0) {
                $('.modal.m-booking:visible').find('.m-booking-x.modal-close').click();
            }
            breadcrumbs.removeClass('fixed').css('width', 'auto');
            $('.content.tourbook-form').css('padding-top', 0);
            if (buttons.is('.fixed')) {
                buttons.css('top', 0);
            }
        } else {
            buttons.css('top', breadcrumbs.outerHeight());
            //закрываем открытую форму
            $('.booking-closed-btn .ui-accordion-content-active').prev('.content-toggle').click();
            breadcrumbs.css('width', $('.content-inner').innerWidth() - parseInt($('.content-inner').css('padding-right')) + parseInt($('.inner-field').css('padding-left')));
        }
        if (!buttons.is('.fixed')) {
            buttons.css('width', 'auto');
        } else {
            buttons.css({
                'width': $('.booking-closed-top').outerWidth()
            });
        }
    });
    $('[data-toggle="tooltip"]').tooltip();
    $('.modal-window-new-request .floatlabel').floatlabel();
});