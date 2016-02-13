
$(document).ready(function(){
    var oldPosition = null;

    $('.dropdown-toggle').dropdown();
    $('.auth-popover-button').click(function(e){
        var $target = $('#' + $(this).data('target'));
        var block = $target.closest('.header-top-auth');

        $('.auth-popover').hide();
        $('.overlay-invisible').show();
        $target.css('position', 'absolute');
        //$target.css('top', $target.offset().top);
        $target.show();

        $target.scope().opened();
        block.removeClass('auth-from-banner');
        if (oldPosition !== null) {
            block.css('top', oldPosition.top);
            block.css('left', oldPosition.left);
        }

        e.preventDefault();
        e.stopPropagation();
    });
    $('.overlay-invisible').click(function(e){
        $('.auth-popover').hide();
        $('.overlay-invisible').hide();
        e.stopPropagation();
    });
    $('.account-btn-logged').click(function(e){
        var t = $(this).data('target');
        $('.auth-popover').hide();
        $('.overlay-invisible').show();
        $('#'+t).show();
        e.preventDefault();
        e.stopPropagation();
    });
    $('.header-t-i-popup-user-logout').click(function(){
        $('#auth-popover-user-tab').hide();
        $('.overlay-invisible').hide();
    });

    $('#reg-phone').mask("+9 (999) 999 99 99");
});

angular.module('auth', [])
.controller('LoginReminderCtrl', ['$scope', '$timeout', '$log', '$rootScope', function ($scope, $timeout, $log, $rootScope) {
    $scope.showPrompt = false;


    if (!$rootScope.user.isAuth) {
        var time = window.localStorage.getItem('LoginReminderTime');
        var show = false;
        if (time === null) {
            show = true;
        } else {
            time = new Date(time);
            var offset = new Date; offset.setMinutes(offset.getMinutes() - 15);
            // Если еще не прошло 15 мнут с предыдущего открытия - обновляем время
            if (offset.getTime() < time.getTime()) {
                window.localStorage.setItem('LoginReminderTime', new Date());
            } else {
                show = true;
            }
        }

        if (show) {
            $timeout(function () {
                $scope.showPrompt = true;
                window.localStorage.setItem('LoginReminderTime', new Date());
                if(typeof ga !== 'undefined') {
                    ga('send', 'event', 'RegistrationPopup', 'RegistrationPopup:Open', 'RegistrationPopup:Open');
                }
            }, 5000);
        }
    }

    $scope.authOpen = function (form) {
        $('#login-prompt').hide();
        if (form == 'login') {
            $('#auth-login-btn').click();
            if(typeof ga !== 'undefined') {
                ga('send', 'event', 'RegistrationPopup', 'RegistrationPopup:Enter', 'RegistrationPopup:Enter');
            }
        } else {
            $('#auth-reg-btn').click();
            if(typeof ga !== 'undefined') {
                ga('send', 'event', 'RegistrationPopup', 'RegistrationPopup:Register', 'RegistrationPopup:Register');
            }
        }
    };
        $scope.closePrompt = function () {
            $scope.showPrompt = false;
            if(typeof ga !== 'undefined') {
                ga('send', 'event', 'RegistrationPopup', 'RegistrationPopup:Close', 'RegistrationPopup:Close');
            }
        }
    }])
.controller('RegistrationCtrl', ['$scope', '$http', '$log', '$rootScope', function ($scope, $http, $log, $rootScope) {
    $scope.registrationData = {};

    $scope.opened = function() {
        $scope.$apply(function() {
            $scope.authFromBanner = window.authFromBanner;
        });
    };

    $scope.submit = function() {
        $http({
            method: 'POST',
            url: '/auth/registration',
            params: {'params': $scope.registrationData}
        }).success(function (data) {
            if ('string' == typeof(data)){
                data = data.split(',"delimiter');
                data = data[0]+"}";
                data = JSON.parse(data);
            }
            $log.info(data);
            if (data.status == 'ok') {
                $rootScope.user = data.user;
                if ($scope.backUrl != undefined) {
                    document.location.href = $scope.backUrl;
                } else {
                    $rootScope.$broadcast('userRegistered', $rootScope.user);
                    if (window.location.pathname == '/my_tourbook' ) {
                        window.location.reload();
                    }
                }
                $('.auth-popover').hide();
                $('.overlay-invisible').hide();
            } else if (data.status == 'error') {
                alert(data.message);
            } else {
                alert('Произошла ошибка');
            }
        });
    };
}])


    .controller('LoginController', ['$scope', '$http', '$rootScope', '$timeout'  ,function ($scope, $http, $rootScope, $timeout) {
        $rootScope.hideRestoreForm = true;
        $rootScope.user = window.authData;
        $rootScope.favorites = window.favorites;
        $rootScope.requests = window.requests;
        $rootScope.searchHistory = window.searchHistory;

        $scope.changeFavorites = function(change) {
            $timeout(function() {
                $rootScope.favorites += change;
            }, 1);
        };

        $scope.opened = function() {
            $scope.$apply(function() {
                $scope.authFromBanner = window.authFromBanner;
            });
        };

        $scope.submit = function() {
            $http({
                method: 'POST',
                url: '/auth/login',
                params: {'params': $scope.loginData}
            }).success(function (data) {
                if (data.status == 'ok') {
                    $rootScope.user = data.user;
                    $rootScope.favorites = data.favorites;
                    $rootScope.requests = data.requests;
                    $rootScope.searchHistory = data.searchHistory;
                    jQuery.ajax({
                        url: "http://travelpassport.ru/remote_login?back_url=&TPSID=" + data.TPSessionId,
                        type: "POST",
                        dataType: "jsonp",
                        crossDomain: true,
                        success: function (response) {
                            var resp = JSON.parse(response)
                            alert(resp.status);
                        },
                        error: function (responseData, textStatus, errorThrown) {
                            //Нам будет возвращаться ошибка т.к. тревел пасспорт не возвращает JSONP, но это не важно -
                            //Для нас главное сделать запрос на ТП, что в общем-то и решает этот аякс
                        }
                    });
                    if ($scope.backUrl != undefined) {
                        document.location.href = $scope.backUrl;
                    } else {
                        $rootScope.$broadcast('userLogin', $rootScope.user);
                        if (window.location.pathname == '/my_tourbook' ) {
                            window.location.reload();
                        }
                    }
                    $('.auth-popover').hide();
                    $('.overlay-invisible').hide();
                }
                if (data.status == 'error') {
                    alert(data.message);
                }
            });
        };

        $scope.changeForm = function() {
            $rootScope.hideRestoreForm = !$rootScope.hideRestoreForm;
        };


        $scope.logout = function() {
            var oldUser = angular.copy($rootScope.user);

            $http({
                method: 'POST',
                url: '/auth/logout',
                params: {}
            }).success(function (data) {
                if (data.status == 'ok') {
                    $rootScope.user = data.user;
                    $rootScope.favorites = data.favorites;
                    if ('/personal_data' == window.location.pathname) {
                        window.location.href = "/";
                    } else {
                        $rootScope.$broadcast('userLogout', oldUser);
                    }
                }
            });
        }
    }])

.controller('RestorePassword', ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
    $rootScope.user = window.authData;
    $scope.submit = function() {
        $http({
            method: 'POST',
            url: '/auth/restore_password',
            params: {params: {"email": $scope.restorePasswordForm.email}}
        }).success(function (data) {
            if (data.status == 'ok') {
                alert('Письмо для восстановления пароля отправлено. Проверьте почту.');
                $rootScope.user = data.user;
                if ($scope.backUrl != undefined) {
                    document.location.href = $scope.backUrl;
                }
                $('.auth-popover').hide();
            }
            if (data.status == 'error') {
                alert(data.message);
            }
        });
    };

    $scope.changeForm = function() {
        $rootScope.hideRestoreForm = !$rootScope.hideRestoreForm;
    };
}]);