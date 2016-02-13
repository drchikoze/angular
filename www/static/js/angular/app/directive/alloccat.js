
angular.module('filters').directive('alloccatLocal', ['$rootScope', 'templateLoader', function($rootScope, templateLoader) {

    /**
     * Линковка нужного шаблона в зависимости от фильтра
     * @param $scope
     * @param $element
     * @param $attrs
     */
    var linker = function($scope, $element, $attrs) {
        var loader = templateLoader.loader($scope, $element, $attrs);

        loader.success(function() {
            //$element.find('input[type="text"]').prop('disabled', ! $scope.searchable);

            var parent = $element.find('[rel="scroll_list"]'),
                parent2 = $element.find('[rel="scroll_list2"]');

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
                        $scope.$apply()
                    }
                }
            };

            var scroll2 = function(){
                var ul = parent2.find('ul');

                if ($scope.scrollLimit2 < $scope.source.length) {
                    var offset = ul.position().top,
                        parentHeight = parent2.innerHeight(),
                        uiHeight = ul.outerHeight();

                    if (offset + uiHeight < parentHeight + 50) {
                        $scope.scrollLimit2 += 50;
                    }

                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            };

            if (parent.length) {
                parent.scroll(scroll1);
            }

            if (parent2.length) {
                parent2.scroll(scroll2);
            }
            $('.alloccat-title-inp').click();

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
            unpacked: '='
        },
        link: linker,
        controller: function($scope, $element, $attrs, $location, $http) {
            var settings = jQuery.extend({
                classPrefix: 'uni'
            }, angular.fromJson($scope.settings) || {});

            $scope.showSelectAll = $attrs['all'] != undefined;

            $element.ready(function() {
                $scope.$emit('directiveReady');
            });

            $scope.checkAll = true;

            $scope.scrollLimit = 50;
            $scope.scrollLimit2 = 50;

            $scope.alloccatSelectPopup = true;

            $scope.nick = $scope.$parent.service.getNickBySource($attrs['source']);
            $scope.nickAllocCat = $scope.$parent.service.getNickBySource('service.alloccat');

            // получим значения фильтра
            $scope.getValues = function(nick) {
                return $rootScope.searchParams[nick];
            };

            $scope.getNameById = function(id, items) {
                for (var idx in items) {
                    if (items[idx].id == id) {
                        return  items[idx].name;
                    }
                }

                return '';
            };

            $scope.value = '';
            $scope.searchValue = '';
            $scope.total_selected = 0;
            $scope.selected = {};

            var self = this;

            $scope.label = $attrs['label'];

            $scope.$watch("selected", function() {
                $scope.selectedHide = false;
                if (!angular.isUndefined($scope.source.alloccat)) {
                    $scope.source.alloccat.forEach(function(allocCat) {
                        if (!allocCat.show && allocCat.selected) {
                            $scope.selectedHide = true;
                        }
                    });
                }
            });

            $scope.getNumber = function(num) {
                if(isNaN(num)) {
                    return new Array(0);
                }
                return new Array(num);
            };

            this.updateFilterStatus = function(items) {
                // В случае, если данных нет - выходим
                if (!items) {
                    return
                }
                if (!angular.isUndefined($scope.source.alloccat)) {
                    $scope.source.alloccat.forEach(function(allocCat) {
                        allocCat.intName = parseInt(allocCat.name);

                        //Категория 3 звезды
                        if (8 == parseInt(allocCat.id)) {
                            allocCat.show = true;
                        }
                    });
                }
                $scope.count = $scope.source.length;

                var selected = $scope.getValues($scope.nick, items.allocations),
                    selectedAllocCat = $scope.getValues($scope.nickAllocCat, items.alloccat);

                $scope.selected = {};
                $scope.selected[$scope.nick] = {};
                $scope.selected[$scope.nickAllocCat] = {};

                for (var idx in selected) {
                    $scope.selected[$scope.nick][selected[idx]] = true;
                }

                for (var idx in selectedAllocCat) {
                    $scope.selected[$scope.nickAllocCat][selectedAllocCat[idx]] = true;
                }

                $scope.total_selected = selected.length + selectedAllocCat.length;
                $scope.checkAll = true;

                if ($scope.total_selected > 0) {
                    $scope.checkAll = false;
                    var valueString = '';

                    if ($scope.total_selected == 1) {
                        if (selectedAllocCat.length > 0) {
                            $scope.allocation_gray = 0;
                            $scope.allocation_black = 1;
                            $scope.value = 'Категория ' + $scope.getNameById(selectedAllocCat[0], items.alloccat);
                        }
                        return;
                    }


                    if (selectedAllocCat.length) {
                        $scope.allocation_gray = 0;
                        $scope.allocation_black = 1;
                        countHidden = $scope.getHiddenCount();
                        if (countHidden != 0) {
                            if(countHidden == selectedAllocCat.length) {
                                valueString += 'Категория 2* и ниже';
                            } else {
                                count = selectedAllocCat.length - countHidden + 1;
                            }
                        } else {
                            count = selectedAllocCat.length;
                        }
                        if(countHidden !== selectedAllocCat.length) {
                            if (selectedAllocCat.length == 1) {
                                valueString = $scope.getNameById(selectedAllocCat[0], items.alloccat);
                            } else {
                                valueString += ' категорий ' + count;
                            }
                        }
                    }

                    if ($attrs['selected'])
                        $scope.value = $attrs['selected'] + " " + valueString.toString();
                    else
                        $scope.value = valueString.toString();
                } else {
                    $scope.allocation_gray = 1;
                    $scope.allocation_black = 0;
                    if ($attrs['label']) {
                        $scope.value = $attrs['label'];
                    } else {
                        $scope.value = '';
                    }
                }
            };

            $scope.setValues = function(search) {
                var data = $rootScope.searchParams,
                    selected = [],
                    selectedAllocCat = $scope.selected[$scope.nickAllocCat],
                    idx;

                selected = [];
                for (idx in selectedAllocCat) {
                    if (selectedAllocCat[idx]) {
                        selected.push(idx);
                    }
                }

                if (selected.length || data[$scope.nickAllocCat]) {
                    data[$scope.nickAllocCat] = selected;
                }

                if (search) {
                    data.setUrl($rootScope.isIndexPage);
                }
            };

            $scope.$watch('source', function(newVal) {
                self.updateFilterStatus(newVal)
            });

            $scope.$on('$locationChangeSuccess', function() {
                self.updateFilterStatus($scope.source)
            });

            $scope.displaySelectPopup = function() {
                $scope.searchValue = '';

                $scope.alloccatSelectPopup = !$scope.alloccatSelectPopup;

                $scope.$emit('toggleBgForm');

                self.updateFilterStatus($scope.source);

                if ($scope.selectPopup) {
                    setTimeout(function() {
                        var div = $element.find('.chooser-form-dd-cnt');
                        if (! div.length) {
                            return;
                        }

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
            };

            $scope.use = function() {
                $scope.setValues(1);
                $scope.displaySelectPopup();

            };

            $scope.select = function (nick, item) {
                if (typeof($scope.selected[nick]) == 'undefined') {
                    $scope.selected[nick] = {};
                }

                $scope.selected[nick][item.id] = !$scope.selected[nick][item.id];
                $scope.setValues(nick == 'ac' ? 1 : 0);

                if (nick == 'ac') {
                    self.updateFilterStatus($scope.source);
                }
            };

            $scope.selectHideFunction = function () {
                $scope.selectedHide = !$scope.selectedHide;
                $scope.source.alloccat.forEach(function(elem) {
                    if (!elem.show) {
                        $scope.selected[$scope.nickAllocCat][elem.id] = $scope.selectedHide;
                        elem.selected = $scope.selectedHide;
                    }
                });
                $scope.setValues(1);
                self.updateFilterStatus($scope.source);
                z = 1;
            };

            $scope.reset = function() {
                $scope._reset();
                $scope.displaySelectPopup();
            };

            $scope._reset = function () {
                $scope.selected = {};
                $scope.selected[$scope.nick] = {};
                $scope.selected[$scope.nickAllocCat] = {};
                $scope.setValues()
            };

            $scope.$on('$hideOpenVariants', function() {
                $scope.selectPopup = false;
                $scope.alloccatSelectPopup = true;
            });

            $scope.isSelected = function(nick, item) {
                return $scope.selected[nick][item.id]
            };

            $scope.isNotSelected = function(nick, item) {
                return !$scope.selected[nick][item.id]
            };

            $scope.getCount = function () {
                return $scope.source.length ? $scope.source.length - $scope.getHiddenCount() : 0
            };

            $scope.getHiddenCount = function() {
                var countHidden = 0;
                if ($scope.source.alloccat) {
                    $scope.source.alloccat.forEach(function (allocCat) {
                        if (!allocCat.show && allocCat.selected) {
                            countHidden++;
                        }
                    });
                }
                return countHidden;
            };

            $rootScope.$on('clickBgForm', function(e) {
                if ($scope.selectPopup) {
                    $scope.use();
                }

                if(!$scope.$$phase) {
                    $scope.$apply()
                }
            });

            $scope.close = function() {
                if ($scope.selectPopup) {
                    $scope.displaySelectPopup();
                }
            };

            $scope.get_ending = function(num, decode){
                num = num % 100;
                var digit = num % 10;
                var ending = 0;
                if(num == 1 || (num > 20 && digit == 1))
                    ending = 1;
                else if(num > 1 && num < 5 || (num > 20 && digit > 1 && digit < 5))
                    ending = 2;
                else
                    ending = 0;

                if(decode != undefined)
                    return decode[ending];
                else
                    return ending;
            };

            /**
             * У мультичекбоксов существует два варианта развития событий при сабмите. Первый - нажатие интер, второй - пробел
             * Если открыто окно выбора чекбоксов, то при нажатии интер должен произойти сабмит фильтров, а при нажатии пробела -
             * установлен или удален текущий выбранный чекбокс.
             *
             * Если же открыто окно поиска, то и интер и пробел должны вызвать сабмит формы.
             *
             * @param keycode
             */
            $scope.submit = function(keycode) {
                if (!$scope.selectPopup) {
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
                }
            };

        }
    }
}]);