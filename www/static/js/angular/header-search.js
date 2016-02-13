angular.module('header-search', [])
.controller('search-ctrl', ['$scope', '$http', '$timeout', '$rootScope', function ($scope, $http, $timeout, $rootScope) {
        $scope.header_search = '';
        $scope.searchResult = {
            'tourResultItems': [],
            'resortResultItems': [],
            'hotelResultItems': [],
            'countryResultItems': [],
            'count': 0
        };
        $scope.itemTypes = ['tour', 'country', 'resort', 'hotel'];
        $scope.selectedItem = {
            'type': 0,
            'index': -1
        };
        $scope.showResult = false;
        $scope.timer = null;
        $scope.submit = function() {
            $http({
                method: 'POST',
                url: '/utils/similarity', params: {name: $scope.header_search}
            }).success(function(data) {
                if (data.status == 'ok') {
                    $scope.searchResult = data.data;
                    $scope.showResult = true;
                    $scope.selectedItem = {
                        'type': 0,
                        'index': -1
                    };
                }
            });

            $('#header-search-input').focus();
        };

        $scope.selectHeadVariant = function(index, type) {
            $scope.selectedItem.index = index;
            $scope.selectedItem.type = $scope.itemTypes.indexOf(type);
        };

        $rootScope.$on('$bodyClick', function() {
           $scope.showResult = false;
        });

        $scope.$watch('header_search', function() {
            if ($scope.timer != null) {
                $timeout.cancel($scope.timer);
            }
            $scope.showResult = false;
            if ($scope.header_search.length > 2) {
                $scope.timer = $timeout(
                    function() {
                        $scope.submit();
                    }, 1000);
            }
        });

        $scope.getNextItemType = function(inverse) {
            if (!$scope.searchResult.count) {
                return 0;
            }
            var itemTypeCount = $scope.itemTypes.length;
            var nextItemTypeIndex = $scope.selectedItem.type;
            do {
                if (inverse) {
                    nextItemTypeIndex = (nextItemTypeIndex - 1 + itemTypeCount) % itemTypeCount;
                } else {
                    nextItemTypeIndex = (nextItemTypeIndex + 1) % itemTypeCount;
                }
                var nextItemType = $scope.itemTypes[nextItemTypeIndex] + 'ResultItems';
            } while (!$scope.searchResult[nextItemType].length);

            return nextItemTypeIndex;
        };

        $scope.selectPrevItem = function() {
            if (!$scope.searchResult.count) {
                return;
            }

            var nextIndex = $scope.selectedItem.index - 1;
            if (nextIndex >= 0) {
                $scope.selectedItem.index = nextIndex;
                return;
            }
            $scope.selectedItem.type = $scope.getNextItemType(true);
            var currentType = $scope.itemTypes[$scope.selectedItem.type] + 'ResultItems';
            $scope.selectedItem.index = $scope.searchResult[currentType].length - 1;
        };

        $scope.selectNextItem = function() {
            if (!$scope.searchResult.count) {
                return;
            }

            var nextIndex = $scope.selectedItem.index + 1;
            var currentType = $scope.itemTypes[$scope.selectedItem.type] + 'ResultItems';
            if (nextIndex < $scope.searchResult[currentType].length) {
                $scope.selectedItem.index = nextIndex;
                return;
            }
            $scope.selectedItem.type = $scope.getNextItemType(false);
            $scope.selectedItem.index = 0;
        };

        $scope.close = function() {
            $scope.showResult = false;
        };

        $scope.submits = function() {
            var index = $scope.selectedItem.index;
            var currentType = $scope.itemTypes[$scope.selectedItem.type] + 'ResultItems';
            if ($scope.searchResult[currentType] && $scope.searchResult[currentType][index]) {
                document.location.href = $scope.searchResult[currentType][index].link;
            }
        };
}]);