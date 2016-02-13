
angular.module('personalCabinet').directive('dropdown', ['$rootScope', 'templateLoader', function($rootScope, templateLoader) {

    return {
        restrict: 'E',
        transclude: true,
        scope: {
            source: '=?',
            settings: '@',
            withOther: '@',
            service: '=',
            explain: '@'
        },
        link: templateLoader.loader,
        controller: function($scope, $element, $attrs, $transclude, $location) {

            if (window.myTbData) {
                $scope.source = window.myTbData.userCountriesFilter;
            }

            var settings = jQuery.extend({
                classPrefix: 'uni'
            }, angular.fromJson($scope.settings) || {});

            $element.ready(function() {
                //console.log('select with search ready')
                $scope.$emit('directiveReady');
            });

            $scope.value = '';

            $scope.selectPopup = false;
            $scope.nick = 'co';

            /**
             * Мониторим изменение адресной строки
             * Если что-то поменялось, то мы должны синхронизировать отображение с данными
             */
            $scope.$on('$locationChangeSuccess', function() {

                $scope.value = '';
                for (var idx in $scope.source) {
                    if ($scope.source[idx].id == $location.search()[$scope.nick]) {
                        $scope.value = $scope.source[idx].name;
                    }
                }

                if ($scope.value == '' && $scope.showAllLink)
                    $scope.value = $scope.showAllLink
            });

            var updateLocation = function(value) {
                var data = $location.search();
                data[$scope.nick] = value;
                $location.search($scope.nick, value);
            };

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
                var value_id = $location.search()[$scope.nick];
                if (!value_id)
                    value_id = 0;
                return value_id
            };


            $scope.displaySearchPopup = function() {

                if (!$scope.searchPopup) {
                    $scope.value = ''; //при открытии обнуляем
                } else {
                    //$scope.checkVal(); //при закрытии проверям, что выбрали из списка
                }

                $scope.searchPopup = ! $scope.searchPopup;

                if (!$scope.searchPopup || !$scope.selectPopup) {
                    $scope.$emit('toggleBgForm');
                }
                $scope.selectPopup = false;

            };

            $scope.displaySelectPopup = function(i) {
                $scope.notBgForm = i;
                //if ($scope.selectPopup)
                //    $scope.checkVal();

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
                }else{
                    if (search) {
                        $scope.displaySearchPopup();
                    } else {
                        $scope.displaySelectPopup();
                    }
                }
                //$scope.value = item.name;
                updateLocation(item.id)
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
            };

            $scope.selectNextItem = function() {

                var root_of_li = null;

                if ($scope.selectPopup) {
                    root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt2');
                    if (root_of_li.length == 0) {
                        root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt3')
                    }
                } else if ($scope.searchPopup) {
                    root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt1')
                } else {
                    return;
                }

                var el = root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs li.'+settings['classPrefix']+'-form-dd-i_active');
                el.removeClass(''+settings['classPrefix']+'-form-dd-i_active');
                if (el.length && el.next().length) {
                    el.next().addClass(''+settings['classPrefix']+'-form-dd-i_active');
                    root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs_val').scrollTo(el.next());
                } else {
                    var list_if_li = root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs li');
                    if (list_if_li.length){
                        list_if_li.first().addClass(''+settings['classPrefix']+'-form-dd-i_active');
                        root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs_val').scrollTo(list_if_li.first());
                    }
                }
            };

            $scope.selectPrevItem = function() {

                var root_of_li = null;

                if ($scope.selectPopup) {
                    root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt2');
                    if (root_of_li.length == 0)
                        root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt3')
                } else if ($scope.searchPopup) {
                    root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt1')
                } else
                    return;

                var el = root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs li.'+settings['classPrefix']+'-form-dd-i_active');
                el.removeClass(''+settings['classPrefix']+'-form-dd-i_active');
                if (el.length && el.prev().length) {
                    el.prev().addClass(''+settings['classPrefix']+'-form-dd-i_active');
                    root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs_val').scrollTo(el.prev())
                } else {
                    var list_if_li = root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs li');
                    if (list_if_li.length){
                        list_if_li.last().addClass(''+settings['classPrefix']+'-form-dd-i_active');
                        root_of_li.find('.'+settings['classPrefix']+'-form-dd-tabs_val').scrollTo(list_if_li.last())
                    }
                }
            };

            $scope.submit = function() {
                var root_of_li;
                if ( ! $scope.selectPopup && ! $scope.searchPopup) {
                    $scope.displaySelectPopup();
                } else if ($scope.selectPopup) {
                    root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt2');
                    
                    if (root_of_li.length == 0)
                        root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt3');
                    
                    $scope.click = function() {
                        setTimeout(function() {
                            root_of_li.find('.'+settings['classPrefix']+'-form-dd-i_active')
                                .removeClass(''+settings['classPrefix']+'-form-dd-i_active').trigger('click');
                        }, 0);
                    };

                    $scope.click()
                } else if ($scope.searchPopup) {
                    root_of_li = $element.find('.'+settings['classPrefix']+'-form-dd-cnt1');

                    $scope.click = function() {
                        setTimeout(function() {
                            root_of_li.find('.'+settings['classPrefix']+'-form-dd-i_active')
                                .removeClass(''+settings['classPrefix']+'-form-dd-i_active').trigger('click');
                        }, 0);
                    };
                    $scope.click()
                }
            }
        }
    }
}]);