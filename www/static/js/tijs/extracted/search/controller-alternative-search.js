//function makeParamsArray(getParams) {
//    var tmpArray = new Array();
//    var paramArray = new Array();
//
//    for(var i=0; i < getParams.length; i++)
//    {
//        tmpArray = getParams[i].split('=');
//        paramArray[tmpArray[0]] = tmpArray[1];
//    }
//    paramArray['nf'] = parseInt(paramArray['nf']);
//    return paramArray;
//}

var roomSizes = {
    15: {children: 0, adults: 1},
    14: {children: 0, adults: 2},
    23: {children: 0, adults: 3},
    26: {children: 0, adults: 4},
    29: {children: 0, adults: 5},
    24: {children: 0, adults: 6},
    30: {children: 0, adults: 7},
    3: {children: 0, adults: 8},
    4: {children: 0, adults: 9},
    18: {children: 1, adults: 1},
    20: {children: 1, adults: 2},
    27: {children: 1, adults: 3},
    32: {children: 1, adults: 4},
    53: {children: 1, adults: 5},
    55: {children: 1, adults: 6},
    19: {children: 2, adults: 1},
    21: {children: 2, adults: 2},
    31: {children: 2, adults: 3},
    33: {children: 2, adults: 4},
    54: {children: 2, adults: 5},
    56: {children: 2, adults: 6}
};

function makeAlternativeSearchLinks(arrayParams) {
    var alternativeSearchLinks = {};
    alternativeSearchLinks['dateLinks'] = makeDateLinks(jQuery.extend(true, {}, arrayParams));
    alternativeSearchLinks['durationLinks'] = makeDurationLinks(jQuery.extend(true, {}, arrayParams), false, false);
    alternativeSearchLinks['withChildren'] = makeWithChildrenLinks(jQuery.extend(true, {}, arrayParams));
    alternativeSearchLinks['withoutHotel'] = makeWithoutHotelLinks(jQuery.extend(true, {}, arrayParams));

    alternativeSearchLinks['withoutMeal'] = makeLinkFromArray(jQuery.extend(true, {}, arrayParams, {me: ''}));
    alternativeSearchLinks['withoutOperator'] = makeLinkFromArray(jQuery.extend(true, {}, arrayParams, {op: ''}));

    alternativeSearchLinks['table'] = makeTableLinks(jQuery.extend(true, {}, arrayParams), false);
    alternativeSearchLinks.oneChildAsAdult = false;
    alternativeSearchLinks.twoChildrenAsAdults = false;
    var roomSize = parseInt(arrayParams['rs']);
    if (roomSizes[roomSize] != undefined) {
        if (roomSizes[roomSize].children > 0) {
            alternativeSearchLinks.oneChildAsAdult = makeTableLinks(jQuery.extend(true, {}, arrayParams, {rs: getRoomSize(roomSizes[roomSize].children - 1, roomSizes[roomSize].adults + 1), ch1: arrayParams.ch2, ch2: ''}), true);
        }
        if (roomSizes[roomSize].children > 1) {
            alternativeSearchLinks.twoChildrenAsAdults = makeTableLinks(jQuery.extend(true, {}, arrayParams, {rs: getRoomSize(roomSizes[roomSize].children - 2, roomSizes[roomSize].adults + 2), ch1: '', ch2: ''}), true);
        }
    }
    return alternativeSearchLinks;
}

function makeTableLinks(arrayParams, showSelectedDay) {
    if ('undefined' == arrayParams['df'] || '' == arrayParams['df']) {
        return false;
    }

    var datesArray = getDatesArray(jQuery.extend(true, {}, arrayParams), true);
    var resultArray = {};

    for(var key in datesArray) {
        if (!(datesArray[key] < new Date())) {
            arrayParams['df'] = arrayParams['dt'] = formatDate(datesArray[key]);
            resultArray[formatDateYmd(datesArray[key])] = makeDurationLinks(jQuery.extend(true, {}, arrayParams), showSelectedDay || key != "selectedDay", true);
        }
    }

    return resultArray;
}

function getNights(selectNight) {
    var result = [];
    selectNight = parseInt(selectNight);
    if (selectNight > 2) {
        result.push(selectNight-2);
    }
    if (selectNight > 1) {
        result.push(selectNight-1);
    }
    result.push(selectNight);
    if (selectNight < 30) {
        result.push(selectNight + 1);
    }
    if (selectNight < 29) {
        result.push (selectNight + 2);
    }
    return result.join(',');
}

function getDates (arrayParams) {
    var datesArray = getDatesArray(arrayParams, true);
    var result = [];
    for (var key in datesArray) {
        if (datesArray[key] > new Date()) {
            result.push(formatDateYmd(datesArray[key]));
        }
    };
    return result.join(',');
}

// получить массив
function getDatesArray (arrayParams, includeSelectedDay) {
    var date;
    var datesArray = {};
    var dateArray = arrayParams['df'].split('-');
    date = new Date(dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0]);

    datesArray['twoDaysBefore'] = new Date(date.setDate(date.getDate() - 2));
    datesArray['oneDayBefore'] = new Date(date.setDate(date.getDate() * 1 + 1));

    date.setDate(date.getDate() + 1);
    if (includeSelectedDay) {
        datesArray['selectedDay'] = new Date(date);
    }

    datesArray['oneDayAfter'] = new Date(date.setDate(date.getDate() * 1 + 1));
    datesArray['twoDaysAfter'] = new Date(date.setDate(date.getDate() * 1 + 1));
    return datesArray;
}

//-------------------Date Links Functions------------------------------------------------------
function makeDateLinks(arrayParams) {
    if ('undefined' == arrayParams['df'] || '' == arrayParams['df']) {
        return false;
    }
    var datesArray = getDatesArray(jQuery.extend(true, {}, arrayParams), false);
    var dateLinksArray = {};

    for(var key in datesArray) {
        if (!(datesArray[key] < new Date())) {
            datesArray[key] = formatDate(datesArray[key]);
            arrayParams['df'] = arrayParams['dt'] = datesArray[key];
            dateLinksArray[key] = makeLinkFromArray(arrayParams);
        }
    }
    return dateLinksArray;
}

/**
 * На выходе дата вида dd-mm-YYYY
 *
 * @param date
 * @returns {string}
 */
function formatDate(date) {
    var dd = date.getDate();
    if ( dd < 10 ) {
        dd = '0' + dd;
    }
    var mm = date.getMonth()+1;
    if ( mm < 10 ) {
        mm = '0' + mm;
    }
    var yy = date.getFullYear();
    return dd+'-'+mm+'-'+yy;
}

/**
 * На выходе дата вида YYYY-mm-dd
 *
 * @param date
 * @returns {string}
 */
function formatDateYmd(date) {
    var dd = date.getDate();
    if ( dd < 10 ) {
        dd = '0' + dd;
    }
    var mm = date.getMonth() + 1;
    if ( mm < 10 ) {
        mm = '0' + mm;
    }
    var yy = date.getFullYear();
    return yy + '-' + mm + '-' + dd;
}


//-------------------!Date Links Functions------------------------------------------------------

function makeDurationLinks(arrayParams, useSelectedDuration, useIndex) {
    if (!('undefined' !== arrayParams['nf'] && '' !== arrayParams['nf'])) {
        return false;

    }
    var duration = parseInt(arrayParams['nf']);
    var durationLinksArray = {};
    var durationsArray = {};
    durationsArray['minusTwoDays'] = duration * 1 - 2;
    durationsArray['minusOneDay'] = duration * 1 - 1;
    durationsArray['plusTwoDays'] = duration * 1 + 2;
    durationsArray['plusOneDay'] = duration * 1 + 1;

    if (useSelectedDuration) {
        durationsArray['selectedDuration'] = duration;
    } else {
        durationsArray['selectedDuration'] = false;
    }

    switch (duration) {
        case 1:
            durationsArray['minusTwoDays'] = durationsArray['minusOneDay'] = false;
            break;
        case 2:
            durationsArray['minusTwoDays'] = false;
            break;
        case 29:
            durationsArray['plusTwoDays'] = false;
            break;
        case 30:
            durationsArray['plusTwoDays'] = durationsArray['plusOneDay'] = false;
            break;
        default:
            break;
    }

    for(var key in durationsArray) {
        if (false !== durationsArray[key]) {
            arrayParams['nf'] = durationsArray[key];
            durationLinksArray[key] = makeLinkFromArray(arrayParams);
        }
    }

    if (useIndex) {
        var durationsLinksArrayIndex = [];
        if (false !== durationsArray["minusTwoDays"]) {
            durationsLinksArrayIndex.push({duration: duration-2, link: durationLinksArray["minusTwoDays"]});
        }
        if (false !== durationsArray["minusOneDay"]) {
            durationsLinksArrayIndex.push({duration: duration-1, link:  durationLinksArray["minusOneDay"]});
        }
        if (false !== durationsArray["selectedDuration"]) {
            durationsLinksArrayIndex.push({duration: duration, link:  durationLinksArray["selectedDuration"]});
        } else {
            durationsLinksArrayIndex.push({duration: duration, link:  false});
        }
        if (false !== durationsArray["plusOneDay"]) {
            durationsLinksArrayIndex.push({duration: duration * 1 + 1, link: durationLinksArray["plusOneDay"] });
        }
        if (false !== durationsArray["plusTwoDays"]) {
            durationsLinksArrayIndex.push({duration: duration * 1 + 2, link:  durationLinksArray["plusTwoDays"]});
        }
        return durationsLinksArrayIndex;
    }

    return durationLinksArray;
}

/**
 * Форматирования числа. Аналог функции PHP number_format
 */
function numberFormat(number, decimals, dec_point, thousands_sep) {
    var negative = number < 0;
    if (negative) {
        number = number * -1;
    }

    var i, j, kw, kd, km;
    if(isNaN(decimals = Math.abs(decimals))){
        decimals = 2;
    }
    if(dec_point == undefined){
        dec_point = ".";
    }
    if(thousands_sep == undefined){
        thousands_sep = " ";
    }
    i = parseInt(number = (+number || 0).toFixed(decimals)) + "";
    if((j = i.length) > 3){
        j = j % 3;
    } else {
        j = 0;
    }
    km = (j ? i.substr(0, j) + thousands_sep : "");
    kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
    //kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
    kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");

    if (kd == '.00') {
        return (negative ? '-' : '') + km + kw
    } else {
        return (negative ? '-' : '') + km + kw + kd;
    }
}

function getRoomSize (children, adults) {
    for (var index in roomSizes) {
        if (roomSizes[index].children == children && roomSizes[index].adults == adults) {
            return index;
        }
    }
    return 0;
}

function getRoomSizeChildrenAsAdults (roomSizeId) {
    var roomSize = parseInt(roomSizeId);
    if (roomSizes[roomSize] != undefined) {
        return getRoomSize(0, roomSizes[roomSize].adults + roomSizes[roomSize].children);
    }
}

function makeWithChildrenLinks(arrayParams) {
    var roomSizeLink = false;
    var newRoomSizeId = getRoomSizeChildrenAsAdults(arrayParams['rs']);
    if (newRoomSizeId != arrayParams['rs']) {
        arrayParams['rs'] = newRoomSizeId;
        arrayParams.ch1 = undefined;
        arrayParams.ch2 = undefined;
        roomSizeLink = makeLinkFromArray(arrayParams);
    }
    return roomSizeLink;
}

function makeWithoutHotelLinks(arrayParams) {
    if (!('undefined' !== arrayParams['al'] && arrayParams['al']).length) {
        return false;
    }
    var address = window.location.href;
    var withoutHotelLink = false;
    if(!(address.indexOf('/hotel/') + 1)) {
        arrayParams['al'] = '';
        withoutHotelLink = makeLinkFromArray(arrayParams);
    }
    return withoutHotelLink;
}


function makeLinkFromArray(arrayParams) {
    return arrayParams.getCurrentLink();
}



angular.module('search').controller('alternativeSearch', ['$scope', '$rootScope', '$location', '$http', '$log', function($scope, $rootScope, $location, $http, $log) {
    var baseSearchParams = $rootScope.searchParams;
    //$scope.getParams = decodeURIComponent(location.search.substr(1)).split('&');
    //$scope.arrayParams = makeParamsArray($scope.getParams);

    const NO_OPEN_FORM = 0;
    const OPEN_SEND_REQUEST_FORM = 1;
    const OPEN_BUY_TOUR_FORM = 2;
//    const FROM_EMPTY_SEARCH_REQUEST_FORM =10;

    $scope.links = {};
    $scope.prices = {};
    $scope.cities = [
        {name: 'spb', nameRus: 'Санкт-Петербург', id: 669},
        {name: 'nsk', nameRus: 'Новосибирск', id: 1530},
        {name: 'moscow', nameRus: 'Москва', id: 1000}
    ];

    $scope.showTextIfNoTours = true;

    $scope.renderDate = function (date) {
        date = new Date(date);
        var dd = date.getDate();
        if ( dd < 10 ) {
            dd = '0' + dd;
        }
        var mm = date.getMonth()+1;
        if ( mm < 10 ) {
            mm = '0' + mm;
        }
        var yy = date.getFullYear();
        var day = date.getDay();
        var rusDay = '';
        switch (day) {
            case 0: rusDay='Вс'; break;
            case 1: rusDay='Пн'; break;
            case 2: rusDay='Вт'; break;
            case 3: rusDay='Ср'; break;
            case 4: rusDay='Чт'; break;
            case 5: rusDay='Пт'; break;
            case 6: rusDay='Сб'; break;
            default: rusDay=''; break;
        }
        return dd+'.'+mm+'.'+yy+' '+rusDay;
    };

    $scope.getNightsDescription = function (nights) {
        return nights + ' ноч' + $scope.get_ending(nights, ['ей', 'ь', 'и']);
    };

    $scope.getRandomXC = function(n){
        var s ='', abd ='abcdefghijklmnopqrstuvwxyz0123456789', aL = abd.length;
        while(s.length < n)
            s += abd[Math.random() * aL|0];
        return s;
    };

    $scope.getPriceFromService = function (searchParams) {
        var roomSize = roomSizes[searchParams.rs] != undefined ? roomSizes[searchParams.rs] : {adults: 0, children: 0};
        var url = 'http://service.tourbook.ru/search/data';
        url+= '?turpoisk=NO&tourbook=MIN&hotel=NO';
        url+= '&nt=' + getNights(searchParams['nf']);
        url+= '&al=' + searchParams['al'].join(',');
        url+= '&source=CATALOG&info=SHORT';
        url+= '&dt=' + getDates(jQuery.extend(true, {}, searchParams), true);
        url+= '&requestTime=0&timeout=2880&noRequest=1';
        url+= '&ct=' + searchParams['ct'];
        var urlSearchRoomSize = url + '&adults=' + roomSize.adults + '&children=' + roomSize.children;
        urlSearchRoomSize += '&rk=' + $scope.getRandomXC(25);
        $.ajax({
            url: urlSearchRoomSize,
            jsonp: "callback",
            dataType: "jsonp",
            success: function(data) {
                $scope.receivePrices(data, 'searchRoomSize', false);
                for (var datePrice in $scope.prices.searchRoomSize) {
                    for (var durationPrice in $scope.prices.searchRoomSize[datePrice]) {
                        switch($scope.prices.searchRoomSize[datePrice][durationPrice]) {
                            case 'undefined':
                                break;
                            case -1:
                                break;
                            case null:
                                break;
                            default:
                                $scope.showTextIfNoTours = false;
                        }
                    }
                }
            }
        });
        if ($scope.$parent.data.children != 0) {
            $scope.childParams = [];
            var childrenCount = $scope.$parent.data.children;
            if (childrenCount > 0) {
                childrenCount--;
                var urlChildrenAsAdults = url + '&adults=' + (roomSize.adults + (roomSize.children - childrenCount)) + '&children=' + childrenCount;
                urlChildrenAsAdults += '&rk=' + $scope.getRandomXC(25);
                var count = childrenCount.toString();
                $.ajax({
                    url: urlChildrenAsAdults,
                    jsonp: "callback",
                    dataType: "jsonp",
                    success: function (data) {
                        $scope.receivePrices(data, 'oneChildAsAdult', false);
                    }
                });
            }
            if (childrenCount > 0) {
                childrenCount--;
                urlChildrenAsAdults = url + '&adults=' + (roomSize.adults + (roomSize.children - childrenCount)) + '&children=' + childrenCount;
                urlChildrenAsAdults += '&rk=' + $scope.getRandomXC(25);
                count = childrenCount.toString();
                $.ajax({
                    url: urlChildrenAsAdults,
                    jsonp: "callback",
                    dataType: "jsonp",
                    success: function (data) {
                        $scope.receivePrices(data, 'twoChildrenAsAdults', false);
                    }
                });
            }
        }
        // запросы из других городов
        url = 'http://service.tourbook.ru/search/data';
        url+= '?turpoisk=NO&tourbook=MIN&hotel=NO';
        url+= '&nt=' + searchParams['nf'];
        url+= '&al=' + searchParams['al'];
        url+= '&source=CATALOG&info=SHORT';
        var dateArray = searchParams['df'].split('-');
        url+= '&dt=' + formatDateYmd(new Date(dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0]));
        url+= '&requestTime=0&timeout=2880&noRequest=1';
        url+= '&adults=' + roomSize.adults + '&children=' + roomSize.children;
        $scope.links.otherCities = [];
        $scope.cities.forEach(function(city) {
            $.ajax({
                url: url + '&ct=' +  city.id + '&rk=' + $scope.getRandomXC(25),
                jsonp: "callback",
                dataType: "jsonp",
                success: function (data) {
                    $scope.receivePrices(data, city.id, true);
                }
            });
            $scope.links.otherCities[city.id] = makeLinkFromArray(jQuery.extend(true, {}, searchParams, {ct:  city.id}));
        });
    };

    // oneCost - одна цена, если поиск по городу, например
    $scope.receivePrices = function(data, param, oneCost) {
        var result = oneCost ? '' : {}
        for (var key in data.allocations) {
            var dates = data.allocations[key].dates;
            for (var date in dates) {
                if (!oneCost && result[date] == undefined) {
                    result[date] = {};
                }
                var durations = dates[date].durations;
                for (var duration in durations) {
                    if (durations[duration].tourbook.offers.length != 0) {
                        if (oneCost) {
                            result = numberFormat(durations[duration].tourbook.offers[0].priceRub, 2, '.', ' ');
                        } else {
                            if (result[date][duration] == undefined || durations[duration].tourbook.offers[0].priceRub < result[date][duration]) {
                                result[date][duration] = numberFormat(durations[duration].tourbook.offers[0].priceRub, 2, '.', ' ');
                            }
                        }
                    } else {
                        if (oneCost) {
                            result = null;
                        } else {
                            if (durations[duration].tourbook.status == 'NOT_EXISTS') {
                                result[date][duration] = null;
                            } else {
                                result[date][duration] = -1;
                            }
                        }
                    }
                }
            }
        }
        $scope.prices[param] = result;
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


    $rootScope.$on('srLoadingComplete', function($event, searchParams, count) {
        if(count > 0 && isCounterAvailable() && isHotelPage()) {
            reachCounterGoal('HOTEL_SHOW_PRICE');
        } else if(isCounterAvailable() && isHotelPage()) {
            reachCounterGoal('HOTEL_EMPTY_PRICE');
        }
        var baseSearchParams = $rootScope.searchParams;
        //$scope.getParams = decodeURIComponent(location.search.substr(1)).split('&');
        $scope.arrayParams = baseSearchParams;
        $scope.links = makeAlternativeSearchLinks(baseSearchParams);
        $scope.result = $scope.getPriceFromService(baseSearchParams);
    });

    $rootScope.$on('$srNeedToUpdate' , function() {
        if(isHotelPage()) {
            reachCounterGoal('HOTEL_PAGE_SEARCH_START');
        }
    });

    $scope.alternativeLinksSearch = function (url) {
        $rootScope.notShowSearchTooltip = true;
        $rootScope.notShowSearchTooltipCount = 3;
        var baseSearchParams = $rootScope.searchParams.initFromUrl(url);
        var filterScope = angular.element('.ls-form-submit').scope();
        filterScope.reload('init', baseSearchParams);
        $location.url(url);
        $rootScope.searchParams = baseSearchParams;
        $rootScope.closeSearchTooltip();

        $rootScope.$broadcast('$srGetTitleString');
        $rootScope.$broadcast('$srNeedToUpdate');
        $rootScope.$broadcast('$locationChangeSuccess');
        $scope.arrayParams = baseSearchParams;
        $scope.links = makeAlternativeSearchLinks(baseSearchParams);
        $scope.result = $scope.getPriceFromService(baseSearchParams);
    };
/*
    $scope.formType = NO_OPEN_FORM;

    $scope.isFirstOpenRequestForm = true;

    $scope.inputRequestForm = function(formType) {
        if(parseInt(formType) == OPEN_BUY_TOUR_FORM || parseInt(formType) == OPEN_SEND_REQUEST_FORM) {
            $scope.formType = parseInt(formType);
            if(typeof ga !== 'undefined') {
                ga('send', 'event', 'TextRequest', 'TextRequestOpen', 'TextRequestOpen');
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
        // /*
        $log.info('������� ������� �������� ������');
        var dataToSend = {tourId: $scope.tourConfig.id, source: 'request_open', transferSource: $scope.utmSource};
        $http({
            method: 'POST',
            url: '/tour/request_form', params: {params: dataToSend}
        }).success(function(receivedData){
        });
        reachCounterGoal('BOOKING_PAGE_REQUEST_OPEN');
        $scope.numberRequestInputs++;
        // /

    };
*/
    /*
    $scope.sendRequest = false;
    $scope.confirmRequest = false;
    $scope.formType = NO_OPEN_FORM;
    $scope.formDirty = false;

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

    $scope.send_comment = function () {

        $http({
            method: 'POST',
            url: '/comments/new_comment',
            params: {
                'name': $rootScope.user_fio,
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
        if (payment.length == 2) {
            paymentType = payment[0];
            officeId = payment[1];
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

    // todo
    // надо по идее убрать отсюда все,связанное с отправкой формы и использовать common-request-send.js
    $scope.sendTextRequestEmptySearch = function () {
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
        console.info($rootScope.searchParams);

        var requestParams = {
            'id':0,
            'user': $rootScope.user,
            //'promo': $scope.promo.code,
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
            'ch1': $rootScope.searchParams['ch1'] !== undefined ?$rootScope.searchParams['ch1'] : '',
            'ch2': $rootScope.searchParams['ch2'] !== undefined ?$rootScope.searchParams['ch2'] : '',
            'formType': FROM_EMPTY_SEARCH_REQUEST_FORM
        };

        if(typeof ga !== 'undefined') {
            ga('send', 'event', 'TextRequest', 'TextRequestRequestSend', 'TextRequestRequestSend');
        }

        console.info(requestParams);
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
                            $scope.requestSendStage = 1;
                            $log.info('Успешная отправка заявки из пустого поиска');
                            $scope.personalLink = false;
                            $rootScope.requests += 1;
                            $scope.requestId = data.requestId;
                            $scope.personalLink =  '/tour/request/detail?id=' + data.requestId;
                            $rootScope.requests += 1;
                            if ($scope.paymentTypeChanged || $('.select2-container.payment_type_select').is('.ng-dirty')) {
                                $scope.updatePaymentInfo();
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

    }
*/
    $scope.resetDataEmptySearch = function () {
        $filterScope = angular.element('.ls-form-submit').scope();
        $filterScope.resetData();
    }
}]);


$().ready(function() {
    $('.phone').mask("+9 (999) 999 99 99");
});