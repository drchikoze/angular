angular.module('filters').controller('redirect', ['$scope', '$location', function($scope, $location) {

    $scope.buildQs = function(replaceParams) {
        var query_data = $location.search();
        var query_arr = [];

        for (var idx in query_data) {
            // замещаем параметры в запросе на пришедшие от пользователя
            if (replaceParams !== null && typeof replaceParams == 'object' && replaceParams[idx] != undefined) {
                query_arr.push(idx + '=' + replaceParams[idx]);
                delete replaceParams[idx];
                continue;
            }
            query_arr.push(idx + '=' + query_data[idx])
        }

        // добавляем пришедшие параметры в строку запроса
        if (replaceParams !== null && typeof replaceParams == 'object') {
            for (var idx in replaceParams) {
                query_arr.push(idx + '=' + replaceParams[idx]);
            }
        }        
        
        return '?' + query_arr.join('&')
    };

    $scope.go = function(prefix, isNewWindow, hash, replaceParams) {

        var location = prefix + (hash === false ? '' : '#') + $scope.buildQs(replaceParams);
        
        if (isNewWindow === true) {
            top.window.open(location)
        } else {
            top.location.href = location
        }
    };
    
    $scope.goToOperator = function(op) {
        var url = '/operator/profile/tape/' + op + $scope.buildQs() 
                  + '&tt=' + $scope.getParam('ti_tp');
        top.window.open(url);
    };
    
    $scope.goToOldSearch = function() {
        var url = '/main/tours/offers?';
        url = $scope.makeLinkOld(url);
        top.location.href = url;
    };
    
    $scope.goToExtSearch = function() {
        var url = '/main/tours/extsearch/?';
        url = $scope.makeLinkOld(url);
        top.location.href = url;
    };
    
    $scope.makeLinkOld = function(path) {
            var qsArStr = '';
            var qsAr = window.location.href.split('#?');

            var params = qsAr[1].split(/&/);
            for (var i = 0; i< params.length; i++) {
                var pair_param_addition = '';
                var pair_param = params[i].split(/=/);

                if (pair_param[0] == 'rcl' || pair_param[0] == 'online' || pair_param[0] == 'ls' || pair_param[0] == 'rt' || pair_param[0] == 'status' || pair_param[0] == 'st' || pair_param[0] == 'stype') continue;

                //mapping
                switch (pair_param[0]) {
                    case 'alr':
                        switch (pair_param[1]) {
                            case '3':
                                pair_param[1] = '1';
                            break;
                            case '3.5':
                                pair_param[1] = '2';
                            break;
                            case '4':
                                pair_param[1] = '3';
                            break;
                            case '4.5':
                                pair_param[1] = '4';
                            break;
                            default:
                                pair_param[1] = '';
                        }
                    break;
                    case 'ti_tp':
                        switch (pair_param[1]) {
                            case '0':
                                pair_param[0] = 'ti_w';
                                pair_param[1] = '0';
                            break;
                            case '1':
                                pair_param[0] = 'ti_w';
                                pair_param[1] = '1';
                                pair_param_addition = 'tt=1&';
                                qsArStr = qsArStr.replace(/tt=(\d+)/, '');
                            break;
                            case '2':
                                pair_param[0] = 'ti_w';
                                pair_param[1] = '1';
                                pair_param_addition = 'tt=2&';
                                qsArStr = qsArStr.replace(/tt=(\d+)/, '');
                            break;
                            case '3':
                                pair_param[0] = 'ti_w';
                                pair_param[1] = '1';
                                pair_param_addition = 'tt=3&';
                                qsArStr = qsArStr.replace(/tt=(\d+)/, '');
                            break;
                            case '4':
                                pair_param[0] = 'ti_w';
                                pair_param[1] = '2';
                            break;
                        }
                    break;
                }

                if (pair_param_addition != '' && pair_param[0] == 'tt') continue;

                qsArStr = qsArStr + ( pair_param[0] != '' ? pair_param[0] + '=' + pair_param[1] + '&' + pair_param_addition : '' );

            }
            return typeof path == 'string' ? path + qsArStr : qsArStr;
        };
    
    $scope.getParam = function(param) {
        var params = $location.search();
        if (params[param] != undefined) {
            return params[param];
        }

        if (arguments.length > 1) {
            return arguments[1];
        } else {
            return null;
        }
    }
    
}]);