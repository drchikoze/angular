/**
 * Created by vasilij on 15.08.15.
 */

angular.module('search').directive('hotelSearch', ['$rootScope', '$http', function($rootScope, $http) {
    return {
        restrict: 'A',
        controller: function($scope) {
            $scope.countTourShown = {};
            $scope.needToggleFullInfo = isNeedToggleHotelInfo();
            // Повторная проверка после применения всех стилей
            $(document).ready(function() {
                $scope.needToggleFullInfo = isNeedToggleHotelInfo();
            });
            $scope.allPastTravellersCount = -1;

            $scope.convertReceivedTourList = function (oldItems, newAllocationItems) {
                for (var i in newAllocationItems) {
                    if (!newAllocationItems.hasOwnProperty(i)) {
                        return;
                    }
                    var allocation = newAllocationItems[i];
                    var sortedTourList = sortItems(allocation.tourDateList, $scope.currentSearchParams);
                    $scope.toursWithoutOperatorsFilter = appendTours($scope.toursWithoutOperatorsFilter, sortedTourList.toursWithoutOperatorsFilter);
                    $scope.toursWithoutMealFilter = appendTours($scope.toursWithoutMealFilter, sortedTourList.toursWithoutMealFilter);
                    $scope.toursWithoutOperatorsAndMealFilter = appendTours($scope.toursWithoutOperatorsAndMealFilter, sortedTourList.toursWithoutOperatorsAndMealFilter);
                    oldItems = appendTours(oldItems, sortedTourList.requiredTours);
                }
                $scope.toursCountByDuration[0] = oldItems.length;
                return oldItems;
            };

            function getTourListMap(tourList) {
                var result = {};
                for (var i in tourList) {
                    if (tourList.hasOwnProperty(i)) {
                        var tourInfo = tourList[i];
                        result[tourInfo.tourId] = i;
                    }
                }
                return result;
            }

            $scope.isSearchComplete = function() {
                return $scope.completeSearch[0];
            };

            $scope.isEmptyResult = function() {
                return typeof $scope.items == "undefined" || !isArray($scope.items) || $scope.items.length == 0;
            };

            $scope.isAvailableResult = function() {
                return isArray($scope.availableDuration) && !!$scope.availableDuration.length;
            };

            $scope.showMoreTours = function(source) {
                $scope.countTourShown[source] += 1000;
            };

            $scope.searchWithoutSubAgent = function() {
                $('#hide-subagents').click();
            };

            $scope.checkFlag = function(flags, flag) {
                return !angular.isString(flags) ? false : flags.split(',').indexOf(flag.toString()) != -1;
            };

            function isNeedToggleHotelInfo() {
                var elem1List = document.getElementsByClassName('hp-about');
                if (!elem1List.length) {
                    return false;
                }
                var outerDescriptionBlock = elem1List[0];
                var elem2List = document.getElementsByClassName('hp-about-txt');
                if (!elem2List.length) {
                    return false;
                }
                var innerDescriptionBlock = elem2List[0];
                return innerDescriptionBlock.clientHeight > outerDescriptionBlock.clientHeight;
            }

            function sortItems(newItems, searchParams) {
                var toursWithoutOperatorsFilter = [],
                    toursWithoutMealFilter = [],
                    toursWithoutOperatorsAndMealFilter = [],
                    requiredTours = [],
                    selectedOperatorList = searchParams.op,
                    selectedMeal = searchParams.me;
                for (var i in newItems) {
                    if (!newItems.hasOwnProperty(i)) {
                        continue;
                    }
                    var item = newItems[i],
                        currentOperator = item.operatorId,
                        currentMeal = item.mealId;
                    if (isRequiredMeal(currentMeal, selectedMeal) && isRequiredOperator(currentOperator, selectedOperatorList)) {
                        requiredTours.push(item);
                    } else if (!isRequiredMeal(currentMeal, selectedMeal) && isRequiredOperator(currentOperator, selectedOperatorList)) {
                        toursWithoutMealFilter.push(item);
                    } else if (isRequiredMeal(currentMeal, selectedMeal) && !isRequiredOperator(currentOperator, selectedOperatorList)) {
                        toursWithoutOperatorsFilter.push(item);
                    } else {
                        toursWithoutOperatorsAndMealFilter.push(item);
                    }
                }
                return {
                    toursWithoutOperatorsFilter: toursWithoutOperatorsFilter,
                    toursWithoutMealFilter: toursWithoutMealFilter,
                    toursWithoutOperatorsAndMealFilter: toursWithoutOperatorsAndMealFilter,
                    requiredTours: requiredTours
                };
            }

            function isRequiredMeal(currentMeal, selectedMeal) {
                return selectedMeal == currentMeal || typeof selectedMeal == 'undefined' || selectedMeal == null || selectedMeal == '';
            }

            function isRequiredOperator(currentOperator, selectedOperatorList) {
                if (isArray(selectedOperatorList)) {
                    selectedOperatorList.forEach(function(item, i, arr) {
                        arr[i] = parseInt(item);
                    });
                }
                var zz = selectedOperatorList.indexOf(currentOperator);
                return (selectedOperatorList.indexOf(currentOperator) + 1) || (isArray(selectedOperatorList) && selectedOperatorList.length == 0) || typeof currentOperator == 'undefined';
            }

            function appendTours(oldTours, newTours) {
                var oldToursMap = getTourListMap(oldTours);
                for (var i in newTours) {
                    if (!newTours.hasOwnProperty(i)) {
                        continue;
                    }

                    var newTour = newTours[i],
                        oldTourIndex = oldToursMap[newTour.tourId];
                    if (typeof oldTourIndex == 'undefined') {
                        oldTours.push(newTour);
                    } else {
                        oldTours[oldTourIndex] = newTour;
                    }
                }
                return oldTours.sort(function(tour1, tour2) {
                    return tour1.priceRu > tour2.priceRu ? 1 : -1;
                })
            }

            $scope.clearLastSearch = function() {
                var FIRST_ITEMS_LIMIT = 5;
                $scope.countTourShown.items = FIRST_ITEMS_LIMIT;
                $scope.countTourShown.toursWithoutOperatorsFilter = FIRST_ITEMS_LIMIT;
                $scope.countTourShown.toursWithoutMealFilter = FIRST_ITEMS_LIMIT;
                $scope.countTourShown.toursWithoutOperatorsAndMealFilter = FIRST_ITEMS_LIMIT;
                $scope.toursWithoutOperatorsFilter = [];
                $scope.toursWithoutMealFilter = [];
                $scope.toursWithoutOperatorsAndMealFilter = [];
            };
            $scope.clearLastSearch();

            $scope.loadFromCache = function(searchKey, searchParams, doNotMarkAsLoaded) {
                var arrSearchParams = searchParams.getSearchQueryArray();
                arrSearchParams.sk = searchKey;
                arrSearchParams.tc = 100;
                (function() { $http({
                    method: 'GET',
                    url: '/hiddenhotel/tours_data',
                    params: arrSearchParams
                }).success(function (data) {
                    console.log('Tour list loaded from cache');

                    data = $scope.decodeParams(data, $scope.classMap);
                    $scope.toursCountByDuration[0] = data.count;
                    $scope.toursFullCountByDuration[0] = data.fullCount;
                    if (data.duration) {
                        $scope.convertReceivedTourList($scope.items, data.items, data.duration);
                        if ($scope.items.length) {
                            $scope.availableDuration.push(parseInt(data.duration));
                        }
                    }
                    if (doNotMarkAsLoaded) {
                        $scope.cacheLoadedForParams = null;
                    } else {
                        $scope.cacheLoadedForParams = angular.copy(searchParams);
                    }
                }) })();
            };

            $scope.loadFromArray = function(data, count, duration, searchParams, doNotMarkAsLoaded) {
                $scope.toursCountByDuration[0] = count;
                $scope.toursFullCountByDuration[0] = count;
                $scope.convertReceivedTourList($scope.items, data, duration);
                if ($scope.items.length) {
                    $scope.availableDuration.push(parseInt(duration));
                }
                if (doNotMarkAsLoaded) {
                    $scope.cacheLoadedForParams = null;
                } else {
                    $scope.cacheLoadedForParams = angular.copy(searchParams);
                }
                console.log(count + ' tours loaded from array');
            };

            if (typeof window.globalSearchKey != 'undefined') {
                $scope.loadFromCache(window.globalSearchKey, $rootScope.searchParams);
            }

            $scope.getAllItemsCount = function() {
                var allItemsCount = 0;
                for (var i in $scope.toursFullCountByDuration) {
                    if (!$scope.toursFullCountByDuration.hasOwnProperty(i)) {
                        continue;
                    }
                    allItemsCount += $scope.toursFullCountByDuration[i];
                }
                return allItemsCount;
            };

            $scope.initLastTouristList = function(allocationId) {
                $http({
                    method: 'GET',
                    url: '/hiddenhotel/get_past_traveller',
                    params: {allocation_id: allocationId}
                }).success(function (data) {
                    if (data.status == 'ok') {
                        $scope.allPastTravellersCount = data.count;
                        $scope.pastTravellers = data.items;
                    }
                })
            };

            $scope.initLastTouristList($rootScope.searchParams.al[0]);
        }
    }
}]);