/**
 * Created by vasilij on 10.10.14.
 */
app = angular.module('app', ['auth', 'feedback', 'header-search']);
AngularHelper.datePickerDirective(app);

app.controller('main', ['$scope', '$http', '$log', function ($scope, $http, $log) {
    $scope.person = window.userData;
    $scope.sendRequest = false;
    $scope.showSaveResult = false;

    $scope.submit = function () {
        $scope.sendRequest = true;
        $http({
            method: 'POST',
            url: '/personal_data/save_data',
            params: $scope.person
        }).success(function (data) {
            $scope.sendRequest = false;
            if (data.status == 'error') {
                $scope.saveResultMessage = 'При изменение данных произошли ошибки, попробуйте повторить позже';
                $scope.showSaveResult = true;
                $log.info('Validation failed');
            } else {
                $scope.saveResultMessage = 'Изменение данных прошло успешно';
                $scope.showSaveResult = true;
                $log.info('Validation done');
            }
            if (data.data) {
                $scope.person = data.data;
            }
        }).error(function (data) {
            $scope.sendRequest = false;
            $log.info('Ошибка при сохранении данных');
            $log.info(JSON.stringify(data))
        });
    }
}]);

$().ready(function(){
    $('#phone').mask("+7 (999) 999 99 99");
});
