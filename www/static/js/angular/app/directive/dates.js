angular.module('filters').directive('datesLocal', ['$rootScope', '$location', 'templateLoader', function($rootScope, $location, templateLoader) {

    // parse a date in dd-mm-yyyy format
    var parseDate = function(input) {
        if (!input) {
            return '';
        }
        var parts = input.split('-');
        return new Date(parts[2], parts[1]-1, parts[0]); // months are 0-based
    };

    var formatDatePart = function($part, $length) {
        $part = String($part);
        if ($length - $part.length != 0)
            return Array($length - $part.length + 1).join('0') + $part;
        return $part;
    };

    function highlightOdds(date) {
        if ($rootScope.availableDates) {
            if ($rootScope.availableDates.indexOf($.datepicker.formatDate( "yy-mm-dd", date )) >= 0) {
                return [true, 'odd'];
            } else {
                return [true, ''];
            }

        } else {
            return [true, ''];
        }
    }

    /**
     * Линковка нужного шаблона в зависимости от фильтра
     * @param $scope
     * @param $element
     * @param $attrs
     */
    var linker = function($scope, $element, $attrs) {

        /**
         * Создаем набор стартовых значений для шаблонизации вывода.
         *
         * В шаблоне мы можем использовать {{date.from.D}} и любой другой формат из указанных.
         * Индикатором того, что дата верна является переменная exists
         *
         * ng-show="date.from.exists"
         *
         * @type {{from: {d: string, dd: string, M: string, mm: string, yy: string, D: string, MM: string, exists: bool},
         * to: {d: string, dd: string, M: string, mm: string, yy: string, D: string, MM: string, exists: bool}}}
         */
        $scope.date = {
            from: {
                d: '',
                dd: '',
                M: '',
                mm: '',
                yy: '',
                D: '',
                MM: '',
                exists: false
            },
            to: {
                d: '',
                dd: '',
                M: '',
                mm: '',
                yy: '',
                D: '',
                MM: '',
                exists: false
            }
        };

        var loader = templateLoader.loader($scope, $element, $attrs)

        loader.success(function() {
            var nickDateF = 'df';
            var nickDateT = 'dt';

            $scope.df = '';
            $scope.dt = '';

            var numberOfMonths = 1;
            if (typeof($attrs['numberOfMonths']) != 'undefined') {
                numberOfMonths = $attrs['numberOfMonths'];
            }

            $element.find('[dp="from"], [dp="to"]').datepicker({
                monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
                //monthNames:['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
                //monthNamesShort: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
                monthNamesShort: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
                dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
                dayNamesShort: ['вс','пн','вт','ср','чт','пт','сб'],
                dateFormat: 'd dd M mm yy D MM',
                numberOfMonths: numberOfMonths,
                firstDay: 1,
                inline: true,
                beforeShowDay: highlightOdds,
                minDate: new Date(),
                onClose: function(){
                    $element.find('.uni-form-calend-tab').removeClass('uni-form-calend-tab_active');
                    $scope.$emit('toggleBgForm');
                    $scope.$apply();
                },
                beforeShow: function() {
                    setTimeout(function(){
                        $('.ui-datepicker').css('z-index', 99999999999999);
                    }, 0);
                },
                onSelect: function(dateText, inst) {
                    var date = $(this).datepicker('getDate'),
                        day  = date.getDate(),
                        month = date.getMonth() + 1,
                        year =  date.getFullYear();

                    var dfInput = $element.find('[dp="from"]');
                    var dtInput = $element.find('[dp="to"]');

                    var locationData = $rootScope.searchParams;

                    if ($(this).attr('dp') == 'from') {
                        locationData[nickDateF] = formatDatePart(day, 2) + '-' + formatDatePart(month, 2) + '-' + formatDatePart(year, 4);
                        // если дата "до" выбрана (не "все") и меньше даты "от"
                        if ( (dtInput.datepicker('getDate')) && (dtInput.datepicker('getDate') < date) ) {
                            locationData[nickDateT] = locationData[nickDateF];
                        }
                    } else {
                        locationData[nickDateT] = formatDatePart(day, 2) + '-' + formatDatePart(month, 2) + '-' + formatDatePart(year, 4);
                        if ( (dfInput.datepicker('getDate') > date) ) {
                            locationData[nickDateF] = locationData[nickDateT];
                        }
                    }

                    if (dtInput.size() == 0) {
                        locationData[nickDateT] = formatDatePart(day, 2) + '-' + formatDatePart(month, 2) + '-' + formatDatePart(year, 4);
                    }
                    locationData.setUrl($rootScope.isIndexPage);
                    $element.find('.uni-form-calend-inp').change();
                    //$location.search(locationData)
                }
            });

            $element.find('.uni-form-calend-inp').change(function () {
                var str = $(this).val();
                var date_type = $(this).attr('dp');

                var monthNames = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

                if (str) {
                    var parts = str.split(' ');

                    $scope.date[date_type]['d'] = parts[0];
                    $scope.date[date_type]['dd'] = parts[1];
                    $scope.date[date_type]['M'] = parts[2];
                    $scope.date[date_type]['mm'] = parts[3];
                    $scope.date[date_type]['yy'] = parts[4];
                    $scope.date[date_type]['D'] = parts[5];
                    $scope.date[date_type]['MM'] = parts[6];
                    //Заголовок календаря должен быть в именительном, текст же - в родительном, parts[3] - номер месяца в году, начинается с 1
                    $scope.date[date_type]['MM_inline'] = monthNames[parts[3] - 1];
                    $scope.date[date_type]['exists'] = true;

                } else {
                    $scope.date[date_type]['exists'] = false
                }
                $('.uni-form-calend-tab').removeClass('uni-form-calend-tab_active');
            });

            $element.find('.uni-form-calend-tab').mousedown(function (e) {
                if ( $(this).hasClass('uni-form-calend-tab_active') ){
                    $(this).find('input.hasDatepicker').datepicker('hide');
                } else {
                    $(this).addClass('uni-form-calend-tab_active').children('.uni-form-calend-inp').focus();
                    $scope.$emit('toggleBgForm');
                    $scope.$apply();
                }
                e.stopPropagation()
            });

            $scope.$watch('source', function (newVal) {
                if (!newVal) {
                    var data = $rootScope.searchParams;
                    $scope.updateFilter(data['df'], data['dt']);
                } else {
                    $scope.updateFilter(newVal['datef'], newVal['datet']);
                }
            });

            /**
             * Мониторим изменение адресной строки
             * Если что-то поменялось, то мы должны синхронизировать отображение с данными
             */
            $scope.$on('$locationChangeSuccess', function() {
                $scope.updateFilter($rootScope.searchParams[nickDateF], $rootScope.searchParams[nickDateT]);
            });

            /**
             * Обновление фильров новыми данными
             *
             * @param df
             * @param dt
             */
            $scope.updateFilter = function (df, dt) {
                $element.find('[dp="from"]').datepicker('setDate', parseDate(df));
                $element.find('[dp="to"]').datepicker('setDate', parseDate(dt));
                $element.find('.uni-form-calend-inp').trigger('change');
            };

            $rootScope.$on('clickBgForm', function(e) {
                $element.find('input').datepicker('hide');
            });

            $scope.showDf = function() {
                $element.find('[dp="from"]').datepicker('show');
                $scope.$emit('toggleBgForm');
            };
        })
    };

    return {
        restrict: 'E',
        transclude: true,
        scope: {
            source: '='
        },
        link: linker
    }
}]);