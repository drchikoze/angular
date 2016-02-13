angular.module('filters').directive('duration', ['$rootScope', 'templateLoader', function($rootScope, templateLoader) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            source: '='
        },
        link: templateLoader.loader,

        controller: function($scope, $element, $attrs, $location) {
            $scope.nf = 0;
            $scope.nt = 0;

            $scope.searchPopup = false;

            // получим значения фильтра
            var getValue = function(name) {
                return parseInt($rootScope.searchParams[name], 10)
            };

            $scope.displayPopup = function() {
                $scope.$emit('toggleBgForm');
                if ($scope.searchPopup) {
                    $scope.updateLocation();
                }
                $scope.searchPopup = ! $scope.searchPopup;
            };

            $scope.$watch('source', function(newVal) {
                if ( ! newVal)
                {
                    return
                }
                $scope.nf = getValue('nf');
                $scope.nt = getValue('nt');
            });

            $scope.$on('$locationChangeSuccess', function() {

                $scope.nf = getValue('nf');
                $scope.nt = getValue('nt');

            });

            //событие на клик черного бекграунда
            $rootScope.$on('clickBgForm', function(e) {

                if ($scope.searchPopup) {
                    $scope.displayPopup();
                }
            });

            $scope.updateLocation = function() {
                var data = $rootScope.searchParams;
                data['nf'] = $scope.nf;
                data['nt'] = $scope.nt;
                data.setUrl($rootScope.isIndexPage);
            }
        }
    }
}]);