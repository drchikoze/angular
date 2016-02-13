(function() {
    const TIMER_REQUEST_FORM = 8; // заявка из формы по таймеру
    const BY_MAIL_FORM = 14; // заявка из формы по таймеру
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    var locationHash = window.location.hash;
    if (locationHash.indexOf('open_request_form') + 1) {
        setTimeout(function() {
            $('.common-request').scope().inputCommonRequestForm(BY_MAIL_FORM);
            $('.modal_common_request').toggle();
            $('.page-wrap').foggy();
            $('.overlay').toggle();
            window.openFormByTimer = true;
            if(typeof ga !== 'undefined') {
                ga('send', 'event', 'TextRequestByLeaverEmail', 'TextRequestByLeaverEmailOpen', 'TextRequestByLeaverEmailOpen');
            }
        }, 2000);
        return;
    }

    var firstOpenCookie = getcookie('firstOpenTime');
    var requestTimerClosed = getcookie('requestTimerClosed');

    var timeBeforeFormRender = 5 * 60 * 1000;
    if (firstOpenCookie) {
        var nowDate = new Date();
        var nowTime = nowDate.getTime();
        timeBeforeFormRender = timeBeforeFormRender - (nowTime - firstOpenCookie);
    }
    var nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);

    window.openFormByTimer = false;


    if (timeBeforeFormRender <= 0 && !requestTimerClosed && !isMobile.any()) {
        setTimeout(function() {
            var localStorageDate = new Date();
            var localStorageTime = localStorageDate.getTime();
            if (localStorage.getItem('lastOpenTime') && ((localStorageTime / 1000) - localStorage.getItem('lastOpenTime') < 30)) {
                return;
            }
            localStorage.setItem('lastOpenTime', localStorageTime / 1000);
            var t = 'common_request_timer';
            document.cookie = "requestTimerOpen=" + 'true;' + 'path=/;';
            $('.common-request').scope().inputCommonRequestForm(TIMER_REQUEST_FORM);
            $('.modal_' + t).toggle();
            $('.page-wrap').foggy();
            $('.overlay').toggle();
            window.openFormByTimer = true;
            //if(typeof ga !== 'undefined') {
            //    ga('send', 'event', 'TextRequestByTimer', 'TextRequestByTimerOpen', 'TextRequestByTimerOpen');
            //}
            setInterval(function(){
                localStorageDate = new Date();
                localStorageTime = localStorageDate.getTime();
                localStorage.setItem('lastOpenTime', localStorageTime / 1000);
            }, 10000);
        }, 20000)

    } else if (!requestTimerClosed  && !isMobile.any()) {
        if (timeBeforeFormRender < 20000) {
            timeBeforeFormRender = 20000;
        }
        setTimeout(
            function() {
                var localStorageDate = new Date();
                var localStorageTime = localStorageDate.getTime();
                if (localStorage.getItem('lastOpenTime') && ((localStorageTime / 1000) - localStorage.getItem('lastOpenTime') < 30)) {
                    return;
                }
                localStorage.setItem('lastOpenTime', localStorageTime / 1000);
                var t = 'common_request_timer';
                document.cookie = "requestTimerOpen=" + 'true;' + 'path=/;';
                $('.common-request').scope().inputCommonRequestForm(TIMER_REQUEST_FORM);
                $('.modal_' + t).toggle();
                $('.page-wrap').foggy();
                $('.overlay').toggle();
                window.openFormByTimer = true;
                if(typeof ga !== 'undefined') {
                    ga('send', 'event', 'TextRequestByTimer', 'TextRequestByTimerOpen', 'TextRequestByTimerOpen');
                }
                setInterval(function(){
                    localStorageDate = new Date();
                    localStorageTime = localStorageDate.getTime();
                    localStorage.setItem('lastOpenTime', localStorageTime / 1000);
                }, 10000);
            } , timeBeforeFormRender
        )
    }

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
})();

