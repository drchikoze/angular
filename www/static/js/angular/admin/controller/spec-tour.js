(function() {
    angular
        .module('adminApp')
        .controller('specTourController', SpecTourController);

    SpecTourController.$inject = ['$scope', '$http'];

    function SpecTourController($scope, $http) {
        $scope.spec = {
            tour_id: null,
            old_price: null,
            new_price: null
        };

        $scope.tourInfo = {
            allocation_id: null,
            allocation: null,
            resort: null,
            country: null,
            resort_place: null,
            price: null
        };

        if (window.specData != undefined) {
            $scope.spec = window.specData;
            $scope.tourInfo = window.tourInfo;
        }

        $scope.loading = false;

        $scope.getTourInfo = function(tourId) {
            $scope.loading = true;
            $http({
                method: 'POST',
                url: '/admin/settings/spec_tours/get_tour',
                params: {'params': {tour_id: tourId}}
            }).success(function (data) {
                $scope.loading = false;

                if (data.status == 'ok') {
                    $scope.tourInfo = data.tourInfo;
                    $scope.spec.old_price = data.tourInfo.price;
                    $scope.spec.new_price = data.tourInfo.price;
                }

                if (data.status == 'error') {
                    $scope.tourInfo = {};
                    //alert(data.message);
                }
            });

        };

        $scope.onTourIdChanged = function() {
            console.log('changed' + $scope.spec.tour_id);
            $scope.getTourInfo($scope.spec.tour_id);
        };
    }
})();
