angular.module('visual').directive('overlayUni', ['$rootScope', function($rootScope) {
    return {
        restrict: 'A',
        replace: false,
        $scope: {},
        controller: function($scope, $element, $attrs) {
            var backGround = true;

            $element.append(
                '<div class="uni-form-overlay"></div>'
                    + '<div class="uni-form-loader"></div>');

            $scope.displayAllPopup = false;
            $scope.displayLoading = false;

            $scope.$on('toggleLoading', function() {
                $element.toggleClass('uni-form-active-loader');
            });

            $rootScope.$on('toggleBgForm', function() {
                $('#overlay-uni').toggle(backGround);
                backGround = !backGround;
                $element.toggleClass('uni-form-active');
            });

            $rootScope.$on('showBgForm', function() {
                $('#overlay-uni').show();
                console.log('showBgForm');
                backGround = true;
                $element.addClass('uni-form-active');
            });

            $rootScope.$on('hideBgForm', function() {
                $('#overlay-uni').hide();
                backGround = false;
                $element.removeClass('uni-form-active');
            });

            /**
             * Обработка событий при кликах вне области фильра
             *
             * Рассылаем всем факт нажатия на область
             */
            $('#overlay-uni, .uni-form-overlay').live('click', function(e) {
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
}])