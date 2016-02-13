angular.module('filters').service('searchParamsDiff', ['dataSource', function (dataSource) {
    var reverseMap = dataSource.reverseMap;

    // поиск отличий между запросами. Выявляет, какой фильтр был изменен
    // Пользуемся тем, что если в newSearch есть элемент со значением, которое отлично от значения в oldSearch
    // то это изменившийся элемент
    // Или наоборот. Если в newSearch элементов стало меньше

    var equalElement = function (val1, val2) {
        if (isArray(val1)) {
            val1.forEach(function (item) {
                if (!(val2.indexOf(item) + 1) && !(val2.indexOf(parseInt(item)) + 1)) {
                    return false;
                }
            });
            return val1.length == val2.length;
        } else {
            return val1 == val2;
        }
    };

    var searchDiff = function (oldSearch, newSearch, returnProps) {

        ////console.log('search location toggler:', oldSearch, newSearch)

        var diff = {}, idx;

        for (idx in newSearch) {
            if (oldSearch.hasOwnProperty(idx) && !equalElement(newSearch[idx], oldSearch[idx]) || !oldSearch.hasOwnProperty(idx)) {
                diff[reverseMap[idx]] = true
            }
        }

        for (idx in oldSearch) {
            if (newSearch.hasOwnProperty(idx) && !equalElement(newSearch[idx], oldSearch[idx]) || !newSearch.hasOwnProperty(idx))
                diff[reverseMap[idx]] = true
        }

        delete diff.undefined;

        if (returnProps) {
            return diff;
        }

        // считаем количество элементов в объекте
        var diffLength = 0;
        for (idx in diff)
            diffLength++

        //console.log('current toggler activities', diff, diffLength, newSearch, oldSearch)


        //При изменении фильтров дат и ночей, могут меняться два параметра, от сюда имеем запрос на сервер init.
        //На сервере запросы init кэшируются и данные фильтров отдаются дефолтные из кеша.
        if (diffLength == 2) {
            if (diff.hasOwnProperty('datef') && diff.hasOwnProperty('datet')) {
                return 'datef'
            }
            if (diff.hasOwnProperty('nightf') && diff.hasOwnProperty('nightt')) {
                return 'nightf'
            }
        }
        if (diffLength <= 3 && (diff.room_size || diff.child_age1 || diff.child_age2)) {
            return 'room_size';
        }

        if (diffLength > 1) {
            return 'init'
        } else if (diffLength == 1) {
            for (idx in diff)
                return idx;
        } else
            return false
    };

    return {diff: searchDiff};
}]).controller('init', ['$rootScope', '$scope', 'dataSource', '$location', '$q', '$http', 'filterParams', 'params', 'searchParamsDiff',
    function($rootScope, $scope, dataSource, $location, $q, $http, filterParams, searchParams, searchParamsDiff) {

        $rootScope.isIndexPage = window.isIndexPage;

        $scope.roomSizes = {
            2: ['10PPL', 10, 0],
            55: ['6AD+1CHD', 6, 1],
            56: ['6AD+2CHD', 6, 2],
            53: ['5AD+1CHD', 5, 1],
            54: ['5AD+2CHD', 5, 2],
            44: ['11PPL', 11, 0],
            29: ['5PPL', 5, 0],
            24: ['6PPL', 6, 0],
            30: ['7PPL', 7, 0],
            3: ['8PPL', 8, 0],
            4: ['9PPL', 9, 0],
            14: ['DBL', 2, 0],
            20: ['DBL+1CHD', 2, 1],
            21: ['DBL+2CHD', 2, 2],
            26: ['QTRL', 4, 0],
            32: ['QTRL+1CHD', 4, 1],
            45: ['12PPL', 12, 0],
            33: ['QTRL+2CHD', 4, 2],
            15: ['SGL', 1, 0],
            51: ['SGL (DBL SGL USE)', 1, 0, 0],
            18: ['SGL+1CHD', 1, 1],
            19: ['SGL+2CHD', 1, 2],
            23: ['TRL', 3, 0],
            27: ['TRL+1CHD', 3, 1],
            31: ['TRL+2CHD', 3, 2],
            60: ['SGL+3CHD', 1, 3],
            59: ['DBL+3CHD', 2, 3]
        };

        var filtersRequestDeferred = null;

        $scope.initialSearchParams = window.searchParams;

        $scope.getSearchInfoFromAdvBroker = function() {

            var dataToSend = {
                worker: 'Banner_ThUserType_DataLoader',
                format: 'jsonp'
            };
            $.ajax({
                url: 'http://advbroker.ru/data/gate.php',
                type: 'GET',
                jsonp: "callback",
                dataType: 'jsonp',
                data: dataToSend,
                crossDomain: true,
                success: function (dataFromBrocker) {
                    if (typeof dataFromBrocker === 'string') {
                        dataFromBrocker = jQuery.parseJSON(dataFromBrocker);
                    }
                    if (typeof dataFromBrocker != 'undefined' && (typeof window.isNotDefaultSearchParamsSetArr == 'undefined' || !window.isNotDefaultSearchParamsSetArr.nf)) {
                        $scope.initialSearchParams.nf = parseInt(dataFromBrocker.night);

                        for (var property in $scope.roomSizes) {
                           if ($scope.roomSizes[property][1] == parseInt(dataFromBrocker.adult_num) && $scope.roomSizes[property][2] == parseInt(dataFromBrocker.child_num)) {
                               if (typeof window.isNotDefaultSearchParamsSetArr == 'undefined' || !window.isNotDefaultSearchParamsSetArr.rs) {
                                   $scope.initialSearchParams.rs = parseInt(property);
                               }
                               break;
                           }
                        }
                        var dateFromBrockerArr = dataFromBrocker.date.split(".");
                        var dateFromBrocker = new Date(dateFromBrockerArr[1] + '.' + dateFromBrockerArr[0] + '.' + dateFromBrockerArr[2]);
                        var defaultDateArr = window.searchParams.df.split("-");
                        var defaultDate = new Date(defaultDateArr[2], defaultDateArr[1] - 1, defaultDateArr[0]);
                        var yyyy = dateFromBrocker.getFullYear();
                        var dd = dateFromBrocker.getDate();
                        var mm = dateFromBrocker.getMonth() + 1;
                        if(dd<10){
                            dd='0'+dd;
                        }
                        if(mm<10){
                            mm='0'+mm;
                        }
                        if ((typeof window.isNotDefaultSearchParamsSetArr == 'undefined' || !window.isNotDefaultSearchParamsSetArr.df) && !$rootScope.isIndexPage) {
                            $scope.initialSearchParams.df = dd + '-' + mm + '-' +  yyyy;
                            var m;
                        }

                    }
                    $.ajax({
                        url: '/search/get_resort_id_by_city_id',
                        type: 'GET',
                        data: {ct: dataFromBrocker.city_id},
                        success: function (data) {
                            if (typeof data === 'string') {
                                data = jQuery.parseJSON(data);
                            }
                            if (typeof data != 'undefined') {
                                if (typeof window.isNotDefaultSearchParamsSetArr == 'undefined' || !window.isNotDefaultSearchParamsSetArr.ct) {
                                    $scope.initialSearchParams.ct = parseInt(data.resort_id);
                                }
                            }
                            var prev = $rootScope.searchParams;
                            window.searchParams = $scope.initialSearchParams;
                            $rootScope.searchParams = new searchParams(window.searchParams);
                            $rootScope.previousSearchParams = angular.copy($rootScope.searchParams);
                            $rootScope.isIndexPage = window.isIndexPage;
                            $rootScope.operatorsOpen = window.showOperators;
                            if (searchParamsDiff.diff(prevSearch, $rootScope.searchParams)) {
                                $scope.reload('init', $rootScope.searchParams);
                            }
                            window.needToSendDatatoBrocker = true;
                        },
                        error: function (xhr, status) {
                            window.searchParams = $scope.initialSearchParams;
                            $rootScope.searchParams = new searchParams(window.searchParams);
                            $rootScope.previousSearchParams = angular.copy($rootScope.searchParams);
                            $rootScope.isIndexPage = window.isIndexPage;
                            $rootScope.operatorsOpen = window.showOperators;
                            window.needToSendDatatoBrocker = true;
                        }
                    });
                    console.log(dataFromBrocker);
                },
                error: function (xhr, status) {
                    window.searchParams = $scope.initialSearchParams;
                    $rootScope.searchParams = new searchParams(window.searchParams);
                    $rootScope.previousSearchParams = angular.copy($rootScope.searchParams);
                    $rootScope.isIndexPage = window.isIndexPage;
                    $rootScope.operatorsOpen = window.showOperators;
                    window.needToSendDatatoBrocker = true;
                }
            });
        };

        $scope.needSearchInfoFromBroker = false;

        if ($rootScope.isIndexPage) {
            $scope.getSearchInfoFromAdvBroker();
        } else {
            $scope.isNotDefaultSearchParamsSetArr = window.isNotDefaultSearchParamsSetArr;
            for (var property in $scope.isNotDefaultSearchParamsSetArr) {
                if (!$scope.isNotDefaultSearchParamsSetArr[property]) {
                    $scope.needSearchInfoFromBroker = true;
                    $scope.getSearchInfoFromAdvBroker();
                    break;
                }
            }
            if (!$scope.needSearchInfoFromBroker) {
                $rootScope.searchParams = new searchParams(window.searchParams);
                $rootScope.previousSearchParams = angular.copy($rootScope.searchParams);
                $rootScope.operatorsOpen = window.showOperators;
                window.needToSendDatatoBrocker = true;
            }
        }

        $rootScope.priceFull = window.priceFull;

        $rootScope.is_subagent = window.is_subagent;

        $http({
            method: 'get',
            url: '/get_default_search_params'
        }).success(function(data) {
            $scope.defaultSearchParams = data;
        });

        if (!$scope.data) {
            $scope.data = {};
        }
        $scope.data.current_search_link = $rootScope.searchParams.getCurrentLink();

        // Мьютекс - состояние загрузки "в процессе"/"неактивна"
        var inProgress = true;

        $scope.service = dataSource;

        $scope.service.price = $rootScope.priceFull;

        $scope.service.is_subagent = $rootScope.is_subagent;

        var reverseMap = $scope.service.reverseMap;

        $scope.valid = true;

        $scope.getNickBySource = function(name) {
            return $scope.service.getNickBySource(name)
        };

        $rootScope.$on('changeShowOperators', function(event, showOperators) {
            $rootScope.operatorsOpen = showOperators;

            $http({
                method: 'POST',
                url: '/set_operators_render',
                params: {
                    'state': showOperators
                }
            }).success(function(data) {});
        });

        $rootScope.setPriceFull = function() {
            $rootScope.priceFull = !$rootScope.priceFull;
            $rootScope.$broadcast('$filtersChangeComplete', 'price', $rootScope.searchParams);
            $http({
                method: 'POST',
                url: '/set_price_render',
                params: {
                    'state': $rootScope.priceFull
                }
            }).success(function(data) {});
            setCookie('priceWithFeeFuel', $rootScope.priceFull, {expires: 14*24*60*60});
            $rootScope.showSearchTooltip = true;
        };

        $rootScope.toggleHideSubagents = function () {
            $rootScope.is_subagent = !$rootScope.is_subagent;
            if ($rootScope.is_subagent) {
                $rootScope.$broadcast('$operatorsReset');
            }
            setCookie('hideSubagents', $rootScope.hideSubagents, {expires: 14 * 24 * 60 * 60});
            $http({
                method: 'POST',
                url: '/set_subagents_render',
                params: {
                    'state': $rootScope.is_subagent
                }
            })
                .success(function(response) {
                    $rootScope.$broadcast('$needReloadFilters');
                    $rootScope.$broadcast('$filtersChangeComplete', 'is_subagent', $rootScope.searchParams);
                    $rootScope.showSearchTooltip = true;
                });
        };


        /**
         * Перезагрузка модели (фильтров)
         */
        $scope.reload = function(sender, params, firstUpdate) {

            if (!sender || sender == 'undefined') {
                sender = 'init';
            }

            $scope.$broadcast('toggleLoading');
            $rootScope.$broadcast('toggleLoadingStart');
            var query = params.getSearchQueryString() + '&' + Math.random();

            /**
             * После успешного запроса выполняется операция подготовки фильтров
             */
            if (filtersRequestDeferred) {
                filtersRequestDeferred.resolve();
            }

            var deferred = $q.defer();
            filtersRequestDeferred = deferred;

            $rootScope.diffSearch = searchParamsDiff.diff(prevSearch, $rootScope.searchParams);
            prevSearch = jQuery.extend(true, {}, $rootScope.searchParams);

            $rootScope.$broadcast('$filtersLoadDataStart', $scope.searchParams.getSearchQueryString());

            $http({
                method: "post",
                url: '/filters?' + query + '&__setid=' + $scope.name + '&_senderFilter=' + sender,
                timeout: deferred.promise
            }).then(function(response) {
                $rootScope.$broadcast('$filtersLoadDataComplete', $rootScope.searchParams);

                //затем загрузить данные и сконфигурировать стартовые значения
                var entities = [], idx, data = response.data;

                if (data.error) {
                    ////console.log('Error present: ', data.error)
                }

                $scope.valid = data.valid;

                for (idx in data.data) {
                    if (data.data.hasOwnProperty(idx)) {
                        dataSource[idx] = data.data[idx];
                    }
                }

                // Формируем строку хешей из данных, которые пришли с сервера
                var searchStr = {};

                for (idx in reverseMap) {
                    if (reverseMap.hasOwnProperty(idx)) {
                        var fullName = reverseMap[idx];
                        if (data.values[fullName] != undefined) {
                            if (data.values[fullName] instanceof Array || data.values[fullName] instanceof Object) {
                                searchStr[idx] = data.values[fullName].join('_')
                            } else
                                searchStr[idx] = data.values[fullName]
                        }
                    }
                }
                var oldSearch = $rootScope.searchParams;
                if (oldSearch instanceof Object) {
                    for (idx in oldSearch) {
                        //console.log('restore exceptions', searchStr[idx] == undefined, idx)
                        if(searchStr[idx] == undefined
                            && reverseMap[idx]
                            && $scope.service.exceptions[reverseMap[idx]]
                        ) {
                            searchStr[idx] = oldSearch[idx];
                        }
                    }
                }

                if (firstUpdate && location.pathname.replace(/^\/+|\/+$/gm,'').split('/').length == 3) {
                    // Удаляем лишнее из ссылки
                    var url = location.pathname;
                    if (location.search.match(/(\?|\&)informer(=|$)/)) {
                        url += '?informer';
                    }
                    $location.url(url);
                } else {
                    $rootScope.searchParams.setUrl($rootScope.isIndexPage);
                }

                ////console.log(data, searchStr, status, headers)
                $scope.$broadcast('toggleLoading');
                $rootScope.$broadcast('toggleLoadingEnd');
                deferred.resolve();
            }, function () {
                //fail
                deferred.resolve();
            });

            return deferred.promise;
        };

        // Храним предыдущее значение фильтров
        var prevSearch = {};


        $rootScope.$on('$needReloadFilters', function() {
            $scope.reload('init', $rootScope.searchParams);
        });

        // Первый запрос на активацию фильтров выполняется при инициализации приложения
        // Отправляем запрос типа init, который предоставляет в наше распоряжение все фильтры
        // После инициализации нужно зарегистрировать обработчик события изменения хеша навигации
        $scope.init = function(name, minPriceUrl) {

            $rootScope.$broadcast('$filtersLoadStart', $location.url());

            if (minPriceUrl) {
                $scope.$on('srLoadingError', function() {
                    clearTimeout(earUpdateTimer);
                    earUpdateTimer = null
                });

                $scope.$on('srLoadingComplete', function(event, searchParams) {

                    clearTimeout(earUpdateTimer);
                    earUpdateTimer = null;

                    var updateEar = function() {
                        if (earUpdateCounter < 10 && searchParams.key != undefined) {
                            $http.post(minPriceUrl, searchParams).success(function(data) {

                                // а тут у нас реализована логика обновления данных по операторам

                                if (dataSource.operator) {

                                    $.each(dataSource.operator, function(key, operator) {
                                        /*
                                         * Сбросим у всех операторов информацию по минимальным ценам
                                         */
                                        dataSource.operator[key] = $.extend(operator, {
                                            minPriceDB: null,
                                            minPriceOnline: 0,
                                            currency: null,
                                            stateDB: "",
                                            stateOnline: "",
                                            isOnline: false
                                        });

                                        /*
                                         * и добавим ее из актуальных значений уха
                                         */
                                        for (var idx in data.minPrices) {
                                            if (data.minPrices[idx].operatorId == operator.id) {
                                                dataSource.operator[key] = $.extend(dataSource.operator[key], data.minPrices[idx])
                                            }
                                        }
                                    })
                                }

                                if (data.inProgress) {
                                    earUpdateTimer = setTimeout(updateEar, 2000)
                                } else {
                                    $rootScope.$broadcast('srCount', data.dataCount);
                                    if (data.missingMinPriceFound) {
                                        $rootScope.$broadcast('srMinPriceFound')
                                    }
                                }
                                earUpdateCounter++
                            })
                        }
                    };

                    earUpdateTimer = setTimeout(updateEar, 2000);
                    earUpdateCounter = 0
                })
            }

            $scope.name = name;

            var locationPath = window.location.pathname;

            var params = $scope.searchParams; //filterParams.init();

            $scope.reload('init', params, true).then(function() {

                // Зарегистрируем обработчик, который будет реагировать на изменение статуса поля поиска
                $scope.$on('$locationChangeSuccess', function() {

                    var diff = searchParamsDiff.diff(prevSearch, $rootScope.searchParams);

                    $rootScope.$broadcast('$filtersChangeStart');

                    filterParams.set(diff);

                    /**
                     * Запускаем загрузку только если есть чего загружать,
                     * фильтр изменивший статус известен и не присутсвует в исключениях
                     */
                    if (! inProgress && diff && ! $scope.service.exceptions[diff])
                    {
                        inProgress = true;

                        /*
                         * diff == init означает не только то, что страница загружается первый раз,
                         * но и так же то, что могло измениться несколько фильтров.
                         *
                         * Поэтому нам нужно убедиться, что инит выполняется не просто так перед тем,
                         * как инициализировать параметры из кук..
                         */

                        var hashPresent = false;
                        for (var idx in $rootScope.searchParams) {
                            hashPresent = true;
                            break
                        }

                        params = (! hashPresent) ? $scope.searchParams /*filterParams.init()*/ : $rootScope.searchParams;

                        $scope.reload(diff, params).then(function() {
                            inProgress = false;

                            // копируем объект. Не ссылку!
                            prevSearch = jQuery.extend(true, {}, $rootScope.searchParams);
                            //$rootScope.$emit('loadComplete')

                            // После перезагрузки фильтров перезагрузим РП
                            $rootScope.$broadcast('$filtersChangeComplete', diff, $rootScope.searchParams)
                        });
                    }
                    else if (! inProgress && diff && $scope.service.exceptions[diff]) {
                        // копируем объект. Не ссылку!
                        prevSearch = jQuery.extend(true, {}, $rootScope.searchParams);

                        // после перезагрузки фильтров из списка исключений так же надо перезагрузить РП
                        $rootScope.$broadcast('$filtersChangeComplete', diff, $rootScope.searchParams)
                    }
                });

                inProgress = false;

                // уведомляем о том, что загрузка фильтров завершена и нужно заполнить рп
                // Первоначальная загрузка фильтров не должна (!) вызывать триггер "изменение фильтров завершено"
                //$rootScope.$broadcast('$filtersChangeComplete', 'init', $rootScope.searchParams)
                $rootScope.$broadcast('$filtersLoadComplete', $rootScope.searchParams);
                window.console.log('filters loaded');

                // копируем объект. Не ссылку!
                prevSearch = jQuery.extend(true, {}, $rootScope.searchParams);
                $rootScope.$broadcast('completeInit')
            });
        };

        $scope.resetData = function() {
            var departureCity = $rootScope.searchParams.ct;
            if (!isHotelPage()) {
                $rootScope.searchParams = new searchParams($scope.defaultSearchParams);
            } else {
                $rootScope.searchParams = new searchParams(window.searchParams);
            }
            $rootScope.searchParams.ct = departureCity;
            $scope.reload('init', $rootScope.searchParams);
        };

        /**
         * Обработка данных для уха пока захардкожена в классе фильтров потому что ухо является фильтром со своим шаблоном
         */

        var earUpdateTimer = null;
        var earUpdateCounter = 0;

        function isHotelPage() {
            return (window.location.href.indexOf('/hotel/') + 1);
        }

    }
]);

function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}