angular.module('app', ['ngSanitize',  'search', 'filters', 'pasvaz.bindonce', 'infinite-scroll', 'debounce', 'sly', 'auth', 'feedback', 'subscribeCancellation', 'header-search', 'commonRequest'])
    .controller('main', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $scope.bodyClick = function() {
            $rootScope.$broadcast('$bodyClick');
        }
    }]);