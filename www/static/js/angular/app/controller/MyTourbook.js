/**
 * Created by dmitriy on 07.08.2015.
 */
angular.module('personalCabinet', ['header-search', 'auth', 'feedback', 'LocalStorageModule', 'app', 'commonRequest'])
    .config(function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('tourbookPersonalCabinetSettings');
    })
    .filter('shortMonthName', function() {
        return function(input) {
            var words = input.split(' ');
            words[1] = words[1].substring(0, 3);
            return words.join(' ');
        };
    })
    .filter('date', function() {
        return function (input, format) {
            var date = new Date(input);
            if (date == 'Invalid Date') {
                date = moment(input, 'YYYY-MM-DD HH:mm:ss').toDate();
            }
            if (!date) {
                return input;
            }

            return moment(date).format(format ? format : 'DD MMM YYYY');
        };
    })
    .filter('shiftDate', function() {
        return function (input, shift) {
            var date = new Date(input);
            if (date == 'Invalid Date') {
                date = moment(input, 'YYYY-MM-DD HH:mm:ss').toDate();
            }
            if (!date) {
                return input;
            }
            date.setDate(date.getDate() + parseInt(shift));
            return date;
        };
    })
    .filter('price', function () {
        return function (input, format) {
            return number_format(input, 0, '.', ' ');
        };
    })
    .filter('range', function () {
        return function (input, from, to) {
            var list = [];
            to = parseInt(to);
            for (var i = parseInt(from); i <= to; ++i) {
                list.push(i);
            }
            return list;
        };
    })
    .filter('plural', function () {
        return function (input, rules) {
            if (parseInt(input) != input) {
                return input;
            }

            var num = parseInt(input) % 100;
            var digit = num % 10;

            if (num == 1 || (num > 20 && digit == 1)) {
                ending = 0;
            } else if (num > 1 && num < 5 || (num > 20 && digit > 1 && digit < 5)) {
                ending = 1;
            } else {
                ending = 2;
            }

            rules = rules.split('|');
            return input + ' ' + rules[ending];
        };
    })
    .filter('twoDecimals', function () {
        return function (input, format) {
            if (typeof input !== "undefined") {
                var varToRerurn = parseFloat(input).toFixed(2);
                if (varToRerurn > 0) {
                    return varToRerurn;
                }
            }
            return '';

        };
    })
    .filter('noDecimals', function () {
        return function (input, format) {
            if (typeof input !== "undefined") {
                var varToRerurn = parseInt(input);
                if (varToRerurn > 0) {
                    return varToRerurn;
                }
            }
            return '';

        };
    })
    .filter('trimStr', function () {
        return function (input, number) {
            var stringToReturn;
            if (typeof input == "undefined" || input == null) {
                return '';
            }
            if (input.length > number) {
                stringToReturn = input.substring(0, number);
                stringToReturn += '...';
            } else {
                stringToReturn = input;
            }
            return stringToReturn;
        };
    })
    .controller('MyTourbookController', ['$scope', '$http', 'localStorageService', '$timeout','$location',
        function($scope, $http, localStorageService, $timeout, $location) {
            $scope.divider = '!!!';
            $scope.favoritesData = null;
            $scope.firstTour = null;
            $scope.firstRequest = null;
            $scope.deleteType = null;
            $scope.itemToDelete = null;
            if (window.myTbData) {
                $scope.feeds = {
                    tours: {
                        time: window.myTbData.toursLastTime,
                        feed: window.myTbData.toursFeed,
                        complete: window.myTbData.toursLastTime === null
                    },
                    requests: {
                        time: window.myTbData.requestsLastTime,
                        feed: window.myTbData.searchRequestsFeed,
                        complete: window.myTbData.requestsLastTime === null
                    },
                    favorites: {
                        time: window.myTbData.favoritesLastTime,
                        feed: window.myTbData.favoritesFeed,
                        complete: window.myTbData.favoritesLastTime === null
                    },
                    incompleteTours: {
                        time: window.myTbData.notCompleteToursLastTime,
                        feed: window.myTbData.notCompleteToursFeed,
                        complete: window.myTbData.notCompleteToursLastTime === null
                    }
                };
                $scope.isShowOperators = window.myTbData.showOperators;
                $scope.list = {
                    tours: window.myTbData.tours,
                    notCompleteTours: window.myTbData.notCompleteTours,
                    countries: window.myTbData.searchCountryRequests,
                    hotels: window.myTbData.searchHotelRequests,
                    hotelsInfo: window.myTbData.hotelsInfo
                };

                if ($scope.feeds.tours.feed.length > 0) {
                    $scope.firstTour = $scope.feeds.tours.feed[0];
                }
                if ($scope.feeds.requests.feed.length > 0) {
                    $scope.firstRequest = $scope.feeds.requests.feed[0];
                }
                $scope.favoritesToHide = window.myTbData.favoritesToHide;
                $scope.deletedEventsCount = window.myTbData.deletedEventsCount;
            }

            $scope.dateNow = new Date();

            $scope.loadFavoritesList = function() {
                $http({
                    method: 'get',
                    url: '/favorites/tours_data'
                }).success(function(data) {
                    if (typeof data == 'string') {
                        var dataArrayString = data.split('<');
                        data = JSON.parse(dataArrayString[0]);
                    }
                    if (data.status == 'ok') {
                        var favoritesByIds = JSON.stringify(data);
                        favoritesByIds = JSON.parse(favoritesByIds);
                        favoritesByIds.tours = {};
                        angular.forEach(data.tours, function(item) {
                            favoritesByIds.tours[item['id']] = item;
                        });
                        $scope.favoritesData = favoritesByIds;
                        $scope.pricesAreUpdating = false;
                    } else {
                        //alert(data.message);
                    }
                });
            };

            $scope.getArrayByNumber = function(num) {
                num = parseInt(num);
                if(isNaN(num)) {
                    return new Array(0);
                }
                return new Array(num);
            };

            $scope.leftMenuClick = function(type) {
                if ('requests' == type) {
                    $scope.lastOpenedTab = "#SectionsView";
                    $('#cabType a:last').tab('show');
                    $scope.rememberLastOpenedTab();
                    $("html, body").animate({
                        scrollTop: $('#booking-section').offset().top
                    }, 400);

                }
            };

            $scope.removeFavorite = function(item) {
                if (!confirm('Удалить тур из избранного?')) {
                    return;
                }
                $http.post('/favorites/ajax/', {watcherId: item.id, action: 'remove'})
                    .then(function (response) {
                        var data = response.data;
                        if (typeof data == 'string' || data instanceof String) {
                            if (data.indexOf($scope.divider) != -1) {
                                data = JSON.parse(data.substr(0, data.indexOf($scope.divider)));
                            } else {
                                data = JSON.parse(data);
                            }
                        }
                        if (data.status == 'ok') {
                            angular.element('#login-controller').scope().changeFavorites(-1);
                            var removedElemIndex = _.findIndex($scope.favoritesData.tours, {id: item.id});
                            $scope.favoritesData.tours.splice(removedElemIndex, 1);
                        } else if (data.message) {
                            alert(data.message);
                        } else {
                            alert('Произошла ошибка');
                        }
                    }, function () {
                        alert('Произошла ошибка');
                    });
            };

            $scope.openRemoveItemForm = function(item, type) {
                //Обнуляем, если были предыдущие открытия
                $scope.deleteType = null;
                $scope.itemToDelete = null;
                $scope.textComment = null;
                $scope.deleteHotelReason = null;
                $scope.deleteCountryReason = null;
                var formToShow = $('.modal-follow');
                $scope.deleteType = type;
                $scope.itemToDelete = item;

                $scope.removeCurrentItem();
                /*
                 $timeout(function(){
                 formToShow.fadeIn('fast');
                 $('.overlay').show();
                 });
                 */
            };

            $scope.restoreItem = function(item, type, restoreInActive) {
                $('.popup-ok-hided').hide();
                //Обнуляем, если были предыдущие открытия
                $scope.restoreType = null;
                $scope.itemToRestore = null;
                $scope.restoreInActive = restoreInActive;
                if (restoreInActive) {
                    $scope.restoreType = $scope.deleteType;
                } else {
                    $scope.restoreType = type;
                }
                if (item === false) {
                    $scope.itemToRestore = $scope.itemToDelete;
                } else {
                    $scope.itemToRestore = item;
                }

                $http.post('/my_tourbook/restore_item', {
                    'type': $scope.restoreType,
                    'item': $scope.itemToRestore
                }).success(function(data) {
                    if (data.status == 'ok') {
                        if ($scope.restoreInActive) {
                            $('#' + $scope.itemToRestore[0]['id'] + '-' +  $scope.restoreType).show();
                        } else {
                            $('#' + $scope.itemToRestore[0]['id'] + '-' +  $scope.restoreType).hide();
                        }
                        alert('Успешно восстановлено');
                    } else {
                        alert('Произошла ошибка');
                    }
                });

            };

            $(".delete_type_select").select2();

            $scope.removeCurrentItem = function() {
                var deleteReason = 4;
                /*
                 // http://auto.ls1.ru/development/mini/detail?id=85618
                 switch ($scope.deleteType) {
                 case 'hotel':
                 deleteReason = $scope.deleteHotelReason;
                 break;
                 case 'country':
                 deleteReason = $scope.deleteCountryReason;
                 break;
                 default:
                 break;

                 }
                 if (deleteReason == null) {
                 alert('Выберите причину удаления');
                 return;
                 }
                 */

                $http.post('/my_tourbook/delete_item', {
                    'type': $scope.deleteType,
                    'item': $scope.itemToDelete,
                    'reason': deleteReason,
                    'reasonText': $scope.textComment
                }).success(function(data) {
                    if (data.status == 'ok') {
                        $('#' + $scope.itemToDelete[0]['id'] + '-' +  $scope.deleteType).hide();
                        //alert('Успешно удалено');
                        // попапчик
                        $('.popup-ok-hided').fadeIn('fast');
                        setTimeout(function(){
                            $('.popup-ok-hided').hide();
                        }, 5000);
                    } else {
                        alert('Произошла ошибка');
                    }

                });
            };

            $scope.lastOpenedTab = localStorageService.get('lastOpenedTab') || "#FeedView";

            $scope.rememberLastOpenedTab = function() {
                localStorageService.set('lastOpenedTab', $scope.lastOpenedTab);
            };

            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                if (this === e.target) {
                    $scope.lastOpenedTab = $(this).attr('data-target');
                    $scope.rememberLastOpenedTab();
                }
            });

            $scope.toggleFavoritesEditState = function(item) {
                item.editState = !item.editState;
            };

            $scope.showNotificationsForm = function(item) {
                $scope.currentFavoriteItem = item;
                var itemIsActive = item.is_active == 't' ? 1 : 0;
                $scope.favoriteNotificationsAction = itemIsActive ? 'notifications-off' : 'notifications-on';
                $('#favoritesNotificationsModal').modal('show');
            };

            $scope.toggleFavoritesNotifications = function( submitEvent) {
                $http.post('/favorites/ajax/', {'action': $scope.favoriteNotificationsAction,
                    'watcherId': $scope.currentFavoriteItem.id, 'email': $scope.currentFavoriteItem.watcher_email  })
                    .then(function (response) {
                        var data = response.data;
                        if (typeof data == 'string' || data instanceof String) {
                            if (data.indexOf($scope.divider) != -1) {
                                data = JSON.parse(data.substr(0, data.indexOf($scope.divider)));
                            } else {
                                data = JSON.parse(data);
                            }
                        }
                        if (data.status == 'ok') {
                            $scope.currentFavoriteItem.is_active = $scope.currentFavoriteItem.is_active == 't' ? 'f' : 't';
                            $('#favoritesNotificationsModal').modal('hide');
                        } else if (data.message) {
                            alert(data.message);
                        } else {
                            alert('Произошла ошибка')
                        }
                    }, function() {
                        alert('Произошла ошибка');
                    });
                submitEvent.preventDefault();
                return false;
            };

            $scope.updatePrice = function (item) {
                item.priceIsUpdating = true;
                $http.get('/favorites/tour_price?watcherId=' + item.id, '')
                    .then(function(response) {
                        var data = response.data;
                        if (typeof data == 'string' || data instanceof String) {
                            if (data.indexOf($scope.divider) != -1) {
                                data = JSON.parse(data.substr(0, data.indexOf($scope.divider)));
                            } else {
                                data = JSON.parse(data);
                            }
                        }
                        if (data.status == 'ok') {
                            var params = {"tour_id": data.tour_id};
                            params = JSON.stringify(params);

                            //Заменяем ссылки если ID тура изменился
                            var tour_id = item.tour_id;
                            if (tour_id != data.tour_id) {
                                item.book_link = '/tour/book/' + data.tour_id + item.return_params;
                            }
                            var updatedFormatted = data.updated_fmt;
                            var startPrice = +data.start_price;
                            $http.get('/tour/check_price?params=' + params, '')
                                .then(function (response) {
                                    data = response.data;
                                    if (typeof data == 'string' || data instanceof String) {
                                        if (data.indexOf('   ') != -1) {
                                            data = JSON.parse(data.substr(0, data.indexOf('   ')));
                                        } else {
                                            data = JSON.parse(data);
                                        }
                                    }
                                    if (data.status == 'ok') {
                                        // Записываем полученные данные
                                        var newPrice =  +data.price.priceRur.replace(' ', '');
                                        item.price_fmt = number_format(newPrice, 0, '.', ' ');
                                        item.price_diff = newPrice - startPrice;
                                        item.price_diff_percent = Math.ceil(Math.abs(item.price_diff)/startPrice * 100);
                                        item.price_diff_fmt = number_format(item.price_diff, 0, '.', ' ');
                                        item.price_diff_fmt = (item.price_diff > 0 ) ? '+' + item.price_diff_fmt : item.price_diff_fmt;
                                        item.priceIsUpdating = false;
                                        if (item.price_diff) {
                                            item.timePriceLastChanged = data.price.fixLastUpdateTime;
                                            item.datePriceLastChangedFormatted = updatedFormatted;
                                        }
                                    } else {
                                        alert('Произошла ошибка при попытке запросить актуальную цену у оператора');
                                    }
                                }, function() {
                                    alert('Произошла ошибка при попытке уточнить актуальную цену');
                                });
                        }
                    }, function() {
                        alert('Произошла ошибка при попытке запросить актуальную цену у оператора');
                    });
            };

            $scope.searchPrices = [];
            $scope.searchStatuses = [];
            $scope.loadingPrices = [];

            $scope.updateSearchPrice = function (itemId, searchKey) {

                var completeSearchKey = searchKey || false;
                var urlPrice;
                if (searchKey) {
                    urlPrice = '/my_tourbook/update_search_price?id=' + itemId + '&searchKey=' + searchKey;
                } else {
                    urlPrice = '/my_tourbook/update_search_price?id=' + itemId;
                }
                $scope.loadingPrices[itemId] = true;
                $http.get(urlPrice, '')
                    .then(function(response) {
                        var data = response.data;
                        if (typeof data == 'string' || data instanceof String) {
                            if (data.indexOf($scope.divider) != -1) {
                                data = JSON.parse(data.substr(0, data.indexOf($scope.divider)));
                            } else {
                                data = JSON.parse(data);
                            }
                        }
                        if (data.status == 'ok') {
                            var searchKeyToUpdate = data.searchKey;
                            if (data.price) {
                                $scope.searchPrices[itemId] = [];
                                $scope.searchPrices[itemId]['price'] = data.price;
                                $scope.searchPrices[itemId]['id'] = data.tourLink;
                                $scope.searchPrices[itemId]['searchDate'] = data.searchDate;
                                $scope.searchPrices[itemId]['allocation'] = data.allocationName;
                                $scope.searchPrices[itemId]['allocCat'] = data.allocCat;
                                $scope.searchPrices[itemId]['operator'] = data.operator;
                                $scope.searchPrices[itemId]['time'] = data.time;
                                $scope.searchPrices[itemId]['loaded'] = true;
                            }

                            if (!completeSearchKey) {
                                $scope.loadingPrices[itemId] = true;
                                $scope.checkSearchStatus(itemId, searchKeyToUpdate);
                            } else {
                                $scope.loadingPrices[itemId] = false;
                                if (!data.price) {
                                    $scope.searchPrices[itemId] = [];
                                    $scope.searchPrices[itemId]['emptyResults'] = true;
                                }
                            }
                        }
                    }, function() {
                    });
            };

            $scope.timersSearchStatus = [];

            $scope.checkSearchStatus = function(itemId, searchKey) {

                var requestParams = {searchKey: searchKey};
                (function () {
                    $http({
                        method: 'GET',
                        url: '/search/search_status',
                        params: requestParams
                    }).success(function (data) {
                        if (!data.complete && data.status == 'ok') {
                            setTimeout(function () {
                                $scope.checkSearchStatus(itemId, searchKey)
                            }, 5000);
                        } else if (data.status == 'ok')  {
                            $scope.updateSearchPrice(itemId, searchKey);
                        } else {
                            console.log('Receiving search status error');
                            $scope.updateSearchPrice(itemId, searchKey);
                        }
                    })
                })();
            };


            $scope.updateAllFavoritePrices = function() {
                $scope.favoritesData.tours.map(function(item) {
                    if (item.actual) {
                        $scope.updatePrice(item);
                    }
                });
            };

            $scope.isThereFavoritesToUpdate = function() {
                return $scope.favoritesData && _.filter($scope.favoritesData.tours, function(item) { return item.actual }).length >  2;
            };

            $scope.setDesiredPrice = function(item, submitEvent) {
                $http.post('/favorites/ajax/', {action: 'my-price', watcherId: item.id, myPrice: parseInt(item.desired_price) }  )
                    .then(function(response) {
                        var data = response.data;
                        if (typeof data == 'string' || data instanceof String) {
                            if (data.indexOf($scope.divider) != -1) {
                                data = JSON.parse(data.substr(0, data.indexOf($scope.divider)));
                            } else {
                                data = JSON.parse(data);
                            }
                        }
                        if (data.status == 'ok') {
                            item.desired_price_fmt = number_format(item.desired_price, 0, '.' , ' ');
                            item.editState = false;

                        } else if (data.message) {
                            alert(data.message);
                        } else {
                            alert('Произошла ошибка')
                        }
                    }, function() {
                        alert('Произошла ошибка');
                    });
                submitEvent.preventDefault();
                return false;
            };

            $scope.updateList = function (data) {
                // Лента заявок
                $.merge($scope.feeds.tours.feed, data.toursFeed);
                if (data.toursLastTime === null) {
                    $scope.feeds.tours.complete = true;
                } else {
                    $scope.feeds.tours.time = data.toursLastTime;
                }

                // Лента поисков
                $.merge($scope.feeds.requests.feed, data.requestsFeed);
                if (data.requestsLastTime === null) {
                    $scope.feeds.requests.complete = true;
                } else {
                    $scope.feeds.requests.time = data.requestsLastTime;
                }

                // Лента избранного
                $.merge($scope.feeds.favorites.feed, data.favoritesFeed);
                if (data.favoritesLastTime === null) {
                    $scope.feeds.favorites.complete = true;
                } else {
                    $scope.feeds.favorites.time = data.favoritesLastTime;
                }

                // Лента не завершенных заявок
                $.merge($scope.feeds.incompleteTours.feed, data.notCompleteToursFeed);
                if (data.notCompleteToursLastTime === null) {
                    $scope.feeds.incompleteTours.complete = true;
                } else {
                    $scope.feeds.incompleteTours.time = data.notCompleteToursLastTime;
                }

                angular.extend($scope.list.tours, data.tours);
                angular.extend($scope.list.notCompleteTours, data.notCompleteTours);
                angular.extend($scope.list.countries, data.requests.countries);
                angular.extend($scope.list.hotels, data.requests.hotels);
                angular.extend($scope.list.hotelsInfo, data.requests.hotelsInfo);
                angular.extend($scope.favoritesToHide, data.favoritesToHide);

                $scope.toursLoading = false;
                $scope.requestsLoading = false;
            };

            $scope.loadRequests = function () {
                $scope.requestsLoading = true;
                // TODO: Костыль. Говорили что разделы собираются убрать, поэтому пока так,
                // TODO: но потом надо будет либо убрать разделы, либо объединить два контроллера
                angular.element('#FeedView').scope().loadFeed();
            };

            $scope.updateTopBlockItems = function(itemToUpdateFromFeed) {
                var itemToUpdate;
                var lastTimeStr;
                //console.log($scope.list.hotels);
                if (itemToUpdateFromFeed['type'] == 'hotel') {
                    itemToUpdate = $scope.list.hotels[itemToUpdateFromFeed['key']];
                    lastTimeStr = $scope.list.hotels[itemToUpdateFromFeed['key']][0]['last_time'];
                } else if (itemToUpdateFromFeed['type'] == 'country') {
                    itemToUpdate = $scope.list.countries[itemToUpdateFromFeed['key']];
                    lastTimeStr = $scope.list.countries[itemToUpdateFromFeed['key']][0]['last_time'];
                } else {
                    return;
                }
                var lastTime = new Date(lastTimeStr);
                var dateNow = new Date();
                var minutes = Math.floor(Math.abs(lastTime - dateNow) / (1000 * 60));
                //need to update if passed more than 15 minutes since last updating
                console.log('minutes ' + minutes);
                var isNeedToUpdate = minutes > 15;
                for (var idx = 0; idx < itemToUpdate.length; idx++) {
                    if ( (idx == 0)  && !isNeedToUpdate ) {
                        continue;
                    }
                    $scope.updateSearchPrice(itemToUpdate[idx]['id']);
                }
            };

            $scope.isShownInHotel = function(item) {
                return !(typeof $scope.favoritesToHide[item.id] == "undefined");
            };

            $scope.loadTours = function () {
                $scope.toursLoading = true;
                // TODO: Костыль. Говорили что разделы собираются убрать, поэтому пока так,
                // TODO: но потом надо будет либо убрать разделы, либо объединить два контроллера
                angular.element('#FeedView').scope().loadFeed();
            };

            // взято из main.js и переделано немного
            $scope.watchTour = {
                email: window.authData.email,
                phone: window.authData.phone,
                notify: false,
                similar: true,
                desiredPrice: '',
                //desiredPriceDefault: window.searchPriceRurValue,
                //inFavorites: window.inFavorites,
                //inSubscriptions: window.inSubscriptions,
                //watcherId: window.watcherId,
                formType: 0,
                id: null
            };

            $scope.openFollowHotel = function(source, hotel) {
                var formToShow = $('.modal-follow-my-tb');
                if(hotel != undefined) {
                    console.info(hotel);
                    $scope.currentHotel = hotel;
                    //console.info($scope.currentHotel.id);
                    //console.info($scope.searchPrices);
                    if($scope.searchPrices[$scope.currentHotel.id] != undefined) {
                        $scope.watchTour.id = $scope.searchPrices[$scope.currentHotel.id].id;
                    } else {
                        $scope.watchTour.id = null;
                    }
                }
                $('.follow-pp-watch-two-step').hide();
                $('.follow-pp-watch-one-step').show();
                $('.follow-pp-buy-two-step').hide();
                $('.follow-pp-buy-one-step').show();
                //console.info($scope.watchTour);
                $timeout(function(){
                    formToShow.fadeIn('fast');
                    $('.overlay').show();
                    if (source == 7) {
                        $('.follow-pp-tab.follow-pp-tab-watch').trigger('click');
                    } else {
                        $('.follow-pp-tab.follow-pp-tab-buy').trigger('click');
                    }
                    $scope.formType = parseInt(source);
                });
            }

            $scope.watchTourSubmit = function(customFormType) {
                var watchTourEmail = $scope.watchTour.email;
                var watchTourPhone = $scope.watchTour.phone;
                var tourId = $scope.watchTour.id;
                var formType = typeof customFormType == 'undefined' ? $scope.formType : customFormType;
                //console.log(tourId);
                var similar = true === $scope.watchTour.similar ? true : '';
                var desiredPrice =  $scope.watchTour.desiredPrice.replace(/[^\d]/gi, '');

                if('' == watchTourEmail) {
                    sweetAlert('Не введен e-mail', '', "error");
                    return;
                }

                if (tourId) {
                    // С существующим туром
                    var submitUrl = '/reservation_tour/watch_tour_apply';
                    var submitParams = {
                        'id': tourId,
                        'email': watchTourEmail,
                        'phone': watchTourPhone,
                        'notify': 1,
                        'similar': similar,
                        'desiredPrice': desiredPrice,
                        'formType': formType,
                        'ch1': $scope.currentHotel.child1_age,
                        'ch2': $scope.currentHotel.child2_age,
                    }
                } else {

                    /*
                     departureCityId=' + $rootScope.searchParams.ct + '&
                     countryId=' + $rootScope.searchParams.co + (($rootScope.searchParams.re instanceof Array) ? '&
                     resortId=' + $rootScope.searchParams.re.join('&resortId=') : '&resortId=' + $rootScope.searchParams.re) + ($rootScope.searchParams.al[0] ? '&
                     allocationId=' + $rootScope.searchParams.al[0] : '');
                     */

                    // Без ID тура
                    var submitUrl = '/reservation_tour/watch_tour_apply_no_tour';
                    var submitParams = {
                        // Параметры поиска
                        'departureCityId': $scope.currentHotel.city_id,
                        'allocationId':  $scope.currentHotel.allocation_id_str,
                        'nights': $scope.currentHotel.duration,
                        'date_from': $scope.currentHotel.df,
                        'room_size': $scope.currentHotel.room_size_id,
                        'ch1': $scope.currentHotel.child1_age,
                        'ch2': $scope.currentHotel.child2_age,
                        'email': watchTourEmail,
                        'phone': watchTourPhone,
                        'notify': 1,
                        'similar': similar,
                        'desiredPrice': desiredPrice,
                        'formType': formType
                    }
                }
                $http({
                    method: 'POST',
                    url: submitUrl,
                    params: submitParams
                }).success(function (data) {
                    if (undefined == data.message) {
                        swal('При подписке на обновления тура произошла ошибка', '',"error");
                        return;
                    }
                    if('ok' == data.status) {
                        $scope.currentHotel['subscriptions'] = true;
                        if (formType == 7) {
                            $('.follow-pp-watch-one-step').hide();
                            $('.follow-pp-watch-two-step').fadeIn('fast');
                        } else {
                            $('.follow-pp-buy-one-step').hide();
                            $('.follow-pp-buy-two-step').fadeIn('fast');
                        }
                        $('.hp-ttl-fav').addClass('active');
                        return;
                        /*
                         if (isHotelPage()) {
                         if (formType == 7) {
                         $('.follow-pp-watch-one-step').hide();
                         $('.follow-pp-watch-two-step').fadeIn('fast');
                         } else {
                         $('.follow-pp-buy-one-step').hide();
                         $('.follow-pp-buy-two-step').fadeIn('fast');
                         }
                         $('.hp-ttl-fav').addClass('active');
                         return;
                         }
                         $('#overlay_white').click();
                         $rootScope.favorites += 1;
                         swal(data.message, '', "success");
                         $('.hp-ttl-fav').addClass('active');
                         */
                    }
                    if('error' == data.status) {
                        swal(data.message, '', "error");
                    }
                });
            };

            // Формирование блока Интересы
            function getCookie(name) {
                function escape(s) {
                    return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, '\\$1');
                }

                var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
                return match ? match[1] : null;
            }

            var ADVBROKER_HOST = 'http://advbroker.ru';
            var COOKIE_NAME = "best-prices";
            /*
             var HOST;// = (location.host.indexOf("db0.ru") < 0 ) ? "http://service.tourbook.ru" : "http://service.tourbook.ru.db0.ru";
             var hostCookie = getCookie("tour-price-search-debug");
             if (hostCookie) {
             HOST = hostCookie;
             } else {
             HOST = (location.host.indexOf("db0.ru") < 0 ) ? "http://service.tourbook.ru" : "http://service.tourbook.ru.db0.ru";
             }
             */
            var HOST = "http://service.tourbook.ru";

            var ajax = function (url, data, success, error) {
                $.ajax({
                    url: url,
                    jsonp: "callback",
                    contentType: "application/json",
                    dataType: 'jsonp',
                    data: data,
                    success: success,
                    error: error || function (e) {
                        console.log(e);
                    }
                });
            };

            (function () {
                var interestThHotels = [];
                var cookies = document.cookie;
                var lastHotels = [];

                ajax(ADVBROKER_HOST + "/data/gate.php", {
                    format: "jsonp",
                    worker: "Preference_AllocationIdList"
                }, function (res) {
                    for (var n in res) {
                        if (lastHotels.length <= 10) {
                            lastHotels.push(+res[n]);
                        }
                    }

                    ajax(ADVBROKER_HOST + "/data/gate.php", {
                        format: "jsonp",
                        worker: "Banner_ThUserType_DataLoader"
                    }, function (params) {
                        var date;
                        var split = params.date.split("."); // lastSearchParams.date = "08.04.15" // ["08", "04", "15"]
                        if (split[2].length == 2) {
                            date = '20' + split[2] + '-' + split[1] + '-' + split[0];
                        } else {
                            date = split[2] + '-' + split[1] + '-' + split[0];
                        }
                        var interestThHotelsMomentDate = moment(params.date, 'DD.MM.YY');
                        var interestThHotelsDuration = params.night;
                        var date = new Date();
                        var timeint = date.getTime() % 1000000;
                        var searchParams = {
                            departureCityId: params.city_id,
                            adults: params.adult_num,
                            children: params.child_num || 0,
                            al: lastHotels.join(","),
                            dt: interestThHotelsMomentDate.format('YYYY-MM-DD'),
                            nt: interestThHotelsDuration,
                            turpoisk: 'NO',
                            tourbook: 'MIN',
                            hotel: 'NO',
                            info: 'FULL',
                            requestTime: 0,
                            source: 'TOURBOOK_BANNER',
                            rk: timeint,
                        };

                        var interestThHotelsLength = 0;
                        var interestsRequestTime = 0;
                        $scope.interestThHotelsProcessing = $scope.interestThHotelsAdditionalProcessing = true;
                        var interestsTimerId = setInterval(function() {
                            if (interestThHotelsLength < 3) {
                                searchParams['requestTime'] = interestsRequestTime++;
                                $http.jsonp(HOST + "/search/data?callback=JSON_CALLBACK", {
                                    method: 'POST',
                                    params: searchParams
                                }).success(function (res) {
                                    console.log(res);
                                    var resData;
                                    if (res['status'] != 'NOT_EXISTS') {
                                        console.log("search data res", res);
                                        for (var allocationId in res['allocations']) {
                                            if (res['allocations'][allocationId]['status'] == 'DONE') {
                                                resData = res['allocations'][allocationId]['dates'][searchParams.dt];
                                                if (resData && resData['status'] == 'DONE') {
                                                    if (resData = resData['durations'][searchParams.nt]) {
                                                        if (resData['status'] == 'DONE') {
                                                            var offers = [];
                                                            for (var source in resData) {
                                                                if (source != 'status' && resData[source] != undefined && resData[source]['offers'] != undefined && resData[source]['offers'][0] != undefined && resData[source]['offers'][0]['priceRub'] != undefined && (offers.length == 0 || offers['priceRub'] > resData[source]['offers'][0]['priceRub'])) {
                                                                    offers = resData[source]['offers'][0];
                                                                }
                                                            }
                                                            console.log('offers', offers);
                                                            if (offers != undefined &&
                                                                offers['allocation'] != undefined &&
                                                                offers['alloccat'] != undefined &&
                                                                offers['country'] != undefined &&
                                                                offers['departureCity'] != undefined &&
                                                                offers['resort'] != undefined &&
                                                                offers['date'] != undefined &&
                                                                offers['duration'] != undefined &&
                                                                offers['priceRub'] != undefined
                                                            ) {
                                                                var interestThHotel = offers;
                                                                if (interestThHotel['roomSizeDescriptions'] == undefined) {
                                                                    interestThHotel['roomSizeDescriptions'] = '';
                                                                }
                                                                interestThHotel['momentDate'] = moment(interestThHotel['date'], 'YYYY-MM-DD');
                                                                interestThHotel['detailsHref'] = '/hotel/1000/al' +
                                                                    allocationId + '/details/' +
                                                                    interestThHotel['momentDate'].format('DD.MM.YYYY') + '/' +
                                                                    offers['duration'];
                                                                interestThHotel['priceRubStr'] = String(offers['priceRub']).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
                                                                interestThHotel['ffShow'] = false;
                                                                interestThHotel['additional'] = false;

                                                                if (interestThHotels[allocationId] == undefined) {
                                                                    interestThHotelsLength++;
                                                                }

                                                                interestThHotels[allocationId] = interestThHotel;

                                                                if (interestThHotelsLength > 2) {
                                                                    clearInterval(interestsTimerId);
                                                                    $scope.interestThHotelsProcessing = false;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        console.log("unsorted interestThHotels", interestThHotels);

                                        $scope.interestThHotels = [];
                                        for (var al in interestThHotels) {
                                            $scope.interestThHotels.push(interestThHotels[al]);
                                            if ($scope.interestThHotels.length > 2) {
                                                break;
                                            }
                                        }
                                        Array.prototype.sort.call( $scope.interestThHotels, function( a, b ) {
                                            return a.priceRub - b.priceRub;
                                        });

                                        console.log('scope interestThHotels', $scope.interestThHotels);
                                    }
                                    if (res['status'] != 'IN_PROGRESS') {
                                        clearInterval(interestsTimerId);
                                        $scope.interestThHotelsProcessing = false;
                                    }
                                });
                            }
                        }, 1000);

                        var interestsAdditionalTimerId = setInterval(function() {
                            if (!$scope.interestThHotelsProcessing) {
                                console.log('additional');
                                $scope.interestThHotelsAdditionalProcessing = false;
                                $scope.interestThHotels.forEach(function(item) {
                                    if (!item['additional']) {
                                        $scope.interestThHotelsAdditionalProcessing = true;
                                    }
                                });

                                if ($scope.interestThHotelsAdditionalProcessing) {
                                    $scope.interestThHotels.forEach(function(item) {
                                        if (!item['additional']) {
                                            $http({
                                                url:"/search/hotel_additional_info?callback=JSON_CALLBACK",
                                                method: 'GET',
                                                params: {'id': item['allocationId']}
                                            }).success(function (res) {
                                                console.log("hotel_additional_info", res);

                                                item['transValueName'] = res['trans_value_name'];
                                                item['placeValueName'] = res['place_value_name'];
                                                item['rate'] = res['rate'];
                                                item['bestVotesPercent'] = res['best_votes_percent'];
                                                item['additional'] = true;

                                                $scope.interestThHotelsAdditionalProcessing = false;
                                            }).error(function (e) {
                                                console.log(e);
                                                $scope.interestThHotelsAdditionalProcessing = false;
                                            });
                                        }
                                    });
                                } else {
                                    console.log('Additional interests th info filled.');
                                    clearInterval(interestsAdditionalTimerId);
                                    $scope.interestThHotelsAdditionalProcessing = false;
                                }
                            }
                        }, 1000);

                        window.setTimeout(function() {
                            clearInterval(interestsTimerId);
                            clearInterval(interestsAdditionalTimerId);
                            $scope.interestThHotelsProcessing = false;
                            $scope.interestThHotelsAdditionalProcessing = false;
                        }, 30000);
                    });
                });
            })();
            // (формирование блока Интересы)

            // взято из main.js и переделано немного
        }])
    .controller('FeedViewFilterController', [
        '$scope', '$http', 'localStorageService', '$interval', '$location', function($scope, $http, localStorageService, $interval, $location) {
            $scope.showAll = true;
            $scope.feed = [];
            $scope.feedEnd = false;
            $scope.feedLoading = false;
            $scope.isShowOperators = window.myTbData.showOperators == 1;
            $scope.deletedItemsShow = false;
            var delIdx = $location.search()['del'];
            if (parseInt(delIdx)) {
                $scope.deletedItemsShow = true;
            }

            $scope.itemToUpdate = false;

            $scope.checkRenderAll = function() {
                return ($scope.showFavorites == $scope.showRequests) && ($scope.showFavorites == $scope.showSearchHistory);
            };

            $scope.activateFilterAndRememberState = function() {
                localStorageService.set('showFavorites', +$scope.showFavorites);
                localStorageService.set('showRequests', +$scope.showRequests);
                localStorageService.set('showSearchHistory', +$scope.showSearchHistory);
                $scope.showAll =  $scope.checkRenderAll();
                var countryIdx = $location.search()['co'];
                var countryStr = '';
                if (typeof countryIdx == "undefined") {
                    countryStr = '';
                } else {
                    countryStr = '?co=' + countryIdx;
                }
                location.reload();
            };

            $scope.saveValue = function(key, value) {
                localStorageService.set(key,  +value);
                $scope.showAll =  $scope.checkRenderAll();
            };

            $scope.setOperatorsOpen = function() {
                $scope.$parent.isShowOperators = $scope.isShowOperators;
                setCookie('operatorsOpen', $scope.$parent.isShowOperators, {expires: 14*24*60*60});
                $http({
                    method: 'POST',
                    url: '/set_operators_render',
                    params: {
                        'state': $scope.isShowOperators
                    }
                }).success(function(data) {});
            };

            $scope.setDeletedItemsShow = function() {
                //$scope.deletedItemsShow = !$scope.deletedItemsShow;
                var delParam;
                delParam =  $scope.deletedItemsShow ? 1 : 0;
                var data = $location.search();
                data['del'] = delParam;
                $location.search('del', delParam);
                location.reload();
            };

            $scope.favoritesAreShown = function() {
                return $scope.showFavorites || $scope.showAll;
            };

            $scope.deactivateFilterAndClearState = function() {
                $scope.showFavorites = $scope.showRequests = $scope.showSearchHistory = false;
                localStorageService.remove('showFavorites', 'showRequests', 'showSearchHistory');
                $scope.showAll = true;
            };

            $scope.initializeFilterData = function() {
                $scope.showFavorites = !!localStorageService.get('showFavorites');
                $scope.showRequests = !!localStorageService.get('showRequests');
                $scope.showSearchHistory = !!localStorageService.get('showSearchHistory');
                $scope.showAll =  $scope.checkRenderAll();
            };

            $scope.updateFeed = function () {
                var types = [];
                $scope.feedEnd = true;
                if ($scope.showFavorites || $scope.showAll) {
                    types.push($scope.feeds.favorites);
                    if (!$scope.feeds.favorites.complete) {
                        $scope.feedEnd = false;
                    }
                }
                if ($scope.showRequests || $scope.showAll) {
                    types.push($scope.feeds.tours);
                    if (!$scope.feeds.tours.complete) {
                        $scope.feedEnd = false;
                    }
                    types.push($scope.feeds.incompleteTours);
                    if (!$scope.feeds.incompleteTours.complete) {
                        $scope.feedEnd = false;
                    }
                }
                if ($scope.showSearchHistory || $scope.showAll) {
                    types.push($scope.feeds.requests);
                    if (!$scope.feeds.requests.complete) {
                        $scope.feedEnd = false;
                    }
                }
                var minTime = new Date(0);
                $scope.feed = [];
                angular.forEach(types, function (obj) {
                    var time = new Date(obj.time);
                    // Выбираем самую позднюю дату на конце обрывков лент
                    // Если 2 ленты загружены с декабря по ноябрь, и одна с декабря по октябрь,
                    // то нет смысла включать в ленту октябрьские записи из 3-ей ленты, т.к. между ними могут
                    // находиться еще не загруженные записи первых двух лент
                    if (!obj.complete && time > minTime) {
                        minTime = time;
                    }
                });
                angular.forEach(types, function (obj) {
                    // Если все отображаемые ленты загружены - берем все записи
                    if ($scope.feedEnd) {
                        $.merge($scope.feed, obj.feed);
                    }
                    // Иначе - только на тот период, на уже который погружены все ленты
                    else {
                        angular.forEach(obj.feed, function (item) {
                            var time = new Date(item.date);
                            if (time >= minTime) {
                                $scope.feed.push(item);
                            }
                        });
                    }
                });
                $scope.feed.sort(function (a, b) {
                    return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0);
                });
            };

            $scope.initializeFilterData();
            $scope.updateFeed();

            $scope.$watch('showFavorites', $scope.updateFeed);
            $scope.$watch('showRequests', $scope.updateFeed);
            $scope.$watch('showSearchHistory', $scope.updateFeed);

            $scope.loadFeed = function () {
                if ($scope.feedLoading) {
                    return;
                }
                $scope.feedLoading = true;
                var query = [];
                angular.forEach($scope.feeds, function(value, name) {
                    query.push(name + 'Time=' + (value.complete ? 'false' : value.time));
                });
                var countryIdx = $location.search()['co'];
                if (typeof countryIdx != "undefined") {
                    query.push('co=' + countryIdx);
                }
                var delIdx = $location.search()['del'];
                if (typeof delIdx != "undefined") {
                    query.push('del=' + delIdx);
                }
                $http.get('/my_tourbook/load_feed?' + query.join('&')).then(
                    function (response) {
                        if (response.data.status == 'ok') {
                            $scope.updateList(response.data);
                            $scope.updateFeed();
                        } else {
                            alert('Произошла ошибка');
                        }
                        $scope.feedLoading = false;
                    },
                    function () {
                        $scope.feedLoading = false;
                        alert('Произошла ошибка');
                    }
                );
            };

            $interval(function(){ $scope.updateTopBlock(); }, 300000, true);

            $scope.updateTopBlock = function() {
                for (var i = 0; i < $scope.feed.length; i++) {
                    if ($scope.feed[i]['type'] == 'hotel' || $scope.feed[i]['type'] == 'country') {
                        $scope.itemToUpdate = $scope.feed[i];
                        $scope.$parent.updateTopBlockItems($scope.itemToUpdate);
                        break;
                    }
                }
            };

            $scope.updateTopBlock();
        }
    ]);


function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}
