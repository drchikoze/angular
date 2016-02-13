angular.module('filters').directive('dropdown', ['$rootScope', 'templateLoader', 'dataSource', function($rootScope, templateLoader, $dataSource) {

    return {
        restrict: 'E',
        transclude: true,
        scope: {
            source: '=',
            settings: '@',
            withOther: '@',
            service: '=',
            explain: '@'
        },
        link: templateLoader.loader,
        controller: function($scope, $element, $attrs, $transclude, $location) {

            var settings = jQuery.extend({
                classPrefix: 'uni'
            }, angular.fromJson($scope.settings) || {});

            $scope.selectOther = function() {

                // Считаем количество открытых попапов
                if ($scope.nick == 'co')
                    nl_count_params(12677, 165, 2, 2);
                else
                    nl_count_params(12677, 165, 2, 1);


                $scope.close();
                $location.path('/filters/' + $attrs['source'].split('.')[1])
            };
            $scope.showAllLink = $attrs['all'] || false;

            $scope.nick = $dataSource.getNickBySource($attrs['source']);

            $scope.selectAll = function() {
                $scope.displaySelectPopup();

                updateLocation('')
            };

            $scope.value = '';
            $scope.selectedSlide = $rootScope.searchParams[$scope.nick];

            $scope.searchPopup = false;
            $scope.selectPopup = false;
            $scope.selectSlide = false;

            $scope.$watch('source', function (newVal) {

                if (newVal) {
                    // в случае если значение не указано, то это - 0
                    var value_id = $scope.getValues();
                    $scope.value = '';

                    for (var idx in newVal) {
                        if (newVal[idx].id == value_id) {
                            $scope.value = newVal[idx].name;
                            break;
                        }
                    }
                    if ($scope.value == '' && $scope.showAllLink) {
                        $scope.value = $scope.showAllLink
                    }
                    // если значение пустое то пытаемся выставить значение
                    // по умолчанию, если есть
                    if ($scope.value == '' && newVal[0] && newVal[0].id == 0) {
                        updateLocation(0);
                    }
                }
            });

            $scope.getValues = function() {
                var value_id = $rootScope.searchParams[$scope.nick];
                if (!value_id)
                    value_id = 0;
                return value_id
            };

            /**
             * Мониторим изменение адресной строки
             * Если что-то поменялось, то мы должны синхронизировать отображение с данными
             */
            $scope.$on('$locationChangeSuccess', function() {
                $scope.selectedSlide = $rootScope.searchParams[$scope.nick];
                $scope.value = '';
                for (var idx in $scope.source) {
                    if ($scope.source[idx].id == $rootScope.searchParams[$scope.nick]) {
                        $scope.value = $scope.source[idx].name;
                    }
                }

                if ($scope.value == '' && $scope.showAllLink)
                    $scope.value = $scope.showAllLink
            });

            var updateLocation = function(value) {
                var data = $rootScope.searchParams;
                data.setValue($scope.nick, value);
                data.setUrl($rootScope.isIndexPage);
            };

            $scope.displaySearchPopup = function() {

                if (!$scope.searchPopup) {
                    $scope.value = ''; //при открытии обнуляем
                } else {
                    $scope.checkVal(); //при закрытии проверям, что выбрали из списка
                }

                $scope.searchPopup = ! $scope.searchPopup;

                if (!$scope.searchPopup || !$scope.selectPopup) {
                    $scope.$emit('toggleBgForm');
                }
                $scope.selectPopup = false;

                $rootScope.$broadcast('closeOther', $attrs['level'], $attrs['id']);
            };

            $scope.displaySelectPopup = function(i) {
                $scope.notBgForm = i;
                if ($scope.selectPopup)
                    $scope.checkVal();

                $scope.selectPopup = ! $scope.selectPopup;

                if (!$scope.searchPopup || !$scope.selectPopup) {
                    if (!i){
                        $scope.$emit('toggleBgForm');
                    }
                }
                $scope.searchPopup = false;

                $rootScope.$broadcast('closeOther', $attrs['level'], $attrs['id']);
            };

            $scope.select = function(item, search) {
                if ($scope.notBgForm){
                    $scope.notBgForm = false;
                    $scope.selectPopup = false;
                } else {
                    if (search) {
                        $scope.displaySearchPopup();
                    } else {
                        $scope.displaySelectPopup();
                    }
                }
                $scope.value = item.name;
                updateLocation(item.id)
            };

            //Выбор при всплывающем дропдауне
            $scope.selectFuncSlide = function(item, search) {
                updateLocation(item.id)
            };

            //проверка значения в value на соответвие городам в списке, если не соответствует, подставляем последний выбранные город.
            $scope.checkVal = function () {

                for (var idx in $scope.source) {
                    if ($scope.value == $scope.source[idx].name) {
                        return updateLocation($scope.source[idx].id)
                    }
                }

                for (var idx in $scope.source)
                {
                    if ($scope.source[idx].id == $scope.getValues())
                    {
                        $scope.value = $scope.source[idx].name;
                        break;
                    }
                }
            };

            //событие на клик бекграунда страницы (вне открытого фильтра)
            $rootScope.$on('clickBgForm', function(e) {
                if ($scope.notBgForm){
                    $scope.notBgForm = false;
                    $scope.selectPopup = false;
                    return;
                }
                if ($scope.selectPopup) {
                    $scope.displaySelectPopup();
                }

                if ($scope.searchPopup) {
                    $scope.displaySearchPopup();
                }
                $scope.$digest()
            });

            $rootScope.$on('closeOther', function(e, level, self) {
                if ($attrs['level'] == level && $attrs['id'] != self) {
                    $scope.selectPopup = false;
                    $scope.searchPopup = false;
                }
            });

            $scope.close = function() {
                //console.log('close directive')
                if ($scope.selectPopup) {
                    $scope.displaySelectPopup();
                }

                if ($scope.searchPopup) {
                    $scope.displaySearchPopup();
                }
                $element.find('input').blur();
            };

            $scope.selectNextItem = function() {
                //console.log('select next item')

                var root_of_li = null;

                if ($scope.selectPopup)
                    root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt2');
                else if ($scope.searchPopup)
                    root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt1');
                else
                    return;

                var el = root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs li.'+settings['classPrefix']+'-form-dd-i_active');
                el.removeClass(''+settings['classPrefix']+'-form-dd-i_active');
                if (el.length && el.next().length) {
                    el.next().addClass(''+settings['classPrefix']+'-form-dd-i_active');
                    root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs_val').scrollTo(el.next())
                } else {
                    var list_if_li = root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs li');
                    //console.log('not found', list_if_li)
                    if (list_if_li.length){
                        //console.log(list_if_li)
                        list_if_li.first().addClass(''+settings['classPrefix']+'-form-dd-i_active');
                        root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs_val').scrollTo(list_if_li.first())
                    }
                }
            };

            $scope.selectPrevItem = function() {
                //console.log('select prev item')

                var root_of_li = null;

                if ($scope.selectPopup)
                    root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt2');
                else if ($scope.searchPopup)
                    root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt1');
                else
                    return;

                var el = root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs li.'+settings['classPrefix']+'-form-dd-i_active');
                el.removeClass(''+settings['classPrefix']+'-form-dd-i_active');
                if (el.length && el.prev().length) {
                    el.prev().addClass(''+settings['classPrefix']+'-form-dd-i_active');
                    root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs_val').scrollTo(el.prev())
                } else {
                    var list_if_li = root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs li');
                    //console.log('not found', list_if_li)
                    if (list_if_li.length){
                        //console.log(list_if_li)
                        list_if_li.last().addClass(''+settings['classPrefix']+'-form-dd-i_active');
                        root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs_val').scrollTo(list_if_li.last())
                    }
                }
            };

            $scope.submit = function() {
                //console.log('submit directive')

                if ( ! $scope.selectPopup && ! $scope.searchPopup) {
                    $scope.displaySelectPopup();
                } else if ($scope.selectPopup) {
                    var root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt2');
                    $scope.click = function() {
                        setTimeout(function() {
                            root_of_li.find('.'+settings['classPrefix']+'-form-dd-i_active').removeClass(''+settings['classPrefix']+'-form-dd-i_active').trigger('click');
                        }, 0);
                    };

                    $scope.click()
                } else if ($scope.searchPopup) {
                    var root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt1');
                    $scope.click = function() {
                        setTimeout(function() {
                            root_of_li.find('.'+settings['classPrefix']+'-form-dd-i_active').removeClass(''+settings['classPrefix']+'-form-dd-i_active').trigger('click');
                        }, 0);
                    };
                    $scope.click()
                }
            };

            $scope.displaySelectSlide = function() {
                var options = $element.find('.uni-form-chooser-list-option');
                if (!$scope.selectSlide) {
                    options.removeClass('ng-hide');
                }
                $scope.selectSlide = !$scope.selectSlide;

                if ($attrs['slide']) {
                    options.slideToggle(200, function() {
                        if (!$scope.selectSlide) options.addClass('ng-hide');
                    });
                } else {
                    options.css({"display": ($scope.selectSlide)? 'block':'none'})
                }
                $element.toggleClass('uni-form-chooser-list-act');
            };

            /**
             * Иницилизация фильтра
             */
            $scope.init = function () {
                if ($attrs['show'] == 'true') {
                    var prevSlide = $attrs['slide'];
                    $attrs['slide'] = false;
                    $scope.displaySelectSlide();
                    $attrs['slide'] = prevSlide
                }
            }
        }
    }
}]);