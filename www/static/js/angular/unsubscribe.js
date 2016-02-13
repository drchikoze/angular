angular.module('subscribeCancellation', []).controller('CancellationController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {

    const WATCH_SUBSCRIPTION = 1;
    const LEAVER_SUBSCRIPTION = 2;


    $scope.subscriptionType = window.subscriptionType;

    $scope.tours = window.toursData;
    $scope.unsubscribedIds = [];
    if($scope.tours.length == 1) {
        $scope.unsubscribedIds.push($scope.tours[0].tour_id)
    }

    $scope.isSetLeaverDeliveryData =  window.isSetLeaverDeliveryData;
    //$scope.unsubscribedLeaverDelivery = Boolean(window.unsubscribedLeaverDelivery);

    $scope.unsubscribedLeaverDelivery = true;

    $scope.selected = {
        price : false,
        frequency : false,
        trust : false,
        other : false,
        already_buy : false,
        text : ""
    };
    $scope.filled = false;
    $scope.selectedVar = false;
    $scope.email = $_GET('email');
    $scope.token = $_GET('token');

    function $_GET(key) {
        var s = window.location.search;
        s = s.match(new RegExp(key + '=([^&=]+)'));
        return s ? s[1] : false;
    }

    $scope.unsubscribe = function() {
        if ($scope.subscriptionType == WATCH_SUBSCRIPTION) {
            if ($scope.unsubscribedIds.length == 0) {
                swal("Выберите туры по которым не хотите получать уведомления", '',"error");
                return;
            }
            if(!$scope.selectedVar) {
                swal("Выберите причину", '',"error");
            } else {
                $http({
                    method: 'POST',
                    url: '/email_notification_cancel/cancel',
                    data: {'email': $scope.email,
                        'selected': $scope.selected,
                        'token': $scope.token,
                        'toursId': $scope.unsubscribedIds,
                        'unsubscribedLeaverDelivery': $scope.unsubscribedLeaverDelivery
                    }
                }).success(function (data) {
                    if (data.status == 'ok') {
                        swal(data.message, '', "success");
                    }
                    if (data.status == 'error') {
                        swal(data.message, '',"error");
                    }
                });
            }
        } else if ($scope.subscriptionType == LEAVER_SUBSCRIPTION) {
            if (!$scope.unsubscribedLeaverDelivery) {
                swal("Выберите от какой рассылки вы хотите отписаться", '',"error");
                return;
            }
            if(!$scope.selectedVar) {
                swal("Выберите причину", '',"error");
            } else {
                $http({
                    method: 'POST',
                    url: '/email_notification_cancel/cancel_leaver_subscription',
                    data: {'email': $scope.email,
                        'selected': $scope.selected,
                        'token': $scope.token,
                        'unsubscribedLeaverDelivery': $scope.unsubscribedLeaverDelivery
                    }
                }).success(function (data) {
                    if (data.status == 'ok') {
                        swal(data.message, '', "success");
                    }
                    if (data.status == 'error') {
                        swal(data.message, '',"error");
                    }
                });
            }
        }


    };

    $scope.cancel = function() {
        swal('Спасибо, что остались с нами!', '',"success");
    };

    $scope.textChange = function() {
        if("" == $scope.selected.text) {
            $scope.selectedVar = false;
        } else {
            if($scope.selected.other) {
                $scope.selectedVar = true;
            }
        }

    };

    $scope.checkClick = function() {
        if($scope.selected.price || $scope.selected.frequency || $scope.selected.trust || $scope.selected.other || $scope.selected.already_buy) {
            if ($scope.selected.other && "" != $scope.selected.text) {
                $scope.selectedVar = true;
                return;
            }
            $scope.selectedVar = !$scope.selected.other;

        } else {
            $scope.selectedVar = false;
        }
    };

    $scope.selectTour = function(tour) {
        if(tour.unsubscribe == true) {
            $scope.unsubscribedIds.push(tour.tour_id)
        } else {
            for (var i = 0, ii = $scope.unsubscribedIds.length; i < ii; i++) {
                if (tour.tour_id === $scope.unsubscribedIds[i]) {
                    $scope.unsubscribedIds.splice(i, 1);
                }
            }
        }
        console.log($scope.unsubscribedIds);
    };

    $scope.selectUnsubscribeLeaver = function() {
        $scope.unsubscribedLeaverDelivery = !$scope.unsubscribedLeaverDelivery;
        var m = 2;
    }

}]);