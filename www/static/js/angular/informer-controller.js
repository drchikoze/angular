angular.module('filters').filter('plural', function () {
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

        return moment(date).format(format ? format : 'DD MMM YYYY');
    };
}).controller('informer', function ($scope, $rootScope) {
    $rootScope.isIndexPage = true;
    $scope.model = {
        adults: 2,
        children: 0,
        childAge1: null,
        childAge2: null,
        start: moment($rootScope.searchParams.df, "DD-MM-YYYY").toDate(),
        end: moment($rootScope.searchParams.df, "DD-MM-YYYY").toDate()
    };
    $scope.showDate = false;
    $scope.showSize = false;
    $scope.sizes = {};
    $scope.list = {
        allocation: window.allocationList
    };

    $scope.init = function () {
        if (window.addEventListener) {
            window.addEventListener("message", listener, false);
        } else {
            window.attachEvent("onmessage", listener);
        }

        function listener(e) {
            $scope.$apply(function () {
                switch (e.data) {
                    case 'blur':
                        $rootScope.$broadcast('closeOther', 1, null);
                        break;
                }
            });
        }

        $(document).ready(function () {
            if (window.allocationList.length == 1) {
                window.top.postMessage('oneAllocation', window.top.location.href);
            }

            $('.ls-hbr-widget').click(function () {
                window.top.postMessage('focus', window.top.location.href);
            });
        });

        $scope.$watch('service.room_size', function (newVal) {
            if (!newVal) {
                return;
            }
            $scope.sizes = {};
            angular.forEach(newVal, function (obj) {
                var children = parseInt(obj.children);
                if (!$scope.sizes.hasOwnProperty(obj.adults)) {
                    $scope.sizes[obj.adults] = {};
                }
                if (!$scope.sizes[obj.adults].hasOwnProperty(obj.children)) {
                    $scope.sizes[obj.adults][obj.children] = obj.id;
                }
            });
            if (!$scope.childrenAvailable($scope.model.children)) {
                $scope.model.children = 0;
            }
            if (!$scope.adultsAvailable($scope.model.adults)) {
                if ($.isEmptyObject($scope.sizes)) {
                    $scope.model.adults = 2;
                } else {
                    $scope.model.adults = Object.keys($scope.sizes)[0];
                }
            }
        }, true);
    };

    $scope.calendar = function () {
        var previous = $scope.model.start;
        var current = $scope.model.start;
        var range = false;
        var self = this;
        var calendar = $('.hbr-widget-datepicker-holder');

        // Подключаем календарик
        calendar.datepicker({
            minDate: 0,
            prevText: 'M',
            nextText: 'M',
            numberOfMonths: 1,
            navigationAsDateFormat: true,
            beforeShowDay: function (date) {
                var className = (date.getTime() >= Math.min(previous, current) && date.getTime() <= Math.max(previous, current)) ? 'date-range-selected' : '';
                if ((className !== '') && (date.getTime() === Math.min(previous, current) && date.getTime() < Math.max(previous, current))) {
                    className += ' date-range-start';
                }

                if ((className !== '') && (date.getTime() > Math.min(previous, current) && date.getTime() === Math.max(previous, current))) {
                    className += ' date-range-end';
                }
                return [true, className];
            },
            onSelect: function (dateText, inst) {
                var newDate = new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay);
                previous = current;
                current = newDate;

                var fromDate = new Date(Math.min(previous, current));
                var toDate = new Date(Math.max(previous, current));

                $scope.$apply(function () {
                    if ($scope.model.start.getTime() != fromDate.getTime()) {
                        $scope.model.start = fromDate;
                        //$rootScope.searchParams.df = moment(new Date($scope.model.start)).format("DD-MM-YYYY");
                        $rootScope.searchParams.setValue('df', moment(new Date($scope.model.start)).format("DD-MM-YYYY"));
                    }
                    if ($scope.model.end.getTime() != toDate.getTime()) {
                        $scope.model.end = toDate;
                        //$rootScope.searchParams.dt = moment(new Date($scope.model.end)).format("DD-MM-YYYY");
                        $rootScope.searchParams.setValue('dt', moment(new Date($scope.model.end)).format("DD-MM-YYYY"));
                    }
                    $rootScope.searchParams.setUrl(true);
                });
            }
        }).datepicker('setDate', current);
    };

    $scope.adultsAvailable = function (adults) {
        return $scope.sizes.hasOwnProperty(adults);
    };

    $scope.childrenAvailable = function (children) {
        return children == 0 ? true : $scope.sizes.hasOwnProperty($scope.model.adults) && $scope.sizes[$scope.model.adults].hasOwnProperty(children);
    };

    $scope.sendForm = function () {
        var size = 14;
        if (!$rootScope.searchParams.al) {
            angular.element('.hbr-widget-inp-allocation').scope().displaySelectPopup();
            return;
        }
        if ($scope.sizes.hasOwnProperty($scope.model.adults) && $scope.sizes[$scope.model.adults].hasOwnProperty($scope.model.children)) {
            size = $scope.sizes[$scope.model.adults][$scope.model.children];
        }
        $scope.link = '/hotel/' + $rootScope.searchParams.ct
            + '/al' + $rootScope.searchParams.al
            + '/details'
            + '/' + $rootScope.searchParams.df.replace(/-/g, '.')
            + '/' + $rootScope.searchParams.nf
            + '/' + size
            + ':' + ($scope.model.childAge1 === null ? 0 : $scope.model.childAge1)
            + ',' + ($scope.model.childAge2 === null ? 0 : $scope.model.childAge2)
            + '?informer';

        window.top.postMessage('popup:' + $scope.link, window.top.location.href);
    };

    $scope.openPopup = function (id) {
        if (id == 'dates') {
            $scope.showDate = !$scope.showDate;
        } else if (id == 'sizes') {
            $scope.showSize = !$scope.showSize;
        }
        $rootScope.$broadcast('closeOther', 1, id);
    };

    $rootScope.$on('closeOther', function (e, level, self) {
        if (1 == level && 'dates' != self) {
            $scope.showDate = false;
        }
        if (1 == level && 'sizes' != self) {
            $scope.showSize = false;
        }
    });
});

//moment.locale('ru');
