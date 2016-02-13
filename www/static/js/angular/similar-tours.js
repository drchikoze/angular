angular.module('search').controller('similarToursCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    $scope.data = '';
    $scope.url = '';

    var searchParams = $rootScope.searchParams;
    var queries = [];
    var timers = {};

    $scope.init = function(dataUrl) {
        $scope.url = dataUrl;
    };

    $scope.load = function() {
        if (!$.isEmptyObject(timers)) {
            angular.forEach(timers, function (params, key) {
                delete timers[key];
            });
            queries = [];
        }
        searchParams = $rootScope.searchParams;
        $http.get($scope.url + '?' + searchParams.getSearchQueryString())
                .success(function (data) {
                    if (data.status == 'ok') {
                        queries = data.queries ? data.queries : [];
                        delete data.status;
                        delete data.queries;
                        $scope.data = data;
                        angular.forEach(queries, function (key, index) {
                            timers[key] = setTimeout(function() {
                                checkStatus(key);
                            }, 5000);
                        });
                    }
                });
    };

    function checkStatus(key) {
        $http.get('/search/search_status?searchKey=' + key + '&script=similar-tours').then(function (response) {
            if (!timers.hasOwnProperty(key)) {
                return; // Устаревший запрос, только что вернулся
            }
            if (!response.data.complete) {
                timers[key] = setTimeout(function() {
                    checkStatus(key);
                }, 5000);
            } else {
                delete timers[key];
                if ($.isEmptyObject(timers)) {
                    reload();
                }
            }
        }, function () {
            if (!timers.hasOwnProperty(key)) {
                return; // Устаревший запрос, только что вернулся
            } else {
                delete timers[key];
            }
            if ($.isEmptyObject(timers)) {
                reload();
            }
        });
    }

    function reload() {
        $http.get($scope.url + '?' + searchParams.getSearchQueryString() + '&' + $.param({queries: queries}))
            .success(function (data) {
                if (data.status == 'ok') {
                    delete data.status;
                    $scope.data = data;
                    window.console.info('All similar tours loaded');
                }
            });
    }

    $rootScope.$on('$srNeedToUpdate', function() {
        $scope.load();
    });
}]);
