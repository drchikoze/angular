var AngularHelper = {};

AngularHelper.setupPhpUrlSerialize = function(module) {
    module.config(function($httpProvider){

        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
//        $httpProvider.defaults.headers.common['Accept'] = 'text/html,application/xhtml+xml,application/xml;';

        $httpProvider.defaults.transformRequest = [function(data){
            var param = function(obj) {
                var query = '';
                var name, value, fullSubName, subValue, innerObj, i;

                for (name in obj) {
                    value = obj[name];
                    if (value instanceof Array) {
                        for (i = 0; i < value.length; ++i) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value instanceof Object) {
                        for (var subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                    }
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            };

            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];
    })
};

AngularHelper.datePickerDirective = function(module) {
    module.directive('tbDatepicker', function() {
        var res = {
            restrict: 'A',
            require : 'ngModel'
        };

        res.link = function (scope, element, attrs, ngModelCtrl) {
            // copypast from package_new
            function parseRusDate(string) {
                var parts = string.split('.');
                return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
            }

            var minDate = attrs['minDate'] !== undefined ? parseRusDate(attrs['minDate']) : null;
            var maxDate = attrs['maxDate'] !== undefined ? parseRusDate(attrs['maxDate']) : null;

            function validate(date, validatePartial) {
                if (date == undefined) {
                    date = '';
                }
                if (date == '' || datePattern.test(date)) {
                    var curDate = parseRusDate(date);
                    if (minDate && curDate.valueOf() < minDate.valueOf()) {
                        ngModelCtrl.$setValidity('minDate', false);
                        return;
                    } else {
                        ngModelCtrl.$setValidity('minDate', true);
                    }
                    if (maxDate && curDate.valueOf() > maxDate.valueOf()) {
                        ngModelCtrl.$setValidity('maxDate', false);
                        return;
                    } else {
                        ngModelCtrl.$setValidity('maxDate', true);
                    }
                    ngModelCtrl.$setValidity('date', true);
                    return date;
                } else if (date.length == 10 || validatePartial) {
                    ngModelCtrl.$setValidity('date', false);
                }
            }

            var beforeShow = attrs.beforeShowDay ? scope.$eval(attrs.beforeShowDay) : function() {return [true, ""]};
            var datePattern = /^\d{2}\.\d{2}\.\d{4}$/;

            element.bind('blur', function() {
                var date = element.val();
                scope.$apply(function() {
                    newDate = validate(date, true);
                    if (!angular.isUndefined(newDate)) {
                        ngModelCtrl.$setViewValue(newDate);
                    }
                });
            });

            element.keydown(datePickerOnKeyDown);

            ngModelCtrl.$parsers.push(function(date) {
                return validate(date);
            });

            var options = {
                dateFormat: 'dd.mm.yy',
                showDefault: true,
                changeMonth: true,
                changeYear: true,
                beforeShowDay: function (d) {
                    return beforeShow(d);
                },
                yearRange: attrs.yearRange || '1900:' + new Date().getFullYear(),
                showAnim: '',
                onSelect: function (date) {
                    scope.$apply(function() {
                        var validDate = validate(date);
                        if (validDate && ngModelCtrl.$modelValue != validDate) {
                            ngModelCtrl.$setViewValue(date);
                        }
                    });
                }
            };

            if (attrs['minDate'] !== undefined && attrs['minDate']) {
                options['minDate'] = attrs['minDate'];
            }

            if (attrs['maxDate'] !== undefined && attrs['maxDate']) {
                options['maxDate'] = attrs['maxDate'];
            }

            $(function() {
                element.datepicker(options);
            });
        };

        return res;
    });
};

AngularHelper.capitalizeDirective = function(module) {
    module.directive('capitalize', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                var capitalize = function(inputValue) {
                    var capitalized = inputValue.toUpperCase();
                    if(capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                };
                modelCtrl.$parsers.push(capitalize);
                if (scope[attrs.ngModel] !== undefined) {
                    capitalize(scope[attrs.ngModel]);  // capitalize initial value
                }
            }
        };
    })
};

AngularHelper.compileDirective = function(module) {
    module.directive('compile', function($compile){
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope){
                    return scope.$eval(attrs.compile);
                },
                function(value){
                    element.html(value);
                    $compile(element.contents())(scope);
                }
            );
        }
    });
};

AngularHelper.optionClass = function(module) {
    // Цельнотянуто с http://stackoverflow.com/questions/15264051/how-to-use-ng-class-in-select-with-ng-options
    module.directive('optionsClass', function ($parse) {
        return {
            require: 'select',
            link: function(scope, elem, attrs, ngSelect) {
                // get the source for the items array that populates the select.
                var optionsSourceStr = attrs.ngOptions.split(' ').pop(),
                // use $parse to get a function from the options-class attribute
                // that you can use to evaluate later.
                    getOptionsClass = $parse(attrs.optionsClass);

                scope.$watch(optionsSourceStr, function(items) {
                    // when the options source changes loop through its items.
                    angular.forEach(items, function(item, index) {
                        // evaluate against the item to get a mapping object for
                        // for your classes.
                        var classes = getOptionsClass(item),
                        // also get the option you're going to need. This can be found
                        // by looking for the option with the appropriate index in the
                        // value attribute.
                            option = elem.find('option[value=' + index + ']');

                        // now loop through the key/value pairs in the mapping object
                        // and apply the classes that evaluated to be truthy.
                        angular.forEach(classes, function(add, className) {
                            if(add) {
                                angular.element(option).addClass(className);
                            } else {
                                angular.element(option).removeClass(className);
                            }
                        });
                    });
                }, true);
            }
        };
    });
};

AngularHelper.onFinishRenderFiltersDirective = function(module) {
    module.directive('onFinishRenderFilters', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }
            }
        }
    });
};

AngularHelper.commonDirectives = function(module) {
    this.datePickerDirective(module);
    this.compileDirective(module);
    this.optionClass(module);
};

AngularHelper.repeat = function(module) {
    module.filter('repeat', function() {
        return function(input, times) {
            var result = '';
            for (var i = 0; i < times; i++) {
                result += input;
            }
            return result;
        }
    });
};
