(function() {
    angular
        .module('adminApp')
        .controller('promoTourController', PromoTourController);

    PromoTourController.$inject = ['$scope', '$http'];

    function PromoTourController($scope, $http) {
        $scope.promo = {
            tour_id: null,
            min_price: null
        };

        $scope.tourInfo = {
            allocation_id: null,
            allocation: null,
            resort: null,
            country: null,
            resort_place: null,
            price: null
        };

        if (window.promoData != undefined) {
            $scope.promo = window.promoData;
            $scope.tourInfo = window.tourInfo;
        }

        $scope.loading = false;

        $scope.getTourInfo = function(tourId) {
            $scope.loading = true;
            $http({
                method: 'POST',
                url: '/admin/settings/promo_tours/get_tour',
                params: {'params': {tour_id: tourId}}
            }).success(function (data) {
                $scope.loading = false;

                if (data.status == 'ok') {
                    $scope.tourInfo = data.tourInfo;
                    $scope.promo.min_price = data.tourInfo.price;
                }

                if (data.status == 'error') {
                    $scope.tourInfo = {};
                    //alert(data.message);
                }
            });

        };

        $scope.onTourIdChanged = function() {
            console.log('changed' + $scope.promo.tour_id);
            $scope.getTourInfo($scope.promo.tour_id);
        };
    }
})();
