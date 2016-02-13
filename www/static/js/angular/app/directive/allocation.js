
angular.module('filters').directive('allocationLocal', ['$rootScope', 'templateLoader', '$log', function($rootScope, templateLoader, $log) {

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
        controller: function($scope, $element, $attrs, $location, $http, $rootScope) {
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

            $scope.nick = $scope.$parent.service.getNickBySource($attrs['source']);
            $scope.nickAllocCat = $scope.$parent.service.getNickBySource('service.alloccat');

            // получим значения фильтра
            $scope.getValues = function(nick) {
                return $rootScope.searchParams[nick];
            };

            $scope.getNameById = function(id, items) {
                for (var idx in items) {
                    if (items.hasOwnProperty(idx) && items[idx].id == id) {
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

            this.updateFilterStatus = function(items) {
                // В случае, если данных нет - выходим
                if (!items) {
                    return
                }
                if (!angular.isUndefined($scope.source.alloccat)) {
                    $scope.source.alloccat.forEach(function(allocCat) {
                        //Категория 3 звезды
                        if (8 == parseInt(allocCat.id)) {
                            allocCat.show = true;
                        }
                    });
                }

                $scope.count = $scope.source.length;

                var selected = $scope.getValues($scope.nick),
                    idx,
                    selectedAllocCat = $scope.getValues($scope.nickAllocCat);

                $scope.selected = {};
                $scope.selected[$scope.nick] = {};
                $scope.selected[$scope.nickAllocCat] = {};

                var longNick = 'allocations';

                for (idx in items[longNick]) {
                    if (items[longNick].hasOwnProperty(idx) && (selected.indexOf(parseInt(items[longNick][idx].id)) !== -1)) {
                        items[longNick][idx].selected = true;
                    }
                }

                for (idx in selected) {
                    if (selected.hasOwnProperty(idx)) {
                        $scope.selected[$scope.nick][selected[idx]] = true;
                    }
                }

                for (idx in selectedAllocCat) {
                    if (selectedAllocCat.hasOwnProperty(idx)) {
                        $scope.selected[$scope.nickAllocCat][selectedAllocCat[idx]] = true;
                    }
                }

                $scope.total_selected = selected.length + selectedAllocCat.length;
                $scope.checkAll = true;

                if ($scope.total_selected > 0) {
                    $scope.checkAll = false;
                    $scope.allocation_gray = 0;
                    $scope.allocation_black = 1;
                    var valueString = '', count;

                    if ($scope.total_selected == 1) {
                        if (selected.length > 0) {
                            $scope.value = $scope.getNameById(selected[0], items.allocations);
                        }
                        if (selectedAllocCat.length > 0) {
                            $scope.value = 'Категория ' + $scope.getNameById(selectedAllocCat[0], items.alloccat);
                        }
                        return;
                    }

                    if (selected.length > 0) {
                        var filterAllocationsStringHotel = $scope.get_ending(selected.length, ['отелей', 'отель', 'отеля']);
                        valueString += selected.length + " " + filterAllocationsStringHotel;
                    }

                    if (selectedAllocCat.length) {
                        var countHidden = $scope.getHiddenCount();
                        if (countHidden != 0) {
                            count = selectedAllocCat.length - countHidden + 1;
                        } else {
                            count = selectedAllocCat.length;
                        }
                        if (selected.length) {
                            valueString = 'отелей ' + (selected.length);
                        } else {
                            if (selectedAllocCat.length == 1) {
                                valueString = $scope.getNameById(selectedAllocCat[0], items.alloccat);
                            } else {
                                if (selectedAllocCat.length == countHidden) {
                                    valueString += 'Категория 2* и ниже';
                                } else {
                                    valueString += ' категорий ' + count;
                                }
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

            $scope.setValues = function() {
                var data = $rootScope.searchParams,
                    selected = [],
                    selectedAllocations = $scope.selected[$scope.nick],
                    selectedAllocCat = $scope.selected[$scope.nickAllocCat],
                    idx;

                for (idx in selectedAllocations) {
                    if (selectedAllocations.hasOwnProperty(idx) && selectedAllocations[idx]) {
                        selected.push(idx);
                    }
                }
                data.setValue($scope.nick, selected);

                selected = [];
                for (idx in selectedAllocCat) {
                    if (selectedAllocCat.hasOwnProperty(idx) && selectedAllocCat[idx]) {
                        selected.push(idx);
                    }
                }
                data.setValue($scope.nickAllocCat, selected);
                data.setUrl($rootScope.isIndexPage);
            };

            $scope.$watch('source', function(newVal) {
                self.updateFilterStatus(newVal)
            });

            $scope.$on('$locationChangeSuccess', function() {
                self.updateFilterStatus($scope.source)
            });

            $scope.displaySelectPopup = function() {
                $scope.searchValue = '';

                $scope.selectPopup = !$scope.selectPopup;

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
                $scope.setValues();

                if (nick == 'al') {
                    $rootScope.changedItemOffsetTop = $('#al_' + item.id).offset().top;
                }

                if (nick == 'ac') {
                    $rootScope.changedItemOffsetTop = $('#ac_' + item.id).offset().top;
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
            };


            $scope.$on('$hideOpenVariants', function() {
                $scope.selectPopup = false;
            });

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