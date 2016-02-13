angular.module('visual').directive('overlay', ['$rootScope', function($rootScope) {
    return {
        restrict: 'A',
        replace: false,
        //transclude: true,
        $scope: {},
        controller: function($scope, $element, $attrs) {

            //console.log('init overlay')

            var backGround = true;

            $element.append(
                '<div class="chooser-form-overlay"></div>'
                + '<div class="chooser-form-loader"></div>');

            $scope.displayAllPopup = false;
            $scope.displayLoading = false;

            $scope.$on('toggleLoading', function() {
                //console.log('toggleLoading message')
                $element.toggleClass('chooser-form-active-loader');
                //$scope.displayLoading = ! $scope.displayLoading;
            });

            $rootScope.$on('toggleBgForm', function() {
                //console.log('toggleBgForm message')
                $('#overlay-uni').toggle(backGround);
                backGround = !backGround;
                $element.toggleClass('chooser-form-active');
            });

            $rootScope.$on('showBgForm', function() {
                //console.log('toggleBgForm message')
                $('#overlay-uni').show();
                backGround = true;
                $element.addClass('chooser-form-active');
            });

            $rootScope.$on('hideBgForm', function() {
                //console.log('toggleBgForm message')
                $('#overlay-uni').hide();
                backGround = false;
                $element.removeClass('chooser-form-active');
            });

            /**
             * Обработка событий при кликах вне области фильра
             *
             * Рассылаем всем факт нажатия на область
             */
            $('#overlay-uni, .chooser-form-overlay').on('click', function(e) {
                //console.log('overlay click');
                $scope.$emit('clickBgForm');
            });
            jQuery(function($){
                $(document).mouseup(function (e){ // событие клика по веб-документу
                    var div = $('.form-area'); // тут указываем ID элемента
                    if (!div.is(e.target) // если клик был не по нашему блоку
                        && div.has(e.target).length === 0) { // и не по его дочерним элементам
                        $scope.$emit('clickBgForm');
                    }
                });
            });
        }
    }
}]);