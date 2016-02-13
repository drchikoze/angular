/**
 * Фильтр по отелю по категории отеля
 */
angular.module('filters').filter('filterAlocCat', function() {
    return function(items, value) {
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        if (typeof(value) != 'undefined' && Object.size(value) > 0) {
            var res = [];

            for (var i in items) {
                if (typeof(value[items[i]['alloccat']]) != 'undefined') {
                    res.push(items[i]);
                }
            }

            return res;
        }

        return items;
    }
});