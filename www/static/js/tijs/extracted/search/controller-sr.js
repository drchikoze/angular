angular.module('search').controller('sr', ['$scope', '$rootScope', '$http', '$location', '$q', 'dataSource', '$injector', 'description', function($scope, $rootScope, $http, $location, $q, dataSource, $injector, description) {

    $scope.availableDuration = [];
    $scope.classMap = window.classMap;
    $scope.items = [];

    $scope.number_format = window.number_format;

    var onliner = function(pointsUrl) {
        this.pointsUrl = pointsUrl;
        // таймеры обновления информиции о минимальных ценах и точек

        this.pointsTimer = null;
        this.pointsTimerCounter = 0;
        this.pointsTimerInterval = 1000;

        this.key = null;
        this.searchType = null;

        this.inProgress = false;
    };

    $scope.alternativeLinksSearch = function (url) {
        $scope.available_date = false;
        var baseSearchParams = $rootScope.searchParams.initFromUrl(url);
        $location.url(url);
        $rootScope.searchParams = baseSearchParams;
        $rootScope.closeSearchTooltip();
        $rootScope.notShowSearchTooltip = true;
        $rootScope.$broadcast('$srGetTitleString');
        $rootScope.$broadcast('$srNeedToUpdate');
        $rootScope.$broadcast('$locationChangeSuccess');
        $scope.arrayParams = baseSearchParams;
        $scope.links = makeAlternativeSearchLinks(baseSearchParams);

    };

    onliner.prototype = $.extend(onliner.prototype, {
        start: function() {
            this.stop();
            this.inProgress = true;
            if ($scope.data.key && $scope.data.search_type) {
                this.key = $scope.data.key;
                this.searchType = $scope.data.search_type;
                var self = this;

                this.pointsTimer = setTimeout(function() {
                    self.pointsTimerCounter = 0;
                    self.updatePoints()
                }, this.pointsTimerInterval);
            }
        },

        stop: function() {
            this.inProgress = false;
            this.pointsTimerInterval = 1000;
            this.pointsTimerCounter = 0;

            clearTimeout(this.pointsTimer)
        },

        updatePoints: function() {
            var self = this;
            var ids = [];

            $.each($scope.data.items, function(key, value) {
                if (!value.onlineSeatsState)
                    ids.push(value.id)
            });

            if (!ids.length) {
                this.stop();
                return
            }

            $http.post(this.pointsUrl, {
                key: this.key,
                offers: ids.join(','),
                type: this.searchType
            }).success(function(data) {

                self.pointsTimerCounter++;

                if (self.inProgress) {

                    if (self.pointsTimerCounter > 20) {
                        self.stop()
                    } else {
                        self.pointsTimerInterval *= 2;
                        self.pointsTimer = setTimeout(function() {
                            self.updatePoints()
                        }, self.pointsTimerInterval);
                    }

                }

                if ( ! $scope.data) {
                    return
                }

                for (var idx in $scope.data.items) {
                    var id = $scope.data.items[idx].id.split('@');
                    if (data[id[0]]) {
                        $scope.data.items[idx].onlineSeatsState = data[id[0]]
                    }
                }
            })
        }
    });

    var url = '';
    var onlinerProcessor = false;

    $scope.init = function(dataUrl, pointsUrl) {
        url = dataUrl;

        if (pointsUrl) {
            onlinerProcessor = new onliner(pointsUrl);
            $scope.$on('srCount', function($event, count) {
                if ($scope.data && $scope.data.paginator) {
                    $scope.data.paginator.count = count
                }
            })
        }
    };

    $scope.data = '';
    $scope.searchKeyByDurations = [];
    $scope.toursCountByDuration = [];
    $scope.secondResultReceivedByDurations = [];
    $scope.countCheckStatusStageForFullLoad = [];
    $scope.countLoadToursStageForFullLoad = [];
    $scope.toursFullCountByDuration = [];
    $scope.promiseListByDuration = [];
    $scope.Math = window.Math;
    $scope.currentSearchParams = angular.copy($rootScope.searchParams);

    //Уход в процессе поиска (еще идет ожидание результатов)
    const SEARCH_PROGRESS_LEAVE = 3;
    //Уход в процессе поиска (еще идет ожидание результатов)
    const SEARCH_HOTEL_PROGRESS_LEAVE = 4;

    var load = function() {

        var source;
        if (isHotelPage()) {
            source = SEARCH_HOTEL_PROGRESS_LEAVE;
        } else {
            source = SEARCH_PROGRESS_LEAVE;
        }
        $http({
            method: 'POST',
            url: '/search/write_leaver',
            data: {
                'source': source
            }
        }).success(function () {
            console.log('search_start_leaver_logged');
        });

        var query = [];

        if (onlinerProcessor) {
            // остановим обработку онлайнера
            onlinerProcessor.stop()
        }

        $scope.data = '';
        $scope.searchKeyByDurations = [];
        $scope.toursFullCountByDuration = [];
        $scope.departure = description.getPrettyDate($rootScope.searchParams.df);
        $scope.duration = description.getPrettyDuration($rootScope.searchParams.nf);
        $scope.count_adult = description.getPrettyAdultsCount($rootScope.searchParams.rs);
        $scope.count_children = description.getPrettyChildrenCount($rootScope.searchParams.rs);
        $scope.children = description.getChildrenCount($rootScope.searchParams.rs);
        $scope.adult = description.getAdultCount($rootScope.searchParams.rs);
        $scope.operatorsCount = 0;
        $scope.operatorsReadyCount = 0;

        $rootScope.$broadcast('srLoadingStart');

        /**
         * Ищем сервис availableSearch. Если его нет, то игнорируем эксепшн. И работаем по старому.
         * Если он есть то проверяем можно ли нам проводить поиск или нет
         */
        try {
            var availableSearch = $injector.get('availableSearch');
            if ( !availableSearch.isAvailable() ) {
                $rootScope.$broadcast('srLoadingComplete', {});

                //Это такой ХАК, чтобы в РП показалось уведомление о том, что ничего не найдено и исчез прогрессбар.
                //В шаблоне директива sly-show привязана к data.items и data.paginator.count
                $scope.data = {
                    items: [],
                    paginator: {count: 0}
                };

                $rootScope.$broadcast('srDisplayComplete');
                return;
            }
        } catch(e) {

        }
        for (var idx in $rootScope.searchParams) {
            /**
             * Не добавляем параметр типа поиска
             * Это фикс для турпоиска. Выпилить.
             */
            if (idx == 'rt')
                continue;
            query[idx] = $rootScope.searchParams[idx];
        }

        var qs = dataSource.search();
        // запрос обрывается через 15 секунд

        $scope.sortType = 'date';
        $scope.initialDuration = $rootScope.searchParams.nf;
        $scope.selectedDuration = $rootScope.searchParams.nf;
        $scope.currentSearchDuration = $rootScope.searchParams.nf;
        $scope.secondResultReceivedByDurations = [];
        $scope.searchStatusList = {};
        $scope.countCheckStatusStageForFullLoad = [];
        $scope.countLoadToursStageForFullLoad = [];
        $scope.currentSearchParams = angular.copy($rootScope.searchParams);
        // Если результаты из кеша были загружены не по этому поиску
        if (!$scope.cacheLoadedForParams || !angular.equals($rootScope.searchParams, $scope.cacheLoadedForParams)) {
            $scope.items = [];
            $scope.availableDuration = [];
            $scope.toursCountByDuration = [];
            $scope.clearLastSearch();
        }
        // Обнуляем параметры. Возможна ситуация когда кеш больше загружаться не будет, а поиск будет выполнен сначала
        // по другим параметрам, а потом вернется в исходные. Тогда если не обнулить эти параметры, то старые результаты
        // не будут удалены
        $scope.cacheLoadedForParams = null;

        initFirstSearch(0, qs);
        if(!isHotelPage()) {
            initFirstSearch(1, qs);
            initFirstSearch(2, qs);
        }
    };

    $scope.restartFirstSearch = function(duration) {
        var qs = dataSource.search();
        initFirstSearch(duration, qs);
    };

    $scope.$on('$srNeedToUpdate', function($event) {
        load($event)
    });

    $scope.$on('$fullSearchStarted', function() {
        console.log('fullSearchStarted');
    });

    $scope.$on('srLoadingAbort', function($event, $message) {
        $scope.data = {
            error: $message || 'Произошла ошибка при загрузке данных'
        }
    });

    var initFirstSearch = function(additionalDuration, qs) {
        $scope.completeSearch[additionalDuration] = false;
        if (typeof $scope.promiseListByDuration[additionalDuration] != 'undefined') {
            $scope.promiseListByDuration[additionalDuration].resolve();
        }
        $scope.promiseListByDuration[additionalDuration] = $q.defer();
        console.log('first search started duration: ' + additionalDuration);
        var paramsToSearch = $rootScope.searchParams.getSearchQueryArray();
        paramsToSearch['add_dur'] = additionalDuration;

        $rootScope.$broadcast('srLoadingDuration' + additionalDuration + 'Start');

        (function() { $http.get(url, {timeout: $scope.promiseListByDuration[additionalDuration].promise, params: paramsToSearch})
            .success(function(data) {
                console.log('first search data received duration: ' + additionalDuration);
                data = $scope.decodeParams(data, $scope.classMap);
                $scope.data = data;
                //console.info('search_data=');
                //console.info(data);
                $scope.searchKeyByDurations[additionalDuration] = data.searchKey;
                $scope.toursCountByDuration[additionalDuration] = data.count;
                $scope.toursFullCountByDuration[additionalDuration] = data.fullCount;
                var duration = data.duration;
                if (duration) {
                    $scope.items = $scope.convertReceivedTourList($scope.items, data.items, duration);
                    $scope.boRefresh();
                    if (!($scope.availableDuration.indexOf(parseInt(duration)) + 1)) {
                        $scope.availableDuration.push(parseInt(duration));
                    }
                    if ($scope.items.length > 0) {
                        $rootScope.$broadcast('$CheapestTourLoaded', $scope.items[0], duration);
                    }
                }
                $scope.availableDuration.sort(function(a, b) {return a - b;});
                $rootScope.showOperators = data.showOperator;
                $scope.checkSearchStatus(additionalDuration);

                    if (onlinerProcessor) {
                        onlinerProcessor.start()
                    }

                    var searchParams = {
                        query: qs,
                        additionalDuration: additionalDuration
                    };

                    if (data.key) {
                        searchParams['key'] = data.searchKey
                    }

                    if (data.search_type) {
                        searchParams['search_type'] = data.search_type
                    }

                    if (data.journal_entry_id) {
                        searchParams['journal_entry_id'] = data.journal_entry_id
                    }

                    // этот хак предназначен для передачи параметра в ухо
                    searchParams['result_group'] = searchParams['query']['result_group'];

                    if (data.error) {
                        $rootScope.$broadcast('srLoadingDuration' + additionalDuration + 'Error', searchParams);
                        $rootScope.$broadcast('srLoadingError', searchParams);
                    } else {
                        $rootScope.$broadcast('srLoadingDuration' + additionalDuration + 'Complete', searchParams, (data.items && data.items.length) ? data.items.length : 0);
                        $rootScope.$broadcast('srLoadingComplete', searchParams, (data.items && data.items.length) ? data.items.length : 0);
                    }
                    if ((data.items && data.items.length == 0) || data.error) {
                        $rootScope.$broadcast('srDisplayDuration' + additionalDuration + 'Complete');
                        $rootScope.$broadcast('srDisplayComplete');
                    }

                    // небольшой хак - отправляем количество найденных результатов поиска
                    if (data.paginator) {
                        $rootScope.$broadcast('srCount', data.paginator.count);
                    }
            }).error(function(errorMessage, status) {

                // Если статус равен нулю,
                // то это означает прерывание запроса на стороне пользователя.
                // А значит и нет необходимости оповещать систему
                if (!parseInt(status, 10))
                    return;
                $rootScope.$broadcast('srLoadingDuration' + additionalDuration + 'Fail');
                $rootScope.$broadcast('srLoadingFail');
                $scope.data = {
                    error: 'Произошла ошибка при загрузке данных'
                }
            }) } )();
    };

    function isHotelPage() {
        return (window.location.href.indexOf('/hotel/') + 1);
    }

    function getTourDateListMap(tourDateList) {
        var map = {};
        for (var i in tourDateList) {
            if (tourDateList.hasOwnProperty(i)) {
                var tourDate = tourDateList[i];
                map[tourDate.date] = i;
            }
        }
        return map;
    }

    $scope.getPriceDuration = function(allocation, currentDuration, selectedDuration, currentDate) {
        if ((currentDuration == selectedDuration) ||
            (allocation.tourDateList[currentDuration] == undefined)) {
            return 0;
        }
        var tourDateListMap = getTourDateListMap(allocation.tourDateList[currentDuration]);
        if ((allocation.tourDateList[currentDuration][tourDateListMap[currentDate]] == undefined) ||
            (allocation.tourDateList[selectedDuration][tourDateListMap[currentDate]] == undefined)) {
            return 0;
        }
        var priceDiff = allocation.tourDateList[currentDuration][tourDateListMap[currentDate]].priceRu - allocation.tourDateList[selectedDuration][tourDateListMap[currentDate]].priceRu;
        return priceDiff > 0 ? '+' + priceDiff : priceDiff;
    };

    $scope.decodeParams = function(receivedData, classMap) {
        var decodedData = {};
        var decodedKey, encodedValue, decodedValue;
        for (var encodedKey in receivedData) {
            if (classMap[encodedKey] != undefined) {
                decodedKey = classMap[encodedKey];
            } else {
                decodedKey = encodedKey;
            }
            encodedValue = receivedData[encodedKey];
            if ((typeof encodedValue == 'object') || (Array.isArray(encodedValue))) {
                decodedValue = $scope.decodeParams(encodedValue, classMap);
            } else {
                decodedValue = encodedValue;
            }
            decodedData[decodedKey] = decodedValue;
        }
        return decodedData;
    }

}]);