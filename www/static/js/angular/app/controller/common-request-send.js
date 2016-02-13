var commonRequest = angular.module('commonRequest',[]); //,['ui.select2', 'debounce', 'auth', 'feedback', 'ngCookies']);
commonRequest.controller('commonRequestSend', ['$scope', '$rootScope', '$location', '$http', '$log', function($scope, $rootScope, $location, $http, $log) {
    const NO_OPEN_FORM = 0;
    const OPEN_SEND_REQUEST_FORM = 1;
    const OPEN_BUY_TOUR_FORM = 2;
    const OPEN_PHONE_CALLBACK_FORM = 4; // по моему в inputCommonRequestForm и передвалася по идее тип формы, нужно здесь ее определять(а также в модели Request),чтобы путаницы не было
    const TIMER_OPEN_PHONE_CALLBACK_FORM = 5;
    const TIMER_REQUEST_FORM = 8; // заявка из формы по таймеру
    const FROM_HOT_TOUR_REQUEST_FORM = 11;
    const FROM_HOTEL_REQUEST_FORM = 13;
    const BY_MAIL_FORM = 14;

    const TEXT_FORM = 0;
    const TEXT_FORM_BY_TIMER = 1;

    $rootScope.formType = NO_OPEN_FORM; // перезаписывался formType,скорее  всего из-за проблемы ng-if scope. через rootScope работает
    $scope.isFirstOpenRequestForm = true;
    $rootScope.hotTourId = '';
    $rootScope.user_fio = '';
    $scope.sendRequest = false;
    $scope.confirmRequest = false;
    $scope.formDirty = false;
    $scope.hideCallbackPhone = false;

    $scope.init = function() {
        if (localStorage.getItem('hideCallbackPhone')) {
            $scope.hideCallbackPhone = localStorage.getItem('hideCallbackPhone');
        }
        if($scope.isMobile()) {
            $scope.hideCallbackPhone = true;
        }
    }

    $scope.isMobile = function () {
        var mobileDesktopBreakPoint = 760;
        return (window.innerWidth < mobileDesktopBreakPoint);
    };


//    $scope.textRequestFormVariation =  window.variationTextForm;  // пока просто отключили этот эксперимент, показываем только новую текст форму
    $scope.textRequestFormVariation = 1;
    if (typeof $scope.textRequestFormVariation == 'undefined') {
        $scope.textRequestFormVariation = 0;
    }
    $scope.timerForm = Math.floor(Math.random() * 2);

    $(function() {
        $('body').on('click', '.banner_btn', function() {
            var id = $(this).prop('id');
            $scope.$apply(function() {
                $rootScope.hotTourId = id;
                $scope.inputCommonRequestForm(FROM_HOT_TOUR_REQUEST_FORM);
            });
        });
    });

    $scope.callbackPhoneHide = function() {
        $scope.hideCallbackPhone = true;
        localStorage.setItem('hideCallbackPhone', $scope.hideCallbackPhone);
    };

    $scope.inputCommonRequestForm = function(formType) {
        if(formType == FROM_HOTEL_REQUEST_FORM && isHotelPage() && $scope.items.length > 0) {
            //console.info($scope.items[0]);
            $rootScope.hotTourId = $scope.items[0].tourId.replace('%40','@');
        }
        console.info('hotTourId in inputCommonRequestForm: '+$rootScope.hotTourId);
        $rootScope.formType = parseInt(formType);
        console.info('formType in common-request-send inputCommonRequestForm: '+$rootScope.formType);
        $http({
            method: 'POST',
            url: '/request_form_open/log',
            params: {
                'form_type': $rootScope.formType
            }
        }).success(function (data) {
            if (data.status == 'ok') {
            } else {
            }
        }).error(function (data) {
        });
        if($rootScope.formType == OPEN_BUY_TOUR_FORM || $rootScope.formType == OPEN_SEND_REQUEST_FORM) {
            if(typeof ga !== 'undefined') {
                ga('send', 'event', 'TextRequest', 'TextRequestOpen', 'TextRequestOpen');
            }
        }
        if($rootScope.formType == OPEN_PHONE_CALLBACK_FORM) {
            console.info($rootScope.formType);
            if(typeof ga !== 'undefined') {
                ga('send', 'event', 'PhoneRequest', 'PhoneRequestOpen', 'PhoneRequestOpen');
            }
        }
        if($rootScope.formType == TIMER_REQUEST_FORM) {
            if ( $scope.timerForm ) {
                if(typeof ga !== 'undefined') {
                    ga('send', 'event', 'AggressiveForm', 'PhoneOpen', 'PhoneOpen');
                }
            } else {
                if(typeof ga !== 'undefined') {
                    ga('send', 'event', 'AggressiveForm', 'FullOpen', 'FullOpen');
                }
            }
        }
        if (!$rootScope.user.isAuth) {
            if (localStorage.getItem('user_email')) {
                $rootScope.user.email = localStorage.getItem('user_email');
            }
            if (localStorage.getItem('user_phone')) {
                $rootScope.user.phone = localStorage.getItem('user_phone');
            }
            if (localStorage.getItem('user_surname')) {
                $rootScope.user.surname = localStorage.getItem('user_surname');
            }
            if (localStorage.getItem('user_name')) {
                $rootScope.user.name = localStorage.getItem('user_name');
            }
            if (localStorage.getItem('user_patronymic')) {
                $rootScope.user.patronymic = localStorage.getItem('user_patronymic');
            }
            if (localStorage.getItem('user_fio')) {
                $rootScope.user_fio = localStorage.getItem('user_fio');
            }
            if (localStorage.getItem('request_comment')) {
                $scope.comment = localStorage.getItem('request_comment');
            }
        } else {
            var patronymic = ($rootScope.user.patronymic != undefined) ? ' ' + $rootScope.user.patronymic: '';
            $rootScope.user_fio = $rootScope.user.name + ' ' + $rootScope.user.surname + patronymic;
        }
        $scope.isFirstOpenRequestForm = false;
        $rootScope.offices = window.agencies;
        if ($rootScope.offices && $rootScope.offices.length !== 0) {
            $("select.payment_type_select").select2({
                formatResult: formatOption,
                formatSelection: formatOption
            });
        }
    };

    $scope.animateValidationErrors = function() {
        setTimeout(function() {
            var firstErrorElem = $('.submitted input.animate-errors.ng-invalid').not(':hidden').eq(0);
            if (!firstErrorElem.length) {
                return;
            }

            var scrollOffset = firstErrorElem.offset().top - 10;
            var needScroll = $(document).scrollTop() > scrollOffset;
            var highlightErrors = function() {
                setTimeout(function() {
                    var elems = $('.submitted input.animate-errors.ng-invalid').not(':hidden');
                    if (elems.length) {
                        elems.switchClass('', 'blink', 80).switchClass('blink', '', 180);
                    }
                },  100);
            };
            //$('html, body').animate({scrollTop: scrollOffset}, needScroll ? 500 : 1, highlightErrors);
        }, 1);
    };

    $scope.saveToLocalStorage = function(varName, val) {
        if (!$rootScope.user.isAuth) {
            if (val == undefined) {
                val = '';
            }
            localStorage.setItem(varName, val);
        }
        if(typeof(trim) == 'function') val = val.trim();
        if(varName == 'user_fio' && val) {
            var fioArr = val.split(' ');
            localStorage.setItem('user_surname', fioArr[0] ? fioArr[0] : '');
            $rootScope.user.surname = fioArr[0] ? fioArr[0] : '';
            localStorage.setItem('user_name', fioArr[1] ? fioArr[1] : '');
            $rootScope.user.name = fioArr[1] ? fioArr[1] : '';
            localStorage.setItem('user_patronymic', fioArr[2] ? fioArr[2] : '');
            $rootScope.user.patronymic = fioArr[2] ? fioArr[2] : '';
            localStorage.setItem(varName, val);
        }
        if (varName == 'request_comment') {
            $scope.comment = val;
        }
        $scope.formDirty = true;
    };

    $scope.send_comment = function () {

        $http({
            method: 'POST',
            url: '/comments/new_comment',
            params: {
                'name': $rootScope.user_fio ? $rootScope.user_fio : $rootScope.user.surname + ' ' + $rootScope.user.name,
                'country': 'country',
                'email': $rootScope.user.email,
                'text': $scope.textComment
            }
        }).success(function (data) {
            if (data.status == 'ok') {
                $scope.requestSendStage = 2;
                $scope.textComment = '';
            } else {
                $scope.requestSendStage = -2;

            }
        }).error(function (data) {
            $scope.requestSendStage = -2;
        });
    };

    /*
    $http.get('/tour/get_agencies')
        .then(function (response) {
            var agencies = response.data.agencies;
            $scope.offices = agencies;
            if (agencies && agencies.length !== 0) {
                $("select.payment_type_select").select2({
                    formatResult: formatOption,
                    formatSelection: formatOption
                });
            }
        }, function () {
            console.error('failed to load available offices');
        });
    */
    function formatOption(option) {
        var iconAttr = $(option.element[0]).attr('data-icon');
        var icons = '';
        if (iconAttr) {
            iconsArr = iconAttr.split(' ');
            for (var i = 0; i < iconsArr.length; i++) {
                icons += '<i class="fa ' + iconsArr[i] + '"></i>';
            }
        }
        if($(option.element[0]).prop('tagName').toLowerCase() == 'optgroup') {
            return $('<p>' + $(option.element).prop('label') + '</p>');
        }
        return $('<p>' + $(option.element).text() + icons + '</p>');
    }

    var paymentDontCare = 4;
    $scope.paymentType = paymentDontCare;

    $scope.$watch('paymentType', function (newValue, oldValue) {
        var payment = newValue + '', officeId, paymentType;
        if (payment.length > 2) {
            paymentType = payment[0];
            officeId = payment.substr(1);
        } else {
            paymentType = payment;
            officeId = null;
        }
        $scope.payment = paymentType;
        $scope.officeId = officeId;

        if ($scope.requestId) {
            $scope.updatePaymentInfo();
        } else if (newValue != oldValue) {
            //Надо дождаться когда заявка отправится и послать способ оплаты следом
            //Коллбек отправки заявки проверит этот флаг и если необходимо отправит способ оплаты
            $scope.paymentIsUpdating = true; //делаем вид, что уже начали обновлять
            $scope.paymentTypeChanged = true;
        }
    });

    $scope.updatePaymentInfo = function () {
        $scope.paymentIsUpdating = true;
        var params = {
            id: $scope.requestId,
            paymentType: $scope.payment,
            officeId: $scope.officeId
        };

        $http({
            method: 'POST',
            url: '/tour/request/update_request_payment_info',
            params: params
        })
            .then(function (response) {
                var data = response.data;
                if (typeof data == "string") {
                    console.log(data.split('}')[0] + '}');
                    // TODO: ???
                    data = JSON.parse(data.split('}')[0] + '}');
                }
                if (data.status == 'ok') {
                    $scope.paymentInfoAdded = true;
                }
            }, function (response) {

            }).finally(function () {
            $scope.paymentIsUpdating = false;
        });
    };

    $scope.sendCommonRequest = function (type, commonRequestForm) {
        console.log('type:' + type);
        $scope.confirmRequest = true;
        $scope.pressSubmit = true;

        if (commonRequestForm.$invalid) {
            $scope.animateValidationErrors();
            return;
        }
        //if ($scope.requestId) {
        //    swal('Вы уже отправили заявку. Наши менеджеры свяжутся с вами в ближайшее время');
        //    return;
        //}

        // TODO: sms-подтверждение временно выключено
        //if (!$scope.isSuccessPhoneVerification($scope.send_request)) {
        //    return;
        //}

        //if ($scope.tourConfig.notifyBySms) {
        //    data['notify_by_sms'] = $scope.tourConfig.notifyBySms;
        //    data['verify_phone_key'] = $scope.smsService.verifyKey;
        //}
        $scope.requestSendStage = 0;



        //var currentIndex = currentStepsList.find('.modal-step-link.current').index();

        if (0 == type) {
            var currentStepsList = $('.modal-step-links').filter(':visible');
            var currentIndex = currentStepsList.find('.modal-step-link.current').index();
            var currentlyHidden = $('.embedded_request').is(':visible') ? $('.modal_common_request') : $('.embedded_request');
            var activeOne = currentStepsList.closest('.modal_common_request').length ? $('.modal_common_request') : currentStepsList.closest('.embedded_request');
        } else if (1 == type) {
            var currentStepsList = $('.modal-step-links-timer').filter(':visible');
            var currentIndex = currentStepsList.find('.modal-step-link-timer.current').index();
            var currentlyHidden = $('.embedded_request').is(':visible') ? $('.modal_common_request_timer') : $('.embedded_request');
            var activeOne = currentStepsList.closest('.modal_common_request_timer').length ? $('.modal_common_request_timer') : currentStepsList.closest('.embedded_request');
        } else {
            $('.new-request-modal-step1').hide();
            $('.modal-text-request-title-step-1').hide();
            $('.new-request-modal-step2').show();
            $('.modal-text-request-title-step-2').show();
        }

        setTimeout(function() {
            if (0 == type) {
                activeOne.find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
                currentlyHidden.each(function() {
                    $(this).find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
                });
            } else if (1 == type) {
                activeOne.find('.modal-step-link-timer').eq(currentIndex+1).addClass('passed').click();
                currentlyHidden.each(function() {
                    $(this).find('.modal-step-link-timer').eq(currentIndex+1).addClass('passed').click();
                });
            }

        }, 0);

        //console.info($rootScope.formType); // почему то в 0 ставится
        if (type == OPEN_PHONE_CALLBACK_FORM) {
            $rootScope.formType = type;
            $('.new-request-modal-step1').hide();
            $('.new-request-modal-step2').show();
        }
        if (type == TIMER_OPEN_PHONE_CALLBACK_FORM) {
            $rootScope.formType = type;
        }
/*
        if (type == 1 || type == 3) { // форма по таймеру
            $rootScope.formType = TIMER_REQUEST_FORM;
        }
*/
        console.info('formType in common-request-send: '+$rootScope.formType);

                //$scope.buttonSubmitMessage = 'Подождите, мы отправляем Вашу заявку';
        $scope.sendRequest = true;
        
        if (!$rootScope.hotTourId) {
            // Без тура
            if ($rootScope.searchParams) {
                var requestParams = {
                    'id':0,
                    'user': $rootScope.user,
                    'test': $scope.testBooking ? 1 : 0,
                    'comment': $scope.comment?$scope.comment:'',
                    'transferSource': $scope.utmSource,
                    'city': $rootScope.searchParams['ct'],
                    'country': $rootScope.searchParams['co'] !== undefined ? $rootScope.searchParams['co'] : '',
                    'dates': $rootScope.searchParams['df'],
                    'duration': $rootScope.searchParams['nf'],
                    'resort': $rootScope.searchParams['re'] !== undefined ? $rootScope.searchParams['re'] : '',
                    'allocation':  $rootScope.searchParams['al'] !== undefined ? $rootScope.searchParams['al'] : '',
                    'meal': $rootScope.searchParams['me'] !== undefined ? $rootScope.searchParams['me'] : '',
                    'price': $rootScope.searchParams['price'],
                    'tourists': $rootScope.searchParams['rs'],
                    'formType': $rootScope.formType,
                    'locationHref': location.href
                };
            } else {
                var requestParams = {
                    'id':0,
                    'user': $rootScope.user,
                    'test': $scope.testBooking ? 1 : 0,
                    'comment': $scope.comment?$scope.comment:'',
                    'transferSource': $scope.utmSource,
                    'city': '',
                    'country': '',
                    'dates': '',
                    'duration': '',
                    'resort': '',
                    'allocation': '',
                    'meal': '',
                    'price': '',
                    'tourists': '',
                    'formType': $rootScope.formType,
                    'locationHref': location.href
                };
            }

            console.info(requestParams);

            if ($scope.searchChildAges) {
                requestParams['ch1'] = $scope.searchChildAges.ch1;
                requestParams['ch2'] = $scope.searchChildAges.ch2;
            }
            console.log('text_request_created');

            $http.post('/tour/request/text_request_empty_search/', JSON.stringify(requestParams))
            .then(function (response) {
                    var data = response.data;
                    if (data.status == 'error') {
                        $scope.requestSendStage = -1;
                        $log.info(data.message);
                        $scope.sendRequest = false;
                    } else {
                        if (!angular.isUndefined(data.requestId)) {
                            $scope.requestId = data.requestId;
                            $scope.requestSendStage = 1;
                            $log.info('Успешная отправка заявки из пустого поиска');
                            $scope.personalLink = false;
                            $rootScope.requests += 1;
                            if(typeof ga !== 'undefined') {
                                ga('send', 'event', 'TextRequest', 'TextRequestRequestSend', 'TextRequestRequestSend');
                                if (type == TEXT_FORM_BY_TIMER || type == 3) {
                                     ga('send', 'event', 'TextRequestByTimer', 'TextRequestByTimerSend', 'TextRequestByTimerSend');
                                }
                                if (type == 3) {
                                    ga('send', 'event', 'AggressiveForm', 'FullSubmit', 'FullSubmit');
                                }
                                if (type == 2) {
                                        ga('send', 'event', 'TextRequestByTimer', 'TextRequestSendNew', 'TextRequestSendNew');
                                }
                                if($rootScope.formType == OPEN_PHONE_CALLBACK_FORM) {
                                    ga('send', 'event', 'PhoneRequest', 'PhoneRequestSend', 'PhoneRequestSend');
                                }
                                if($rootScope.formType ==  TIMER_OPEN_PHONE_CALLBACK_FORM) {
                                    ga('send', 'event', 'AggressiveForm', 'PhoneSubmit', 'PhoneSubmit');
                                }
                            }
                            if (data.user != undefined) {
                                $rootScope.user = data.user;
                            }
                        } else {
                            $scope.requestSendStage = -1;
                            $log.info('При отправке заявки произошла ошибка');
                            $scope.tourError = "При отправке заявки произошла ошибка";
                            //$scope.showError = true;
                            $scope.reservationSendStage = -1;
                            $scope.sendRequest = false;
                            return false;
                        }
                    }
                }, function () {
                    $scope.requestSendStage = -1;
                    $log.info('При отправке заявки произошла ошибка');
                    $scope.tourError = "При отправке заявки произошла ошибка";
                    //$scope.showError = true;
                    $scope.reservationSendStage = -1;
                    $scope.sendRequest = false;
                    return false;
                }
            );
            return true;
        }
        
        var requestParams = {
            'id': $rootScope.hotTourId,
            'user': $rootScope.user,
            'comment': $scope.comment,
            'promo': '', // $scope.promo.code,
            'paymentType': $scope.payment,
            'test' : $scope.testBooking ? 1 : 0,
            'transferSource': $scope.utmSource,
            'form_type': $rootScope.formType
        };
        console.info(requestParams);

        if ($scope.searchChildAges) {
            requestParams['ch1'] = $scope.searchChildAges.ch1;
            requestParams['ch2'] = $scope.searchChildAges.ch2;
        }

        $http({
            method: 'POST',
            url: '/tour/request/confirm',
            params: requestParams
        }).success(function (data) {
            if (typeof data == "string") {
                data = parseJSON(data);
            }
            if (data.status == 'error') {
                $scope.requestSendStage = -1;
                $log.info(data.message);
                $scope.sendRequest = false;
            } else {
                if (!angular.isUndefined(data.requestId)) {
                    $scope.requestSendStage = 1;
                    $log.info('Сохранение информации о туре прошло успешно');
                    reachCounterGoal('BOOKING_PAGE_REQUEST_SUBMIT');
                    $log.info('Успешная отправка заявки');
                    if ($scope.showDayOffAlert) {
                        swal({title: $scope.showDayOffAlert});
                    }
                    $scope.requestId = data.requestId;
                    $scope.personalLink =  '/tour/request/detail?id=' + data.requestId;
                    $rootScope.requests += 1;
                    if ($scope.paymentTypeChanged || $('.select2-container.payment_type_select').is('.ng-dirty')) {
                        $scope.updatePaymentInfo();
                    }
                    if (data.user != undefined) {
                        $rootScope.user = data.user;
                        $rootScope.favorites = data.favorites;
                    }
                } else {
                    $scope.requestSendStage = -1;
                    $log.info('При отправке заявки произошла ошибка');
                    $scope.tourError = "При отправке заявки произошла ошибка";
                    //$scope.showError = true;
                    $scope.reservationSendStage = -1;
                    $scope.sendRequest = false;
                    return false;
                }
            }
        }).error(function (data) {
            $scope.sendRequest = false;
            $log.info('При сохранении информации о туре произошла ошибка');
            $log.info(JSON.stringify(data));
        });
    };

}]);

function parseJSON(input) {
    var parts = input.split('}');
    var string = parts[0] + '}';
    for(var i = 1; i < parts.length; ++i) {
        if ((string.split('{').length - 1) == i) {
            break;
        } else {
            string += parts[i] + '}';
        }
    }
    return JSON.parse(string);
}

$(function() {
    $('.modal-window-new-request .floatlabel').floatlabel();
    $('.alternative-country-info').on('hover',function(){
        if(typeof ga !== 'undefined') {
            ga('send', 'event', 'AlternativeCountry', 'AlternativeCountry: Focus', 'AlternativeCountry: Focus');
        }
    });
    $('.alternative-country-info-link').on('click',function(){
        if(typeof ga !== 'undefined') {
            ga('send', 'event', 'AlternativeCountry', 'AlternativeCountry: Click', 'AlternativeCountry: Click');
        }
    });
});


/*
angular.module('app').directive("openCommonRequest", function() {
    return {
        restrict: 'E',
        replace: true,
        template: function (element, attrs) {
            return '<a href="javascript:void(0);" class="banner_btn modal-trigger" data-target="common_request" data-toggle="popover" ng-click="inputCommonRequestForm(1,\'' + attrs.id + '\')">Забронировать</a>';
        },
        link: function (scope, element, attrs) {
            scope.inputCommonRequestForm = function(formType, tourId) {
                console.info(tourId);
            }
        }
    }
});
*/
/*
angular.module('app').directive("openCommonRequest", function($compile) {
    return{
        restrict: 'E',
        replace: true,
        link: function(scope, element, attrs) {
            var newElement = '<a href="javascript:void(0);" class="banner_btn modal-trigger" data-target="common_request" data-toggle="popover" ng-click="inputCommonRequestForm(1,\'' + attrs.id + '\')">Забронировать</a>';
            element.append( newElement );
            $compile($(newElement).contents())( scope );
            scope.inputCommonRequestForm = function(formType, tourId) {
                console.info(tourId);
                //$rootScope.hotTourId = tourId;
                //console.info($rootScope.hotTourId);
            };
        }
    }
})
*/