angular.module('feedback', []).controller('FeedbackController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {

    $scope.contactData = {name: null, email: null, comment: null};

    if ($rootScope.user.name || $rootScope.user.surname) {
        $scope.contactData.name = $rootScope.user.name + ' ' + $rootScope.user.surname;
    }
    if ($rootScope.user.email) {
        $scope.contactData.email = $rootScope.user.email;
    }
    if ($rootScope.user.phone) {
        $scope.contactData.phone = $rootScope.user.phone;
    }

    $scope.wasSent = false;
    $scope.sending = false;
    $scope.pressSubmit = false;

    $scope.submit = function() {
        $scope.pressSubmit = true;

        if ($scope.contactForm.$invalid) {
            return;
        }

        $scope.sending = true;

        $http({
            method: 'POST',
            url: '/feedback/send',
            params: {'params': $scope.contactData}
        }).success(function (data) {
            $scope.sending = false;
            if (data.status == 'ok') {
                $scope.wasSent = true;
            }
            if (data.status == 'error') {
                alert(data.message);
            }
        });
    };
}]);

