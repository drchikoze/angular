/**
 * Created by AleX on 06.07.2015.
 */
angular.module('app').controller('best_price', ['$scope', function($scope) {

    $scope.delta = 2315;
    $scope.panteon = 2332;

    $scope.currentOperator = $scope.panteon;
    $scope.tours = window.tours[$scope.currentOperator];
    $scope.minDates = window.minDate;
    $scope.maxDates = window.maxDate;
    $scope.allocations = window.allocations;
    $scope.search = {departure:''};



    $scope.changeCurrentOperator = function () {
        $scope.tours = window.tours[$scope.currentOperator];
    };

    //$scope.dateList['Все даты'] = '';

    $scope.getNumber = function(num) {
        if(isNaN(num)) {
            return new Array(0);
        }
        return new Array(num);
    };

    $scope.resetDate = function() {
        $scope.search.date = '';
    };

    $scope.showNextDatePicker = function() {
        var elem = $('#date-box').find('.datepicker-inp').eq(0);
        elem.addClass('datepicker-open');
        elem.datepicker('option', {
            onClose: function() {
                elem.removeClass('datepicker-open');
            }
        });
        elem.datepicker('show');
    };

}]);