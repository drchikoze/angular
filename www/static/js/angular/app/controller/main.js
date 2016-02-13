const EGYPT = 12;
const TURKEY = 83;

angular.module('app').controller('main', ['$scope', '$http', '$rootScope', '$location', 'params', 'searchParamsDiff', 'roomSizeRequiredService', '$timeout',
    function($scope, $http, $rootScope, $location, searchParams, searchParamsDiff, roomSizeRequiredService, $timeout) {
    $rootScope.searchParams = new searchParams(window.searchParams);
    $rootScope.firstSearchParams = getFirstSearchStringParams();
    $scope.data = window.startParams;
    $scope.comparePrices = false;
    $scope.lastSearchStringParams = $rootScope.searchParams.getSearchQueryString();

    $scope.gaSent = false; // флаг, отправлено ли событие в гугл аналитику

    $rootScope.notShowSearchTooltip = true;

    $scope.sendHotelQuestion = function () {
        $http({
            method: 'POST',
            url: '/th_hotel/send_question',
            data: {
                'question': $scope.hotelQuestion,
                'faq': $scope.hotelFaq,
                'allocationId': $rootScope.searchParams.al[0]

            }
        }).success(function () {
            $scope.questionSended = true;
            $scope.hotelQuestion = ''
        });

    };

    $scope.thSubscriber = window.hotelPageData && window.hotelPageData.thSubscriber;
    $scope.hasThDiscount = window.hotelPageData && window.hotelPageData.hasThDiscount;

    $scope.$on('thSubscribeSuccess', function (event, user) {
        $scope.thSubscriber = user;
    });

    $scope.bodyClick = function() {
        $rootScope.$broadcast('$bodyClick');
    };

    $rootScope.$on('srLoadingComplete', function() {
        if (typeof $.block == 'function') {
            try {
                $.block('trigger', 'sr_loading', 'complete');
            } catch (err) {
                // тут может бросаться ошибка из-за того что событие не слушается
                // поэтому пропусаем
            }
        }
    });

    // Первый поиск выполняем одновременно с загрузкой фильтров
    $scope.$on('$filtersLoadStart', function() {
        $scope.lastSearchParams = $rootScope.searchParams;
        $rootScope.$broadcast('$srGetTitleString');
        $rootScope.$broadcast('$srNeedToUpdate');
    });

    $rootScope.$on('$filtersLoadComplete', function() {
        // Если после загрузки фильтров изменились параметры поиска, выполняем поиск заново
        if (searchParamsDiff.diff($scope.lastSearchParams, $rootScope.searchParams)) {
            $rootScope.$broadcast('$srGetTitleString');
            $rootScope.$broadcast('$srNeedToUpdate');
            $scope.lastSearchParams = $rootScope.searchParams;
        }
        window.searchParams = $rootScope.searchParams;
        $rootScope.$on('$filtersChangeComplete', function(event, diff) {
            var data = $location.search();
            var url = $location.absUrl();
            var type;

            if(isHotelPage()) {
                type = 'hotel';
            } else {
                type = 'search';
            }
            if ((isHotelPage()) || (url.indexOf('/search/') + 1) || (url.indexOf('/find/') + 1)) {
                $rootScope.setSearchTooltipPosition(diff, type);
            }

            if ($rootScope.notShowSearchTooltip ) {
                if ($rootScope.notShowSearchTooltipCount) {
                    $rootScope.notShowSearchTooltipCount--;
                } else {
                    $rootScope.notShowSearchTooltip = false;
                }
            } else {
                $rootScope.showSearchTooltip = true;
            }
            if (diff && diff !== 'page' && data['_p'] > 1) {
                data['_p'] = 1;
                $location.search(data);
            }
        });

    });


    $scope.subagentsFilter = function(tour) {
        if (!$rootScope.is_subagent) {
            return true;
        } else return !tour.operatorIsSubagent;
    };

    $rootScope.$on('$filtersLoadDataStart', function() {
        var url = $location.absUrl();
        if($rootScope.diffSearch == 'init' || $rootScope.diffSearch == 'country' || $rootScope.diffSearch == 'city' || $rootScope.diffSearch == 'resort' || $rootScope.diffSearch == false) {
            var serviceUrl = 'http://service.tourbook.ru/search/available-dates?departureCityId=' + $rootScope.searchParams.ct + '&countryId=' + $rootScope.searchParams.co + (($rootScope.searchParams.re instanceof Array) ? '&resortId=' + $rootScope.searchParams.re.join('&resortId=') : '&resortId=' + $rootScope.searchParams.re) + ($rootScope.searchParams.al[0] ? '&allocationId=' + $rootScope.searchParams.al[0] : '');
            console.log(serviceUrl);
            $.ajax({
                url: 'http://service.tourbook.ru/search/available-dates?departureCityId=' + $rootScope.searchParams.ct + '&countryId=' + $rootScope.searchParams.co + (($rootScope.searchParams.re instanceof Array) ? '&resortId=' + $rootScope.searchParams.re.join('&resortId=') : '&resortId=' + $rootScope.searchParams.re) + ($rootScope.searchParams.al[0] ? '&allocationId=' + $rootScope.searchParams.al[0] : ''),
                jsonp: "callback",
                dataType: "jsonp",
                success: function(data) {
                    $rootScope.availableDates = data;
                    console.log($rootScope.availableDates[3]);
                }
            });
        }

        if(isHotelPage()) {
            type = 'hotel';
        } else {
            type = 'search';
        }
        if ((isHotelPage()) || (url.indexOf('/search/') + 1) || (url.indexOf('/find/') + 1)) {
            $rootScope.setSearchTooltipPosition($rootScope.diffSearch, type);
        }

        if ($rootScope.notShowSearchTooltip) {
            if ($rootScope.notShowSearchTooltipCount) {
                $rootScope.notShowSearchTooltipCount--;
            } else {
                $rootScope.notShowSearchTooltip = false;
            }
        } else {
            $rootScope.showSearchTooltip = true;
        }


    });

    jQuery(window).scroll(function() {

        const PLACEHOLDER_HEIGHT = 78;
        var elem = jQuery('#apply-filters-change-button');
        if (jQuery(".tb-filters-hotel").hasClass("fixed-search-filters")) {
            elem.css('left', '-215px');
            if (window.diffToMinus != 'undefined' && window.diffToMinus) {
                elem.css('top',  elem.data("filters_index") - PLACEHOLDER_HEIGHT + 'px');
            } else {
                elem.css('top',  elem.data("filters_index") + 'px');
            }
        } else {
            var chooser = $('.right-chooser');
            var left = chooser.length > 0 ? chooser.position().left - 215 : 817;
            elem.css('left', left + 'px');
            if (window.diffToMinus != 'undefined' && window.diffToMinus) {
                elem.css('top',  elem.data("filters_index") + 'px');
            } else {
                elem.css('top',  elem.data("filters_index") + PLACEHOLDER_HEIGHT + 'px');
            }
        }

        if (!isHotelPage() && isSearchPage()) {
            if (($('.search-res-filt').offset().top - 10) > elem.offset().top) {
                elem.css('opacity', 0);
            } else {
                elem.css('opacity', 100);
            }
        }
    });
    $rootScope.setSearchTooltipPosition = function(diff, type) {
        const PLACEHOLDER_HEIGHT = 78;
        var topOffset = Math.round(jQuery('.right-chooser.tb-filters-hotel').position().top);
        var filtersOrder;
        var filterIndex;
        var filtersIds;
        if (type == 'hotel') {
            jQuery('#apply-filters-change-button').css('left', ($('.right-chooser').position().left - 215) + 'px');
            filtersOrder = ['city', 'datef', 'nightf', 'meal', 'room_size', 'operator'];
            filterIndex = filtersOrder.indexOf(diff);
            if (filterIndex < 0) {
                filterIndex = 1;
            }
            if (diff == 'price') {
                filterIndex = 5;
            }
            if (diff == 'is_subagent') {
                filterIndex = 6;
            }
            topOffset = topOffset + filterIndex * 40 - 4;


        } else {
            if (jQuery(".tb-filters-hotel").hasClass("fixed-search-filters")) {
                jQuery('#apply-filters-change-button').css('left', '-215px');
                topOffset = 0;
            } else {
                jQuery('#apply-filters-change-button').css('left', '817px');
            }

            filtersOrder = ['city', 'country', 'resort', 'allocation', 'alloccat', 'allocat_rate', 'alloc_place_value', 'datef', 'nightf', 'meal', 'room_size', 'child_age1'];
            filterIndex = filtersOrder.indexOf(diff);


            if (filterIndex < 0) {
                filterIndex = 11;
            }
            if('alloc_place_type' == diff) {
                filterIndex = 6;
            }

            if('init' == diff) {
                filterIndex = 1;
            }

            if (diff == 'price') {
                filterIndex = 12;
            } else if (diff == 'is_subagent') {
                filterIndex = 13;
            }

            filtersIds = ['city_id', 'country_id', 'resort_id', 'allocation_id', 'alloccat_id', 'allocat_rate_id', 'alloc_place_value_id',
                'dates_id', 'nightf_id', 'meal_id', 'room_size_id', 'operator_id', 'price_id', 'subagents_id'];

            $rootScope.offsetFilterElement = $('#' + filtersIds[filterIndex]).offset().top;
            var positionTopFilterElement = $('#' + filtersIds[filterIndex]).position().top;

            //Если изменения происходили в мультичекбоксах (курорт, отель, оператор)
            if (filterIndex == 2 || filterIndex == 3 || filterIndex == 11) {
                var offsetDiff = $rootScope.changedItemOffsetTop - $rootScope.offsetFilterElement;
                topOffset = topOffset + positionTopFilterElement + offsetDiff - 24;
            } else {
                topOffset = topOffset + positionTopFilterElement - 24;
            }

            if ($('.right-chooser').css('position') == 'inherit' || $('.right-chooser').css('position') == 'static') {
                window.diffToMinus = true;
                topOffset = topOffset - PLACEHOLDER_HEIGHT;
            } else {
                window.diffToMinus = false;
            }

            jQuery('#apply-filters-change-button').data("filters_index", topOffset);


        }
        jQuery('#apply-filters-change-button').css('top',  topOffset + 'px');

    };

    $rootScope.closeSearchTooltip = function() {
        $rootScope.showSearchTooltip = false;
    };

    $scope.$on('$srNeedToUpdate', function() {
        $rootScope.$broadcast('$srGetTitleString');
        $rootScope.closeSearchTooltip();
    });

    $scope.tooltipSearch = function() {
        if (!roomSizeRequiredService.check()) {
            $rootScope.closeSearchTooltip();
            return;
        }

        NProgress.start();
        NProgress.set(0);
        NProgress.inc();
        $rootScope.$broadcast('$srGetTitleString');
        $rootScope.$broadcast('$srNeedToUpdate');
        $rootScope.$broadcast('$hideOpenVariants');
    };

    $scope.alternativeLinksSearch = function (url) {
        var baseSearchParams = $rootScope.searchParams.initFromUrl(url);
        $location.url(url);
        $rootScope.closeSearchTooltip();
        $rootScope.searchParams = baseSearchParams;
        $rootScope.notShowSearchTooltip = true;
        $rootScope.$broadcast('$srGetTitleString');
        $rootScope.$broadcast('$srNeedToUpdate');
        $rootScope.$broadcast('$locationChangeSuccess');
        $scope.arrayParams = baseSearchParams;
        $scope.links = makeAlternativeSearchLinks(baseSearchParams);
        $scope.result = $scope.getPriceFromService(baseSearchParams);
    };

    $scope.buildQs = function(replaceParams) {
        var query_data = $location.search();
        var query_arr = [], idx;

        for (idx in query_data) {
            // замещаем параметры в запросе на пришедшие от пользователя
            if (replaceParams !== null && typeof replaceParams == 'object' && replaceParams[idx] != undefined) {
                query_arr.push(idx + '=' + replaceParams[idx]);
                delete replaceParams[idx];
                continue;
            }
            query_arr.push(idx + '=' + query_data[idx])
        }

        // добавляем пришедшие параметры в строку запроса
        if (replaceParams !== null && typeof replaceParams == 'object') {
            for (idx in replaceParams) {
                query_arr.push(idx + '=' + replaceParams[idx]);
            }
        }

        return '?' + query_arr.join('&')
    };

    $scope.goToSearch = function() {
        var searchParams = $rootScope.searchParams;

        if (!roomSizeRequiredService.check()) {
            return;
        }

        top.location.href = '/find/' + searchParams.getCurrentLink();
    };

    $scope.hidePreloadSearchInfo = function() {
        $('#overlay').remove();
        $scope.showPreloadByUser = false;
    };

    $scope.showPreloadSearchInfo = function() {
        $scope.showPreloadByUser = true;
        var container = $('.refresh-content-container');

        container.addClass('in-overlay');
        container.overlay();

        $('#overlay').css('z-index', 999).unbind('click').click(function() {
            $('#overlay').remove();
            container.hide();
            return false;
        });

    };

    $scope.watchTour = {
        email: '',
        phone: '',
        similar: true,
        desiredPrice: '',
        desiredPriceDefault: '',
        formType: 0
    };

    $scope.changeDesiredPrice = function() {
        var tmpString = $scope.watchTour.desiredPrice.replace(/[^\d]/gi, '');
        var count = 0;
        $scope.watchTour.desiredPrice = '';
        for (var i = tmpString.length - 1; i>=0; i--) {
            count++;
            $scope.watchTour.desiredPrice = tmpString[i] + $scope.watchTour.desiredPrice;
            if (count == 3) {
                $scope.watchTour.desiredPrice = ' ' + $scope.watchTour.desiredPrice;
                count =0;
            }
        }
    };

    $scope.favoritesData = null;

    $scope.loadFavoritesList = function() {
        $http({
            method: 'get',
            url: '/favorites/tours_data?limit_tours=3&only_actual=true'
        }).success(function(data) {
            if (typeof data == 'string') {
                var dataArrayString = data.split('<');
                data = JSON.parse(dataArrayString[0]);
            }
            if (data.status == 'ok') {
                $scope.favoritesData = data;
            }
        });
    };

    $scope.checkRoomSizeRequired = function() {
        var roomSizes = {
            15: {children: 0, adults: 1},
            14: {children: 0, adults: 2},
            23: {children: 0, adults: 3},
            26: {children: 0, adults: 4},
            29: {children: 0, adults: 5},
            24: {children: 0, adults: 6},
            30: {children: 0, adults: 7},
            3: {children: 0, adults: 8},
            4: {children: 0, adults: 9},
            18: {children: 1, adults: 1},
            20: {children: 1, adults: 2},
            27: {children: 1, adults: 3},
            32: {children: 1, adults: 4},
            53: {children: 1, adults: 5},
            55: {children: 1, adults: 6},
            19: {children: 2, adults: 1},
            21: {children: 2, adults: 2},
            31: {children: 2, adults: 3},
            33: {children: 2, adults: 4},
            54: {children: 2, adults: 5},
            56: {children: 2, adults: 6}
        };

        var $messageLabel = $('.js-roomsize-required');

        if (data['rs'] != undefined && roomSizes[parseInt(data['rs'])] != undefined) {
            var childs = roomSizes[parseInt(data['rs'])].children;
            if (!childs) {
                $messageLabel.hide();
                return true;
            }
            $messageLabel.text(childs > 1 ? 'Укажите возраста детей' : 'Укажите возраст ребенка');
            if ((!data['ch1'] && data['ch1'] !== 0) || data['ch1'] == -1) {
                $messageLabel.show();
                return false;
            }
            if (childs > 1 && ((!data['ch2'] && data['ch2'] !== 0) || data['ch2'] == -1)) {
                return false;
            }
        }

        $messageLabel.hide();

    };

    $scope.watchTourSubmit = function(customFormType) {
        var watchTourEmail = $scope.watchTour.email;
        var watchTourPhone = $scope.watchTour.phone;
        var items = angular.element('.hp-price').scope().items;
        var tourId = $scope.watchTour.id || (items && items.length > 0 && items[0].tourId);
        var formType = typeof customFormType == 'undefined' ? $scope.formType : customFormType;
        console.log(tourId);
        var similar = true === $scope.watchTour.similar ? true : '';
        var desiredPrice =  $scope.watchTour.desiredPrice.replace(/[^\d]/gi, '');

        var $_GET = {};
        var __GET = window.location.search.substring(1).split("&");
        for(var i=0; i<__GET.length; i++) {
            var getVar = __GET[i].split("=");
            $_GET[getVar[0]] = getVar[1] == undefined ? "" : getVar[1];
        }
        var child1Age = $_GET['ch1'] == undefined ? "" : $_GET['ch1'];
        var child2Age = $_GET['ch2'] == undefined ? "" : $_GET['ch2'];

        if('' == watchTourEmail) {
            sweetAlert('Не введен e-mail', '', "error");
            return;
        }
        /*
        // Не обязательно http://auto.ls1.ru/development/mini/detail?id=84763
        if (!watchTourPhone) {
            sweetAlert('Не указан телефон', '', "error");
            return;
        }
        */

        if (tourId) {
            // С существующим туром
            var submitUrl = '/reservation_tour/watch_tour_apply';
            var submitParams = {
                'id': tourId,
                'email': watchTourEmail,
                'phone': watchTourPhone,
                'notify': 1,
                'similar': similar,
                'desiredPrice': desiredPrice,
                'formType': formType,
                'ch1': child1Age,
                'ch2': child2Age
            }
        } else {
            
            /*
            departureCityId=' + $rootScope.searchParams.ct + '&
            countryId=' + $rootScope.searchParams.co + (($rootScope.searchParams.re instanceof Array) ? '&
            resortId=' + $rootScope.searchParams.re.join('&resortId=') : '&resortId=' + $rootScope.searchParams.re) + ($rootScope.searchParams.al[0] ? '&
            allocationId=' + $rootScope.searchParams.al[0] : '');
            */
            
            // Без ID тура
            var submitUrl = '/reservation_tour/watch_tour_apply_no_tour';
            var submitParams = {
                // Параметры поиска
                'departureCityId': $rootScope.searchParams.ct,
                'allocationId': $rootScope.searchParams.al[0],
                'nights': $rootScope.searchParams.nf,
                'date_from': $rootScope.searchParams.df,
                'room_size': $rootScope.searchParams.rs,
                'ch1': child1Age,
                'ch2': child2Age,
                
                //
                'email': watchTourEmail,
                'phone': watchTourPhone,
                'notify': 1,
                'similar': similar,
                'desiredPrice': desiredPrice,
                'formType': formType
            }
        }
        $http({
            method: 'POST',
            url: submitUrl,
            params: submitParams
        }).success(function (data) {
            if (undefined == data.message) {
                swal('При подписке на обновления тура произошла ошибка', '',"error");
                return;
            }
            if('ok' == data.status) {
                if (isHotelPage()) {
                    if (formType == 7) {
                        $('.follow-pp-watch-one-step').hide();
                        $('.follow-pp-watch-two-step').fadeIn('fast');
                    } else {
                        $('.follow-pp-buy-one-step').hide();
                        $('.follow-pp-buy-two-step').fadeIn('fast');
                    }
                    $('.hp-ttl-fav').addClass('active');
                    return;
                }

                $('#overlay_white').click();
                $rootScope.favorites += 1;
                swal(data.message, '', "success");
                $('.hp-ttl-fav').addClass('active');
            }
            if('error' == data.status) {
                swal(data.message, '', "error");
            }
        });
    };

    //$scope.showPreloadHotelInfo = function() {
    //    $scope.showPreloadByUser = true;
    //
    //    var container = $('.hotels-preload-container');
    //    container.addClass('in-overlay');
    //    container.overlay();
    //
    //    $('#overlay').css('z-index', 999).unbind('click').click(function() {
    //        angular.element('.content').scope().showPreloadByUser = false;
    //        angular.element('.content').scope().$apply();
    //
    //        $('#overlay').remove();
    //        return false;
    //    });
    //};

    $scope.yandexMetrika = function(data) {
        if (!window.yaCounter27158126) {
            return;
        }
        var yaCounter = window.yaCounter27158126;

        if (!window.counterOptions || !data) {
            return;
        }

        var options = window.counterOptions;
        var params = {};

        if (options.price && options.price > 0) {
            params['Цена отличается'] = options.price != data.min_price;
            if (options.price != data.min_price) {
                params['Отличие цены'] = data.min_price - options.price;
            }
        }
        if (options.empty_result) {
            params['Пустые результаты с баннера'] = data.empty_result;
        }

        if (options.price || options.empty_result) {
            yaCounter.reachGoal('search', params);
        }
        
    };

    $scope.yandexMetrikaHotel = function() {
        if (!window.yaCounter27158126) {
            return;
        }
        var yaCounter = window.yaCounter27158126;

        if ( isHotelPage() ) {
            var countryParams = {'country_id': window.countryId };
            yaCounter.params('country', countryParams);
        }
    };

    $scope.openFollowHotel = function(source) {
        if (source == 7) {
            reachCounterGoal('FOLLOW_OPEN_HOTEL');
        } else {
            reachCounterGoal('FOLLOW_OPEN_BUY_HOTEL');
        }
        var formToShow = $('.modal-follow');

        $timeout(function(){
            formToShow.fadeIn('fast');
            $('.overlay').show();
            if (source == 7) {
                $('.follow-pp-tab.follow-pp-tab-watch').trigger('click');
            } else {
                $('.follow-pp-tab.follow-pp-tab-buy').trigger('click');
            }

            $scope.formType = parseInt(source);
        });
    }

}]);

angular.module('search').directive('override', ['$rootScope', '$timeout', '$log', '$http', '$location', '$q', function($rootScope, $timeout, $log, $http, $location, $q) {
    return {
        restrict: 'A',
        controller: function($scope) {
            $scope.searchResultList = window.searchRequestsList;
            $scope.needShowLoadedMessage = false;
            $scope.scrollItemsOnPage = 3;

            $scope.priceBubbleShow = false;
            $scope.bubbleDuration = false;
            $scope.bubbleDeparture = false;
            $scope.bubblePositionTop = 0;
            $scope.bubblePositionLeft = 0;
            $scope.timersSearchStatus = [];
            $scope.completeSearch = [];
            $scope.countToursOnHotelPage = 10;

            //уходы в процессе поиска, когда поиск в процессе и показано менее 10 отелей
            const SEARCH_LESS_TEN_RESULTS_LEAVE = 5;

            var cancelerFull = $q.defer();

            $scope.isCountryEmpty = function() {
                if (!$scope.currentSearchParams.co || $scope.currentSearchParams.co == EGYPT || $scope.currentSearchParams.co == TURKEY) {
                    return true;
                }
                return false;
            };

            $scope.boRefresh = function () {
                $scope.$broadcast('refreshInfo');
            };

            $scope.chooseHotelLink = function(hotelItem, duration) {
                return hotelItem.hotelLinksByDuration[duration];
            };

            $scope.testLog = function(item) {
                console.log(item);
            };

            $scope.changeDurationAll = function(duration) {
                if ($scope.selectedDuration == duration) {
                    return;
                }
                $scope.selectedDuration = duration;
                angular.element('#overlay-loader').css('display', 'block');
                $timeout(
                    function() {
                        $scope.items = $scope.sortAllocationList($scope.items, duration);
                    }, 0);

                $timeout(function() {
                    angular.element('#overlay-loader').css('display', 'none');
                }, 0);
                $scope.boRefresh();
            };

            $scope.setSortType = function(type) {
                $scope.sortType = type;
            };

            $scope.sortAllocationList = function(items, duration) {
                return items.sort(function(allocation1, allocation2) {
                    if ((typeof allocation1.tourDateList[duration] == "undefined") ||
                        (typeof allocation2.tourDateList[duration] == "undefined")) {
                        return 0;
                    }
                    var tour1 = allocation1.tourDateList[duration][0];
                    var tour2 = allocation2.tourDateList[duration][0];
                    return tour1.priceRu > tour2.priceRu ? 1 : -1;
                });
            };

            $scope.displayPricesPopUp = function(departure, duration, allocation) {

                var elem = document.getElementById(allocation.allocation_id + '_' + duration);

                var leftOffset = elem.offsetLeft;
                var topOffset = elem.offsetTop;

                $scope.bubblePositionTop = topOffset + 30;
                $scope.bubblePositionLeft = leftOffset - 20;

                $scope.bubbleDuration = duration;
                $scope.bubbleDeparture = departure;
                $scope.selectedAllocation = angular.copy(allocation);
                $scope.bubbleItems = $scope.getPriceDifference(allocation, duration , departure);
                $scope.priceBubbleShow = true;
            };

            $scope.hidePricesPopUp = function() {
                $scope.priceBubbleShow = false;
            };

            $(document).mouseup(function (e) {
                var container = $(".bubble");
                if (container.has(e.target).length === 0){
                    $scope.priceBubbleShow = false;
                }
            });


            // Функция для добавления обработчика событий
            function addHandler(object, event, handler) {
                if (object.addEventListener) {
                    object.addEventListener(event, handler, false);
                }
                else if (object.attachEvent) {
                    object.attachEvent('on' + event, handler);
                }
                else $log.info("Обработчик не поддерживается");
            }
            // Добавляем обработчики для разных браузеров
            addHandler(window, 'DOMMouseScroll', wheel);
            addHandler(window, 'mousewheel', wheel);
            addHandler(document, 'mousewheel', wheel);
            // Функция, обрабатывающая событие
            function wheel() {
                $rootScope.$broadcast('scrollPage');
            }
            $rootScope.$on('scrollPage', function() {
                $timeout(function(){
                    isRequiredShowLoadedMessage();
                });

            });

            $scope.getNumber = function(num) {
                var re = /[0-9]+/;
                if (!re.test(num)) {
                    return 0;
                }

                return new Array(parseInt(num));
            };


            $scope.$on('resultRenderDone', function() {
                $timeout(function () {
                    $scope.scrollItemsOnPage += 10;
                    if ($scope.isSearchComplete() && $scope.scrollItemsOnPage >= $scope.resultCount) {
                        NProgress.set(0.95);
                        NProgress.done();
                        //При окончании поиска удаляем инфу о ливере
                        $scope.deleteLeaver();
                    }
                }, 400);
            });

            $scope.writeLeaver = function(source) {
                $http({
                    method: 'POST',
                    url: '/search/write_leaver',
                    data: {
                        'source': source
                    }
                }).success(function () {
                    console.log('search_start_leaver_logged');
                });
            };

            $scope.deleteLeaver = function() {
                $http({
                    method: 'POST',
                    url: '/search/delete_from_leavers',
                    data: {
                    }
                }).success(function () {
                    console.log('delete_from_leavers');
                });
            };

            $rootScope.$on('srLoadingComplete', function($event, searchParams, resultCount) {
                //Показываем результаты только тогда, когда завершился 1й поиск для 1й запрашиваемой длительности
                if ($scope.isSearchComplete() && resultCount == 0) {
                    $scope.data.items = [];
                }

                if(!isHotelPage()) {
                    var allHotelsNumber = $scope.getAllocationCountByDuration();
                    if ((allHotelsNumber < 10) && !isHotelPage()) {
                        var source = SEARCH_LESS_TEN_RESULTS_LEAVE;
                        $scope.writeLeaver(source);
                    }
                }

                $scope.scrollItemsOnPage = 10;
                $scope.resultCount = resultCount;

                NProgress.inc();

            });
            $rootScope.$on('$srGetTitleString', function() {
                if (typeof $scope.promiseSearchQueryString != 'undefined') {
                    $scope.promiseSearchQueryString.resolve();
                }
                $scope.promiseSearchQueryString = $q.defer();
                var searchParams = $rootScope.searchParams.getSearchQueryString();
                if ($scope.lastSearchStringParams == searchParams) {
                    return;
                } else {
                    $scope.lastSearchStringParams = searchParams;
                }
                $http({
                    method: 'GET',
                    url: '/search/get_search_string?' + searchParams,
                    params: {},
                    timeout: $scope.promiseSearchQueryString
                }).success(function (data) {
                    if(undefined != data.city_name) {
                        $scope.title_string = data;
                        $scope.data.city_name = data.city_name;
                        $scope.data.country_name = data.country_name;
                        $scope.data.adults_string = data.adults_string;
                        $scope.data.children_string = data.children_string;
                        $scope.data.meal = data.meal;
                        $scope.data.operators = data.operators;
                        if (!isHotelPage()) {
                            document.title = "Туры в " + data.destination_name + " из " + data.city_name + " - лучшие предложения";
                        }
                    }
                });
            });

            $scope.checkSearchStatus = function(durationId) {
                if ($scope.searchKeyByDurations[durationId] && !$scope.completeSearch[durationId]) {
                    var requestParams = {
                        searchKey: $scope.searchKeyByDurations[durationId],
                        script: 'main'
                    };
                    if ($scope.countCheckStatusStageForFullLoad[durationId] == undefined) {
                        $scope.countCheckStatusStageForFullLoad[durationId] = 1;
                    } else {
                        $scope.countCheckStatusStageForFullLoad[durationId]++;
                    }
                    (function() {
                        $http({
                            method: 'GET',
                            url: '/search/search_status',
                            params: requestParams,
                           timeout: $scope.promiseListByDuration[durationId].promise
                        }).success(function (data) {
                            //$log.info('search_status_data=');
                            //$log.info(data);
                            setOperatorsCount(data);
                            var countLoadedTourByDuration = $scope.toursFullCountByDuration[durationId];
                            if(isHotelPage() && !$scope.gaSent && data.count > 0 && typeof ga !== 'undefined') {
                                $log.info('not empty search!');
                                ga('send', 'event', 'Search results', 'Search results: not empty', 'Search results: not empty');
                                //ga('send', 'event', 'Search results', 'Tours were found');
                                $scope.gaSent = true;
                            }
                            if (data.count > countLoadedTourByDuration) {
                                $scope.needShowLoadedMessage = true;
                                $scope.getAllTourList(data.count, durationId, data.complete);
                            } else if (!data.complete) {
                                $scope.needShowLoadedMessage = false;
                                $scope.timersSearchStatus[durationId] = $timeout(function () {
                                    $scope.checkSearchStatus(durationId)
                                }, 5000, true);
                            } else {
                                $scope.completeSearch[durationId] = true;
                                sendCountLoadToursStageForFullLoad(durationId);
                                $scope.deleteLeaver();
                                if(isHotelPage() && $scope.items.length<1 && !$scope.gaSent && typeof ga !== 'undefined') {
                                    $log.info('empty search!');
                                    ga('send', 'event', 'Search results', 'Search results: empty', 'Search results: empty');
                                    //ga('send', 'event', 'Search results', 'Empty search results');
                                    $scope.gaSent = true;
                                }
                            }
                        })
                    })();
                }
            };

            $scope.operatorsIds = [];
            $scope.operatorsReadyIds = [];
            function setOperatorsCount(data) {
                if(data.operatorsIds !== 'undefined') {
                    //console.info('operatorsIds=');
                    //console.info(data.operatorsIds.length);
                    //console.info('operatorsReadyIds=');
                    //console.info(data.operatorsReadyIds.length);
                    for(var key in data.operatorsIds) {
                        if($scope.operatorsIds.indexOf(data.operatorsIds[key]) == -1) {
                            $scope.operatorsIds.push(data.operatorsIds[key]);
                        }
                    }
                    $scope.operatorsCount = $scope.operatorsIds.length;
                    for(var key in data.operatorsReadyIds) {
                        if($scope.operatorsReadyIds.indexOf(data.operatorsReadyIds[key]) == -1) {
                            $scope.operatorsReadyIds.push(data.operatorsReadyIds[key]);
                        }
                    }
                    $scope.operatorsReadyCount = $scope.operatorsReadyIds.length;
                } else {
                    if($scope.operatorsCount < data.operatorsCount) {
                        $scope.operatorsCount = data.operatorsCount;
                    }
                    if($scope.operatorsReadyCount < data.operatorsReadyCount) {
                        $scope.operatorsReadyCount = data.operatorsReadyCount;
                    }
                }
            }

            function sendCountLoadToursStageForFullLoad(durationId) {
                var searchParams = $rootScope.searchParams.getSearchQueryArray();
                searchParams.count = $scope.secondResultReceivedByDurations[durationId];
                searchParams.duration = durationId;
                $http({
                    method: 'GET',
                    url: '/search/set_count_load_tours',
                    params: searchParams
                }).success(function (data) {});
            }

            var isRequiredShowLoadedMessage = function() {
                var headerHeight = $('.header').eq(0).height();
                var currentPagePosition = window.pageYOffset || document.documentElement.scrollTop;
                if (currentPagePosition > headerHeight) {
                    $('.load-additional-tour-info').addClass('stick');
                } else {
                    $('.load-additional-tour-info').removeClass('stick');
                }
            };

            $rootScope.$on('$srNeedToUpdate', function() {
                if (isHotelPage()) {
                    $scope.updateGraphsData();
                }
                $scope.advBrockerSendInterval = setInterval(function(){ $scope.sendSearchInfoToAdvBroker(); }, 1000);
            });

            $scope.updateGraphsData = function () {
                $http({
                    method: 'POST',
                    url: '/hiddenhotel/get_min_price_url'
                }).success(function (data) {
                    if (data.status == 'ok') {
                        window.hotelPageData.allMinPriceUrlsAndMonth = data.allMinPriceUrlsAndMonth;
                        window.hotelPageData.minPriceUrl = data.minPriceUrl;
                        jQuery('.full-graph-title').text('Минимальные цены на ' + data.duration + ' ' + data.duration_string);
                        jQuery('.first-month').text(data.allMinPriceUrlsAndMonth[0]['month']);
                        jQuery('.second-month').text(data.allMinPriceUrlsAndMonth[1]['month']);
                        jQuery('.third-month').text(data.allMinPriceUrlsAndMonth[2]['month']);
                        TourBook.hotelPage.hotelPageObj.init();
                    }
                });

            };


            $scope.sendSearchInfoToAdvBroker = function() {
                clearInterval($scope.advBrockerSendInterval);

                var dateToSend = $rootScope.searchParams.df.split("-");
                dateToSend = (dateToSend[0] + '.' + dateToSend[1] + '.' + dateToSend[2]);
                if (window.needToSendDatatoBrocker) {
                    $.ajax({
                        url: '/search/get_city_id_by_resort_id',
                        type: 'GET',
                        data: {re: $rootScope.searchParams.ct},
                        success: function(data){
                            if (typeof data === 'string') {
                                data = jQuery.parseJSON(data);
                            }
                            console.log(data);
                            var dataToSend = {
                                whoami: 1,
                                city_id: data.city_id,
                                date: dateToSend,
                                night: $rootScope.searchParams.nf,
                                adult_num: $scope.adult,
                                child_num: $scope.children,
                                worker: 'Banner_ThUserType_DataSaver',
                                format: 'jsonp'
                            };
                            $.ajax({
                                url: 'http://advbroker.ru/data/gate.php',
                                type: 'GET',
                                jsonp: "callback",
                                dataType: 'jsonp',
                                data: dataToSend,
                                crossDomain: true,
                                success: function(data){
                                    console.log(data);
                                },
                                error: function (xhr, status) {
                                }
                            });
                        },
                        error: function (xhr, status) {
                        }
                    });
                }

            };

            //$scope.sendSearchInfoToAdvBroker();

            $scope.getAllTourList = function(countFoundedTour, durationId, lastSearchByDuration) {

                $rootScope.$broadcast('$fullSearchStarted');
                if (!$scope.countLoadToursStageForFullLoad[durationId]) {
                    $scope.countLoadToursStageForFullLoad[durationId] = 1;
                } else {
                    $scope.countLoadToursStageForFullLoad[durationId]++;
                }

                var searchParams = $rootScope.searchParams.getSearchQueryArray();

                if('undefined' !== $rootScope.firstSearchParams.bp_r_op && 'undefined' !== $rootScope.firstSearchParams.bp_r_id) {
                    searchParams.bp_r_op = $rootScope.firstSearchParams.bp_r_op;
                    searchParams.bp_r_id = $rootScope.firstSearchParams.bp_r_id;
                }
                searchParams.tc = countFoundedTour;
                searchParams.add_dur = durationId;
                searchParams.sk = $scope.searchKeyByDurations[durationId];
                //  отправляем число шагов необходимых для загрузки вторых результатов
                if (!$scope.secondResultReceivedByDurations[durationId]) {
                    searchParams.ssr = $scope.countCheckStatusStageForFullLoad[durationId];
                    $scope.secondResultReceivedByDurations[durationId] = true;
                }
                // отправляем сколько раз мы загружали туры по этим параметрам в текущем поиске
                if (lastSearchByDuration) {
                    searchParams.completeSearch = 1;
                    searchParams.sfl = $scope.countLoadToursStageForFullLoad[durationId];
                    $scope.secondResultReceivedByDurations[durationId] = true;
                }

                console.log('full search started duration: ' + durationId);

                (function() { $http({
                    method: 'GET',
                    url: isHotelPage() ? '/hiddenhotel/tours_data' : '/search/tours_data',
                    params: searchParams,
                    timeout: cancelerFull.promise
                }).success(function (data) {
                    console.log('full search data received duration: ' + durationId);

                    data = $scope.decodeParams(data, $scope.classMap);
                    $scope.toursCountByDuration[durationId] = data.count;
                    $scope.toursFullCountByDuration[durationId] = data.fullCount;
                    if (data.duration) {
                        $scope.convertReceivedTourList($scope.items, data.items, data.duration);
                        $scope.boRefresh();
                    }
                    var validTours = $scope.items.filter($scope.subagentsFilter);
                    $scope.toursCountByDuration[0] = validTours.length;

                    if (!isHotelPage()) {
                        var allHotelsNumber = $scope.getAllocationCountByDuration();
                        if ((allHotelsNumber < 10) && !isHotelPage()) {
                            var source = SEARCH_LESS_TEN_RESULTS_LEAVE;
                            $scope.writeLeaver(source);
                        } else {
                            $scope.deleteLeaver();
                        }
                    } else {
                        $scope.deleteLeaver();
                        if ($scope.items.length > 0) {
                            $rootScope.$broadcast('$CheapestTourLoaded', $scope.items[0], searchParams.nf);
                        }
                    }

                    if (lastSearchByDuration) {
                        $scope.completeSearch[durationId] = true;
                    } else {
                        $scope.timersSearchStatus[durationId] = $timeout(function () {
                            $scope.checkSearchStatus(durationId)
                        }, 5000, true);

                    }
                }).error(function() {
                    $scope.checkSearchStatus(durationId);
                }) })();
            };

        }
    }
}]).directive('onRenderDone', ['$rootScope', '$timeout', function($rootScope, $timeout) {
    return {
        restrict: 'A',
        link : function(scope) {
            if (scope.$last){
                $timeout(function(){
                    $rootScope.$broadcast('resultRenderDone');
                });
            }

        }};
}]);

$(window).load(function() {
    if (isHotelPage()) {
        reachCounterGoal('HOTEL_PAGE_ENTERING');
    }
});

function isCounterAvailable() {
    return ('undefined' != typeof window.yaCounter27158126);
}

function reachCounterGoal(goal) {
    if (isCounterAvailable()) {
        window.yaCounter27158126.reachGoal(goal);
    }
}

function isHotelPage() {
    return (window.location.href.indexOf('/hotel/') + 1);
}

function isSearchPage() {
    return window.location.href.indexOf('/search/tours/') + 1;
}

var similarToursClicked = false;

function similarToursClick() {
    if (!similarToursClicked) {
        reachCounterGoal('SIMILAR_TOURS_CLICK');
        similarToursClicked = true;
    }
}


//0 - если не страница отеля, объект GET параметров, если страница отеля
function getFirstSearchStringParams() {
    if(!isHotelPage()) {
        return 0;
    }
    var $_GET = {};
    var __GET = window.location.search.substring(1).split("&");
    for(var i=0; i<__GET.length; i++) {
        var getVar = __GET[i].split("=");
        $_GET[getVar[0]] = typeof(getVar[1])=="undefined" ? "" : getVar[1];
    }
    return $_GET;
}

