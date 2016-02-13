angular.module('filters').directive('submitButton', ['$rootScope', 'templateLoader', function($rootScope, templateLoader) {
    return {
        restrict: 'A',
        scope: {
            service: '='
        },
        transclude: true,
        link: templateLoader.loader,
        controller: function($scope, $element) {
            $element.hide();
            $scope.hidden = true;


            $scope.$on('$filtersChangeComplete', function(e, diff, l) {

                if (diff == 'page' || diff == 'page_size' || diff == 'result_type' || diff == 'result_group') {
                    return
                }

                if ($scope.lastChange != 'reset') { // Костыль
                    $element.show();
                    $scope.hidden = false;
                    if ($('[data-anchor*="' + diff + '"]').length) {
                        $element.offset({ top: $('[data-anchor*="' + diff + '"]').offset().top - $element.height() * 0.5 + 10 });
                    } else {
                        var smartContainer = $('[data-anchor="smart-container"]');
                        if(smartContainer.length) {
                            //В данном случае, если мы не можем отследить какой элемент был изменен, выводим плашку в середине видимой части экрана
                            var outerHeight = smartContainer.outerHeight();
                            var smartContainerTop = smartContainer.offset().top;
                            var windowsHeight = $(window).height();
                            var windowsTop = $(window).scrollTop();

                            //Если указанный блок с элементами в видимой части эрана, то производим расчет высоты плашки
                            if (windowsTop < outerHeight + smartContainerTop) {
                                //Если нажняя граница блока с элементами еще не видна пользователю, то выводим плашку по середине высоты экрана пользователя
                                if ((windowsTop + windowsHeight) < (outerHeight + smartContainerTop)) {
                                    $element.offset({ top: windowsTop + windowsHeight / 2 - $element.height() * 0.5});
                                } else {
                                    //Если нижняя граница блока с элементами видна пользователю то высчитывае середину видимой части блока
                                    $element.offset({ top: windowsTop + (outerHeight + smartContainerTop - windowsTop) / 2 - $element.height() * 0.5});
                                }
                            } else {
                                $element.offset({ top: outerHeight + smartContainerTop - $element.height() * 0.5});
                            }
                        } else {
                            var container = $('[data-anchor*="container"]');
                            $element.offset({ top: container.offset().top - $element.height() * 0.5 + container.height() * 0.5 });
                        }
                    }
                }
                $scope.lastChange = diff;
            });

            $scope.$on('srLoadingStart', function() {
                $element.hide();
                $scope.lastChange = 'reset'; // Костыль
            });

            // блок из трех функций отвечает за поведение кнопки в случае как успешного, так и фейлового результата
            $scope.$on('srLoadingComplete', function() {
                $element.hide();
                $scope.lastChange = false;
            });
            $scope.$on('srLoadingError', function() {
                $element.hide();
                $scope.lastChange = false;
            });
            $scope.$on('srLoadingFail', function() {
                $element.hide();
                $scope.lastChange = false;
            });

            $scope.$on('searchFormReset', function() {
                $scope.lastChange = 'reset'; // Костыль
                $element.hide();
            });
            $rootScope.$on('toggleBgForm', function() {
                if (!$scope.hidden) {
                    $scope.hidden = 'reset';
                    $element.hide();
                } else if ($scope.hidden == 'reset') {
                    $scope.hidden = false;
                    $element.show();
                }
            });

            $scope.hide = function() {
                $scope.hidden = true;
                $element.hide();
            };
        }
    }
}]);