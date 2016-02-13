angular.module('filters').directive('roomsize', ['$rootScope', 'templateLoader', function($rootScope, templateLoader) {

    return {
        restrict: 'E',
        transclude: true,
        scope: {
            source : '=',
            settings: '@',
            countAdults: '='
        },
        link: templateLoader.loader,

        controller: function($scope, $element, $attrs, $location) {

            var settings = jQuery.extend({
                classPrefix: 'uni'
            }, angular.fromJson($scope.settings) || {});

            $scope.selectSlide = false;
            $scope.adult = {};
            $scope.adultPopup = false;
            $scope.children = 0;
            $scope.child1 = [];
            $scope.child1_age = -1;
            $scope.childrenPopup = false;
            $scope.child1Popup = false;
            $scope.child2 = [];
            $scope.child2_age = -1;
            $scope.child2Popup = false;
            $scope.child3 = [];
            $scope.child3_age = -1;
            $scope.child3Popup = false;
            $scope.childAll = [];
            $scope.childAllPopup = false;

            $scope.nick = 'rs';
            $scope.nickCh1 = 'ch1';
            $scope.nickCh2 = 'ch2';
            $scope.nickCh3 = 'ch3';

            $scope.selectedCh1 = '--';
            $scope.selectedCh2 = '--';
            $scope.selectedCh3 = '--';
            $scope.wrapped = false;
            $scope.data = {
                2: ['10PPL', 10, 0],
                55: ['6AD+1CHD', 6, 1],
                56: ['6AD+2CHD', 6, 2],
                53: ['5AD+1CHD', 5, 1],
                54: ['5AD+2CHD', 5, 2],
                44: ['11PPL', 11, 0],
                29: ['5PPL', 5, 0],
                24: ['6PPL', 6, 0],
                30: ['7PPL', 7, 0],
                3: ['8PPL', 8, 0],
                4: ['9PPL', 9, 0],
                14: ['DBL', 2, 0],
                20: ['DBL+1CHD', 2, 1],
                21: ['DBL+2CHD', 2, 2],
                26: ['QTRL', 4, 0],
                32: ['QTRL+1CHD', 4, 1],
                45: ['12PPL', 12, 0],
                33: ['QTRL+2CHD', 4, 2],
                15: ['SGL', 1, 0],
                51: ['SGL (DBL SGL USE)', 1, 0, 0],
                18: ['SGL+1CHD', 1, 1],
                19: ['SGL+2CHD', 1, 2],
                23: ['TRL', 3, 0],
                27: ['TRL+1CHD', 3, 1],
                31: ['TRL+2CHD', 3, 2],
                60: ['SGL+3CHD', 1, 3],
                59: ['DBL+3CHD', 2, 3]
            };
            $scope.sourceWrapped = {};
            $scope.selectedSlide = $rootScope.searchParams[$scope.nick];

            $scope.goWrapped = function(){
                if (!$scope.countAdults)
                    return false;

                if ($scope.wrapped){
                    $scope.wrapped = false;
                    $scope.adult.name = $scope.data[$scope.adult.id][0]
                }else{
                    $scope.wrapped = true;
                    if ($scope.data[$scope.adult.id] instanceof Array){
                        $scope.adult.name = $scope.data[$scope.adult.id][1]
                    }
                    $scope.wrap()
                }
            };

            $scope.wrap = function(){
                var tempSource = {};
                var repeatsArr = [];
                var tempChildrenSource = {};
                var idx;
                $scope.sourceWrapped = [];
                $scope.childAll = [];
                //сначало составим список для Детей.
                for (idx in $scope.source) {
                    if ($scope.source.hasOwnProperty(idx)) {
                        if ($scope.data[$scope.source[idx].id][2] == $scope.children) {
                            tempChildrenSource[$scope.data[$scope.source[idx].id][1]] = JSON.parse(JSON.stringify($scope.source[idx]));
                            tempChildrenSource[$scope.data[$scope.source[idx].id][1]].name = $scope.data[$scope.source[idx].id][1]
                        }
                    }
                }

                for (idx in $scope.source) {
                    if ($scope.source.hasOwnProperty(idx)) {
                        //if ($scope.data[$scope.source[idx].id][2] == $scope.children){
                        if (repeatsArr.indexOf($scope.data[$scope.source[idx].id][1]) == -1) {
                            if (tempChildrenSource[$scope.data[$scope.source[idx].id][1]] instanceof Object) {
                                tempSource = tempChildrenSource[$scope.data[$scope.source[idx].id][1]]
                            } else {
                                tempSource = JSON.parse(JSON.stringify($scope.source[idx]));
                                tempSource.name = $scope.data[$scope.source[idx].id][1]
                            }
                            repeatsArr.push(tempSource.name);
                            $scope.sourceWrapped.push(tempSource);
                            if ($scope.children == tempSource.children && $scope.adult.name == $scope.data[tempSource.id][1] && tempSource.id != $scope.adult.id) {
                                $scope.adult = JSON.parse(JSON.stringify(tempSource));
                                $scope._addToLocationData($scope.nick, $scope.adult.id);
                            }
                        }
                    }
                }

                for (idx in $scope.source) {
                    if ($scope.source.hasOwnProperty(idx)) {
                        if ($scope.childAll.indexOf($scope.data[$scope.source[idx].id][2]) == -1 && $scope.adult.name == $scope.data[$scope.source[idx].id][1]) {
                            $scope.childAll[$scope.data[$scope.source[idx].id][2]] = {
                                name: $scope.data[$scope.source[idx].id][2],
                                id: parseInt($scope.data[$scope.source[idx].id][2])
                            }
                        }
                    }
                }

                $scope.sourceWrapped.sort(function(a, b) {return a.name - b.name});
                $scope.childAll.sort()
            };

            $scope.$watch('source', function(newVal) {


                if (!newVal) {
                    return
                }

                var locationDataAdult = $rootScope.searchParams[$scope.nick];
                var locationDataCh1 = $rootScope.searchParams[$scope.nickCh1];
                var locationDataCh2 = $rootScope.searchParams[$scope.nickCh2];
                var locationDataCh3 = $rootScope.searchParams[$scope.nickCh3];

                for (var idx in newVal) {
                    if (newVal.hasOwnProperty(idx) && locationDataAdult == newVal[idx].id) {
                        $scope.adult = JSON.parse(JSON.stringify(newVal[idx]));
                        if ($scope.wrapped){
                            $scope.adult.name = $scope.data[newVal[idx].id][1].toString()
                        }
                        break
                    }
                }

                $scope.selectedCh1 = (locationDataAdult && locationDataCh1 >= 0) ? locationDataCh1 : '--';
                $scope.selectedCh2 = (locationDataAdult && locationDataCh2 >= 0) ? locationDataCh2 : '--';
                $scope.selectedCh3 = (locationDataAdult && locationDataCh3 >= 0) ? locationDataCh3 : '--';

                $scope.child1_age = (locationDataAdult && locationDataCh1 >= 0) ? locationDataCh1 : -1;
                $scope.child2_age = (locationDataAdult && locationDataCh2 >= 0) ? locationDataCh2 : -1;
                $scope.child3_age = (locationDataAdult && locationDataCh3 >= 0) ? locationDataCh3 : -1;
                if ($scope.wrapped){
                    $scope.wrap();
                }
            }, true);

            $scope.displayAdult = function(){
                $scope.$emit('toggleBgForm');
                $scope.adultPopup = !$scope.adultPopup;
            };

            $scope.displayChildren = function () {
                $scope.$emit('toggleBgForm');
                $scope.childrenPopup = !$scope.childrenPopup;
            };

            $scope.displayChildAll = function(){
                $scope.$emit('toggleBgForm');
                $scope.childAllPopup = !$scope.childAllPopup;
            };

            $scope.displayChild1 = function(){
                $scope.$emit('toggleBgForm');
                $scope.child1Popup = !$scope.child1Popup;
            };

            $scope.displayChild2 = function(){
                $scope.$emit('toggleBgForm');
                $scope.child2Popup = !$scope.child2Popup;
            };

            $scope.displayChild3 = function(){
                $scope.$emit('toggleBgForm');
                $scope.child3Popup = !$scope.child3Popup;
            };

            $scope.selectAdult = function(item){
                $scope.adult = JSON.parse(JSON.stringify(item));
                var searchParams = $rootScope.searchParams;
                if ($scope.wrapped){
                    $scope.wrap();
                    item.name = $scope.data[item.id][1].toString()
                }
                if (item.children < 2) {
                    searchParams.setValue('ch2', undefined);
                    if (item.children == 0) {
                        searchParams.setValue('ch1', undefined);
                    }
                }
                searchParams.setValue($scope.nick, $scope.adult.id);
                searchParams.setUrl($rootScope.isIndexPage);
                $scope.displayAdult();
            };

            //Выбор при всплывающем дропдауне
            $scope.selectFuncSlide = function(item) {
                $scope.adult = JSON.parse(JSON.stringify(item));
                if ($scope.wrapped){
                    $scope.wrap();
                    item.name = $scope.data[item.id][1].toString()
                }
                $scope._addToLocationData($scope.nick, $scope.adult.id);
            };

            $scope.selectChildAll = function(v){
                $scope.children = v;
                $scope.wrap();
                //$scope._addToLocationData($scope.nickCh1, $scope.childAll_age);
                $scope.displayChildAll();
            };

            $scope.selectChild1 = function(v){
                $scope.child1_age = v;
                $scope.selectedCh1 = v == -1 ? '--' : v;
                $scope._addToLocationData($scope.nickCh1, $scope.child1_age);
                $scope.displayChild1();
            };

            $scope.selectChild2 = function(v){
                $scope.child2_age = v;
                $scope.selectedCh2 = v == -1 ? '--' : v;
                $scope._addToLocationData($scope.nickCh2, $scope.child2_age);
                $scope.displayChild2();
            };

            $scope.selectChild3 = function(v){
                $scope.child3_age = v;
                $scope.selectedCh3 = v == -1 ? '--' : v;
                $scope._addToLocationData($scope.nickCh3, $scope.child3_age);
                $scope.displayChild3();
            };
            /**
             * Мониторим изменение адресной строки
             * Если что-то поменялось, то мы должны синхронизировать отображение с данными
             */
            $scope.$on('$locationChangeSuccess', function() {
                $scope.selectedSlide = $rootScope.searchParams[$scope.nick];
                var locationDataAdult = $rootScope.searchParams[$scope.nick];
                var locationDataCh1 = $rootScope.searchParams[$scope.nickCh1];
                var locationDataCh2 = $rootScope.searchParams[$scope.nickCh2];
                var locationDataCh3 = $rootScope.searchParams[$scope.nickCh3];

                for (var idx in $scope.source) {
                    if ($scope.source.hasOwnProperty(idx) && locationDataAdult == $scope.source[idx].id) {
                        $scope.adult = JSON.parse(JSON.stringify($scope.source[idx]));
                        if ($scope.wrapped){
                            $scope.adult.name = $scope.data[$scope.source[idx].id][1].toString()
                        }
                        break
                    }
                }

                //console.log('room size change location', locationDataCh1)

                $scope.selectedCh1 = (locationDataAdult && locationDataCh1 >= 0) ? locationDataCh1 : '--';
                $scope.selectedCh2 = (locationDataAdult && locationDataCh2 >= 0) ? locationDataCh2 : '--';
                $scope.selectedCh3 = (locationDataAdult && locationDataCh3 >= 0) ? locationDataCh3 : '--';

                $scope.child1_age = (locationDataAdult && locationDataCh1 >= 0) ? locationDataCh1 : -1;
                $scope.child2_age = (locationDataAdult && locationDataCh2 >= 0) ? locationDataCh2 : -1;
                $scope.child3_age = (locationDataAdult && locationDataCh3 >= 0) ? locationDataCh3 : -1;
            });

            $scope._defaultChildrenAge = function () {
                $scope.child1 = [{'id' : '-1', name : '--'}];
                $scope.child2 = [{'id' : '-1', name : '--'}];
                $scope.child3 = [{'id' : '-1', name : '--'}]
            };

            $scope.$watch('adult', function(newVal, oldVal) {

                if (!newVal) return;

                if (newVal !== oldVal)
                {
                    $scope.children = newVal.children;


                    if (newVal.children == 0) {
                        $scope.child1 = {};
                        $scope.child2 = {};
                        $scope.child3 = {};
                    } else if (newVal.children > 0) {

                        $scope._defaultChildrenAge();

                        for (i = parseInt(newVal.ch1from); i <= parseInt(newVal.ch1to); i++) {
                            $scope.child1.push({id : i, name : i})
                        }

                        if (parseInt(newVal.children) > 1) {
                            for (i = parseInt(newVal.ch2from); i <= parseInt(newVal.ch2to); i++) {
                                $scope.child2.push({id : i, name : i})
                            }
                        }

                        if (parseInt(newVal.children) > 2) {
                            for (i = parseInt(newVal.ch3from); i <= parseInt(newVal.ch3to); i++) {
                                $scope.child3.push({id : i, name : i})
                            }
                        }

                    }
                }
            }, true);

            $rootScope.$on('clickBgForm', function() {

                if ($scope.adultPopup) {
                    $scope.displayAdult();
                }

                if ($scope.childrenPopup) {
                    $scope.displayChildren()
                }

                if ($scope.child1Popup) {
                    $scope.displayChild1();
                }

                if ($scope.child2Popup) {
                    $scope.displayChild2();
                }

                if ($scope.child3Popup) {
                    $scope.displayChild3();
                }

                if ($scope.childAllPopup) {
                    $scope.displayChildAll();
                }

                $scope.$digest();
            });

            $scope.use = function () {

                if ($scope.selectedCh1) {
                    $scope.child1_age = $scope.selectedCh1 == '--' ? -1 : $scope.selectedCh1
                }
                if ($scope.selectedCh2) {
                    $scope.child2_age = $scope.selectedCh2 == '--' ? -1 : $scope.selectedCh2
                }
                if ($scope.selectedCh3) {
                    $scope.child3_age = $scope.selectedCh3 == '--' ? -1 : $scope.selectedCh3
                }

                $scope._addToLocationData($scope.nickCh1, $scope.child1_age);
                $scope._addToLocationData($scope.nickCh2, $scope.child2_age);
                $scope._addToLocationData($scope.nickCh3, $scope.child3_age);
            };

            $scope.setChild1 = function(name) {
                $scope.selectedCh1 = name;
                $scope.child1_age = $scope.selectedCh1 == '--' ? -1 : $scope.selectedCh1;
                $scope._addToLocationData($scope.nickCh1, $scope.child1_age);
                $scope.displayChild1()
            };

            $scope.setChild2 = function(name) {
                $scope.selectedCh2 = name;
                $scope.child2_age = $scope.selectedCh2 == '--' ? -1 : $scope.selectedCh2;
                $scope._addToLocationData($scope.nickCh2, $scope.child2_age);
                $scope.displayChild2()
            };

            $scope.setChild3 = function(name) {
                $scope.selectedCh3 = name;
                $scope.child3_age = $scope.selectedCh3 == '--' ? -1 : $scope.selectedCh3;
                $scope._addToLocationData($scope.nickCh3, $scope.child3_age);
                $scope.displayChild3()
            };

            $scope.reset = function () {

                $scope.child1_age = -1;
                $scope._addToLocationData($scope.nickCh1, $scope.child1_age);

                $scope.child2_age = -1;
                $scope._addToLocationData($scope.nickCh2, $scope.child2_age);

                $scope.child3_age = -1;
                $scope._addToLocationData($scope.nickCh3, $scope.child3_age);
            };

            $scope._addToLocationData = function (nick, data) {
                var locationData = $rootScope.searchParams;
                locationData[nick] = data;
                locationData.setUrl($rootScope.isIndexPage);
            };

            $scope.close = function() {
                //console.log('close directive')
                if ($scope.adultPopup) {
                    $scope.displayAdult();
                }
            };

            $scope.selectNextItem = function() {

                var root_of_li = null;

                if ($scope.adultPopup)
                    root_of_li = $element.find('.'+settings.classPrefix+'-form-dd-cnt2');
                else
                    return;

                var el = root_of_li.find('.uni-form-dd-tabs li.uni-form-dd-i_active');
                el.removeClass('uni-form-dd-i_active');
                if (el.length && el.next().length) {
                    el.next().addClass('uni-form-dd-i_active');
                    root_of_li.find('.uni-form-dd-tabs').scrollTo(el.next())
                } else {
                    var list_if_li = root_of_li.find('.uni-form-dd-tabs li');
                    //console.log('not found', list_if_li)
                    if (list_if_li.length){
                        //console.log(list_if_li)
                        list_if_li.first().addClass('uni-form-dd-i_active');
                        root_of_li.find('.uni-form-dd-tabs').scrollTo(list_if_li.first())
                    }
                }
            };

            $scope.selectPrevItem = function() {
                //console.log('select prev item')

                var root_of_li = null;

                if ($scope.adultPopup)
                    root_of_li = $element.find('.'+settings.classPrefix+'-form-dd-cnt2');
                else
                    return;

                var el = root_of_li.find('.uni-form-dd-tabs li.uni-form-dd-i_active');
                el.removeClass('uni-form-dd-i_active');
                if (el.length && el.prev().length) {
                    el.prev().addClass('uni-form-dd-i_active');
                    root_of_li.find('.uni-form-dd-tabs').scrollTo(el.prev())
                } else {
                    var list_if_li = root_of_li.find('.uni-form-dd-tabs li');
                    //console.log('not found', list_if_li)
                    if (list_if_li.length){
                        //console.log(list_if_li)
                        list_if_li.last().addClass('uni-form-dd-i_active');
                        root_of_li.find('.uni-form-dd-tabs').scrollTo(list_if_li.last())
                    }
                }
            };

            $scope.submit = function() {
                //console.log('submit directive')

                if ( ! $scope.adultPopup) {
                    $scope.displayAdult();
                } else if ($scope.adultPopup) {
                    var root_of_li = $element.find('.'+settings.classPrefix+'-form-dd-cnt2');
                    $scope.click = function() {
                        setTimeout(function() {
                            root_of_li.find('.uni-form-dd-i_active')
                                .removeClass('uni-form-dd-i_active')
                                .trigger('click');
                        }, 0);
                    };

                    $scope.click()
                }
            };

            $scope.keypress = function(keycode, ev) {
                var char = String.fromCharCode(ev.keyCode);

                char = char.toLowerCase();
                if ($scope.selectPopup)
                    var root_of_li = $element.find('.'+settings.classPrefix+'-form-dd-cnt2');
                else
                    return;

                //console.log('filter by keypress: ', char)
                root_of_li.find('.uni-form-dd-i_active')
                    .removeClass('uni-form-dd-i_active')
                    .filter(function() {
                        var text = $(this).text();
                        return text[0].toLowerCase() == char
                    }).first().addClass('uni-form-dd-i_active')
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