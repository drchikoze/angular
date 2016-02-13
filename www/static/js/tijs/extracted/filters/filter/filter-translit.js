angular.module('filters').filter('filterTranslit', function() {
    return function(items, value) {
        var translitMap = {
            'f' : 'а', ',' : 'б', 'd' : 'в', 'u' : 'г', 'l' : 'д',
            't' : 'е', '`' : 'ё', ';' : 'ж', 'p' : 'з', 'b' : 'и',
            'q' : 'й', 'r' : 'к', 'k' : 'л', 'v' : 'м', 'y' : 'н',
            'j' : 'о', 'g' : 'п', 'h' : 'р', 'c' : 'с', 'n' : 'т',
            'e' : 'у', 'a' : 'ф', '[' : 'х', 'w' : 'ц', 'x' : 'ч',
            'i' : 'ш', 'o' : 'щ', ']' : 'ъ', 's' : 'ы', 'm' : 'ь',
            "'" : 'э', '.' : 'ю', 'z' : 'я'
        };

        var translit = function(str, reverse) {

            var replacer = function(elem) {
                return translitMap[elem] || elem;
            };

            var replacerReverse = function(elem) {
                for (var i in translitMap) {
                    if (!translitMap.hasOwnProperty(i)) continue;
                    if (translitMap[i] == elem) {
                        return i;
                    }
                }
                return elem;
            };

            if (reverse === true) {
                return str.replace(/[а-я]/g, replacerReverse)
            } else {
                return str.replace(/[a-z.',`;\[\]']/g, replacer)
            }
        };
        var res = [];

        if (!value) {
            return items;
        }

        if (typeof items == 'object' && value) {
            for (var i in items) {
                if (items.hasOwnProperty(i) && typeof items[i] == 'object' && items[i].name) {
                    var lowerName = items[i].name.toLowerCase();
                    var inputLower = value.toLowerCase();
                    if (lowerName.indexOf(inputLower) >= 0) {
                        res.push(items[i]);
                    } else if (lowerName.indexOf(translit(inputLower)) >= 0) {
                        res.push(items[i]);
                    } else if (lowerName.indexOf(translit(inputLower, true)) >= 0){
                        res.push(items[i]);
                    }
                }
            }
        }
        return res;
    }
});