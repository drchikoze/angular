/**
 * Created by wolfh on 29.01.2016.
 */
angular.module('app').controller('countryBlocked', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.model = {
        country: 30
    };

    $scope.changeCountry = function () {
        $rootScope.searchParams.co = $scope.model.country;
        $rootScope.searchParams.al = '';
        $rootScope.searchParams.re = '';
        window.location.href = $rootScope.searchParams.getCurrentLink().replace('/hotel/', '/find/');
    }
}]);