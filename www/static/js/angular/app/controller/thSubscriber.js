(function(){
    // TODO: _TB_APP_MODULE - костыль тк сейчас есть куча лишних app-ов
    angular
        .module(typeof _TB_APP_MODULE !== 'undefined' ? _TB_APP_MODULE : 'app')
        .controller('thSubscriberController',  thSubscriberController);

    thSubscriberController.$inject = ['$rootScope', '$scope',  '$http'];

    function thSubscriberController($rootScope, $scope, $http) {
        $scope.hasThDiscount = false;

        $scope.hotelSubscribeOptions = {'news': true, 'actions': true};
        $scope.thSubscriber = null;
        $scope.thCommunityUrl = null;
        $scope.pageData = null;


        $scope.setSubscriber = function(subscriber) {
            $scope.thSubscriber = subscriber;
            if (!$rootScope.userDiscount || subscriber && $rootScope.userDiscount < subscriber.discount) {
                $rootScope.userDiscount = subscriber ? subscriber.discount : null;
            }
        };

        $scope.getPageData = function() {
            return window.hotelPageData != undefined ? window.hotelPageData : window.jsData;
        };

        // init
        $scope.initData = function() {
            $scope.pageData = $scope.getPageData();
            if (!$scope.pageData) {
                return;
            }

            $scope.hasThDiscount = $scope.pageData.hasThDiscount;

            if ($scope.pageData.thCommunityUrl != undefined) {
                $scope.thCommunityUrl = $scope.pageData.thCommunityUrl;
            }

            if ($scope.pageData.thSubscriber != undefined) {
                $scope.setSubscriber($scope.pageData.thSubscriber)
            }

        }();

        $scope.closeHotelSubscribe = function() {
            $('.js-hotelsubscribe-modal').hide();
        };

        $scope.openHotelSubscribe = function() {
            $('.js-hotelsubscribe-modal').show();
        };

        $rootScope.$on('userLogin', function(event, user) {
            $scope.checkUserStatus(user.id);
        });

        $rootScope.$on('userLogout', function() {
            $scope.setSubscriber(null);
        });

        $rootScope.$on('userRegistered', function(event, user) {
            $scope.checkUserStatus(user.id);
        });

        $scope.checkUserStatus = function(userId) {
            var requestParams = {
                allocation_id: $scope.pageData.allocationId,
                user_id: userId
            };

            $http({
                method: 'POST',
                url: '/th_hotel/check_user_status',
                params: {params: requestParams}
            }).success(function(data) {
                if (data.status == 'ok' && data.subscriber != undefined) {
                    $scope.setSubscriber(data.subscriber);
                }

                if (data.status == 'error') {
                    alert(data.message);
                }
            });

        };

        $scope.submitHotelSubscribe = function() {
            var requestParams = {
                allocation_id: $scope.pageData.allocationId
            };

            $http({
                method: 'POST',
                url: '/th_hotel/subscribe',
                params: {params: requestParams}
            }).success(function(data) {
                $scope.closeHotelSubscribe();

                if (data.status == 'ok' && typeof data.subscriber !== 'undefined') {
                    $scope.setSubscriber(data.subscriber);
                    swal({title: "Вы стали подписчиком отеля и теперь можете пользоваться бонусами", type: 'success'});
                    $scope.$emit('thSubscribeSuccess', data.subscriber);
                } else if (data.subscriber === 'undefined') {
                    swal({title: "Произошла ошибка", type: 'error'});
                }

                if (data.status == 'error') {
                    alert(data.message);
                }
            });
        };

    }
})();
