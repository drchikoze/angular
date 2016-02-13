var request = angular.module('request', ['ngSanitize']);
request.controller('requestEditCtrl', ['$scope', '$http', '$q', function ($scope, $http, $q) {

    $scope.init = function() {
        $scope.request = window.requestParams;
        $scope.request.agreement = parseInt(window.requestParams.agreement);
        $scope.request.ourTourist = window.requestParams.ourTourist;
        $scope.client = window.client;
        $scope.requestDescription = window.requestDescription;
        $scope.request.city *= 1;
        $scope.request.country *= 1;
        $scope.request.duration *= 1;
        $scope.roomTypes = [];
        $scope.childAgesSelects = 0;
        $scope.yearsChildMax = 18;
        $scope.years = [];
        for (var i = 0; i < $scope.yearsChildMax; i++) {
            $scope.years[i] = i;
        }
        $scope.roomSizes = [];
        $scope.childAges = {
            first: null,
            second: null,
            third: null
        };
        if ($scope.request.ch1Age !== null) {
            $scope.childAges.first = $scope.request.ch1Age;
            $scope.childAgesSelects++;
        }
        if ($scope.request.ch2Age !== null) {
            $scope.childAges.second = $scope.request.ch2Age;
            $scope.childAgesSelects++;
        }
        $scope.updateOptions();
    };

    $scope.checkRoomSize = function () {
        $scope.roomSizes.some(function(elem) {
            if (elem.id === $scope.request.roomSize) {
                $scope.childAgesSelects = elem.children;
                return true;
            }
        });
    };
    $scope.loadChildrenCountForRoomSizes = function() {
        $http.get('/admin/tourists/requests/load_children_count', {})
            .then(function(res) {
                var data = res.data;
                if (data.status == 'ok') {
                    $scope.roomSizes = data.map;
                    $scope.checkRoomSize();
                } else {
                    console.error('Не удалось загрузить количество детей для roomSize');
                }
            }, function() {
                console.error('Не удалось загрузить количество детей для roomSize');
            });
    };



    $scope.loadRoomTypesForAllocation = function () {
        var allocationId = $scope.request.allocation;
        if (!allocationId) {
            return;
        }
        $scope.showRoomTypesLoader = true;
        $http.get('/admin/tourists/requests/load_room_types?allocation=' + allocationId)
            .then(function (res) {
                res = res.data;
                if (res.status == 'ok' && res.rows.length > 0) {
                    $scope.roomTypes = res.rows;
                    return $q.when({data: {isDummy: true}});
                } else if (res.rows.length === 0 && $scope.request.roomType) {
                    return $http.get('/admin/tourists/requests/get_room_type?id=' + $scope.request.roomType)
                } else if (res.status == 'error') {
                    throw 'Ошибка при попытке подгрузить типы номеров для отеля: ' + res.message;
                } else {
                    throw 'Ошибка при попытке подгрузить типы номеров для отеля';
                }
            }, function () {
                throw 'Ошибка при попытке подгрузить типы номеров для отеля'
            })
            .then(function (res) {
                res = res.data;
                if (res.status == 'ok') {
                    var roomType = {
                        room_type: res.roomType.id,
                        description: res.roomType.description
                    };
                    $scope.roomTypes.push(roomType);
                } else if (res.isDummy) {
                    ;
                } else if (res.status == 'error') {
                    throw 'Ошибка при попытке получить описание типа номера: ' + res.message;
                } else {
                    throw 'Ошибка при попытке получить описание типа номера';
                }
            }, function () {
                throw 'Ошибка при попытке получить описание типа номера';
            })
            .catch(function (err) {
                alert(err);
            })
            .finally(function () {
                $scope.showRoomTypesLoader = false;
            });
    };

    $scope.loadTourParams = function() {
        $scope.showLoader = true;
        var $oldTourId = decodeURIComponent($scope.request.tourId);
        if (!/^\d+@\d+$/.test($oldTourId)) {
            alert('Неверный формат id тура');
            $scope.showLoader = false;
            return;
        }
        $http.post('/admin/tourists/requests/get_tour_params?id=' + $oldTourId).success(function(data) {
            if (typeof data == 'string' || data instanceof String) {
                if (data.indexOf("        ") != -1) {
                    data = JSON.parse(data.substr(0, data.indexOf("        ")));
                } else {
                    data = JSON.parse(data);
                }
            }
            if(data.status = 'ok') {
                $scope.request = data.params;
                $scope.request.tourId = $oldTourId;
                $scope.request.city *= 1;
                $scope.request.country *= 1;
                $scope.request.duration *= 1;
                $scope.request.allocation += '';
                $scope.request.operator += '';
                $scope.request.resort += '';
                $scope.request.roomSize += '';
                $scope.request.roomType += '';
                $scope.request.meal += '';
                $scope.updateOptions();

            }
            $scope.showLoader = false;
        });
    };

    $scope.saveRequestForm = function() {
        if ($scope.childAgesSelects > 0 && ($scope.childAges.first !== null && typeof $scope.childAges.first !== 'undefined')) {
            $scope.request.ch1Age = $scope.childAges.first;
        } else if ($scope.childAgesSelects > 0 && ($scope.childAges.first === null || typeof $scope.childAges.first === 'undefined')) {
            return alert('Укажите возраст ребенка');
        }
        if ($scope.childAgesSelects > 1 && ($scope.childAges.second !== null && typeof $scope.childAges.second !== 'undefined')) {
            $scope.request.ch2Age = $scope.childAges.second;
        } else if ($scope.childAgesSelects > 1 && ($scope.childAges.second === null || typeof $scope.childAges.second === 'undefined')) {
            return alert('Укажите возраст второго ребенка');
        }

        if ($scope.childAgesSelects < 2) {
            $scope.request.ch2Age = -1;
            $scope.request.ch2Till = 0;
        }
        if ($scope.childAgesSelects < 1) {
            $scope.request.ch1Age = -1;
            $scope.request.ch1Till = 0;
        }
        $.post('/admin/tourists/requests/edit_tour?id=' + window.requestId, {request: $scope.request, client:$scope.client, description: $scope.requestDescription})
            .success(function (res) {
                if (res === 'ok') {
                    window.location.href = '/admin/tourists/requests/edit?id=' + window.requestId;
                    return;
                }
                var data = JSON.parse(res);
                if (data.status == 'error') {
                    alert(data.message);
                } else {
                    window.location.href = '/admin/tourists/requests/edit?id=' + window.requestId;
                }
            })
            .error(function() {
                alert('Ошибка отправки данных');
            })
        ;
    };

    $scope.loadAllOperators = function() {
        $http.get('/admin/tourists/requests/get_all_operators').success(function(data) {
            if (data.status == 'ok') {
                $scope.selectData.operator = data.operators;
            }

            if (data.status == 'error') {
                alert(data.message);
            }
        });

    }

    $scope.updateOptions = function () {
        $http.post('/filters?co=' +
        $scope.request.country +
        '&ct=' + $scope.request.city +
        '&re=' + $scope.request.resort +
        '&rs=' + $scope.request.roomSize +
        '&df=' + $scope.request.df +
        '&dt=' + $scope.request.df +
        '&nf=' + $scope.request.duration +
        '&rt=' + $scope.request.roomType +
        '&op=&' + Math.random() +
        '&__setid=filters_index&_senderFilter=init').success(function (data) {
            if (typeof data == 'string' || data instanceof String) {
                if (data.indexOf("        ") != -1) {
                    data = JSON.parse(data.substr(0, data.indexOf("        ")));
                } else {
                    data = JSON.parse(data);
                }
            }
            $scope.selectData = data.data;
            if ($scope.selectData.operator != undefined) {
                $scope.selectData.operator = [];
            }
            $scope.loadAllOperators();

            $scope.selectData.operator.push({id:'9999', name:'Тестовый оператор'});
            $scope.selectData.agency = window.agencyList;
            $scope.selectData.managers = window.managerList;
        });

        $scope.loadRoomTypesForAllocation();
        if ($scope.roomSizes.length === 0) {
            $scope.loadChildrenCountForRoomSizes();
        } else {
            $scope.checkRoomSize();
        }
    };

    $scope.submitForm = function(type) {
        $scope.request.submitType = type;
        $scope.saveRequestForm();

    }

}]);

(function($){
    $(document).ready(function(){
        var filterStage = $('#field_stage');

        if(filterStage.val() != -1) {
            $('#field_decline_substage').parent().css( "display", "none" );
        }
        filterStage.change(function() {
            if (filterStage.val() == -1) {
                $('#field_decline_substage').parent().css( "display", "block" );
            } else {
                $('#field_decline_substage').parent().css( "display", "none" );
            }

        });
        /*
         Я потратил около часа пытаясь понять, почему селект не рендерится изначально с заданным option
          хотя модель установлена (это видно если вывести её в шаблоне как {{ }}, однако селект указывает на пустой option
         Так и не понял. Поэтому такой костыль:
         */
        if (window.requestParams && window.requestParams.ch1Age !== null) {
            $('#child_age_1 option').removeAttr('selected');
            $('#child_age_1').find('option[value=' + window.requestParams.ch1Age + ']').attr('selected', 'selected');
        }
        if (window.requestParams && window.requestParams.ch2Age !== null) {
            $('#child_age_2 option').removeAttr('selected');
            $('#child_age_2').find('option[value=' + window.requestParams.ch2Age + ']').attr('selected', 'selected');
        }
    });
})(jQuery);