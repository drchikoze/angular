/**
 * Created by wolfh on 28.01.2016.
 */
angular.module('app').directive('minPriceSearch', ['$http', '$rootScope', function($http, $rootScope) {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: function (elem, attr) {
                return attr.hasOwnProperty('template') ? attr.template : 'min-price-search.html';
            },
            controller: function ($scope, $element, $attrs, $transclude, $location) {
                var searchParams = angular.copy($rootScope.searchParams);
                var url = '/search/min_price';
                var count = 0;
                searchParams.al = '';
                searchParams.re = '';
                searchParams.co = $attrs.country;

                $scope.complete = false;
                $scope.minPrice = null;
                $scope.searchLink = searchParams.getCurrentLink().replace('/hotel/', '/find/');

                load();

                function load() {
                    $http.get(url + '?' + $.param(searchParams.getSearchQueryArray())).then(function (response) {
                        searchParams.tc = response.data.count;
                        searchParams.sk = response.data.searchKey;
                        $scope.minPrice = response.data.minPrice;
                        $scope.searchLink = searchParams.getCurrentLink().replace('/hotel/', '/find/') + '?gsk=' + searchParams.sk;

                        if (!$scope.complete) {
                            setTimeout(function () {
                                check();
                            }, 1000);
                        }
                    }, function () {
                        // fail
                    });
                }

                function check() {
                    if (!searchParams.sk) {
                        return; // Если нет ключа - нечего искать
                    }
                    $http.get('/search/search_status?searchKey=' + searchParams.sk + '&script=min-price-search').then(function (response) {
                        if (response.data.status = 'ok') {
                            $scope.complete = response.data.complete;
                            if (response.data.count > searchParams.tc) {
                                searchParams.tc = response.data.count;
                                load();
                            } else if (!$scope.complete) {
                                setTimeout(function () {
                                    check();
                                }, 1000);
                            }
                        }
                    }, function () {
                        // fail
                    });
                }
            }
        };
    }]);