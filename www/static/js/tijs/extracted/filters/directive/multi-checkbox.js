angular.module('filters').directive('multicheckbox', ['$rootScope', 'templateLoader', 'dataSource', function($rootScope, templateLoader,$dataSource) {

    /**
     * Линковка нужного шаблона в зависимости от фильтра
     * @param $scope
     * @param $element
     * @param $attrs
     */
    var linker = function($scope, $element, $attrs) {
        var loader = templateLoader.loader($scope, $element, $attrs);
        //$scope.operatorsOpen = $rootScope.operatorsOpen;

        loader.success(function() {

            $element.find('input[type="text"]').prop('disabled', ! $scope.searchable);

            var parent = $element.find('[rel="scroll_list"]');
            var parent2 = $element.find('[rel="scroll_list2"]');

            var scroll1 = function(){

                var ul = parent.find('ul');

                if ($scope.scrollLimit < $scope.source.length) {
                    var offset = ul.position().top;
                    var parentHeight = parent.innerHeight();
                    var uiHeight = ul.outerHeight();

                    if (offset + uiHeight < parentHeight + 50) {
                        $scope.scrollLimit += 50
                    }

                    if(!$scope.$$phase) {
                        $scope.$digest()
                    }
                }
            };

            var scroll2 = function(){

                var ul = parent2.find('ul');

                if ($scope.scrollLimit2 < $scope.source.length) {
                    var offset = ul.position().top;
                    var parentHeight = parent2.innerHeight();
                    var uiHeight = ul.outerHeight();

                    if (offset + uiHeight < parentHeight + 50) {
                        $scope.scrollLimit2 += 50
                    }

                    if(!$scope.$$phase) {
                        $scope.$digest()
                    }
                }
            };

            if (parent.length) {
                parent.scroll(scroll1)
            }
            if (parent2.length) {
                parent2.scroll(scroll2)
            }

        })
    };

    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            // источник для взятия данных
            source: '=',
            // возможность поиска
            searchable: '@',
            settings: '@',
            service: '=',
            dependent: '=',
            unpacked: '=',
            explain: '@'
        },
        link: linker,
        controller: function($scope, $element, $attrs, $location, $http) {

            var settings = jQuery.extend({
                classPrefix: 'uni'
            }, angular.fromJson($scope.settings) || {});

            $scope.showSelectAll = $attrs['all'] != undefined;

            $element.ready(function() {
                //console.log('multicheckbox ready')
                $scope.$emit('directiveReady');
            });

            //console.log("initialize multicheckboxWithsearch")

            $scope.checkAll = true;

            $scope.scrollLimit = 50;
            $scope.scrollLimit2 = 50;

            $scope.displayLinks = []; // для отображения избранных операторов

            $scope.nick = $dataSource.getNickBySource($attrs['source']);

            $scope.setOperatorsOpen = function() {
                $rootScope.$broadcast('changeShowOperators', !$rootScope.operatorsOpen);
            };

            // получим значения фильтра
            $scope.getValues = function(items) {
                var value_id = $rootScope.searchParams[$scope.nick];
                if (!value_id)
                    value_id = '';
                value_id = String(value_id).split(',');

                var newArray = [];

                // Проверяем, что выбранные значение есть в списке элементов
                // ВОзвращаем только те значения, которые реально присутствуют среди элементов

                for (var idx in items) {
                    // Конвертирование в строку выполняется из-за того,
                    // что при выполнении split создается массив строк
                    // а inSrray выполняет строгое сравнение ===
                    // Т.е. если у нас id - это число, то inArray будет всегда -1
                    if (jQuery.inArray(String(items[idx].id), value_id) != -1)
                        newArray.push(items[idx].id)
                }
                //console.log('check multicheckbox', newArray)

                return newArray;
            };

            $scope.value = '';
            $scope.total_selected = 0;
            $scope.selected = {};
            $scope.selectSlide = false;

            var self = this;

            $scope.label = $attrs['label'];

            this.updateFilterStatus = function(items) {

                // В случае, если данных нет - выходим
                if (!items) {
                    return
                }
                $scope.count = items.length;

                var selected = $scope.getValues(items);
                $scope.selected = {};

                for (var idx in selected) {
                    $scope.selected[selected[idx]] = true;
                }

                //console.log(selected.length)
                $scope.total_selected = selected.length;
                $scope.checkAll = true;

                if ($scope.total_selected > 0) {
                    $scope.checkAll = false;
                    if ($scope.total_selected == 1) {
                        var selectTarget;
                        //console.log(selected)
                        for (var idx in items) {
                            if (items[idx].id == selected[0])
                                selectTarget = items[idx]
                        }
                        $scope.value = selectTarget.name
                    } else {
                        if ($attrs['selected'])
                            $scope.value = $attrs['selected'] + ": " + $scope.total_selected.toString();
                        else
                            $scope.value = "Объектов выбрано: " + $scope.total_selected.toString();
                    }
                } else {
                    $scope.value = ''
                }
            };

            $scope.setValues = function() {
                var data = $rootScope.searchParams;
                var selected = [];
                for (var idx in $scope.selected) {
                    if ($scope.selected[idx])
                        selected.push(idx)
                }

                if (selected.length || data[$scope.nick]) {
                    data[$scope.nick] = selected;
                    data.setUrl($rootScope.isIndexPage);
                }
            };

            $scope.toggleDisplayLinks = function(id, $event) {
                $scope.displayLinks[id] = !$scope.displayLinks[id];
            };

            $scope.$watch('source', function(newVal) {
                //console.log('completeInit')

                self.updateFilterStatus(newVal)
            });

            $scope.selectWithoutToggle = function(item) {
                var ind = $rootScope.searchParams[$scope.nick].indexOf(Number(item.id));
                if (ind + 1) {
                    $rootScope.searchParams[$scope.nick].splice(ind, 1);
                } else {
                    $rootScope.searchParams[$scope.nick].push(Number(item.id));
                }
                var data = $rootScope.searchParams;
                data.setUrl($rootScope.isIndexPage);
            };

            $scope.$on('$locationChangeSuccess', function() {

                //console.log('location change in multicheckboxWithsearch')

                self.updateFilterStatus($scope.source)
            });


            $scope.searchPopup = false;

            $scope.displaySearchPopup = function() {

                if (!$scope.searchPopup) {
                    $scope.value = '';
                }

                $scope.searchPopup = ! $scope.searchPopup;
                if (!$scope.searchPopup || !$scope.selectPopup) {
                    $scope.$emit('toggleBgForm');
                }
                $scope.selectPopup = false;
            };

            $scope.displaySelectSlide = function() {
                var options = $element.find('.uni-form-chooser-list-option');
                if (!$scope.selectSlide) {
                    $scope.value = '';
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
             * Для фильтра категории отелей
             */

                //Находим количество отмеченых чекбоксов в выпадающем списке "Прочее"
            $scope.getCountNonNumericChecked = function() {
                var selected = [];
                for (var idx in $scope.selected) {
                    if ($scope.selected[idx])
                        selected.push(idx)
                }

                $scope.selected = {};
                for (var idx in selected) {
                    $scope.selected[selected[idx]] = true;
                }

                var cnt = 0;
                for(var id in $scope.selected) {
                    for (var idx in $scope.source) {
                        if($scope.source[idx].id == id && isNaN(parseInt($scope.source[idx].name))) {
                            cnt++;
                        }
                    }
                }
                return cnt;
            };

            //Проверяем есть ли чекбоксы для списка "Прочее"
            $scope.existsNonNumericNames = function() {
                for (var idx in $scope.source) {
                    if (isNaN(parseInt($scope.source[idx].name))) {
                        return true;
                    }
                }
                return false;
            };

            //Фильтрация названий (без числовых итемов)
            $scope.filterNonNumericNames = function(item) {
                return !$scope.filterNumericNames(item);
            };

            //Фильтрация названий (только числовые итемы)
            $scope.filterNumericNames = function(item) {
                if (parseInt(item.name) > 0) {
                    return true;
                }
                return false;
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
            };

            $scope.displaySelectPopup = function() {

                $scope.selectPopup = ! $scope.selectPopup;
                if (!$scope.searchPopup || !$scope.selectPopup) {
                    $scope.$emit('toggleBgForm');
                }
                self.updateFilterStatus($scope.source);
                $scope.searchPopup = false;

                if ($scope.selectPopup) {
                    if ($scope.selectPopup) {

                        setTimeout(function() {
                            var div = $element.find('.chooser-form-dd-cnt');
                            if (! div.length)
                                return;
                            var rect = div.offset();
                            var window = $('body').height();

                            if ($element.find('.chooser-form-dd-list').parent().offset().top - $(document).scrollTop() + div.height() > window) {
                                $element.find('.chooser-form-dd-cnt')
                                    .css('top', String(- div.height()) + 'px')
                                    .css('position', 'absolute')
                            } else if ($element.find('.chooser-form-dd-list').parent().offset().top - $(document).scrollTop() + div.height() < window){
                                $element.find('.chooser-form-dd-cnt')
                                    .css('top', String($element.find('.chooser-form-dd-list').height()) + 'px')
                                    .css('position', 'absolute')
                            }
                        }, 200)

                    }
                }
            };

            $scope.use = function() {
                $scope.setValues();
                $scope.displaySelectPopup();

            };

            $scope.useSlide = function() {
                $scope.setValues()
            };

            $scope.resetSlide = function() {
                $scope._reset()
            };

            $scope.select = function (item) {
                $scope.selected[item.id] = !$scope.selected[item.id];
                $scope.setValues();
                $scope.displaySearchPopup();
            };

            $scope.reset = function() {
                $scope._reset();
                $scope.displaySelectPopup();
            };

            $scope._reset = function () {
                $scope.selected = {};
                $scope.setValues()
            };

            $scope.isSelected = function(item) {
                return $scope.selected[item.id]
            };

            $scope.isNotSelected = function(item) {
                return !$scope.selected[item.id]
            };

            $scope.getCount = function () {
                return $scope.source.length ? $scope.source.length : 0
            };

            $rootScope.$on('clickBgForm', function(e) {

                if ($scope.selectPopup) {
                    $scope.use();
                }

                if ($scope.searchPopup) {
                    $scope.displaySearchPopup();
                }
                if(!$scope.$$phase)
                    $scope.$digest()
            });

            //console.log("End initialize multicheckboxWithsearch")

            $scope.updateCheckAll = function() {
                $scope.checkAll = false;
                //console.log($scope.selected)
                for (var idx in $scope.selected) {
                    if ($scope.selected[idx]) {
                        return
                    }
                }
                //console.log($scope.checkAll)
                $scope.checkAll = true
            };



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
                //console.log('select next item')

                var root_of_li = null;

                if ($scope.selectPopup)
                    root_of_li = $element.find('.'+settings.classPrefix+'-form-dd-cnt2');
                else if ($scope.searchPopup)
                    root_of_li = $element.find('.'+settings.classPrefix+'-form-dd-cnt1');
                else
                    return;

                var el = root_of_li.find('.'+settings.classPrefix+'-form-dd-tabs li.'+settings.classPrefix+'-form-dd-i_active');
                el.removeClass(''+settings.classPrefix+'-form-dd-i_active');
                if (el.length && el.next().length) {
                    el.next().addClass(''+settings.classPrefix+'-form-dd-i_active');
                    root_of_li.find('.'+settings.classPrefix+'-form-dd-tabs_val').scrollTo(el.next())
                } else {
                    var list_if_li = root_of_li.find('.'+settings.classPrefix+'-form-dd-tabs li');
                    //console.log('not found', list_if_li)
                    if (list_if_li.length){
                        //console.log(list_if_li)
                        list_if_li.first().addClass(''+settings.classPrefix+'-form-dd-i_active');
                        root_of_li.find('.'+settings.classPrefix+'-form-dd-tabs_val').scrollTo(list_if_li.first())
                    }
                }
            };

            $scope.selectPrevItem = function() {
                //console.log('select prev item')

                var root_of_li = null;

                if ($scope.selectPopup)
                    root_of_li = $element.find('.'+settings.classPrefix+'-form-dd-cnt2');
                else if ($scope.searchPopup)
                    root_of_li = $element.find('.'+settings.classPrefix+'-form-dd-cnt1');
                else
                    return;

                var el = root_of_li.find('.'+settings.classPrefix+'-form-dd-tabs li.'+settings.classPrefix+'-form-dd-i_active');
                el.removeClass(''+settings.classPrefix+'-form-dd-i_active');
                if (el.length && el.prev().length) {
                    el.prev().addClass(''+settings.classPrefix+'-form-dd-i_active');
                    root_of_li.find('.'+settings.classPrefix+'-form-dd-tabs_val').scrollTo(el.prev())
                } else {
                    var list_if_li = root_of_li.find('.'+settings.classPrefix+'-form-dd-tabs li');
                    //console.log('not found', list_if_li)
                    if (list_if_li.length){
                        //console.log(list_if_li)
                        list_if_li.last().addClass(''+settings.classPrefix+'-form-dd-i_active');
                        root_of_li.find('.'+settings.classPrefix+'-form-dd-tabs_val').scrollTo(list_if_li.last())
                    }
                }
            };

            /**
             * У мультичекбоксов существует два варианта развития событий при сабмите. Первый - нажатие интер, второй - пробел
             * Если открыто оно выбора чекбоксов, то при нажатии интер должен произойти сабмит фильтров, а при нажатии пробела -
             * установлен или удален текущий выбранный чекбокс.
             *
             * Если же открыто окно поиска, то и интер и пробел должны вызвать сабмит формы.
             *
             * @param keycode
             */
            $scope.submit = function(keycode) {
                //console.log('submit directive')

                if ( ! $scope.selectPopup && ! $scope.searchPopup) {
                    $scope.displaySelectPopup();
                } else if ($scope.selectPopup) {
                    /**
                     * Мы просто инвертируем значение выбранного id в массиве selected при нажатии пробела.
                     * Это не вызывает проблем как в случае с триггированием клика
                     */
                    if (keycode == 13)
                        $scope.use();
                    else {
                        var root_of_li = $element.find('.'+settings.classPrefix+'-form-dd-cnt2');

                        var id = root_of_li.find('.'+settings.classPrefix+'-form-dd-i_active').find('[type=checkbox]').attr('rel');
                        $scope.selected[id] = !$scope.selected[id];
                        $scope.updateCheckAll()
                    }
                } else if ($scope.searchPopup) {
                    var root_of_li = $element.find('.'+settings.classPrefix+'-form-dd-cnt1');
                    $scope.click = function() {
                        setTimeout(function() {
                            //console.log(root_of_li.find('.'+settings.classPrefix+'-form-dd-i_active'))
                            root_of_li.find('.'+settings.classPrefix+'-form-dd-i_active').removeClass(''+settings.classPrefix+'-form-dd-i_active').trigger('click');
                        }, 0);
                    };
                    $scope.click()
                }
            };

            $scope.changeFavorite = function (item) {
                var action = 'add';
                if (item.fav) {
                    action = 'delete';
                }
                $http.get('/data/favalloc/?alloc=' + item.id + '&set=' + (action == 'add' ? 1 : 0)).success(function(data, status, headers, config) {
                    if (data == 1) {
                        var idx;
                        for (idx in $scope.source) {
                            if ($scope.source[idx].id == item.id) {
                                break;
                            }
                        }
                        if (action == 'add') {
                            $scope.source[idx].fav = true;
                        } else {
                            $scope.source[idx].fav = false;
                        }
                    }
                });
            }

        }
    }
}]);