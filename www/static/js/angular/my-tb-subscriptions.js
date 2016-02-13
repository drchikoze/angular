angular.module('personalCabinet').controller('MyTbSubscriptionsController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {




    $scope.isSetLeaverDeliveryData =  window.isSetLeaverDeliveryData;
    $scope.unsubscribedLeaverDelivery = Boolean(window.unsubscribedLeaverDelivery);
    $scope.isSubscribed = !Boolean(window.unsubscribedLeaverDelivery);
    $scope.uID = window.uID;

    //$scope.unsubscribedLeaverDelivery = true;

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

    function $_GET(key) {
        var s = window.location.search;
        s = s.match(new RegExp(key + '=([^&=]+)'));
        return s ? s[1] : false;
    }

    $scope.unsubscribe = function() {
            if (!$scope.unsubscribedLeaverDelivery) {
                swal("Выберите от какой рассылки вы хотите отписаться", '',"error");
                return;
            }
            if(!$scope.selectedVar) {
                swal("Выберите причину", '',"error");
            } else {
                $http({
                    method: 'POST',
                    url: '/email_notification_cancel/change_leaver_subscription',
                    data: {'uID': $scope.uID,
                        'selected': $scope.selected,
                        'token': $scope.token,
                        'unsubscribedLeaverDelivery': $scope.unsubscribedLeaverDelivery
                    }
                }).success(function (data) {
                    if (data.status == 'ok') {
                        swal('Вы отписались от рассылки', '', "success");
                        $scope.isSubscribed = false;
                    }
                    if (data.status == 'error') {
                        swal(data.message, '',"error");
                    }
                });
            }


    };

    $scope.updateSubscribe = function() {
        $http({
            method: 'POST',
            url: '/email_notification_cancel/change_leaver_subscription',
            data: {'uID': $scope.uID,
                'unsubscribedLeaverDelivery': false
            }
        }).success(function (data) {
            if (data.status == 'ok') {
                swal('Вы восстановили подписку', '', "success");
                $scope.isSubscribed = true;
            }
            if (data.status == 'error') {
                swal(data.message, '',"error");
            }
        });
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


    $scope.selectUnsubscribeLeaver = function() {
        $scope.unsubscribedLeaverDelivery = !$scope.unsubscribedLeaverDelivery;
        var m = 2;
    }

}]);