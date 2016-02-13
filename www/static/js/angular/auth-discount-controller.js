/**
 * Created by wolfh on 03.12.2015.
 */
angular.module('search').controller('authDiscount', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
    $scope.error = null;
    $scope.discount = null;
    $scope.inProgress = false;
    $scope.isFirstOpenAuthDiscountForm = true;

    if ($rootScope.user.authDiscount && (!$rootScope.userDiscount || $rootScope.userDiscount < 2)) {
        $rootScope.userDiscount = 2;
    }

    $rootScope.$on('$CheapestTourLoaded', function (data, tour, duration) {
        $scope.discount = parseInt(tour.priceRu * 0.02);
    });
    $rootScope.$on('userLogin', onAuth);
    $rootScope.$on('userRegistered', onAuth);

    $(function () {
        $('body').click(function() {
            $('.auth-discount-tooltip').hide();
        });
        $('.auth-discount').on('click', '.fa-question-circle', function (e) {
            $('.auth-discount-tooltip').toggle();
            e.preventDefault();
            e.stopPropagation();
        });
    });

    $scope.clickBanner = function() {
        if ($rootScope.user.authDiscount) {
            // skip
        } else if ($rootScope.user.isAuth) {
            $scope.fillForm();
            $('.auth-discount-btn-apply').click();
            if (typeof ga !== 'undefined') {
                ga('send', 'event', 'Auth discount', 'Auth discount: click to login', 'Auth discount: click to login');
            }
        } else {
            $('.auth-popover-button').click();
            if (typeof ga !== 'undefined') {
                ga('send', 'event', 'Auth discount', 'Auth discount: click to participate', 'Auth discount: click to participate');
            }
        }
    };

    $scope.fillForm = function() {
        if (!$scope.isFirstOpenAuthDiscountForm) {
            return;
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
            var surname = $rootScope.user.surname ? $rootScope.user.surname : '';
            var name = $rootScope.user.name ? $rootScope.user.name : '';
            var patronymic = $rootScope.user.patronymic ? $rootScope.user.patronymic : '';
            $rootScope.user_fio = surname + ' ' + name + ' ' + patronymic;
        }
        $rootScope.user.phoneCallAgree = true;
        $scope.isFirstOpenAuthDiscountForm = false;
    };

    $scope.sendForm = function() {
        if ($scope.inProgress) {
            return;
        }
        $scope.inProgress = true;
        $scope.error = null;
        $http.post('/auth/auth_discount', {
            fio: $scope.user_fio,
            email: $scope.user.email,
            phone: $scope.user.phone,
            phone_call_agree: $scope.user.phoneCallAgree
        }).then(function (response) {
            if (response.data.status == 'ok') {
                $('.auth-discount-form .modal-close').click();
                var wasAuth = $rootScope.user.isAuth;
                $rootScope.user = response.data.user;
                if (!wasAuth) {
                    $rootScope.$broadcast('userRegistered', $rootScope.user);
                }
                if (typeof ga !== 'undefined') {
                    ga('send', 'event', 'Auth discount', 'Auth discount: send success', 'Auth discount: send success');
                }
            }
            if (response.data.status == 'error') {
                $scope.error = response.data.message;
                if (typeof ga !== 'undefined') {
                    ga('send', 'event', 'Auth discount', 'Auth discount: send fail', 'Auth discount: send fail');
                }
            }
            $scope.inProgress = false;
        }, function () {
            if (typeof ga !== 'undefined') {
                ga('send', 'event', 'Auth discount', 'Auth discount: send crash', 'Auth discount: send crash');
            }
            $scope.inProgress = false;
        });
    };

    function onAuth(event) {
        $scope.isFirstOpenAuthDiscountForm = true;

        if (window.authFromBanner) {
            if (typeof ga !== 'undefined') {
                if (event.name == 'userLogin') {
                    ga('send', 'event', 'Auth discount', 'Auth discount: login', 'Auth discount: login');
                } else if (event.name == 'userRegistered') {
                    ga('send', 'event', 'Auth discount', 'Auth discount: registration', 'Auth discount: registration');
                }
            }
            if (!$scope.user.authDiscount) {
                $scope.fillForm();
                $('.auth-discount-btn-apply').click();
            }
        }
    }
}]);
