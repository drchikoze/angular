// TODO: костыль
_TB_APP_MODULE = 'bookingApp';

var app = angular.module('bookingApp', ['ui.select2', 'ui.date', 'debounce', 'auth', 'feedback', 'ngCookies', 'header-search', 'commonRequest']);
AngularHelper.datePickerDirective(app);

app.controller('MainController', ['$scope', '$rootScope', 'HistoryGate', '$location', function($scope, $rootScope, HistoryGate, $location){
    $scope.bodyClick = function() {
        $rootScope.$broadcast('$bodyClick');
    };
    $scope.shortTourId = window.shortTourId;
    $scope.longTourId = window.longTourId;
    var historyGate = new HistoryGate();
    historyGate.clearReturnParam();
    historyGate.setShortTourId($scope.longTourId, $scope.shortTourId);
    $scope.backUrl = window.backUrl;
    $scope.sendRequest = false;
    $scope.possiblyReservation = false;
    $scope.showError = false;
    $scope.hotelInfoList = '';
}]);

app.controller('OrderController', ['$scope', '$http', function($scope, $http){
    $scope.payment = {paymentType: 'terminal'};
    $scope.selectedAlt = null;
    $scope.paxList = window.paxList;
    $scope.buyer = window.buyer;
    $scope.buyer.citizenshipId = 63;

    $scope.saveRequestTourists = function (id) {
        $scope.pressSubmitContacts = true;
        if ($scope.contactsForm.$invalid) {
            $scope.animateValidationErrors();
            //sweetAlert('Проверьте правильность заполнения данных', '', "error");
            return;
        }
        var dataToSend = {paxList: $scope.paxList.pax, buyer: $scope.buyer, requestId: id};
        $http({
            method: 'POST',
            url: '/tour/request/save_tourists', data: dataToSend
        }).success(function(){
            location.reload();
        });

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
            $('html, body').animate({scrollTop: scrollOffset}, needScroll ? 500 : 1, highlightErrors);
        }, 1);
    };

    $scope.selectAlternative = function(tourId, id) {
        var data = {tour_id: tourId, id: id};

        $http({
            method: 'POST',
            url: '/my_tour/accept_alternative', params: {params: data}
        }).success(function(data){
            if (data.status == 'ok') {
                $scope.selectedAlt = id;
            }

            if (data.status == 'error') {
                alert(data.message);
            }
        });

    };

    $scope.declineReservation = function(tourId) {
        var data = {tour_id: tourId};

        $http({
            method: 'POST',
            url: '/my_tour/decline_reservation', params: {params: data}
        }).success(function(data){
            if (data.status == 'ok') {
                document.location.href = "/my_tour/";
            }

            if (data.status == 'error') {
                alert(data.message);
            }

            if (!data.status) {
                alert('Ошибка отправки данных');
            }
        }).error(function() {
            alert('Ошибка отправки данных');
        });

    };

}]);

app.controller('PaxEditController', ['$scope', '$http', '$log', '$rootScope', '$cookies', '$timeout', '$interval', '$q', function ($scope, $http, $log, $rootScope, $cookies, $timeout, $interval, $q) {
    $scope.$watch('tourConfig.paxList', function() {
        if ($scope.timer !== undefined) {
            $timeout.cancel($scope.timer);
        }
        $scope.timer = $timeout(savePaxListToCookies, 500);
    }, true);
    const NO_OPEN_FORM = 0;
    const OPEN_SEND_REQUEST_FORM = 1;
    const OPEN_BUY_TOUR_FORM = 2;

    $scope.textComment = '';
    $scope.agree = false;
    $scope.sendRequest = false;
    $scope.testBooking = false;
    $scope.user.email = $rootScope.user.email;
    $scope.payment = {paymentType: 'terminal'};
    $scope.tourError = null;
    $scope.showError = false;
    $scope.tourConfig = window.angularData;
    $scope.operatorId = window.operatorId;
    $scope.tourInfo_city = window.tourInfo_city;
    $scope.tourInfo_dates = window.tourInfo_dates;
    $scope.tourInfo_duration = window.tourInfo_duration;
    $scope.tourInfo_tourists = window.tourInfo_tourists;
    $scope.tourInfo_resort = window.tourInfo_resort;
    $scope.tourInfo_allocation = window.tourInfo_allocation;
    $scope.tourInfo_meal = window.tourInfo_meal;
    $scope.tourInfo_price = window.tourInfo_price;

//    $scope.experimentVariation = window.variation; // отключили пока эсперимент
    var searchArr = decodeURIComponent(location.search.substr(1)).split('&');
    if(searchArr.length > 0 && searchArr[0] == 'type') {
        var typeArr = searchArr[0].split('=');
        $scope.experimentVariation = typeArr[1];
    } else {
        $scope.experimentVariation = Math.random() < 0.5 ? 0 : 1;
        if (typeof $scope.experimentVariation == 'undefined') {
            $scope.experimentVariation = 0;
        }
    }
    console.info('experimentVariation='+$scope.experimentVariation);
    //$scope.experimentVariationArrowRequest = window.variationArrowRequest;
    console.info('experimentVariationArrowRequest='+$scope.experimentVariationArrowRequest);

    $scope.noNeedPersonsInfo = false;
    if (window.operatorConfig) {
        $scope.testOperatorConfig = window.operatorConfig;
    } else {
        $scope.testOperatorConfig = {};
    }
    $scope.hotelAvailability = {};
    $scope.hotelAvailability.content = window.hotelAvailabilityContent;
    $scope.hotelAvailability.class = window.hotelAvailabilityClass;
    $scope.hotelAvailability.description = window.hotelAvailabilityDescription;
    $scope.dateIntervalInHotel = window.dateIntervalInHotel;
    $scope.showPreloadByUser = false;
    $scope.isFirstOpenReservationForm = true;
    $scope.isFirstOpenRequestForm = true;
    $scope.subscriptionMode = window.subscriptionMode;

    $scope.currentPrice = {};
    $scope.searchChildAges = window.jsData.searchChildAges;

    $scope.priceInSearch = {
        price: window.searchPriceValue,
        priceRur: window.searchPriceRurValue
    };

    $scope.priceChanged = false;

    $scope.smsService = {phoneVerified: false, verifyCodeKey: null, verifyKey: null, verifyCode: null, verificationDisabled: null};

    $scope.smsService.phoneVerificationDisabled = window.phoneVerificationDisabled;

    $scope.serviceSectionsLoaded = false;

    $scope.resendCountdown = 60;

    $scope.createRequest = {};
    $scope.createRequest.form = null;

    var savePaxListToCookies = function() {
        $scope.pax = JSON.stringify($scope.tourConfig.paxList);
        var data = angular.toJson($scope.tourConfig.paxList);
        $http({method: 'POST', url: '/tour/save_persons_data', params: {params: data}}).success(function(data){
        });
    };

    $scope.test = function(value) {
        $scope.saveToLocalStorage('user_surname', value);
        if (value == 'test1807') {
            $scope.testOperatorConfig.show = true;
            $scope.tourConfig.paxList = window.fakePaxList;
            $scope.agree = [];
            $scope.payment = {paymentType : "terminal_tourpay"};
            $rootScope.user.name = 'test';
            $rootScope.user.surname = 'test';
            $rootScope.user.patronymic = 'test';
            $rootScope.user.patronymic = 'test';
            $rootScope.user.phone = '+7 (999) 999 99 99';
            $scope.testBooking = true;
            $scope.possiblyReservation = true;
        }
    };

    $scope.tourConfig = window.angularData;
    $scope.tourConfig['notifyBySms'] = false;

    $scope.showDayOffAlert = window.showDayOffAlert;


    // только для подписи нумерации, криво, но так проще всего
    $scope.adultAmount = 0;
    for (var i = 0; i < $scope.tourConfig.paxList.length; i++) {
        if (!$scope.tourConfig.paxList[i].child) {
            $scope.adultAmount++;
        }
    }
    $scope.emailExist = false;
    $scope.formDirty = false;
    $scope.confirmRequest = false;
    $scope.loginError = null;
    $scope.showLoader = false;
    $scope.showRestorePasswordLoader = false;
    $scope.showRestorePasswordLink = true;
    $scope.restorePasswordMessage = null;
    $scope.loginError = null;
    $rootScope.comment = '';
    $scope.numberFormAuthInput = 0;
    $scope.isActualData = false;
    $scope.presumedSurcharge = null;
    $scope.watchTour = {
        email: $scope.user.email,
        phone: $scope.user.phone,
        notify: false,
        similar: true,
        desiredPrice: '',
        desiredPriceDefault: window.searchPriceRurValue,
        inFavorites: window.inFavorites,
        inSubscriptions: window.inSubscriptions,
        watcherId: window.watcherId,
        formType: 0
    };
    $scope.promo = {
        code: '',
        price: '',
        discount: '',
        checking: false
    };
    $scope.action_type = 1;
    $scope.numberRequestInputs = 0;

    $scope.showPhoneVerification = false;

    $scope.priceChangesIntervalId = null;
    
    $scope.reSendCountdownInterval = null;

    $scope.utmSource = window.comeFrome;

    //$scope.formType = NO_OPEN_FORM;

    $scope.inputRequestForm = function(formType) {
        $scope.formType = parseInt(formType);
        $http({
            method: 'POST',
            url: '/request_form_open/log',
            params: {
                'form_type': $scope.formType
            }
        }).success(function (data) {
            if (data.status == 'ok') {
            } else {
            }
        }).error(function (data) {
        });
        if($scope.formType == OPEN_BUY_TOUR_FORM || $scope.formType == OPEN_SEND_REQUEST_FORM) {

            //временно убираем эксперимент про баннер со стрелочкой
            if(typeof ga !== 'undefined' && $scope.experimentVariationArrowRequest) {
                ga('send', 'event', 'Request', 'RequestExperimentOpen', 'RequestExperimentOpen');
            }

            if(typeof ga !== 'undefined') {
                ga('send', 'event', 'Request', 'RequestOpen', 'RequestOpen');
                if($scope.experimentVariation == 1) { // новая форма
                    ga('send', 'event', 'NewRequest', 'NewRequestOpen', 'NewRequestOpen');
                } else {
                    ga('send', 'event', 'OldRequest', 'OldRequestOpen', 'OldRequestOpen');
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
            $rootScope.user_fio = $rootScope.user.surname + ' ' + $rootScope.user.name + patronymic;
        }
        $scope.isFirstOpenRequestForm = false;
        $log.info('Открыта вкладка создания заявки');
        var dataToSend = {tourId: $scope.tourConfig.id, source: 'request_open', transferSource: $scope.utmSource};
        $http({
            method: 'POST',
            url: '/tour/request_form', params: {params: dataToSend}
        }).success(function(receivedData){
        });
        reachCounterGoal('BOOKING_PAGE_REQUEST_OPEN');
        $scope.numberRequestInputs++;
        $scope.offices = window.agencies;
        if ($scope.offices && $scope.offices.length !== 0) {
            $("select.payment_type_select").select2({
                formatResult: formatOption,
                formatSelection: formatOption
            });
        }
    };
/*
    $scope.saveToLocalStorage = function(varName, val) {
        if (!$rootScope.user.isAuth) {
            if (val == undefined) {
                val = '';
            }
            if(typeof(trim) == 'function') val = val.trim();
            localStorage.setItem(varName, val);
        }
        if (varName == 'request_comment') {
            $scope.comment = val;
        }
        $scope.formDirty = true;
    };
*/

    $scope.saveToLocalStorage = function(varName, val) {
        if (!$rootScope.user.isAuth) {
            if (val == undefined) {
                val = '';
            }
            localStorage.setItem(varName, val);
        }
        if(typeof(trim) == 'function') val = val.trim();
        if(varName == 'user_fio') {
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

    $scope.checkEmail = function(email) {
        if (!email) {
            return;
        }
        if (!$rootScope.user.isAuth) {
            localStorage.setItem('user_email', email);
        }

        if(1 == $scope.action_type && 0 == $scope.numberRequestInputs) {
            //$scope.isFirstOpenRequestForm = false;
            //$log.info('Открыта вкладка создания заявки');
            //var dataToSend = {tourId: $scope.tourConfig.id, source: 'request_open', transferSource: $scope.utmSource};
            //$http({
            //    method: 'POST',
            //    url: '/tour/request_form', params: {params: dataToSend}
            //}).success(function(receivedData){
            //});
            //reachCounterGoal('BOOKING_PAGE_REQUEST_OPEN');
            //$scope.numberRequestInputs++;
        }

        if(0 == $scope.numberFormAuthInput) {
            reachCounterGoal('AUTH_INPUT');
            $scope.numberFormAuthInput++;
        }

        $scope.showLoader = true;

        $http({method: 'POST', url: '/auth/check_email', params: {'email': email}}).success(function(data){
            $scope.showLoader = false;

            if (data.status) {
                $scope.emailExist = true;
                $scope.loginData = {
                    email: email
                };
                reachCounterGoal('EMAIL_EXIST');
            } else {
                $scope.emailExist = false;
                $rootScope.user.email = email;
            }
        });
    };

    $scope.checkEmail($rootScope.user.email);

    $scope.checkPromo = function(code) {
        if (!code || code.length < 8) {
            $scope.promo.price = '';
            $scope.promo.discount = '';
            $scope.promo.error = '';
            return;
        }

        $scope.promo.checking = true;
        var promo = angular.element('#promo');

        $http({method: 'POST', url: '/tour/check_promo', params: {code: code, tourId: $scope.tourConfig.id}})
                .success(function (data) {
                    $scope.promo.checking = false;

                    if (data.status == 'ok') {
                        $scope.promo.price = $scope.number_format(data.promo_price.toString()) + ' руб.';
                        $scope.promo.discount = $scope.number_format((data.tour_price - data.promo_price).toString()) + ' руб.';
                        $scope.promo.error = '';
                    } else {
                        $scope.promo.price = '';
                        $scope.promo.discount = '';
                        $scope.promo.error = data.message ? data.message : 'Произошла ошибка';
                    }
                })
                .error(function () {
                    $scope.promo.checking = false;
                    $scope.promo.error = 'Произошла ошибка';
                });
    };

    //уход со страницы бронирования, когда отличается цена
    const BOOKING_PAGE_PRICE_DIFF_LEAVE = 6;
    //уход со страницы бронирования, когда цена ок
    const BOOKING_PAGE_PRICE_OK_LEAVE = 7;
    //уход со страницы бронирования, когда тур устарел (цена не найдена)
    const BOOKING_PAGE_PRICE_NOT_FOUND_LEAVE = 8;

    $scope.writeLeaver = function(source) {
        $http({
            method: 'POST',
            url: '/search/write_leaver',
            data: {
                'source': source
            }
        }).success(function () {
            console.log('search_start_leaver_logged');
        });
    };

    $scope.updateCurrentPrice = function(newPrice) {
        $scope.priceChanged = !(newPrice.priceRur  == $scope.priceInSearch.priceRur);
        if ($scope.priceChanged) {
            $scope.writeLeaver(BOOKING_PAGE_PRICE_DIFF_LEAVE);
        } else {
            $scope.writeLeaver(BOOKING_PAGE_PRICE_OK_LEAVE);
        }
        if (!$scope.currentPrice.price) {
            $scope.currentPrice = newPrice;
            if (newPrice.price) {
                $scope.isLoadedPrice = true;
                $scope.possiblyReservation = true;
            }
        } else {
            if ($scope.currentPrice.priceRur != newPrice.priceRur) {
                $scope.currentPrice = newPrice;
                reachCounterGoal('CHANGE_PRICE');
            }
        }
    };

    $scope.checkPriceChanges = function() {
        if (!$scope.tourConfig.id) {
            return;
        }

        var data = {tour_id: $scope.tourConfig.id, price: $scope.tourConfig.price};
        $http({
            url: '/tour/check_price',
            method: 'POST',
            params: {'params': data}
        }).success(function(data) {
            if (data.status == 'ok' && data.price) {
                $scope.priceChangesIntervalId = $timeout($scope.checkPriceChanges, 30000);
                $scope.updateCurrentPrice(data.price);
            }
        }).error(function() {
            $scope.priceChangesIntervalId = $timeout($scope.checkPriceChanges, 30000);
        });
    };

    $scope.hidePreloadInfo = function() {
        $scope.showPreloadByUser = false;
        $('#overlay').remove();
    };

    $scope.loadServiceInfoSections = function() {
        $scope.tourServicesAvailability = true;
        if (!$scope.tourConfig.id) {
            return;
        }
        $scope.priceNotFound = null;
        $scope.serviceSectionsLoaded = false;

        var requestParams = {tour_id: $scope.tourConfig.id, operator_id: $scope.operatorId};
        $http({
            url: '/tour/service_sections',
            method: 'GET',
            params: {'params': requestParams}
        }).success(function(data) {
            $scope.serviceSectionsLoaded = true;
            if (data.status == 'ok') {
                $scope.tourServicesAvailability = data.availability;
                $scope.showPreloadByUser = true;
                $scope.hotelAvailability = {};
                $scope.hotelAvailability.content = data.hotelAvailability.content;
                $scope.hotelAvailability.class = data.hotelAvailability.class;
                $scope.hotelAvailability.description = data.hotelAvailability.description;
                $scope.dateIntervalInHotel = data.dateIntervalInHotel;
                $scope.hotelInfoList = data.hotelInfoList;
                $scope.isActualData = data.actualData;
                $scope.presumedSurcharge = data.presumedSurcharge;
                $scope.insuranceIncluded = data.insuranceIncluded;
                $scope.transferIncluded = data.transferIncluded;
                if (data.price) {
                    $scope.updateCurrentPrice(data.price);
                }

                $('.data-in').show();
                $timeout(function() {
                    $('.js-ajax-service-sections').html(data.html);
                    TourBook.bookingPage.tooltips();
                    return;

                    var container = $('.refresh-content');
                    container.css('z-index', 1000);
                    container.transition({y: '-=150', x: '+=400', scale:0.01}, function() {
                        alert($('.js-ajax-service-sections').length);
                        $('.js-ajax-service-sections').html(data.html);
                        //angular.element('.content').scope().showPreloadByUser = false;
                        angular.element('.content').scope().$apply();
                        //$('.data-in').effect('shake', {distance: 2});
                    });
                });
                if (!$scope.priceChangesIntervalId) {
                    $scope.priceChangesIntervalId = $timeout($scope.checkPriceChanges, 30000);
                }
            } else {
                $scope.priceNotFound = true;
                $scope.writeLeaver(BOOKING_PAGE_PRICE_NOT_FOUND_LEAVE);
            }

        });
    };

    $scope.showPreloadInfo = function() {
        $scope.showPreloadByUser = true;
        $scope.isLoadedPrice = true;
        $scope.serviceSectionsLoaded = true;
        $scope.$apply();

        var container = $('.refresh-content');

        if (!container.hasClass('in-overlay')) {
            container.transition({y: '+=150', x: '-=400', scale: 1});
            container.addClass('in-overlay');
        }
        container.overlay();
        arrageOverlayContent(container);

        $('#overlay').css('z-index', 999).unbind('click').click(function() {
            $('#overlay').remove();
            angular.element('.content').scope().showPreloadByUser = false;
            angular.element('.content').scope().$apply();
            return false;
        });

    };
    $scope.loadServiceInfoSections();

    $scope.childAgeUnit = function(age) {
        if (!age) {
            return '';
        }

        return age == 1  ? 'года' : 'лет';
    };

    $scope.login = function() {
        $scope.showLoader = true;

        $http({method: 'POST', url: '/auth/login', params: {'params': $scope.loginData}}).success(function(data){
            $scope.showLoader = false;
            if (data.status == 'ok') {
                $rootScope.user = data.user;
            } else {
                $scope.loginError = data.message;
            }
        });
    };

    $scope.restorePassword = function() {
        $scope.showRestorePasswordLink = false;
        $scope.showRestorePasswordLoader = true;

        $http({method: 'POST', url: '/auth/restore_password', params: {'params': $scope.loginData}}).success(function(data){
            $scope.showRestorePasswordLoader = false;
            if (data.status == 'ok') {
                $rootScope.user = data.user;
                $scope.restorePasswordMessage = true;
            } else {
                $scope.loginError = data.message;
                $scope.showRestorePasswordLink = true;
            }
        });
    };

    $scope.userHasVerifiedPhone = function() {
        return $rootScope.user.verified_phone != undefined
            && $rootScope.user.verified_phone.length > 0
            && $rootScope.user.phone === $rootScope.user.verified_phone;
    };

    $scope.resendVerifyCode = function() {
        $scope.smsService.verifyCodeKey = null;
        $scope.sendVerifyCode().then(
            function() {
                $scope.resendVerifyCodeCountDown();
            }
        )
    };

    $scope.resendVerifyCodeCountDown = function() {
        if ($scope.resendCountdownInterval) {
            return;
        }
        $scope.resendCountdown = 60;
        $scope.resendCountdownInterval = setInterval(function() {
            setTimeout(function() {
                if ($scope.resendCountdown > 0) {
                    $scope.resendCountdown = $scope.resendCountdown - 1;
                    $scope.$apply();

                } else {
                    if ($scope.resendCountdownInterval) {
                        clearInterval($scope.resendCountdownInterval);
                        $scope.resendCountdownInterval = null;
                    }
                }
            }, 1);
        }, 1000);
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
            $('html, body').animate({scrollTop: scrollOffset}, needScroll ? 500 : 1, highlightErrors);
        }, 1);
    };

    $scope.isSuccessPhoneVerification = function(function_name) {
        if (!$scope.userHasVerifiedPhone() && !$scope.smsService.phoneVerificationDisabled) {
            $scope.requestSendStage = 3;
            $scope.reservationSendStage = 3;
            // проверочный код еще не высылался
            if (!$scope.smsService.verifyCodeKey) {
                $scope.sendRequest = true;
                $scope.buttonSubmitMessage = 'Для подтверждения брони Вам будет отправлено SMS...';
                $scope.sendVerifyCode().then(
                    function() {
                        $scope.showPhoneVerification = true;
                        $scope.sendRequest = false;
                        $scope.resendVerifyCodeCountDown();
                    },
                    function() {
                        $scope.sendRequest = false;
                    }
                );
                return false;
            }

            if (!$scope.smsService.phoneVerified) {
                // проверяем введенный юзером код
                if ($scope.smsService.verifyCode) {
                    $scope.sendRequest = true;
                    $scope.buttonSubmitMessage = 'Проверка...';
                    $scope.verifyPhone().then(
                        function() {
                            $scope.sendRequest = false;
                            function_name();
                        },
                        function() {
                            $scope.sendRequest = false;
                        }
                    );
                }
                return false;
            }
        }
        return true;
    };

    $scope.$watch('action_type', function(newValue, oldValue) {
        switch (newValue) {
            case 0:
                if ($scope.isFirstOpenReservationForm) {
                    $scope.isFirstOpenReservationForm = false;
                    $log.info('Открыта вкладка бронирования');
                    var dataToSend = {tourId: $scope.tourConfig.id, source: 'book_open', transferSource: $scope.utmSource};
                    $http({
                        method: 'POST',
                        url: '/tour/booking_form', params: {params: dataToSend}
                    }).success(function(receivedData){
                    });
                    reachCounterGoal('BOOKING_PAGE_BOOK_OPEN');
                    $scope.numberRequestInputs = 0;
                }
                break;
            case 1:
                break;
        }
    });

    window.addEventListener("beforeunload", function () {
        if ($scope.formDirty && !$scope.confirmRequest) {
            sendIncompleteRequest();
        }
    });

    function sendIncompleteRequest() {
        if ($rootScope.user.phone != undefined || isValidEmail($rootScope.user.email)) {
            var id = $scope.tourConfig.id;
            var user = jQuery.extend(true, {}, $rootScope.user);
            if (!isValidEmail($rootScope.user.email)) {
                user.email = null;
            }
            var userInfo = encodeURIComponent(JSON.stringify(user));
            var url = '/tour/request/incomplete_request?id=' +  id + '&user=' + userInfo;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send();
        }
    }

    function isValidEmail(email) {
        var regexp = /[a-z0-9]+@[a-z0-9]+\.[a-z]+/;
        return regexp.test(email);
    }

    $scope.openRemoteReservation = function(source, href, operatorId) {
        var data = {tourId: $scope.tourConfig.id, source: source, transferSource: $scope.utmSource, hrefFrom: window.location.href, hrefTo: href, operatorId: operatorId};

        $http({
            method: 'POST',
            url: '/tour/operator_redirection', params: {params: data}
        }).success(function(data){
        });
        if ('button' == source) {
            reachCounterGoal('BOOKING_PAGE_OPERATOR_REDIRECTION');
        } else {
            reachCounterGoal('BOOKING_PAGE_OPERATOR_REDIRECTION_FROM_LOGO');
        }


        $log.info('Переход на страницу бронирования у оператора');
    };

    $scope.checkTouristsForm = function() {
        $scope.pressSubmitTourists = true;
        if ($scope.touristsForm.$invalid) {
            $scope.animateValidationErrors();
            //sweetAlert('Проверьте правильность заполнения данных', '', "error");
            return;
        }


        var curr = $('.modal_booking, .embedded_booking').find('.modal-step-link.current');
        var currentIndex = curr.index();
        setTimeout(function() {
            $('.modal_booking').find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
            $('.embedded_booking').each(function() {
                $(this).find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
            });
        }, 0);
    };

    $scope.checkContactsForm = function() {
        $scope.pressSubmitContacts = true;
        if ($scope.contactsForm.$invalid) {
            $scope.animateValidationErrors();
            //sweetAlert('Проверьте правильность заполнения данных', '', "error");
            return;
        }

        var currentIndex = $('.modal_booking').find('.modal-step-link.current').index();
        setTimeout(function() {
            $('.modal_booking').find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
            $('.embedded_booking').each(function() {
                $(this).find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
            });
        }, 0);
    };

    $scope.checkContactsRequestForm = function() {
        $scope.pressSubmitRequestContacts = true;
        if ($scope.contactsRequestForm.$invalid) {
            $scope.animateValidationErrors();
            //sweetAlert('Проверьте правильность заполнения данных', '', "error");
            return;
        }

        var currentIndex = $('.modal_request_booking').find('.modal-step-link.current').index();
        setTimeout(function() {
            $('.modal_request_booking').find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
            $('.embedded_request_booking').each(function() {
                $(this).find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
            });
        }, 0);
    };

    $scope.checkTouristsRequestForm = function() {
        $scope.pressSubmitRequestTourists = true;
        if ($scope.touristsRequestForm.$invalid && $scope.noNeedPersonsInfo == false) {
            $scope.animateValidationErrors();
            //sweetAlert('Проверьте правильность заполнения данных', '', "error");
            return false;
        }

        var curr = $('.modal_request_booking, .embedded_request').filter(':visible').find('.modal-step-link.current');
        var currentIndex = curr.index();
        setTimeout(function() {
            $('.modal_request_booking').find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
            $('.embedded_booking').each(function() {
                $(this).find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
            });
        }, 0);
        return true;
    };

    $scope.submit = function() {
        $scope.pressSubmit = true;
        $scope.confirmRequest = true;

        var dataToSend = {tourId: $scope.tourConfig.id, source: 'book_sbm_btn', transferSource: $scope.utmSource};
        $http({
            method: 'POST',
            url: '/tour/booking_form', params: {params: dataToSend}
        }).success(function(receivedData){
        });
        reachCounterGoal('BOOKING');
        /* по -моему не здесь успешная отправка заявки
        if(typeof ga !== 'undefined' && $scope.experimentVariation) {
            ga('send', 'event', 'Request', 'RequestExperimentSend', 'RequestExperimentSend');
        }
        */
        var currentIndex;
        if ($scope.touristsForm.$invalid) {
            currentIndex = $('.modal_booking').find('.modal-step-link.current').index();
            setTimeout(function() {
                $('.modal_booking').find('.modal-step-link').eq(currentIndex-2).click();
                $('.embedded_booking').each(function() {
                    $(this).find('.modal-step-link').eq(currentIndex-2).click();
                });
            }, 0);
            $scope.animateValidationErrors();
            return;
        }

        if ($scope.contactsForm.$invalid) {
            currentIndex = $('.modal_booking').find('.modal-step-link.current').index();
            setTimeout(function() {
                $('.modal_booking').find('.modal-step-link').eq(currentIndex-1).click();
                $('.embedded_booking').each(function() {
                    $(this).find('.modal-step-link').eq(currentIndex-1).click();
                });
            }, 0);
            $scope.animateValidationErrors();
            return;
        }

        if (!$scope.possiblyReservation || $scope.sendRequest) {
            $scope.animateValidationErrors();
            return;
        }

        //if (!$('#agree').prop("checked")) {
        //    openSubmit(false);
        //    return;
        //}
        currentIndex = $('.modal_booking').find('.modal-step-link.current').index();
        setTimeout(function() {
            $('.modal_booking').find('.modal-step-link').eq(currentIndex + 1).addClass('passed').click();
            $('.embedded_booking').each(function() {
                $(this).find('.modal-step-link').eq(currentIndex + 1).addClass('passed').click();
            });
        }, 0);

        if (!$scope.isSuccessPhoneVerification($scope.submit)) {
            return;
        }

        $scope.reservationSendStage = 0;

        var paxList = angular.toJson($scope.tourConfig.paxList);
        var requestData = {
            'id': $scope.tourConfig.id,
            'pax': paxList,
            'user': $rootScope.user,
            'payment': $scope.payment,
            'test' : $scope.testBooking,
            'operator_config': $scope.testOperatorConfig
        };

        if ($scope.tourConfig.notifyBySms) {
            requestData['notify_by_sms'] = $scope.tourConfig.notifyBySms;
            requestData['verify_phone_key'] = $scope.smsService.verifyKey;
        }

        if ($scope.smsService.verifyKey != undefined) {
            requestData['verify_phone_key'] = $scope.smsService.verifyKey;
        }

        if ($scope.smsService.verificationDisabled != undefined && $scope.smsService.verificationDisabled) {
            requestData['phone_verification_disabled'] = 1;
        }

        $scope.sendRequest = true;
        $http({
            method: 'POST',
            url: '/reservation_tour/save_tour',
            params: requestData
        }).success(function (data) {
            if (data.Status == 'error') {
                $scope.reservationSendStage = -1;
                var dataToSend = {tourId: $scope.tourConfig.id, source: 'book_err', transferSource: $scope.utmSource};
                $http({
                    method: 'POST',
                    url: '/tour/booking_form', params: {params: dataToSend}
                }).success(function(receivedData){
                });
                reachCounterGoal('SUBMIT_BOOKING_ERROR');
                $log.info(data.Message);
                $scope.sendRequest = false;
            } else {
                if (!angular.isUndefined(data.tourId)) {
                    $scope.reservationSendStage = 1;
                    $log.info('Сохранение информации о туре прошло успешно');
                    $scope.reservationTour(data.tourId);
                } else {
                    var dataToSend = {tourId: $scope.tourConfig.id, source: 'book_err', transferSource: $scope.utmSource};
                    $http({
                        method: 'POST',
                        url: '/tour/booking_form', params: {params: dataToSend}
                    }).success(function(receivedData){
                    });
                    reachCounterGoal('SUBMIT_BOOKING_ERROR');
                    $log.info('При сохранении информации о туре произошла ошибка');
                    $scope.tourError = "При сохранении информации о туре произошла ошибка";
                    //$scope.showError = true;
                    $scope.reservationSendStage = -1;
                    $scope.sendRequest = false;
                    return false;
                }
            }
            if (data.data) {
                $scope.paxList = data.data.persons;
                if (data.data.tourError != '') {
                    $scope.tourError = data.data.tourError;
                    //$scope.showError = true;
                    $scope.reservationSendStage = -1;
                }
            }
        }).error(function (data) {
            $scope.sendRequest = false;
            $log.info('При сохранении информации о туре произошла ошибка');
            $log.info(JSON.stringify(data));
        });

    };

    $scope.reservationTour = function(tourId) {
        $scope.personalLink =  '/instruction?id=' + tourId;
        $scope.reservationSendStage = 4;

        $http({
            method: 'POST',
            url: '/reservation_tour/send_tour_operator_request',
            params: {
                'id': tourId
            }
        }).success(function (data) {
            if (data.Status == 'error') {
                var dataToSend = {tourId: $scope.tourConfig.id, source: 'book_err', transferSource: $scope.utmSource};
                $http({
                    method: 'POST',
                    url: '/tour/booking_form', params: {params: dataToSend}
                }).success(function(receivedData){
                });
                reachCounterGoal('SUBMIT_BOOKING_ERROR');
                $log.info(data.Message);

                $scope.reservationSendStage = 5;

            } else {
                if (!angular.isUndefined(data.tourId)) {
                    var dataToSend = {tourId: $scope.tourConfig.id, source: 'book_success', transferSource: $scope.utmSource};
                    $http({
                        method: 'POST',
                        url: '/tour/booking_form', params: {params: dataToSend}
                    }).success(function(data){
                    });
                    reachCounterGoal('SUBMIT_BOOKING_SUCCESS');
                    $log.info('Тур успешно забронирован');
                    $scope.updateTour(data.tourId);
                    $scope.reservationSendStage = 5;
                } else {
                    var dataToSend = {tourId: $scope.tourConfig.id, source: 'book_err', transferSource: $scope.utmSource};
                    $http({
                        method: 'POST',
                        url: '/tour/booking_form', params: {params: dataToSend}
                    }).success(function(receivedData){
                    });
                    reachCounterGoal('SUBMIT_BOOKING_ERROR');
                    $log.info(JSON.stringify(data));
                    $scope.reservationSendStage = 5;
                }
            }
        }).error(function (data) {
            var dataToLog = {tourId: $scope.tourConfig.id, source: 'book_err', transferSource: $scope.utmSource};
            $http({
                method: 'POST',
                url: '/tour/booking_form', params: {params: dataToLog}
            }).success(function(receivedData){
            });
            reachCounterGoal('SUBMIT_BOOKING_ERROR');
            $scope.sendRequest = false;

            $scope.reservationSendStage = 5;
        });
    };

    $scope.updateTour = function(tourId) {

        $scope.buttonSubmitMessage = 'Подождите, мы обновляем информацию о Вашей брони';

        function redirectToInstruction() {
            if ($scope.showDayOffAlert) {
                swal({title: $scope.showDayOffAlert.replace('Заявка', 'Бронь')}, function () {
                    $scope.reservationSendStage = 5;
                });
            } else {
                $scope.reservationSendStage = 5;
            }
        }


        $scope.reservationSendStage = 6;

        $http({
            method: 'POST',
            url: '/reservation_tour/update_tour',
            params: {
                'id': tourId
            }
        }).success(function (data) {
            redirectToInstruction();
        }).error(function (data) {
            redirectToInstruction();
        });
    };

    $scope.sendVerifyCode = function() {
        var deferred = $q.defer();

        $http({
            url: '/sms_service/send_verify_code',
            method: 'POST',
            params: {'params': {phone: $scope.user.phone}}
        }).success(function (data) {
            if (data.status == 'ok') {
                $scope.smsService.verifyCodeKey = data.verify_code_key;
                deferred.resolve(data.verify_code_key);
                return;
            }

            if (data.status == 'error' && data.message) {
                alert(data.message);
                deferred.reject(data.message);
                return;
            }

            deferred.reject();

        }).error(function() {
            deferred.reject();
        });

        return deferred.promise;
    };

    $scope.verifyPhone = function() {
        var deferred = $q.defer();

        var data = {
            phone: $scope.user.phone,
            verify_code_key: $scope.smsService.verifyCodeKey,
            code: $scope.smsService.verifyCode
        };

        $http({
            url: '/sms_service/verify_phone',
            method: 'POST',
            params: {'params': data}
        }).success(function (data) {
            if (data.status == 'ok') {
                $scope.smsService.phoneVerified = true;
                $scope.smsService.verifyKey = data.verify_key;
                deferred.resolve(data);
            }

            if (data.status == 'error' && data.message) {
                alert(data.message);
                deferred.reject(data.message)
            }
        }).error(deferred.reject);

        return deferred.promise;

    };

    $scope.changeDesiredPrice = function() {
        var tmpString = $scope.watchTour.desiredPrice.replace(/[^\d]/gi, '');
        var count = 0;
        $scope.watchTour.desiredPrice = '';
        for (var i = tmpString.length - 1; i>=0; i--) {
            count++;
            $scope.watchTour.desiredPrice = tmpString[i] + $scope.watchTour.desiredPrice;
            if (count == 3) {
                $scope.watchTour.desiredPrice = ' ' + $scope.watchTour.desiredPrice;
                count =0;
            }
        }

    };

    $scope.watchTourSubmit = function (allowEmptyEmail) {
        var watchTourEmail = $scope.watchTour.email;
        var watchTourPhone = $scope.watchTour.phone;
        var notify = allowEmptyEmail && !$scope.watchTour.notify ? 0 : 1;
        var tourId = $scope.tourConfig.id;
        var similar = true === $scope.watchTour.similar ? true : '';
        var desiredPrice =  $scope.watchTour.desiredPrice.replace(/[^\d]/gi, '');
        var formType = $scope.subscriptionMode;
        var previousState = $scope.watchTour.inFavorites;

        var $_GET = {};
        var returnParams = {};
        var __GET = window.location.search.substring(1).split("&");
        for(var i=0; i<__GET.length; i++) {
            var getVar = __GET[i].split("=");
            if (getVar[0]== 'return' && getVar[1] != undefined) {
                var _returnParams = decodeURIComponent(getVar[1]);
                _returnParams = _returnParams.split("&");
                for(var j=0; j<_returnParams.length; j++) {
                    var returnParam = _returnParams[j].split("=");
                    returnParams[returnParam[0]] = returnParam[1] == undefined ? "" : returnParam[1];
                }
            }
            $_GET[getVar[0]] = getVar[1] == undefined ? "" : getVar[1];
        }
        var child1Age = returnParams['ch1'] == undefined ? "" : returnParams['ch1'];
        var child2Age = returnParams['ch2'] == undefined ? "" : returnParams['ch2'];

        if (notify && !watchTourEmail) {
            sweetAlert('Не введен e-mail', '', "error");
            return;
        }
        /*
        // Не обязательно http://auto.ls1.ru/development/mini/detail?id=84763
        if (!watchTourPhone) {
            sweetAlert('Не указан телефон', '', "error");
            return;
        }
        */
        if('undefined' == tourId) {
            sweetAlert('Нет id тура', '', "error");
            return;
        }
        $http({
            method: 'POST',
            url: '/reservation_tour/watch_tour_apply',
            params: {
                'id': tourId,
                'notify': notify,
                'email': watchTourEmail,
                'phone': watchTourPhone,
                'similar': similar,
                'desiredPrice': desiredPrice,
                'formType': formType,
                'ch1': child1Age,
                'ch2': child2Age
            }
        }).success(function (data) {
            if (undefined == data.message) {
                swal('При подписке на обновления тура произошла ошибка', '',"error");
                return;
            }
            if('ok' == data.status) {
                setTimeout(function() {
                    $('#overlay_white').click();
                }, 0);
                if (!previousState) {
                    $scope.watchTour.inFavorites = 1;
                    $rootScope.favorites += 1;
                }
                $scope.watchTour.inSubscriptions = notify;
                $scope.watchTour.watcherId = data.id;
                swal(data.message, '', "success");
            }
            if('error' == data.status) {
                swal(data.message, '', "error");
            }
        });

    };

    $scope.unwatchTourSubmit = function (completely) {
        var tourId = $scope.tourConfig.id;
        $http({
            method: 'POST',
            url: '/reservation_tour/watch_tour_remove',
            params: {
                'id': tourId,
                'completely': completely ? 1 : 0
            }
        }).success(function (data) {
            if (undefined == data.message) {
                swal('При изменении подписки произошла ошибка', '',"error");
                return;
            }
            if('ok' == data.status) {
                $('#overlay_white').click();
                if (completely) {
                    $rootScope.favorites -= 1;
                }
                $scope.watchTour.inFavorites = completely ? 0 : 1;
                $scope.watchTour.inSubscriptions = 0;
                swal(data.message, '', "success");
            }
            if('error' == data.status) {
                swal(data.message, '', "error");
            }
        });

    };

    angular.element('#spinner').hide();
    $scope.number_format = function(price) {
        return price.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
    };

    //$scope.nextStep = function () {
    //    if (!$scope.paymentType) {
    //        $scope.paymentType = 5;
    //    }
    //    var currentIndex = $('.modal_request').find('.modal-step-link.current').index();
    //    setTimeout(function () {
    //        $('.modal_request').find('.modal-step-link').eq(currentIndex + 1).addClass('passed').click();
    //        $('.embedded_request').each(function () {
    //            $(this).find('.modal-step-link').eq(currentIndex + 1).addClass('passed').click();
    //        });
    //    }, 0);
    //};
    /*
    $http.get('/tour/get_agencies')
        .then(function (response) {
            var agencies = response.data.agencies;
            $scope.offices = agencies;
            if (agencies && agencies.length !== 0) {
                $(".payment_type_select").select2({
                    formatResult: formatOption,
                    formatSelection: formatOption
                });
            }
        }, function () {
            console.err('failed to load available offices');
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

    $scope.send_request = function () {
        $scope.confirmRequest = true;
        $scope.pressSubmit = true;

        if ($scope.createRequest.form.$invalid) {
            $scope.animateValidationErrors();
            return;
        }
        if ($scope.requestId) {
            swal('Вы уже отправили заявку. Наши менеджеры свяжутся с вами в ближайшее время');
            return;
        }

        // TODO: sms-подтверждение временно выключено
        //if (!$scope.isSuccessPhoneVerification($scope.send_request)) {
        //    return;
        //}

        //if ($scope.tourConfig.notifyBySms) {
        //    data['notify_by_sms'] = $scope.tourConfig.notifyBySms;
        //    data['verify_phone_key'] = $scope.smsService.verifyKey;
        //}
        $scope.requestSendStage = 0;


        var currentStepsList = $('.modal-step-links').filter(':visible');
        var currentIndex = currentStepsList.find('.modal-step-link.current').index();
        var currentlyHidden = $('.embedded_request').is(':visible') ? $('.modal_request') : $('.embedded_request');
        var activeOne = currentStepsList.closest('.modal_request').length ? $('.modal_request') : currentStepsList.closest('.embedded_request');
        setTimeout(function() {
            activeOne.find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
            currentlyHidden.each(function() {
                $(this).find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
            });
        }, 0);

        $('.new-request-modal-step1').hide();
        $('.new-request-modal-step2').show();

        //$scope.buttonSubmitMessage = 'Подождите, мы отправляем Вашу заявку';
        $scope.sendRequest = true;

        var requestParams = {
            'id': $scope.tourConfig.id,
            'user': $rootScope.user,
            'comment': $scope.comment,
            'promo': $scope.promo.code,
            'paymentType': $scope.payment,
            'test' : $scope.testBooking ? 1 : 0,
            'transferSource': $scope.utmSource,
            'form_type': $scope.formType
        };

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
                    /*
                     временно убираем эксперимент про баннер со стрелочкой
                    if(typeof ga !== 'undefined' && $scope.experimentVariation) {
                        ga('send', 'event', 'Request', 'RequestExperimentSend', 'RequestExperimentSend');
                    }
                    */
                    if(typeof ga !== 'undefined') {
                        ga('send', 'event', 'Request', 'RequestSend', 'RequestSend');
                        if($scope.experimentVariation == 1) { // новая форма
                            ga('send', 'event', 'NewRequest', 'NewRequestSend', 'NewRequestSend');
                        } else {
                            ga('send', 'event', 'OldRequest', 'OldRequestSend', 'OldRequestSend');
                        }
                    }
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

    $scope.sendTextRequest = function () {
        $scope.confirmRequest = true;
        $scope.pressSubmit = true;

        if ($scope.createRequest.form.$invalid || $scope.sendRequest) {
            $scope.animateValidationErrors();
            return;
        }
        $scope.requestSendStage = 0;

        var currentIndex = $('.modal_request').find('.modal-step-link.current').index();
        setTimeout(function () {
            $('.modal_request').find('.modal-step-link').eq(currentIndex + 1).addClass('passed').click();
            $('.embedded_request').each(function () {
                $(this).find('.modal-step-link').eq(currentIndex + 1).addClass('passed').click();
            });
        }, 0);


        //$scope.buttonSubmitMessage = 'Подождите, мы отправляем Вашу заявку';
        $scope.sendRequest = true;

        var requestParams = {
            'id': $scope.tourConfig.id,
            'user': $rootScope.user,
            'comment': $scope.comment,
            'promo': $scope.promo.code,
            'test': $scope.testBooking ? 1 : 0,
            'transferSource': $scope.utmSource,
            'city': $scope.tourInfo_city,
            'dates': $scope.tourInfo_dates,
            'duration': $scope.tourInfo_duration,
            'tourists': $scope.tourInfo_tourists,
            'resort': $scope.tourInfo_resort,
            'allocation': $scope.tourInfo_allocation,
            'meal': $scope.tourInfo_meal,
            'price': $scope.tourInfo_price,
            'form_type': $scope.formType
        };

        if ($scope.searchChildAges) {
            requestParams['ch1'] = $scope.searchChildAges.ch1;
            requestParams['ch2'] = $scope.searchChildAges.ch2;
        }
        console.log('text_request_created');


        $http.post('/tour/request/text_request/', requestParams)
            .then(function (response) {
                var data = response.data;
                if (data.status == 'error') {
                    $scope.requestSendStage = -1;
                    $log.info(data.message);
                    $scope.sendRequest = false;
                } else {
                    if (!angular.isUndefined(data.requestId)) {
                        $scope.requestSendStage = 1;
                        $log.info('Сохранение информации о туре прошло успешно');
                        reachCounterGoal('BOOKING_PAGE_REQUEST_SUBMIT');
                        if(typeof ga !== 'undefined' && $scope.experimentVariation) {
                            ga('send', 'event', 'Request', 'RequestExperimentSend', 'RequestExperimentSend');
                        }
                        $log.info('Успешная отправка заявки');
                        $scope.personalLink = false;
                        $rootScope.requests += 1;
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
    };

    $scope.send_comment = function () {

        $http({
            method: 'POST',
            url: '/comments/new_comment',
            params: {
                'name': $rootScope.user_fio,
                'country': $scope.tourConfig.country,
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

    $scope.removeFromFavorites = function () {
        if (!$scope.watchTour.inFavorites) {
            return;
        }

        $.post('/favorites/ajax/', {watcherId: $scope.watchTour.watcherId, action: 'remove'})
            .success(function (data) {
                var divider = '!!!';

                if (typeof data == 'string' || data instanceof String) {
                    if (data.indexOf(divider) != -1) {
                        data = JSON.parse(data.substr(0, data.indexOf(divider)));
                    } else {
                        data = JSON.parse(data);
                    }
                }

                if (data.status == 'ok') {
                    $scope.watchTour.inFavorites = false;
                    $timeout(function() {
                        $scope.$apply();
                    });

                }
                if (data.status == 'error') {
                    alert(data.message);
                }
            })
            .error(function() {
                //alert('Ошибка отправки данных');
            })
        ;
    };

    $scope.openFollow = function(source) {
        $timeout(function(){
            $('.modal-follow').fadeIn('fast');
            $('.overlay').show();
            if (source == 7) {
                $('.follow-pp-tab.follow-pp-tab-watch').trigger('click');
                reachCounterGoal('FOLLOW_OPEN');
            } else {
                $('.follow-pp-tab.follow-pp-tab-buy').trigger('click');
                reachCounterGoal('FOLLOV_CHEAPER_1');
            }

            $scope.formType = parseInt(source);
        });

        //if (type == 'subscriptions') {
        //    switch (parseInt($scope.subscriptionMode)) {
        //        case 1:
        //            reachCounterGoal('FOLLOW_OPEN');
        //            break;
        //        case 2:
        //            reachCounterGoal('FOLLOW_OPEN_SECOND');
        //            break;
        //        case 3:
        //            reachCounterGoal('FOLLOV_CHEAPER_1');
        //            break;
        //        case 6:
        //            reachCounterGoal('FOLLOV_CHEAPER_2');
        //            break;
        //        default:
        //            break;
        //    }
        //}

        //if (buttons.hasClass('in-' + type)) {
        //    $('.pp-remove-from-' + type).overlay_white().show();
        //} else {
        //    $('.' + target).overlay_white().show();
        //}
    };

    $scope.submitRequestBooking = function () {
        $scope.confirmRequest = true;
        $scope.pressSubmit = true;

        if ($scope.sendRequest || !$scope.paymentType) {
            $scope.animateValidationErrors();
            return;
        }

        $scope.requestSendStage = 0;

        var currentIndex = $('.modal_request_booking').find('.modal-step-link.current').index();
        setTimeout(function() {
            $('.modal_request_booking').find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
            $('.embedded_request_booking').each(function() {
                $(this).find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
            });
        }, 0);

        var paxList = angular.toJson($scope.tourConfig.paxList);

        //$scope.buttonSubmitMessage = 'Подождите, мы отправляем Вашу заявку';
        $scope.sendRequest = true;

        var requestParams = {
            'id': $scope.tourConfig.id,
            'user': $rootScope.user,
            'comment': $scope.comment,
            'pax': paxList,
            'paymentType': $scope.paymentType,
            'paymentOfficeId': $('.modal_request_booking select.agency').find('option:selected').val(),
            'transferSource': $scope.utmSource,
            'form_type': $scope.formType,
            'promo': $scope.promo.code,
            'test': $scope.testBooking ? 1 : 0,
            'isBookingRequest': true
        };

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
                    if ($scope.paymentTypeChanged || $('.select2-container.payment_type_select').is('.ng-dirty')) {
                        $scope.updatePaymentInfo();
                    }
                    $scope.personalLink =  '/tour/request/detail?id=' + data.requestId;
                    $rootScope.requests += 1;
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


    $scope.watchTourSubmit = function(customFormType) {
        var watchTourEmail = $scope.watchTour.email;
        var watchTourPhone = $scope.watchTour.phone;
        var tourId = $scope.tourConfig.id;
        var formType = typeof customFormType == 'undefined' ? $scope.formType : customFormType;
        console.log(tourId);
        var similar = true === $scope.watchTour.similar ? true : '';
        var desiredPrice =  $scope.watchTour.desiredPrice.replace(/[^\d]/gi, '');

        var $_GET = {};
        var __GET = window.location.search.substring(1).split("&");
        for(var i=0; i<__GET.length; i++) {
            var getVar = __GET[i].split("=");
            $_GET[getVar[0]] = getVar[1] == undefined ? "" : getVar[1];
        }
        var child1Age = $_GET['ch1'] == undefined ? "" : $_GET['ch1'];
        var child2Age = $_GET['ch2'] == undefined ? "" : $_GET['ch2'];

        if('' == watchTourEmail || 'undefined' == tourId) {
            sweetAlert('Не введен e-mail или нет id тура', '', "error");
            return;
        }
        /*
        // Не обязательно http://auto.ls1.ru/development/mini/detail?id=84763
        if (!watchTourPhone) {
            sweetAlert('Не указан телефон', '', "error");
            return;
        }
        */

        var formTypeToSubmit;
        if ($scope.formType == 7) {
            formTypeToSubmit = 3;
        } else {
            formTypeToSubmit = 6;
        }
        $http({
            method: 'POST',
            url: '/reservation_tour/watch_tour_apply',
            params: {
                'id': tourId,
                'email': watchTourEmail,
                'phone': watchTourPhone,
                'notify': 1,
                'similar': similar,
                'desiredPrice': desiredPrice,
                'formType': formTypeToSubmit,
                'ch1': child1Age,
                'ch2': child2Age
            }
        }).success(function (data) {
            if (undefined == data.message) {
                swal('При подписке на обновления тура произошла ошибка', '',"error");
                return;
            }
            if('ok' == data.status) {

                if (formType == 7) {
                    $('.follow-pp-watch-one-step').hide();
                    $('.follow-pp-watch-two-step').fadeIn('fast');
                } else {
                    $('.follow-pp-buy-one-step').hide();
                    $('.follow-pp-buy-two-step').fadeIn('fast');
                }
                return;


                $('#overlay_white').click();
                $rootScope.favorites += 1;
                swal(data.message, '', "success");
            }
            if('error' == data.status) {
                swal(data.message, '', "error");
            }
        });

    };

}]);



$().ready(function(){
    var numberFormInformInput = 0;

    $('input[name=verifyCode]').mask("999-999");
    $('.phone').mask("+7 (999) 999 99 99");

    $('.js-tooltip').click(function(event) {
        event.preventDefault();
        var $tooltip = $(this).find('.tooltip');
        if ($tooltip.is(':visible')) {
            $tooltip.hide();
        } else {
            setTimeout(function () {
                $tooltip.toggle();
            }, 10);
        }
    });

    $('.last-name').change(function(event) {
        numberFormInformInput = formInformationInput(numberFormInformInput);
    });

    $('.first-name').change(function(event) {
        numberFormInformInput = formInformationInput(numberFormInformInput);
    });

    $('.agreement').click(function(event) {
        reachCounterGoal('AGREEMENT');
    });

    $('.5-steps').click(function(event) {
        reachCounterGoal('FIVE_STEPS');
    });

    $('.follow-tooltip span').on('click', function() {
        $('.follow-content').toggle();
    });
    $('.follow-content-close').on('click', function() {
        $('.follow-content').hide();
    });

    $('body').click(function() {
        $('.price-tooltip').hide();
        $('.old-price-tooltip').hide();
    });
});

function formInformationInput(numberFormInformInput) {
    if (0 == numberFormInformInput) {
        reachCounterGoal('FORM_INPUT');
        numberFormInformInput++;
    }
    return numberFormInformInput;
}

function isCounterAvailable () {
    return ('undefined' != typeof window.yaCounter27158126);
}

function reachCounterGoal (goal) {
    if (isCounterAvailable()) {
        window.yaCounter27158126.reachGoal(goal);
    }
}

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

app.controller('dateController', ['$scope', '$element', function($scope, $element) {
    $scope.showNextDatePicker = function() {
        var elem = $element.find('.datepicker-inp').eq(0);
        elem.addClass('datepicker-open');
        elem.datepicker('option', {
            onClose: function() {
                elem.removeClass('datepicker-open');
            }
        });
        elem.datepicker('show');
    };
}]);

app.directive('focusIf', ['$timeout', function($timeout) {
    return function(scope, element, attrs) {
        scope.$watch(attrs.focusIf, function (newValue) {
            $timeout(function() {
                newValue && element[0].focus();
            });
        }, true);
    };
}]);