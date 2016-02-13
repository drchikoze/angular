angular.module('filters').service('filterParams', ['$location', 'dataSource', function($location, service) {
    //параметры пользователя, которые мы тягаем в куках
    this.savedUser = {
        ticket: {canSave : true},
        result_type: {canSave : true},
        country: {canSave : true, pages : ['/search/result', '/search/chooser', '/tours', '/', '/search/filter']},
        city: {canSave : true, pages : ['/search/result', '/search/chooser', '/tours', '/', '/search/filter']},
        params2: {canSave : true, pages : ['/search/result', '/search/chooser', '/search/filter']},
        is_subagent: {canSave : true},
        apply_blacklist: {canSave : true},
        currency: {canSave: true}
    };

    var GetURLParameter = function()
    {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        var params = {};
        for (var i = 0; i < sURLVariables.length; i++)
        {
            var sParameterName = sURLVariables[i].split('=');
            params[sParameterName[0]] = sParameterName[1]
        }
        return params
    };

    var locationPath = window.location.pathname;
    //проверяем наличие пользовательских значений фильтров в куках
    // только если в запросе не пришел параметр
    this.setParamsFromCookies = function(params) {
        for (var idx in this.savedUser) {
            try {
                if (!params.hasOwnProperty(service.getNickByName(idx))
                    && $.cookie(service.getNickByName(idx))
                    && this.canSavedUser(idx, locationPath)) {
                    params[service.getNickByName(idx)] = $.cookie(service.getNickByName(idx))
                }
            } catch (e) {
                // exception if param are not exists (for external datasouce)
            }
        }
        return params;
    };
    this.init = function() {
        var data = this.setParamsFromCookies($rootScope.searchParams);
        return jQuery.extend(data, GetURLParameter())
    };

    this.set = function(diff) {
        if (this.canSavedUser(diff, locationPath)) {
            try {
                var diffNick = service.getNickByName(diff);
                var diffValue = $rootScope.searchParams[diffNick];
                if (diffValue != undefined) { // если в строке запроса не удаляли параметр
                    $.cookie(diffNick, diffValue, {expires: 30, path : '/'});
                }
            } catch (e) {
                // exception of external datasource. If diff are not exist.
            }
        }
    };

    //проверка возможности сохранения пользовательского параметра в куках
    this.canSavedUser = function ($filter, page) {
        page = (typeof page == 'string') ? page : null;

        if (this.savedUser.hasOwnProperty($filter) && this.savedUser[$filter].canSave) {
            // нет свойства pages - считаем что для всех страниц
            if (this.savedUser[$filter].pages == undefined) {
                return true;
            }

            for(var i in this.savedUser[$filter].pages) {
                if (page === this.savedUser[$filter].pages[i]) {
                    return true;
                }
            }
        }
        return false;
    };

    return this
}]);