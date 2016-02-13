angular.module('search').filter('plural', function () {
    return function (input, rules) {
        if (parseInt(input) != input) {
            return input;
        }

        var num = parseInt(input) % 100;
        var digit = num % 10;

        if (num == 1 || (num > 20 && digit == 1)) {
            ending = 0;
        } else if (num > 1 && num < 5 || (num > 20 && digit > 1 && digit < 5)) {
            ending = 1;
        } else {
            ending = 2;
        }

        rules = rules.split('|');
        return input + ' ' + rules[ending];
    };
}).filter('date', function () {
    return function (input, format) {
        var date = new Date(input);

        if (!date) {
            return input;
        }

        return moment(date).format(format ? format : 'DD.MM.YYYY', date);
    };
}).filter('price', function () {
    return function (input, format) {
        return numberFormat(input);
    };
}).filter('compareClass', function () {
    return function (input, hover_price, min, min_2, more_min, more_min_2) {
        if (!input || !input.price) {
            return 'hp-price-compare-no-price';
        }
        if (input.price == hover_price) {
            return 'hp-price-compare-lvl-current';
        } else if (input.price == more_min) {
            return 'hp-price-compare-lvl-more-min';
        } else if (input.price == more_min_2) {
            return 'hp-price-compare-lvl-more-min-2';
        } else if (input.price == min) {
            return 'hp-price-compare-lvl-min';
        } else if (input.price == min_2) {
            return 'hp-price-compare-lvl-min-2';
        } else if (input.price < hover_price) {
            return 'hp-price-compare-lvl-other-less';
        } else if (input.price > hover_price) {
            return 'hp-price-compare-lvl-other-more';
        } else {
            return 'hp-price-compare-lvl-current';
        }
    };
}).controller('comparePricesCtrl', ['$scope', '$rootScope', '$http', '$q', '$timeout', 'searchParamsDiff', function ($scope, $rootScope, $http, $q, $timeout, searchParamsDiff) {
    $scope.url = '';
    $scope.statusTimer = null;
    $scope.statusRequest = null;
    $scope.selected = null;

    initParams();

    function initParams() {
        var needFullSearch = !$scope.fullyLoaded;
        var needPartialSearch = false;
        var filterMeal = null;
        var filterOperator = null;
        var changeFullPrice = null;
        var oldPrices = $scope.prices;
        if ($scope.searchParams) {
            var diffSearch = searchParamsDiff.diff($scope.searchParams, $rootScope.searchParams, true);
            if (diffSearch.hasOwnProperty('datef') || diffSearch.hasOwnProperty('datet')) {
                needPartialSearch = true;
                if (diffSearch.hasOwnProperty('datef')) {
                    delete diffSearch.datef;
                }
                if (diffSearch.hasOwnProperty('datet')) {
                    delete diffSearch.datet;
                }
            }
            if (diffSearch.hasOwnProperty('nightf') || diffSearch.hasOwnProperty('nightt')) {
                needPartialSearch = true;
                if (diffSearch.hasOwnProperty('nightf')) {
                    delete diffSearch.nightf;
                }
                if (diffSearch.hasOwnProperty('nightt')) {
                    delete diffSearch.nightt;
                }
            }
            if (diffSearch.hasOwnProperty('meal')) {
                // Если был поиск без определенного питания - фильтруем к нужному
                if (!$scope.searchParams.me) {
                    filterMeal = $rootScope.searchParams.me;
                    delete diffSearch.meal;
                }
                // Если стал поиск без определенного питания, текущие туры с питанием тоже подойдут
                else if (!$rootScope.searchParams.me) {
                    delete diffSearch.meal;
                }
                needFullSearch = true;
            }
            if (diffSearch.hasOwnProperty('operator')) {
                // Если был поиск без определенного оператора - фильтруем к нужному
                if (!$scope.searchParams.op.length) {
                    filterOperator = $rootScope.searchParams.op;
                    delete diffSearch.operator;
                }
                // Если стал поиск без определенного оператора, текущие туры тоже подойдут
                else if (!$rootScope.searchParams.op.length) {
                    delete diffSearch.operator;
                }
                // Если хоть один из старых опервторов есть в новом - не сбрасываем таблицу, а фильтруем
                else {
                    var intersect = false;
                    for (var opi = 0; opi < $scope.searchParams.op.length; opi++) {
                        if ($rootScope.searchParams.op.indexOf($scope.searchParams.op[opi]) != -1) {
                            intersect = true;
                        }
                    }
                    if (intersect) {
                        filterOperator = $rootScope.searchParams.op;
                        delete diffSearch.operator;
                    }
                }
                if (filterOperator) {
                    for (var opq = 0; opq < filterOperator.length; ++opq) {
                        filterOperator[opq] = parseInt(filterOperator[opq]);
                    }
                }
                needFullSearch = true;
            }
            // Если осталась неисправимая разница в поиске - сбрасываем старые цены
            if (!$.isEmptyObject(diffSearch)) {
                oldPrices = null;
                needFullSearch = true;
            }
        }
        if ($scope.priceFull != $rootScope.priceFull) {
            changeFullPrice = $rootScope.priceFull;
        }

        // Сбрасываем эти параметры только если нужен новый поиск
        if (needFullSearch || needPartialSearch) {
            $scope.loaded = false;
            $scope.fullyLoaded = false;
            $scope.complete = false;
            $scope.count = 0;
            $scope.searchKey = null;
        }

        $scope.selected = null;
        $scope.hover = null;
        $scope.hoverTimer = null;
        $scope.searchParams = null;
        $scope.defaultPrice = null;
        $scope.current = {
            date: moment($rootScope.searchParams.df, 'DD-MM-YYYY').format('YYYY-MM-DD'),
            duration: $rootScope.searchParams.nf
        };
        $scope.$parent.minComparePrice = null;
        $scope.$parent.minComparePrice2 = null;
        $scope.$parent.moreMinComparePrice = null;
        $scope.$parent.moreMinComparePrice2 = null;
        $scope.$parent.maxComparePrice = null;
        if ($scope.statusTimer) {
            clearTimeout($scope.statusTimer);
            $scope.statusTimer = null;
        }
        if ($scope.statusRequest) {
            $scope.statusRequest.resolve();
            $scope.statusRequest = null;
        }

        // Составление таблицы
        var tomorrow = moment().add(1, 'days').startOf('day');
        var dateStart = moment($rootScope.searchParams.df, 'DD-MM-YYYY').subtract(3, 'days');
        if (dateStart < tomorrow) {
            dateStart = tomorrow;
        }
        var dateEnd = moment(dateStart).add(6, 'days');
        var durationStart = $rootScope.searchParams.nf - 2 > 0 ? $rootScope.searchParams.nf - 2 : 1;
        var durationEnd = durationStart + 4;
        var oldDates = $scope.dates;
        var oldDurations = $scope.durations;

        $scope.prices = {};
        $scope.dates = getDateList(dateStart, dateEnd);
        $scope.durations = [];
        for (var i = durationStart; i <= durationEnd; ++i) {
            $scope.durations.push(i);
        }

        // Частичный поиск
        if (needPartialSearch && !needFullSearch && oldDates && oldDurations) {
            // Если даты/длительности не изменились или изменились сразу и даты и длительности - пропускаем
            if (oldDates[0] == $scope.dates[0] && oldDurations[0] == $scope.durations[0]
                || oldDates[0] != $scope.dates[0] && oldDurations[0] != $scope.durations[0]) {
                $scope.partialSearch = null;
            } else {
                $scope.partialSearch = {};

                // Если дата сдвинулась вперед
                if (oldDates[0] < $scope.dates[0] && $scope.dates[0] < oldDates[6]) {
                    $scope.partialSearch.datef = moment(oldDates[6]).add(1, 'days').format('YYYY-MM-DD');
                    $scope.partialSearch.datet = $scope.dates[6];
                }
                // Если дата сдвинулась назад
                else if (oldDates[0] < $scope.dates[6] && $scope.dates[6] < oldDates[6]) {
                    $scope.partialSearch.datef = $scope.dates[0];
                    $scope.partialSearch.datet = moment(oldDates[0]).subtract(1, 'days').format('YYYY-MM-DD');
                }
                // Если дата не изменилась
                else {
                    $scope.partialSearch.datef = $scope.dates[0];
                    $scope.partialSearch.datet = $scope.dates[6];
                }

                // Если длительность сдвинулась вперед
                if (oldDurations[0] < $scope.durations[0] && $scope.durations[0] < oldDurations[4]) {
                    $scope.partialSearch.nightf = oldDurations[4] + 1;
                    $scope.partialSearch.nightt = $scope.durations[4];
                }
                // Если длительность сдвинулась назад
                else if (oldDurations[0] < $scope.durations[4] && $scope.durations[4] < oldDurations[4]) {
                    $scope.partialSearch.nightf = $scope.durations[0];
                    $scope.partialSearch.nightt = oldDurations[0] - 1;
                }
                // Если длительность не изменилась
                else {
                    $scope.partialSearch.nightf = $scope.durations[0];
                    $scope.partialSearch.nightt = $scope.durations[4];
                }
            }
        } else {
            $scope.partialSearch = null;
        }

        angular.forEach($scope.dates, function (date) {
            $scope.prices[date] = {};
            angular.forEach($scope.durations, function (duration) {
                if (oldPrices && oldPrices.hasOwnProperty(date) && oldPrices[date].hasOwnProperty(duration) && oldPrices[date][duration]) {
                    $scope.prices[date][duration] = oldPrices[date][duration];
                    if (filterMeal || filterOperator != null || changeFullPrice != null) {
                        $scope.prices[date][duration] = filterTours($scope.prices[date][duration].tours, filterMeal, changeFullPrice, filterOperator);
                    }
                    $scope.loaded = $scope.loaded || $scope.prices[date][duration] !== null;
                } else {
                    $scope.prices[date][duration] = null;
                }
            });
        });
        if ($scope.loaded) {
            onPriceListUpdate();
        }
    }

    function filterTours(tours, meal, fullPrice, filterOperator) {
        var result = {tours: {}};
        angular.forEach(tours, function (tour, id) {
            if (meal && tour.mealId != meal) {
                return;
            }
            if (filterOperator && filterOperator.indexOf(tour.operatorId) == -1) {
                return;
            }
            if (fullPrice !== null) {
                if (fullPrice) {
                    tour.priceRu = tour.priceWithFuel;
                } else {
                    tour.priceRu = tour.priceWithoutFuel;
                }
            }
            result.tours[id] = tour;
            if (!result.price || result.price > tour.priceRu) {
                result.price = tour.priceRu;
                result.id = id;
            }
        });
        return $.isEmptyObject(result.tours) ? null : result;
    }

    function onPriceListUpdate() {
        // Если есть выбранная ячейка - обновляем ID тура
        if ($scope.selected) {
            $scope.selected.id = $scope.prices[$scope.selected.date][$scope.selected.duration].id;
        }
        // Центраяльная ячейка - по умолчанию
        if ($scope.prices[$scope.dates[3]][$scope.durations[2]]) {
            $scope.defaultPrice = $scope.prices[$scope.dates[3]][$scope.durations[2]];
            $scope.defaultPrice.date = $scope.dates[3];
            $scope.defaultPrice.duration = $scope.durations[2];
        } else {
            $scope.defaultPrice = null;
        }
        // Если есть ячейка под курсором
        if ($scope.hover) {
            $scope.onHover($scope.hover.date, $scope.hover.duration);
        } else {
            $scope.onHover(null);
        }

        // Поиск 2 минимальных и максимальной цен
        $scope.$parent.minComparePrice = null;
        $scope.$parent.minComparePrice2 = null;
        $scope.$parent.maxComparePrice = null;
        angular.forEach($scope.prices, function (list, date) {
            angular.forEach(list, function (item, duration) {
                if (item === null) {
                    return;
                }
                if ($scope.$parent.minComparePrice === null) {
                    // 1 шаг
                    $scope.$parent.minComparePrice = item.price;
                    $scope.$parent.maxComparePrice = item.price;
                } else if ($scope.$parent.minComparePrice2 === null) {
                    // 2 шаг (точнее, 2 новое значение)
                    $scope.$parent.minComparePrice = min($scope.$parent.minComparePrice, item.price);
                    $scope.$parent.maxComparePrice = max($scope.$parent.minComparePrice, item.price);
                    if ($scope.$parent.minComparePrice != $scope.$parent.maxComparePrice) {
                        $scope.$parent.minComparePrice2 = $scope.$parent.maxComparePrice;
                    }
                } else if ($scope.$parent.minComparePrice > item.price) {
                    // новый минимум
                    $scope.$parent.minComparePrice2 = $scope.$parent.minComparePrice;
                    $scope.$parent.minComparePrice = item.price;
                } else if ($scope.$parent.minComparePrice != item.price && $scope.$parent.minComparePrice2 > item.price) {
                    // новый 2-й минимум
                    $scope.$parent.minComparePrice2 = item.price;
                } else if ($scope.$parent.maxComparePrice < item.price) {
                    // новый максимум
                    $scope.$parent.maxComparePrice = item.price;
                }
            });
        });
    }

    // Прячем тултип при клике вне его и таблицы
    $('body').on('click', function (e) {
        if ($scope.selected) {
            var popup = $('#comparePopup');
            if ($(e.target).closest('td.hp-price-compare-td').length == 0
                && popup[0] != e.target && !$.contains(popup[0], e.target))
            {
                $scope.$apply(function () {
                    $scope.selected = null;
                });
            }
        }
    });

    $rootScope.$on('$CheapestTourLoaded', function (qwe, tour, duration) {
        if ($scope.prices[tour.date][duration]) {
            if ($scope.prices[tour.date][duration].price > tour.priceRu) {
                $scope.prices[tour.date][duration].price = tour.priceRu;
                $scope.prices[tour.date][duration].id = tour.tourId;
            }
        } else {
            $scope.prices[tour.date][duration] = {
                price: tour.priceRu,
                id: tour.tourId,
                tours: {}
            };
        }
        $scope.prices[tour.date][duration]['tours'][tour.tourId] = tour;
        onPriceListUpdate();
    });

    $scope.init = function (dataUrl) {
        $scope.url = dataUrl;
    };

    $scope.load = function (count) {
        var searchParams = $rootScope.searchParams.getSearchQueryArray();
        if ($scope.searchKey) {
            searchParams.sk = $scope.searchKey;
        }
        if (count) {
            searchParams.tc = count;
        }
        if ($scope.count) {
            searchParams.ofs = $scope.count;
        }
        if ($scope.partialSearch) {
            searchParams.nf = $scope.partialSearch.nightf;
            searchParams.nt = $scope.partialSearch.nightt;
            searchParams.df = $scope.partialSearch.datef;
            searchParams.dt = $scope.partialSearch.datet;
        } else {
            searchParams.nf = $scope.durations[0];
            searchParams.nt = $scope.durations[4];
            searchParams.df = $scope.dates[0];
            searchParams.dt = $scope.dates[6];
        }

        searchParams.df = moment(searchParams.df).format('DD-MM-YYYY');
        searchParams.dt = moment(searchParams.dt).format('DD-MM-YYYY');

        $http.get($scope.url + '?' + $.param(searchParams))
            .success(function (data) {
                $scope.loaded = true;
                $scope.count += data.count;
                $scope.searchKey = data.searchKey;

                // Обновление цен
                angular.forEach($scope.dates, function (date) {
                    angular.forEach($scope.durations, function (duration) {
                        var oldPrice = $scope.prices[date][duration];
                        if (data.prices.hasOwnProperty(date) && data.prices[date].hasOwnProperty(duration)
                            && (oldPrice === null || oldPrice > data.prices[date][duration].price)) {
                            // Если на дату нет данных - создаем пустой объект
                            if (oldPrice === null) {
                                $scope.prices[date][duration] = {
                                    tours: {}
                                };
                            }
                            $scope.prices[date][duration].price = data.prices[date][duration].price;
                            $scope.prices[date][duration].id = data.prices[date][duration].id;
                            // Добавляем туры в список
                            angular.forEach(data.prices[date][duration].tours, function (tour, key) {
                                $scope.prices[date][duration]['tours'][key] = tour;
                            });
                        }
                    });
                });

                onPriceListUpdate();

                if (!$scope.complete) {
                    window.console.log('Compare prices: ' + $scope.count + ' tours loaded and continue');
                    $scope.statusTimer = setTimeout(function () {$scope.status();}, 1000);
                } else {
                    $scope.fullyLoaded = true;
                    window.console.log('Compare prices: complete (' + $scope.count + ' loaded)');
                }
            });
    };

    $scope.status = function () {
        if (!$scope.searchKey) {
            window.console.error('Compare prices: search key is not set');
            $scope.complete = true;
            return;
        }
        $scope.statusRequest = $q.defer();
        $http.get('/search/search_status?searchKey=' + $scope.searchKey + '&script=compare-prices', {timeout: $scope.statusRequest.promise})
            .success(function (response) {
                $scope.complete = response.complete;
                if (response.count > $scope.count) {
                    $scope.load(response.count - $scope.count);
                } else if (!$scope.complete) {
                    $scope.statusTimer = setTimeout(function () {$scope.status();}, 1000);
                } else {
                    $scope.fullyLoaded = true;
                    window.console.log('Compare prices: complete (last loaded ' + $scope.count + ')');
                }
            });
    };

    $scope.onHover = function (date, duration) {
        if (date === null || !$scope.prices[date][duration]) {
            $scope.hover = $scope.defaultPrice;
        } else {
            $scope.hover = $scope.prices[date][duration];
            $scope.hover.date = date;
            $scope.hover.duration = duration;
        }
        if ($scope.hover === null || $scope.hover.price == 0) {
            return;
        }
        // Пересчёт минимальных значений выше выделенной цены
        $scope.$parent.moreMinComparePrice = null;
        $scope.$parent.moreMinComparePrice2 = null;
        var hover_price = $scope.hover.price;
        angular.forEach($scope.prices, function (list, date) {
            angular.forEach(list, function (item, duration) {
                if (item === null) {
                    return;
                }
                if (item.price > hover_price) {
                    if ($scope.$parent.moreMinComparePrice === null) {
                        // 1 шаг
                        $scope.$parent.moreMinComparePrice = item.price;
                    } else if ($scope.$parent.minComparePrice2 === null) {
                        // 2 шаг (точнее, 2 новое значение)
                        $scope.$parent.moreMinComparePrice = min($scope.$parent.moreMinComparePrice, item.price);
                        if ($scope.$parent.moreMinComparePrice != item.price) {
                            $scope.$parent.moreMinComparePrice2 = max($scope.$parent.moreMinComparePrice, item.price);
                        }
                    } else if ($scope.$parent.moreMinComparePrice > item.price) {
                        // новый минимум
                        $scope.$parent.moreMinComparePrice2 = $scope.$parent.moreMinComparePrice;
                        $scope.$parent.moreMinComparePrice = item.price;
                    } else if ($scope.$parent.moreMinComparePrice != item.price && $scope.$parent.moreMinComparePrice2 > item.price) {
                        // новый 2-й минимум
                        $scope.$parent.moreMinComparePrice2 = item.price;
                    }
                }
            });
        });
    };

    $scope.onTableHover = function (state) {
        if (state) {
            $scope.hoverTimer = setTimeout(function () {
                $http.get('/hiddenhotel/log_compare_prices/?action=hover');
            }, 5000);
        } else {
            clearTimeout($scope.hoverTimer);
        }
    };

    $scope.showPopup = function (date, duration, $event) {
        if (!$scope.prices[date][duration] || (duration == $scope.current.duration && date == $scope.current.date)) {
            $scope.selected = null;
            return;
        }
        $scope.selected = {
            date: date,
            duration: duration,
            id: $scope.prices[date][duration].id
        };
        var td = $($event.target).closest('td');
        var position = td.position();
        var height = td.height() + parseInt(td.css('padding-top')) + parseInt(td.css('padding-bottom'));
        $('#comparePopup').css('left', position.left + td.width()/2).css('top', position.top + height);
    };

    $scope.dropSelect = function () {
        $timeout(function () {
            $scope.selected = null;
        })
    };

    $scope.selectDate = function () {
        var date = $scope.selected.date;
        var duration = $scope.selected.duration;
        var data = $scope.prices[date][duration];
        $scope.selected = null;

        $("html, body").animate({
            scrollTop: $('#prices').offset().top - $(".hotel-page").offset().top
        }, 400);
        $http.get('/hiddenhotel/log_compare_prices/?action=click');
        $rootScope.searchParams.df = moment(date).format('DD-MM-YYYY');
        $rootScope.searchParams.nf = duration;
        $rootScope.searchParams.setUrl($rootScope.isIndexPage);
        $rootScope.notShowSearchTooltip = true;
        $rootScope.notShowSearchTooltipCount = 3;
        $rootScope.$broadcast('$srNeedToUpdate');

        // Загрузка первых результатов из кеша
        if (data && !$.isEmptyObject(data.tours)) {
            var tours = {
                0: {
                    allocation_id: $rootScope.searchParams.al[0],
                    tourDateList: data.tours
                }
            };
            angular.element('[hotel-search]').scope().loadFromArray(tours, duration, Object.keys(data.tours).length, $rootScope.searchParams, true);
            // Подсветка таблицы с ценами при загрзке из массива
            $('.hp-price').effect("highlight", {easing:'easeInBounce'}, 3000);
        } else {
            angular.element('[hotel-search]').scope().loadFromCache($scope.searchKey, $rootScope.searchParams, true);
        }
    };

    $rootScope.$on('$srNeedToUpdate', function () {
        initParams();
        $scope.priceFull = $rootScope.priceFull;
        $scope.searchParams = angular.copy($rootScope.searchParams);
        if (!$scope.fullyLoaded) {
            $scope.load();
        }
    });

    function getDateList(start, end) {
        var list = [];
        start = new Date(start);
        end = new Date(end);
        for (; start <= end; start.setDate(start.getDate() + 1)) {
            list.push(moment(start).format('YYYY-MM-DD'));
        }
        return list;
    }
}]);
