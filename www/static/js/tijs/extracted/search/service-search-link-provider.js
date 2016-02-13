angular.module('search').service('searchLinkProvider', ['$rootScope', function($rootScope) {
    var searchLinkProvider = function SearchLinkProvider() {};

    searchLinkProvider.prototype.getAlternativeDateParams = function(deltaDate) {
        var searchParams = jQuery.extend(true, {}, $rootScope.searchParams);
        var startDate = searchParams.df;
        var dateArray = startDate.split('-');
        var date = new Date(dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0]);
        date = new Date(date.setDate(date.getDate() + deltaDate));
        if (date < new Date()) {
            return false;
        }
        searchParams.setValue('df', formatDate(date));
        searchParams.setValue('dt', formatDate(date));
        return searchParams;
    };

    searchLinkProvider.prototype.getAlternativeDateLink = function(deltaDate) {
        var params = searchLinkProvider.prototype.getAlternativeDateParams(deltaDate);
        if (!params) {
            return false;
        }
        return params.getCurrentLink();
    };

    searchLinkProvider.prototype.getAlternativeDurationParams = function(deltaDate) {
        var searchParams = jQuery.extend(true, {}, $rootScope.searchParams);
        var duration = searchParams.nf + deltaDate;
        if (duration < 1 || duration > 30) {
            return false;
        }
        searchParams.setValue('nf', duration);
        return searchParams;
    };

    searchLinkProvider.prototype.getAlternativeDurationLink = function(deltaDate) {
        var params = searchLinkProvider.prototype.getAlternativeDurationParams(deltaDate);
        if (!params) {
            return false;
        }
        return params.getCurrentLink();
    };

    searchLinkProvider.prototype.getWithOutHotelParams = function() {
        var searchParams = jQuery.extend(true, {}, $rootScope.searchParams);
        if (!searchParams.al.length) {
            return false;
        }
        searchParams.setValue('al', []);
        return searchParams;
    };

    searchLinkProvider.prototype.getWithOutHotelLink = function() {
        var params = searchLinkProvider.prototype.getWithOutHotelParams();
        if (!params) {
            return false;
        }
        return params.getCurrentLink();
    };

    searchLinkProvider.prototype.getWithOutChildParams = function() {
        var searchParams = jQuery.extend(true, {}, $rootScope.searchParams);
        var roomSizes = {
            'one': 15,
            'two': 14,
            'three': 23,
            'four': 26,
            'five': 29,
            'six': 24,
            'seven': 30,
            'eight': 3,
            'nine': 4,

            'onePlusOne': 18,
            'twoPlusOne': 20,
            'threePlusOne': 27,
            'fourPlusOne': 32,
            'fivePlusOne': 53,
            'sixPlusOne': 55,

            'onePlusTwo': 19,
            'twoPlusTwo': 21,
            'threePlusTwo': 31,
            'fourPlusTwo': 33,
            'fivePlusTwo': 54,
            'sixPlusTwo': 56

        };
        var roomSize = parseInt(searchParams.rs);

        switch (roomSize) {
            case roomSizes['onePlusOne']:
                searchParams.rs = roomSizes['two'];
                break;
            case roomSizes['twoPlusOne']:
                searchParams.rs = roomSizes['three'];
                break;
            case roomSizes['threePlusOne']:
                searchParams.rs = roomSizes['four'];
                break;
            case roomSizes['fourPlusOne']:
                searchParams.rs = roomSizes['five'];
                break;
            case roomSizes['fivePlusOne']:
                searchParams.rs = roomSizes['six'];
                break;
            case roomSizes['sixPlusOne']:
                searchParams.rs = roomSizes['seven'];
                break;
            case roomSizes['onePlusTwo']:
                searchParams.rs = roomSizes['three'];
                break;
            case roomSizes['twoPlusTwo']:
                searchParams.rs = roomSizes['four'];
                break;
            case roomSizes['threePlusTwo']:
                searchParams.rs = roomSizes['five'];
                break;
            case roomSizes['fourPlusTwo']:
                searchParams.rs = roomSizes['six'];
                break;
            case roomSizes['fivePlusTwo']:
                searchParams.rs = roomSizes['seven'];
                break;
            case roomSizes['sixPlusTwo']:
                searchParams.rs = roomSizes['eight'];
                break;
            default:
                return false;
        }
        return searchParams;
    };

    searchLinkProvider.prototype.getWithOutChildLink = function() {
        var params = searchLinkProvider.prototype.getWithOutChildParams();
        if (!params) {
            return false;
        }
        return params.getCurrentLink();
    };

    function formatDate(date) {
        var dd = date.getDate();
        if ( dd < 10 ) {
            dd = '0' + dd;
        }
        var mm = date.getMonth() + 1;
        if ( mm < 10 ) {
            mm = '0' + mm;
        }
        var yy = date.getFullYear();
        return dd+'-'+mm+'-'+yy;
    }


    return searchLinkProvider;
}]);