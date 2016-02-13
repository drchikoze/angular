/**
 * Created by vasilij on 15.08.15.
 */

angular.module('search').directive('globalSearch', [function() {
    return {
        restrict: 'A',
        controller: function($scope) {
            $scope.convertReceivedTourList = function (oldAllocationList, allocationList, duration) {
                var j, tourInfo, date;
                var oldAllocationListMap = getAllocationListMap(oldAllocationList);

                for (var i in allocationList) {
                    if (!allocationList.hasOwnProperty(i)) {
                        return;
                    }
                    var allocation = allocationList[i];
                    var allocationId = allocation.allocation_id;
                    if (typeof oldAllocationListMap[allocationId] == "undefined") {
                        var insertedAllocation = angular.copy(allocation);
                        insertedAllocation.tourDateList = [];
                        insertedAllocation.tourDateList[duration] = [];
                        for (j in allocation.tourDateList) {
                            if (!allocation.tourDateList.hasOwnProperty(j)) {
                                continue;
                            }
                            insertedAllocation.tourDateList[duration].push(allocation.tourDateList[j]);
                        }
                        if (typeof insertedAllocation['hotelLinksByDuration'] == 'undefined') {
                            insertedAllocation['hotelLinksByDuration'] = [];
                        }
                        insertedAllocation['hotelLinksByDuration'][duration] = insertedAllocation.hotelSearchLink;
                        oldAllocationList.push(insertedAllocation);
                    } else {
                        var oldAllocationIndex = oldAllocationListMap[allocationId];
                        if (!oldAllocationList.hasOwnProperty(oldAllocationIndex)) {
                            continue;
                        }
                        var oldAllocation = oldAllocationList[oldAllocationIndex];
                        if (typeof oldAllocation.tourDateList[duration] == "undefined") {
                            oldAllocation.tourDateList[duration] = [];
                            for (j in allocation.tourDateList) {
                                if (!allocation.tourDateList.hasOwnProperty(j)) {
                                    continue;
                                }
                                oldAllocation.tourDateList[duration].push(allocation.tourDateList[j]);
                            }
                        } else {
                            oldAllocation.tourDateList[duration] = collectTourListByDuration(oldAllocation.tourDateList[duration], allocation.tourDateList);
                        }
                        if (typeof oldAllocation['hotelLinksByDuration'] == 'undefined') {
                            oldAllocation['hotelLinksByDuration'] = [];
                        }
                        oldAllocation['hotelLinksByDuration'][duration] = allocation.hotelSearchLink;
                    }
                }
                oldAllocationList = getSortedTourLists(oldAllocationList);
                $scope.data.allocationCount = oldAllocationList.length;
                return $scope.sortAllocationList(oldAllocationList, duration);
            };

            function getSortedTourLists(allocationList) {
                return allocationList.map(function(allocationInfo) {
                    for (var duration in allocationInfo.tourDateList) {
                        if (!allocationInfo.tourDateList.hasOwnProperty(duration)) {
                            continue;
                        }

                        allocationInfo.tourDateList[duration] = allocationInfo.tourDateList[duration].sort(function(tourInfo1, tourInfo2) {
                            return tourInfo1.date >= tourInfo2.date ? 1 : -1;
                        });
                    }
                    return allocationInfo;
                });
            }



            $scope.getAvailableDuration = function(allocation, date) {
                if (typeof allocation == "undefined") {
                    return [];
                }
                var result = [];
                var duration;
                if (typeof date != "undefined") {
                    for (duration in allocation.tourDateList) {
                        var tourDateList = allocation.tourDateList[duration];
                        for (var i in tourDateList) {
                            if (tourDateList.hasOwnProperty(i) && tourDateList[i].date == date && !(result.indexOf(parseInt(duration)) + 1)) {
                                result.push(parseInt(duration));
                            }
                        }
                    }
                } else {
                    for (duration in allocation.tourDateList) {
                        if (typeof allocation.tourDateList[duration] != "undefined") {
                            result.push(parseInt(duration));
                        }
                    }
                }
                return result.sort(function(a, b) {return a - b; })
            };

            function collectTourListByDuration(oldTourList, newTourList) {
                var oldTourListMap = getTourDateListMap(oldTourList);
                for (var index in newTourList) {
                    if (!newTourList.hasOwnProperty(index)) {
                        return;
                    }
                    var newTour = newTourList[index];
                    var date = newTour.date;
                    if ((typeof oldTourListMap[date] == "undefined") || (oldTourList[oldTourListMap[date]].priceRu > newTour.priceRu)){
                        oldTourList.push(angular.copy(newTour));
                    } else {
                        oldTourList[oldTourListMap[date]].toursCount = newTour.toursCount;
                    }
                }
                return oldTourList;
            }

            function getAllocationListMap(allocationList) {
                var map = {};
                for (var i in allocationList) {
                    if (allocationList.hasOwnProperty(i)) {
                        var allocation = allocationList[i];
                        map[allocation.allocation_id] = i;
                    }
                }
                return map;
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

            $scope.isAvailableResult = function() {
                return $scope.availableDuration.indexOf($scope.currentSearchDuration) + 1;
            };

            $scope.isSearchComplete = function() {
                for (var duration in $scope.completeSearch) {
                    if ($scope.completeSearch.hasOwnProperty(duration) && !$scope.completeSearch[duration]) {
                        return false;
                    }
                }
                return true;
            };

            $scope.isEmptyResult = function() {
                for (var i in $scope.items) {
                    if (!$scope.items.hasOwnProperty(i)) {
                        continue;
                    }
                    var allocation = $scope.items[i];
                    var tourDateListWithFixDuration = allocation.tourDateList[$scope.selectedDuration];
                    if (typeof tourDateListWithFixDuration != "undefined" && tourDateListWithFixDuration != []) {
                        return false;
                    }
                }
                return true;
            };

            $scope.getPriceDifference = function(allocation, selectedDuration, selectedDepartureDate) {
                var classMapList = {};
                for (var duration in allocation.tourDateList) {
                    if (!allocation.tourDateList.hasOwnProperty(duration)) {
                        continue;
                    }

                    classMapList[duration] = getTourDateListMap(allocation.tourDateList[duration]);
                }
                var selectedTourDateList = allocation.tourDateList[selectedDuration];
                if ((typeof allocation.tourDateList[selectedDuration] == "undefined") ||
                    (typeof classMapList[selectedDuration][selectedDepartureDate] == "undefined")){
                    return [];
                }
                var selectedTourIndex = classMapList[selectedDuration][selectedDepartureDate];
                var selectedPrice = allocation.tourDateList[selectedDuration][selectedTourIndex].priceRu;
                var result = {};
                for (duration in allocation.tourDateList) {
                    if (!allocation.tourDateList.hasOwnProperty(duration)) {
                        continue;
                    }
                    var tourDateListWithFixDuration = allocation.tourDateList[duration];
                    for (var index in tourDateListWithFixDuration) {
                        if (!tourDateListWithFixDuration.hasOwnProperty(index)) {
                            continue;
                        }
                        var currentTour = tourDateListWithFixDuration[index];
                        if (typeof result[currentTour.date] == "undefined") {
                            result[currentTour.date] = {};
                        }
                        result[currentTour.date][duration] = {};
                        result[currentTour.date][duration].deltaPrice = currentTour.priceRu - selectedPrice;
                        result[currentTour.date][duration].fullPrice = currentTour.priceRu;
                        result[currentTour.date][duration].id = currentTour.tourId;
                    }
                }
                return result;
            };

            $scope.getAllocationCountByDuration = function(duration) {
                var allocationCount = 0;
                for (var i in $scope.items) {
                    if (!$scope.items.hasOwnProperty(i)) {
                        continue;
                    }
                    var allocation = $scope.items[i];
                    if (typeof allocation.tourDateList[duration] != "undefined") {
                        allocationCount++;
                    }
                }
                return allocationCount;
            };

            $scope.getAllItemsCount = function() {
                var allItemsCount = 0;
                for (var i in $scope.toursFullCountByDuration) {
                    if (!$scope.toursFullCountByDuration.hasOwnProperty(i)) {
                        continue;
                    }
                    allItemsCount += $scope.toursFullCountByDuration[i];
                }
                return allItemsCount;
            }

            $scope.clearLastSearch = function() {}
        }
    }
}]);
