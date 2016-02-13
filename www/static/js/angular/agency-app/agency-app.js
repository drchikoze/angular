angular.module('agencyApp', [])
    .directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }])
    .controller('EditorController', function($scope, $http){
        $scope.tourInfo = window.tourInfo;
    })
    .controller('MainController', function($scope, $http){
        $scope.documents = window.tourInfo.documents;
        $scope.tourId = window.tourInfo.tourId;

        $scope.selectedFile = null;
        $scope.documentName = null;
        $scope.uploading = false;
        $scope.documentToDelete = null;

        $scope.selectFiles = function(files) {
            $scope.selectedFile = files[0];
        };

        $scope.removeFile = function() {
            $scope.selectedFile = null;
        };

        $scope.uploadDocument = function() {
            var file = $scope.selectedFile;
            var url = '/agency/reservations/upload_document';

            var data = new FormData();
            var id = $scope.tourId;

            data.append('file', file);
            data.append('tour_id', id);
            data.append('name', $scope.documentName);

            $scope.uploading = true;

            $http.post(url, data, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(function(data){
                $scope.uploading = false;
                if (data.status == 'error') {
                    alert(data.message);
                }

                if (data.status == 'ok') {
                    $scope.selectedFile = null;
                    if ($scope.documents.length == 0) {
                        $scope.documents = [data.document];
                    } else {
                        $scope.documents.push(data.document);
                    }
                }
            });
        };

        $scope.getDocumentIndexById = function(id) {
            for(var i = 0; i < $scope.documents.length; i++) {
                if ($scope.documents[i].id == id) {
                    return i;
                }
            }

            return -1;
        };

        $scope.deleteDocument = function(id) {
            var index = $scope.getDocumentIndexById(id);
            if (index < 0) {
                return;
            }
            $('#deleteDialog').modal('hide');
            $scope.documents[index].deleteProgress = true;
            $http.get('/agency/reservations/delete_document', {params: {document_id: id}}).success(function(data) {
                if (data.status == 'ok') {
                    $scope.documents.splice(index, 1);
                }

                if (data.status == 'error') {
                    alert(data.message);
                }
            });
        };

        $scope.showDeleteDialog = function(id) {
            var index = $scope.getDocumentIndexById(id);
            if (index < 0) {
                return;
            }
            $scope.documentToDelete = $scope.documents[index];
            $('#deleteDialog').modal('show');
        };

        $scope.loadDocumentList = function() {
            var id = $scope.tourId;
            $http.get('/agency/reservations/documents_list', {params: {tour_id: id}}).success(function(data) {
                if (data.status == 'ok') {
                    $scope.documents = data.documents;
                }
            });
        };
    }
    ).controller('RequestsController', function($scope, $http){
        $scope.request = window.jsData.request;
        $scope.stages = window.jsData.stages;
        $scope.client = window.jsData.client ? window.jsData.client : null;
        $scope.user = window.jsData.user_login ? window.jsData.user_login : '';
        $scope.dialog = {title: null, showReason: false, reason: null};
        $scope.currentCommentLine = null;
        $scope.lastCommentTime = null;
        $scope.operatorComments = $scope.request.operator_comments;
        $scope.commentUpdated = true;
        $scope.remoteLinks = null;
        $scope.remoteLinksLoading = false;


        $scope.saveRequest = function() {
            var paramsData = {
                id: $scope.request.id,
                stage: $scope.request.stage,
                decline_reason: $scope.request.decline_reason,
                contact_date: $scope.request.contact_date,
                booking_price: $scope.request.booking_price,
                operator_booking_price: $scope.request.operator_booking_price,
                operator_booking_date: $scope.request.operator_booking_date,
                user: $scope.user
            };
            $http({
                method: 'POST',
                url: '/agency/requests/save_request',
                params: {'params': JSON.stringify(paramsData)}
            }).success(function(data) {
                if (data.status == 'error') {
                    alert(data.message);
                    location.reload(true);
                    return;
                }

                if (!data.status) {
                    alert('Неверный ответ сервера');
                    location.reload(true);
                    return;
                }

                if (data.status == 'ok') {
                    if (data.client != undefined) {
                        $scope.client = data.client;
                        $scope.getRemoteLinks();
                        location.reload(true);
                    }
                }
            }).error(function() {
                alert('Данные сохранить не удалось');
                location.reload(true);
            });

        };

        $scope.checkDate = function () {
            var parts = $scope.dialog.contactDate.split('.');
            var date1 = new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);
            var date2 = new Date();
            date2.setHours(0);
            date2.setMinutes(0);
            date2.setSeconds(0);
            date2.setMilliseconds(0);
            $scope.dialog.contactDateValid = date1 >= date2;
        };

        $scope.checkPrice = function () {
            $scope.dialog.bookingPriceValid = /^[1-9][0-9]*$/.test($scope.dialog.bookingPrice);
        };

        $scope.checkOperatorPrice = function () {
            $scope.dialog.operatorBookingPriceValid = /^[1-9][0-9]*$/.test($scope.dialog.operatorBookingPrice);
        };

        $scope.checkReservationDate = function () {
            $scope.dialog.operatorBookingDateValid = /^[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}$/.test($scope.dialog.operatorBookingDate);
        };

        $scope.selectStage = function(stage) {
            $scope.dialog.title = "Перевести заявку в состояние '" + $scope.stages[stage] + "'?";
            $scope.dialog.showReason = stage < 0;
            $scope.dialog.showContactDate = stage == 3;
            $scope.dialog.showBookingPrice = stage == 2;
            $scope.dialog.callback = function() {
                $scope.request.stage = stage;
                if ($scope.dialog.showReason) {
                    $scope.request.decline_reason = $scope.dialog.reason;
                }
                if ($scope.dialog.showContactDate) {
                    $scope.request.contact_date = $scope.dialog.contactDate;
                }
                if ($scope.dialog.showBookingPrice) {
                    $scope.request.booking_price = $scope.dialog.bookingPrice;
                    $scope.request.operator_booking_price = $scope.dialog.operatorBookingPrice;
                    $scope.request.operator_booking_date = $scope.dialog.operatorBookingDate;
                }
                $scope.saveRequest();
                $('#dialog').modal('hide');
            };
            $('#dialog').modal('show');
        };

        $scope.saveOperatorComments = function() {
            if (!$scope.operatorComments && !$scope.currentCommentLine) {
                return;
            }

            var comments = '';
            if ($scope.currentCommentLine) {
                comments = $scope.lastCommentTime + "\n" + $scope.currentCommentLine + ($scope.operatorComments ? "\n\n" + $scope.operatorComments : '');
            }

            var paramsData = {
                id: $scope.request.id,
                operator_comments: comments,
                user: $scope.user,
                last_comment: $scope.lastComment
            };

            $scope.commentUpdated = false;
            $http({
                method: 'POST',
                url: '/agency/requests/save_comments',
                data: 'params=' + angular.toJson(paramsData),
                headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
            }).success(function(data) {
                if (!data.status) {
                    alert('Неверный ответ сервера');
                    return;
                }
                if (data.status == 'error') {
                    alert(data.message);
                    return;
                }

                if (data.status == 'ok') {
                    $scope.request.operator_comments = comments;
                }
                $scope.commentUpdated = true;

            }).error(function() {
                alert('Ошибка сохранения данных');
                $scope.commentUpdated = true;
            });
        };

        $scope.addCommentLine = function() {
            if ($scope.commentLine == undefined) {
                return;
            }

            var comment = $scope.commentLine.trim();
            if (!comment) {
                return;
            }

            var commentTime = moment().format("DD.MM.YYYY HH:mm");

            if (!$scope.lastCommentTime) {
                $scope.currentCommentLine = ($scope.currentCommentLine ? $scope.currentCommentLine + '\n' : '') + comment;
                $scope.lastCommentTime = commentTime;

            } else if($scope.lastCommentTime == commentTime) {
                $scope.currentCommentLine = $scope.currentCommentLine + "\n" + comment;
            } else {
                $scope.operatorComments = $scope.lastCommentTime + "\n" + $scope.currentCommentLine + ($scope.operatorComments ? "\n\n" + $scope.operatorComments : '');
                $scope.lastCommentTime = commentTime;
                $scope.currentCommentLine = comment;
            }
            $scope.lastComment = $scope.commentLine;
            $scope.commentLine = '';
            $scope.saveOperatorComments();
        };

        $scope.getRemoteLinks = function() {
            $scope.remoteLinksLoading = true;
            var paramsData = {
                tour_id: $scope.request.tour_id
            };

            $http({
                method: 'POST',
                url: '/agency/requests/get_remote_links',
                params: {'params': paramsData}
            }).success(function(data) {
                if (data.status == 'ok') {
                    $scope.remoteLinks = data.links;
                }
                $scope.remoteLinksLoading = false;
            }).error(function() {
                $scope.remoteLinksLoading = false;
            });
        };

        if ($scope.client) {
            $scope.getRemoteLinks();
        }


    }).controller('AltController', function($scope, $http){
        $scope.tour = window.jsData.tour;
        $scope.allocations = window.jsData.allocations;
        $scope.meals = window.jsData.meals;
        $scope.alternatives = window.jsData.alternatives;
        $scope.selected = {
            allocation: null,
            meal: null,
            room: null,
            price: null,
            comment: null
        };
        $scope.sending = false;
        $scope.altList = [];
        $scope.getIndexById = function(collection, id) {
            for(var i = 0; i < collection.length; i++) {
                if (collection[i].id == id) {
                    return i;
                }
            }

            return -1;
        };

        $scope.selected.allocation = $scope.allocations[$scope.getIndexById($scope.allocations, $scope.tour.allocationId)];
        $scope.selected.meal = $scope.meals[$scope.getIndexById($scope.meals, $scope.tour.mealId)];
        $scope.selected.room = $scope.tour.room;
        $scope.selected.price = $scope.tour.price;


        $scope.addAltItem = function() {
            var sel = $scope.selected;
            $scope.altList.push({
                allocationId: sel.allocation.id,
                mealId: sel.meal.id,
                allocation: {id: sel.allocation.id, name: sel.allocation.name},
                meal: {id: sel.meal.id, name: sel.meal.name},
                room: sel.room,
                price: sel.price,
                comment: sel.comment
            });
        };

        $scope.deleteAlt = function(index) {
            $scope.altList.splice(index, 1);
        };

        $scope.saveAltList = function() {
            var data = {
                tour_id: $scope.tour.id,
                alternatives: $scope.altList
            };

            $scope.sending = true;

            $http({
                method: 'POST',
                url: '/agency/save_alternatives', params: {params: data}
            }).success(function(data){
                $scope.sending = false;
                if (data.status == 'ok') {
                    $scope.altList = [];
                    document.location.href = "/agency/view?id=" + $scope.tour.id;
                }

                if (data.status == 'error') {
                    alert(data.message);
                }
            });

        }
    }
).controller('requestEditCtrl', ['$scope', '$http', '$q', function ($scope, $http, $q) {

    $scope.init = function() {
        $scope.request = window.requestParams;
        $scope.request.agreement = parseInt(window.requestParams.agreement);
        $scope.client = window.client;
        $scope.requestDescription = window.requestDescription;
        console.log($scope.requestDescription);
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
        $http.get('/agency/requests/load_room_types?allocation=' + allocationId)
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

    $scope.saveRequestForm = function() {
        $scope.saving = true;
        if ($scope.childAgesSelects > 0 && ($scope.childAges.first !== null && typeof $scope.childAges.first !== 'undefined')) {
            $scope.request.ch1Age = $scope.childAges.first;
        } else if ($scope.childAgesSelects > 0 && ($scope.childAges.first === null || typeof $scope.childAges.first === 'undefined')) {
            $scope.saving = false;
            return alert('Укажите возраст ребенка');
        }
        if ($scope.childAgesSelects > 1 && ($scope.childAges.second !== null && typeof $scope.childAges.second !== 'undefined')) {
            $scope.request.ch2Age = $scope.childAges.second;
        } else if ($scope.childAgesSelects > 1 && ($scope.childAges.second === null || typeof $scope.childAges.second === 'undefined')) {
            $scope.saving = false;
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
        $.post('/agency/requests/edit_tour?id=' + window.requestId, {request: $scope.request, client:$scope.client, description: $scope.requestDescription})
            .success(function (res) {
                $scope.saving = false;
                try {
                    var data = JSON.parse(res);
                } catch (e) {
                    alert('Не удалось сохранить изменения');
                }
                if (data.status == 'ok') {
                    window.location.href = '/agency/requests/edit?id=' + window.requestId;
                } else if (data.status == 'error') {
                    alert(data.message);
                } else {
                    alert('Не удалось сохранить изменения');
                }
            })
            .error(function() {
                $scope.saving = false;
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
            $scope.selectData = data.data;
            if ($scope.selectData.operator != undefined) {
                $scope.selectData.operator = [];
            }
            $scope.loadAllOperators();

            $scope.selectData.operator.push({id:'9999', name:'Тестовый оператор'});
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
