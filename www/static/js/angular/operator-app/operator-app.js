angular.module('operatorApp', [])
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
            var url = '/operator/reservations/upload_document';

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
            $http.get('/operator/reservations/delete_document', {params: {document_id: id}}).success(function(data) {
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
            $http.get('/operator/reservations/documents_list', {params: {tour_id: id}}).success(function(data) {
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
                user: $scope.user
            };
            $http({
                method: 'POST',
                url: '/operator/requests/save_request',
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
                url: '/operator/requests/save_comments',
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
                url: '/operator/requests/get_remote_links',
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
                url: '/operator/save_alternatives', params: {params: data}
            }).success(function(data){
                $scope.sending = false;
                if (data.status == 'ok') {
                    $scope.altList = [];
                    document.location.href = "/operator/view?id=" + $scope.tour.id;
                }

                if (data.status == 'error') {
                    alert(data.message);
                }
            });

        }
    }
);

