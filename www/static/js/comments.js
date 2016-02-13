/**
 * Created by AleX on 19.03.2015.
 */
angular.module('comments', []).controller('CommentsCtrl', function($scope, $http) {
    $scope.contactData = {};
    $scope.wasSent = false;
    $scope.sending = false;


    $scope.submit = function() {
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
});