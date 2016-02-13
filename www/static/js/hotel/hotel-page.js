var TourBook = TourBook || {};

TourBook.hotelPage = function() {
    var $ = jQuery;

    var timeStart = new Date();

    var settings = {
        hotelMapId: 'hotel-map',
        hotelBalloonTemplate: '#hotel-balloon-template',
        stickyHeaderSelector: '#title-wrapper',
        minPriceGraph: {
            selector: 'min-price-graph',
            medium: true
        },
        minPriceGraphPopup: {
            selector: 'min-price-graph-popup',
            large: true
        },
        minPriceGraphShort: {
            selector: 'min-price-graph-short',
            short: true
        }
    };

    var idGenerator = new IDGenerator();

    var graphId = idGenerator.getID();

    var self = {
        data: {
            hashTagActive: '',
            minPriceUrl: '',
            minPriceInfo: null,
            hotelCoords: {lat: null, long: null},
            balloonTitle: '',
            allMinPriceUrlsAndMonth: {},
            curMonth: '',
            curYear: '',
            roomSize: '',
            allocationId: '',
            duration: '',
            departureCity: '',
            minPriceDate: '',
            maxPriceDate: '',
            curPriceDate: '',
            firstGraphsDataReceived: false,
            fullGraphsDataReceived: false
        },

        minPrice: {
            formatDate: function(dateStr) {
                var days = {1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс'};
                var dt = moment(dateStr);
                return dt.format('DD.MM.YY') + ', ' + days[dt.isoWeekday()];
            },
            formatDateMonth: function(dateStr) {
                var dt = moment(dateStr);
                return dt.format('DD.MM');
            },
            formatMonth: function(dateStr) {
                var dt = moment(dateStr);
                return dt.format('MM');
            },
            formatYear: function(dateStr) {
                var dt = moment(dateStr);
                return dt.format('YYYY');
            },
            formatDateToUrl: function(dateStr) {
                var dt = moment(dateStr);
                return dt.format('DD.MM.YYYY');
            }
        },

        hotelMap: null,
        minPriceInfo: {payload: null, data: null, priceRub: null},
        minPriceTimeout: 0,
        minPriceRequest: 0,

        init: function() {
            $(document).ready(self.ready);
        },

        loadPageData: function() {
            self.data = window.hotelPageData ? window.hotelPageData : null;
        },

        showHotelMap: function() {
            if (!self.data || !self.data.hotelCoords) {
                return;
            }
            if (typeof ymaps !== 'undefined') {
                ymaps.ready(self.initHotelMap);
            } else {
                $.getScript('http://api-maps.yandex.ru/2.1/?lang=ru_RU', function () {
                    ymaps.ready(self.initHotelMap);
                });
            }
        },

        initHotelMap: function() {
            var placemark;
            var point = [self.data.hotelCoords.long, self.data.hotelCoords.lat];

            self.hotelMap = new ymaps.Map(settings.hotelMapId, {
                center: point,
                zoom: 13,
                controls: ["zoomControl", "fullscreenControl", "typeSelector"],
                type: "yandex#map"
            });

            placemark = new ymaps.Placemark(point, {
                hintContent: self.data.balloonTitle,
                balloonContent: $(settings.hotelBalloonTemplate).html()
            });

            self.hotelMap.geoObjects.add(placemark);
            self.hotelMap.behaviors.disable('scrollZoom');
        },

        showEmptyMinPriceGrapch: function() {
            /*
            MG.data_graphic({
                title: false,
                description: false,
                chart_type: 'missing-data',
                missing_text: 'Поиск минимальной цены...',
                target: settings.minPriceGraph.selector,
                width: settings.minPriceGraph.width,
                height: settings.minPriceGraph.height,
                small_text: true
            });
            */
        },

        makeLink: function(date) {
            var link = '/hotel/' + self.data.departureCity + '/al' + self.data.allocationId + '/details/' + date + '/' +
                self.data.duration + '/' + self.data.roomSize;

            if (typeof(window.searchParams.ch1) != 'undefined') {
                link = link + ':' + window.searchParams.ch1;
            }
            if (typeof(window.searchParams.ch2) != 'undefined') {
                link = link + ',' + window.searchParams.ch2;
            }
            if (window.location.search.indexOf('informer') != -1) {
                link += '?informer=1';
            }
            return link;
        },

        graphZeroPoint: 0,

        graphTooltipContent: function (str, seriesIndex, pointIndex, plot) {
            var day = plot.options.lineDates[pointIndex];
            self.data.curPriceDate = day + '.' + self.data.curMonth + '.' + self.data.curYear;

            var price = plot.data[seriesIndex][pointIndex][1];
            $('.modal-prices-value_b .modal-prices-value-d .modal-prices-value-s').text(day+'.'+self.data.curMonth);
            $('.modal-prices-value_b .modal-prices-value-p .modal-prices-value-s').html(number_format(price, 0, ',', ' ') + ' <i class="fa fa-rub"></i>');
            return '<table class="jqplot-highlighter"><tr><td>Цена: ' + number_format(plot.data[seriesIndex][pointIndex][1] - 0 + self.graphZeroPoint, 0, '.', ' ') + ' <i class="fa fa-rub"></i></td></tr><tr><td>Вылет: ' + plot.options.lineDates[pointIndex] + '.' + self.data.curMonth + '</td></tr></table>';
        },

        showMinPriceGraph: function(data, options) {
            $('#' + options.selector).html('');
            var line = [];
            var lineDates = [];
            var c = 0;
            for (var i = 0, length = data.length; i < length;) {
                if (i in data) {
                    var date = data[i].date;
                    date = date.substr(8, 2);
                    lineDates[lineDates.length] = date;
                    line[line.length] = [date, data[i].price];
                    //c++;
                    if (options.short) {
                        i = i + 4;
                    } else if (options.medium) {
                        i = i + 2;
                    } else {
                        i++;
                    }
                } else {
                    i++;
                }
            }

            var defColor = '#5a5a5a';
			var lowestColor = '#00a551';
			var highestColor = '#f13d41';
			var arr = [];
			var barMax = line[0][1] ;
			var barMin = (line[0][1] != null) ? line[0][1] : 10000000;
			for (var i = 1; i < line.length; i++) {
				if (line[i][1] > barMax) {
					barMax = line[i][1];
				} else if (line[i][1] < barMin && line[i][1] != null) {
					barMin = line[i][1];
				};
			}
            //if (options.selector !== 'min-price-graph-popup') {
            //    self.graphZeroPoint = Math.round(barMin * 0.8);
            //    barMin = barMin - self.graphZeroPoint;
            //    barMax = barMax - self.graphZeroPoint;
            //} else {
            //    self.graphZeroPoint = 0;
            //}

			for (var i = 0; i < line.length; i++) {
                line[i][1] = line[i][1] - self.graphZeroPoint;
				arr[i] = defColor;
				if (line[i][1] == barMax) {
					arr[i] = highestColor;
				} else if (line[i][1] == barMin) {
					arr[i] = lowestColor;
				};
			};
			var plotOptions = {
				seriesDefaults:{
					autoscale: true,
					renderer:$.jqplot.BarRenderer,
					pointLabels: {show: true},
					rendererOptions: {
						barWidth: 3,
						shadowOffset: 0,
						varyBarColor: true
					}
				},
                //axesDefaults: {
                    //tickRenderer: $.jqplot.CanvasAxisTickRenderer ,
                    //tickOptions: {
                    //  angle: 0,
                    //  fontSize: '9pt'
                    //}
                //},
                lineDates : lineDates,
				seriesColors: arr,
				grid: {
					background: 'transparent',
					borderColor: 'transparent',
                    gridLineColor: 'transparent',
					shadow: false
				},
				axes: {
					xaxis: {
                        pad: 1.7,
						renderer: $.jqplot.CategoryAxisRenderer,
						tickOptions: {
                            formatString: '%b',
                            showGridline: false
                        }
					},
                    yaxis: {
                        tickOptions: {showLabel: false}
                    }
				},
                highlighter: {
                //    show: true,
                //    tooltipAxes: 'x',
                //    tooltipContentEditor: this.graphTooltipContent
                }
			};

            $('#min-price-graph-popup').bind('jqplotDataClick',
                function (ev, seriesIndex, pointIndex, data) {
                    self.openCurPriceLink();
                }
            );

            if (options.selector == 'min-price-graph-popup') {
                plotOptions.axes.yaxis.tickOptions.showLabel = true;
                plotOptions.axes.yaxis.tickOptions.borderColor = "#fff";
                plotOptions.highlighter.show = true;
                plotOptions.highlighter.tooltipAxes = 'x';
                plotOptions.highlighter.tooltipContentEditor = this.graphTooltipContent;
                plotOptions.grid.gridLineColor = '#f5f5f5';

            }
            
            var plot1 = $.jqplot(options.selector, [line], plotOptions);



			$('.fr-tooltip-label').on('click', function () {
				this.children[0].classList.toggle('show');
			});
			$('.fr-tooltip-close').on('click', function () {
				this.parentNode.classList.remove('show');
			});
			$('.fr-tooltip-block').on('click', function (event) {
				event.stopPropagation();
			});

            //Должен выполняться отдельно от предыдущего ифы
            if (options.selector == 'min-price-graph-popup') {
                $('#min-price-graph-popup').find('.jqplot-yaxis-tick').each(function (i, e) {
                    var t = number_format($(this).text(), 0, '.', ' ');
                    $(this).text(t);
                });

                $('#min-price-graph-popup').find('.jqplot-xaxis-tick').each(function(i, e) {
                    $(this).css('color', arr[i]);
                });
            } else if (options.selector == 'min-price-graph') {
                $('#min-price-graph').find('.jqplot-xaxis-tick').each(function(i, e) {
                    $(this).css('color', arr[i]);
                });
            } else if (options.selector == 'min-price-graph-short') {
                $('#min-price-graph-short').find('.jqplot-xaxis-tick').each(function(i, e) {
                    $(this).css('color', arr[i]);
                });
            }
        },

        setMinPricesMonthFirst: function() {
            $('.min-price-graph-popup').empty();
            $('.min-price-graph-short').empty();
            $('.min-price-graph').empty();
            var monthNumber = 0;
            self.data.minPriceUrl = self.data.allMinPriceUrlsAndMonth[monthNumber]['url'];
            self.storedGraphData = null;
            self.getMinPrice();
            $('.first-month').addClass('active');
            $('.first-month').siblings().removeClass('active');
        },

        setMinPricesMonthSecond: function() {
            $('.min-price-graph-popup').empty();
            $('.min-price-graph-short').empty();
            $('.min-price-graph').empty();
            var monthNumber = 1;
            self.data.minPriceUrl = self.data.allMinPriceUrlsAndMonth[monthNumber]['url'];
            self.storedGraphData = null;
            self.getMinPrice();
            $('.second-month').addClass('active');
            $('.second-month').siblings().removeClass('active');
        },

        setMinPricesMonthThird: function() {
            $('.min-price-graph-popup').empty();
            $('.min-price-graph-short').empty();
            $('.min-price-graph').empty();
            var monthNumber = 2;
            self.data.minPriceUrl = self.data.allMinPriceUrlsAndMonth[monthNumber]['url'];
            self.storedGraphData = null;
            self.getMinPrice();
            $('.third-month').addClass('active');
            $('.third-month').siblings().removeClass('active');
        },

        openMinPriceLink: function() {
            var link = self.makeLink(self.minPrice.formatDateToUrl(self.data.minPriceDate));
            window.location.href = link;
        },

        openMaxPriceLink: function() {
            var link = self.makeLink(self.minPrice.formatDateToUrl(self.data.maxPriceDate));
            window.location.href = link;
        },

        openCurPriceLink: function() {
            var link = self.makeLink(self.data.curPriceDate);
            window.location.href = link;
        },

        toggleMapFullScreen: function(event) {
            $('#hotel-map').toggleClass('maxMap');
            self.data.hotelMap.container.fitToViewport();
            event.preventDefault();
        },

        startProgressBar: function() {
            NProgress.start();
            NProgress.inc();
        },

        configProgressBar: function() {
            NProgress.configure({
                showSpinner: false,
                parent: 'div.search-progress-bar'
            });
        },

        getPageTopOffset: function() {
            //var stickyHeader = $(settings.stickyHeaderSelector);
            //if (stickyHeader.length > 0) {
            //    return stickyHeader.height();
            //}

            //TODO:
            // до начала прокрутки height меньше
            return 135;
        },

        smoothScroll: function(selector, getTopOffsetCallback) {
            if (self.data.hashTagActive == selector) {
                return;
            }

            var offset = 0;
            if ($(selector).offset().top > $(document).height() - $(window).height()) {
                offset = $(document).height() - $(window).height();
            } else {
                offset = $(selector).offset().top;
            }

            if (getTopOffsetCallback != undefined){
                offset -= getTopOffsetCallback();
            }

            $('html,body').animate({
                scrollTop: parseInt(offset) - 40
            }, 500, 'swing', function () {
                self.data.hashTagActive = "";
            });

            self.data.hashTagActive = selector;
        },

        onSmoothScrollClick: function(event) {
            event.preventDefault();
            var _this = this;
            setTimeout(function(){
                self.smoothScroll(_this.hash || $(_this).data('scroll-to'), self.getPageTopOffset);
            }, 1);

        },

        updateMinPrice: function(data) {
            self.data.curMonth = self.minPrice.formatMonth(data.minPriceDate);
            self.data.curYear = self.minPrice.formatYear(data.minPriceDate);
            self.minPriceInfo = data.lowest;
            $('.js-min-price').html(number_format(data.minPrice, 0, ',', ' ') + ' <i class="fa fa-rub"></i>');
            $('.modal-prices-value_g .modal-prices-value-p .modal-prices-value-s').html(number_format(data.minPrice, 0, ',', ' ') + ' <i class="fa fa-rub"></i>');
            $('.modal-prices-value_r .modal-prices-value-p .modal-prices-value-s').html(number_format(data.maxPrice, 0, ',', ' ') + ' <i class="fa fa-rub"></i>');
            if (!isNaN(Date.parse(data.minPriceDate))) {
                $('.modal-prices-value_g .modal-prices-value-d .modal-prices-value-s').text(self.minPrice.formatDateMonth(data.minPriceDate));
            }
            if (!isNaN(Date.parse(data.maxPriceDate))) {
                $('.modal-prices-value_r .modal-prices-value-d .modal-prices-value-s').text(self.minPrice.formatDateMonth(data.maxPriceDate));
            }
            $('.dur').text('на ' + data.lowest.duration + ' нч');
            $('.js-min-price-date').text('вылет ' + self.minPrice.formatDate(data.minPriceDate));
            $('.js-min-price-block').show();
            $('.side-graph').css('visibility', 'visible');
        },

        sendGraphsDataLog: function(type, time) {
            $.ajax({
                method: "GET",
                url: "/hiddenhotel/log_graphs",
                data: { type: type, time: time, allocationId: self.data.allocationId, departureCity: self.data.departureCity,
                    duration: self.data.duration, graphId: graphId }
            });
        },

        isDataExists: function(data) {
            for (var i = 0, length = data.length; i < length;) {
                if (i in data) {
                    if (data[i]['price'] != null) {
                        return true;
                    }
                }
                i++;
            }
            return false;
        },


        getMinPrice: function() {
            //TODO: debug
            //return;

            // TODO: перенести в angular-овский service?

            if (!self.data.minPriceUrl) {
                return;
            }

            var url = self.data.minPriceUrl;
            url = url + "&requestTime=" + self.minPriceRequest;

            $.ajax({
                url: url,
                jsonp: "callback",
                dataType: "jsonp",
                success: function(data) {

                    var timeDataReceived = new Date();

                    var minPrice = -1;
                    var minPriceDate = '';
                    var maxPrice = 0;
                    var maxPriceDate = '';
                    if (data.lowest !== null) {
                        // -- Удаление дней предыдущего месяца
                        for (var j = 0; j < 2; j++) {
                            delete data.minPriceByDuration[data.lowest.duration][0];
                            for (var i = 1, itemsCount = data.minPriceByDuration[data.lowest.duration].length; i < itemsCount; i++) {
                                data.minPriceByDuration[data.lowest.duration][i - 1] = data.minPriceByDuration[data.lowest.duration][i];
                            }
                            delete data.minPriceByDuration[data.lowest.duration][data.minPriceByDuration[data.lowest.duration].length];
                        }

                        var dateToCompare = new Date(data.minPriceByDuration[data.lowest.duration][16]['date']);
                        for (i = 30, itemsCount = data.minPriceByDuration[data.lowest.duration].length; i < itemsCount; i++) {
                            var curDate = new Date(data.minPriceByDuration[data.lowest.duration][i]['date']);
                            if (dateToCompare.getMonth() != curDate.getMonth()) {
                                delete data.minPriceByDuration[data.lowest.duration][i];
                            }
                        }
                        // удаление дней месяца --

                        // нахождение минимальной цены (т.к. мы удаляли пред и след месяц)
                        for (i = 1, itemsCount = data.minPriceByDuration[data.lowest.duration].length; i < itemsCount; i++) {
                            if (data.minPriceByDuration[data.lowest.duration][i] != undefined) {
                                if (data.minPriceByDuration[data.lowest.duration][i]['price'] !== null) {
                                    if (minPrice == -1) {
                                        minPrice = data.minPriceByDuration[data.lowest.duration][i]['price'];
                                        minPriceDate = data.minPriceByDuration[data.lowest.duration][i]['date'];
                                    } else if (data.minPriceByDuration[data.lowest.duration][i]['price'] < minPrice) {
                                        minPrice = data.minPriceByDuration[data.lowest.duration][i]['price'];
                                        minPriceDate = data.minPriceByDuration[data.lowest.duration][i]['date'];
                                    }

                                    if (data.minPriceByDuration[data.lowest.duration][i]['price'] > maxPrice) {
                                        maxPrice = data.minPriceByDuration[data.lowest.duration][i]['price'];
                                        maxPriceDate = data.minPriceByDuration[data.lowest.duration][i]['date'];
                                    }
                                }
                            }
                        }

                        // нахождение минимальной цены --
                        data.minPrice = minPrice;
                        data.minPriceDate = minPriceDate;

                        data.maxPrice = maxPrice;
                        data.maxPriceDate = maxPriceDate;

                        self.data.minPriceDate = minPriceDate;
                        self.data.maxPriceDate = maxPriceDate;

                        self.data.duration = data.lowest.duration;
                        self.data.allocationId = data.lowest.allocationId;
                        self.data.roomSize = data.lowest.roomSize.id;
                        self.data.departureCity = data.lowest.departureCityId;

                        if (data.status.toLowerCase() == 'in_progress') {
                            self.updateMinPrice(data);
                            self.showMinPriceGraph(data.minPriceByDuration[data.lowest.duration], settings.minPriceGraph);
                            self.showMinPriceGraph(data.minPriceByDuration[data.lowest.duration], settings.minPriceGraphShort);
                            self.showMinPriceGraph(data.minPriceByDuration[data.lowest.duration], settings.minPriceGraphPopup);
                            self.storedGraphData = data.minPriceByDuration[data.lowest.duration];
                            if (self.minPriceTimeout) {
                                clearTimeout(self.minPriceTimeout);
                            }

                            if (!self.data.firstGraphsDataReceived) {
                                self.data.firstGraphsDataReceived = true;
                                if (self.isDataExists(data.minPriceByDuration[data.lowest.duration])) {
                                    self.sendGraphsDataLog('first_data', timeDataReceived.getTime() - timeStart.getTime());
                                } else {
                                    self.sendGraphsDataLog('no_data', timeDataReceived.getTime() - timeStart.getTime());
                                }

                            }

                            self.minPriceRequest++;
                            self.minPriceTimeout = setTimeout(function () {
                                self.getMinPrice();
                            }, 1000);
                        }

                        if (data.status.toLowerCase() == 'done') {
                            if (!self.data.fullGraphsDataReceived) {
                                self.data.fullGraphsDataReceived = true;
                                if (self.isDataExists(data.minPriceByDuration[data.lowest.duration])) {
                                    self.sendGraphsDataLog('full_data', timeDataReceived.getTime() - timeStart.getTime());
                                } else {
                                    self.sendGraphsDataLog('no_data', timeDataReceived.getTime() - timeStart.getTime());
                                }

                            }
                            self.updateMinPrice(data);
                            self.showMinPriceGraph(data.minPriceByDuration[data.lowest.duration], settings.minPriceGraph);
                            self.showMinPriceGraph(data.minPriceByDuration[data.lowest.duration], settings.minPriceGraphShort);
                            self.showMinPriceGraph(data.minPriceByDuration[data.lowest.duration], settings.minPriceGraphPopup);
                            self.storedGraphData = data.minPriceByDuration[data.lowest.duration];
                        }
                    }
                }
            });

        },

        onMinPriceClick: function(event) {
            event.preventDefault();

            if (!self.minPriceInfo.payload) {
                return;
            }
            window.location = 'http://service.tourbook.ru/go?payload=' + self.minPriceInfo.payload;
        },

        closeMinPricePopup: function() {
            $('.min-price-popup').hide();
            $('.overlay').hide();
        },

        storedGraphData: null,

        openMinPricePopup: function() {
            if ($(window).innerWidth() < 720) {
                return;
            }
            if (!self.minPriceInfo.payload) {
                return;
            }
            $('.min-price-popup').show();
            $('.overlay').show();
            $('.jqplot-highlighter-tooltip').hide();
            self.showMinPriceGraph(self.storedGraphData, settings.minPriceGraphPopup);
        },

        setEvents: function() {
            $('.js-map-full-screen').on('click', self.toggleMapFullScreen);
            $(".scroll").click(self.onSmoothScrollClick);

            $('.modal-close').on('click', self.closeMinPricePopup);

            //Не нравится вариант, но если передавать параметр - метод отрабатывает при инициализации, что недопустимо
            $(".first-month").on('click', self.setMinPricesMonthFirst);
            $(".second-month").on('click', self.setMinPricesMonthSecond);
            $(".third-month").on('click', self.setMinPricesMonthThird);
            $(".modal-prices-value_g").on('click', self.openMinPriceLink);
            $(".modal-prices-value_r").on('click', self.openMaxPriceLink);
            $(".modal-prices-value_b").on('click', self.openCurPriceLink);
            $("[data-scroll-to]").click(self.onSmoothScrollClick);
            $(".js-min-price-click").click(self.onMinPriceClick);
            $('#' + settings.minPriceGraph.selector).click(self.openMinPricePopup);
            $('.hp-blocks-elem-inner').click(self.openMinPricePopup);
            $('.hp-blocks-elem_graph .hp-blocks-s1').click(self.openMinPricePopup);
            $('js-min-price-date.hp-blocks-s2').click(self.openMinPricePopup);
            $('.min-price-popup .close-icon').click(self.closeMinPricePopup);
            $('.overlay').click(self.closeMinPricePopup);
            $(window).resize(function(){
                $('.min-price-popup').css({
                               position:'fixed',
                               left: ($(window).width() - $('.min-price-popup').outerWidth())/2,
                               top: ($(window).height() - $('.min-price-popup').outerHeight())/2
                });
            });
            $(window).resize();
        },

        ready: function() {
            self.loadPageData();
            self.setEvents();
            $('input[name=phone]').mask("+7 (999) 999 99 99");

            moment.locale('ru');

            self.showHotelMap();
            self.configProgressBar();
            self.startProgressBar();
            self.showEmptyMinPriceGrapch();
            self.getMinPrice();
        }
    };

    self.init();

    return {
        smoothScroll: self.smoothScroll,
        hotelPageObj: self
    };
}();

$(function() {
    $('.filter-toggle-small-screen').on('click', function() {
        var left = $('.right-col').is('.shown') ? -225 : 0;
        var padding = $('.right-col').is('.shown') ? 0 : 225;
        var margin = $('.right-col').is('.shown') ? 0 : -200;
        var opacity = $('.right-col').is('.shown') ? 1 : 0;
        $('.right-col').animate({
            left: left
        }, 400).toggleClass('shown');
        /*
        уезжали кнопки "следить за ценой", "купить выгодно" итд
        $('.hp-btn').animate({
            paddingLeft: padding
        }, 400);
        */
        $(this).siblings('.available-actions').animate({
            marginRight: margin
        }, 600);
        $('.hotel-page .load-additional-tour-info').animate({
            opacity: opacity
        }, 400);
    });

    $('body').on('click', '.js-tooltip', function (event) {
        event.preventDefault();
        $(this).children('.tooltip').toggle();
    });

    $.receiveMessage(function(e) {
        var height = Number( e.data.replace( /.*if_height=(\d+)(?:&|$)/, '$1' ) );
        if ( !isNaN( height) && height > 0 ) {
            $('#iframeTopHotelsReviews').css('height', height);
        }
    }, 'http://partner.tophotels.ru');

    /**
     * Adblock для хрома блокирует postMessage, поэтому $.receiveMessage никогда не вызывается. В этом случае блок
     * отзывов не будет адаптироваться под размер страницы (что поделать) но по крайней мере на десктопе
     * высота не будет обрезаться
     */
    $('#iframeTopHotelsReviews').css('height', 1000);

    var allocId = window.hotelPageData && window.hotelPageData.allocationId;
    var check;

    $('#iframeTopHotelsReviews').on('load', function() {
        if (!allocId) {
            check = setInterval(checkDataAndSendMessageIfDataIsAvailable, 300);
        } else {
            injectCSSIntoTHIframe();
        }
    });

    function checkDataAndSendMessageIfDataIsAvailable() {
        allocId = window.hotelPageData && window.hotelPageData.allocationId;
        if (allocId) {
            clearInterval(check);
            injectCSSIntoTHIframe();
        }
    }

    function injectCSSIntoTHIframe() {
        var stylesString = '<style type="text/css">';
        stylesString += 'body { height: auto !important;  } .page-wrap-min { min-width: 260px !important; } ';
        stylesString += '.dynamics-pro { padding: 0 !important; } ';
        stylesString += '.reviews-title { padding: 0 0 16px 0 !important; } ';
        stylesString += '.reviews-row-head { padding: 8px 0 8px 0 !important; } ';
        stylesString += '.reviews-row-inn { padding: 0 !important; } ';
        stylesString += '.reviews { padding: 0 !important; } .reviews-row-more { margin: 0; } ';
        stylesString += '@media screen and (max-width: 560px) { ';
        stylesString += '.dynamics-td { box-sizing: border-box; width: 100% !important; display: block; padding: 0 0 5px !important; } ';
        stylesString += '.dynamics-l { width: 100% !important; box-sizing: border-box; padding: 0 8px !important; }';
        stylesString += '.dynamics-rating-yellow, .dynamics-rating-green, .dynamics-rating-red, .dynamics-rating-orange { position: absolute !important; } ';
        stylesString += '.dynamics-title { padding: 10px 0 6px !important; } ';
        stylesString += '.dynamics-title_short .dynamics-logo { right: 0 !important; top: 6px !important; } ';
        stylesString += '.dynamics-sub-r-rating { float: right; } ';
        stylesString += '.dynamics-sub-r { width: 100% !important; padding: 3px 0 0 60px !important; box-sizing: border-box; } ';
        stylesString += ".dynamics-clear-v_fix { height: auto !important;  } .dynamics-rating-brown { margin: 0 0 6px !important; }";
        stylesString += '.dynamics-rating-brown { width: 63px !important; position: absolute !important; top: 35px; left: 8px; } ';
        stylesString += '.dynamics-m { position: relative; } ';
        stylesString += '.dynamics-sub-mid-rv_short { width: 100% !important;  }';
        stylesString += '.dynamics-scale { padding: 3px 0 0 !important; } ';
        stylesString += '.dynamics-sub-mid-rv_short { width: 100% !important; padding-left: 70px !important; box-sizing: border-box; } ';
        stylesString += '.dynamics-sub-mid-rec { width: auto !important; padding: 0 !important; float: none !important; } ';
        stylesString += '.reviews-title { padding: 0 0 16px 0; } ';
        stylesString += '.reviews-row-head ul { padding: 5px 0 0; width: 100%; } ';
        stylesString += '.reviews-row + hr, .reviews + hr { display: none; } ';
        stylesString += '} ';
        stylesString += '</style>';
        $.postMessage(stylesString, 'http://partner.tophotels.ru/rates/ver2/'
        + allocId + '?uid=84b41a248f554c2d49cbd428642b0071', window.frames.thReviews);
    }

    $('.available-actions ul a').on('click', function() {
        $('#dropdown-actions-hotel-tours').dropdown('toggle');
    });
});

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

function IDGenerator(){
    this.prefix = String(new Date().getTime());
    this.num = getRandomInt(0, 10000);
    this.getID = function(){
        return this.prefix +this.num;
    }
}

function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

angular.module('app').directive('watchTour', function() {
    return {
    restrict: 'A',
        controller: function($scope) {
            $scope.watchTour.email = $scope.user.email;
            $scope.watchTour.phone = $scope.user.phone;
        }
    };
});