/**
 * Created by dmitriy on 30.10.2015.
 */
angular.module('request')
    .controller('AdminRequestController', ['$scope', '$http', function($scope, $http) {

    $scope.nextContact = {};
    $scope.contactDone = {};
    $scope.pastContacts = [];
    $scope.plannedContact = null;

    $scope.durations = [5];
    var  step = 5,
        duration = $scope.durations[0] + step;
    while (duration <= 60) {
        $scope.durations.push(duration);
        duration += step;
    }

    $scope.init = function() {
        $scope.gatherServerVars();
        $scope.substage = ( $scope.originalSubstage ==  $scope.REQUEST_CONTACT_CALL_PLANNED || $scope.originalSubstage == $scope.REQUEST_CONTACT_EMAIL_PLANNED )
            ? $scope.REQUEST_CONTACT_PLANNED
            : $scope.originalSubstage;

        $scope.typesOfContact =
            [
                {
                    label: "Звонок",
                    value: $scope.REQUEST_CONTACT_CALL_PLANNED,
                    appearInDropdown: true
                },
                {
                    label: "Email",
                    value: $scope.REQUEST_CONTACT_EMAIL_PLANNED,
                    appearInDropdown: true
                },
                {
                    label: "Подбор тура",
                    value: $scope.REQUEST_CONTACT_ADD_COMMENT,
                    appearInDropdown: true
                }
            ];

        $scope.typesOfContact.some(function(type) {
            if (type.value === $scope.originalSubstage) {
                $scope.nextContact.type = type;
                return true;
            }
        });
        if (angular.element('#next_contact_date').length) {
            Calendar.setup({
                inputField : "next_contact_date", // ID of the input field
                ifFormat : "%d.%m.%Y", // the date format
                button : "next_contact_datepicker_trigger" // ID of the button
            });
        }
        $scope.getPlannedContact();
        $scope.getPastContacts();
    };

    $scope.gatherServerVars = function() {
        $scope.declareConst("REQUEST_CONTACT_PLANNED", window.requestContactPlanned);
        $scope.declareConst("REQUEST_CONTACT_CALL_PLANNED", window.requestCallPlanned);
        $scope.declareConst("REQUEST_CONTACT_EMAIL_PLANNED", window.requestEmailPlanned);
        $scope.declareConst("REQUEST_CONTACT_ADD_COMMENT", window.requestCommentAdded);
        $scope.originalSubstage = window.substage;
        $scope.requestId = window.requestId;
        delete window.requestContactPlanned;
        delete window.requestCallPlanned;
        delete window.requestEmailPlanned;
        delete window.substage;
        delete window.requestId;
    };

    $scope.declareConst = function(name, val) {
        Object.defineProperty($scope, name, {
            value: val,
            configurable: false,
            writable: false
        });
    };

        $scope.getActionLabel = function(action) {
            var knownAction = _.find($scope.typesOfContact, {value: parseInt(action) });
            return knownAction && knownAction.label;
        };

    $scope.getPlannedContact  = function() {
        /*
        var failMsg = 'Не удалось загрузить список запланированных контактов';
        $http.get('/admin/tourists/requests/get_planned_contact?id=' + $scope.requestId)
            .then(function(res) {
                var data = res.data;
                if (data.status == 'ok' && data.type) {
                    $scope.plannedContact = {
                        type: _.find($scope.typesOfContact, {'value': +data.type}),
                        time: data.time,
                        date: data.date
                    }
                } else if (data.status == 'error') {
                    console.log(failMsg);
                }
            }, function() {
                console.log(failMsg)
            });
        */
    };

    $scope.getPastContacts =  function() {
        var failMsg = 'Не удалось загрузить список совершенных контактов';
        $http.get('/admin/tourists/requests/get_past_contacts?id=' + $scope.requestId)
            .then(function(res) {
                var data = res.data;
                if (data.status == 'ok') {
                    $scope.pastContacts = data.list;

                } else if (data.status == 'error') {
                    console.log(failMsg);
                }
            }, function() {
                console.log(failMsg);
            });
    };

    $scope.init();

    $scope.nextContactFormPlanningShown = false;

    $scope.openFormPlanningNextContact = function() {
        $scope.nextContactFormPlanningShown = true;
    };

    $scope.startChangingNextContact = function() {
        $scope.openFormPlanningNextContact();
        $scope.nextContact = angular.copy($scope.plannedContact);
    };

    $scope.hideFormPlanningNextContact = function() {
        $scope.nextContactFormPlanningShown = false;
    };

    $scope.planNextContact = function() {
        if ($scope.sendingPlannedContact) {
            return;
        }
        //$scope.nextContact.date doesn't get updated when user picks the date from datepicker :(
        // so for now we are getting value the old (jquery-style) way...
        //TODO find angular-compatible datepicker
        var params =  {
            time: angular.element('#next_contact_time').val(),
            date: angular.element('#next_contact_date').val(),
            type: $scope.nextContact.type ? $scope.nextContact.type.value : '',
            requestId: $scope.requestId
        };
        var errors = [];
        function areDateTimeFieldsValid()  {
            if (!params.time) {
                errors.push('Укажите время контакта');
            } else if (!moment(params.time, 'h:mm').isValid()) {
                errors.push('Формат времени некорректный');
            }
            var today = moment();
            var msg;
            if (!params.date) {
                msg = 'Укажите дату';
            } else if (!moment(params.date, 'DD.MM.YYYY').isValid()) {
                msg = 'Формат даты некорректный';
            } else if (!moment(params.date + ' ' +  params.time, 'DD.MM.YYYY h:mm').isAfter(today)) {
                msg = 'Дата должна быть больше текущей';
            }
            if (msg) {
                errors.push(msg);
            }
            return !errors.length;
        }
        if (areDateTimeFieldsValid()) {
            $scope.sendingPlannedContact = true;
            $http.post('plan_next_contact_with_client', params)
                .then(function(res) {
                    var data = res.data;
                    if (data.status == 'ok') {
                        $scope.nextContact.time = '';
                        $scope.hideFormPlanningNextContact();
                        angular.element('#next_contact_date').val('');
                        $scope.getPastContacts();
                    } else if (data.status == 'error') {
                        var message = data.message || "Ошибка сохранения информации о контакте";
                        alert(message);
                    }
                }, function() {
                    alert('Сбой отправки данных о планируемом контакте');
                }).finally(function() {
                    $scope.sendingPlannedContact = false;
                });
        } else {
            alert(errors.join('; '));
        }
        return false;
    };

    $scope.contactDoneFormShown = false;

    $scope.showContactDoneForm = function(id, type) {
        $scope.contactDoneFormShown = true;
        $scope.contactDoneTypeBefore = $scope.contactDone.type;
        $scope.contactDone.id = id;
        $scope.contactDone.type_ = type;
        angular.element('#contact_done_type').val(type);
    };

    $scope.hideContactDoneForm = function () {
        $scope.contactDoneFormShown = false;
    };

    $scope.saveContactInfo = function() {
       var requestParams = {
            id: $scope.contactDone.id,
            details: $scope.contactDone.details,
            duration: $scope.contactDone.duration,
            type: $scope.contactDone.type ? $scope.contactDone.type.value : $scope.contactDone.type_,
            requestId: $scope.requestId
       };
       $http.post('/admin/tourists/requests/save_contact_info', requestParams)
            .then(function(res) {
                var data = res.data;
                if (data.status == 'ok') {
                    $scope.contactDone.details = '';
                    $scope.getPastContacts();
                    $scope.plannedContact = null;
                    $scope.hideContactDoneForm();
                    //$scope.substage = data.substage;
                } else if (data.status = 'error') {
                    var message = data.message || "Ошибка сохранения информации о контакте";
                    alert(message);
                }
            }, function() {
                alert('Сбой отправки данных о совершенном контакте');
            });
        return false;
    };

        $scope.$watch('substage', function(newVal, oldVal) {
            if (oldVal == $scope.REQUEST_CONTACT_PLANNED && oldVal != newVal &&  $scope.plannedContact !== null) {
                var proceedWithChanging = confirm('Для этой заявки есть запланированный контакт. ' +
                    'Если изменить доп. состояние, контакт будет удалён после сохранения изменений. Продолжить изменение?');
                $scope.substage = proceedWithChanging ? newVal : oldVal;
            }
        });

}]);
