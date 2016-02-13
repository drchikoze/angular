angular.module('filters').controller('loadSearchResultController', ['$scope', '$location', '$rootScope', '$timeout', function($scope, $location, $rootScope, $timeout) {

    $scope.buildQs = function(exclude) {
        exclude = (exclude instanceof Array)? exclude : [];
        var query_data = $rootScope.searchParams;
        var query_arr = [];
        for (var idx in query_data) {
            if (query_data.hasOwnProperty(idx) && exclude.indexOf(idx) == -1){
                query_arr.push(idx + '=' + query_data[idx])
            }
        }
        return '?' + query_arr.join('&')
    };

    $scope.getSearchQueryString = function() {
        return $rootScope.getSearchQueryString();
    };


    $scope.buildQsFromObj = function(exclude, query_data) {
        exclude = (exclude instanceof Array) ? exclude : [];
        query_data = (query_data instanceof Object) ? query_data : [];

        var query_arr = [];
        for (var idx in query_data) {
            if (query_data.hasOwnProperty(idx) && exclude.indexOf(idx) == -1){
                query_arr.push(idx + '=' + query_data[idx])
            }
        }
        return '?' + query_arr.join('&')
    };

    $scope.loadData = function() {
        // фейлбек
        if (typeof loadData != "undefined") {
            loadData($scope.buildQs());
        }

        var checkRoomSizeRequired = function() {
            var data = $rootScope.searchParams;

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

            if (data['rs'] != undefined && roomSizes[parseInt(data['rs'])] != undefined) {
                var childs = roomSizes[parseInt(data['rs'])].children;
                if (!childs) {
                    if (angular.element('.filter-toggle-small-screen').size()) {
                        angular.element('.filter-toggle-small-screen').click();
                    }
                    return true;
                }
                $('.js-roomsize-required').text(childs > 1 ? 'Укажите возраста детей' : 'Укажите возраст ребенка');
                if ((!data['ch1'] && data['ch1'] !== 0) || data['ch1'] == -1) {
                    $('.js-roomsize-required').show();
                    return false;
                }
                if (childs > 1 && ((!data['ch2'] && data['ch2'] !== 0) || data['ch2'] == -1)) {
                    return false;
                }
            }

            $('.js-roomsize-required').hide();

            if (angular.element('.filter-toggle-small-screen').size()) {
                angular.element('.filter-toggle-small-screen').click();
            }
            return true;
        };

        if (!checkRoomSizeRequired()) {
            return;
        }

        $rootScope.$broadcast('$srNeedToUpdate');
        if (angular.element('body').outerWidth() < 1260 && angular.element('#search-results').size()) {
            $timeout(function() {
                angular.element('html, body').animate({
                    scrollTop: angular.element("#search-results").offset().top
                }, 600);
            }, 0);
        }

    };

    $scope.go = function(prefix, isNewWindow, hash) {

        /**
         * наличие параметра фильтра params2=newwin - для открытия в новом окне
         * пока работает только при вызове из /search/chooser
         */
        var params2 = $rootScope.searchParams['params2'];

        var location = prefix + (hash === false ? '' : '#') + $scope.buildQs();
        if (isNewWindow === true || (top.window.location.pathname == '/search/chooser' && params2 != undefined && params2.indexOf('newwin') >= 0)) {
            top.window.open(location)
        } else {
            top.location.href = location
        }
    }
}]);